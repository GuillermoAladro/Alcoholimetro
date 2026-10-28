"use strict";
/*
 * 00190 · ARQUEÓLOGOS
 *
 * Animación del banco. Empieza y acaba en negro.
 * En una excavación del desierto, Guillermo y Marcos (con sombreros de explorador) quitan arena con pinceles de un
 * montículo: va apareciendo una jarra gigante de piedra. Cae la arena: ¡UN FÓSIL! La levantan entre los dos, posan
 * para la foto (¡CLIC!)… y se parte el asa (¡CRAC!). Se quedan helados; Marcos la tapa con arena de una patada,
 * silbando, y Guillermo se parte de risa. Fundido a negro.
 */
(() => {
const cache = cacheTexto();
const ESC = 1.4;
const XG = 350, XM = 675, FX = 512, FBASE = 566;
const FW = 124, FH = 160;                       // cuerpo de la jarra fósil
const T_DESCUBRE = 3.0, T_TXT = 3.2, T_COGEN = 3.7, T_ARRIBA = 4.6, T_FOTO = 5.0, T_CRAC = 5.75, T_MIRAN = 6.5;
const T_BAJAN = 6.95, T_PATADA = 7.7;
const ASA_SUELO = [628, 568];

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(820, 200), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 160);
  gr.addColorStop(0, "#fff6d8"); gr.addColorStop(0.5, "#f0c878"); gr.addColorStop(1, "#b8742a");
  txt(g, "¡UN FÓSIL!", 416, 156, { tam: 136, peso: 900, fam: FD, color: "#3a1e08", esp: 5 });
  txt(g, "¡UN FÓSIL!", 410, 148, { tam: 136, peso: 900, fam: FD, color: gr, borde: "#3a1e08", bordeAncho: 11, esp: 5, glow: "rgba(255,220,140,.8)", glowTam: 24 });
  cache.set("t", c);
  return c;
}
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

/** Sombrero de explorador (coordenadas de avatar). */
function sombrero(g, cx, y0, ancho) {
  const hw = ancho / 2;
  g.save();
  const gr = g.createLinearGradient(0, y0 - 40, 0, y0 + 6);
  gr.addColorStop(0, "#f2dca4"); gr.addColorStop(1, "#b89650");
  g.fillStyle = gr;
  g.beginPath(); g.ellipse(cx, y0, hw + 16, 9, 0, 0, 6.283); g.fill();
  g.strokeStyle = "#7a5a24"; g.lineWidth = 1.2; g.stroke();
  g.beginPath(); g.moveTo(cx - hw + 4, y0 - 2); g.bezierCurveTo(cx - hw + 2, y0 - 42, cx + hw - 2, y0 - 42, cx + hw - 4, y0 - 2); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = "#6a3e1a"; g.fillRect(cx - hw + 3, y0 - 11, ancho - 6, 7);
  g.fillStyle = "rgba(255,255,255,.3)"; g.beginPath(); g.ellipse(cx - 10, y0 - 26, 9, 5, -0.4, 0, 6.283); g.fill();
  g.restore();
}
/** Pincel (coordenadas de avatar); la mano en (0,0), apunta con `ang`. */
function pincel(g, ang) {
  g.save(); g.rotate(ang);
  g.fillStyle = "#b07a3a"; rectR(g, -10, -2.2, 26, 4.4, 2); g.fill();
  g.fillStyle = "#c9ced4"; g.fillRect(15, -3, 5, 6);
  g.fillStyle = "#3a2a1a"; g.beginPath(); g.moveTo(20, -3.4); g.lineTo(31, -5); g.lineTo(31, 5); g.lineTo(20, 3.4); g.closePath(); g.fill();
  g.restore();
}
/** La jarra fósil: (0,0) = centro de la base. */
function fosil(g, conAsa, t) {
  g.save();
  const w = FW, h = FH;
  // asa
  if (conAsa) asaFosil(g, w / 2 - 6, -h + 34);
  else {
    // muñones rotos del asa
    for (const y of [-h + 34, -h + 116]) {
      g.fillStyle = "#c4b48c"; g.strokeStyle = "#5a4a30"; g.lineWidth = 2;
      g.beginPath(); g.moveTo(w / 2 - 8, y - 9); g.lineTo(w / 2 + 10, y - 8); g.lineTo(w / 2 + 6, y - 2); g.lineTo(w / 2 + 12, y + 3); g.lineTo(w / 2 + 5, y + 9); g.lineTo(w / 2 - 8, y + 9); g.closePath(); g.fill(); g.stroke();
    }
  }
  // cuerpo
  const gr = g.createLinearGradient(-w / 2, 0, w / 2, 0);
  gr.addColorStop(0, "#8a7a5c"); gr.addColorStop(0.35, "#d8cba6"); gr.addColorStop(0.6, "#c4b48c"); gr.addColorStop(1, "#7a6a4c");
  g.fillStyle = gr; rectR(g, -w / 2, -h, w, h, 12); g.fill();
  g.strokeStyle = "#5a4a30"; g.lineWidth = 3; g.stroke();
  // espuma de piedra
  g.fillStyle = "#e6dcc0";
  g.beginPath(); g.moveTo(-w / 2 - 4, -h + 8);
  for (let i = 0; i <= 5; i++) g.arc(-w / 2 + (i * w) / 5, -h - 4 - (i % 2) * 5, 15 + (i % 3) * 3, Math.PI, 0);
  g.lineTo(w / 2 + 4, -h + 8); g.closePath(); g.fill();
  g.strokeStyle = "#7a6a4c"; g.lineWidth = 2.5; g.stroke();
  g.fillStyle = "rgba(90,74,48,.35)";
  for (const [x, y, r] of [[-38, -h - 6, 3], [-10, -h - 14, 4], [22, -h - 9, 3], [44, -h - 2, 2.5]]) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
  // burbujas fosilizadas
  g.strokeStyle = "rgba(90,74,48,.45)"; g.lineWidth = 2;
  for (const [x, y, r] of [[-30, -100, 6], [-12, -60, 4], [18, -120, 5], [30, -40, 7], [-36, -30, 4], [6, -88, 3]]) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.stroke(); }
  // concha en espiral incrustada
  g.strokeStyle = "#6a5a3c"; g.lineWidth = 2.5;
  g.beginPath();
  for (let i = 0; i < 40; i++) { const a = i * 0.32, r = 1 + i * 0.42; const x = 16 + Math.cos(a) * r, y = -66 + Math.sin(a) * r; if (i) g.lineTo(x, y); else g.moveTo(x, y); }
  g.stroke();
  // grietas
  g.strokeStyle = "#4a3a22"; g.lineWidth = 2;
  g.beginPath(); g.moveTo(-w / 2 + 8, -h + 40); g.lineTo(-30, -h + 58); g.lineTo(-38, -h + 80); g.lineTo(-22, -h + 96);
  g.moveTo(w / 2 - 4, -30); g.lineTo(36, -20); g.lineTo(40, -6); g.stroke();
  g.fillStyle = "rgba(255,255,255,.22)"; rectR(g, -w / 2 + 10, -h + 14, 8, h - 28, 4); g.fill();
  g.restore();
}
function asaFosil(g, x, y) {
  g.save(); g.translate(x, y);
  g.strokeStyle = "#5a4a30"; g.lineWidth = 22; g.lineCap = "round";
  g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(52, -4, 52, 84, 0, 82); g.stroke();
  g.strokeStyle = "#c4b48c"; g.lineWidth = 16;
  g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(52, -4, 52, 84, 0, 82); g.stroke();
  g.strokeStyle = "rgba(255,255,255,.25)"; g.lineWidth = 4;
  g.beginPath(); g.moveTo(8, -2); g.bezierCurveTo(40, 2, 44, 50, 36, 64); g.stroke();
  g.restore();
}

class Arqueologos extends Escena {
  constructor() {
    super(9.8);
    this.p = new Parts(420);
    this.p.suelo = () => PIES - 4;
    this.fondoC = null;
    this.arena = null;
    this.montonK = 0;
  }
  /** Punto de barrido de cada pincel (serpentina por su mitad del fósil). */
  barrido(u, lado, t) {
    const filas = 5, s = clamp(u, 0, 0.999) * filas, f = Math.floor(s), fr = s - f;
    const x0 = lado < 0 ? FX - FW / 2 - 6 : FX + 2, x1 = lado < 0 ? FX - 2 : FX + FW / 2 + 40;
    let x = f % 2 ? lerp(x1, x0, fr) : lerp(x0, x1, fr);
    const y = FBASE - FH - 34 + f * 46 + 10 * Math.sin(t * 31 + lado);
    x += 8 * Math.sin(t * 27 + lado * 2);
    return [x, y];
  }
  uBarrido() { return tramo(this.t, 0.35, T_DESCUBRE - 0.05); }
  /** Posición de la base del fósil. */
  fosilPos() {
    const t = this.t;
    const kS = eInOut(tramo(t, T_COGEN + 0.25, T_ARRIBA)), kB = eInOut(tramo(t, T_BAJAN, T_BAJAN + 0.5));
    let y = lerp(lerp(FBASE, FBASE - 150, kS), FBASE, kB);
    if (t > T_COGEN + 0.25 && t < T_ARRIBA) y += 3 * Math.sin(t * 50);
    const choque = t > T_CRAC ? 6 * Math.sin((t - T_CRAC) * 30) * Math.exp(-(t - T_CRAC) * 8) : 0;
    return [FX, y + choque];
  }
  asa() {
    const t = this.t, [fx, fy] = this.fosilPos();
    const pegada = [fx + FW / 2 - 6, fy - FH + 34];
    if (t < T_CRAC) return { x: pegada[0], y: pegada[1], r: 0, suelta: false };
    const u = tramo(t, T_CRAC, T_CRAC + 0.45);
    const x = lerp(pegada[0] + 20, ASA_SUELO[0] - 18, u), y = lerp(pegada[1] + 40, ASA_SUELO[1] - 32, u * u) - 30 * Math.sin(u * Math.PI);
    return { x, y: Math.min(y, ASA_SUELO[1] - 32), r: 1.6 * eOut(u), suelta: true };
  }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0.12, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "marcos", cara: "sonrisa", rc: -0.12, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152], brazoIDelante: true };
    // agachados al principio; se ponen de pie al levantar
    const kPie = eInOut(tramo(t, T_COGEN + 0.25, T_ARRIBA - 0.1));
    const sy = lerp(0.84, 1, kPie);
    let yg = PIES, ym = PIES;
    const mG = matAv(XG, yg, ESC, 0, 1, sy), mM = matAv(XM, ym, ESC, 0, 1, sy);
    let pinG = false, pinM = false, angG = 0.55, angM = Math.PI - 0.55;
    if (t < T_DESCUBRE + 0.4) {
      const u = this.uBarrido();
      const pg = this.barrido(u, -1, t), pm = this.barrido(u, 1, t);
      const offG = [Math.cos(angG) * 28 * ESC * sy, Math.sin(angG) * 28 * ESC * sy], offM = [Math.cos(angM) * 28 * ESC * sy, Math.sin(angM) * 28 * ESC * sy];
      const kE = eOut(tramo(t, 0.05, 0.35)) * (1 - eInOut(tramo(t, T_DESCUBRE, T_DESCUBRE + 0.3)));
      G.manoD = mezcla([70, 158], enAv(mG, [pg[0] - offG[0], pg[1] - offG[1]]), kE);
      M.manoI = mezcla([6, 152], enAv(mM, [pm[0] - offM[0], pm[1] - offM[1]]), kE);
      pinG = pinM = true;
      G.cara = "dormido"; M.cara = "sonrisa";
      if (t > 1.5) { G.cara = "sorpresa"; M.cara = "sorpresa"; }
      if (t > 2.15 && t < 2.6) { G.rc = 0.2; M.rc = -0.2; G.cara = "risa"; M.cara = "guino"; }
    }
    if (t >= T_DESCUBRE) { G.cara = "sorpresa"; M.cara = "sorpresa"; G.rc = 0.05; M.rc = -0.05; }
    if (t >= T_TXT + 0.2) { G.cara = "risa"; M.cara = "risa"; }
    // cogen el fósil por abajo y lo levantan
    const [fx, fy] = this.fosilPos();
    if (t >= T_COGEN && t < T_BAJAN + 0.55) {
      const k = eInOut(tramo(t, T_COGEN, T_COGEN + 0.25));
      const qG = enAv(matAv(XG, yg, ESC, 0, 1, sy), [fx - FW / 2 + 4, fy - 12]), qM = enAv(matAv(XM, ym, ESC, 0, 1, sy), [fx + FW / 2 - 4, fy - 12]);
      G.manoD = mezcla(G.manoD, qG, k); M.manoI = mezcla(M.manoI, qM, k);
      G.manoI = mezcla([9, 160], [-6, 128], k);
      M.manoD = mezcla([67, 152], [80, 128], k);
      pinG = pinM = false;
      if (t > T_COGEN + 0.25 && t < T_ARRIBA) { G.cara = "dormido"; M.cara = "dormido"; G.rc = 0.04 * Math.sin(t * 40); M.rc = -0.04 * Math.sin(t * 40); }
      if (t >= T_ARRIBA) { G.cara = "risa"; M.cara = "guino"; G.rc = -0.06; M.rc = 0.06; }
      if (t >= T_FOTO && t < T_FOTO + 0.35) { G.cara = "sonrisa"; M.cara = "sonrisa"; }
      if (t >= T_FOTO + 0.35) { G.cara = "risa"; M.cara = "risa"; }
    }
    // ¡CRAC!: miran el asa en el suelo, luego se miran
    if (t >= T_CRAC) {
      G.cara = "sorpresa"; M.cara = "sorpresa";
      const k = eOut(tramo(t, T_CRAC + 0.1, T_CRAC + 0.3));
      G.rc = 0.24 * k; M.rc = 0.22 * k;
    }
    if (t >= T_MIRAN) { G.rc = 0.2; M.rc = -0.2; M.cara = "guino"; }
    if (t >= T_BAJAN + 0.55) {
      const k = eInOut(tramo(t, T_BAJAN + 0.55, T_BAJAN + 0.8));
      G.manoD = mezcla(enAv(mG, [fx - FW / 2 + 4, fy - 12]), [70, 158], k); M.manoI = mezcla(enAv(mM, [fx + FW / 2 - 4, fy - 12]), [6, 152], k);
      G.manoI = mezcla([-6, 128], [9, 160], k); M.manoD = mezcla([80, 128], [67, 152], k);
    }
    // Marcos tapa el asa con una patada de arena, silbando
    let silba = false;
    if (t >= T_PATADA - 0.2) {
      const k = Math.sin(Math.PI * tramo(t, T_PATADA - 0.2, T_PATADA + 0.25));
      M.piernaI = [-8 * k, 0.55 * k];
      M.cara = "guino"; M.rc = -0.1;
      if (t > T_PATADA + 0.3) { M.rc = -0.16 + 0.04 * Math.sin(t * 6); M.manoD = [74, 60]; M.manoI = [8, 140]; silba = true; }
      G.cara = t > T_PATADA + 0.2 ? "risa" : "sorpresa"; G.rc = 0.16;
      if (t > T_PATADA + 0.45) { G.manoD = mezcla([70, 158], [46, 64], eOut(tramo(t, T_PATADA + 0.45, T_PATADA + 0.7))); G.rc = 0.1 + 0.05 * Math.sin(t * 14); }
    }
    // gorros y pinceles
    const RG = avatar().rig, RM = avatar("marcos").rig;
    const gorro = (R, rc, cx, y0, w) => (g) => { g.save(); g.translate(R.cuello[0], R.cuello[1]); g.rotate(rc); g.translate(-R.cuello[0], -R.cuello[1]); sombrero(g, cx, y0, w); g.restore(); };
    const gorroG = gorro(RG, G.rc, 39, 6, 64), gorroM = gorro(RM, M.rc, 37, 16, 60);
    G.objD = (g) => gorroG(g);
    if (pinG) G.objD2 = (g, mano) => { g.save(); g.translate(mano[0], mano[1]); pincel(g, angG); g.restore(); };
    M.objI = (g) => gorroM(g);
    if (pinM) M.objI2 = (g, mano) => { g.save(); g.translate(mano[0], mano[1]); pincel(g, angM); g.restore(); };
    return { G, M, mG, mM, silba };
  }

  arenaC() {
    if (this.arena) return this.arena;
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    g.beginPath(); g.moveTo(300, PIES + 14); g.bezierCurveTo(372, 470, 410, 342, 512, 338); g.bezierCurveTo(614, 342, 652, 470, 724, PIES + 14); g.closePath();
    const gr = g.createLinearGradient(0, 330, 0, PIES);
    gr.addColorStop(0, "#f4d79a"); gr.addColorStop(1, "#d4a95e");
    g.fillStyle = gr; g.fill();
    g.save(); g.clip();
    const r = semilla(4);
    g.fillStyle = "rgba(160,110,50,.35)";
    for (let i = 0; i < 70; i++) { g.beginPath(); g.arc(380 + r() * 270, 380 + r() * 190, 1 + r() * 2.2, 0, 6.283); g.fill(); }
    g.strokeStyle = "rgba(255,240,200,.6)"; g.lineWidth = 2;
    for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(512, 640, 110 + i * 34, 3.5, 5.9); g.stroke(); }
    g.restore();
    g.globalCompositeOperation = "destination-out";
    this.arena = c; this.arenaG = g;
    return c;
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // los pinceles van quitando arena
    const ar = this.arenaC(), ag = this.arenaG;
    void ar;
    if (t > 0.35 && t < T_DESCUBRE) {
      const u = this.uBarrido();
      for (const lado of [-1, 1]) {
        const q = this.barrido(u, lado, t);
        ag.beginPath(); ag.arc(q[0], q[1], 34, 0, 6.283); ag.fill();
        if (Math.random() < 18 * dt) p.nueva(P.POLVO, q[0], q[1], lado * azar(40, 160), azar(-120, -20), azar(0.4, 0.8), azar(14, 26));
        if (Math.random() < 30 * dt) p.nueva(P.CHISPA, q[0], q[1], lado * azar(40, 200), azar(-200, -60), azar(0.3, 0.5), azar(3, 5));
      }
    }
    // cae la arena que queda
    this.una("descubre", t > T_DESCUBRE, () => {
      temblar(8, 0.3);
      for (let i = 0; i < 40; i++) p.nueva(P.POLVO, azar(400, 630), azar(350, 560), azar(-160, 160), azar(-60, 40), azar(0.6, 1.2), azar(26, 50));
    });
    this.una("brilla", t > T_TXT, () => {
      p.nueva(P.DESTELLO, FX, FBASE - 90, 0, 0, 0.5, 320);
      for (let i = 0; i < 40; i++) { const a = azar(0, 6.283), v = azar(120, 420); p.nueva(P.PURPURINA, FX, FBASE - 100, Math.cos(a) * v, Math.sin(a) * v, azar(0.8, 1.4), azar(10, 16)); }
    });
    this.una("arriba", t > T_ARRIBA, () => { for (let i = 0; i < 24; i++) p.nueva(P.POLVO, FX + azar(-60, 60), FBASE - 150 + azar(-10, 10), azar(-60, 60), azar(40, 160), azar(0.6, 1), azar(16, 28)); });
    this.una("foto", t > T_FOTO, () => { p.nueva(P.DESTELLO, 900, 120, 0, 0, 0.3, 400); });
    this.una("crac", t > T_CRAC, () => {
      temblar(12, 0.3);
      const [fx, fy] = this.fosilPos();
      for (let i = 0; i < 18; i++) p.nueva(P.POLVO, fx + FW / 2 + 20, fy - FH + 70, azar(0, 160), azar(-120, 40), azar(0.5, 0.9), azar(14, 26));
      for (let i = 0; i < 14; i++) p.nueva(P.CHISPA, fx + FW / 2 + 10, fy - FH + 70, azar(20, 260), azar(-260, -40), azar(0.3, 0.6), azar(4, 7));
    });
    this.una("cae", t > T_CRAC + 0.45, () => { temblar(8, 0.2); for (let i = 0; i < 16; i++) p.nueva(P.POLVO, ASA_SUELO[0] + azar(-30, 30), ASA_SUELO[1], azar(-160, 160), azar(-80, -10), azar(0.6, 1.1), azar(24, 40)); });
    this.una("baja", t > T_BAJAN + 0.5, () => { temblar(6, 0.2); for (let i = 0; i < 12; i++) p.nueva(P.POLVO, FX + azar(-80, 80), FBASE, azar(-140, 140), azar(-60, -10), azar(0.5, 0.9), azar(22, 36)); });
    this.una("patada", t > T_PATADA, () => {
      for (let i = 0; i < 30; i++) p.nueva(P.POLVO, ASA_SUELO[0] + 30 + azar(-10, 10), PIES - 10, azar(-260, -60), azar(-160, -30), azar(0.6, 1.1), azar(20, 40));
      for (let i = 0; i < 24; i++) p.nueva(P.CHISPA, ASA_SUELO[0] + 30, PIES - 10, azar(-300, -60), azar(-300, -80), azar(0.3, 0.6), azar(4, 7));
    });
    this.montonK = eOut(tramo(t, T_PATADA + 0.05, T_PATADA + 0.4));
    p.actualizar(dt);
  }

  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, 420);
    gc.addColorStop(0, "#3a9ae8"); gc.addColorStop(1, "#cfeeff");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, H + 120);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.85; g.drawImage(BLOB.amarillo, 780, -100, 300, 300); g.restore();
    g.fillStyle = "#fffbe0"; g.beginPath(); g.arc(930, 50, 42, 0, 6.283); g.fill();
    // dunas
    for (const [col, base, amp, f, ph] of [["#e8c27a", 400, 60, 0.006, 1], ["#dcae62", 440, 46, 0.009, 3]]) {
      g.fillStyle = col; g.beginPath(); g.moveTo(-60, H + 60);
      for (let x = -60; x <= W + 60; x += 20) g.lineTo(x, base - Math.abs(Math.sin(x * f + ph)) * amp);
      g.lineTo(W + 60, H + 60); g.closePath(); g.fill();
    }
    // suelo de la excavación
    const gs = g.createLinearGradient(0, 470, 0, H);
    gs.addColorStop(0, "#e2b870"); gs.addColorStop(1, "#c4904a");
    g.fillStyle = gs; g.fillRect(-60, 478, W + 120, H);
    // estacas y cuerdas
    g.strokeStyle = "#6a4a2a"; g.lineWidth = 6;
    for (const x of [120, 900]) { g.beginPath(); g.moveTo(x, 520); g.lineTo(x, 470); g.stroke(); }
    g.strokeStyle = "#f4f0e6"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(120, 474); g.lineTo(900, 474); g.moveTo(120, 500); g.lineTo(900, 500); g.stroke();
    // cubo y criba
    g.fillStyle = "#c8322a"; g.beginPath(); g.moveTo(820, 548); g.lineTo(870, 548); g.lineTo(864, 590); g.lineTo(826, 590); g.closePath(); g.fill();
    g.strokeStyle = "#7a1a14"; g.lineWidth = 2; g.beginPath(); g.arc(845, 548, 24, Math.PI, 0); g.stroke();
    g.fillStyle = "#e6c890"; g.beginPath(); g.ellipse(845, 550, 24, 5, 0, 0, 6.283); g.fill();
    g.strokeStyle = "#8a6a3a"; g.lineWidth = 5; g.beginPath(); g.ellipse(170, 570, 46, 12, 0, 0, 6.283); g.stroke();
    g.strokeStyle = "rgba(120,90,50,.6)"; g.lineWidth = 1;
    for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(170 + i * 12, 560); g.lineTo(170 + i * 12, 580); g.stroke(); }
    // cactus
    g.fillStyle = "#3a8a4a";
    rectR(g, 60, 330, 26, 150, 13); g.fill(); rectR(g, 30, 380, 18, 50, 9); g.fill(); rectR(g, 30, 410, 40, 16, 8); g.fill(); rectR(g, 96, 360, 18, 50, 9); g.fill(); rectR(g, 76, 400, 38, 16, 8); g.fill();
    // hoyo de la excavación
    g.fillStyle = "#a8743a"; g.beginPath(); g.ellipse(FX, PIES + 6, 200, 26, 0, 0, 6.283); g.fill();
    this.fondoC = c;
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses();
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    // el fósil (y la arena que lo tapa)
    const [fx, fy] = this.fosilPos(), A = this.asa();
    g.save(); g.translate(fx, fy); fosil(g, !A.suelta, t); g.restore();
    const kAr = 1 - tramo(t, T_DESCUBRE, T_DESCUBRE + 0.35);
    if (kAr > 0) { g.save(); g.globalAlpha = kAr; g.drawImage(this.arenaC(), 0, (1 - kAr) * 40); g.restore(); }
    if (t > T_TXT && t < T_COGEN + 0.4) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.4 * (1 - tramo(t, T_COGEN, T_COGEN + 0.4)); g.drawImage(BLOB2.oro, fx - 160, fy - 260, 320, 300); g.restore(); }
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    // el asa (cayendo o en el suelo) y el montón de arena de la patada
    if (A.suelta && this.montonK < 1) { g.save(); g.translate(A.x, A.y); g.rotate(A.r); asaFosil(g, -20, -40); g.restore(); }
    if (this.montonK > 0) {
      const k = this.montonK;
      g.fillStyle = "#dcae62"; g.beginPath(); g.ellipse(ASA_SUELO[0] - 10, PIES + 4, 70 * k, 42 * k, 0, Math.PI, 0); g.fill();
      g.fillStyle = "rgba(255,240,200,.5)"; g.beginPath(); g.ellipse(ASA_SUELO[0] - 22, PIES - 16 * k, 30 * k, 10 * k, -0.2, Math.PI, 0); g.fill();
    }
    this.p.dibujar(g);
    // ¡UN FÓSIL!
    if (t > T_TXT) {
      const d = t - T_TXT, k = tramo(d, 0, 0.2), s = lerp(2.4, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 6));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 92 + 5 * Math.sin(d * 2)); g.rotate(-0.035); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // ¡CLIC! (flash de la foto)
    if (t > T_FOTO && t < T_FOTO + 0.6) {
      const a = 1 - tramo(t, T_FOTO, T_FOTO + 0.35);
      g.fillStyle = `rgba(255,255,255,${0.75 * a})`; g.fillRect(-60, -60, W + 120, H + 120);
      txt(g, "¡CLIC!", 880, 250, { tam: 64, peso: 400, fam: FC, color: "#ffffff", borde: "#1a3a5a", bordeAncho: 8, alfa: 1 - tramo(t, T_FOTO + 0.4, T_FOTO + 0.6), esp: 2 });
    }
    // ¡CRAC!
    if (t > T_CRAC && t < T_CRAC + 0.9) {
      const k = tramo(t, T_CRAC, T_CRAC + 0.12), a = 1 - tramo(t, T_CRAC + 0.65, T_CRAC + 0.9);
      g.save(); g.translate(830 + azar(-3, 3), 250); g.rotate(0.12);
      txt(g, "¡CRAC!", 0, 0, { tam: 84 * eBack(k), peso: 400, fam: FC, color: "#ffe9a0", borde: "#3a1a00", bordeAncho: 10, alfa: a, esp: 2 });
      g.restore();
    }
    // notas del silbido de Marcos
    if (e.silba) {
      const q = aPant(e.mM, [44, 64]);
      for (let i = 0; i < 3; i++) {
        const u = ((t - T_PATADA) * 0.9 + i / 3) % 1;
        g.save(); g.globalAlpha = Math.sin(u * Math.PI); g.translate(q[0] + 20 + u * 70, q[1] - 10 - u * 90);
        g.fillStyle = "#3a1a00"; g.beginPath(); g.ellipse(0, 0, 7, 5, -0.4, 0, 6.283); g.fill(); g.fillRect(5, -26, 3, 26); g.fillRect(5, -26, 12, 4);
        g.restore();
      }
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.45), tramo(t, 9.25, this.dur - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00190", nombre: "Arqueólogos", crear: () => new Arqueologos() });
})();
