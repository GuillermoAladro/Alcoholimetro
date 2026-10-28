"use strict";
/*
 * 00028 · SAQUE DE TENIS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende la tele: retransmisión en directo desde una pista de tierra batida. Bota la pelota tres veces, la lanza
 * al aire y saca: la pelota sale tan rápida que atraviesa la red (le hace un agujero ardiendo), deja una estela de
 * fuego y una marca quemada en el suelo. 263 km/h. ¡ACE! La raqueta echa humo; la mira, la sopla como un pistolero,
 * la hace girar y la guarda. La tele se apaga.
 */
(() => {
const CACHE = cacheTexto();
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

const T_GOLPE = 2.85, T_RED = 2.95, T_BOTE = 3.0, T_FUERA = 3.13;
const IMPACTO = [276, 238], BOTE = [800, 527], FUERA = [1090, 360];
const RED = { F: [592, PIES + 16], B: [656, PIES - 72], hF: 150, hB: 118 }; // red vista en perspectiva
const AGUJERO = [620, 424];

/** Raqueta desde la mano en la dirección `a` (0 = abajo, π/2 = derecha, π = arriba). `calor` 0–1 (cuerdas al rojo). */
function raqueta(g, m, a, calor) {
  const d = [Math.sin(a), Math.cos(a)];
  g.save(); g.translate(m[0], m[1]); g.rotate(-a);
  g.lineCap = "round";
  g.strokeStyle = "#1b1b1f"; g.lineWidth = 5; g.beginPath(); g.moveTo(0, -5); g.lineTo(0, 16); g.stroke();
  g.strokeStyle = "#e9edf0"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 16); g.lineTo(-5, 28); g.moveTo(0, 16); g.lineTo(5, 28); g.stroke();
  // cabeza
  g.save(); g.translate(0, 44);
  g.fillStyle = calor > 0.02 ? `rgba(255,${Math.round(140 - 80 * calor)},40,${0.25 + 0.5 * calor})` : "rgba(255,255,255,.08)";
  g.beginPath(); g.ellipse(0, 0, 13, 17, 0, 0, 6.283); g.fill();
  g.save(); g.beginPath(); g.ellipse(0, 0, 13, 17, 0, 0, 6.283); g.clip();
  g.strokeStyle = calor > 0.3 ? "rgba(255,210,120,.9)" : "rgba(245,245,235,.8)"; g.lineWidth = 0.8;
  g.beginPath();
  for (let i = -12; i <= 12; i += 3.4) { g.moveTo(i, -18); g.lineTo(i, 18); }
  for (let j = -16; j <= 16; j += 3.4) { g.moveTo(-14, j); g.lineTo(14, j); }
  g.stroke(); g.restore();
  g.strokeStyle = "#d4121e"; g.lineWidth = 3.4; g.beginPath(); g.ellipse(0, 0, 13.5, 17.5, 0, 0, 6.283); g.stroke();
  g.strokeStyle = "rgba(255,255,255,.5)"; g.lineWidth = 1; g.beginPath(); g.ellipse(-1, -1, 12.5, 16.5, 0, 3.6, 5.2); g.stroke();
  g.restore();
  g.restore();
  return [m[0] + d[0] * 44, m[1] + d[1] * 44];
}
function pelota(g, x, y, r) {
  g.save(); g.translate(x, y);
  const gr = g.createRadialGradient(-r * 0.3, -r * 0.35, 1, 0, 0, r);
  gr.addColorStop(0, "#f6ff9a"); gr.addColorStop(0.6, "#d6f02a"); gr.addColorStop(1, "#8aa010");
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = r * 0.16;
  g.beginPath(); g.arc(-r * 0.9, 0, r * 0.75, -1, 1); g.stroke();
  g.beginPath(); g.arc(r * 0.9, 0, r * 0.75, Math.PI - 1, Math.PI + 1); g.stroke();
  g.restore();
}

class EscenaTenis extends Escena {
  constructor() {
    super(9.45);
    this.p = new Parts(450);
    this.ESC = 1.45; this.X = 170;
    this.trozos = [];
  }
  /** [mano D, dirección de la raqueta, mano I] */
  brazos() {
    const t = this.t;
    let mD = [82, 142], a = 0.55, mI = [10, 150];
    // botes con la izquierda
    if (t > 0.6 && t < 1.95) { mI = [12, 146 + 6 * Math.abs(Math.sin((t - 0.6) * Math.PI / 0.4))]; }
    // lanza la bola y arma la raqueta
    const kT = eInOut(tramo(t, 1.95, 2.3)), kA = eInOut(tramo(t, 2.0, 2.55));
    mI = mezcla(mI, [4, 26], kT);
    if (t > 2.45) mI = mezcla([4, 26], [10, 120], eInOut(tramo(t, 2.45, 2.9)));
    mD = mezcla(mD, [92, 80], kA); a = lerp(a, Math.PI - 0.15, kA);
    // golpe
    if (t > 2.62) { const k = eIn(tramo(t, 2.62, T_GOLPE)); mD = mezcla(mD, [96, 22], k); a = lerp(a, 2.55, k); }
    if (t > T_GOLPE) { const k = eOut(tramo(t, T_GOLPE, 3.1)); mD = mezcla([96, 22], [34, 150], k); a = lerp(2.55, -0.55, k); }
    // la mira, la levanta junto a la cara y la sopla
    if (t > 3.4) { const k = eInOut(tramo(t, 3.4, 3.8)); mD = mezcla(mD, [104, 112], k); a = lerp(a, 2.2, k); }
    if (t > 4.7) { const k = eInOut(tramo(t, 4.7, 5.05)); mD = mezcla(mD, [100, 74], k); a = lerp(a, Math.PI - 0.05, k); }
    // la hace girar y la guarda
    if (t > 6.1) { mD = mezcla(mD, [118, 128], eInOut(tramo(t, 6.1, 6.45))); a = lerp(a, Math.PI / 2, eInOut(tramo(t, 6.1, 6.45))); }
    if (t > 6.5) { const k = eInOut(tramo(t, 6.5, 7.4)); a = lerp(Math.PI / 2, 0.55 + 4 * Math.PI, k); mD = mezcla(mD, [82, 142], eInOut(tramo(t, 7.3, 7.7))); }
    return [mD, a, mI];
  }
  calor() { const t = this.t; return t < T_GOLPE ? 0 : Math.min(1, (t - T_GOLPE) * 10) * (1 - tramo(t, 5.2, 5.8)); }
  pelotaPos() {
    const t = this.t;
    if (t < 2.3) { // botes
      const e = this.estadoBase();
      const mano = aPant(e.m, [12, 158]);
      if (t < 0.6 || t > 1.8) return [mano[0], mano[1] + 6];
      const k = Math.abs(Math.sin((t - 0.6) * Math.PI / 0.4));
      return [mano[0], lerp(mano[1] + 6, PIES - 9, k)];
    }
    if (t < 2.62) { const u = tramo(t, 2.3, 2.62); return [lerp(176, 240, u), lerp(240, 92, eOut(u))]; }
    if (t < T_GOLPE) { const u = tramo(t, 2.62, T_GOLPE); return [lerp(240, IMPACTO[0], u), lerp(92, IMPACTO[1], eIn(u))]; }
    if (t < T_BOTE) { const u = tramo(t, T_GOLPE, T_BOTE); return [lerp(IMPACTO[0], BOTE[0], u), lerp(IMPACTO[1], BOTE[1], u)]; }
    const u = tramo(t, T_BOTE, T_FUERA); return [lerp(BOTE[0], FUERA[0], u), lerp(BOTE[1], FUERA[1], u)];
  }
  estadoBase() { return { m: matAv(this.X, PIES, this.ESC) }; }
  estado() {
    const t = this.t, ESC = this.ESC;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0.05], piernaD: [0, -0.05] };
    const [mD, a, mI] = this.brazos();
    let y = PIES, sy = 1, giro = 0;
    if (t > 0.6 && t < 1.95) { pose.cara = "guino"; pose.rc = -0.06; }
    if (t > 1.95 && t < T_GOLPE) { pose.cara = "sonrisa"; pose.rc = -0.12 * tramo(t, 2.0, 2.4); sy = 1 - 0.05 * Math.sin(Math.PI * tramo(t, 2.2, 2.7)); }
    if (t > 2.6 && t < 3.0) { const s = tramo(t, 2.6, 3.0); y -= 34 * Math.sin(Math.PI * s); giro = 0.06 * Math.sin(Math.PI * s); pose.cara = "guino"; }
    if (t > 3.0 && t < 4.7) { pose.cara = "sorpresa"; pose.rc = 0.14 * tramo(t, 3.4, 3.8); }
    if (t > 4.7 && t < 5.7) { pose.cara = "sorpresa"; pose.rc = 0.18; }
    if (t > 5.7) { pose.cara = t < 7.6 ? "guino" : "risa"; pose.rc = 0.06 * Math.sin(t * 3); }
    pose.manoD = mD; pose.manoI = mI;
    pose.objD2 = (g, m) => { this._cabeza = raqueta(g, m, a, this.calor()); };
    const m = matAv(this.X, y, ESC, giro, 1, sy);
    return { pose, m, a };
  }
  tele() {
    const t = this.t;
    if (t < 0.07) return { fin: true };
    if (t < 0.5) { const k = tramo(t, 0.07, 0.48); return { sx: Math.max(0.002, eOut(tramo(k, 0, 0.3))), sy: Math.max(0.004, eOut(tramo(k, 0.4, 1))), flash: 1 - tramo(k, 0.4, 1), linea: k < 0.45 }; }
    if (t > 8.55) { const k = tramo(t, 8.55, 9.25); return { sx: Math.max(0.002, 1 - eIn(tramo(k, 0.45, 1))), sy: Math.max(0.004, 1 - eIn(tramo(k, 0, 0.45))), flash: k, linea: k > 0.45, fin: k >= 1 }; }
    return { sx: 1, sy: 1, flash: 0 };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    this.una("golpe", t > T_GOLPE, () => {
      temblar(14, 0.3);
      p.nueva(P.DESTELLO, IMPACTO[0], IMPACTO[1], 0, 0, 0.3, 160);
      for (let i = 0; i < 20; i++) { const a = azar(0, 6.283), v = azar(200, 600); p.nueva(P.CHISPA, IMPACTO[0], IMPACTO[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(8, 12)); }
    });
    // la estela de fuego mientras vuela
    if (t > T_GOLPE && t < T_FUERA + 0.05) {
      const q = this.pelotaPos();
      for (let i = 0; i < 9; i++) p.nueva(P.LLAMA, q[0] + azar(-14, 14), q[1] + azar(-10, 10), azar(-160, -40), azar(-120, 20), azar(0.25, 0.6), azar(30, 60), Math.random() < 0.4 ? 1 : 0);
    }
    this.una("red", t > T_RED, () => {
      temblar(10, 0.2);
      for (let i = 0; i < 26; i++) this.trozos.push({ x: AGUJERO[0] + azar(-10, 10), y: AGUJERO[1] + azar(-10, 10), vx: azar(80, 420), vy: azar(-260, 60), r: azar(0, 6), vr: azar(-14, 14), l: azar(5, 12) });
      for (let i = 0; i < 16; i++) p.nueva(P.CHISPA, AGUJERO[0], AGUJERO[1], azar(50, 500), azar(-300, 150), azar(0.3, 0.7), azar(7, 11));
    });
    this.una("bote", t > T_BOTE, () => {
      temblar(26, 0.6);
      p.nueva(P.DESTELLO, BOTE[0], BOTE[1], 0, 0, 0.35, 180);
      for (let i = 0; i < 26; i++) p.nueva(P.POLVO, BOTE[0] + azar(-20, 20), BOTE[1], azar(-260, 300), azar(-220, -20), azar(0.6, 1.2), azar(26, 50));
      for (let i = 0; i < 20; i++) { const a = azar(-Math.PI, 0), v = azar(250, 700); p.nueva(P.CHISPA, BOTE[0], BOTE[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(8, 13)); }
    });
    for (const q of this.trozos) { q.vy += 900 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.r += q.vr * dt; }
    this.trozos = this.trozos.filter((q) => q.y < PIES + 30);
    // humo: la marca del bote, el agujero de la red y la raqueta
    if (t > T_BOTE && t < 7.5 && Math.random() < 10 * dt) p.nueva(P.HUMO, BOTE[0] + azar(-20, 20), BOTE[1] - 6, azar(-10, 10), azar(-60, -30), azar(1.2, 2), azar(24, 40));
    if (t > T_RED && t < 7 && Math.random() < 6 * dt) p.nueva(P.VAPOR, AGUJERO[0], AGUJERO[1] - 10, azar(-10, 10), azar(-50, -25), azar(0.8, 1.4), azar(14, 24));
    const cal = this.calor();
    if (cal > 0.05 && this._cabeza && Math.random() < 30 * dt * cal) {
      const q = aPant(e.m, this._cabeza);
      p.nueva(P.VAPOR, q[0] + azar(-14, 14), q[1] + azar(-14, 14), azar(-15, 15), azar(-90, -50), azar(0.8, 1.3), azar(14, 26));
      if (cal > 0.5 && Math.random() < 0.5) p.nueva(P.LLAMA, q[0] + azar(-12, 12), q[1] + azar(-12, 12), 0, azar(-90, -40), azar(0.2, 0.35), azar(14, 24));
    }
    // el soplido se lleva el humo
    if (t > 5.1 && t < 5.7 && Math.random() < 40 * dt) {
      const q = aPant(e.m, boca(0.18));
      p.nueva(P.VAPOR, q[0] + 10, q[1] - 4, azar(140, 260), azar(-60, 0), azar(0.4, 0.8), azar(10, 18));
    }
    this.una("ace", t > 3.25, () => temblar(16, 0.35));
    p.actualizar(dt);
  }
  pista(g, t) {
    // pared del fondo (lona verde) y gradas oscuras
    g.fillStyle = "#06090a"; g.fillRect(-60, -60, W + 120, 340);
    g.fillStyle = "#0f3a26"; g.fillRect(-60, 280, W + 120, 172);
    g.fillStyle = "#0a2a1b"; g.fillRect(-60, 440, W + 120, 12);
    txt(g, "TORNEO DEL BAR", W / 2 - 150, 330, { tam: 26, peso: 900, fam: FD, color: "rgba(255,253,245,.75)", esp: 6 });
    // radar de velocidad
    const v = t > T_FUERA ? 263 : 0;
    g.fillStyle = "#050607"; rectR(g, 780, 300, 190, 70, 8); g.fill();
    g.strokeStyle = "#2a3a30"; g.lineWidth = 3; g.stroke();
    txt(g, "VELOCIDAD", 875, 318, { tam: 12, peso: 800, color: "rgba(255,253,245,.6)", esp: 3 });
    if (v) {
      const parp = t < 4.2 ? (Math.sin(t * 22) > -0.3 ? 1 : 0.3) : 1;
      ponCartel(g, cartel("vel", "263 km/h", { tam: 34, peso: 900, fam: FD, color: "#2bff5b", glow: "rgba(43,255,91,.8)", glowTam: 10, esp: 2 }), 875, 346, 1, parp);
    } else txt(g, "--- km/h", 875, 356, { tam: 34, peso: 900, fam: FD, color: "rgba(43,255,91,.25)", esp: 2 });
    // tierra batida
    const gr = g.createLinearGradient(0, 452, 0, H);
    gr.addColorStop(0, "#8a3a1a"); gr.addColorStop(1, "#d0612e");
    g.fillStyle = gr; g.fillRect(-60, 452, W + 120, H);
    g.fillStyle = "rgba(255,255,255,.04)";
    for (let i = 0; i < 9; i++) g.fillRect(-60 + i * 130, 452, 60, H);
    // líneas
    g.strokeStyle = "rgba(255,253,245,.9)"; g.lineWidth = 4; g.lineCap = "butt";
    const linea = (x1, y1, x2, y2) => { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); };
    linea(-60, 470, W + 60, 470); linea(-60, 586, W + 60, 586);
    const dx = (RED.B[0] - RED.F[0]) / (RED.F[1] - RED.B[1]); // inclinación de las líneas transversales
    for (const x0 of [96, 892]) linea(x0, 586, x0 + dx * 116, 470);
    linea(320 + 0, 586, 320 + dx * 116, 470);
    linea(320 + dx * 58, 528, 600 + dx * 58, 528); linea(640 + dx * 58, 528, 892 + dx * 58, 528);
    // marca quemada del bote
    if (t > T_BOTE) {
      const k = 1 - tramo(t, 7.5, 8.5) * 0.5;
      g.save(); g.globalAlpha = k;
      const gq = g.createRadialGradient(BOTE[0], BOTE[1], 2, BOTE[0], BOTE[1], 46);
      gq.addColorStop(0, "#050302"); gq.addColorStop(0.6, "rgba(30,12,4,.8)"); gq.addColorStop(1, "rgba(30,12,4,0)");
      g.fillStyle = gq; g.beginPath(); g.ellipse(BOTE[0], BOTE[1], 52, 13, 0, 0, 6.283); g.fill();
      if (t < 6) { g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.7 * (1 - tramo(t, 3.2, 6)); g.drawImage(BLOB.naranja, BOTE[0] - 40, BOTE[1] - 12, 80, 24); }
      g.restore();
    }
  }
  red(g, t) {
    const { F, B, hF, hB } = RED;
    const top = (k) => [lerp(F[0], B[0], k), lerp(F[1] - hF, B[1] - hB, k)];
    const bot = (k) => [lerp(F[0], B[0], k), lerp(F[1], B[1], k)];
    g.save();
    // malla (con agujero si ya ha pasado la pelota)
    g.beginPath(); g.rect(-60, -60, W + 120, H + 120);
    if (t > T_RED) { g.moveTo(AGUJERO[0] + 20, AGUJERO[1]); g.ellipse(AGUJERO[0], AGUJERO[1], 20, 26, 0, 0, 6.283); }
    g.clip("evenodd");
    g.strokeStyle = "rgba(20,20,22,.85)"; g.lineWidth = 1.4; g.beginPath();
    for (let i = 0; i <= 16; i++) { const k = i / 16, a = top(k), b = bot(k); g.moveTo(a[0], a[1] + 6); g.lineTo(b[0], b[1]); }
    for (let j = 0; j <= 14; j++) { const k = j / 14; g.moveTo(lerp(F[0], F[0], 0), lerp(F[1] - hF + 6, F[1], k)); g.lineTo(B[0], lerp(B[1] - hB + 6, B[1], k)); }
    g.stroke();
    g.restore();
    // cinta blanca de arriba
    g.strokeStyle = "#fffdf5"; g.lineWidth = 6; g.beginPath(); const a = top(0), b = top(1); g.moveTo(a[0], a[1] + 3); g.lineTo(b[0], b[1] + 3); g.stroke();
    // borde del agujero ardiendo
    if (t > T_RED) {
      const k = 1 - tramo(t, T_RED, 6.5);
      g.save(); g.globalCompositeOperation = "lighter";
      g.strokeStyle = `rgba(255,${Math.round(120 + 100 * k)},40,${0.3 + 0.6 * k})`; g.lineWidth = 3 + 2 * Math.sin(t * 20);
      g.beginPath(); g.ellipse(AGUJERO[0], AGUJERO[1], 20, 26, 0, 0, 6.283); g.stroke();
      g.restore();
    }
    // postes
    g.fillStyle = "#1d3a2a";
    g.fillRect(F[0] - 4, F[1] - hF - 6, 8, hF + 6); g.fillRect(B[0] - 3, B[1] - hB - 5, 6, hB + 5);
  }
  escena(g, t, e) {
    this.pista(g, t);
    this.red(g, t);
    // trocitos de red que salen volando
    g.strokeStyle = "rgba(30,30,30,.9)"; g.lineWidth = 1.6;
    for (const q of this.trozos) { g.save(); g.translate(q.x, q.y); g.rotate(q.r); g.beginPath(); g.moveTo(-q.l / 2, 0); g.lineTo(q.l / 2, 0); g.moveTo(0, -q.l / 2); g.lineTo(0, q.l / 2); g.stroke(); g.restore(); }
    // estela de fuego (línea que se apaga)
    if (t > T_GOLPE && t < 4.6) {
      const q = this.pelotaPos(), k = 1 - tramo(t, T_FUERA, 4.6);
      g.save(); g.globalCompositeOperation = "lighter"; g.lineCap = "round"; g.lineJoin = "round";
      const pts = [IMPACTO, t > T_BOTE ? BOTE : q, ...(t > T_BOTE ? [q] : [])];
      for (const [w, col] of [[26, `rgba(255,90,20,${0.35 * k})`], [12, `rgba(255,190,60,${0.7 * k})`], [4, `rgba(255,250,220,${0.9 * k})`]]) {
        g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach((pp, i) => (i ? g.lineTo(pp[0], pp[1]) : g.moveTo(pp[0], pp[1]))); g.stroke();
      }
      g.restore();
    }
    g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(this.X, PIES - 1, 64, 9, 0, 0, 6.283); g.fill();
    pintarAvatar(g, e.m, e.pose, t);
    // pelota
    if (t < T_FUERA) { const q = this.pelotaPos(); pelota(g, q[0], q[1], t > T_GOLPE ? 13 : 11); }
    this.p.dibujar(g);
    // ¡ACE!
    if (t > 3.25) {
      const k = tramo(t, 3.25, 3.42);
      const c = cartel("ace", "¡ACE!", {
        tam: 180, peso: 400, fam: FC, borde: "#2a0800", bordeAncho: 14, esp: 6, glow: "rgba(255,110,20,.85)", glowTam: 28,
        color: (gg, cv) => { const gr = gg.createLinearGradient(0, cv.height * 0.2, 0, cv.height * 0.8); gr.addColorStop(0, "#fff8c8"); gr.addColorStop(0.5, "#ffb21a"); gr.addColorStop(1, "#ff3a10"); return gr; },
      });
      ponCartel(g, c, 610, 170, lerp(2.8, 1, eIn(k)) * (1 + 0.03 * Math.sin(t * 10)), Math.min(1, k * 3), -0.07);
    }
    // rótulo de la tele
    g.save();
    g.fillStyle = "rgba(10,12,16,.85)"; rectR(g, 24, 22, 300, 64, 8); g.fill();
    g.fillStyle = "#e3262f"; g.beginPath(); g.arc(44, 40, 6, 0, 6.283); g.globalAlpha = Math.sin(t * 5) > -0.2 ? 1 : 0.3; g.fill(); g.globalAlpha = 1;
    txt(g, "EN DIRECTO", 58, 46, { tam: 15, peso: 800, color: "#fffdf5", alin: "left", esp: 3 });
    const juego = t > 3.6;
    txt(g, "GUILLERMO", 40, 74, { tam: 17, peso: 800, color: "#ffd34d", alin: "left", esp: 1 });
    txt(g, juego ? "JUEGO" : "40 · 30", 304, 74, { tam: 19, peso: 900, fam: FD, color: juego ? "#2bff5b" : "#fffdf5", alin: "right", esp: 2 });
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), tv = this.tele();
    fondo(g, "#000");
    if (tv.fin) return;
    g.save();
    g.translate(W / 2, H / 2); g.scale(tv.sx, tv.sy); g.translate(-W / 2, -H / 2);
    if (tv.sy < 1 || tv.sx < 1) { g.beginPath(); g.rect(0, 0, W, H); g.clip(); }
    this.escena(g, t, e);
    if (tv.flash > 0) { g.fillStyle = `rgba(235,245,255,${Math.min(1, tv.flash)})`; g.fillRect(-60, -60, W + 120, H + 120); }
    g.restore();
    // línea / punto de la tele encendiéndose y apagándose
    if (tv.linea) {
      g.save(); g.globalCompositeOperation = "lighter";
      const w = W * tv.sx;
      g.fillStyle = "rgba(235,245,255,.95)"; g.fillRect(W / 2 - w / 2, H / 2 - 2, w, 4);
      g.drawImage(BLOB.blanco, W / 2 - Math.max(40, w * 0.6), H / 2 - 30, Math.max(80, w * 1.2), 60);
      g.restore();
    }
  }
}

registrar({ id: "00028", nombre: "Saque de tenis", crear: () => new EscenaTenis() });
})();
