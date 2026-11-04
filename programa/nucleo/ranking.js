/*
 * ranking.js — ranking histórico de resultados.
 *
 * Memoria constante: no se guarda cada partida en memoria, sino cuántas hay de cada valor (histograma por
 * valor entero en mg/100 mL, 0–500). El puesto de un resultado es 1 + cuántos resultados son MAYORES (los
 * empates comparten puesto). Con un millón de partidas ocupa lo mismo que con diez.
 *
 * El top 10 sí guarda cada entrada (id, valor, fecha y si tiene foto). Entre dos resultados iguales manda el
 * que llegó antes: el nuevo queda detrás.
 *
 * Un resultado solo puede entrar en el top 10 en el momento en que se hace (después solo puede bajar).
 * Por eso la foto se decide al hacerla: si entra en el top 10 se guarda para siempre (mientras siga dentro);
 * si no, se borra a las 24 h. Si más tarde la sacan del top 10, se borra cuando tenga más de 24 h.
 */
(function (raiz, fabrica) {
  "use strict";
  const enNode = typeof module === "object" && module.exports;
  const m = fabrica();
  if (enNode) module.exports = m;
  else (raiz.ALC = raiz.ALC || {}).ranking = m;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const TAM_TOP = 10;

  class Ranking {
    constructor() {
      this.hist = new Map(); // valor → número de partidas
      this.total = 0;
      this.top = []; // [{ id, valor, t, foto }], de mayor a menor
    }

    static desdeJSON(j) {
      const r = new Ranking();
      if (!j || typeof j !== "object") throw new Error("ranking vacío");
      if (!Array.isArray(j.hist) || !Array.isArray(j.top) || !Number.isInteger(j.total)) throw new Error("ranking mal formado");
      let suma = 0;
      for (const par of j.hist) {
        if (!Array.isArray(par) || par.length !== 2) throw new Error("histograma mal formado");
        const [v, c] = par;
        if (!Number.isInteger(v) || !Number.isInteger(c) || v < 0 || c < 1) throw new Error("histograma mal formado");
        r.hist.set(v, c);
        suma += c;
      }
      if (suma !== j.total) throw new Error("el total no cuadra con el histograma");
      for (const e of j.top) {
        if (!e || typeof e.id !== "string" || !Number.isInteger(e.valor) || typeof e.t !== "number") throw new Error("top mal formado");
        r.top.push({ id: e.id, valor: e.valor, t: e.t, foto: !!e.foto });
      }
      r.top = r.top.slice(0, TAM_TOP);
      r.total = j.total;
      return r;
    }

    aJSON() {
      return {
        hist: Array.from(this.hist.entries()).sort((a, b) => a[0] - b[0]),
        total: this.total,
        top: this.top.map((e) => ({ id: e.id, valor: e.valor, t: e.t, foto: e.foto })),
      };
    }

    /** Puesto que tendría un valor: 1 + resultados mayores. */
    puesto(valor) {
      let mayores = 0;
      for (const [v, c] of this.hist) if (v > valor) mayores += c;
      return mayores + 1;
    }

    /**
     * Añade una partida. Devuelve:
     *   puesto, total (ya contando esta), puestoTop (1–10 o null), salen (ids que dejan el top 10),
     *   record (primero y por encima del anterior primero).
     */
    anadir(p) {
      if (!Number.isInteger(p.valor) || p.valor < 0) throw new Error("valor no válido");
      const puesto = this.puesto(p.valor);
      const recordAnterior = this.top.length ? this.top[0].valor : -1;
      this.hist.set(p.valor, (this.hist.get(p.valor) || 0) + 1);
      this.total++;
      let i = this.top.findIndex((e) => e.valor < p.valor);
      if (i === -1) i = this.top.length;
      let puestoTop = null;
      const salen = [];
      if (i < TAM_TOP) {
        this.top.splice(i, 0, { id: p.id, valor: p.valor, t: p.t, foto: !!p.foto });
        puestoTop = i + 1;
        while (this.top.length > TAM_TOP) salen.push(this.top.pop().id);
      }
      return {
        puesto,
        total: this.total,
        puestoTop,
        salen,
        record: puestoTop === 1 && p.valor > recordAnterior && p.valor > 0,
      };
    }

    /** Marca que la foto de una entrada del top ya no existe (se borró a mano o se perdió). */
    quitarFoto(id) {
      const e = this.top.find((x) => x.id === id);
      if (e) e.foto = false;
    }

    enTop(id) {
      return this.top.some((e) => e.id === id);
    }

    /** "Top X %": puesto/total redondeado hacia arriba, mínimo 1. Con pocas partidas no tiene sentido (null). */
    static topPorcentaje(puesto, total, minimo = 20) {
      if (!total || total < minimo) return null;
      return Math.max(1, Math.ceil((puesto / total) * 100));
    }

    /** Media (para los textos de la pantalla). */
    media() {
      if (!this.total) return 0;
      let s = 0;
      for (const [v, c] of this.hist) s += v * c;
      return s / this.total;
    }
  }

  return { Ranking, TAM_TOP };
});
