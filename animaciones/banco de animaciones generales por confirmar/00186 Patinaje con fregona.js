"use strict";
/*
 * 00186 · PATINAJE CON FREGONA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Al cerrar el bar, con las sillas sobre las mesas, Marcos y Guillermo friegan el suelo. Guillermo pisa lo mojado y
 * resbala (¡RESBALA!), choca con Marcos y resbalan los dos… pero se cogen de la mano y lo convierten en patinaje
 * artístico: deslizamiento con la pierna arriba, pirueta de Marcos, Guillermo lo levanta en volandas y pose final con
 * las fregonas. Siguen deslizándose con la pose… fuera de la pantalla: ¡PATAPLÁN!
 */
(() => {
const ESC = 1.4, FL = 525;                                 // escala y línea del suelo (el suelo brilla y refleja)
const XM0 = 300, XG0 = 700, XCART = 930;
const T_RESB = 2.25, T_CHOCA = 2.95, T_BAILE = 3.5, T_GIRO = 5.0, T_ALZA = 6.0, T_BAJA = 7.25, T_POSE = 7.8, T_SALEN = 9.0, T_CRASH = 9.85, T_APAGA = 10.25, DUR = 10.8;
const CT = cacheTexto();
const aU = (m, q) => { const i = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [i.x, i.y]; };

/** Fregona: (hx, hy) la mopa, (tx, ty) la punta del palo. */
function fregona(g, hx, hy, tx, ty, t) {
  g.save(); g.lineCap = "round";
  g.strokeStyle = "#2a5fc0"; g.lineWidth = 7; g.beginPath(); g.moveTo(hx, hy); g.lineTo(tx, ty); g.stroke();
  g.strokeStyle = "rgba(255,255,255,.45)"; g.lineWidth = 2; g.beginPath(); g.moveTo(lerp(hx, tx, 0.1), lerp(hy, ty, 0.1)); g.lineTo(tx, ty); g.stroke();
  const ang = Math.atan2(hy - ty, hx - tx);
  g.translate(hx, hy); g.rotate(ang - Math.PI / 2);
  g.fillStyle = "#2f8a4a"; rectR(g, -8, -10, 16, 12, 3); g.fill();
  for (let i = 0; i < 11; i++) {
    const a = -0.9 + (i / 10) * 1.8, L = 36 + (i % 3) * 5, w = Math.sin(t * 9 + i) * 4;
    g.strokeStyle = i % 2 ? "#e8e4da" : "#c9c3b4"; g.lineWidth = 5;
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(Math.sin(a) * L * 0.5 + w, L * 0.5, Math.sin(a) * L + w, Math.cos(a) * L); g.stroke();
  }
  g.restore();
}

class Patinaje extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(320);
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** Posiciones, matrices y poses de los dos, y sus fregonas. */
  escena() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "marcos", cara: "guino", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let xm = XM0, xg = XG0, dyM = 0, dyG = 0, giroM = 0, giroG = 0, sxM = 1;
    let mM = null, mG = null;
    const fr = { M: null, G: null };       // fregona: { h:[x,y], t:[x,y] } en pantalla, o { mano: "D"/"I", dx, dy } (sale de la mano)
    // ---------------- fregando
    const fregar = (A, X, s, fase) => {
      const sw = Math.sin(t * 4.6 + fase);
      const h = [X + 70 * s + 40 * sw, FL - 4], top = [X + 70 * s - 60 * s + 10 * sw, FL - 182];
      return { h, t: top };
    };
    if (t < T_RESB + 0.05) {
      fr.M = fregar(M, xm, 1, 0); fr.G = fregar(G, xg, -1, 1.2);
      M.cara = Math.sin(t * 1.7) > 0 ? "guino" : "sonrisa"; G.cara = "sonrisa";
      M.rc = 0.05 * Math.sin(t * 4.6); G.rc = 0.05 * Math.sin(t * 4.6 + 1.2);
      dyM = -Math.abs(Math.sin(t * 4.6)) * 3; dyG = -Math.abs(Math.sin(t * 4.6 + 1.2)) * 3;
    }
    // ---------------- Guillermo resbala hacia Marcos
    if (t >= T_RESB && t < T_BAILE) {
      const u = tramo(t, T_RESB, T_CHOCA);
      xg = lerp(XG0, 430, eOut(u));
      dyG = -Math.abs(Math.sin(u * Math.PI * 2)) * 46;
      giroG = 0.35 * Math.sin(t * 11);
      G.cara = "sorpresa"; G.puntas = 0.8;
      G.piernaI = [-18, 0.7]; G.piernaD = [-18, -0.7];
      const s = Math.sin(t * 16); G.manoD = [96, 40 + 14 * s]; G.manoI = [-18, 40 - 14 * s];
      fr.G = { mano: "D", dx: 50, dy: -120, gira: t * 9 };
      if (t < T_CHOCA) fr.M = fregar(M, xm, 1, 0);
      M.cara = t > T_RESB + 0.35 ? "sorpresa" : M.cara;
      if (t >= T_CHOCA) {
        // ¡choque!: resbalan los dos hacia la izquierda
        const v = tramo(t, T_CHOCA, T_BAILE);
        xg = lerp(430, 320, eOut(v)); xm = lerp(XM0, 215, eOut(v));
        giroM = -0.3 * Math.sin(t * 12) * (1 - v); dyM = -Math.abs(Math.sin(v * Math.PI * 2)) * 30;
        M.cara = "sorpresa"; M.puntas = 0.8; M.piernaI = [-16, 0.6]; M.piernaD = [-16, -0.6];
        const s2 = Math.sin(t * 15); M.manoD = [92, 40 - 12 * s2]; M.manoI = [-18, 40 + 12 * s2];
        fr.M = { mano: "I", dx: -50, dy: -120, gira: -t * 8 };
        giroG *= 1 - v;
      }
    }
    // ---------------- patinaje: de la mano, deslizan a la derecha con la pierna arriba
    if (t >= T_BAILE && t < T_GIRO) {
      const u = eInOut(tramo(t, T_BAILE, T_GIRO));
      xm = lerp(160, 460, u); xg = lerp(370, 670, u);
      const ar = eOut(tramo(t, T_BAILE + 0.2, T_BAILE + 0.6));
      M.piernaI = [-24 * ar, 0.9 * ar]; G.piernaD = [-24 * ar, -0.9 * ar];
      giroM = 0.12 * ar; giroG = -0.12 * ar; dyM = -6 * ar; dyG = -6 * ar;
      M.cara = t > 4.2 ? "dormido" : "risa"; G.cara = t > 4.4 ? "guino" : "risa";
      M.rc = 0.1; G.rc = -0.1;
    }
    // ---------------- pirueta de Marcos bajo el brazo de Guillermo
    if (t >= T_GIRO && t < T_ALZA) {
      xg = 650; xm = lerp(500, 510, tramo(t, T_GIRO, T_GIRO + 0.3));
      const ph = tramo(t, T_GIRO + 0.1, T_ALZA - 0.15) * Math.PI * 2 * 3;
      const c = Math.cos(ph); sxM = Math.sign(c || 1) * Math.max(0.12, Math.abs(c));
      M.cara = "risa"; G.cara = "risa"; G.rc = -0.12;
      M.puntas = 0.5 * Math.abs(Math.sin(ph));
    }
    // ---------------- Guillermo lo levanta en volandas
    let alza = 0;
    if (t >= T_ALZA && t < T_POSE) {
      alza = eOut(tramo(t, T_ALZA, T_ALZA + 0.35)) * (1 - eInOut(tramo(t, T_BAJA - 0.1, T_BAJA + 0.3)));
      xg = lerp(640, 450, eInOut(tramo(t, T_ALZA, T_BAJA + 0.3)));
      G.manoD = mezcla([70, 158], [68, 28], alza); G.manoI = mezcla([9, 160], [28, 26], alza); G.brazoIDelante = false;
      G.cara = alza > 0.5 ? "dormido" : "risa"; G.rc = 0;
      dyG = -4 * Math.sin(t * 6) * alza;
      M.cara = "risa"; M.manoD = mezcla([96, 80], [80, 30], alza); M.manoI = mezcla([-22, 80], [-6, 20], alza); M.piernaD = [-20 * alza, -0.5 * alza];
      M.rc = 0.15 * alza;
      xm = lerp(510, xg, alza);
      if (t > T_BAJA) xm = lerp(xg, 300, eInOut(tramo(t, T_BAJA, T_POSE)));
    }
    // ---------------- pose final (y siguen deslizándose…)
    if (t >= T_POSE) {
      const k = eBack(tramo(t, T_POSE, T_POSE + 0.3));
      const des = 150 * tramo(t, T_POSE, T_SALEN) + 900 * eIn(tramo(t, T_SALEN, T_CRASH));
      xm = 300 + des; xg = 450 + des;
      giroM = -0.32 * k; M.piernaD = [-26 * k, -0.9 * k]; dyM = 0;
      G.manoD = mezcla([70, 158], [86, 16], k);
      G.cara = t > T_SALEN + 0.3 ? "sorpresa" : t > 8.5 ? "guino" : "risa"; M.cara = t > T_SALEN + 0.35 ? "sorpresa" : "risa";
      G.rc = -0.1; M.rc = 0.12;
    }
    // ---------------- matrices
    if (alza > 0) {
      const hands = [xg + 26, FL + dyG - (232 - 30) * ESC - 22];
      mM = matAv(lerp(xm, hands[0], alza), lerp(FL - 116 * ESC, hands[1], alza), ESC, -Math.PI / 2 * alza, 1, 1, [37, 116]);
    } else mM = matAv(xm, FL + dyM, ESC, giroM, sxM, 1);
    mG = matAv(xg, FL + dyG, ESC, giroG);
    // ---------------- de la mano (Guillermo con la izquierda, Marcos con la derecha)
    const deLaMano = (t >= T_BAILE - 0.1 && t < T_ALZA) || t >= T_BAJA + 0.25;
    if (deLaMano) {
      let P = mezcla(aPant(mM, [67, 120]), aPant(mG, [9, 120]), 0.5);
      if (t >= T_GIRO && t < T_ALZA) P = [(xm + xg) / 2 + 6, FL - 260];        // la mano arriba en la pirueta
      if (t >= T_POSE) P = mezcla(aPant(mM, [80, 96]), aPant(mG, [-6, 110]), 0.5);
      M.manoD = aU(mM, P); G.manoI = aU(mG, [P[0] + 4, P[1] + 2]); G.brazoIDelante = true;
      // la otra mano, con la fregona en alto
      if (!(t >= T_ALZA && t < T_BAJA + 0.25)) {
        M.manoI = t >= T_GIRO && t < T_ALZA ? [-14, 90] : [-24, 70]; G.manoD = t >= T_POSE ? G.manoD : [98, 70];
        fr.M = { mano: "I", dx: -60, dy: -95 }; fr.G = t >= T_POSE ? { mano: "D", dx: 90, dy: -60 } : { mano: "D", dx: 40, dy: -110 };
      }
    }
    if (t >= T_ALZA && t < T_BAJA + 0.25) { fr.M = { mano: "D", dx: -95, dy: -15 }; fr.G = null; }
    // con fregona: manos en el palo
    for (const [A, m, f] of [[M, mM, fr.M], [G, mG, fr.G]]) {
      if (f && f.h) { A.manoD = aU(m, mezcla(f.h, f.t, 0.6)); A.manoI = aU(m, mezcla(f.h, f.t, 0.86)); A.brazoIDelante = true; }
    }
    return { G, M, mG, mM, fr };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // agua al fregar
    if (t < T_RESB && Math.random() < 8 * dt) for (const X of [XM0 + 70, XG0 - 70]) p.nueva(P.ESPUMA, X + azar(-40, 40), FL - 4, azar(-40, 40), azar(-80, -30), azar(0.3, 0.5), azar(2, 4));
    this.una("resb", t > T_RESB, () => { temblar(8, 0.2); for (let k = 0; k < 10; k++) p.nueva(P.ESPUMA, XG0, FL - 4, azar(-150, 150), azar(-200, -60), azar(0.4, 0.6), azar(3, 6)); });
    this.una("choca", t > T_CHOCA, () => {
      temblar(12, 0.3);
      p.nueva(P.DESTELLO, 365, 360, 0, 0, 0.3, 120);
      for (let k = 0; k < 14; k++) { const a = azar(0, 6.283), v = azar(120, 300); p.nueva(P.CHISPA, 365, 360, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.5), azar(5, 8)); }
    });
    this.una("alza", t > T_ALZA + 0.3, () => { temblar(6, 0.15); for (let k = 0; k < 12; k++) p.nueva(P.PURPURINA, azar(380, 700), azar(140, 260), azar(-30, 30), azar(0, 30), azar(1, 1.6), azar(10, 16)); });
    this.una("pose", t > T_POSE, () => {
      temblar(12, 0.35);
      for (let k = 0; k < 24; k++) { const a = azar(0, 6.283), v = azar(150, 380); p.nueva(P.DESTELLO, 400 + Math.cos(a) * 80, 330 + Math.sin(a) * 120, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(12, 20)); }
      for (let k = 0; k < 70; k++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-80, -10), azar(-40, 40), azar(0, 120), azar(2.2, 3.2), azar(9, 14), k % 5);
    });
    this.una("crash", t > T_CRASH, () => {
      temblar(26, 0.6);
      for (let k = 0; k < 20; k++) p.nueva(P.POLVO, W + 10, azar(250, 520), azar(-300, -80), azar(-80, 40), azar(0.5, 0.9), azar(30, 60));
      for (let k = 0; k < 16; k++) { const a = azar(Math.PI * 0.6, Math.PI * 1.4), v = azar(200, 500); p.nueva(P.CHISPA, W, azar(300, 500), Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(6, 10)); }
    });
    // estela de agua al patinar
    if (t > T_RESB && t < T_CRASH && Math.random() < 20 * dt) { const e = this.escena(); for (const m of [e.mG, e.mM]) { const q = aPant(m, [39, 230]); if (q[1] > FL - 30) p.nueva(P.ESPUMA, q[0] + azar(-20, 20), FL - 2, azar(-60, 60), azar(-60, -20), azar(0.2, 0.4), azar(2, 3.5)); } }
    p.suelo = () => FL;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  fondoFijo() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, FL);
    gr.addColorStop(0, "#0e0a10"); gr.addColorStop(1, "#2a1c22");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // barra al fondo y mesas con las sillas encima
    g.fillStyle = "#3a2010"; g.fillRect(0, 330, W, 120); g.fillStyle = "#5a3218"; g.fillRect(0, 322, W, 12);
    for (const x of [140, 512, 880]) {
      g.fillStyle = "#24140c";
      g.fillRect(x - 70, 300, 140, 10); g.fillRect(x - 6, 310, 12, 140);
      // silla bocabajo
      g.fillRect(x - 46, 250, 8, 50); g.fillRect(x + 38, 250, 8, 50); g.fillRect(x - 46, 246, 92, 8); g.fillRect(x - 40, 200, 8, 48); g.fillRect(x + 32, 200, 8, 48);
    }
    // lámpara de cierre
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35; g.drawImage(BLOB2.oro, 512 - 420, 60, 840, 440); g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    // suelo mojado y brillante
    const gs = g.createLinearGradient(0, FL, 0, H);
    gs.addColorStop(0, "#3a3440"); gs.addColorStop(1, "#16121a");
    g.fillStyle = gs; g.fillRect(0, FL, W, H - FL);
    g.strokeStyle = "rgba(255,255,255,.08)"; g.lineWidth = 2;
    for (let i = -10; i <= 10; i++) { g.beginPath(); g.moveTo(512 + i * 60, FL); g.lineTo(512 + i * 140, H); g.stroke(); }
    g.beginPath(); g.moveTo(0, 552); g.lineTo(W, 552); g.stroke();
    return (this.cF = c);
  }
  /** Cartel genérico de suelo mojado: amarillo con una exclamación. */
  cartel(g, t) {
    const caida = tramo(t, T_CRASH - 0.35, T_CRASH - 0.1);
    g.save(); g.translate(XCART, FL); g.rotate(caida * 1.45);
    g.fillStyle = "#f2c230"; g.beginPath(); g.moveTo(-30, 0); g.lineTo(-16, -110); g.lineTo(16, -110); g.lineTo(30, 0); g.closePath(); g.fill();
    g.strokeStyle = "#a07a00"; g.lineWidth = 3; g.stroke();
    g.fillStyle = "#1a1a1a"; g.beginPath(); g.moveTo(0, -92); g.lineTo(16, -60); g.lineTo(-16, -60); g.closePath(); g.fill();
    g.fillStyle = "#f2c230"; g.fillRect(-2, -84, 4, 14); g.fillRect(-2, -67, 4, 4);
    g.restore();
  }
  pintarTodo(g, e, t) {
    pintarAvatar(g, e.mM, e.M, t);
    pintarAvatar(g, e.mG, e.G, t);
    for (const [A, m, f] of [[e.M, e.mM, e.fr.M], [e.G, e.mG, e.fr.G]]) {
      if (!f) continue;
      if (f.h) { fregona(g, f.h[0], f.h[1], f.t[0], f.t[1], t); continue; }
      const mano = f.mano === "D" ? A._manoD : A._manoI;
      if (!mano) continue;
      const q = aPant(m, mano);
      let d = [f.dx, f.dy];
      if (f.gira) d = rot2(d, Math.sin(f.gira) * 0.8);
      fregona(g, q[0] + d[0], q[1] + d[1], q[0] - d[0] * 0.35, q[1] - d[1] * 0.35, t);
    }
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.escena();
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    g.drawImage(this.fondoFijo(), 0, 0);
    // reflejo en el suelo mojado
    g.save(); g.beginPath(); g.rect(-60, FL, W + 120, H - FL + 60); g.clip();
    g.globalAlpha = a * 0.22; g.transform(1, 0, 0, -1, 0, 2 * FL);
    this.pintarTodo(g, e, t);
    g.restore();
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = a * 0.25; g.drawImage(BLOB.blanco, 100, FL - 10, 820, 40); g.restore();
    foco(g, 512, 512, FL, 480, 0.45);
    this.cartel(g, t);
    this.pintarTodo(g, e, t);
    g.restore();
    this.p.dibujar(g);
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: a * (1 - tramo(d, dur - 0.15, dur)) });
      g.restore();
    };
    ono("FIU, FIU…", 180, 230, 0.6, 1.3, 36, "#fffdf5", "#1b1b1b", -0.06);
    ono("¡OUCH!", 365, 230, T_CHOCA, 0.5, 52, "#fffdf5", "#1b1b1b", -0.1);
    ono("¡OLÉ!", 820, 300, T_ALZA + 0.4, 0.8, 54, "#ffd34d", "#3a2400", 0.1);
    ono("¡PATAPLÁN!", 820, 330, T_CRASH, 0.9, 70, "#ffe0b0", "#4a0d00", -0.1);
    // ¡RESBALA!
    if (t > T_RESB + 0.1) {
      const d = t - T_RESB - 0.1, k = tramo(d, 0, 0.16), s = lerp(1.8, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a; g.translate(512 + Math.sin(d * 2.4) * 10, 70); g.rotate(-0.05 + 0.04 * Math.sin(d * 2.4)); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has(1)) return CT.get(1);
    const c = lienzoNuevo(820, 190), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 150);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#c8f7ff"); gr.addColorStop(1, "#2fb8e8");
    txt(g, "¡RESBALA!", 410, 150, { tam: 136, peso: 900, fam: FD, color: gr, borde: "#03222e", bordeAncho: 13, esp: 6, glow: "rgba(150,235,255,.9)", glowTam: 26, max: 780 });
    CT.set(1, c);
    return c;
  }
}

registrar({ id: "00186", nombre: "Patinaje con fregona", crear: () => new Patinaje() });
})();
