"use strict";
/*
 * 00089 · AJEDREZ DE CAÑAS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Juega al ajedrez contra quien mira la pantalla: sus piezas son cañas (el rey, una jarra; la dama, un tubo) y
 * las del rival, chupitos. Piensa con la mano en la barbilla, coge la dama y la lanza por encima del tablero hasta
 * la última fila (¡TOC!), le da al reloj (¡CLIC!) y el rey de chupito, encerrado por sus peones, se tambalea y cae.
 * ¡JAQUE MATE! Para celebrarlo se bebe un peón y guiña un ojo.
 */
(() => {
const ESC = 1.5, X = 560, AY = 519;
// tablero en perspectiva: casilla (c 0–7 de izq. a der., r 0–7 del fondo hacia delante)
const casilla = (c, r) => {
  const v = (r + 0.5) / 8, xl = lerp(330, 170, v), xr = lerp(694, 854, v);
  return [lerp(xl, xr, (c + 0.5) / 8), lerp(392, 574, v), lerp(1.0, 1.4, v)];
};
const esquina = (c, r) => { const v = r / 8, xl = lerp(330, 170, v), xr = lerp(694, 854, v); return [lerp(xl, xr, c / 8), lerp(392, 574, v)]; };
const RELOJ = [690, 368];
const T_LANZA = 3.02, T_CAE = 3.6, T_MATE = 4.55, T_BEBE = 5.95;

// ---------------------------------------------------------------- vasos (base en (0,0), escala s)
function cana(g, s, nivel = 1) {
  g.save(); g.scale(s, s);
  const vaso = () => { g.beginPath(); g.moveTo(-9, 0); g.lineTo(-12, -40); g.lineTo(12, -40); g.lineTo(9, 0); g.closePath(); };
  vaso(); g.fillStyle = "rgba(210,230,255,.2)"; g.fill();
  if (nivel > 0.02) {
    const h = 34 * nivel;
    g.save(); vaso(); g.clip();
    g.fillStyle = "#f2a81d"; g.fillRect(-13, -2 - h, 26, h + 2);
    g.fillStyle = "rgba(255,240,170,.55)"; g.fillRect(-6, -h, 4, h - 2);
    g.fillStyle = "#fffaf0"; g.fillRect(-13, -2 - h - 6, 26, 7);
    g.restore();
    g.fillStyle = "#fffaf0"; for (const x of [-8, 0, 8]) { g.beginPath(); g.arc(x, -2 - h - 5, 4.6, Math.PI, 0); g.fill(); }
  }
  vaso(); g.strokeStyle = "rgba(235,245,255,.9)"; g.lineWidth = 1.6; g.stroke();
  g.fillStyle = "rgba(235,245,255,.7)"; g.fillRect(-9, -2, 18, 2);
  g.restore();
}
function tubo(g, s) {
  g.save(); g.scale(s, s);
  rectR(g, -10, -62, 20, 62, 2); g.fillStyle = "rgba(210,230,255,.2)"; g.fill();
  g.fillStyle = "#f2a81d"; g.fillRect(-10, -54, 20, 52);
  g.fillStyle = "rgba(255,240,170,.55)"; g.fillRect(-6, -52, 4, 48);
  g.fillStyle = "#fffaf0"; g.fillRect(-10, -60, 20, 7);
  for (const x of [-6, 2, 8]) { g.beginPath(); g.arc(x, -60, 4.6, Math.PI, 0); g.fill(); }
  rectR(g, -10, -62, 20, 62, 2); g.strokeStyle = "rgba(235,245,255,.9)"; g.lineWidth = 1.6; g.stroke();
  g.save(); g.translate(0, -66); corona(g, 18); g.restore();
  g.restore();
}
function chupito(g, s, rey) {
  g.save(); g.scale(s, s);
  const h = rey ? 32 : 24;
  const vaso = () => { g.beginPath(); g.moveTo(-8, 0); g.lineTo(-10, -h); g.lineTo(10, -h); g.lineTo(8, 0); g.closePath(); };
  vaso(); g.fillStyle = "rgba(210,230,255,.25)"; g.fill();
  g.save(); vaso(); g.clip(); g.fillStyle = "#5a1e08"; g.fillRect(-11, -h + 5, 22, h - 9); g.fillStyle = "rgba(255,170,90,.4)"; g.fillRect(-6, -h + 6, 3, h - 11); g.restore();
  g.fillStyle = "rgba(235,245,255,.85)"; g.fillRect(-8, -5, 16, 5);
  vaso(); g.strokeStyle = "rgba(235,245,255,.9)"; g.lineWidth = 1.6; g.stroke();
  g.restore();
}

function lienzoMesa() {
  const c = lienzoNuevo(W, H), g = c.getContext("2d");
  // mesa
  g.fillStyle = "#4a2810"; g.beginPath(); g.moveTo(268, 360); g.lineTo(756, 360); g.lineTo(940, H + 4); g.lineTo(84, H + 4); g.closePath(); g.fill();
  g.strokeStyle = "rgba(255,210,150,.35)"; g.lineWidth = 2; g.beginPath(); g.moveTo(268, 360); g.lineTo(756, 360); g.stroke();
  // marco del tablero
  g.fillStyle = "#2a1406"; g.beginPath(); g.moveTo(318, 384); g.lineTo(706, 384); g.lineTo(866, 584); g.lineTo(158, 584); g.closePath(); g.fill();
  for (let r = 0; r < 8; r++) for (let cc = 0; cc < 8; cc++) {
    const a = esquina(cc, r), b = esquina(cc + 1, r), d = esquina(cc + 1, r + 1), e = esquina(cc, r + 1);
    g.fillStyle = (r + cc) % 2 ? "#3b2a1c" : "#e9d7b0";
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(d[0], d[1]); g.lineTo(e[0], e[1]); g.closePath(); g.fill();
  }
  return c;
}

class Ajedrez extends Escena {
  constructor() {
    super(9.4);
    this.p = new Parts(380);
    this.mesa = lienzoMesa();
    this.piezas = [
      { tipo: "jarra", c: 3, r: 0 }, { tipo: "cana", c: 2, r: 1 }, { tipo: "cana", c: 3, r: 1 }, { tipo: "cana", c: 5, r: 0, bebe: true },
      { tipo: "cana", c: 1, r: 2 }, { tipo: "dama", c: 6, r: 0 },
      { tipo: "chupito", c: 0, r: 6 }, { tipo: "chupito", c: 1, r: 6 }, { tipo: "chupito", c: 2, r: 6 }, { tipo: "chupito", c: 5, r: 4 },
      { tipo: "rey", c: 1, r: 7 },
    ];
    this.textos = [];
  }
  /** Mano derecha (unidades) y qué lleva. */
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    const aU = (q) => [(q[0] - X) / ESC + 39, (q[1] - AY) / ESC + 232];
    const dama = casilla(6, 0), peon = casilla(5, 0);
    let manoD = [74, 150], manoI = [6, 150], lleva = null, ang = 0;
    // piensa con la mano en la barbilla
    const kP = eInOut(tramo(t, 0.45, 0.8)) * (1 - eInOut(tramo(t, 1.85, 2.15)));
    manoI = mezcla(manoI, [32, 70], kP);
    if (t > 0.8 && t < 1.9) { pose.cara = Math.floor(t * 2.2) % 2 ? "guino" : "sonrisa"; pose.rc = 0.1 * Math.sin(t * 2.6); }
    // coge la dama, la sube y la lanza
    const kC = eInOut(tramo(t, 1.95, 2.3)), kS = eInOut(tramo(t, 2.4, 2.72)), kA = eInOut(tramo(t, 2.72, 2.92)), kL = eOut(tramo(t, 2.92, T_LANZA));
    manoD = mezcla(mezcla(mezcla(mezcla(manoD, aU([dama[0] - 4, dama[1] - 6]), kC), [96, 96], kS), [82, 64], kA), [126, 52], kL);
    if (t > 2.3 && t < T_LANZA) lleva = "dama";
    if (t > 2.6 && t < T_LANZA) pose.cara = "guino";
    // le da al reloj
    const kR = eInOut(tramo(t, T_CAE + 0.05, T_CAE + 0.25)) * (1 - eInOut(tramo(t, T_CAE + 0.35, T_CAE + 0.6)));
    if (t > T_LANZA) manoD = mezcla(mezcla([126, 52], [80, 140], eInOut(tramo(t, T_LANZA, T_CAE))), aU([RELOJ[0] - 10, RELOJ[1] - 12]), kR);
    if (t > T_CAE && t < T_MATE) { pose.cara = "sonrisa"; pose.rc = -0.08; }
    // ¡jaque mate!: se ríe
    if (t > T_MATE) {
      pose.cara = "risa"; pose.rc = 0.06 * Math.sin(t * 7);
      const k = eOut(tramo(t, T_MATE, T_MATE + 0.25)) * (1 - eInOut(tramo(t, 5.3, 5.6)));
      manoI = mezcla(manoI, [-14, 40], k); manoD = mezcla(manoD, [96, 40], k);
    }
    // se bebe un peón
    if (t > 5.3) {
      const kB = eInOut(tramo(t, 5.35, 5.7)), kU = eInOut(tramo(t, 5.75, T_BEBE)), kD = eInOut(tramo(t, 6.95, 7.25)), kV = eInOut(tramo(t, 7.3, 7.6)), kF = eInOut(tramo(t, 7.6, 7.9));
      const trago = eInOut(tramo(t, T_BEBE, 6.9)) * (1 - kD);
      pose.rc = -0.34 * trago;
      ang = -1.5 * trago - 0.3 * kU * (1 - kD);
      const b = boca(pose.rc), alto = 42 * 1.05 / ESC, tope = rot2([0, -alto], ang);
      const enBoca = [b[0] - tope[0] + 1, b[1] - tope[1] - 4];
      const vaso = aU([peon[0], peon[1] - 6]), kT = eInOut(tramo(t, T_BEBE, T_BEBE + 0.25));
      manoD = mezcla(manoD, vaso, kB);
      manoD = mezcla(manoD, [80, 96], kU);
      manoD = mezcla(manoD, enBoca, kT);
      manoD = mezcla(manoD, [80, 96], kD);
      manoD = mezcla(manoD, vaso, kV);
      manoD = mezcla(manoD, [74, 150], kF);
      if (t > 5.7 && t < 7.6) lleva = "peon";
      if (t > T_BEBE && t < 6.95) pose.cara = "dormido";
      else if (t > 6.95 && t < 7.4) pose.cara = "risa";
      else if (t >= 7.4) { pose.cara = "guino"; pose.rc = 0.08; }
      if (t > 7.75) manoI = mezcla([6, 150], [24, 104], eOut(tramo(t, 7.75, 8.0)));
    }
    pose.manoD = manoD; pose.manoI = manoI;
    if (lleva === "peon") {
      const nivel = 1 - tramo(t, T_BEBE + 0.1, 6.85);
      pose.objD2 = (g, m) => { g.save(); g.translate(m[0], m[1] + 8); g.rotate(ang); g.scale(1 / ESC, 1 / ESC); cana(g, 1.05, nivel); g.restore(); };
    }
    return { pose, m: matAv(X, AY, ESC), lleva };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("lanza", t > T_LANZA, () => { const e = this.estado(), q = aPant(e.m, e.pose.manoD); this.salida = [q[0] + 2, q[1] + 16]; temblar(4, 0.1); });
    this.una("toc", t > T_CAE, () => {
      const q = casilla(6, 7); temblar(10, 0.25);
      for (let i = 0; i < 12; i++) p.nueva(P.ESPUMA, q[0], q[1] - 60, azar(-140, 140), azar(-280, -80), azar(0.4, 0.7), azar(4, 8));
      this.textos.push({ s: "¡TOC!", x: q[0] + 70, y: q[1] - 90, t0: t, tam: 50 });
    });
    this.una("clic", t > T_CAE + 0.25, () => { temblar(5, 0.12); this.textos.push({ s: "¡CLIC!", x: RELOJ[0] + 70, y: RELOJ[1] - 50, t0: t, tam: 40 }); });
    this.una("mate", t > T_MATE, () => {
      temblar(22, 0.55);
      const q = casilla(1, 7);
      p.nueva(P.DESTELLO, q[0], q[1] - 30, 0, 0, 0.45, 220);
      for (let i = 0; i < 30; i++) { const a = azar(-Math.PI, 0), v = azar(200, 600); p.nueva(P.CHISPA, q[0], q[1] - 30, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(8, 14)); }
      for (let i = 0; i < 140; i++) p.nueva(P.CONFETI, azar(0, W), azar(-260, -10), azar(-60, 60), azar(40, 140), azar(4, 6), azar(9, 15), (Math.random() * 5) | 0);
    });
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.32; g.drawImage(BLOB2.oroClaro, 130, 100, 764, 560); g.restore();
    pintarAvatar(g, e.m, e.pose, t);
    g.drawImage(this.mesa, 0, 0);
    // reloj de ajedrez
    this.reloj(g, t);
    // la mano derecha, cuando toca la mesa, se pinta otra vez por encima (recortada)
    const md = aPant(e.m, e.pose._manoD || e.pose.manoD);
    if (md[1] > 352) { g.save(); g.beginPath(); g.arc(md[0], md[1] - 4, 36, 0, Math.PI * 2); g.clip(); pintarAvatar(g, e.m, e.pose, t); g.restore(); }
    // piezas (de atrás adelante)
    const lista = [];
    for (const pz of this.piezas) {
      if (pz.tipo === "dama" && t > 2.3) continue;
      if (pz.bebe && t > 5.7 && t < 7.6) continue;
      lista.push(pz);
    }
    if (t > T_CAE) lista.push({ tipo: "dama", c: 6, r: 7 });
    lista.sort((a, b) => a.r - b.r);
    for (const pz of lista) {
      const [x, y, s] = casilla(pz.c, pz.r);
      g.fillStyle = "rgba(0,0,0,.3)"; g.beginPath(); g.ellipse(x + 3, y + 1, 14 * s, 4.5 * s, 0, 0, 6.283); g.fill();
      g.save(); g.translate(x, y);
      if (pz.tipo === "cana") cana(g, s, pz.bebe && t > 7.6 ? 0 : 1);
      else if (pz.tipo === "jarra") { g.scale(s * 1.25, s * 1.25); dibujarJarra(g, [-14, -18], 0, 1, "asa", t); dibujarJarra(g, [-14, -18], 0, 1, "cuerpo", t); g.save(); g.translate(2, -40); corona(g, 22); g.restore(); }
      else if (pz.tipo === "dama") { const k = t - T_CAE, sq = k > 0 ? 1 - 0.12 * Math.exp(-k * 12) * Math.cos(k * 40) : 1; g.scale(1, sq); tubo(g, s); }
      else if (pz.tipo === "chupito") chupito(g, s, false);
      else if (pz.tipo === "rey") this.rey(g, s, t);
      g.restore();
    }
    // la dama en la mano y volando
    if (e.lleva === "dama") { g.save(); g.translate(md[0] + 2, md[1] + 16); tubo(g, 1.1); g.restore(); }
    if (t > T_LANZA && t < T_CAE) {
      const u = tramo(t, T_LANZA, T_CAE), a = this.salida || [md[0] + 2, md[1] + 14], b = casilla(6, 7);
      const x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], eIn(u) * 0.4 + u * 0.6) - Math.sin(u * Math.PI) * 170;
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5; g.drawImage(BLOB2.oroClaro, x - 40, y - 80, 80, 90); g.restore();
      g.save(); g.translate(x, y); tubo(g, lerp(1.1, b[2], u)); g.restore();
    }
    this.p.dibujar(g);
    for (const o of this.textos) {
      const s = t - o.t0; if (s > 0.85) continue;
      const k = eBack(tramo(s, 0, 0.14));
      g.save(); g.translate(o.x, o.y - s * 14); g.rotate(-0.1); g.scale(k, k);
      txt(g, o.s, 0, 0, { tam: o.tam, peso: 400, fam: FC, color: "#fffdf5", borde: "#3a2400", bordeAncho: 8, alfa: 1 - tramo(s, 0.65, 0.85), esp: 2 });
      g.restore();
    }
    // ¡JAQUE MATE!
    if (t > T_MATE + 0.05) {
      const d = t - T_MATE - 0.05, k = tramo(d, 0, 0.17), s = lerp(2.6, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 8));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(470, 112); g.rotate(-0.05); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0, 0.45), tramo(t, this.dur - 0.6, this.dur - 0.04));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  /** El rey de chupito: tiembla, se cae y pierde la corona. */
  rey(g, s, t) {
    const tr = t > T_CAE + 0.1 && t < T_MATE ? Math.sin(t * 45) * 0.05 * tramo(t, T_CAE + 0.1, T_MATE) : 0;
    const k = eIn(tramo(t, T_MATE - 0.22, T_MATE)), rebote = t > T_MATE ? 0.12 * Math.exp(-(t - T_MATE) * 9) * Math.abs(Math.sin((t - T_MATE) * 30)) : 0;
    const ang = -(Math.PI / 2) * k + rebote + tr;
    // charco
    if (t > T_MATE) { const c = eOut(tramo(t, T_MATE, T_MATE + 0.6)); g.fillStyle = "rgba(90,30,8,.75)"; g.beginPath(); g.ellipse(-30 * s, 2, 26 * s * c, 6 * s * c, 0, 0, 6.283); g.fill(); }
    g.save(); g.translate(-9 * s, 0); g.rotate(ang); g.translate(9 * s, 0); chupito(g, s, true);
    if (t < T_MATE) { g.save(); g.translate(0, -36 * s); corona(g, 20 * s); g.restore(); }
    g.restore();
    if (t >= T_MATE) {
      // la corona sale rodando
      const d = t - T_MATE, x = -40 * s - 150 * d, y = -30 * s - 300 * d + 900 * d * d;
      g.save(); g.translate(x, Math.min(y, -4)); g.rotate(-d * 9); corona(g, 20 * s); g.restore();
    }
  }
  reloj(g, t) {
    const [x, y] = RELOJ, pulsa = t > T_CAE + 0.25 && t < T_CAE + 0.45 ? 4 : 0;
    g.save(); g.translate(x, y);
    g.fillStyle = "#1d1d22"; rectR(g, -46, -34, 92, 40, 7); g.fill();
    g.fillStyle = "#2c2c33"; rectR(g, -46, -34, 92, 8, 4); g.fill();
    for (const [cx, an] of [[-22, t * 3], [22, -t * 0.5]]) {
      g.fillStyle = "#fffdf5"; g.beginPath(); g.arc(cx, -12, 13, 0, 6.283); g.fill();
      g.strokeStyle = "#111"; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, -12); g.lineTo(cx + Math.sin(an) * 9, -12 - Math.cos(an) * 9); g.stroke();
    }
    g.fillStyle = "#c4161c"; rectR(g, -30, -42 + (t > T_CAE + 0.25 ? 4 : 0) - pulsa * 0, 16, 7, 2); g.fill();
    g.fillStyle = "#c4161c"; rectR(g, 14, -42 + (t > T_CAE + 0.25 ? 0 : 4), 16, 7, 2); g.fill();
    g.restore();
  }
  titulo() {
    if (this._tit) return this._tit;
    const c = lienzoNuevo(760, 210), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 50, 0, 150);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡JAQUE MATE!", 380, 150, { tam: 128, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 12, esp: 4, glow: "rgba(255,190,40,.85)", glowTam: 26, max: 720 });
    return (this._tit = c);
  }
}

registrar({ id: "00089", nombre: "Ajedrez de cañas", crear: () => new Ajedrez() });
})();
