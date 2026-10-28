"use strict";
/*
 * 00123 · TÁNDEM
 *
 * Animación del banco. Empieza y acaba en negro.
 * De noche, por el paseo marítimo, pasa despacio una bici tándem: Guillermo, delante, pedalea sudando; Rodrigo,
 * detrás, va con los pies en alto sorbiendo un refresco con pajita (no pedalea ni conduce). Guillermo se agota y la
 * bici casi se para. Rodrigo le señala con el vaso: ¡PEDALEA! Guillermo pedalea como loco y salen disparados. ¡RIIING!
 */
(() => {
const ESC = 1.2, SUELO = 568, RUEDA = 56;
const RA = [-185, -RUEDA], FA = [185, -RUEDA], BB1 = [-75, -60], BB2 = [70, -60];
const S1 = [-80, -142], S2 = [64, -142], H1 = [156, -150], H2 = [164, -120], MANILLAR = [146, -176];
const XGs = 70, XRs = -75, YS = -152;          // asientos (caderas de cada uno)
const T_FRENA = 3.5, T_PARA = 4.55, T_GRITA = 4.6, T_LOCO = 5.15, T_RING = 7.05;
const cache = cacheTexto();

function vasoRefresco(g, m, boca) {
  // vaso de papel con tapa y pajita; m = mano (unidades de avatar)
  const x = m[0] + 1, y = m[1] - 8;
  g.save();
  const tapa = [x, y - 11];
  if (boca) {
    g.strokeStyle = "#ffffff"; g.lineWidth = 2.6; g.lineCap = "round";
    g.beginPath(); g.moveTo(tapa[0], tapa[1]); g.lineTo(boca[0], boca[1]); g.stroke();
    g.strokeStyle = "#ff3d84"; g.lineWidth = 2.6; g.setLineDash([2.5, 2.5]);
    g.beginPath(); g.moveTo(tapa[0], tapa[1]); g.lineTo(boca[0], boca[1]); g.stroke(); g.setLineDash([]);
  } else {
    g.strokeStyle = "#ffffff"; g.lineWidth = 2.6; g.lineCap = "round";
    g.beginPath(); g.moveTo(tapa[0], tapa[1]); g.lineTo(tapa[0] + 1, tapa[1] - 12); g.lineTo(tapa[0] + 6, tapa[1] - 16); g.stroke();
    g.strokeStyle = "#ff3d84"; g.setLineDash([2.5, 2.5]);
    g.beginPath(); g.moveTo(tapa[0], tapa[1]); g.lineTo(tapa[0] + 1, tapa[1] - 12); g.lineTo(tapa[0] + 6, tapa[1] - 16); g.stroke(); g.setLineDash([]);
  }
  g.beginPath(); g.moveTo(x - 6.5, y - 10); g.lineTo(x + 6.5, y - 10); g.lineTo(x + 5, y + 11); g.lineTo(x - 5, y + 11); g.closePath();
  const gr = g.createLinearGradient(x - 7, 0, x + 7, 0);
  gr.addColorStop(0, "#d9d9d9"); gr.addColorStop(0.45, "#ffffff"); gr.addColorStop(1, "#bdbdbd");
  g.fillStyle = gr; g.fill();
  g.fillStyle = "#2fb8e8"; g.beginPath(); g.moveTo(x - 6.1, y - 3); g.lineTo(x + 6.1, y - 3); g.lineTo(x + 5.7, y + 3); g.lineTo(x - 5.7, y + 3); g.closePath(); g.fill();
  g.fillStyle = "#f2f2f2"; rectR(g, x - 7.5, y - 13, 15, 3.6, 1.6); g.fill();
  g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 0.6; g.stroke();
  g.restore();
}
function rueda(g, c, ang) {
  g.save(); g.translate(c[0], c[1]);
  g.strokeStyle = "#151515"; g.lineWidth = 8; g.beginPath(); g.arc(0, 0, RUEDA - 4, 0, 6.283); g.stroke();
  g.strokeStyle = "#c9ced4"; g.lineWidth = 2.5; g.beginPath(); g.arc(0, 0, RUEDA - 9, 0, 6.283); g.stroke();
  g.strokeStyle = "rgba(220,225,230,.75)"; g.lineWidth = 1.1;
  for (let i = 0; i < 12; i++) { const a = ang + (i * Math.PI) / 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * (RUEDA - 10), Math.sin(a) * (RUEDA - 10)); g.stroke(); }
  g.fillStyle = "#9aa1a8"; g.beginPath(); g.arc(0, 0, 5, 0, 6.283); g.fill();
  g.restore();
}
function tubo(g, a, b, w = 7) {
  g.lineCap = "round";
  g.strokeStyle = "#8f1d26"; g.lineWidth = w; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  g.strokeStyle = "#e0404c"; g.lineWidth = w - 3; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  g.strokeStyle = "rgba(255,220,220,.55)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(a[0], a[1] - 1.2); g.lineTo(b[0], b[1] - 1.2); g.stroke();
}
function biela(g, c, ang, lejos) {
  const p = [c[0] + Math.cos(ang) * 22, c[1] + Math.sin(ang) * 22];
  g.strokeStyle = lejos ? "#6c7278" : "#c9ced4"; g.lineWidth = 4.5; g.lineCap = "round";
  g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(p[0], p[1]); g.stroke();
  g.fillStyle = lejos ? "#202020" : "#2b2b2b"; rectR(g, p[0] - 9, p[1] - 3, 18, 6, 2); g.fill();
}
function bici(g, rot, fase, parte) {
  if (parte === "detras") {
    biela(g, BB1, fase + Math.PI, true); biela(g, BB2, fase + Math.PI, true);
    rueda(g, RA, rot); rueda(g, FA, rot);
    // cadenas
    g.strokeStyle = "#3a3a3a"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(BB1[0], BB1[1] - 13); g.lineTo(BB2[0], BB2[1] - 13); g.moveTo(BB1[0], BB1[1] + 13); g.lineTo(BB2[0], BB2[1] + 13); g.stroke();
    g.beginPath(); g.moveTo(BB1[0], BB1[1] - 12); g.lineTo(RA[0], RA[1] - 7); g.moveTo(BB1[0], BB1[1] + 12); g.lineTo(RA[0], RA[1] + 7); g.stroke();
    // cuadro
    tubo(g, RA, BB1); tubo(g, RA, S1, 5); tubo(g, BB1, S1); tubo(g, BB1, BB2); tubo(g, S1, [S2[0], S2[1] + 4]);
    tubo(g, [S2[0], S2[1] + 4], H1); tubo(g, BB2, S2); tubo(g, BB2, H2); tubo(g, H1, H2, 9); tubo(g, H2, FA, 5);
    tubo(g, H1, [H1[0] - 4, -170], 5);
    g.strokeStyle = "#c9ced4"; g.lineWidth = 4; g.beginPath(); g.moveTo(H1[0] - 4, -170); g.quadraticCurveTo(MANILLAR[0] + 10, -180, MANILLAR[0], MANILLAR[1] + 4); g.stroke();
    g.fillStyle = "#1b1b1b"; rectR(g, MANILLAR[0] - 8, MANILLAR[1] - 1, 12, 9, 3); g.fill();
    // manillar de atrás (Rodrigo no lo usa)
    tubo(g, [S2[0] - 4, S2[1] - 4], [S2[0] - 30, S2[1] - 14], 4);
    // platos
    for (const c of [BB1, BB2]) { g.strokeStyle = "#aab0b6"; g.lineWidth = 3; g.beginPath(); g.arc(c[0], c[1], 13, 0, 6.283); g.stroke(); }
    // sillines
    for (const s of [S1, S2]) { g.fillStyle = "#151515"; g.beginPath(); g.ellipse(s[0] + 2, s[1] - 4, 17, 5.5, 0, 0, 6.283); g.fill(); g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(s[0] - 10, s[1] - 8, 16, 1.6); }
    // guardabarros
    g.strokeStyle = "#e9e1d0"; g.lineWidth = 4;
    g.beginPath(); g.arc(RA[0], RA[1], RUEDA + 3, Math.PI * 1.05, Math.PI * 1.75); g.stroke();
    g.beginPath(); g.arc(FA[0], FA[1], RUEDA + 3, Math.PI * 1.25, Math.PI * 1.95); g.stroke();
    // faro
    g.fillStyle = "#e9e1d0"; g.beginPath(); g.arc(H2[0] + 8, H2[1] + 4, 6, 0, 6.283); g.fill();
  } else {
    biela(g, BB1, fase, false); biela(g, BB2, fase, false);
    g.fillStyle = "#c9ced4"; for (const c of [BB1, BB2]) { g.beginPath(); g.arc(c[0], c[1], 4, 0, 6.283); g.fill(); }
  }
}
function fondoPaseo() {
  const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
  g.translate(60, 60);
  const gc = g.createLinearGradient(0, -60, 0, 340);
  gc.addColorStop(0, "#04060f"); gc.addColorStop(1, "#1a2346");
  g.fillStyle = gc; g.fillRect(-60, -60, W + 120, 400);
  const sr = semilla(123);
  g.fillStyle = "#fffbe8";
  for (let i = 0; i < 60; i++) { g.globalAlpha = 0.3 + sr() * 0.7; g.beginPath(); g.arc(sr() * W, sr() * 300, 0.5 + sr() * 1.3, 0, 6.283); g.fill(); }
  g.globalAlpha = 1;
  // luna
  const gl = g.createRadialGradient(820, 110, 10, 820, 110, 120);
  gl.addColorStop(0, "rgba(255,250,220,.5)"); gl.addColorStop(1, "rgba(255,250,220,0)");
  g.fillStyle = gl; g.fillRect(700, -10, 240, 240);
  g.fillStyle = "#fff8dc"; g.beginPath(); g.arc(820, 110, 38, 0, 6.283); g.fill();
  g.fillStyle = "rgba(200,190,160,.35)"; for (const [x, y, r] of [[808, 98, 7], [832, 122, 9], [826, 94, 4]]) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
  // mar
  const gm = g.createLinearGradient(0, 336, 0, 470);
  gm.addColorStop(0, "#162447"); gm.addColorStop(1, "#070b18");
  g.fillStyle = gm; g.fillRect(-60, 336, W + 120, 140);
  g.fillStyle = "rgba(255,248,210,.55)";
  for (let i = 0; i < 16; i++) { const y = 342 + i * 8, w = 70 - i * 2 + sr() * 30; g.fillRect(820 - w / 2 + (sr() - 0.5) * 20, y, w, 2); }
  // barandilla
  g.fillStyle = "#c9c2b0"; g.fillRect(-60, 432, W + 120, 6);
  g.fillStyle = "#8a8474"; for (let x = -40; x < W + 60; x += 34) g.fillRect(x, 438, 4, 46);
  g.fillStyle = "#b3ac9a"; g.fillRect(-60, 484, W + 120, 10);
  // paseo (baldosas)
  const gs = g.createLinearGradient(0, 494, 0, H + 60);
  gs.addColorStop(0, "#3b3833"); gs.addColorStop(1, "#151410");
  g.fillStyle = gs; g.fillRect(-60, 494, W + 120, H + 60 - 494);
  g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 1.5;
  for (let y = 512; y < H + 60; y += 26) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
  for (let x = -60; x < W + 60; x += 60) { g.beginPath(); g.moveTo(x, 494); g.lineTo(x - 30, H + 60); g.stroke(); }
  // farolas
  for (const x of [150, 512, 874]) {
    g.fillStyle = "#1c1d22"; g.fillRect(x - 4, 236, 8, 262); g.fillRect(x - 12, 488, 24, 10);
    g.beginPath(); g.moveTo(x - 20, 236); g.lineTo(x + 20, 236); g.lineTo(x + 12, 214); g.lineTo(x - 12, 214); g.closePath(); g.fill();
  }
  return c;
}
function titulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(820, 200), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 150);
  gr.addColorStop(0, "#e8fdff"); gr.addColorStop(0.5, "#8ff3f6"); gr.addColorStop(1, "#18b6c0");
  txt(g, "¡PEDALEA!", 410, 150, { tam: 140, peso: 900, fam: FD, color: "#062a33", esp: 6 });
  txt(g, "¡PEDALEA!", 410, 142, { tam: 140, peso: 900, fam: FD, color: gr, borde: "#062a33", bordeAncho: 11, esp: 6, glow: "rgba(47,227,232,.8)", glowTam: 24 });
  cache.set("t", c);
  return c;
}

class Tandem extends Escena {
  constructor() {
    super(8.3);
    this.p = new Parts(320);
    this.fondo = null; this.bx = -330; this.fase = 0; this.rot = 0; this.v = 210; this.gotas = []; this.lineas = [];
  }
  luz(t) { return tramo(t, 0.02, 0.55) * (1 - tramo(t, 7.55, 8.25)); }
  estado(t) {
    const G = { cara: "sorpresa", rc: 0.04 };
    const R = { quien: "rodrigo", cara: "dormido", rc: -0.05, brazoIDelante: false };
    const f = this.fase;
    // Guillermo pedalea con una mano en el manillar
    const amp = t > T_LOCO ? 12 : 10;
    G.piernaD = [-10 + amp * Math.sin(f), 0.07 * Math.cos(f)];
    G.piernaI = [-10 - amp * Math.sin(f), -0.07 * Math.cos(f)];
    G.manoD = [39 + (MANILLAR[0] - 4 - XGs) / ESC, 146 + (MANILLAR[1] + 4 - YS) / ESC];
    G.manoI = [-2, 150];
    if (t < T_FRENA) G.cara = Math.sin(t * 2.4) > 0 ? "sorpresa" : "dormido";
    // se seca el sudor
    const kS = Math.sin(tramo(t, 1.9, 2.7) * Math.PI);
    if (kS > 0) { G.manoI = mezcla([-2, 150], [16, 24], kS); G.brazoIDelante = kS > 0.3; G.cara = "dormido"; }
    if (t >= T_FRENA && t < T_GRITA) { G.cara = "borracho"; G.rc = 0.06 + 0.12 * tramo(t, T_FRENA, T_PARA); }
    if (t >= T_GRITA && t < T_LOCO) { G.cara = "sorpresa"; G.rc = 0.14 * (1 - tramo(t, T_GRITA, T_GRITA + 0.3)); G.puntas = eBack(tramo(t, T_GRITA, T_GRITA + 0.2)) * 0.8; }
    if (t >= T_LOCO) { G.cara = "guino"; G.puntas = 0.8; G.rc = -0.05 + 0.03 * Math.sin(t * 30); G.manoI = [-14, 120]; }
    // Rodrigo: pies en alto, una mano en la nuca y el refresco con pajita
    R.piernaI = [-20, 0.52 + 0.04 * Math.sin(t * 3)]; R.piernaD = [-20, -0.52 - 0.04 * Math.sin(t * 3)];
    R.manoI = [4, 38];
    const sorbe = t < T_FRENA + 0.2 && !(t > 2.6 && t < 3.2);
    const bocaR = boca(R.rc, "rodrigo");
    let manoR = sorbe ? [bocaR[0] + 8, bocaR[1] + 35] : [86, 124];
    if (t > 2.6 && t < 3.2) { manoR = [88, 118 + 6 * Math.sin(t * 40)]; R.cara = "risa"; }
    if (t >= T_FRENA + 0.2 && t < T_GRITA) { R.cara = "sorpresa"; R.rc = 0.1; }
    if (t >= T_GRITA && t < T_LOCO + 0.2) { // ¡PEDALEA! señalando con el vaso
      const k = eOut(tramo(t, T_GRITA, T_GRITA + 0.15));
      manoR = mezcla([86, 124], [110, 70 + 4 * Math.sin(t * 30)], k); R.cara = "guino"; R.rc = 0.12;
      R.manoI = mezcla([4, 38], [-16, 120], k);
    }
    if (t >= T_LOCO + 0.2) { R.cara = "risa"; manoR = [100, 56]; R.puntas = 0.45; R.rc = -0.08; }
    R.manoD = manoR;
    R.objD2 = (g, m) => vasoRefresco(g, m, sorbe ? [bocaR[0] + 1, bocaR[1] + 1] : null);
    return { G, R };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // velocidad de la bici y de los pedales
    let v, w;
    if (t < T_FRENA) { v = 210; w = 5.5; }
    else if (t < T_PARA) { const k = tramo(t, T_FRENA, T_PARA); v = 210 * (1 - k) * (1 - k); w = 5.5 * (1 - 0.8 * k); }
    else if (t < T_LOCO) { v = 0; w = 0.6; }
    else { const k = tramo(t, T_LOCO, T_LOCO + 1.2); v = 30 + 1100 * k * k; w = 30; }
    this.v = v;
    this.bx += v * dt; this.fase += w * dt; this.rot += (v / RUEDA) * dt;
    // sudor
    if (t > 0.5 && this.bx < W + 60 && Math.random() < (t > T_LOCO ? 22 : 6) * dt) {
      const lado = Math.random() < 0.5 ? -1 : 1;
      this.gotas.push({ x: this.bx + XGs + lado * 30, y: SUELO + YS - 150, vx: lado * azar(30, 110) + v * 0.5, vy: azar(-170, -60), v: 0.8 });
    }
    for (const d of this.gotas) { d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.v -= dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    // burbujitas al sorber
    if (t > 0.6 && t < T_FRENA && !(t > 2.6 && t < 3.2) && Math.random() < 6 * dt) p.nueva(P.ESPUMA, this.bx + XRs + azar(-6, 10), SUELO + YS - 102, azar(-20, 20), azar(-80, -40), azar(0.3, 0.5), azar(2, 4));
    // a toda pastilla
    if (t > T_LOCO + 0.3 && this.bx < W + 400) {
      if (Math.random() < 40 * dt) p.nueva(P.POLVO, this.bx + RA[0] - 20, SUELO - 6, azar(-260, -60), azar(-50, -5), azar(0.4, 0.8), azar(20, 36));
      if (Math.random() < 30 * dt) this.lineas.push({ x: this.bx - 300 - azar(0, 200), y: azar(380, 560), l: azar(60, 160), v: 0.3 });
    }
    for (const l of this.lineas) l.v -= dt;
    this.lineas = this.lineas.filter((l) => l.v > 0);
    this.una("grita", t > T_GRITA, () => temblar(10, 0.3));
    this.una("arranca", t > T_LOCO, () => { temblar(8, 0.2); for (let i = 0; i < 16; i++) p.nueva(P.POLVO, this.bx + RA[0], SUELO - 6, azar(-300, -40), azar(-80, -5), azar(0.5, 0.9), azar(24, 40)); });
    this.una("ring", t > T_RING, () => temblar(4, 0.2));
    p.alfa = 1 - tramo(t, 7.55, 8.2);
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(t), luz = this.luz(t);
    fondo(g, "#000");
    if (!this.fondo) this.fondo = fondoPaseo();
    g.save(); g.globalAlpha = luz; g.drawImage(this.fondo, -60, -60);
    // luz de las farolas
    g.globalCompositeOperation = "lighter";
    for (const x of [150, 512, 874]) {
      const a = 0.9 + 0.1 * Math.sin(t * 7 + x);
      g.globalAlpha = 0.55 * luz * a; g.drawImage(BLOB2.oroClaro, x - 60, 196, 120, 70);
      g.globalAlpha = 0.28 * luz * a; g.drawImage(BLOB2.oro, x - 170, 420, 340, 170);
    }
    g.restore();
    // la bici con los dos
    const bx = this.bx;
    if (bx > -500 && bx < W + 500) {
      const wob = t > T_FRENA && t < T_LOCO ? 0.025 * Math.sin(t * 7) * tramo(t, T_FRENA, T_PARA) : 0;
      const bote = t > T_LOCO ? 2 * Math.sin(t * 50) : 0;
      g.save(); g.translate(bx, SUELO + bote); g.rotate(wob);
      g.globalAlpha = 0.5; g.fillStyle = "#000"; g.beginPath(); g.ellipse(0, 2, 250, 9, 0, 0, 6.283); g.fill(); g.globalAlpha = 1;
      bici(g, this.rot, this.fase, "detras");
      pintarAvatar(g, matAv(XRs, YS, ESC, 0, 1, 1, [39, 146]), e.R, t);
      pintarAvatar(g, matAv(XGs, YS, ESC, 0, 1, 1, [39, 146]), e.G, t);
      bici(g, this.rot, this.fase, "delante");
      g.restore();
    }
    // líneas de velocidad
    if (this.lineas.length) {
      g.save(); g.strokeStyle = "rgba(255,255,255,.6)"; g.lineWidth = 2.5; g.lineCap = "round";
      for (const l of this.lineas) { g.globalAlpha = l.v / 0.3; g.beginPath(); g.moveTo(l.x, l.y); g.lineTo(l.x + l.l, l.y); g.stroke(); }
      g.restore();
    }
    g.fillStyle = "#bfe9ff";
    for (const d of this.gotas) { g.beginPath(); g.ellipse(d.x, d.y, 4, 6, 0, 0, 6.283); g.fill(); }
    this.p.dibujar(g);
    // ¡PEDALEA!
    if (t > T_GRITA && t < 7.0) {
      const d = t - T_GRITA, k = tramo(d, 0, 0.18), s = lerp(2.4, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 9));
      const spr = titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - tramo(t, 6.7, 7.0)); g.translate(512, 112); g.rotate(-0.05); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // ¡RIIING! desde fuera
    if (t > T_RING && t < 8.1) {
      const k = tramo(t, T_RING, T_RING + 0.12);
      g.save(); g.translate(880 + 3 * Math.sin(t * 60), 300); g.rotate(-0.12); g.scale(eBack(k), eBack(k));
      txt(g, "¡RIIING!", 0, 0, { tam: 66, peso: 400, fam: FC, color: "#fffdf5", borde: "#062a33", bordeAncho: 9, esp: 3, alfa: 1 - tramo(t, 7.7, 8.05) });
      g.restore();
    }
    const a = 1 - luz;
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${Math.min(1, a)})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00123", nombre: "Tándem", crear: () => new Tandem() });
})();
