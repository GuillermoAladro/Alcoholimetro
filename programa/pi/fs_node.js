/*
 * fs_node.js — sistema de archivos real para nucleo/almacen.js, a prueba de cortes de luz.
 *
 * - escribirAtomico: escribe en "<ruta>.tmp", fsync, renombra encima del original y fsync de la carpeta.
 *   Tras un apagón queda el archivo viejo entero o el nuevo entero, nunca uno a medias (H21–H22).
 * - anadir: abre en modo "a", escribe la línea y hace fsync antes de volver.
 * - Permisos: archivos 0600 y carpetas 0700 (H23: antes quedaban en 0644). Los datos son personales.
 */
"use strict";
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

class FSNode {
  constructor(base) {
    this.base = path.resolve(base);
  }

  _ruta(r) {
    const p = path.resolve(this.base, String(r).replace(/^\/+/, ""));
    if (p !== this.base && !p.startsWith(this.base + path.sep)) {
      const e = new Error("ruta fuera de la carpeta de datos: " + r);
      e.code = "EINVAL";
      throw e;
    }
    return p;
  }

  async leer(r) {
    try {
      return new Uint8Array(await fsp.readFile(this._ruta(r)));
    } catch (e) {
      if (e.code === "ENOENT") return null;
      throw e;
    }
  }

  async _fsyncDir(dir) {
    let fh = null;
    try {
      fh = await fsp.open(dir, "r");
      await fh.sync();
    } catch (e) {
      // algunos sistemas no permiten fsync de carpetas: no es grave
    } finally {
      if (fh) await fh.close().catch(() => {});
    }
  }

  async escribirAtomico(r, datos) {
    const destino = this._ruta(r);
    const tmp = destino + ".tmp";
    const fh = await fsp.open(tmp, "w", 0o600);
    try {
      await fh.writeFile(datos);
      await fh.sync();
    } finally {
      await fh.close();
    }
    await fsp.rename(tmp, destino);
    await this._fsyncDir(path.dirname(destino));
  }

  async anadir(r, texto) {
    const destino = this._ruta(r);
    const fh = await fsp.open(destino, "a", 0o600);
    try {
      await fh.write(texto);
      await fh.sync();
    } finally {
      await fh.close();
    }
  }

  async listar(dir) {
    const d = this._ruta(dir);
    let nombres;
    try {
      nombres = await fsp.readdir(d);
    } catch (e) {
      if (e.code === "ENOENT") return [];
      throw e;
    }
    const out = [];
    for (const n of nombres) {
      try {
        const st = await fsp.stat(path.join(d, n));
        if (st.isFile()) out.push({ nombre: n, tam: st.size, mtime: st.mtimeMs });
      } catch (e) {
        /* borrado entre medias */
      }
    }
    return out.sort((a, b) => (a.nombre < b.nombre ? -1 : 1));
  }

  async borrar(r) {
    try {
      await fsp.unlink(this._ruta(r));
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
  }

  async crearDir(r) {
    await fsp.mkdir(this._ruta(r), { recursive: true, mode: 0o700 });
  }

  async libre() {
    if (typeof fsp.statfs !== "function") return null;
    const s = await fsp.statfs(this.base);
    return s.bavail * s.bsize;
  }

  /** Ruta real de un archivo (para servir fotos con streams en el servidor). */
  rutaReal(r) {
    return this._ruta(r);
  }
}

module.exports = { FSNode };
