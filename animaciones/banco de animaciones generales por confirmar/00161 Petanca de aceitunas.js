"use strict";
/*
 * 00161 · PETANCA DE ACEITUNAS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Petanca en la barra: Marcos tira el altramuz (el boliche) y Guillermo arrima su aceituna verde hasta dejarla
 * pegadita. Marcos carga la suya, negra, con efecto (gira y brilla), la lanza muy alta y cae justo encima: ¡CLAC!
 * La de Guillermo sale volando y acaba dentro de su propia jarra (¡PLOF!). ¡BOCHAZO! Guillermo se la bebe igual.
 */
(() => {
const ESC = 1.8, AY = 652, BARRA = 470, XG = 170, XM = 854;
const SUELO = 466;                                     // donde se apoyan las cosas en la barra
const JACK = [540, SUELO - 9], RA = 23;                // altramuz y radio de la aceituna
const PEGADA = [JACK[0] - 15 - RA - 1, SUELO - 17];    // la de Guillermo, pegada al altramuz
const JARRA_G = [296, SUELO], JE = 1.8;                // jarra de Guillermo (centro abajo) y su escala
const T_BOL = 0.9, T_BOL_C = 1.35, T_TG = 1.9, T_TG_C = 2.45, T_PARA = 3.1, T_TM = 4.55, T_CLAC = 5.25, T_PLOF = 5.85, DUR = 9.8, T_APAGA = 9.2;
const CT = cacheTexto();
const aU = (X, q) => [(q[0] - X) / ESC + 39, (q[1] - AY) / ESC + 232];

/** Aceituna (x, y = centro). verde: rellena de pimiento; si no, negra. */
function aceituna(g, x, y, ang, verde, s = 1.35) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  g.fillStyle = "rgba(0,0,0,.3)"; g.beginPath(); g.ellipse(2, 13, 14, 3.5, 0, 0, 6.283); g.fill();
  const gr = g.createRadialGradient(-5, -5, 1, 0, 0, 17);
  if (verde) { gr.addColorStop(0, "#e2ee8a"); gr.addColorStop(0.45, "#9cb532"); gr.addColorStop(1, "#4d6410"); }
  else { gr.addColorStop(0, "#8c6a96"); gr.addColorStop(0.45, "#3c2442"); gr.addColorStop(1, "#140a16"); }
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 17, 13, 0, 0, 6.283); g.fill();
  g.strokeStyle = verde ? "#3a4c0a" : "#0a050b"; g.lineWidth = 1.6; g.stroke();
  if (verde) { // el pimiento
    g.fillStyle = "#e3262f"; g.beginPath(); g.ellipse(14, 0, 4.5, 5.5, 0, 0, 6.283); g.fill();
    g.fillStyle = "#ff8a7a"; g.beginPath(); g.ellipse(13, -1.5, 1.6, 2, 0, 0, 6.283); g.fill();
  }
  g.fillStyle = "rgba(255,255,255,.7)"; g.beginPath(); g.ellipse(-6, -6, 4.5, 2.4, -0.4, 0, 6.283); g.fill();
  g.restore();
}
/** Altramuz: grano plano amarillo. */
function altramuz(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(1.3, 1.3);
  g.fillStyle = "rgba(0,0,0,.3)"; g.beginPath(); g.ellipse(1, 7, 11, 2.5, 0, 0, 6.283); g.fill();
  const gr = g.createLinearGradient(0, -8, 0, 8);
  gr.addColorStop(0, "#fff2a0"); gr.addColorStop(0.5, "#f2c230"); gr.addColorStop(1, "#b88a10");
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 11.5, 7.5, 0, 0, 6.283); g.fill();
  g.strokeStyle = "#7a5a08"; g.lineWidth = 1.3; g.stroke();
  g.fillStyle = "#c79a20"; g.beginPath(); g.ellipse(-7, 0, 1.6, 3, 0, 0, 6.283); g.fill();
  g.fillStyle = "rgba(255,255,255,.6)"; g.beginPath(); g.ellipse(2, -4, 4, 1.4, 0, 0, 6.283); g.fill();
  g.restore();
}
/** Parábola de A a B (altura `alto` sobre la recta). */
const arco = (A, B, u, alto) => [lerp(A[0], B[0], u), lerp(A[1], B[1], u) - 4 * alto * u * (1 - u)];

class Petanca extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(320);
    // de dónde salen los tiros (la mano al soltar)
    const e0 = this.poses(T_BOL), e1 = this.poses(T_TG), e2 = this.poses(T_TM);
    this.sBol = aPant(e0[1].m, e0[1].pose.manoI);
    this.sG = aPant(e1[0].m, e1[0].pose.manoD);
    this.sM = aPant(e2[1].m, e2[1].pose.manoI);
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** Altramuz. */
  bol(t) {
    if (t < T_BOL) return null;
    if (t < T_BOL_C) { const u = (t - T_BOL) / (T_BOL_C - T_BOL); const q = arco(this.sBol, JACK, u, 70); return { x: q[0], y: q[1], a: u * 9 }; }
    const d = t - T_BOL_C, b = Math.abs(Math.sin(d * 14)) * 10 * Math.exp(-d * 7);
    return { x: JACK[0], y: JACK[1] - b, a: 0.2 * Math.sin(d * 18) * Math.exp(-d * 5) };
  }
  /** Aceituna de Guillermo. */
  olG(t) {
    if (t < T_TG) return null;
    const L = [430, SUELO - 17];
    if (t < T_TG_C) { const u = (t - T_TG) / (T_TG_C - T_TG); const q = arco(this.sG, L, u, 90); return { x: q[0], y: q[1], a: u * 6 }; }
    if (t < T_CLAC) {
      const k = eOut(tramo(t, T_TG_C, T_PARA)), x = lerp(L[0], PEGADA[0], k);
      const bote = t < T_TG_C + 0.2 ? Math.sin(Math.PI * tramo(t, T_TG_C, T_TG_C + 0.2)) * 12 : 0;
      return { x, y: PEGADA[1] - bote, a: 6 + (x - L[0]) / RA };
    }
    // ¡CLAC!: sale volando a su jarra
    const top = [JARRA_G[0], JARRA_G[1] - 36 * JE - 10];
    if (t < T_PLOF) { const u = (t - T_CLAC) / (T_PLOF - T_CLAC); const q = arco(PEGADA, top, u, 150); return { x: q[0], y: q[1], a: -u * 14 }; }
    const k = eOut(tramo(t, T_PLOF, T_PLOF + 0.5));
    return { x: JARRA_G[0] + 4 * Math.sin(t * 3), y: lerp(top[1], JARRA_G[1] - 24, k), a: 0.5, dentro: true };
  }
  /** Aceituna de Marcos (con efecto). */
  olM(t) {
    if (t < T_TM) return null;
    if (t < T_CLAC) {
      const u = (t - T_TM) / (T_CLAC - T_TM), q = arco(this.sM, PEGADA, u, 290);
      return { x: q[0] + 60 * Math.sin(Math.PI * u) * Math.sin(Math.PI * u * 2), y: q[1], a: -u * 30, vuela: true };
    }
    const d = t - T_CLAC, b = Math.abs(Math.sin(d * 11)) * 22 * Math.exp(-d * 5);
    return { x: PEGADA[0], y: PEGADA[1] - b, a: -30 - d * 3 * Math.exp(-d * 4) };
  }
  poses(t = this.t) {
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [72, 136], manoI: [8, 140] };
    const M = { quien: "marcos", cara: "guino", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [64, 136], manoI: [8, 136], brazoIDelante: true };
    // Marcos tira el altramuz
    if (t > 0.5 && t < 1.4) {
      const k1 = eInOut(tramo(t, 0.5, T_BOL - 0.12)), k2 = eOut(tramo(t, T_BOL - 0.12, T_BOL)), k3 = eInOut(tramo(t, T_BOL + 0.1, 1.4));
      M.manoI = mezcla(mezcla(mezcla([8, 136], [14, 150], k1), [-20, 96], k2), [8, 136], k3);
    }
    // Guillermo apunta y tira
    if (t > 1.3 && t < 2.4) {
      const k1 = eInOut(tramo(t, 1.3, T_TG - 0.15)), k2 = eOut(tramo(t, T_TG - 0.15, T_TG)), k3 = eInOut(tramo(t, T_TG + 0.15, 2.4));
      G.manoD = mezcla(mezcla(mezcla([72, 136], [62, 150], k1), [96, 96], k2), [72, 136], k3);
      if (t < T_TG) { G.cara = "guino"; G.rc = 0.08; }
    }
    if (t > T_TG && t < T_PARA) { G.cara = "sorpresa"; M.cara = "sorpresa"; G.rc = 0.06; M.rc = -0.06; }
    if (t >= T_PARA && t < 3.85) {
      // ¡pegadita!: Guillermo lo celebra
      G.cara = "risa"; M.cara = t < 3.5 ? "sorpresa" : "guino";
      const k = eBack(tramo(t, T_PARA, T_PARA + 0.25)) * (1 - eInOut(tramo(t, 3.6, 3.9)));
      G.manoI = mezcla([8, 140], [-16, 46 + 4 * Math.sin(t * 14)], k); G.brazoIDelante = k > 0.05;
    }
    // Marcos carga la suya con efecto y la lanza
    if (t >= 3.6 && t < T_TM + 0.5) {
      const k1 = eInOut(tramo(t, 3.6, 3.95)), k2 = eOut(tramo(t, T_TM - 0.15, T_TM)), k3 = eInOut(tramo(t, T_TM + 0.1, T_TM + 0.5));
      let p = mezcla([8, 136], [6, 74 + 3 * Math.sin(t * 20)], k1);
      if (t > T_TM - 0.35) p = mezcla(p, [14, 120], eInOut(tramo(t, T_TM - 0.35, T_TM - 0.15)));
      p = mezcla(p, [-22, 92], k2);
      M.manoI = mezcla(p, [8, 136], k3);
      if (t < T_TM) { M.cara = t < 4.2 ? "guino" : "risa"; G.cara = "sorpresa"; G.rc = 0.04 * Math.sin(t * 12); }
    }
    if (t >= T_TM && t < T_CLAC) { G.cara = "sorpresa"; M.cara = "guino"; G.rc = -0.08 * tramo(t, T_TM, T_CLAC); }
    if (t >= T_CLAC) {
      const d = t - T_CLAC;
      M.cara = d < 2.4 ? "risa" : "guino";
      const k = eBack(tramo(d, 0.1, 0.4));
      M.manoI = mezcla([8, 136], [-12, 30 + 4 * Math.sin(t * 9)], k * (1 - eInOut(tramo(d, 2.6, 3.0))));
      M.rc = 0.06 * Math.sin(d * 6);
      // Guillermo mira su jarra… y se la bebe con aceituna y todo
      G.cara = t < T_PLOF + 0.1 ? "sorpresa" : t < 7.0 ? "borracho" : "sonrisa";
      G.rc = t < T_PLOF ? -0.12 : 0.1;
      const kC = eInOut(tramo(t, 6.9, 7.2)), kS = eInOut(tramo(t, 7.25, 7.55)), kT = tramo(t, 7.55, 8.45), kB = eInOut(tramo(t, 8.45, 8.75));
      if (t > 6.9) {
        const rcB = -0.32 * eInOut(tramo(t, 7.4, 7.6)) * (1 - kB);
        const inc = (-0.4 * kS - 1.2 * eInOut(kT)) * (1 - kB);
        const b = boca(rcB), r = rot2(JARRA.borde, inc), obj = [b[0] - r[0], b[1] - r[1]];
        const asa = aU(XG, [JARRA_G[0] - 17 * JE, JARRA_G[1] - 18 * JE]);
        let mano = mezcla([72, 136], asa, kC);
        if (t > 7.2) { mano = mezcla(asa, obj, kS); if (kB > 0) mano = mezcla(obj, [74, 112], kB); }
        G.manoD = mano;
        if (t > 7.2) {
          G.rc = rcB; G.jarra = { inc, nivel: clamp(0.85 - 0.75 * kT, 0, 1) };
          if (kT < 0.5) G.objD2 = (g, m, a2) => this.olivaEnJarra(g, m, inc);
        }
        if (t > 7.55 && t < 8.5) G.cara = "dormido";
        if (t > 8.5) { G.cara = "risa"; G.manoI = mezcla([8, 140], [-16, 52], eBack(tramo(t, 8.55, 8.8))); G.brazoIDelante = true; }
      }
    }
    return [{ pose: G, m: matAv(XG, AY, ESC, 0.02) }, { pose: M, m: matAv(XM, AY, ESC, -0.02) }];
  }
  /** La aceituna dentro de la jarra que lleva en la mano. */
  olivaEnJarra(g, m, inc) {
    g.save(); g.translate(m[0], m[1]); g.rotate(inc);
    g.beginPath(); g.rect(JARRA.x0 + 1, JARRA.y0 + 1, JARRA.x1 - JARRA.x0 - 2, JARRA.y1 - JARRA.y0 - 2); g.clip();
    g.globalAlpha *= 0.85; aceituna(g, 17, 8, 0.4, true, 1 / ESC);
    g.restore();
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("bol", t > T_BOL_C, () => { temblar(4, 0.1); for (let k = 0; k < 6; k++) p.nueva(P.POLVO, JACK[0], SUELO, azar(-60, 60), azar(-40, -5), azar(0.3, 0.5), azar(10, 16)); });
    this.una("cae", t > T_TG_C, () => { temblar(5, 0.12); for (let k = 0; k < 6; k++) p.nueva(P.POLVO, 440, SUELO, azar(-60, 60), azar(-40, -5), azar(0.3, 0.5), azar(10, 16)); });
    this.una("pega", t > T_PARA, () => { p.nueva(P.DESTELLO, PEGADA[0] + 14, PEGADA[1], 0, 0, 0.3, 80); });
    // la aceituna de Marcos brilla con su efecto
    if (t > 3.95 && t < T_CLAC && Math.random() < 40 * dt) {
      const o = this.olM(t), e = this.poses(t), h = o ? [o.x, o.y] : aPant(e[1].m, e[1].pose.manoI);
      p.nueva(P.PURPURINA, h[0] + azar(-14, 14), h[1] - 16 + azar(-14, 14), azar(-30, 30), azar(-40, 10), azar(0.4, 0.8), azar(10, 16));
    }
    this.una("clac", t > T_CLAC, () => {
      temblar(26, 0.5);
      p.nueva(P.DESTELLO, PEGADA[0], PEGADA[1], 0, 0, 0.4, 230);
      for (let k = 0; k < 34; k++) { const a = azar(-Math.PI, 0), v = azar(220, 620); p.nueva(P.CHISPA, PEGADA[0], PEGADA[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(7, 13)); }
      for (let k = 0; k < 12; k++) p.nueva(P.POLVO, PEGADA[0] + azar(-30, 30), SUELO, azar(-200, 200), azar(-60, -5), azar(0.5, 0.9), azar(20, 34));
    });
    this.una("plof", t > T_PLOF, () => {
      temblar(10, 0.25);
      const top = [JARRA_G[0], JARRA_G[1] - 36 * JE];
      for (let k = 0; k < 22; k++) p.nueva(P.ESPUMA, top[0] + azar(-20, 20), top[1], azar(-160, 160), azar(-380, -120), azar(0.5, 0.9), azar(6, 11));
      for (let k = 0; k < 10; k++) p.nueva(P.GOTA, top[0] + azar(-16, 16), top[1], azar(-140, 140), azar(-420, -180), azar(0.5, 0.8), azar(3, 5));
    });
    this.una("tit", t > T_CLAC + 0.08, () => {
      for (let k = 0; k < 80; k++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-90, -10), azar(-40, 40), azar(0, 120), azar(2.2, 3.4), azar(9, 15), k % 5);
    });
    p.suelo = () => SUELO;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  barra(g) {
    if (!CT.has("barra")) {
      const c = lienzoNuevo(W + 120, H - BARRA + 70), b = c.getContext("2d");
      b.translate(60, -BARRA + 10);
      const gr = b.createLinearGradient(0, BARRA, 0, H);
      gr.addColorStop(0, "#5a3218"); gr.addColorStop(1, "#24130a");
      b.fillStyle = gr; b.fillRect(-60, BARRA + 10, W + 120, H - BARRA + 60);
      b.fillStyle = "rgba(0,0,0,.35)";
      for (let x = 30; x < W; x += 96) b.fillRect(x, BARRA + 18, 3, H - BARRA);
      b.fillStyle = "#b8862d"; b.fillRect(-60, 556, W + 120, 9); b.fillStyle = "rgba(255,240,190,.6)"; b.fillRect(-60, 557, W + 120, 2);
      b.fillStyle = "#8a5426"; b.fillRect(-60, BARRA - 6, W + 120, 18);
      b.fillStyle = "rgba(255,220,170,.4)"; b.fillRect(-60, BARRA - 6, W + 120, 3);
      b.fillStyle = "rgba(0,0,0,.45)"; b.fillRect(-60, BARRA + 12, W + 120, 5);
      // marca de tiza: el círculo de tiro de cada uno
      b.strokeStyle = "rgba(245,245,240,.5)"; b.lineWidth = 2.5;
      b.beginPath(); b.ellipse(JACK[0], SUELO + 2, 95, 7, 0, 0, 6.283); b.stroke();
      CT.set("barra", c);
    }
    g.drawImage(CT.get("barra"), -60, BARRA - 10);
  }
  jarraBarra(g, t, cuerpo) {
    const x = JARRA_G[0] - 17 * JE, y = JARRA_G[1] - 18 * JE;
    g.save(); g.translate(x, y); g.scale(JE, JE);
    dibujarJarra(g, [0, 0], 0, 0.85, cuerpo ? "cuerpo" : "asa", t);
    g.restore();
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    foco(g, 512, 512, BARRA, 330, 0.85);
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    this.barra(g);
    // jarra de Marcos (atrezo) y la de Guillermo (hasta que la coge)
    g.save(); g.translate(760, SUELO - 18 * JE); g.scale(-JE, JE);
    dibujarJarra(g, [0, 0], 0, 0.6, "asa", t); dibujarJarra(g, [0, 0], 0, 0.6, "cuerpo", t); g.restore();
    const enBarra = t < 7.2;
    const oG = this.olG(t);
    if (enBarra) {
      this.jarraBarra(g, t, false);
      this.jarraBarra(g, t, true);
      if (oG && oG.dentro) {
        g.save(); g.beginPath(); g.rect(JARRA_G[0] - 13 * JE, JARRA_G[1] - 34 * JE, 26 * JE, 32 * JE); g.clip();
        g.globalAlpha *= 0.85; aceituna(g, oG.x, oG.y, oG.a, true); g.restore();
      }
    }
    const b = this.bol(t);
    if (b) altramuz(g, b.x, b.y, b.a);
    if (oG && !oG.dentro) aceituna(g, oG.x, oG.y, oG.a, true);
    const oM = this.olM(t);
    // en la mano de Marcos mientras la carga (gira)
    if (t > 3.95 && t < T_TM) {
      const h = aPant(e[1].m, e[1].pose._manoI || e[1].pose.manoI);
      aceituna(g, h[0], h[1] - 16, t * 18, false);
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 + 0.3 * Math.sin(t * 20);
      g.drawImage(BLOB2.oroClaro, h[0] - 40, h[1] - 56, 80, 80); g.restore();
    }
    if (oM) {
      if (oM.vuela) {
        // estela en espiral del efecto
        g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = "rgba(255,220,120,.55)"; g.lineWidth = 3;
        for (let i = 0; i < 2; i++) { g.beginPath(); g.arc(oM.x, oM.y, 24 + i * 9, t * 22 + i * 2, t * 22 + i * 2 + 3.6); g.stroke(); }
        g.restore();
      }
      aceituna(g, oM.x, oM.y, oM.a, false);
    }
    g.restore();
    this.p.dibujar(g);
    // textos
    const pop = (s, t0, dur, x, y, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: a * (1 - tramo(d, dur - 0.15, dur)) });
      g.restore();
    };
    pop("¡PEGADITA!", T_PARA, 1.0, 470, 384, 46, "#d8ffb0", "#1f3a00", -0.08);
    pop("¡CLAC!", T_CLAC, 0.7, 600, 380, 74, "#fffdf5", "#7a0008", 0.1);
    pop("¡PLOF!", T_PLOF, 0.7, 400, 352, 54, "#ffd34d", "#3a2400", -0.12);
    pop("¡GLU, GLU!", 7.65, 0.8, 360, 318, 44, "#ffd34d", "#3a2400", -0.06);
    // ¡BOCHAZO!
    if (t > T_CLAC + 0.08) {
      const d = t - T_CLAC - 0.08, k = tramo(d, 0, 0.17), s = lerp(2.6, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a;
      g.translate(540, 110); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has("tit")) return CT.get("tit");
    const c = lienzoNuevo(640, 200), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 160);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.45, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡BOCHAZO!", 320, 152, { tam: 140, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 12, esp: 5, glow: "rgba(255,190,40,.85)", glowTam: 26, max: 600 });
    CT.set("tit", c);
    return c;
  }
}

registrar({ id: "00161", nombre: "Petanca de aceitunas", crear: () => new Petanca() });
})();
