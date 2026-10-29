/*
 * cobro.js — el Solo siempre esperando tarjeta, sin cobros duplicados ni pagos perdidos.
 *
 * DECISIONES 25-10-2026: la máquina no tiene botón. Mientras está en espera, la Pi deja abierto un cobro en el
 * Solo por la Cloud API; cuando caduca sin pago abre otro. En cuanto uno sale "successful", empieza la prueba.
 *
 * Diario de cobros (almacen.anotarCobro), auditoría 1.0 §3.2/§8.3, H05 y 6-A A6A-10:
 *   abriendo → abierto → pagado → en_prueba → consumido
 *                      ↘ cancelado / caducado / fallido
 *   incierto: no se sabe si el cobro existe o si se pagó (respuesta perdida, SumUp no lo cierra…). Nunca se da
 *             por perdido mientras se pueda pagar: se consulta y se busca el pago por nuestra referencia
 *             (foreign_transaction_id) hasta saberlo; si en 3 días no se sabe, queda "sin_resolver" (a mano).
 *   a_reembolsar → reembolsado / reembolso_imposible / reembolso_manual
 *
 * Reglas que hacen que nadie pague sin prueba ni haga una prueba sin pagar (revisión independiente 26-10):
 * - Un cobro "pending" nunca se cierra como caducado: se cancela en el lector (terminate) y se sigue vigilando,
 *   porque la persona puede estar metiendo el PIN. Solo SumUp lo cierra (successful / failed / cancelled).
 * - Un cobro solo se da por no pagado si SumUp lo dice o si ya no se puede pagar (más viejo que vida_cobro_ms)
 *   y la búsqueda del pago no lo encuentra.
 * - Con el bucle en marcha, el lector enseña NUESTRO cobro actual: la resolución de fondo no manda terminate
 *   (cancelaría el cobro de la persona que está delante).
 * - Un pago sin prueba recibe como mucho credito_max_veces pruebas pendientes, dentro de credito_max_ms desde
 *   que se pagó (t_pago no cambia nunca); después se reembolsa. Un arranque en bucle no da pruebas infinitas.
 * - Si la partida de un cobro existe, la persona vio su resultado: ni crédito ni reembolso.
 * - Lo que lleva la máquina (enManos) o el bucle no lo toca nadie más; las edades de lo creado en este arranque
 *   se miden con el reloj monotónico (un salto de la hora por NTP no cambia nada).
 * - Reembolsos: los fallos de red o de SumUp (5xx) no cuentan como intento; un 409 de "ya reembolsado" se
 *   comprueba y se da por hecho. Reintentos con espera creciente (máx. 1 h).
 *
 * CobroGratis: mismo comportamiento sin SumUp (banco de pruebas, opción --gratis).
 */
(function (raiz, fabrica) {
  "use strict";
  const enNode = typeof module === "object" && module.exports;
  const dep = (n) => (enNode ? require("./" + n) : raiz.ALC[n]);
  const m = fabrica(dep("util"), dep("reloj"), dep("sumup"));
  if (enNode) module.exports = m;
  else (raiz.ALC = raiz.ALC || {}).cobro = m;
})(typeof globalThis !== "undefined" ? globalThis : this, function (U, RJ, S) {
  "use strict";
  const { ErrorCancelado } = RJ;

  const MIN = 60000;
  const POR_DEFECTO = {
    precio_centimos: 200,
    moneda: "EUR",
    descripcion: "Alcoholimetro",
    consulta_ms: 3000, // SumUp no publica límite; la ficha propone 3–5 s (DECISIONES: probar 3 s con el Solo real)
    vida_max_ms: 90000, // un cobro "pending" más tiempo que esto se cancela en el lector (y se sigue vigilando)
    cierre_max_ms: 3 * MIN, // tras cancelarlo, cuánto se vigila antes de pasarlo a la resolución de fondo
    vida_cobro_ms: 5 * MIN, // un cobro más viejo que esto ya no se puede pagar (SumUp los caduca en ~1 min)
    pausa_rechazo_ms: 4000,
    reembolso_automatico: true,
    // tras un apagón, un pago sin prueba se respeta 5 min desde que se pagó (cabe un corte a mitad de prueba y el
    // arranque de la Pi). Más tarde es probable que quien pagó ya no esté: mejor devolverle el dinero que dar su
    // prueba al siguiente que pase (fuzz de la segunda revisión, 26-10)…
    credito_max_ms: 5 * MIN,
    credito_max_veces: 2, // … y como mucho 2 veces; después se reembolsa
    revisar_cada_ms: 5 * MIN,
    reintento_max_ms: 60 * MIN,
    reembolso_max_intentos: 8, // solo cuentan los rechazos de SumUp, no los fallos de red
    sin_resolver_ms: 3 * 24 * 60 * MIN,
    max_inciertos: 5, // con tantos cobros de este arranque sin saber si existen, no se abren más hasta aclararlos
    sin_transaccion_temporal_ms: 24 * 60 * MIN, // "no encuentro la transacción" no cuenta como intento el primer día
  };

  const FINALES = new Set(["consumido", "cancelado", "fallido", "caducado", "reembolsado", "anulado", "reembolso_imposible", "reembolso_manual", "sin_resolver"]);
  const RE_CADUCADO = /expir|time.?out|caduc/i;
  /** Fallo pasajero (red, SumUp caído o saturado): no cuenta como intento ni alarga la espera. */
  const esTemporal = (e) => !!e && (e.red || e.http === 0 || e.http >= 500 || e.http === 429);

  class CobroContinuo {
    /**
     * @param {object} o { cliente (ClienteSumUp), almacen, reloj, registro, config, puedeCobrar: async () => {ok, motivo} }
     */
    constructor(o) {
      this.cliente = o.cliente;
      this.almacen = o.almacen;
      this.reloj = o.reloj;
      this.log = o.registro || { depurar() {}, info() {}, aviso() {}, error() {} };
      this.c = Object.assign({}, POR_DEFECTO, o.config || {});
      this.puedeCobrar = o.puedeCobrar || (async () => ({ ok: true }));
      this.em = U.crearEmisor((ev, e) => this.log.error(`oyente de ${ev}: ${e.message}`));
      this.fase = { fase: "parado" };
      this.grupo = null;
      this.bucle = null;
      this.abierto = null; // cobro que vigila el bucle
      this.refBucle = null; // referencia que está usando el bucle (desde antes de crear el cobro)
      this.terminando = null; // terminate en curso al parar el bucle
      this.terminandoFondo = null; // terminate en curso de la resolución de fondo (el bucle espera a que salga)
      this.fallosRed = 0;
      this.erroresConsulta = 0;
      this.resolviendo = new Set(); // refs en resolución (una sola a la vez por referencia)
      this.enManos = new Set(); // refs entregadas a la máquina como "pagado" y que aún no ha terminado
      this.creadoMono = new Map(); // ref → mono al crearla (solo las de este arranque)
      this.pagoMono = new Map(); // ref → mono al pagarse (solo las de este arranque)
      this.reintento = new Map(); // ref → { n, proximo } espera creciente entre reintentos
      this.revision = null;
      this.revisando = false;
      this.destruido = false;
    }

    on(ev, fn) {
      return this.em.on(ev, fn);
    }

    get gratis() {
      return false;
    }

    _fase(fase, extra) {
      const f = Object.assign({ fase }, extra || {});
      if (f.fase === this.fase.fase && f.motivo === this.fase.motivo) return;
      this.fase = f;
      this.em.emit("estado", f);
    }

    async _anotar(ref, cambios) {
      try {
        return await this.almacen.anotarCobro(ref, cambios);
      } catch (e) {
        this.log.error(`diario de cobros: no se pudo apuntar ${ref} → ${cambios.estado || Object.keys(cambios).join(",")}: ${e.message}`);
        throw e;
      }
    }

    // ---------------------------------------------------------------- edades y control de quién lleva qué
    static _limitarMapa(m, max) {
      while (m.size > max) m.delete(m.keys().next().value);
    }

    /** ms desde que se creó el cobro (monotónico si es de este arranque; si no, por la hora de pared). */
    _edad(c) {
      if (this.creadoMono.has(c.ref)) return this.reloj.mono() - this.creadoMono.get(c.ref);
      const t0 = U.instanteDeId(c.ref) || c.t || 0;
      return Math.max(0, this.reloj.ahora() - t0);
    }

    /** ms desde que se pagó (t_pago se apunta una vez y no cambia). */
    _edadPago(c) {
      if (this.pagoMono.has(c.ref)) return this.reloj.mono() - this.pagoMono.get(c.ref);
      return Math.max(0, this.reloj.ahora() - (c.t_pago || c.t || 0));
    }

    _ocupado(ref) {
      return this.resolviendo.has(ref) || this.enManos.has(ref) || this.refBucle === ref || !!(this.abierto && this.abierto.ref === ref);
    }

    _toca(ref) {
      const r = this.reintento.get(ref);
      return !r || this.reloj.mono() >= r.proximo;
    }

    /**
     * Cuándo volver a intentarlo. Los fallos pasajeros (red, 5xx) se reintentan en la siguiente revisión sin
     * alargar la espera: al volver la red, todo se resuelve enseguida. Los demás, cada vez más tarde (máx. 1 h).
     */
    _programarReintento(ref, e) {
      const r = this.reintento.get(ref) || { n: 0 };
      if (!esTemporal(e)) r.n++;
      const espera = r.n ? Math.min(this.c.reintento_max_ms, this.c.revisar_cada_ms * 2 ** Math.min(10, r.n - 1)) : this.c.revisar_cada_ms;
      r.proximo = this.reloj.mono() + espera - 1000;
      this.reintento.delete(ref);
      this.reintento.set(ref, r);
      CobroContinuo._limitarMapa(this.reintento, 3000);
    }

    /**
     * terminate desde la resolución de fondo: solo si el bucle no está en marcha (si lo está, el lector enseña
     * nuestro cobro actual). Se comprueba justo antes de mandarlo, y el bucle espera a que salga antes de crear
     * un cobro nuevo: así nunca cancela el cobro de la persona que está delante.
     */
    async _terminarFondo() {
      if (this.bucle || this.refBucle || this.destruido) return false;
      const t = this.cliente.terminar();
      this.terminandoFondo = t;
      try {
        await t;
      } finally {
        if (this.terminandoFondo === t) this.terminandoFondo = null;
      }
      return true;
    }

    _arrancarRevision() {
      if (!this.revision && !this.destruido) this.revision = this.reloj.intervalo(this.c.revisar_cada_ms, () => this.revisarPendientes().catch((e) => this.log.aviso("revisión de cobros: " + e.message)));
    }

    /** Tras resolver: si quedó cerrado (o en manos de la máquina) se olvida su espera; si no, se conserva. */
    _trasResolver(ref, r) {
      if (r === "credito" || !this._cobroAbierto(ref)) this.reintento.delete(ref);
    }

    _cobroAbierto(ref) {
      const c = this.almacen.cobro(ref);
      return c && !FINALES.has(c.estado) ? c : null;
    }

    /** Entrega un pago a la máquina. Desde aquí y hasta liberar(ref), nadie más toca ese cobro. */
    _entregar(ref, extra) {
      this.enManos.add(ref);
      this.em.emit("pagado", Object.assign({ ref }, extra || {}));
    }

    /** La máquina ha terminado con ese pago (prueba hecha, reembolsado o lo que sea). */
    liberar(ref) {
      this.enManos.delete(ref);
    }

    /**
     * Apunta el pago. t_pago solo la primera vez. No lanza: si no se puede apuntar, el pago sigue valiendo.
     * `tardio`: el pago se descubre después (resolución de fondo, tras un apagón o sin red). No se sabe cuándo se
     * pagó, así que se toma la hora de creación del cobro (siempre igual o anterior): si es viejo, se reembolsa.
     */
    async _marcarPagado(ref, extra, tardio) {
      const c = this.almacen.cobro(ref) || { ref };
      const cambios = Object.assign({ estado: "pagado" }, extra || {});
      if (!c.t_pago) {
        const hace = tardio ? this._edad(Object.assign({}, c, { ref })) : 0;
        cambios.t_pago = this.reloj.ahora() - hace;
        this.pagoMono.set(ref, this.reloj.mono() - hace);
        CobroContinuo._limitarMapa(this.pagoMono, 600);
      }
      try {
        await this._anotar(ref, cambios);
      } catch (e) {
        /* el almacén lo deja en memoria igualmente */
      }
    }

    /** Pago visto por el bucle (o al cerrar un cobro): se entrega a la máquina. */
    async _pagado(ref, extra) {
      this.enManos.add(ref); // antes de escribir: que la revisión de fondo no lo tome por huérfano
      await this._marcarPagado(ref, { checkout_id: extra.checkout_id, client_transaction_id: extra.client_transaction_id || null });
      this.log.info(`pagado · ${ref}${extra.credito ? " (al cerrar el cobro)" : ""}`);
      this._entregar(ref, extra.credito ? { credito: true } : null);
    }

    // ---------------------------------------------------------------- bucle principal
    iniciar() {
      if (this.destruido || this.bucle) return;
      this.grupo = this.reloj.grupo();
      const g = this.grupo;
      this.bucle = this._bucle(g).finally(() => {
        if (this.grupo === g) {
          this.bucle = null;
          this.grupo = null;
        }
      });
      this._arrancarRevision();
    }

    /**
     * Para el bucle. Si había un cobro abierto, se cancela en el lector (se espera a que salga el terminate,
     * máx. 4 s, para que un reinicio no deje el Solo pidiendo tarjeta) y se vigila de fondo hasta cerrarlo.
     */
    async detener() {
      const b = this.bucle;
      if (this.grupo) this.grupo.cancelar("detener");
      if (b) await b.catch(() => {});
      if (this.terminando) await Promise.race([this.terminando, this.reloj.esperar(4000)]).catch(() => {});
      this.bucle = null;
      this.grupo = null;
      this._fase("parado");
    }

    async _bucle(g) {
      let espera = 5000;
      try {
        for (;;) {
          g.comprobar();
          this.refBucle = null;
          const listo = await g.vigilar(this.puedeCobrar());
          if (!listo.ok) {
            this._fase("no_disponible", { motivo: listo.motivo || "fuera de servicio" });
            await g.esperar(10000);
            continue;
          }
          if (!this.cliente.configurado()) {
            this._fase("no_disponible", { motivo: "faltan los datos de SumUp" });
            await g.esperar(60000);
            continue;
          }
          const dudosos = this._inciertosDeEsteArranque();
          if (dudosos >= this.c.max_inciertos) {
            // algo raro con la red o con SumUp (portal cautivo, respuestas que se pierden): no se abren más cobros
            // que luego no se sabe si existen; la revisión de fondo los va aclarando
            if (this.fase.fase !== "no_disponible") this.log.aviso(`${dudosos} cobros sin aclarar: no abro más hasta resolverlos`);
            this._fase("no_disponible", { motivo: "comprobando pagos anteriores" });
            await g.esperar(60000);
            continue;
          }
          if (this.terminandoFondo) await g.vigilar(this.terminandoFondo.catch(() => {}));
          if (this.fase.fase !== "esperando_tarjeta") this._fase("abriendo");
          const ref = U.nuevoId(this.reloj.ahora());
          this.refBucle = ref;
          this.creadoMono.set(ref, this.reloj.mono());
          CobroContinuo._limitarMapa(this.creadoMono, 600);
          try {
            await this._anotar(ref, { estado: "abriendo", centimos: this.c.precio_centimos });
          } catch (e) {
            this._fase("no_disponible", { motivo: "no se puede escribir en la tarjeta" });
            await g.esperar(30000);
            continue;
          }
          let co;
          try {
            co = await this.cliente.crearCobro(ref, this.c.precio_centimos, this.c.moneda, this.c.descripcion);
          } catch (e) {
            espera = await this._errorAlCrear(ref, e, g, espera);
            continue;
          }
          this.fallosRed = 0;
          espera = 5000;
          this.abierto = { ref, checkout_id: co.checkout_id, client_transaction_id: co.client_transaction_id, desde: this.reloj.mono() };
          try {
            await this._anotar(ref, { estado: "abierto", checkout_id: co.checkout_id, client_transaction_id: co.client_transaction_id });
          } catch (e) {
            /* se sigue: el cobro existe y se vigila en memoria */
          }
          this._fase("esperando_tarjeta");
          const fin = await this._vigilar(this.abierto, g);
          this.abierto = null;
          if (fin === "pagado") return; // la máquina toma el control; volverá a llamar a iniciar()
          if (fin === "fallido") {
            this._fase("rechazado");
            await g.esperar(this.c.pausa_rechazo_ms);
          }
          if (fin === "error") {
            // SumUp no encuentra el cobro que acaba de crear: ruta de consulta mal o cuenta mal configurada.
            // No se abren cobros que no se pueden vigilar; se reintenta cada vez más tarde (máx. 10 min).
            this.erroresConsulta++;
            this._fase("no_disponible", { motivo: "error al consultar el pago" });
            await g.esperar(Math.min(10 * MIN, 30000 * 2 ** Math.min(5, this.erroresConsulta - 1)));
          }
        }
      } catch (e) {
        if (!(e instanceof ErrorCancelado)) this.log.error("bucle de cobro: " + (e.stack || e.message));
      } finally {
        this.refBucle = null;
        if (this.abierto && !this.destruido) {
          const a = this.abierto;
          this.abierto = null;
          this._cerrar(a).catch(() => {}); // de fondo: cancela en el lector y vigila por si pagaron justo entonces
        }
      }
    }

    _inciertosDeEsteArranque() {
      let n = 0;
      for (const c of this.almacen.cobrosAbiertos()) if ((c.estado === "incierto" || c.estado === "abriendo") && c.ref !== this.refBucle && this.creadoMono.has(c.ref)) n++;
      return n;
    }

    /** ¿Un "failed" es en realidad un cobro que caducó sin tarjeta? (no se enseña "rechazado") */
    _esCaducidad(st) {
      if (st.fallo && RE_CADUCADO.test(String(st.fallo))) return true;
      const vu = st.valid_until ? Date.parse(st.valid_until) : NaN;
      return Number.isFinite(vu) && this.reloj.ahora() >= vu - 5000;
    }

    /** Apunta un cobro que SumUp ha cerrado. Devuelve fallido | caducado | cancelado. */
    async _cerrado(ref, st) {
      if (st.status === "failed") {
        if (this._esCaducidad(st)) {
          await this._anotar(ref, { estado: "caducado", fallo: st.fallo || null }).catch(() => {});
          return "caducado";
        }
        await this._anotar(ref, { estado: "fallido", fallo: st.fallo || null }).catch(() => {});
        this.log.info("pago rechazado" + (st.fallo ? ": " + st.fallo : ""));
        return "fallido";
      }
      await this._anotar(ref, { estado: "cancelado" }).catch(() => {});
      return "cancelado";
    }

    /**
     * Consulta el cobro hasta que SumUp lo cierre. Devuelve pagado | fallido | cancelado | caducado | incierto | error.
     * Pasado vida_max_ms se cancela en el lector, pero se sigue vigilando: un "pending" puede ser alguien
     * metiendo el PIN y acabar pagado.
     */
    async _vigilar(a, g) {
      let fallos = 0;
      let cancelado = null; // mono del último terminate
      for (;;) {
        await g.esperar(this.c.consulta_ms);
        let st = null;
        try {
          st = await this.cliente.estadoCobro(a.checkout_id);
          fallos = 0;
          this.erroresConsulta = 0;
        } catch (e) {
          if (e.http === 404) {
            this.log.error(`SumUp no encuentra el cobro recién creado (404): ${a.ref}. Se cancela y se busca el pago`);
            await this.cliente.terminar();
            await this._anotar(a.ref, { estado: "incierto", motivo: "404 al consultar" }).catch(() => {});
            this._resolverDeFondo(a.ref);
            return "error";
          }
          fallos++;
          if (fallos === 3) this.log.aviso("no puedo consultar el cobro: " + e.message);
        }
        if (st) {
          if (st.status === "successful") {
            await this._pagado(a.ref, { checkout_id: a.checkout_id, client_transaction_id: st.client_transaction_id || a.client_transaction_id });
            return "pagado";
          }
          if (st.status === "failed" || st.status === "cancelled") return this._cerrado(a.ref, st);
        }
        const edad = this.reloj.mono() - a.desde;
        if (edad > this.c.vida_max_ms + this.c.cierre_max_ms) {
          // SumUp no lo cierra o no se puede consultar: lo sigue la resolución de fondo (con su checkout_id)
          this.log.aviso(`el cobro ${a.ref} sigue sin cerrarse: lo resuelvo de fondo`);
          await this._anotar(a.ref, { estado: "incierto", motivo: st ? "pendiente sin cerrar" : "sin poder consultar" }).catch(() => {});
          this._resolverDeFondo(a.ref);
          return "incierto";
        }
        if (edad > this.c.vida_max_ms && (cancelado === null || this.reloj.mono() - cancelado > 30000)) {
          if (cancelado === null) this.log.depurar(`cobro ${a.ref} pendiente más de ${Math.round(this.c.vida_max_ms / 1000)} s: lo cancelo en el lector`);
          await this.cliente.terminar();
          cancelado = this.reloj.mono();
        }
      }
    }

    async _errorAlCrear(ref, e, g, espera) {
      const sig = Math.min(60000, espera * 2);
      if (e.codigo === "READER_BUSY") {
        await this._anotar(ref, { estado: "anulado", motivo: "READER_BUSY" }).catch(() => {});
        this.log.aviso("el lector tiene un cobro abierto: lo cancelo");
        await this.cliente.terminar();
        await g.esperar(5000);
        return espera;
      }
      if (e.codigo === "READER_OFFLINE") {
        await this._anotar(ref, { estado: "anulado", motivo: "READER_OFFLINE" }).catch(() => {});
        this._fase("no_disponible", { motivo: "el lector de tarjetas no está conectado" });
        this.log.aviso("lector desconectado (READER_OFFLINE)");
        await g.esperar(espera);
        return sig;
      }
      if (e.http === 401 || e.http === 403) {
        await this._anotar(ref, { estado: "anulado", motivo: "credenciales" }).catch(() => {});
        this._fase("no_disponible", { motivo: "datos de SumUp no válidos" });
        this.log.error("SumUp rechaza la clave (401/403): revisa sumup.json");
        await g.esperar(60000);
        return espera;
      }
      if (e.red && e.noEnviada) {
        // la petición no salió de la Pi (sin red, DNS, conexión rechazada): el cobro no existe
        await this._anotar(ref, { estado: "anulado", motivo: "sin conexión" }).catch(() => {});
        this.fallosRed++;
        if (this.fallosRed >= 2) this._fase("no_disponible", { motivo: "sin conexión con el sistema de pago" });
        if (this.fallosRed === 2) this.log.aviso("no se pudo crear el cobro: " + e.message);
        await g.esperar(espera);
        return sig;
      }
      if (e.red || e.http >= 500 || e.codigo === "SIN_ID") {
        // la petición pudo llegar: el cobro puede existir y pagarse
        await this._anotar(ref, { estado: "incierto", motivo: e.red ? "red" : e.codigo === "SIN_ID" ? "respuesta sin checkout_id" : "http " + e.http }).catch(() => {});
        this.fallosRed++;
        if (this.fallosRed >= 2) this._fase("no_disponible", { motivo: "sin conexión con el sistema de pago" });
        this.log.aviso("no se pudo crear el cobro: " + e.message);
        this._resolverDeFondo(ref);
        await g.esperar(espera);
        return sig;
      }
      if (e.http === 429) {
        await this._anotar(ref, { estado: "anulado", motivo: "429" }).catch(() => {});
        this.log.aviso("SumUp pide ir más despacio (429)");
        await g.esperar(Math.max(espera, 30000));
        return sig;
      }
      await this._anotar(ref, { estado: "anulado", motivo: "http " + e.http }).catch(() => {});
      this._fase("no_disponible", { motivo: "error de configuración del pago" });
      this.log.error("SumUp rechaza el cobro: " + e.message);
      await g.esperar(60000);
      return espera;
    }

    /** Cobro abierto que hay que cerrar (detener, apagado de la máquina…). De fondo. */
    async _cerrar(a) {
      this.resolviendo.add(a.ref);
      try {
        const t = this.cliente.terminar();
        this.terminando = t;
        await t;
        if (this.terminando === t) this.terminando = null;
        const lim = this.reloj.mono() + 60000;
        while (this.reloj.mono() < lim && !this.destruido) {
          await this.reloj.esperar(this.c.consulta_ms);
          let st = null;
          try {
            st = await this.cliente.estadoCobro(a.checkout_id);
          } catch (e) {
            if (e.http === 404) break;
            continue;
          }
          if (st.status === "successful") return await this._pagado(a.ref, { checkout_id: a.checkout_id, client_transaction_id: st.client_transaction_id || a.client_transaction_id, credito: true });
          if (st.status === "failed" || st.status === "cancelled") return await this._cerrado(a.ref, st);
        }
        if (!this.destruido) await this._anotar(a.ref, { estado: "incierto", motivo: "sin cerrar al parar" }).catch(() => {});
      } catch (e) {
        this.log.aviso("cerrar cobro: " + e.message);
      } finally {
        this.resolviendo.delete(a.ref);
      }
    }

    // ---------------------------------------------------------------- cobros a medias
    /** Lanza la resolución de un cobro en segundo plano (una sola vez a la vez por referencia). */
    _resolverDeFondo(ref) {
      if (this.resolviendo.has(ref) || this.destruido) return;
      this.resolviendo.add(ref);
      this.reloj
        .esperar(5000)
        .then(async () => {
          if (this.destruido) return;
          const c = this._cobroAbierto(ref);
          if (!c || this.enManos.has(ref)) return;
          const r = await this._resolver(c);
          if (r === "credito" && !this.destruido) this._entregar(ref, { credito: true });
          this._trasResolver(ref, r);
        })
        .catch((e) => {
          this._programarReintento(ref, e);
          this.log.depurar(`resolver ${ref}: ${e.message}`);
        })
        .finally(() => this.resolviendo.delete(ref));
    }

    /**
     * Resuelve un cobro que no está cerrado. Devuelve "credito" si hay que dar una prueba, "reembolso" si se ha
     * mandado reembolsar, o null. Lanza si todavía no se puede saber (se reintentará).
     */
    async _resolver(c) {
      switch (c.estado) {
        case "abriendo":
        case "incierto":
        case "abierto":
          return this._resolverCobro(c);
        case "pagado":
        case "en_prueba":
          return this._resolverPago(c);
        case "a_reembolsar":
          await this.reembolsar(c.ref, c.motivo || "pendiente");
          return "reembolso";
        default:
          return null;
      }
    }

    async _resolverCobro(c) {
      const ref = c.ref;
      if (c.checkout_id) {
        let st = null;
        try {
          st = await this.cliente.estadoCobro(c.checkout_id);
        } catch (e) {
          if (e.http !== 404) throw e; // sin red: se reintentará
        }
        if (st && st.status === "pending" && (await this._terminarFondo())) {
          for (let i = 0; i < 20 && st.status === "pending" && !this.destruido; i++) {
            await this.reloj.esperar(3000);
            st = await this.cliente.estadoCobro(c.checkout_id);
          }
        }
        if (st) {
          if (st.status === "successful") {
            await this._marcarPagado(ref, { client_transaction_id: st.client_transaction_id || c.client_transaction_id || null }, true);
            this.log.info(`cobro ${ref}: estaba pagado`);
            return this._creditoOReembolso(this.almacen.cobro(ref) || c);
          }
          if (st.status === "failed" || st.status === "cancelled") {
            await this._cerrado(ref, st);
            return null;
          }
          throw new Error("el cobro sigue pendiente en SumUp");
        }
        // SumUp no conoce el checkout: se busca el pago por nuestras referencias
      }
      await this._terminarFondo(); // que el lector no se quede pidiendo una tarjeta que no vigilamos
      const tr = await this._buscarPago(c); // sin red, lanza y sigue abierto
      if (S.transaccionPagada(tr)) {
        await this._marcarPagado(ref, { transaction_id: tr.id || null, client_transaction_id: tr.client_transaction_id || c.client_transaction_id || null }, true);
        this.log.info(`cobro ${ref}: el pago aparece buscándolo`);
        return this._creditoOReembolso(this.almacen.cobro(ref) || c);
      }
      if (this._edad(c) < this.c.vida_cobro_ms) throw new Error("aún se podría pagar");
      await this._anotar(ref, { estado: "anulado", motivo: c.checkout_id ? "SumUp no lo conoce y no hay pago" : "no hay pago" });
      return null;
    }

    async _buscarPago(c) {
      let t = null;
      if (c.client_transaction_id) t = await this.cliente.buscarTransaccion("client_transaction_id", c.client_transaction_id);
      if (!S.transaccionPagada(t) && this.cliente.claveAfiliado) t = (await this.cliente.buscarTransaccion("foreign_transaction_id", c.ref)) || t;
      return t;
    }

    async _resolverPago(c) {
      if (this.enManos.has(c.ref)) return null; // la máquina está con él
      if (await this.almacen.partidaDeCobro(c.ref)) {
        await this._anotar(c.ref, { estado: "consumido", motivo: "la prueba ya se hizo" }).catch(() => {});
        return null;
      }
      return this._creditoOReembolso(c);
    }

    /** Pago sin prueba: se da la prueba (crédito) si es reciente y no se ha intentado ya demasiadas veces. */
    async _creditoOReembolso(c) {
      const ref = c.ref;
      const veces = c.creditos || 0;
      if (this._edadPago(c) <= this.c.credito_max_ms && veces < this.c.credito_max_veces) {
        await this._anotar(ref, { creditos: veces + 1 }); // si no se puede apuntar, lanza: se reintenta
        return "credito";
      }
      const motivo = veces >= this.c.credito_max_veces ? `pago sin prueba tras ${veces} intentos` : `pago sin prueba (más de ${Math.round(this.c.credito_max_ms / MIN)} min)`;
      await this.reembolsar(ref, motivo);
      return "reembolso";
    }

    /**
     * Al arrancar: resuelve el diario. Cada pago sin prueba sale como evento "pagado" con credito: true (la
     * máquina lo atiende en cuanto pueda). Lo que no se pueda resolver aún se reintenta en revisarPendientes().
     */
    async reconciliar() {
      this._arrancarRevision(); // aunque la máquina no llegue a la espera (sensor roto…), los reembolsos siguen
      let n = 0;
      const refs = this.almacen
        .cobrosAbiertos()
        .sort((a, b) => (a.t || 0) - (b.t || 0))
        .map((c) => c.ref);
      for (const ref of refs) {
        if (this.destruido) break;
        if (this._ocupado(ref)) continue;
        const c = this._cobroAbierto(ref); // releído: la revisión de fondo puede haberlo cerrado ya
        if (!c) continue;
        this.resolviendo.add(ref);
        try {
          const r = await this._resolver(c);
          this.log.info(`diario: ${ref} (${c.estado}) → ${(this.almacen.cobro(ref) || {}).estado}${r === "credito" ? " · prueba pendiente" : ""}`);
          if (r === "credito" && !this.destruido) {
            n++;
            this._entregar(ref, { credito: true });
          }
          this._trasResolver(ref, r);
        } catch (e) {
          this._programarReintento(ref, e);
          this.log.aviso(`diario: ${ref} sigue sin resolver (${e.message})`);
        } finally {
          this.resolviendo.delete(ref);
        }
      }
      return n;
    }

    /**
     * Cada pocos minutos: reintenta reembolsos e inciertos, y resuelve lo que quedó colgado (por ejemplo, un
     * cobro abierto de antes de un apagón que no se pudo consultar sin red). Si aparece un pago, es un crédito.
     */
    async revisarPendientes() {
      if (this.destruido || this.revisando) return;
      this.revisando = true;
      try {
        for (const c0 of this.almacen.cobrosAbiertos()) {
          if (this.destruido) break;
          const ref = c0.ref;
          if (this._ocupado(ref) || !this._toca(ref)) continue;
          const c = this._cobroAbierto(ref);
          if (!c) continue;
          if ((c.estado === "abriendo" || c.estado === "incierto" || c.estado === "abierto") && this._edad(c) > this.c.sin_resolver_ms) {
            await this._anotar(ref, { estado: "sin_resolver" }).catch(() => {});
            this.log.error(`cobro ${ref} sin resolver en ${Math.round(this.c.sin_resolver_ms / 86400000)} días: revísalo en SumUp`);
            continue;
          }
          this.resolviendo.add(ref);
          try {
            const r = await this._resolver(c);
            if (r === "credito" && !this.destruido) this._entregar(ref, { credito: true });
            this._trasResolver(ref, r);
          } catch (e) {
            this._programarReintento(ref, e);
            this.log.depurar(`revisar ${ref}: ${e.message}`);
          } finally {
            this.resolviendo.delete(ref);
          }
        }
      } finally {
        this.revisando = false;
      }
    }

    async _idTransaccion(c) {
      if (c.transaction_id) return c.transaction_id;
      const t = await this._buscarPago(c);
      return (t && t.id) || null;
    }

    /** Devuelve el dinero de un cobro pagado. No lanza: si falla, queda apuntado para reintentar. */
    async reembolsar(ref, motivo) {
      // mientras dura, nadie más toca este cobro (ni la revisión de fondo lo toma por un pago sin prueba)
      const propio = !this.resolviendo.has(ref);
      if (propio) this.resolviendo.add(ref);
      try {
        return await this._reembolsar(ref, motivo);
      } finally {
        if (propio) this.resolviendo.delete(ref);
      }
    }

    async _reembolsar(ref, motivo) {
      const c = this.almacen.cobro(ref) || { ref };
      if (FINALES.has(c.estado)) return c.estado === "reembolsado";
      if (c.gratis) {
        await this._anotar(ref, { estado: "anulado", motivo }).catch(() => {});
        return true;
      }
      let hecha = false;
      try {
        hecha = await this.almacen.partidaDeCobro(ref);
      } catch (e) {
        hecha = false;
      }
      if (hecha) {
        // la persona vio su resultado: no se devuelve el dinero
        await this._anotar(ref, { estado: "consumido", motivo: "la prueba ya se hizo" }).catch(() => {});
        this.log.aviso(`no reembolso ${ref}: su prueba ya está en el ranking`);
        return false;
      }
      if (!this.c.reembolso_automatico) {
        await this._anotar(ref, { estado: "reembolso_manual", motivo }).catch(() => {});
        this.log.error(`REEMBOLSO MANUAL pendiente: ${ref} (${motivo})`);
        return false;
      }
      let intentos = c.intentos || 0;
      if (c.estado !== "a_reembolsar") {
        // primero se apunta la decisión: tras un apagón a mitad, se sigue reembolsando (nunca una prueba gratis)
        await this._anotar(ref, { estado: "a_reembolsar", motivo }).catch(() => {});
      }
      try {
        const tid = await this._idTransaccion(c);
        if (!tid) throw new U.ErrorAlc("SIN_TRANSACCION", "no encuentro la transacción");
        try {
          await this.cliente.reembolsar(tid);
        } catch (e) {
          if (e.http !== 409) throw e;
          // 409: ¿ya estaba reembolsado? Se comprueba antes de darlo por hecho
          const t = await this._buscarPago(Object.assign({}, c, { transaction_id: tid }));
          if (!t || !/REFUND/i.test(String(t.status || t.simple_status || ""))) throw e;
          this.log.info(`${ref} ya estaba reembolsado`);
        }
        await this._anotar(ref, { estado: "reembolsado", transaction_id: tid, motivo }).catch(() => {});
        this.reintento.delete(ref);
        this.log.info(`reembolsado ${ref} (${motivo})`);
        return true;
      } catch (e) {
        // "no encuentro la transacción" puede ser que SumUp aún no la tenga en la búsqueda: el primer día no cuenta
        const reciente = e.codigo === "SIN_TRANSACCION" && this._edadPago(c) < this.c.sin_transaccion_temporal_ms;
        const temporal = esTemporal(e) || reciente;
        if (!temporal) intentos++;
        const fin = intentos >= this.c.reembolso_max_intentos;
        await this._anotar(ref, { estado: fin ? "reembolso_imposible" : "a_reembolsar", motivo, intentos, error: String(e.message || e).slice(0, 160) }).catch(() => {});
        this._programarReintento(ref, temporal && !reciente ? e : null);
        this.log[fin ? "error" : "aviso"](`reembolso ${ref} ${fin ? "IMPOSIBLE, hazlo a mano" : "falló, se reintentará"}: ${e.message}`);
        return false;
      }
    }

    /** Parada ordenada (cancela el cobro abierto en el lector) y fin de las tareas de fondo. */
    async destruir() {
      if (this.revision) this.revision.cancelar();
      await this.detener();
      this.destruido = true;
    }
  }

  /** Sin cobro: la prueba empieza sola tras una pausa (banco de pruebas). */
  class CobroGratis {
    constructor(o) {
      this.almacen = o.almacen;
      this.reloj = o.reloj;
      this.log = o.registro || { depurar() {}, info() {}, aviso() {}, error() {} };
      this.pausa = (o.config && o.config.gratis_pausa_ms) || 8000;
      this.c = Object.assign({}, POR_DEFECTO, o.config || {});
      this.em = U.crearEmisor();
      this.grupo = null;
      this.fase = { fase: "parado" };
    }
    on(ev, fn) {
      return this.em.on(ev, fn);
    }
    get gratis() {
      return true;
    }
    iniciar() {
      if (this.grupo) return;
      const g = (this.grupo = this.reloj.grupo());
      this.fase = { fase: "esperando_tarjeta" };
      this.em.emit("estado", this.fase);
      g.temporizador(this.pausa, async () => {
        this.grupo = null;
        const ref = U.nuevoId(this.reloj.ahora());
        try {
          await this.almacen.anotarCobro(ref, { estado: "pagado", gratis: true, t_pago: this.reloj.ahora() });
        } catch (e) {
          /* sin diario: igual se hace la prueba */
        }
        this.em.emit("pagado", { ref, gratis: true });
      });
    }
    async detener() {
      if (this.grupo) this.grupo.cancelar();
      this.grupo = null;
      this.fase = { fase: "parado" };
    }
    liberar() {}
    async reconciliar() {
      let n = 0;
      for (const c of this.almacen.cobrosAbiertos()) {
        const edad = Math.max(0, this.reloj.ahora() - (c.t_pago || c.t || 0));
        const veces = c.creditos || 0;
        const hecha = await this.almacen.partidaDeCobro(c.ref).catch(() => false);
        if ((c.estado === "pagado" || c.estado === "en_prueba") && !hecha && edad <= this.c.credito_max_ms && veces < this.c.credito_max_veces) {
          await this.almacen.anotarCobro(c.ref, { creditos: veces + 1 }).catch(() => {});
          n++;
          this.em.emit("pagado", { ref: c.ref, gratis: true, credito: true });
        } else await this.almacen.anotarCobro(c.ref, { estado: hecha ? "consumido" : "anulado" }).catch(() => {});
      }
      return n;
    }
    async revisarPendientes() {}
    async reembolsar(ref, motivo) {
      await this.almacen.anotarCobro(ref, { estado: "anulado", motivo }).catch(() => {});
      return true;
    }
    async destruir() {
      await this.detener();
    }
  }

  return { CobroContinuo, CobroGratis, POR_DEFECTO, FINALES };
});
