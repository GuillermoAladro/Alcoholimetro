/*
 * Pruebas de los fallos que encontró la revisión independiente del 26-10-2026 (uno por prueba). Cada una
 * reproduce el caso con el hardware simulado y comprueba que ya no pasa.
 */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { RelojVirtual } = require("../nucleo/reloj");
const { Almacen } = require("../nucleo/almacen");
const { ClienteSumUp } = require("../nucleo/sumup");
const { CobroContinuo } = require("../nucleo/cobro");
const { EST } = require("../nucleo/protocolo_ze29a");
const { NubeSumUp } = require("../sim/sumup_sim");
const { FSMemoria } = require("../sim/fs_memoria");
const H = require("./ayudas/montaje");

const CONF = { api_key: "k", merchant_code: "M1", reader_id: "r1", app_id: "a", affiliate_key: "b" };

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

/** Solo el cobro, con la nube simulada (y un fetch envuelto si hace falta). */
async function cobroSolo(o = {}) {
  const reloj = o.reloj || new RelojVirtual(Date.UTC(2026, 9, 26, 21));
  const fs = o.fs || new FSMemoria({ ahora: () => reloj.ahora() });
  const almacen = new Almacen({ fs, reloj });
  await almacen.abrir();
  const nube = o.nube || new NubeSumUp({ reloj, api_key: "k", merchant_code: "M1", reader_id: "r1" });
  nube.fallos.latenciaMs = 50;
  const peticiones = [];
  const fetch = async (url, op) => {
    peticiones.push(((op && op.method) || "GET") + " " + url);
    return o.fetch ? o.fetch(nube, url, op) : nube.fetch(url, op);
  };
  const cliente = new ClienteSumUp({ fetch, reloj, config: CONF });
  const cobro = new CobroContinuo({ cliente, almacen, reloj, config: Object.assign({ consulta_ms: 3000 }, o.config || {}) });
  const pagos = [];
  const fases = [];
  cobro.on("pagado", (p) => pagos.push(p));
  cobro.on("estado", (f) => fases.push(f.fase));
  const pantallas = [];
  nube.on("pantalla", (p) => pantallas.push(p.modo));
  return { reloj, fs, almacen, nube, cliente, cobro, pagos, fases, pantallas, peticiones };
}

test("#1 pago lento (PIN) que acaba después de los 90 s: se da la prueba, nunca queda como caducado", async () => {
  const m = await cobroSolo();
  m.cobro.iniciar();
  await m.reloj.hasta(() => m.nube.pidiendoTarjeta(), 20000, 100);
  await m.reloj.avanzar(52000);
  const c = m.nube.actual;
  assert.ok(m.nube.pasarTarjeta(true, 45000), "acepta la tarjeta"); // a los ~55 s; aprobado a los ~100 s
  await m.reloj.avanzar(3 * 60000);
  assert.equal(c.status, "successful");
  assert.equal(m.pagos.length, 1, "la máquina recibe el pago");
  assert.equal(m.pagos[0].ref, c.foreign_transaction_id);
  assert.equal(m.almacen.cobro(c.foreign_transaction_id).estado, "pagado");
  assert.ok(!Array.from(m.almacen.cobros.values()).some((x) => x.estado === "caducado" && x.ref === c.foreign_transaction_id));
});

test("#1 al parar el programa, el terminate sale antes de que el proceso termine", async () => {
  const m = await cobroSolo();
  m.cobro.iniciar();
  await m.reloj.hasta(() => m.nube.pidiendoTarjeta(), 20000, 100);
  await correr(m.reloj, m.cobro.detener());
  assert.equal(m.nube.pidiendoTarjeta(), false, "el Solo ya no pide tarjeta cuando detener() termina");
});

test("#2 fallo en el mismo punto en cada arranque: como mucho 2 pruebas pendientes y después reembolso", async () => {
  let m = H.montar();
  let reembolsos = 0;
  m.nube.on("reembolso", () => reembolsos++);
  await H.arrancar(m);
  await H.hastaFase(m, "espera");
  await H.pagar(m);
  await H.hastaFase(m, "sopla", 30000);
  let sesiones = 1;
  for (let i = 0; i < 10; i++) {
    await m.reloj.avanzar(20000);
    m = H.apagon(m, { sensorSigue: true }); // muere siempre en "sopla"
    await H.arrancar(m);
    await m.reloj.hasta(() => m.maquina.vistaActual && ["sopla", "espera"].includes(m.maquina.vistaActual.fase), 60000, 200);
    if (m.maquina.vistaActual.fase === "espera") break;
    sesiones++;
  }
  assert.equal(sesiones, 3, "la prueba pagada y dos reintentos");
  await m.reloj.hasta(() => reembolsos > 0, 60000, 500);
  assert.equal(reembolsos, 1);
});

test("#3 si no se puede apuntar 'consumido', la persona que vio su resultado no recibe reembolso ni prueba gratis", async () => {
  const m = H.montar();
  const orig = m.fs.anadir.bind(m.fs);
  m.fs.anadir = async (r, t) => {
    if (r === "cobros.jsonl" && t.includes('"consumido"')) throw Object.assign(new Error("EIO"), { code: "EIO" });
    return orig(r, t);
  };
  let reembolsos = 0;
  m.nube.on("reembolso", () => reembolsos++);
  await H.arrancar(m);
  const v = await H.pruebaBuena(m, 0.5);
  assert.equal(v.fase, "resultado");
  m.fs.anadir = orig;
  await m.reloj.avanzar(40 * 60000);
  assert.equal(reembolsos, 0, "en marcha");
  // apagón: en el disco el cobro quedó en "en_prueba", pero su partida está guardada
  const m2 = H.apagon(m);
  let pruebas = 0;
  m2.maquina.on("vista", (x) => x.fase === "pagado" && pruebas++);
  await H.arrancar(m2);
  await m2.reloj.avanzar(30 * 60000);
  assert.equal(pruebas, 0, "sin prueba gratis");
  assert.equal(reembolsos, 0, "sin reembolso");
  const c = Array.from(m2.almacen.cobros.values()).find((x) => x.partida || x.motivo === "la prueba ya se hizo");
  assert.equal(c.estado, "consumido");
});

test("#4 un incierto viejo que no se resuelve no cancela el cobro de la persona que está delante", async () => {
  const m = await cobroSolo({
    fetch: async (nube, url, op) => {
      if (url.includes("foreign_transaction_id")) return { ok: false, status: 400, text: async () => '{"detail":"unsupported query"}' };
      return nube.fetch(url, op);
    },
  });
  await m.almacen.anotarCobro("20261026-200000-aaaaaa", { estado: "incierto", motivo: "red" });
  await correr(m.reloj, m.cobro.reconciliar()).catch(() => {});
  m.cobro.iniciar();
  await m.reloj.avanzar(60 * 60000);
  assert.equal(m.pantallas.filter((x) => x === "cancelado").length, 0, "ningún cobro en espera cancelado");
  const terminates = m.peticiones.filter((x) => x.includes("/terminate")).length;
  assert.ok(terminates <= 1, "terminates en 1 h: " + terminates); // solo el de la reconciliación, con el lector libre
  assert.equal(m.pagos.length, 0);
});

test("#5 SumUp no encuentra el cobro (404): se cancela, se busca el pago y no se siguen abriendo cobros a ciegas", async () => {
  let roto = true;
  const m = await cobroSolo({
    fetch: async (nube, url, op) => {
      if (roto && op.method !== "POST" && /\/checkout\/[^/]+$/.test(new URL(url).pathname)) return { ok: false, status: 404, text: async () => '{"title":"NOT_FOUND"}' };
      return nube.fetch(url, op);
    },
  });
  m.cobro.iniciar();
  await m.reloj.hasta(() => m.nube.pidiendoTarjeta(), 20000, 100);
  m.nube.pasarTarjeta(true); // paga justo antes de que la Pi vea el 404
  await m.reloj.avanzar(30000);
  assert.equal(m.pagos.length, 1, "el pago se encuentra por foreign_transaction_id");
  assert.equal(m.almacen.cobro(m.pagos[0].ref).estado, "pagado");
  // sin pagar: el cobro no queda abierto en el lector y la máquina deja de abrir cobros un rato
  m.cobro.liberar(m.pagos[0].ref);
  m.cobro.iniciar();
  await m.reloj.avanzar(20000);
  assert.equal(m.nube.pidiendoTarjeta(), false);
  assert.equal(m.cobro.fase.fase, "no_disponible");
  roto = false;
  await m.reloj.avanzar(10 * 60000);
  assert.equal(m.nube.pidiendoTarjeta(), true, "vuelve solo");
});

test("#5 respuesta perdida al crear (ECONNRESET): incierto y luego anulado; sin red (DNS): anulado sin dudas", async () => {
  const m = await cobroSolo();
  m.nube.fallos.cortarRespuesta = 1;
  m.cobro.iniciar();
  await m.reloj.avanzar(3000);
  m.nube.fallos.cortarRespuesta = 0;
  await m.reloj.avanzar(2000);
  const inciertos = Array.from(m.almacen.cobros.values()).filter((c) => c.estado === "incierto");
  assert.equal(inciertos.length, 1);
  await m.reloj.avanzar(20 * 60000);
  assert.equal(m.almacen.cobro(inciertos[0].ref).estado, "anulado", "a los minutos, sin pago, se cierra");
  // sin internet: las peticiones de crear no salen y no dejan inciertos (el cobro que estaba abierto cuando se
  // fue la red sí, porque no se puede consultar: ese lo resuelve el fondo cuando vuelve)
  m.nube.fallos.sinInternet = true;
  await m.reloj.avanzar(10 * 60000);
  const deCrear = Array.from(m.almacen.cobros.values()).filter((c) => c.estado === "incierto" && c.motivo === "red");
  assert.equal(deCrear.length, 0);
  assert.ok(Array.from(m.almacen.cobros.values()).filter((c) => c.motivo === "sin conexión").length >= 5);
  m.nube.fallos.sinInternet = false;
  await m.reloj.avanzar(30 * 60000);
  assert.equal(Array.from(m.almacen.cobros.values()).filter((c) => c.estado === "incierto").length, 0, "todo resuelto al volver la red");
  await correr(m.reloj, m.cobro.destruir());
});

test("#6 la hora salta 2 h hacia delante en mitad de una prueba: ni reembolso a medias ni cobro cancelado", async () => {
  const m = H.montar();
  let reembolsos = 0;
  m.nube.on("reembolso", () => reembolsos++);
  await H.arrancar(m);
  await H.hastaFase(m, "espera");
  await H.pagar(m);
  await H.hastaFase(m, "sopla", 30000);
  m.reloj.adelantar(2 * 3600 * 1000); // NTP corrige la hora
  await correr(m.reloj, m.cobro.revisarPendientes()); // la revisión de fondo pasa justo entonces
  await m.reloj.avanzar(5000);
  assert.equal(reembolsos, 0);
  assert.equal(m.maquina.vistaActual.fase, "sopla");
  m.sim.alcohol = 0.3;
  m.sim.soplar(true);
  await m.reloj.avanzar(m.sim.segSoplido * 1000 + 300);
  m.sim.soplar(false);
  await H.hastaFase(m, "resultado", 30000);
  assert.equal(reembolsos, 0);
  await H.hastaFase(m, "espera", 60000);
  await m.reloj.avanzar(6 * 60000);
  assert.equal(m.nube.pidiendoTarjeta(), true);
  assert.equal(reembolsos, 0);
});

test("#7 reembolso con la red caída 2 h: no se da por imposible y se hace al volver; un 409 cuenta como hecho", async () => {
  const m = await cobroSolo();
  m.cobro.iniciar();
  await m.reloj.hasta(() => m.nube.pidiendoTarjeta(), 20000, 100);
  m.nube.pasarTarjeta(true);
  await m.reloj.avanzar(8000);
  const ref = m.pagos[0].ref;
  m.nube.fallos.sinInternet = true;
  await correr(m.reloj, m.cobro.reembolsar(ref, "prueba"));
  m.cobro.liberar(ref);
  await m.reloj.avanzar(2 * 3600 * 1000);
  assert.equal(m.almacen.cobro(ref).estado, "a_reembolsar");
  m.nube.fallos.sinInternet = false;
  await m.reloj.avanzar(70 * 60000);
  assert.equal(m.almacen.cobro(ref).estado, "reembolsado");
  // otra vez el mismo (por un diario viejo, por ejemplo): SumUp dice 409 y se comprueba que ya está devuelto
  await m.almacen.anotarCobro(ref, { estado: "a_reembolsar" });
  await correr(m.reloj, m.cobro.reembolsar(ref, "repetido"));
  assert.equal(m.almacen.cobro(ref).estado, "reembolsado");
  await correr(m.reloj, m.cobro.destruir());
});

test("#8 si falla el análisis, el aviso de reembolso no lo pisa el flash de la foto", async () => {
  const m = H.montar();
  await H.arrancar(m);
  m.sensor.leerResultado = async () => {
    throw Object.assign(new Error("lecturas distintas"), { codigo: "RESULTADO_INCOHERENTE" });
  };
  await H.hastaFase(m, "espera");
  await H.pagar(m);
  await H.hastaFase(m, "sopla", 30000);
  m.sim.soplar(true);
  await m.reloj.avanzar(m.sim.segSoplido * 1000 + 300);
  m.sim.soplar(false);
  await H.hastaFase(m, "aviso", 20000);
  const i = m.vistas.findIndex((v) => v.fase === "aviso");
  await m.reloj.avanzar(5000);
  const despues = m.vistas.slice(i + 1).filter((v) => v.fase !== "aviso");
  assert.equal(despues.filter((v) => v.fase === "analizando").length, 0, "nada de 'analizando' tras el aviso");
});

test("#9 ciclo del sensor que quedaba de una prueba anulada: su minuto no cuenta como 'nadie sopla'", async () => {
  const m = H.montar();
  await H.arrancar(m);
  await H.hastaFase(m, "espera");
  // el sensor se queda esperando soplido con 50 s ya gastados (de una prueba anterior)
  m.sim._ir(EST.PRECALENTANDO);
  await m.reloj.avanzar(10000 + 50000);
  assert.equal(m.sim.estado, EST.ESPERANDO_SOPLIDO);
  await H.pagar(m);
  await H.hastaFase(m, "sopla", 20000);
  // nadie sopla: caduca el ciclo heredado (no cuenta) y luego uno entero (cuenta 1 de 2): sigue la prueba
  // (heredado ~10 s + precalentar 10 s + minuto entero 60 s + precalentar 10 s; con el fallo, aquí ya era "aviso")
  await m.reloj.avanzar(10000 + 10000 + 60000 + 5000);
  assert.ok(["preparando", "sopla"].includes(m.maquina.vistaActual.fase), "sigue: " + m.maquina.vistaActual.fase);
  assert.ok(m.fases().filter((f) => f === "sopla").length >= 3, m.fases().join(" → "));
  await H.hastaFase(m, "sopla", 30000);
  m.sim.alcohol = 0.2;
  m.sim.soplar(true);
  await m.reloj.avanzar(m.sim.segSoplido * 1000 + 300);
  m.sim.soplar(false);
  await H.hastaFase(m, "resultado", 30000);
});

test("#10 programa vivo pero atascado: la máquina lo dice para que sistema.js lo reinicie", async () => {
  const m = H.montar();
  await H.arrancar(m);
  await H.hastaFase(m, "espera");
  assert.equal(m.maquina.atascada(), null);
  // la tarjeta SD se cuelga: la comprobación de salud no termina nunca
  m.almacen.salud = () => new Promise(() => {});
  await m.reloj.avanzar(6 * 60000);
  assert.match(String(m.maquina.atascada()), /salud/);
});

test("#11 un cobro que caduca y SumUp lo da como 'failed' no enseña 'pago rechazado'", async () => {
  const m = await cobroSolo({
    fetch: async (nube, url, op) => {
      const r = await nube.fetch(url, op);
      if (op.method === "GET" && /\/checkout\/[^/]+$/.test(new URL(url).pathname)) {
        const j = JSON.parse(await r.text());
        if (j.data.status === "cancelled") {
          j.data.status = "failed";
          j.data.payment_failure_reason = "EXPIRED";
        }
        return { ok: true, status: 200, text: async () => JSON.stringify(j) };
      }
      return r;
    },
  });
  m.cobro.iniciar();
  await m.reloj.avanzar(5 * 60000);
  assert.equal(m.fases.filter((f) => f === "rechazado").length, 0);
  assert.ok(Array.from(m.almacen.cobros.values()).filter((c) => c.estado === "caducado").length >= 3);
  await correr(m.reloj, m.cobro.destruir());
});

test("#12 restos .tmp de un apagón se borran al arrancar", async () => {
  const reloj = new RelojVirtual(Date.UTC(2026, 9, 26, 21));
  const fs = new FSMemoria({ ahora: () => reloj.ahora() });
  await fs.crearDir("fotos");
  await fs.escribirAtomico("fotos/20261026-200000-abcdef.jpg.tmp", new Uint8Array([1, 2, 3]));
  await fs.escribirAtomico("estado.json.tmp", new Uint8Array([1]));
  const almacen = new Almacen({ fs, reloj });
  await almacen.abrir();
  const nombres = (await fs.listar("fotos")).map((f) => f.nombre).concat((await fs.listar("")).map((f) => f.nombre));
  assert.ok(!nombres.some((n) => n.endsWith(".tmp")), nombres.join(", "));
});

test("sin Affiliate Key no se cobra (no se podría encontrar un pago perdido)", async () => {
  const reloj = new RelojVirtual(Date.UTC(2026, 9, 26, 21));
  const c = new ClienteSumUp({ fetch: async () => ({}), reloj, config: { api_key: "k", merchant_code: "M", reader_id: "r" } });
  assert.equal(c.configurado(), false);
  assert.equal(new ClienteSumUp({ fetch: async () => ({}), reloj, config: CONF }).configurado(), true);
});

test("los estados finales del cobro y del almacén son los mismos", () => {
  const A = require("../nucleo/almacen");
  const C = require("../nucleo/cobro");
  assert.deepEqual([...A.FINALES].sort(), [...C.FINALES].sort());
});
