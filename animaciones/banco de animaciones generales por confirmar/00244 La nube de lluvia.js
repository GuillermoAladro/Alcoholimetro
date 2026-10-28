"use strict";
/*
 * 00244 · LA NUBE DE LLUVIA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Día de sol en el parque. Marcos (de bombero) echa agua hacia arriba con la manguera y forma una nubecilla con cara
 * de pillina que se pone encima de Guillermo y le llueve solo a él: ¡QUE LLUEVA! Guillermo se aparta a un lado, al
 * otro… y la nube detrás. Abre un paraguas; la nube se enfurruña, se pone dorada y se pone a hacer sol. Guillermo,
 * con gafas de sol y el paraguas de sombrilla, encantado.
 */
(() => {
const CT = cacheTexto();
const ESC = 1.45, XM = 830;
const T_RIEGA = 0.55, T_NUBE = 1.6, T_LLUEVE = 2.05, T_IZQ = 2.55, T_DER = 3.45, T_PARAGUAS = 4.6, T_ENFADA = 5.2,
  T_SOL = 5.8, T_FIN = 8.3, DUR = 8.8;
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

function rotulo() {
  if (CT.has("t")) return CT.get("t");
  const c = lienzoNuevo(860, 200), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 160);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#bfeaff"); gr.addColorStop(1, "#3aa8ff");
  txt(g, "¡QUE LLUEVA!", 436, 156, { tam: 132, peso: 400, fam: FB, color: "#06213a", esp: 4, max: 820 });
  txt(g, "¡QUE LLUEVA!", 430, 150, { tam: 132, peso: 400, fam: FB, color: gr, borde: "#06213a", bordeAncho: 12, esp: 4, glow: "rgba(80,180,255,.7)", glowTam: 20, max: 820 });
  CT.set("t", c);
  return c;
}
/** Paraguas (diseño propio) en unidades de avatar: el puño en (x, y); abierto 0–1; inclinación. */
function paraguas(g, x, y, abierto, inc) {
  g.save(); g.translate(x, y); g.rotate(inc);
  g.strokeStyle = "#3a2a22"; g.lineWidth = 2.6; g.lineCap = "round";
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -104); g.stroke();
  g.beginPath(); g.arc(-5, 2, 5, 0, Math.PI); g.stroke();
  const w = lerp(8, 64, abierto), h = lerp(70, 30, abierto);
  g.save(); g.translate(0, -102);
  g.beginPath(); g.moveTo(-w, 0);
  g.quadraticCurveTo(-w * 0.9, -h * 1.1, 0, -h); g.quadraticCurveTo(w * 0.9, -h * 1.1, w, 0);
  for (let i = 4; i > 0; i--) { const x0 = -w + (i * 2 * w) / 4, x1 = -w + ((i - 1) * 2 * w) / 4; g.quadraticCurveTo((x0 + x1) / 2, 8 * abierto, x1, 0); }
  g.closePath();
  g.fillStyle = "#e3261b"; g.fill();
  g.save(); g.clip();
  g.fillStyle = "#fff4e8";
  for (let i = 0; i < 4; i += 2) { const x0 = -w + (i * 2 * w) / 4; g.beginPath(); g.moveTo(0, -h); g.lineTo(x0, 4); g.lineTo(x0 + (2 * w) / 4, 4); g.closePath(); g.fill(); }
  g.restore();
  g.strokeStyle = "rgba(90,10,6,.6)"; g.lineWidth = 1.5; g.stroke();
  g.fillStyle = "#3a2a22"; g.beginPath(); g.arc(0, -h - 3, 3, 0, 6.283); g.fill();
  g.restore();
  g.restore();
}
/** Lanza de manguera en la mano (unidades de avatar), apuntando ang. */
function lanza(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const gl = g.createLinearGradient(0, -6, 0, 6); gl.addColorStop(0, "#fff0a0"); gl.addColorStop(0.5, "#d9a516"); gl.addColorStop(1, "#7a5200");
  g.fillStyle = "#1b1b1d"; rectR(g, -10, -6, 12, 12, 3); g.fill();
  g.fillStyle = gl; g.beginPath(); g.moveTo(2, -6); g.lineTo(26, -3.5); g.lineTo(26, 3.5); g.lineTo(2, 6); g.closePath(); g.fill();
  g.restore();
}

class NubeDeLluvia extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(300);
    this.gotas = [];
    this.nx = 640; this.nvx = 0;            // la nube sigue a Guillermo con un poco de retraso
    this.charco = 0;
  }
  xG(t) {
    let x = 300;
    if (t > T_IZQ) x = lerp(300, 168, eInOut(tramo(t, T_IZQ, T_IZQ + 0.45)));
    if (t > T_DER) x = lerp(168, 560, eInOut(tramo(t, T_DER, T_DER + 0.75)));
    return x;
  }
  anda(t) { return (t > T_IZQ && t < T_IZQ + 0.45) || (t > T_DER && t < T_DER + 0.75); }
  /** La nube: centro, tamaño 0–1 y humor. */
  nube() {
    const t = this.t;
    const k = eOut(tramo(t, T_RIEGA + 0.3, T_NUBE));
    const y = 128 + 4 * Math.sin(t * 2.4);
    const humor = t < T_LLUEVE ? "risa" : t < T_PARAGUAS + 0.25 ? "pillina" : t < T_SOL ? "enfadada" : "sol";
    return { x: this.nx, y, k, humor };
  }
  llueve() { const t = this.t; return t > T_LLUEVE && t < T_ENFADA + 0.2; }
  poses() {
    const t = this.t, xg = this.xG(t);
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [2, 118], brazoIDelante: true };
    const M = { quien: "bombero", cara: "sonrisa", rc: -0.05, piernaI: [0, 0], piernaD: [0, 0], manoD: [54, 104], manoI: [20, 112], brazoIDelante: true };
    let dyG = 0;
    // la caña de Guillermo, en la mano izquierda
    G.objI = (g, mano) => { g.save(); g.translate(mano[0], mano[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], 0.05, 0.8, "asa", t); g.restore(); };
    G.objI2 = (g, mano) => { g.save(); g.translate(mano[0], mano[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], 0.05, 0.8, "cuerpo", t); g.restore(); };
    // ---- Marcos: riega hacia arriba y se ríe
    const kR = eOut(tramo(t, T_RIEGA - 0.25, T_RIEGA)) * (1 - eInOut(tramo(t, T_NUBE, T_NUBE + 0.3)));
    M.manoD = mezcla([54, 118], [50, 58], kR); M.manoI = mezcla([20, 120], [30, 80], kR);
    this.angLanza = lerp(0.3, -1.75, kR);
    M.cara = t > T_RIEGA + 0.2 && t < T_NUBE ? "guino" : "sonrisa"; M.rc = -0.06;
    if (t > T_LLUEVE + 0.3) { M.cara = "risa"; M.rc = -0.1 + 0.04 * Math.sin(t * 14); }
    if (t > T_LLUEVE + 0.5 && t < T_PARAGUAS) { M.manoI = [8, 60 + 4 * Math.sin(t * 16)]; }  // se tapa la risa
    if (t > T_ENFADA) { M.cara = "sorpresa"; M.rc = -0.14; }
    if (t > T_SOL + 0.4) { M.cara = "risa"; M.rc = -0.08; }
    M.objD = (g, mano) => lanza(g, mano[0], mano[1], this.angLanza);
    // ---- Guillermo
    if (t > T_RIEGA + 0.3 && t < T_LLUEVE) { G.cara = "sorpresa"; G.rc = 0.12; }
    if (this.llueve()) {
      G.cara = t < T_LLUEVE + 0.4 ? "sorpresa" : "dormido"; G.rc = -0.1;
      G.manoD = [86, 50]; // se tapa
      if (this.anda(t)) { G.cara = "sorpresa"; const a = andar(t * 18, 1.3); G.piernaI = a.piernaI; G.piernaD = a.piernaD; dyG = a.bote; G.manoD = [84, 92]; }
    }
    // paraguas
    const ab = eBack(tramo(t, T_PARAGUAS, T_PARAGUAS + 0.3));
    if (t > T_PARAGUAS - 0.25) {
      const k = eOut(tramo(t, T_PARAGUAS - 0.25, T_PARAGUAS));
      G.manoD = mezcla([86, 50], [66, 96], k); G.cara = t < T_PARAGUAS + 0.3 ? "guino" : "risa"; G.rc = 0.04;
      let inc = 0.02;
      if (t > T_ENFADA) { G.cara = "sorpresa"; G.rc = -0.14; }
      if (t > T_SOL) {
        const ks = eInOut(tramo(t, T_SOL + 0.3, T_SOL + 0.8));
        G.cara = ks > 0.5 ? "guino" : "sorpresa"; G.gafas = ks > 0.5; G.rc = 0.1 * ks; inc = 0.35 * ks;
        G.manoD = mezcla([66, 96], [74, 108], ks);
        if (t > T_SOL + 1.2) { G.cara = "risa"; G.manoI = [8, 96]; dyG = -Math.abs(Math.sin(t * 4)) * 3; }
      }
      G.objD = (g, mano) => paraguas(g, mano[0], mano[1], clamp(ab, 0, 1.08), inc);
    }
    const mG = matAv(xg, PIES + dyG, ESC), mM = matAv(XM, PIES, ESC);
    return { G, M, mG, mM, xg };
  }

  actualizar(dt) {
    const t = (this.t += dt), p = this.p, e = this.poses();
    // la nube persigue a Guillermo
    const objX = t < T_NUBE ? 640 : e.xg;
    const f = 18 * (objX - this.nx) - 7 * this.nvx;
    this.nvx += f * dt; this.nx += this.nvx * dt;
    // chorro hacia arriba: forma la nube
    if (t > T_RIEGA && t < T_NUBE) {
      const L = aPant(e.mM, e.M._manoD || e.M.manoD);
      for (let k = 0; k < 2; k++) p.nueva(P.VAPOR, L[0] + azar(-30, 30) - 60 * tramo(t, T_RIEGA, T_NUBE), 150 + azar(-30, 30), azar(-40, 40), azar(-20, 20), azar(0.5, 0.9), azar(40, 70));
    }
    // lluvia (solo debajo de la nube)
    const N = this.nube();
    if (this.llueve() && Math.random() < 0.9) {
      for (let k = 0; k < 3; k++) this.gotas.push({ x: N.x + azar(-70, 70), y: N.y + 30, vy: azar(420, 560), v: 1.4, sp: 0 });
    }
    const par = t > T_PARAGUAS + 0.1 ? aPant(e.mG, [44, -6]) : null;
    for (const d of this.gotas) {
      if (d.sp) { d.v -= dt; d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; continue; }
      d.y += d.vy * dt; d.v -= dt;
      // choca con el paraguas o con el suelo
      const choca = (par && Math.abs(d.x - par[0]) < 90 && d.y > par[1] - 40 && d.y < par[1]) || d.y > PIES - 2;
      if (choca) { d.sp = 1; d.v = azar(0.2, 0.35); d.vx = azar(-120, 120); d.vy = azar(-180, -60); if (d.y > PIES - 2) this.charco = Math.min(1, this.charco + 0.004); }
    }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    if (this.gotas.length > 360) this.gotas.splice(0, this.gotas.length - 360);
    this.una("llueve", t > T_LLUEVE, () => temblar(4, 0.2));
    this.una("paraguas", t > T_PARAGUAS, () => { temblar(6, 0.2); p.nueva(P.DESTELLO, e.xg, PIES - 420, 0, 0, 0.25, 120); });
    this.una("enfada", t > T_ENFADA, () => { temblar(8, 0.3); for (let k = 0; k < 10; k++) p.nueva(P.HUMO, N.x + azar(-60, 60), N.y - 30, azar(-40, 40), azar(-60, -20), azar(0.5, 0.9), azar(20, 30)); });
    this.una("sol", t > T_SOL, () => {
      temblar(10, 0.3);
      p.nueva(P.DESTELLO, N.x, N.y, 0, 0, 0.4, 260);
      for (let k = 0; k < 30; k++) { const a = azar(0, 6.283), v = azar(80, 240); p.nueva(P.PURPURINA, N.x, N.y, Math.cos(a) * v, Math.sin(a) * v, azar(1, 1.8), azar(10, 16)); }
    });
    // el charco se seca al sol
    if (t > T_SOL) this.charco = Math.max(0, this.charco - dt * 0.4);
    if (t > T_SOL && Math.random() < 10 * dt) p.nueva(P.VAPOR, e.xg + azar(-80, 80), PIES - 4, 0, azar(-60, -30), azar(0.6, 1), azar(20, 30));
    p.suelo = () => PIES;
    p.actualizar(dt);
  }

  fondoC() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, 470);
    gc.addColorStop(0, "#3a9ae8"); gc.addColorStop(1, "#bfe8ff");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, H + 120);
    // sol de verdad, arriba a la derecha
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.6; g.drawImage(BLOB.amarillo, 840, -80, 220, 220); g.restore();
    g.fillStyle = "#fff6c0"; g.beginPath(); g.arc(950, 30, 46, 0, 6.283); g.fill();
    // nubes lejanas
    g.fillStyle = "rgba(255,255,255,.7)";
    for (const [x, y, s] of [[120, 60, 1], [360, 30, 0.7], [760, 90, 0.8]]) for (const [dx, dy, r] of [[0, 0, 26], [28, -10, 32], [60, 0, 24]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, 6.283); g.fill(); }
    // colinas y césped
    g.fillStyle = "#6ac46a";
    g.beginPath(); g.moveTo(-60, 470);
    for (let x = -60; x <= W + 60; x += 30) g.lineTo(x, 420 + Math.sin(x * 0.009) * 30 + Math.sin(x * 0.023) * 10);
    g.lineTo(W + 60, 470); g.closePath(); g.fill();
    const gs = g.createLinearGradient(0, 460, 0, H);
    gs.addColorStop(0, "#5ab45a"); gs.addColorStop(1, "#2e7a3a");
    g.fillStyle = gs; g.fillRect(-60, 460, W + 120, H);
    // árbol y banco
    g.fillStyle = "#6a4426"; g.fillRect(974, 290, 24, 190);
    g.fillStyle = "#3a9a4a"; for (const [x, y, r] of [[986, 270, 70], [940, 300, 50], [1030, 300, 52]]) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
    g.fillStyle = "#8a5a2a"; g.fillRect(20, 470, 150, 10); g.fillRect(20, 448, 150, 8);
    g.fillStyle = "#3a3d42"; g.fillRect(28, 480, 6, 24); g.fillRect(156, 480, 6, 24);
    // flores
    const r = semilla(8);
    for (let i = 0; i < 30; i++) { g.fillStyle = ["#ff3d84", "#ffd34d", "#ffffff"][i % 3]; g.beginPath(); g.arc(r() * W, 490 + r() * 100, 3, 0, 6.283); g.fill(); }
    return (this.cF = c);
  }
  dibujarNube(g, N, t) {
    if (N.k <= 0.02) return;
    const sol = tramo(t, T_SOL, T_SOL + 0.3), enf = N.humor === "enfadada";
    g.save(); g.translate(N.x, N.y); g.scale(N.k * (enf ? 1 + 0.05 * Math.sin(t * 30) : 1), N.k);
    // rayos de sol
    if (sol > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8 * sol; g.drawImage(BLOB2.oro, -170, -150, 340, 300); g.restore();
      g.save(); g.rotate(t * 0.4); g.fillStyle = `rgba(255,214,80,${0.85 * sol})`;
      for (let i = 0; i < 12; i++) { g.rotate(Math.PI / 6); g.beginPath(); g.moveTo(-10, -80); g.lineTo(0, -116 - 8 * Math.sin(t * 5 + i)); g.lineTo(10, -80); g.closePath(); g.fill(); }
      g.restore();
    }
    const gris = N.humor === "pillina" ? 0.25 : enf ? 0.55 : 0;
    const col = sol > 0.5 ? "#fff3b0" : `rgb(${Math.round(255 - 120 * gris)},${Math.round(255 - 110 * gris)},${Math.round(255 - 90 * gris)})`;
    g.fillStyle = col;
    for (const [x, y, r] of [[-60, 10, 34], [-26, -18, 44], [20, -24, 48], [60, 4, 36], [0, 14, 40], [-36, 18, 30], [38, 20, 32]]) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
    g.fillStyle = sol > 0.5 ? "rgba(255,200,60,.35)" : "rgba(0,0,0,.08)"; g.beginPath(); g.ellipse(0, 30, 80, 14, 0, 0, Math.PI); g.fill();
    // cara
    g.strokeStyle = "#2a3a4a"; g.fillStyle = "#2a3a4a"; g.lineWidth = 4; g.lineCap = "round";
    if (sol > 0.5) {
      for (const x of [-20, 20]) { g.beginPath(); g.arc(x, -2, 8, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
      g.fillStyle = "#c84a3a"; g.beginPath(); g.arc(0, 12, 12, 0.1, Math.PI - 0.1); g.closePath(); g.fill();
      g.fillStyle = "rgba(255,120,120,.5)"; for (const x of [-36, 36]) { g.beginPath(); g.ellipse(x, 10, 8, 5, 0, 0, 6.283); g.fill(); }
    } else {
      for (const x of [-20, 20]) { g.beginPath(); g.ellipse(x, -4, 5, 7, 0, 0, 6.283); g.fill(); }
      g.fillStyle = "#fff"; for (const x of [-21, 19]) { g.beginPath(); g.arc(x, -7, 1.8, 0, 6.283); g.fill(); }
      g.beginPath();
      if (enf) {
        g.moveTo(-30, -20); g.lineTo(-12, -12); g.moveTo(30, -20); g.lineTo(12, -12); g.stroke();
        g.beginPath(); g.moveTo(-12, 16); g.quadraticCurveTo(0, 8, 12, 16); g.stroke();
      } else if (N.humor === "pillina") {
        g.moveTo(-30, -16); g.lineTo(-12, -18); g.moveTo(12, -18); g.lineTo(30, -12); g.stroke();
        g.beginPath(); g.moveTo(-14, 10); g.quadraticCurveTo(4, 22, 16, 8); g.stroke();
      } else { g.moveTo(-12, 10); g.quadraticCurveTo(0, 20, 12, 10); g.stroke(); }
    }
    g.restore();
  }

  dibujar(g) {
    const t = this.t, e = this.poses(), N = this.nube();
    fondo(g, "#000");
    g.drawImage(this.fondoC(), -60, -60);
    // se nubla un poco mientras llueve
    const oscuro = 0.2 * tramo(t, T_LLUEVE, T_LLUEVE + 0.4) * (1 - tramo(t, T_SOL, T_SOL + 0.4));
    // charco
    if (this.charco > 0.01) { g.fillStyle = `rgba(90,160,230,${0.6 * Math.min(1, this.charco * 2)})`; g.beginPath(); g.ellipse(e.xg, PIES + 2, 120 * this.charco + 30, 14, 0, 0, 6.283); g.fill(); }
    // manguera de Marcos
    const L = aPant(e.mM, e.M._manoD || e.M.manoD);
    g.strokeStyle = "#b8201a"; g.lineWidth = 11; g.lineCap = "round";
    g.beginPath(); g.moveTo(W + 40, 590); g.bezierCurveTo(960, 600, 900, 520, L[0] - 6, L[1] + 8); g.stroke();
    g.strokeStyle = "rgba(255,255,255,.25)"; g.lineWidth = 3; g.stroke();
    // rayos de sol hacia Guillermo (por detrás de los dos)
    const sol = tramo(t, T_SOL, T_SOL + 0.4);
    if (sol > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.22 * sol;
      g.fillStyle = "#ffe08a";
      g.beginPath(); g.moveTo(N.x - 50, N.y + 20); g.lineTo(N.x + 50, N.y + 20); g.lineTo(e.xg + 150, PIES); g.lineTo(e.xg - 150, PIES); g.closePath(); g.fill();
      g.restore();
    }
    pintarAvatar(g, e.mM, e.M, t);
    pintarAvatar(g, e.mG, e.G, t);
    // chorro hacia arriba
    if (t > T_RIEGA && t < T_NUBE + 0.1) {
      const k = tramo(t, T_RIEGA, T_RIEGA + 0.15) * (1 - tramo(t, T_NUBE - 0.1, T_NUBE + 0.1));
      const a = this.angLanza, ex = aPant(e.mM, [e.M._manoD[0] + Math.cos(a) * 26, e.M._manoD[1] + Math.sin(a) * 26]);
      const T = [N.x + 20, N.y + 30];
      g.save(); g.lineCap = "round";
      g.strokeStyle = "rgba(90,170,255,.5)"; g.lineWidth = 16 * k; g.beginPath(); g.moveTo(ex[0], ex[1]); g.quadraticCurveTo(ex[0] - 20, (ex[1] + T[1]) / 2, T[0], T[1]); g.stroke();
      g.strokeStyle = "rgba(235,250,255,.9)"; g.lineWidth = 5 * k; g.setLineDash([14, 20]); g.lineDashOffset = -t * 600; g.stroke();
      g.restore();
    }
    if (oscuro > 0) { g.fillStyle = `rgba(20,30,60,${oscuro})`; g.fillRect(-60, -60, W + 120, H + 120); }
    this.dibujarNube(g, N, t);
    // gotas
    g.fillStyle = "#4a9ef0";
    for (const d of this.gotas) { g.beginPath(); if (d.sp) g.arc(d.x, d.y, 2.6, 0, 6.283); else g.ellipse(d.x, d.y, 3, 10, 0, 0, 6.283); g.fill(); }
    g.fillStyle = "rgba(255,255,255,.75)";
    for (const d of this.gotas) if (!d.sp) { g.beginPath(); g.ellipse(d.x - 1, d.y - 3, 1, 3.5, 0, 0, 6.283); g.fill(); }
    this.p.dibujar(g);
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    ono("¡FSSSH!", 880, 260, T_RIEGA + 0.2, 0.9, 46, "#e8f6ff", "#123048", 0.08);
    ono("¡PLIC, PLIC!", 470, 250, T_LLUEVE + 0.3, 0.8, 42, "#bfeaff", "#0a2a48", -0.1);
    ono("¡OTRA VEZ!", 160, 220, T_IZQ + 0.5, 0.8, 42, "#fffdf5", "#1b1b1b", -0.06);
    ono("¡POP!", e.xg + 120, 210, T_PARAGUAS, 0.5, 52, "#ffd34d", "#5a1a00", 0.1);
    ono("¡GRRR!", N.x + 130, N.y - 10, T_ENFADA, 0.6, 46, "#c8d0e0", "#1b1b1b", 0.08);
    ono("¡SOLECITO!", 790, 250, T_SOL + 0.6, 1.8, 50, "#ffd34d", "#5a2a00", 0.06);
    // ¡QUE LLUEVA!
    if (t > T_LLUEVE && t < T_SOL + 0.2) {
      const d = t - T_LLUEVE, k = tramo(d, 0, 0.16), s = lerp(2, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7)), sal = tramo(t, T_SOL - 0.05, T_SOL + 0.2);
      const r = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - sal); g.translate(512, 528); g.rotate(-0.02); g.scale(s * 0.86, s * 0.86);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.5), tramo(t, T_FIN, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00244", nombre: "La nube de lluvia", crear: () => new NubeDeLluvia() });
})();
