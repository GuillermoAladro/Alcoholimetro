/* Controlador del ZE29A contra el ZE29A simulado: ciclo completo, UART con ruido y trozos, sensor desconectado. */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { RelojVirtual } = require("../nucleo/reloj");
const { SensorZE29A } = require("../nucleo/sensor_ze29a");
const { ZE29ASimulado } = require("../sim/ze29a_sim");
const { EST } = require("../nucleo/protocolo_ze29a");

function montar(semilla = 1) {
  let s = semilla;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const reloj = new RelojVirtual();
  const sim = new ZE29ASimulado({ reloj, aleatorio: rnd });
  const sensor = new SensorZE29A({ transporte: sim.transporte(), reloj });
  return { reloj, sim, sensor };
}

async function correr(reloj, promesa, maxMs = 120000) {
  let fin = false;
  let r;
  let err;
  promesa.then((v) => ((fin = true), (r = v)), (e) => ((fin = true), (err = e)));
  await reloj.hasta(() => fin, maxMs, 20);
  if (err) throw err;
  assert.ok(fin, "no terminó a tiempo");
  return r;
}

test("ciclo completo: precalienta, sopla 4 s, calcula y da el resultado", async () => {
  const { reloj, sim, sensor } = montar();
  sim.alcohol = 0.62;
  assert.equal(await correr(reloj, sensor.estado()), EST.REPOSO);
  const ini = await correr(reloj, sensor.iniciarCiclo());
  assert.equal(ini.ok, true);
  await reloj.avanzar(10500);
  assert.equal(await correr(reloj, sensor.estado()), EST.ESPERANDO_SOPLIDO);
  sim.soplar(true);
  await reloj.avanzar(4200);
  sim.soplar(false);
  assert.equal(await correr(reloj, sensor.estado()), EST.CALCULANDO);
  await reloj.avanzar(5200);
  assert.equal(await correr(reloj, sensor.estado()), EST.RESULTADO_LISTO);
  const r = await correr(reloj, sensor.leerResultado());
  assert.ok(Math.abs(r.valor - 62) <= 6, "valor " + r.valor);
});

test("soplido cortado: 0x35 y a los 3 s vuelve a precalentar", async () => {
  const { reloj, sim, sensor } = montar(2);
  await correr(reloj, sensor.iniciarCiclo());
  await reloj.avanzar(10100);
  sim.soplar(true);
  await reloj.avanzar(2000);
  sim.soplar(false);
  assert.equal(await correr(reloj, sensor.estado()), EST.SOPLIDO_CORTADO);
  await reloj.avanzar(3100);
  assert.equal(await correr(reloj, sensor.estado()), EST.PRECALENTANDO);
});

test("UART con trozos, ruido y bits cambiados: el controlador sigue funcionando", async () => {
  const { reloj, sim, sensor } = montar(3);
  sim.fallos.trocear = 1;
  sim.fallos.ruido = 0.5;
  sim.fallos.corromper = 0.05;
  let fallos = 0;
  for (let i = 0; i < 300; i++) {
    try {
      // cuando contesta, contesta bien: una trama dañada nunca se toma por buena
      assert.equal(await correr(reloj, sensor.estado()), EST.REPOSO);
    } catch (e) {
      assert.equal(e.codigo, "SENSOR_NO_RESPONDE");
      fallos++;
    }
  }
  assert.ok(fallos <= 1, "fallos " + fallos); // con 3 intentos, P(fallo) ≈ 0,05³
  assert.ok(sensor.lector.malas > 0 && sensor.lector.descartados > 0);
});

test("sensor desconectado: error claro, nunca un valor", async () => {
  const { reloj, sim, sensor } = montar(4);
  sim.fallos.desconectado = true;
  await assert.rejects(correr(reloj, sensor.estado()), (e) => e.codigo === "SENSOR_NO_RESPONDE");
  await assert.rejects(correr(reloj, sensor.leerResultado()), (e) => e.codigo === "SENSOR_NO_RESPONDE");
  sim.fallos.desconectado = false;
  assert.equal(await correr(reloj, sensor.estado()), EST.REPOSO); // se recupera solo
});

test("acuse perdido al arrancar: comprueba el estado y da el cambio por bueno", async () => {
  const { reloj, sim, sensor } = montar(5);
  // se pierden las respuestas a 0x87 (el módulo sí cambia de estado)
  const orig = sim._enviar.bind(sim);
  sim._enviar = (t) => (t[1] === 0x87 ? undefined : orig(t));
  const r = await correr(reloj, sensor.iniciarCiclo());
  assert.equal(r.ok, true);
  assert.equal(sim.estado, EST.PRECALENTANDO);
});

test("desde 0x37 viejo se arranca un ciclo nuevo (no se reutiliza el resultado)", async () => {
  const { reloj, sim, sensor } = montar(6);
  sim._ir(EST.RESULTADO_LISTO);
  const r = await correr(reloj, sensor.iniciarCiclo());
  assert.equal(r.ok, true);
  assert.equal(r.estado, EST.RESULTADO_LISTO);
  assert.equal(sim.estado, EST.PRECALENTANDO);
});
