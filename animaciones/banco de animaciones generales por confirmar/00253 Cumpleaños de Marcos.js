"use strict";
/*
 * 00253 · CUMPLEAÑOS DE MARCOS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Sala del parque de bomberos a oscuras; Marcos entra cansado y al fondo brillan unas velitas. Se encienden las
 * luces: ¡SORPRESA! Guillermo, con gorro de fiesta, le lleva una tarta con velas cantando. «¡SOPLA!»… pero Marcos
 * ve fuego, salta la alarma en su cabeza (¡FUEGO!), coge la manguera de la pared y ¡FSSSHH!: velas apagadas, tarta
 * empapada y Guillermo chorreando nata. Marcos se tapa la boca; Guillermo prueba la nata (¡ÑAM!) y acaban los dos
 * muertos de risa: ¡FELICIDADES, MARCOS!
 */
(() => {
const CT = cacheTexto();
const ESC = 1.45;
const XM = 380, XG0 = 830, XG = 610;
const CARRETE = [150, 330];
const T_LUZ = 1.45, T_ANDA = 1.75, T_LLEGA = 2.8, T_SOPLA = 2.85, T_VE = 3.25, T_COGE = 3.6, T_CHORRO = [3.85, 4.75];
const T_UPS = 4.9, T_NAM = 5.65, T_RISA = 6.1, T_TIT = 6.35, T_APAGA = 9.45, DUR = 10.0;

const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

class Agua {
  constructor(max) { this.max = max; this.n = 0; this.d = new Float32Array(max * 7); }
  nueva(x, y, vx, vy, vida, tam, nata = 0) { if (this.n >= this.max) return; const o = this.n++ * 7, d = this.d; d[o] = x; d[o + 1] = y; d[o + 2] = vx; d[o + 3] = vy; d[o + 4] = vida; d[o + 5] = tam; d[o + 6] = nata; }
  actualizar(dt) {
    const d = this.d; let i = 0;
    while (i < this.n) {
      const o = i * 7; d[o + 4] -= dt;
      if (d[o + 4] <= 0) { const u = (this.n - 1) * 7; for (let k = 0; k < 7; k++) d[o + k] = d[u + k]; this.n--; continue; }
      d[o + 3] += 980 * dt; d[o] += d[o + 2] * dt; d[o + 1] += d[o + 3] * dt;
      if (d[o + 1] > PIES + 6) { d[o + 1] = PIES + 6; d[o + 3] *= -0.2; d[o + 2] *= 0.4; }
      i++;
    }
  }
  dibujar(g) {
    const d = this.d; g.save();
    for (let i = 0; i < this.n; i++) {
      const o = i * 7, s = d[o + 5];
      g.globalAlpha = Math.min(1, d[o + 4] * 3) * 0.9; g.fillStyle = d[o + 6] ? (d[o + 6] > 1 ? "#ff9ac0" : "#fffaf0") : "#b4e8ff";
      g.beginPath(); g.ellipse(d[o], d[o + 1], s * 0.7, s, Math.atan2(d[o + 3], d[o + 2]) + Math.PI / 2, 0, 6.283); g.fill();
    }
    g.restore();
  }
}
/** Tarta en unidades de avatar: el centro del plato en (x, y). moj: 0–1 (empapada). velas: encendidas. */
function tarta(g, x, y, moj, velas, t) {
  g.save(); g.translate(x, y);
  // plato
  g.fillStyle = "#e8eef2"; g.beginPath(); g.ellipse(0, 0, 40, 6, 0, 0, 6.283); g.fill();
  g.strokeStyle = "#a8b0b8"; g.lineWidth = 1.2; g.stroke();
  const caida = 1 - 0.35 * moj, ancho = 1 + 0.22 * moj;
  // piso de abajo
  const h1 = 22 * caida, w1 = 28 * ancho, h2 = 15 * caida, w2 = 19 * ancho;
  const gr = g.createLinearGradient(-w1, 0, w1, 0);
  gr.addColorStop(0, "#d86a96"); gr.addColorStop(0.45, "#ffb0cc"); gr.addColorStop(1, "#c85a86");
  g.fillStyle = gr; rectR(g, -w1, -h1 - 1, w1 * 2, h1, 4); g.fill();
  g.fillStyle = "#6a3a20"; g.fillRect(-w1, -h1 * 0.55, w1 * 2, 3);
  // nata de borde (gotea si está mojada)
  g.fillStyle = "#fffaf0";
  g.beginPath(); g.moveTo(-w1 - 1, -h1 - 1);
  for (let i = 0; i <= 8; i++) { const xx = -w1 + (w1 * 2 * i) / 8, gota = (i % 2 ? 4 : 2) + moj * (6 + 5 * Math.sin(i * 2.3)); g.lineTo(xx, -h1 + gota); }
  g.lineTo(w1 + 1, -h1 - 3); g.closePath(); g.fill();
  // piso de arriba
  const gr2 = g.createLinearGradient(-w2, 0, w2, 0);
  gr2.addColorStop(0, "#d86a96"); gr2.addColorStop(0.45, "#ffc2d8"); gr2.addColorStop(1, "#c85a86");
  g.save(); g.translate(0, -h1); g.rotate(0.1 * moj);
  g.fillStyle = gr2; rectR(g, -w2, -h2, w2 * 2, h2, 4); g.fill();
  g.fillStyle = "#fffaf0";
  g.beginPath(); g.moveTo(-w2 - 1, -h2);
  for (let i = 0; i <= 6; i++) { const xx = -w2 + (w2 * 2 * i) / 6, gota = (i % 2 ? 3.5 : 1.5) + moj * (5 + 4 * Math.sin(i * 1.7)); g.lineTo(xx, -h2 + gota); }
  g.lineTo(w2 + 1, -h2 - 2); g.closePath(); g.fill();
  // fresas
  for (const fx of [-11, 0, 11]) { g.fillStyle = "#e11e14"; g.beginPath(); g.ellipse(fx, -h2 - 2, 3.2, 3.8, 0, 0, 6.283); g.fill(); }
  // velas
  for (let i = 0; i < 5; i++) {
    const vx = -14 + i * 7, inc = moj * (i - 2) * 0.25;
    g.save(); g.translate(vx, -h2 - 3); g.rotate(inc);
    g.fillStyle = ["#2fe3e8", "#ffd34d", "#ff3d84", "#2bff5b", "#ffffff"][i]; g.fillRect(-1.4, -11, 2.8, 11);
    g.fillStyle = "rgba(0,0,0,.25)"; for (let k = 0; k < 3; k++) g.fillRect(-1.4, -9 + k * 3.5, 2.8, 1);
    g.strokeStyle = "#222"; g.lineWidth = 0.8; g.beginPath(); g.moveTo(0, -11); g.lineTo(0, -13); g.stroke();
    if (velas) {
      const f = 1 + 0.15 * Math.sin(t * 25 + i * 2);
      g.fillStyle = "#ffb020"; g.beginPath(); g.moveTo(0, -12); g.quadraticCurveTo(-3 * f, -15, 0, -21 * f); g.quadraticCurveTo(3 * f, -15, 0, -12); g.fill();
      g.fillStyle = "#fff6c0"; g.beginPath(); g.ellipse(0, -14.5, 1.2, 2.4, 0, 0, 6.283); g.fill();
    }
    g.restore();
  }
  g.restore();
  g.restore();
}
/** Gorro de fiesta (cono) en unidades de avatar; base en (x, y). */
function gorro(g, x, y, rot) {
  g.save(); g.translate(x, y); g.rotate(rot);
  const gr = g.createLinearGradient(-12, 0, 12, 0);
  gr.addColorStop(0, "#1f6ae0"); gr.addColorStop(0.5, "#4fa0ff"); gr.addColorStop(1, "#1a50b0");
  g.fillStyle = gr; g.beginPath(); g.moveTo(-13, 0); g.lineTo(0, -34); g.lineTo(13, 0); g.quadraticCurveTo(0, 4, -13, 0); g.fill();
  g.fillStyle = "#ffd34d"; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-6 + i * 4, -6 - i * 7, 2, 0, 6.283); g.fill(); }
  g.fillStyle = "#ff3d84"; g.beginPath(); g.arc(0, -35, 4, 0, 6.283); g.fill();
  g.restore();
}
function nataCara(g, k) {
  g.fillStyle = "#fffaf0";
  for (const [x, y, r] of [[28, 50, 6], [24, 46, 4], [50, 32, 5], [54, 36, 3.5], [41, 63, 4.5], [36, 64, 3]]) { g.beginPath(); g.arc(x, y, r * k, 0, 6.283); g.fill(); }
  g.fillStyle = "#ff9ac0"; g.beginPath(); g.arc(48, 30, 2.5 * k, 0, 6.283); g.fill();
}
function boquilla(g, a, b) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  g.save(); g.translate(a[0], a[1]); g.rotate(ang);
  const gr = g.createLinearGradient(0, -5, 0, 5);
  gr.addColorStop(0, "#fff3b0"); gr.addColorStop(0.45, "#d9a020"); gr.addColorStop(1, "#6a4a00");
  g.fillStyle = "#2a2a30"; rectR(g, -3, -5, 11, 10, 2.5); g.fill();
  g.fillStyle = gr; g.beginPath(); g.moveTo(6, -4.5); g.lineTo(L, -2.6); g.lineTo(L, 2.6); g.lineTo(6, 4.5); g.closePath(); g.fill();
  g.fillStyle = "#e11e14"; rectR(g, L * 0.45, -6, 5, 12, 1.5); g.fill();
  g.restore();
}

class Cumpleanos extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(360);
    this.p.suelo = () => PIES + 6;
    this.agua = new Agua(300);
    this.fG = 0; this.fM = 0;
  }
  luz() { return tramo(this.t, 0.02, 0.4) * (1 - tramo(this.t, T_APAGA, DUR - 0.03)); }
  encendida() { const t = this.t; if (t < T_LUZ) return 0; if (t < T_LUZ + 0.25) return Math.sin(t * 80) > 0 ? 1 : 0.3; return 1; }
  mojada() { return eOut(tramo(this.t, T_CHORRO[0] + 0.1, T_CHORRO[0] + 0.6)); }
  poses() {
    const t = this.t;
    const G = { cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [76, 140], manoI: [2, 140], brazoIDelante: true };
    const M = { quien: "bombero", cara: "dormido", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let xm = XM, ym = PIES, xg = XG0, yg = PIES;
    // ---- Marcos entra a oscuras
    if (t < T_LUZ) {
      const u = tramo(t, 0.2, T_LUZ - 0.1);
      xm = lerp(-80, XM, eOut(u));
      if (u < 1) { const a = andar(this.fM, 1); M.piernaI = a.piernaI; M.piernaD = a.piernaD; ym += a.bote * ESC; }
      M.cara = "dormido"; M.rc = 0.04 * Math.sin(t * 3);
      if (t > 0.9) { M.manoD = [40, 58]; M.brazoIDelante = false; }   // bosteza
    } else if (t < T_LUZ + 0.5) {
      const u = tramo(t, T_LUZ, T_LUZ + 0.45);
      ym -= Math.sin(u * Math.PI) * 50; M.cara = "sorpresa"; M.puntas = 1 - u; M.manoD = [86, 50]; M.manoI = [-14, 50];
    } else if (t < T_SOPLA) {
      M.cara = "risa"; M.manoD = [56, 58]; M.manoI = [18, 58]; M.brazoIDelante = true; M.rc = 0.06 * Math.sin(t * 6);
    }
    // ---- ve fuego: alarma, coge la manguera y dispara
    this.boq = null;
    if (t >= T_SOPLA && t < T_VE) { M.cara = "sonrisa"; M.rc = 0.12; }
    if (t >= T_VE && t < T_COGE) {
      M.cara = "sorpresa"; M.rc = 0.16; M.puntas = 0.7; ym -= 6 * Math.abs(Math.sin(t * 30));
      const k = eInOut(tramo(t, T_VE + 0.15, T_COGE));
      const m0 = matAv(XM, PIES, ESC), c = enAv(m0, [CARRETE[0] + 40, CARRETE[1] + 40]);
      M.manoI = mezcla([6, 152], c, k); M.brazoIDelante = true; M.rc = lerp(0.16, -0.2, k);
    }
    if (t >= T_COGE && t < T_UPS + 0.3) {
      const k = eInOut(tramo(t, T_COGE, T_COGE + 0.2));
      M.manoD = mezcla([67, 152], [88, 120], k); M.manoI = mezcla([-10, 130], [46, 126], k); M.brazoIDelante = true;
      M.cara = t > T_CHORRO[0] ? "guino" : "sorpresa"; M.rc = 0.04; M.puntas = 0.4 * (1 - k);
      if (t > T_CHORRO[0] && t < T_CHORRO[1]) { xm -= 4 * Math.abs(Math.sin(t * 40)); }
      const a = M.manoI, b = M.manoD, d = [b[0] - a[0], b[1] - a[1]], L = Math.hypot(d[0], d[1]);
      this.boq = { a, b: [b[0] + d[0] / L * 20, b[1] + d[1] / L * 20] };
    }
    if (t >= T_UPS) {
      M.cara = "sorpresa"; M.rc = 0.1;
      if (t > T_UPS + 0.3) { M.manoD = [42, 62]; M.manoI = [6, 152]; M.brazoIDelante = false; this.boq = null; }
      if (t > T_NAM + 0.15) { M.cara = "risa"; M.manoD = [70, 120]; }
      if (t > T_RISA) {
        const s = Math.sin(t * 15); M.manoD = [52, 128 + 4 * s]; M.manoI = [22, 128 - 4 * s]; M.brazoIDelante = true; M.cara = "risa"; M.rc = 0.12 + 0.05 * s;
        ym -= Math.abs(s) * 5;
        if (t > T_TIT + 1.6) { M.cara = Math.floor(t * 1.4) % 2 ? "risa" : "guino"; }
      }
    }
    // ---- Guillermo con la tarta
    if (t < T_LUZ) { G.cara = "sonrisa"; G.rc = -0.05; }
    else if (t < T_ANDA) { G.cara = "risa"; yg -= 20 * Math.sin(tramo(t, T_LUZ, T_ANDA) * Math.PI); }
    else if (t < T_LLEGA) {
      const u = tramo(t, T_ANDA, T_LLEGA); xg = lerp(XG0, XG, eInOut(u));
      const a = andar(this.fG, 1); G.piernaI = a.piernaI; G.piernaD = a.piernaD; yg += a.bote * ESC;
      G.cara = Math.floor(t * 3) % 2 ? "risa" : "guino"; G.rc = -0.08 + 0.06 * Math.sin(t * 6);
    } else { xg = XG; G.cara = "sonrisa"; G.rc = -0.1; }
    if (t >= T_SOPLA) { G.manoD = [70, 132]; G.manoI = [-4, 132]; G.cara = t < T_VE ? "risa" : "sorpresa"; }
    if (t >= T_CHORRO[0]) {
      G.cara = "dormido"; G.rc = -0.18 + 0.04 * Math.sin(t * 40) * (t < T_CHORRO[1] ? 1 : 0);
      if (t > T_CHORRO[1]) { G.rc = -0.05; G.cara = "borracho"; }
      if (t > T_UPS + 0.2) G.cara = "dormido";
    }
    // prueba la nata
    if (t > T_NAM - 0.35 && t < T_RISA) {
      const k = eInOut(tramo(t, T_NAM - 0.35, T_NAM - 0.05)) * (1 - eInOut(tramo(t, T_NAM + 0.3, T_NAM + 0.5)));
      G.manoD = mezcla([70, 132], [44, 62], k); G.cara = t > T_NAM - 0.05 ? "guino" : "dormido"; G.rc = 0.05;
      this.manoTarta = k < 0.5;
    } else this.manoTarta = true;
    if (t > T_RISA) { G.cara = "risa"; G.rc = -0.12 + 0.05 * Math.sin(t * 15 + 1); yg -= Math.abs(Math.sin(t * 15 + 1)) * 5; }
    // objetos
    const moj = this.mojada(), velas = t < T_CHORRO[0] + 0.12, gc = G.rc;
    G.objI = (g) => tarta(g, 39, 136, moj, velas, t);
    const kn = eBack(tramo(t, T_CHORRO[0] + 0.15, T_CHORRO[0] + 0.4)) * (1 - 0.4 * tramo(t, T_NAM - 0.1, T_NAM + 0.1) * (t < T_NAM + 0.2 ? 1 : 1));
    G.objD = (g) => {
      g.save(); g.translate(39, 72); g.rotate(gc); g.translate(-39, -72);
      if (t > T_CHORRO[0] + 0.15) nataCara(g, Math.max(0, kn));
      gorro(g, 52, 2, 0.35);
      g.restore();
    };
    if (this.boq) { const b = this.boq; M.objD = (g) => boquilla(g, b.a, b.b); }
    const mG = matAv(xg, yg, ESC), mM = matAv(xm, ym, ESC);
    return { G, M, mG, mM };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, ag = this.agua;
    if (t < T_LUZ) this.fM += dt * 9;
    if (t > T_ANDA && t < T_LLEGA) this.fG += dt * 10;
    const e = this.poses();
    this.una("luz", t > T_LUZ, () => {
      temblar(12, 0.35);
      for (let i = 0; i < 120; i++) p.nueva(P.CONFETI, azar(30, 990), azar(-60, 0), azar(-50, 50), azar(30, 170), azar(2.4, 3.6), azar(9, 15), (Math.random() * 5) | 0);
    });
    this.una("ve", t > T_VE, () => temblar(6, 0.2));
    // chorro: agua, nata y humo de las velas
    if (t > T_CHORRO[0] && t < T_CHORRO[1]) {
      const c = aPant(e.mG, [39, 116]);
      for (let i = 0; i < 4; i++) ag.nueva(c[0] - 20, c[1], azar(-120, 220), azar(-380, -60), azar(0.4, 0.8), azar(3, 6));
      for (let i = 0; i < 2; i++) ag.nueva(c[0] - 10, c[1] - 10, azar(-60, 260), azar(-420, -160), azar(0.5, 0.9), azar(4, 7), Math.random() < 0.3 ? 2 : 1);
    }
    this.una("chorro", t > T_CHORRO[0], () => {
      temblar(14, 0.35);
      const c = aPant(e.mG, [39, 100]);
      for (let i = 0; i < 6; i++) p.nueva(P.HUMO, c[0] + azar(-20, 20), c[1] - 10, azar(-20, 20), azar(-90, -40), azar(1, 1.6), azar(20, 34));
    });
    // gotea
    if (t > T_CHORRO[0] && t < T_APAGA && Math.random() < 26 * dt) { const c = aPant(e.mG, [azar(0, 78), azar(40, 200)]); ag.nueva(c[0], c[1], azar(-10, 10), azar(0, 30), azar(0.5, 0.9), azar(2.5, 4.5), Math.random() < 0.3 ? 1 : 0); }
    this.una("tit", t > T_TIT, () => {
      temblar(14, 0.4);
      for (let i = 0; i < 120; i++) p.nueva(P.CONFETI, azar(30, 990), azar(-60, 0), azar(-50, 50), azar(30, 170), azar(2.4, 3.6), azar(9, 15), (Math.random() * 5) | 0);
    });
    p.actualizar(dt);
    ag.actualizar(dt);
  }
  fondo() {
    if (CT.has("fondo")) return CT.get("fondo");
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gp = g.createLinearGradient(0, -60, 0, 480);
    gp.addColorStop(0, "#e8d8b8"); gp.addColorStop(1, "#c9b48a");
    g.fillStyle = gp; g.fillRect(-60, -60, W + 120, 560);
    g.fillStyle = "#9e1b14"; g.fillRect(-60, 380, W + 120, 16);
    g.fillStyle = "#7a5a3a"; g.fillRect(-60, 396, W + 120, 100);
    g.fillStyle = "rgba(0,0,0,.15)"; for (let x = -60; x < W + 60; x += 60) g.fillRect(x, 396, 3, 100);
    // puerta a la izquierda
    g.fillStyle = "#5a3a22"; g.fillRect(-20, 120, 70, 376);
    // carrete de manguera en la pared
    g.fillStyle = "#5d656e"; g.fillRect(CARRETE[0] - 6, CARRETE[1] - 70, 12, 70);
    g.fillStyle = "#c9d0d6"; g.beginPath(); g.arc(CARRETE[0], CARRETE[1], 62, 0, 6.283); g.fill();
    g.fillStyle = "#e11e14"; g.beginPath(); g.arc(CARRETE[0], CARRETE[1], 56, 0, 6.283); g.fill();
    g.strokeStyle = "#ff8a6a"; g.lineWidth = 7; for (let r = 18; r < 52; r += 9) { g.beginPath(); g.arc(CARRETE[0], CARRETE[1], r, 0, 6.283); g.stroke(); }
    g.fillStyle = "#c9d0d6"; g.beginPath(); g.arc(CARRETE[0], CARRETE[1], 10, 0, 6.283); g.fill();
    // ventana con noche
    g.fillStyle = "#fffdf5"; g.fillRect(820, 150, 160, 130); g.fillStyle = "#1a2a4a"; g.fillRect(828, 158, 144, 114);
    g.fillStyle = "#fffdf5"; g.fillRect(898, 158, 4, 114); g.fillRect(828, 213, 144, 4);
    g.fillStyle = "#fff6c0"; g.beginPath(); g.arc(940, 190, 14, 0, 6.283); g.fill();
    // pancarta
    g.save(); g.translate(560, 92);
    g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(-300, -30, 610, 74);
    g.fillStyle = "#fffdf5"; g.beginPath(); g.moveTo(-306, -38); g.lineTo(306, -38); g.lineTo(298, 34); g.lineTo(-298, 34); g.closePath(); g.fill();
    g.strokeStyle = "#ff3d84"; g.lineWidth = 5; g.stroke();
    txt(g, "¡FELIZ CUMPLE!", 0, 18, { tam: 54, peso: 900, fam: FD, color: "#e11e14", esp: 5, max: 570 });
    g.restore();
    // guirnaldas
    for (const [ax, ay, bx, by] of [[-60, 20, 250, 60], [870, 60, W + 60, 20]]) {
      g.strokeStyle = "#3a2a2a"; g.lineWidth = 2; g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo((ax + bx) / 2, ay + 70, bx, by); g.stroke();
      for (let k = 0; k < 8; k++) { const u = (k + 0.5) / 8, px = lerp(ax, bx, u), py = (1 - u) * (1 - u) * ay + 2 * u * (1 - u) * (ay + 70) + u * u * by; g.fillStyle = CONFETI[k % 5]; g.beginPath(); g.moveTo(px - 14, py); g.lineTo(px + 14, py); g.lineTo(px, py + 24); g.closePath(); g.fill(); }
    }
    // suelo
    const gs = g.createLinearGradient(0, 496, 0, H + 60);
    gs.addColorStop(0, "#8a6a4a"); gs.addColorStop(1, "#4a3420");
    g.fillStyle = gs; g.fillRect(-60, 496, W + 120, H + 60 - 496);
    g.fillStyle = "rgba(0,0,0,.18)"; for (let x = -60; x < W + 60; x += 80) g.fillRect(x, 496, 2, H);
    CT.set("fondo", c);
    return c;
  }
  titulo() {
    if (CT.has("tit")) return CT.get("tit");
    const c = lienzoNuevo(1000, 170), g = c.getContext("2d");
    // cinta que tapa la pancarta
    const cinta = () => { g.beginPath(); g.moveTo(10, 22); g.lineTo(990, 22); g.lineTo(960, 85); g.lineTo(990, 148); g.lineTo(10, 148); g.lineTo(40, 85); g.closePath(); };
    g.save(); g.shadowColor = "rgba(0,0,0,.45)"; g.shadowBlur = 14; g.shadowOffsetY = 5; cinta(); g.fillStyle = "#c81e5a"; g.fill(); g.restore();
    const gc = g.createLinearGradient(0, 22, 0, 148);
    gc.addColorStop(0, "#ff7aa8"); gc.addColorStop(0.5, "#ff3d84"); gc.addColorStop(1, "#b0144a");
    cinta(); g.fillStyle = gc; g.fill(); g.strokeStyle = "#fffdf5"; g.lineWidth = 5; g.stroke();
    const gr = g.createLinearGradient(0, 40, 0, 130);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.6, "#fff4c0"); gr.addColorStop(1, "#ffd34d");
    txt(g, "¡FELICIDADES, MARCOS!", 503, 125, { tam: 96, peso: 400, fam: FC, color: "#3a0018", esp: 3, max: 880 });
    txt(g, "¡FELICIDADES, MARCOS!", 500, 121, { tam: 96, peso: 400, fam: FC, color: gr, borde: "#3a0018", bordeAncho: 10, esp: 3, max: 880 });
    CT.set("tit", c);
    return c;
  }
  globos(g, t) {
    const cols = ["#ff3d84", "#ffd34d", "#2fe3e8", "#e11e14", "#2bff5b", "#ffffff"];
    [[60, 210], [100, 250], [990, 330], [950, 360], [780, 300], [300, 260]].forEach(([x, y], i) => {
      const dx = 5 * Math.sin(t * 1.6 + i), yy = y + 4 * Math.sin(t * 2 + i);
      g.strokeStyle = "rgba(60,40,30,.5)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + dx, yy + 30); g.quadraticCurveTo(x + 10, yy + 80, x, yy + 130); g.stroke();
      g.fillStyle = cols[i]; g.beginPath(); g.ellipse(x + dx, yy, 24, 29, 0, 0, 6.283); g.fill();
      g.fillStyle = "rgba(255,255,255,.45)"; g.beginPath(); g.ellipse(x + dx - 8, yy - 10, 6, 9, -0.4, 0, 6.283); g.fill();
    });
  }
  dibujar(g) {
    const t = this.t, e = this.poses(), a = this.luz(), L = this.encendida();
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    this.globos(g, t);
    // manguera desde el carrete
    if (this.boq || (t > T_COGE && t < T_UPS + 0.3)) {
      const a0 = this.boq ? aPant(e.mM, this.boq.a) : [CARRETE[0] + 40, CARRETE[1] + 40];
      g.save(); g.lineCap = "round"; g.strokeStyle = "#7a1a10"; g.lineWidth = 12;
      g.beginPath(); g.moveTo(CARRETE[0] + 30, CARRETE[1] + 46); g.quadraticCurveTo(CARRETE[0] + 60, PIES + 10, a0[0], a0[1]); g.stroke();
      g.strokeStyle = "#e8402a"; g.lineWidth = 8; g.stroke(); g.restore();
    } else if (t < T_COGE) {
      boquilla(g, [CARRETE[0] + 30, CARRETE[1] + 50], [CARRETE[0] + 34, CARRETE[1] + 100]);
    }
    pintarAvatar(g, e.mM, e.M, t);
    pintarAvatar(g, e.mG, e.G, t);
    // chorro
    if (t > T_CHORRO[0] && t < T_CHORRO[1] && this.boq) {
      const a0 = aPant(e.mM, this.boq.b), b = aPant(e.mG, [26, 112]), k = tramo(t, T_CHORRO[0], T_CHORRO[0] + 0.08), f = mezcla(a0, b, k);
      g.save(); g.lineCap = "round";
      const ruta = () => { g.beginPath(); g.moveTo(a0[0], a0[1]); g.quadraticCurveTo((a0[0] + f[0]) / 2, Math.min(a0[1], f[1]) - 14, f[0], f[1]); };
      ruta(); g.strokeStyle = "rgba(70,160,255,.45)"; g.lineWidth = 22; g.stroke();
      ruta(); g.strokeStyle = "rgba(190,235,255,.95)"; g.lineWidth = 12; g.stroke();
      g.setLineDash([14, 10]); g.lineDashOffset = -t * 600; ruta(); g.strokeStyle = "#fff"; g.lineWidth = 4; g.stroke();
      g.restore();
    }
    this.agua.dibujar(g);
    this.p.dibujar(g);
    // oscuridad antes de las luces (con el brillo de las velas)
    if (L < 1) {
      g.fillStyle = `rgba(4,6,16,${0.9 * (1 - L)})`; g.fillRect(-60, -60, W + 120, H + 120);
      // luz de la puerta
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35 * (1 - L);
      g.fillStyle = "#ffd28a"; g.beginPath(); g.moveTo(-20, 120); g.lineTo(50, 120); g.lineTo(420, PIES + 20); g.lineTo(-20, PIES + 20); g.closePath(); g.fill();
      // velitas
      const c = aPant(e.mG, [39, 96]);
      g.globalAlpha = (1 - L) * (0.8 + 0.2 * Math.sin(t * 20)); g.drawImage(BLOB2.oro, c[0] - 90, c[1] - 90, 180, 180);
      g.restore();
      g.save(); g.globalAlpha = 1 - L;
      const m = e.mG; conMat(g, m, () => tarta(g, 39, 136, 0, true, t));
      g.restore();
    }
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.12, dur) });
      g.restore();
    };
    ono("¡SORPRESA!", 512, 230, T_LUZ, 1.1, 84, "#ffd34d", "#3a1a00", -0.05);
    // notas al cantar
    if (t > T_ANDA && t < T_SOPLA) {
      g.save(); g.fillStyle = "#3a2a6a"; g.strokeStyle = "#3a2a6a"; g.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const f = ((t * 0.9 + i / 3) % 1), c = aPant(e.mG, [60, 30]), x = c[0] + 40 + f * 60, y = c[1] - f * 120;
        g.globalAlpha = Math.sin(f * Math.PI);
        g.beginPath(); g.ellipse(x, y, 8, 6, -0.4, 0, 6.283); g.fill(); g.beginPath(); g.moveTo(x + 7, y - 2); g.lineTo(x + 7, y - 30); g.lineTo(x + 18, y - 22); g.stroke();
      }
      g.restore();
    }
    if (t > T_SOPLA && t < T_VE + 0.1) bocadillo(g, 720, 200, "¡SOPLA!", XG + 20, 290, tramo(t, T_SOPLA, T_SOPLA + 0.12) * (1 - tramo(t, T_VE - 0.05, T_VE + 0.1)), 40);
    if (t > T_VE && t < T_COGE + 0.15) {
      // alarma en la cabeza de Marcos
      const c = aPant(e.mM, [37, -30]), on = Math.sin(t * 40) > 0;
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = on ? 0.9 : 0.3; g.drawImage(BLOB.rojo, c[0] - 70, c[1] - 70, 140, 140); g.restore();
      txt(g, "!", c[0], c[1] + 22, { tam: 70, peso: 400, fam: FC, color: on ? "#fffdf5" : "#ffd34d", borde: "#7a0000", bordeAncho: 8 });
      bocadillo(g, XM - 150, 150, "¡FUEGO!", XM - 40, 230, tramo(t, T_VE + 0.05, T_VE + 0.18), 40);
    }
    ono("¡FSSSHH!", 470, 300, T_CHORRO[0], 0.9, 60, "#2fe3e8", "#06303a", -0.06);
    ono("¡UPS!", XM - 120, 220, T_UPS + 0.25, 0.7, 52, "#fffdf5", "#1b1b1b", -0.1);
    ono("¡ÑAM!", XG + 130, 230, T_NAM, 0.6, 50, "#ffd34d", "#3a2400", 0.1);
    // ¡FELICIDADES, MARCOS!
    if (t > T_TIT) {
      const d = t - T_TIT, k = tramo(d, 0, 0.16), s = lerp(2, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 92); g.rotate(-0.02); g.scale(s * 0.98, s * 0.98);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const n = 1 - a;
    if (n > 0) { g.fillStyle = `rgba(0,0,0,${n})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00253", nombre: "Cumpleaños de Marcos", crear: () => new Cumpleanos() });
})();
