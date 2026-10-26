/*
 * Prueba de extremo a extremo de la parte de la Pi: arranca `node pi/principal.js --simular`, abre la página
 * del kiosco en Chromium (como en la máquina) y hace una prueba completa con las acciones /sim/…
 * Uso: node pruebas/e2e/kiosco.js <carpeta_capturas>   (necesita playwright)
 */
"use strict";
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

const PUERTO = 8093;
const BASE = `http://127.0.0.1:${PUERTO}`;
const salida = process.argv[2] || os.tmpdir();
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const sim = (a) => fetch(`${BASE}/sim/${a}`, { method: "POST" }).then((r) => r.json());
const estado = () => fetch(`${BASE}/estado`).then((r) => r.json());

(async () => {
  const datos = fs.mkdtempSync(path.join(os.tmpdir(), "alc-e2e-"));
  const prog = spawn("node", [path.join(__dirname, "../../pi/principal.js"), "--simular", "--puerto", String(PUERTO), "--datos", datos], { stdio: ["ignore", "pipe", "pipe"] });
  let logs = "";
  prog.stdout.on("data", (d) => (logs += d));
  prog.stderr.on("data", (d) => (logs += d));
  await espera(2500);
  const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--autoplay-policy=no-user-gesture-required"] });
  const pg = await b.newPage({ viewport: { width: 1024, height: 600 } });
  const errores = [];
  pg.on("pageerror", (e) => errores.push("PAGEERROR " + e.message));
  pg.on("console", (m) => m.type() === "error" && errores.push(m.text()));
  await pg.goto(BASE + "/");
  const fase = async () => (await estado()).vista.fase;
  async function hasta(f, max = 60000) {
    const t0 = Date.now();
    while (Date.now() - t0 < max) {
      if ((await fase()) === f) return true;
      await espera(250);
    }
    throw new Error(`no llega a ${f} (está en ${await fase()})`);
  }
  const foto = async (n) => {
    const t0 = Date.now();
    // copia del lienzo (mucho más rápida que una captura de página con el GL por software)
    const url = await pg.evaluate(() => document.getElementById("pantalla").toDataURL("image/png"));
    fs.writeFileSync(path.join(salida, `k_${n}.png`), Buffer.from(url.split(",")[1], "base64"));
    console.log(`captura ${n}: ${Date.now() - t0} ms · fase ${await fase()}`);
  };
  try {
    await hasta("espera", 20000);
    await espera(1500);
    await foto("1_espera");
    await sim("alcohol?gl=0.83");
    for (let i = 0; i < 20 && !(await sim("tarjeta")).ok; i++) await espera(500);
    await hasta("pagado", 15000);
    await espera(600);
    await foto("2_pagado");
    await hasta("preparando", 10000);
    await espera(3000);
    await foto("3_preparando");
    await hasta("sopla", 20000);
    await espera(800);
    await foto("4_sopla");
    await sim("soplar?ms=4600");
    await hasta("soplando", 3000);
    await espera(1800);
    await foto("5_soplando");
    await hasta("analizando", 6000);
    await espera(1200);
    await foto("6_cuenta_atras");
    await hasta("resultado", 15000);
    await espera(4500);
    await foto("7_resultado");
    const e = await estado();
    console.log("partidas", e.partidas, "fotos", e.fotos, "top", JSON.stringify(e.top));
    await hasta("espera", 30000);
    await espera(3000);
    await foto("8_espera_con_top");
    // la foto del top se sirve
    const top = (await estado()).top[0];
    const r = await fetch(`${BASE}/fotos/${top.id}.jpg`);
    console.log("foto del top:", r.status, r.headers.get("content-type"), (await r.arrayBuffer()).byteLength, "bytes");
    // la página aguanta que el programa se reinicie (vuelve a conectar sola)
    const lat = await pg.evaluate(() => performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : -1);
    console.log("memoria de la página (MB):", lat);
  } catch (e) {
    console.log("FALLO:", e.message);
    await foto("fallo");
  }
  console.log(errores.length ? "ERRORES:\n" + errores.join("\n") : "sin errores en la página");
  console.log("--- registro del programa (últimas líneas) ---\n" + logs.split("\n").slice(-25).join("\n"));
  await b.close();
  prog.kill("SIGTERM");
  await espera(1500);
  fs.rmSync(datos, { recursive: true, force: true });
})();
