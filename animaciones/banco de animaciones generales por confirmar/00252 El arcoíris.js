"use strict";
/*
 * 00252 · EL ARCOÍRIS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Atardecer en el campo. Marcos apunta la manguera hacia arriba: una fuente de gotas… y sale un arcoíris enorme
 * (¡OOOH!). A Guillermo se le ocurre algo: se sube de un salto (¡HOP!), Marcos detrás, y suben andando por el
 * arcoíris hasta lo más alto. Se sientan y bajan deslizándose como por un tobogán, cada vez más rápido (¡WIIIII!), salen
 * disparados por el final y aterrizan de culo en la hierba (¡PLAF!), muertos de risa: ¡ARCOÍRIS!
 */
(() => {
const CT = cacheTexto();
const ESC = 1.15;
const CXA = 480, CYA = 700, R0 = 360, BANDA = 12;
const COLS = ["#ff3b30", "#ff9500", "#ffd60a", "#34c759", "#0a84ff", "#5e5ce6", "#bf5af2"];
const XM0 = 84, XG0 = 230;
const T_APUNTA = 0.5, T_AGUA = 1.0, T_ARCO = [1.55, 2.8], T_CORTA = 2.85, T_IDEA = 3.0;
const T_HOP_G = 3.35, T_HOP_M = 3.6, T_SUBE = [3.6, 5.3], T_SIENTA = 5.35, T_DESLIZA = [5.75, 7.0], RETRASO_M = 0.22;
const T_PLAF = 7.35, T_CHOCA = 8.7, T_APAGA = 10.35, DUR = 10.9;
const RAD = Math.PI / 180;
const P_ARCO = (th) => [CXA + R0 * Math.cos(th), CYA - R0 * Math.sin(th)];
const TH_G0 = 132 * RAD, TH_M0 = 142 * RAD, TH_GTOP = 86 * RAD, TH_MTOP = 102 * RAD, TH_FIN = 21 * RAD;
const XG_FIN = 830, XM_FIN = 945;

const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

class Agua {
  constructor(max) { this.max = max; this.n = 0; this.d = new Float32Array(max * 6); }
  nueva(x, y, vx, vy, vida, tam) { if (this.n >= this.max) return; const o = this.n++ * 6, d = this.d; d[o] = x; d[o + 1] = y; d[o + 2] = vx; d[o + 3] = vy; d[o + 4] = vida; d[o + 5] = tam; }
  actualizar(dt) {
    const d = this.d; let i = 0;
    while (i < this.n) {
      const o = i * 6; d[o + 4] -= dt;
      if (d[o + 4] <= 0 || d[o + 1] > PIES + 10) { const u = (this.n - 1) * 6; for (let k = 0; k < 6; k++) d[o + k] = d[u + k]; this.n--; continue; }
      d[o + 3] += 900 * dt; d[o] += d[o + 2] * dt; d[o + 1] += d[o + 3] * dt; i++;
    }
  }
  dibujar(g) {
    const d = this.d; g.save(); g.fillStyle = "#cfefff";
    for (let i = 0; i < this.n; i++) { const o = i * 6, s = d[o + 5]; g.globalAlpha = Math.min(1, d[o + 4] * 2) * 0.85; g.beginPath(); g.ellipse(d[o], d[o + 1], s * 0.65, s, Math.atan2(d[o + 3], d[o + 2]) + Math.PI / 2, 0, 6.283); g.fill(); }
    g.restore();
  }
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

class Arcoiris extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(360);
    this.p.suelo = () => PIES + 6;
    this.agua = new Agua(260);
    this.fG = 0; this.fM = 0;
  }
  luz() { return tramo(this.t, 0.02, 0.45) * (1 - tramo(this.t, T_APAGA, DUR - 0.03)); }
  barrido() { return eInOut(tramo(this.t, T_ARCO[0], T_ARCO[1])); }
  /** Estado de cada uno en el arco: { x, y, giro, sy, en } o null si está en el suelo. */
  enArco(quien) {
    const t = this.t, esG = quien === "G";
    const tHop = esG ? T_HOP_G : T_HOP_M, th0 = esG ? TH_G0 : TH_M0, thTop = esG ? TH_GTOP : TH_MTOP;
    const x0 = esG ? XG0 : XM0 + 70, ret = esG ? 0 : RETRASO_M;
    if (t < tHop) return null;
    if (t < tHop + 0.3) {
      const u = tramo(t, tHop, tHop + 0.3), p = P_ARCO(th0);
      return { x: lerp(x0, p[0], u), y: lerp(PIES, p[1], u) - Math.sin(u * Math.PI) * 60, giro: lerp(0, 0.45 * (Math.PI / 2 - th0), u), sy: 1, fase: "salto" };
    }
    const tFin = T_DESLIZA[1] + ret;
    if (t < T_SIENTA) {
      const u = eInOut(tramo(t, tHop + 0.3, T_SUBE[1])), th = lerp(th0, thTop, u), p = P_ARCO(th);
      return { x: p[0], y: p[1], giro: 0.45 * (Math.PI / 2 - th), sy: 1, fase: u < 1 ? "sube" : "arriba" };
    }
    if (t < tFin) {
      // se sienta dentro del arcoíris (las bandas le tapan las piernas) y baja como por un tobogán
      const k = eInOut(tramo(t, T_SIENTA, T_SIENTA + 0.3));
      const u = eIn(tramo(t, T_DESLIZA[0] + ret, tFin)), th = lerp(thTop, TH_FIN, u);
      const gS = 0.45 * (Math.PI / 2 - thTop), pS = P_ARCO(thTop);
      const caderaS = [pS[0] + Math.sin(gS) * 90 * ESC, pS[1] - Math.cos(gS) * 90 * ESC];
      const rH = R0 - 12, caderaD = [CXA + rH * Math.cos(th), CYA - rH * Math.sin(th)];
      const c = mezcla(caderaS, caderaD, k);
      return { x: c[0], y: c[1], giro: lerp(gS, 0.8 * (Math.PI / 2 - th), k), sy: 1 - 0.12 * k, fase: u > 0 ? "baja" : "sentado", u, piv: esG ? [39, 142] : [37, 142], dentro: k > 0.02 };
    }
    if (t < tFin + 0.35) {
      // sale disparado por el final y aterriza
      const u = tramo(t, tFin, tFin + 0.35), rH = R0 - 12, xf = esG ? XG_FIN : XM_FIN;
      const c0 = [CXA + rH * Math.cos(TH_FIN), CYA - rH * Math.sin(TH_FIN)], c1 = [xf, PIES - 90 * ESC * 0.7];
      return { x: lerp(c0[0], c1[0], u), y: lerp(c0[1], c1[1], u) - Math.sin(u * Math.PI) * 70, giro: lerp(0.8 * (Math.PI / 2 - TH_FIN), 0, eOut(u)), sy: lerp(0.88, 0.7, u), fase: "vuela", u: 1, piv: esG ? [39, 142] : [37, 142] };
    }
    return null;
  }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let mG, mM;
    // ---- en el suelo, al principio
    this.boq = null;
    if (t < T_HOP_M) {
      const k = eInOut(tramo(t, T_APUNTA, T_AGUA));
      if (t < T_CORTA + 0.1) {
        M.manoD = mezcla([84, 124], [84, 72], k); M.manoI = mezcla([44, 132], [52, 104], k); M.brazoIDelante = true;
        M.cara = t > T_AGUA ? "risa" : "guino"; M.rc = 0.06;
        const a = M.manoI, b = M.manoD, d = [b[0] - a[0], b[1] - a[1]], L = Math.hypot(d[0], d[1]);
        this.boq = { a, b: [b[0] + d[0] / L * 20, b[1] + d[1] / L * 20] };
      } else { M.cara = "sorpresa"; M.rc = 0.1; }
      if (t > T_ARCO[0]) { M.cara = "sorpresa"; M.rc = -0.12; }
      G.cara = t > T_ARCO[0] ? "sorpresa" : "sonrisa"; G.rc = -0.1;
      if (t > T_ARCO[0] + 0.3 && t < T_IDEA) { G.manoD = [104, 30]; G.rc = -0.18; }
      if (t > T_IDEA && t < T_HOP_G) { G.cara = "guino"; G.rc = -0.12; G.manoI = [-14, 96]; G.manoD = [76, 112]; G.brazoIDelante = true; M.cara = "risa"; }
      let xm = XM0, fm = null;
      if (t > T_CORTA + 0.1) {
        const u = tramo(t, T_IDEA, T_HOP_M); xm = lerp(XM0, XM0 + 70, eInOut(u));
        if (u > 0 && u < 1) { fm = andar(this.fM, 1); M.piernaI = fm.piernaI; M.piernaD = fm.piernaD; }
      }
      mM = matAv(xm, PIES + (fm ? fm.bote * ESC : 0), ESC);
    }
    if (t < T_HOP_G) mG = matAv(XG0, PIES, ESC);
    // ---- en el arcoíris
    for (const [P, q] of [[G, "G"], [M, "M"]]) {
      const s = this.enArco(q);
      if (!s) continue;
      const esG = q === "G", R = avatar(esG ? undefined : "bombero").rig;
      if (s.fase === "salto") { P.manoD = [R.manoD[0] + 26, 70]; P.manoI = [R.manoI[0] - 26, 70]; P.cara = "risa"; P.piernaI = [-10, 0.2]; P.piernaD = [-10, -0.2]; }
      else if (s.fase === "sube") {
        const a = andar(esG ? this.fG : this.fM, 1); P.piernaI = a.piernaI; P.piernaD = a.piernaD;
        P.manoD = [R.manoD[0] + 14, R.manoD[1] - 30]; P.manoI = [R.manoI[0] - 14, R.manoI[1] - 30]; P.cara = esG ? "risa" : "sonrisa"; P.rc = esG ? -0.1 : 0.1;
      } else if (s.fase === "arriba" || s.fase === "sentado") {
        P.cara = t > T_SIENTA ? "guino" : "risa"; P.rc = esG ? -0.12 : 0.12;
        if (esG && t < T_SIENTA) { P.manoD = [96, 40 + 8 * Math.sin(t * 12)]; }
        if (!esG && t < T_SIENTA) { P.manoI = [-18, 44 + 8 * Math.sin(t * 12 + 1)]; }
        if (t > T_SIENTA) { P.manoD = [R.manoD[0] + 12, 130]; P.manoI = [R.manoI[0] - 12, 130]; P.piernaI = [-6, 0.35]; P.piernaD = [-6, -0.35]; }
      } else if (s.fase === "baja" || s.fase === "vuela") {
        P.manoD = [R.manoD[0] + 30, 30]; P.manoI = [R.manoI[0] - 30, 30]; P.cara = "risa"; P.puntas = 0.4 + 0.6 * (s.u || 1); P.rc = 0.05 * Math.sin(t * 20);
        P.piernaI = [-8, 0.45]; P.piernaD = [-8, -0.45];
        if (!esG && s.u < 0.3) P.cara = "sorpresa";
      }
      const m = matAv(s.x, s.y, ESC, s.giro, 1, s.sy, s.piv || [39, 232]);
      if (esG) mG = m; else mM = m;
    }
    // ---- aterrizados: de culo en la hierba, risas, chocan las manos
    const aterr = (q) => !this.enArco(q) && t > T_DESLIZA[1];
    for (const [P, q] of [[G, "G"], [M, "M"]]) {
      if (!aterr(q)) continue;
      const esG = q === "G", tl = T_DESLIZA[1] + (esG ? 0 : RETRASO_M) + 0.35;
      const d = t - tl;
      const levanta = eInOut(tramo(t, T_CHOCA - 0.6, T_CHOCA - 0.25));
      const sy = lerp(0.68 + 0.04 * Math.exp(-d * 6) * Math.sin(d * 30), 1, levanta);
      P.cara = d < 0.35 ? "sorpresa" : "risa"; P.puntas = Math.max(0, 1 - d * 2);
      const s = Math.sin(t * 15);
      P.manoD = esG ? [56, 124 + 4 * s] : [56, 120 + 4 * s]; P.manoI = esG ? [22, 124 - 4 * s] : [20, 120 - 4 * s]; P.brazoIDelante = true;
      P.rc = (esG ? 0.12 : -0.12) + 0.05 * s;
      P.piernaI = [-8 * (1 - levanta), 0.4 * (1 - levanta)]; P.piernaD = [-8 * (1 - levanta), -0.4 * (1 - levanta)];
      let dy = -Math.abs(s) * 4 * (1 - levanta);
      if (t > T_CHOCA - 0.25) {
        // ¡choca!
        const k = eOut(tramo(t, T_CHOCA - 0.25, T_CHOCA)) * (1 - eInOut(tramo(t, T_CHOCA + 0.5, T_CHOCA + 0.8)));
        P.brazoIDelante = !esG;
        const m0 = matAv(esG ? XG_FIN : XM_FIN, PIES, ESC);
        const c = enAv(m0, [(XG_FIN + XM_FIN) / 2 + (esG ? -6 : 6), 300]);
        if (esG) { P.manoD = mezcla([70, 150], c, k); P.manoI = [9, 160]; } else { P.manoI = mezcla([6, 152], c, k); P.manoD = [67, 152]; }
        P.cara = t > T_CHOCA ? (t > T_CHOCA + 0.5 ? "guino" : "risa") : "risa"; P.rc = esG ? 0.1 : -0.1;
        dy = -16 * Math.sin(tramo(t, T_CHOCA - 0.1, T_CHOCA + 0.3) * Math.PI);
      }
      const m = matAv(esG ? XG_FIN : XM_FIN, PIES + dy, ESC, 0, 1, sy);
      if (esG) mG = m; else mM = m;
    }
    if (this.boq) { const b = this.boq; M.objD = (g) => boquilla(g, b.a, b.b); }
    return { G, M, mG, mM };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, ag = this.agua;
    const sG = this.enArco("G"), sM = this.enArco("M");
    if (sG && sG.fase === "sube") this.fG += dt * 10;
    if (sM && sM.fase === "sube") this.fM += dt * 10;
    if (t > T_IDEA && t < T_HOP_M) this.fM += dt * 10;
    // fuente de la manguera
    if (t > T_AGUA && t < T_CORTA) {
      const e = this.poses(), b = aPant(e.mM, this.boq ? this.boq.b : [90, 60]);
      for (let i = 0; i < 4; i++) ag.nueva(b[0], b[1], azar(170, 330), azar(-760, -600), 2, azar(3, 5.5));
    }
    this.una("arco", t > T_ARCO[0], () => temblar(4, 0.2));
    for (const [k, x, q] of [["hg", T_HOP_G + 0.3, "G"], ["hm", T_HOP_M + 0.3, "M"]]) this.una(k, t > x, () => {
      const s = this.enArco(q);
      if (s) for (let i = 0; i < 12; i++) p.nueva(P.PURPURINA, s.x + azar(-30, 30), s.y - 10, azar(-60, 60), azar(-120, -20), azar(0.6, 1.2), azar(8, 14));
    });
    // estela de purpurina al deslizarse
    for (const s of [sG, sM]) if (s && (s.fase === "baja" || s.fase === "vuela") && Math.random() < 50 * dt) p.nueva(P.PURPURINA, s.x + azar(-20, 20), s.y - azar(0, 30), azar(-40, 40), azar(-40, 20), azar(0.5, 1.0), azar(8, 14));
    for (const [k, q, x] of [["pg", "G", XG_FIN], ["pm", "M", XM_FIN]]) {
      const tl = T_DESLIZA[1] + (q === "G" ? 0 : RETRASO_M) + 0.35;
      this.una(k, t > tl, () => {
        temblar(q === "G" ? 14 : 10, 0.35);
        for (let i = 0; i < 14; i++) p.nueva(P.POLVO, x + azar(-50, 50), PIES, azar(-160, 160), azar(-80, -10), azar(0.5, 0.9), azar(20, 36));
        for (let i = 0; i < 40; i++) p.nueva(P.CONFETI, x + azar(-60, 60), PIES - 40, azar(-260, 260), azar(-420, -160), azar(1.8, 2.8), azar(9, 14), (Math.random() * 5) | 0);
      });
    }
    this.una("tit", t > T_PLAF + 0.25, () => { for (let i = 0; i < 40; i++) p.nueva(P.PURPURINA, azar(150, 870), azar(40, 160), azar(-30, 30), azar(-20, 40), azar(1.2, 2.2), azar(10, 16)); });
    this.una("choca", t > T_CHOCA, () => {
      temblar(10, 0.25);
      const c = [(XG_FIN + XM_FIN) / 2, 300];
      p.nueva(P.DESTELLO, c[0], c[1], 0, 0, 0.3, 160);
      for (let i = 0; i < 16; i++) { const a = azar(0, 6.283), v = azar(140, 320); p.nueva(P.CHISPA, c[0], c[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 9)); }
    });
    p.actualizar(dt);
    ag.actualizar(dt);
  }
  fondo() {
    if (CT.has("fondo")) return CT.get("fondo");
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, 480);
    gc.addColorStop(0, "#2a1a5a"); gc.addColorStop(0.4, "#9a3a7a"); gc.addColorStop(0.72, "#ff7a4a"); gc.addColorStop(1, "#ffd28a");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, 560);
    // sol poniéndose
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8; g.drawImage(BLOB2.oro, 760, 300, 300, 300); g.restore();
    g.fillStyle = "#fff0b0"; g.beginPath(); g.arc(910, 452, 52, 0, 6.283); g.fill();
    // estrellitas arriba
    const q = semilla(4);
    g.fillStyle = "rgba(255,255,255,.7)"; for (let i = 0; i < 30; i++) { g.beginPath(); g.arc(q() * W, q() * 140, 0.8 + q() * 1.4, 0, 6.283); g.fill(); }
    // colinas
    g.fillStyle = "#6a3a7a";
    g.beginPath(); g.moveTo(-60, 470); for (let x = -60; x <= W + 60; x += 20) g.lineTo(x, 440 + 30 * Math.sin(x * 0.006 + 1) + 12 * Math.sin(x * 0.02)); g.lineTo(W + 60, 520); g.lineTo(-60, 520); g.closePath(); g.fill();
    g.fillStyle = "#4a2a5a";
    g.beginPath(); g.moveTo(-60, 500); for (let x = -60; x <= W + 60; x += 20) g.lineTo(x, 482 + 16 * Math.sin(x * 0.01 + 3)); g.lineTo(W + 60, 540); g.lineTo(-60, 540); g.closePath(); g.fill();
    CT.set("fondo", c);
    return c;
  }
  hierba() {
    if (CT.has("hierba")) return CT.get("hierba");
    const c = lienzoNuevo(W + 120, 140), g = c.getContext("2d");
    g.translate(60, -500);
    const gs = g.createLinearGradient(0, 520, 0, 640);
    gs.addColorStop(0, "#3a7a3a"); gs.addColorStop(1, "#1e4a22");
    g.fillStyle = gs; g.beginPath(); g.moveTo(-60, 540); for (let x = -60; x <= W + 60; x += 16) g.lineTo(x, 528 + 6 * Math.sin(x * 0.05)); g.lineTo(W + 60, 640); g.lineTo(-60, 640); g.closePath(); g.fill();
    g.strokeStyle = "#5aa04a"; g.lineWidth = 2;
    const q = semilla(11);
    for (let i = 0; i < 120; i++) { const x = q() * (W + 100) - 50, y = 535 + q() * 60; g.beginPath(); g.moveTo(x, y); g.lineTo(x + q() * 6 - 3, y - 8 - q() * 8); g.stroke(); }
    for (let i = 0; i < 14; i++) { const x = q() * W, y = 550 + q() * 40; g.fillStyle = CONFETI[i % 5]; g.beginPath(); g.arc(x, y, 3.5, 0, 6.283); g.fill(); }
    CT.set("hierba", c);
    return c;
  }
  arco(g, t, k, soloBandas) {
    if (k <= 0) return;
    const a0 = Math.PI, a1 = Math.PI + Math.PI * k;
    if (!soloBandas) {
      g.save();
      g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.18;
      g.strokeStyle = "#ffffff"; g.lineWidth = BANDA * 7 + 50; g.beginPath(); g.arc(CXA, CYA, R0 - BANDA * 3, a0, a1); g.stroke();
      g.restore();
    }
    g.save(); g.globalAlpha = soloBandas ? 1 : 0.92;
    COLS.forEach((c, i) => { g.strokeStyle = c; g.lineWidth = BANDA + 1; g.beginPath(); g.arc(CXA, CYA, R0 - BANDA * (i + 0.5), a0, a1); g.stroke(); });
    g.globalAlpha = 0.35; g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.beginPath(); g.arc(CXA, CYA, R0 - 2, a0, a1); g.stroke();
    g.restore();
    if (k < 1 && !soloBandas) { const p = [CXA + Math.cos(a1) * (R0 - 42), CYA + Math.sin(a1) * (R0 - 42)]; brillo(g, p[0], p[1], 46, 1); }
  }
  titulo() {
    if (CT.has("tit")) return CT.get("tit");
    const c = lienzoNuevo(900, 200), g = c.getContext("2d");
    const gr = g.createLinearGradient(80, 0, 820, 0);
    COLS.forEach((col, i) => gr.addColorStop(i / 6, col));
    txt(g, "¡ARCOÍRIS!", 456, 160, { tam: 150, peso: 400, fam: FB, color: "#1a0a2a", esp: 4 });
    txt(g, "¡ARCOÍRIS!", 450, 154, { tam: 150, peso: 400, fam: FB, color: gr, borde: "#fffdf5", bordeAncho: 12, esp: 4, glow: "rgba(255,255,255,.8)", glowTam: 22 });
    txt(g, "¡ARCOÍRIS!", 450, 154, { tam: 150, peso: 400, fam: FB, color: gr, esp: 4 });
    CT.set("tit", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses(), a = this.luz();
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    // el arcoíris se apaga al final del atardecer
    const kArco = this.barrido();
    g.save(); g.globalAlpha = 1 - 0.5 * tramo(t, 9.0, 10.3);
    this.arco(g, t, kArco);
    g.restore();
    g.drawImage(this.hierba(), -60, 500);
    // manguera
    if (this.boq) {
      const a0 = aPant(e.mM, this.boq.a);
      g.save(); g.lineCap = "round"; g.strokeStyle = "#5a1a10"; g.lineWidth = 13; g.beginPath(); g.moveTo(a0[0], a0[1]); g.quadraticCurveTo(a0[0] - 20, PIES + 10, -60, PIES - 6); g.stroke();
      g.strokeStyle = "#d8402a"; g.lineWidth = 9; g.stroke(); g.restore();
    } else {
      g.save(); g.lineCap = "round"; g.strokeStyle = "#5a1a10"; g.lineWidth = 13; g.beginPath(); g.moveTo(XM0 + 40, PIES - 2); g.quadraticCurveTo(XM0 - 20, PIES + 6, -60, PIES - 6); g.stroke();
      g.strokeStyle = "#d8402a"; g.lineWidth = 9; g.stroke(); g.restore();
      boquilla(g, [XM0 + 40, PIES - 2], [XM0 + 92, PIES - 8]);
    }
    // líneas de velocidad al bajar
    for (const q of ["G", "M"]) {
      const s = this.enArco(q);
      if (!s || s.fase !== "baja" || s.u < 0.05) continue;
      g.save(); g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = 3; g.lineCap = "round";
      for (let i = 0; i < 4; i++) { const ox = -30 - i * 18, oy = -40 - i * 26; g.beginPath(); g.moveTo(s.x + ox, s.y + oy); g.lineTo(s.x + ox - 50 * s.u, s.y + oy - 40 * s.u); g.stroke(); }
      g.restore();
    }
    pintarAvatar(g, e.mM, e.M, t);
    pintarAvatar(g, e.mG, e.G, t);
    // sentados dentro del tobogán: las bandas por delante de las piernas
    const sG = this.enArco("G"), sM = this.enArco("M");
    if ((sG && sG.dentro) || (sM && sM.dentro)) { this.arco(g, t, kArco, true); g.drawImage(this.hierba(), -60, 500); }
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
    ono("¡OOOH!", 520, 250, T_ARCO[0] + 0.5, 1.0, 64, "#fffdf5", "#3a1a4a", -0.05);
    if (t > T_IDEA && t < T_HOP_G + 0.1) bocadillo(g, 330, 210, "¡SUBAMOS!", XG0 + 10, 290, tramo(t, T_IDEA, T_IDEA + 0.12) * (1 - tramo(t, T_HOP_G - 0.05, T_HOP_G + 0.1)), 38);
    ono("¡HOP!", 230, 300, T_HOP_G + 0.05, 0.45, 44, "#ffd34d", "#3a2400", -0.1);
    ono("¡HOP!", 170, 340, T_HOP_M + 0.05, 0.45, 40, "#ffd34d", "#3a2400", 0.1);
    ono("¡WIIIII!", 640, 180, T_DESLIZA[0] + 0.3, 1.0, 58, "#fffdf5", "#3a1a4a", 0.08);
    ono("¡PLAF!", XG_FIN - 60, 420, T_DESLIZA[1] + 0.35, 0.5, 52, "#fffdf5", "#1b1b1b", -0.12);
    ono("¡CHOCA!", (XG_FIN + XM_FIN) / 2 - 10, 250, T_CHOCA, 0.6, 46, "#ffd34d", "#3a2400", 0.06);
    // ¡ARCOÍRIS!
    if (t > T_PLAF) {
      const d = t - T_PLAF, k = tramo(d, 0, 0.18), s = lerp(2.4, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 6));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(440, 96); g.rotate(-0.04); g.scale(s * 0.8, s * 0.8);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const n = 1 - a;
    if (n > 0) { g.fillStyle = `rgba(0,0,0,${n})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00252", nombre: "El arcoíris", crear: () => new Arcoiris() });
})();
