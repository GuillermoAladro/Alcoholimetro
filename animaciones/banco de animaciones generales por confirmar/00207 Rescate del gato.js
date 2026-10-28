"use strict";
/*
 * 00207 · RESCATE DEL GATO
 *
 * Animación del banco. Empieza y acaba en negro.
 * En el bar, un gato naranja maúlla en lo más alto de la estantería. Guillermo lo señala, preocupado; entra Marcos de
 * bombero, saluda y sube por la escalera con mucho cuidado. Alarga los brazos… y el gato salta por encima de él y aterriza
 * en la cabeza de Guillermo, que se queda quieto con el gato de gorro: ¡MIAU! El gato ronronea, Marcos se ríe desde la
 * escalera, se apaga la luz y solo quedan los ojos del gato brillando.
 */
(() => {
const ESC = 1.35;
const XG = 300, XM = 700, XM0 = 1160;
const EST = { x0: 636, x1: 968, top: 212 };      // la estantería
const GATO0 = [846, EST.top];                     // el gato, sentado arriba (base)
const ESC_X0 = 656, ESC_X1 = 744, ESC_TOP = 200;  // la escalera (raíles)
const PELDANO = 38.5, NPASOS = 4;
const SG = 1.3;                                   // tamaño del gato
const T_ENTRA = 0.9, T_PARA = 1.95, T_SALUDO = 2.05, T_SUBE = 2.55, T_ARRIBA = 4.15, T_ALARGA = 4.25;
const T_AGACHA = 5.05, T_SALTA = 5.4, T_CAE = 6.05, T_RONRONEA = 6.9, T_APAGA = 8.55, T_OJOS_OFF = 9.25, DUR = 9.7;
const CT = cacheTexto();
const aU = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

// ------------------------------------------------------------------------------------------- el gato
const NAR = "#f39a3a", NAR_C = "#ffc177", NAR_O = "#a8560f", CREMA = "#fff3dc", ROSA = "#ff9fb0";
function orejas(g, cx, cy, s) {
  for (const d of [-1, 1]) {
    g.fillStyle = NAR; g.strokeStyle = NAR_O; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(cx + d * 6 * s, cy - 14 * s); g.lineTo(cx + d * 19 * s, cy - 30 * s); g.lineTo(cx + d * 21 * s, cy - 8 * s); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = ROSA; g.beginPath(); g.moveTo(cx + d * 10 * s, cy - 14 * s); g.lineTo(cx + d * 18 * s, cy - 25 * s); g.lineTo(cx + d * 18.5 * s, cy - 11 * s); g.closePath(); g.fill();
  }
}
/** Cabeza de gato de frente centrada en (cx, cy). ojos: "abiertos" | "grandes" | "cerrados"; boca 0–1 (maúlla). */
function cabezaGato(g, cx, cy, s, ojos, boca, t) {
  orejas(g, cx, cy, s);
  const gr = g.createRadialGradient(cx - 6 * s, cy - 8 * s, 2 * s, cx, cy, 26 * s);
  gr.addColorStop(0, NAR_C); gr.addColorStop(0.7, NAR); gr.addColorStop(1, "#d77a1f");
  g.fillStyle = gr; g.strokeStyle = NAR_O; g.lineWidth = 1.8;
  g.beginPath(); g.ellipse(cx, cy, 24 * s, 20 * s, 0, 0, 6.283); g.fill(); g.stroke();
  // rayas de la frente
  g.strokeStyle = NAR_O; g.lineWidth = 2.4 * s; g.lineCap = "round";
  for (const d of [-7, 0, 7]) { g.beginPath(); g.moveTo(cx + d * s, cy - 18 * s); g.lineTo(cx + d * 0.8 * s, cy - 11 * s); g.stroke(); }
  g.beginPath(); g.moveTo(cx - 23 * s, cy - 2 * s); g.lineTo(cx - 16 * s, cy); g.moveTo(cx + 23 * s, cy - 2 * s); g.lineTo(cx + 16 * s, cy); g.stroke();
  // morro
  g.fillStyle = CREMA;
  g.beginPath(); g.ellipse(cx - 6 * s, cy + 7 * s, 7.5 * s, 6 * s, 0, 0, 6.283); g.ellipse(cx + 6 * s, cy + 7 * s, 7.5 * s, 6 * s, 0, 0, 6.283); g.fill();
  // ojos
  for (const d of [-1, 1]) {
    const ex = cx + d * 9.5 * s, ey = cy - 3 * s;
    if (ojos === "cerrados") {
      g.strokeStyle = "#3a1c06"; g.lineWidth = 2.2 * s;
      g.beginPath(); g.arc(ex, ey + 2 * s, 4.5 * s, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
      continue;
    }
    const gr2 = g.createRadialGradient(ex, ey - 2 * s, 1, ex, ey, 7 * s);
    gr2.addColorStop(0, "#e9ff9a"); gr2.addColorStop(1, "#5fbf2a");
    g.fillStyle = gr2; g.beginPath(); g.ellipse(ex, ey, 5.6 * s, 6.6 * s, 0, 0, 6.283); g.fill();
    g.strokeStyle = "#2a3a10"; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = "#14140f";
    const pw = ojos === "grandes" ? 4.2 : 1.8;
    g.beginPath(); g.ellipse(ex, ey + 0.5 * s, pw * s, 5.4 * s, 0, 0, 6.283); g.fill();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(ex - 2 * s, ey - 2.6 * s, 1.5 * s, 0, 6.283); g.fill();
  }
  // nariz y boca
  g.fillStyle = ROSA; g.beginPath(); g.moveTo(cx - 3 * s, cy + 3 * s); g.lineTo(cx + 3 * s, cy + 3 * s); g.lineTo(cx, cy + 6 * s); g.closePath(); g.fill();
  if (boca > 0.05) {
    g.fillStyle = "#5a1020"; g.beginPath(); g.ellipse(cx, cy + 10 * s, 4 * s, 4.5 * s * boca, 0, 0, 6.283); g.fill();
    g.fillStyle = ROSA; g.beginPath(); g.ellipse(cx, cy + 12 * s, 2.6 * s, 2 * s * boca, 0, 0, 6.283); g.fill();
  } else {
    g.strokeStyle = "#5a2a10"; g.lineWidth = 1.3 * s;
    g.beginPath(); g.moveTo(cx, cy + 6 * s); g.quadraticCurveTo(cx - 2 * s, cy + 9.5 * s, cx - 5 * s, cy + 8 * s); g.moveTo(cx, cy + 6 * s); g.quadraticCurveTo(cx + 2 * s, cy + 9.5 * s, cx + 5 * s, cy + 8 * s); g.stroke();
  }
  // bigotes
  g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = 1.1 * s;
  for (const d of [-1, 1]) for (const k of [-1, 0, 1]) {
    g.beginPath(); g.moveTo(cx + d * 10 * s, cy + 7 * s + k * 2 * s); g.lineTo(cx + d * 30 * s, cy + 3 * s + k * 5 * s + Math.sin(t * 3) * s); g.stroke();
  }
}
/** Gato sentado de frente: (x, y) = la base. agacha 0–1 (preparado para saltar). */
function gatoSentado(g, x, y, s, o, t) {
  const ag = o.agacha || 0, menea = ag * Math.sin(t * 22) * 3 * s;
  g.save(); g.lineJoin = "round"; g.lineCap = "round";
  // cola
  const cw = Math.sin(t * 2.4) * 6 * s;
  g.strokeStyle = NAR_O; g.lineWidth = 11 * s;
  g.beginPath(); g.moveTo(x + 14 * s, y - 6 * s); g.bezierCurveTo(x + 38 * s, y - 2 * s, x + 44 * s + cw, y - 30 * s, x + 34 * s + cw, y - 46 * s); g.stroke();
  g.strokeStyle = NAR; g.lineWidth = 8 * s; g.stroke();
  // cuerpo
  const by = y - 24 * s * (1 - 0.3 * ag);
  const gr = g.createRadialGradient(x - 8 * s, by - 10 * s, 3, x, by, 30 * s);
  gr.addColorStop(0, NAR_C); gr.addColorStop(0.65, NAR); gr.addColorStop(1, "#cf7019");
  g.fillStyle = gr; g.strokeStyle = NAR_O; g.lineWidth = 1.8;
  g.beginPath(); g.ellipse(x + menea, by, 22 * s * (1 + 0.15 * ag), 25 * s * (1 - 0.3 * ag), 0, 0, 6.283); g.fill(); g.stroke();
  g.fillStyle = CREMA; g.beginPath(); g.ellipse(x + menea * 0.5, by + 3 * s, 11 * s, 16 * s * (1 - 0.3 * ag), 0, 0, 6.283); g.fill();
  // patitas
  g.fillStyle = CREMA; g.strokeStyle = NAR_O; g.lineWidth = 1.2;
  for (const d of [-1, 1]) { g.beginPath(); g.ellipse(x + d * 8 * s, y - 3 * s, 6.5 * s, 4.5 * s, 0, 0, 6.283); g.fill(); g.stroke(); }
  cabezaGato(g, x, y - (58 - 16 * ag) * s, s, o.ojos || "abiertos", o.boca || 0, t);
  g.restore();
}
/** Gato saltando de lado (hacia la izquierda), centrado en (x, y), girado `ang`. */
function gatoSalto(g, x, y, s, ang, t) {
  g.save(); g.translate(x, y); g.rotate(ang); g.lineJoin = "round"; g.lineCap = "round";
  // cola al viento
  g.strokeStyle = NAR_O; g.lineWidth = 10 * s;
  g.beginPath(); g.moveTo(24 * s, -4 * s); g.bezierCurveTo(44 * s, -10 * s, 52 * s, -26 * s + Math.sin(t * 20) * 4 * s, 70 * s, -24 * s); g.stroke();
  g.strokeStyle = NAR; g.lineWidth = 7 * s; g.stroke();
  // patas estiradas
  for (const [x0, y0, x1, y1] of [[-18, 6, -46, 12], [-12, 8, -40, 20], [18, 6, 46, 16], [12, 8, 40, 24]]) {
    g.strokeStyle = NAR_O; g.lineWidth = 9 * s; g.beginPath(); g.moveTo(x0 * s, y0 * s); g.lineTo(x1 * s, y1 * s); g.stroke();
    g.strokeStyle = NAR; g.lineWidth = 6.5 * s; g.stroke();
    g.fillStyle = CREMA; g.beginPath(); g.arc(x1 * s, y1 * s, 4 * s, 0, 6.283); g.fill();
  }
  const gr = g.createLinearGradient(0, -16 * s, 0, 16 * s);
  gr.addColorStop(0, NAR_C); gr.addColorStop(1, "#cf7019");
  g.fillStyle = gr; g.strokeStyle = NAR_O; g.lineWidth = 1.8;
  g.beginPath(); g.ellipse(0, 0, 32 * s, 14 * s, 0, 0, 6.283); g.fill(); g.stroke();
  g.strokeStyle = NAR_O; g.lineWidth = 3 * s;
  for (const d of [-8, 2, 12]) { g.beginPath(); g.moveTo(d * s, -13 * s); g.lineTo(d * s + 3 * s, -5 * s); g.stroke(); }
  g.restore();
  // la cabeza, siempre derecha y mirando al frente
  const h = rot2([-32 * s, -8 * s], ang);
  cabezaGato(g, x + h[0], y + h[1], s * 0.85, "grandes", 0.8, t);
}
/** Gato tumbado encima de una cabeza: (x, y) = lo alto del pelo. */
function gatoGorro(g, x, y, s, o, t) {
  g.save(); g.lineJoin = "round"; g.lineCap = "round";
  // cola colgando por el lado
  const cw = Math.sin(t * 2.2) * 5 * s;
  g.strokeStyle = NAR_O; g.lineWidth = 10 * s;
  g.beginPath(); g.moveTo(x + 28 * s, y - 6 * s); g.bezierCurveTo(x + 46 * s, y, x + 44 * s + cw, y + 26 * s, x + 36 * s + cw, y + 44 * s); g.stroke();
  g.strokeStyle = NAR; g.lineWidth = 7 * s; g.stroke();
  // cuerpo en forma de barra de pan
  const gr = g.createLinearGradient(0, y - 30 * s, 0, y + 6 * s);
  gr.addColorStop(0, NAR_C); gr.addColorStop(1, "#cf7019");
  g.fillStyle = gr; g.strokeStyle = NAR_O; g.lineWidth = 1.8;
  g.beginPath(); g.ellipse(x, y - 8 * s, 36 * s, 15 * s, 0, 0, 6.283); g.fill(); g.stroke();
  g.strokeStyle = NAR_O; g.lineWidth = 2.6 * s;
  for (const d of [-26, -18, 18, 26]) { g.beginPath(); g.moveTo(x + d * s, y - 20 * s); g.lineTo(x + d * 1.06 * s, y - 10 * s); g.stroke(); }
  // patitas colgando por la frente
  g.fillStyle = CREMA; g.strokeStyle = NAR_O; g.lineWidth = 1.2;
  for (const d of [-1, 1]) { g.beginPath(); g.ellipse(x + d * 13 * s, y + 5 * s, 6 * s, 7.5 * s, 0, 0, 6.283); g.fill(); g.stroke(); }
  cabezaGato(g, x, y - 26 * s, s, o.ojos || "abiertos", o.boca || 0, t);
  g.restore();
}

class RescateGato extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(260);
    this.p.suelo = () => PIES + 4;
    this.pelos = [];
  }
  luz() { return tramo(this.t, 0.02, 0.45) * (1 - tramo(this.t, T_APAGA, T_APAGA + 0.35)); }
  /** Altura que ha subido Marcos por la escalera. */
  subida(t) {
    const u = tramo(t, T_SUBE, T_ARRIBA) * NPASOS, i = Math.min(NPASOS - 1, Math.floor(u)), f = u >= NPASOS ? 1 : u - i;
    return { h: (i + eInOut(f)) * PELDANO, i, f, sube: t > T_SUBE && t < T_ARRIBA };
  }
  /** Dónde está el gato: { modo, x, y, ang }. */
  gato(t, mG) {
    if (t < T_SALTA) return { modo: "sentado", x: GATO0[0], y: GATO0[1] };
    const cabeza = aPant(mG, [39, 4]);
    if (t < T_CAE) {
      const u = tramo(t, T_SALTA, T_CAE);
      const x = lerp(GATO0[0], cabeza[0], u), y = lerp(GATO0[1] - 30, cabeza[1] - 20, u) - 150 * Math.sin(Math.PI * u);
      const vy = (lerp(GATO0[1] - 30, cabeza[1] - 20, u + 0.01) - 150 * Math.sin(Math.PI * (u + 0.01))) - y;
      return { modo: "salto", x, y, ang: clamp(Math.atan2(vy, -(cabeza[0] - GATO0[0]) * 0.01) * 0.6, -0.7, 0.7) };
    }
    return { modo: "gorro", x: cabeza[0], y: cabeza[1] };
  }
  poses() {
    const t = this.t;
    const G = { cara: "sorpresa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let xm = XM, ym = PIES, syG = 1, yg = PIES;
    // ---- Guillermo
    if (t < T_ENTRA + 0.3) {
      // señala al gato, preocupado
      const k = eOut(tramo(t, 0.2, 0.5));
      G.manoD = mezcla([70, 158], [124, 40], k); G.rc = 0.12 * k; G.cara = "sorpresa";
    } else if (t < T_SUBE) {
      // mira a Marcos, aliviado, y le señala el gato
      const k = eInOut(tramo(t, T_ENTRA + 0.3, T_ENTRA + 0.6));
      G.manoD = mezcla([124, 40], [118, 44 + 6 * Math.sin(t * 9)], k); G.rc = lerp(0.12, 0.16, k); G.cara = t < T_PARA ? "sonrisa" : "risa";
    } else if (t < T_SALTA) {
      // nervioso: manos juntas
      G.brazoIDelante = true; const s = Math.sin(t * 14);
      G.manoD = [50 + 2 * s, 108]; G.manoI = [30 - 2 * s, 110]; G.rc = 0.14;
      G.cara = t < T_ARRIBA ? (Math.floor(t * 2.5) % 3 === 0 ? "sorpresa" : "sonrisa") : t < T_AGACHA ? "sonrisa" : "sorpresa";
      yg = PIES - (t > T_ALARGA && t < T_AGACHA ? 0 : 2 * Math.abs(s));
    } else if (t < T_CAE) {
      // ¡que viene!
      G.cara = "sorpresa"; G.rc = 0.1; G.puntas = 0.7;
      G.manoD = [96, 70]; G.manoI = [-18, 72];
    } else {
      // quieto, con el gato de gorro
      const d = t - T_CAE;
      syG = 1 - 0.08 * Math.exp(-d * 8) * Math.cos(d * 26);
      G.manoD = [80, 150]; G.manoI = [0, 152];
      G.cara = d < 0.55 ? "sorpresa" : t < T_RONRONEA + 0.6 ? "sonrisa" : "guino";
      if (t > T_RONRONEA + 0.5) {
        // le acaricia el lomo al gato
        const k = eInOut(tramo(t, T_RONRONEA + 0.5, T_RONRONEA + 0.8));
        G.manoD = mezcla([80, 150], [64 + 7 * Math.sin((t - T_RONRONEA) * 7), 16], k);
      }
      G.puntas = 0.5 * (1 - tramo(d, 0, 0.4));
    }
    // ---- Marcos
    if (t < T_PARA) {
      const u = tramo(t, T_ENTRA, T_PARA);
      xm = lerp(XM0, XM, eOut(u));
      if (t > T_ENTRA) { const a = andar((t - T_ENTRA) * 12, 1); M.piernaI = a.piernaI; M.piernaD = a.piernaD; ym += a.bote * (1 - u); }
      M.cara = "sonrisa"; M.rc = -0.06;
      const s = Math.sin((t - T_ENTRA) * 12); M.manoD = [70 + 6 * s, 148]; M.manoI = [4 - 6 * s, 148];
    } else if (t < T_SUBE) {
      // saluda
      const k = Math.sin(Math.PI * tramo(t, T_SALUDO, T_SUBE));
      M.manoD = mezcla([67, 152], [58, 34], k); M.cara = "guino"; M.rc = -0.05;
    } else {
      const S = this.subida(t);
      ym = PIES - S.h;
      // manos en los raíles, una sube cada paso
      const lado = S.i % 2, up = S.sube ? Math.sin(Math.PI * S.f) : 0;
      M.manoI = [13, 70 - (lado ? 14 * up : 0)]; M.manoD = [68, 70 - (lado ? 0 : 14 * up)];
      if (lado) M.piernaD = [-16 * up, 0]; else M.piernaI = [-16 * up, 0];
      M.cara = S.sube ? (S.f < 0.5 ? "sonrisa" : "guino") : "sonrisa";
      M.rc = S.sube ? -0.05 : 0;
      if (t > T_ALARGA) {
        // alarga el brazo, con mucho cuidado
        const k = eInOut(tramo(t, T_ALARGA, T_AGACHA + 0.2));
        M.manoD = mezcla([68, 70], [118, 46], k); M.rc = 0.12 * k; M.cara = "sonrisa";
        M.manoI = [13, 70];
      }
      if (t > T_SALTA) {
        M.cara = "sorpresa"; M.puntas = 0.6 * (1 - tramo(t, T_CAE, T_CAE + 0.5)); M.rc = lerp(0.12, -0.2, eOut(tramo(t, T_SALTA, T_SALTA + 0.4)));
        M.manoD = [100, 54];
      }
      if (t > T_CAE + 0.35) {
        // se ríe y le señala
        const k = eOut(tramo(t, T_CAE + 0.35, T_CAE + 0.6));
        M.cara = Math.floor(t * 3) % 4 === 0 ? "guino" : "risa"; M.rc = -0.14;
        M.manoD = [68, 70]; M.brazoIDelante = true; M.manoI = mezcla([13, 70], [-46, 78 + 4 * Math.sin(t * 12)], k);
        ym += -3 * Math.abs(Math.sin(t * 12));
      }
    }
    const mG = matAv(XG, yg, ESC, 0, 1, syG), mM = matAv(xm, ym, ESC);
    return { G, M, mG, mM };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("cae", t > T_CAE, () => {
      temblar(14, 0.35);
      const e = this.poses(), c = aPant(e.mG, [39, 0]);
      for (let i = 0; i < 18; i++) { const a = azar(-Math.PI, 0), v = azar(80, 260); this.pelos.push({ x: c[0] + azar(-30, 30), y: c[1] - 10, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: azar(0, 6), vida: azar(0.5, 0.8) }); }
      for (let i = 0; i < 8; i++) p.nueva(P.DESTELLO, c[0] + azar(-40, 40), c[1] + azar(-30, 10), 0, 0, 0.3, azar(40, 80));
    });
    this.una("pasos", t > T_ENTRA, () => {});
    // corazoncitos y ronroneo
    for (const p0 of this.pelos) { p0.vy += 380 * dt; p0.vx *= 1 - 1.5 * dt; p0.x += p0.vx * dt; p0.y += p0.vy * dt; p0.r += 4 * dt; p0.vida -= dt; }
    this.pelos = this.pelos.filter((q) => q.vida > 0);
    p.actualizar(dt);
  }
  // ------------------------------------------------------------------ dibujo
  fondoFijo() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    // pared
    const gp = g.createLinearGradient(0, -60, 0, 470);
    gp.addColorStop(0, "#2a1410"); gp.addColorStop(1, "#5a2e1e");
    g.fillStyle = gp; g.fillRect(-60, -60, W + 120, 600);
    g.fillStyle = "rgba(255,200,140,.05)";
    for (let x = -60; x < W + 60; x += 46) g.fillRect(x, -60, 2, 520);
    // friso de madera
    const gm = g.createLinearGradient(0, 380, 0, PIES);
    gm.addColorStop(0, "#5a3218"); gm.addColorStop(1, "#2e170a");
    g.fillStyle = gm; g.fillRect(-60, 390, W + 120, PIES - 390);
    g.fillStyle = "#7a4a26"; g.fillRect(-60, 384, W + 120, 10);
    g.fillStyle = "rgba(0,0,0,.25)"; for (let x = -40; x < W + 60; x += 90) g.fillRect(x, 400, 3, PIES - 400);
    // pizarra de tapas
    g.save(); g.translate(330, 150); g.rotate(-0.03);
    g.fillStyle = "#6a4020"; rectR(g, -98, -66, 196, 132, 8); g.fill();
    g.fillStyle = "#1d2a22"; rectR(g, -88, -56, 176, 112, 4); g.fill();
    txt(g, "TAPAS", 0, -20, { tam: 30, peso: 400, fam: FB, color: "#fffdf5", esp: 2 });
    g.strokeStyle = "rgba(255,255,255,.6)"; g.lineWidth = 2;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-60, 4 + i * 16); g.lineTo(30, 4 + i * 16); g.stroke(); txt(g, ["2€", "3€", "4€"][i], 58, 10 + i * 16, { tam: 14, peso: 800, color: "#ffd34d" }); }
    g.restore();
    // barra al fondo (izquierda)
    g.fillStyle = "#3a1e0c"; g.fillRect(-60, 452, 590, PIES - 452);
    const gb = g.createLinearGradient(0, 440, 0, 458); gb.addColorStop(0, "#b07a40"); gb.addColorStop(1, "#5a3414");
    g.fillStyle = gb; g.fillRect(-60, 440, 600, 16);
    g.fillStyle = "rgba(255,230,180,.35)"; g.fillRect(-60, 440, 600, 2);
    for (let x = -20; x < 520; x += 70) { g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(x, 468, 52, 96); }
    // estantería
    const E = EST;
    g.fillStyle = "#3b200e"; g.fillRect(E.x0, E.top, E.x1 - E.x0, PIES - E.top);
    const ge = g.createLinearGradient(E.x0, 0, E.x1, 0); ge.addColorStop(0, "#6a3c1a"); ge.addColorStop(0.5, "#8a5428"); ge.addColorStop(1, "#5a3014");
    g.fillStyle = ge;
    g.fillRect(E.x0 - 8, E.top - 10, E.x1 - E.x0 + 16, 14);
    g.fillRect(E.x0 - 4, E.top, 12, PIES - E.top); g.fillRect(E.x1 - 8, E.top, 12, PIES - E.top);
    g.fillStyle = "rgba(255,220,160,.35)"; g.fillRect(E.x0 - 8, E.top - 10, E.x1 - E.x0 + 16, 2);
    const cols = ["#2f7a3a", "#8a3b16", "#3b5d9a", "#b08a1a", "#8a1e4a", "#2a8a8a"];
    const r = semilla(7);
    for (const yb of [300, 388, 476]) {
      g.fillStyle = "#7a4a22"; g.fillRect(E.x0, yb, E.x1 - E.x0, 8);
      for (let x = E.x0 + 22; x < E.x1 - 14; x += 26 + r() * 8) {
        const alto = 40 + r() * 26, cc = cols[(r() * cols.length) | 0];
        g.fillStyle = cc; rectR(g, x - 8, yb - alto, 16, alto, 4); g.fill(); g.fillRect(x - 3, yb - alto - 14, 6, 15);
        g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(x - 5, yb - alto + 4, 2, alto - 8);
        g.fillStyle = "#f4e9cc"; g.fillRect(x - 6, yb - alto * 0.6, 12, 12);
      }
    }
    // lámparas
    for (const x of [150, 470]) {
      g.strokeStyle = "#111"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, -60); g.lineTo(x, 46); g.stroke();
      g.fillStyle = "#1d4a2c"; g.beginPath(); g.moveTo(x - 30, 70); g.lineTo(x + 30, 70); g.lineTo(x + 12, 46); g.lineTo(x - 12, 46); g.closePath(); g.fill();
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.7; g.drawImage(BLOB.amarillo, x - 90, 30, 180, 150); g.restore();
    }
    // suelo
    const gs = g.createLinearGradient(0, PIES, 0, H + 60); gs.addColorStop(0, "#4a2a16"); gs.addColorStop(1, "#1a0c04");
    g.fillStyle = gs; g.fillRect(-60, PIES - 4, W + 120, H + 60 - PIES);
    g.fillStyle = "rgba(255,210,150,.18)"; g.fillRect(-60, PIES - 4, W + 120, 2);
    // escalera apoyada en la estantería
    this.escalera(g);
    return (this.cF = c);
  }
  escalera(g) {
    const gr = g.createLinearGradient(ESC_X0 - 8, 0, ESC_X1 + 8, 0);
    gr.addColorStop(0, "#9aa4ad"); gr.addColorStop(0.5, "#eef3f6"); gr.addColorStop(1, "#7a848d");
    for (const x of [ESC_X0, ESC_X1]) { g.fillStyle = gr; rectR(g, x - 6, ESC_TOP, 12, PIES - ESC_TOP, 3); g.fill(); g.strokeStyle = "#4a5258"; g.lineWidth = 1.5; g.stroke(); }
    for (let y = PIES - 26; y > ESC_TOP + 10; y -= PELDANO) {
      g.fillStyle = "#c9d0d6"; g.fillRect(ESC_X0, y - 4, ESC_X1 - ESC_X0, 8);
      g.fillStyle = "#6a727a"; g.fillRect(ESC_X0, y + 2, ESC_X1 - ESC_X0, 2);
    }
    g.fillStyle = "#222"; g.fillRect(ESC_X0 - 8, PIES - 8, 16, 8); g.fillRect(ESC_X1 - 8, PIES - 8, 16, 8);
  }
  rotulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(520, 200), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 160);
    gr.addColorStop(0, "#fff6d0"); gr.addColorStop(0.5, "#ffc177"); gr.addColorStop(1, "#f37a1a");
    txt(g, "¡MIAU!", 266, 156, { tam: 150, peso: 400, fam: FC, color: "#3a1600", esp: 4 });
    txt(g, "¡MIAU!", 260, 150, { tam: 150, peso: 400, fam: FC, color: gr, borde: "#3a1600", bordeAncho: 12, esp: 4, glow: "rgba(255,160,60,.8)", glowTam: 22 });
    CT.set("t", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses(), L = this.luz();
    fondo(g, "#000");
    g.drawImage(this.fondoFijo(), -60, -60);
    // sombras
    g.fillStyle = "rgba(0,0,0,.35)";
    g.beginPath(); g.ellipse(XG, PIES + 2, 60, 9, 0, 0, 6.283); g.fill();
    const xm = aPant(e.mM, [37, 232])[0];
    if (t < T_SUBE) { g.beginPath(); g.ellipse(xm, PIES + 2, 56, 9, 0, 0, 6.283); g.fill(); }
    const gt = this.gato(t, e.mG);
    // el gato arriba (detrás de Marcos)
    if (gt.modo === "sentado") {
      const ag = eOut(tramo(t, T_AGACHA, T_AGACHA + 0.2));
      const maulla = [0.55, 1.35, 3.2].some((x) => t > x && t < x + 0.45);
      gatoSentado(g, gt.x, gt.y, SG, { agacha: ag, ojos: ag > 0.3 ? "grandes" : "abiertos", boca: maulla ? 1 : 0 }, t);
    }
    pintarAvatar(g, e.mM, e.M, t);
    pintarAvatar(g, e.mG, e.G, t);
    if (gt.modo === "salto") gatoSalto(g, gt.x, gt.y, SG, gt.ang, t);
    if (gt.modo === "gorro") {
      const ron = t > T_RONRONEA;
      gatoGorro(g, gt.x, gt.y + 6, SG * 0.92, { ojos: ron ? "cerrados" : "grandes", boca: t < T_CAE + 0.6 ? 1 : 0 }, t);
    }
    // pelitos sueltos
    g.fillStyle = NAR;
    for (const q of this.pelos) { g.save(); g.globalAlpha = Math.min(1, q.vida * 2); g.translate(q.x, q.y); g.rotate(q.r); g.beginPath(); g.ellipse(0, 0, 6, 2, 0, 0, 6.283); g.fill(); g.restore(); }
    this.p.dibujar(g);
    // miau pequeñitos al principio
    for (const [t0, k0] of [[0.55, 0], [1.35, 1], [3.2, 2]]) {
      if (t > t0 && t < t0 + 0.75) {
        const k = tramo(t, t0, t0 + 0.2) * (1 - tramo(t, t0 + 0.6, t0 + 0.75));
        bocadillo(g, 930 - k0 * 20, 64 - k0 * 4, "miau", GATO0[0] + 14, GATO0[1] - 112, k, 30);
      }
    }
    // ronroneo
    if (t > T_RONRONEA && t < T_APAGA + 0.3) {
      const c = aPant(e.mG, [39, 0]);
      for (let i = 0; i < 3; i++) {
        const d = ((t - T_RONRONEA) * 0.8 + i / 3) % 1;
        txt(g, "rrr", c[0] + 70 + d * 30 + i * 6, c[1] - 30 - d * 60, { tam: 24, peso: 400, fam: FB, color: "#ffd9a0", alfa: Math.sin(Math.PI * d) });
        corazon(g, c[0] - 70 - d * 20 - i * 8, c[1] - 20 - d * 70, 9, Math.sin(Math.PI * d));
      }
    }
    // ¡MIAU!
    if (t > T_CAE) {
      const d = t - T_CAE, k = tramo(d, 0, 0.16), s = lerp(1.5, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 7));
      const r = this.rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - tramo(t, T_APAGA - 0.1, T_APAGA + 0.2)); g.translate(410, 118); g.rotate(-0.05); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    // luz apagada: solo los ojos del gato
    const negro = 1 - L;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
    if (t > T_APAGA + 0.2 && t < T_OJOS_OFF + 0.12) {
      const c = aPant(e.mG, [39, 0]), s = SG * 0.92;
      const parp = t > T_APAGA + 0.75 && t < T_APAGA + 0.85 ? 0.15 : t > T_OJOS_OFF ? 1 - tramo(t, T_OJOS_OFF, T_OJOS_OFF + 0.1) : 1;
      const a = tramo(t, T_APAGA + 0.2, T_APAGA + 0.4);
      g.save(); g.globalAlpha = a;
      for (const d of [-1, 1]) {
        const ex = c[0] + d * 9.5 * s, ey = c[1] + 6 - 26 * s - 3 * s;
        g.save(); g.globalCompositeOperation = "lighter"; g.drawImage(BLOB2.oro, ex - 18, ey - 18, 36, 36); g.restore();
        g.fillStyle = "#e9ff6a"; g.beginPath(); g.ellipse(ex, ey, 5.6 * s, 6.6 * s * parp, 0, 0, 6.283); g.fill();
        g.fillStyle = "#111"; g.beginPath(); g.ellipse(ex, ey, 1.8 * s, 5.4 * s * parp, 0, 0, 6.283); g.fill();
      }
      g.restore();
    }
  }
}
function corazon(g, x, y, r, a) {
  if (a <= 0) return;
  g.save(); g.globalAlpha = a; g.fillStyle = "#ff5c8a"; g.translate(x, y);
  g.beginPath(); g.moveTo(0, r * 0.9); g.bezierCurveTo(-r * 1.6, -r * 0.2, -r * 0.6, -r * 1.3, 0, -r * 0.4); g.bezierCurveTo(r * 0.6, -r * 1.3, r * 1.6, -r * 0.2, 0, r * 0.9); g.fill();
  g.restore();
}

registrar({ id: "00207", nombre: "Rescate del gato", crear: () => new RescateGato() });
})();
