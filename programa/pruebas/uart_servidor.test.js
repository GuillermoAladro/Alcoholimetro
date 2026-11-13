/* pi/uart.js contra un tty de verdad (pseudoterminal) y pi/servidor.js por HTTP: rutas, fotos, SSE y entradas malas. */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { spawn, execFileSync } = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs");
const http = require("http");
const { UART } = require("../pi/uart");
const { SensorZE29A } = require("../nucleo/sensor_ze29a");
const { RelojReal } = require("../nucleo/reloj");
const { Servidor } = require("../pi/servidor");
const U = require("../nucleo/util");

const hayPython = (() => {
  try {
    execFileSync("python3", ["-c", "import pty"], { stdio: "ignore" });
    execFileSync("stty", ["--version"], { stdio: "ignore" });
    return true;
  } catch (e) {
    return false;
  }
})();

test("UART real (pty): stty, tramas partidas, sensor responde; si el otro lado muere no se cae", { skip: !hayPython }, async () => {
  const py = spawn("python3", [path.join(__dirname, "ayudas/ze29a_pty.py")], { stdio: ["pipe", "pipe", "inherit"] });
  const ruta = await new Promise((ok) => py.stdout.once("data", (d) => ok(String(d).trim())));
  const reloj = new RelojReal();
  const uart = new UART(ruta);
  await uart.abrir();
  const sensor = new SensorZE29A({ transporte: uart, reloj });
  for (let i = 0; i < 20; i++) assert.equal(await sensor.estado(), 0x31);
  assert.equal(await sensor.tiempoSoplido(), 4);
  assert.equal(await sensor.umbralPresion(), 8);
  py.stdin.end(); // el "sensor" se desconecta
  await new Promise((r) => py.once("exit", r));
  await assert.rejects(sensor.estado(), (e) => e.codigo === "SENSOR_NO_RESPONDE" || /UART/.test(e.message));
  await uart.cerrar();
});

function pedir(puerto, metodo, ruta, cuerpo) {
  return new Promise((ok, mal) => {
    const r = http.request({ host: "127.0.0.1", port: puerto, method: metodo, path: ruta }, (res) => {
      const t = [];
      res.on("data", (d) => t.push(d));
      res.on("end", () => ok({ status: res.statusCode, tipo: res.headers["content-type"], cuerpo: Buffer.concat(t) }));
    });
    r.on("error", mal);
    if (cuerpo) r.write(cuerpo);
    r.end();
  });
}

test("servidor: página, scripts de la lista, fotos válidas, nada fuera de la carpeta, SSE con la vista", async () => {
  const registro = U.crearRegistro({ consola: false });
  const em = U.crearEmisor();
  const foto = new Uint8Array([0xff, 0xd8, 1, 2, 0xff, 0xd9]);
  const maquina = { on: (e, f) => em.on(e, f), vista: () => ({ fase: "espera", n: 1, d: {} }), salud: { ok: true } };
  const almacen = {
    leerFoto: async (id) => (id === "20261026-120000-abcdef" ? foto : null),
    ranking: { total: 0, top: [] },
    fotos: new Map(),
    cobrosAbiertos: () => [],
  };
  const srv = new Servidor({ maquina, almacen, camara: null, sistema: null, registro });
  const puerto = 18000 + Math.floor(Math.random() * 900); // lejos del 8080 del servicio
  await srv.escuchar(puerto);
  try {
    const p = await pedir(puerto, "GET", "/");
    assert.equal(p.status, 200);
    assert.match(String(p.cuerpo), /pantalla\.js/);
    assert.equal((await pedir(puerto, "GET", "/js/pantalla.js")).status, 200);
    assert.equal((await pedir(puerto, "GET", "/js/../principal.js")).status, 404);
    assert.equal((await pedir(puerto, "GET", "/js/maquina.js")).status, 404); // solo lo que necesita la pantalla
    assert.equal((await pedir(puerto, "GET", "/fuentes/..%2F..%2Fprincipal.js")).status, 404);
    const f = await pedir(puerto, "GET", "/fotos/20261026-120000-abcdef.jpg");
    assert.equal(f.status, 200);
    assert.deepEqual(new Uint8Array(f.cuerpo), foto);
    assert.equal((await pedir(puerto, "GET", "/fotos/../../etc/passwd")).status, 404);
    assert.equal((await pedir(puerto, "POST", "/latido", "x".repeat(10000))).status, 413); // cuerpo demasiado grande
    assert.equal((await pedir(puerto, "POST", "/latido", "{no es json")).status, 204);
    const u = srv.urlFotoBytes(foto);
    assert.deepEqual(new Uint8Array((await pedir(puerto, "GET", u)).cuerpo), foto);
    // SSE: llega la vista actual al conectar y las nuevas después
    const recibido = await new Promise((ok) => {
      http.get({ host: "127.0.0.1", port: puerto, path: "/eventos" }, (res) => {
        let t = "";
        res.on("data", (d) => {
          t += d;
          if (t.includes('"fase":"espera"') && !t.includes("resultado")) em.emit("vista", { fase: "resultado", n: 2, d: {} });
          if (t.includes('"fase":"resultado"')) {
            res.destroy();
            ok(t);
          }
        });
      });
    });
    assert.match(recibido, /event: vista/);
  } finally {
    await srv.cerrar();
  }
});
