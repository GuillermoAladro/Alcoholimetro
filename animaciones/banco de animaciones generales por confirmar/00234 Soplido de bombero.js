"use strict";
/*
 * 00234 · SOPLIDO DE BOMBERO
 *
 * Animación del banco. Empieza y acaba en negro.
 * En la máquina del bar sopla primero Marcos, de uniforme (FUUUH…): la barra sube pero la tasa se queda en 0,00 g/L y
 * la pantalla celebra ¡CERO! con estrellitas, porque está de servicio. Se cambian de sitio (¡ZAS!) y sopla Guillermo:
 * 1,38 g/L, foto (¡CLIC!) y entra en el TOP 10. Se va la máquina y sale su polaroid en el ranking; Marcos coge de la
 * mesita un vaso de agua y se lo acerca a Guillermo, que brinda con él: ¡CERO PATATERO! Fundido a negro.
 */
(() => {
const ESC = 1.55;
const MX = 512, MW = 236, MTOP = 112;                  // la máquina (centro, ancho y arriba)
const BOQ = [MX - MW / 2, 306];                        // donde sale la boquilla, a la izquierda de la pantalla
const XS = 318, XE = 742;                              // el que sopla y el que espera
const MESA = [664, 440];                               // mesita alta con el vaso de agua (centro de arriba)
const T_SOPLA1 = 0.75, T_CERO = 2.5, T_CAMBIO = 3.7, T_SOPLA2 = 4.5, T_FOTO2 = 6.35, T_RANK = 7.0, T_COGE = 7.3;
const T_DA = 8.0, T_TOMA = 8.3, T_TIT = 8.35, T_BEBE = 8.9, T_APAGA = 10.45, DUR = 11.0;
const VAL = 1.38, PUESTO = "#7";
const XG_R = 300, XM_R = 486;                          // dónde acaban en el ranking
const EV = 1.4;                                        // tamaño del vaso
const CT = cacheTexto();
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

/** Foto de la cámara (como fotoDe) con el avatar que se quiera; se guarda cuando ya han cargado las piezas. */
const FOTOS = new Map();
function foto(quien, cara) {
  const k = quien + cara;
  if (FOTOS.has(k)) return FOTOS.get(k);
  if (!listo("torso") || !listo("cara_" + cara)) return null;
  const S = 300, c = lienzoNuevo(S, S), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, S);
  gr.addColorStop(0, "#2a1435"); gr.addColorStop(1, "#0f0a14");
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
  const r = semilla(37), cols = ["255,170,60", "255,70,140", "120,190,255", "255,220,120"];
  for (let i = 0; i < 9; i++) {
    const x = r() * S, y = r() * S * 0.7, rr = 20 + r() * 45;
    const rg = g.createRadialGradient(x, y, 0, x, y, rr);
    rg.addColorStop(0, `rgba(${cols[i % 4]},.55)`); rg.addColorStop(1, `rgba(${cols[i % 4]},0)`);
    g.fillStyle = rg; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  const esc = S / 104;
  g.save(); g.translate(S / 2 - 39 * esc, 12 * esc); g.scale(esc, esc);
  g.imageSmoothingQuality = "high";
  dibujarAvatar(g, { quien, cara, rc: 0, piernaI: [0, 0], piernaD: [0, 0] }, 0);
  g.restore();
  const v = g.createRadialGradient(S / 2, S * 0.38, S * 0.15, S / 2, S / 2, S * 0.75);
  v.addColorStop(0, "rgba(255,255,255,.08)"); v.addColorStop(1, "rgba(0,0,0,.45)");
  g.fillStyle = v; g.fillRect(0, 0, S, S);
  FOTOS.set(k, c);
  return c;
}
/** Vaso de agua con hielo y limón; (x, y) = donde se coge (unidades de avatar). */
function vasoAgua(g, x, y, ang, nivel, t) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(EV, EV);
  const T = -16, B = 10, wt = 8.6, wb = 6.8;
  const forma = () => {
    g.beginPath(); g.moveTo(-wt, T); g.lineTo(wt, T); g.lineTo(wb, B - 1.6); g.quadraticCurveTo(wb, B, wb - 1.6, B);
    g.lineTo(-wb + 1.6, B); g.quadraticCurveTo(-wb, B, -wb, B - 1.6); g.closePath();
  };
  forma(); g.fillStyle = "rgba(200,235,255,.18)"; g.fill();
  g.save(); forma(); g.clip();
  const alto = (B - T - 2) * clamp(nivel, 0, 1), ys = B - 1 - alto;
  const gr = g.createLinearGradient(0, ys, 0, B);
  gr.addColorStop(0, "rgba(150,220,255,.6)"); gr.addColorStop(1, "rgba(50,140,230,.75)");
  g.fillStyle = gr; g.fillRect(-wt, ys, wt * 2, B - ys + 1);
  g.fillStyle = "rgba(235,250,255,.8)"; g.strokeStyle = "rgba(255,255,255,.95)"; g.lineWidth = 0.6;
  const fl = Math.sin(t * 3) * 0.6;
  rectR(g, -6, ys - 2 + fl, 6, 6, 1.4); g.fill(); g.stroke();
  rectR(g, 0.5, ys + 1.5 - fl, 5.5, 5.5, 1.4); g.fill(); g.stroke();
  g.restore();
  forma(); g.strokeStyle = "rgba(225,245,255,.95)"; g.lineWidth = 1.1; g.stroke();
  g.fillStyle = "rgba(255,255,255,.6)"; g.fillRect(-wt + 2.2, T + 3, 1.3, B - T - 6);
  g.save(); g.translate(wt - 1.5, T + 0.5);
  g.fillStyle = "#e8c400"; g.beginPath(); g.arc(0, 0, 5.2, 0, 6.283); g.fill();
  g.fillStyle = "#fff6a0"; g.beginPath(); g.arc(0, 0, 4.1, 0, 6.283); g.fill();
  g.restore();
  g.restore();
}

class SoplidoBombero extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(380);
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** x de cada uno (q = 0 Marcos, 1 Guillermo): primero sopla Marcos; en el cambio se cruzan; al final, al ranking. */
  x(t, q) {
    const k = eInOut(tramo(t, T_CAMBIO, T_CAMBIO + 0.55));
    let x = q ? lerp(XE, XS + 3, k) : lerp(XS, XE, k);
    const kR = eInOut(tramo(t, T_RANK, T_RANK + 0.75));
    x = lerp(x, q ? XG_R : XM_R, kR);
    return x;
  }
  /** Cuánto ha soplado el que sopla (0–1). */
  soplido(t) {
    if (t < T_CAMBIO) return { q: 0, k: eInOut(tramo(t, T_SOPLA1 + 0.2, T_CERO - 0.3)) };
    return { q: 1, k: eInOut(tramo(t, T_SOPLA2 + 0.2, T_FOTO2 - 0.35)) };
  }
  sopla(t, q) { return q ? t > T_SOPLA2 && t < T_FOTO2 - 0.25 : t > T_SOPLA1 && t < T_CERO - 0.25; }
  vasoEnMano(t) { return t > T_COGE; }
  poses() {
    const t = this.t;
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    const P2 = [M, G];
    const y = [0, 0], giro = [0, 0], sx = [1, 1];
    for (const q of [0, 1]) {
      const A = P2[q], R0 = avatar(A.quien).rig;
      let mD = R0.manoD.slice(), mI = R0.manoI.slice();
      const soplando = q === 0 ? t < T_CAMBIO : t > T_CAMBIO + 0.55;
      const t0 = q ? T_SOPLA2 : T_SOPLA1, tf = q ? T_FOTO2 : T_CERO;
      if (soplando && t < T_RANK) {
        // sujeta la boquilla
        const k = eInOut(tramo(t, t0 - 0.35, t0));
        const b = boca(0, A.quien);
        mD = mezcla(mD, [b[0] + 24, b[1] + 8], k);
        A.brazoIDelante = false;
        if (this.sopla(t, q)) { A.cara = "dormido"; sx[q] = 1 + 0.03 * Math.abs(Math.sin(t * 5)); }
        if (t > tf - 0.25 && t < tf + 0.35) A.cara = "sorpresa";
        if (t > tf + 0.35) {
          A.cara = "risa";
          if (q === 0) { mD = [70, 40 + 4 * Math.sin(t * 10)]; mI = [24, 106]; A.rc = 0.06; }   // ¡cero! pulgar arriba
          else { mD = [96, 30 + 6 * Math.sin(t * 10)]; mI = [-18, 30 + 6 * Math.sin(t * 10 + 1)]; y[q] = -Math.abs(Math.sin((t - tf) * 9)) * 18; }
        }
      } else if (t < T_RANK) {
        // el que espera: brazos cruzados; mira impresionado
        mD = q ? [24, 112] : [22, 108]; mI = q ? [52, 112] : [50, 108];
        A.piernaD = [-Math.max(0, Math.sin(t * 12)) * 5, 0];
        A.cara = "sonrisa"; A.rc = -0.08;
        const s = this.soplido(t);
        if (q === 1 && t < T_CAMBIO && s.k > 0.5) { A.cara = "sorpresa"; A.rc = -0.12; }
        if (q === 1 && t > T_CERO + 0.1 && t < T_CAMBIO) { const ap = Math.abs(Math.sin(t * 13)); A.cara = "risa"; mD = [50, 104 - 4 * ap]; mI = [26 + 6 * ap, 104]; }
        if (q === 0 && t > T_CAMBIO && s.k > 0.6) { A.cara = "sorpresa"; A.rc = -0.14; }
        if (q === 0 && t > T_FOTO2 - 0.2) { A.cara = "risa"; mD = [70, 40 + 4 * Math.sin(t * 10)]; mI = [22, 108]; }
      }
      // el cambio a toda prisa
      if (t > T_CAMBIO && t < T_CAMBIO + 0.6) {
        const k = tramo(t, T_CAMBIO, T_CAMBIO + 0.55);
        y[q] = -Math.abs(Math.sin(k * Math.PI * 3)) * 16;
        giro[q] = (q ? -0.14 : 0.14) * Math.sin(k * Math.PI);
        mD = [80, 120 + 20 * Math.sin(t * 30)]; mI = [-4, 120 - 20 * Math.sin(t * 30)];
        A.cara = "risa";
      }
      // ranking: cada uno a su sitio
      if (t >= T_RANK) {
        const u = tramo(t, T_RANK, T_RANK + 0.75);
        if (u < 1) { const a = andar(t * 15 + q, 1); A.piernaI = a.piernaI; A.piernaD = a.piernaD; y[q] = a.bote; }
        A.cara = "risa"; A.rc = 0;
        if (q === 1) { mD = [86, 110]; mI = [-6, 110]; }
        else {
          mD = [74, 132];
          // coge el vaso de la mesita al pasar
          const mm = matAv(this.x(t, 0), PIES, ESC), vaso = enAv(mm, [MESA[0], MESA[1] - 10 * EV * ESC - 4]);
          const k1 = eInOut(tramo(t, T_COGE - 0.25, T_COGE)), k2 = eInOut(tramo(t, T_COGE, T_COGE + 0.35));
          mI = mezcla(mezcla([2, 140], vaso, k1), [-2, 98], k2);
          A.rc = -0.1;
        }
      }
      // Marcos le acerca el vaso; Guillermo lo coge y brinda
      if (t >= T_DA - 0.3) {
        const mmM = matAv(this.x(t, 0), PIES, ESC), mmG = matAv(this.x(t, 1), PIES, ESC);
        const entrega = [(XG_R + XM_R) / 2 + 2, 402];
        if (q === 0) {
          const k = eInOut(tramo(t, T_DA - 0.3, T_DA)), kV = eInOut(tramo(t, T_TOMA + 0.05, T_TOMA + 0.4));
          mI = mezcla(mezcla([-2, 98], enAv(mmM, entrega), k), [2, 140], kV);
          if (t > T_TOMA + 0.4) { mD = [64, 36 + 3 * Math.sin(t * 8)]; mI = [-6, 70]; A.cara = t > 9.6 && t < 9.9 ? "guino" : "risa"; A.rc = -0.06; }  // se señala: ¡0,00!
          else { A.cara = "sonrisa"; A.rc = -0.12; }
        } else {
          const k = eInOut(tramo(t, T_TOMA - 0.25, T_TOMA)), kA = eInOut(tramo(t, T_TOMA + 0.05, T_TOMA + 0.35));
          mD = mezcla(mezcla([86, 110], enAv(mmG, entrega), k), [92, 70], kA);
          A.cara = t < T_TOMA ? "sorpresa" : "risa"; A.rc = 0.1;
          if (t > T_BEBE) {
            const kS = eInOut(tramo(t, T_BEBE, T_BEBE + 0.3)), kT = tramo(t, T_BEBE + 0.3, T_BEBE + 0.9), kB = eInOut(tramo(t, T_BEBE + 1.0, T_BEBE + 1.3));
            const rc = -0.2 * kS * (1 - kB), ang = -(0.4 * kS + 0.5 * eInOut(kT)) * (1 - kB);
            const b = boca(rc), r = rot2([-7.5 * EV, -16 * EV], ang);
            mD = mezcla(mezcla([92, 70], [b[0] - r[0] + 2, b[1] - r[1] - 1], kS), [92, 70], kB);
            A.rc = kS > 0.5 && kB < 0.5 ? rc : 0.1; A.cara = kT > 0.05 && kB < 0.5 ? "dormido" : "risa";
            this._angG = ang;
          } else this._angG = 0;
        }
      }
      A.manoD = mD; A.manoI = mI;
    }
    // el vaso
    const vaso = this.vasoEnMano(t);
    if (vaso && t < T_TOMA) M.objI2 = (g, m) => vasoAgua(g, m[0], m[1], 0, 0.85, t);
    if (t >= T_TOMA) { const a = this._angG || 0, nv = lerp(0.85, 0.55, tramo(t, T_BEBE + 0.35, T_BEBE + 0.9)); G.objD = (g, m) => vasoAgua(g, m[0], m[1], a, nv, t); }
    return [0, 1].map((q) => ({ pose: P2[q], m: matAv(this.x(t, q), PIES + y[q], ESC, giro[q], sx[q], 1) }));
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    for (const q of [0, 1]) if (this.sopla(t, q) && Math.random() < 30 * dt) {
      const yb = this.boquilla(t)[1];
      p.nueva(P.VAPOR, BOQ[0] - 40 + azar(-10, 10), yb + azar(-6, 6), azar(80, 180), azar(-10, 10), azar(0.3, 0.5), azar(10, 18));
    }
    this.una("cero", t > T_CERO, () => {
      temblar(12, 0.3);
      for (let k = 0; k < 26; k++) { const a = azar(0, 6.283), v = azar(160, 420); p.nueva(P.PURPURINA, MX + Math.cos(a) * 60, MTOP + 130 + Math.sin(a) * 40, Math.cos(a) * v, Math.sin(a) * v - 80, azar(0.8, 1.4), azar(10, 18)); }
      for (let k = 0; k < 14; k++) { const a = azar(0, 6.283), v = azar(150, 380); p.nueva(P.CHISPA, MX, MTOP + 130, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 10)); }
    });
    this.una("foto", t > T_FOTO2, () => {
      temblar(10, 0.25);
      p.nueva(P.DESTELLO, MX, MTOP + 26, 0, 0, 0.4, 260);
      for (let k = 0; k < 16; k++) { const a = azar(0, 6.283), v = azar(150, 380); p.nueva(P.CHISPA, MX, MTOP + 26, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 10)); }
    });
    this.una("zas", t > T_CAMBIO + 0.1, () => {
      temblar(8, 0.25);
      for (let k = 0; k < 34; k++) p.nueva(P.POLVO, 530 + azar(-70, 70), azar(250, 560), azar(-160, 160), azar(-80, 40), azar(0.5, 0.9), azar(70, 110));
    });
    this.una("rank", t > T_RANK + 0.9, () => {
      temblar(14, 0.35);
      for (let k = 0; k < 20; k++) { const a = azar(0, 6.283); p.nueva(P.DESTELLO, 790 + Math.cos(a) * 60, 80 + Math.sin(a) * 26, Math.cos(a) * 240, Math.sin(a) * 240, azar(0.3, 0.5), azar(10, 18)); }
    });
    this.una("tit", t > T_TIT, () => {
      temblar(18, 0.45);
      for (let k = 0; k < 90; k++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-80, -10), azar(-40, 40), azar(0, 120), azar(2.5, 4), azar(9, 15), k % 5);
    });
    p.suelo = () => PIES;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  /** Punta de la boquilla: va a la boca del que sopla. */
  boquilla(t) {
    const e = this.poses(), q = t < T_CAMBIO ? 0 : 1;
    const A = e[q], b = aPant(A.m, boca(A.pose.rc || 0, A.pose.quien));
    const k = this.sopla(t, q) || (t > (q ? T_SOPLA2 : T_SOPLA1) - 0.2 && t < (q ? T_FOTO2 : T_CERO));
    return k ? [b[0] + 4, b[1]] : [BOQ[0] - 78, BOQ[1] + 6];
  }
  /** Cuerpo de la máquina (estático): sombra, carcasa con el borde verde, cámara, lector, rótulo, ranura. */
  cuerpo(g, x0, x1) {
    g.fillStyle = "rgba(0,0,0,.5)"; g.beginPath(); g.ellipse(MX, PIES, MW * 0.62, 14, 0, 0, 6.283); g.fill();
    const gc = g.createLinearGradient(x0, 0, x1, 0);
    gc.addColorStop(0, "#15171c"); gc.addColorStop(0.5, "#2c3038"); gc.addColorStop(1, "#121418");
    g.fillStyle = gc; rectR(g, x0, MTOP, MW, PIES - MTOP, 22); g.fill();
    g.strokeStyle = "rgba(43,255,91,.75)"; g.lineWidth = 3; rectR(g, x0 + 4, MTOP + 4, MW - 8, PIES - MTOP - 8, 19);
    g.shadowColor = "#2bff5b"; g.shadowBlur = 12; g.stroke(); g.shadowBlur = 0; g.shadowColor = "transparent";
    g.fillStyle = "#0a0b0d"; g.beginPath(); g.arc(MX, MTOP + 26, 15, 0, 6.283); g.fill();
    g.strokeStyle = "#5a606a"; g.lineWidth = 3; g.stroke();
    g.fillStyle = "#2a4a8a"; g.beginPath(); g.arc(MX, MTOP + 26, 7, 0, 6.283); g.fill();
    g.fillStyle = "rgba(255,255,255,.7)"; g.beginPath(); g.arc(MX - 3, MTOP + 23, 2.4, 0, 6.283); g.fill();
    g.fillStyle = "#e3262f"; g.beginPath(); g.arc(MX + 24, MTOP + 20, 3, 0, 6.283); g.fill();
    g.fillStyle = "#1c1f24"; rectR(g, x1 - 64, MTOP + 12, 48, 34, 6); g.fill();
    g.strokeStyle = "rgba(255,211,77,.9)"; g.lineWidth = 2;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(x1 - 46, MTOP + 29, 5 + i * 5, -0.7, 0.7); g.stroke(); }
    g.fillStyle = "#2bff5b"; g.beginPath(); g.arc(x1 - 22, MTOP + 18, 2.4, 0, 6.283); g.fill();
    txt(g, "¿CUÁNTO SOPLAS?", MX, 352, { tam: 24, peso: 900, fam: FD, color: "#d8ffe0", esp: 2, max: MW - 30 });
    g.fillStyle = "#050607"; rectR(g, MX - 70, 392, 140, 12, 5); g.fill();
    g.fillStyle = "#3a3f49"; rectR(g, x0 - 14, BOQ[1] - 16, 22, 32, 6); g.fill();
  }
  maquina(g, t, a) {
    if (a <= 0) return;
    const x0 = MX - MW / 2, x1 = MX + MW / 2, s = this.soplido(t);
    g.save(); g.globalAlpha = a;
    const OX = x0 - 40, OY = MTOP - 24;
    if (!CT.has("cuerpo")) {
      const c = lienzoNuevo(MW + 80, PIES - MTOP + 48), cg = c.getContext("2d");
      cg.translate(-OX, -OY); this.cuerpo(cg, x0, x1); CT.set("cuerpo", c);
    }
    g.drawImage(CT.get("cuerpo"), OX, OY);
    // la pantalla
    const px = x0 + 22, py = MTOP + 58, pw = MW - 44, ph = 138;
    g.fillStyle = "#050806"; rectR(g, px - 6, py - 6, pw + 12, ph + 12, 10); g.fill();
    g.fillStyle = "#07120a"; g.fillRect(px, py, pw, ph);
    const quien = s.q, val = quien ? VAL : 0, v = val * s.k;
    const t0 = quien ? T_SOPLA2 : T_SOPLA1, tf = quien ? T_FOTO2 : T_CERO;
    if (t < t0 + 0.1 || (t > T_CAMBIO && t < T_SOPLA2 + 0.1)) {
      if (Math.sin(t * 9) > -0.3) txt(g, "¡SOPLA!", MX, py + 82, { tam: 44, peso: 900, fam: FD, color: "#2bff5b", esp: 3 });
    } else if (quien === 0 && t > T_CERO) {
      // ¡CERO! con estrellitas
      const k = eBack(tramo(t, T_CERO, T_CERO + 0.25));
      txt(g, "0,00 g/L", MX, py + 30, { tam: 24, peso: 900, fam: FD, color: "#d8ffe0", esp: 2 });
      g.save(); g.translate(MX, py + 98); g.scale(k, k);
      txt(g, "¡CERO!", 0, 0, { tam: 62, peso: 900, fam: FD, color: "#2bff5b", esp: 3, glow: "rgba(43,255,91,.8)", glowTam: 14 });
      g.restore();
      txt(g, "DE SERVICIO ★", MX, py + ph - 8, { tam: 16, peso: 800, color: "#ffd34d", esp: 2, alfa: Math.sin(t * 10) > -0.4 ? 1 : 0.3 });
      for (let i = 0; i < 5; i++) { const an = t * 2 + i * 1.257; brillo(g, MX + Math.cos(an) * 84, py + 76 + Math.sin(an) * 50, 10 + 6 * Math.abs(Math.sin(t * 5 + i)), 1); }
    } else {
      g.fillStyle = "rgba(43,255,91,.18)"; g.fillRect(px + 12, py + 14, pw - 24, 14);
      g.fillStyle = "#2bff5b"; g.fillRect(px + 12, py + 14, (pw - 24) * s.k, 14);
      txt(g, fmt(v), MX, py + 96, { tam: 66, peso: 900, fam: FD, color: "#d8ffe0", esp: 2 });
      txt(g, "g/L", MX, py + 124, { tam: 20, peso: 800, color: "#2bff5b", esp: 3 });
      if (quien && t > tf) txt(g, `TOP 10 ✓ ${PUESTO}`, MX, py + ph - 2, { tam: 16, peso: 800, color: "#ffd34d", esp: 2, alfa: Math.sin(t * 10) > -0.4 ? 1 : 0.3 });
    }
    g.fillStyle = "rgba(255,255,255,.05)"; g.fillRect(px, py, pw * 0.45, ph);
    g.restore();
  }
  dibujarBoquilla(g, t, a) {
    if (a <= 0) return;
    const P0 = [BOQ[0] - 6, BOQ[1]], P1 = this.boquilla(t);
    const L = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]), ang = Math.atan2(P1[1] - P0[1], P1[0] - P0[0]);
    g.save(); g.globalAlpha = a; g.translate(P0[0], P0[1]); g.rotate(ang);
    const R = 15;
    const gr = g.createLinearGradient(0, -R, 0, R);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.3, "#eef2f5"); gr.addColorStop(0.75, "#bcc6cf"); gr.addColorStop(1, "#7f8a96");
    g.fillStyle = gr; rectR(g, 0, -R, L - 12, 2 * R, 6); g.fill();
    const gv = g.createLinearGradient(0, -R, 0, R);
    gv.addColorStop(0, "#b6ffc8"); gv.addColorStop(0.4, "#2bff5b"); gv.addColorStop(1, "#0b7a2a");
    g.fillStyle = gv; g.fillRect(L * 0.35, -R - 1, 12, 2 * R + 2);
    g.fillStyle = gr; rectR(g, L - 18, -9, 18, 18, 5); g.fill();
    g.fillStyle = "rgba(255,255,255,.7)"; g.fillRect(6, -R + 4, L - 26, 3);
    g.restore();
  }
  /** Polaroid que sale de la ranura (antes del ranking). */
  polaroidSale(g, t, a) {
    if (t < T_FOTO2 + 0.15 || t > T_RANK + 0.2) return;
    const k = eOut(tramo(t, T_FOTO2 + 0.15, T_FOTO2 + 0.6)), al = a * (1 - tramo(t, T_RANK - 0.05, T_RANK + 0.2));
    g.save(); g.globalAlpha = al;
    g.beginPath(); g.rect(MX - 80, 398, 160, 200); g.clip();
    polaroid(g, foto("guillermo", "risa"), MX - 6, 398 - 60 + 120 * k, 110, -0.04, null);
    g.restore();
  }
  mesita(g) {
    const [x, y] = MESA;
    g.fillStyle = "rgba(0,0,0,.4)"; g.beginPath(); g.ellipse(x, PIES + 2, 40, 7, 0, 0, 6.283); g.fill();
    g.fillStyle = "#2a2e33"; g.fillRect(x - 4, y, 8, PIES - y); rectR(g, x - 26, PIES - 8, 52, 8, 3); g.fill();
    const gr = g.createLinearGradient(0, y - 6, 0, y + 8);
    gr.addColorStop(0, "#8a5426"); gr.addColorStop(1, "#4a2a12");
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, 40, 9, 0, 0, 6.283); g.fill();
    g.fillStyle = "#5a3218"; g.fillRect(x - 40, y, 80, 7);
  }
  ranking(g, t, a) {
    if (t < T_RANK) return;
    if (t > T_RANK + 0.75) {
      const k = tramo(t, T_RANK + 0.75, T_RANK + 0.9), s = lerp(2.6, 1, eIn(k)), sp = pegatinaTop10();
      g.save(); g.globalAlpha = a * clamp(k * 3, 0, 1); g.translate(790, 74); g.rotate(-0.06 + (1 - k) * 0.4); g.scale(s * 0.7, s * 0.7);
      g.drawImage(sp, -sp.width / 2, -sp.height / 2); g.restore();
    }
    const t0 = T_RANK + 0.3;
    if (t > t0) {
      const d = t - t0, cy = lerp(-200, 268, eOut(tramo(d, 0, 0.7)));
      const giro = 0.06 + 0.3 * Math.sin(d * 5.2) * Math.exp(-d * 2.4);
      g.save(); g.globalAlpha = a;
      polaroid(g, foto("guillermo", "risa"), 800, cy, 200, giro, (c, px, py, w, h) => {
        txt(c, PUESTO, px + 16, py + h * 0.68, { tam: 30, peso: 900, fam: FD, color: "#241812", alin: "left" });
        txt(c, `${fmt(VAL)} g/L`, px + w - 14, py + h * 0.68, { tam: 26, peso: 900, fam: FD, color: "#14a83a", alin: "right" });
      });
      g.restore();
    }
  }
  /** Chapa de Marcos con su 0,00 (en el ranking). */
  chapa(g, t, a, e) {
    if (t < T_TOMA + 0.3) return;
    const k = eBack(tramo(t, T_TOMA + 0.3, T_TOMA + 0.55)), c = aPant(e[0].m, [37, -24]);
    g.save(); g.globalAlpha = a; g.translate(c[0], c[1] - 6 + 4 * Math.sin(t * 4)); g.scale(k, k);
    g.fillStyle = "rgba(4,20,8,.9)"; rectR(g, -86, -24, 172, 48, 24); g.fill();
    g.strokeStyle = "#2bff5b"; g.lineWidth = 3; rectR(g, -86, -24, 172, 48, 24); g.stroke();
    txt(g, "0,00 g/L ★", 0, 12, { tam: 30, peso: 900, fam: FD, color: "#2bff5b", esp: 2, glow: "rgba(43,255,91,.7)", glowTam: 10 });
    g.restore();
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    const aM = a * (1 - tramo(t, T_RANK - 0.1, T_RANK + 0.3));
    g.save(); g.globalAlpha = a;
    foco(g, 512, 512, PIES, 300, 0.8 * (aM / Math.max(a, 0.001)));
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.18 * aM; g.drawImage(BLOB.verde, 300, 120, 424, 440);
    g.restore();
    if (t > T_RANK) {
      const l = a * tramo(t, T_RANK, T_RANK + 0.4);
      g.save(); g.globalCompositeOperation = "lighter";
      for (let i = -1; i <= 1; i++) {
        const gr = g.createLinearGradient(0, 0, 0, 470);
        gr.addColorStop(0, `rgba(255,250,220,${0.12 * l})`); gr.addColorStop(1, "rgba(255,250,220,0)");
        g.fillStyle = gr; g.beginPath(); g.moveTo(512 + i * 90 - 40, -10); g.lineTo(512 + i * 90 + 40, -10); g.lineTo(512 + i * 210 + 120, 470); g.lineTo(512 + i * 210 - 120, 470); g.closePath(); g.fill();
      }
      g.restore();
    }
    this.maquina(g, t, aM);
    this.polaroidSale(g, t, aM);
    g.save(); g.globalAlpha = a;
    this.mesita(g);
    if (!this.vasoEnMano(t)) { g.save(); g.translate(MESA[0], MESA[1] - 10 * EV * ESC - 4); g.scale(ESC, ESC); vasoAgua(g, 0, 0, 0, 0.85, t); g.restore(); }
    // el que espera va detrás; el que sopla, delante de la máquina
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    g.restore();
    this.dibujarBoquilla(g, t, aM);
    this.ranking(g, t, a);
    this.chapa(g, t, a, e);
    // flash de la foto
    const d = t - T_FOTO2;
    if (d > 0 && d < 0.35) { g.fillStyle = `rgba(255,255,255,${0.75 * (1 - d / 0.35) * a})`; g.fillRect(-60, -60, W + 120, H + 120); }
    this.p.dibujar(g);
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const dd = t - t0;
      if (dd < 0 || dd > dur) return;
      const k = eBack(tramo(dd, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: a * (1 - tramo(dd, dur - 0.15, dur)) });
      g.restore();
    };
    ono("¡CLIC!", MX + 150, MTOP + 20, T_FOTO2, 0.8, 44, "#fffdf5", "#1b1b1b", 0.12);
    ono("¡ZAS!", 530, 220, T_CAMBIO + 0.15, 0.6, 72, "#ffd34d", "#3a2400", -0.08);
    ono("¡TOP 10!", 760, 330, T_FOTO2 + 0.3, 0.6, 50, "#ffd34d", "#3a2400", 0.08);
    for (const q of [0, 1]) if (this.sopla(t, q)) {
      const t0 = q ? T_SOPLA2 : T_SOPLA1, k = eBack(tramo(t, t0, t0 + 0.15));
      g.save(); g.translate(208 + Math.sin(t * 30) * 2, 210); g.rotate(-0.1); g.scale(k, k);
      txt(g, "FUUUH…", 0, 0, { tam: 40, peso: 400, fam: FC, color: "#d8ffe0", borde: "#04140a", bordeAncho: 7, esp: 2, alfa: a });
      g.restore();
    }
    // ¡CERO PATATERO!
    if (t > T_TIT) {
      const dd = t - T_TIT, k = tramo(dd, 0, 0.18), s = lerp(2.4, 1, eIn(k)) * (1 + 0.02 * Math.sin(dd * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a;
      const gb = g.createLinearGradient(0, 470, 0, 600);
      gb.addColorStop(0, "rgba(0,0,0,0)"); gb.addColorStop(0.35, "rgba(0,0,0,.75)"); gb.addColorStop(1, "rgba(0,0,0,.88)");
      g.fillStyle = gb; g.fillRect(-60, 462, W + 120, 200);
      g.translate(512, 532); g.rotate(-0.02); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has(1)) return CT.get(1);
    const c = lienzoNuevo(1000, 180), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 45, 0, 135);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#c9ffd6"); gr.addColorStop(1, "#2bff5b");
    txt(g, "¡CERO PATATERO!", 500, 128, { tam: 108, peso: 900, fam: FD, color: gr, borde: "#03230c", bordeAncho: 11, esp: 4, glow: "rgba(43,255,91,.8)", glowTam: 24, max: 930 });
    CT.set(1, c);
    return c;
  }
}

registrar({ id: "00234", nombre: "Soplido de bombero", crear: () => new SoplidoBombero() });
})();
