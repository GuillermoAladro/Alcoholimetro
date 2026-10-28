"use strict";
/*
 * 00139 · OTRA RONDA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Guillermo y Rodrigo se toman un chupito cada uno y los dejan boca abajo. Luego se turnan para pedir (¡OTRA!) y
 * cada vez caen más chupitos en la barra, que cruje (CRIC…). Piden los dos a la vez: ¡OTRA RONDA! y llega una
 * avalancha de vasitos: la barra se dobla bajo el peso. Se apartan, se miran y se señalan; cae uno más… ¡CRAC!
 */
(() => {
const ESC = 1.6, AY = 610, BARRA = 455;
const XG = 226, XR = 798;
const X0 = 50, X1 = 974;                  // apoyos de la barra
const CW = 16, CH = 20, E = 1.6;          // chupito en unidades de avatar y su escala en la barra
const VW = CW * E, VH = CH * E, PASO = 28;
const COLORES = [["#ffe27a", "#c26400"], ["#9dff9a", "#139a3a"], ["#ff9cc0", "#c2185b"]];
const T_SALUD = 0.8, T_OTRA = [2.0, 3.2, 4.4], T_RONDA = 5.6, T_ULTIMO = 8.75, T_APAGA = 9.75;
const CT = cacheTexto();
const aP = (X, u) => [X + (u[0] - 39) * ESC, AY - (232 - u[1]) * ESC];

/** Vasito de chupito dibujado una vez en un lienzo (x3 de resolución). */
const SPRV = new Map();
function spriteVaso(ci, lleno) {
  const k = ci + "|" + lleno;
  if (SPRV.has(k)) return SPRV.get(k);
  const R = 3, c = lienzoNuevo((CW + 4) * R, (CH + 4) * R), g = c.getContext("2d");
  g.scale(R, R); g.translate((CW + 4) / 2, (CH + 4) / 2);
  const w = CW, h = CH, col = COLORES[ci];
  const forma = () => { g.beginPath(); g.moveTo(-w / 2, -h / 2); g.lineTo(w / 2, -h / 2); g.lineTo(w / 2 - 1.6, h / 2); g.lineTo(-w / 2 + 1.6, h / 2); g.closePath(); };
  forma(); g.fillStyle = "rgba(210,235,255,.22)"; g.fill();
  if (lleno) {
    g.save(); forma(); g.clip();
    const alto = h - 7.5, gr = g.createLinearGradient(0, -h / 2, 0, h / 2);
    gr.addColorStop(0, col[0]); gr.addColorStop(1, col[1]);
    g.fillStyle = gr; g.fillRect(-w, h / 2 - 4.5 - alto, w * 2, alto);
    g.fillStyle = "rgba(255,255,255,.45)"; g.fillRect(-w, h / 2 - 4.5 - alto, w * 2, 1.2);
    g.restore();
  }
  g.fillStyle = "rgba(225,240,255,.6)"; rectR(g, -w / 2 + 1.8, h / 2 - 4.5, w - 3.6, 4.2, 1.2); g.fill();
  forma(); g.strokeStyle = "rgba(240,248,255,.95)"; g.lineWidth = 1.2; g.stroke();
  g.fillStyle = "rgba(255,255,255,.55)"; g.fillRect(-w / 2 + 2.2, -h / 2 + 1.5, 1.4, h - 7);
  SPRV.set(k, c);
  return c;
}
/** Chupito centrado en (x, y) a escala `e` (px por unidad). */
function vaso(g, x, y, ang, e, ci, lleno) {
  const s = spriteVaso(ci, lleno), w = (CW + 4) * e, h = (CH + 4) * e;
  g.save(); g.translate(x, y); if (ang) g.rotate(ang); g.drawImage(s, -w / 2, -h / 2, w, h); g.restore();
}

// la pirámide del centro: filas de 15, 14, 13, 12, 11, 10 y el último arriba del todo
const HUECOS = [];
{
  const filas = [15, 14, 13, 12, 11, 10, 1];
  filas.forEach((n, f) => {
    const orden = [];
    for (let i = 0; i < n; i++) orden.push(i);
    if (f === 0) orden.sort((a, b) => Math.abs(a - (n - 1) / 2) - Math.abs(b - (n - 1) / 2));
    for (const i of orden) HUECOS.push({ x: 512 + (i - (n - 1) / 2) * PASO, fila: f, c: (i + f * 2) % 3 });
  });
}
// cuándo cae cada uno: rondas de 6, 10, 16 y 43, y el último
const CAE = [];
{
  const rondas = [[T_OTRA[0] + 0.2, 6, 0.07], [T_OTRA[1] + 0.2, 10, 0.05], [T_OTRA[2] + 0.2, 16, 0.033], [T_RONDA + 0.25, 43, 0.022], [T_ULTIMO, 1, 0]];
  for (const [t0, n, paso] of rondas) for (let i = 0; i < n; i++) CAE.push(t0 + i * paso);
}
const GRAV = 2600, ALTO0 = -40;

class OtraRonda extends Escena {
  constructor() {
    super(10.3);
    this.p = new Parts(320);
    this.grietas = [];
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, 10.25)); }
  /** Cuánto se hunde la barra en el centro. */
  hundir(t) {
    let s = 5 * eOut(tramo(t, 3.6, 4.0)) + 9 * eOut(tramo(t, 4.8, 5.3));
    const k = tramo(t, 6.15, 7.0);
    s += 66 * eOut(k) + (k > 0 ? 6 * Math.sin(k * 30) * (1 - k) : 0);
    const d = t - (T_ULTIMO + 0.3);
    if (d > 0) s += 16 * eOut(tramo(d, 0, 0.15)) + 4 * Math.exp(-d * 6) * Math.sin(d * 40);
    return s;
  }
  techo(x, s) { const u = clamp((x - X0) / (X1 - X0), 0, 1); return BARRA + s * Math.pow(Math.sin(u * Math.PI), 1.3); }
  pendiente(x, s) { return Math.atan2(this.techo(x + 4, s) - this.techo(x - 4, s), 8); }
  /** Dónde está el chupito i (o null si aún no ha salido). */
  hueco(i, t, s) {
    const H0 = HUECOS[i], t0 = CAE[i];
    if (t < t0) return null;
    const yFin = this.techo(H0.x, s) - VH / 2 - 7 - H0.fila * VH;
    const tl = t0 + Math.sqrt((2 * (yFin - ALTO0)) / GRAV);
    let y, ang = this.pendiente(H0.x, s) * (1 - H0.fila * 0.08);
    if (t < tl) { const d = t - t0; y = ALTO0 + 0.5 * GRAV * d * d; ang = 0.4 * Math.sin(d * 14 + i); }
    else { const d = t - tl; y = yFin - Math.abs(Math.sin(d * 22)) * 10 * Math.exp(-d * 9); }
    // al hundirse, los de arriba se van hacia el centro
    const x = H0.x + (512 - H0.x) * 0.06 * H0.fila * clamp(s / 80, 0, 1);
    return { x, y, ang, tl, c: H0.c };
  }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    const R = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let gD = [70, 128], gI = [6, 136], rI = [6, 128], rD = [70, 136];
    let giroG = 0, giroR = 0, dxG = 0, dxR = 0;
    // el chupito de cada uno: lo cogen, ¡salud!, al trago y boca abajo a la barra
    const vG = aP(XG, [78, 128]), vR = aP(XR, [-2, 128]);
    void vG; void vR;
    let angG = 0, angR = 0, enManoG = t < 1.95, enManoR = t < 1.95;
    if (t < 2.0) {
      const kS = eInOut(tramo(t, 0.45, T_SALUD)), kB = eInOut(tramo(t, 1.05, 1.3)), kT = tramo(t, 1.3, 1.6), kA = eInOut(tramo(t, 1.62, 1.92));
      gD = mezcla([78, 128], [92, 40], kS); rI = mezcla([-2, 128], [-14, 40], kS);
      if (t > T_SALUD && t < 1.05) { G.cara = "risa"; R.cara = "risa"; }
      const bG = boca(-0.34 * kB), bR = boca(0.34 * kB, "rodrigo");
      gD = mezcla(gD, [bG[0] + 3, bG[1] + 17], kB); rI = mezcla(rI, [bR[0] - 3, bR[1] + 17], kB);
      G.rc = -0.34 * kB; R.rc = 0.34 * kB;
      angG = (-0.25 - 0.55 * eInOut(kT)) * kB; angR = -angG;
      if (kB > 0.3) { G.cara = "dormido"; R.cara = "dormido"; }
      if (kA > 0) {
        gD = mezcla(gD, [78, 128], kA); rI = mezcla(rI, [-2, 128], kA);
        angG = lerp(angG, -Math.PI, kA); angR = lerp(angR, Math.PI, kA);
        G.rc = -0.34 * (1 - kA); R.rc = 0.34 * (1 - kA);
        G.cara = "guino"; R.cara = "guino";
      }
    }
    if (enManoG) { const a = angG; G.objD2 = (g, m) => { g.save(); g.translate(m[0], m[1]); g.rotate(a); g.translate(-1, -9); vaso(g, 0, 0, 0, 1, 0, a > -0.9); g.restore(); }; }
    if (enManoR) { const a = angR; R.objI2 = (g, m) => { g.save(); g.translate(m[0], m[1]); g.rotate(a); g.translate(1, -9); vaso(g, 0, 0, 0, 1, 2, a < 0.9); g.restore(); }; }
    // ¡OTRA! (dedo arriba): Guillermo, Rodrigo, Guillermo
    T_OTRA.forEach((t0, i) => {
      const k = eOut(tramo(t, t0, t0 + 0.18)) * (1 - eInOut(tramo(t, t0 + 0.75, t0 + 1.0)));
      if (k <= 0) return;
      if (i % 2 === 0) { gD = mezcla([70, 128], [84, -6], k); G.cara = "risa"; R.cara = t > t0 + 0.4 ? "sorpresa" : "sonrisa"; R.rc = -0.1 * k; }
      else { rI = mezcla([6, 128], [-6, -6], k); R.cara = "risa"; G.cara = t > t0 + 0.4 ? "guino" : "sonrisa"; G.rc = 0.1 * k; }
    });
    // miran cómo cruje la barra
    if (t > 3.75 && t < 4.3) { G.cara = "sorpresa"; G.rc = 0.12; }
    if (t > 4.95 && t < 5.5) { R.cara = "sorpresa"; R.rc = -0.12; G.cara = "sorpresa"; }
    // ¡OTRA RONDA! los dos a la vez, puños arriba
    if (t >= T_RONDA) {
      const k = eOut(tramo(t, T_RONDA, T_RONDA + 0.15)) * (1 - eInOut(tramo(t, 6.25, 6.5)));
      gD = mezcla(gD, [86, -4 + Math.sin(t * 16) * 3], k); gI = mezcla(gI, [-10, -4 + Math.sin(t * 16 + 1) * 3], k);
      rI = mezcla(rI, [-8, -4 + Math.sin(t * 16) * 3], k); rD = mezcla(rD, [88, -4 + Math.sin(t * 16 + 1) * 3], k);
      if (t < 6.3) { G.cara = "risa"; R.cara = "risa"; }
    }
    // la barra se dobla: se echan atrás con las manos en alto
    if (t >= 6.3) {
      const k = eOut(tramo(t, 6.3, 6.6));
      gD = mezcla(gD, [96, 64], k); gI = mezcla(gI, [-20, 64], k);
      rI = mezcla(rI, [-20, 64], k); rD = mezcla(rD, [96, 64], k);
      giroG = -0.07 * k; giroR = 0.07 * k; dxG = -16 * k; dxR = 16 * k;
      G.cara = "sorpresa"; R.cara = "sorpresa";
      G.puntas = 0.8 * (1 - tramo(t, 7.4, 8.2)); R.puntas = G.puntas;
    }
    // se miran…
    if (t >= 7.15) { const k = eInOut(tramo(t, 7.15, 7.35)); G.rc = 0.17 * k; R.rc = -0.17 * k; }
    // …y se señalan: «ha sido él»
    if (t >= 7.9) {
      const k = eInOut(tramo(t, 7.9, 8.2));
      gD = mezcla([96, 64], [118, 92], k); rI = mezcla([-20, 64], [-42, 92], k);
      gI = mezcla([-20, 64], [6, 136], k); rD = mezcla([96, 64], [70, 136], k);
      G.cara = "guino"; R.cara = "risa"; giroG = -0.07 * (1 - k); giroR = 0.07 * (1 - k);
    }
    // cae uno más: ¡CRAC!, se encogen
    if (t >= T_ULTIMO + 0.3) {
      const d = t - T_ULTIMO - 0.3, k = eOut(tramo(d, 0, 0.12));
      G.cara = "sorpresa"; R.cara = "sorpresa"; G.rc = 0.17 * (1 - k); R.rc = -0.17 * (1 - k);
      gD = mezcla(gD, [60, 40], k); rI = mezcla(rI, [18, 40], k);
      G.puntas = R.puntas = 0.7;
    }
    G.manoD = gD; G.manoI = gI; R.manoD = rD; R.manoI = rI;
    const bote = t > T_RONDA && t < 6.3 ? -Math.abs(Math.sin((t - T_RONDA) * 10)) * 10 : 0;
    return [{ pose: G, m: matAv(XG + dxG, AY + bote, ESC, giroG) }, { pose: R, m: matAv(XR + dxR, AY + bote, ESC, giroR) }];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, s = this.hundir(t);
    this.una("boca abajo", t > 1.92, () => {
      temblar(6, 0.15);
      for (const x of [aP(XG, [78, 128])[0], aP(XR, [-2, 128])[0]]) for (let k = 0; k < 6; k++) p.nueva(P.CHISPA, x, BARRA - 4, azar(-160, 160), azar(-200, -60), azar(0.2, 0.4), azar(5, 8));
    });
    for (let i = 0; i < CAE.length; i++) {
      const q = this.hueco(i, t, s);
      if (q && t > q.tl) this.una("v" + i, true, () => { if (i % 3 === 0 || i === CAE.length - 1) p.nueva(P.DESTELLO, q.x, q.y, 0, 0, 0.18, 40); });
    }
    this.una("cric", t > 3.85, () => temblar(3, 0.2));
    this.una("ronda", t > T_RONDA, () => {
      temblar(16, 0.4);
      for (let k = 0; k < 50; k++) p.nueva(P.CONFETI, azar(60, W - 60), azar(-60, -10), azar(-40, 40), azar(0, 100), azar(2.5, 4), azar(9, 15), k % 5);
    });
    this.una("dobla", t > 6.2, () => {
      temblar(22, 0.9);
      for (let k = 0; k < 7; k++) {
        const lado = k % 2 ? 1 : -1, pts = [[512 + lado * 4, BARRA + 20]];
        let x = 512, y = BARRA + 20;
        for (let j = 0; j < 4; j++) { x += lado * azar(8, 26); y += azar(14, 30); pts.push([x, y]); }
        this.grietas.push(pts);
      }
    });
    if (t > 6.2 && t < 7.1 && Math.random() < 30 * dt) p.nueva(P.POLVO, azar(380, 640), this.techo(512, s) + azar(10, 60), azar(-80, 80), azar(-40, 20), azar(0.5, 0.9), azar(24, 40));
    this.una("crac", t > T_ULTIMO + 0.3, () => {
      temblar(18, 0.5);
      for (let k = 0; k < 14; k++) p.nueva(P.POLVO, 512 + azar(-120, 120), this.techo(512, s) + azar(0, 40), azar(-200, 200), azar(-60, 10), azar(0.5, 0.9), azar(26, 44));
      for (let k = 0; k < 16; k++) { const a = azar(-Math.PI, 0), v = azar(150, 400); p.nueva(P.CHISPA, 512, this.techo(512, s), Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 10)); }
    });
    p.suelo = (x) => this.techo(x, this.hundir(this.t)) - 2;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  barra(g, s) {
    const N = 40, xs = [];
    for (let i = 0; i <= N; i++) xs.push(lerp(X0 - 30, X1 + 30, i / N));
    // frente (también se hunde)
    g.beginPath(); g.moveTo(xs[0], this.techo(xs[0], s) + 12);
    for (const x of xs) g.lineTo(x, this.techo(x, s) + 12);
    g.lineTo(X1 + 30, H + 60); g.lineTo(X0 - 30, H + 60); g.closePath();
    const gr = this.grB || (this.grB = (() => { const q = g.createLinearGradient(0, BARRA, 0, H); q.addColorStop(0, "#5a3218"); q.addColorStop(1, "#24130a"); return q; })());
    g.fillStyle = gr; g.fill();
    g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = 3;
    for (let x = X0 + 66; x < X1; x += 96) { g.beginPath(); g.moveTo(x, this.techo(x, s) + 20); g.lineTo(x, H); g.stroke(); }
    // latón de los pies
    g.strokeStyle = "#b8862d"; g.lineWidth = 8; g.beginPath();
    xs.forEach((x, i) => { const y = 556 + (this.techo(x, s) - BARRA) * 0.35; if (i) g.lineTo(x, y); else g.moveTo(x, y); });
    g.stroke();
    // tablero
    g.beginPath(); g.moveTo(xs[0], this.techo(xs[0], s) - 6);
    for (const x of xs) g.lineTo(x, this.techo(x, s) - 6);
    for (let i = N; i >= 0; i--) g.lineTo(xs[i], this.techo(xs[i], s) + 12);
    g.closePath(); g.fillStyle = "#8a5426"; g.fill();
    g.strokeStyle = "rgba(255,220,170,.45)"; g.lineWidth = 3; g.beginPath();
    xs.forEach((x, i) => { const y = this.techo(x, s) - 5; if (i) g.lineTo(x, y); else g.moveTo(x, y); });
    g.stroke();
    // pilares en los extremos
    for (const x of [X0, X1]) {
      const gp = g.createLinearGradient(x - 22, 0, x + 22, 0);
      gp.addColorStop(0, "#2a160a"); gp.addColorStop(0.5, "#6b3d1d"); gp.addColorStop(1, "#2a160a");
      g.fillStyle = gp; g.fillRect(x - 22, BARRA + 12, 44, H - BARRA);
    }
    // grietas en el centro
    if (this.grietas.length) {
      g.save(); g.strokeStyle = "rgba(20,8,2,.9)"; g.lineWidth = 3; g.lineJoin = "round";
      const dy = this.techo(512, s) - BARRA;
      for (const pts of this.grietas) { g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1] + dy) : g.moveTo(q[0], q[1] + dy))); g.stroke(); }
      g.restore();
    }
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses(), s = this.hundir(t);
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    foco(g, 512, 512, BARRA, 420, 0.9);
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.25 * a; g.drawImage(BLOB2.oroClaro, 100, 100, 824, 460);
    g.restore();
    g.save(); g.globalAlpha = a;
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    this.barra(g, s);
    // los dos vasitos boca abajo
    if (t > 1.92) {
      for (const [x, ci] of [[aP(XG, [78, 128])[0], 0], [aP(XR, [-2, 128])[0], 2]]) vaso(g, x, this.techo(x, s) - VH / 2 - 7, Math.PI + this.pendiente(x, s), E, ci, false);
    }
    for (let i = 0; i < CAE.length; i++) {
      const q = this.hueco(i, t, s);
      if (q) vaso(g, q.x, q.y, q.ang, E, q.c, true);
    }
    g.restore();
    this.p.dibujar(g);
    // ¡OTRA!
    T_OTRA.forEach((t0, i) => {
      const k = tramo(t, t0 + 0.05, t0 + 0.25) * (1 - tramo(t, t0 + 0.85, t0 + 1.0));
      if (k <= 0) return;
      const E0 = e[i % 2], q = aPant(E0.m, i % 2 ? [-6, -10] : [84, -10]);
      const cx = i % 2 ? q[0] - 50 : q[0] + 50;
      bocadillo(g, cx, 96, "¡OTRA!", q[0], q[1] - 20, k * a, 44);
    });
    // CRIC… CRAC
    for (const [t0, s0, x, y, tam, r] of [[3.75, "CRIC…", 512, 545, 36, -0.08], [4.95, "CRIC… CRAC…", 512, 548, 40, 0.06], [6.2, "¡CRAAAC!", 512, 556, 64, -0.05], [T_ULTIMO + 0.3, "¡CRAC!", 512, 556, 70, 0.07]]) {
      const d = t - t0;
      if (d < 0 || d > 0.95) continue;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x + azar(-1.5, 1.5), Math.min(588, y + (this.techo(512, s) - BARRA) * 0.4)); g.rotate(r); g.scale(k, k);
      txt(g, s0, 0, 0, { tam, peso: 400, fam: FC, color: "#ffe0b0", borde: "#2a1200", bordeAncho: 8, esp: 2, alfa: a * (1 - tramo(d, 0.7, 0.95)) });
      g.restore();
    }
    // ¡OTRA RONDA!
    if (t > T_RONDA) {
      const d = t - T_RONDA, k = tramo(d, 0, 0.18), sc = lerp(2.6, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a; g.translate(512, 112); g.rotate(-0.04); g.scale(sc, sc);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has(1)) return CT.get(1);
    const c = lienzoNuevo(900, 220), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 60, 0, 165);
    gr.addColorStop(0, "#fff0f6"); gr.addColorStop(0.5, "#ff9cc0"); gr.addColorStop(1, "#ff3d84");
    txt(g, "¡OTRA RONDA!", 450, 160, { tam: 146, peso: 900, fam: FD, color: gr, borde: "#3a0018", bordeAncho: 12, esp: 5, glow: "rgba(255,61,132,.85)", glowTam: 26, max: 840 });
    CT.set(1, c);
    return c;
  }
}

registrar({ id: "00139", nombre: "Otra ronda", crear: () => new OtraRonda() });
})();
