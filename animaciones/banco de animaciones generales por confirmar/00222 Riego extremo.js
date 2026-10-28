"use strict";
/*
 * 00222 · RIEGO EXTREMO
 *
 * Animación del banco. Empieza y acaba en negro.
 * En el patio del parque, Guillermo riega con mimo una macetita con su regadera. Marcos (de uniforme) se ofrece a
 * ayudar con la manguera: ¡chorro a toda presión! La maceta sale disparada hacia el cielo dando vueltas (¡FIUUU!) y
 * Guillermo queda empapado. Los dos miran arriba… la maceta cae, se rompe (¡CRAC!) y la plantita crece de golpe hasta
 * ser un árbol enorme: ¡RIEGO! Una manzana cae justo dentro de la regadera de Guillermo. Fundido a negro.
 */
(() => {
const CT = cacheTexto();
const ESC = 1.42;
const XG = 300, XM = 768;
const MACETA = [458, 490];                     // base de la maceta, encima del taburete
const SUELO = [512, PIES];                     // donde cae
const T_RIEGA = 0.45, T_AYUDO = 1.55, T_CHORRO = 2.3, T_VUELA = 2.45, T_CAE = 3.55, T_POC = 4.0, T_CRECE = 4.2;
const T_MANZANA = 6.4, T_PLOC = 6.95, T_FIN = 8.6, DUR = 9.4;

class Agua {
  constructor(max) { this.max = max; this.d = []; }
  nueva(x, y, vx, vy, vida, r) { if (this.d.length < this.max) this.d.push({ x, y, vx, vy, v: vida, vm: vida, r }); }
  actualizar(dt) {
    for (let i = this.d.length - 1; i >= 0; i--) {
      const p = this.d[i];
      p.v -= dt; p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.v <= 0 || p.y > PIES + 10) { this.d[i] = this.d[this.d.length - 1]; this.d.pop(); }
    }
  }
  dibujar(g) {
    if (!this.d.length) return;
    g.save();
    for (const p of this.d) {
      const a = Math.atan2(p.vy, p.vx), v = Math.hypot(p.vx, p.vy), k = Math.min(1, (p.v / p.vm) * 3);
      g.globalAlpha = 0.9 * k; g.fillStyle = "#8fdcff";
      g.beginPath(); g.ellipse(p.x, p.y, p.r * (1 + Math.min(1.6, v / 500)), p.r * 0.75, a, 0, 6.283); g.fill();
      g.globalAlpha = 0.8 * k; g.fillStyle = "#ffffff";
      g.beginPath(); g.arc(p.x - p.r * 0.25, p.y - p.r * 0.3, p.r * 0.3, 0, 6.283); g.fill();
    }
    g.restore();
  }
}
function chorro(g, x0, y0, x1, y1, t, a = 1) {
  const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - 30 - Math.abs(x1 - x0) * 0.1;
  g.save(); g.globalAlpha = a; g.lineCap = "round";
  const ruta = () => { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1); };
  ruta(); g.strokeStyle = "rgba(40,150,230,.55)"; g.lineWidth = 26; g.stroke();
  ruta(); g.strokeStyle = "#7fd4ff"; g.lineWidth = 16; g.stroke();
  ruta(); g.strokeStyle = "#e8fbff"; g.lineWidth = 6; g.setLineDash([26, 18]); g.lineDashOffset = -t * 1100; g.stroke();
  g.setLineDash([]);
  g.restore();
}
function boquilla(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.fillStyle = "#1d1f22"; rectR(g, -10, -5.5, 22, 11, 3); g.fill();
  const gr = g.createLinearGradient(0, -5, 0, 5);
  gr.addColorStop(0, "#fff0b0"); gr.addColorStop(0.5, "#d9a21c"); gr.addColorStop(1, "#7a5200");
  g.fillStyle = gr; g.beginPath(); g.moveTo(10, -5); g.lineTo(30, -3.2); g.lineTo(30, 3.2); g.lineTo(10, 5); g.closePath(); g.fill();
  g.fillStyle = "#c22016"; rectR(g, 2, -9, 5, 7, 1.5); g.fill();
  g.restore();
}
/** Regadera con el asa en (x, y) (unidades de avatar); la boca de la alcachofa en (47, 1) girada `ang`. */
function regadera(g, x, y, ang, manzana) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(1.25, 1.25);
  g.strokeStyle = "#1f6a3a"; g.lineWidth = 3.2; g.lineCap = "round";
  g.beginPath(); g.moveTo(-12, 10); g.quadraticCurveTo(-8, -4, 0, -3); g.quadraticCurveTo(8, -4, 12, 10); g.stroke();
  g.lineWidth = 4.5; g.beginPath(); g.moveTo(12, 26); g.lineTo(44, 4); g.stroke();
  g.fillStyle = "#2f9a52"; g.beginPath(); g.ellipse(46, 2, 3.5, 6, 0.9, 0, 6.283); g.fill();
  const gr = g.createLinearGradient(-17, 0, 17, 0);
  gr.addColorStop(0, "#1f6a3a"); gr.addColorStop(0.4, "#5fd07a"); gr.addColorStop(1, "#1d5e33");
  g.fillStyle = gr; rectR(g, -17, 8, 34, 28, 6); g.fill();
  g.strokeStyle = "#124226"; g.lineWidth = 1.4; g.stroke();
  g.fillStyle = "#ffd34d"; g.beginPath(); g.arc(-4, 22, 4, 0, 6.283); g.fill();
  if (manzana) { g.fillStyle = "#e8261c"; g.beginPath(); g.arc(4, 6, 8, 0, 6.283); g.fill(); g.fillStyle = "rgba(255,255,255,.5)"; g.beginPath(); g.arc(1, 3, 2.5, 0, 6.283); g.fill(); g.strokeStyle = "#5a3a1a"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(4, -2); g.lineTo(5, -6); g.stroke(); }
  g.restore();
}
/** Maceta con la plantita; (x, y) = la base. */
function maceta(g, x, y, ang, s, brote) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  // plantita
  g.strokeStyle = "#3f9a3a"; g.lineWidth = 3.5; g.lineCap = "round";
  g.beginPath(); g.moveTo(0, -38); g.quadraticCurveTo(2, -48, 0, -56 - brote * 6); g.stroke();
  g.fillStyle = "#58b84a";
  g.save(); g.translate(0, -54 - brote * 6); g.rotate(-0.5); g.beginPath(); g.ellipse(-9, 0, 10, 5, 0, 0, 6.283); g.fill(); g.restore();
  g.save(); g.translate(0, -56 - brote * 6); g.rotate(0.5); g.beginPath(); g.ellipse(9, 0, 10, 5, 0, 0, 6.283); g.fill(); g.restore();
  // maceta
  const gr = g.createLinearGradient(-26, 0, 26, 0);
  gr.addColorStop(0, "#9a4a22"); gr.addColorStop(0.4, "#e2804a"); gr.addColorStop(1, "#8a3e1a");
  g.fillStyle = gr; g.beginPath(); g.moveTo(-22, -36); g.lineTo(22, -36); g.lineTo(16, 0); g.lineTo(-16, 0); g.closePath(); g.fill();
  g.fillStyle = "#c86a38"; rectR(g, -26, -44, 52, 10, 3); g.fill();
  g.fillStyle = "#4a2a14"; g.beginPath(); g.ellipse(0, -43, 22, 4, 0, 0, 6.283); g.fill();
  g.restore();
}

class RiegoExtremo extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(420);
    this.agua = new Agua(320);
    const r = semilla(31);
    this.copa = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + r() * 0.3, d = 0.35 + r() * 0.65;
      this.copa.push({ dx: Math.cos(a) * 230 * d, dy: Math.sin(a) * 105 * d, R: 72 + r() * 40, col: ["#3f9a3a", "#2f7d2e", "#58b84a"][i % 3], t0: T_CRECE + 0.15 + r() * 0.35 });
    }
    this.copa.push({ dx: 0, dy: -10, R: 120, col: "#4aa83e", t0: T_CRECE + 0.18 });
    this.manzanas = [];
    for (let i = 0; i < 8; i++) this.manzanas.push({ dx: (r() * 2 - 1) * 210, dy: (r() * 2 - 1) * 80, t0: T_CRECE + 0.6 + r() * 0.4 });
    this.trozos = [];
  }
  /** Altura del tronco (0 → 360). */
  alto() { return 360 * eElastico(tramo(this.t, T_CRECE + 0.05, T_CRECE + 0.95)); }
  centroCopa() { return [SUELO[0] + 6 * Math.sin(this.t * 2.2), SUELO[1] - this.alto() - 60]; }
  /** Posición de la maceta: { x, y, ang, s }. */
  posMaceta() {
    const t = this.t;
    if (t < T_VUELA) return { x: MACETA[0] + (t > T_CHORRO ? azar(-2, 2) : 0), y: MACETA[1], ang: t > T_CHORRO ? azar(-0.05, 0.05) : 0, s: 1 };
    if (t < T_CAE) { const u = tramo(t, T_VUELA, T_VUELA + 0.55); return { x: lerp(MACETA[0], 540, u), y: lerp(MACETA[1], -160, eOut(u)), ang: u * 12, s: 1 }; }
    if (t < T_POC) { const u = tramo(t, T_CAE, T_POC); return { x: SUELO[0], y: lerp(-160, SUELO[1], u * u), ang: lerp(3, 0, u), s: 1.15 }; }
    const b = tramo(t, T_POC, T_POC + 0.18);
    return { x: SUELO[0], y: SUELO[1] - Math.sin(b * Math.PI) * 14, ang: 0, s: 1.15 };
  }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let angR = 0, yG = PIES, gG = 0;
    // ---- Guillermo
    const riega = eInOut(tramo(t, T_RIEGA, T_RIEGA + 0.4)) * (1 - eInOut(tramo(t, T_CHORRO - 0.25, T_CHORRO)));
    G.manoD = mezcla([84, 136], [100, 96], riega); angR = 0.62 * riega;
    G.manoI = [24, 136]; G.rc = 0.1 * riega;
    G.cara = t < 1.2 ? "sonrisa" : t < T_AYUDO ? "guino" : "sonrisa";
    if (t > T_AYUDO + 0.3 && t < T_CHORRO) { G.cara = "sorpresa"; G.rc = -0.1; }
    if (t > T_CHORRO) {
      // empapado
      G.cara = t < T_VUELA + 0.6 ? "dormido" : "sorpresa"; G.puntas = 0.7 * (1 - tramo(t, 6.0, 6.6));
      G.manoD = [84, 136]; G.manoI = [-10, 96];
      if (t < T_VUELA + 0.6) gG = 0.05 * Math.sin(t * 40);
      if (t > T_VUELA + 0.6 && t < T_POC) { G.rc = -0.25; G.cara = "sorpresa"; G.manoI = [-14, 50]; }     // mira arriba
      if (t > T_POC) { G.rc = 0.15; G.cara = "sorpresa"; G.manoI = [-14, 70]; yG -= Math.sin(tramo(t, T_CRECE, T_CRECE + 0.4) * Math.PI) * 30; }
      if (t > 5.4) { G.cara = "risa"; G.rc = 0.05; G.manoI = [9, 150]; }
      if (t > T_MANZANA) {
        // pone la regadera para coger la manzana y la enseña
        const k = eInOut(tramo(t, T_MANZANA, T_MANZANA + 0.3));
        G.manoD = mezcla([84, 136], [92, 112], k); G.cara = t < T_PLOC ? "sorpresa" : "guino"; G.rc = t < T_PLOC ? -0.2 : 0.06;
        if (t > T_PLOC + 0.3) { const k2 = eOut(tramo(t, T_PLOC + 0.3, T_PLOC + 0.6)); G.manoD = mezcla([92, 112], [80, 64], k2); G.manoI = [20, 140]; }
        if (t > 7.9) G.cara = "risa";
      }
    }
    const tieneManzana = t > T_PLOC;
    G.objD2 = (g, m) => regadera(g, m[0], m[1], angR, tieneManzana);
    // ---- Marcos
    const mM0 = matAv(XM, PIES, ESC);
    const objetivo = mM0.inverse().transformPoint(new DOMPoint(MACETA[0], MACETA[1] - 30));
    const apunta = eInOut(tramo(t, T_AYUDO, T_AYUDO + 0.4));
    const dir = [objetivo.x - 30, objetivo.y - 100], L = Math.hypot(dir[0], dir[1]);
    const angB = Math.atan2(dir[1], dir[0]);
    M.manoD = mezcla([60, 140], [14, 112], apunta); M.manoI = mezcla([6, 150], [-6, 110], apunta);
    M.cara = t < T_AYUDO ? "sonrisa" : t < T_CHORRO ? "guino" : "risa"; M.rc = -0.06;
    void L;
    let angBoq = lerp(Math.PI / 2, angB, apunta);
    if (t > T_VUELA + 0.4) {
      // ¡ups!: mira arriba con la manguera bajada
      const k = eInOut(tramo(t, T_VUELA + 0.4, T_VUELA + 0.7));
      M.manoD = mezcla([14, 112], [56, 136], k); M.manoI = mezcla([-6, 110], [8, 140], k); angBoq = lerp(angB, 1.6, k);
      M.cara = "sorpresa"; M.rc = t < T_POC ? -0.25 : -0.12;
      if (t > T_CAE - 0.3 && t < T_POC) M.cara = "dormido";
      if (t > 5.4) { M.cara = "risa"; M.rc = -0.1; }
      if (t > T_PLOC + 0.2) { M.cara = t < 7.6 ? "risa" : "guino"; M.manoI = [-12, 64 + 6 * Math.sin(t * 14)]; }   // aplaude con una mano en alto
    }
    M.objD2 = (g, m) => boquilla(g, m[0], m[1], angBoq);
    this._angBoq = angBoq;
    return { G, M, mG: matAv(XG, yG, ESC, gG), mM: matAv(XM, PIES - (t > T_CRECE && t < T_CRECE + 0.4 ? Math.sin(tramo(t, T_CRECE, T_CRECE + 0.4) * Math.PI) * 30 : 0), ESC), angR };
  }
  boquillaPunta(e) {
    const m = e.M._manoD || e.M.manoD, q = aPant(e.mM, m), a = this._angBoq;
    return [q[0] + Math.cos(a) * 30 * ESC, q[1] + Math.sin(a) * 30 * ESC];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, ag = this.agua;
    const e = this.poses();
    // gotitas de la regadera
    if (t > T_RIEGA + 0.35 && t < T_CHORRO - 0.2 && Math.random() < 40 * dt) {
      const m = e.G.manoD, q = rot2([58.75, 1.25], e.angR), s = aPant(e.mG, [m[0] + q[0], m[1] + q[1]]);
      ag.nueva(s[0] + azar(-4, 4), s[1], azar(-10, 30), azar(20, 80), 0.8, azar(2, 3.5));
    }
    // el chorro
    if (t > T_CHORRO && t < T_VUELA + 0.35) {
      for (let k = 0; k < 5; k++) ag.nueva(MACETA[0] + azar(-20, 20), MACETA[1] - 30 + azar(-15, 15), azar(-420, 160), azar(-420, -60), azar(0.4, 0.9), azar(3, 6));
    }
    this.una("chorro", t > T_CHORRO, () => temblar(8, 0.3));
    this.una("vuela", t > T_VUELA, () => { temblar(12, 0.3); p.nueva(P.DESTELLO, MACETA[0], MACETA[1] - 30, 0, 0, 0.3, 200); });
    this.una("poc", t > T_POC, () => { temblar(10, 0.25); for (let i = 0; i < 8; i++) p.nueva(P.POLVO, SUELO[0] + azar(-40, 40), PIES, azar(-100, 100), azar(-40, -5), azar(0.4, 0.7), azar(18, 28)); });
    this.una("crece", t > T_CRECE, () => {
      temblar(22, 0.7);
      for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.45; this.trozos.push({ x: SUELO[0], y: PIES - 20, vx: Math.cos(a) * azar(260, 420) + (i - 2.5) * 40, vy: Math.sin(a) * azar(300, 500), r: 0, vr: azar(-10, 10), w: azar(14, 22) }); }
      for (let i = 0; i < 16; i++) p.nueva(P.POLVO, SUELO[0] + azar(-60, 60), PIES, azar(-200, 200), azar(-80, -10), azar(0.5, 0.9), azar(24, 40));
    });
    this.una("hojas", t > T_CRECE + 0.4, () => {
      const c = this.centroCopa();
      for (let i = 0; i < 70; i++) p.nueva(P.CONFETI, c[0] + azar(-260, 260), c[1] + azar(-120, 100), azar(-120, 120), azar(-80, 60), azar(1.8, 3), azar(10, 16), 0);
      p.nueva(P.DESTELLO, c[0], c[1], 0, 0, 0.4, 700);
    });
    this.una("ploc", t > T_PLOC, () => { temblar(6, 0.2); const m = aPant(e.mG, e.G.manoD); for (let i = 0; i < 8; i++) ag.nueva(m[0], m[1] - 10, azar(-140, 140), azar(-260, -100), azar(0.4, 0.7), azar(2, 4)); });
    for (const z of this.trozos) { z.vy += 1300 * dt; z.x += z.vx * dt; z.y += z.vy * dt; z.r += z.vr * dt; if (z.y > PIES) { z.y = PIES; z.vy = -z.vy * 0.3; z.vx *= 0.6; z.vr *= 0.5; } }
    p.suelo = () => PIES + 4;
    p.actualizar(dt); ag.actualizar(dt);
  }
  fondoFijo() {
    if (CT.has("fondo")) return CT.get("fondo");
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const cielo = g.createLinearGradient(0, -60, 0, 520);
    cielo.addColorStop(0, "#4aa8f0"); cielo.addColorStop(1, "#d6f0ff");
    g.fillStyle = cielo; g.fillRect(-60, -60, W + 120, 620);
    g.fillStyle = "rgba(255,255,255,.85)";
    for (const [x, y, s] of [[150, 90, 1], [850, 60, 1.2], [520, 30, 0.7]]) for (const [dx, dy, r] of [[0, 0, 26], [30, -10, 32], [64, 0, 24], [32, 8, 26]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, 6.283); g.fill(); }
    // muro del parque (ladrillo) con un banco
    g.fillStyle = "#b5523a"; g.fillRect(-60, 330, W + 120, 220);
    const r = semilla(2);
    for (let y = 330; y < 548; y += 24) for (let x = ((y / 24) % 2 ? -30 : -60); x < W + 60; x += 60) {
      const v = 0.85 + r() * 0.3; g.fillStyle = `rgb(${Math.round(196 * v)},${Math.round(98 * v)},${Math.round(70 * v)})`; rectR(g, x + 2, y + 2, 56, 20, 2); g.fill();
    }
    g.fillStyle = "#d9c3a0"; g.fillRect(-60, 318, W + 120, 16);
    // setos
    for (let x = -60; x < W + 60; x += 46) { g.fillStyle = (x / 46) % 2 ? "#3f8a3a" : "#4a9a42"; g.beginPath(); g.arc(x, 318, 34, Math.PI, 0); g.fill(); }
    // suelo
    const gs = g.createLinearGradient(0, 548, 0, H + 60);
    gs.addColorStop(0, "#b0aba2"); gs.addColorStop(1, "#77726a");
    g.fillStyle = gs; g.fillRect(-60, 548, W + 120, H);
    g.fillStyle = "rgba(255,255,255,.2)"; g.fillRect(-60, 548, W + 120, 2);
    CT.set("fondo", c);
    return c;
  }
  arbol(g) {
    const t = this.t, H = this.alto();
    if (t < T_CRECE) return;
    const [cx, cy] = this.centroCopa();
    // tronco
    const x0 = SUELO[0], y0 = SUELO[1];
    const gt = g.createLinearGradient(x0 - 40, 0, x0 + 40, 0);
    gt.addColorStop(0, "#5a3418"); gt.addColorStop(0.45, "#9a6232"); gt.addColorStop(1, "#4a2a12");
    g.fillStyle = gt;
    g.beginPath();
    g.moveTo(x0 - 46, y0); g.quadraticCurveTo(x0 - 20, y0 - H * 0.5, cx - 16, y0 - H);
    g.lineTo(cx + 16, y0 - H); g.quadraticCurveTo(x0 + 22, y0 - H * 0.5, x0 + 46, y0); g.closePath(); g.fill();
    g.strokeStyle = "#3a200c"; g.lineWidth = 3; g.stroke();
    // ramas
    g.strokeStyle = "#7a4a22"; g.lineCap = "round";
    for (const [sx, l, a] of [[-1, 0.5, -2.3], [1, 0.62, -0.8], [-1, 0.78, -2.6]]) {
      const bx = lerp(x0, cx, l) + sx * 8, by = y0 - H * l;
      g.lineWidth = 16 * (H / 360); g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + Math.cos(a) * 110 * (H / 360), by + Math.sin(a) * 110 * (H / 360)); g.stroke();
    }
    // copa
    const ks = this.copa.map((b) => eBack(tramo(t, b.t0, b.t0 + 0.35)));
    g.fillStyle = "#1f5a1f";
    this.copa.forEach((b, i) => { if (ks[i] > 0.01) { g.beginPath(); g.arc(cx + b.dx, cy + b.dy, b.R * ks[i] + 4, 0, 6.283); g.fill(); } });
    this.copa.forEach((b, i) => {
      if (ks[i] <= 0.01) return;
      const r = b.R * ks[i], x = cx + b.dx, y = cy + b.dy;
      g.fillStyle = b.col; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
      g.fillStyle = "rgba(255,255,255,.13)"; g.beginPath(); g.arc(x - r * 0.3, y - r * 0.35, r * 0.5, 0, 6.283); g.fill();
    });
    // manzanas
    for (const m of this.manzanas) {
      const k = eBack(tramo(t, m.t0, m.t0 + 0.25));
      if (k <= 0) continue;
      const x = cx + m.dx, y = cy + m.dy, r = 13 * k;
      g.fillStyle = "#e8261c"; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
      g.fillStyle = "rgba(255,255,255,.55)"; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.35, r * 0.3, 0, 6.283); g.fill();
      g.fillStyle = "#3f9a3a"; g.beginPath(); g.ellipse(x + 4 * k, y - r - 2, 5 * k, 2.5 * k, -0.5, 0, 6.283); g.fill();
    }
  }
  dibujar(g) {
    const t = this.t, e = this.poses();
    fondo(g, "#000");
    g.drawImage(this.fondoFijo(), -60, -60);
    // charco
    const ch = tramo(t, T_CHORRO, T_VUELA + 0.4);
    if (ch > 0) { g.save(); g.globalAlpha = 0.45 * ch; g.fillStyle = "#7fc4e8"; g.beginPath(); g.ellipse(430, 582, 190 * ch, 12 * ch, 0, 0, 6.283); g.fill(); g.restore(); }
    this.arbol(g);
    // taburete
    g.fillStyle = "#8a5a2a"; rectR(g, MACETA[0] - 40, MACETA[1], 80, 12, 4); g.fill();
    g.strokeStyle = "#6a4018"; g.lineWidth = 8; g.lineCap = "round";
    g.beginPath(); g.moveTo(MACETA[0] - 30, MACETA[1] + 10); g.lineTo(MACETA[0] - 38, PIES); g.moveTo(MACETA[0] + 30, MACETA[1] + 10); g.lineTo(MACETA[0] + 38, PIES); g.stroke();
    // sombra de la maceta que cae
    if (t > T_CAE - 0.1 && t < T_POC) { const k = tramo(t, T_CAE - 0.1, T_POC); g.fillStyle = `rgba(0,0,0,${0.35 * k})`; g.beginPath(); g.ellipse(SUELO[0], PIES + 2, 50 * k, 8 * k, 0, 0, 6.283); g.fill(); }
    // manguera hasta Marcos
    {
      const q = aPant(e.mM, e.M.manoD);
      g.save(); g.lineCap = "round"; g.strokeStyle = "#8a7a58"; g.lineWidth = 12;
      g.beginPath(); g.moveTo(W + 40, PIES + 6); g.bezierCurveTo(900, PIES + 6, q[0] + 50, PIES - 10, q[0] + 6, q[1] + 8); g.stroke();
      g.strokeStyle = "#e9dcc0"; g.lineWidth = 8; g.stroke(); g.restore();
    }
    pintarAvatar(g, e.mM, e.M, t);
    pintarAvatar(g, e.mG, e.G, t);
    // la maceta
    if (t < T_CRECE) { const q = this.posMaceta(); maceta(g, q.x, q.y, q.ang, q.s, tramo(t, 1.0, 1.8)); }
    for (const z of this.trozos) {
      g.save(); g.translate(z.x, z.y); g.rotate(z.r);
      g.fillStyle = "#c86a38"; g.beginPath(); g.moveTo(-z.w / 2, -z.w / 3); g.lineTo(z.w / 2, -z.w / 2); g.lineTo(z.w / 3, z.w / 2); g.lineTo(-z.w / 2, z.w / 3); g.closePath(); g.fill();
      g.strokeStyle = "#7a3a12"; g.lineWidth = 2; g.stroke();
      g.restore();
    }
    // el chorro
    if (t > T_CHORRO && t < T_VUELA + 0.4) {
      const p0 = this.boquillaPunta(e);
      chorro(g, p0[0], p0[1], MACETA[0] + 8, MACETA[1] - 34, t, 1 - tramo(t, T_VUELA + 0.3, T_VUELA + 0.4));
    }
    // la manzana que cae a la regadera
    if (t > T_MANZANA && t < T_PLOC) {
      const u = tramo(t, T_MANZANA, T_PLOC), c = this.centroCopa(), m = this.manzanas[0];
      const a = [c[0] + m.dx, c[1] + m.dy], b = aPant(e.mG, [e.G.manoD[0] + 4, e.G.manoD[1] + 2]);
      const x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u * u);
      g.fillStyle = "#e8261c"; g.beginPath(); g.arc(x, y, 14, 0, 6.283); g.fill();
      g.fillStyle = "rgba(255,255,255,.55)"; g.beginPath(); g.arc(x - 5, y - 5, 4, 0, 6.283); g.fill();
    }
    this.agua.dibujar(g);
    this.p.dibujar(g);
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    ono("plic, plic…", 470, 360, T_RIEGA + 0.4, 1.0, 32, "#bff0ff", "#0c3350", -0.06);
    ono("¡FSSSH!", 640, 330, T_CHORRO, 0.6, 56, "#bff0ff", "#0c3350", 0.08);
    ono("¡FIUUU!", 600, 150, T_VUELA + 0.05, 0.9, 64, "#fffdf5", "#1b1b1b", -0.1);
    ono("¡POC!", 600, 470, T_POC, 0.5, 52, "#fffdf5", "#1b1b1b", 0.08);
    ono("¡CRAC!", 420, 460, T_CRECE, 0.5, 58, "#ffd34d", "#3a2400", -0.1);
    ono("¡PLOC!", 220, 330, T_PLOC, 0.6, 52, "#ff6a5a", "#3a0505", -0.08);
    if (t > T_AYUDO && t < T_CHORRO + 0.1) {
      const c = aPant(e.mM, [37, 10]);
      bocadillo(g, 790, 175, "¡TE AYUDO!", c[0], c[1] - 10, tramo(t, T_AYUDO, T_AYUDO + 0.2) * (1 - tramo(t, T_CHORRO - 0.05, T_CHORRO + 0.1)), 40);
    }
    // ¡RIEGO!
    if (t > T_CRECE + 0.3) {
      const d = t - T_CRECE - 0.3, k = tramo(d, 0, 0.18), s = lerp(1.9, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 5));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 96); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.45), tramo(t, T_FIN, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(600, 200), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 170);
    gr.addColorStop(0, "#f2ffe8"); gr.addColorStop(0.5, "#8fe86a"); gr.addColorStop(1, "#2a9a3a");
    txt(g, "¡RIEGO!", 306, 166, { tam: 160, peso: 900, fam: FD, color: "#062a10", esp: 6, max: 560 });
    txt(g, "¡RIEGO!", 300, 158, { tam: 160, peso: 900, fam: FD, color: gr, borde: "#062a10", bordeAncho: 12, esp: 6, glow: "rgba(140,255,120,.8)", glowTam: 24, max: 560 });
    CT.set("t", c);
    return c;
  }
}

registrar({ id: "00222", nombre: "Riego extremo", crear: () => new RiegoExtremo() });
})();
