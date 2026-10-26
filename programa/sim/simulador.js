/*
 * simulador.js — la Raspberry Pi simulada en el navegador.
 *
 * Monta EXACTAMENTE el mismo programa que corre en la Pi (nucleo/: máquina, cobro, sensor, almacén y
 * pantalla) y le enchufa hardware simulado en vez del real:
 *   UART + ZE29A   → sim/ze29a_sim.js (bytes reales del protocolo, con trozos, ruido y fallos)
 *   SumUp + Solo   → sim/sumup_sim.js (la Cloud API y la pantalla del lector)
 *   Camera Module 3 → sim/camara_sim.js (personas inventadas o una foto subida)
 *   tarjeta SD     → sim/fs_memoria.js (guardada en IndexedDB del navegador)
 * La diferencia con la Pi está solo en principal.js (qué hardware se monta) y en kiosco.js (cómo llegan las
 * vistas a la pantalla: allí por SSE, aquí directamente).
 *
 * "Corte de luz" apaga todo de golpe (sin cerrar nada, como en la realidad) y lo vuelve a arrancar con la
 * misma tarjeta y la misma cuenta de SumUp: sirve para ver que un pago a medias no se pierde.
 */
(function (raiz) {
  "use strict";
  const A = raiz.ALC;
  const S = raiz.ALC_SIM;
  const U = A.util;

  const CLAVE_IDB = "alcoholimetro-sim-v1";

  // ---------------------------------------------------------------- IndexedDB (con fallos tolerados)
  function idb() {
    return new Promise((ok) => {
      try {
        const r = indexedDB.open(CLAVE_IDB, 1);
        r.onupgradeneeded = () => r.result.createObjectStore("datos");
        r.onsuccess = () => ok(r.result);
        r.onerror = () => ok(null);
        r.onblocked = () => ok(null);
      } catch (e) {
        ok(null);
      }
    });
  }
  async function idbLeer() {
    const db = await idb();
    if (!db) return null;
    return new Promise((ok) => {
      try {
        const q = db.transaction("datos").objectStore("datos").get("estado");
        q.onsuccess = () => ok(q.result || null);
        q.onerror = () => ok(null);
      } catch (e) {
        ok(null);
      }
    });
  }
  async function idbGuardar(v) {
    const db = await idb();
    if (!db) return false;
    return new Promise((ok) => {
      try {
        const tx = db.transaction("datos", "readwrite");
        tx.objectStore("datos").put(v, "estado");
        tx.oncomplete = () => ok(true);
        tx.onerror = () => ok(false);
      } catch (e) {
        ok(false);
      }
    });
  }

  /** La tarjeta SD vista desde UN arranque: tras un corte de luz, el arranque viejo ya no puede escribir. */
  class FSArranque {
    constructor(fs) {
      this.fs = fs;
      this.muerto = false;
    }
    _vivo() {
      if (this.muerto) {
        const e = new Error("sin alimentación");
        e.code = "EIO";
        throw e;
      }
    }
    async leer(r) {
      this._vivo();
      return this.fs.leer(r);
    }
    async escribirAtomico(r, d) {
      this._vivo();
      return this.fs.escribirAtomico(r, d);
    }
    async anadir(r, t) {
      this._vivo();
      return this.fs.anadir(r, t);
    }
    async listar(d) {
      this._vivo();
      return this.fs.listar(d);
    }
    async borrar(r) {
      this._vivo();
      return this.fs.borrar(r);
    }
    async crearDir(r) {
      this._vivo();
      return this.fs.crearDir(r);
    }
    async libre() {
      this._vivo();
      return this.fs.libre();
    }
  }

  class PiSimulada {
    /**
     * @param {object} o { canvasPantalla, canvasSolo, alVista(v), alLinea(l), alUART(dir, bytes), alSumUp(p),
     *                     alSoplido(si), alSolo(estado), alArchivos() }
     */
    constructor(o) {
      this.o = o;
      this.reloj = new A.reloj.RelojReal();
      this.registro = U.crearRegistro({ max: 400, consola: false, ahora: () => this.reloj.ahora() });
      this.registro.on("linea", (l) => o.alLinea && o.alLinea(l));
      this.fs = new S.fs.FSMemoria({ ahora: () => this.reloj.ahora() });
      this.sim = new S.ze29a.ZE29ASimulado({ reloj: this.reloj });
      this.nube = new S.sumup.NubeSumUp({ reloj: this.reloj, api_key: "sim-clave", merchant_code: "MSIM0001", reader_id: "rdr_solo_sim" });
      this.camara = new S.camara.CamaraSimulada();
      this.pantalla = new A.pantalla.Pantalla(o.canvasPantalla, { fuenteCamara: this.camara, fps: 30 });
      this.solo = new S.pantallaSolo.PantallaSolo(o.canvasSolo);
      this.urls = new Map(); // id de foto → URL blob
      this.urlsTemp = [];
      this.arranque = 0; // sube en cada arranque y en cada corte (invalida las vistas del arranque anterior)
      this.arranques = 0; // arranques de verdad (para el registro)
      this.config = { pausa_tras_alto_ms: 30000 };
      this.guardarPendiente = null;
      this.velocidadPrecalentar = 1;
      // conexiones del hardware simulado con la interfaz
      this.nube.on("pantalla", (p) => {
        this.solo.mostrar(p);
        if (o.alSolo) o.alSolo(p);
      });
      this.sim.on("soplido", (si) => o.alSoplido && o.alSoplido(si));
      this.sim.on("estado", (e) => o.alSensor && o.alSensor(e));
      this.fs.alCambiar = () => this._guardarLuego();
      this.tic = setInterval(() => this.nube.tic(), 1000);
    }

    // ---------------------------------------------------------------- persistencia en el navegador
    _guardarLuego() {
      if (this.o.alArchivos) this.o.alArchivos();
      if (this.guardarPendiente) return;
      this.guardarPendiente = setTimeout(async () => {
        this.guardarPendiente = null;
        await idbGuardar({ fs: this.fs.volcar(), nube: this.nube.volcar(), t: Date.now() });
      }, 800);
    }

    async cargarGuardado() {
      const v = await idbLeer();
      if (v && v.fs && this.fs.cargar(v.fs)) {
        this.nube.cargar(v.nube);
        return true;
      }
      return false;
    }

    // ---------------------------------------------------------------- fotos como URL del navegador
    urlFoto(id) {
      let u = this.urls.get(id);
      if (u) return u;
      const a = this.fs.archivos.get(`fotos/${id}.jpg`);
      if (!a) return null;
      u = URL.createObjectURL(new Blob([a.datos], { type: "image/jpeg" }));
      this.urls.set(id, u);
      return u;
    }
    _soltarUrls(ids) {
      for (const id of ids) {
        const u = this.urls.get(id);
        if (u) URL.revokeObjectURL(u);
        this.urls.delete(id);
      }
    }
    urlFotoBytes(bytes) {
      const u = URL.createObjectURL(new Blob([bytes], { type: "image/jpeg" }));
      this.urlsTemp.push(u);
      while (this.urlsTemp.length > 4) URL.revokeObjectURL(this.urlsTemp.shift());
      return u;
    }

    // ---------------------------------------------------------------- arranque de la "Pi"
    async arrancar() {
      const n = ++this.arranque;
      const reloj = this.reloj;
      const registro = this.registro;
      this.fsA = new FSArranque(this.fs);
      this.almacen = new A.almacen.Almacen({ fs: this.fsA, reloj, registro: registro.hijo("almacen") });
      this.almacen.on("fotos", (ids) => this._soltarUrls(ids));
      this.sim.fallos.desconectado = this.sim.fallos.desconectado || false;
      const transporte = this.sim.transporte();
      this.sensor = new A.sensor.SensorZE29A({ transporte, reloj, registro: registro.hijo("sensor") });
      this.sensor.on("tx", (b) => this.o.alUART && this.o.alUART("tx", b));
      this.sensor.on("rx", (b) => this.o.alUART && this.o.alUART("rx", b));
      // la red vista desde ESTE arranque: tras un corte de luz, el arranque viejo ya no llega a SumUp
      const red = (this.redA = { viva: true });
      const fetchArranque = (url, op) => {
        if (red.viva) return this.nube.fetch(url, op);
        const e = new TypeError("fetch failed");
        e.cause = { code: "ENETDOWN", message: "sin alimentación" };
        return Promise.reject(e);
      };
      this.cliente = new A.sumup.ClienteSumUp({
        fetch: fetchArranque,
        reloj,
        registro: registro.hijo("sumup"),
        config: { api_key: "sim-clave", merchant_code: "MSIM0001", reader_id: "rdr_solo_sim", app_id: "com.alcoholimetro.sim", affiliate_key: "sim-afiliado" },
      });
      this.cliente.on("peticion", (p) => this.o.alSumUp && this.o.alSumUp(p));
      this.cobro = new A.cobro.CobroContinuo({ cliente: this.cliente, almacen: this.almacen, reloj, registro: registro.hijo("cobro") });
      this.maquina = new A.maquina.Maquina({
        reloj,
        registro,
        sensor: this.sensor,
        cobro: this.cobro,
        camara: this.camara,
        almacen: this.almacen,
        config: this.config,
        plataforma: { urlFoto: (id) => this.urlFoto(id), urlFotoBytes: (b) => this.urlFotoBytes(b) },
      });
      this.maquina.on("vista", (v) => {
        if (n !== this.arranque) return; // vistas de un arranque anterior (corte de luz): se ignoran
        this.pantalla.mostrar(v);
        if (this.o.alVista) this.o.alVista(v);
      });
      registro.hijo("principal").info(`arranque ${++this.arranques} · Pi simulada en el navegador`);
      await this.maquina.arrancar();
    }

    /** Corte de luz: todo se apaga de golpe, sin cerrar nada. A los 3 s vuelve la luz. */
    async corteDeLuz() {
      const m = this.maquina;
      const c = this.cobro;
      this.arranque++;
      if (this.fsA) this.fsA.muerto = true;
      if (this.redA) this.redA.viva = false;
      if (c) {
        c.destruido = true;
        if (c.grupo) c.grupo.cancelar();
        if (c.revision) c.revision.cancelar();
      }
      if (m) {
        m.detenido = true;
        m.grupoFijo.cancelar();
        if (m.gFase) m.gFase.cancelar();
        if (m.esperandoPago) m.esperandoPago(null);
      }
      if (this.sensor) this.sensor.cerrar();
      this.sim.reiniciar(); // el sensor también pierde la alimentación
      await this.camara.apagar();
      this.pantalla.mostrar({ fase: "apagada", n: -1, d: {} });
      this.apagada = true;
      this.registro.hijo("principal").aviso("CORTE DE LUZ");
      await new Promise((r) => setTimeout(r, 3000));
      this.apagada = false;
      await this.arrancar();
    }

    /** Llena la tarjeta con partidas de ejemplo (distribución realista) y fotos para el top 10 y las últimas 24 h. */
    async datosDeEjemplo(n = 360) {
      const ahora = this.reloj.ahora();
      let s = 12345;
      const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      const partidas = [];
      for (let i = 0; i < n; i++) {
        const dias = i < 24 ? r() * 0.9 : 1 + r() * 75;
        const t = Math.round(ahora - dias * 86400000 - r() * 3600000);
        // mezcla: muchos 0, la mayoría entre 0,1 y 0,9 g/L, pocos por encima de 1,2
        const u = r();
        const v = u < 0.12 ? 0 : Math.round(Math.min(260, Math.max(1, (u < 0.9 ? 15 + r() * 70 : 60 + r() * r() * 140) + (r() - 0.5) * 16)));
        partidas.push({ t, valor: v });
      }
      partidas.sort((a, b) => a.t - b.t);
      // qué fotos hacen falta: las que acabarán en el top 10 y las de las últimas 24 h
      const top = [...partidas].sort((a, b) => b.valor - a.valor || a.t - b.t).slice(0, 10);
      const conFoto = new Set(top.concat(partidas.filter((p) => ahora - p.t < 86400000)));
      const alm = this.almacen;
      let k = 0;
      for (const p of partidas) {
        const id = U.nuevoId(p.t);
        let foto = false;
        if (conFoto.has(p) && !(k++ % 9 === 4)) {
          const b = await this.camara.retrato(p.t % 100000);
          foto = await alm.guardarFoto(id, b, p.t);
        }
        await alm.registrarPartida({ id, t: p.t, valor: p.valor, alarma: p.valor < 20 ? 0 : p.valor < 80 ? 1 : 2, foto, cobro: "ejemplo", gratis: false, ejemplo: true });
      }
      await alm.limpiar();
    }

    /** Borra la tarjeta simulada y arranca de cero. */
    async vaciar() {
      this._soltarUrls(Array.from(this.urls.keys()));
      await this.corteDeLuzSinArrancar();
      this.fs.vaciar();
      await idbGuardar({ fs: this.fs.volcar(), nube: this.nube.volcar(), t: Date.now() });
      await this.arrancar();
    }

    async corteDeLuzSinArrancar() {
      const m = this.maquina;
      const c = this.cobro;
      this.arranque++;
      if (this.fsA) this.fsA.muerto = true;
      if (this.redA) this.redA.viva = false;
      if (c) {
        c.destruido = true;
        if (c.grupo) c.grupo.cancelar();
        if (c.revision) c.revision.cancelar();
      }
      if (m) {
        m.detenido = true;
        m.grupoFijo.cancelar();
        if (m.gFase) m.gFase.cancelar();
        if (m.esperandoPago) m.esperandoPago(null);
      }
      if (this.sensor) this.sensor.cerrar();
      this.sim.reiniciar();
      await this.camara.apagar();
    }

    /** Lista de archivos de la tarjeta (para el panel). */
    archivos() {
      const out = [];
      const ahora = this.reloj.ahora();
      for (const [ruta, a] of this.fs.archivos) {
        const m = /^fotos\/(.+)\.jpg$/.exec(ruta);
        let nota = "";
        if (m && this.almacen) {
          if (this.almacen.ranking.enTop(m[1])) nota = "top 10: se queda";
          else {
            const t = this.almacen.fotos.get(m[1]);
            if (t) {
              const q = Math.max(0, 86400000 - (ahora - t));
              nota = `se borra en ${Math.floor(q / 3600000)} h ${Math.floor((q % 3600000) / 60000)} min`;
            }
          }
        }
        out.push({ ruta, tam: a.datos.length, mtime: a.mtime, nota });
      }
      return out.sort((x, y) => (x.ruta < y.ruta ? -1 : 1));
    }
  }

  (raiz.ALC_SIM = raiz.ALC_SIM || {}).PiSimulada = PiSimulada;
})(typeof globalThis !== "undefined" ? globalThis : this);
