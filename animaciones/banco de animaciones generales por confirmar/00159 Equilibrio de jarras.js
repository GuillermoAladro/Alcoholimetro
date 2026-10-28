"use strict";
/*
 * 00159 · EQUILIBRIO DE JARRAS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Delante de la barra, Guillermo y Marcos cogen jarras vacías y las lanzan de una en una a su cabeza: la torre crece
 * (1, 2, 3, 4…). La de Guillermo se tambalea cada vez más (¡QUE NO SE CAIGA!) y se viene abajo: coge dos al vuelo, otra
 * le cae en la cabeza boca abajo (¡PLONC!) y la cuarta la caza Marcos sin mirar… y la pone en su torre: ¡cinco!
 */
(() => {
const ESC = 1.3, XG = 300, XM = 724, BARRA = 430, DUR = 10.2, T_APAGA = 9.6;
const JS = 0.92, JH = 36 * JS;                         // escala y alto de una jarra en la torre (px)
const TG = [0.65, 1.55, 2.45, 3.35], TM = TG.map((t) => t + 0.22);
const AGARRA = 0.22, SUELTA = 0.42, ATERRIZA = 0.75;  // tiempos de cada turno (desde que empieza)
const T_TIT = 4.15, T_CAE = 5.1, T_PASA = 6.1, T_CINCO = 6.45;
const PILA = [[[228, 376], [196, 376], [228, 412], [196, 412]], [[796, 376], [828, 376], [796, 412], [828, 412]]];
// la torre de Guillermo se cae: a dónde va cada jarra (0 = la de abajo)
const CAIDA = [
  { lle: 5.85, a: "cabeza", alto: 70, giro: Math.PI * 3 },
  { lle: 5.7, a: "manoI", alto: 90, giro: -Math.PI * 2 },
  { lle: 5.55, a: "manoD", alto: 60, giro: Math.PI * 2 },
  { lle: 5.75, a: "marcos", alto: 120, giro: Math.PI * 4 },
];
const CT = cacheTexto();
const aU = (X, Y, q) => [(q[0] - X) / ESC + 39, (q[1] - Y) / ESC + 232];

/** Jarra vacía centrada en (cx, cy) (px), girada `ang`; espejo: el asa a la derecha. */
function jarra(g, cx, cy, ang, s = JS, espejo = false) {
  g.save(); g.translate(cx, cy); g.rotate(ang); g.scale(espejo ? -s : s, s); g.translate(-17, 0);
  dibujarJarra(g, [0, 0], 0, 0, "asa", 0);
  dibujarJarra(g, [0, 0], 0, 0, "cuerpo", 0);
  g.fillStyle = "rgba(225,240,255,.55)"; rectR(g, 4.5, 11.5, 25, 6, 2); g.fill();   // culo grueso del cristal
  g.fillStyle = "rgba(255,255,255,.8)"; g.fillRect(6, 12.5, 22, 1.4);
  g.restore();
}

class EquilibrioJarras extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(300);
    // vuelos de la caída: de la torre a las manos / la cabeza
    this.caida = CAIDA.map((c, i) => {
      const T = this.torre(0, T_CAE - 1e-3)[i];
      return Object.assign({ S: [T.cx, T.cy], a0: T.ang }, c);
    });
    for (const c of this.caida) { const d = this.destino(c, c.lle); c.E = d.p; c.a1 = d.ang; }
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** Cuántas jarras tiene cada uno en la cabeza. */
  cuenta(q, t) {
    if (q === 0) return t >= T_CAE ? 0 : TG.filter((t0) => t >= t0 + ATERRIZA).length;
    return TM.filter((t0) => t >= t0 + ATERRIZA).length + (t >= T_CINCO ? 1 : 0);
  }
  /** Cuánto se balancea la torre. */
  vaiven(q, t) {
    if (q === 1) return (0.012 + 0.006 * this.cuenta(1, t)) * Math.sin(t * 2.8 + 0.5);
    const n = this.cuenta(0, t);
    let A = [0, 0.02, 0.05, 0.085, 0.13][n];
    if (t > 4.1) A = lerp(0.13, 0.4, eIn(tramo(t, 4.1, T_CAE)));
    return A * Math.sin(t * 5 + 2.2 * Math.pow(Math.max(0, t - 2.8), 2));
  }
  /** Centro y ángulo de cada jarra de la torre (en la pantalla). */
  torre(q, t, n = this.cuenta(q, t)) {
    const e = this.poses(t)[q], R = avatar(e.pose.quien).rig, s = this.vaiven(q, t);
    const top = q ? [37, 10] : [39, 2];
    const r = rot2([top[0] - R.cuello[0], top[1] - R.cuello[1]], e.pose.rc);
    let P = aPant(e.m, [R.cuello[0] + r[0], R.cuello[1] + r[1]]);
    const base = e.pose.rc + e.giro, res = [];
    for (let i = 0; i < n; i++) {
      const ang = base + s * (0.5 + 0.55 * i);
      const d = rot2([0, -JH], ang), c = rot2([0, -JH / 2], ang);
      res.push({ cx: P[0] + c[0], cy: P[1] + c[1], ang });
      P = [P[0] + d[0], P[1] + d[1]];
    }
    return res;
  }
  /** Punto de llegada de una jarra que se cae (centro y ángulo). */
  destino(c, t) {
    const e = this.poses(t);
    if (c.a === "cabeza") {
      const G = e[0], R = avatar().rig, r = rot2([0, -JH / 2 + 3], G.pose.rc + G.giro);
      const top = aPant(G.m, [R.cuello[0] + rot2([0, 2 - R.cuello[1]], G.pose.rc)[0], R.cuello[1] + rot2([0, 2 - R.cuello[1]], G.pose.rc)[1]]);
      return { p: [top[0] + r[0], top[1] + r[1]], ang: Math.PI + G.pose.rc };
    }
    if (c.a === "manoD") { const h = aPant(e[0].m, e[0].pose.manoD); return { p: [h[0] + 17, h[1]], ang: 0 }; }
    if (c.a === "manoI") { const h = aPant(e[0].m, e[0].pose.manoI); return { p: [h[0] - 17, h[1]], ang: 0 }; }
    const h = aPant(e[1].m, e[1].pose.manoI); return { p: [h[0] - 17, h[1]], ang: 0 };
  }
  /** Mano que coge de la pila y lanza a la cabeza. */
  manoTurno(q, t, reposo) {
    const T0 = q ? TM : TG;
    for (let i = 0; i < T0.length; i++) {
      const t0 = T0[i];
      if (t < t0 || t > t0 + 0.85) continue;
      const pila = aU(q ? XM : XG + this.dx(t), PIES, [PILA[q][i][0], PILA[q][i][1] - 8]);
      const arriba = q ? [58, 38] : [16, 18];
      let p = mezcla(reposo, pila, eInOut(tramo(t, t0, t0 + AGARRA)));
      p = mezcla(p, arriba, eOut(tramo(t, t0 + AGARRA, t0 + SUELTA)));
      return { p: mezcla(p, reposo, eInOut(tramo(t, t0 + SUELTA + 0.05, t0 + 0.85))), lleva: t > t0 + AGARRA && t < t0 + SUELTA, i };
    }
    return { p: reposo, lleva: false, i: -1 };
  }
  dx(t) { return t < T_CAE ? -90 * this.vaiven(0, t) : 0; }
  poses(t = this.t) {
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "marcos", cara: "guino", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    const sG = this.vaiven(0, t);
    let giroG = 0, yG = 0;
    // Guillermo: con más de dos jarras abre los brazos para equilibrar
    const kBr = eInOut(tramo(t, 2.0, 2.5)) * (t < T_CAE ? 1 : 0);
    G.manoD = mezcla([70, 158], [108, 96 + 30 * sG], kBr);
    const restI = mezcla([9, 160], [-30, 96 - 30 * sG], kBr);
    const tg = this.manoTurno(0, t, restI);
    G.manoI = tg.p; G.brazoIDelante = tg.lleva;
    if (tg.lleva) G.objI = (g, m) => jarra(g, m[0] - 17 / ESC, m[1], 0, JS / ESC, true);
    if (t < T_CAE) {
      giroG = -0.25 * sG; G.rc = -0.5 * sG;
      if (t > 1.4 && t < 2.4) G.cara = "risa";
      if (t > 2.4) G.cara = "sonrisa";
      if (t > 3.3) G.cara = "dormido";
      if (t > 4.1) G.cara = "sorpresa";
      if (t > 4.1) { const a = andar(t * 13, 0.6 * tramo(t, 4.1, 4.4)); G.piernaI = a.piernaI; G.piernaD = a.piernaD; }
    } else {
      // se le cae todo: coge dos al vuelo
      const kD = eOut(tramo(t, T_CAE + 0.05, 5.5)), kI = eOut(tramo(t, T_CAE + 0.15, 5.65));
      G.manoD = mezcla([108, 96], [100, 74], kD); G.manoI = mezcla([-30, 96], [-26, 74], kI);
      const kB = eInOut(tramo(t, 6.4, 6.9));
      G.manoD = mezcla(G.manoD, [96, 116], kB); G.manoI = mezcla(G.manoI, [-20, 116], kB);
      if (t > 5.55) G.objD = (g, m) => jarra(g, m[0] + 17 / ESC, m[1], 0, JS / ESC);
      if (t > 5.7) G.objI = (g, m) => jarra(g, m[0] - 17 / ESC, m[1], 0, JS / ESC, true);
      G.cara = t < 5.85 ? "sorpresa" : t < 7.0 ? "borracho" : "risa";
      if (t > 5.85 && t < 6.05) yG = 8 * Math.sin(Math.PI * tramo(t, 5.85, 6.05));
      if (t > 7.0) G.rc = 0.08 * Math.sin((t - 7) * 3);
    }
    // Marcos: tranquilo, la mano de fuera lanza; la de dentro caza la jarra de Guillermo
    const tm = this.manoTurno(1, t, [67, 152]);
    M.manoD = tm.p;
    if (tm.lleva) M.objD = (g, m) => jarra(g, m[0] + 17 / ESC, m[1], 0, JS / ESC);
    M.rc = -0.15 * this.vaiven(1, t);
    if (t > 1.0 && t < 1.5) M.cara = "sonrisa";
    if (t > 4.1 && t < T_CAE) M.cara = "sonrisa";
    if (t > T_CAE) {
      const k = eOut(tramo(t, 5.4, 5.72));
      M.manoI = mezcla([6, 152], [-14, 84], k); M.brazoIDelante = true; M.cara = "guino"; M.rc = 0.06;
      const k2 = eOut(tramo(t, 5.85, T_PASA));
      M.manoI = mezcla(M.manoI, [16, 40], k2);
      if (t > 6.6) M.manoI = mezcla([16, 40], [-14, 46 + 4 * Math.sin(t * 7)], eOut(tramo(t, 6.6, 6.9)));
            if (t > 5.75 && t < T_PASA) M.objI = (g, m) => jarra(g, m[0] - 17 / ESC, m[1], 0, JS / ESC, true);
      if (t > T_CINCO) { M.cara = t > 8.6 ? "guino" : "risa"; M.rc = 0.05 * Math.sin((t - T_CINCO) * 3); }
    }
    return [
      { pose: G, m: matAv(XG + this.dx(t), PIES + yG, ESC, giroG), giro: giroG },
      { pose: M, m: matAv(XM, PIES, ESC), giro: 0 },
    ];
  }
  /** Jarras en el aire: las que lanzan a la cabeza y las de la caída. */
  volando(t) {
    const res = [];
    for (const q of [0, 1]) (q ? TM : TG).forEach((t0, i) => {
      const t1 = t0 + SUELTA, t2 = t0 + ATERRIZA;
      if (t < t1 || t >= t2) return;
      const e = this.poses(t1)[q], h = aPant(e.m, q ? [58, 38] : [16, 18]);
      const S = [h[0] + (q ? 17 : -17), h[1]], E = this.torre(q, t2, i + 1)[i];
      const u = (t - t1) / (t2 - t1);
      res.push({ x: lerp(S[0], E.cx, u), y: lerp(S[1], E.cy, u) - 4 * 70 * u * (1 - u), ang: lerp(0, E.ang + (q ? 2 : -2) * Math.PI, eOut(u)), espejo: q === 0 });
    });
    if (t >= T_CAE) this.caida.forEach((c) => {
      if (t >= c.lle) return;
      const u = (t - T_CAE) / (c.lle - T_CAE), E = this.destino(c, t).p;
      res.push({ x: lerp(c.S[0], E[0], u), y: lerp(c.S[1], E[1], u) - 4 * c.alto * u * (1 - u), ang: lerp(c.a0, c.a1 + c.giro, u), espejo: c.a !== "manoD" });
    });
    // la que Marcos pasa a su torre
    if (t >= T_PASA && t < T_CINCO) {
      const e = this.poses(T_PASA), h = aPant(e[1].m, [16, 40]), S = [h[0] - 17, h[1]], E = this.torre(1, T_CINCO, 5)[4];
      const u = (t - T_PASA) / (T_CINCO - T_PASA);
      res.push({ x: lerp(S[0], E.cx, u), y: lerp(S[1], E.cy, u) - 4 * 80 * u * (1 - u), ang: lerp(0, E.ang + 2 * Math.PI, eOut(u)), espejo: true });
    }
    return res;
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    for (const q of [0, 1]) (q ? TM : TG).forEach((t0, i) => this.una(`a${q}${i}`, t > t0 + ATERRIZA, () => {
      const T = this.torre(q, t, i + 1)[i];
      temblar(3, 0.1);
      for (let k = 0; k < 8; k++) { const a = azar(-Math.PI, 0), v = azar(80, 200); p.nueva(P.CHISPA, T.cx, T.cy + 16, Math.cos(a) * v, Math.sin(a) * v, azar(0.2, 0.4), azar(5, 8)); }
    }));
    this.una("tit", t > T_TIT, () => temblar(10, 0.25));
    this.una("cae", t > T_CAE, () => {
      temblar(14, 0.35);
      for (let k = 0; k < 14; k++) p.nueva(P.POLVO, XG + azar(-50, 50), azar(120, 300), azar(-120, 120), azar(-60, 40), azar(0.4, 0.7), azar(30, 50));
    });
    this.una("plonc", t > 5.85, () => {
      temblar(10, 0.2);
      const c = this.destino(this.caida[0], 5.85).p;
      for (let k = 0; k < 14; k++) { const a = azar(-Math.PI, 0), v = azar(120, 300); p.nueva(P.CHISPA, c[0], c[1] - 10, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.5), azar(6, 10)); }
    });
    this.una("cinco", t > T_CINCO, () => {
      temblar(18, 0.4);
      const T = this.torre(1, t, 5)[4];
      p.nueva(P.DESTELLO, T.cx, T.cy, 0, 0, 0.4, 200);
      for (let k = 0; k < 90; k++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-90, -10), azar(-40, 40), azar(0, 120), azar(2.2, 3.4), azar(9, 15), k % 5);
    });
    p.suelo = () => PIES;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  /** La barra de atrás (se pinta una vez). */
  barra() {
    if (CT.has("barra")) return CT.get("barra");
    const c = lienzoNuevo(W + 120, H - BARRA + 70), g = c.getContext("2d");
    g.translate(60, -BARRA + 10);
    const gr = g.createLinearGradient(0, BARRA, 0, H);
    gr.addColorStop(0, "#4a2a14"); gr.addColorStop(1, "#1c0f06");
    g.fillStyle = gr; g.fillRect(-60, BARRA + 8, W + 120, H - BARRA + 60);
    g.fillStyle = "rgba(0,0,0,.35)";
    for (let x = 40; x < W; x += 110) g.fillRect(x, BARRA + 16, 3, H - BARRA);
    g.fillStyle = "#8a5426"; g.fillRect(-60, BARRA - 6, W + 120, 16);
    g.fillStyle = "rgba(255,220,170,.4)"; g.fillRect(-60, BARRA - 6, W + 120, 3);
    g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(-60, BARRA + 10, W + 120, 5);
    CT.set("barra", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    foco(g, 300, 300, PIES, 190, 0.7); foco(g, 724, 724, PIES, 190, 0.7);
    g.drawImage(this.barra(), -60, BARRA - 10);
    // las pilas de jarras vacías en la barra
    for (const q of [0, 1]) {
      const T0 = q ? TM : TG;
      PILA[q].forEach((pp, i) => { if (t < T0[i] + AGARRA) jarra(g, pp[0], pp[1], 0, JS, q === 0); });
    }
    // suelo
    g.fillStyle = "rgba(0,0,0,.45)";
    for (const q of [0, 1]) { const x = aPant(e[q].m, [39, 232])[0]; g.beginPath(); g.ellipse(x, PIES + 2, 50, 9, 0, 0, 6.283); g.fill(); }
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    // las torres
    for (const q of [0, 1]) for (const T of this.torre(q, t)) jarra(g, T.cx, T.cy, T.ang, JS, q === 0);
    // la que le ha caído a Guillermo en la cabeza, boca abajo
    if (t >= this.caida[0].lle) { const d = this.destino(this.caida[0], t); jarra(g, d.p[0], d.p[1], d.ang, JS, true); }
    for (const v of this.volando(t)) jarra(g, v.x, v.y, v.ang, JS, v.espejo);
    g.restore();
    this.p.dibujar(g);
    // brillo y corona en la torre de cinco
    if (t > T_CINCO) {
      const T = this.torre(1, t, 5)[4], k = eBack(tramo(t, T_CINCO + 0.1, T_CINCO + 0.4));
      brillo(g, T.cx + 24, T.cy - 14, 26 * (0.6 + 0.4 * Math.sin(t * 6)), a);
      g.save(); g.globalAlpha = a; g.translate(T.cx + 2, T.cy - JH / 2 - 2); g.rotate(T.ang); g.scale(k, k); corona(g, 40); g.restore();
    }
    // cuenta de cada torre
    for (const q of [0, 1]) (q ? TM : TG).forEach((t0, i) => this.numero(g, t, t0 + ATERRIZA, String(i + 1), q, i + 1, a, false));
    this.numero(g, t, T_CINCO, "¡5!", 1, 5, a, true);
    // ¡NOOO! y ¡PLONC!
    if (t > T_CAE && t < 5.75) {
      const q = aPant(e[0].m, [60, 40]);
      g.save(); g.globalAlpha = a * (1 - tramo(t, 5.6, 5.75));
      bocadillo(g, q[0] + 130, q[1] + 40, "¡NOOO!", q[0] + 20, q[1] + 10, tramo(t, T_CAE, T_CAE + 0.2), 44);
      g.restore();
    }
    const dp = t - 5.85;
    if (dp > 0 && dp < 0.6) {
      const c = this.destino(this.caida[0], 5.85).p, k = eBack(tramo(dp, 0, 0.1));
      g.save(); g.translate(c[0] - 110, c[1] - 10); g.rotate(-0.15); g.scale(k, k);
      txt(g, "¡PLONC!", 0, 0, { tam: 50, peso: 400, fam: FC, color: "#e9fbff", borde: "#0a3d5c", bordeAncho: 8, esp: 2, alfa: a * (1 - tramo(dp, 0.45, 0.6)) });
      g.restore();
    }
    // ¡QUE NO SE CAIGA!
    if (t > T_TIT) {
      const d = t - T_TIT, k = tramo(d, 0, 0.18), s = lerp(2.4, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7));
      const tb = t < T_CAE ? 0.03 * Math.sin(t * 40) * tramo(t, 4.6, T_CAE) : 0;
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a;
      g.translate(512, 50); g.rotate(-0.02 + tb); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  /** Número que salta junto a la jarra de arriba al aterrizar. */
  numero(g, t, t0, s, q, n, a, grande) {
    const d = t - t0;
    if (d < 0 || d > (grande ? 99 : 0.7)) return;
    const T = this.torre(q, t0 + 0.001, n)[n - 1];
    if (!T) return;
    const k = eBack(tramo(d, 0, 0.12)), lado = q ? 1 : -1;
    g.save(); g.translate(T.cx + lado * (grande ? 78 : 54), T.cy + (grande ? 76 : 10 - Math.min(d, 0.7) * 20)); g.rotate(lado * 0.12); g.scale(k, k);
    txt(g, s, 0, 0, { tam: grande ? 66 : 40, peso: 400, fam: FC, color: grande ? "#ffd34d" : "#fffdf5", borde: grande ? "#3a2400" : "#1b1b1b", bordeAncho: 7, esp: 2, alfa: a * (grande ? 1 : 1 - tramo(d, 0.5, 0.7)) });
    g.restore();
  }
  titulo() {
    if (CT.has("tit")) return CT.get("tit");
    const c = lienzoNuevo(680, 120), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 15, 0, 100);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.45, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡QUE NO SE CAIGA!", 340, 88, { tam: 80, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 10, esp: 3, glow: "rgba(255,190,40,.8)", glowTam: 20, max: 640 });
    CT.set("tit", c);
    return c;
  }
}

registrar({ id: "00159", nombre: "Equilibrio de jarras", crear: () => new EquilibrioJarras() });
})();
