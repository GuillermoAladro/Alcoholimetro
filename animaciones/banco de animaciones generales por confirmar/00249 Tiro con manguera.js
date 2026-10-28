"use strict";
/*
 * 00249 · TIRO CON MANGUERA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Concurso de puntería en el patio del parque: cinco latas encima de una valla. Marcos, a la izquierda, apunta con
 * la manguera y las tumba una tras otra (¡TOC! ×5) y sopla la boquilla como un pistolero. Las latas vuelven a
 * subir (¡DING!) y le toca a Guillermo, a la derecha: abre la llave, la manguera se hincha (¡GLUP!) y se le escapa
 * dando latigazos y mojándolo todo; Marcos se agacha. La boquilla acaba apuntándole a la cara: ¡DIANA! Empapado,
 * Guillermo escupe un chorrito… y tumba una lata.
 */
(() => {
const CT = cacheTexto();
const ESC = 1.45;
const XM = 190, XG = 845;
const LATAS = [446, 491, 536, 581, 626], Y_LATA = 352;           // base de las latas (encima de la valla)
const T_APUNTA = 0.55, T_DISPARA = 1.0, GOLPES = [1.3, 1.62, 1.95, 2.28, 2.62], T_CORTA = 2.82, T_SOPLA = 2.95;
const T_DING = 3.45, T_COGE = 3.65, T_APUNTA_G = 4.0, T_LLAVE = 4.55, T_SUELTA = 5.05, T_DIANA = 6.85, T_FLOJA = 7.45;
const T_ESCUPE = 8.45, T_TOC_G = 8.72, T_APAGA = 10.0, DUR = 10.55;
const HIDRANTE_M = [-30, PIES - 6], HIDRANTE_G = [1000, PIES - 30];

const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

/** Gotas de agua (memoria fija). */
class Agua {
  constructor(max) { this.max = max; this.n = 0; this.d = new Float32Array(max * 6); }
  nueva(x, y, vx, vy, vida, tam) {
    if (this.n >= this.max) return;
    const o = this.n++ * 6, d = this.d; d[o] = x; d[o + 1] = y; d[o + 2] = vx; d[o + 3] = vy; d[o + 4] = vida; d[o + 5] = tam;
  }
  actualizar(dt) {
    const d = this.d; let i = 0;
    while (i < this.n) {
      const o = i * 6;
      d[o + 4] -= dt;
      if (d[o + 4] <= 0) { const u = (this.n - 1) * 6; for (let k = 0; k < 6; k++) d[o + k] = d[u + k]; this.n--; continue; }
      d[o + 3] += 980 * dt; d[o] += d[o + 2] * dt; d[o + 1] += d[o + 3] * dt;
      if (d[o + 1] > PIES + 6) { d[o + 1] = PIES + 6; d[o + 3] *= -0.25; d[o + 2] *= 0.4; }
      i++;
    }
  }
  dibujar(g) {
    const d = this.d;
    g.save(); g.fillStyle = "#b4e8ff";
    for (let i = 0; i < this.n; i++) {
      const o = i * 6, s = d[o + 5];
      g.globalAlpha = Math.min(1, d[o + 4] * 3) * 0.9;
      g.beginPath(); g.ellipse(d[o], d[o + 1], s * 0.65, s, Math.atan2(d[o + 3], d[o + 2]) + Math.PI / 2, 0, 6.283); g.fill();
    }
    g.restore();
  }
}
/** Chorro de agua por una curva (inicio, control, fin). */
function chorro(g, a, c, b, ancho, t) {
  g.save(); g.lineCap = "round"; g.lineJoin = "round";
  const ruta = () => { g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(c[0], c[1], b[0], b[1]); };
  ruta(); g.strokeStyle = "rgba(70,160,255,.45)"; g.lineWidth = ancho * 1.8; g.stroke();
  ruta(); g.strokeStyle = "rgba(180,230,255,.95)"; g.lineWidth = ancho; g.stroke();
  g.setLineDash([14, 10]); g.lineDashOffset = -t * 600;
  ruta(); g.strokeStyle = "rgba(255,255,255,.95)"; g.lineWidth = ancho * 0.35; g.stroke();
  g.restore();
}
/** Manguera gorda. */
function manguera(g, pts, bulto) {
  g.save(); g.lineCap = "round"; g.lineJoin = "round";
  const ruta = () => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); if (pts.length === 4) g.bezierCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1], pts[3][0], pts[3][1]); else g.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]); };
  ruta(); g.strokeStyle = "#5a1a10"; g.lineWidth = 15; g.stroke();
  ruta(); g.strokeStyle = "#d8402a"; g.lineWidth = 11; g.stroke();
  ruta(); g.strokeStyle = "rgba(255,200,180,.5)"; g.lineWidth = 3; g.stroke();
  g.restore();
  if (bulto) {
    // un bulto que recorre la manguera (la presión que llega)
    const [u, k] = bulto;
    const P0 = pts[0], P1 = pts[1], P2 = pts[2], P3 = pts[3], v = 1 - u;
    const x = v * v * v * P0[0] + 3 * v * v * u * P1[0] + 3 * v * u * u * P2[0] + u * u * u * P3[0];
    const y = v * v * v * P0[1] + 3 * v * v * u * P1[1] + 3 * v * u * u * P2[1] + u * u * u * P3[1];
    g.fillStyle = "#d8402a"; g.strokeStyle = "#5a1a10"; g.lineWidth = 2.5;
    g.beginPath(); g.ellipse(x, y, 13 * k, 13 * k, 0, 0, 6.283); g.fill(); g.stroke();
  }
}
/** Boquilla (unidades de pantalla o de avatar): de `a` (atrás) a `b` (punta). */
function boquilla(g, a, b, e = 1) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  g.save(); g.translate(a[0], a[1]); g.rotate(ang);
  const gr = g.createLinearGradient(0, -6 * e, 0, 6 * e);
  gr.addColorStop(0, "#fff3b0"); gr.addColorStop(0.45, "#d9a020"); gr.addColorStop(1, "#6a4a00");
  g.fillStyle = "#2a2a30"; rectR(g, -4 * e, -6.5 * e, 14 * e, 13 * e, 3 * e); g.fill();
  g.fillStyle = gr; g.beginPath(); g.moveTo(8 * e, -6 * e); g.lineTo(L, -3.4 * e); g.lineTo(L, 3.4 * e); g.lineTo(8 * e, 6 * e); g.closePath(); g.fill();
  g.fillStyle = "#e11e14"; rectR(g, L * 0.45, -8 * e, 6 * e, 16 * e, 2 * e); g.fill();
  g.restore();
}
function lata(g, x, y, rot, col) {
  g.save(); g.translate(x, y); g.rotate(rot);
  const gr = g.createLinearGradient(-15, 0, 15, 0);
  gr.addColorStop(0, "#6a727a"); gr.addColorStop(0.45, "#f4f6f8"); gr.addColorStop(1, "#5a6168");
  g.fillStyle = gr; rectR(g, -15, -21, 30, 42, 4); g.fill();
  g.fillStyle = col; g.fillRect(-15, -12, 30, 22);
  g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(-9, -12, 4, 22);
  g.fillStyle = "#fffdf5"; g.beginPath(); g.arc(2, -1, 6, 0, 6.283); g.fill();
  g.fillStyle = col; g.beginPath(); g.arc(2, -1, 3, 0, 6.283); g.fill();
  g.fillStyle = "#c9d0d6"; g.beginPath(); g.ellipse(0, -21, 15, 3, 0, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = 1.5; rectR(g, -15, -21, 30, 42, 4); g.stroke();
  g.restore();
}
const COL_LATA = ["#e11e14", "#2f7ae8", "#f2c21b", "#2bb14a", "#ff3d84"];

class TiroManguera extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(200);
    this.agua = new Agua(380);
    this.latas = LATAS.map((x) => ({ x, y: Y_LATA - 21, vx: 0, vy: 0, rot: 0, vr: 0, cae: false }));
  }
  luz() { return tramo(this.t, 0.02, 0.45) * (1 - tramo(this.t, T_APAGA, DUR - 0.03)); }
  /** Dónde está la boquilla loca de Guillermo y hacia dónde apunta. */
  loca(t) {
    const u = t - T_SUELTA;
    if (t < T_SUELTA) return null;
    let x = 770 + 150 * Math.sin(u * 4.1) * Math.min(1, u * 3) - 60 * Math.min(1, u * 2);
    let y = 300 + 110 * Math.sin(u * 6.3 + 0.8) * Math.min(1, u * 3) - 40;
    let ang = u * 11 + Math.sin(u * 7) * 1.2;
    const k = eInOut(tramo(t, T_DIANA - 0.35, T_DIANA));
    x = lerp(x, 700, k); y = lerp(y, 286, k); ang = lerp(ang, Math.round(ang / 6.283) * 6.283, k);
    const kc = eIn(tramo(t, T_FLOJA, T_FLOJA + 0.5));
    y = lerp(y, PIES - 10, kc); x = lerp(x, 720, kc); ang = lerp(ang, ang + 0.8, kc);
    return { x, y, ang };
  }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [84, 122], manoI: [40, 128], brazoIDelante: true };
    let syM = 1, ym = PIES, yg = PIES, giroG = 0;
    // ---- Marcos
    this.boqM = null;
    const apunta = eInOut(tramo(t, T_APUNTA, T_DISPARA - 0.1));
    let rec = 0;
    for (const x of GOLPES) rec = Math.max(rec, Math.max(0, 1 - Math.abs(t - x + 0.05) * 8));
    if (t < T_DING) {
      M.manoD = mezcla([84, 126], [88, 114 - 2 * rec], apunta); M.manoI = mezcla([40, 132], [44, 124], apunta);
      M.cara = t > T_APUNTA ? "guino" : "sonrisa"; M.rc = -0.05 * apunta;
      if (t > T_CORTA) M.cara = "risa";
      if (t > T_SOPLA) {
        // sopla la boquilla como un pistolero
        const k = Math.sin(tramo(t, T_SOPLA, T_DING) * Math.PI);
        M.manoD = mezcla([88, 114], [62, 70], k); M.manoI = mezcla([44, 124], [40, 92], k); M.cara = k > 0.5 ? "guino" : "risa"; M.rc = 0.1 * k;
      }
      const dD = M.manoD, dI = M.manoI, dir = [dD[0] - dI[0], dD[1] - dI[1]], L = Math.hypot(dir[0], dir[1]);
      this.boqM = { a: dI, b: [dD[0] + dir[0] / L * 22, dD[1] + dir[1] / L * 22] };
    } else {
      // deja la manguera en el suelo y mira
      M.manoD = [67, 152]; M.manoI = [6, 152]; M.brazoIDelante = false; M.cara = "sonrisa"; M.rc = 0.08;
      if (t > T_LLAVE) { M.cara = "sorpresa"; }
      if (t > T_SUELTA && t < T_DIANA) {
        // se agacha tapándose el casco
        syM = 1 - 0.1 * eOut(tramo(t, T_SUELTA, T_SUELTA + 0.2));
        M.manoD = [70, 34]; M.manoI = [6, 34]; M.brazoIDelante = true; M.cara = Math.sin(t * 5) > 0 ? "sorpresa" : "dormido"; M.rc = 0.05 * Math.sin(t * 9);
      }
      if (t > T_DIANA) {
        syM = 1; M.cara = t < T_DIANA + 0.4 ? "sorpresa" : "risa"; M.rc = 0.12;
        if (t > T_DIANA + 0.4) { const s = Math.sin(t * 16); M.manoD = [50, 128 + 3 * s]; M.manoI = [24, 128 - 3 * s]; M.brazoIDelante = true; ym -= Math.abs(Math.sin(t * 9)) * 6; M.rc = 0.1 + 0.06 * Math.sin(t * 9); }
        if (t > T_TOC_G) { const c = Math.abs(Math.sin((t - T_TOC_G) * 14)); M.manoD = [46 + 8 * c, 100]; M.manoI = [30 - 8 * c, 100]; M.cara = "risa"; ym = PIES; }
      }
    }
    // ---- Guillermo
    this.boqG = null;
    if (t < T_COGE) {
      G.cara = "sonrisa"; G.rc = -0.1;
      let golpe = 0; for (const x of GOLPES) if (t > x && t < x + 0.25) golpe = 1;
      if (golpe) { G.cara = "sorpresa"; yg -= 6; }
      if (t > T_CORTA) { const c = Math.abs(Math.sin((t - T_CORTA) * 14)); G.manoD = [46 + 8 * c, 104]; G.manoI = [30 - 8 * c, 104]; G.brazoIDelante = true; G.cara = "risa"; }
    } else {
      // coge la manguera, apunta con aires de campeón
      const kc = Math.sin(tramo(t, T_COGE - 0.15, T_COGE + 0.25) * Math.PI);
      yg += 0; G.brazoIDelante = true;
      G.manoI = [-22, 122]; G.manoD = [38, 130]; G.cara = "guino"; G.rc = 0.06;
      if (t < T_COGE + 0.25) { G.manoI = mezcla([9, 160], [-22, 122], tramo(t, T_COGE, T_COGE + 0.25)); G.manoD = mezcla([70, 158], [38, 130], tramo(t, T_COGE, T_COGE + 0.25)); }
      void kc;
      if (t > T_LLAVE) { G.cara = "sorpresa"; G.rc = 0.12 * Math.sin(t * 30) * (t < T_SUELTA ? 1 : 0); }
      if (t < T_SUELTA) {
        const dI = G.manoI, dD = G.manoD, dir = [dI[0] - dD[0], dI[1] - dD[1]], L = Math.hypot(dir[0], dir[1]);
        this.boqG = { a: dD, b: [dI[0] + dir[0] / L * 22, dI[1] + dir[1] / L * 22] };
      }
    }
    const mG0 = matAv(XG, PIES, ESC);
    const L = this.loca(t);
    if (L && t < T_DIANA) {
      // intenta agarrarla
      const q = enAv(mG0, [L.x, L.y]);
      const s = Math.sin(t * 13);
      G.manoI = mezcla([-26, 60], q, 0.5 + 0.2 * s); G.manoD = [96 + 6 * s, 50 - 8 * s]; G.brazoIDelante = true;
      G.cara = "sorpresa"; G.puntas = 1; G.rc = clamp((L.x - XG) / 400, -0.3, 0.3);
      yg -= Math.abs(Math.sin(t * 9)) * 14;
      G.piernaI = [-6 * Math.max(0, s), 0.1 * s]; G.piernaD = [-6 * Math.max(0, -s), 0.1 * s];
    }
    if (t >= T_DIANA) {
      const k = eOut(tramo(t, T_DIANA, T_DIANA + 0.15)) * (1 - eInOut(tramo(t, T_FLOJA, T_FLOJA + 0.4)));
      G.cara = t < T_FLOJA + 0.3 ? "dormido" : "borracho"; G.rc = -0.22 * k + 0.03 * Math.sin(t * 40) * k; G.puntas = 0;
      G.manoD = [100, 120]; G.manoI = [-24, 120]; G.brazoIDelante = true; giroG = 0.08 * k;
      if (t > T_FLOJA + 0.4) { G.manoD = [74, 150]; G.manoI = [4, 150]; giroG = 0; }
      if (t > T_FLOJA + 0.9) { G.cara = "risa"; G.rc = -0.05; }
      if (t > T_ESCUPE - 0.25) { G.cara = "sorpresa"; G.rc = -0.12; }
      if (t > T_TOC_G) { G.cara = "risa"; const k2 = eOut(tramo(t, T_TOC_G, T_TOC_G + 0.25)); G.manoD = mezcla([74, 150], [98, 30], k2); G.manoI = mezcla([4, 150], [-22, 30], k2); yg -= 30 * Math.sin(tramo(t, T_TOC_G, T_TOC_G + 0.5) * Math.PI); G.rc = 0; }
    }
    const mM = matAv(XM, ym, ESC, 0, 1, syM);
    const mG = matAv(XG, yg, ESC, giroG);
    if (this.boqM) { const b = this.boqM; M.objD = (g) => boquilla(g, b.a, b.b, 0.75); }
    if (this.boqG) { const b = this.boqG; G.objI = (g) => boquilla(g, b.a, b.b, 0.75); }
    return { G, M, mG, mM };
  }
  /** Punto al que apunta el chorro de Marcos. */
  blancoM(t) {
    const i = clamp(Math.floor((t - T_DISPARA) / ((T_CORTA - T_DISPARA) / 5.3)), 0, 4);
    let idx = 0; for (let k = 0; k < 5; k++) if (t > GOLPES[k] - 0.3) idx = k;
    void i;
    const prev = idx > 0 ? LATAS[idx - 1] : LATAS[0] - 30;
    const u = eInOut(tramo(t, GOLPES[idx] - 0.3, GOLPES[idx]));
    return [lerp(prev, LATAS[idx], u) - 4, Y_LATA - 22];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, ag = this.agua;
    const e = this.poses();
    // golpes de Marcos
    GOLPES.forEach((x, i) => this.una("g" + i, t > x, () => {
      const L = this.latas[i];
      L.cae = true; L.vx = azar(260, 360); L.vy = azar(-520, -420); L.vr = azar(8, 14);
      temblar(5, 0.12);
      for (let k = 0; k < 14; k++) ag.nueva(L.x, L.y, azar(-60, 260), azar(-300, -60), azar(0.4, 0.8), azar(3, 6));
    }));
    // las latas vuelven a subir
    this.una("ding", t > T_DING, () => {
      this.latas.forEach((L, i) => { L.x = LATAS[i]; L.y = Y_LATA - 21; L.vx = L.vy = L.rot = L.vr = 0; L.cae = false; L.sube = T_DING + i * 0.05; });
      for (let k = 0; k < 10; k++) { const a = azar(-Math.PI, 0), v = azar(100, 220); p.nueva(P.CHISPA, 536, Y_LATA - 30, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.5), azar(5, 8)); }
    });
    // chorro de Marcos: salpica en la lata
    if (t > T_DISPARA && t < T_CORTA) {
      const b = this.blancoM(t);
      for (let k = 0; k < 3; k++) ag.nueva(b[0], b[1], azar(-40, 220), azar(-220, -20), azar(0.3, 0.6), azar(2.5, 5));
    }
    // la manguera loca
    this.una("suelta", t > T_SUELTA, () => { temblar(12, 0.3); });
    const L = this.loca(t);
    if (L && t < T_FLOJA) {
      const dx = Math.cos(L.ang), dy = Math.sin(L.ang);
      for (let k = 0; k < 6; k++) { const v = azar(520, 760), d = azar(-0.12, 0.12); ag.nueva(L.x + dx * 24, L.y + dy * 24, (dx - dy * d) * v, (dy + dx * d) * v, azar(0.5, 0.9), azar(3, 6)); }
    }
    this.una("diana", t > T_DIANA, () => {
      temblar(18, 0.45);
      const c = aPant(e.mG, [39, 45]);
      p.nueva(P.DESTELLO, c[0], c[1], 0, 0, 0.35, 200);
      for (let k = 0; k < 50; k++) { const a = azar(-Math.PI, Math.PI), v = azar(150, 460); ag.nueva(c[0] - 20, c[1], Math.cos(a) * v, Math.sin(a) * v - 120, azar(0.5, 1), azar(3, 7)); }
    });
    if (t > T_DIANA && t < T_FLOJA) { const c = aPant(e.mG, [30, 45]); for (let k = 0; k < 5; k++) ag.nueva(c[0], c[1], azar(-200, 160), azar(-260, 60), azar(0.4, 0.8), azar(3, 6)); }
    // empapado: gotea
    if (t > T_DIANA && t < T_APAGA && Math.random() < 30 * dt) { const c = aPant(e.mG, [azar(0, 78), azar(30, 200)]); ag.nueva(c[0], c[1], azar(-10, 10), azar(0, 40), azar(0.5, 0.9), azar(2.5, 4.5)); }
    // escupe un chorrito: tumba la última lata
    if (t > T_ESCUPE && t < T_TOC_G) {
      const b = aPant(e.mG, boca(e.G.rc)), u = tramo(t, T_ESCUPE, T_TOC_G);
      for (let k = 0; k < 2; k++) ag.nueva(lerp(b[0] - 10, LATAS[4] + 10, u), lerp(b[1], Y_LATA - 26, u), azar(-120, -60), azar(-60, 20), azar(0.2, 0.4), azar(2.5, 4));
    }
    this.una("tocG", t > T_TOC_G, () => {
      const L5 = this.latas[4]; L5.cae = true; L5.vx = -260; L5.vy = -420; L5.vr = -10;
      temblar(8, 0.2);
      for (let k = 0; k < 50; k++) p.nueva(P.CONFETI, azar(560, 1000), azar(-40, 0), azar(-40, 40), azar(30, 140), azar(2, 3), azar(9, 13), (Math.random() * 5) | 0);
    });
    for (const L5 of this.latas) if (L5.cae) { L5.vy += 1300 * dt; L5.x += L5.vx * dt; L5.y += L5.vy * dt; L5.rot += L5.vr * dt; }
    p.suelo = () => PIES + 6;
    p.actualizar(dt);
    ag.actualizar(dt);
  }
  fondo() {
    if (CT.has("fondo")) return CT.get("fondo");
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, 420);
    gc.addColorStop(0, "#3c8ee0"); gc.addColorStop(1, "#cfeaf8");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, 520);
    // edificio del parque al fondo
    g.fillStyle = "#b4513a"; g.fillRect(-60, 150, W + 120, 330);
    g.fillStyle = "rgba(90,30,20,.3)";
    for (let y = 150; y < 480; y += 18) for (let x = (y / 18) % 2 ? -60 : -40; x < W + 60; x += 40) { g.fillRect(x, y, 38, 2); g.fillRect(x, y, 2, 18); }
    g.fillStyle = "#e8dcc4"; g.fillRect(-60, 140, W + 120, 14);
    for (const x of [40, 760]) { g.fillStyle = "#e8dcc4"; g.fillRect(x - 8, 196, 236, 290); g.fillStyle = "#2a2c34"; g.fillRect(x, 204, 220, 282); g.fillStyle = "#8a9098"; g.fillRect(x, 204, 220, 40); }
    // banderines
    g.strokeStyle = "#3a2a2a"; g.lineWidth = 2; g.beginPath(); g.moveTo(-60, 40); g.quadraticCurveTo(512, 120, W + 60, 40); g.stroke();
    for (let k = 0; k < 24; k++) {
      const u = (k + 0.5) / 24, px = lerp(-60, W + 60, u), py = (1 - u) * (1 - u) * 40 + 2 * u * (1 - u) * 120 + u * u * 40;
      g.fillStyle = CONFETI[k % 5]; g.beginPath(); g.moveTo(px - 16, py); g.lineTo(px + 16, py); g.lineTo(px, py + 28); g.closePath(); g.fill();
    }
    // suelo
    const gs = g.createLinearGradient(0, 480, 0, H + 60);
    gs.addColorStop(0, "#8a8a80"); gs.addColorStop(1, "#4a4a44");
    g.fillStyle = gs; g.fillRect(-60, 480, W + 120, H + 60 - 480);
    g.fillStyle = "#f2c21b"; g.fillRect(-60, 494, W + 120, 4);
    // hidrantes
    for (const [x, y, s] of [[HIDRANTE_G[0] + 10, PIES + 2, 1], [-36, PIES + 2, 1]]) {
      g.save(); g.translate(x, y); g.scale(s, s);
      const gh = g.createLinearGradient(-18, 0, 18, 0); gh.addColorStop(0, "#7a0c08"); gh.addColorStop(0.45, "#ff5a48"); gh.addColorStop(1, "#7a0c08");
      g.fillStyle = gh; rectR(g, -16, -64, 32, 64, 6); g.fill();
      g.beginPath(); g.ellipse(0, -64, 18, 12, 0, Math.PI, 0); g.fill();
      g.fillStyle = "#c9d0d6"; rectR(g, -22, -10, 44, 10, 3); g.fill();
      g.fillStyle = "#c9d0d6"; g.beginPath(); g.arc(0, -78, 5, 0, 6.283); g.fill();
      g.restore();
    }
    CT.set("fondo", c);
    return c;
  }
  valla(g) {
    // tablas
    for (let x = 424; x < 652; x += 26) {
      const gt = g.createLinearGradient(x, 0, x + 22, 0);
      gt.addColorStop(0, "#c98a4a"); gt.addColorStop(0.5, "#e8b070"); gt.addColorStop(1, "#a86a30");
      g.fillStyle = gt; g.beginPath(); g.moveTo(x, PIES + 2); g.lineTo(x, Y_LATA + 18); g.lineTo(x + 11, Y_LATA + 6); g.lineTo(x + 22, Y_LATA + 18); g.lineTo(x + 22, PIES + 2); g.closePath(); g.fill();
    }
    g.fillStyle = "#8a5426"; g.fillRect(414, Y_LATA, 248, 12); g.fillRect(414, 480, 248, 12);
    g.fillStyle = "rgba(255,220,170,.4)"; g.fillRect(414, Y_LATA, 248, 3);
    // cartel
    g.save(); g.translate(538, 430); g.rotate(-0.03);
    g.fillStyle = "#fffdf5"; rectR(g, -96, -26, 192, 52, 6); g.fill();
    g.strokeStyle = "#e11e14"; g.lineWidth = 4; g.stroke();
    txt(g, "CONCURSO", 0, -2, { tam: 24, peso: 900, fam: FD, color: "#e11e14", esp: 3 });
    txt(g, "DE PUNTERÍA", 0, 19, { tam: 18, peso: 800, fam: FD, color: "#2a2a30", esp: 2 });
    g.restore();
  }
  titulo() {
    if (CT.has("tit")) return CT.get("tit");
    const c = lienzoNuevo(760, 190), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 150);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#ffd0c8"); gr.addColorStop(1, "#ff3a2a");
    txt(g, "¡DIANA!", 386, 152, { tam: 150, peso: 400, fam: FC, color: "#3a0000", esp: 6 });
    txt(g, "¡DIANA!", 380, 146, { tam: 150, peso: 400, fam: FC, color: gr, borde: "#3a0000", bordeAncho: 14, esp: 6, glow: "rgba(255,80,60,.8)", glowTam: 24 });
    CT.set("tit", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses(), a = this.luz();
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    // latas (detrás de la valla cuando caen)
    this.latas.forEach((L, i) => {
      let y = L.y;
      if (L.sube && t < L.sube + 0.35) y += 60 * (1 - eBack(tramo(t, L.sube, L.sube + 0.35)));
      if (y < PIES + 60) lata(g, L.x, y, L.rot, COL_LATA[i]);
    });
    this.valla(g);
    // mangueras
    const mM = e.mM, mG = e.mG;
    if (this.boqM) {
      const a0 = aPant(mM, this.boqM.a);
      manguera(g, [a0, [a0[0] - 10, PIES + 10], [XM - 120, PIES - 4], HIDRANTE_M]);
    } else {
      // en el suelo
      boquilla(g, [XM + 40, PIES - 4], [XM + 96, PIES - 8], 1.1);
      manguera(g, [[XM + 40, PIES - 4], [XM - 20, PIES + 2], [XM - 120, PIES - 4], HIDRANTE_M]);
    }
    const L = this.loca(t);
    let finG = null;
    if (this.boqG) finG = aPant(mG, this.boqG.a);
    else if (L) finG = [L.x - Math.cos(L.ang) * 20, L.y - Math.sin(L.ang) * 20];
    else finG = [XG - 90, PIES - 4];
    const bulto = t > T_LLAVE && t < T_SUELTA ? [tramo(t, T_LLAVE, T_SUELTA), 1 + 0.2 * Math.sin(t * 30)] : null;
    const ptsG = [HIDRANTE_G, [HIDRANTE_G[0] - 80, PIES + 20], L ? [L.x + 160 * Math.sin(t * 5), L.y + 200] : [finG[0] + 60, PIES + 10], finG];
    if (!this.boqG && !L) { boquilla(g, [XG - 90, PIES - 4], [XG - 150, PIES - 10], 1.1); }
    manguera(g, ptsG, bulto);
    // la diana alrededor de la cara
    if (t > T_DIANA && t < T_APAGA) {
      const c = aPant(mG, [37, 42]), k = eBack(tramo(t, T_DIANA, T_DIANA + 0.3)), al = 1 - tramo(t, 9.2, 9.7);
      g.save(); g.globalAlpha = al;
      for (let i = 5; i >= 1; i--) { g.fillStyle = i % 2 ? "#e11e14" : "#fffdf5"; g.beginPath(); g.arc(c[0], c[1], i * 26 * k, 0, 6.283); g.fill(); }
      g.restore();
    }
    pintarAvatar(g, mM, e.M, t);
    pintarAvatar(g, mG, e.G, t);
    // boquilla loca
    if (L) {
      const b = [L.x + Math.cos(L.ang) * 36, L.y + Math.sin(L.ang) * 36];
      if (t < T_FLOJA) {
        const largo = t > T_DIANA - 0.05 ? Math.max(0, aPant(mG, [37, 45])[0] - b[0] - 20) : 210;
        const f = [b[0] + Math.cos(L.ang) * largo, b[1] + Math.sin(L.ang) * largo];
        chorro(g, b, [(b[0] + f[0]) / 2, (b[1] + f[1]) / 2 + 20], f, 10, t);
      }
      boquilla(g, [L.x - Math.cos(L.ang) * 20, L.y - Math.sin(L.ang) * 20], b, 1.1);
    }
    // chorro de Marcos
    if (t > T_DISPARA && t < T_CORTA && this.boqM) {
      const a0 = aPant(mM, this.boqM.b), b = this.blancoM(t), k = tramo(t, T_DISPARA, T_DISPARA + 0.15);
      const f = mezcla(a0, b, k);
      chorro(g, a0, [(a0[0] + f[0]) / 2, Math.min(a0[1], f[1]) - 40 * k], f, 9, t);
    }
    // escupitajo de agua
    if (t > T_ESCUPE && t < T_TOC_G + 0.05) {
      const b = aPant(mG, boca(e.G.rc)), u = tramo(t, T_ESCUPE, T_TOC_G);
      const f = mezcla(b, [LATAS[4] + 10, Y_LATA - 26], u);
      chorro(g, [b[0] - 8, b[1]], [(b[0] + f[0]) / 2, Math.min(b[1], f[1]) - 30], f, 4, t);
    }
    this.agua.dibujar(g);
    this.p.dibujar(g);
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.12, dur) });
      g.restore();
    };
    GOLPES.forEach((x, i) => ono("¡TOC!", LATAS[i] + 10, 262 - (i % 2) * 26, x, 0.4, 38 + i * 3, "#fffdf5", "#1b1b1b", (i % 2 ? -0.12 : 0.12)));
    // marcador de Marcos: cinco rayitas
    if (t > GOLPES[0] && t < T_DING + 0.6) {
      let n = 0; for (const x of GOLPES) if (t > x) n++;
      const al = 1 - tramo(t, T_DING + 0.3, T_DING + 0.6);
      txt(g, n + "/5", XM, 150, { tam: 54, peso: 900, fam: FD, color: "#ffd34d", borde: "#3a2400", bordeAncho: 8, alfa: al });
    }
    ono("¡FIUU!", XM + 30, 220, T_SOPLA + 0.1, 0.5, 34, "#fffdf5", "#1b1b1b", -0.1);
    ono("¡DING!", 540, 250, T_DING, 0.5, 42, "#ffd34d", "#3a2400", 0.06);
    if (t > T_COGE - 0.1 && t < T_LLAVE) bocadillo(g, 770, 120, "¡ME TOCA!", 830, 210, tramo(t, T_COGE - 0.1, T_COGE + 0.05) * (1 - tramo(t, T_LLAVE - 0.15, T_LLAVE)), 36);
    ono("¡GLUP!", 940, 450, T_LLAVE + 0.05, 0.45, 38, "#fffdf5", "#1b1b1b", 0.1);
    ono("¡GLUP!", 880, 420, T_LLAVE + 0.3, 0.4, 44, "#fffdf5", "#1b1b1b", -0.1);
    ono("¡FSSSHH!", 640, 160, T_SUELTA, 0.9, 56, "#2fe3e8", "#06303a", -0.06);
    ono("¡PFFF!", 760, 230, T_ESCUPE, 0.45, 38, "#2fe3e8", "#06303a", -0.08);
    ono("¡TOC!", 650, 260, T_TOC_G, 0.55, 48, "#fffdf5", "#1b1b1b", -0.1);
    // ¡DIANA!
    if (t > T_DIANA) {
      const d = t - T_DIANA, k = tramo(d, 0, 0.16), s = lerp(2.4, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(470, 92); g.rotate(-0.05); g.scale(s * 0.85, s * 0.85);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const n = 1 - a;
    if (n > 0) { g.fillStyle = `rgba(0,0,0,${n})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00249", nombre: "Tiro con manguera", crear: () => new TiroManguera() });
})();
