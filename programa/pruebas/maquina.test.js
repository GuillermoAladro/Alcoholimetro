/*
 * La máquina entera con el hardware simulado y el reloj virtual: prueba buena, fallos tras cobrar,
 * apagones a mitad de prueba, sensor desconectado, tarjeta llena, cámara tapada o rota, y 300 pruebas seguidas.
 */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { RelojVirtual } = require("../nucleo/reloj");
const U = require("../nucleo/util");
const { Almacen } = require("../nucleo/almacen");
const { SensorZE29A } = require("../nucleo/sensor_ze29a");
const { ClienteSumUp } = require("../nucleo/sumup");
const { CobroContinuo } = require("../nucleo/cobro");
const { Maquina } = require("../nucleo/maquina");
const { ZE29ASimulado } = require("../sim/ze29a_sim");
const { NubeSumUp } = require("../sim/sumup_sim");
const { FSMemoria } = require("../sim/fs_memoria");

function camaraFalsa() {
  return {
    encendida: false,
    tapada: false,
    rota: false,
    colgada: false,
    async encender() {
      this.encendida = true;
      return true;
    },
    lista() {
      return this.encendida;
    },
    async foto() {
      if (this.rota) throw new Error("cámara rota");
      if (this.colgada) return new Promise(() => {});
      return { bytes: new Uint8Array([0xff, 0xd8, 9, 9, 9, 0xff, 0xd9]), tapada: this.tapada };
    },
    async apagar() {
      this.encendida = false;
    },
  };
}

/** Monta una máquina. Lo que se pase en `previo` (fs, nube, sim, camara, reloj) se reutiliza: así se simula un apagón. */
function montar(previo = {}) {
  const reloj = previo.reloj || new RelojVirtual(Date.UTC(2026, 9, 26, 21));
  const fs = previo.fs || new FSMemoria({ ahora: () => reloj.ahora() });
  const sim = previo.sim || new ZE29ASimulado({ reloj });
  const nube = previo.nube || new NubeSumUp({ reloj, api_key: "k", merchant_code: "M1", reader_id: "r1" });
  nube.fallos.latenciaMs = 60;
  const camara = previo.camara || camaraFalsa();
  const registro = U.crearRegistro({ consola: false, ahora: () => reloj.ahora() });
  const almacen = new Almacen({ fs, reloj, registro: registro.hijo("almacen") });
  const sensor = new SensorZE29A({ transporte: sim.transporte(), reloj, registro: registro.hijo("sensor") });
  const cliente = new ClienteSumUp({ fetch: nube.fetch, reloj, config: { api_key: "k", merchant_code: "M1", reader_id: "r1", app_id: "a", affiliate_key: "b" } });
  const cobro = new CobroContinuo({ cliente, almacen, reloj, registro: registro.hijo("cobro") });
  const maquina = new Maquina({ reloj, registro, sensor, cobro, camara, almacen, config: previo.config || {}, plataforma: { urlFoto: (id) => "/fotos/" + id + ".jpg" } });
  const vistas = [];
  maquina.on("vista", (v) => vistas.push(v));
  const fases = () => vistas.map((v) => v.fase).filter((f, i, a) => i === 0 || a[i - 1] !== f);
  return { reloj, fs, sim, nube, camara, almacen, sensor, cobro, maquina, vistas, fases, registro };
}

/** Arranca la máquina dejando correr el reloj (al arrancar habla con el sensor y con SumUp). */
async function arrancar(m) {
  let fin = false;
  let err = null;
  m.maquina.arrancar().then(() => (fin = true), (e) => ((fin = true), (err = e)));
  await m.reloj.hasta(() => fin, 60000, 100);
  if (err) throw err;
  assert.ok(fin, "no arranca");
}

const ultima = (m, fase) => [...m.vistas].reverse().find((v) => v.fase === fase);

async function hastaFase(m, fase, max = 120000) {
  const ok = await m.reloj.hasta(() => m.maquina.vistaActual && m.maquina.vistaActual.fase === fase, max, 100);
  assert.ok(ok, `no llega a "${fase}" (está en "${m.maquina.vistaActual && m.maquina.vistaActual.fase}")`);
}

async function pagar(m) {
  await m.reloj.hasta(() => m.nube.pidiendoTarjeta(), 120000, 200);
  assert.equal(m.nube.pasarTarjeta(true), true, "el lector no pedía tarjeta");
}

/** Hace una prueba buena entera. Devuelve la vista del resultado. */
async function pruebaBuena(m, alcohol = 0.5) {
  m.sim.alcohol = alcohol;
  await hastaFase(m, "espera");
  await pagar(m);
  await hastaFase(m, "pagado", 15000);
  await hastaFase(m, "sopla", 20000);
  m.sim.soplar(true);
  await hastaFase(m, "soplando", 2000);
  await m.reloj.avanzar(m.sim.segSoplido * 1000 + 300);
  m.sim.soplar(false);
  await hastaFase(m, "analizando", 3000);
  await hastaFase(m, "resultado", 15000);
  return m.maquina.vistaActual;
}

async function parar(m) {
  let fin = false;
  m.maquina.detener().then(() => (fin = true));
  await m.reloj.hasta(() => fin, 60000, 100);
}

test("prueba buena: pago → sopla → foto → resultado con puesto → vuelta a espera", async () => {
  const m = montar();
  await arrancar(m);
  const v = await pruebaBuena(m, 0.62);
  assert.deepEqual(m.fases().slice(0, 8), ["arranque", "espera", "pagado", "preparando", "sopla", "soplando", "analizando", "resultado"]);
  assert.match(v.d.valor, /^0,[5-6]\d$/);
  assert.equal(v.d.unidad, "g/L");
  assert.equal(v.d.puesto, 1);
  assert.equal(v.d.total, 1);
  assert.equal(v.d.foto_estado, "top");
  assert.ok(v.d.foto);
  assert.equal(m.almacen.ranking.total, 1);
  const cobro = m.almacen.cobro(m.almacen.ranking.top[0].id) || Array.from(m.almacen.cobros.values())[0];
  assert.ok(Array.from(m.almacen.cobros.values()).some((c) => c.estado === "consumido"));
  await m.reloj.avanzar(21000);
  assert.equal(m.maquina.vistaActual.fase, "espera");
  await m.reloj.avanzar(5000);
  assert.equal(m.nube.pidiendoTarjeta(), true, "tras la prueba el Solo vuelve a pedir tarjeta");
  // la cuenta atrás duró 5 s y la foto se hizo al final
  const an = m.vistas.filter((x) => x.fase === "analizando");
  assert.equal(an[0].d.cuenta_ms, 5000);
  assert.equal(an[an.length - 1].d.flash, true);
  await parar(m);
});

test("nadie sopla: dos minutos de espera y se devuelve el dinero", async () => {
  const m = montar();
  await arrancar(m);
  await hastaFase(m, "espera");
  await pagar(m);
  await hastaFase(m, "sopla", 20000);
  await hastaFase(m, "aviso", 200000);
  const a = m.maquina.vistaActual.d;
  assert.equal(a.titulo, "No has soplado");
  await m.reloj.avanzar(10000);
  const t = Array.from(m.nube.transacciones.values());
  assert.equal(t.length, 1);
  assert.equal(t[0].refunded, true);
  assert.ok(Array.from(m.almacen.cobros.values()).some((c) => c.estado === "reembolsado"));
  assert.equal(m.almacen.ranking.total, 0, "no entra en el ranking");
  await parar(m);
});

test("tres soplidos cortados: se anula y se reembolsa", async () => {
  const m = montar();
  await arrancar(m);
  await hastaFase(m, "espera");
  await pagar(m);
  for (let i = 0; i < 3; i++) {
    await hastaFase(m, "sopla", 30000);
    m.sim.soplar(true);
    await m.reloj.avanzar(1500);
    m.sim.soplar(false);
    await m.reloj.avanzar(500);
  }
  await hastaFase(m, "aviso", 30000);
  assert.equal(m.maquina.vistaActual.d.titulo, "No has soplado seguido");
  assert.equal(m.vistas.filter((v) => v.fase === "cortado").length >= 2, true);
  await parar(m);
});

test("un corte y luego bien: cuenta como una sola prueba", async () => {
  const m = montar();
  await arrancar(m);
  await hastaFase(m, "espera");
  await pagar(m);
  await hastaFase(m, "sopla", 20000);
  m.sim.soplar(true);
  await m.reloj.avanzar(1000);
  m.sim.soplar(false);
  await hastaFase(m, "cortado", 2000);
  await hastaFase(m, "sopla", 20000);
  m.sim.alcohol = 0.3;
  m.sim.soplar(true);
  await m.reloj.avanzar(4500);
  m.sim.soplar(false);
  await hastaFase(m, "resultado", 20000);
  assert.equal(m.almacen.ranking.total, 1);
  await parar(m);
});

test("el sensor se desconecta a mitad: aviso, reembolso y fuera de servicio sin cobrar", async () => {
  const m = montar();
  await arrancar(m);
  await hastaFase(m, "espera");
  await pagar(m);
  await hastaFase(m, "preparando", 15000);
  m.sim.fallos.desconectado = true;
  await hastaFase(m, "aviso", 30000);
  await hastaFase(m, "fuera_servicio", 30000);
  await m.reloj.avanzar(60000);
  assert.equal(m.nube.pidiendoTarjeta(), false, "fuera de servicio no se pide tarjeta");
  assert.equal(Array.from(m.nube.transacciones.values())[0].refunded, true);
  m.sim.fallos.desconectado = false;
  await hastaFase(m, "espera", 40000);
  await m.reloj.avanzar(10000);
  assert.equal(m.nube.pidiendoTarjeta(), true);
  await parar(m);
});

test("apagón a mitad de prueba: al volver, la persona tiene su prueba (crédito) sin pagar otra vez", async () => {
  const m = montar();
  await arrancar(m);
  await hastaFase(m, "espera");
  await pagar(m);
  await hastaFase(m, "sopla", 20000);
  // apagón: todo muere de golpe (sin cerrar nada), el sensor también se reinicia
  m.maquina.detenido = true;
  m.maquina.grupoFijo.cancelar();
  if (m.maquina.gFase) m.maquina.gFase.cancelar();
  m.cobro.destruido = true;
  m.sim.reiniciar();
  await m.reloj.avanzar(60000);
  // arranque nuevo con la misma tarjeta, el mismo sensor y la misma cuenta de SumUp
  const n = montar({ reloj: m.reloj, fs: m.fs, sim: m.sim, nube: m.nube });
  await arrancar(n);
  await hastaFase(n, "pagado", 40000);
  assert.equal(ultima(n, "pagado").d.credito, true);
  await hastaFase(n, "sopla", 20000);
  n.sim.alcohol = 0.4;
  n.sim.soplar(true);
  await n.reloj.avanzar(4500);
  n.sim.soplar(false);
  await hastaFase(n, "resultado", 20000);
  assert.equal(n.nube.transacciones.size, 1, "un solo cobro");
  await parar(n);
});

test("cámara tapada: resultado sin foto y nada guardado", async () => {
  const m = montar();
  m.camara.tapada = true;
  await arrancar(m);
  const v = await pruebaBuena(m);
  assert.equal(v.d.foto, null);
  assert.equal(v.d.foto_estado, "tapada");
  assert.equal(m.almacen.fotos.size, 0);
  await parar(m);
});

test("cámara rota o colgada: la prueba sigue sin foto", async () => {
  for (const fallo of ["rota", "colgada"]) {
    const m = montar();
    m.camara[fallo] = true;
    await arrancar(m);
    const v = await pruebaBuena(m);
    assert.equal(v.d.foto, null, fallo);
    assert.equal(v.d.foto_estado, "sin_camara");
    await parar(m);
  }
});

test("tarjeta de solo lectura: fuera de servicio sin abrir cobros; se recupera sola", async () => {
  const m = montar();
  await arrancar(m);
  await hastaFase(m, "espera");
  m.fs.fallos.soloLectura = true;
  m.almacen.errorEscritura = { codigo: "EROFS", mensaje: "x", t: 0 };
  await hastaFase(m, "fuera_servicio", 40000);
  await m.reloj.avanzar(30000);
  assert.equal(m.nube.pidiendoTarjeta(), false);
  m.fs.fallos.soloLectura = false;
  await hastaFase(m, "espera", 40000);
  await parar(m);
});

test("sin internet: la pantalla sigue en espera avisando de que no se puede pagar", async () => {
  const m = montar();
  m.nube.fallos.sinInternet = true;
  await arrancar(m);
  await hastaFase(m, "espera");
  await m.reloj.avanzar(60000);
  assert.equal(m.maquina.vistaActual.fase, "espera");
  assert.equal(m.maquina.vistaActual.pago.estado, "no_disponible");
  m.nube.fallos.sinInternet = false;
  await m.reloj.avanzar(120000);
  assert.equal(m.maquina.vistaActual.pago.estado, "esperando_tarjeta");
  await parar(m);
});

test("300 pruebas seguidas: ranking, top 10, fotos a las 24 h, memoria y archivos acotados", async () => {
  const m = montar({ config: { pausa_tras_alto_ms: 0 } });
  await arrancar(m);
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const valores = [];
  for (let i = 0; i < 300; i++) {
    const a = Math.round(rnd() * rnd() * 160) / 100;
    const v = await pruebaBuena(m, a);
    valores.push(v.d.valor_bruto);
    assert.equal(v.d.total, i + 1);
    const mayores = valores.filter((x) => x > v.d.valor_bruto).length;
    assert.equal(v.d.puesto, mayores + 1, "puesto");
    await m.reloj.avanzar(21000 + Math.floor(rnd() * 600000)); // entre pruebas, hasta 10 min
  }
  await m.reloj.avanzar(25 * 3600e3);
  await m.reloj.avanzar(11 * 60e3); // limpieza periódica
  assert.equal(m.almacen.ranking.total, 300);
  const top = m.almacen.ranking.top;
  assert.equal(top.length, 10);
  assert.ok(m.almacen.fotos.size <= 10, "solo quedan las fotos del top: " + m.almacen.fotos.size);
  for (const e of top) assert.ok(m.almacen.tieneFoto(e.id));
  assert.ok(m.vistas.length < 300 * 40, "vistas por prueba acotadas");
  assert.ok(m.registro.lineas().length <= 400, "registro acotado");
  const ordenados = [...valores].sort((a, b) => b - a).slice(0, 10);
  assert.deepEqual(top.map((e) => e.valor), ordenados);
  await parar(m);
});
