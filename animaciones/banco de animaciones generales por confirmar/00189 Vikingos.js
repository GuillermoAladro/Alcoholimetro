"use strict";
/*
 * 00189 · VIKINGOS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Al atardecer, por un mar de cerveza con crestas de espuma, entra un barco vikingo (vela a rayas, escudos lisos).
 * Guillermo y Marcos, con cascos de cuernos y barbas trenzadas, reman a compás; una ola de cerveza les salpica.
 * El barco llega a la orilla con un golpe (¡CLONC!), sacan cuernos de beber llenos y brindan: ¡SKÅL! Beben con la
 * cabeza atrás y se quedan con las barbas llenas de espuma. Fundido a negro.
 */
(() => {
const cache = cacheTexto();
const ESC = 1.4, BORDA = 458, SUELO = PIES - 32;
const XG = 400, XM = 595;
const T_OLA = 2.3, T_LLEGA = 4.0, T_COGEN = 4.75, T_SKAL = 6.0, T_BEBEN = 6.55, T_BAJAN = 8.0;
const PB = [512, 292];
const REMO_G = [262, 512], REMO_M = [762, 512];  // agujeros de los remos (relativos al barco sin desplazar)

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(700, 230), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 30, 0, 190);
  gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.45, "#ffd34d"); gr.addColorStop(1, "#e07a00");
  txt(g, "¡SKÅL!", 356, 186, { tam: 160, peso: 900, fam: FD, color: "#2a1200", esp: 8 });
  txt(g, "¡SKÅL!", 350, 178, { tam: 160, peso: 900, fam: FD, color: gr, borde: "#2a1200", bordeAncho: 12, esp: 8, glow: "rgba(255,200,60,.85)", glowTam: 28 });
  cache.set("t", c);
  return c;
}
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

/** Casco de cuernos (coordenadas de avatar; cx = centro, y0 = borde de abajo del casco). */
function casco(g, cx, y0, ancho) {
  const hw = ancho / 2;
  // cuernos
  for (const s of [-1, 1]) {
    g.save(); g.translate(cx + s * (hw - 4), y0 - 12);
    g.beginPath(); g.moveTo(0, 6); g.bezierCurveTo(s * 22, 4, s * 30, -14, s * 26, -40); g.bezierCurveTo(s * 20, -22, s * 12, -12, 0, -8); g.closePath();
    const gr = g.createLinearGradient(0, 0, s * 26, -40);
    gr.addColorStop(0, "#f3e6c4"); gr.addColorStop(0.7, "#e2cc96"); gr.addColorStop(1, "#8a6a3a");
    g.fillStyle = gr; g.fill(); g.strokeStyle = "#7a5a2a"; g.lineWidth = 1.2; g.stroke();
    g.strokeStyle = "rgba(120,90,40,.5)"; g.lineWidth = 1;
    for (const u of [0.3, 0.55]) { g.beginPath(); g.moveTo(s * 20 * u, 5 - 14 * u); g.lineTo(s * (8 + 20 * u), -8 - 18 * u); g.stroke(); }
    g.restore();
  }
  // cúpula
  const gm = g.createLinearGradient(cx - hw, 0, cx + hw, 0);
  gm.addColorStop(0, "#6a7078"); gm.addColorStop(0.4, "#e9edf0"); gm.addColorStop(1, "#5a6068");
  g.fillStyle = gm;
  g.beginPath(); g.moveTo(cx - hw, y0); g.bezierCurveTo(cx - hw, y0 - 44, cx + hw, y0 - 44, cx + hw, y0); g.closePath(); g.fill();
  g.strokeStyle = "#3a4048"; g.lineWidth = 1.4; g.stroke();
  g.strokeStyle = "rgba(60,64,72,.6)"; g.lineWidth = 3;
  g.beginPath(); g.moveTo(cx, y0 - 33); g.lineTo(cx, y0); g.stroke();
  // banda con remaches
  g.fillStyle = "#c9962a"; rectR(g, cx - hw - 1, y0 - 7, ancho + 2, 8, 3); g.fill();
  g.fillStyle = "#fff0b0";
  for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(cx - hw + 5 + (i * (ancho - 10)) / 5, y0 - 3, 1.4, 0, 6.283); g.fill(); }
}
/** Casco pintado una vez en un lienzo (a 3×) y copiado. */
const CASCOS = new Map();
function cascoCache(g, cx, y0, ancho) {
  let k = CASCOS.get(ancho);
  if (!k) {
    const S = 3, Wc = ancho + 70, Hc = 90, c = lienzoNuevo(Wc * S, Hc * S), x = c.getContext("2d");
    x.scale(S, S); casco(x, Wc / 2, Hc - 10, ancho);
    k = { c, Wc, Hc }; CASCOS.set(ancho, k);
  }
  g.drawImage(k.c, cx - k.Wc / 2, y0 - (k.Hc - 10), k.Wc, k.Hc);
}
/** Barba con dos trenzas; (cx, by) = boca. espuma 0–1. */
function barba(g, cx, by, col, osc, espuma) {
  g.save();
  g.fillStyle = col;
  g.beginPath();
  g.moveTo(cx - 26, by - 4); g.quadraticCurveTo(cx - 30, by + 14, cx - 18, by + 30); g.quadraticCurveTo(cx - 8, by + 40, cx, by + 40);
  g.quadraticCurveTo(cx + 8, by + 40, cx + 18, by + 30); g.quadraticCurveTo(cx + 30, by + 14, cx + 26, by - 4);
  g.quadraticCurveTo(cx + 20, by + 4, cx + 11, by + 7); g.quadraticCurveTo(cx, by + 10, cx - 11, by + 7); g.quadraticCurveTo(cx - 20, by + 4, cx - 26, by - 4);
  g.closePath(); g.fill();
  g.strokeStyle = osc; g.lineWidth = 1;
  for (let i = 0; i < 9; i++) { const x = cx - 20 + i * 5; g.beginPath(); g.moveTo(x, by + 10 + Math.abs(x - cx) * 0.1); g.quadraticCurveTo(x + 1, by + 22, x + (x - cx) * 0.15, by + 30 - Math.abs(x - cx) * 0.4); g.stroke(); }
  // trenzas
  for (const s of [-1, 1]) {
    for (let k = 0; k < 4; k++) {
      g.fillStyle = col; g.beginPath(); g.ellipse(cx + s * 7, by + 40 + k * 8, 4.2, 5, s * 0.2, 0, 6.283); g.fill();
      g.strokeStyle = osc; g.lineWidth = 0.8; g.stroke();
    }
    g.fillStyle = "#e0b040"; rectR(g, cx + s * 7 - 4, by + 62, 8, 4, 1.5); g.fill();
    g.fillStyle = col; g.beginPath(); g.moveTo(cx + s * 7 - 3, by + 66); g.lineTo(cx + s * 7 + 3, by + 66); g.lineTo(cx + s * 7, by + 74); g.closePath(); g.fill();
  }
  if (espuma > 0) {
    g.fillStyle = "#fffdf5"; g.globalAlpha = Math.min(1, espuma * 1.5);
    for (const [dx, dy, r] of [[-14, 12, 6], [-4, 16, 7], [8, 13, 6], [16, 20, 5], [-18, 22, 5], [0, 26, 6], [-8, 32, 4], [10, 30, 5]]) { g.beginPath(); g.arc(cx + dx, by + dy, r * espuma, 0, 6.283); g.fill(); }
  }
  g.restore();
}
/** Cuerno de beber; la mano en (0,0), boca del cuerno arriba. */
function cuerno(g, ang, nivel, t) {
  g.save(); g.rotate(ang);
  g.beginPath();
  g.moveTo(-9, -30); g.quadraticCurveTo(-10, 0, 4, 18); g.quadraticCurveTo(12, 28, 20, 30);
  g.quadraticCurveTo(10, 18, 9, 0); g.lineTo(9, -30); g.closePath();
  const gr = g.createLinearGradient(-9, -30, 20, 30);
  gr.addColorStop(0, "#f6ead0"); gr.addColorStop(0.55, "#d8bf88"); gr.addColorStop(1, "#5a3a1a");
  g.fillStyle = gr; g.fill(); g.strokeStyle = "#6a4a1a"; g.lineWidth = 1.2; g.stroke();
  g.fillStyle = "#c9962a"; g.fillRect(-10, -31, 20, 5); g.fillRect(-9, -6, 18, 3);
  if (nivel > 0.05) {
    g.fillStyle = "#ffc21f"; g.beginPath(); g.ellipse(0, -31, 9, 3, 0, 0, 6.283); g.fill();
    g.fillStyle = "#fffdf5";
    for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-6 + i * 4, -33 - (i % 2), 3.4 * Math.min(1, nivel * 1.6), 0, 6.283); g.fill(); }
  }
  g.restore();
}

class Vikingos extends Escena {
  constructor() {
    super(9.8);
    this.p = new Parts(380);
    this.fondoC = null;
  }
  barcoX() {
    const u = tramo(this.t, 0, T_LLEGA);
    return lerp(-780, 0, u * (2 - u) * 0.62 + u * 0.38);
  }
  /** Ángulo de remo de cada uno (fase). */
  remando() { return this.t < T_LLEGA + 0.15; }
  bal() {
    const t = this.t;
    const golpe = t > T_LLEGA ? Math.sin((t - T_LLEGA) * 16) * 0.05 * Math.exp(-(t - T_LLEGA) * 4) : 0;
    return 0.025 * Math.sin(t * 1.7) + golpe;
  }
  poses() {
    const t = this.t, bx = this.barcoX();
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "marcos", cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152], brazoIDelante: true };
    let lean = 0;
    if (t > T_LLEGA) lean = 0.14 * Math.sin(Math.min(1, (t - T_LLEGA) / 0.35) * Math.PI) ;
    const mG = matAv(XG + bx, SUELO, ESC, lean), mM = matAv(XM + bx, SUELO, ESC, lean);
    const w = t * 6.2;
    const rema = this.remando();
    // remos: el mango hace una elipse
    const mangoG = [XG + bx + 52 + 24 * Math.cos(w), 392 + 16 * Math.sin(w)];
    const mangoM = [XM + bx + 46 + 24 * Math.cos(w + 0.3), 394 + 16 * Math.sin(w + 0.3)];
    if (rema) {
      G.manoD = enAv(mG, mangoG); G.manoI = enAv(mG, mezcla(mangoG, [REMO_G[0] + bx, REMO_G[1]], 0.2));
      M.manoD = enAv(mM, mangoM); M.manoI = enAv(mM, [mangoM[0] - 40, mangoM[1] + 6]);
      G.cara = Math.sin(w) > 0 ? "dormido" : "sonrisa"; M.cara = Math.sin(w + 0.3) > 0 ? "risa" : "guino";
      G.rc = 0.06 * Math.sin(w); M.rc = -0.06 * Math.sin(w + 0.3);
    }
    // la ola les salpica
    if (t > T_OLA && t < T_OLA + 0.8) { G.cara = "sorpresa"; M.cara = "risa"; G.rc = -0.15; M.rc = 0.12; }
    // llegan: golpe
    if (t > T_LLEGA && t < T_COGEN) { G.cara = "sorpresa"; M.cara = "sorpresa"; G.manoD = [80, 120]; G.manoI = [0, 120]; M.manoD = [76, 118]; M.manoI = [-2, 118]; }
    // cogen los cuernos del fondo del barco y los suben
    let angG = 0, angM = 0, nivG = 1, nivM = 1, cuernos = false;
    if (t >= T_COGEN) {
      const kA = eInOut(tramo(t, T_COGEN, T_COGEN + 0.3)), kS = eInOut(tramo(t, T_COGEN + 0.35, T_COGEN + 0.75));
      cuernos = t > T_COGEN + 0.3;
      G.manoD = mezcla(mezcla([80, 120], [60, 196], kA), [86, 92], kS); G.manoI = mezcla([0, 120], [9, 160], kA);
      M.manoI = mezcla(mezcla([-2, 118], [12, 190], kA), [-12, 92], kS); M.manoD = mezcla([76, 118], [67, 152], kA);
      G.cara = kS > 0.5 ? "risa" : "sonrisa"; M.cara = kS > 0.5 ? "risa" : "guino"; G.rc = 0.08; M.rc = -0.08;
      angG = -0.3 * kS; angM = 0.3 * kS;
    }
    // ¡SKÅL!: chocan los cuernos
    if (t >= T_SKAL - 0.3 && t < T_BEBEN) {
      const k = eInOut(tramo(t, T_SKAL - 0.3, T_SKAL)), choca = Math.max(0, 1 - Math.abs(t - T_SKAL) * 6);
      G.manoD = mezcla([86, 92], enAv(mG, [PB[0] - 30 + 5 * choca, PB[1] + 30]), k);
      M.manoI = mezcla([-12, 92], enAv(mM, [PB[0] + 28 - 5 * choca, PB[1] + 32]), k);
      angG = lerp(-0.3, 0.35, k); angM = lerp(0.3, -0.35, k);
      G.cara = "risa"; M.cara = "risa"; G.rc = 0.1; M.rc = -0.1;
    }
    // beben con la cabeza atrás
    if (t >= T_BEBEN) {
      const k = eInOut(tramo(t, T_BEBEN, T_BEBEN + 0.35)), kB = eInOut(tramo(t, T_BAJAN, T_BAJAN + 0.35));
      const rcG = -0.32 * k * (1 - kB), rcM = 0.32 * k * (1 - kB);
      const bG = boca(rcG), bM = boca(rcM, "marcos");
      const aG = -1.9, aM = 1.9;
      const oG = rot2([0, -31], aG), oM = rot2([0, -31], aM);
      const dG = [bG[0] - oG[0] + 2, bG[1] - oG[1] + 1], dM = [bM[0] + oM[0] - 2, bM[1] - oM[1] + 1];
      const desdeG = enAv(mG, [PB[0] - 30, PB[1] + 30]), desdeM = enAv(mM, [PB[0] + 28, PB[1] + 32]);
      G.manoD = mezcla(mezcla(desdeG, dG, k), [80, 112], kB); M.manoI = mezcla(mezcla(desdeM, dM, k), [-6, 112], kB);
      angG = lerp(lerp(0.35, aG, k), -0.2, kB); angM = lerp(lerp(-0.35, -aM, k), 0.2, kB);
      G.rc = rcG; M.rc = rcM;
      G.cara = kB > 0.5 ? "risa" : "dormido"; M.cara = kB > 0.5 ? "guino" : "dormido";
      nivG = 1 - tramo(t, T_BEBEN + 0.35, T_BAJAN - 0.1); nivM = nivG;
      if (t > T_BAJAN + 0.6) { G.cara = "borracho"; M.cara = "risa"; }
      if (t > T_BAJAN + 1.0) { G.cara = "risa"; }
    }
    // barbas, cascos, remos y cuernos en los ganchos de dibujo (por debajo de los brazos de delante)
    const RG = avatar().rig, RM = avatar("marcos").rig;
    const espG = tramo(t, T_BEBEN + 0.5, T_BEBEN + 0.9), espM = espG;
    const cabezaG = (g) => { g.save(); g.translate(RG.cuello[0], RG.cuello[1]); g.rotate(G.rc); g.translate(-RG.cuello[0], -RG.cuello[1]); barba(g, RG.bocaPos[0], RG.bocaPos[1] + 2, "#7a4a26", "#4a2a12", espG); cascoCache(g, 39, 20, 70); g.restore(); };
    const cabezaM = (g) => { g.save(); g.translate(RM.cuello[0], RM.cuello[1]); g.rotate(M.rc); g.translate(-RM.cuello[0], -RM.cuello[1]); barba(g, RM.bocaPos[0], RM.bocaPos[1] + 2, "#2e1e16", "#140a06", espM); cascoCache(g, 37, 28, 66); g.restore(); };
    const remoG = rema ? enAv(mG, [REMO_G[0] + bx, REMO_G[1]]) : null, remoM = rema ? enAv(mM, [REMO_M[0] + bx, REMO_M[1]]) : null;
    G.objD = (g, mano) => {
      cabezaG(g);
      if (remoG) { g.strokeStyle = "#8a5a2a"; g.lineWidth = 6; g.lineCap = "round"; g.beginPath(); g.moveTo(mano[0] + 6, mano[1] - 2); g.lineTo(remoG[0], remoG[1]); g.stroke(); g.strokeStyle = "rgba(255,220,160,.4)"; g.lineWidth = 2; g.stroke(); }
    };
    if (cuernos) G.objD2 = (g, mano) => { g.save(); g.translate(mano[0], mano[1] - 2); cuerno(g, angG, nivG, t); g.restore(); };
    M.objI = (g) => cabezaM(g);
    M.objD = (g, mano) => {
      if (remoM) { g.strokeStyle = "#8a5a2a"; g.lineWidth = 6; g.lineCap = "round"; g.beginPath(); g.moveTo(mano[0] - 40 / ESC * 0 - 30, mano[1] + 4); g.lineTo(remoM[0], remoM[1]); g.stroke(); g.strokeStyle = "rgba(255,220,160,.4)"; g.lineWidth = 2; g.stroke(); }
    };
    if (cuernos) M.objI2 = (g, mano) => { g.save(); g.translate(mano[0], mano[1] - 2); g.scale(-1, 1); cuerno(g, -angM, nivM, t); g.restore(); };
    return { G, M, mG, mM, bx, w };
  }

  actualizar(dt) {
    const t = (this.t += dt), p = this.p, bx = this.barcoX();
    // salpicones de los remos al entrar en la cerveza
    if (this.remando()) {
      const w = t * 6.2, w0 = (t - dt) * 6.2;
      if (Math.sin(w) > 0.7 && Math.sin(w0) <= 0.7) {
        for (const x of [REMO_G[0] - 110 + bx, REMO_M[0] + 110 + bx]) {
          if (x < -40 || x > W + 40) continue;
          for (let i = 0; i < 8; i++) p.nueva(P.ESPUMA, x + azar(-20, 20), 570, azar(-90, 90), azar(-260, -120), azar(0.4, 0.7), azar(4, 8));
          for (let i = 0; i < 6; i++) p.nueva(P.GOTA, x + azar(-20, 20), 570, azar(-120, 120), azar(-380, -160), azar(0.4, 0.7), azar(3, 5));
        }
      }
    }
    this.una("ola", t > T_OLA, () => {
      temblar(10, 0.4);
      for (let i = 0; i < 60; i++) p.nueva(P.ESPUMA, azar(300, 720), azar(440, 500), azar(-260, 260), azar(-560, -260), azar(0.7, 1.3), azar(6, 14));
      for (let i = 0; i < 40; i++) p.nueva(P.GOTA, azar(300, 720), azar(440, 500), azar(-300, 300), azar(-620, -260), azar(0.6, 1.1), azar(3, 6));
    });
    this.una("llega", t > T_LLEGA, () => {
      temblar(16, 0.4);
      for (let i = 0; i < 14; i++) p.nueva(P.POLVO, 905 + azar(-30, 30), 520 + azar(-30, 30), azar(0, 200), azar(-120, 0), azar(0.6, 1.0), azar(30, 50));
      for (let i = 0; i < 20; i++) p.nueva(P.ESPUMA, 890 + azar(-30, 30), 560, azar(-200, 200), azar(-400, -150), azar(0.5, 0.9), azar(5, 10));
    });
    this.una("skal", t > T_SKAL, () => {
      temblar(18, 0.45);
      p.nueva(P.DESTELLO, PB[0], PB[1] - 10, 0, 0, 0.35, 240);
      for (let i = 0; i < 40; i++) { const a = azar(-Math.PI, 0), v = azar(160, 520); p.nueva(P.ESPUMA, PB[0], PB[1] - 10, Math.cos(a) * v, Math.sin(a) * v, azar(0.6, 1.2), azar(6, 12)); }
      for (let i = 0; i < 26; i++) { const a = azar(-Math.PI, 0), v = azar(200, 520); p.nueva(P.CHISPA, PB[0], PB[1] - 10, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(6, 11)); }
    });
    if (t > T_SKAL + 0.3 && t < 9.2 && Math.random() < 12 * dt) p.nueva(P.PURPURINA, azar(120, 900), azar(-10, 60), azar(-20, 20), azar(20, 60), azar(1.2, 2), azar(9, 15));
    p.actualizar(dt);
  }

  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, 420);
    gc.addColorStop(0, "#3a2a6a"); gc.addColorStop(0.45, "#c0507a"); gc.addColorStop(0.8, "#ff9a4a"); gc.addColorStop(1, "#ffd27a");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, H + 120);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8; g.drawImage(BLOB.amarillo, 30, 230, 260, 260); g.restore();
    g.fillStyle = "#fff0c0"; g.beginPath(); g.arc(160, 380, 52, Math.PI, 0); g.fill();
    const r = semilla(9);
    g.fillStyle = "rgba(255,255,255,.7)";
    for (let i = 0; i < 30; i++) g.fillRect(r() * W, r() * 150 - 50, 1.6, 1.6);
    // montañas del fiordo
    for (const [col, base, amp, f] of [["#5a3a6a", 395, 120, 0.004], ["#3a2a4a", 400, 80, 0.007]]) {
      g.fillStyle = col; g.beginPath(); g.moveTo(-60, base);
      for (let x = -60; x <= W + 60; x += 20) g.lineTo(x, base - Math.abs(Math.sin(x * f + base)) * amp - Math.sin(x * 0.03) * 8);
      g.lineTo(W + 60, base + 20); g.lineTo(-60, base + 20); g.closePath(); g.fill();
    }
    // la orilla a la derecha, con pinos
    g.fillStyle = "#3a5a3a";
    g.beginPath(); g.moveTo(830, 430); g.quadraticCurveTo(900, 330, 1000, 320); g.lineTo(W + 60, 310); g.lineTo(W + 60, H + 60); g.lineTo(860, H + 60); g.closePath(); g.fill();
    g.fillStyle = "#c8a46a"; g.beginPath(); g.moveTo(840, 470); g.quadraticCurveTo(900, 420, 980, 410); g.lineTo(W + 60, 405); g.lineTo(W + 60, H + 60); g.lineTo(850, H + 60); g.closePath(); g.fill();
    for (const [x, y, s] of [[930, 330, 1], [990, 310, 1.3], [1050, 300, 1.1]]) {
      g.fillStyle = "#4a3020"; g.fillRect(x - 4 * s, y, 8 * s, 30 * s);
      g.fillStyle = "#1e4a2e";
      for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x - (34 - k * 8) * s, y + (6 - k * 30) * s); g.lineTo(x, y - (40 + k * 30) * s); g.lineTo(x + (34 - k * 8) * s, y + (6 - k * 30) * s); g.closePath(); g.fill(); }
    }
    for (const [x, y, rr] of [[880, 470, 26], [915, 485, 18]]) { g.fillStyle = "#6a6a72"; g.beginPath(); g.ellipse(x, y, rr, rr * 0.7, 0, Math.PI, 0); g.fill(); }
    this.fondoC = c;
    return c;
  }
  olas(g, t, y0, amp, col, vel, fase, espuma) {
    g.fillStyle = col;
    g.beginPath(); g.moveTo(-60, H + 60);
    for (let x = -60; x <= W + 60; x += 24) g.lineTo(x, y0 + Math.sin(x * 0.028 + t * vel + fase) * amp + Math.sin(x * 0.011 - t * vel * 0.6) * amp * 0.6);
    g.lineTo(W + 60, H + 60); g.closePath(); g.fill();
    if (espuma) {
      g.fillStyle = "rgba(255,253,240,.92)";
      for (let x = -40; x <= W + 60; x += 44) {
        const y = y0 + Math.sin(x * 0.028 + t * vel + fase) * amp + Math.sin(x * 0.011 - t * vel * 0.6) * amp * 0.6;
        g.beginPath(); g.arc(x, y + 1, 7 + (x % 3), Math.PI, 0); g.arc(x + 12, y + 2, 6, Math.PI, 0); g.fill();
      }
    }
  }
  /** Mástil, vela y la parte de atrás del casco (detrás de los dos). */
  barcoAtras(g, t) {
    g.fillStyle = "#5a3416"; g.fillRect(506, -60, 14, BORDA + 60);
    g.fillStyle = "#6a4020"; rectR(g, 300, 30, 426, 12, 6); g.fill();
    const hincha = 16 + 6 * Math.sin(t * 2);
    g.save();
    g.beginPath();
    g.moveTo(312, 40); g.lineTo(714, 40); g.quadraticCurveTo(730 + hincha * 0.3, 160, 700, 290); g.quadraticCurveTo(513, 290 + hincha, 326, 290); g.quadraticCurveTo(296 - hincha * 0.3, 160, 312, 40); g.closePath();
    g.clip();
    for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? "#f4ead2" : "#c8322a"; g.fillRect(290 + i * 50, 30, 50, 300); }
    g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(290, 30, 460, 300);
    g.fillStyle = "rgba(255,255,255,.12)"; g.beginPath(); g.ellipse(470, 150, 120, 90, 0, 0, 6.283); g.fill();
    g.restore();
    g.strokeStyle = "rgba(60,36,16,.8)"; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(513, -10); g.lineTo(150, BORDA - 10); g.moveTo(513, -10); g.lineTo(870, BORDA - 10); g.stroke();
    // interior del barco
    g.fillStyle = "#3a200c"; g.beginPath(); g.moveTo(150, BORDA - 6); g.lineTo(876, BORDA - 6); g.lineTo(876, BORDA + 40); g.lineTo(150, BORDA + 40); g.closePath(); g.fill();
  }
  /** Casco del barco, popa y proa en espiral y escudos (delante de los dos). */
  barcoDelante(g, t) {
    const gb = this.grB || (this.grB = (() => { const q = g.createLinearGradient(0, BORDA, 0, 600); q.addColorStop(0, "#9a6232"); q.addColorStop(0.4, "#6a3c18"); q.addColorStop(1, "#3a1e08"); return q; })());
    g.fillStyle = gb;
    g.beginPath();
    g.moveTo(120, BORDA - 6);
    g.lineTo(904, BORDA - 6);
    g.quadraticCurveTo(930, 520, 840, 590); g.lineTo(190, 590); g.quadraticCurveTo(96, 520, 120, BORDA - 6);
    g.closePath(); g.fill();
    g.strokeStyle = "rgba(30,14,4,.55)"; g.lineWidth = 2.5;
    for (const y of [BORDA + 30, BORDA + 62, BORDA + 94, BORDA + 122]) { g.beginPath(); g.moveTo(112 + (y - BORDA) * 0.4, y); g.quadraticCurveTo(512, y + 10, 912 - (y - BORDA) * 0.6, y); g.stroke(); }
    g.fillStyle = "#c08a4a"; g.fillRect(118, BORDA - 10, 790, 9);
    // proa y popa en espiral
    for (const s of [-1, 1]) {
      const x0 = s > 0 ? 900 : 124;
      g.save(); g.translate(x0, BORDA);
      g.fillStyle = gb;
      g.beginPath(); g.moveTo(-s * 24, 0); g.quadraticCurveTo(s * 30, -40, s * 40, -130); g.lineTo(s * 64, -130); g.quadraticCurveTo(s * 50, -30, s * 20, 40); g.closePath(); g.fill();
      g.strokeStyle = "#c08a4a"; g.lineWidth = 8; g.lineCap = "round";
      g.beginPath(); g.moveTo(s * 52, -126);
      for (let i = 0; i <= 26; i++) { const a = i * 0.32, r = 28 - i; g.lineTo(s * (52 - 22 + Math.cos(a) * r * 0.9 + 22), -150 - Math.sin(a) * r * 0.9 + 4); }
      g.stroke();
      g.restore();
    }
    // escudos lisos
    const cols = [["#2a5aa8", "#ffd34d"], ["#c8322a", "#f4ead2"], ["#ffd34d", "#2a5aa8"], ["#2a8a4a", "#f4ead2"]];
    let i = 0;
    for (const x of [330, 410, 615, 695]) {
      const [c1, c2] = cols[i++ % 4];
      g.fillStyle = c1; g.beginPath(); g.arc(x, BORDA + 22, 28, 0, 6.283); g.fill();
      g.strokeStyle = "#5a5a62"; g.lineWidth = 4; g.stroke();
      g.fillStyle = c2; g.beginPath(); g.moveTo(x, BORDA + 22); g.arc(x, BORDA + 22, 26, -1.2, 0.3); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(x, BORDA + 22); g.arc(x, BORDA + 22, 26, 1.94, 3.44); g.closePath(); g.fill();
      g.fillStyle = "#c9ced4"; g.beginPath(); g.arc(x, BORDA + 22, 8, 0, 6.283); g.fill();
      g.fillStyle = "rgba(255,255,255,.6)"; g.beginPath(); g.arc(x - 2.5, BORDA + 19.5, 2.5, 0, 6.283); g.fill();
    }
    // agujeros de los remos
    g.fillStyle = "#1a0a02";
    for (const q of [REMO_G, REMO_M]) { g.beginPath(); g.arc(q[0], q[1], 7, 0, 6.283); g.fill(); }
  }
  remoFuera(g, mano, agujero, lado) {
    // de la mano al agujero, y del agujero a la pala dentro de la cerveza
    const dx = agujero[0] - mano[0], dy = agujero[1] - mano[1], L = Math.hypot(dx, dy);
    const fin = [agujero[0] + (dx / L) * 150, agujero[1] + (dy / L) * 150];
    g.strokeStyle = "#8a5a2a"; g.lineWidth = 8; g.lineCap = "round";
    g.beginPath(); g.moveTo(agujero[0], agujero[1]); g.lineTo(fin[0], fin[1]); g.stroke();
    g.save(); g.translate(fin[0], fin[1]); g.rotate(Math.atan2(dy, dx));
    g.fillStyle = "#a06a32"; g.beginPath(); g.ellipse(14, 0, 30, 11, 0, 0, 6.283); g.fill();
    g.strokeStyle = "#5a3416"; g.lineWidth = 2; g.stroke();
    g.restore();
    void lado;
  }
  dibujar(g) {
    const t = this.t, e = this.poses(), bx = e.bx;
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    this.olas(g, t, 420, 4, "#d88a10", 1.4, 0, false);
    this.olas(g, t, 448, 6, "#e89a18", 1.8, 2, true);
    // el barco se mece (todo lo de dentro va con él)
    const bal = this.bal(), sube = 5 * Math.sin(t * 1.7 + 1.2);
    g.save(); g.translate(512 + bx, 900 + sube); g.rotate(bal); g.translate(-512, -900);
    this.barcoAtras(g, t);
    g.translate(-bx, 0);
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    g.translate(bx, 0);
    this.barcoDelante(g, t);
    // remos: parte de fuera; en reposo tras llegar
    const mg = e.G._manoD ? aPant(e.mG, e.G._manoD) : null, mm = e.M._manoD ? aPant(e.mM, e.M._manoD) : null;
    if (this.remando() && mg && mm) {
      this.remoFuera(g, [mg[0] - bx, mg[1]], REMO_G, -1);
      this.remoFuera(g, [mm[0] - 30 * ESC - bx, mm[1] + 4 * ESC], REMO_M, 1);
    } else {
      this.remoFuera(g, [REMO_G[0] + 90, REMO_G[1] - 70], REMO_G, -1);
      this.remoFuera(g, [REMO_M[0] - 90, REMO_M[1] - 70], REMO_M, 1);
    }
    g.restore();
    // olas de delante
    this.olas(g, t, 552, 7, "rgba(240,160,30,.96)", 2.2, 1, true);
    this.olas(g, t, 576, 6, "#c87808", 2.6, 4, false);
    // la gran ola que salpica
    if (t > T_OLA - 0.35 && t < T_OLA + 0.3) {
      const k = Math.sin(Math.PI * tramo(t, T_OLA - 0.35, T_OLA + 0.3));
      g.fillStyle = "#f0a020";
      g.beginPath(); g.moveTo(230, H + 40); g.quadraticCurveTo(512, 560 - 210 * k, 800, H + 40); g.closePath(); g.fill();
      g.fillStyle = "rgba(255,253,240,.95)";
      for (let i = 0; i < 11; i++) { const u = i / 10, x = lerp(330, 700, u), y = 580 - 105 * k * (1 - Math.pow((u - 0.5) * 2, 2)) * 1.0 - 4; g.beginPath(); g.arc(x, y, 10 + (i % 3) * 4, 0, 6.283); g.fill(); }
    }
    this.p.dibujar(g);
    // ¡CLONC!
    if (t > T_LLEGA && t < T_LLEGA + 0.75) {
      const k = tramo(t, T_LLEGA, T_LLEGA + 0.15), a = 1 - tramo(t, T_LLEGA + 0.5, T_LLEGA + 0.75);
      txt(g, "¡CLONC!", 860, 300, { tam: 70 * eBack(k), peso: 400, fam: FC, color: "#fff3c0", borde: "#3a1a00", bordeAncho: 9, alfa: a, esp: 2 });
    }
    // ¡SKÅL!
    if (t > T_SKAL) {
      const d = t - T_SKAL, k = tramo(d, 0, 0.2), s = lerp(2.4, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 6));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 104 + 5 * Math.sin(d * 2)); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.5), tramo(t, 9.25, this.dur - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00189", nombre: "Vikingos", crear: () => new Vikingos() });
})();
