"use strict";
/*
 * 00247 · EL DESFILE
 *
 * Animación del banco. Empieza y acaba en negro.
 * Fiesta en la calle, banderines y confeti. Entra el desfile a paso lento: delante Guillermo marcando el paso con un
 * bombo (¡BUM!, ¡BUM!) y detrás el camión de bomberos con la sirena encendida, que lleva Marcos saludando por la
 * ventanilla. Se paran; Marcos tira de la bocina (¡MOOOC!) y Guillermo da un bote del susto. Redoble cada vez más
 * rápido, golpe final con las dos mazas… y los cañones de confeti del camión disparan: ¡DESFILE! Siguen su camino.
 */
(() => {
const CT = cacheTexto();
const ESC_G = 1.4, ESC_M = 1.05;
const X0_FIN = 60, XG_FIN = 822;
const T_PARA = 3.6, T_MOC = 3.95, T_BUM = 5.85, T_SIGUE = 8.55, T_FUN = 9.45, DUR = 10.0;
const BEATS = [0.6, 1.15, 1.7, 2.25, 2.8, 3.35];
const REDOBLE = [4.7, 4.95, 5.15, 5.3, 5.42, 5.52];
const BEATS2 = [7.0, 7.5, 8.0, 8.5, 9.0];
const RUEDAS = [110, 205, 525];
const SUELO = PIES;

/** Posición del camión (x de la trasera) y de Guillermo en el instante t. */
function xs(t) {
  let x0, xg;
  if (t < T_PARA) {
    const u = tramo(t, 0, T_PARA), k = u < 0.8 ? u / 0.8 * 0.86 : 0.86 + 0.14 * eOut((u - 0.8) / 0.2);
    x0 = lerp(-780, X0_FIN, k); xg = lerp(-20, XG_FIN, k);
  } else if (t < T_SIGUE) { x0 = X0_FIN; xg = XG_FIN; }
  else { const d = t - T_SIGUE; x0 = X0_FIN + 70 * d * d + 60 * d; xg = XG_FIN + 70 * d * d + 60 * d; }
  return [x0, xg];
}
function anda(t) { return t < T_PARA || t > T_SIGUE; }

// ------------------------------------------------------------------------------------------- el camión
function rueda(g, x, y, r, ang) {
  g.fillStyle = "#151515"; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
  g.strokeStyle = "#2c2c2c"; g.lineWidth = 5; g.beginPath(); g.arc(x, y, r - 6, 0, 6.283); g.stroke();
  const gl = g.createRadialGradient(x - 5, y - 5, 2, x, y, r * 0.55);
  gl.addColorStop(0, "#ffffff"); gl.addColorStop(0.6, "#b9c0c6"); gl.addColorStop(1, "#6a727a");
  g.fillStyle = gl; g.beginPath(); g.arc(x, y, r * 0.52, 0, 6.283); g.fill();
  g.fillStyle = "#4a5056";
  for (let i = 0; i < 6; i++) { const a = ang + i * 1.047; g.beginPath(); g.arc(x + Math.cos(a) * r * 0.33, y + Math.sin(a) * r * 0.33, 3, 0, 6.283); g.fill(); }
  g.fillStyle = "#d8dde2"; g.beginPath(); g.arc(x, y, 6, 0, 6.283); g.fill();
}
/** Carrocería (lo que va detrás de Marcos). */
function camionAtras(g, x0, t) {
  const Y = SUELO;
  // sombra
  g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(x0 + 320, Y + 4, 330, 12, 0, 0, 6.283); g.fill();
  // chasis
  g.fillStyle = "#1e1e22"; g.fillRect(x0 + 10, Y - 78, 610, 30);
  // caja trasera
  const gr = g.createLinearGradient(0, Y - 300, 0, Y - 60);
  gr.addColorStop(0, "#ff5a48"); gr.addColorStop(0.35, "#e11e14"); gr.addColorStop(1, "#8e0d07");
  g.fillStyle = gr; rectR(g, x0, Y - 300, 432, 236, 10); g.fill();
  g.strokeStyle = "#5e0805"; g.lineWidth = 3; g.stroke();
  // persianas de los armarios
  for (let i = 0; i < 3; i++) {
    const px = x0 + 18 + i * 136, py = Y - 282, pw = 124, ph = 112;
    const gp = g.createLinearGradient(0, py, 0, py + ph);
    gp.addColorStop(0, "#e6eaee"); gp.addColorStop(1, "#9aa3ab");
    g.fillStyle = gp; rectR(g, px, py, pw, ph, 6); g.fill();
    g.fillStyle = "rgba(60,70,80,.35)"; for (let k = 8; k < ph; k += 9) g.fillRect(px + 3, py + k, pw - 6, 2);
    g.fillStyle = "#5d656e"; rectR(g, px + pw / 2 - 12, py + ph - 14, 24, 7, 3); g.fill();
  }
  // rótulo
  txt(g, "BOMBEROS", x0 + 216, Y - 126, { tam: 46, peso: 900, fam: FD, color: "#fffdf5", borde: "#5e0805", bordeAncho: 6, esp: 6 });
  // banda reflectante
  g.fillStyle = "#f2e600"; g.fillRect(x0 + 4, Y - 104, 424, 10);
  g.fillStyle = "#e6ecef"; g.fillRect(x0 + 4, Y - 94, 424, 6);
  // escalera en el techo
  g.fillStyle = "#5d656e"; g.fillRect(x0 + 40, Y - 312, 8, 14); g.fillRect(x0 + 380, Y - 312, 8, 14);
  g.strokeStyle = "#c9d0d6"; g.lineWidth = 5;
  g.beginPath(); g.moveTo(x0 + 6, Y - 320); g.lineTo(x0 + 470, Y - 320); g.moveTo(x0 + 6, Y - 308); g.lineTo(x0 + 470, Y - 308); g.stroke();
  g.lineWidth = 3; g.beginPath(); for (let x = x0 + 16; x < x0 + 466; x += 22) { g.moveTo(x, Y - 320); g.lineTo(x, Y - 308); } g.stroke();
  // cabina: pared y ventanilla
  const gc = g.createLinearGradient(0, Y - 362, 0, Y - 60);
  gc.addColorStop(0, "#ff5a48"); gc.addColorStop(0.3, "#e11e14"); gc.addColorStop(1, "#8e0d07");
  g.fillStyle = gc;
  g.beginPath();
  g.moveTo(x0 + 428, Y - 64); g.lineTo(x0 + 428, Y - 350); g.quadraticCurveTo(x0 + 430, Y - 362, x0 + 446, Y - 362);
  g.lineTo(x0 + 584, Y - 362); g.quadraticCurveTo(x0 + 600, Y - 360, x0 + 604, Y - 340); g.lineTo(x0 + 622, Y - 222);
  g.lineTo(x0 + 626, Y - 64); g.closePath(); g.fill();
  g.strokeStyle = "#5e0805"; g.lineWidth = 3; g.stroke();
  // interior de la ventanilla
  const gv = g.createLinearGradient(0, Y - 350, 0, Y - 225);
  gv.addColorStop(0, "#1a2a3a"); gv.addColorStop(1, "#0a1018");
  g.fillStyle = gv;
  g.beginPath(); g.moveTo(x0 + 442, Y - 346); g.lineTo(x0 + 584, Y - 346); g.lineTo(x0 + 604, Y - 228); g.lineTo(x0 + 442, Y - 228); g.closePath(); g.fill();
  // luces de la sirena (base)
  g.fillStyle = "#2a2a30"; rectR(g, x0 + 462, Y - 374, 116, 14, 4); g.fill();
}
/** Puerta, marcos y morro (lo que va delante de Marcos). */
function camionDelante(g, x0, t, sirena) {
  const Y = SUELO;
  const gc = g.createLinearGradient(0, Y - 230, 0, Y - 60);
  gc.addColorStop(0, "#f2382a"); gc.addColorStop(1, "#8e0d07");
  g.fillStyle = gc;
  g.beginPath(); g.moveTo(x0 + 428, Y - 230); g.lineTo(x0 + 606, Y - 230); g.lineTo(x0 + 622, Y - 222); g.lineTo(x0 + 626, Y - 64); g.lineTo(x0 + 428, Y - 64); g.closePath(); g.fill();
  g.strokeStyle = "#5e0805"; g.lineWidth = 3; g.stroke();
  // marco de la ventanilla
  g.strokeStyle = "#7a0c08"; g.lineWidth = 7;
  g.beginPath(); g.moveTo(x0 + 442, Y - 228); g.lineTo(x0 + 442, Y - 346); g.lineTo(x0 + 584, Y - 346); g.lineTo(x0 + 604, Y - 228); g.stroke();
  g.strokeStyle = "#c9d0d6"; g.lineWidth = 4; g.beginPath(); g.moveTo(x0 + 438, Y - 228); g.lineTo(x0 + 610, Y - 228); g.stroke();
  // puerta: juntas, tirador, escalón
  g.strokeStyle = "rgba(60,0,0,.6)"; g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(x0 + 440, Y - 226); g.lineTo(x0 + 440, Y - 96); g.lineTo(x0 + 600, Y - 96); g.lineTo(x0 + 606, Y - 226); g.stroke();
  g.fillStyle = "#d8dde2"; rectR(g, x0 + 456, Y - 200, 34, 8, 4); g.fill();
  g.fillStyle = "#b9c0c6"; rectR(g, x0 + 446, Y - 82, 150, 12, 4); g.fill();
  // escudo propio: una llama dentro de un círculo
  g.save(); g.translate(x0 + 530, Y - 160);
  g.fillStyle = "#fffdf5"; g.beginPath(); g.arc(0, 0, 26, 0, 6.283); g.fill();
  g.fillStyle = "#e11e14"; g.beginPath(); g.arc(0, 0, 21, 0, 6.283); g.fill();
  g.fillStyle = "#ffd34d";
  g.beginPath(); g.moveTo(0, 15); g.quadraticCurveTo(-13, 6, -5, -6); g.quadraticCurveTo(-3, 1, 1, 1); g.quadraticCurveTo(-1, -9, 5, -15);
  g.quadraticCurveTo(14, 0, 7, 10); g.quadraticCurveTo(5, 15, 0, 15); g.fill();
  g.restore();
  // banda reflectante de la cabina
  g.fillStyle = "#f2e600"; g.fillRect(x0 + 428, Y - 104, 198, 10);
  g.fillStyle = "#e6ecef"; g.fillRect(x0 + 428, Y - 94, 198, 6);
  // morro: faro, parachoques, espejo
  const gf = g.createRadialGradient(x0 + 620, Y - 132, 2, x0 + 620, Y - 132, 14);
  gf.addColorStop(0, "#ffffff"); gf.addColorStop(1, "#ffe08a");
  g.fillStyle = gf; g.beginPath(); g.ellipse(x0 + 621, Y - 132, 7, 14, 0, 0, 6.283); g.fill();
  const gb = g.createLinearGradient(0, Y - 82, 0, Y - 52);
  gb.addColorStop(0, "#ffffff"); gb.addColorStop(0.5, "#b9c0c6"); gb.addColorStop(1, "#6a727a");
  g.fillStyle = gb; rectR(g, x0 + 600, Y - 82, 40, 28, 6); g.fill();
  g.strokeStyle = "#3a4048"; g.lineWidth = 3; g.beginPath(); g.moveTo(x0 + 606, Y - 330); g.lineTo(x0 + 636, Y - 316); g.stroke();
  g.fillStyle = "#2a2e33"; rectR(g, x0 + 630, Y - 334, 12, 40, 4); g.fill();
  // ruedas
  const ang = x0 / 40;
  for (const rx of RUEDAS) rueda(g, x0 + rx, Y - 40, 40, ang);
  // guardabarros
  g.fillStyle = "#6a0a06";
  for (const rx of RUEDAS) { g.beginPath(); g.arc(x0 + rx, Y - 40, 47, Math.PI * 1.08, Math.PI * 1.92); g.lineTo(x0 + rx + 40, Y - 70); g.lineTo(x0 + rx - 40, Y - 70); g.closePath(); g.fill(); }
  // sirena: dos luces azules que se alternan
  for (let i = 0; i < 2; i++) {
    const lx = x0 + 490 + i * 60, on = sirena && (Math.sin(t * 14 + i * Math.PI) > 0);
    const gl = g.createLinearGradient(0, Y - 392, 0, Y - 372);
    gl.addColorStop(0, on ? "#d6faff" : "#5aa0c8"); gl.addColorStop(1, on ? "#2fa8ff" : "#1a3a6a");
    g.fillStyle = gl; g.beginPath(); g.moveTo(lx - 22, Y - 372); g.quadraticCurveTo(lx - 22, Y - 394, lx, Y - 394); g.quadraticCurveTo(lx + 22, Y - 394, lx + 22, Y - 372); g.closePath(); g.fill();
    if (on) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.85;
      g.drawImage(BLOB2.cian, lx - 70, Y - 440, 140, 120);
      g.globalAlpha = 0.35; g.drawImage(BLOB2.cian, lx - 160, Y - 500, 320, 240);
      g.restore();
    }
  }
}
/** Cañones de confeti en el techo (girados hacia arriba). */
function canones(g, x0, k) {
  const Y = SUELO;
  for (const [cx, a] of [[x0 + 120, -1.05], [x0 + 300, -1.25]]) {
    g.save(); g.translate(cx, Y - 324); g.rotate(a - k * 0.08);
    const gr = g.createLinearGradient(0, -14, 0, 14);
    gr.addColorStop(0, "#fff3b0"); gr.addColorStop(0.5, "#ffb020"); gr.addColorStop(1, "#a85a00");
    g.fillStyle = gr; rectR(g, -6, -13, 66, 26, 6); g.fill();
    g.fillStyle = "#ff3d84"; g.fillRect(14, -13, 8, 26); g.fillStyle = "#2fe3e8"; g.fillRect(34, -13, 8, 26);
    g.fillStyle = "#3a1a00"; g.beginPath(); g.ellipse(60, 0, 5, 13, 0, 0, 6.283); g.fill();
    g.restore();
    g.fillStyle = "#3a4048"; rectR(g, cx - 16, Y - 330, 32, 12, 3); g.fill();
  }
}

// ------------------------------------------------------------------------------------------- el bombo
function bombo(g, t, golpeD, golpeI) {
  // correas
  g.strokeStyle = "#f4f0e6"; g.lineWidth = 5; g.lineCap = "round";
  g.beginPath(); g.moveTo(22, 80); g.lineTo(12, 112); g.moveTo(56, 80); g.lineTo(66, 112); g.stroke();
  // casco del bombo
  const gr = g.createLinearGradient(0, 108, 0, 164);
  gr.addColorStop(0, "#ff6a5a"); gr.addColorStop(0.45, "#d8261c"); gr.addColorStop(1, "#7a0c08");
  g.fillStyle = gr; g.fillRect(-1, 110, 80, 52);
  // aros
  const ga = g.createLinearGradient(0, 106, 0, 114);
  ga.addColorStop(0, "#fff7c8"); ga.addColorStop(1, "#c99a20");
  g.fillStyle = ga; g.fillRect(-2, 106, 82, 7); g.fillRect(-2, 159, 82, 7);
  // cuerdas en zigzag
  g.strokeStyle = "#fffdf5"; g.lineWidth = 1.6; g.beginPath();
  for (let i = 0; i <= 8; i++) { const x = -1 + i * 10; if (i) g.lineTo(x, i % 2 ? 158 : 114); else g.moveTo(x, 114); }
  g.stroke();
  g.fillStyle = "#c99a20"; for (let i = 0; i <= 8; i++) { g.fillRect(-2 + i * 10, i % 2 ? 154 : 113, 3, 5); }
  // parches (de lado), vibran al golpear
  for (const [x, k] of [[-2, golpeI], [80, golpeD]]) {
    g.fillStyle = "#f6efd8"; g.beginPath(); g.ellipse(x, 136, 6 + 1.5 * k, 29, 0, 0, 6.283); g.fill();
    g.strokeStyle = "#c99a20"; g.lineWidth = 2.5; g.stroke();
    if (k > 0.05) { g.strokeStyle = `rgba(255,255,255,${k})`; g.lineWidth = 2; g.beginPath(); g.ellipse(x + (x < 0 ? -6 : 6), 136, 4 + 6 * k, 22 + 10 * k, 0, 0, 6.283); g.stroke(); }
  }
  g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(6, 116, 66, 4);
}
/** Maza: palo desde la mano y bola de fieltro. */
function maza(g, m, dir) {
  const b = [m[0] - 10 * dir, m[1] + 13];
  g.strokeStyle = "#c98a4a"; g.lineWidth = 3; g.lineCap = "round";
  g.beginPath(); g.moveTo(m[0] + 3 * dir, m[1] - 5); g.lineTo(b[0], b[1]); g.stroke();
  const gr = g.createRadialGradient(b[0] - 2, b[1] - 2, 1, b[0], b[1], 7);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(1, "#cfc8b8");
  g.fillStyle = gr; g.beginPath(); g.arc(b[0], b[1], 6.5, 0, 6.283); g.fill();
}

class ElDesfile extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(480);
    this.p.suelo = (x) => PIES + 6 + (x % 7);
    this.fase = 0;
  }
  luz() { return tramo(this.t, 0.02, 0.5) * (1 - tramo(this.t, T_FUN, DUR - 0.03)); }
  /** Golpes: cuánto hace del último golpe de cada mano (0 = ahora). */
  golpes(t) {
    let dD = 9, dI = 9;
    BEATS.concat(BEATS2).forEach((b, i) => { const d = t - b; if (d >= -0.15 && d < 0.4) { if (i % 2 === 0) dD = Math.min(dD, d); else dI = Math.min(dI, d); } });
    REDOBLE.forEach((b, i) => { const d = t - b; if (d >= -0.1 && d < 0.3) { if (i % 2 === 0) dD = Math.min(dD, d); else dI = Math.min(dI, d); } });
    return [dD, dI];
  }
  poses() {
    const t = this.t, [x0, xg] = xs(t);
    const G = { cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [98, 118], manoI: [-20, 118], brazoIDelante: true };
    const M = { quien: "bombero", cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [62, 128], manoI: [-18, 40] };
    let yg = PIES;
    // ---- Guillermo: marcha con las rodillas altas y golpea el bombo
    const marcha = t < T_MOC || (t > T_BUM + 0.9);
    if (marcha) {
      const a = andar(this.fase, 1.7);
      G.piernaI = a.piernaI; G.piernaD = a.piernaD; yg += a.bote * ESC_G;
    }
    const [dD, dI] = this.golpes(t);
    const hit = (d) => (d < 0 ? eIn(tramo(d, -0.15, 0)) : 1 - eOut(tramo(d, 0, 0.3)));
    const kD = dD < 9 ? hit(dD) : 0, kI = dI < 9 ? hit(dI) : 0;
    G.manoD = mezcla([98, 112], [90, 126], kD); G.manoI = mezcla([-20, 112], [-12, 126], kI);
    this.gD = dD >= 0 && dD < 0.3 ? 1 - dD / 0.3 : 0; this.gI = dI >= 0 && dI < 0.3 ? 1 - dI / 0.3 : 0;
    G.cara = Math.floor(t / 1.1) % 2 ? "risa" : "sonrisa";
    G.rc = 0.05 * Math.sin(t * 5.7);
    // la bocina: bote del susto
    if (t > T_MOC && t < T_MOC + 0.7) {
      const u = tramo(t, T_MOC, T_MOC + 0.5);
      yg = PIES - Math.sin(u * Math.PI) * 60;
      G.cara = "sorpresa"; G.puntas = 1 - tramo(t, T_MOC + 0.4, T_MOC + 0.7); G.rc = -0.15;
      G.manoD = [104, 60]; G.manoI = [-26, 60];
      G.piernaI = [-10 * Math.sin(u * Math.PI), 0.2]; G.piernaD = [-10 * Math.sin(u * Math.PI), -0.2];
    }
    if (t >= T_MOC + 0.7 && t < REDOBLE[0] - 0.05) { G.cara = "risa"; G.rc = -0.18; }
    // redoble: concentrado
    if (t >= REDOBLE[0] - 0.05 && t < T_BUM - 0.35) { G.cara = "dormido"; G.rc = 0.04 * Math.sin(t * 30); }
    // golpe final: las dos mazas arriba y ¡BUM!
    if (t >= T_BUM - 0.35 && t < T_BUM + 0.9) {
      const kA = eOut(tramo(t, T_BUM - 0.35, T_BUM - 0.1)), kB = eIn(tramo(t, T_BUM - 0.1, T_BUM));
      G.manoD = mezcla(mezcla([98, 112], [104, 48], kA), [90, 126], kB);
      G.manoI = mezcla(mezcla([-20, 112], [-26, 48], kA), [-12, 126], kB);
      G.cara = t < T_BUM ? "guino" : "risa"; G.rc = 0;
      if (t > T_BUM) { this.gD = this.gI = 1 - tramo(t, T_BUM, T_BUM + 0.4); }
      if (t > T_BUM + 0.25) { const k = eOut(tramo(t, T_BUM + 0.25, T_BUM + 0.5)); G.manoD = mezcla([90, 126], [104, 40], k); G.manoI = mezcla([-12, 126], [-26, 40], k); yg -= 18 * Math.sin(tramo(t, T_BUM + 0.25, T_BUM + 0.75) * Math.PI); }
    }
    if (t >= T_BUM + 0.9) { G.cara = Math.floor(t / 0.9) % 2 ? "risa" : "guino"; G.rc = -0.12 + 0.05 * Math.sin(t * 5.7); }
    // ---- Marcos: saluda por la ventanilla, tira de la bocina, aplaude el redoble, saludo final
    const ola = Math.sin(t * 9);
    M.manoI = [-16 + 8 * ola, 34 + 4 * Math.cos(t * 9)]; M.rc = 0.06 * ola; M.cara = "risa";
    if (Math.floor(t / 0.8) % 3 === 1) M.cara = "sonrisa";
    if (t > T_MOC - 0.45 && t < T_MOC + 0.35) {
      const k = eInOut(tramo(t, T_MOC - 0.45, T_MOC - 0.2)), kt = eIn(tramo(t, T_MOC - 0.1, T_MOC));
      M.manoD = mezcla([62, 128], [76, 40 + 22 * kt], k); M.cara = "guino"; M.manoI = [6, 130]; M.rc = 0.1;
    }
    if (t >= T_MOC + 0.35 && t < REDOBLE[0]) { M.cara = "risa"; M.rc = 0.18; M.manoD = [70, 60]; M.manoI = [8, 64]; M.brazoIDelante = true; }
    if (t >= REDOBLE[0] && t < T_BUM) {
      const c = Math.abs(Math.sin((t - REDOBLE[0]) * 14));
      M.manoD = [46 + 10 * c, 88]; M.manoI = [28 - 10 * c, 88]; M.brazoIDelante = true; M.cara = "sorpresa"; M.rc = 0.1;
    }
    if (t >= T_BUM) {
      // saludo con la mano en el casco
      const k = eOut(tramo(t, T_BUM + 0.1, T_BUM + 0.35)) * (1 - eInOut(tramo(t, T_BUM + 1.6, T_BUM + 1.9)));
      M.manoD = mezcla([62, 128], [70, 34], k); M.cara = k > 0.5 ? "guino" : "risa"; M.rc = 0.05;
      M.manoI = [-16 + 8 * ola, 34 + 4 * Math.cos(t * 9)]; M.brazoIDelante = false;
      if (t < T_BUM + 0.5) M.manoI = [-24, 26];
    }
    // objetos
    const gD = this.gD, gI = this.gI;
    G.objI = (g) => bombo(g, t, gD, gI);
    G.objD2 = (g, m) => maza(g, m, 1);
    G.objI2 = (g, m) => maza(g, m, -1);
    const mG = matAv(xg, yg, ESC_G);
    const mM = matAv(x0 + 518, SUELO - 92, ESC_M);
    return { G, M, mG, mM, x0, xg };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    if (anda(t) || t > T_BUM + 0.9) this.fase += dt * (anda(t) ? 9.5 : 7);
    const [x0, xg] = xs(t);
    // ¡BUM! de cada golpe
    BEATS.concat(REDOBLE, BEATS2).forEach((b, i) => this.una("b" + i, t > b, () => {
      temblar(REDOBLE.includes(b) ? 4 : 3, 0.12);
      for (let k = 0; k < 4; k++) p.nueva(P.CHISPA, xg + azar(-60, 60), PIES - 140, azar(-80, 80), azar(-200, -80), azar(0.3, 0.5), azar(4, 7));
    }));
    this.una("moc", t > T_MOC, () => temblar(10, 0.3));
    this.una("bum", t > T_BUM, () => {
      temblar(22, 0.6);
      p.nueva(P.DESTELLO, xg, PIES - 140, 0, 0, 0.4, 260);
      for (const [cx, a] of [[x0 + 120, -1.05], [x0 + 300, -1.25]]) {
        const bx = cx + Math.cos(a) * 64, by = SUELO - 324 + Math.sin(a) * 64;
        p.nueva(P.DESTELLO, bx, by, 0, 0, 0.3, 160);
        for (let i = 0; i < 110; i++) { const aa = a + azar(-0.45, 0.45), v = azar(380, 760); p.nueva(P.CONFETI, bx, by, Math.cos(aa) * v, Math.sin(aa) * v, azar(2.6, 4.2), azar(10, 16), (Math.random() * 5) | 0); }
      }
      for (let i = 0; i < 20; i++) { const a = azar(0, 6.283), v = azar(200, 420); p.nueva(P.CHISPA, xg, PIES - 140, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.7), azar(6, 10)); }
    });
    // confeti que cae de los balcones
    if (t < T_FUN && Math.random() < 9 * dt) p.nueva(P.CONFETI, azar(0, W), azar(-30, -5), azar(-30, 30), azar(30, 90), azar(4, 6), azar(8, 13), (Math.random() * 5) | 0);
    p.actualizar(dt);
  }
  fondo() {
    if (CT.has("fondo")) return CT.get("fondo");
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, 470);
    gc.addColorStop(0, "#3a8ae0"); gc.addColorStop(0.7, "#8ec8f2"); gc.addColorStop(1, "#d8eefa");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, 560);
    // nubes
    g.fillStyle = "rgba(255,255,255,.85)";
    for (const [x, y, s] of [[160, 60, 1], [700, 40, 1.3], [930, 110, 0.8]]) for (const [dx, dy, r] of [[0, 0, 22], [24, -10, 28], [52, 0, 22], [26, 8, 22]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, 6.283); g.fill(); }
    // fachadas
    const cols = ["#f2c48a", "#e88a6a", "#f6e2b0", "#c9a0d8", "#9ad0b0", "#f2a86a"];
    let x = -60, i = 0;
    const r = semilla(7);
    while (x < W + 60) {
      const w = 150 + r() * 80, h = 300 + r() * 120, top = 480 - h;
      g.fillStyle = cols[i % cols.length]; g.fillRect(x, top, w, h);
      g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(x + w - 6, top, 6, h);
      g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(x, top, w, 8);
      // ventanas con balcón
      for (let fy = top + 34; fy < 400; fy += 92) {
        for (let fx = x + 22; fx < x + w - 50; fx += 64) {
          g.fillStyle = "#3a2a2a"; rectR(g, fx, fy, 34, 52, 4); g.fill();
          g.fillStyle = "rgba(140,200,255,.45)"; g.fillRect(fx + 4, fy + 4, 12, 44); g.fillRect(fx + 18, fy + 4, 12, 44);
          g.fillStyle = "#2a2a30"; g.fillRect(fx - 6, fy + 50, 46, 4);
          g.strokeStyle = "#2a2a30"; g.lineWidth = 2; g.beginPath(); for (let k = 0; k <= 6; k++) { g.moveTo(fx - 4 + k * 7, fy + 50); g.lineTo(fx - 4 + k * 7, fy + 34); } g.moveTo(fx - 6, fy + 34); g.lineTo(fx + 40, fy + 34); g.stroke();
          if (r() < 0.5) { g.fillStyle = ["#ff3d84", "#ffd34d", "#2fe3e8"][(fx | 0) % 3]; g.beginPath(); g.moveTo(fx + 2, fy + 34); g.lineTo(fx + 32, fy + 34); g.lineTo(fx + 17, fy + 62); g.closePath(); g.fill(); }
        }
      }
      x += w; i++;
    }
    // banderines
    const tiras = [[-60, 40, W + 60, 70], [-60, 120, W + 60, 96]];
    for (const [ax, ay, bx, by] of tiras) {
      g.strokeStyle = "#3a2a2a"; g.lineWidth = 2;
      g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo((ax + bx) / 2, ay + 60, bx, by); g.stroke();
      for (let k = 0; k < 26; k++) {
        const u = (k + 0.5) / 26, px = lerp(ax, bx, u), py = (1 - u) * (1 - u) * ay + 2 * u * (1 - u) * (ay + 60) + u * u * by;
        g.fillStyle = CONFETI[k % 5 === 2 ? 3 : k % 5];
        g.beginPath(); g.moveTo(px - 18, py); g.lineTo(px + 18, py); g.lineTo(px, py + 30); g.closePath(); g.fill();
      }
    }
    // acera y calzada
    g.fillStyle = "#b9b0a4"; g.fillRect(-60, 480, W + 120, 26);
    g.fillStyle = "#8a8278"; g.fillRect(-60, 504, W + 120, 6);
    const gs = g.createLinearGradient(0, 510, 0, H + 60);
    gs.addColorStop(0, "#4a4a52"); gs.addColorStop(1, "#24242a");
    g.fillStyle = gs; g.fillRect(-60, 510, W + 120, H + 60 - 510);
    g.fillStyle = "rgba(255,255,255,.7)"; for (let k = -60; k < W + 60; k += 120) g.fillRect(k, 590, 60, 6);
    CT.set("fondo", c);
    return c;
  }
  titulo() {
    if (CT.has("tit")) return CT.get("tit");
    const c = sprite3D("¡DESFILE!", 150, { cara: "#ffd34d", lado: "#b8611a", borde: "#3a1a00" });
    CT.set("tit", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses(), a = this.luz();
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    const x0 = e.x0;
    camionAtras(g, x0, t);
    canones(g, x0, Math.max(0, 1 - Math.abs(t - T_BUM) * 4));
    // cordón de la bocina
    const q = aPant(e.mM, [74, 2]), mano = t > T_MOC - 0.45 && t < T_MOC + 0.35 ? aPant(e.mM, e.M.manoD) : [x0 + 560, SUELO - 300];
    pintarAvatar(g, e.mM, e.M, t);
    g.strokeStyle = "#f2e6c8"; g.lineWidth = 3; g.beginPath(); g.moveTo(x0 + 560, SUELO - 346); g.lineTo(mano[0], mano[1]); g.stroke();
    g.fillStyle = "#c98a4a"; g.beginPath(); g.arc(mano[0], mano[1], 5, 0, 6.283); g.fill();
    void q;
    camionDelante(g, x0, t, true);
    pintarAvatar(g, e.mG, e.G, t);
    this.p.dibujar(g);
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.12, dur) });
      g.restore();
    };
    const xg = e.xg;
    BEATS.forEach((b, i) => ono("¡BUM!", xg + (i % 2 ? -110 : 110), 300 - (i % 3) * 14, b, 0.42, 40, "#fffdf5", "#1b1b1b", i % 2 ? -0.15 : 0.15));
    BEATS2.forEach((b, i) => ono("¡BUM!", xg + (i % 2 ? -110 : 110), 300, b, 0.42, 38, "#fffdf5", "#1b1b1b", i % 2 ? -0.15 : 0.15));
    REDOBLE.forEach((b, i) => ono("BUM", xg + (i % 2 ? -95 : 95) + azar(-2, 2), 330 - i * 18, b, 0.32, 30 + i * 5, "#ffd34d", "#3a2400", i % 2 ? -0.12 : 0.12));
    ono("¡MOOOC!", x0 + 700, 150, T_MOC, 0.75, 62, "#2fe3e8", "#06303a", -0.08);
    if (t > 1.0 && t < 2.6) bocadillo(g, x0 + 380, 120, "¡NINO NINO!", x0 + 470, 190, tramo(t, 1.0, 1.15) * (1 - tramo(t, 2.45, 2.6)), 34);
    ono("¡BUUUM!", xg + 30, 212, T_BUM, 0.6, 70, "#fffdf5", "#1b1b1b", 0.06);
    // ¡DESFILE!
    if (t > T_BUM + 0.05) {
      const d = t - T_BUM - 0.05, k = tramo(d, 0, 0.18), s = lerp(2.6, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 100); g.rotate(-0.04 + 0.02 * Math.sin(d * 3)); g.scale(s * 0.85, s * 0.85);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const n = 1 - a;
    if (n > 0) { g.fillStyle = `rgba(0,0,0,${n})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00247", nombre: "El desfile", crear: () => new ElDesfile() });
})();
