"use strict";
/*
 * 00183 · LA PERSIANA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Amanece. La persiana metálica del bar está atascada a media altura. Guillermo tira solo (¡ÑIEC!) y nada; Marcos,
 * bostezando, se une y tiran los dos (¡HOP!, ¡HOP!, ¡HOP!)… hasta que sale disparada hacia arriba (¡ZAS!): Marcos
 * cae de culo y Guillermo sube con ella y se queda colgado. Se encienden las luces del bar: ¡ABRIMOS!
 */
(() => {
const ESC = 1.4;
const SX0 = 236, SX1 = 788, CAJA0 = 84, CAJA1 = 130, ARRIBA = 138, ATASCO = 372, ASA = 32;   // la persiana
const XG = 430, XM0 = 690, XM = 598;
const T_G1 = 0.9, T_VIENE = 1.95, T_DOS = 2.35, T_ZAS = 3.75, T_TOPE = 4.0, T_LUZ = 4.15, T_LEVANTA = 5.0, T_SALUDA = 6.9, T_APAGA = 8.75, DUR = 9.3;
const TIRONES_G = [1.05, 1.5], TIRONES = [2.55, 2.95, 3.35];
const CT = cacheTexto();
const aU = (X, Y, q) => [(q[0] - X) / ESC + 39, (q[1] - Y) / ESC + 232];

class Persiana extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(320);
  }
  luz() { return tramo(this.t, 0, 0.6) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** Borde de abajo de la persiana. */
  bajo(t) {
    let y = ATASCO;
    for (const h of TIRONES_G.concat(TIRONES)) { const u = tramo(t, h, h + 0.32); y -= Math.sin(u * Math.PI) * (h > 2.5 ? 10 : 5); }
    if (t > T_ZAS) {
      const u = tramo(t, T_ZAS, T_TOPE);
      y = lerp(ATASCO, ARRIBA, eIn(u));
      if (t > T_TOPE) y = ARRIBA + 8 * Math.exp(-(t - T_TOPE) * 6) * Math.sin((t - T_TOPE) * 30);
    }
    return y;
  }
  colgado(t) { return this.bajo(t) + ASA + (232 - 12) * ESC < PIES; }
  poses() {
    const t = this.t, by = this.bajo(t);
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "marcos", cara: "dormido", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let mG, mM;
    // ---- Guillermo
    const tira = (h0) => { for (const h of TIRONES_G.concat(TIRONES)) if (t > h - 0.05 && t < h + 0.35) return Math.sin(tramo(t, h - 0.05, h + 0.35) * Math.PI); return 0; };
    if (this.colgado(t)) {
      // colgado de una mano: se balancea, patalea, agita la otra
      const d = t - T_ZAS;
      let sw = -0.24 + 0.2 * Math.sin(d * 3.2) * Math.exp(-Math.max(0, d - 0.5) * 0.35);
      G.manoD = [76, 12];
      G.manoI = [-14 + 8 * Math.sin(t * 11), 64 + 16 * Math.sin(t * 13)];
      const s = Math.sin(t * 9);
      G.piernaI = [-8 * Math.max(0, s), 0.12 * s]; G.piernaD = [-8 * Math.max(0, -s), -0.12 * s];
      G.cara = t < T_LUZ ? "sorpresa" : t < 5.6 ? (Math.sin(t * 3) > 0 ? "sorpresa" : "borracho") : "risa";
      G.puntas = 0.8 * (1 - tramo(t, 4.5, 5.2));
      // intenta agarrarse con la otra mano y no llega
      if (t > 6.0 && t < 6.8) { const k = Math.sin(tramo(t, 6.0, 6.8) * Math.PI); G.manoI = mezcla(G.manoI, [56, 18], k); G.brazoIDelante = k > 0.3; G.cara = "dormido"; }
      // al final, saluda
      if (t > T_SALUDA) {
        const k = eOut(tramo(t, T_SALUDA, T_SALUDA + 0.3));
        G.manoI = mezcla(G.manoI, [-18, 44 + 8 * Math.sin(t * 14)], k); G.cara = "guino";
      }
      mG = matAv(XG + 26, by + ASA + 4, ESC, sw, 1, 1, [76, 12]);
    } else {
      let hx = 0;
      const enBarra = t > T_G1 - 0.3;
      if (enBarra) {
        const k = eInOut(tramo(t, T_G1 - 0.3, T_G1));
        const tt = tira();
        G.manoD = mezcla([70, 158], aU(XG, PIES, [XG + 26, by + ASA + 4]), k); G.manoI = mezcla([9, 160], aU(XG, PIES, [XG - 26, by + ASA + 4]), k);
        G.brazoIDelante = false;
        G.cara = tt > 0.2 ? "dormido" : t < T_VIENE ? "sonrisa" : "guino";
        G.piernaI = [0, 0.15 * tt]; G.piernaD = [0, -0.15 * tt];
        hx = 0;
        G.puntas = t > T_DOS ? 0.4 * tt : 0;
        if (t > T_ZAS) { G.cara = "sorpresa"; G.puntas = 1; }
        if (t > T_VIENE - 0.4 && t < T_DOS && tt < 0.1) { G.rc = 0.15; G.cara = "guino"; }
        mG = matAv(XG + hx, PIES, ESC, 0, 1, 1 - 0.04 * tt);
      } else {
        G.cara = "sonrisa"; G.rc = 0.06;
        // se frota las manos
        const s = Math.sin(t * 18); G.brazoIDelante = true; G.manoD = [46 + 4 * s, 118]; G.manoI = [30 - 4 * s, 118];
        mG = matAv(XG, PIES, ESC);
      }
    }
    // ---- Marcos: bosteza, viene a ayudar, tira y cae de culo
    let xm = XM0, sy = 1, dyM = 0, giroM = 0;
    if (t < T_VIENE) {
      M.cara = "dormido"; M.brazoIDelante = true; M.manoD = [38, 66]; M.rc = -0.08 + 0.05 * Math.sin(t * 2);
      if (t > 1.2) { M.cara = "sorpresa"; M.manoD = [67, 152]; M.rc = -0.12; }
    } else if (t < T_ZAS) {
      xm = lerp(XM0, XM, eInOut(tramo(t, T_VIENE, T_DOS)));
      if (t < T_DOS) { const an = andar((t - T_VIENE) * 14, 0.8); M.piernaI = an.piernaI; M.piernaD = an.piernaD; dyM = an.bote; }
      const k = eInOut(tramo(t, T_DOS - 0.15, T_DOS + 0.1)), tt = tira();
      M.manoI = mezcla([6, 152], aU(xm, PIES, [XM - 26, this.bajo(t) + ASA + 4]), k); M.manoD = mezcla([67, 152], aU(xm, PIES, [XM + 26, this.bajo(t) + ASA + 4]), k);
      M.cara = tt > 0.2 ? "dormido" : "guino"; M.rc = -0.06;
      M.piernaI = [0, 0.15 * tt]; M.piernaD = [0, -0.15 * tt];
      M.puntas = 0.4 * tt;
      sy = 1 - 0.04 * tt;
    } else {
      // ¡zas!: se le escapa y cae sentado
      const u = tramo(t, T_ZAS, T_ZAS + 0.45);
      xm = lerp(XM, XM + 60, eOut(u));
      dyM = -Math.sin(u * Math.PI) * 50;
      sy = lerp(1, 0.66, eIn(tramo(t, T_ZAS + 0.25, T_ZAS + 0.45)));
      giroM = 0.15 * Math.sin(u * Math.PI);
      M.cara = "sorpresa"; M.manoD = [92, 70]; M.manoI = [-18, 70];
      M.piernaI = [-16 * (u > 0.8 ? 1 : 0), 0.6 * u]; M.piernaD = [-16 * (u > 0.8 ? 1 : 0), -0.6 * u];
      M.rc = -0.18;
      if (t > T_ZAS + 0.5) { M.cara = "risa"; const s = Math.sin(t * 16); M.manoD = [52, 128 + 4 * s]; M.manoI = [22, 128 - 4 * s]; M.brazoIDelante = true; }
      if (t > T_LEVANTA) {
        // se levanta, se ríe señalando arriba
        const k = eInOut(tramo(t, T_LEVANTA, T_LEVANTA + 0.35));
        sy = lerp(0.66, 1, k); M.piernaI = [0, 0]; M.piernaD = [0, 0];
        M.brazoIDelante = false;
        if (t > T_LEVANTA + 0.35) {
          M.manoI = [-14, 20]; M.manoD = [67, 152]; M.cara = "risa"; M.rc = -0.2;
          dyM = -Math.abs(Math.sin(t * 14)) * 5;
        }
        if (t > T_SALUDA + 0.2) {
          // ¡pasen, pasen!: brazos abiertos
          const k2 = eOut(tramo(t, T_SALUDA + 0.2, T_SALUDA + 0.5));
          M.manoI = mezcla([-14, 20], [-22, 84], k2); M.manoD = [92, 84]; M.cara = t > 7.9 ? "guino" : "risa"; M.rc = -0.08; dyM = 0;
        }
      }
    }
    mM = matAv(xm, PIES + dyM, ESC, giroM, 1, sy);
    return [{ pose: M, m: mM }, { pose: G, m: mG }];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    TIRONES_G.concat(TIRONES).forEach((h, i) => this.una("t" + i, t > h + 0.12, () => {
      temblar(h > 2.5 ? 6 : 4, 0.15);
      for (let k = 0; k < 6; k++) p.nueva(P.POLVO, azar(SX0, SX1), this.bajo(t) + 6, azar(-40, 40), azar(-10, 30), azar(0.4, 0.8), azar(16, 26));
    }));
    this.una("zas", t > T_ZAS, () => temblar(10, 0.3));
    this.una("tope", t > T_TOPE, () => {
      temblar(20, 0.45);
      for (let k = 0; k < 20; k++) p.nueva(P.POLVO, azar(SX0, SX1), CAJA1, azar(-120, 120), azar(-40, 60), azar(0.5, 0.9), azar(20, 36));
      for (let k = 0; k < 14; k++) { const a = azar(0, Math.PI), v = azar(120, 300); p.nueva(P.CHISPA, azar(SX0 + 40, SX1 - 40), CAJA1, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(5, 8)); }
    });
    this.una("culo", t > T_ZAS + 0.45, () => { temblar(8, 0.2); for (let k = 0; k < 10; k++) p.nueva(P.POLVO, XM + 60 + azar(-40, 40), 568, azar(-120, 120), azar(-40, 0), azar(0.4, 0.7), azar(16, 26)); });
    this.una("luz", t > T_LUZ, () => {
      for (let k = 0; k < 60; k++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-80, -10), azar(-40, 40), azar(0, 120), azar(2.2, 3.2), azar(9, 14), k % 5);
    });
    p.suelo = () => PIES - 2;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  fondoFijo() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    // cielo al amanecer
    const gr = g.createLinearGradient(0, 0, 0, 520);
    gr.addColorStop(0, "#14204a"); gr.addColorStop(0.55, "#7a4a8a"); gr.addColorStop(0.85, "#ff9a5a"); gr.addColorStop(1, "#ffd28a");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.9; g.drawImage(BLOB2.oro, 840, 300, 260, 260); g.drawImage(BLOB2.oroClaro, 905, 365, 130, 130);
    g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    // edificio
    g.fillStyle = "#3a2a2a"; g.fillRect(150, 30, 724, 560);
    g.fillStyle = "rgba(120,60,40,.35)";
    for (let y = 30; y < 575; y += 26) for (let x = (y / 26) % 2 ? 137 : 150; x < 874; x += 52) { rectR(g, Math.max(150, x + 2), y + 2, 48, 22, 2); g.fill(); }
    // rótulo del bar
    g.fillStyle = "#1d4a2c"; rectR(g, 420, 40, 184, 32, 6); g.fill();
    g.strokeStyle = "#ffd34d"; g.lineWidth = 2.5; rectR(g, 424, 44, 176, 24, 4); g.stroke();
    txt(g, "BAR", 512, 65, { tam: 24, peso: 900, fam: FD, color: "#ffd34d", esp: 8 });
    // acera
    const gs = g.createLinearGradient(0, 560, 0, H); gs.addColorStop(0, "#5a4a4a"); gs.addColorStop(1, "#2a2020");
    g.fillStyle = gs; g.fillRect(0, 568, W, 40);
    g.fillStyle = "rgba(255,200,150,.2)"; g.fillRect(0, 568, W, 2);
    // caja de la persiana
    const gc = g.createLinearGradient(0, CAJA0, 0, CAJA1);
    gc.addColorStop(0, "#9aa3ab"); gc.addColorStop(0.5, "#c9d0d6"); gc.addColorStop(1, "#5d656e");
    g.fillStyle = gc; g.fillRect(SX0 - 10, CAJA0, SX1 - SX0 + 20, CAJA1 - CAJA0);
    g.fillStyle = "rgba(0,0,0,.3)"; g.fillRect(SX0 - 10, CAJA1 - 4, SX1 - SX0 + 20, 4);
    // guías laterales
    g.fillStyle = "#6a727a"; g.fillRect(SX0 - 12, CAJA1, 12, 575 - CAJA1); g.fillRect(SX1, CAJA1, 12, 575 - CAJA1);
    return (this.cF = c);
  }
  /** El interior del bar (detrás de la persiana). */
  interior() {
    if (this.cI) return this.cI;
    const w = SX1 - SX0, h = 575 - CAJA1, c = lienzoNuevo(w, h), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "#5a3a22"); gr.addColorStop(1, "#2a160a");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5; g.drawImage(BLOB2.oro, -60, -40, w + 120, h); g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    const cols = ["#2f6b3a", "#7a3b16", "#3b4d7a", "#6b5a1a", "#6a1e3a"];
    for (const yb of [150, 236]) {
      g.fillStyle = "#3a2010"; g.fillRect(30, yb, w - 60, 7);
      for (let i = 0; i < 16; i++) { const x = 52 + i * 31; g.fillStyle = cols[(i + yb) % cols.length]; rectR(g, x - 8, yb - 44, 16, 44, 4); g.fill(); g.fillRect(x - 3, yb - 56, 6, 13); }
    }
    // lámparas
    for (const x of [130, 276, 422]) {
      g.strokeStyle = "#222"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 40); g.stroke();
      g.fillStyle = "#1d4a2c"; g.beginPath(); g.moveTo(x - 22, 58); g.lineTo(x + 22, 58); g.lineTo(x + 10, 40); g.lineTo(x - 10, 40); g.closePath(); g.fill();
      g.globalCompositeOperation = "lighter"; g.drawImage(BLOB.amarillo, x - 50, 30, 100, 90); g.globalCompositeOperation = "source-over";
    }
    // barra
    g.fillStyle = "#6a3c1c"; g.fillRect(0, h - 120, w, 120);
    g.fillStyle = "#8a5426"; g.fillRect(0, h - 128, w, 12);
    g.fillStyle = "rgba(255,220,170,.4)"; g.fillRect(0, h - 128, w, 3);
    return (this.cI = c);
  }
  /** Textura de lamas (una vez). */
  lamas() {
    if (this.cL) return this.cL;
    const w = SX1 - SX0, h = 575 - CAJA1 + 20, c = lienzoNuevo(w, h), g = c.getContext("2d");
    for (let y = 0; y < h; y += 14) {
      const gr = g.createLinearGradient(0, y, 0, y + 14);
      gr.addColorStop(0, "#d6dce1"); gr.addColorStop(0.5, "#a6afb7"); gr.addColorStop(1, "#5d656e");
      g.fillStyle = gr; g.fillRect(0, y, w, 14);
    }
    g.fillStyle = "rgba(0,0,0,.06)"; for (let x = 0; x < w; x += 4) g.fillRect(x, 0, 1, h);
    // pintada inofensiva: una jarra
    g.globalAlpha = 0.5; g.strokeStyle = "#2fe3e8"; g.lineWidth = 5; g.lineJoin = "round";
    g.strokeRect(w * 0.7, 100, 40, 54); g.beginPath(); g.arc(w * 0.7 + 46, 127, 12, -1.4, 1.4); g.stroke();
    g.globalAlpha = 1;
    return (this.cL = c);
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses(), by = this.bajo(t);
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    g.drawImage(this.fondoFijo(), 0, 0);
    // interior (a oscuras hasta que se encienden las luces)
    const li = 0.12 + 0.88 * (t > T_LUZ ? (t < T_LUZ + 0.35 ? (Math.sin(t * 70) > 0 ? 1 : 0.3) : 1) : 0);
    g.fillStyle = "#0b0705"; g.fillRect(SX0, CAJA1, SX1 - SX0, 575 - CAJA1);
    g.save(); g.globalAlpha = a * li; g.drawImage(this.interior(), SX0, CAJA1); g.restore();
    if (li > 0.5) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.25 * a; g.drawImage(BLOB2.oro, SX0 - 100, 260, SX1 - SX0 + 200, 360); g.restore(); }
    // la persiana: lamas desde la caja hasta el borde de abajo
    const L = this.lamas();
    if (by > CAJA1 + 1) {
      const hv = by - CAJA1;
      g.drawImage(L, 0, L.height - hv, L.width, hv, SX0, CAJA1, L.width, hv);
    }
    // barra de abajo con asas
    const gb = g.createLinearGradient(0, by - 4, 0, by + 10);
    gb.addColorStop(0, "#eef2f5"); gb.addColorStop(1, "#4a5158");
    g.fillStyle = gb; g.fillRect(SX0, by - 4, SX1 - SX0, 13);
    g.strokeStyle = "#3a4048"; g.lineWidth = 4;
    // asas: dos correas con un asidero abajo (delante de las manos al tirar, detrás al colgar)
    const asas = () => {
      for (const x of [XG, XM]) {
        g.fillStyle = "#2a2e33"; g.fillRect(x - 38, by + 6, 6, ASA - 2); g.fillRect(x + 32, by + 6, 6, ASA - 2);
        g.strokeStyle = "#5d656e"; g.lineWidth = 9; g.lineCap = "round"; g.beginPath(); g.moveTo(x - 35, by + ASA + 1); g.lineTo(x + 35, by + ASA + 1); g.stroke();
        g.strokeStyle = "#e3e8ec"; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 35, by + ASA - 1); g.lineTo(x + 35, by + ASA - 1); g.stroke();
      }
    };
    const colg = this.colgado(t);
    if (colg) asas();
    // candado abierto colgando de la guía
    g.fillStyle = "#e7a900"; rectR(g, SX1 + 2, 470, 16, 14, 3); g.fill();
    g.strokeStyle = "#c9d0d6"; g.lineWidth = 3; g.beginPath(); g.arc(SX1 + 10, 466, 6, Math.PI, 0); g.stroke();
    for (const x of e) pintarAvatar(g, x.m, x.pose, t);
    if (!colg) asas();
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
    ono("¡ÑIEC!", 250, 330, TIRONES_G[0] + 0.1, 0.4, 42, "#fffdf5", "#1b1b1b", -0.1);
    ono("¡ÑIEC!", 250, 330, TIRONES_G[1] + 0.1, 0.4, 42, "#fffdf5", "#1b1b1b", -0.1);
    ono("¡AYUDA!", 300, 250, 1.75, 0.55, 40, "#ffd34d", "#3a2400", -0.08);
    TIRONES.forEach((h, i) => ono("¡HOP!", 512 + (i - 1) * 110, 270 - i * 10, h + 0.1, 0.4, 44 + i * 6, "#fffdf5", "#1b1b1b", (i - 1) * 0.1));
    ono("¡ZAS!", 760, 300, T_ZAS, 0.5, 70, "#2fe3e8", "#06303a", 0.12);
    ono("¡CLONC!", 860, 200, T_TOPE, 0.6, 52, "#fffdf5", "#1b1b1b", 0.1);
    ono("¡JA, JA!", 860, 300, T_LEVANTA + 0.5, 0.8, 44, "#ffd34d", "#3a2400", 0.1);
    // ¡ABRIMOS!
    if (t > T_LUZ) {
      const d = t - T_LUZ, k = tramo(d, 0, 0.16), s = lerp(1.8, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a; g.translate(512, 58); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has(1)) return CT.get(1);
    const c = lienzoNuevo(760, 160), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 130);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#c9ffd6"); gr.addColorStop(1, "#2bff5b");
    txt(g, "¡ABRIMOS!", 380, 124, { tam: 122, peso: 900, fam: FD, color: gr, borde: "#03230c", bordeAncho: 12, esp: 6, glow: "rgba(43,255,91,.85)", glowTam: 24, max: 720 });
    CT.set(1, c);
    return c;
  }
}

registrar({ id: "00183", nombre: "La persiana", crear: () => new Persiana() });
})();
