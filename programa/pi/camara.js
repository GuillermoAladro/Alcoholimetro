/*
 * camara.js — Camera Module 3 en la Pi 3B+ con rpicam-vid (libcamera), sin bibliotecas externas.
 *
 * Solo se enciende durante la prueba (desde el pago hasta la foto): el resto del tiempo no gasta CPU.
 * rpicam-vid saca MJPEG por la salida estándar; aquí se cortan los JPEG (FF D8 … FF D9) y:
 *   - se reparten a la pantalla como /camara.mjpg (vista previa en directo durante la cuenta atrás);
 *   - la foto es el primer cuadro completo que llega después de pedirla (no un cuadro viejo).
 *
 * Cámara tapada (foto opcional sin botón, auditoría 1.0 H17–H18): si rpicam da los metadatos de cada cuadro,
 * se mira el "Lux"; si no, el tamaño del JPEG (una imagen negra comprime muchísimo). Los dos umbrales están en
 * config.json y hay que ajustarlos en el banco con la luz del bar.
 *
 * Una cámara que no arranca, se cuelga o se cae no para la máquina: la prueba sigue sin foto (H24).
 */
"use strict";
const { spawn, execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const POR_DEFECTO = {
  ancho: 1280,
  alto: 720,
  fps: 12,
  calidad: 80,
  espejo: true, // como un espejo: la persona se ve como se ve en casa
  rotacion: 0, // 0 o 180 si la cámara va montada al revés
  enfoque: "continuo", // continuo | fijo
  lente: 2.0, // dioptrías si el enfoque es fijo (1/distancia en m: 2.0 = 50 cm)
  umbral_lux: 3,
  umbral_bytes: 20000,
  arranque_ms: 7000,
};

function buscarBinario() {
  for (const b of ["rpicam-vid", "libcamera-vid"]) {
    try {
      execFileSync("which", [b], { stdio: "ignore" });
      return b;
    } catch (e) {
      /* siguiente */
    }
  }
  return null;
}

class CamaraPi {
  constructor(o = {}) {
    this.c = Object.assign({}, POR_DEFECTO, o.config || {});
    this.log = o.registro || { depurar() {}, info() {}, aviso() {}, error() {} };
    this.binario = o.binario || buscarBinario();
    this.dirMeta = o.dirMeta || "/run/alcoholimetro";
    this.proc = null;
    this.ultimo = null; // último JPEG completo
    this.tUltimo = 0;
    this.esperando = []; // quien espera el próximo cuadro
    this.clientes = new Set(); // respuestas HTTP de /camara.mjpg
    this.sinMetadatos = false;
    this.lux = null;
    this.buf = Buffer.alloc(0);
  }

  _args(conMeta) {
    const c = this.c;
    const a = ["-t", "0", "-n", "--codec", "mjpeg", "--width", String(c.ancho), "--height", String(c.alto), "--framerate", String(c.fps), "-q", String(c.calidad)];
    if (c.espejo) a.push("--hflip");
    if (c.rotacion === 180) a.push("--rotation", "180");
    if (c.enfoque === "fijo") a.push("--autofocus-mode", "manual", "--lens-position", String(c.lente));
    else a.push("--autofocus-mode", "continuous");
    if (conMeta) a.push("--metadata", this.rutaMeta, "--metadata-format", "json");
    a.push("-o", "-");
    return a;
  }

  get rutaMeta() {
    return path.join(this.dirMeta, "camara-meta.json");
  }

  lista() {
    return !!(this.proc && this.ultimo && Date.now() - this.tUltimo < 2000);
  }

  /** Arranca rpicam-vid y espera al primer cuadro. */
  async encender() {
    if (this.lista()) return true;
    if (!this.binario) throw new Error("no está instalado rpicam-vid (rpicam-apps)");
    if (this.proc) await this.apagar();
    const conMeta = !this.sinMetadatos;
    if (conMeta) {
      try {
        fs.mkdirSync(this.dirMeta, { recursive: true });
        fs.writeFileSync(this.rutaMeta, "");
      } catch (e) {
        this.sinMetadatos = true;
      }
    }
    const args = this._args(conMeta && !this.sinMetadatos);
    const p = spawn(this.binario, args, { stdio: ["ignore", "pipe", "pipe"] });
    this.proc = p;
    this.buf = Buffer.alloc(0);
    this.ultimo = null;
    let errTexto = "";
    p.stdout.on("data", (d) => this._datos(d));
    p.stderr.on("data", (d) => {
      errTexto = (errTexto + d.toString()).slice(-2000);
    });
    p.on("error", (e) => this.log.error("cámara: " + e.message));
    p.on("exit", (codigo, senal) => {
      if (this.proc === p) {
        this.proc = null;
        if (codigo && /metadata/i.test(errTexto) && !this.sinMetadatos) {
          this.sinMetadatos = true;
          this.log.aviso("esta versión de rpicam-vid no da metadatos: la cámara tapada se detecta por el tamaño del JPEG");
        } else if (codigo || senal) this.log.aviso(`la cámara se ha parado (${codigo || senal}): ${errTexto.split("\n").filter(Boolean).slice(-2).join(" | ")}`);
      }
      for (const w of this.esperando.splice(0)) w(null);
    });
    try {
      await this._siguiente(this.c.arranque_ms);
      if (!this.ultimo) throw new Error("la cámara no da imagen");
      this.log.info("cámara encendida");
      return true;
    } catch (e) {
      await this.apagar();
      if (this.sinMetadatos && conMeta) return this.encender(); // segundo intento sin metadatos
      throw e;
    }
  }

  _datos(d) {
    this.buf = this.buf.length ? Buffer.concat([this.buf, d]) : d;
    // nunca más de 4 MB acumulados sin un JPEG completo (un flujo corrupto no se come la memoria)
    if (this.buf.length > 4 * 1024 * 1024) this.buf = Buffer.alloc(0);
    for (;;) {
      const ini = this.buf.indexOf(Buffer.from([0xff, 0xd8]));
      if (ini < 0) {
        this.buf = Buffer.alloc(0);
        return;
      }
      const fin = this.buf.indexOf(Buffer.from([0xff, 0xd9]), ini + 2);
      if (fin < 0) {
        if (ini > 0) this.buf = this.buf.subarray(ini);
        return;
      }
      const jpeg = Buffer.from(this.buf.subarray(ini, fin + 2));
      this.buf = this.buf.subarray(fin + 2);
      this._cuadro(jpeg);
    }
  }

  _cuadro(jpeg) {
    this.ultimo = jpeg;
    this.tUltimo = Date.now();
    for (const w of this.esperando.splice(0)) w(jpeg);
    for (const res of this.clientes) this._enviar(res, jpeg);
  }

  _enviar(res, jpeg) {
    if (res.writableLength > 1024 * 1024) return; // cliente lento: se salta este cuadro
    try {
      res.write(`--cuadro\r\nContent-Type: image/jpeg\r\nContent-Length: ${jpeg.length}\r\n\r\n`);
      res.write(jpeg);
      res.write("\r\n");
    } catch (e) {
      this.clientes.delete(res);
    }
  }

  _siguiente(ms) {
    return new Promise((ok) => {
      const t = setTimeout(() => {
        const i = this.esperando.indexOf(f);
        if (i >= 0) this.esperando.splice(i, 1);
        ok(null);
      }, ms);
      const f = (j) => {
        clearTimeout(t);
        ok(j);
      };
      this.esperando.push(f);
    });
  }

  _leerLux() {
    if (this.sinMetadatos) return null;
    try {
      const st = fs.statSync(this.rutaMeta);
      const desde = Math.max(0, st.size - 6000);
      const fd = fs.openSync(this.rutaMeta, "r");
      const b = Buffer.alloc(st.size - desde);
      fs.readSync(fd, b, 0, b.length, desde);
      fs.closeSync(fd);
      const m = b.toString().match(/"Lux"\s*:\s*([0-9.eE+-]+)/g);
      if (!m) return null;
      return parseFloat(m[m.length - 1].split(":")[1]);
    } catch (e) {
      return null;
    }
  }

  /** La foto: el primer cuadro nuevo tras pedirla (o el último si tiene menos de 1 s). */
  async foto() {
    if (!this.proc) throw new Error("cámara apagada");
    let j = await this._siguiente(1500);
    if (!j && this.ultimo && Date.now() - this.tUltimo < 1000) j = this.ultimo;
    if (!j) throw new Error("la cámara no da imagen");
    const lux = this._leerLux();
    const tapada = lux != null ? lux < this.c.umbral_lux : j.length < this.c.umbral_bytes;
    this.log.info(`foto: ${Math.round(j.length / 1024)} KB${lux != null ? ", " + lux.toFixed(1) + " lux" : ""}${tapada ? " · TAPADA" : ""}`);
    return { bytes: new Uint8Array(j), tapada };
  }

  async apagar() {
    const p = this.proc;
    this.proc = null;
    this.ultimo = null;
    for (const res of this.clientes) {
      try {
        res.end();
      } catch (e) {
        /* nada */
      }
    }
    this.clientes.clear();
    if (!p) return;
    p.kill("SIGTERM");
    await new Promise((ok) => {
      const t = setTimeout(() => {
        try {
          p.kill("SIGKILL");
        } catch (e) {
          /* ya muerto */
        }
        ok();
      }, 2000);
      p.once("exit", () => {
        clearTimeout(t);
        ok();
      });
    });
  }

  /** Vista previa para la pantalla (multipart/x-mixed-replace). */
  suscribir(res) {
    res.writeHead(200, {
      "Content-Type": "multipart/x-mixed-replace; boundary=cuadro",
      "Cache-Control": "no-store",
      Connection: "close",
    });
    if (!this.proc) return res.end();
    this.clientes.add(res);
    res.on("close", () => this.clientes.delete(res));
    if (this.ultimo) this._enviar(res, this.ultimo);
  }
}

module.exports = { CamaraPi, POR_DEFECTO };
