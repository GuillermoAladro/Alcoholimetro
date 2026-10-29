#!/usr/bin/env node
/*
 * principal.js — arranque del alcoholímetro en la Raspberry Pi.
 *
 *   node pi/principal.js                 máquina de verdad (sensor, cámara y SumUp)
 *   node pi/principal.js --gratis        sin cobrar: la prueba empieza sola (banco de pruebas)
 *   node pi/principal.js --simular       en cualquier ordenador, sin hardware (abre http://127.0.0.1:8080)
 *   opciones: --config <ruta> --datos <carpeta> --puerto <n> --sin-kiosco
 *
 * Configuración: /etc/alcoholimetro/config.json (ver config.ejemplo.json). Datos de SumUp aparte, en
 * ~/.config/alcoholimetro/sumup.json con permisos 600 (como el programa anterior; MONTAJE P6.14).
 *
 * Lo normal es arrancarlo con systemd (sistema/alcoholimetro.service), que lo reinicia si se cae.
 */
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");

const U = require("../nucleo/util");
const { RelojReal } = require("../nucleo/reloj");
const { Almacen } = require("../nucleo/almacen");
const { SensorZE29A } = require("../nucleo/sensor_ze29a");
const { ClienteSumUp } = require("../nucleo/sumup");
const { CobroContinuo, CobroGratis } = require("../nucleo/cobro");
const { Maquina } = require("../nucleo/maquina");
const { FSNode } = require("./fs_node");
const { Servidor } = require("./servidor");
const { Sistema } = require("./sistema");

// ------------------------------------------------------------------ opciones
const args = process.argv.slice(2);
const op = (n) => args.includes("--" + n);
const val = (n) => {
  const i = args.indexOf("--" + n);
  return i >= 0 ? args[i + 1] : undefined;
};
const SIMULAR = op("simular");
const GRATIS = op("gratis");

const casa = (p) => (p && p.startsWith("~") ? path.join(os.homedir(), p.slice(1)) : p);
function leerJSON(ruta) {
  try {
    return JSON.parse(fs.readFileSync(casa(ruta), "utf8"));
  } catch (e) {
    if (e.code !== "ENOENT") console.error(`[principal] ${ruta} no se puede leer: ${e.message}`);
    return null;
  }
}

const CONFIG = Object.assign(
  {
    datos: "/var/lib/alcoholimetro",
    puerto_web: 8080,
    uart: "/dev/serial0",
    pago: "sumup",
    sumup_json: "~/.config/alcoholimetro/sumup.json",
    precio_centimos: 200,
    unidad: "g/L",
    maquina: {},
    cobro: {},
    camara: {},
    sistema: {},
    almacen: {},
  },
  leerJSON(val("config") || "/etc/alcoholimetro/config.json") || {}
);
if (val("datos")) CONFIG.datos = val("datos");
if (val("puerto")) CONFIG.puerto_web = parseInt(val("puerto"), 10);
if (SIMULAR && !val("datos")) CONFIG.datos = path.join(os.tmpdir(), "alcoholimetro-sim");
if (GRATIS) CONFIG.pago = "gratis";

// ------------------------------------------------------------------ registro y errores sin controlar
const reloj = new RelojReal();
const registro = U.crearRegistro({ max: 600, depurar: process.env.ALC_DEPURAR === "1" });
const log = registro.hijo("principal");
reloj.alError = (e) => log.error("en un temporizador: " + (e && e.stack ? e.stack : e));

let rechazos = [];
process.on("unhandledRejection", (e) => {
  log.error("promesa rechazada sin controlar: " + (e && e.stack ? e.stack : e));
  const ahora = Date.now();
  rechazos = rechazos.filter((t) => ahora - t < 600000);
  rechazos.push(ahora);
  if (rechazos.length > 30) {
    log.error("demasiados errores sin controlar: me reinicio");
    process.exit(1);
  }
});
process.on("uncaughtException", (e) => {
  // estado desconocido: lo más seguro es reiniciar (systemd lo arranca en 2 s; el diario de cobros lo
  // retoma donde estaba)
  log.error("EXCEPCIÓN NO CONTROLADA, reinicio: " + (e && e.stack ? e.stack : e));
  setTimeout(() => process.exit(1), 300);
});

// ------------------------------------------------------------------ montaje
async function main() {
  log.info(`alcoholímetro · ${SIMULAR ? "SIMULADO · " : ""}pago: ${CONFIG.pago} · datos en ${CONFIG.datos} · Node ${process.version}`);
  fs.mkdirSync(CONFIG.datos, { recursive: true, mode: 0o700 });

  const fsDatos = new FSNode(CONFIG.datos);
  const alm = CONFIG.almacen || {};
  const almacen = new Almacen({
    fs: fsDatos,
    reloj,
    registro: registro.hijo("almacen"),
    config: {
      retencionFotosMs: (alm.retencion_fotos_h || 24) * 3600 * 1000,
      minLibreBytes: (alm.min_libre_mb != null ? alm.min_libre_mb : 200) * 1048576,
    },
  });

  // sensor: UART real o simulado
  let transporte;
  let sim = null;
  if (SIMULAR) {
    const { ZE29ASimulado } = require("../sim/ze29a_sim");
    sim = new ZE29ASimulado({ reloj });
    transporte = sim.transporte();
  } else {
    const { UART } = require("./uart");
    transporte = new UART(CONFIG.uart, { registro: registro.hijo("uart") });
    await transporte.abrir();
  }
  const sensor = new SensorZE29A({ transporte, reloj, registro: registro.hijo("sensor") });

  // cobro
  let cobro;
  let nube = null;
  const cfgCobro = Object.assign({ precio_centimos: CONFIG.precio_centimos }, CONFIG.cobro || {});
  if (CONFIG.pago === "gratis") {
    cobro = new CobroGratis({ almacen, reloj, registro: registro.hijo("cobro"), config: cfgCobro });
  } else {
    let fetchFn = globalThis.fetch;
    let datos = null;
    if (SIMULAR) {
      const { NubeSumUp } = require("../sim/sumup_sim");
      nube = new NubeSumUp({ reloj, api_key: "sim", merchant_code: "MSIM", reader_id: "rdr_sim" });
      fetchFn = nube.fetch;
      datos = { api_key: "sim", merchant_code: "MSIM", reader_id: "rdr_sim", app_id: "app", affiliate_key: "aff" };
      setInterval(() => nube.tic(), 1000);
    } else {
      datos = leerJSON(CONFIG.sumup_json);
      if (!datos) log.error(`faltan los datos de SumUp en ${CONFIG.sumup_json}: no se puede cobrar (o arranca con --gratis)`);
    }
    const cliente = new ClienteSumUp({ fetch: fetchFn, reloj, registro: registro.hijo("sumup"), config: datos || {} });
    cliente.on("peticion", (p) => registro.hijo("sumup").depurar(`${p.metodo} ${p.ruta} → ${p.http} (${p.ms} ms)`));
    cobro = new CobroContinuo({ cliente, almacen, reloj, registro: registro.hijo("cobro"), config: cfgCobro });
  }

  // cámara
  let camara;
  if (SIMULAR) {
    const { CamaraFalsaNode } = require("../sim/camara_falsa_node");
    camara = new CamaraFalsaNode();
  } else {
    const { CamaraPi } = require("./camara");
    camara = new CamaraPi({ config: CONFIG.camara, registro: registro.hijo("camara") });
  }

  let servidor = null;
  const maquina = new Maquina({
    reloj,
    registro,
    sensor,
    cobro,
    camara,
    almacen,
    config: Object.assign({ precio_centimos: CONFIG.precio_centimos, unidad: CONFIG.unidad }, CONFIG.maquina || {}),
    plataforma: {
      urlFoto: (id) => `/fotos/${id}.jpg`,
      urlFotoBytes: (b) => (servidor ? servidor.urlFotoBytes(b) : null),
    },
  });

  const sistema = new Sistema({ registro, maquina, almacen, config: Object.assign({ kiosco: !op("sin-kiosco") && !SIMULAR }, CONFIG.sistema || {}) });

  // acciones de simulación por HTTP (solo con --simular)
  const accionesSim = SIMULAR
    ? async (accion, q) => {
        switch (accion) {
          case "tarjeta":
            return { ok: nube ? nube.pasarTarjeta(q.get("ok") !== "0") : false };
          case "soplar": {
            const ms = Math.min(15000, parseInt(q.get("ms") || "4500", 10));
            sim.soplar(true);
            setTimeout(() => sim.soplar(false), ms);
            return { ok: true, ms };
          }
          case "alcohol":
            sim.alcohol = Math.max(0, Math.min(4, parseFloat(q.get("gl") || "0")));
            return { ok: true, alcohol: sim.alcohol };
          case "tapar":
            camara.tapada = q.get("si") === "1";
            return { ok: true };
          case "sensor":
            sim.fallos.desconectado = q.get("desconectado") === "1";
            return { ok: true };
          case "internet":
            if (nube) nube.fallos.sinInternet = q.get("no") === "1";
            return { ok: true };
          default:
            return { ok: false, error: "acción desconocida" };
        }
      }
    : null;

  servidor = new Servidor({ maquina, almacen, camara, sistema, sensor, registro, sim: accionesSim });
  for (let i = 0; ; i++) {
    try {
      await servidor.escuchar(CONFIG.puerto_web);
      break;
    } catch (e) {
      log.error(`no puedo abrir el puerto ${CONFIG.puerto_web}: ${e.message}`);
      if (i >= 10) throw e;
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  sistema.arrancar();
  await maquina.arrancar();

  // apagado ordenado (systemctl stop, reinicio): se cancela el cobro abierto en el lector
  let apagando = false;
  const apagar = async (senal) => {
    if (apagando) return;
    apagando = true;
    log.info(`apagando (${senal})`);
    setTimeout(() => process.exit(0), 9000).unref();
    try {
      await Promise.race([maquina.detener(), new Promise((r) => setTimeout(r, 7000))]);
    } catch (e) {
      /* nada */
    }
    sistema.parar();
    await servidor.cerrar().catch(() => {});
    if (transporte.cerrar) await Promise.resolve(transporte.cerrar()).catch(() => {});
    process.exit(0);
  };
  process.on("SIGTERM", () => apagar("SIGTERM"));
  process.on("SIGINT", () => apagar("SIGINT"));
}

main().catch((e) => {
  log.error("no se pudo arrancar: " + (e && e.stack ? e.stack : e));
  setTimeout(() => process.exit(1), 300); // systemd vuelve a intentarlo
});
