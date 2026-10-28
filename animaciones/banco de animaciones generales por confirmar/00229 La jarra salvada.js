"use strict";
/*
 * 00229 · LA JARRA SALVADA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Guillermo cuenta una batallita apoyado en la barra y, con un aspaviento, le da un manotazo a su jarra: resbala hasta
 * el borde, se tambalea… y cae. Todo va a cámara lenta («NOOOOO…»): Marcos, de uniforme, se lanza en plancha como en
 * un rescate y la coge al vuelo en la palma de la mano; las gotas que se escapaban vuelven a la jarra. Se desliza por
 * el suelo sin derramar nada: ¡SALVADA! Se levanta con la jarra en alto y Guillermo corre a abrazarlo. Fundido a negro.
 */
(() => {
const CT = cacheTexto();
const DUR = 9.6, ESC = 1.45, TOPE = 405, FIN_BARRA = 620;   // barra: arriba en TOPE, se acaba en FIN_BARRA
const XG = 360, XM = 930, XG2 = 604, XM2 = 724;
const L0 = 2.4, L1 = 4.8, F = 0.3;                           // cámara lenta (tiempo real) y su ritmo
const S_GOLPE = 1.55, S_BORDE = 2.15, S_CAE = 2.4, S_SALTA = 2.45, S_COGE = L0 + (L1 - L0) * F, S_SUELO = 3.3;
const S_TIT = 3.6, S_LEVANTA = 4.25, S_CORRE = 4.7, S_ABRAZO = 5.3, T_APAGA = 9.0;
const J0 = 500;                                              // la jarra, al principio (centro de la base)
const P0 = [XM, PIES - 116 * ESC * 0.88], P1 = [848, 470], P2 = [806, 528], P3 = [XM2, 528];
const BANDEJA = [100, 50];                                   // la mano que coge la jarra (tumbado, queda arriba)
const escena = (t) => (t < L0 ? t : t < L1 ? L0 + (t - L0) * F : L0 + (L1 - L0) * F + (t - L1));
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
/** Dónde acaba de verdad la mano derecha (con el brazo estirado si no llega). */
function manoReal(quien, T) {
  const R = avatar(quien).rig, b = ik(R.hombroD, T, R.L1, R.L2);
  return [b.E[0] + Math.cos(b.a2) * R.L2, b.E[1] + Math.sin(b.a2) * R.L2];
}
/** Jarra en pantalla: (x, y) = centro de la base; gira `ang` sobre ese punto. */
function jarraPant(g, x, y, ang, nivel, t) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(ESC, ESC);
  dibujarJarra(g, [-17, -18], 0, nivel, "asa", t); dibujarJarra(g, [-17, -18], 0, nivel, "cuerpo", t);
  g.restore();
}
function botella(g, x, y, w, h, c1, c2) {
  const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  gr.addColorStop(0, c2); gr.addColorStop(0.45, c1); gr.addColorStop(1, c2);
  g.fillStyle = gr;
  const hc = h * 0.62;
  rectR(g, x - w / 2, y - hc, w, hc, 3); g.fill();
  g.beginPath(); g.moveTo(x - w / 2 + 1, y - hc + 3); g.quadraticCurveTo(x - w * 0.2, y - hc - 5, x - w * 0.17, y - h + 5);
  g.lineTo(x + w * 0.17, y - h + 5); g.quadraticCurveTo(x + w * 0.2, y - hc - 5, x + w / 2 - 1, y - hc + 3); g.closePath(); g.fill();
  g.fillStyle = "#151515"; g.fillRect(x - w * 0.19, y - h, w * 0.38, 6);
  g.fillStyle = "rgba(255,248,225,.7)"; g.fillRect(x - w / 2 + 2, y - hc * 0.66, w - 4, hc * 0.32);
}
function corazon(g, x, y, s, a) {
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s);
  g.fillStyle = "#ff3d84";
  g.beginPath(); g.moveTo(0, 6); g.bezierCurveTo(-12, -2, -8, -12, 0, -5); g.bezierCurveTo(8, -12, 12, -2, 0, 6); g.fill();
  g.fillStyle = "rgba(255,255,255,.5)"; g.beginPath(); g.ellipse(-4, -5, 2.2, 1.4, -0.5, 0, 6.283); g.fill();
  g.restore();
}

class JarraSalvada extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(320);
    this.cF = null; this.C = null;
  }
  luz() { return tramo(this.t, 0, 0.45) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  // ------------------------------------------------------------------ Marcos
  poseM(s) {
    const M = { quien: "bombero", cara: "risa", rc: -0.08, piernaI: [0, 0], piernaD: [0, 0], manoD: [76, 128], manoI: [-2, 128] };
    let m, giro = 0;
    if (s < S_SALTA) {
      // escucha la batallita… y ve la jarra
      let sy = 1;
      if (s > S_GOLPE) { M.cara = "sorpresa"; M.rc = -0.16; M.manoD = [80, 90]; M.manoI = [-8, 92]; }
      if (s > S_BORDE + 0.1) { const k = eInOut(tramo(s, S_BORDE + 0.1, S_SALTA)); sy = 1 - 0.12 * k; M.manoD = mezcla([80, 90], [72, 60], k); M.manoI = mezcla([-8, 92], [2, 60], k); }
      m = matAv(XM, PIES, ESC, 0, 1, sy);
      return { M, m };
    }
    if (s < S_COGE) {
      // ¡en plancha!
      const u = tramo(s, S_SALTA, S_COGE), k = eOut(Math.min(1, u * 2.2));
      const c = [lerp(P0[0], P1[0], u), lerp(P0[1], P1[1], u) - 90 * Math.sin(u * Math.PI)];
      giro = -Math.PI / 2 * k;
      M.manoD = mezcla([72, 60], BANDEJA, k); M.manoI = mezcla([2, 60], [12, 30], k); M.cara = "sorpresa"; M.rc = 0;
      M.piernaI = [-6 * k, 0.12 * k]; M.piernaD = [0, -0.06 * k];
      return { M, m: matAv(c[0], c[1], ESC, giro, 1, 1, [39, 116]) };
    }
    let c = P1;
    if (s < S_SUELO) c = mezcla(P1, P2, eIn(tramo(s, S_COGE, S_SUELO)));
    else c = mezcla(P2, P3, eOut(tramo(s, S_SUELO, S_SUELO + 0.5)));
    giro = -Math.PI / 2;
    M.manoD = BANDEJA; M.manoI = [12, 30]; M.cara = s < S_COGE + 0.15 ? "sorpresa" : "risa"; M.rc = 0;
    if (s > S_SUELO + 0.55) { M.cara = "guino"; M.rc = 0.1; }
    if (s > S_LEVANTA) {
      // se levanta con la jarra en alto
      const k = eInOut(tramo(s, S_LEVANTA, S_LEVANTA + 0.5));
      giro = -Math.PI / 2 * (1 - k);
      c = mezcla(P3, [XM2, PIES - 116 * ESC], k);
      M.manoD = mezcla(BANDEJA, [72, 36], k); M.manoI = mezcla([12, 30], [-4, 128], k);
      M.cara = "risa"; M.rc = 0;
    }
    if (s > S_ABRAZO - 0.2) {
      const k = eInOut(tramo(s, S_ABRAZO - 0.2, S_ABRAZO + 0.1));
      M.manoI = mezcla([-4, 128], [-14, 104], k); M.rc = -0.14 * k + 0.04 * Math.sin(s * 5) * k;
      M.cara = s > 6.6 && s < 6.9 ? "guino" : "risa";
    }
    if (s > S_LEVANTA + 0.5) M.manoD = [72, 36 + 2 * Math.sin(s * 6)];
    return { M, m: matAv(c[0], c[1], ESC, giro, 1, 1, [39, 116]) };
  }
  /** Punto de la palma de Marcos (donde se apoya la base de la jarra), en pantalla. */
  palma(s) {
    const e = this.poseM(s), h = manoReal("bombero", e.M.manoD);
    const p = aPant(e.m, h);
    return [p[0], p[1] - 8];
  }
  // ------------------------------------------------------------------ Guillermo
  poseG(s) {
    const G = { cara: "risa", rc: 0.08, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let x = XG, y = PIES, giro = 0;
    let gD = [82, 112], gI = [-4, 128];
    // la batallita
    if (s < S_GOLPE - 0.3) {
      const u = s * 3.2;
      gD = [92 + 8 * Math.sin(u), 66 + 10 * Math.cos(u * 1.3)]; gI = [-8 + 6 * Math.sin(u * 0.8), 110];
      G.cara = Math.sin(s * 4) > 0.2 ? "risa" : "guino"; G.rc = 0.1 + 0.05 * Math.sin(s * 5);
    } else if (s < S_GOLPE + 0.25) {
      // ¡el aspaviento!
      const k = eIn(tramo(s, S_GOLPE - 0.3, S_GOLPE)), k2 = eOut(tramo(s, S_GOLPE, S_GOLPE + 0.25));
      const golpe = enAv(matAv(XG, PIES, ESC), [478, 386]);
      gD = mezcla(mezcla([96, 50], golpe, k), [golpe[0] + 14, golpe[1] - 4], k2); gI = [-12, 100];
      G.cara = "risa"; G.rc = 0.12;
    } else {
      // ¡la jarra! intenta cogerla
      const k = eOut(tramo(s, S_GOLPE + 0.2, S_GOLPE + 0.5));
      gD = mezcla([110, 100], [150, 96], k); gI = mezcla([-12, 100], [60, 92], k);
      G.cara = "sorpresa"; G.rc = 0.18; giro = 0.1 * k;
      G.puntas = s > S_CAE && s < S_COGE ? 0.6 : 0;
    }
    // ¡salvada! salta de alegría
    if (s > S_COGE + 0.2) {
      const k = eOut(tramo(s, S_COGE + 0.2, S_COGE + 0.45));
      gD = mezcla(gD, [96, 26], k); gI = mezcla(gI, [-18, 26], k); giro = 0.1 * (1 - k);
      G.cara = "risa"; G.rc = 0.05 * Math.sin(s * 9);
      if (s < S_CORRE) y = PIES - Math.abs(Math.sin((s - S_COGE) * 9)) * 22 * k;
    }
    // corre a abrazarlo
    if (s > S_CORRE) {
      const u = tramo(s, S_CORRE, S_ABRAZO - 0.1);
      x = lerp(XG, XG2, eInOut(u));
      if (u > 0 && u < 1) { const a = andar(s * 16, 1.2); G.piernaI = a.piernaI; G.piernaD = a.piernaD; y = PIES + a.bote; }
      gD = [86, 70]; gI = [-10, 70]; G.cara = "risa"; G.rc = 0.1;
    }
    if (s > S_ABRAZO - 0.2) {
      const k = eInOut(tramo(s, S_ABRAZO - 0.2, S_ABRAZO + 0.1));
      const mM = this.poseM(s).m, mG = matAv(x, y, ESC);
      const hombro = enAv(mG, aPant(mM, [24, 92]));
      gD = mezcla([86, 70], hombro, k); gI = mezcla([-10, 70], [6, 124], k);
      G.cara = s > 5.8 && s < 6.6 ? "dormido" : "risa"; G.rc = 0.15 * k + 0.04 * Math.sin(s * 5) * k;
      giro = 0.06 * k;
    }
    G.manoD = gD; G.manoI = gI;
    return { G, m: matAv(x, y, ESC, giro) };
  }
  // ------------------------------------------------------------------ la jarra
  /** { x, y, ang, enBarra } (centro de la base). */
  jarra(s) {
    if (!this.C) { const p = this.palma(S_COGE); this.C = [p[0], p[1]]; }
    if (s < S_GOLPE) return { x: J0, y: TOPE, ang: 0, enBarra: true };
    if (s < S_BORDE) return { x: lerp(J0, FIN_BARRA - 6, tramo(s, S_GOLPE, S_BORDE) * (1.6 - 0.6 * tramo(s, S_GOLPE, S_BORDE))), y: TOPE, ang: 0, enBarra: true };
    if (s < S_CAE) {
      // se asoma al borde y vuelca
      const k = tramo(s, S_BORDE, S_CAE);
      return { x: lerp(FIN_BARRA - 6, FIN_BARRA + 4, k), y: TOPE + 4 * k * k, ang: 0.35 * k * k, enBarra: true };
    }
    if (s < S_COGE) {
      const u = tramo(s, S_CAE, S_COGE);
      return { x: lerp(FIN_BARRA + 4, this.C[0], u), y: lerp(TOPE + 4, this.C[1], u) - 70 * Math.sin(u * Math.PI), ang: lerp(0.35, 1.25, u), enBarra: u < 0.08 };
    }
    const p = this.palma(s), k = tramo(s, S_COGE, S_COGE + 0.3);
    return { x: p[0], y: p[1], ang: 1.25 * (1 - eElastico(k)), enBarra: false };
  }
  /** Gotas que se escapan del borde y vuelven a la jarra. */
  gotas(s) {
    if (s < S_CAE + 0.12 || s > S_COGE + 0.35) return [];
    const j = this.jarra(Math.min(s, S_COGE - 0.001)), r = rot2([10 * ESC, -36 * ESC], j.ang), borde = [j.x + r[0], j.y + r[1]];
    const sale = tramo(s, S_CAE + 0.12, S_COGE), vuelve = eInOut(tramo(s, S_COGE, S_COGE + 0.3));
    const out = [];
    for (let i = 0; i < 4; i++) {
      const o = [borde[0] + (14 + i * 11) * sale, borde[1] - (10 + i * 7) * sale + (i % 2 ? 6 : -4) * sale];
      const jj = this.jarra(s), dest = [jj.x, jj.y - 34 * ESC];
      out.push([lerp(o[0], dest[0], vuelve), lerp(o[1], dest[1], vuelve), 4 + (i % 2) * 2]);
    }
    return out;
  }
  // ------------------------------------------------------------------ actualizar
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, s = escena(t), ds = t > L0 && t < L1 ? dt * F : dt;
    this.una("golpe", s > S_GOLPE, () => { temblar(6, 0.15); p.nueva(P.DESTELLO, 480, 385, 0, 0, 0.25, 90); });
    if (s > S_SALTA && s < S_COGE && Math.random() < 6 * dt) {
      const e = this.poseM(s), c = aPant(e.m, [39, 200]);
      p.nueva(P.POLVO, c[0], c[1], azar(20, 60), azar(-10, 10), azar(0.6, 1), azar(20, 34));
    }
    this.una("coge", s > S_COGE, () => {
      temblar(14, 0.35);
      const c = this.jarra(s);
      p.nueva(P.DESTELLO, c.x, c.y - 40, 0, 0, 0.35, 200);
      for (let i = 0; i < 16; i++) { const a = azar(0, 6.283), v = azar(140, 340); p.nueva(P.CHISPA, c.x, c.y - 40, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(5, 9)); }
    });
    if (s > S_SUELO && s < S_SUELO + 0.5 && Math.random() < 40 * dt) {
      const e = this.poseM(s), c = aPant(e.m, [39, 180]);
      p.nueva(P.POLVO, c[0] + azar(-20, 40), PIES - 4, azar(30, 120), azar(-40, -10), azar(0.5, 0.9), azar(24, 40));
    }
    this.una("suelo", s > S_SUELO, () => temblar(8, 0.25));
    this.una("tit", s > S_TIT, () => {
      temblar(16, 0.4);
      for (let i = 0; i < 70; i++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-80, -10), azar(-40, 40), azar(0, 120), azar(2.4, 3.4), azar(9, 15), i % 5);
    });
    p.suelo = () => PIES;
    p.alfa = this.luz();
    p.actualizar(ds);
  }
  // ------------------------------------------------------------------ fondo
  fondoBar() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gr = g.createLinearGradient(0, -60, 0, H);
    gr.addColorStop(0, "#140b07"); gr.addColorStop(0.6, "#25150b"); gr.addColorStop(1, "#160c06");
    g.fillStyle = gr; g.fillRect(-60, -60, W + 120, H + 120);
    g.fillStyle = "rgba(0,0,0,.22)"; for (let x = -40; x < W + 60; x += 58) g.fillRect(x, -60, 3, H + 120);
    const r = semilla(31);
    const COL = [["#3a9a4a", "#174a20"], ["#b0521e", "#4a1a06"], ["#e0b840", "#7a5a10"], ["#4a7ac0", "#13305a"], ["#c02238", "#500810"], ["#ecebdc", "#8a8670"]];
    for (const y of [150, 238]) {
      for (let x = 22; x < W - 10; x += 24 + r() * 9) {
        if (r() < 0.12) continue;
        const [c1, c2] = COL[(r() * COL.length) | 0];
        botella(g, x, y, 13 + r() * 5, 40 + r() * 26, c1, c2);
      }
      g.fillStyle = "#6a3e1c"; g.fillRect(-60, y, W + 120, 9);
      g.fillStyle = "rgba(255,210,150,.3)"; g.fillRect(-60, y, W + 120, 2);
      g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(-60, y + 9, W + 120, 7);
    }
    // suelo de madera
    const gs = g.createLinearGradient(0, 548, 0, H);
    gs.addColorStop(0, "#4a2a14"); gs.addColorStop(1, "#24130a");
    g.fillStyle = gs; g.fillRect(-60, 548, W + 120, H - 548 + 60);
    g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2;
    for (let i = -8; i <= 8; i++) { g.beginPath(); g.moveTo(512 + i * 70, 548); g.lineTo(512 + i * 150, H + 60); g.stroke(); }
    g.fillStyle = "rgba(255,220,170,.12)"; g.fillRect(-60, 548, W + 120, 2);
    // la barra (a la izquierda), con su esquina
    const gb = g.createLinearGradient(0, TOPE, 0, PIES);
    gb.addColorStop(0, "#6a3a1a"); gb.addColorStop(1, "#2a160a");
    g.fillStyle = gb; g.fillRect(-60, TOPE + 10, FIN_BARRA + 60, PIES - TOPE - 10);
    g.fillStyle = "rgba(0,0,0,.3)"; for (let x = 20; x < FIN_BARRA; x += 90) g.fillRect(x, TOPE + 24, 3, PIES - TOPE - 30);
    g.fillStyle = "#3a1e0c"; g.fillRect(FIN_BARRA, TOPE + 10, 16, PIES - TOPE - 10);
    g.fillStyle = "#b8862d"; g.fillRect(-60, PIES - 34, FIN_BARRA + 60, 6);
    g.fillStyle = "#8a5426"; g.fillRect(-60, TOPE - 2, FIN_BARRA + 74, 14);
    g.fillStyle = "rgba(255,220,170,.45)"; g.fillRect(-60, TOPE - 2, FIN_BARRA + 74, 3);
    g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(-60, TOPE + 12, FIN_BARRA + 74, 5);
    // lámparas
    for (const x of [380, 760]) {
      g.strokeStyle = "#0b0b0b"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, -60); g.lineTo(x, 30); g.stroke();
      g.fillStyle = "#2a2e33"; g.beginPath(); g.moveTo(x - 32, 56); g.lineTo(x + 32, 56); g.lineTo(x + 12, 30); g.lineTo(x - 12, 30); g.closePath(); g.fill();
      g.fillStyle = "#fff3c4"; g.beginPath(); g.ellipse(x, 56, 24, 5, 0, 0, 6.283); g.fill();
    }
    g.globalCompositeOperation = "lighter";
    for (const x of [380, 760]) { g.globalAlpha = 0.4; g.drawImage(BLOB2.oro, x - 240, 10, 480, 480); }
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    const v = g.createRadialGradient(W / 2, 300, 240, W / 2, 300, 720);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.72)");
    g.fillStyle = v; g.fillRect(-60, -60, W + 120, H + 120);
    return (this.cF = c);
  }
  // ------------------------------------------------------------------ dibujar
  dibujar(g) {
    const t = this.t, s = escena(t), a = this.luz();
    const eG = this.poseG(s), eM = this.poseM(s), j = this.jarra(s);
    const lenta = tramo(t, L0, L0 + 0.25) * (1 - tramo(t, L1 - 0.1, L1 + 0.15));
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    g.drawImage(this.fondoBar(), -60, -60);
    foco(g, 380, 380, PIES, 190, 0.45); foco(g, 760, 760, PIES, 190, 0.45);
    for (const m of [eG.m, eM.m]) {
      const c = aPant(m, [39, 116]);
      g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(c[0], PIES + 2, 60, 9, 0, 0, 6.283); g.fill();
    }
    if (j.enBarra) jarraPant(g, j.x, j.y, j.ang, 0.9, s);
    if (s > S_ABRAZO - 0.2) { pintarAvatar(g, eM.m, eM.M, s); pintarAvatar(g, eG.m, eG.G, s); }
    else { pintarAvatar(g, eG.m, eG.G, s); pintarAvatar(g, eM.m, eM.M, s); }
    if (!j.enBarra) jarraPant(g, j.x, j.y, j.ang, 0.9, s);
    // gotas que vuelven
    g.fillStyle = "#ffb51f";
    for (const [x, y, r] of this.gotas(s)) { g.beginPath(); g.ellipse(x, y, r * 0.8, r, 0, 0, 6.283); g.fill(); g.fillStyle = "rgba(255,255,255,.6)"; g.beginPath(); g.arc(x - r * 0.3, y - r * 0.3, r * 0.25, 0, 6.283); g.fill(); g.fillStyle = "#ffb51f"; }
    // brillo de la jarra salvada
    if (s > S_COGE + 0.3 && s < S_ABRAZO + 1.5) brillo(g, j.x + 26, j.y - 70, 24 * Math.abs(Math.sin(s * 3.5)), 1);
    // corazones del abrazo
    if (s > S_ABRAZO) {
      for (let i = 0; i < 5; i++) {
        const u = ((s - S_ABRAZO) * 0.55 + i * 0.2) % 1, x = 664 + Math.sin(i * 2.1 + s * 2) * 70, y = 250 - u * 170;
        corazon(g, x, y, 1.6 + 0.6 * Math.sin(i), Math.min(1, (1 - u) * 2) * tramo(s, S_ABRAZO, S_ABRAZO + 0.3));
      }
    }
    g.restore();
    this.p.dibujar(g);
    // cámara lenta: tono azul, bandas y el NOOOO
    if (lenta > 0) {
      g.save(); g.globalAlpha = 0.22 * lenta * a; g.fillStyle = "#1a4a8a"; g.fillRect(-60, -60, W + 120, H + 120);
      g.globalAlpha = lenta * a; g.fillStyle = "#000"; g.fillRect(-60, -60, W + 120, 60 + 34 * lenta); g.fillRect(-60, H - 34 * lenta, W + 120, 120);
      g.restore();
      const n = Math.floor(tramo(t, L0, L1 - 0.3) * 9);
      const tx = "N" + "O".repeat(2 + n) + "…";
      g.save(); g.translate(330, 190); g.rotate(-0.06); g.scale(1 + 0.08 * tramo(t, L0, L1), 1);
      txt(g, tx, 0, 0, { tam: 58, peso: 400, fam: FC, color: "#fffdf5", borde: "#14284a", bordeAncho: 8, esp: 4, alfa: a * lenta });
      g.restore();
    }
    const ono = (tx, x, y, s0, dur, tam, col, borde, rot) => {
      const d = s - s0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, tx, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: a * (1 - tramo(d, dur - 0.15, dur)) });
      g.restore();
    };
    ono("¡ZAS!", 500, 330, S_GOLPE, 0.45, 50, "#ffd34d", "#3a2400", -0.1);
    ono("¡OH, OH!", 690, 330, S_BORDE + 0.02, 0.4, 40, "#fffdf5", "#1b1b1b", 0.06);
    ono("¡HOP!", 640, 290, S_COGE, 0.5, 58, "#ffd34d", "#3a2400", -0.06);
    ono("¡NI UNA GOTA!", 790, 220, S_SUELO + 0.5, 1.2, 40, "#fffdf5", "#1b1b1b", 0.05);
    // ¡SALVADA!
    if (s > S_TIT) {
      const d = s - S_TIT, k = tramo(d, 0, 0.18), sc = lerp(2.2, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a; g.translate(512, 100); g.rotate(-0.04); g.scale(sc, sc);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(800, 210), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 165);
    gr.addColorStop(0, "#fffef0"); gr.addColorStop(0.5, "#ffe58a"); gr.addColorStop(1, "#f2a100");
    txt(g, "¡SALVADA!", 406, 168, { tam: 150, peso: 900, fam: FD, color: "#3a2400", esp: 6 });
    txt(g, "¡SALVADA!", 400, 160, { tam: 150, peso: 900, fam: FD, color: gr, borde: "#3a2400", bordeAncho: 13, esp: 6, glow: "rgba(255,200,40,.9)", glowTam: 26 });
    CT.set("t", c);
    return c;
  }
}

registrar({ id: "00229", nombre: "La jarra salvada", crear: () => new JarraSalvada() });
})();
