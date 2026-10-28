"use strict";
/*
 * 00241 · ROBOT BOMBERO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Guillermo aprieta el último tornillo (¡CLONC!) de su invento, un robot bombero (diseño propio: cabeza de caja,
 * brazo de acordeón con lanza), y lo enciende: ¡BIP, BIP! Tiene que apagar una vela… y moja a Marcos, a Guillermo,
 * el techo y el suelo, pero la vela sigue tan tranquila. Al final se apunta a sí mismo, echa chispas (¡BZZZT!) y se
 * queda frito. Marcos, chorreando, va a la vela y la apaga de un soplido.
 */
(() => {
const CT = cacheTexto();
const ESC = 1.4, XG = 236, XM0 = 862, XM1 = 790;
const RX = 474, RS = 1.0;                                  // el robot
const VX = 664, MESA_Y = 452;                              // la vela en su mesita
const T_ON = 1.45, T_APUNTA = 2.15, T_M = 2.5, T_M1 = 3.2, T_G = 3.4, T_G1 = 4.0, T_TODO = 4.1, T_TODO1 = 5.05,
  T_SI = 5.2, T_ZAP = 5.5, T_ANDA = 6.05, T_SOPLA = 6.75, T_APAGA = 7.05, T_FIN = 9.35, DUR = 9.85;
const CLONCS = [0.5, 0.8, 1.1];
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

function rotulo() {
  if (CT.has("t")) return CT.get("t");
  const c = lienzoNuevo(700, 200), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 160);
  gr.addColorStop(0, "#f2fff6"); gr.addColorStop(0.5, "#8dffab"); gr.addColorStop(1, "#2bff5b");
  g.save(); g.translate(350, 150); g.rotate(-0.04);
  txt(g, "¡BIP, BIP!", 6, 8, { tam: 140, peso: 400, fam: FC, color: "#02200c", esp: 6 });
  txt(g, "¡BIP, BIP!", 0, 0, { tam: 140, peso: 400, fam: FC, color: gr, borde: "#03230c", bordeAncho: 12, esp: 6, glow: "rgba(43,255,91,.85)", glowTam: 24 });
  g.restore();
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
/** Chorro de agua en arco de S a T. */
function chorro(g, S, T, alto, k, t) {
  if (k <= 0.01) return;
  const n = 24, pts = [];
  for (let i = 0; i <= n; i++) { const u = i / n; pts.push([lerp(S[0], T[0], u), lerp(S[1], T[1], u) - alto * 4 * u * (1 - u)]); }
  g.save(); g.lineCap = "round"; g.lineJoin = "round";
  g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
  g.strokeStyle = "rgba(90,170,255,.45)"; g.lineWidth = 16 * k; g.stroke();
  g.strokeStyle = "rgba(170,225,255,.85)"; g.lineWidth = 8 * k; g.stroke();
  g.setLineDash([14, 22]); g.lineDashOffset = -t * 600; g.strokeStyle = "rgba(255,255,255,.95)"; g.lineWidth = 3 * k; g.stroke();
  g.restore();
}

// ------------------------------------------------------------------------------------------- el robot
const AMA = "#f2a51b", AMA_O = "#8a5200";
/**
 * R: { x, y, s, ojos: "off" | "on" | "feliz" | "x" | "espiral", luz 0–1, brazo (ángulo del brazo-lanza), largo,
 *      dir (hacia dónde apunta la lanza), tiembla 0–1, hollin 0–1, antena (caída 0–1) }
 */
function robot(g, R, t) {
  const tb = R.tiembla ? Math.sin(t * 70) * 3 * R.tiembla : 0;
  g.save(); g.translate(R.x + tb, R.y); g.scale(R.s, R.s);
  g.lineJoin = "round"; g.lineCap = "round";
  g.fillStyle = "rgba(0,0,0,.3)"; g.beginPath(); g.ellipse(0, 2, 80, 9, 0, 0, 6.283); g.fill();
  // piernas
  for (const x of [-24, 24]) {
    g.fillStyle = "#6a737b"; g.fillRect(x - 9, -56, 18, 50);
    g.fillStyle = "#3a3d42"; for (let y = -50; y < -8; y += 9) g.fillRect(x - 10, y, 20, 3);
    const gp = g.createLinearGradient(0, -14, 0, 0); gp.addColorStop(0, "#ffc24a"); gp.addColorStop(1, "#b06a00");
    g.fillStyle = gp; rectR(g, x - 22, -14, 44, 15, 6); g.fill(); g.strokeStyle = AMA_O; g.lineWidth = 2; g.stroke();
  }
  // brazo izquierdo (pinza), por detrás
  acordeon(g, [-52, -150], [-74, -92], [-80, -128], 13);
  g.fillStyle = "#3a3d42";
  g.beginPath(); g.moveTo(-82, -92); g.lineTo(-90, -74); g.lineTo(-84, -72); g.lineTo(-76, -88); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-68, -92); g.lineTo(-60, -74); g.lineTo(-66, -72); g.lineTo(-72, -88); g.closePath(); g.fill();
  // cuerpo
  const gc = g.createLinearGradient(-58, 0, 58, 0);
  gc.addColorStop(0, "#b06a00"); gc.addColorStop(0.3, AMA); gc.addColorStop(0.55, "#ffd77a"); gc.addColorStop(1, "#a86000");
  g.fillStyle = gc; rectR(g, -58, -176, 116, 124, 16); g.fill();
  g.strokeStyle = AMA_O; g.lineWidth = 3; g.stroke();
  // bandas reflectantes (para ir a juego con Marcos)
  g.fillStyle = "#dfe6ea"; g.fillRect(-58, -78, 116, 9);
  g.fillStyle = "#e9f227"; g.fillRect(-58, -79, 116, 2); g.fillRect(-58, -70, 116, 2);
  // panel del pecho
  g.fillStyle = "#26282c"; rectR(g, -36, -158, 72, 58, 8); g.fill();
  const on = R.ojos !== "off";
  const cols = ["#ff3a3a", "#2bff5b", "#ffd34d", "#2fe3e8"];
  for (let i = 0; i < 4; i++) {
    const enc = on && (R.ojos !== "x" ? Math.sin(t * 9 + i * 1.7) > -0.2 : Math.random() > 0.5);
    g.fillStyle = enc ? cols[i] : "#4a4d52"; g.beginPath(); g.arc(-22 + i * 15, -142, 5, 0, 6.283); g.fill();
  }
  g.fillStyle = on ? "#0b3a1a" : "#1b1d20"; rectR(g, -26, -128, 52, 20, 4); g.fill();
  if (on) {
    g.strokeStyle = R.ojos === "x" ? "#ff3a3a" : "#2bff5b"; g.lineWidth = 2;
    g.beginPath(); for (let i = 0; i <= 20; i++) { const x = -24 + i * 2.4, y = -118 + (R.ojos === "x" ? 0 : Math.sin(i * 0.9 + t * 12) * 6); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  }
  // tornillos
  g.fillStyle = "#c9cfd4"; for (const [x, y] of [[-48, -166], [48, -166], [-48, -62], [48, -62]]) { g.beginPath(); g.arc(x, y, 4, 0, 6.283); g.fill(); }
  // cuello
  g.fillStyle = "#6a737b"; g.fillRect(-12, -192, 24, 18);
  g.fillStyle = "#3a3d42"; g.fillRect(-13, -186, 26, 3); g.fillRect(-13, -180, 26, 3);
  // cabeza
  g.save(); g.translate(0, -192); g.rotate(R.cabeza || 0);
  const gh = g.createLinearGradient(-46, 0, 46, 0);
  gh.addColorStop(0, "#b06a00"); gh.addColorStop(0.35, AMA); gh.addColorStop(0.6, "#ffd77a"); gh.addColorStop(1, "#a86000");
  g.fillStyle = gh; rectR(g, -46, -72, 92, 72, 14); g.fill(); g.strokeStyle = AMA_O; g.lineWidth = 3; g.stroke();
  // orejas
  g.fillStyle = "#6a737b"; rectR(g, -54, -48, 10, 26, 3); g.fill(); rectR(g, 44, -48, 10, 26, 3); g.fill();
  // antena
  const ca = R.antena || 0;
  g.strokeStyle = "#3a3d42"; g.lineWidth = 3.5;
  const pa = [lerp(0, 26, ca), lerp(-104, -80, ca)];
  g.beginPath(); g.moveTo(0, -72); g.quadraticCurveTo(lerp(0, 22, ca), lerp(-92, -78, ca), pa[0], pa[1]); g.stroke();
  const luz = R.luz || 0;
  if (luz > 0.05) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = luz; g.drawImage(BLOB.rojo, pa[0] - 22, pa[1] - 22, 44, 44); g.restore(); }
  g.fillStyle = luz > 0.5 ? "#ff5a4a" : "#7a1a14"; g.beginPath(); g.arc(pa[0], pa[1], 7, 0, 6.283); g.fill();
  // visor y ojos
  g.fillStyle = "#14161a"; rectR(g, -36, -60, 72, 38, 10); g.fill();
  ojosRobot(g, R.ojos, t);
  // boca (rejilla)
  g.fillStyle = "#3a3d42"; for (let i = 0; i < 5; i++) g.fillRect(-16 + i * 7, -16, 4, 9);
  // hollín
  if (R.hollin > 0.02) {
    g.fillStyle = `rgba(20,16,14,${0.75 * R.hollin})`;
    for (const [x, y, r] of [[-20, -66, 16], [14, -62, 18], [32, -40, 12], [-34, -30, 12], [0, -8, 10]]) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
  }
  g.restore();
  // brazo-lanza (por delante)
  const S = [54, -150], a = R.brazo, L = R.largo;
  const H = [S[0] + Math.cos(a) * L, S[1] + Math.sin(a) * L];
  const C = [S[0] + Math.cos(a - 0.5) * L * 0.55 + 10, S[1] + Math.sin(a - 0.5) * L * 0.55 + 20];
  acordeon(g, S, H, C, 15);
  g.save(); g.translate(H[0], H[1]); g.rotate(R.dir);
  const gl = g.createLinearGradient(0, -9, 0, 9); gl.addColorStop(0, "#fff0a0"); gl.addColorStop(0.5, "#d9a516"); gl.addColorStop(1, "#7a5200");
  g.fillStyle = "#3a3d42"; rectR(g, -10, -12, 16, 24, 4); g.fill();
  g.fillStyle = gl; g.beginPath(); g.moveTo(4, -9); g.lineTo(34, -5); g.lineTo(34, 5); g.lineTo(4, 9); g.closePath(); g.fill();
  g.fillStyle = "#1b1b1d"; g.fillRect(32, -6, 5, 12);
  g.restore();
  g.restore();
  return [R.x + tb + (H[0] + Math.cos(R.dir) * 36) * R.s, R.y + (H[1] + Math.sin(R.dir) * 36) * R.s];
}
function acordeon(g, A, B, C, w) {
  g.strokeStyle = "#4a4d52"; g.lineWidth = w + 3;
  g.beginPath(); g.moveTo(A[0], A[1]); g.quadraticCurveTo(C[0], C[1], B[0], B[1]); g.stroke();
  g.strokeStyle = "#9aa3ab"; g.lineWidth = w;
  g.stroke();
  g.strokeStyle = "#5d656e"; g.lineWidth = 2;
  for (let i = 1; i < 10; i++) {
    const u = i / 10, v = 1 - u;
    const x = v * v * A[0] + 2 * v * u * C[0] + u * u * B[0], y = v * v * A[1] + 2 * v * u * C[1] + u * u * B[1];
    const dx = 2 * v * (C[0] - A[0]) + 2 * u * (B[0] - C[0]), dy = 2 * v * (C[1] - A[1]) + 2 * u * (B[1] - C[1]), d = Math.hypot(dx, dy) || 1;
    g.beginPath(); g.moveTo(x - (dy / d) * w * 0.55, y + (dx / d) * w * 0.55); g.lineTo(x + (dy / d) * w * 0.55, y - (dx / d) * w * 0.55); g.stroke();
  }
}
function ojosRobot(g, modo, t) {
  if (modo === "off") return;
  g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5;
  g.drawImage(BLOB2.cian, -44, -66, 88, 50);
  g.restore();
  g.strokeStyle = "#7af4ff"; g.fillStyle = "#7af4ff"; g.lineWidth = 4;
  for (const x of [-16, 16]) {
    g.beginPath();
    if (modo === "on") { const parp = (t % 2.2) < 0.08; g.ellipse(x, -41, 8, parp ? 1.5 : 9, 0, 0, 6.283); g.fill(); }
    else if (modo === "feliz") { g.arc(x, -37, 8, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    else if (modo === "x") { g.moveTo(x - 7, -48); g.lineTo(x + 7, -34); g.moveTo(x + 7, -48); g.lineTo(x - 7, -34); g.stroke(); }
    else if (modo === "espiral") {
      for (let i = 0; i <= 24; i++) { const a = i * 0.55 + t * 6 * (x > 0 ? 1 : -1), r = i * 0.38; const px = x + Math.cos(a) * r, py = -41 + Math.sin(a) * r; i ? g.lineTo(px, py) : g.moveTo(px, py); }
      g.lineWidth = 2.5; g.stroke();
    }
  }
}
/** Llave inglesa en la mano (unidades de avatar). */
function llave(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.fillStyle = "#b9c0c6"; rectR(g, -3, -30, 6, 36, 2.5); g.fill();
  g.beginPath(); g.arc(0, -32, 7, 0, 6.283); g.fill();
  g.fillStyle = "#e8edf0"; g.fillRect(-1.5, -26, 1.5, 28);
  g.fillStyle = "#2a2a2e"; g.fillRect(-3, -40, 6, 8);
  g.restore();
}

class RobotBombero extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(360);
    this.gotas = [];
    this.goteo = { G: 0, M: 0 };
  }
  /** Dónde apunta el robot en cada momento: { brazo, dir, agua (0–1), obj } */
  apunta() {
    const t = this.t;
    const S = [RX + 54 * RS, PIES - 150 * RS];
    const hacia = (q) => Math.atan2(q[1] - S[1], q[0] - S[0]);
    const aM = hacia([XM0 - 4, 238]), aG = hacia([XG + 6, 300]);
    let brazo = 0.9, agua = 0, obj = null, largo = 92;
    if (t > T_APUNTA - 0.3) brazo = lerp(0.9, aM, eInOut(tramo(t, T_APUNTA - 0.3, T_M)));
    if (t > T_M && t < T_M1) { agua = 1; obj = [XM0 - 4, 238]; }
    // de Marcos a Guillermo, pasando por encima de la cabeza
    if (t > T_M1) brazo = lerp(aM, aG, eInOut(tramo(t, T_M1, T_G)));
    if (t > T_G && t < T_G1) { agua = 1; obj = [XG + 6, 300]; }
    // barrido: pared, suelo… todo menos la vela (se queda corto justo antes)
    const b0 = aG - 3.1;
    if (t > T_G1) { brazo = lerp(aG, b0, eInOut(tramo(t, T_TODO, T_TODO1))); if (t > T_TODO && t < T_TODO1) agua = 1; }
    let dir = brazo;
    if (t > T_TODO1) {
      // se apunta a sí mismo: brazo arriba a la derecha y la lanza girada hacia su cara
      const k = eInOut(tramo(t, T_TODO1, T_SI));
      brazo = lerp(b0, -1.25 - 2 * Math.PI, k); dir = lerp(b0, 2.91 - 4 * Math.PI, k); largo = lerp(92, 110, k);
      if (t > T_SI && t < T_ZAP + 0.3) agua = 1;
      if (t > T_ZAP + 0.4) {
        const kk = eOut(tramo(t, T_ZAP + 0.4, T_ZAP + 1));
        brazo = lerp(-1.25 - 2 * Math.PI, 1.3 - 2 * Math.PI, kk); dir = lerp(2.91 - 4 * Math.PI, 1.5 - 4 * Math.PI, kk); largo = lerp(110, 92, kk);
      }
    }
    return { brazo, dir, agua, obj, largo };
  }
  estadoRobot() {
    const t = this.t, A = this.apunta();
    const R = { x: RX, y: PIES, s: RS, ojos: t < T_ON ? "off" : "on", luz: t > T_ON ? 0.5 + 0.5 * Math.sin(t * 12) : 0, brazo: A.brazo, largo: A.largo, dir: A.dir, tiembla: 0, hollin: 0, antena: 0, cabeza: 0 };
    if (t > T_ON && t < T_ON + 0.5) R.tiembla = 0.5 * (1 - tramo(t, T_ON, T_ON + 0.5));
    if (t > T_M && t < T_TODO1) R.ojos = "feliz";
    if (t > T_ZAP) {
      const k = 1 - tramo(t, T_ZAP + 0.6, T_ZAP + 1.4);
      R.ojos = t < T_ZAP + 1.2 ? "x" : "espiral"; R.tiembla = k; R.hollin = eOut(tramo(t, T_ZAP, T_ZAP + 0.3));
      R.luz = Math.random() > 0.5 ? 0.9 : 0.1; R.antena = eOut(tramo(t, T_ZAP + 0.6, T_ZAP + 1.2));
      if (t > T_ZAP + 1.2) { R.luz = 0.25 + 0.2 * Math.sin(t * 3); R.cabeza = 0.12 * eOut(tramo(t, T_ZAP + 1.2, T_ZAP + 1.6)); }
      if (t > T_APAGA + 0.8) R.cabeza = 0.12 + 0.03 * Math.sin(t * 4);
      // se reinicia, contento (con la antena torcida y tiznado)
      if (t > T_APAGA + 0.9) { R.ojos = "feliz"; R.luz = 0.5 + 0.5 * Math.sin(t * 12); R.cabeza = 0.04 * Math.sin(t * 6); R.tiembla = 0.15 * (1 - tramo(t, T_APAGA + 0.9, T_APAGA + 1.2)); }
    }
    return R;
  }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "bombero", cara: "sonrisa", rc: -0.05, piernaI: [0, 0], piernaD: [0, 0], manoD: [44, 118], manoI: [28, 120], brazoIDelante: true };
    let xm = XM0, dyM = 0, giroM = 0, syM = 1, dyG = 0, giroG = 0;
    const mG0 = matAv(XG, PIES, ESC);
    // ---- Guillermo aprieta el tornillo con la llave
    if (t < T_ON + 0.2) {
      let gir = 0;
      for (const c of CLONCS) if (t > c - 0.25 && t < c + 0.1) gir = Math.sin(tramo(t, c - 0.25, c + 0.1) * Math.PI) * 0.9;
      const obj = enAv(mG0, [RX - 52, PIES - 164]);
      G.manoD = [obj[0], obj[1]]; G.cara = gir > 0.3 ? "dormido" : "guino"; G.rc = 0.1;
      G.objD = (g, mano) => llave(g, mano[0], mano[1], 0.5 - gir);
      G.manoI = [-4, 112];
      M.cara = "sonrisa"; M.rc = -0.1;
    } else if (t < T_M) {
      // ¡funciona! se aparta orgulloso
      const k = eOut(tramo(t, T_ON + 0.2, T_ON + 0.5));
      G.manoD = mezcla([84, 60], [84, 60], k); G.manoI = [-10, 64]; G.cara = "risa"; G.rc = 0.06;
      dyG = -Math.abs(Math.sin((t - T_ON) * 9)) * 8 * (t < T_ON + 0.7 ? 1 : 0);
      M.cara = "sorpresa"; M.rc = -0.1;
      if (t > T_APUNTA) { G.manoD = [86, 116]; G.manoI = [9, 160]; G.cara = "guino"; M.cara = "sorpresa"; M.manoD = [67, 152]; M.manoI = [6, 152]; M.brazoIDelante = false; }
    }
    // ---- moja a Marcos
    if (t >= T_M) {
      M.manoD = [67, 152]; M.manoI = [6, 152]; M.brazoIDelante = false;
      if (t < T_M1 + 0.3) {
        M.cara = t < T_M + 0.15 ? "sorpresa" : "dormido"; M.rc = 0.12; giroM = 0.05;
        M.manoI = [-14, 50]; M.manoD = [84, 52];
      } else { M.cara = "sorpresa"; M.rc = -0.08; }
      if (t > T_G1) M.cara = "risa";
      if (t > T_ZAP) M.cara = "sorpresa";
    }
    // ---- moja a Guillermo
    if (t >= T_M && t < T_G) { G.cara = t > T_M + 0.2 ? "risa" : "sorpresa"; G.rc = 0.1; G.manoD = [52, 112]; G.manoI = [24, 112]; G.brazoIDelante = true; dyG = -Math.abs(Math.sin(t * 14)) * 4; }
    if (t >= T_G && t < T_G1 + 0.3) { G.cara = t < T_G + 0.15 ? "sorpresa" : "dormido"; G.manoD = [92, 48]; G.manoI = [-14, 48]; G.rc = -0.1; giroG = -0.04; }
    if (t >= T_G1 + 0.3) { G.cara = "sorpresa"; G.manoD = [80, 96]; G.manoI = [-2, 96]; G.rc = 0.05; }
    if (t > T_TODO && t < T_TODO1) { G.cara = "sorpresa"; dyG = -Math.abs(Math.sin(t * 11)) * 10; M.cara = "sorpresa"; dyM = -Math.abs(Math.sin(t * 11 + 1)) * 10; }
    if (t > T_ZAP) { G.cara = "sorpresa"; G.puntas = 1 - tramo(t, T_ZAP + 0.5, T_ZAP + 1); }
    // ---- Marcos va a la vela y sopla
    if (t > T_ANDA) {
      const u = tramo(t, T_ANDA, T_SOPLA - 0.1);
      xm = lerp(XM0, XM1, eInOut(u));
      if (u > 0 && u < 1) { const a = andar((t - T_ANDA) * 12, 0.8); M.piernaI = a.piernaI; M.piernaD = a.piernaD; dyM = a.bote; }
      M.cara = "guino"; M.rc = -0.08;
      if (t > T_SOPLA - 0.2) {
        const k = eInOut(tramo(t, T_SOPLA - 0.2, T_SOPLA)) * (1 - eInOut(tramo(t, T_APAGA + 0.3, T_APAGA + 0.6)));
        giroM = -0.12 * k; syM = 1 - 0.1 * k; M.rc = -0.22 * k; M.cara = k > 0.5 ? "dormido" : "guino";
        M.manoI = mezcla([6, 152], [-10, 120], k);
      }
      if (t > T_APAGA + 0.5) {
        M.cara = "guino"; M.rc = -0.06; M.manoD = [84, 64 + 3 * Math.sin(t * 10)];
        G.cara = "risa"; G.rc = 0.1; G.manoD = [52, 104]; G.manoI = [28, 106]; G.brazoIDelante = true; dyG = -Math.abs(Math.sin(t * 9)) * 5;
      }
    }
    // gotean los dos
    this.goteo.M = t > T_M + 0.2 ? 1 : 0; this.goteo.G = t > T_G + 0.2 ? 1 : 0;
    const mG = matAv(XG, PIES + dyG, ESC, giroG), mM = matAv(xm, PIES + dyM, ESC, giroM, 1, syM);
    return { G, M, mG, mM, xm };
  }

  actualizar(dt) {
    const t = (this.t += dt), p = this.p, e = this.poses(), R = this.estadoRobot(), A = this.apunta();
    CLONCS.forEach((c, i) => this.una("c" + i, t > c, () => {
      temblar(5, 0.15);
      for (let k = 0; k < 10; k++) { const a = azar(-Math.PI, 0), v = azar(120, 300); p.nueva(P.CHISPA, RX - 52, PIES - 164, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(5, 8)); }
    }));
    this.una("on", t > T_ON, () => {
      temblar(8, 0.3);
      p.nueva(P.DESTELLO, RX, PIES - 230, 0, 0, 0.35, 200);
      for (let k = 0; k < 24; k++) { const a = azar(0, 6.283), v = azar(60, 200); p.nueva(P.ELECTRICA, RX, PIES - 120, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(10, 18)); }
    });
    // agua: salpica donde da
    if (A.agua > 0) {
      const tip = this.punta(R, t), T = A.obj || this.blanco(tip, A.dir);
      for (let k = 0; k < 2; k++) this.gotas.push({ x: T[0] + azar(-14, 14), y: T[1] + azar(-10, 10), vx: azar(-200, 200), vy: azar(-260, -40), v: azar(0.4, 0.8) });
    }
    // goteo de los mojados
    for (const [q, m, quien] of [["M", e.mM, "M"], ["G", e.mG, "G"]]) {
      if (this.goteo[quien] && Math.random() < 10 * dt) { const s = aPant(m, [azar(10, 70), azar(20, 150)]); this.gotas.push({ x: s[0], y: s[1], vx: 0, vy: azar(0, 60), v: azar(0.4, 0.8) }); }
      void q;
    }
    for (const d of this.gotas) { d.v -= dt; d.vy += 1000 * dt; d.x += d.vx * dt; d.y += d.vy * dt; if (d.y > PIES) { d.y = PIES; d.vy = 0; d.vx *= 0.5; } }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    if (this.gotas.length > 300) this.gotas.splice(0, this.gotas.length - 300);
    this.una("zap", t > T_ZAP, () => {
      temblar(18, 0.6);
      p.nueva(P.DESTELLO, RX, PIES - 230, 0, 0, 0.4, 260);
      for (let k = 0; k < 40; k++) { const a = azar(0, 6.283), v = azar(100, 360); p.nueva(P.ELECTRICA, RX + azar(-40, 40), PIES - 230 + azar(-30, 30), Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(12, 22)); }
      for (let k = 0; k < 24; k++) { const a = azar(-Math.PI, 0), v = azar(150, 380); p.nueva(P.CHISPA, RX, PIES - 230, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(5, 9)); }
    });
    if (t > T_ZAP && t < T_ZAP + 1.2 && Math.random() < 30 * dt) p.nueva(P.ELECTRICA, RX + azar(-60, 60), PIES - azar(60, 260), azar(-60, 60), azar(-60, 60), azar(0.15, 0.3), azar(10, 16));
    if (t > T_ZAP && Math.random() < 6 * dt) p.nueva(P.HUMO, RX + azar(-20, 30), PIES - 280, azar(-10, 10), azar(-60, -30), azar(1, 1.6), azar(16, 26));
    this.una("apaga", t > T_APAGA, () => { for (let k = 0; k < 6; k++) p.nueva(P.HUMO, VX, MESA_Y - 46, azar(-8, 8), azar(-50, -25), azar(1.2, 1.8), azar(10, 16)); });
    if (t > T_SOPLA - 0.05 && t < T_APAGA + 0.1 && Math.random() < 30 * dt) {
      const b = aPant(e.mM, boca(e.M.rc || 0, "bombero"));
      p.nueva(P.VAPOR, b[0] - 8, b[1], (VX - b[0]) * 2.2, (MESA_Y - 60 - b[1]) * 2.2, azar(0.3, 0.45), azar(10, 18));
    }
    this.una("fin", t > T_APAGA + 0.5, () => { for (let k = 0; k < 40; k++) p.nueva(P.CONFETI, azar(60, 960), azar(-60, -10), azar(-40, 40), azar(30, 140), azar(2, 3), azar(9, 14), k % 5); });
    p.suelo = () => PIES;
    p.actualizar(dt);
  }
  punta(R, t) {
    const S = [54, -150], H = [S[0] + Math.cos(R.brazo) * R.largo, S[1] + Math.sin(R.brazo) * R.largo];
    return [R.x + (H[0] + Math.cos(R.dir) * 36) * R.s, R.y + (H[1] + Math.sin(R.dir) * 36) * R.s];
  }
  /** Dónde cae el chorro si no apunta a nadie: a lo largo de la dirección, hasta el techo, el suelo o los lados. */
  blanco(tip, dir) {
    const dx = Math.cos(dir), dy = Math.sin(dir);
    let k = 900;
    if (dy < -0.01) k = Math.min(k, (20 - tip[1]) / dy);
    if (dy > 0.01) k = Math.min(k, (PIES - tip[1]) / dy);
    if (dx < -0.01) k = Math.min(k, (10 - tip[0]) / dx);
    if (dx > 0.01) k = Math.min(k, (W - 10 - tip[0]) / dx);
    k = Math.max(20, k);
    const T = [tip[0] + dx * k, tip[1] + dy * k];
    // se lo echa a sí mismo
    if (this.t > T_SI && this.t < T_ZAP + 0.4) return [RX, PIES - 230];
    return T;
  }

  fondoC() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gp = g.createLinearGradient(0, -60, 0, PIES);
    gp.addColorStop(0, "#3a1e14"); gp.addColorStop(1, "#6a3a22");
    g.fillStyle = gp; g.fillRect(-60, -60, W + 120, H + 120);
    for (let y = -60; y < PIES; y += 26) for (let x = (Math.floor(y / 26)) % 2 ? -73 : -60; x < W + 60; x += 52) { g.fillStyle = "rgba(150,70,40,.3)"; rectR(g, x + 2, y + 2, 48, 22, 2); g.fill(); }
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.3; g.drawImage(BLOB2.oro, 160, -60, 700, 520); g.restore();
    // banco de trabajo con herramientas (al fondo, a la izquierda)
    g.fillStyle = "#4a2a14"; g.fillRect(-60, 380, 300, 16);
    g.fillStyle = "#3a2010"; g.fillRect(-40, 396, 14, 180); g.fillRect(200, 396, 14, 180);
    g.fillStyle = "#2a1a10"; g.fillRect(-60, 180, 300, 150);
    g.strokeStyle = "#c9cfd4"; g.lineWidth = 4;
    for (let i = 0; i < 6; i++) { const x = -30 + i * 44; g.beginPath(); g.moveTo(x, 200); g.lineTo(x, 270 + (i % 2) * 20); g.stroke(); g.fillStyle = i % 2 ? "#d8261c" : "#f2c21b"; g.fillRect(x - 5, 270 + (i % 2) * 20, 10, 26); }
    // cartel
    g.fillStyle = "#1d4a2c"; rectR(g, 600, 120, 230, 92, 8); g.fill();
    g.strokeStyle = "#ffd34d"; g.lineWidth = 3; rectR(g, 608, 128, 214, 76, 6); g.stroke();
    txt(g, "TALLER", 715, 182, { tam: 50, peso: 900, fam: FD, color: "#ffd34d", esp: 6 });
    // suelo
    const gs = g.createLinearGradient(0, PIES - 20, 0, H);
    gs.addColorStop(0, "#4a2a18"); gs.addColorStop(1, "#22120a");
    g.fillStyle = gs; g.fillRect(-60, PIES - 6, W + 120, H);
    g.fillStyle = "rgba(255,220,170,.2)"; g.fillRect(-60, PIES - 6, W + 120, 2);
    return (this.cF = c);
  }
  mesita(g, t) {
    const x = VX, y = MESA_Y;
    g.fillStyle = "rgba(0,0,0,.3)"; g.beginPath(); g.ellipse(x, PIES + 2, 50, 7, 0, 0, 6.283); g.fill();
    g.fillStyle = "#3a2010"; g.fillRect(x - 5, y, 10, PIES - y);
    g.fillRect(x - 34, PIES - 8, 68, 8);
    g.fillStyle = "#7a4a22"; g.beginPath(); g.ellipse(x, y, 58, 11, 0, 0, 6.283); g.fill();
    g.fillStyle = "#9a6232"; g.beginPath(); g.ellipse(x, y - 3, 58, 10, 0, 0, 6.283); g.fill();
    // platito y vela
    g.fillStyle = "#e8e2d4"; g.beginPath(); g.ellipse(x, y - 6, 22, 5, 0, 0, 6.283); g.fill();
    const gv = g.createLinearGradient(x - 8, 0, x + 8, 0); gv.addColorStop(0, "#e8dcc0"); gv.addColorStop(0.5, "#fffaf0"); gv.addColorStop(1, "#d8ccb0");
    g.fillStyle = gv; rectR(g, x - 8, y - 46, 16, 42, 3); g.fill();
    g.fillStyle = "#fffaf0"; g.beginPath(); g.ellipse(x - 4, y - 44, 3, 6, 0, 0, 6.283); g.fill();
    g.strokeStyle = "#2a2a2a"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - 46); g.lineTo(x, y - 52); g.stroke();
    const viva = t < T_APAGA ? 1 : 0;
    // tiembla con el soplido
    const sopla = t > T_SOPLA ? tramo(t, T_SOPLA, T_APAGA) : 0;
    if (viva) { g.save(); g.translate(x, y - 50); g.rotate(-0.6 * sopla); llamita(g, 0, 0, 0.42 * (1 - 0.5 * sopla), t); g.restore(); }
  }

  dibujar(g) {
    const t = this.t, e = this.poses(), R = this.estadoRobot(), A = this.apunta();
    fondo(g, "#000");
    g.drawImage(this.fondoC(), -60, -60);
    // lámpara del techo (se moja y se balancea)
    const bal = t > T_TODO ? 0.25 * Math.sin((t - T_TODO) * 5) * Math.exp(-(t - T_TODO) * 0.6) : 0;
    g.save(); g.translate(512, -10); g.rotate(bal);
    g.strokeStyle = "#111"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 60); g.stroke();
    g.fillStyle = "#1d4a2c"; g.beginPath(); g.moveTo(-34, 88); g.lineTo(34, 88); g.lineTo(14, 60); g.lineTo(-14, 60); g.closePath(); g.fill();
    g.save(); g.globalCompositeOperation = "lighter"; g.drawImage(BLOB.amarillo, -60, 60, 120, 90); g.restore();
    g.restore();
    this.mesita(g, t);
    robot(g, R, t);
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    // chorro del robot
    if (A.agua > 0) {
      const tip = this.punta(R, t), T = A.obj || this.blanco(tip, A.dir);
      const self = t > T_SI && t < T_ZAP + 0.4;
      chorro(g, tip, T, self ? 10 : Math.min(60, Math.hypot(T[0] - tip[0], T[1] - tip[1]) * 0.12), 1, t);
    }
    // gotas
    g.fillStyle = "rgba(170,225,255,.9)";
    for (const d of this.gotas) { g.beginPath(); g.ellipse(d.x, d.y, 3, 4.5, 0, 0, 6.283); g.fill(); }
    this.p.dibujar(g);
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    CLONCS.forEach((c, i) => ono("¡CLONC!", 330 + i * 26, 250 - i * 22, c, 0.35, 40 + i * 4, "#fffdf5", "#1b1b1b", -0.12));
    ono("¡SPLASH!", 790, 150, T_M + 0.1, 0.8, 52, "#bfeaff", "#0a2a48", 0.1);
    ono("¡SPLASH!", 230, 150, T_G + 0.1, 0.7, 52, "#bfeaff", "#0a2a48", -0.1);
    ono("¡LA VELA!", 664, 318, T_TODO + 0.1, 1.0, 46, "#ffd34d", "#3a1a00", 0.06);
    ono("¡BZZZT!", 330, 120, T_ZAP, 1.0, 66, "#2fe3e8", "#06303a", -0.12);
    ono("¡FFFU!", 640, 300, T_SOPLA, 0.7, 48, "#fffdf5", "#1b1b1b", 0.08);
    // ¡BIP, BIP! (al encenderlo y cuando se reinicia al final)
    const tit = (t0, t1, z0) => {
      if (t < t0 || t > t1) return;
      const d = t - t0, k = tramo(d, 0, 0.14), s = lerp(z0, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 14)), sal = tramo(t, t1 - 0.25, t1);
      const r = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - sal); g.translate(512, 96); g.scale(s, s); g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    };
    tit(T_ON, T_M + 0.4, 2);
    tit(T_APAGA + 0.9, DUR, 1.5);
    const a = Math.max(1 - tramo(t, 0.02, 0.45), tramo(t, T_FIN, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00241", nombre: "Robot bombero", crear: () => new RobotBombero() });
})();
