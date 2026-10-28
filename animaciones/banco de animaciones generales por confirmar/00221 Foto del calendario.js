"use strict";
/*
 * 00221 · FOTO DEL CALENDARIO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Sesión de fotos para el calendario solidario delante del camión. Guillermo, de fotógrafo con la cámara en el
 * trípode, grita ¡POSA! y Marcos (siempre con el uniforme completo y el casco) posa con la manguera: brazos en jarras
 * con el rollo al hombro, la boquilla al hombro con un pie en una caja, apuntando con el chorro, sacando bíceps y
 * mirando al horizonte. Cada foto es una hoja del calendario (ENERO, FEBRERO…). Para la última, Guillermo pone el
 * temporizador, corre y se cuela de un salto: la hoja de DICIEMBRE sale con los dos. Fundido a negro.
 */
(() => {
const CT = cacheTexto();
const ESC = 1.4;
const XG = 222, XM = 662, XGF = 520;
const TX = 690, TY = 548, TS = 0.84;
const CAM = [300, 400];                                   // la cámara en el trípode (centro del cuerpo)
const FOTOS = [1.95, 3.05, 4.15, 5.25, 6.35];
const MESES = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO"];
const POSA = [1.0, 2.15, 3.25, 4.35, 5.45];
const T_TIMER = 6.95, T_CORRE = 7.35, T_SALTA = 7.85, T_FINAL = 8.3, T_GRANDE = 8.55, DUR = 11.0;
const REGION = [420, 150, 520, 430];                     // lo que sale en la foto (x, y, ancho, alto)

// ------------------------------------------------------------------------------------------- el camión
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
  for (const x0 of [-162, -36, 90, 216]) {
    const gr = g.createLinearGradient(x0, 0, x0 + 116, 0);
    gr.addColorStop(0, "#9aa3ab"); gr.addColorStop(0.35, "#eef2f5"); gr.addColorStop(0.7, "#b9c2ca"); gr.addColorStop(1, "#8a939b");
    rectR(g, x0, -208, 116, 88, 5); g.fillStyle = gr; g.fill();
    g.strokeStyle = "rgba(60,68,76,.45)"; g.lineWidth = 1.5;
    for (let y = -200; y < -124; y += 8) { g.beginPath(); g.moveTo(x0 + 3, y); g.lineTo(x0 + 113, y); g.stroke(); }
    g.fillStyle = "#4a5259"; rectR(g, x0 + 38, -130, 40, 6, 3); g.fill();
    g.strokeStyle = "#5e0805"; g.lineWidth = 2.5; rectR(g, x0, -208, 116, 88, 5); g.stroke();
  }
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
  g.restore();
  g.strokeStyle = "rgba(70,6,3,.75)"; g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(-358, -164); g.lineTo(-262, -164); g.lineTo(-262, -60); g.moveTo(-256, -164); g.lineTo(-180, -164); g.lineTo(-180, -60); g.stroke();
  g.fillStyle = "#c9d0d6"; rectR(g, -354, -42, 76, 8, 3); g.fill();
  txt(g, "BOMBEROS", -266, -122, { tam: 36, peso: 900, fam: FD, color: "#ffd34d", borde: "#5a0a04", bordeAncho: 5, esp: 1.5, max: 168 });
  g.fillStyle = "#ffd23a"; g.fillRect(-367, -112, 744, 16);
  g.fillStyle = "#fff6c8"; g.fillRect(-367, -112, 744, 3); g.fillRect(-367, -99, 744, 2);
  g.fillStyle = "#2a0503";
  for (const wx of [-268, 178, 286]) { g.beginPath(); g.arc(wx, -44, 55, Math.PI, 0); g.fill(); }
  for (const wx of [-268, 178, 286]) {
    g.fillStyle = "#141414"; g.beginPath(); g.arc(wx, -46, 46, 0, 6.283); g.fill();
    const gl = g.createRadialGradient(wx - 7, -54, 2, wx, -46, 26);
    gl.addColorStop(0, "#ffffff"); gl.addColorStop(0.5, "#c3cbd2"); gl.addColorStop(1, "#6a737b");
    g.fillStyle = gl; g.beginPath(); g.arc(wx, -46, 25, 0, 6.283); g.fill();
    g.fillStyle = "#d8261c"; g.beginPath(); g.arc(wx, -46, 7, 0, 6.283); g.fill();
  }
  const cromo = g.createLinearGradient(0, -84, 0, -42);
  cromo.addColorStop(0, "#ffffff"); cromo.addColorStop(0.5, "#aab3bb"); cromo.addColorStop(1, "#5d656e");
  g.fillStyle = cromo; rectR(g, -386, -84, 30, 42, 6); g.fill();
  g.fillStyle = "#fff7c0"; g.beginPath(); g.ellipse(-364, -140, 6, 13, 0, 0, 6.283); g.fill();
  g.fillStyle = "#2a2a2e"; rectR(g, -334, -272, 158, 10, 3); g.fill();
  for (const [x, col] of [[-308, "#4f8dff"], [-255, "#ff4a4a"], [-202, "#4f8dff"]]) {
    const gr = g.createLinearGradient(0, -288, 0, -270);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.4, col); gr.addColorStop(1, "#0a1a40");
    g.fillStyle = gr; rectR(g, x - 22, -288, 44, 18, 8); g.fill();
  }
}
function lienzoCamion() {
  if (CT.has("camion")) return CT.get("camion");
  const c = lienzoNuevo(800 * TS, 310 * TS), g = c.getContext("2d");
  g.scale(TS, TS); g.translate(400, 295);
  pintarCamion(g);
  CT.set("camion", c);
  return c;
}

// ------------------------------------------------------------------------------------------- objetos
function boquilla(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.fillStyle = "#1d1f22"; rectR(g, -10, -5.5, 22, 11, 3); g.fill();
  const gr = g.createLinearGradient(0, -5, 0, 5);
  gr.addColorStop(0, "#fff0b0"); gr.addColorStop(0.5, "#d9a21c"); gr.addColorStop(1, "#7a5200");
  g.fillStyle = gr; g.beginPath(); g.moveTo(10, -5); g.lineTo(30, -3.2); g.lineTo(30, 3.2); g.lineTo(10, 5); g.closePath(); g.fill();
  g.fillStyle = "#c22016"; rectR(g, 2, -9, 5, 7, 1.5); g.fill();
  g.restore();
}
/** Rollo de manguera (unidades de avatar). */
function rollo(g, x, y, r) {
  for (let i = 0; i < 3; i++) {
    g.strokeStyle = i % 2 ? "#e9dcc0" : "#cdbd98"; g.lineWidth = 6;
    g.beginPath(); g.ellipse(x, y, r - i * 4.5, r * 0.8 - i * 3.5, 0.3, 0, 6.283); g.stroke();
  }
  g.strokeStyle = "rgba(90,70,40,.5)"; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y, r + 3, r * 0.8 + 3, 0.3, 0, 6.283); g.stroke();
}
/** Cámara de fotos de perfil, apuntando a la derecha; (x, y) = centro del cuerpo. */
function camara(g, x, y, luz) {
  g.save(); g.translate(x, y);
  g.fillStyle = "#1b1d21"; rectR(g, -34, -22, 62, 44, 8); g.fill();
  g.fillStyle = "#2c3036"; rectR(g, -20, -32, 30, 12, 4); g.fill();
  g.fillStyle = "#e9eef2"; rectR(g, -14, -40, 20, 8, 2); g.fill();
  const gl = g.createLinearGradient(0, -18, 0, 18);
  gl.addColorStop(0, "#5a616a"); gl.addColorStop(0.5, "#1a1c20"); gl.addColorStop(1, "#3a3f45");
  g.fillStyle = gl; rectR(g, 26, -17, 34, 34, 5); g.fill();
  g.fillStyle = "#7fd4ff"; g.beginPath(); g.ellipse(60, 0, 4, 14, 0, 0, 6.283); g.fill();
  g.fillStyle = "rgba(255,255,255,.7)"; g.beginPath(); g.ellipse(60, -5, 1.6, 4, 0, 0, 6.283); g.fill();
  g.fillStyle = luz ? "#ff2a2a" : "#5a1010"; g.beginPath(); g.arc(-24, -12, 3.5, 0, 6.283); g.fill();
  if (luz) { g.save(); g.globalCompositeOperation = "lighter"; g.drawImage(BLOB.rojo, -40, -28, 32, 32); g.restore(); }
  g.restore();
}
function tripode(g, x, y) {
  g.strokeStyle = "#2a2e33"; g.lineWidth = 5; g.lineCap = "round";
  g.beginPath(); g.moveTo(x, y + 26); g.lineTo(x - 40, PIES); g.moveTo(x, y + 26); g.lineTo(x + 40, PIES); g.moveTo(x, y + 26); g.lineTo(x + 4, PIES - 4); g.stroke();
  g.fillStyle = "#2a2e33"; g.fillRect(x - 6, y + 18, 12, 14);
}

/** Hoja de calendario con la foto. */
function hojaCalendario(foto, mes) {
  const w = 300, h = 380, c = lienzoNuevo(w + 20, h + 20), g = c.getContext("2d");
  g.translate(10, 10);
  g.shadowColor = "rgba(0,0,0,.45)"; g.shadowBlur = 10; g.shadowOffsetY = 4;
  g.fillStyle = "#fbf8f0"; g.fillRect(0, 0, w, h);
  g.shadowColor = "transparent"; g.shadowBlur = 0; g.shadowOffsetY = 0;
  g.fillStyle = "#d8261c"; g.fillRect(0, 14, w, 50);
  txt(g, mes, w / 2, 54, { tam: 40, peso: 900, fam: FD, color: "#fff", esp: 4, max: w - 30 });
  // espiral
  for (let x = 18; x < w; x += 22) { g.fillStyle = "#3a3f45"; rectR(g, x - 3, -6, 6, 18, 3); g.fill(); g.fillStyle = "#c9d0d6"; g.fillRect(x - 1, -4, 2, 12); }
  g.drawImage(foto, 12, 74, w - 24, 216);
  g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 2; g.strokeRect(12, 74, w - 24, 216);
  // cuadrícula de los días
  g.fillStyle = "#e3ddd0";
  for (let f = 0; f < 4; f++) for (let d = 0; d < 7; d++) g.fillRect(14 + d * 39.5, 300 + f * 19, 34, 15);
  g.fillStyle = "#d8261c"; g.fillRect(14 + 6 * 39.5, 300, 34, 15);
  return c;
}

class FotoCalendario extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(260);
    this.hojas = [];        // { c, t0, i }
  }
  /** Índice de la pose de Marcos: 0 normal, 1–5 las del calendario, 6 la del final. */
  pose() {
    const t = this.t;
    let i = 0;
    for (let k = 0; k < POSA.length; k++) if (t > POSA[k] + 0.2) i = k + 1;
    if (t > T_SALTA - 0.2) i = 6;
    return i;
  }
  xG() {
    const t = this.t;
    if (t < T_CORRE) return XG;
    return lerp(XG, XGF, eInOut(tramo(t, T_CORRE, T_SALTA)));
  }
  poses() {
    const t = this.t, n = this.pose();
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let yG = PIES, gG = 0;
    // ---- Marcos: cada pose entra con un rebote
    const tp = n > 0 && n <= 5 ? POSA[n - 1] + 0.2 : T_SALTA - 0.2;
    const k = eBack(tramo(t, tp, tp + 0.28));
    const de = (a, b) => mezcla(a, b, n === 0 ? 0 : k);
    let ob = null, conRollo = false, chorro = false, cajon = false;
    if (n === 0) {
      M.cara = t < 0.9 ? "sonrisa" : "guino"; M.rc = 0.05;
      if (t > 0.45 && t < 0.95) M.manoD = [60, 24];          // se ajusta el casco
    } else if (n === 1 || n === 6) {
      // brazos en jarras, barbilla arriba, el rollo al hombro
      M.manoD = de([67, 152], [58, 142]); M.manoI = de([6, 152], [16, 142]);
      M.piernaI = [0, 0.12]; M.piernaD = [0, -0.12]; M.rc = -0.14; M.cara = "guino";
      conRollo = n === 1;
      if (n === 6) { M.cara = t < T_FINAL + 0.4 ? "sorpresa" : "risa"; M.rc = t < T_FINAL + 0.4 ? 0.16 : -0.06; }
    } else if (n === 2) {
      // la boquilla al hombro y un pie en la caja
      M.manoD = de([67, 152], [70, 84]); M.manoI = de([6, 152], [44, 98]); M.brazoIDelante = true;
      M.piernaD = [-26, -0.1]; M.rc = -0.18; M.cara = "sonrisa";
      ob = { ang: -1.15 }; cajon = true;
    } else if (n === 3) {
      // apuntando con el chorro
      M.manoD = de([67, 152], [94, 104]); M.manoI = de([6, 152], [68, 112]); M.brazoIDelante = true;
      M.piernaD = [0, -0.2]; M.piernaI = [0, 0.08]; M.rc = 0.08; M.cara = "risa";
      ob = { ang: -0.45 }; chorro = k > 0.8;
    } else if (n === 4) {
      // bíceps
      M.manoD = de([67, 152], [84, 54]); M.manoI = de([6, 152], [16, 142]);
      M.rc = 0.1; M.cara = "guino"; M.piernaI = [0, 0.1];
    } else if (n === 5) {
      // mirando al horizonte con la mano de visera
      M.manoD = de([67, 152], [58, 40]); M.manoI = de([6, 152], [16, 142]);
      M.rc = -0.12; M.cara = "sonrisa"; M.piernaD = [0, -0.1];
    }
    if (ob) M.objD2 = (g, m) => boquilla(g, m[0], m[1], ob.ang);
    if (conRollo) M.objD = (g) => rollo(g, 56, 104, 17);
    // ---- Guillermo: detrás de la cámara
    const mG0 = matAv(XG, PIES, ESC), cam = mG0.inverse().transformPoint(new DOMPoint(CAM[0] - 10, CAM[1] - 18));
    if (t < T_TIMER) {
      G.manoD = [cam.x, cam.y]; G.manoI = [cam.x - 30, cam.y + 6]; G.brazoIDelante = true;
      G.cara = "sonrisa"; G.rc = 0.06;
      // ¡POSA!: levanta la mano
      for (const p of POSA) if (t > p - 0.05 && t < p + 0.55) { G.manoI = [-16, 40 + 8 * Math.sin(t * 20)]; G.brazoIDelante = false; G.cara = "risa"; G.rc = 0.12; }
      for (const f of FOTOS) if (t > f - 0.2 && t < f + 0.25) { G.cara = "guino"; G.rc = 0.1; }
    } else if (t < T_CORRE) {
      // pone el temporizador
      const tap = Math.sin(tramo(t, T_TIMER, T_TIMER + 0.3) * Math.PI);
      G.manoD = [cam.x - 2, cam.y - 14 - 4 * tap]; G.manoI = [9, 160]; G.cara = "guino"; G.rc = 0.1;
    } else if (t < T_SALTA) {
      const w = andar(t * 20, 1.4); G.piernaI = w.piernaI; G.piernaD = w.piernaD; yG += w.bote;
      const s = Math.sin(t * 20); G.manoD = [82 + 8 * s, 116]; G.manoI = [-4 - 8 * s, 116];
      G.cara = "risa"; G.rc = 0.12; gG = 0.08;
    } else {
      // ¡se cuela! salto con los brazos en V
      const u = tramo(t, T_SALTA, T_SALTA + 0.75);
      yG -= Math.sin(u * Math.PI) * 70;
      const kk = eOut(tramo(t, T_SALTA, T_SALTA + 0.2));
      G.manoD = mezcla([82, 116], [98, 18], kk); G.manoI = mezcla([-4, 116], [-20, 18], kk);
      G.piernaI = [-14 * Math.sin(u * Math.PI), 0.2]; G.piernaD = [-14 * Math.sin(u * Math.PI), -0.2];
      G.cara = "risa"; G.rc = -0.05; G.puntas = 0.4 * Math.sin(u * Math.PI);
      if (t > T_SALTA + 0.75) { G.manoD = [84, 120]; G.manoI = [-6, 124]; G.cara = "guino"; G.piernaI = [0, 0]; G.piernaD = [0, 0]; }
    }
    return { G, M, mG: matAv(this.xG(), yG, ESC, gG), mM: matAv(XM, PIES, ESC), n, chorro, cajon, ob };
  }
  /** El plató (fondo, camión, caja, manguera y Marcos; con Guillermo si `conG`). */
  plato(g, e, conG) {
    const t = this.t;
    g.drawImage(this.fondoFijo(), -60, -60);
    g.drawImage(lienzoCamion(), TX - 400 * TS, TY - 295 * TS);
    // focos sobre Marcos
    foco(g, XM - 120, XM, PIES, 150, 0.9);
    if (e.cajon) {
      const x = XM + 30;
      g.fillStyle = "#9a6a38"; g.fillRect(x - 6, 540, 72, 35);
      g.fillStyle = "#b8844a"; g.fillRect(x - 6, 540, 72, 6);
      g.strokeStyle = "#5e3a18"; g.lineWidth = 3; g.strokeRect(x - 6, 540, 72, 35);
    }
    // manguera desde abajo a la derecha hasta la boquilla
    if (e.ob) {
      const q = aPant(e.mM, e.M._manoD || e.M.manoD);
      g.save(); g.lineCap = "round";
      g.strokeStyle = "#8a7a58"; g.lineWidth = 13;
      g.beginPath(); g.moveTo(W + 40, PIES + 10); g.bezierCurveTo(820, PIES + 10, q[0] + 40, PIES - 10, q[0] - 6, q[1] + 6); g.stroke();
      g.strokeStyle = "#e9dcc0"; g.lineWidth = 9; g.stroke();
      g.restore();
    }
    pintarAvatar(g, e.mM, e.M, t);
    if (e.chorro && e.M._manoD) {
      const q = aPant(e.mM, e.M._manoD), a = e.ob.ang, p0 = [q[0] + Math.cos(a) * 30 * ESC, q[1] + Math.sin(a) * 30 * ESC];
      g.save(); g.lineCap = "round";
      const ruta = () => { g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo(p0[0] + 160, p0[1] - 150, W + 80, p0[1] - 60); };
      ruta(); g.strokeStyle = "rgba(40,150,230,.5)"; g.lineWidth = 20; g.stroke();
      ruta(); g.strokeStyle = "#8fdcff"; g.lineWidth = 11; g.stroke();
      ruta(); g.strokeStyle = "#e8fbff"; g.lineWidth = 4; g.setLineDash([22, 16]); g.lineDashOffset = -t * 900; g.stroke(); g.setLineDash([]);
      g.restore();
    }
    if (conG) pintarAvatar(g, e.mG, e.G, t);
  }
  hacerFoto(e, mes, conG) {
    const [rx, ry, rw, rh] = REGION;
    const c = lienzoNuevo(276, 216), k = c.getContext("2d");
    k.scale(276 / rw, 216 / rh); k.translate(-rx, -ry);
    k.imageSmoothingQuality = "high";
    this.plato(k, e, conG);
    // un poco de viñeta
    k.setTransform(1, 0, 0, 1, 0, 0);
    const v = k.createRadialGradient(138, 100, 60, 138, 108, 190);
    v.addColorStop(0, "rgba(255,240,220,0)"); v.addColorStop(1, "rgba(40,10,0,.35)");
    k.fillStyle = v; k.fillRect(0, 0, 276, 216);
    return hojaCalendario(c, mes);
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    FOTOS.forEach((f, i) => this.una("f" + i, t > f, () => {
      const e = this.poses();
      this.hojas.push({ c: this.hacerFoto(e, MESES[i], false), t0: t, i });
      p.nueva(P.DESTELLO, CAM[0] + 60, CAM[1], 0, 0, 0.3, 160);
    }));
    this.una("final", t > T_FINAL, () => {
      const e = this.poses();
      this.final = { c: this.hacerFoto(e, "DICIEMBRE", true), t0: t };
      p.nueva(P.DESTELLO, CAM[0] + 60, CAM[1], 0, 0, 0.3, 200);
      temblar(8, 0.25);
    });
    this.una("aterriza", t > T_SALTA + 0.75, () => { temblar(6, 0.2); for (let i = 0; i < 8; i++) p.nueva(P.POLVO, XGF + azar(-40, 40), PIES, azar(-80, 80), azar(-30, -5), azar(0.4, 0.7), azar(16, 26)); });
    this.una("conf", t > T_GRANDE, () => { for (let i = 0; i < 60; i++) p.nueva(P.CONFETI, azar(60, 964), azar(-60, 0), azar(-40, 40), azar(40, 160), azar(2, 3), azar(9, 14), (Math.random() * 5) | 0); });
    p.actualizar(dt);
  }
  fondoFijo() {
    if (CT.has("fondo")) return CT.get("fondo");
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    // nave oscura con un telón de fondo
    const gw = g.createLinearGradient(0, -60, 0, 548);
    gw.addColorStop(0, "#1c1f26"); gw.addColorStop(1, "#3a3f4a");
    g.fillStyle = gw; g.fillRect(-60, -60, W + 120, 620);
    // telón continuo (curva infinita) gris azulado
    const gt = g.createRadialGradient(TX, 330, 40, TX, 360, 520);
    gt.addColorStop(0, "#7d8fa8"); gt.addColorStop(1, "#2f3846");
    g.fillStyle = gt; g.fillRect(360, 40, 690, 520);
    g.strokeStyle = "#111"; g.lineWidth = 8; g.beginPath(); g.moveTo(350, 40); g.lineTo(1060, 40); g.stroke();
    // paraguas de estudio a la derecha
    g.save(); g.translate(990, 210);
    g.strokeStyle = "#2a2e33"; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 365); g.moveTo(0, 365); g.lineTo(-30, 380); g.moveTo(0, 365); g.lineTo(30, 380); g.stroke();
    g.fillStyle = "#f4f4f4"; g.beginPath(); g.moveTo(-70, -30); g.quadraticCurveTo(-90, 30, -60, 70); g.lineTo(6, 6); g.closePath(); g.fill();
    g.strokeStyle = "#bbb"; g.lineWidth = 2; g.stroke();
    g.restore();
    // suelo
    const gs = g.createLinearGradient(0, 548, 0, H + 60);
    gs.addColorStop(0, "#565b66"); gs.addColorStop(1, "#2a2d33");
    g.fillStyle = gs; g.fillRect(-60, 548, W + 120, H);
    g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(-60, 548, W + 120, 2);
    // cables y cinta en el suelo
    g.strokeStyle = "#111"; g.lineWidth = 4; g.beginPath(); g.moveTo(-60, 590); g.quadraticCurveTo(300, 570, 500, 592); g.stroke();
    g.fillStyle = "#ffd23a"; g.fillRect(XM - 30, 584, 60, 6);
    CT.set("fondo", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses();
    fondo(g, "#000");
    this.plato(g, e, false);
    // trípode y cámara
    tripode(g, CAM[0], CAM[1]);
    const luz = t > T_TIMER && t < T_FINAL && Math.sin(t * 18) > 0;
    camara(g, CAM[0], CAM[1], luz);
    pintarAvatar(g, e.mG, e.G, t);
    this.p.dibujar(g);
    // flash
    const fl = [...FOTOS, T_FINAL].reduce((a, f) => Math.max(a, t > f ? 1 - tramo(t, f, f + 0.25) : 0), 0);
    if (fl > 0) { g.fillStyle = `rgba(255,255,255,${0.85 * fl})`; g.fillRect(-60, -60, W + 120, H + 120); }
    // hojas que vuelan al montón
    for (const h of this.hojas) {
      const u = eInOut(tramo(t, h.t0 + 0.1, h.t0 + 0.8));
      const x = lerp(CAM[0] + 50, 905 - h.i * 3, u), y = lerp(CAM[1] - 10, 430 - h.i * 4, u) - Math.sin(u * Math.PI) * 330;
      const s = lerp(0.2, 0.42, u) + Math.sin(u * Math.PI) * 0.2, rot = lerp(-0.4, -0.12 + h.i * 0.07, u) + Math.sin(u * Math.PI * 2) * 0.3;
      if (t < h.t0 + 0.1) continue;
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
      g.drawImage(h.c, -h.c.width / 2, -h.c.height / 2); g.restore();
    }
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 7, esp: 2, alfa: 1 - tramo(d, dur - 0.12, dur) });
      g.restore();
    };
    FOTOS.forEach((f) => ono("¡CLIC!", CAM[0] + 20, CAM[1] - 70, f, 0.4, 40, "#fffdf5", "#1b1b1b", -0.1));
    ono("3", CAM[0] - 30, CAM[1] - 70, T_TIMER + 0.1, 0.4, 46, "#ff4a4a", "#2a0505", 0);
    ono("2", CAM[0], CAM[1] - 80, T_TIMER + 0.55, 0.4, 46, "#ff4a4a", "#2a0505", 0);
    ono("1", CAM[0] + 30, CAM[1] - 70, T_TIMER + 1.0, 0.4, 46, "#ff4a4a", "#2a0505", 0);
    // ¡POSA!
    POSA.forEach((p0, i) => {
      if (t < p0 || t > p0 + 0.75) return;
      const d = t - p0, k = tramo(d, 0, 0.14), sal = tramo(d, 0.6, 0.75);
      const s = lerp(1.4, 1, eIn(k)) * (1 - 0.3 * sal) * (i === 0 ? 1 : 0.85);
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - sal); g.translate(250, 110); g.rotate(-0.08); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    });
    // la hoja de DICIEMBRE, con los dos, en grande
    if (this.final) {
      const h = this.final.c, u = eInOut(tramo(t, T_GRANDE - 0.1, T_GRANDE + 0.5));
      const x0 = REGION[0] + REGION[2] / 2, y0 = REGION[1] + REGION[3] / 2;
      const s = lerp(1.7, 1.1, u), x = lerp(x0, 668, u), y = lerp(y0, 316, u);
      if (t > T_GRANDE - 0.1) {
        g.save(); g.fillStyle = `rgba(0,0,0,${0.45 * u})`; g.fillRect(-60, -60, W + 120, H + 120); g.restore();
        g.save(); g.translate(x, y); g.rotate(0.04 * u + 0.02 * Math.sin(t * 2)); g.scale(s, s);
        g.drawImage(h, -h.width / 2, -h.height / 2); g.restore();
        const k = tramo(t, T_GRANDE + 0.35, T_GRANDE + 0.5), spr = this.titulo();
        if (k > 0) {
          g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(250, 150); g.rotate(-0.14); g.scale(lerp(1.5, 1.0, eIn(k)), lerp(1.5, 1.0, eIn(k)));
          g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
        }
      }
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.45), tramo(t, DUR - 0.65, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(440, 190), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 160);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff7a1a");
    txt(g, "¡POSA!", 226, 156, { tam: 150, peso: 400, fam: FC, color: "#2a0e00", esp: 6, max: 400 });
    txt(g, "¡POSA!", 220, 148, { tam: 150, peso: 400, fam: FC, color: gr, borde: "#2a0e00", bordeAncho: 12, esp: 6, glow: "rgba(255,200,60,.8)", glowTam: 22, max: 400 });
    CT.set("t", c);
    return c;
  }
}

registrar({ id: "00221", nombre: "Foto del calendario", crear: () => new FotoCalendario() });
})();
