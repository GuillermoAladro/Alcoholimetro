"use strict";
/*
 * 00179 · LA PIZARRA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Marcos escribe con tiza la cabecera de la carta de tapas, ¡HOY HAY...!, tapando lo que escribe con la cabeza
 * mientras avanza. Guillermo dibuja al lado una croqueta muy maja… que parpadea, le salen patitas, salta fuera de la
 * pizarra (¡BOING!) y se escapa. Los dos la persiguen de lado a lado; la croqueta se vuelve a meter en la pizarra y
 * les guiña un ojo.
 */
(() => {
const ESC = 1.75;
const BX0 = 226, BX1 = 798, BY0 = 172, BY1 = 470;       // la pizarra (marco por dentro)
const TIT_Y = 282, TIT_X0 = 250, TIT_X1 = 712;            // la cabecera: línea base y de dónde a dónde
const CRQ = [606, 392];                                   // dónde dibuja Guillermo la croqueta
const T_ESC = 0.6, T_ESC1 = 3.1, T_DIB = 3.75, T_DIB1 = 5.15, T_VIVA = 5.35, T_SALTA = 5.95, T_SUELO = 6.35;
const T_FUERA = 7.5, T_VUELVE = 7.8, T_DENTRO = 9.25, T_APAGA = 10.75, DUR = 11.3;
const XM0 = 168, XG0 = 884, XGD = 762;
const CT = cacheTexto();
const aU = (X, q, Y = PIES) => [(q[0] - X) / ESC + 39, (q[1] - Y) / ESC + 232];

/** Trazos de la croqueta en tiza (relativos a su centro), para dibujarlos poco a poco. */
const TRAZOS = (() => {
  const L = [];
  const contorno = [];
  for (let i = 0; i <= 40; i++) { const a = -Math.PI / 2 + (i / 40) * Math.PI * 2; contorno.push([Math.cos(a) * 58, Math.sin(a) * 34 + Math.sin(a * 5) * 1.5]); }
  L.push(contorno);
  const sonrisa = []; for (let i = 0; i <= 10; i++) { const a = 0.35 + (i / 10) * (Math.PI - 0.7); sonrisa.push([Math.cos(a) * 15, 4 + Math.sin(a) * 9]); }
  L.push(sonrisa);
  L.push([[-18, -10], [-17, -6], [-19, -8]]); L.push([[16, -10], [17, -6], [15, -8]]);
  for (const [x, y] of [[-40, -14], [-34, 12], [-24, 20], [30, 18], [40, -10], [44, 8], [-6, -24], [10, -22], [-46, 2]]) L.push([[x, y], [x + 3, y + 2]]);
  let tot = 0; for (const s of L) for (let i = 1; i < s.length; i++) tot += Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]);
  return { L, tot };
})();

class Pizarra extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(300);
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** Por dónde va escribiendo Marcos (x de la tiza). */
  revela(t) { return lerp(TIT_X0 - 6, TIT_X1 + 6, tramo(t, T_ESC, T_ESC1)); }
  /** Punta de la tiza de Guillermo al dibujar: [x, y] y cuánto lleva (0–1). */
  dibujo(t) {
    const k = tramo(t, T_DIB, T_DIB1);
    let resto = k * TRAZOS.tot, punta = [CRQ[0] - 58, CRQ[1]];
    for (const s of TRAZOS.L) {
      for (let i = 1; i < s.length; i++) {
        const d = Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]);
        if (resto <= d) { const u = resto / d; return { punta: [CRQ[0] + lerp(s[i - 1][0], s[i][0], u), CRQ[1] + lerp(s[i - 1][1], s[i][1], u)], k }; }
        resto -= d; punta = [CRQ[0] + s[i][0], CRQ[1] + s[i][1]];
      }
    }
    return { punta, k };
  }
  /** La croqueta viva: posición (centro), escala, giro, si corre, salto. */
  croqueta(t) {
    if (t < T_SALTA) return { x: CRQ[0], y: CRQ[1], s: 1, giro: 0, corre: false, fuera: false };
    const yS = 528;
    if (t < T_SUELO) {
      const u = tramo(t, T_SALTA, T_SUELO);
      return { x: lerp(CRQ[0], 470, u), y: lerp(CRQ[1], yS, u) - Math.sin(u * Math.PI) * 120, s: lerp(1, 0.9, u), giro: -u * 6.283, corre: false, fuera: true };
    }
    if (t < T_FUERA) {
      const u = tramo(t, T_SUELO + 0.15, T_FUERA);
      return { x: lerp(470, -120, eIn(u) * 0.4 + u * 0.6), y: yS - Math.abs(Math.sin(t * 16)) * 12, s: 0.9, giro: 0.1 * Math.sin(t * 16), corre: u > 0, fuera: true };
    }
    if (t < T_VUELVE) return { x: -200, y: yS, s: 0.9, giro: 0, corre: true, fuera: true };
    if (t < T_DENTRO - 0.45) {
      const u = tramo(t, T_VUELVE, T_DENTRO - 0.45);
      return { x: lerp(-100, 520, u), y: yS - Math.abs(Math.sin(t * 16)) * 12, s: 0.9, giro: 0.1 * Math.sin(t * 16), corre: true, fuera: true };
    }
    const u = tramo(t, T_DENTRO - 0.45, T_DENTRO);
    return { x: lerp(520, CRQ[0], u), y: lerp(yS, CRQ[1], u) - Math.sin(u * Math.PI) * 130, s: lerp(0.9, 1, u), giro: u * 6.283, corre: false, fuera: t < T_DENTRO };
  }
  /** x de cada uno. */
  xs(t) {
    // Marcos: avanza escribiendo, luego se aparta; Guillermo: se acerca a dibujar
    let xm = XM0, xg = XG0;
    const off = (63 - 39) * ESC + 40;
    if (t > T_ESC - 0.4) xm = lerp(XM0, this.revela(t) - off, eInOut(tramo(t, T_ESC - 0.4, T_ESC)));
    if (t > T_ESC1) xm = lerp(TIT_X1 + 6 - off, XM0, eInOut(tramo(t, T_ESC1 + 0.05, T_DIB - 0.05)));
    if (t > T_ESC1 + 0.2) xg = lerp(XG0, XGD, eInOut(tramo(t, T_ESC1 + 0.2, T_DIB - 0.1)));
    // persecución: se van por la izquierda y vuelven por la izquierda
    if (t > T_SUELO + 0.3 && t < T_VUELVE) {
      xm = lerp(XM0, -180, eIn(tramo(t, T_SUELO + 0.3, T_FUERA + 0.2)));
      xg = lerp(XGD, -180, eIn(tramo(t, T_SUELO + 0.15, T_FUERA + 0.45)));
    }
    if (t >= T_VUELVE) {
      // Guillermo pasa de largo y frena a la derecha; Marcos se queda a la izquierda
      const kg = tramo(t, T_VUELVE + 0.15, T_DENTRO + 0.2), km = tramo(t, T_VUELVE + 0.45, T_DENTRO + 0.25);
      xg = lerp(-140, 872, eOut(kg)); xm = lerp(-200, 160, eOut(km));
    }
    return [xm, xg];
  }
  poses() {
    const t = this.t, [xm, xg] = this.xs(t), c = this.croqueta(t);
    const M = { quien: "marcos", cara: "sonrisa", rc: 0.1, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    const G = { cara: "sonrisa", rc: -0.1, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    let dyM = 0, dyG = 0, giroM = 0, giroG = 0;
    const tiza = (g, m, ang) => { g.save(); g.translate(m[0], m[1]); g.rotate(ang); g.fillStyle = "#f6f3ea"; rectR(g, -2, -2.6, 15, 5.2, 2); g.fill(); g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(-2, 1, 15, 1.6); g.restore(); };
    // ---- Marcos escribe
    if (t > T_ESC - 0.4 && t < T_ESC1 + 0.1) {
      const k = eInOut(tramo(t, T_ESC - 0.4, T_ESC));
      const rx = this.revela(t), ry = TIT_Y - 26 + Math.sin(t * 26) * 14;
      M.manoD = mezcla([67, 152], aU(xm, [rx, ry]), k);
      dyM = -8 * k; M.piernaI = [-6 * k, 0];
      M.cara = Math.sin(t * 2.5) > 0 ? "guino" : "sonrisa"; M.rc = 0.12;
    }
    if (t > T_ESC1 + 0.1 && t < T_DIB + 0.4) { M.cara = "risa"; M.manoD = mezcla([67, 152], [92, 60], eOut(tramo(t, T_ESC1 + 0.4, T_ESC1 + 0.7))); M.rc = 0.06; }
    if (t < T_SALTA + 0.3 && t > T_ESC - 0.4) M.objD = tiza;
    // Guillermo mira y aplaude
    if (t < T_ESC1 + 0.2) {
      G.cara = t > 1.2 && t < 2.6 ? "sorpresa" : "sonrisa"; G.rc = -0.12;
      if (t > 2.7) { const s = Math.sin(t * 22); G.brazoIDelante = true; G.manoI = [38 - 6 * s, 112]; G.manoD = [48 + 6 * s, 112]; G.cara = "risa"; }
    }
    // ---- Guillermo dibuja la croqueta (con la izquierda, por delante)
    if (t > T_DIB - 0.35 && t < T_VIVA) {
      const d = this.dibujo(t), k = eInOut(tramo(t, T_DIB - 0.35, T_DIB));
      G.brazoIDelante = true; G.manoI = mezcla([9, 160], aU(xg, [d.punta[0] + 4, d.punta[1] + 8]), k);
      G.objI = (g, m, ang) => tiza(g, m, ang);
      G.cara = "guino"; G.rc = -0.14;
      M.cara = t > T_DIB + 0.6 ? "sorpresa" : "risa"; M.rc = 0.12;
    }
    // ---- ¡está viva!
    if (t >= T_VIVA && t < T_SUELO + 0.3) {
      G.cara = "sorpresa"; M.cara = "sorpresa"; G.rc = -0.18; M.rc = 0.18;
      const k = eOut(tramo(t, T_VIVA, T_VIVA + 0.2));
      G.manoI = mezcla([9, 160], [-18, 70], k); G.manoD = mezcla([70, 158], [96, 70], k); G.brazoIDelante = false;
      M.manoI = mezcla([6, 152], [-16, 68], k); M.manoD = mezcla([67, 152], [92, 66], k);
      dyG = -10 * k; dyM = -10 * k;
    }
    // ---- persecución
    const corre = (A, fase, R) => {
      const an = andar(fase, 1.5);
      A.piernaI = an.piernaI; A.piernaD = an.piernaD;
      A.manoD = [R.manoD[0] + 10, R.manoD[1] - 40 + 22 * Math.sin(fase)]; A.manoI = [R.manoI[0] - 10, R.manoI[1] - 40 - 22 * Math.sin(fase)];
      return an.bote;
    };
    if (t >= T_SUELO + 0.3 && t < T_DENTRO + 0.25) {
      dyM = corre(M, t * 20, avatar("marcos").rig); dyG = corre(G, t * 20 + 1.5, avatar().rig);
      M.cara = "risa"; G.cara = Math.sin(t * 3) > 0 ? "sorpresa" : "risa";
      giroM = -0.1; giroG = -0.1;
      if (t >= T_VUELVE) { giroM = 0.1; giroG = 0.1; }
    }
    // ---- vuelve a la pizarra: frenazo y cara de pasmo
    if (t >= T_DENTRO - 0.1) {
      const k = eOut(tramo(t, T_DENTRO - 0.1, T_DENTRO + 0.35));
      giroG = lerp(0.1, -0.05, k); giroM = lerp(0.1, -0.05, k);
      if (t > T_DENTRO + 0.25) { M.piernaI = [0, 0]; M.piernaD = [0, 0]; G.piernaI = [0, 0]; G.piernaD = [0, 0]; dyM = 0; dyG = 0; }
      G.cara = t < T_DENTRO + 0.9 ? "sorpresa" : "borracho"; M.cara = t < T_DENTRO + 1.1 ? "sorpresa" : "risa";
      G.rc = -0.18; M.rc = 0.16;
      G.manoD = [70, 158]; G.manoI = [9, 160];
      M.manoD = [67, 152]; M.manoI = [6, 152];
      if (t > T_DENTRO + 0.5) { G.manoI = mezcla([9, 160], [30, 58], eOut(tramo(t, T_DENTRO + 0.5, T_DENTRO + 0.8))); G.brazoIDelante = true; } // se rasca la cabeza
      if (t > T_DENTRO + 1.1) { M.manoD = [94, 104]; M.manoI = [-20, 104]; }          // ni idea
    }
    return [
      { pose: M, m: matAv(xm, PIES + dyM, ESC, giroM) },
      { pose: G, m: matAv(xg, PIES + dyG, ESC, giroG) },
    ];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // polvo de tiza
    if (t > T_ESC && t < T_ESC1 && Math.random() < 30 * dt) p.nueva(P.POLVO, this.revela(t), TIT_Y - 26 + azar(-20, 20), azar(-20, 20), azar(10, 40), azar(0.3, 0.6), azar(5, 9));
    if (t > T_DIB && t < T_DIB1 && Math.random() < 30 * dt) { const d = this.dibujo(t).punta; p.nueva(P.POLVO, d[0], d[1], azar(-20, 20), azar(10, 40), azar(0.3, 0.6), azar(5, 9)); }
    this.una("viva", t > T_VIVA, () => { temblar(6, 0.2); for (let i = 0; i < 10; i++) { const a = azar(0, 6.283); p.nueva(P.DESTELLO, CRQ[0] + Math.cos(a) * 70, CRQ[1] + Math.sin(a) * 45, 0, 0, 0.35, azar(20, 36)); } });
    this.una("salta", t > T_SALTA, () => { temblar(10, 0.25); for (let i = 0; i < 18; i++) p.nueva(P.POLVO, CRQ[0] + azar(-50, 50), CRQ[1] + azar(-30, 30), azar(-120, 120), azar(-120, 60), azar(0.4, 0.8), azar(20, 40)); });
    this.una("suelo", t > T_SUELO, () => { temblar(8, 0.2); for (let i = 0; i < 10; i++) p.nueva(P.POLVO, 470 + azar(-40, 40), 560, azar(-120, 120), azar(-40, 0), azar(0.4, 0.7), azar(20, 34)); });
    this.una("dentro", t > T_DENTRO, () => {
      temblar(10, 0.25);
      for (let i = 0; i < 18; i++) p.nueva(P.POLVO, CRQ[0] + azar(-50, 50), CRQ[1] + azar(-30, 30), azar(-120, 120), azar(-120, 60), azar(0.4, 0.8), azar(20, 40));
      for (let i = 0; i < 10; i++) { const a = azar(0, 6.283), v = azar(120, 260); p.nueva(P.CHISPA, CRQ[0], CRQ[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.5), azar(5, 8)); }
    });
    // polvo de la carrera
    const c = this.croqueta(t);
    if (c.corre && c.x > -40 && c.x < W + 40 && Math.random() < 20 * dt) p.nueva(P.POLVO, c.x, 566, azar(-40, 40), azar(-30, 0), azar(0.3, 0.5), azar(12, 20));
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  /** Fondo: pared de ladrillo del bar, la pizarra con su marco y el suelo. */
  fondoFijo() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, "#1b0f0a"); gr.addColorStop(1, "#2c170c");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.fillStyle = "rgba(120,50,25,.22)";
    for (let y = 0; y < 560; y += 30) for (let x = (y / 30) % 2 ? -30 : 0; x < W; x += 60) { rectR(g, x + 2, y + 2, 56, 26, 3); g.fill(); }
    // suelo
    const gs = g.createLinearGradient(0, 560, 0, H);
    gs.addColorStop(0, "#3a2414"); gs.addColorStop(1, "#140b06");
    g.fillStyle = gs; g.fillRect(0, 560, W, 40);
    // marco de madera
    g.fillStyle = "rgba(0,0,0,.5)"; rectR(g, BX0 - 16, BY0 - 10, BX1 - BX0 + 32, BY1 - BY0 + 32, 8); g.fill();
    const gm = g.createLinearGradient(0, BY0 - 18, 0, BY1 + 18);
    gm.addColorStop(0, "#9a6232"); gm.addColorStop(1, "#5a3218");
    g.fillStyle = gm; rectR(g, BX0 - 18, BY0 - 18, BX1 - BX0 + 36, BY1 - BY0 + 36, 8); g.fill();
    g.strokeStyle = "rgba(255,220,170,.35)"; g.lineWidth = 2; rectR(g, BX0 - 16, BY0 - 16, BX1 - BX0 + 32, BY1 - BY0 + 32, 7); g.stroke();
    // pizarra
    const gp = g.createLinearGradient(BX0, BY0, BX1, BY1);
    gp.addColorStop(0, "#22302a"); gp.addColorStop(1, "#16201b");
    g.fillStyle = gp; g.fillRect(BX0, BY0, BX1 - BX0, BY1 - BY0);
    // borrones viejos de tiza
    const r = semilla(17);
    for (let i = 0; i < 14; i++) {
      g.globalAlpha = 0.025 + r() * 0.03; g.fillStyle = "#e8efe9";
      g.beginPath(); g.ellipse(BX0 + 40 + r() * (BX1 - BX0 - 80), BY0 + 30 + r() * (BY1 - BY0 - 60), 30 + r() * 60, 5 + r() * 8, r() * 0.3 - 0.15, 0, 6.283); g.fill();
    }
    g.globalAlpha = 1;
    // repisa de la tiza
    g.fillStyle = "#6a3c1c"; g.fillRect(BX0 - 10, BY1 + 6, BX1 - BX0 + 20, 10);
    g.fillStyle = "#f2efe6"; g.fillRect(BX0 + 30, BY1 + 1, 18, 5); g.fillStyle = "#ffd34d"; g.fillRect(BX0 + 58, BY1 + 1, 14, 5);
    return (this.cF = c);
  }
  /** La cabecera en tiza (una vez). */
  titulo() {
    if (CT.has(1)) return CT.get(1);
    const c = lienzoNuevo(TIT_X1 - TIT_X0 + 60, 140), g = c.getContext("2d");
    txt(g, "¡HOY HAY...!", c.width / 2, 108, { tam: 96, peso: 400, fam: FB, color: "#f6f4ec", esp: 3, max: TIT_X1 - TIT_X0 });
    // textura de tiza: puntitos borrados
    g.globalCompositeOperation = "destination-out";
    const r = semilla(5);
    for (let i = 0; i < 900; i++) { g.globalAlpha = 0.3 + r() * 0.5; g.fillRect(r() * c.width, r() * c.height, 1 + r() * 2.5, 1 + r() * 1.5); }
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    // subrayado
    g.strokeStyle = "rgba(255,211,77,.9)"; g.lineWidth = 5; g.lineCap = "round";
    g.beginPath(); g.moveTo(40, 126); g.quadraticCurveTo(c.width / 2, 118, c.width - 40, 128); g.stroke();
    CT.set(1, c);
    return c;
  }
  dibujarTitulo(g, t) {
    if (t < T_ESC) return;
    const c = this.titulo(), x0 = (TIT_X0 + TIT_X1) / 2 - c.width / 2, y0 = TIT_Y - 108;
    const rx = this.revela(t);
    g.save(); g.beginPath(); g.rect(x0 - 10, y0 - 10, rx - x0 + 10, c.height + 20); g.clip();
    g.drawImage(c, x0, y0);
    g.restore();
  }
  /** La croqueta en tiza (trazos hasta k). */
  croquetaTiza(g, k, ojos, patas, a, guino) {
    g.save(); g.translate(CRQ[0], CRQ[1]); g.globalAlpha *= a;
    g.strokeStyle = "rgba(246,244,236,.92)"; g.lineWidth = 5; g.lineCap = "round"; g.lineJoin = "round";
    let resto = k * TRAZOS.tot;
    for (const s of TRAZOS.L) {
      if (resto <= 0) break;
      g.beginPath(); g.moveTo(s[0][0], s[0][1]);
      for (let i = 1; i < s.length && resto > 0; i++) {
        const d = Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]);
        if (resto < d) { const u = resto / d; g.lineTo(lerp(s[i - 1][0], s[i][0], u), lerp(s[i - 1][1], s[i][1], u)); }
        else g.lineTo(s[i][0], s[i][1]);
        resto -= d;
      }
      g.stroke();
    }
    if (ojos > 0) {
      // abre los ojos (puntitos que se hacen ojos)
      for (const ox of [-18, 16]) {
        g.beginPath();
        if (guino && ox > 0) { g.moveTo(ox - 7, -7); g.quadraticCurveTo(ox, -1, ox + 7, -7); } else g.ellipse(ox, -8, 6 * ojos, 7 * ojos, 0, 0, 6.283);
        g.stroke();
      }
      if (guino) { g.beginPath(); g.moveTo(14, 14); g.quadraticCurveTo(20, 22, 26, 14); g.stroke(); }
    }
    if (patas > 0) {
      for (const px of [-22, 22]) { g.beginPath(); g.moveTo(px, 32); g.lineTo(px + Math.sin(this.t * 30) * 3, 32 + 26 * patas); g.lineTo(px + 10, 32 + 26 * patas); g.stroke(); }
    }
    g.restore();
  }
  /** La croqueta de verdad (con volumen, patas y cara). */
  croquetaViva(g, c, t, guino) {
    g.save(); g.translate(c.x, c.y); g.rotate(c.giro); g.scale(c.s, c.s);
    // patas
    const f = c.corre ? t * 20 : 0;
    g.strokeStyle = "#2a1a10"; g.lineWidth = 5; g.lineCap = "round";
    for (const [px, fs] of [[-20, 0], [20, Math.PI]]) {
      const sw = c.corre ? Math.sin(f + fs) * 12 : 0, lv = c.corre ? Math.max(0, -Math.cos(f + fs)) * 8 : 0;
      g.beginPath(); g.moveTo(px, 26); g.lineTo(px + sw, 54 - lv); g.stroke();
      g.fillStyle = "#fffdf5"; g.beginPath(); g.ellipse(px + sw + 5, 56 - lv, 9, 5, 0, 0, 6.283); g.fill();
    }
    // cuerpo
    const gr = g.createRadialGradient(-18, -14, 6, 0, 0, 64);
    gr.addColorStop(0, "#ffcf72"); gr.addColorStop(0.5, "#d98a2b"); gr.addColorStop(1, "#7a3f0e");
    g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 58, 34, 0, 0, 6.283); g.fill();
    g.strokeStyle = "rgba(60,25,5,.8)"; g.lineWidth = 2.5; g.stroke();
    // pan rallado
    const r = semilla(9); g.fillStyle = "rgba(255,230,160,.75)";
    for (let i = 0; i < 26; i++) { const a = r() * 6.283, rr = Math.sqrt(r()); g.fillRect(Math.cos(a) * 50 * rr, Math.sin(a) * 28 * rr, 2.5, 2.5); }
    g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.ellipse(-20, -18, 16, 6, -0.3, 0, 6.283); g.fill();
    // cara
    for (const ox of [-18, 16]) {
      g.fillStyle = "#fff"; g.beginPath(); g.ellipse(ox, -8, 8, 9, 0, 0, 6.283); g.fill();
      g.strokeStyle = "#2a1a10"; g.lineWidth = 2; g.stroke();
      if (guino && ox > 0) { g.fillStyle = "#d98a2b"; g.beginPath(); g.ellipse(ox, -8, 9, 10, 0, 0, 6.283); g.fill(); g.strokeStyle = "#2a1a10"; g.lineWidth = 3; g.beginPath(); g.moveTo(ox - 7, -7); g.quadraticCurveTo(ox, -2, ox + 7, -7); g.stroke(); }
      else { g.fillStyle = "#1a1a1a"; g.beginPath(); g.arc(ox + (c.corre ? -3 : 1), -7, 4, 0, 6.283); g.fill(); }
    }
    g.fillStyle = "#3a1206"; g.beginPath(); g.moveTo(-13, 6); g.quadraticCurveTo(0, 22, 13, 6); g.closePath(); g.fill();
    g.fillStyle = "#ff6b8a"; g.beginPath(); g.ellipse(2, 12, 5, 3.5, 0, 0, 6.283); g.fill();
    g.restore();
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses(), c = this.croqueta(t);
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    g.drawImage(this.fondoFijo(), 0, 0);
    foco(g, 512, 512, PIES, 460, 0.5);
    this.dibujarTitulo(g, t);
    // la croqueta en la pizarra (dibujo) o su hueco
    if (t > T_DIB) {
      const k = this.dibujo(t).k;
      const ojos = tramo(t, T_VIVA, T_VIVA + 0.15), patas = tramo(t, T_VIVA + 0.25, T_VIVA + 0.45);
      const al = t < T_SALTA ? 1 : t < T_DENTRO ? 0.18 : lerp(0.18, 1, tramo(t, T_DENTRO + 0.15, T_DENTRO + 0.5));
      this.croquetaTiza(g, k, ojos, patas, al, t > T_DENTRO + 0.75 && t < T_DENTRO + 1.7);
    }
    if (c.fuera || t >= T_DENTRO) {
      // dentro otra vez: sale de colores un momento y vuelve a tiza guiñando
      if (c.fuera) this.croquetaViva(g, c, t, false);
      else {
        const kd = tramo(t, T_DENTRO, T_DENTRO + 0.25);
        g.save(); g.globalAlpha *= 1 - tramo(t, T_DENTRO + 0.15, T_DENTRO + 0.5); this.croquetaViva(g, { x: CRQ[0], y: CRQ[1] - Math.sin(tramo(t, T_DENTRO, T_DENTRO + 0.3) * Math.PI) * 10, s: 1, giro: 0, corre: false }, t, t > T_DENTRO + 0.7 && t < T_DENTRO + 1.6); g.restore();
        void kd;
      }
    }
    for (const x of e) pintarAvatar(g, x.m, x.pose, t);
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
    ono("¡TIC, TIC!", 140, 130, T_ESC + 0.2, 0.7, 40, "#fffdf5", "#1b1b1b", -0.1);
    ono("¡TIC, TIC!", 900, 130, T_ESC + 1.4, 0.7, 40, "#fffdf5", "#1b1b1b", 0.1);
    ono("¡BOING!", 330, 420, T_SALTA, 0.7, 60, "#ffd34d", "#3a2400", -0.12);
    ono("¡EH!", 860, 300, T_SUELO + 0.25, 0.6, 50, "#fffdf5", "#1b1b1b", 0.1);
    ono("¡PLOP!", 760, 330, T_DENTRO, 0.6, 54, "#2fe3e8", "#06303a", 0.1);
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00179", nombre: "La pizarra", crear: () => new Pizarra() });
})();
