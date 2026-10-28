"use strict";
/*
 * 00061 · DÍA DE PLAYA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se abre un círculo sobre la playa: Guillermo, tumbado en la tumbona bajo la sombrilla, da un trago a una lata
 * helada con los ojos cerrados. Detrás crece una ola enorme; abre un ojo… y la ola se lo come todo. El agua se
 * retira: está empapado, la sombrilla del revés y un cangrejo en la cabeza. ¡QUÉ FRESQUITO!, tiritando con una
 * sonrisa forzada. El círculo se cierra sobre el cangrejo, que se despide con la pinza.
 */
(() => {
const cache = cacheTexto();
const HORIZONTE = 300, ARENA = 392;

/** Cangrejo rojo; (0, 0) = donde apoya las patas. k = abre las pinzas (0–1). */
function cangrejo(g, k, saluda, t) {
  g.save();
  g.lineCap = "round"; g.lineJoin = "round";
  // patas
  g.strokeStyle = "#a8200f"; g.lineWidth = 3;
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    const x0 = s * (8 + i * 4), ph = Math.sin(t * 14 + i) * 1.5;
    g.beginPath(); g.moveTo(x0, -8); g.lineTo(x0 + s * 9, -10 + ph); g.lineTo(x0 + s * 13, 0); g.stroke();
  }
  // pinzas
  for (const s of [-1, 1]) {
    const arriba = s > 0 && saluda > 0 ? saluda : 0;
    g.save(); g.translate(s * 16, -16); g.rotate(s * (0.5 + 0.9 * arriba + 0.25 * Math.sin(t * 16) * arriba));
    g.strokeStyle = "#a8200f"; g.lineWidth = 3.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(s * 4, -10); g.stroke();
    g.translate(s * 4, -14);
    const ab = 0.15 + 0.5 * k;
    g.fillStyle = "#e8381e"; g.strokeStyle = "#7d1608"; g.lineWidth = 1.2;
    g.beginPath(); g.ellipse(0, -2, 6.5, 8, 0, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = "#e8381e";
    g.save(); g.rotate(-ab); g.beginPath(); g.ellipse(-2.5, -9, 2.6, 6, -0.2, 0, 6.283); g.fill(); g.stroke(); g.restore();
    g.save(); g.rotate(ab); g.beginPath(); g.ellipse(2.5, -9, 2.6, 6, 0.2, 0, 6.283); g.fill(); g.stroke(); g.restore();
    g.restore();
  }
  // cuerpo
  const gr = g.createRadialGradient(-5, -16, 2, 0, -11, 18);
  gr.addColorStop(0, "#ff7a52"); gr.addColorStop(0.6, "#e0331b"); gr.addColorStop(1, "#8f1a0a");
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, -11, 16, 10, 0, 0, 6.283); g.fill();
  g.strokeStyle = "#6f1306"; g.lineWidth = 1.2; g.stroke();
  g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.ellipse(-6, -16, 5, 2.4, -0.3, 0, 6.283); g.fill();
  // ojos en palito
  for (const s of [-1, 1]) {
    g.strokeStyle = "#8f1a0a"; g.lineWidth = 2; g.beginPath(); g.moveTo(s * 4, -19); g.lineTo(s * 6, -27); g.stroke();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(s * 6, -29, 3.6, 0, 6.283); g.fill();
    g.fillStyle = "#111"; g.beginPath(); g.arc(s * 6 + 0.8, -29, 1.8, 0, 6.283); g.fill();
  }
  // boca sonriente
  g.strokeStyle = "#5a0f05"; g.lineWidth = 1.4; g.beginPath(); g.arc(0, -10, 4, 0.3, Math.PI - 0.3); g.stroke();
  g.restore();
}

class EscenaPlaya extends Escena {
  constructor() {
    super(9.9);
    this.p = new Parts(420);
    this.ESC = 1.55; this.CAD = [486, 446]; // caderas en la pantalla
    this.capa = lienzoNuevo(600, 480); this.CAPA = [170, 110]; // capa para pintar al avatar mojado
    this.gotas = [];
    this.fondoC = this.pintarFondo();
    this.flash = 0;
  }
  pintarFondo() {
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    const gc = g.createLinearGradient(0, 0, 0, HORIZONTE);
    gc.addColorStop(0, "#2f9fe0"); gc.addColorStop(1, "#bfeeff");
    g.fillStyle = gc; g.fillRect(0, 0, W, HORIZONTE);
    // sol
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.9; g.drawImage(BLOB.amarillo, 760, -60, 260, 260); g.restore();
    g.fillStyle = "#fff6c4"; g.beginPath(); g.arc(890, 70, 46, 0, 6.283); g.fill();
    // nubes
    g.fillStyle = "rgba(255,255,255,.9)";
    for (const [x, y, s] of [[120, 80, 1], [520, 50, 0.8], [690, 130, 0.6]]) {
      g.beginPath(); g.arc(x, y, 26 * s, 0, 6.283); g.arc(x + 30 * s, y - 12 * s, 32 * s, 0, 6.283); g.arc(x + 64 * s, y, 24 * s, 0, 6.283); g.rect(x, y - 4 * s, 64 * s, 24 * s); g.fill();
    }
    // mar
    const gm = g.createLinearGradient(0, HORIZONTE, 0, ARENA);
    gm.addColorStop(0, "#0d5fa8"); gm.addColorStop(1, "#22b8c9");
    g.fillStyle = gm; g.fillRect(0, HORIZONTE, W, ARENA - HORIZONTE + 10);
    // arena
    const ga = g.createLinearGradient(0, ARENA, 0, H);
    ga.addColorStop(0, "#f6dfa6"); ga.addColorStop(1, "#d9ad62");
    g.fillStyle = ga;
    g.beginPath(); g.moveTo(0, ARENA + 8); for (let x = 0; x <= W; x += 32) g.lineTo(x, ARENA + 4 * Math.sin(x * 0.02)); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
    const r = semilla(7);
    g.fillStyle = "rgba(150,110,50,.35)";
    for (let i = 0; i < 160; i++) g.fillRect(r() * W, ARENA + 10 + r() * (H - ARENA), 2, 2);
    // conchas
    for (const [x, y] of [[90, 540], [860, 520], [960, 575]]) {
      g.fillStyle = "#ffe3d6"; g.beginPath(); g.arc(x, y, 9, Math.PI, 0); g.closePath(); g.fill();
      g.strokeStyle = "rgba(190,110,90,.7)"; g.lineWidth = 1; g.beginPath();
      for (let a = 0.3; a < 3; a += 0.55) { g.moveTo(x, y); g.lineTo(x + Math.cos(Math.PI + a) * 9, y + Math.sin(Math.PI + a) * 9); } g.stroke();
    }
    return c;
  }
  /** Altura y avance de la ola: 0 = no hay, 1 = encima. */
  ola() { return eInOut(tramo(this.t, 2.6, 3.9)); }
  frente() { // x del frente del agua que barre la pantalla
    const t = this.t;
    if (t < 3.9) return W + 400;
    if (t < 4.25) return lerp(780, -420, eIn(tramo(t, 3.9, 4.25)));
    return -420;
  }
  nivel() { return lerp(-80, H + 60, eIn(tramo(this.t, 4.42, 4.9))); } // el agua baja
  mojado() { return this.t > 4.25; }
  estado() {
    const t = this.t;
    const pose = { cara: "dormido", rc: -0.05, piernaI: [0, -0.62], piernaD: [0, -0.5] };
    let manoD = [60, 128], manoI = [16, 34], angLata = -0.15, giro = -0.82;
    pose.brazoIDelante = false;
    // trago de lata con los ojos cerrados
    const kBoca = eInOut(tramo(t, 1.2, 1.5)) * (1 - eInOut(tramo(t, 2.35, 2.65)));
    const kTrago = eInOut(tramo(t, 1.5, 2.2)) * (1 - eInOut(tramo(t, 2.35, 2.65)));
    pose.rc = -0.05 - 0.2 * kTrago;
    angLata = lerp(-0.15, -0.5, kBoca) - 1.2 * kTrago;
    if (kBoca > 0) { const b = boca(pose.rc), tope = rot2([1.5, -13], angLata); manoD = mezcla(manoD, [b[0] - tope[0] + 2, b[1] - tope[1] + 1], kBoca); }
    if (t > 2.65 && t < 3.25) pose.cara = "sonrisa";
    if (t >= 3.25 && t < 3.65) pose.cara = "guino"; // abre un ojo…
    if (t >= 3.65 && t < 4.3) { pose.cara = "sorpresa"; pose.rc = 0.1 * Math.sin(t * 40); manoI = mezcla(manoI, [-14, 60], tramo(t, 3.65, 3.85)); }
    // después de la ola: empapado, tiritando, con el cangrejo
    let tirita = 0;
    if (t >= 4.3) {
      pose.cara = t < 6.0 ? "sorpresa" : t < 8.3 ? "sonrisa" : "borracho";
      manoI = [-14, 60];
      manoD = [64, 132];
      angLata = 0.25;
      if (t > 5.3) tirita = 1;
      pose.rc = -0.03 + (tirita ? 0.025 * Math.sin(t * 55) : 0);
      manoI = mezcla([-14, 60], [6, 120], eInOut(tramo(t, 4.9, 5.4)));
      if (t > 5.4) manoI = [6 + Math.sin(t * 50) * 1.2, 120];
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const lata = t < 4.3;
    pose.objD = (g, m) => dibujarLata(g, m[0], m[1] - 1, angLata, { abierta: true });
    if (!lata) pose.objD = (g, m) => { dibujarLata(g, m[0], m[1] - 1, angLata, { abierta: true }); };
    const dx = tirita ? Math.sin(t * 60) * 1.5 : 0;
    const m = matAv(this.CAD[0] + dx, this.CAD[1], this.ESC, giro, 1, 1, [39, 146]);
    return { pose, m, giro };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    // la lata suelta vaho de lo fría que está
    if (t < 3.9 && Math.random() < 10 * dt) { const q = aPant(e.m, e.pose._manoD || [60, 128]); p.nueva(P.VAPOR, q[0] + azar(-8, 8), q[1] - 10, azar(-10, 10), azar(-40, -15), azar(0.6, 1), azar(8, 14)); }
    // la ola rompe
    this.una("rompe", t > 3.95, () => temblar(10, 0.4));
    if (t > 3.95 && t < 4.35) {
      const F = this.frente();
      for (let i = 0; i < 14; i++) p.nueva(P.ESPUMA, F + azar(-20, 40), azar(-40, H), azar(-700, -300), azar(-500, 100), azar(0.4, 0.9), azar(6, 14));
    }
    this.una("encima", t > 4.3, () => { temblar(26, 0.7); this.flash = 0.35; });
    // se retira: gotas por todas partes
    if (t > 4.45 && t < 5.0) for (let i = 0; i < 4; i++) p.nueva(P.ESPUMA, azar(0, W), this.nivel() + azar(-10, 10), azar(-60, 60), azar(-260, -60), azar(0.4, 0.8), azar(4, 9));
    if (this.mojado() && t > 4.5 && Math.random() < 14 * dt) {
      const pt = [[20, 0], [55, 10], [30, 150], [60, 200], [80, 222], [10, 90], [70, 120]][(Math.random() * 7) | 0];
      const q = aPant(e.m, pt);
      this.gotas.push({ x: q[0], y: q[1], vy: azar(0, 60), s: azar(2.5, 4.5) });
    }
    for (const d of this.gotas) { d.vy += 1300 * dt; d.y += d.vy * dt; }
    this.gotas = this.gotas.filter((d) => d.y < 560);
    this.una("fresquito", t > 6.0, () => temblar(8, 0.3));
    this.flash = Math.max(0, this.flash - dt * 2);
    p.actualizar(dt);
  }
  /** La ola que crece detrás y se riza hacia él. k: 0–1. */
  olaGigante(g, k, t) {
    const base = ARENA + 6, xc = lerp(1180, 700, k), yt = lerp(HORIZONTE + 10, 30, k);
    const L = lerp(30, 250, k), D = lerp(10, 150, k), xb = xc - lerp(60, 150, k);
    const gw = g.createLinearGradient(0, yt, 0, base);
    gw.addColorStop(0, "#5fe0f0"); gw.addColorStop(0.45, "#1a9bd0"); gw.addColorStop(1, "#0b4f96");
    // cuerpo de la ola
    g.fillStyle = gw;
    g.beginPath(); g.moveTo(xb, base);
    g.bezierCurveTo(xb + 30, base - (base - yt) * 0.5, xc - 50, yt + 70, xc, yt);
    g.bezierCurveTo(xc + 140, yt - 25, W + 20, yt + 40, W + 80, yt + 70);
    g.lineTo(W + 80, base); g.closePath(); g.fill();
    // sombra dentro del tubo
    g.fillStyle = "rgba(4,40,90,.45)";
    g.beginPath(); g.moveTo(xc + 10, yt + 26);
    g.quadraticCurveTo(xc - L * 0.5, yt + 8, xc - L * 0.82, yt + D * 0.85);
    g.quadraticCurveTo(xc - L * 0.5, yt + D * 1.25, xb + 10, base - 20);
    g.bezierCurveTo(xb + 30, base - (base - yt) * 0.5, xc - 50, yt + 70, xc + 10, yt + 26); g.fill();
    // labio que se riza hacia delante
    const gl = g.createLinearGradient(xc - L, yt, xc + 40, yt + D);
    gl.addColorStop(0, "#9af2ff"); gl.addColorStop(1, "#2cb4dc");
    g.fillStyle = gl;
    g.beginPath(); g.moveTo(xc + 50, yt - 4);
    g.quadraticCurveTo(xc - L * 0.55, yt - 50 * k, xc - L, yt + D * 0.55);
    g.quadraticCurveTo(xc - L * 1.02, yt + D * 0.95, xc - L * 0.78, yt + D * 0.9);
    g.quadraticCurveTo(xc - L * 0.72, yt + D * 0.45, xc - L * 0.4, yt + 22);
    g.quadraticCurveTo(xc - 10, yt + 6, xc + 10, yt + 28); g.closePath(); g.fill();
    // espuma de la cresta
    g.fillStyle = "#f6feff";
    for (let i = 0; i < 16; i++) {
      const u = i / 15;
      const x = lerp(xc + 60, xc - L * 0.98, u), y = lerp(yt - 4, yt - 50 * k * 0.5, Math.sin(u * Math.PI)) + (u > 0.75 ? (u - 0.75) * 4 * D * 0.6 : 0);
      g.beginPath(); g.arc(x, y + 3 * Math.sin(t * 12 + i), (8 + 10 * k) * (0.8 + 0.3 * Math.sin(i * 2.7)), 0, 6.283); g.fill();
    }
    // vetas
    g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 4; g.lineCap = "round";
    for (let i = 0; i < 5; i++) { const y = yt + 90 + i * 55; if (y > base - 10) break; g.beginPath(); g.moveTo(xc + 40 + i * 30, y); g.quadraticCurveTo(xc + 120 + i * 30, y - 12, xc + 200 + i * 30, y); g.stroke(); }
  }
  sombrilla(g, t) {
    const mojada = this.mojado() && this.t > 4.45;
    const x0 = 286, y0 = 560, ang = mojada ? 0.26 : -0.08;
    g.save(); g.translate(x0, y0); g.rotate(ang);
    // palo
    g.fillStyle = "#d9d2c3"; g.fillRect(-4, -390, 8, 390);
    g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(1, -390, 3, 390);
    // tela: gajos rojos y blancos (del revés después de la ola)
    g.translate(0, -390);
    const R = 190, alto = mojada ? -70 : 92;
    for (let i = 0; i < 8; i++) {
      const a0 = -R + (i * 2 * R) / 8, a1 = a0 + (2 * R) / 8;
      g.fillStyle = i % 2 ? "#fffaf0" : "#e8392b";
      g.beginPath(); g.moveTo(0, -alto * 0.95);
      g.lineTo(a0 * 1.0, 26 - Math.abs(a0) * 0.02); g.quadraticCurveTo((a0 + a1) / 2, 40, a1, 26 - Math.abs(a1) * 0.02);
      g.closePath(); g.fill();
    }
    g.strokeStyle = "rgba(0,0,0,.18)"; g.lineWidth = 1.5;
    g.beginPath(); for (let i = 0; i <= 8; i++) { const a = -R + (i * 2 * R) / 8; g.moveTo(0, -alto * 0.95); g.lineTo(a, 26 - Math.abs(a) * 0.02); } g.stroke();
    g.fillStyle = "#c7b9a0"; g.beginPath(); g.arc(0, -alto * 0.95, 6, 0, 6.283); g.fill();
    if (mojada) {
      // alga colgando
      g.strokeStyle = "#2f7d32"; g.lineWidth = 6; g.lineCap = "round";
      g.beginPath(); g.moveTo(-120, 32); g.quadraticCurveTo(-112 + 6 * Math.sin(t * 3), 70, -126, 104); g.stroke();
      g.strokeStyle = "#4caf50"; g.lineWidth = 3;
      g.beginPath(); g.moveTo(-120, 32); g.quadraticCurveTo(-112 + 6 * Math.sin(t * 3), 70, -126, 104); g.stroke();
    }
    g.restore();
  }
  tumbona(g, e) {
    // el respaldo va con el cuerpo y la parte de las piernas con los muslos
    const m = e.m;
    const lienzo = (pts, rayas) => {
      const q = pts.map((p) => aPant(m, p));
      g.save();
      g.beginPath(); q.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath();
      g.fillStyle = "#1f74c9"; g.fill();
      g.clip();
      g.strokeStyle = "#f4f7fb"; g.lineWidth = 9;
      for (const r of rayas) { const a = aPant(m, r[0]), b = aPant(m, r[1]); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
      g.restore();
      g.strokeStyle = "#8a5a2c"; g.lineWidth = 6; g.lineJoin = "round";
      g.beginPath(); q.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.stroke();
    };
    // respaldo (en unidades del avatar, por detrás del cuerpo)
    const rayasR = []; for (let x = -10; x <= 90; x += 16) rayasR.push([[x, -20], [x, 160]]);
    lienzo([[-6, 2], [84, 2], [84, 150], [-6, 150]], rayasR);
    // asiento y reposapiés: en la dirección de las piernas
    const ang = -0.56;
    const P0 = aPant(m, [39, 146]);
    const dir = rot2([0, 1], e.giro + ang), nor = [dir[1], -dir[0]];
    const L = 120 * this.ESC, A = 36 * this.ESC;
    const esq = [[P0[0] + nor[0] * A * 0.3, P0[1] + nor[1] * A * 0.3], [P0[0] + dir[0] * L + nor[0] * A * 0.3, P0[1] + dir[1] * L + nor[1] * A * 0.3], [P0[0] + dir[0] * L - nor[0] * A, P0[1] + dir[1] * L - nor[1] * A], [P0[0] - nor[0] * A, P0[1] - nor[1] * A]];
    g.save(); g.beginPath(); esq.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath();
    g.fillStyle = "#1f74c9"; g.fill(); g.clip();
    g.strokeStyle = "#f4f7fb"; g.lineWidth = 9;
    for (let k = 0; k < 8; k++) { const s = k * 20; g.beginPath(); g.moveTo(P0[0] + dir[0] * s - nor[0] * 80, P0[1] + dir[1] * s - nor[1] * 80); g.lineTo(P0[0] + dir[0] * s + nor[0] * 80, P0[1] + dir[1] * s + nor[1] * 80); g.stroke(); }
    g.restore();
    g.strokeStyle = "#8a5a2c"; g.lineWidth = 6; g.lineJoin = "round";
    g.beginPath(); esq.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.stroke();
    // patas de madera hasta la arena
    g.strokeStyle = "#6b4321"; g.lineWidth = 7; g.lineCap = "round";
    const pie = (a, b) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
    const tope = aPant(m, [39, 10]);
    pie(esq[3], [esq[3][0] - 30, 552]); pie(esq[2], [esq[2][0] + 6, 552]);
    pie(tope, [tope[0] + 40, 552]);
    g.fillStyle = "rgba(90,60,20,.25)"; g.beginPath(); g.ellipse(470, 556, 230, 14, 0, 0, 6.283); g.fill();
  }
  dibujarAvatar(g, e, t) {
    if (!this.mojado()) { pintarAvatar(g, e.m, e.pose, t); return; }
    // empapado: el avatar con un velo azul y brillos de agua
    const c = this.capa, x = c.getContext("2d");
    x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height);
    x.translate(-this.CAPA[0], -this.CAPA[1]);
    pintarAvatar(x, e.m, e.pose, t);
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.globalCompositeOperation = "source-atop";
    x.fillStyle = "rgba(40,120,210,.28)"; x.fillRect(0, 0, c.width, c.height);
    x.globalCompositeOperation = "source-over";
    g.drawImage(c, this.CAPA[0], this.CAPA[1]);
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    g.drawImage(this.fondoC, 0, 0);
    // olitas y la ola gigante que crece detrás
    const k = this.ola();
    g.save();
    g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const y = HORIZONTE + 16 + i * 22, off = (t * (30 + i * 12)) % 80;
      g.beginPath(); for (let x = -80 + off; x < W; x += 80) { g.moveTo(x, y); g.quadraticCurveTo(x + 20, y - 7, x + 40, y); } g.stroke();
    }
    if (k > 0 && t < 4.3) this.olaGigante(g, k, t);
    g.restore();
    this.sombrilla(g, t);
    this.tumbona(g, e);
    this.dibujarAvatar(g, e, t);
    // cangrejo en la cabeza
    if (this.mojado()) {
      const q = aPant(e.m, [30, -4]);
      const ab = Math.max(0, Math.sin(t * 9)) * (t > 5.2 && t < 6 ? 1 : 0.3);
      g.save(); g.translate(q[0] + 6, q[1] + 10); g.rotate(-0.4); g.scale(1.75, 1.75);
      cangrejo(g, ab, t > 8.3 ? tramo(t, 8.3, 8.6) : 0, t); g.restore();
    }
    // tiritona: rayitas a los lados
    if (t > 5.3 && t < 8.6) {
      g.save(); g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = 3; g.lineCap = "round";
      for (const [px, py, s] of [[-12, 40, -1], [-16, 110, -1], [92, 60, 1], [96, 130, 1]]) {
        const q = aPant(e.m, [px, py]), j = Math.sin(t * 40 + px) * 3;
        for (let i = 0; i < 2; i++) { g.beginPath(); g.moveTo(q[0] + s * (6 + i * 9) + j, q[1] - 10); g.lineTo(q[0] + s * (6 + i * 9) - j, q[1] + 10); g.stroke(); }
      }
      g.restore();
    }
    // gotas de agua
    g.fillStyle = "#bfe9ff";
    for (const d of this.gotas) { g.beginPath(); g.ellipse(d.x, d.y, d.s * 0.6, d.s, 0, 0, 6.283); g.fill(); }
    if (this.mojado()) { g.fillStyle = "rgba(60,140,220,.25)"; g.beginPath(); g.ellipse(480, 560, 180, 12, 0, 0, 6.283); g.fill(); }
    // el agua que lo barre todo
    const F = this.frente(), N = this.nivel();
    if (t > 3.95 && N < H) {
      const top = t < 4.42 ? -80 : N;
      g.save(); g.globalAlpha = t < 4.25 ? 0.97 : lerp(0.97, 0.72, tramo(t, 4.25, 4.4));
      const gw = g.createLinearGradient(0, 0, 0, H);
      gw.addColorStop(0, "#2fc3e0"); gw.addColorStop(1, "#0a4c91");
      g.fillStyle = gw;
      g.beginPath(); g.moveTo(W + 80, top);
      if (t < 4.25) { g.lineTo(F - 60, top); g.bezierCurveTo(F - 200, 120, F + 40, 330, F + 120, H + 80); }
      else { for (let x = W + 80; x >= -80; x -= 64) g.lineTo(x, top + 10 * Math.sin(x * 0.03 + t * 12)); }
      g.lineTo(-80, H + 80); g.lineTo(W + 80, H + 80); g.closePath(); g.fill();
      g.fillStyle = "rgba(255,255,255,.4)";
      for (let i = 0; i < 9; i++) { const y = (top + 40 + i * 70); if (y < H) g.fillRect(((i * 173 + t * 300) % (W + 200)) - 100, y, 90, 6); }
      if (t < 4.25) {
        // frente de espuma
        g.fillStyle = "#f6feff";
        for (let i = 0; i < 16; i++) {
          const u = i / 15, x = (1 - u) * (1 - u) * (1 - u) * (F - 60) + 3 * u * (1 - u) * (1 - u) * (F - 200) + 3 * u * u * (1 - u) * (F + 40) + u * u * u * (F + 120);
          const y = (1 - u) * (1 - u) * (1 - u) * top + 3 * u * (1 - u) * (1 - u) * 120 + 3 * u * u * (1 - u) * 330 + u * u * u * (H + 80);
          g.beginPath(); g.arc(x + 10, y, 30 + 14 * Math.sin(i * 1.9 + t * 20), 0, 6.283); g.fill();
        }
      } else {
        // burbujas bajo el agua
        g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = 3;
        for (let i = 0; i < 26; i++) { const x = (i * 97) % W, y = H - ((t - 4.25) * 700 + i * 53) % H; if (y > top + 8) { g.beginPath(); g.arc(x, y, 5 + (i % 4) * 3, 0, 6.283); g.stroke(); } }
      }
      g.restore();
    }
    this.p.dibujar(g);
    // ¡QUÉ FRESQUITO!
    if (t > 6.0 && t < 8.9) {
      const kk = tramo(t, 6.0, 6.25), s = eBack(kk);
      const spr = this.rotulo();
      g.save(); g.translate(W / 2 + 120 + Math.sin(t * 50) * 2, 110); g.rotate(-0.05); g.scale(s, s);
      g.globalAlpha = 1 - tramo(t, 8.55, 8.9);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2);
      g.restore();
    }
    if (this.flash > 0) { g.fillStyle = `rgba(230,250,255,${this.flash})`; g.fillRect(-60, -60, W + 120, H + 120); }
    // iris: se abre al principio y se cierra sobre el cangrejo
    const cab = aPant(e.m, [30, -10]);
    let r = 1e4, cx = W / 2, cy = H / 2;
    if (t < 0.8) { r = lerp(0, 760, eIn(tramo(t, 0.05, 0.8))); cx = cab[0]; cy = cab[1] + 80; }
    else if (t > 8.4) { r = lerp(760, 0, eInOut(tramo(t, 8.4, 9.7))); r = Math.max(0, r); const kk = tramo(t, 8.4, 9.0); cx = lerp(W / 2, cab[0], kk); cy = lerp(H / 2, cab[1] - 8, kk); if (t > 9.7) r = 0; }
    if (r < 1300) {
      g.save(); g.fillStyle = "#000"; g.beginPath(); g.rect(-60, -60, W + 120, H + 120);
      if (r > 0.5) { g.moveTo(cx + r, cy); g.arc(cx, cy, r, 0, Math.PI * 2); }
      g.fill("evenodd"); g.restore();
    }
  }
  rotulo() {
    if (cache.has("fresco")) return cache.get("fresco");
    const c = lienzoNuevo(720, 170), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 140);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.55, "#bff4ff"); gr.addColorStop(1, "#4fc6ff");
    txt(g, "¡QUÉ FRESQUITO!", 360, 122, { tam: 104, peso: 400, fam: FC, color: gr, borde: "#0b3a6e", bordeAncho: 12, esp: 3, max: 680 });
    // carámbanos
    g.fillStyle = "#dff8ff";
    for (let i = 0; i < 9; i++) { const x = 90 + i * 66; g.beginPath(); g.moveTo(x - 7, 128); g.lineTo(x + 7, 128); g.lineTo(x, 146 + (i % 3) * 7); g.closePath(); g.fill(); }
    cache.set("fresco", c);
    return c;
  }
}

registrar({ id: "00061", nombre: "Día de playa", crear: () => new EscenaPlaya() });
})();
