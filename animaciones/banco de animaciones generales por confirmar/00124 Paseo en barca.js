"use strict";
/*
 * 00124 · PASEO EN BARCA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Atardecer sobre un lago de cerveza. Guillermo rema despacio y Rodrigo lanza la caña de pescar; pasa una gaviota,
 * los dos cierran los ojos… El corcho se hunde, la caña se dobla, tiran… y lo que sale del lago es una lata. Rodrigo la
 * coge al vuelo, la abre y se recuestan los dos: ¡QUÉ PAZ! El sol se esconde.
 */
(() => {
const ESC = 1.35, HOR = 330, AGUA = 505;
const XG = 430, XR = 604, YH = 488;           // caderas de los dos (sentados)
const CX = 512;                                // centro de la barca
const O = [336, 466];                          // escálamo del remo
const CORCHO = [930, 516];
const T_LANZA = 1.25, T_CAE_CORCHO = 1.95, T_PICA = 5.15, T_SACA = 6.35, T_COGE = 6.95, T_ABRE = 7.45;
const cache = cacheTexto();

function aUm(m, q) { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; }

function fondoLago() {
  const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
  g.translate(60, 60);
  const gc = g.createLinearGradient(0, -60, 0, HOR);
  gc.addColorStop(0, "#241640"); gc.addColorStop(0.45, "#a03a5a"); gc.addColorStop(0.8, "#ff7a3d"); gc.addColorStop(1, "#ffc46b");
  g.fillStyle = gc; g.fillRect(-60, -60, W + 120, HOR + 60);
  // nubes alargadas
  g.fillStyle = "rgba(255,170,120,.35)";
  for (const [x, y, w] of [[180, 120, 260], [760, 80, 300], [420, 190, 220], [900, 210, 180]]) { g.beginPath(); g.ellipse(x, y, w / 2, 9, 0, 0, 6.283); g.fill(); }
  // colinas a lo lejos
  g.fillStyle = "#3a1d2c";
  g.beginPath(); g.moveTo(-60, HOR); g.quadraticCurveTo(80, HOR - 60, 220, HOR - 22); g.quadraticCurveTo(300, HOR - 40, 380, HOR); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(820, HOR); g.quadraticCurveTo(940, HOR - 46, W + 60, HOR - 30); g.lineTo(W + 60, HOR); g.closePath(); g.fill();
  // lago de cerveza
  const ga = g.createLinearGradient(0, HOR, 0, H + 60);
  ga.addColorStop(0, "#ffcf5a"); ga.addColorStop(0.35, "#f0a020"); ga.addColorStop(1, "#8a4a00");
  g.fillStyle = ga; g.fillRect(-60, HOR, W + 120, H + 60 - HOR);
  return c;
}
function titulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(780, 210), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 160);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.6, "#fff4d6"); gr.addColorStop(1, "#ffd27a");
  txt(g, "¡QUÉ PAZ!", 390, 158, { tam: 128, peso: 400, fam: FB, color: "#5a1f2a", esp: 5 });
  txt(g, "¡QUÉ PAZ!", 390, 150, { tam: 128, peso: 400, fam: FB, color: gr, borde: "#8a2f3a", bordeAncho: 12, esp: 5, glow: "rgba(255,140,80,.9)", glowTam: 26 });
  cache.set("t", c);
  return c;
}
function barca(g) {
  // casco de madera de perfil
  g.beginPath();
  g.moveTo(292, 452); g.quadraticCurveTo(510, 474, 748, 438);
  g.quadraticCurveTo(735, 500, 670, 540); g.lineTo(370, 540); g.quadraticCurveTo(310, 512, 292, 452); g.closePath();
  const gr = g.createLinearGradient(0, 450, 0, 540);
  gr.addColorStop(0, "#a8622a"); gr.addColorStop(0.5, "#7a4019"); gr.addColorStop(1, "#3e1d08");
  g.fillStyle = gr; g.fill();
  g.save(); g.clip();
  g.strokeStyle = "rgba(40,16,2,.5)"; g.lineWidth = 2;
  for (let i = 1; i < 5; i++) { const y = 460 + i * 17; g.beginPath(); g.moveTo(280, y - 6); g.quadraticCurveTo(510, y + 14, 760, y - 20); g.stroke(); }
  g.restore();
  // borda
  g.strokeStyle = "#d9a466"; g.lineWidth = 7; g.lineCap = "round";
  g.beginPath(); g.moveTo(292, 452); g.quadraticCurveTo(510, 474, 748, 438); g.stroke();
  g.strokeStyle = "rgba(255,235,200,.6)"; g.lineWidth = 2;
  g.beginPath(); g.moveTo(296, 450); g.quadraticCurveTo(510, 471, 744, 436); g.stroke();
  // escálamo
  g.strokeStyle = "#2e3338"; g.lineWidth = 4;
  g.beginPath(); g.moveTo(O[0] - 7, O[1] - 12); g.lineTo(O[0] - 7, O[1]); g.moveTo(O[0] + 7, O[1] - 12); g.lineTo(O[0] + 7, O[1]); g.stroke();
  // nombre pintado
  txt(g, "LA ESPUMOSA", 640, 500, { tam: 17, peso: 900, fam: FD, color: "rgba(255,240,210,.75)", esp: 2 });
}

class Barca extends Escena {
  constructor() {
    super(10.3);
    this.p = new Parts(300);
    this.fondo = null; this.ondas = []; this.burbujas = [];
    for (let i = 0; i < 22; i++) this.burbujas.push({ x: azar(-40, W + 40), y: azar(HOR + 10, H), r: azar(1.5, 4), v: azar(10, 30) });
  }
  luz(t) { return tramo(t, 0.02, 0.7) * (1 - tramo(t, 9.55, 10.25)); }
  bob(t) { return { dy: 3 * Math.sin(t * 1.7), rot: 0.012 * Math.sin(t * 1.3) }; }
  matBarca(t) { const b = this.bob(t); return new DOMMatrix().translate(CX, AGUA + b.dy).rotate((b.rot * 180) / Math.PI).translate(-CX, -AGUA); }
  /** Ángulo y curva de la caña: { base (unidades), ang, largo, dobla } */
  cana(t) {
    let ang = -0.72, dobla = 0;
    // lanzar: atrás y adelante
    if (t > T_LANZA - 0.35 && t < T_CAE_CORCHO) {
      const a = eInOut(tramo(t, T_LANZA - 0.35, T_LANZA)), b = eOut(tramo(t, T_LANZA, T_LANZA + 0.22));
      ang = lerp(lerp(-0.72, -1.9, a), -0.55, b);
      dobla = (t > T_LANZA ? -0.25 : 0.2) * Math.sin(tramo(t, T_LANZA - 0.35, T_LANZA + 0.4) * Math.PI);
    }
    if (t >= T_CAE_CORCHO && t < T_PICA) ang = lerp(-0.55, -0.72, tramo(t, T_CAE_CORCHO, 2.4));
    if (t >= T_PICA && t < T_SACA) { const k = tramo(t, T_PICA, T_PICA + 0.15); ang = -0.72 + 0.28 * k + 0.05 * Math.sin(t * 25); dobla = 0.55 * k + 0.08 * Math.sin(t * 19); }
    if (t >= T_SACA && t < T_COGE) { const k = eOut(tramo(t, T_SACA, T_SACA + 0.25)); ang = lerp(-0.44, -1.35, k); dobla = lerp(0.6, -0.1, k); }
    if (t >= T_COGE) ang = lerp(-1.35, -0.9, eInOut(tramo(t, T_COGE, T_COGE + 0.5)));
    return { ang, dobla, largo: 205 };
  }
  lata(t, mR) {
    // posición de la lata (pantalla) mientras vuela; null si no se ve
    if (t < T_SACA) return null;
    if (t < T_COGE) {
      const u = tramo(t, T_SACA, T_COGE), dest = aPant(mR, [-6, 104]);
      return { x: lerp(CORCHO[0], dest[0], u), y: lerp(CORCHO[1], dest[1], u) - 4 * 300 * u * (1 - u), r: u * 12 };
    }
    return null;
  }
  estado(t) {
    const mB = this.matBarca(t);
    // sentados: las piernas suben y quedan escondidas detrás del casco
    const G = { cara: "dormido", rc: 0, piernaI: [-62, 0.05], piernaD: [-62, -0.05], brazoIDelante: true };
    const R = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [-66, 0.05], piernaD: [-66, -0.05], manoI: [9, 157] };
    const mG = mB.multiply(matAv(XG, YH, ESC, 0, 1, 1, [39, 146]));
    const mR = mB.multiply(matAv(XR, YH, ESC, 0, 1, 1, [39, 146]));
    // ---- Guillermo rema (se para un rato a estirarse y vuelve a remar al final)
        const f = t * 3.9;
    const asa = [400 + 28 * Math.cos(f), 440 + 14 * Math.sin(f)];
    const OAR = [aUm(mG, asa), aUm(mG, [asa[0] - 10, asa[1] + 2])], UP = [[96, 14], [-18, 14]], LAP = [[72, 130], [10, 132]];
    const k1 = eInOut(tramo(t, 3.0, 3.4)), k2 = eInOut(tramo(t, 4.3, 4.7)), k3 = eInOut(tramo(t, 7.9, 8.3));
    let mD, mI;
    if (t < 4.3) { mD = mezcla(OAR[0], UP[0], k1); mI = mezcla(OAR[1], UP[1], k1); }
    else if (t < 7.9) { mD = mezcla(UP[0], LAP[0], k2); mI = mezcla(UP[1], LAP[1], k2); }
    else { mD = mezcla(LAP[0], OAR[0], k3); mI = mezcla(LAP[1], OAR[1], k3); }
    const kRemo = t < 4.3 ? k1 : t < 7.9 ? 1 : 1 - k3;
    G.manoD = mD; G.manoI = mI;
    if (t > 3.1 && t < 4.4) G.cara = t < 3.6 ? "sorpresa" : "dormido";
    if (t >= T_PICA && t < T_COGE) { G.cara = "sorpresa"; G.rc = 0.16; }
    if (t >= T_COGE && t < 7.9) { G.cara = "risa"; G.rc = 0.1 * Math.sin(t * 6); }
    if (t >= 7.9) { G.cara = "dormido"; G.rc = 0.05; }
    // ---- Rodrigo pesca
    const c = this.cana(t);
    R.manoD = [86, 128];
    R.objD = (g, m) => {
      const tip = [m[0] + Math.cos(c.ang) * c.largo, m[1] + Math.sin(c.ang) * c.largo];
      const mid = [(m[0] + tip[0]) / 2, (m[1] + tip[1]) / 2], n = [-Math.sin(c.ang), Math.cos(c.ang)];
      const ctrl = [mid[0] + n[0] * c.dobla * 60, mid[1] + n[1] * c.dobla * 60];
      g.lineCap = "round";
      g.strokeStyle = "#3b2414"; g.lineWidth = 3.2; g.beginPath(); g.moveTo(m[0], m[1]); g.quadraticCurveTo(ctrl[0], ctrl[1], tip[0], tip[1]); g.stroke();
      g.strokeStyle = "#c98a4a"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(m[0], m[1]); g.quadraticCurveTo(ctrl[0], ctrl[1], tip[0], tip[1]); g.stroke();
      // carrete
      g.fillStyle = "#9aa1a8"; g.beginPath(); g.arc(m[0] + Math.cos(c.ang) * 14 + 4, m[1] + Math.sin(c.ang) * 14 + 5, 4.5, 0, 6.283); g.fill();
      this._punta = tip;
    };
    if (t < 0.9) R.cara = "sonrisa";
    else if (t < T_CAE_CORCHO + 0.3) R.cara = "guino";
    else if (t < 4.6) { R.cara = "dormido"; R.rc = 0.04; }
    else if (t < T_PICA) R.cara = "guino";
    else if (t < T_COGE) { R.cara = "sorpresa"; R.rc = -0.1 + 0.05 * Math.sin(t * 20); R.manoD = [80 + 6 * Math.sin(t * 20), 122]; }
    if (t >= T_PICA && t < T_COGE) { R.brazoIDelante = true; R.manoI = [74, 134]; }
    // coge la lata, la abre y bebe
    if (t >= T_COGE - 0.2) {
      R.brazoIDelante = true;
      const kc = eOut(tramo(t, T_COGE - 0.2, T_COGE));
      let mano = mezcla([9, 157], [-6, 104], kc), ang = 0;
      if (t > T_COGE) { R.cara = t < T_ABRE ? "risa" : "guino"; mano = mezcla([-6, 104], [-10, 60], eBack(tramo(t, T_COGE, T_COGE + 0.3))); }
      const kB = eInOut(tramo(t, 7.85, 8.15)), kT = eInOut(tramo(t, 8.1, 8.7)) * (1 - eInOut(tramo(t, 9.1, 9.4)));
      if (kB > 0) {
        R.rc = 0.34 * kT; ang = 0.4 * kB + 1.25 * kT;
        const b = boca(R.rc, "rodrigo"), tope = rot2([-1.5, -13], ang);
        mano = mezcla(mano, [b[0] - tope[0] - 2, b[1] - tope[1] + 1], kB);
        R.cara = kT > 0.3 ? "dormido" : "guino";
      }
      R.manoI = mano;
      const ab = t > T_ABRE;
      R.objI2 = (g, m) => dibujarLata(g, m[0], m[1] - 4, ang, { abierta: ab });
      if (t > 9.4) R.cara = "dormido";
    }
    return { G, R, mG, mR, mB, c, asa, kRemo };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado(t);
    // ondas y espuma del remo
    const remaAhora = t < 3.0 || t > 8.3;
    if (remaAhora && Math.sin(t * 3.9) > 0.9 && Math.random() < 12 * dt) {
      const b = this.pala(e.asa);
      this.ondas.push({ x: b[0], y: AGUA + 6, r: 6, v: 1.0 });
      for (let i = 0; i < 4; i++) p.nueva(P.ESPUMA, b[0] + azar(-10, 10), AGUA, azar(-60, 60), azar(-120, -40), azar(0.3, 0.6), azar(3, 6));
    }
    this.una("corcho", t > T_CAE_CORCHO, () => {
      this.ondas.push({ x: CORCHO[0], y: CORCHO[1] + 6, r: 4, v: 1.4 });
      for (let i = 0; i < 10; i++) p.nueva(P.ESPUMA, CORCHO[0], CORCHO[1], azar(-90, 90), azar(-220, -80), azar(0.4, 0.7), azar(3, 6));
    });
    if (t > 4.6 && t < T_PICA && Math.random() < 3 * dt) this.ondas.push({ x: CORCHO[0], y: CORCHO[1] + 6, r: 4, v: 0.8 });
    this.una("pica", t > T_PICA, () => { temblar(6, 0.2); this.ondas.push({ x: CORCHO[0], y: CORCHO[1] + 6, r: 6, v: 1.2 }); });
    if (t > T_PICA && t < T_SACA && Math.random() < 20 * dt) p.nueva(P.ESPUMA, CORCHO[0] + azar(-14, 14), CORCHO[1], azar(-120, 120), azar(-260, -80), azar(0.3, 0.6), azar(3, 7));
    this.una("saca", t > T_SACA, () => {
      temblar(14, 0.35);
      for (let i = 0; i < 26; i++) p.nueva(P.GOTA, CORCHO[0] + azar(-14, 14), CORCHO[1], azar(-260, 160), azar(-520, -200), azar(0.6, 1.0), azar(3, 6));
      for (let i = 0; i < 18; i++) p.nueva(P.ESPUMA, CORCHO[0], CORCHO[1], azar(-160, 160), azar(-300, -100), azar(0.4, 0.8), azar(4, 8));
      this.ondas.push({ x: CORCHO[0], y: CORCHO[1] + 6, r: 8, v: 1.4 });
    });
    const L = this.lata(t, e.mR);
    if (L && Math.random() < 30 * dt) p.nueva(P.GOTA, L.x, L.y + 8, azar(-30, 30), azar(-20, 40), 0.6, azar(2.5, 4));
    this.una("coge", t > T_COGE, () => temblar(6, 0.15));
    this.una("abre", t > T_ABRE, () => {
      const q = aPant(e.mR, [e.R.manoI[0], e.R.manoI[1] - 16]);
      for (let i = 0; i < 16; i++) p.nueva(P.ESPUMA, q[0], q[1], azar(-90, 90), azar(-260, -80), azar(0.3, 0.6), azar(3, 7));
    });
    for (const o of this.ondas) { o.r += 60 * dt; o.v -= dt; }
    this.ondas = this.ondas.filter((o) => o.v > 0);
    for (const b of this.burbujas) { b.y -= b.v * dt; if (b.y < HOR + 4) { b.y = H + 10; b.x = azar(-40, W + 40); } }
    p.alfa = 1 - tramo(t, 9.6, 10.2);
    p.actualizar(dt);
  }
  pala(asa) { return [O[0] + (O[0] - asa[0]) * 2.0, O[1] + (O[1] - asa[1]) * 2.0]; }
  dibujar(g) {
    const t = this.t, e = this.estado(t), luz = this.luz(t);
    fondo(g, "#000");
    if (!this.fondo) this.fondo = fondoLago();
    g.save(); g.globalAlpha = luz; g.drawImage(this.fondo, -60, -60);
    // sol que se pone
    const sy = HOR - 40 + 70 * tramo(t, 0, 10.2);
    g.save(); g.beginPath(); g.rect(-60, -60, W + 120, HOR + 60); g.clip();
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.6 * luz; g.drawImage(BLOB2.oro, 700 - 160, sy - 160, 320, 320);
    g.globalCompositeOperation = "source-over"; g.globalAlpha = luz;
    const gs = g.createLinearGradient(0, sy - 58, 0, sy + 58);
    gs.addColorStop(0, "#fff3b0"); gs.addColorStop(1, "#ff9a3d");
    g.fillStyle = gs; g.beginPath(); g.arc(700, sy, 58, 0, 6.283); g.fill();
    g.restore();
    // reflejo del sol y espuma en el lago
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 * luz;
    for (let i = 0; i < 14; i++) { const y = HOR + 6 + i * 13, w = (110 - i * 5) * (0.8 + 0.2 * Math.sin(t * 3 + i)); g.fillStyle = "#fff6c8"; g.fillRect(700 - w / 2 + 6 * Math.sin(t * 2 + i), y, w, 3); }
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 0.55 * luz; g.strokeStyle = "#fffaf0"; g.lineWidth = 2;
    for (let i = 0; i < 9; i++) { const y = HOR + 20 + i * 30, x0 = ((i * 137 + t * 18) % (W + 200)) - 100; g.beginPath(); g.moveTo(x0, y); g.quadraticCurveTo(x0 + 40, y - 4, x0 + 80, y); g.stroke(); }
    g.globalAlpha = 0.5 * luz; g.strokeStyle = "rgba(255,250,230,.8)"; g.lineWidth = 1.2;
    for (const b of this.burbujas) { g.beginPath(); g.arc(b.x, b.y, b.r, 0, 6.283); g.stroke(); }
    g.globalAlpha = luz;
    // gaviota
    if (t > 2.0 && t < 4.6) {
      const u = tramo(t, 2.0, 4.6), x = lerp(-60, W + 60, u), y = 170 + 30 * Math.sin(u * 5), a = Math.sin(t * 11) * 8;
      g.strokeStyle = "#2a1a2a"; g.lineWidth = 3; g.lineCap = "round";
      g.beginPath(); g.moveTo(x - 22, y - a); g.quadraticCurveTo(x - 10, y - 10, x, y); g.quadraticCurveTo(x + 10, y - 10, x + 22, y - a); g.stroke();
    }
    // ondas
    g.strokeStyle = "rgba(255,250,230,.75)"; g.lineWidth = 2;
    for (const o of this.ondas) { g.globalAlpha = luz * Math.min(1, o.v); g.beginPath(); g.ellipse(o.x, o.y, o.r, o.r * 0.25, 0, 0, 6.283); g.stroke(); }
    g.globalAlpha = luz;
    // sedal y corcho
    const L = this.lata(t, e.mR);
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mR, e.R, t);
    if (this._punta) {
      const tip = aPant(e.mR, this._punta);
      let fin = [CORCHO[0], CORCHO[1] + (t > T_PICA && t < T_SACA ? 10 + 4 * Math.sin(t * 22) : 0)];
      if (t < T_CAE_CORCHO) {
        const u = tramo(t, T_LANZA, T_CAE_CORCHO);
        fin = t < T_LANZA ? [tip[0], tip[1] + 30] : [lerp(tip[0], CORCHO[0], u), lerp(tip[1], CORCHO[1], u) - 4 * 120 * u * (1 - u)];
      }
      if (L) fin = [L.x, L.y - 14];
      if (t >= T_COGE) fin = aPant(e.mR, [e.R.manoI[0], e.R.manoI[1] - 16]);
      g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(tip[0], tip[1]);
      const tenso = t > T_PICA && t < T_COGE;
      g.quadraticCurveTo((tip[0] + fin[0]) / 2 + (tenso ? 0 : 10), Math.max(tip[1], fin[1]) + (tenso ? 0 : 30), fin[0], fin[1]); g.stroke();
      if (!L && t < T_SACA) {
        g.fillStyle = "#e8262f"; g.beginPath(); g.arc(fin[0], fin[1] - 2, 7, Math.PI, 0); g.fill();
        g.fillStyle = "#fffdf5"; g.beginPath(); g.arc(fin[0], fin[1] - 2, 7, 0, Math.PI); g.fill();
        g.fillStyle = "#222"; g.fillRect(fin[0] - 1, fin[1] - 15, 2, 6);
      }
    }
    // la barca (tapa las piernas) y el agua por delante
    // reflejo oscuro de la barca en el lago
    g.save(); g.globalAlpha = 0.28 * luz; g.fillStyle = "#4a2200";
    g.beginPath(); g.ellipse(520, AGUA + 52, 230, 26, 0, 0, 6.283); g.fill(); g.restore();
    conMat(g, e.mB, () => {
      barca(g);
      // la parte hundida del casco se ve a través de la cerveza
      g.save(); g.beginPath(); g.moveTo(292, 452); g.quadraticCurveTo(510, 474, 748, 438); g.quadraticCurveTo(735, 500, 670, 540); g.lineTo(370, 540); g.quadraticCurveTo(310, 512, 292, 452); g.closePath(); g.clip();
      const ga = g.createLinearGradient(0, AGUA + 4, 0, 545);
      ga.addColorStop(0, "rgba(245,165,35,.6)"); ga.addColorStop(1, "rgba(200,110,10,.95)");
      g.fillStyle = ga; g.fillRect(280, AGUA + 4, 480, 50); g.restore();
    });
    g.fillStyle = "rgba(255,250,235,.9)";
    for (let x = 318; x < 724; x += 15) { g.beginPath(); g.arc(x + 3 * Math.sin(t * 2 + x), AGUA + 5, 4.5 + 1.5 * Math.sin(x + t * 3), Math.PI, 0); g.fill(); }
    // remo (por delante del casco)
    if (e.G.manoD) {
      const a0 = mezcla(e.asa, [O[0] + 70, O[1] - 14], e.kRemo), b = this.pala(a0);
      g.lineCap = "round"; g.strokeStyle = "#6e3f18"; g.lineWidth = 7; g.beginPath(); g.moveTo(a0[0], a0[1]); g.lineTo(b[0], b[1]); g.stroke();
      g.strokeStyle = "#c98a4a"; g.lineWidth = 3; g.beginPath(); g.moveTo(a0[0], a0[1]); g.lineTo(b[0], b[1]); g.stroke();
      g.save(); g.translate(b[0], b[1]); g.rotate(Math.atan2(b[1] - a0[1], b[0] - a0[0]));
      g.fillStyle = "#a8692f"; g.beginPath(); g.ellipse(4, 0, 22, 8, 0, 0, 6.283); g.fill(); g.restore();
    }
    // la lata volando
    if (L) { g.save(); g.translate(L.x, L.y); g.scale(ESC * 1.1, ESC * 1.1); dibujarLata(g, 0, 0, L.r, {}); g.restore(); }
    this.p.dibujar(g);
    g.restore();
    // ¡QUÉ PAZ!
    if (t > 8.15) {
      const d = t - 8.15, k = tramo(d, 0, 0.3), s = lerp(0.6, 1, eBack(k)) * (1 + 0.02 * Math.sin(d * 3));
      const spr = titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 2) * (1 - tramo(t, 9.6, 10.2)); g.translate(512, 102 + 4 * Math.sin(d * 2)); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = 1 - luz;
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${Math.min(1, a)})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00124", nombre: "Paseo en barca", crear: () => new Barca() });
})();
