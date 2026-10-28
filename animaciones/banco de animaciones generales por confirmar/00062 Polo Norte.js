"use strict";
/*
 * 00062 · POLO NORTE
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende una aurora boreal sobre un iglú y cae la nieve. Guillermo, con gorro y bufanda, tiritando, tiene una
 * cerveza congelada dentro de un bloque de hielo: le echa el aliento, se agrieta y revienta. Cuando la admira,
 * un pingüino entra deslizándose, salta, se la roba con el pico y se mete en el iglú. Él corre detrás, resbala y
 * cae de espaldas. El pingüino se asoma, se la bebe tan a gusto y brinda: ¡OYE! Se despide y la aurora se apaga.
 */
(() => {
const cache = cacheTexto();
const SUELO_IGLU = 522, PUERTA = [292, 522];

/** Pingüino; (cx, cy) = centro del cuerpo. o: { ang, esc, felices, aleta (0–1 saluda), lata: 'pico' | 'bebe' | null, beber (0–1) } */
function pinguino(g, cx, cy, o, t) {
  const esc = o.esc || 1;
  g.save(); g.translate(cx, cy); g.rotate(o.ang || 0); g.scale(esc, esc);
  // patas
  g.fillStyle = "#ff9d1c";
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 13, 50, 13, 6, 0, 0, 6.283); g.fill(); }
  // aletas
  for (const s of [-1, 1]) {
    const arriba = s > 0 ? Math.max(o.aleta || 0, (o.brinda || 0) * 0.55) : 0;
    g.save(); g.translate(s * 30, -16); g.rotate(s * (0.35 + 2.2 * arriba + (arriba ? 0.3 * Math.sin(t * 18) : 0)));
    g.fillStyle = "#151a24"; g.beginPath(); g.ellipse(s * 4, 22, 9, 26, -s * 0.15, 0, 6.283); g.fill();
    g.restore();
  }
  // cuerpo
  const gc = g.createRadialGradient(-12, -30, 6, 0, 0, 62);
  gc.addColorStop(0, "#3d4556"); gc.addColorStop(1, "#0b0e15");
  g.fillStyle = gc; g.beginPath(); g.ellipse(0, 0, 35, 52, 0, 0, 6.283); g.fill();
  const gb = g.createLinearGradient(-20, 0, 20, 0);
  gb.addColorStop(0, "#d6e2ec"); gb.addColorStop(0.45, "#ffffff"); gb.addColorStop(1, "#c9d6e2");
  g.fillStyle = gb; g.beginPath(); g.ellipse(0, 10, 25, 38, 0, 0, 6.283); g.fill();
  // cara
  g.fillStyle = "#ffffff";
  g.beginPath(); g.ellipse(-11, -30, 9, 10, 0, 0, 6.283); g.ellipse(11, -30, 9, 10, 0, 0, 6.283); g.fill();
  if (o.felices) {
    g.strokeStyle = "#111"; g.lineWidth = 2.6; g.lineCap = "round";
    g.beginPath(); g.arc(-11, -28, 5, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
    g.beginPath(); g.arc(11, -28, 5, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
  } else {
    g.fillStyle = "#111"; g.beginPath(); g.arc(-9, -29, 4.6, 0, 6.283); g.arc(13, -29, 4.6, 0, 6.283); g.fill();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(-7.5, -31, 1.6, 0, 6.283); g.arc(14.5, -31, 1.6, 0, 6.283); g.fill();
  }
  g.fillStyle = "rgba(255,120,150,.45)"; g.beginPath(); g.ellipse(-20, -18, 5, 3, 0, 0, 6.283); g.ellipse(20, -18, 5, 3, 0, 0, 6.283); g.fill();
  // pico (con la lata atravesada)
  if (o.lata === "pico") lataSuelta(g, 2, -12, Math.PI / 2 + 0.1, 1.25);
  g.fillStyle = "#ff9d1c";
  g.beginPath(); g.moveTo(-9, -20); g.quadraticCurveTo(0, -24, 9, -20); g.lineTo(0, -6); g.closePath(); g.fill();
  g.fillStyle = "#e07400"; g.beginPath(); g.moveTo(-6, -15); g.lineTo(6, -15); g.lineTo(0, -6); g.closePath(); g.fill();
  if (o.lata === "bebe") {
    const k = o.beber || 0, b = o.brinda || 0;
    lataSuelta(g, lerp(lerp(28, 8, k), 46, b), lerp(lerp(4, -26, k), -46, b), lerp(lerp(-0.2, -2.3, k), 0.35, b), 1.25);
    if (b > 0.5) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = (b - 0.5) * 2; g.drawImage(BLOB.blanco, 30, -76, 34, 34); g.restore(); }
  }
  g.restore();
}

/** Gorro de lana con pompón; (0, 0) = cuello. */
function gorro(g, rc) {
  g.save(); g.translate(RIG.cuello[0], RIG.cuello[1]); g.rotate(rc);
  g.save();
  g.beginPath(); g.moveTo(-33, -52); g.bezierCurveTo(-36, -96, 36, -96, 33, -52); g.closePath(); g.clip();
  const gr = g.createLinearGradient(-33, 0, 33, 0); gr.addColorStop(0, "#8f1320"); gr.addColorStop(0.45, "#e2384a"); gr.addColorStop(1, "#7a0f1b");
  g.fillStyle = gr; g.fillRect(-40, -100, 80, 50);
  g.fillStyle = "rgba(255,250,240,.92)"; g.fillRect(-40, -78, 80, 7); g.fillRect(-40, -66, 80, 4);
  g.restore();
  // vuelta de punto
  const gv = g.createLinearGradient(0, -60, 0, -46); gv.addColorStop(0, "#ffffff"); gv.addColorStop(1, "#c9cfd6");
  g.fillStyle = gv; rectR(g, -35, -60, 70, 13, 6); g.fill();
  g.strokeStyle = "rgba(120,130,140,.5)"; g.lineWidth = 0.8;
  g.beginPath(); for (let x = -31; x <= 31; x += 4) { g.moveTo(x, -58); g.lineTo(x, -49); } g.stroke();
  // pompón
  g.fillStyle = "#fffaf3"; g.beginPath(); g.arc(0, -90, 9, 0, 6.283); g.fill();
  g.fillStyle = "rgba(170,180,190,.6)"; g.beginPath(); g.arc(3, -87, 5, 0, 6.283); g.fill();
  g.restore();
}

/** Bufanda alrededor del cuello con una punta colgando. */
function bufanda(g, t) {
  const gr = g.createLinearGradient(0, 70, 0, 86); gr.addColorStop(0, "#e2384a"); gr.addColorStop(1, "#8f1320");
  g.fillStyle = gr; rectR(g, 19, 70, 40, 14, 7); g.fill();
  g.save(); g.translate(49, 80); g.rotate(-0.08 + 0.05 * Math.sin(t * 3));
  g.fillStyle = "#c62a3b"; rectR(g, -5, 0, 11, 40, 3); g.fill();
  g.fillStyle = "rgba(255,250,240,.9)"; g.fillRect(-5, 14, 11, 4); g.fillRect(-5, 24, 11, 4);
  g.strokeStyle = "#c62a3b"; g.lineWidth = 1.2; g.beginPath(); for (let x = -4; x <= 5; x += 2.2) { g.moveTo(x, 40); g.lineTo(x, 45); } g.stroke();
  g.restore();
  g.fillStyle = "rgba(255,250,240,.9)"; g.fillRect(24, 74, 30, 3);
}

/** Bloque de hielo con la lata dentro; grietas k (0–1). */
function bloque(g, k, t) {
  const x0 = 17, y0 = 110, w = 46, h = 40;
  dibujarLata(g, 40, 131, 0.12, { esc: 1.2 });
  g.save();
  // caras del cubo
  g.fillStyle = "rgba(200,240,255,.55)"; rectR(g, x0, y0, w, h, 4); g.fill();
  g.fillStyle = "rgba(235,252,255,.75)";
  g.beginPath(); g.moveTo(x0 + 2, y0); g.lineTo(x0 + 9, y0 - 8); g.lineTo(x0 + w + 7, y0 - 8); g.lineTo(x0 + w, y0); g.closePath(); g.fill();
  g.fillStyle = "rgba(140,200,235,.6)";
  g.beginPath(); g.moveTo(x0 + w, y0); g.lineTo(x0 + w + 7, y0 - 8); g.lineTo(x0 + w + 7, y0 + h - 8); g.lineTo(x0 + w, y0 + h); g.closePath(); g.fill();
  g.strokeStyle = "rgba(255,255,255,.95)"; g.lineWidth = 1.3; rectR(g, x0, y0, w, h, 4); g.stroke();
  g.fillStyle = "rgba(255,255,255,.7)"; g.fillRect(x0 + 5, y0 + 5, 3, h - 12); g.fillRect(x0 + 11, y0 + 5, 1.5, 10);
  // grietas
  if (k > 0) {
    g.strokeStyle = "rgba(255,255,255,.95)"; g.lineWidth = 1.2; g.lineJoin = "round";
    const gs = [[[40, 110], [36, 120], [42, 128], [37, 138]], [[63, 122], [54, 126], [57, 134], [47, 141]], [[17, 136], [27, 132], [24, 142], [33, 149]]];
    gs.forEach((pts, i) => {
      const kk = clamp(k * 3 - i, 0, 1);
      if (kk <= 0) return;
      g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
      for (let j = 1; j < pts.length; j++) { const u = clamp(kk * 3 - (j - 1), 0, 1); g.lineTo(lerp(pts[j - 1][0], pts[j][0], u), lerp(pts[j - 1][1], pts[j][1], u)); if (u < 1) break; }
      g.stroke();
    });
  }
  g.restore();
}

class EscenaPoloNorte extends Escena {
  constructor() {
    super(9.8);
    this.p = new Parts(260);
    this.X = 640; this.ESC = 1.45;
    this.fondoC = this.pintarFondo();
    this.aurora = this.pintarAurora();
    const r = semilla(3);
    this.copos = []; for (let i = 0; i < 130; i++) this.copos.push({ x: r() * W, y: r() * H, v: 30 + r() * 50, s: 1.5 + r() * 3, f: r() * 6 });
    this.esquirlas = [];
  }
  pintarFondo() {
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    const gc = g.createLinearGradient(0, 0, 0, 470);
    gc.addColorStop(0, "#030a1c"); gc.addColorStop(1, "#173c66");
    g.fillStyle = gc; g.fillRect(0, 0, W, H);
    const r = semilla(11);
    for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.6})`; g.fillRect(r() * W, r() * 380, 1.6, 1.6); }
    // montañas heladas al fondo
    g.fillStyle = "#2a5683";
    g.beginPath(); g.moveTo(0, 470); for (const [x, y] of [[80, 380], [190, 430], [330, 350], [470, 440], [600, 370], [760, 430], [880, 360], [1024, 420]]) g.lineTo(x, y); g.lineTo(W, 470); g.closePath(); g.fill();
    g.fillStyle = "rgba(220,240,255,.55)";
    for (const [x, y] of [[80, 380], [330, 350], [600, 370], [880, 360]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x - 26, y + 26); g.lineTo(x + 26, y + 26); g.closePath(); g.fill(); }
    // nieve
    const gs = g.createLinearGradient(0, 455, 0, H);
    gs.addColorStop(0, "#cfe6f7"); gs.addColorStop(1, "#8fb4d4");
    g.fillStyle = gs;
    g.beginPath(); g.moveTo(0, 470); g.quadraticCurveTo(260, 440, 520, 466); g.quadraticCurveTo(780, 490, W, 456); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
    // placa de hielo donde patina el pingüino
    const gh = g.createLinearGradient(0, 535, 0, H);
    gh.addColorStop(0, "rgba(170,225,255,.0)"); gh.addColorStop(0.3, "rgba(170,225,255,.45)"); gh.addColorStop(1, "rgba(120,190,240,.6)");
    g.fillStyle = gh; g.fillRect(0, 535, W, H - 535);
    g.strokeStyle = "rgba(255,255,255,.5)"; g.lineWidth = 2;
    for (const [x, y, l] of [[120, 572, 70], [700, 590, 90], [880, 560, 50], [420, 596, 60]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y); g.stroke(); }
    // iglú
    const cx = 180, R = 150;
    const gi = g.createRadialGradient(cx - 50, SUELO_IGLU - 110, 20, cx, SUELO_IGLU, R + 30);
    gi.addColorStop(0, "#ffffff"); gi.addColorStop(1, "#9cc0de");
    g.fillStyle = gi; g.beginPath(); g.ellipse(cx, SUELO_IGLU, R, 130, 0, Math.PI, 0); g.closePath(); g.fill();
    g.save(); g.beginPath(); g.ellipse(cx, SUELO_IGLU, R, 130, 0, Math.PI, 0); g.closePath(); g.clip();
    g.strokeStyle = "rgba(110,150,190,.55)"; g.lineWidth = 2;
    for (let i = 1; i < 6; i++) {
      const y = SUELO_IGLU - i * 24; g.beginPath(); g.moveTo(cx - R, y); g.lineTo(cx + R, y); g.stroke();
      for (let x = cx - R + (i % 2) * 22; x < cx + R; x += 44) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 24); g.stroke(); }
    }
    g.restore();
    // túnel de la puerta
    const [px, py] = PUERTA;
    g.fillStyle = "#e9f4fc"; g.beginPath(); g.ellipse(px, py, 62, 66, 0, Math.PI, 0); g.closePath(); g.fill();
    g.strokeStyle = "rgba(110,150,190,.55)"; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#0b1626"; g.beginPath(); g.ellipse(px, py, 40, 48, 0, Math.PI, 0); g.closePath(); g.fill();
    g.fillStyle = "rgba(90,130,170,.35)"; g.beginPath(); g.ellipse(cx + 10, SUELO_IGLU + 6, R + 30, 12, 0, 0, 6.283); g.fill();
    return c;
  }
  pintarAurora() {
    const c = lienzoNuevo(W + 200, 340), g = c.getContext("2d");
    for (const [y0, amp, fase, col, alto] of [[150, 40, 0, "43,255,91", 120], [200, 30, 2, "47,227,232", 100], [120, 50, 4, "150,120,255", 80]]) {
      for (let x = 0; x < c.width; x += 3) {
        const y = y0 + amp * Math.sin(x * 0.008 + fase) + 14 * Math.sin(x * 0.031 + fase * 2);
        const a = 0.18 + 0.12 * Math.sin(x * 0.05 + fase);
        const gr = g.createLinearGradient(0, y - alto, 0, y);
        gr.addColorStop(0, `rgba(${col},0)`); gr.addColorStop(0.75, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`);
        g.fillStyle = gr; g.fillRect(x, y - alto, 3, alto);
      }
    }
    return c;
  }
  luz() { return eOut(tramo(this.t, 0.05, 0.8)) * (1 - tramo(this.t, 8.3, 9.2)); }
  /** Dónde está el pingüino. */
  pingu() {
    const t = this.t;
    if (t < 2.5) return null;
    const suelo = 560;
    if (t < 2.95) return { x: lerp(1130, 770, tramo(t, 2.5, 2.95)), y: suelo - 34, ang: -Math.PI / 2, lata: null };
    if (t < 3.1) { const u = eOut(tramo(t, 2.95, 3.1)); return { x: lerp(770, this.LATA[0] + 4, u), y: lerp(suelo - 34, this.LATA[1] + 26, u), ang: lerp(-Math.PI / 2, -0.9, u), lata: null }; }
    if (t < 3.42) { const u = tramo(t, 3.1, 3.42); return { x: lerp(this.LATA[0] + 4, 470, u), y: lerp(this.LATA[1] + 26, suelo - 34, u * u) - 40 * Math.sin(u * Math.PI) * 0.6, ang: lerp(-0.9, -Math.PI / 2, u), lata: "pico" }; }
    if (t < 3.95) { const u = tramo(t, 3.42, 3.95); return { x: lerp(470, PUERTA[0] + 10, u), y: lerp(suelo - 34, PUERTA[1] - 22, u), ang: -Math.PI / 2, lata: "pico", esc: lerp(1, 0.75, u), dentro: u > 0.75 }; }
    if (t < 5.0) return null;
    // se asoma por la puerta, se la bebe y brinda
    const sale = eOut(tramo(t, 5.0, 5.4)) * (1 - eInOut(tramo(t, 7.9, 8.3)));
    const esc = 1.1 * lerp(0.75, 1, sale);
    const o = { x: PUERTA[0] + 4, y: PUERTA[1] + 4 - 10 * (1 - sale) - 56 * esc, ang: 0, esc, lata: "bebe", alfa: sale };
    const kB = eInOut(tramo(t, 5.6, 5.9)) * (1 - eInOut(tramo(t, 6.5, 6.8)));
    o.beber = kB; o.ang = -0.3 * kB;
    o.felices = (t > 5.7 && t < 6.6) || (t > 6.9 && t < 7.4);
    if (t > 6.8 && t < 7.9) o.brinda = eBack(tramo(t, 6.8, 7.05)) * (1 - eInOut(tramo(t, 7.35, 7.6))); // brinda hacia él
    o.aleta = t > 7.4 ? tramo(t, 7.4, 7.55) : 0;
    return o;
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let manoD = [61, 150], manoI = [19, 150], x = this.X, y = PIES, giro = 0, piv = [39, 232], sx = 1, sy = 1;
    const tirita = t < 4.1 ? 1 : 0;
    pose.rc = tirita * 0.03 * Math.sin(t * 47);
    let bloqueK = -1, lata = false;
    // le echa el aliento al bloque
    if (t < 2.15) {
      bloqueK = tramo(t, 1.1, 2.05);
      if ((t > 0.9 && t < 1.2) || (t > 1.3 && t < 1.6) || (t > 1.7 && t < 2.0)) { pose.cara = "sorpresa"; pose.rc = 0.12; }
      const bote = t > 1.1 ? Math.sin(t * 30) * 0.6 * tramo(t, 1.1, 2.1) : 0;
      manoD = [61 + bote, 150]; manoI = [19 - bote, 150];
    } else {
      lata = t < 3.1;
      manoI = mezcla([19, 150], [9, 160], eOut(tramo(t, 2.15, 2.5)));
      const kAd = eBack(tramo(t, 2.2, 2.55));
      manoD = mezcla([61, 150], [100, 92], kAd);
      if (t > 2.15) pose.cara = "risa";
      if (t > 2.55 && t < 3.1) pose.rc = 0.14 + tirita * 0.03 * Math.sin(t * 47);
      if (t >= 3.1) { pose.cara = "sorpresa"; pose.rc = lerp(0.14, -0.22, eInOut(tramo(t, 3.2, 3.5))); }
      if (t > 3.55) { manoD = mezcla([100, 92], [70, 158], eInOut(tramo(t, 3.55, 3.8))); }
    }
    // corre detrás, resbala y cae de espaldas
    if (t > 3.8 && t < 4.25) {
      const a = andar((t - 3.8) * 18, 1.1); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; y += a.bote;
      x = lerp(this.X, 560, tramo(t, 3.8, 4.25));
      manoI = [-12, 120 + 8 * Math.sin(t * 18)]; manoD = [92, 120 - 8 * Math.sin(t * 18)];
      pose.cara = "sorpresa";
    }
    if (t >= 4.25) {
      const u = tramo(t, 4.25, 4.62), k = eIn(u);
      pose.cara = t < 4.62 ? "sorpresa" : t < 6.3 ? "borracho" : t < 7.6 ? "sorpresa" : "dormido";
      // los pies se van hacia delante (izquierda) y cae hacia atrás
      piv = [39, 116];
      const yIni = PIES - 116 * this.ESC, yFin = PIES - 36 * this.ESC;
      x = 560 - 40 * u; y = lerp(yIni, yFin, k) - 70 * Math.sin(u * Math.PI);
      giro = lerp(0, Math.PI / 2, eOut(u));
      pose.piernaI = [0, 0.3 * Math.sin(u * Math.PI)]; pose.piernaD = [0, 0.3 * Math.sin(u * Math.PI)];
      manoI = [-30, 130]; manoD = [104, 130];
      if (t > 4.62) { manoI = [14, 158]; manoD = [64, 154]; sy = 1 - 0.06 * Math.max(0, 1 - (t - 4.62) * 6); }
      // levanta el puño: ¡OYE!
      if (t > 6.2) { const kP = eBack(tramo(t, 6.2, 6.4)) * (1 - eInOut(tramo(t, 7.6, 7.9))); manoI = mezcla([14, 158], [-58, 92 + 6 * Math.sin(t * 20)], kP); pose.rc = -0.25 * kP; }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    pose.objD = (g, m) => {
      bufanda(g, t);
      if (bloqueK >= 0) bloque(g, bloqueK, t);
    };
    if (lata) pose.objD2 = (g, m) => dibujarLata(g, m[0], m[1] - 3, 0.1, { esc: 1.1 });
    const m = matAv(x, y, this.ESC, giro, sx, sy, piv);
    return { pose, m, bloqueK };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    if (!this.LATA) this.LATA = aPant(matAv(this.X, PIES, this.ESC), [100, 89]);
    for (const c of this.copos) { c.y += c.v * dt; c.x += Math.sin(t * 1.3 + c.f) * 14 * dt - 8 * dt; if (c.y > H + 5) { c.y = -5; c.x = Math.random() * W; } if (c.x < -5) c.x = W + 5; }
    // aliento
    for (const [a, b] of [[0.9, 1.2], [1.3, 1.6], [1.7, 2.0]]) {
      if (t > a && t < b && Math.random() < 35 * dt) { const q = aPant(e.m, boca(e.pose.rc)); p.nueva(P.VAPOR, q[0], q[1] + 6, azar(-20, 20), azar(30, 90), azar(0.5, 0.8), azar(14, 22)); }
    }
    for (const [i, tc] of [[0, 1.42], [1, 1.75], [2, 2.02]]) this.una("grieta" + i, t > tc, () => temblar(3 + i * 2, 0.12));
    this.una("revienta", t > 2.15, () => {
      temblar(12, 0.35);
      const q = aPant(e.m, [40, 130]);
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.3, 160);
      for (let i = 0; i < 22; i++) { const a = azar(0, 6.283), v = azar(200, 600); this.esquirlas.push({ x: q[0], y: q[1], vx: Math.cos(a) * v, vy: Math.sin(a) * v - 200, r: azar(0, 6), vr: azar(-14, 14), s: azar(6, 16) }); }
      for (let i = 0; i < 12; i++) p.nueva(P.VAPOR, q[0] + azar(-30, 30), q[1] + azar(-30, 30), azar(-80, 80), azar(-80, 20), azar(0.4, 0.8), azar(16, 28));
    });
    this.una("ting", t > 2.5, () => { const q = aPant(e.m, [100, 80]); p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.35, 70); });
    for (const s of this.esquirlas) { s.vy += 1400 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.r += s.vr * dt; if (s.y > 575) { s.y = 575; s.vy *= -0.3; s.vx *= 0.6; s.vr *= 0.5; } }
    // el pingüino: estela de nieve
    const pg = this.pingu();
    if (pg && t < 3.95 && (t < 2.95 || t > 3.42) && Math.random() < 40 * dt) p.nueva(P.VAPOR, pg.x + 30, 562, azar(40, 160), azar(-60, -10), azar(0.4, 0.7), azar(12, 22));
    this.una("roba", t > 3.1, () => { temblar(6, 0.2); const q = this.LATA; for (let i = 0; i < 10; i++) p.nueva(P.CHISPA, q[0], q[1], azar(-200, 200), azar(-300, 0), azar(0.2, 0.5), azar(6, 10)); });
    // cae de espaldas
    this.una("cae", t > 4.62, () => {
      temblar(16, 0.4);
      for (let i = 0; i < 26; i++) p.nueva(P.VAPOR, azar(380, 720), 568, azar(-240, 240), azar(-160, -20), azar(0.6, 1.1), azar(20, 36));
    });
    this.una("pssht", t > 5.45, () => { for (let i = 0; i < 14; i++) p.nueva(P.ESPUMA, PUERTA[0] + 30, PUERTA[1] - 60, azar(-60, 90), azar(-260, -80), azar(0.4, 0.7), azar(3, 6)); });
    this.una("oye", t > 6.25, () => temblar(18, 0.5));
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), L = this.luz();
    fondo(g, "#000");
    g.drawImage(this.fondoC, 0, 0);
    // aurora
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8 + 0.2 * Math.sin(t * 2.3);
    g.drawImage(this.aurora, -100 + 40 * Math.sin(t * 0.6), -20);
    g.globalAlpha = 0.35; g.drawImage(this.aurora, -60 - 50 * Math.sin(t * 0.8), 10, W + 200, 300);
    g.restore();
    // pingüino dentro del iglú (recortado por la puerta)
    const pg = this.pingu();
    const pintaPingu = () => pinguino(g, pg.x, pg.y, { ang: pg.ang, esc: pg.esc || 1, lata: pg.lata, beber: pg.beber, brinda: pg.brinda, felices: pg.felices, aleta: pg.aleta }, t);
    if (pg && pg.dentro) {
      g.save(); g.beginPath(); g.ellipse(PUERTA[0], PUERTA[1], 40, 48, 0, Math.PI, 0); g.closePath(); g.clip();
      g.fillStyle = "#0b1626"; g.fillRect(PUERTA[0] - 50, PUERTA[1] - 60, 100, 60);
      pintaPingu(); g.restore();
    }
    // esquirlas de hielo
    g.fillStyle = "rgba(215,245,255,.9)"; g.strokeStyle = "#fff"; g.lineWidth = 1;
    for (const s of this.esquirlas) { g.save(); g.translate(s.x, s.y); g.rotate(s.r); g.beginPath(); g.moveTo(-s.s / 2, s.s / 3); g.lineTo(0, -s.s / 2); g.lineTo(s.s / 2, s.s / 2); g.closePath(); g.fill(); g.stroke(); g.restore(); }
    // sombra
    g.fillStyle = "rgba(40,80,130,.3)"; g.beginPath(); g.ellipse(t > 4.4 ? 520 : this.X, 574, t > 4.4 ? 180 : 70, 9, 0, 0, 6.283); g.fill();
    pintarAvatar(g, e.m, e.pose, t);
    // gorro (encima de la cabeza, gira con ella)
    conMat(g, e.m, () => gorro(g, e.pose.rc || 0));
    // estrellitas de mareo
    if (t > 4.7 && t < 6.2) {
      const c = aPant(e.m, [39, 40]);
      for (let i = 0; i < 4; i++) { const a = t * 5 + i * 1.571; g.save(); g.fillStyle = "#ffd34d"; g.strokeStyle = "#7a4a00"; g.lineWidth = 2; estrella(g, c[0] + Math.cos(a) * 60, c[1] - 70 + Math.sin(a) * 16, 12, 5, t * 4); g.fill(); g.stroke(); g.restore(); }
    }
    if (pg && !pg.dentro) {
      if (pg.alfa != null && pg.alfa < 1) { g.save(); g.globalAlpha = pg.alfa; pintaPingu(); g.restore(); }
      else pintaPingu();
    }
    this.p.dibujar(g);
    // nieve
    g.fillStyle = "#ffffff";
    for (const c of this.copos) { g.globalAlpha = 0.85; g.beginPath(); g.arc(c.x, c.y, c.s, 0, 6.283); g.fill(); }
    g.globalAlpha = 1;
    // ¡OYE!
    if (t > 6.25 && t < 8.2) {
      const k = tramo(t, 6.25, 6.4), s = lerp(2.6, 1, eIn(k));
      const spr = this.rotulo();
      g.save(); g.translate(690 + (t < 6.9 ? azar(-4, 4) : 0), 175); g.rotate(-0.08); g.scale(s, s);
      g.globalAlpha = Math.min(1, k * 4) * (1 - tramo(t, 7.85, 8.2));
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    if (L < 1) { g.fillStyle = `rgba(0,0,0,${1 - L})`; g.fillRect(-60, -60, W + 120, H + 120); }
    // la luz de dentro del iglú es lo último que se apaga
    const lp = tramo(t, 8.0, 8.4) * (1 - tramo(t, 9.25, 9.5));
    if (lp > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = lp * (0.85 + 0.15 * Math.sin(t * 20));
      g.drawImage(BLOB.naranja, PUERTA[0] - 60, PUERTA[1] - 70, 120, 90); g.restore();
    }
  }
  rotulo() {
    if (cache.has("oye")) return cache.get("oye");
    const c = lienzoNuevo(520, 240), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 200);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.55, "#c9f3ff"); gr.addColorStop(1, "#5fc8ff");
    txt(g, "¡OYE!", 260, 190, { tam: 190, peso: 400, fam: FC, color: gr, borde: "#0a2a55", bordeAncho: 14, esp: 6, glow: "rgba(120,220,255,.8)", glowTam: 24 });
    cache.set("oye", c);
    return c;
  }
}

registrar({ id: "00062", nombre: "Polo Norte", crear: () => new EscenaPoloNorte() });
})();
