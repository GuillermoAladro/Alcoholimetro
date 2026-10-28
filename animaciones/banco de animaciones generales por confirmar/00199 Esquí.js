"use strict";
/*
 * 00199 · ESQUÍ
 *
 * Animación del banco. Empieza y acaba en negro.
 * Bajan una pista nevada (la cámara los sigue). Marcos, en tabla, salta una rampa con una vuelta entera; Guillermo,
 * en esquís, se anima, pilla la rampa… y sale disparado dando vueltas hasta clavarse de cabeza en la nieve. Empieza a
 * rodar y se convierte en una bola de nieve gigante que baja gritando ¡PISTA!; Marcos la salta por los pelos y la bola
 * revienta contra un pino. Guillermo queda sentado en la nieve, mareado, con los esquís en la cabeza. Nadie se hace daño.
 */
(() => {
const cache = cacheTexto();
const DUR = 10.2, ESC = 1.15, Y0 = 362, TAN = 0.2, ANG = Math.atan(TAN), V = 380;
const XG = 300, XM = 640;
const T_RM = 1.25, T_AM = 2.25;      // salto de Marcos (rampa → aterriza)
const T_RG = 3.6, T_PLOF = 4.4;      // salto de Guillermo y cabezazo en la nieve
const T_BOLA = 4.85, T_CHOQUE = 6.75; // la bola rueda… y choca
const T_SM = 5.95, T_AM2 = 6.95;     // Marcos salta la bola
const suelo = (x) => Y0 + x * TAN;
/** Distancia recorrida por la cámara (frena después del choque). */
function S(t) {
  if (t < 6.3) return V * t;
  const d = Math.min(t - 6.3, 0.6);
  return V * 6.3 + V * (d - (d * d) / 1.2);
}
const S_FIN = S(10);
const RAMPA_M = S(T_RM) + XM + 40, RAMPA_G = S(T_RG) + XG + 40, PINO = S_FIN + 905;
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(620, 220), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 170);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#ff6a5a"); gr.addColorStop(1, "#c8001e");
  g.save(); g.translate(310, 110); g.transform(1, 0, -0.14, 1, 0, 0);
  txt(g, "¡PISTA!", 8, 66, { tam: 170, peso: 400, fam: FC, color: "#2a0008", esp: 6 });
  txt(g, "¡PISTA!", 0, 58, { tam: 170, peso: 400, fam: FC, color: gr, borde: "#2a0008", bordeAncho: 12, esp: 6, glow: "rgba(255,255,255,.9)", glowTam: 22 });
  g.restore();
  cache.set("t", c);
  return c;
}
/** Esquís (unidades de avatar) bajo los pies; `cruz` 0–1 los cruza. */
function esquis(g, cruz = 0) {
  for (const [dx, dy, a] of [[0, 0, 0.32 * cruz], [6, -3, -0.32 * cruz]]) {
    g.save(); g.translate(39 + dx, 232 + dy); g.rotate(a);
    const gr = g.createLinearGradient(0, -3, 0, 3);
    gr.addColorStop(0, "#ff5a3a"); gr.addColorStop(1, "#a01a0a");
    g.fillStyle = gr; g.beginPath();
    g.moveTo(-62, -1.5); g.lineTo(54, -1.5); g.quadraticCurveTo(66, -2, 70, -10); g.quadraticCurveTo(68, 2, 58, 2.5); g.lineTo(-62, 2.5); g.closePath(); g.fill();
    g.fillStyle = "#222"; g.fillRect(-10, -4, 20, 4);
    g.restore();
  }
}
function tabla(g) {
  g.save(); g.translate(39, 234);
  const gr = g.createLinearGradient(-60, 0, 60, 0);
  gr.addColorStop(0, "#2fe3e8"); gr.addColorStop(0.5, "#7a3cff"); gr.addColorStop(1, "#ff3d84");
  g.fillStyle = gr; rectR(g, -56, -3.5, 112, 7, 3.5); g.fill();
  g.fillStyle = "rgba(255,255,255,.5)"; g.fillRect(-50, -2.6, 100, 1.4);
  g.fillStyle = "#1a1a1a"; g.fillRect(-26, -6, 14, 4); g.fillRect(10, -6, 14, 4);
  g.restore();
}
function baston(g, mano, a) {
  g.save(); g.translate(mano[0], mano[1]); g.rotate(a);
  g.strokeStyle = "#c8ccd4"; g.lineWidth = 2.2; g.lineCap = "round";
  g.beginPath(); g.moveTo(0, -6); g.lineTo(0, 92); g.stroke();
  g.strokeStyle = "#333"; g.lineWidth = 1.4; g.beginPath(); g.ellipse(0, 82, 6, 2, 0, 0, 6.283); g.stroke();
  g.fillStyle = "#222"; rectR(g, -2.6, -10, 5.2, 12, 2); g.fill();
  g.restore();
}
function pino(g, x, y, h) {
  g.fillStyle = "#4a2e18"; g.fillRect(x - h * 0.05, y - h * 0.18, h * 0.1, h * 0.2);
  for (let k = 0; k < 4; k++) {
    const w = h * (0.36 - k * 0.07), yy = y - h * 0.15 - k * h * 0.2;
    g.fillStyle = k % 2 ? "#1e5a3a" : "#246a44";
    g.beginPath(); g.moveTo(x - w, yy); g.lineTo(x, yy - h * 0.34); g.lineTo(x + w, yy); g.closePath(); g.fill();
    g.fillStyle = "#f4fbff";
    g.beginPath(); g.moveTo(x - w * 0.55, yy - h * 0.14); g.lineTo(x, yy - h * 0.34); g.lineTo(x + w * 0.55, yy - h * 0.14);
    g.quadraticCurveTo(x, yy - h * 0.2, x - w * 0.55, yy - h * 0.14); g.fill();
  }
}

class Esqui extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(300);
    this.copos = [];
    this.fondoC = null;
  }
  /** Altura de un salto (px) con parábola. */
  salto(t, t0, t1, h) { if (t < t0 || t > t1) return 0; const u = tramo(t, t0, t1); return 4 * h * u * (1 - u); }
  /** Matriz con el centro del cuerpo en su sitio: x en pantalla, altura sobre la nieve y giro. */
  mat(x, alto, giro, esc = ESC, sx = 1, sy = 1) {
    const c = [x + Math.sin(giro) * 116 * esc * sy, suelo(x) - alto - Math.cos(giro) * 116 * esc * sy];
    return matAv(c[0], c[1], esc, giro, sx, sy, [39, 116]);
  }
  bola(t) {
    if (t < T_BOLA) return null;
    const u = tramo(t, T_BOLA, T_CHOQUE);
    const x0 = S(T_PLOF) + XG + 30 - S(T_BOLA);
    const x = lerp(x0, 780, Math.pow(u, 1.7)), r = 30 + 80 * u;
    return { x, y: suelo(x) - r, r, ang: (x + S(t)) / 55, u };
  }
  poseG() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0.05], piernaD: [0, -0.05], brazoIDelante: true };
    let x = XG, alto = 0, giro = ANG, mD = [84, 150], mI = [-6, 150], aD = 0.35, aI = 0.35, cruz = 0, enterrado = 0, centro = null;
    pose.cara = t < 1.4 ? "sonrisa" : t < 2.4 ? "sorpresa" : t < 3.2 ? "guino" : "sorpresa";
    if (t > 1.4 && t < 2.4) pose.rc = -0.1;
    // se tambalea antes de la rampa
    if (t > 2.6 && t < T_RG) { const k = Math.sin(tramo(t, 2.6, T_RG) * Math.PI); giro += 0.1 * k * Math.sin(t * 13); mD = [96, 70 + 30 * Math.sin(t * 13)]; mI = [-18, 70 - 30 * Math.sin(t * 13)]; aD = -0.8; aI = 0.8; }
    if (t >= T_RG && t < T_PLOF) {
      // ¡por los aires! vueltas sin control
      const u = tramo(t, T_RG, T_PLOF);
      giro = ANG + eIn(u) * (Math.PI - ANG + 0.1) - 0.5 * Math.sin(u * Math.PI);
      const c0 = [XG + Math.sin(ANG) * 116 * ESC, suelo(XG) - Math.cos(ANG) * 116 * ESC];
      const c1 = [XG + 30, suelo(XG + 30) + 40 - 116 * ESC];
      centro = [lerp(c0[0], c1[0], u), lerp(c0[1], c1[1], u) - 4 * 200 * u * (1 - u)];
      mD = [100, 30 + 30 * Math.sin(t * 22)]; mI = [-22, 30 - 30 * Math.sin(t * 22)]; aD = -1.2; aI = 1.4;
      cruz = u; pose.puntas = 0.8; pose.piernaI = [-6, 0.3 * Math.sin(t * 20)]; pose.piernaD = [-10, -0.3 * Math.sin(t * 20)];
    }
    if (t >= T_PLOF) {
      // clavado de cabeza en la nieve (se queda en su sitio y la cámara sigue)
      x = XG - (S(t) - S(T_PLOF)) + 30;
      giro = Math.PI + 0.1 + 0.08 * Math.sin(t * 25) * (1 - tramo(t, T_PLOF, T_PLOF + 0.3));
      centro = [x, suelo(x) + 40 - 116 * ESC]; enterrado = 1; cruz = 1;
      mD = [96, 120]; mI = [-18, 120]; aD = -0.4; aI = 0.4;
      pose.piernaI = [-4, 0.25 + 0.2 * Math.sin(t * 18)]; pose.piernaD = [-4, -0.25 - 0.2 * Math.sin(t * 18)];
      pose.cara = "sorpresa";
    }
    const m = centro ? matAv(centro[0], centro[1], ESC, giro, 1, 1, [39, 116]) : this.mat(x, alto, giro);
    pose.manoD = mD; pose.manoI = mI;
    pose.objD = (g, mano) => baston(g, mano, aD);
    pose.objI = (g, mano) => baston(g, mano, aI);
    return { pose, m, x, cruz, enterrado, vis: t < T_BOLA };
  }
  poseM() {
    const t = this.t;
    const pose = { quien: "marcos", cara: "guino", rc: 0, piernaI: [0, 0.06], piernaD: [0, -0.06], brazoIDelante: true };
    let x = XM, alto = 0, giro = ANG, mD = [80, 120], mI = [-6, 120], sy = 1;
    pose.cara = t < 0.9 ? "sonrisa" : "guino";
    if (t > T_RM && t < T_AM) {
      // salto con vuelta entera
      const u = tramo(t, T_RM, T_AM);
      alto = 4 * 170 * u * (1 - u);
      giro = ANG - eInOut(tramo(u, 0.15, 0.85)) * Math.PI * 2;
      mD = [52, 200]; mI = [24, 200]; sy = 1 - 0.18 * Math.sin(u * Math.PI);
      pose.piernaI = [-12, 0.1]; pose.piernaD = [-12, -0.1];
      pose.cara = "risa";
    }
    if (t > T_AM && t < T_AM + 0.7) { const k = Math.sin(tramo(t, T_AM, T_AM + 0.7) * Math.PI); mD = [96, 60 - 20 * k]; mI = [-20, 60 - 20 * k]; pose.cara = "risa"; }
    // mira atrás: ¡viene la bola!
    if (t > 5.3 && t < T_SM) { pose.cara = "sorpresa"; pose.rc = -0.2; mD = [80, 110]; mI = [-24, 80]; }
    if (t >= T_SM && t < T_AM2) {
      const u = tramo(t, T_SM, T_AM2);
      alto = 4 * 215 * u * (1 - u);
      giro = ANG + 0.25 * Math.sin(u * Math.PI); sy = 1 - 0.2 * Math.sin(u * Math.PI);
      mD = [96, 30]; mI = [-20, 30]; pose.cara = u < 0.5 ? "sorpresa" : "risa"; pose.puntas = 0.5 * Math.sin(u * Math.PI);
      pose.piernaI = [-16, 0.15]; pose.piernaD = [-16, -0.15];
    }
    if (t >= T_AM2) {
      // derrapa y se para; se ríe
      const k = eOut(tramo(t, T_AM2, T_AM2 + 0.6));
      x = lerp(XM, 600, k); giro = ANG - 0.18 * Math.sin(k * Math.PI);
      pose.cara = t < 7.3 ? "sorpresa" : "risa"; pose.rc = t > 7.3 ? 0.08 * Math.sin(t * 12) : 0;
      mD = t > 7.3 ? [56, 150 + 3 * Math.sin(t * 24)] : [90, 100]; mI = t > 7.3 ? [16, 140] : [-14, 100];
      if (t > 8.6) { pose.cara = "guino"; mD = [92, 54]; }
    }
    const m = this.mat(x, alto, giro, ESC, 1, sy);
    pose.manoD = mD; pose.manoI = mI;
    return { pose, m, x, alto };
  }
  nieve(x, y, n, vx, vy) {
    for (let i = 0; i < n; i++) this.copos.push({ x: x + azar(-10, 10), y: y + azar(-6, 6), vx: vx + azar(-90, 90), vy: vy + azar(-90, 40), v: azar(0.35, 0.8), s: azar(3, 8) });
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const vel = (S(t + dt) - S(t)) / dt;
    // estela de nieve detrás de los dos
    if (vel > 50) {
      if (t < T_RG || t > T_PLOF + 2) { const eM = this.poseM(); if (eM.alto < 2 && Math.random() < 30 * dt) this.nieve(eM.x - 50, suelo(eM.x - 50) - 4, 2, -vel * 0.4, -120); }
      if (t < T_RG && Math.random() < 30 * dt) this.nieve(XG - 50, suelo(XG - 50) - 4, 2, -vel * 0.4, -120);
    }
    this.una("aterrizaM", t > T_AM, () => { temblar(5, 0.12); this.nieve(XM, suelo(XM), 16, -100, -200); });
    this.una("plof", t > T_PLOF, () => { temblar(14, 0.3); this.nieve(XG + 30, suelo(XG + 30), 30, 0, -320); });
    this.una("bola", t > T_BOLA, () => { const b = this.bola(t); this.nieve(b.x, b.y, 26, 0, -260); });
    const b = this.bola(t);
    if (b && t < T_CHOQUE && Math.random() < 40 * dt) this.nieve(b.x - b.r * 0.6, suelo(b.x) - 6, 2, -200, -200);
    this.una("aterrizaM2", t > T_AM2, () => { temblar(5, 0.12); this.nieve(XM, suelo(XM), 14, -60, -200); });
    if (t > T_AM2 && t < T_AM2 + 0.6 && Math.random() < 60 * dt) this.nieve(this.poseM().x + 50, suelo(this.poseM().x + 50) - 4, 3, 320, -240);
    this.una("choque", t > T_CHOQUE, () => {
      temblar(26, 0.5);
      const bb = this.bola(T_CHOQUE);
      p.nueva(P.DESTELLO, bb.x, bb.y, 0, 0, 0.35, 300);
      for (let i = 0; i < 70; i++) { const a = azar(-Math.PI, 0.3), v = azar(150, 650); this.copos.push({ x: bb.x + azar(-60, 60), y: bb.y + azar(-60, 60), vx: Math.cos(a) * v, vy: Math.sin(a) * v, v: azar(0.6, 1.4), s: azar(6, 16) }); }
      for (let i = 0; i < 40; i++) this.copos.push({ x: 905 + azar(-130, 130), y: azar(60, 260), vx: azar(-20, 20), vy: azar(0, 80), v: azar(0.8, 1.6), s: azar(4, 9) });
    });
    for (const c of this.copos) { c.vy += 900 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.v -= dt; }
    this.copos = this.copos.filter((c) => c.v > 0);
    if (this.copos.length > 360) this.copos.splice(0, this.copos.length - 360);
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, 400);
    gc.addColorStop(0, "#2a7ae8"); gc.addColorStop(1, "#c8ecff");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, H + 120);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8; g.drawImage(BLOB.amarillo, 820, -90, 260, 260); g.restore();
    g.fillStyle = "#fffbe0"; g.beginPath(); g.arc(950, 40, 34, 0, 6.283); g.fill();
    // montañas
    const monte = (pts, col, nieve) => {
      g.fillStyle = col; g.beginPath(); g.moveTo(-60, 420);
      for (const [x, y] of pts) g.lineTo(x, y);
      g.lineTo(W + 60, 420); g.closePath(); g.fill();
      g.fillStyle = nieve;
      for (let i = 1; i < pts.length - 1; i++) {
        const [x, y] = pts[i]; if (y > pts[i - 1][1] || y > pts[i + 1][1]) continue;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x - 34, y + 46); g.lineTo(x - 12, y + 38); g.lineTo(x, y + 52); g.lineTo(x + 14, y + 40); g.lineTo(x + 36, y + 48); g.closePath(); g.fill();
      }
    };
    monte([[-60, 260], [120, 120], [260, 230], [420, 90], [600, 250], [760, 130], [900, 230], [1084, 150]], "#7a92c8", "#f4f8ff");
    monte([[-60, 300], [200, 210], [380, 300], [560, 200], [740, 300], [960, 220], [1084, 280]], "#5a74ac", "#e8f0ff");
    this.fondoC = c;
    return c;
  }
  pista(g, t) {
    const s = S(t);
    const gr = g.createLinearGradient(0, Y0 - 60, 0, H + 60);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(1, "#cfe2f4");
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(-60, suelo(-60)); g.lineTo(W + 60, suelo(W + 60)); g.lineTo(W + 60, H + 60); g.lineTo(-60, H + 60); g.closePath(); g.fill();
    g.strokeStyle = "rgba(120,160,200,.6)"; g.lineWidth = 3; g.beginPath(); g.moveTo(-60, suelo(-60)); g.lineTo(W + 60, suelo(W + 60)); g.stroke();
    // huellas y puntitos que pasan
    g.strokeStyle = "rgba(150,180,215,.45)"; g.lineWidth = 2;
    for (let k = 0; k < 6; k++) {
      const off = 40 + k * 28, x0 = ((k * 337 - s) % 700 + 700) % 700 - 200;
      g.beginPath(); g.moveTo(x0, suelo(x0) + off); g.lineTo(x0 + 260, suelo(x0 + 260) + off); g.stroke();
    }
    // pinos al borde de la pista (detrás) y banderines
    for (let k = -1; k < 6; k++) {
      const wx = Math.floor(s / 380) * 380 + k * 380 + 150, x = wx - s;
      if (x < -120 || x > W + 120) continue;
      pino(g, x, suelo(x) - 10, 110 + ((wx / 380) % 3) * 22);
    }
    for (let k = -1; k < 8; k++) {
      const wx = Math.floor(s / 260) * 260 + k * 260 + 60, x = wx - s;
      if (x < -60 || x > W + 60) continue;
      const y = suelo(x) + 60;
      g.strokeStyle = (wx / 260) % 2 ? "#e8283a" : "#2a6aff"; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 54); g.stroke();
      g.fillStyle = g.strokeStyle; g.beginPath(); g.moveTo(x, y - 54); g.lineTo(x + 20, y - 46); g.lineTo(x, y - 38); g.fill();
    }
    // rampas
    for (const R of [RAMPA_M, RAMPA_G]) {
      const x = R - s;
      if (x < -200 || x > W + 200) continue;
      g.fillStyle = "#f4faff"; g.strokeStyle = "rgba(120,160,200,.8)"; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(x - 110, suelo(x - 110) + 2); g.quadraticCurveTo(x - 10, suelo(x) - 10, x + 6, suelo(x + 6) - 56); g.lineTo(x + 26, suelo(x + 26) + 2); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "rgba(160,190,225,.6)"; g.beginPath(); g.moveTo(x + 6, suelo(x + 6) - 56); g.lineTo(x + 26, suelo(x + 26) + 2); g.lineTo(x + 6, suelo(x + 6) + 2); g.fill();
    }
  }
  pinoGrande(g, t) {
    const x = PINO - S(t);
    if (x > W + 200) return;
    const caido = t > T_CHOQUE;
    g.save(); g.translate(x, suelo(x) + 10); g.rotate(caido ? 0.04 * Math.sin((t - T_CHOQUE) * 30) * Math.exp(-(t - T_CHOQUE) * 4) : 0);
    pino(g, 0, 0, 420);
    if (caido) { g.fillStyle = "#246a44"; g.globalAlpha = 0.25; g.fillRect(-150, -380, 0, 0); g.globalAlpha = 1; }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, eG = this.poseG(), eM = this.poseM(), B = this.bola(t);
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    this.pista(g, t);
    this.pinoGrande(g, t);
    // sombras
    g.fillStyle = "rgba(90,130,180,.3)";
    g.beginPath(); g.ellipse(eM.x + 10, suelo(eM.x + 10) + 4, 70 * (1 - Math.min(0.7, eM.alto / 400)), 9, ANG, 0, 6.283); g.fill();
    // Guillermo (de pie, por los aires o clavado)
    if (eG.vis) {
      if (!eG.enterrado) { g.beginPath(); g.ellipse(XG + 10, suelo(XG + 10) + 4, 70, 9, ANG, 0, 6.283); g.fill(); }
      g.save();
      if (eG.enterrado) { g.beginPath(); g.moveTo(-60, suelo(-60) - 6); g.lineTo(W + 60, suelo(W + 60) - 6); g.lineTo(W + 60, -60); g.lineTo(-60, -60); g.closePath(); g.clip(); }
      conMat(g, eG.m, () => esquis(g, eG.cruz));
      pintarAvatar(g, eG.m, eG.pose, t);
      g.restore();
      if (eG.enterrado) {
        // montón de nieve tapando la cabeza
        const q = [eG.x, suelo(eG.x)];
        g.fillStyle = "#ffffff"; g.strokeStyle = "rgba(120,160,200,.8)"; g.lineWidth = 2.5;
        g.beginPath(); g.ellipse(q[0], q[1] - 6, 80, 34, ANG, Math.PI, 0); g.fill(); g.stroke();
      }
    }
    // la bola de nieve con Guillermo dentro
    if (B && t < T_CHOQUE) {
      const { x, y, r, ang } = B;
      g.fillStyle = "rgba(90,130,180,.3)"; g.beginPath(); g.ellipse(x, y + r + 2, r * 0.9, 9, ANG, 0, 6.283); g.fill();
      // esquís y bastones que asoman y giran con la bola
      g.save(); g.translate(x, y); g.rotate(ang);
      for (const [a, col, L, w] of [[0.4, "#d8341a", 1.55, 7], [2.3, "#d8341a", 1.5, 7], [3.9, "#c8ccd4", 1.4, 3.5], [5.2, "#c8ccd4", 1.35, 3.5]]) {
        g.save(); g.rotate(a); g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round";
        g.beginPath(); g.moveTo(r * 0.5, 0); g.lineTo(r * L, 0); g.stroke(); g.restore();
      }
      g.restore();
      const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
      gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.7, "#eef5fc"); gr.addColorStop(1, "#b8cce4");
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
      g.strokeStyle = "rgba(120,160,200,.7)"; g.lineWidth = 2.5; g.stroke();
      g.save(); g.beginPath(); g.arc(x, y, r, 0, 6.283); g.clip();
      g.fillStyle = "rgba(170,195,225,.5)";
      for (let k = 0; k < 7; k++) { const a = ang + k * 0.9, d = r * (0.3 + (k % 3) * 0.22); g.beginPath(); g.ellipse(x + Math.cos(a) * d, y + Math.sin(a) * d, r * 0.16, r * 0.09, a, 0, 6.283); g.fill(); }
      g.restore();
      // la cabeza de Guillermo asoma por delante
      const eh = 0.55 + 0.75 * B.u, hm = matAv(x, y + r * 0.1, eh, 0.35 * Math.sin(ang * 0.5), 1, 1, [39, 44]);
      conMat(g, hm, () => { g.save(); g.beginPath(); g.rect(-40, -20, 160, 98); g.clip(); dibujarAvatar(g, { cara: "sorpresa", rc: 0, puntas: 0.6, manoD: [70, 160], manoI: [9, 160] }, t); g.restore(); });
      // brazos que asoman
      g.strokeStyle = CAMISAG; g.lineWidth = 9 * eh; g.lineCap = "round";
      for (const a of [ang * 0.3 + 3.6, ang * 0.3 + 5.8]) { g.beginPath(); g.moveTo(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7); g.lineTo(x + Math.cos(a) * r * 1.12, y + Math.sin(a) * r * 1.12); g.stroke(); }
    }
    // después del choque: Guillermo sentado en un montón de nieve, con los esquís cruzados en la cabeza
    if (t >= T_CHOQUE) {
      const k = eBack(tramo(t, T_CHOQUE + 0.25, T_CHOQUE + 0.6)), X = 800;
      if (k > 0) {
        const pose = { cara: t < 8.4 ? "borracho" : "risa", rc: 0.18 * Math.sin(t * 3), manoD: [80, 120], manoI: [-4, 120], brazoIDelante: true };
        if (t > 8.4) { pose.manoD = [90, 50]; pose.rc = 0.06 * Math.sin(t * 9); }
        const m = matAv(X, suelo(X) + 70, ESC * 1.1, 0, 1, k);
        g.save(); g.beginPath(); g.moveTo(-60, suelo(-60) - 10); g.lineTo(W + 60, suelo(W + 60) - 10); g.lineTo(W + 60, -60); g.lineTo(-60, -60); g.closePath(); g.clip();
        pintarAvatar(g, m, pose, t);
        g.restore();
        conMat(g, m, () => { g.save(); g.translate(39, 4); g.scale(0.62, 0.62); g.translate(-39, -232); esquis(g, 1.7); g.restore(); });
        g.fillStyle = "#ffffff"; g.strokeStyle = "rgba(120,160,200,.8)"; g.lineWidth = 2.5;
        g.beginPath(); g.moveTo(X - 190, suelo(X - 190) + 10); g.quadraticCurveTo(X - 120, suelo(X) - 120, X, suelo(X) - 104); g.quadraticCurveTo(X + 130, suelo(X) - 110, X + 200, suelo(X + 200) + 10); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = "rgba(170,195,225,.45)"; g.beginPath(); g.ellipse(X + 40, suelo(X) - 60, 60, 14, 0, 0, 6.283); g.fill();
        if (t < 8.4 && k > 0.7) { const c = aPant(m, [39, -4]); for (let i = 0; i < 3; i++) { const a = t * 6 + (i / 3) * 6.283; g.fillStyle = "#ffd34d"; estrella(g, c[0] + Math.cos(a) * 50, c[1] - 30 + Math.sin(a) * 12, 9, 3.6, a); g.fill(); } }
      }
    }
    if (eM.alto > 1 || t < T_AM2 + 0.7 || true) { conMat(g, eM.m, () => tabla(g)); pintarAvatar(g, eM.m, eM.pose, t); }
    // copos
    g.fillStyle = "#ffffff"; g.strokeStyle = "rgba(140,175,215,.8)"; g.lineWidth = 1.2;
    for (const c of this.copos) { g.globalAlpha = Math.min(1, c.v * 3); g.beginPath(); g.arc(c.x, c.y, c.s, 0, 6.283); g.fill(); g.stroke(); }
    g.globalAlpha = 1;
    this.p.dibujar(g);
    // textos
    const grito = (s, x, y, t0, t1, tam, col, borde, rot = -0.08) => {
      if (t < t0 || t > t1) return;
      const k = eBack(tramo(t, t0, t0 + 0.15));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 3, alfa: 1 - tramo(t, t1 - 0.2, t1) });
      g.restore();
    };
    grito("¡YUJUUU!", 700, 120, T_RM + 0.2, T_AM + 0.4, 54, "#ffd34d", "#1a2a6a");
    grito("¡PLOF!", 460, 290, T_PLOF, T_PLOF + 0.8, 70, "#ffffff", "#1a3a6a", 0.1);
    grito("¡CATAPUMBA!", 450, 300, T_CHOQUE, T_CHOQUE + 0.9, 60, "#ffd34d", "#4a1a00", -0.06);
    if (t > 5.25) {
      const d = t - 5.25, k = tramo(d, 0, 0.16), s = lerp(2.6, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 9));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(t < T_CHOQUE ? 330 : lerp(330, 512, eInOut(tramo(t, T_CHOQUE + 0.8, T_CHOQUE + 1.3))), 100); g.rotate(-0.06); g.scale(s * 0.85, s * 0.85);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // iris
    const cI = [470, 320], cF = [800, 400];
    const r = t < 1 ? 800 * eInOut(tramo(t, 0.02, 0.7)) : 800 * (1 - eInOut(tramo(t, DUR - 0.7, DUR - 0.04)));
    const cc = t < 1 ? cI : cF;
    if (r < 800) {
      g.save(); g.fillStyle = "#000"; g.beginPath(); g.rect(-60, -60, W + 120, H + 120);
      g.moveTo(cc[0] + Math.max(0, r), cc[1]); g.arc(cc[0], cc[1], Math.max(0, r), 0, 6.2832); g.fill("evenodd"); g.restore();
    }
  }
}
const CAMISAG = "#2b2b2c";

registrar({ id: "00199", nombre: "Esquí", crear: () => new Esqui() });
})();
