"use strict";
/*
 * 00151 · ABRACADABRA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se abre el telón. Rodrigo, de mago (chistera, capa y varita), saluda; Guillermo, a su lado bajo otro foco, también.
 * Rodrigo enseña una tela roja, se la echa por encima a Guillermo, agita la varita: ¡ABRACADABRA! La tela se desinfla,
 * se la lleva por arte de magia… y Guillermo ha desaparecido. Rodrigo lo busca: se enciende la barra del fondo y
 * Guillermo asoma detrás tirando una caña. Se la desliza por la barra, Rodrigo la caza al vuelo y brindan. Se cierra
 * el telón.
 */
(() => {
const cache = cacheTexto();
const ESC = 1.45, XR0 = 270, XR1 = 588, XG0 = 520, XG1 = 830;
const BARRA = 410, BX0 = 662, BX1 = 1012, GRIFO = 922, JARRA_G = 760, JX = 872;
const T_LANZA = 1.85, T_CUBRE = 2.3, T_MAGIA = 2.95, T_TOQUE = 3.1, T_COGE = 3.4, T_PUF = 4.1, T_ASOMA = 4.8;
const T_DESL = 6.15, T_CAZA = 6.7, T_CHIN = 7.15;

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(980, 210), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 50, 0, 160);
  gr.addColorStop(0, "#fff8d0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff9f1a");
  txt(g, "¡ABRACADABRA!", 496, 158, { tam: 112, peso: 400, fam: FB, color: "#3a0a5a", esp: 3 });
  txt(g, "¡ABRACADABRA!", 490, 150, { tam: 112, peso: 400, fam: FB, color: gr, borde: "#3a0a5a", bordeAncho: 10, esp: 3, glow: "rgba(190,90,255,.9)", glowTam: 28 });
  cache.set("t", c);
  return c;
}
function conCabeza(g, m, R, rc, f) { conMat(g, m, () => { g.translate(R.cuello[0], R.cuello[1]); g.rotate(rc); g.translate(-R.cuello[0], -R.cuello[1]); f(); }); }
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
function jarraIzq(pose, inc, nivel) {
  pose.objI = (g, m, a, t) => { g.save(); g.translate(m[0], m[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], inc, nivel, "asa", t); g.restore(); };
  pose.objI2 = (g, m, a, t) => { g.save(); g.translate(m[0], m[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], inc, nivel, "cuerpo", t); g.restore(); };
}
function jarraSuelta(g, x, y, nivel, t, espejo) {
  g.save(); g.translate(x, y); g.scale(ESC * (espejo ? -1 : 1), ESC);
  dibujarJarra(g, [0, -18], 0, nivel, "asa", t); dibujarJarra(g, [0, -18], 0, nivel, "cuerpo", t);
  g.restore();
}

/** Chistera lisa (unidades de Rodrigo), con la cinta roja. */
function chistera(g, sube) {
  g.save(); g.translate(0, -sube);
  const gr = g.createLinearGradient(14, 0, 62, 0);
  gr.addColorStop(0, "#050508"); gr.addColorStop(0.4, "#3a3a46"); gr.addColorStop(1, "#050508");
  g.fillStyle = gr; g.beginPath(); g.moveTo(16, 12); g.lineTo(18, -40); g.quadraticCurveTo(38, -44, 58, -40); g.lineTo(60, 12); g.closePath(); g.fill();
  g.fillStyle = "#c81e2a"; g.beginPath(); g.moveTo(16.4, 2); g.quadraticCurveTo(38, 5, 59.6, 2); g.lineTo(59.8, 9); g.quadraticCurveTo(38, 12, 16.2, 9); g.closePath(); g.fill();
  g.fillStyle = "#101014"; g.beginPath(); g.ellipse(38, 13, 34, 6, 0, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(255,255,255,.18)"; g.lineWidth = 1.2; g.beginPath(); g.ellipse(38, 12, 32, 4.6, 0, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
  g.fillStyle = "#16161c"; g.beginPath(); g.ellipse(38, -40, 20, 3.4, 0, 0, 6.283); g.fill();
  g.restore();
}
/** Capa de mago: forro rojo con borde negro, cuelga de los hombros (unidades de avatar, detrás del cuerpo). */
function capa(g, R, t) {
  const y0 = R.hombroD[1] - 10, xi = R.hombroI2[0] + 2, xd = R.hombroD[0] - 2, yb = y0 + 128;
  g.beginPath();
  g.moveTo(xi, y0); g.quadraticCurveTo(xi - 22, (y0 + yb) / 2, xi - 24, yb);
  for (let i = 1; i <= 6; i++) { const x = lerp(xi - 24, xd + 24, i / 6); g.quadraticCurveTo(x - 7, yb + 6 + 2 * Math.sin(t * 3 + i), x, yb + 2 * Math.sin(t * 3 + i)); }
  g.quadraticCurveTo(xd + 22, (y0 + yb) / 2, xd, y0); g.closePath();
  g.fillStyle = "#0a0a10"; g.fill();
  g.beginPath();
  g.moveTo(xi + 3, y0 + 4); g.quadraticCurveTo(xi - 16, (y0 + yb) / 2, xi - 18, yb - 4);
  g.lineTo(xd + 18, yb - 4); g.quadraticCurveTo(xd + 16, (y0 + yb) / 2, xd - 3, y0 + 4); g.closePath();
  const gr = g.createLinearGradient(xi - 18, 0, xd + 18, 0);
  gr.addColorStop(0, "#6a0a12"); gr.addColorStop(0.5, "#d8243a"); gr.addColorStop(1, "#6a0a12");
  g.fillStyle = gr; g.fill();
}
function varita(g, m, ang) {
  g.save(); g.translate(m[0], m[1]); g.rotate(ang);
  g.fillStyle = "#0a0a0e"; rectR(g, -6, -1.8, 46, 3.6, 1.6); g.fill();
  g.fillStyle = "#fffdf5"; rectR(g, 32, -2, 9, 4, 1.6); g.fill(); rectR(g, -7, -2, 6, 4, 1.6); g.fill();
  g.restore();
}
/** Tela roja con ribete dorado y estrellitas, colgando de los puntos a y b (pantalla). */
function telaColgando(g, a, b, largo, t, vuelta) {
  const n = 6, abajo = [];
  for (let i = 0; i <= n; i++) { const u = i / n; abajo.push([lerp(a[0], b[0], u) + 6 * Math.sin(t * 5 + u * 6), lerp(a[1], b[1], u) + largo + 8 * Math.sin(t * 6 + u * 9)]); }
  g.beginPath(); g.moveTo(a[0], a[1]);
  g.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 22, b[0], b[1]);
  for (let i = n; i >= 0; i--) g.lineTo(abajo[i][0], abajo[i][1]);
  g.closePath();
  pintarTela(g, Math.min(a[0], b[0]) - 10, Math.max(a[0], b[0]) + 10, vuelta);
}
function pintarTela(g, x0, x1, vuelta) {
  const gr = g.createLinearGradient(x0, 0, x1, 0);
  const c = vuelta ? ["#7a0a2a", "#e0306a", "#7a0a2a"] : ["#8a0a10", "#ff3a3a", "#8a0a10"];
  for (let i = 0; i < 7; i++) gr.addColorStop(i / 6, c[i % 2 ? 1 : (i % 4 ? 2 : 0)]);
  g.fillStyle = gr; g.fill();
  g.strokeStyle = "#ffcf3a"; g.lineWidth = 4; g.stroke();
  g.save(); g.clip(); g.fillStyle = "rgba(255,215,90,.75)";
  const r = semilla(9);
  for (let i = 0; i < 26; i++) { estrella(g, x0 + r() * (x1 - x0), 100 + r() * 480, 6, 2.6, r() * 3); g.fill(); }
  g.restore();
}

class Abracadabra extends Escena {
  constructor() {
    super(10.3);
    this.p = new Parts(420);
    this.p.suelo = () => PIES;
    this.estela = [];
    this.fondoC = null;
  }
  xR() { return lerp(XR0, XR1, eInOut(tramo(this.t, 5.35, 6.3))); }
  /** Estado de la tela: { modo, ... } */
  tela() {
    const t = this.t;
    if (t < 1.0) return null;
    if (t < T_LANZA) return { modo: "mano" };
    if (t < T_CUBRE) {
      const u = tramo(t, T_LANZA, T_CUBRE);
      return { modo: "vuela", x: lerp(XR0 + 40, XG0, u), y: lerp(380, 250, u) - 160 * Math.sin(u * Math.PI), u };
    }
    if (t < T_COGE) {
      const alto = t < T_TOQUE ? 362 : lerp(362, 26, eIn(tramo(t, T_TOQUE, T_TOQUE + 0.25)));
      return { modo: "cubre", alto };
    }
    if (t < 3.65) { const u = eInOut(tramo(t, T_COGE, 3.65)); return { modo: "vuela2", x: lerp(XG0, XR0 - 30, u), y: lerp(PIES - 20, 300, u) - 120 * Math.sin(u * Math.PI), u }; }
    if (t < T_PUF) return { modo: "alto" };
    return null;
  }
  poseR() {
    const t = this.t, x = this.xR();
    const pose = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let mD = [68, 157], mI = [9, 157], sombrero = 0, varitaAng = null, bote = 0, jarra = null;
    // se quita la chistera para saludar
    const kS = eInOut(tramo(t, 0.55, 0.8)) * (1 - eInOut(tramo(t, 1.0, 1.2)));
    mD = mezcla(mD, [52, 4], kS); sombrero = 9 * kS;
    if (t > 0.55 && t < 1.2) { pose.cara = "guino"; pose.rc = -0.08 * kS; }
    // enseña la tela
    if (t >= 1.0 && t < T_LANZA) {
      const k = eInOut(tramo(t, 1.0, 1.3));
      mD = mezcla(mD, [102, 96 + 4 * Math.sin(t * 8)], k); mI = mezcla(mI, [-26, 96 + 4 * Math.sin(t * 8 + 1)], k);
      pose.cara = "risa";
      if (t > 1.55) { const k2 = eInOut(tramo(t, 1.55, T_LANZA)); mD = mezcla(mD, [108, 60], k2); mI = mezcla(mI, [40, 60], k2); pose.rc = 0.1 * k2; }
    }
    if (t >= T_LANZA && t < T_MAGIA - 0.4) {
      const k = eOut(tramo(t, T_LANZA, T_LANZA + 0.2));
      mD = mezcla([108, 60], [112, 110], k); mI = mezcla([40, 60], [60, 120], k);
      pose.cara = "guino"; pose.rc = 0.06;
      const k2 = eInOut(tramo(t, 2.3, 2.55));
      mI = mezcla(mI, [9, 157], k2);
    }
    // varita: círculos y ¡toque!
    if (t >= 2.3 && t < 4.2) {
      const kV = eInOut(tramo(t, 2.3, 2.55));
      const w = t * 13;
      mD = mezcla(mD, [96 + 10 * Math.cos(w), 64 + 9 * Math.sin(w)], kV);
      varitaAng = -0.5;
      pose.cara = t < T_MAGIA ? "guino" : "risa"; pose.rc = 0.05 * Math.sin(t * 6);
      if (t > T_TOQUE - 0.12) { const kT = eOut(tramo(t, T_TOQUE - 0.12, T_TOQUE)) * (1 - eInOut(tramo(t, 3.4, 3.7))); mD = mezcla(mD, [118, 112], kT); varitaAng = lerp(-0.5, 0.15, kT); }
      if (t > 3.6) mD = mezcla(mD, [68, 150], eInOut(tramo(t, 3.6, 3.9)));
    }
    // la tela vuela a su mano y la enseña: ¡nada!
    if (t >= T_COGE - 0.1 && t < T_PUF + 0.2) {
      const k = eOut(tramo(t, T_COGE - 0.1, T_COGE + 0.1));
      mI = mezcla(mI, [-30, 40], k);
      if (t > 3.65) { pose.cara = "risa"; mI = [-26 + 3 * Math.sin(t * 18), 40]; }
    }
    if (t >= T_PUF && t < T_ASOMA) {
      const k = eInOut(tramo(t, T_PUF, T_PUF + 0.3));
      mI = mezcla([-26, 40], [-30, 110], k); mD = mezcla([68, 150], [106, 110], k);
      pose.cara = "risa";
      if (t > 4.45) { pose.cara = "sorpresa"; pose.rc = 0.14 * Math.sin((t - 4.45) * 9); }
    }
    // ¿y Guillermo? mira a la barra
    if (t >= T_ASOMA) {
      const k = eInOut(tramo(t, T_ASOMA, T_ASOMA + 0.3));
      mI = mezcla([-30, 110], [9, 157], k); mD = mezcla([106, 110], [68, 157], k);
      pose.cara = t < 5.4 ? "sorpresa" : "risa"; pose.rc = 0.14 * k;
    }
    if (t > 5.35 && t < 6.3) { const a = andar((t - 5.35) * 10, 0.9); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; bote = a.bote; }
    const m = matAv(x, PIES + bote, ESC);
    // caza la caña al vuelo, brinda y bebe
    if (t > 6.35) {
      const caza = enAv(m, [BX0 - 6, BARRA - 18]);
      const k = eInOut(tramo(t, 6.35, T_CAZA));
      mD = mezcla([68, 157], caza, k);
      if (t > T_CAZA) {
        jarra = { inc: 0, nivel: 1 };
        const kB = eInOut(tramo(t, T_CAZA + 0.1, T_CHIN)), choque = enAv(m, [700 - 44, 318]);
        mD = mezcla(caza, choque, kB); mD[0] -= 4 * Math.sin(Math.PI * tramo(t, T_CHIN, T_CHIN + 0.2));
        pose.cara = "risa"; pose.rc = 0.1;
        const kS2 = eInOut(tramo(t, 7.45, 7.8)) * (1 - eInOut(tramo(t, 8.7, 9.0)));
        const kT = eInOut(tramo(t, 7.75, 8.6)) * (1 - eInOut(tramo(t, 8.7, 9.0)));
        if (kS2 > 0) {
          pose.rc = -0.3 * kT;
          const incB = -0.4 * kS2 - 1.15 * kT, b = boca(pose.rc, "rodrigo"), r = rot2(JARRA.borde, incB);
          mD = mezcla(mD, [b[0] - r[0], b[1] - r[1]], kS2); jarra.inc = incB; pose.cara = kT > 0.3 ? "dormido" : "risa";
        }
        jarra.nivel = 1 - 0.8 * tramo(t, 7.8, 8.6);
        if (t > 8.8) { pose.cara = "guino"; mI = mezcla([9, 157], [40, 10], eInOut(tramo(t, 8.85, 9.1))); sombrero = 9 * eInOut(tramo(t, 8.9, 9.1)); }
      }
    }
    pose.manoD = mD; pose.manoI = mI;
    if (jarra) pose.jarra = jarra;
    if (varitaAng != null) { const va = varitaAng; pose.objD2 = (g, q) => varita(g, q, va); }
    return { pose, m, sombrero, varitaAng };
  }
  /** Altura a la que asoma Guillermo detrás de la barra (0 = de pie). */
  poseG() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let mD = [70, 158], mI = [9, 160], x = XG0, y = PIES, oculto = false, sx = 1, sy = 1;
    if (t < T_CUBRE) {
      // saluda y se asusta con la tela
      const kW = eInOut(tramo(t, 0.75, 0.95)) * (1 - eInOut(tramo(t, 1.4, 1.6)));
      mD = mezcla(mD, [96, 40 + 6 * Math.sin(t * 16)], kW);
      pose.cara = t < 1.6 ? "sonrisa" : t < 1.95 ? "guino" : "sorpresa";
      pose.rc = t > 1.95 ? -0.1 : 0.04 * Math.sin(t * 3);
      if (t > 1.95) { mD = mezcla(mD, [80, 60], eOut(tramo(t, 1.95, 2.15))); mI = mezcla(mI, [-4, 60], eOut(tramo(t, 1.95, 2.15))); }
    } else if (t < T_ASOMA) oculto = true;
    else {
      // asoma detrás de la barra
      x = XG1;
      y = PIES + 330 * (1 - eBack(tramo(t, T_ASOMA, T_ASOMA + 0.35)));
      pose.cara = "guino"; pose.brazoIDelante = true;
      const m0 = matAv(x, PIES, ESC);
      const manija = this.manija();
      if (t > T_ASOMA + 0.2 && t < T_DESL - 0.15) { mD = enAv(m0, manija); pose.cara = t < 5.4 ? "guino" : "risa"; pose.rc = -0.1; }
      // agarra la jarra llena y la desliza
      if (t >= T_DESL - 0.15 && t < T_DESL + 0.35) {
        const kA = eInOut(tramo(t, T_DESL - 0.15, T_DESL)), kE = eOut(tramo(t, T_DESL, T_DESL + 0.15));
        mD = mezcla(mezcla(enAv(m0, manija), enAv(m0, [JX + 2, BARRA - 22]), kA), enAv(m0, [JX - 40, BARRA - 22]), kE);
        pose.cara = "guino";
      }
      if (t >= T_DESL + 0.35) mD = mezcla(enAv(m0, [JX - 40, BARRA - 22]), [70, 150], eInOut(tramo(t, T_DESL + 0.35, T_DESL + 0.6)));
      // su jarra: la coge, brinda y bebe
      if (t > 6.3) {
        const coge = enAv(m0, [JARRA_G, BARRA - 18]), choque = enAv(m0, [700 + 44, 318]);
        const kC = eInOut(tramo(t, 6.3, 6.6)), kB = eInOut(tramo(t, 6.75, T_CHIN));
        mI = mezcla(mezcla([9, 160], coge, kC), choque, kB); mI[0] += 4 * Math.sin(Math.PI * tramo(t, T_CHIN, T_CHIN + 0.2));
        let inc = 0, nivel = 1;
        pose.cara = t < 6.8 ? "guino" : "risa"; pose.rc = -0.1;
        const kS2 = eInOut(tramo(t, 7.5, 7.85)) * (1 - eInOut(tramo(t, 8.7, 9.0)));
        const kT = eInOut(tramo(t, 7.8, 8.6)) * (1 - eInOut(tramo(t, 8.7, 9.0)));
        if (kS2 > 0) {
          pose.rc = 0.3 * kT;
          const incB = -0.4 * kS2 - 1.15 * kT, b = boca(pose.rc), r = rot2(JARRA.borde, incB);
          mI = mezcla(mI, [b[0] + r[0], b[1] - r[1]], kS2); inc = incB; pose.cara = kT > 0.3 ? "dormido" : "risa";
        }
        nivel = 1 - 0.8 * tramo(t, 7.85, 8.6);
        if (t > 8.8) pose.cara = "guino";
        if (t > 6.42) jarraIzq(pose, inc, nivel);
      }
    }
    pose.manoD = mD; pose.manoI = mI;
    return { pose, m: matAv(x, y, ESC, 0, sx, sy), oculto, x };
  }
  manija() {
    const t = this.t, tira = t > T_ASOMA + 0.35 && t < T_DESL - 0.2 ? eInOut(tramo(t, T_ASOMA + 0.35, T_ASOMA + 0.55)) : 0;
    return [GRIFO + 8 + 22 * tira, 312 + 4 * tira];
  }
  /** Jarra que se llena en el grifo y se desliza por la barra. */
  jarraBarra() {
    const t = this.t;
    if (t < T_ASOMA || t > T_CAZA) return null;
    const nivel = tramo(t, T_ASOMA + 0.5, 5.9);
    if (t < T_DESL) return { x: JX, nivel };
    const u = tramo(t, T_DESL + 0.1, T_CAZA);
    return { x: lerp(JX, BX0 - 6, u), nivel: 1, vuela: t < T_DESL + 0.1 };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // estela de la varita
    const eR = this.poseR();
    if (eR.varitaAng != null && t < 3.6) {
      const tip = aPant(eR.m, [eR.pose.manoD[0] + Math.cos(eR.varitaAng) * 40, eR.pose.manoD[1] + Math.sin(eR.varitaAng) * 40]);
      if (Math.random() < 50 * dt) p.nueva(P.PURPURINA, tip[0], tip[1], azar(-40, 40), azar(-40, 20), azar(0.5, 1.0), azar(10, 16));
    }
    this.una("magia", t > T_MAGIA, () => {
      temblar(10, 0.3);
      for (let i = 0; i < 40; i++) { const a = azar(0, 6.283), v = azar(100, 380); p.nueva(P.PURPURINA, XG0 + azar(-60, 60), 330 + azar(-120, 120), Math.cos(a) * v, Math.sin(a) * v, azar(0.6, 1.2), azar(10, 18)); }
    });
    this.una("toque", t > T_TOQUE, () => {
      temblar(18, 0.4);
      p.nueva(P.DESTELLO, XG0, 380, 0, 0, 0.45, 340);
      for (let i = 0; i < 24; i++) p.nueva(P.HUMO, XG0 + azar(-70, 70), azar(260, 560), azar(-80, 80), azar(-120, -20), azar(0.8, 1.4), azar(50, 90));
      for (let i = 0; i < 30; i++) { const a = azar(0, 6.283), v = azar(150, 480); p.nueva(P.CHISPA, XG0, 380, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(7, 12)); }
    });
    this.una("puf", t > T_PUF, () => {
      const q = aPant(eR.m, [-30, 60]);
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.35, 220);
      for (let i = 0; i < 14; i++) p.nueva(P.HUMO, q[0] + azar(-30, 30), q[1] + azar(0, 80), azar(-60, 60), azar(-90, -20), azar(0.6, 1.1), azar(40, 70));
      for (let i = 0; i < 26; i++) { const a = azar(0, 6.283), v = azar(80, 300); p.nueva(P.PURPURINA, q[0], q[1] + 50, Math.cos(a) * v, Math.sin(a) * v, azar(0.6, 1.1), azar(10, 16)); }
    });
    this.una("asoma", t > T_ASOMA, () => {
      temblar(12, 0.25);
      p.nueva(P.DESTELLO, XG1, 330, 0, 0, 0.4, 260);
      for (let i = 0; i < 20; i++) { const a = azar(-Math.PI, 0), v = azar(100, 360); p.nueva(P.PURPURINA, XG1, 330, Math.cos(a) * v, Math.sin(a) * v, azar(0.6, 1.1), azar(10, 16)); }
    });
    this.una("chin", t > T_CHIN, () => {
      temblar(14, 0.3);
      p.nueva(P.DESTELLO, 700, 300, 0, 0, 0.35, 200);
      for (let i = 0; i < 28; i++) { const a = azar(-Math.PI, 0), v = azar(150, 460); p.nueva(P.ESPUMA, 700, 296, Math.cos(a) * v, Math.sin(a) * v, azar(0.6, 1.0), azar(6, 11)); }
    });
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 80, H + 80), g = c.getContext("2d");
    g.translate(40, 40);
    // telón de fondo (pliegues)
    for (let x = -40; x < W + 40; x += 48) {
      const gr = g.createLinearGradient(x, 0, x + 48, 0);
      gr.addColorStop(0, "#1e0408"); gr.addColorStop(0.5, "#4a0c16"); gr.addColorStop(1, "#1e0408");
      g.fillStyle = gr; g.fillRect(x, -40, 48, 520);
    }
    // escenario de madera
    const gs = g.createLinearGradient(0, 470, 0, H + 40);
    gs.addColorStop(0, "#3a2010"); gs.addColorStop(1, "#140a04");
    g.fillStyle = gs; g.fillRect(-40, 470, W + 80, H);
    g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = 2;
    for (let y = 490; y < H + 40; y += 22) { g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); }
    g.fillStyle = "rgba(255,200,120,.12)"; g.fillRect(-40, 470, W + 80, 3);
    this.fondoC = c;
    return c;
  }
  barra(g, t, luz) {
    g.save();
    // estantes con botellas detrás
    g.fillStyle = "#2a160a"; g.fillRect(BX0 + 20, 200, BX1 - BX0 - 20, 14); g.fillRect(BX0 + 20, 280, BX1 - BX0 - 20, 14);
    const cols = ["#2a7a3a", "#7a3a1a", "#c89a2a", "#3a5a8a", "#8a1a2a"];
    for (let i = 0; i < 11; i++) for (const yy of [200, 280]) {
      const x = BX0 + 40 + i * 30, h = 34 + ((i * 7 + yy) % 13);
      g.fillStyle = cols[(i + yy) % 5]; rectR(g, x, yy - h, 14, h, 3); g.fill(); g.fillRect(x + 4, yy - h - 10, 6, 12);
      g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(x + 3, yy - h + 4, 2, h - 8);
    }
    // lámparas
    for (const x of [BX0 + 90, BX0 + 260]) {
      g.strokeStyle = "#222"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, -10); g.lineTo(x, 100); g.stroke();
      g.fillStyle = "#3a2a1a"; g.beginPath(); g.moveTo(x - 26, 124); g.lineTo(x - 12, 100); g.lineTo(x + 12, 100); g.lineTo(x + 26, 124); g.closePath(); g.fill();
      if (luz > 0) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.6 * luz; g.drawImage(BLOB.amarillo, x - 90, 60, 180, 160); g.restore(); }
    }
    g.restore();
  }
  frenteBarra(g, t) {
    // tablero y frente de la barra (tapa a Guillermo de cintura para abajo)
    const gf = g.createLinearGradient(0, BARRA, 0, PIES);
    gf.addColorStop(0, "#6a3a18"); gf.addColorStop(1, "#2a1408");
    g.fillStyle = gf; g.fillRect(BX0, BARRA + 8, BX1 - BX0 + 40, PIES - BARRA + 30);
    g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2;
    for (let x = BX0 + 60; x < BX1 + 40; x += 70) { g.beginPath(); g.moveTo(x, BARRA + 14); g.lineTo(x, PIES + 20); g.stroke(); }
    g.fillStyle = "#c8962a"; g.fillRect(BX0, PIES - 34, BX1 - BX0 + 40, 6);
    const gt = g.createLinearGradient(0, BARRA - 6, 0, BARRA + 10);
    gt.addColorStop(0, "#d8a868"); gt.addColorStop(1, "#7a4a1e");
    g.fillStyle = gt; g.fillRect(BX0 - 10, BARRA - 4, BX1 - BX0 + 60, 14);
  }
  grifo(g, t) {
    const m = this.manija();
    g.save();
    const gr = g.createLinearGradient(GRIFO - 8, 0, GRIFO + 8, 0);
    gr.addColorStop(0, "#7a8088"); gr.addColorStop(0.5, "#f4f6f8"); gr.addColorStop(1, "#6a7078");
    g.fillStyle = gr; rectR(g, GRIFO - 9, 318, 18, BARRA - 318, 4); g.fill();
    g.fillStyle = "#c8ccd2"; rectR(g, GRIFO - 28, 330, 26, 9, 4); g.fill(); g.fillRect(GRIFO - 28, 330, 7, 22);
    g.strokeStyle = "#111"; g.lineWidth = 7; g.lineCap = "round";
    g.beginPath(); g.moveTo(GRIFO + 2, 322); g.lineTo(m[0], m[1] - 10); g.stroke();
    g.fillStyle = "#111"; g.beginPath(); g.arc(m[0], m[1] - 12, 6, 0, 6.283); g.fill();
    g.restore();
    // chorro de cerveza
    const t0 = T_ASOMA + 0.5;
    if (t > t0 && t < 5.9) {
      g.fillStyle = "#ffbf2a"; g.fillRect(GRIFO - 27, 350, 5, BARRA - 362);
      g.fillStyle = "rgba(255,240,190,.7)"; g.fillRect(GRIFO - 26, 350, 1.5, BARRA - 362);
    }
  }
  telon(g, k) {
    // telón rojo: k = 0 cerrado, 1 abierto
    const ancho = lerp(W / 2 + 20, 92, k);
    for (const s of [-1, 1]) {
      g.save();
      if (s > 0) { g.translate(W, 0); g.scale(-1, 1); }
      const gr = g.createLinearGradient(0, 0, ancho, 0);
      for (let i = 0; i <= 8; i++) gr.addColorStop(i / 8, i % 2 ? "#c8142a" : "#6a0a14");
      g.fillStyle = gr;
      g.beginPath(); g.moveTo(-60, -60); g.lineTo(ancho, -60); g.quadraticCurveTo(ancho - 20 * k, 300, ancho + 10 * (1 - k), H + 60); g.lineTo(-60, H + 60); g.closePath(); g.fill();
      g.restore();
    }
    // bambalina
    const gb = g.createLinearGradient(0, 0, 0, 62);
    gb.addColorStop(0, "#5a0810"); gb.addColorStop(1, "#b0142a");
    g.fillStyle = gb; g.beginPath(); g.moveTo(-60, -60); g.lineTo(W + 60, -60); g.lineTo(W + 60, 46);
    for (let x = W + 60; x >= -60; x -= 64) g.quadraticCurveTo(x - 32, 70, x - 64, 46);
    g.closePath(); g.fill();
    g.fillStyle = "#ffcf3a"; for (let x = -30; x < W + 40; x += 64) { g.beginPath(); g.arc(x, 60, 5, 0, 6.283); g.fill(); }
  }
  dibujar(g) {
    const t = this.t, eR = this.poseR(), eG = this.poseG(), tela = this.tela();
    fondo(g, "#000");
    g.drawImage(this.fondo(), -40, -40);
    // la barra (a oscuras hasta que asoma Guillermo)
    const luzB = t < T_ASOMA ? 0 : [1, 0.3, 1, 0.6, 1][Math.min(4, Math.floor((t - T_ASOMA) / 0.06))];
    this.barra(g, t, luzB);
    // focos
    foco(g, XR0 - 40, this.xR(), PIES, 120, 1);
    foco(g, XG0 + 40, XG0, PIES, 110, t < 0.5 ? 0 : tramo(t, 0.5, 0.6));
    if (luzB > 0) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.25 * luzB; g.drawImage(BLOB2.oroClaro, BX0 - 40, 120, BX1 - BX0 + 80, 420); g.restore(); }
    // Guillermo y la tela que le cubre
    if (!eG.oculto) pintarAvatar(g, eG.m, eG.pose, t);
    if (tela && tela.modo === "cubre") this.telaCubre(g, tela.alto, t);
    // la barra por delante
    this.frenteBarra(g, t);
    const jb = this.jarraBarra();
    if (jb) jarraSuelta(g, jb.x, BARRA, jb.nivel, t, false);
    if (t < 6.42) jarraSuelta(g, JARRA_G, BARRA, 1, t, true);
    this.grifo(g, t);
    if (luzB < 1) { g.fillStyle = `rgba(0,0,0,${0.86 * (1 - luzB)})`; g.fillRect(BX0 - 20, -60, W - BX0 + 80, H + 120); }
    // Rodrigo
    conMat(g, eR.m, () => capa(g, avatar("rodrigo").rig, t));
    pintarAvatar(g, eR.m, eR.pose, t);
    conCabeza(g, eR.m, avatar("rodrigo").rig, eR.pose.rc, () => chistera(g, eR.sombrero));
    // la tela en sus manos o volando
    if (tela) this.dibujarTela(g, tela, eR, t);
    this.p.dibujar(g);
    // telón
    const kT = t < 1 ? eInOut(tramo(t, 0.1, 0.85)) : 1 - eInOut(tramo(t, 9.25, 9.95));
    this.telon(g, kT);
    // ¡ABRACADABRA!
    if (t > T_MAGIA) {
      const d = t - T_MAGIA, k = tramo(d, 0, 0.18), s = 0.9 * lerp(2.5, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 7));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - tramo(t, 9.5, 9.95)); g.translate(500, 142); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0, 0.12), tramo(t, 9.9, this.dur - 0.02));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  telaCubre(g, alto, t) {
    const x = XG0, base = PIES + 4, top = base - alto, tiembla = alto > 300 ? 2 * Math.sin(t * 40) : 0;
    const anchoB = lerp(170, 120, tramo(alto, 26, 362)), anchoC = lerp(150, 62, tramo(alto, 26, 362));
    g.save(); g.translate(tiembla, 0);
    g.beginPath();
    g.moveTo(x - anchoB / 2, base);
    g.quadraticCurveTo(x - anchoB / 2 + 6, lerp(base, top, 0.5), x - anchoC / 2 - 30 * tramo(alto, 200, 362), top + alto * 0.24);
    g.quadraticCurveTo(x - anchoC / 2 - 4, top, x, top);
    g.quadraticCurveTo(x + anchoC / 2 + 4, top, x + anchoC / 2 + 30 * tramo(alto, 200, 362), top + alto * 0.24);
    g.quadraticCurveTo(x + anchoB / 2 - 6, lerp(base, top, 0.5), x + anchoB / 2, base);
    for (let i = 5; i >= 0; i--) g.quadraticCurveTo(x - anchoB / 2 + (anchoB / 6) * (i + 0.5), base + 8, x - anchoB / 2 + (anchoB / 6) * i, base);
    g.closePath();
    pintarTela(g, x - anchoB / 2, x + anchoB / 2, false);
    g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 3;
    for (const u of [-0.25, 0.08, 0.3]) { g.beginPath(); g.moveTo(x + u * anchoC, top + alto * 0.3); g.quadraticCurveTo(x + u * anchoB * 1.1, top + alto * 0.7, x + u * anchoB * 1.3, base - 4); g.stroke(); }
    g.restore();
  }
  dibujarTela(g, tela, eR, t) {
    const R = eR.pose;
    if (tela.modo === "mano") {
      const a = aPant(eR.m, R._manoI || R.manoI), b = aPant(eR.m, R._manoD || R.manoD);
      telaColgando(g, a, b, 170 - 40 * tramo(t, 1.55, T_LANZA), t, Math.sin(t * 7) > 0.6);
    } else if (tela.modo === "vuela" || tela.modo === "vuela2") {
      const s = tela.modo === "vuela" ? lerp(0.6, 1.2, tela.u) : lerp(0.5, 0.8, tela.u);
      g.save(); g.translate(tela.x, tela.y); g.rotate(Math.sin(t * 14) * 0.25); g.scale(s, s * (0.7 + 0.3 * Math.sin(t * 20)));
      g.beginPath(); g.moveTo(-80, -40);
      for (let i = 0; i <= 4; i++) g.lineTo(-80 + i * 40, -40 + 10 * Math.sin(t * 18 + i));
      for (let i = 4; i >= 0; i--) g.lineTo(-80 + i * 40, 50 + 12 * Math.sin(t * 16 + i * 1.3));
      g.closePath(); pintarTela(g, -80, 80, false);
      g.restore();
    } else if (tela.modo === "alto") {
      const a = aPant(eR.m, R._manoI || R.manoI);
      g.save(); g.beginPath(); g.moveTo(a[0] - 8, a[1]); g.lineTo(a[0] + 8, a[1]);
      for (let i = 0; i <= 5; i++) g.lineTo(a[0] + 40 - i * 20 + 6 * Math.sin(t * 9 + i), a[1] + 190 + 8 * Math.sin(t * 7 + i * 2));
      g.closePath(); pintarTela(g, a[0] - 60, a[0] + 60, true); g.restore();
    }
  }
}

registrar({ id: "00151", nombre: "Abracadabra", crear: () => new Abracadabra() });
})();
