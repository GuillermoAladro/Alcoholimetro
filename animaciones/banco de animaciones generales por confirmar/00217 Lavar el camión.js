"use strict";
/*
 * 00217 · LAVAR EL CAMIÓN
 *
 * Animación del banco. Empieza y acaba en negro.
 * Delante del parque de bomberos, Guillermo y Marcos (de uniforme) frotan el camión aparcado, que está lleno de barro.
 * Guillermo moja la esponja en el cubo y la espuma crece y crece hasta taparlo entero (solo asoma su mano con la
 * esponja). Marcos se parte de risa, coge la manguera y lo aclara a él y al camión… y los dos y el camión quedan
 * relucientes, con destellos: ¡QUE BRILLE! Se cierra en iris sobre el guiño de Guillermo.
 */
(() => {
const CT = cacheTexto();
const ESC = 1.42;
const XG0 = 300, XG1 = 352, XM = 742;
const TX = 512, TY = 548, TS = 0.94;          // camión: centro, suelo y escala
const CUBO = [452, 454];                       // boca del cubo (encima de una caja)
const ROLLO = [826, 432];                      // la manguera enrollada, colgada detrás del camión
const T_FROTA = 0.6, T_PASO = 2.15, T_MOJA = 2.6, T_BLUP = 3.0, T_RIE = 3.55, T_COGE = 4.25, T_AGUA = 4.85;
const T_BARRE = 5.9, T_PARA = 6.6, T_TING = 6.9, T_IRIS = 9.15, DUR = 10.0;

// ------------------------------------------------------------------------------------------- el camión
/** Camión de bomberos genérico, de perfil, mirando a la izquierda. (0, 0) = el suelo, en el centro. */
function pintarCamion(g) {
  g.lineJoin = "round"; g.lineCap = "round";
  g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(0, -2, 392, 14, 0, 0, 6.283); g.fill();
  // escalera del techo
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
  // bastidor
  g.fillStyle = "#26292d"; g.fillRect(-350, -50, 716, 20);
  // caja de herramientas
  rectR(g, -178, -224, 556, 180, 10); g.fillStyle = rojo(-224, -44); g.fill();
  g.lineWidth = 3; g.strokeStyle = "#5e0805"; g.stroke();
  // persianas de los cofres
  for (const x0 of [-162, -36, 90, 216]) {
    const gr = g.createLinearGradient(x0, 0, x0 + 116, 0);
    gr.addColorStop(0, "#9aa3ab"); gr.addColorStop(0.35, "#eef2f5"); gr.addColorStop(0.7, "#b9c2ca"); gr.addColorStop(1, "#8a939b");
    rectR(g, x0, -208, 116, 88, 5); g.fillStyle = gr; g.fill();
    g.strokeStyle = "rgba(60,68,76,.45)"; g.lineWidth = 1.5;
    for (let y = -200; y < -124; y += 8) { g.beginPath(); g.moveTo(x0 + 3, y); g.lineTo(x0 + 113, y); g.stroke(); }
    g.fillStyle = "#4a5259"; rectR(g, x0 + 38, -130, 40, 6, 3); g.fill();
    g.strokeStyle = "#5e0805"; g.lineWidth = 2.5; rectR(g, x0, -208, 116, 88, 5); g.stroke();
  }
  // cabina
  g.beginPath();
  g.moveTo(-170, -44); g.lineTo(-170, -264); g.lineTo(-316, -264); g.quadraticCurveTo(-340, -264, -347, -242);
  g.lineTo(-364, -172); g.lineTo(-368, -62); g.quadraticCurveTo(-368, -44, -352, -44); g.closePath();
  g.fillStyle = rojo(-264, -44); g.fill(); g.lineWidth = 3; g.strokeStyle = "#5e0805"; g.stroke();
  // ventanas
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
  // puertas, maneta y estribo
  g.strokeStyle = "rgba(70,6,3,.75)"; g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(-358, -164); g.lineTo(-262, -164); g.lineTo(-262, -60); g.moveTo(-256, -164); g.lineTo(-180, -164); g.lineTo(-180, -60); g.stroke();
  g.fillStyle = "#dfe5ea"; rectR(g, -292, -156, 20, 5, 2.5); g.fill(); rectR(g, -212, -156, 20, 5, 2.5); g.fill();
  g.fillStyle = "#c9d0d6"; rectR(g, -354, -42, 76, 8, 3); g.fill();
  // rótulo
  txt(g, "BOMBEROS", -266, -122, { tam: 36, peso: 900, fam: FD, color: "#ffd34d", borde: "#5a0a04", bordeAncho: 5, esp: 1.5, max: 168 });
  // banda reflectante
  g.fillStyle = "#ffd23a"; g.fillRect(-367, -112, 744, 16);
  g.fillStyle = "#fff6c8"; g.fillRect(-367, -112, 744, 3); g.fillRect(-367, -99, 744, 2);
  g.fillStyle = "rgba(200,120,0,.35)";
  for (let x = -360; x < 372; x += 22) { g.beginPath(); g.moveTo(x, -96); g.lineTo(x + 8, -96); g.lineTo(x + 16, -112); g.lineTo(x + 8, -112); g.closePath(); g.fill(); }
  // pasos de rueda
  g.fillStyle = "#2a0503";
  for (const wx of [-268, 178, 286]) { g.beginPath(); g.arc(wx, -44, 55, Math.PI, 0); g.fill(); }
  // ruedas
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
  // parachoques, faro, espejo, piloto de atrás
  const cromo = g.createLinearGradient(0, -84, 0, -42);
  cromo.addColorStop(0, "#ffffff"); cromo.addColorStop(0.5, "#aab3bb"); cromo.addColorStop(1, "#5d656e");
  g.fillStyle = cromo; rectR(g, -386, -84, 30, 42, 6); g.fill();
  g.fillStyle = "#fff7c0"; g.beginPath(); g.ellipse(-364, -140, 6, 13, 0, 0, 6.283); g.fill();
  g.fillStyle = "#ffae2a"; g.beginPath(); g.ellipse(-366, -116, 4, 6, 0, 0, 6.283); g.fill();
  g.strokeStyle = "#2a2e33"; g.lineWidth = 4; g.beginPath(); g.moveTo(-345, -232); g.lineTo(-376, -226); g.stroke();
  g.fillStyle = "#2a2e33"; rectR(g, -388, -250, 12, 40, 4); g.fill();
  g.fillStyle = "#ff3b2a"; rectR(g, 371, -160, 8, 24, 2); g.fill();
  g.fillStyle = "#ffae2a"; rectR(g, 371, -134, 8, 12, 2); g.fill();
  // barra de luces
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
  const c = lienzoNuevo(800 * TS, 310 * TS), g = c.getContext("2d");
  g.scale(TS, TS); g.translate(400, 295);
  pintarCamion(g);
  CT.set("camion", c);
  return c;
}
const enCamion = (x, y) => [TX + x * TS, TY + y * TS];

// ------------------------------------------------------------------------------------------- agua
/** Gotas de agua (las partículas del motor son de cerveza). */
class Agua {
  constructor(max) { this.max = max; this.d = []; }
  nueva(x, y, vx, vy, vida, r) { if (this.d.length < this.max) this.d.push({ x, y, vx, vy, v: vida, vm: vida, r }); }
  actualizar(dt) {
    for (let i = this.d.length - 1; i >= 0; i--) {
      const p = this.d[i];
      p.v -= dt; p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.v <= 0 || p.y > PIES + 10) { this.d[i] = this.d[this.d.length - 1]; this.d.pop(); }
    }
  }
  dibujar(g) {
    if (!this.d.length) return;
    g.save();
    for (const p of this.d) {
      const a = Math.atan2(p.vy, p.vx), v = Math.hypot(p.vx, p.vy), k = Math.min(1, (p.v / p.vm) * 3);
      g.globalAlpha = 0.9 * k; g.fillStyle = "#8fdcff";
      g.beginPath(); g.ellipse(p.x, p.y, p.r * (1 + Math.min(1.6, v / 500)), p.r * 0.75, a, 0, 6.283); g.fill();
      g.globalAlpha = 0.8 * k; g.fillStyle = "#ffffff";
      g.beginPath(); g.arc(p.x - p.r * 0.25, p.y - p.r * 0.3, p.r * 0.3, 0, 6.283); g.fill();
    }
    g.restore();
  }
}
/** Chorro de agua de (x0, y0) a (x1, y1) con una curva hacia arriba. */
function chorro(g, x0, y0, x1, y1, t, a = 1) {
  const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - 40 - Math.abs(x1 - x0) * 0.12;
  g.save(); g.globalAlpha = a; g.lineCap = "round";
  const ruta = () => { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1); };
  ruta(); g.strokeStyle = "rgba(40,150,230,.55)"; g.lineWidth = 22; g.stroke();
  ruta(); g.strokeStyle = "#7fd4ff"; g.lineWidth = 13; g.stroke();
  ruta(); g.strokeStyle = "#e8fbff"; g.lineWidth = 5; g.setLineDash([26, 18]); g.lineDashOffset = -t * 900; g.stroke();
  g.setLineDash([]);
  g.restore();
}

// ------------------------------------------------------------------------------------------- objetos
function esponja(g, x, y, ang, espuma) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const gr = g.createLinearGradient(0, -8, 0, 8);
  gr.addColorStop(0, "#fff08a"); gr.addColorStop(0.5, "#ffd23a"); gr.addColorStop(1, "#d99a00");
  rectR(g, -12, -8, 24, 16, 5); g.fillStyle = gr; g.fill();
  g.strokeStyle = "#8a5a00"; g.lineWidth = 1.4; g.stroke();
  g.fillStyle = "rgba(150,90,0,.45)";
  for (const [px, py] of [[-6, -3], [2, -4], [7, 2], [-2, 3], [-8, 4], [5, -1]]) { g.beginPath(); g.arc(px, py, 1.3, 0, 6.283); g.fill(); }
  if (espuma > 0) {
    for (const [px, py, r] of [[-8, -9, 6], [0, -11, 7.5], [8, -9, 6], [-3, -15, 5], [5, -15, 4.5]]) {
      const rr = r * espuma;
      g.drawImage(SPR.espuma, px - rr, py - rr, rr * 2, rr * 2);
    }
  }
  g.restore();
}
function boquilla(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.fillStyle = "#1d1f22"; rectR(g, -10, -5.5, 22, 11, 3); g.fill();
  const gr = g.createLinearGradient(0, -5, 0, 5);
  gr.addColorStop(0, "#fff0b0"); gr.addColorStop(0.5, "#d9a21c"); gr.addColorStop(1, "#7a5200");
  g.fillStyle = gr; g.beginPath(); g.moveTo(10, -5); g.lineTo(30, -3.2); g.lineTo(30, 3.2); g.lineTo(10, 5); g.closePath(); g.fill();
  g.fillStyle = "#c22016"; rectR(g, 2, -9, 5, 7, 1.5); g.fill();
  g.restore();
}

class LavarCamion extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(380);
    this.agua = new Agua(300);
    const r = semilla(23);
    // barro en el camión (coordenadas del camión)
    this.barro = [];
    for (let i = 0; i < 30; i++) {
      const x = -340 + r() * 600, y = -235 + r() * 200;
      const [sx, sy] = enCamion(x, y);
      let tL = T_BARRE + clamp((sx - 170) / 460, 0, 1) * (T_PARA - T_BARRE - 0.1);
      let frota = 0;
      if (sx > 330 && sx < 470 && sy > 340 && sy < 470) frota = 0.7;
      if (sx > 590) { frota = 1; tL = 99; }
      this.barro.push({ x, y, r: 9 + r() * 16, rot: r() * 3, tL, frota, f: r() });
    }
    // la espuma que tapa a Guillermo (respecto a sus pies, en píxeles)
    this.bolas = [];
    // forma de cúpula: ancha abajo y estrecha arriba (para que asome la mano levantada a un lado)
    const anchoEn = (h) => (h < 170 ? 140 : h < 260 ? lerp(140, 86, (h - 170) / 90) : Math.sqrt(Math.max(0, 90 * 90 - (h - 260) * (h - 260))));
    for (let i = 0; i < 46; i++) {
      const R = 30 + r() * 22;
      const h = R * 0.5 + Math.pow(r(), 0.85) * (345 - R * 1.5);
      const w = Math.max(0, anchoEn(h) - R * 0.8);
      this.bolas.push({ dx: (r() * 2 - 1) * w, h, R, f: r() * 6,
        tb: T_BLUP + (h / 330) * 1.15 + r() * 0.1, tw: T_AGUA + 0.05 + (1 - h / 330) * 0.95 });
    }
    for (const [dx, h] of [[0, 318], [-24, 300], [24, 300], [0, 270]]) {
      this.bolas.push({ dx, h, R: 36, f: r() * 6, tb: T_BLUP + 1.1 + r() * 0.1, tw: T_AGUA + 0.05 + (1 - h / 330) * 0.95 });
    }
    this.bolas.sort((a, b) => b.h - a.h);
    this.parches = [];      // espuma que dejan las esponjas en el camión
    this.ultParche = 0;
  }
  // ---------------------------------------------------------------------- posiciones
  xG() { return lerp(XG0, XG1, eInOut(tramo(this.t, T_PASO, T_PASO + 0.4))); }
  /** Cuánto lo levanta la espuma (escondido dentro) */
  alzaG() { return 0; }
  objetivo() {
    const t = this.t;
    if (t < T_BARRE) {
      const u = tramo(t, T_AGUA, T_BARRE);
      return [XG1 + 30 * Math.sin(t * 7), lerp(215, 520, eInOut(u))];
    }
    const u = tramo(t, T_BARRE, T_PARA);
    return [lerp(180, 600, eInOut(u)), 370 + 28 * Math.sin(t * 9)];
  }
  poses() {
    const t = this.t, xg = this.xG(), alza = this.alzaG();
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let yg = PIES - alza, ym = PIES, gG = 0, sM = 1;
    let espG = 0, espM = true;
    // ---- Guillermo
    if (t < T_PASO) {
      const k = eInOut(tramo(t, T_FROTA - 0.3, T_FROTA));
      const s = t * 9;
      G.manoD = mezcla([70, 158], [100 + 15 * Math.cos(s), 112 + 13 * Math.sin(s)], k);
      G.manoI = [20, 140];
      G.rc = 0.06; G.cara = "sonrisa";
      if (t > 1.55 && t < 2.05) { G.rc = 0.16; G.cara = "guino"; }
    } else if (t < T_BLUP) {
      // da un paso hacia el cubo y moja la esponja
      if (t < T_PASO + 0.4) { const a = andar((t - T_PASO) * 14, 0.6); G.piernaI = a.piernaI; G.piernaD = a.piernaD; yg += a.bote; }
      const mG = matAv(xg, PIES, ESC);
      const cubo = mG.inverse().transformPoint(new DOMPoint(CUBO[0], CUBO[1] + 8));
      const baja = eInOut(tramo(t, T_MOJA - 0.2, T_MOJA)) * (1 - eInOut(tramo(t, T_MOJA + 0.15, T_BLUP)));
      G.manoD = mezcla([84, 120], [cubo.x, cubo.y], baja);
      G.manoI = [20, 140]; G.cara = baja > 0.6 ? "guino" : "sonrisa"; G.rc = 0.1 * baja;
      espG = tramo(t, T_MOJA, T_BLUP);
      if (t > T_MOJA + 0.15) { G.manoD = mezcla(G.manoD, [76, 70], tramo(t, T_MOJA + 0.15, T_BLUP)); espG = 1; }
    } else if (t < T_AGUA + 0.6) {
      // la espuma crece: brazos arriba; dentro de la espuma, saluda con la esponja
      const k = eOut(tramo(t, T_BLUP, T_BLUP + 0.3));
      G.manoD = mezcla([76, 70], [106 + 14 * Math.sin(t * 10), -6 + 6 * Math.cos(t * 10)], k);
      G.manoI = [-8 + 8 * Math.sin(t * 13), 40 + 14 * Math.sin(t * 11)];
      G.cara = "sorpresa"; G.puntas = 0.5 * (1 - tramo(t, 3.6, 3.8)); G.rc = 0.08 * Math.sin(t * 6);
      espG = 1;
    } else {
      // aclarado: ojos cerrados bajo el chorro, luego se sacude
      G.cara = t < 5.75 ? "dormido" : "sorpresa"; G.puntas = 0.75;
      G.manoD = [104 + 10 * Math.sin(t * 9), -6]; G.manoI = [-10, 60];
      espG = Math.max(0, 1 - tramo(t, 5.4, 5.8));
      if (t > T_PARA - 0.2) {
        const k = eInOut(tramo(t, T_PARA - 0.2, T_PARA + 0.1)), s = Math.sin(t * 40) * (1 - tramo(t, T_PARA + 0.1, T_TING));
        G.manoD = mezcla(G.manoD, [76, 120], k); G.manoI = mezcla(G.manoI, [9, 150], k);
        gG = 0.06 * s; G.cara = "risa"; G.puntas = 0.75 * (1 - tramo(t, T_PARA + 0.2, T_TING + 0.2));
      }
      if (t > T_TING) {
        // ¡pulgar arriba!
        const k = eOut(tramo(t, T_TING, T_TING + 0.3));
        G.manoD = mezcla([76, 120], [92, 74 + 3 * Math.sin(t * 5)], k); G.manoI = mezcla([9, 150], [18, 140], k);
        G.cara = t < 8.0 || t > 8.9 ? "guino" : "risa"; G.rc = -0.05;
      }
    }
    // ---- Marcos
    if (t < T_BLUP) {
      const k = eInOut(tramo(t, T_FROTA - 0.2, T_FROTA + 0.1)), s = t * 8 + 1;
      M.manoI = mezcla([6, 152], [-26 + 13 * Math.cos(s), 108 + 11 * Math.sin(s)], k);
      M.manoD = [64, 136]; M.cara = "guino"; M.rc = -0.06;
      if (t > 1.55 && t < 2.05) { M.cara = "risa"; M.rc = -0.16; }
      if (t > T_MOJA) { M.cara = "sonrisa"; M.rc = -0.12; }
    } else if (t < T_COGE) {
      M.cara = t < T_RIE ? "sorpresa" : "risa"; M.rc = -0.14;
      espM = t < T_BLUP + 0.25;
      if (t > T_RIE) {
        // se parte de risa
        const s = Math.sin(t * 22);
        M.brazoIDelante = true; M.manoD = [46, 132 + 3 * s]; M.manoI = [26, 132 - 3 * s]; sM = 1 - 0.03 * Math.abs(s);
        M.rc = -0.1 + 0.06 * Math.sin(t * 11);
      } else { M.manoD = [80, 96]; M.manoI = [-6, 100]; }
      espM = false;
    } else {
      espM = false;
      const mM = matAv(XM, PIES, ESC);
      const rollo = mM.inverse().transformPoint(new DOMPoint(ROLLO[0], ROLLO[1] + 14));
      const coge = eInOut(tramo(t, T_COGE, T_COGE + 0.3)), apunta = eInOut(tramo(t, T_COGE + 0.35, T_AGUA));
      M.manoD = mezcla(mezcla([67, 152], [rollo.x, rollo.y], coge), [10, 114], apunta);
      M.manoI = mezcla([6, 152], [-6, 110], apunta);
      M.cara = t < T_AGUA ? "guino" : t < T_BARRE ? "risa" : "guino"; M.rc = -0.08;
      if (t > T_PARA) {
        // posa con la manguera en alto
        const k = eOut(tramo(t, T_PARA, T_PARA + 0.35));
        M.manoD = mezcla([10, 114], [74, 44], k); M.manoI = mezcla([-6, 110], [16, 136], k);
        M.cara = t > T_TING ? (t < 8.3 ? "risa" : "guino") : "sonrisa"; M.rc = -0.05;
      }
    }
    // objetos en las manos
    const angEsp = (t > T_BLUP && t < T_PARA) ? -0.2 : 0;
    G.objD2 = (g, m, a) => { const d = (t > T_BLUP && t < 5.6) ? 13 : 4; esponja(g, m[0] + Math.cos(a) * d, m[1] + Math.sin(a) * d, angEsp, espG); };
    if (espM) M.objI2 = (g, m) => esponja(g, m[0] - 2, m[1] - 2, 0.1, 0);
    if (t > T_COGE + 0.1) {
      M.objD2 = (g, m) => {
        let ang;
        if (t < T_PARA) { const o = this.objetivo(), mm = matAv(XM, PIES, ESC), q = aPant(mm, m); ang = Math.atan2(o[1] - q[1], o[0] - q[0]); }
        else ang = lerp(Math.PI, -Math.PI / 2, eOut(tramo(t, T_PARA, T_PARA + 0.35)));
        if (t < T_COGE + 0.35) ang = lerp(Math.PI / 2, ang, eInOut(tramo(t, T_COGE + 0.1, T_COGE + 0.35)));
        this.angBoq = ang;
        boquilla(g, m[0], m[1], ang);
      };
    }
    return { G, M, mG: matAv(xg, yg, ESC, gG), mM: matAv(XM, ym, ESC, 0, 1, sM) };
  }
  limpio(b) {
    const t = this.t;
    let a = 1 - b.frota * eInOut(tramo(t, T_FROTA + 0.2 + b.f * 0.4, 2.3 + b.f * 0.2));
    a *= 1 - tramo(t, b.tL, b.tL + 0.18);
    return a;
  }
  // ---------------------------------------------------------------------- actualizar
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, ag = this.agua;
    const e = this.poses();
    // la espuma de las esponjas
    if (t > T_FROTA && t < T_PASO && t - this.ultParche > 0.22 && this.parches.length < 14) {
      this.ultParche = t;
      for (const [m, pose, q] of [[e.mG, e.G, [100 + 15 * Math.cos(t * 9), 112 + 13 * Math.sin(t * 9)]], [e.mM, e.M, [-26 + 13 * Math.cos(t * 8 + 1), 108 + 11 * Math.sin(t * 8 + 1)]]]) {
        void pose;
        const s = aPant(m, q);
        this.parches.push({ x: s[0] + azar(-14, 14), y: s[1] + azar(-12, 12), r: azar(10, 17), t0: t });
        p.nueva(P.ESPUMA, s[0], s[1], azar(-60, 60), azar(-160, -60), azar(0.5, 0.9), azar(4, 7));
      }
    }
    this.una("chof", t > T_MOJA, () => {
      temblar(4, 0.15);
      for (let i = 0; i < 10; i++) p.nueva(P.ESPUMA, CUBO[0] + azar(-20, 20), CUBO[1] - 4, azar(-80, 80), azar(-220, -80), azar(0.5, 0.9), azar(4, 8));
    });
    this.una("blup", t > T_BLUP, () => temblar(8, 0.3));
    this.una("tapa", t > 4.3, () => temblar(6, 0.2));
    // la espuma que se deshace con el agua
    this.bolas.forEach((b, i) => this.una("b" + i, t > b.tw + 0.08, () => {
      const x = this.xG() + b.dx, y = PIES - b.h - this.alzaG() * 0.3;
      for (let k = 0; k < 3; k++) p.nueva(P.ESPUMA, x + azar(-20, 20), y + azar(-20, 20), azar(-160, 160), azar(-260, -60), azar(0.4, 0.8), azar(5, 10));
    }));
    // el chorro
    if (t > T_AGUA && t < T_PARA) {
      const o = this.objetivo();
      for (let k = 0; k < 4; k++) ag.nueva(o[0] + azar(-14, 14), o[1] + azar(-10, 10), azar(-260, 260), azar(-380, -60), azar(0.4, 0.9), azar(3, 6));
      if (Math.random() < 0.5) p.nueva(P.VAPOR, o[0], o[1], azar(-60, 60), azar(-80, -20), azar(0.4, 0.7), azar(30, 50));
    }
    // se sacude el agua
    if (t > T_PARA && t < T_TING) {
      const c = aPant(e.mG, [39, 40]);
      for (let k = 0; k < 2; k++) ag.nueva(c[0] + azar(-40, 40), c[1] + azar(-30, 60), azar(-420, 420), azar(-300, -40), azar(0.4, 0.7), azar(3, 5));
    }
    this.una("ting", t > T_TING, () => {
      temblar(7, 0.25);
      for (let i = 0; i < 26; i++) p.nueva(P.PURPURINA, azar(150, 880), azar(250, 420), azar(-30, 30), azar(-40, 20), azar(1.4, 2.4), azar(10, 16));
      p.nueva(P.DESTELLO, 512, 330, 0, 0, 0.4, 600);
    });
    this.una("ting2", t > 8.25, () => {
      for (let i = 0; i < 18; i++) p.nueva(P.PURPURINA, azar(150, 880), azar(230, 380), azar(-30, 30), azar(-40, 20), azar(1.2, 2), azar(10, 16));
    });
    p.actualizar(dt); ag.actualizar(dt);
  }
  // ---------------------------------------------------------------------- fondo
  fondoFijo() {
    if (CT.has("fondo")) return CT.get("fondo");
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const cielo = g.createLinearGradient(0, -60, 0, 300);
    cielo.addColorStop(0, "#3d9be8"); cielo.addColorStop(1, "#bfe6ff");
    g.fillStyle = cielo; g.fillRect(-60, -60, W + 120, 420);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8;
    g.drawImage(BLOB2.oroClaro, 870, -40, 200, 200); g.restore();
    g.fillStyle = "#fffbe0"; g.beginPath(); g.arc(970, 60, 34, 0, 6.283); g.fill();
    // nubes
    g.fillStyle = "rgba(255,255,255,.85)";
    for (const [x, y, s] of [[110, 70, 1], [700, 40, 0.8]]) {
      for (const [dx, dy, r] of [[0, 0, 26], [30, -10, 32], [64, 0, 24], [32, 8, 26]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, 6.283); g.fill(); }
    }
    // el parque de bomberos
    const pared = g.createLinearGradient(0, 150, 0, 548);
    pared.addColorStop(0, "#f0e2c4"); pared.addColorStop(1, "#cdb894");
    g.fillStyle = pared; g.fillRect(-60, 150, W + 120, 400);
    g.fillStyle = "#b22318"; g.fillRect(-60, 150, W + 120, 26);
    g.fillStyle = "#e8d6b2"; g.fillRect(-60, 140, W + 120, 12);
    // torre de mangueras a la izquierda
    g.fillStyle = "#e2d0aa"; g.fillRect(16, 40, 104, 120);
    g.fillStyle = "#b22318"; g.fillRect(10, 30, 116, 16);
    g.fillStyle = "#2b3440"; rectR(g, 46, 70, 44, 60, 20); g.fill();
    // portones (abiertos, oscuros por dentro)
    for (const [x0, x1] of [[96, 486], [538, 928]]) {
      const gr = g.createLinearGradient(0, 214, 0, 548);
      gr.addColorStop(0, "#1b1d22"); gr.addColorStop(1, "#3a3b40");
      g.fillStyle = "#a99673"; g.fillRect(x0 - 12, 202, x1 - x0 + 24, 346);
      g.fillStyle = gr; g.fillRect(x0, 214, x1 - x0, 334);
      g.fillStyle = "#8f989f";
      for (let y = 214; y < 252; y += 9) g.fillRect(x0, y, x1 - x0, 7);
    }
    // farolas de pared
    for (const x of [72, 512, 952]) { g.fillStyle = "#2a2e33"; rectR(g, x - 9, 186, 18, 22, 4); g.fill(); g.fillStyle = "#fff3b0"; g.fillRect(x - 6, 198, 12, 7); }
    // suelo
    const gs = g.createLinearGradient(0, 548, 0, H + 60);
    gs.addColorStop(0, "#a9aaa6"); gs.addColorStop(1, "#6c6d69");
    g.fillStyle = gs; g.fillRect(-60, 548, W + 120, H);
    g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(-60, 548, W + 120, 2);
    g.fillStyle = "rgba(0,0,0,.12)";
    for (let x = -40; x < W + 60; x += 150) { g.beginPath(); g.moveTo(x, 550); g.lineTo(x - 60, H + 60); g.lineTo(x - 56, H + 60); g.lineTo(x + 3, 550); g.fill(); }
    // franjas amarillas del suelo
    g.fillStyle = "#e5c22a";
    for (let x = -40; x < W + 60; x += 70) { g.beginPath(); g.moveTo(x, 590); g.lineTo(x + 34, 590); g.lineTo(x + 30, 598); g.lineTo(x - 4, 598); g.closePath(); g.fill(); }
    CT.set("fondo", c);
    return c;
  }
  /** Cubo encima de una caja de madera. */
  cubo(g, t) {
    // caja
    const cx = CUBO[0];
    g.fillStyle = "#9a6a38"; g.fillRect(cx - 42, 512, 84, 63);
    g.fillStyle = "#b8844a"; g.fillRect(cx - 42, 512, 84, 8);
    g.strokeStyle = "#5e3a18"; g.lineWidth = 3; g.strokeRect(cx - 42, 512, 84, 63);
    g.beginPath(); g.moveTo(cx - 42, 512); g.lineTo(cx + 42, 575); g.moveTo(cx + 42, 512); g.lineTo(cx - 42, 575); g.stroke();
    // cubo
    const gr = g.createLinearGradient(cx - 28, 0, cx + 28, 0);
    gr.addColorStop(0, "#1f6fb8"); gr.addColorStop(0.4, "#5fb2f2"); gr.addColorStop(1, "#16568f");
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(cx - 29, CUBO[1]); g.lineTo(cx + 29, CUBO[1]); g.lineTo(cx + 23, 512); g.lineTo(cx - 23, 512); g.closePath(); g.fill();
    g.strokeStyle = "#0e3a62"; g.lineWidth = 2.5; g.stroke();
    g.strokeStyle = "#c9d0d6"; g.lineWidth = 3; g.beginPath(); g.arc(cx, CUBO[1] + 4, 26, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
    // espuma del cubo (crece al mojar la esponja y se va con el agua)
    const k = 0.55 + 0.6 * eBack(tramo(t, T_MOJA, T_BLUP)) - 1.0 * tramo(t, 5.6, 6.0);
    if (k > 0.05) {
      for (const [dx, dy, r] of [[-20, 0, 12], [-6, -6, 15], [10, -3, 13], [22, 1, 10], [2, -16, 11]]) {
        const rr = r * k * (1 + 0.05 * Math.sin(t * 6 + dx));
        g.drawImage(SPR.espuma, cx + dx - rr, CUBO[1] + dy - rr, rr * 2, rr * 2);
      }
    }
  }
  /** Manguera enrollada detrás del camión y, si la lleva Marcos, hasta su mano. */
  manguera(g, e) {
    const t = this.t;
    g.save(); g.lineCap = "round";
    // gancho y rollo
    g.fillStyle = "#3a3f45"; g.fillRect(ROLLO[0] - 4, ROLLO[1] - 46, 8, 20);
    for (let i = 0; i < 4; i++) {
      g.strokeStyle = i % 2 ? "#e9dcc0" : "#cdbd98"; g.lineWidth = 9;
      g.beginPath(); g.ellipse(ROLLO[0], ROLLO[1] - 8, 30 - i * 5, 20 - i * 3, 0, 0, 6.283); g.stroke();
    }
    let fin;
    if (t > T_COGE + 0.1) {
      const mm = e.mM, q = aPant(mm, e.M._manoD || e.M.manoD);
      fin = q;
    } else fin = [ROLLO[0] - 4, ROLLO[1] + 26];
    const sag = t > T_COGE + 0.1 ? 560 : ROLLO[1] + 40;
    g.strokeStyle = "#8a7a58"; g.lineWidth = 12;
    g.beginPath(); g.moveTo(ROLLO[0] + 18, ROLLO[1]); g.bezierCurveTo(ROLLO[0] + 40, sag, fin[0] + 20, sag, fin[0], fin[1]); g.stroke();
    g.strokeStyle = "#e9dcc0"; g.lineWidth = 8; g.stroke();
    if (t <= T_COGE + 0.1) boquilla(g, fin[0], fin[1], Math.PI / 2);
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.poses();
    fondo(g, "#000");
    g.drawImage(this.fondoFijo(), -60, -60);
    // charco que crece con el agua
    const ch = tramo(t, T_AGUA, T_PARA);
    if (ch > 0) {
      g.save(); g.globalAlpha = 0.5 * ch; g.fillStyle = "#7fc4e8";
      g.beginPath(); g.ellipse(430, 580, 260 * ch, 14 * ch, 0, 0, 6.283); g.fill(); g.restore();
    }
    // camión
    const C = lienzoCamion();
    const cx0 = TX - 400 * TS, cy0 = TY - 295 * TS;
    g.drawImage(C, cx0, cy0);
    // barro
    g.save();
    for (const b of this.barro) {
      const a = this.limpio(b);
      if (a <= 0.01) continue;
      const [sx, sy] = enCamion(b.x, b.y);
      g.globalAlpha = 0.8 * a; g.fillStyle = "#6e4a24";
      g.beginPath(); g.ellipse(sx, sy, b.r, b.r * 0.7, b.rot, 0, 6.283); g.fill();
      g.beginPath(); g.ellipse(sx + b.r * 0.6, sy + b.r * 0.4, b.r * 0.5, b.r * 0.4, b.rot, 0, 6.283); g.fill();
      g.fillStyle = "#8a6232"; g.beginPath(); g.ellipse(sx - b.r * 0.2, sy - b.r * 0.15, b.r * 0.45, b.r * 0.3, b.rot, 0, 6.283); g.fill();
    }
    g.restore();
    // parches de espuma de las esponjas
    for (const q of this.parches) {
      const tL = T_BARRE + clamp((q.x - 170) / 460, 0, 1) * (T_PARA - T_BARRE - 0.1);
      const k = eBack(tramo(t, q.t0, q.t0 + 0.2)) * (1 - tramo(t, q.x > 590 ? 3.2 : tL, (q.x > 590 ? 3.2 : tL) + 0.2));
      if (k > 0.02) { const r = q.r * k; g.drawImage(SPR.espuma, q.x - r, q.y - r, r * 2, r * 2); }
    }
    // brillo que recorre el camión
    const pasadas = [[T_TING, T_TING + 0.7], [8.25, 8.85]];
    for (const [a0, a1] of pasadas) {
      if (t > a0 && t < a1) {
        if (!this.cB) this.cB = lienzoNuevo(C.width, C.height);
        const b = this.cB, k = b.getContext("2d"), u = tramo(t, a0, a1);
        k.globalCompositeOperation = "source-over"; k.clearRect(0, 0, b.width, b.height);
        const x = lerp(-200, b.width + 200, u);
        const gr = k.createLinearGradient(x - 90, 0, x + 90, 0);
        gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.5, "rgba(255,255,255,.95)"); gr.addColorStop(1, "rgba(255,255,255,0)");
        k.save(); k.translate(x, b.height / 2); k.transform(1, 0, -0.5, 1, 0, 0); k.translate(-x, -b.height / 2);
        k.fillStyle = gr; k.fillRect(x - 90, 0, 180, b.height); k.restore();
        k.globalCompositeOperation = "destination-in"; k.drawImage(C, 0, 0);
        g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.75; g.drawImage(b, cx0, cy0); g.restore();
      }
    }
    // luces del camión al brillar
    if (t > T_TING) {
      g.save(); g.globalCompositeOperation = "lighter";
      LUCES.forEach(([x, col], i) => {
        const on = Math.sin(t * 14 + i * 2) > 0 ? 1 : 0.25;
        const [sx, sy] = enCamion(x, -279);
        g.globalAlpha = 0.7 * on; g.drawImage(i === 1 ? BLOB.rojo : BLOB2.cian, sx - 50, sy - 40, 100, 80);
      });
      g.restore();
    }
    this.manguera(g, e);
    this.cubo(g, t);
    // esponja de Marcos que cae al suelo
    if (t > T_BLUP + 0.2 && t < T_PARA) {
      const u = tramo(t, T_BLUP + 0.2, T_BLUP + 0.6);
      const x0 = aPant(matAv(XM, PIES, ESC), [-26, 108]);
      const y = lerp(x0[1], PIES - 6, u * u);
      g.save(); g.translate(x0[0] - 10 * u, y); g.scale(ESC, ESC); esponja(g, 0, 0, u * 2.5, 0); g.restore();
    }
    pintarAvatar(g, e.mM, e.M, t);
    pintarAvatar(g, e.mG, e.G, t);
    // la espuma gigante
    const xg = this.xG(), alza = this.alzaG();
    const capa = (fn) => {
      for (const b of this.bolas) {
        const k = eBack(tramo(t, b.tb, b.tb + 0.28)) * (1 - eIn(tramo(t, b.tw, b.tw + 0.2)));
        if (k <= 0.01) continue;
        const r = b.R * k * (1 + 0.04 * Math.sin(t * 6 + b.f));
        fn(xg + b.dx, PIES - b.h - alza * 0.3 * (b.h / 280), r);
      }
    };
    g.fillStyle = "#c9b98f";
    capa((x, y, r) => { g.beginPath(); g.arc(x, y, r + 3, 0, 6.283); g.fill(); });
    capa((x, y, r) => g.drawImage(SPR.espuma, x - r, y - r, r * 2, r * 2));
    // la mano con la esponja asoma por encima de la espuma
    if (t > T_BLUP + 0.5 && t < 5.5 && e.G._manoD) {
      const h = aPant(e.mG, e.G._manoD);
      g.save(); g.beginPath(); g.rect(h[0] - 20, h[1] - 56, 64, 74); g.clip();
      pintarAvatar(g, e.mG, e.G, t);
      g.restore();
      for (const [dx, dy, r] of [[-26, 34, 17], [-4, 42, 19], [20, 36, 16]]) g.drawImage(SPR.espuma, h[0] + dx - r, h[1] + dy - r, r * 2, r * 2);
    }
    // el chorro de agua
    if (t > T_AGUA && t < T_PARA + 0.08) {
      const o = this.objetivo(), mano = aPant(e.mM, e.M._manoD || e.M.manoD), a = this.angBoq || Math.PI;
      const punta = [mano[0] + Math.cos(a) * 30 * ESC, mano[1] + Math.sin(a) * 30 * ESC];
      chorro(g, punta[0], punta[1], o[0], o[1], t, 1 - tramo(t, T_PARA, T_PARA + 0.08));
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.6; g.drawImage(BLOB2.cian, o[0] - 50, o[1] - 50, 100, 100); g.restore();
    }
    // goteo de la manguera al final
    this.agua.dibujar(g);
    this.p.dibujar(g);
    // destellos sobre los dos y el camión
    if (t > T_TING) {
      const pts = [enCamion(-300, -210), enCamion(-268, -46), enCamion(178, -46), enCamion(60, -250), enCamion(140, -170), enCamion(-210, -230),
        aPant(e.mG, [44, -4]), aPant(e.mG, [52, 58]), aPant(e.mM, [37, 2]), aPant(e.mM, [70, 20])];
      pts.forEach((q, i) => {
        const f = (t * 1.6 + i * 0.37) % 1;
        brillo(g, q[0], q[1], 26 + 16 * Math.sin(f * Math.PI), Math.sin(f * Math.PI) * tramo(t, T_TING, T_TING + 0.2));
      });
    }
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    ono("¡FROTA!", 140, 262, 0.75, 0.6, 46, "#fffdf5", "#1b1b1b", -0.12);
    ono("¡FROTA!", 890, 250, 1.25, 0.6, 46, "#fffdf5", "#1b1b1b", 0.12);
    ono("¡FROTA!", 150, 330, 1.75, 0.5, 40, "#fffdf5", "#1b1b1b", -0.06);
    ono("¡CHOF!", 520, 400, T_MOJA, 0.5, 44, "#8fdcff", "#0c3350", 0.1);
    ono("¡BLUP!", 470, 250, T_BLUP + 0.1, 0.8, 64, "#fffdf5", "#5a4a2a", -0.08);
    ono("¡JA, JA!", 850, 250, T_RIE + 0.1, 0.8, 50, "#ffd34d", "#3a2400", 0.1);
    ono("¡FSSSSH!", 560, 250, T_AGUA + 0.1, 1.3, 58, "#bff0ff", "#0c3350", -0.06);
    // ¡QUE BRILLE!
    if (t > T_TING + 0.1) {
      const d = t - T_TING - 0.1, k = tramo(d, 0, 0.18), s = lerp(1.7, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 6));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 86); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
      for (let i = 0; i < 4; i++) {
        const f = (t * 1.3 + i * 0.25) % 1;
        brillo(g, 210 + i * 200 + 20 * Math.sin(i * 7), 40 + (i % 2) * 90, 30, Math.sin(f * Math.PI) * k);
      }
    }
    // entrada y salida en iris
    const ojo = aPant(e.mG, [39, 40]);
    const rA = 820 * eOut(tramo(t, 0.03, 0.75));
    const rC = 820 * (1 - eIn(tramo(t, T_IRIS, DUR - 0.12)));
    const r = Math.min(rA, rC);
    const cx = t < 2 ? 512 : ojo[0], cy = t < 2 ? 330 : ojo[1];
    if (r < 1) fondo(g, "#000");
    else if (r < 800) {
      g.fillStyle = "#000"; g.beginPath(); g.rect(-60, -60, W + 120, H + 120); g.arc(cx, cy, r, 0, 6.283, true); g.fill("evenodd");
    }
  }
  titulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(900, 190), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 160);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#bff3ff"); gr.addColorStop(1, "#2fb8e8");
    txt(g, "¡QUE BRILLE!", 456, 148, { tam: 134, peso: 900, fam: FD, color: "#062a3a", esp: 6, max: 840 });
    txt(g, "¡QUE BRILLE!", 450, 140, { tam: 134, peso: 900, fam: FD, color: gr, borde: "#062a3a", bordeAncho: 12, esp: 6, glow: "rgba(150,235,255,.9)", glowTam: 26, max: 840 });
    CT.set("t", c);
    return c;
  }
}

registrar({ id: "00217", nombre: "Lavar el camión", crear: () => new LavarCamion() });
})();
