/*
 * sim_script.js — la Raspberry Pi simulada dentro del banco de conexiones.
 *
 * El programa de la Pi (programa/nucleo/*.js, el mismo que se instala en la máquina) corre aquí con el
 * hardware simulado (programa/sim/*.js). Sus dos pantallas se pintan en lienzos que hacen de textura de la
 * pantalla de 7" y del lector de la mesa 3D. Los cables de la UART se iluminan con cada trama y los tubos del
 * soplido mientras se sopla.
 */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const U = ALC.util;
  const P = ALC.protocolo;

  // ---------------------------------------------------------------- pestañas del panel
  function pestana(cual) {
    const prog = cual === "prog";
    $("#tProg").setAttribute("aria-selected", prog);
    $("#tCon").setAttribute("aria-selected", !prog);
    $("#pProg").hidden = !prog;
    $("#pCon").hidden = prog;
  }
  $("#tProg").onclick = () => pestana("prog");
  $("#tCon").onclick = () => pestana("con");
  window.irAConexiones = () => pestana("con");

  // ---------------------------------------------------------------- lienzos de las dos pantallas
  const cvP = document.createElement("canvas");
  const cvS = document.createElement("canvas");
  $("#slotMini").appendChild(cvP);
  $("#slotSolo").appendChild(cvS);

  // ---------------------------------------------------------------- registro (anillos de líneas)
  const MAXL = 400;
  const logs = { prog: [], uart: [], sumup: [] };
  let logVisible = "prog";
  let logSucio = true;
  const hh = (t) => {
    const d = new Date(t);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  };
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
  function anadir(tipo, html) {
    const a = logs[tipo];
    a.push(html);
    if (a.length > MAXL) a.splice(0, a.length - MAXL);
    if (tipo === logVisible) logSucio = true;
  }
  function pintarLog() {
    const el = $("#log");
    if (logVisible === "arch") {
      if (!pi || !pi.almacen) return;
      const filas = pi.archivos().map((f) => `<tr><td>${esc(f.ruta)}</td><td style="text-align:right">${f.tam < 2048 ? f.tam + " B" : Math.round(f.tam / 1024) + " KB"}</td><td>${esc(f.nota)}</td></tr>`);
      el.innerHTML = `<table class="tbl">${filas.join("")}</table>`;
      return;
    }
    const abajo = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    el.innerHTML = logs[logVisible].join("\n");
    if (abajo) el.scrollTop = el.scrollHeight;
  }
  document.querySelectorAll("#segLog button").forEach((b) => {
    b.onclick = () => {
      logVisible = b.dataset.l;
      document.querySelectorAll("#segLog button").forEach((x) => x.setAttribute("aria-selected", x === b));
      logSucio = true;
      $("#log").scrollTop = 1e9;
    };
  });
  setInterval(() => {
    if (logSucio || logVisible === "arch") {
      logSucio = false;
      pintarLog();
    }
  }, 300);

  // ---------------------------------------------------------------- estado visible
  const est = { fase: "arranque", sensor: null, solo: "inicio" };
  const NOMBRE_FASE = {
    arranque: "arrancando",
    espera: "espera (ranking)",
    fuera_servicio: "fuera de servicio",
    pagado: "pago aceptado",
    preparando: "precalentando el sensor",
    sopla: "esperando el soplido",
    soplando: "soplando",
    cortado: "soplido cortado",
    analizando: "cuenta atrás y foto",
    resultado: "resultado",
    aviso: "aviso",
    apagada: "sin luz",
  };
  const NOMBRE_SOLO = { inicio: "en reposo", esperando: "pide tarjeta", procesando: "procesando", aprobado: "aprobado", rechazado: "rechazado", cancelado: "cancelado", apagado: "apagado" };
  function pintarEstado() {
    $("#simEstado").innerHTML = `<span>pantalla: <b>${NOMBRE_FASE[est.fase] || est.fase}</b></span><span>sensor: <b>${est.sensor != null ? P.NOMBRE_ESTADO[est.sensor] + " (0x" + est.sensor.toString(16) + ")" : "—"}</b></span><span>lector: <b>${NOMBRE_SOLO[est.solo] || est.solo}</b></span>`;
    const pide = pi && pi.nube.pidiendoTarjeta();
    $("#bTarjeta").disabled = !pide;
    $("#bRechazo").disabled = !pide;
    $("#bPin").disabled = !pide;
    $("#hTarjeta").textContent = pide ? "El lector está pidiendo tarjeta: 2,00 €." : est.solo === "procesando" ? "El lector está procesando el pago…" : "Ahora el lector no pide tarjeta (mira su pantalla).";
  }

  // ---------------------------------------------------------------- la Pi simulada
  let pi = null;
  pi = new ALC_SIM.PiSimulada({
    canvasPantalla: cvP,
    canvasSolo: cvS,
    alVista: (v) => {
      est.fase = v.fase;
      pintarEstado();
    },
    alLinea: (l) => {
      const c = l.nivel === "error" ? "er" : l.nivel === "aviso" ? "av" : "";
      anadir("prog", `<span class="t">${hh(l.t)}</span> <span class="${c}">${esc(l.origen)}: ${esc(l.texto)}${l.datos ? " · " + esc(l.datos) : ""}</span>`);
    },
    alUART: (dir, b) => {
      anadir("uart", `<span class="t">${hh(Date.now())}</span> <span class="${dir}">${dir === "tx" ? "Pi → ZE29A" : "ZE29A → Pi"}  ${U.hexBytes(b)}</span>${dir === "rx" && b[1] === 0x85 ? "  <span class=t>(" + (P.NOMBRE_ESTADO[b[2]] || "?") + ")</span>" : ""}`);
      destello(dir === "tx" ? "W19" : "W20");
    },
    alSumUp: (p) => {
      const ruta = p.ruta.replace(/\/v0\.1\/merchants\/[^/]+\/readers\/[^/]+/, "…/readers/{id}").replace(/\/merchants\/[^/]+/, "/merchants/{mc}");
      const c = p.http === 0 || p.http >= 400 ? "er" : "";
      anadir("sumup", `<span class="t">${hh(Date.now())}</span> <span class="${c}">${p.metodo} ${esc(ruta)} → ${p.http || "sin respuesta"} (${p.ms} ms)</span>`);
    },
    alSoplido: (si) => tubos(si),
    alSolo: (s) => {
      est.solo = s.modo;
      pintarEstado();
    },
    alSensor: (e) => {
      est.sensor = e;
      pintarEstado();
    },
  });
  window.PI = pi; // para pruebas y depuración

  // ---------------------------------------------------------------- 3D: pantallas, cables de la UART y tubos
  const ESC3 = window.ESCENA;
  const texP = new THREE.CanvasTexture(cvP);
  texP.encoding = THREE.sRGBEncoding;
  const texS = new THREE.CanvasTexture(cvS);
  texS.encoding = THREE.sRGBEncoding;
  function ponerTextura(id, tex, intensidad) {
    const p = window.P[id];
    if (!p || !p.g) return 0;
    let n = 0;
    p.g.traverse((o) => {
      if (o.isMesh && o.material && o.material.emissiveMap) {
        o.material = o.material.clone();
        o.material.emissiveMap = tex;
        o.material.emissiveIntensity = intensidad;
        o.material.needsUpdate = true;
        n++;
      }
    });
    return n;
  }
  ponerTextura("pant", texP, 1.25);
  ponerTextura("solo", texS, 1.45);

  const cables = {};
  for (const cab of window.CAB) if (cab.me) cables[cab.c.id] = cab.me;
  const destellos = new Map();
  function destello(w) {
    const me = cables[w];
    if (!me || !me.material || !me.material.emissive) return;
    if (!destellos.has(w)) me.material = me.material.clone();
    me.material.emissive.set(w === "W19" ? 0x2f8cff : 0x3cff6a);
    me.material.emissiveIntensity = 0.9;
    destellos.set(w, performance.now() + 110);
  }
  const TUBOS = Object.keys(cables).filter((k) => /^W28/.test(k));
  let soplando = false;
  function tubos(si) {
    soplando = si;
    for (const k of TUBOS) {
      const me = cables[k];
      if (!me.userData.matPropio) {
        me.material = me.material.clone();
        me.userData.matPropio = true;
      }
      if (me.material.emissive) {
        me.material.emissive.set(si ? 0x2fe3e8 : 0x000000);
        me.material.emissiveIntensity = si ? 0.55 : 1;
      }
    }
  }

  let ultTex = 0;
  let ocultar = false;
  let solo = 0;
  window.antesDeRender = () => {
    const t = performance.now();
    if (t - ultTex > 30) {
      ultTex = t;
      texP.needsUpdate = true;
      if (++solo % 2 === 0) {
        pi.solo.pintar(t);
        texS.needsUpdate = true;
      }
    }
    for (const [w, fin] of destellos) {
      if (t > fin) {
        const me = cables[w];
        me.material.emissive.set(0x000000);
        me.material.emissiveIntensity = 1;
        destellos.delete(w);
      }
    }
    // barra del soplido del botón
    const k = pi.sim.progresoSoplido();
    $("#iSoplo").style.width = Math.round((soplando ? Math.max(0.02, k) : 0) * 100) + "%";
  };
  // con la vista grande, la mesa 3D no se dibuja (la pantalla sí): menos trabajo para el ordenador
  function grande(si) {
    $("#grande").hidden = !si;
    $("#labels").style.visibility = si ? "hidden" : "";
    window.ocultar3D = si;
    (si ? $("#slotGrande") : $("#slotMini")).appendChild(cvP);
    if (!si) $("#slotSolo").appendChild(cvS);
  }
  $("#bGrande").onclick = () => grande(true);
  $("#slotMini").onclick = () => grande(true);
  $("#bCerrarGrande").onclick = () => grande(false);
  // en la vista grande, el lector también se pinta (sin la mesa)
  setInterval(() => {
    if (window.ocultar3D) pi.solo.pintar(performance.now());
  }, 60);

  // ---------------------------------------------------------------- controles de la persona
  $("#bTarjeta").onclick = () => {
    if (!pi.nube.pasarTarjeta(true)) $("#hTarjeta").textContent = "El lector no estaba pidiendo tarjeta.";
  };
  $("#bRechazo").onclick = () => pi.nube.pasarTarjeta(false);
  // pago con PIN o autorización lenta: el Solo tarda 25 s en aprobarlo (puede acabar después de que la Pi
  // cancele el cobro por viejo; aun así la prueba tiene que empezar)
  $("#bPin").onclick = () => pi.nube.pasarTarjeta(true, 25000);

  let soplandoBoton = false;
  function soplar(si) {
    if (si === soplandoBoton) return;
    soplandoBoton = si;
    pi.sim.soplar(si);
    pi.camara.soplando = si;
    $("#bSoplar").classList.toggle("activo", si);
    $("#tSoplar").textContent = si ? "Soplando… (suelta para parar)" : "Mantén pulsado para soplar";
  }
  const bs = $("#bSoplar");
  bs.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    try {
      bs.setPointerCapture(e.pointerId);
    } catch (x) {
      /* nada */
    }
    soplar(true);
  });
  for (const ev of ["pointerup", "pointercancel", "lostpointercapture"]) bs.addEventListener(ev, () => soplar(false));
  bs.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
      e.preventDefault();
      soplar(true);
    }
  });
  bs.addEventListener("keyup", (e) => {
    if (e.key === "Enter" || e.key === " ") soplar(false);
  });
  window.addEventListener("keydown", (e) => {
    if (e.code !== "Space" || e.repeat) return;
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "BUTTON" || t.tagName === "SELECT")) return;
    e.preventDefault();
    soplar(true);
  });
  window.addEventListener("keyup", (e) => {
    if (e.code === "Space") soplar(false);
  });
  window.addEventListener("blur", () => soplar(false));

  const rAlc = $("#rAlc");
  function alcohol(v) {
    pi.sim.alcohol = v;
    rAlc.value = v;
    $("#oAlc").textContent = U.numES(v, 2) + " g/L";
  }
  rAlc.oninput = () => alcohol(parseFloat(rAlc.value));
  $("#bAzar").onclick = () => {
    const r = Math.random();
    alcohol(Math.round((r < 0.12 ? 0 : r < 0.85 ? 0.1 + Math.random() * 0.8 : 0.8 + Math.random() * 1.5) * 100) / 100);
  };
  $("#bPersona").onclick = () => {
    pi.camara.otraPersona();
    $("#bAzar").onclick();
  };
  $("#fFoto").onchange = () => {
    const f = $("#fFoto").files[0];
    if (!f) return;
    const img = new Image();
    img.onload = () => pi.camara.usarFoto(img);
    img.src = URL.createObjectURL(f);
  };
  $("#bTapar").onclick = () => {
    const v = $("#bTapar").getAttribute("aria-pressed") !== "true";
    $("#bTapar").setAttribute("aria-pressed", v);
    pi.camara.tapada = v;
  };

  // ---------------------------------------------------------------- más pruebas y averías
  $("#bCorte").onclick = async () => {
    $("#bCorte").disabled = true;
    soplar(false);
    await pi.corteDeLuz();
    $("#bCorte").disabled = false;
  };
  $("#b24").onclick = async () => {
    pi.reloj.adelantar(24 * 3600 * 1000);
    anadir("prog", `<span class="av">reloj de la Pi adelantado 24 h: ahora ${new Date(pi.reloj.ahora()).toLocaleString("es-ES")}</span>`);
    if (pi.almacen) await pi.almacen.limpiar();
  };
  $("#bRapido").onclick = () => {
    const v = $("#bRapido").getAttribute("aria-pressed") !== "true";
    $("#bRapido").setAttribute("aria-pressed", v);
    pi.sim.escalaPrecalentar = v ? 0.2 : 1;
  };
  const AVERIAS = [
    ["Sin internet", () => pi.nube.fallos, "sinInternet"],
    ["Respuestas de SumUp perdidas (30 %)", () => pi.nube.fallos, "cortarRespuesta", 0.3],
    ["Lector apagado", () => pi.nube.fallos, "lectorApagado"],
    ["Sensor desconectado", () => pi.sim.fallos, "desconectado"],
    ["Ruido en la UART", () => pi.sim.fallos, "ruido", 0.35],
    ["Tarjeta SD llena", () => pi.fs.fallos, "llena"],
    ["Tarjeta SD rota (solo lectura)", () => pi.fs.fallos, "soloLectura"],
    ["Cámara rota", () => pi.camara, "rota"],
  ];
  for (const [nombre, obj, campo, valor] of AVERIAS) {
    const b = document.createElement("button");
    b.className = "btn sm";
    b.textContent = nombre;
    b.setAttribute("aria-pressed", "false");
    b.onclick = () => {
      const v = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", v);
      obj()[campo] = v ? valor || true : valor ? 0 : false;
      if (campo === "lectorApagado") {
        if (v) pi.nube._pantalla("apagado");
        else pi.nube._pantalla("inicio");
      }
      anadir("prog", `<span class="av">avería simulada: ${esc(nombre)} ${v ? "ACTIVADA" : "quitada"}</span>`);
    };
    $("#averias").appendChild(b);
  }
  $("#bEjemplo").onclick = async () => {
    $("#bEjemplo").disabled = true;
    $("#bEjemplo").textContent = "Añadiendo…";
    await pi.datosDeEjemplo(120);
    $("#bEjemplo").textContent = "Añadir datos de ejemplo";
    $("#bEjemplo").disabled = false;
  };
  let confirmar = 0;
  $("#bVaciar").onclick = async () => {
    if (Date.now() - confirmar > 4000) {
      confirmar = Date.now();
      $("#bVaciar").textContent = "¿Seguro? Pulsa otra vez";
      setTimeout(() => ($("#bVaciar").textContent = "Vaciar la tarjeta"), 4000);
      return;
    }
    confirmar = 0;
    $("#bVaciar").textContent = "Vaciar la tarjeta";
    await pi.vaciar();
  };

  // ---------------------------------------------------------------- arranque
  (async () => {
    const fuentes = ['700 20px "Big Shoulders Display"', '800 20px "Big Shoulders Display"', '900 20px "Big Shoulders Display"', "400 20px Archivo", "600 20px Archivo", "800 20px Archivo"];
    try {
      await Promise.race([Promise.all(fuentes.map((f) => document.fonts.load(f))), new Promise((r) => setTimeout(r, 4000))]);
    } catch (e) {
      /* se pinta con las de reserva */
    }
    pi.pantalla.arrancar();
    alcohol(0.45);
    let habia = false;
    try {
      habia = await pi.cargarGuardado();
    } catch (e) {
      habia = false;
    }
    await pi.arrancar();
    if (!habia && pi.almacen.ranking.total === 0) {
      anadir("prog", '<span class="av">primera vez: se llenan 360 partidas de ejemplo para ver el ranking</span>');
      await pi.datosDeEjemplo(360);
    }
    pintarEstado();
    window.simLista = true;
  })();
})();
