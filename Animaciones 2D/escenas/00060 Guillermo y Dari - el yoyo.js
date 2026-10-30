"use strict";
/* 00060 · Guillermo y Dari · El yoyó
 *
 * Negro → azotea al atardecer: cielo violeta y naranja, un sol enorme que se esconde detrás de los
 * edificios, un depósito de agua sobre patas, una antena con su lucecita roja, una guirnalda de bombillas
 * entre dos postes, un murete de ladrillo y suelo de baldosas de barro. Dari, con su yoyó rojo, hace
 * trucos: lo lanza, lo pasea por el suelo («pasear al perro») hasta el zapato de Guillermo (que levanta
 * la punta del pie), le da la vuelta al mundo en dos círculos enormes sin mirarlo (Guillermo se echa
 * atrás) y lo mece en la cuna de cuerda entre sus dos manos; le brillan las gafas → Guillermo pide
 * probar; Dari se lo lanza → Guillermo lo deja dormido abajo, orgulloso, y luego le da la vuelta al mundo
 * con demasiada fuerza: la cuerda se le engancha en el cuello, el yoyó da vueltas y más vueltas y le ata
 * el cuello, los brazos y las piernas; el yoyó se le queda en la barriga como el lazo de un paquete →
 * Guillermo, atado, da dos saltitos hacia Dari, se tambalea y cae de espaldas tieso como un tablón →
 * Dari se agacha, le quita la punta suelta de la cuerda del zapato y tira: Guillermo gira como una
 * peonza, se pone de pie girando y la cuerda se desenrolla; el yoyó sale disparado y vuelve a la mano de
 * Dari, que lo caza sin mirar → Guillermo, mareado, con los ojos en espiral y estrellitas; a Dari le
 * brillan las gafas → negro.
 *
 * El yoyó y su cuerda se calculan en cada fotograma desde el dedo de quien lo lleva. Las vueltas de
 * cuerda alrededor de Guillermo son bandas en diagonal pintadas encima de su muñeco (en su marco: caen y
 * giran con él). El giro de peonza es un giro 2D aplastando la escala horizontal. Sin textos. Todo depende
 * del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, entrada, salida, tramo, campana, ruido, hash } = M2;
  const G = Guillermo, Da = Dari;
  const S = 0.30, SUELO = 560;
  const XG = 380, XD = 720;                          // pelvis de Guillermo y de Dari al empezar (Dari mira a la izquierda)
  const DUR = 14.9;
  const T = {
    dTira0: 0.7, dTira1: 0.9, perro1: 1.45, olfatea1: 1.72, dSube0: 1.75, dSube1: 1.95,
    aw0: 2.0, awSale: 2.13, aw1: 2.9, awVuelve: 3.05,
    cuna0: 3.15, cunaBaja: 3.3, cunaForma: 3.5, cuna1: 4.3, cunaSuelta: 4.42, cunaVuelve: 4.58, brillo1: 3.9,
    pide0: 4.62, lanza0: 4.98, suelta: 5.08, recibe: 5.32,
    chulo0: 5.36, gTira0: 5.78, gTira1: 5.95, gAw0: 6.6, gAw1: 7.6,
    remate0: 8.86, remate1: 9.0, mira0: 9.04, camara0: 9.3,
    salto0: 9.5, salto1: 9.8, salto2: 10.1, cae0: 10.36, cae1: 10.66,
    dPaso0: 10.72, dAgacha1: 11.3, pinza: 11.4, tiron0: 11.52, tiron1: 11.7,
    gira0: 11.74, levanta0: 11.66, levanta1: 11.98, suelta0: 11.72, suelta1: 12.56, salta: 12.6, caza: 12.98,
    gira1: 13.2, brillo2: 13.1, fin: 14.18
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const D = (pu, ix, md, re) => ({ pulgar: pu, indice: ix, medio: md, anular: re, menique: re });
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, -1.75), l: punoDesde({ x: 372, y: 648 }, -1.75) };
  const PEGA_G = { c: punoDesde({ x: 104, y: 712 }, -1.62), l: punoDesde({ x: 400, y: 706 }, -1.62) };   // manos atadas a los costados
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const memo = new Map();
  const cache = (k, f) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };
  const envolver = a => a - 2 * Math.PI * Math.floor((a + Math.PI) / (2 * Math.PI));
  const dentro = (t, a, b, c, d) => tramo(t, a, b) * (1 - tramo(t, c, d));
  const TINTA = "#0b0a0e";
  let MATRIZ = null;                                   // matriz de la cámara (para dibujar en pantalla desde las manos)

  const AGARRA = D(0.35, 0.42, 0.4, 0.38), PUNO = D(0, 0, 0, 0), PALMA = D(1, 1, 1, 1), RELAJ = D(0.6, 0.55, 0.5, 0.45);
  const CUERDA_D = D(0.5, 0.45, 0.35, 0.3);            // con la cuerda en el dedo corazón
  const ABRE2 = D(1, 1, 0.15, 0.1);                    // índice y pulgar abiertos (la base de la cuna)
  const GANCHO = D(0.3, 0.85, 0.25, 0.2);              // índice estirado (el vértice de la cuna)

  /* Pistas de una mano: [t0, t1, objetivo, curva]; el objetivo se resuelve en cada fotograma y se mezcla con
   * suavidad. El giro de la muñeca va por el camino corto. */
  function pista(lista, t, resuelve) {
    let c = resuelve(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)), d = resuelve(obj);
      c = { x: lerp(c.x, d.x, k), y: lerp(c.y, d.y, k), mu: c.mu + envolver(d.mu - c.mu) * k, ang: lerp(c.ang, d.ang, k),
        puno: lerp(c.puno, d.puno, k), dedos: DD(c.dedos, d.dedos, k) };
    }
    return c;
  }
  // un punto de la mano (en unidades de la mano: dedos hacia +y, pulgar hacia +x) en pantalla
  function puntoMano(rig, p, m, lx, ly) {
    const a = m.mu + Math.PI / 2, k = rig.JK * (m.puno ?? 1);
    return rig.aPantalla(p, { x: m.x + k * (lx * Math.cos(a) - ly * Math.sin(a)), y: m.y + k * (lx * Math.sin(a) + ly * Math.cos(a)) });
  }
  const DEDO = [2.3, 9];                              // donde va atada la cuerda (dedo corazón)

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, wd: 0, wi: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.2,
    dientes: 1, lengua: 0, mof: 0, rub: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, extraC) {
    const c = clamp(e.c + extraC);
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp, ojos: { d: clamp(c + e.wd), i: clamp(c + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* ================= fondo: azotea al atardecer ================= */
  let fondo = null;
  const YMURO = 372, YSUELO0 = 452;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60); g.lineJoin = "round"; g.lineCap = "round";
    // cielo
    const cielo = g.createLinearGradient(0, -60, 0, YMURO);
    cielo.addColorStop(0, "#1c1736"); cielo.addColorStop(0.32, "#3d2a62"); cielo.addColorStop(0.6, "#9a4a7a");
    cielo.addColorStop(0.82, "#ec8a5e"); cielo.addColorStop(1, "#ffc47c");
    g.fillStyle = cielo; g.fillRect(-40, -60, W + 80, YMURO + 60);
    // estrellas y luna
    for (let i = 0; i < 26; i++) { const x = hash(i * 3.1) * (W + 80) - 40, y = -55 + hash(i * 7.7) * 130, r = 0.6 + hash(i * 1.3) * 1.2;
      g.fillStyle = `rgba(255,246,220,${0.35 + 0.5 * hash(i * 5.3)})`; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
    g.save(); g.fillStyle = "#fff3d2"; g.beginPath(); g.arc(96, 26, 17, 0, Math.PI * 2); g.fill();
    g.globalCompositeOperation = "destination-out"; g.beginPath(); g.arc(104, 21, 15, 0, Math.PI * 2); g.fill(); g.restore();
    // sol enorme
    const SX = 872, SY = 246;
    const halo = g.createRadialGradient(SX, SY, 40, SX, SY, 260); halo.addColorStop(0, "rgba(255,214,140,0.55)"); halo.addColorStop(1, "rgba(255,170,110,0)");
    g.fillStyle = halo; g.fillRect(-40, -60, W + 80, YMURO + 60);
    const sol = g.createLinearGradient(0, SY - 82, 0, SY + 82); sol.addColorStop(0, "#ffe7a0"); sol.addColorStop(1, "#ff9a4e");
    g.fillStyle = sol; g.beginPath(); g.arc(SX, SY, 82, 0, Math.PI * 2); g.fill();
    // nubes alargadas
    g.fillStyle = "rgba(122,62,110,0.55)";
    for (const [x, y, w, h] of [[640, 236, 260, 9], [760, 254, 210, 7], [120, 150, 220, 8], [210, 166, 150, 6], [880, 120, 170, 7]]) {
      g.beginPath(); g.ellipse(x + w / 2, y, w / 2, h, 0, 0, Math.PI * 2); g.fill(); }
    // edificios lejanos
    g.fillStyle = "#7a4a78";
    let x = -40; for (let i = 0; x < W + 40; i++) { const w = 46 + hash(i + 11) * 70, h = 70 + hash(i + 29) * 90; g.fillRect(x, YMURO - h - 40, w + 1, h + 40); x += w; }
    // edificios cercanos con ventanas
    x = -40;
    for (let i = 0; x < W + 40; i++) {
      const w = 60 + hash(i + 51) * 90, h = 50 + hash(i + 73) * 110, y0 = YMURO - h;
      g.fillStyle = "#3e2752"; g.fillRect(x, y0, w + 1, h);
      g.fillStyle = "#4b3060"; g.fillRect(x, y0, w + 1, 5);
      for (let fy = y0 + 12; fy < YMURO - 12; fy += 16) for (let fx = x + 8; fx < x + w - 10; fx += 14) {
        const hh = hash(fx * 0.37 + fy * 1.91); if (hh < 0.74) continue;
        g.fillStyle = hh > 0.93 ? "#f7d48e" : "#c98a55"; g.fillRect(fx, fy, 6, 8);
      }
      x += w;
    }
    // depósito de agua sobre patas (izquierda)
    g.save(); g.translate(150, 196);
    g.strokeStyle = "#2b1a39"; g.lineWidth = 4;
    for (const [a, b] of [[-26, -34], [26, 34], [-10, -12], [10, 12]]) { g.beginPath(); g.moveTo(a, 18); g.lineTo(b, 70); g.stroke(); }
    g.lineWidth = 2.5; g.beginPath(); g.moveTo(-30, 44); g.lineTo(30, 44); g.moveTo(-28, 30); g.lineTo(33, 62); g.moveTo(28, 30); g.lineTo(-33, 62); g.stroke();
    g.fillStyle = "#2f1d3e"; g.beginPath(); g.moveTo(-34, -30); g.lineTo(34, -30); g.lineTo(34, 18); g.quadraticCurveTo(0, 26, -34, 18); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(-38, -30); g.lineTo(0, -58); g.lineTo(38, -30); g.closePath(); g.fill();
    g.strokeStyle = "rgba(255,190,140,0.25)"; g.lineWidth = 2; for (const yy of [-16, -2, 12]) { g.beginPath(); g.moveTo(-34, yy); g.quadraticCurveTo(0, yy + 6, 34, yy); g.stroke(); }
    g.restore();
    // antena con luz (derecha)
    g.strokeStyle = "#2b1a39"; g.lineWidth = 3; g.beginPath(); g.moveTo(985, 250); g.lineTo(985, 120); g.moveTo(970, 160); g.lineTo(1000, 160); g.moveTo(974, 190); g.lineTo(996, 190); g.stroke();
    g.fillStyle = "rgba(255,60,60,0.35)"; g.beginPath(); g.arc(985, 117, 9, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ff4a4a"; g.beginPath(); g.arc(985, 117, 3.5, 0, Math.PI * 2); g.fill();
    // murete de ladrillo con albardilla
    g.fillStyle = "#94503d"; g.fillRect(-40, YMURO, W + 80, YSUELO0 - YMURO);
    g.strokeStyle = "rgba(60,22,16,0.45)"; g.lineWidth = 1.5;
    for (let r = 0, y = YMURO + 12; y < YSUELO0; r++, y += 13) {
      g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke();
      for (let bx = -40 + (r % 2) * 22; bx < W + 40; bx += 44) { g.beginPath(); g.moveTo(bx, y); g.lineTo(bx, y + 13); g.stroke(); }
    }
    g.fillStyle = "rgba(255,170,120,0.12)"; g.fillRect(-40, YMURO + 12, W + 80, 30);
    g.fillStyle = "#d9b48f"; g.fillRect(-40, YMURO - 4, W + 80, 14);
    g.fillStyle = "#b48c6c"; g.fillRect(-40, YMURO + 8, W + 80, 4);
    g.strokeStyle = "#5a3324"; g.lineWidth = 2; g.beginPath(); g.moveTo(-40, YMURO - 4); g.lineTo(W + 40, YMURO - 4); g.stroke();
    // suelo de baldosas de barro en perspectiva
    const sg = g.createLinearGradient(0, YSUELO0, 0, H + 60); sg.addColorStop(0, "#a85a3e"); sg.addColorStop(1, "#c8774f");
    g.fillStyle = sg; g.fillRect(-40, YSUELO0, W + 80, H + 60 - YSUELO0);
    g.fillStyle = "rgba(40,14,8,0.3)"; g.fillRect(-40, YSUELO0, W + 80, 6);
    const VP = { x: 512, y: -420 }, filas = [];
    for (let y = YSUELO0, d = 14; y < H + 60; y += d, d *= 1.22) filas.push(y);
    const colX = (i, y) => VP.x + (i * 64 - VP.x) * (y - VP.y) / (YSUELO0 - VP.y);
    for (let r = 0; r < filas.length - 1; r++) for (let i = -6; i < 24; i++) {
      const y0 = filas[r], y1 = filas[r + 1], hh = hash(i * 13.1 + r * 7.3);
      if (hh < 0.55) continue;
      g.fillStyle = hh > 0.82 ? "rgba(255,190,140,0.10)" : "rgba(70,24,12,0.10)";
      g.beginPath(); g.moveTo(colX(i, y0), y0); g.lineTo(colX(i + 1, y0), y0); g.lineTo(colX(i + 1, y1), y1); g.lineTo(colX(i, y1), y1); g.closePath(); g.fill();
    }
    g.strokeStyle = "rgba(70,26,14,0.45)"; g.lineWidth = 1.4;
    for (const y of filas) { g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); }
    for (let i = -6; i < 25; i++) { g.beginPath(); g.moveTo(colX(i, YSUELO0), YSUELO0); g.lineTo(colX(i, H + 60), H + 60); g.stroke(); }
    // reflejo cálido del sol en el suelo
    const rf = g.createRadialGradient(860, 470, 10, 860, 470, 300); rf.addColorStop(0, "rgba(255,190,120,0.22)"); rf.addColorStop(1, "rgba(255,190,120,0)");
    g.fillStyle = rf; g.fillRect(-40, YSUELO0, W + 80, H + 60 - YSUELO0);
    // postes y guirnalda de bombillas
    const POSTES = [[34, 52], [994, 64]];
    g.fillStyle = "#4a2c22"; for (const [px, py] of POSTES) { g.fillRect(px - 5, py, 10, YMURO - py + 2); g.fillStyle = "#5e3a2c"; g.fillRect(px - 5, py, 4, YMURO - py); g.fillStyle = "#4a2c22"; }
    const tramoG = (a, b, comba) => {
      const pts = []; for (let i = 0; i <= 40; i++) { const k = i / 40; pts.push({ x: lerp(a[0], b[0], k), y: lerp(a[1], b[1], k) + comba * 4 * k * (1 - k) }); } return pts; };
    const cables = [tramoG([34, 56], [994, 68], 96), tramoG([34, 56], [520, 30], 44)];
    const COLS = ["#ffd36b", "#ff8f6b", "#9be38f", "#7fd3ff", "#ff8fd0"];
    for (const pts of cables) {
      g.strokeStyle = "#241626"; g.lineWidth = 1.6; g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); g.stroke();
      for (let i = 1; i < pts.length - 1; i += 2) {
        const q = pts[i], col = COLS[i % COLS.length];
        const gl = g.createRadialGradient(q.x, q.y + 6, 1, q.x, q.y + 6, 16); gl.addColorStop(0, col + "aa"); gl.addColorStop(1, col + "00");
        g.fillStyle = gl; g.beginPath(); g.arc(q.x, q.y + 6, 16, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#241626"; g.fillRect(q.x - 1.5, q.y, 3, 3);
        g.fillStyle = col; g.beginPath(); g.ellipse(q.x, q.y + 6, 3.2, 4.2, 0, 0, Math.PI * 2); g.fill();
      }
    }
    // a la derecha: un respiradero y un cactus en su maceta (lejos de donde cae Guillermo)
    g.save(); g.translate(908, YSUELO0 - 6);
    g.fillStyle = "#7d8790"; g.fillRect(-16, -64, 32, 64); g.fillStyle = "#98a3ab"; g.fillRect(-16, -64, 10, 64);
    g.fillStyle = "#5c656d"; g.beginPath(); g.ellipse(0, -66, 24, 7, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#3a4046"; g.lineWidth = 2; g.beginPath(); g.ellipse(0, -66, 24, 7, 0, 0, Math.PI * 2); g.stroke();
    g.restore();
    g.save(); g.translate(964, YSUELO0 + 8);
    g.fillStyle = "#3e8a4c"; g.beginPath(); g.ellipse(0, -44, 12, 30, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(-15, -46, 6, 12, -0.2, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(14, -54, 5, 11, 0.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#b8573a"; g.beginPath(); g.moveTo(-17, -18); g.lineTo(17, -18); g.lineTo(12, 6); g.lineTo(-12, 6); g.closePath(); g.fill();
    g.fillStyle = "#d26d4a"; g.fillRect(-19, -22, 38, 6);
    g.restore();
    return c;
  }

  /* ================= Guillermo ================= */
  const CG = {
    mira: E({ mx: 0.9, my: 0.35, sonr: 0.3, ancho: 0.95 }),
    abajo: E({ mx: 0.7, my: 0.95, sonr: 0.45, abre: 6, ancho: 0.8, sd: 10, si: 10 }),
    sorpresa: E({ mx: 0.6, my: 0.95, abre: 22, ancho: 0.6, sonr: 0, sd: 22, si: 22, iris: 0.85 }),
    risa: E({ mx: 0.8, my: 0.55, h: 0.8, sonr: 0.8, abre: 10, ancho: 1, sd: 14, si: 14 }),
    esquiva: E({ mx: 0.9, my: 0.1, abre: 18, ancho: 0.65, sonr: -0.1, sd: 24, si: 24, iris: 0.8 }),
    pasma: E({ mx: 0.9, my: 0.3, abre: 30, ancho: 0.62, sonr: -0.1, sd: 24, si: 24, gd: 0.05, gi: 0.05, iris: 0.82 }),
    ilusion: E({ mx: 0.9, my: 0.3, sonr: 0.8, ancho: 1, abre: 12, sd: 18, si: 18, gd: 0.15, gi: 0.15, iris: 1.1 }),
    atento: E({ mx: 0.85, my: 0.1, sonr: 0.3, ancho: 0.8, abre: 6, sd: 12, si: 12 }),
    chulo: E({ mx: 0, my: 0.05, sonr: 0.68, ancho: 0.95, sd: 14, gd: 0.14, si: -2, gi: -0.05 }),
    concentra: E({ mx: 0.5, my: 0.8, sonr: 0.05, ancho: 0.7, abre: 7, lengua: 1, sd: -5, si: 3, gd: -0.12, gi: 0.05 }),
    orgullo: E({ mx: 0.95, my: 0.1, sonr: 0.75, ancho: 1, c: 0.25, sd: 16, si: 6, gd: 0.15, gi: -0.05 }),
    esfuerzo: E({ mx: 0.6, my: 0.2, sonr: 0.55, abre: 14, ancho: 0.95, sd: -6, si: -6, gd: -0.15, gi: -0.15 }),
    panico: E({ mx: 0.3, my: -0.3, abre: 26, ancho: 0.7, sonr: -0.3, sd: 26, si: 26, iris: 0.75 }),
    ahogo: E({ mx: 0.1, my: -0.1, abre: 12, ancho: 0.55, lengua: 1, sonr: -0.4, sd: 22, si: 22, iris: 0.7, mof: 0.5 }),
    paquete: E({ mx: 0.2, my: 0.95, abre: 8, ancho: 0.6, sonr: -0.25, sd: 18, si: 18, iris: 0.9 }),
    resignado: E({ mx: 0, my: 0.05, c: 0.45, sonr: -0.15, ancho: 0.75, sd: -2, si: 6 }),
    socorro: E({ mx: 0.95, my: 0.15, abre: 10, ancho: 0.7, sonr: -0.45, sd: -14, si: -14, gd: -0.3, gi: -0.3 }),
    miedo: E({ mx: -0.4, my: -0.4, abre: 18, ancho: 0.6, sonr: -0.3, sd: 26, si: 26, iris: 0.8 }),
    grito: E({ mx: -0.4, my: -0.5, abre: 34, ancho: 0.8, sonr: -0.3, sd: 28, si: 28, iris: 0.75 }),
    planchado: E({ mx: 0, my: 0, c: 0.6, abre: 6, ancho: 0.7, sonr: -0.3, sd: 6, si: 6 }),
    vueltas: E({ mx: 0, my: 0, c: 0, abre: 24, ancho: 0.8, sonr: 0.2, sd: 24, si: 24, iris: 0.8 }),
    mareo: E({ mx: 0, my: 0, sonr: 0.45, ancho: 0.9, abre: 9, sd: 12, si: 4, gd: 0.1, gi: -0.1, esp: 1, lengua: 0.7 })
  };
  const GUION_CG = [
    [0.75, 1.0, "abajo"], [T.perro1 - 0.03, T.perro1 + 0.05, "sorpresa"], [T.olfatea1, T.olfatea1 + 0.2, "risa"],
    [T.aw0 + 0.05, T.aw0 + 0.2, "atento"], [2.2, 2.32, "esquiva"], [2.95, 3.15, "atento"], [3.5, 3.7, "pasma"],
    [T.pide0 - 0.05, T.pide0 + 0.12, "ilusion"], [T.recibe - 0.06, T.recibe + 0.04, "concentra"], [T.chulo0 + 0.04, T.chulo0 + 0.2, "chulo"],
    [T.gTira0 - 0.12, T.gTira0, "concentra"], [T.gTira1 + 0.05, T.gTira1 + 0.2, "orgullo"], [T.gAw0, T.gAw0 + 0.15, "esfuerzo"],
    [7.2, 7.4, "panico"], [7.6, 7.66, "ahogo"], [8.3, 8.45, "panico"], [8.9, 9.0, "paquete"],
    [T.camara0, T.camara0 + 0.12, "resignado"], [T.salto0 - 0.12, T.salto0, "socorro"], [10.14, 10.24, "miedo"],
    [T.cae0 + 0.04, T.cae0 + 0.12, "grito"], [T.cae1, T.cae1 + 0.06, "planchado"], [T.gira0 + 0.05, T.gira0 + 0.15, "vueltas"],
    [13.08, 13.22, "mareo"]
  ];
  const PARP_G = [0.35, 1.25, 2.6, 3.3, 4.4, 5.6, 6.3, 9.15, 9.45, 11.1];

  const P0G = { dx: 0, pel: 0, torso: 0, cab: 0 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    quieto: CuG({ cab: 0.02 }),
    abajo: CuG({ torso: 0.06, cab: 0.14, pel: 4 }),
    esquiva: CuG({ torso: -0.13, cab: -0.2, pel: 6, dx: -12 }),
    mira: CuG({ torso: 0.02, cab: 0.04 }),
    pide: CuG({ torso: 0.07, cab: -0.04, pel: -6, dx: 6 }),
    recibe: CuG({ torso: 0.06, cab: 0.06, pel: 4, dx: 4 }),
    chulo: CuG({ torso: -0.05, cab: -0.06 }),
    lanza: CuG({ torso: 0.08, cab: 0.1, pel: 8, dx: 4 }),
    orgullo: CuG({ torso: -0.06, cab: -0.08 }),
    molino: CuG({ torso: -0.03, cab: -0.02, pel: 6 }),
    ahogo: CuG({ torso: -0.05, cab: -0.08, pel: -4 }),
    paquete: CuG({ torso: 0, cab: 0.02 }),
    mira_cuerpo: CuG({ torso: 0.02, cab: 0.12 }),
    mareo: CuG({ torso: 0, cab: 0 })
  };
  const GUION_G = [
    [0.75, 1.05, "abajo"], [T.dSube0, T.dSube1, "mira"], [2.18, 2.34, "esquiva", salida], [2.9, 3.2, "mira"],
    [T.pide0, T.pide0 + 0.2, "pide"], [T.recibe - 0.1, T.recibe + 0.05, "recibe"], [T.chulo0, T.chulo0 + 0.2, "chulo"],
    [T.gTira0 - 0.1, T.gTira0 + 0.05, "lanza"], [T.gTira1 + 0.05, T.gTira1 + 0.3, "orgullo"], [T.gAw0, T.gAw0 + 0.25, "molino"],
    [7.6, 7.68, "ahogo"], [8.9, 9.0, "mira_cuerpo"], [T.camara0, T.camara0 + 0.15, "paquete"], [T.gira0, T.gira0 + 0.3, "mareo"]
  ];
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };

  // dónde está Guillermo (pelvis): dos saltitos atado y, girando, se va un poco a la izquierda
  function xBaseG(t) {
    let x = XG + 70 * suave(fase(t, T.salto0, T.salto1)) + 70 * suave(fase(t, T.salto1, T.salto2));
    x -= 60 * salida(fase(t, T.levanta0, T.levanta1 + 0.3));
    return x;
  }
  // altura del salto y aplastamiento (preparación y aterrizaje)
  function saltoG(t) {
    let alto = 0, aplasta = 0;
    for (const t0 of [T.salto0, T.salto1]) {
      const k = fase(t, t0 + 0.05, t0 + 0.26); if (k > 0 && k < 1) alto = Math.max(alto, 34 * Math.sin(Math.PI * k));
      aplasta = Math.max(aplasta, campana(t, t0 - 0.06, t0 + 0.06), campana(t, t0 + 0.24, t0 + 0.34) * 0.8);
    }
    return { alto, aplasta };
  }
  // inclinación de todo el bloque (rad): tambaleo, caída de espaldas, rebote y levantarse girando
  function caidaG(t) {
    let a = 0.05 * campana(t, 10.1, 10.22) - 0.06 * campana(t, 10.2, 10.34);
    if (t > T.cae0) { const u = fase(t, T.cae0, T.cae1); a = -0.05 - (Math.PI / 2 - 0.05) * Math.pow(u, 2.2); }
    if (t > T.cae1) a = -Math.PI / 2 + 0.07 * campana(t, T.cae1, T.cae1 + 0.16);
    if (t > T.levanta0) { const u = fase(t, T.levanta0, T.levanta1); a = -Math.PI / 2 * (1 - salida(u)) + 0.09 * campana(t, T.levanta1 - 0.12, T.levanta1 + 0.16); }
    return a;
  }
  // giro de peonza: vueltas acumuladas (deprisa al principio, frena al final)
  const VUELTAS = 5;
  function giroG(t) { if (t <= T.gira0) return 0; const u = fase(t, T.gira0, T.gira1); return 2 * Math.PI * VUELTAS * (1 - Math.pow(1 - u, 2)); }
  // atado: brazos pegados (desde las vueltas de los brazos hasta que se sueltan) y piernas juntas
  const brazosAtados = t => dentro(t, 7.95, 8.03, 12.28, 12.38);
  const piernasAtadas = t => dentro(t, 8.43, 8.5, 11.94, 12.04);
  const ATRAS = 66, DELANTE = 70;                      // del centro de los pies a la espalda y a la punta (px, para caer)

  // mano lejana: la del yoyó (mu en pantalla: hacia el codo)
  const PISTA_GL = [
    [0, 0, { bols: true }],
    [T.pide0, T.pide0 + 0.2, { rel: { x: 98, y: 296 }, mu: Math.PI - 0.15, dedos: PALMA }],
    [T.suelta + 0.06, T.recibe - 0.02, { rel: { x: 104, y: 300 }, mu: Math.PI - 0.35, dedos: PALMA }],
    [T.recibe, T.recibe + 0.07, { rel: { x: 100, y: 302 }, mu: Math.PI - 0.35, dedos: AGARRA }],
    [T.chulo0, T.chulo0 + 0.22, { rel: { x: 82, y: 290 }, mu: 2.25, dedos: AGARRA }],
    [T.gTira0 - 0.14, T.gTira0, { rel: { x: 96, y: 276 }, mu: 2.6, dedos: AGARRA }],
    [T.gTira0, T.gTira0 + 0.07, { rel: { x: 106, y: 312 }, mu: Math.PI - 0.15, dedos: RELAJ }, salida],
    [T.gTira1 - 0.03, T.gTira1 + 0.14, { rel: { x: 104, y: 300 }, mu: Math.PI - 0.3, dedos: CUERDA_D }],
    [T.gAw0 - 0.08, T.gAw0 + 0.1, { rel: { x: 102, y: 288 }, mu: Math.PI - 0.15, dedos: CUERDA_D }],
    [7.56, 7.64, { rel: { x: 60, y: 276 }, mu: 2.3, dedos: PALMA }],
    [7.95, 8.05, { pega: "l" }],
    [12.3, 12.42, { hom: { x: 84, y: 30 }, mu: Math.PI, dedos: PALMA }],
    [13.05, 13.4, { hom: { x: 12, y: 92 }, mu: -1.7, dedos: RELAJ }]
  ];
  // mano cercana: en el bolsillo; se lleva las manos al cuello, atada, y luego suelta
  const PISTA_GC = [
    [0, 0, { bols: true }],
    [7.6, 7.68, { rel: { x: 18, y: 282 }, mu: 2.5, dedos: PALMA }],
    [7.95, 8.05, { pega: "c" }],
    [12.3, 12.42, { hom: { x: -92, y: 36 }, mu: 0, dedos: PALMA }],
    [13.05, 13.4, { hom: { x: -2, y: 96 }, mu: -1.6, dedos: RELAJ }]
  ];

  // la pose de Guillermo se pide varias veces por fotograma (Dari busca la punta de su zapato): se guarda la última
  const ultG = { t: NaN, p: null };
  function poseG(t) { if (ultG.t !== t) { ultG.p = poseG0(t); ultG.t = t; } return ultG.p; }
  function poseG0(t) {
    const b = linea(GUION_G, CUER_G, "quieto", t);
    const respira = Math.sin(t * 2.2 + 0.3);
    const X = xBaseG(t), hop = saltoG(t);
    const maree = tramo(t, 13.1, 13.4);
    const sway = maree * Math.sin((t - 13.1) * 3.1);
    const p = {
      x: X + b.dx, suelo: SUELO - hop.alto, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 + 40 * hop.aplasta },
      torso: b.torso + 0.06 * sway, torsoEsc: { x: 1, y: 1 + respira * 0.004 - 0.03 * hop.aplasta },
      piernas: {}, cabeza: { ang: b.cab - 0.1 * Math.sin((t - 13.1) * 3.1 + 0.9) * maree, dx: 8 * Math.cos((t - 13.1) * 3.1) * maree, dy: 0, esc: { x: 1, y: 1 } },
      tirasLimpias: true, ikContinuo: true
    };
    // pies: normales; levanta la punta cuando llega el yoyó; atados juntos; mareado, bien abiertos
    const at = piernasAtadas(t), abre = tramo(t, 13.05, 13.3);
    const punta = dentro(t, T.perro1 - 0.05, T.perro1 + 0.04, 1.86, 2.02);
    for (const lado of ["cerca", "lejos"]) {
      const s = lado === "cerca" ? -1 : 1;
      let fx = lerp(s < 0 ? X - 30 : X + 32, s < 0 ? X - 6 : X + 9, at);
      fx = lerp(fx, s < 0 ? X - 40 : X + 42, abre);
      const ang = lado === "lejos" ? -0.42 * punta : 0;
      p.piernas[lado] = { tob: { x: G.PELVIS.x + (fx - p.x) / S, y: TOB_G[lado] - 14 * (lado === "lejos" ? punta : 0) }, ang };
    }
    // ahogo: la cabeza se aplasta y tiembla; mareo: da vueltecitas
    const ah = dentro(t, 7.6, 7.66, 7.95, 8.15);
    p.cabeza.ang += 0.05 * ah * Math.sin(t * 34); p.cabeza.esc = { x: 1 - 0.05 * ah, y: 1 + 0.05 * ah };
    // cara
    const e = linea(GUION_CG, CG, "mira", t);
    e.abre += 4 * ah * Math.max(0, Math.sin(t * 34));
    p.cara = cara(e, e.esp > 0.5 || e.h > 0.5 ? 0 : parpadeo(t, PARP_G));
    p.rojo = 0.7 * ah + 0.25 * dentro(t, 7.2, 7.4, 7.6, 7.65);
    p.sudor = 0.6 * dentro(t, 7.1, 7.4, 7.6, 7.7) + 0.7 * dentro(t, 8.9, 9.1, 10.66, 10.8);
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    const resuelve = lado => o => {
      if (o.bols) { const q = Tr(BOLS_G[lado]); return { x: q.x, y: q.y, mu: -1.75, ang: 0, puno: 0, dedos: D(0.4, 0.4, 0.4, 0.4) }; }
      if (o.pega) { const q = Tr(PEGA_G[lado]); return { x: q.x, y: q.y, mu: -1.62 + p.torso, ang: 0, puno: 1, dedos: D(0.5, 0.3, 0.3, 0.3) }; }
      if (o.hom) { const h = lado === "l" ? hl : hc; return { x: h.x + o.hom.x / S, y: h.y + o.hom.y / S, mu: o.mu, ang: 0, puno: 1, dedos: o.dedos }; }
      const q = o.rel ? { x: X + o.rel.x, y: o.rel.y } : o.pant;
      const h = G.aHoja(p, q);
      return { x: h.x, y: h.y, mu: o.mu, ang: 0, puno: 1, dedos: o.dedos };
    };
    const L = pista(PISTA_GL, t, resuelve("l")), C = pista(PISTA_GC, t, resuelve("c"));
    // pide: la mano bota («¡yo, yo!»)
    const bota = dentro(t, T.pide0, T.pide0 + 0.1, T.suelta, T.suelta + 0.1);
    L.y -= bota * 14 * Math.abs(Math.sin((t - T.pide0) * 11)) / S;
    // lanzamiento del dormilón: la mano marca el golpe
    // vuelta al mundo: la mano gira (cada vez más), adelantada al yoyó
    const aw = dentro(t, T.gAw0, T.gAw0 + 0.12, 7.5, 7.62);
    if (aw > 0) {
      const be = betaG(t), rh = lerp(5, 20, fase(t, T.gAw0, T.gAw1));
      L.x += aw * rh * Math.cos(be - Math.PI / 2) / S; L.y += aw * rh * Math.sin(be - Math.PI / 2) / S;
      L.mu = L.mu + 0.35 * aw * Math.sin(be);
    }
    // ahogo: las manos tiemblan junto al cuello
    if (ah > 0) { L.x += 4 * ah * ruido(t * 31) / S; L.y += 4 * ah * ruido(t * 29 + 3) / S; C.x += 4 * ah * ruido(t * 27 + 7) / S; C.y += 4 * ah * ruido(t * 33 + 1) / S; }
    // brazos fuera girando (se sueltan) y colgando mareado
    p.manoLejos = { x: L.x, y: L.y, ang: L.ang, mu: L.mu, dobla: -1, puno: L.puno, dedos: L.dedos };
    p.manoCerca = { x: C.x, y: C.y, ang: C.ang, mu: C.mu, dobla: -1, puno: C.puno, dedos: C.dedos };
    p._dedo = puntoMano(G, p, p.manoLejos, DEDO[0], DEDO[1]);
    p._palma = puntoMano(G, p, p.manoLejos, 1, 3);
    p._tiene = t >= T.recibe && t < T.gTira0 + 0.02;              // el yoyó en la mano (asoma por los dedos)
    p._agarre = puntoMano(G, p, p.manoLejos, 1, 12);
    p.capaTronco = null;
    return p;
  }

  /* ================= Dari ================= */
  const CD = {
    calma: E({ mx: 0.65, my: 0.75, c: 0.35, sonr: 0.25, ancho: 0.85 }),
    perro: E({ mx: 0.8, my: 0.9, c: 0.3, sonr: 0.35, ancho: 0.85, si: 6 }),
    guay: E({ mx: 0.05, my: 0.05, c: 0.45, sonr: 0.42, ancho: 0.85, sd: 2, si: 10, gi: 0.08 }),
    cuna: E({ mx: 0.4, my: 0.75, c: 0.2, sonr: 0.45, ancho: 0.9, sd: 6, si: 10 }),
    ceja: E({ mx: 0.95, my: 0.25, c: 0.25, sonr: 0.05, ancho: 0.75, sd: 0, si: 18, gi: 0.15 }),
    vale: E({ mx: 0.95, my: 0.2, c: 0.3, sonr: 0.3, ancho: 0.85, sd: 6, si: 8 }),
    mira: E({ mx: 0.95, my: 0.3, c: 0.2, sonr: 0.15, ancho: 0.8 }),
    susto: E({ mx: 0.95, my: 0.15, sonr: 0, abre: 8, ancho: 0.6, sd: 16, si: 16, iris: 0.9 }),
    aprieta: E({ mx: 0.95, my: 0.3, c: 0.55, z: 0.3, sonr: -0.2, abre: 5, ancho: 0.7, sd: -4, si: 10 }),
    suspiro: E({ mx: 0.8, my: 0.65, c: 0.75, sonr: 0.05, ancho: 0.8, abre: 3, sd: 4, si: 4 }),
    agacha: E({ mx: 0.75, my: 0.9, c: 0.3, sonr: 0.1, ancho: 0.8 }),
    tira: E({ mx: 0.9, my: 0.4, c: 0.3, sonr: 0.25, ancho: 0.85, sd: -4, si: 4 }),
    seco: E({ mx: 0.02, my: 0.05, c: 0.38, sonr: 0.18, ancho: 0.8, sd: 2, si: 10, gi: 0.1 }),
    sonrisa: E({ mx: 0.02, my: 0.05, c: 0.3, sonr: 0.55, ancho: 0.95, sd: 8, si: 14, gi: 0.1 })
  };
  const GUION_CD = [
    [T.dTira0 - 0.1, T.dTira0 + 0.1, "perro"], [T.dSube0, T.dSube1, "calma"], [T.aw0 + 0.05, T.aw0 + 0.25, "guay"],
    [T.cuna0 + 0.1, T.cunaForma, "cuna"], [T.pide0 + 0.1, T.pide0 + 0.25, "ceja"], [T.lanza0 - 0.08, T.lanza0 + 0.08, "vale"],
    [T.gTira1 + 0.1, T.gTira1 + 0.3, "mira"], [7.05, 7.2, "susto"], [7.62, 7.75, "aprieta"], [9.0, 9.2, "suspiro"],
    [9.55, 9.65, "susto"], [10.0, 10.1, "aprieta"], [T.cae1 + 0.02, T.cae1 + 0.25, "suspiro"], [T.dPaso0 + 0.25, T.dAgacha1, "agacha"],
    [T.tiron0, T.tiron0 + 0.1, "tira"], [12.6, 12.75, "seco"], [13.5, 13.7, "sonrisa"]
  ];
  const PARP_D = [0.25, 1.6, 3.1, 4.75, 5.9, 6.9, 8.2, 9.3, 11.0, 12.2, 13.9];
  const P0D = { dx: 0, pel: 0, torso: 0.02, cab: 0.05 };
  const CuD = o => Object.assign({}, P0D, o);
  const CUER_D = {
    quieto: CuD({}),
    perro: CuD({ torso: 0.3, cab: 0.16, pel: 90, dx: -8 }),
    erguido: CuD({ torso: 0.0, cab: 0.02 }),
    guay: CuD({ torso: -0.05, cab: -0.07, dx: 4 }),
    cuna: CuD({ torso: 0.12, cab: 0.16, pel: 4, dx: -10 }),
    ofrece: CuD({ torso: 0.06, cab: 0.04 }),
    lanza: CuD({ torso: 0.1, cab: 0.04, dx: -6, pel: 6 }),
    mira: CuD({ torso: 0.01, cab: 0.04 }),
    susto: CuD({ torso: -0.1, cab: -0.1, dx: 10 }),
    agacha: CuD({ torso: 0.85, cab: 0.6, pel: 100, dx: -6 }),
    tira: CuD({ torso: -0.1, cab: -0.06, pel: 8, dx: 8 }),
    sostiene: CuD({ torso: -0.04, cab: 0.0 }),
    final: CuD({ torso: -0.02, cab: -0.02 })
  };
  const GUION_D = [
    [T.dTira0 - 0.05, T.dTira1 + 0.1, "perro"], [T.dSube0, T.dSube1 + 0.05, "erguido"], [T.aw0, T.awSale + 0.1, "guay"],
    [T.awVuelve, T.cunaBaja, "cuna"], [T.cunaSuelta, T.cunaVuelve + 0.1, "ofrece"], [T.lanza0 - 0.1, T.suelta, "lanza"],
    [T.suelta + 0.05, T.suelta + 0.35, "mira"], [7.05, 7.22, "susto", salida], [8.2, 8.6, "mira"], [9.55, 9.75, "susto"],
    [10.4, 10.7, "mira"], [T.dPaso0 + 0.36, T.dAgacha1, "agacha"], [T.tiron0, T.tiron1, "tira", salida],
    [T.tiron1 + 0.1, 12.0, "sostiene"], [13.2, 13.6, "final"]
  ];
  // pasos de Dari: hacia los pies de Guillermo, atrás con el tirón y otro pasito atrás para cazar el yoyó
  const PASOS_D = {
    lejos: [[0, 0, XD - 26], [T.dPaso0, T.dPaso0 + 0.18, 612], [T.dPaso0 + 0.26, T.dPaso0 + 0.44, 552], [T.tiron0 + 0.08, T.tiron0 + 0.24, 670], [12.5, 12.66, 722]],
    cerca: [[0, 0, XD + 22], [T.dPaso0 + 0.12, T.dPaso0 + 0.3, 660], [T.dPaso0 + 0.36, T.dPaso0 + 0.54, 602], [T.tiron0, T.tiron0 + 0.15, 722], [12.4, 12.56, 772]]
  };
  function pie(lista, t) {
    let x = lista[0][2], alza = 0;
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, x1] = lista[i]; if (t <= t0) break;
      const k = fase(t, t0, t1); if (k < 1) alza = Math.sin(Math.PI * k);
      x = lerp(x, x1, suave(k));
    }
    return { x, alza };
  }
  // mano lejana de Dari (la del yoyó); mu en ángulo de pantalla; rel = respecto a su pelvis
  const PISTA_DL = [
    [0, 0, { rel: { x: -76, y: 322 }, mu: 0.75, dedos: AGARRA }],
    [T.dTira0 - 0.16, T.dTira0, { rel: { x: -84, y: 302 }, mu: 0.55, dedos: AGARRA }],
    [T.dTira0, T.dTira0 + 0.09, { rel: { x: -100, y: 340 }, mu: 0.1, dedos: RELAJ }, salida],
    [T.dTira0 + 0.12, T.perro1 - 0.1, { rel: { x: -112, y: 398 }, mu: -0.65, dedos: CUERDA_D }],
    [T.dSube0, T.dSube0 + 0.1, { rel: { x: -104, y: 368 }, mu: -0.3, dedos: CUERDA_D }, salida],
    [T.dSube0 + 0.1, T.dSube1, { rel: { x: -88, y: 320 }, mu: 0.6, dedos: AGARRA }],
    [T.aw0, T.awSale, { rel: { x: -116, y: 282 }, mu: 0.2, dedos: CUERDA_D }],
    [T.aw1, T.awVuelve, { rel: { x: -90, y: 318 }, mu: 0.6, dedos: AGARRA }],
    [T.cuna0, T.cunaBaja, { rel: { x: -64, y: 322 }, mu: 0.9, dedos: CUERDA_D }],
    [T.cunaBaja, T.cunaForma, { rel: { x: -48, y: 346 }, mu: -1.3, dedos: ABRE2 }],
    [T.cuna1, T.cunaSuelta, { rel: { x: -62, y: 324 }, mu: 0.9, dedos: CUERDA_D }],
    [T.cunaSuelta, T.cunaVuelve, { rel: { x: -84, y: 316 }, mu: 0.65, dedos: AGARRA }],
    [T.lanza0 - 0.16, T.lanza0, { rel: { x: -62, y: 330 }, mu: 1.0, dedos: AGARRA }],
    [T.lanza0, T.suelta + 0.04, { rel: { x: -108, y: 288 }, mu: 0.15, dedos: PALMA }, salida],
    [T.suelta + 0.3, T.suelta + 0.6, { bols: true, lado: "lejos" }],
    [T.dPaso0 + 0.3, T.dAgacha1, { punta: true, mu: -0.95, dedos: D(0.6, 0.75, 0.3, 0.3) }],
    [T.pinza - 0.06, T.pinza, { punta: true, mu: -0.95, dedos: D(0.35, 0.4, 0.3, 0.3) }],
    [T.tiron0, T.tiron1, { rel: { x: -40, y: 352 }, mu: -0.4, dedos: D(0.35, 0.4, 0.3, 0.3) }, salida],
    [T.tiron1 + 0.05, T.tiron1 + 0.35, { rel: { x: -58, y: 338 }, mu: 0.0, dedos: D(0.35, 0.4, 0.3, 0.3) }],
    [T.salta, T.salta + 0.18, { rel: { x: -96, y: 300 }, mu: 0.05, dedos: PALMA }],
    [T.caza - 0.02, T.caza + 0.06, { rel: { x: -96, y: 302 }, mu: 0.05, dedos: AGARRA }],
    [13.3, 13.7, { rel: { x: -74, y: 314 }, mu: 0.75, dedos: AGARRA }]
  ];
  // mano cercana: en el bolsillo; hace de vértice de la cuna
  const PISTA_DC = [
    [0, 0, { bols: true, lado: "cerca" }],
    [T.cunaBaja - 0.04, T.cunaForma, { rel: { x: -40, y: 262 }, mu: 0.15, dedos: GANCHO }],
    [T.cuna1 + 0.02, T.cunaVuelve + 0.05, { bols: true, lado: "cerca" }]
  ];

  function poseD(t) {
    const b = linea(GUION_D, CUER_D, "quieto", t);
    const respira = Math.sin(t * 2.0 + 1.1), sus = campana(t, 9.0, 9.6);
    const fl = pie(PASOS_D.lejos, t), fc = pie(PASOS_D.cerca, t);
    const x = (fl.x + fc.x) / 2 + 2 + b.dx;
    const anda = Math.max(fl.alza, fc.alza);
    const p = {
      x, suelo: SUELO, s: S, espejo: true,
      pelvis: { x: Da.PELVIS.x, y: Da.PELVIS.y + b.pel + respira * 1.1 + 5 * sus - 8 * anda },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 - 0.012 * sus },
      piernas: {}, cabeza: { ang: b.cab - 0.04 * sus, dx: 0, dy: 0, esc: { x: 1, y: 1 } }, tirasLimpias: true, ikContinuo: true
    };
    // mece la cabeza con la cuna
    p.cabeza.ang += 0.04 * dentro(t, T.cunaForma, T.cunaForma + 0.1, T.cuna1, T.cuna1 + 0.1) * Math.sin((t - T.cunaForma) * 2 * Math.PI / 0.8);
    const ty = Da.SUELO - Da.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: Da.aHoja(p, { x: fc.x, y: 0 }).x, y: ty - 26 * fc.alza }, ang: 0.25 * fc.alza };
    p.piernas.lejos = { tob: { x: Da.aHoja(p, { x: fl.x, y: 0 }).x, y: ty - 8 - 26 * fl.alza }, ang: 0.25 * fl.alza };
    const e = linea(GUION_CD, CD, "calma", t);
    p.cara = cara(e, parpadeo(t, PARP_D, 0.13));
    // gafas: brincan con el susto
    const ds = t - 7.06, sac = ds > 0 ? Math.exp(-ds * 8) : 0;
    p.gafas = { dx: 0, dy: -14 * sac * Math.abs(Math.sin(ds * 22)), ang: 0.03 * sac * Math.sin(ds * 26 + 1) };
    p.capaCabeza = g => destello(g, t, p.gafas);
    // manos
    const resuelve = o => {
      if (o.bols) { const m = Da.manoReposo(p, o.lado); return { x: m.x, y: m.y, mu: m.mu, ang: 0, puno: m.puno ?? 0, dedos: D(0.4, 0.4, 0.4, 0.4) }; }
      let q;
      if (o.punta) { const pt = puntaZapatoG(t), off = offDedoD(o.mu); q = { x: pt.x - off.x, y: pt.y - off.y }; }
      else q = o.rel ? { x: x + o.rel.x, y: o.rel.y } : o.pant;
      const h = Da.aHoja(p, q);
      return { x: h.x, y: h.y, mu: Math.PI - o.mu, ang: 0, puno: 1, dedos: o.dedos };
    };
    const L = pista(PISTA_DL, t, resuelve), C = pista(PISTA_DC, t, resuelve);
    // vuelta al mundo: la mano gira un poco, adelantada al yoyó
    const aw = dentro(t, T.aw0, T.awSale, T.aw1, T.awVuelve);
    if (aw > 0) { const be = betaD(t); L.x -= aw * 6 * Math.cos(be + Math.PI / 2) / S; L.y += aw * 6 * Math.sin(be + Math.PI / 2) / S; }
    // cuna: la mano de arriba acompaña el vaivén
    p.manoLejos = { x: L.x, y: L.y, ang: L.ang, mu: L.mu, dobla: -1, puno: L.puno, dedos: L.dedos };
    p.manoCerca = { x: C.x, y: C.y, ang: C.ang, mu: C.mu, dobla: -1, puno: C.puno, dedos: C.dedos };
    p._dedo = puntoMano(Da, p, p.manoLejos, DEDO[0], DEDO[1]);
    p._palma = puntoMano(Da, p, p.manoLejos, 1, 3);
    p._indiceL = puntoMano(Da, p, p.manoLejos, 9, 19);       // la base de la cuna: índice y pulgar de la mano lejana
    p._pulgarL = puntoMano(Da, p, p.manoLejos, 20, 2.5);
    p._indiceC = puntoMano(Da, p, p.manoCerca, 8.5, 18.5);    // el vértice: índice de la mano cercana
    const enMano = (t < T.dTira0 + 0.03) || (t >= T.dSube1 - 0.02 && t < T.aw0 + 0.03) || (t >= T.awVuelve - 0.01 && t < T.cuna0 + 0.03) ||
      (t >= T.cunaVuelve - 0.01 && t < T.suelta) || t >= T.caza;
    p._tiene = enMano; p._agarre = puntoMano(Da, p, p.manoLejos, 1, 12);
    return p;
  }
  // del centro de la mano de Dari a la punta del índice (para coger la cuerda), en pantalla
  function offDedoD(mu) { const a = Math.PI - mu + Math.PI / 2, k = S * Da.JK, lx = 4, ly = 16;
    return { x: -k * (lx * Math.cos(a) - ly * Math.sin(a)), y: k * (lx * Math.sin(a) + ly * Math.cos(a)) }; }

  // destello en las gafas de Dari (coordenadas del retrato)
  const ARO_D = [[729, 474], [744, 471], [789, 478], [833, 496], [858, 509], [861, 517], [849, 545], [837, 569], [823, 579], [789, 575], [745, 561], [734, 553], [729, 530]];
  function destello(g, t, gf) {
    let k = 0, tk = 0;
    for (const tb of [T.brillo1, T.brillo2, 13.75]) { const c = campana(t, tb, tb + 0.4); if (c > k) { k = c; tk = fase(t, tb, tb + 0.4); } }
    if (k <= 0.01) return;
    g.save(); g.translate(gf.dx || 0, gf.dy || 0);
    g.save(); g.beginPath(); ARO_D.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.clip();
    const xb = lerp(690, 900, tk);
    g.fillStyle = `rgba(255,255,255,${0.85 * k})`;
    g.beginPath(); g.moveTo(xb, 460); g.lineTo(xb + 34, 460); g.lineTo(xb - 6, 590); g.lineTo(xb - 40, 590); g.closePath(); g.fill();
    g.restore();
    const s = 46 * Math.sin(Math.PI * tk);
    g.translate(846, 488); g.rotate(0.3 * tk); g.fillStyle = "#ffffff"; g.globalAlpha = k;
    g.beginPath(); g.moveTo(0, -s); g.quadraticCurveTo(0, 0, s, 0); g.quadraticCurveTo(0, 0, 0, s); g.quadraticCurveTo(0, 0, -s, 0); g.quadraticCurveTo(0, 0, 0, -s); g.fill();
    g.restore();
  }

  /* ================= el yoyó ================= */
  const R_YO = 9, LARGO = 128;
  const YP = SUELO - R_YO - 1;                        // altura del yoyó rodando por el suelo
  const X_ZAPATO = XG + 90;                            // punta del zapato lejano de Guillermo (más el radio)
  // ángulo de la vuelta al mundo: posición = centro + R (cos β, sin β)
  function betaD(t) { return Math.PI + 4 * Math.PI * suave(fase(t, T.aw0 + 0.04, T.aw1 + 0.06)); }
  const BETA_G_FIN = Math.PI / 2 - (5 * Math.PI / 4 + 4 * Math.PI);
  function betaG(t) { const u = fase(t, T.gAw0, T.gAw1); return Math.PI / 2 - (Math.PI / 2 - BETA_G_FIN) * Math.pow(u, 1.55); }
  function radioD(t) { return LARGO * salida(fase(t, T.aw0, T.awSale)) * (1 - entrada(fase(t, T.aw1, T.awVuelve))); }

  /* Vueltas alrededor de Guillermo: bandas (marco de Guillermo: px respecto a su pelvis en x y al suelo en y).
   * Cada vuelta del yoyó deja una banda; se ven por delante (medio óvalo inferior). */
  const BANDAS = [
    { cx: 22, cy: -316, rx: 24, ry: 5, inc: 0.2 }, { cx: 20, cy: -306, rx: 27, ry: 5, inc: -0.16 },
    { cx: 2, cy: -238, rx: 68, ry: 9, inc: 0.17 }, { cx: 2, cy: -206, rx: 70, ry: 9, inc: -0.15 }, { cx: 2, cy: -176, rx: 68, ry: 9, inc: 0.16 },
    { cx: 6, cy: -118, rx: 34, ry: 6, inc: -0.2 }, { cx: 6, cy: -86, rx: 31, ry: 6, inc: 0.18 }, { cx: 8, cy: -56, rx: 30, ry: 6, inc: -0.16 }
  ];
  const ORBITAS = [[7.6, 7.78], [7.78, 7.95], [7.95, 8.11], [8.11, 8.27], [8.27, 8.43], [8.43, 8.58], [8.58, 8.72], [8.72, 8.86]];
  const LAZO = { x: 50, y: -232 };                     // donde se queda el yoyó (la barriga, como el lazo de un paquete)
  // instante en que se desenrolla cada banda (de fuera a dentro: piernas, brazos, cuello)
  const SUELTA_B = BANDAS.map((_, i) => lerp(T.suelta1, T.suelta0, (i + 0.5) / BANDAS.length));
  function nBandas(t) {
    if (t < ORBITAS[0][0]) return { n: 0, parcial: -1, frac: 0 };
    if (t < T.suelta0) {
      for (let k = 0; k < ORBITAS.length; k++) {
        const [t0, t1] = ORBITAS[k]; if (t > t1) continue;
        const phi = -Math.PI / 2 + 2 * Math.PI * fase(t, t0, t1);
        return { n: k, parcial: k, frac: clamp(phi / Math.PI) };
      }
      return { n: BANDAS.length, parcial: -1, frac: 0 };
    }
    let n = 0; for (let i = 0; i < BANDAS.length; i++) if (t < SUELTA_B[i]) n = i + 1;
    return { n, parcial: -1, frac: 0 };
  }
  // punto de una banda en el marco de Guillermo
  function puntoBanda(b, th, rx, ry) {
    const c = Math.cos(b.inc), s = Math.sin(b.inc), x = rx * Math.cos(th), y = ry * Math.sin(th);
    return { x: b.cx + x * c - y * s, y: b.cy + x * s + y * c };
  }
  // posición del yoyó dando vueltas alrededor de Guillermo (marco de Guillermo) y si va por delante
  function orbita(t) {
    for (let k = 0; k < ORBITAS.length; k++) {
      const [t0, t1] = ORBITAS[k]; if (t > t1 && k < ORBITAS.length - 1) continue;
      const u = fase(t, t0, t1), phi = -Math.PI / 2 + 2 * Math.PI * u, b = BANDAS[k], bn = BANDAS[Math.min(k + 1, BANDAS.length - 1)];
      const pasa = k < ORBITAS.length - 1 ? suave(fase(phi, Math.PI, 3 * Math.PI / 2)) : 0;
      const bb = { cx: lerp(b.cx, bn.cx, pasa), cy: lerp(b.cy, bn.cy, pasa), inc: lerp(b.inc, bn.inc, pasa) };
      const RO = lerp(b.rx, bn.rx, pasa) + 34, ro = RO * 0.3;
      return { q: puntoBanda(bb, phi, RO, ro), delante: Math.sin(phi) > 0, phi, k, banda: bb, rx: lerp(b.rx, bn.rx, pasa), ry: b.ry };
    }
  }

  // marco de Guillermo (pantalla sin cámara): caída alrededor de la espalda (o la punta) y giro de peonza
  function marcoG(t, pG) {
    const a = caidaG(t), gx = Math.cos(giroG(t)), sx = Math.abs(gx) < 0.03 ? 0.03 * Math.sign(gx || 1) : gx;
    const ax = pG.x + 10, pv = a <= 0 ? { x: pG.x - ATRAS, y: pG.suelo } : { x: pG.x + DELANTE, y: pG.suelo };
    const c = Math.cos(a), s = Math.sin(a), e0 = ax * (1 - sx) - pv.x;
    return { a: c * sx, b: s * sx, c: -s, d: c, e: c * e0 + s * pv.y + pv.x, f: s * e0 - c * pv.y + pv.y, ang: a, sx };
  }
  const aplica = (M, q) => ({ x: M.a * q.x + M.c * q.y + M.e, y: M.b * q.x + M.d * q.y + M.f });
  const deMarco = (pG, q) => ({ x: pG.x + q.x, y: pG.suelo + q.y });     // marco de Guillermo → pantalla (antes de la caída)

  // punta del zapato lejano de Guillermo (donde se engancha la punta suelta de la cuerda), en pantalla
  function puntaZapatoG(t) {
    const pG = poseG(t), M = marcoG(t, pG);
    return aplica(M, deMarco(pG, PUNTA_Z));
  }
  const PUNTA_Z = { x: 50, y: -8 };

  // estado del yoyó en cada instante
  function yoyo(t, pG, pD) {
    const fD = pD._dedo, fG = pG._dedo;
    const o = { x: 0, y: 0, rot: 0, vel: 0, capa: "delante", cuerda: null, ver: true };
    // en la mano de Dari (lo dibuja su mano)
    if (t < T.dTira0 + 0.03) { o.ver = false; return o; }
    if (t < T.dTira1) {                                  // lanzado hacia el suelo
      const u = fase(t, T.dTira0 + 0.03, T.dTira1);
      const a0 = pD._agarre; o.x = lerp(a0.x, fD.x, u); o.y = lerp(a0.y, YP, Math.pow(u, 1.25)); o.rot = t * 40; o.vel = 1; o.cuerda = [fD, o]; return o;
    }
    if (t < T.dSube0) {                                  // pasea al perro hasta el zapato de Guillermo y lo «olfatea»
      const x0 = cache("x0perro", () => poseD(T.dTira1)._dedo.x);
      const u = fase(t, T.dTira1, T.perro1);
      let x = lerp(x0, X_ZAPATO, salida(u));
      const ol = fase(t, T.perro1, T.olfatea1); if (ol > 0 && ol < 1) x += 5 * Math.sin(ol * Math.PI * 5) * (1 - ol);
      o.x = x; o.y = YP - 3 * campana(t, T.perro1, T.perro1 + 0.08); o.rot = -(x - x0) / R_YO; o.vel = 0.5; o.cuerda = [fD, o]; return o;
    }
    if (t < T.dSube1) {                                  // sube por la cuerda a la mano
      const u = suave(fase(t, T.dSube0, T.dSube1 - 0.04));
      o.x = lerp(X_ZAPATO, pD._agarre.x, u); o.y = lerp(YP, pD._agarre.y, u); o.rot = t * 30; o.vel = 0.7;
      if (u >= 1) { o.ver = false; return o; }
      o.cuerda = [fD, o]; return o;
    }
    if (t < T.aw0 + 0.03) { o.ver = false; return o; }
    if (t < T.awVuelve) {                                // vuelta al mundo de Dari
      const be = betaD(t), r = Math.max(radioD(t), 4);
      o.x = fD.x + r * Math.cos(be); o.y = fD.y + r * Math.sin(be); o.rot = t * 40; o.vel = 1; o.cuerda = [fD, o];
      o.capa = Math.cos(be) > 0.02 && r > 30 ? "detrasD" : "delante"; o.estela = { c: fD, r, be, dir: 1 };
      if (t > T.awVuelve - 0.02) o.ver = false;
      return o;
    }
    if (t < T.cuna0 + 0.03) { o.ver = false; return o; }
    if (t < T.cunaVuelve) {                              // la cuna
      const k = dentro(t, T.cunaBaja, T.cunaForma, T.cuna1, T.cunaSuelta);
      const A = pD._indiceC, bm = { x: (pD._indiceL.x + pD._pulgarL.x) / 2, y: (pD._indiceL.y + pD._pulgarL.y) / 2 };
      const ab = Math.max(10, Math.abs(pD._indiceL.x - pD._pulgarL.x) / 2);             // la base abierta (al menos 20 px)
      const B1 = { x: bm.x - ab, y: bm.y + 2 }, B2 = { x: bm.x + ab, y: bm.y - 2 };
      const Ae = { x: lerp(fD.x, A.x, k), y: lerp(fD.y, A.y, k) }, B1e = { x: lerp(fD.x, B1.x, k), y: lerp(fD.y, B1.y, k) }, B2e = { x: lerp(fD.x, B2.x, k), y: lerp(fD.y, B2.y, k) };
      const baja = salida(fase(t, T.cuna0 + 0.03, T.cunaBaja)), sube = suave(fase(t, T.cunaSuelta, T.cunaVuelve - 0.02));
      const Lc = lerp(96, Math.max(40, (bm.y - A.y) * 0.86), k) * baja * (1 - sube);
      const al = 0.42 * dentro(t, T.cunaForma - 0.1, T.cunaForma + 0.1, T.cuna1 - 0.1, T.cuna1 + 0.05) * Math.sin((t - T.cunaForma) * 2 * Math.PI / 0.8);
      o.x = Ae.x + Lc * Math.sin(al); o.y = Ae.y + Lc * Math.cos(al); o.rot = t * 40; o.vel = 1;
      o.cuerda = [Ae, o];
      if (k > 0.01) o.cuna = [B1e, Ae, B2e, B1e];
      if (t > T.cunaVuelve - 0.02) o.ver = false;
      return o;
    }
    if (t < T.suelta) { o.ver = false; return o; }
    if (t < T.recibe) {                                  // Dari se lo lanza a Guillermo
      const P0 = cache("P0lanza", () => poseD(T.suelta)._agarre), P1 = cache("P1lanza", () => poseG(T.recibe)._agarre);
      const u = fase(t, T.suelta, T.recibe);
      o.x = lerp(P0.x, P1.x, u); o.y = lerp(P0.y, P1.y, u) - 74 * 4 * u * (1 - u); o.rot = -t * 14; o.vel = 0;
      o.cola = { vx: P1.x - P0.x, vy: (P1.y - P0.y) - 74 * 4 * (1 - 2 * u) };
      return o;
    }
    if (t < T.gTira0 + 0.02) { o.ver = false; return o; }
    if (t < T.gAw0) {                                    // Guillermo: dormilón
      const u = fase(t, T.gTira0 + 0.02, T.gTira1);
      const sw = 0.06 * Math.sin((t - T.gTira1) * 7) * tramo(t, T.gTira1, T.gTira1 + 0.1);
      const L = LARGO * Math.pow(u, 1.2);
      o.x = fG.x + L * Math.sin(sw); o.y = fG.y + L * Math.cos(sw); o.rot = t * 45; o.vel = 1; o.cuerda = [fG, o];
      o.duerme = tramo(t, T.gTira1, T.gTira1 + 0.1); return o;
    }
    if (t < 7.6) {                                       // vuelta al mundo con demasiada fuerza
      const be = betaG(t), r = LARGO;
      o.x = fG.x + r * Math.cos(be); o.y = fG.y + r * Math.sin(be); o.rot = t * 50; o.vel = 1; o.cuerda = [fG, o];
      o.capa = detrasG(be) ? "detrasG" : "delante"; o.estela = { c: fG, r, be, dir: -1 };
      // al final pasa por detrás de la cabeza y se engancha en el cuello
      const k = fase(t, 7.565, 7.6);
      if (k > 0) { const ob = deMarco(pG, orbita(7.6).q); o.x = lerp(o.x, ob.x, suave(k)); o.y = lerp(o.y, ob.y, suave(k)); o.capa = "detrasG"; }
      return o;
    }
    if (t < T.remate0) {                                 // se enrolla: cuello, brazos y piernas
      const ob = orbita(t), q = deMarco(pG, ob.q);
      o.x = q.x; o.y = q.y; o.rot = t * 50; o.vel = 1; o.capa = ob.delante ? "delante" : "detrasG";
      const ct = deMarco(pG, puntoBanda(ob.banda, ob.phi - 0.8, ob.rx, ob.ry));
      o.cuerda = [ct, o];
      if (t < 7.98) o.cuerdaDedo = [fG, deMarco(pG, puntoBanda(BANDAS[0], 0, BANDAS[0].rx, BANDAS[0].ry))];
      o.estelaOrb = true;
      return o;
    }
    if (t < T.remate1) {                                 // salta a la barriga: el lazo del paquete
      const ob = orbita(T.remate0), q0 = ob.q, u = suave(fase(t, T.remate0, T.remate1));
      const q = { x: lerp(q0.x, LAZO.x, u) + 30 * Math.sin(Math.PI * u), y: lerp(q0.y, LAZO.y, u) };
      const s = deMarco(pG, q); o.x = s.x; o.y = s.y; o.rot = t * 30; o.vel = 0.6;
      o.cuerda = [deMarco(pG, puntoBanda(BANDAS[7], 0, BANDAS[7].rx, BANDAS[7].ry)), o];
      return o;
    }
    if (t < T.salta) { o.capa = "marco"; o.rot = 0.5; return o; }   // en la barriga (lo pinta el marco de Guillermo)
    if (t < T.caza) {                                    // sale disparado y vuelve a la mano de Dari
      const P0 = cache("P0salta", () => { const pg = poseG(T.salta); return aplica(marcoG(T.salta, pg), deMarco(pg, LAZO)); });
      const P1 = pD._agarre, u = fase(t, T.salta, T.caza), Cc = { x: (P0.x + P1.x) / 2 - 10, y: Math.min(P0.y, P1.y) - 150 };
      const a = { x: lerp(P0.x, Cc.x, u), y: lerp(P0.y, Cc.y, u) }, b = { x: lerp(Cc.x, P1.x, u), y: lerp(Cc.y, P1.y, u) };
      o.x = lerp(a.x, b.x, u); o.y = lerp(a.y, b.y, u); o.rot = t * 40; o.vel = 1;
      o.curva = { de: fD, ctrl: b, a: { x: o.x, y: o.y } };
      if (u > 0.97) o.ver = false;
      return o;
    }
    o.ver = false; return o;
  }
  // tramo de la vuelta al mundo de Guillermo que pasa por detrás de él
  function detrasG(be) { const a = ((be % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); return a > Math.PI * 0.55 && a < Math.PI * 1.6; }

  /* ---------- dibujo del yoyó y de la cuerda ---------- */
  function dibYoyo(g, x, y, rot, vel) {
    const r = R_YO;
    g.save(); g.translate(x, y); g.lineJoin = "round";
    g.fillStyle = "#d8262e"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = "#ff8a7a"; g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, r - 3, -2.5, -1.0); g.stroke();
    if (vel < 0.95) { g.save(); g.rotate(rot); g.globalAlpha = 1 - vel; g.fillStyle = "#fff1d6";
      g.beginPath(); g.moveTo(1.5, -1.6); g.lineTo(r - 2.4, -2.4); g.lineTo(r - 2.4, 2.4); g.lineTo(1.5, 1.6); g.closePath(); g.fill(); g.restore(); }
    if (vel > 0.05) { g.save(); g.globalAlpha = 0.8 * vel; g.strokeStyle = "#ffd8cc"; g.lineWidth = 1.4;
      g.beginPath(); g.arc(0, 0, r * 0.6, rot, rot + 2.1); g.stroke(); g.beginPath(); g.arc(0, 0, r * 0.6, rot + Math.PI, rot + Math.PI + 2.1); g.stroke(); g.restore(); }
    g.fillStyle = "#f6efe0"; g.beginPath(); g.arc(0, 0, 2.6, 0, Math.PI * 2); g.fill(); g.lineWidth = 1; g.strokeStyle = TINTA; g.stroke();
    g.restore();
  }
  function trazo(g, f) {
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    f(); g.strokeStyle = "rgba(24,10,26,0.55)"; g.lineWidth = 2.9; g.stroke();
    f(); g.strokeStyle = "#fbf5e6"; g.lineWidth = 1.35; g.stroke();
    g.restore();
  }
  const linea2 = (g, pts) => () => { g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); };
  function dibCuerdaYoyo(g, t, o) {
    if (o.cuerda) trazo(g, linea2(g, o.cuerda));
    if (o.cuerdaDedo) trazo(g, linea2(g, o.cuerdaDedo));
    if (o.cuna) trazo(g, linea2(g, o.cuna));
    if (o.curva) trazo(g, () => { g.beginPath(); g.moveTo(o.curva.a.x, o.curva.a.y); g.quadraticCurveTo(o.curva.ctrl.x, o.curva.ctrl.y, o.curva.de.x, o.curva.de.y); });
    if (o.cola) {                                        // la cuerda suelta ondea detrás del yoyó en el aire
      const l = Math.hypot(o.cola.vx, o.cola.vy) || 1, ux = -o.cola.vx / l, uy = -o.cola.vy / l, pts = [];
      for (let i = 0; i <= 8; i++) { const s = i * 4.2, w = 4 * Math.sin(t * 26 - i * 0.9) * (i / 8); pts.push({ x: o.x + ux * s - uy * w, y: o.y + uy * s + ux * w + i * i * 0.12 }); }
      trazo(g, linea2(g, pts));
    }
    if (o.estela) estela(g, o.estela);
    if (o.ver) dibYoyo(g, o.x, o.y, o.rot, o.vel);
    if (o.duerme > 0) zumbido(g, t, o);
  }
  // rastro de la vuelta al mundo
  function estela(g, e) {
    if (e.r < 40) return;
    g.save(); g.lineCap = "round"; g.strokeStyle = "#ffffff";
    for (let i = 0; i < 4; i++) { const a0 = e.be - e.dir * (0.25 + i * 0.22), a1 = e.be - e.dir * (0.08 + i * 0.22);
      g.globalAlpha = 0.5 * (1 - i / 4); g.lineWidth = 3 - i * 0.5;
      g.beginPath(); g.arc(e.c.x, e.c.y, e.r, Math.min(a0, a1), Math.max(a0, a1)); g.stroke(); }
    g.restore();
  }
  // el yoyó dormido zumba
  function zumbido(g, t, o) {
    g.save(); g.strokeStyle = "#ffffff"; g.lineCap = "round"; g.globalAlpha = 0.7 * o.duerme; g.lineWidth = 1.6;
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const r = 14 + i * 5 + 1.5 * Math.sin(t * 30 + i);
      g.beginPath(); g.arc(o.x, o.y, r, s > 0 ? -0.5 : Math.PI - 0.5, s > 0 ? 0.5 : Math.PI + 0.5); g.stroke(); }
    g.restore();
  }

  /* ---------- vueltas de cuerda sobre Guillermo (en su marco) ---------- */
  function dibBandas(g, t, pG) {
    const nb = nBandas(t);
    const banda = (b, th0, th1) => trazo(g, () => { g.beginPath();
      for (let i = 0; i <= 14; i++) { const th = lerp(th0, th1, i / 14), q = deMarco(pG, puntoBanda(b, th, b.rx, b.ry)); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); } });
    for (let i = 0; i < nb.n; i++) banda(BANDAS[i], 0, Math.PI);
    if (nb.parcial >= 0 && nb.frac > 0) banda(BANDAS[nb.parcial], 0, Math.PI * nb.frac);
    // la punta suelta, enganchada en la punta del zapato
    if (t >= T.remate0 && t < T.pinza) {
      const b = BANDAS[7], a = deMarco(pG, puntoBanda(b, 0.15, b.rx, b.ry)), z = deMarco(pG, PUNTA_Z);
      trazo(g, () => { g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo(a.x + 10, (a.y + z.y) / 2 + 6, z.x, z.y); });
      trazo(g, () => { g.beginPath(); g.ellipse(z.x + 2, z.y - 1, 4.5, 3, 0.4, 0, Math.PI * 2); });
    }
    // el yoyó en la barriga
    if (t >= T.remate1 && t < T.salta) { const q = deMarco(pG, LAZO); dibYoyo(g, q.x, q.y, 0.5, 0); }
  }
  // la cuerda de Dari hasta Guillermo mientras tira (de la punta del zapato a la banda que se desenrolla)
  function cuerdaTiron(g, t, pG, pD, M) {
    if (t < T.pinza || t >= T.salta) return;
    const nb = nBandas(t), i = Math.max(0, nb.n - 1), b = BANDAS[i];
    const a = aplica(M, deMarco(pG, puntoBanda(b, 0.1, b.rx, b.ry))), f = pD._dedo;
    const floja = t < T.tiron0 ? 0.4 : t < T.tiron1 + 0.03 ? 0 : tramo(t, T.tiron1, T.tiron1 + 0.3);
    let cy = (a.y + f.y) / 2 + 70 * floja;
    cy = Math.min(cy, 2 * (SUELO - 3) - (a.y + f.y) / 2);
    trazo(g, () => { g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo((a.x + f.x) / 2, cy, f.x, f.y); });
  }

  /* ================= efectos ================= */
  function lineasPeonza(g, t, pG) {
    const k = dentro(t, T.gira0 + 0.05, T.gira0 + 0.2, 12.8, T.gira1); if (k <= 0.01) return;
    const up = tramo(t, T.levanta0, T.levanta1);
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.8 * k * up})`; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < 4; i++) { const y = pG.suelo - 60 - i * 92, r = 66 + 8 * i, a0 = t * 17 + i * 1.3;
      g.beginPath(); g.ellipse(pG.x + 10, y, r, 12, 0, a0, a0 + 2.4); g.stroke(); }
    g.restore();
  }
  // polvo al caer: nubecitas que salen de debajo del cuerpo hacia los lados y se deshacen
  function polvo(g, t, x0, x1) {
    const k = fase(t, T.cae1 - 0.02, T.cae1 + 0.6); if (k <= 0 || k >= 1) return;
    g.save(); g.fillStyle = "#f4dcc2";
    for (let i = 0; i < 8; i++) {
      const s = i < 4 ? -1 : 1, j = i % 4, kk = salida(k);
      const xx = (s < 0 ? x0 + 40 : x1 - 30) + s * (18 + 26 * j) * kk, yy = SUELO - 4 - (8 + 10 * j) * kk;
      const r = (6 + 4 * j) * (0.5 + 0.8 * kk);
      g.globalAlpha = 0.55 * Math.pow(1 - k, 1.4);
      g.beginPath(); g.arc(xx, yy, r, 0, Math.PI * 2); g.arc(xx + r * 0.8, yy + 2, r * 0.7, 0, Math.PI * 2); g.arc(xx - r * 0.7, yy + 3, r * 0.6, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  function estrellita(g, x, y, r, a) {
    g.save(); g.translate(x, y); g.rotate(a); g.beginPath();
    for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r, an = i * Math.PI / 5 - Math.PI / 2; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
    g.closePath(); g.fillStyle = "#ffe35a"; g.fill(); g.lineWidth = 1.6; g.strokeStyle = TINTA; g.stroke(); g.restore();
  }
  function estrellasMareo(g, t, pG) {
    const k = tramo(t, 13.1, 13.3); if (k <= 0.01) return;
    const c = G.aPantalla(pG, G.cabeza(pG).a({ x: 700, y: 140 }));
    for (let i = 0; i < 4; i++) { const a = t * 4 + i * Math.PI / 2, x = c.x + 62 * Math.cos(a), y = c.y + 14 * Math.sin(a);
      g.save(); g.globalAlpha = k; estrellita(g, x, y, 8 * (0.85 + 0.15 * Math.sin(a)), t * 3 + i); g.restore(); }
  }
  // chispa al quedarse el yoyó en la barriga y al cazarlo Dari
  function chispa(g, t, t0, x, y, s) {
    const k = fase(t, t0, t0 + 0.32); if (k <= 0 || k >= 1) return;
    g.save(); g.strokeStyle = "#fff4cf"; g.lineCap = "round"; g.lineWidth = 2.2; g.globalAlpha = 1 - k;
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.3, r0 = s * (0.6 + 0.6 * salida(k)), r1 = r0 + s * 0.5;
      g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // rayitas de prisa alrededor del yoyó enrollándose
  function latigo(g, t, o) {
    if (!o.estelaOrb) return;
    g.save(); g.strokeStyle = "#ffffff"; g.lineCap = "round"; g.globalAlpha = 0.6; g.lineWidth = 2;
    g.beginPath(); g.moveTo(o.x + 12, o.y - 10); g.lineTo(o.x + 26, o.y - 14); g.moveTo(o.x + 12, o.y + 2); g.lineTo(o.x + 28, o.y + 1); g.stroke();
    g.restore();
  }
  function gotas(g, t, pG) {
    const k = pG.sudor || 0; if (k <= 0.05) return;
    const c = G.aPantalla(pG, G.cabeza(pG).a({ x: 520, y: 300 }));
    g.save(); g.globalAlpha = k;
    for (let i = 0; i < 2; i++) { const ph = ((t * 1.6 + i * 0.5) % 1), x = c.x - 16 - 18 * i, y = c.y + 30 * ph;
      g.fillStyle = "#bfe6ff"; g.strokeStyle = TINTA; g.lineWidth = 1.3;
      g.beginPath(); g.moveTo(x, y - 7); g.quadraticCurveTo(x + 5, y, x, y + 4); g.quadraticCurveTo(x - 5, y, x, y - 7); g.fill(); g.stroke(); }
    g.restore();
  }

  /* ================= escena ================= */
  const pose = t => ({ g: poseG(t), d: poseD(t) });
  const CAM = [[0, 1.02, 512, 300], [0.6, 1.02, 512, 300], [1.0, 1.14, 560, 330], [1.85, 1.14, 560, 330], [2.25, 1.04, 560, 296],
    [3.0, 1.04, 560, 296], [3.4, 1.5, 678, 290], [4.35, 1.5, 678, 290], [4.75, 1.12, 560, 300], [5.4, 1.12, 540, 300],
    [5.8, 1.32, 468, 300], [6.55, 1.32, 468, 300], [6.95, 1.12, 480, 294], [7.55, 1.12, 470, 294], [7.85, 1.3, 430, 300],
    [9.0, 1.3, 430, 300], [9.45, 1.0, 480, 300], [12.5, 1.0, 480, 300], [12.95, 1.1, 580, 300], [13.4, 1.24, 612, 292], [DUR, 1.24, 612, 292]];
  function camara(t) {
    let i = 0; while (i < CAM.length - 2 && t > CAM[i + 1][0]) i++;
    const a = CAM[i], b = CAM[i + 1], k = suave(fase(t, a[0], b[0]));
    const kk = lerp(a[1], b[1], k), x = lerp(a[2], b[2], k), y = lerp(a[3], b[3], k);
    const mx = W / 2 / kk, my = H / 2 / kk;
    return { k: kk, x: clamp(x, mx - 40, W + 40 - mx), y: clamp(y, my - 60, H + 60 - my) };
  }
  function sombras(g, t, pG, pD, M) {
    g.save(); g.fillStyle = "rgba(40,10,20,0.32)";
    const tumb = clamp(Math.abs(M.ang) / (Math.PI / 2));
    const piv = pG.x - ATRAS, xc = lerp(pG.x + 4, piv - 230, tumb), rx = lerp(62, 250, tumb) * (0.6 + 0.4 * Math.abs(M.sx));
    const alto = clamp(1 - (SUELO - pG.suelo) / 60);
    g.beginPath(); g.ellipse(xc, SUELO + 2, rx * (0.7 + 0.3 * alto), 7, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(pD.x - 4, SUELO + 2, 62, 7, 0, 0, Math.PI * 2); g.fill();
    // sombra del yoyó paseando
    g.restore();
  }

  class GuillermoDariYoyo extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Da.listo()) return;
      if (!fondo) fondo = creaFondo();
      const pG = poseG(t), pD = poseD(t), M = marcoG(t, pG), o = yoyo(t, pG, pD);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      MATRIZ = g.getTransform();
      g.drawImage(fondo, -40, -60);
      sombras(g, t, pG, pD, M);
      if (o.capa === "detrasD") dibCuerdaYoyo(g, t, o);
      Da.dibujar(g, pD, t);
      if (pD._tiene) dibYoyo(g, pD._agarre.x, pD._agarre.y, 0.3, 0);
      if (o.capa === "detrasG") dibCuerdaYoyo(g, t, o);
      g.save(); g.transform(M.a, M.b, M.c, M.d, M.e, M.f);
      G.dibujar(g, pG, t);
      dibBandas(g, t, pG);
      g.restore();
      if (pG._tiene) dibYoyo(g, pG._agarre.x, pG._agarre.y, 0.6, 0);
      cuerdaTiron(g, t, pG, pD, M);
      if (o.capa === "delante") { dibCuerdaYoyo(g, t, o); latigo(g, t, o); }
      lineasPeonza(g, t, pG);
      polvo(g, t, pG.x - ATRAS - 440, pG.x - ATRAS);
      gotas(g, t, pG);
      estrellasMareo(g, t, pG);
      const lz = aplica(M, deMarco(pG, LAZO)); chispa(g, t, T.remate1 - 0.02, lz.x, lz.y, 14);
      chispa(g, t, T.caza, pD._palma.x, pD._palma.y, 13);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00060", nombre: "Guillermo y Dari · El yoyó", crear: () => new GuillermoDariYoyo() });
  window.__A2D_00060 = { pose, poseG, poseD, yoyo, camara, T, DUR };
})();
