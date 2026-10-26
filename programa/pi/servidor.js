/*
 * servidor.js — servidor web local (solo 127.0.0.1) que alimenta a Chromium en modo kiosco.
 *
 *   GET  /                 la página de la pantalla (pi/kiosco/index.html)
 *   GET  /js/<nombre>.js   los scripts (nucleo/ y pi/kiosco/), lista cerrada
 *   GET  /fuentes/<x>      tipografías locales (sin internet)
 *   GET  /eventos          vistas de la máquina en directo (Server-Sent Events)
 *   GET  /fotos/<id>.jpg   fotos guardadas (top 10 y últimas 24 h)
 *   GET  /foto/<n>.jpg     la foto recién hecha (antes de guardarla), en memoria
 *   GET  /camara.mjpg      cámara en directo durante la cuenta atrás
 *   POST /latido           la pantalla dice que está viva (si deja de decirlo, se reinicia Chromium)
 *   GET  /estado           diagnóstico en JSON (para el técnico, por SSH)
 *   POST /sim/<acción>     solo con --simular: tarjeta, soplar… para probar sin hardware
 *
 * Nada de lo que llegue puede tumbar el proceso: cada petición va en try/catch y los cuerpos están limitados.
 */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const SCRIPTS = {
  "util.js": "nucleo/util.js",
  "textos.js": "nucleo/textos.js",
  "pantalla.js": "nucleo/pantalla.js",
  "kiosco.js": "pi/kiosco/kiosco.js",
};
const RE_FUENTE = /^[a-z0-9-]+\.woff2$/;
const RE_FOTO = /^(\d{8}-\d{6}-[0-9a-f]{6})\.jpg$/;

class Servidor {
  /**
   * @param {object} o { maquina, almacen, camara, sistema, registro, puerto, sim (opcional) }
   */
  constructor(o) {
    this.o = o;
    this.log = o.registro.hijo("servidor");
    this.clientes = new Set();
    this.fotosRecientes = new Map(); // n → bytes (las 4 últimas)
    this.nFoto = 0;
    this.srv = http.createServer((req, res) => this._atender(req, res));
    this.srv.keepAliveTimeout = 5000;
    this.srv.headersTimeout = 10000;
    this.srv.requestTimeout = 15000;
    o.maquina.on("vista", (v) => this.difundir("vista", v));
    this.latido = setInterval(() => this.difundir("latido", { t: Date.now() }), 15000);
  }

  escuchar(puerto) {
    return new Promise((ok, mal) => {
      this.srv.once("error", mal);
      this.srv.listen(puerto || 8080, "127.0.0.1", () => {
        this.log.info(`servidor en http://127.0.0.1:${puerto || 8080}`);
        ok();
      });
    });
  }

  /** La máquina guarda aquí la foto recién hecha para enseñarla antes de que esté en disco. */
  urlFotoBytes(bytes) {
    const n = ++this.nFoto;
    this.fotosRecientes.set(n, Buffer.from(bytes));
    while (this.fotosRecientes.size > 4) this.fotosRecientes.delete(this.fotosRecientes.keys().next().value);
    return `/foto/${n}.jpg`;
  }

  difundir(evento, datos) {
    let s;
    try {
      s = `event: ${evento}\ndata: ${JSON.stringify(datos)}\n\n`;
    } catch (e) {
      return;
    }
    for (const res of this.clientes) {
      if (res.writableLength > 256 * 1024) {
        // un cliente que no lee se desconecta (volverá a conectar solo)
        this.clientes.delete(res);
        res.destroy();
        continue;
      }
      try {
        res.write(s);
      } catch (e) {
        this.clientes.delete(res);
      }
    }
  }

  _enviar(res, codigo, tipo, cuerpo, cabeceras) {
    res.writeHead(codigo, Object.assign({ "Content-Type": tipo, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }, cabeceras || {}));
    res.end(cuerpo);
  }

  _archivo(res, ruta, tipo, cache) {
    fs.readFile(ruta, (e, datos) => {
      if (e) return this._enviar(res, 404, "text/plain", "no existe");
      this._enviar(res, 200, tipo, datos, cache ? { "Cache-Control": "max-age=86400" } : null);
    });
  }

  _cuerpo(req, max = 4096) {
    return new Promise((ok, mal) => {
      let n = 0;
      let trozos = [];
      req.on("data", (d) => {
        if (!trozos) return; // ya se pasó del límite: se descarta lo que quede sin guardarlo
        n += d.length;
        if (n > max) {
          trozos = null;
          const e = new Error("cuerpo demasiado grande");
          e.http = 413;
          mal(e);
        } else trozos.push(d);
      });
      req.on("end", () => trozos && ok(Buffer.concat(trozos).toString()));
      req.on("error", mal);
    });
  }

  async _atender(req, res) {
    try {
      const url = new URL(req.url, "http://127.0.0.1");
      const p = url.pathname;
      if (req.method === "GET" && (p === "/" || p === "/index.html")) return this._archivo(res, path.join(RAIZ, "pi/kiosco/index.html"), "text/html; charset=utf-8");
      if (req.method === "GET" && p.startsWith("/js/")) {
        const f = SCRIPTS[p.slice(4)];
        if (!f) return this._enviar(res, 404, "text/plain", "no existe");
        return this._archivo(res, path.join(RAIZ, f), "text/javascript; charset=utf-8");
      }
      if (req.method === "GET" && p.startsWith("/fuentes/")) {
        const f = p.slice(9);
        if (!RE_FUENTE.test(f)) return this._enviar(res, 404, "text/plain", "no existe");
        return this._archivo(res, path.join(RAIZ, "pi/fuentes", f), "font/woff2", true);
      }
      if (req.method === "GET" && p === "/eventos") return this._eventos(req, res);
      if (req.method === "GET" && p.startsWith("/fotos/")) {
        const m = RE_FOTO.exec(p.slice(7));
        if (!m) return this._enviar(res, 404, "text/plain", "no existe");
        const b = await this.o.almacen.leerFoto(m[1]);
        if (!b) return this._enviar(res, 404, "text/plain", "no existe");
        return this._enviar(res, 200, "image/jpeg", Buffer.from(b), { "Cache-Control": "max-age=3600" });
      }
      if (req.method === "GET" && p.startsWith("/foto/")) {
        const n = parseInt(p.slice(6), 10);
        const b = this.fotosRecientes.get(n);
        if (!b) return this._enviar(res, 404, "text/plain", "no existe");
        return this._enviar(res, 200, "image/jpeg", b);
      }
      if (req.method === "GET" && p === "/camara.mjpg") {
        if (!this.o.camara || !this.o.camara.suscribir) return this._enviar(res, 404, "text/plain", "sin cámara");
        return this.o.camara.suscribir(res);
      }
      if (req.method === "POST" && p === "/latido") {
        const t = await this._cuerpo(req, 2048);
        let j = {};
        try {
          j = JSON.parse(t || "{}");
        } catch (e) {
          j = {};
        }
        if (this.o.sistema) this.o.sistema.latidoPantalla(j);
        return this._enviar(res, 204, "text/plain", "");
      }
      if (req.method === "GET" && p === "/estado") return this._enviar(res, 200, "application/json; charset=utf-8", JSON.stringify(this._estado(), null, 1));
      if (req.method === "POST" && p.startsWith("/sim/") && this.o.sim) {
        const r = await this.o.sim(p.slice(5), url.searchParams);
        return this._enviar(res, 200, "application/json", JSON.stringify(r || { ok: true }));
      }
      return this._enviar(res, 404, "text/plain", "no existe");
    } catch (e) {
      this.log.aviso(`petición ${req.method} ${req.url}: ${e.message}`);
      try {
        if (!res.headersSent) this._enviar(res, e.http || 500, "text/plain", "error", { Connection: "close" });
        else res.end();
      } catch (x) {
        /* nada */
      }
    }
  }

  _eventos(req, res) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.write("retry: 2000\n\n");
    this.clientes.add(res);
    const v = this.o.maquina.vista();
    if (v) res.write(`event: vista\ndata: ${JSON.stringify(v)}\n\n`);
    req.on("close", () => this.clientes.delete(res));
  }

  _estado() {
    const m = this.o.maquina;
    const a = this.o.almacen;
    return {
      hora: new Date().toISOString(),
      vista: m.vista() && { fase: m.vista().fase, pago: m.vista().pago },
      salud: m.salud,
      partidas: a.ranking.total,
      top: a.ranking.top.map((e) => ({ id: e.id, valor: e.valor, foto: e.foto })),
      fotos: a.fotos.size,
      cobros_abiertos: a.cobrosAbiertos(),
      cobros_para_revisar: a.cobrosParaRevisar ? a.cobrosParaRevisar() : [], // reembolsos imposibles, sin resolver…
      sensor: this.o.sensor ? this.o.sensor.estadisticas : null,
      sistema: this.o.sistema ? this.o.sistema.estado() : null,
      memoria_mb: Math.round(process.memoryUsage().rss / 1048576),
      registro: this.o.registro.lineas().slice(-60),
    };
  }

  cerrar() {
    clearInterval(this.latido);
    for (const res of this.clientes) {
      try {
        res.end();
      } catch (e) {
        /* nada */
      }
    }
    this.clientes.clear();
    return new Promise((ok) => this.srv.close(() => ok()));
  }
}

module.exports = { Servidor };
