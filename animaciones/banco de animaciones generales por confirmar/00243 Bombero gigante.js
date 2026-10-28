"use strict";
/*
 * 00243 · BOMBERO GIGANTE
 *
 * Animación del banco. Empieza y acaba en negro.
 * En un pueblecito de casitas de juguete, a una le sale fuego de dibujos por la chimenea. Marcos (de bombero) coge
 * aire, guiña un ojo y crece, crece… ¡EN GRANDE! Guillermo, que iba de su mano, sube con él y se sienta en su
 * hombro. Marcos apaga la chimenea con una regadera (¡FSSS!), sale la vecina a dar las gracias y Guillermo, diminuto,
 * la saluda desde el hombro del gigante.
 */
(() => {
const CT = cacheTexto();
const XM = 520, E0 = 0.75, E1 = 2.0;                           // Marcos: sitio y escala antes y después
const XG0 = 470;                                              // Guillermo al principio (de la mano de Marcos)
const CASA = [826, PIES], CHIM = [786, 398];                  // la casita y la boca de la chimenea
const T_VE = 0.5, T_AIRE = 1.15, T_CRECE = 1.55, T_GRANDE = 2.55, T_SUBE = 2.75, T_SIENTA = 3.45, T_RIEGA = 3.75,
  T_APAGA = 5.0, T_VECINA = 5.5, T_FIN = 8.25, DUR = 8.75;
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

function rotulo() {
  if (CT.has("t")) return CT.get("t");
  const c = lienzoNuevo(520, 270), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 20, 0, 250);
  gr.addColorStop(0, "#fff6d8"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8a1a");
  for (const [s, y] of [["¡EN", 112], ["GRANDE!", 236]]) {
    txt(g, s, 266, y + 7, { tam: 124, peso: 900, fam: FD, color: "#2a1200", esp: 6, max: 480 });
    txt(g, s, 260, y, { tam: 124, peso: 900, fam: FD, color: gr, borde: "#2a1200", bordeAncho: 12, esp: 6, glow: "rgba(255,190,60,.85)", glowTam: 24, max: 480 });
  }
  CT.set("t", c);
  return c;
}
/** Llama de dibujos con la base en (x, y). */
function llamita(g, x, y, s, t, f = 0) {
  if (s <= 0.02) return;
  g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.55;
  g.drawImage(BLOB.naranja, x - 50 * s, y - 80 * s, 100 * s, 100 * s);
  g.restore();
  for (const [k, col] of [[1, "#ff4a1a"], [0.74, "#ffa21f"], [0.45, "#fff3a6"]]) {
    const h = 46 * s * k * (1 + 0.14 * Math.sin(t * 23 + k * 5 + f)), w = 15 * s * k, sw = 5 * s * Math.sin(t * 17 + k * 3 + f);
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(x + sw, y - h);
    g.bezierCurveTo(x + w * 0.6, y - h * 0.55, x + w * 1.1, y - w * 1.5, x + w, y - w);
    g.arc(x, y - w, w, 0, Math.PI);
    g.bezierCurveTo(x - w * 1.1, y - w * 1.5, x - w * 0.6, y - h * 0.55, x + sw, y - h);
    g.fill();
  }
}
/** Regadera (unidades de avatar): el asa en la mano (x, y), inclinada inc. Devuelve la alcachofa en esas unidades. */
function regadera(g, x, y, inc) {
  g.save(); g.translate(x, y); g.rotate(inc);
  // pitorro
  g.strokeStyle = "#1f7a3a"; g.lineWidth = 4; g.lineCap = "round";
  g.beginPath(); g.moveTo(22, 22); g.lineTo(44, 4); g.stroke();
  g.save(); g.translate(46, 2); g.rotate(-0.7);
  g.fillStyle = "#2a9a4a"; g.beginPath(); g.moveTo(-3, -2); g.lineTo(5, -6); g.lineTo(5, 6); g.lineTo(-3, 2); g.closePath(); g.fill();
  g.fillStyle = "#c9cfd4"; g.beginPath(); g.ellipse(5, 0, 2, 6, 0, 0, 6.283); g.fill();
  g.restore();
  // cuerpo
  const gr = g.createLinearGradient(-10, 0, 24, 0);
  gr.addColorStop(0, "#1f6a32"); gr.addColorStop(0.45, "#4ac46a"); gr.addColorStop(1, "#1a5a2a");
  g.fillStyle = gr; rectR(g, -10, 6, 34, 28, 6); g.fill();
  g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(-6, 10, 3, 20);
  // asa
  g.strokeStyle = "#1a5a2a"; g.lineWidth = 3.5;
  g.beginPath(); g.moveTo(-6, 8); g.quadraticCurveTo(0, -4, 14, 7); g.stroke();
  g.restore();
  const q = rot2([50, -1], inc);
  return [x + q[0], y + q[1]];
}

class BomberoGigante extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(360);
    this.gotas = [];
    this.alca = null;
  }
  escala() {
    const t = this.t;
    if (t < T_CRECE) return E0 * (1 + 0.04 * Math.sin(tramo(t, T_AIRE, T_CRECE) * Math.PI));   // coge aire
    return lerp(E0, E1, eElastico(tramo(t, T_CRECE, T_GRANDE)));
  }
  poses() {
    const t = this.t, s = this.escala();
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    let inc = 0.1;
    // ---- Marcos
    if (t > T_VE && t < T_CRECE) { M.cara = "sorpresa"; M.rc = 0.12; }
    if (t > T_AIRE && t < T_CRECE) { M.cara = "guino"; M.rc = -0.05; }
    if (t >= T_CRECE && t < T_SUBE) { M.cara = t < T_GRANDE - 0.3 ? "sorpresa" : "risa"; M.puntas = 0; }
    if (t >= T_SUBE) M.cara = "sonrisa";
    // sube la mano izquierda (con Guillermo) hasta el hombro
    const kSube = eInOut(tramo(t, T_SUBE, T_SIENTA)), kBaja = eInOut(tramo(t, T_SIENTA, T_SIENTA + 0.35));
    M.manoI = mezcla(mezcla([6, 152], [-2, 82], kSube), [6, 152], kBaja);
    M.rc = t >= T_SUBE ? -0.12 * kSube * (1 - kBaja) + 0.1 * kBaja : M.rc;
    if (t >= T_SUBE && t < T_SIENTA + 0.2) M.cara = "risa";
    // riega la chimenea
    const kR = eInOut(tramo(t, T_RIEGA - 0.4, T_RIEGA)) * (1 - eInOut(tramo(t, T_APAGA + 0.2, T_APAGA + 0.6)));
    const mM = matAv(XM, PIES, s);
    if (t > T_RIEGA - 0.4) {
      const obj = enAv(mM, [CHIM[0] - 140, CHIM[1] - 96]);
      M.manoD = mezcla([67, 152], obj, kR);
      inc = lerp(0.1, 0.75 + 0.05 * Math.sin(t * 6), kR);
      M.cara = t > T_RIEGA + 0.2 && t < T_APAGA ? "guino" : M.cara; M.rc = lerp(M.rc, 0.12, kR);
    }
    if (t > T_APAGA + 0.4) { M.cara = "risa"; M.rc = 0.06; }
    if (t > T_VECINA + 0.6) { M.cara = "guino"; }
    M.objD = (g, mano) => { this.alca = regadera(g, mano[0], mano[1], inc); };
    this.inc = inc;
    // ---- Guillermo
    let mG;
    const manoM = aPant(mM, M.manoI);
    if (t < T_SIENTA) {
      // de la mano de Marcos (su mano derecha en la izquierda de Marcos); señala el fuego al principio
      G.cara = t > T_VE ? "sorpresa" : "sonrisa"; G.rc = 0.1;
      const mG0 = matAv(XG0, PIES, E0);
      if (t < T_CRECE) {
        G.manoD = enAv(mG0, manoM); G.manoI = t > T_VE && t < T_AIRE ? [30, 58] : [9, 160]; G.brazoIDelante = t > T_VE && t < T_AIRE; G.rc = 0.16;
        mG = mG0;
      } else {
        // colgado de la mano que crece: brazo arriba
        G.manoD = [56, 14]; G.manoI = [-10, 90 + 10 * Math.sin(t * 12)];
        const sw = Math.sin(t * 7);
        G.piernaI = [-6 * Math.max(0, sw), 0.25 * sw]; G.piernaD = [-6 * Math.max(0, -sw), 0.25 * sw];
        G.cara = t < T_GRANDE ? "sorpresa" : "risa"; G.puntas = t < T_GRANDE ? 1 : 0.3;
        mG = matAv(manoM[0], manoM[1], E0, 0.08 * Math.sin(t * 5), 1, 1, [56, 14]);
        // si aún no ha despegado del suelo, que no se hunda
        const pies = aPant(mG, [39, 232]);
        if (pies[1] > PIES) { mG = matAv(manoM[0], manoM[1] - (pies[1] - PIES), E0, 0, 1, 1, [56, 14]); }
      }
    } else {
      // sentado en el hombro izquierdo de Marcos: las caderas en lo alto del hombro, las piernas colgando delante
      const hom = aPant(mM, [12, 88]);
      const k = eOut(tramo(t, T_SIENTA, T_SIENTA + 0.25));
      G.cara = "risa"; G.rc = 0.06;
      G.manoD = [80, 140]; G.manoI = [0, 140];
      const sw = Math.sin(t * 4);
      G.piernaI = [-4, 0.12 + 0.08 * sw]; G.piernaD = [-4, -0.12 + 0.08 * sw];
      if (t > T_RIEGA) { G.manoD = [70, 136]; G.manoI = [-16, 70]; G.cara = "risa"; }
      if (t > T_VECINA) { const s2 = Math.sin(t * 12); G.manoI = [-24, 24 + 10 * s2]; G.cara = "guino"; G.rc = 0.14; }
      mG = matAv(hom[0] - 4, hom[1] + (232 - 146) * E0 + 4 - 16 * (1 - k), E0);
    }
    return { G, M, mG, mM, s };
  }

  actualizar(dt) {
    const t = (this.t += dt), p = this.p, e = this.poses();
    this.una("crece", t > T_CRECE, () => temblar(8, 1.0));
    this.una("grande", t > T_GRANDE - 0.2, () => {
      temblar(20, 0.5);
      for (let k = 0; k < 30; k++) p.nueva(P.POLVO, XM + azar(-160, 160), PIES, azar(-200, 200), azar(-60, -10), azar(0.6, 1.1), azar(30, 50));
    });
    if (t > T_CRECE && t < T_GRANDE && Math.random() < 40 * dt) {
      const a = azar(0, 6.283), r = azar(60, 220) * e.s / E1;
      p.nueva(P.PURPURINA, XM + Math.cos(a) * r, PIES - 116 * e.s + Math.sin(a) * r * 1.6, Math.cos(a) * 40, Math.sin(a) * 40, azar(0.6, 1.1), azar(10, 16));
    }
    // humo de la chimenea mientras arde
    const fuego = 1 - tramo(t, T_RIEGA + 0.2, T_APAGA);
    if (fuego > 0.05 && Math.random() < 8 * dt) p.nueva(P.HUMO, CHIM[0] + azar(-6, 6), CHIM[1] - 50, azar(-10, 10), azar(-60, -30), azar(1, 1.6), azar(14, 22));
    // agua de la regadera
    if (t > T_RIEGA && t < T_APAGA + 0.3 && this.alca) {
      const a = aPant(e.mM, this.alca);
      for (let k = 0; k < 3; k++) this.gotas.push({ x: a[0] + azar(-6, 6), y: a[1] + azar(-6, 6), vx: azar(60, 200), vy: azar(-40, 80), v: azar(0.5, 0.8) });
      if (Math.random() < 20 * dt) p.nueva(P.VAPOR, CHIM[0] + azar(-20, 20), CHIM[1] - 20, azar(-30, 30), azar(-90, -40), azar(0.7, 1.1), azar(26, 40));
    }
    for (const d of this.gotas) { d.v -= dt; d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0 && d.y < PIES);
    if (this.gotas.length > 300) this.gotas.splice(0, this.gotas.length - 300);
    this.una("apaga", t > T_APAGA, () => {
      temblar(6, 0.2);
      for (let k = 0; k < 12; k++) p.nueva(P.VAPOR, CHIM[0] + azar(-20, 20), CHIM[1] - 20, azar(-40, 40), azar(-120, -40), azar(0.8, 1.4), azar(30, 50));
    });
    this.una("vecina", t > T_VECINA + 0.2, () => {
      for (let k = 0; k < 40; k++) p.nueva(P.CONFETI, azar(60, 960), azar(-60, -10), azar(-40, 40), azar(30, 140), azar(2, 3), azar(9, 14), k % 5);
    });
    p.suelo = () => PIES;
    p.actualizar(dt);
  }

  fondoC() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, PIES);
    gc.addColorStop(0, "#1a2a5a"); gc.addColorStop(0.6, "#6a5aa0"); gc.addColorStop(1, "#ffb08a");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, H + 120);
    const r = semilla(31);
    g.fillStyle = "#fff";
    for (let i = 0; i < 70; i++) { g.globalAlpha = 0.3 + r() * 0.6; g.fillRect(r() * (W + 120) - 60, r() * 300 - 60, 2, 2); }
    g.globalAlpha = 1;
    // colinas
    g.fillStyle = "#3a6a4a";
    g.beginPath(); g.moveTo(-60, PIES - 40);
    for (let x = -60; x <= W + 60; x += 30) g.lineTo(x, PIES - 120 + Math.sin(x * 0.01) * 26 + Math.sin(x * 0.027) * 10);
    g.lineTo(W + 60, PIES); g.lineTo(-60, PIES); g.closePath(); g.fill();
    // casitas del pueblo (pequeñas)
    const casita = (x, w, h, col, techo) => {
      g.fillStyle = col; g.fillRect(x - w / 2, PIES - h, w, h);
      g.fillStyle = techo; g.beginPath(); g.moveTo(x - w / 2 - 8, PIES - h); g.lineTo(x, PIES - h - w * 0.5); g.lineTo(x + w / 2 + 8, PIES - h); g.closePath(); g.fill();
      g.fillStyle = "#ffd27a"; g.fillRect(x - w * 0.3, PIES - h * 0.7, w * 0.2, h * 0.22); g.fillRect(x + w * 0.1, PIES - h * 0.7, w * 0.2, h * 0.22);
      g.fillStyle = "#5a3418"; g.fillRect(x - w * 0.1, PIES - h * 0.38, w * 0.2, h * 0.38);
    };
    casita(60, 90, 70, "#e8d8b0", "#b8523a");
    casita(170, 70, 56, "#c8e0f0", "#3a5a9a");
    casita(300, 80, 64, "#f0d0d8", "#8a3a5a");
    casita(640, 70, 52, "#e0f0c8", "#4a7a3a");
    casita(990, 80, 60, "#f0e0c0", "#9a5a2a");
    // arbolitos
    for (const [x, h] of [[115, 50], [240, 40], [590, 46], [700, 38], [940, 44]]) {
      g.fillStyle = "#5a3418"; g.fillRect(x - 3, PIES - h * 0.4, 6, h * 0.4);
      g.fillStyle = "#2e7a3a"; g.beginPath(); g.arc(x, PIES - h * 0.6, h * 0.35, 0, 6.283); g.fill();
    }
    // suelo (calle)
    g.fillStyle = "#6a5a4a"; g.fillRect(-60, PIES - 4, W + 120, H);
    g.fillStyle = "rgba(255,230,190,.25)"; g.fillRect(-60, PIES - 4, W + 120, 2);
    return (this.cF = c);
  }
  /** La casita de la chimenea (la vecina sale por la puerta). */
  casa(g, t, fuego) {
    const [x, y] = CASA, w = 150, h = 112;
    g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.ellipse(x, y + 2, 96, 8, 0, 0, 6.283); g.fill();
    // chimenea
    g.fillStyle = "#9a4a3a"; g.fillRect(CHIM[0] - 14, CHIM[1], 28, 70);
    g.fillStyle = "#7a3a2a"; g.fillRect(CHIM[0] - 17, CHIM[1] - 2, 34, 9);
    if (fuego < 1) { g.fillStyle = `rgba(90,140,200,${0.6 * (1 - fuego)})`; g.fillRect(CHIM[0] - 14, CHIM[1] + 6, 28, 14); }
    // paredes
    const gp = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    gp.addColorStop(0, "#f2e2c0"); gp.addColorStop(1, "#d8c49a");
    g.fillStyle = gp; g.fillRect(x - w / 2, y - h, w, h);
    // tejado
    g.fillStyle = "#c8402a"; g.beginPath(); g.moveTo(x - w / 2 - 14, y - h); g.lineTo(x, y - h - 78); g.lineTo(x + w / 2 + 14, y - h); g.closePath(); g.fill();
    g.strokeStyle = "rgba(0,0,0,.2)"; g.lineWidth = 2;
    for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(x - w / 2 - 14 + i * 12, y - h - i * 2); g.lineTo(x + w / 2 + 14 - i * 12, y - h - i * 2); g.stroke(); }
    // ventana encendida y puerta
    g.fillStyle = "#ffd27a"; g.fillRect(x + 22, y - 82, 34, 30);
    g.strokeStyle = "#5a3418"; g.lineWidth = 3; g.strokeRect(x + 22, y - 82, 34, 30); g.beginPath(); g.moveTo(x + 39, y - 82); g.lineTo(x + 39, y - 52); g.stroke();
    const ab = eOut(tramo(t, T_VECINA, T_VECINA + 0.3));
    g.fillStyle = "#3a2010"; g.fillRect(x - 50, y - 70, 40, 70);
    g.fillStyle = "#ffcf7a"; g.fillRect(x - 46, y - 66, 32, 66);
    g.fillStyle = "#7a4a22"; g.fillRect(x - 46, y - 66, 32 * (1 - ab), 66);
    if (fuego > 0.02) for (let i = 0; i < 3; i++) llamita(g, CHIM[0] - 9 + i * 9, CHIM[1] + 2, (0.55 + 0.1 * Math.sin(t * 6 + i)) * fuego, t, i * 2);
  }

  dibujar(g) {
    const t = this.t, e = this.poses();
    const fuego = 1 - tramo(t, T_RIEGA + 0.2, T_APAGA);
    fondo(g, "#000");
    g.drawImage(this.fondoC(), -60, -60);
    this.casa(g, t, fuego);
    // la vecina (clon diminuto con pelo dorado) saluda desde la puerta
    if (t > T_VECINA) {
      const k = eOut(tramo(t, T_VECINA + 0.1, T_VECINA + 0.4)), s = Math.sin(t * 12);
      pintarAvatar(g, matAv(CASA[0] - 30, PIES, 0.27 * k + 0.001), { cara: "risa", oro: 1, rc: 0.1, piernaI: [0, 0], piernaD: [0, 0], manoD: [94, 20 + 12 * s], manoI: [9, 160] }, t);
    }
    // sombra de Marcos
    g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.ellipse(XM, PIES + 2, 44 * e.s, 6 * e.s, 0, 0, 6.283); g.fill();
    pintarAvatar(g, e.mM, e.M, t);
    pintarAvatar(g, e.mG, e.G, t);
    g.fillStyle = "rgba(170,225,255,.95)";
    for (const d of this.gotas) { g.beginPath(); g.ellipse(d.x, d.y, 3, 4.5, 0, 0, 6.283); g.fill(); }
    this.p.dibujar(g);
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    ono("¡FUEGO!", 790, 270, T_VE, 0.9, 50, "#ffd34d", "#5a1a00", 0.08);
    ono("¡FSSSS!", 900, 330, T_RIEGA + 0.4, 1.2, 54, "#e8f6ff", "#123048", 0.1);
    if (t > T_VECINA + 0.4 && t < T_FIN) bocadillo(g, 890, 410, "¡GRACIAS!", CASA[0] - 22, PIES - 70, tramo(t, T_VECINA + 0.4, T_VECINA + 0.6) * (1 - tramo(t, T_VECINA + 2.2, T_VECINA + 2.4)), 30);
    // ¡EN GRANDE!
    const tit = (t0, t1, z0) => {
      if (t < t0 || t > t1) return;
      const d = t - t0, k = tramo(d, 0, 0.16), s = lerp(z0, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 8)), sal = tramo(t, t1 - 0.25, t1);
      const r = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - sal); g.translate(226 + (d < 0.6 ? azar(-5, 5) : 0), 150); g.rotate(-0.05); g.scale(s * 0.86, s * 0.86);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    };
    tit(T_CRECE + 0.3, T_RIEGA + 0.3, 2);
    tit(T_VECINA + 0.8, DUR, 1.3);
    const a = Math.max(1 - tramo(t, 0.02, 0.5), tramo(t, T_FIN, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00243", nombre: "Bombero gigante", crear: () => new BomberoGigante() });
})();
