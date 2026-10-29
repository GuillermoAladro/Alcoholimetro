/*
 * util.js — utilidades comunes del alcoholímetro.
 *
 * Este archivo, como todos los de nucleo/, funciona igual en la Raspberry Pi (Node.js) y en el navegador
 * (pantalla del kiosco y simulación). En Node se carga con require(); en el navegador queda en window.ALC.util.
 * No usa ninguna biblioteca externa.
 */
(function (raiz, fabrica) {
  "use strict";
  const enNode = typeof module === "object" && module.exports;
  const m = fabrica();
  if (enNode) module.exports = m;
  else (raiz.ALC = raiz.ALC || {}).util = m;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  // ------------------------------------------------------------------ eventos
  /** Emisor de eventos mínimo. Un oyente que lanza una excepción no rompe a los demás ni al emisor. */
  function crearEmisor(alFallarOyente) {
    const oyentes = new Map();
    return {
      on(ev, fn) {
        if (!oyentes.has(ev)) oyentes.set(ev, new Set());
        oyentes.get(ev).add(fn);
        return () => this.off(ev, fn);
      },
      off(ev, fn) {
        const s = oyentes.get(ev);
        if (s) s.delete(fn);
      },
      emit(ev, ...args) {
        const s = oyentes.get(ev);
        if (!s) return;
        for (const fn of Array.from(s)) {
          try {
            fn(...args);
          } catch (e) {
            if (alFallarOyente) alFallarOyente(ev, e);
          }
        }
      },
      quitarTodos() {
        oyentes.clear();
      },
    };
  }

  // ------------------------------------------------------------------ registro (log)
  /**
   * Registro con memoria limitada (anillo de `max` líneas). Nunca crece sin límite.
   * En la Pi también escribe por consola: systemd lo guarda en el journal (en RAM, ver sistema/).
   */
  function crearRegistro(op = {}) {
    const max = op.max || 400;
    const lineas = [];
    const em = crearEmisor();
    const ahora = op.ahora || (() => Date.now());
    const consola = op.consola !== false;
    let silenciarDepurar = op.depurar !== true;

    function texto(v) {
      if (v === undefined) return "";
      if (v instanceof Error) return v.message;
      if (typeof v === "string") return v;
      try {
        const s = JSON.stringify(v);
        return s.length > 500 ? s.slice(0, 500) + "…" : s;
      } catch (e) {
        return String(v);
      }
    }

    function escribir(nivel, origen, msg, datos) {
      if (nivel === "depurar" && silenciarDepurar) return;
      const l = { t: ahora(), nivel, origen, texto: texto(msg) };
      if (datos !== undefined) l.datos = texto(datos);
      lineas.push(l);
      if (lineas.length > max) lineas.splice(0, lineas.length - max);
      if (consola) {
        const s = `[${nivel}] ${origen}: ${l.texto}${l.datos ? " · " + l.datos : ""}`;
        try {
          if (nivel === "error") console.error(s);
          else console.log(s);
        } catch (e) {
          /* consola cerrada: no importa */
        }
      }
      em.emit("linea", l);
    }

    function hijo(origen) {
      return {
        depurar: (m, d) => escribir("depurar", origen, m, d),
        info: (m, d) => escribir("info", origen, m, d),
        aviso: (m, d) => escribir("aviso", origen, m, d),
        error: (m, d) => escribir("error", origen, m, d),
      };
    }

    return {
      hijo,
      lineas: () => lineas.slice(),
      on: (ev, fn) => em.on(ev, fn),
      depuracion(si) {
        silenciarDepurar = !si;
      },
    };
  }

  // ------------------------------------------------------------------ números y textos en español
  /** 0.4123 → "0,41". Nunca devuelve "NaN": si el valor no es un número, devuelve "—". */
  function numES(x, dec = 2) {
    if (typeof x !== "number" || !isFinite(x)) return "—";
    return x.toFixed(dec).replace(".", ",");
  }

  /** Enteros con separador de miles a la española (10.000; 1234 se deja junto). */
  function enteroES(n) {
    if (typeof n !== "number" || !isFinite(n)) return "—";
    const s = String(Math.round(Math.abs(n)));
    const signo = n < 0 ? "−" : "";
    if (s.length <= 4) return signo + s;
    return signo + s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  /** Céntimos → "2,00 €". */
  function euros(centimos) {
    return numES(centimos / 100, 2) + " €";
  }

  const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];

  /** Fecha corta y cercana: "hoy", "ayer", "hace 3 días", "12 oct", "12 oct 2025". */
  function fechaCorta(t, ahora) {
    if (typeof t !== "number" || !isFinite(t)) return "";
    const d = new Date(t);
    const h = new Date(ahora);
    const dia = (x) => Math.floor((Date.UTC(x.getFullYear(), x.getMonth(), x.getDate())) / 86400000);
    const dif = dia(h) - dia(d);
    if (dif === 0) return "hoy";
    if (dif === 1) return "ayer";
    if (dif > 1 && dif < 7) return `hace ${dif} días`;
    const base = `${d.getDate()} ${MESES[d.getMonth()]}`;
    return d.getFullYear() === h.getFullYear() ? base : `${base} ${d.getFullYear()}`;
  }

  /** "14:05" */
  function hora(t) {
    const d = new Date(t);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  // ------------------------------------------------------------------ identificadores
  function hex(n) {
    let s = "";
    const c = typeof crypto !== "undefined" && crypto.getRandomValues ? crypto : null;
    if (c) {
      const b = new Uint8Array(Math.ceil(n / 2));
      c.getRandomValues(b);
      for (const x of b) s += x.toString(16).padStart(2, "0");
    } else {
      for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 16).toString(16);
    }
    return s.slice(0, n);
  }

  /**
   * Identificador único y ordenable por tiempo: "20261026-143512-a3f9c1".
   * Sirve de nombre de archivo (solo [0-9a-f-]). Dos pruebas en el mismo segundo no chocan (6 hex aleatorios).
   */
  function nuevoId(t) {
    const d = new Date(typeof t === "number" ? t : Date.now());
    const p = (n, l = 2) => String(n).padStart(l, "0");
    return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}-${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}-${hex(6)}`;
  }

  const RE_ID = /^\d{8}-\d{6}-[0-9a-f]{6}$/;
  const esId = (s) => typeof s === "string" && RE_ID.test(s);

  /** Instante (ms) codificado en un id, o null. */
  function instanteDeId(id) {
    if (!esId(id)) return null;
    const m = /^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/.exec(id);
    return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
  }

  // ------------------------------------------------------------------ varios
  const limitar = (x, a, b) => Math.min(b, Math.max(a, x));

  function jsonSeguro(texto) {
    try {
      return JSON.parse(texto);
    } catch (e) {
      return undefined;
    }
  }

  /** Bytes → "FF 01 85 00 …" para el registro de la UART. */
  function hexBytes(b) {
    return Array.from(b, (x) => x.toString(16).toUpperCase().padStart(2, "0")).join(" ");
  }

  /** Error con código, para distinguir causas sin comparar textos. */
  class ErrorAlc extends Error {
    constructor(codigo, mensaje, extra) {
      super(mensaje || codigo);
      this.codigo = codigo;
      if (extra) Object.assign(this, extra);
    }
  }

  return {
    crearEmisor,
    crearRegistro,
    numES,
    enteroES,
    euros,
    fechaCorta,
    hora,
    nuevoId,
    esId,
    instanteDeId,
    limitar,
    jsonSeguro,
    hexBytes,
    hex,
    ErrorAlc,
  };
});
