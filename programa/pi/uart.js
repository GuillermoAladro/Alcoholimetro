/*
 * uart.js — puerto serie de la Pi para el ZE29A, sin bibliotecas externas.
 *
 * Se configura con stty (9600 8N1, crudo, sin eco ni control de flujo) y se lee con un bucle de lecturas que
 * vuelven como mucho a los 100 ms (VMIN=0, VTIME=1). Si el puerto da error (cable suelto, módulo sin
 * alimentación…), se cierra y se vuelve a abrir solo cada pocos segundos: la máquina no se queda colgada.
 *
 * Requisitos de la Pi (MONTAJE PASO A PASO, fase 2): enable_uart=1, dtoverlay=disable-bt, sin consola serie
 * en cmdline.txt, /dev/serial0 → ttyAMA0, usuario en el grupo dialout.
 */
"use strict";
const fs = require("fs");
const fsp = fs.promises;
const { execFile } = require("child_process");

function stty(ruta, baudios) {
  const args = ["-F", ruta, String(baudios), "cs8", "-cstopb", "-parenb", "raw", "-echo", "-echoe", "-echok", "-echoctl", "-echoke", "-ixon", "-ixoff", "-crtscts", "clocal", "cread", "min", "0", "time", "1"];
  return new Promise((ok, mal) => {
    execFile("stty", args, { timeout: 5000 }, (e, _out, err) => (e ? mal(new Error("stty: " + (err || e.message).trim())) : ok()));
  });
}

class UART {
  constructor(ruta, o = {}) {
    this.ruta = ruta || "/dev/serial0";
    this.baudios = o.baudios || 9600;
    this.log = o.registro || { depurar() {}, info() {}, aviso() {}, error() {} };
    this.fd = null;
    this.cb = null;
    this.cerrado = false;
    this.abriendo = null;
    this.errores = 0;
  }

  alRecibir(fn) {
    this.cb = fn;
  }

  async abrir() {
    if (this.fd || this.cerrado) return;
    if (this.abriendo) return this.abriendo;
    this.abriendo = (async () => {
      try {
        await stty(this.ruta, this.baudios);
        this.fd = await fsp.open(this.ruta, fs.constants.O_RDWR | fs.constants.O_NOCTTY);
        this.log.info(`UART abierta: ${this.ruta} a ${this.baudios} 8N1`);
        this.errores = 0;
        this._leer(this.fd);
      } catch (e) {
        this.fd = null;
        if (this.errores++ % 30 === 0) this.log.error(`no puedo abrir ${this.ruta}: ${e.message}`);
        this._reabrirLuego();
      } finally {
        this.abriendo = null;
      }
    })();
    return this.abriendo;
  }

  _reabrirLuego() {
    if (this.cerrado || this.reabrir) return;
    this.reabrir = setTimeout(() => {
      this.reabrir = null;
      this.abrir();
    }, 3000);
  }

  async _leer(fd) {
    const buf = Buffer.alloc(256);
    while (!this.cerrado && this.fd === fd) {
      let n = 0;
      try {
        ({ bytesRead: n } = await fd.read(buf, 0, buf.length, null));
      } catch (e) {
        this.log.error("lectura de la UART: " + e.message);
        await this._cerrarFd();
        this._reabrirLuego();
        return;
      }
      if (n > 0 && this.cb) {
        try {
          this.cb(new Uint8Array(buf.subarray(0, n)));
        } catch (e) {
          this.log.error("al procesar bytes de la UART: " + e.message);
        }
      }
    }
  }

  async escribir(bytes) {
    if (!this.fd) {
      await this.abrir();
      if (!this.fd) throw new Error("UART cerrada");
    }
    try {
      await this.fd.write(Buffer.from(bytes));
    } catch (e) {
      await this._cerrarFd();
      this._reabrirLuego();
      throw e;
    }
  }

  async _cerrarFd() {
    const fd = this.fd;
    this.fd = null;
    if (fd) await fd.close().catch(() => {});
  }

  cerrar() {
    this.cerrado = true;
    if (this.reabrir) clearTimeout(this.reabrir);
    return this._cerrarFd();
  }
}

module.exports = { UART };
