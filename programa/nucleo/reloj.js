/*
 * reloj.js — todo el tiempo del programa pasa por aquí.
 *
 * - ahora(): hora de pared (ms desde 1970). Solo para fechas y para borrar fotos a las 24 h.
 * - mono():  reloj monotónico (ms). Para medir duraciones: no salta si NTP corrige la hora.
 * - temporizador / intervalo / esperar: como setTimeout, pero agrupables y cancelables.
 *
 * Grupos: cada fase de la máquina crea un grupo y lo cancela al salir. Así no quedan temporizadores
 * "fantasma" de una fase anterior, y una espera en curso (await grupo.esperar(ms)) se aborta con
 * ErrorCancelado en vez de seguir ejecutando código de una prueba que ya terminó.
 *
 * RelojVirtual: para las pruebas automáticas. El tiempo solo avanza cuando la prueba lo pide, de modo que
 * una prueba completa de la máquina (minutos de tiempo real) se ejecuta en milisegundos.
 */
(function (raiz, fabrica) {
  "use strict";
  const enNode = typeof module === "object" && module.exports;
  const m = fabrica();
  if (enNode) module.exports = m;
  else (raiz.ALC = raiz.ALC || {}).reloj = m;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  class ErrorCancelado extends Error {
    constructor(motivo) {
      super(motivo || "cancelado");
      this.codigo = "CANCELADO";
    }
  }

  const ahoraMono = () =>
    typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();

  /** Grupo de temporizadores cancelable. `base` es el reloj que de verdad programa los temporizadores. */
  class Grupo {
    constructor(base, alError) {
      this.base = base;
      this.alError = alError;
      this.vivos = new Set();
      this.esperas = new Set();
      this.cancelado = false;
    }
    _envolver(fn) {
      return () => {
        try {
          fn();
        } catch (e) {
          if (this.alError) this.alError(e);
        }
      };
    }
    temporizador(ms, fn) {
      if (this.cancelado) return { cancelar() {} };
      let h = null;
      const t = {
        cancelar: () => {
          if (h) h.cancelar();
          this.vivos.delete(t);
        },
      };
      h = this.base._programar(ms, () => {
        this.vivos.delete(t);
        this._envolver(fn)();
      });
      this.vivos.add(t);
      return t;
    }
    intervalo(ms, fn) {
      if (this.cancelado) return { cancelar() {} };
      let h = null;
      const t = {
        cancelar: () => {
          if (h) h.cancelar();
          this.vivos.delete(t);
        },
      };
      h = this.base._programarIntervalo(ms, this._envolver(fn));
      this.vivos.add(t);
      return t;
    }
    /** Promesa que se cumple a los `ms`, o se rechaza con ErrorCancelado si el grupo se cancela antes. */
    esperar(ms) {
      if (this.cancelado) return Promise.reject(new ErrorCancelado());
      return new Promise((ok, mal) => {
        const e = { mal };
        e.t = this.temporizador(ms, () => {
          this.esperas.delete(e);
          ok();
        });
        this.esperas.add(e);
      });
    }
    /** Envuelve una promesa: si el grupo se cancela, se rechaza ya (la operación de fondo sigue, pero se ignora). */
    vigilar(promesa) {
      if (this.cancelado) return Promise.reject(new ErrorCancelado());
      return new Promise((ok, mal) => {
        const e = { mal };
        this.esperas.add(e);
        promesa.then(
          (v) => {
            this.esperas.delete(e);
            ok(v);
          },
          (err) => {
            this.esperas.delete(e);
            mal(err);
          }
        );
      });
    }
    /** Lanza ErrorCancelado si el grupo ya está cancelado. Útil en bucles largos. */
    comprobar() {
      if (this.cancelado) throw new ErrorCancelado();
    }
    cancelar(motivo) {
      if (this.cancelado) return;
      this.cancelado = true;
      for (const t of Array.from(this.vivos)) t.cancelar();
      this.vivos.clear();
      for (const e of Array.from(this.esperas)) {
        if (e.t) e.t.cancelar();
        e.mal(new ErrorCancelado(motivo));
      }
      this.esperas.clear();
    }
  }

  class RelojBase {
    constructor() {
      this.desfase = 0; // la simulación puede adelantar la hora de pared (botón "+24 h")
      this.alError = (e) => {
        try {
          console.error("[reloj] error en un temporizador:", e && e.stack ? e.stack : e);
        } catch (x) {
          /* nada */
        }
      };
    }
    grupo() {
      return new Grupo(this, (e) => this.alError(e));
    }
    temporizador(ms, fn) {
      return this.grupo().temporizador(ms, fn);
    }
    intervalo(ms, fn) {
      return this.grupo().intervalo(ms, fn);
    }
    esperar(ms) {
      return new Promise((ok) => this._programar(ms, ok));
    }
    adelantar(ms) {
      this.desfase += ms;
    }
  }

  class RelojReal extends RelojBase {
    ahora() {
      return Date.now() + this.desfase;
    }
    mono() {
      return ahoraMono();
    }
    _programar(ms, fn) {
      const h = setTimeout(fn, Math.max(0, ms | 0));
      return { cancelar: () => clearTimeout(h) };
    }
    _programarIntervalo(ms, fn) {
      const h = setInterval(fn, Math.max(1, ms | 0));
      return { cancelar: () => clearInterval(h) };
    }
  }

  /** Reloj de pruebas: el tiempo solo avanza con avanzar(ms). */
  class RelojVirtual extends RelojBase {
    constructor(paredInicial) {
      super();
      this.t = 0;
      this.pared0 = typeof paredInicial === "number" ? paredInicial : Date.UTC(2026, 9, 26, 20, 0, 0);
      this.cola = [];
      this.sec = 0;
      this.alError = (e) => {
        this.errores = this.errores || [];
        this.errores.push(e);
      };
    }
    ahora() {
      return this.pared0 + this.t + this.desfase;
    }
    mono() {
      return this.t;
    }
    _programar(ms, fn) {
      const e = { cuando: this.t + Math.max(0, ms), sec: this.sec++, fn, vivo: true };
      this.cola.push(e);
      return { cancelar: () => (e.vivo = false) };
    }
    _programarIntervalo(ms, fn) {
      const paso = Math.max(1, ms);
      let h = null;
      let vivo = true;
      const tic = () => {
        if (!vivo) return;
        h = this._programar(paso, tic);
        fn();
      };
      h = this._programar(paso, tic);
      return {
        cancelar: () => {
          vivo = false;
          if (h) h.cancelar();
        },
      };
    }
    async _vaciar() {
      // deja correr las promesas pendientes (microtareas) y las E/S ya terminadas
      for (let i = 0; i < 6; i++) {
        await new Promise((r) => (typeof setImmediate === "function" ? setImmediate(r) : setTimeout(r, 0)));
      }
    }
    /** Avanza `ms` disparando en orden todos los temporizadores que vencen por el camino. */
    async avanzar(ms) {
      const fin = this.t + ms;
      for (;;) {
        await this._vaciar();
        this.cola = this.cola.filter((e) => e.vivo);
        let sig = null;
        for (const e of this.cola) if (e.cuando <= fin && (!sig || e.cuando < sig.cuando || (e.cuando === sig.cuando && e.sec < sig.sec))) sig = e;
        if (!sig) break;
        this.t = Math.max(this.t, sig.cuando);
        sig.vivo = false;
        try {
          sig.fn();
        } catch (err) {
          this.alError(err);
        }
      }
      this.t = fin;
      await this._vaciar();
    }
    /** Avanza a pasos de `paso` ms hasta que `cond()` se cumpla o pasen `max` ms. Devuelve si se cumplió. */
    async hasta(cond, max = 600000, paso = 50) {
      const lim = this.t + max;
      while (this.t < lim) {
        if (cond()) return true;
        await this.avanzar(paso);
      }
      return !!cond();
    }
  }

  return { RelojReal, RelojVirtual, ErrorCancelado, Grupo };
});
