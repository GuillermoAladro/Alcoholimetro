/*
 * sensor_ze29a.js — controlador del ZE29A sobre cualquier "transporte" de bytes.
 *
 * En la Pi el transporte es la UART (/dev/serial0, ver pi/uart.js). En la simulación es el ZE29A simulado
 * (sim/ze29a_sim.js), que responde byte a byte como el módulo real. El controlador es el mismo en los dos.
 *
 * Transporte: { escribir(Uint8Array) → Promise|void, alRecibir(fn(Uint8Array)), cerrar() }
 *
 * Reglas (fichas del ZE29A, auditorías 6.1-S F13, 6-A A6A-09/10 y hallazgos H06–H10 de la auditoría 1.0):
 * - Una sola petición a la vez (cola). Cada respuesta se empareja por comando; las de otro comando se ignoran.
 * - Sin respuesta en el plazo → reintento; tras N intentos, error "SENSOR_NO_RESPONDE". Nunca se devuelve 0
 *   ni un resultado inventado cuando falta una trama.
 * - Si se pierde el acuse de un cambio de estado, se lee el estado para saber si se cambió (ACK perdido).
 * - El resultado se lee dos veces y tiene que coincidir (el checksum deja pasar ~1 de cada 256 tramas dañadas).
 */
(function (raiz, fabrica) {
  "use strict";
  const enNode = typeof module === "object" && module.exports;
  const dep = (n) => (enNode ? require("./" + n) : raiz.ALC[n]);
  const m = fabrica(dep("protocolo_ze29a"), dep("util"));
  if (enNode) module.exports = m;
  else (raiz.ALC = raiz.ALC || {}).sensor = m;
})(typeof globalThis !== "undefined" ? globalThis : this, function (P, U) {
  "use strict";

  const { CMD, EST } = P;

  class SensorZE29A {
    /**
     * @param {object} o
     * @param {object} o.transporte  ver cabecera
     * @param {object} o.reloj       nucleo/reloj.js
     * @param {object} [o.registro]  registro.hijo("sensor")
     * @param {object} [o.opciones]  { esperaMs, intentos, pausaMs }
     */
    constructor(o) {
      this.t = o.transporte;
      this.reloj = o.reloj;
      this.log = o.registro || { depurar() {}, info() {}, aviso() {}, error() {} };
      const op = o.opciones || {};
      this.esperaMs = op.esperaMs || 300; // una trama son 9,4 ms a 9600; el resto es margen del módulo
      this.intentos = op.intentos || 3;
      this.pausaMs = op.pausaMs || 80;
      this.lector = new P.LectorTramas();
      this.em = U.crearEmisor((ev, e) => this.log.error(`oyente de ${ev}: ${e.message}`));
      this.pendiente = null;
      this.cadena = Promise.resolve();
      this.fallosSeguidos = 0;
      this.estadisticas = { peticiones: 0, sinRespuesta: 0, inesperadas: 0, avisosCampos: 0 };
      this.ultimoEstado = null;
      this.cerrado = false;
      this.t.alRecibir((bytes) => this._recibir(bytes));
    }

    on(ev, fn) {
      return this.em.on(ev, fn);
    }

    _recibir(bytes) {
      let tramas;
      try {
        tramas = this.lector.alimentar(bytes);
      } catch (e) {
        this.log.error("lector de tramas: " + e.message);
        this.lector.reiniciar();
        return;
      }
      for (const f of tramas) {
        this.em.emit("rx", f);
        const p = this.pendiente;
        if (p && f[1] === p.cmd) {
          this.pendiente = null;
          p.ok(f);
        } else {
          this.estadisticas.inesperadas++;
          this.log.depurar("trama inesperada " + U.hexBytes(f));
        }
      }
    }

    /** Ejecuta fn en exclusiva (una petición a la vez por la UART). */
    _enCola(fn) {
      const r = this.cadena.then(fn, fn);
      this.cadena = r.catch(() => {});
      return r;
    }

    _esperarRespuesta(cmd) {
      return new Promise((ok) => {
        const h = this.reloj.temporizador(this.esperaMs, () => {
          if (this.pendiente && this.pendiente.cmd === cmd) this.pendiente = null;
          ok(null);
        });
        this.pendiente = {
          cmd,
          ok: (f) => {
            h.cancelar();
            ok(f);
          },
        };
      });
    }

    /** Petición con reintentos. Devuelve la trama de respuesta o lanza ErrorAlc("SENSOR_NO_RESPONDE"). */
    consultar(cmd, ...datos) {
      return this._enCola(async () => {
        if (this.cerrado) throw new U.ErrorAlc("SENSOR_CERRADO", "sensor cerrado");
        const pet = P.peticion(cmd, ...datos);
        for (let i = 1; i <= this.intentos; i++) {
          this.estadisticas.peticiones++;
          const espera = this._esperarRespuesta(cmd);
          // la escritura no se espera aparte: si la UART se cuelga al escribir, la espera de la respuesta
          // (con su tope) es la que manda y la cola del sensor no se queda bloqueada
          const fallo = (e) => this.log.aviso(`no se pudo escribir en la UART: ${e && e.message}`);
          try {
            this.em.emit("tx", pet);
            Promise.resolve(this.t.escribir(pet)).catch(fallo);
          } catch (e) {
            fallo(e);
          }
          const f = await espera;
          if (f) {
            this.fallosSeguidos = 0;
            return f;
          }
          this.estadisticas.sinRespuesta++;
          if (i < this.intentos) await this.reloj.esperar(this.pausaMs);
        }
        this.fallosSeguidos++;
        throw new U.ErrorAlc("SENSOR_NO_RESPONDE", `el sensor no responde a 0x${cmd.toString(16).toUpperCase()}`);
      });
    }

    /** Estado actual (0x31–0x37). */
    async estado() {
      const f = await this.consultar(CMD.ESTADO);
      const r = P.interpretarEstado(f);
      if (r.extra) {
        this.estadisticas.avisosCampos++;
        if (this.estadisticas.avisosCampos <= 3) this.log.aviso("respuesta de estado con bytes extra: " + U.hexBytes(f));
      }
      if (r.estado !== this.ultimoEstado) {
        this.log.depurar(`estado ${P.NOMBRE_ESTADO[r.estado]} (0x${r.estado.toString(16)})`);
        this.ultimoEstado = r.estado;
      }
      return r.estado;
    }

    /**
     * Cambia de estado (solo 31→32, 37→31 y 37→32 según el manual). Si el acuse se pierde o llega mal,
     * comprueba el estado real antes de dar el cambio por fallido.
     */
    async cambiarEstado(destino) {
      let ok = null;
      try {
        ok = P.interpretarAcuse(await this.consultar(CMD.CAMBIAR, destino), CMD.CAMBIAR);
      } catch (e) {
        if (e.codigo !== "SENSOR_NO_RESPONDE") throw e;
        this.log.aviso(`sin acuse al cambiar a 0x${destino.toString(16)}: compruebo el estado`);
      }
      if (ok) return true;
      const e = await this.estado();
      if (destino === EST.PRECALENTANDO && (e === EST.PRECALENTANDO || e === EST.ESPERANDO_SOPLIDO)) return true;
      if (destino === EST.REPOSO && e === EST.REPOSO) return true;
      return false;
    }

    /**
     * Deja el módulo en un ciclo nuevo (precalentando o esperando soplido) y devuelve el estado de partida.
     * - 0x31 o 0x37 → se manda 0x87 0x32.
     * - 0x32 o 0x33 → queda un ciclo sin soplido (de una prueba anulada): vale tal cual, pero se devuelve
     *   heredado: true porque su minuto de espera ya está corriendo (la máquina no se lo cuenta a la persona).
     * - 0x34, 0x35 o 0x36 → alguien soplaba antes de pagar o queda un ciclo a medias: se espera (máx. 10 s).
     */
    async iniciarCiclo(grupo) {
      const esperar = (ms) => (grupo ? grupo.esperar(ms) : this.reloj.esperar(ms));
      const t0 = this.reloj.mono();
      for (;;) {
        const e = await this.estado();
        if (e === EST.PRECALENTANDO || e === EST.ESPERANDO_SOPLIDO) return { ok: true, estado: e, heredado: true };
        if (e === EST.REPOSO || e === EST.RESULTADO_LISTO) {
          const ok = await this.cambiarEstado(EST.PRECALENTANDO);
          return { ok, estado: e };
        }
        if (this.reloj.mono() - t0 > 10000) return { ok: false, estado: e };
        await esperar(300);
      }
    }

    /**
     * Lee el resultado dos veces; tienen que coincidir (si no, una tercera y gana la mayoría).
     * Solo se llama en 0x37 y tras haber visto soplar en este ciclo (eso lo controla la máquina).
     */
    async leerResultado() {
      const leer = async () => P.interpretarResultado(await this.consultar(CMD.RESULTADO));
      const a = await leer();
      const b = await leer();
      let r = a;
      if (a.valor !== b.valor) {
        const c = await leer();
        if (c.valor === a.valor || c.valor === b.valor) r = c;
        else throw new U.ErrorAlc("RESULTADO_INCOHERENTE", `lecturas distintas: ${a.valor}, ${b.valor}, ${c.valor}`);
        this.log.aviso(`lecturas distintas del resultado (${a.valor} y ${b.valor}); vale ${r.valor}`);
      }
      if (r.extra) this.log.aviso("resultado con campos inesperados (se acepta el valor)");
      return r;
    }

    /** Segundos de soplido configurados en el módulo (1–10) o null. */
    async tiempoSoplido() {
      const f = await this.consultar(CMD.LEER_SOPLIDO);
      const s = f[2];
      return s >= 1 && s <= 10 ? s : null;
    }

    async fijarTiempoSoplido(s) {
      if (!Number.isInteger(s) || s < 1 || s > 10) throw new Error("tiempo de soplido de 1 a 10 s");
      return P.interpretarAcuse(await this.consultar(CMD.FIJAR_SOPLIDO, s), CMD.FIJAR_SOPLIDO);
    }

    /** Umbral de presión (0x92), solo para el registro de arranque (prueba P7.1). */
    async umbralPresion() {
      const f = await this.consultar(CMD.LEER_PRESION);
      return f[2];
    }

    cerrar() {
      this.cerrado = true;
      try {
        if (this.t.cerrar) this.t.cerrar();
      } catch (e) {
        /* nada */
      }
    }
  }

  return { SensorZE29A, EST, CMD };
});
