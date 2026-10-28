"use strict";
/*
 * 00205 · SALTO CON PÉRTIGA
 *
 * Animación del banco. Empieza y acaba en negro.
 * En la pista de atletismo, el listón es una barra de bar de verdad (con su grifo y sus jarras) colgada altísima.
 * Marcos coge carrerilla, clava la pértiga, sube cabeza abajo, pasa por encima y cae de pie en la colchoneta:
 * ¡QUÉ ALTURA! Guillermo lo intenta: la pértiga se dobla como un fideo, ¡BOING!, y sale disparado… por debajo de la
 * barra, hasta la colchoneta. Mira arriba, una jarra se tambalea, cae… y la coge al vuelo. Marcos se parte de risa.
 */
(() => {
const cache = cacheTexto();
const DUR = 10.6, ESC = 1.1, LP = 282, BOX = [640, PIES - 6], MAT = { x0: 640, x1: 1016, top: 505 };
const BARRA = { x0: 628, x1: 824, top: 122, bot: 178 };
const T_RUN_M = 0.7, T_PLANTA_M = 1.85, T_SUELTA_M = 2.3, T_CAE_M = 2.95, T_ARRIBA_M = 3.35;
const T_RUN_G = 4.0, T_PLANTA_G = 5.2, T_BOING = 5.65, T_CAE_G = 6.2, T_JARRA = 7.2, T_COGE = 7.75;
const PIV = [70, 40], XM_FIN = 966;
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
/** Catmull-Rom entre puntos con tiempos. */
function ruta(K, t) {
  if (t <= K[0][0]) return K[0][1];
  for (let i = 0; i < K.length - 1; i++) {
    if (t <= K[i + 1][0]) {
      const u = (t - K[i][0]) / (K[i + 1][0] - K[i][0]);
      const p0 = K[Math.max(0, i - 1)][1], p1 = K[i][1], p2 = K[i + 1][1], p3 = K[Math.min(K.length - 1, i + 2)][1];
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
      return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
    }
  }
  return K[K.length - 1][1];
}

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(640, 230), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 180);
  gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8a00");
  g.save(); g.translate(320, 115); g.transform(1, 0, -0.1, 1, 0, 0);
  txt(g, "¡QUÉ", 4, -14, { tam: 96, peso: 900, fam: FD, color: "#3a1a00", esp: 6 });
  txt(g, "¡QUÉ", 0, -20, { tam: 96, peso: 900, fam: FD, color: gr, borde: "#3a1a00", bordeAncho: 9, esp: 6, glow: "rgba(255,170,30,.85)", glowTam: 20 });
  txt(g, "ALTURA!", 5, 86, { tam: 112, peso: 900, fam: FD, color: "#3a1a00", esp: 6 });
  txt(g, "ALTURA!", 0, 80, { tam: 112, peso: 900, fam: FD, color: gr, borde: "#3a1a00", bordeAncho: 10, esp: 6, glow: "rgba(255,170,30,.85)", glowTam: 22 });
  g.restore();
  cache.set("t", c);
  return c;
}
function jarraSuelta(g, x, y, ang, s, nivel, t) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  dibujarJarra(g, [-17, 0], 0, nivel, "asa", t);
  dibujarJarra(g, [-17, 0], 0, nivel, "cuerpo", t);
  g.restore();
}
/** La pértiga: recta de A a B o doblada (curva). */
function pertiga(g, A, B, curva) {
  const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1;
  const c = [mx - (dy / L) * curva, my + (dx / L) * curva];
  g.lineCap = "round";
  g.strokeStyle = "#1a3a8a"; g.lineWidth = 7; g.beginPath(); g.moveTo(A[0], A[1]); g.quadraticCurveTo(c[0], c[1], B[0], B[1]); g.stroke();
  g.strokeStyle = "#5aa8ff"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(A[0], A[1]); g.quadraticCurveTo(c[0], c[1], B[0], B[1]); g.stroke();
}

class Pertiga extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(300);
    this.fondoC = null;
  }
  /** Carrera: posición x y si corre. */
  corre(t, t0, t1, x0, x1) { const u = tramo(t, t0, t1); return { x: lerp(x0, x1, u * u * 0.4 + u * 0.6), corriendo: t > t0 && t < t1 }; }
  /** Pose y pértiga de un saltador corriendo con la pértiga. */
  carrera(pose, m, t, tPlanta, t0) {
    pose.manoD = [76, 116]; pose.manoI = [40, 126]; pose.brazoIDelante = true;
    const H = aPant(m, [76, 116]);
    const k = eIn(tramo(t, t0, tPlanta));
    const tipLibre = [H[0] + LP * 0.92, H[1] - 70];
    const tip = mezcla(tipLibre, BOX, k);
    const d = [tip[0] - H[0], tip[1] - H[1]], L = Math.hypot(d[0], d[1]);
    const back = [H[0] - (d[0] / L) * (LP - L + 30), H[1] - (d[1] / L) * (LP - L + 30)];
    return { A: back, B: tip, curva: 0 };
  }
  marcos(t) {
    const pose = { quien: "marcos", cara: "guino", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let m, pert = null;
    const H0 = this.manoPlanta();
    if (t < T_PLANTA_M) {
      const c = this.corre(t, T_RUN_M, T_PLANTA_M, 200, H0[0] - (76 - 39) * ESC);
      let y = PIES;
      if (c.corriendo) { const a = andar(t * 17, 1.2); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; y += a.bote; }
      m = matAv(c.x, y, ESC);
      pert = this.carrera(pose, m, t, T_PLANTA_M, T_RUN_M);
      pose.cara = t < T_RUN_M ? "guino" : "sonrisa";
    } else if (t < T_ARRIBA_M) {
      // colgado de la pértiga y por encima de la barra
      let P, giro;
      const th0 = Math.atan2(H0[1] - BOX[1], H0[0] - BOX[0]), th1 = -Math.PI / 2 + 0.1;
      if (t < T_SUELTA_M) {
        const u = eInOut(tramo(t, T_PLANTA_M, T_SUELTA_M)), th = lerp(th0, th1, u);
        const L = LP - 46 * Math.sin(u * Math.PI);
        P = [BOX[0] + L * Math.cos(th), BOX[1] + L * Math.sin(th)];
        giro = Math.PI * 0.4 * eInOut(tramo(t, T_PLANTA_M + 0.05, T_SUELTA_M));
        pert = { A: BOX, B: P, curva: -60 * Math.sin(u * Math.PI) };
        pose.manoD = PIV; pose.manoI = [44, 42];
        pose.piernaI = [0, 0.1]; pose.piernaD = [0, -0.1];
        this._P1 = [BOX[0] + LP * Math.cos(th1), BOX[1] + LP * Math.sin(th1)];
      } else if (t < T_CAE_M) {
        // vuela por encima de la barra como un superhéroe y cae tumbado en la colchoneta
        const P1 = [BOX[0] + LP * Math.cos(th1), BOX[1] + LP * Math.sin(th1)];
        P = ruta([[T_SUELTA_M, P1], [2.6, [720, 50]], [T_CAE_M, [930, 488]]], t);
        giro = Math.PI * lerp(0.4, 0.5, eOut(tramo(t, T_SUELTA_M, 2.6)));
        pose.manoD = PIV; pose.manoI = [-6, 44];
        pose.piernaI = [-6, 0.15]; pose.piernaD = [-6, -0.15];
      } else {
        // bota y se levanta de un salto
        const d = t - T_CAE_M, u = eInOut(tramo(t, T_CAE_M + 0.1, T_ARRIBA_M));
        const de = [930, 488 - 16 * Math.abs(Math.sin(d * 14)) * Math.exp(-d * 8)], a = [XM_FIN + (PIV[0] - 39) * ESC, MAT.top - (232 - PIV[1]) * ESC];
        P = [lerp(de[0], a[0], u), lerp(de[1], a[1], u) - 40 * Math.sin(u * Math.PI)];
        giro = Math.PI * 0.5 * (1 - u);
        pose.manoD = PIV; pose.manoI = [-6, 44];
      }
      pose.cara = t < 2.45 ? "sorpresa" : "risa"; pose.puntas = 0.5;
      m = matAv(P[0], P[1], ESC, giro, 1, 1, PIV);
    } else {
      // en la colchoneta
      const d = t - T_ARRIBA_M;
      const bote = 22 * Math.abs(Math.sin(d * 9)) * Math.exp(-d * 6);
      const x = XM_FIN;
      const sy = 1 - 0.1 * Math.exp(-d * 6) * Math.abs(Math.cos(d * 9));
      m = matAv(x, MAT.top - bote, ESC, 0, 1, sy);
      pose.manoD = PIV; pose.manoI = [-6, 44]; pose.cara = "risa";
      if (t > 3.45) { const k = eOut(tramo(t, 3.45, 3.65)); pose.manoD = mezcla(PIV, [92, 26 + 6 * Math.sin(t * 12)], k); pose.manoI = mezcla([-6, 44], [-18, 26 - 6 * Math.sin(t * 12)], k); pose.cara = "risa"; }
      if (t > 4.15) { pose.manoD = [67, 152]; pose.manoI = [6, 152]; pose.cara = "guino"; }
      if (t > T_RUN_G && t < T_BOING) { pose.cara = "sorpresa"; pose.rc = -0.12; }
      if (t > T_BOING) {
        // se parte de risa
        pose.cara = "risa"; pose.rc = -0.1 + 0.06 * Math.sin(t * 14);
        pose.manoD = [58, 146 + 4 * Math.sin(t * 26)]; pose.manoI = [-26, 70 + 6 * Math.sin(t * 26)];
        if (t > T_COGE + 0.3) { const s = Math.sin(t * 22); pose.manoD = [48 + 6 * s, 112]; pose.manoI = [28 - 6 * s, 112]; }
      }
      m = matAv(x, MAT.top - bote, ESC, 0, 1, sy);
      this._xMfin = x;
    }
    return { pose, m, pert };
  }
  manoPlanta() { const th = Math.atan2(-235, -LP * 0.82); return [BOX[0] + LP * Math.cos(th), BOX[1] + LP * Math.sin(th)]; }
  guillermo(t) {
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let m, pert = null, jarra = false;
    const H0 = this.manoPlanta();
    if (t < T_RUN_G) {
      m = matAv(90, PIES, ESC);
      pose.cara = t < 1.9 ? "sonrisa" : t < 3.0 ? "sorpresa" : t < 3.6 ? "risa" : "guino";
      // su pértiga, de pie
      pose.manoD = [74, 120]; pose.manoI = [9, 160];
      if (t > 3.0 && t < 3.6) { const s = Math.sin(t * 22); pose.manoD = [50 + 6 * s, 112]; pose.manoI = [30 - 6 * s, 112]; }
      if (t > 3.6) pert = this.carrera(pose, m, T_RUN_G - 0.01, T_PLANTA_G, T_RUN_G);
      else { const H = aPant(m, [74, 120]); pert = { A: [H[0] + 6, H[1] + 50], B: [H[0] - 20, H[1] - 230], curva: 0 }; }
    } else if (t < T_PLANTA_G) {
      const c = this.corre(t, T_RUN_G, T_PLANTA_G, 90, H0[0] - (76 - 39) * ESC);
      let y = PIES;
      if (c.corriendo) { const a = andar(t * 15, 1.1); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; y += a.bote; }
      m = matAv(c.x, y, ESC);
      pert = this.carrera(pose, m, t, T_PLANTA_G, T_RUN_G);
      pose.cara = "guino";
    } else if (t < T_CAE_G) {
      let P, giro;
      if (t < T_BOING) {
        // la pértiga se dobla como un fideo
        const u = eOut(tramo(t, T_PLANTA_G, T_BOING));
        P = mezcla(H0, [BOX[0] - 60, PIES - 200], u);
        P[0] += 6 * Math.sin(t * 40) * u;
        giro = 0.3 * u;
        pert = { A: BOX, B: P, curva: -150 * u };
        pose.manoD = PIV; pose.manoI = [44, 42];
        pose.cara = "sorpresa";
      } else {
        // ¡BOING! sale disparado por debajo de la barra
        const u = tramo(t, T_BOING, T_CAE_G);
        const fin = this.tumbado(T_CAE_G);
        P = ruta([[T_BOING, [BOX[0] - 60, PIES - 200]], [5.92, [660, 380]], [T_CAE_G, aPant(fin, PIV)]], t);
        giro = lerp(0.3, -Math.PI / 2, eOut(u));
        pose.manoD = PIV; pose.manoI = [44, 70];
        pose.cara = "sorpresa"; pose.puntas = 0.8;
        pose.piernaI = [0, 0.2]; pose.piernaD = [0, -0.2];
      }
      m = matAv(P[0], P[1], ESC, giro, 1, 1, PIV);
    } else {
      // tumbado en la colchoneta; mira arriba y coge la jarra
      m = this.tumbado(t);
      pose.manoD = [130, 120]; pose.manoI = [-8, 150];
      pose.cara = t < T_JARRA ? "borracho" : t < T_COGE ? "sorpresa" : "risa";
      pose.rc = t < T_JARRA ? 0.15 * Math.sin(t * 3) : 0.3;
      if (t > T_JARRA) pose.manoD = [130, 110];
      if (t > T_COGE) { jarra = true; pose.jarra = { inc: Math.PI / 2 + 0.05 * Math.sin(t * 6), nivel: 0.85 }; }
    }
    return { pose, m, pert, jarra };
  }
  tumbado(t = 99) {
    const d = Math.max(0, t - T_CAE_G);
    const bote = 18 * Math.abs(Math.sin(d * 8)) * Math.exp(-d * 5);
    const x = 858 + 46 * eOut(Math.min(1, d / 0.5));
    return matAv(x, MAT.top - 8 - bote - 39 * ESC, ESC, -Math.PI / 2, 1, 1, [39, 232]);
  }
  /** La jarra que se cae de la barra. */
  jarraCae(t) {
    const J0 = [774, BARRA.top - 26];
    if (t < T_JARRA) return { p: J0, ang: 0 };
    const eG = this.guillermo(T_COGE), mano = aPant(eG.m, [130, 110]);
    const fin = [mano[0] + 14, mano[1] - 30];
    if (t < T_JARRA + 0.35) return { p: J0, ang: 0.12 * Math.sin((t - T_JARRA) * 40) };
    const u = tramo(t, T_JARRA + 0.35, T_COGE);
    return { p: [lerp(J0[0], fin[0], u), lerp(J0[1], fin[1], u * u) - 40 * Math.sin(u * Math.PI)], ang: u * Math.PI * 2 };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("plantaM", t > T_PLANTA_M, () => { temblar(6, 0.15); for (let i = 0; i < 8; i++) p.nueva(P.POLVO, BOX[0], BOX[1], azar(-120, 120), azar(-120, -20), azar(0.4, 0.8), azar(18, 30)); });
    this.una("caeM", t > T_CAE_M, () => { temblar(10, 0.2); for (let i = 0; i < 30; i++) p.nueva(P.CONFETI, azar(600, 1000), azar(-60, -10), azar(-40, 40), azar(30, 120), azar(2.5, 4), azar(9, 15), i % 5); });
    this.una("plantaG", t > T_PLANTA_G, () => { temblar(6, 0.15); });
    this.una("boing", t > T_BOING, () => { temblar(14, 0.3); p.nueva(P.DESTELLO, BOX[0] - 40, PIES - 150, 0, 0, 0.3, 160); });
    this.una("caeG", t > T_CAE_G, () => { temblar(16, 0.35); for (let i = 0; i < 12; i++) p.nueva(P.POLVO, 760 + azar(-120, 120), MAT.top, azar(-160, 160), azar(-120, -20), azar(0.5, 0.9), azar(24, 40)); });
    this.una("coge", t > T_COGE, () => { temblar(6, 0.12); const j = this.jarraCae(T_COGE); p.nueva(P.DESTELLO, j.p[0], j.p[1], 0, 0, 0.3, 120); for (let i = 0; i < 8; i++) p.nueva(P.GOTA, j.p[0], j.p[1], azar(-120, 120), azar(-280, -80), azar(0.4, 0.7), azar(3, 5)); });
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, 300);
    gc.addColorStop(0, "#2a86e8"); gc.addColorStop(1, "#bfe6ff");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, 380);
    g.fillStyle = "rgba(255,255,255,.9)";
    for (const [x, y, s] of [[90, 60, 0.8], [470, 30, 0.6], [880, 260, 0.5]]) { g.beginPath(); g.arc(x, y, 26 * s, 0, 6.283); g.arc(x + 30 * s, y - 12 * s, 32 * s, 0, 6.283); g.arc(x + 64 * s, y, 24 * s, 0, 6.283); g.rect(x, y - 4 * s, 64 * s, 24 * s); g.fill(); }
    // grada con público (puntitos)
    g.fillStyle = "#3a4250"; g.beginPath(); g.moveTo(-60, 300); g.lineTo(W + 60, 300); g.lineTo(W + 60, 430); g.lineTo(-60, 430); g.fill();
    const r = semilla(205);
    for (let fila = 0; fila < 5; fila++) for (let x = -50; x < W + 60; x += 22) {
      const y = 316 + fila * 24 + r() * 4;
      g.fillStyle = CONFETI[(r() * 5) | 0]; g.globalAlpha = 0.75; g.beginPath(); g.arc(x + r() * 8, y, 7, 0, 6.283); g.fill();
      g.fillStyle = "#f0c8a0"; g.globalAlpha = 0.8; g.beginPath(); g.arc(x + 2 + r() * 4, y - 9, 5, 0, 6.283); g.fill();
    }
    g.globalAlpha = 1;
    g.fillStyle = "#2a2e36"; g.fillRect(-60, 296, W + 120, 8);
    // césped y pista
    g.fillStyle = "#3a9a34"; g.fillRect(-60, 430, W + 120, 40);
    const gp = g.createLinearGradient(0, 470, 0, H + 60);
    gp.addColorStop(0, "#c8462a"); gp.addColorStop(1, "#8a2a16");
    g.fillStyle = gp; g.fillRect(-60, 470, W + 120, H);
    g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = 3;
    for (const y of [490, 530, 585]) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    // cajetín
    g.fillStyle = "#555"; g.beginPath(); g.moveTo(BOX[0] - 26, PIES - 2); g.lineTo(BOX[0] + 6, PIES - 2); g.lineTo(BOX[0], PIES + 8); g.lineTo(BOX[0] - 20, PIES + 8); g.fill();
    this.fondoC = c;
    return c;
  }
  barra(g, t) {
    const B = BARRA;
    // postes
    for (const [x, w] of [[B.x0 + 14, 9], [B.x1 - 14, 9]]) {
      const gp = g.createLinearGradient(x - w, 0, x + w, 0); gp.addColorStop(0, "#7a8088"); gp.addColorStop(0.5, "#f0f2f4"); gp.addColorStop(1, "#5a6068");
      g.fillStyle = gp; g.fillRect(x - w / 2, B.bot - 4, w, MAT.top - B.bot + 4);
    }
    // la barra de bar
    const gm = g.createLinearGradient(0, B.top, 0, B.bot);
    gm.addColorStop(0, "#a8682a"); gm.addColorStop(1, "#5a3010");
    g.fillStyle = gm; g.fillRect(B.x0, B.top + 6, B.x1 - B.x0, B.bot - B.top - 6);
    g.strokeStyle = "rgba(40,20,5,.5)"; g.lineWidth = 1.5;
    for (let x = B.x0 + 20; x < B.x1; x += 20) { g.beginPath(); g.moveTo(x, B.top + 8); g.lineTo(x, B.bot); g.stroke(); }
    g.fillStyle = "#d8a060"; g.fillRect(B.x0 - 8, B.top, B.x1 - B.x0 + 16, 8);
    g.fillStyle = "#ffd34d"; g.fillRect(B.x0, B.bot - 8, B.x1 - B.x0, 3);
    // grifo
    g.fillStyle = "#c8ccd4"; g.fillRect(664, B.top - 42, 8, 42); g.fillRect(664, B.top - 42, 22, 7); g.fillRect(680, B.top - 38, 6, 12);
    g.fillStyle = "#e8283a"; rectR(g, 662, B.top - 62, 12, 22, 4); g.fill();
    // jarras
    jarraSuelta(g, 722, B.top - 26, 0, 1.3, 0.9, t);
  }
  colchoneta(g) {
    const gr = g.createLinearGradient(0, MAT.top, 0, PIES + 8);
    gr.addColorStop(0, "#4a8aff"); gr.addColorStop(1, "#1a4ab0");
    g.fillStyle = gr; rectR(g, MAT.x0, MAT.top, MAT.x1 - MAT.x0, PIES + 8 - MAT.top, 10); g.fill();
    g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(MAT.x0 + 8, MAT.top + 6, MAT.x1 - MAT.x0 - 16, 6);
    g.strokeStyle = "rgba(0,0,40,.3)"; g.lineWidth = 2; g.beginPath(); g.moveTo(MAT.x0 + 140, MAT.top + 4); g.lineTo(MAT.x0 + 140, PIES + 6); g.stroke();
  }
  dibujar(g) {
    const t = this.t, eM = this.marcos(t), eG = this.guillermo(t);
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    this.colchoneta(g);
    this.barra(g, t);
    // la jarra que se cae (antes de cogerla)
    if (t < T_COGE) { const j = this.jarraCae(t); jarraSuelta(g, j.p[0], j.p[1], j.ang, 1.3, 0.9, t); }
    // pértigas (la de Marcos cae al soltarla)
    if (eM.pert) pertiga(g, eM.pert.A, eM.pert.B, eM.pert.curva);
    else if (t < T_RUN_G) {
      const u = eIn(tramo(t, T_SUELTA_M, T_SUELTA_M + 0.6)), th = lerp(-Math.PI / 2 + 0.1, -Math.PI + 0.02, u);
      pertiga(g, BOX, [BOX[0] + LP * Math.cos(th), BOX[1] + LP * Math.sin(th)], 0);
    }
    if (eG.pert) pertiga(g, eG.pert.A, eG.pert.B, eG.pert.curva);
    else if (t > T_BOING) {
      const u = eOut(tramo(t, T_BOING, T_BOING + 0.4)), uc = eIn(tramo(t, 6.3, 6.9));
      const th = lerp(lerp(-Math.PI / 2 - 0.4, -Math.PI / 2 + 0.05, u) + 0.2 * Math.sin((t - T_BOING) * 18) * Math.exp(-(t - T_BOING) * 3), -Math.PI + 0.03, uc);
      pertiga(g, BOX, [BOX[0] + LP * Math.cos(th), BOX[1] + LP * Math.sin(th)], 0);
    }
    else if (t >= T_RUN_G) { /* la lleva en las manos */ }
    // sombras
    g.fillStyle = "rgba(0,0,0,.25)";
    const pm = aPant(eM.m, [39, 232]), pg = aPant(eG.m, [39, 232]);
    if (t < T_PLANTA_M || t > T_ARRIBA_M) { g.beginPath(); g.ellipse(pm[0], (t > T_ARRIBA_M ? MAT.top : PIES) + 4, 46, 8, 0, 0, 6.283); g.fill(); }
    if (t < T_PLANTA_G) { g.beginPath(); g.ellipse(pg[0], PIES + 4, 46, 8, 0, 0, 6.283); g.fill(); }
    pintarAvatar(g, eM.m, eM.pose, t);
    pintarAvatar(g, eG.m, eG.pose, t);
    this.p.dibujar(g);
    // textos
    const grito = (s, x, y, t0, t1, tam, col, borde, rot = -0.08) => {
      if (t < t0 || t > t1) return;
      const k = eBack(tramo(t, t0, t0 + 0.15));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 3, alfa: 1 - tramo(t, t1 - 0.2, t1) });
      g.restore();
    };
    grito("¡BOING!", 470, 300, T_BOING, T_BOING + 0.8, 70, "#ffd34d", "#1a3a8a", 0.1);
    grito("¡PLAF!", 760, 430, T_CAE_G, T_CAE_G + 0.7, 52, "#fffdf5", "#3a3a3a");
    grito("¡TOMA!", 650, 330, T_COGE, T_COGE + 1.0, 52, "#ffd34d", "#4a1a00", 0.08);
    if (t > 2.55) {
      const d = t - 2.55, k = tramo(d, 0, 0.16), s = lerp(2.6, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 7));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(310, 150); g.rotate(-0.05); g.scale(s * 0.9, s * 0.9);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // iris
    const cF = aPant(eG.m, [39, 120]);
    const r = t < 1 ? 800 * eInOut(tramo(t, 0.02, 0.7)) : 800 * (1 - eInOut(tramo(t, DUR - 0.75, DUR - 0.04)));
    const cc = t < 1 ? [300, 380] : cF;
    if (r < 800) {
      g.save(); g.fillStyle = "#000"; g.beginPath(); g.rect(-60, -60, W + 120, H + 120);
      g.moveTo(cc[0] + Math.max(0, r), cc[1]); g.arc(cc[0], cc[1], Math.max(0, r), 0, 6.2832); g.fill("evenodd"); g.restore();
    }
  }
}

registrar({ id: "00205", nombre: "Salto con pértiga", crear: () => new Pertiga() });
})();
