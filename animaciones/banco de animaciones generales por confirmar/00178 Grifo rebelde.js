"use strict";
/*
 * 00178 · GRIFO REBELDE
 *
 * Animación del banco. Empieza y acaba en negro.
 * Marcos abre el grifo de cerveza y se vuelve loco: tiembla (¡BRRR!) y escupe chorros en arco. El primero, a la cara
 * de Marcos. Guillermo grita ¡CIERRA! y corre de un lado a otro de la barra plantando jarras vacías justo donde cae
 * el chorro, mientras Marcos lucha colgado de la palanca. Al final la cierra (¡CLAC!) y las cinco jarras quedan
 * llenas y en fila, relucientes.
 */
(() => {
const ESC = 1.6, AY = 618, BARRA = 468;
const XM = 345;                                          // Marcos, junto al grifo
const TX = 430, PIV = [430, 358], LEV = 62, BOQ = [430, 404];   // grifo: palanca y boquilla
const SPOTS = [560, 650, 740, 830, 920];                 // dónde quedan las jarras (centro)
const ORDEN = [2, 0, 4, 1, 3];                           // el chorro va de un lado a otro
const T_BRR = 0.95, T_LOCO = 1.25, T_A0 = 1.8, PASO = 0.95, T_CLAC = 6.75, T_APAGA = 9.6, DUR = 10.15;
const A = ORDEN.map((_, i) => T_A0 + i * PASO);          // llega el chorro al sitio i
const SLAM = A.map((a) => a + 0.25);                     // Guillermo planta la jarra
const LLENA = A.map((a) => a + 0.85);                    // y se ha llenado
const XG0 = 760;
const xG = (cx) => cx - 27 - 37 * ESC;                   // Guillermo con la mano en el asa de la jarra cx
const CT = cacheTexto();
const aU = (X, q, dy = 0) => [(q[0] - X) / ESC + 39, (q[1] - AY - dy) / ESC + 232];

class Grifo extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(420);
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** Ángulo de la palanca (0 = cerrada, de pie). */
  palanca(t) {
    if (t < 0.55) return 0;
    if (t < T_BRR) return -0.55 * eOut(tramo(t, 0.55, 0.8));
    if (t < T_CLAC - 0.35) {
      const k = tramo(t, T_BRR, T_LOCO);
      return -0.55 + k * (0.5 * Math.sin(t * 11) + 0.28 * Math.sin(t * 17.3));
    }
    const k = eIn(tramo(t, T_CLAC - 0.35, T_CLAC));
    const v = -0.55 + 0.5 * Math.sin((T_CLAC - 0.35) * 11) + 0.28 * Math.sin((T_CLAC - 0.35) * 17.3);
    if (t < T_CLAC) return lerp(v, -0.2, k);
    return 0.12 * Math.exp(-(t - T_CLAC) * 7) * Math.sin((t - T_CLAC) * 40);
  }
  agarre(t) { const r = rot2([0, -LEV], this.palanca(t)); return [PIV[0] + r[0], PIV[1] + r[1]]; }
  /** Adónde apunta el chorro: { x, y, alto } o null si no sale. */
  chorro(t) {
    if (t < T_LOCO || t > T_CLAC) return null;
    const cara = [XM - 2 * ESC + this.dxM(t), AY + (62 - 232) * ESC + this.dyM(t)];
    const sitio = (i) => [SPOTS[ORDEN[i]], 414];
    if (t < 1.55) return { x: cara[0], y: cara[1], alto: 50 };
    if (t < T_A0) { const u = eInOut(tramo(t, 1.55, T_A0)), s = sitio(0); return { x: lerp(cara[0], s[0], u), y: lerp(cara[1], s[1], u) + Math.sin(u * Math.PI) * 50, alto: lerp(50, 120, u) }; }
    for (let i = 0; i < A.length; i++) {
      if (t < LLENA[i]) { const s = sitio(i); return { x: s[0], y: s[1], alto: 120 }; }
      if (i < A.length - 1 && t < A[i + 1]) {
        const u = eInOut(tramo(t, LLENA[i], A[i + 1])), s0 = sitio(i), s1 = sitio(i + 1);
        return { x: lerp(s0[0], s1[0], u), y: lerp(s0[1], s1[1], u) + Math.sin(u * Math.PI) * 50, alto: 120 + Math.sin(u * Math.PI) * 60 };
      }
    }
    // la última: se vuelve loco hacia arriba
    const u = tramo(t, LLENA[A.length - 1], T_CLAC);
    return { x: lerp(SPOTS[ORDEN[A.length - 1]], 640, u), y: lerp(414, BARRA - 6, u), alto: 120 + 160 * Math.sin(u * Math.PI) };
  }
  dxM(t) { return t > T_BRR && t < T_CLAC ? 0.6 * (this.agarre(t)[0] - 398) : 0; }
  dyM(t) {
    if (t > T_CLAC - 0.55 && t < T_CLAC + 0.2) return -60 * Math.sin(tramo(t, T_CLAC - 0.55, T_CLAC + 0.2) * Math.PI);
    return t > T_LOCO && t < T_CLAC ? -Math.abs(Math.sin(t * 8.5)) * 22 : 0;
  }
  /** Guillermo: x, dy (se agacha a coger otra jarra), si lleva jarra y si está plantándola. */
  gui(t) {
    let x = XG0, dy = 0, lleva = true, mano = null, corre = false;
    if (t < SLAM[0] - 0.45) return { x, dy, lleva, mano, corre: t > 1.5 };
    for (let i = 0; i < A.length; i++) {
      const xi = xG(SPOTS[ORDEN[i]]), xa = i ? xG(SPOTS[ORDEN[i - 1]]) : XG0;
      const sal = i ? SLAM[i - 1] + 0.42 : SLAM[0] - 0.45;
      if (t < SLAM[i] + 0.12) {
        // de la jarra anterior a esta: se agacha, coge otra y corre
        x = lerp(xa, xi, eInOut(tramo(t, sal, SLAM[i] - 0.05)));
        if (i && t < sal) { x = xa; dy = 70 * Math.sin(tramo(t, SLAM[i - 1] + 0.12, sal) * Math.PI); lleva = t > SLAM[i - 1] + 0.27; }
        corre = t > sal && t < SLAM[i] - 0.05;
        // planta la jarra: la mano baja al asa
        const k = eIn(tramo(t, SLAM[i] - 0.18, SLAM[i]));
        mano = k > 0 ? k : null;
        if (t > SLAM[i]) { lleva = false; mano = 1; }
        return { x, dy, lleva, mano, corre, i };
      }
    }
    // después de la última: se aparta un poco a mirar
    const xl = xG(SPOTS[ORDEN[A.length - 1]]);
    x = lerp(xl, 690, eInOut(tramo(t, SLAM[A.length - 1] + 0.3, SLAM[A.length - 1] + 0.9)));
    return { x, dy: 0, lleva: false, mano: t < SLAM[A.length - 1] + 0.3 ? 1 : null, corre: false, i: A.length };
  }
  poses() {
    const t = this.t;
    // ---- Marcos
    const M = { quien: "marcos", cara: "sonrisa", rc: 0.08, piernaI: [0, 0], piernaD: [0, 0] };
    const dxM = this.dxM(t), dyM = this.dyM(t), XMx = XM + dxM;
    const gr = aU(XMx, this.agarre(t), dyM);
    const kM = eInOut(tramo(t, 0.3, 0.55));
    M.manoD = mezcla([67, 152], [gr[0] - 2, gr[1] + 4], kM);
    M.manoI = [6, 152];
    let giroM = 0;
    if (t > 0.55 && t < T_BRR) { M.cara = "guino"; M.manoI = [-8, 110]; }
    if (t > T_BRR && t < T_LOCO) { M.cara = "sorpresa"; M.rc = 0.04 * Math.sin(t * 60); }
    if (t > T_LOCO && t < T_CLAC) {
      M.cara = t < 1.6 ? "dormido" : Math.sin(t * 3) > 0 ? "sorpresa" : "borracho";
      M.puntas = 0.8; M.rc = 0.15 * Math.sin(t * 9);
      M.brazoIDelante = true;
      const gr2 = aU(XMx, this.agarre(t), dyM);
      M.manoI = [gr2[0] - 8, gr2[1] + 12];
      giroM = 0.08 * Math.sin(t * 11);
    }
    if (t > T_CLAC - 0.55 && t < T_CLAC) { M.cara = "dormido"; M.piernaI = [-20, 0.3]; M.piernaD = [-20, -0.3]; }
    if (t >= T_CLAC) {
      M.puntas = 0.8 * (1 - tramo(t, T_CLAC + 0.5, T_CLAC + 1.2));
      M.cara = t < T_CLAC + 0.6 ? "sorpresa" : t < 8.3 ? "risa" : "guino";
      M.manoD = mezcla(M.manoD, [67, 152], eInOut(tramo(t, T_CLAC + 0.6, T_CLAC + 1)));
      M.manoI = mezcla([6, 152], [30, 52], eInOut(tramo(t, 7.6, 7.9)) * (1 - eInOut(tramo(t, 8.4, 8.7))));   // se limpia la espuma
      M.brazoIDelante = t > 7.5 && t < 8.7;
      M.rc = -0.12 * eInOut(tramo(t, T_CLAC + 0.6, T_CLAC + 1));
    }
    // espuma en la cara desde el primer chorro
    const esp = tramo(t, 1.3, 1.5) * (1 - tramo(t, 8.0, 8.6));
    if (esp > 0) {
      const rcM = M.rc;
      M.objD = (g) => {
        const R = avatar("marcos").rig;
        g.save(); g.translate(R.cuello[0], R.cuello[1]); g.rotate(rcM); g.translate(-R.cuello[0], -R.cuello[1]);
        g.globalAlpha *= esp;
        for (const [x, y, r] of [[30, 67, 5], [36, 70, 5.5], [43, 67, 5], [26, 62, 3.5], [48, 62, 3.5], [33, 74, 4], [40, 74, 4], [37, 77, 3.5], [24, 16, 4.5], [30, 11, 5], [37, 9, 5.5], [44, 12, 4.5], [50, 17, 3.5]]) g.drawImage(SPR.espuma, x - r, y - r, r * 2, r * 2);
        g.restore();
      };
    }
    // ---- Guillermo
    const Gs = this.gui(t);
    const G = { cara: "sonrisa", rc: -0.08, piernaI: [0, 0], piernaD: [0, 0] };
    let mD = [74, 100];
    if (Gs.mano != null && Gs.i != null) {
      const cx = SPOTS[ORDEN[Math.min(Gs.i, A.length - 1)]];
      const tgt = aU(Gs.x, [cx - 27, BARRA - 31], Gs.dy);
      mD = mezcla(mD, tgt, Gs.mano);
    }
    if (Gs.lleva) G.jarra = { inc: 0, nivel: 0 };
    G.manoD = mD; G.manoI = [9, 160];
    let giroG = 0, boteG = 0;
    if (Gs.corre) {
      const an = andar(t * 22, 1.3);
      G.piernaI = an.piernaI; G.piernaD = an.piernaD; boteG = an.bote;
      G.manoI = [0, 120 + 20 * Math.sin(t * 22)];
      giroG = 0.1 * Math.sign(Math.sin(t * 0.0001) + 1) * 0;
    }
    if (t > T_BRR && t < T_CLAC) {
      G.cara = "sorpresa"; G.rc = -0.06 + 0.05 * Math.sin(t * 13);
      if (t > 1.5 && t < 2.3) { G.manoI = [-6, 40]; G.brazoIDelante = false; }   // ¡CIERRA!
    }
    if (Gs.dy > 20) G.cara = "dormido";
    if (t >= T_CLAC) {
      G.cara = t < T_CLAC + 0.5 ? "sorpresa" : t < 8.6 ? "risa" : "guino";
      G.rc = -0.12 * eInOut(tramo(t, T_CLAC + 0.6, T_CLAC + 1));
      if (t > 7.9) { G.manoD = mezcla(mD, [96, 40], eOut(tramo(t, 7.9, 8.15))); }   // ¡toma ya!
    }
    return [
      { pose: M, m: matAv(XMx, AY + dyM, ESC, giroM) },
      { pose: G, m: matAv(Gs.x, AY + Gs.dy + boteG, ESC, giroG) },
    ];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("brr", t > T_BRR, () => temblar(6, 0.3));
    this.una("loco", t > T_LOCO, () => { temblar(14, 0.35); for (let i = 0; i < 14; i++) p.nueva(P.ESPUMA, BOQ[0], BOQ[1], azar(-200, 200), azar(-350, -100), azar(0.4, 0.8), azar(4, 8)); });
    this.una("cara", t > 1.32, () => { temblar(8, 0.2); const c = [XM, AY - 170 * ESC]; for (let i = 0; i < 16; i++) p.nueva(P.ESPUMA, c[0], c[1], azar(-220, 60), azar(-260, 0), azar(0.4, 0.7), azar(4, 9)); });
    SLAM.forEach((s, i) => this.una("slam" + i, t > s, () => {
      temblar(7, 0.15);
      const cx = SPOTS[ORDEN[i]];
      for (let k = 0; k < 8; k++) p.nueva(P.POLVO, cx + azar(-30, 30), BARRA - 4, azar(-80, 80), azar(-30, 0), azar(0.3, 0.5), azar(16, 26));
    }));
    LLENA.forEach((s, i) => this.una("llena" + i, t > s, () => {
      const cx = SPOTS[ORDEN[i]];
      p.nueva(P.DESTELLO, cx, 400, 0, 0, 0.3, 70);
      for (let k = 0; k < 6; k++) p.nueva(P.ESPUMA, cx + azar(-18, 18), 404, azar(-50, 50), azar(-120, -40), azar(0.3, 0.5), azar(3, 5));
    }));
    this.una("clac", t > T_CLAC, () => {
      temblar(18, 0.35);
      p.nueva(P.DESTELLO, PIV[0], PIV[1] - 40, 0, 0, 0.35, 140);
      for (let k = 0; k < 16; k++) { const a = azar(0, 6.283), v = azar(150, 360); p.nueva(P.CHISPA, PIV[0], PIV[1] - 50, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 10)); }
    });
    // las jarras brillan una a una
    for (let i = 0; i < 5; i++) this.una("brilla" + i, t > 7.25 + i * 0.18, () => {
      const cx = SPOTS[i];
      for (let k = 0; k < 6; k++) { const a = azar(-Math.PI, 0), v = azar(80, 200); p.nueva(P.CHISPA, cx, 405, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.5), azar(5, 8)); }
    });
    // salpicones donde cae el chorro
    const C = this.chorro(t);
    if (C) {
      const enJarra = this.jarraEn(t, C.x);
      const n = enJarra ? 5 : 22;
      if (Math.random() < n * dt) p.nueva(P.GOTA, C.x + azar(-10, 10), C.y - 4, azar(-160, 160), azar(-260, -80), 0.55, azar(3, 5));
      if (Math.random() < 10 * dt) p.nueva(P.ESPUMA, C.x + azar(-12, 12), C.y - 4, azar(-60, 60), azar(-120, -40), azar(0.3, 0.5), azar(3, 6));
      if (Math.random() < 5 * dt) p.nueva(P.ESPUMA, BOQ[0], BOQ[1], azar(-60, 60), azar(-60, 20), azar(0.3, 0.5), azar(3, 5));
    }
    // gota final
    this.una("plic", t > 8.25, () => p.nueva(P.GOTA, BOQ[0], BOQ[1] + 4, 0, 0, 0.5, 4));
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  /** ¿Hay una jarra puesta en ese sitio (ya plantada)? */
  jarraEn(t, x) {
    for (let i = 0; i < A.length; i++) if (t > SLAM[i] && Math.abs(SPOTS[ORDEN[i]] - x) < 20) return true;
    return false;
  }
  nivel(i, t) { return eInOut(tramo(t, SLAM[i], LLENA[i])); }
  fondoBar() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, "#0f0b08"); gr.addColorStop(1, "#22160c");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // pared de azulejos y estante con jarras vacías
    g.strokeStyle = "rgba(255,230,190,.06)"; g.lineWidth = 2;
    for (let y = 0; y < BARRA; y += 46) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    for (let y = 0; y < BARRA; y += 46) for (let x = (y / 46) % 2 ? 0 : 34; x < W; x += 68) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 46); g.stroke(); }
    g.fillStyle = "#3a2516"; g.fillRect(40, 236, W - 80, 9);
    g.fillStyle = "rgba(255,210,150,.25)"; g.fillRect(40, 236, W - 80, 2);
    for (let i = 0; i < 16; i++) {
      const x = 80 + i * 58;
      g.save(); g.translate(x - 14, 236 - 20); g.scale(0.95, 0.95);
      dibujarJarra(g, [0, 0], 0, 0, "asa", 0); dibujarJarra(g, [0, 0], 0, 0, "cuerpo", 0);
      g.restore();
    }
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.28;
    g.drawImage(BLOB2.oro, W / 2 - 520, 60, 1040, 380);
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    const v = g.createRadialGradient(W / 2, 300, 220, W / 2, 300, 700);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.8)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    return (this.cF = c);
  }
  barra(g) {
    if (!this.cB) {
      const c = lienzoNuevo(W, H - BARRA + 20), x = c.getContext("2d");
      const gr = x.createLinearGradient(0, 0, 0, c.height);
      gr.addColorStop(0, "#5a3218"); gr.addColorStop(1, "#1c0f08");
      x.fillStyle = gr; x.fillRect(0, 10, W, c.height);
      x.fillStyle = "rgba(0,0,0,.35)"; for (let i = 30; i < W; i += 96) x.fillRect(i, 26, 3, c.height);
      x.fillStyle = "#b8862d"; x.fillRect(0, 104, W, 8); x.fillStyle = "rgba(255,240,190,.55)"; x.fillRect(0, 105, W, 2);
      x.fillStyle = "#8a5426"; x.fillRect(0, 0, W, 18);
      x.fillStyle = "rgba(255,220,170,.45)"; x.fillRect(0, 0, W, 3);
      x.fillStyle = "rgba(0,0,0,.45)"; x.fillRect(0, 18, W, 5);
      this.cB = c;
    }
    g.drawImage(this.cB, 0, BARRA - 6);
    g.fillStyle = "#8a5426"; g.fillRect(-60, BARRA - 6, 60, 24); g.fillRect(W, BARRA - 6, 60, 24);
    g.fillStyle = "#1c0f08"; g.fillRect(-60, BARRA + 18, 60, H); g.fillRect(W, BARRA + 18, 60, H);
  }
  /** El grifo: columna cromada, cabezal, boquilla y palanca. */
  grifo(g, t) {
    const sh = t > T_BRR && t < T_CLAC ? azar(-2, 2) : 0;
    g.save(); g.translate(sh, 0);
    const cr = (x0, x1) => { const q = g.createLinearGradient(x0, 0, x1, 0); q.addColorStop(0, "#5d656e"); q.addColorStop(0.3, "#e9eef2"); q.addColorStop(0.45, "#ffffff"); q.addColorStop(0.7, "#8f99a3"); q.addColorStop(1, "#3c434a"); return q; };
    // palanca (detrás del cabezal)
    const ang = this.palanca(t);
    g.save(); g.translate(PIV[0], PIV[1]); g.rotate(ang);
    g.fillStyle = cr(-5, 5); g.fillRect(-4, -18, 8, 20);
    const gp = g.createLinearGradient(-9, 0, 9, 0); gp.addColorStop(0, "#111"); gp.addColorStop(0.4, "#4a4a4a"); gp.addColorStop(1, "#0a0a0a");
    g.fillStyle = gp; rectR(g, -9, -LEV - 8, 18, LEV - 8, 8); g.fill();
    g.fillStyle = "#ffd34d"; g.fillRect(-9, -LEV + 14, 18, 5);
    g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(-5, -LEV - 2, 3, LEV - 20);
    g.restore();
    // columna
    g.fillStyle = cr(TX - 17, TX + 17); g.fillRect(TX - 17, 372, 34, BARRA - 372);
    g.fillStyle = "#2b3036"; g.beginPath(); g.ellipse(TX, BARRA - 2, 30, 7, 0, 0, 6.283); g.fill();
    // cabezal
    g.fillStyle = cr(TX - 26, TX + 26); rectR(g, TX - 26, 346, 52, 30, 12); g.fill();
    g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = 1.5; rectR(g, TX - 26, 346, 52, 30, 12); g.stroke();
    // boquilla
    const bt = t > T_LOCO && t < T_CLAC ? Math.sin(t * 13) * 0.25 : 0;
    g.save(); g.translate(TX, 372); g.rotate(bt);
    g.fillStyle = cr(-6, 6); rectR(g, -6, 0, 12, 32, 4); g.fill();
    g.fillStyle = "#1a1d21"; g.beginPath(); g.ellipse(0, 31, 5, 2, 0, 0, 6.283); g.fill();
    g.restore();
    g.restore();
  }
  dibujarChorro(g, t) {
    const C = this.chorro(t);
    if (!C) return;
    const N = 22, pts = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, x = lerp(BOQ[0], C.x, u), y = lerp(BOQ[1], C.y, u) - 4 * C.alto * u * (1 - u);
      pts.push([x + Math.sin(t * 40 + i) * 1.5 * u, y]);
    }
    const linea = () => { g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); };
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    linea(); g.strokeStyle = "rgba(196,106,0,.95)"; g.lineWidth = 13; g.stroke();
    linea(); g.strokeStyle = "#ffc21f"; g.lineWidth = 8; g.stroke();
    linea(); g.strokeStyle = "rgba(255,245,200,.85)"; g.lineWidth = 2.5; g.stroke();
    // espumita a lo largo
    for (let i = 2; i < N; i += 3) { const q = pts[i], r = 3 + ((i * 7 + Math.floor(t * 20)) % 3); g.drawImage(SPR.espuma, q[0] - r, q[1] - r - 3, r * 2, r * 2); }
    g.restore();
  }
  jarras(g, t) {
    for (let i = 0; i < A.length; i++) {
      if (t < SLAM[i]) continue;
      const cx = SPOTS[ORDEN[i]], nv = this.nivel(i, t);
      const bote = t < SLAM[i] + 0.15 ? -Math.sin(tramo(t, SLAM[i], SLAM[i] + 0.15) * Math.PI) * 4 : 0;
      g.save(); g.translate(cx - 27, BARRA - 31 + bote); g.scale(ESC, ESC);
      dibujarJarra(g, [0, 0], 0, nv, "asa", t); dibujarJarra(g, [0, 0], 0, nv, "cuerpo", t);
      g.restore();
      if (nv >= 1) {
        // la espuma rebosa un poco
        g.drawImage(SPR.espuma, cx - 26, BARRA - 72, 18, 18); g.drawImage(SPR.espuma, cx + 6, BARRA - 74, 20, 20);
      }
      if (t > 7.25 + ORDEN[i] * 0) {
        const kb = tramo(t, 7.25 + (cx - 560) / 90 * 0.18, 7.6 + (cx - 560) / 90 * 0.18);
        if (kb > 0 && kb < 1) brillo(g, cx + 14, BARRA - 60, 26, Math.sin(kb * Math.PI));
      }
    }
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses();
    if (t < 0.1) { this.titulo(1); this.titulo(2); }      // los dos títulos con brillo, en el primer cuadro (negro)
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    g.drawImage(this.fondoBar(), 0, 0);
    foco(g, 560, 560, BARRA, 520, 0.55);
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    this.barra(g);
    this.grifo(g, t);
    this.jarras(g, t);
    this.dibujarChorro(g, t);
    g.restore();
    this.p.dibujar(g);
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: a * (1 - tramo(d, dur - 0.15, dur)) });
      g.restore();
    };
    ono("¡BRRR!", 520, 300, T_BRR, 0.5, 46, "#fffdf5", "#1b1b1b", -0.1);
    ono("¡FSSSH!", 150, 340, T_LOCO, 0.6, 50, "#ffd34d", "#3a2400", -0.12);
    SLAM.forEach((s, i) => ono("¡TOC!", SPOTS[ORDEN[i]] + 10, 352, s, 0.4, 36, "#fffdf5", "#1b1b1b", (i % 2 ? 0.12 : -0.12)));
    ono("¡CLAC!", 160, 330, T_CLAC, 0.8, 64, "#2fe3e8", "#06303a", -0.1);
    ono("plic", 470, 440, 8.45, 0.5, 30, "#ffd34d", "#3a2400", 0.1);
    // ¡CIERRA!: lo grita Guillermo y se queda
    if (t > 1.5) {
      const d = t - 1.5, k = tramo(d, 0, 0.14), s = lerp(1.9, 1, eIn(k));
      const clac = t > T_CLAC ? eBack(tramo(t, T_CLAC, T_CLAC + 0.25)) : 0;
      const tiembla = t < T_CLAC ? 3 : 0;
      const r = this.titulo(t > T_CLAC ? 2 : 1);
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a;
      g.translate(560 + azar(-tiembla, tiembla), 100 + azar(-tiembla, tiembla)); g.rotate(-0.04);
      g.scale(s * (1 + 0.15 * Math.sin(clac * Math.PI)), s * (1 + 0.15 * Math.sin(clac * Math.PI)));
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo(v) {
    if (CT.has(v)) return CT.get(v);
    const c = lienzoNuevo(760, 210), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 45, 0, 160);
    if (v === 1) { gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.45, "#ffd0b0"); gr.addColorStop(1, "#ff5a1f"); }
    else { gr.addColorStop(0, "#fffef0"); gr.addColorStop(0.5, "#ffe58a"); gr.addColorStop(1, "#f2a100"); }
    txt(g, "¡CIERRA!", 380, 160, { tam: 160, peso: 900, fam: FD, color: gr, borde: v === 1 ? "#3a0a00" : "#3a2400", bordeAncho: 13, esp: 6, glow: v === 1 ? "rgba(255,80,20,.85)" : "rgba(255,200,40,.85)", glowTam: 26, max: 720 });
    CT.set(v, c);
    return c;
  }
}

registrar({ id: "00178", nombre: "Grifo rebelde", crear: () => new Grifo() });
})();
