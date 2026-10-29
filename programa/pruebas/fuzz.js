/*
 * Fuzz de la máquina entera (de la segunda revisión independiente, 26-10-2026): horas de clientes al azar con PIN
 * lentos, rechazos, red que cae, respuestas perdidas, errores 503, red lenta, sensor que se desconecta y cortes de
 * luz (la instancia muerta ya no escribe ni habla con SumUp). Después, 4 h tranquilas para que se resuelva todo.
 *
 *   node pruebas/fuzz.js <semilla> <horas>        p. ej.  for s in $(seq 1 50); do node pruebas/fuzz.js $s 24; done
 *
 * Comprueba que cada pago acaba en UNA partida o en UN reembolso (nunca las dos, nunca ninguna, nunca dos
 * partidas), que no hay dos reembolsos a la vez para el mismo pago, que no queda nada abierto y que no hay
 * promesas rechazadas sin controlar. Sale con código 1 si algo falla.
 * "Pruebas usadas por otro" es informativo: un crédito entregado cuando quien pagó ya se había ido.
 */
"use strict";
const SEED = Number(process.argv[2] || 1);
const HORAS = Number(process.argv[3] || 6);
let s = SEED >>> 0 || 1;
const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
Math.random = rnd; // simulaciones deterministas
const P = require("path").join(__dirname, "..") + "/";
const U = require(P + "nucleo/util");
const { RelojVirtual } = require(P + "nucleo/reloj");
const { Almacen } = require(P + "nucleo/almacen");
const { SensorZE29A } = require(P + "nucleo/sensor_ze29a");
const { ClienteSumUp } = require(P + "nucleo/sumup");
const { CobroContinuo } = require(P + "nucleo/cobro");
const { Maquina } = require(P + "nucleo/maquina");
const { ZE29ASimulado } = require(P + "sim/ze29a_sim");
const { NubeSumUp } = require(P + "sim/sumup_sim");
const { FSMemoria } = require(P + "sim/fs_memoria");

const rechazos = [];
process.on("unhandledRejection", (e) => rechazos.push(String(e && e.stack || e)));

const reloj = new RelojVirtual(Date.UTC(2026, 9, 26, 18));
const fsBase = new FSMemoria({ ahora: () => reloj.ahora() });
const nube = new NubeSumUp({ reloj, api_key: "k", merchant_code: "M1", reader_id: "r1" });
nube.fallos.latenciaMs = 80;
const sim = new ZE29ASimulado({ reloj });
const red = { lenta: 0 };
const refundPosts = new Map();
const enVuelo = new Map();
const solapes = new Set();
let sesionRef = null;
const usos = [];
const entregas = [];
const pagosT = new Map(); // { pagador, sesion }
const camara = { encendida: false, async encender() { this.encendida = true; }, lista() { return this.encendida; }, async foto() { return { bytes: new Uint8Array([0xff, 0xd8, 1, 0xff, 0xd9]), tapada: rnd() < 0.2 }; }, async apagar() { this.encendida = false; } };

function montar() {
  const vivo = { si: true };
  const muerto = () => { const e = new Error("sin alimentación"); e.code = "EIO"; throw e; };
  const fs = new Proxy(fsBase, { get(t, k) { const v = t[k]; if (typeof v !== "function") return v; return async (...a) => { if (!vivo.si) muerto(); return v.apply(t, a); }; } });
  const fetch = async (url, op) => {
    if (!vivo.si) return new Promise(() => {}); // proceso muerto: no sale nada
    const m = /payments\/([^/]+)\/refunds/.exec(url);
    if (m) { refundPosts.set(m[1], (refundPosts.get(m[1]) || 0) + 1); enVuelo.set(m[1], (enVuelo.get(m[1]) || 0) + 1); if (enVuelo.get(m[1]) > 1) solapes.add(m[1]); }
    try {
      if (red.lenta) await reloj.esperar(red.lenta * rnd());
      if (!vivo.si) return new Promise(() => {});
      return await nube.fetch(url, op);
    } finally { if (m) enVuelo.set(m[1], enVuelo.get(m[1]) - 1); }
  };
  const registro = U.crearRegistro({ consola: false, ahora: () => reloj.ahora() });
  const almacen = new Almacen({ fs, reloj, registro: registro.hijo("almacen"), config: { maxCobrosBytes: 20000 } });
  const sensor = new SensorZE29A({ transporte: sim.transporte(), reloj, registro: registro.hijo("sensor") });
  const cliente = new ClienteSumUp({ fetch, reloj, config: { api_key: "k", merchant_code: "M1", reader_id: "r1", app_id: "a", affiliate_key: "b" } });
  const cobro = new CobroContinuo({ cliente, almacen, reloj, registro: registro.hijo("cobro") });
  const maquina = new Maquina({ reloj, registro, sensor, cobro, camara, almacen, config: { pausa_tras_alto_ms: 0 } });
  const inst = { vivo, almacen, sensor, cobro, maquina, registro };
  cobro.on("pagado", (p) => { if (!vivo.si) return; const pila = new Error().stack.split("\n").map((l) => (/at (?:async )?(?:CobroContinuo\.)?(\w+)/.exec(l) || [])[1]).filter((x) => x && /reconciliar|revisarPendientes|_resolverDeFondo|_cerrar|_vigilar|_pagado|_entregar/.test(x)); entregas.push({ ref: p.ref, credito: !!p.credito, t: reloj.mono(), via: [...new Set(pila)].join("<"), fase: inst.fase, esperando: !!maquina.esperandoPago }); });
  maquina.on("vista", (v) => { if (vivo.si) inst.fase = v.fase; });
  const ses = maquina._sesion.bind(maquina);
  maquina._sesion = (p) => { if (vivo.si) sesionRef = p.ref; return ses(p); };
  maquina.arrancar();
  return inst;
}
function apagon(i) {
  i.vivo.si = false;
  i.maquina.detenido = true; i.maquina.grupoFijo.cancelar(); if (i.maquina.gFase) i.maquina.gFase.cancelar();
  if (i.cobro.revision) i.cobro.revision.cancelar(); if (i.cobro.grupo) i.cobro.grupo.cancelar();
  i.cobro.destruido = true; i.sensor.cerrado = true;
  sim.reiniciar();
}

(async () => {
  let inst = montar();
  let pagadas = 0, cortes = 0, sopladores = 0;
  const fin = reloj.mono() + HORAS * 3600000;
  let cliente = null; // { fase: "pagar"|"soplar", hasta }
  while (reloj.mono() < fin) {
    await reloj.avanzar(500);
    nube.tic();
    // averías
    if (rnd() < 0.0008) { nube.fallos.sinInternet = !nube.fallos.sinInternet; }
    if (nube.fallos.sinInternet && rnd() < 0.004) nube.fallos.sinInternet = false;
    nube.fallos.cortarRespuesta = rnd() < 0.002 ? 0.3 : nube.fallos.cortarRespuesta && rnd() < 0.01 ? 0 : nube.fallos.cortarRespuesta;
    nube.fallos.error500 = rnd() < 0.002 ? 0.3 : nube.fallos.error500 && rnd() < 0.01 ? 0 : nube.fallos.error500;
    red.lenta = rnd() < 0.002 ? 20000 : red.lenta && rnd() < 0.01 ? 0 : red.lenta;
    if (rnd() < 0.0005) sim.fallos.desconectado = true;
    if (sim.fallos.desconectado && rnd() < 0.02) sim.fallos.desconectado = false;
    if (rnd() < 0.0004) { apagon(inst); cortes++; await reloj.avanzar(2000 + rnd() * 60000); inst = montar(); }
    // clientes
    if (!cliente && nube.pidiendoTarjeta() && rnd() < 0.01) {
      const ok = rnd() < 0.85;
      const refPago = nube.actual && nube.actual.foreign_transaction_id;
      if (refPago) pagosT.set(refPago, reloj.mono());
      if (nube.pasarTarjeta(ok, rnd() < 0.2 ? 20000 + rnd() * 90000 : 1800)) { if (ok) pagadas++; cliente = ok ? { ref: refPago, hasta: reloj.mono() + (rnd() < 0.5 ? 3 : 8) * 60000, sopla: rnd() < 0.85 } : null; }
    }
    if (cliente && reloj.mono() > cliente.hasta) cliente = null;
    if (cliente && inst.fase === "sopla" && cliente.sopla && !sim.soplando) {
      sim.alcohol = rnd() * 1.2; sim.soplar(true); sopladores++;
      if (!cliente.usado || cliente.usado[cliente.usado.length - 1] !== sesionRef) { (cliente.usado = cliente.usado || []).push(sesionRef); usos.push({ pagador: cliente.ref, sesion: sesionRef, t: reloj.mono() }); }
      const ms = rnd() < 0.2 ? 1500 : 4600;
      reloj.temporizador(ms, () => sim.soplar(false));
    }
    if (cliente && inst.fase === "resultado") cliente = null;
  }
  // tranquilidad: todo sano 4 h para que se resuelva lo pendiente (y un reinicio en medio)
  nube.fallos.sinInternet = false; nube.fallos.cortarRespuesta = 0; nube.fallos.error500 = 0; red.lenta = 0; sim.fallos.desconectado = false;
  for (let i = 0; i < 4 * 7200; i++) { await reloj.avanzar(500); nube.tic(); if (i === 7200) { apagon(inst); inst = montar(); } }
  // invariantes
  const partidas = [];
  for (const f of await fsBase.listar("partidas")) for (const l of Buffer.from(await fsBase.leer("partidas/" + f.nombre)).toString().split("\n")) { try { if (l.trim()) partidas.push(JSON.parse(l)); } catch (e) {} }
  const porRef = new Map();
  for (const p of partidas) porRef.set(p.cobro, (porRef.get(p.cobro) || 0) + 1);
  const malos = [];
  for (const t of nube.transacciones.values()) {
    const ref = t.foreign_transaction_id;
    const n = porRef.get(ref) || 0;
    const c = inst.almacen.cobro(ref) || {};
    if (t.refunded && n) malos.push(`REEMBOLSO + PARTIDA ${ref} (${c.estado})`);
    if (!t.refunded && !n) malos.push(`PAGADO SIN PRUEBA NI REEMBOLSO ${ref} (diario: ${c.estado || "—"}${c.creditos ? ", creditos " + c.creditos : ""})`);
    if (n > 1) malos.push(`${n} PARTIDAS PARA UN PAGO ${ref}`);
  }
  // ¿quién usó cada pago?
  const ajenos = usos.filter((u) => u.sesion !== u.pagador);
  const informes = [];
  for (const u of ajenos) {
    const t = [...nube.transacciones.values()].find((x) => x.foreign_transaction_id === u.sesion);
    const propio = [...nube.transacciones.values()].find((x) => x.foreign_transaction_id === u.pagador);
    const delPagadorOriginal = usos.some((v) => v.pagador === u.sesion && v.sesion === u.sesion);
    const e = entregas.filter((x) => x.ref === u.sesion).map((x) => `${x.via || "?"}${x.credito ? "(crédito)" : ""} a los ${Math.round((x.t - (pagosT.get(u.sesion) || 0)) / 1000)} s del pago, máquina en ${x.fase}${x.esperando ? "" : " SIN esperandoPago"}`).join(" | ");
    informes.push(e);
    if (0) malos.push(`PRUEBA DE OTRO: quien pagó ${u.pagador} (${propio && propio.refunded ? "luego reembolsado" : (porRef.get(u.pagador) ? "su pago también con partida" : "—")}) sopló en la sesión del pago ${u.sesion}; el dueño de ese pago ${delPagadorOriginal ? "también sopló" : "NO tuvo prueba"}${t && t.refunded ? " (reembolsado)" : ""}`);
  }
  for (const tid of solapes) malos.push(`reembolsos SIMULTÁNEOS (en vuelo a la vez) para la transacción ${tid}`);
  const abiertos = inst.almacen.cobrosAbiertos().filter((c) => c.ref !== inst.cobro.refBucle && !(inst.cobro.abierto && inst.cobro.abierto.ref === c.ref));
  for (const c of abiertos) malos.push(`ABIERTO AL FINAL ${c.ref} (${c.estado})`);
  for (const r of rechazos) malos.push("PROMESA RECHAZADA SIN CONTROLAR: " + r.slice(0, 300));
  console.log(`semilla ${SEED}: ${HORAS} h · pagos ${nube.transacciones.size} · partidas ${partidas.length} · reembolsados ${[...nube.transacciones.values()].filter((t) => t.refunded).length} · cortes ${cortes} · abiertos al final ${abiertos.length} · revisar ${inst.almacen.cobrosParaRevisar().length} · pruebas usadas por otro ${informes.length} · ${malos.length ? "FALLOS " + malos.length : "bien"}`);
  for (const x of malos) console.log("  ✗ " + x);
  if (process.argv.includes("--detalle")) for (const x of informes) console.log("  · usada por otro: " + x);
  process.exit(malos.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
