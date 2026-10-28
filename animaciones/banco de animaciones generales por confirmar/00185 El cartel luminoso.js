"use strict";
/*
 * 00185 · EL CARTEL LUMINOSO
 *
 * Animación del banco. Empieza y acaba en negro.
 * De noche, el neón de la fachada parpadea (BZZT). Marcos sube por una escalera y Guillermo se la sujeta. Marcos toca
 * el «1» (¡ZAP!) y se caen el 1 y el 0: Guillermo suelta la escalera (que se tambalea) para cogerlos al vuelo y se
 * los lanza. Marcos los coloca… al revés: ¡TOP 01! Se miran. Los cambia de sitio, baja dos peldaños y el cartel se
 * enciende a tope: ¡TOP 10!
 */
(() => {
const ESC = 1.35;
const GLY = ["¡", "T", "O", "P", "1", "0", "!"];
const SX = [298, 362, 436, 506, 598, 664, 728], SY = 126;   // centro de cada letra
const BASE = [646, 575], TOPE = [616, 214];                // la escalera (centro abajo y arriba)
const XG = 566;
const T_SUBE = 0.6, T_ARRIBA = 2.0, T_ZAP = 2.3, T_CAE = 2.45, T_COGE1 = 2.95, T_COGE0 = 3.15, T_LANZA0 = 3.5, T_LANZA1 = 3.8, D_LANZA = 0.4;
const T_PON0 = 4.45, T_PON1 = 4.7, T_01 = 4.85, T_CAMBIO = 5.75, D_CAMBIO = 0.45, T_BAJA = 6.3, T_10 = 6.55, T_APAGA = 9.35, DUR = 9.9;
const PIE_ARRIBA = 336, PIE_FINAL = 500;
const CT = cacheTexto();
const aU = (m, q) => { const i = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [i.x, i.y]; };
const xEsc = (y) => lerp(BASE[0], TOPE[0], (BASE[1] - y) / (BASE[1] - TOPE[1]));

class Cartel extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(360);
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** Letra de neón (encendida o apagada), una vez. */
  letra(i, on) {
    const k = i + (on ? "on" : "off");
    if (CT.has(k)) return CT.get(k);
    const c = lienzoNuevo(130, 190), g = c.getContext("2d");
    if (on) txt(g, GLY[i], 65, 150, { tam: 140, peso: 900, fam: FD, color: "#fff0f6", borde: "#ff3d84", bordeAncho: 7, glow: "#ff3d84", glowTam: 30 });
    else txt(g, GLY[i], 65, 150, { tam: 140, peso: 900, fam: FD, color: "#3a1a26", borde: "#5e2c40", bordeAncho: 5 });
    CT.set(k, c);
    return c;
  }
  /** Bamboleo de la escalera mientras Guillermo no la sujeta. */
  bamboleo(t) { return t > T_CAE && t < T_LANZA1 + 0.5 ? 0.07 * Math.sin((t - T_CAE) * 13) * Math.sin(tramo(t, T_CAE, T_LANZA1 + 0.5) * Math.PI) : 0; }
  /** Altura de los pies de Marcos en la escalera. */
  pieM(t) {
    if (t < T_SUBE) return 575;
    if (t < T_ARRIBA) { const u = tramo(t, T_SUBE, T_ARRIBA), n = 5, s = Math.floor(u * n), f = eInOut((u * n) % 1); return 575 - ((s + f) / n) * (575 - PIE_ARRIBA); }
    if (t < T_BAJA) return PIE_ARRIBA;
    return lerp(PIE_ARRIBA, PIE_FINAL, eInOut(tramo(t, T_BAJA, T_BAJA + 0.35)));
  }
  matM(t) {
    const y = this.pieM(t), b = this.bamboleo(t);
    let m = matAv(xEsc(y) + 6, y, ESC);
    if (b) m = new DOMMatrix().translate(BASE[0], BASE[1]).rotate((b * 180) / Math.PI).translate(-BASE[0], -BASE[1]).multiply(m);
    return m;
  }
  /** Dónde está cada una de las dos letras que se caen (1 → índice 4, 0 → índice 5): { x, y, rot, slot }. */
  suelta(i, t, e) {
    const manoG = e ? e.G : null, manoM = e ? e.M : null;
    const arco = (a, b, k, alto, giros) => ({ x: lerp(a[0], b[0], k), y: lerp(a[1], b[1], k) - 4 * alto * k * (1 - k), rot: giros * 6.283 * k });
    const coge = i === 4 ? T_COGE1 : T_COGE0, lanza = i === 4 ? T_LANZA1 : T_LANZA0, pon = i === 4 ? T_PON1 : T_PON0;
    const enG = i === 4 ? (manoG && manoG.D) : (manoG && manoG.I);
    const enM = i === 4 ? (manoM && manoM.D) : (manoM && manoM.I);
    // al revés: el 0 va al hueco del 1 (4) y el 1 al hueco del 0 (5)
    const malo = i === 4 ? 5 : 4;
    if (t < T_CAE) return { x: SX[i], y: SY, rot: 0, slot: i };
    if (t < coge) { const k = tramo(t, T_CAE, coge); return Object.assign(arco([SX[i], SY], enG || [600, 380], k, -40, i === 4 ? 1 : -1), { slot: -1 }); }
    if (t < lanza) return { x: enG[0], y: enG[1] - 30, rot: 0.2 * (i === 4 ? 1 : -1), slot: -1 };
    if (t < lanza + D_LANZA) { const k = tramo(t, lanza, lanza + D_LANZA); return Object.assign(arco([enG[0], enG[1] - 30], [enM[0], enM[1] - 34], k, 60, i === 4 ? -1 : 1), { slot: -1 }); }
    if (t < pon) { const k = eInOut(tramo(t, lanza + D_LANZA + 0.1, pon)); return { x: lerp(enM[0], SX[malo], k), y: lerp(enM[1] - 34, SY, k), rot: 0, slot: -1 }; }
    if (t < T_CAMBIO) return { x: SX[malo], y: SY, rot: 0, slot: malo };
    if (t < T_CAMBIO + D_CAMBIO) { const k = eInOut(tramo(t, T_CAMBIO, T_CAMBIO + D_CAMBIO)); return Object.assign(arco([SX[malo], SY], [SX[i], SY], k, i === 4 ? 70 : -30, 0), { slot: -1 }); }
    return { x: SX[i], y: SY, rot: 0, slot: i };
  }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0.1, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "marcos", cara: "guino", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    const mG = matAv(XG, PIES, ESC), mM = this.matM(t);
    const RAIL = (y) => [xEsc(y) - 26, y];
    // ---- Guillermo sujeta la escalera, mira arriba
    const sujeta = !(t > T_CAE && t < T_LANZA1 + 0.35);
    G.cara = "sonrisa"; G.rc = -0.05;
    if (sujeta && t > 0.3) { G.manoD = aU(mG, RAIL(470)); G.rc = 0.12; G.cara = t < T_SUBE ? "sorpresa" : t < T_ZAP ? "guino" : "sonrisa"; }
    // coge las letras al vuelo y se las lanza a Marcos
    const cogeD = [100, 96], cogeI = [-22, 96];
    if (!sujeta) {
      G.cara = t < T_COGE0 ? "sorpresa" : "risa"; G.rc = 0.08;
      G.manoD = mezcla([70, 158], cogeD, eOut(tramo(t, T_CAE, T_CAE + 0.25)));
      G.manoI = mezcla([9, 160], cogeI, eOut(tramo(t, T_CAE + 0.1, T_CAE + 0.35)));
      if (t > T_LANZA0 - 0.12) G.manoI = mezcla(cogeI, [10, 20], Math.sin(tramo(t, T_LANZA0 - 0.12, T_LANZA0 + 0.15) * Math.PI));
      if (t > T_LANZA1 - 0.12) G.manoD = mezcla(cogeD, [80, 20], Math.sin(tramo(t, T_LANZA1 - 0.12, T_LANZA1 + 0.15) * Math.PI));
    }
    if (t > T_01 + 0.2 && t < T_CAMBIO) { G.cara = "borracho"; G.brazoIDelante = true; G.manoI = [30, 34 + 3 * Math.sin(t * 18)]; G.rc = 0.16; }
    if (t > T_10) {
      // ¡bien!: un brazo arriba, el otro sujeta
      G.cara = t > 8.4 ? "guino" : "risa"; G.rc = 0.12;
      G.manoI = mezcla([9, 160], [-16, 26 + 6 * Math.sin(t * 9)], eOut(tramo(t, T_10, T_10 + 0.25)));
    }
    // ---- Marcos: sube, toca, recoge y coloca
    const y = this.pieM(t);
    if (t > T_SUBE && t < T_ARRIBA) {
      const u = (t - T_SUBE) * 7.1;
      M.manoD = aU(mM, [xEsc(y - 250) + 26, y - 250 - 18 * Math.max(0, Math.sin(u))]);
      M.manoI = aU(mM, [xEsc(y - 250) - 26, y - 250 - 18 * Math.max(0, -Math.sin(u))]);
      M.brazoIDelante = true;
      M.piernaI = [-10 * Math.max(0, Math.sin(u)), 0]; M.piernaD = [-10 * Math.max(0, -Math.sin(u)), 0];
      M.cara = "guino"; M.rc = -0.05;
    }
    const enM = { D: aPant(mM, [80, 52]), I: aPant(mM, [-4, 50]) };
    if (t >= T_ARRIBA) {
      M.manoD = aU(mM, [xEsc(y - 200) + 26, y - 200]); M.manoI = aU(mM, [xEsc(y - 200) - 26, y - 200]); M.brazoIDelante = true;
      M.cara = "sonrisa"; M.rc = -0.1;
      // toca el 1: ¡ZAP!
      if (t > T_ARRIBA + 0.05 && t < T_CAE + 0.2) { M.manoD = mezcla(M.manoD, aU(mM, [SX[4] + 10, SY + 30]), eOut(tramo(t, T_ARRIBA + 0.05, T_ZAP))); M.brazoIDelante = false; }
      if (t > T_ZAP) { M.cara = "sorpresa"; M.puntas = 1 - tramo(t, T_ZAP + 1.2, T_ZAP + 2); }
      if (t > T_CAE) {
        // se agarra fuerte mientras la escalera se mueve
        M.manoD = aU(mM, [xEsc(y - 200) + 26, y - 200]); M.cara = t < T_LANZA0 - 0.1 ? "sorpresa" : "risa";
      }
      // recoge las letras al vuelo
      if (t > T_LANZA0 && t < T_PON0 + 0.15) {
        M.manoI = mezcla(M.manoI, [-4, 50], eOut(tramo(t, T_LANZA0, T_LANZA0 + D_LANZA)));
        if (t > T_LANZA0 + D_LANZA + 0.1) M.manoI = mezcla([-4, 50], aU(mM, [SX[4], SY + 40]), eInOut(tramo(t, T_LANZA0 + D_LANZA + 0.1, T_PON0)));
        M.brazoIDelante = true;
      }
      if (t > T_LANZA1 && t < T_PON1 + 0.15) {
        M.manoD = mezcla(M.manoD, [80, 52], eOut(tramo(t, T_LANZA1, T_LANZA1 + D_LANZA)));
        if (t > T_LANZA1 + D_LANZA + 0.1) M.manoD = mezcla([80, 52], aU(mM, [SX[5], SY + 40]), eInOut(tramo(t, T_LANZA1 + D_LANZA + 0.1, T_PON1)));
        M.cara = "guino";
      }
      // ¿01?: se miran; se rasca la cabeza
      if (t > T_01 + 0.15 && t < T_CAMBIO) { M.cara = t < T_01 + 0.6 ? "sorpresa" : "borracho"; M.rc = -0.2; M.manoI = [30, 30]; M.brazoIDelante = true; }
      // los cambia (cruzando los brazos)
      if (t >= T_CAMBIO - 0.1 && t < T_BAJA) {
        const k = tramo(t, T_CAMBIO, T_CAMBIO + D_CAMBIO);
        M.manoI = aU(mM, [lerp(SX[4], SX[5], eInOut(k)), SY + 40 - Math.sin(k * Math.PI) * 30]);
        M.manoD = aU(mM, [lerp(SX[5], SX[4], eInOut(k)), SY + 40 + Math.sin(k * Math.PI) * 10]);
        M.brazoIDelante = true; M.cara = "guino";
      }
      if (t >= T_BAJA) {
        M.manoD = aU(mM, [xEsc(y - 200) + 26, y - 200]); M.manoI = aU(mM, [xEsc(y - 200) - 26, y - 200]); M.brazoIDelante = true;
        if (t > T_BAJA && t < T_BAJA + 0.35) { const s = Math.sin((t - T_BAJA) * 18); M.piernaI = [-8 * Math.max(0, s), 0]; M.piernaD = [-8 * Math.max(0, -s), 0]; }
        if (t > T_10) {
          M.cara = t > 8.6 ? "guino" : "risa"; M.rc = 0.1;
          M.manoD = mezcla(M.manoD, [86, 18 + 6 * Math.sin(t * 9 + 1)], eOut(tramo(t, T_10, T_10 + 0.25))); M.brazoIDelante = true;
        }
      }
    }
    return { G, M, mG, mM, manos: { G: { D: aPant(mG, [100, 96]), I: aPant(mG, [-22, 96]) }, M: enM } };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("zap", t > T_ZAP, () => {
      temblar(10, 0.25);
      p.nueva(P.DESTELLO, SX[4], SY + 20, 0, 0, 0.3, 140);
      for (let k = 0; k < 20; k++) { const a = azar(0, 6.283), v = azar(120, 380); p.nueva(P.ELECTRICA, SX[4], SY + 20, Math.cos(a) * v, Math.sin(a) * v, azar(0.2, 0.5), azar(10, 18)); }
      for (let k = 0; k < 14; k++) { const a = azar(0, 6.283), v = azar(120, 320); p.nueva(P.CHISPA, SX[4], SY + 20, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(5, 8)); }
    });
    this.una("cae", t > T_CAE, () => temblar(6, 0.2));
    for (const [k, tt] of [["c1", T_COGE1], ["c0", T_COGE0]]) this.una(k, t > tt, () => temblar(5, 0.12));
    this.una("01", t > T_01, () => { temblar(6, 0.2); for (let k = 0; k < 10; k++) p.nueva(P.ELECTRICA, azar(560, 700), SY + azar(-40, 40), azar(-100, 100), azar(-100, 100), azar(0.2, 0.4), azar(10, 16)); });
    this.una("10", t > T_10, () => {
      temblar(18, 0.45);
      for (let k = 0; k < 30; k++) { const a = azar(0, 6.283), v = azar(150, 420); p.nueva(P.DESTELLO, 512 + Math.cos(a) * 200, SY + Math.sin(a) * 50, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(14, 24)); }
      for (let k = 0; k < 80; k++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-80, -10), azar(-40, 40), azar(0, 120), azar(2.2, 3.2), azar(9, 14), k % 5);
    });
    // chispas del neón estropeado
    if (t < T_ZAP && Math.random() < 3 * dt) p.nueva(P.ELECTRICA, SX[4 + (Math.random() < 0.5 ? 1 : 0)] + azar(-20, 20), SY + azar(-40, 40), azar(-60, 60), azar(-60, 60), 0.25, 12);
    p.suelo = () => PIES - 2;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  fondoFijo() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, "#050816"); gr.addColorStop(1, "#141a33");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const r = semilla(8);
    g.fillStyle = "#fff";
    for (let i = 0; i < 40; i++) { g.globalAlpha = 0.3 + r() * 0.6; g.fillRect(r() * W, r() * 60, 2, 2); }
    g.globalAlpha = 1;
    // fachada de ladrillo
    g.fillStyle = "#2a1c1e"; g.fillRect(150, 30, 724, 560);
    g.fillStyle = "rgba(110,50,40,.35)";
    for (let y = 30; y < 575; y += 26) for (let x = (y / 26) % 2 ? 124 : 150; x < 874; x += 52) { rectR(g, Math.max(150, x + 2), y + 2, 48, 22, 2); g.fill(); }
    // puerta y escaparate con luz
    g.fillStyle = "#3a2010"; g.fillRect(200, 300, 300, 275);
    const gv = g.createLinearGradient(0, 310, 0, 560); gv.addColorStop(0, "#5a3a22"); gv.addColorStop(1, "#2a160a");
    g.fillStyle = gv; g.fillRect(212, 312, 276, 263);
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.4; g.drawImage(BLOB2.oro, 200, 300, 300, 280); g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    g.fillStyle = "#3a2010"; g.fillRect(346, 312, 8, 263);
    // tablero del cartel
    g.fillStyle = "#0e0a12"; rectR(g, 252, 46, 520, 158, 12); g.fill();
    g.strokeStyle = "#3a3f46"; g.lineWidth = 6; rectR(g, 252, 46, 520, 158, 12); g.stroke();
    g.strokeStyle = "#555c64"; g.lineWidth = 3; g.beginPath(); g.moveTo(300, 46); g.lineTo(300, 30); g.moveTo(724, 46); g.lineTo(724, 30); g.stroke();
    // acera
    const gs = g.createLinearGradient(0, 568, 0, H); gs.addColorStop(0, "#3a3a44"); gs.addColorStop(1, "#16161c");
    g.fillStyle = gs; g.fillRect(0, 568, W, 40);
    return (this.cF = c);
  }
  escalera(g) {
    const metal = "#c9d0d6";
    g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = 10; g.lineCap = "round";
    g.beginPath(); g.moveTo(BASE[0] - 30, BASE[1]); g.lineTo(TOPE[0] - 24, TOPE[1]); g.moveTo(BASE[0] + 30, BASE[1]); g.lineTo(TOPE[0] + 24, TOPE[1]); g.stroke();
    g.strokeStyle = metal; g.lineWidth = 7;
    g.beginPath(); g.moveTo(BASE[0] - 30, BASE[1]); g.lineTo(TOPE[0] - 24, TOPE[1]); g.moveTo(BASE[0] + 30, BASE[1]); g.lineTo(TOPE[0] + 24, TOPE[1]); g.stroke();
    g.lineWidth = 5;
    for (let y = BASE[1] - 34; y > TOPE[1] + 10; y -= 48) { const x = xEsc(y), w = lerp(30, 24, (BASE[1] - y) / (BASE[1] - TOPE[1])); g.beginPath(); g.moveTo(x - w, y); g.lineTo(x + w, y); g.stroke(); }
    g.fillStyle = "#2a2e33"; g.fillRect(BASE[0] - 38, BASE[1] - 6, 16, 8); g.fillRect(BASE[0] + 22, BASE[1] - 6, 16, 8);
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    g.drawImage(this.fondoFijo(), 0, 0);
    // el cartel: qué letras están encendidas
    const sueltas = [4, 5].map((i) => this.suelta(i, t, { G: e.manos.G, M: e.manos.M }));
    const fuerte = t > T_10 ? 1 : 0;
    const enc = (i) => {
      if (t < T_ZAP) { const f = Math.sin(t * (i >= 4 ? 37 : 11) + i * 2.3) + Math.sin(t * 23 + i); return i >= 4 ? f > 0.9 : f > -1.2; }
      if (t < T_01) return i < 4 || i === 6;
      return true;
    };
    // resplandor del cartel
    const brilloCartel = (t < T_ZAP ? 0.35 : t < T_01 ? 0.4 : 0.55) + 0.5 * fuerte * (0.85 + 0.15 * Math.sin(t * 6));
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = a * brilloCartel * 0.6;
    g.drawImage(BLOB.rojo, 180, -40, 660, 330); g.restore();
    for (let i = 0; i < GLY.length; i++) {
      if (i >= 4) continue;
      const c = this.letra(i, enc(i));
      g.drawImage(c, SX[i] - 65, SY - 105);
    }
    if (t < T_ZAP || (t >= T_ZAP && t < T_CAE)) {
      for (const i of [4, 5]) g.drawImage(this.letra(i, t < T_ZAP ? enc(i) : false), SX[i] - 65, SY - 105);
    }
    g.drawImage(this.letra(6, enc(6)), SX[6] - 65, SY - 105);
    // escalera y Marcos (se tambalean juntos)
    const b = this.bamboleo(t);
    g.save(); g.translate(BASE[0], BASE[1]); g.rotate(b); g.translate(-BASE[0], -BASE[1]);
    this.escalera(g);
    g.restore();
    pintarAvatar(g, e.mM, e.M, t);
    pintarAvatar(g, e.mG, e.G, t);
    // las dos letras sueltas (cayendo, en las manos o puestas)
    if (t >= T_CAE) {
      for (let j = 0; j < 2; j++) {
        const i = 4 + j, s = sueltas[j], on = s.slot >= 0 && t > T_01;
        const c = this.letra(i, on);
        const esc = s.slot >= 0 ? 1 : 0.62;
        g.save(); g.translate(s.x, s.y); g.rotate(s.rot); g.scale(esc, esc); g.drawImage(c, -65, -105); g.restore();
      }
    }
    // destello final: el cartel late
    if (fuerte) {
      const k = tramo(t, T_10, T_10 + 0.3) * (1 - tramo(t, T_APAGA - 0.3, T_APAGA));
      for (let i = 0; i < 4; i++) { const ph = (t * 1.1 + i * 0.25) % 1; brillo(g, 280 + i * 150, 70 + (i % 2) * 90, 30, k * Math.sin(ph * Math.PI)); }
    }
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
    ono("BZZT…", 140, 120, 0.4, 0.8, 42, "#ff9cc0", "#3a0418", -0.1);
    ono("BZZT…", 880, 260, 1.4, 0.7, 38, "#ff9cc0", "#3a0418", 0.1);
    ono("¡ZAP!", 860, 150, T_ZAP, 0.6, 66, "#2fe3e8", "#06303a", 0.12);
    ono("¡AY!", 420, 300, T_CAE + 0.1, 0.5, 46, "#fffdf5", "#1b1b1b", -0.1);
    ono("¡HOP!", 480, 380, T_LANZA0, 0.4, 40, "#ffd34d", "#3a2400", -0.1);
    ono("¡HOP!", 480, 380, T_LANZA1, 0.4, 40, "#ffd34d", "#3a2400", 0.1);
    ono("¡ZAS!", 860, 220, T_CAMBIO + 0.1, 0.5, 56, "#ffd34d", "#3a2400", 0.1);
    // ¿01? de Guillermo
    const kb = tramo(t, T_01 + 0.25, T_01 + 0.45) * (1 - tramo(t, T_CAMBIO - 0.15, T_CAMBIO));
    if (kb > 0) { g.save(); g.globalAlpha = a; bocadillo(g, 400, 300, "¿01?", 520, 350, kb, 42); g.restore(); }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00185", nombre: "El cartel luminoso", crear: () => new Cartel() });
})();
