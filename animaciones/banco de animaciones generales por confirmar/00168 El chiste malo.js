"use strict";
/*
 * 00168 · EL CHISTE MALO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Noche de monólogos en el bar: Marcos, con su micro de pie, da dos golpecitos (TOC, TOC) y suelta el chiste:
 * «¿Qué le dice una aceituna a otra?» «¡Nada! ¡Las aceitunas no hablan!». Guillermo, a la batería, lo remata:
 * ¡BA DUM TSS! Silencio incómodo: luz azul, grillos, una bola de paja que cruza el escenario… y los dos se parten
 * de risa (otro ¡BA DUM TSS! con platillo). Se apaga el foco.
 */
(() => {
const CT = cacheTexto();
const ESC = 1.5;
const XM = 330, XG = 735;
const MIC = [356, 340];                                    // cabeza del micro (pantalla)
const SNARE = [636, 432], TOM = [840, 452], PLATO = [880, 332], BOMBO = [735, 498];
const T_TOC = 0.75, T_Q = 1.55, T_R = 3.55, T_BA = 4.95, T_DUM = 5.2, T_TSS = 5.45, T_SIL = 5.95, T_RISA = 8.05, T_TSS2 = 8.4, T_APAGA = 9.9, DUR = 10.5;

const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
const habla = (t) => (Math.sin(t * 34) > 0 ? "sorpresa" : "sonrisa");

function fondoEscenario() {
  if (CT.has("fondo")) return CT.get("fondo");
  const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
  g.translate(60, 60);
  // telón rojo con pliegues
  const gt = g.createLinearGradient(0, -60, 0, 470);
  gt.addColorStop(0, "#2a0408"); gt.addColorStop(1, "#5a0a12");
  g.fillStyle = gt; g.fillRect(-60, -60, W + 120, 540);
  for (let x = -60; x < W + 60; x += 46) {
    const gp = g.createLinearGradient(x, 0, x + 46, 0);
    gp.addColorStop(0, "rgba(0,0,0,.45)"); gp.addColorStop(0.45, "rgba(255,90,100,.16)"); gp.addColorStop(1, "rgba(0,0,0,.45)");
    g.fillStyle = gp; g.fillRect(x, -60, 46, 540);
  }
  // bambalina arriba
  g.fillStyle = "#3d060c";
  g.beginPath(); g.moveTo(-60, -60); g.lineTo(W + 60, -60); g.lineTo(W + 60, 34);
  for (let x = W + 60; x >= -60; x -= 64) g.quadraticCurveTo(x - 32, 64, x - 64, 34);
  g.closePath(); g.fill();
  g.strokeStyle = "#d9a441"; g.lineWidth = 3;
  g.beginPath(); for (let x = W + 60; x >= -60; x -= 64) { g.moveTo(x, 34); g.quadraticCurveTo(x - 32, 64, x - 64, 34); } g.stroke();
  // escenario de madera
  const gs = g.createLinearGradient(0, 470, 0, H + 60);
  gs.addColorStop(0, "#4a2a12"); gs.addColorStop(1, "#160b04");
  g.fillStyle = gs; g.fillRect(-60, 470, W + 120, H - 410);
  g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2;
  for (let i = -16; i <= 16; i++) { g.beginPath(); g.moveTo(512 + i * 40, 470); g.lineTo(512 + i * 110, H + 60); g.stroke(); }
  g.fillStyle = "rgba(255,210,150,.18)"; g.fillRect(-60, 470, W + 120, 3);
  CT.set("fondo", c);
  return c;
}
function titulo() {
  if (CT.has("tit")) return CT.get("tit");
  const c = lienzoNuevo(900, 200), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 160);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#fff3b0"); gr.addColorStop(1, "#ffb81f");
  txt(g, "¡BA DUM TSS!", 456, 158, { tam: 140, peso: 400, fam: FC, color: "#2a1000", esp: 5, max: 840 });
  txt(g, "¡BA DUM TSS!", 450, 152, { tam: 140, peso: 400, fam: FC, color: gr, borde: "#2a1000", bordeAncho: 14, esp: 5, glow: "rgba(255,200,60,.85)", glowTam: 26, max: 840 });
  CT.set("tit", c);
  return c;
}
/** Bola de paja: muchos trazos curvos, precalculados. */
const PAJA = (() => { const r = semilla(5), a = []; for (let i = 0; i < 30; i++) a.push([r() * 6.283, 8 + r() * 26, 0.8 + r() * 2.2, r() * 6.283, r() < 0.5 ? "#b8915a" : "#7d5a2e"]); return a; })();
function bolaPaja(g, x, y, rot) {
  g.save(); g.translate(x, y); g.rotate(rot); g.lineCap = "round";
  for (const [a, r, l, b, c] of PAJA) {
    g.strokeStyle = c; g.lineWidth = 2.2;
    g.beginPath(); g.arc(Math.cos(a) * (34 - r) * 0.4, Math.sin(a) * (34 - r) * 0.4, r, b, b + l); g.stroke();
  }
  g.restore();
}
function grillo(g, x, y, t, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const salto = Math.max(0, Math.sin(t * 9)) * 0;
  g.translate(0, -salto);
  g.strokeStyle = "#3a5a1a"; g.lineWidth = 1.6; g.lineCap = "round";
  g.beginPath(); g.moveTo(-8, 0); g.lineTo(-16, -9); g.lineTo(-22, 2); g.stroke();
  g.beginPath(); g.moveTo(2, 1); g.lineTo(0, 6); g.moveTo(6, 1); g.lineTo(9, 6); g.stroke();
  const gr = g.createLinearGradient(0, -8, 0, 4);
  gr.addColorStop(0, "#8fc44a"); gr.addColorStop(1, "#3e6a1c");
  g.fillStyle = gr; g.beginPath(); g.ellipse(-2, -2, 13, 5.5, -0.1, 0, 6.283); g.fill();
  g.beginPath(); g.arc(12, -4, 4.5, 0, 6.283); g.fill();
  g.fillStyle = "#111"; g.beginPath(); g.arc(14, -5, 1.2, 0, 6.283); g.fill();
  g.strokeStyle = "#3a5a1a"; g.lineWidth = 1;
  const v = Math.sin(t * 30) * 2;
  g.beginPath(); g.moveTo(14, -8); g.quadraticCurveTo(22, -22, 34, -20 + v); g.moveTo(13, -8); g.quadraticCurveTo(18, -24, 26, -28 - v); g.stroke();
  g.restore();
}

class ChisteMalo extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(360);
    this.vibra = { plato: -9, bombo: -9, snare: -9, tom: -9 };
  }
  luz() { return tramo(this.t, 0, 0.45) * (1 - tramo(this.t, T_APAGA, DUR - 0.03)); }
  /** Golpes de la batería: [t, tambor, mano]. */
  golpes() {
    return [[T_BA, "snare", "I"], [T_DUM, "tom", "D"], [T_TSS, "plato", "D"], [T_TSS2 - 0.3, "snare", "I"], [T_TSS2 - 0.15, "tom", "D"], [T_TSS2, "plato", "D"],
      [8.95, "snare", "I"], [9.1, "tom", "D"], [9.25, "snare", "I"], [9.4, "plato", "D"]];
  }
  poses() {
    const t = this.t;
    const M = { quien: "marcos", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [80, 122], manoI: [10, 118], brazoIDelante: true };
    let syM = 1, giroM = 0, dyM = 0, syG = 1, dyG = 0;
    const mM0 = matAv(XM, PIES, ESC), mG = matAv(XG, PIES, ESC);
    // ---------------- Marcos
    if (t < T_Q) {
      // TOC, TOC en el micro
      const k = eInOut(tramo(t, 0.45, 0.65)) * (1 - eInOut(tramo(t, 1.25, 1.45)));
      const mic = enAv(mM0, [MIC[0] + 10, MIC[1] + 4]);
      const tap = t > T_TOC && t < 1.2 ? Math.max(0, Math.sin((t - T_TOC) * 22)) * 7 : 0;
      M.manoD = mezcla(M.manoD, [mic[0] + 4, mic[1] - 2 - tap], k);
      M.cara = t > 0.6 ? "guino" : "sonrisa"; M.rc = -0.06;
    } else if (t < T_R) {
      // la pregunta: habla y gesticula
      const k = eOut(tramo(t, T_Q, T_Q + 0.25));
      M.manoI = mezcla(M.manoI, [-16 + 4 * Math.sin(t * 6), 118], k);
      M.manoD = mezcla(M.manoD, [82, 120 + 6 * Math.sin(t * 7)], k);
      M.cara = habla(t); M.rc = 0.06 * Math.sin(t * 3);
    } else if (t < T_BA - 0.1) {
      // la respuesta, con los brazos abiertos (ta-chán)
      const k = eBack(tramo(t, T_R, T_R + 0.25));
      M.manoI = mezcla([-16, 118], [-28, 72], k); M.manoD = mezcla([82, 120], [100, 74], k);
      M.cara = t < T_R + 0.9 ? habla(t) : "risa"; M.rc = 0.05;
      dyM = -Math.abs(Math.sin(tramo(t, T_R, T_R + 0.4) * Math.PI)) * 8;
    } else if (t < T_SIL) {
      // ¡dale! señala a la batería
      const k = eOut(tramo(t, T_BA - 0.1, T_BA + 0.1));
      M.manoD = mezcla([100, 74], [104, 96], k); M.manoI = mezcla([-28, 72], [8, 150], k);
      M.cara = "guino"; M.rc = 0.12;
    } else if (t < T_RISA) {
      // silencio incómodo
      const k = eInOut(tramo(t, T_SIL, T_SIL + 0.4));
      M.manoD = mezcla([104, 96], [60, 146], k); M.manoI = mezcla([8, 150], [12, 148], k);
      M.cara = t > 6.9 && t < 7.5 ? "dormido" : "sonrisa";
      M.rc = t < 6.9 ? -0.04 + 0.03 * Math.sin(t * 2) : t < 7.5 ? 0.12 : -0.18;
      // se rasca la cabeza
      if (t > 6.2 && t < 6.85) { M.manoD = [64 + 3 * Math.sin(t * 30), 30]; }
    } else {
      // se parten de risa: se dobla y se da palmadas en la pierna
      const s = Math.sin((t - T_RISA) * 16);
      M.cara = "risa"; M.rc = 0.1 * Math.sin((t - T_RISA) * 7);
      M.manoD = [64 + 3 * s, 132 + 8 * s]; M.manoI = [14 - 3 * s, 120 - 6 * s]; M.brazoIDelante = true;
      syM = 0.95 + 0.02 * s; giroM = 0.08 * Math.sin((t - T_RISA) * 5);
      dyM = -Math.abs(s) * 6;
    }
    // ---------------- Guillermo (palos: [mano, punta a la que apunta])
    let aimD = [126, 104], aimI = [-20, 112];
    const golpe = (t0, dur) => Math.max(0, 1 - Math.abs(t - t0) / dur);
    if (t < 1.5) {
      // hace girar el palo derecho
      const k = eInOut(tramo(t, 0.5, 0.7)) * (1 - eInOut(tramo(t, 1.25, 1.45)));
      G.manoD = mezcla(G.manoD, [92, 70], k);
      const a = -0.6 + (t > 0.6 && t < 1.3 ? (t - 0.6) * 22 : 0);
      if (k > 0.1) aimD = [G.manoD[0] + Math.cos(a) * 40, G.manoD[1] + Math.sin(a) * 40];
      G.cara = t > 0.6 ? "guino" : "sonrisa";
    } else if (t < T_BA - 0.4) {
      G.cara = t < T_R + 0.2 ? "sonrisa" : "sorpresa"; G.rc = -0.1;
      if (t > T_R + 0.2 && t < T_R + 0.6) G.rc = -0.1 + 0.03 * Math.sin(t * 40);
      if (t > 4.3) { G.cara = "guino"; G.rc = 0; }
    } else if (t < T_SIL) {
      G.cara = t < T_BA ? "guino" : "risa";
    } else if (t < T_RISA) {
      G.cara = t < 6.4 ? "sorpresa" : "sonrisa";
      G.rc = t < 6.4 ? 0 : 0.08 * Math.sin((t - 6.4) * 2.5) + 0.06;
      if (t > 7.4) G.cara = "dormido";
    } else {
      G.cara = "risa"; G.rc = -0.08 * Math.sin((t - T_RISA) * 6);
      syG = 0.97 + 0.02 * Math.sin((t - T_RISA) * 16); dyG = -Math.abs(Math.sin((t - T_RISA) * 8)) * 5;
    }
    // golpes: la mano baja hacia el tambor y el palo apunta a él
    const uSn = enAv(mG, SNARE), uTom = enAv(mG, TOM), uPl = enAv(mG, [PLATO[0] - 44, PLATO[1] + 4]);
    const bD = { snare: uSn, tom: uTom, plato: uPl };
    const reposoD = G.manoD.slice(), reposoI = G.manoI.slice();
    for (const [t0, tam, mano] of this.golpes()) {
      const k = golpe(t0, 0.16);
      if (k <= 0) continue;
      const obj = bD[tam];
      if (mano === "D") {
        const hand = [obj[0] - (tam === "plato" ? 30 : 26), obj[1] + (tam === "plato" ? 14 : -18)];
        G.manoD = mezcla(reposoD, hand, eOut(k)); aimD = mezcla(aimD, obj, eOut(k));
      } else {
        const hand = [obj[0] + 30, obj[1] - 16];
        G.manoI = mezcla(reposoI, hand, eOut(k)); aimI = mezcla(aimI, obj, eOut(k));
      }
    }
    // tras el TSS se queda con el palo arriba, congelado
    if (t > T_TSS + 0.12 && t < T_RISA) {
      const k = eOut(tramo(t, T_TSS + 0.12, T_TSS + 0.3));
      G.manoD = mezcla(G.manoD, [96, 66], k); aimD = mezcla(aimD, [130, 36], k);
    }
    const palo = (aim) => (g, m) => {
      const a = Math.atan2(aim[1] - m[1], aim[0] - m[0]);
      g.save(); g.translate(m[0], m[1]); g.rotate(a);
      const gr = g.createLinearGradient(0, -2, 0, 2);
      gr.addColorStop(0, "#f5deb0"); gr.addColorStop(1, "#b0844a");
      g.fillStyle = gr; rectR(g, -10, -1.8, 46, 3.6, 1.8); g.fill();
      g.fillStyle = "#f8ecd0"; g.beginPath(); g.ellipse(36, 0, 3, 2.2, 0, 0, 6.283); g.fill();
      g.restore();
    };
    G.objD = palo(aimD); G.objI = palo(aimI);
    const mM = matAv(XM, PIES + dyM, ESC, giroM, 1, syM);
    return { M, G, mM, mG: matAv(XG, PIES + dyG, ESC, 0, 1, syG) };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    for (const [t0, tam] of this.golpes()) this.una("g" + t0, t > t0, () => {
      this.vibra[tam] = t;
      const q = tam === "plato" ? [PLATO[0] - 40, PLATO[1]] : tam === "snare" ? SNARE : TOM;
      temblar(tam === "plato" ? 9 : 5, 0.2);
      for (let i = 0; i < (tam === "plato" ? 16 : 7); i++) { const a = azar(-3.1, 0), v = azar(150, 380); p.nueva(P.CHISPA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.25, 0.5), azar(6, 10)); }
      if (tam === "plato") p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.3, 140);
    });
    this.una("bombo", t > T_DUM, () => { this.vibra.bombo = t; });
    this.una("bombo2", t > T_TSS2 - 0.15, () => { this.vibra.bombo = t; });
    // la bola de paja levanta polvo
    if (t > 6.3 && t < 7.9 && Math.random() < 12 * dt) { const x = this.xPaja(t); p.nueva(P.POLVO, x, PIES - 10, azar(20, 80), azar(-30, -5), azar(0.4, 0.7), azar(18, 30)); }
    this.una("risa", t > T_RISA, () => temblar(8, 0.3));
    this.una("tit2", t > T_TSS2, () => {
      for (let i = 0; i < 80; i++) p.nueva(P.CONFETI, azar(0, W), azar(-120, -10), azar(-50, 50), azar(0, 150), azar(2.5, 3.5), azar(9, 14), i % 5);
    });
    p.suelo = () => PIES + 6;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  xPaja(t) { return lerp(W + 80, -80, tramo(t, 6.3, 7.9)); }
  bateria(g, t, delante) {
    const vib = (k, f) => { const d = t - this.vibra[k]; return d > 0 && d < 0.5 ? Math.sin(d * f) * Math.exp(-d * 8) : 0; };
    if (!delante) {
      // soporte y platos (detrás)
      g.strokeStyle = "#9aa3ad"; g.lineWidth = 4;
      g.beginPath(); g.moveTo(PLATO[0], PLATO[1]); g.lineTo(PLATO[0] + 10, PIES - 4); g.moveTo(PLATO[0] - 14, PIES); g.lineTo(PLATO[0] + 10, PIES - 30); g.lineTo(PLATO[0] + 34, PIES); g.stroke();
      g.beginPath(); g.moveTo(588, 384); g.lineTo(588, PIES - 4); g.moveTo(566, PIES); g.lineTo(588, PIES - 30); g.lineTo(610, PIES); g.stroke();
      return;
    }
    // charles
    for (const dy of [0, -7]) {
      const gr = g.createLinearGradient(548, 0, 628, 0);
      gr.addColorStop(0, "#8a5a10"); gr.addColorStop(0.5, "#ffe08a"); gr.addColorStop(1, "#8a5a10");
      g.fillStyle = gr; g.beginPath(); g.ellipse(588, 384 + dy, 40, 7, 0, 0, 6.283); g.fill();
    }
    // caja (snare)
    const vs = vib("snare", 60) * 3;
    g.save(); g.translate(SNARE[0], SNARE[1] + vs);
    const gc = g.createLinearGradient(-46, 0, 46, 0);
    gc.addColorStop(0, "#5d6670"); gc.addColorStop(0.45, "#eef2f6"); gc.addColorStop(1, "#5d6670");
    g.fillStyle = gc; g.fillRect(-46, 0, 92, 28);
    g.fillStyle = "#f4f1e8"; g.beginPath(); g.ellipse(0, 0, 46, 11, 0, 0, 6.283); g.fill();
    g.strokeStyle = "#c9ced4"; g.lineWidth = 3; g.stroke();
    g.beginPath(); g.ellipse(0, 28, 46, 11, 0, 0, Math.PI); g.stroke();
    g.restore();
    g.strokeStyle = "#9aa3ad"; g.lineWidth = 4; g.beginPath(); g.moveTo(SNARE[0], SNARE[1] + 40); g.lineTo(SNARE[0], PIES - 4); g.stroke();
    // timbal de suelo
    const vt = vib("tom", 50) * 3;
    g.save(); g.translate(TOM[0], TOM[1] + vt);
    const gtm = g.createLinearGradient(-50, 0, 50, 0);
    gtm.addColorStop(0, "#5a0a1c"); gtm.addColorStop(0.45, "#e2325a"); gtm.addColorStop(1, "#5a0a1c");
    g.fillStyle = gtm; g.fillRect(-50, 0, 100, 80);
    g.fillStyle = "#f4f1e8"; g.beginPath(); g.ellipse(0, 0, 50, 12, 0, 0, 6.283); g.fill();
    g.strokeStyle = "#c9ced4"; g.lineWidth = 3; g.stroke();
    g.beginPath(); g.ellipse(0, 80, 50, 12, 0, 0, Math.PI); g.stroke();
    g.restore();
    // bombo
    const vb = 1 + vib("bombo", 70) * 0.04;
    g.save(); g.translate(BOMBO[0], BOMBO[1]); g.scale(vb, vb);
    g.fillStyle = "#3a0610"; g.beginPath(); g.ellipse(0, 0, 84, 84, 0, 0, 6.283); g.fill();
    const gb = g.createRadialGradient(-20, -24, 10, 0, 0, 80);
    gb.addColorStop(0, "#fff8ec"); gb.addColorStop(1, "#d8ccb4");
    g.fillStyle = gb; g.beginPath(); g.arc(0, 0, 72, 0, 6.283); g.fill();
    g.strokeStyle = "#c9ced4"; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 76, 0, 6.283); g.stroke();
    g.fillStyle = "#e2325a"; estrella(g, 0, -6, 34, 15, 0); g.fill();
    txt(g, "LOS COLEGAS", 0, 46, { tam: 17, peso: 900, fam: FD, color: "#5a0a1c", esp: 2 });
    g.restore();
    // plato de choque
    const vp = vib("plato", 40) * 0.25;
    g.save(); g.translate(PLATO[0], PLATO[1]); g.rotate(-0.12 + vp);
    const gp = g.createLinearGradient(-62, 0, 62, 0);
    gp.addColorStop(0, "#8a5a10"); gp.addColorStop(0.5, "#ffe9a0"); gp.addColorStop(1, "#8a5a10");
    g.fillStyle = gp; g.beginPath(); g.ellipse(0, 0, 62, 11, 0, 0, 6.283); g.fill();
    g.fillStyle = "#c08a20"; g.beginPath(); g.ellipse(0, -2, 9, 3, 0, 0, 6.283); g.fill();
    g.restore();
  }
  microfono(g) {
    // pie
    g.strokeStyle = "#2b2e33"; g.lineWidth = 6; g.lineCap = "round";
    g.beginPath(); g.moveTo(410, PIES - 2); g.lineTo(410, 400); g.lineTo(MIC[0] + 6, MIC[1] + 12); g.stroke();
    g.beginPath(); g.moveTo(386, PIES); g.lineTo(410, PIES - 26); g.lineTo(434, PIES); g.stroke();
    // micro
    g.save(); g.translate(MIC[0], MIC[1]); g.rotate(-0.7);
    g.fillStyle = "#1a1c20"; rectR(g, -5, 6, 10, 26, 4); g.fill();
    const gm = g.createRadialGradient(-3, -3, 1, 0, 0, 11);
    gm.addColorStop(0, "#e9edf1"); gm.addColorStop(1, "#59616b");
    g.fillStyle = gm; g.beginPath(); g.ellipse(0, 0, 9, 11, 0, 0, 6.283); g.fill();
    g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 1;
    for (let i = -6; i <= 6; i += 4) { g.beginPath(); g.moveTo(-8, i); g.lineTo(8, i); g.stroke(); }
    g.restore();
  }
  ono(g, s, x, y, t0, dur, tam, color, rot) {
    const d = this.t - t0;
    if (d < 0 || d > dur) return;
    const k = eBack(tramo(d, 0, 0.1));
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
    txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color, borde: "#1a1a1a", bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
    g.restore();
  }
  dibujar(g) {
    // lo caro (textos con brillo, fondos) se prepara en el primer cuadro, que es negro
    if (!this._pre) { this._pre = true; titulo(); fondoEscenario(); }
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    g.drawImage(fondoEscenario(), -60, -60);
    const silencio = tramo(t, T_SIL, T_SIL + 0.4) * (1 - tramo(t, T_RISA, T_RISA + 0.2));
    // focos: Marcos y la batería
    foco(g, XM, XM, PIES, 150, 1 - 0.6 * silencio);
    foco(g, XG + 40, XG, PIES, 170, 0.6 - 0.45 * silencio);
    this.bateria(g, t, false);
    // sombras
    g.fillStyle = "rgba(0,0,0,.45)"; g.beginPath(); g.ellipse(XM, PIES + 2, 60, 9, 0, 0, 6.283); g.fill();
    pintarAvatar(g, e.mG, e.G, t);
    this.bateria(g, t, true);
    pintarAvatar(g, e.mM, e.M, t);
    this.microfono(g);
    // gota de sudor de Marcos en el silencio
    if (t > 6.0 && t < T_RISA) {
      const q = aPant(e.mM, [64, 30]), k = tramo(t, 6.0, 6.3), cae = tramo(t, 7.5, 8.0) * 40;
      g.save(); g.globalAlpha = k; g.translate(q[0] + 4, q[1] + cae);
      g.fillStyle = "#9fe3ff"; g.beginPath(); g.moveTo(0, -12); g.quadraticCurveTo(8, 2, 0, 6); g.quadraticCurveTo(-8, 2, 0, -12); g.fill();
      g.fillStyle = "rgba(255,255,255,.8)"; g.beginPath(); g.arc(-2, 1, 1.6, 0, 6.283); g.fill();
      g.restore();
    }
    // la bola de paja
    if (t > 6.3 && t < 7.9) {
      const x = this.xPaja(t), bote = Math.abs(Math.sin((t - 6.3) * 7)) * 34;
      g.save(); g.translate(x, PIES - 50 - bote); g.scale(1.7, 1.7); bolaPaja(g, 0, 0, -(t - 6.3) * 9); g.restore();
    }
    // grillos
    if (silencio > 0) {
      g.save(); g.globalAlpha = silencio;
      grillo(g, 500, 556, t, 2.3);
      g.restore();
      for (const [t0, x, y] of [[6.05, 540, 470], [6.75, 470, 450], [7.45, 560, 440]]) this.ono(g, "CRI, CRI…", x, y, t0, 0.65, 46, "#c8ff9a", -0.05);
    }
    // luz azul del silencio
    if (silencio > 0) { g.fillStyle = `rgba(10,20,60,${0.35 * silencio})`; g.fillRect(-60, -60, W + 120, H + 120); }
    this.p.dibujar(g);
    // TOC, TOC y acoples
    this.ono(g, "TOC", MIC[0] + 50, MIC[1] - 90, T_TOC, 0.3, 46, "#fffdf5", -0.1);
    this.ono(g, "TOC", MIC[0] + 90, MIC[1] - 130, T_TOC + 0.29, 0.35, 46, "#fffdf5", 0.1);
    // el chiste
    const kQ = tramo(t, T_Q, T_Q + 0.25) * (1 - tramo(t, T_R - 0.12, T_R));
    const bM = aPant(e.mM, boca(e.M.rc, "marcos"));
    if (kQ > 0) bocadillo(g, 480, 140, "¿QUÉ LE DICE UNA ACEITUNA A OTRA?", bM[0] + 16, bM[1] - 34, kQ, 38);
    const kR = tramo(t, T_R, T_R + 0.25) * (1 - tramo(t, T_BA - 0.12, T_BA));
    if (kR > 0) bocadillo(g, 480, 140, "¡NADA! ¡LAS ACEITUNAS NO HABLAN!", bM[0] + 16, bM[1] - 34, kR, 38);
    // BA · DUM · TSS
    this.ono(g, "¡BA!", SNARE[0] - 30, SNARE[1] - 70, T_BA, 0.5, 44, "#fffdf5", -0.12);
    this.ono(g, "¡DUM!", TOM[0] + 10, TOM[1] - 90, T_DUM, 0.5, 44, "#fffdf5", 0.08);
    this.ono(g, "¡TSS!", PLATO[0] + 10, PLATO[1] - 60, T_TSS, 0.5, 44, "#ffd34d", 0.1);
    // ¡JA JA JA!
    if (t > T_RISA) {
      const hM = aPant(e.mM, [37, 0]), hG = aPant(e.mG, [39, -6]);
      for (const [x, y, d0, r] of [[hM[0] - 110, hM[1] + 60, 0, -0.2], [hG[0] + 120, hG[1] + 50, 0.25, 0.2], [hM[0] + 120, hM[1] + 40, 0.5, 0.1]]) {
        const d = t - T_RISA - d0; if (d < 0) continue;
        const k = eBack(tramo(d, 0, 0.15)), al = 1 - tramo(t, T_APAGA - 0.3, T_APAGA);
        g.save(); g.translate(x, y - (d % 1.2) * 12); g.rotate(r + 0.05 * Math.sin(t * 9)); g.scale(k, k);
        txt(g, "¡JA JA!", 0, 0, { tam: 38, peso: 400, fam: FC, color: "#fffdf5", borde: "#1a1a1a", bordeAncho: 7, esp: 2, alfa: al });
        g.restore();
      }
    }
    // ¡BA DUM TSS! (con el platillo y en el remate)
    for (const [t0, t1] of [[T_TSS, T_SIL + 0.15], [T_TSS2, DUR]]) {
      if (t < t0 || t > t1) continue;
      const d = t - t0, k = tramo(d, 0, 0.15), s = lerp(2.4, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 8));
      const r = titulo(), al = Math.min(1, k * 3) * (1 - tramo(t, t1 - 0.2, t1));
      g.save(); g.globalAlpha = al; g.translate(512, 118); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00168", nombre: "El chiste malo", crear: () => new ChisteMalo() });
})();
