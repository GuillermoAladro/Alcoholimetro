"use strict";
/*
 * 00084 · EFECTO DOMINÓ
 *
 * Animación del banco. Empieza y acaba en negro.
 * Una fila de fichas de dominó serpentea por el suelo de toda la pantalla. Él lanza una chapa con el dedo, que
 * cruza la pantalla y tira la primera (¡TIC!). Las fichas caen en curvas, cada vez más grandes; la última, enorme,
 * empuja la jarra que hay en un taburete, que da una vuelta en el aire y cae justo en su mano. ¡CIERRO!
 */
(() => {
const ESC = 1.5, AX = 92;
// suelo en perspectiva: X 0–1000, D 0 (fondo) – 340 (delante)
const proy = (X, D) => [512 + (X - 500) * lerp(0.82, 1.06, D / 340), lerp(255, 535, D / 340)];
const escD = (D) => lerp(0.72, 1.0, D / 340);
const FW = 22, FH = 44; // ficha a tamaño 1 (unidades de suelo)
const T0 = 1.62;        // la chapa tira la primera
const TABURETE = [228, 562], JARRA0 = [203, 418]; // pie del taburete y asa de la jarra (pantalla)

function construirFichas() {
  // camino: fila del fondo (der → izq), curva, fila del medio (izq → der), curva, fila de delante (der → izq, crecen)
  const pts = [];
  const R = 85, xa = 300, xb = 900;
  for (let X = xb; X >= xa; X -= 4) pts.push([X, 0]);
  for (let a = 0; a <= Math.PI; a += 0.02) pts.push([xa - Math.sin(a) * R, R - Math.cos(a) * R]);
  for (let X = xa; X <= xb; X += 4) pts.push([X, 2 * R]);
  for (let a = 0; a <= Math.PI; a += 0.02) pts.push([xb + Math.sin(a) * R, 3 * R - Math.cos(a) * R]);
  const recto = [];
  for (let X = xb; X >= 120; X -= 4) recto.push([X, 4 * R]);
  // reparte las fichas a lo largo del camino
  const fichas = [];
  const largo = (P) => { const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); return L; };
  const enCamino = (P, L, s) => {
    let i = 1; while (i < L.length - 1 && L[i] < s) i++;
    const u = (s - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
    return { p: mezcla(P[i - 1], P[i], clamp(u, 0, 1)), d: [P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]] };
  };
  const L1 = largo(pts);
  for (let s = 0; s < L1[L1.length - 1] - 10; s += 40) { const c = enCamino(pts, L1, s); fichas.push({ X: c.p[0], D: c.p[1], d: c.d, tam: 1 }); }
  // la fila de delante: cada ficha un poco más grande que la anterior
  let X = xb - 10, tam = 1.1;
  while (tam < 4.2) { fichas.push({ X, D: 4 * R, d: [-1, 0], tam }); X -= 30 * tam; tam *= 1.17; }
  // tiempos de caída
  let t = T0;
  const r = semilla(84);
  fichas.forEach((f, i) => {
    f.dur = 0.12 * Math.sqrt(f.tam); f.t = t; t += f.dur * 0.62;
    const sig = fichas[i + 1];
    const hueco = sig ? Math.hypot(sig.X - f.X, sig.D - f.D) : 999;
    f.max = sig ? Math.asin(clamp(hueco / (FH * f.tam), 0, 0.97)) : 0.62;
    f.cara = (r() * 7) | 0; f.cara2 = (r() * 7) | 0;
  });
  return fichas;
}

const PIPS = [[], [[0, 0]], [[-1, -1], [1, 1]], [[-1, -1], [0, 0], [1, 1]], [[-1, -1], [1, -1], [-1, 1], [1, 1]], [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]];
function spriteFicha(a, b) {
  const S = 4, c = lienzoNuevo((FW + 4) * S, (FH + 2) * S), g = c.getContext("2d");
  g.scale(S, S);
  // canto (grosor)
  g.fillStyle = "#b9ad90"; rectR(g, 3, 1.5, FW, FH, 3.5); g.fill();
  const gr = g.createLinearGradient(0, 0, FW, 0);
  gr.addColorStop(0, "#fffdf6"); gr.addColorStop(1, "#e9e1cc");
  g.fillStyle = gr; rectR(g, 0.5, 0.5, FW, FH, 3.5); g.fill();
  g.strokeStyle = "#1a1a1a"; g.lineWidth = 1; g.stroke();
  g.fillStyle = "#222"; g.fillRect(3, FH / 2 + 0.1, FW - 5, 1.2);
  g.fillStyle = "#c8a24a"; g.beginPath(); g.arc(FW / 2 + 0.5, FH / 2 + 0.7, 1.4, 0, 6.283); g.fill();
  for (const [n, cy] of [[a, FH / 4 + 0.5], [b, (3 * FH) / 4 + 0.5]]) {
    g.fillStyle = "#111";
    for (const [px, py] of PIPS[n]) { g.beginPath(); g.arc(FW / 2 + 0.5 + px * 5.6, cy + py * 5.6, 1.9, 0, 6.283); g.fill(); }
  }
  return c;
}

class Domino extends Escena {
  constructor() {
    super(9.6);
    this.p = new Parts(360);
    this.fichas = construirFichas();
    this.spr = [];
    for (let i = 0; i < 7; i++) this.spr.push(spriteFicha(i, (i * 3 + 2) % 7));
    this.ultima = this.fichas[this.fichas.length - 1];
    this.tGolpe = this.ultima.t + this.ultima.dur * 0.3; // la última toca la jarra
    this.tCoge = this.tGolpe + 0.55;
    this.orden = this.fichas.map((f, i) => i).sort((a, b) => this.fichas[a].D - this.fichas[b].D || b - a);
    this.textos = [];
    // suelo con luz cálida y las sombras de las fichas (no se mueven): se pinta una vez
    this.suelo = lienzoNuevo(W, H);
    const g = this.suelo.getContext("2d");
    g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
    const gs = g.createLinearGradient(0, 200, 0, H);
    gs.addColorStop(0, "#0a0604"); gs.addColorStop(1, "#24170d");
    g.fillStyle = gs; g.fillRect(0, 210, W, H - 210);
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.28; g.drawImage(BLOB2.oroClaro, 120, 160, 900, 460);
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    g.fillStyle = "rgba(0,0,0,.35)";
    for (const f of this.fichas) { const [x, y] = proy(f.X, f.D), s = escD(f.D) * f.tam; g.beginPath(); g.ellipse(x, y + 2, FW * s * 0.8, 4 * s, 0, 0, 6.283); g.fill(); }
  }
  angFicha(f, t) {
    if (t < f.t) return 0;
    const u = tramo(t, f.t, f.t + f.dur);
    const a = eIn(u) * f.max;
    return u >= 1 ? f.max + 0.04 * Math.exp(-(t - f.t - f.dur) * 14) * Math.sin((t - f.t - f.dur) * 50) : a;
  }
  /** Frente de la ola (para que la siga con la cabeza). */
  frente(t) {
    let k = 0; while (k < this.fichas.length - 1 && this.fichas[k + 1].t < t) k++;
    return this.fichas[k];
  }
  posJarra(t, m) {
    // en el taburete → vuela dando una vuelta → en su mano
    if (t < this.tGolpe) return { p: JARRA0, inc: 0 };
    const mano = aPant(m, [104, 122]), u = tramo(t, this.tGolpe, this.tCoge);
    const p = mezcla(JARRA0, mano, eInOut(u));
    p[1] -= Math.sin(u * Math.PI) * 120;
    return { p, inc: -u * Math.PI * 2 };
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], y = PIES;
    // la chapa: la pone en el pulgar y la lanza
    const kP = eInOut(tramo(t, 0.45, 0.75)), kL = eOut(tramo(t, 0.92, 1.0));
    manoD = mezcla(mezcla(manoD, [92, 112], kP), [108, 84], kL);
    if (t > 0.6 && t < 0.95) pose.cara = "guino";
    if (t > 1.0) manoD = mezcla(manoD, [74, 150], eInOut(tramo(t, 1.3, 1.7)));
    // sigue la ola con la cabeza
    if (t > T0 && t < this.tGolpe) {
      const f = this.frente(t), q = proy(f.X, f.D);
      pose.rc = clamp((q[0] - AX) / 2400, 0, 0.3) * (q[1] < 450 ? 1 : 0.6);
    }
    if (t > this.ultima.t - 1.4 && t < this.tGolpe) pose.cara = "sorpresa";
    // tiende la mano sin mirar
    const kM = eInOut(tramo(t, this.tGolpe - 0.5, this.tGolpe - 0.1));
    if (kM > 0) { manoD = mezcla(manoD, [104, 122], kM); if (t > this.tGolpe - 0.3) { pose.cara = "guino"; pose.rc = lerp(pose.rc, -0.1, tramo(t, this.tGolpe - 0.3, this.tGolpe)); } }
    if (t >= this.tCoge) {
      const k = eBack(tramo(t, this.tCoge + 0.15, this.tCoge + 0.5));
      manoD = mezcla([104, 122], [100, 38], k);
      manoI = mezcla(manoI, [-14, 120], k);
      pose.cara = t < this.tCoge + 0.15 ? "sorpresa" : "risa";
      pose.jarra = { inc: -0.15 * k, nivel: 1 };
      pose.rc = 0.05 * Math.sin(t * 7);
      if (t > this.tCoge + 0.15 && t < this.tCoge + 0.5) y = PIES - Math.sin(tramo(t, this.tCoge + 0.15, this.tCoge + 0.5) * Math.PI) * 26;
    }
    pose.manoD = manoD; pose.manoI = manoI;
    return { pose, m: matAv(AX, y, ESC) };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("tic", t > T0, () => {
      const q = proy(this.fichas[0].X, 0);
      temblar(4, 0.12);
      for (let i = 0; i < 10; i++) p.nueva(P.CHISPA, q[0], q[1] - 30, azar(-200, 200), azar(-300, -80), azar(0.3, 0.5), azar(6, 10));
      this.textos.push({ s: "¡TIC!", x: q[0] + 20, y: q[1] - 70, t0: t, tam: 44 });
    });
    // las grandes de delante retumban al caer
    this.fichas.forEach((f, i) => {
      if (f.tam < 1.5) return;
      this.una("cae" + i, t > f.t + f.dur, () => {
        temblar(2 + f.tam * 2.5, 0.2);
        const q = proy(f.X - Math.sin(f.max) * FH * f.tam, f.D);
        for (let k = 0; k < 4 + f.tam * 3; k++) p.nueva(P.POLVO, q[0], q[1], azar(-160, 160), azar(-60, -5), azar(0.4, 0.8), azar(16, 30));
      });
    });
    this.una("golpe", t > this.tGolpe, () => {
      temblar(14, 0.3);
      for (let k = 0; k < 12; k++) p.nueva(P.CHISPA, JARRA0[0] + 40, JARRA0[1], azar(-250, 150), azar(-350, -100), azar(0.3, 0.6), azar(7, 11));
      this.textos.push({ s: "¡CLINC!", x: 330, y: 330, t0: t, tam: 46 });
    });
    this.una("coge", t > this.tCoge, () => {
      temblar(10, 0.25);
      const e = this.estado(), q = aPant(e.m, [104, 122]);
      for (let k = 0; k < 18; k++) p.nueva(P.ESPUMA, q[0] + 22, q[1] - 30, azar(-120, 120), azar(-300, -120), azar(0.4, 0.8), azar(4, 8));
    });
    this.una("cierro", t > this.tCoge + 0.35, () => {
      temblar(22, 0.5);
      for (let i = 0; i < 150; i++) p.nueva(P.CONFETI, azar(0, W), azar(-260, -10), azar(-60, 60), azar(40, 140), azar(4, 6), azar(9, 15), (Math.random() * 5) | 0);
    });
    p.actualizar(dt);
  }
  dibujarFicha(g, f, i, t) {
    const [x, y] = proy(f.X, f.D), s = escD(f.D) * f.tam, ang = this.angFicha(f, t);
    // dirección de caída en la pantalla: la parte de lado gira en el plano; la de fondo, la aplasta
    const dx = f.d[0] * lerp(0.82, 1.06, f.D / 340), dy = f.d[1] * 0.82, L = Math.hypot(dx, dy) || 1;
    const nx = dx / L, ny = dy / L, w = FW * s, h = FH * s;
    const piv = x + Math.sign(nx) * (w / 2) * Math.abs(nx);
    g.save(); g.translate(piv, y); g.rotate(ang * nx); g.scale(1, Math.cos(ang * Math.abs(ny)));
    g.drawImage(this.spr[f.cara], x - piv - w / 2, -h, (w * (FW + 4)) / FW, (h * (FH + 2)) / FH);
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    g.drawImage(this.suelo, 0, 0);
    for (const i of this.orden) this.dibujarFicha(g, this.fichas[i], i, t);
    // la chapa en el aire
    if (t > 0.98 && t < T0) {
      const q0 = aPant(e.m, [108, 84]), q1 = proy(this.fichas[0].X + 8, 0), u = tramo(t, 0.98, T0);
      const x = lerp(q0[0], q1[0], u), y = lerp(q0[1], q1[1] - 30, u) - Math.sin(u * Math.PI) * 230;
      g.save(); g.translate(x, y); g.rotate(t * 22); this.chapa(g); g.restore();
    }
    // taburete y jarra
    this.taburete(g);
    const J = this.posJarra(t, e.m);
    if (t < this.tCoge) { g.save(); g.translate(J.p[0], J.p[1]); g.scale(ESC, ESC); dibujarJarra(g, [0, 0], J.inc, 1, "asa", t); dibujarJarra(g, [0, 0], J.inc, 1, "cuerpo", t); g.restore(); }
    pintarAvatar(g, e.m, e.pose, t);
    this.p.dibujar(g);
    for (const o of this.textos) {
      const s = t - o.t0; if (s > 0.9) continue;
      const k = eBack(tramo(s, 0, 0.14));
      g.save(); g.translate(o.x, o.y - s * 14); g.rotate(-0.1); g.scale(k, k);
      txt(g, o.s, 0, 0, { tam: o.tam, peso: 400, fam: FC, color: "#fffdf5", borde: "#3a2400", bordeAncho: 7, alfa: 1 - tramo(s, 0.7, 0.9), esp: 2 });
      g.restore();
    }
    // ¡CIERRO!
    if (t > this.tCoge + 0.35) {
      const kc = t - this.tCoge - 0.35, k = tramo(kc, 0, 0.17), s = lerp(2.7, 1, eIn(k)) * (1 + 0.03 * Math.sin(kc * 8));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(610, 128); g.rotate(-0.05); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0, 0.4), tramo(t, this.dur - 0.55, this.dur - 0.04));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  chapa(g) {
    g.fillStyle = "#c4161c"; g.beginPath();
    for (let i = 0; i < 21; i++) { const a = (i / 21) * 6.283, r = i % 2 ? 9 : 11; g.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.75); }
    g.closePath(); g.fill();
    g.fillStyle = "#ffd34d"; g.beginPath(); g.ellipse(0, 0, 6, 4.5, 0, 0, 6.283); g.fill();
  }
  taburete(g) {
    const [x, y] = TABURETE, top = 438;
    g.strokeStyle = "#5a5f66"; g.lineWidth = 5; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - 20, top + 8); g.lineTo(x - 32, y); g.moveTo(x + 20, top + 8); g.lineTo(x + 32, y); g.moveTo(x, top + 8); g.lineTo(x, y - 6); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.ellipse(x, y - 50, 28, 6, 0, 0, 6.283); g.stroke();
    g.fillStyle = "#7a1f22"; g.beginPath(); g.ellipse(x, top + 6, 40, 11, 0, 0, 6.283); g.fill();
    g.fillStyle = "#a8302f"; g.beginPath(); g.ellipse(x, top, 40, 10, 0, 0, 6.283); g.fill();
    g.fillStyle = "rgba(255,255,255,.25)"; g.beginPath(); g.ellipse(x - 12, top - 3, 14, 3, 0, 0, 6.283); g.fill();
  }
  titulo() {
    if (this._tit) return this._tit;
    const c = lienzoNuevo(640, 220), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 50, 0, 160);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.55, "#fff3c4"); gr.addColorStop(1, "#ffc21f");
    txt(g, "¡CIERRO!", 320, 160, { tam: 140, peso: 900, fam: FD, color: gr, borde: "#2a1600", bordeAncho: 12, esp: 5, glow: "rgba(255,210,80,.8)", glowTam: 26 });
    return (this._tit = c);
  }
}

registrar({ id: "00084", nombre: "Efecto dominó", crear: () => new Domino() });
})();
