"use strict";
/*
 * 00194 · CAVERNÍCOLAS
 *
 * Animación del banco. Empieza y acaba en negro.
 * En la prehistoria (cueva, volcán, helechos), Guillermo y Marcos con pieles sencillas y garrotes de hueso. Guillermo
 * golpea muy serio algo tapado con una piel (¡TOC!), tiene una idea y lo destapa: ¡LA RUEDA! Marcos se acerca, da
 * unos golpecitos, olisquea… es un barril. Se sube de un salto y se va rodando encima, saludando. Guillermo se queda
 * de piedra, sale detrás… y vuelven a pasar los dos subidos en el barril, corriendo encima. Fundido a negro.
 */
(() => {
const cache = cacheTexto();
const ESC = 1.4, R = 66, BX0 = 560, BY = PIES - R;
const XG = 430, XM0 = 790, XM1 = 662;
const T_TOC = [0.65, 1.05, 1.45], T_IDEA = 1.85, T_DESTAPA = 2.3, T_TXT = 2.55, T_MIRA = 3.25, T_SUBE = 4.15, T_RUEDA = 4.75;
const T_VA = 5.15, T_PERSIGUE = 6.3, T_VUELVEN = 7.55;

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(800, 210), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 170);
  gr.addColorStop(0, "#fff4d0"); gr.addColorStop(0.5, "#e8b860"); gr.addColorStop(1, "#9a5a1a");
  txt(g, "¡LA RUEDA!", 406, 164, { tam: 146, peso: 900, fam: FD, color: "#2a1606", esp: 6 });
  txt(g, "¡LA RUEDA!", 400, 156, { tam: 146, peso: 900, fam: FD, color: gr, borde: "#2a1606", bordeAncho: 12, esp: 6, glow: "rgba(255,200,120,.75)", glowTam: 22 });
  cache.set("t", c);
  return c;
}
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

/** Piel de un hombro (coordenadas de avatar). */
function piel(g, Rg, col, osc) {
  const hD = Rg.hombroD, hI = Rg.hombroI2, cI = Rg.caderaI, cD = Rg.caderaD;
  const y1 = cI[1] + 26;
  g.save();
  g.beginPath();
  g.moveTo(hD[0] - 12, hD[1] - 8); g.lineTo(hD[0] + 5, hD[1] - 3); g.lineTo(hD[0] + 6, hD[1] + 18);
  g.lineTo(cD[0] + 21, y1 - 6);
  const n = 9;
  for (let i = 0; i <= n; i++) { const x = lerp(cD[0] + 21, cI[0] - 19, i / n); g.lineTo(x, y1 + (i % 2 ? 9 : 0)); }
  g.lineTo(hI[0] - 2, hI[1] + 30); g.lineTo(hI[0] + 10, hI[1] + 22);
  g.closePath();
  const gr = g.createLinearGradient(hI[0], 0, hD[0], 0);
  gr.addColorStop(0, osc); gr.addColorStop(0.5, col); gr.addColorStop(1, osc);
  g.fillStyle = gr; g.fill();
  g.strokeStyle = osc; g.lineWidth = 1.2; g.stroke();
  // pelo de la piel
  g.strokeStyle = "rgba(40,20,5,.35)"; g.lineWidth = 1;
  for (let i = 0; i < 14; i++) { const x = lerp(hI[0] + 6, hD[0] - 2, (i * 7 % 13) / 13), y = lerp(hD[1] + 16, y1 - 4, (i * 5 % 11) / 11); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y + 5); g.stroke(); }
  g.restore();
}
/** Garrote de hueso; (0,0) = la mano, apunta con `ang`. */
function hueso(g, ang, largo = 64) {
  g.save(); g.rotate(ang);
  const L = largo;
  g.fillStyle = "#efe6cc"; g.strokeStyle = "#8a7a56"; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(-10, -4); g.lineTo(L - 12, -6); g.lineTo(L - 12, 6); g.lineTo(-10, 4); g.closePath(); g.fill(); g.stroke();
  for (const [x, r] of [[-14, 7], [L - 6, 10]]) {
    for (const s of [-1, 1]) { g.beginPath(); g.arc(x, s * r * 0.6, r, 0, 6.283); g.fill(); g.stroke(); }
  }
  g.fillStyle = "#efe6cc"; g.fillRect(-14, -4, 6, 8); g.fillRect(L - 14, -6, 8, 12);
  g.fillStyle = "rgba(255,255,255,.6)"; g.fillRect(0, -3, L - 20, 2);
  g.restore();
}
/** El barril visto de frente (como una rueda); gira `ang`. Se pinta una vez en un lienzo (a 2×) y se copia girado. */
let SPR_BARRIL = null;
function barril(g, x, y, ang) {
  if (!SPR_BARRIL) {
    const S = 2, L = R * 2 + 8, c = lienzoNuevo(L * S, L * S), q = c.getContext("2d");
    q.scale(S, S); q.translate(L / 2, L / 2); barrilTapa(q);
    SPR_BARRIL = { c, L };
  }
  g.save(); g.translate(x, y);
  g.fillStyle = "rgba(40,20,0,.25)"; g.beginPath(); g.ellipse(0, R - 2, R * 0.9, 10, 0, 0, 6.283); g.fill();
  g.rotate(ang);
  g.drawImage(SPR_BARRIL.c, -SPR_BARRIL.L / 2, -SPR_BARRIL.L / 2, SPR_BARRIL.L, SPR_BARRIL.L);
  g.restore();
}
function barrilTapa(g) {
  g.save();
  // aro exterior
  g.fillStyle = "#4a4a52"; g.beginPath(); g.arc(0, 0, R, 0, 6.283); g.fill();
  g.fillStyle = "#6a3a14"; g.beginPath(); g.arc(0, 0, R - 9, 0, 6.283); g.fill();
  // tablas de la tapa
  g.save(); g.beginPath(); g.arc(0, 0, R - 14, 0, 6.283); g.clip();
  for (let i = -3; i <= 3; i++) {
    const gr = g.createLinearGradient(i * 18 - 9, 0, i * 18 + 9, 0);
    gr.addColorStop(0, "#9a5e2a"); gr.addColorStop(0.5, "#c8884a"); gr.addColorStop(1, "#8a5020");
    g.fillStyle = gr; g.fillRect(i * 18 - 9, -R, 18, R * 2);
    g.fillStyle = "rgba(60,30,8,.6)"; g.fillRect(i * 18 + 8, -R, 2, R * 2);
  }
  g.restore();
  g.strokeStyle = "#3a3a42"; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, R - 12, 0, 6.283); g.stroke();
  g.strokeStyle = "rgba(255,255,255,.25)"; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, R - 3, 3.6, 4.8); g.stroke();
  // remaches
  g.fillStyle = "#8a8a92";
  for (let i = 0; i < 10; i++) { const a = (i / 10) * 6.283; g.beginPath(); g.arc(Math.cos(a) * (R - 4.5), Math.sin(a) * (R - 4.5), 2.4, 0, 6.283); g.fill(); }
  // grifo y tapón
  g.fillStyle = "#c9962a"; rectR(g, -6, 24, 12, 18, 3); g.fill();
  g.fillStyle = "#e0b040"; rectR(g, -11, 21, 22, 7, 3); g.fill();
  g.fillStyle = "#3a1a06"; g.beginPath(); g.arc(0, -32, 6.5, 0, 6.283); g.fill();
  g.fillStyle = "#7a4a1a"; g.beginPath(); g.arc(0, -32, 4.5, 0, 6.283); g.fill();
  g.restore();
}
/** Piel que tapa el barril; k: 0 puesta, 1 arrancada. */
function manta(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.beginPath();
  g.moveTo(-R - 18, R + 2);
  g.bezierCurveTo(-R - 26, -R * 0.4, -R * 0.6, -R - 22, 0, -R - 20);
  g.bezierCurveTo(R * 0.6, -R - 22, R + 26, -R * 0.4, R + 18, R + 2);
  for (let i = 0; i <= 10; i++) { const xx = R + 18 - (i * (2 * R + 36)) / 10; g.lineTo(xx, R + 2 + (i % 2 ? 10 : 0)); }
  g.closePath();
  const gr = g.createRadialGradient(-30, -60, 20, 0, 0, R + 40);
  gr.addColorStop(0, "#a8784a"); gr.addColorStop(1, "#5a3a1e");
  g.fillStyle = gr; g.fill();
  g.strokeStyle = "#3a2410"; g.lineWidth = 2; g.stroke();
  g.strokeStyle = "rgba(40,20,5,.35)"; g.lineWidth = 1.5;
  for (let i = 0; i < 20; i++) { const a = (i / 20) * 6.283, rr = 30 + (i * 37 % 50); g.beginPath(); g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr * 0.9); g.lineTo(Math.cos(a) * rr + 3, Math.sin(a) * rr * 0.9 + 7); g.stroke(); }
  g.restore();
}

class Cavernicolas extends Escena {
  constructor() {
    super(10);
    this.p = new Parts(380);
    this.p.suelo = () => PIES;
    this.fondoC = null;
  }
  barrilPos() {
    const t = this.t;
    if (t < T_VA) {
      const bal = t > T_TXT && t < T_SUBE ? 4 * Math.sin((t - T_TXT) * 4) * Math.exp(-(t - T_TXT) * 1.2) : 0;
      return { x: BX0 + bal, ang: bal / R };
    }
    if (t < T_VUELVEN) { const x = BX0 + 760 * eIn(tramo(t, T_VA, T_VA + 1.5)); return { x, ang: (x - BX0) / R }; }
    const x = lerp(1320, -360, tramo(t, T_VUELVEN, T_VUELVEN + 1.9));
    return { x, ang: (x - BX0) / R };
  }
  mantaPos() {
    const t = this.t;
    if (t < T_DESTAPA) return { x: BX0, y: BY, ang: 0, k: 0 };
    const u = tramo(t, T_DESTAPA, T_DESTAPA + 0.7);
    return { x: lerp(BX0, 150, u), y: lerp(BY, PIES - 30, u) - 260 * Math.sin(u * Math.PI), ang: -2.4 * u, k: u, s: lerp(1, 0.6, u) };
  }
  poses() {
    const t = this.t, B = this.barrilPos();
    const G = { cara: "dormido", rc: 0.08, piernaI: [0, 0], piernaD: [0, 0], manoD: [80, 120], manoI: [9, 160] };
    const M = { quien: "marcos", cara: "sonrisa", rc: -0.08, piernaI: [0, 0], piernaD: [0, 0], manoD: [80, 100], manoI: [6, 152] };
    let xg = XG, yg = PIES, xm = XM0, ym = PIES, gg = 0, gm = 0;
    let huesoG = { ang: -0.6 }, huesoM = { ang: -1.15, mano: "D" };
    // Guillermo da golpes muy serio
    if (t < T_IDEA) {
      let golpe = 0;
      for (const tt of T_TOC) golpe = Math.max(golpe, 1 - Math.abs(t - tt) / 0.2);
      const sube = Math.max(0, Math.sin((t - 0.25) * Math.PI / 0.4));
      G.manoD = mezcla([84, 70], [96, 116], clamp(golpe, 0, 1));
      huesoG.ang = lerp(-1.2, 0.35, clamp(golpe, 0, 1));
      void sube;
      M.cara = t > T_TOC[0] ? "sorpresa" : "sonrisa"; M.rc = -0.15;
    }
    // tiene una idea
    if (t >= T_IDEA && t < T_DESTAPA) { G.cara = "guino"; G.rc = -0.1; G.manoD = [84, 110]; huesoG = null; G.manoI = [-10, 80]; }
    // tira de la piel
    if (t >= T_DESTAPA) {
      huesoG = null;
      const k = eOut(tramo(t, T_DESTAPA - 0.15, T_DESTAPA + 0.05)), k2 = eOut(tramo(t, T_DESTAPA + 0.05, T_DESTAPA + 0.3));
      G.manoD = mezcla(mezcla([84, 110], [102, 60], k), [40, 20], k2);
      G.cara = "risa";
    }
    // ¡LA RUEDA!: la presenta orgulloso
    if (t >= T_TXT) {
      const k = eOut(tramo(t, T_TXT, T_TXT + 0.25));
      G.manoD = mezcla([40, 20], [108, 92], k); G.manoI = mezcla([9, 160], [-30, 92], k);
      G.cara = "risa"; G.rc = 0.04 * Math.sin(t * 6);
      M.cara = "sorpresa";
    }
    // Marcos se acerca, golpea el barril y lo olisquea
    if (t >= T_MIRA - 0.4 && t < T_SUBE) {
      const k = eInOut(tramo(t, T_MIRA - 0.4, T_MIRA));
      xm = lerp(XM0, XM1, k);
      if (k > 0 && k < 1) { const a = andar(t * 10, 0.8); M.piernaI = a.piernaI; M.piernaD = a.piernaD; }
      if (t > T_MIRA) {
        const toc = Math.max(0, Math.sin((t - T_MIRA) * Math.PI * 5)) * (t < T_MIRA + 0.4 ? 1 : 0);
        M.manoI = enAv(matAv(xm, ym, ESC), [B.x + R * 0.72 + 8 * toc, BY - R * 0.72]); M.brazoIDelante = true;
        M.cara = t < T_MIRA + 0.45 ? "sorpresa" : "guino"; M.rc = t > T_MIRA + 0.45 ? 0.18 + 0.06 * Math.sin(t * 20) : 0;
      }
      G.cara = t > T_MIRA ? "sonrisa" : G.cara;
    }
    // Marcos salta encima del barril
    if (t >= T_SUBE) {
      const u = tramo(t, T_SUBE, T_RUEDA);
      xm = lerp(XM1, B.x, eInOut(u)); ym = lerp(PIES, BY - R + 12, u) - 120 * Math.sin(u * Math.PI);
      M.piernaI = [-12 * Math.sin(u * Math.PI), 0.3]; M.piernaD = [-12 * Math.sin(u * Math.PI), -0.3];
      M.manoD = [78, 40]; M.manoI = [-4, 40]; M.cara = "risa"; huesoM = null;
      if (u >= 1) {
        // en equilibrio y luego corriendo encima mientras rueda
        xm = B.x; ym = BY - R + 12;
        const corre = t > T_VA;
        const a = andar(t * (corre ? 20 : 8), corre ? 1.3 : 0.6);
        M.piernaI = a.piernaI; M.piernaD = a.piernaD; ym += a.bote * 0.3;
        M.manoD = [84 + 6 * Math.sin(t * 9), 80]; M.manoI = [-10 - 6 * Math.sin(t * 9), 80];
        gm = 0.1 * Math.sin(t * 7) * (corre ? 0.5 : 1);
        if (t > T_VA - 0.25 && t < T_VA + 0.8) { M.manoD = [72 + 10 * Math.sin(t * 22), 36]; M.cara = "guino"; }
      }
      G.cara = t > T_RUEDA ? "sorpresa" : "sonrisa"; G.rc = t > T_RUEDA ? 0.16 : 0;
      if (t > T_VA) { const k = eOut(tramo(t, T_VA, T_VA + 0.25)); G.manoD = mezcla([108, 92], [86, 30], k); G.manoI = mezcla([-30, 92], [-8, 30], k); G.puntas = k; }
    }
    // Guillermo sale detrás
    if (t >= T_PERSIGUE && t < T_VUELVEN) {
      xg = lerp(XG, 1250, eIn(tramo(t, T_PERSIGUE, T_PERSIGUE + 0.25)) * 0.12 + tramo(t, T_PERSIGUE, T_PERSIGUE + 1.0) * 0.88);
      const a = andar(t * 22, 1.6); G.piernaI = a.piernaI; G.piernaD = a.piernaD; yg += a.bote;
      G.manoD = [86 + 8 * Math.sin(t * 22), 70]; G.manoI = [-8 - 8 * Math.sin(t * 22), 70]; G.cara = "sorpresa"; G.puntas = 0.6; gg = -0.1;
    }
    // vuelven los dos encima del barril
    if (t >= T_VUELVEN) {
      const a = andar(t * 20, 1.2), b = andar(t * 20 + 1.6, 1.2);
      const dx = 46, alto = Math.sqrt(R * R - dx * dx);
      xg = B.x - dx; xm = B.x + dx; yg = BY - alto + 12 + a.bote * 0.3; ym = BY - alto + 12 + b.bote * 0.3;
      G.piernaI = a.piernaI; G.piernaD = a.piernaD; M.piernaI = b.piernaI; M.piernaD = b.piernaD;
      G.manoD = [96, 60]; G.manoI = [-18, 80]; M.manoD = [84, 80]; M.manoI = [-10, 60];
      G.cara = "risa"; M.cara = "risa"; G.puntas = 0; G.rc = 0.06 * Math.sin(t * 10); M.rc = -0.06 * Math.sin(t * 10);
      gg = -0.12 + 0.06 * Math.sin(t * 6); gm = 0.12 - 0.06 * Math.sin(t * 6 + 1);
    }
    const mG = matAv(xg, yg, ESC, gg), mM = matAv(xm, ym, ESC, gm);
    // pieles y garrotes
    const RG = avatar().rig, RM = avatar("marcos").rig;
    G.objD = (g) => piel(g, RG, "#9a7452", "#5a3e24");
    M.objD = (g) => piel(g, RM, "#c89a5c", "#7a5a2e");
    if (huesoG) { const hg = huesoG; G.objD2 = (g, mano) => { g.save(); g.translate(mano[0], mano[1]); hueso(g, hg.ang); g.restore(); }; }
    if (huesoM) { const hm = huesoM; M.objD2 = (g, mano) => { g.save(); g.translate(mano[0], mano[1]); hueso(g, hm.ang, 58); g.restore(); }; }
    return { G, M, mG, mM, B };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    T_TOC.forEach((tt, i) => this.una("toc" + i, t > tt, () => {
      temblar(5, 0.12);
      for (let j = 0; j < 8; j++) p.nueva(P.POLVO, BX0 - 10 + azar(-20, 20), BY - R - 14, azar(-120, 120), azar(-120, -20), azar(0.4, 0.8), azar(14, 24));
    }));
    this.una("idea", t > T_IDEA, () => { for (let i = 0; i < 12; i++) { const a = azar(0, 6.283); p.nueva(P.PURPURINA, XG, PIES - 380, Math.cos(a) * 160, Math.sin(a) * 160, azar(0.5, 0.9), azar(8, 12)); } });
    this.una("destapa", t > T_DESTAPA, () => { for (let i = 0; i < 18; i++) p.nueva(P.POLVO, BX0 + azar(-90, 90), BY + azar(-60, 60), azar(-160, 60), azar(-100, 20), azar(0.5, 0.9), azar(20, 34)); });
    this.una("txt", t > T_TXT, () => {
      temblar(10, 0.3);
      p.nueva(P.DESTELLO, BX0, BY, 0, 0, 0.4, 300);
      for (let i = 0; i < 40; i++) { const a = azar(0, 6.283), v = azar(140, 420); p.nueva(P.PURPURINA, BX0, BY, Math.cos(a) * v, Math.sin(a) * v, azar(0.8, 1.4), azar(10, 16)); }
    });
    this.una("cae", t > T_DESTAPA + 0.7, () => { for (let i = 0; i < 12; i++) p.nueva(P.POLVO, 150 + azar(-60, 60), PIES - 10, azar(-120, 120), azar(-60, -5), azar(0.5, 0.9), azar(24, 40)); });
    for (const k of [0, 1]) this.una("knock" + k, t > T_MIRA + 0.1 + k * 0.2, () => temblar(3, 0.08));
    this.una("chorrito", t > T_MIRA + 0.45, () => { for (let i = 0; i < 18; i++) p.nueva(P.ESPUMA, BX0, BY - 32, azar(-50, 50), azar(-340, -160), azar(0.5, 0.8), azar(4, 8)); });
    this.una("aterriza", t > T_RUEDA, () => { temblar(8, 0.2); });
    const B = this.barrilPos();
    if ((t > T_VA && t < T_VA + 1.6) || (t > T_VUELVEN && t < T_VUELVEN + 1.9)) {
      if (Math.random() < 30 * dt && B.x > -60 && B.x < W + 60) p.nueva(P.POLVO, B.x + azar(-30, 30), PIES - 4, (t > T_VUELVEN ? 1 : -1) * azar(40, 160), azar(-60, -10), azar(0.5, 0.9), azar(24, 40));
    }
    if (t > T_PERSIGUE && t < T_PERSIGUE + 1.0 && Math.random() < 20 * dt) p.nueva(P.POLVO, lerp(XG, 1250, tramo(t, T_PERSIGUE, T_PERSIGUE + 1)) - 20, PIES - 4, azar(-120, -40), azar(-40, -5), azar(0.4, 0.8), azar(20, 30));
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, 470);
    gc.addColorStop(0, "#ff9a5a"); gc.addColorStop(0.6, "#ffd08a"); gc.addColorStop(1, "#fff0c0");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, H + 120);
    // volcán y montañas
    g.fillStyle = "#b07a6a"; g.beginPath(); g.moveTo(300, 470); g.lineTo(520, 150); g.lineTo(600, 150); g.lineTo(840, 470); g.closePath(); g.fill();
    g.fillStyle = "#ff6a2a"; g.beginPath(); g.moveTo(520, 150); g.lineTo(600, 150); g.lineTo(585, 196); g.lineTo(562, 170); g.lineTo(540, 200); g.closePath(); g.fill();
    g.fillStyle = "rgba(140,100,100,.55)"; for (const [x, y, r] of [[560, 120, 30], [585, 80, 38], [550, 36, 44]]) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
    g.fillStyle = "#8a6a5a"; g.beginPath(); g.moveTo(600, 470); g.lineTo(820, 250); g.lineTo(1100, 470); g.closePath(); g.fill();
    // pared de roca con la cueva a la izquierda
    g.fillStyle = "#7a6a5a";
    g.beginPath(); g.moveTo(-60, 480); g.lineTo(-60, 120); g.quadraticCurveTo(80, 90, 200, 160); g.quadraticCurveTo(270, 260, 260, 480); g.closePath(); g.fill();
    g.fillStyle = "#1e140c"; g.beginPath(); g.moveTo(40, 480); g.quadraticCurveTo(40, 300, 120, 290); g.quadraticCurveTo(200, 300, 200, 480); g.closePath(); g.fill();
    g.strokeStyle = "rgba(40,30,20,.4)"; g.lineWidth = 3;
    for (const [x, y] of [[0, 200], [210, 220], [-20, 380], [230, 400]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 30, y + 14); g.stroke(); }
    // dibujos en la pared: una jarra y un sol
    g.strokeStyle = "#c8442a"; g.lineWidth = 4;
    g.strokeRect(222, 230, 22, 28); g.beginPath(); g.arc(246, 244, 7, -1.4, 1.4); g.stroke();
    // suelo
    const gs = g.createLinearGradient(0, 470, 0, H);
    gs.addColorStop(0, "#b8905a"); gs.addColorStop(1, "#8a6236");
    g.fillStyle = gs; g.fillRect(-60, 474, W + 120, H);
    g.fillStyle = "#6a8a3a"; g.fillRect(-60, 470, W + 120, 8);
    const r = semilla(8);
    for (let i = 0; i < 16; i++) { const x = r() * W, y = 500 + r() * 90, rr = 4 + r() * 10; g.fillStyle = "#7a6a5a"; g.beginPath(); g.ellipse(x, y, rr, rr * 0.6, 0, Math.PI, 0); g.fill(); }
    // helechos y palmera
    for (const [x, s] of [[960, 1.1], [300, 0.7]]) {
      g.save(); g.translate(x, 478); g.scale(s, s);
      for (let i = 0; i < 7; i++) { g.save(); g.rotate((i - 3) * 0.33); g.fillStyle = i % 2 ? "#3a7a32" : "#4a9a3c"; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-24, -70, 0, -140); g.quadraticCurveTo(24, -70, 0, 0); g.fill(); g.restore(); }
      g.restore();
    }
    this.fondoC = c;
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses(), B = e.B, Mt = this.mantaPos();
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    // garrote de Guillermo tirado en el suelo tras destapar
    if (t >= T_IDEA && t < T_PERSIGUE + 0.1) { g.save(); g.translate(XG + 70, PIES - 6); g.scale(ESC, ESC); hueso(g, -0.08); g.restore(); }
    if (B.x > -200 && B.x < W + 200) barril(g, B.x, BY, B.ang);
    if (Mt.k < 1) { g.save(); g.translate(Mt.x, Mt.y); g.scale(Mt.s || 1, Mt.s || 1); manta(g, 0, 0, Mt.ang); g.restore(); }
    else { g.save(); g.translate(150, PIES - 14); g.scale(0.6, 0.25); manta(g, 0, 0, 0); g.restore(); }
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    this.p.dibujar(g);
    // ¡TOC!
    T_TOC.forEach((tt) => {
      if (t > tt && t < tt + 0.35) {
        const k = tramo(t, tt, tt + 0.1), a = 1 - tramo(t, tt + 0.2, tt + 0.35);
        txt(g, "¡TOC!", BX0 + 30, BY - R - 60, { tam: 56 * eBack(k), peso: 400, fam: FC, color: "#fff3c0", borde: "#3a1a00", bordeAncho: 8, alfa: a, esp: 2 });
      }
    });
    // idea: estrellita sobre la cabeza
    if (t > T_IDEA && t < T_DESTAPA + 0.1) {
      const q = aPant(e.mG, [39, -40]);
      brillo(g, q[0], q[1] - 10, 40 * eBack(tramo(t, T_IDEA, T_IDEA + 0.2)), 1);
      txt(g, "!", q[0] + 34, q[1] + 6, { tam: 60, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a1a00", bordeAncho: 7 });
    }
    // toc toc de Marcos
    if (t > T_MIRA + 0.05 && t < T_MIRA + 0.6) txt(g, "toc, toc", B.x + 150, BY - 40, { tam: 34, peso: 400, fam: FC, color: "#fff3c0", borde: "#3a1a00", bordeAncho: 6, alfa: 1 - tramo(t, T_MIRA + 0.45, T_MIRA + 0.6) });
    // ¡LA RUEDA!
    if (t > T_TXT) {
      const d = t - T_TXT, k = tramo(d, 0, 0.2), s = lerp(2.4, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 6));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(560, 70 + 4 * Math.sin(d * 2)); g.rotate(-0.035); g.scale(s * 0.8, s * 0.8);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.45), tramo(t, 9.45, this.dur - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00194", nombre: "Cavernícolas", crear: () => new Cavernicolas() });
})();
