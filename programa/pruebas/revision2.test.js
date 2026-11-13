/*
 * Pruebas de lo que encontró la segunda revisión independiente (26-10-2026), sobre el cobro ya reescrito.
 */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { RelojVirtual } = require("../nucleo/reloj");
const { Almacen } = require("../nucleo/almacen");
const { ClienteSumUp } = require("../nucleo/sumup");
const { CobroContinuo } = require("../nucleo/cobro");
const { NubeSumUp } = require("../sim/sumup_sim");
const { FSMemoria } = require("../sim/fs_memoria");
const H = require("./ayudas/montaje");

const CONF = { api_key: "k", merchant_code: "M1", reader_id: "r1", app_id: "a", affiliate_key: "b" };
const MIN = 60000;

async function correr(reloj, p, max = 180000) {
  let fin = false;
  let v;
  let err;
  p.then((x) => ((fin = true), (v = x)), (e) => ((fin = true), (err = e)));
  await reloj.hasta(() => fin, max, 100);
  if (err) throw err;
  assert.ok(fin, "no terminó");
  return v;
}

async function cobroSolo(o = {}) {
  const reloj = o.reloj || new RelojVirtual(Date.UTC(2026, 9, 26, 21));
  const fs = o.fs || new FSMemoria({ ahora: () => reloj.ahora() });
  const almacen = new Almacen({ fs, reloj });
  await almacen.abrir();
  const nube = o.nube || new NubeSumUp({ reloj, api_key: "k", merchant_code: "M1", reader_id: "r1" });
  nube.fallos.latenciaMs = 50;
  const peticiones = [];
  const fetch = async (url, op) => {
    peticiones.push({ t: reloj.mono(), q: ((op && op.method) || "GET") + " " + new URL(url).pathname });
    return o.fetch ? o.fetch(nube, url, op) : nube.fetch(url, op);
  };
  const cliente = new ClienteSumUp({ fetch, reloj, config: CONF });
  const cobro = new CobroContinuo({ cliente, almacen, reloj, config: Object.assign({ consulta_ms: 3000 }, o.config || {}) });
  const pagos = [];
  const fases = [];
  cobro.on("pagado", (p) => pagos.push(p));
  cobro.on("estado", (f) => fases.push(f.fase));
  let reembolsos = 0;
  nube.on("reembolso", () => reembolsos++);
  return { reloj, fs, almacen, nube, cliente, cobro, pagos, fases, peticiones, reembolsos: () => reembolsos };
}

test("pago que se descubre 40 min tarde (la Pi sin red, el Solo sí): reembolso, no una prueba para otro", async () => {
  const m = await cobroSolo();
  m.cobro.iniciar();
  await m.reloj.hasta(() => m.nube.pidiendoTarjeta(), 20000, 100);
  m.nube.fallos.sinInternet = true; // se cuelga el Wi-Fi de la Pi; el Solo tiene su propia conexión
  await m.reloj.avanzar(2000);
  assert.ok(m.nube.pasarTarjeta(true));
  await m.reloj.avanzar(40 * MIN);
  assert.equal(m.pagos.length, 0);
  m.nube.fallos.sinInternet = false; // vuelve la red
  await m.reloj.avanzar(7 * MIN);
  assert.equal(m.pagos.length, 0, "nada de prueba pendiente para un pago de hace 40 min");
  assert.equal(m.reembolsos(), 1, "se reembolsa en cuanto vuelve la red (los fallos de red no alargan la espera)");
  await correr(m.reloj, m.cobro.destruir());
});

test("un pago que llega mientras se comprueba la salud no se queda olvidado en la cola", async () => {
  const reloj = new RelojVirtual(Date.UTC(2026, 9, 26, 21));
  const m = H.montar({ reloj });
  await H.arrancar(m);
  await H.pruebaBuena(m, 0.3);
  // la siguiente comprobación de salud del director (entre pruebas) entrega un pago justo antes de terminar
  const ref = "20261026-210500-dddddd";
  let disparar = true;
  const orig = m.almacen.salud.bind(m.almacen);
  m.almacen.salud = async () => {
    const r = await orig();
    if (disparar && !m.maquina.esperandoPago) {
      disparar = false;
      await m.almacen.anotarCobro(ref, { estado: "pagado", t_pago: reloj.ahora() });
      m.cobro._entregar(ref, { credito: true });
    }
    return r;
  };
  await H.hastaFase(m, "espera", 60000);
  await reloj.hasta(() => m.vistas.filter((v) => v.fase === "pagado").length >= 2, 60000, 200);
  assert.equal(m.vistas.filter((v) => v.fase === "pagado").length, 2, "la prueba de ese pago empieza");
  assert.deepEqual(m.maquina.creditos, []);
});

test("reembolso que no encuentra la transacción durante horas: sigue intentándolo y lo hace cuando aparece", async () => {
  let buscarRoto = false;
  const m = await cobroSolo({
    fetch: async (nube, url, op) => {
      if (buscarRoto && /\/transactions$/.test(new URL(url).pathname)) return { ok: false, status: 404, text: async () => '{"title":"NOT_FOUND"}' };
      return nube.fetch(url, op);
    },
  });
  m.cobro.iniciar();
  await m.reloj.hasta(() => m.nube.pasarTarjeta(true), 20000, 100);
  await m.reloj.avanzar(8000);
  const ref = m.pagos[0].ref;
  buscarRoto = true;
  await correr(m.reloj, m.cobro.reembolsar(ref, "prueba"));
  m.cobro.liberar(ref);
  await m.reloj.avanzar(6 * 60 * MIN);
  assert.equal(m.almacen.cobro(ref).estado, "a_reembolsar", "6 h después no se da por imposible");
  buscarRoto = false;
  await m.reloj.avanzar(65 * MIN);
  assert.equal(m.almacen.cobro(ref).estado, "reembolsado");
  assert.equal(m.reembolsos(), 1);
  await correr(m.reloj, m.cobro.destruir());
});

test("la revisión de fondo funciona aunque la máquina no llegue a la espera (sensor roto)", async () => {
  let m = H.montar();
  let reembolsos = 0;
  m.nube.on("reembolso", () => reembolsos++);
  await H.arrancar(m);
  await H.hastaFase(m, "espera");
  await H.pagar(m);
  await H.hastaFase(m, "sopla", 30000);
  m.nube.fallos.sinInternet = true;
  m = H.apagon(m);
  m.sim.fallos.desconectado = true; // el sensor no vuelve
  await H.arrancar(m);
  await m.reloj.avanzar(20 * MIN);
  assert.equal(reembolsos, 0);
  m.nube.fallos.sinInternet = false;
  await m.reloj.avanzar(12 * MIN);
  assert.equal(m.maquina.vistaActual.fase, "fuera_servicio");
  assert.equal(reembolsos, 1, "el reembolso pendiente se hace sin pasar por la espera");
});

test("con el bucle ya en marcha, una resolución lenta del arranque no cancela el cobro de la persona", async () => {
  const reloj = new RelojVirtual(Date.UTC(2026, 9, 26, 21));
  const fs = new FSMemoria({ ahora: () => reloj.ahora() });
  await fs.crearDir("fotos");
  await fs.crearDir("partidas");
  const t0 = Date.UTC(2026, 9, 26, 20, 50);
  const lineas = [
    { ref: "20261026-205000-aaaaaa", t: t0, estado: "abierto", centimos: 200, checkout_id: "co_lento1" },
    { ref: "20261026-205001-bbbbbb", t: t0 + 1000, estado: "abierto", centimos: 200, checkout_id: "co_lento2" },
  ];
  await fs.anadir("cobros.jsonl", lineas.map((l) => "\n" + JSON.stringify(l)).join(""));
  const fetchLento = (nube) => async (url, op) => {
    const ruta = new URL(url).pathname;
    if (ruta.endsWith("/checkout/co_lento1")) return new Promise((_, mal) => op.signal.addEventListener("abort", () => mal(Object.assign(new Error("aborted"), { name: "AbortError" }))));
    if (ruta.endsWith("/checkout/co_lento2")) await reloj.esperar(12000);
    return nube.fetch(url, op);
  };
  const m = H.montar({ reloj, fs, fetch: fetchLento });
  await H.arrancar(m);
  await m.reloj.avanzar(15000);
  const delBucle = Array.from(m.almacen.cobros.values()).filter((c) => c.estado === "cancelado" && !lineas.some((l) => l.ref === c.ref));
  assert.deepEqual(delBucle, [], "ningún cobro del bucle cancelado");
  assert.equal(m.nube.pidiendoTarjeta(), true);
});

test("tarjeta SD de solo lectura y estado.json que hay que reconstruir: arranca, no cobra y hace el reembolso pendiente", async () => {
  let m = H.montar();
  let reembolsos = 0;
  m.nube.on("reembolso", () => reembolsos++);
  await H.arrancar(m);
  await H.pruebaBuena(m, 0.4); // una partida en el disco
  await H.hastaFase(m, "espera", 60000);
  await H.pagar(m);
  await H.hastaFase(m, "sopla", 30000);
  const ref = Array.from(m.cobro.enManos)[0];
  await correr(m.reloj, m.almacen.anotarCobro(ref, { estado: "a_reembolsar", motivo: "prueba" }));
  await correr(m.reloj, m.fs.borrar("estado.json")); // al arrancar habrá que reconstruirlo
  m = H.apagon(m);
  m.fs.fallos.soloLectura = true;
  let fin = false;
  m.maquina.arrancar().then(() => (fin = true));
  await m.reloj.avanzar(10 * MIN);
  assert.equal(fin, true, "arrancar termina");
  assert.equal(m.almacen.ranking.total, 1, "el ranking se reconstruye en memoria");
  assert.equal(m.maquina.vistaActual.fase, "fuera_servicio");
  assert.equal(m.nube.pidiendoTarjeta(), false, "no cobra");
  assert.equal(reembolsos, 1, "el reembolso pendiente se hace");
});

test("Wi-Fi con portal cautivo (error de certificado): ningún cobro incierto, solo 'sin conexión'", async () => {
  const m = await cobroSolo({
    fetch: async () => {
      const e = new TypeError("fetch failed");
      e.cause = { code: "ERR_TLS_CERT_ALTNAME_INVALID" };
      throw e;
    },
  });
  m.cobro.iniciar();
  await m.reloj.avanzar(60 * MIN);
  const todos = Array.from(m.almacen.cobros.values());
  assert.equal(todos.filter((c) => c.estado === "incierto").length, 0);
  assert.equal(m.cobro.fase.fase, "no_disponible");
  await correr(m.reloj, m.cobro.destruir());
});

test("respuestas que se pierden siempre: como mucho 5 cobros en duda y la máquina deja de abrir más", async () => {
  const m = await cobroSolo();
  m.nube.fallos.cortarRespuesta = 1;
  m.cobro.iniciar();
  await m.reloj.avanzar(3 * 60 * MIN);
  const dudosos = Array.from(m.almacen.cobros.values()).filter((c) => c.estado === "incierto" || c.estado === "abriendo").length;
  assert.ok(dudosos <= 6, "en duda: " + dudosos);
  assert.equal(m.cobro.fase.fase, "no_disponible");
  m.nube.fallos.cortarRespuesta = 0;
  await m.reloj.avanzar(40 * MIN);
  assert.equal(Array.from(m.almacen.cobros.values()).filter((c) => c.estado === "incierto").length, 0, "se aclaran al volver la normalidad");
  assert.equal(m.nube.pidiendoTarjeta(), true);
  await correr(m.reloj, m.cobro.destruir());
});

test("reembolso en vuelo cuando termina la prueba: un solo reembolso y nunca una prueba gratis", async () => {
  let lento = false;
  let posts = 0;
  const m = await cobroSolo({
    fetch: async (nube, url, op) => {
      if (/\/refunds$/.test(new URL(url).pathname)) posts++;
      if (lento) await m.reloj.esperar(12000);
      return nube.fetch(url, op);
    },
  });
  m.cobro.iniciar();
  await m.reloj.hasta(() => m.nube.pasarTarjeta(true), 20000, 100);
  await m.reloj.avanzar(8000);
  const ref = m.pagos[0].ref;
  await correr(m.reloj, m.almacen.anotarCobro(ref, { estado: "en_prueba" }));
  lento = true;
  const r1 = m.cobro.reembolsar(ref, "SIN_SOPLIDO");
  await m.reloj.avanzar(15000);
  m.cobro.liberar(ref);
  const r2 = m.cobro.revisarPendientes();
  await correr(m.reloj, Promise.all([r1, r2]));
  assert.equal(posts, 1);
  assert.equal(m.pagos.length, 1, "ningún crédito para ese pago");
  assert.equal(m.almacen.cobro(ref).estado, "reembolsado");
});

test("un rechazo de verdad (PIN mal) sí enseña 'pago rechazado'", async () => {
  const m = await cobroSolo({
    fetch: async (nube, url, op) => {
      const r = await nube.fetch(url, op);
      if (op.method === "GET" && /\/checkout\/[^/]+$/.test(new URL(url).pathname)) {
        const j = JSON.parse(await r.text());
        if (j.data.status === "failed") j.data.payment_failure_reason = "INVALID_PIN";
        return { ok: true, status: 200, text: async () => JSON.stringify(j) };
      }
      return r;
    },
  });
  m.cobro.iniciar();
  await m.reloj.hasta(() => m.nube.pidiendoTarjeta(), 20000, 100);
  m.nube.pasarTarjeta(false);
  await m.reloj.avanzar(10000);
  assert.ok(m.fases.includes("rechazado"));
  await correr(m.reloj, m.cobro.destruir());
});

test("tras un apagón, la instancia vieja ya no habla con SumUp", async () => {
  const m = H.montar();
  await H.arrancar(m);
  await H.hastaFase(m, "espera");
  const viejo = m.cobro.cliente;
  let peticionesViejas = 0;
  const m2 = H.apagon(m);
  await m2.reloj.avanzar(1000); // lo que estaba ya en el aire llega (como en la realidad)
  viejo.on("peticion", (p) => p.http !== 0 && peticionesViejas++);
  await H.arrancar(m2);
  await m2.reloj.avanzar(10 * MIN);
  assert.equal(peticionesViejas, 0);
});
