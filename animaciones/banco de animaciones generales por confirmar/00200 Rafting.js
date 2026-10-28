"use strict";
/*
 * 00200 · RAFTING
 *
 * Animación del banco. Empieza y acaba en negro.
 * Guillermo y Marcos bajan unos rápidos en una lancha neumática, remando al ritmo de Marcos. Una ola los empapa, la
 * lancha rebota en una roca (Guillermo sale despedido y vuelve a caer dentro) y aparece el borde de una cascada:
 * ¡REMA! Reman hacia atrás como locos… y caen por la cascada pequeña. ¡CHOF! La lancha sale a flote, los dos
 * empapados pero enteros; Guillermo escupe un chorro de agua, un pez le cae en la cabeza y lo celebran con los remos.
 */
(() => {
const cache = cacheTexto();
const DUR = 10.6, ESC = 1.2, SUP = 420, POZA = 740, VEL = 250;
const T_OLA = 2.6, T_ROCA = 3.55, T_BORDE = 4.5, T_CAE = 5.55, T_CHOF = 6.35, T_PEZ = 7.95;
function S(t) {
  if (t < 5.3) return VEL * t;
  const d = Math.min(t - 5.3, 0.5);
  return VEL * 5.3 + VEL * (d - (d * d) / 1.0) + 300 * eInOut(tramo(t, 6.6, 7.8));
}
const BORDE = S(T_CAE) + 512 + 130, ROCA = S(T_ROCA) + 512 + 215;
const camY = (t) => 320 * eInOut(tramo(t, 5.85, 6.55));

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(600, 220), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 170);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff7a00");
  g.save(); g.translate(300, 110); g.transform(1, 0, -0.14, 1, 0, 0);
  txt(g, "¡REMA!", 8, 66, { tam: 170, peso: 400, fam: FC, color: "#062a4a", esp: 8 });
  txt(g, "¡REMA!", 0, 58, { tam: 170, peso: 400, fam: FC, color: gr, borde: "#062a4a", bordeAncho: 13, esp: 8, glow: "rgba(80,200,255,.9)", glowTam: 24 });
  g.restore();
  cache.set("t", c);
  return c;
}
/** Remo de U (empuñadura) a B (pala), en unidades de avatar. */
function remo(g, U, B) {
  const a = Math.atan2(B[1] - U[1], B[0] - U[0]), L = Math.hypot(B[0] - U[0], B[1] - U[1]);
  g.save(); g.translate(U[0], U[1]); g.rotate(a);
  g.fillStyle = "#2a2e36"; rectR(g, -2, -2.4, L - 26, 4.8, 2.4); g.fill();
  g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(4, -1.6, L - 34, 1.1);
  g.fillStyle = "#1a1c22"; rectR(g, -3, -8, 6, 16, 3); g.fill();
  const gr = g.createLinearGradient(0, -10, 0, 10);
  gr.addColorStop(0, "#ffe25a"); gr.addColorStop(1, "#e09a00");
  g.fillStyle = gr; g.beginPath(); g.moveTo(L - 30, -4); g.quadraticCurveTo(L - 22, -11, L - 2, -10); g.quadraticCurveTo(L + 4, 0, L - 2, 10); g.quadraticCurveTo(L - 22, 11, L - 30, 4); g.closePath(); g.fill();
  g.strokeStyle = "rgba(120,70,0,.6)"; g.lineWidth = 1; g.stroke();
  g.restore();
}
function pez(g, x, y, ang, s, t) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  const c = Math.sin(t * 22) * 0.35;
  g.fillStyle = "#ff8a1a";
  g.save(); g.translate(-16, 0); g.rotate(c); g.beginPath(); g.moveTo(0, 0); g.lineTo(-12, -9); g.lineTo(-10, 0); g.lineTo(-12, 9); g.closePath(); g.fill(); g.restore();
  const gr = g.createLinearGradient(0, -9, 0, 9);
  gr.addColorStop(0, "#ffd34d"); gr.addColorStop(1, "#ff6a00");
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 18, 9, 0, 0, 6.283); g.fill();
  g.fillStyle = "#fff"; g.beginPath(); g.arc(9, -2, 3.4, 0, 6.283); g.fill();
  g.fillStyle = "#111"; g.beginPath(); g.arc(10, -2, 1.7, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(160,60,0,.6)"; g.lineWidth = 1.2; g.beginPath(); g.arc(-2, 0, 6, -1, 1); g.stroke();
  g.restore();
}

class Rafting extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(260);
    this.gotas = [];
    this.fondoC = null;
  }
  /** Lancha: centro en el mundo y giro. */
  lancha(t) {
    const bob = 6 * Math.sin(t * 2.6) + 4 * Math.sin(t * 4.1);
    let x = S(t) + 512, y = SUP - 2 + bob, rot = 0.04 * Math.sin(t * 2.1);
    if (t > T_OLA - 0.15 && t < T_OLA + 0.5) { const k = Math.sin(tramo(t, T_OLA - 0.15, T_OLA + 0.5) * Math.PI); rot -= 0.16 * k; y -= 16 * k; }
    if (t > T_ROCA && t < T_ROCA + 0.6) { const u = tramo(t, T_ROCA, T_ROCA + 0.6); rot -= 0.32 * Math.sin(u * Math.PI) * (1 - u * 0.4); y -= 46 * Math.sin(u * Math.PI); }
    if (t > T_BORDE && t < T_CAE) rot += 0.05 * Math.sin(t * 20);
    if (t >= T_CAE && t < T_CHOF) {
      const u = tramo(t, T_CAE, T_CHOF);
      x = S(T_CAE) + 512 + 200 * u;
      y = lerp(SUP - 2, POZA + 4, eIn(u));
      rot = 0.6 * Math.sin(Math.min(1, u * 1.6) * Math.PI * 0.5) * (1 - eIn(tramo(u, 0.6, 1)));
    }
    if (t >= T_CHOF) {
      const d = t - T_CHOF;
      x = S(T_CAE) + 512 + 200 + 150 * eInOut(Math.min(1, d / 1.6));
      y = POZA + 4 + 70 * Math.sin(Math.min(d / 0.7, 1) * Math.PI) * Math.exp(-d * 1.2) + bob * 0.6 + 8 * Math.sin(d * 7) * Math.exp(-d * 2);
      rot = 0.05 * Math.sin(t * 2.1) + 0.08 * Math.sin(d * 6) * Math.exp(-d * 1.5);
    }
    return { x, y, rot };
  }
  matLancha(t) { const L = this.lancha(t); return new DOMMatrix().translate(L.x - S(t), L.y - camY(t)).rotate((L.rot * 180) / Math.PI); }
  /** Pose de remar: fase, cuánto rema (0–1) o brazos arriba. */
  remar(pose, fase, k, arriba, q) {
    const P = [22, 150], a = 0.35 - 0.2 * Math.cos(fase), d = [-Math.sin(a), Math.cos(a)];
    const sube = 14 * Math.max(0, -Math.sin(fase)) * k;
    const PP = [P[0], P[1] - sube], bajo = q === "marcos" ? -2 : 12;
    let U = [PP[0] - d[0] * 52, PP[1] - d[1] * 52], B = [PP[0] + d[0] * 150, PP[1] + d[1] * 150];
    let mD = [PP[0] - d[0] * 36, PP[1] - d[1] * 36], mI = [PP[0] + d[0] * bajo, PP[1] + d[1] * bajo];
    if (arriba > 0) {
      // remo en alto, con las dos manos
      const al = q === "marcos" ? 34 : 18, w = Math.sin(this.t * 9) * 3;
      const U2 = [-60, al + w], B2 = [150, al - w], mD2 = [q === "marcos" ? 62 : 66, al - w * 0.3], mI2 = [q === "marcos" ? 10 : 8, al + w * 0.3];
      U = mezcla(U, U2, arriba); B = mezcla(B, B2, arriba); mD = mezcla(mD, mD2, arriba); mI = mezcla(mI, mI2, arriba);
    }
    pose.manoD = mD; pose.manoI = mI; pose.brazoIDelante = true;
    pose.remo = [U, B];
    return B;
  }
  poses(t) {
    const LM = this.matLancha(t);
    const rapido = t > T_BORDE && t < T_CAE;
    const fase = rapido ? -t * 16 : t * 10;
    const arriba = t >= T_CAE - 0.1 && t < T_CHOF ? eOut(tramo(t, T_CAE - 0.1, T_CAE + 0.1)) : t > 8.4 ? eOut(tramo(t, 8.4, 8.7)) : 0;
    const flota = t >= T_CHOF && t <= 8.4;
    // Guillermo (detrás)
    const pg = { cara: "sonrisa", rc: 0 };
    let saltoG = 0;
    pg.cara = t < 1.2 ? "sonrisa" : t < T_OLA ? "guino" : t < T_OLA + 0.6 ? "dormido" : t < T_ROCA ? "sonrisa" : t < T_ROCA + 0.7 ? "sorpresa" : t < T_BORDE ? "sonrisa" : t < T_CHOF + 0.4 ? "sorpresa" : t < 7.6 ? "borracho" : t < T_PEZ + 0.3 ? "sorpresa" : "risa";
    if (t > T_ROCA && t < T_ROCA + 0.75) { const u = tramo(t, T_ROCA, T_ROCA + 0.75); saltoG = 90 * Math.sin(u * Math.PI); pg.puntas = Math.sin(u * Math.PI); }
    if (t >= T_CAE - 0.1 && t < T_CHOF) pg.puntas = 0.9;
    if (t > 7.0 && t < 7.6) pg.rc = -0.25;
    if (t > T_PEZ + 0.3) pg.rc = 0.06 * Math.sin(t * 10);
    this.remar(pg, fase + 0.6, flota ? 0 : 1, arriba, "guillermo");
    if (flota) { pg.manoD = [62, 136]; pg.manoI = [16, 136]; pg.remo = [[-30, 150], [150, 120]]; }
    const mG = LM.multiply(matAv(-85, 62 - saltoG, ESC));
    // Marcos (delante)
    const pm = { quien: "marcos", cara: "risa", rc: 0 };
    pm.cara = t < 1.2 ? "risa" : t < T_OLA ? "guino" : t < T_OLA + 0.6 ? "risa" : t < T_ROCA + 0.7 ? "sorpresa" : t < T_BORDE ? "guino" : t < T_CHOF + 0.4 ? "sorpresa" : t < 7.4 ? "borracho" : "risa";
    if (t > T_BORDE && t < T_CAE) pm.rc = 0.1 * Math.sin(t * 14);
    if (t >= T_CAE - 0.1 && t < T_CHOF) pm.puntas = 0.8;
    if (t > T_PEZ + 0.2 && t < 8.4) pm.rc = -0.15 + 0.06 * Math.sin(t * 14);
    this.remar(pm, fase, flota ? 0 : 1, arriba, "marcos");
    if (flota) { pm.manoD = [60, 136]; pm.manoI = [12, 136]; pm.remo = [[-40, 150], [140, 128]]; }
    const mM = LM.multiply(matAv(85, 62, ESC));
    return { LM, pg, mG, pm, mM };
  }
  salpica(x, y, n, f) {
    for (let i = 0; i < n; i++) { const a = azar(-Math.PI * 0.95, -Math.PI * 0.05), v = azar(0.4, 1) * f; this.gotas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, v: azar(0.5, 1.1), s: azar(3, 8) }); }
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const L = this.lancha(t), cy = camY(t), sx = L.x - S(t), sy = L.y - cy;
    // espuma en la proa y a los lados
    if (t < T_CAE && Math.random() < 30 * dt) this.salpica(sx + 190 + azar(-10, 10), sy + 20, 2, 240);
    if (t < T_CAE && Math.random() < 14 * dt) this.salpica(sx + azar(-200, 200), sy + 26, 1, 160);
    // las palas al entrar en el agua
    if (t < T_CAE && t > 0.5 && Math.random() < 10 * dt) this.salpica(sx + azar(-200, 40), sy + 40, 3, 180);
    this.una("ola", t > T_OLA, () => { temblar(8, 0.2); for (let i = 0; i < 40; i++) this.gotas.push({ x: sx + 220 + azar(-30, 30), y: sy - 40 - azar(0, 120), vx: azar(-520, -220), vy: azar(-260, 40), v: azar(0.6, 1.0), s: azar(4, 10) }); });
    this.una("roca", t > T_ROCA, () => { temblar(16, 0.3); this.salpica(sx + 200, sy + 10, 26, 360); });
    this.una("chof", t > T_CHOF, () => {
      temblar(26, 0.55);
      p.nueva(P.DESTELLO, sx, sy, 0, 0, 0.4, 420);
      for (let i = 0; i < 90; i++) { const a = azar(-Math.PI * 0.95, -Math.PI * 0.05), v = azar(250, 900); this.gotas.push({ x: sx + azar(-200, 200), y: sy + 10, vx: Math.cos(a) * v * 0.7, vy: Math.sin(a) * v, v: azar(0.7, 1.4), s: azar(5, 13) }); }
      for (let i = 0; i < 14; i++) p.nueva(P.VAPOR, sx + azar(-260, 260), sy - azar(0, 80), azar(-80, 80), azar(-120, -20), azar(1.0, 1.8), azar(80, 140));
    });
    // empapados: gotean
    if (t > T_CHOF + 0.5 && Math.random() < 14 * dt) {
      const e = this.poses(t), m = Math.random() < 0.5 ? e.mG : e.mM, q = aPant(m, [azar(15, 60), azar(10, 40)]);
      this.gotas.push({ x: q[0], y: q[1], vx: azar(-20, 20), vy: 40, v: 0.5, s: azar(2.5, 4) });
    }
    // Guillermo escupe un chorro de agua
    if (t > 7.0 && t < 7.5) {
      const e = this.poses(t), b = aPant(e.mG, boca(-0.25));
      for (let i = 0; i < 2; i++) this.gotas.push({ x: b[0], y: b[1], vx: azar(-60, -20), vy: azar(-560, -480), v: 1.1, s: azar(3.5, 6) });
    }
    // cascada: espuma abajo
    if (t > 5.0) { const xb = BORDE - S(t); if (Math.random() < 30 * dt) this.salpica(xb + azar(0, 60), POZA - cy + 10, 2, 300); if (Math.random() < 5 * dt) p.nueva(P.VAPOR, xb + azar(0, 80), POZA - cy, azar(-30, 30), azar(-80, -30), azar(1, 1.6), azar(60, 110)); }
    this.una("pez", t > T_PEZ, () => { temblar(5, 0.12); });
    for (const d of this.gotas) { d.vy += 1300 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.v -= dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    if (this.gotas.length > 420) this.gotas.splice(0, this.gotas.length - 420);
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 120, 560), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, 300);
    gc.addColorStop(0, "#3a9ef0"); gc.addColorStop(1, "#cdeeff");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, 560);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8; g.drawImage(BLOB.amarillo, 30, -90, 240, 240); g.restore();
    g.fillStyle = "#fffbe0"; g.beginPath(); g.arc(150, 30, 30, 0, 6.283); g.fill();
    this.fondoC = c;
    return c;
  }
  /** Paredes del cañón (paralaje). */
  canon(g, t, cy) {
    const s = S(t) * 0.35;
    for (const [col, y0, amp, f, par] of [["#c86a3a", 230, 70, 0.011, 0.35], ["#a24a26", 300, 60, 0.017, 0.6]]) {
      const off = S(t) * par;
      g.fillStyle = col; g.beginPath(); g.moveTo(-60, POZA + 60 - cy);
      for (let x = -60; x <= W + 60; x += 24) { const wx = x + off; g.lineTo(x, y0 - cy - amp * Math.abs(Math.sin(wx * f)) - 30 * Math.sin(wx * f * 2.7)); }
      g.lineTo(W + 60, POZA + 60 - cy); g.closePath(); g.fill();
    }
    // bruma del fondo del cañón
    const gb = g.createLinearGradient(0, SUP + 20 - cy, 0, POZA - cy);
    gb.addColorStop(0, "rgba(200,230,250,0)"); gb.addColorStop(1, "rgba(200,230,250,.75)");
    g.fillStyle = gb; g.fillRect(-60, SUP + 20 - cy, W + 120, POZA - SUP);
    // arbustos en la orilla del fondo
    const off = S(t) * 0.8;
    for (let k = -1; k < 9; k++) {
      const wx = Math.floor(off / 150) * 150 + k * 150, x = wx - off;
      g.fillStyle = "#2f7a2c"; g.beginPath(); g.arc(x, SUP - 8 - cy, 26 + (wx / 150 % 3) * 8, Math.PI, 0); g.fill();
    }
    void s;
  }
  agua(g, t, cy, delante) {
    const xb = BORDE - S(t);
    // río de arriba (hasta el borde) y poza de abajo
    const ola = (x, y0, a) => y0 + Math.sin(x * 0.035 + t * 7) * a + Math.sin(x * 0.013 - t * 3) * a;
    if (!delante) {
      // pared de la cascada
      if (xb < W + 100) {
        g.fillStyle = "#7a3a1e"; g.fillRect(xb - 10, SUP + 60 - cy, 40, POZA - SUP - 60);
        const gr = g.createLinearGradient(xb, 0, xb + 90, 0);
        gr.addColorStop(0, "rgba(220,245,255,.95)"); gr.addColorStop(1, "rgba(120,200,240,.6)");
        g.fillStyle = gr; g.beginPath(); g.moveTo(xb - 6, SUP - 4 - cy); g.quadraticCurveTo(xb + 60, SUP + 20 - cy, xb + 74, POZA - cy); g.lineTo(xb + 10, POZA - cy); g.quadraticCurveTo(xb + 10, SUP + 60 - cy, xb - 6, SUP + 30 - cy); g.closePath(); g.fill();
        g.strokeStyle = "rgba(255,255,255,.7)"; g.lineWidth = 3;
        for (let k = 0; k < 5; k++) { const o = ((t * 400 + k * 70) % 330); g.beginPath(); g.moveTo(xb + 6 + k * 12, SUP + 10 + o * 0.9 - cy); g.lineTo(xb + 10 + k * 12, SUP + 50 + o * 0.9 - cy); g.stroke(); }
      }
      // la pared de roca bajo el río de arriba
      if (xb < W + 80) {
        const gp = g.createLinearGradient(0, SUP + 60 - cy, 0, POZA - cy);
        gp.addColorStop(0, "#8a4424"); gp.addColorStop(1, "#5a2814");
        g.fillStyle = gp; g.fillRect(-80, SUP + 60 - cy, xb + 90, POZA - SUP + 400);
        g.strokeStyle = "rgba(40,15,5,.35)"; g.lineWidth = 3;
        for (let k = 0; k < 6; k++) { const y = SUP + 190 + k * 48 - cy; g.beginPath(); g.moveTo(-80, y); g.lineTo(xb, y + 10 * Math.sin(k)); g.stroke(); }
      }
      // poza
      g.fillStyle = "#1a6ab0"; g.beginPath(); g.moveTo(xb + 10, ola(xb, POZA - cy, 3));
      for (let x = xb + 10; x <= W + 80; x += 20) g.lineTo(x, ola(x, POZA - cy, 3));
      g.lineTo(W + 80, H + 400); g.lineTo(xb + 10, H + 400); g.closePath(); g.fill();
      // río de arriba
      g.fillStyle = "#2a86c8"; g.beginPath(); g.moveTo(-80, ola(-80, SUP - cy, 4));
      for (let x = -80; x <= Math.min(xb, W + 80); x += 20) g.lineTo(x, ola(x, SUP - cy, 4));
      g.lineTo(Math.min(xb, W + 80), SUP + 160 - cy); g.lineTo(-80, SUP + 160 - cy); g.closePath(); g.fill();
      return;
    }
    // capa de delante: agua por encima del fondo de la lancha y espuma
    g.save(); g.globalAlpha = 0.85;
    const lim = t < T_CAE + 0.3 ? Math.min(xb, W + 80) : -80;
    if (lim > -80) {
      g.fillStyle = "#1f74b8"; g.beginPath(); g.moveTo(-80, ola(-80, SUP + 26 - cy, 5));
      for (let x = -80; x <= lim; x += 20) g.lineTo(x, ola(x + 40, SUP + 26 - cy, 5));
      g.lineTo(lim, SUP + 200 - cy); g.lineTo(-80, SUP + 200 - cy); g.closePath(); g.fill();
      g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = 4; g.beginPath();
      for (let x = -80; x <= lim; x += 20) g.lineTo(x, ola(x + 40, SUP + 26 - cy, 5));
      g.stroke();
    }
    if (t > 5.6) {
      g.fillStyle = "#15609e"; g.beginPath(); g.moveTo(xb + 10, ola(xb, POZA + 30 - cy, 5));
      for (let x = xb + 10; x <= W + 80; x += 20) g.lineTo(x, ola(x + 40, POZA + 30 - cy, 5));
      g.lineTo(W + 80, POZA + 400 - cy); g.lineTo(xb + 10, POZA + 400 - cy); g.closePath(); g.fill();
      g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = 4; g.beginPath();
      for (let x = xb + 10; x <= W + 80; x += 20) g.lineTo(x, ola(x + 40, POZA + 30 - cy, 5));
      g.stroke();
    }
    g.restore();
    // espuma de los rápidos que pasa
    g.fillStyle = "rgba(255,255,255,.85)";
    const off = S(t) * 1.3;
    for (let k = -1; k < 10; k++) {
      const wx = Math.floor(off / 120) * 120 + k * 120, x = wx - off;
      if (x > xb - 20 && t < T_CAE + 1) continue;
      const y = (x < xb ? SUP + 50 : POZA + 54) - cy + ((wx / 120) % 3) * 22;
      g.beginPath(); g.ellipse(x, y, 22, 4, 0, 0, 6.283); g.fill();
    }
  }
  pintarLancha(g, LM, parte) {
    conMat(g, LM, () => {
      if (parte === "atras") {
        const gr = g.createLinearGradient(0, -52, 0, -24);
        gr.addColorStop(0, "#ff8a3a"); gr.addColorStop(1, "#c2410c");
        g.fillStyle = gr; rectR(g, -186, -50, 372, 30, 15); g.fill();
        g.fillStyle = "#7a2a08"; g.fillRect(-170, -26, 340, 20);
        return;
      }
      const gr = g.createLinearGradient(0, -32, 0, 34);
      gr.addColorStop(0, "#ffb070"); gr.addColorStop(0.35, "#ff7a1a"); gr.addColorStop(1, "#b0360a");
      g.fillStyle = gr; rectR(g, -198, -32, 396, 64, 32); g.fill();
      g.strokeStyle = "#7a2408"; g.lineWidth = 2.5; g.stroke();
      g.fillStyle = "rgba(255,255,255,.35)"; rectR(g, -170, -26, 340, 9, 4.5); g.fill();
      g.strokeStyle = "#2a2a2a"; g.lineWidth = 2; g.setLineDash([10, 8]);
      g.beginPath(); g.moveTo(-170, -4); for (let x = -170; x <= 170; x += 34) g.quadraticCurveTo(x + 17, 8, x + 34, -4); g.stroke(); g.setLineDash([]);
      g.fillStyle = "#1a1a1a"; for (const x of [-120, 0, 120]) { rectR(g, x - 12, 12, 24, 8, 3); g.fill(); }
    });
  }
  dibujar(g) {
    const t = this.t, cy = camY(t), e = this.poses(t), xb = BORDE - S(t);
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60 - cy * 0.3);
    this.canon(g, t, cy);
    this.agua(g, t, cy, false);
    // roca
    const xr = ROCA - S(t);
    if (xr > -150 && xr < W + 150) {
      g.save(); g.translate(xr, SUP + 10 - cy);
      const gr = g.createLinearGradient(0, -60, 0, 30); gr.addColorStop(0, "#9a9aa4"); gr.addColorStop(1, "#3a3a44");
      g.fillStyle = gr; g.beginPath(); g.moveTo(-60, 30); g.quadraticCurveTo(-58, -40, -10, -56); g.quadraticCurveTo(46, -50, 62, 30); g.closePath(); g.fill();
      g.fillStyle = "rgba(255,255,255,.25)"; g.beginPath(); g.ellipse(-16, -36, 16, 7, -0.3, 0, 6.283); g.fill();
      g.restore();
    }
    // ola grande que los empapa
    if (t > T_OLA - 0.35 && t < T_OLA + 0.25) {
      const k = Math.sin(tramo(t, T_OLA - 0.35, T_OLA + 0.25) * Math.PI), L = this.lancha(t), x = L.x - S(t) + 230;
      g.fillStyle = "#3a9ae0"; g.beginPath(); g.moveTo(x - 90, SUP + 20 - cy); g.quadraticCurveTo(x - 30, SUP - 150 * k - cy, x + 30, SUP - 170 * k - cy); g.quadraticCurveTo(x - 20, SUP - 120 * k - cy, x + 90, SUP + 20 - cy); g.closePath(); g.fill();
      g.strokeStyle = "#fff"; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 50, SUP - 90 * k - cy); g.quadraticCurveTo(x - 20, SUP - 160 * k - cy, x + 30, SUP - 170 * k - cy); g.stroke();
    }
    this.pintarLancha(g, e.LM, "atras");
    // los dos, cortados por el suelo de la lancha
    g.save(); conMat(g, e.LM, () => { g.beginPath(); g.rect(-400, -900, 800, 924); }); g.clip();
    pintarAvatar(g, e.mG, e.pg, t);
    pintarAvatar(g, e.mM, e.pm, t);
    g.restore();
    this.pintarLancha(g, e.LM, "delante");
    // los remos, por delante de la borda (la pala entra en el agua)
    conMat(g, e.mG, () => remo(g, e.pg.remo[0], e.pg.remo[1]));
    conMat(g, e.mM, () => remo(g, e.pm.remo[0], e.pm.remo[1]));
    // el pez: salta y se queda en la cabeza de Guillermo
    if (t > T_PEZ - 0.55) {
      const cab = aPant(e.mG, [39, -2]);
      if (t < T_PEZ) { const u = tramo(t, T_PEZ - 0.55, T_PEZ), x0 = [cab[0] + 230, POZA + 40 - cy]; pez(g, lerp(x0[0], cab[0], u), lerp(x0[1], cab[1], u) - 220 * Math.sin(u * Math.PI), -2.6 + u * 3.4 - Math.PI * 0.2, 1.6, t); }
      else pez(g, cab[0] + 4, cab[1] - 6, 0.2 + 0.25 * Math.sin(t * 9), 1.6, t);
    }
    this.agua(g, t, cy, true);
    // gotas
    g.fillStyle = "#dff4ff";
    for (const d of this.gotas) { g.globalAlpha = Math.min(1, d.v * 2.5); g.beginPath(); g.arc(d.x, d.y, d.s, 0, 6.283); g.fill(); }
    g.globalAlpha = 1;
    this.p.dibujar(g);
    // textos
    const grito = (s, x, y, t0, t1, tam, col, borde, rot = -0.08) => {
      if (t < t0 || t > t1) return;
      const k = eBack(tramo(t, t0, t0 + 0.15));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 3, alfa: 1 - tramo(t, t1 - 0.2, t1) });
      g.restore();
    };
    const bm = aPant(e.mM, [60, 30]);
    grito("¡REMA!", bm[0] + 70, bm[1] - 50, 0.8, 1.6, 46, "#fffdf5", "#062a4a", 0.06);
    grito("¡REMA!", bm[0] + 70, bm[1] - 50, 1.9, 2.5, 46, "#fffdf5", "#062a4a", 0.06);
    grito("¡CHOF!", 760, 190, T_OLA, T_OLA + 0.7, 56, "#bff4ff", "#062a4a");
    grito("¡BOING!", 780, 250, T_ROCA, T_ROCA + 0.7, 56, "#ffd34d", "#4a1a00", 0.1);
    grito("¡AAAAH!", 760, 250, T_CAE, T_CHOF, 64, "#fffdf5", "#4a0a00", 0.1);
    grito("¡CHOOOF!", 512, 300, T_CHOF, T_CHOF + 0.9, 90, "#bff4ff", "#062a4a", -0.05);
    if (t > T_BORDE) {
      const d = t - T_BORDE, k = tramo(d, 0, 0.16), s = lerp(2.6, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 9));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 98); g.rotate(-0.05); g.scale(s * 0.8, s * 0.8);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // destello del chof
    if (t > T_CHOF && t < T_CHOF + 0.35) { g.fillStyle = `rgba(225,245,255,${0.75 * (1 - tramo(t, T_CHOF, T_CHOF + 0.35))})`; g.fillRect(-60, -60, W + 120, H + 120); }
    // iris
    const L = this.lancha(t), cF = [L.x - S(t), L.y - cy - 120];
    const r = t < 1 ? 800 * eInOut(tramo(t, 0.02, 0.7)) : 800 * (1 - eInOut(tramo(t, DUR - 0.7, DUR - 0.04)));
    const cc = t < 1 ? [512, 330] : cF;
    if (r < 800) {
      g.save(); g.fillStyle = "#000"; g.beginPath(); g.rect(-60, -60, W + 120, H + 120);
      g.moveTo(cc[0] + Math.max(0, r), cc[1]); g.arc(cc[0], cc[1], Math.max(0, r), 0, 6.2832); g.fill("evenodd"); g.restore();
    }
  }
}

registrar({ id: "00200", nombre: "Rafting", crear: () => new Rafting() });
})();
