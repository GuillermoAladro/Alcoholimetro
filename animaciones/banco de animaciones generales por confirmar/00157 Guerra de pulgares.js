"use strict";
/*
 * 00157 · GUERRA DE PULGARES
 *
 * Animación del banco. Empieza y acaba en negro.
 * Plano grande de las dos manos agarradas sobre la barra, con Guillermo y Marcos mirando desde arriba. ¡Una, dos y
 * tres!… ¡GUERRA DE PULGARES! Los pulgares se esquivan, amagan y se persiguen en círculos; Guillermo se lanza a por
 * todas, Marcos le esquiva y le atrapa el pulgar: 1, 2, 3. Marcos levanta el suyo y a Guillermo se le queda mustio.
 */
(() => {
const ESC = 1.85, AY = 505, XG = 196, XM = 828;
const BARRA = 300;                                   // borde de atrás de la barra
// piel: claro, medio, sombra, contorno
const PIEL_G = ["#f6c9ab", "#e4ab8c", "#c48467", "#7a4a34"];
const PIEL_M = ["#ffc79c", "#f2aa7c", "#d4875a", "#7d4526"];
const BG = [478, 416], BM = [546, 416];              // base de cada pulgar
const L1 = 50, L2 = 46, GROSOR = 34;
const T_TIT = 2.6, T_PILLA = 5.8, T_CUENTA = [6.25, 6.8, 7.35], T_GANA = 7.62, T_APAGA = 9.2, DUR = 9.8;
const CANTO = [[1.42, "¡UNA!"], [1.82, "¡DOS!"], [2.22, "¡Y TRES!"]];
const CT = cacheTexto();

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const u = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return lerp(k[i - 1][1], k[i][1], eInOut(u)); }
  return k[k.length - 1][1];
}
// ángulo de cada falange (0 = de pie, + = hacia la derecha de la pantalla) y doblez de la punta
const GA = [[0, -0.12], [1.3, -0.12], [1.42, -0.5], [1.62, -0.5], [1.82, 0.4], [2.02, 0.4], [2.22, -0.5], [2.42, -0.5], [2.6, -0.12],
  [3.05, -0.12], [3.2, -1.1], [3.45, -1.0], [3.6, -0.2], [3.75, 0.95], [3.92, 0.9], [4.03, -0.45], [4.25, -0.15], [5.2, -0.2],
  [5.38, -0.5], [5.56, 1.3], [5.72, 1.45], [99, 1.45]];
const GB = [[0, 0.12], [3.6, 0.12], [3.75, 0.6], [3.92, 0.5], [4.03, -0.2], [4.25, 0.12], [5.38, 0.2], [5.56, 0.35], [5.75, 0.05],
  [T_GANA, 0.05], [T_GANA + 0.35, 0.4], [99, 0.4]];
const MA = [[0, 0.12], [1.3, 0.12], [1.42, -0.4], [1.62, -0.4], [1.82, 0.5], [2.02, 0.5], [2.22, -0.4], [2.42, -0.4], [2.6, 0.12],
  [3.0, 0.12], [3.15, -0.95], [3.4, -0.9], [3.6, 0.2], [3.75, 1.15], [3.9, 0.6], [4.0, -0.55], [4.12, 0.2], [4.25, 0.15], [5.2, 0.3],
  [5.4, 0.45], [5.56, 1.15], [5.68, 0.6], [5.8, -0.3], [T_GANA, -0.3], [T_GANA + 0.2, 0], [99, 0]];
const MB = [[0, -0.12], [3.0, -0.12], [3.15, -0.6], [3.4, -0.5], [3.6, -0.12], [3.75, -0.4], [3.9, -0.12], [4.0, -0.5], [4.12, -0.12],
  [5.56, -0.3], [5.68, -0.4], [5.8, -1.95], [T_GANA, -1.95], [T_GANA + 0.2, -0.05], [99, -0.05]];

/** Pulgar de dos falanges desde `base`; devuelve la punta. */
function pulgar(g, base, a, b, piel, alfa = 1) {
  const P1 = [base[0] + Math.sin(a) * L1, base[1] - Math.cos(a) * L1];
  const a2 = a + b, P2 = [P1[0] + Math.sin(a2) * L2, P1[1] - Math.cos(a2) * L2];
  g.save(); g.globalAlpha *= alfa;
  g.lineCap = "round"; g.lineJoin = "round";
  const ruta = (dx, dy) => { g.beginPath(); g.moveTo(base[0] + dx, base[1] + dy); g.lineTo(P1[0] + dx, P1[1] + dy); g.lineTo(P2[0] + dx, P2[1] + dy); };
  g.strokeStyle = piel[3]; g.lineWidth = GROSOR + 5; ruta(0, 0); g.stroke();
  g.strokeStyle = piel[1]; g.lineWidth = GROSOR; ruta(0, 0); g.stroke();
  if (alfa > 0.9) {
    g.strokeStyle = piel[2]; g.lineWidth = GROSOR * 0.35; ruta(Math.cos(a) * 7, Math.sin(a) * 7); g.stroke();
    g.strokeStyle = piel[0]; g.lineWidth = GROSOR * 0.4; ruta(-Math.cos(a) * 6, -Math.sin(a) * 6); g.stroke();
    // pliegue del nudillo
    g.strokeStyle = piel[3]; g.lineWidth = 2; g.globalAlpha *= 0.6;
    g.beginPath(); g.arc(P1[0], P1[1], 8, a2 + 0.6, a2 + 2.5); g.stroke();
    g.globalAlpha /= 0.6;
    // uña
    g.translate(P2[0], P2[1]); g.rotate(a2);
    g.fillStyle = "#fde3d6"; rectR(g, -9, -4, 14, 17, 6); g.fill();
    g.strokeStyle = piel[2]; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = "rgba(255,255,255,.7)"; g.fillRect(-6, -1, 3, 9);
  }
  g.restore();
  return P2;
}

/** Antebrazo: de la muñeca W hacia `dir`, ancho w0 → w1. */
function antebrazo(g, Wr, dir, largo, w0, w1, fill, borde) {
  const n = [-dir[1], dir[0]], E = [Wr[0] + dir[0] * largo, Wr[1] + dir[1] * largo];
  g.beginPath();
  g.moveTo(Wr[0] + n[0] * w0, Wr[1] + n[1] * w0);
  g.lineTo(E[0] + n[0] * w1, E[1] + n[1] * w1);
  g.lineTo(E[0] - n[0] * w1, E[1] - n[1] * w1);
  g.lineTo(Wr[0] - n[0] * w0, Wr[1] - n[1] * w0);
  g.closePath();
  g.fillStyle = fill; g.fill();
  if (borde) { g.strokeStyle = borde; g.lineWidth = 3; g.stroke(); }
}

class GuerraPulgares extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(320);
    this.gotas = [];
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  angulos(t) {
    let gA = pista(t, GA), gB = pista(t, GB), mA = pista(t, MA), mB = pista(t, MB);
    // se persiguen en círculos
    const kc = tramo(t, 4.25, 4.45) * (1 - tramo(t, 5.0, 5.2));
    if (kc > 0) {
      const u = (t - 4.25) * 11;
      gA += kc * 0.75 * Math.sin(u); mA += kc * 0.75 * Math.sin(u - 1.2);
      gB += kc * 0.3 * Math.sin(u * 1.3); mB -= kc * 0.3 * Math.sin(u * 1.3 + 1);
    }
    // pillado: el de Guillermo se retuerce debajo
    if (t > T_PILLA + 0.08 && t < T_GANA) { gB += 0.2 * Math.sin(t * 23); gA += 0.04 * Math.sin(t * 31); mB += 0.05 * Math.sin(t * 17); }
    return [gA, gB, mA, mB];
  }
  /** Las manos suben desde abajo y tiemblan mientras aprietan. */
  desp(t) {
    const dy = (1 - eOut(tramo(t, 0.15, 0.8))) * 330;
    const tr = t > T_PILLA && t < T_GANA ? 2.2 : 0;
    return [azar(-tr, tr), dy + azar(-tr, tr)];
  }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0.12, piernaI: [0, 0], piernaD: [0, 0], manoD: [80, 166], brazoI: 0.05 };
    const M = { quien: "marcos", cara: "guino", rc: -0.12, piernaI: [0, 0], piernaD: [0, 0], brazoI: -0.08, manoD: [67, 152] };
    let gG = 0.05, gM = -0.05, yG = 0, yM = 0;
    if (t > 1.3 && t < 2.6) {
      // el canto: mueven la cabeza al compás
      const s = Math.sin((t - 1.3) * Math.PI / 0.4);
      G.cara = "risa"; M.cara = "risa"; G.rc = 0.12 + 0.06 * s; M.rc = -0.12 + 0.06 * s;
    }
    if (t >= 2.6 && t < 3.0) { G.cara = "sonrisa"; M.cara = "guino"; }
    if (t >= 3.0 && t < T_PILLA) {
      // la pelea: caras según quién ataca
      const caras = [[3.0, "sorpresa", "risa"], [3.55, "sonrisa", "sorpresa"], [3.75, "risa", "sorpresa"], [3.95, "sorpresa", "guino"], [4.25, "sorpresa", "risa"],
        [5.2, "dormido", "guino"], [5.5, "risa", "sorpresa"]];
      for (const [t0, cg, cm] of caras) if (t >= t0) { G.cara = cg; M.cara = cm; }
      G.rc = 0.12 + 0.04 * Math.sin(t * 13); M.rc = -0.12 + 0.04 * Math.sin(t * 11);
      gG = 0.05 + 0.025 * Math.sin(t * 9); gM = -0.05 + 0.025 * Math.sin(t * 8);
    }
    if (t >= T_PILLA && t < T_GANA) {
      G.cara = t < T_PILLA + 0.35 ? "sorpresa" : "dormido"; M.cara = t < T_PILLA + 0.35 ? "risa" : "guino";
      G.rc = 0.16 + 0.03 * Math.sin(t * 29); G.puntas = 0.5 * tramo(t, T_PILLA, T_PILLA + 0.5);
      gG = 0.07; gM = -0.06;
    }
    if (t >= T_GANA) {
      const d = t - T_GANA, k = eBack(tramo(d, 0.05, 0.4));
      M.cara = "risa"; M.rc = -0.1 + 0.06 * Math.sin(d * 7);
      M.manoI = mezcla([2, 150], [-10, 20 + 4 * Math.sin(d * 9)], k); M.brazoIDelante = true;
      yM = -Math.abs(Math.sin(d * 7)) * 10 * (1 - tramo(d, 1.2, 1.5));
      G.cara = d < 0.5 ? "sorpresa" : "borracho"; G.rc = 0.18 * eOut(tramo(d, 0.4, 0.8));
      if (d > 0.45) { G.manoI = mezcla([9, 160], [30, 17], eInOut(tramo(d, 0.45, 0.85))); G.brazoIDelante = true; }
      G.puntas = 0.5 * (1 - tramo(d, 0, 0.4));
      gG = 0.05; gM = -0.08;
    }
    return [{ pose: G, m: matAv(XG, AY + yG, ESC, gG) }, { pose: M, m: matAv(XM, AY + yM, ESC, gM) }];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("apoya", t > 0.78, () => temblar(6, 0.15));
    this.una("pilla", t > T_PILLA, () => {
      temblar(16, 0.35);
      p.nueva(P.DESTELLO, 500, 392, 0, 0, 0.35, 180);
      for (let i = 0; i < 26; i++) { const a = azar(-Math.PI, 0), v = azar(200, 520); p.nueva(P.CHISPA, 500, 392, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(7, 12)); }
    });
    T_CUENTA.forEach((tc, i) => this.una("c" + i, t > tc, () => { temblar(6 + i * 3, 0.18); p.nueva(P.DESTELLO, 512, 250, 0, 0, 0.25, 120 + i * 30); }));
    this.una("gana", t > T_GANA, () => {
      temblar(18, 0.45);
      for (let i = 0; i < 90; i++) p.nueva(P.CONFETI, azar(20, W - 20), azar(-90, -10), azar(-40, 40), azar(0, 120), azar(2.2, 3.4), azar(9, 15), i % 5);
      for (let i = 0; i < 20; i++) { const a = azar(0, 6.283), v = azar(150, 380); p.nueva(P.CHISPA, 548, 330, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(7, 12)); }
    });
    // sudor de Guillermo mientras le pillan
    if (t > T_PILLA + 0.3 && t < T_GANA + 0.3 && Math.random() < 7 * dt) {
      const e = this.poses(), lado = Math.random() < 0.5 ? -1 : 1, q = aPant(e[0].m, [39 + lado * 34, 24]);
      this.gotas.push({ x: q[0], y: q[1], vx: lado * azar(40, 110), vy: azar(-170, -70), v: 0.7 });
    }
    for (const d of this.gotas) { d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.v -= dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0 && d.y < BARRA + 10);
    p.suelo = () => 560;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  /** Barra de madera vista de cerca (en perspectiva), con dos jarras al fondo. Se pinta una vez. */
  barra() {
    if (CT.has("barra")) return CT.get("barra");
    const c = lienzoNuevo(W + 120, H - BARRA + 60), g = c.getContext("2d");
    g.translate(60, -BARRA + 10);
    const gr = g.createLinearGradient(0, BARRA, 0, H);
    gr.addColorStop(0, "#4a2812"); gr.addColorStop(0.35, "#7a4620"); gr.addColorStop(1, "#3b200d");
    g.fillStyle = gr; g.fillRect(-60, BARRA, W + 120, H - BARRA + 60);
    // tablones que se van al fondo
    g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 3;
    for (let i = -8; i <= 8; i++) { g.beginPath(); g.moveTo(512 + i * 58, BARRA); g.lineTo(512 + i * 205, H + 40); g.stroke(); }
    g.strokeStyle = "rgba(255,210,150,.07)"; g.lineWidth = 2;
    for (let i = -8; i <= 8; i++) { g.beginPath(); g.moveTo(512 + i * 58 + 4, BARRA); g.lineTo(512 + i * 205 + 10, H + 40); g.stroke(); }
    // vetas
    const r = semilla(57);
    g.strokeStyle = "rgba(30,12,2,.22)"; g.lineWidth = 1.5;
    for (let i = 0; i < 26; i++) {
      const y = BARRA + 20 + r() * 270, x = r() * W, l = 60 + r() * 140;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y + (r() - 0.5) * 8, x + l, y + (r() - 0.5) * 6); g.stroke();
    }
    // canto de atrás con brillo
    g.fillStyle = "#9a5f2c"; g.fillRect(-60, BARRA - 4, W + 120, 8);
    g.fillStyle = "rgba(255,225,170,.55)"; g.fillRect(-60, BARRA - 4, W + 120, 2);
    // charco de luz de la lámpara
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.28;
    g.drawImage(BLOB2.oroClaro, 150, BARRA - 30, 724, 300);
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    for (const x of [62, 962]) {
      g.save(); g.translate(x - 26, BARRA + 4); g.scale(1.55, 1.55);
      g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(17, 18, 18, 4, 0, 0, 6.283); g.fill();
      dibujarJarra(g, [0, 0], 0, 0.8, "asa", 0); dibujarJarra(g, [0, 0], 0, 0.8, "cuerpo", 0);
      g.restore();
    }
    CT.set("barra", c);
    return c;
  }
  /** Los dos puños agarrados y los antebrazos (sin los pulgares). Se pinta una vez. */
  manos() {
    if (CT.has("manos")) return CT.get("manos");
    const OY = 360, c = lienzoNuevo(W, 440), g = c.getContext("2d");
    g.translate(0, -OY);
    // antebrazo de Marcos (manga corta: brazo al aire)
    const dM = [0.84, 0.54], WM = [598, 450];
    antebrazo(g, WM, dM, 560, 38, 66, PIEL_M[3]);
    antebrazo(g, WM, dM, 560, 35, 63, (() => {
      const q = g.createLinearGradient(WM[0] - 30, WM[1] - 46, WM[0] + 30, WM[1] + 46);
      q.addColorStop(0, PIEL_M[0]); q.addColorStop(0.5, PIEL_M[1]); q.addColorStop(1, PIEL_M[2]); return q;
    })());
    g.strokeStyle = "rgba(255,240,225,.35)"; g.lineWidth = 6; g.lineCap = "round";
    g.beginPath(); g.moveTo(WM[0] + 40, WM[1] - 4); g.lineTo(WM[0] + 300, WM[1] + 150); g.stroke();
    // antebrazo de Guillermo: manga larga negra con puño de camisa
    const dG = [-0.84, 0.54], WG = [426, 450];
    antebrazo(g, WG, dG, 50, 37, 40, PIEL_G[3]);
    antebrazo(g, WG, dG, 50, 34, 37, PIEL_G[1]);
    const n = [-dG[1], dG[0]], C0 = [WG[0] + dG[0] * 34, WG[1] + dG[1] * 34];
    antebrazo(g, C0, dG, 560, 46, 72, (() => {
      const q = g.createLinearGradient(C0[0] + n[0] * 50, C0[1] + n[1] * 50, C0[0] - n[0] * 50, C0[1] - n[1] * 50);
      q.addColorStop(0, "#4a4a4e"); q.addColorStop(0.45, "#2a2a2d"); q.addColorStop(1, "#111113"); return q;
    })(), "#050506");
    antebrazo(g, C0, dG, 30, 47, 48, "#38383c", "#050506");
    g.fillStyle = "#d9d9de"; g.beginPath(); g.arc(C0[0] + dG[0] * 15 + n[0] * 28, C0[1] + dG[1] * 15 + n[1] * 28, 4, 0, 6.283); g.fill();
    g.strokeStyle = "rgba(0,0,0,.6)"; g.lineWidth = 3;
    for (const k of [140, 260]) { g.beginPath(); g.moveTo(C0[0] + dG[0] * k + n[0] * 30, C0[1] + dG[1] * k + n[1] * 30); g.quadraticCurveTo(C0[0] + dG[0] * (k + 20), C0[1] + dG[1] * (k + 20), C0[0] + dG[0] * (k + 6) - n[0] * 26, C0[1] + dG[1] * (k + 6) - n[1] * 26); g.stroke(); }
    // puños
    const puno = (x0, piel) => {
      rectR(g, x0, 402, 104, 88, 30);
      const q = g.createLinearGradient(0, 402, 0, 490);
      q.addColorStop(0, piel[0]); q.addColorStop(0.55, piel[1]); q.addColorStop(1, piel[2]);
      g.fillStyle = q; g.fill(); g.strokeStyle = piel[3]; g.lineWidth = 3.5; g.stroke();
    };
    puno(512, PIEL_M);
    puno(408, PIEL_G);
    // las yemas de Marcos asoman por la izquierda del puño de Guillermo
    for (let i = 0; i < 4; i++) {
      const y = 414 + i * 18.5;
      rectR(g, 396, y, 26, 17, 8.5); g.fillStyle = PIEL_M[1]; g.fill(); g.strokeStyle = PIEL_M[3]; g.lineWidth = 2.5; g.stroke();
    }
    puno(408, PIEL_G); // otra vez el de Guillermo para tapar el arranque de las yemas
    for (let i = 0; i < 4; i++) {
      const y = 414 + i * 18.5;
      g.fillStyle = PIEL_M[1]; rectR(g, 397, y + 1, 12, 15, 7); g.fill();
    }
    // los dedos de Guillermo abrazan el puño de Marcos
    for (let i = 0; i < 4; i++) {
      const y = 410 + i * 19;
      rectR(g, 488, y, 70, 19, 9.5);
      const q = g.createLinearGradient(0, y, 0, y + 19);
      q.addColorStop(0, PIEL_G[0]); q.addColorStop(1, PIEL_G[2]);
      g.fillStyle = q; g.fill(); g.strokeStyle = PIEL_G[3]; g.lineWidth = 2.5; g.stroke();
      g.fillStyle = "rgba(255,240,230,.5)"; rectR(g, 538, y + 4, 14, 9, 4.5); g.fill();
    }
    // nudillos de Guillermo
    g.strokeStyle = "rgba(122,74,52,.55)"; g.lineWidth = 2;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(470, 430 + i * 19, 7, -0.4, 1.2); g.stroke(); }
    CT.set("manos", c);
    return c;
  }
  /** Los pulgares (con estela si van deprisa). */
  pulgares(g, t, d) {
    const encimaM = (t > 3.05 && t < 3.55) || t > 5.62;
    const dib = (q, tt, alfa) => {
      const A = this.angulos(tt);
      if (q === 0) pulgar(g, [BG[0] + d[0], BG[1] + d[1]], A[0], A[1], PIEL_G, alfa);
      else pulgar(g, [BM[0] + d[0], BM[1] + d[1]], A[2], A[3], PIEL_M, alfa);
    };
    const orden = encimaM ? [0, 1] : [1, 0];
    // estelas
    if (t > 1.3 && t < T_GANA + 0.3) for (const q of orden) { dib(q, t - 0.06, 0.18); dib(q, t - 0.03, 0.3); }
    for (const q of orden) {
      dib(q, t, 1);
      // el arranque del pulgar se funde con el puño
      const B = q ? BM : BG, piel = q ? PIEL_M : PIEL_G;
      g.fillStyle = piel[1]; g.beginPath(); g.ellipse(B[0] + d[0], B[1] + d[1] + 8, 15, 10, 0, 0, 6.283); g.fill();
    }
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses(), d = this.desp(t);
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    // lámpara: luz cálida en el centro
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.32 * a;
    g.drawImage(BLOB2.oroClaro, 250, -40, 524, 380); g.restore();
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    g.drawImage(this.barra(), -60, BARRA - 10);
    // sombra de las manos sobre la barra
    g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(512 + d[0], 500 + d[1] * 0.4, 150, 22, 0, 0, 6.283); g.fill();
    g.drawImage(this.manos(), d[0], 360 + d[1]);
    this.pulgares(g, t, d);
    // sudor
    g.fillStyle = "#bfe9ff";
    for (const q of this.gotas) { g.beginPath(); g.ellipse(q.x, q.y, 4, 6, 0, 0, 6.283); g.fill(); }
    g.restore();
    this.p.dibujar(g);
    // brillo en el pulgar ganador
    if (t > T_GANA + 0.15 && t < T_GANA + 1.3) { const k = tramo(t, T_GANA + 0.15, T_GANA + 1.3); brillo(g, BM[0] + 6, BM[1] - 92, 40 * Math.sin(k * Math.PI), a); }
    // el canto: ¡UNA! ¡DOS! ¡Y TRES!
    CANTO.forEach(([tc, s], i) => {
      const dd = t - tc;
      if (dd < 0 || dd > 0.42) return;
      const k = eBack(tramo(dd, 0, 0.1));
      g.save(); g.translate(512 + (i - 1) * 150, 262 - (i === 2 ? 10 : 0)); g.rotate((i - 1) * 0.08); g.scale(k, k);
      txt(g, s, 0, 0, { tam: 58, peso: 400, fam: FC, color: "#fffdf5", borde: "#3a1d00", bordeAncho: 8, esp: 2, alfa: a * (1 - tramo(dd, 0.3, 0.42)) });
      g.restore();
    });
    // ¡FIU! en los esquives y ¡ZIS! ¡ZAS! al perseguirse
    for (const [tz, s, x, y, r] of [[3.18, "¡FIU!", 372, 300, -0.15], [3.76, "¡FIU!", 652, 300, 0.15], [4.4, "¡ZIS!", 380, 290, -0.12], [4.75, "¡ZAS!", 646, 290, 0.12]]) {
      const dz = t - tz;
      if (dz < 0 || dz > 0.4) continue;
      const k = eBack(tramo(dz, 0, 0.08));
      g.save(); g.translate(x, y); g.rotate(r); g.scale(k, k);
      txt(g, s, 0, 0, { tam: 46, peso: 400, fam: FC, color: "#e9fbff", borde: "#0a3d5c", bordeAncho: 7, esp: 2, alfa: a * (1 - tramo(dz, 0.28, 0.4)) });
      g.restore();
    }
    // ¡ZASCA! al pillarle
    const dp = t - T_PILLA;
    if (dp > 0 && dp < 0.5) {
      const k = eBack(tramo(dp, 0, 0.1));
      g.save(); g.translate(512, 300); g.rotate(-0.06); g.scale(k, k);
      txt(g, "¡ZASCA!", 0, 0, { tam: 70, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a2400", bordeAncho: 9, esp: 2, alfa: a * (1 - tramo(dp, 0.38, 0.5)) });
      g.restore();
    }
    // la cuenta: 1, 2, 3
    T_CUENTA.forEach((tc, i) => {
      const dd = t - tc;
      if (dd < 0 || dd > (i === 2 ? 0.3 : 0.5)) return;
      const k = eBack(tramo(dd, 0, 0.12));
      g.save(); g.translate(512, 266); g.scale(k * (1 + i * 0.12), k * (1 + i * 0.12));
      txt(g, String(i + 1), 0, 44, { tam: 140, peso: 400, fam: FC, color: i === 2 ? "#ffd34d" : "#fffdf5", borde: "#7a0008", bordeAncho: 12, alfa: a * (1 - tramo(dd, i === 2 ? 0.2 : 0.38, i === 2 ? 0.3 : 0.5)) });
      g.restore();
    });
    // ¡GUERRA DE PULGARES! (al empezar y en el remate)
    for (const [t0, t1] of [[T_TIT, 3.75], [T_GANA, 99]]) {
      if (t < t0 || t > t1) continue;
      const dd = t - t0, k = tramo(dd, 0, 0.18), s = lerp(2.4, 1, eIn(k)) * (1 + 0.02 * Math.sin(dd * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a * (1 - tramo(t, t1 - 0.25, t1));
      g.translate(512, 128); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has("tit")) return CT.get("tit");
    const c = lienzoNuevo(560, 230), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 20, 0, 210);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.45, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    const o = { tam: 92, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 11, esp: 3, glow: "rgba(255,190,40,.8)", glowTam: 22, max: 520 };
    txt(g, "¡GUERRA DE", 280, 100, o);
    txt(g, "PULGARES!", 280, 200, o);
    CT.set("tit", c);
    return c;
  }
}

registrar({ id: "00157", nombre: "Guerra de pulgares", crear: () => new GuerraPulgares() });
})();
