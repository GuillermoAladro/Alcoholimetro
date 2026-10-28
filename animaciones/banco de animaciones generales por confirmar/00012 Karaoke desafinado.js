"use strict";
/*
 * 00012 · KARAOKE DESAFINADO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende el karaoke. Canta en un micrófono de pie mientras la letra se va coloreando (♪ UNA CAÑITA MÁS Y ME
 * VOY ♪). Las notas le salen torcidas y de colores raros, chocan entre sí y se rompen en pedazos; otras dan en una
 * caña de la barra, que se va agrietando. En el «VOOOY» final la caña revienta: ¡CRAC! Se queda cortado y se encoge.
 */
(() => {
const X = 300, ESC = 1.45;
const LETRA = "UNA CAÑITA MÁS Y ME VOY";
// sílabas: [instante, primer carácter, último carácter (excluido)]
const SILABAS = [[1.2, 0, 1], [1.45, 1, 4], [1.8, 4, 6], [2.05, 6, 8], [2.3, 8, 11], [2.75, 11, 15], [3.2, 15, 17], [3.5, 17, 20], [3.9, 20, 23]];
const FIN_VOY = 5.95, CRAC = 6.0, OFF = 8.15;
const VASO = { x: 790, y: 430 };     // base de la caña en la barra
const PANT = { x: 120, y: 22, w: 784, h: 96 };
const COLS = ["#b6ff3d", "#b048ff", "#ff8a2e", "#ff3d84", "#2fe3e8"];
const cache = cacheTexto();
let SPR12 = null;

function barra() {
  const c = lienzoNuevo(W - 560 + 60, H - 400 + 60), g = c.getContext("2d");
  g.translate(-560, -400);
  const top = 430;
  const gr = g.createLinearGradient(0, top + 14, 0, H);
  gr.addColorStop(0, "#5a3a22"); gr.addColorStop(1, "#1e120a");
  g.fillStyle = gr; g.fillRect(600, top + 14, W - 540, H - top);
  g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = 2;
  for (let x = 660; x < W + 60; x += 70) { g.beginPath(); g.moveTo(x, top + 22); g.lineTo(x, H + 40); g.stroke(); }
  const gt = g.createLinearGradient(0, top - 4, 0, top + 16);
  gt.addColorStop(0, "#e2c79e"); gt.addColorStop(1, "#7d5a36");
  g.fillStyle = gt; rectR(g, 586, top - 2, W - 500, 18, 4); g.fill();
  g.fillStyle = "rgba(255,230,180,.35)"; g.fillRect(592, top - 1, W - 520, 2);
  // botella y vaso de chupito de decoración
  const b = (x) => {
    g.fillStyle = "#1d4d22"; rectR(g, x - 13, top - 74, 26, 74, 6); g.fill();
    g.beginPath(); g.moveTo(x - 13, top - 64); g.quadraticCurveTo(x - 6, top - 94, x - 5, top - 104); g.lineTo(x + 5, top - 104); g.quadraticCurveTo(x + 6, top - 94, x + 13, top - 64); g.fill();
    g.fillStyle = "#e7d7a8"; g.fillRect(x - 13, top - 54, 26, 24);
    g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(x - 8, top - 70, 3, 60);
    g.fillStyle = "#c9a400"; g.fillRect(x - 6, top - 108, 12, 6);
  };
  b(905);
  g.fillStyle = "rgba(200,225,255,.25)"; rectR(g, 680, top - 34, 30, 34, 3); g.fill();
  g.strokeStyle = "rgba(235,245,255,.8)"; g.lineWidth = 1.5; g.stroke();
  g.fillStyle = "#ffc21f"; g.fillRect(683, top - 20, 24, 17);
  return c;
}
function pantalla() {
  const c = lienzoNuevo(PANT.w + 40, PANT.h + 40), g = c.getContext("2d");
  g.translate(20, 20);
  g.shadowColor = "#2fe3e8"; g.shadowBlur = 18;
  rectR(g, 0, 0, PANT.w, PANT.h, 16); g.fillStyle = "#07101c"; g.fill();
  g.shadowBlur = 0; g.strokeStyle = "#2fe3e8"; g.lineWidth = 3; g.stroke();
  g.strokeStyle = "rgba(47,227,232,.25)"; g.lineWidth = 1;
  rectR(g, 8, 8, PANT.w - 16, PANT.h - 16, 10); g.stroke();
  return c;
}
function sprites() {
  if (!SPR12) SPR12 = { barra: barra(), pantalla: pantalla() };
  return SPR12;
}
/** La letra: blanca y coloreada, y dónde empieza cada carácter. */
function letra() {
  if (cache.has("letra")) return cache.get("letra");
  const tam = 54, fuente = `400 ${tam}px ${FB}`;
  const med = lienzoNuevo(1, 1).getContext("2d"); med.font = fuente;
  if ("letterSpacing" in med) med.letterSpacing = "2px";
  const ancho = med.measureText(LETRA).width;
  const pos = []; for (let i = 0; i <= LETRA.length; i++) pos.push(med.measureText(LETRA.slice(0, i)).width);
  const hacer = (relleno, borde) => {
    const c = lienzoNuevo(ancho + 20, tam * 1.5), g = c.getContext("2d");
    txt(g, LETRA, 10, tam * 1.08, { tam, peso: 400, fam: FB, color: relleno, borde, bordeAncho: 6, alin: "left", esp: 2 });
    return c;
  };
  const r = { blanca: hacer("#ffffff", "#0b2a3a"), color: hacer("#ff3d84", "#4a0020"), pos, ancho };
  cache.set("letra", r);
  return r;
}
function rotuloCrac() {
  if (cache.has("crac")) return cache.get("crac");
  const c = lienzoNuevo(520, 220), g = c.getContext("2d");
  txt(g, "¡CRAC!", 260, 160, { tam: 150, peso: 400, fam: FC, color: "#ffffff", borde: "#d10a3c", bordeAncho: 14, esp: 6, glow: "rgba(255,40,90,.8)", glowTam: 26 });
  txt(g, "¡CRAC!", 260, 160, { tam: 150, peso: 400, fam: FC, color: "#ffffff", esp: 6 });
  cache.set("crac", c);
  return c;
}
/** Nota torcida: el palo doblado y la nota inclinada (k = cuánto desafina). */
function notaTorcida(g, x, y, s, rot, col, k, t, a) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.transform(1, 0.12 * k * Math.sin(t * 6), 0.55 * k * Math.sin(t * 9), 1, 0, 0);
  g.globalAlpha *= a;
  g.lineCap = "round"; g.lineJoin = "round";
  for (const [lw, c] of [[s * 0.55, "#140818"], [s * 0.26, col]]) {
    g.strokeStyle = c; g.lineWidth = lw;
    g.beginPath(); g.moveTo(s * 0.52, -s * 0.1);
    g.quadraticCurveTo(s * (0.52 + 1.5 * k * Math.sin(t * 7)), -s * 1.1, s * 0.52 + s * 0.7 * k, -s * 2.1);
    g.quadraticCurveTo(s * 1.4, -s * 1.7 + s * 0.4 * k, s * 1.25, -s * 0.8);
    g.stroke();
  }
  g.fillStyle = "#140818"; g.beginPath(); g.ellipse(0, 0, s * 0.74, s * 0.56, -0.4 + 0.5 * k, 0, 6.283); g.fill();
  g.fillStyle = col; g.beginPath(); g.ellipse(0, 0, s * 0.62, s * 0.44, -0.4 + 0.5 * k, 0, 6.283); g.fill();
  g.fillStyle = "rgba(255,255,255,.45)"; g.beginPath(); g.ellipse(-s * 0.2, -s * 0.15, s * 0.18, s * 0.1, -0.4, 0, 6.283); g.fill();
  g.restore();
}
/** Grietas de la caña: rayas que salen de 4 golpes (en coordenadas del vaso, base en 0,0). */
function grietas() {
  const r = semilla(12), golpes = [[-8, -70], [10, -44], [-4, -26], [6, -82]], lineas = [];
  golpes.forEach((o, i) => {
    const ls = [];
    for (let k = 0; k < 4 + i; k++) {
      let x = o[0], y = o[1]; const a = r() * 6.283; const pts = [[x, y]];
      for (let j = 0; j < 3; j++) { x += Math.cos(a + (r() - 0.5)) * (5 + r() * 9); y += Math.sin(a + (r() - 0.5)) * (5 + r() * 9); pts.push([clamp(x, -24, 24), clamp(y, -96, -2)]); }
      ls.push(pts);
    }
    lineas.push(ls);
  });
  return lineas;
}

class EscenaKaraoke extends Escena {
  constructor() {
    super(8.75);
    this.p = new Parts(320);
    this.p.suelo = (x) => (x > 590 ? 430 : PIES);
    this.notas = []; this.trozos = []; this.esquirlas = [];
    this.grietas = grietas(); this.nGrietas = 0; this.golpeVaso = -9; this.roto = false;
    this.guion();
  }
  /** Las notas: cada una sale de la boca y vuela a un choque, a la caña o se pierde. */
  guion() {
    const n = (t0, dur, fin, tipo, curva, s) => ({ t0, dur, fin, tipo, curva, s: (s || 15) * 1.2, col: COLS[this.notas.length % COLS.length], rot: azar(-0.4, 0.4), hecha: false });
    const L = this.notas;
    L.push(n(1.2, 1.1, [470, 150], "suelta", -60));
    L.push(n(1.45, 1.1, [520, 260], "suelta", 50));
    L.push(n(1.8, 0.75, [560, 210], "choque", -90), n(2.05, 0.5, [560, 210], "choque", 70));
    L.push(n(2.3, 0.6, [VASO.x - 4, VASO.y - 70], "vaso", -110));
    L.push(n(2.75, 0.75, [610, 190], "choque", 80), n(3.2, 0.3, [610, 190], "choque", -60));
    L.push(n(3.5, 0.6, [VASO.x + 8, VASO.y - 44], "vaso", -80));
    // el VOOOY: cada vez más notas, más grandes y más torcidas
    L.push(n(3.95, 0.55, [520, 170], "choque", -70, 17), n(4.15, 0.35, [520, 170], "choque", 60, 17));
    L.push(n(4.2, 0.6, [VASO.x - 4, VASO.y - 26], "vaso", -140, 18));
    L.push(n(4.55, 0.5, [600, 240], "choque", 90, 18), n(4.65, 0.4, [600, 240], "choque", -90, 18));
    L.push(n(4.75, 0.9, [440, 120], "suelta", -40, 18));
    L.push(n(5.0, 0.6, [VASO.x + 6, VASO.y - 82], "vaso", -120, 20));
    L.push(n(5.2, 0.45, [560, 300], "choque", 60, 19), n(5.3, 0.35, [560, 300], "choque", -40, 19));
    L.push(n(5.4, 0.55, [VASO.x, VASO.y - 56], "vaso", -170, 34));
    L[L.length - 1].ultima = true; L[L.length - 1].col = "#ff3d84";
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    // canta: la boca se abre en cada sílaba
    let cantando = false;
    for (const [ts] of SILABAS) if (t >= ts && t < ts + 0.2) cantando = true;
    if (t >= 3.9 && t < FIN_VOY) cantando = true;
    pose.cara = cantando ? "risa" : "sonrisa";
    let rc = 0.05 * Math.sin(t * 4);
    const kVoy = eInOut(tramo(t, 3.9, 4.4)) * (1 - eInOut(tramo(t, FIN_VOY, FIN_VOY + 0.15)));
    rc = lerp(rc, -0.2 + 0.04 * Math.sin(t * 38), kVoy);
    // la mano derecha en el pie del micro; la izquierda, teatral
    let manoD = [69, 118], manoI = [9, 160];
    const kBrazo = eInOut(tramo(t, 1.0, 1.4));
    manoI = mezcla(manoI, [-26, 104 + 6 * Math.sin(t * 3)], kBrazo);
    manoI = mezcla(manoI, [-24, 34 + 4 * Math.sin(t * 30)], kVoy);
    let sx = 1, sy = 1;
    if (t >= CRAC) {
      // se queda cortado: mira la caña, se encoge
      pose.cara = t < 6.8 ? "sorpresa" : "guino";
      rc = lerp(0, 0.16, eOut(tramo(t, CRAC, CRAC + 0.3)));
      const kE = eInOut(tramo(t, 6.75, 7.1));
      manoI = mezcla([-24, 34], [-8, 104], eOut(tramo(t, CRAC, CRAC + 0.35)));
      manoI = mezcla(manoI, [-14, 112], kE);
      manoD = mezcla([69, 118], [92, 112], kE);
      sy = 1 - 0.035 * kE; sx = 1 + 0.02 * kE;
      if (t > 6.8) rc = lerp(0.16, -0.08, eInOut(tramo(t, 6.8, 7.1)));
    }
    pose.rc = rc; pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(X, PIES, ESC, 0, sx, sy);
    return { pose, m };
  }
  posNota(n, t) {
    const u = clamp((t - n.t0) / n.dur, 0, 1), e = this.estado();
    const b = aPant(e.m, boca(e.pose.rc));
    const p0 = [b[0] + 26, b[1] - 6], p2 = n.fin;
    const mx = (p0[0] + p2[0]) / 2, my = (p0[1] + p2[1]) / 2;
    const dx = p2[0] - p0[0], dy = p2[1] - p0[1], L = Math.hypot(dx, dy) || 1;
    const c = [mx - (dy / L) * n.curva, my + (dx / L) * n.curva];
    const v = 1 - u;
    const x = v * v * p0[0] + 2 * v * u * c[0] + u * u * p2[0], y = v * v * p0[1] + 2 * v * u * c[1] + u * u * p2[1];
    const temb = 7 * Math.sin(t * 14 + n.t0 * 5) * Math.sin(u * Math.PI);
    return [x - (dy / L) * temb, y + (dx / L) * temb, u];
  }
  romperNota(x, y, n) {
    const p = this.p;
    for (let i = 0; i < 3; i++) this.trozos.push({ x: x + azar(-6, 6), y: y + azar(-6, 6), vx: azar(-220, 220), vy: azar(-260, -60), r: azar(0, 6), vr: azar(-12, 12), tipo: i, s: n.s, col: n.col, v: 0 });
    for (let i = 0; i < 10; i++) { const a = azar(0, 6.283), v = azar(120, 320); p.nueva(P.CHISPA, x, y, Math.cos(a) * v, Math.sin(a) * v, azar(0.2, 0.4), azar(6, 10)); }
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    for (const n of this.notas) {
      if (n.hecha || t < n.t0 + n.dur) continue;
      n.hecha = true;
      const [x, y] = n.fin;
      if (n.tipo === "choque") { this.romperNota(x, y, n); temblar(4, 0.12); }
      else if (n.tipo === "vaso") {
        this.romperNota(x, y, n);
        this.golpeVaso = t;
        if (n.ultima) this.romper();
        else { this.nGrietas = Math.min(4, this.nGrietas + 1); temblar(5, 0.15); }
      }
    }
    for (const q of this.trozos) { q.v += dt; q.vy += 900 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.r += q.vr * dt; }
    this.trozos = this.trozos.filter((q) => q.v < 1.2 && q.y < H + 40);
    for (const q of this.esquirlas) {
      q.vy += 1300 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.r += q.vr * dt;
      const suelo = q.x > 590 ? 434 : PIES;
      if (q.y > suelo) { q.y = suelo; q.vy *= -0.3; q.vx *= 0.5; q.vr *= 0.5; }
    }
    p.alfa = 1 - tramo(t, OFF, OFF + 0.4);
    p.actualizar(dt);
  }
  romper() {
    this.roto = this.t; temblar(22, 0.5);
    const p = this.p, cx = VASO.x, cy = VASO.y - 50;
    for (let i = 0; i < 16; i++) {
      const pts = []; const n = 3 + ((Math.random() * 2) | 0), r = azar(6, 13);
      for (let k = 0; k < n; k++) { const a = (k / n) * 6.283 + azar(-0.4, 0.4); pts.push([Math.cos(a) * r * azar(0.5, 1.2), Math.sin(a) * r * azar(0.5, 1.2)]); }
      this.esquirlas.push({ x: cx + azar(-22, 22), y: cy + azar(-40, 40), vx: azar(-420, 420), vy: azar(-620, -150), r: 0, vr: azar(-14, 14), pts });
    }
    for (let i = 0; i < 40; i++) p.nueva(P.GOTA, cx + azar(-15, 15), cy + azar(-20, 25), azar(-380, 380), azar(-520, -120), azar(0.6, 1.1), azar(3, 6));
    for (let i = 0; i < 22; i++) p.nueva(P.ESPUMA, cx + azar(-20, 20), cy - 40, azar(-260, 260), azar(-380, -100), azar(0.5, 0.9), azar(5, 11));
    for (let i = 0; i < 4; i++) p.nueva(P.DESTELLO, cx + azar(-20, 20), cy + azar(-30, 30), 0, 0, 0.3, azar(60, 110));
  }
  dibujarVaso(g, t) {
    const sacude = t - this.golpeVaso < 0.4 ? Math.sin(t * 90) * 4 * (1 - (t - this.golpeVaso) / 0.4) : 0;
    const vibra = t > 3.9 && t < CRAC ? Math.sin(t * 70) * 1.6 * tramo(t, 3.9, 5.5) : 0;
    g.save(); g.translate(VASO.x + sacude + vibra, VASO.y);
    if (!this.roto) {
      // cristal, cerveza y espuma
      g.beginPath(); g.moveTo(-19, 0); g.lineTo(-25, -96); g.lineTo(25, -96); g.lineTo(19, 0); g.closePath();
      g.fillStyle = "rgba(200,225,255,.16)"; g.fill();
      g.save(); g.clip();
      const gr = g.createLinearGradient(0, 0, 0, -80);
      gr.addColorStop(0, "#c46a00"); gr.addColorStop(1, "#ffc21f");
      g.fillStyle = gr; g.fillRect(-30, -80, 60, 80);
      g.fillStyle = "#fffaf0"; g.fillRect(-30, -95, 60, 16);
      g.fillStyle = "rgba(255,245,200,.7)";
      for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(-14 + i * 5.5, -6 - ((t * 40 + i * 13) % 70), 1.4, 0, 6.283); g.fill(); }
      g.restore();
      g.fillStyle = "#fffaf0"; g.beginPath();
      for (let i = 0; i <= 5; i++) g.arc(-25 + i * 10, -96, 5 + (i % 2) * 1.5, Math.PI, 0);
      g.fill();
      g.strokeStyle = "rgba(235,245,255,.9)"; g.lineWidth = 2;
      g.beginPath(); g.moveTo(-19, 0); g.lineTo(-25, -96); g.moveTo(25, -96); g.lineTo(19, 0); g.lineTo(-19, 0); g.stroke();
      g.fillStyle = "rgba(255,255,255,.4)"; g.fillRect(-18, -88, 3, 80);
      // grietas
      g.strokeStyle = "rgba(255,255,255,.95)"; g.lineWidth = 1.4;
      for (let i = 0; i < this.nGrietas; i++) for (const pts of this.grietas[i]) { g.beginPath(); pts.forEach((q, j) => (j ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.stroke(); }
    } else {
      // lo que queda: el culo del vaso con dientes
      g.beginPath(); g.moveTo(-19, 0); g.lineTo(-20.5, -22); g.lineTo(-13, -14); g.lineTo(-7, -27); g.lineTo(0, -16); g.lineTo(6, -24); g.lineTo(12, -13); g.lineTo(20.5, -25); g.lineTo(19, 0); g.closePath();
      g.fillStyle = "rgba(200,225,255,.18)"; g.fill();
      g.save(); g.clip(); g.fillStyle = "#d98a10"; g.fillRect(-25, -10, 50, 10); g.restore();
      g.strokeStyle = "rgba(235,245,255,.9)"; g.lineWidth = 2; g.stroke();
    }
    g.restore();
  }
  dibujarMicro(g, e) {
    const b = aPant(e.m, boca(e.pose.rc)), base = X + 52;
    const cab = [b[0] + 18, b[1] + 26], codo = [X + 52, 410], punta = [cab[0] + 16, cab[1] + 30];
    g.save(); g.lineCap = "round";
    // trípode
    g.strokeStyle = "#16161a"; g.lineWidth = 5;
    g.beginPath(); g.moveTo(base, PIES - 34); g.lineTo(base - 38, PIES); g.moveTo(base, PIES - 34); g.lineTo(base + 38, PIES); g.moveTo(base, PIES - 34); g.lineTo(base + 4, PIES + 2); g.stroke();
    // barra y brazo
    for (const [lw, c] of [[7, "#111"], [4, "#9aa0aa"]]) {
      g.strokeStyle = c; g.lineWidth = lw;
      g.beginPath(); g.moveTo(base, PIES - 34); g.lineTo(codo[0], codo[1]); g.lineTo(punta[0], punta[1]); g.stroke();
    }
    g.fillStyle = "#222"; g.beginPath(); g.arc(codo[0], codo[1], 6, 0, 6.283); g.fill();
    // micrófono
    g.save(); g.translate(cab[0], cab[1]); g.rotate(Math.atan2(punta[1] - cab[1], punta[0] - cab[0]));
    g.fillStyle = "#1b1b20"; rectR(g, 4, -5.5, 30, 11, 4); g.fill();
    g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(8, -4, 22, 2);
    const gr = g.createRadialGradient(-2, -3, 1, 0, 0, 11);
    gr.addColorStop(0, "#f2f4f8"); gr.addColorStop(0.6, "#a3a9b4"); gr.addColorStop(1, "#555b66");
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 10.5, 0, 6.283); g.fill();
    g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 0.8;
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(-9, i * 3.5); g.lineTo(9, i * 3.5); g.stroke(); }
    g.restore();
    g.restore();
  }
  dibujarLetra(g, t, luz) {
    const L = letra(), S = sprites();
    g.save(); g.globalAlpha = luz;
    g.drawImage(S.pantalla, PANT.x - 20, PANT.y - 20);
    const x0 = W / 2 - L.ancho / 2, y0 = PANT.y + 8;
    // relleno por sílabas
    let fin = 0;
    for (let i = 0; i < SILABAS.length; i++) {
      const [ts, a, b] = SILABAS[i], te = i + 1 < SILABAS.length ? SILABAS[i + 1][0] : FIN_VOY - 0.3;
      if (t >= ts) fin = lerp(L.pos[a], L.pos[b], clamp((t - ts) / (te - ts), 0, 1));
    }
    const temb = t > 3.9 && t < CRAC ? azar(-1.5, 1.5) * tramo(t, 3.9, 5.6) : 0;
    g.drawImage(L.blanca, x0 - 10 + temb, y0);
    if (fin > 0) {
      g.save(); g.beginPath(); g.rect(x0 - 10, y0 - 10, fin + 10, L.blanca.height + 20); g.clip();
      g.drawImage(L.color, x0 - 10 + temb, y0);
      g.restore();
    }
    // las notitas de los lados (♪ … ♪)
    const col = t > 1.2 ? "#ff3d84" : "#ffffff";
    for (const [x, s] of [[x0 - 46, 1], [x0 + L.ancho + 22, -1]]) {
      g.save(); g.translate(x, y0 + 52); g.rotate(0.12 * Math.sin(t * 6) * s);
      g.fillStyle = col; g.strokeStyle = col; g.lineWidth = 4; g.lineCap = "round";
      g.beginPath(); g.ellipse(0, 0, 9, 7, -0.4, 0, 6.283); g.fill();
      g.beginPath(); g.moveTo(8, -2); g.lineTo(8, -34); g.quadraticCurveTo(22, -26, 19, -12); g.stroke();
      g.restore();
    }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), S = sprites();
    fondo(g, "#000");
    const parp = t < 0.7 ? [0, 0, 1, 0.2, 0, 1, 0.5, 1][Math.min(7, Math.floor(t / 0.09))] : 1;
    const luz = parp * (1 - tramo(t, OFF, OFF + 0.45));
    if (luz > 0) {
      // ambiente de karaoke: luz morada de fondo
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35 * luz;
      g.drawImage(BLOB.rojo, -200, 120, 900, 600);
      g.globalAlpha = 0.25 * luz; g.drawImage(BLOB2.cian, 500, 60, 700, 520);
      g.restore();
      foco(g, X, X, PIES, 150, luz * 0.9);
      g.save(); g.globalAlpha = luz;
      g.drawImage(S.barra, 560, 400);
      this.dibujarVaso(g, t);
      pintarAvatar(g, e.m, e.pose, t);
      this.dibujarMicro(g, e);
      // esquirlas de cristal
      g.fillStyle = "rgba(225,240,255,.55)"; g.strokeStyle = "rgba(255,255,255,.95)"; g.lineWidth = 1.2;
      for (const q of this.esquirlas) {
        g.save(); g.translate(q.x, q.y); g.rotate(q.r);
        g.beginPath(); q.pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fill(); g.stroke();
        g.restore();
      }
      g.restore();
      this.dibujarLetra(g, t, luz);
    }
    this.p.dibujar(g);
    // notas en vuelo y trozos de notas rotas
    g.save(); g.globalAlpha = luz;
    for (const n of this.notas) {
      if (t < n.t0 || n.hecha) continue;
      const [x, y, u] = this.posNota(n, t);
      const k = clamp((t - 1.2) / 4, 0.25, 1);
      notaTorcida(g, x, y, n.s * (0.5 + 0.5 * Math.min(1, u * 4)), n.rot + Math.sin(t * 8 + n.t0) * 0.4, n.col, k, t + n.t0, 1);
      // ondas de desafinar
      if (u > 0.1) {
        g.save(); g.strokeStyle = n.col; g.globalAlpha *= 0.5; g.lineWidth = 2.5; g.beginPath();
        for (let i = 0; i <= 8; i++) { const xx = x - 30 - i * 4, yy = y + 6 + Math.sin(i * 1.6 + t * 20) * 4; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
        g.stroke(); g.restore();
      }
    }
    for (const q of this.trozos) {
      const a = 1 - q.v / 1.2;
      g.save(); g.translate(q.x, q.y); g.rotate(q.r); g.globalAlpha *= a;
      g.fillStyle = q.col; g.strokeStyle = q.col; g.lineWidth = q.s * 0.26; g.lineCap = "round";
      if (q.tipo === 0) { g.beginPath(); g.ellipse(0, 0, q.s * 0.62, q.s * 0.44, -0.4, 0, 6.283); g.fill(); }
      else if (q.tipo === 1) { g.beginPath(); g.moveTo(0, -q.s); g.lineTo(0, q.s * 0.4); g.stroke(); }
      else { g.beginPath(); g.moveTo(0, -q.s * 0.6); g.quadraticCurveTo(q.s * 0.8, -q.s * 0.2, q.s * 0.6, q.s * 0.5); g.stroke(); }
      g.restore();
    }
    g.restore();
    // ¡CRAC!
    if (this.roto && t < OFF + 0.3) {
      const k = tramo(t, this.roto, this.roto + 0.18), R = rotuloCrac();
      const s = eBack(k) * 0.9 * (1 + 0.05 * tramo(t, this.roto + 0.2, OFF));
      const a = Math.min(1, k * 3) * (1 - tramo(t, OFF - 0.2, OFF + 0.25));
      g.save(); g.globalAlpha = a; g.translate(760 + (t - this.roto < 0.4 ? azar(-4, 4) : 0), 222); g.rotate(0.1); g.scale(s, s);
      g.drawImage(R, -R.width / 2, -R.height / 2 - 20); g.restore();
    }
    if (t < 0.7 && parp < 1) { g.fillStyle = `rgba(0,0,0,${1 - parp})`; g.fillRect(-60, -60, W + 120, H + 120); }
    if (t > OFF + 0.4) { g.fillStyle = "#000"; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00012", nombre: "Karaoke desafinado", crear: () => new EscenaKaraoke() });
})();
