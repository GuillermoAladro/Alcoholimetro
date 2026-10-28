"use strict";
/*
 * 00160 · CARRERA DE CHAPAS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Sobre la barra, un circuito pintado con tiza lleno de curvas. Guillermo (chapa roja) y Marcos (chapa dorada) las
 * empujan por turnos con el dedo (¡TIC!): Marcos se adelanta, se sale del circuito y tiene que volver; remonta con
 * un tiro enorme y llegan juntos a la meta. ¡CLIC!: la foto de llegada da ganador a Guillermo por un pelo.
 */
(() => {
const ESC = 1.6, AY = 477, XG = 150, XM = 874, BARRA = 290;
const DUR = 10.4, T_YA = 1.0, T_FOTO = 6.35, T_TIT = 7.15, T_APAGA = 9.8;
const PUNTOS = [[160, 545], [300, 532], [405, 478], [418, 398], [500, 345], [630, 348], [690, 428], [755, 515], [865, 528], [935, 462], [958, 392], [962, 352]];
const META_S = 1081;                       // la meta (longitud de recorrido)
// tiros: [t, distancia, lateral final, duración] (lateral: lo que se separa del centro de su calle)
const TIROS = [
  [[1.3, 150], [2.5, 190], [3.6, 200], [4.7, 200], [5.9, 345, null, 0.8]],                    // Guillermo
  [[1.75, 212], [2.95, 170, 92], [4.05, 108, 0], [5.15, 254], [5.95, 328, null, 0.7]],         // Marcos
];
const CALLE = [-17, 17];
const CT = cacheTexto();

// --------------------------------------------------------------------------- el recorrido
const RUTA = (() => {
  const P = PUNTOS, pts = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let k = 0; k < 40; k++) {
      const u = k / 40, u2 = u * u, u3 = u2 * u;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
      pts.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  pts.push(P[P.length - 1]);
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, L, total: L[L.length - 1] };
})();
/** Punto y dirección del recorrido a la distancia s. */
function en(s) {
  const { pts, L } = RUTA;
  s = clamp(s, 0, RUTA.total - 0.01);
  let i = 1;
  while (i < L.length - 1 && L[i] < s) i++;
  const u = (s - L[i - 1]) / Math.max(0.001, L[i] - L[i - 1]);
  const a = pts[i - 1], b = pts[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), tx: (b[0] - a[0]) / d, ty: (b[1] - a[1]) / d };
}
/** Perspectiva: lo del fondo de la barra, más pequeño. */
const pers = (y) => lerp(0.72, 1.12, clamp((y - 330) / 230, 0, 1));

/** Chapa con su borde dentado, vista un poco desde arriba. (x, y) = centro; f = escala. */
function chapa(g, x, y, f, col, letra, gris) {
  const r = 30 * f, ry = 0.58;
  g.save(); g.translate(x, y);
  g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(3 * f, 6 * f, r * 1.05, r * ry, 0, 0, 6.283); g.fill();
  // canto dentado
  g.fillStyle = gris ? "#555" : col[2];
  g.beginPath();
  for (let i = 0; i <= 42; i++) { const a = (i / 42) * 6.283, rr = r * (i % 2 ? 1.0 : 1.09); g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * ry + 4 * f); }
  g.fill();
  g.beginPath();
  for (let i = 0; i <= 42; i++) { const a = (i / 42) * 6.283, rr = r * (i % 2 ? 1.0 : 1.09); g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * ry); }
  g.fillStyle = gris ? "#8a8a8a" : col[1]; g.fill();
  // cara de arriba
  const gr = g.createRadialGradient(-r * 0.3, -r * 0.25, 1, 0, 0, r);
  gr.addColorStop(0, gris ? "#eee" : col[0]); gr.addColorStop(1, gris ? "#999" : col[1]);
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, r * 0.84, r * 0.84 * ry, 0, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 1.5 * f; g.stroke();
  g.scale(1, ry);
  txt(g, letra, 0, 12 * f, { tam: 34 * f, peso: 900, fam: FD, color: gris ? "#333" : "#fffdf5", borde: gris ? null : "rgba(0,0,0,.45)", bordeAncho: 3 });
  g.restore();
}
const COL = [["#ff6b6b", "#d01f2a", "#7a0a10"], ["#fff1a8", "#e0a400", "#7a5400"]];
// piel y manga para las manos que empujan
const PIEL = [["#f6c9ab", "#e4ab8c", "#7a4a34"], ["#ffc79c", "#f2aa7c", "#7d4526"]];

class CarreraChapas extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(300);
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** Distancia recorrida y separación lateral de la chapa q en t. */
  chapaEn(q, t) {
    let s = 0, lat = 0;
    for (const [t0, d, l, du] of TIROS[q]) {
      if (t < t0) break;
      const k = eOut(tramo(t, t0, t0 + (du || 0.65)));
      s += d * k;
      if (l != null) lat = lerp(lat, l, k);
    }
    const P = en(s), f = pers(P.y), o = CALLE[q] * f + lat * f;
    return { x: P.x - P.ty * o, y: P.y + P.tx * o, f, s, tx: P.tx, ty: P.ty, lat };
  }
  /** Quién va delante (para las caras). */
  delante(t) { return this.chapaEn(0, t).s >= this.chapaEn(1, t).s ? 0 : 1; }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0.1, piernaI: [0, 0], piernaD: [0, 0], manoD: [80, 166], brazoI: 0.05 };
    const M = { quien: "marcos", cara: "guino", rc: -0.1, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], brazoI: -0.08 };
    let yG = 0, yM = 0;
    if (t > T_YA && t < T_FOTO) {
      const d = this.delante(t);
      G.cara = d === 0 ? "risa" : "sorpresa"; M.cara = d === 1 ? "risa" : "sorpresa";
      // Marcos se sale
      const c = this.chapaEn(1, t);
      if (c.lat > 25) { M.cara = "sorpresa"; G.cara = "risa"; M.rc = -0.1 + 0.05 * Math.sin(t * 20); }
      if (t > 5.75) { G.cara = "dormido"; M.cara = "dormido"; G.rc = 0.2; M.rc = -0.05; }
      // siguen su chapa con la cabeza
      const cg = this.chapaEn(0, t);
      if (t <= 5.75) { G.rc = clamp((cg.x - 400) / 1600, -0.1, 0.3); M.rc = clamp((c.x - 620) / 1600, -0.3, 0.12); }
    }
    if (t >= T_FOTO) {
      const d = t - T_FOTO;
      G.cara = d < 0.9 ? "sorpresa" : "risa"; M.cara = d < 0.9 ? "sorpresa" : d < 2.2 ? "borracho" : "sonrisa";
      if (d > 0.9) {
        const k = eBack(tramo(d, 0.9, 1.25));
        G.manoD = mezcla([80, 166], [98, 34 + 5 * Math.sin(t * 9)], k);
        G.manoI = mezcla([9, 160], [-22, 34 + 5 * Math.sin(t * 9 + 1)], k);
        yG = -Math.abs(Math.sin(d * 8)) * 14 * (1 - tramo(d, 2.6, 3.0));
        G.rc = 0.06 * Math.sin(d * 6);
        M.rc = -0.14;
      }
    }
    return [{ pose: G, m: matAv(XG, AY + yG, ESC, 0.04) }, { pose: M, m: matAv(XM, AY + yM, ESC, -0.04) }];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("ya", t > T_YA, () => temblar(6, 0.15));
    TIROS.forEach((lista, q) => lista.forEach(([t0], i) => this.una(`t${q}${i}`, t > t0, () => {
      const c = this.chapaEn(q, t0);
      temblar(5, 0.12);
      for (let k = 0; k < 10; k++) { const a = azar(0, 6.283), v = azar(80, 220); p.nueva(P.CHISPA, c.x - c.tx * 20, c.y - c.ty * 20, Math.cos(a) * v, Math.sin(a) * v - 60, azar(0.2, 0.4), azar(5, 8)); }
      for (let k = 0; k < 5; k++) p.nueva(P.POLVO, c.x, c.y + 4, -c.tx * azar(40, 120), -c.ty * azar(40, 120), azar(0.4, 0.7), azar(14, 22));
    })));
    // polvillo de tiza detrás de las chapas
    for (const q of [0, 1]) if (Math.random() < 14 * dt) {
      const c = this.chapaEn(q, t), c2 = this.chapaEn(q, t - 0.05);
      if (Math.hypot(c.x - c2.x, c.y - c2.y) > 2) p.nueva(P.POLVO, c.x, c.y + 3, azar(-20, 20), azar(-20, 0), azar(0.3, 0.6), azar(10, 16));
    }
    this.una("foto", t > T_FOTO, () => { temblar(14, 0.3); });
    this.una("tit", t > T_TIT, () => {
      temblar(16, 0.4);
      for (let k = 0; k < 90; k++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-90, -10), azar(-40, 40), azar(0, 120), azar(2.2, 3.4), azar(9, 15), k % 5);
    });
    p.suelo = () => 590;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  /** La barra con el circuito de tiza (se pinta una vez). */
  barra() {
    if (CT.has("barra")) return CT.get("barra");
    const c = lienzoNuevo(W + 120, H - BARRA + 60), g = c.getContext("2d");
    g.translate(60, -BARRA + 10);
    const gr = g.createLinearGradient(0, BARRA, 0, H);
    gr.addColorStop(0, "#3e2210"); gr.addColorStop(0.4, "#6a3c1b"); gr.addColorStop(1, "#33190a");
    g.fillStyle = gr; g.fillRect(-60, BARRA, W + 120, H - BARRA + 60);
    g.strokeStyle = "rgba(0,0,0,.3)"; g.lineWidth = 3;
    for (let i = -8; i <= 8; i++) { g.beginPath(); g.moveTo(512 + i * 62, BARRA); g.lineTo(512 + i * 200, H + 40); g.stroke(); }
    g.fillStyle = "#9a5f2c"; g.fillRect(-60, BARRA - 4, W + 120, 8);
    g.fillStyle = "rgba(255,225,170,.5)"; g.fillRect(-60, BARRA - 4, W + 120, 2);
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.22;
    g.drawImage(BLOB2.oroClaro, 120, BARRA - 40, 784, 340);
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    // el circuito: dos bordes de tiza y la raya de en medio
    const r = semilla(9);
    const borde = (lado, ancho, alfa, jit) => {
      g.beginPath();
      RUTA.pts.forEach((pp, i) => {
        const P = en(RUTA.L[i]), f = pers(P.y), o = lado * 44 * f;
        const x = pp[0] - P.ty * o + (r() - 0.5) * jit, y = pp[1] + P.tx * o + (r() - 0.5) * jit;
        if (i) g.lineTo(x, y); else g.moveTo(x, y);
      });
      g.strokeStyle = `rgba(245,245,240,${alfa})`; g.lineWidth = ancho; g.lineJoin = "round"; g.stroke();
    };
    for (const lado of [-1, 1]) { borde(lado, 5, 0.75, 1.5); borde(lado, 2, 0.35, 4); }
    g.setLineDash([12, 14]); borde(0, 3, 0.35, 0.5); g.setLineDash([]);
    // salida y meta
    const raya = (s, cuadros) => {
      const P = en(s), f = pers(P.y);
      for (let k = -4; k < 4; k++) for (let j = 0; j < (cuadros ? 2 : 1); j++) {
        const o = (k + 0.5) * 11 * f, a = j * 10 * f;
        g.fillStyle = cuadros ? ((k + j) % 2 ? "rgba(245,245,240,.85)" : "rgba(20,20,20,.7)") : "rgba(245,245,240,.8)";
        g.save(); g.translate(P.x - P.ty * o + P.tx * a, P.y + P.tx * o + P.ty * a); g.rotate(Math.atan2(P.ty, P.tx));
        g.fillRect(-5 * f, -5.5 * f, 10 * f, 11 * f); g.restore();
      }
    };
    raya(18, false); raya(META_S, true);
    g.save(); g.translate(150, 594); g.rotate(-0.04);
    txt(g, "SALIDA", 0, 0, { tam: 30, peso: 800, fam: FD, color: "rgba(245,245,240,.8)", esp: 3 }); g.restore();
    const Pm = en(META_S);
    g.save(); g.translate(Pm.x - 74, Pm.y + 40); g.rotate(-0.1);
    txt(g, "META", 0, 0, { tam: 32, peso: 800, fam: FD, color: "rgba(245,245,240,.85)", esp: 3 }); g.restore();
    // flechas de tiza en las curvas
    for (const s of [330, 640]) {
      const P = en(s); g.save(); g.translate(P.x, P.y); g.rotate(Math.atan2(P.ty, P.tx));
      g.strokeStyle = "rgba(245,245,240,.35)"; g.lineWidth = 3; g.beginPath(); g.moveTo(-12, -9); g.lineTo(0, 0); g.lineTo(-12, 9); g.stroke(); g.restore();
    }
    CT.set("barra", c);
    return c;
  }
  /** Mano que empuja la chapa con el dedo (viene de abajo). */
  mano(g, q, t) {
    for (const [t0] of TIROS[q]) {
      if (t < t0 - 0.26 || t > t0 + 0.24) continue;
      const c = this.chapaEn(q, t0), f = c.f;
      const kIn = eOut(tramo(t, t0 - 0.26, t0 - 0.08)), kOut = eIn(tramo(t, t0 + 0.04, t0 + 0.24));
      const H0 = [c.x - c.tx * 62 * f, c.y - c.ty * 62 * f];
      const lado = q ? 1 : -1, base = [H0[0] + lado * 150, H0[1] + 360];
      const k = kIn * (1 - kOut);
      const Hh = mezcla(base, H0, k);
      const ang = Math.atan2(c.ty, c.tx);
      // antebrazo
      const dx = base[0] - Hh[0], dy = base[1] - Hh[1], L = Math.hypot(dx, dy) || 1, n = [-dy / L, dx / L];
      const w0 = 25 * f, w1 = 36;
      g.beginPath();
      g.moveTo(Hh[0] + n[0] * w0, Hh[1] + n[1] * w0); g.lineTo(base[0] + n[0] * w1, base[1] + n[1] * w1);
      g.lineTo(base[0] - n[0] * w1, base[1] - n[1] * w1); g.lineTo(Hh[0] - n[0] * w0, Hh[1] - n[1] * w0); g.closePath();
      g.fillStyle = q ? PIEL[1][1] : "#2a2a2d"; g.fill(); g.strokeStyle = q ? PIEL[1][2] : "#050506"; g.lineWidth = 3; g.stroke();
      if (!q) { // puño de la camisa
        g.fillStyle = "#3a3a3e"; g.beginPath();
        g.moveTo(Hh[0] + n[0] * (w0 + 3) + (dx / L) * 18, Hh[1] + n[1] * (w0 + 3) + (dy / L) * 18);
        g.lineTo(Hh[0] + n[0] * (w0 + 3) + (dx / L) * 38, Hh[1] + n[1] * (w0 + 3) + (dy / L) * 38);
        g.lineTo(Hh[0] - n[0] * (w0 + 3) + (dx / L) * 38, Hh[1] - n[1] * (w0 + 3) + (dy / L) * 38);
        g.lineTo(Hh[0] - n[0] * (w0 + 3) + (dx / L) * 18, Hh[1] - n[1] * (w0 + 3) + (dy / L) * 18);
        g.closePath(); g.fill(); g.stroke();
      }
      // puño con el índice: doblado antes del tiro, estirado después
      const pl = PIEL[q], est = t > t0 ? 1 : 0.35 + 0.1 * Math.sin(t * 40);
      g.save(); g.translate(Hh[0], Hh[1]); g.rotate(ang); g.scale(f * 1.3, f * 1.3);
      g.lineCap = "round";
      g.strokeStyle = pl[2]; g.lineWidth = 15; g.beginPath(); g.moveTo(8, 4); g.lineTo(8 + 26 * est, 4 + 8 * (1 - est)); g.stroke();
      g.strokeStyle = pl[1]; g.lineWidth = 11; g.stroke();
      rectR(g, -20, -16, 34, 30, 11); g.fillStyle = pl[1]; g.fill(); g.strokeStyle = pl[2]; g.lineWidth = 2.5; g.stroke();
      g.fillStyle = pl[0]; rectR(g, -14, -12, 20, 8, 4); g.fill();
      g.strokeStyle = pl[2]; g.lineWidth = 10; g.beginPath(); g.moveTo(2, -12); g.lineTo(13, -6); g.stroke();
      g.strokeStyle = pl[1]; g.lineWidth = 7; g.stroke();
      g.restore();
    }
  }
  /** La foto de llegada (blanco y negro, con la raya de la meta). Se pinta una vez. */
  foto() {
    if (CT.has("foto")) return CT.get("foto");
    const w = 420, h = 280, c = lienzoNuevo(w, h), g = c.getContext("2d");
    const cg = this.chapaEn(0, T_FOTO), cm = this.chapaEn(1, T_FOTO), Pm = en(META_S);
    const Z = 2.4, cx = (cg.x + cm.x) / 2 + Pm.tx * 4, cy = (cg.y + cm.y) / 2 + Pm.ty * 4, ang = Math.atan2(Pm.ty, Pm.tx);
    // la cámara de la meta: la carrera va de izquierda a derecha y la meta queda vertical
    const M = new DOMMatrix().translate(w / 2, h / 2).scale(Z, Z).rotate((-ang * 180) / Math.PI).translate(-cx, -cy);
    g.fillStyle = "#3b3631"; g.fillRect(0, 0, w, h);
    g.save(); g.setTransform(M); g.drawImage(this.barra(), -60, BARRA - 10); g.restore();
    for (const [q, cc] of [[1, cm], [0, cg]]) {
      const p = M.transformPoint(new DOMPoint(cc.x, cc.y));
      chapa(g, p.x, p.y, cc.f * Z * 0.9, COL[q], q ? "M" : "G", true);
    }
    // la raya de la meta, en rojo, justo en el borde de la chapa de Guillermo
    const pm = M.transformPoint(new DOMPoint(Pm.x, Pm.y));
    g.strokeStyle = "rgba(255,40,40,.95)"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(pm.x, 0); g.lineTo(pm.x, h); g.stroke();
    // virado a sepia
    g.globalCompositeOperation = "color"; g.fillStyle = "#b08a5a"; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = "source-over";
    g.strokeStyle = "rgba(255,60,60,.9)"; g.lineWidth = 3; g.beginPath(); g.moveTo(pm.x, 0); g.lineTo(pm.x, h); g.stroke();
    const v = g.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.7);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.55)");
    g.fillStyle = v; g.fillRect(0, 0, w, h);
    txt(g, "FOTO DE LLEGADA", 14, 26, { tam: 20, peso: 800, color: "#fff4dc", alin: "left", esp: 2 });
    txt(g, "META", pm.x + 8, h - 14, { tam: 18, peso: 900, fam: FD, color: "#ff8080", alin: "left", esp: 2 });
    CT.set("foto", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.25 * a;
    g.drawImage(BLOB2.oroClaro, 260, -40, 504, 380); g.restore();
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    g.drawImage(this.barra(), -60, BARRA - 10);
    // chapas (la de delante en la pantalla, la última)
    const cs = [0, 1].map((q) => this.chapaEn(q, t));
    const orden = cs[0].y > cs[1].y ? [1, 0] : [0, 1];
    for (const q of orden) chapa(g, cs[q].x, cs[q].y, cs[q].f, COL[q], q ? "M" : "G", false);
    this.mano(g, 0, t); this.mano(g, 1, t);
    g.restore();
    this.p.dibujar(g);
    // ¡YA!
    if (t > T_YA - 0.1 && t < T_YA + 0.55) {
      const k = eBack(tramo(t, T_YA - 0.1, T_YA + 0.05));
      g.save(); g.translate(250, 440); g.rotate(-0.1); g.scale(k, k);
      txt(g, "¡YA!", 0, 0, { tam: 70, peso: 400, fam: FC, color: "#fffdf5", borde: "#7a0008", bordeAncho: 10, esp: 3, alfa: a * (1 - tramo(t, T_YA + 0.35, T_YA + 0.55)) });
      g.restore();
    }
    // ¡TIC!
    TIROS.forEach((lista, q) => lista.forEach(([t0]) => {
      const d = t - t0;
      if (d < 0 || d > 0.4) return;
      const c = this.chapaEn(q, t0), k = eBack(tramo(d, 0, 0.08));
      g.save(); g.translate(c.x + (q ? 30 : -30), c.y - 64); g.rotate(q ? 0.14 : -0.14); g.scale(k, k);
      txt(g, "¡TIC!", 0, 0, { tam: 40, peso: 400, fam: FC, color: q ? "#ffd34d" : "#ff8a8a", borde: "#1b1b1b", bordeAncho: 7, esp: 2, alfa: a * (1 - tramo(d, 0.28, 0.4)) });
      g.restore();
    }));
    // ¡UY! cuando se sale la de Marcos
    if (t > 3.25 && t < 3.95) {
      const c = this.chapaEn(1, t);
      g.save(); g.globalAlpha = a * (1 - tramo(t, 3.8, 3.95));
      bocadillo(g, c.x + 40, c.y - 120, "¡FUERA!", c.x + 6, c.y - 30, tramo(t, 3.25, 3.45), 40);
      g.restore();
    }
    // foto de llegada: flash y la foto que se acerca
    const df = t - T_FOTO;
    if (df > 0) {
      if (df < 0.35) { g.fillStyle = `rgba(255,255,255,${0.85 * (1 - df / 0.35) * a})`; g.fillRect(-60, -60, W + 120, H + 120); }
      if (df < 0.7) {
        const k = eBack(tramo(df, 0, 0.1));
        g.save(); g.translate(880, 250); g.rotate(0.12); g.scale(k, k);
        txt(g, "¡CLIC!", 0, 0, { tam: 52, peso: 400, fam: FC, color: "#fffdf5", borde: "#1b1b1b", bordeAncho: 8, esp: 2, alfa: a * (1 - tramo(df, 0.5, 0.7)) });
        g.restore();
      }
      if (df > 0.25) {
        const k = eOut(tramo(df, 0.25, 0.75)), fo = this.foto();
        const x = lerp(900, 512, k), y = lerp(440, 372, k), s = lerp(0.2, 1, k);
        g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(lerp(0.3, -0.035, k)); g.scale(s, s);
        g.fillStyle = "rgba(0,0,0,.5)"; g.fillRect(-fo.width / 2 - 6, -fo.height / 2 + 4, fo.width + 24, fo.height + 64);
        g.fillStyle = "#f4f0e6"; g.fillRect(-fo.width / 2 - 14, -fo.height / 2 - 14, fo.width + 28, fo.height + 64);
        g.drawImage(fo, -fo.width / 2, -fo.height / 2);
        // marca del ganador
        if (df > 0.9) {
          const kk = eBack(tramo(df, 0.9, 1.15));
          g.save(); g.translate(-fo.width / 2 + 70, fo.height / 2 + 26); g.scale(kk, kk);
          txt(g, "1º GUILLERMO · POR UN PELO", 140, 8, { tam: 24, peso: 900, fam: FD, color: "#c8000e", esp: 1.5 });
          g.restore();
        }
        g.restore();
      }
    }
    // ¡A TODA CHAPA!
    if (t > T_TIT) {
      const d = t - T_TIT, k = tramo(d, 0, 0.18), s = lerp(2.4, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a;
      g.translate(512, 92); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has("tit")) return CT.get("tit");
    const c = lienzoNuevo(620, 170), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 140);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.45, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡A TODA CHAPA!", 310, 128, { tam: 108, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 11, esp: 3, glow: "rgba(255,190,40,.85)", glowTam: 22, max: 580 });
    CT.set("tit", c);
    return c;
  }
}

registrar({ id: "00160", nombre: "Carrera de chapas", crear: () => new CarreraChapas() });
})();
