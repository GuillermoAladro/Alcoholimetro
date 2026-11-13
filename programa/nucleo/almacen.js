/*
 * almacen.js — lo que se guarda en la tarjeta: ranking, partidas, fotos y diario de cobros.
 *
 * Carpeta de datos (en la Pi, /var/lib/alcoholimetro; ver sistema/):
 *   estado.json            ranking (histograma + top 10) y fotos con fecha. Se reescribe de forma atómica.
 *   partidas/AAAA-MM.jsonl una línea por prueba, solo se añade. Es la fuente de verdad: si estado.json se
 *                          pierde o no cuadra, se reconstruye desde aquí.
 *   fotos/<id>.jpg         fotos. Las del top 10 se quedan; las demás se borran a las 24 h.
 *   cobros.jsonl           diario de cobros (abriendo → abierto → pagado → consumido / reembolsado …).
 *
 * Cortes de luz (auditoría 1.0, H21–H22; prueba P9.7): toda escritura es "escribir aparte + fsync + renombrar"
 * o "añadir línea + fsync". Cada línea de un .jsonl se escribe con el salto de línea DELANTE: si un apagón dejó
 * media línea al final, la siguiente empieza en una línea nueva y no se pierde; la media línea se ignora al leer.
 *
 * El sistema de archivos se inyecta (fs): pi/fs_node.js en la Pi, sim/fs_memoria.js en la simulación.
 *   fs.leer(ruta) → Uint8Array|null · fs.escribirAtomico(ruta, datos) · fs.anadir(ruta, texto)
 *   fs.listar(dir) → [{nombre, tam, mtime}] · fs.borrar(ruta) · fs.crearDir(ruta) · fs.libre() → bytes|null
 */
(function (raiz, fabrica) {
  "use strict";
  const enNode = typeof module === "object" && module.exports;
  const dep = (n) => (enNode ? require("./" + n) : raiz.ALC[n]);
  const m = fabrica(dep("ranking"), dep("util"));
  if (enNode) module.exports = m;
  else (raiz.ALC = raiz.ALC || {}).almacen = m;
})(typeof globalThis !== "undefined" ? globalThis : this, function (R, U) {
  "use strict";
  const { Ranking } = R;

  const DIA = 24 * 3600 * 1000;
  const HORA_MINIMA_VALIDA = Date.UTC(2026, 0, 1); // si el reloj dice antes, no hay hora de red: no se borra nada
  const FINALES = new Set(["consumido", "cancelado", "fallido", "caducado", "reembolsado", "anulado", "reembolso_imposible", "reembolso_manual", "sin_resolver"]);
  const PARA_REVISAR = new Set(["reembolso_imposible", "reembolso_manual", "sin_resolver"]); // un técnico tiene que mirarlos
  const RE_FOTO = /^(\d{8}-\d{6}-[0-9a-f]{6})\.jpg$/;

  const dec = new TextDecoder();
  const enc = new TextEncoder();

  class Almacen {
    constructor(o) {
      this.fs = o.fs;
      this.reloj = o.reloj;
      this.log = o.registro || { depurar() {}, info() {}, aviso() {}, error() {} };
      const c = o.config || {};
      this.retencionMs = c.retencionFotosMs || DIA;
      this.minLibre = c.minLibreBytes != null ? c.minLibreBytes : 200 * 1024 * 1024;
      this.maxCobrosBytes = c.maxCobrosBytes || 256 * 1024;
      this.ranking = new Ranking();
      this.fotos = new Map(); // id → instante de la foto (todas las fotos guardadas que no se han borrado)
      this.ultimo = null; // id de la última partida guardada
      this.cobros = new Map(); // ref → estado acumulado
      this.conPartida = new Set(); // refs de cobro cuya partida ya está guardada (las de este arranque)
      this.tamCobros = 0;
      this.errorEscritura = null; // { codigo, mensaje, t }
      this.cadena = Promise.resolve();
      this.em = U.crearEmisor();
    }

    on(ev, fn) {
      return this.em.on(ev, fn);
    }

    /** Ejecuta las operaciones de una en una (las escrituras nunca se cruzan). */
    _enCola(fn) {
      const r = this.cadena.then(fn, fn);
      this.cadena = r.catch(() => {});
      return r;
    }

    _fallo(donde, e) {
      this.errorEscritura = { codigo: e.codigo || e.code || "E", mensaje: `${donde}: ${e.message}`, t: this.reloj.mono() };
      this.log.error(`no se pudo escribir (${donde}): ${e.message}`);
      this.em.emit("salud");
    }

    async _leerTexto(ruta) {
      const b = await this.fs.leer(ruta);
      return b ? dec.decode(b) : null;
    }

    static _lineas(texto) {
      const out = [];
      if (!texto) return out;
      for (const l of texto.split("\n")) {
        if (!l.trim()) continue;
        const o = U.jsonSeguro(l);
        if (o && typeof o === "object") out.push(o); // una línea cortada por un apagón se ignora
      }
      return out;
    }

    // ---------------------------------------------------------------- apertura y reconstrucción
    async abrir() {
      return this._enCola(async () => {
        for (const d of ["fotos", "partidas"]) {
          try {
            await this.fs.crearDir(d);
          } catch (e) {
            this._fallo("carpeta " + d, e); // si ya existe se puede leer igual; si no, la salud lo dirá
          }
        }
        let bien = false;
        try {
          const t = await this._leerTexto("estado.json");
          if (t != null) {
            const j = JSON.parse(t);
            if (j.version !== 1) throw new Error("versión desconocida");
            this.ranking = Ranking.desdeJSON(j.ranking);
            this.ultimo = typeof j.ultimo === "string" ? j.ultimo : null;
            this.fotos = new Map((Array.isArray(j.fotos) ? j.fotos : []).filter((x) => Array.isArray(x) && U.esId(x[0]) && typeof x[1] === "number"));
            bien = true;
          }
        } catch (e) {
          this.log.aviso("estado.json no vale (" + e.message + "): se reconstruye desde las partidas");
        }
        const ultimaLinea = await this._ultimaPartida();
        if (!bien || (ultimaLinea && ultimaLinea.id !== this.ultimo)) {
          if (bien) this.log.aviso("estado.json no incluye la última partida: se reconstruye");
          await this._reconstruir();
        }
        await this._sincronizarFotos();
        await this._limpiarTemporales();
        await this._cargarCobros();
        this.log.info(`datos: ${this.ranking.total} partidas, ${this.ranking.top.length} en el top, ${this.fotos.size} fotos`);
        return true;
      });
    }

    async _archivosPartidas() {
      const l = await this.fs.listar("partidas");
      return l.map((x) => x.nombre).filter((n) => /^\d{4}-\d{2}\.jsonl$/.test(n)).sort();
    }

    async _ultimaPartida() {
      const archivos = await this._archivosPartidas();
      for (let i = archivos.length - 1; i >= 0; i--) {
        const ls = Almacen._lineas(await this._leerTexto("partidas/" + archivos[i]));
        if (ls.length) return ls[ls.length - 1];
      }
      return null;
    }

    async _reconstruir() {
      const r = new Ranking();
      let ultimo = null;
      for (const a of await this._archivosPartidas()) {
        for (const p of Almacen._lineas(await this._leerTexto("partidas/" + a))) {
          if (!U.esId(p.id) || !Number.isInteger(p.valor) || p.valor < 0 || typeof p.t !== "number") continue;
          r.anadir({ id: p.id, valor: p.valor, t: p.t, foto: !!p.foto });
          ultimo = p.id;
        }
      }
      this.ranking = r;
      this.ultimo = ultimo;
      this.fotos = new Map();
      try {
        await this._guardarEstado();
      } catch (e) {
        // tarjeta de solo lectura: se sigue con el ranking en memoria (la salud dirá que no se puede cobrar)
        this._fallo("estado", e);
      }
      this.log.info(`reconstruido: ${r.total} partidas`);
    }

    /** Cuadra la lista de fotos con lo que hay de verdad en la carpeta. */
    async _sincronizarFotos() {
      const enDisco = new Set();
      for (const f of await this.fs.listar("fotos")) {
        const m = RE_FOTO.exec(f.nombre);
        if (!m) continue;
        enDisco.add(m[1]);
        if (!this.fotos.has(m[1])) this.fotos.set(m[1], U.instanteDeId(m[1]) || f.mtime || this.reloj.ahora());
      }
      for (const id of Array.from(this.fotos.keys())) if (!enDisco.has(id)) this.fotos.delete(id);
      for (const e of this.ranking.top) if (e.foto && !enDisco.has(e.id)) e.foto = false;
    }

    /** Restos de escrituras atómicas cortadas por un apagón o por la tarjeta llena (*.tmp). */
    async _limpiarTemporales() {
      for (const dir of ["", "fotos"]) {
        let l = [];
        try {
          l = await this.fs.listar(dir);
        } catch (e) {
          l = [];
        }
        for (const f of l) {
          if (!/\.tmp$/.test(f.nombre)) continue;
          try {
            await this.fs.borrar(dir ? dir + "/" + f.nombre : f.nombre);
            this.log.info("borrado resto de escritura: " + f.nombre);
          } catch (e) {
            /* se intentará en el siguiente arranque */
          }
        }
      }
    }

    // ---------------------------------------------------------------- partidas y fotos
    async _guardarEstado() {
      const j = {
        version: 1,
        guardado: this.reloj.ahora(),
        ultimo: this.ultimo,
        ranking: this.ranking.aJSON(),
        fotos: Array.from(this.fotos.entries()),
      };
      await this.fs.escribirAtomico("estado.json", enc.encode(JSON.stringify(j)));
    }

    /** Guarda la foto (JPEG). Devuelve true si quedó guardada. */
    async guardarFoto(id, bytes, t) {
      return this._enCola(async () => {
        if (!U.esId(id)) throw new Error("id de foto no válido");
        try {
          await this.fs.escribirAtomico(`fotos/${id}.jpg`, bytes);
          this.fotos.set(id, t);
          return true;
        } catch (e) {
          this._fallo("foto", e);
          return false;
        }
      });
    }

    async leerFoto(id) {
      if (!U.esId(id)) return null;
      try {
        return await this.fs.leer(`fotos/${id}.jpg`);
      } catch (e) {
        return null;
      }
    }

    tieneFoto(id) {
      return this.fotos.has(id);
    }

    /**
     * Guarda una partida y actualiza el ranking. Devuelve el resultado de Ranking.anadir, y además
     * `guardada` (false si no se pudo escribir: el ranking en memoria sí se actualiza para la pantalla).
     */
    async registrarPartida(p) {
      return this._enCola(async () => {
        const d = new Date(p.t);
        const mes = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
        let guardada = true;
        try {
          await this.fs.anadir(`partidas/${mes}.jsonl`, "\n" + JSON.stringify(p));
          if (p.cobro) {
            this.conPartida.add(p.cobro);
            while (this.conPartida.size > 2000) this.conPartida.delete(this.conPartida.values().next().value);
          }
        } catch (e) {
          guardada = false;
          this._fallo("partida", e);
        }
        const res = this.ranking.anadir({ id: p.id, valor: p.valor, t: p.t, foto: !!p.foto && this.fotos.has(p.id) });
        if (guardada) this.ultimo = p.id;
        try {
          await this._guardarEstado();
        } catch (e) {
          guardada = false;
          this._fallo("estado", e);
        }
        res.guardada = guardada;
        this.em.emit("ranking");
        return res;
      });
    }

    /**
     * Borra las fotos que no están en el top 10 y tienen 24 h o más. Si queda poco espacio, borra también
     * las más antiguas fuera del top aunque no tengan 24 h. Devuelve los ids borrados.
     */
    async limpiar() {
      return this._enCola(async () => {
        const ahora = this.reloj.ahora();
        const borrar = [];
        if (ahora >= HORA_MINIMA_VALIDA) {
          for (const [id, t] of this.fotos) {
            if (this.ranking.enTop(id)) continue;
            if (ahora - t >= this.retencionMs) borrar.push(id);
          }
        } else {
          this.log.aviso("el reloj no está en hora: no se borran fotos hasta que lo esté");
        }
        let libre = null;
        try {
          libre = await this.fs.libre();
        } catch (e) {
          libre = null;
        }
        if (libre != null && libre < this.minLibre) {
          const candidatas = Array.from(this.fotos.entries())
            .filter(([id]) => !this.ranking.enTop(id) && !borrar.includes(id))
            .sort((a, b) => a[1] - b[1]);
          const extra = candidatas.slice(0, Math.max(1, Math.ceil(candidatas.length / 2))).map((x) => x[0]);
          if (extra.length) this.log.aviso(`poco espacio (${Math.round(libre / 1048576)} MB): se borran ${extra.length} fotos antes de tiempo`);
          borrar.push(...extra);
        }
        const hechas = [];
        for (const id of borrar) {
          try {
            await this.fs.borrar(`fotos/${id}.jpg`);
            this.fotos.delete(id);
            hechas.push(id);
          } catch (e) {
            this.log.aviso(`no se pudo borrar la foto ${id}: ${e.message}`);
          }
        }
        // las del top cuyo archivo ya no existe (borrado a mano) dejan de anunciar foto
        if (hechas.length) {
          try {
            await this._guardarEstado();
          } catch (e) {
            this._fallo("estado", e);
          }
          this.log.info(`fotos borradas: ${hechas.length}`);
          this.em.emit("fotos", hechas);
        }
        return hechas;
      });
    }

    /**
     * ¿Se puede cobrar? Comprueba que se puede escribir (archivo de prueba) y que hay espacio.
     * Si hubo un error de escritura, lo vuelve a intentar: una tarjeta que se recupera vuelve a servir sola.
     */
    async salud() {
      return this._enCola(async () => {
        let libre = null;
        try {
          libre = await this.fs.libre();
        } catch (e) {
          libre = null;
        }
        if (libre != null && libre < this.minLibre / 4) return { ok: false, motivo: "no queda espacio en la tarjeta", libre };
        if (this.errorEscritura) {
          try {
            await this.fs.escribirAtomico("sonda.tmp", enc.encode(String(this.reloj.ahora())));
            await this.fs.borrar("sonda.tmp");
            this.log.info("la tarjeta vuelve a escribir bien");
            this.errorEscritura = null;
          } catch (e) {
            return { ok: false, motivo: "no se puede escribir en la tarjeta", libre };
          }
        }
        return { ok: true, libre };
      });
    }

    // ---------------------------------------------------------------- diario de cobros
    async _cargarCobros() {
      this.cobros = new Map();
      let texto = null;
      try {
        texto = await this._leerTexto("cobros.jsonl");
      } catch (e) {
        texto = null;
      }
      for (const l of Almacen._lineas(texto)) {
        if (typeof l.ref !== "string") continue;
        this.cobros.set(l.ref, Object.assign(this.cobros.get(l.ref) || {}, l));
      }
      this.tamCobros = texto ? texto.length : 0;
    }

    /**
     * Apunta un cambio de un cobro (se añade una línea con fsync). Lanza si no se puede escribir: sin diario
     * no se debe cobrar, porque tras un corte no se sabría si alguien pagó. Aunque falle, el cambio queda en
     * memoria: así este arranque no repite lo que ya hizo (un reembolso hecho, una prueba consumida…), y tras
     * un apagón el diario del disco lleva a repetir solo pasos que se pueden repetir sin daño.
     */
    async anotarCobro(ref, cambios) {
      return this._enCola(async () => {
        const linea = Object.assign({ ref, t: this.reloj.ahora() }, cambios);
        const texto = "\n" + JSON.stringify(linea);
        this.cobros.set(ref, Object.assign(this.cobros.get(ref) || {}, linea));
        try {
          await this.fs.anadir("cobros.jsonl", texto);
        } catch (e) {
          this._fallo("cobros", e);
          throw e;
        }
        this.tamCobros += texto.length;
        if (this.tamCobros > this.maxCobrosBytes) await this._compactarCobros();
        return this.cobros.get(ref);
      });
    }

    async _compactarCobros() {
      const todos = Array.from(this.cobros.values()).sort((a, b) => a.t - b.t);
      const abiertos = todos.filter((c) => !FINALES.has(c.estado));
      // los que tiene que mirar un técnico: hasta 200 de cada tipo, de los últimos 90 días
      const revisar = [];
      for (const est of PARA_REVISAR) revisar.push(...todos.filter((c) => c.estado === est && this.reloj.ahora() - (c.t || 0) < 90 * DIA).slice(-200));
      const finales = todos.filter((c) => FINALES.has(c.estado) && !PARA_REVISAR.has(c.estado)).slice(-100);
      const quedan = finales.concat(revisar, abiertos).sort((a, b) => a.t - b.t);
      const texto = quedan.map((c) => JSON.stringify(c)).join("\n") + "\n";
      try {
        await this.fs.escribirAtomico("cobros.jsonl", enc.encode(texto));
        this.cobros = new Map(quedan.map((c) => [c.ref, c]));
        this.tamCobros = texto.length;
        this.log.info(`diario de cobros compactado: ${quedan.length} cobros`);
      } catch (e) {
        this._fallo("compactar cobros", e);
      }
    }

    /** Cobros que no están cerrados (para resolverlos al arrancar). */
    cobrosAbiertos() {
      return Array.from(this.cobros.values()).filter((c) => !FINALES.has(c.estado));
    }

    cobro(ref) {
      return this.cobros.get(ref) || null;
    }

    /** Cobros que un técnico tiene que revisar en SumUp (reembolsos imposibles, sin resolver…). */
    cobrosParaRevisar() {
      return Array.from(this.cobros.values()).filter((c) => PARA_REVISAR.has(c.estado));
    }

    /**
     * ¿Hay una partida guardada con este cobro? (la persona vio su resultado: ni crédito ni reembolso).
     * Mira los archivos de partidas desde el mes del cobro (su ref lleva la fecha) hasta ahora (máx. 3).
     */
    async partidaDeCobro(ref) {
      if (this.conPartida.has(ref)) return true;
      const t0 = U.instanteDeId(ref);
      if (t0 == null) return false;
      const mes = (t) => {
        const d = new Date(t);
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      };
      const desde = mes(t0);
      const archivos = (await this._archivosPartidas()).filter((a) => a.slice(0, 7) >= desde).slice(0, 3);
      const aguja = `"cobro":${JSON.stringify(ref)}`;
      for (const a of archivos) {
        const texto = await this._leerTexto("partidas/" + a);
        if (!texto || !texto.includes(aguja)) continue;
        for (const p of Almacen._lineas(texto)) {
          if (p.cobro === ref) {
            this.conPartida.add(ref);
            return true;
          }
        }
      }
      return false;
    }
  }

  return { Almacen, FINALES, PARA_REVISAR, DIA };
});
