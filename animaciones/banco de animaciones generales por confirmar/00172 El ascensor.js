"use strict";
/*
 * 00172 · EL ASCENSOR
 *
 * Animación del banco. Empieza y acaba en negro.
 * Dentro de un ascensor, con música de espera (notitas que salen del altavoz), Guillermo y Marcos suben tiesos
 * mirando el contador de plantas. Silencio incómodo: se miran de reojo, se pillan y apartan la vista, Marcos silba,
 * Guillermo mira un reloj que no tiene… ¡CLONC!: un frenazo y se abrazan del susto; se sueltan (EJEM). ¡DING!
 * Planta 10: se abren las puertas a una fiesta con luces de colores y la cartela del TOP 10, y salen bailando:
 * ¡PLANTA 10!
 */
(() => {
const CT = cacheTexto();
const T_P1 = 0.5, T_P10 = 5.6, T_CLONC = 4.45, T_CORTE = 5.9, T_ABRE = 6.55, T_TIT = 7.05, T_SALEN = 7.4, T_APAGA = 10.0, DUR = 10.6;
const RG = avatar().rig, RM = avatar("marcos").rig;
const COLORES = ["255,61,132", "47,227,232", "43,255,91", "255,211,77", "160,90,255"];

const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
const planta = (t) => clamp(1 + Math.floor((t - T_P1) / ((T_P10 - T_P1) / 9)), 1, 10);

function nota(g, x, y, s, a, col, doble) {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s);
  g.fillStyle = col; g.strokeStyle = col; g.lineWidth = 2.6; g.lineCap = "round";
  g.beginPath(); g.ellipse(0, 0, 6.5, 4.6, -0.4, 0, 6.283); g.fill();
  g.beginPath(); g.moveTo(5.6, -1.5); g.lineTo(5.6, -24);
  if (doble) { g.lineTo(21.6, -28); g.lineTo(21.6, -5.5); g.stroke(); g.beginPath(); g.ellipse(16, -4, 6.5, 4.6, -0.4, 0, 6.283); g.fill(); }
  else { g.quadraticCurveTo(13, -19, 13, -10); g.stroke(); }
  g.restore();
}
function digitos(g, n, x, y, tam, brillo) {
  txt(g, String(n), x, y, { tam, peso: 900, fam: FD, color: `rgba(255,${brillo ? 120 : 70},40,1)`, glow: "rgba(255,60,20,.9)", glowTam: brillo ? 22 : 12, esp: 2 });
}
function titulo() {
  if (CT.has("tit")) return CT.get("tit");
  const c = lienzoNuevo(900, 200), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 160);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#ffe48a"); gr.addColorStop(1, "#ff9d1f");
  txt(g, "¡PLANTA 10!", 456, 160, { tam: 150, peso: 900, fam: FD, color: "#2a0a00", esp: 5, max: 840 });
  txt(g, "¡PLANTA 10!", 450, 154, { tam: 150, peso: 900, fam: FD, color: gr, borde: "#2a0a00", bordeAncho: 12, esp: 5, glow: "rgba(255,170,40,.9)", glowTam: 26, max: 840 });
  CT.set("tit", c);
  return c;
}
/** Interior de la cabina: pared de acero con barandilla (en el rectángulo x0..x1, y0..y1). */
function paredCabina(g, x0, y0, x1, y1) {
  const gr = g.createLinearGradient(x0, 0, x1, 0);
  gr.addColorStop(0, "#5b626b"); gr.addColorStop(0.3, "#aab3bd"); gr.addColorStop(0.55, "#d6dde4"); gr.addColorStop(0.8, "#98a1ab"); gr.addColorStop(1, "#5b626b");
  g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  g.fillStyle = "rgba(0,0,0,.18)";
  for (let i = 1; i < 3; i++) g.fillRect(x0 + ((x1 - x0) * i) / 3 - 1, y0, 2, y1 - y0);
  g.fillStyle = "rgba(255,255,255,.05)";
  for (let x = x0; x < x1; x += 7) g.fillRect(x, y0, 1, y1 - y0);
  const yb = y0 + (y1 - y0) * 0.66;
  const gb = g.createLinearGradient(0, yb - 6, 0, yb + 6);
  gb.addColorStop(0, "#ffffff"); gb.addColorStop(0.5, "#9aa3ad"); gb.addColorStop(1, "#4a525b");
  g.fillStyle = gb; rectR(g, x0 + 10, yb - 5, x1 - x0 - 20, 10, 5); g.fill();
}

class Ascensor extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(420);
    this.notas = [];
  }
  luz() { return tramo(this.t, 0, 0.4) * (1 - tramo(this.t, T_APAGA, DUR - 0.03)); }
  // ------------------------------------------------------------------ dentro del ascensor
  posesDentro() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [48, 150], manoI: [30, 150], brazoIDelante: true };
    const M = { quien: "marcos", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [44, 146], manoI: [28, 146], brazoIDelante: true };
    let xG = 408, xM = 616, dyG = 0, dyM = 0;
    // miradas de reojo
    if (t > 1.15 && t < 1.5) M.rc = -0.15;
    if (t > 1.55 && t < 1.85) { G.rc = 0.15; M.rc = 0.06; }
    if (t > 1.95 && t < 2.15) { G.rc = 0.15; M.rc = -0.15; G.cara = "sorpresa"; M.cara = "sorpresa"; }
    if (t > 2.15 && t < 2.45) { G.rc = -0.14; M.rc = 0.14; G.cara = "guino"; M.cara = "guino"; }
    // Marcos silba; Guillermo le mira
    if (t > 2.5 && t < 3.25) { M.cara = "guino"; M.rc = 0.05 * Math.sin(t * 6); G.rc = 0.1; G.cara = t > 2.9 ? "sorpresa" : "sonrisa"; }
    if (t > 3.05 && t < 3.25) { M.cara = "sorpresa"; M.rc = 0; }
    // Guillermo mira un reloj que no tiene
    if (t > 3.3 && t < 4.1) {
      const k = eInOut(tramo(t, 3.3, 3.45)) * (1 - eInOut(tramo(t, 3.95, 4.1)));
      G.manoD = mezcla(G.manoD, [52, 100], k); G.manoI = mezcla(G.manoI, [46, 104 + (t > 3.6 && t < 3.9 ? 3 * Math.sin(t * 40) : 0)], k);
      G.rc = 0.06 * k; G.cara = t > 3.6 ? "guino" : "sonrisa";
    }
    // Marcos golpea el suelo con el pie
    if (t > 3.5 && t < 4.35) { M.piernaD = [-Math.max(0, Math.sin(t * 16)) * 6, 0]; M.rc = -0.05; }
    // ¡CLONC!: se abrazan del susto
    const kAb = eOut(tramo(t, T_CLONC, T_CLONC + 0.15)) * (1 - eInOut(tramo(t, 5.0, 5.3)));
    if (kAb > 0) {
      xG += 42 * kAb; xM -= 42 * kAb;
      G.cara = "sorpresa"; M.cara = "sorpresa"; G.puntas = kAb * (1 - tramo(t, 4.8, 5.0)); M.puntas = G.puntas;
      const mG = matAv(xG, PIES, 1.5), mM = matAv(xM, PIES, 1.5);
      G.manoD = mezcla(G.manoD, enAv(mG, aPant(mM, [16, 96])), kAb); G.brazoIDelante = false; G.manoI = mezcla(G.manoI, [0, 130], kAb);
      M.manoI = mezcla(M.manoI, enAv(mM, aPant(mG, [62, 96])), kAb); M.manoD = mezcla(M.manoD, [72, 128], kAb);
      G.rc = 0.12 * kAb; M.rc = -0.12 * kAb;
      dyG = dyM = -Math.abs(Math.sin(tramo(t, T_CLONC, T_CLONC + 0.3) * Math.PI)) * 14;
    }
    if (t > 5.0 && t < T_P10 - 0.1) { G.cara = "sonrisa"; M.cara = "sonrisa"; G.rc = -0.14; M.rc = 0.14; }
    if (t > T_P10 - 0.1) { G.cara = "sorpresa"; M.cara = "sorpresa"; G.rc = 0.04; M.rc = -0.04; }
    // tiesos: un leve balanceo
    dyG += Math.sin(t * 2.2) * 1.2; dyM += Math.sin(t * 2.2 + 1) * 1.2;
    return { G, M, mG: matAv(xG, PIES + dyG, 1.5), mM: matAv(xM, PIES + dyM, 1.5) };
  }
  cabina(g, t) {
    if (!CT.has("cabina")) {
      const c = lienzoNuevo(W, H), cg = c.getContext("2d");
      // techo, paredes, suelo (perspectiva)
      cg.fillStyle = "#2a2e34"; cg.beginPath(); cg.moveTo(0, 0); cg.lineTo(W, 0); cg.lineTo(874, 40); cg.lineTo(150, 40); cg.closePath(); cg.fill();
      cg.fillStyle = "rgba(255,250,230,.85)"; rectR(cg, 380, 8, 264, 18, 6); cg.fill();
      for (const [xa, xb, sgn] of [[0, 150, 1], [W, 874, -1]]) {
        const gl = cg.createLinearGradient(xa, 0, xb, 0);
        gl.addColorStop(0, "#3c434b"); gl.addColorStop(1, "#7d8690");
        cg.fillStyle = gl; cg.beginPath(); cg.moveTo(xa, 0); cg.lineTo(xb, 40); cg.lineTo(xb, 470); cg.lineTo(xa, H); cg.closePath(); cg.fill();
        void sgn;
      }
      paredCabina(cg, 150, 40, 874, 470);
      const gs = cg.createLinearGradient(0, 470, 0, H);
      gs.addColorStop(0, "#26292e"); gs.addColorStop(1, "#0d0f12");
      cg.fillStyle = gs; cg.beginPath(); cg.moveTo(150, 470); cg.lineTo(874, 470); cg.lineTo(W, H); cg.lineTo(0, H); cg.closePath(); cg.fill();
      cg.fillStyle = "rgba(255,255,255,.04)";
      for (let i = 0; i < 40; i++) { const x = 160 + (i % 10) * 72, y = 490 + Math.floor(i / 10) * 26; cg.beginPath(); cg.arc(x, y, 3, 0, 6.283); cg.fill(); }
      // botonera en la pared derecha
      cg.fillStyle = "#1c1f24"; cg.beginPath(); cg.moveTo(905, 170); cg.lineTo(950, 160); cg.lineTo(950, 380); cg.lineTo(905, 372); cg.closePath(); cg.fill();
      for (let i = 0; i < 10; i++) {
        const x = 918 + (i % 2) * 18, y = 186 + Math.floor(i / 2) * 36;
        cg.fillStyle = "#c9ced4"; cg.beginPath(); cg.arc(x, y, 7, 0, 6.283); cg.fill();
      }
      // altavoz del techo
      cg.fillStyle = "#15171a"; cg.beginPath(); cg.arc(230, 22, 16, 0, 6.283); cg.fill();
      cg.fillStyle = "#3a3e45";
      for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) if (i * i + j * j <= 5) { cg.beginPath(); cg.arc(230 + i * 5, 22 + j * 5, 1.4, 0, 6.283); cg.fill(); }
      // marco del indicador
      cg.fillStyle = "#121315"; rectR(cg, 412, 56, 200, 86, 10); cg.fill();
      cg.strokeStyle = "#8d96a0"; cg.lineWidth = 4; cg.stroke();
      CT.set("cabina", c);
    }
    g.drawImage(CT.get("cabina"), 0, 0);
    // botón del 10 encendido
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.9; g.drawImage(BLOB.naranja, 922, 318, 26, 26); g.restore();
    // indicador
    const n = planta(t), fl = t > T_P10 && Math.sin(t * 18) > 0;
    digitos(g, n, 538, 128, 72, fl || n === 10);
    g.fillStyle = "#ff5a28"; g.beginPath();
    const ya = 100 - ((t * 60) % 14) * 0.6;
    g.moveTo(452, ya + 10); g.lineTo(468, ya - 10); g.lineTo(484, ya + 10); g.closePath(); g.fill();
  }
  dentro(g, t) {
    fondo(g, "#000");
    const e = this.posesDentro();
    g.save();
    const sh = t > T_CLONC && t < T_CLONC + 0.4 ? Math.sin(t * 80) * 6 * (1 - tramo(t, T_CLONC, T_CLONC + 0.4)) : 0;
    g.translate(0, sh);
    this.cabina(g, t);
    g.fillStyle = "rgba(0,0,0,.4)";
    for (const m of [e.mG, e.mM]) { const q = aPant(m, [39, 232]); g.beginPath(); g.ellipse(q[0], PIES + 2, 56, 8, 0, 0, 6.283); g.fill(); }
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    g.restore();
    // música de espera: notas que salen del altavoz (y las de Marcos al silbar)
    for (const n of this.notas) {
      const d = t - n.t0; if (d < 0 || d > n.vida) continue;
      const x = n.x + n.vx * d + Math.sin(d * 4 + n.f) * 14, y = n.y + n.vy * d;
      nota(g, x, y, n.s, Math.min(1, d * 4) * (1 - tramo(d, n.vida - 0.4, n.vida)), n.col, n.doble);
    }
    // EJEM / CLONC
    this.ono(g, "¡CLONC!", 512, 230, T_CLONC, 0.6, 70, "#ffd34d", -0.06);
    this.ono(g, "EJEM…", 512, 260, 5.08, 0.55, 40, "#fffdf5", 0.05);
    this.ono(g, "¡DING!", 700, 110, T_P10, 0.6, 60, "#fffdf5", 0.08);
    this.ono(g, "¿?", 330, 230, 3.62, 0.4, 48, "#fffdf5", -0.1);
  }
  // ------------------------------------------------------------------ fuera: la fiesta de la planta 10
  posesFuera() {
    const t = this.t;
    const G = { cara: "sorpresa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [48, 150], manoI: [30, 150], brazoIDelante: true };
    const M = { quien: "marcos", cara: "sorpresa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [44, 146], manoI: [28, 146], brazoIDelante: true };
    const kS = eInOut(tramo(t, T_SALEN, T_SALEN + 0.7));
    const esc = lerp(1.18, 1.55, kS), y = lerp(560, 586, kS);
    let xG = lerp(462, 300, kS), xM = lerp(566, 724, kS), dyG = 0, dyM = 0;
    if (t < T_TIT - 0.15) { G.cara = "sonrisa"; M.cara = "sonrisa"; }
    if (t > T_TIT) {
      G.cara = "risa"; M.cara = "risa";
      if (kS > 0 && kS < 1) { const a = andar(t * 12, 1); G.piernaI = a.piernaI; G.piernaD = a.piernaD; M.piernaI = a.piernaD; M.piernaD = a.piernaI; dyG = dyM = a.bote * esc; }
      // a bailar: brazos arriba alternos, saltitos
      const b = (t - T_TIT) * 7.5, k = eOut(tramo(t, T_TIT, T_TIT + 0.25));
      G.brazoIDelante = false; M.brazoIDelante = false;
      G.manoD = mezcla(G.manoD, [88, 30 + 20 * Math.sin(b)], k); G.manoI = mezcla(G.manoI, [-12, 30 - 20 * Math.sin(b)], k);
      M.manoD = mezcla(M.manoD, [80, 44 + 14 * Math.sin(b + 1)], k); M.manoI = mezcla(M.manoI, [-6, 44 - 14 * Math.sin(b + 1)], k);
      if (kS >= 1) { dyG = -Math.abs(Math.sin(b)) * 14; dyM = -Math.abs(Math.sin(b + 0.5)) * 14; G.rc = 0.12 * Math.sin(b); M.rc = -0.12 * Math.sin(b); }
      if (t > 8.8 && t < 9.4) G.cara = "guino";
      G.oro = 0; M.puntas = 0;
    }
    return { G, M, mG: matAv(xG, y + dyG, esc), mM: matAv(xM, y + dyM, esc), esc };
  }
  fiesta(g, t) {
    if (!CT.has("sala")) {
      const c = lienzoNuevo(W + 120, H + 120), cg = c.getContext("2d");
      cg.translate(60, 60);
      const gr = cg.createLinearGradient(0, 0, 0, 470);
      gr.addColorStop(0, "#120820"); gr.addColorStop(1, "#2a1240");
      cg.fillStyle = gr; cg.fillRect(-60, -60, W + 120, 540);
      const gs = cg.createLinearGradient(0, 470, 0, H + 60);
      gs.addColorStop(0, "#1a0c28"); gs.addColorStop(1, "#05020a");
      cg.fillStyle = gs; cg.fillRect(-60, 470, W + 120, H - 410);
      // marco del ascensor
      const gm = cg.createLinearGradient(330, 0, 694, 0);
      gm.addColorStop(0, "#4a525b"); gm.addColorStop(0.5, "#c9d1d9"); gm.addColorStop(1, "#4a525b");
      cg.fillStyle = gm; cg.fillRect(338, 168, 348, 412);
      // indicador encima
      cg.fillStyle = "#0e0f11"; rectR(cg, 452, 104, 120, 56, 8); cg.fill();
      cg.strokeStyle = "#8d96a0"; cg.lineWidth = 3; cg.stroke();
      CT.set("sala", c);
    }
    g.drawImage(CT.get("sala"), -60, -60);
    // focos de colores que barren
    g.save(); g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 5; i++) {
      const a = Math.sin(t * (1.3 + i * 0.27) + i * 1.7) * 0.6, x0 = 100 + i * 206;
      const gr = g.createLinearGradient(0, -20, 0, 600);
      gr.addColorStop(0, `rgba(${COLORES[i]},.32)`); gr.addColorStop(1, `rgba(${COLORES[i]},0)`);
      g.fillStyle = gr; g.save(); g.translate(x0, -20); g.rotate(a);
      g.beginPath(); g.moveTo(-14, 0); g.lineTo(14, 0); g.lineTo(110, 680); g.lineTo(-110, 680); g.closePath(); g.fill();
      g.restore();
    }
    g.restore();
    // bola de discoteca
    const bx = 512, by = 40 + 0;
    g.strokeStyle = "#aaa"; g.lineWidth = 2; g.beginPath(); g.moveTo(bx, -20); g.lineTo(bx, by - 26); g.stroke();
    const gb = g.createRadialGradient(bx - 8, by - 8, 2, bx, by, 28);
    gb.addColorStop(0, "#ffffff"); gb.addColorStop(1, "#6a7480");
    g.fillStyle = gb; g.beginPath(); g.arc(bx, by, 26, 0, 6.283); g.fill();
    g.strokeStyle = "rgba(40,50,60,.6)"; g.lineWidth = 1;
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(bx - 26, by + i * 9); g.lineTo(bx + 26, by + i * 9); g.stroke(); }
    for (let i = 0; i < 6; i++) { const a = t * 3 + i; brillo(g, bx + Math.cos(a) * 18, by + Math.sin(a * 1.3) * 16, 12, 0.7); }
  }
  fuera(g, t) {
    fondo(g, "#000");
    this.fiesta(g, t);
    const e = this.posesFuera();
    // indicador «10»
    if (t < T_TIT + 0.1) digitos(g, 10, 512, 150, 48, Math.sin(t * 10) > -0.3);
    // interior de la cabina (con luz cálida) y puertas
    const kA = eInOut(tramo(t, T_ABRE, T_ABRE + 0.55));
    const x0 = 354, x1 = 670, y0 = 184, y1 = 578;
    paredCabina(g, x0, y0, x1, y1);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35; g.drawImage(BLOB2.oroClaro, x0, y0 - 40, x1 - x0, 300); g.restore();
    g.fillStyle = "#1b1d21"; g.fillRect(x0, 548, x1 - x0, 30);
    // los dos, dentro hasta que salen
    const fuera = t > T_SALEN + 0.3;
    if (!fuera) { g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, H); g.clip(); }
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    if (!fuera) g.restore();
    // puertas correderas
    const ancho = (x1 - x0) / 2 * (1 - kA);
    if (ancho > 0.5) {
      for (const [xa, sgn] of [[x0, 1], [x1, -1]]) {
        const gp = g.createLinearGradient(xa, 0, xa + ancho * sgn, 0);
        gp.addColorStop(0, "#7d8690"); gp.addColorStop(0.6, "#d4dbe2"); gp.addColorStop(1, "#8d96a0");
        g.fillStyle = gp; g.fillRect(Math.min(xa, xa + ancho * sgn), y0, ancho, y1 - y0);
        g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(sgn > 0 ? xa + ancho - 2 : xa - ancho, y0, 2, y1 - y0);
      }
    }
    // luces de la fiesta también sobre ellos
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.18;
    g.drawImage(BLOB.rojo, 200 + Math.sin(t * 2) * 200, 200, 400, 400); g.drawImage(BLOB2.cian, 420 + Math.cos(t * 1.7) * 200, 160, 400, 400);
    g.restore();
    // la cartela del TOP 10
    if (t > T_TIT - 0.1) {
      const k = tramo(t, T_TIT - 0.1, T_TIT + 0.15), s = lerp(2.6, 1, eIn(k)), sp = pegatinaTop10();
      g.save(); g.globalAlpha = clamp(k * 3, 0, 1); g.translate(858, 270); g.rotate(0.08 + (1 - k) * 0.5 + 0.03 * Math.sin(t * 3)); g.scale(s * 0.62, s * 0.62);
      g.drawImage(sp, -sp.width / 2, -sp.height / 2); g.restore();
      g.save(); g.globalAlpha = clamp(k * 3, 0, 1); g.translate(166, 270); g.rotate(-0.08 - (1 - k) * 0.5 - 0.03 * Math.sin(t * 3)); g.scale(s * 0.62, s * 0.62);
      g.drawImage(sp, -sp.width / 2, -sp.height / 2); g.restore();
    }
    this.p.dibujar(g);
    // ¡PLANTA 10!
    if (t > T_TIT) {
      const d = t - T_TIT, k = tramo(d, 0, 0.16), s = lerp(2.4, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 8));
      const r = titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 92); g.rotate(-0.03); g.scale(s * 0.86, s * 0.86);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    this.ono(g, "PUM", 160, 470, 6.1, 0.3, 46, "#ff3d84", -0.1);
    this.ono(g, "PUM", 860, 470, 6.42, 0.3, 46, "#2fe3e8", 0.1);
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // notas de la música de espera
    if (t < T_CORTE) this.una("n" + Math.floor(t / 0.45), t > 0.3, () => {
      const r = Math.random();
      this.notas.push({ t0: t, x: 236, y: 40, vx: azar(40, 110), vy: azar(30, 70), f: azar(0, 6), s: azar(1.1, 1.5), vida: 2.2, col: ["#ffd34d", "#2fe3e8", "#ff9ad0"][Math.floor(r * 3)], doble: r < 0.4 });
    });
    if (t > 2.5 && t < 3.05) this.una("s" + Math.floor(t / 0.2), true, () => {
      const m = matAv(616, PIES, 1.5), b = aPant(m, boca(0, "marcos"));
      this.notas.push({ t0: t, x: b[0] + 10, y: b[1] - 10, vx: azar(30, 80), vy: azar(-90, -50), f: azar(0, 6), s: 1.0, vida: 1.0, col: "#fffdf5", doble: false });
    });
    this.una("clonc", t > T_CLONC, () => { temblar(16, 0.4); for (let i = 0; i < 16; i++) p.nueva(P.POLVO, azar(150, 874), azar(30, 60), azar(-60, 60), azar(20, 90), azar(0.6, 1), azar(20, 40)); });
    this.una("ding", t > T_P10, () => temblar(5, 0.2));
    this.una("corte", t > T_CORTE, () => { p.n = 0; });
    this.una("pum1", t > 6.1, () => temblar(8, 0.2));
    this.una("pum2", t > 6.42, () => temblar(8, 0.2));
    this.una("tit", t > T_TIT, () => {
      temblar(18, 0.45);
      for (let i = 0; i < 110; i++) p.nueva(P.CONFETI, azar(0, W), azar(-140, -10), azar(-60, 60), azar(0, 160), azar(3, 4.2), azar(9, 15), i % 5);
      for (let i = 0; i < 30; i++) p.nueva(P.CONFETI, 512 + azar(-140, 140), 360, azar(-420, 420), azar(-560, -200), azar(2.6, 3.4), azar(9, 14), i % 5);
    });
    p.suelo = () => PIES + 10;
    p.alfa = this.luz();
    p.actualizar(dt);
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
    if (!this._pre) { this._pre = true; titulo(); pegatinaTop10(); const tmp = lienzoNuevo(8, 8).getContext("2d"); this.cabina(tmp, 0); this.fiesta(tmp, 0); }
    const t = this.t, a = this.luz();
    if (t < T_CORTE) this.dentro(g, t); else this.fuera(g, t);
    // el corte: destello blanco
    const dc = Math.abs(t - T_CORTE);
    if (dc < 0.18) { g.fillStyle = `rgba(255,255,255,${0.9 * (1 - dc / 0.18)})`; g.fillRect(-60, -60, W + 120, H + 120); }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00172", nombre: "El ascensor", crear: () => new Ascensor() });
})();
