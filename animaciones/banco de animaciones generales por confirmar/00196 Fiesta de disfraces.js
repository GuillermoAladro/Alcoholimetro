"use strict";
/*
 * 00196 · FIESTA DE DISFRACES
 *
 * Animación del banco. Empieza y acaba en negro.
 * Dos probadores con cortinas rojas en una tienda de disfraces. Se abren las cortinas y salen Guillermo y Marcos
 * disfrazados, siempre sin coincidir: cocinero y explorador (que le mira con los prismáticos), astronauta y rockero,
 * payaso y rey. Se cierran, vuela ropa por encima… y la última vez salen los dos vestidos igual: ¡de jarra de
 * cerveza! Se miran, hacen de espejo, se ríen y chocan las barrigas: ¡QUÉ PINTAS! Fundido a negro.
 */
(() => {
const cache = cacheTexto();
const ESC = 1.4;
const BG = 330, BM = 694, BW = 214, BTOP = 112;
// rondas: [abre, cierra, disfraz de Guillermo, disfraz de Marcos]
const RONDAS = [[0.75, 2.2, "cocinero", "explorador"], [2.95, 4.4, "astronauta", "rockero"], [5.15, 6.6, "payaso", "rey"], [7.35, 99, "jarra", "jarra"]];
const T_FIN = 7.35, T_ESPEJO = 7.85, T_RIEN = 8.35, T_CHOCAN = 8.95;

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(880, 200), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 160);
  gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.45, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
  txt(g, "¡QUÉ PINTAS!", 446, 154, { tam: 128, peso: 400, fam: FB, color: "#3a1800", esp: 3 });
  txt(g, "¡QUÉ PINTAS!", 440, 146, { tam: 128, peso: 400, fam: FB, color: gr, borde: "#3a1800", bordeAncho: 11, esp: 3, glow: "rgba(255,230,140,.9)", glowTam: 26 });
  cache.set("t", c);
  return c;
}
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
function conCabeza(g, m, R, rc, f) { conMat(g, m, () => { g.translate(R.cuello[0], R.cuello[1]); g.rotate(rc); g.translate(-R.cuello[0], -R.cuello[1]); f(); }); }

// ------------------------------------------------------------------ piezas de los disfraces (coordenadas de avatar)
function gorroCocinero(g, cx, top) {
  g.fillStyle = "#ffffff"; g.strokeStyle = "#b8bcc8"; g.lineWidth = 1.2;
  rectR(g, cx - 24, top - 30, 48, 32, 3); g.fill(); g.stroke();
  g.beginPath(); for (const [dx, dy, r] of [[-20, -38, 15], [0, -46, 18], [20, -38, 15]]) { g.moveTo(cx + dx + r, top + dy); g.arc(cx + dx, top + dy, r, 0, 6.283); } g.fill(); g.stroke();
  g.fillStyle = "#ffffff"; g.fillRect(cx - 23, top - 36, 46, 12);
  g.strokeStyle = "rgba(160,165,180,.6)"; for (const dx of [-10, 0, 10]) { g.beginPath(); g.moveTo(cx + dx, top - 2); g.lineTo(cx + dx, top - 24); g.stroke(); }
}
function panueloCuello(g, R) {
  const cx = R.cuello[0], cy = R.cuello[1];
  g.fillStyle = "#e8242a"; g.beginPath(); g.ellipse(cx, cy + 4, 18, 6, 0, 0, 6.283); g.fill();
  g.beginPath(); g.moveTo(cx - 4, cy + 6); g.lineTo(cx + 8, cy + 6); g.lineTo(cx + 4, cy + 26); g.closePath(); g.fill();
  g.fillStyle = "#ffffff"; for (const [x, y] of [[cx - 8, cy + 3], [cx + 6, cy + 4], [cx + 3, cy + 14]]) { g.beginPath(); g.arc(x, y, 1.6, 0, 6.283); g.fill(); }
}
function sombreroExplorador(g, cx, y0) {
  const gr = g.createLinearGradient(0, y0 - 36, 0, y0 + 6);
  gr.addColorStop(0, "#f2dca4"); gr.addColorStop(1, "#b89650");
  g.fillStyle = gr; g.strokeStyle = "#7a5a24"; g.lineWidth = 1.2;
  g.beginPath(); g.ellipse(cx, y0, 46, 9, 0, 0, 6.283); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(cx - 28, y0 - 2); g.bezierCurveTo(cx - 30, y0 - 40, cx + 30, y0 - 40, cx + 28, y0 - 2); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = "#6a3e1a"; g.fillRect(cx - 27, y0 - 10, 54, 6);
}
function prismaticos(g, x, y) {
  g.fillStyle = "#1e1e24";
  rectR(g, x - 13, y - 8, 11, 18, 3); g.fill(); rectR(g, x + 2, y - 8, 11, 18, 3); g.fill();
  g.fillStyle = "#5a6a8a"; g.beginPath(); g.arc(x - 7.5, y + 9, 4, 0, 6.283); g.arc(x + 7.5, y + 9, 4, 0, 6.283); g.fill();
  g.fillStyle = "#3a3a42"; g.fillRect(x - 2, y - 4, 4, 8);
}
/** Prismáticos vistos de frente, delante de los ojos. */
function prismaticosFrente(g, R) {
  const [a, b] = R.ojos;
  g.fillStyle = "#1e1e24"; rectR(g, a[0] - 11, a[1] - 9, b[0] - a[0] + 22, 18, 6); g.fill();
  for (const [x, y] of [a, b]) {
    g.fillStyle = "#2a2a32"; g.beginPath(); g.arc(x, y, 10, 0, 6.283); g.fill();
    const gr = g.createRadialGradient(x - 3, y - 3, 1, x, y, 8);
    gr.addColorStop(0, "#cfe8ff"); gr.addColorStop(1, "#2a4a7a");
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, 7.5, 0, 6.283); g.fill();
    g.fillStyle = "rgba(255,255,255,.8)"; g.beginPath(); g.arc(x - 2.5, y - 2.5, 2, 0, 6.283); g.fill();
  }
}
let CASCO = null;
function cascoBurbuja(g, cx, cy, r) {
  if (!CASCO) {
    const S = 3, L = 120, c = lienzoNuevo(L * S, L * S), x = c.getContext("2d");
    x.scale(S, S); x.translate(L / 2, L / 2);
    const rr = 50;
    const gr = x.createRadialGradient(-rr * 0.35, -rr * 0.4, rr * 0.1, 0, 0, rr);
    gr.addColorStop(0, "rgba(220,245,255,.16)"); gr.addColorStop(0.75, "rgba(150,210,255,.10)"); gr.addColorStop(1, "rgba(150,210,255,.4)");
    x.fillStyle = gr; x.beginPath(); x.arc(0, 0, rr, 0, 6.283); x.fill();
    x.strokeStyle = "rgba(235,250,255,.9)"; x.lineWidth = 2.6; x.stroke();
    x.strokeStyle = "rgba(255,255,255,.85)"; x.lineWidth = 4.5; x.lineCap = "round"; x.beginPath(); x.arc(0, 0, rr - 7, 3.55, 4.35); x.stroke();
    CASCO = { c, L, rr };
  }
  const s = r / CASCO.rr;
  g.drawImage(CASCO.c, cx - (CASCO.L / 2) * s, cy - (CASCO.L / 2) * s, CASCO.L * s, CASCO.L * s);
}
function collarin(g, R) {
  const cx = R.cuello[0], cy = R.cuello[1] + 3;
  g.fillStyle = "#d8dee6"; g.beginPath(); g.ellipse(cx, cy, 30, 8, 0, 0, 6.283); g.fill();
  g.strokeStyle = "#7a848e"; g.lineWidth = 1.2; g.stroke();
}
function guitarra(g, x, y, ang, t) {
  g.save(); g.translate(x, y); g.rotate(ang);
  // mástil
  g.fillStyle = "#6a3a14"; g.fillRect(0, -3.5, 70, 7);
  g.fillStyle = "#2a1a0a"; rectR(g, 68, -6, 16, 12, 3); g.fill();
  g.fillStyle = "#c9ced4"; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(72 + i * 4.5, -7.5, 1.5, 0, 6.283); g.arc(72 + i * 4.5, 7.5, 1.5, 0, 6.283); g.fill(); }
  // cuerpo
  g.fillStyle = "#e8242a"; g.strokeStyle = "#7a0a10"; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(4, 0); g.bezierCurveTo(4, -22, -18, -24, -24, -14); g.bezierCurveTo(-34, -22, -50, -14, -46, 0); g.bezierCurveTo(-50, 14, -34, 22, -24, 14); g.bezierCurveTo(-18, 24, 4, 22, 4, 0); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = "#fffdf5"; g.beginPath(); g.ellipse(-16, 6, 12, 7, 0.3, 0, 6.283); g.fill();
  g.fillStyle = "#1a1a1e"; g.fillRect(-30, -6, 4, 12); g.fillRect(-20, -6, 4, 12);
  g.strokeStyle = "rgba(240,240,240,.8)"; g.lineWidth = 0.6;
  for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(-36, i * 2 + 0.3 * Math.sin(t * 60 + i)); g.lineTo(76, i * 2); g.stroke(); }
  g.restore();
}
function nariz(g, R) { const b = R.bocaPos, o = R.ojos; const y = (o[0][1] + b[1]) / 2 + 1; g.fillStyle = "#ff1a2a"; g.beginPath(); g.arc(b[0], y, 6.5, 0, 6.283); g.fill(); g.fillStyle = "rgba(255,255,255,.7)"; g.beginPath(); g.arc(b[0] - 2, y - 2, 2, 0, 6.283); g.fill(); }
function pelucaPayaso(g, R) {
  const cx = R.frente[0], cy = R.frente[1] + 4;
  const cols = ["#ff3d84", "#ffd34d", "#2fe3e8", "#2bff5b", "#9a5aff"];
  let i = 0;
  for (const s of [-1, 1]) for (const [dx, dy] of [[30, -16], [36, -2], [38, 12], [32, 24], [24, -26]]) { g.fillStyle = cols[i++ % 5]; g.beginPath(); g.arc(cx + s * dx, cy + dy, 9, 0, 6.283); g.fill(); }
}
function pajarita(g, R) {
  const cx = R.cuello[0], cy = R.cuello[1] + 6;
  g.fillStyle = "#2a8aff"; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx - 16, cy - 8); g.lineTo(cx - 16, cy + 8); g.closePath(); g.moveTo(cx, cy); g.lineTo(cx + 16, cy - 8); g.lineTo(cx + 16, cy + 8); g.closePath(); g.fill();
  g.fillStyle = "#ffd34d"; g.beginPath(); g.arc(cx, cy, 4, 0, 6.283); g.fill();
  g.fillStyle = "#ffffff"; for (const [x, y] of [[cx - 10, cy - 2], [cx + 10, cy + 2]]) { g.beginPath(); g.arc(x, y, 1.8, 0, 6.283); g.fill(); }
}
function coronaRey(g2, cx, y0) {
  const gr = g2.createLinearGradient(cx - 26, 0, cx + 26, 0);
  gr.addColorStop(0, "#b07a00"); gr.addColorStop(0.5, "#fff2a0"); gr.addColorStop(1, "#b07a00");
  g2.fillStyle = gr; g2.strokeStyle = "#7a5000"; g2.lineWidth = 1.2;
  g2.beginPath(); g2.moveTo(cx - 26, y0); g2.lineTo(cx - 28, y0 - 26); g2.lineTo(cx - 14, y0 - 12); g2.lineTo(cx, y0 - 32); g2.lineTo(cx + 14, y0 - 12); g2.lineTo(cx + 28, y0 - 26); g2.lineTo(cx + 26, y0); g2.closePath(); g2.fill(); g2.stroke();
  for (const [x, y, c] of [[cx - 14, y0 - 6, "#e8242a"], [cx, y0 - 7, "#2a8aff"], [cx + 14, y0 - 6, "#2bff5b"]]) { g2.fillStyle = c; g2.beginPath(); g2.arc(x, y, 3.2, 0, 6.283); g2.fill(); }
  for (const x of [cx - 28, cx, cx + 28]) { g2.fillStyle = "#fff2a0"; g2.beginPath(); g2.arc(x, x === cx ? y0 - 33 : y0 - 27, 3, 0, 6.283); g2.fill(); }
}
function capa(g, R) {
  const x0 = R.hombroI2[0] - 14, x1 = R.hombroD[0] + 14, y0 = R.hombroD[1] - 6;
  g.fillStyle = "#b0142a";
  g.beginPath(); g.moveTo(x0 + 6, y0); g.lineTo(x1 - 6, y0); g.quadraticCurveTo(x1 + 16, 150, x1 + 10, 214); g.lineTo(x0 - 10, 214); g.quadraticCurveTo(x0 - 16, 150, x0 + 6, y0); g.closePath(); g.fill();
  g.fillStyle = "rgba(0,0,0,.2)"; for (const x of [x0 + 10, x1 - 14]) g.fillRect(x, y0 + 30, 4, 170);
}
function armino(g, R) {
  const cx = R.cuello[0], cy = R.cuello[1] + 6;
  g.fillStyle = "#fffdf5"; g.beginPath(); g.ellipse(cx, cy, 30, 10, 0, 0, 6.283); g.fill();
  g.fillStyle = "#1a1a1e"; for (const dx of [-18, -6, 6, 18]) { g.beginPath(); g.ellipse(cx + dx, cy + 1, 1.6, 3, 0, 0, 6.283); g.fill(); }
}
/** Disfraz de jarra (se pinta encima del avatar). lado: hacia dónde va el asa. */
function disfrazJarra(g, R, lado, t) {
  const x0 = R.hombroI2[0] - 10, x1 = R.hombroD[0] + 10, y0 = R.cuello[1] + 8, y1 = 196;
  const w = x1 - x0;
  // asa
  g.strokeStyle = "rgba(225,240,255,.95)"; g.lineWidth = 9; g.lineCap = "round";
  const ax = lado > 0 ? x1 : x0;
  g.beginPath(); g.moveTo(ax, y0 + 22); g.bezierCurveTo(ax + lado * 30, y0 + 20, ax + lado * 30, y1 - 30, ax, y1 - 34); g.stroke();
  // vaso con cerveza
  rectR(g, x0, y0, w, y1 - y0, 10);
  const gr = g.createLinearGradient(0, y1, 0, y0);
  gr.addColorStop(0, "#c46a00"); gr.addColorStop(1, "#ffc21f");
  g.fillStyle = gr; g.fill();
  g.fillStyle = "rgba(255,245,200,.75)";
  for (let i = 0; i < 9; i++) { const by = y1 - 6 - ((t * 40 + i * 13) % (y1 - y0 - 20)); g.beginPath(); g.arc(x0 + 8 + ((i * 17) % (w - 16)), by, 2, 0, 6.283); g.fill(); }
  g.strokeStyle = "rgba(235,245,255,.95)"; g.lineWidth = 3; rectR(g, x0, y0, w, y1 - y0, 10); g.stroke();
  g.fillStyle = "rgba(255,255,255,.45)"; rectR(g, x0 + 6, y0 + 14, 6, y1 - y0 - 26, 3); g.fill();
  // espuma (cuello)
  g.fillStyle = "#fffaf0";
  g.beginPath(); g.moveTo(x0 - 4, y0 + 12);
  for (let i = 0; i <= 6; i++) g.arc(x0 + (i * w) / 6, y0 + 2 - (i % 2) * 3, 8 + (i % 3) * 1.5, Math.PI, 0);
  g.lineTo(x1 + 4, y0 + 12); g.closePath(); g.fill();
}

class FiestaDisfraces extends Escena {
  constructor() {
    super(10.4);
    this.p = new Parts(380);
    this.p.suelo = () => PIES + 4;
    this.fondoC = null; this.ropa = [];
  }
  /** Ronda actual y apertura de la cortina (0 cerrada, 1 abierta). */
  ronda() {
    const t = this.t;
    for (let i = 0; i < RONDAS.length; i++) {
      const [a, c] = RONDAS[i];
      if (t >= a - 0.05 && t < c + 0.35) return { i, abre: eOut(tramo(t, a, a + 0.3)) * (1 - eIn(tramo(t, c, c + 0.3))), d: t - a };
    }
    return { i: -1, abre: 0, d: 0 };
  }
  xs() {
    const t = this.t;
    const k = eInOut(tramo(t, T_CHOCAN - 0.45, T_CHOCAN)), ch = t > T_CHOCAN ? 8 * Math.sin((t - T_CHOCAN) * 20) * Math.exp(-(t - T_CHOCAN) * 6) : 0;
    return [lerp(BG, 444, k) - ch, lerp(BM, 580, k) + ch];
  }
  poses() {
    const t = this.t, r = this.ronda(), [xg, xm] = this.xs();
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "marcos", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    const dG = r.i >= 0 ? RONDAS[r.i][2] : null, dM = r.i >= 0 ? RONDAS[r.i][3] : null;
    const d = r.d;
    // reacciones de cada ronda
    if (r.i >= 0 && r.i < 3) {
      G.cara = d < 0.45 ? "risa" : d < 1.0 ? "sorpresa" : "dormido"; M.cara = d < 0.45 ? "guino" : d < 1.0 ? "sorpresa" : "dormido";
      G.rc = d > 0.45 ? 0.14 : 0; M.rc = d > 0.45 ? -0.14 : 0;
      if (d > 1.0) { G.rc = 0.12 * Math.sin(d * 18); M.rc = -0.12 * Math.sin(d * 18); }   // niegan con la cabeza
    }
    if (dG === "cocinero") { G.manoD = [80, 110]; G.manoI = [-4, 120]; }
    let mira = 0;
    if (dM === "explorador") { mira = eInOut(tramo(d, 0.4, 0.6)) * (1 - eInOut(tramo(d, 1.0, 1.2))); M.manoD = mezcla([67, 152], [58, 56], mira); M.manoI = mezcla([6, 152], [14, 56], mira); M.brazoIDelante = true; if (mira > 0.5) M.cara = "sonrisa"; }
    if (dG === "astronauta") { G.manoD = [86 + 6 * Math.sin(t * 12), 40]; }
    if (dM === "rockero") { M.manoD = [52 + 6 * Math.sin(t * 30), 128]; M.manoI = [-8, 110]; M.brazoIDelante = true; M.puntas = 1; M.gafas = true; }
    if (dG === "payaso") { G.manoD = [80, 60]; }
    if (dM === "rey") { M.manoD = [80, 96]; M.rc = r.i === 2 && d < 1.0 ? -0.2 : M.rc; }
    // la última: los dos de jarra
    if (r.i === 3) {
      G.manoD = [62, 150]; G.manoI = [16, 150]; M.manoD = [60, 146]; M.manoI = [14, 146];
      G.cara = d < 0.35 ? "sonrisa" : "sorpresa"; M.cara = d < 0.35 ? "sonrisa" : "sorpresa";
      G.rc = d > 0.35 ? 0.16 : 0; M.rc = d > 0.35 ? -0.16 : 0;
      if (t > T_ESPEJO && t < T_RIEN) {
        // hacen de espejo: ladean la cabeza a la vez
        const k = Math.sin((t - T_ESPEJO) * 12);
        G.rc = 0.18 * k; M.rc = -0.18 * k; G.cara = "guino"; M.cara = "guino";
      }
      if (t > T_RIEN) { G.cara = "risa"; M.cara = "risa"; G.rc = 0.1 + 0.05 * Math.sin(t * 14); M.rc = -0.1 - 0.05 * Math.sin(t * 14); }
      if (t > T_CHOCAN - 0.45 && t < T_CHOCAN) { const a = andar(t * 14, 0.8); G.piernaI = a.piernaI; G.piernaD = a.piernaD; M.piernaI = a.piernaD; M.piernaD = a.piernaI; }
    }
    let yg = PIES, ym = PIES;
    if (t > T_CHOCAN + 0.3) { yg -= Math.abs(Math.sin(t * 9)) * 10; ym -= Math.abs(Math.sin(t * 9 + 1)) * 10; }
    const mG = matAv(xg, yg, ESC), mM = matAv(xm, ym, ESC);
    // piezas del disfraz
    const RG = avatar().rig, RM = avatar("marcos").rig;
    const capaM = dM === "rey";
    if (dG) G.objD = (g) => {
      g.save(); g.translate(RG.cuello[0], RG.cuello[1]); g.rotate(G.rc); g.translate(-RG.cuello[0], -RG.cuello[1]);
      if (dG === "cocinero") gorroCocinero(g, 39, 8);
      if (dG === "astronauta") cascoBurbuja(g, 39, 33, 47);
      if (dG === "payaso") { pelucaPayaso(g, RG); nariz(g, RG); }
      g.restore();
      if (dG === "cocinero") panueloCuello(g, RG);
      if (dG === "astronauta") collarin(g, RG);
      if (dG === "payaso") pajarita(g, RG);
    };
    if (dM) {
      const piezasM = (g) => {
        g.save(); g.translate(RM.cuello[0], RM.cuello[1]); g.rotate(M.rc); g.translate(-RM.cuello[0], -RM.cuello[1]);
        if (dM === "explorador") sombreroExplorador(g, 37, 16);
        if (dM === "rey") coronaRey(g, 37, 14);
        g.restore();
        if (dM === "rey") armino(g, RM);
        if (dM === "explorador" && !M.brazoIDelante) prismaticos(g, 37, 104);
      };
      if (M.brazoIDelante) {
        M.objI = (g) => { piezasM(g); if (dM === "rockero") guitarra(g, 30, 128, -0.5, t); };
        if (dM === "explorador") M.objI2 = (g) => { if (mira > 0.6) { g.save(); g.translate(RM.cuello[0], RM.cuello[1]); g.rotate(M.rc); g.translate(-RM.cuello[0], -RM.cuello[1]); prismaticosFrente(g, RM); g.restore(); } else prismaticos(g, 37, 104); };
      } else M.objD = (g) => piezasM(g);
    }
    return { G, M, mG, mM, dG, dM, capaM, r };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // ropa volando por encima de los probadores mientras se cambian
    const cambiando = (t > 0.1 && t < 0.7) || (t > 2.5 && t < 2.95) || (t > 4.7 && t < 5.15) || (t > 6.9 && t < 7.35);
    if (cambiando && Math.random() < 8 * dt) {
      for (const bx of [BG, BM]) if (Math.random() < 0.7) { const sg = Math.random() < 0.5 ? -1 : 1; this.ropa.push({ x: bx + sg * azar(10, 60), y: BTOP + 10, vx: sg * azar(150, 260), vy: azar(-520, -360), r: 0, vr: azar(-9, 9), tipo: (Math.random() * 4) | 0, col: ["#ff3d84", "#2fe3e8", "#ffd34d", "#2bff5b", "#ffffff", "#9a5aff"][(Math.random() * 6) | 0] }); }
    }
    for (const o of this.ropa) { o.vy += 900 * dt; o.x += o.vx * dt; o.y += o.vy * dt; o.r += o.vr * dt; }
    this.ropa = this.ropa.filter((o) => o.y < H + 80);
    for (let i = 0; i < RONDAS.length; i++) this.una("abre" + i, t > RONDAS[i][0], () => { temblar(4, 0.12); for (const bx of [BG, BM]) for (let j = 0; j < 6; j++) p.nueva(P.POLVO, bx + azar(-90, 90), PIES - 4, azar(-80, 80), azar(-30, -5), azar(0.4, 0.8), azar(18, 30)); });
    this.una("fin", t > T_FIN + 0.35, () => { for (let i = 0; i < 16; i++) p.nueva(P.PURPURINA, azar(250, 780), azar(150, 300), azar(-60, 60), azar(-40, 20), azar(0.8, 1.4), azar(10, 16)); });
    this.una("chocan", t > T_CHOCAN, () => {
      temblar(16, 0.4);
      p.nueva(P.DESTELLO, 512, 400, 0, 0, 0.35, 220);
      for (let i = 0; i < 36; i++) { const a = (i % 2 ? -Math.PI : 0) + (i % 2 ? 1 : -1) * azar(0.1, 0.9), v = azar(200, 480); p.nueva(P.ESPUMA, 512, 420, Math.cos(a) * v, Math.sin(a) * v, azar(0.6, 1.1), azar(6, 12)); }
      for (let i = 0; i < 70; i++) p.nueva(P.CONFETI, azar(80, 944), azar(-60, 0), azar(-40, 40), azar(40, 160), azar(1.8, 2.8), azar(9, 14), (Math.random() * 5) | 0);
    });
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gw = g.createLinearGradient(0, -60, 0, 480);
    gw.addColorStop(0, "#2a6a6a"); gw.addColorStop(1, "#1a4a4e");
    g.fillStyle = gw; g.fillRect(-60, -60, W + 120, H + 120);
    // rombos del papel pintado
    g.fillStyle = "rgba(255,255,255,.05)";
    for (let x = -40; x < W + 60; x += 64) for (let y = -40; y < 480; y += 64) { g.beginPath(); g.moveTo(x, y - 14); g.lineTo(x + 10, y); g.lineTo(x, y + 14); g.lineTo(x - 10, y); g.closePath(); g.fill(); }
    // guirnalda de banderitas
    const cols = ["#ff3d84", "#ffd34d", "#2fe3e8", "#2bff5b", "#9a5aff"];
    g.strokeStyle = "#f4f0e6"; g.lineWidth = 2; g.beginPath(); g.moveTo(-60, 30); g.quadraticCurveTo(512, 90, W + 60, 30); g.stroke();
    for (let i = 0; i < 22; i++) { const u = i / 21, x = lerp(-40, W + 40, u), y = 30 + 60 * 4 * u * (1 - u) * 0.5 + 2; g.fillStyle = cols[i % 5]; g.beginPath(); g.moveTo(x - 12, y); g.lineTo(x + 12, y); g.lineTo(x, y + 24); g.closePath(); g.fill(); }
    // perchero en el centro con disfraces colgados
    g.fillStyle = "#8a8a92"; g.fillRect(472, 150, 80, 6); g.fillRect(509, 150, 6, 330); g.fillRect(480, 474, 64, 6);
    for (const [x, col] of [[484, "#e8242a"], [504, "#2a8aff"], [522, "#ffd34d"], [540, "#2bff5b"]]) { g.fillStyle = col; g.beginPath(); g.moveTo(x - 8, 160); g.lineTo(x + 8, 160); g.lineTo(x + 11, 260); g.lineTo(x - 11, 260); g.closePath(); g.fill(); g.strokeStyle = "#5a5a62"; g.lineWidth = 1.5; g.beginPath(); g.arc(x, 156, 5, Math.PI, 0); g.stroke(); }
    // estantería con sombreros a los lados
    for (const x of [40, 900]) {
      g.fillStyle = "#6a4020"; g.fillRect(x, 220, 110, 8); g.fillRect(x, 330, 110, 8);
      g.fillStyle = "#1a1a1e"; g.fillRect(x + 14, 196, 30, 24); g.fillRect(x + 6, 216, 46, 5);
      g.fillStyle = "#ffd34d"; g.beginPath(); g.moveTo(x + 64, 220); g.lineTo(x + 84, 182); g.lineTo(x + 104, 220); g.closePath(); g.fill();
      g.fillStyle = "#e8242a"; g.beginPath(); g.arc(x + 34, 316, 14, Math.PI, 0); g.fill();
      g.fillStyle = "#2fe3e8"; g.beginPath(); g.ellipse(x + 80, 322, 22, 8, 0, 0, 6.283); g.fill(); g.fillRect(x + 70, 304, 20, 18);
    }
    // suelo
    const gs = g.createLinearGradient(0, 470, 0, H);
    gs.addColorStop(0, "#8a5a3a"); gs.addColorStop(1, "#4a2a18");
    g.fillStyle = gs; g.fillRect(-60, 476, W + 120, H);
    g.fillStyle = "rgba(0,0,0,.2)"; for (let x = -60; x < W + 60; x += 80) g.fillRect(x, 476, 3, 200);
    // fondo de los probadores
    for (const bx of [BG, BM]) { g.fillStyle = "#2a1a24"; g.fillRect(bx - BW / 2, BTOP, BW, PIES - BTOP + 6); g.fillStyle = "rgba(255,240,200,.08)"; g.fillRect(bx - BW / 2 + 10, BTOP + 10, BW - 20, 6); }
    this.fondoC = c;
    return c;
  }
  probador(g, bx, abre, lado, t) {
    const x0 = bx - BW / 2, x1 = bx + BW / 2;
    // cortina: cerrada cubre el hueco; abierta se recoge hacia `lado`
    const ancho = lerp(BW, 34, abre);
    const cx0 = lado < 0 ? x0 : x1 - ancho;
    g.save();
    const n = 8;
    for (let i = 0; i < n; i++) {
      const w = ancho / n, x = cx0 + i * w;
      const gr = this.grC || (this.grC = (() => { const q = g.createLinearGradient(0, 0, 1, 0); return q; })());
      void gr;
      g.fillStyle = i % 2 ? "#a8141e" : "#d8263a"; g.fillRect(x, BTOP + 8, w + 0.5, PIES - BTOP - 4);
      g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(x + w * 0.7, BTOP + 8, w * 0.3, PIES - BTOP - 4);
    }
    // borde de abajo ondulado
    g.fillStyle = "#ffd34d"; g.fillRect(cx0, PIES - 4, ancho, 6);
    // borla
    if (abre > 0.5) { const tx = lado < 0 ? x0 + 34 : x1 - 34; g.fillStyle = "#ffd34d"; g.beginPath(); g.arc(tx, 330, 7, 0, 6.283); g.fill(); g.fillRect(tx - 3, 330, 6, 24); }
    g.restore();
    // marco
    g.fillStyle = "#6a3a1a"; g.fillRect(x0 - 12, BTOP - 10, 12, PIES - BTOP + 16); g.fillRect(x1, BTOP - 10, 12, PIES - BTOP + 16);
    g.fillStyle = "#8a5a2a"; rectR(g, x0 - 22, BTOP - 30, BW + 44, 28, 6); g.fill();
    g.fillStyle = "#ffd34d"; g.fillRect(x0 - 10, BTOP - 4, BW + 20, 5);
    for (let i = 0; i < 9; i++) { g.fillStyle = "#c9ced4"; g.beginPath(); g.arc(x0 + 8 + i * (BW - 16) / 8, BTOP + 6, 4, 0, 6.283); g.fill(); }
    void t;
  }
  dibujar(g) {
    const t = this.t, e = this.poses(), r = e.r;
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    const abre = r.abre;
    // capa del rey (detrás de Marcos)
    if (e.capaM && abre > 0) conMat(g, e.mM, () => capa(g, avatar("marcos").rig));
    // al final salen de los probadores y van al centro: entonces se pintan delante de los marcos
    const enMedio = t > T_CHOCAN - 0.45;
    const avatares = () => {
      if (!(abre > 0 || t > T_FIN)) return;
      pintarAvatar(g, e.mG, e.G, t);
      pintarAvatar(g, e.mM, e.M, t);
      if (e.dG === "jarra") conMat(g, e.mG, () => disfrazJarra(g, avatar().rig, -1, t));
      if (e.dM === "jarra") conMat(g, e.mM, () => disfrazJarra(g, avatar("marcos").rig, 1, t));
    };
    if (!enMedio) avatares();
    this.probador(g, BG, abre, -1, t); this.probador(g, BM, abre, 1, t);
    if (enMedio) avatares();
    // ropa que vuela
    for (const o of this.ropa) {
      g.save(); g.translate(o.x, o.y); g.rotate(o.r); g.fillStyle = o.col; g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2;
      if (o.tipo === 0) { g.beginPath(); g.moveTo(-18, -12); g.lineTo(-8, -16); g.lineTo(8, -16); g.lineTo(18, -12); g.lineTo(22, 0); g.lineTo(12, 0); g.lineTo(12, 16); g.lineTo(-12, 16); g.lineTo(-12, 0); g.lineTo(-22, 0); g.closePath(); g.fill(); g.stroke(); }
      else if (o.tipo === 1) { rectR(g, -6, -16, 12, 26, 4); g.fill(); g.stroke(); rectR(g, -6, 4, 18, 10, 4); g.fill(); }
      else if (o.tipo === 2) { g.beginPath(); g.ellipse(0, 4, 22, 6, 0, 0, 6.283); g.fill(); g.stroke(); rectR(g, -12, -14, 24, 18, 4); g.fill(); g.stroke(); }
      else { g.beginPath(); g.moveTo(0, -14); g.lineTo(14, 0); g.lineTo(6, 0); g.lineTo(6, 14); g.lineTo(-6, 14); g.lineTo(-6, 0); g.lineTo(-14, 0); g.closePath(); g.fill(); g.stroke(); }
      g.restore();
    }
    this.p.dibujar(g);
    // notas del rockero
    if (e.dM === "rockero" && abre > 0.5) {
      for (let i = 0; i < 3; i++) {
        const u = ((t - RONDAS[1][0]) * 1.2 + i / 3) % 1;
        g.save(); g.globalAlpha = Math.sin(u * Math.PI); g.translate(BM + 70 + u * 60, 330 - u * 120);
        g.fillStyle = "#ffd34d"; g.beginPath(); g.ellipse(0, 0, 8, 6, -0.4, 0, 6.283); g.fill(); g.fillRect(6, -28, 3, 28); g.fillRect(6, -28, 13, 4);
        g.restore();
      }
    }
    // ¡QUÉ PINTAS!
    if (t > T_RIEN) {
      const d = t - T_RIEN, k = tramo(d, 0, 0.2), s = lerp(2.4, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 6));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 74 + 5 * Math.sin(d * 2)); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.45), tramo(t, 9.85, this.dur - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00196", nombre: "Fiesta de disfraces", crear: () => new FiestaDisfraces() });
})();
