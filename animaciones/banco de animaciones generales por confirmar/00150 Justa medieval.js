"use strict";
/*
 * 00150 · JUSTA MEDIEVAL
 *
 * Animación del banco. Empieza y acaba en negro.
 * Sube un rastrillo de castillo y aparece el campo del torneo. Guillermo (con una olla de yelmo) y Rodrigo (con un
 * escurridor) entran al galope montados en barriles con cabeza de caballo de juguete y barras de pan por lanzas.
 * Saludan, bajan las barras y ¡A LA CARGA! Chocan en el centro: las barras se parten en una nube de migas y harina
 * (nadie se hace daño). Se miran los cachitos, se encogen de hombros y se los comen. Baja el rastrillo.
 */
(() => {
const cache = cacheTexto();
const ESC = 1.45;
const T_CARGA = 2.35, T_CHOQUE = 3.75;
const XG0 = 100, XR0 = 924, XG1 = 318, XR1 = 706;   // salida y choque (las puntas se tocan en x = 512)
const L_DEL = 82, L_DET = 30;                        // largo de la barra por delante y por detrás de la mano (unidades)

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(840, 210), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 50, 0, 160);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#ffe27a"); gr.addColorStop(1, "#e0a020");
  txt(g, "¡A LA CARGA!", 426, 160, { tam: 126, peso: 900, fam: FD, color: "#5a0a10", esp: 5 });
  txt(g, "¡A LA CARGA!", 420, 152, { tam: 126, peso: 900, fam: FD, color: gr, borde: "#5a0a10", bordeAncho: 11, esp: 5, glow: "rgba(255,80,60,.6)", glowTam: 22 });
  cache.set("t", c);
  return c;
}
function conCabeza(g, m, R, rc, f) { conMat(g, m, () => { g.translate(R.cuello[0], R.cuello[1]); g.rotate(rc); g.translate(-R.cuello[0], -R.cuello[1]); f(); }); }

/** Barra de pan: empuñadura en (0, 0), apunta hacia +x. del/det: largo por delante y por detrás; rota: punta partida. */
function barra(g, del, det, rota, esc = 1) {
  g.save(); g.scale(esc, esc);
  const r = 5.2;
  g.beginPath();
  g.moveTo(-det + r, -r); g.lineTo(del - (rota ? 0 : r), -r);
  if (rota) { g.lineTo(del + 2, -r * 0.4); g.lineTo(del - 2, 0); g.lineTo(del + 3, r * 0.5); g.lineTo(del, r); }
  else g.quadraticCurveTo(del + r * 0.9, 0, del - r, r);
  g.lineTo(-det + r, r); g.quadraticCurveTo(-det - r * 0.9, 0, -det + r, -r); g.closePath();
  const gr = g.createLinearGradient(0, -r, 0, r);
  gr.addColorStop(0, "#f7c776"); gr.addColorStop(0.5, "#d98a32"); gr.addColorStop(1, "#8a4c14");
  g.fillStyle = gr; g.fill();
  g.strokeStyle = "rgba(90,40,8,.55)"; g.lineWidth = 0.8; g.stroke();
  g.strokeStyle = "rgba(255,236,190,.85)"; g.lineWidth = 1.3; g.lineCap = "round";
  for (let x = -det + 8; x < del - 8; x += 13) { g.beginPath(); g.moveTo(x, -r * 0.6); g.lineTo(x + 7, -r * 0.05); g.stroke(); }
  if (rota) { g.fillStyle = "#fff3d8"; g.beginPath(); g.ellipse(del - 0.5, 0, 2.2, r * 0.85, 0, 0, 6.283); g.fill(); }
  g.restore();
}
/** Barril con cabeza de caballo de juguete, en unidades de avatar; dir 1 mira a la derecha, -1 a la izquierda. */
function caballo(g, dir, t, galope, cab) {
  g.save();
  g.translate(39, 0); g.scale(dir, 1); g.translate(-39, 0);
  const x0 = -16, x1 = 104, y0 = 126, y1 = 176, cy = (y0 + y1) / 2;
  // cola de cuerda
  g.strokeStyle = "#e8d29a"; g.lineWidth = 3; g.lineCap = "round";
  for (let i = 0; i < 4; i++) { const a = 0.4 + i * 0.18 + 0.15 * Math.sin(t * 9 + i) * galope; g.beginPath(); g.moveTo(x0 + 2, cy - 8); g.quadraticCurveTo(x0 - 12, cy - 4 + i * 3, x0 - 10 - Math.cos(a) * 14, cy + 8 + Math.sin(a) * 18); g.stroke(); }
  // barril
  const gb = g.createLinearGradient(0, y0, 0, y1);
  gb.addColorStop(0, "#b8743a"); gb.addColorStop(0.45, "#e0a060"); gb.addColorStop(1, "#6a3814");
  g.fillStyle = gb;
  g.beginPath(); g.moveTo(x0 + 6, y0); g.quadraticCurveTo((x0 + x1) / 2, y0 - 7, x1 - 6, y0); g.quadraticCurveTo(x1 + 3, cy, x1 - 6, y1); g.quadraticCurveTo((x0 + x1) / 2, y1 + 7, x0 + 6, y1); g.quadraticCurveTo(x0 - 3, cy, x0 + 6, y0); g.closePath(); g.fill();
  g.strokeStyle = "rgba(60,28,6,.5)"; g.lineWidth = 1; g.stroke();
  g.strokeStyle = "rgba(60,28,6,.35)";
  for (let i = 1; i < 4; i++) { const yy = lerp(y0, y1, i / 4); g.beginPath(); g.moveTo(x0 + 2, yy); g.quadraticCurveTo((x0 + x1) / 2, yy + (yy - cy) * 0.15, x1 - 2, yy); g.stroke(); }
  for (const xx of [x0 + 18, x1 - 18]) {
    g.fillStyle = "#4a4a52"; g.beginPath(); g.moveTo(xx - 3, y0 - 3); g.quadraticCurveTo(xx - 6, cy, xx - 3, y1 + 3); g.lineTo(xx + 3, y1 + 3); g.quadraticCurveTo(xx, cy, xx + 3, y0 - 3); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(xx - 2, y0 + 2, 1.4, y1 - y0 - 4);
  }
  // cuello y cabeza de caballo de madera
  g.save(); g.translate(x1 - 10, y0 + 6); g.rotate(-0.15 * cab);
  g.fillStyle = "#8a5428";
  g.beginPath(); g.moveTo(-8, 4); g.quadraticCurveTo(-4, -30, 6, -52); g.lineTo(22, -48); g.quadraticCurveTo(14, -24, 12, 6); g.closePath(); g.fill();
  // crin
  g.fillStyle = "#2a1608";
  for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(-4 + i * 2.2 - 2, -8 - i * 10, 5, 7, -0.5, 0, 6.283); g.fill(); }
  // cabeza
  const gh = g.createLinearGradient(0, -70, 0, -30);
  gh.addColorStop(0, "#b47a40"); gh.addColorStop(1, "#7a4420");
  g.fillStyle = gh;
  g.beginPath(); g.moveTo(2, -54); g.quadraticCurveTo(10, -72, 26, -64); g.quadraticCurveTo(44, -56, 46, -44); g.quadraticCurveTo(46, -36, 36, -36); g.quadraticCurveTo(24, -40, 14, -36); g.quadraticCurveTo(4, -38, 2, -54); g.closePath(); g.fill();
  g.strokeStyle = "rgba(40,18,4,.5)"; g.lineWidth = 0.9; g.stroke();
  g.fillStyle = "#f4ead8"; g.beginPath(); g.moveTo(22, -64); g.quadraticCurveTo(36, -58, 42, -46); g.lineTo(38, -44); g.quadraticCurveTo(32, -54, 22, -60); g.closePath(); g.fill();
  g.fillStyle = "#7a4420"; g.beginPath(); g.moveTo(8, -62); g.lineTo(6, -76); g.lineTo(16, -66); g.closePath(); g.fill();
  g.fillStyle = "#111"; g.beginPath(); g.arc(20, -56, 2.6, 0, 6.283); g.fill();
  g.fillStyle = "#fff"; g.beginPath(); g.arc(20.8, -56.8, 0.9, 0, 6.283); g.fill();
  g.fillStyle = "#3a1a08"; g.beginPath(); g.arc(42, -42, 1.4, 0, 6.283); g.fill();
  g.strokeStyle = "#c0262a"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(14, -38); g.lineTo(26, -62); g.moveTo(30, -40); g.lineTo(30, -52); g.stroke();
  g.restore();
  g.restore();
}
function olla(g) {
  // olla del revés de yelmo (unidades de Guillermo)
  g.save();
  const gr = g.createLinearGradient(8, 0, 70, 0);
  gr.addColorStop(0, "#6c7480"); gr.addColorStop(0.35, "#eef2f6"); gr.addColorStop(0.6, "#b8c0ca"); gr.addColorStop(1, "#5a626c");
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(10, 14); g.lineTo(13, -14); g.quadraticCurveTo(39, -20, 65, -14); g.lineTo(68, 14); g.closePath(); g.fill();
  g.fillStyle = "#4a525c"; rectR(g, 6, 12, 66, 7, 3); g.fill();
  g.fillStyle = "rgba(255,255,255,.6)"; g.fillRect(22, -12, 3, 22);
  g.strokeStyle = "#3a424c"; g.lineWidth = 3;
  g.beginPath(); g.arc(6, 0, 5, Math.PI * 0.5, Math.PI * 1.5); g.stroke();
  g.beginPath(); g.arc(72, 0, 5, -Math.PI * 0.5, Math.PI * 0.5); g.stroke();
  g.fillStyle = "#e23a2a"; g.beginPath(); g.moveTo(39, -18); g.quadraticCurveTo(30, -40, 46, -46); g.quadraticCurveTo(42, -32, 44, -18); g.closePath(); g.fill();
  g.restore();
}
function escurridor(g) {
  // escurridor de yelmo con agujeritos (unidades de Rodrigo)
  g.save();
  g.beginPath(); g.moveTo(6, 22); g.quadraticCurveTo(4, -14, 38, -16); g.quadraticCurveTo(72, -14, 70, 22); g.closePath();
  const gr = g.createLinearGradient(6, 0, 70, 0);
  gr.addColorStop(0, "#5a6a80"); gr.addColorStop(0.4, "#e8f0fa"); gr.addColorStop(1, "#4a5a70");
  g.fillStyle = gr; g.fill();
  g.save(); g.clip(); g.fillStyle = "#2a3444";
  for (let y = -8; y < 20; y += 6) for (let x = 12 + ((y / 6) % 2) * 3; x < 66; x += 6) { g.beginPath(); g.arc(x, y, 1.2, 0, 6.283); g.fill(); }
  g.restore();
  g.fillStyle = "#3a4a60"; rectR(g, 2, 19, 72, 6, 3); g.fill();
  g.strokeStyle = "#3a4a60"; g.lineWidth = 3;
  g.beginPath(); g.moveTo(2, 22); g.lineTo(-6, 16); g.moveTo(74, 22); g.lineTo(82, 16); g.stroke();
  g.fillStyle = "#2a6ae0"; g.beginPath(); g.moveTo(38, -15); g.quadraticCurveTo(28, -38, 44, -44); g.quadraticCurveTo(40, -30, 43, -15); g.closePath(); g.fill();
  g.restore();
}

class Justa extends Escena {
  constructor() {
    super(9.6);
    this.p = new Parts(380);
    this.p.suelo = () => PIES;
    this.migas = []; this.trozos = []; this.fondoC = null;
  }
  /** Posición x y si galopa. */
  pos(quien) {
    const t = this.t, s = quien === "g" ? 1 : -1;
    const x0 = quien === "g" ? XG0 : XR0, x1 = quien === "g" ? XG1 : XR1;
    let x;
    if (t < 1.3) x = lerp(x0 - s * 260, x0, eOut(tramo(t, 0.3, 1.3)));
    else if (t < T_CHOQUE) x = lerp(x0, x1, eIn(tramo(t, T_CARGA, T_CHOQUE)) * 0.6 + tramo(t, T_CARGA, T_CHOQUE) * 0.4);
    else x = lerp(x1, x1 - s * 80, eOut(tramo(t, T_CHOQUE, T_CHOQUE + 0.5)));
    const galope = (t > 0.3 && t < 1.3) || (t > T_CARGA && t < T_CHOQUE) ? 1 : t > 7.4 && t < 8.6 ? 0.5 : 0;
    return { x, galope };
  }
  pose(quien) {
    const t = this.t, g_ = quien === "g", s = g_ ? 1 : -1;
    const { x, galope } = this.pos(quien);
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    if (!g_) { pose.quien = "rodrigo"; pose.brazoIDelante = true; }
    const vel = t > T_CARGA && t < T_CHOQUE ? 16 + 10 * tramo(t, T_CARGA, T_CHOQUE) : 13;
    const a = andar(t * vel + (g_ ? 0 : 1.5), galope * 1.3);
    pose.piernaI = a.piernaI; pose.piernaD = a.piernaD;
    let bote = a.bote * 1.4, giro = 0, cab = galope * Math.sin(t * vel);
    // la mano de la barra (delante) y la de las riendas
    let mano = g_ ? [94, 126] : [-16, 124], otra = g_ ? [14, 136] : [66, 138], ang = 0, del = L_DEL, rota = false;
    // saludo con la barra en alto
    const kS = eInOut(tramo(t, 1.35, 1.6)) * (1 - eInOut(tramo(t, 2.0, 2.3)));
    mano = mezcla(mano, g_ ? [82, 96] : [-4, 100], kS); ang = -1.45 * kS;
    if (t > 1.35 && t < 2.3) { pose.cara = t < 1.8 ? "guino" : "risa"; pose.rc = s * 0.14 * eInOut(tramo(t, 1.7, 1.85)); cab = 0.6 * kS; }
    // ¡a la carga!
    if (t > T_CARGA && t < T_CHOQUE) { pose.cara = t < 3.1 ? "risa" : "sorpresa"; pose.rc = s * 0.05; giro = s * 0.06; pose.puntas = 0.35 * tramo(t, 3.0, T_CHOQUE); }
    // ¡crac! retroceso tambaleándose
    if (t >= T_CHOQUE) {
      const d = t - T_CHOQUE;
      del = 22; rota = true;
      giro = -s * 0.22 * Math.sin(d * 11) * Math.exp(-d * 3.2);
      pose.cara = d < 1.4 ? "sorpresa" : "risa"; pose.puntas = d < 0.9 ? 1 - tramo(d, 0.5, 0.9) : 0;
      ang = -0.5 * eOut(tramo(d, 0, 0.2)) * (1 - eInOut(tramo(d, 0.5, 0.9)));
      // mira el cachito
      const kM = eInOut(tramo(d, 0.7, 1.0)) * (1 - eInOut(tramo(d, 1.45, 1.7)));
      mano = mezcla(mano, g_ ? [76, 100] : [0, 104], kM); ang = mezcla([ang, 0], [g_ ? -0.7 : -0.7, 0], kM)[0];
      if (kM > 0.5) { pose.rc = -s * 0.16; }
      if (d > 1.45 && d < 2.2) { pose.rc = s * 0.14 * eInOut(tramo(d, 1.45, 1.6)); }
      // se encogen de hombros y se lo comen
      if (d > 2.0) {
        const b = boca(pose.rc, g_ ? undefined : "rodrigo");
        const kB = eInOut(tramo(d, 2.05, 2.35)) * (1 - eInOut(tramo(d, 3.7, 3.95)));
        const angB = -2.6, angPant = g_ ? angB : Math.PI - angB;
        const punta = rot2([del, 0], angPant);
        const objetivo = [b[0] - punta[0] * 0.95, b[1] - punta[1] * 0.95];
        mano = mezcla(mano, objetivo, kB); ang = lerp(ang, angB, kB);
        if (kB > 0.6) {
          const mord = Math.sin((d - 2.35) * 16);
          pose.cara = mord > 0 ? "dormido" : "risa"; pose.rc += 0.04 * mord;
          mano = [mano[0] + 1.5 * mord, mano[1] + 1.5 * Math.abs(mord)];
          del = Math.max(8, 22 - (d - 2.35) * 6);
        }
        if (d > 3.8) { pose.cara = "risa"; const kA = eInOut(tramo(d, 3.85, 4.15)); mano = mezcla(mano, g_ ? [80, 30] : [0, 44], kA); ang = lerp(ang, -1.3, kA); pose.rc = s * 0.08 * Math.sin(t * 7); }
      }
    }
    // escudo… no: la otra mano agarra el barril
    pose.manoD = g_ ? mano : otra; pose.manoI = g_ ? otra : mano;
    const angF = g_ ? ang : Math.PI - ang, dd = del, rr = rota;
    const dibuja = (gg, m) => {
      caballo(gg, s, t, galope, cab);
      gg.save(); gg.translate(m[0], m[1]); gg.rotate(angF); barra(gg, dd, L_DET, rr); gg.restore();
    };
    if (g_) pose.objD = dibuja; else pose.objI = dibuja;
    const mat = matAv(x, PIES + bote, ESC, giro, 1, 1, [39, 232]);
    return { pose, m: mat, x };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // polvo de los cascos al galopar
    for (const q of ["g", "r"]) {
      const { x, galope } = this.pos(q);
      if (galope > 0.4 && Math.random() < 26 * dt * galope) p.nueva(P.POLVO, x + azar(-30, 30), PIES - 6, (q === "g" ? -1 : 1) * azar(60, 200), azar(-60, -10), azar(0.5, 0.9), azar(20, 40));
    }
    this.una("choque", t > T_CHOQUE, () => {
      temblar(28, 0.6);
      const q = [512, 388];
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.45, 300);
      for (let i = 0; i < 20; i++) { const a = azar(0, 6.283), v = azar(60, 260); p.nueva(P.VAPOR, q[0] + azar(-20, 20), q[1] + azar(-20, 20), Math.cos(a) * v, Math.sin(a) * v - 40, azar(0.8, 1.4), azar(40, 70)); }
      for (let i = 0; i < 70; i++) { const a = azar(-Math.PI, 0.3), v = azar(150, 620); this.migas.push({ x: q[0], y: q[1], vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: azar(0, 6), vr: azar(-12, 12), s: azar(3, 8), c: Math.random() < 0.5 ? "#f2d49a" : "#c47a2a", v: azar(1.2, 2.2) }); }
      for (const s of [-1, 1]) this.trozos.push({ x: q[0] + s * 30, y: q[1], vx: s * azar(55, 75), vy: -900, r: 0, vr: s * 11, sale: s });
    });
    for (const m of this.migas) { m.vy += 900 * dt; m.x += m.vx * dt; m.y += m.vy * dt; m.r += m.vr * dt; m.v -= dt; if (m.y > PIES) { m.y = PIES; m.vy *= -0.3; m.vx *= 0.6; m.vr *= 0.5; } }
    this.migas = this.migas.filter((m) => m.v > 0);
    for (const o of this.trozos) {
      if (o.suelo) continue;
      o.vy += 900 * dt; o.x += o.vx * dt; o.y += o.vy * dt; o.r += o.vr * dt;
      if (o.y > PIES - 8 && o.vy > 0) {
        if (Math.abs(o.vy) > 200) { o.vy *= -0.35; o.vr *= 0.4; o.vx *= 0.5; temblar(6, 0.15); for (let i = 0; i < 8; i++) p.nueva(P.POLVO, o.x, PIES - 4, azar(-120, 120), azar(-60, -10), azar(0.4, 0.8), azar(18, 30)); }
        else { o.suelo = true; o.y = PIES - 8; o.r = 0.05 * o.sale; }
      }
    }
    // migas al masticar
    for (const q of ["g", "r"]) {
      const d = t - T_CHOQUE;
      if (d > 2.4 && d < 3.7 && Math.random() < 12 * dt) {
        const e = this.pose(q), b = aPant(e.m, q === "g" ? boca(0) : boca(0, "rodrigo"));
        this.migas.push({ x: b[0], y: b[1] + 6, vx: azar(-80, 80), vy: azar(-120, 0), r: 0, vr: azar(-8, 8), s: azar(2.5, 5), c: "#f2d49a", v: 1.2 });
      }
    }
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 80, H + 80), g = c.getContext("2d");
    g.translate(40, 40);
    const gc = g.createLinearGradient(0, -40, 0, 420);
    gc.addColorStop(0, "#3aa0f0"); gc.addColorStop(1, "#cdeeff");
    g.fillStyle = gc; g.fillRect(-40, -40, W + 80, 480);
    g.fillStyle = "rgba(255,255,255,.92)";
    for (const [x, y, s] of [[140, 150, 0.8], [700, 120, 1], [900, 220, 0.6]]) {
      g.beginPath(); g.arc(x, y, 26 * s, 0, 6.283); g.arc(x + 30 * s, y - 12 * s, 32 * s, 0, 6.283); g.arc(x + 64 * s, y, 24 * s, 0, 6.283); g.rect(x, y - 4 * s, 64 * s, 24 * s); g.fill();
    }
    // colinas y castillo
    g.fillStyle = "#86c46c"; g.beginPath(); g.moveTo(-40, 420); g.quadraticCurveTo(250, 300, 560, 380); g.quadraticCurveTo(820, 320, W + 40, 400); g.lineTo(W + 40, 440); g.lineTo(-40, 440); g.closePath(); g.fill();
    const cast = (x, y, w, h) => {
      g.fillStyle = "#a8a4b4"; g.fillRect(x, y - h, w, h);
      g.fillStyle = "#8c889a"; for (let i = 0; i < w; i += 12) g.fillRect(x + i, y - h - 8, 7, 8);
    };
    cast(430, 360, 150, 50); cast(410, 360, 36, 96); cast(564, 360, 36, 96); cast(488, 360, 34, 120);
    g.fillStyle = "#5a5468"; rectR(g, 490, 330, 30, 30, 14); g.fill();
    for (const [x, y, col] of [[428, 256, "#e23a2a"], [505, 232, "#ffd34d"], [582, 256, "#2a6ae0"]]) {
      g.fillStyle = "#555"; g.fillRect(x - 1, y, 2, 20); g.fillStyle = col; g.beginPath(); g.moveTo(x + 1, y); g.lineTo(x + 18, y + 5); g.lineTo(x + 1, y + 10); g.fill();
    }
    // carpas a rayas
    const carpa = (x, w, c1, c2) => {
      const y0 = 300, y1 = 440;
      for (let i = 0; i < 6; i++) {
        g.fillStyle = i % 2 ? c1 : c2;
        g.beginPath(); g.moveTo(x, y0); g.lineTo(x - w / 2 + (w / 6) * i, y1); g.lineTo(x - w / 2 + (w / 6) * (i + 1), y1); g.closePath(); g.fill();
      }
      g.fillStyle = "#222"; g.beginPath(); g.moveTo(x, y1); g.lineTo(x - 14, y1); g.lineTo(x, y0 + 60); g.lineTo(x + 14, y1); g.closePath(); g.fill();
      g.fillStyle = "#555"; g.fillRect(x - 1.5, y0 - 30, 3, 30); g.fillStyle = c1; g.beginPath(); g.moveTo(x + 1, y0 - 30); g.lineTo(x + 24, y0 - 24); g.lineTo(x + 1, y0 - 18); g.fill();
    };
    carpa(110, 190, "#e23a2a", "#fff6e8");
    carpa(920, 190, "#2a6ae0", "#fff6e8");
    // valla del fondo y césped
    const gs = g.createLinearGradient(0, 430, 0, H + 40);
    gs.addColorStop(0, "#5aae48"); gs.addColorStop(1, "#2f7a2a");
    g.fillStyle = gs; g.fillRect(-40, 430, W + 80, H);
    g.fillStyle = "rgba(255,255,255,.06)"; for (let x = -40; x < W + 40; x += 120) g.fillRect(x, 430, 60, H);
    g.fillStyle = "#8a5a2a"; g.fillRect(-40, 420, W + 80, 7); g.fillRect(-40, 440, W + 80, 7);
    for (let x = -10; x < W + 40; x += 64) { g.fillStyle = "#6a3e18"; g.fillRect(x, 410, 9, 50); }
    this.fondoC = c;
    return c;
  }
  banderines(g, t) {
    const cols = ["#e23a2a", "#ffd34d", "#2a6ae0", "#fff6e8", "#2bb05a"];
    g.strokeStyle = "#5a3a1a"; g.lineWidth = 2;
    const y = (x) => 20 + 50 * Math.sin((x + 40) / (W + 80) * Math.PI);
    g.beginPath(); for (let x = -40; x <= W + 40; x += 16) g.lineTo(x, y(x)); g.stroke();
    for (let i = 0; i < 22; i++) {
      const x = -20 + i * 50, yy = y(x), bal = 3 * Math.sin(t * 4 + i);
      g.fillStyle = cols[i % 5];
      g.beginPath(); g.moveTo(x - 15, yy); g.lineTo(x + 15, y(x + 30) - 1); g.lineTo(x + bal, yy + 34); g.closePath(); g.fill();
    }
  }
  rastrillo(g, yb) {
    // rastrillo de hierro; yb = borde de abajo
    if (yb <= -10) return;
    g.save();
    g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(-60, -60, W + 120, yb + 60);
    const gh = g.createLinearGradient(0, 0, 14, 0);
    gh.addColorStop(0, "#1a1a20"); gh.addColorStop(0.5, "#5a5a66"); gh.addColorStop(1, "#1a1a20");
    for (let x = -14; x < W + 30; x += 64) {
      g.save(); g.translate(x, 0); g.fillStyle = gh; g.fillRect(0, -60, 14, yb + 60);
      g.fillStyle = "#2a2a32"; g.beginPath(); g.moveTo(0, yb); g.lineTo(7, yb + 26); g.lineTo(14, yb); g.closePath(); g.fill();
      g.restore();
    }
    for (let y = yb - 40; y > -80; y -= 76) { g.fillStyle = "#26262e"; g.fillRect(-60, y, W + 120, 12); g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(-60, y, W + 120, 2); }
    g.restore();
  }
  dibujar(g) {
    const t = this.t;
    fondo(g, "#000");
    g.drawImage(this.fondo(), -40, -40);
    this.banderines(g, t);
    // sombras
    const eG = this.pose("g"), eR = this.pose("r");
    g.fillStyle = "rgba(20,60,10,.35)";
    for (const e of [eG, eR]) { g.beginPath(); g.ellipse(e.x, PIES + 2, 90, 12, 0, 0, 6.283); g.fill(); }
    // trozos de pan en el suelo, detrás
    for (const o of this.trozos) if (o.suelo) { g.save(); g.translate(o.x, o.y); g.rotate(o.r); barra(g, 50, 0, true, 1.45); g.restore(); }
    pintarAvatar(g, eG.m, eG.pose, t);
    conCabeza(g, eG.m, avatar().rig, eG.pose.rc, () => olla(g));
    pintarAvatar(g, eR.m, eR.pose, t);
    conCabeza(g, eR.m, avatar("rodrigo").rig, eR.pose.rc, () => escurridor(g));
    // trozos volando
    for (const o of this.trozos) if (!o.suelo) { g.save(); g.translate(o.x, o.y); g.rotate(o.r); g.scale(o.sale, 1); barra(g, 50, 0, true, 1.45); g.restore(); }
    // migas
    for (const m of this.migas) { g.save(); g.globalAlpha = Math.min(1, m.v * 2); g.translate(m.x, m.y); g.rotate(m.r); g.fillStyle = m.c; g.fillRect(-m.s / 2, -m.s / 3, m.s, m.s * 0.66); g.restore(); }
    this.p.dibujar(g);
    // ¡CRAC!
    const d = t - T_CHOQUE;
    if (d > 0 && d < 1.0) {
      const k = eBack(tramo(d, 0, 0.14));
      g.save(); g.translate(512, 300); g.rotate(-0.12); g.scale(k, k);
      txt(g, "¡CRAC!", 0, 0, { tam: 74, peso: 400, fam: FC, color: "#fffdf5", borde: "#5a2a00", bordeAncho: 10, alfa: 1 - tramo(d, 0.75, 1.0), esp: 3 });
      g.restore();
    }
    // ¡A LA CARGA!
    if (t > T_CARGA) {
      const dd = t - T_CARGA, k = tramo(dd, 0, 0.18), s = lerp(2.5, 1, eIn(k)) * (1 + 0.025 * Math.sin(dd * 7));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 126); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // rastrillo: sube al principio y baja al final
    const yb = t < 1 ? lerp(H + 30, -40, eInOut(tramo(t, 0.15, 0.9))) : lerp(-40, H + 30, eIn(tramo(t, 8.5, 8.95)));
    this.rastrillo(g, yb);
    this.una("cierra", t > 8.95, () => temblar(14, 0.3));
    const a = Math.max(1 - tramo(t, 0, 0.15), tramo(t, 9.05, this.dur - 0.05));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00150", nombre: "Justa medieval", crear: () => new Justa() });
})();
