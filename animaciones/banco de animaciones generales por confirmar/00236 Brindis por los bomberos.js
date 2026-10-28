"use strict";
/*
 * 00236 · BRINDIS POR LOS BOMBEROS
 *
 * Animación del banco. Empieza y acaba en negro.
 * El bar está lleno (clones de Guillermo con gafas, pelo dorado o un casco amarillo de fan). Guillermo presenta a Marcos
 * (¡UN APLAUSO!) y dirige al público como un director de orquesta: las jarras suben y bajan en ola (¡HURRA!, ¡BRAVO!).
 * Marcos, de uniforme y con su vaso de agua, se va poniendo colorado hasta echar humo por el casco. Al final todos
 * levantan las jarras y él su vaso de agua: ¡POR LOS BOMBEROS! Beben, Guillermo aplaude y Marcos saluda. Fundido a negro.
 */
(() => {
const CT = cacheTexto();
const DUR = 10.2, ESC = 1.5, ESC_C = 1.2, PIES_C = 534;
const XG = 420, XM = 610;
const T_PRESENTA = 0.6, T_DIRIGE = 1.6, T_BRINDIS = 4.3, T_BEBEN = 6.1, T_SALUDO = 7.6, T_APAGA = 9.65;
const CLONES = [
  { x: 74, cara: "risa", gafas: true },
  { x: 192, cara: "guino", oro: 1 },
  { x: 306, cara: "risa", casco: true, cascoColor: "#f2c21b" },
  { x: 724, cara: "sorpresa", puntas: 0.6 },
  { x: 838, cara: "risa", gafas: true, oro: 0.7 },
  { x: 952, cara: "guino" },
];
const EV = 1.4;
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

/** Vaso de agua con hielo y limón; (x, y) = donde se coge (unidades de avatar). */
function vasoAgua(g, x, y, ang, nivel, t) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(EV, EV);
  const T = -16, B = 10, wt = 8.6, wb = 6.8;
  const forma = () => {
    g.beginPath(); g.moveTo(-wt, T); g.lineTo(wt, T); g.lineTo(wb, B - 1.6); g.quadraticCurveTo(wb, B, wb - 1.6, B);
    g.lineTo(-wb + 1.6, B); g.quadraticCurveTo(-wb, B, -wb, B - 1.6); g.closePath();
  };
  forma(); g.fillStyle = "rgba(200,235,255,.18)"; g.fill();
  g.save(); forma(); g.clip();
  const alto = (B - T - 2) * clamp(nivel, 0, 1), ys = B - 1 - alto;
  const gr = g.createLinearGradient(0, ys, 0, B);
  gr.addColorStop(0, "rgba(150,220,255,.6)"); gr.addColorStop(1, "rgba(50,140,230,.75)");
  g.fillStyle = gr; g.fillRect(-wt, ys, wt * 2, B - ys + 1);
  g.fillStyle = "rgba(235,250,255,.8)"; g.strokeStyle = "rgba(255,255,255,.95)"; g.lineWidth = 0.6;
  const fl = Math.sin(t * 3) * 0.6;
  rectR(g, -6, ys - 2 + fl, 6, 6, 1.4); g.fill(); g.stroke();
  rectR(g, 0.5, ys + 1.5 - fl, 5.5, 5.5, 1.4); g.fill(); g.stroke();
  g.fillStyle = "rgba(255,255,255,.7)";
  for (let i = 0; i < 4; i++) { const by = B - 2 - ((t * 9 + i * 4.3) % Math.max(2, alto - 2)); g.beginPath(); g.arc(-4 + i * 2.6, by, 0.6, 0, 6.283); g.fill(); }
  g.restore();
  forma(); g.strokeStyle = "rgba(225,245,255,.95)"; g.lineWidth = 1.1; g.stroke();
  g.fillStyle = "rgba(255,255,255,.6)"; g.fillRect(-wt + 2.2, T + 3, 1.3, B - T - 6);
  g.save(); g.translate(wt - 1.5, T + 0.5);
  g.fillStyle = "#e8c400"; g.beginPath(); g.arc(0, 0, 5.2, 0, 6.283); g.fill();
  g.fillStyle = "#fff6a0"; g.beginPath(); g.arc(0, 0, 4.1, 0, 6.283); g.fill();
  g.restore();
  g.restore();
}
function botella(g, x, y, w, h, c1, c2) {
  const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  gr.addColorStop(0, c2); gr.addColorStop(0.45, c1); gr.addColorStop(1, c2);
  g.fillStyle = gr;
  const hc = h * 0.62;
  rectR(g, x - w / 2, y - hc, w, hc, 3); g.fill();
  g.beginPath(); g.moveTo(x - w / 2 + 1, y - hc + 3); g.quadraticCurveTo(x - w * 0.2, y - hc - 5, x - w * 0.17, y - h + 5);
  g.lineTo(x + w * 0.17, y - h + 5); g.quadraticCurveTo(x + w * 0.2, y - hc - 5, x + w / 2 - 1, y - hc + 3); g.closePath(); g.fill();
  g.fillStyle = "#151515"; g.fillRect(x - w * 0.19, y - h, w * 0.38, 6);
  g.fillStyle = "rgba(255,248,225,.7)"; g.fillRect(x - w / 2 + 2, y - hc * 0.66, w - 4, hc * 0.32);
}

class BrindisBomberos extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(420);
    this.cF = null;
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** Lo colorado que está Marcos (0–1). */
  rubor(t) { return Math.min(1, tramo(t, 1.0, 3.6) + 0.3 * tramo(t, T_BRINDIS, T_BRINDIS + 0.3)) * (1 - 0.3 * tramo(t, T_SALUDO + 0.6, T_SALUDO + 1.5)); }
  /** Ritmo del director: 1 arriba, -1 abajo. */
  ritmo(t) { return Math.sin((t - T_DIRIGE) * Math.PI * 2 * 1.1); }
  // ------------------------------------------------------------------ poses
  clones() {
    const t = this.t;
    return CLONES.map((c, i) => {
      const P0 = { cara: c.cara, rc: 0.08 * Math.sin(t * 2 + i), piernaI: [0, 0], piernaD: [0, 0], gafas: c.gafas, oro: c.oro, puntas: c.puntas, casco: c.casco, cascoColor: c.cascoColor };
      let mD = [76, 120], mI = [6, 150], inc = -0.1, y = PIES_C;
      const dirige = t > T_DIRIGE && t < T_BRINDIS;
      if (t < T_DIRIGE) { mD = [78, 112]; P0.rc = (c.x < 512 ? 0.14 : -0.14); }
      if (dirige) {
        // la ola: suben y bajan la jarra con desfase
        const r = Math.sin((t - T_DIRIGE) * Math.PI * 2 * 1.1 - i * 0.6);
        mD = [84, 70 - 46 * Math.max(0, r)]; inc = -0.25 * Math.max(0, r);
        mI = r > 0.3 ? [-14, 46] : [6, 140];
        P0.cara = r > 0.4 ? "risa" : c.cara;
        y -= 10 * Math.max(0, r);
      }
      if (t >= T_BRINDIS) {
        const k = eBack(tramo(t, T_BRINDIS - 0.15, T_BRINDIS + 0.15));
        mD = mezcla([84, 70], [82, 16 + 3 * Math.sin(t * 6 + i)], k); inc = -0.3 * k; mI = [-16, 40 + 4 * Math.sin(t * 6 + i)];
        P0.cara = "risa"; y = PIES_C - Math.abs(Math.sin((t - T_BRINDIS) * 7 + i)) * 8 * (1 - tramo(t, T_BRINDIS + 1, T_BRINDIS + 1.6));
      }
      if (t >= T_BEBEN && i % 2 === 0) {
        // algunos beben
        const kS = eInOut(tramo(t, T_BEBEN + i * 0.1, T_BEBEN + 0.3 + i * 0.1)), kT = tramo(t, T_BEBEN + 0.3 + i * 0.1, T_BEBEN + 1.0), kB = eInOut(tramo(t, T_BEBEN + 1.1, T_BEBEN + 1.4));
        const rc = -0.28 * kS * (1 - kB), ii = (-0.4 * kS - 0.9 * eInOut(kT)) * (1 - kB);
        const b = boca(rc), r = rot2(JARRA.borde, ii);
        mD = mezcla(mezcla([82, 18], [b[0] - r[0], b[1] - r[1]], kS), [82, 30], kB); inc = kS > 0 ? ii : inc;
        if (kS > 0.5 && kB < 0.5) { P0.rc = rc; P0.cara = "dormido"; }
      }
      P0.manoD = mD; P0.manoI = mI; P0.jarra = { inc, nivel: t >= T_BEBEN + 0.6 && i % 2 === 0 ? 0.5 : 0.88 };
      return { pose: P0, m: matAv(c.x, y, ESC_C) };
    });
  }
  poses() {
    const t = this.t, r = this.ritmo(t);
    // --- Guillermo, el director
    const G = { cara: "risa", rc: 0.1, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let gD = [70, 150], gI = [6, 150], yg = PIES;
    if (t > T_PRESENTA && t < T_DIRIGE) {
      const k = eOut(tramo(t, T_PRESENTA, T_PRESENTA + 0.3));
      gD = mezcla(gD, [112, 96], k); gI = mezcla(gI, [64, 100], k); G.rc = 0.16; G.cara = "risa";
    }
    if (t >= T_DIRIGE && t < T_BRINDIS) {
      const k = eInOut(tramo(t, T_DIRIGE, T_DIRIGE + 0.25));
      const arr = (r + 1) / 2;
      gD = mezcla([112, 96], [94, lerp(100, 22, arr)], k); gI = mezcla([64, 100], [-16, lerp(100, 22, arr)], k);
      G.rc = 0.12 * Math.sin((t - T_DIRIGE) * Math.PI * 1.1); G.cara = arr > 0.6 ? "risa" : "guino";
      yg = PIES - 8 * Math.max(0, r);
    }
    if (t >= T_BRINDIS) {
      const k = eBack(tramo(t, T_BRINDIS - 0.15, T_BRINDIS + 0.15));
      gD = mezcla([94, 60], [96, 14], k); gI = mezcla([-16, 60], [-20, 14], k); G.cara = "risa"; G.rc = 0.05 * Math.sin(t * 6);
      yg = PIES - Math.abs(Math.sin((t - T_BRINDIS) * 7)) * 14 * (1 - tramo(t, T_BRINDIS + 1, T_BRINDIS + 1.6));
    }
    if (t >= T_BEBEN) {
      // aplaude
      const ap = Math.abs(Math.sin(t * 12));
      gD = [50, 100 - 5 * ap]; gI = [28 + 7 * ap, 100]; G.rc = 0.14; G.cara = t > 8.6 && t < 8.9 ? "guino" : "risa";
    }
    G.manoD = gD; G.manoI = gI;
    // --- Marcos, colorado, con su vaso de agua
    const M = { quien: "bombero", cara: "sonrisa", rc: -0.06, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let mD = [67, 152], mI = [6, 112], angV = 0, ym = PIES, giro = 0;
    if (t > T_PRESENTA + 0.2) { M.cara = "sorpresa"; M.rc = -0.12; }
    if (t > T_DIRIGE - 0.2) {
      // vergüenza: se rasca la nuca
      const k = eInOut(tramo(t, T_DIRIGE - 0.2, T_DIRIGE + 0.2));
      mD = mezcla([67, 152], [62, 30 + 2 * Math.sin(t * 12)], k);
      M.cara = Math.floor(t * 1.5) % 3 === 2 ? "guino" : "sonrisa"; M.rc = -0.1 + 0.04 * Math.sin(t * 3);
    }
    if (t >= T_BRINDIS) {
      // ¡por los bomberos! levanta su vaso de agua
      const k = eBack(tramo(t, T_BRINDIS - 0.15, T_BRINDIS + 0.15));
      mI = mezcla([6, 112], [-2, 36 + 3 * Math.sin(t * 6)], k); mD = mezcla([62, 30], [70, 110], k);
      M.cara = "risa"; M.rc = -0.05;
    }
    if (t >= T_BEBEN) {
      // un sorbito de agua
      const kS = eInOut(tramo(t, T_BEBEN + 0.2, T_BEBEN + 0.5)), kT = tramo(t, T_BEBEN + 0.5, T_BEBEN + 1.1), kB = eInOut(tramo(t, T_BEBEN + 1.2, T_BEBEN + 1.5));
      const rc = -0.12 * kS * (1 - kB);
      angV = (0.4 * kS + 0.45 * eInOut(kT)) * (1 - kB);
      const b = boca(rc, "bombero"), rr = rot2([7.5 * EV, -16 * EV], angV);
      mI = mezcla(mezcla([-2, 36], [b[0] - rr[0] - 1, b[1] - rr[1] + 1], kS), [4, 100], kB);
      if (kS > 0.5 && kB < 0.5) { M.rc = rc; M.cara = "dormido"; }
    }
    if (t >= T_SALUDO) {
      // saluda llevándose la mano al casco, colorado
      const k = eBack(tramo(t, T_SALUDO, T_SALUDO + 0.25));
      mD = mezcla([70, 110], [55, 36], k); M.cara = Math.floor(t * 2) % 3 === 0 ? "guino" : "risa"; M.rc = -0.04;
      giro = -0.04 * Math.sin(Math.PI * tramo(t, T_SALUDO, T_SALUDO + 0.8));
    }
    M.manoD = mD; M.manoI = mI;
    const ru = this.rubor(t), rcM = M.rc, nv = lerp(0.85, 0.6, tramo(t, T_BEBEN + 0.6, T_BEBEN + 1.1)), aV = angV;
    M.objI2 = (g, m) => vasoAgua(g, m[0], m[1], aV, nv, t);
    M.objD = (g) => {
      if (ru <= 0.01) return;
      const R = avatar("bombero").rig;
      g.save(); g.translate(R.cuello[0], R.cuello[1]); g.rotate(rcM); g.translate(-R.cuello[0], -R.cuello[1]);
      g.save(); g.beginPath(); g.ellipse(37, 52, 25, 24, 0, 0, 6.283); g.clip();
      g.fillStyle = `rgba(255,50,40,${0.22 * ru})`; g.fillRect(0, 20, 80, 70);
      g.restore();
      g.fillStyle = `rgba(255,40,70,${0.55 * ru})`;
      for (const x of [20, 54]) { g.beginPath(); g.ellipse(x, 59, 7.5, 4.6, 0, 0, 6.283); g.fill(); }
      g.restore();
    };
    return { G, mG: matAv(XG, yg, ESC), M, mM: matAv(XM, ym, ESC, giro) };
  }
  // ------------------------------------------------------------------ actualizar
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // humo de vergüenza por el casco
    if (this.rubor(t) > 0.85 && t < T_BRINDIS + 1 && Math.random() < 10 * dt) {
      const e = this.poses(), c = aPant(e.mM, [37 + azar(-20, 20), -6]);
      p.nueva(P.VAPOR, c[0], c[1], azar(-20, 20), azar(-120, -70), azar(0.6, 1), azar(16, 28));
    }
    this.una("brindis", t > T_BRINDIS, () => {
      temblar(18, 0.45);
      for (const c of this.clones()) {
        const h = aPant(c.m, c.pose.manoD);
        for (let i = 0; i < 8; i++) { const a = azar(-Math.PI, 0), v = azar(100, 300); p.nueva(P.ESPUMA, h[0] + 20, h[1] - 30, Math.cos(a) * v, Math.sin(a) * v, azar(0.5, 0.9), azar(5, 9)); }
      }
      p.nueva(P.DESTELLO, 512, 200, 0, 0, 0.4, 300);
      for (let i = 0; i < 100; i++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-80, -10), azar(-40, 40), azar(0, 120), azar(2.6, 3.8), azar(9, 15), i % 5);
    });
    p.suelo = () => PIES;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  // ------------------------------------------------------------------ fondo
  fondoBar() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gr = g.createLinearGradient(0, -60, 0, H);
    gr.addColorStop(0, "#140b07"); gr.addColorStop(0.6, "#25150b"); gr.addColorStop(1, "#160c06");
    g.fillStyle = gr; g.fillRect(-60, -60, W + 120, H + 120);
    g.fillStyle = "rgba(0,0,0,.22)"; for (let x = -40; x < W + 60; x += 58) g.fillRect(x, -60, 3, H + 120);
    const r = semilla(53);
    const COL = [["#3a9a4a", "#174a20"], ["#b0521e", "#4a1a06"], ["#e0b840", "#7a5a10"], ["#4a7ac0", "#13305a"], ["#c02238", "#500810"], ["#ecebdc", "#8a8670"]];
    for (const y of [130, 214]) {
      for (let x = 22; x < W - 10; x += 24 + r() * 9) {
        if (r() < 0.12) continue;
        const [c1, c2] = COL[(r() * COL.length) | 0];
        botella(g, x, y, 13 + r() * 5, 40 + r() * 26, c1, c2);
      }
      g.fillStyle = "#6a3e1c"; g.fillRect(-60, y, W + 120, 9);
      g.fillStyle = "rgba(255,210,150,.3)"; g.fillRect(-60, y, W + 120, 2);
      g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(-60, y + 9, W + 120, 7);
    }
    // guirnalda de banderitas
    for (let i = 0; i < 22; i++) {
      const x = -20 + i * 50, y = 34 + 20 * Math.sin((i / 21) * Math.PI);
      g.fillStyle = ["#e3262f", "#ffd34d", "#2fe3e8", "#2bff5b", "#ff3d84"][i % 5];
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + 40, y + 4); g.lineTo(x + 20, y + 36); g.closePath(); g.fill();
    }
    g.strokeStyle = "#f4ead0"; g.lineWidth = 2; g.beginPath(); for (let i = 0; i <= 22; i++) { const x = -20 + i * 50, y = 34 + 20 * Math.sin((i / 21) * Math.PI); if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke();
    // suelo
    const gs = g.createLinearGradient(0, PIES - 60, 0, H);
    gs.addColorStop(0, "#3a2412"); gs.addColorStop(1, "#1c1008");
    g.fillStyle = gs; g.fillRect(-60, PIES - 60, W + 120, H - PIES + 120);
    g.globalCompositeOperation = "lighter";
    for (const x of [200, 512, 830]) { g.globalAlpha = 0.35; g.drawImage(BLOB2.oro, x - 240, 0, 480, 480); }
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    const v = g.createRadialGradient(W / 2, 300, 240, W / 2, 300, 720);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.72)");
    g.fillStyle = v; g.fillRect(-60, -60, W + 120, H + 120);
    return (this.cF = c);
  }
  // ------------------------------------------------------------------ dibujar
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses(), cl = this.clones();
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    g.drawImage(this.fondoBar(), -60, -60);
    // el público, un poco más atrás y en penumbra
    for (const c of cl) { const x = aPant(c.m, [39, 232]); g.fillStyle = "rgba(0,0,0,.3)"; g.beginPath(); g.ellipse(x[0], PIES_C + 2, 46, 7, 0, 0, 6.283); g.fill(); }
    for (const c of cl) pintarAvatar(g, c.m, c.pose, t);
    g.fillStyle = "rgba(10,5,2,.28)"; g.fillRect(-60, -60, W + 120, H + 120);
    // los dos, con foco
    foco(g, XG, XG, PIES, 150, 0.55); foco(g, XM, XM, PIES, 150, 0.55 + 0.3 * tramo(t, T_BRINDIS, T_BRINDIS + 0.3));
    for (const m of [e.mG, e.mM]) { const x = aPant(m, [39, 232]); g.fillStyle = "rgba(0,0,0,.4)"; g.beginPath(); g.ellipse(x[0], PIES + 2, 58, 9, 0, 0, 6.283); g.fill(); }
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    // el vaso de agua brilla en el brindis
    if (t > T_BRINDIS && t < T_BEBEN) { const m = e.M._manoI; if (m) { const q = aPant(e.mM, [m[0], m[1] - 30]); brillo(g, q[0] + 10, q[1], 26 * Math.abs(Math.sin(t * 4)), 1); } }
    g.restore();
    this.p.dibujar(g);
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 7, esp: 2, alfa: a * (1 - tramo(d, dur - 0.15, dur)) });
      g.restore();
    };
    if (t > T_PRESENTA + 0.1 && t < T_DIRIGE + 0.2) {
      const k = tramo(t, T_PRESENTA + 0.1, T_PRESENTA + 0.3) * (1 - tramo(t, T_DIRIGE, T_DIRIGE + 0.2));
      const b = aPant(e.mG, [50, 50]);
      bocadillo(g, 300, 120, "¡UN APLAUSO!", b[0] - 10, b[1] - 20, k * a, 42);
    }
    ono("¡HURRA!", 130, 250, 1.9, 0.6, 40, "#ffd34d", "#3a2400", -0.08);
    ono("¡BRAVO!", 880, 240, 2.3, 0.6, 40, "#ffd34d", "#3a2400", 0.08);
    ono("¡EH, EH!", 250, 230, 2.9, 0.6, 38, "#fffdf5", "#1b1b1b", 0.06);
    ono("¡HURRA!", 790, 260, 3.4, 0.6, 40, "#ffd34d", "#3a2400", -0.06);
    ono("¡CHIN!", 520, 196, T_BRINDIS, 0.7, 64, "#ffd34d", "#3a2400", -0.06);
    ono("GLU, GLU", 150, 330, T_BEBEN + 0.4, 0.8, 34, "#ffd34d", "#3a2400", -0.05);
    ono("SLURP", 700, 300, T_BEBEN + 0.6, 0.7, 34, "#bfeaff", "#06303a", 0.06);
    // ¡POR LOS BOMBEROS!
    if (t > T_BRINDIS) {
      const d = t - T_BRINDIS, k = tramo(d, 0, 0.18), s = lerp(2.2, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a; g.translate(512, 96); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(1000, 190), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 150);
    gr.addColorStop(0, "#fffef0"); gr.addColorStop(0.5, "#ffe58a"); gr.addColorStop(1, "#ff6a1a");
    txt(g, "¡POR LOS BOMBEROS!", 505, 148, { tam: 116, peso: 900, fam: FD, color: "#3a1200", esp: 4, max: 940 });
    txt(g, "¡POR LOS BOMBEROS!", 500, 140, { tam: 116, peso: 900, fam: FD, color: gr, borde: "#3a1200", bordeAncho: 12, esp: 4, glow: "rgba(255,150,40,.9)", glowTam: 26, max: 940 });
    CT.set("t", c);
    return c;
  }
}

registrar({ id: "00236", nombre: "Brindis por los bomberos", crear: () => new BrindisBomberos() });
})();
