/*
 * camara_falsa_node.js — cámara de mentira para `node pi/principal.js --simular` en un ordenador sin cámara.
 * Da siempre la misma foto (sim/foto_simulada.jpg) y la sirve como vídeo MJPEG a 8 cuadros por segundo.
 */
"use strict";
const fs = require("fs");
const path = require("path");

class CamaraFalsaNode {
  constructor() {
    this.jpeg = fs.readFileSync(path.join(__dirname, "foto_simulada.jpg"));
    this.encendida = false;
    this.tapada = false;
    this.clientes = new Set();
    this.timer = null;
  }
  async encender() {
    await new Promise((r) => setTimeout(r, 600));
    this.encendida = true;
    if (!this.timer) this.timer = setInterval(() => this._emitir(), 125);
    return true;
  }
  lista() {
    return this.encendida;
  }
  async foto() {
    if (!this.encendida) throw new Error("cámara apagada");
    return { bytes: new Uint8Array(this.jpeg), tapada: this.tapada };
  }
  async apagar() {
    this.encendida = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    for (const r of this.clientes) r.end();
    this.clientes.clear();
  }
  _emitir() {
    for (const res of this.clientes) {
      if (res.writableLength > 1048576) continue;
      res.write(`--cuadro\r\nContent-Type: image/jpeg\r\nContent-Length: ${this.jpeg.length}\r\n\r\n`);
      res.write(this.jpeg);
      res.write("\r\n");
    }
  }
  suscribir(res) {
    res.writeHead(200, { "Content-Type": "multipart/x-mixed-replace; boundary=cuadro", "Cache-Control": "no-store" });
    if (!this.encendida) return res.end();
    this.clientes.add(res);
    res.on("close", () => this.clientes.delete(res));
  }
}

module.exports = { CamaraFalsaNode };
