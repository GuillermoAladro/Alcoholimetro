/*
 * fs_memoria.js — sistema de archivos en memoria con la misma interfaz que pi/fs_node.js.
 *
 * Lo usan la simulación (en el navegador puede guardarse en IndexedDB, ver persistir/cargar) y las pruebas.
 * Permite provocar los fallos de una tarjeta SD: llena, solo lectura y corte de luz a mitad de escritura.
 */
(function (raiz, fabrica) {
  "use strict";
  const enNode = typeof module === "object" && module.exports;
  const m = fabrica();
  if (enNode) module.exports = m;
  else (raiz.ALC_SIM = raiz.ALC_SIM || {}).fs = m;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const enc = new TextEncoder();

  function err(codigo, msg) {
    const e = new Error(msg || codigo);
    e.code = codigo;
    e.codigo = codigo;
    return e;
  }

  class FSMemoria {
    constructor(o = {}) {
      this.archivos = new Map(); // ruta → { datos: Uint8Array, mtime }
      this.dirs = new Set([""]);
      this.capacidad = o.capacidad || 32 * 1024 * 1024 * 1024; // 32 GB, como la tarjeta
      this.ocupadoBase = o.ocupadoBase || 6 * 1024 * 1024 * 1024; // sistema operativo
      this.fallos = { llena: false, soloLectura: false, cortarEnProximaEscritura: false };
      this.ahora = o.ahora || (() => Date.now());
      this.alCambiar = null; // la simulación lo usa para guardar en IndexedDB
    }

    _norm(ruta) {
      const r = String(ruta).replace(/^\/+/, "");
      if (r.split("/").some((p) => p === ".." || p === ".")) throw err("EINVAL", "ruta no válida");
      return r;
    }
    _padre(r) {
      const i = r.lastIndexOf("/");
      return i < 0 ? "" : r.slice(0, i);
    }
    _comprobarEscritura(n) {
      if (this.fallos.soloLectura) throw err("EROFS", "sistema de archivos de solo lectura");
      if (this.fallos.llena || this.usado() + n > this.capacidad) throw err("ENOSPC", "no queda espacio");
    }
    usado() {
      let s = this.ocupadoBase;
      for (const a of this.archivos.values()) s += a.datos.length;
      return s;
    }
    _avisar() {
      if (this.alCambiar) {
        try {
          this.alCambiar();
        } catch (e) {
          /* nada */
        }
      }
    }

    async leer(ruta) {
      const a = this.archivos.get(this._norm(ruta));
      return a ? a.datos.slice() : null;
    }

    async escribirAtomico(ruta, datos) {
      const r = this._norm(ruta);
      const b = typeof datos === "string" ? enc.encode(datos) : Uint8Array.from(datos);
      this._comprobarEscritura(b.length);
      if (!this.dirs.has(this._padre(r))) throw err("ENOENT", "no existe la carpeta de " + r);
      if (this.fallos.cortarEnProximaEscritura) {
        // apagón antes del rename: el archivo final queda como estaba (eso es lo que garantiza el rename)
        this.fallos.cortarEnProximaEscritura = false;
        this.archivos.set(r + ".tmp", { datos: b.slice(0, b.length >> 1), mtime: this.ahora() });
        throw err("EIO", "corte de luz simulado");
      }
      this.archivos.set(r, { datos: b, mtime: this.ahora() });
      this.archivos.delete(r + ".tmp");
      this._avisar();
    }

    async anadir(ruta, texto) {
      const r = this._norm(ruta);
      const b = enc.encode(texto);
      this._comprobarEscritura(b.length);
      if (!this.dirs.has(this._padre(r))) throw err("ENOENT", "no existe la carpeta de " + r);
      const prev = this.archivos.get(r);
      let nuevo = b;
      if (this.fallos.cortarEnProximaEscritura) {
        // apagón a mitad de línea: queda media línea al final del archivo
        this.fallos.cortarEnProximaEscritura = false;
        nuevo = b.slice(0, b.length >> 1);
        const u = new Uint8Array((prev ? prev.datos.length : 0) + nuevo.length);
        if (prev) u.set(prev.datos);
        u.set(nuevo, prev ? prev.datos.length : 0);
        this.archivos.set(r, { datos: u, mtime: this.ahora() });
        throw err("EIO", "corte de luz simulado");
      }
      const u = new Uint8Array((prev ? prev.datos.length : 0) + nuevo.length);
      if (prev) u.set(prev.datos);
      u.set(nuevo, prev ? prev.datos.length : 0);
      this.archivos.set(r, { datos: u, mtime: this.ahora() });
      this._avisar();
    }

    async listar(dir) {
      const d = this._norm(dir);
      if (!this.dirs.has(d)) return [];
      const pre = d ? d + "/" : "";
      const out = [];
      for (const [r, a] of this.archivos) {
        if (!r.startsWith(pre)) continue;
        const resto = r.slice(pre.length);
        if (resto.includes("/")) continue;
        out.push({ nombre: resto, tam: a.datos.length, mtime: a.mtime });
      }
      return out.sort((x, y) => (x.nombre < y.nombre ? -1 : 1));
    }

    async borrar(ruta) {
      const r = this._norm(ruta);
      if (this.fallos.soloLectura) throw err("EROFS", "sistema de archivos de solo lectura");
      this.archivos.delete(r);
      this._avisar();
    }

    async crearDir(ruta) {
      const r = this._norm(ruta);
      if (this.fallos.soloLectura && !this.dirs.has(r)) throw err("EROFS", "sistema de archivos de solo lectura");
      const partes = r.split("/");
      for (let i = 1; i <= partes.length; i++) this.dirs.add(partes.slice(0, i).join("/"));
    }

    async libre() {
      if (this.fallos.llena) return 0;
      return Math.max(0, this.capacidad - this.usado());
    }

    /** Copia serializable (para IndexedDB). */
    volcar() {
      return { dirs: Array.from(this.dirs), archivos: Array.from(this.archivos.entries()).map(([r, a]) => [r, a.datos, a.mtime]) };
    }

    cargar(v) {
      if (!v || !Array.isArray(v.archivos)) return false;
      this.dirs = new Set(v.dirs || [""]);
      this.archivos = new Map(v.archivos.map(([r, d, m]) => [r, { datos: d instanceof Uint8Array ? d : new Uint8Array(d), mtime: m }]));
      return true;
    }

    vaciar() {
      this.archivos.clear();
      this.dirs = new Set([""]);
      this._avisar();
    }
  }

  return { FSMemoria };
});
