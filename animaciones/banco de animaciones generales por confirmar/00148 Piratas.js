"use strict";
/*
 * 00148 · PIRATAS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se abre un círculo sobre un barco pirata que se mece. Guillermo (pañuelo rojo) lleva el timón y Rodrigo (parche y
 * sombrero) mira por el catalejo: ¡un cofre flotando! Lo enlaza con una cuerda, lo sube a pulso hasta la borda y lo
 * abre: sale una luz dorada… y dentro hay latas de cerveza. Cogen una cada uno, brindan: ¡AL ABORDAJE! Se cierra el
 * círculo.
 */
(() => {
const cache = cacheTexto();
const ESC = 1.45, PIE = 562, BORDA = 446, CX = 515;
const T_VE = 2.0, T_LANZA = 3.45, T_ATA = 3.75, T_SUBE = 4.9, T_ABRE = 5.6, T_CHIN = 7.05;
const RUEDA_R = 60;

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(900, 210), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 50, 0, 160);
  gr.addColorStop(0, "#fff6c8"); gr.addColorStop(0.5, "#ffc93a"); gr.addColorStop(1, "#d77a00");
  txt(g, "¡AL ABORDAJE!", 456, 158, { tam: 128, peso: 900, fam: FD, color: "#2a1200", esp: 4 });
  txt(g, "¡AL ABORDAJE!", 450, 150, { tam: 128, peso: 900, fam: FD, color: gr, borde: "#2a1200", bordeAncho: 11, esp: 4, glow: "rgba(255,190,40,.8)", glowTam: 24 });
  cache.set("t", c);
  return c;
}
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
/** Gira un dibujo con la cabeza (alrededor del cuello) en unidades de avatar. */
function conCabeza(g, m, R, rc, f) { conMat(g, m, () => { g.translate(R.cuello[0], R.cuello[1]); g.rotate(rc); g.translate(-R.cuello[0], -R.cuello[1]); f(); }); }

function sombrero(g) {
  // tricornio liso con ribete dorado (unidades de avatar de Rodrigo)
  g.save();
  g.beginPath();
  g.moveTo(-6, 14); g.quadraticCurveTo(4, -2, 18, -6); g.quadraticCurveTo(38, -24, 58, -6); g.quadraticCurveTo(72, -2, 82, 14);
  g.quadraticCurveTo(66, 12, 56, 20); g.quadraticCurveTo(46, 28, 38, 30); g.quadraticCurveTo(30, 28, 20, 20); g.quadraticCurveTo(10, 12, -6, 14);
  g.closePath();
  const gr = g.createLinearGradient(0, -20, 0, 30);
  gr.addColorStop(0, "#3a3036"); gr.addColorStop(1, "#141014");
  g.fillStyle = gr; g.fill();
  g.strokeStyle = "#e0ac2a"; g.lineWidth = 2.4; g.stroke();
  g.strokeStyle = "rgba(255,255,255,.18)"; g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(22, -2); g.quadraticCurveTo(38, -16, 54, -2); g.stroke();
  g.restore();
}
function parche(g) {
  g.save();
  g.strokeStyle = "#141014"; g.lineWidth = 1.8;
  g.beginPath(); g.moveTo(44, 43); g.lineTo(10, 28); g.moveTo(54, 45); g.lineTo(70, 40); g.stroke();
  g.fillStyle = "#141014"; g.beginPath(); g.ellipse(48.4, 47, 7.2, 6.2, 0, 0, 6.283); g.fill();
  g.fillStyle = "rgba(255,255,255,.25)"; g.beginPath(); g.ellipse(46.5, 45, 2.5, 1.4, -0.4, 0, 6.283); g.fill();
  g.restore();
}
function panuelo(g) {
  // pañuelo rojo de lunares atado a un lado (unidades de avatar de Guillermo)
  g.save();
  g.beginPath();
  g.moveTo(7, 22); g.bezierCurveTo(4, -14, 74, -14, 71, 22); g.quadraticCurveTo(39, 12, 7, 22); g.closePath();
  const gr = g.createLinearGradient(0, -10, 0, 22);
  gr.addColorStop(0, "#ff4a3a"); gr.addColorStop(1, "#b0140c");
  g.fillStyle = gr; g.fill();
  g.save(); g.clip(); g.fillStyle = "rgba(255,255,255,.85)";
  for (const [x, y] of [[18, 8], [30, 0], [44, -2], [57, 4], [24, 15], [39, 10], [53, 15], [65, 13], [12, 16]]) { g.beginPath(); g.arc(x, y, 1.6, 0, 6.283); g.fill(); }
  g.restore();
  g.strokeStyle = "#7a0a05"; g.lineWidth = 1; g.stroke();
  // nudo y puntas
  g.fillStyle = "#d42a1c";
  g.beginPath(); g.arc(72, 20, 4, 0, 6.283); g.fill();
  g.beginPath(); g.moveTo(73, 20); g.quadraticCurveTo(84, 22, 86, 34); g.lineTo(80, 31); g.quadraticCurveTo(78, 25, 72, 23); g.fill();
  g.beginPath(); g.moveTo(73, 21); g.quadraticCurveTo(80, 30, 77, 40); g.lineTo(73, 35); g.quadraticCurveTo(74, 29, 71, 24); g.fill();
  g.restore();
}
function catalejo(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const tramos = [[-30, -14, 3.6], [-14, 4, 4.4], [4, 22, 5.2]];
  for (const [a, b, r] of tramos) {
    const gr = g.createLinearGradient(0, -r, 0, r);
    gr.addColorStop(0, "#7a4d00"); gr.addColorStop(0.35, "#ffe08a"); gr.addColorStop(1, "#8a5a00");
    g.fillStyle = gr; rectR(g, a, -r, b - a, r * 2, 1.4); g.fill();
    g.fillStyle = "#5a3a00"; g.fillRect(b - 1.6, -r, 1.6, r * 2);
  }
  g.fillStyle = "#2a1a08"; g.fillRect(-14, -4.6, 8, 9.2);
  g.restore();
}

class Piratas extends Escena {
  constructor() {
    super(10.3);
    this.p = new Parts(420);
    this.fondoC = null;
    this.lazo = null; this.gotas = [];
  }
  xG() { return lerp(290, 392, eInOut(tramo(this.t, 5.0, 5.5))); }
  xR() { return lerp(742, 652, eInOut(tramo(this.t, 5.0, 5.5))); }
  ruedaAng() {
    const t = this.t;
    if (t < 5.0) return 0.45 * Math.sin(t * 1.5) + 0.2 * Math.sin(t * 3.1);
    const d = t - 5.0;
    return 0.45 * Math.sin(5.0 * 1.5) + 0.2 * Math.sin(5.0 * 3.1) + 7 * (1 - Math.exp(-d * 1.2));
  }
  /** Posición del cofre (centro de la base) y si está en el agua. */
  cofre() {
    const t = this.t;
    if (t < T_ATA) {
      const x = lerp(-120, CX, eOut(tramo(t, 0.7, 2.6)));
      return { x, y: 598 + 4 * Math.sin(t * 2.6), agua: true, inc: 0.06 * Math.sin(t * 2.1) };
    }
    if (t < T_SUBE) {
      const u = tramo(t, T_ATA, T_SUBE), k = u * u * (3 - 2 * u);
      const tirones = 6 * Math.abs(Math.sin(u * Math.PI * 5));
      return { x: CX + 10 * Math.sin(u * 9) * (1 - u), y: lerp(598, BORDA, k) - tirones * (1 - u), agua: t < T_ATA + 0.55, inc: 0.12 * Math.sin(u * 11) * (1 - u) };
    }
    const d = t - T_SUBE;
    return { x: CX, y: BORDA - 18 * Math.abs(Math.sin(d * 10)) * Math.exp(-d * 7), agua: false, inc: 0 };
  }
  tapa() { return eBack(tramo(this.t, T_ABRE, T_ABRE + 0.3)); }
  poseG() {
    const t = this.t, x = this.xG();
    const pose = { cara: "guino", rc: 0.05 * Math.sin(t * 2), piernaI: [0, 0], piernaD: [0, 0] };
    const m = matAv(x, PIE, ESC);
    // manos en el timón
    const C = this.ruedaC(), w = this.ruedaAng(), R = RUEDA_R + 8;
    const hI = [C[0] + R * Math.cos(w - 2.6), C[1] + R * Math.sin(w - 2.6)], hD = [C[0] + R * Math.cos(w - 0.55), C[1] + R * Math.sin(w - 0.55)];
    const enRueda = t < 5.0;
    let mD = enAv(m, enRueda ? hD : [0, 0]), mI = enAv(m, enRueda ? hI : [0, 0]);
    if (!enRueda) { mD = [62, 150]; mI = [16, 150]; }
    if (t > 4.95 && t < 5.25) { const k = eInOut(tramo(t, 4.95, 5.25)); mD = mezcla(enAv(matAv(290, PIE, ESC), hD), [62, 150], k); mI = mezcla(enAv(matAv(290, PIE, ESC), hI), [16, 150], k); }
    if (t > T_VE + 0.25 && t < 3.0) { pose.cara = "sorpresa"; pose.rc = 0.14; }
    else if (t >= 3.0 && t < T_SUBE) { pose.cara = "sonrisa"; pose.rc = 0.1; }
    else if (t >= T_SUBE && t < T_ABRE) { pose.cara = "risa"; pose.rc = 0.08; }
    if (t > 5.0 && t < 5.5) { const a = andar((t - 5.0) * 12, 0.8); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; }
    if (t >= T_ABRE) { pose.cara = t < 6.1 ? "sorpresa" : "risa"; pose.rc = t < 6.1 ? 0.06 : 0.16 * eInOut(tramo(t, 6.1, 6.3)) * (1 - eInOut(tramo(t, 6.5, 6.7))); }
    // coge una lata, brinda y la levanta
    const lata = this.lataG(m);
    if (lata) { mD = lata.mano; pose.objD = (g, q) => dibujarLata(g, q[0], q[1] - 3, lata.ang, { abierta: t > T_CHIN }); }
    pose.manoD = mD; pose.manoI = mI;
    if (t > T_CHIN + 0.2) { pose.manoI = mezcla(mI, [-4, 120 + 3 * Math.sin(t * 9)], eInOut(tramo(t, T_CHIN + 0.2, T_CHIN + 0.5))); pose.cara = "risa"; pose.rc = 0.05 * Math.sin(t * 8); }
    const bote = t > T_CHIN + 0.3 ? -Math.abs(Math.sin(t * 8)) * 6 : 0;
    return { pose, m: matAv(x, PIE + bote, ESC) };
  }
  lataG(m) {
    const t = this.t;
    if (t < 6.3) return null;
    const lata = [CX - 30, BORDA - 64], arriba = [CX - 12, 300], alto = enAv(m, [CX - 70, 214]);
    const kC = eInOut(tramo(t, 6.3, 6.55)), kS = eInOut(tramo(t, 6.6, 6.95)), kB = eInOut(tramo(t, T_CHIN + 0.25, T_CHIN + 0.55));
    let q = mezcla(mezcla([62, 150], enAv(m, lata), kC), enAv(m, arriba), kS);
    q = mezcla(q, mezcla(alto, [alto[0], alto[1] + 4], Math.sin(t * 9) * 0.5 + 0.5), kB);
    return { mano: q, ang: -0.15 * kS };
  }
  poseR() {
    const t = this.t, x = this.xR();
    const pose = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    const m = matAv(x, PIE, ESC);
    let mD = [62, 146], mI = [9, 157], tubo = null;
    // catalejo al ojo, barriendo el horizonte
    if (t < T_VE + 0.3) {
      const k = eInOut(tramo(t, 0.35, 0.7));
      mI = mezcla([9, 157], [4, 52], k);
      pose.rc = 0.09 * Math.sin(t * 2.2) * k;
      if (k > 0.5) tubo = { x: 2, y: 47, ang: Math.PI - 0.04 };
      pose.cara = "sonrisa";
    }
    // ¡un cofre! lo señala con el catalejo
    if (t >= T_VE) {
      const k = eInOut(tramo(t, T_VE + 0.05, T_VE + 0.35));
      pose.cara = "sorpresa";
      const apunta = enAv(m, [CX + 40, 560]);
      const S = avatar("rodrigo").rig.hombroI2, dir = Math.atan2(apunta[1] - S[1], apunta[0] - S[0]);
      const pI = [S[0] + Math.cos(dir) * 66, S[1] + Math.sin(dir) * 66];
      mI = mezcla([4, 52], pI, k);
      pose.rc = -0.12 * k;
      tubo = k > 0.5 ? { mano: true, ang: dir } : { x: 2, y: 47, ang: Math.PI - 0.04 };
    }
    // lazo por encima de la cabeza y lo lanza
    if (t >= 2.85) {
      const kB = eInOut(tramo(t, 2.85, 3.0));
      mI = mezcla(mI, [14, 150], kB); tubo = null;
      const w = t * 15;
      if (t < T_LANZA) { mD = mezcla([62, 146], [74 + 9 * Math.cos(w), 36 + 5 * Math.sin(w)], eInOut(tramo(t, 2.85, 3.05))); pose.cara = "guino"; pose.rc = 0.06; }
      else if (t < T_ATA) { mD = mezcla([80, 40], [16, 118], eOut(tramo(t, T_LANZA, T_LANZA + 0.12))); pose.cara = "risa"; }
    }
    // tira de la cuerda, mano sobre mano
    if (t >= T_ATA && t < T_SUBE + 0.1) {
      const f = (t - T_ATA) * 5.2, a = (Math.sin(f * Math.PI) + 1) / 2;
      mD = mezcla([10, 112], [22, 166], a); mI = mezcla([28, 166], [6, 112], a);
      pose.cara = "dormido"; pose.rc = 0.05 * Math.sin(f * Math.PI);
    }
    if (t >= T_SUBE + 0.1 && t < T_ABRE) { mD = mezcla([10, 130], [62, 146], eInOut(tramo(t, T_SUBE + 0.1, T_SUBE + 0.4))); mI = mezcla([20, 150], [9, 157], eInOut(tramo(t, T_SUBE + 0.1, T_SUBE + 0.4))); pose.cara = "risa"; }
    if (t > 5.0 && t < 5.5) { const a = andar((t - 5.0) * 12, 0.8); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; }
    // abre el cofre
    if (t >= 5.3) {
      const borde = enAv(m, [CX + 30, BORDA - 70]), arriba = enAv(m, [CX + 40, BORDA - 132]);
      const k1 = eInOut(tramo(t, 5.3, T_ABRE)), k2 = eOut(tramo(t, T_ABRE, T_ABRE + 0.25)), k3 = eInOut(tramo(t, 5.95, 6.25));
      mI = mezcla(mezcla(mezcla([9, 157], borde, k1), arriba, k2), [9, 157], k3);
      pose.cara = t < T_ABRE ? "sonrisa" : t < 6.1 ? "sorpresa" : "risa";
      pose.rc = t > 6.1 ? -0.16 * eInOut(tramo(t, 6.1, 6.3)) * (1 - eInOut(tramo(t, 6.5, 6.7))) : 0;
    }
    // su lata
    if (t >= 6.3) {
      const lata = [CX + 32, BORDA - 64], arriba = [CX + 14, 302], alto = enAv(m, [CX + 108, 230]);
      const kC = eInOut(tramo(t, 6.3, 6.55)), kS = eInOut(tramo(t, 6.6, 6.95)), kB = eInOut(tramo(t, T_CHIN + 0.25, T_CHIN + 0.55));
      let q = mezcla(mezcla([9, 157], enAv(m, lata), kC), enAv(m, arriba), kS);
      q = mezcla(q, [alto[0], alto[1] + 4 * Math.sin(t * 9 + 1)], kB);
      mI = q;
      const ang = 0.15 * kS;
      pose.objI2 = (g, h) => dibujarLata(g, h[0], h[1] - 3, ang, { abierta: t > T_CHIN });
    }
    if (t > T_CHIN + 0.2) { mD = mezcla([62, 146], [84, 100 + 3 * Math.sin(t * 9 + 1)], eInOut(tramo(t, T_CHIN + 0.2, T_CHIN + 0.5))); pose.cara = "risa"; pose.rc = -0.05 * Math.sin(t * 8 + 1); }
    if (tubo) {
      const tb = tubo;
      pose.objI2 = (g, h) => tb.mano ? catalejo(g, h[0] + Math.cos(tb.ang) * 8, h[1] + Math.sin(tb.ang) * 8, tb.ang + Math.PI) : catalejo(g, tb.x, tb.y, tb.ang + Math.PI);
    }
    pose.manoD = mD; pose.manoI = mI;
    const bote = t > T_CHIN + 0.3 ? -Math.abs(Math.sin(t * 8 + 1)) * 6 : 0;
    return { pose, m: matAv(x, PIE + bote, ESC) };
  }
  ruedaC() { return [276, 396]; }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const c = this.cofre();
    const agua = (x, y, n, vx, vy) => { for (let i = 0; i < n; i++) this.gotas.push({ x: x + azar(-50, 50), y: y - azar(0, 20), vx: azar(-vx, vx), vy: azar(vy[0], vy[1]), v: azar(0.4, 0.8), r: azar(2.5, 5.5) }); };
    this.una("ata", t > T_ATA, () => { temblar(5, 0.15); agua(c.x, 556, 22, 140, [-440, -200]); });
    if (t > T_ATA && t < T_SUBE && Math.random() < 30 * dt) agua(c.x, c.y - 20, 1, 20, [0, 60]);
    for (const d of this.gotas) { d.vy += 1300 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.v -= dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    this.una("sube", t > T_SUBE, () => {
      temblar(14, 0.3);
      agua(CX, BORDA - 10, 18, 260, [-320, -80]);
      for (let i = 0; i < 10; i++) p.nueva(P.POLVO, CX + azar(-60, 60), BORDA, azar(-200, 200), azar(-40, -5), azar(0.5, 0.9), azar(20, 34));
    });
    this.una("abre", t > T_ABRE + 0.05, () => {
      temblar(10, 0.3);
      p.nueva(P.DESTELLO, CX, BORDA - 80, 0, 0, 0.5, 340);
      for (let i = 0; i < 40; i++) { const a = azar(-Math.PI, 0), v = azar(150, 520); p.nueva(P.CHISPA, CX, BORDA - 80, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.9), azar(7, 12)); }
    });
    if (t > T_ABRE && t < 9.4 && Math.random() < 14 * dt) p.nueva(P.PURPURINA, CX + azar(-60, 60), BORDA - 80 - azar(0, 60), azar(-30, 30), azar(-80, -20), azar(0.8, 1.4), azar(8, 14));
    this.una("chin", t > T_CHIN, () => {
      temblar(18, 0.4);
      const q = [CX + 2, 286];
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.35, 200);
      for (let i = 0; i < 34; i++) { const a = azar(-Math.PI, 0), v = azar(160, 520); p.nueva(P.ESPUMA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.6, 1.1), azar(6, 12)); }
      for (let i = 0; i < 20; i++) { const a = azar(-Math.PI, 0), v = azar(200, 500); p.nueva(P.CHISPA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 10)); }
    });
    if (t > T_CHIN + 0.4 && t < 9.4 && Math.random() < 22 * dt) {
      for (const xx of [CX - 70, CX + 108]) p.nueva(P.ESPUMA, xx + azar(-6, 6), (xx < CX ? 200 : 214), azar(-60, 60), azar(-260, -120), azar(0.5, 0.9), azar(4, 8));
    }
    // el lazo vuela hacia el cofre
    if (t > T_LANZA && !this.lazo) this.lazo = { t0: T_LANZA };
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 80, H + 80), g = c.getContext("2d");
    g.translate(40, 40);
    const gc = g.createLinearGradient(0, -40, 0, 330);
    gc.addColorStop(0, "#2a8fe0"); gc.addColorStop(1, "#bfeaff");
    g.fillStyle = gc; g.fillRect(-40, -40, W + 80, 380);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.9; g.drawImage(BLOB.amarillo, 820, -70, 240, 240); g.restore();
    g.fillStyle = "#fff6c4"; g.beginPath(); g.arc(940, 50, 40, 0, 6.283); g.fill();
    g.fillStyle = "rgba(255,255,255,.92)";
    for (const [x, y, s] of [[60, 110, 0.9], [780, 170, 0.7], [180, 230, 0.5]]) {
      g.beginPath(); g.arc(x, y, 26 * s, 0, 6.283); g.arc(x + 30 * s, y - 12 * s, 32 * s, 0, 6.283); g.arc(x + 64 * s, y, 24 * s, 0, 6.283); g.rect(x, y - 4 * s, 64 * s, 24 * s); g.fill();
    }
    const gm = g.createLinearGradient(0, 330, 0, H + 40);
    gm.addColorStop(0, "#1f7fc4"); gm.addColorStop(1, "#0a3f74");
    g.fillStyle = gm; g.fillRect(-40, 330, W + 80, H);
    g.fillStyle = "rgba(255,255,255,.5)"; g.fillRect(-40, 330, W + 80, 2);
    this.fondoC = c;
    return c;
  }
  olas(g, t, y0, amp, col, vel, fase) {
    g.fillStyle = col;
    g.beginPath(); g.moveTo(-60, H + 60);
    for (let x = -60; x <= W + 60; x += 28) g.lineTo(x, y0 + Math.sin(x * 0.03 + t * vel + fase) * amp + Math.sin(x * 0.011 - t * vel * 0.6) * amp * 0.6);
    g.lineTo(W + 60, H + 60); g.closePath(); g.fill();
  }
  /** Degradados del barco, creados una vez (en coordenadas del barco). */
  degradados(g) {
    if (this.grB) return;
      const gm = g.createLinearGradient(CX - 14, 0, CX + 14, 0);
      gm.addColorStop(0, "#5a3416"); gm.addColorStop(0.5, "#b07a42"); gm.addColorStop(1, "#4a2a10");
      const gv = g.createRadialGradient(CX - 40, 150, 20, CX, 170, 260);
      gv.addColorStop(0, "#fffaf0"); gv.addColorStop(1, "#d8c9a4");
      const gb = g.createLinearGradient(0, BORDA, 0, H);
      gb.addColorStop(0, "#7a4a22"); gb.addColorStop(0.35, "#5a3416"); gb.addColorStop(1, "#2a160a");
      const gt = g.createLinearGradient(0, BORDA - 6, 0, BORDA + 10);
      gt.addColorStop(0, "#e0b07a"); gt.addColorStop(1, "#8a5a2a");
    this.grB = { gm, gv, gb, gt };
  }
  barco(g, t) {
    // mástil, verga, vela y bandera (detrás de los dos)
    this.degradados(g);

    g.strokeStyle = "rgba(60,36,16,.8)"; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(CX, -10); g.lineTo(20, BORDA); g.moveTo(CX, -10); g.lineTo(1010, BORDA); g.stroke();
    g.fillStyle = this.grB.gm; g.fillRect(CX - 13, -60, 26, BORDA + 60);
    g.fillStyle = "#6a4020"; rectR(g, CX - 230, 30, 460, 14, 7); g.fill();
    const hincha = 18 + 6 * Math.sin(t * 1.8);
    g.beginPath();
    g.moveTo(CX - 215, 42); g.lineTo(CX + 215, 42);
    g.quadraticCurveTo(CX + 230 + hincha * 0.4, 170, CX + 200, 300);
    g.quadraticCurveTo(CX, 300 + hincha, CX - 200, 300);
    g.quadraticCurveTo(CX - 230 - hincha * 0.4, 170, CX - 215, 42);
    g.closePath();
    g.fillStyle = this.grB.gv; g.fill();
    g.strokeStyle = "#a8936a"; g.lineWidth = 2; g.stroke();
    g.strokeStyle = "rgba(150,128,90,.5)"; g.lineWidth = 1.5;
    g.beginPath(); for (const yy of [110, 180, 245]) { g.moveTo(CX - 210, yy); g.quadraticCurveTo(CX, yy + hincha * 0.7, CX + 210, yy); } g.stroke();
    g.fillStyle = "#e9dcb8"; g.fillRect(CX + 90, 200, 42, 34); g.strokeStyle = "#a8936a"; g.setLineDash([4, 3]); g.strokeRect(CX + 90, 200, 42, 34); g.setLineDash([]);
    // bandera negra con una jarra blanca
    g.save(); g.translate(CX + 13, -2);
    g.beginPath(); g.moveTo(0, 0);
    for (let i = 0; i <= 8; i++) g.lineTo(i * 10, Math.sin(t * 6 - i * 0.7) * 4 * (i / 8));
    for (let i = 8; i >= 0; i--) g.lineTo(i * 10, 26 + Math.sin(t * 6 - i * 0.7) * 4 * (i / 8));
    g.closePath(); g.fillStyle = "#151515"; g.fill();
    g.fillStyle = "#fff"; rectR(g, 30, 5, 14, 17, 2); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 2; g.beginPath(); g.arc(44, 13, 4, -1.4, 1.4); g.stroke();
    g.restore();
  }
  casco(g) {
    // borda y casco (tapan las piernas)
    this.degradados(g);
    g.fillStyle = this.grB.gb; g.fillRect(-60, BORDA + 6, W + 120, H - BORDA + 60);
    g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2;
    g.beginPath(); for (let y = BORDA + 34; y < H + 40; y += 26) { g.moveTo(-60, y); g.lineTo(W + 60, y); } g.stroke();
    g.fillStyle = "#d4a83a"; g.fillRect(-60, BORDA + 38, W + 120, 6);
    for (const x of [140, 380, 650, 890]) {
      g.fillStyle = "#c08a2a"; g.beginPath(); g.arc(x, BORDA + 72, 15, 0, 6.283); g.fill();
      g.fillStyle = "#123048"; g.beginPath(); g.arc(x, BORDA + 72, 10, 0, 6.283); g.fill();
      g.fillStyle = "rgba(255,255,255,.4)"; g.beginPath(); g.arc(x - 4, BORDA + 68, 3, 0, 6.283); g.fill();
    }
    g.fillStyle = this.grB.gt; g.fillRect(-60, BORDA - 4, W + 120, 14);
  }
  timon(g, t) {
    const C = this.ruedaC(), w = this.ruedaAng(), R = RUEDA_R;
    g.save(); g.translate(C[0], C[1]);
    g.fillStyle = "#5a3416"; g.fillRect(-10, 10, 20, 70);
    g.rotate(w);
    g.lineCap = "round";
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * 6.283;
      g.strokeStyle = "#7a4a22"; g.lineWidth = 6;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * (R + 16), Math.sin(a) * (R + 16)); g.stroke();
      g.strokeStyle = "#c08a50"; g.lineWidth = 9;
      g.beginPath(); g.moveTo(Math.cos(a) * (R + 6), Math.sin(a) * (R + 6)); g.lineTo(Math.cos(a) * (R + 17), Math.sin(a) * (R + 17)); g.stroke();
    }
    g.strokeStyle = "#8a5a2a"; g.lineWidth = 9; g.beginPath(); g.arc(0, 0, R, 0, 6.283); g.stroke();
    g.strokeStyle = "rgba(255,220,170,.4)"; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, R - 2, 3.4, 5.2); g.stroke();
    g.fillStyle = "#d4a83a"; g.beginPath(); g.arc(0, 0, 11, 0, 6.283); g.fill();
    g.fillStyle = "#7a5410"; g.beginPath(); g.arc(0, 0, 5, 0, 6.283); g.fill();
    g.restore();
  }
  dibujarCofre(g, c, t) {
    const k = this.tapa(), w = 124, h = 66;
    g.save(); g.translate(c.x, c.y); g.rotate(c.inc);
    // luz dorada desde dentro
    if (k > 0) {
      g.save(); g.globalCompositeOperation = "lighter";
      const baja = 1 - 0.45 * tramo(t, 6.1, 6.8);
      g.globalAlpha = 0.5 * Math.min(1, k) * (0.85 + 0.15 * Math.sin(t * 9)) * baja;
      g.drawImage(BLOB2.oro, -140, -h - 130, 280, 220);
      g.globalAlpha = 0.22 * Math.min(1, k) * baja;
      g.fillStyle = "#fff0a0";
      for (let i = 0; i < 9; i++) {
        const a = -Math.PI / 2 + (i - 4) * 0.28 + 0.05 * Math.sin(t * 2 + i);
        g.beginPath(); g.moveTo(-10, -h - 4); g.lineTo(Math.cos(a - 0.05) * 300, -h + Math.sin(a - 0.05) * 300); g.lineTo(Math.cos(a + 0.05) * 300, -h + Math.sin(a + 0.05) * 300); g.lineTo(10, -h - 4); g.fill();
      }
      g.restore();
    }
    // interior y tapa abierta
    if (k > 0.02) {
      const ht = 54 * Math.min(1.1, k);
      g.fillStyle = "#3a1e0a"; rectR(g, -w / 2 + 2, -h - ht, w - 4, ht + 4, 8); g.fill();
      g.strokeStyle = "#d4a83a"; g.lineWidth = 4; rectR(g, -w / 2 + 2, -h - ht, w - 4, ht + 4, 8); g.stroke();
      g.fillStyle = "#1e0e04"; g.fillRect(-w / 2 + 6, -h - 8, w - 12, 10);
      // latas dentro
      const cogidas = [t > 6.42, false, false, false, t > 6.42];
      for (let i = 0; i < 5; i++) {
        if (i === 0 && t > 6.42) continue;
        if (i === 4 && t > 6.42) continue;
        lataSuelta(g, -44 + i * 22, -h - 10 + (i % 2) * 3, (i - 2) * 0.05, 1.55);
      }
      void cogidas;
    }
    // caja
    const gr = g.createLinearGradient(0, -h, 0, 0);
    gr.addColorStop(0, "#9a5a26"); gr.addColorStop(1, "#5a3010");
    g.fillStyle = gr; rectR(g, -w / 2, -h, w, h, 6); g.fill();
    g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2;
    for (const yy of [-h + 22, -h + 44]) { g.beginPath(); g.moveTo(-w / 2 + 4, yy); g.lineTo(w / 2 - 4, yy); g.stroke(); }
    g.fillStyle = "#d4a83a";
    for (const xx of [-w / 2 + 14, w / 2 - 22]) { g.fillRect(xx, -h, 8, h); }
    g.fillRect(-w / 2, -h, w, 6);
    // cerradura
    g.fillStyle = "#f0c040"; rectR(g, -10, -h + 8, 20, 22, 4); g.fill();
    g.fillStyle = "#3a2400"; g.beginPath(); g.arc(0, -h + 17, 3, 0, 6.283); g.fill(); g.fillRect(-1.3, -h + 17, 2.6, 8);
    // tapa cerrada (curva)
    if (k < 0.5) {
      const s = 1 - k * 2;
      g.save(); g.translate(0, -h); g.scale(1, s);
      g.beginPath(); g.moveTo(-w / 2, 0); g.bezierCurveTo(-w / 2, -40, w / 2, -40, w / 2, 0); g.closePath();
      const gt = g.createLinearGradient(0, -30, 0, 0);
      gt.addColorStop(0, "#b06a30"); gt.addColorStop(1, "#6a3a14");
      g.fillStyle = gt; g.fill();
      g.fillStyle = "#d4a83a"; g.fillRect(-w / 2 + 14, -28, 8, 28); g.fillRect(w / 2 - 22, -28, 8, 28);
      g.restore();
    }
    // cuerda atada
    if (this.t > T_ATA && this.t < T_SUBE + 0.4) {
      g.strokeStyle = "#d9c08a"; g.lineWidth = 4;
      g.beginPath(); g.moveTo(-w / 2 - 2, -h + 30); g.lineTo(w / 2 + 2, -h + 30); g.stroke();
    }
    g.restore();
  }
  cuerda(g, eR, t) {
    // del puño de Rodrigo al cofre (o el lazo volando)
    const c = this.cofre();
    const mano = aPant(eR.m, eR.pose._manoD || [62, 146]);
    if (t >= 2.95 && t < T_LANZA) {
      // lazo girando sobre la cabeza
      const w = t * 15;
      g.save(); g.strokeStyle = "#d9c08a"; g.lineWidth = 4;
      g.beginPath(); g.ellipse(mano[0] + 18 * Math.cos(w), mano[1] - 46, 38, 12, 0.1 * Math.sin(w), 0, 6.283); g.stroke();
      g.beginPath(); g.moveTo(mano[0], mano[1]); g.lineTo(mano[0] + 18 * Math.cos(w) - 30, mano[1] - 42); g.stroke();
      g.restore();
      return;
    }
    if (t >= T_LANZA && t < T_ATA) {
      const u = tramo(t, T_LANZA, T_ATA);
      const dest = [c.x, c.y - 40];
      const x = lerp(mano[0], dest[0], u), y = lerp(mano[1] - 40, dest[1], u) - 160 * 4 * u * (1 - u);
      g.save(); g.strokeStyle = "#d9c08a"; g.lineWidth = 4;
      g.beginPath(); g.moveTo(mano[0], mano[1]); g.quadraticCurveTo((mano[0] + x) / 2, Math.max(mano[1], y) + 40, x, y); g.stroke();
      g.beginPath(); g.ellipse(x, y, 34, 12, 0, 0, 6.283); g.stroke();
      g.restore();
      return;
    }
    if (t >= T_ATA && t < T_SUBE + 0.4) {
      const fin = [c.x + 64, c.y - 36];
      g.save(); g.strokeStyle = "#d9c08a"; g.lineWidth = 4;
      g.beginPath(); g.moveTo(mano[0], mano[1]); g.quadraticCurveTo((mano[0] + fin[0]) / 2, (mano[1] + fin[1]) / 2 + 14, fin[0], fin[1]); g.stroke();
      const otra = aPant(eR.m, eR.pose._manoI || [9, 157]);
      g.beginPath(); g.moveTo(otra[0], otra[1]); g.lineTo(mano[0], mano[1]); g.stroke();
      g.beginPath(); g.moveTo(Math.max(otra[0], mano[0]), Math.max(otra[1], mano[1])); g.quadraticCurveTo(otra[0] + 30, otra[1] + 40, otra[0] + 50, BORDA + 4); g.stroke();
      g.restore();
    }
  }
  dibujar(g) {
    const t = this.t, eG = this.poseG(), eR = this.poseR(), c = this.cofre();
    fondo(g, "#000");
    const bal = 0.022 * Math.sin(t * 1.6), sube = 6 * Math.sin(t * 1.6 + 1.2);
    g.drawImage(this.fondo(), -40, -40 - Math.round(sube * 0.4));
    // olas del fondo
    this.olas(g, t, 352 - sube * 0.4, 4, "rgba(20,110,180,.9)", 1.4, 0);
    this.olas(g, t, 384 - sube * 0.4, 6, "rgba(16,90,160,.95)", 1.8, 2);
    // el barco se mece
    g.save(); g.translate(CX, 900 + sube); g.rotate(bal); g.translate(-CX, -900);
    this.barco(g, t);
    pintarAvatar(g, eG.m, eG.pose, t);
    const RGu = avatar().rig, RR = avatar("rodrigo").rig;
    conCabeza(g, eG.m, RGu, eG.pose.rc, () => panuelo(g));
    pintarAvatar(g, eR.m, eR.pose, t);
    conCabeza(g, eR.m, RR, eR.pose.rc, () => { parche(g); sombrero(g); });
    this.casco(g);
    this.timon(g, t);
    if (!c.agua) this.dibujarCofre(g, c, t);
    this.cuerda(g, eR, t);
    g.restore();
    // cofre en el agua
    if (c.agua) {
      g.save(); g.translate(0, 0); this.dibujarCofre(g, c, t); g.restore();
    }
    // olas de delante
    this.olas(g, t, 548, 7, "rgba(30,120,200,.94)", 2.2, 1);
    this.olas(g, t, 570, 6, "rgba(14,84,160,1)", 2.6, 4);
    g.fillStyle = "#bfe6ff";
    for (const d of this.gotas) { g.beginPath(); g.ellipse(d.x, d.y, d.r * 0.7, d.r, 0, 0, 6.283); g.fill(); }
    g.strokeStyle = "rgba(255,255,255,.6)"; g.lineWidth = 2;
    for (let i = 0; i < 6; i++) { const x = ((i * 190 + t * 60) % (W + 100)) - 50; g.beginPath(); g.moveTo(x, 558 + Math.sin(x * 0.03 + t * 2.2 + 1) * 7); g.lineTo(x + 34, 558 + Math.sin((x + 34) * 0.03 + t * 2.2 + 1) * 7); g.stroke(); }
    this.p.dibujar(g);
    // ¡UN COFRE!
    if (t > T_VE + 0.1 && t < 2.95) {
      const q = aPant(eR.m, [38, 0]);
      bocadillo(g, q[0] + 60, q[1] - 50, "¡UN COFRE!", q[0] + 10, q[1] - 6, tramo(t, T_VE + 0.1, T_VE + 0.3) * (1 - tramo(t, 2.75, 2.95)), 34);
    }
    // ¡AL ABORDAJE!
    if (t > T_CHIN) {
      const d = t - T_CHIN, k = tramo(d, 0, 0.18), s = lerp(2.5, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 7));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 92); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // iris
    const r = t < 0.7 ? 760 * eInOut(tramo(t, 0.02, 0.7)) : 760 * (1 - eInOut(tramo(t, 9.35, this.dur - 0.05)));
    if (r < 760) {
      g.save(); g.fillStyle = "#000"; g.beginPath(); g.rect(-60, -60, W + 120, H + 120);
      g.moveTo(CX + Math.max(0, r), 330); g.arc(CX, 330, Math.max(0, r), 0, 6.2832); g.fill("evenodd"); g.restore();
    }
  }
}

registrar({ id: "00148", nombre: "Piratas", crear: () => new Piratas() });
})();
