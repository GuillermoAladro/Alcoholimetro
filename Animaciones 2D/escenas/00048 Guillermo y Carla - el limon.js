"use strict";
/* 00048 · Guillermo y Carla · El limón
 *
 * Negro → terraza encalada junto al mar, con un limonero en una maceta, contraventana azul con
 * geranios y una guirnalda de bombillas. Entre Guillermo y Carla, una mesita alta con un plato con
 * dos gajos de limón y un azucarero → Guillermo mira el plato y luego a cámara, muy chulo; Carla
 * levanta una ceja → Carla coge su gajo, le da un mordisco sin pestañear y lo mastica con elegancia
 * mirándole; Guillermo, que esperaba una mueca, se queda pasmado → Carla deja la cáscara y le cede
 * el turno → Guillermo resopla, coge el suyo, se lo enseña a cámara con un guiño y le pega un buen
 * bocado; mastica sobrado… → ¡el ácido!: se le arruga toda la cara (ojos apretados, morritos,
 * mofletes chupados, cabeza estrujada), se le pone el pelo de punta, se le cae la cáscara y tiembla
 * de la cabeza a los pies → Carla se ríe, coge un terrón de azúcar y se lo ofrece → Guillermo abre un
 * ojo, lo coge con la mano temblando y se lo mete en la boca → crac: se le va desarrugando la cara y
 * se le baja el pelo → un último escalofrío; Carla se ríe y guiña un ojo; él sonríe con el pulgar
 * arriba → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, rebote, tramo, campana, ruido, hash } = M2;
  const G = Guillermo, Ca = Carla;
  const S = 0.31, SUELO = 560;
  const XG = 410, XC = 605;                     // pelvis de Guillermo y de Carla (ella mira a la izquierda)
  const MESA = { x: 500, y: 336, w: 116 };      // canto de arriba del tablero
  const PLATO = { x: 494, y: 334 };
  const GAJO_G = { x: 481, y: 329 }, GAJO_C = { x: 507, y: 329 };   // gajos en el plato (centro de la cuerda)
  const AZUC = { x: 538, y: 336 };              // azucarero
  const TERRON = { x: 538, y: 316 };            // terrón de arriba del azucarero
  const HP = { x: 488, y: 289 };                // donde se pasan el terrón
  const DUR = 13.5;
  const T = {
    plato: 0.45, camara: 0.85, reto: 1.0,
    cSale: 1.1, cSobre: 1.45, cToma: 1.6, cBoca: 2.05, cMuerde: 2.12, cMastica: [2.2, 2.95], cBaja: 2.95, cDeja: 3.35, cReposo: 3.75,
    espera: 2.05, extrana: 2.55, turno: 3.4, bufa: 3.55,
    gSale: 3.75, gSobre: 4.05, gToma: 4.2, muestra: 4.55, guino: 4.6, gBoca: 5.05, gMuerde: 5.15, gBaja: 5.5, gMastica: [5.25, 5.75],
    acido: 5.8, suelta: 5.95,
    risa: 6.2, risa1: 7.0,
    cAzucar: 7.15, cSobreA: 7.45, cPinza: 7.55, cOfrece: 8.25,
    unOjo: 8.35, gAlcanza: 8.5, toma: 9.35, aBoca: 9.8, crac: 9.95, alivio: 10.15, alivio1: 10.8, suspiro: 10.5,
    escalofrio: 11.2, escalofrio1: 11.65, cRie: 11.35, pulgar: 11.9, cGuino: 12.1, fin: 12.6
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
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const memo = new Map();
  const cache = (k, f) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };
  const TINTA = "#0b0a0e";
  let MATRIZ = null;                                  // matriz de la cámara (para dibujar objetos en pantalla desde la mano)

  /* Pistas de una mano: [t0, t1, objetivo, curva]. El objetivo se resuelve en cada fotograma a la hoja del
   * personaje (puede ser un punto de pantalla, relativo al hombro, o el bolsillo), y se mezcla con suavidad. */
  function pista(lista, t, resuelve) {
    let c = resuelve(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)), d = resuelve(obj);
      c = { x: lerp(c.x, d.x, k), y: lerp(c.y, d.y, k), mu: lerp(c.mu, d.mu, k), ang: lerp(c.ang, d.ang, k), puno: lerp(c.puno, d.puno, k),
        dedos: DD(c.dedos, d.dedos, k), off: { x: lerp(c.off.x, d.off.x, k), y: lerp(c.off.y, d.off.y, k) }, rot: lerp(c.rot, d.rot, k) };
    }
    return c;
  }

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

  /* ================= decorado: terraza encalada junto al mar ================= */
  let fondo = null;
  const HORIZONTE = 300, PRETIL = 352, YSUELO0 = 468;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60); g.lineJoin = "round"; g.lineCap = "round";
    // cielo de mediodía
    const cielo = g.createLinearGradient(0, -60, 0, HORIZONTE); cielo.addColorStop(0, "#3d9be0"); cielo.addColorStop(0.7, "#8fd0f3"); cielo.addColorStop(1, "#d6f1fb");
    g.fillStyle = cielo; g.fillRect(-40, -60, W + 80, HORIZONTE + 60);
    // sol arriba a la derecha con halo
    const halo = g.createRadialGradient(905, 40, 10, 905, 40, 190); halo.addColorStop(0, "rgba(255,250,215,0.95)"); halo.addColorStop(0.25, "rgba(255,244,190,0.45)"); halo.addColorStop(1, "rgba(255,240,180,0)");
    g.fillStyle = halo; g.beginPath(); g.arc(905, 40, 190, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fffbe6"; g.beginPath(); g.arc(905, 40, 30, 0, Math.PI * 2); g.fill();
    // nubes
    for (const [x, y, k] of [[150, 46, 1], [420, 92, 0.75], [690, 30, 0.9], [1010, 132, 0.6]]) nube(g, x, y, k);
    // mar con brillos
    const mar = g.createLinearGradient(0, HORIZONTE, 0, PRETIL); mar.addColorStop(0, "#1f6fb4"); mar.addColorStop(1, "#3c9fd6");
    g.fillStyle = mar; g.fillRect(-40, HORIZONTE, W + 80, PRETIL - HORIZONTE);
    g.fillStyle = "rgba(255,255,255,0.55)"; g.fillRect(-40, HORIZONTE, W + 80, 1.5);
    g.strokeStyle = "rgba(255,255,255,0.6)"; g.lineWidth = 2;
    for (let i = 0; i < 26; i++) { const x = hash(i + 11) * (W + 60) - 20, y = HORIZONTE + 6 + hash(i + 12) * (PRETIL - HORIZONTE - 10), l = 6 + 14 * hash(i + 13);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y); g.stroke(); }
    // velero lejano y gaviotas
    g.fillStyle = "#f7f3e8"; g.strokeStyle = "#20304a"; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(760, 294); g.lineTo(760, 262); g.lineTo(780, 292); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#c0392b"; g.beginPath(); g.moveTo(748, 294); g.lineTo(786, 294); g.lineTo(780, 300); g.lineTo(752, 300); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "#2a3a50"; g.lineWidth = 2;
    for (const [x, y, k] of [[300, 150, 1], [330, 170, 0.8], [640, 120, 0.9]]) { g.beginPath(); g.moveTo(x - 9 * k, y); g.quadraticCurveTo(x - 4 * k, y - 6 * k, x, y); g.quadraticCurveTo(x + 4 * k, y - 6 * k, x + 9 * k, y); g.stroke(); }
    // pretil encalado con remate de azulejo azul
    g.fillStyle = "#f6f1e6"; g.fillRect(-40, PRETIL, W + 80, YSUELO0 - PRETIL);
    const somb = g.createLinearGradient(0, PRETIL, 0, YSUELO0); somb.addColorStop(0, "rgba(120,140,170,0)"); somb.addColorStop(1, "rgba(120,140,170,0.25)");
    g.fillStyle = somb; g.fillRect(-40, PRETIL, W + 80, YSUELO0 - PRETIL);
    g.fillStyle = "#2c65b0"; g.fillRect(-40, PRETIL - 10, W + 80, 12);
    for (let x = -40; x < W + 40; x += 24) { g.fillStyle = (x / 24) % 2 ? "#f1f6ff" : "#bcd3f2"; g.beginPath(); g.arc(x + 12, PRETIL - 4, 3.2, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = "#14325a"; g.lineWidth = 2; g.beginPath(); g.moveTo(-40, PRETIL - 10); g.lineTo(W + 40, PRETIL - 10); g.moveTo(-40, PRETIL + 2); g.lineTo(W + 40, PRETIL + 2); g.stroke();
    // zócalo de azulejos amarillos y blancos
    const yz = YSUELO0 - 34;
    for (let x = -40, i = 0; x < W + 40; x += 22, i++) {
      g.fillStyle = i % 2 ? "#f7d94a" : "#fdfaf0"; g.fillRect(x, yz, 22, 34);
      g.strokeStyle = "rgba(160,120,20,0.6)"; g.lineWidth = 1; g.strokeRect(x, yz, 22, 34);
      if (i % 2 === 0) { g.fillStyle = "#3c7ac0"; g.beginPath(); g.arc(x + 11, yz + 17, 4, 0, Math.PI * 2); g.fill(); }
    }
    g.fillStyle = "#c9a84a"; g.fillRect(-40, yz - 3, W + 80, 3);
    // muro encalado a la derecha con contraventana azul y geranios
    g.fillStyle = "#fbf7ee"; g.beginPath(); g.moveTo(820, -60); g.lineTo(W + 40, -60); g.lineTo(W + 40, YSUELO0); g.lineTo(820, YSUELO0); g.closePath(); g.fill();
    g.fillStyle = "rgba(150,165,195,0.28)"; g.fillRect(820, -60, 14, YSUELO0 + 60);
    g.strokeStyle = "#c9c2b0"; g.lineWidth = 2; g.beginPath(); g.moveTo(820, -60); g.lineTo(820, YSUELO0); g.stroke();
    ventana(g, 900, 150);
    // limonero en una maceta de barro a la izquierda
    limonero(g, 120, YSUELO0 + 4);
    // guirnalda de bombillas entre el muro y un poste
    g.strokeStyle = "#3a2a1c"; g.lineWidth = 4; g.beginPath(); g.moveTo(14, -60); g.lineTo(14, YSUELO0 - 30); g.stroke();
    g.lineWidth = 1.6; g.beginPath(); g.moveTo(14, 20); g.quadraticCurveTo(420, 92, 822, 30); g.stroke();
    for (let i = 1; i < 12; i++) {
      const u = i / 12, x = (1 - u) * (1 - u) * 14 + 2 * (1 - u) * u * 420 + u * u * 822, y = (1 - u) * (1 - u) * 20 + 2 * (1 - u) * u * 92 + u * u * 30;
      g.strokeStyle = "#3a2a1c"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 7); g.stroke();
      g.fillStyle = "#fff4c2"; g.strokeStyle = "#5a4a20"; g.beginPath(); g.ellipse(x, y + 12, 4.5, 6, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    // suelo de barro cocido en perspectiva
    const fs = g.createLinearGradient(0, YSUELO0, 0, H + 60); fs.addColorStop(0, "#c8703f"); fs.addColorStop(1, "#9c4e28");
    g.fillStyle = fs; g.fillRect(-40, YSUELO0, W + 80, H + 60 - YSUELO0);
    g.strokeStyle = "rgba(80,30,10,0.35)"; g.lineWidth = 1.6;
    for (let i = 0; i < 6; i++) { const y = YSUELO0 + (H + 60 - YSUELO0) * (Math.pow(1.7, i) - 1) / (Math.pow(1.7, 6) - 1); g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); }
    for (let j = -12; j <= 12; j++) { g.beginPath(); g.moveTo(512 + j * 46, YSUELO0); g.lineTo(512 + j * 110, H + 60); g.stroke(); }
    g.fillStyle = "rgba(255,220,180,0.18)"; g.fillRect(-40, YSUELO0, W + 80, 3);
    // mesita alta: tablero de mosaico azul y blanco y pie de hierro
    mesa(g);
    // azucarero (los terrones de encima se dibujan aparte)
    azucarero(g);
    // viñeta suave y luz cálida
    const vi = g.createRadialGradient(512, 300, 320, 512, 300, 740); vi.addColorStop(0, "rgba(0,0,0,0)"); vi.addColorStop(1, "rgba(20,30,60,0.35)");
    g.fillStyle = vi; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }
  function nube(g, x, y, k) {
    g.save(); g.fillStyle = "rgba(255,255,255,0.92)";
    for (const [dx, dy, r] of [[-30, 6, 18], [-10, -4, 24], [16, 0, 20], [36, 8, 14], [0, 10, 18]]) { g.beginPath(); g.arc(x + dx * k, y + dy * k, r * k, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  function ventana(g, x, y) {
    g.save(); g.lineJoin = "round";
    g.fillStyle = "#1d2a40"; g.fillRect(x - 46, y - 64, 92, 128);
    for (const s of [-1, 1]) {                                    // dos hojas de contraventana abiertas
      const x0 = x + s * 46, x1 = x + s * 92;
      g.fillStyle = "#2f74c4"; g.strokeStyle = "#0f2846"; g.lineWidth = 2.5;
      g.beginPath(); g.rect(Math.min(x0, x1), y - 64, 46, 128); g.fill(); g.stroke();
      g.strokeStyle = "rgba(10,30,60,0.55)"; g.lineWidth = 2;
      for (let k = 0; k < 10; k++) { const yy = y - 54 + k * 11.5; g.beginPath(); g.moveTo(Math.min(x0, x1) + 5, yy); g.lineTo(Math.max(x0, x1) - 5, yy); g.stroke(); }
    }
    g.strokeStyle = "#0f2846"; g.lineWidth = 3; g.strokeRect(x - 46, y - 64, 92, 128);
    // alféizar y maceta de geranios
    g.fillStyle = "#e8e1d0"; g.fillRect(x - 56, y + 64, 112, 9); g.strokeRect(x - 56, y + 64, 112, 9);
    g.fillStyle = "#c0612e"; g.strokeStyle = "#4a1e08"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x - 40, y + 64); g.lineTo(x + 40, y + 64); g.lineTo(x + 34, y + 40); g.lineTo(x - 34, y + 40); g.closePath(); g.fill(); g.stroke();
    for (let i = 0; i < 9; i++) {
      const fx = x - 34 + i * 8.5, fy = y + 30 - 10 * hash(i + 4);
      g.fillStyle = "#3f8a34"; g.beginPath(); g.ellipse(fx, fy + 10, 6, 4, hash(i) - 0.5, 0, Math.PI * 2); g.fill();
      if (i % 2 === 0) { g.fillStyle = "#e22a3c"; g.strokeStyle = "#5a0610"; g.lineWidth = 1.2; g.beginPath(); g.arc(fx, fy, 5.5, 0, Math.PI * 2); g.fill(); g.stroke(); }
    }
    g.restore();
  }
  function limonero(g, x, y) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.fillStyle = "rgba(60,20,0,0.25)"; g.beginPath(); g.ellipse(x, y + 4, 60, 9, 0, 0, Math.PI * 2); g.fill();
    // tronco
    g.strokeStyle = "#3a230f"; g.lineWidth = 12; g.beginPath(); g.moveTo(x, y - 60); g.quadraticCurveTo(x - 10, y - 140, x + 4, y - 210); g.stroke();
    g.strokeStyle = "#6b4423"; g.lineWidth = 7; g.stroke();
    // copa: masas de hojas
    for (const [dx, dy, r, col] of [[-50, -250, 52, "#2f6e2a"], [40, -262, 56, "#2f6e2a"], [0, -300, 58, "#3a8a33"], [-62, -300, 40, "#3a8a33"], [62, -310, 42, "#3a8a33"], [-6, -238, 44, "#448f3a"]]) {
      g.fillStyle = col; g.strokeStyle = "#163a14"; g.lineWidth = 3;
      g.beginPath(); g.arc(x + dx, y + dy, r, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    // brillos de hojas
    g.fillStyle = "rgba(170,220,120,0.5)";
    for (let i = 0; i < 18; i++) { const a = hash(i + 40) * Math.PI * 2, r = 20 + 60 * hash(i + 41);
      g.beginPath(); g.ellipse(x + Math.cos(a) * r, y - 280 + Math.sin(a) * r * 0.6, 7, 3.5, a, 0, Math.PI * 2); g.fill(); }
    // limones
    for (let i = 0; i < 9; i++) {
      const a = hash(i + 60) * Math.PI * 2, r = 30 + 50 * hash(i + 61), lx = x + Math.cos(a) * r, ly = y - 278 + Math.sin(a) * r * 0.65;
      g.fillStyle = "#f7d728"; g.strokeStyle = "#6a5208"; g.lineWidth = 2;
      g.beginPath(); g.ellipse(lx, ly, 10, 7.5, a, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,220,0.8)"; g.beginPath(); g.ellipse(lx - 3, ly - 2, 3, 1.8, a, 0, Math.PI * 2); g.fill();
    }
    // maceta de barro
    g.fillStyle = "#c46a35"; g.strokeStyle = "#4a1e08"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(x - 50, y - 70); g.lineTo(x + 50, y - 70); g.lineTo(x + 38, y); g.lineTo(x - 38, y); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#d9824c"; g.fillRect(x - 56, y - 82, 112, 14); g.strokeRect(x - 56, y - 82, 112, 14);
    g.fillStyle = "rgba(255,210,170,0.45)"; g.fillRect(x - 40, y - 64, 8, 56);
    g.restore();
  }
  function mesa(g) {
    const { x, y, w } = MESA;
    g.save(); g.lineJoin = "round";
    g.fillStyle = "rgba(60,20,0,0.3)"; g.beginPath(); g.ellipse(x, SUELO + 2, 46, 6, 0, 0, Math.PI * 2); g.fill();
    // pie de hierro con base de tres patas
    g.strokeStyle = TINTA; g.lineWidth = 9; g.lineCap = "round";
    g.beginPath(); g.moveTo(x, y + 10); g.lineTo(x, SUELO - 14); g.stroke();
    g.strokeStyle = "#2b2b33"; g.lineWidth = 5; g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 7;
    g.beginPath(); g.moveTo(x - 38, SUELO - 2); g.quadraticCurveTo(x - 10, SUELO - 6, x, SUELO - 22); g.quadraticCurveTo(x + 10, SUELO - 6, x + 38, SUELO - 2); g.stroke();
    g.strokeStyle = "#2b2b33"; g.lineWidth = 3.5; g.stroke();
    // anilla a media altura
    g.strokeStyle = "#2b2b33"; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y + 120, 16, 4, 0, 0, Math.PI * 2); g.stroke();
    // tablero: canto de mosaico azul y blanco
    g.fillStyle = "#f4f0e6"; g.fillRect(x - w / 2, y, w, 11);
    for (let i = 0; i < 10; i++) { g.fillStyle = ["#2c65b0", "#7fb0e6", "#f4f0e6"][i % 3]; g.fillRect(x - w / 2 + 3.5 + i * 11.1, y + 2, 9, 7); }
    g.strokeStyle = TINTA; g.lineWidth = 2.2; g.strokeRect(x - w / 2, y, w, 11);
    g.fillStyle = "rgba(255,255,255,0.7)"; g.fillRect(x - w / 2 + 2, y + 1, w - 4, 1.5);
    // plato blanco
    g.fillStyle = "#fbfbf8"; g.strokeStyle = TINTA; g.lineWidth = 1.8;
    g.beginPath(); g.ellipse(PLATO.x, PLATO.y, 27, 4.5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = "rgba(60,100,170,0.6)"; g.lineWidth = 1.2; g.beginPath(); g.ellipse(PLATO.x, PLATO.y - 0.5, 20, 2.8, 0, 0, Math.PI * 2); g.stroke();
    g.restore();
  }
  function azucarero(g) {
    const { x, y } = AZUC;
    g.save(); g.lineJoin = "round";
    g.fillStyle = "#2c65b0"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x - 13, y - 14); g.lineTo(x + 13, y - 14); g.quadraticCurveTo(x + 13, y, x + 7, y); g.lineTo(x - 7, y); g.quadraticCurveTo(x - 13, y, x - 13, y - 14); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#f4f0e6"; g.beginPath(); g.arc(x, y - 7, 3, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#1d4880"; g.beginPath(); g.ellipse(x, y - 14, 13, 3, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    // terrones de debajo (fijos)
    terron(g, x - 6, y - 17, 0.2); terron(g, x + 5, y - 18, -0.15);
    g.restore();
  }
  function terron(g, x, y, rot, k = 1) {
    if (k <= 0.01) return;
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.lineJoin = "round";
    g.fillStyle = "#ffffff"; g.strokeStyle = TINTA; g.lineWidth = 1.5;
    g.beginPath(); g.rect(-6.5, -6.5, 13, 13); g.fill(); g.stroke();
    g.fillStyle = "#dfe6ee"; g.beginPath(); g.moveTo(6.5, -6.5); g.lineTo(6.5, 6.5); g.lineTo(-6.5, 6.5); g.lineTo(1.5, 1.5); g.closePath(); g.fill();
    g.fillStyle = "rgba(170,180,200,0.8)"; for (const [a, b] of [[-2, -2], [2, 1], [-1, 2.5]]) g.fillRect(a, b, 1, 1);
    g.restore();
  }

  /* ================= objetos ================= */
  // Gajo de limón en píxeles de pantalla: cuerda (la cara cortada) sobre y = 0 de −13 a 13, cáscara hacia +y.
  // m: mordido (0 entero, 1 solo la cáscara con mordiscos).
  function gajo(g, x, y, rot, m) {
    g.save(); g.translate(x, y); g.rotate(rot); g.lineJoin = "round"; g.lineCap = "round";
    const L = 13.5, P = 10, Li = L - 2.4, Pi = P - 2.4;
    // lo comido: dentro de la piel blanca, por encima de yc, con marcas de dientes
    const yc = Pi * 0.86 * clamp(m), a = Math.asin(clamp(yc / Pi)), xc = Li * Math.cos(a);
    const dientes = () => { const n = 5; for (let i = 1; i <= n; i++) { const xx = -xc + 2 * xc * i / n; g.lineTo(xx - xc / n, yc - (m > 0.02 ? 2.2 : 0)); g.lineTo(xx, yc); } };
    const forma = () => {
      g.beginPath(); g.moveTo(L, 0); g.ellipse(0, 0, L, P, 0, 0, Math.PI); g.lineTo(-Li, 0);
      if (m > 0.02) { g.ellipse(0, 0, Li, Pi, 0, Math.PI, Math.PI - a, true); dientes(); g.ellipse(0, 0, Li, Pi, 0, a, 0, true); }
      g.closePath();
    };
    forma(); g.fillStyle = "#f5cf1e"; g.fill();
    g.save(); forma(); g.clip();
    g.fillStyle = "#fbf4d6"; g.beginPath(); g.ellipse(0, 0, Li, Pi, 0, 0, Math.PI); g.closePath(); g.fill();
    g.fillStyle = "#ffe35a"; g.beginPath(); g.ellipse(0, 0, L - 3.8, P - 3.8, 0, 0, Math.PI); g.closePath(); g.fill();
    g.strokeStyle = "rgba(255,250,225,0.95)"; g.lineWidth = 1;
    for (let i = 1; i < 5; i++) { const an = Math.PI * i / 5; g.beginPath(); g.moveTo(0, 0.5); g.lineTo(Math.cos(an) * (L - 4), Math.sin(an) * (P - 4)); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,0.8)"; g.beginPath(); g.ellipse(-4, 2.5, 2.4, 1.1, 0, 0, Math.PI * 2); g.fill();
    g.restore();
    forma(); g.strokeStyle = TINTA; g.lineWidth = 1.7; g.stroke();
    g.fillStyle = "rgba(255,255,230,0.75)"; g.beginPath(); g.ellipse(6, P - 2, 3, 1.2, -0.4, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  /* ================= Guillermo ================= */
  const CG = {
    inicio: E({ mx: 0.85, my: 0.1, sonr: 0.35, ancho: 0.95 }),
    plato: E({ mx: 0.65, my: 0.65, sonr: 0.4, ancho: 0.95, sd: 4, si: 4 }),
    chulo: E({ mx: -0.85, my: -0.1, sonr: 0.62, ancho: 0.95, sd: 12, gd: 0.12, si: -2, gi: -0.05 }),
    mira: E({ mx: 0.95, my: 0.05, sonr: 0.4, ancho: 0.95, iris: 1.05, sd: 6, si: 6 }),
    espera: E({ mx: 0.95, my: 0.05, sonr: 0.62, ancho: 1, abre: 6, sd: 18, si: 18, gd: 0.1, gi: 0.1 }),
    extrana: E({ mx: 0.95, my: 0.12, sonr: -0.15, ancho: 0.62, abre: 16, iris: 0.86, sd: 26, si: 18, gd: 0.15, gi: 0.12 }),
    bufa: E({ mx: 0.3, my: -0.9, c: 0.35, sonr: 0.25, ancho: 0.8, abre: 4, sd: 10, si: 4 }),
    coge: E({ mx: 0.7, my: 0.65, sonr: 0.5, ancho: 0.95, sd: 6, si: 6 }),
    guino: E({ mx: -0.85, my: -0.1, wi: 1, h: 0.5, sonr: 0.8, ancho: 1, sd: 10, si: -4, gd: 0.1, gi: -0.1 }),
    muerde: E({ mx: 0.6, my: 0.35, abre: 34, ancho: 0.95, sonr: 0.1, sd: 10, si: 10 }),
    mastica: E({ mx: -0.6, my: 0, c: 0.45, sonr: 0.55, ancho: 0.9, sd: 8, si: 2, gd: 0.08 }),
    alivio: E({ mx: 0, my: -0.3, c: 0.88, h: 1, sonr: 0.72, ancho: 0.95, abre: 4, rub: 0.45, sd: 12, si: 12, gd: 0.15, gi: 0.15 }),
    timido: E({ mx: -0.85, my: -0.05, sonr: 0.62, ancho: 0.95, sd: 16, si: 16, gd: 0.25, gi: 0.25, rub: 0.55 })
  };
  const ACIDO_E = E({ mx: 0, my: 0, c: 1, z: 1, sd: -14, si: -14, gd: -0.3, gi: -0.3, abre: 0, ancho: 0.2, sonr: -0.35 });
  const GUION_CG = [
    [T.plato, T.plato + 0.25, "plato"], [T.camara, T.camara + 0.22, "chulo"], [T.cSale + 0.05, T.cSale + 0.3, "mira"],
    [T.espera, T.espera + 0.2, "espera"], [T.extrana, T.extrana + 0.15, "extrana"], [T.bufa, T.bufa + 0.18, "bufa"],
    [T.gSale + 0.1, T.gSale + 0.3, "coge"], [T.guino - 0.08, T.guino + 0.08, "guino"], [T.guino + 0.35, T.guino + 0.45, "coge"],
    [T.gMuerde - 0.1, T.gMuerde, "muerde"], [T.gMuerde + 0.05, T.gMuerde + 0.2, "mastica"],
    [T.alivio, T.alivio1, "alivio"], [T.pulgar - 0.1, T.pulgar + 0.2, "timido"]
  ];
  const PARP_G = [0.3, 1.9, 3.15, 4.95, 12.45];

  // cuánto ácido tiene en la cara (0–1): estruja de golpe, aguanta y se le pasa con el azúcar; escalofrío final
  function acido(t) {
    const sube = t < T.acido ? 0 : t < T.acido + 0.1 ? salida(fase(t, T.acido, T.acido + 0.1)) * 1.12 : 1 + 0.12 * Math.exp(-(t - T.acido - 0.1) * 9);
    const baja = tramo(t, T.alivio, T.alivio1);
    const esc = 0.5 * campana(t, T.escalofrio, T.escalofrio1);
    return Math.max(sube * (1 - baja), esc);
  }
  // pelo de punta (0–1): se dispara con el ácido, tiembla y se baja despacio con un rebote
  function peloPunta(t) {
    let k = t < T.acido ? 0 : rebote(fase(t, T.acido + 0.02, T.acido + 0.2), 2.2);
    const baja = fase(t, T.alivio + 0.05, T.alivio1 + 0.1);
    k *= 1 - suave(baja) + 0.08 * Math.sin(baja * Math.PI * 3) * (1 - baja);
    return Math.max(0, k);
  }
  // temblor de todo el cuerpo (px de pantalla)
  function temblor(t) {
    const a = t < T.acido ? 0 : (3.4 * Math.exp(-(t - T.acido) * 0.9) + 1.3) * suave(fase(t, T.acido, T.acido + 0.06));
    return a * (1 - tramo(t, T.crac, T.alivio + 0.3)) + 2.6 * campana(t, T.escalofrio, T.escalofrio1);
  }
  // temblor de la mano lejana: fuerte al alcanzar el terrón, se calma justo al cogerlo
  function temblorMano(t) {
    const alcanza = 6 * tramo(t, T.gAlcanza, T.gAlcanza + 0.2) * (1 - tramo(t, T.toma - 0.35, T.toma));
    const lleva = 3 * tramo(t, T.toma, T.toma + 0.12) * (1 - tramo(t, T.aBoca - 0.1, T.aBoca + 0.1));
    return alcanza + lleva;
  }

  const P0G = { dx: 0, pel: 0, torso: 0, cab: 0 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    quieto: CuG({}),
    chulo: CuG({ torso: -0.04, cab: -0.05 }),
    inclina: CuG({ torso: 0.06, cab: 0.05 }),
    bufa: CuG({ torso: -0.06, cab: -0.1 }),
    coge: CuG({ torso: 0.08, cab: 0.06, pel: 6 }),
    muestra: CuG({ torso: -0.03, cab: -0.04 }),
    muerde: CuG({ torso: 0.03, cab: 0.03 }),
    acido: CuG({ torso: -0.07, cab: -0.06, pel: 30 }),
    alcanza: CuG({ torso: 0.05, cab: 0.02, pel: 24 }),
    alivio: CuG({ torso: -0.1, cab: -0.14, pel: 8 }),
    final: CuG({ torso: -0.03, cab: -0.03, pel: 2 })
  };
  const GUION_G = [
    [T.camara, T.camara + 0.3, "chulo"], [T.cSale + 0.1, T.cSale + 0.5, "quieto"], [T.espera, T.espera + 0.3, "inclina"],
    [T.bufa, T.bufa + 0.3, "bufa"], [T.gSale, T.gSobre, "coge"], [T.gToma + 0.05, T.muestra, "muestra"], [T.gBoca - 0.2, T.gBoca, "muerde"],
    [T.gBaja, T.gBaja + 0.25, "chulo"], [T.acido, T.acido + 0.12, "acido", salida], [T.gAlcanza, T.toma, "alcanza"],
    [T.crac, T.crac + 0.2, "acido"], [T.alivio, T.alivio1, "alivio"], [T.escalofrio1, T.escalofrio1 + 0.4, "final"]
  ];
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const PIES_G = { cerca: XG - 30, lejos: XG + 32 };

  // objetos en la mano: posición del gajo o del terrón respecto al centro del puño (px de pantalla) y giro
  const OFF = {
    nada: { off: { x: 0, y: 0 }, rot: 0 },
    pinzaPlato: { off: { x: 0, y: 8 }, rot: 0 },
    enseña: { off: { x: 1, y: -12 }, rot: 0 },
    bocaG: { off: { x: -13, y: 1 }, rot: -Math.PI / 2 },
    pecho: { off: { x: -4, y: -11 }, rot: -0.25 },
    terronG: { off: { x: 13, y: -4 }, rot: 0 },
    terronBoca: { off: { x: -12, y: -9 }, rot: 0 }
  };
  // pista de la mano lejana de Guillermo (objetivo: {pant}, {hom: rel. al hombro en la hoja}, {boca}, "bols")
  const PISTA_GL = [
    [0, 0, { bols: true }],
    [T.gSale, T.gSobre, { pant: { x: GAJO_G.x - 2, y: GAJO_G.y - 30 }, mu: -1.75, puno: 1, dedos: D(0.75, 0.75, 0.7, 0.65) }],
    [T.gSobre, T.gToma, { pant: { x: GAJO_G.x, y: GAJO_G.y - OFF.pinzaPlato.off.y }, mu: -1.75, puno: 1, dedos: D(0.38, 0.38, 0.32, 0.3), obj: "pinzaPlato" }],
    [T.gToma + 0.02, T.muestra, { hom: { x: 175, y: -130 }, mu: 1.45, puno: 1, dedos: D(0.38, 0.38, 0.32, 0.3), obj: "enseña" }],
    [T.gBoca - 0.3, T.gBoca, { boca: { x: 15, y: 2 }, mu: -2.85, puno: 1, dedos: D(0.38, 0.38, 0.32, 0.3), obj: "bocaG" }],
    [T.gMuerde + 0.08, T.gBaja, { hom: { x: 95, y: 120 }, mu: 1.25, puno: 1, dedos: D(0.38, 0.38, 0.32, 0.3), obj: "pecho" }],
    [T.acido + 0.02, T.acido + 0.2, { hom: { x: 0, y: 282 }, mu: -1.75, puno: 1, dedos: D(0, 0, 0, 0), obj: "pecho" }, salida],
    [T.gAlcanza, T.toma, { terron: true, mu: 2.4, puno: 1, dedos: D(0.42, 0.42, 0.3, 0.25), obj: "terronG" }],
    [T.toma + 0.05, T.aBoca, { boca: { x: 13, y: 8 }, mu: -2.85, puno: 1, dedos: D(0.42, 0.42, 0.3, 0.25), obj: "terronBoca" }],
    [T.aBoca + 0.12, T.alivio + 0.3, { hom: { x: 5, y: 275 }, mu: -1.75, puno: 1, dedos: D(0.6, 0.55, 0.5, 0.45) }],
    [T.pulgar - 0.05, T.pulgar + 0.3, { hom: { x: 205, y: -10 }, mu: -3.14, puno: 1, dedos: D(1, 0, 0, 0) }],
    [T.fin - 0.15, T.fin + 0.3, { hom: { x: 5, y: 275 }, mu: -1.75, puno: 1, dedos: D(0.6, 0.55, 0.5, 0.45) }]
  ];
  const PISTA_GC = [
    [0, 0, { bols: true }],
    [T.acido + 0.05, T.acido + 0.25, { hom: { x: -40, y: 235 }, mu: -1.75, puno: 1, dedos: D(0, 0, 0, 0) }, salida],
    [T.alivio + 0.1, T.alivio1, { hom: { x: -30, y: 245 }, mu: -1.75, puno: 1, dedos: D(0.6, 0.55, 0.5, 0.45) }],
    [T.escalofrio1 + 0.2, T.escalofrio1 + 0.6, { bols: true }]
  ];

  function poseG(t, conTerron = true) {
    const b = linea(GUION_G, CUER_G, "quieto", t);
    const respira = Math.sin(t * 2.2 + 0.3);
    const tb = temblor(t);
    const sx = tb * ruido(t * 38), sy = tb * 0.6 * ruido(t * 41 + 7);
    const x = XG + b.dx + sx;
    const kA = acido(t);
    const p = {
      x, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 + sy / S },
      torso: b.torso + 0.015 * tb * ruido(t * 33 + 3), torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.02 * tb * ruido(t * 36 + 11), dx: 0, dy: 26 * kA, esc: { x: 1 - 0.2 * kA, y: 1 + 0.04 * kA } },
      tirasLimpias: true, ikContinuo: true
    };
    // bufido: la cabeza va atrás; crac: sacudida
    p.cabeza.ang -= 0.08 * campana(t, T.bufa, T.bufa + 0.5);
    p.cabeza.ang += 0.07 * Math.sin((t - T.crac) * 40) * campana(t, T.crac, T.crac + 0.3);
    // pies plantados (el cuerpo tiembla, los pies no)
    for (const lado of ["cerca", "lejos"]) {
      const rod = lado === "cerca" ? 1 : -1;                     // rodillas que tiemblan hacia dentro
      p.piernas[lado] = { tob: { x: G.PELVIS.x + (PIES_G[lado] - x) / S + rod * 4 * tb * ruido(t * 30 + (rod > 0 ? 1 : 5)), y: TOB_G[lado] }, ang: 0 };
    }
    // cara: guion + ácido + un ojo que se abre un poquito para ver el terrón
    let e = linea(GUION_CG, CG, "inicio", t);
    e = mezclaE(e, ACIDO_E, clamp(kA));
    const unOjo = tramo(t, T.unOjo, T.unOjo + 0.2) * (1 - tramo(t, T.aBoca, T.crac));
    e.wd = -0.62 * unOjo; e.mx = lerp(e.mx, 0.85, unOjo); e.my = lerp(e.my, 0.35, unOjo); e.iris = lerp(e.iris, 0.82, unOjo);
    // mastica: mandíbula que sube y baja
    const mast = campana(t, T.gMastica[0], T.gMastica[1]);
    e.abre += 8 * mast * Math.max(0, Math.sin((t - T.gMastica[0]) * 15));
    const crac = campana(t, T.crac, T.crac + 0.35);
    e.abre += 7 * crac * Math.max(0, Math.sin((t - T.crac) * 22));
    p.cara = cara(e, kA > 0.5 ? 0 : parpadeo(t, PARP_G));
    p.rojo = 0;
    p.sudor = 0.9 * tramo(t, T.acido + 0.2, T.acido + 0.6) * (1 - tramo(t, T.alivio, T.alivio1)) + 0.5 * campana(t, T.pulgar - 0.2, T.fin + 0.6);
    p.capaCabeza = g => caraAcida(g, t, kA);
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    const bo = G.boca(p);
    const resuelve = lado => o => {
      let q;
      if (o.bols) return { x: Tr(BOLS_G[lado === "l" ? "l" : "c"]).x, y: Tr(BOLS_G[lado === "l" ? "l" : "c"]).y, mu: -1.75, ang: 0, puno: 0, dedos: D(0.4, 0.4, 0.4, 0.4), off: { x: 0, y: 0 }, rot: 0 };
      const ob = OFF[o.obj || "nada"];
      if (o.pant) q = G.aHoja(p, { x: o.pant.x, y: o.pant.y });
      else if (o.hom) { const h = lado === "l" ? hl : hc; q = { x: h.x + o.hom.x, y: h.y + o.hom.y }; }
      else if (o.boca) { const bp = G.aPantalla(p, bo); q = G.aHoja(p, { x: bp.x + o.boca.x, y: bp.y + o.boca.y }); }
      else if (o.terron) { const c = terronEnHP(); q = G.aHoja(p, { x: c.x - ob.off.x, y: c.y - ob.off.y }); }
      return { x: q.x, y: q.y, mu: o.mu, ang: o.ang || 0, puno: o.puno, dedos: o.dedos, off: ob.off, rot: ob.rot };
    };
    const L = pista(PISTA_GL, t, resuelve("l")), C = pista(PISTA_GC, t, resuelve("c"));
    // temblor de las manos: los puños apretados tiemblan con el cuerpo, la mano que alcanza el terrón aún más
    const tm = temblorMano(t) + 0.6 * tb;
    L.x += tm * ruido(t * 47 + 2) / S; L.y += tm * 0.7 * ruido(t * 51 + 9) / S;
    C.x += 0.6 * tb * ruido(t * 44 + 4) / S; C.y += 0.4 * tb * ruido(t * 49 + 6) / S;
    p.manoCerca = { x: C.x, y: C.y, ang: C.ang, mu: C.mu, dobla: -1, puno: C.puno, dedos: C.dedos };
    p.manoLejos = { x: L.x, y: L.y, ang: L.ang, mu: L.mu, dobla: -1, puno: L.puno, dedos: L.dedos };
    p._L = L;
    // gajo y terrón, en pantalla, dibujados por la mano (detrás de los dedos)
    const fist = G.aPantalla(p, L);
    const objs = [];
    if (t >= T.gToma && t < T.suelta) objs.push(gg => gajo(gg, fist.x + L.off.x, fist.y + L.off.y, L.rot, tramo(t, T.gMuerde, T.gMuerde + 0.06)));
    if (conTerron && t >= T.toma && t < T.aBoca + 0.06) {
      const k = 1 - tramo(t, T.aBoca, T.aBoca + 0.06);
      objs.push(gg => terron(gg, fist.x + L.off.x, fist.y + L.off.y, 0.1, k));
    }
    if (objs.length) p.manoLejos.objeto = g => { if (!MATRIZ) return; g.save(); g.setTransform(MATRIZ); for (const f of objs) f(g); g.restore(); };
    return p;
  }
  // gajo de Guillermo en el momento de soltarlo (para la caída)
  const sueltaG = () => cache("sueltaG", () => { const p = poseG(T.suelta - 1e-4, false), L = p._L, f = G.aPantalla(p, L);
    return { x: f.x + L.off.x, y: f.y + L.off.y, rot: L.rot }; });

  /* ---------- cara ácida (encima de la cara, coordenadas del retrato) ---------- */
  // Piel de la cara (misma que en las 00021 y 00029)
  const PIEL = [956,503,938,501,918,520,896,531,895,526,907,504,907,491,894,491,867,505,845,509,873,470,873,457,854,448,853,442,830,439,824,431,801,432,799,438,779,437,729,464,736,428,723,428,679,454,676,477,649,496,635,536,629,543,624,542,619,526,589,500,572,499,556,507,544,522,531,568,530,593,539,614,572,657,572,664,527,801,521,812,492,833,492,853,738,853,738,847,704,811,705,806,741,830,769,840,767,853,801,853,802,845,812,843,822,835,907,719,932,645,954,612,954,594,892,588,891,583,896,578,941,581,947,587,960,586,964,518,957,516];
  function rutaPiel(g) { g.moveTo(PIEL[0], PIEL[1]); for (let i = 2; i < PIEL.length; i += 2) g.lineTo(PIEL[i], PIEL[i + 1]); g.closePath(); }
  const BOCA_C = { x: 803, y: 730 }, BOCA_ANG = 0.26;
  function caraAcida(g, t, k) {
    if (k <= 0.01) return;
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    // tinte agrio (verde limón) sobre la piel (sin el cuello)
    g.save(); g.beginPath(); rutaPiel(g); g.clip(); g.beginPath(); g.rect(596, 400, 420, 470); g.clip();
    g.globalCompositeOperation = "multiply"; g.fillStyle = `rgba(214,236,120,${0.45 * clamp(k)})`; g.fillRect(480, 420, 520, 440);
    g.restore();
    const a = clamp(k);
    g.globalAlpha = a;
    // mofletes chupados: hoyo de sombra y doble pliegue en cada carrillo
    g.fillStyle = "rgba(150,70,40,0.32)";
    g.beginPath(); g.ellipse(712, 712, 30, 46, 0.12, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(892, 704, 18, 38, -0.25, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#4a200e"; g.lineWidth = 7;
    g.beginPath(); g.moveTo(694, 660); g.quadraticCurveTo(724, 712, 700, 768); g.stroke();
    g.lineWidth = 4.5; g.beginPath(); g.moveTo(728, 690); g.quadraticCurveTo(744, 720, 734, 752); g.stroke();
    g.lineWidth = 7; g.beginPath(); g.moveTo(908, 662); g.quadraticCurveTo(880, 704, 898, 752); g.stroke();
    g.lineWidth = 4.5; g.beginPath(); g.moveTo(884, 690); g.quadraticCurveTo(868, 716, 878, 742); g.stroke();
    // arrugas del entrecejo
    g.strokeStyle = "rgba(80,32,14,0.9)"; g.lineWidth = 5;
    for (const [x, d] of [[826, -1], [846, 1]]) { g.beginPath(); g.moveTo(x, 566); g.quadraticCurveTo(x + 7 * d, 586, x + 2 * d, 606); g.stroke(); }
    // morritos: boquita de piñón arrugada (encima de la boca)
    g.save(); g.translate(BOCA_C.x + 6, BOCA_C.y + 4); g.rotate(BOCA_ANG);
    const q = (0.7 + 0.3 * a) * (1 + 0.04 * Math.sin(t * 29));
    g.fillStyle = "#c9625a"; g.beginPath();
    for (let i = 0; i <= 24; i++) { const an = i * Math.PI * 2 / 24, r = (i % 2 ? 0.86 : 1);
      g.lineTo(Math.cos(an) * 31 * q * r, Math.sin(an) * 25 * q * r); }
    g.closePath(); g.fill(); g.lineWidth = 6; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "#4f1512"; g.beginPath(); g.ellipse(1, 2, 10 * q, 6 * q, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(80,20,15,0.95)"; g.lineWidth = 3.5;
    for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6 + 0.13;
      g.beginPath(); g.moveTo(Math.cos(an) * 13 * q, Math.sin(an) * 9 * q); g.lineTo(Math.cos(an) * 26 * q, Math.sin(an) * 20 * q); g.stroke(); }
    g.fillStyle = "rgba(255,225,215,0.8)"; g.beginPath(); g.ellipse(-10, -13, 8, 3.5, -0.3, 0, Math.PI * 2); g.fill();
    g.restore();
    g.restore();
  }

  /* ---------- pelo de punta (detrás de la cabeza, coordenadas del retrato) ---------- */
  const PUAS = [[600, 380, -2.55, 120, 160, 0.35], [640, 320, -2.2, 140, 180, -0.3], [715, 275, -1.88, 175, 200, 0.3], [818, 262, -1.55, 185, 190, -0.3],
                [920, 296, -1.2, 165, 185, 0.32], [1004, 356, -0.85, 130, 165, -0.28], [1056, 438, -0.52, 95, 135, 0.25]];
  function matCabeza(p) {
    const H = G.cabeza(p), o = H.a({ x: 0, y: 0 }), ax = H.a({ x: 1, y: 0 }), ay = H.a({ x: 0, y: 1 });
    const O = G.aPantalla(p, o), X = G.aPantalla(p, ax), Y = G.aPantalla(p, ay);
    return [X.x - O.x, X.y - O.y, Y.x - O.x, Y.y - O.y, O.x, O.y];
  }
  function peloDePunta(g, t, p, k, solo) {
    if (k <= 0.01) return;
    const M = matCabeza(p);
    g.save(); g.transform(M[0], M[1], M[2], M[3], M[4], M[5]); g.lineJoin = "round"; g.lineCap = "round";
    PUAS.forEach(([bx, by, a, L, w, cu], i) => {
      if (solo !== undefined && i !== solo) return;
      const ki = clamp(k * (1.08 - 0.06 * Math.abs(i - 3)));
      const fl = 1 + 0.06 * Math.sin(t * 31 + i * 1.7) + 0.04 * Math.sin(t * 47 + i);
      const aa = a + 0.05 * Math.sin(t * 23 + i * 2.1);
      const dx = Math.cos(aa), dy = Math.sin(aa), px = -dy, py = dx, len = (60 + L) * ki * fl;
      const tip = { x: bx + dx * len + px * cu * 30 * ki, y: by + dy * len + py * cu * 30 * ki };
      const b1 = { x: bx + px * w / 2, y: by + py * w / 2 }, b2 = { x: bx - px * w / 2, y: by - py * w / 2 };
      const c1 = { x: bx + dx * len * 0.55 + px * w * (0.3 + cu * 0.3), y: by + dy * len * 0.55 + py * w * (0.3 + cu * 0.3) };
      const c2 = { x: bx + dx * len * 0.5 - px * w * (0.12 - cu * 0.3), y: by + dy * len * 0.5 - py * w * (0.12 - cu * 0.3) };
      const forma = () => { g.beginPath(); g.moveTo(b1.x, b1.y); g.quadraticCurveTo(c1.x, c1.y, tip.x, tip.y); g.quadraticCurveTo(c2.x, c2.y, b2.x, b2.y); g.closePath(); };
      forma(); g.fillStyle = "#86492a"; g.fill();
      g.save(); forma(); g.clip();
      g.fillStyle = "#5c2f17"; g.beginPath(); g.moveTo(bx - px * w * 0.05, by - py * w * 0.05); g.quadraticCurveTo(c2.x, c2.y, tip.x, tip.y); g.lineTo(b2.x, b2.y); g.closePath(); g.fill();
      g.strokeStyle = "rgba(225,150,95,0.85)"; g.lineWidth = 12;
      g.beginPath(); g.moveTo(bx + px * w * 0.18, by + py * w * 0.18); g.quadraticCurveTo(c1.x - px * 18, c1.y - py * 18, bx + dx * len * 0.82 + px * 4, by + dy * len * 0.82 + py * 4); g.stroke();
      g.restore();
      forma(); g.lineWidth = 7; g.strokeStyle = "#1c0d05"; g.stroke();
    });
    g.restore();
  }

  /* ================= Carla ================= */
  const CC = {
    base: E({ mx: 0.9, my: 0.05, sonr: 0.38, ancho: 0.92 }),
    reto: E({ mx: 0.9, my: 0.05, sonr: 0.58, ancho: 0.9, sd: 4, si: 18, gd: -0.04, gi: 0.18 }),
    coge: E({ mx: 0.6, my: 0.65, sonr: 0.45, ancho: 0.9, sd: 6, si: 10 }),
    muerde: E({ mx: 0.92, my: 0.05, abre: 18, ancho: 0.8, sonr: 0.15, sd: 6, si: 12, gi: 0.1 }),
    mastica: E({ mx: 0.92, my: 0.05, sonr: 0.42, ancho: 0.8, sd: 6, si: 12, gi: 0.12 }),
    turno: E({ mx: 0.92, my: 0.3, sonr: 0.62, ancho: 0.92, sd: 4, si: 20, gi: 0.18 }),
    escepti: E({ mx: 0.95, my: 0.05, sonr: 0.32, ancho: 0.9, sd: 12, si: 2, gd: 0.12, gi: -0.05 }),
    sorpresa: E({ mx: 0.95, my: 0.05, abre: 16, ancho: 0.6, sonr: -0.1, sd: 22, si: 22, iris: 0.9 }),
    risa: E({ mx: 0.5, my: 0.1, c: 0.9, h: 1, abre: 14, ancho: 1, sonr: 0.95, rub: 0.35, sd: 10, si: 10, gd: 0.15, gi: 0.15 }),
    amable: E({ mx: 0.95, my: 0.15, c: 0.1, sonr: 0.62, ancho: 0.92, sd: 10, si: 10, gd: 0.1, gi: 0.1 }),
    azucar: E({ mx: 0.5, my: 0.7, sonr: 0.5, ancho: 0.9, sd: 6, si: 6 }),
    guino: E({ mx: -0.85, my: -0.05, wd: 1, h: 0.6, sonr: 0.85, ancho: 0.95, sd: 6, si: 14, gd: -0.05, gi: 0.15, rub: 0.5 })
  };
  const GUION_CC = [
    [T.reto, T.reto + 0.2, "reto"], [T.cSale + 0.1, T.cSale + 0.3, "coge"], [T.cMuerde - 0.1, T.cMuerde, "muerde"],
    [T.cMuerde + 0.06, T.cMuerde + 0.2, "mastica"], [T.turno, T.turno + 0.2, "turno"], [T.gSale + 0.2, T.gSale + 0.4, "escepti"],
    [T.acido + 0.03, T.acido + 0.15, "sorpresa"], [T.risa, T.risa + 0.2, "risa"], [T.risa1, T.risa1 + 0.2, "azucar"],
    [T.cSobreA + 0.15, T.cOfrece, "amable"], [T.cRie, T.cRie + 0.15, "risa"], [T.cGuino - 0.15, T.cGuino, "guino"]
  ];
  const PARP_C = [0.7, 4.3, 5.3, 7.35, 8.9, 10.5];
  const P0C = { pel: 0, torso: 0.02, cab: 0.02 };
  const CUER_C = {
    quieta: P0C,
    coge: Object.assign({}, P0C, { torso: 0.08, cab: 0.04 }),
    muerde: Object.assign({}, P0C, { torso: 0.0, cab: -0.04 }),
    risa: Object.assign({}, P0C, { torso: -0.06, cab: -0.1 }),
    ofrece: Object.assign({}, P0C, { torso: 0.08, cab: 0.06 }),
    final: Object.assign({}, P0C, { torso: -0.02, cab: -0.02 })
  };
  const GUION_C = [
    [T.cSale, T.cSobre, "coge"], [T.cToma, T.cBoca, "muerde"], [T.cBaja, T.cDeja, "coge"], [T.cDeja, T.cReposo, "quieta"],
    [T.risa, T.risa + 0.3, "risa"], [T.risa1, T.risa1 + 0.3, "quieta"], [T.cAzucar, T.cSobreA, "coge"], [T.cPinza, T.cOfrece, "ofrece"],
    [T.toma + 0.05, T.toma + 0.5, "quieta"], [T.cRie, T.cRie + 0.25, "risa"], [T.cGuino - 0.3, T.cGuino, "final"]
  ];
  const OFF_C = {
    nada: { off: { x: 0, y: 0 }, rot: 0 },
    pinzaPlato: { off: { x: 0, y: 8 }, rot: 0 },
    bocaC: { off: { x: 13, y: 1 }, rot: Math.PI / 2 },
    pinzaTerron: { off: { x: 0, y: 9 }, rot: 0 },
    ofrece: { off: { x: -11, y: -3 }, rot: 0 }
  };
  const PISTA_CL = [
    [0, 0, { bols: true }],
    [T.cSale, T.cSobre, { pant: { x: GAJO_C.x + 2, y: GAJO_C.y - 30 }, mu: -1.75, puno: 1, dedos: D(0.75, 0.75, 0.7, 0.65) }],
    [T.cSobre, T.cToma, { pant: { x: GAJO_C.x, y: GAJO_C.y - 8 }, mu: -1.75, puno: 1, dedos: D(0.38, 0.38, 0.32, 0.3), obj: "pinzaPlato" }],
    [T.cToma + 0.03, T.cBoca, { boca: { x: -15, y: 2 }, mu: -2.6, puno: 1, dedos: D(0.38, 0.38, 0.32, 0.3), obj: "bocaC" }],
    [T.cMastica[0] + 0.1, T.cMastica[1] - 0.2, { boca: { x: -17, y: 14 }, mu: -2.3, puno: 1, dedos: D(0.38, 0.38, 0.32, 0.3), obj: "bocaC" }],
    [T.cBaja, T.cDeja, { pant: { x: GAJO_C.x, y: GAJO_C.y - 8 }, mu: -1.75, puno: 1, dedos: D(0.38, 0.38, 0.32, 0.3), obj: "pinzaPlato" }],
    [T.cDeja + 0.05, T.cReposo + 0.1, { bols: true }],
    [T.cAzucar, T.cSobreA, { pant: { x: TERRON.x, y: TERRON.y - 28 }, mu: -1.75, puno: 1, dedos: D(0.7, 0.7, 0.65, 0.6) }],
    [T.cSobreA, T.cPinza, { pant: { x: TERRON.x, y: TERRON.y - 9 }, mu: -1.75, puno: 1, dedos: D(0.4, 0.4, 0.3, 0.28), obj: "pinzaTerron" }],
    [T.cPinza + 0.05, T.cOfrece, { pant: { x: HP.x - OFF_C.ofrece.off.x, y: HP.y - OFF_C.ofrece.off.y }, mu: -3.0, puno: 1, dedos: D(0.42, 0.42, 0.3, 0.28), obj: "ofrece" }],
    [T.toma + 0.08, T.toma + 0.6, { bols: true }]
  ];

  function poseC(t) {
    const b = linea(GUION_C, CUER_C, "quieta", t);
    const respira = Math.sin(t * 2.0 + 1.1);
    const ri = campana(t, T.risa, T.risa1 + 0.15) + campana(t, T.cRie, T.cRie + 0.7);
    const sacude = ri * Math.abs(Math.sin((t - T.risa) * 16));
    const p = {
      x: XC, suelo: SUELO, s: S, espejo: true,
      pelvis: { x: Ca.PELVIS.x, y: Ca.PELVIS.y + b.pel + respira * 1.1 - 7 * sacude },
      torso: b.torso + 0.03 * sacude, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab - 0.05 * sacude, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      tirasLimpias: true, ikContinuo: true
    };
    // mastica con elegancia: la cabeza apenas se mueve al ritmo
    const mast = campana(t, T.cMastica[0], T.cMastica[1]);
    p.cabeza.ang += 0.015 * mast * Math.sin((t - T.cMastica[0]) * 12);
    const ty = Ca.SUELO - Ca.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: Ca.PELVIS.x - 62, y: ty }, ang: 0 };
    p.piernas.lejos = { tob: { x: Ca.PELVIS.x + 74, y: ty - 8 }, ang: 0 };
    const d = (linea(GUION_C, CUER_C, "quieta", t).torso - linea(GUION_C, CUER_C, "quieta", t - 0.1).torso) / 0.1;
    p.pelo = { inercia: clamp(-0.4 * d + 0.2 * sacude, -1, 1), viento: 0.12 + 0.08 * Math.sin(t * 1.3) };
    const e = linea(GUION_CC, CC, "base", t);
    e.abre += 5 * mast * Math.max(0, Math.sin((t - T.cMastica[0]) * 12));
    p.cara = cara(e, parpadeo(t, PARP_C, 0.13));
    // manos
    const bo = Ca.boca(p);
    const resuelve = o => {
      if (o.bols) { const m = Ca.manoReposo(p, "lejos"); return { x: m.x, y: m.y, mu: -1.75, ang: 0, puno: 0, dedos: D(0.4, 0.4, 0.4, 0.4), off: { x: 0, y: 0 }, rot: 0 }; }
      const ob = OFF_C[o.obj || "nada"];
      let q;
      if (o.pant) q = Ca.aHoja(p, o.pant);
      else if (o.boca) { const bp = Ca.aPantalla(p, bo); q = Ca.aHoja(p, { x: bp.x + o.boca.x, y: bp.y + o.boca.y }); }
      return { x: q.x, y: q.y, mu: o.mu, ang: o.ang || 0, puno: o.puno, dedos: o.dedos, off: ob.off, rot: ob.rot };
    };
    const L = pista(PISTA_CL, t, resuelve);
    p.manoLejos = { x: L.x, y: L.y, ang: L.ang, mu: L.mu, dobla: -1, puno: L.puno, dedos: L.dedos };
    p.manoCerca = Ca.manoReposo(p, "cerca");
    p._L = L;
    const fist = Ca.aPantalla(p, L);
    const objs = [];
    if (t >= T.cToma && t < T.cDeja) objs.push(gg => gajo(gg, fist.x + L.off.x, fist.y + L.off.y, L.rot, tramo(t, T.cMuerde, T.cMuerde + 0.06)));
    if (t >= T.cPinza && t < T.toma) objs.push(gg => terron(gg, fist.x + L.off.x, fist.y + L.off.y, 0.1));
    if (objs.length) p.manoLejos.objeto = g => { if (!MATRIZ) return; g.save(); g.setTransform(MATRIZ); for (const f of objs) f(g); g.restore(); };
    return p;
  }
  // el terrón en el instante en que Guillermo lo coge (de la mano de Carla)
  const terronEnHP = () => cache("hp", () => { const p = poseC(T.toma), L = p._L, f = Ca.aPantalla(p, L); return { x: f.x + L.off.x, y: f.y + L.off.y }; });

  /* ================= efectos ================= */
  function estrellita(g, x, y, r, a) {
    g.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.3 : r, an = a + i * Math.PI / 4; g.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); } g.closePath();
  }
  // rayitas de vibración a los lados de Guillermo mientras tiembla
  function vibracion(g, t, pG) {
    const tb = temblor(t); if (tb < 0.4) return;
    const a = clamp((tb - 0.4) / 2);
    const cab = G.aPantalla(pG, G.centroCabeza(pG)), pecho = G.aPantalla(pG, G.tronco(pG)({ x: 250, y: 480 }));
    g.save(); g.strokeStyle = TINTA; g.lineCap = "round"; g.lineWidth = 2.4; g.globalAlpha = a;
    for (const [c, r] of [[cab, 70], [pecho, 52]]) for (const s of [-1, 1]) for (let i = 0; i < 2; i++) {
      const fl = Math.sin(t * 40 + i * 2 + s) * 2;
      g.beginPath(); g.arc(c.x + s * (r + i * 9 + fl), c.y, 10 + i * 4, s > 0 ? -0.6 : Math.PI - 0.6, s > 0 ? 0.6 : Math.PI + 0.6); g.stroke();
    }
    g.restore();
  }
  // gotas de zumo al morder
  function zumo(g, t, t0, pX, dir) {
    const k = fase(t, t0, t0 + 0.4); if (k <= 0 || k >= 1) return;
    g.save(); g.fillStyle = "#fff27a"; g.strokeStyle = "#c79a0a"; g.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const an = -Math.PI / 2 + dir * (0.3 + 0.9 * hash(i + t0 * 10)), v = 60 + 60 * hash(i + 3 + t0 * 10);
      const x = pX.x + Math.cos(an) * v * k, y = pX.y + Math.sin(an) * v * k + 200 * k * k;
      g.globalAlpha = 1 - k; g.beginPath(); g.arc(x, y, 2.2, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    g.restore();
  }
  // migas de azúcar y nubecita del suspiro
  function migas(g, t, pG) {
    const bo = G.aPantalla(pG, G.boca(pG));
    const k = fase(t, T.crac, T.crac + 0.45);
    if (k > 0 && k < 1) { g.save(); g.fillStyle = "#ffffff"; g.strokeStyle = TINTA; g.lineWidth = 0.8;
      for (let i = 0; i < 7; i++) { const an = -0.9 + 1.2 * hash(i + 70), v = 30 + 40 * hash(i + 71);
        const x = bo.x + 4 + Math.cos(an) * v * k, y = bo.y + Math.sin(an) * v * k + 120 * k * k;
        g.globalAlpha = 1 - k; g.fillRect(x - 1.5, y - 1.5, 3, 3); g.strokeRect(x - 1.5, y - 1.5, 3, 3); }
      g.restore(); }
    const ks = fase(t, T.suspiro, T.suspiro + 0.8);
    if (ks > 0 && ks < 1) { g.save(); g.globalAlpha = 0.7 * Math.sin(Math.PI * ks); g.fillStyle = "#ffffff";
      for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(bo.x + 16 + 26 * ks + i * 7, bo.y - 4 - 12 * ks - i * 3, 5 + 7 * ks, 0, Math.PI * 2); g.fill(); }
      g.restore(); }
  }
  // gajos y terrones que están en la mesa
  function objetosMesa(g, t) {
    // gajo de Carla: en el plato hasta que lo coge; la cáscara vuelve al plato
    if (t < T.cToma) gajo(g, GAJO_C.x, GAJO_C.y, 0, 0);
    if (t >= T.cDeja) gajo(g, GAJO_C.x, GAJO_C.y, 0, 1);
    // gajo de Guillermo: en el plato hasta que lo coge; la cáscara cae a la mesa y bota
    if (t < T.gToma) gajo(g, GAJO_G.x, GAJO_G.y, 0, 0);
    if (t >= T.suelta) { const c = caida(t); gajo(g, c.x, c.y, c.rot, 1); }
    // terrón de arriba del azucarero
    if (t < T.cPinza) terron(g, TERRON.x, TERRON.y, 0.05);
  }
  // cáscara de Guillermo: cae de su mano a la mesa, bota y se queda
  function caida(t) {
    const s = sueltaG(), suelo = MESA.y - 9, xFin = Math.max(MESA.x - MESA.w / 2 + 16, s.x + 12);
    const u = t - T.suelta, g0 = 1500, h = suelo - s.y, tc = Math.sqrt(Math.max(0, 2 * h / g0));
    if (u < tc) { const k = u / tc; return { x: lerp(s.x, xFin, k), y: s.y + 0.5 * g0 * u * u, rot: s.rot + (2 * Math.PI - s.rot) * k * 0.85 }; }
    const v = u - tc, bote = 0.35 * tc;
    if (v < bote) { const k = v / bote; return { x: xFin + 4 * k, y: suelo - 12 * Math.sin(Math.PI * k), rot: s.rot + (2 * Math.PI - s.rot) * (0.85 + 0.15 * k) }; }
    return { x: xFin + 4, y: suelo, rot: 2 * Math.PI };
  }

  /* ================= escena ================= */
  const pose = t => ({ g: poseG(t), l: poseC(t) });
  // cámara: plano general; al probar el limón, primer plano de Guillermo; para el azúcar, de los dos
  function camara(t) {
    const a = tramo(t, T.acido - 0.04, T.acido + 0.42, suave) * (1 - tramo(t, T.risa1 - 0.3, T.cOfrece - 0.2, suave));
    const b = tramo(t, T.risa1 - 0.3, T.cOfrece - 0.2, suave) * (1 - tramo(t, T.alivio1, T.pulgar + 0.2, suave));
    const k = 1.12 + 0.55 * a + 0.22 * b;
    const x = lerp(lerp(512, 432, a), 500, b), y = lerp(lerp(312, 190, a), 238, b);
    const mx = W / 2 / k, my = H / 2 / k;
    return { k, x: clamp(x, mx - 40, W + 40 - mx), y: clamp(y, my - 60, H + 60 - my) };
  }

  class GuillermoCarlaLimon extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Ca.listo()) return;
      if (!fondo) fondo = creaFondo();
      const pG = poseG(t), pC = poseC(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      MATRIZ = g.getTransform();
      g.drawImage(fondo, -40, -60);
      // sombras en el suelo
      g.save(); g.fillStyle = "rgba(70,25,0,0.3)";
      g.beginPath(); g.ellipse(pG.x + 4, SUELO + 2, 66, 7, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pC.x - 4, SUELO + 2, 58, 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
      objetosMesa(g, t);
      Ca.dibujar(g, pC, t);
      peloDePunta(g, t, pG, peloPunta(t));
      peloDePunta(g, t, pG, 0.65 * campana(t, T.escalofrio + 0.05, T.escalofrio1), 3);
      G.dibujar(g, pG, t);
      vibracion(g, t, pG);
      zumo(g, t, T.cMuerde, Ca.aPantalla(pC, Ca.boca(pC)), 1);
      zumo(g, t, T.gMuerde, G.aPantalla(pG, G.boca(pG)), -1);
      migas(g, t, pG);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00048", nombre: "Guillermo y Carla · El limón", crear: () => new GuillermoCarlaLimon() });
  window.__A2D_00048 = { pose, poseG, poseC, T, DUR };
})();
