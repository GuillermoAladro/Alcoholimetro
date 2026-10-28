"use strict";
/*
 * 00149 · DUELO DEL OESTE
 *
 * Animación del banco. Empieza y acaba en negro.
 * Calle de un pueblo del oeste al atardecer; sopla el viento y cruza una bola de paja. Guillermo y Rodrigo, con
 * sombrero, se plantan a los dos lados. Primer plano de los ojos entornados, primer plano de las manos temblando
 * sobre las fundas… ¡DESENFUNDA! y sacan… dos jarras de cerveza. Se miran, se ríen, se acercan, brindan y beben.
 * Se cierran las franjas negras como en el cine.
 */
(() => {
const cache = cacheTexto();
const ESC = 1.4, XG0 = 228, XR0 = 796, XG1 = 404, XR1 = 620;
const T_OJOS = 2.0, T_MANOS = 2.85, T_SACA = 3.65, T_CHIN = 6.5;
const RG = () => avatar().rig, RR = () => avatar("rodrigo").rig;

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(860, 210), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 50, 0, 160);
  gr.addColorStop(0, "#fff4d6"); gr.addColorStop(1, "#f2c27a");
  txt(g, "¡DESENFUNDA!", 438, 160, { tam: 132, peso: 900, fam: FD, color: "#8a1c0c", esp: 6 });
  txt(g, "¡DESENFUNDA!", 430, 152, { tam: 132, peso: 900, fam: FD, color: gr, borde: "#3a1606", bordeAncho: 10, esp: 6, glow: "rgba(255,160,60,.6)", glowTam: 20 });
  cache.set("t", c);
  return c;
}
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
function conCabeza(g, m, R, rc, f) { conMat(g, m, () => { g.translate(R.cuello[0], R.cuello[1]); g.rotate(rc); g.translate(-R.cuello[0], -R.cuello[1]); f(); }); }

/** Sombrero de vaquero liso; (cx, y) = centro del ala. */
function sombrero(g, cx, y, s, c1, c2) {
  g.save(); g.translate(cx, y); g.scale(s, s);
  // copa con hendidura
  g.beginPath();
  g.moveTo(-22, 2); g.quadraticCurveTo(-24, -22, -14, -30); g.quadraticCurveTo(-6, -26, 0, -30); g.quadraticCurveTo(6, -26, 14, -30);
  g.quadraticCurveTo(24, -22, 22, 2); g.closePath();
  const gr = g.createLinearGradient(-22, 0, 22, 0);
  gr.addColorStop(0, c2); gr.addColorStop(0.45, c1); gr.addColorStop(1, c2);
  g.fillStyle = gr; g.fill();
  g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 1; g.stroke();
  g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, -28); g.quadraticCurveTo(-2, -16, 0, -6); g.stroke();
  // cinta
  g.fillStyle = "#2a160a"; g.beginPath(); g.moveTo(-22.5, -6); g.quadraticCurveTo(0, -3, 22.5, -6); g.lineTo(22.3, 0); g.quadraticCurveTo(0, 3, -22.3, 0); g.closePath(); g.fill();
  // ala curvada hacia arriba
  g.beginPath();
  g.moveTo(-46, -10); g.quadraticCurveTo(-40, 4, -20, 5); g.quadraticCurveTo(0, 8, 20, 5); g.quadraticCurveTo(40, 4, 46, -10);
  g.quadraticCurveTo(44, 10, 22, 13); g.quadraticCurveTo(0, 16, -22, 13); g.quadraticCurveTo(-44, 10, -46, -10); g.closePath();
  const ga = g.createLinearGradient(0, -10, 0, 15);
  ga.addColorStop(0, c1); ga.addColorStop(1, c2);
  g.fillStyle = ga; g.fill(); g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = 1; g.stroke();
  g.restore();
}
/** Cinturón y funda de cuero (unidades de avatar). lado 1: cadera derecha de la pantalla; -1: izquierda. */
function cinturon(g, R, lado, abierta) {
  const y = R.caderaI[1] - 6;
  g.fillStyle = "#4a2a12"; g.beginPath(); g.moveTo(R.caderaI[0] - 11, y); g.quadraticCurveTo(R.cuello[0], y + 3, R.caderaD[0] + 11, y); g.lineTo(R.caderaD[0] + 11, y + 7); g.quadraticCurveTo(R.cuello[0], y + 10, R.caderaI[0] - 11, y + 7); g.closePath(); g.fill();
  g.fillStyle = "#e0b040"; rectR(g, R.cuello[0] - 5, y + 0.5, 10, 8, 1.5); g.fill();
  g.fillStyle = "#4a2a12"; g.fillRect(R.cuello[0] - 2.5, y + 2.5, 5, 4);
  const fx = lado > 0 ? R.caderaD[0] + 14 : R.caderaI[0] - 14;
  g.save(); g.translate(fx, y + 4); g.rotate(-lado * 0.12);
  const gr = g.createLinearGradient(-13, 0, 13, 0);
  gr.addColorStop(0, "#5a3010"); gr.addColorStop(0.5, "#9a5a26"); gr.addColorStop(1, "#4a2408");
  g.fillStyle = gr; rectR(g, -13, 2, 26, 38, 7); g.fill();
  g.strokeStyle = "#d9b070"; g.lineWidth = 0.9; g.setLineDash([2, 2]); rectR(g, -10, 5, 20, 32, 5); g.stroke(); g.setLineDash([]);
  if (!abierta) { g.fillStyle = "#7a4418"; g.beginPath(); g.moveTo(-13, 2); g.lineTo(13, 2); g.lineTo(10, 14); g.quadraticCurveTo(0, 18, -10, 14); g.closePath(); g.fill(); g.fillStyle = "#e0b040"; g.beginPath(); g.arc(0, 13, 2, 0, 6.283); g.fill(); }
  else { g.fillStyle = "#3a1c06"; g.beginPath(); g.ellipse(0, 3, 12, 3.5, 0, 0, 6.283); g.fill(); g.fillStyle = "#7a4418"; g.beginPath(); g.moveTo(-13, 2); g.lineTo(13, 2); g.lineTo(10, -8); g.lineTo(-10, -8); g.closePath(); g.fill(); }
  g.restore();
}
/** Jarra en la mano izquierda (vuelta del revés para que el cuerpo quede hacia fuera). */
function jarraIzq(pose, inc, nivel) {
  pose.objI = (g, m, a, t) => { g.save(); g.translate(m[0], m[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], inc, nivel, "asa", t); g.restore(); };
  pose.objI2 = (g, m, a, t) => { g.save(); g.translate(m[0], m[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], inc, nivel, "cuerpo", t); g.restore(); };
}

class DueloOeste extends Escena {
  constructor() {
    super(10.2);
    this.p = new Parts(360);
    this.fondoC = null; this.bola = null;
    this.gotas = [];
  }
  xG() { return lerp(XG0, XG1, eInOut(tramo(this.t, 5.0, 6.25))); }
  xR() { return lerp(XR0, XR1, eInOut(tramo(this.t, 5.0, 6.25))); }
  plano() { const t = this.t; return t < T_OJOS ? 0 : t < T_MANOS ? 1 : t < T_SACA ? 2 : 0; }
  poseG(planoCerca) {
    const t = this.t, x = this.xG();
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoI: [9, 160] };
    let mD = [70, 158], inc = 0, nivel = 1, jarra = false, bote = 0;
    if (t > 0.8) { pose.cara = "guino"; pose.rc = 0.08 * eInOut(tramo(t, 0.8, 1.1)); }
    // la mano se acerca a la funda y tiembla
    const kH = eInOut(tramo(t, 1.3, 1.8));
    const tr = t > 1.8 && t < T_SACA ? 1.2 + 2.5 * tramo(t, 2.0, T_SACA) : 0;
    mD = mezcla(mD, [74 + azar(-tr, tr), 150 + azar(-tr, tr)], kH);
    if (t >= T_SACA) {
      // ¡saca la jarra!
      const k = eOut(tramo(t, T_SACA, T_SACA + 0.12));
      mD = mezcla([74, 150], [112, 104], k); jarra = true; inc = -0.05 + 0.04 * Math.sin(t * 30) * (1 - tramo(t, T_SACA, T_SACA + 0.5));
      pose.cara = t < 4.3 ? "guino" : t < 4.85 ? "sorpresa" : "risa";
      pose.rc = t < 4.3 ? 0.08 : t < 4.85 ? -0.06 : 0.12;
      if (t > 4.3 && t < 4.85) mD = mezcla([112, 104], [92, 112], eInOut(tramo(t, 4.3, 4.5)));
      if (t > 4.85) mD = mezcla([92, 112], [70, 150], eInOut(tramo(t, 4.85, 5.1)));
    }
    if (t > 5.0 && t < 6.25) { const a = andar((t - 5.0) * 10, 0.9); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; bote = a.bote; }
    const m0 = matAv(x, PIES + bote, ESC);
    // brindis y trago
    if (t > 6.1) {
      const k = eInOut(tramo(t, 6.1, T_CHIN)), choque = enAv(m0, [512 - 44, 316]);
      mD = mezcla([70, 150], choque, k); mD[0] -= 4 * Math.sin(Math.PI * tramo(t, T_CHIN, T_CHIN + 0.2));
      inc = -0.1 * k; pose.cara = "risa"; pose.rc = 0.08;
    }
    if (t > 6.85) {
      const kS = eInOut(tramo(t, 6.85, 7.2)) * (1 - eInOut(tramo(t, 8.3, 8.6)));
      const kT = eInOut(tramo(t, 7.15, 8.2)) * (1 - eInOut(tramo(t, 8.3, 8.6)));
      pose.rc = -0.3 * kT;
      const incB = -0.4 * kS - 1.15 * kT, b = boca(pose.rc), r = rot2(JARRA.borde, incB);
      mD = mezcla(mezcla(enAv(m0, [512 - 44, 316]), [96, 104], eInOut(tramo(t, 6.85, 7.0))), [b[0] - r[0], b[1] - r[1]], kS);
      inc = incB; nivel = 1 - 0.8 * tramo(t, 7.2, 8.2);
      pose.cara = kT > 0.3 ? "dormido" : "risa";
      if (t > 8.45) { mD = mezcla(mD, [104, 70 + 3 * Math.sin(t * 9)], eInOut(tramo(t, 8.45, 8.75))); pose.cara = "risa"; pose.rc = 0.08 * Math.sin(t * 6); }
    }
    pose.manoD = mD;
    if (jarra) pose.jarra = { inc, nivel };
    pose.objD = (g) => cinturon(g, RG(), 1, t >= T_SACA);
    return { pose, m: m0, x };
  }
  poseR() {
    const t = this.t, x = this.xR();
    const pose = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [68, 157], brazoIDelante: true };
    let mI = [9, 157], inc = 0, nivel = 1, jarra = false, bote = 0;
    if (t > 0.95) { pose.cara = "guino"; pose.rc = -0.08 * eInOut(tramo(t, 0.95, 1.25)); }
    const kH = eInOut(tramo(t, 1.45, 1.95));
    const tr = t > 1.95 && t < T_SACA ? 1.2 + 2.5 * tramo(t, 2.0, T_SACA) : 0;
    mI = mezcla(mI, [5 + azar(-tr, tr), 150 + azar(-tr, tr)], kH);
    if (t >= T_SACA) {
      const k = eOut(tramo(t, T_SACA, T_SACA + 0.12));
      mI = mezcla([5, 150], [-32, 104], k); jarra = true; inc = -0.05 + 0.04 * Math.sin(t * 31) * (1 - tramo(t, T_SACA, T_SACA + 0.5));
      pose.cara = t < 4.35 ? "guino" : t < 4.85 ? "sorpresa" : "risa";
      pose.rc = t < 4.35 ? -0.08 : t < 4.85 ? 0.06 : -0.12;
      if (t > 4.35 && t < 4.85) mI = mezcla([-32, 104], [-12, 112], eInOut(tramo(t, 4.35, 4.55)));
      if (t > 4.85) mI = mezcla([-12, 112], [8, 150], eInOut(tramo(t, 4.85, 5.1)));
    }
    if (t > 5.0 && t < 6.25) { const a = andar((t - 5.0) * 10 + 1.6, 0.9); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; bote = a.bote; }
    const m0 = matAv(x, PIES + bote, ESC);
    if (t > 6.1) {
      const k = eInOut(tramo(t, 6.1, T_CHIN)), choque = enAv(m0, [512 + 44, 316]);
      mI = mezcla([8, 150], choque, k); mI[0] += 4 * Math.sin(Math.PI * tramo(t, T_CHIN, T_CHIN + 0.2));
      inc = -0.1 * k; pose.cara = "risa"; pose.rc = -0.08;
    }
    if (t > 6.85) {
      const kS = eInOut(tramo(t, 6.9, 7.25)) * (1 - eInOut(tramo(t, 8.3, 8.6)));
      const kT = eInOut(tramo(t, 7.2, 8.2)) * (1 - eInOut(tramo(t, 8.3, 8.6)));
      pose.rc = 0.3 * kT;
      const incB = -0.4 * kS - 1.15 * kT, b = boca(pose.rc, "rodrigo"), r = rot2(JARRA.borde, incB);
      mI = mezcla(mezcla(enAv(m0, [512 + 44, 316]), [-22, 104], eInOut(tramo(t, 6.85, 7.0))), [b[0] + r[0], b[1] - r[1]], kS);
      inc = incB; nivel = 1 - 0.8 * tramo(t, 7.25, 8.2);
      pose.cara = kT > 0.3 ? "dormido" : "risa";
      if (t > 8.45) { mI = mezcla(mI, [-22, 70 + 3 * Math.sin(t * 9 + 1)], eInOut(tramo(t, 8.45, 8.75))); pose.cara = "risa"; pose.rc = -0.08 * Math.sin(t * 6); }
    }
    pose.manoI = mI;
    if (jarra) jarraIzq(pose, inc, nivel);
    const objI = pose.objI;
    pose.objI = (g, m, a, tt) => { cinturon(g, RR(), -1, t >= T_SACA); if (objI) objI(g, m, a, tt); };
    return { pose, m: m0, x };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // bola de paja: rueda de derecha a izquierda dando botes
    const bx = (tt) => lerp(W + 90, -90, tramo(tt, 0.25, 2.1));
    if (t < 2.1) this.bola = { x: bx(t), y: PIES - 34 - Math.abs(Math.sin(t * 5.2)) * 70, r: -t * 9 };
    else if (t > T_MANOS && t < T_SACA) { const u = tramo(t, T_MANOS, T_SACA); this.bola = { x: lerp(W + 140, -140, u), y: 395 - Math.abs(Math.sin(u * 9)) * 50, r: -t * 9, cerca: true }; }
    else this.bola = null;
    // polvo del viento
    if (t < 9 && Math.random() < 6 * dt) p.nueva(P.POLVO, azar(100, W + 30), azar(470, 590), azar(-380, -240), azar(-20, 5), azar(0.8, 1.3), azar(14, 26));
    this.una("saca", t > T_SACA, () => {
      temblar(22, 0.4);
      for (const x of [this.xG() + 112 * 0.6, this.xR() - 40]) {
        p.nueva(P.DESTELLO, x + (x < 512 ? 50 : -50), 420, 0, 0, 0.35, 200);
        for (let i = 0; i < 16; i++) { const a = azar(-Math.PI, 0), v = azar(150, 420); p.nueva(P.CHISPA, x + (x < 512 ? 50 : -50), 420, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 11)); }
      }
    });
    this.una("chin", t > T_CHIN, () => {
      temblar(16, 0.35);
      p.nueva(P.DESTELLO, 512, 300, 0, 0, 0.35, 220);
      for (let i = 0; i < 30; i++) { const a = azar(-Math.PI, 0), v = azar(150, 480); p.nueva(P.ESPUMA, 512, 296, Math.cos(a) * v, Math.sin(a) * v, azar(0.6, 1.0), azar(6, 11)); }
      for (let i = 0; i < 14; i++) { const a = azar(-Math.PI, 0), v = azar(150, 420); p.nueva(P.CHISPA, 512, 300, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 10)); }
    });
    // gota de sudor en el primer plano
    this.una("sudor", t > T_OJOS + 0.25, () => { this.gotas.push({ t0: t }); });
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 80, H + 80), g = c.getContext("2d");
    g.translate(40, 40);
    const gc = g.createLinearGradient(0, -40, 0, 410);
    gc.addColorStop(0, "#c8502a"); gc.addColorStop(0.5, "#f29a46"); gc.addColorStop(1, "#ffe0a0");
    g.fillStyle = gc; g.fillRect(-40, -40, W + 80, 460);
    // sol bajo entre los dos
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8; g.drawImage(BLOB.amarillo, 512 - 200, 320 - 200, 400, 400); g.restore();
    g.fillStyle = "#fff3c0"; g.beginPath(); g.arc(512, 340, 74, 0, 6.283); g.fill();
    // mesetas
    g.fillStyle = "#9a4a3a";
    g.beginPath(); g.moveTo(-40, 410); g.lineTo(-40, 330); g.lineTo(90, 330); g.lineTo(120, 300); g.lineTo(260, 300); g.lineTo(290, 340); g.lineTo(380, 350); g.lineTo(400, 410); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(600, 410); g.lineTo(640, 360); g.lineTo(700, 356); g.lineTo(730, 318); g.lineTo(880, 318); g.lineTo(900, 345); g.lineTo(W + 40, 350); g.lineTo(W + 40, 410); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,200,140,.25)"; g.fillRect(120, 300, 140, 6); g.fillRect(730, 318, 150, 6);
    // suelo de tierra
    const gs = g.createLinearGradient(0, 400, 0, H + 40);
    gs.addColorStop(0, "#e2ad6c"); gs.addColorStop(1, "#a8683a");
    g.fillStyle = gs; g.fillRect(-40, 400, W + 80, H);
    g.strokeStyle = "rgba(120,70,30,.35)"; g.lineWidth = 3;
    for (const [a, b] of [[470, 300], [554, 724]]) { g.beginPath(); g.moveTo(a, 404); g.lineTo(b, H + 40); g.stroke(); }
    const r = semilla(5);
    g.fillStyle = "rgba(110,60,25,.4)";
    for (let i = 0; i < 40; i++) { g.beginPath(); g.ellipse(r() * W, 420 + r() * 180, 2 + r() * 4, 1 + r() * 2, 0, 0, 6.283); g.fill(); }
    // fachadas de madera a los lados
    const fachada = (x, w, h, nombre) => {
      const y0 = 404 - h;
      const gw = g.createLinearGradient(x, 0, x + w, 0);
      gw.addColorStop(0, "#6a3c1c"); gw.addColorStop(1, "#8a5428");
      g.fillStyle = gw; g.fillRect(x, y0, w, h);
      g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 2;
      for (let yy = y0 + 14; yy < 404; yy += 14) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.stroke(); }
      g.fillStyle = "#4a2810"; g.fillRect(x - 6, y0 - 30, w + 12, 34);
      txt(g, nombre, x + w / 2, y0 - 4, { tam: 28, peso: 900, fam: FD, color: "#ffe2a0", esp: 4 });
      for (let i = 0; i < 2; i++) { g.fillStyle = "#2a1608"; g.fillRect(x + 22 + i * (w - 80), y0 + 34, 36, 46); g.fillStyle = "rgba(255,220,140,.5)"; g.fillRect(x + 25 + i * (w - 80), y0 + 37, 30, 18); }
      g.fillStyle = "#3a200c"; g.fillRect(x - 8, 384, w + 16, 20);
      g.fillStyle = "#5a3216"; g.fillRect(x - 10, y0 + 92, w + 20, 12);
      g.fillStyle = "#2a1608"; for (let px = x + 4; px < x + w; px += 50) g.fillRect(px, y0 + 104, 7, 404 - (y0 + 104));
    };
    fachada(-30, 210, 220, "BAR");
    fachada(850, 210, 200, "HOTEL");
    // cactus
    g.fillStyle = "#3f7a3a";
    rectR(g, 300, 330, 18, 74, 9); g.fill(); rectR(g, 286, 350, 12, 30, 6); g.fill(); rectR(g, 286, 350, 20, 10, 5); g.fill(); rectR(g, 318, 340, 12, 26, 6); g.fill(); rectR(g, 310, 360, 20, 10, 5); g.fill();
    this.fondoC = c;
    return c;
  }
  bolaPaja(g, b) {
    if (!b) return;
    g.save(); g.translate(b.x, b.y); g.rotate(b.r); const s = b.cerca ? 2.1 : 1; g.scale(s, s);
    g.strokeStyle = "#a8763a"; g.lineWidth = 2.2;
    const r = semilla(3);
    for (let i = 0; i < 14; i++) { g.beginPath(); g.arc((r() - 0.5) * 14, (r() - 0.5) * 14, 16 + r() * 14, r() * 6, r() * 6 + 3); g.stroke(); }
    g.strokeStyle = "#7a5020"; g.lineWidth = 1.4;
    for (let i = 0; i < 10; i++) { g.beginPath(); g.arc((r() - 0.5) * 18, (r() - 0.5) * 18, 10 + r() * 14, r() * 6, r() * 6 + 2.4); g.stroke(); }
    g.restore();
  }
  pintarG(g, e, t) {
    pintarAvatar(g, e.m, e.pose, t);
    conCabeza(g, e.m, RG(), e.pose.rc || 0, () => sombrero(g, 39, 12, 1.0, "#7a4a24", "#3e220e"));
  }
  pintarR(g, e, t) {
    pintarAvatar(g, e.m, e.pose, t);
    conCabeza(g, e.m, RR(), e.pose.rc || 0, () => sombrero(g, 38, 20, 1.06, "#c89a62", "#7a5428"));
  }
  dibujar(g) {
    const t = this.t, pl = this.plano();
    fondo(g, "#000");
    const eG = this.poseG(), eR = this.poseR();
    if (pl === 0) {
      g.drawImage(this.fondo(), -40, -40);
      // sombras largas
      g.fillStyle = "rgba(90,40,10,.35)";
      for (const e of [eG, eR]) { const x = aPant(e.m, [39, 232])[0]; g.beginPath(); g.ellipse(x, PIES, 60, 11, 0, 0, 6.283); g.fill(); }
      if (this.bola && !this.bola.cerca) this.bolaPaja(g, this.bola);
      this.pintarG(g, eG, t);
      this.pintarR(g, eR, t);
      this.p.dibujar(g);
    } else {
      // primeros planos partidos: ojos y luego manos
      const panel = (x0, e, pintar, foco, esc) => {
        g.save(); g.beginPath(); g.rect(x0, 130, 508, 340); g.clip();
        const gc = g.createLinearGradient(0, 130, 0, 470);
        gc.addColorStop(0, pl === 1 ? "#f29a46" : "#e8b070"); gc.addColorStop(1, pl === 1 ? "#ffe0a0" : "#b87a44");
        g.fillStyle = gc; g.fillRect(x0, 130, 508, 340);
        const m = matAv(x0 + 254, 300, esc, 0, 1, 1, foco);
        pintar(g, { pose: e.pose, m }, t);
        g.restore();
        return m;
      };
      const tr = pl === 1 ? 0.8 * tramo(t, T_OJOS, T_MANOS) : 0;
      const mg = panel(0, eG, (gg, e, tt) => this.pintarG(gg, e, tt), pl === 1 ? [39 + azar(-tr, tr), 30] : [70, 150], pl === 1 ? 3.0 : 2.6);
      const mr = panel(516, eR, (gg, e, tt) => this.pintarR(gg, e, tt), pl === 1 ? [38, 38] : [8, 150], pl === 1 ? 3.0 : 2.6);
      g.fillStyle = "#000"; g.fillRect(508, 120, 8, 360);
      // gota de sudor en la sien de Rodrigo
      if (pl === 1) {
        const d = t - T_OJOS - 0.25;
        if (d > 0) {
          const q = aPant(mr, [64, 36 + d * 26]);
          g.fillStyle = "#c8ecff"; g.strokeStyle = "rgba(40,90,140,.6)"; g.lineWidth = 2;
          g.beginPath(); g.moveTo(q[0], q[1] - 16); g.quadraticCurveTo(q[0] + 9, q[1], q[0], q[1] + 6); g.quadraticCurveTo(q[0] - 9, q[1], q[0], q[1] - 16); g.fill(); g.stroke();
        }
        void mg;
      }
      // rayitas de tensión
      g.strokeStyle = "rgba(255,255,255,.7)"; g.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const y = 200 + i * 100 + Math.sin(t * 40 + i) * 4;
        g.beginPath(); g.moveTo(490, y - 10); g.lineTo(500, y); g.lineTo(492, y + 6); g.lineTo(504, y + 16); g.stroke();
        g.beginPath(); g.moveTo(534, y - 10); g.lineTo(524, y); g.lineTo(532, y + 6); g.lineTo(520, y + 16); g.stroke();
      }
    }
    // ¡DESENFUNDA!
    if (t > T_SACA) {
      const d = t - T_SACA, k = tramo(d, 0, 0.16), s = lerp(2.6, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 92); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // franjas negras de cine: entran al principio, se cierran al final
    const kF = t < 0.6 ? 1 - eInOut(tramo(t, 0.02, 0.6)) : eInOut(tramo(t, 9.3, this.dur - 0.04));
    const franja = pl === 0 ? lerp(0, 300, kF) : 130;
    if (franja > 0) { g.fillStyle = "#000"; g.fillRect(-60, -60, W + 120, franja + 60); g.fillRect(-60, H - franja, W + 120, franja + 60); }
    if (pl === 0 && t > 9.3) { g.fillStyle = "#000"; g.fillRect(-60, -60, W + 120, 60 + 1); }
  }
}

registrar({ id: "00149", nombre: "Duelo del oeste", crear: () => new DueloOeste() });
})();
