"use strict";
/*
 * 00155 · SUBMARINISTAS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Bajo un mar dorado lleno de burbujas, Guillermo y Rodrigo bajan con escafandras de latón hasta el fondo de arena.
 * Andan a saltitos lentos entre algas y peces; Rodrigo ve un barril medio enterrado y lo señala soltando un
 * borbotón de burbujas. Se agachan, lo desentierran entre los dos y lo levantan: ¡TESORO! Destello dorado, salta el
 * tapón y sale un géiser de espuma mientras los peces dan vueltas. Suben las burbujas y se funde a negro.
 */
(() => {
const cache = cacheTexto();
const ESC = 1.4, ARENA = 548, BX = 512;
const T_VE = 2.5, T_COGE = 3.55, T_TESORO = 4.3, T_TAPON = 6.0;

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(700, 220), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 170);
  gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.45, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
  txt(g, "¡TESORO!", 356, 166, { tam: 140, peso: 400, fam: FB, color: "#3a1800", esp: 4 });
  txt(g, "¡TESORO!", 350, 158, { tam: 140, peso: 400, fam: FB, color: gr, borde: "#3a1800", bordeAncho: 11, esp: 4, glow: "rgba(255,240,170,.95)", glowTam: 30 });
  cache.set("t", c);
  return c;
}
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
function conCabeza(g, m, R, rc, f) { conMat(g, m, () => { g.translate(R.cuello[0], R.cuello[1]); g.rotate(rc); g.translate(-R.cuello[0], -R.cuello[1]); f(); }); }

/** Escafandra de latón con ventana redonda; c = centro del casco, v = centro de la ventana (unidades de avatar). */
function escafandra(g, c, v, r, rv) {
  g.save();
  const gl = g.createRadialGradient(c[0] - r * 0.4, c[1] - r * 0.5, r * 0.1, c[0], c[1], r * 1.05);
  gl.addColorStop(0, "#fff0b0"); gl.addColorStop(0.35, "#e0a83a"); gl.addColorStop(0.8, "#a8661a"); gl.addColorStop(1, "#6a3a08");
  g.fillStyle = gl;
  g.beginPath(); g.arc(c[0], c[1], r, 0, 6.283); g.moveTo(v[0] + rv, v[1]); g.arc(v[0], v[1], rv, 0, 6.283); g.fill("evenodd");
  // ojos de buey laterales
  for (const s of [-1, 1]) {
    g.fillStyle = "#c08a2a"; g.beginPath(); g.arc(c[0] + s * r * 0.86, c[1] + 4, 7.5, 0, 6.283); g.fill();
    g.fillStyle = "#2a4a5a"; g.beginPath(); g.arc(c[0] + s * r * 0.86, c[1] + 4, 4.6, 0, 6.283); g.fill();
  }
  // válvula de arriba
  g.fillStyle = "#c08a2a"; rectR(g, c[0] - 6, c[1] - r - 7, 12, 10, 3); g.fill();
  // cristal y aro de la ventana
  g.fillStyle = "rgba(190,240,255,.16)"; g.beginPath(); g.arc(v[0], v[1], rv, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(255,255,255,.65)"; g.lineWidth = 2.4; g.beginPath(); g.arc(v[0], v[1], rv - 5, 3.6, 4.6); g.stroke();
  g.strokeStyle = "#8a5410"; g.lineWidth = 6; g.beginPath(); g.arc(v[0], v[1], rv + 2, 0, 6.283); g.stroke();
  g.strokeStyle = "#f0c860"; g.lineWidth = 2; g.beginPath(); g.arc(v[0], v[1], rv + 1, 3.4, 5.2); g.stroke();
  g.fillStyle = "#6a3a08";
  for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.283 + 0.2; g.beginPath(); g.arc(v[0] + Math.cos(a) * (rv + 2), v[1] + Math.sin(a) * (rv + 2), 1.6, 0, 6.283); g.fill(); }
  g.restore();
}
/** Peto de latón sobre los hombros. */
function peto(g, R) {
  const y = R.cuello[1] - 4, x0 = R.hombroI2[0] - 2, x1 = R.hombroD[0] + 2;
  const gl = g.createLinearGradient(x0, 0, x1, 0);
  gl.addColorStop(0, "#8a5410"); gl.addColorStop(0.4, "#f0c050"); gl.addColorStop(1, "#7a4408");
  g.fillStyle = gl;
  g.beginPath(); g.moveTo(x0, y + 18); g.quadraticCurveTo(R.cuello[0], y - 6, x1, y + 18); g.quadraticCurveTo(R.cuello[0], y + 34, x0, y + 18); g.closePath(); g.fill();
  g.fillStyle = "#6a3a08"; for (let i = 0; i < 5; i++) { const u = (i + 0.5) / 5; g.beginPath(); g.arc(lerp(x0 + 6, x1 - 6, u), y + 14 + 6 * Math.sin(u * Math.PI), 1.6, 0, 6.283); g.fill(); }
}
/** Barril tumbado; (0, 0) = centro. */
function barrilTumbado(g, ang, brillo, t) {
  g.save(); g.rotate(ang);
  const w = 150, h = 96;
  const gb = g.createLinearGradient(0, -h / 2, 0, h / 2);
  gb.addColorStop(0, "#6a3814"); gb.addColorStop(0.4, "#c88a48"); gb.addColorStop(1, "#4a240a");
  g.fillStyle = gb;
  g.beginPath(); g.moveTo(-w / 2, -h / 2 + 8); g.quadraticCurveTo(0, -h / 2 - 10, w / 2, -h / 2 + 8); g.lineTo(w / 2, h / 2 - 8); g.quadraticCurveTo(0, h / 2 + 10, -w / 2, h / 2 - 8); g.closePath(); g.fill();
  g.strokeStyle = "rgba(50,20,4,.45)"; g.lineWidth = 1.5;
  for (let i = 1; i < 6; i++) { const x = -w / 2 + (w / 6) * i; g.beginPath(); g.moveTo(x, -h / 2 + 2 + Math.abs(x) * 0.08); g.lineTo(x, h / 2 - 2 - Math.abs(x) * 0.08); g.stroke(); }
  for (const x of [-w / 2 + 20, w / 2 - 20]) { g.fillStyle = "#4a4a52"; g.fillRect(x - 4, -h / 2 + 2, 8, h - 4); g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(x - 3, -h / 2 + 4, 2, h - 8); }
  g.fillStyle = "#3a1c06"; g.beginPath(); g.ellipse(w / 2, 0, 8, h / 2 - 8, 0, 0, 6.283); g.fill();
  g.fillStyle = "#7a4418"; g.beginPath(); g.ellipse(w / 2, 0, 6, h / 2 - 12, 0, 0, 6.283); g.fill();
  // jarra pintada
  g.fillStyle = "#fffdf5"; rectR(g, -14, -18, 24, 30, 3); g.fill();
  g.strokeStyle = "#fffdf5"; g.lineWidth = 3.5; g.beginPath(); g.arc(11, -3, 8, -1.3, 1.3); g.stroke();
  g.fillStyle = "#ffc21f"; g.fillRect(-11, -10, 18, 19);
  // algas pegadas
  g.strokeStyle = "#3a8a3a"; g.lineWidth = 3; g.lineCap = "round";
  for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-50 + i * 34, -h / 2 + 4); g.quadraticCurveTo(-56 + i * 34 + 8 * Math.sin(t * 2 + i), -h / 2 - 22, -46 + i * 34, -h / 2 - 38); g.stroke(); }
  if (brillo > 0) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = brillo; g.drawImage(BLOB2.oro, -160, -120, 320, 240); g.restore(); }
  g.restore();
}
function pez(g, x, y, s, col, t, dir) {
  g.save(); g.translate(x, y); g.scale(s * dir, s);
  const cola = Math.sin(t * 12) * 0.3;
  g.fillStyle = col;
  g.beginPath(); g.ellipse(0, 0, 16, 9, 0, 0, 6.283); g.fill();
  g.save(); g.translate(-14, 0); g.rotate(cola); g.beginPath(); g.moveTo(0, 0); g.lineTo(-12, -9); g.lineTo(-12, 9); g.closePath(); g.fill(); g.restore();
  g.fillStyle = "rgba(255,255,255,.4)"; g.beginPath(); g.ellipse(2, -3, 9, 3, 0, 0, 6.283); g.fill();
  g.fillStyle = "#fff"; g.beginPath(); g.arc(9, -2, 3.2, 0, 6.283); g.fill();
  g.fillStyle = "#111"; g.beginPath(); g.arc(10, -2, 1.7, 0, 6.283); g.fill();
  g.restore();
}

class Submarinistas extends Escena {
  constructor() {
    super(9.8);
    this.p = new Parts(360);
    this.p.suelo = () => ARENA;
    this.burbujas = [];
    this.fondoC = null;
    const r = semilla(17);
    this.peces = [];
    for (let i = 0; i < 7; i++) this.peces.push({ y: 120 + r() * 260, v: 60 + r() * 60, x0: r() * W, col: ["#2fe3e8", "#ff5a7a", "#3a9aff", "#ff8a2a"][i % 4], s: 0.8 + r() * 0.6, dir: i % 2 ? 1 : -1 });
    this.tapon = null;
  }
  xs() {
    const t = this.t;
    const kA = eInOut(tramo(t, 1.6, 2.5)), kB = eInOut(tramo(t, 2.9, T_COGE));
    return [lerp(lerp(222, 340, kA), 392, kB), lerp(lerp(806, 690, kA), 632, kB)];
  }
  /** Altura del barril (centro) y si brilla. */
  barril() {
    const t = this.t;
    const k = eOut(tramo(t, T_COGE + 0.2, T_TESORO));
    const y = lerp(ARENA - 10, 352, k) + (t > T_TESORO ? -10 * Math.abs(Math.sin((t - T_TESORO) * 3.2)) : 0);
    return { x: BX, y, ang: lerp(0.12, 0, k), brillo: t > T_TESORO ? 0.4 + 0.25 * Math.sin(t * 6) : 0 };
  }
  poses() {
    const t = this.t, [xg, xr] = this.xs(), B = this.barril();
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    const R = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let yg = PIES, yr = PIES, sy = 1, gD = [70, 158], gI = [9, 160], rD = [68, 157], rI = [9, 157];
    // bajan flotando desde arriba
    const kG = eOut(tramo(t, 0.15, 1.35)), kR = eOut(tramo(t, 0.35, 1.55));
    yg = lerp(-260, PIES, kG); yr = lerp(-260, PIES, kR);
    if (kG < 1) { gD = [86, 40]; gI = [-8, 40]; G.piernaI = [0, 0.15]; G.piernaD = [0, -0.15]; G.cara = "risa"; }
    if (kR < 1) { rD = [84, 50]; rI = [-6, 50]; R.piernaI = [0, 0.15]; R.piernaD = [0, -0.15]; R.cara = "risa"; }
    // andan a saltitos lentos
    const anda = (t > 1.6 && t < 2.5) || (t > 2.9 && t < T_COGE);
    if (anda) {
      const a = andar(t * 6, 1.4), b = andar(t * 6 + 1.6, 1.4);
      G.piernaI = a.piernaI; G.piernaD = a.piernaD; R.piernaI = b.piernaI; R.piernaD = b.piernaD;
      yg += a.bote * 2.4; yr += b.bote * 2.4;
      gD = [74 + 8 * Math.sin(t * 3), 120]; gI = [4 - 8 * Math.sin(t * 3), 120]; rD = [74, 124 + 6 * Math.sin(t * 3)]; rI = [2, 124 - 6 * Math.sin(t * 3)];
      G.rc = 0.1 * Math.sin(t * 2); R.rc = -0.1 * Math.sin(t * 2.3);
    }
    // ¡un barril! Rodrigo lo señala
    if (t > T_VE && t < 2.95) { R.cara = "sorpresa"; G.cara = "sorpresa"; rI = mezcla(rI, [-30, 150], eOut(tramo(t, T_VE, T_VE + 0.15))); R.rc = -0.12; G.rc = 0.12; R.brazoIDelante = true; }
    if (t >= 2.95 && t < T_COGE) { G.cara = "guino"; R.cara = "risa"; }
    // se agachan, lo cogen y lo levantan
    const mG0 = matAv(xg, yg, ESC), mR0 = matAv(xr, yr, ESC);
    if (t >= T_COGE - 0.25) {
      const kC = eInOut(tramo(t, T_COGE - 0.25, T_COGE + 0.1)) * (1 - eInOut(tramo(t, T_COGE + 0.25, T_TESORO - 0.1)));
      sy = 1 - 0.14 * kC;
      const mGc = matAv(xg, yg, ESC, 0, 1, sy), mRc = matAv(xr, yr, ESC, 0, 1, sy);
      const pg = [B.x - 70, B.y + 26], pr = [B.x + 70, B.y + 26];
      const k = eInOut(tramo(t, T_COGE - 0.25, T_COGE));
      gD = mezcla(gD, enAv(mGc, pg), k); rI = mezcla(rI, enAv(mRc, pr), k);
      gI = mezcla(gI, enAv(mGc, [B.x - 74, B.y - 10]), k * 0.6); rD = mezcla(rD, enAv(mRc, [B.x + 74, B.y - 10]), k * 0.6);
      G.cara = t < T_TESORO ? "dormido" : "risa"; R.cara = t < T_TESORO ? "dormido" : "risa";
      R.brazoIDelante = true;
      G.rc = 0.08; R.rc = -0.08;
      if (t > T_TESORO) {
        // saltitos de alegría con el barril
        const sal = Math.abs(Math.sin((t - T_TESORO) * 3.2)) * 10;
        yg -= sal; yr -= sal;
        G.piernaI = [-sal * 0.4, 0.12]; G.piernaD = [-sal * 0.4, -0.12]; R.piernaI = [-sal * 0.4, 0.12]; R.piernaD = [-sal * 0.4, -0.12];
        G.rc = 0.1 + 0.08 * Math.sin(t * 5); R.rc = -0.1 - 0.08 * Math.sin(t * 5);
        if (t > T_TAPON && t < T_TAPON + 0.9) { G.cara = "sorpresa"; R.cara = "sorpresa"; }
        if (t > 7.6) { G.cara = "guino"; }
      }
      const mG = matAv(xg, yg, ESC, 0, 1, sy), mR = matAv(xr, yr, ESC, 0, 1, sy);
      if (t > T_COGE) { gD = enAv(mG, pg); rI = enAv(mR, pr); gI = enAv(mG, [B.x - 74, B.y - 10]); rD = enAv(mR, [B.x + 74, B.y - 10]); }
      G.manoD = gD; G.manoI = gI; R.manoD = rD; R.manoI = rI;
      return { G, R, mG, mR };
    }
    G.manoD = gD; G.manoI = gI; R.manoD = rD; R.manoI = rI;
    void mG0; void mR0;
    return { G, R, mG: matAv(xg, yg, ESC, 0, 1, sy), mR: matAv(xr, yr, ESC, 0, 1, sy) };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, e = this.poses();
    // burbujas de las escafandras (y un borbotón al ver el barril o al gritar)
    const valvula = [[e.mG, [39, 34 - 46]], [e.mR, [38, 44 - 48]]];
    for (const [m, q] of valvula) {
      const fuerte = (t > T_VE && t < T_VE + 0.4) || (t > T_TESORO && t < T_TESORO + 0.5);
      if (Math.random() < (fuerte ? 40 : 5) * dt) { const w = aPant(m, q); this.burbujas.push({ x: w[0] + azar(-6, 6), y: w[1], r: azar(3, fuerte ? 9 : 6), v: azar(80, 160), f: azar(0, 6) }); }
    }
    // burbujas sueltas del mar
    if (Math.random() < 6 * dt) this.burbujas.push({ x: azar(0, W), y: H + 10, r: azar(2, 6), v: azar(60, 120), f: azar(0, 6) });
    // geiser de espuma al saltar el tapón
    const B = this.barril();
    this.una("tapon", t > T_TAPON, () => { temblar(12, 0.3); this.tapon = { x: B.x + 75, y: B.y, vx: 160, vy: -420, r: 0 }; p.nueva(P.DESTELLO, B.x + 75, B.y, 0, 0, 0.35, 160); });
    if (this.tapon) { const c = this.tapon; c.vy += 200 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.r += 8 * dt; }
    if (t > T_TAPON && t < 9.2 && Math.random() < 60 * dt) this.burbujas.push({ x: B.x + 75 + azar(-6, 6), y: B.y + azar(-8, 8), r: azar(4, 11), v: azar(180, 320), f: azar(0, 6), espuma: true });
    // al final, una nube de burbujas
    if (t > 8.4 && Math.random() < 120 * dt) this.burbujas.push({ x: azar(0, W), y: H + 20, r: azar(6, 18), v: azar(260, 420), f: azar(0, 6) });
    for (const b of this.burbujas) { b.y -= b.v * dt; b.x += Math.sin(t * 3 + b.f) * 20 * dt; }
    this.burbujas = this.burbujas.filter((b) => b.y > -30);
    if (this.burbujas.length > 300) this.burbujas.splice(0, this.burbujas.length - 300);
    this.una("posan", t > 1.35, () => { for (let i = 0; i < 10; i++) p.nueva(P.POLVO, this.xs()[0] + azar(-40, 40), PIES - 4, azar(-120, 120), azar(-40, -5), azar(0.8, 1.4), azar(24, 40)); });
    this.una("posanR", t > 1.55, () => { for (let i = 0; i < 10; i++) p.nueva(P.POLVO, this.xs()[1] + azar(-40, 40), PIES - 4, azar(-120, 120), azar(-40, -5), azar(0.8, 1.4), azar(24, 40)); });
    this.una("arranca", t > T_COGE + 0.25, () => { temblar(8, 0.3); for (let i = 0; i < 26; i++) p.nueva(P.POLVO, BX + azar(-90, 90), ARENA, azar(-260, 260), azar(-120, -20), azar(0.8, 1.6), azar(30, 60)); });
    this.una("tesoro", t > T_TESORO, () => {
      temblar(20, 0.5);
      p.nueva(P.DESTELLO, BX, B.y, 0, 0, 0.5, 360);
      for (let i = 0; i < 50; i++) { const a = azar(0, 6.283), v = azar(120, 460); p.nueva(P.PURPURINA, BX, B.y, Math.cos(a) * v, Math.sin(a) * v, azar(0.8, 1.5), azar(10, 18)); }
    });
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 80, H + 80), g = c.getContext("2d");
    g.translate(40, 40);
    const gc = g.createLinearGradient(0, -40, 0, ARENA);
    gc.addColorStop(0, "#ffe27a"); gc.addColorStop(0.5, "#e8a020"); gc.addColorStop(1, "#8a4a08");
    g.fillStyle = gc; g.fillRect(-40, -40, W + 80, ARENA + 40);
    // arena con rizos
    const ga = g.createLinearGradient(0, ARENA - 30, 0, H + 40);
    ga.addColorStop(0, "#e8cf96"); ga.addColorStop(1, "#b89a5a");
    g.fillStyle = ga;
    g.beginPath(); g.moveTo(-40, H + 40); g.lineTo(-40, ARENA - 10);
    for (let x = -40; x <= W + 40; x += 40) g.lineTo(x, ARENA - 10 + Math.sin(x * 0.02) * 10);
    g.lineTo(W + 40, H + 40); g.closePath(); g.fill();
    g.strokeStyle = "rgba(140,110,60,.35)"; g.lineWidth = 2;
    for (let i = 0; i < 9; i++) { const y = ARENA + 8 + i * 6; g.beginPath(); for (let x = -40; x < W + 40; x += 20) g.lineTo(x, y + Math.sin(x * 0.05 + i) * 3); g.stroke(); }
    // rocas y estrella de mar
    for (const [x, y, r] of [[90, ARENA + 10, 40], [140, ARENA + 18, 26], [920, ARENA + 12, 46], [870, ARENA + 22, 22]]) {
      const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.4, 2, x, y, r);
      gr.addColorStop(0, "#8a7a6a"); gr.addColorStop(1, "#3a3028");
      g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, r, r * 0.7, 0, Math.PI, 0); g.fill();
    }
    g.fillStyle = "#ff6a3a"; estrella(g, 760, ARENA + 30, 16, 7, 0.3); g.fill();
    // rayos de sol
    const gr = g.createLinearGradient(0, 0, 0, ARENA);
    gr.addColorStop(0, "rgba(255,250,220,.14)"); gr.addColorStop(1, "rgba(255,250,220,0)");
    g.fillStyle = gr;
    for (let i = 0; i < 6; i++) {
      const x0 = -120 + i * 190 + (i % 2) * 30;
      g.beginPath(); g.moveTo(x0, -40); g.lineTo(x0 + 60 + (i % 3) * 14, -40); g.lineTo(x0 + 200, ARENA); g.lineTo(x0 + 120, ARENA); g.closePath(); g.fill();
    }
    this.fondoC = c;
    return c;
  }
  /** Escafandra pintada una vez (a 3× para que no se pixele) y copiada. */
  casco(g, i, c, v, r, rv) {
    this.cascos = this.cascos || [];
    if (!this.cascos[i]) {
      const S = 3, L = (r + 12) * 2, cv = lienzoNuevo(L * S, L * S), x = cv.getContext("2d");
      x.scale(S, S); x.translate(L / 2 - c[0], L / 2 - c[1]);
      escafandra(x, c, v, r, rv);
      this.cascos[i] = { cv, L };
    }
    const k = this.cascos[i];
    g.drawImage(k.cv, c[0] - k.L / 2, c[1] - k.L / 2, k.L, k.L);
  }
  algas(g, t) {
    g.lineCap = "round";
    for (const [x, h, f, col] of [[40, 220, 0, "#2a7a2a"], [70, 160, 1, "#3a9a3a"], [180, 120, 2, "#2a8a3a"], [840, 140, 3, "#3a9a3a"], [960, 240, 4, "#2a7a2a"], [990, 170, 5, "#3a8a2a"]]) {
      g.strokeStyle = col; g.lineWidth = 10;
      g.beginPath(); g.moveTo(x, ARENA + 10);
      for (let i = 1; i <= 6; i++) g.lineTo(x + Math.sin(t * 1.6 + f + i * 0.7) * i * 4, ARENA + 10 - (h / 6) * i);
      g.stroke();
    }
  }
  dibujar(g) {
    const t = this.t, e = this.poses(), B = this.barril();
    fondo(g, "#000");
    g.drawImage(this.fondo(), -40, -40);
    // peces
    for (const f of this.peces) {
      let x = ((f.x0 + f.dir * f.v * t) % (W + 200) + W + 200) % (W + 200) - 100, y = f.y + Math.sin(t * 2 + f.x0) * 10;
      if (t > T_TAPON) { const k = tramo(t, T_TAPON, T_TAPON + 0.6), a = t * 2.2 + f.x0; x = lerp(x, B.x + Math.cos(a) * (150 + f.s * 40), k); y = lerp(y, B.y - 60 + Math.sin(a) * 70, k); }
      pez(g, x, y, f.s, f.col, t + f.x0, t > T_TAPON ? (Math.sin(t * 2.2 + f.x0) > 0 ? -1 : 1) : f.dir);
    }
    this.algas(g, t);
    // tubos de aire hacia arriba
    const RG = avatar().rig, RR = avatar("rodrigo").rig;
    g.strokeStyle = "#3a3a3a"; g.lineWidth = 7;
    for (const [m, q] of [[e.mG, [39, -14]], [e.mR, [38, -6]]]) { const w = aPant(m, q); g.beginPath(); g.moveTo(w[0], w[1]); g.bezierCurveTo(w[0] + 30, w[1] - 120, w[0] - 30, -60, w[0] + 10, -40); g.stroke(); }
    // el barril (enterrado: detrás de los dos; levantado: delante)
    const delante = t > T_COGE;
    if (!delante) { g.save(); g.translate(B.x, B.y); barrilTumbado(g, B.ang, B.brillo, t); g.restore(); g.fillStyle = "#d8bd84"; g.beginPath(); g.ellipse(B.x, ARENA + 30, 110, 26, 0, Math.PI, 0); g.fill(); }
    for (const [m, pose, R, c, v, r, rv] of [[e.mG, e.G, RG, [39, 32], [39, 42], 46, 27], [e.mR, e.R, RR, [38, 42], [38, 52], 47, 28]]) {
      pintarAvatar(g, m, pose, t);
      conMat(g, m, () => peto(g, R));
      conCabeza(g, m, R, pose.rc, () => this.casco(g, R === RG ? 0 : 1, c, v, r, rv));
    }
    if (delante) { g.save(); g.translate(B.x, B.y); barrilTumbado(g, B.ang, B.brillo, t); g.restore(); }
    // tapón
    if (this.tapon) { const c = this.tapon; g.save(); g.translate(c.x, c.y); g.rotate(c.r); g.fillStyle = "#8a5428"; rectR(g, -8, -6, 16, 12, 3); g.fill(); g.restore(); }
    this.p.dibujar(g);
    // burbujas
    if (!this.burC) {
      this.burC = [false, true].map((espuma) => {
        const c = lienzoNuevo(40, 40), x = c.getContext("2d");
        if (espuma) { x.fillStyle = "rgba(255,250,230,.55)"; x.beginPath(); x.arc(20, 20, 17, 0, 6.283); x.fill(); }
        x.strokeStyle = espuma ? "rgba(255,255,240,.95)" : "rgba(255,255,240,.75)"; x.lineWidth = 3;
        x.beginPath(); x.arc(20, 20, 17, 0, 6.283); x.stroke();
        x.fillStyle = "rgba(255,255,255,.85)"; x.beginPath(); x.arc(14, 14, 4.5, 0, 6.283); x.fill();
        return c;
      });
    }
    for (const b of this.burbujas) { const c = this.burC[b.espuma ? 1 : 0], r = b.r * 1.18; g.drawImage(c, b.x - r, b.y - r, r * 2, r * 2); }
    // velo dorado del agua
    g.fillStyle = "rgba(255,180,40,.08)"; g.fillRect(-60, -60, W + 120, H + 120);
    // ¡TESORO!
    if (t > T_TESORO) {
      const d = t - T_TESORO, k = tramo(d, 0, 0.18), s = lerp(2.5, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 6));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 100 + 6 * Math.sin(d * 2)); g.rotate(-0.04 + 0.02 * Math.sin(d * 1.7)); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0, 0.45), tramo(t, 9.2, this.dur - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00155", nombre: "Submarinistas", crear: () => new Submarinistas() });
})();
