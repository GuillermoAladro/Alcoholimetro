#!/usr/bin/env node
/*
 * prueba_sensor.js — prueba del ZE29A por la consola, sin pantalla, cámara ni cobro (fases 6 y 7 del
 * MONTAJE PASO A PASO). Usa el mismo controlador que el programa (nucleo/sensor_ze29a.js).
 *
 *   sudo systemctl stop alcoholimetro        (la UART solo la puede usar un programa a la vez)
 *   node pi/prueba_sensor.js                 estado, tiempo de soplido y una prueba completa
 *   node pi/prueba_sensor.js --estado        solo el estado (¿responde el sensor?)
 *   node pi/prueba_sensor.js --vigilar       el estado cada segundo hasta Ctrl+C (P6.13: quitar el fusible)
 *   node pi/prueba_sensor.js --puerto /dev/ttyAMA0
 *   sudo systemctl start alcoholimetro
 */
"use strict";
const { UART } = require("./uart");
const { SensorZE29A } = require("../nucleo/sensor_ze29a");
const { RelojReal } = require("../nucleo/reloj");
const P = require("../nucleo/protocolo_ze29a");
const U = require("../nucleo/util");

const args = process.argv.slice(2);
const opcion = (n) => args.includes(n);
const valor = (n, def) => {
  const i = args.indexOf(n);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};

const nombre = (e) => `${P.NOMBRE_ESTADO[e] || "?"} (0x${e.toString(16).toUpperCase()})`;

(async () => {
  const reloj = new RelojReal();
  const registro = U.crearRegistro({ consola: opcion("--detalle"), depurar: opcion("--detalle") });
  const uart = new UART(valor("--puerto", "/dev/serial0"));
  await uart.abrir();
  const sensor = new SensorZE29A({ transporte: uart, reloj, registro: registro.hijo("sensor") });
  if (opcion("--detalle")) {
    sensor.on("tx", (b) => console.log("  → " + U.hexBytes(b)));
    sensor.on("rx", (b) => console.log("  ← " + U.hexBytes(b)));
  }
  let codigo = 0;
  try {
    if (opcion("--vigilar")) {
      console.log("Estado cada segundo (Ctrl+C para salir):");
      for (;;) {
        const t = new Date().toLocaleTimeString("es-ES");
        try {
          console.log(`${t}  ${nombre(await sensor.estado())}`);
        } catch (e) {
          console.log(`${t}  sin respuesta (${e.message})`);
        }
        await reloj.esperar(1000);
      }
    }
    const e0 = await sensor.estado();
    console.log(`Estado: ${nombre(e0)} → el sensor responde bien`);
    console.log(`Tiempo de soplido: ${await sensor.tiempoSoplido()} s · umbral de presión: ${await sensor.umbralPresion()}`);
    if (opcion("--estado")) return;
    console.log("Empiezo un ciclo (0x87 0x32)…");
    const ini = await sensor.iniciarCiclo();
    if (!ini.ok) {
      console.log(`  el sensor no acepta empezar (está en ${nombre(ini.estado)})`);
      codigo = 1;
      return;
    }
    let antes = null;
    const t0 = reloj.mono();
    while (reloj.mono() - t0 < 150000) {
      const e = await sensor.estado();
      if (e !== antes) {
        const s = ((reloj.mono() - t0) / 1000).toFixed(1).padStart(5);
        let extra = "";
        if (e === P.EST.ESPERANDO_SOPLIDO) extra = "  ← SOPLA AHORA, seguido";
        if (e === P.EST.SOPLIDO_CORTADO) extra = "  ← soplido cortado: vuelve a precalentar";
        console.log(`  ${s} s  ${nombre(e)}${extra}`);
      }
      if (e === P.EST.RESULTADO_LISTO) {
        const r = await sensor.leerResultado();
        console.log(`Resultado: ${r.valor} mg/100 mL → ${U.numES(r.valor / 100, 2)} g/L · alarma del sensor: ${r.alarma}${r.saturado ? " · SATURADO" : ""}`);
        await sensor.cambiarEstado(P.EST.REPOSO).catch(() => {});
        return;
      }
      if (e === P.EST.REPOSO && antes !== null && antes !== P.EST.REPOSO) {
        console.log("Ha vuelto a reposo: nadie ha soplado en 1 minuto");
        codigo = 1;
        return;
      }
      antes = e;
      await reloj.esperar(300);
    }
    console.log("Más de 2,5 minutos sin resultado");
    codigo = 1;
  } catch (e) {
    console.log("ERROR: " + e.message);
    console.log("¿Está parado el servicio (sudo systemctl stop alcoholimetro)? ¿UART activada y sin consola serie (fase 2)?");
    codigo = 1;
  } finally {
    sensor.cerrar && sensor.cerrar();
    await uart.cerrar();
    process.exit(codigo);
  }
})();
