"use strict";
/*
 * 00009 · ABRIDOR KÁRATE
 *
 * Animación del banco. Empieza y acaba en negro.
 * Hay un botellín con chapa en la barra. Intenta abrirlo con los dedos (¡ÑÑÑ…!), se hace daño (¡AY!) y se pone serio:
 * postura de kárate, mano en alto… ¡HIYA! De un golpe de canto la chapa sale volando, rebota por el techo, la pared
 * y el suelo y se clava en el centro de una diana. Se sopla la mano humeante y brinda con el botellín.
 */
(() => {
const X = 380, ESC = 1.6;
const BARRA = 440, BX0 = 480, BX1 = 1010;
const BOT = { x: 532, base: BARRA - 2 };   // botellín en la barra
const CHAPA0 = [BOT.x, BARRA - 108];        // chapa puesta
const DIANA = [842, 178], RD = 74;
const T_GOLPE = 4.25;
// rebotes de la chapa: puntos y tiempos
const CAMINO = [[CHAPA0[0], CHAPA0[1]], [318, 10], [10, 250], [540, 588], [1014, 330], [DIANA[0], DIANA[1]]];

function botellin(g, x, y, abierto, esc = 1) {
  g.save(); g.translate(x, y); g.scale(esc, esc);
  const gr = g.createLinearGradient(-18, 0, 18, 0);
  gr.addColorStop(0, "#1e0e03"); gr.addColorStop(0.3, "#7a3e0e"); gr.addColorStop(0.55, "#c0752a"); gr.addColorStop(0.8, "#5a2c08"); gr.addColorStop(1, "#1e0e03");
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(-17, 0); g.lineTo(-17, -58); g.quadraticCurveTo(-17, -74, -7, -82); g.lineTo(-7, -104); g.lineTo(7, -104); g.lineTo(7, -82); g.quadraticCurveTo(17, -74, 17, -58); g.lineTo(17, 0); g.quadraticCurveTo(0, 4, -17, 0); g.fill();
  // etiqueta
  g.fillStyle = "#fffdf5"; rectR(g, -17, -48, 34, 30, 3); g.fill();
  g.fillStyle = "#2bff5b"; g.fillRect(-17, -44, 34, 5);
  g.fillStyle = "#d81c2e"; estrella(g, 0, -27, 7, 3, 0); g.fill();
  g.fillStyle = "#ffd34d"; g.fillRect(-7, -96, 14, 8);
  g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(-12, -56, 3, 50); g.fillRect(-5, -100, 2, 18);
  if (!abierto) { g.save(); g.translate(0, -106); g.scale(0.8, 0.8); chapa(g, 0, 0, 0, 1); g.restore(); }
  g.restore();
}
/** Chapa de corona: (x, y) centro; k = cuánto se ve de frente (0–1). */
function chapa(g, x, y, r, k) {
  g.save(); g.translate(x, y); g.rotate(r); g.scale(1.3, 1.3 * Math.max(0.15, k));
  g.fillStyle = "#c7ccd2"; g.beginPath();
  for (let i = 0; i < 21; i++) { const a = (i / 21) * 6.283, rr = i % 2 ? 9.5 : 11.5; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  g.closePath(); g.fill();
  const gr = g.createRadialGradient(-3, -3, 1, 0, 0, 9);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(1, "#8d949b");
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 8.5, 0, 6.283); g.fill();
  g.fillStyle = "#d81c2e"; g.beginPath(); g.arc(0, 0, 5, 0, 6.283); g.fill();
  g.restore();
}

class EscenaKarate extends Escena {
  constructor() {
    super(9.9);
    this.p = new Parts(320);
    // tiempos de cada tramo del vuelo (velocidad constante)
    this.tiempos = [T_GOLPE + 0.03];
    for (let i = 1; i < CAMINO.length; i++) {
      const d = Math.hypot(CAMINO[i][0] - CAMINO[i - 1][0], CAMINO[i][1] - CAMINO[i - 1][1]);
      this.tiempos.push(this.tiempos[i - 1] + d / 1700);
    }
    this.T_DIANA = this.tiempos[this.tiempos.length - 1];
  }
  luz() { const t = this.t; return (t < 0.6 ? [0, 1, 0, 0, 1, 0.5][Math.min(5, Math.floor(t / 0.1))] : 1) * (1 - tramo(t, 9.05, 9.8)); }
  aAvatar(x, y) { return [39 + (x - X) / ESC, 232 - (PIES - y) / ESC]; }
  chapaVuelo(t) {
    const T = this.tiempos;
    if (t < T[0]) return null;
    for (let i = 1; i < T.length; i++) if (t < T[i]) {
      const u = (t - T[i - 1]) / (T[i] - T[i - 1]);
      return { x: lerp(CAMINO[i - 1][0], CAMINO[i][0], u), y: lerp(CAMINO[i - 1][1], CAMINO[i][1], u), r: t * 30, k: Math.abs(Math.cos(t * 22)) };
    }
    return { x: DIANA[0], y: DIANA[1], r: 0.3, k: 0.55, clavada: true };
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], sy = 1, sx = 1;
    const tapa = this.aAvatar(CHAPA0[0], CHAPA0[1] + 8);
    // intenta abrirlo con los dedos
    if (t > 0.5 && t < 1.95) {
      manoD = mezcla(manoD, tapa, eInOut(tramo(t, 0.5, 0.95)));
      if (t > 1.0) { manoD = [tapa[0] + azar(-1, 1), tapa[1] + azar(-1, 1) - 2 * Math.abs(Math.sin(t * 20))]; pose.cara = "dormido"; pose.rc = 0.04 * Math.sin(t * 30); sy = 1 - 0.015 * Math.abs(Math.sin(t * 20)); }
    }
    // se le escapa la mano: ¡ay!
    if (t >= 1.95 && t < 2.95) {
      const k = eOut(tramo(t, 1.95, 2.1));
      manoD = mezcla(tapa, [72, 82], k);
      if (t > 2.1) manoD = [72 + 6 * Math.sin(t * 38), 82 + 4 * Math.cos(t * 31)];
      pose.cara = t < 2.15 ? "sorpresa" : "borracho";
      pose.rc = -0.05;
    }
    // se pone serio: postura de kárate
    const kPost = eInOut(tramo(t, 2.95, 3.4));
    if (t >= 2.95) {
      pose.cara = "guino";
      pose.piernaI = [0, 0.13 * kPost]; pose.piernaD = [0, -0.13 * kPost]; sy = 1 - 0.05 * kPost; sx = 1 + 0.02 * kPost;
      pose.rc = t < 3.5 ? 0.12 * Math.sin((t - 2.95) * 14) * (1 - kPost * 0.5) : 0;
      manoI = mezcla([9, 160], [24, 118], kPost); pose.brazoIDelante = kPost > 0.5;
      manoD = mezcla([72, 82], [100, -4], eInOut(tramo(t, 3.35, 4.0)));
    }
    // ¡HIYA!
    if (t >= T_GOLPE - 0.06) {
      manoD = mezcla([100, -4], [tapa[0] + 10, tapa[1] + 22], eIn(tramo(t, T_GOLPE - 0.06, T_GOLPE)));
      pose.cara = "risa";
    }
    // sigue la chapa con la mirada
    if (t > T_GOLPE + 0.1 && t < this.T_DIANA + 0.3) {
      const C = this.chapaVuelo(t), cab = aPant(matAv(X, PIES, ESC), [39, 40]);
      pose.cara = "sorpresa"; pose.rc = clamp((C ? (C.x - cab[0]) : 0) / 1500, -0.15, 0.15);
      manoD = mezcla([tapa[0] + 10, tapa[1] + 22], [86, 130], eInOut(tramo(t, T_GOLPE + 0.25, T_GOLPE + 0.6)));
    }
    // se sopla la mano humeante
    const kSopla = eInOut(tramo(t, 6.7, 7.0)) * (1 - eInOut(tramo(t, 7.85, 8.1)));
    if (t > this.T_DIANA + 0.3) {
      pose.cara = t < 7.0 ? "guino" : t < 7.9 ? "sorpresa" : "risa";
      manoD = mezcla([86, 130], [54, 62], kSopla);
      pose.rc = 0;
    }
    // coge el botellín y brinda
    const bot = this.aAvatar(BOT.x, BOT.base - 52);
    if (t > 7.85) {
      manoD = mezcla([54, 62], bot, eInOut(tramo(t, 7.85, 8.15)));
      if (t > 8.2) manoD = mezcla(bot, [96, 62], eOut(tramo(t, 8.2, 8.55)));
      pose.cara = t < 8.3 ? "sonrisa" : "risa";
    }
    pose.manoD = manoD; pose.manoI = manoI;
    if (t > 8.2) pose.objD2 = (g, m) => botellin(g, m[0], m[1] + 52 / ESC, true, 1 / ESC);
    const m = matAv(X, PIES, ESC, 0, sx, sy);
    return { pose, m };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    this.una("golpe", t > T_GOLPE, () => {
      temblar(26, 0.5);
      p.nueva(P.DESTELLO, CHAPA0[0], CHAPA0[1], 0, 0, 0.45, 180);
      for (let i = 0; i < 22; i++) { const a = azar(0, 6.283), v = azar(200, 600); p.nueva(P.CHISPA, CHAPA0[0], CHAPA0[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(8, 14)); }
    });
    // espuma que sale del botellín abierto
    if (t > T_GOLPE + 0.05 && t < T_GOLPE + 1.4 && Math.random() < 30 * dt * (1 - tramo(t, T_GOLPE, T_GOLPE + 1.4))) p.nueva(P.ESPUMA, BOT.x + azar(-3, 3), BOT.base - 106, azar(-60, 60), azar(-300, -120), azar(0.4, 0.8), azar(4, 8));
    // rebotes
    for (let i = 1; i < this.tiempos.length - 1; i++) this.una("rebote" + i, t > this.tiempos[i], () => {
      const [x, y] = CAMINO[i];
      temblar(6, 0.12);
      p.nueva(P.DESTELLO, x, y, 0, 0, 0.25, 70);
      for (let k = 0; k < 10; k++) { const a = azar(0, 6.283), v = azar(150, 400); p.nueva(P.CHISPA, x, y, Math.cos(a) * v, Math.sin(a) * v, azar(0.2, 0.5), azar(6, 10)); }
    });
    this.una("diana", t > this.T_DIANA, () => {
      temblar(16, 0.35); this.tDiana = t;
      p.nueva(P.DESTELLO, DIANA[0], DIANA[1], 0, 0, 0.4, 150);
      for (let k = 0; k < 16; k++) { const a = azar(0, 6.283), v = azar(150, 450); p.nueva(P.CHISPA, DIANA[0], DIANA[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(7, 12)); }
    });
    // humo de la mano
    if (t > T_GOLPE && t < 7.9 && Math.random() < 16 * dt) {
      const q = aPant(e.m, [e.pose.manoD[0], e.pose.manoD[1] - 6]), sopla = t > 7.0;
      p.nueva(P.VAPOR, q[0] + azar(-4, 4) + (sopla ? 8 : 0), q[1], sopla ? azar(40, 120) : azar(-15, 15), azar(-90, -50), azar(0.6, 1.0), azar(10, 18));
    }
    this.una("brinda", t > 8.55, () => { const q = aPant(e.m, [96, 20]); p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.35, 90); temblar(5, 0.15); });
    p.actualizar(dt);
  }
  dibujarDiana(g, t) {
    const ang = this.tDiana ? 0.12 * Math.sin((t - this.tDiana) * 22) * Math.exp(-(t - this.tDiana) * 3.5) : 0;
    g.save(); g.translate(DIANA[0], DIANA[1] - RD - 10); g.rotate(ang); g.translate(0, RD + 10);
    // cordel y clavo
    g.strokeStyle = "rgba(220,200,160,.6)"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(-30, -RD + 10); g.lineTo(0, -RD - 10); g.lineTo(30, -RD + 10); g.stroke();
    g.fillStyle = "#9aa3ad"; g.beginPath(); g.arc(0, -RD - 10, 3, 0, 6.283); g.fill();
    g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = 14;
    g.fillStyle = "#121212"; g.beginPath(); g.arc(0, 0, RD, 0, 6.283); g.fill();
    g.shadowBlur = 0; g.shadowColor = "transparent";
    for (let i = 0; i < 20; i++) {
      const a0 = (i / 20) * 6.283 - Math.PI / 20, a1 = a0 + 6.283 / 20;
      for (const [r0, r1, cA, cB] of [[RD * 0.84, RD * 0.92, "#d81c2e", "#1f9a3a"], [RD * 0.52, RD * 0.84, "#f1e4c4", "#1b1b1b"], [RD * 0.44, RD * 0.52, "#d81c2e", "#1f9a3a"], [RD * 0.14, RD * 0.44, "#f1e4c4", "#1b1b1b"]]) {
        g.fillStyle = i % 2 ? cA : cB; g.beginPath(); g.arc(0, 0, r1, a0, a1); g.arc(0, 0, r0, a1, a0, true); g.closePath(); g.fill();
      }
    }
    g.fillStyle = "#1f9a3a"; g.beginPath(); g.arc(0, 0, RD * 0.14, 0, 6.283); g.fill();
    g.fillStyle = "#d81c2e"; g.beginPath(); g.arc(0, 0, RD * 0.065, 0, 6.283); g.fill();
    g.strokeStyle = "rgba(220,220,220,.55)"; g.lineWidth = 1;
    for (const r of [RD * 0.14, RD * 0.44, RD * 0.52, RD * 0.84, RD * 0.92]) { g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.stroke(); }
    // la chapa clavada en el centro
    const C = this.chapaVuelo(t);
    if (C && C.clavada) {
      g.strokeStyle = "rgba(255,255,255,.6)"; g.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3; g.beginPath(); g.moveTo(Math.cos(a) * 12, Math.sin(a) * 12); g.lineTo(Math.cos(a) * 22, Math.sin(a) * 22); g.stroke(); }
      chapa(g, 0, 0, 0.3, 0.85);
    }
    g.restore();
  }
  dibujarBarra(g) {
    const gr = g.createLinearGradient(0, BARRA, 0, PIES);
    gr.addColorStop(0, "#4a3020"); gr.addColorStop(1, "#22150c");
    g.fillStyle = gr; g.fillRect(BX0, BARRA + 8, BX1 - BX0, PIES - BARRA - 8);
    g.strokeStyle = "rgba(0,0,0,.45)"; g.lineWidth = 2;
    for (let x = BX0 + 66; x < BX1; x += 66) { g.beginPath(); g.moveTo(x, BARRA + 12); g.lineTo(x, PIES - 14); g.stroke(); }
    g.fillStyle = "#151009"; g.fillRect(BX0, PIES - 14, BX1 - BX0, 14);
    const gt = g.createLinearGradient(0, BARRA - 6, 0, BARRA + 10);
    gt.addColorStop(0, "#d9c3a0"); gt.addColorStop(1, "#8a6a48");
    g.fillStyle = gt; g.fillRect(BX0 - 12, BARRA - 4, BX1 - BX0 + 24, 14);
  }
  camara() {
    const t = this.t, k = eOut(tramo(t, this.T_DIANA, this.T_DIANA + 0.22)) * (1 - eInOut(tramo(t, 6.35, 6.75)));
    return { Z: lerp(1, 2.1, k), cx: lerp(W / 2, DIANA[0] - 40, k), cy: lerp(H / 2, DIANA[1] + 30, k) };
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), luz = this.luz(), cam = this.camara();
    fondo(g, "#000");
    g.save(); g.translate(W / 2, H / 2); g.scale(cam.Z, cam.Z); g.translate(-cam.cx, -cam.cy);
    g.save(); g.globalAlpha = luz;
    foco(g, 640, 640, BARRA, 320, 1);
    this.dibujarDiana(g, t);
    this.dibujarBarra(g);
    if (t < 8.2) botellin(g, BOT.x, BOT.base, t > T_GOLPE);
    g.restore();
    pintarAvatar(g, e.m, e.pose, t);
    // la chapa volando, con estela
    const C = this.chapaVuelo(t);
    if (C && !C.clavada) {
      for (let k = 1; k <= 4; k++) { const Cs = this.chapaVuelo(t - k * 0.018); if (Cs && !Cs.clavada) { g.save(); g.globalAlpha = 0.5 - k * 0.1; chapa(g, Cs.x, Cs.y, Cs.r, Cs.k); g.restore(); } }
      chapa(g, C.x, C.y, C.r, C.k);
    }
    // mano en alto que brilla
    if (t > 3.9 && t < T_GOLPE) { const q = aPant(e.m, e.pose.manoD); brillo(g, q[0] + 4, q[1] - 6, 40, Math.sin(tramo(t, 3.9, T_GOLPE) * Math.PI)); }
    // estela del golpe
    if (t > T_GOLPE - 0.06 && t < T_GOLPE + 0.25) {
      const a = 1 - tramo(t, T_GOLPE, T_GOLPE + 0.25), q0 = aPant(e.m, [100, -4]), q1 = aPant(e.m, e.pose.manoD);
      g.save(); g.globalCompositeOperation = "lighter"; g.lineCap = "round";
      for (const [w, col] of [[24, `rgba(255,200,90,${0.35 * a})`], [8, `rgba(255,255,255,${0.9 * a})`]]) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(q0[0], q0[1]); g.quadraticCurveTo(q1[0] + 40, q0[1] + 30, q1[0], q1[1]); g.stroke(); }
      g.restore();
    }
    this.p.dibujar(g);
    g.restore();
    // ¡TUNK!
    if (this.tDiana && t - this.tDiana < 0.9) {
      const s = t - this.tDiana, k = tramo(s, 0, 0.1);
      g.save(); g.translate(330, 170); g.rotate(-0.12); g.scale(eBack(k), eBack(k));
      txt(g, "¡TUNK!", 0, 0, { tam: 92, peso: 400, fam: FC, color: "#ffffff", borde: "#1f6b2e", bordeAncho: 10, alfa: 1 - tramo(s, 0.65, 0.9), esp: 3 });
      g.restore();
    }
    // ¡ÑÑÑ…! y ¡AY!
    if (t > 1.15 && t < 1.95) {
      const k = tramo(t, 1.15, 1.25);
      g.save(); g.translate(250 + azar(-2, 2), 210 + azar(-2, 2)); g.rotate(-0.1); g.scale(eBack(k), eBack(k));
      txt(g, "¡ÑÑÑ…!", 0, 0, { tam: 46, peso: 400, fam: FC, color: "#fffdf5", borde: "#222", bordeAncho: 7, esp: 2 });
      g.restore();
    }
    if (t > 2.0 && t < 2.9) {
      const q = aPant(e.m, [39, -6]);
      bocadillo(g, q[0] - 120, q[1] - 30, "¡AY!", q[0] - 30, q[1] + 20, tramo(t, 2.0, 2.15) * (1 - tramo(t, 2.75, 2.9)), 40);
    }
    // ¡HIYA!
    if (t > T_GOLPE && t < this.T_DIANA) {
      const k = tramo(t, T_GOLPE, T_GOLPE + 0.14), a = 1 - tramo(t, this.T_DIANA - 0.25, this.T_DIANA);
      g.save(); g.translate(400, 112); g.rotate(-0.08); g.scale(lerp(2.3, 1, eIn(k)), lerp(2.3, 1, eIn(k)));
      const gr = g.createLinearGradient(0, -90, 0, 10);
      gr.addColorStop(0, "#ffffff"); gr.addColorStop(1, "#ffe08a");
      txt(g, "¡HIYA!", 0, 0, { tam: 140, peso: 400, fam: FC, color: gr, borde: "#c24400", bordeAncho: 13, alfa: Math.min(1, k * 4) * a, esp: 5 });
      g.restore();
    }
    const negro = Math.max(t < 0.6 ? 0.97 * (1 - luz) : 0, tramo(t, 9.35, 9.85));
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00009", nombre: "Abridor kárate", crear: () => new EscenaKarate() });
})();
