/*
 * ze29a_sim.js — ZE29A simulado a nivel de bytes, para la simulación y las pruebas.
 *
 * Imita la máquina de estados del manual V1.1 (componentes/winsen-ze29a/README.md, apartado 5):
 *   0x31 reposo → (87 32) → 0x32 precalienta 10 s → 0x33 espera soplido (1 min, si no → 0x31)
 *   → 0x34 soplando (N s seguidos; si se corta → 0x35 y a los 3 s → 0x32) → 0x36 calcula 2–5 s
 *   → 0x37 resultado (se lee con 0x86; a los 20 s → 0x31).
 * Cambios permitidos con 0x87: 31→32, 37→31, 37→32. Cualquier otro devuelve 0x02 (fallo).
 *
 * Recibe peticiones de 9 bytes por escribir() y contesta tramas de 9 bytes por el callback de alRecibir(),
 * con retardo, y si se pide, partidas en trozos, con ruido entre medias o con bits cambiados. Así el mismo
 * controlador (nucleo/sensor_ze29a.js) que va en la Pi se prueba contra los fallos de una UART real.
 */
(function (raiz, fabrica) {
  "use strict";
  const enNode = typeof module === "object" && module.exports;
  const dep = (n) => (enNode ? require("../nucleo/" + n) : raiz.ALC[n]);
  const m = fabrica(dep("protocolo_ze29a"), dep("util"));
  if (enNode) module.exports = m;
  else (raiz.ALC_SIM = raiz.ALC_SIM || {}).ze29a = m;
})(typeof globalThis !== "undefined" ? globalThis : this, function (P, U) {
  "use strict";
  const { CMD, EST, TIEMPOS } = P;

  class ZE29ASimulado {
    /**
     * @param {object} o  { reloj, aleatorio?: () => número 0..1 }
     */
    constructor(o) {
      this.reloj = o.reloj;
      this.rnd = o.aleatorio || Math.random;
      this.em = U.crearEmisor();
      this.estado = EST.REPOSO;
      this.grupo = this.reloj.grupo(); // temporizadores del estado actual
      this.segSoplido = 4;
      this.umbrales = [20, 80];
      this.umbralPresion = 8;
      this.valor = 0; // último resultado (mg/100 mL)
      this.alarma = 0;
      // la "persona" que sopla
      this.alcohol = 0; // g/L equivalentes en sangre (lo que da el módulo / 100)
      this.soplando = false;
      // fallos que se pueden provocar desde la simulación
      this.fallos = { desconectado: false, ruido: 0, trocear: 0.3, corromper: 0, retardoMin: 8, retardoMax: 30 };
      this.alRx = null; // callback del lado de la Pi
      this.inicioSoplido = null;
    }

    on(ev, fn) {
      return this.em.on(ev, fn);
    }

    // ---------------------------------------------------------------- lado "Pi" (transporte)
    transporte() {
      return {
        escribir: (bytes) => this._recibirPeticion(bytes),
        alRecibir: (fn) => {
          this.alRx = fn;
        },
        cerrar: () => {
          this.alRx = null;
        },
      };
    }

    _enviar(trama) {
      if (this.fallos.desconectado || !this.alRx) return;
      let bytes = Array.from(trama);
      if (this.fallos.corromper && this.rnd() < this.fallos.corromper) {
        const i = 1 + Math.floor(this.rnd() * 8);
        bytes[i] ^= 1 << Math.floor(this.rnd() * 8);
      }
      if (this.fallos.ruido && this.rnd() < this.fallos.ruido) {
        const basura = [0xff, Math.floor(this.rnd() * 256), 0x00].slice(0, 1 + Math.floor(this.rnd() * 3));
        bytes = basura.concat(bytes);
      }
      const trozos = [];
      if (this.fallos.trocear && this.rnd() < this.fallos.trocear) {
        let i = 0;
        while (i < bytes.length) {
          const n = 1 + Math.floor(this.rnd() * 5);
          trozos.push(bytes.slice(i, i + n));
          i += n;
        }
      } else trozos.push(bytes);
      const f = this.fallos;
      let t = f.retardoMin + this.rnd() * (f.retardoMax - f.retardoMin);
      for (const tr of trozos) {
        this.reloj.temporizador(t, () => {
          if (this.alRx && !this.fallos.desconectado) this.alRx(Uint8Array.from(tr));
        });
        t += 1 + this.rnd() * 3;
      }
    }

    _recibirPeticion(bytes) {
      if (this.fallos.desconectado) return;
      // el módulo real también tiene que encontrar la trama: se usa el mismo criterio que el manual
      const b = Uint8Array.from(bytes);
      if (b.length !== 9 || b[0] !== 0xff || b[1] !== 0x01 || P.checksum(b) !== b[8]) return;
      this.em.emit("peticion", b);
      const cmd = b[2];
      switch (cmd) {
        case CMD.ESTADO:
          return this._enviar(P.respuesta(CMD.ESTADO, this.estado));
        case CMD.RESULTADO: {
          // fuera de 0x37 el manual no dice qué devuelve: el simulado da ceros (la Pi no debe aceptarlo)
          const v = this.estado === EST.RESULTADO_LISTO ? this.valor : 0;
          const a = this.estado === EST.RESULTADO_LISTO ? this.alarma : 0;
          return this._enviar(P.respuesta(CMD.RESULTADO, (v >> 8) & 0xff, v & 0xff, 0, 0, 0, a));
        }
        case CMD.CAMBIAR: {
          const d = b[3];
          const valido =
            (this.estado === EST.REPOSO && d === EST.PRECALENTANDO) ||
            (this.estado === EST.RESULTADO_LISTO && (d === EST.REPOSO || d === EST.PRECALENTANDO));
          if (valido) this._ir(d);
          return this._enviar(P.respuesta(CMD.CAMBIAR, valido ? 0x01 : 0x02));
        }
        case CMD.LEER_SOPLIDO:
          return this._enviar(P.respuesta(CMD.LEER_SOPLIDO, this.segSoplido));
        case CMD.FIJAR_SOPLIDO: {
          const ok = b[3] >= 1 && b[3] <= 10;
          if (ok) this.segSoplido = b[3];
          return this._enviar(P.respuesta(CMD.FIJAR_SOPLIDO, ok ? 1 : 2));
        }
        case CMD.LEER_UMBRALES:
          return this._enviar(P.respuesta(CMD.LEER_UMBRALES, this.umbrales[0], this.umbrales[1]));
        case CMD.FIJAR_UMBRALES: {
          const ok = b[3] >= 15 && b[4] <= 220 && b[4] > b[3];
          if (ok) this.umbrales = [b[3], b[4]];
          return this._enviar(P.respuesta(CMD.FIJAR_UMBRALES, ok ? 1 : 2));
        }
        case CMD.LEER_PRESION:
          return this._enviar(P.respuesta(CMD.LEER_PRESION, this.umbralPresion));
        case CMD.FIJAR_PRESION: {
          const ok = b[3] >= 5 && b[3] <= 200;
          if (ok) this.umbralPresion = b[3];
          return this._enviar(P.respuesta(CMD.FIJAR_PRESION, ok ? 1 : 2));
        }
        default:
          return; // comando desconocido: el simulado no contesta
      }
    }

    // ---------------------------------------------------------------- máquina de estados del módulo
    _ir(e) {
      this.grupo.cancelar();
      this.grupo = this.reloj.grupo();
      this.estado = e;
      this.em.emit("estado", e);
      const g = this.grupo;
      switch (e) {
        case EST.PRECALENTANDO:
          g.temporizador(TIEMPOS.precalentar * (this.escalaPrecalentar || 1), () => this._ir(EST.ESPERANDO_SOPLIDO));
          break;
        case EST.ESPERANDO_SOPLIDO:
          g.temporizador(TIEMPOS.esperaSoplido, () => this._ir(EST.REPOSO));
          if (this.soplando) this._empezarSoplido(); // ya estaba soplando cuando terminó de precalentar
          break;
        case EST.SOPLANDO:
          this.inicioSoplido = this.reloj.mono();
          g.temporizador(this.segSoplido * 1000, () => this._ir(EST.CALCULANDO));
          break;
        case EST.SOPLIDO_CORTADO:
          g.temporizador(TIEMPOS.cortadoAPrecalentar, () => this._ir(EST.PRECALENTANDO));
          break;
        case EST.CALCULANDO: {
          const ms = TIEMPOS.calcularMin + this.rnd() * (TIEMPOS.calcularMax - TIEMPOS.calcularMin);
          g.temporizador(ms, () => {
            this._calcular();
            this._ir(EST.RESULTADO_LISTO);
          });
          break;
        }
        case EST.RESULTADO_LISTO:
          g.temporizador(TIEMPOS.resultadoVigente, () => this._ir(EST.REPOSO));
          break;
        default:
          break;
      }
    }

    _calcular() {
      // ruido de medida: ±0,05 mg/L de exactitud del manual ≈ ±11 mg/100 mL; se usa una gaussiana suave
      const g = (this.rnd() + this.rnd() + this.rnd() - 1.5) * 4;
      let v = Math.round(Math.max(0, this.alcohol * 100 + (this.alcohol > 0 ? g : Math.abs(g) * 0.4)));
      v = Math.min(v, 400);
      this.valor = v;
      this.alarma = v < this.umbrales[0] ? 0 : v < this.umbrales[1] ? 1 : 2;
    }

    _empezarSoplido() {
      if (this.estado === EST.ESPERANDO_SOPLIDO) this._ir(EST.SOPLANDO);
    }

    // ---------------------------------------------------------------- entradas de la simulación
    /** La persona empieza (true) o deja (false) de soplar con caudal suficiente. */
    soplar(si) {
      this.soplando = !!si;
      this.em.emit("soplido", this.soplando);
      if (si) this._empezarSoplido();
      else if (this.estado === EST.SOPLANDO) this._ir(EST.SOPLIDO_CORTADO);
    }

    /** Progreso del soplido actual (0–1) para pintarlo en la simulación. */
    progresoSoplido() {
      if (this.estado !== EST.SOPLANDO || this.inicioSoplido == null) return 0;
      return Math.min(1, (this.reloj.mono() - this.inicioSoplido) / (this.segSoplido * 1000));
    }

    /** Corte de alimentación del módulo: vuelve a reposo y pierde el resultado. */
    reiniciar() {
      this.soplando = false;
      this._ir(EST.REPOSO);
      this.valor = 0;
    }

    destruir() {
      this.grupo.cancelar();
      this.alRx = null;
      this.em.quitarTodos();
    }
  }

  return { ZE29ASimulado };
});
