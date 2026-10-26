/* Montaje de la máquina entera con hardware simulado y reloj virtual (para las pruebas). Lo que se pase en
 * `previo` (fs, nube, sim, camara, reloj) se reutiliza: así se simula un apagón. */
"use strict";
const assert = require("node:assert/strict");
const { RelojVirtual } = require("../../nucleo/reloj");
const U = require("../../nucleo/util");
const { Almacen } = require("../../nucleo/almacen");
const { SensorZE29A } = require("../../nucleo/sensor_ze29a");
const { ClienteSumUp } = require("../../nucleo/sumup");
const { CobroContinuo } = require("../../nucleo/cobro");
const { Maquina } = require("../../nucleo/maquina");
const { ZE29ASimulado } = require("../../sim/ze29a_sim");
const { NubeSumUp } = require("../../sim/sumup_sim");
const { FSMemoria } = require("../../sim/fs_memoria");

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
  // la red de ESTE arranque: tras un apagón, la instancia vieja ya no llega a SumUp
  const red = { viva: true };
  const baseFetch = previo.fetch ? previo.fetch(nube) : nube.fetch;
  const fetchArranque = (url, op) => {
    if (red.viva) return baseFetch(url, op);
    const e = new TypeError("fetch failed");
    e.cause = { code: "ENETDOWN" };
    return Promise.reject(e);
  };
  const registro = U.crearRegistro({ consola: false, ahora: () => reloj.ahora() });
  const almacen = new Almacen({ fs, reloj, registro: registro.hijo("almacen") });
  const sensor = new SensorZE29A({ transporte: sim.transporte(), reloj, registro: registro.hijo("sensor") });
  const cliente = new ClienteSumUp({ fetch: fetchArranque, reloj, config: { api_key: "k", merchant_code: "M1", reader_id: "r1", app_id: "a", affiliate_key: "b" } });
  const cobro = new CobroContinuo({ cliente, almacen, reloj, registro: registro.hijo("cobro"), config: previo.configCobro || {} });
  const maquina = new Maquina({ reloj, registro, sensor, cobro, camara, almacen, config: previo.config || {}, plataforma: { urlFoto: (id) => "/fotos/" + id + ".jpg" } });
  const vistas = [];
  maquina.on("vista", (v) => vistas.push(v));
  const fases = () => vistas.map((v) => v.fase).filter((f, i, a) => i === 0 || a[i - 1] !== f);
  return { red, reloj, fs, sim, nube, camara, almacen, sensor, cobro, maquina, vistas, fases, registro, config: previo.config, configCobro: previo.configCobro, fetchEnvoltorio: previo.fetch };
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

/** Corte de luz: la máquina vieja se congela sin cerrar nada y arranca otra con el mismo disco, nube y sensor. */
function apagon(m, extra = {}) {
  extra = Object.assign({}, extra);
  m.maquina.detenido = true;
  m.maquina.grupoFijo.cancelar();
  if (m.maquina.gFase) m.maquina.gFase.cancelar();
  if (m.cobro.revision) m.cobro.revision.cancelar();
  if (m.cobro.grupo) m.cobro.grupo.cancelar();
  m.cobro.destruido = true;
  m.red.viva = false;
  if (!extra.sensorSigue) m.sim.reiniciar(); // un corte de luz también apaga el sensor; un fallo del programa no
  return montar(Object.assign({ reloj: m.reloj, fs: m.fs, nube: m.nube, sim: m.sim, camara: m.camara, config: m.config, configCobro: m.configCobro, fetch: m.fetchEnvoltorio }, extra));
}

module.exports = { montar, arrancar, pruebaBuena, hastaFase, pagar, parar, apagon };
