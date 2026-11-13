/*
 * sistema.js — vigilancia del propio programa y de la Pi, para que una máquina sola en un bar no se quede
 * colgada nunca:
 *
 * 1. Perro guardián interno: un hilo aparte (worker_threads) comprueba cada 5 s que el hilo principal sigue
 *    vivo. Si lleva 30 s bloqueado (bucle infinito, E/S colgada…), mata el proceso y systemd lo arranca de
 *    nuevo en 2 s (Restart=always). El diario de cobros hace que nadie pierda su prueba.
 * 2. Pantalla: Chromium manda un latido cada 10 s. Si deja de llegar 90 s, se mata Chromium y su servicio
 *    (alcoholimetro-kiosco) lo vuelve a arrancar.
 * 3. Memoria: si el proceso pasa del límite, se reinicia en el siguiente momento de espera (fugas lentas).
 * 4. Reinicio diario a la hora configurada (por defecto 05:00) si la máquina está en espera: Chromium y el
 *    programa empiezan limpios cada día.
 * 5. Salud de la Pi en el registro cada 10 min: temperatura, subtensión (vcgencmd get_throttled), memoria y
 *    espacio libre. La subtensión es lo primero que hay que mirar si algo falla (ficha #1, apartado 4.1).
 */
"use strict";
const { Worker } = require("worker_threads");
const { execFile } = require("child_process");
const os = require("os");

// Segundos de reloj monotónico (CLOCK_MONOTONIC, el mismo en los dos hilos): un salto de la hora por NTP o
// fake-hwclock no dispara el perro (revisión 26-10, #6).
const segMono = () => Number(process.hrtime.bigint() / 1000000000n);

const CODIGO_PERRO = `
const { workerData } = require("worker_threads");
const vida = new Int32Array(workerData.sab);
setInterval(() => {
  const ahora = Number(process.hrtime.bigint() / 1000000000n);
  const ultimo = Atomics.load(vida, 0);
  if (ultimo && ahora - ultimo > workerData.limite) {
    try { process._rawDebug("[perro] el programa lleva " + (ahora - ultimo) + " s sin responder: reinicio"); } catch (e) {}
    process.kill(workerData.pid, "SIGKILL");
  }
}, 5000);
`;

function ejecutar(cmd, args, ms = 4000) {
  return new Promise((ok) => {
    execFile(cmd, args, { timeout: ms }, (e, out) => ok(e ? null : String(out).trim()));
  });
}

class Sistema {
  constructor(o) {
    this.log = o.registro.hijo("sistema");
    this.maquina = o.maquina;
    this.almacen = o.almacen;
    this.c = Object.assign(
      {
        perro_limite_s: 30,
        kiosco: true,
        latido_max_s: 90,
        memoria_max_mb: 220,
        reinicio_diario: "05:00",
        salud_cada_ms: 10 * 60 * 1000,
      },
      o.config || {}
    );
    this.salir = o.salir || ((codigo) => process.exit(codigo));
    this.ultimoLatido = performance.now();
    this.pantalla = {};
    this.salud = {};
    this.timers = [];
    this.reinicioPendiente = null;
  }

  arrancar() {
    // 1. perro guardián
    try {
      const sab = new SharedArrayBuffer(4);
      this.vida = new Int32Array(sab);
      Atomics.store(this.vida, 0, segMono());
      this.perro = new Worker(CODIGO_PERRO, { eval: true, workerData: { sab, limite: this.c.perro_limite_s, pid: process.pid } });
      this.perro.unref();
      this.perro.on("error", (e) => this.log.error("perro guardián: " + e.message));
      this.timers.push(setInterval(() => Atomics.store(this.vida, 0, segMono()), 1000));
    } catch (e) {
      this.log.error("no se pudo arrancar el perro guardián: " + e.message);
    }
    // 2–4. cada 30 s
    this.timers.push(setInterval(() => this._revisar().catch((e) => this.log.aviso("revisión: " + e.message)), 30000));
    // 5. salud de la Pi
    this.timers.push(setInterval(() => this._saludPi().catch(() => {}), this.c.salud_cada_ms));
    setTimeout(() => this._saludPi().catch(() => {}), 20000);
  }

  latidoPantalla(j) {
    this.ultimoLatido = performance.now();
    this.pantalla = { ms: j.ms, calidad: j.calidad, memoria_mb: j.memoria_mb, errores: j.errores, t: Date.now() };
    if (j.error) this.log.aviso("pantalla: " + String(j.error).slice(0, 300));
  }

  _enEspera() {
    const v = this.maquina.vista();
    return v && (v.fase === "espera" || v.fase === "fuera_servicio");
  }

  async _revisar() {
    // programa vivo pero sin avanzar (una espera sin tope, la tarjeta SD colgada…): se reinicia
    const atasco = this.maquina.atascada ? this.maquina.atascada() : null;
    if (atasco) {
      this.log.error("la máquina no avanza (" + atasco + "): me reinicio");
      return this._reiniciarPrograma(1);
    }
    // pantalla muda: se reinicia Chromium
    if (this.c.kiosco && performance.now() - this.ultimoLatido > this.c.latido_max_s * 1000) {
      this.log.aviso(`la pantalla no da señales desde hace ${Math.round((performance.now() - this.ultimoLatido) / 1000)} s: reinicio Chromium`);
      this.ultimoLatido = performance.now(); // se le da tiempo a volver
      await this.reiniciarPantalla();
    }
    // memoria del programa
    const rss = process.memoryUsage().rss / 1048576;
    if (rss > this.c.memoria_max_mb && this._enEspera()) {
      this.log.aviso(`el programa usa ${Math.round(rss)} MB (límite ${this.c.memoria_max_mb}): me reinicio limpio`);
      return this._reiniciarPrograma();
    }
    // reinicio diario
    const [hh, mm] = String(this.c.reinicio_diario || "").split(":").map((x) => parseInt(x, 10));
    if (Number.isInteger(hh)) {
      const d = new Date();
      const clave = d.toDateString();
      if (d.getHours() === hh && d.getMinutes() >= (mm || 0) && d.getMinutes() < (mm || 0) + 30 && this.ultimoDiario !== clave && this._enEspera() && d.getFullYear() >= 2026) {
        this.ultimoDiario = clave;
        this.log.info("reinicio diario de la pantalla y del programa");
        if (this.c.kiosco) await this.reiniciarPantalla();
        return this._reiniciarPrograma();
      }
    }
  }

  async reiniciarPantalla() {
    // el servicio alcoholimetro-kiosco (cage + chromium) vuelve a arrancar solo al morir Chromium
    await ejecutar("pkill", ["-u", String(os.userInfo().uid), "-f", "chromium"]);
  }

  async _reiniciarPrograma(codigo = 0) {
    if (this.reiniciando) return;
    this.reiniciando = true;
    try {
      await Promise.race([this.maquina.detener(), new Promise((r) => setTimeout(r, 8000))]);
    } catch (e) {
      /* nada */
    }
    this.salir(codigo); // systemd lo vuelve a arrancar (Restart=always)
  }

  async _saludPi() {
    const temp = await ejecutar("vcgencmd", ["measure_temp"]);
    const thr = await ejecutar("vcgencmd", ["get_throttled"]);
    let libre = null;
    try {
      libre = await this.almacen.fs.libre();
    } catch (e) {
      libre = null;
    }
    this.salud = {
      temperatura: temp ? temp.replace("temp=", "") : null,
      throttled: thr ? thr.replace("throttled=", "") : null,
      memoria_libre_mb: Math.round(os.freemem() / 1048576),
      carga: os.loadavg().map((x) => x.toFixed(2)).join(" "),
      libre_mb: libre != null ? Math.round(libre / 1048576) : null,
      programa_mb: Math.round(process.memoryUsage().rss / 1048576),
      pantalla_ms: this.pantalla.ms,
    };
    const t = parseInt(this.salud.throttled, 16);
    const malo = Number.isFinite(t) && t !== 0;
    this.log[malo ? "aviso" : "info"](`Pi: ${this.salud.temperatura || "?"} · throttled ${this.salud.throttled || "?"}${malo ? " (¡SUBTENSIÓN O CALOR!)" : ""} · libre ${this.salud.memoria_libre_mb} MB RAM, ${this.salud.libre_mb} MB tarjeta · programa ${this.salud.programa_mb} MB · pantalla ${this.pantalla.ms != null ? Number(this.pantalla.ms).toFixed(1) + " ms/cuadro" : "?"}`);
  }

  estado() {
    return Object.assign({}, this.salud, { latido_hace_s: Math.round((performance.now() - this.ultimoLatido) / 1000), pantalla: this.pantalla });
  }

  parar() {
    for (const t of this.timers) clearInterval(t);
    if (this.perro) this.perro.terminate().catch(() => {});
  }
}

module.exports = { Sistema };
