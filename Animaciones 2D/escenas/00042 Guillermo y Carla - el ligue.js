"use strict";
/* 00042 · Guillermo y Carla · El ligue
 *
 * Negro → coctelería art déco vista desde detrás de la barra: pared verde azulado con abanicos
 * dorados, ventana redonda con la ciudad de noche, apliques, una gramola y una palmera. Carla, al
 * otro lado de la barra, se toma un cóctel. Guillermo, a la izquierda, se prepara mirando a cámara
 * como si fuera un espejo: se repeina con un peine de bolsillo, se comprueba el aliento en la mano
 * (casi se desmaya) y saca bíceps → se acerca a cámara lenta en plan chulo, se planta junto a Carla
 * y le guiña un ojo → apoya el codo en la barra… y el codo sigue bajando: la barra está más lejos
 * de lo que creía; se queda un instante con los brazos en alto, mira a cámara y se hunde detrás del
 * mostrador → golpe, polvo y botellas que tiemblan; Carla mira por encima → por encima del borde sube
 * su mano con una florecilla y la deja en la barra con el tallo hacia ella → Carla deja la copa, la
 * coge, la huele y sonríe; Guillermo asoma los ojos por el borde, colorado, y ella le guiña un ojo
 * → negro.
 *
 * La barra está en primer término: tapa a los dos de cintura para abajo cuando están detrás de
 * ella. Sin textos. Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, Ca = Carla;
  const S = 0.31, SUELO = 560;
  const YB = 336;                 // canto de la barra (la encimera se ve de canto, a la altura de los ojos de la cámara)
  const XB = 436;                 // extremo izquierdo de la barra
  const XC = 818;                 // Carla, mirando a la izquierda
  const XG0 = 228, XG1 = 604;     // Guillermo: donde se prepara y donde se planta
  const GX = 744;                 // copa de Carla (sobre la barra)
  const DUR = 14.75;
  const T = {
    mira: 0.5, camara: 0.95,
    peine0: 1.0, peina0: 1.45, peina1: 2.55, brillo: 2.62, guarda: 2.65,
    aliento: 3.05, sopla: 3.42, huele: 3.72, asco: 3.95, recupera: 4.55,
    musculo: 5.0, musculo1: 5.85,
    anda0: 6.05, anda1: 8.6,
    guino: 8.85, apoya: 9.2, falla: 9.78, cuelga: 9.92, cae: 10.2, golpe: 10.52,
    asomaC: 10.75, sube: 11.35, deja: 11.9, suelta: 12.2,
    coge: 12.6, huele2: 13.0, asoma: 13.2, guinoC: 13.75, fin: 14.1,
    sorbos: [[0.7, 1.5], [7.05, 7.9]]
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const D = (pu, ix, md, re) => ({ pulgar: pu, indice: ix, medio: md, anular: re, menique: re });
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, -1.75), l: punoDesde({ x: 372, y: 648 }, -1.75) };
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const memo = new Map();
  const cache = (k, f) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };

  /* Matrices afines [a, b, c, d, e, f] (las de canvas): del «objeto» de una mano a la pantalla. */
  function matMano(C, p, m) {
    const k = p.s * (C.K || 1), kx = p.espejo ? -k : k, ky = k, J = C.JK;
    const c = Math.cos(m.ang || 0), s = Math.sin(m.ang || 0);
    return [kx * c * J, ky * s * J, -kx * s * J, ky * c * J, p.x + (m.x - C.PELVIS.x) * kx, p.suelo + (m.y - C.SUELO) * ky];
  }
  const mul = (A, B) => [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3],
    A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
  const inv = A => { const d = A[0] * A[3] - A[1] * A[2];
    return [A[3] / d, -A[1] / d, -A[2] / d, A[0] / d, (A[2] * A[5] - A[3] * A[4]) / d, (A[1] * A[4] - A[0] * A[5]) / d]; };
  const aplica = (A, q) => ({ x: A[0] * q.x + A[2] * q.y + A[4], y: A[1] * q.x + A[3] * q.y + A[5] });
  const escala = k => [k, 0, 0, k, 0, 0];
  const UG = G.JK * S, UC = Ca.JK * S * Ca.K;          // de unidades del «objeto» de la mano a píxeles
  // mano (hoja) para que el punto q del objeto (con la matriz extra Mx) caiga en `obj` (pantalla)
  function manoHacia(C, p, ang, Mx, q, obj) {
    const A = mul(matMano(C, p, { x: C.PELVIS.x, y: C.SUELO, ang }), Mx), v = aplica(A, q);
    const k = p.s * (C.K || 1), kx = p.espejo ? -k : k;
    return { x: C.PELVIS.x + (obj.x - v.x) / kx, y: C.SUELO + (obj.y - v.y) / k };
  }

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, wd: 0, wi: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12,
    dientes: 1, lengua: 0, mof: 0, rub: 0, rojo: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, extraC) {
    const c = clamp(e.c + extraC);
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp, ojos: { d: clamp(c + e.wd), i: clamp(c + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* ================= decorado ================= */
  const VENTANA = { x: 452, y: 126, r: 66 };
  let fondo = null, barra = null, botellas = null, frente = null, barraEntera = null;
  function abanico(g, x, y, r, alfa) {           // abanico art déco dorado
    g.save(); g.globalAlpha = alfa; g.strokeStyle = "#d9a441"; g.lineWidth = 2;
    for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x, y, r * (1 - k * 0.28), Math.PI, 0); g.stroke(); }
    for (let i = 0; i <= 8; i++) { const a = Math.PI + i * Math.PI / 8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.stroke(); }
    g.restore();
  }
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60);
    // pared verde azulado
    const pared = g.createLinearGradient(0, -60, 0, 450); pared.addColorStop(0, "#0a2a30"); pared.addColorStop(1, "#14525a");
    g.fillStyle = pared; g.fillRect(-40, -60, W + 80, 512);
    // banda de abanicos dorados
    for (let x = -10; x < W + 40; x += 96) abanico(g, x, 214, 44, 0.16);
    g.fillStyle = "rgba(217,164,65,0.35)"; g.fillRect(-40, 216, W + 80, 3);
    g.fillStyle = "rgba(217,164,65,0.18)"; g.fillRect(-40, 22, W + 80, 2);
    // listones verticales finos
    g.fillStyle = "rgba(255,255,255,0.03)"; for (let x = -40; x < W + 40; x += 48) g.fillRect(x, 222, 14, 230);
    // ventana redonda: ciudad de noche con luna
    const v = VENTANA;
    g.save(); g.beginPath(); g.arc(v.x, v.y, v.r, 0, Math.PI * 2); g.clip();
    const cielo = g.createLinearGradient(0, v.y - v.r, 0, v.y + v.r); cielo.addColorStop(0, "#0b1238"); cielo.addColorStop(1, "#3a2a6a");
    g.fillStyle = cielo; g.fillRect(v.x - v.r, v.y - v.r, v.r * 2, v.r * 2);
    g.fillStyle = "#fff6d0"; for (let i = 0; i < 14; i++) { g.globalAlpha = 0.4 + 0.6 * hash(i + 3); g.beginPath(); g.arc(v.x - v.r + hash(i) * v.r * 2, v.y - v.r + hash(i + 7) * v.r, 1 + hash(i + 2), 0, Math.PI * 2); g.fill(); }
    g.globalAlpha = 1; g.fillStyle = "#fff3c4"; g.beginPath(); g.arc(v.x + 24, v.y - 28, 15, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#3a2a6a"; g.beginPath(); g.arc(v.x + 31, v.y - 32, 13, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 9; i++) {
      const bx = v.x - v.r + i * 16, bh = 30 + hash(i + 20) * 50;
      g.fillStyle = "#0a0c1e"; g.fillRect(bx, v.y + v.r - bh, 14, bh);
      g.fillStyle = "#ffd36b"; for (let k = 0; k < 6; k++) if (hash(i * 9 + k) > 0.45) g.fillRect(bx + 3 + (k % 2) * 5, v.y + v.r - bh + 6 + Math.floor(k / 2) * 9, 3, 4);
    }
    g.restore();
    g.lineWidth = 9; g.strokeStyle = "#b8862e"; g.beginPath(); g.arc(v.x, v.y, v.r + 4, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 2.5; g.strokeStyle = "#2a1a06"; g.beginPath(); g.arc(v.x, v.y, v.r + 9, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(v.x, v.y, v.r, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "#f2d690"; g.lineWidth = 2; g.beginPath(); g.arc(v.x, v.y, v.r + 4, Math.PI * 1.1, Math.PI * 1.45); g.stroke();
    // apliques de abanico con halo cálido
    for (const lx of [118, 930]) {
      const halo = g.createRadialGradient(lx, 116, 6, lx, 116, 170); halo.addColorStop(0, "rgba(255,206,130,0.45)"); halo.addColorStop(1, "rgba(255,190,110,0)");
      g.fillStyle = halo; g.beginPath(); g.arc(lx, 116, 170, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#c9a14a"; g.strokeStyle = "#2a1a06"; g.lineWidth = 2.2;
      g.beginPath(); g.moveTo(lx - 26, 104); g.quadraticCurveTo(lx, 70, lx + 26, 104); g.lineTo(lx + 8, 132); g.lineTo(lx - 8, 132); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#fff0c8"; g.beginPath(); g.moveTo(lx - 18, 102); g.quadraticCurveTo(lx, 80, lx + 18, 102); g.closePath(); g.fill();
      g.strokeStyle = "rgba(42,26,6,0.6)"; g.lineWidth = 1.2; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(lx, 130); g.lineTo(lx + i * 9, 104); g.stroke(); }
    }
    // zócalo y rodapié
    g.fillStyle = "#0c2a2c"; g.fillRect(-40, 400, W + 80, 52);
    g.fillStyle = "#b8862e"; g.fillRect(-40, 398, W + 80, 4); g.fillStyle = "#f2d690"; g.fillRect(-40, 398, W + 80, 1.5);
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 2; for (let x = -10; x < W + 40; x += 80) g.strokeRect(x, 410, 64, 34);
    g.fillStyle = "#1a0e08"; g.fillRect(-40, 446, W + 80, 8);
    // suelo de ajedrez en perspectiva (horizonte a la altura del canto de la barra)
    const yH = YB, y0 = 454, xv = 520;
    g.save(); g.beginPath(); g.rect(-40, y0, W + 80, H + 60 - y0); g.clip();
    g.fillStyle = "#e9dcc3"; g.fillRect(-40, y0, W + 80, H + 60 - y0);
    const filas = []; for (let i = 0; i <= 9; i++) { const u = i / 9; filas.push(y0 + (H + 60 - y0) * (Math.pow(1.9, i) - 1) / (Math.pow(1.9, 9) - 1)); }
    g.fillStyle = "#1c1a22";
    for (let i = 0; i < filas.length - 1; i++) {
      for (let j = -14; j < 16; j++) {
        if ((i + j) % 2 === 0) continue;
        const xl = y => xv + (j * 70 - (xv - 512) * 0) * (y - yH) / (y0 - yH), xr = y => xv + ((j + 1) * 70) * (y - yH) / (y0 - yH);
        const a = filas[i], b = filas[i + 1];
        g.beginPath(); g.moveTo(xl(a), a); g.lineTo(xr(a), a); g.lineTo(xr(b), b); g.lineTo(xl(b), b); g.closePath(); g.fill();
      }
    }
    const brillo = g.createLinearGradient(0, y0, 0, H + 60); brillo.addColorStop(0, "rgba(10,40,44,0.45)"); brillo.addColorStop(1, "rgba(0,0,0,0.25)");
    g.fillStyle = brillo; g.fillRect(-40, y0, W + 80, H + 60 - y0);
    g.restore();
    // gramola (sin letras) a la izquierda
    gramola(g, 22, 270);
    // palmera en maceta junto al extremo de la barra
    palmera(g, 350, 452);
    // viñeta
    const vi = g.createRadialGradient(512, 300, 300, 512, 300, 720); vi.addColorStop(0, "rgba(0,0,0,0)"); vi.addColorStop(1, "rgba(0,10,12,0.55)");
    g.fillStyle = vi; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }
  function gramola(g, x, y) {
    const w = 96, h = 182;
    g.save(); g.lineJoin = "round";
    g.fillStyle = "rgba(0,0,0,0.3)"; g.beginPath(); g.ellipse(x + w / 2, y + h + 2, w * 0.6, 7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#6a1f2a"; g.strokeStyle = "#1a0606"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + 50); g.arc(x + w / 2, y + 50, w / 2, Math.PI, 0); g.lineTo(x + w, y + h); g.closePath(); g.fill(); g.stroke();
    // arco de tubos de luz
    const cols = ["#ffcf4a", "#ff6a5a", "#5ad1ff"];
    cols.forEach((c, i) => { g.strokeStyle = c; g.lineWidth = 5; g.beginPath(); g.arc(x + w / 2, y + 52, w / 2 - 7 - i * 8, Math.PI * 1.02, Math.PI * 1.98); g.stroke(); });
    g.fillStyle = "#2a0c10"; g.beginPath(); g.arc(x + w / 2, y + 56, 18, Math.PI, 0); g.fill();
    // rejilla y botones
    g.fillStyle = "#c9a14a"; g.fillRect(x + 14, y + 100, w - 28, 44);
    g.strokeStyle = "#4a2a06"; g.lineWidth = 1.4; for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(x + 18 + i * 10, y + 104); g.lineTo(x + 18 + i * 10, y + 140); g.stroke(); }
    g.fillStyle = "#f2ead8"; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(x + 22 + i * 13, y + 158, 3.5, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  function palmera(g, x, y) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.fillStyle = "rgba(0,0,0,0.3)"; g.beginPath(); g.ellipse(x, y + 2, 34, 6, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#2b4a1c"; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y - 50); g.quadraticCurveTo(x - 4, y - 110, x + 6, y - 160); g.stroke();
    const hojas = [[-1.9, 70], [-1.4, 82], [-0.9, 74], [-2.5, 66], [-0.45, 60], [-3.0, 52]];
    for (const [a, L] of hojas) {
      const bx = x + 6, by = y - 160, ex = bx + Math.cos(a) * L, ey = by + Math.sin(a) * L * 0.9 + 24;
      g.fillStyle = "#3e7a2e"; g.strokeStyle = "#13280c"; g.lineWidth = 2;
      g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo((bx + ex) / 2 - Math.sin(a) * 14, (by + ey) / 2 - 18, ex, ey);
      g.quadraticCurveTo((bx + ex) / 2 + Math.sin(a) * 10, (by + ey) / 2 + 2, bx, by); g.fill(); g.stroke();
    }
    // maceta dorada
    g.fillStyle = "#b8862e"; g.strokeStyle = "#2a1a06"; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(x - 28, y - 52); g.lineTo(x + 28, y - 52); g.lineTo(x + 20, y); g.lineTo(x - 20, y); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#f2d690"; g.fillRect(x - 24, y - 46, 5, 38);
    g.restore();
  }

  // la barra (en primer término): estructura con el hueco de las baldas, botellas y frente
  const BW = W + 40 - XB, BH = H + 60 - YB;
  function creaBarra() {
    const c = document.createElement("canvas"); c.width = BW; c.height = BH; const g = c.getContext("2d");
    g.translate(-XB, -YB);
    // hueco interior (lado del camarero) con luz cálida arriba
    g.fillStyle = "#1a0b06"; g.fillRect(XB, YB, BW, BH);
    const luz = g.createLinearGradient(0, YB + 16, 0, YB + 120); luz.addColorStop(0, "rgba(255,190,110,0.45)"); luz.addColorStop(1, "rgba(255,170,90,0)");
    g.fillStyle = luz; g.fillRect(XB, YB + 16, BW, 104);
    return c;
  }
  const BOT = [];
  for (let i = 0; i < 18; i++) {
    const tipo = Math.floor(hash(i + 50) * 4);
    BOT.push({ x: XB + 40 + i * 33 + (hash(i + 70) - 0.5) * 6, h: 36 + hash(i + 60) * 16, w: 12 + hash(i + 61) * 5,
      col: ["#c97a1c", "#3d8a3a", "#cfe8f0", "#a8202c"][tipo], fase: hash(i + 80) * 6 });
  }
  function dibBotella(g, b, x, y) {
    const w = b.w, h = b.h;
    g.save(); g.translate(x, y); g.lineJoin = "round";
    g.fillStyle = b.col; g.strokeStyle = "#140703"; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(-w / 2, 0); g.lineTo(-w / 2, -h * 0.62); g.quadraticCurveTo(-w / 2, -h * 0.78, -w * 0.16, -h * 0.84);
    g.lineTo(-w * 0.16, -h); g.lineTo(w * 0.16, -h); g.lineTo(w * 0.16, -h * 0.84); g.quadraticCurveTo(w / 2, -h * 0.78, w / 2, -h * 0.62); g.lineTo(w / 2, 0); g.closePath();
    g.globalAlpha = 0.92; g.fill(); g.globalAlpha = 1; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.45)"; g.fillRect(-w / 2 + 2, -h * 0.6, 2, h * 0.5);
    g.fillStyle = "#e8e2d0"; g.fillRect(-w / 2 + 1, -h * 0.42, w - 2, h * 0.2);
    g.fillStyle = "#c9ced6"; g.fillRect(-w * 0.12, -h - 6, w * 0.24, 6); g.strokeRect(-w * 0.12, -h - 6, w * 0.24, 6);
    g.restore();
  }
  function creaBotellas() {
    const c = document.createElement("canvas"); c.width = BW; c.height = BH; const g = c.getContext("2d");
    g.translate(-XB, -YB);
    for (const b of BOT) dibBotella(g, b, b.x, YB + 84);
    return c;
  }
  function creaFrente() {
    const c = document.createElement("canvas"); c.width = BW; c.height = BH; const g = c.getContext("2d");
    g.translate(-XB, -YB); g.lineJoin = "round";
    // barra de acero de las botellas
    g.fillStyle = "#9aa3ad"; g.fillRect(XB, YB + 72, BW, 9); g.fillStyle = "#e3e8ee"; g.fillRect(XB, YB + 73, BW, 2);
    g.strokeStyle = "#1a1d22"; g.lineWidth = 1.5; g.strokeRect(XB, YB + 72, BW, 9);
    // balda inferior: vasos boca abajo, cubitera, coctelera y limas
    const yb = YB + 168;
    g.fillStyle = "#2e1408"; g.fillRect(XB, yb, BW, 10); g.fillStyle = "#6b3417"; g.fillRect(XB, yb, BW, 3);
    for (let i = 0; i < 7; i++) {           // pilas de vasos
      const x = XB + 60 + i * 26;
      for (let k = 0; k < 3; k++) { const y = yb - 4 - k * 9;
        g.fillStyle = "rgba(210,236,250,0.35)"; g.strokeStyle = "rgba(230,245,255,0.8)"; g.lineWidth = 1.2;
        g.beginPath(); g.moveTo(x - 10, y); g.lineTo(x - 8, y - 18); g.lineTo(x + 8, y - 18); g.lineTo(x + 10, y); g.closePath(); g.fill(); g.stroke(); }
    }
    // cubitera de acero con hielo
    const cx = XB + 330;
    g.fillStyle = "#8d97a2"; g.strokeStyle = "#1a1d22"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(cx - 52, yb - 46); g.lineTo(cx + 52, yb - 46); g.lineTo(cx + 46, yb); g.lineTo(cx - 46, yb); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#dfe6ec"; g.fillRect(cx - 50, yb - 46, 100, 5);
    g.fillStyle = "rgba(235,250,255,0.95)"; g.strokeStyle = "rgba(90,140,170,0.9)"; g.lineWidth = 1.2;
    for (let i = 0; i < 8; i++) { g.save(); g.translate(cx - 40 + i * 11, yb - 49 - (i % 3) * 3); g.rotate(hash(i + 9) - 0.5); g.beginPath(); g.rect(-5, -5, 10, 10); g.fill(); g.stroke(); g.restore(); }
    // coctelera
    const kx = XB + 430;
    g.fillStyle = "#c9ced6"; g.strokeStyle = "#1a1d22"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(kx - 14, yb); g.lineTo(kx - 11, yb - 44); g.lineTo(kx + 11, yb - 44); g.lineTo(kx + 14, yb); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(kx - 10, yb - 44); g.lineTo(kx - 6, yb - 58); g.lineTo(kx + 6, yb - 58); g.lineTo(kx + 10, yb - 44); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.7)"; g.fillRect(kx - 8, yb - 40, 3, 34);
    // cuenco con limas
    const lx = XB + 520;
    for (let i = 0; i < 4; i++) { g.fillStyle = "#7cc43a"; g.strokeStyle = "#2a4a0c"; g.lineWidth = 1.5; g.beginPath(); g.arc(lx - 16 + i * 11, yb - 20 - (i % 2) * 5, 8, 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.fillStyle = "#e8dcc0"; g.strokeStyle = "#2a1a06"; g.lineWidth = 2; g.beginPath(); g.moveTo(lx - 30, yb - 18); g.quadraticCurveTo(lx, yb + 2, lx + 30, yb - 18); g.closePath(); g.fill(); g.stroke();
    // panel bajo hasta el suelo
    const pa = g.createLinearGradient(0, yb + 10, 0, H + 60); pa.addColorStop(0, "#3a1a0c"); pa.addColorStop(1, "#1c0b05");
    g.fillStyle = pa; g.fillRect(XB, yb + 10, BW, H + 60 - yb - 10);
    g.strokeStyle = "rgba(0,0,0,0.4)"; g.lineWidth = 2; for (let x = XB + 30; x < W + 40; x += 70) { g.beginPath(); g.moveTo(x, yb + 18); g.lineTo(x, H + 60); g.stroke(); }
    // canto de la encimera: madera pulida con el borde de latón
    const ca = g.createLinearGradient(0, YB, 0, YB + 18); ca.addColorStop(0, "#8a4524"); ca.addColorStop(0.35, "#5a2812"); ca.addColorStop(1, "#2c1107");
    g.fillStyle = ca; g.fillRect(XB, YB, BW, 18);
    g.fillStyle = "rgba(255,220,170,0.55)"; g.fillRect(XB, YB + 1, BW, 2);
    g.fillStyle = "#c9a14a"; g.fillRect(XB, YB + 18, BW, 4); g.fillStyle = "#f2d690"; g.fillRect(XB, YB + 18, BW, 1.5);
    g.strokeStyle = "#140703"; g.lineWidth = 2; g.beginPath(); g.moveTo(XB, YB); g.lineTo(W + 40, YB); g.stroke();
    // trapo de rayas colgando del canto
    const tx = XB + 470;
    g.fillStyle = "#f3ead6"; g.strokeStyle = "#2a1a06"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(tx, YB + 4); g.lineTo(tx + 34, YB + 4); g.lineTo(tx + 36, YB + 70); g.quadraticCurveTo(tx + 18, YB + 76, tx - 2, YB + 68); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#3a7ac9"; g.fillRect(tx + 1, YB + 46, 34, 4); g.fillRect(tx + 1, YB + 54, 34, 3);
    // remate del extremo izquierdo de la barra
    const ex = g.createLinearGradient(XB, 0, XB + 18, 0); ex.addColorStop(0, "#2c1107"); ex.addColorStop(0.4, "#7a3a1e"); ex.addColorStop(1, "#3d170b");
    g.fillStyle = ex; g.beginPath(); g.moveTo(XB, H + 60); g.lineTo(XB, YB + 6); g.quadraticCurveTo(XB, YB, XB + 6, YB); g.lineTo(XB + 18, YB); g.lineTo(XB + 18, H + 60); g.closePath(); g.fill();
    g.strokeStyle = "#140703"; g.lineWidth = 2; g.beginPath(); g.moveTo(XB, H + 60); g.lineTo(XB, YB + 6); g.quadraticCurveTo(XB, YB, XB + 6, YB); g.stroke();
    return c;
  }
  // temblor de las botellas tras el golpe
  const traqueteo = t => t >= T.golpe ? Math.exp(-(t - T.golpe) * 6) * suave(fase(t, T.golpe, T.golpe + 0.02)) : 0;
  function dibBarra(g, t) {
    const tq = traqueteo(t);
    if (tq <= 0.01) { g.drawImage(barraEntera, XB, YB); return; }      // sin temblor: una sola copia
    g.drawImage(barra, XB, YB);
    g.save(); g.translate(ruido(t * 60) * 2 * tq, -Math.abs(ruido(t * 55 + 4)) * 3 * tq); g.drawImage(botellas, XB, YB); g.restore();
    g.drawImage(frente, XB, YB);
  }

  /* ================= objetos ================= */
  // Copa de cóctel (martini rosa) en píxeles: origen en el tallo, donde se agarra. Base a +22, borde a −34.
  const COPA = { base: 22, borde: -34, ancho: 19 };
  function copa(g, gx, gy, nivel) {             // (gx, gy): gravedad en las coordenadas de la copa
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const cuenco = () => { g.beginPath(); g.moveTo(-COPA.ancho, COPA.borde); g.lineTo(COPA.ancho, COPA.borde); g.lineTo(1.5, -5); g.lineTo(-1.5, -5); g.closePath(); };
    // líquido: semiplano perpendicular a la gravedad
    g.save(); cuenco(); g.clip();
    const a = Math.atan2(gx, gy);
    g.rotate(-a); g.fillStyle = "#ff5a8c"; g.fillRect(-60, nivel, 120, 80);
    g.fillStyle = "rgba(255,200,220,0.8)"; g.fillRect(-60, nivel, 120, 2.2);
    g.restore();
    cuenco(); g.fillStyle = "rgba(220,240,255,0.25)"; g.fill(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.6; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 1.3; g.beginPath(); g.moveTo(-COPA.ancho + 5, COPA.borde + 3); g.lineTo(-4, -9); g.stroke();
    // tallo y pie
    g.fillStyle = "rgba(225,242,255,0.7)"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.4;
    g.beginPath(); g.rect(-1.4, -5, 2.8, COPA.base - 2); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(0, COPA.base - 1.5, 9, 2.2, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    // guinda con palillo
    g.strokeStyle = "#6b4a14"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-8, COPA.borde + 8); g.lineTo(9, COPA.borde - 8); g.stroke();
    g.fillStyle = "#c8102e"; g.strokeStyle = "#3a0408"; g.beginPath(); g.arc(-3, COPA.borde + 4, 4, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.8)"; g.beginPath(); g.arc(-4.4, COPA.borde + 2.8, 1.1, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // Florecilla (margarita) en píxeles: origen en el tallo (agarre), cabeza a −34, tallo hasta +12.
  const FLOR_CAB = { x: 0, y: -34 };
  function flor(g, t) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 4.2; g.beginPath(); g.moveTo(0, 12); g.quadraticCurveTo(2, -10, 0, -30); g.stroke();
    g.strokeStyle = "#3f9a3a"; g.lineWidth = 2.2; g.stroke();
    // hojas
    for (const [y, s] of [[-6, 1], [2, -1]]) {
      g.fillStyle = "#4fb045"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.3;
      g.beginPath(); g.moveTo(0.5, y); g.quadraticCurveTo(s * 8, y - 8, s * 13, y - 4); g.quadraticCurveTo(s * 7, y + 1, 0.5, y); g.fill(); g.stroke();
    }
    // pétalos
    g.save(); g.translate(FLOR_CAB.x, FLOR_CAB.y);
    for (let i = 0; i < 10; i++) {
      g.save(); g.rotate(i * Math.PI / 5 + 0.1);
      g.fillStyle = "#ffffff"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.2;
      g.beginPath(); g.ellipse(0, -8.5, 3.4, 6.5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.restore();
    }
    g.fillStyle = "#ffc93a"; g.strokeStyle = "#7a4a06"; g.lineWidth = 1.4; g.beginPath(); g.arc(0, 0, 5, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.arc(-1.6, -1.6, 1.4, 0, Math.PI * 2); g.fill();
    g.restore();
    g.restore();
  }
  // Peine de bolsillo en píxeles: lomo a lo largo de y (de −8 a +34, sale por debajo del puño), púas hacia +x.
  function peine(g) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3.4;
    for (let i = 0; i < 11; i++) { const y = -4 + i * 3.6; g.beginPath(); g.moveTo(3, y); g.lineTo(11, y); g.stroke(); }
    g.strokeStyle = "#e0465a"; g.lineWidth = 1.6;
    for (let i = 0; i < 11; i++) { const y = -4 + i * 3.6; g.beginPath(); g.moveTo(3, y); g.lineTo(10.5, y); g.stroke(); }
    g.fillStyle = "#e0465a"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(-4, -8); g.lineTo(4, -8); g.lineTo(4, 36); g.quadraticCurveTo(0, 38, -4, 34); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.5)"; g.fillRect(-2.6, -6, 1.6, 36);
    g.restore();
  }

  /* ================= Guillermo ================= */
  const CG = {
    chulo: E({ mx: 0.9, my: 0.05, orig: 0, sonr: 0.4, ancho: 0.9, sd: 5, gd: 0.06, si: -2, gi: -0.05 }),
    embobado: E({ mx: 0.95, my: 0.0, orig: 0, sonr: 0.62, ancho: 0.92, sd: 16, si: 16, gd: 0.15, gi: 0.15, iris: 1.12, rub: 0.5 }),
    espejo: E({ mx: -0.85, my: -0.1, orig: 0, sonr: 0.5, ancho: 0.95, sd: 10, si: 6, gd: 0.1, gi: 0.04 }),
    peina: E({ mx: -0.85, my: -0.3, orig: 0, sonr: 0.15, ancho: 0.6, abre: 8, lengua: 1, sd: 12, si: 4, gd: 0.12 }),
    guapo: E({ mx: -0.85, my: -0.05, orig: 0, sonr: 0.8, ancho: 1, c: 0.3, h: 0.6, sd: 14, si: 14, gd: 0.2, gi: 0.2 }),
    sopla: E({ mx: 0.6, my: 0.45, orig: 0, sonr: -0.1, ancho: 0.45, abre: 9, mof: 0.5, sd: 8, si: 8 }),
    huele: E({ mx: 0.7, my: 0.6, orig: 0, sonr: 0, ancho: 0.55, c: 0.35, sd: 14, si: 14 }),
    asco: E({ mx: 0.3, my: -0.5, orig: 0, sonr: -0.5, ancho: 0.8, abre: 14, lengua: 1, c: 1, z: 1, sd: -8, si: -8, gd: -0.15, gi: -0.15, rojo: 0 }),
    mareo: E({ mx: 0, my: -0.7, orig: 0, sonr: -0.25, ancho: 0.7, abre: 10, lengua: 0.6, c: 0.55, esp: 0.0, sd: 18, si: 6 }),
    recupera: E({ mx: -0.6, my: 0, orig: 0, sonr: 0.2, ancho: 0.85, sd: 8, si: 8, c: 0.1 }),
    musculo: E({ mx: -0.85, my: -0.1, orig: 0, sonr: 0.85, ancho: 1.05, abre: 8, sd: 20, si: 20, gd: 0.22, gi: 0.22 }),
    lento: E({ mx: 0.9, my: -0.05, orig: 0, sonr: 0.55, ancho: 0.92, c: 0.42, sd: 6, si: 14, gd: -0.05, gi: 0.18 }),
    guino: E({ mx: 0.9, my: -0.1, orig: 0, sonr: 0.8, ancho: 0.95, wi: 1, h: 0.5, sd: 8, si: -4, gd: 0.1, gi: -0.1 }),
    apoya: E({ mx: 0.9, my: -0.1, orig: 0, sonr: 0.62, ancho: 0.95, c: 0.28, sd: 12, si: 4, gd: 0.15, gi: 0 }),
    falla: E({ mx: 0.4, my: 0.5, orig: 0, sonr: -0.3, ancho: 0.62, abre: 16, iris: 0.8, sd: 24, si: 24, gd: 0.1, gi: 0.1 }),
    camara: E({ mx: -0.85, my: -0.1, orig: 0, sonr: 0.35, ancho: 1.05, abre: 4, iris: 0.85, sd: 22, si: 18, gd: 0.2, gi: 0.12, dientes: 1 }),
    cae: E({ mx: 0.1, my: -0.9, orig: 0, sonr: -0.4, ancho: 0.7, abre: 40, iris: 0.75, sd: 28, si: 28, gd: 0.1, gi: 0.1 }),
    timido: E({ mx: 0.85, my: -0.75, orig: 0, sonr: 0.7, ancho: 0.8, abre: 0, sd: 16, si: 16, gd: 0.3, gi: 0.3, rub: 1, rojo: 0.25 })
  };
  const GUION_CG = [
    [T.mira, T.mira + 0.25, "embobado"], [T.camara, T.camara + 0.25, "espejo"], [T.peina0 - 0.1, T.peina0 + 0.1, "peina"],
    [T.peina1, T.peina1 + 0.12, "guapo"], [T.aliento, T.aliento + 0.2, "sopla"], [T.huele - 0.05, T.huele + 0.12, "huele"],
    [T.asco, T.asco + 0.08, "asco"], [T.asco + 0.3, T.asco + 0.5, "mareo"], [T.recupera, T.recupera + 0.3, "recupera"],
    [T.musculo, T.musculo + 0.25, "musculo"], [T.anda0, T.anda0 + 0.4, "lento"], [T.guino - 0.05, T.guino + 0.1, "guino"],
    [T.guino + 0.3, T.guino + 0.45, "apoya"], [T.falla, T.falla + 0.1, "falla"], [T.cuelga, T.cuelga + 0.12, "camara"],
    [T.cae - 0.02, T.cae + 0.08, "cae"], [T.asoma - 0.2, T.asoma + 0.1, "timido"]
  ];
  const PARP_G = [0.3, 2.95, 4.95, 6.9, 7.95, 13.55];

  // cuerpo: dx (px de pantalla), pel (hoja, + agacha), torso, cab; manos respecto a su hombro (hoja) y dedos
  const P0G = { dx: 0, pel: 0, torso: 0, cab: 0, cx: 0, cy: 300, ca: 0, cmu: -1.75, cp: 0, cpu: 0.3, cix: 0, cre: 0,
    lx: 0, ly: 280, la: 0, lmu: -1.75, lp: 0, lpu: 0.3, lix: 0, lmd: 0, lre: 0 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    bolsillos: CuG({}),
    peine: CuG({ torso: -0.03, cab: -0.04, cp: 1, cpu: 0.35, cix: 0.3, cre: 0.25 }),
    aliento: CuG({ torso: 0.03, cab: 0.06, lp: 1, lpu: 0.75, lix: 0.75, lmd: 0.7, lre: 0.65 }),
    asco: CuG({ torso: -0.14, pel: 46, cab: -0.16, lp: 1, lpu: 0.9, lix: 1, lmd: 1, lre: 1 }),
    mareo: CuG({ torso: -0.08, pel: 30, cab: -0.06, lp: 1, lpu: 0.9, lix: 1, lmd: 1, lre: 1 }),
    erguido: CuG({ torso: -0.02, cab: -0.02, lp: 1, lpu: 0.5, lix: 0.5, lmd: 0.5, lre: 0.45 }),
    musculo: CuG({ torso: -0.04, pel: 10, cab: -0.05, cx: -200, cy: -170, cmu: 1.5, cp: 1, cpu: 0, cix: 0, cre: 0,
      lx: 132, ly: -168, lmu: 1.6, lp: 1, lpu: 0, lix: 0, lmd: 0, lre: 0 }),
    lento: CuG({ torso: -0.05, cab: -0.07 }),
    guino: CuG({ torso: -0.03, cab: -0.04 }),
    apoya: CuG({ torso: 0.14, pel: 50, dx: 4, cab: 0.04, cp: 1, cpu: 0.55, cix: 0.65, cre: 0.55 }),
    falla: CuG({ torso: 0.24, pel: 150, dx: 0, cab: 0.04, cp: 1, cpu: 0.7, cix: 0.8, cre: 0.6, lx: 90, ly: -90, lmu: 2.2, lp: 1, lpu: 1, lix: 1, lmd: 1, lre: 1 }),
    cuelga: CuG({ torso: 0.16, pel: 230, dx: -4, cab: -0.06, cx: -170, cy: -150, cmu: 1.2, cp: 1, cpu: 1, cix: 1, cre: 1, lx: 170, ly: -330, lmu: 1.9, lp: 1, lpu: 1, lix: 1, lmd: 1, lre: 1 }),
    cae: CuG({ torso: -0.35, pel: 820, dx: -6, cab: -0.1, cx: -20, cy: -330, cmu: 1.6, cp: 1, cpu: 1, cix: 1, cre: 1, lx: 30, ly: -320, lmu: 1.6, lp: 1, lpu: 1, lix: 1, lmd: 1, lre: 1 }),
    tirado: CuG({ torso: -0.35, pel: 820, dx: -6, cab: 0, cx: -10, cy: 250, cp: 1, cpu: 0.5, cix: 0.5, cre: 0.5, lx: 20, ly: 250, lp: 1, lpu: 0.5, lix: 0.5, lmd: 0.5, lre: 0.5 }),
    gira: CuG({ torso: 1.1, pel: 820, dx: -6, cab: 0.5, cx: -10, cy: 250, cp: 1, cpu: 0.5, cix: 0.5, cre: 0.5, lx: 20, ly: 250, lp: 1, lpu: 0.5, lix: 0.5, lmd: 0.5, lre: 0.5 }),
    agachado: CuG({ torso: 1.2, pel: 430, dx: -2, cab: 0.55, cx: -10, cy: 250, cp: 1, cpu: 0.5, cix: 0.5, cre: 0.5, lx: 20, ly: 250, lp: 1, lpu: 0.5, lix: 0.5, lmd: 0.5, lre: 0.5 }),
    abajo: CuG({ torso: 1.1, pel: 720, dx: -6, cab: 0.5, cx: -10, cy: 250, cp: 1, cpu: 0.5, cix: 0.5, cre: 0.5, lx: 20, ly: 250, lp: 1, lpu: 0.5, lix: 0.5, lmd: 0.5, lre: 0.5 }),
    bajo: CuG({ torso: 0.08, pel: 800, dx: 6, cab: 0.06, cx: -10, cy: 250, cp: 1, cpu: 0.5, cix: 0.5, cre: 0.5, lx: 20, ly: 250, lp: 1, lpu: 0.5, lix: 0.5, lmd: 0.5, lre: 0.5 }),
    asoma: CuG({ torso: 0.08, pel: 460, dx: 6, cab: 0.06, cp: 1, cpu: 0.45, cix: 0.45, cre: 0.4, lp: 1, lpu: 0.45, lix: 0.45, lmd: 0.4, lre: 0.4 })
  };
  const GUION_G = [
    [T.peine0, T.peine0 + 0.35, "peine"], [T.guarda, T.guarda + 0.3, "bolsillos"],
    [T.aliento, T.aliento + 0.3, "aliento"], [T.asco, T.asco + 0.1, "asco", salida], [T.asco + 0.3, T.asco + 0.55, "mareo"],
    [T.recupera, T.recupera + 0.35, "erguido"],
    [T.musculo, T.musculo + 0.3, "musculo"], [T.musculo1, T.anda0 + 0.15, "lento"],
    [T.guino - 0.1, T.guino + 0.2, "guino"], [T.apoya, T.falla, "apoya"], [T.falla, T.cuelga, "falla", salida], [T.cuelga, T.cuelga + 0.15, "cuelga"],
    [T.cae, T.golpe, "cae", entrada], [T.golpe, T.golpe + 0.35, "tirado"], [T.golpe + 0.4, T.golpe + 0.7, "gira"], [T.golpe + 0.72, T.sube - 0.05, "agachado"],
    [T.suelta + 0.1, T.suelta + 0.45, "abajo"], [T.suelta + 0.45, T.asoma - 0.05, "bajo"],
    [T.asoma, T.asoma + 0.42, "asoma", salida]
  ];
  const CODO_C = 204, ANTEBRAZO_C = G.BRAZO_C_L - 204;   // brazo cercano: hombro→codo y codo→muñeca (hoja)
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };

  // paseo a cámara lenta: cuatro zancadas largas y flotantes (pie lejano, cercano, lejano, cercano)
  // pisadas igual de separadas (d) empezando por el pie de atrás; la última junta los pies
  const PIES0 = { cerca: XG0 - 30, lejos: XG0 + 32 }, PASO = (XG1 - XG0 - 62) / 3;
  const P1 = PIES0.lejos + PASO, P2 = P1 + PASO, P3 = P2 + PASO, P4 = XG1 + 32;
  const ZANCADAS = [
    { lado: "cerca", t0: T.anda0 + 0.05, t1: T.anda0 + 0.66, a: PIES0.cerca, b: P1 },
    { lado: "lejos", t0: T.anda0 + 0.66, t1: T.anda0 + 1.27, a: PIES0.lejos, b: P2 },
    { lado: "cerca", t0: T.anda0 + 1.27, t1: T.anda0 + 1.88, a: P1, b: P3 },
    { lado: "lejos", t0: T.anda0 + 1.88, t1: T.anda0 + 2.45, a: P2, b: P4 }
  ];
  function pieG(lado, t) {
    let x = lado === "cerca" ? PIES0.cerca : PIES0.lejos, y = 0, ang = 0, arco = 0;
    for (const z of ZANCADAS) {
      if (z.lado !== lado) continue;
      if (t >= z.t1) { x = z.b; continue; }
      if (t > z.t0) { const u = fase(t, z.t0, z.t1); x = lerp(z.a, z.b, suave(u)); arco = Math.sin(Math.PI * u); y = -64 * Math.pow(arco, 0.8); ang = lerp(0.35, -0.3, suave(u)) * arco * 1.4; }
      break;
    }
    return { x, y, ang, arco };
  }
  const xG = t => { const u = fase(t, T.anda0 + 0.05, T.anda1 - 0.1); return lerp(XG0, XG1, 0.45 * u + 0.55 * suave(u)); };
  // combo del peinado: tres pasadas hacia atrás por el lado del pelo (puntos del retrato)
  const PEINE_A = { x: 760, y: 330 }, PEINE_B = { x: 560, y: 470 };
  function pasada(t) {
    const k = fase(t, T.peina0, T.peina1); if (k <= 0 || k >= 1) return { u: 0, contacto: 0 };
    const v = (k * 3) % 1;
    // ida pegada al pelo (60 %) y vuelta separada (40 %)
    if (v < 0.6) return { u: suave(v / 0.6), contacto: 1 };
    return { u: 1 - suave((v - 0.6) / 0.4), contacto: 0 };
  }

  function poseG(t) {
    const b = linea(GUION_G, CUER_G, "bolsillos", t);
    const respira = Math.sin(t * 2.2 + 0.3);
    const x = xG(t) + b.dx;
    // contoneo a cámara lenta: hombros que ruedan y pelvis que sube y baja con cada zancada
    const pc = pieG("cerca", t), pl = pieG("lejos", t);
    const anda = tramo(t, T.anda0, T.anda0 + 0.2) * (1 - tramo(t, T.anda1 - 0.1, T.anda1 + 0.15));
    const zanc = Math.max(pc.arco, pl.arco);
    const fasePaso = (x - XG0) / ((XG1 - XG0) / 2) * Math.PI;
    const p = {
      x, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 - 16 * zanc * anda + 10 * anda },
      torso: b.torso + 0.05 * Math.sin(fasePaso) * anda, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.03 * Math.sin(fasePaso + 0.8) * anda, dx: 0, dy: 0, esc: { x: 1, y: 1 } }, tirasLimpias: true, ikContinuo: true
    };
    // asco: la cabeza da un respingo; mareo: se balancea; recupera: sacude la cabeza
    p.cabeza.ang -= 0.1 * campana(t, T.asco - 0.02, T.asco + 0.25);
    const mar = tramo(t, T.asco + 0.2, T.asco + 0.35) * (1 - tramo(t, T.recupera, T.recupera + 0.2));
    p.torso += 0.06 * Math.sin((t - T.asco) * 6) * mar; p.cabeza.ang += 0.07 * Math.sin((t - T.asco) * 6 + 1) * mar;
    p.cabeza.ang += 0.12 * Math.sin((t - T.recupera) * 30) * campana(t, T.recupera + 0.05, T.recupera + 0.4);
    // pies (en la hoja, relativos a la pelvis)
    for (const [lado, f] of [["cerca", pc], ["lejos", pl]]) {
      let tob = { x: G.PELVIS.x + (f.x - x) / S, y: TOB_G[lado] + f.y };
      if (f.ang > 0) { const pv = { x: tob.x + G.PUNTA.x, y: tob.y + G.PUNTA.y }, r = G.rotP({ x: -G.PUNTA.x, y: -G.PUNTA.y }, f.ang); tob = { x: pv.x + r.x, y: pv.y + r.y }; }
      else if (f.ang < 0) { const pv = { x: tob.x + G.TALON.x, y: tob.y + G.TALON.y }, r = G.rotP({ x: -G.TALON.x, y: -G.TALON.y }, f.ang); tob = { x: pv.x + r.x, y: pv.y + r.y }; }
      p.piernas[lado] = { tob, ang: f.ang };
    }
    // cara
    const e = linea(GUION_CG, CG, "chulo", t);
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.rojo = e.rojo;
    p.sudor = 0.8 * campana(t, T.cuelga, T.cae + 0.2) + 0.5 * tramo(t, T.asoma, T.asoma + 0.3);
    // manos: posición base respecto a los hombros, desde/hacia los bolsillos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    let c = { x: hc.x + b.cx, y: hc.y + b.cy }, l = { x: hl.x + b.lx, y: hl.y + b.ly };
    c = mezcla(Tr(BOLS_G.c), c, clamp(b.cp * 1.5)); l = mezcla(Tr(BOLS_G.l), l, clamp(b.lp * 1.5));
    let cang = b.ca, lang = b.la, cmu = b.cmu, lmu = b.lmu;
    const H = G.cabeza(p), aHojaG = q => G.aHoja(p, q), pant = q => G.aPantalla(p, q);
    // peine: la mano cercana recorre el lado del pelo
    const kp = tramo(t, T.peine0 + 0.15, T.peina0) * (1 - tramo(t, T.guarda, T.guarda + 0.28));
    if (kp > 0.0005) {
      const ps = pasada(t), A = H.a(PEINE_A), B = H.a(PEINE_B);
      const sep = 22 * (1 - ps.contacto);                     // a la vuelta se separa del pelo
      const q = { x: lerp(A.x, B.x, ps.u) - sep, y: lerp(A.y, B.y, ps.u) - sep * 0.6 + 30 };
      c = mezcla(c, q, kp); cmu = lerp(cmu, 1.2, kp); cang = lerp(cang, -0.5, kp);
    }
    // aliento: mano lejana ahuecada delante de la boca, luego a la nariz, y abanica
    const bo = G.boca(p);
    const ka = tramo(t, T.aliento, T.aliento + 0.3) * (1 - tramo(t, T.asco, T.asco + 0.12));
    if (ka > 0.0005) {
      const subir = tramo(t, T.huele - 0.12, T.huele);
      const q = { x: bo.x + 46 - 10 * subir, y: bo.y + 6 - 48 * subir };
      l = mezcla(l, q, ka); lmu = lerp(lmu, -2.9, ka); lang = lerp(lang, 0, ka);
    }
    const kab = tramo(t, T.asco + 0.05, T.asco + 0.2) * (1 - tramo(t, T.recupera, T.recupera + 0.25));
    if (kab > 0.0005) {
      const w = Math.sin((t - T.asco) * 22);
      const q = { x: bo.x + 110 + 18 * w, y: bo.y - 10 + 6 * w };
      l = mezcla(l, q, kab); lmu = lerp(lmu, -2.2 + 0.4 * w, kab);
    }
    // apoya el codo en la barra: el antebrazo, tumbado y hacia Carla como el suyo, baja hasta el canto…
    // y sigue bajando: la barra está más lejos de lo que creía
    const kap = tramo(t, T.apoya, T.apoya + 0.36) * (1 - tramo(t, T.cuelga + 0.05, T.cae));
    if (kap > 0.0005) {
      const u = fase(t, T.apoya + 0.36, T.cuelga);
      const yF = lerp(YB - 30, YB + 46, u * u), hunde = tramo(t, T.falla, T.cuelga);
      const q = aHojaG({ x: x + 4 + 6 * u, y: yF - 3 });
      c = mezcla(c, q, kap); cmu = lerp(cmu, Math.PI - 0.08 - 0.5 * hunde, kap); cang = lerp(cang, 0, kap);
    }
    // flor: la mano cercana sube por encima del canto, la tumba sobre la barra y vuelve a bajar
    const kf = tramo(t, T.sube - 0.15, T.sube) * (1 - tramo(t, T.suelta + 0.05, T.suelta + 0.35));
    let angFlor = 0;
    if (kf > 0.0005) {
      const sube = tramo(t, T.sube, T.deja - 0.1, salida), tumba = tramo(t, T.deja - 0.12, T.suelta);
      const yv = lerp(YB + 70, YB - 42, sube);
      angFlor = -Math.PI / 2 * tumba;                        // la tumba con el tallo hacia Carla
      const base = { x: FLOR_X + 4 * tumba, y: lerp(yv, YB - 4, tumba) };
      const q = aHojaG(base);
      c = mezcla(c, q, kf); cmu = lerp(cmu, 1.55 - 0.75 * angFlor, kf); cang = lerp(cang, angFlor, kf);
    }
    // se asoma: las dos manos agarradas al canto
    const ks = tramo(t, T.asoma + 0.05, T.asoma + 0.4);
    if (ks > 0.0005) {
      c = mezcla(c, aHojaG({ x: x - 26, y: YB - 6 }), ks); l = mezcla(l, aHojaG({ x: x + 50, y: YB - 6 }), ks);
      cmu = lerp(cmu, 1.4, ks); lmu = lerp(lmu, 1.7, ks);
    }
    // con el codo en la barra el brazo cercano dobla al revés (codo abajo); se cambia con el brazo casi estirado
    const doblaC = -1;
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: doblaC, puno: b.cp, dedos: D(b.cpu, b.cix, b.cre, b.cre) };
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: -1, puno: b.lp, dedos: D(b.lpu, b.lix, b.lmd, b.lre) };
    // objetos en la mano cercana: peine y flor
    const conPeine = t > T.peine0 + 0.12 && t < T.guarda + 0.22;
    const muPeine = cmu;
    if (conPeine) p.manoCerca.objeto = g => { g.save(); g.scale(1 / UG, 1 / UG); g.rotate(muPeine); peine(g); g.restore(); };
    if (t > T.sube - 0.15 && t < T.suelta) p.manoCerca.objeto = g => { g.save(); g.scale(1 / UG, 1 / UG); flor(g, t); g.restore(); };
    if (conPeine || (t > T.sube - 0.15 && t < T.suelta)) p.manoCerca.dedos = D(0.35, 0.35, 0.3, 0.3);
    else if (t >= T.suelta && t < T.suelta + 0.5) { const k = tramo(t, T.suelta, T.suelta + 0.1) * (1 - tramo(t, T.suelta + 0.3, T.suelta + 0.5));
      p.manoCerca.dedos = D(lerp(0.35, 0.9, k), lerp(0.35, 0.95, k), lerp(0.3, 0.9, k), lerp(0.3, 0.85, k)); }
    return p;
  }
  const FLOR_X = 696;

  /* ================= Carla ================= */
  const CC = {
    copa: E({ mx: 0.45, my: 0.55, orig: 0, sonr: 0.3, ancho: 0.9, c: 0.3, sd: 4, si: 4 }),
    bebe: E({ mx: 0.4, my: 0.6, orig: 0, sonr: 0, ancho: 0.62, c: 0.75, sd: 8, si: 8 }),
    ojeada: E({ mx: 0.95, my: 0.05, orig: 0, sonr: 0.42, ancho: 0.92, c: 0.18, sd: 4, si: 15, gd: -0.04, gi: 0.15 }),
    risa: E({ mx: 0.6, my: 0.2, orig: 0, sonr: 0.95, ancho: 1, abre: 10, c: 0.9, h: 1, sd: 10, si: 10, gd: 0.15, gi: 0.15, rub: 0.4 }),
    ojosArriba: E({ mx: 0.3, my: -0.9, orig: 0, sonr: 0.5, ancho: 0.9, c: 0.25, sd: 14, si: 14, gd: 0.1, gi: 0.1 }),
    interes: E({ mx: 0.95, my: 0.1, orig: 0, sonr: 0.62, ancho: 0.92, c: 0.42, h: 0.2, sd: 6, si: 12, gi: 0.1, rub: 0.3 }),
    pestanea: E({ mx: 0.95, my: 0.05, orig: 0, sonr: 0.75, ancho: 0.95, c: 0.2, sd: 14, si: 16, gd: 0.12, gi: 0.14, rub: 0.55 }),
    sorpresa: E({ mx: 0.85, my: 0.45, orig: 0, sonr: -0.2, ancho: 0.55, abre: 22, iris: 0.85, sd: 22, si: 22, gd: 0.1, gi: 0.1 }),
    mira: E({ mx: 0.9, my: 0.75, orig: 0, sonr: 0.05, ancho: 0.7, abre: 4, sd: 16, si: 18, gd: 0.08, gi: 0.12 }),
    flor: E({ mx: 0.9, my: 0.6, orig: 0, sonr: 0.55, ancho: 0.9, sd: 20, si: 20, gd: 0.15, gi: 0.15, rub: 0.4 }),
    huele: E({ mx: 0.6, my: 0.2, orig: 0, sonr: 0.8, ancho: 0.95, c: 1, h: 1, sd: 12, si: 12, gd: 0.15, gi: 0.15, rub: 0.85 }),
    guino: E({ mx: 0.9, my: 0.7, orig: 0, sonr: 0.85, ancho: 0.95, wd: 1, h: 0.6, sd: 6, si: 14, gd: -0.05, gi: 0.15, rub: 0.7 })
  };
  const GUION_CC = [
    [T.sorbos[0][0] + 0.05, T.sorbos[0][0] + 0.3, "bebe"], [T.sorbos[0][1] - 0.2, T.sorbos[0][1], "copa"],
    [T.peina0 + 0.2, T.peina0 + 0.4, "ojeada"], [T.peina1 - 0.1, T.peina1 + 0.15, "copa"],
    [T.asco + 0.12, T.asco + 0.3, "risa"], [T.recupera + 0.2, T.recupera + 0.4, "copa"],
    [T.musculo + 0.25, T.musculo + 0.45, "ojosArriba"], [T.anda0 + 0.1, T.anda0 + 0.4, "interes"],
    [T.sorbos[1][0] + 0.05, T.sorbos[1][0] + 0.3, "bebe"], [T.sorbos[1][1] - 0.2, T.sorbos[1][1], "interes"],
    [T.guino + 0.05, T.guino + 0.2, "pestanea"], [T.falla + 0.05, T.falla + 0.15, "sorpresa"],
    [T.asomaC + 0.15, T.asomaC + 0.35, "mira"], [T.sube + 0.15, T.sube + 0.4, "flor"],
    [T.huele2, T.huele2 + 0.2, "huele"], [T.guinoC - 0.2, T.guinoC, "mira"], [T.guinoC, T.guinoC + 0.12, "guino"]
  ];
  const PARP_C = [2.2, 3.4, 5.6, 8.92, 9.12, 11.25, 12.35];

  // Carla: torso y cabeza; manos con objetivos en pantalla (la copa sobre la barra, la flor…)
  const P0C = { pel: 0, torso: 0.04, cab: 0.04 };
  const CUER_C = {
    quieta: P0C,
    bebe: Object.assign({}, P0C, { torso: 0.02, cab: -0.12 }),
    risa: Object.assign({}, P0C, { torso: -0.04, cab: -0.08 }),
    inclinada: Object.assign({}, P0C, { torso: 0.1, cab: 0.06 }),
    asoma: Object.assign({}, P0C, { pel: -4, torso: 0.14, cab: 0.1 }),
    huele: Object.assign({}, P0C, { torso: 0.06, cab: -0.05 })
  };
  const GUION_C = [];
  for (const [a, b] of T.sorbos) GUION_C.push([a, a + 0.3, "bebe"], [b - 0.25, b, a > 5 ? "inclinada" : "quieta"]);
  GUION_C.push([T.asco + 0.1, T.asco + 0.3, "risa"], [T.recupera + 0.2, T.recupera + 0.45, "quieta"]);
  GUION_C.sort((u, v) => u[0] - v[0]);
  GUION_C.push([T.anda0 + 0.2, T.anda0 + 0.6, "inclinada"], [T.asomaC, T.asomaC + 0.4, "asoma"], [T.coge + 0.1, T.huele2, "huele"]);
  GUION_C.sort((u, v) => u[0] - v[0]);
  const COPA_Y = YB - COPA.base;
  const T_COPA = T.deja + 0.2;                 // Carla deja la copa en la barra
  const PECHO = { x: 762, y: 304 };            // la copa en alto, delante del pecho, mientras mira por encima               // altura del agarre con la copa apoyada en la barra
  // inclinación de la copa (pantalla, + horario) al beber y cuánto queda
  const sorbo = t => { let k = 0; for (const [a, b] of T.sorbos) k = Math.max(k, tramo(t, a, a + 0.32) * (1 - tramo(t, b - 0.3, b))); return k; };
  const nivelCopa = t => -27 + 3 * tramo(t, T.sorbos[0][0] + 0.3, T.sorbos[0][1] - 0.3) + 3 * tramo(t, T.sorbos[1][0] + 0.3, T.sorbos[1][1] - 0.3);

  function poseC(t, sinFlor) {
    const b = linea(GUION_C, CUER_C, "quieta", t);
    const respira = Math.sin(t * 2.0 + 1.1);
    const ri = tramo(t, T.asco + 0.12, T.asco + 0.25) * (1 - tramo(t, T.recupera + 0.15, T.recupera + 0.45));
    const sacude = ri * Math.abs(Math.sin((t - T.asco) * 15));
    const respingo = t >= T.golpe ? Math.exp(-(t - T.golpe) * 8) * suave(fase(t, T.golpe, T.golpe + 0.03)) : 0;
    const p = {
      x: XC, suelo: SUELO, s: S, espejo: true,
      pelvis: { x: Ca.PELVIS.x, y: Ca.PELVIS.y + b.pel + respira * 1.1 - 6 * sacude - 10 * respingo },
      torso: b.torso + 0.03 * sacude, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab - 0.04 * sacude, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      tirasLimpias: true, ikContinuo: true
    };
    const ty = Ca.SUELO - Ca.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: Ca.PELVIS.x - 62, y: ty }, ang: 0 };
    p.piernas.lejos = { tob: { x: Ca.PELVIS.x + 74, y: ty - 8 }, ang: 0 };
    const d = (linea(GUION_C, CUER_C, "quieta", t).torso - linea(GUION_C, CUER_C, "quieta", t - 0.1).torso) / 0.1;
    p.pelo = { inercia: clamp(-0.4 * d, -1, 1), viento: 0.08 * Math.sin(t * 1.1) };
    const e = linea(GUION_CC, CC, "copa", t);
    p.cara = cara(e, parpadeo(t, PARP_C, 0.13));
    p.rojo = 0;
    // mano cercana (a la derecha en pantalla): el antebrazo apoyado en la barra
    const cerca = { x: XC - 18, y: YB - 7 };
    // mano lejana (hacia Guillermo): la copa; luego se apoya en el canto para asomarse; luego la flor
    const kb = sorbo(t), tau = -0.55 * kb;                  // al beber la copa se inclina hacia su boca
    const lab = Ca.aPantalla(p, Ca.boca(p));
    const reposoCopa = { x: GX, y: COPA_Y };
    const salto = 5 * respingo;                              // la copa da un respingo con el golpe
    let lejos, angL = 0;
    const mxL = escala(1 / UC);
    const angH = tau => p.espejo ? -tau : tau;
    let muL = -2.35;
    if (t < T_COPA) {
      // con la copa: sorbos, y al asomarse la sube al pecho; la deja en la barra cuando sale la flor
      angL = angH(tau);
      const m1 = Ca.aHoja(p, { x: reposoCopa.x, y: reposoCopa.y - salto });
      lejos = m1;
      if (kb > 0.0005) {
        // el borde de la copa del lado de la boca va a sus labios
        const borde = { x: COPA.ancho - 2, y: COPA.borde + 1 };
        const m0 = manoHacia(Ca, p, angL, mxL, borde, { x: lab.x - 4, y: lab.y - 4 });
        lejos = mezcla(m1, m0, suave(kb));
      }
      const kLev = tramo(t, T.asomaC, T.asomaC + 0.32) * (1 - tramo(t, T.deja - 0.15, T_COPA - 0.02));
      if (kLev > 0.0005) {
        const pecho = { x: PECHO.x + 1.5 * Math.sin(t * 2.0 + 1.1), y: PECHO.y + respira * 1.2 };
        lejos = mezcla(lejos, Ca.aHoja(p, pecho), kLev); muL = lerp(muL, -3.88, kLev);
      }
    } else {
      // suelta la copa y, cuando la mano de Guillermo se ha ido, coge la flor
      const suelta = Ca.aHoja(p, { x: reposoCopa.x + 4, y: reposoCopa.y - 6 * tramo(t, T_COPA, T_COPA + 0.15) });
      const kf = tramo(t, T.coge - 0.3, T.coge);
      lejos = suelta;
      if (kf > 0.0005 && !sinFlor) {
        const F = floreEnMundo();
        const aqui = aplica(F, { x: 0, y: 0 });
        const arco = { x: 0, y: -14 * Math.sin(Math.PI * kf) };          // pasa por encima de la flor
        const m = mezcla(suelta, Ca.aHoja(p, aqui), kf);
        lejos = { x: m.x, y: m.y + arco.y / (S * Ca.K) };
        angL = 0;
        const kh = tramo(t, T.coge + 0.08, T.huele2);
        if (kh > 0.0005) {
          const Q = cache("Q", () => qFlor());
          const mx = mul(escala(1 / UC), Q);
          // cabeza de la flor hacia la nariz, inclinada hacia arriba
          const nariz = Ca.aPantalla(p, Ca.cabeza(p).a({ x: 910, y: 552 }));
          // la huele (cabeza de la flor justo bajo la nariz) y luego la baja un poco para mirarle
          const baja = tramo(t, T.guinoC - 0.45, T.guinoC - 0.1);
          const angObj = angParaFlor(p, Q, -Math.PI / 2 - 0.5 + 0.25 * baja);
          const m2 = manoHacia(Ca, p, angObj, mx, FLOR_CAB, { x: nariz.x - 15 + 4 * baja, y: nariz.y + 16 + 22 * baja });
          lejos = mezcla(lejos, m2, suave(kh)); angL = lerp(0, angObj, suave(kh));
          muL = lerp(muL, -3.88 - angObj, suave(kh));
        }
      }
    }
    p.manoCerca = Object.assign({ ang: 0, mu: 2.5, dobla: 1, puno: 1, dedos: D(0.45, 0.6, 0.55, 0.5) }, Ca.aHoja(p, cerca));
    // con la flor el codo sale hacia fuera (se cambia en T.coge, con el brazo estirado hacia la barra)
    p.manoLejos = { x: lejos.x, y: lejos.y, ang: angL, mu: muL, dobla: t >= T.coge && !sinFlor ? -1 : 1, puno: 1, dedos: D(0.4, 0.38, 0.34, 0.3) };
    if (t >= T_COPA && t < T.coge) { const k = tramo(t, T_COPA, T_COPA + 0.12) * (1 - tramo(t, T.coge - 0.12, T.coge));
      p.manoLejos.dedos = D(lerp(0.4, 0.75, k), lerp(0.38, 0.8, k), lerp(0.34, 0.75, k), lerp(0.3, 0.7, k)); }
    // objetos de la mano lejana
    if (t < T_COPA) {
      const ang = angL, gL = { x: Math.sin(ang), y: Math.cos(ang) }, niv = nivelCopa(t);
      p.manoLejos.objeto = g => { g.save(); g.scale(1 / UC, 1 / UC); copa(g, gL.x, gL.y, niv); g.restore(); };
    } else if (t >= T.coge && !sinFlor) {
      const Q = cache("Q", () => qFlor());
      p.manoLejos.objeto = g => { g.save(); g.scale(1 / UC, 1 / UC); g.transform(Q[0], Q[1], Q[2], Q[3], Q[4], Q[5]); flor(g, t); g.restore(); };
    }
    return p;
  }
  // ángulo de la mano de Carla para que la flor apunte en la dirección `dir` (pantalla)
  function angParaFlor(p, Q, dir) {
    const v = aplica([Q[0], Q[1], Q[2], Q[3], 0, 0], { x: 0, y: -1 });         // dirección de la cabeza en el objeto
    // en pantalla: dir = Dm·R(ang)·v, con Dm = diag(−1, 1) si va en espejo
    let a = (p.espejo ? Math.PI - dir : dir) - Math.atan2(v.y, v.x);
    while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI;
    return a;
  }
  // flor tumbada en la barra: matriz fija con la postura de Guillermo al soltarla
  function floreEnMundo() {
    return cache("F", () => { const p = poseG(T.suelta - 1e-4); return mul(matMano(G, p, p.manoCerca), escala(1 / UG)); });
  }
  function qFlor() {
    const p = poseC(T.coge, true);
    const F = floreEnMundo();
    p.manoLejos.x = Ca.aHoja(p, aplica(F, { x: 0, y: 0 })).x; p.manoLejos.y = Ca.aHoja(p, aplica(F, { x: 0, y: 0 })).y; p.manoLejos.ang = 0;
    return mul(inv(mul(matMano(Ca, p, p.manoLejos), escala(1 / UC))), F);
  }
  // copa apoyada en la barra tras soltarla
  function copaEnMundo() {
    return cache("C", () => { const p = poseC(T_COPA - 1e-4, true); return mul(matMano(Ca, p, p.manoLejos), escala(1 / UC)); });
  }

  /* ================= efectos ================= */
  function estrellita(g, x, y, r, a) {
    g.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.28 : r, an = a + i * Math.PI / 4; g.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); } g.closePath();
  }
  function destello(g, t, t0, x, y, tam) {
    const k = fase(t, t0, t0 + 0.45); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = Math.sin(Math.PI * k); estrellita(g, x, y, tam * (0.6 + 0.6 * k), k * 1.2);
    g.fillStyle = "#fffbe0"; g.fill(); g.strokeStyle = "#e0a020"; g.lineWidth = 1.3; g.stroke(); g.restore();
  }
  // foco y purpurina mientras se acerca a cámara lenta
  function focoLento(g, t, pG) {
    const k = tramo(t, T.anda0 - 0.1, T.anda0 + 0.4) * (1 - tramo(t, T.anda1 - 0.1, T.guino + 0.2)); if (k <= 0.01) return;
    const c = G.aPantalla(pG, G.tronco(pG)({ x: 250, y: 420 }));
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createRadialGradient(c.x, c.y, 10, c.x, c.y, 210); gr.addColorStop(0, `rgba(255,214,150,${0.28 * k})`); gr.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(c.x, c.y, 210, 0, Math.PI * 2); g.fill();
    g.restore();
    g.save();
    for (let i = 0; i < 12; i++) {
      const ph = ((t - T.anda0) * 0.35 + hash(i + 300)) % 1, ang = hash(i + 310) * Math.PI * 2;
      const x = c.x + Math.cos(ang) * (60 + 70 * hash(i + 320)) + 20 * Math.sin(t * 0.9 + i), y = c.y - 60 + Math.sin(ang) * 120 - 40 * ph;
      const a = k * Math.sin(Math.PI * ph);
      g.globalAlpha = a; estrellita(g, x, y, 4 + 3 * hash(i + 330), t * 0.8 + i); g.fillStyle = "#fff6d6"; g.fill();
    }
    g.restore();
  }
  // vaho en la mano y líneas de mal aliento
  function aliento(g, t, pG) {
    const bo = G.aPantalla(pG, G.boca(pG));
    const k = fase(t, T.sopla, T.sopla + 0.32);
    if (k > 0 && k < 1) { g.save(); g.globalAlpha = 0.6 * Math.sin(Math.PI * k); g.fillStyle = "#eef6ff";
      for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(bo.x + 6 + 9 * k + i * 4, bo.y + 2 - i * 3, 3 + 4 * k, 0, Math.PI * 2); g.fill(); } g.restore(); }
    const ks = tramo(t, T.huele - 0.05, T.asco) * (1 - tramo(t, T.recupera - 0.2, T.recupera + 0.2)); if (ks <= 0.01) return;
    const m = G.aPantalla(pG, pG.manoLejos);
    g.save(); g.strokeStyle = `rgba(150,210,60,${0.85 * ks})`; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const ph = ((t - T.huele) * 1.3 + i / 3) % 1, x0 = m.x - 12 + i * 12, y0 = m.y - 14 - 46 * ph;
      g.globalAlpha = Math.sin(Math.PI * ph);
      g.beginPath(); for (let k2 = 0; k2 <= 10; k2++) { const yy = y0 - k2 * 3, xx = x0 + 4 * Math.sin(k2 * 0.9 + t * 8 + i); if (k2) g.lineTo(xx, yy); else g.moveTo(xx, yy); } g.stroke();
    }
    g.restore();
  }
  // golpe detrás de la barra: polvo que sube por encima del canto y estrellitas
  function golpeTrasBarra(g, t) {
    const k = fase(t, T.golpe, T.golpe + 0.9); if (k <= 0 || k >= 1) return;
    const x0 = XG1 - 30;
    g.save();
    for (let i = 0; i < 7; i++) {
      const u = clamp(k * 1.3 - i * 0.05), d = (i - 3) * 30 * (0.5 + 0.5 * salida(u));
      g.globalAlpha = 0.55 * (1 - u); g.fillStyle = i % 2 ? "#d8c9b0" : "#b8a78e";
      g.beginPath(); g.arc(x0 + d, YB - 4 - 52 * salida(u) * (0.6 + 0.4 * hash(i + 90)), 12 + 20 * u, 0, Math.PI * 2); g.fill();
    }
    g.restore();
    const ke = fase(t, T.golpe + 0.05, T.golpe + 0.85);
    if (ke > 0 && ke < 1) {
      g.save();
      for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * 0.7, r = 30 + 40 * salida(ke);
        g.globalAlpha = 1 - ke; estrellita(g, x0 + Math.cos(a) * r, YB - 10 + Math.sin(a) * r * 0.9, 7, ke * 4 + i); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 1.5; g.strokeStyle = "#0b0a0e"; g.stroke(); }
      g.restore();
    }
  }
  // corazoncitos de Carla al oler la flor
  function corazones(g, t, pC) {
    const k = tramo(t, T.huele2 + 0.1, T.huele2 + 0.3) * (1 - tramo(t, T.fin, T.fin + 0.4)); if (k <= 0.01) return;
    const c = Ca.aPantalla(pC, Ca.cabeza(pC).a({ x: 880, y: 360 }));
    g.save();
    for (let i = 0; i < 4; i++) {
      const ph = ((t - T.huele2) * 0.6 + i / 4) % 1, x = c.x - 30 + i * 18 + 6 * Math.sin(t * 3 + i), y = c.y - 10 - 60 * ph, r = 5 + 2 * hash(i + 40);
      g.globalAlpha = k * Math.sin(Math.PI * ph);
      g.fillStyle = "#ff6f91"; g.strokeStyle = "#5a0a1a"; g.lineWidth = 1.3;
      g.beginPath(); g.moveTo(x, y + r * 0.9); g.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.6, y - r * 1.4, x, y - r * 0.5);
      g.bezierCurveTo(x + r * 0.6, y - r * 1.4, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); g.fill(); g.stroke();
    }
    g.restore();
  }
  // brillo del peinado y del guiño, y de los bíceps
  function brillos(g, t, pG) {
    const H = G.cabeza(pG);
    const pelo = G.aPantalla(pG, H.a({ x: 700, y: 300 }));
    destello(g, t, T.brillo, pelo.x, pelo.y, 11);
    const ojo = G.aPantalla(pG, H.a({ x: 930, y: 600 }));
    destello(g, t, T.guino + 0.05, ojo.x + 12, ojo.y - 6, 9);
    for (const [m, d] of [[pG.manoCerca, 0], [pG.manoLejos, 0.12]]) {
      const q = G.aPantalla(pG, m); destello(g, t, T.musculo + 0.3 + d, q.x, q.y - 14, 9);
    }
  }

  /* ================= escena ================= */
  const pose = t => ({ g: poseG(t), l: poseC(t) });
  // cámara: plano general para los preparativos; durante el paseo se acerca a la barra; al final, a los dos
  function camara(t) {
    const a = tramo(t, T.anda0 - 0.2, T.guino + 0.1, suave), b = tramo(t, T.coge - 0.5, T.asoma + 0.3, suave);
    const golpe = t >= T.golpe ? Math.exp(-(t - T.golpe) * 7) * suave(fase(t, T.golpe, T.golpe + 0.03)) : 0;
    const k = 1.08 + 0.3 * a + 0.1 * b, x = 480 + 180 * a + 34 * b, y = 300 - 55 * a + 8 * b;
    const mx = W / 2 / k, my = H / 2 / k;                     // que no se vea el borde del decorado
    return { k, x: clamp(x, mx - 40, W + 40 - mx), y: clamp(y, my - 60, H + 60 - my), tb: 4 * golpe };
  }

  class GuillermoCarlaLigue extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Ca.listo()) return;
      if (!fondo) {
        fondo = creaFondo(); barra = creaBarra(); botellas = creaBotellas(); frente = creaFrente();
        barraEntera = document.createElement("canvas"); barraEntera.width = BW; barraEntera.height = BH;
        const b = barraEntera.getContext("2d"); b.drawImage(barra, 0, 0); b.drawImage(botellas, 0, 0); b.drawImage(frente, 0, 0);
      }
      const pG = poseG(t), pC = poseC(t);
      const luz = tramo(t, NEGRO_INICIO, 0.85, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (cam.tb > 0.05) g.translate(ruido(t * 45) * cam.tb, ruido(t * 45 + 13) * cam.tb * 0.7);
      g.drawImage(fondo, -40, -60);
      // sombra de Guillermo en el suelo mientras está a la vista
      if (pG.x < XB + 60) { g.save(); g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse(pG.x + 4, SUELO + 2, 84, 8, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
      focoLento(g, t, pG);
      Ca.dibujar(g, pC, t);
      G.dibujar(g, pG, t);
      dibBarra(g, t);
      // objetos sobre la barra
      if (t >= T_COPA) { const M = copaEnMundo(); g.save(); g.transform(M[0], M[1], M[2], M[3], M[4], M[5]); copa(g, 0, 1, nivelCopa(t)); g.restore(); }
      if (t >= T.suelta && t < T.coge) { const M = floreEnMundo(); g.save(); g.transform(M[0], M[1], M[2], M[3], M[4], M[5]); flor(g, t); g.restore(); }
      golpeTrasBarra(g, t);
      aliento(g, t, pG);
      brillos(g, t, pG);
      corazones(g, t, pC);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00042", nombre: "Guillermo y Carla · El ligue", crear: () => new GuillermoCarlaLigue() });
  window.__A2D_00042 = { pose, poseG, poseC, T, DUR };
})();
