"use strict";
/*
 * 00045 · EL HOMBRE DEL TIEMPO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende la tele (raya blanca que se abre). Delante del mapa de España, con un puntero láser, va señalando y en
 * cada sitio aparece una nube que llueve cerveza: Galicia, Bilbao, Barcelona, Madrid, Valencia, Sevilla, Baleares y
 * Canarias. Abre los brazos: el mar se llena de cerveza. Rótulo: PREVISIÓN: 100 % CAÑAS. Una nube se le pone encima,
 * le llueve en la cabeza y llena una jarra; brinda guiñando. La tele se apaga.
 */
(() => {
const MX = 392, MY = 66, KX = 37.4, KY = 48.6; // mapa: lon -9.5 → MX, lat 43.9 → MY
const pr = (lon, lat) => [MX + (lon + 9.5) * KX, MY + (43.9 - lat) * KY];
const ESPANA = [[-8.0, 43.7], [-7.7, 43.78], [-7.0, 43.55], [-5.85, 43.66], [-5.7, 43.56], [-4.5, 43.4], [-3.8, 43.47], [-3.0, 43.4], [-2.0, 43.32], [-1.8, 43.38],
  [-1.4, 43.05], [-0.8, 42.95], [-0.3, 42.8], [0.7, 42.85], [1.4, 42.6], [2.0, 42.45], [3.15, 42.45], [3.3, 42.3], [3.1, 41.9], [2.2, 41.4], [1.2, 41.1],
  [0.9, 40.7], [0.2, 40.0], [-0.3, 39.45], [0.2, 38.75], [-0.5, 38.35], [-0.7, 37.6], [-1.3, 37.55], [-2.0, 36.75], [-2.5, 36.8], [-3.5, 36.72], [-4.4, 36.7],
  [-5.0, 36.45], [-5.35, 36.15], [-5.6, 36.0], [-6.0, 36.3], [-6.3, 36.5], [-6.4, 36.8], [-6.9, 37.2], [-7.4, 37.2], [-7.5, 37.5], [-7.25, 38.0], [-7.1, 38.2],
  [-7.3, 38.45], [-7.0, 38.9], [-7.2, 39.2], [-7.5, 39.65], [-7.0, 39.7], [-6.85, 40.25], [-6.85, 41.0], [-6.3, 41.4], [-6.55, 41.95], [-7.2, 41.98],
  [-7.9, 41.85], [-8.2, 42.1], [-8.87, 41.87], [-8.9, 42.3], [-9.0, 42.6], [-9.3, 42.9], [-9.2, 43.2], [-8.6, 43.35], [-8.3, 43.55]];
const ISLAS = [
  [[2.35, 39.6], [2.7, 39.95], [3.2, 39.9], [3.45, 39.65], [3.25, 39.3], [2.95, 39.35], [2.75, 39.5], [2.5, 39.45]],
  [[3.8, 40.02], [4.3, 39.97], [4.32, 39.82], [3.85, 39.9]],
  [[1.2, 38.95], [1.45, 39.12], [1.62, 38.98], [1.35, 38.84]],
];
// Canarias en un recuadro abajo a la izquierda
const CAN = { x: 350, y: 418, w: 140, h: 64 };
const CANARIAS = [[20, 38, 8, 6], [38, 48, 6, 5], [56, 30, 15, 8], [78, 42, 9, 8], [98, 36, 12, 7], [118, 20, 6, 10], [128, 13, 6, 5]];
// sitios donde salen las nubes (pantalla) y cuándo
const SITIOS = [[-8.3, 42.6], [-2.8, 43.0], [1.9, 41.7], [-3.7, 40.3], [-0.6, 39.3], [-5.6, 37.5], [2.9, 39.7], null];
const T_NUBE = (i) => 1.15 + i * 0.42;
const T_MAR = 4.85, T_ROTULO = 5.75, T_SUYA = 6.55;
const X = 205, ESC = 1.45;

class HombreTiempo extends Escena {
  constructor() {
    super(9.4);
    this.p = new Parts(360);
    this.mapa = pintarMapa();
    this.nube = pintarNube();
    this.puntos = SITIOS.map((s) => (s ? pr(s[0], s[1]) : [CAN.x + 70, CAN.y + 34]));
  }
  /** Dónde está el punto del láser. */
  laser() {
    const t = this.t;
    if (t < 0.8 || t > T_NUBE(7) + 0.15) return null;
    let i = 0;
    while (i < 7 && t > T_NUBE(i)) i++;
    const a = i ? this.puntos[i - 1] : [MX + 200, MY + 200], b = this.puntos[i];
    const k = eInOut(tramo(t, (i ? T_NUBE(i - 1) : 0.8) + 0.08, T_NUBE(i) - 0.04));
    return mezcla(a, b, k);
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [72, 150], manoI = [8, 150], mando = false, jarra = null;
    const L = this.laser();
    if (t > 0.55 && t < T_MAR) {
      const k = eInOut(tramo(t, 0.55, 0.85));
      let ap = [116, 98];
      if (L) { const d = [L[0] - X, L[1] - 300]; const a = Math.atan2(d[1], d[0]); ap = [69 + Math.cos(a) * 60, 86 + Math.sin(a) * 60]; }
      manoD = mezcla([72, 150], ap, k); mando = true;
      pose.cara = t < 1.0 ? "sonrisa" : Math.sin(t * 6) > 0.3 ? "risa" : "sonrisa";
      pose.rc = 0.04 * Math.sin(t * 4);
      manoI = [6, 136];
    }
    // ¡a todo el país!: abre los brazos
    if (t >= T_MAR && t < T_SUYA) {
      const k = eOut(tramo(t, T_MAR, T_MAR + 0.25));
      manoD = mezcla([110, 96], [130, 40], k); manoI = mezcla([6, 136], [-52, 40], k);
      pose.cara = t < T_ROTULO ? "risa" : "guino";
      mando = t < T_MAR + 0.1;
    }
    // la nube suya: saca una jarra y la llena con la lluvia
    if (t >= T_SUYA) {
      const k = eInOut(tramo(t, T_SUYA + 0.15, T_SUYA + 0.45));
      manoD = mezcla([130, 40], [92, 46], k); manoI = mezcla([-52, 40], [8, 150], k);
      const nivel = tramo(t, T_SUYA + 0.7, 7.9);
      pose.cara = t < T_SUYA + 0.55 ? "sorpresa" : t < 7.95 ? "risa" : "guino";
      jarra = { inc: -0.05, nivel };
      if (t > 7.95) { const v = eInOut(tramo(t, 7.95, 8.25)); manoD = mezcla([92, 46], [100, 100], v); jarra.inc = -0.05 - 0.2 * Math.sin(Math.PI * tramo(t, 8.3, 8.6)); }
      if (t < T_SUYA + 0.55) pose.rc = -0.05;
    }
    pose.manoD = manoD; pose.manoI = manoI;
    if (jarra) pose.jarra = jarra;
    if (mando) pose.objD2 = (g, m, a) => { g.save(); g.translate(m[0], m[1]); g.rotate(a); g.fillStyle = "#1a1a1e"; rectR(g, -2, -3, 12, 6, 2); g.fill(); g.fillStyle = "#ff2a2a"; g.beginPath(); g.arc(9.5, 0, 1.4, 0, 6.283); g.fill(); g.restore(); };
    pose.objD = (g) => corbata(g);
    const m = matAv(X, PIES, ESC);
    return { pose, m, L, mando };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    for (let i = 0; i < 8; i++) this.una("nube" + i, t > T_NUBE(i), () => {
      const q = this.puntos[i];
      for (let k = 0; k < 10; k++) { const a = azar(0, 6.283), v = azar(60, 200); p.nueva(P.DESTELLO, q[0] + Math.cos(a) * 20, q[1] - 30 + Math.sin(a) * 12, 0, 0, 0.25, 30); }
    });
    this.una("mar", t > T_MAR, () => temblar(8, 0.3));
    this.una("rotulo", t > T_ROTULO + 0.1, () => temblar(12, 0.3));
    this.una("suya", t > T_SUYA, () => { temblar(6, 0.2); });
    // lluvia sobre él
    if (t > T_SUYA + 0.25 && t < 8.1) {
      const q = aPant(e.m, [39, -40]);
      for (let k = 0; k < 2; k++) p.nueva(P.GOTA, q[0] + azar(-70, 90), q[1] - 60 + azar(-10, 10), 0, azar(100, 200), 0.45, azar(2.5, 4));
      if (Math.random() < 12 * dt) { const c = aPant(e.m, [39 + azar(-20, 20), -2]); p.nueva(P.ESPUMA, c[0], c[1], azar(-90, 90), azar(-160, -60), azar(0.3, 0.5), azar(2, 5)); }
    }
    p.actualizar(dt);
  }
  dibujarNube(g, x, y, k, t, i) {
    if (k <= 0) return;
    const s = eBack(k);
    // lluvia de cerveza
    g.save(); g.strokeStyle = "#ffb31f"; g.lineWidth = 3; g.lineCap = "round"; g.globalAlpha = Math.min(1, k * 2);
    for (let j = 0; j < 6; j++) {
      const dx = -28 + j * 11.5, ciclo = (t * 2.6 + j * 0.37 + i * 0.13) % 1;
      const yy = y + 12 + ciclo * 46;
      g.globalAlpha = Math.min(1, k * 2) * (1 - ciclo);
      g.beginPath(); g.moveTo(x + dx - 2, yy); g.lineTo(x + dx - 4, yy + 9); g.stroke();
    }
    g.restore();
    g.save(); g.translate(x, y); g.scale(s, s);
    g.drawImage(this.nube, -50, -40, 100, 60);
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    // pantalla del tiempo: mar, cerveza que sube por el mar, tierra
    const gm = g.createLinearGradient(0, 0, 0, H);
    gm.addColorStop(0, "#0b3f8f"); gm.addColorStop(1, "#1565c0");
    g.fillStyle = gm; g.fillRect(-60, -60, W + 120, H + 120);
    const mar = tramo(t, T_MAR, T_MAR + 1.3);
    if (mar > 0) {
      const ny = lerp(H + 20, 18, eInOut(mar));
      g.fillStyle = "rgba(240,165,30,.92)"; g.beginPath(); g.moveTo(-60, H + 60);
      for (let x = -60; x <= W + 60; x += 32) g.lineTo(x, ny + 5 * Math.sin(x * 0.03 + t * 6));
      g.lineTo(W + 60, H + 60); g.closePath(); g.fill();
      g.strokeStyle = "#fffaf0"; g.lineWidth = 10; g.beginPath();
      for (let x = -60; x <= W + 60; x += 32) { const y = ny + 5 * Math.sin(x * 0.03 + t * 6); if (x === -60) g.moveTo(x, y); else g.lineTo(x, y); }
      g.stroke();
    }
    g.drawImage(this.mapa, 0, 0);
    // nubes que llueven cerveza
    for (let i = 0; i < 8; i++) {
      const k = tramo(t, T_NUBE(i), T_NUBE(i) + 0.3), q = this.puntos[i];
      this.dibujarNube(g, q[0], q[1] - 26, k, t, i);
    }
    // rótulos de la tele
    g.save();
    rectR(g, 24, 22, 186, 44, 8); g.fillStyle = "rgba(255,255,255,.92)"; g.fill();
    txt(g, "EL TIEMPO", 117, 56, { tam: 34, peso: 900, fam: FD, color: "#0b3f8f", esp: 2 });
    const parpa = Math.sin(t * 5) > 0 ? 1 : 0.35;
    rectR(g, W - 214, 22, 190, 44, 8); g.fillStyle = "rgba(0,0,0,.35)"; g.fill();
    g.fillStyle = `rgba(255,40,40,${parpa})`; g.beginPath(); g.arc(W - 192, 44, 8, 0, 6.283); g.fill();
    txt(g, "EN DIRECTO", W - 176, 53, { tam: 23, peso: 800, color: "#fff", esp: 1.5, alin: "left" });
    g.restore();
    // él, con la nube suya encima
    pintarAvatar(g, e.m, e.pose, t);
    if (t > T_SUYA) { const q = aPant(e.m, [39, -40]); const k = tramo(t, T_SUYA, T_SUYA + 0.3) * (1 - tramo(t, 8.5, 8.75)); g.save(); g.translate(q[0] + 10, q[1] - 72); g.scale(eBack(k) * 1.8, eBack(k) * 1.8); g.drawImage(this.nube, -50, -40, 100, 60); g.restore(); }
    // láser
    if (e.L && e.mando) {
      const h = aPant(e.m, e.pose._manoD ? [e.pose._manoD[0] + 8, e.pose._manoD[1]] : e.pose.manoD);
      g.save();
      g.strokeStyle = "rgba(255,40,40,.9)"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(h[0], h[1]); g.lineTo(e.L[0], e.L[1]); g.stroke();
      g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.9; g.drawImage(BLOB.rojo, e.L[0] - 16, e.L[1] - 16, 32, 32);
      g.fillStyle = "#fff"; g.beginPath(); g.arc(e.L[0], e.L[1], 3, 0, 6.283); g.fill();
      g.restore();
    }
    this.p.dibujar(g);
    // rótulo de abajo
    if (t > T_ROTULO) {
      const k = eOut(tramo(t, T_ROTULO, T_ROTULO + 0.35)), x0 = lerp(-760, 0, k);
      g.save(); g.translate(x0, 0);
      g.fillStyle = "#d4102a"; g.fillRect(40, 470, 220, 70);
      txt(g, "PREVISIÓN:", 150, 518, { tam: 40, peso: 900, fam: FD, color: "#fff", esp: 2 });
      const gr = g.createLinearGradient(0, 470, 0, 540);
      gr.addColorStop(0, "#fffdf5"); gr.addColorStop(1, "#e3e8ee");
      g.fillStyle = gr; g.fillRect(260, 470, 720, 70);
      txt(g, "100 % CAÑAS", 620, 530, { tam: 68, peso: 900, fam: FD, color: "#0b3f8f", esp: 4, max: 680 });
      g.fillStyle = "#ffd34d"; g.fillRect(40, 540, 940, 6);
      g.restore();
    }
    // tele: encendido y apagado
    tele(g, t, this.dur);
  }
}
/** Encendido y apagado de tele de tubo. */
function tele(g, t, dur) {
  let h, w = W, blanco = 0;
  if (t < 0.5) {
    const a = tramo(t, 0.03, 0.17), b = eOut(tramo(t, 0.17, 0.48));
    w = W * eOut(a); h = 3 + (H - 3) * b; blanco = 1 - b;
  } else if (t > dur - 0.62) {
    const a = eIn(tramo(t, dur - 0.62, dur - 0.36)), b = eIn(tramo(t, dur - 0.36, dur - 0.14));
    h = 3 + (H - 3) * (1 - a); w = W * (1 - b); blanco = a;
    if (t > dur - 0.14) { w = 0; }
  } else return;
  if (t > dur - 0.14) { g.fillStyle = "#000"; g.fillRect(-60, -60, W + 120, H + 120); return; }
  h = Math.max(2, Math.round(h)); w = Math.round(w);
  const y0 = Math.round(H / 2 - h / 2);
  g.fillStyle = "#000";
  g.fillRect(-60, -60, W + 120, y0 + 60); g.fillRect(-60, y0 + h, W + 120, H - y0 - h + 60);
  g.fillRect(-60, y0, (W - w) / 2 + 60, h); g.fillRect((W + w) / 2, y0, (W - w) / 2 + 60, h);
  if (w > 0 && blanco > 0) { g.fillStyle = `rgba(235,245,255,${blanco})`; g.fillRect((W - w) / 2, y0, w, h); }
}
function pintarMapa() {
  const c = lienzoNuevo(W, H), g = c.getContext("2d");
  const forma = (pts) => { g.beginPath(); pts.forEach((q, i) => { const p = pr(q[0], q[1]); if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.closePath(); };
  // sombra
  g.save(); g.translate(6, 8); g.fillStyle = "rgba(0,0,0,.3)"; forma(ESPANA); g.fill(); for (const isla of ISLAS) { forma(isla); g.fill(); } g.restore();
  const gr = g.createLinearGradient(0, MY, 0, MY + 390);
  gr.addColorStop(0, "#69c25a"); gr.addColorStop(0.6, "#43a047"); gr.addColorStop(1, "#c8b45a");
  g.fillStyle = gr; g.strokeStyle = "#e8f5e9"; g.lineWidth = 3; g.lineJoin = "round";
  forma(ESPANA); g.fill(); g.stroke();
  for (const isla of ISLAS) { forma(isla); g.fill(); g.stroke(); }
  // Portugal, apagado
  g.fillStyle = "rgba(255,255,255,.12)";
  g.beginPath();
  [[-8.87, 41.87], [-8.2, 42.1], [-7.9, 41.85], [-7.2, 41.98], [-6.55, 41.95], [-6.3, 41.4], [-6.85, 41.0], [-6.85, 40.25], [-7.0, 39.7], [-7.5, 39.65], [-7.2, 39.2], [-7.0, 38.9], [-7.3, 38.45], [-7.1, 38.2], [-7.25, 38.0], [-7.5, 37.5], [-7.4, 37.2], [-7.9, 37.0], [-8.9, 37.0], [-8.8, 37.9], [-9.5, 38.8], [-9.0, 39.6], [-8.7, 40.5], [-8.87, 41.87]].forEach((q, i) => { const p = pr(q[0], q[1]); if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); });
  g.closePath(); g.fill();
  // recuadro de Canarias
  g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = 2; g.strokeRect(CAN.x, CAN.y, CAN.w, CAN.h);
  g.fillStyle = "#c8b45a";
  for (const [x, y, rx, ry] of CANARIAS) { g.beginPath(); g.ellipse(CAN.x + x, CAN.y + y, rx, ry, 0.3, 0, 6.283); g.fill(); }
  return c;
}
function pintarNube() {
  const c = lienzoNuevo(200, 120), g = c.getContext("2d");
  g.scale(2, 2);
  const bolas = [[28, 38, 16], [46, 28, 20], [66, 32, 16], [78, 42, 12], [18, 46, 10], [50, 46, 18]];
  g.fillStyle = "rgba(0,0,0,.25)";
  for (const [x, y, r] of bolas) { g.beginPath(); g.arc(x + 2, y + 3, r, 0, 6.283); g.fill(); }
  const gr = g.createLinearGradient(0, 8, 0, 60);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(1, "#c9d3df");
  g.fillStyle = gr;
  for (const [x, y, r] of bolas) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
  return c;
}
/** Corbata del presentador. */
function corbata(g) {
  g.save();
  g.fillStyle = "#f2f2f0";
  g.beginPath(); g.moveTo(32, 75); g.lineTo(39, 84); g.lineTo(36, 88); g.lineTo(29, 80); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(46, 75); g.lineTo(39, 84); g.lineTo(42, 88); g.lineTo(49, 80); g.closePath(); g.fill();
  const gr = g.createLinearGradient(33, 0, 45, 0);
  gr.addColorStop(0, "#8f0f1f"); gr.addColorStop(0.5, "#d4223a"); gr.addColorStop(1, "#8f0f1f");
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(36, 80); g.lineTo(42, 80); g.lineTo(41, 86); g.lineTo(37, 86); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(37, 86); g.lineTo(41, 86); g.lineTo(45, 126); g.lineTo(39, 133); g.lineTo(33, 126); g.closePath(); g.fill();
  g.strokeStyle = "rgba(255,255,255,.25)"; g.lineWidth = 1.2;
  for (let y = 92; y < 128; y += 8) { g.beginPath(); g.moveTo(35, y + 4); g.lineTo(43, y - 2); g.stroke(); }
  g.restore();
}

registrar({ id: "00045", nombre: "El hombre del tiempo", crear: () => new HombreTiempo() });
})();
