"use strict";
/*
 * Motor común de las animaciones
 *
 * Todo lo que comparten las animaciones del banco y las pantallas fijas: utilidades, textos, temblor de cámara,
 * datos de ejemplo del ranking, partículas, el avatar (esqueleto, caras, pelo dorado, gafas), objetos (lata, jarra,
 * bolsa de litronas, fajo de billetes, trofeo), aura, rayos, rocas, bocadillos y focos.
 * Lienzo de 1024 × 600 (la pantalla de 7"). Sin bibliotecas: JavaScript tal cual, igual en el navegador y en la Pi.
 */

const W = 1024, H = 600;
const FD = '"Big Shoulders Display", "Arial Narrow", Impact, sans-serif';
const FT = '"Archivo", "Helvetica Neue", Arial, sans-serif';
const FC = '"Bangers", Impact, "Arial Black", sans-serif'; // onomatopeyas de cómic
const FB = '"Lilita One", "Arial Rounded MT Bold", "Arial Black", sans-serif'; // letras de espuma

// ------------------------------------------------------------------------------------------- utilidades
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const eOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const eIn = (t) => Math.pow(clamp(t, 0, 1), 3);
const eInOut = (t) => { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eBack = (t) => { t = clamp(t, 0, 1); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const azar = (a, b) => a + Math.random() * (b - a);
const tramo = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const fmt = (v) => v.toFixed(2).replace(".", ",");
function lienzoNuevo(w, h) { const c = document.createElement("canvas"); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; }
function rot2(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; }
function rectR(g, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  g.beginPath(); g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function txt(g, s, x, y, o) {
  let tam = o.tam;
  g.font = `${o.peso || 800} ${tam}px ${o.fam || FT}`;
  if ("letterSpacing" in g) g.letterSpacing = (o.esp || 0) + "px";
  if (o.max) {
    const w = g.measureText(s).width;
    if (w > o.max) { tam = Math.floor(tam * o.max / w); g.font = `${o.peso || 800} ${tam}px ${o.fam || FT}`; }
  }
  g.textAlign = o.alin || "center";
  g.textBaseline = o.base || "alphabetic";
  const a0 = g.globalAlpha;
  if (o.alfa != null) g.globalAlpha = a0 * o.alfa;
  if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = o.glowTam || 20; }
  if (o.borde) { g.lineJoin = "round"; g.lineWidth = o.bordeAncho || 6; g.strokeStyle = o.borde; g.strokeText(s, x, y); }
  g.fillStyle = o.color || "#fff";
  g.fillText(s, x, y);
  g.shadowBlur = 0; g.shadowColor = "transparent"; g.globalAlpha = a0;
  if ("letterSpacing" in g) g.letterSpacing = "0px";
}
/** Las cachés de texto se rehacen cuando llegan las fuentes (antes se pintan con la de reserva). */
const cachesTexto = [];
function cacheTexto() { const m = new Map(); cachesTexto.push(m); return m; }

// ------------------------------------------------------------------------------------------- imágenes del avatar
const IMG = {};
for (const [k, v] of Object.entries(AV)) { const im = new Image(); im.src = v.src; IMG[k] = Object.assign({ im }, v); }
const listo = (k) => IMG[k] && IMG[k].im.complete && IMG[k].im.naturalWidth > 0;
const CARAS = ["risa", "sonrisa", "guino", "sorpresa", "borracho", "dormido"];

// ------------------------------------------------------------------------------------------- cámara (temblor)
const camara = { f: 0, dur: 1, t: 1 };
function temblar(fuerza, dur = 0.5) {
  const queda = camara.f * Math.max(0, 1 - camara.t / camara.dur);
  if (fuerza >= queda) { camara.f = fuerza; camara.dur = dur; camara.t = 0; }
}
function desplazamientoCamara(dt) {
  camara.t += dt;
  const k = 1 - camara.t / camara.dur;
  if (k <= 0) return [0, 0, 0];
  const a = camara.f * k * k;
  return [azar(-a, a), azar(-a, a), azar(-a, a) * 0.0018];
}

// ------------------------------------------------------------------------------------------- datos (simulados)
// En la máquina vendrán del programa (ranking guardado en la tarjeta SD y fotos de la Camera Module 3).
const datos = {
  unidad: "g/L",
  total: 347,
  top: [
    { valor: 2.84, cara: "risa", fecha: "25/10" },
    { valor: 2.41, cara: "guino", fecha: "18/10" },
    { valor: 2.13, cara: "borracho", fecha: "26/10" },
    { valor: 1.97, cara: "sonrisa", fecha: "11/10" },
    { valor: 1.76, cara: "sorpresa", fecha: "19/10" },
    { valor: 1.52, cara: "dormido", fecha: "04/10" },
    { valor: 1.38, cara: "risa", fecha: "12/10" },
    { valor: 1.21, cara: "guino", fecha: "20/10" },
    { valor: 1.05, cara: "sonrisa", fecha: "05/10" },
    { valor: 0.93, cara: "borracho", fecha: "27/10" },
  ],
  prueba: null, // la prueba en curso: { valor, cara, puesto, entraTop }
};

// ------------------------------------------------------------------------------------------- partículas (memoria fija)
function blob(r, g, b) {
  const c = lienzoNuevo(64, 64), x = c.getContext("2d");
  const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${r},${g},${b},1)`);
  gr.addColorStop(0.45, `rgba(${r},${g},${b},.55)`);
  gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  return c;
}
const BLOB = {
  amarillo: blob(255, 236, 140), naranja: blob(255, 140, 30), rojo: blob(225, 45, 12),
  humo: blob(70, 62, 62), blanco: blob(255, 255, 245), verde: blob(43, 255, 91),
};
// tipos: 0 fuego · 1 humo · 2 chispa · 3 gota de cerveza · 4 burbuja · 5 destello
class Particulas {
  constructor(max) {
    this.max = max; this.n = 0;
    const F = Float32Array;
    this.x = new F(max); this.y = new F(max); this.vx = new F(max); this.vy = new F(max);
    this.v = new F(max); this.vm = new F(max); this.s = new F(max); this.tipo = new Uint8Array(max);
    this.campos = [this.x, this.y, this.vx, this.vy, this.v, this.vm, this.s, this.tipo];
  }
  nueva(x, y, vx, vy, vida, tam, tipo) {
    if (this.n >= this.max) return;
    const i = this.n++;
    this.x[i] = x; this.y[i] = y; this.vx[i] = vx; this.vy[i] = vy;
    this.v[i] = vida; this.vm[i] = vida; this.s[i] = tam; this.tipo[i] = tipo;
  }
  quitar(i) { const u = --this.n; if (i !== u) for (const a of this.campos) a[i] = a[u]; }
  actualizar(dt) {
    let i = 0;
    while (i < this.n) {
      this.v[i] -= dt;
      if (this.v[i] <= 0) { this.quitar(i); continue; }
      const t = this.tipo[i];
      if (t === 0) { this.vy[i] -= 70 * dt; this.vx[i] += Math.sin(this.v[i] * 11 + i) * 160 * dt; this.vx[i] *= 1 - 2.5 * dt; }
      else if (t === 1) { this.vy[i] *= 1 - 0.9 * dt; this.vx[i] *= 1 - 0.9 * dt; this.s[i] += 45 * dt; }
      else if (t === 2) { this.vy[i] += 620 * dt; this.vx[i] *= 1 - 1.4 * dt; }
      else if (t === 3) { this.vy[i] += 1100 * dt; }
      else if (t === 4) { this.vx[i] += Math.sin(this.v[i] * 6 + i) * 30 * dt; }
      this.x[i] += this.vx[i] * dt; this.y[i] += this.vy[i] * dt;
      i++;
    }
  }
  dibujar(g) {
    if (!this.n) return;
    g.save();
    for (let i = 0; i < this.n; i++) {
      const t = this.tipo[i], k = this.v[i] / this.vm[i];
      if (t === 1) {
        g.globalAlpha = 0.35 * k; const s = this.s[i];
        g.drawImage(BLOB.humo, this.x[i] - s / 2, this.y[i] - s / 2, s, s);
      } else if (t === 3) {
        g.globalAlpha = Math.min(1, k * 2); g.fillStyle = "#ffb51f";
        g.beginPath(); g.ellipse(this.x[i], this.y[i], this.s[i] * 0.7, this.s[i], 0, 0, 6.283); g.fill();
      } else if (t === 4) {
        g.globalAlpha = Math.min(1, k * 2) * 0.8; g.strokeStyle = "#fff"; g.lineWidth = 2;
        g.beginPath(); g.arc(this.x[i], this.y[i], this.s[i], 0, 6.283); g.stroke();
      }
    }
    g.globalCompositeOperation = "lighter";
    for (let i = 0; i < this.n; i++) {
      const t = this.tipo[i], k = this.v[i] / this.vm[i];
      if (t === 0) {
        const s = this.s[i] * (0.3 + 0.7 * k);
        g.globalAlpha = Math.min(1, k * 1.6) * 0.5;
        g.drawImage(k > 0.62 ? BLOB.amarillo : k > 0.32 ? BLOB.naranja : BLOB.rojo, this.x[i] - s * 0.4, this.y[i] - s, s * 0.8, s * 1.8);
      } else if (t === 2 || t === 5) {
        const s = t === 5 ? this.s[i] * (1.3 - k) : this.s[i] * (0.4 + 0.6 * k);
        g.globalAlpha = t === 5 ? k * 0.7 : Math.min(1, k * 2);
        g.drawImage(t === 5 ? BLOB.blanco : BLOB.amarillo, this.x[i] - s / 2, this.y[i] - s / 2, s, s);
      }
    }
    g.restore();
  }
}

// ------------------------------------------------------------------------------------------- el avatar (piezas)
/*
 * El avatar de frente troceado: torso, brazo izquierdo, brazo derecho en dos partes (para doblar el codo),
 * dos piernas y la cara aparte (cualquiera de las 6 expresiones de la hoja).
 * Coordenadas en "unidades de avatar": el recorte de frente mide 78 × 232 (los pies abajo, en y = 232).
 */
const RIG = {
  hombroI: [10, 86], hombroD: [69, 86], codoD: [70, 121], manoD: [70, 160],
  hombroI2: [9, 86], codoI: [8, 121], manoI: [9, 160], // brazo izquierdo en dos piezas
  caderaI: [27, 146], caderaD: [51, 146], cuello: [39, 72], barbilla: 74, escCara: 0.66,
};
RIG.L1 = Math.hypot(RIG.codoD[0] - RIG.hombroD[0], RIG.codoD[1] - RIG.hombroD[1]);
RIG.L2 = Math.hypot(RIG.manoD[0] - RIG.codoD[0], RIG.manoD[1] - RIG.codoD[1]);
RIG.a1 = Math.atan2(RIG.codoD[1] - RIG.hombroD[1], RIG.codoD[0] - RIG.hombroD[0]);
RIG.a2 = Math.atan2(RIG.manoD[1] - RIG.codoD[1], RIG.manoD[0] - RIG.codoD[0]);
RIG.L1I = Math.hypot(RIG.codoI[0] - RIG.hombroI2[0], RIG.codoI[1] - RIG.hombroI2[1]);
RIG.L2I = Math.hypot(RIG.manoI[0] - RIG.codoI[0], RIG.manoI[1] - RIG.codoI[1]);
RIG.a1I = Math.atan2(RIG.codoI[1] - RIG.hombroI2[1], RIG.codoI[0] - RIG.hombroI2[0]);
RIG.a2I = Math.atan2(RIG.manoI[1] - RIG.codoI[1], RIG.manoI[0] - RIG.codoI[0]);
// puntos de la cara en unidades de avatar
RIG.ojos = [[27.2, 39.7], [50.4, 39.7]];
RIG.frente = [39, 22];
const CAMISA = "#2b2b2c";
// la jarra: el asa en la mano (0, 0), el cuerpo a la derecha
const JARRA = { x0: 3, x1: 31, y0: -18, y1: 18, borde: [17, -18] };

/** Boca en unidades de avatar, con la cabeza girada `rc` alrededor del cuello. */
function boca(rc) {
  const b = [39 - RIG.cuello[0], 55 - RIG.cuello[1]];
  const r = rot2(b, rc);
  return [RIG.cuello[0] + r[0], RIG.cuello[1] + r[1]];
}

/** Cinemática inversa de dos huesos: el codo va hacia abajo y hacia fuera (lado 1 = brazo derecho, -1 = izquierdo). */
function ik(S, T, L1, L2, lado = 1) {
  let dx = T[0] - S[0], dy = T[1] - S[1];
  let d = Math.hypot(dx, dy);
  d = clamp(d, Math.abs(L1 - L2) + 0.01, L1 + L2 - 0.01);
  const a = Math.atan2(dy, dx);
  const b = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  let best = null;
  for (const s of [1, -1]) {
    const u = a + s * b;
    const E = [S[0] + Math.cos(u) * L1, S[1] + Math.sin(u) * L1];
    if (!best || E[1] + 0.3 * lado * E[0] > best.E[1] + 0.3 * lado * best.E[0]) best = { u, E };
  }
  const f = Math.atan2(T[1] - best.E[1], T[0] - best.E[0]);
  return { a1: best.u, E: best.E, a2: f };
}

function pieza(g, k, piv, ang, dx = 0, dy = 0) {
  const p = IMG[k];
  if (!listo(k)) return;
  g.save();
  g.translate(piv[0] + dx, piv[1] + dy);
  if (ang) g.rotate(ang);
  g.drawImage(p.im, p.o[0] - piv[0], p.o[1] - piv[1]);
  g.restore();
}

/**
 * La cara. Extras opcionales en `x`: oro (0–1, pelo dorado), puntas (0–1, el pelo se levanta en punta),
 * gafas (true: gafas de sol puestas). Todo se dibuja en píxeles de la imagen de la cara.
 */
function dibujarCara(g, cara, rc, x = {}, t = 0) {
  const k = "cara_" + cara;
  if (!listo(k)) return;
  const p = IMG[k], e = RIG.escCara, w = p.w * e, h = p.h * e;
  g.save();
  g.translate(RIG.cuello[0], RIG.cuello[1]);
  g.rotate(rc);
  g.translate(-w / 2, RIG.barbilla - RIG.cuello[1] - h);
  g.scale(e, e);
  const oro = x.oro || 0, puntas = x.puntas || 0;
  if (oro > 0.02) {
    // halo dorado detrás de la cabeza
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.55 * oro;
    g.drawImage(BLOB.amarillo, -40, -60, p.w + 80, p.h + 40);
    g.restore();
  }
  if (puntas > 0.02) puntasPelo(g, cara, puntas, oro, t);
  g.drawImage(p.im, 0, 0);
  const ko = "oro_" + cara;
  if (oro > 0.02 && listo(ko)) {
    g.save(); g.globalAlpha = oro; g.drawImage(IMG[ko].im, 0, 0);
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35 * oro * (0.8 + 0.2 * Math.sin(t * 30));
    g.drawImage(IMG[ko].im, 0, 0);
    g.restore();
  }
  if (x.gafas) gafasSol(g, 0, 0, 1);
  g.restore();
}

/** Mechones dorados que se levantan (detrás de la cara). Coordenadas de la imagen de la cara (91 × 120). */
function puntasPelo(g, cara, k, oro, t) {
  const borde = BORDE_PELO[cara] || BORDE_PELO.sonrisa;
  const n = 13;
  for (let i = 0; i < n; i++) {
    const x = 5 + (i * 81) / (n - 1);
    const y = Math.max(0, borde[Math.round(x)] >= 0 ? borde[Math.round(x)] : 20) + 9;
    let dx = (x - 45) * 1.1, dy = y - 78 - 26;
    const L0 = Math.hypot(dx, dy); dx /= L0; dy /= L0;
    const largo = k * (30 + 22 * ((i * 7) % 5) / 4 + (i === 6 ? 18 : 0)) * (1 + 0.1 * Math.sin(t * 24 + i * 1.7));
    const px = -dy, py = dx, a = 9;
    const gr = g.createLinearGradient(x, y, x + dx * largo, y + dy * largo);
    gr.addColorStop(0, oro > 0.5 ? "#f2a100" : "#6b4128");
    gr.addColorStop(1, oro > 0.5 ? "#fff3a0" : "#8a5a3a");
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(x + px * a, y + py * a);
    g.quadraticCurveTo(x + dx * largo * 0.55 + px * a * 0.9, y + dy * largo * 0.55 + py * a * 0.9, x + dx * largo, y + dy * largo);
    g.quadraticCurveTo(x + dx * largo * 0.55 - px * a * 0.9, y + dy * largo * 0.55 - py * a * 0.9, x - px * a, y - py * a);
    g.closePath(); g.fill();
  }
}

/** Gafas de sol en píxeles de la imagen de la cara (ojos en 27,68 y 62,68). `esc` para dibujarlas sueltas. */
function gafasSol(g, ox, oy, esc) {
  g.save();
  g.translate(ox, oy); g.scale(esc, esc);
  g.strokeStyle = "#0b0b0e"; g.lineWidth = 3.2; g.lineCap = "round";
  g.beginPath(); g.moveTo(40, 64); g.quadraticCurveTo(45, 61, 50, 64); g.stroke();
  g.beginPath(); g.moveTo(13, 63); g.lineTo(1, 61); g.moveTo(77, 63); g.lineTo(89, 61); g.stroke();
  for (const cx of [27, 63]) {
    g.beginPath();
    g.moveTo(cx - 15, 60); g.lineTo(cx + 15, 60);
    g.quadraticCurveTo(cx + 16, 76, cx + 3, 78); g.lineTo(cx - 3, 78);
    g.quadraticCurveTo(cx - 16, 76, cx - 15, 60); g.closePath();
    const gr = g.createLinearGradient(0, 58, 0, 80);
    gr.addColorStop(0, "#1c1c24"); gr.addColorStop(1, "#050507");
    g.fillStyle = gr; g.fill();
    g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(cx - 9, 72); g.lineTo(cx - 3, 63); g.stroke();
  }
  g.restore();
}

/** Jarra de cerveza en coordenadas de la mano; `parte`: "asa" (va detrás de la mano) o "cuerpo". */
function dibujarJarra(g, mano, inclinacion, nivel, parte, t) {
  const J = JARRA;
  g.save();
  g.translate(mano[0], mano[1]);
  g.rotate(inclinacion);
  if (parte === "asa") {
    g.strokeStyle = "rgba(225,240,255,.85)"; g.lineWidth = 3.2;
    g.beginPath(); g.moveTo(J.x0 + 1, -10); g.bezierCurveTo(-7, -11, -7, 11, J.x0 + 1, 10); g.stroke();
    g.restore();
    return;
  }
  const w = J.x1 - J.x0, h = J.y1 - J.y0;
  // cristal
  rectR(g, J.x0, J.y0, w, h, 3.5);
  g.fillStyle = "rgba(200,225,255,.18)"; g.fill();
  // cerveza
  const alto = (h - 4) * clamp(nivel, 0, 1);
  if (alto > 0.5) {
    g.save(); rectR(g, J.x0, J.y0, w, h, 3.5); g.clip();
    const gr = g.createLinearGradient(0, J.y1, 0, J.y1 - alto);
    gr.addColorStop(0, "#c46a00"); gr.addColorStop(1, "#ffc21f");
    g.fillStyle = gr; g.fillRect(J.x0, J.y1 - 2 - alto, w, alto + 2);
    // burbujitas
    g.fillStyle = "rgba(255,245,200,.7)";
    for (let i = 0; i < 5; i++) {
      const by = J.y1 - 3 - ((t * 22 + i * 7.3) % Math.max(2, alto - 3));
      g.beginPath(); g.arc(J.x0 + 4 + ((i * 5.1) % (w - 7)), by, 0.9, 0, 6.283); g.fill();
    }
    g.restore();
  }
  // espuma
  if (nivel > 0.04) {
    const ye = J.y1 - 2 - alto;
    g.fillStyle = "#fffaf0";
    g.beginPath();
    g.moveTo(J.x0 - 1, ye + 3);
    for (let i = 0; i <= 4; i++) g.arc(J.x0 + (w / 4) * i, ye - 1, 3.6 + (i % 2) * 1.2, Math.PI, 0);
    g.lineTo(J.x1 + 1, ye + 3); g.closePath(); g.fill();
  }
  // contorno y brillo del cristal
  rectR(g, J.x0, J.y0, w, h, 3.5);
  g.strokeStyle = "rgba(235,245,255,.9)"; g.lineWidth = 1.6; g.stroke();
  g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(J.x0 + 3, J.y0 + 3, 2.2, h - 6);
  g.restore();
}

/**
 * Dibuja el avatar con una pose. Unidades de avatar: el que llama pone la transformación.
 * pose: { cara, rc (giro cabeza), brazoI, piernaI:[dy,ang], piernaD:[dy,ang], mano:[x,y] | null, jarra:{inc, nivel} | null }
 */
function dibujarAvatar(g, pose, t) {
  const pI = pose.piernaI || [0, 0], pD = pose.piernaD || [0, 0];
  // brazo izquierdo: rígido (brazoI = ángulo) o con codo (manoI = punto al que llega la mano)
  let bI = null, manoI = null;
  if (pose.manoI) {
    bI = ik(RIG.hombroI2, pose.manoI, RIG.L1I, RIG.L2I, -1);
    manoI = [bI.E[0] + Math.cos(bI.a2) * RIG.L2I, bI.E[1] + Math.sin(bI.a2) * RIG.L2I];
  }
  const brazoIzq = () => {
    if (!bI) { pieza(g, "brazoI", RIG.hombroI, pose.brazoI || 0); return; }
    if (pose.objI) pose.objI(g, manoI, bI.a2, t);
    pieza(g, "brazoSupI", RIG.hombroI2, bI.a1 - RIG.a1I);
    g.fillStyle = CAMISA;
    g.beginPath(); g.arc(bI.E[0], bI.E[1], 6.2, 0, 6.283); g.fill();
    pieza(g, "antebrazoI", RIG.codoI, bI.a2 - RIG.a2I, bI.E[0] - RIG.codoI[0], bI.E[1] - RIG.codoI[1]);
    if (pose.objI2) pose.objI2(g, manoI, bI.a2, t);
  };
  if (!pose.brazoIDelante) brazoIzq();
  pieza(g, "piernaI", RIG.caderaI, pI[1], 0, pI[0]);
  pieza(g, "piernaD", RIG.caderaD, pD[1], 0, pD[0]);
  // hombros redondeados, por detrás del torso: tapan el hueco cuando el brazo sube
  g.fillStyle = CAMISA;
  g.beginPath(); g.arc(RIG.hombroD[0] - 3, RIG.hombroD[1] + 1, 7, 0, 6.283); g.fill();
  if (bI) { g.beginPath(); g.arc(RIG.hombroI2[0] + 3, RIG.hombroI2[1] + 1, 7, 0, 6.283); g.fill(); }
  pieza(g, "torso", [0, 0], 0);
  dibujarCara(g, pose.cara, pose.rc || 0, pose, t);
  if (pose.brazoIDelante) brazoIzq();
  // brazo derecho (por delante: cruza la cara al beber)
  const T = pose.manoD || pose.mano || RIG.manoD;
  const b = ik(RIG.hombroD, T, RIG.L1, RIG.L2);
  const mano = [b.E[0] + Math.cos(b.a2) * RIG.L2, b.E[1] + Math.sin(b.a2) * RIG.L2];
  if (pose.jarra) dibujarJarra(g, mano, pose.jarra.inc, pose.jarra.nivel, "asa", t);
  if (pose.objD) pose.objD(g, mano, b.a2, t);
  pieza(g, "brazoSup", RIG.hombroD, b.a1 - RIG.a1);
  g.fillStyle = CAMISA;
  g.beginPath(); g.arc(b.E[0], b.E[1], 6.2, 0, 6.283); g.fill();
  pieza(g, "antebrazo", RIG.codoD, b.a2 - RIG.a2, b.E[0] - RIG.codoD[0], b.E[1] - RIG.codoD[1]);
  if (pose.jarra) dibujarJarra(g, mano, pose.jarra.inc, pose.jarra.nivel, "cuerpo", t);
  if (pose.objD2) pose.objD2(g, mano, b.a2, t);
  pose._manoD = mano; pose._manoI = manoI;
  return mano;
}

/** "Foto" de ejemplo (en la máquina será la de la Camera Module 3): el avatar con fondo de bar. */
const cacheFotos = new Map();
function fotoDe(cara) {
  if (cacheFotos.has(cara)) return cacheFotos.get(cara);
  if (!listo("torso") || !listo("cara_" + cara)) return null;
  const S = 300, c = lienzoNuevo(S, S), g = c.getContext("2d");
  let semilla = [...cara].reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7) % 1000;
  const rnd = () => ((semilla = (semilla * 9301 + 49297) % 233280) / 233280);
  const gr = g.createLinearGradient(0, 0, 0, S);
  gr.addColorStop(0, "#2a1435"); gr.addColorStop(1, "#0f0a14");
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
  const cols = ["255,170,60", "255,70,140", "120,190,255", "255,220,120"];
  for (let i = 0; i < 9; i++) {
    const x = rnd() * S, y = rnd() * S * 0.7, r = 20 + rnd() * 45;
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, `rgba(${cols[i % 4]},.55)`); rg.addColorStop(1, `rgba(${cols[i % 4]},0)`);
    g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const esc = S / 104;
  g.save();
  g.translate(S / 2 - 39 * esc, 12 * esc);
  g.scale(esc, esc);
  g.imageSmoothingQuality = "high";
  pieza(g, "brazoI", RIG.hombroI, 0);
  pieza(g, "brazoSup", RIG.hombroD, 0);
  pieza(g, "torso", [0, 0], 0);
  dibujarCara(g, cara, 0);
  g.restore();
  // luz de flash y viñeta
  const v = g.createRadialGradient(S / 2, S * 0.38, S * 0.15, S / 2, S / 2, S * 0.75);
  v.addColorStop(0, "rgba(255,255,255,.08)"); v.addColorStop(1, "rgba(0,0,0,.45)");
  g.fillStyle = v; g.fillRect(0, 0, S, S);
  cacheFotos.set(cara, c);
  return c;
}

/** Polaroid centrada en (cx, cy). */
function polaroid(g, foto, cx, cy, w, rot, pie) {
  const m = w * 0.06, fw = w - 2 * m, h = m + fw + w * 0.2;
  g.save();
  g.translate(cx, cy); g.rotate(rot);
  g.fillStyle = "#f4f0e6"; g.fillRect(-w / 2, -h / 2, w, h);
  if (foto) g.drawImage(foto, -w / 2 + m, -h / 2 + m, fw, fw);
  else { g.fillStyle = "#222"; g.fillRect(-w / 2 + m, -h / 2 + m, fw, fw); }
  if (pie) pie(g, -w / 2, -h / 2 + m + fw, w, h - m - fw);
  g.restore();
  return h;
}

const cachePegatina = cacheTexto();
function pegatinaTop10() {
  if (cachePegatina.has(1)) return cachePegatina.get(1);
  const c = lienzoNuevo(280, 124), g = c.getContext("2d");
  g.translate(12, 12);
  g.shadowColor = "rgba(0,0,0,.55)"; g.shadowBlur = 10; g.shadowOffsetY = 4;
  rectR(g, 0, 0, 256, 100, 22); g.fillStyle = "#ffffff"; g.fill();
  g.shadowColor = "transparent"; g.shadowBlur = 0; g.shadowOffsetY = 0;
  rectR(g, 7, 7, 242, 86, 16);
  const gr = g.createLinearGradient(0, 7, 0, 93);
  gr.addColorStop(0, "#ff3a3a"); gr.addColorStop(1, "#c8000e");
  g.fillStyle = gr; g.fill();
  txt(g, "TOP 10", 128, 78, { tam: 82, peso: 900, fam: FD, color: "#fff", borde: "#7a0008", bordeAncho: 5, esp: 2 });
  g.fillStyle = "rgba(255,255,255,.22)";
  rectR(g, 16, 12, 224, 22, 11); g.fill();
  cachePegatina.set(1, c);
  return c;
}

// ==================================================================================================== escenas
/*
 * Cada escena: actualizar(dt), dibujar(g), t (segundos), dur, terminada.
 * Pintan su propio fondo un poco más grande que la pantalla (para que el temblor no deje bordes).
 */
function fondo(g, color) { g.fillStyle = color; g.fillRect(-60, -60, W + 120, H + 120); }

function estrella(g, cx, cy, R, r, rot) {
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = rot - Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r : R;
    g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  g.closePath();
}

// ---------------------------------------------------------------------------- herramientas comunes
const PIES = 575; // altura del suelo en la pantalla
const mezcla = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const eElastico = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.pow(2, -9 * u) * Math.cos(u * 14));
function semilla(n) { let s = n; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }

/** Matriz del avatar: (x, y) en pantalla es el punto `piv` del avatar (por defecto los pies). */
function matAv(x, y, esc, giro = 0, sx = 1, sy = 1, piv = [39, 232]) {
  return new DOMMatrix().translate(x, y).rotate((giro * 180) / Math.PI).scale(esc * sx, esc * sy).translate(-piv[0], -piv[1]);
}
function conMat(g, m, f) { g.save(); g.transform(m.a, m.b, m.c, m.d, m.e, m.f); f(); g.restore(); }
function aPant(m, p) { const q = m.transformPoint(new DOMPoint(p[0], p[1])); return [q.x, q.y]; }
function pintarAvatar(g, m, pose, t) { conMat(g, m, () => { g.imageSmoothingQuality = "high"; dibujarAvatar(g, pose, t); }); }
/** Piernas y bote al andar. */
function andar(fase, f = 1) {
  const p = Math.sin(fase);
  return { piernaI: [-Math.max(0, p) * 9 * f, 0.09 * p * f], piernaD: [-Math.max(0, -p) * 9 * f, 0.09 * p * f], bote: -Math.abs(p) * 7 * f };
}

class Escena {
  constructor(dur) { this.t = 0; this.dur = dur; this._hecho = new Set(); }
  get terminada() { return this.t >= this.dur; }
  una(k, cond, f) { if (cond && !this._hecho.has(k)) { this._hecho.add(k); f(); } }
}

/** Bocadillo de cómic que aparece con rebote. */
function bocadillo(g, cx, cy, texto, px, py, k, tam = 34) {
  if (k <= 0) return;
  g.save();
  g.font = `${tam}px ${FC}`;
  if ("letterSpacing" in g) g.letterSpacing = "1px";
  const w = g.measureText(texto).width + 40, h = tam + 26;
  const s = eBack(k);
  g.translate(cx, cy); g.scale(s, s); g.translate(-cx, -cy);
  g.fillStyle = "#fffdf5"; g.strokeStyle = "#111"; g.lineWidth = 4; g.lineJoin = "round";
  rectR(g, cx - w / 2, cy - h / 2, w, h, 18);
  g.fill(); g.stroke();
  const bx = clamp(px, cx - w / 2 + 26, cx + w / 2 - 26);
  g.beginPath(); g.moveTo(bx - 14, cy + h / 2 - 2); g.lineTo(px, py); g.lineTo(bx + 14, cy + h / 2 - 2); g.closePath();
  g.fill(); g.stroke();
  g.fillRect(bx - 12, cy + h / 2 - 6, 24, 6);
  if ("letterSpacing" in g) g.letterSpacing = "0px";
  txt(g, texto, cx, cy + tam * 0.36, { tam, peso: 400, fam: FC, color: "#111", esp: 1 });
  g.restore();
}

/** Estrellita de brillo de cuatro puntas. */
function brillo(g, x, y, r, a) {
  if (a <= 0) return;
  g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = a;
  g.fillStyle = "#fffbe0";
  g.beginPath();
  g.moveTo(x, y - r); g.quadraticCurveTo(x, y, x + r * 0.32, y); g.quadraticCurveTo(x, y, x, y + r);
  g.quadraticCurveTo(x, y, x - r * 0.32, y); g.quadraticCurveTo(x, y, x, y - r); g.fill();
  g.beginPath();
  g.moveTo(x - r * 0.7, y); g.quadraticCurveTo(x, y, x, y - r * 0.22); g.quadraticCurveTo(x, y, x + r * 0.7, y);
  g.quadraticCurveTo(x, y, x, y + r * 0.22); g.quadraticCurveTo(x, y, x - r * 0.7, y); g.fill();
  g.drawImage(BLOB.blanco, x - r * 0.6, y - r * 0.6, r * 1.2, r * 1.2);
  g.restore();
}

/** Foco de teatro que cae desde arriba sobre el punto (x, suelo). */
function foco(g, xArriba, x, suelo, ancho, a) {
  if (a <= 0) return;
  g.save(); g.globalCompositeOperation = "lighter";
  const gr = g.createLinearGradient(0, -20, 0, suelo);
  gr.addColorStop(0, `rgba(255,250,230,${0.2 * a})`); gr.addColorStop(1, `rgba(255,250,230,${0.07 * a})`);
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(xArriba - 30, -20); g.lineTo(xArriba + 30, -20); g.lineTo(x + ancho, suelo); g.lineTo(x - ancho, suelo); g.closePath(); g.fill();
  g.globalAlpha *= 0.5 * a;
  g.drawImage(BLOB.blanco, x - ancho * 1.1, suelo - 30, ancho * 2.2, 60);
  g.restore();
}

/** Texto con relieve (como las letras de BEBE): el grito de El reto y los números de los puestos. */
function sprite3D(texto, tam, esq) {
  const med = lienzoNuevo(1, 1).getContext("2d");
  med.font = `900 ${tam}px ${FD}`;
  const mt = med.measureText(texto), asc = mt.actualBoundingBoxAscent || tam * 0.72, prof = Math.round(tam * 0.075), pad = 12;
  const c = lienzoNuevo(mt.width + prof + pad * 2, asc + prof + pad * 2), g = c.getContext("2d");
  g.font = `900 ${tam}px ${FD}`; g.textBaseline = "alphabetic"; g.textAlign = "left";
  const y = pad + asc;
  g.fillStyle = esq.lado;
  for (let k = prof; k > 0; k--) g.fillText(texto, pad + k * 0.8, y + k);
  g.lineJoin = "round"; g.lineWidth = tam * 0.05; g.strokeStyle = esq.borde; g.strokeText(texto, pad, y);
  g.fillStyle = esq.cara; g.fillText(texto, pad, y);
  return c;
}

// ---------------------------------------------------------------------------- partículas nuevas (memoria fija)
function burbujaEspuma() {
  const c = lienzoNuevo(48, 48), g = c.getContext("2d");
  const gr = g.createRadialGradient(18, 16, 2, 24, 24, 23);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.7, "#fbf6e6"); gr.addColorStop(1, "#d9ccaa");
  g.fillStyle = gr; g.beginPath(); g.arc(24, 24, 22, 0, 6.283); g.fill();
  return c;
}
function spriteBillete() {
  const c = lienzoNuevo(68, 34), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 68, 34);
  gr.addColorStop(0, "#b6e3a8"); gr.addColorStop(1, "#5fae59");
  g.fillStyle = gr; rectR(g, 1, 1, 66, 32, 3); g.fill();
  g.strokeStyle = "#2c6a2e"; g.lineWidth = 2; g.stroke();
  g.strokeStyle = "rgba(44,106,46,.5)"; g.lineWidth = 1; rectR(g, 5, 5, 58, 24, 2); g.stroke();
  g.fillStyle = "rgba(44,106,46,.35)"; g.beginPath(); g.arc(34, 17, 8, 0, 6.283); g.fill();
  txt(g, "50", 13, 23, { tam: 15, peso: 900, fam: FD, color: "#1f4f21" });
  txt(g, "50", 55, 23, { tam: 15, peso: 900, fam: FD, color: "#1f4f21" });
  return c;
}
const BLOB2 = {
  oro: blob(255, 196, 40), oroClaro: blob(255, 248, 200), cian: blob(150, 230, 255),
  polvo: blob(140, 122, 100), vapor: blob(232, 232, 238), gota: blob(255, 170, 30),
};
const SPR = { espuma: burbujaEspuma(), billete: spriteBillete() };
const CONFETI = ["#2bff5b", "#ffd34d", "#ffffff", "#ff3d84", "#2fe3e8"];
const P = { LLAMA: 0, HUMO: 1, CHISPA: 2, DESTELLO: 3, POLVO: 4, BILLETE: 5, ESPUMA: 6, CONFETI: 7, ELECTRICA: 8, VAPOR: 9, PURPURINA: 10, GOTA: 11 };
class Parts {
  constructor(max) {
    this.max = max; this.n = 0; this.alfa = 1;
    const F = Float32Array;
    this.x = new F(max); this.y = new F(max); this.vx = new F(max); this.vy = new F(max); this.v = new F(max); this.vm = new F(max);
    this.s = new F(max); this.r = new F(max); this.vr = new F(max); this.tipo = new Uint8Array(max); this.c = new Uint8Array(max);
    this.campos = [this.x, this.y, this.vx, this.vy, this.v, this.vm, this.s, this.r, this.vr, this.tipo, this.c];
    this.suelo = () => 1e9; // dónde se posan los billetes y el confeti
  }
  nueva(tipo, x, y, vx, vy, vida, tam, c = 0) {
    if (this.n >= this.max) return;
    const i = this.n++;
    this.x[i] = x; this.y[i] = y; this.vx[i] = vx; this.vy[i] = vy; this.v[i] = vida; this.vm[i] = vida;
    this.s[i] = tam; this.r[i] = Math.random() * 6.283; this.vr[i] = azar(-9, 9); this.tipo[i] = tipo; this.c[i] = c;
  }
  quitar(i) { const u = --this.n; if (i !== u) for (const a of this.campos) a[i] = a[u]; }
  actualizar(dt) {
    let i = 0;
    while (i < this.n) {
      this.v[i] -= dt;
      if (this.v[i] <= 0) { this.quitar(i); continue; }
      const t = this.tipo[i];
      switch (t) {
        case P.LLAMA: this.vy[i] -= 500 * dt; this.vx[i] *= 1 - 3 * dt; break;
        case P.HUMO: this.vx[i] *= 1 - 1.3 * dt; this.vy[i] *= 1 - 1.3 * dt; this.s[i] += 60 * dt; break;
        case P.CHISPA: this.vy[i] += 700 * dt; this.vx[i] *= 1 - 1.2 * dt; break;
        case P.POLVO: this.vx[i] *= 1 - 2.6 * dt; this.vy[i] *= 1 - 2.6 * dt; this.s[i] += 70 * dt; break;
        case P.BILLETE: case P.CONFETI: {
          const suelo = this.suelo(this.x[i]);
          if (this.y[i] >= suelo) { this.y[i] = suelo; this.vy[i] = 0; this.vx[i] *= 1 - 6 * dt; this.vr[i] *= 1 - 6 * dt; break; }
          this.vy[i] = Math.min(this.vy[i] + 520 * dt, t === P.BILLETE ? 85 : 150);
          this.vx[i] += Math.sin(this.v[i] * 3.1 + i) * (t === P.BILLETE ? 160 : 70) * dt; this.vx[i] *= 1 - 1.4 * dt;
          this.r[i] += this.vr[i] * dt; break;
        }
        case P.ESPUMA: this.vy[i] += 260 * dt; this.vx[i] *= 1 - 1.6 * dt; this.vy[i] *= 1 - 0.8 * dt; break;
        case P.ELECTRICA: this.vx[i] *= 1 - 5 * dt; this.vy[i] *= 1 - 5 * dt; break;
        case P.VAPOR: this.vy[i] -= 40 * dt; this.vx[i] *= 1 - dt; this.s[i] += 45 * dt; break;
        case P.PURPURINA: this.vy[i] = Math.min(this.vy[i] + 60 * dt, 90); this.vx[i] += Math.sin(this.v[i] * 4 + i) * 25 * dt; break;
        case P.GOTA: this.vy[i] += 1300 * dt; break;
      }
      this.x[i] += this.vx[i] * dt; this.y[i] += this.vy[i] * dt;
      i++;
    }
  }
  dibujar(g) {
    if (!this.n) return;
    const A = this.alfa;
    if (A <= 0) return;
    g.save();
    for (let i = 0; i < this.n; i++) {
      const t = this.tipo[i], k = this.v[i] / this.vm[i], s = this.s[i];
      if (t === P.HUMO || t === P.POLVO || t === P.VAPOR) {
        g.globalAlpha = A * (t === P.VAPOR ? 0.4 : t === P.POLVO ? 0.55 : 0.35) * Math.min(1, k * 1.5);
        g.drawImage(t === P.VAPOR ? BLOB2.vapor : t === P.POLVO ? BLOB2.polvo : BLOB.humo, this.x[i] - s / 2, this.y[i] - s / 2, s, s);
      } else if (t === P.ESPUMA) {
        g.globalAlpha = A * Math.min(1, k * 3);
        const r = s * (0.5 + 0.5 * k);
        g.drawImage(SPR.espuma, this.x[i] - r, this.y[i] - r, r * 2, r * 2);
      } else if (t === P.BILLETE || t === P.CONFETI) {
        g.globalAlpha = A * Math.min(1, k * 3);
        const c = Math.cos(this.r[i]), sn = Math.sin(this.r[i] * 0.7);
        g.save(); g.translate(this.x[i], this.y[i]); g.rotate(sn * 0.9); g.scale(Math.max(0.12, Math.abs(c)), 1);
        if (t === P.BILLETE) g.drawImage(SPR.billete, -s / 2, -s / 4, s, s / 2);
        else { g.fillStyle = CONFETI[this.c[i] % CONFETI.length]; g.fillRect(-s / 2, -s * 0.3, s, s * 0.6); }
        g.restore();
      } else if (t === P.GOTA) {
        g.globalAlpha = A * Math.min(1, k * 2); g.fillStyle = "#ffb51f";
        g.beginPath(); g.ellipse(this.x[i], this.y[i], s * 0.6, s, 0, 0, 6.283); g.fill();
      }
    }
    g.globalCompositeOperation = "lighter";
    for (let i = 0; i < this.n; i++) {
      const t = this.tipo[i], k = this.v[i] / this.vm[i], s = this.s[i];
      if (t === P.LLAMA) {
        const ss = s * (0.35 + 0.65 * k);
        g.globalAlpha = A * Math.min(1, k * 2) * 0.45;
        g.drawImage(this.c[i] ? BLOB2.oroClaro : BLOB2.oro, this.x[i] - ss * 0.32, this.y[i] - ss, ss * 0.64, ss * 2);
      } else if (t === P.CHISPA || t === P.DESTELLO || t === P.ELECTRICA || t === P.PURPURINA) {
        const ss = t === P.DESTELLO ? s * (1.3 - k) : t === P.PURPURINA ? s * (0.6 + 0.4 * Math.abs(Math.sin(this.v[i] * 9 + i))) : s * (0.4 + 0.6 * k);
        g.globalAlpha = A * (t === P.DESTELLO ? k * 0.75 : Math.min(1, k * 2));
        g.drawImage(t === P.ELECTRICA ? BLOB2.cian : t === P.DESTELLO ? BLOB.blanco : t === P.PURPURINA ? BLOB2.oroClaro : BLOB.amarillo, this.x[i] - ss / 2, this.y[i] - ss / 2, ss, ss);
      }
    }
    g.restore();
  }
}

// ---------------------------------------------------------------------------- objetos (en unidades de avatar)
/** Lata de cerveza centrada en (x, y). aplast: 0–1 (aplastada); abierta: con la anilla quitada. */
function dibujarLata(g, x, y, ang, o = {}) {
  const k = o.aplast || 0, e = o.esc || 1, bulto = o.bulto || 0;
  const w = 13 * (1 + 0.3 * k + bulto), h = 24 * (1 - 0.55 * k);
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(e, e);
  const gr = g.createLinearGradient(-w / 2, 0, w / 2, 0);
  gr.addColorStop(0, "#0a4a20"); gr.addColorStop(0.32, "#22b653"); gr.addColorStop(0.52, "#8dffab"); gr.addColorStop(0.72, "#179440"); gr.addColorStop(1, "#073a19");
  g.fillStyle = gr;
  g.beginPath();
  if (k > 0.01) {
    const n = 6;
    g.moveTo(-w / 2 + 1, -h / 2); g.lineTo(w / 2 - 1, -h / 2);
    for (let i = 1; i < n; i++) g.lineTo(w / 2 + (i % 2 ? 2.6 : -1.8) * k, -h / 2 + (h * i) / n);
    g.lineTo(w / 2 - 1, h / 2); g.lineTo(-w / 2 + 1, h / 2);
    for (let i = n - 1; i >= 1; i--) g.lineTo(-w / 2 - (i % 2 ? 2.6 : -1.8) * k, -h / 2 + (h * i) / n);
    g.closePath(); g.fill();
    g.strokeStyle = `rgba(0,0,0,${0.45 * k})`; g.lineWidth = 0.9;
    g.beginPath();
    for (let i = 1; i < n; i++) { const yy = -h / 2 + (h * i) / n; g.moveTo(-w / 2, yy); g.lineTo(w / 2, yy + (i % 2 ? 2 : -2) * k); }
    g.stroke();
  } else {
    rectR(g, -w / 2, -h / 2, w, h, 2.5); g.fill();
    // franja blanca con una estrella dorada
    g.fillStyle = "rgba(255,255,255,.92)"; g.fillRect(-w / 2 + 0.4, -2.6, w - 0.8, 5.2);
    g.fillStyle = "#e7a900"; g.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 1.1 : 2.4; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    g.closePath(); g.fill();
  }
  g.fillStyle = "#d3d8dd"; rectR(g, -w / 2 + 0.6, -h / 2 - 1.6, w - 1.2, 3.2, 1.4); g.fill();
  g.fillStyle = "#99a2aa"; rectR(g, -w / 2 + 1, h / 2 - 1.4, w - 2, 2.6, 1.2); g.fill();
  if (o.abierta) { g.fillStyle = "#1a1a1a"; g.beginPath(); g.ellipse(1.6, -h / 2 - 0.2, 2.3, 0.9, 0, 0, 6.283); g.fill(); }
  g.fillStyle = "rgba(255,255,255,.4)"; g.fillRect(-w * 0.2, -h / 2 + 2.2, 1.5, h - 4.4);
  g.restore();
}
const LATA_W = 14, LATA_H = 24;
let _sprLata = null;
function spriteLata() {
  if (_sprLata) return _sprLata;
  const c = lienzoNuevo(LATA_W * 3, (LATA_H + 4) * 3), g = c.getContext("2d");
  g.scale(3, 3);
  dibujarLata(g, LATA_W / 2, (LATA_H + 4) / 2, 0, { esc: LATA_W / 13.2 });
  return (_sprLata = c);
}
function lataSuelta(g, x, y, ang, esc = 1) {
  const s = spriteLata();
  g.save(); g.translate(x, y); if (ang) g.rotate(ang);
  g.drawImage(s, (-LATA_W / 2) * esc, (-(LATA_H + 4) / 2) * esc, LATA_W * esc, (LATA_H + 4) * esc);
  g.restore();
}

/** Bolsa de plástico con litronas; (x, y) = las asas. */
function dibujarBolsa(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  for (const [bx, alto] of [[-8, 17], [1, 23], [9, 15]]) {
    g.fillStyle = "#4a2a0c"; rectR(g, bx - 2.7, 13 - alto, 5.4, alto + 4, 1.6); g.fill();
    g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(bx - 1.6, 14 - alto, 1, alto);
    g.fillStyle = "#f2c230"; rectR(g, bx - 3.2, 11 - alto, 6.4, 3.4, 1); g.fill();
  }
  g.strokeStyle = "rgba(236,240,242,.95)"; g.lineWidth = 2.3;
  g.beginPath(); g.moveTo(-12, 14); g.quadraticCurveTo(-7, -2, 0, 0); g.quadraticCurveTo(7, -2, 12, 14); g.stroke();
  g.beginPath(); g.moveTo(-15, 12); g.lineTo(15, 12); g.lineTo(19, 52); g.quadraticCurveTo(0, 57, -19, 52); g.closePath();
  const gr = g.createLinearGradient(-19, 0, 19, 0);
  gr.addColorStop(0, "#c9cfd2"); gr.addColorStop(0.4, "#f7f9fa"); gr.addColorStop(1, "#b9c0c4");
  g.fillStyle = gr; g.fill();
  g.fillStyle = "rgba(90,50,12,.22)";
  for (const bx of [-8, 1, 9]) g.fillRect(bx - 4.5, 16, 9, 34);
  g.strokeStyle = "rgba(0,0,0,.18)"; g.lineWidth = 0.8;
  g.beginPath(); g.moveTo(-6, 14); g.lineTo(-9, 50); g.moveTo(7, 14); g.lineTo(10, 50); g.stroke();
  txt(g, "24H", 0, 40, { tam: 12, peso: 900, fam: FD, color: "#e3262f" });
  g.restore();
}

/** Fajo de billetes con su faja. */
function dibujarFajo(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  for (let i = 4; i >= 0; i--) {
    g.fillStyle = i ? "#4f9a4c" : "#9edb95";
    rectR(g, -13 + i * 0.3, -8 + i * 1.4, 26, 13, 1.6); g.fill();
  }
  g.strokeStyle = "#2c6a2e"; g.lineWidth = 0.8; rectR(g, -13, -8, 26, 13, 1.6); g.stroke();
  txt(g, "50", -7, 1.5, { tam: 6, peso: 900, fam: FD, color: "#1f4f21" });
  g.fillStyle = "#f3e7c9"; g.fillRect(-3, -8.5, 6, 20);
  g.restore();
}

/** Trofeo con cerveza; (x, y) = la mano en el pie de la copa. */
function dibujarTrofeo(g, x, y, ang, t) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const gr = g.createLinearGradient(-16, 0, 16, 0);
  gr.addColorStop(0, "#7a4d00"); gr.addColorStop(0.3, "#e0a400"); gr.addColorStop(0.5, "#fff2a8"); gr.addColorStop(0.7, "#ffcc33"); gr.addColorStop(1, "#6e4300");
  g.strokeStyle = "#d9a100"; g.lineWidth = 3.2;
  g.beginPath(); g.ellipse(-16, -26, 6, 8, 0, Math.PI * 0.5, Math.PI * 1.5); g.stroke();
  g.beginPath(); g.ellipse(16, -26, 6, 8, 0, -Math.PI * 0.5, Math.PI * 0.5); g.stroke();
  g.fillStyle = "#ffbf1f"; g.beginPath(); g.ellipse(0, -38, 15.5, 3.4, 0, 0, 6.283); g.fill();
  g.fillStyle = "#fffaf0";
  g.beginPath(); g.moveTo(-15, -38);
  for (let i = 0; i <= 5; i++) g.arc(-15 + i * 6, -40 - (i % 2) * 1.5, 3.8 + (i % 2), Math.PI, 0);
  g.lineTo(15, -37); g.closePath(); g.fill();
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(-16, -38); g.lineTo(16, -38); g.quadraticCurveTo(15, -12, 4, -8); g.lineTo(-4, -8); g.quadraticCurveTo(-15, -12, -16, -38); g.fill();
  g.fillRect(-2.6, -9, 5.2, 13);
  g.fillStyle = "#b07d00"; rectR(g, -11, 4, 22, 5, 1.5); g.fill();
  g.fillStyle = gr; rectR(g, -13, 8, 26, 6, 1.5); g.fill();
  g.fillStyle = "rgba(255,255,255,.55)"; g.fillRect(-9, -34, 2.2, 20);
  g.restore();
}

// ---------------------------------------------------------------------------- aura de ki, rayos y rocas
/** Aura en forma de llama alrededor del cuerpo. (cx, cy) centro del cuerpo; k intensidad 0–1. */
function dibujarAura(g, cx, cy, ancho, alto, k, t) {
  if (k <= 0.01) return;
  g.save(); g.globalCompositeOperation = "lighter";
  g.globalAlpha = 0.5 * k;
  g.drawImage(BLOB2.oro, cx - ancho * 1.4, cy - alto * 1.0, ancho * 2.8, alto * 2.0);
  const capas = [[1.0, "255,186,30", 0.85], [0.8, "255,226,110", 0.75], [0.58, "255,252,215", 0.6]];
  for (const [esc, col, a] of capas) {
    const rx = ancho * 0.9 * esc, ry = alto * 0.6 * esc;
    g.beginPath();
    const N = 64;
    for (let i = 0; i <= N; i++) {
      const ang = (i / N) * Math.PI * 2, s = Math.sin(ang), c = Math.cos(ang);
      const arriba = Math.max(0, -s);
      const lengua = Math.pow(Math.abs(Math.sin(ang * 6 + t * 11 + esc * 5)), 4) * (0.55 + 0.25 * Math.sin(t * 17 + i)) * arriba * arriba;
      const temblor = 0.04 * Math.sin(ang * 11 - t * 26 + esc * 2);
      const x = cx + c * rx * (1 + temblor) * (1 - arriba * 0.25);
      const y = cy + 0.1 * alto + s * ry * (1 + temblor + arriba * 0.3) - lengua * ry * 0.9;
      if (i) g.lineTo(x, y); else g.moveTo(x, y);
    }
    g.closePath();
    const gr = g.createRadialGradient(cx, cy + alto * 0.15, Math.min(rx, ry) * 0.25, cx, cy, Math.max(rx, ry) * 1.35);
    gr.addColorStop(0, `rgba(${col},0)`); gr.addColorStop(0.6, `rgba(${col},${0.18 * k})`); gr.addColorStop(1, `rgba(${col},${0.65 * k})`);
    g.globalAlpha = a; g.fillStyle = gr; g.fill();
    g.lineWidth = 2.5; g.strokeStyle = `rgba(${col},${0.7 * k})`; g.stroke();
  }
  g.restore();
}
function nuevoRayo(cx, cy, ancho, alto) {
  const pts = [];
  let x = cx + azar(-ancho, ancho) * 0.8, y = cy + azar(-alto, alto) * 0.5;
  const n = 6 + ((Math.random() * 4) | 0), ang = azar(0, 6.283), paso = azar(10, 18);
  for (let i = 0; i < n; i++) {
    pts.push([x, y]);
    x += Math.cos(ang) * paso + azar(-12, 12); y += Math.sin(ang) * paso + azar(-12, 12);
  }
  return { pts, vida: azar(0.05, 0.11) };
}
function dibujarRayos(g, rayos) {
  if (!rayos.length) return;
  g.save(); g.globalCompositeOperation = "lighter"; g.lineJoin = "round"; g.lineCap = "round";
  for (const r of rayos) {
    for (const [ancho, col] of [[7, "rgba(110,210,255,.35)"], [2.2, "rgba(240,252,255,.95)"]]) {
      g.lineWidth = ancho; g.strokeStyle = col; g.beginPath();
      r.pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
      g.stroke();
    }
  }
  g.restore();
}
function nuevaRoca(x) {
  const r = azar(6, 19), n = 6 + ((Math.random() * 3) | 0), pts = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * 6.283, rr = r * azar(0.65, 1.1); pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
  return { x, y: PIES - r * 0.5, vx: 0, vy: 0, sube: azar(25, 75), rot: azar(0, 6), vr: azar(-1.5, 1.5), pts, r, fase: azar(0, 6), suelta: false };
}
function dibujarRoca(g, o, luz) {
  g.save(); g.translate(o.x, o.y); g.rotate(o.rot);
  g.beginPath(); o.pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath();
  const gr = g.createLinearGradient(0, -o.r, 0, o.r);
  gr.addColorStop(0, "#6a5a48"); gr.addColorStop(1, "#2a231c");
  g.fillStyle = gr; g.fill();
  g.strokeStyle = `rgba(255,205,70,${0.25 + 0.5 * luz})`; g.lineWidth = 1.6; g.stroke();
  g.restore();
}

let _mon = null;
/** Dónde va cada lata de los monumentos (los usan Monumentos de latas y El eructo). Centros de las latas. */
function monumentos() {
  if (_mon) return _mon;
  const latas = [], mons = [], paso = LATA_W + 1;
  let n0 = 0;
  const cerrar = (nombre, x, top) => { mons.push({ nombre, x, top, n: latas.length - n0, de: n0 }); n0 = latas.length; };
  for (let r = 0; r < 10; r++) for (let c = 0; c < 10 - r; c++) latas.push({ x: 150 + (c - (9 - r) / 2) * paso, y: PIES - (r + 0.5) * LATA_H, m: 0 });
  cerrar("PIRÁMIDE", 150, PIES - 10 * LATA_H);
  for (let r = 0; r < 14; r++) { const w = r === 13 ? 2 : 3; for (let c = 0; c < w; c++) latas.push({ x: 335 + r * 2.4 + (c - (w - 1) / 2) * paso, y: PIES - (r + 0.5) * LATA_H, m: 1 }); }
  cerrar("TORRE DE PISA", 352, PIES - 14 * LATA_H);
  const hw = [9, 8.4, 7.8, 7.2, 6.6, 6.0, 6.5, 5, 4.4, 3.9, 3.4, 3, 2.6, 3.2, 1.5, 1.3, 1.2, 1, 1, 0.5, 0.5, 0.5];
  const ai = [6.2, 5.8, 5.2, 4.4, 3.2, 1.6];
  for (let r = 0; r < hw.length; r++) for (let c = -9; c <= 9; c++) if (Math.abs(c) <= hw[r] && Math.abs(c) >= (ai[r] || 0)) latas.push({ x: 838 + c * paso, y: PIES - (r + 0.5) * LATA_H, m: 2 });
  cerrar("TORRE EIFFEL", 838, PIES - hw.length * LATA_H);
  // orden de construcción: de abajo arriba, repartiendo para que crezcan a la vez
  const orden = [], hechas = mons.map(() => 0);
  while (orden.length < latas.length) {
    let mejor = -1, prog = 2;
    mons.forEach((m, i) => { if (hechas[i] < m.n && hechas[i] / m.n < prog) { prog = hechas[i] / m.n; mejor = i; } });
    orden.push(mons[mejor].de + hechas[mejor]++);
  }
  return (_mon = { latas, mons, orden });
}

