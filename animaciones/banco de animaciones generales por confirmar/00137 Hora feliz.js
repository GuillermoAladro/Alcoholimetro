"use strict";
/*
 * 00137 · HORA FELIZ
 *
 * Animación del banco. Empieza y acaba en negro.
 * Guillermo y Rodrigo esperan aburridos, cada uno en una punta de la barra, mientras el reloj de pared se acerca a
 * las siete. Suena la campanita (¡DING!): se les pone el pelo de punta, corren al centro y del techo les llueven
 * cañas; cada uno caza una al vuelo y a Rodrigo otra le rebota en la cabeza. Brindan: ¡HORA FELIZ!
 */
(() => {
const ESC = 1.6, AY = 610, BARRA = 455;
const XG0 = 226, XR0 = 798, XG1 = 412, XR1 = 612;
const T_DING = 2.6, T_CORRE = 3.0, T_LLEGA = 3.7, T_CAZA_G = 4.45, T_CAZA_R = 4.95, T_TOC = 5.55;
const T_BRINDIS = 6.75, T_CHOQUE = 7.0, T_APAGA = 8.95;
const RELOJ = [512, 132], RR = 82;
const GRAV = 1500, S_J = 1.7;          // gravedad de las cañas que caen y su tamaño en la barra
const TICS = [0.95, 1.8, T_DING];      // el minutero salta tres veces: 18:57 → 19:00
const CT = cacheTexto();

/** De pantalla a unidades de avatar (para poner las manos en un punto de la pantalla). */
const aU = (X, q) => [(q[0] - X) / ESC + 39, (q[1] - AY) / ESC + 232];
const aP = (X, u) => [X + (u[0] - 39) * ESC, AY - (232 - u[1]) * ESC];

/** Jarra en la mano izquierda (de la pantalla), en espejo: el cuerpo hacia fuera. */
function jarraIzq(pose, inc, nivel) {
  pose.objI = (g, m, a, t) => { g.save(); g.translate(m[0], m[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], inc, nivel, "asa", t); g.restore(); };
  pose.objI2 = (g, m, a, t) => { g.save(); g.translate(m[0], m[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], inc, nivel, "cuerpo", t); g.restore(); };
}
/** Jarra suelta a tamaño de pantalla; (x, y) = el asa. */
function jarraSuelta(g, x, y, ang, s, t, espejo) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(espejo ? -s : s, s);
  dibujarJarra(g, [0, 0], 0, 1, "asa", t); dibujarJarra(g, [0, 0], 0, 1, "cuerpo", t);
  g.restore();
}

/** Las cañas que caen a la barra: x del centro, cuándo empiezan a caer. */
const LLUVIA = [[300, 3.55], [724, 3.7], [160, 3.95], [870, 4.1], [228, 4.6], [936, 4.75], [94, 5.15], [660, 5.3], [366, 5.75]];
const Y0 = -90;
function caida(t0, yFin) { return t0 + Math.sqrt((2 * (yFin - Y0)) / GRAV); }

class HoraFeliz extends Escena {
  constructor() {
    super(9.6);
    this.p = new Parts(380);
    this.fG = 0; this.fR = 0;
    // las dos que cazan al vuelo: caen justo a la mano levantada
    this.manoG = aP(XG1, [82, 2]);
    this.manoR = aP(XR1, [-4, 2]);
    this.t0G = T_CAZA_G - Math.sqrt((2 * (this.manoG[1] - Y0)) / GRAV);
    this.t0R = T_CAZA_R - Math.sqrt((2 * (this.manoR[1] - Y0)) / GRAV);
    // la que le rebota en la cabeza a Rodrigo
    this.cabezaR = aP(XR1, [40, 2]);
    this.t0T = T_TOC - Math.sqrt((2 * (this.cabezaR[1] - 30 - Y0)) / GRAV);
  }
  x(t, quien) {
    const k = eInOut(tramo(t, T_CORRE, T_LLEGA));
    return quien ? lerp(XR0, XR1, k) : lerp(XG0, XG1, k);
  }
  luz() { const t = this.t; return tramo(t, 0, 0.5) * (1 - tramo(t, T_APAGA, 9.5)); }
  minutos() { let m = 3; for (const tk of TICS) m -= eElastico(tramo(this.t, tk, tk + 0.3)); return m; }
  poses() {
    const t = this.t;
    const G = { cara: "dormido", rc: 0.12, piernaI: [0, 0], piernaD: [0, 0] };
    const R = { quien: "rodrigo", cara: "sonrisa", rc: -0.08, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let gD = [50, 76], gI = [12, 136], rD = [64, 136], rI = [12, 136];
    let yG = 0, yR = 0, giroG = 0, giroR = 0, sxG = 1, syG = 1, sxR = 1, syR = 1;
    // aburridos: Guillermo con la cabeza en la mano (bosteza); Rodrigo tamborilea en la barra
    if (t < T_DING) {
      rD = [66, 134 - Math.abs(Math.sin(t * 17)) * 4];
      if (t > 1.25 && t < 1.85) { G.cara = "sorpresa"; G.rc = -0.12; gD = mezcla([50, 76], [44, 66], eInOut(tramo(t, 1.25, 1.4))); }
      if (t > 1.85 && t < 2.1) G.cara = "sonrisa";
      if (t > 0.95 && t < 1.3) R.cara = "guino";
      if (t > 1.8 && t < 2.6) { R.cara = "sorpresa"; R.rc = -0.02; }
    }
    // ¡DING!: saltan con el pelo de punta y se miran
    if (t >= T_DING) {
      const s = tramo(t, T_DING, T_DING + 0.38), salto = Math.sin(s * Math.PI) * 42;
      yG = -salto; yR = -salto * 0.95;
      const kB = eOut(tramo(t, T_DING, T_DING + 0.12));
      gD = mezcla(gD, [96, 34], kB); gI = mezcla(gI, [-18, 34], kB);
      rD = mezcla(rD, [94, 34], kB); rI = mezcla(rI, [-18, 34], kB);
      G.cara = "sorpresa"; R.cara = "sorpresa";
      G.puntas = 1 - tramo(t, 3.4, 4.0); R.puntas = G.puntas;
      G.rc = 0.16 * eOut(tramo(t, T_DING + 0.15, T_DING + 0.3)); R.rc = -G.rc;
    }
    // corren al centro de la barra
    if (t >= T_CORRE && t < T_LLEGA + 0.2) {
      const k = tramo(t, T_CORRE, T_LLEGA);
      const bote = -Math.abs(Math.sin(this.fG)) * 12 * (1 - k * k);
      yG = bote; yR = bote;
      giroG = 0.1 * Math.sin(k * Math.PI); giroR = -giroG;
      const b = Math.sin(this.fG * 1.0);
      gD = [80 + 8 * b, 118 - 14 * b]; gI = [0 - 8 * b, 118 + 14 * b];
      rD = [78 - 8 * b, 118 + 14 * b]; rI = [-2 + 8 * b, 118 - 14 * b];
      G.cara = "risa"; R.cara = "risa"; G.rc = 0.06; R.rc = -0.06;
    }
    // frenazo
    const kF = tramo(t, T_LLEGA, T_LLEGA + 0.3);
    if (kF > 0 && kF < 1) { const a = Math.sin(kF * Math.PI) * 0.06; sxG = 1 + a; syG = 1 - a; sxR = sxG; syR = syG; }
    // levantan las manos a por la lluvia de cañas
    if (t >= T_LLEGA) {
      const kM = eOut(tramo(t, T_LLEGA, T_LLEGA + 0.3));
      gD = mezcla([80, 118], [82, 2], kM); gI = mezcla([0, 118], [-12, 34], kM);
      rI = mezcla([-2, 118], [-4, 2], kM); rD = mezcla([78, 118], [90, 34], kM);
      G.cara = "risa"; R.cara = "risa"; G.rc = -0.05; R.rc = 0.05;
      gI[1] += Math.sin(t * 9) * 4; rD[1] += Math.sin(t * 9 + 1) * 4;
    }
    // Guillermo caza la suya y la baja al pecho
    if (t >= T_CAZA_G) {
      const d = t - T_CAZA_G, golpe = Math.exp(-d * 9) * Math.sin(d * 30) * 6;
      const kBaja = eInOut(tramo(t, T_CAZA_G + 0.25, T_CAZA_G + 0.65));
      gD = mezcla([82, 2 + Math.max(0, golpe)], [76, 104], kBaja);
      G.jarra = { inc: 0.12 * Math.exp(-d * 5) * Math.sin(d * 18), nivel: 1 };
      if (d < 0.6) G.cara = "guino";
    }
    if (t >= T_CAZA_R) {
      const d = t - T_CAZA_R, golpe = Math.exp(-d * 9) * Math.sin(d * 30) * 6;
      const kBaja = eInOut(tramo(t, T_CAZA_R + 0.25, T_CAZA_R + 0.65));
      rI = mezcla([-4, 2 + Math.max(0, golpe)], [0, 104], kBaja);
      jarraIzq(R, 0.12 * Math.exp(-d * 5) * Math.sin(d * 18), 1);
      if (d < 0.5) R.cara = "guino";
    }
    // ¡TOC! una le rebota en la cabeza
    if (t >= T_TOC && t < T_TOC + 0.75) {
      const d = t - T_TOC;
      R.cara = "sorpresa"; R.rc = 0.1 * Math.exp(-d * 4) * Math.sin(d * 28);
      syR = 1 - 0.05 * Math.exp(-d * 8);
      G.cara = d > 0.15 ? "risa" : G.cara;
    }
    // brindis en el centro
    if (t >= T_BRINDIS) {
      const k = eInOut(tramo(t, T_BRINDIS, T_CHOQUE)), rebote = t > T_CHOQUE ? Math.exp(-(t - T_CHOQUE) * 7) * Math.sin((t - T_CHOQUE) * 30) * 3 : 0;
      gD = mezcla([76, 104], [96 - rebote, 70], k);
      rI = mezcla([0, 104], [-19 + rebote, 70], k);
      G.jarra = { inc: -0.18 * k, nivel: 1 };
      jarraIzq(R, -0.18 * k, 1);
      gI = mezcla(gI, [-10, 36 + Math.sin(t * 8) * 5], 1);
      rD = mezcla(rD, [88, 36 + Math.sin(t * 8 + 1) * 5], 1);
      G.cara = t > 7.7 ? "guino" : "risa"; R.cara = "risa";
      G.rc = 0.06 * Math.sin(t * 4); R.rc = -0.06 * Math.sin(t * 4 + 0.5);
    }
    G.manoD = gD; G.manoI = gI; R.manoD = rD; R.manoI = rI;
    return [
      { pose: G, m: matAv(this.x(t, 0), AY + yG, ESC, giroG, sxG, syG) },
      { pose: R, m: matAv(this.x(t, 1), AY + yR, ESC, giroR, sxR, syR) },
    ];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    if (t > T_CORRE && t < T_LLEGA) { this.fG += dt * 15; }
    for (const tk of TICS.slice(0, 2)) this.una("tic" + tk, t > tk, () => temblar(2, 0.1));
    this.una("ding", t > T_DING, () => {
      temblar(14, 0.4);
      p.nueva(P.DESTELLO, RELOJ[0], RELOJ[1] - RR - 22, 0, 0, 0.35, 160);
      for (let i = 0; i < 18; i++) { const a = azar(-Math.PI, 0), v = azar(150, 420); p.nueva(P.CHISPA, RELOJ[0], RELOJ[1] - RR - 22, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 11)); }
    });
    // polvo al correr y al frenar
    if (t > T_CORRE && t < T_LLEGA && Math.random() < 30 * dt) {
      for (const [x0, x1, s] of [[XG0, XG1, -1], [XR0, XR1, 1]]) {
        const x = lerp(x0, x1, eInOut(tramo(t, T_CORRE, T_LLEGA)));
        p.nueva(P.POLVO, x + s * 60, BARRA - azar(0, 8), s * azar(40, 140), azar(-50, -10), azar(0.4, 0.7), azar(22, 36));
      }
    }
    this.una("frena", t > T_LLEGA, () => {
      temblar(5, 0.2);
      for (const x of [XG1, XR1]) for (let i = 0; i < 8; i++) p.nueva(P.POLVO, x + azar(-50, 50), BARRA - 4, azar(-160, 160), azar(-60, -10), azar(0.4, 0.8), azar(24, 40));
    });
    // las cañas que llegan a la barra
    LLUVIA.forEach(([x, t0], i) => this.una("cae" + i, t > caida(t0, BARRA - 18 * S_J), () => {
      temblar(4, 0.12);
      for (let k = 0; k < 9; k++) p.nueva(P.ESPUMA, x + azar(-14, 14), BARRA - 36 * S_J, azar(-140, 140), azar(-260, -80), azar(0.4, 0.8), azar(4, 8));
      for (let k = 0; k < 5; k++) p.nueva(P.GOTA, x + azar(-10, 10), BARRA - 34 * S_J, azar(-160, 160), azar(-300, -120), 0.6, azar(2.5, 4));
    }));
    for (const [tc, M, q] of [[T_CAZA_G, this.manoG, 1], [T_CAZA_R, this.manoR, -1]]) this.una("caza" + tc, t > tc, () => {
      temblar(6, 0.15);
      p.nueva(P.DESTELLO, M[0] + q * 25, M[1] - 10, 0, 0, 0.3, 110);
      for (let k = 0; k < 10; k++) p.nueva(P.ESPUMA, M[0] + q * 25, M[1] - 30, azar(-120, 120), azar(-280, -100), azar(0.4, 0.8), azar(4, 8));
    });
    this.una("toc", t > T_TOC, () => {
      temblar(8, 0.2);
      for (let k = 0; k < 10; k++) { const a = azar(-Math.PI, 0), v = azar(120, 300); p.nueva(P.CHISPA, this.cabezaR[0], this.cabezaR[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.5), azar(6, 10)); }
      for (let k = 0; k < 8; k++) p.nueva(P.ESPUMA, this.cabezaR[0], this.cabezaR[1] - 20, azar(-150, 150), azar(-250, -60), azar(0.4, 0.7), azar(4, 7));
    });
    this.una("choque", t > T_CHOQUE, () => {
      temblar(16, 0.45);
      const q = [512, aP(XG1, [96, 70])[1] - 30];
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.4, 200);
      for (let k = 0; k < 26; k++) { const a = azar(-Math.PI, 0), v = azar(200, 560); p.nueva(P.CHISPA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(7, 13)); }
      for (let k = 0; k < 26; k++) p.nueva(P.ESPUMA, q[0] + azar(-20, 20), q[1], azar(-260, 260), azar(-420, -120), azar(0.5, 1), azar(5, 10));
      for (let k = 0; k < 70; k++) p.nueva(P.CONFETI, azar(60, W - 60), azar(-60, -10), azar(-40, 40), azar(0, 120), azar(2.5, 4), azar(9, 15), k % 5);
    });
    p.suelo = () => BARRA - 2;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  /** La pared: luz cálida y estanterías con botellas a los lados. */
  fondo(g, a) {
    g.save(); g.globalAlpha = a;
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.33 * a;
    g.drawImage(BLOB2.oroClaro, 60, 20, 904, 560);
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 0.5 * a;
    for (const [x0, yb] of [[40, 250], [40, 352], [760, 250], [760, 352]]) {
      g.fillStyle = "#3a2516"; g.fillRect(x0, yb, 224, 7);
      for (let i = 0; i < 6; i++) {
        const x = x0 + 20 + i * 37, h = 46 + ((i * 7 + yb) % 3) * 9;
        g.fillStyle = ["#2f6b3a", "#7a3b16", "#3b4d7a", "#6b5a1a"][(i + (yb > 300 ? 1 : 0)) % 4];
        rectR(g, x - 9, yb - h, 18, h, 4); g.fill(); g.fillRect(x - 4, yb - h - 13, 8, 15);
      }
    }
    g.restore();
  }
  reloj(g, a) {
    if (a <= 0) return;
    const t = this.t, min = this.minutos(), d = t - T_DING;
    const sac = d > 0 && d < 1.3 ? Math.sin(d * 55) * 0.07 * (1 - d / 1.3) : 0;
    const [cx, cy] = RELOJ;
    g.save(); g.globalAlpha *= a; g.translate(cx, cy); g.rotate(sac);
    // campanita con su martillo
    const mart = d > 0 && d < 1.3 ? Math.sin(d * 70) * 0.5 : 0;
    g.save(); g.translate(0, -RR - 6);
    g.fillStyle = "#6e4a14"; g.fillRect(-3, -6, 6, 10);
    const gb = g.createLinearGradient(-26, 0, 26, 0);
    gb.addColorStop(0, "#8a5a00"); gb.addColorStop(0.35, "#ffd34d"); gb.addColorStop(0.55, "#fff3b0"); gb.addColorStop(1, "#a36d00");
    g.fillStyle = gb;
    g.beginPath(); g.moveTo(-26, -8); g.quadraticCurveTo(-24, -40, 0, -42); g.quadraticCurveTo(24, -40, 26, -8); g.closePath(); g.fill();
    g.fillStyle = "#c98f12"; g.beginPath(); g.arc(0, -45, 5, 0, 6.283); g.fill();
    g.save(); g.rotate(mart); g.strokeStyle = "#444"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -4); g.lineTo(30, -26); g.stroke();
    g.fillStyle = "#222"; g.beginPath(); g.arc(30, -26, 5, 0, 6.283); g.fill(); g.restore();
    g.restore();
    // aro y esfera
    const ga = g.createLinearGradient(0, -RR, 0, RR);
    ga.addColorStop(0, "#f6dc98"); ga.addColorStop(0.5, "#b07a2a"); ga.addColorStop(1, "#5a3a10");
    g.fillStyle = ga; g.beginPath(); g.arc(0, 0, RR, 0, 6.283); g.fill();
    const ge = g.createRadialGradient(-22, -26, 6, 0, 0, RR);
    ge.addColorStop(0, "#fffdf5"); ge.addColorStop(1, "#dcd3bd");
    g.fillStyle = ge; g.beginPath(); g.arc(0, 0, RR - 10, 0, 6.283); g.fill();
    // a las siete la esfera se enciende
    const fl = d > 0 ? Math.max(0, 1 - d / 0.9) * (0.5 + 0.5 * Math.sin(d * 40)) : 0;
    if (fl > 0) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha *= fl; g.drawImage(BLOB2.oro, -RR * 1.6, -RR * 1.6, RR * 3.2, RR * 3.2); g.restore(); }
    g.strokeStyle = "#3a3026"; g.lineCap = "round";
    for (let i = 0; i < 60; i++) {
      const an = (i / 60) * 6.283, r0 = i % 5 ? RR - 17 : RR - 23;
      g.lineWidth = i % 5 ? 1.5 : 3.5;
      g.beginPath(); g.moveTo(Math.cos(an) * r0, Math.sin(an) * r0); g.lineTo(Math.cos(an) * (RR - 13), Math.sin(an) * (RR - 13)); g.stroke();
    }
    for (const [n, an] of [["12", -Math.PI / 2], ["3", 0], ["6", Math.PI / 2], ["9", Math.PI]]) txt(g, n, Math.cos(an) * (RR - 37), Math.sin(an) * (RR - 37) + 9, { tam: 24, peso: 900, fam: FD, color: "#2a2018" });
    // una jarrita dibujada en la esfera
    g.save(); g.translate(-9, 26); g.scale(0.55, 0.55); dibujarJarra(g, [0, 0], 0, 1, "asa", t); dibujarJarra(g, [0, 0], 0, 1, "cuerpo", t); g.restore();
    // agujas (las 19:00 menos `min` minutos)
    const tot = 19 * 60 - min, aH = ((tot / 60) % 12) / 12 * 6.283 - Math.PI / 2, aM = ((tot % 60) / 60) * 6.283 - Math.PI / 2;
    const aS = t < T_DING ? (((t - 0.1) / 0.85) % 1) * 6.283 - Math.PI / 2 : -Math.PI / 2;
    g.strokeStyle = "#1a1410"; g.lineWidth = 7; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(aH) * 40, Math.sin(aH) * 40); g.stroke();
    g.lineWidth = 4.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(aM) * 58, Math.sin(aM) * 58); g.stroke();
    g.strokeStyle = "#d8262f"; g.lineWidth = 2; g.beginPath(); g.moveTo(-Math.cos(aS) * 12, -Math.sin(aS) * 12); g.lineTo(Math.cos(aS) * 62, Math.sin(aS) * 62); g.stroke();
    g.fillStyle = "#d8262f"; g.beginPath(); g.arc(0, 0, 5, 0, 6.283); g.fill();
    // brillo del cristal
    g.fillStyle = "rgba(255,255,255,.22)"; g.beginPath(); g.ellipse(-24, -34, 34, 14, -0.5, 0, 6.283); g.fill();
    g.restore();
    // ondas y ¡DING!
    if (d > 0 && d < 1.4) {
      const al = (1 - tramo(d, 1.1, 1.4)) * a;
      g.save(); g.globalAlpha = al; g.strokeStyle = "#ffd34d"; g.lineWidth = 5; g.lineCap = "round";
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
        const r = 40 + i * 18 + ((d * 90) % 18);
        g.beginPath();
        if (s > 0) g.arc(cx, cy - RR - 30, r, -0.7, 0.3); else g.arc(cx, cy - RR - 30, r, Math.PI - 0.3, Math.PI + 0.7);
        g.stroke();
      }
      g.restore();
      for (const [x, y, r, tam, d0] of [[cx - 175, 64, -0.18, 66, 0], [cx + 180, 58, 0.16, 74, 0.25]]) {
        if (d < d0) continue;
        const kk = eBack(tramo(d, d0, d0 + 0.14));
        g.save(); g.translate(x + azar(-1.5, 1.5), y); g.rotate(r); g.scale(kk, kk);
        txt(g, "¡DING!", 0, 0, { tam, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a2400", bordeAncho: 9, esp: 2, alfa: al });
        g.restore();
      }
    }
  }
  barra(g, a) {
    g.save(); g.globalAlpha = a;
    const gr = this.grB || (this.grB = (() => { const q = g.createLinearGradient(0, BARRA, 0, H); q.addColorStop(0, "#5a3218"); q.addColorStop(1, "#24130a"); return q; })());
    g.fillStyle = gr; g.fillRect(-60, BARRA + 10, W + 120, H - BARRA + 60);
    g.fillStyle = "rgba(0,0,0,.35)";
    for (let x = 30; x < W; x += 96) g.fillRect(x, BARRA + 18, 3, H - BARRA);
    g.fillStyle = "#b8862d"; g.fillRect(-60, 556, W + 120, 9); g.fillStyle = "rgba(255,240,190,.6)"; g.fillRect(-60, 557, W + 120, 2);
    g.fillStyle = "#8a5426"; g.fillRect(-60, BARRA - 6, W + 120, 18);
    g.fillStyle = "rgba(255,220,170,.4)"; g.fillRect(-60, BARRA - 6, W + 120, 3);
    g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(-60, BARRA + 12, W + 120, 5);
    g.restore();
  }
  /** Cañas en el aire y en la barra. */
  lluvia(g, a) {
    const t = this.t;
    g.save(); g.globalAlpha = a;
    LLUVIA.forEach(([x, t0], i) => {
      if (t < t0) return;
      const yFin = BARRA - 18 * S_J, tl = caida(t0, yFin);
      let y, ang;
      if (t < tl) { const d = t - t0; y = Y0 + 0.5 * GRAV * d * d; ang = 0.3 * Math.sin(d * 9 + i); }
      else { const d = t - tl; y = yFin - Math.abs(Math.sin(d * 16)) * 14 * Math.exp(-d * 7); ang = 0.12 * Math.exp(-d * 6) * Math.sin(d * 20); }
      const esp = i % 2 === 1;
      jarraSuelta(g, x + (esp ? 17 : -17) * S_J, y, ang, S_J, t, esp);
    });
    // las que cazan, hasta que llegan a la mano
    for (const [t0, tc, M, esp] of [[this.t0G, T_CAZA_G, this.manoG, false], [this.t0R, T_CAZA_R, this.manoR, true]]) {
      if (t < t0 || t >= tc) continue;
      const d = t - t0, y = Y0 + 0.5 * GRAV * d * d;
      jarraSuelta(g, M[0], y, 0.15 * Math.sin(d * 8), ESC, t, esp);
    }
    // la del ¡TOC!
    if (t > this.t0T) {
      const C = this.cabezaR;
      let x, y, ang;
      if (t < T_TOC) { const d = t - this.t0T; x = C[0] - 22; y = Y0 + 0.5 * GRAV * d * d; ang = 0.1 * Math.sin(d * 7); }
      else {
        const d = t - T_TOC, yFin = BARRA - 18 * S_J, vy = -420;
        x = C[0] - 22 + 190 * d;
        y = C[1] - 30 + vy * d + 0.5 * GRAV * d * d;
        const tl = (-vy + Math.sqrt(vy * vy + 2 * GRAV * (yFin - C[1] + 30))) / GRAV;
        if (d > tl) { const dd = d - tl; x = C[0] - 22 + 190 * tl; y = yFin - Math.abs(Math.sin(dd * 16)) * 10 * Math.exp(-dd * 7); ang = 0.1 * Math.exp(-dd * 6) * Math.sin(dd * 20); }
        else ang = Math.min(d, tl) * (6.283 / tl);
      }
      jarraSuelta(g, x, y, ang, S_J, t, false);
    }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    this.fondo(g, a);
    const kTit = tramo(t, T_CHOQUE, T_CHOQUE + 0.25);
    this.reloj(g, a * (1 - 0.8 * kTit));
    // líneas de velocidad al correr
    if (t > T_CORRE && t < T_LLEGA + 0.1) {
      g.save(); g.globalAlpha = 0.5 * a * (1 - tramo(t, T_LLEGA - 0.1, T_LLEGA + 0.1)); g.strokeStyle = "#fff3c4"; g.lineWidth = 3; g.lineCap = "round";
      for (const [q, s] of [[0, -1], [1, 1]]) {
        const x = this.x(t, q);
        for (let i = 0; i < 4; i++) { const y = 300 + i * 34, x0 = x + s * (78 + (i % 2) * 20); g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + s * (70 + i * 12), y); g.stroke(); }
      }
      g.restore();
    }
    g.save(); g.globalAlpha = a;
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    g.restore();
    this.barra(g, a);
    this.lluvia(g, a);
    // estrellitas del ¡TOC!
    const dT = t - T_TOC;
    if (dT > 0 && dT < 0.9) {
      const C = this.cabezaR;
      for (let i = 0; i < 3; i++) { const an = dT * 7 + (i * 6.283) / 3; brillo(g, C[0] + Math.cos(an) * 46, C[1] + 6 + Math.sin(an) * 12, 14, a * (1 - tramo(dT, 0.6, 0.9))); }
      const k = eBack(tramo(dT, 0, 0.12));
      g.save(); g.translate(C[0] + 112, C[1] - 6); g.rotate(0.15); g.scale(k, k);
      txt(g, "¡TOC!", 0, 0, { tam: 46, peso: 400, fam: FC, color: "#fffdf5", borde: "#1b1b1b", bordeAncho: 7, esp: 2, alfa: a * (1 - tramo(dT, 0.65, 0.9)) });
      g.restore();
    }
    this.p.dibujar(g);
    // ¡HORA FELIZ!
    if (t > T_CHOQUE) {
      const d = t - T_CHOQUE, k = tramo(d, 0, 0.18), s = lerp(2.6, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a; g.translate(512, 126); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has(1)) return CT.get(1);
    const c = lienzoNuevo(860, 230), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 60, 0, 170);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡HORA FELIZ!", 430, 166, { tam: 150, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 12, esp: 5, glow: "rgba(255,190,40,.85)", glowTam: 26, max: 800 });
    CT.set(1, c);
    return c;
  }
}

registrar({ id: "00137", nombre: "Hora feliz", crear: () => new HoraFeliz() });
})();
