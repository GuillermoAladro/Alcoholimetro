"use strict";
/*
 * 00228 · DE SERVICIO
 *
 * Animación del banco. Empieza y acaba en negro.
 * En la barra, Guillermo pide una ronda: llegan dos jarras deslizándose. Marcos, de uniforme, dice que no con el dedo
 * y saluda: está ¡DE SERVICIO! (sello). Le devuelve su jarra a Guillermo, que se queda con las dos, y por la barra
 * llega para Marcos un vaso de agua con hielo, limón y sombrillita. Brindan caña con agua (¡CHIN!) y beben cada uno lo
 * suyo. Fundido a negro.
 */
(() => {
const CT = cacheTexto();
const DUR = 9.6, ESC = 1.7, BARRA = 492, AY = BARRA - 6 + (232 - 128) * ESC;
const EV = 1.45;                                      // tamaño del vaso respecto a sus medidas
const XG = 372, XM = 652, XM2 = 618;                  // Marcos se acerca para el brindis
const T_PIDE = 0.85, T_J2 = 1.95, T_J1 = 2.1, T_COGE1 = 2.45, T_NO = 2.75, T_SELLO = 3.15, T_SALUDO = 3.3;
const T_EMPUJA = 3.95, T_COGE2 = 4.4, T_AGUA = 4.7, T_PARA = 5.3, T_COGEA = 5.5, T_CHIN = 6.35, T_BEBE = 6.8, T_APAGA = 9.0;
const J1X = 420, J2X = 545, J2X2 = 300, VX = 575;    // dónde se paran (asa de las jarras, centro del vaso)
const JY = BARRA - 5 - 18 * ESC;                      // asa de una jarra apoyada en la barra
const VY = BARRA - 5 - 10 * EV * ESC;                 // donde se coge el vaso apoyado en la barra
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

// ------------------------------------------------------------------------------------------- objetos
/** Vaso de agua con hielo, pajita, rodaja de limón y sombrillita; (x, y) = donde se coge (unidades de avatar). */
const PAJITA = [9.5, -29];                            // punta de la pajita (medidas del vaso)
function vasoAgua(g, x, y, ang, nivel, t, sombrilla = true) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(EV, EV);
  const T = -16, B = 10, wt = 8.6, wb = 6.8;
  // pajita
  g.lineCap = "round"; g.lineJoin = "round";
  g.strokeStyle = "#ffffff"; g.lineWidth = 2.2;
  g.beginPath(); g.moveTo(-1, 6); g.lineTo(4, T - 8); g.lineTo(PAJITA[0], PAJITA[1]); g.stroke();
  g.strokeStyle = "#ff3d84"; g.lineWidth = 0.9; g.setLineDash([1.6, 1.6]);
  g.beginPath(); g.moveTo(-1, 6); g.lineTo(4, T - 8); g.lineTo(PAJITA[0], PAJITA[1]); g.stroke(); g.setLineDash([]);
  const forma = () => {
    g.beginPath(); g.moveTo(-wt, T); g.lineTo(wt, T); g.lineTo(wb, B - 1.6); g.quadraticCurveTo(wb, B, wb - 1.6, B);
    g.lineTo(-wb + 1.6, B); g.quadraticCurveTo(-wb, B, -wb, B - 1.6); g.closePath();
  };
  // sombrillita (el palo va dentro del vaso)
  if (sombrilla) {
    g.strokeStyle = "#f4e2b0"; g.lineWidth = 1.1;
    g.beginPath(); g.moveTo(1, 4); g.lineTo(-10, T - 9); g.stroke();
    g.save(); g.translate(-10, T - 9); g.rotate(-0.65);
    const cols = ["#ff3d84", "#fff3f8", "#2fe3e8", "#fff3f8", "#ff3d84"];
    for (let i = 0; i < 5; i++) {
      g.fillStyle = cols[i];
      g.beginPath(); g.moveTo(0, 0); g.arc(0, 2, 10, Math.PI + (i * Math.PI) / 5, Math.PI + ((i + 1) * Math.PI) / 5); g.closePath(); g.fill();
    }
    g.strokeStyle = "rgba(120,0,40,.5)"; g.lineWidth = 0.6; g.beginPath(); g.arc(0, 2, 10, Math.PI, 0); g.stroke();
    g.restore();
  }
  forma(); g.fillStyle = "rgba(200,235,255,.18)"; g.fill();
  // agua, hielos y burbujas
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
  // rodaja de limón en el borde
  g.save(); g.translate(wt - 1.5, T + 0.5);
  g.fillStyle = "#e8c400"; g.beginPath(); g.arc(0, 0, 5.2, 0, 6.283); g.fill();
  g.fillStyle = "#fff6a0"; g.beginPath(); g.arc(0, 0, 4.1, 0, 6.283); g.fill();
  g.strokeStyle = "#e8c400"; g.lineWidth = 0.6;
  for (let i = 0; i < 6; i++) { const a = (i * Math.PI) / 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 4, Math.sin(a) * 4); g.stroke(); }
  g.fillStyle = "#1b1b1b"; g.fillRect(-0.6, -0.6, 1.2, 1.2);
  g.restore();
  g.restore();
}
function jarraEn(g, x, y, nivel, t) {
  g.save(); g.translate(x, y); g.scale(ESC, ESC);
  dibujarJarra(g, [0, 0], 0, nivel, "asa", t); dibujarJarra(g, [0, 0], 0, nivel, "cuerpo", t);
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
  g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(x - w * 0.3, y - hc + 4, 1.8, hc - 8);
}

class DeServicio extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(360);
    this.gotas = [];
    this.cF = null; this.cB = null;
  }
  luz() { return tramo(this.t, 0, 0.45) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  // ------------------------------------------------------------------ objetos en la barra
  xJ1(t) { return t < T_J1 ? -140 : lerp(-140, J1X, eOut(tramo(t, T_J1, T_COGE1))); }
  xJ2(t) {
    if (t < T_EMPUJA) return t < T_J2 ? -140 : lerp(-140, J2X, eOut(tramo(t, T_J2, T_J2 + 0.65)));
    return lerp(J2X, J2X2, eOut(tramo(t, T_EMPUJA, T_COGE2)));
  }
  xV(t) { return t < T_AGUA ? -140 : lerp(-140, VX, eOut(tramo(t, T_AGUA, T_PARA))); }
  nivelG(t) { return t < T_BEBE + 0.3 ? 0.9 : lerp(0.9, 0.45, tramo(t, T_BEBE + 0.35, T_BEBE + 1.0)); }
  nivelM(t) { return t < T_BEBE + 0.3 ? 0.82 : lerp(0.82, 0.6, tramo(t, T_BEBE + 0.35, T_BEBE + 1.0)); }
  // ------------------------------------------------------------------ poses
  poses() {
    const t = this.t;
    const G = { cara: "risa", rc: 0.1, piernaI: [0, 0], piernaD: [0, 0] };
    const M = { quien: "bombero", cara: "sonrisa", rc: -0.08, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    const xm = lerp(XM, XM2, eInOut(tramo(t, T_CHIN - 0.6, T_CHIN - 0.2)));
    const mG = matAv(XG, AY, ESC), mM = matAv(xm, AY, ESC);
    const uG = (q) => enAv(mG, q), uM = (q) => enAv(mM, q);
    // --- Guillermo
    let gD = [74, 122], gI = [6, 124], incJ = 0;
    const ALTO_D = [86, 60], ALTO_I = [-20, 72];
    if (t < T_PIDE) gD = [74, 122];
    else if (t < T_COGE1) {
      const k = eOut(tramo(t, T_PIDE, T_PIDE + 0.25)), kB = eInOut(tramo(t, T_COGE1 - 0.3, T_COGE1));
      const arriba = [90 + 6 * Math.sin(t * 16), 22];
      gD = mezcla(mezcla([74, 122], arriba, k), uG([J1X, JY]), kB);
      G.cara = "risa"; G.rc = 0.06;
      if (t > T_J2) { G.rc = -0.18 * eOut(tramo(t, T_J2, T_J2 + 0.3)); G.cara = "sorpresa"; }
    } else {
      gD = mezcla(uG([J1X, JY]), ALTO_D, eInOut(tramo(t, T_COGE1 + 0.05, T_COGE1 + 0.5)));
      G.cara = "risa"; G.rc = 0.1;
    }
    // ¿no quiere? se queda parado y luego asiente
    if (t > T_NO && t < T_EMPUJA) {
      G.cara = t < T_SALUDO + 0.3 ? "sorpresa" : "sonrisa";
      G.rc = t < T_SALUDO + 0.3 ? 0.14 : 0.1 + 0.06 * Math.sin((t - T_SALUDO) * 12) * (1 - tramo(t, 3.7, 3.9));
    }
    // le llega la segunda jarra: la coge con la izquierda y levanta las dos
    if (t > T_COGE2 - 0.3) {
      const k = eInOut(tramo(t, T_COGE2 - 0.3, T_COGE2)), kA = eInOut(tramo(t, T_COGE2 + 0.05, T_COGE2 + 0.4));
      gI = mezcla(mezcla([6, 124], uG([J2X2, JY]), k), ALTO_I, kA);
      G.brazoIDelante = true;
      if (t > T_COGE2) { G.cara = "risa"; G.rc = 0.03 * Math.sin(t * 9); }
    }
    // el vaso pasa por delante: lo sigue con la mirada
    if (t > T_AGUA && t < T_PARA + 0.3) {
      const x = this.xV(t);
      G.rc = clamp((x - XG) / 900, -0.2, 0.2); G.cara = x < XG + 80 ? "sorpresa" : "risa";
    }
    if (t > T_COGE2 && t < T_CHIN - 0.6) {
      const s = Math.sin(t * 9) * 4 * tramo(t, T_COGE2, T_COGE2 + 0.4);
      gD = [gD[0], gD[1] + s]; gI = [gI[0], gI[1] - s];
    }
    // brindis: la jarra de la derecha al centro; la de la izquierda baja a la barra
    if (t > T_CHIN - 0.6) {
      const k = eInOut(tramo(t, T_CHIN - 0.6, T_CHIN - 0.1)), choca = Math.max(0, 1 - Math.abs(t - T_CHIN) * 7);
      gD = mezcla(ALTO_D, uG([464 + 5 * choca, 352]), k);
      gI = mezcla(ALTO_I, uG([J2X2 + 4, JY]), k);
      G.cara = "risa"; G.rc = 0.08;
    }
    // y bebe
    if (t > T_BEBE) {
      const kS = eInOut(tramo(t, T_BEBE, T_BEBE + 0.3)), kT = tramo(t, T_BEBE + 0.3, T_BEBE + 1.0), kB = eInOut(tramo(t, T_BEBE + 1.1, T_BEBE + 1.4));
      const rc = -0.3 * eInOut(Math.min(1, kT * 3)) * (1 - kB);
      incJ = (-0.4 * kS - 0.9 * eInOut(kT)) * (1 - kB);
      const b = boca(rc), r = rot2(JARRA.borde, incJ), beber = [b[0] - r[0], b[1] - r[1]];
      gD = mezcla(mezcla(uG([464, 352]), beber, kS), [84, 84], kB);
      G.rc = kS > 0.5 && kB < 0.5 ? rc : 0.08; G.cara = kT > 0.05 && kB < 0.5 ? "dormido" : kB >= 0.5 ? (t > 8.4 ? "guino" : "risa") : "risa";
    }
    G.manoD = gD; G.manoI = gI;
    if (t > T_COGE1) G.jarra = { inc: incJ, nivel: this.nivelG(t) };
    if (t > T_COGE2) G.objI2 = (g, m) => { dibujarJarra(g, m, 0, 0.9, "asa", t); dibujarJarra(g, m, 0, 0.9, "cuerpo", t); };

    // --- Marcos (de servicio)
    let mD = [66, 124], mI = [8, 124], angV = 0;
    if (t < T_PIDE) M.cara = "sonrisa";
    else if (t < T_NO) { M.cara = t > T_J2 ? "sorpresa" : "sonrisa"; M.rc = t > T_J2 ? -0.18 : -0.08; }
    // el dedo que dice que no
    if (t > T_NO - 0.15 && t < T_SALUDO + 0.05) {
      const k = eOut(tramo(t, T_NO - 0.15, T_NO + 0.1));
      mD = mezcla([66, 124], [62 + 7 * Math.sin(t * 17), 50], k);
      M.cara = "guino"; M.rc = 0.11 * Math.sin(t * 14) * k;
    }
    // saludo: ¡de servicio!
    if (t > T_SALUDO && t < T_EMPUJA) {
      const k = eBack(tramo(t, T_SALUDO, T_SALUDO + 0.2)), kV = eInOut(tramo(t, T_EMPUJA - 0.25, T_EMPUJA));
      mD = mezcla(mezcla([62, 50], [55, 36], k), [66, 124], kV);
      M.cara = "sonrisa"; M.rc = -0.04;
    }
    // le devuelve la jarra empujándola por la barra
    if (t > T_EMPUJA - 0.35 && t < T_EMPUJA + 0.5) {
      const k = eInOut(tramo(t, T_EMPUJA - 0.35, T_EMPUJA - 0.05)), kE = eOut(tramo(t, T_EMPUJA - 0.05, T_EMPUJA + 0.15)), kV = eInOut(tramo(t, T_EMPUJA + 0.2, T_EMPUJA + 0.5));
      mI = mezcla(mezcla(mezcla([8, 124], uM([J2X + 50, JY + 14]), k), uM([J2X + 20, JY + 14]), kE), [8, 124], kV);
      M.cara = "guino"; M.rc = 0.08;
    }
    // ¡su vaso de agua!
    if (t > T_AGUA) {
      M.cara = t < T_PARA ? "sorpresa" : "risa"; M.rc = t < T_PARA ? clamp((this.xV(t) - xm) / 900, -0.2, 0) : -0.06;
    }
    if (t > T_COGEA - 0.25) {
      const k = eInOut(tramo(t, T_COGEA - 0.25, T_COGEA)), kA = eInOut(tramo(t, T_COGEA + 0.05, T_COGEA + 0.4));
      mI = mezcla(mezcla([8, 124], uM([VX, VY]), k), [-4, 66], kA);
      if (t > T_COGEA + 0.4) mI = [-4, 66 + 3 * Math.sin(t * 7)];
    }
    if (t > T_CHIN - 0.6) {
      const k = eInOut(tramo(t, T_CHIN - 0.6, T_CHIN - 0.1)), choca = Math.max(0, 1 - Math.abs(t - T_CHIN) * 7);
      mI = mezcla(mI, uM([535 - 5 * choca, 356]), k);
      M.cara = "risa"; M.rc = -0.08;
    }
    // un sorbito de agua
    if (t > T_BEBE) {
      const kS = eInOut(tramo(t, T_BEBE + 0.05, T_BEBE + 0.35)), kT = tramo(t, T_BEBE + 0.35, T_BEBE + 1.0), kB = eInOut(tramo(t, T_BEBE + 1.1, T_BEBE + 1.4));
      const rc = -0.06 * kS * (1 - kB);
      angV = 0.08 * kS * (1 - kB);
      const bo = boca(rc, "bombero"), r = rot2([PAJITA[0] * EV, PAJITA[1] * EV], angV), beber = [bo[0] - r[0] - 2, bo[1] - r[1] - 6];
      mI = mezcla(mezcla(uM([535, 356]), beber, kS), [-6, 70], kB);
      M.rc = rc; M.cara = kT > 0.05 && kB < 0.5 ? "dormido" : kB >= 0.5 ? (t > 8.2 ? "guino" : "risa") : "risa";
      if (kB >= 1) mI = [-6, 70 + 3 * Math.sin(t * 6)];
    }
    M.manoD = mD; M.manoI = mI;
    if (t > T_COGEA) { const a = angV, nv = this.nivelM(t); M.objI2 = (g, m) => vasoAgua(g, m[0], m[1], a, nv, t); }
    return { G, M, mG, mM };
  }
  // ------------------------------------------------------------------ actualizar
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // estela de las cosas que se deslizan
    const desl = [[this.xJ1(t), t > T_J1 && t < T_COGE1 - 0.1], [this.xJ2(t), (t > T_J2 && t < T_J2 + 0.55) || (t > T_EMPUJA && t < T_COGE2 - 0.1)], [this.xV(t), t > T_AGUA && t < T_PARA - 0.1]];
    for (const [x, va] of desl) if (va && x > 0 && x < W && Math.random() < 30 * dt) p.nueva(P.POLVO, x + azar(0, 40), BARRA - 4, azar(-40, 0), azar(-20, -4), azar(0.25, 0.45), azar(10, 18));
    this.una("j1", t > T_COGE1, () => temblar(4, 0.12));
    this.una("j2", t > T_J2 + 0.65, () => temblar(4, 0.12));
    this.una("sello", t > T_SELLO, () => {
      temblar(14, 0.35);
      for (let i = 0; i < 18; i++) { const a = azar(0, 6.283), v = azar(160, 380); p.nueva(P.CHISPA, 512 + Math.cos(a) * 150, 150 + Math.sin(a) * 40, Math.cos(a) * v, Math.sin(a) * v * 0.6, azar(0.3, 0.6), azar(6, 10)); }
    });
    this.una("vaso", t > T_PARA, () => {
      temblar(4, 0.12);
      for (let i = 0; i < 10; i++) { const a = azar(-Math.PI, 0), v = azar(80, 200); p.nueva(P.CHISPA, VX, BARRA - 40, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(5, 8)); }
    });
    this.una("chin", t > T_CHIN, () => {
      temblar(16, 0.4);
      p.nueva(P.DESTELLO, 512, 330, 0, 0, 0.35, 220);
      for (let i = 0; i < 26; i++) { const a = azar(-Math.PI, 0), v = azar(150, 420); p.nueva(P.ESPUMA, 500, 335, Math.cos(a) * v, Math.sin(a) * v, azar(0.5, 0.9), azar(5, 10)); }
      for (let i = 0; i < 22; i++) { const a = azar(-Math.PI * 0.9, -Math.PI * 0.1), v = azar(150, 380); this.gotas.push({ x: 534, y: 335, vx: Math.cos(a) * v, vy: Math.sin(a) * v, v: azar(0.5, 0.9), vm: 0.9, r: azar(2.5, 4.5) }); }
      for (let i = 0; i < 70; i++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-80, -10), azar(-40, 40), azar(0, 120), azar(2.4, 3.4), azar(9, 15), i % 5);
    });
    for (const d of this.gotas) { d.v -= dt; d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    p.suelo = (x) => (x > 0 && x < W ? BARRA - 4 : 1e9);
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  // ------------------------------------------------------------------ fondo y barra
  fondoBar() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gr = g.createLinearGradient(0, -60, 0, H);
    gr.addColorStop(0, "#140b07"); gr.addColorStop(0.6, "#25150b"); gr.addColorStop(1, "#160c06");
    g.fillStyle = gr; g.fillRect(-60, -60, W + 120, H + 120);
    g.fillStyle = "rgba(0,0,0,.22)"; for (let x = -40; x < W + 60; x += 58) g.fillRect(x, -60, 3, H + 120);
    const r = semilla(11);
    const COL = [["#3a9a4a", "#174a20"], ["#b0521e", "#4a1a06"], ["#e0b840", "#7a5a10"], ["#4a7ac0", "#13305a"], ["#c02238", "#500810"], ["#ecebdc", "#8a8670"]];
    for (const y of [176, 268]) {
      for (let x = 22; x < W - 10; x += 24 + r() * 9) {
        if (r() < 0.12) continue;
        const [c1, c2] = COL[(r() * COL.length) | 0];
        botella(g, x, y, 13 + r() * 5, 40 + r() * 26, c1, c2);
      }
      g.fillStyle = "#6a3e1c"; g.fillRect(-60, y, W + 120, 9);
      g.fillStyle = "rgba(255,210,150,.3)"; g.fillRect(-60, y, W + 120, 2);
      g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(-60, y + 9, W + 120, 7);
    }
    // lámparas
    for (const x of [XG, XM]) {
      g.strokeStyle = "#0b0b0b"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, -60); g.lineTo(x, 40); g.stroke();
      g.fillStyle = "#2a2e33"; g.beginPath(); g.moveTo(x - 32, 66); g.lineTo(x + 32, 66); g.lineTo(x + 12, 40); g.lineTo(x - 12, 40); g.closePath(); g.fill();
      g.fillStyle = "#fff3c4"; g.beginPath(); g.ellipse(x, 66, 24, 5, 0, 0, 6.283); g.fill();
    }
    g.globalCompositeOperation = "lighter";
    for (const x of [XG, XM]) { g.globalAlpha = 0.45; g.drawImage(BLOB2.oro, x - 230, 20, 460, 440); }
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    const v = g.createRadialGradient(W / 2, 300, 240, W / 2, 300, 720);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.75)");
    g.fillStyle = v; g.fillRect(-60, -60, W + 120, H + 120);
    return (this.cF = c);
  }
  barra(g) {
    if (!this.cB) {
      const c = lienzoNuevo(W + 120, H - BARRA + 70), x = c.getContext("2d");
      x.translate(60, 0);
      const gr = x.createLinearGradient(0, 0, 0, c.height);
      gr.addColorStop(0, "#5a3218"); gr.addColorStop(1, "#1c0f08");
      x.fillStyle = gr; x.fillRect(-60, 10, W + 120, c.height);
      x.fillStyle = "rgba(0,0,0,.35)"; for (let i = 30; i < W + 60; i += 96) x.fillRect(i, 26, 3, c.height);
      x.fillStyle = "#b8862d"; x.fillRect(-60, 104, W + 120, 8); x.fillStyle = "rgba(255,240,190,.55)"; x.fillRect(-60, 105, W + 120, 2);
      x.fillStyle = "#8a5426"; x.fillRect(-60, 0, W + 120, 18);
      x.fillStyle = "rgba(255,220,170,.45)"; x.fillRect(-60, 0, W + 120, 3);
      x.fillStyle = "rgba(0,0,0,.45)"; x.fillRect(-60, 18, W + 120, 5);
      this.cB = c;
    }
    g.drawImage(this.cB, -60, BARRA - 6);
  }
  // ------------------------------------------------------------------ dibujar
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    g.drawImage(this.fondoBar(), -60, -60);
    foco(g, XG, XG, BARRA, 170, 0.5); foco(g, XM, XM, BARRA, 170, 0.5);
    this.barra(g);
    // los dos detrás de la barra (no se les ven las piernas)
    g.save(); g.beginPath(); g.rect(-60, -60, W + 120, BARRA - 6 + 60); g.clip();
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    g.restore();
    // lo que está en la barra
    const vel = (x0, x1) => Math.abs(x1 - x0);
    const estela = (x, y, h, k) => {
      if (k < 0.5) return;
      g.save(); g.strokeStyle = "rgba(255,240,200,.45)"; g.lineWidth = 3; g.lineCap = "round";
      for (let i = 0; i < 3; i++) { const yy = y - h * (0.2 + i * 0.3); g.beginPath(); g.moveTo(x - 20 - i * 14, yy); g.lineTo(x - 20 - i * 14 - Math.min(140, k * 9), yy); g.stroke(); }
      g.restore();
    };
    if (t < T_COGE1) { const x = this.xJ1(t); estela(x, BARRA - 5, 56, vel(x, this.xJ1(t - 0.02))); jarraEn(g, x, JY, 0.9, t); }
    if (t < T_COGE2) {
      const x = this.xJ2(t), v = vel(x, this.xJ2(t - 0.02));
      if (t < T_EMPUJA) estela(x, BARRA - 5, 56, v);
      else if (v > 0.5) { g.save(); g.translate(2 * x + 46, 0); g.scale(-1, 1); estela(x, BARRA - 5, 56, v); g.restore(); }
      jarraEn(g, x, JY, 0.9, t);
    }
    if (t < T_COGEA) {
      const x = this.xV(t); estela(x - 18, BARRA - 5, 56, vel(x, this.xV(t - 0.02)));
      g.save(); g.translate(x, VY); g.scale(ESC, ESC); vasoAgua(g, 0, 0, 0, 0.82, t); g.restore();
      if (t > T_PARA && t < T_COGEA + 0.4) brillo(g, x + 22, VY - 50, 24 * (1 - tramo(t, T_PARA, T_COGEA + 0.4)), 1);
    }
    g.restore();
    this.p.dibujar(g);
    // gotitas de agua del brindis
    if (this.gotas.length) {
      g.save(); g.fillStyle = "#a8e2ff";
      for (const d of this.gotas) { g.globalAlpha = a * Math.min(1, (d.v / d.vm) * 2); g.beginPath(); g.ellipse(d.x, d.y, d.r * 0.7, d.r, 0, 0, 6.283); g.fill(); }
      g.restore();
    }
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: a * (1 - tramo(d, dur - 0.15, dur)) });
      g.restore();
    };
    if (t > T_PIDE + 0.1 && t < T_J2 + 0.3) {
      const k = tramo(t, T_PIDE + 0.1, T_PIDE + 0.35) * (1 - tramo(t, T_J2 + 0.1, T_J2 + 0.3));
      const b = aPant(e.mG, [70, 30]);
      g.save(); g.globalAlpha = a; bocadillo(g, 250, 120, "¡UNA RONDA!", b[0] - 30, b[1] - 20, k, 42); g.restore();
    }
    ono("¡ZIUUUM!", 210, 410, T_J2 + 0.05, 0.6, 46, "#fffdf5", "#1b1b1b", -0.06);
    if (t > T_NO && t < T_SELLO + 0.1) {
      const k = tramo(t, T_NO, T_NO + 0.2) * (1 - tramo(t, T_SELLO - 0.05, T_SELLO + 0.1));
      const b = aPant(e.mM, [60, 30]);
      g.save(); g.globalAlpha = a; bocadillo(g, 820, 120, "¡NO, NO!", b[0] + 20, b[1] - 10, k, 40); g.restore();
    }
    ono("¡ZIUUUM!", 230, 400, T_AGUA + 0.1, 0.6, 46, "#bfeaff", "#06303a", -0.06);
    ono("¡CHIN!", 512, 250, T_CHIN, 0.75, 70, "#ffd34d", "#3a2400", -0.06);
    ono("GLU, GLU", 330, 230, T_BEBE + 0.45, 0.7, 34, "#ffd34d", "#3a2400", -0.05);
    ono("SLURP", 760, 230, T_BEBE + 0.5, 0.7, 34, "#bfeaff", "#06303a", 0.06);
    // sello: ¡DE SERVICIO!
    if (t > T_SELLO && t < T_CHIN - 0.3) {
      const d = t - T_SELLO, k = tramo(d, 0, 0.14), s = lerp(2.6, 1, eIn(k)), sal = tramo(t, T_EMPUJA + 0.4, T_EMPUJA + 0.8);
      const sp = this.sello();
      g.save(); g.globalAlpha = a * Math.min(1, k * 3) * (1 - sal); g.translate(512, 150 - 40 * eIn(sal)); g.rotate(-0.09); g.scale(s * (1 - 0.3 * sal), s * (1 - 0.3 * sal));
      g.drawImage(sp, -sp.width / 2, -sp.height / 2); g.restore();
    }
    // título final
    if (t > T_CHIN + 0.05) {
      const d = t - T_CHIN - 0.05, k = tramo(d, 0, 0.18), s = lerp(2, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 6));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a; g.translate(512, 110); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  sello() {
    if (CT.has("s")) return CT.get("s");
    const c = lienzoNuevo(760, 210), g = c.getContext("2d");
    g.fillStyle = "rgba(255,250,240,.92)"; rectR(g, 20, 20, 720, 170, 26); g.fill();
    g.strokeStyle = "#d11a22"; g.lineWidth = 10; rectR(g, 30, 30, 700, 150, 20); g.stroke();
    g.lineWidth = 3; rectR(g, 44, 44, 672, 122, 14); g.stroke();
    txt(g, "¡DE SERVICIO!", 380, 146, { tam: 112, peso: 900, fam: FD, color: "#d11a22", esp: 4, max: 640 });
    // textura de tinta gastada
    const r = semilla(5);
    g.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 160; i++) { g.globalAlpha = 0.25 + r() * 0.5; g.beginPath(); g.arc(30 + r() * 700, 30 + r() * 150, 1 + r() * 3, 0, 6.283); g.fill(); }
    CT.set("s", c);
    return c;
  }
  titulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(920, 200), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 160);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#bfeaff"); gr.addColorStop(1, "#2fa8e8");
    txt(g, "¡DE SERVICIO!", 460, 150, { tam: 132, peso: 900, fam: FD, color: gr, borde: "#06243a", bordeAncho: 12, esp: 5, glow: "rgba(80,190,255,.85)", glowTam: 24, max: 880 });
    CT.set("t", c);
    return c;
  }
}

registrar({ id: "00228", nombre: "De servicio", crear: () => new DeServicio() });
})();
