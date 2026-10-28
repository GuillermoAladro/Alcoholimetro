"use strict";
/*
 * 00020 · PENALTI
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se encienden los focos del estadio. Chuta un balón a una portería pequeña y da en el larguero (¡UUUY!). El balón
 * rebota por los bordes de la pantalla, le cae en la cabeza (¡BONK!) y de rebote entra en la portería (¡GOOOL!).
 * Lo celebra deslizándose de rodillas y los focos se apagan.
 */
(() => {
const CACHE = cacheTexto();
/** Texto grande pintado una vez en su propio lienzo (con borde y brillo). */
function cartel(clave, s, o) {
  let c = CACHE.get(clave);
  if (c) return c;
  const m = lienzoNuevo(1, 1).getContext("2d");
  m.font = `${o.peso || 400} ${o.tam}px ${o.fam}`;
  if ("letterSpacing" in m) m.letterSpacing = (o.esp || 0) + "px";
  const pad = (o.glowTam || 0) + (o.bordeAncho || 0) + 14;
  c = lienzoNuevo(m.measureText(s).width + pad * 2, o.tam * 1.3 + pad * 2);
  const g = c.getContext("2d");
  const col = typeof o.color === "function" ? o.color(g, c) : o.color;
  txt(g, s, c.width / 2, c.height / 2 + o.tam * 0.36, Object.assign({}, o, { color: col }));
  CACHE.set(clave, c);
  return c;
}
function ponCartel(g, c, x, y, s, a = 1, rot = 0) {
  if (a <= 0 || s <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.drawImage(c, -c.width / 2, -c.height / 2); g.restore();
}

const R = 21;                                  // radio del balón
const PORT = { x0: 690, x1: 950, top: 385 };    // portería (marco delantero)
const BX = [700, 940], BTOP = 404, BBOT = PIES - 30; // marco trasero (red del fondo)

/** Balón de fútbol con parches negros, girado `rot`. */
function balon(g, x, y, r, rot) {
  g.save(); g.translate(x, y);
  g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.fillStyle = "#f4f4f2"; g.fill();
  g.save(); g.clip(); g.rotate(rot);
  g.fillStyle = "#16161a";
  const penta = (cx, cy, rr, a0) => { g.beginPath(); for (let i = 0; i < 5; i++) { const a = a0 + (i * 2 * Math.PI) / 5; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.closePath(); g.fill(); };
  penta(0, 0, r * 0.36, -Math.PI / 2);
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5 + Math.PI / 5; penta(Math.cos(a) * r * 1.02, Math.sin(a) * r * 1.02, r * 0.32, a); }
  g.strokeStyle = "rgba(20,20,26,.6)"; g.lineWidth = 1.2;
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; g.beginPath(); g.moveTo(Math.cos(a) * r * 0.36, Math.sin(a) * r * 0.36); g.lineTo(Math.cos(a) * r * 0.75, Math.sin(a) * r * 0.75); g.stroke(); }
  g.restore();
  const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
  gr.addColorStop(0, "rgba(255,255,255,.55)"); gr.addColorStop(0.55, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(0,0,0,.45)");
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(0,0,0,.6)"; g.lineWidth = 1.5; g.stroke();
  g.restore();
}

class EscenaPenalti extends Escena {
  constructor() {
    super(9.9);
    this.p = new Parts(420);
    this.p.suelo = () => PIES - 3;
    this.ESC = 1.5;
    this.tGol = 5.55; this.tLarguero = 3.22; this.tCabeza = 4.85;
    // el balón: tramos [t0, t1, desde, hasta, altura del arco, escala0, escala1]
    const pie = [318, PIES - R], cab = [275, PIES - 237 * 1.5 - R + 6];
    this.cab = cab;
    this.tramos = [
      [2.78, 3.22, pie, [812, PORT.top + 2], 120, 1, 0.82],
      [3.22, 3.7, [812, PORT.top + 2], [610, 24], 30, 0.82, 1],
      [3.7, 4.2, [610, 24], [24, 210], -20, 1, 1],
      [4.2, 4.85, [24, 210], cab, 150, 1, 1],
      [4.85, 5.55, cab, [835, 468], 170, 1, 0.78],
      [5.55, 5.95, [835, 468], [870, PIES - 46], 25, 0.78, 0.78],
      [5.95, 6.4, [870, PIES - 46], [890, PIES - 46], 14, 0.78, 0.78],
    ];
    this.choques = [[3.22, 812, PORT.top + 2], [3.7, 610, 24], [4.2, 24, 210]];
  }
  luces() {
    const t = this.t;
    const enc = (t0) => (t < t0 ? 0 : t < t0 + 0.3 ? [1, 0, 0.9, 0.2, 1, 1][Math.min(5, Math.floor((t - t0) / 0.05))] : 1);
    const apa = (t0) => (t < t0 ? 1 : t < t0 + 0.2 ? [0.3, 1, 0.15, 0][Math.min(3, Math.floor((t - t0) / 0.05))] : 0);
    return [enc(0.2) * apa(9.05), enc(0.55) * apa(8.7)];
  }
  balon() {
    const t = this.t;
    if (t < this.tramos[0][0]) return { x: this.tramos[0][2][0], y: this.tramos[0][2][1], s: 1, rot: 0 };
    for (const [t0, t1, a, b, h, s0, s1] of this.tramos) {
      if (t > t1) continue;
      const u = (t - t0) / (t1 - t0);
      return { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u) - h * 4 * u * (1 - u), s: lerp(s0, s1, u), rot: t * 14 };
    }
    const L = this.tramos[this.tramos.length - 1][3];
    return { x: L[0], y: L[1], s: 0.78, rot: 6.4 * 14 };
  }
  xAv(t) {
    if (t < 1.75) return 230;
    if (t < 2.2) return lerp(230, 175, eInOut(tramo(t, 1.75, 2.2)));
    if (t < 2.75) return lerp(175, 236, eIn(tramo(t, 2.2, 2.75)) * 0.4 + tramo(t, 2.2, 2.75) * 0.6);
    if (t < 7.15) return 236;
    return 236 + 170 * eOut(tramo(t, 7.15, 7.95));
  }
  estado() {
    const t = this.t, ESC = this.ESC;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], sx = 1, sy = 1, y = PIES, giro = 0;
    const x = this.xAv(t), bl = this.balon();
    // mira la portería y la señala: «ahí va»
    if (t > 0.8 && t < 1.75) {
      const k = eInOut(tramo(t, 0.85, 1.15)) * (1 - eInOut(tramo(t, 1.45, 1.7)));
      manoD = mezcla(manoD, [128, 96], k);
      pose.cara = t > 1.0 && t < 1.5 ? "guino" : "sonrisa";
      pose.rc = 0.08 * k;
    }
    // pasos atrás y carrerilla
    if ((t > 1.75 && t < 2.2) || (t > 2.2 && t < 2.72)) {
      const a = andar(t * (t < 2.2 ? 10 : 15), t < 2.2 ? 0.7 : 1);
      pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; y += a.bote;
      if (t > 2.2) { manoD = [80 + 8 * Math.sin(t * 15), 150]; manoI = [0 - 8 * Math.sin(t * 15), 150]; }
    }
    // el chut
    if (t >= 2.6 && t < 3.3) {
      const kAtras = eInOut(tramo(t, 2.6, 2.72)), kChut = eOut(tramo(t, 2.72, 2.86)), kVuelve = eInOut(tramo(t, 3.0, 3.3));
      const ang = lerp(lerp(0, 0.28, kAtras), -1.05, kChut) * (1 - kVuelve);
      const dy = lerp(lerp(0, -6, kAtras), -16, kChut) * (1 - kVuelve);
      pose.piernaD = [dy, ang]; pose.piernaI = [0, 0.05 * kChut * (1 - kVuelve)];
      manoI = mezcla([9, 160], [-26, 118], Math.max(kAtras, kChut) * (1 - kVuelve));
      manoD = mezcla([70, 158], [104, 140], kChut * (1 - kVuelve));
      giro = -0.07 * kChut * (1 - kVuelve);
      pose.cara = t < 2.86 ? "guino" : "sonrisa";
    }
    // ¡UUUY!: manos a la cabeza mientras sigue el balón con la mirada
    if (t >= 3.22 && t < 4.5) {
      const k = eOut(tramo(t, 3.22, 3.42)) * (1 - eInOut(tramo(t, 4.2, 4.5)));
      manoD = mezcla(manoD, [64, 16], k); manoI = mezcla(manoI, [15, 16], k);
      pose.brazoIDelante = k > 0.3;
      pose.cara = "sorpresa";
      pose.rc = clamp((bl.x - x) / 1400, -0.25, 0.25);
    }
    if (t >= 4.5 && t < this.tCabeza) { pose.cara = "sorpresa"; pose.rc = -0.05; manoD = [84, 150]; manoI = [-6, 150]; }
    // ¡BONK!: aplastado y mareado
    if (t >= this.tCabeza && t < 5.85) {
      const k = tramo(t, this.tCabeza, this.tCabeza + 0.35);
      sy = 1 - 0.12 * Math.sin(Math.PI * Math.min(1, k * 1.4)) * (1 - k * 0.3);
      sx = 1 + 0.06 * Math.sin(Math.PI * Math.min(1, k * 1.4));
      pose.cara = "dormido"; pose.rc = 0.12 * Math.sin((t - this.tCabeza) * 9);
      manoD = [86, 152]; manoI = [-8, 152];
    }
    // ¡GOOOL!: salta con los brazos arriba y se tira de rodillas
    if (t >= 5.85) {
      pose.cara = "risa";
      const kB = eOut(tramo(t, 5.85, 6.05));
      manoD = mezcla([86, 152], [96, 18], kB); manoI = mezcla([-8, 152], [-18, 18], kB);
      pose.brazoIDelante = false;
      const s1 = tramo(t, 6.05, 6.55), s2 = tramo(t, 6.6, 7.1);
      y -= 55 * 4 * s1 * (1 - s1) + 45 * 4 * s2 * (1 - s2);
      if (s1 > 0 && s1 < 1) { pose.piernaI = [-10, 0.25]; pose.piernaD = [-10, -0.25]; }
      if (s2 > 0 && s2 < 1) { pose.piernaI = [-10, 0.25]; pose.piernaD = [-10, -0.25]; }
      // de rodillas
      const kR = eOut(tramo(t, 7.1, 7.3));
      if (kR > 0) {
        sy = 1 - 0.2 * kR; pose.piernaI = [0, 0.18 * kR]; pose.piernaD = [0, -0.18 * kR];
        giro = 0.05 * kR * (1 - tramo(t, 7.6, 8.0));
        manoD = mezcla(manoD, [100, 30 + 6 * Math.sin(t * 12)], kR); manoI = mezcla(manoI, [-22, 30 - 6 * Math.sin(t * 12)], kR);
        pose.rc = -0.08 * kR;
      }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(x, y, ESC, giro, sx, sy);
    return { pose, m, x, y, bl };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    this.una("chut", t > 2.78, () => {
      temblar(6, 0.18);
      for (let i = 0; i < 12; i++) p.nueva(P.POLVO, 318 + azar(-10, 10), PIES - 6, azar(-80, 200), azar(-90, -10), azar(0.4, 0.8), azar(16, 28));
      p.nueva(P.DESTELLO, 318, PIES - R, 0, 0, 0.25, 70);
    });
    for (const [tc, cx, cy] of this.choques) this.una("choque" + tc, t > tc, () => {
      temblar(tc === this.tLarguero ? 16 : 7, tc === this.tLarguero ? 0.35 : 0.18);
      p.nueva(P.DESTELLO, cx, cy, 0, 0, 0.3, tc === this.tLarguero ? 120 : 80);
      for (let i = 0; i < (tc === this.tLarguero ? 18 : 8); i++) { const a = azar(0, 6.283), v = azar(150, 420); p.nueva(P.CHISPA, cx, cy, Math.cos(a) * v, Math.sin(a) * v, azar(0.25, 0.5), azar(6, 11)); }
    });
    this.una("cabeza", t > this.tCabeza, () => {
      temblar(12, 0.3);
      p.nueva(P.DESTELLO, this.cab[0], this.cab[1] + R, 0, 0, 0.3, 90);
    });
    this.una("gol", t > this.tGol, () => {
      temblar(22, 0.6);
      for (let i = 0; i < 160; i++) p.nueva(P.CONFETI, azar(0, W), azar(-220, -10), azar(-60, 60), azar(20, 120), azar(4, 6), azar(8, 14), [0, 2, 1, 0, 2][(Math.random() * 5) | 0]);
      for (let i = 0; i < 24; i++) { const a = azar(-Math.PI, 0), v = azar(250, 600); p.nueva(P.CHISPA, 835, 468, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(8, 14)); }
    });
    if (t > 6.2 && t < 8.4 && Math.random() < 30 * dt) p.nueva(P.CONFETI, azar(0, W), -10, azar(-40, 40), azar(40, 100), 5, azar(8, 14), [0, 2, 1][(Math.random() * 3) | 0]);
    // desliza de rodillas: polvo y césped
    if (t > 7.15 && t < 7.95 && Math.random() < 50 * dt) p.nueva(P.POLVO, e.x - 30 + azar(-10, 10), PIES - 4, azar(-160, -40), azar(-50, -5), azar(0.4, 0.8), azar(18, 32));
    // estrellitas del mareo
    const [l1, l2] = this.luces();
    p.alfa = Math.max(l1, l2);
    p.actualizar(dt);
  }
  porteria(g, t) {
    const red = (x1, y1, x2, y2) => { g.moveTo(x1, y1); g.lineTo(x2, y2); };
    const kGol = t > this.tGol ? Math.exp(-(t - this.tGol) * 3.2) : 0;
    const bulto = (x, y) => {
      if (kGol <= 0) return [x, y];
      const dx = x - 835, dy = y - 468, d2 = dx * dx + dy * dy, f = Math.exp(-d2 / 5200) * kGol * (0.6 + 0.4 * Math.cos((t - this.tGol) * 18));
      return [x + dx * 0.35 * f, y + dy * 0.35 * f + 10 * f];
    };
    // red
    g.save(); g.strokeStyle = "rgba(235,240,245,.42)"; g.lineWidth = 1.3; g.beginPath();
    const n = 14, mm = 9;
    for (let i = 0; i <= n; i++) { // verticales del fondo
      const x = lerp(BX[0], BX[1], i / n);
      for (let j = 0; j < mm; j++) { const a = bulto(x, lerp(BTOP, BBOT, j / mm)), b = bulto(x, lerp(BTOP, BBOT, (j + 1) / mm)); red(a[0], a[1], b[0], b[1]); }
    }
    for (let j = 0; j <= mm; j++) { // horizontales del fondo
      const y = lerp(BTOP, BBOT, j / mm);
      for (let i = 0; i < n; i++) { const a = bulto(lerp(BX[0], BX[1], i / n), y), b = bulto(lerp(BX[0], BX[1], (i + 1) / n), y); red(a[0], a[1], b[0], b[1]); }
    }
    for (let i = 0; i <= 5; i++) { // laterales y techo
      const k = i / 5;
      red(lerp(PORT.x0, BX[0], k), lerp(PORT.top, BTOP, k), lerp(PORT.x0, BX[0], k), lerp(PIES - 4, BBOT, k));
      red(lerp(PORT.x1, BX[1], k), lerp(PORT.top, BTOP, k), lerp(PORT.x1, BX[1], k), lerp(PIES - 4, BBOT, k));
    }
    for (let j = 1; j < 6; j++) {
      const y0 = lerp(PORT.top, PIES - 4, j / 6), y1 = lerp(BTOP, BBOT, j / 6);
      red(PORT.x0, y0, BX[0], y1); red(PORT.x1, y0, BX[1], y1);
    }
    for (let i = 0; i <= n; i++) red(lerp(PORT.x0, PORT.x1, i / n), PORT.top, lerp(BX[0], BX[1], i / n), BTOP);
    g.stroke();
    // marco trasero fino
    g.strokeStyle = "rgba(220,225,230,.7)"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(BX[0], BBOT); g.lineTo(BX[0], BTOP); g.lineTo(BX[1], BTOP); g.lineTo(BX[1], BBOT); g.stroke();
    g.restore();
    // palos y larguero (el larguero vibra tras el golpe)
    const kL = t > this.tLarguero ? Math.exp(-(t - this.tLarguero) * 4) : 0;
    const vib = 7 * kL * Math.sin((t - this.tLarguero) * 70);
    const palo = (x0, y0, x1, y1, cx, cy) => {
      g.lineCap = "round";
      g.strokeStyle = "rgba(0,0,0,.5)"; g.lineWidth = 15; g.beginPath(); g.moveTo(x0 + 2, y0 + 2); g.quadraticCurveTo(cx + 2, cy + 2, x1 + 2, y1 + 2); g.stroke();
      g.strokeStyle = "#e9edf0"; g.lineWidth = 12; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke();
      g.strokeStyle = "rgba(255,255,255,.95)"; g.lineWidth = 4; g.beginPath(); g.moveTo(x0 - 2, y0 - 2); g.quadraticCurveTo(cx - 2, cy - 2, x1 - 2, y1 - 2); g.stroke();
    };
    palo(PORT.x0, PIES - 2, PORT.x0, PORT.top, PORT.x0, (PIES + PORT.top) / 2);
    palo(PORT.x1, PIES - 2, PORT.x1, PORT.top, PORT.x1, (PIES + PORT.top) / 2);
    palo(PORT.x0, PORT.top, PORT.x1, PORT.top, (PORT.x0 + PORT.x1) / 2 + 20, PORT.top + vib * 2);
  }
  campo(g, a) {
    if (a <= 0) return;
    g.save(); g.globalAlpha = a;
    const gr = g.createLinearGradient(0, 400, 0, H);
    gr.addColorStop(0, "#0a2a10"); gr.addColorStop(0.4, "#14501f"); gr.addColorStop(1, "#1d6a2a");
    g.fillStyle = gr; g.fillRect(-60, 400, W + 120, H);
    // franjas del césped
    g.fillStyle = "rgba(255,255,255,.045)";
    for (let i = -2; i < 10; i += 2) { g.beginPath(); g.moveTo(i * 120, 400); g.lineTo((i + 1) * 120, 400); g.lineTo((i + 1) * 150 - 80, H + 60); g.lineTo(i * 150 - 80, H + 60); g.closePath(); g.fill(); }
    // la niebla negra del fondo (noche)
    const gn = g.createLinearGradient(0, 380, 0, 470);
    gn.addColorStop(0, "rgba(0,0,0,1)"); gn.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gn; g.fillRect(-60, 380, W + 120, 90);
    // líneas: área y punto de penalti
    g.strokeStyle = "rgba(255,255,255,.65)"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(560, PIES + 18); g.lineTo(590, 470); g.lineTo(1100, 470); g.stroke();
    g.fillStyle = "rgba(255,255,255,.75)"; g.beginPath(); g.ellipse(318, PIES - 1, 12, 3.5, 0, 0, 6.283); g.fill();
    g.restore();
  }
  focos(g, l1, l2, t) {
    // dos torres de focos arriba en las esquinas
    const vis = Math.max(l1, l2);
    for (const [x, a, lado] of [[70, l1, -1], [954, l2, 1]]) {
      g.save(); g.translate(x, 44); g.globalAlpha = vis;
      g.fillStyle = "#1d2127"; rectR(g, -62, -26, 124, 52, 6); g.fill();
      g.strokeStyle = "#3a4048"; g.lineWidth = 3; g.stroke();
      for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
        const bx = -45 + c * 30, by = -12 + r * 24;
        g.fillStyle = a > 0.5 ? "#fffbe8" : "#3b3f45";
        g.beginPath(); g.arc(bx, by, 9, 0, 6.283); g.fill();
      }
      if (a > 0) { g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8 * a; g.drawImage(BLOB.blanco, -110, -80, 220, 160); }
      g.restore();
      if (a > 0) {
        g.save(); g.globalCompositeOperation = "lighter";
        const gr = g.createLinearGradient(0, 40, 0, PIES);
        gr.addColorStop(0, `rgba(255,250,225,${0.16 * a})`); gr.addColorStop(1, `rgba(255,250,225,${0.03 * a})`);
        g.fillStyle = gr; g.beginPath();
        g.moveTo(x - 50, 50); g.lineTo(x + 50, 50);
        if (lado < 0) { g.lineTo(760, PIES + 20); g.lineTo(80, PIES + 20); } else { g.lineTo(980, PIES + 20); g.lineTo(240, PIES + 20); }
        g.closePath(); g.fill(); g.restore();
      }
    }
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), [l1, l2] = this.luces(), luz = Math.max(l1 * 0.5 + l2 * 0.5, Math.max(l1, l2) * 0.55);
    fondo(g, "#000");
    this.campo(g, luz);
    g.save(); g.globalAlpha = luz;
    this.porteria(g, t);
    g.restore();
    this.focos(g, l1, l2, t);
    // sombra del balón y del avatar
    const bl = e.bl;
    g.save(); g.globalAlpha = 0.45 * luz;
    g.fillStyle = "#000";
    const alt = clamp((PIES - bl.y) / 400, 0, 1);
    if (bl.x < 980) { g.beginPath(); g.ellipse(bl.x + 6, Math.min(PIES - 2, bl.y > BTOP && bl.x > PORT.x0 ? bl.y + R * bl.s : PIES - 2), R * (1.1 - 0.5 * alt), 5 * (1 - 0.5 * alt), 0, 0, 6.283); g.fill(); }
    g.beginPath(); g.ellipse(e.x, PIES - 1, 70, 9, 0, 0, 6.283); g.fill();
    g.restore();
    // el balón va detrás de la red cuando ya está dentro
    const dentro = t > this.tGol;
    const pintaBalon = () => { g.save(); g.globalAlpha = luz; balon(g, bl.x, bl.y, R * bl.s, bl.rot); g.restore(); };
    if (dentro) { pintaBalon(); g.save(); g.globalAlpha = 0.55 * luz; this.porteria(g, t); g.restore(); }
    // ¡GOOOL!
    if (t > this.tGol) {
      const n = Math.min(4, Math.floor((t - this.tGol) / 0.16));
      const k = tramo(t, this.tGol, this.tGol + 0.18);
      const c = cartel("gol" + n, "¡GO" + "O".repeat(n) + "L!", {
        tam: 150, peso: 900, fam: FD, borde: "#062a10", bordeAncho: 12, esp: 4, glow: "rgba(43,255,91,.75)", glowTam: 26,
        color: (gg, cv) => { const gr = gg.createLinearGradient(0, cv.height * 0.2, 0, cv.height * 0.8); gr.addColorStop(0, "#f2fff4"); gr.addColorStop(0.5, "#7dff98"); gr.addColorStop(1, "#16c43e"); return gr; },
      });
      const lat = 1 + 0.04 * Math.sin((t - this.tGol) * 12) * (1 - tramo(t, 6.6, 7.4));
      ponCartel(g, c, W / 2, 150, lerp(2.6, 1, eIn(k)) * lat, Math.min(1, k * 3) * luz);
    }
    g.save(); g.globalAlpha = luz;
    pintarAvatar(g, e.m, e.pose, t);
    g.restore();
    if (!dentro) pintaBalon();
    // estrellitas del mareo
    if (t > this.tCabeza && t < 6.0) {
      const c = aPant(e.m, [39, 6]), k = 1 - tramo(t, 5.75, 6.0);
      for (let i = 0; i < 4; i++) {
        const a = t * 7 + (i * Math.PI) / 2, x = c[0] + Math.cos(a) * 52, y = c[1] - 6 + Math.sin(a) * 14;
        g.save(); g.globalAlpha = k * luz; estrella(g, x, y, 11, 4.5, a); g.fillStyle = "#ffd34d"; g.fill(); g.strokeStyle = "#7a4b00"; g.lineWidth = 2; g.stroke(); g.restore();
      }
    }
    this.p.dibujar(g);
    // ¡UUUY!
    if (t > this.tLarguero && t < 4.55) {
      const k = tramo(t, this.tLarguero, this.tLarguero + 0.2), a = 1 - tramo(t, 4.25, 4.55);
      const c = cartel("uy", "¡UUUY!", { tam: 120, fam: FC, color: "#ffffff", borde: "#b0122a", bordeAncho: 12, esp: 4 });
      ponCartel(g, c, 520 + azar(-3, 3) * (1 - k), 300, lerp(0.3, 1, eBack(k)) * (1 + 0.06 * tramo(t, 3.4, 4.5)), a * luz, -0.06);
    }
    // ¡BONK!
    if (t > this.tCabeza && t < 5.6) {
      const k = tramo(t, this.tCabeza, this.tCabeza + 0.14), a = 1 - tramo(t, 5.35, 5.6);
      const c = cartel("bonk", "¡BONK!", { tam: 62, fam: FC, color: "#ffd34d", borde: "#3a2400", bordeAncho: 8, esp: 2 });
      ponCartel(g, c, this.cab[0] - 140, this.cab[1] - 40, eBack(k), a * luz, -0.18);
    }
  }
}

registrar({ id: "00020", nombre: "Penalti", crear: () => new EscenaPenalti() });
})();
