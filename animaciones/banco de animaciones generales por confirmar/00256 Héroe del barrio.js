"use strict";
/*
 * 00256 · HÉROE DEL BARRIO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Anochece en la plaza. Marcos vuelve del turno, cansado, y de pronto se encienden los balcones uno a uno: los
 * vecinos (clones de Guillermo, con otras caras, gafas y pelo dorado) se asoman y aplauden (¡CLAP!). Marcos se pone
 * colorado. Guillermo, que dirige el aplauso, saca de la espalda una corona de laurel (¡TACHÁN!); Marcos se quita el
 * casco, Guillermo le corona (¡CHAN!) y Marcos hace una gran reverencia mientras llueven confeti y pétalos:
 * ¡GRACIAS, HÉROE!
 */
(() => {
const CT = cacheTexto();
const ESC = 1.45, EV = 0.58;
const XG0 = 410, XG1 = 505, XM = 628;
const BX = [125, 899], PISOS = [205, 345, 485];
const T_LLEGA = 1.55, T_LUCES = 1.7, T_COLOR = 2.75, T_TACHAN = 3.55, T_PASA = 4.1, T_QUITA = 4.05, T_PECHO = 4.5;
const T_ACERCA = 4.6, T_PONE = 5.25, T_ATRAS = 5.6, T_REV = [5.95, 7.0], T_TIT = 6.25, T_PUNO = 7.35, T_GUINO = 8.6, T_APAGA = 9.9, DUR = 10.45;
const VECINOS = [
  { b: 0, p: 0, t0: 1.70, cara: "risa", gafas: true },
  { b: 1, p: 0, t0: 1.85, cara: "sonrisa", oro: 1 },
  { b: 0, p: 1, t0: 2.0, cara: "guino", puntas: 0.6 },
  { b: 1, p: 1, t0: 2.15, cara: "risa", gafas: true, oro: 1 },
  { b: 0, p: 2, t0: 2.3, cara: "sorpresa" },
  { b: 1, p: 2, t0: 2.45, cara: "guino", oro: 0.7 },
];
const RG = avatar().rig, RM = avatar("bombero").rig;

const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
function cascoEn(g, cx, cy, rot, esc) {
  g.save(); g.translate(cx, cy); g.rotate(rot); g.scale(esc, esc); g.translate(-44, -18);
  cascoBombero(g, 88);
  g.restore();
}
/** Corona de laurel centrada en (x, y) (unidades de avatar), vista de frente. */
function corona(g, x, y, brillo, t) {
  g.save(); g.translate(x, y);
  if (brillo > 0) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 * brillo * (0.8 + 0.2 * Math.sin(t * 8)); g.drawImage(BLOB2.oro, -46, -30, 92, 50); g.restore(); }
  const rx = 31, ry = 8;
  g.strokeStyle = "#7a5a1a"; g.lineWidth = 2;
  g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI); g.stroke();
  for (const sd of [-1, 1]) {
    for (let i = 0; i < 7; i++) {
      const a = Math.PI / 2 - sd * (0.2 + i * 0.21), px = Math.cos(a) * rx, py = Math.sin(a) * ry;
      const tang = Math.atan2(Math.cos(a) * ry, -Math.sin(a) * rx) + (sd > 0 ? Math.PI : 0);
      for (const lado of [-1, 1]) {
        g.save(); g.translate(px, py); g.rotate(tang + lado * 0.55 - sd * 0.25);
        const gr = g.createLinearGradient(0, -3, 0, 3);
        gr.addColorStop(0, "#9ad86a"); gr.addColorStop(1, "#2e7a32");
        g.fillStyle = gr; g.beginPath(); g.ellipse(6, 0, 6.8, 2.9, 0, 0, 6.283); g.fill();
        g.strokeStyle = "#e7b92a"; g.lineWidth = 0.7; g.stroke();
        g.restore();
      }
    }
  }
  // lazo dorado delante
  g.fillStyle = "#ffd34d"; g.beginPath(); g.ellipse(-3.5, ry, 3.5, 2.5, -0.4, 0, 6.283); g.ellipse(3.5, ry, 3.5, 2.5, 0.4, 0, 6.283); g.fill();
  g.fillStyle = "#e7a900"; g.beginPath(); g.arc(0, ry, 1.8, 0, 6.283); g.fill();
  g.restore();
}
function colorado(g, k) {
  if (k <= 0) return;
  g.save(); g.globalAlpha = 0.55 * k; g.fillStyle = "#ff5a6a";
  for (const x of [22, 52]) { g.beginPath(); g.ellipse(x, 57, 6, 3.4, 0, 0, 6.283); g.fill(); }
  g.restore();
}

class HeroeBarrio extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(480);
    this.p.suelo = () => PIES + 8;
    this.fM = 0; this.fG = 0;
  }
  luz() { return tramo(this.t, 0.02, 0.45) * (1 - tramo(this.t, T_APAGA, DUR - 0.03)); }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [24, 150] };
    const M = { quien: "bombero", cara: "dormido", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let xm = XM, ym = PIES, syM = 1, sxM = 1, xg = XG0, yg = PIES;
    // ---------------- Marcos
    if (t < T_LLEGA) {
      const u = tramo(t, 0.2, T_LLEGA);
      xm = lerp(W + 120, XM, eOut(u));
      if (u < 1) { const a = andar(this.fM, 1 - tramo(t, T_LLEGA - 0.25, T_LLEGA)); M.piernaI = a.piernaI; M.piernaD = a.piernaD; ym += a.bote * ESC; }
      M.manoD = [50, 30]; M.cara = "dormido"; M.rc = 0.05 * Math.sin(t * 3);
    } else if (t < T_COLOR) {
      M.cara = "sorpresa"; M.puntas = 1 - tramo(t, T_LUCES, T_LUCES + 0.5);
      if (t < T_LUCES + 0.3) ym -= 30 * Math.sin(tramo(t, T_LUCES, T_LUCES + 0.3) * Math.PI);
      M.rc = t > 2.0 ? 0.16 * Math.sign(Math.sin((t - 2.0) * 7)) : 0;
      M.manoD = [80, 100]; M.manoI = [-6, 100];
    } else if (t < T_TACHAN) {
      // colorado, se rasca la cabeza
      M.cara = Math.floor(t * 2.4) % 2 ? "sonrisa" : "guino"; M.rc = 0.08; M.manoD = [64, 16 + 4 * Math.sin(t * 20)];
    } else if (t < T_QUITA) { M.cara = "sorpresa"; M.rc = -0.12; }
    // se quita el casco y se lo pone al pecho
    this.cascoQ = null;
    if (t >= T_QUITA && t < T_PECHO) {
      const ala = [69, 37];
      const k1 = eInOut(tramo(t, T_QUITA, T_QUITA + 0.18)), k2 = eInOut(tramo(t, T_QUITA + 0.18, T_PECHO));
      M.cara = "sonrisa"; M.rc = 0;
      if (k2 > 0) {
        M.casco = false;
        const c = mezcla([37.3, 17.9], [22, 102], k2);
        this.cascoQ = { c, rot: -0.25 * k2 };
        M.manoD = [c[0] + 31 * (1 - k2) + 16 * k2, c[1] + 19 * (1 - k2) + 8 * k2];
      } else M.manoD = mezcla([67, 152], ala, k1);
    }
    if (t >= T_PECHO) {
      M.casco = false; M.manoI = [18, 116]; M.brazoIDelante = true;
      M.cara = t < T_ACERCA ? "sonrisa" : "guino"; M.rc = 0;
    }
    // recibe la corona: se agacha un poco
    if (t >= T_ACERCA && t < T_REV[0]) {
      const k = eInOut(tramo(t, T_ACERCA, T_PONE - 0.2)) * (1 - eInOut(tramo(t, T_PONE + 0.15, T_ATRAS + 0.2)));
      syM = 1 - 0.09 * k; M.cara = k > 0.5 ? "dormido" : "sonrisa";
      if (t > T_PONE) { M.cara = t < T_PONE + 0.35 ? "sorpresa" : "risa"; }
    }
    // gran reverencia
    if (t >= T_REV[0] && t < T_PUNO) {
      const k = eInOut(tramo(t, T_REV[0], T_REV[0] + 0.35)) * (1 - eInOut(tramo(t, T_REV[1] - 0.3, T_REV[1])));
      syM = 1 - 0.18 * k; sxM = 1 + 0.05 * k;
      M.rc = 0.08 * k; M.cara = k > 0.4 ? "dormido" : "risa";
      M.manoD = mezcla([67, 152], [104, 150], eOut(tramo(t, T_REV[0], T_REV[0] + 0.3)));
      M.piernaI = [0, 0.05 * k]; M.piernaD = [-4 * k, -0.08 * k];
      if (t > T_REV[1]) { M.cara = "risa"; M.manoD = mezcla([104, 150], [67, 152], tramo(t, T_REV[1], T_PUNO)); }
    }
    // puño en alto, saluda
    if (t >= T_PUNO) {
      const k = eBack(tramo(t, T_PUNO, T_PUNO + 0.3));
      M.manoD = mezcla([67, 152], [86 + 4 * Math.sin(t * 9), 22], k); M.cara = "risa"; M.rc = -0.06;
      ym -= 18 * Math.sin(tramo(t, T_PUNO, T_PUNO + 0.45) * Math.PI);
      if (t > T_GUINO) { M.cara = "guino"; M.rc = 0.04; }
    }
    // ---------------- Guillermo
    if (t < T_LUCES) { G.cara = "guino"; G.rc = 0.1; G.manoD = [74, 140]; }
    else if (t < T_TACHAN - 0.1) {
      // dirige el aplauso de los balcones
      const s = Math.sin(t * 11);
      G.manoD = [92 + 6 * s, 30 + 10 * s]; G.cara = Math.floor(t * 2) % 2 ? "risa" : "guino"; G.rc = -0.1 + 0.06 * s;
      yg -= Math.abs(s) * 6;
    }
    this.coronaG = t < T_PONE ? (t < T_TACHAN - 0.1 ? "atras" : t < T_PASA + 0.2 ? "izq" : "dch") : null;
    if (t >= T_TACHAN - 0.1 && t < T_ACERCA) {
      const k = eBack(tramo(t, T_TACHAN - 0.1, T_TACHAN + 0.2));
      G.manoI = mezcla([24, 150], [-16, 34], k); G.manoD = [96, 64]; G.cara = "risa"; G.rc = 0.06;
      if (t > T_PASA - 0.2) {
        // pasa la corona a la mano derecha
        const k2 = eInOut(tramo(t, T_PASA - 0.2, T_PASA + 0.2));
        G.manoI = mezcla([-16, 34], [34, 92], k2); G.manoD = mezcla([96, 64], [46, 92], k2); G.brazoIDelante = k2 > 0.5;
        G.cara = "guino";
      }
      if (t > T_PASA + 0.2) { G.manoI = [9, 160]; G.brazoIDelante = false; G.manoD = [52, 96]; G.cara = "sonrisa"; }
    }
    if (t >= T_ACERCA && t < T_ATRAS + 0.4) {
      const ka = eInOut(tramo(t, T_ACERCA, T_ACERCA + 0.35)), kb = eInOut(tramo(t, T_ATRAS, T_ATRAS + 0.4));
      xg = lerp(XG0, XG1, ka * (1 - kb));
      const mov = (ka > 0 && ka < 1) || (kb > 0 && kb < 1);
      if (mov) { const a = andar(this.fG, 0.8); G.piernaI = a.piernaI; G.piernaD = a.piernaD; }
      G.manoI = [9, 160]; G.cara = "sonrisa"; G.rc = 0.1;
      // lleva la corona a la cabeza de Marcos
      const mM = matAv(XM, PIES, ESC, 0, 1, 1 - 0.09);
      const cab = aPant(mM, [37, 14]);
      const mG0 = matAv(xg, yg, ESC);
      const objetivo = enAv(mG0, [cab[0], cab[1] + 10]);
      const kc = eInOut(tramo(t, T_ACERCA + 0.15, T_PONE)) * (1 - eInOut(tramo(t, T_PONE + 0.1, T_ATRAS + 0.2)));
      G.manoD = mezcla([52, 96], objetivo, kc); yg -= 8 * kc;
      if (t > T_PONE) { G.cara = "risa"; }
    }
    if (t >= T_ATRAS + 0.4) {
      // aplaude
      const c = Math.abs(Math.sin((t - T_ATRAS) * 13));
      G.manoD = [48 + 10 * c, 100]; G.manoI = [30 - 10 * c, 100]; G.brazoIDelante = true;
      G.cara = Math.floor(t * 1.6) % 2 ? "risa" : "sonrisa"; G.rc = 0.1;
      if (t > T_GUINO) { G.cara = "risa"; G.rc = 0.12 + 0.04 * Math.sin(t * 13); }
    }
    // ---------------- objetos
    const kRojo = tramo(t, T_COLOR, T_COLOR + 0.3) * (1 - tramo(t, T_TACHAN, T_TACHAN + 0.3)) + tramo(t, T_PONE + 0.2, T_PONE + 0.5) * (1 - tramo(t, T_PUNO, T_PUNO + 0.4));
    const puesta = t > T_PONE, brC = puesta ? Math.max(0.3, 1 - tramo(t, T_PONE, T_PONE + 1)) : 0;
    M.objD = (g) => {
      g.save(); g.translate(RM.cuello[0], RM.cuello[1]); g.rotate(M.rc || 0); g.translate(-RM.cuello[0], -RM.cuello[1]);
      colorado(g, kRojo);
      if (puesta) corona(g, 37, 12, brC, t);
      g.restore();
      if (this.cascoQ) cascoEn(g, this.cascoQ.c[0], this.cascoQ.c[1], this.cascoQ.rot, 0.65);
    };
    if (t >= T_PECHO) M.objI2 = (g, m) => cascoEn(g, m[0] + 4, m[1] - 12, -0.25, 0.65);
    if (this.coronaG === "atras") G.objI = (g, m) => corona(g, m[0] + 4, m[1] - 4, 0, t);
    if (this.coronaG === "izq") G.objI2 = (g, m) => corona(g, m[0] + 2, m[1] - 8, 0.7, t);
    if (this.coronaG === "dch") G.objD2 = (g, m) => corona(g, m[0] - 4, m[1] - 10, 0.7, t);
    const mG = matAv(xg, yg, ESC), mM = matAv(xm, ym, ESC, 0, sxM, syM);
    return { G, M, mG, mM };
  }
  vecino(V) {
    const t = this.t, s = Math.sin(t * 13 + V.t0 * 7), c = Math.abs(s);
    const izq = V.b === 0;
    const P = { cara: V.cara, rc: izq ? 0.1 : -0.1, piernaI: [0, 0], piernaD: [0, 0], gafas: V.gafas, oro: V.oro || 0, puntas: V.puntas || 0 };
    // aplauden
    P.manoD = [48 + 10 * c, 100]; P.manoI = [30 - 10 * c, 100]; P.brazoIDelante = true;
    if (t < V.t0 + 0.4) P.cara = "sorpresa";
    if (t > T_PONE && t < T_PONE + 0.6) P.cara = "sorpresa";
    // con el título: brazos arriba y lanzan confeti
    if (t > T_TIT - 0.1) {
      const k = eOut(tramo(t, T_TIT - 0.1, T_TIT + 0.15));
      P.manoD = mezcla(P.manoD, [92 + 6 * s, 30], k); P.manoI = mezcla(P.manoI, [-14 - 6 * s, 30], k); P.brazoIDelante = false;
      P.cara = V.cara === "sorpresa" ? "risa" : V.cara;
      if (t > T_TIT + 1.6) { P.manoD = [48 + 10 * c, 100]; P.manoI = [30 - 10 * c, 100]; P.brazoIDelante = true; }
    }
    const sube = 1 - eBack(tramo(t, V.t0, V.t0 + 0.3));
    const F = PISOS[V.p], x = BX[V.b];
    return { P, m: matAv(x, F + 2 + 100 * sube - (t > T_TIT - 0.1 && t < T_TIT + 1.6 ? 6 * c : 0), EV), x, F };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    if (t < T_LLEGA) this.fM += dt * 9;
    if ((t > T_ACERCA && t < T_ACERCA + 0.35) || (t > T_ATRAS && t < T_ATRAS + 0.4)) this.fG += dt * 10;
    VECINOS.forEach((V, i) => this.una("v" + i, t > V.t0, () => {
      const x = BX[V.b], F = PISOS[V.p];
      for (let k = 0; k < 6; k++) p.nueva(P.PURPURINA, x + azar(-50, 50), F - azar(60, 140), azar(-30, 30), azar(-20, 20), azar(0.5, 0.9), azar(8, 12));
    }));
    this.una("luces", t > T_LUCES, () => temblar(5, 0.2));
    this.una("tachan", t > T_TACHAN, () => {
      const c = [XG0 - 20, 330];
      for (let k = 0; k < 18; k++) { const a = azar(0, 6.283), v = azar(120, 280); p.nueva(P.PURPURINA, c[0], c[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.6, 1.1), azar(10, 15)); }
    });
    this.una("pone", t > T_PONE, () => {
      temblar(10, 0.3);
      const c = [XM, PIES - 222 * ESC];
      p.nueva(P.DESTELLO, c[0], c[1], 0, 0, 0.35, 180);
      for (let k = 0; k < 24; k++) { const a = azar(-Math.PI, 0), v = azar(160, 360); p.nueva(P.CHISPA, c[0], c[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.7), azar(6, 10)); }
    });
    this.una("tit", t > T_TIT, () => {
      temblar(14, 0.4);
      for (const V of VECINOS) {
        const x = BX[V.b], F = PISOS[V.p], dir = V.b === 0 ? 1 : -1;
        for (let k = 0; k < 24; k++) p.nueva(P.CONFETI, x, F - 120, dir * azar(80, 380), azar(-380, -120), azar(2.6, 3.8), azar(9, 15), (Math.random() * 5) | 0);
      }
    });
    // pétalos que caen durante la reverencia
    if (t > T_REV[0] && t < T_APAGA && Math.random() < 14 * dt) p.nueva(P.CONFETI, azar(260, 780), azar(-30, -5), azar(-30, 30), azar(30, 90), azar(4, 5), azar(10, 14), Math.random() < 0.6 ? 3 : 1);
    this.una("puno", t > T_PUNO, () => temblar(8, 0.2));
    p.actualizar(dt);
  }
  fondo() {
    if (CT.has("fondo")) return CT.get("fondo");
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, 480);
    gc.addColorStop(0, "#141a40"); gc.addColorStop(0.55, "#5a3a7a"); gc.addColorStop(0.85, "#e8784a"); gc.addColorStop(1, "#ffc27a");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, 560);
    const q = semilla(21);
    g.fillStyle = "rgba(255,255,255,.75)"; for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(250 + q() * 524, q() * 220, 0.8 + q() * 1.3, 0, 6.283); g.fill(); }
    g.fillStyle = "#fff4d0"; g.beginPath(); g.arc(700, 250, 26, 0, 6.283); g.fill();
    g.fillStyle = "#5a3a7a"; g.beginPath(); g.arc(710, 244, 22, 0, 6.283); g.fill();
    // calle al fondo con casas lejanas
    g.fillStyle = "#2a2040";
    for (const [x, w, h] of [[250, 90, 120], [330, 70, 160], [400, 110, 100], [520, 80, 140], [600, 100, 110], [690, 90, 150]]) g.fillRect(x, 470 - h, w, h);
    g.fillStyle = "rgba(255,210,120,.8)";
    for (let i = 0; i < 26; i++) { const x = 260 + q() * 500, y = 340 + q() * 110; g.fillRect(x, y, 6, 8); }
    // fachadas
    const fach = (x0, x1, col, col2) => {
      const gr = g.createLinearGradient(x0, 0, x1, 0);
      gr.addColorStop(0, col); gr.addColorStop(1, col2);
      g.fillStyle = gr; g.fillRect(x0, -60, x1 - x0, 560);
      g.fillStyle = "rgba(0,0,0,.06)"; for (let y = -60; y < 500; y += 22) g.fillRect(x0, y, x1 - x0, 2);
      g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(x0, 120, x1 - x0, 8); g.fillRect(x0, 262, x1 - x0, 8); g.fillRect(x0, 402, x1 - x0, 8);
    };
    fach(-60, 255, "#c86a3a", "#e08a52");
    fach(769, W + 60, "#e0b060", "#c89040");
    // puertas de los balcones (apagadas)
    for (const x of BX) for (const F of PISOS) {
      g.fillStyle = "#e8dcc4"; g.fillRect(x - 56, F - 156, 112, 156);
      g.fillStyle = "#1a1626"; g.fillRect(x - 48, F - 148, 96, 148);
      g.fillStyle = "#3a2a3a"; g.fillRect(x - 2, F - 148, 4, 148);
    }
    // guirnalda de bombillas
    g.strokeStyle = "#1a1a1a"; g.lineWidth = 2; g.beginPath(); g.moveTo(255, 150); g.quadraticCurveTo(512, 250, 769, 150); g.stroke();
    // suelo
    const gs = g.createLinearGradient(0, 495, 0, H + 60);
    gs.addColorStop(0, "#8a7a6a"); gs.addColorStop(1, "#4a4038");
    g.fillStyle = gs; g.fillRect(-60, 495, W + 120, H + 60 - 495);
    g.strokeStyle = "rgba(0,0,0,.2)"; g.lineWidth = 2;
    for (let i = -10; i <= 10; i++) { g.beginPath(); g.moveTo(512 + i * 60, 495); g.lineTo(512 + i * 150, H + 60); g.stroke(); }
    for (const y of [520, 552, 592]) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    CT.set("fondo", c);
    return c;
  }
  barandillas() {
    if (CT.has("bar")) return CT.get("bar");
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    for (const x of BX) for (const F of PISOS) {
      // losa
      g.fillStyle = "#6a5a50"; g.fillRect(x - 78, F, 156, 10);
      g.fillStyle = "rgba(0,0,0,.3)"; g.fillRect(x - 78, F + 10, 156, 4);
      // barandilla de forja
      g.strokeStyle = "#1e1e22"; g.lineWidth = 3;
      g.beginPath(); g.moveTo(x - 74, F - 56); g.lineTo(x + 74, F - 56); g.moveTo(x - 74, F - 6); g.lineTo(x + 74, F - 6); g.stroke();
      g.lineWidth = 2.2; g.beginPath(); for (let bx = x - 70; bx <= x + 70; bx += 10) { g.moveTo(bx, F - 56); g.lineTo(bx, F); } g.stroke();
      g.lineWidth = 1.6; g.beginPath(); for (let bx = x - 64; bx <= x + 60; bx += 20) { g.moveTo(bx + 10, F - 31); g.arc(bx + 5, F - 31, 5, 0, 6.283); } g.stroke();
      // macetas con geranios
      for (const sd of [-1, 1]) {
        const mx = x + sd * 62;
        g.fillStyle = "#b4513a"; g.beginPath(); g.moveTo(mx - 12, F - 70); g.lineTo(mx + 12, F - 70); g.lineTo(mx + 9, F - 56); g.lineTo(mx - 9, F - 56); g.closePath(); g.fill();
        g.fillStyle = "#2e7a32"; g.beginPath(); g.arc(mx, F - 74, 11, 0, 6.283); g.fill();
        g.fillStyle = sd > 0 ? "#e11e14" : "#ff3d84"; for (const [dx, dy] of [[-5, -78], [4, -80], [0, -72], [7, -73]]) { g.beginPath(); g.arc(mx + dx, F + dy, 3.4, 0, 6.283); g.fill(); }
      }
    }
    CT.set("bar", c);
    return c;
  }
  titulo() {
    if (CT.has("tit")) return CT.get("tit");
    const c = lienzoNuevo(560, 266), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 230);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.45, "#fff1a8"); gr.addColorStop(1, "#ffb21f");
    txt(g, "¡GRACIAS,", 284, 98, { tam: 100, peso: 400, fam: FC, color: "#2a1200", esp: 4, max: 520 });
    txt(g, "¡GRACIAS,", 280, 94, { tam: 100, peso: 400, fam: FC, color: gr, borde: "#2a1200", bordeAncho: 12, esp: 4, glow: "rgba(255,190,40,.85)", glowTam: 22, max: 520 });
    txt(g, "HÉROE!", 284, 244, { tam: 132, peso: 400, fam: FC, color: "#2a1200", esp: 6, max: 520 });
    txt(g, "HÉROE!", 280, 240, { tam: 132, peso: 400, fam: FC, color: gr, borde: "#2a1200", bordeAncho: 13, esp: 6, glow: "rgba(255,190,40,.85)", glowTam: 24, max: 520 });
    CT.set("tit", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses(), a = this.luz();
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    // bombillas de la guirnalda (se encienden con los balcones)
    const kl = tramo(t, T_LUCES, T_LUCES + 0.8);
    for (let i = 0; i < 11; i++) {
      const u = (i + 0.5) / 11, x = lerp(255, 769, u), y = (1 - u) * (1 - u) * 150 + 2 * u * (1 - u) * 250 + u * u * 150;
      const on = kl > u;
      g.fillStyle = on ? CONFETI[i % 5] : "#3a3440"; g.beginPath(); g.ellipse(x, y + 8, 5, 7, 0, 0, 6.283); g.fill();
      if (on) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5; g.drawImage(BLOB.amarillo, x - 22, y - 14, 44, 44); g.restore(); }
    }
    // balcones que se encienden y vecinos
    for (const V of VECINOS) {
      const v = this.vecino(V);
      const on = t > V.t0 - 0.1 ? (t < V.t0 ? (Math.sin(t * 90) > 0 ? 1 : 0.3) : 1) : 0;
      if (on > 0) {
        g.save(); g.globalAlpha = on;
        const gr = g.createLinearGradient(0, v.F - 148, 0, v.F);
        gr.addColorStop(0, "#ffe6a0"); gr.addColorStop(1, "#ff9a3a");
        g.fillStyle = gr; g.fillRect(v.x - 48, v.F - 148, 96, 148);
        g.fillStyle = "rgba(120,60,20,.5)"; g.fillRect(v.x - 2, v.F - 148, 4, 148);
        g.restore();
      }
      if (t > V.t0) {
        g.save(); g.beginPath(); g.rect(v.x - 80, v.F - 170, 160, 170); g.clip();
        pintarAvatar(g, v.m, v.P, t);
        g.restore();
      }
    }
    g.drawImage(this.barandillas(), 0, 0);
    // luz cálida sobre la plaza
    if (kl > 0) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.18 * kl; g.drawImage(BLOB2.oro, 200, 260, 620, 360); g.restore(); }
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    this.p.dibujar(g);
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 7, esp: 2, alfa: 1 - tramo(d, dur - 0.12, dur) });
      g.restore();
    };
    VECINOS.forEach((V, i) => {
      const x = BX[V.b] + (V.b === 0 ? 112 : -112), y = PISOS[V.p] - 92;
      ono("¡CLAP!", x, y, V.t0 + 0.3, 0.45, 32, "#fffdf5", "#1b1b1b", V.b === 0 ? 0.12 : -0.12);
      ono("¡CLAP!", x, y + 10, V.t0 + 1.05 + (i % 3) * 0.15, 0.4, 30, "#ffd34d", "#3a2400", V.b === 0 ? -0.1 : 0.1);
    });
    if (t > 1.75 && t < 2.6) bocadillo(g, 680, 200, "¿Y ESTO?", XM + 10, 280, tramo(t, 1.75, 1.9) * (1 - tramo(t, 2.45, 2.6)), 36);
    ono("¡TACHÁN!", 300, 250, T_TACHAN, 0.8, 50, "#ffd34d", "#3a2400", -0.1);
    ono("¡CHAN!", 760, 250, T_PONE, 0.6, 52, "#ffd34d", "#3a2400", 0.1);
    // ¡GRACIAS, HÉROE!
    if (t > T_TIT) {
      const d = t - T_TIT, k = tramo(d, 0, 0.18), s = lerp(2.2, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 6));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 116); g.rotate(-0.03); g.scale(s * 0.82, s * 0.82);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const n = 1 - a;
    if (n > 0) { g.fillStyle = `rgba(0,0,0,${n})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00256", nombre: "Héroe del barrio", crear: () => new HeroeBarrio() });
})();
