/* Cobro continuo con el Solo simulado: renovación, pago, rechazo, red caída, respuesta perdida, apagón y reembolso. */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { RelojVirtual } = require("../nucleo/reloj");
const { Almacen } = require("../nucleo/almacen");
const { ClienteSumUp } = require("../nucleo/sumup");
const { CobroContinuo } = require("../nucleo/cobro");
const { NubeSumUp } = require("../sim/sumup_sim");
const { FSMemoria } = require("../sim/fs_memoria");

const CONF = { api_key: "k", merchant_code: "M1", reader_id: "r1", app_id: "app", affiliate_key: "aff", base_url: "https://api.sumup.com" };

/** Espera una promesa dejando correr el reloj virtual (las peticiones simuladas tardan "de verdad"). */
async function correr(reloj, p, max = 120000) {
  let fin = false;
  let v;
  let err;
  p.then((x) => ((fin = true), (v = x)), (e) => ((fin = true), (err = e)));
  await reloj.hasta(() => fin, max, 100);
  if (err) throw err;
  assert.ok(fin, "no terminó");
  return v;
}

async function montar(o = {}) {
  const reloj = o.reloj || new RelojVirtual(Date.UTC(2026, 9, 26, 21));
  const fs = o.fs || new FSMemoria({ ahora: () => reloj.ahora() });
  const almacen = new Almacen({ fs, reloj });
  await almacen.abrir();
  const nube = o.nube || new NubeSumUp({ reloj, api_key: "k", merchant_code: "M1", reader_id: "r1" });
  nube.fallos.latenciaMs = 50;
  const fetch = o.fetch ? o.fetch(nube) : nube.fetch;
  const cliente = new ClienteSumUp({ fetch, reloj, config: Object.assign({}, CONF, o.conf || {}) });
  const cobro = new CobroContinuo({ cliente, almacen, reloj, config: { consulta_ms: 3000 } });
  const pagos = [];
  const fases = [];
  cobro.on("pagado", (p) => pagos.push(p));
  cobro.on("estado", (f) => fases.push(f.fase));
  return { reloj, fs, almacen, nube, cliente, cobro, pagos, fases };
}

test("sin nadie: el lector pide tarjeta siempre y los cobros se renuevan al caducar", async () => {
  const m = await montar();
  let creados = 0;
  m.nube.on("pantalla", (p) => p.modo === "esperando" && creados++);
  m.cobro.iniciar();
  let sinPedir = 0;
  for (let s = 0; s < 600; s++) {
    await m.reloj.avanzar(1000);
    if (!m.nube.pidiendoTarjeta()) sinPedir++;
  }
  assert.ok(creados >= 9 && creados <= 11, "cobros creados " + creados);
  assert.ok(sinPedir <= creados * 4, "segundos sin pedir tarjeta: " + sinPedir); // huecos de pocos segundos al renovar
  assert.equal(m.pagos.length, 0);
  assert.equal(m.almacen.cobrosAbiertos().length, 1); // solo el que está abierto ahora
  await correr(m.reloj, m.cobro.destruir());
});

test("pago con tarjeta: un solo 'pagado' y queda apuntado en el diario", async () => {
  const m = await montar();
  m.cobro.iniciar();
  await m.reloj.avanzar(5000);
  assert.equal(m.nube.pasarTarjeta(true), true);
  await m.reloj.avanzar(10000);
  assert.equal(m.pagos.length, 1);
  const c = m.almacen.cobro(m.pagos[0].ref);
  assert.equal(c.estado, "pagado");
  assert.ok(c.client_transaction_id);
  await m.reloj.avanzar(60000);
  assert.equal(m.pagos.length, 1); // el bucle se para tras el pago: no abre más cobros
  assert.equal(m.nube.pidiendoTarjeta(), false);
});

test("tarjeta rechazada: avisa y vuelve a pedir tarjeta", async () => {
  const m = await montar();
  m.cobro.iniciar();
  await m.reloj.avanzar(4000);
  m.nube.pasarTarjeta(false);
  await m.reloj.avanzar(9000);
  assert.ok(m.fases.includes("rechazado"));
  await m.reloj.avanzar(8000);
  assert.equal(m.nube.pidiendoTarjeta(), true);
  assert.equal(m.pagos.length, 0);
  await correr(m.reloj, m.cobro.destruir());
});

test("un cobro viejo ocupa el lector (READER_BUSY): se cancela y se sigue", async () => {
  const m = await montar();
  const viejo = m.nube.fetch("https://api.sumup.com/v0.1/merchants/M1/readers/r1/checkout", {
    method: "POST",
    headers: { Authorization: "Bearer k" },
    body: JSON.stringify({ total_amount: { currency: "EUR", minor_unit: 2, value: 200 } }),
  });
  await m.reloj.avanzar(500);
  assert.equal((await viejo).status, 201);
  m.cobro.iniciar();
  await m.reloj.avanzar(15000);
  assert.equal(m.nube.pidiendoTarjeta(), true);
  m.nube.pasarTarjeta(true);
  await m.reloj.avanzar(8000);
  assert.equal(m.pagos.length, 1);
});

test("sin internet: 'no disponible' y se recupera solo al volver la red", async () => {
  const m = await montar();
  m.nube.fallos.sinInternet = true;
  m.cobro.iniciar();
  await m.reloj.avanzar(60000);
  assert.equal(m.cobro.fase.fase, "no_disponible");
  m.nube.fallos.sinInternet = false;
  await m.reloj.avanzar(130000);
  assert.equal(m.nube.pidiendoTarjeta(), true);
  // los inciertos de la caída se resuelven como anulados (no había pago)
  await correr(m.reloj, m.cobro.revisarPendientes());
  const abiertos = m.almacen.cobrosAbiertos().filter((c) => c.estado === "incierto");
  assert.equal(abiertos.length, 0);
  await correr(m.reloj, m.cobro.destruir());
});

test("se pierde la respuesta al crear el cobro y alguien paga: el pago aparece (sin cobrar dos veces)", async () => {
  let perder = true;
  const m = await montar({
    fetch: (nube) => async (url, op) => {
      const r = await nube.fetch(url, op);
      if (perder && op.method === "POST" && url.endsWith("/checkout")) {
        perder = false;
        // la persona paga justo en ese momento
        setTimeout(() => {}, 0);
        nube.pasarTarjeta(true);
        throw new TypeError("conexión cortada");
      }
      return r;
    },
  });
  m.cobro.iniciar();
  await m.reloj.avanzar(30000);
  assert.equal(m.pagos.length, 1, "el pago se encuentra por foreign_transaction_id");
  assert.equal(m.pagos[0].ref, m.almacen.cobrosAbiertos().find((c) => c.estado === "pagado").ref);
});

test("apagón con un cobro abierto que se pagó mientras tanto: al arrancar hay prueba pendiente", async () => {
  const m = await montar();
  m.cobro.iniciar();
  await m.reloj.avanzar(5000);
  // apagón: el bucle muere sin cerrar nada
  m.cobro.destruido = true;
  m.cobro.grupo.cancelar();
  m.nube.pasarTarjeta(true);
  await m.reloj.avanzar(3000);
  // arranque nuevo con el mismo disco y la misma nube
  const almacen = new Almacen({ fs: m.fs, reloj: m.reloj });
  await almacen.abrir();
  const cobro = new CobroContinuo({ cliente: m.cliente, almacen, reloj: m.reloj });
  const creditos = [];
  cobro.on("pagado", (p) => creditos.push(p.ref));
  await correr(m.reloj, cobro.reconciliar());
  assert.equal(creditos.length, 1);
  assert.equal(almacen.cobro(creditos[0]).estado, "pagado");
});

test("pago sin prueba de hace más de 5 min: se reembolsa", async () => {
  const m = await montar();
  m.cobro.iniciar();
  await m.reloj.avanzar(4000);
  m.nube.pasarTarjeta(true);
  await m.reloj.avanzar(8000);
  assert.equal(m.pagos.length, 1);
  await m.reloj.avanzar(11 * 60000);
  const almacen = new Almacen({ fs: m.fs, reloj: m.reloj });
  await almacen.abrir();
  const cobro = new CobroContinuo({ cliente: m.cliente, almacen, reloj: m.reloj });
  const creditos = [];
  cobro.on("pagado", (p) => creditos.push(p.ref));
  await correr(m.reloj, cobro.reconciliar());
  assert.equal(creditos.length, 0);
  assert.equal(almacen.cobro(m.pagos[0].ref).estado, "reembolsado");
  const t = Array.from(m.nube.transacciones.values())[0];
  assert.equal(t.refunded, true);
});

test("detener con un cobro abierto: se cancela en el lector", async () => {
  const m = await montar();
  m.cobro.iniciar();
  await m.reloj.avanzar(5000);
  assert.equal(m.nube.pidiendoTarjeta(), true);
  await correr(m.reloj, m.cobro.detener());
  await m.reloj.avanzar(10000);
  assert.equal(m.nube.pidiendoTarjeta(), false);
  assert.equal(m.almacen.cobrosAbiertos().length, 0);
});
