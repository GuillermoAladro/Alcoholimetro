"use strict";
/*
 * 00117 · EL BRINDIS IMPOSIBLE
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende la luz del bar y entran Guillermo y Rodrigo con sus jarras. Intentan brindar a cámara lenta: la primera
 * vez las jarras pasan de largo (¡FIUUU!); la segunda se acercan tanto que chocan las frentes (¡TOC!) y se quedan
 * mareados. A la tercera chocan las jarras con un estallido de chispas y espuma: ¡CHIN CHIN! Beben y se apaga la luz.
 */
(() => {
const ESC = 1.5, XG = 400, XR = 624;
const T_LENTO1 = 2.05, T_PASA = 2.72, T_TOC = 4.5, T_LENTO2 = 6.0, T_CHIN = 6.95;
const CHIN = [512, 300];
const cache = cacheTexto();

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const u = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return lerp(k[i - 1][1], k[i][1], (k[i][2] || eInOut)(u)); }
  return k[k.length - 1][1];
}
function pista2(t, k) { return [pista(t, k.map((q) => [q[0], q[1][0], q[2]])), pista(t, k.map((q) => [q[0], q[1][1], q[2]]))]; }
/** Punto de la pantalla → unidades del avatar con los pies en (x, PIES), sin girar. */
const aU = (x, q) => [(q[0] - x) / ESC + 39, (q[1] - PIES) / ESC + 232];
/** Jarra en la mano izquierda de la pantalla, con el cuerpo hacia la izquierda (hacia Guillermo). */
function jarraIzq(pose, inc, nivel) {
  pose.objI = (g, m, a, t) => { g.save(); g.translate(m[0], m[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], inc, nivel, "asa", t); g.restore(); };
  pose.objI2 = (g, m, a, t) => { g.save(); g.translate(m[0], m[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], inc, nivel, "cuerpo", t); g.restore(); };
}

// manos (pantalla) de Guillermo y de Rodrigo
const MANO_G = [
  [1.5, [408, 407]], [1.9, [452, 338]],
  [T_LENTO1, [452, 338]], [3.25, [534, 276], (u) => u],
  [3.55, [534, 276]], [3.95, [408, 407]],
  [5.55, [408, 407]], [5.95, [436, 330]],
  [T_CHIN, [466, 302], (u) => 1 - Math.pow(1 - u, 1.6)], [7.12, [458, 296], eOut], [7.35, [462, 280]],
];
const MANO_R = [
  [1.5, [616, 407]], [1.9, [572, 338]],
  [T_LENTO1, [572, 338]], [3.25, [492, 394], (u) => u],
  [3.55, [492, 394]], [3.95, [616, 407]],
  [5.55, [616, 407]], [5.95, [588, 330]],
  [T_CHIN, [558, 302], (u) => 1 - Math.pow(1 - u, 1.6)], [7.12, [566, 296], eOut], [7.35, [562, 280]],
];
// inclinación del cuerpo hacia el otro (chocan las frentes)
const GIRO = [[3.9, 0], [T_TOC, 0.285, (u) => u * u], [4.7, -0.05, eOut], [4.95, 0.03], [5.25, 0]];

function fondoBar() {
  const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
  g.translate(60, 60);
  const gr = g.createLinearGradient(0, 0, 0, PIES);
  gr.addColorStop(0, "#0b0705"); gr.addColorStop(1, "#1c120b");
  g.fillStyle = gr; g.fillRect(-60, -60, W + 120, PIES + 60);
  // estanterías del fondo con botellas
  const sr = semilla(117);
  for (const [x0, x1] of [[-60, 250], [774, W + 60]]) {
    for (const y of [210, 330]) {
      g.fillStyle = "#3a2414"; g.fillRect(x0, y, x1 - x0, 9);
      g.fillStyle = "rgba(255,210,150,.18)"; g.fillRect(x0, y, x1 - x0, 2);
      for (let x = x0 + 24; x < x1 - 14; x += 26 + sr() * 14) {
        const h = 52 + sr() * 26, col = ["#1f4d26", "#5a2a12", "#2a3550", "#6b5212", "#3d1f3a"][(sr() * 5) | 0];
        g.fillStyle = col; rectR(g, x - 9, y - h, 18, h, 5); g.fill();
        g.fillRect(x - 4, y - h - 18, 8, 20);
        g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(x - 5, y - h + 6, 3, h - 14);
        g.fillStyle = "rgba(240,225,190,.35)"; g.fillRect(x - 9, y - h * 0.55, 18, h * 0.25);
      }
    }
  }
  // zócalo de madera y suelo
  const gz = g.createLinearGradient(0, 400, 0, PIES);
  gz.addColorStop(0, "#2a190e"); gz.addColorStop(1, "#160d07");
  g.fillStyle = gz; g.fillRect(-60, 400, W + 120, PIES - 400);
  g.fillStyle = "rgba(255,215,160,.12)"; g.fillRect(-60, 400, W + 120, 3);
  g.fillStyle = "rgba(0,0,0,.35)";
  for (let x = 20; x < W; x += 90) g.fillRect(x, 406, 3, PIES - 406);
  const gs = g.createLinearGradient(0, PIES, 0, H + 60);
  gs.addColorStop(0, "#3a2516"); gs.addColorStop(1, "#120b06");
  g.fillStyle = gs; g.fillRect(-60, PIES, W + 120, H + 60 - PIES);
  // oscurece los bordes
  const v = g.createRadialGradient(W / 2, 330, 200, W / 2, 330, 700);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.75)");
  g.fillStyle = v; g.fillRect(-60, -60, W + 120, H + 120);
  return c;
}
function titulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(860, 210), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 160);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.55, "#fff4d6"); gr.addColorStop(1, "#ffd27a");
  txt(g, "¡CHIN CHIN!", 430, 150, { tam: 124, peso: 400, fam: FB, color: "#7a3d00", esp: 4 });
  txt(g, "¡CHIN CHIN!", 430, 142, { tam: 124, peso: 400, fam: FB, color: gr, borde: "#b35a00", bordeAncho: 12, esp: 4, glow: "rgba(255,190,60,.9)", glowTam: 28 });
  cache.set("t", c);
  return c;
}

class Brindis extends Escena {
  constructor() {
    super(10.0);
    this.p = new Parts(420);
    this.fondo = null;
  }
  luz(t) {
    const on = t < 0.7 ? [0, 1, 0, 0, 1, 0.35, 1][Math.min(6, Math.floor(t / 0.1))] : 1;
    return on * (1 - tramo(t, 8.95, 9.9));
  }
  /** Las dos poses en el instante t (sin azar: también se usa para las estelas de cámara lenta). */
  estado(t) {
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoI: [9, 160] };
    const R = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [68, 157], brazoIDelante: true };
    // entran andando por los lados
    const kE = eOut(tramo(t, 0.1, 1.45));
    const xg = lerp(-110, XG, kE), xr = lerp(W + 110, XR, kE);
    let bote = 0;
    if (t < 1.45) {
      const a = andar(t * 10, 1 - tramo(t, 1.15, 1.45));
      G.piernaI = a.piernaI; G.piernaD = a.piernaD; R.piernaI = a.piernaD; R.piernaD = a.piernaI; bote = a.bote;
    }
    // manos con las jarras
    let mg = pista2(t, MANO_G), mr = pista2(t, MANO_R);
    let incG = 0.08 * Math.sin(t * 3), incR = 0.08 * Math.sin(t * 3 + 1), nivel = 1;
    if (t > 1.5) { incG = 0.18 * tramo(t, 1.5, 1.9); incR = incG; }
    if (t > 3.55 && t < 5.6) { incG = 0.18 * (1 - tramo(t, 3.55, 3.9)); incR = incG; }
    if (t > T_CHIN) { nivel = 0.86; }
    // chocan las frentes
    const giro = pista(t, GIRO) + (t > T_TOC + 0.1 && t < 5.5 ? 0.025 * Math.sin(t * 11) * (1 - tramo(t, 5.0, 5.5)) : 0);
    let pG = mg, pR = mr;
    let manoG = aU(xg, pG), manoR = aU(xr, pR);
    // beben (7,35 – 8,6)
    const kB = eInOut(tramo(t, 7.35, 7.65)) * (1 - eInOut(tramo(t, 8.45, 8.75)));
    const kT = eInOut(tramo(t, 7.6, 8.25)) * (1 - eInOut(tramo(t, 8.45, 8.75)));
    if (kB > 0) {
      G.rc = -0.34 * kT; R.rc = 0.34 * kT;
      incG = lerp(0.18, -0.5, kB) - 0.75 * kT; incR = incG;
      const b = boca(G.rc), tope = rot2([17, -18], incG);
      manoG = mezcla(manoG, [b[0] - tope[0] - 2, b[1] - tope[1] + 4], kB);
      const br = boca(R.rc, "rodrigo"), tr = rot2([17, -18], incR);
      manoR = mezcla(manoR, [br[0] + tr[0] + 2, br[1] - tr[1] + 4], kB);
      nivel = 0.86 - 0.7 * tramo(t, 7.75, 8.3);
    }
    if (t > 8.3) nivel = 0.16;
    if (t > 8.6) { const k = eInOut(tramo(t, 8.6, 9.0)); manoG = mezcla(manoG, [80, 66], k); manoR = mezcla(manoR, [-2, 66], k); incG = incR = 0.1; }
    G.manoD = manoG; R.manoI = manoR;
    G.jarra = { inc: incG, nivel };
    jarraIzq(R, incR, nivel);
    // caras y miradas
    if (t > 1.45 && t < T_LENTO1) { G.cara = "guino"; R.cara = "guino"; G.rc = 0.12 * tramo(t, 1.45, 1.7); R.rc = -0.12 * tramo(t, 1.45, 1.7); }
    else if (t >= T_LENTO1 && t < 2.85) { G.cara = "sonrisa"; R.cara = "sonrisa"; G.rc = 0.12; R.rc = -0.12; }
    else if (t >= 2.85 && t < 3.6) { G.cara = "sorpresa"; R.cara = "sorpresa"; G.rc = lerp(0.12, 0.2, tramo(t, 2.85, 3.0)); R.rc = lerp(-0.12, 0.16, tramo(t, 2.85, 3.05)); }
    else if (t >= 3.6 && t < 3.95) { G.cara = "guino"; R.cara = "sonrisa"; G.rc = 0.08; R.rc = -0.08; }
    else if (t >= 3.95 && t < T_TOC) { G.cara = "dormido"; R.cara = "dormido"; G.rc = 0.06; R.rc = -0.06; }
    else if (t >= T_TOC && t < 5.5) { G.cara = "borracho"; R.cara = "borracho"; G.rc = 0.07 * Math.sin(t * 7); R.rc = -0.07 * Math.sin(t * 7 + 1); }
    else if (t >= 5.5 && t < 5.95) { G.cara = "risa"; R.cara = "risa"; }
    else if (t >= 5.95 && t < T_CHIN) { G.cara = "guino"; R.cara = "guino"; G.rc = 0.1; R.rc = -0.1; }
    else if (t >= T_CHIN && t < 7.6) { G.cara = "risa"; R.cara = "risa"; }
    else if (t >= 7.6 && t < 8.5) { G.cara = "dormido"; R.cara = "dormido"; }
    else if (t >= 8.5) { G.cara = "risa"; R.cara = "risa"; G.rc = 0.06 * Math.sin(t * 6); R.rc = -0.06 * Math.sin(t * 6); }
    // de puntillas al estirar el brazo al final
    const mG = matAv(xg, PIES + bote, ESC, giro);
    const mR = matAv(xr, PIES + bote, ESC, -giro);
    return { G, R, mG, mR, incG, incR, nivel };
  }
  lento(t) { return Math.max(tramo(t, T_LENTO1, T_LENTO1 + 0.25) * (1 - tramo(t, 3.2, 3.45)), tramo(t, T_LENTO2 - 0.1, T_LENTO2 + 0.15) * (1 - tramo(t, T_CHIN, T_CHIN + 0.08))); }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("toc", t > T_TOC, () => {
      temblar(16, 0.35);
      for (let i = 0; i < 16; i++) { const a = azar(-Math.PI, 0), v = azar(150, 380); p.nueva(P.CHISPA, 512, 286, Math.cos(a) * v, Math.sin(a) * v, azar(0.25, 0.5), azar(6, 11)); }
      p.nueva(P.DESTELLO, 512, 286, 0, 0, 0.25, 110);
    });
    this.una("chin", t > T_CHIN, () => {
      temblar(24, 0.6);
      const [x, y] = CHIN;
      p.nueva(P.DESTELLO, x, y, 0, 0, 0.45, 300);
      for (let i = 0; i < 46; i++) { const a = azar(0, 6.283), v = azar(260, 820); p.nueva(P.CHISPA, x, y, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.9), azar(9, 17)); }
      for (let i = 0; i < 34; i++) { const a = azar(-Math.PI, 0), v = azar(160, 520); p.nueva(P.ESPUMA, x + azar(-14, 14), y - 20, Math.cos(a) * v, Math.sin(a) * v, azar(0.6, 1.1), azar(5, 11)); }
      for (let i = 0; i < 26; i++) p.nueva(P.GOTA, x + azar(-20, 20), y - 10, azar(-320, 320), azar(-520, -160), azar(0.6, 1.0), azar(3, 6));
    });
    if (t > T_CHIN + 0.05 && t < T_CHIN + 1.4 && Math.random() < 30 * dt) p.nueva(P.PURPURINA, azar(250, 780), azar(-10, 80), azar(-20, 20), azar(30, 80), azar(1, 1.6), azar(6, 11));
    // gotas que caen al beber
    if (t > 7.75 && t < 8.3 && Math.random() < 14 * dt) {
      const e = this.estado(t);
      const q1 = aPant(e.mG, boca(e.G.rc)), q2 = aPant(e.mR, boca(e.R.rc, "rodrigo"));
      p.nueva(P.GOTA, q1[0] + 4, q1[1] + 6, azar(-30, 40), azar(-40, 20), 0.7, azar(2.5, 4));
      p.nueva(P.GOTA, q2[0] - 4, q2[1] + 6, azar(-40, 30), azar(-40, 20), 0.7, azar(2.5, 4));
    }
    p.alfa = 1 - tramo(t, 9.0, 9.8);
    p.actualizar(dt);
  }
  estelas(g, t) {
    const L = this.lento(t);
    if (L <= 0.01) return;
    for (let k = 4; k >= 1; k--) {
      const tk = t - k * 0.07;
      if (tk < T_LENTO1) continue;
      const e = this.estado(tk);
      g.save(); g.globalAlpha = L * 0.16 * (1 - k / 5);
      conMat(g, e.mG, () => dibujarJarra(g, e.G.manoD, e.incG, e.nivel, "cuerpo", tk));
      conMat(g, e.mR, () => { g.translate(e.R.manoI[0], e.R.manoI[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], e.incR, e.nivel, "cuerpo", tk); });
      g.restore();
    }
  }
  dibujar(g) {
    const t = this.t, e = this.estado(t), luz = this.luz(t), L = this.lento(t);
    fondo(g, "#000");
    if (!this.fondo) this.fondo = fondoBar();
    g.save(); g.globalAlpha = luz; g.drawImage(this.fondo, -60, -60);
    // luz cálida del bar
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.33 * luz;
    g.drawImage(BLOB2.oroClaro, 90, 40, 844, 600);
    g.restore();
    this.estelas(g, t);
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mR, e.R, t);
    // estrellitas de mareo
    if (t > T_TOC + 0.05 && t < 5.5) {
      const a = 1 - tramo(t, 5.2, 5.5);
      for (const [m, cx] of [[e.mG, 39], [e.mR, 38]]) {
        const c = aPant(m, [cx, -2]);
        for (let i = 0; i < 3; i++) {
          const ang = t * 7 + (i * 6.283) / 3, x = c[0] + Math.cos(ang) * 46, y = c[1] + Math.sin(ang) * 12;
          g.save(); g.globalAlpha = a; g.fillStyle = "#ffe066"; g.strokeStyle = "#7a5200"; g.lineWidth = 2;
          estrella(g, x, y, 11, 5, ang); g.fill(); g.stroke(); g.restore();
        }
      }
    }
    this.p.dibujar(g);
    // anillo del choque
    const dc = t - T_CHIN;
    if (dc > 0 && dc < 0.45) {
      g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = `rgba(255,236,170,${0.9 * (1 - dc / 0.45)})`; g.lineWidth = 10 * (1 - dc / 0.45) + 2;
      g.beginPath(); g.arc(CHIN[0], CHIN[1], 30 + dc * 700, 0, 6.283); g.stroke(); g.restore();
    }
    // cámara lenta: viñeta y bandas
    if (L > 0) {
      g.save(); g.globalAlpha = 0.5 * L; g.fillStyle = "#000";
      g.fillRect(-60, -60, W + 120, 92); g.fillRect(-60, H - 32, W + 120, 92); g.restore();
      txt(g, "CÁMARA LENTA", 24, 22, { tam: 20, peso: 800, fam: FT, color: "#ff5a5a", alin: "left", alfa: L * (Math.sin(t * 8) > -0.2 ? 1 : 0.35), esp: 2 });
      g.save(); g.globalAlpha = L; g.fillStyle = "#ff3b3b"; g.beginPath(); g.arc(14, 15, 5, 0, 6.283); g.fill(); g.restore();
    }
    // ¡FIUUU!
    if (t > T_PASA - 0.05 && t < 3.5) {
      const k = tramo(t, T_PASA - 0.05, T_PASA + 0.1);
      g.save(); g.translate(512, 205); g.rotate(-0.06); g.scale(eBack(k), eBack(k));
      txt(g, "¡FIUUU!", 0, 0, { tam: 50, peso: 400, fam: FC, color: "#fffdf5", borde: "#1d4f8a", bordeAncho: 8, alfa: 1 - tramo(t, 3.25, 3.5), esp: 2 });
      g.restore();
    }
    // ¡TOC!
    if (t > T_TOC && t < 5.3) {
      const k = tramo(t, T_TOC, T_TOC + 0.12);
      g.save(); g.translate(512, 190); g.rotate(0.08); g.scale(eBack(k) * 1.1, eBack(k) * 1.1);
      txt(g, "¡TOC!", 0, 0, { tam: 74, peso: 400, fam: FC, color: "#ffe066", borde: "#7a1d00", bordeAncho: 10, alfa: 1 - tramo(t, 5.05, 5.3), esp: 3 });
      g.restore();
    }
    // ¡CHIN CHIN!
    if (t > T_CHIN + 0.04) {
      const d = t - T_CHIN - 0.04, k = tramo(d, 0, 0.2), s = lerp(2.4, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 7));
      const spr = titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - tramo(t, 9.2, 9.8)); g.translate(512, 112); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = 1 - luz;
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${Math.min(1, a)})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00117", nombre: "El brindis imposible", crear: () => new Brindis() });
})();
