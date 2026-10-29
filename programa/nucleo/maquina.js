/*
 * maquina.js — el programa del alcoholímetro: une cobro, sensor, cámara, almacén y pantalla.
 *
 * Funciona igual en la Raspberry Pi (pi/principal.js le pasa el hardware de verdad) y en la simulación
 * (sim/simulador.js le pasa el hardware simulado). No sabe en cuál de los dos está.
 *
 * Ciclo:
 *   espera ──(pago en el Solo)──► pagado ► preparando (sensor 0x32, 10 s) ► sopla (0x33) ► soplando (0x34, 4 s)
 *     ▲                                        ▲                │ cortado (0x35) ─┘ (vuelve a precalentar)
 *     │                                        └────────────────┘
 *     │   analizando: el sensor calcula (0x36) mientras corre la cuenta atrás de 5 s y se hace la foto
 *     └── resultado (20 s): foto + valor + puesto en el ranking + celebración
 *   Si algo falla tras cobrar: aviso + reembolso. Si el sensor o la tarjeta fallan: fuera de servicio (no se cobra).
 *
 * Para que no falle nunca:
 * - Cada prueba tiene su grupo de temporizadores; al terminar (bien o mal) se cancela entero.
 * - Toda espera tiene tope. Toda llamada al hardware puede fallar y está controlada.
 * - El director (bucle principal) captura cualquier error, lo apunta y sigue: nunca se queda parado.
 * - Lo que hay que recordar tras un apagón (cobros, partidas, fotos) se escribe antes de seguir.
 */
(function (raiz, fabrica) {
  "use strict";
  const enNode = typeof module === "object" && module.exports;
  const dep = (n) => (enNode ? require("./" + n) : raiz.ALC[n]);
  const m = fabrica(dep("util"), dep("reloj"), dep("protocolo_ze29a"), dep("ranking"), dep("textos"));
  if (enNode) module.exports = m;
  else (raiz.ALC = raiz.ALC || {}).maquina = m;
})(typeof globalThis !== "undefined" ? globalThis : this, function (U, RJ, P, R, T) {
  "use strict";
  const { ErrorCancelado } = RJ;
  const { EST, TIEMPOS } = P;
  const { Ranking } = R;

  const POR_DEFECTO = {
    precio_centimos: 200,
    unidad: "g/L", // g/L (sensor ÷100) | mg/100mL (tal cual) | mg/L (÷factor_mg_l, sin confirmar por Winsen)
    factor_mg_l: 220,
    sondeo_sensor_ms: 200,
    pagado_ms: 1800,
    cuenta_atras_ms: 5000,
    resultado_ms: 20000,
    aviso_ms: 9000,
    max_cortes: 3, // soplidos cortados permitidos antes de anular
    max_esperas_soplido: 2, // veces que el sensor puede cansarse de esperar (1 min cada una)
    sesion_max_ms: 6 * 60 * 1000,
    analisis_max_ms: 15000,
    salud_cada_ms: 30000,
    limpieza_cada_ms: 10 * 60 * 1000,
    umbral_pausa: 150, // tras un resultado alto (mg/100 mL) …
    pausa_tras_alto_ms: 30000, // … no se cobra durante este tiempo (recuperación del sensor; medir en banco)
    fotos: true,
    detectar_camara_tapada: true,
    posiciones: { lector: "arriba-derecha", boquilla: "arriba-izquierda", camara: "arriba-izquierda" },
  };

  class Maquina {
    /**
     * @param {object} o
     *   reloj, registro (crearRegistro), sensor (SensorZE29A), cobro (CobroContinuo|CobroGratis), camara,
     *   almacen (Almacen), config, plataforma: { urlFoto(id) → string, urlFotoBytes?(id, bytes) → string }
     */
    constructor(o) {
      this.reloj = o.reloj;
      this.reg = o.registro;
      this.log = o.registro.hijo("maquina");
      this.sensor = o.sensor;
      this.cobro = o.cobro;
      this.camara = o.camara || null;
      this.almacen = o.almacen;
      this.plat = o.plataforma || { urlFoto: (id) => `/fotos/${id}.jpg` };
      this.c = Object.assign({}, POR_DEFECTO, o.config || {});
      this.c.posiciones = Object.assign({}, POR_DEFECTO.posiciones, (o.config || {}).posiciones || {});
      this.em = U.crearEmisor((ev, e) => this.log.error(`oyente de ${ev}: ${e.message}`));
      this.detenido = false;
      this.creditos = []; // pagos que esperan su prueba
      this.refsAtendidas = new Set();
      this.esperandoPago = null; // resolvedor de la fase de espera
      this.salud = { ok: false, motivo: "arrancando" };
      this.segSoplido = 4;
      this.noCobrarHasta = 0;
      this.n = 0;
      this.vistaActual = null;
      this.ultimaSalud = this.reloj.mono();
      this.grupoFijo = this.reloj.grupo(); // temporizadores que viven lo que la máquina
      this.cobro.puedeCobrar = () => this.puedeCobrar();
      this.cobro.on("pagado", (p) => this._alPagar(p));
      this.cobro.on("estado", () => this._refrescarComunes());
      this.almacen.on("ranking", () => this._refrescarComunes());
      this.almacen.on("fotos", () => this._refrescarComunes());
    }

    on(ev, fn) {
      return this.em.on(ev, fn);
    }

    /**
     * Vista actual lista para mandar a la pantalla: `edad_ms` dice cuánto hace que empezó (la pantalla del
     * kiosco puede conectarse a mitad de una fase, por ejemplo tras recargarse, y no debe empezar de cero).
     */
    vista() {
      if (!this.vistaActual) return null;
      return Object.assign({}, this.vistaActual, { edad_ms: Math.max(0, Math.round(this.reloj.mono() - this.vistaActual.emitida)) });
    }

    // ---------------------------------------------------------------- vistas (lo que pinta la pantalla)
    _comunes() {
      const top = this.almacen.ranking.top.map((e, i) => {
        const f = T.formatoValor(e.valor, this.c.unidad, this.c.factor_mg_l);
        return {
          puesto: i + 1,
          id: e.id,
          valor: f.texto,
          fecha: U.fechaCorta(e.t, this.reloj.ahora()),
          foto: e.foto && this.almacen.tieneFoto(e.id) ? this.plat.urlFoto(e.id) : null,
        };
      });
      const pf = this.cobro.fase || { fase: "parado" };
      const pausa = Math.max(0, this.noCobrarHasta - this.reloj.mono());
      const unidad = T.formatoValor(0, this.c.unidad, this.c.factor_mg_l).unidad;
      return {
        precio: U.euros(this.c.precio_centimos),
        unidad,
        total: this.almacen.ranking.total,
        top,
        record: top.length ? `${top[0].valor} ${unidad}` : null,
        pago: { estado: pf.fase, motivo: pf.motivo || null },
        pausa_ms: pausa,
        gratis: !!this.cobro.gratis,
        posiciones: this.c.posiciones,
      };
    }

    /**
     * ¿El programa está vivo pero sin avanzar? (una espera sin tope, la tarjeta SD colgada…). Lo mira
     * pi/sistema.js cada 30 s: si dice que sí, el programa se reinicia. Devuelve el motivo o null.
     */
    atascada() {
      if (this.detenido || !this.vistaActual) return null;
      const ahora = this.reloj.mono();
      const f = this.vistaActual.fase;
      const quieta = ahora - this.vistaActual.emitida;
      if (f === "espera" || f === "fuera_servicio") {
        const sin = ahora - this.ultimaSalud;
        return sin > 5 * 60000 ? `sin comprobar la salud desde hace ${Math.round(sin / 1000)} s (${f})` : null;
      }
      if (f === "arranque") return quieta > 15 * 60000 ? "arrancando desde hace más de 15 min" : null;
      return quieta > 10 * 60000 ? `en ${f} desde hace ${Math.round(quieta / 1000)} s` : null;
    }

    _vista(fase, d) {
      this.vistaActual = Object.assign({ fase, n: ++this.n, d: d || {}, emitida: this.reloj.mono() }, this._comunes());
      this.em.emit("vista", this.vista());
    }

    /** Cambió el ranking o el estado del cobro: se repinta la vista actual con los datos nuevos. */
    _refrescarComunes() {
      if (!this.vistaActual) return;
      this.vistaActual = Object.assign({}, this.vistaActual, this._comunes(), { n: ++this.n });
      this.em.emit("vista", this.vista());
    }

    // ---------------------------------------------------------------- arranque y director
    async arrancar() {
      this._vista("arranque", { texto: "Arrancando…" });
      // el almacén y el sensor se reintentan hasta que funcionen: la máquina nunca se rinde
      for (let i = 0; !this.detenido; i++) {
        try {
          await this.almacen.abrir();
          break;
        } catch (e) {
          this.log.error("no puedo abrir la carpeta de datos: " + e.message);
          this._vista("fuera_servicio", { motivo: "no se puede leer la tarjeta" });
          await this.reloj.esperar(Math.min(60000, 5000 * (i + 1)));
        }
      }
      try {
        const s = await this.sensor.tiempoSoplido();
        if (s) this.segSoplido = s;
        const p = await this.sensor.umbralPresion();
        this.log.info(`sensor: soplido de ${this.segSoplido} s, umbral de presión ${p}`);
      } catch (e) {
        this.log.aviso("sensor al arrancar: " + e.message);
      }
      // cobros que quedaron a medias (apagón): los pagos sin prueba llegan como "pagado" (crédito).
      // Con tope de tiempo: sin red no se puede resolver todo y lo que falte lo reintenta el cobro de fondo.
      try {
        await Promise.race([this.cobro.reconciliar(), this.reloj.esperar(25000)]);
      } catch (e) {
        this.log.aviso("diario de cobros: " + e.message);
      }
      this.grupoFijo.intervalo(this.c.limpieza_cada_ms, () => this._limpiar());
      this._limpiar();
      this.director = this._director().catch((e) => this.log.error("director: " + (e.stack || e.message)));
      return true;
    }

    async detener() {
      this.detenido = true;
      this.grupoFijo.cancelar();
      if (this.gFase) this.gFase.cancelar("detener");
      if (this.esperandoPago) this.esperandoPago(null);
      try {
        await this.cobro.detener();
      } catch (e) {
        /* nada */
      }
      if (this.director) await this.director;
      await this._apagarCamara();
    }

    async _limpiar() {
      try {
        await this.almacen.limpiar();
      } catch (e) {
        this.log.aviso("limpieza de fotos: " + e.message);
      }
    }

    _alPagar(p) {
      if (!p || !p.ref) return;
      if (this.refsAtendidas.has(p.ref)) {
        if (this.cobro.liberar) this.cobro.liberar(p.ref); // repetido: ya se atendió
        return;
      }
      this.refsAtendidas.add(p.ref);
      if (this.refsAtendidas.size > 500) this.refsAtendidas.delete(this.refsAtendidas.values().next().value);
      this.creditos.push(p);
      if (this.esperandoPago) this.esperandoPago(true);
    }

    async _director() {
      while (!this.detenido) {
        try {
          if (this.creditos.length) {
            const p = this.creditos.shift();
            await this._sesion(p);
            continue;
          }
          this.salud = await this._comprobarSalud();
          if (!this.salud.ok) {
            await this._fueraDeServicio();
            continue;
          }
          await this._espera();
        } catch (e) {
          if (e instanceof ErrorCancelado || this.detenido) break;
          this.log.error("error inesperado (sigo): " + (e.stack || e.message));
          await this.reloj.esperar(3000);
        }
      }
    }

    async _comprobarSalud() {
      let r = { ok: true };
      try {
        await this.sensor.estado();
      } catch (e) {
        r = { ok: false, motivo: "el sensor no responde" };
      }
      if (r.ok) {
        let a;
        try {
          a = await this.almacen.salud();
        } catch (e) {
          a = { ok: false, motivo: "error de la tarjeta" };
        }
        if (!a.ok) r = a;
      }
      this.ultimaSalud = this.reloj.mono();
      return r;
    }

    /** Lo que pregunta el cobro antes de abrir cada cobro (sin tráfico extra por la UART). */
    async puedeCobrar() {
      if (!this.salud.ok) return this.salud;
      const p = this.noCobrarHasta - this.reloj.mono();
      if (p > 0) return { ok: false, motivo: "preparando el sensor" };
      return { ok: true };
    }

    async _fueraDeServicio() {
      this.log.aviso("fuera de servicio: " + this.salud.motivo);
      await this.cobro.detener();
      this._vista("fuera_servicio", { motivo: this.salud.motivo });
      const g = (this.gFase = this.reloj.grupo());
      try {
        while (!this.detenido && !this.creditos.length) {
          await g.esperar(15000);
          this.salud = await this._comprobarSalud();
          if (this.salud.ok) {
            this.log.info("vuelve a funcionar");
            return;
          }
          this._vista("fuera_servicio", { motivo: this.salud.motivo });
        }
      } finally {
        g.cancelar();
      }
    }

    /** Pantalla de espera con el Solo pidiendo tarjeta. Vuelve al pagar o si falla la salud. */
    async _espera() {
      this._vista("espera");
      const g = (this.gFase = this.reloj.grupo());
      const fin = new Promise((ok) => (this.esperandoPago = ok));
      // un pago que llegó mientras se comprobaba la salud (sin nadie esperándolo) no se queda en la cola
      if (this.creditos.length) this.esperandoPago(true);
      g.intervalo(this.c.salud_cada_ms, async () => {
        const s = await this._comprobarSalud();
        this.salud = s;
        if (!s.ok && this.esperandoPago) this.esperandoPago(false);
      });
      if (this.noCobrarHasta > this.reloj.mono()) g.temporizador(this.noCobrarHasta - this.reloj.mono() + 50, () => this._refrescarComunes());
      this.cobro.iniciar();
      try {
        await fin;
      } finally {
        this.esperandoPago = null;
        g.cancelar();
      }
      // si se sale por pago, el bucle de cobro ya se ha parado solo; si no (salud, crédito de fondo), se para aquí
      await this.cobro.detener();
    }

    // ---------------------------------------------------------------- una prueba
    async _sesion(pago) {
      const g = (this.gFase = this.reloj.grupo());
      const s = {
        ref: pago.ref,
        gratis: !!pago.gratis || !!this.cobro.gratis,
        inicio: this.reloj.mono(),
        cortes: 0,
        esperas: 0,
        reinicios: 0,
        fallosSensor: 0,
        resultadoMostrado: false,
        partidaRegistrada: false,
        heredado: false,
      };
      this.log.info(`prueba ${s.ref}${pago.credito ? " (pendiente de antes)" : ""}`);
      try {
        await this.almacen.anotarCobro(s.ref, { estado: "en_prueba" }).catch(() => {});
        this._vista("pagado", { credito: !!pago.credito });
        this._encenderCamara(); // arranca de fondo; si falla, la prueba sigue sin foto
        await g.esperar(this.c.pagado_ms);
        let ini;
        try {
          ini = await this.sensor.iniciarCiclo(g);
        } catch (e) {
          if (e instanceof ErrorCancelado) throw e;
          throw new U.ErrorAlc("SENSOR", "el sensor no arranca: " + e.message);
        }
        if (!ini.ok) throw new U.ErrorAlc("SENSOR_NO_ARRANCA", `el sensor no acepta empezar (estado 0x${ini.estado.toString(16)})`);
        s.heredado = !!ini.heredado;
        s.desdeArranque = this.reloj.mono();
        await this._soplido(g, s);
        const [r, foto] = await Promise.all([this._esperarResultado(g, s), this._cuentaAtrasYFoto(g, s)]);
        await this._resultado(g, s, r, foto);
        await g.esperar(this.c.resultado_ms);
      } catch (e) {
        if (e instanceof ErrorCancelado && this.detenido) throw e;
        g.cancelar(); // lo que corría en paralelo (cuenta atrás, foto) se para antes de enseñar el aviso
        await this._fallo(s, e);
      } finally {
        g.cancelar();
        if (this.cobro.liberar) this.cobro.liberar(s.ref);
        await this._apagarCamara();
      }
    }

    /** Sigue al sensor desde precalentar hasta que termina de soplar (0x36/0x37). */
    async _soplido(g, s) {
      let prev = null;
      for (;;) {
        if (this.reloj.mono() - s.inicio > this.c.sesion_max_ms) throw new U.ErrorAlc("TIEMPO_SESION", "la prueba dura demasiado");
        let e;
        try {
          e = await this.sensor.estado();
          s.fallosSensor = 0;
        } catch (err) {
          if (++s.fallosSensor >= 5) throw new U.ErrorAlc("SENSOR", "el sensor ha dejado de responder");
          await g.esperar(300);
          continue;
        }
        switch (e) {
          case EST.PRECALENTANDO:
            if (e !== prev) this._vista("preparando", { duracion_ms: TIEMPOS.precalentar, transcurrido_ms: 0, cortes: s.cortes });
            break;
          case EST.ESPERANDO_SOPLIDO:
            if (e !== prev) this._vista("sopla", { limite_ms: TIEMPOS.esperaSoplido, transcurrido_ms: 0, segundos: this.segSoplido, cortes: s.cortes, max_cortes: this.c.max_cortes });
            break;
          case EST.SOPLANDO:
            s.heredado = false;
            if (e !== prev) this._vista("soplando", { duracion_ms: this.segSoplido * 1000, transcurrido_ms: 0 });
            break;
          case EST.SOPLIDO_CORTADO:
            if (e !== prev) {
              s.cortes++;
              this.log.info(`soplido cortado (${s.cortes}/${this.c.max_cortes})`);
              if (s.cortes >= this.c.max_cortes) throw new U.ErrorAlc("CORTES", "demasiados soplidos cortados");
              this._vista("cortado", {
                espera_ms: TIEMPOS.cortadoAPrecalentar + TIEMPOS.precalentar,
                transcurrido_ms: 0,
                cortes: s.cortes,
                max_cortes: this.c.max_cortes,
                segundos: this.segSoplido,
              });
            }
            break;
          case EST.CALCULANDO:
          case EST.RESULTADO_LISTO:
            if (prev === EST.PRECALENTANDO) this.log.aviso("el sensor pasó a calcular sin verse el soplido");
            return;
          case EST.REPOSO: {
            // el sensor se cansó de esperar (1 min sin soplido) o se reinició
            if (s.heredado && (prev === EST.ESPERANDO_SOPLIDO || prev === EST.PRECALENTANDO || prev === null)) {
              // el ciclo venía de antes y su minuto se acabó: no cuenta como "nadie sopla"
              s.heredado = false;
              this.log.info("el ciclo que quedaba del sensor ha caducado: empiezo uno nuevo");
            } else if (prev === EST.ESPERANDO_SOPLIDO || prev === EST.SOPLIDO_CORTADO || prev === null) {
              s.esperas++;
              if (s.esperas >= this.c.max_esperas_soplido) throw new U.ErrorAlc("SIN_SOPLIDO", "nadie ha soplado");
              this.log.info("nadie sopla: otra oportunidad");
            } else if (++s.reinicios > 2) throw new U.ErrorAlc("SENSOR", "el sensor se reinicia solo");
            const ok = await this.sensor.cambiarEstado(EST.PRECALENTANDO).catch(() => false);
            if (!ok) throw new U.ErrorAlc("SENSOR_NO_ARRANCA", "el sensor no vuelve a empezar");
            break;
          }
          default:
            break;
        }
        prev = e;
        await g.esperar(this.c.sondeo_sensor_ms);
      }
    }

    /** Espera a 0x37 y lee el resultado (dos lecturas iguales). */
    async _esperarResultado(g, s) {
      const t0 = this.reloj.mono();
      let fallos = 0;
      for (;;) {
        if (this.reloj.mono() - t0 > this.c.analisis_max_ms) throw new U.ErrorAlc("SIN_RESULTADO", "el sensor no da el resultado");
        let e;
        try {
          e = await this.sensor.estado();
          fallos = 0;
        } catch (err) {
          if (++fallos >= 5) throw new U.ErrorAlc("SENSOR", "el sensor ha dejado de responder");
          await g.esperar(300);
          continue;
        }
        if (e === EST.RESULTADO_LISTO) {
          const r = await this.sensor.leerResultado();
          this.log.info(`resultado del sensor: ${r.valor} mg/100 mL (alarma ${r.alarma})${r.saturado ? " SATURADO" : ""}`);
          return r;
        }
        if (e !== EST.CALCULANDO) throw new U.ErrorAlc("SIN_RESULTADO", `estado inesperado al calcular: 0x${e.toString(16)}`);
        await g.esperar(this.c.sondeo_sensor_ms);
      }
    }

    /** Cuenta atrás de 5 s con la cámara en directo y foto al llegar a cero. */
    async _cuentaAtrasYFoto(g, s) {
      const conCamara = !!(this.c.fotos && this.camara);
      this._vista("analizando", { cuenta_ms: this.c.cuenta_atras_ms, transcurrido_ms: 0, camara: conCamara && this.camara.lista(), foto: null });
      await g.esperar(this.c.cuenta_atras_ms);
      let foto = null;
      if (conCamara) {
        try {
          foto = await Promise.race([
            this.camara.foto(),
            g.esperar(3000).then(() => null), // una cámara colgada no bloquea la prueba (H24)
          ]);
        } catch (e) {
          if (e instanceof ErrorCancelado) throw e;
          this.log.aviso("foto: " + e.message);
          foto = null;
        }
      }
      g.comprobar(); // si la prueba se anuló mientras tanto, no se pisa el aviso
      const tapada = !!(foto && foto.tapada && this.c.detectar_camara_tapada);
      s.foto = foto;
      const url = foto && !tapada && foto.bytes && this.plat.urlFotoBytes ? this.plat.urlFotoBytes(foto.bytes) : null;
      this._vista("analizando", { cuenta_ms: this.c.cuenta_atras_ms, transcurrido_ms: this.c.cuenta_atras_ms, camara: false, foto: url, tapada, flash: true });
      this._apagarCamara(); // ya no hace falta: libera CPU para la animación del resultado
      return foto;
    }

    async _resultado(g, s, r, foto) {
      const t = this.reloj.ahora();
      const id = U.nuevoId(t);
      const tapada = !!(foto && foto.tapada && this.c.detectar_camara_tapada);
      let estadoFoto = "sin_camara";
      if (!this.c.fotos) estadoFoto = "desactivada";
      else if (tapada) estadoFoto = "tapada";
      let conFoto = false;
      if (this.c.fotos && foto && foto.bytes && !tapada) conFoto = await this.almacen.guardarFoto(id, foto.bytes, t);
      const partida = {
        id,
        t,
        valor: r.valor,
        alarma: r.alarma,
        saturado: !!r.saturado,
        foto: conFoto,
        cobro: s.ref,
        gratis: s.gratis,
        cortes: s.cortes,
        duracion_ms: Math.round(this.reloj.mono() - s.inicio),
      };
      const res = await this.almacen.registrarPartida(partida);
      s.partidaRegistrada = true; // desde aquí la prueba cuenta: no hay reembolso pase lo que pase
      // se apunta antes de enseñarlo: si se va la luz con el resultado en pantalla, no hay prueba gratis
      await this.almacen.anotarCobro(s.ref, { estado: "consumido", partida: id }).catch(() => {});
      if (conFoto) estadoFoto = res.puestoTop ? "top" : "24h";
      const topPct = Ranking.topPorcentaje(res.puesto, res.total);
      const f = T.formatoValor(r.valor, this.c.unidad, this.c.factor_mg_l);
      const msg = T.mensajeResultado({ valor: r.valor, record: res.record, puestoTop: res.puestoTop, topPct, total: res.total });
      s.resultadoMostrado = true;
      this.log.info(`partida ${id}: ${f.texto} ${f.unidad} · puesto ${res.puesto}/${res.total}${res.puestoTop ? " · top " + res.puestoTop : ""}`);
      this._vista("resultado", {
        id,
        valor: f.texto,
        unidad: f.unidad,
        valor_bruto: r.valor,
        saturado: !!r.saturado,
        puesto: res.puesto,
        total: res.total,
        top_pct: topPct,
        puesto_top: res.puestoTop,
        record: res.record,
        foto: conFoto ? this.plat.urlFoto(id) : null,
        foto_estado: estadoFoto,
        titular: msg.titular,
        frase: msg.frase,
        celebracion: msg.celebracion,
        duracion_ms: this.c.resultado_ms,
        guardada: res.guardada,
      });
      if (r.valor >= this.c.umbral_pausa && this.c.pausa_tras_alto_ms > 0) this.noCobrarHasta = this.reloj.mono() + this.c.resultado_ms + this.c.pausa_tras_alto_ms;
      // el sensor a reposo (si no, vuelve solo a los 20 s)
      this.sensor.cambiarEstado(EST.REPOSO).catch(() => {});
      if (res.salen && res.salen.length) this._limpiar();
    }

    /** Algo ha cortado la prueba: aviso, reembolso si no llegó a ver el resultado, y vuelta a empezar. */
    async _fallo(s, e) {
      const codigo = e && e.codigo ? e.codigo : "ERROR";
      if (s.resultadoMostrado || s.partidaRegistrada) {
        this.log.aviso("error tras registrar el resultado (no se reembolsa): " + (e && e.message));
        return;
      }
      this.log.aviso(`prueba anulada (${codigo}): ${e && e.message}`);
      let reembolso = null;
      const r = s.gratis ? Promise.resolve(true) : this.cobro.reembolsar(s.ref, codigo);
      // se espera un poco al reembolso para poder decirlo, pero sin bloquear la máquina
      try {
        reembolso = await Promise.race([r, this.reloj.esperar(6000).then(() => null)]);
      } catch (x) {
        reembolso = false;
      }
      const t = T.aviso(codigo, { gratis: s.gratis, reembolso, segundos: this.segSoplido });
      this._vista("aviso", Object.assign({ tipo: "error", duracion_ms: this.c.aviso_ms }, t));
      try {
        const est = await this.sensor.estado();
        if (est === EST.RESULTADO_LISTO) await this.sensor.cambiarEstado(EST.REPOSO);
      } catch (x) {
        /* el sensor puede estar mal: la salud lo dirá */
      }
      await this.reloj.esperar(this.c.aviso_ms);
    }

    // ---------------------------------------------------------------- cámara
    _encenderCamara() {
      if (!this.c.fotos || !this.camara) return;
      Promise.resolve()
        .then(() => this.camara.encender())
        .catch((e) => this.log.aviso("la cámara no arranca: " + e.message));
    }

    async _apagarCamara() {
      if (!this.camara) return;
      try {
        await this.camara.apagar();
      } catch (e) {
        this.log.aviso("apagar cámara: " + e.message);
      }
    }
  }

  return { Maquina, POR_DEFECTO };
});
