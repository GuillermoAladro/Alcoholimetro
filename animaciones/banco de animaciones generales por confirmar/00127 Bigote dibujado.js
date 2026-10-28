"use strict";
/*
 * 00127 · BIGOTE DIBUJADO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Rodrigo duerme apoyado en la barra (Zzz). Guillermo llega, saca un rotulador y, aguantándose la risa, le pinta un
 * bigote con caracolillos (el bigote va en la cabeza de Rodrigo y la sigue). Silba disimulando; Rodrigo se despierta,
 * se mira en una cuchara (se ve el reflejo en grande) y… ¡BIGOTE! Guillermo sale corriendo muerto de risa y Rodrigo
 * detrás, riéndose también; cruzan otra vez la pantalla y se apaga la lámpara.
 */
(() => {
const ESC = 1.9, AY = 660, BARRA = 470;
const XR = 680;
const T_DIB0 = 2.95, T_DIB1 = 4.85, T_DESP = 5.15, T_BIG = 6.95;
const CUCHARA = [800, BARRA - 1];

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) {
    const u = (k[i][2] || eInOut)((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0])), a = k[i - 1][1], b = k[i][1];
    return Array.isArray(a) ? [lerp(a[0], b[0], u), lerp(a[1], b[1], u)] : lerp(a, b, u);
  }
  return k[k.length - 1][1];
}
const aAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
/** Punto de la cara (unidades de avatar, cabeza derecha) con la cabeza girada rc alrededor del cuello. */
function enCabeza(R, p, rc) { const r = rot2([p[0] - R.cuello[0], p[1] - R.cuello[1]], rc); return [R.cuello[0] + r[0], R.cuello[1] + r[1]]; }
const pantAU = (x, q) => [(q[0] - x) / ESC + 39, (q[1] - AY) / ESC + 232];

// el bigote (unidades de la cara de Rodrigo): dos trazos desde el centro, con caracolillo al final
const BIG_I = [[37, 60.4], [34, 60.1], [30.6, 60.8], [27.6, 62.2], [24.9, 62.5], [23, 61.2], [22.7, 59.2], [24.1, 58.2], [25.6, 59.2]];
const BIG_D = BIG_I.map((p) => [74 - p[0], p[1]]);
function largo(L) { let s = 0; for (let i = 1; i < L.length; i++) s += Math.hypot(L[i][0] - L[i - 1][0], L[i][1] - L[i - 1][1]); return s; }
/** Trazo parcial (k 0–1 del largo). Devuelve el punto final. */
function trazo(g, L, k) {
  const total = largo(L) * k;
  let s = 0, fin = L[0];
  g.beginPath(); g.moveTo(L[0][0], L[0][1]);
  for (let i = 1; i < L.length; i++) {
    const d = Math.hypot(L[i][0] - L[i - 1][0], L[i][1] - L[i - 1][1]);
    if (s + d >= total) { const u = (total - s) / d; fin = [lerp(L[i - 1][0], L[i][0], u), lerp(L[i - 1][1], L[i][1], u)]; g.lineTo(fin[0], fin[1]); break; }
    s += d; fin = L[i]; g.lineTo(L[i][0], L[i][1]);
  }
  if (k > 0.001) g.stroke();
  return fin;
}
function puntaBigote(k) {
  // dónde está la punta del rotulador (sin dibujar)
  const L = k < 0.5 ? BIG_I : BIG_D, kk = k < 0.5 ? k * 2 : k * 2 - 1;
  const total = largo(L) * clamp(kk, 0, 1);
  let s = 0;
  for (let i = 1; i < L.length; i++) {
    const d = Math.hypot(L[i][0] - L[i - 1][0], L[i][1] - L[i - 1][1]);
    if (s + d >= total) { const u = (total - s) / d; return [lerp(L[i - 1][0], L[i][0], u), lerp(L[i - 1][1], L[i][1], u)]; }
    s += d;
  }
  return L[L.length - 1];
}
function bigote(g, k) {
  if (k <= 0) return;
  g.save(); g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = "#121212";
  g.lineWidth = 2.5; trazo(g, BIG_I, clamp(k * 2, 0, 1)); trazo(g, BIG_D, clamp(k * 2 - 1, 0, 1));
  g.lineWidth = 3.6; trazo(g, BIG_I.slice(0, 5), clamp(k * 2 * 1.55, 0, 1)); trazo(g, BIG_D.slice(0, 5), clamp((k * 2 - 1) * 1.55, 0, 1));
  g.restore();
}
/** Rotulador en la mano (unidades de avatar); la punta queda en (14, 0) girado `ang`. */
function rotulador(g, m, ang) {
  g.save(); g.translate(m[0], m[1]); g.rotate(ang);
  const gr = g.createLinearGradient(0, -2.7, 0, 2.7);
  gr.addColorStop(0, "#4a4f56"); gr.addColorStop(0.45, "#eef1f5"); gr.addColorStop(1, "#30343a");
  g.fillStyle = gr; rectR(g, -11, -2.7, 20.5, 5.4, 1.8); g.fill();
  g.fillStyle = "#151515"; g.fillRect(-5, -2.75, 7, 5.5);
  g.fillStyle = "#151515"; rectR(g, -12, -2.4, 3, 4.8, 1); g.fill();
  g.fillStyle = "#c9ced4"; g.beginPath(); g.moveTo(9.4, -2.3); g.lineTo(12.2, -1.1); g.lineTo(12.2, 1.1); g.lineTo(9.4, 2.3); g.closePath(); g.fill();
  g.fillStyle = "#0d0d0d"; g.beginPath(); g.moveTo(12.1, -1.2); g.lineTo(14.3, 0); g.lineTo(12.1, 1.2); g.closePath(); g.fill();
  g.restore();
}
/** Cuchara en la mano (unidades de avatar): mango hacia abajo y cazo arriba. */
function cuchara(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const gr = g.createLinearGradient(-5, 0, 5, 0);
  gr.addColorStop(0, "#7d8790"); gr.addColorStop(0.45, "#f4f8fb"); gr.addColorStop(1, "#8f99a3");
  g.fillStyle = gr;
  rectR(g, -1.3, -9, 2.6, 19, 1.2); g.fill();
  g.beginPath(); g.ellipse(0, -15, 4.6, 6.6, 0, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(60,70,80,.7)"; g.lineWidth = 0.6; g.stroke();
  g.fillStyle = "rgba(255,255,255,.85)"; g.beginPath(); g.ellipse(-1.6, -17, 1, 2.2, -0.3, 0, 6.283); g.fill();
  g.restore();
}
function nota(g, x, y, s, a) {
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s);
  g.fillStyle = "#fffdf5"; g.strokeStyle = "#fffdf5"; g.lineWidth = 2.4;
  g.beginPath(); g.ellipse(0, 0, 6, 4.4, -0.4, 0, 6.283); g.fill();
  g.beginPath(); g.moveTo(5.2, -1.5); g.lineTo(5.2, -22); g.quadraticCurveTo(12, -17, 12, -9); g.stroke();
  g.restore();
}

class Bigote extends Escena {
  constructor() {
    super(10.45);
    this.p = new Parts(260);
    this.zs = []; this.notas = [];
    this.faseG = 0; this.faseR = 0;
  }
  xG(t) { return pista(t, [[0.3, -150], [1.6, 430, eOut], [2.5, 430], [2.9, 500], [7.55, 500], [8.25, -200, eIn], [8.35, -200], [9.45, 1250, (u) => u]]); }
  xR(t) { return pista(t, [[7.75, XR], [8.55, -200, eIn], [8.6, -260], [9.8, 1250, (u) => u]]); }
  anda(t, x0, x1) { return Math.abs(x1 - x0) > 0.2; }
  /** [Rodrigo, Guillermo] */
  poses() {
    const t = this.t, RR = avatar("rodrigo").rig;
    // ---------------- Rodrigo
    const R = { quien: "rodrigo", cara: "dormido", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [56, 130], manoI: [16, 131] };
    const dormido = t < T_DESP;
    const xr = this.xR(t), corrR = t > 7.75;
    let syR = 1, dyR = 0;
    const rcDuerme = 0.2 + 0.025 * Math.sin(t * 2.4) + (t > 3.75 && t < 4.05 ? 0.05 * Math.sin(t * 60) : 0);
    const kDesp = eInOut(tramo(t, T_DESP, T_DESP + 0.3));
    R.rc = lerp(rcDuerme, 0, kDesp);
    if (dormido) { syR = 1 + 0.012 * Math.sin(t * 2.4); }
    // mano bajo la mejilla mientras duerme
    const mejilla = enCabeza(RR, [58, 75], R.rc);
    const manoMejilla = mezcla([mejilla[0] + 2, mejilla[1] + 3], [60, 132], kDesp);
    R.manoI = mezcla([16, 131], [9, 157], kDesp);
    if (t >= T_DESP) R.cara = t < T_DESP + 0.35 ? "sorpresa" : "sonrisa";
    // la cuchara: la coge de la barra y se mira
    const cU = pantAU(XR, CUCHARA);
    const kCoge = eInOut(tramo(t, 5.55, 5.85)), kSube = eInOut(tramo(t, 5.85, 6.15));
    let manoDR = mezcla(manoMejilla, [cU[0] - 2, cU[1] - 4], kCoge);
    manoDR = mezcla(manoDR, [82, 66], kSube);
    let angC = lerp(-1.57, -0.12, kSube);
    if (t > 6.15 && t < T_BIG) { R.cara = "sorpresa"; R.rc = 0.05; }
    if (t >= T_BIG) {
      R.cara = t < 7.45 ? "sorpresa" : "risa"; R.puntas = 1 - tramo(t, 7.3, 7.9);
      R.rc = 0.04 * Math.sin(t * 30) * (1 - tramo(t, T_BIG, 7.3));
      // se señala el bigote con la otra mano
      const kS = eOut(tramo(t, T_BIG - 0.05, T_BIG + 0.15)) * (1 - eInOut(tramo(t, 7.45, 7.7)));
      if (kS > 0) R.brazoIDelante = true;
      R.manoI = mezcla(R.manoI, enCabeza(RR, [28, 68], R.rc), kS);
      manoDR = mezcla(manoDR, [92, 54 + 6 * Math.sin(t * 14)], eInOut(tramo(t, 7.3, 7.6)));
    }
    if (corrR) {
      const f = this.faseR, a = andar(f, 1.1);
      dyR = a.bote * 1.4; R.rc = 0.07 * Math.sin(f * 0.5);
      manoDR = [88 + 6 * Math.sin(f), 52 + 8 * Math.sin(f * 2)]; angC = 0.25 * Math.sin(f * 2);
      R.manoI = [2 + 10 * Math.sin(f), 132 + 6 * Math.cos(f)];
      R.cara = "risa";
    }
    R.manoD = manoDR;
    const conCuchara = t >= 5.85;
    if (conCuchara) R.objD = (g, m) => cuchara(g, m[0], m[1] - 1, angC + 0.0);
    const mR = matAv(xr, AY + dyR, ESC, corrR ? (t < 8.57 ? -0.05 : 0.05) : 0, 1, syR);

    // ---------------- Guillermo
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const xg = this.xG(t);
    let dyG = 0, giroG = 0, syG = 1;
    const andandoG = (t > 0.3 && t < 1.6) || (t > 2.5 && t < 2.9);
    const corrG = t > 7.55;
    if (andandoG) { const a = andar(this.faseG, t < 1.6 ? 1 : 0.6); dyG = a.bote; G.manoD = [70 + 5 * Math.sin(this.faseG), 158]; G.manoI = [9 - 5 * Math.sin(this.faseG), 160]; }
    if (t > 1.6 && t < 1.95) { G.cara = "sorpresa"; G.rc = 0.06; }
    if (t >= 1.95 && t < T_DIB1) { G.cara = "guino"; G.rc = 0.08; }
    // saca el rotulador y lo enseña
    const kSaca = eOut(tramo(t, 1.95, 2.3));
    if (t > 1.95) G.manoD = mezcla(G.manoD, [62, 110], kSaca);
    const angRot = -0.32 + (t > T_DIB0 && t < T_DIB1 ? 0.06 * Math.sin(t * 22) : 0);
    // pinta: la punta del rotulador sigue al bigote
    const kDib = tramo(t, T_DIB0, T_DIB1);
    const punta = puntaBigote(kDib);
    const puntaPant = aPant(mR, enCabeza(RR, punta, R.rc));
    const mGprov = matAv(xg, AY + dyG, ESC);
    const puntaG = aAv(mGprov, puntaPant), off = rot2([14.3, 0], angRot);
    const manoPinta = [puntaG[0] - off[0], puntaG[1] - off[1]];
    const kLleva = eInOut(tramo(t, 2.55, T_DIB0));
    if (t > 2.55 && t < T_DIB1 + 0.05) G.manoD = mezcla(G.manoD, manoPinta, kLleva);
    // se aguanta la risa
    if (t > 4.0 && t < T_DIB1) {
      G.cara = "risa"; G.brazoIDelante = true; dyG += Math.sin(t * 40) * 0.8;
      G.manoI = mezcla([9, 160], [34, 60], eOut(tramo(t, 4.0, 4.2)));
    }
    // esconde el rotulador bajo la barra y silba
    if (t >= T_DIB1) {
      const kEsc = eInOut(tramo(t, T_DIB1, T_DIB1 + 0.3));
      G.manoD = mezcla(manoPinta, [74, 176], kEsc);
      G.cara = "sonrisa"; G.rc = -0.12 + 0.03 * Math.sin(t * 5);
      G.manoI = [9, 160];
      if (t > 6.5) { G.cara = "guino"; G.rc = 0.06; }
      if (t > T_BIG - 0.15) { G.cara = "sorpresa"; G.rc = 0; G.puntas = 0.5 * (1 - tramo(t, 7.1, 7.4)); }
      if (t > 7.12) { G.cara = "risa"; syG = 1 - 0.02 * Math.abs(Math.sin(t * 13)); giroG = 0.04 * Math.sin(t * 13); G.manoI = [-2, 140]; G.manoD = [78, 140]; }
    }
    const conRot = t > 1.95 && t < T_DIB1 + 0.32;
    if (conRot) G.objD = (g, m) => rotulador(g, m, angRot);
    if (corrG) {
      const f = this.faseG, a = andar(f, 1.1);
      dyG = a.bote * 1.4; G.cara = "risa"; G.rc = 0.07 * Math.sin(f * 0.5); giroG = t < 8.3 ? -0.06 : 0.06; syG = 1;
      G.manoD = [80 + 10 * Math.sin(f), 124 - 8 * Math.cos(f)]; G.manoI = [0 - 10 * Math.sin(f), 124 + 8 * Math.cos(f)];
      G.brazoIDelante = false;
    }
    const mG = matAv(xg, AY + dyG, ESC, giroG, 1, syG);
    return { R, mR, G, mG, punta, kDib, puntaPant };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const x0 = this.xG(t - dt), x1 = this.xG(t);
    if (Math.abs(x1 - x0) > 0.05) this.faseG += dt * (t > 7.5 ? 15 : t > 2.4 && t < 3 ? 8 : 10);
    if (t > 7.75) this.faseR += dt * 15;
    // Zzz
    if (t < T_DESP - 0.2) {
      this.una("z" + Math.floor(t / 0.75), t > 0.2, () => this.zs.push({ t0: t }));
    }
    this.una("despierta", t > T_DESP, () => {
      temblar(6, 0.2);
      for (const z of this.zs) z.pop = t;
    });
    // notas de silbar
    if (t > 5.0 && t < 6.6) this.una("n" + Math.floor(t / 0.42), true, () => this.notas.push({ t0: t, lado: Math.random() < 0.5 ? -1 : 1 }));
    this.una("big", t > T_BIG, () => {
      temblar(16, 0.45);
      const e = this.poses(), q = aPant(e.mR, [37, 60]);
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.35, 160);
      for (let i = 0; i < 26; i++) { const a = azar(0, 6.283), v = azar(200, 520); p.nueva(P.CHISPA, q[0], q[1] - 40, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(7, 12)); }
    });
    // polvillo al echar a correr
    this.una("corre", t > 7.6, () => { for (let i = 0; i < 12; i++) p.nueva(P.POLVO, 520 + azar(-40, 40), BARRA - 10, azar(100, 400), azar(-80, -10), azar(0.4, 0.8), azar(24, 40)); });
    p.actualizar(dt);
  }
  barra(g) {
    const gf = this.grBarra || (this.grBarra = (() => { const gr = g.createLinearGradient(0, BARRA, 0, H); gr.addColorStop(0, "#5a3218"); gr.addColorStop(1, "#24130a"); return gr; })());
    g.fillStyle = gf; g.fillRect(-60, BARRA + 10, W + 120, H - BARRA + 60);
    g.fillStyle = "rgba(0,0,0,.35)";
    for (let x = 30; x < W; x += 96) g.fillRect(x, BARRA + 18, 3, H - BARRA);
    g.fillStyle = "rgba(255,210,150,.06)"; g.fillRect(-60, BARRA + 70, W + 120, 4);
    g.fillStyle = "#b8862d"; g.fillRect(-60, 556, W + 120, 9); g.fillStyle = "rgba(255,240,190,.6)"; g.fillRect(-60, 557, W + 120, 2);
    g.fillStyle = "#8a5426"; g.fillRect(-60, BARRA - 6, W + 120, 18);
    g.fillStyle = "rgba(255,220,170,.4)"; g.fillRect(-60, BARRA - 6, W + 120, 3);
    g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(-60, BARRA + 12, W + 120, 5);
  }
  dibujar(g) {
    if (!this._tit) this.titulo(); // se prepara en el primer cuadro (negro), no en el remate
    const t = this.t, e = this.poses(), RR = avatar("rodrigo").rig;
    fondo(g, "#000");
    const luz = 1 - tramo(t, 9.85, 10.42);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.4 * luz;
    g.drawImage(BLOB2.oroClaro, 100, 30, 824, 540); g.restore();
    // jarras al fondo de la barra
    for (const [x, nv] of [[110, 0.2], [930, 0.7]]) {
      g.save(); g.translate(x, BARRA - 4); g.scale(1.9, 1.9);
      dibujarJarra(g, [0, -18], 0, nv, "asa", t); dibujarJarra(g, [0, -18], 0, nv, "cuerpo", t);
      g.restore();
    }
    // Rodrigo (con su bigote) y luego Guillermo, que le mete el brazo por delante
    pintarAvatar(g, e.mR, e.R, t);
    const kB = t < T_DIB0 ? 0 : e.kDib;
    if (kB > 0) conMat(g, e.mR, () => {
      g.translate(RR.cuello[0], RR.cuello[1]); g.rotate(e.R.rc); g.translate(-RR.cuello[0], -RR.cuello[1]);
      bigote(g, kB);
    });
    pintarAvatar(g, e.mG, e.G, t);
    this.barra(g);
    // la cuchara en la barra
    if (t < 5.85) { g.save(); g.translate(CUCHARA[0], CUCHARA[1]); g.scale(ESC, ESC); cuchara(g, 0, 0, -1.57); g.restore(); }
    // garabatos del rotulador
    if (t > T_DIB0 && t < T_DIB1) {
      const q = e.puntaPant;
      g.save(); g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = 2.5; g.lineCap = "round";
      for (let i = 0; i < 3; i++) { const a = -2.4 + i * 0.5 + 0.2 * Math.sin(t * 30); g.beginPath(); g.moveTo(q[0] + Math.cos(a) * 16, q[1] + Math.sin(a) * 16); g.lineTo(q[0] + Math.cos(a) * 26, q[1] + Math.sin(a) * 26); g.stroke(); }
      g.restore();
      if (Math.sin(t * 9) > 0.2) txt(g, "ÑIIIC", q[0] - 40, q[1] - 160, { tam: 30, peso: 400, fam: FC, color: "#fffdf5", borde: "#222", bordeAncho: 6, esp: 2 });
    }
    // brillo del rotulador al sacarlo
    if (t > 2.2 && t < 2.6) { const q = aPant(e.mG, e.G._manoD || [62, 110]); brillo(g, q[0] + 26, q[1] - 12, 30 * Math.sin(tramo(t, 2.2, 2.6) * Math.PI), 1); }
    // Zzz
    const cabR = aPant(e.mR, enCabeza(RR, [58, 22], e.R.rc));
    for (const z of this.zs) {
      const d = t - z.t0; if (d > 2) continue;
      let a = Math.min(1, d * 3) * (1 - tramo(d, 1.4, 2)), s = 0.6 + 0.5 * d;
      if (z.pop != null) { const dp = t - z.pop; a *= 1 - tramo(dp, 0, 0.18); s *= 1 + dp * 4; }
      if (a <= 0) continue;
      txt(g, "Z", cabR[0] + 22 + d * 40 + 8 * Math.sin(d * 5), cabR[1] - d * 70, { tam: 42 * s, peso: 400, fam: FC, color: "#eaf7ff", borde: "#244e78", bordeAncho: 6, alfa: a });
    }
    // notas de silbar
    const bocaG = aPant(e.mG, boca(e.G.rc));
    for (const n of this.notas) {
      const d = t - n.t0; if (d > 1.2) continue;
      nota(g, bocaG[0] - 30 - d * 60, bocaG[1] - 30 - d * 90 + 6 * Math.sin(d * 8) * n.lado, 1.2, Math.min(1, d * 5) * (1 - tramo(d, 0.8, 1.2)));
    }
    this.p.dibujar(g);
    // el reflejo en la cuchara, en grande
    const kZ = eBack(tramo(t, 6.1, 6.35)) * (1 - eIn(tramo(t, 6.9, 7.08)));
    if (kZ > 0.01) this.reflejo(g, e, kZ, t);
    // ¡BIGOTE!
    if (t > T_BIG) {
      const d = t - T_BIG, k = tramo(d, 0, 0.16), s = lerp(2.6, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 9));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - tramo(t, 9.4, 9.9)); g.translate(512, 120); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // entrada: se enciende la lámpara
    const a = Math.max(1 - tramo(t, 0, 0.4), 1 - luz);
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  reflejo(g, e, k, t) {
    const cx = 875, cy = 140, rx = 72, ry = 96;
    const q = e.R._manoD ? aPant(e.mR, e.R._manoD) : [840, 320];
    const ox = lerp(q[0], cx, k), oy = lerp(q[1] - 30, cy, k);
    g.save();
    // líneas de zoom desde la cuchara
    g.globalAlpha = clamp(k, 0, 1) * 0.5; g.strokeStyle = "#fffdf5"; g.lineWidth = 2; g.setLineDash([6, 8]);
    g.beginPath(); g.moveTo(q[0], q[1] - 30); g.lineTo(ox - rx * k, oy + 20); g.moveTo(q[0], q[1] - 30); g.lineTo(ox + rx * k, oy + 20); g.stroke();
    g.setLineDash([]); g.globalAlpha = 1;
    g.translate(ox, oy); g.scale(k, k);
    // mango
    const gm = g.createLinearGradient(-12, 0, 12, 0);
    gm.addColorStop(0, "#7d8790"); gm.addColorStop(0.45, "#f4f8fb"); gm.addColorStop(1, "#8f99a3");
    g.fillStyle = gm; rectR(g, -11, ry - 8, 22, 90, 8); g.fill();
    // cazo
    g.beginPath(); g.ellipse(0, 0, rx + 8, ry + 8, 0, 0, 6.283); g.fillStyle = gm; g.fill();
    g.save();
    g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 6.283); g.clip();
    const gf = g.createRadialGradient(-20, -30, 10, 0, 0, ry * 1.1);
    gf.addColorStop(0, "#e9eef3"); gf.addColorStop(1, "#7f8a96");
    g.fillStyle = gf; g.fillRect(-rx, -ry, rx * 2, ry * 2);
    const RR = avatar("rodrigo").rig, pose = { quien: "rodrigo", cara: e.R.cara, rc: 0, puntas: e.R.puntas || 0 };
    const m = matAv(0, 8, 3.1, 0, 0.92, 1.1, [38, 56]);
    pintarAvatar(g, m, pose, t);
    conMat(g, m, () => bigote(g, 1));
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35;
    g.drawImage(BLOB.blanco, -rx * 0.9, -ry * 0.95, rx * 1.1, ry * 0.9);
    g.restore();
    g.strokeStyle = "rgba(40,48,56,.8)"; g.lineWidth = 3; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 6.283); g.stroke();
    g.restore();
  }
  titulo() {
    if (this._tit) return this._tit;
    const c = lienzoNuevo(720, 230), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 50, 0, 170);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.55, "#fff2c0"); gr.addColorStop(1, "#ffc93a");
    txt(g, "¡BIGOTE!", 360, 168, { tam: 150, peso: 400, fam: FC, color: gr, borde: "#141414", bordeAncho: 16, esp: 6, glow: "rgba(255,200,60,.8)", glowTam: 24 });
    // dos bigotitos a los lados
    for (const [x, s] of [[48, -1], [672, 1]]) {
      g.save(); g.translate(x, 110); g.scale(2.4 * s, 2.4); g.translate(-37, -60);
      g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = "#fffdf5"; g.lineWidth = 6.5; trazo(g, BIG_I, 1); trazo(g, BIG_D, 1);
      g.strokeStyle = "#141414"; g.lineWidth = 3.2; trazo(g, BIG_I, 1); trazo(g, BIG_D, 1);
      g.restore();
    }
    return (this._tit = c);
  }
}

registrar({ id: "00127", nombre: "Bigote dibujado", crear: () => new Bigote() });
})();
