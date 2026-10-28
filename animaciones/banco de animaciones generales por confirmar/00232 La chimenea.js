"use strict";
/*
 * 00232 · LA CHIMENEA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Marcos, de uniforme, deshollina la chimenea del bar (apagada) con un cepillo de palo largo: RASCA, RASCA. Guillermo
 * llega curioso, se agacha delante y se asoma a mirar hacia arriba… caen unas motas (¿EH?) y ¡PUFF!, una nube de
 * hollín lo envuelve. Cuando se va, Guillermo está negro de pies a cabeza: solo se le ven los ojos, que parpadean.
 * Marcos se parte de risa: ¡HOLLÍN! Guillermo tose una nubecilla y sonríe con los dientes blancos. Fundido a negro.
 */
(() => {
const CT = cacheTexto();
const DUR = 9.8, ESC = 1.45;
const CX0 = 330, CX1 = 570, CY0 = 336;             // la boca de la chimenea (izquierda, derecha, dintel)
const XM = 270, XG1 = 470;
const T_LLEGA = 1.6, T_AGACHA = 2.15, T_MOTAS = 2.85, T_PUFF = 3.4, T_SALE = 4.3, T_VE = 4.95, T_RIE = 5.35, T_TIT = 5.9;
const T_TOSE = 6.5, T_DIENTES = 7.25, T_APAGA = 9.25;
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
const MANO_R = [332, 408], MANO_L = [282, 440];
const DIR = (() => { const d = [MANO_R[0] - MANO_L[0], MANO_R[1] - MANO_L[1]], l = Math.hypot(d[0], d[1]); return [d[0] / l, d[1] / l]; })();   // el palo, hacia arriba

/** Bocanada de hollín (sprite). */
let _bocanada = null;
function bocanada() {
  if (_bocanada) return _bocanada;
  const c = lienzoNuevo(96, 96), g = c.getContext("2d");
  const gr = g.createRadialGradient(44, 42, 4, 48, 48, 48);
  gr.addColorStop(0, "rgba(14,13,13,.96)"); gr.addColorStop(0.6, "rgba(22,20,20,.85)"); gr.addColorStop(1, "rgba(30,28,28,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 96, 96);
  return (_bocanada = c);
}
/** Lienzo para pintar a Guillermo aparte y ennegrecerlo (solo sus píxeles). */
const OFF = { c: null, g: null, S: 1.6, X0: -80, Y0: -60, AW: 240, AH: 310 };

class LaChimenea extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(260);
    this.nube = [];
    this.motas = [];
    this.cF = null;
  }
  luz() { return tramo(this.t, 0, 0.45) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** Lo negro que está Guillermo (0–1). */
  negro(t) { return 0.93 * eInOut(tramo(t, T_PUFF + 0.15, T_PUFF + 0.6)); }
  // ------------------------------------------------------------------ poses
  poses() {
    const t = this.t;
    // --- Marcos con el cepillo
    const M = { quien: "bombero", cara: "guino", rc: 0.1, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let rasca = t < T_PUFF + 0.1 ? 12 * Math.sin(t * 9) : 12 * Math.sin((T_PUFF + 0.1) * 9) * (1 - tramo(t, T_PUFF + 0.1, T_PUFF + 0.3));
    if (t > T_RIE) rasca = 0;
    const mM = matAv(XM, PIES, ESC, t > T_RIE ? 0.04 * Math.sin(t * 14) : 0);
    let mR = [MANO_R[0] + DIR[0] * rasca, MANO_R[1] + DIR[1] * rasca], mL = [MANO_L[0] + DIR[0] * rasca, MANO_L[1] + DIR[1] * rasca];
    M.manoD = enAv(mM, mR); M.manoI = enAv(mM, mL);
    M.cara = Math.sin(t * 2) > 0.6 ? "sonrisa" : "guino";
    if (t > T_LLEGA && t < T_PUFF) M.rc = 0.2;
    if (t > T_PUFF) { M.cara = "sorpresa"; M.rc = 0.22; }
    if (t > T_RIE) {
      // se parte de risa (suelta el palo, que se queda apoyado)
      const k = eInOut(tramo(t, T_RIE, T_RIE + 0.25)), s = Math.sin(t * 16);
      M.manoD = mezcla(M.manoD, [52, 120 + 4 * s], k); M.manoI = mezcla(M.manoI, [22, 122 - 4 * s], k);
      M.cara = "risa"; M.rc = 0.12 + 0.06 * s;
    }
    // --- Guillermo
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let xg = 1130, sy = 1, giro = 0, yg = PIES;
    if (t < T_AGACHA) {
      const u = tramo(t, 0.3, T_AGACHA);
      xg = lerp(1130, XG1, eOut(u));
      if (u < 0.97) { const a = andar(t * 14, 1); G.piernaI = a.piernaI; G.piernaD = a.piernaD; yg += a.bote; }
      G.cara = t < T_LLEGA ? "sonrisa" : "sorpresa"; G.rc = -0.08;
      G.manoD = [80, 140]; G.manoI = [0, 140];
    } else {
      xg = XG1;
      // se agacha y se asoma hacia arriba, con las manos en las rodillas
      const k = eInOut(tramo(t, T_AGACHA, T_AGACHA + 0.4)) * (1 - eInOut(tramo(t, T_SALE, T_SALE + 0.4)));
      sy = 1 - 0.14 * k; giro = -0.1 * k;
      G.rc = -0.22 * k; G.manoD = mezcla([80, 140], [66, 150], k); G.manoI = mezcla([0, 140], [12, 150], k);
      G.cara = t < T_MOTAS ? "sonrisa" : "sorpresa";
      if (t > T_PUFF) { G.cara = "dormido"; G.manoD = [96, 60]; G.manoI = [-18, 60]; G.puntas = eOut(tramo(t, T_PUFF, T_PUFF + 0.3)); }
      if (t > T_SALE) {
        // tieso, negro, con los brazos un poco abiertos
        G.manoD = [92, 140]; G.manoI = [-14, 140]; G.rc = 0; G.puntas = 1;
      }
      if (t > T_TOSE && t < T_TOSE + 0.6) {
        const tos = Math.max(0, Math.sin((t - T_TOSE) * 16));
        sy = 1 - 0.03 * tos; G.rc = 0.05 * tos;
        const b = boca(0); G.manoI = [b[0] - 10, b[1] + 8];
      }
      if (t > T_DIENTES) { G.manoD = [96, 112]; G.manoI = [-16, 112]; G.rc = 0.05 * Math.sin(t * 3); }
    }
    G.manoD = G.manoD || [70, 158]; G.manoI = G.manoI || [9, 160];
    return { M, mM, G, mG: matAv(xg, yg, ESC, giro, 1, sy), rasca };
  }
  /** Ojos de Guillermo (abiertos k=1, cerrados 0) en unidades de avatar. */
  ojos(t) {
    if (t < T_SALE + 0.2) return 1;
    for (const tb of [T_SALE + 0.55, T_SALE + 0.9, T_VE + 0.6, T_TOSE + 0.05, T_DIENTES + 0.6, 8.6]) { const d = t - tb; if (d > 0 && d < 0.16) return Math.abs(d - 0.08) / 0.08; }
    if (t > T_TOSE && t < T_TOSE + 0.6 && Math.sin((t - T_TOSE) * 16) > 0.4) return 0.1;
    return 1;
  }
  // ------------------------------------------------------------------ actualizar
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, e = this.poses();
    // motas que caen
    if (t > T_MOTAS && t < T_PUFF && Math.random() < 26 * dt) this.motas.push({ x: azar(CX0 + 80, CX1 - 40), y: CY0 + 4, vx: azar(-10, 10), vy: azar(60, 120), r: azar(1.5, 3.5) });
    for (const m of this.motas) { m.vy += 300 * dt; m.x += m.vx * dt; m.y += m.vy * dt; }
    this.motas = this.motas.filter((m) => m.y < PIES);
    // ¡PUFF!
    this.una("puff", t > T_PUFF, () => {
      temblar(20, 0.5);
      for (let i = 0; i < 46; i++) {
        const a = azar(-0.9, 0.5), v = azar(120, 420);
        this.nube.push({ x: azar(CX0 + 60, CX1 - 40), y: azar(CY0 + 10, CY0 + 120), vx: Math.cos(a) * v + 60, vy: Math.sin(a) * v * 0.6 + 40, r: azar(40, 80), v: azar(1.3, 2.0), vm: 2.0 });
      }
      for (let i = 0; i < 14; i++) this.nube.push({ x: XG1 + azar(-60, 60), y: azar(250, 520), vx: azar(-60, 60), vy: azar(-40, 20), r: azar(60, 100), v: azar(1.4, 1.9), vm: 1.9 });
    });
    for (const n of this.nube) { n.v -= dt; n.vx *= 1 - 2.2 * dt; n.vy *= 1 - 2.2 * dt; n.vy -= 12 * dt; n.x += n.vx * dt; n.y += n.vy * dt; n.r += 26 * dt; }
    this.nube = this.nube.filter((n) => n.v > 0);
    // se le cae hollín al moverse
    if (t > T_SALE && Math.random() < 10 * dt) {
      const c = aPant(e.mG, [azar(10, 70), azar(60, 200)]);
      p.nueva(P.POLVO, c[0], c[1], azar(-20, 20), azar(20, 60), azar(0.5, 0.9), azar(8, 14));
    }
    this.una("tose", t > T_TOSE + 0.08, () => {
      const b = aPant(e.mG, boca(0));
      for (let i = 0; i < 6; i++) this.nube.push({ x: b[0] + 14, y: b[1], vx: azar(60, 160), vy: azar(-50, 10), r: azar(14, 24), v: azar(0.7, 1.1), vm: 1.1 });
    });
    this.una("tit", t > T_TIT, () => {
      temblar(14, 0.35);
      for (let i = 0; i < 70; i++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-80, -10), azar(-40, 40), azar(0, 120), azar(2.4, 3.4), azar(9, 15), i % 5);
    });
    p.suelo = () => PIES;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  // ------------------------------------------------------------------ fondo
  fondoChimenea() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gr = g.createLinearGradient(0, -60, 0, H);
    gr.addColorStop(0, "#2a1a10"); gr.addColorStop(1, "#1a0e08");
    g.fillStyle = gr; g.fillRect(-60, -60, W + 120, H + 120);
    g.fillStyle = "rgba(0,0,0,.2)"; for (let x = -40; x < W + 60; x += 58) g.fillRect(x, -60, 3, H + 120);
    // estantería con botellas a la derecha
    const r = semilla(7);
    for (const y of [190, 280]) {
      for (let x = 650; x < W - 10; x += 24 + r() * 8) {
        const cols = ["#3a9a4a", "#b0521e", "#e0b840", "#4a7ac0", "#c02238"], col = cols[(r() * cols.length) | 0], h = 40 + r() * 24, w = 14 + r() * 4;
        g.fillStyle = col; rectR(g, x - w / 2, y - h * 0.62, w, h * 0.62, 3); g.fill(); g.fillRect(x - w * 0.17, y - h, w * 0.34, h * 0.4);
        g.fillStyle = "rgba(255,248,225,.6)"; g.fillRect(x - w / 2 + 2, y - h * 0.4, w - 4, h * 0.18);
      }
      g.fillStyle = "#6a3e1c"; g.fillRect(640, y, W - 620, 9); g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(640, y + 9, W - 620, 6);
    }
    // la chimenea de ladrillo
    const X0 = CX0 - 70, X1 = CX1 + 70;
    g.fillStyle = "#8a3a22"; g.fillRect(X0 + 40, -60, X1 - X0 - 80, 330);
    g.fillStyle = "#9a4428"; g.fillRect(X0, 270, X1 - X0, PIES - 270);
    g.strokeStyle = "rgba(40,12,4,.55)"; g.lineWidth = 2;
    for (let y = -60, f = 0; y < PIES; y += 22, f++) {
      const xa = y < 270 ? X0 + 40 : X0, xb = y < 270 ? X1 - 40 : X1;
      g.beginPath(); g.moveTo(xa, y); g.lineTo(xb, y); g.stroke();
      for (let x = xa + (f % 2) * 22; x < xb; x += 44) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 22); g.stroke(); }
    }
    // la boca (apagada, con hollín)
    g.fillStyle = "#0c0806"; g.beginPath(); g.moveTo(CX0, PIES); g.lineTo(CX0, CY0 + 30); g.quadraticCurveTo(CX0, CY0, CX0 + 30, CY0); g.lineTo(CX1 - 30, CY0); g.quadraticCurveTo(CX1, CY0, CX1, CY0 + 30); g.lineTo(CX1, PIES); g.closePath(); g.fill();
    const gi = g.createLinearGradient(0, CY0, 0, PIES);
    gi.addColorStop(0, "rgba(0,0,0,0)"); gi.addColorStop(1, "rgba(60,40,30,.5)");
    g.fillStyle = gi; g.fillRect(CX0, CY0, CX1 - CX0, PIES - CY0);
    // troncos fríos y morillos
    g.fillStyle = "#3a2414"; rectR(g, CX0 + 50, PIES - 40, 140, 22, 10); g.fill(); rectR(g, CX0 + 70, PIES - 58, 120, 20, 10); g.fill();
    g.fillStyle = "#6a4a30"; g.beginPath(); g.ellipse(CX0 + 190, PIES - 29, 7, 10, 0, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(CX0 + 190, PIES - 48, 6, 9, 0, 0, 6.283); g.fill();
    g.fillStyle = "#2a2a2a"; g.fillRect(CX0 + 30, PIES - 20, 8, 20); g.fillRect(CX1 - 40, PIES - 20, 8, 20);
    // repisa
    g.fillStyle = "#5a3218"; g.fillRect(X0 - 14, 300, X1 - X0 + 28, 20);
    g.fillStyle = "rgba(255,220,170,.35)"; g.fillRect(X0 - 14, 300, X1 - X0 + 28, 3);
    g.fillStyle = "rgba(0,0,0,.4)"; g.fillRect(X0 - 14, 320, X1 - X0 + 28, 6);
    // cosas en la repisa: reloj y dos velas apagadas
    g.fillStyle = "#c8a040"; g.beginPath(); g.arc(CX0 + 120, 278, 20, 0, 6.283); g.fill();
    g.fillStyle = "#fffdf5"; g.beginPath(); g.arc(CX0 + 120, 278, 15, 0, 6.283); g.fill();
    g.strokeStyle = "#1b1b1b"; g.lineWidth = 2; g.beginPath(); g.moveTo(CX0 + 120, 278); g.lineTo(CX0 + 120, 268); g.moveTo(CX0 + 120, 278); g.lineTo(CX0 + 127, 281); g.stroke();
    g.fillStyle = "#f4ead0"; g.fillRect(CX1 - 70, 262, 10, 38); g.fillRect(CX1 - 50, 270, 10, 30);
    // suelo
    const gs = g.createLinearGradient(0, PIES - 20, 0, H);
    gs.addColorStop(0, "#3a2412"); gs.addColorStop(1, "#1c1008");
    g.fillStyle = gs; g.fillRect(-60, PIES - 20, W + 120, H - PIES + 80);
    g.fillStyle = "#6a3a22"; g.fillRect(X0 - 20, PIES - 6, X1 - X0 + 40, 14);
    // lámpara cálida
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5; g.drawImage(BLOB2.oro, 260, 20, 520, 520); g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    const v = g.createRadialGradient(W / 2, 320, 250, W / 2, 320, 720);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.72)");
    g.fillStyle = v; g.fillRect(-60, -60, W + 120, H + 120);
    return (this.cF = c);
  }
  /** Guillermo, pintado aparte para poder ennegrecerlo entero. */
  guillermoNegro(g, m, pose, t, k) {
    const O = OFF;
    if (!O.c) { O.c = lienzoNuevo(O.AW * O.S, O.AH * O.S); O.g = O.c.getContext("2d"); }
    const x = O.g;
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = "source-over"; x.clearRect(0, 0, O.c.width, O.c.height);
    x.setTransform(O.S, 0, 0, O.S, -O.X0 * O.S, -O.Y0 * O.S);
    x.imageSmoothingQuality = "high";
    dibujarAvatar(x, pose, t);
    x.globalCompositeOperation = "source-atop";
    x.fillStyle = `rgba(18,17,18,${k})`; x.fillRect(O.X0, O.Y0, O.AW, O.AH);
    // motas de ceniza
    x.fillStyle = `rgba(120,118,118,${0.45 * k})`;
    for (const [px, py, r] of [[20, 110, 2], [52, 130, 1.6], [34, 180, 1.8], [60, 96, 1.4], [16, 60, 1.5], [62, 52, 1.6]]) { x.beginPath(); x.arc(px, py, r, 0, 6.283); x.fill(); }
    x.globalCompositeOperation = "source-over";
    conMat(g, m, () => g.drawImage(O.c, O.X0, O.Y0, O.AW, O.AH));
  }
  // ------------------------------------------------------------------ dibujar
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses(), neg = this.negro(t);
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    g.drawImage(this.fondoChimenea(), -60, -60);
    foco(g, XG1 + 30, XG1 + 30, PIES, 170, 0.35);
    // el palo del cepillo (entra en la chimenea por el dintel)
    const ext = e.rasca;
    const arriba = [MANO_R[0] + DIR[0] * (ext + 400), MANO_R[1] + DIR[1] * (ext + 400)], abajo = [MANO_L[0] - DIR[0] * (60 - ext), MANO_L[1] - DIR[1] * (60 - ext)];
    let pAbajo = abajo;
    if (t > T_RIE) { const k = eInOut(tramo(t, T_RIE, T_RIE + 0.4)); pAbajo = mezcla(abajo, [CX0 - 10, PIES - 4], k); }
    g.save(); g.beginPath(); g.rect(-60, CY0 + 2, W + 120, H); g.clip();
    g.strokeStyle = "#5a3a1a"; g.lineWidth = 9; g.lineCap = "round"; g.beginPath(); g.moveTo(pAbajo[0], pAbajo[1]); g.lineTo(arriba[0], arriba[1]); g.stroke();
    g.strokeStyle = "#a8783a"; g.lineWidth = 5; g.beginPath(); g.moveTo(pAbajo[0], pAbajo[1]); g.lineTo(arriba[0], arriba[1]); g.stroke();
    g.restore();
    // sombras
    for (const m of [e.mM, e.mG]) { const c = aPant(m, [39, 232]); g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(c[0], PIES + 2, 58, 9, 0, 0, 6.283); g.fill(); }
    pintarAvatar(g, e.mM, e.M, t);
    // Guillermo (negro de hollín), con un contraluz cálido para que se le vea la silueta
    if (neg > 0.01) {
      const c = aPant(e.mG, [39, 120]);
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = a * 0.55 * neg;
      g.drawImage(BLOB2.oroClaro, c[0] - 190, c[1] - 280, 380, 520); g.restore();
      this.guillermoNegro(g, e.mG, e.G, t, neg);
    }
    else pintarAvatar(g, e.mG, e.G, t);
    if (neg > 0.5) {
      // solo se le ven los ojos (y luego los dientes)
      const ab = this.ojos(t), rc = e.G.rc || 0, R = RIG;
      conMat(g, e.mG, () => {
        g.translate(R.cuello[0], R.cuello[1]); g.rotate(rc); g.translate(-R.cuello[0], -R.cuello[1]);
        for (const [ox, oy] of R.ojos) {
          if (ab < 0.2) { g.strokeStyle = "#f4f4f4"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(ox - 5, oy + 1); g.quadraticCurveTo(ox, oy + 3, ox + 5, oy + 1); g.stroke(); continue; }
          g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(ox, oy, 5.6, 6.4 * ab, 0, 0, 6.283); g.fill();
          g.save(); g.beginPath(); g.ellipse(ox, oy, 5.6, 6.4 * ab, 0, 0, 6.283); g.clip();
          const mira = t > T_VE ? -1.2 : 0;
          g.fillStyle = "#3a2414"; g.beginPath(); g.arc(ox + mira, oy + 0.6, 2.9, 0, 6.283); g.fill();
          g.fillStyle = "#0a0a0a"; g.beginPath(); g.arc(ox + mira, oy + 0.6, 1.5, 0, 6.283); g.fill();
          g.fillStyle = "#fff"; g.beginPath(); g.arc(ox + mira - 0.9, oy - 0.6, 0.8, 0, 6.283); g.fill();
          g.restore();
        }
        if (t > T_DIENTES) {
          const k = eBack(tramo(t, T_DIENTES, T_DIENTES + 0.25));
          g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(29, 55); g.quadraticCurveTo(39, 56 + 9 * k, 49, 55); g.quadraticCurveTo(39, 58 + 3 * k, 29, 55); g.fill();
          g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 0.5; for (const xx of [34, 39, 44]) { g.beginPath(); g.moveTo(xx, 55.5); g.lineTo(xx, 57.5 + 3 * k); g.stroke(); }
        }
      });
    }
    // motas y nube de hollín
    g.fillStyle = "#121010";
    for (const m of this.motas) { g.beginPath(); g.arc(m.x, m.y, m.r, 0, 6.283); g.fill(); }
    const bo = bocanada();
    for (const n of this.nube) { g.globalAlpha = a * Math.min(1, (n.v / n.vm) * 1.6); g.drawImage(bo, n.x - n.r, n.y - n.r, n.r * 2, n.r * 2); }
    g.globalAlpha = a;
    g.restore();
    this.p.dibujar(g);
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: a * (1 - tramo(d, dur - 0.15, dur)) });
      g.restore();
    };
    ono("RASCA, RASCA", 220, 220, 0.6, 1.0, 40, "#fffdf5", "#1b1b1b", -0.06);
    ono("RASCA, RASCA", 230, 200, 1.9, 0.9, 40, "#fffdf5", "#1b1b1b", 0.05);
    ono("¡PUFF!", 640, 250, T_PUFF, 0.8, 110, "#cfcfcf", "#0a0a0a", -0.06);
    ono("¡JA, JA, JA!", 180, 210, T_RIE + 0.1, 1.3, 46, "#ffd34d", "#3a2400", -0.05);
    ono("COF", 610, 330, T_TOSE + 0.1, 0.5, 40, "#cfcfcf", "#0a0a0a", 0.08);
    if (t > T_MOTAS + 0.1 && t < T_PUFF) {
      const k = tramo(t, T_MOTAS + 0.1, T_MOTAS + 0.3);
      const b = aPant(e.mG, [60, 20]);
      bocadillo(g, 760, 190, "¿EH?", b[0] + 10, b[1] - 6, k * a, 42);
    }
    // ¡HOLLÍN!
    if (t > T_TIT) {
      const d = t - T_TIT, k = tramo(d, 0, 0.18), s = lerp(2.2, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a; g.translate(640, 110); g.rotate(-0.05); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(720, 220), g = c.getContext("2d");
    // nubecillas de hollín detrás
    const bo = bocanada();
    for (const [x, y, r] of [[90, 120, 60], [220, 70, 50], [380, 150, 64], [540, 80, 56], [640, 140, 54]]) { g.globalAlpha = 0.7; g.drawImage(bo, x - r, y - r, r * 2, r * 2); }
    g.globalAlpha = 1;
    const gr = g.createLinearGradient(0, 40, 0, 170);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.55, "#d8d8dc"); gr.addColorStop(1, "#8a8a92");
    txt(g, "¡HOLLÍN!", 366, 176, { tam: 160, peso: 900, fam: FD, color: "#000", esp: 6 });
    txt(g, "¡HOLLÍN!", 360, 168, { tam: 160, peso: 900, fam: FD, color: gr, borde: "#0a0a0a", bordeAncho: 13, esp: 6, glow: "rgba(255,255,255,.35)", glowTam: 18 });
    CT.set("t", c);
    return c;
  }
}

registrar({ id: "00232", nombre: "La chimenea", crear: () => new LaChimenea() });
})();
