"use strict";
/*
 * 00237 · EL DRAGÓN
 *
 * Animación del banco. Empieza y acaba en negro.
 * En la barra del bar hay un dragoncito verde (diseño propio). Le pica la nariz… ¡ACHÍS!: estornuda una bocanada de
 * fuego de dibujos y prende el servilletero. Marcos, de bombero, lo apaga con el extintor y de paso deja al dragón
 * lleno de espuma y muy triste. A Guillermo se le enciende la bombilla: le acerca la barbacoa de mesa y le echa
 * pimienta… ¡ACHÍS!: brasas encendidas, salchichas a la parrilla y los tres contentos.
 */
(() => {
const CT = cacheTexto();
const ESC = 1.45, XG = 232, XM = 842, CY = 446;            // barra: la encimera está en y = CY
const DX = 478, DY = CY, DS = 1.4;                           // el dragón, sentado en la barra
const XS = 652;                                              // servilletero
const XP0 = -100, XP = 336;                                  // la parrilla: de dónde viene y dónde se queda
const T_AH = 0.6, T_ACHIS = 1.85, T_EXT = 2.35, T_APAGA = 3.15, T_PENA = 3.45, T_IDEA = 4.75, T_GIRA = 5.2,
  T_EMPUJA = 5.25, T_PARRILLA = 6.05, T_PIMIENTA = 6.25, T_ACHIS2 = 7.2, T_FIN = 9.35, DUR = 9.9;
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

// ------------------------------------------------------------------------------------------- rótulo
function rotulo() {
  if (CT.has("t")) return CT.get("t");
  const c = lienzoNuevo(640, 240), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, -110, 0, 20);
  gr.addColorStop(0, "#fff6c0"); gr.addColorStop(0.45, "#ffb42a"); gr.addColorStop(1, "#ff4d12");
  g.save(); g.translate(320, 182); g.rotate(-0.05);
  txt(g, "¡ACHÍS!", 6, 8, { tam: 150, peso: 400, fam: FC, color: "#2a0a00", esp: 6 });
  txt(g, "¡ACHÍS!", 0, 0, { tam: 150, peso: 400, fam: FC, color: gr, borde: "#2a0a00", bordeAncho: 12, esp: 6, glow: "rgba(255,140,40,.9)", glowTam: 26 });
  g.restore();
  CT.set("t", c);
  return c;
}

// ------------------------------------------------------------------------------------------- dibujitos
/** Llama de dibujos (tres lenguas) con la base en (x, y). */
function llamita(g, x, y, s, t, f = 0) {
  if (s <= 0.02) return;
  g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.55;
  g.drawImage(BLOB.naranja, x - 50 * s, y - 80 * s, 100 * s, 100 * s);
  g.restore();
  for (const [k, col] of [[1, "#ff4a1a"], [0.74, "#ffa21f"], [0.45, "#fff3a6"]]) {
    const h = 46 * s * k * (1 + 0.14 * Math.sin(t * 23 + k * 5 + f)), w = 15 * s * k, sw = 5 * s * Math.sin(t * 17 + k * 3 + f);
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(x + sw, y - h);
    g.bezierCurveTo(x + w * 0.6, y - h * 0.55, x + w * 1.1, y - w * 1.5, x + w, y - w);
    g.arc(x, y - w, w, 0, Math.PI);
    g.bezierCurveTo(x - w * 1.1, y - w * 1.5, x - w * 0.6, y - h * 0.55, x + sw, y - h);
    g.fill();
  }
}

const VERDE = "#8fd46a", VERDE_O = "#3d8a37", CREMA = "#fff0c2", LILA = "#b996e6", LILA_O = "#6f4aa6";
/**
 * El dragoncito (mira a la derecha en sus coordenadas; dir = -1 lo gira). D: { x, y, s, dir, cabeza (rad, negativo
 * levanta el morro), boca 0–1, ojos: "normal" | "ah" | "cerrados" | "pena" | "feliz", nariz 0–1, cola 0–1 (meneo),
 * alas 0–1 (aleteo), espuma 0–1, sx, sy (estirar/aplastar), lagrima 0–1 }
 */
function dragon(g, D, t) {
  g.save(); g.translate(D.x, D.y); g.scale(D.s * D.dir * (D.sx || 1), D.s * (D.sy || 1));
  g.lineJoin = "round"; g.lineCap = "round";
  // sombra
  g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.ellipse(-4, 0, 66, 7, 0, 0, 6.283); g.fill();
  // cola (por detrás, hacia la izquierda)
  const w = Math.sin(t * (3 + 9 * D.cola)) * (0.08 + 0.22 * D.cola);
  g.save(); g.translate(-34, -20); g.rotate(w);
  g.fillStyle = VERDE; g.strokeStyle = VERDE_O; g.lineWidth = 3;
  g.beginPath(); g.moveTo(4, -16); g.quadraticCurveTo(-46, -12, -60, -46); g.quadraticCurveTo(-52, -16, 8, 14); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = LILA; g.beginPath(); g.arc(-60, -48, 8, 0, 6.283); g.fill(); g.strokeStyle = LILA_O; g.lineWidth = 2.5; g.stroke();
  g.restore();
  // ala de atrás
  ala(g, -8, -70, D.alas, t, 0.85, -0.25);
  // pata de atrás
  g.fillStyle = "#6cb352"; g.beginPath(); g.ellipse(-20, -8, 17, 11, 0, 0, 6.283); g.fill();
  // cuerpo
  const gc = g.createRadialGradient(-6, -60, 8, 0, -40, 60);
  gc.addColorStop(0, "#c4f29a"); gc.addColorStop(0.6, VERDE); gc.addColorStop(1, "#5ea446");
  g.fillStyle = gc; g.beginPath(); g.ellipse(-2, -40, 44, 40, 0, 0, 6.283); g.fill();
  g.strokeStyle = VERDE_O; g.lineWidth = 3; g.stroke();
  // manchas
  g.fillStyle = "rgba(61,138,55,.45)";
  for (const [x, y, r] of [[-30, -52, 7], [-22, -30, 5], [-36, -32, 4], [-12, -70, 5]]) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
  // barriga
  g.fillStyle = CREMA; g.beginPath(); g.ellipse(16, -36, 22, 29, 0.15, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(200,160,90,.6)"; g.lineWidth = 2;
  for (let i = 0; i < 4; i++) { const y = -56 + i * 12; g.beginPath(); g.moveTo(2 + i, y); g.quadraticCurveTo(18, y + 5, 32 - i * 2, y - 2); g.stroke(); }
  // pata de delante y bracito
  g.fillStyle = VERDE; g.beginPath(); g.ellipse(18, -7, 17, 11, 0, 0, 6.283); g.fill(); g.strokeStyle = VERDE_O; g.lineWidth = 2.5; g.stroke();
  g.fillStyle = "#fff8e6"; for (const x of [28, 34]) { g.beginPath(); g.arc(x, -4, 3.2, 0, 6.283); g.fill(); }
  g.fillStyle = VERDE; g.beginPath(); g.ellipse(30, -44, 12, 7, 0.7 + 0.15 * Math.sin(t * 6) * D.cola, 0, 6.283); g.fill(); g.stroke();
  // ala de delante
  ala(g, 0, -72, D.alas, t, 1, 0.1);
  // cabeza
  g.save(); g.translate(18, -74); g.rotate(D.cabeza);
  cabeza(g, D, t);
  g.restore();
  // espuma por encima
  if (D.espuma > 0.02) {
    const e = D.espuma;
    g.fillStyle = "#ffffff";
    for (const [x, y, r] of [[-20, -78, 13], [-4, -84, 15], [-34, -68, 10], [12, -60, 9], [-10, -66, 11]]) { g.beginPath(); g.arc(x, y, r * e, 0, 6.283); g.fill(); }
    g.save(); g.translate(18, -74); g.rotate(D.cabeza);
    for (const [x, y, r] of [[6, -50, 14], [22, -54, 12], [-6, -40, 10], [40, -26, 9], [48, -14, 7], [30, -40, 9]]) { g.beginPath(); g.arc(x, y, r * e, 0, 6.283); g.fill(); }
    g.fillStyle = "rgba(200,215,230,.6)";
    for (const [x, y, r] of [[8, -46, 7], [26, -50, 5]]) { g.beginPath(); g.arc(x, y, r * e, 0, 6.283); g.fill(); }
    g.restore();
  }
  g.restore();
}
function ala(g, x, y, k, t, s, giro) {
  const a = giro - 0.25 * k * Math.abs(Math.sin(t * 16));
  g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s);
  g.fillStyle = LILA; g.strokeStyle = LILA_O; g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-10, -40, -40, -44); g.quadraticCurveTo(-34, -30, -40, -24); g.quadraticCurveTo(-28, -20, -30, -10);
  g.quadraticCurveTo(-16, -10, 0, 0); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-4, -4); g.lineTo(-34, -38); g.moveTo(-4, -4); g.lineTo(-30, -22); g.stroke();
  g.restore();
}
function cabeza(g, D, t) {
  const b = D.boca || 0;
  // cuernecillos
  g.fillStyle = CREMA; g.strokeStyle = "#c9a560"; g.lineWidth = 2;
  for (const [x, y, a] of [[-6, -46, -0.5], [10, -50, -0.2]]) {
    g.save(); g.translate(x, y); g.rotate(a);
    g.beginPath(); g.moveTo(-6, 4); g.quadraticCurveTo(-3, -14, 0, -16); g.quadraticCurveTo(3, -14, 6, 4); g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  // cabeza
  const gr = g.createRadialGradient(-4, -36, 6, 6, -22, 46);
  gr.addColorStop(0, "#c8f5a0"); gr.addColorStop(0.65, VERDE); gr.addColorStop(1, "#5ea446");
  g.fillStyle = gr; g.strokeStyle = VERDE_O; g.lineWidth = 3;
  g.beginPath(); g.ellipse(6, -24, 34, 29, 0, 0, 6.283); g.fill(); g.stroke();
  // boca abierta (detrás del morro)
  if (b > 0.05) {
    g.fillStyle = "#7a1530";
    g.beginPath(); g.ellipse(46, -2, 16 * b + 4, 12 * b, 0.2, 0, 6.283); g.fill();
    g.fillStyle = "#ff7a9a"; g.beginPath(); g.ellipse(44, 4 + 4 * b, 9 * b, 4 * b, 0.2, 0, 6.283); g.fill();
  }
  // morro
  g.fillStyle = "#a6e07e"; g.beginPath(); g.ellipse(40, -12, 24, 17, 0.1, 0, 6.283); g.fill(); g.stroke();
  // orificios de la nariz
  const n = D.nariz || 0;
  g.fillStyle = "#2c5a26";
  for (const [x, y] of [[54, -20], [60, -16]]) { g.beginPath(); g.ellipse(x, y, 2.4 + 2.2 * n, 1.8 + 1.6 * n, 0.4, 0, 6.283); g.fill(); }
  // boca cerrada
  if (b <= 0.05) {
    g.strokeStyle = VERDE_O; g.lineWidth = 2.5;
    g.beginPath();
    if (D.ojos === "feliz") { g.moveTo(26, -4); g.quadraticCurveTo(42, 8, 58, -4); }
    else if (D.ojos === "pena") { g.moveTo(30, 0); g.quadraticCurveTo(42, -6, 56, 0); }
    else { g.moveTo(28, -2); g.quadraticCurveTo(44, 4, 58, -3); }
    g.stroke();
  }
  // mofletes
  g.fillStyle = "rgba(255,120,150,.35)"; g.beginPath(); g.ellipse(8, -8, 9, 5, 0, 0, 6.283); g.fill();
  // ojos
  for (const [x, y, r] of [[2, -30, 11], [24, -32, 9]]) ojo(g, x, y, r, D.ojos, t);
  // lágrima
  if (D.lagrima > 0.02) {
    const yl = -18 + 26 * ((t * 0.9) % 1);
    g.fillStyle = "rgba(140,210,255,.95)";
    g.beginPath(); g.ellipse(-6, yl, 3.4, 4.6, 0, 0, 6.283); g.fill();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(-7, yl - 1.5, 1.1, 0, 6.283); g.fill();
  }
}
function ojo(g, x, y, r, modo, t) {
  g.strokeStyle = "#1d3a18"; g.lineWidth = 3;
  if (modo === "feliz" || modo === "cerrados") {
    g.beginPath();
    if (modo === "feliz") g.arc(x, y + 3, r * 0.7, Math.PI * 1.1, Math.PI * 1.9);
    else { g.moveTo(x - r * 0.8, y - 3); g.lineTo(x + r * 0.6, y + 1); g.moveTo(x - r * 0.8, y + 5); g.lineTo(x + r * 0.6, y + 1); }
    g.stroke();
    return;
  }
  const parpadeo = modo === "normal" && (t % 2.6) < 0.1;
  g.fillStyle = "#fff"; g.beginPath(); g.ellipse(x, y, r, r * (parpadeo ? 0.15 : 1.1), 0, 0, 6.283); g.fill();
  g.lineWidth = 2; g.stroke();
  if (parpadeo) return;
  const pena = modo === "pena", pr = r * (pena ? 0.7 : 0.55);
  g.fillStyle = "#1b2b16"; g.beginPath(); g.arc(x + (pena ? 0 : 2), y + 2, pr, 0, 6.283); g.fill();
  g.fillStyle = "#fff"; g.beginPath(); g.arc(x - pr * 0.3, y + 2 - pr * 0.4, pr * 0.35, 0, 6.283); g.fill();
  if (modo === "ah") {
    // párpados medio cerrados
    g.fillStyle = "#79c25a"; g.beginPath(); g.ellipse(x, y - r * 0.5, r * 1.05, r * 0.75, 0, Math.PI, 0); g.fill();
    g.fillRect(x - r * 1.05, y - r * 0.55, r * 2.1, r * 0.3);
  }
  // ceja
  g.strokeStyle = "#2c5a26"; g.lineWidth = 3;
  g.beginPath();
  if (pena) { g.moveTo(x - r, y - r * 1.2); g.lineTo(x + r * 0.8, y - r * 1.65); }
  else { g.moveTo(x - r * 0.8, y - r * 1.5); g.quadraticCurveTo(x, y - r * 1.8, x + r * 0.8, y - r * 1.5); }
  g.stroke();
}

/** Servilletero en la barra; fuego 0–1, quemado 0–1, espuma 0–1. */
function servilletero(g, x, fuego, quemado, espuma, t) {
  const y = CY;
  g.fillStyle = "rgba(0,0,0,.3)"; g.beginPath(); g.ellipse(x, y + 2, 30, 4, 0, 0, 6.283); g.fill();
  // servilletas
  const col = quemado > 0.5 ? "#4a4440" : "#fbfbf6";
  g.fillStyle = col; rectR(g, x - 20, y - 40, 40, 36, 3); g.fill();
  g.strokeStyle = quemado > 0.5 ? "#2a2522" : "#cfcfc4"; g.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x - 18 + i * 1.5, y - 38 + i * 2); g.lineTo(x + 18 - i * 1.5, y - 38 + i * 2); g.stroke(); }
  // soporte metálico
  const gm = g.createLinearGradient(x - 26, 0, x + 26, 0);
  gm.addColorStop(0, "#7d868e"); gm.addColorStop(0.5, "#eef2f5"); gm.addColorStop(1, "#6a737b");
  g.fillStyle = gm;
  g.beginPath(); g.moveTo(x - 26, y); g.lineTo(x - 22, y - 26); g.lineTo(x + 22, y - 26); g.lineTo(x + 26, y); g.closePath(); g.fill();
  g.fillStyle = "#4a5158"; g.fillRect(x - 27, y - 3, 54, 4);
  if (fuego > 0) llamita(g, x, y - 38, 1.35 * fuego, t);
  if (espuma > 0.02) {
    g.fillStyle = "#ffffff";
    for (const [dx, dy, r] of [[-14, -40, 11], [2, -46, 13], [16, -38, 10], [-4, -32, 9], [24, -28, 7], [-24, -26, 8]]) { g.beginPath(); g.arc(x + dx, y + dy, r * espuma, 0, 6.283); g.fill(); }
  }
}

/** Barbacoa de mesa con tres salchichas; brasa 0–1 (encendida), hecho 0–1 (salchichas doradas). */
function parrilla(g, x, brasa, hecho, t) {
  const y = CY;
  g.fillStyle = "rgba(0,0,0,.3)"; g.beginPath(); g.ellipse(x, y + 2, 64, 5, 0, 0, 6.283); g.fill();
  // patas
  g.strokeStyle = "#1b1b1d"; g.lineWidth = 4;
  g.beginPath(); g.moveTo(x - 44, y); g.lineTo(x - 38, y - 12); g.moveTo(x + 44, y); g.lineTo(x + 38, y - 12); g.stroke();
  // brasas (por detrás del borde)
  if (brasa > 0) {
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8 * brasa;
    g.drawImage(BLOB.naranja, x - 80, y - 90, 160, 90);
    g.restore();
  }
  const r = semilla(5);
  for (let i = 0; i < 9; i++) {
    const cx = x - 44 + i * 11 + r() * 4, cy = y - 38 + r() * 4;
    g.fillStyle = brasa > 0 ? `rgb(${Math.round(lerp(60, 255, brasa * (0.6 + 0.4 * Math.sin(t * 7 + i))))},${Math.round(lerp(58, 120, brasa))},${Math.round(lerp(56, 30, brasa))})` : "#3a3836";
    g.beginPath(); g.ellipse(cx, cy, 7, 5, r(), 0, 6.283); g.fill();
  }
  // llamitas entre las salchichas
  if (brasa > 0) for (let i = 0; i < 4; i++) llamita(g, x - 40 + i * 27, y - 36, 0.34 * brasa * (0.8 + 0.2 * Math.sin(t * 9 + i)), t, i * 2);
  // cuerpo
  const gc = g.createLinearGradient(0, y - 40, 0, y - 10);
  gc.addColorStop(0, "#4a4d52"); gc.addColorStop(1, "#141517");
  g.fillStyle = gc;
  g.beginPath(); g.moveTo(x - 56, y - 38); g.lineTo(x + 56, y - 38); g.lineTo(x + 46, y - 10); g.lineTo(x - 46, y - 10); g.closePath(); g.fill();
  g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(x - 52, y - 37, 104, 3);
  // rejilla
  g.strokeStyle = "#c9cfd4"; g.lineWidth = 2;
  g.beginPath(); g.moveTo(x - 58, y - 40); g.lineTo(x + 58, y - 40); g.stroke();
  // salchichas
  for (let i = 0; i < 3; i++) {
    const sx = x - 30 + i * 30, sy = y - 47;
    const c0 = [232, 150, 130], c1 = [168, 82, 40];
    const c = c0.map((v, j) => Math.round(lerp(v, c1[j], hecho)));
    g.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
    rectR(g, sx - 12, sy - 6, 24, 12, 6); g.fill();
    g.strokeStyle = `rgba(80,30,10,${0.25 + 0.5 * hecho})`; g.lineWidth = 1.5; g.stroke();
    if (hecho > 0.3) { g.strokeStyle = `rgba(60,20,5,${hecho})`; g.lineWidth = 2; g.beginPath(); for (const d of [-5, 1, 7]) { g.moveTo(sx + d - 2, sy - 5); g.lineTo(sx + d + 2, sy + 5); } g.stroke(); }
    g.fillStyle = "rgba(255,255,255,.4)"; g.fillRect(sx - 8, sy - 4, 14, 2);
  }
}

/** Extintor (diseño propio) en unidades de avatar: el asa en (0, 0) y el cuerpo colgando debajo. */
function extintor(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const gr = g.createLinearGradient(-10, 0, 10, 0);
  gr.addColorStop(0, "#7a0c08"); gr.addColorStop(0.35, "#e3261b"); gr.addColorStop(0.55, "#ff8a7a"); gr.addColorStop(1, "#8e100b");
  g.fillStyle = gr; rectR(g, -10, 7, 20, 48, 7); g.fill();
  g.strokeStyle = "#4a0604"; g.lineWidth = 1; g.stroke();
  g.fillStyle = "#f4f0e6"; g.fillRect(-10, 22, 20, 12);
  g.fillStyle = "#e3261b"; g.beginPath(); g.moveTo(0, 24); g.lineTo(3, 28); g.lineTo(0, 32); g.lineTo(-3, 28); g.closePath(); g.fill();
  g.fillStyle = "#3a3d42"; rectR(g, -5, 1, 10, 8, 2); g.fill();
  g.fillStyle = "#c9cfd4"; rectR(g, -7, -2, 14, 4, 2); g.fill();
  g.restore();
}

// ------------------------------------------------------------------------------------------- la escena
class ElDragon extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(420);
    this.p.suelo = () => CY;
  }
  estadoDragon() {
    const t = this.t;
    const D = { x: DX, y: DY, s: DS, dir: 1, cabeza: 0.02 * Math.sin(t * 2), boca: 0, ojos: "normal", nariz: 0, cola: 0.3, alas: 0, espuma: 0, sx: 1, sy: 1, lagrima: 0 };
    const ah = (t0, t1) => {
      // dos «AH…» cada vez más fuertes: echa la cabeza atrás y se le hinchan las narices
      const k = eInOut(tramo(t, t0, t0 + 0.4)) * 0.5 + eInOut(tramo(t, t0 + 0.6, t1 - 0.05)) * 0.5;
      D.cabeza = -0.42 * k + 0.03 * Math.sin(t * 40) * k; D.nariz = k; D.ojos = "ah"; D.sy = 1 + 0.06 * k; D.cola = 0;
    };
    const achis = (t0) => {
      const k = tramo(t, t0, t0 + 0.08), v = 1 - tramo(t, t0 + 0.3, t0 + 0.6);
      D.cabeza = lerp(-0.42, 0.3, eOut(k)) * v; D.boca = v; D.ojos = "cerrados"; D.sy = lerp(1.06, 0.88, k * v); D.sx = 1 + 0.08 * k * v; D.alas = v;
    };
    if (t > T_AH && t < T_ACHIS) ah(T_AH, T_ACHIS);
    if (t >= T_ACHIS && t < T_PENA) {
      achis(T_ACHIS);
      if (t > T_ACHIS + 0.6) { D.ojos = "normal"; D.cabeza = -0.05; }
      if (t > T_EXT + 0.15) { D.ojos = "cerrados"; D.cabeza = 0.05 + 0.04 * Math.sin(t * 30); D.sy = 0.95; }
      D.espuma = eOut(tramo(t, T_EXT + 0.2, T_APAGA));
    }
    if (t >= T_PENA && t < T_GIRA) {
      const k = eInOut(tramo(t, T_PENA, T_PENA + 0.4));
      D.espuma = 1; D.ojos = "pena"; D.cabeza = 0.22 * k; D.sy = 1 - 0.06 * k; D.lagrima = k; D.cola = 0;
      if (t > T_IDEA + 0.2) { D.ojos = "normal"; D.cabeza = lerp(0.22, 0, eOut(tramo(t, T_IDEA + 0.2, T_IDEA + 0.4))); D.lagrima = 0; }
    }
    if (t >= T_GIRA) {
      // se da la vuelta (hacia Guillermo) sacudiéndose la espuma
      const k = tramo(t, T_GIRA, T_GIRA + 0.3);
      D.dir = k < 0.5 ? 1 : -1; D.sx = Math.abs(Math.cos(k * Math.PI)) * 0.9 + 0.1; D.y = DY - Math.sin(k * Math.PI) * 18;
      D.espuma = 1 - eOut(k); D.ojos = k < 1 ? "cerrados" : "normal";
      if (t > T_GIRA + 0.3) { D.sx = 1; D.cabeza = 0.04 * Math.sin(t * 3); D.cola = 0.4; }
      if (t > T_PARRILLA) D.cabeza = 0.12;
      if (t > T_PIMIENTA + 0.2 && t < T_ACHIS2) ah(T_PIMIENTA + 0.2, T_ACHIS2);
      if (t >= T_ACHIS2) {
        achis(T_ACHIS2);
        if (t > T_ACHIS2 + 0.6) {
          const k2 = eOut(tramo(t, T_ACHIS2 + 0.6, T_ACHIS2 + 0.9));
          D.ojos = "feliz"; D.cola = k2; D.alas = 0.6 * k2; D.cabeza = -0.1 * k2; D.y = DY - Math.abs(Math.sin(t * 7)) * 8 * k2;
        }
      }
    }
    return D;
  }
  /** Punto de la cabeza del dragón (sus coordenadas) en la pantalla. */
  enPantalla(D, p) {
    const q = rot2(p, D.cabeza);
    return [D.x + D.dir * D.s * (D.sx || 1) * (18 + q[0]), D.y + D.s * (D.sy || 1) * (-74 + q[1])];
  }
  xParrilla() { return lerp(XP0, XP, eOut(tramo(this.t, T_EMPUJA + 0.15, T_PARRILLA))); }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0.05, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "bombero", cara: "sonrisa", rc: -0.05, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let xg = XG, dyG = 0, giroG = 0, dyM = 0;
    const mG0 = matAv(XG, PIES, ESC), mM0 = matAv(XM, PIES, ESC);
    // ---- al principio: Guillermo saluda al dragón, Marcos con el extintor colgando
    if (t < T_AH) { G.cara = "risa"; G.manoD = [86, 112 + 6 * Math.sin(t * 14)]; G.rc = 0.1; }
    if (t > T_AH && t < T_ACHIS) {
      const k = eOut(tramo(t, T_AH + 0.5, T_AH + 0.8));
      G.cara = "sorpresa"; G.rc = 0.12; giroG = -0.06 * k; G.manoD = mezcla([70, 158], [86, 120], k); G.manoI = mezcla([9, 160], [-6, 120], k);
      M.cara = "sorpresa"; M.rc = -0.12;
    }
    // ---- ¡ACHÍS!: se le pone el pelo de punta
    if (t >= T_ACHIS && t < T_PENA) {
      const k = 1 - tramo(t, T_ACHIS + 0.7, T_ACHIS + 1.2);
      G.cara = "sorpresa"; G.puntas = k; G.rc = 0.15; giroG = -0.08 * k; dyG = -10 * Math.sin(tramo(t, T_ACHIS, T_ACHIS + 0.3) * Math.PI);
      G.manoD = [84, 92]; G.manoI = [-8, 96];
      M.cara = "sorpresa"; M.rc = -0.15;
    }
    // ---- Marcos apaga el servilletero (y llena al dragón de espuma)
    const kExt = eOut(tramo(t, T_EXT - 0.25, T_EXT)) * (1 - eInOut(tramo(t, T_APAGA + 0.15, T_APAGA + 0.45)));
    if (kExt > 0) {
      M.manoD = mezcla([67, 152], [50, 126], kExt);
      M.manoI = mezcla([6, 152], [-18, 112], kExt); M.brazoIDelante = true;
      M.cara = t > T_EXT + 0.1 ? "guino" : "sorpresa"; M.rc = -0.1;
      dyM = -3 * Math.abs(Math.sin(t * 30)) * (t > T_EXT && t < T_APAGA ? 1 : 0);
    }
    this.chorroExt = t > T_EXT && t < T_APAGA + 0.1;
    if (t < T_PENA) M.objD = (g, mano) => extintor(g, mano[0], mano[1] - 2, 0.05);
    const kM = tramo(t, T_EXT - 0.25, T_EXT) > 0 && t < T_APAGA + 0.45 ? 1 : 0;
    this.lanza = kM ? M.manoI : null;
    // ---- pena: Marcos se rasca el casco, Guillermo «ooh»
    if (t >= T_PENA && t < T_IDEA) {
      const k = eInOut(tramo(t, T_PENA, T_PENA + 0.35));
      M.cara = "sorpresa"; M.rc = 0.12 * k; M.manoI = mezcla([6, 152], [6, 20 + 3 * Math.sin(t * 12)], k); M.brazoIDelante = false;
      G.cara = "sorpresa"; G.rc = -0.14 * k; G.manoD = mezcla([70, 158], [52, 116], k); G.manoI = mezcla([9, 160], [26, 116], k); G.brazoIDelante = true;
      if (t > T_PENA + 0.6) { M.cara = "dormido"; G.cara = "dormido"; }
    }
    // ---- ¡idea!
    if (t >= T_IDEA && t < T_EMPUJA + 0.1) {
      G.cara = "guino"; G.rc = 0.08; G.manoD = [80, 14 + 4 * Math.sin(t * 10)];
      M.cara = "sorpresa"; M.rc = -0.1;
      dyG = -6 * Math.abs(Math.sin(tramo(t, T_IDEA, T_IDEA + 0.3) * Math.PI));
    }
    // ---- trae la barbacoa empujándola por la barra
    if (t >= T_EMPUJA && t < T_PIMIENTA + 0.1) {
      const xp = this.xParrilla();
      const k = eInOut(tramo(t, T_EMPUJA, T_EMPUJA + 0.2));
      const am = enAv(mG0, [xp - 56, CY - 26]);
      G.manoD = mezcla([80, 18], [Math.max(am[0], 40), am[1]], k); G.cara = "risa"; G.rc = 0.1;
      M.cara = t > T_EMPUJA + 0.4 ? "risa" : "sorpresa"; M.rc = -0.08;
    }
    // ---- pimienta en la nariz del dragón
    if (t >= T_PIMIENTA && t < T_ACHIS2 + 0.2) {
      const D = this.estadoDragon(), nz = this.enPantalla(D, [58, -36]);
      const k = eInOut(tramo(t, T_PIMIENTA, T_PIMIENTA + 0.25)), sac = Math.sin(t * 34) * 5 * (t > T_PIMIENTA + 0.25 ? 1 : 0);
      const obj = enAv(mG0, [nz[0] - 6, nz[1] + 6]);
      // en cuanto el dragón dice «AH…», retira la mano y se echa atrás
      const kr = eOut(tramo(t, T_ACHIS2 - 0.45, T_ACHIS2 - 0.2));
      G.manoD = mezcla(mezcla([70, 150], [obj[0], obj[1] + sac * (1 - kr)], k), [50, 118], kr); G.cara = kr > 0.5 ? "sorpresa" : "guino"; G.rc = 0.12 - 0.2 * kr;
      xg = XG - 46 * kr;
      G.objD = (g, mano) => pimentero(g, mano[0], mano[1]);
      this.pimienta = k > 0.9 && t < T_ACHIS2 - 0.45 ? aPant(mG0, [obj[0], obj[1] - 18]) : null;
      M.cara = "sorpresa"; M.rc = -0.12; M.manoD = [74, 60]; M.manoI = [0, 62];   // se tapa un poco… por si acaso
      giroG = -0.04 * k - 0.07 * kr;
    } else this.pimienta = null;
    // ---- ¡ACHÍS! a la barbacoa y los tres contentos
    if (t >= T_ACHIS2 + 0.2) {
      const k = eOut(tramo(t, T_ACHIS2 + 0.2, T_ACHIS2 + 0.5));
      xg = XG - 46 * (1 - eInOut(tramo(t, T_ACHIS2 + 0.5, T_ACHIS2 + 0.9)));
      G.cara = t < T_ACHIS2 + 0.6 ? "sorpresa" : "risa"; G.rc = 0.06; G.puntas = 1 - tramo(t, T_ACHIS2 + 0.3, T_ACHIS2 + 0.8);
      M.cara = t < T_ACHIS2 + 0.6 ? "sorpresa" : "risa"; M.rc = -0.06;
      if (t > T_ACHIS2 + 0.7) {
        // Guillermo pincha una salchicha y la levanta; Marcos aplaude
        const k2 = eInOut(tramo(t, T_ACHIS2 + 0.9, T_ACHIS2 + 1.3));
        G.manoD = mezcla([70, 150], [82, 70], k2); G.manoI = [9, 160];
        G.objD = (g, mano) => tenedor(g, mano[0], mano[1], k2 > 0.5);
        const s = Math.sin(t * 16);
        M.manoD = [46 + 4 * s, 112]; M.manoI = [26 - 4 * s, 112]; M.brazoIDelante = true; M.cara = "risa";
        if (t > T_ACHIS2 + 1.3) { G.cara = "guino"; dyG = -Math.abs(Math.sin(t * 6)) * 5; }
      } else { G.manoD = mezcla([70, 150], [70, 150], k); }
    }
    const mG = matAv(xg, PIES + dyG, ESC, giroG), mM = matAv(XM, PIES + dyM, ESC);
    return { G, M, mG, mM };
  }

  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const D = this.estadoDragon();
    const boca = this.enPantalla(D, [64, -4]), nariz = this.enPantalla(D, [58, -20]);
    // humito de la nariz mientras le pica
    if (D.nariz > 0.3 && Math.random() < 10 * dt) p.nueva(P.HUMO, nariz[0], nariz[1], D.dir * azar(5, 30), azar(-40, -15), azar(0.5, 0.9), azar(10, 18));
    const estornudo = (k, obj) => this.una(k, true, () => {
      temblar(16, 0.45);
      p.nueva(P.DESTELLO, boca[0] + D.dir * 20, boca[1], 0, 0, 0.3, 140);
      for (let i = 0; i < 60; i++) {
        const u = azar(0.25, 0.45), vx = (obj[0] - boca[0]) / u + azar(-60, 60), vy = (obj[1] - boca[1]) / u + azar(-50, 30);
        p.nueva(P.LLAMA, boca[0], boca[1], vx, vy, azar(0.35, 0.6), azar(26, 44), i % 3 ? 0 : 1);
      }
      for (let i = 0; i < 16; i++) { const a = azar(0, 6.283), v = azar(100, 280); p.nueva(P.CHISPA, obj[0], obj[1], Math.cos(a) * v, Math.sin(a) * v - 120, azar(0.4, 0.8), azar(5, 9)); }
      for (let i = 0; i < 8; i++) p.nueva(P.HUMO, boca[0], boca[1], D.dir * azar(20, 80), azar(-50, -10), azar(0.6, 1.1), azar(16, 28));
    });
    if (t > T_ACHIS) estornudo("a1", [XS, CY - 40]);
    if (t > T_ACHIS2) estornudo("a2", [this.xParrilla(), CY - 44]);
    // extintor: nube blanca hacia el servilletero
    if (this.chorroExt && this.lanza) {
      const e = this.poses(), L = aPant(e.mM, e.M._manoI || this.lanza);
      for (let i = 0; i < 3; i++) {
        const tx = XS + azar(-30, 10), ty = CY - 40 + azar(-30, 20), u = azar(0.25, 0.4);
        p.nueva(P.VAPOR, L[0] - 6, L[1] + 4, (tx - L[0]) / u, (ty - L[1]) / u, azar(0.35, 0.6), azar(20, 34));
      }
      if (Math.random() < 30 * dt) p.nueva(P.ESPUMA, L[0] - 10, L[1] + 4, azar(-420, -260), azar(-120, 0), azar(0.4, 0.7), azar(5, 9));
    }
    this.una("fss", t > T_APAGA, () => { for (let i = 0; i < 10; i++) p.nueva(P.VAPOR, XS + azar(-20, 20), CY - 50, azar(-30, 30), azar(-80, -30), azar(0.6, 1), azar(20, 34)); });
    // pimienta
    if (this.pimienta && Math.random() < 30 * dt) p.nueva(P.POLVO, this.pimienta[0] + azar(-4, 4), this.pimienta[1] + azar(-4, 4), azar(30, 90), azar(-40, -10), azar(0.3, 0.6), azar(3, 6));
    // se sacude la espuma
    this.una("sacude", t > T_GIRA + 0.1, () => {
      for (let i = 0; i < 26; i++) { const a = azar(-Math.PI, 0), v = azar(150, 380); p.nueva(P.ESPUMA, DX + azar(-30, 30), DY - 100, Math.cos(a) * v, Math.sin(a) * v, azar(0.5, 0.9), azar(5, 10)); }
    });
    this.una("idea", t > T_IDEA, () => p.nueva(P.DESTELLO, XG + 22, PIES - 360, 0, 0, 0.3, 120));
    // barbacoa encendida: humito y chispitas
    if (t > T_ACHIS2 + 0.15 && Math.random() < 8 * dt) p.nueva(P.HUMO, this.xParrilla() + azar(-40, 40), CY - 56, azar(-10, 10), azar(-60, -30), azar(0.8, 1.4), azar(14, 24));
    if (t > T_ACHIS2 + 0.15 && Math.random() < 6 * dt) p.nueva(P.CHISPA, this.xParrilla() + azar(-40, 40), CY - 48, azar(-40, 40), azar(-260, -140), azar(0.4, 0.7), azar(4, 6));
    this.una("fiesta", t > T_ACHIS2 + 0.7, () => {
      for (let i = 0; i < 50; i++) p.nueva(P.CONFETI, azar(60, 960), azar(-60, -10), azar(-40, 40), azar(30, 140), azar(2, 3), azar(9, 14), i % 5);
    });
    p.actualizar(dt);
  }

  fondo() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    // pared de madera oscura con luz cálida
    const gp = g.createLinearGradient(0, -60, 0, CY);
    gp.addColorStop(0, "#2a160c"); gp.addColorStop(1, "#5a3218");
    g.fillStyle = gp; g.fillRect(-60, -60, W + 120, H + 120);
    g.fillStyle = "rgba(0,0,0,.18)";
    for (let x = -60; x < W + 60; x += 64) g.fillRect(x, -60, 3, CY + 60);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35;
    for (const x of [200, 512, 824]) g.drawImage(BLOB2.oro, x - 220, -40, 440, 380);
    g.restore();
    // baldas con botellas
    const cols = ["#2f6b3a", "#7a3b16", "#3b4d7a", "#6b5a1a", "#6a1e3a", "#1e5a5a"];
    for (const yb of [150, 262]) {
      g.fillStyle = "#3a2010"; g.fillRect(-60, yb, W + 120, 9);
      g.fillStyle = "rgba(255,220,170,.25)"; g.fillRect(-60, yb, W + 120, 2);
      for (let i = 0; i < 26; i++) {
        const x = 20 + i * 39 + (yb === 150 ? 0 : 18), col = cols[(i * 7 + yb) % cols.length], h = 40 + ((i * 13) % 3) * 8;
        g.fillStyle = col; rectR(g, x - 9, yb - h, 18, h, 5); g.fill(); g.fillRect(x - 3, yb - h - 14, 6, 16);
        g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(x - 6, yb - h + 6, 2.5, h - 12);
      }
    }
    // lámparas
    for (const x of [200, 512, 824]) {
      g.strokeStyle = "#111"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, -60); g.lineTo(x, 18); g.stroke();
      g.fillStyle = "#1d4a2c"; g.beginPath(); g.moveTo(x - 30, 42); g.lineTo(x + 30, 42); g.lineTo(x + 13, 18); g.lineTo(x - 13, 18); g.closePath(); g.fill();
      g.save(); g.globalCompositeOperation = "lighter"; g.drawImage(BLOB.amarillo, x - 60, 20, 120, 80); g.restore();
    }
    // la barra
    const gb = g.createLinearGradient(0, CY + 6, 0, H);
    gb.addColorStop(0, "#6a3c1c"); gb.addColorStop(1, "#3a1e0c");
    g.fillStyle = gb; g.fillRect(-60, CY + 6, W + 120, H);
    g.fillStyle = "rgba(0,0,0,.2)"; for (let x = -60; x < W + 60; x += 90) g.fillRect(x, CY + 14, 4, H);
    g.fillStyle = "#9a5e2c"; g.fillRect(-60, CY - 4, W + 120, 12);
    g.fillStyle = "rgba(255,225,180,.55)"; g.fillRect(-60, CY - 4, W + 120, 2);
    g.fillStyle = "#c08a3a"; g.fillRect(-60, 520, W + 120, 5);
    // suelo
    g.fillStyle = "#1c100a"; g.fillRect(-60, PIES - 4, W + 120, H);
    return (this.cF = c);
  }

  dibujar(g) {
    const t = this.t, D = this.estadoDragon(), e = this.poses();
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    // servilletero: arde tras el primer ¡ACHÍS! hasta que lo apaga Marcos
    const fuego = t > T_ACHIS + 0.2 ? Math.min(1, (t - T_ACHIS - 0.2) * 4) * (1 - tramo(t, T_EXT + 0.25, T_APAGA)) : 0;
    servilletero(g, XS, fuego, t > T_APAGA - 0.3 ? 1 : 0, eOut(tramo(t, T_EXT + 0.3, T_APAGA)), t);
    // barbacoa
    const xp = this.xParrilla();
    if (xp > -80) parrilla(g, xp, t > T_ACHIS2 + 0.15 ? eOut(tramo(t, T_ACHIS2 + 0.15, T_ACHIS2 + 0.5)) : 0, tramo(t, T_ACHIS2 + 0.6, T_ACHIS2 + 1.6), t);
    dragon(g, D, t);
    // el extintor, ya en el suelo
    if (t >= T_PENA) { g.save(); g.translate(XM + 66, PIES - 80); g.scale(ESC, ESC); extintor(g, 0, 0, 0); g.restore(); }
    // bola de fuego del estornudo (de la boca al objetivo)
    for (const [t0, obj] of [[T_ACHIS, [XS, CY - 44]], [T_ACHIS2, [xp, CY - 46]]]) {
      const u = tramo(t, t0, t0 + 0.22);
      if (t > t0 && u < 1) {
        const b = this.enPantalla(D, [64, -4]), q = mezcla(b, obj, eOut(u));
        bola(g, q[0], q[1], 16 + 22 * Math.sin(u * Math.PI), t);
      }
    }
    pintarAvatar(g, e.mG, e.G, t);
    // manguera del extintor de Marcos (del extintor a la lanza)
    pintarAvatar(g, e.mM, e.M, t);
    if (this.lanza && e.M._manoD) {
      const a = aPant(e.mM, [e.M._manoD[0], e.M._manoD[1] + 2]), L = aPant(e.mM, e.M._manoI || this.lanza);
      g.strokeStyle = "#1b1b1d"; g.lineWidth = 6; g.lineCap = "round";
      g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + L[0]) / 2, Math.max(a[1], L[1]) + 40, L[0], L[1]); g.stroke();
      // boquilla
      g.fillStyle = "#2a2a2e"; g.save(); g.translate(L[0], L[1]); g.rotate(Math.PI + 0.15);
      g.beginPath(); g.moveTo(-4, -5); g.lineTo(18, -8); g.lineTo(18, 8); g.lineTo(-4, 5); g.closePath(); g.fill(); g.restore();
    }
    this.p.dibujar(g);
    // bombilla de la idea
    if (t > T_IDEA && t < T_EMPUJA + 0.3) {
      const k = eBack(tramo(t, T_IDEA, T_IDEA + 0.2)) * (1 - tramo(t, T_EMPUJA, T_EMPUJA + 0.3));
      bombilla(g, XG - 6, PIES - 395, k, t);
    }
    // onomatopeyas
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    ono("AH…", 560, 205, T_AH, 0.55, 46, "#fffdf5", "#1b3a16", -0.08);
    ono("AH…", 590, 190, T_AH + 0.6, 0.6, 58, "#fffdf5", "#1b3a16", -0.12);
    ono("¡FSSSH!", 640, 250, T_EXT + 0.1, 0.9, 54, "#e8f6ff", "#123048", 0.08);
    ono("¡OOOH…!", 512, 200, T_PENA + 0.5, 0.9, 44, "#cfe6ff", "#123048", 0);
    ono("¡PIMIENTA!", 300, 192, T_PIMIENTA + 0.2, 0.75, 46, "#fffdf5", "#2a1a00", -0.1);
    ono("AH… AH…", 520, 205, T_PIMIENTA + 0.3, 0.6, 52, "#fffdf5", "#1b3a16", -0.1);
    ono("¡CHSSS!", 392, 522, T_ACHIS2 + 0.6, 0.8, 42, "#ffd34d", "#3a1a00", -0.12);
    // ¡ACHÍS! (dos veces: el segundo se queda)
    const tit = (t0, t1) => {
      if (t < t0 || t > t1) return;
      const d = t - t0, k = tramo(d, 0, 0.14), s = lerp(2.2, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 9)), sal = tramo(t, t1 - 0.25, t1);
      const r = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - sal); g.translate(512 + (d < 0.4 ? azar(-5, 5) : 0), 96); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    };
    tit(T_ACHIS, T_PENA - 0.1);
    tit(T_ACHIS2, DUR);
    const a = Math.max(1 - tramo(t, 0.02, 0.5), tramo(t, T_FIN, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}
/** Bola de fuego de dibujos. */
function bola(g, x, y, r, t) {
  g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.9;
  g.drawImage(BLOB.naranja, x - r * 2.4, y - r * 2.4, r * 4.8, r * 4.8);
  g.restore();
  for (const [k, col] of [[1, "#ff4a1a"], [0.74, "#ffa21f"], [0.45, "#fff3a6"]]) {
    g.fillStyle = col; g.beginPath();
    for (let i = 0; i <= 12; i++) {
      const a = (i / 12) * 6.283, rr = r * k * (1 + 0.22 * Math.sin(i * 2.7 + t * 30));
      g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    g.closePath(); g.fill();
  }
}
function bombilla(g, x, y, k, t) {
  if (k <= 0.01) return;
  g.save(); g.translate(x, y); g.scale(k, k);
  g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8; g.drawImage(BLOB.amarillo, -60, -64, 120, 120); g.restore();
  g.strokeStyle = "#fff3a0"; g.lineWidth = 4; g.lineCap = "round";
  for (let i = 0; i < 7; i++) { const a = -Math.PI + (i * Math.PI) / 6, r0 = 34, r1 = 46 + 4 * Math.sin(t * 20 + i); g.beginPath(); g.moveTo(Math.cos(a) * r0, -6 + Math.sin(a) * r0); g.lineTo(Math.cos(a) * r1, -6 + Math.sin(a) * r1); g.stroke(); }
  const gr = g.createRadialGradient(-6, -14, 3, 0, -6, 26);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#fff3a0"); gr.addColorStop(1, "#ffc21f");
  g.fillStyle = gr; g.beginPath(); g.arc(0, -8, 22, 0, 6.283); g.fill();
  g.fillStyle = "#8a9096"; rectR(g, -10, 10, 20, 14, 3); g.fill();
  g.strokeStyle = "#5a6066"; g.lineWidth = 2; g.beginPath(); g.moveTo(-10, 15); g.lineTo(10, 15); g.moveTo(-10, 20); g.lineTo(10, 20); g.stroke();
  g.restore();
}
/** Pimentero en la mano (unidades de avatar). */
function pimentero(g, x, y) {
  g.save(); g.translate(x, y - 6);
  g.fillStyle = "#f4f0e6"; rectR(g, -5, -6, 10, 18, 3); g.fill();
  g.strokeStyle = "#9a9384"; g.lineWidth = 0.8; g.stroke();
  g.fillStyle = "#3a3d42"; rectR(g, -5.5, -12, 11, 7, 3); g.fill();
  g.fillStyle = "#c9cfd4"; for (const dx of [-2.5, 0, 2.5]) { g.beginPath(); g.arc(dx, -10, 0.8, 0, 6.283); g.fill(); }
  g.fillStyle = "rgba(40,30,20,.6)"; g.fillRect(-4, 4, 8, 7);
  g.restore();
}
/** Tenedor con salchicha pinchada (unidades de avatar). */
function tenedor(g, x, y, conSalchicha) {
  g.save(); g.translate(x, y);
  g.strokeStyle = "#c9cfd4"; g.lineWidth = 2; g.lineCap = "round";
  g.beginPath(); g.moveTo(0, 4); g.lineTo(0, -26); g.stroke();
  g.lineWidth = 1.2; g.beginPath(); for (const dx of [-2.5, 0, 2.5]) { g.moveTo(dx, -26); g.lineTo(dx, -34); } g.stroke();
  if (conSalchicha) {
    g.fillStyle = "#a8522a"; rectR(g, -5, -48, 10, 20, 5); g.fill();
    g.strokeStyle = "rgba(60,20,5,.9)"; g.lineWidth = 1.4; g.beginPath(); for (const dy of [-44, -38, -32]) { g.moveTo(-4, dy); g.lineTo(4, dy + 3); } g.stroke();
    g.fillStyle = "rgba(255,255,255,.4)"; g.fillRect(-3, -45, 1.6, 12);
  }
  g.restore();
}

registrar({ id: "00237", nombre: "El dragón", crear: () => new ElDragon() });
})();
