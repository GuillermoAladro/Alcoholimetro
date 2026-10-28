"use strict";
/*
 * 00191 · FANTASMAS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Una casa vieja de noche, con luna y telarañas. Guillermo, con una vela, mira a todos lados con miedo. Entra Marcos
 * tapado con una sábana: «¡BUUU!». Guillermo pega un salto; Marcos se quita la sábana y se parten de risa… mientras
 * detrás sube un fantasma de verdad (de dibujos: azul pálido, con cola en espiral y un rizo). La vela se pone azul y
 * el fantasma hace ¡BUUU!: los dos saltan del susto y salen corriendo. El fantasma se ríe solo y se desvanece.
 */
(() => {
const cache = cacheTexto();
const ESC = 1.42;
const XG = 330, XM = 700, FXF = 512;
const T_ENTRA = 1.2, T_BU1 = 2.2, T_QUITA = 3.05, T_SUBE = 3.7, T_BU2 = 5.0, T_HUYEN = 5.85, T_RIE = 7.4;

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(700, 230), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 190);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#dcd6ff"); gr.addColorStop(1, "#8f7dff");
  txt(g, "¡BUUU!", 356, 182, { tam: 170, peso: 400, fam: FC, color: "#120a30", esp: 8 });
  txt(g, "¡BUUU!", 350, 174, { tam: 170, peso: 400, fam: FC, color: gr, borde: "#120a30", bordeAncho: 12, esp: 8, glow: "rgba(170,160,255,.95)", glowTam: 32 });
  cache.set("t", c);
  return c;
}
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

/** Vela en su candelero; (0,0) = la mano. azul 0–1 cambia el color de la llama. */
function vela(g, t, azul, apagada) {
  g.save();
  g.fillStyle = "#c9962a"; g.beginPath(); g.ellipse(0, 6, 15, 4, 0, 0, 6.283); g.fill();
  g.fillStyle = "#e0b040"; g.fillRect(-3, -4, 6, 10);
  g.strokeStyle = "#c9962a"; g.lineWidth = 2.5; g.beginPath(); g.arc(17, 2, 6, -1.4, 1.6); g.stroke();
  g.fillStyle = "#f6f0dc"; rectR(g, -5, -36, 10, 34, 2); g.fill();
  g.fillStyle = "rgba(255,255,255,.5)"; g.fillRect(-3, -34, 2.5, 30);
  g.fillStyle = "#3a2a1a"; g.fillRect(-0.6, -41, 1.2, 5);
  if (!apagada) {
    const h = 13 + 2 * Math.sin(t * 23) + Math.sin(t * 37);
    g.save(); g.translate(0.6 * Math.sin(t * 17), -41);
    g.fillStyle = azul > 0.5 ? "#7fe8ff" : "#ffcf4a";
    g.beginPath(); g.moveTo(0, -h); g.quadraticCurveTo(5, -4, 0, 1); g.quadraticCurveTo(-5, -4, 0, -h); g.fill();
    g.fillStyle = azul > 0.5 ? "#e8fbff" : "#fff6d0";
    g.beginPath(); g.moveTo(0, -h * 0.6); g.quadraticCurveTo(2.5, -2, 0, 0); g.quadraticCurveTo(-2.5, -2, 0, -h * 0.6); g.fill();
    g.restore();
  }
  g.restore();
}
/** Sábana sobre Marcos (coordenadas de avatar de Marcos). brazos 0–1 los levanta. */
function sabana(g, brazos, t) {
  g.save();
  const b = brazos, ond = Math.sin(t * 8) * 2;
  g.beginPath();
  g.moveTo(37, -4);
  g.bezierCurveTo(70, -4, 74, 30, 72 + 6 * b, 56 - 30 * b);
  g.quadraticCurveTo(88 + 10 * b, 40 - 40 * b, 92 + 6 * b, 50 - 34 * b);
  g.quadraticCurveTo(86, 110, 82, 190);
  for (let i = 0; i <= 6; i++) { const x = 82 - (i * 92) / 6; g.quadraticCurveTo(x + 7, 198 + ond * (i % 2 ? 1 : -1), x, 188 + (i % 2) * 6); }
  g.quadraticCurveTo(-12, 110, -18 - 6 * b, 50 - 34 * b);
  g.quadraticCurveTo(-14 - 10 * b, 40 - 40 * b, 2 - 6 * b, 56 - 30 * b);
  g.bezierCurveTo(0, 30, 4, -4, 37, -4);
  g.closePath();
  const gr = g.createLinearGradient(-10, 0, 90, 0);
  gr.addColorStop(0, "#c9ccd8"); gr.addColorStop(0.4, "#ffffff"); gr.addColorStop(1, "#b9bccb");
  g.fillStyle = gr; g.fill();
  g.strokeStyle = "#8a8ea0"; g.lineWidth = 1.5; g.stroke();
  g.strokeStyle = "rgba(120,124,150,.35)"; g.lineWidth = 2;
  for (const [x0, x1] of [[20, 12], [56, 64], [38, 36]]) { g.beginPath(); g.moveTo(x0, 80); g.quadraticCurveTo((x0 + x1) / 2 + 4, 140, x1, 186); g.stroke(); }
  // agujeros de los ojos
  g.fillStyle = "#14101e";
  g.beginPath(); g.ellipse(27, 45, 5.5, 7.5, 0, 0, 6.283); g.fill();
  g.beginPath(); g.ellipse(47, 45, 5.5, 7.5, 0, 0, 6.283); g.fill();
  if (b > 0.3) { g.beginPath(); g.ellipse(37, 64, 6, 7 * b, 0, 0, 6.283); g.fill(); }
  g.restore();
}
/** El fantasma de verdad: azul pálido, cola en espiral, rizo arriba. (0,0) = centro de la cabeza. */
function fantasma(g, k, bu, guino, t) {
  if (k <= 0) return;
  g.save();
  g.globalAlpha = k;
  // halo
  g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.55 * k; g.drawImage(BLOB2.cian, -170, -170, 340, 420); g.restore();
  const cola = Math.sin(t * 3) * 14;
  g.beginPath();
  g.moveTo(-82, 0);
  g.arc(0, 0, 82, Math.PI, 0);
  g.bezierCurveTo(84, 60, 60, 110, 30 + cola * 0.4, 150);
  g.bezierCurveTo(10 + cola, 190, 60 + cola, 230, 92 + cola, 200);
  g.bezierCurveTo(100 + cola, 186, 86 + cola, 172, 76 + cola, 186);
  g.bezierCurveTo(62 + cola, 206, 20 + cola, 214, -2 + cola * 0.5, 180);
  g.bezierCurveTo(-30, 140, -84, 80, -82, 0);
  g.closePath();
  const gr = g.createRadialGradient(-20, -30, 10, 0, 20, 170);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.55, "#dfe6ff"); gr.addColorStop(1, "#9aa6ff");
  g.fillStyle = gr; g.fill();
  g.strokeStyle = "rgba(120,110,230,.7)"; g.lineWidth = 3; g.stroke();
  // rizo de arriba
  g.strokeStyle = "#dfe6ff"; g.lineWidth = 10; g.lineCap = "round";
  g.beginPath(); g.moveTo(-6, -78); g.bezierCurveTo(-10, -112, 30, -118, 26, -96); g.bezierCurveTo(24, -86, 10, -88, 12, -98); g.stroke();
  // bracitos
  for (const s of [-1, 1]) {
    g.save(); g.translate(s * 74, 20); g.rotate(s * (0.5 - 1.6 * bu) + 0.15 * Math.sin(t * 5 + s));
    g.fillStyle = "#e6ecff"; g.beginPath(); g.ellipse(s * 22, 0, 26, 13, 0, 0, 6.283); g.fill();
    g.strokeStyle = "rgba(120,110,230,.6)"; g.lineWidth = 2.5; g.stroke();
    g.restore();
  }
  // carita
  g.fillStyle = "rgba(255,140,190,.45)";
  g.beginPath(); g.ellipse(-46, 18, 13, 8, 0, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(46, 18, 13, 8, 0, 0, 6.283); g.fill();
  for (const s of [-1, 1]) {
    const ex = s * 28, ey = -12;
    if (guino && s > 0) { g.strokeStyle = "#241a5a"; g.lineWidth = 5; g.beginPath(); g.arc(ex, ey + 4, 12, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); continue; }
    g.fillStyle = "#241a5a"; g.beginPath(); g.ellipse(ex, ey, 13, 17 + 3 * bu, 0, 0, 6.283); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(ex - 4, ey - 7, 4.5, 0, 6.283); g.fill(); g.beginPath(); g.arc(ex + 4, ey + 5, 2, 0, 6.283); g.fill();
    // ceja traviesa
    g.strokeStyle = "#7a6ae0"; g.lineWidth = 4;
    g.beginPath(); g.moveTo(ex - s * 13, ey - 22 + 7 * bu); g.lineTo(ex + s * 12, ey - 28 - 3 * bu); g.stroke();
  }
  g.fillStyle = "#241a5a";
  if (bu > 0.1) { g.beginPath(); g.ellipse(0, 36, 18 * bu + 6, 22 * bu + 4, 0, 0, 6.283); g.fill(); g.fillStyle = "#5a4ab0"; g.beginPath(); g.ellipse(0, 44 + 6 * bu, 10 * bu + 3, 8 * bu + 2, 0, 0, 6.283); g.fill(); }
  else { g.strokeStyle = "#241a5a"; g.lineWidth = 4; g.beginPath(); g.arc(0, 26, 14, 0.25, Math.PI - 0.25); g.stroke(); }
  g.restore();
}

class Fantasmas extends Escena {
  constructor() {
    super(10);
    this.p = new Parts(320);
    this.fondoC = null; this.velo = null;
  }
  xs() {
    const t = this.t;
    let g = XG, m = lerp(1120, XM, eOut(tramo(t, T_ENTRA, T_BU1 - 0.1)));
    if (t > T_HUYEN) {
      m = lerp(XM, -200, eIn(tramo(t, T_HUYEN, T_HUYEN + 0.25)) * 0.15 + tramo(t, T_HUYEN, T_HUYEN + 1.0) * 0.85);
      g = lerp(XG, -220, eIn(tramo(t, T_HUYEN + 0.1, T_HUYEN + 0.35)) * 0.15 + tramo(t, T_HUYEN + 0.1, T_HUYEN + 1.1) * 0.85);
    }
    return [g, m];
  }
  fantasmaEst() {
    const t = this.t;
    const k = eInOut(tramo(t, T_SUBE, T_SUBE + 1.0)) * (1 - eInOut(tramo(t, 8.7, 9.4)));
    const y = lerp(470, 252, eOut(tramo(t, T_SUBE, T_SUBE + 1.1))) + 8 * Math.sin(t * 2.2);
    const bu = Math.sin(Math.PI * tramo(t, T_BU2 - 0.1, T_BU2 + 0.75)) * (t < T_BU2 + 0.75 ? 1 : 0);
    const s = 1 + 0.22 * bu;
    const rie = t > T_RIE && t < 8.8;
    return { x: FXF + (rie ? 6 * Math.sin(t * 20) : 0), y: y + (rie ? -Math.abs(Math.sin(t * 10)) * 8 : 0), k, bu, s, guino: t > 8.1 && t < 8.9, rie };
  }
  /** La sábana: { x, y, r, s } en pantalla cuando ya no la lleva Marcos. */
  sabanaSuelta() {
    const t = this.t;
    if (t < T_QUITA) return null;
    const u = tramo(t, T_QUITA, T_QUITA + 0.9);
    const x = lerp(XM, 880, u), y = lerp(PIES - 330, PIES - 50, u * u) - 160 * Math.sin(u * Math.PI);
    return { x, y, r: lerp(0, 0.6, u), k: u };
  }
  poses() {
    const t = this.t, [xg, xm] = this.xs();
    const G = { cara: "sorpresa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [72, 108], manoI: [9, 160] };
    const M = { quien: "marcos", cara: "guino", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let yg = PIES, ym = PIES, gg = 0, gm = 0, brazos = 0;
    // Guillermo mira a todos lados
    if (t < T_BU1) { G.rc = 0.22 * Math.sin(t * 3.2); G.cara = t < 0.8 ? "sonrisa" : "sorpresa"; yg += Math.sin(t * 60) * 0.8; }
    // Marcos entra a hurtadillas con la sábana
    if (t > T_ENTRA && t < T_BU1 - 0.1) { const a = andar(t * 8, 0.8); M.piernaI = a.piernaI; M.piernaD = a.piernaD; ym += a.bote * 0.6; }
    if (t > T_BU1 - 0.15 && t < T_QUITA) brazos = eOut(tramo(t, T_BU1 - 0.15, T_BU1 + 0.05));
    // susto de Guillermo
    if (t > T_BU1 + 0.08 && t < T_QUITA + 0.2) {
      const u = tramo(t, T_BU1 + 0.08, T_BU1 + 0.6);
      yg -= 90 * Math.sin(u * Math.PI); G.puntas = 1 - tramo(t, T_QUITA, T_QUITA + 0.3);
      G.piernaI = [-10 * Math.sin(u * Math.PI), 0.3]; G.piernaD = [-10 * Math.sin(u * Math.PI), -0.3];
      G.manoI = [-18, 70]; G.manoD = [86, 80]; G.cara = "sorpresa"; G.rc = -0.18; gg = -0.1 * Math.sin(u * Math.PI);
    }
    // Marcos se quita la sábana: se ríen los dos
    if (t >= T_QUITA) {
      M.cara = "risa"; M.rc = -0.12 + 0.05 * Math.sin(t * 14);
      const k = eOut(tramo(t, T_QUITA, T_QUITA + 0.25)) * (1 - eOut(tramo(t, T_QUITA + 0.35, T_QUITA + 0.6)));
      M.manoD = mezcla([67, 152], [74, 30], k); M.manoI = mezcla([6, 152], [0, 30], k);
      if (t > T_QUITA + 0.3) { G.cara = "risa"; G.rc = 0.14 + 0.05 * Math.sin(t * 13); G.manoI = [-4, 128 + 6 * Math.sin(t * 13)]; }
      if (t > T_QUITA + 0.55) { M.manoD = [56, 120 + 5 * Math.sin(t * 13)]; M.manoI = [16, 122 + 5 * Math.sin(t * 13 + 1)]; ym -= Math.abs(Math.sin(t * 13)) * 4; yg -= Math.abs(Math.sin(t * 13 + 1)) * 4; }
    }
    // ¡BUUU! de verdad
    if (t > T_BU2 && t < T_HUYEN + 0.1) {
      const u = tramo(t, T_BU2 + 0.05, T_BU2 + 0.5);
      const sal = 70 * Math.sin(u * Math.PI);
      yg -= sal; ym -= sal * 1.1;
      G.cara = "sorpresa"; M.cara = "sorpresa"; G.puntas = 1; M.puntas = 1;
      G.rc = 0.2; M.rc = -0.2;
      G.manoI = [-18, 66]; G.manoD = [86, 70]; M.manoD = [80, 70]; M.manoI = [-6, 70];
      G.piernaI = [-10 * Math.sin(u * Math.PI), 0.3]; G.piernaD = [-10 * Math.sin(u * Math.PI), -0.3];
      M.piernaI = [-10 * Math.sin(u * Math.PI), 0.3]; M.piernaD = [-10 * Math.sin(u * Math.PI), -0.3];
      gg = 0.04 * Math.sin(t * 60); gm = -0.04 * Math.sin(t * 60);
    }
    // salen corriendo
    if (t >= T_HUYEN) {
      const a = andar(t * 24, 1.8), b = andar(t * 24 + 1.4, 1.8);
      G.piernaI = a.piernaI; G.piernaD = a.piernaD; yg += a.bote; M.piernaI = b.piernaI; M.piernaD = b.piernaD; ym += b.bote;
      const s = Math.sin(t * 24);
      G.manoI = [-14 - 10 * s, 70]; G.manoD = [80 + 6 * s, 104]; M.manoD = [80 + 8 * s, 66]; M.manoI = [-8 - 8 * s, 70];
      G.cara = "sorpresa"; M.cara = "sorpresa"; G.puntas = 1; M.puntas = 1; gg = 0.12; gm = 0.12; G.rc = 0.15; M.rc = 0.15;
    }
    const mG = matAv(xg, yg, ESC, gg), mM = matAv(xm, ym, ESC, gm);
    const azul = t > T_SUBE + 0.4 ? 1 : 0;
    G.objD2 = (g, mano) => { g.save(); g.translate(mano[0], mano[1] - 2); vela(g, t, azul, false); g.restore(); };
    const conSabana = t < T_QUITA;
    if (conSabana) M.manoD = [67, 140];
    return { G, M, mG, mM, conSabana, brazos, azul };
  }

  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("bu1", t > T_BU1, () => temblar(6, 0.2));
    this.una("quita", t > T_QUITA, () => { for (let i = 0; i < 12; i++) p.nueva(P.POLVO, XM + azar(-50, 50), PIES - 200 + azar(-60, 60), azar(-80, 80), azar(-80, 20), azar(0.5, 0.9), azar(20, 34)); });
    this.una("sube", t > T_SUBE + 0.4, () => { for (let i = 0; i < 16; i++) p.nueva(P.ELECTRICA, FXF + azar(-60, 60), 380 + azar(-60, 60), azar(-60, 60), azar(-80, -10), azar(0.6, 1.1), azar(16, 28)); });
    if (t > T_SUBE && t < 9.2 && Math.random() < 8 * dt) { const F = this.fantasmaEst(); p.nueva(P.ELECTRICA, F.x + azar(-70, 70), F.y + azar(40, 200), azar(-20, 20), azar(-60, -20), azar(0.6, 1.2), azar(10, 18)); }
    this.una("bu2", t > T_BU2, () => {
      temblar(20, 0.6);
      p.nueva(P.DESTELLO, FXF, 260, 0, 0, 0.4, 300);
      for (let i = 0; i < 30; i++) { const a = azar(0, 6.283), v = azar(160, 460); p.nueva(P.ELECTRICA, FXF, 280, Math.cos(a) * v, Math.sin(a) * v, azar(0.5, 1), azar(14, 24)); }
    });
    if (t > T_HUYEN && t < T_HUYEN + 1.3 && Math.random() < 30 * dt) { const [xg, xm] = this.xs(); for (const x of [xg, xm]) if (x > -60) p.nueva(P.POLVO, x + azar(10, 40), PIES - 4, azar(40, 140), azar(-40, -5), azar(0.4, 0.8), azar(20, 34)); }
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, 480);
    gc.addColorStop(0, "#1a1430"); gc.addColorStop(1, "#2e2448");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, 540);
    // papel pintado
    g.fillStyle = "rgba(255,255,255,.035)";
    for (let x = -40; x < W + 60; x += 70) for (let y = -40; y < 480; y += 70) { g.beginPath(); g.moveTo(x, y - 12); g.lineTo(x + 9, y); g.lineTo(x, y + 12); g.lineTo(x - 9, y); g.closePath(); g.fill(); }
    g.fillStyle = "rgba(255,255,255,.05)"; for (let x = 0; x < W; x += 70) g.fillRect(x + 34, -60, 3, 540);
    // ventana con luna
    const wx = 512, wy = 150;
    g.fillStyle = "#0a1a3a"; g.beginPath(); g.moveTo(wx - 110, wy + 150); g.lineTo(wx - 110, wy - 40); g.arc(wx, wy - 40, 110, Math.PI, 0); g.lineTo(wx + 110, wy + 150); g.closePath(); g.fill();
    g.save(); g.clip();
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.6; g.drawImage(BLOB.blanco, wx - 30, wy - 150, 200, 200); g.restore();
    g.fillStyle = "#fff8dc"; g.beginPath(); g.arc(wx + 60, wy - 50, 46, 0, 6.283); g.fill();
    g.fillStyle = "rgba(220,210,170,.6)"; for (const [x, y, r] of [[wx + 46, wy - 62, 8], [wx + 76, wy - 34, 6], [wx + 70, wy - 70, 4]]) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
    g.strokeStyle = "#05070f"; g.lineWidth = 7; g.lineCap = "round";
    g.beginPath(); g.moveTo(wx - 60, wy + 160); g.lineTo(wx - 40, wy + 20); g.lineTo(wx - 80, wy - 40); g.moveTo(wx - 40, wy + 20); g.lineTo(wx + 10, wy - 30); g.lineTo(wx + 20, wy - 80); g.moveTo(wx + 10, wy - 30); g.lineTo(wx + 60, wy - 10); g.stroke();
    g.restore();
    g.strokeStyle = "#4a3a2a"; g.lineWidth = 12;
    g.beginPath(); g.moveTo(wx - 110, wy + 150); g.lineTo(wx - 110, wy - 40); g.arc(wx, wy - 40, 110, Math.PI, 0); g.lineTo(wx + 110, wy + 150); g.closePath(); g.stroke();
    g.lineWidth = 6; g.beginPath(); g.moveTo(wx, wy - 150); g.lineTo(wx, wy + 150); g.moveTo(wx - 110, wy + 30); g.lineTo(wx + 110, wy + 30); g.stroke();
    g.fillStyle = "#5a4630"; g.fillRect(wx - 130, wy + 148, 260, 14);
    // cuadro torcido (paisaje)
    g.save(); g.translate(170, 170); g.rotate(-0.08);
    g.fillStyle = "#6a4a1a"; g.fillRect(-60, -46, 120, 92); g.fillStyle = "#2a3a4a"; g.fillRect(-48, -34, 96, 68);
    g.fillStyle = "#3a5a4a"; g.beginPath(); g.moveTo(-48, 34); g.lineTo(-10, -8); g.lineTo(20, 14); g.lineTo(48, -4); g.lineTo(48, 34); g.closePath(); g.fill();
    g.restore();
    // reloj de pared
    g.fillStyle = "#3a2614"; rectR(g, 820, 120, 90, 300, 10); g.fill();
    g.fillStyle = "#e8dcc0"; g.beginPath(); g.arc(865, 180, 32, 0, 6.283); g.fill();
    g.strokeStyle = "#3a2614"; g.lineWidth = 3; g.beginPath(); g.moveTo(865, 180); g.lineTo(865, 158); g.moveTo(865, 180); g.lineTo(880, 186); g.stroke();
    g.fillStyle = "#1a1008"; rectR(g, 840, 240, 50, 150, 6); g.fill();
    // telarañas
    for (const [x, y, sx, sy] of [[-60, -60, 1, 1], [W + 60, -60, -1, 1]]) {
      g.save(); g.translate(x, y); g.scale(sx, sy);
      g.strokeStyle = "rgba(220,220,240,.4)"; g.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) { const a = (i / 5) * (Math.PI / 2); g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 220, Math.sin(a) * 220); g.stroke(); }
      for (let r = 50; r <= 210; r += 40) { g.beginPath(); for (let i = 0; i <= 5; i++) { const a = (i / 5) * (Math.PI / 2); const rr = r - 8 * Math.sin(i * 1.7); if (i) g.quadraticCurveTo(Math.cos(a - 0.15) * rr * 0.9, Math.sin(a - 0.15) * rr * 0.9, Math.cos(a) * rr, Math.sin(a) * rr); else g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.stroke(); }
      g.restore();
    }
    // suelo de madera
    const gs = g.createLinearGradient(0, 480, 0, H + 60);
    gs.addColorStop(0, "#3a2818"); gs.addColorStop(1, "#1a1008");
    g.fillStyle = gs; g.fillRect(-60, 480, W + 120, H);
    g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = 2;
    for (let y = 500; y < H + 40; y += 26) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    g.fillStyle = "#4a3420"; g.fillRect(-60, 474, W + 120, 10);
    this.fondoC = c;
    return c;
  }
  veloOscuro() {
    if (this.velo) return this.velo;
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    const gr = g.createRadialGradient(W / 2, H * 0.55, 160, W / 2, H / 2, 640);
    gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,.75)");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    this.velo = c;
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses(), F = this.fantasmaEst();
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    // el fantasma (detrás de los dos)
    g.save(); g.translate(F.x, F.y); g.scale(F.s, F.s); fantasma(g, F.k, F.bu, F.guino, t); g.restore();
    // sábana tirada
    const S = this.sabanaSuelta();
    if (S) {
      g.save(); g.translate(S.x, S.y); g.rotate(S.r);
      const k = S.k, aplast = eIn(tramo(k, 0.75, 1));
      g.scale(ESC * (1 + 0.3 * aplast), ESC * (1 - 0.75 * aplast)); g.translate(-37, -95);
      sabana(g, 0.6 * (1 - aplast), t);
      g.restore();
    }
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    if (e.conSabana) conMat(g, e.mM, () => sabana(g, e.brazos, t));
    // luz de la vela de Guillermo
    const mv = e.G._manoD ? aPant(e.mG, [e.G._manoD[0], e.G._manoD[1] - 45]) : null;
    g.drawImage(this.veloOscuro(), 0, 0);
    if (mv && mv[0] > -100) {
      g.save(); g.globalCompositeOperation = "lighter";
      g.globalAlpha = 0.35 + 0.05 * Math.sin(t * 23);
      g.drawImage(e.azul ? BLOB2.cian : BLOB2.oro, mv[0] - 150, mv[1] - 150, 300, 300);
      g.restore();
    }
    this.p.dibujar(g);
    // «¡BUUU!» de Marcos (bocadillo)
    if (t > T_BU1 && t < T_QUITA) {
      const q = aPant(e.mM, [37, 0]);
      bocadillo(g, q[0] + 40, q[1] - 70, "¡BUUU!", q[0] + 10, q[1] - 10, tramo(t, T_BU1, T_BU1 + 0.2) * (1 - tramo(t, T_QUITA - 0.15, T_QUITA)), 44);
    }
    // ¡BUUU! del fantasma (el grande)
    if (t > T_BU2 && t < T_RIE + 0.2) {
      const d = t - T_BU2, k = tramo(d, 0, 0.18), sal = tramo(t, T_RIE - 0.2, T_RIE + 0.2);
      const s = lerp(2.6, 1, eIn(k)) * (1 + 0.04 * Math.sin(d * 16)) * (1 - 0.4 * sal);
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - sal); g.translate(512 + 5 * Math.sin(d * 21), 92); g.rotate(-0.04 + 0.03 * Math.sin(d * 7)); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // el fantasma se ríe
    if (F.rie) {
      const k = tramo(t, T_RIE, T_RIE + 0.2) * (1 - tramo(t, 8.5, 8.8));
      bocadillo(g, F.x + 170, F.y - 150, "¡JI, JI!", F.x + 70, F.y - 70, k, 40);
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.5), tramo(t, 9.35, this.dur - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00191", nombre: "Fantasmas", crear: () => new Fantasmas() });
})();
