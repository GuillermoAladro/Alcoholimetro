"use strict";
/*
 * 00016 · XILÓFONO DE BOTELLAS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende la luz sobre la barra: siete botellas llenas a distintos niveles. Choca las dos cucharillas (¡ting!) y
 * toca una melodía: cada golpe lanza una nota del color de la botella y salen ¡PLIN, PLAN y PLON! Hace un glissando
 * de punta a punta, saca una bandeja de debajo de la barra y la golpea como un platillo: estallido de notas, pelo de
 * punta y risa. La luz se apaga.
 */
(() => {
const X = 512, ESC = 1.45;
const BARRA = 496;            // tapa de la barra (base de las botellas)
const NB = 7, SEP = 46;
const BOT = Array.from({ length: NB }, (_, i) => X + (i - 3) * SEP);
const NIVEL = [0.92, 0.8, 0.68, 0.56, 0.44, 0.32, 0.2];
const COL = ["#ff3b3b", "#ff8a1f", "#ffd21f", "#33e05a", "#2fe3e8", "#3d7bff", "#b048ff"];
const PUNTA = 402;            // donde toca la cucharilla
const LARGO = 46;             // cucharilla (px)
const DIR = { D: [-0.3, 0.954], I: [0.3, 0.954] };
const GOLPES = [
  [1.45, 6, "D"], [1.72, 5, "D"], [1.99, 6, "D"],
  [2.4, 3, "I"], [2.62, 4, "D"], [2.84, 3, "I"],
  [3.3, 1, "I"], [3.55, 2, "I"], [3.8, 0, "I"],
  [4.25, 0, "I"], [4.35, 1, "I"], [4.45, 2, "I"], [4.55, 3, "D"], [4.65, 4, "D"], [4.75, 5, "D"], [4.85, 6, "D"],
  [5.0, 6, "D"], [5.1, 5, "D"], [5.2, 4, "D"], [5.3, 3, "I"], [5.4, 2, "I"], [5.5, 1, "I"], [5.6, 0, "I"],
];
const PALABRAS = [["¡PLIN", 1.45, 268, "#2fe3e8"], ["PLAN", 2.4, 512, "#33e05a"], ["PLON!", 3.8, 748, "#ff8a1f"]];
const PLATILLO = 7.0, OFF = 9.55;
const cache = cacheTexto();
let SPR16 = null;

function barra() {
  const c = lienzoNuevo(W + 120, H - BARRA + 70), g = c.getContext("2d");
  g.translate(60, 10 - BARRA);
  const gr = g.createLinearGradient(0, BARRA + 10, 0, H);
  gr.addColorStop(0, "#5a3a22"); gr.addColorStop(1, "#1a1008");
  g.fillStyle = gr; g.fillRect(150, BARRA + 10, W - 300, H - BARRA + 40);
  g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = 2;
  for (let x = 210; x < W - 150; x += 72) { g.beginPath(); g.moveTo(x, BARRA + 18); g.lineTo(x, H + 40); g.stroke(); }
  const gt = g.createLinearGradient(0, BARRA - 6, 0, BARRA + 14);
  gt.addColorStop(0, "#e2c79e"); gt.addColorStop(1, "#7d5a36");
  g.fillStyle = gt; rectR(g, 136, BARRA - 4, W - 272, 18, 4); g.fill();
  g.fillStyle = "rgba(255,230,180,.4)"; g.fillRect(142, BARRA - 3, W - 284, 2);
  return c;
}
function sprites() { if (!SPR16) SPR16 = { barra: barra() }; return SPR16; }
function palabra(i) {
  const clave = "p" + i;
  if (cache.has(clave)) return cache.get(clave);
  const [s, , , col] = PALABRAS[i], c = lienzoNuevo(300, 150), g = c.getContext("2d");
  txt(g, s, 150, 108, { tam: 96, peso: 400, fam: FC, color: "#ffffff", borde: col, bordeAncho: 14, esp: 3, glow: col, glowTam: 20 });
  txt(g, s, 150, 108, { tam: 96, peso: 400, fam: FC, color: "#ffffff", esp: 3 });
  cache.set(clave, c);
  return c;
}
/** Botella de cristal con líquido de color que se balancea. */
function botella(g, x, nivel, col, ola, t) {
  const b = BARRA, cuerpo = 62, hombro = 12, cuello = 26, w = 30, wc = 11;
  const ruta = () => {
    g.beginPath();
    g.moveTo(x - w / 2, b - 4); g.lineTo(x - w / 2, b - cuerpo);
    g.quadraticCurveTo(x - w / 2, b - cuerpo - hombro, x - wc / 2, b - cuerpo - hombro - 4);
    g.lineTo(x - wc / 2, b - cuerpo - hombro - cuello); g.lineTo(x + wc / 2, b - cuerpo - hombro - cuello);
    g.lineTo(x + wc / 2, b - cuerpo - hombro - 4);
    g.quadraticCurveTo(x + w / 2, b - cuerpo - hombro, x + w / 2, b - cuerpo);
    g.lineTo(x + w / 2, b - 4); g.quadraticCurveTo(x + w / 2, b, x + w / 2 - 4, b); g.lineTo(x - w / 2 + 4, b); g.quadraticCurveTo(x - w / 2, b, x - w / 2, b - 4);
    g.closePath();
  };
  ruta(); g.fillStyle = "rgba(190,230,220,.16)"; g.fill();
  // líquido
  const alto = (cuerpo + hombro + cuello - 6) * nivel, ys = b - alto;
  g.save(); ruta(); g.clip();
  g.fillStyle = col; g.globalAlpha = 0.85;
  g.beginPath(); g.moveTo(x - w, b + 2);
  for (let k = 0; k <= 8; k++) { const xx = x - w / 2 + (w * k) / 8; g.lineTo(xx, ys + Math.sin(k * 0.9 + t * 30) * ola * 4); }
  g.lineTo(x + w, b + 2); g.closePath(); g.fill();
  g.globalAlpha = 0.35; g.fillStyle = "#fff"; g.fillRect(x - w / 2, ys - 1 + Math.sin(t * 30) * ola * 3, w, 2);
  g.restore();
  ruta(); g.strokeStyle = "rgba(230,250,245,.85)"; g.lineWidth = 1.8; g.stroke();
  g.fillStyle = "rgba(255,255,255,.45)"; g.fillRect(x - w / 2 + 4, b - cuerpo + 4, 3, cuerpo - 12);
  g.fillStyle = "rgba(230,250,245,.9)"; g.fillRect(x - wc / 2 - 1.5, b - cuerpo - hombro - cuello - 2, wc + 3, 4);
}
function nota(g, x, y, s, rot, col, a) {
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha *= a;
  g.lineCap = "round";
  for (const [lw, c, e] of [[s * 0.5, "rgba(0,0,0,.55)", 1.12], [s * 0.24, col, 1]]) {
    g.strokeStyle = c; g.lineWidth = lw;
    g.beginPath(); g.moveTo(s * 0.55, -s * 0.1); g.lineTo(s * 0.55, -s * 2.1); g.quadraticCurveTo(s * 1.45, -s * 1.7, s * 1.25, -s * 0.85); g.stroke();
    g.fillStyle = c; g.beginPath(); g.ellipse(0, 0, s * 0.64 * e, s * 0.47 * e, -0.4, 0, 6.283); g.fill();
  }
  g.restore();
}

class EscenaXilofono extends Escena {
  constructor() {
    super(10.25);
    this.p = new Parts(360);
    this.notas = []; this.ondas = []; this.olas = new Float32Array(NB); this.golpeBot = new Float32Array(NB).fill(-9);
    this.hechos = 0;
  }
  /** Mano de la cucharilla que tiene que dar en la botella i (en unidades de avatar). */
  manoPara(i, lado) {
    const d = DIR[lado], hx = BOT[i] - d[0] * LARGO, hy = PUNTA - d[1] * LARGO;
    return [39 + (hx - X) / ESC, 232 - (PIES - hy) / ESC];
  }
  manoTocando(lado, t, reposo) {
    const L = GOLPES.filter((g) => g[2] === lado);
    let p = null, n = null;
    for (const g of L) { if (g[0] <= t) p = g; else { n = g; break; } }
    if (!p && !n) return reposo;
    const A = p ? this.manoPara(p[1], lado) : reposo, tA = p ? p[0] : 1.0;
    if (!n) { const k = eInOut(tramo(t, tA, tA + 0.35)); return mezcla(A, reposo, k); }
    const B = this.manoPara(n[1], lado), tB = n[0];
    const u = clamp((t - tA) / (tB - tA), 0, 1), alto = Math.min(1, (tB - tA) / 0.3) * 18;
    const q = mezcla(A, B, eInOut(u));
    return [q[0], q[1] - alto * Math.sin(Math.PI * Math.pow(u, 0.8))];
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    const reposoD = [86, 112], reposoI = [-8, 112];
    let manoD = reposoD, manoI = reposoI, sy = 1;
    // choca las cucharillas
    if (t < 1.35) {
      const k = eInOut(tramo(t, 0.55, 0.85)) * (1 - eInOut(tramo(t, 1.05, 1.3)));
      manoD = mezcla(reposoD, [52, 92], k); manoI = mezcla(reposoI, [26, 92], k);
      pose.cara = t > 0.8 ? "guino" : "sonrisa";
    } else if (t < 6.0) {
      manoD = this.manoTocando("D", t, reposoD); manoI = this.manoTocando("I", t, reposoI);
      pose.cara = t < 4.2 ? (Math.floor(t * 2) % 3 === 0 ? "guino" : "sonrisa") : "risa";
      pose.rc = t < 4.2 ? 0.08 * Math.sin(t * 5) : 0.12 * Math.sin(t * 12);
    } else {
      // saca la bandeja de debajo de la barra y la levanta
      const kBaja = eInOut(tramo(t, 5.95, 6.2)), kSube = eInOut(tramo(t, 6.25, 6.6));
      manoI = mezcla(mezcla(reposoI, [-20, 175], kBaja), [-36, 96], kSube);
      sy = 1 - 0.05 * kBaja * (1 - kSube);
      // coge impulso y golpea
      const kArriba = eInOut(tramo(t, 6.45, 6.85)), kGolpe = eIn(tramo(t, 6.88, PLATILLO));
      manoD = mezcla(mezcla(reposoD, [104, 146], kArriba), [3, 108], kGolpe);
      if (t > PLATILLO) manoD = mezcla([3, 108], [86, 112], eInOut(tramo(t, PLATILLO + 0.35, PLATILLO + 0.9)));
      pose.cara = t < 6.6 ? "sonrisa" : t < PLATILLO ? "guino" : t < PLATILLO + 0.7 ? "sorpresa" : "risa";
      pose.rc = t > PLATILLO + 0.7 ? 0.1 * Math.sin(t * 9) : 0;
      if (t > PLATILLO) {
        const k = Math.exp(-(t - PLATILLO) * 1.4);
        pose.puntas = Math.min(1, (t - PLATILLO) * 8) * (0.4 + 0.6 * k); pose.oro = 0;
        manoI = [-36 + Math.sin(t * 50) * 3 * k, 96 + Math.cos(t * 43) * 3 * k];
      }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(X, PIES, ESC, 0, 1, sy);
    // las botellas van delante del cuerpo pero detrás de los brazos
    const inv = m.inverse();
    pose.objI = (g) => { g.save(); g.transform(inv.a, inv.b, inv.c, inv.d, inv.e, inv.f); this.botellas(g, t); g.restore(); };
    // cucharillas y bandeja
    const cuchara = (lado) => (g, mano) => {
      const d = lado === "D" && t > 6.85 && t < PLATILLO + 0.4 ? [-0.707, -0.707] : DIR[lado], L = LARGO / ESC;
      g.save(); g.translate(mano[0], mano[1]);
      g.strokeStyle = "#c9cdd6"; g.lineWidth = 2.8; g.lineCap = "round";
      g.beginPath(); g.moveTo(-d[0] * 4, -d[1] * 4); g.lineTo(d[0] * (L - 4), d[1] * (L - 4)); g.stroke();
      g.translate(d[0] * L, d[1] * L); g.rotate(Math.atan2(d[1], d[0]));
      g.fillStyle = "#e6e9ef"; g.beginPath(); g.ellipse(0, 0, 5.6, 3.8, 0, 0, 6.283); g.fill();
      g.fillStyle = "rgba(255,255,255,.8)"; g.beginPath(); g.ellipse(-1, -1, 1.6, 1, 0, 0, 6.283); g.fill();
      g.restore();
    };
    pose.objD2 = cuchara("D");
    const conBandeja = t > 6.2;
    pose.objI2 = (g, mano) => { if (conBandeja) this.bandeja(g, mano, t); else cuchara("I")(g, mano); };
    return { pose, m };
  }
  bandeja(g, mano, t) {
    const vib = t > PLATILLO ? Math.exp(-(t - PLATILLO) * 1.6) : 0;
    const sx = 1 - 0.12 * vib * Math.abs(Math.sin((t - PLATILLO) * 38));
    g.save(); g.translate(mano[0] - 4, mano[1] - 30); g.rotate(-0.15 + 0.06 * vib * Math.sin(t * 40)); g.scale(sx, 1);
    const r = 33;
    const gr = g.createRadialGradient(-10, -12, 2, 0, 0, r);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.45, "#c7ccd6"); gr.addColorStop(1, "#6f7685");
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.fill();
    g.strokeStyle = "#e9edf3"; g.lineWidth = 2.6; g.stroke();
    g.strokeStyle = "rgba(0,0,0,.18)"; g.lineWidth = 1; g.beginPath(); g.arc(0, 0, r - 5, 0, 6.283); g.stroke();
    g.restore();
  }
  botellas(g, t) {
    for (let i = 0; i < NB; i++) {
      const dt = t - this.golpeBot[i], temb = dt < 0.3 ? Math.sin(dt * 70) * 2 * (1 - dt / 0.3) : 0;
      g.save(); g.translate(temb, 0);
      botella(g, BOT[i], NIVEL[i], COL[i], this.olas[i], t);
      g.restore();
    }
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("ting", t > 0.85, () => {
      const e = this.estado(), q = aPant(e.m, [39, 90]);
      for (let i = 0; i < 10; i++) p.nueva(P.CHISPA, q[0], q[1], azar(-200, 200), azar(-260, -40), azar(0.2, 0.4), azar(6, 10));
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.3, 60);
    });
    while (this.hechos < GOLPES.length && t >= GOLPES[this.hechos][0]) {
      const [, i] = GOLPES[this.hechos++];
      this.golpeBot[i] = t; this.olas[i] = 1;
      this.notas.push({ x: BOT[i] + azar(-4, 4), y: PUNTA - 20, vx: azar(-40, 40), vy: azar(-170, -120), v: 0, vm: azar(1.3, 1.7), s: 14 - i * 0.5 + 4, col: COL[i], r: azar(-0.3, 0.3), f: azar(0, 6) });
      this.ondas.push({ x: BOT[i], y: PUNTA, t0: t, col: COL[i], r: 40 });
      for (let k = 0; k < 5; k++) p.nueva(P.CHISPA, BOT[i], PUNTA, azar(-160, 160), azar(-200, -40), azar(0.15, 0.3), azar(4, 7));
    }
    for (let i = 0; i < NB; i++) this.olas[i] *= Math.exp(-dt * 3.5);
    this.una("platillo", t > PLATILLO, () => {
      temblar(24, 0.6); this.flash = 1;
      const e = this.estado(), q = aPant(e.m, [-40, 66]);
      this.centroPlatillo = q;
      for (let k = 0; k < 4; k++) this.ondas.push({ x: q[0], y: q[1], t0: t + k * 0.09, col: "#ffffff", r: 220 });
      for (let k = 0; k < 18; k++) { const a = azar(0, 6.283), v = azar(200, 520); this.notas.push({ x: q[0], y: q[1], vx: Math.cos(a) * v, vy: Math.sin(a) * v - 100, v: 0, vm: azar(1.4, 2.2), s: azar(15, 22), col: COL[k % NB], r: azar(-0.5, 0.5), f: azar(0, 6) }); }
      for (let k = 0; k < 40; k++) { const a = azar(0, 6.283), v = azar(250, 700); p.nueva(P.CHISPA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(8, 14)); }
      for (let k = 0; k < 90; k++) p.nueva(P.CONFETI, azar(80, W - 80), azar(-120, -10), azar(-60, 60), azar(40, 140), azar(3, 5), azar(9, 14), k % 5);
    });
    for (const n of this.notas) { n.v += dt; n.vx *= 1 - 1.5 * dt; n.vy = n.vy * (1 - 1.2 * dt) - 30 * dt; n.x += (n.vx + Math.sin(n.v * 5 + n.f) * 30) * dt; n.y += n.vy * dt; }
    this.notas = this.notas.filter((n) => n.v < n.vm);
    this.ondas = this.ondas.filter((o) => t - o.t0 < 0.6);
    this.flash = Math.max(0, (this.flash || 0) - dt * 3);
    p.alfa = 1 - tramo(t, OFF, OFF + 0.45);
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), S = sprites();
    fondo(g, "#000");
    const parp = t < 0.55 ? [0, 0, 1, 0.2, 1, 0.6, 1][Math.min(6, Math.floor(t / 0.08))] : 1;
    const luz = parp * (1 - tramo(t, OFF, OFF + 0.5));
    if (luz > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.3 * luz;
      g.drawImage(BLOB.naranja, X - 520, 120, 1040, 560); g.restore();
      foco(g, X, X, BARRA, 300, luz * 0.8);
      g.save(); g.globalAlpha = luz;
      pintarAvatar(g, e.m, e.pose, t);
      g.drawImage(S.barra, -60, BARRA - 10);
      g.restore();
    }
    // ondas de cada golpe
    g.save(); g.globalCompositeOperation = "lighter";
    for (const o of this.ondas) {
      const u = (t - o.t0) / 0.6;
      if (u < 0) continue;
      g.globalAlpha = (1 - u) * 0.8 * luz; g.strokeStyle = o.col; g.lineWidth = 3 * (1 - u) + 1;
      g.beginPath(); g.ellipse(o.x, o.y, 8 + o.r * u, (8 + o.r * u) * (o.r > 100 ? 1 : 0.45), 0, 0, 6.283); g.stroke();
    }
    g.restore();
    this.p.dibujar(g);
    g.save(); g.globalAlpha = luz;
    for (const n of this.notas) nota(g, n.x, n.y, n.s, n.r + 0.2 * Math.sin(n.v * 6 + n.f), n.col, Math.min(1, (n.vm - n.v) * 2.5) * Math.min(1, n.v * 8));
    g.restore();
    // ¡PLIN PLAN PLON!
    PALABRAS.forEach(([, t0, x], i) => {
      if (t < t0) return;
      const R = palabra(i), k = tramo(t, t0, t0 + 0.18);
      const salto = t > PLATILLO ? 1 + 0.3 * Math.exp(-(t - PLATILLO) * 4) * Math.abs(Math.cos((t - PLATILLO) * 12 + i)) : 1;
      const s = eBack(k) * salto * 0.95, y = 108 + (t > PLATILLO ? -10 * Math.abs(Math.sin((t - PLATILLO) * 6 + i * 1.3)) * Math.exp(-(t - PLATILLO) * 1.5) : 0);
      g.save(); g.globalAlpha = luz; g.translate(x, y); g.rotate([-0.12, 0.02, 0.1][i]); g.scale(s, s);
      g.drawImage(R, -R.width / 2, -R.height / 2); g.restore();
    });
    if (this.flash > 0) { g.fillStyle = `rgba(255,255,255,${this.flash * 0.5})`; g.fillRect(-60, -60, W + 120, H + 120); }
    if (t < 0.55 && parp < 1) { g.fillStyle = `rgba(0,0,0,${1 - parp})`; g.fillRect(-60, -60, W + 120, H + 120); }
    if (t > OFF + 0.48) { g.fillStyle = "#000"; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00016", nombre: "Xilófono de botellas", crear: () => new EscenaXilofono() });
})();
