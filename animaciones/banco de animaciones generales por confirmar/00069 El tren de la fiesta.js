"use strict";
/*
 * 00069 · EL TREN DE LA FIESTA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Un pueblo de juguete. Entra a toda velocidad un tren de juguete (con llave de cuerda) y frena echando chispas:
 * Guillermo va de maquinista, con gorra de rayas, y los vagones van llenos de jarras. Tira de la cuerda del
 * silbato y la chimenea echa espuma en vez de humo: dos soplidos y uno enorme que escribe ¡CHUU CHUU! con letras
 * de espuma. Coge una jarra del vagón, brinda y el tren arranca y se va. Las letras se deshacen en burbujas.
 */
(() => {
const cache = cacheTexto();
const VIA = 522;                 // altura de los raíles
const LOCO = 380, VAGON = 170, HUECO = 12;
const PARA = 745;                // x del morro cuando está parado
const ESC = 1.05, PIE_CAB = 500;
const COLORES_VAGON = [["#2f9a4a", "#1d6a30"], ["#f2b51e", "#b67d00"], ["#2f6fd6", "#1c4a9a"]];

function spriteJarra() {
  const s = 1.9, c = lienzoNuevo(80, 92), g = c.getContext("2d");
  g.translate(16, 52); g.scale(s, s);
  dibujarJarra(g, [0, 0], 0, 1, "asa", 0); dibujarJarra(g, [0, 0], 0, 1, "cuerpo", 0);
  return c;
}

/** Gorra de maquinista de rayas; (0, 0) = cuello. */
function gorra(g, rc) {
  g.save(); g.translate(RIG.cuello[0], RIG.cuello[1]); g.rotate(rc);
  g.save(); g.beginPath(); g.moveTo(-31, -60); g.bezierCurveTo(-34, -92, 34, -96, 33, -60); g.closePath(); g.clip();
  g.fillStyle = "#2a4f9a"; g.fillRect(-40, -100, 80, 44);
  g.fillStyle = "#f4f2ec"; for (let x = -36; x < 40; x += 9) g.fillRect(x, -100, 4, 44);
  g.restore();
  g.fillStyle = "#1c3a7a"; rectR(g, -32, -64, 64, 9, 3); g.fill();
  g.fillStyle = "#132a5a"; g.beginPath(); g.ellipse(4, -56, 30, 6, 0, 0, Math.PI); g.fill();
  g.fillStyle = "#ffd34d"; g.beginPath(); g.arc(0, -84, 3, 0, 6.283); g.fill();
  g.restore();
}

class EscenaTren extends Escena {
  constructor() {
    super(9.8);
    this.p = new Parts(460);
    this.jarra = spriteJarra();
    this.fondoC = this.pintarFondo();
    this.bocanadas = [];
    this.burbujas = [];
  }
  pintarFondo() {
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    const gc = g.createLinearGradient(0, 0, 0, 470); gc.addColorStop(0, "#6fb6f2"); gc.addColorStop(1, "#d8f0ff");
    g.fillStyle = gc; g.fillRect(0, 0, W, H);
    // colinas de cartón
    for (const [y, col, A, f] of [[330, "#8fd06a", 50, 0.006], [380, "#5fb84a", 40, 0.009]]) {
      g.fillStyle = col; g.beginPath(); g.moveTo(0, H);
      for (let x = 0; x <= W; x += 16) g.lineTo(x, y - A * Math.abs(Math.sin(x * f + y)));
      g.lineTo(W, H); g.closePath(); g.fill();
      g.strokeStyle = "rgba(0,0,0,.12)"; g.lineWidth = 3; g.stroke();
    }
    // casitas de bloques
    for (const [x, col, tc] of [[110, "#f26a5a", "#b8312a"], [250, "#fff0c8", "#2f6fd6"], [640, "#ffd34d", "#d6202f"], [780, "#9ad0ff", "#2f9a4a"]]) {
      g.fillStyle = col; g.fillRect(x - 34, 330, 68, 70);
      g.fillStyle = tc; g.beginPath(); g.moveTo(x - 42, 332); g.lineTo(x, 292); g.lineTo(x + 42, 332); g.closePath(); g.fill();
      g.fillStyle = "#5a3a1a"; g.fillRect(x - 8, 368, 16, 32);
      g.fillStyle = "#bfe6ff"; g.fillRect(x - 26, 344, 14, 14); g.fillRect(x + 12, 344, 14, 14);
    }
    // árboles de juguete
    for (const x of [40, 180, 330, 600, 700, 880, 1000]) {
      g.fillStyle = "#8a5a2c"; g.fillRect(x - 5, 380, 10, 30);
      g.fillStyle = "#2f8a3e"; g.beginPath(); g.moveTo(x - 26, 386); g.lineTo(x, 316); g.lineTo(x + 26, 386); g.closePath(); g.fill();
      g.fillStyle = "rgba(255,255,255,.18)"; g.beginPath(); g.moveTo(x - 6, 336); g.lineTo(x, 320); g.lineTo(x + 3, 350); g.closePath(); g.fill();
    }
    // suelo y vía de madera
    const gs = g.createLinearGradient(0, 410, 0, H); gs.addColorStop(0, "#7ccc56"); gs.addColorStop(1, "#4a9a36");
    g.fillStyle = gs; g.fillRect(0, 410, W, H - 410);
    g.fillStyle = "#c9925a"; g.fillRect(0, VIA - 4, W, 26);
    g.fillStyle = "#a8743e"; for (let x = 0; x < W; x += 34) g.fillRect(x, VIA - 4, 20, 26);
    g.fillStyle = "#e6c08a"; g.fillRect(0, VIA - 4, W, 4);
    g.fillStyle = "#8a5a2c"; g.fillRect(0, VIA + 20, W, 4);
    g.fillStyle = "rgba(0,0,0,.15)"; g.fillRect(0, VIA + 24, W, 10);
    // cartel de la estación
    g.save(); g.translate(905, 300);
    g.fillStyle = "#6b4321"; g.fillRect(-4, 0, 8, 110);
    g.fillStyle = "#fff6dc"; rectR(g, -86, -34, 172, 44, 8); g.fill(); g.strokeStyle = "#d6202f"; g.lineWidth = 4; g.stroke();
    txt(g, "ESTACIÓN DEL BAR", 0, -4, { tam: 22, peso: 900, fam: FD, color: "#d6202f", esp: 2 });
    g.restore();
    return c;
  }
  X() {
    const t = this.t;
    if (t < 2.6) return lerp(-60, PARA, eOut(tramo(t, 0.15, 2.6)));
    if (t < 6.05) return PARA;
    return PARA + 1360 * eIn(tramo(t, 6.05, 9.05));
  }
  vel() { const d = 0.01; const t0 = this.t; this.t = t0 - d; const a = this.X(); this.t = t0; return (this.X() - a) / d; }
  estado() {
    const t = this.t, X = this.X(), v = this.vel();
    const pose = { cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [96, 130], manoI = [-6, 120 + 8 * Math.sin(t * 9)], giro = 0, jarra = false, angJ = 0;
    // frenazo: se va hacia delante
    if (t > 1.75 && t < 2.9) giro = 0.16 * Math.sin(Math.PI * tramo(t, 1.75, 2.9));
    if (t > 1.75 && t < 2.6) { pose.cara = "sorpresa"; manoD = [102, 112]; }
    if (t < 1.75) manoI = [-22, 40 + 10 * Math.sin(t * 12)]; // saluda al entrar
    // silbato: dos tirones cortos y uno largo
    const cuerda = [86, 22];
    const tiron = (a, b) => Math.sin(Math.PI * tramo(t, a, b));
    if (t > 2.75 && t < 3.95) {
      manoD = mezcla([96, 130], cuerda, eOut(tramo(t, 2.75, 2.9)));
      const k = Math.max(tiron(2.9, 3.15), tiron(3.25, 3.5), tiron(3.65, 3.95) * 1.6);
      manoD = [manoD[0], manoD[1] + 26 * k];
      pose.cara = t > 3.6 ? "guino" : "risa"; pose.rc = -0.1;
    }
    if (t >= 3.95 && t < 4.5) { manoD = mezcla([cuerda[0], cuerda[1]], [96, 130], eInOut(tramo(t, 3.95, 4.3))); pose.cara = "sorpresa"; pose.rc = -0.18; }
    // coge una jarra del vagón, brinda y se la lleva
    const coger = [39 + (this.jarraCogida(X)[0] - (X - 315)) / ESC, 232 + (this.jarraCogida(X)[1] - PIE_CAB) / ESC];
    const kV = eInOut(tramo(t, 4.6, 4.95)), kS = eBack(tramo(t, 5.05, 5.4));
    if (t > 4.6) { manoI = mezcla([-6, 120], coger, kV); pose.cara = "guino"; }
    if (t > 5.0) { jarra = true; manoI = mezcla(coger, [-26, 50], kS); pose.cara = t < 5.8 ? "risa" : "guino"; angJ = -0.1; }
    if (t > 6.05) { manoI = [-26, 50 + 12 * Math.sin(t * 8)]; pose.cara = "risa"; pose.rc = 0.06 * Math.sin(t * 6); }
    if (t > 6.05 && t < 7.0) giro = -0.1 * Math.sin(Math.PI * tramo(t, 6.05, 7.0)); // tirón al arrancar
    pose.manoD = manoD; pose.manoI = manoI;
    const rc = pose.rc;
    pose.objD = (g) => gorra(g, rc);
    if (jarra) { const a = angJ; pose.objI = (g, m) => { g.save(); g.translate(m[0], m[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], a, 1, "asa", t); dibujarJarra(g, [0, 0], a, 1, "cuerpo", t); g.restore(); }; }
    const m = matAv(X - 315, PIE_CAB, ESC, giro, 1, 1);
    return { pose, m, X, v, jarra };
  }
  jarraCogida(X) { return [X - LOCO - HUECO - 30, VIA - 70]; }
  /** Bote de las jarras de los vagones (frenazo, arranque, el gran soplido). */
  bote(i) {
    const t = this.t;
    let b = 0;
    if (t > 2.3 && t < 3.0) b = Math.abs(Math.sin((t - 2.3 - i * 0.03) * 14)) * 14 * (1 - tramo(t, 2.3, 3.0));
    if (t > 3.95 && t < 4.6) b = Math.max(b, Math.abs(Math.sin((t - 3.95 - i * 0.04) * 12)) * 22 * (1 - tramo(t, 3.95, 4.6)));
    if (t > 6.05 && t < 6.8) b = Math.max(b, Math.abs(Math.sin((t - 6.05 - i * 0.03) * 14)) * 10 * (1 - tramo(t, 6.05, 6.8)));
    return b;
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado(), X = e.X, v = Math.abs(e.v);
    const chim = [X - 70, 318];
    // bocanadas de espuma por la chimenea (más rápido cuanto más corre)
    const ritmo = 1.5 + v / 90;
    if (Math.random() < ritmo * dt) this.bocanada(chim, 0.6 + v / 1600);
    // chispas al frenar
    if (t > 1.7 && t < 2.6) for (let i = 0; i < 3; i++) for (const wx of [X - 120, X - 220, X - 300]) if (Math.random() < 0.4) p.nueva(P.CHISPA, wx, VIA, azar(-300, -60), azar(-260, -60), azar(0.2, 0.4), azar(6, 10));
    this.una("frena", t > 2.45, () => temblar(10, 0.3));
    // silbatos
    for (const [k, tt, s] of [[0, 3.0, 1.1], [1, 3.35, 1.25]]) this.una("chuu" + k, t > tt, () => { for (let i = 0; i < 4; i++) this.bocanada(chim, s); for (let i = 0; i < 12; i++) p.nueva(P.ESPUMA, chim[0], chim[1], azar(-120, 120), azar(-320, -120), azar(0.4, 0.8), azar(5, 10)); });
    this.una("grande", t > 3.85, () => {
      temblar(22, 0.6);
      for (let i = 0; i < 10; i++) this.bocanada(chim, azar(1.4, 2.2));
      for (let i = 0; i < 60; i++) { const a = azar(-Math.PI * 0.9, -Math.PI * 0.1), sp = azar(200, 700); p.nueva(P.ESPUMA, chim[0], chim[1], Math.cos(a) * sp, Math.sin(a) * sp, azar(0.6, 1.1), azar(6, 12)); }
      p.nueva(P.DESTELLO, chim[0], chim[1], 0, 0, 0.35, 160);
    });
    // las jarras de los vagones salpican cuando botan
    if (t > 3.95 && t < 4.3 && Math.random() < 30 * dt) { const q = this.posJarra(((Math.random() * 6) | 0)); if (q) p.nueva(P.ESPUMA, q[0] + 28, q[1] - 34, azar(-60, 60), azar(-220, -80), azar(0.4, 0.7), azar(3, 6)); }
    this.una("brindis", t > 5.4, () => { const q = aPant(e.m, [-26, 30]); p.nueva(P.DESTELLO, q[0] - 20, q[1], 0, 0, 0.35, 100); for (let i = 0; i < 12; i++) p.nueva(P.CHISPA, q[0] - 20, q[1], azar(-220, 220), azar(-280, 40), azar(0.3, 0.6), azar(6, 10)); });
    this.una("arranca", t > 6.1, () => temblar(8, 0.25));
    // las letras se deshacen en burbujas
    if (t > 8.2 && t < 9.2 && this.burbujas.length < 90) for (let i = 0; i < 3; i++) this.burbujas.push({ x: azar(170, 860), y: azar(80, 180), vy: azar(-90, -30), r: azar(5, 14), v: azar(0.8, 1.3), t0: t });
    for (const b of this.burbujas) { b.y += b.vy * dt; b.x += Math.sin(t * 3 + b.r) * 20 * dt; }
    this.burbujas = this.burbujas.filter((b) => t - b.t0 < b.v);
    for (const q of this.bocanadas) { q.x += q.vx * dt; q.y += q.vy * dt; q.vy *= 1 - 0.8 * dt; q.vx *= 1 - 0.8 * dt; q.r += q.cr * dt; q.vida -= dt; }
    this.bocanadas = this.bocanadas.filter((q) => q.vida > 0);
    p.actualizar(dt);
  }
  bocanada(c, s) {
    if (this.bocanadas.length > 60) return;
    this.bocanadas.push({ x: c[0] + azar(-6, 6), y: c[1] - 6, vx: azar(-90, -20), vy: azar(-160, -90) * s, r: 14 * s, cr: 22 * s, vida: azar(1.1, 1.6), max: 1.6 });
  }
  posJarra(k) { // k: 0–5, jarras de los dos primeros vagones
    const X = this.X(), w = (k / 3) | 0, j = k % 3;
    const x0 = X - LOCO - HUECO - (w + 1) * (VAGON + HUECO) + HUECO;
    return [x0 + 10 + j * 54, VIA - 40];
  }
  vagones(g, X, t, jarraFuera) {
    for (let w = 0; w < 3; w++) {
      const x1 = X - LOCO - HUECO - w * (VAGON + HUECO), x0 = x1 - VAGON;
      if (x1 < -40 || x0 > W + 40) continue;
      // enganche
      g.fillStyle = "#3a3f46"; g.fillRect(x1 - 2, VIA - 36, HUECO + 4, 6);
      // ruedas
      for (const wx of [x0 + 34, x1 - 34]) this.rueda(g, wx, VIA - 4, 16, X);
      // jarras dentro
      for (let j = 0; j < 3; j++) {
        if (w === 0 && j === 2 && jarraFuera) continue;
        const b = this.bote(w * 3 + j);
        g.drawImage(this.jarra, x0 + 4 + j * 54, VIA - 120 - b, 72, 83);
      }
      // caja del vagón
      const [c1, c2] = COLORES_VAGON[w];
      const gr = g.createLinearGradient(0, VIA - 70, 0, VIA - 18); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
      g.fillStyle = gr; rectR(g, x0, VIA - 70, VAGON, 52, 6); g.fill();
      g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 3; rectR(g, x0, VIA - 70, VAGON, 52, 6); g.stroke();
      g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(x0 + 6, VIA - 66, VAGON - 12, 5);
      g.fillStyle = "rgba(255,255,255,.85)"; for (const dx of [20, VAGON - 20]) { g.beginPath(); g.arc(x0 + dx, VIA - 44, 5, 0, 6.283); g.fill(); }
    }
  }
  rueda(g, x, y, r, X) {
    g.save(); g.translate(x, y); g.rotate(X / r);
    g.fillStyle = "#d6202f"; g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.fill();
    g.fillStyle = "#2a2a30"; g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.arc(0, 0, r - 4, 0, 6.283, true); g.fill();
    g.strokeStyle = "#ffd34d"; g.lineWidth = 3; g.beginPath(); for (let i = 0; i < 3; i++) { const a = (i * Math.PI) / 3; g.moveTo(Math.cos(a) * (r - 4), Math.sin(a) * (r - 4)); g.lineTo(-Math.cos(a) * (r - 4), -Math.sin(a) * (r - 4)); } g.stroke();
    g.fillStyle = "#ffd34d"; g.beginPath(); g.arc(0, 0, 4, 0, 6.283); g.fill();
    g.restore();
  }
  locomotora(g, X, t, delante) {
    if (!delante) {
      // parte de detrás del avatar: interior de la cabina
      g.fillStyle = "#4a0c14"; g.fillRect(X - 378, 252, 126, 250);
      g.fillStyle = "rgba(255,255,255,.08)"; g.fillRect(X - 378, 252, 126, 8);
      return;
    }
    // ruedas
    for (const [wx, r] of [[X - 300, 28], [X - 225, 28], [X - 120, 22], [X - 60, 22]]) this.rueda(g, wx, VIA - 10 - (28 - r) + 0, r, X);
    // biela
    const a = X / 28;
    g.strokeStyle = "#c9ced4"; g.lineWidth = 6; g.lineCap = "round";
    g.beginPath(); g.moveTo(X - 300 + Math.cos(a) * 14, VIA - 10 + Math.sin(a) * 14); g.lineTo(X - 225 + Math.cos(a) * 14, VIA - 10 + Math.sin(a) * 14); g.stroke();
    // chasis
    g.fillStyle = "#2a2a30"; g.fillRect(X - 386, VIA - 52, LOCO + 2, 16);
    // quitapiedras
    g.fillStyle = "#d6202f"; g.beginPath(); g.moveTo(X - 40, VIA - 40); g.lineTo(X + 4, VIA - 40); g.lineTo(X + 20, VIA - 4); g.lineTo(X - 40, VIA - 4); g.closePath(); g.fill();
    g.strokeStyle = "#8a1018"; g.lineWidth = 2; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(X - 30 + i * 12, VIA - 40); g.lineTo(X - 30 + i * 16, VIA - 4); g.stroke(); }
    // caldera
    const gc = g.createLinearGradient(0, 380, 0, 476); gc.addColorStop(0, "#ff5a5a"); gc.addColorStop(0.35, "#e8293b"); gc.addColorStop(1, "#8a1018");
    g.fillStyle = gc; rectR(g, X - 252, 384, 222, 92, 40); g.fill();
    g.fillStyle = "#ffd34d"; for (const bx of [X - 210, X - 150, X - 90]) g.fillRect(bx, 384, 10, 92);
    g.fillStyle = "#2a2a30"; g.beginPath(); g.ellipse(X - 30, 430, 12, 44, 0, 0, 6.283); g.fill();
    g.fillStyle = "#ffd34d"; g.beginPath(); g.arc(X - 28, 430, 9, 0, 6.283); g.fill();
    g.fillStyle = "#fff6c8"; g.beginPath(); g.arc(X - 28, 430, 5, 0, 6.283); g.fill();
    // cúpula y silbato
    g.fillStyle = "#ffd34d"; g.beginPath(); g.ellipse(X - 150, 384, 22, 18, 0, Math.PI, 0); g.fill();
    g.fillStyle = "#c9ced4"; g.fillRect(X - 236, 352, 10, 34); g.beginPath(); g.ellipse(X - 231, 352, 9, 5, 0, 0, 6.283); g.fill();
    // chimenea con espuma
    const gch = g.createLinearGradient(X - 92, 0, X - 48, 0); gch.addColorStop(0, "#1a1a20"); gch.addColorStop(0.5, "#4a4a55"); gch.addColorStop(1, "#1a1a20");
    g.fillStyle = gch; g.beginPath(); g.moveTo(X - 84, 388); g.lineTo(X - 56, 388); g.lineTo(X - 44, 322); g.lineTo(X - 96, 322); g.closePath(); g.fill();
    g.fillStyle = "#ffd34d"; g.fillRect(X - 100, 316, 60, 8);
    g.fillStyle = "#fffaf0"; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(X - 92 + i * 11, 314 - 3 * Math.sin(t * 8 + i), 8, 0, 6.283); g.fill(); }
    // llave de cuerda
    g.save(); g.translate(X - 190, 470); g.scale(Math.cos(t * 4), 1);
    g.fillStyle = "#c9ced4"; g.fillRect(-3, 0, 6, 18);
    g.beginPath(); g.ellipse(-12, 26, 11, 8, 0, 0, 6.283); g.ellipse(12, 26, 11, 8, 0, 0, 6.283); g.fill();
    g.fillStyle = "#e8edf2"; g.beginPath(); g.arc(-12, 26, 3, 0, 6.283); g.arc(12, 26, 3, 0, 6.283); g.fill();
    g.restore();
    // cabina (por delante de sus piernas)
    const gk = g.createLinearGradient(X - 380, 0, X - 250, 0); gk.addColorStop(0, "#1f4fa8"); gk.addColorStop(1, "#2f6fd6");
    g.fillStyle = gk; rectR(g, X - 384, 432, 136, 72, 6); g.fill();
    g.fillStyle = "#ffd34d"; g.fillRect(X - 384, 432, 136, 7);
    txt(g, "FIESTA", X - 316, 486, { tam: 26, peso: 900, fam: FD, color: "#fff6dc", esp: 3 });
    // postes y techo
    g.fillStyle = "#1c3a7a"; g.fillRect(X - 384, 244, 10, 192); g.fillRect(X - 258, 244, 10, 192);
    g.fillStyle = "#d6202f"; rectR(g, X - 398, 226, 164, 22, 8); g.fill();
    g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(X - 390, 230, 148, 4);
    // cuerda del silbato
    g.strokeStyle = "#f2e6c8"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(X - 231, 352); g.lineTo(X - 262, 250); g.stroke();
  }
  letras(g, t) {
    if (t < 3.9 || t > 9.3) return;
    const spr = this.rotulo();
    const k = tramo(t, 3.9, 4.35), s = lerp(0.15, 1, eBack(k)) * (1 + 0.03 * Math.sin(t * 5));
    const ch = [this.X() - 70, 310];
    const x = lerp(ch[0], W / 2, eOut(k)), y = lerp(ch[1], 120, eOut(k)) + 6 * Math.sin(t * 2.4);
    const a = Math.min(1, k * 3) * (1 - tramo(t, 8.4, 9.2));
    if (a <= 0) return;
    g.save(); g.translate(x, y); g.rotate(-0.04 + 0.02 * Math.sin(t * 1.7)); g.scale(s, s); g.globalAlpha = a;
    g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), X = e.X;
    fondo(g, "#000");
    g.drawImage(this.fondoC, 0, 0);
    this.vagones(g, X, t, e.jarra);
    this.locomotora(g, X, t, false);
    pintarAvatar(g, e.m, e.pose, t);
    this.locomotora(g, X, t, true);
    // bocanadas de espuma
    for (const q of this.bocanadas) {
      const a = Math.min(1, q.vida * 2);
      g.globalAlpha = a; g.drawImage(SPR.espuma, q.x - q.r, q.y - q.r, q.r * 2, q.r * 2);
      g.drawImage(SPR.espuma, q.x - q.r * 0.2, q.y - q.r * 0.9, q.r * 1.3, q.r * 1.3);
    }
    g.globalAlpha = 1;
    this.p.dibujar(g);
    this.letras(g, t);
    // burbujas de las letras
    g.save(); g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 2.5;
    for (const b of this.burbujas) { const k = (t - b.t0) / b.v; g.globalAlpha = 1 - k; g.beginPath(); g.arc(b.x, b.y, b.r, 0, 6.283); g.stroke(); g.fillStyle = "rgba(255,255,255,.5)"; g.beginPath(); g.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.25, 0, 6.283); g.fill(); }
    g.restore();
    const negro = Math.max(1 - tramo(t, 0.02, 0.35), tramo(t, 9.3, 9.75));
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  rotulo() {
    if (cache.has("chuu")) return cache.get("chuu");
    const c = lienzoNuevo(860, 200), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 170);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.7, "#fff6dc"); gr.addColorStop(1, "#ead9b0");
    txt(g, "¡CHUU CHUU!", 430, 148, { tam: 128, peso: 400, fam: FB, color: "#c9a86a", esp: 4, max: 820 });
    txt(g, "¡CHUU CHUU!", 426, 142, { tam: 128, peso: 400, fam: FB, color: gr, borde: "#ffffff", bordeAncho: 10, esp: 4, max: 820, glow: "rgba(120,80,20,.5)", glowTam: 14 });
    // burbujitas en las letras
    const r = semilla(4);
    g.save(); g.globalCompositeOperation = "source-atop";
    for (let i = 0; i < 60; i++) { g.strokeStyle = "rgba(200,170,110,.6)"; g.lineWidth = 1.5; g.beginPath(); g.arc(30 + r() * 800, 40 + r() * 120, 2 + r() * 5, 0, 6.283); g.stroke(); }
    g.restore();
    cache.set("chuu", c);
    return c;
  }
}

registrar({ id: "00069", nombre: "El tren de la fiesta", crear: () => new EscenaTren() });
})();
