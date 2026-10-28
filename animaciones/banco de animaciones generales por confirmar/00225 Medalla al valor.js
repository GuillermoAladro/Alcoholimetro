"use strict";
/*
 * 00225 · MEDALLA AL VALOR
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se abre el telón: ceremonia en el parque, con tarima, banderines y foco. El jefe (un compañero con el casco blanco y
 * gafas de sol) le cuelga a Marcos una medalla gigante (¡TACHÁN!)… que, mirada de cerca, es una chapa de cerveza
 * dorada. Marcos se ríe y la muerde como un campeón. Abajo, Guillermo aplaude llorando a chorros de la emoción, con su
 * pañuelo, y se suena (¡FUUUN!). ¡HÉROE! Confeti y flashes; se cierra el telón.
 */
(() => {
const CT = cacheTexto();
const XM = 700, XJ = 812, XG = 222;
const ESC_M = 1.3, ESC_J = 1.24, ESC_G = 1.45;
const TARIMA = 470;                         // altura de la tarima (los pies de Marcos y del jefe)
const T_ABRE = 0.25, T_ENTREGA = 1.55, T_PUESTA = 2.25, T_MIRA = 2.75, T_CHAPA = 3.05, T_HEROE = 3.7;
const T_PANUELO = 4.6, T_SUENA = 5.6, T_MUERDE = 6.2, T_CIERRA = 9.55, DUR = 10.6;
const MEDALLA_R = 34;                       // radio de la medalla (unidades de avatar)

/** La medalla-chapa: borde dentado, centro abombado y una estrella. (0, 0) = centro. */
function chapa(g, R, t) {
  const n = 21;
  g.save();
  // dientes
  g.beginPath();
  for (let i = 0; i <= n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2, r = i % 2 ? R * 0.88 : R;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
  }
  g.closePath();
  const gr = g.createRadialGradient(-R * 0.3, -R * 0.35, R * 0.1, 0, 0, R);
  gr.addColorStop(0, "#fff6c0"); gr.addColorStop(0.45, "#ffcc33"); gr.addColorStop(1, "#a06c00");
  g.fillStyle = gr; g.fill();
  g.strokeStyle = "#6e4800"; g.lineWidth = R * 0.05; g.lineJoin = "round"; g.stroke();
  // centro
  const gc = g.createRadialGradient(R * 0.2, R * 0.25, R * 0.05, 0, 0, R * 0.72);
  gc.addColorStop(0, "#c88f10"); gc.addColorStop(0.6, "#ffd34d"); gc.addColorStop(1, "#fff2a8");
  g.fillStyle = gc; g.beginPath(); g.arc(0, 0, R * 0.7, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(110,72,0,.6)"; g.lineWidth = R * 0.03; g.stroke();
  // estrella
  estrella(g, 0, 0, R * 0.42, R * 0.18, 0);
  g.fillStyle = "#e8261c"; g.fill(); g.strokeStyle = "#7a0c06"; g.lineWidth = R * 0.03; g.stroke();
  // brillo que pasa
  g.save(); g.beginPath(); g.arc(0, 0, R, 0, 6.283); g.clip();
  const x = ((t * 0.9) % 1.6 - 0.3) * R * 3 - R * 1.5;
  g.fillStyle = "rgba(255,255,255,.45)"; g.beginPath(); g.moveTo(x - R * 0.2, -R); g.lineTo(x + R * 0.2, -R); g.lineTo(x - R * 0.3, R); g.lineTo(x - R * 0.7, R); g.closePath(); g.fill();
  g.restore();
  g.restore();
}
/** Cinta de la medalla desde el cuello (unidades de avatar). */
function cinta(g, a, b, c) {
  // a = lado izquierdo del cuello, b = lado derecho, c = arriba de la medalla
  for (const [p, q] of [[a, c], [b, c]]) {
    g.strokeStyle = "#b8180f"; g.lineWidth = 9; g.lineCap = "butt";
    g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke();
    g.strokeStyle = "#ffd23a"; g.lineWidth = 3; g.stroke();
  }
}

class MedallaValor extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(420);
    this.lagrimas = [];
  }
  /** Telón: 0 cerrado – 1 abierto. */
  telon() { const t = this.t; return eInOut(tramo(t, T_ABRE, T_ABRE + 0.85)) * (1 - eInOut(tramo(t, T_CIERRA, T_CIERRA + 0.7))); }
  poses() {
    const t = this.t;
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    const J = { quien: "bombero", cascoColor: "#f4f4f4", gafas: true, cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    const G = { cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    let ym = TARIMA, yg = PIES;
    const mM = matAv(XM, TARIMA, ESC_M), mJ = matAv(XJ, TARIMA - 6, ESC_J);
    // ---- el jefe: sostiene la medalla y se la cuelga
    const cuelloM = mJ.inverse().transformPoint(new DOMPoint(...aPant(mM, [37, 96])));
    if (t < T_PUESTA + 0.2) {
      const k = eInOut(tramo(t, T_ENTREGA, T_PUESTA - 0.1));
      J.manoI = mezcla([10, 112], [cuelloM.x, cuelloM.y], k); J.manoD = mezcla([60, 112], [52, 118], k); J.brazoIDelante = true;
      J.cara = t < T_ENTREGA ? "sonrisa" : "guino"; J.rc = 0.1;
    } else {
      const k = eInOut(tramo(t, T_PUESTA + 0.2, T_PUESTA + 0.5));
      J.manoI = mezcla([cuelloM.x, cuelloM.y], [6, 150], k); J.manoD = mezcla([52, 118], [60, 26], eInOut(tramo(t, T_HEROE, T_HEROE + 0.3)));
      J.cara = t < T_CHAPA + 0.4 ? "sonrisa" : "risa"; J.rc = -0.05;
      if (t < T_HEROE) J.manoD = [52, 118];
    }
    // ---- Marcos: firme, recibe la medalla, la mira, se ríe y la muerde
    let medalla = null;      // dónde está el centro de la medalla (unidades de avatar de Marcos)
    M.cara = "sonrisa"; M.rc = -0.06;
    if (t > T_PUESTA) {
      medalla = [37, 132];
      M.cara = "risa"; M.rc = -0.1;
      if (t > T_MIRA) {
        const k = eInOut(tramo(t, T_MIRA, T_MIRA + 0.3)) * (1 - eInOut(tramo(t, T_HEROE + 0.2, T_HEROE + 0.5)));
        medalla = mezcla([37, 132], [52, 104], k); M.manoD = mezcla([67, 152], [62, 112], k);
        M.rc = 0.18 * k - 0.1 * (1 - k); M.cara = t < T_CHAPA ? "sorpresa" : t < T_CHAPA + 0.5 ? "sorpresa" : "risa";
      }
      if (t > T_HEROE + 0.5) { M.cara = "risa"; M.manoI = [16, 140]; M.manoD = [80, 96]; M.rc = -0.08; }
      if (t > T_MUERDE) {
        // la muerde como un campeón
        const b = boca(-0.05, "bombero");
        const k = eInOut(tramo(t, T_MUERDE, T_MUERDE + 0.3)) * (1 - eInOut(tramo(t, T_MUERDE + 1.2, T_MUERDE + 1.5)));
        medalla = mezcla([37, 132], [b[0] + 2, b[1] + 22], k); M.manoD = mezcla([80, 96], [b[0] + 14, b[1] + 36], k);
        M.cara = k > 0.5 ? "guino" : "risa"; M.rc = -0.05;
        if (t > T_MUERDE + 1.5) { M.manoD = [74, 30]; M.manoI = [16, 140]; M.cara = t < 8.6 ? "risa" : "guino"; }   // saluda al público
      }
      const med = medalla;
      M.objD = (g) => cinta(g, [28, 76], [46, 76], [med[0], med[1] - MEDALLA_R * 0.8]);
      M.objD2 = (g) => { g.save(); g.translate(med[0], med[1]); chapa(g, MEDALLA_R, t); g.restore(); };
    }
    // ---- Guillermo: aplaude, llora a chorros, pañuelo y se suena
    const aplaude = () => { const s = Math.sin(t * 20); G.brazoIDelante = true; G.manoD = [50 + 7 * s, 108]; G.manoI = [28 - 7 * s, 108]; };
    G.rc = 0.1;
    if (t < T_PANUELO) { aplaude(); G.cara = t < T_CHAPA ? "risa" : "dormido"; }
    else if (t < T_SUENA) {
      // pañuelo al aire
      G.cara = "dormido"; G.manoD = [86, 28 + 10 * Math.sin(t * 12)]; G.manoI = [20, 120]; G.rc = 0.14;
    } else if (t < T_SUENA + 0.8) {
      // se suena
      G.cara = "dormido"; G.manoD = [44, 62]; G.manoI = [32, 64]; G.brazoIDelante = true; G.rc = 0.05;
      yg -= Math.max(0, Math.sin(tramo(t, T_SUENA + 0.2, T_SUENA + 0.5) * Math.PI)) * 12;
    } else { aplaude(); G.cara = Math.sin(t * 2) > -0.5 ? "dormido" : "risa"; }
    const pan = t > T_PANUELO - 0.2;
    if (pan) G.objD2 = (g, m) => {
      g.save(); g.translate(m[0], m[1] - 8); g.rotate(0.3 * Math.sin(t * 9));
      g.fillStyle = "#fffdf5"; g.beginPath(); g.moveTo(-12, -14); g.quadraticCurveTo(0, -20 + 4 * Math.sin(t * 15), 14, -14); g.lineTo(12, 12); g.quadraticCurveTo(0, 16, -10, 12); g.closePath(); g.fill();
      g.strokeStyle = "#9fb8c8"; g.lineWidth = 1.2; g.stroke();
      g.strokeStyle = "rgba(80,140,220,.6)"; g.beginPath(); g.moveTo(-8, -10); g.lineTo(8, 8); g.stroke();
      g.restore();
    };
    return { M, J, G, mM: matAv(XM, ym, ESC_M), mJ, mG: matAv(XG, yg, ESC_G, 0.04 * Math.sin(t * 7)), medalla };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.poses();
    this.una("puesta", t > T_PUESTA, () => {
      temblar(8, 0.3);
      const c = aPant(e.mM, [37, 132]);
      p.nueva(P.DESTELLO, c[0], c[1], 0, 0, 0.4, 260);
      for (let i = 0; i < 26; i++) p.nueva(P.PURPURINA, c[0] + azar(-80, 80), c[1] + azar(-80, 40), azar(-40, 40), azar(-80, 0), azar(1, 1.8), azar(10, 16));
    });
    this.una("heroe", t > T_HEROE, () => {
      temblar(14, 0.4);
      for (let i = 0; i < 110; i++) p.nueva(P.CONFETI, azar(60, 964), azar(-80, 0), azar(-40, 40), azar(40, 180), azar(2.5, 4), azar(9, 15), (Math.random() * 5) | 0);
    });
    this.una("suena", t > T_SUENA + 0.25, () => temblar(6, 0.2));
    this.una("muerde", t > T_MUERDE + 0.3, () => { temblar(5, 0.15); const c = aPant(e.mM, boca(-0.05, "bombero")); for (let i = 0; i < 10; i++) { const a = azar(0, 6.283), v = azar(100, 240); p.nueva(P.CHISPA, c[0], c[1] + 20, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(5, 8)); } });
    // flashes del público
    if (t > T_PUESTA && t < T_CIERRA && Math.random() < 2.2 * dt) p.nueva(P.DESTELLO, azar(380, 1000), azar(520, 590), 0, 0, 0.25, azar(70, 120));
    // lágrimas a chorro
    const llora = (t > T_CHAPA + 0.3 && t < T_SUENA) || (t > T_SUENA + 0.8 && t < T_CIERRA);
    if (llora && Math.random() < 34 * dt) {
      for (const [ex, lado] of [[27, -1], [50, 1]]) {
        const c = aPant(e.mG, [ex, 44]);
        this.lagrimas.push({ x: c[0], y: c[1], vx: lado * azar(140, 260), vy: azar(-300, -160), v: 0.9 });
      }
    }
    for (let i = this.lagrimas.length - 1; i >= 0; i--) {
      const l = this.lagrimas[i]; l.v -= dt; l.vy += 900 * dt; l.x += l.vx * dt; l.y += l.vy * dt;
      if (l.v <= 0 || l.y > PIES + 10) { this.lagrimas[i] = this.lagrimas[this.lagrimas.length - 1]; this.lagrimas.pop(); }
    }
    p.suelo = (x) => (x > 380 ? TARIMA : PIES + 4);
    p.actualizar(dt);
  }
  fondoFijo() {
    if (CT.has("fondo")) return CT.get("fondo");
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    // fondo de la nave, oscuro y cálido
    const gw = g.createLinearGradient(0, -60, 0, 560);
    gw.addColorStop(0, "#2a1416"); gw.addColorStop(1, "#5a2a22");
    g.fillStyle = gw; g.fillRect(-60, -60, W + 120, 640);
    // telón de fondo con pliegues
    for (let x = -60; x < W + 60; x += 40) {
      const gr = g.createLinearGradient(x, 0, x + 40, 0);
      gr.addColorStop(0, "#5a0c10"); gr.addColorStop(0.5, "#a3181e"); gr.addColorStop(1, "#5a0c10");
      g.fillStyle = gr; g.fillRect(x, 20, 40, 460);
    }
    // banderines
    g.strokeStyle = "#2a2a2a"; g.lineWidth = 2;
    for (const [y0, x0, x1] of [[40, -40, 520], [40, 500, 1070]]) {
      g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, y0 + 50, x1, y0); g.stroke();
      for (let i = 1; i < 12; i++) {
        const u = i / 12, x = lerp(x0, x1, u), y = y0 + 100 * u * (1 - u) - 2;
        g.fillStyle = CONFETI[i % 5]; g.beginPath(); g.moveTo(x - 14, y + 2); g.lineTo(x + 14, y + 2); g.lineTo(x, y + 30); g.closePath(); g.fill();
      }
    }
    // tarima
    const gt = g.createLinearGradient(0, TARIMA, 0, 575);
    gt.addColorStop(0, "#8a5a2a"); gt.addColorStop(1, "#4a2a10");
    g.fillStyle = gt; g.fillRect(380, TARIMA, 700, 110);
    g.fillStyle = "#b8844a"; g.fillRect(380, TARIMA - 6, 700, 10);
    g.fillStyle = "#c41a10"; g.fillRect(420, TARIMA + 20, 640, 30);
    g.fillStyle = "#ffd23a"; g.fillRect(420, TARIMA + 22, 640, 4); g.fillRect(420, TARIMA + 44, 640, 4);
    // escalones
    g.fillStyle = "#6a4018"; g.fillRect(340, 540, 60, 35); g.fillRect(360, 505, 40, 35);
    // suelo
    const gs = g.createLinearGradient(0, 575, 0, H + 60);
    gs.addColorStop(0, "#3a2420"); gs.addColorStop(1, "#1a0e0c");
    g.fillStyle = gs; g.fillRect(-60, 575, W + 120, 100);
    CT.set("fondo", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses();
    fondo(g, "#000");
    g.drawImage(this.fondoFijo(), -60, -60);
    foco(g, XM + 40, XM, TARIMA, 120, 1);
    pintarAvatar(g, e.mJ, e.J, t);
    pintarAvatar(g, e.mM, e.M, t);
    // la medalla en las manos del jefe (antes de colgarla)
    if (t < T_PUESTA) {
      const h = aPant(e.mJ, mezcla(e.J._manoI || e.J.manoI, e.J._manoD || e.J.manoD, 0.5));
      const dest = aPant(e.mM, [37, 132]), k = eInOut(tramo(t, T_PUESTA - 0.45, T_PUESTA));
      const x = lerp(h[0], dest[0], k), y = lerp(h[1] + 30, dest[1], k) - Math.sin(k * Math.PI) * 40;
      const R = MEDALLA_R * ESC_M;
      g.save(); g.lineCap = "butt";
      g.strokeStyle = "#b8180f"; g.lineWidth = 10; g.beginPath(); g.moveTo(x - 24, y - R * 0.8 - 40); g.lineTo(x, y - R * 0.8); g.lineTo(x + 24, y - R * 0.8 - 40); g.stroke();
      g.translate(x, y); g.scale(ESC_M, ESC_M); chapa(g, MEDALLA_R, t); g.restore();
    }
    // público (siluetas) y Guillermo delante
    pintarAvatar(g, e.mG, e.G, t);
    g.fillStyle = "#0e0808";
    for (let i = 0; i < 9; i++) {
      const x = 380 + i * 82 + (i % 2) * 18, y = 572 + (i % 3) * 8;
      g.beginPath(); g.arc(x, y, 30, 0, 6.283); g.fill();
      g.beginPath(); g.ellipse(x, y + 60, 56, 40, 0, 0, 6.283); g.fill();
    }
    // lágrimas
    g.save(); g.fillStyle = "#8fdcff";
    for (const l of this.lagrimas) { g.globalAlpha = Math.min(1, l.v * 3); g.beginPath(); g.ellipse(l.x, l.y, 4, 6, Math.atan2(l.vy, l.vx) + Math.PI / 2, 0, 6.283); g.fill(); }
    g.restore();
    this.p.dibujar(g);
    // lupa sobre la chapa
    if (t > T_CHAPA && t < T_HEROE + 0.4) {
      const k = eBack(tramo(t, T_CHAPA, T_CHAPA + 0.25)) * (1 - tramo(t, T_HEROE + 0.2, T_HEROE + 0.4));
      const c = aPant(e.mM, e.medalla || [37, 132]);
      g.save(); g.translate(c[0] - 150, c[1] - 30); g.scale(k, k);
      g.fillStyle = "#fffdf5"; g.beginPath(); g.arc(0, 0, 74, 0, 6.283); g.fill();
      g.strokeStyle = "#2a2a2a"; g.lineWidth = 8; g.stroke();
      g.save(); g.beginPath(); g.arc(0, 0, 70, 0, 6.283); g.clip(); chapa(g, 62, t); g.restore();
      g.strokeStyle = "#2a2a2a"; g.lineWidth = 12; g.lineCap = "round"; g.beginPath(); g.moveTo(52, 52); g.lineTo(96, 96); g.stroke();
      g.restore();
    }
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    ono("¡TACHÁN!", 560, 200, T_PUESTA, 0.8, 58, "#ffd34d", "#3a2400", -0.08);
    ono("¡SNIF!", 120, 300, T_CHAPA + 0.4, 0.6, 46, "#bff0ff", "#0c3350", -0.12);
    ono("¡FUUUN!", 340, 250, T_SUENA + 0.2, 0.7, 58, "#fffdf5", "#1b1b1b", 0.08);
    ono("¡ÑAM!", 860, 240, T_MUERDE + 0.3, 0.6, 52, "#ffd34d", "#3a2400", 0.1);
    if (t > T_CHAPA && t < T_HEROE + 0.2) {
      const c = aPant(e.mM, [37, 0]);
      bocadillo(g, 560, 120, "¿UNA CHAPA?", c[0] - 10, c[1] - 6, tramo(t, T_CHAPA, T_CHAPA + 0.2) * (1 - tramo(t, T_HEROE, T_HEROE + 0.2)), 40);
    }
    // ¡HÉROE!
    if (t > T_HEROE) {
      const d = t - T_HEROE, k = tramo(d, 0, 0.18), s = lerp(1.8, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 5));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 100); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // telón delantero
    const ab = this.telon();
    const ancho = (W / 2 + 70) * (1 - ab);
    for (const lado of [-1, 1]) {
      const x0 = lado < 0 ? -60 : W + 60 - ancho, x1 = lado < 0 ? -60 + ancho : W + 60;
      if (ancho < 2) continue;
      for (let x = x0; x < x1; x += 36) {
        const gr = g.createLinearGradient(x, 0, x + 36, 0);
        gr.addColorStop(0, "#4a080c"); gr.addColorStop(0.5, "#b51c22"); gr.addColorStop(1, "#4a080c");
        g.fillStyle = gr; g.fillRect(x, -60, Math.min(36, x1 - x), H + 120);
      }
    }
    // cenefa de arriba
    g.fillStyle = "#7a0e12"; g.fillRect(-60, -60, W + 120, 82);
    g.fillStyle = "#ffd23a"; g.fillRect(-60, 18, W + 120, 5);
    const a = Math.max(1 - tramo(t, 0.02, 0.45), tramo(t, DUR - 0.5, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(620, 200), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 170);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#c88a00");
    txt(g, "¡HÉROE!", 316, 168, { tam: 160, peso: 900, fam: FD, color: "#2a1800", esp: 8, max: 580 });
    txt(g, "¡HÉROE!", 310, 160, { tam: 160, peso: 900, fam: FD, color: gr, borde: "#2a1800", bordeAncho: 12, esp: 8, glow: "rgba(255,210,80,.85)", glowTam: 26, max: 580 });
    CT.set("t", c);
    return c;
  }
}

registrar({ id: "00225", nombre: "Medalla al valor", crear: () => new MedallaValor() });
})();
