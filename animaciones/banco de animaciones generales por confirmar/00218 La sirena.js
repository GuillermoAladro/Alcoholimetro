"use strict";
/*
 * 00218 · LA SIRENA
 *
 * Animación del banco. Empieza y acaba en negro.
 * En la nave del parque de bomberos, con el camión aparcado. Marcos se toma un café tan tranquilo y Guillermo, curioso,
 * aprieta el botón rojo del panel: ¡NINO NINO! Luces azules y rojas, ondas, todo tiembla. Guillermo aprieta y aprieta
 * y no se apaga; Marcos se tapa los oídos y corren los dos de un lado a otro. Al final Marcos respira hondo, se acerca
 * y la apaga con un toque de dedo: silencio, las letras caen al suelo. Guillermo, aturdido, vuelve a acercar el dedo…
 * y Marcos le dice que ni se le ocurra. Se apagan las lámparas de la nave.
 */
(() => {
const CT = cacheTexto();
const ESC = 1.4;
const TX = 564, TY = 548, TS = 0.9;            // camión: centro, suelo y escala
const BOTON_L = [-104, -150];                   // botón de la sirena (coordenadas del camión)
const T_MIRA = 0.6, T_PULSA = 1.5, T_ON = 1.65, T_CORRE = 2.6, T_CALMA = 5.45, T_TOQUE = 6.35, T_OFF = 6.5;
const T_OTRA = 7.35, T_NO = 7.65, T_APAGA = 8.9, DUR = 9.8;
const TOQUES = [2.0, 2.25, 2.5];
const LAMPARAS = [190, 512, 834];

// ------------------------------------------------------------------------------------------- el camión
/** Camión de bomberos genérico, de perfil, mirando a la izquierda. (0, 0) = el suelo, en el centro. */
function pintarCamion(g) {
  g.lineJoin = "round"; g.lineCap = "round";
  g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(0, -2, 392, 14, 0, 0, 6.283); g.fill();
  g.fillStyle = "#4a5259"; g.fillRect(-124, -240, 12, 24); g.fillRect(296, -240, 12, 24);
  g.strokeStyle = "#353b41"; g.lineWidth = 8;
  g.beginPath(); g.moveTo(-170, -240); g.lineTo(382, -240); g.moveTo(-170, -260); g.lineTo(382, -260); g.stroke();
  g.strokeStyle = "#dfe5ea"; g.lineWidth = 4;
  g.beginPath(); g.moveTo(-170, -241); g.lineTo(382, -241); g.moveTo(-170, -261); g.lineTo(382, -261); g.stroke();
  g.strokeStyle = "#a9b2ba"; g.lineWidth = 4;
  for (let x = -160; x <= 376; x += 24) { g.beginPath(); g.moveTo(x, -257); g.lineTo(x, -244); g.stroke(); }
  const rojo = (y0, y1) => {
    const gr = g.createLinearGradient(0, y0, 0, y1);
    gr.addColorStop(0, "#ff6a55"); gr.addColorStop(0.16, "#ea2b1d"); gr.addColorStop(0.72, "#c41a10"); gr.addColorStop(1, "#7e0c07");
    return gr;
  };
  g.fillStyle = "#26292d"; g.fillRect(-350, -50, 716, 20);
  rectR(g, -178, -224, 556, 180, 10); g.fillStyle = rojo(-224, -44); g.fill();
  g.lineWidth = 3; g.strokeStyle = "#5e0805"; g.stroke();
  for (const x0 of [-36, 90, 216]) {
    const gr = g.createLinearGradient(x0, 0, x0 + 116, 0);
    gr.addColorStop(0, "#9aa3ab"); gr.addColorStop(0.35, "#eef2f5"); gr.addColorStop(0.7, "#b9c2ca"); gr.addColorStop(1, "#8a939b");
    rectR(g, x0, -208, 116, 88, 5); g.fillStyle = gr; g.fill();
    g.strokeStyle = "rgba(60,68,76,.45)"; g.lineWidth = 1.5;
    for (let y = -200; y < -124; y += 8) { g.beginPath(); g.moveTo(x0 + 3, y); g.lineTo(x0 + 113, y); g.stroke(); }
    g.fillStyle = "#4a5259"; rectR(g, x0 + 38, -130, 40, 6, 3); g.fill();
    g.strokeStyle = "#5e0805"; g.lineWidth = 2.5; rectR(g, x0, -208, 116, 88, 5); g.stroke();
  }
  // panel de mandos (en el sitio del primer cofre)
  const gp = g.createLinearGradient(0, -210, 0, -118);
  gp.addColorStop(0, "#59626b"); gp.addColorStop(1, "#2c3238");
  rectR(g, -164, -210, 120, 92, 7); g.fillStyle = gp; g.fill();
  g.strokeStyle = "#c9d0d6"; g.lineWidth = 3; g.stroke();
  for (const [x, y] of [[-138, -186], [-72, -186]]) {
    g.fillStyle = "#c9d0d6"; g.beginPath(); g.arc(x, y, 14, 0, 6.283); g.fill();
    g.fillStyle = "#fffdf5"; g.beginPath(); g.arc(x, y, 11, 0, 6.283); g.fill();
    g.strokeStyle = "#222"; g.lineWidth = 1.2;
    for (let i = 0; i < 7; i++) { const a = Math.PI * (0.8 + i * 0.233); g.beginPath(); g.moveTo(x + Math.cos(a) * 8, y + Math.sin(a) * 8); g.lineTo(x + Math.cos(a) * 10.5, y + Math.sin(a) * 10.5); g.stroke(); }
    g.strokeStyle = "#d8261c"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6, y - 6); g.stroke();
  }
  // aro del botón y cartelito con un altavoz
  g.fillStyle = "#ffd23a"; g.beginPath(); g.arc(BOTON_L[0], BOTON_L[1], 22, 0, 6.283); g.fill();
  g.strokeStyle = "#1b1b1b"; g.lineWidth = 2; g.stroke();
  g.fillStyle = "#1b1b1b";
  for (let i = 0; i < 8; i++) { const a = i * 0.785; g.save(); g.translate(BOTON_L[0], BOTON_L[1]); g.rotate(a); g.fillRect(17, -2.5, 6, 5); g.restore(); }
  // cabina
  g.beginPath();
  g.moveTo(-170, -44); g.lineTo(-170, -264); g.lineTo(-316, -264); g.quadraticCurveTo(-340, -264, -347, -242);
  g.lineTo(-364, -172); g.lineTo(-368, -62); g.quadraticCurveTo(-368, -44, -352, -44); g.closePath();
  g.fillStyle = rojo(-264, -44); g.fill(); g.lineWidth = 3; g.strokeStyle = "#5e0805"; g.stroke();
  const vidrio = g.createLinearGradient(0, -248, 0, -172);
  vidrio.addColorStop(0, "#e2f5ff"); vidrio.addColorStop(0.45, "#86bfe2"); vidrio.addColorStop(1, "#33648c");
  const ventanas = () => {
    g.beginPath(); g.moveTo(-335, -248); g.lineTo(-266, -248); g.lineTo(-266, -174); g.lineTo(-353, -174); g.closePath();
    g.moveTo(-252, -248); g.lineTo(-186, -248); g.lineTo(-186, -174); g.lineTo(-252, -174); g.closePath();
  };
  ventanas(); g.fillStyle = vidrio; g.fill(); g.strokeStyle = "#1f2226"; g.lineWidth = 5; g.stroke();
  g.save(); ventanas(); g.clip();
  g.fillStyle = "rgba(255,255,255,.55)";
  for (const x of [-322, -232]) { g.beginPath(); g.moveTo(x, -250); g.lineTo(x + 20, -250); g.lineTo(x - 22, -170); g.lineTo(x - 42, -170); g.closePath(); g.fill(); }
  g.fillStyle = "rgba(255,255,255,.3)";
  for (const x of [-290, -204]) { g.beginPath(); g.moveTo(x, -250); g.lineTo(x + 8, -250); g.lineTo(x - 34, -170); g.lineTo(x - 42, -170); g.closePath(); g.fill(); }
  g.restore();
  g.strokeStyle = "rgba(70,6,3,.75)"; g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(-358, -164); g.lineTo(-262, -164); g.lineTo(-262, -60); g.moveTo(-256, -164); g.lineTo(-180, -164); g.lineTo(-180, -60); g.stroke();
  g.fillStyle = "#dfe5ea"; rectR(g, -292, -156, 20, 5, 2.5); g.fill(); rectR(g, -212, -156, 20, 5, 2.5); g.fill();
  g.fillStyle = "#c9d0d6"; rectR(g, -354, -42, 76, 8, 3); g.fill();
  txt(g, "BOMBEROS", -266, -122, { tam: 36, peso: 900, fam: FD, color: "#ffd34d", borde: "#5a0a04", bordeAncho: 5, esp: 1.5, max: 168 });
  g.fillStyle = "#ffd23a"; g.fillRect(-367, -112, 744, 16);
  g.fillStyle = "#fff6c8"; g.fillRect(-367, -112, 744, 3); g.fillRect(-367, -99, 744, 2);
  g.fillStyle = "rgba(200,120,0,.35)";
  for (let x = -360; x < 372; x += 22) { g.beginPath(); g.moveTo(x, -96); g.lineTo(x + 8, -96); g.lineTo(x + 16, -112); g.lineTo(x + 8, -112); g.closePath(); g.fill(); }
  g.fillStyle = "#2a0503";
  for (const wx of [-268, 178, 286]) { g.beginPath(); g.arc(wx, -44, 55, Math.PI, 0); g.fill(); }
  for (const wx of [-268, 178, 286]) {
    g.fillStyle = "#141414"; g.beginPath(); g.arc(wx, -46, 46, 0, 6.283); g.fill();
    g.strokeStyle = "#383838"; g.lineWidth = 3; g.beginPath(); g.arc(wx, -46, 38, 0, 6.283); g.stroke();
    const gl = g.createRadialGradient(wx - 7, -54, 2, wx, -46, 26);
    gl.addColorStop(0, "#ffffff"); gl.addColorStop(0.5, "#c3cbd2"); gl.addColorStop(1, "#6a737b");
    g.fillStyle = gl; g.beginPath(); g.arc(wx, -46, 25, 0, 6.283); g.fill();
    g.fillStyle = "#4a5259";
    for (let i = 0; i < 6; i++) { const a = i * 1.047; g.beginPath(); g.arc(wx + Math.cos(a) * 15, -46 + Math.sin(a) * 15, 2.6, 0, 6.283); g.fill(); }
    g.fillStyle = "#d8261c"; g.beginPath(); g.arc(wx, -46, 7, 0, 6.283); g.fill();
  }
  const cromo = g.createLinearGradient(0, -84, 0, -42);
  cromo.addColorStop(0, "#ffffff"); cromo.addColorStop(0.5, "#aab3bb"); cromo.addColorStop(1, "#5d656e");
  g.fillStyle = cromo; rectR(g, -386, -84, 30, 42, 6); g.fill();
  // bocina de la sirena en el parachoques
  g.fillStyle = "#c9d0d6"; g.beginPath(); g.moveTo(-382, -76); g.lineTo(-404, -88); g.lineTo(-404, -54); g.lineTo(-382, -64); g.closePath(); g.fill();
  g.strokeStyle = "#5d656e"; g.lineWidth = 2; g.stroke();
  g.fillStyle = "#fff7c0"; g.beginPath(); g.ellipse(-364, -140, 6, 13, 0, 0, 6.283); g.fill();
  g.fillStyle = "#ffae2a"; g.beginPath(); g.ellipse(-366, -116, 4, 6, 0, 0, 6.283); g.fill();
  g.strokeStyle = "#2a2e33"; g.lineWidth = 4; g.beginPath(); g.moveTo(-345, -232); g.lineTo(-376, -226); g.stroke();
  g.fillStyle = "#2a2e33"; rectR(g, -388, -250, 12, 40, 4); g.fill();
  g.fillStyle = "#ff3b2a"; rectR(g, 371, -160, 8, 24, 2); g.fill();
  g.fillStyle = "#ffae2a"; rectR(g, 371, -134, 8, 12, 2); g.fill();
  g.fillStyle = "#2a2a2e"; rectR(g, -334, -272, 158, 10, 3); g.fill();
  for (const [x, col] of LUCES) {
    const gr = g.createLinearGradient(0, -288, 0, -270);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.4, col); gr.addColorStop(1, "#0a1a40");
    g.fillStyle = gr; rectR(g, x - 22, -288, 44, 18, 8); g.fill();
  }
}
const LUCES = [[-308, "#4f8dff"], [-255, "#ff4a4a"], [-202, "#4f8dff"]];
function lienzoCamion() {
  if (CT.has("camion")) return CT.get("camion");
  const c = lienzoNuevo(820 * TS, 310 * TS), g = c.getContext("2d");
  g.scale(TS, TS); g.translate(420, 295);
  pintarCamion(g);
  CT.set("camion", c);
  return c;
}
const enCamion = (x, y) => [TX + x * TS, TY + y * TS];
const BOTON = enCamion(BOTON_L[0], BOTON_L[1]);
const BOCINA = enCamion(-404, -71);

/** Gotitas (café). */
class Gotas {
  constructor(max, color) { this.max = max; this.d = []; this.color = color; }
  nueva(x, y, vx, vy, vida, r) { if (this.d.length < this.max) this.d.push({ x, y, vx, vy, v: vida, vm: vida, r }); }
  actualizar(dt) {
    for (let i = this.d.length - 1; i >= 0; i--) {
      const p = this.d[i];
      p.v -= dt; p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.v <= 0 || p.y > PIES + 10) { this.d[i] = this.d[this.d.length - 1]; this.d.pop(); }
    }
  }
  dibujar(g) {
    g.save(); g.fillStyle = this.color;
    for (const p of this.d) {
      g.globalAlpha = Math.min(1, (p.v / p.vm) * 3);
      g.beginPath(); g.ellipse(p.x, p.y, p.r * 0.8, p.r, Math.atan2(p.vy, p.vx) + Math.PI / 2, 0, 6.283); g.fill();
    }
    g.restore();
  }
}
/** Taza de café en la mano (unidades de avatar). */
function taza(g, x, y, ang, nivel) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.strokeStyle = "#e9e4da"; g.lineWidth = 3; g.beginPath(); g.arc(9, 0, 5, -1.3, 1.3); g.stroke();
  const gr = g.createLinearGradient(-9, 0, 9, 0);
  gr.addColorStop(0, "#cfc8bb"); gr.addColorStop(0.4, "#ffffff"); gr.addColorStop(1, "#bdb6a8");
  g.fillStyle = gr; rectR(g, -9, -9, 17, 19, 3); g.fill();
  g.fillStyle = "#d8261c"; g.fillRect(-9, -2, 17, 4);
  if (nivel > 0) { g.fillStyle = "#4a2a14"; g.beginPath(); g.ellipse(-0.5, -8, 7.5, 2, 0, 0, 6.283); g.fill(); }
  g.restore();
}

class LaSirena extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(320);
    this.cafe = new Gotas(80, "#5a3418");
  }
  on() { return this.t > T_ON && this.t < T_OFF; }
  xG() {
    const t = this.t;
    if (t < T_ON) return lerp(330, 362, eInOut(tramo(t, 0.45, 1.0)));
    if (t < T_CORRE) return lerp(362, 330, eOut(tramo(t, T_ON, T_ON + 0.3)));
    if (t < 3.3) return lerp(330, 110, eInOut(tramo(t, T_CORRE, 3.3)));
    if (t < 4.45) return lerp(110, 905, eInOut(tramo(t, 3.3, 4.45)));
    if (t < 5.4) return lerp(905, 225, eInOut(tramo(t, 4.45, 5.4)));
    if (t < T_OTRA) return 225;
    if (t < T_NO + 0.5) return lerp(225, 318, eInOut(tramo(t, T_OTRA, T_NO)));
    return lerp(318, 280, eInOut(tramo(t, T_NO + 0.5, T_NO + 0.9)));
  }
  xM() {
    const t = this.t;
    if (t < T_CORRE) return 800;
    if (t < 3.1) return lerp(800, 925, eInOut(tramo(t, T_CORRE, 3.1)));
    if (t < 4.3) return lerp(925, 150, eInOut(tramo(t, 3.1, 4.3)));
    if (t < 5.3) return lerp(150, 845, eInOut(tramo(t, 4.3, 5.3)));
    return lerp(845, 552, eInOut(tramo(t, T_CALMA + 0.25, T_TOQUE - 0.1)));
  }
  poses() {
    const t = this.t, xg = this.xG(), xm = this.xM();
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "bombero", cara: "dormido", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let yg = PIES, ym = PIES, gg = 0, gm = 0;
    const mG0 = matAv(xg, PIES, ESC), mM0 = matAv(xm, PIES, ESC);
    const boton = mG0.inverse().transformPoint(new DOMPoint(BOTON[0] - 4, BOTON[1] + 6));
    const anda = (a, b, f = 0.7) => { if (t > a && t < b) { const w = andar((t - a) * 13, f); return w; } return null; };
    // ---------------- Guillermo
    if (t < T_ON) {
      const w = anda(0.45, 1.0);
      if (w) { G.piernaI = w.piernaI; G.piernaD = w.piernaD; yg += w.bote; }
      const k = eInOut(tramo(t, T_MIRA + 0.3, T_PULSA));
      G.manoD = mezcla([70, 158], [boton.x, boton.y], k);
      G.manoI = [30, 120]; G.brazoIDelante = t > 1.0;
      G.rc = 0.16 * tramo(t, T_MIRA, T_MIRA + 0.3); G.cara = t < 1.0 ? "sonrisa" : "guino";
      if (t > 1.0) G.manoI = [34, 112];
    } else if (t < T_CORRE) {
      // salto del susto y aprieta otra vez, nervioso
      const u = tramo(t, T_ON, T_ON + 0.35);
      yg -= Math.sin(u * Math.PI) * 40;
      G.cara = "sorpresa"; G.puntas = eOut(u); G.rc = 0.12;
      G.manoI = [-14, 64];
      const mG = matAv(xg, PIES, ESC), b2 = mG.inverse().transformPoint(new DOMPoint(BOTON[0] - 4, BOTON[1] + 6));
      let pulsa = 0;
      for (const h of TOQUES) if (t > h - 0.1 && t < h + 0.12) pulsa = Math.max(pulsa, Math.sin(tramo(t, h - 0.1, h + 0.12) * Math.PI));
      G.manoD = t < TOQUES[0] - 0.25 ? [90, 70] : mezcla([88, 112], [b2.x, b2.y], pulsa);
    } else if (t < T_OFF + 0.05) {
      // corre tapándose los oídos
      const corre = t < 5.4;
      if (corre) { const w = andar(t * 22, 1.6); G.piernaI = w.piernaI; G.piernaD = w.piernaD; yg += w.bote; }
      G.manoD = [72, 44]; G.manoI = [6, 44]; G.brazoIDelante = true;
      G.cara = "sorpresa"; G.puntas = 1;
      const dir = t < 3.3 ? -1 : t < 4.45 ? 1 : -1;
      if (corre) { gg = 0.08 * dir; G.rc = 0.1 * dir; } else { G.cara = "dormido"; G.rc = 0.05 * Math.sin(t * 20); }
    } else {
      // silencio: aturdido; luego vuelve a por el botón y Marcos le para
      G.cara = "borracho"; G.puntas = 1 - tramo(t, 7.0, 7.5); G.rc = 0.08 * Math.sin(t * 5);
      const k = eOut(tramo(t, T_OFF, T_OFF + 0.3));
      G.manoD = mezcla([72, 44], [70, 158], k); G.manoI = mezcla([6, 44], [9, 160], k); G.brazoIDelante = k < 0.5;
      const w = anda(T_OTRA, T_NO, 0.6) || anda(T_NO + 0.5, T_NO + 0.9, 0.5);
      if (w) { G.piernaI = w.piernaI; G.piernaD = w.piernaD; yg += w.bote; }
      if (t > T_OTRA) {
        const mG = matAv(xg, PIES, ESC), b2 = mG.inverse().transformPoint(new DOMPoint(BOTON[0] - 6, BOTON[1] + 4));
        const ext = eInOut(tramo(t, T_OTRA, T_NO)) * (1 - eInOut(tramo(t, T_NO + 0.4, T_NO + 0.75)));
        G.manoD = mezcla([70, 158], [b2.x, b2.y], ext * 0.9);
        G.cara = t < T_NO + 0.1 ? "guino" : t < T_NO + 0.75 ? "sorpresa" : "risa"; G.rc = 0.14;
        if (t > T_NO + 0.75) { G.manoI = [30, 128]; G.manoD = [52, 130]; G.brazoIDelante = true; G.rc = 0.05; }
      }
    }
    // ---------------- Marcos
    if (t < T_ON) {
      // café, tan a gusto
      const b = boca(-0.25, "bombero");
      const sorbo = eInOut(tramo(t, 0.7, 1.1)) * (1 - eInOut(tramo(t, 1.35, 1.6)));
      M.manoD = mezcla([60, 128], [b[0] + 2, b[1] + 13], sorbo);
      M.rc = -0.25 * sorbo; M.cara = sorbo > 0.3 ? "dormido" : "sonrisa";
      M.manoI = [10, 140];
    } else if (t < T_CORRE) {
      const u = tramo(t, T_ON, T_ON + 0.35);
      ym -= Math.sin(u * Math.PI) * 46;
      M.cara = "sorpresa"; M.rc = -0.1;
      const k = eOut(tramo(t, T_ON + 0.25, T_ON + 0.5));
      M.manoD = mezcla([88, 60], [70, 52], k); M.manoI = mezcla([-16, 60], [4, 52], k); M.brazoIDelante = k > 0.5;
      if (t > T_ON + 0.5) M.cara = "dormido";
    } else if (t < T_CALMA) {
      const w = andar(t * 22 + 1.4, 1.6); M.piernaI = w.piernaI; M.piernaD = w.piernaD; ym += w.bote;
      M.manoD = [70, 52]; M.manoI = [4, 52]; M.brazoIDelante = true; M.cara = Math.sin(t * 5) > 0 ? "dormido" : "sorpresa";
      const dir = t < 3.1 ? 1 : t < 4.3 ? -1 : 1;
      gm = 0.08 * dir; M.rc = 0.1 * dir;
    } else if (t < T_OFF) {
      // respira hondo, se acerca tranquilo y la apaga con un dedo
      const resp = eInOut(tramo(t, T_CALMA, T_CALMA + 0.25));
      M.manoD = mezcla([70, 52], [67, 152], resp); M.manoI = mezcla([4, 52], [6, 152], resp); M.brazoIDelante = resp < 0.5;
      M.cara = "dormido"; M.rc = 0;
      const w = anda(T_CALMA + 0.25, T_TOQUE - 0.1, 0.5);
      if (w) { M.piernaI = w.piernaI; M.piernaD = w.piernaD; ym += w.bote * 0.6; }
      if (t > T_TOQUE - 0.3) {
        const mM = matAv(xm, PIES, ESC), b2 = mM.inverse().transformPoint(new DOMPoint(BOTON[0] + 2, BOTON[1] + 2));
        const k = eInOut(tramo(t, T_TOQUE - 0.3, T_TOQUE));
        M.manoI = mezcla([6, 152], [b2.x, b2.y], k); M.brazoIDelante = true; M.cara = "sonrisa"; M.rc = 0.1;
      }
    } else {
      const k = eInOut(tramo(t, T_OFF + 0.1, T_OFF + 0.4));
      const mM = matAv(xm, PIES, ESC), b2 = mM.inverse().transformPoint(new DOMPoint(BOTON[0] + 2, BOTON[1] + 2));
      M.manoI = mezcla([b2.x, b2.y], [16, 140], k); M.brazoIDelante = true;
      M.manoD = mezcla([67, 152], [76, 66], k); M.cara = "guino"; M.rc = -0.05;
      if (t > T_NO - 0.05) {
        // ¡ni se te ocurra!: dedo que dice que no
        const k2 = eOut(tramo(t, T_NO - 0.05, T_NO + 0.15));
        M.manoI = mezcla([16, 140], [-12 + 7 * Math.sin(t * 22), 58], k2);
        M.cara = "sorpresa"; M.rc = 0.14; M.manoD = [64, 140];
        if (t > T_NO + 0.8) { M.cara = "risa"; M.manoI = [16, 140]; M.manoD = [64, 140]; M.rc = 0.05; }
      }
    }
    // la taza de café
    const nivel = t < T_ON ? 1 : 0;
    if (t < T_ON + 0.4) {
      const angT = t < T_ON ? -0.9 * eInOut(tramo(t, 0.7, 1.1)) * (1 - eInOut(tramo(t, 1.35, 1.6))) : 1.2 * tramo(t, T_ON, T_ON + 0.3);
      M.objD2 = (g, m) => taza(g, m[0] - 3, m[1] - 8, angT, nivel);
    }
    return { G, M, mG: matAv(xg, yg, ESC, gg), mM: matAv(xm, ym, ESC, gm) };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.poses();
    if (t < T_ON && Math.random() < 6 * dt) {
      const c = aPant(e.mM, e.M._manoD || [60, 128]);
      p.nueva(P.VAPOR, c[0] - 4, c[1] - 30, azar(-8, 8), azar(-50, -30), azar(0.8, 1.2), azar(14, 22));
    }
    this.una("clic", t > T_PULSA, () => temblar(3, 0.1));
    this.una("on", t > T_ON, () => {
      temblar(16, 0.5);
      const c = aPant(e.mM, e.M._manoD || [60, 128]);
      for (let i = 0; i < 26; i++) this.cafe.nueva(c[0] + 14, c[1] - 14, azar(60, 300), azar(-420, -120), azar(0.6, 1.1), azar(3, 6));
      p.nueva(P.DESTELLO, BOTON[0], BOTON[1], 0, 0, 0.3, 260);
    });
    if (this.on() && Math.random() < 30 * dt) temblar(4, 0.12);
    // pasos al correr
    if (t > T_CORRE && t < 5.4 && Math.random() < 16 * dt) for (const x of [this.xG(), this.xM()]) p.nueva(P.POLVO, x + azar(-20, 20), PIES, azar(-40, 40), azar(-20, -5), azar(0.3, 0.6), azar(16, 24));
    this.una("toque", t > T_TOQUE, () => p.nueva(P.DESTELLO, BOTON[0], BOTON[1], 0, 0, 0.3, 120));
    this.una("off", t > T_OFF, () => {
      temblar(5, 0.2);
      this.chunks = [
        { x: 330, y: 92, vx: -60, vy: -260, r: 0, vr: -1.6, c: 0 },
        { x: 700, y: 92, vx: 70, vy: -200, r: 0, vr: 1.8, c: 1 },
      ];
    });
    if (this.chunks) for (const c of this.chunks) { c.vy += 1700 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.r += c.vr * dt; }
    p.actualizar(dt); this.cafe.actualizar(dt);
  }
  fondoFijo() {
    if (CT.has("fondo")) return CT.get("fondo");
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    // pared de bloques
    const gw = g.createLinearGradient(0, -60, 0, 548);
    gw.addColorStop(0, "#8d98a6"); gw.addColorStop(1, "#c7ccd3");
    g.fillStyle = gw; g.fillRect(-60, -60, W + 120, 610);
    g.strokeStyle = "rgba(60,70,80,.18)"; g.lineWidth = 2;
    for (let y = 20; y < 548; y += 34) {
      g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke();
      for (let x = ((y / 34) % 2) * 40 - 60; x < W + 60; x += 80) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 34); g.stroke(); }
    }
    // zócalo rojo
    g.fillStyle = "#a3241b"; g.fillRect(-60, 440, W + 120, 108);
    g.fillStyle = "#c8352a"; g.fillRect(-60, 440, W + 120, 8);
    // extintor y percha con un casco a la izquierda
    g.fillStyle = "#d8261c"; rectR(g, 70, 360, 34, 74, 12); g.fill();
    g.fillStyle = "#1b1b1b"; g.fillRect(80, 348, 14, 14); g.fillRect(94, 352, 22, 5);
    g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(76, 372, 5, 52);
    g.fillStyle = "#fffdf5"; rectR(g, 74, 388, 26, 18, 3); g.fill();
    // manguera enrollada en la pared derecha
    for (let i = 0; i < 4; i++) {
      g.strokeStyle = i % 2 ? "#e9dcc0" : "#cdbd98"; g.lineWidth = 11;
      g.beginPath(); g.arc(960, 320, 48 - i * 10, 0, 6.283); g.stroke();
    }
    g.fillStyle = "#3a3f45"; g.fillRect(954, 262, 12, 20);
    // reloj
    g.fillStyle = "#fffdf5"; g.beginPath(); g.arc(92, 150, 40, 0, 6.283); g.fill();
    g.strokeStyle = "#2a2e33"; g.lineWidth = 6; g.stroke();
    g.lineWidth = 4; g.beginPath(); g.moveTo(92, 150); g.lineTo(92, 122); g.moveTo(92, 150); g.lineTo(112, 156); g.stroke();
    // suelo pulido
    const gs = g.createLinearGradient(0, 548, 0, H + 60);
    gs.addColorStop(0, "#5f646b"); gs.addColorStop(1, "#30343a");
    g.fillStyle = gs; g.fillRect(-60, 548, W + 120, H);
    g.fillStyle = "rgba(255,255,255,.2)"; g.fillRect(-60, 548, W + 120, 2);
    g.fillStyle = "#e5c22a"; g.fillRect(-60, 586, W + 120, 6);
    // lámparas colgadas (apagadas: la luz se pinta aparte)
    for (const x of LAMPARAS) {
      g.strokeStyle = "#222"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, -60); g.lineTo(x, 18); g.stroke();
      g.fillStyle = "#2f3a44"; g.beginPath(); g.moveTo(x - 46, 44); g.lineTo(x + 46, 44); g.lineTo(x + 16, 16); g.lineTo(x - 16, 16); g.closePath(); g.fill();
    }
    CT.set("fondo", c);
    return c;
  }
  /** Luz de la nave (0 apagada – 1 encendida), con parpadeo al encender y lámparas que se apagan al final. */
  luzLampara(i) {
    const t = this.t;
    let on = t > 0.12 + i * 0.12 ? 1 : 0;
    if (t > 0.12 + i * 0.12 && t < 0.3 + i * 0.12) on = Math.sin(t * 90 + i) > 0 ? 1 : 0.2;
    if (t > T_APAGA + i * 0.22) on = 0;
    return on;
  }
  dibujar(g) {
    const t = this.t, e = this.poses();
    fondo(g, "#000");
    g.drawImage(this.fondoFijo(), -60, -60);
    const C = lienzoCamion();
    g.drawImage(C, TX - 420 * TS, TY - 295 * TS);
    // botón
    const pr = t > T_PULSA - 0.05 && t < T_ON + 0.1 ? 1 : TOQUES.some((h) => Math.abs(t - h) < 0.1) || Math.abs(t - T_TOQUE) < 0.12 ? 1 : 0;
    const bx = BOTON[0], by = BOTON[1], br = 15;
    g.fillStyle = "#6a0a05"; g.beginPath(); g.ellipse(bx, by + 4, br, br * 0.9, 0, 0, 6.283); g.fill();
    const gb = g.createRadialGradient(bx - 5, by - 6 + pr * 3, 2, bx, by + pr * 3, br);
    gb.addColorStop(0, "#ff9a8a"); gb.addColorStop(0.5, "#e8261c"); gb.addColorStop(1, "#8e100b");
    g.fillStyle = gb; g.beginPath(); g.arc(bx, by - 2 + pr * 3, br, 0, 6.283); g.fill();
    if (this.on()) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 + 0.3 * Math.sin(t * 30); g.drawImage(BLOB.rojo, bx - 40, by - 40, 80, 80); g.restore(); }
    // luces de la barra (por detrás de los dos)
    if (this.on()) {
      const fase = Math.floor(t * 6) % 2;
      g.save(); g.globalCompositeOperation = "lighter";
      LUCES.forEach(([x], i) => {
        const azul = i !== 1, enc = azul ? fase === 0 : fase === 1;
        if (!enc) return;
        const [sx, sy] = enCamion(x, -279);
        g.globalAlpha = 0.95; g.drawImage(azul ? BLOB2.cian : BLOB.rojo, sx - 120, sy - 90, 240, 180);
        g.globalAlpha = 0.9; g.drawImage(BLOB.blanco, sx - 26, sy - 18, 52, 36);
      });
      g.restore();
    }
    pintarAvatar(g, e.mM, e.M, t);
    pintarAvatar(g, e.mG, e.G, t);
    this.cafe.dibujar(g);
    this.p.dibujar(g);
    // la sirena: luces, ondas y color
    const on = this.on();
    if (on) {
      const fase = Math.floor(t * 6) % 2;
      g.save();
      g.fillStyle = fase ? "rgba(255,40,40,.16)" : "rgba(40,100,255,.16)";
      g.fillRect(-60, -60, W + 120, H + 120);
      g.restore();
      // ondas de sonido desde la bocina y la barra de luces
      g.save(); g.lineCap = "round";
      for (let i = 0; i < 4; i++) {
        const u = ((t - T_ON) * 1.6 + i / 4) % 1, r = 30 + u * 260;
        g.strokeStyle = `rgba(255,255,255,${0.8 * (1 - u)})`; g.lineWidth = 9 * (1 - u) + 2;
        g.beginPath(); g.arc(BOCINA[0], BOCINA[1], r, Math.PI * 0.72, Math.PI * 1.28); g.stroke();
        const [lx, ly] = enCamion(-255, -282);
        g.beginPath(); g.arc(lx, ly, r * 0.8, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
      }
      g.restore();
    }
    // textos cortos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 7, esp: 2, alfa: 1 - tramo(d, dur - 0.12, dur) });
      g.restore();
    };
    ono("¡CLIC!", BOTON[0] - 10, BOTON[1] - 60, T_PULSA - 0.02, 0.35, 34, "#fffdf5", "#1b1b1b", -0.1);
    TOQUES.forEach((h, i) => ono("¡CLIC!", BOTON[0] - 50 + i * 40, BOTON[1] - 70 - i * 18, h, 0.3, 30, "#fffdf5", "#1b1b1b", -0.15 + i * 0.12));
    ono("clic", BOTON[0] - 62, BOTON[1] - 34, T_TOQUE, 0.6, 32, "#fffdf5", "#1b1b1b", -0.1);
    // ¡NINO NINO!
    if (on) {
      const d = t - T_ON, k = eBack(tramo(d, 0, 0.2));
      const lado = Math.floor(d * 4) % 2;
      const s0 = this.titulo(0), s1 = this.titulo(1);
      for (const [spr, x, act] of [[s0, 330, lado === 0], [s1, 700, lado === 1]]) {
        const s = k * (act ? 1.12 : 0.92);
        g.save(); g.translate(x + (act ? azar(-3, 3) : 0), 92 + (act ? azar(-3, 3) : 0)); g.rotate(act ? -0.05 : 0.03); g.scale(s, s);
        g.globalAlpha = act ? 1 : 0.8;
        g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
      }
    } else if (this.chunks && t < T_OFF + 1.3) {
      const a = 1;
      for (const c of this.chunks) {
        const spr = this.titulo(c.c);
        g.save(); g.globalAlpha = a; g.translate(c.x, c.y); g.rotate(c.r); g.scale(0.92, 0.92);
        g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
      }
    }
    // ¿y ahora qué? / pitido en los oídos
    if (t > T_OFF + 0.2 && t < T_OTRA) {
      const c = aPant(e.mG, [39, 30]);
      for (let i = 0; i < 3; i++) {
        const a = t * 5 + i * 2.094;
        brillo(g, c[0] + Math.cos(a) * 55, c[1] - 50 + Math.sin(a) * 14, 16, 0.9);
      }
    }
    if (t > T_CORRE + 0.4 && t < 3.9) bocadillo(g, 250, 230, "¿CÓMO SE APAGA?", aPant(e.mG, [39, 20])[0], aPant(e.mG, [39, 20])[1] - 20, tramo(t, T_CORRE + 0.4, T_CORRE + 0.6) * (1 - tramo(t, 3.75, 3.9)), 34);
    if (t > T_NO && t < T_APAGA) {
      const c = aPant(e.mM, [10, 30]);
      bocadillo(g, 610, 150, "¡NI SE TE OCURRA!", c[0] - 10, c[1] - 30, tramo(t, T_NO, T_NO + 0.2) * (1 - tramo(t, T_APAGA - 0.15, T_APAGA)), 40);
    }
    // luz de la nave: lámparas encendidas o apagadas
    let osc = 0;
    g.save();
    LAMPARAS.forEach((x, i) => {
      const l = this.luzLampara(i);
      osc += (1 - l) / 3;
      if (l > 0) {
        g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.55 * l;
        g.drawImage(BLOB.amarillo, x - 90, 10, 180, 90);
        g.globalCompositeOperation = "source-over"; g.globalAlpha = l;
        g.fillStyle = "#fff6c8"; g.beginPath(); g.ellipse(x, 44, 30, 6, 0, 0, 6.283); g.fill();
      }
    });
    g.restore();
    const negro = t < 0.5 ? Math.min(1, osc * 1.15 + (t < 0.12 ? 1 : 0)) : t > T_APAGA ? Math.min(1, osc * 0.75 + tramo(t, T_APAGA + 0.5, DUR - 0.05)) : 0;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo(i) {
    const clave = "t" + i;
    if (CT.has(clave)) return CT.get(clave);
    const c = lienzoNuevo(460, 190), g = c.getContext("2d");
    const azul = i === 0;
    const gr = g.createLinearGradient(0, 40, 0, 160);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.45, azul ? "#9cc4ff" : "#ff9c9c"); gr.addColorStop(1, azul ? "#2f6dff" : "#ff2a2a");
    const s = azul ? "¡NINO" : "NINO!";
    txt(g, s, 236, 150, { tam: 150, peso: 400, fam: FC, color: "#120a1a", esp: 4, max: 420 });
    txt(g, s, 230, 144, { tam: 150, peso: 400, fam: FC, color: gr, borde: "#120a1a", bordeAncho: 12, esp: 4, glow: azul ? "rgba(80,140,255,.9)" : "rgba(255,70,70,.9)", glowTam: 26, max: 420 });
    CT.set(clave, c);
    return c;
  }
}

registrar({ id: "00218", nombre: "La sirena", crear: () => new LaSirena() });
})();
