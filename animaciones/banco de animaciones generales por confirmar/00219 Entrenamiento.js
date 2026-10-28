"use strict";
/*
 * 00219 · ENTRENAMIENTO
 *
 * Animación del banco. Empieza y acaba en negro.
 * En el gimnasio del parque de bomberos (neumático, cuerda, colchonetas y un marcador). Marcos salta a la comba a toda
 * velocidad; Guillermo aplaude y se apunta. Se tiran los dos a hacer flexiones: ¡UNO, DOS!… y a la tercera Guillermo
 * se desploma (¡PLAF!). Sube de un salto a la espalda de Marcos y se tumba con las manos en la nuca, y Marcos sigue
 * haciendo flexiones con él encima, empezando la cuenta otra vez. Remata con una flexión con palmada que los hace
 * saltar a los dos. Fundido a negro.
 */
(() => {
const CT = cacheTexto();
const ESC = 1.42;
const PIV_G = [58, 232], PIV_M = [56, 232];
const XG0 = 300, XM0 = 700, XGF = 104, XMF = 512;       // de pie / pies en la plancha
const T_COMBA = 0.25, T_FCOMBA = 1.85, T_BAJAN = 2.05, T_FLEX = 2.5, PER = 0.7;
const T_PLAF = T_FLEX + 2 * PER + 0.35;                    // a la tercera, abajo, se desploma
const T_SALTA = 4.75, T_ENCIMA = 5.3, T_PALMA = 8.15, T_FIN = 9.0, DUR = 9.8;

class Entrenamiento extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(300);
  }
  // ---------------------------------------------------------------------- flexiones
  /** 0 arriba – 1 abajo, para una serie que empieza en t0. */
  rep(t, t0) { if (t < t0) return 0; return 0.5 - 0.5 * Math.cos(((t - t0) / PER) * Math.PI * 2); }
  /** Cuenta de flexiones completadas desde t0. */
  cuenta(t, t0) { return t < t0 ? 0 : Math.floor((t - t0) / PER + 0.0001); }
  /** Marcos: { m, giro, k } en el instante t. */
  marcos(t) {
    let x = XM0, y = PIES, giro = 0, sy = 1, k = 0;
    if (t > T_FCOMBA) {
      const u = eIn(tramo(t, T_BAJAN, T_BAJAN + 0.38));
      const incArr = 0.445;
      giro = (Math.PI / 2 - incArr) * u; x = lerp(XM0, XMF, eOut(tramo(t, T_BAJAN, T_BAJAN + 0.38)));
      if (t > T_FLEX) {
        k = t < T_ENCIMA ? this.rep(t, T_FLEX) : this.rep(t, T_ENCIMA + 0.35);
        if (t > T_ENCIMA - 0.05 && t < T_ENCIMA + 0.35) k = 0.35 * Math.sin(tramo(t, T_ENCIMA - 0.05, T_ENCIMA + 0.35) * Math.PI);
        if (t > T_PALMA) k = t < T_PALMA + 0.25 ? lerp(this.rep(T_PALMA, T_ENCIMA + 0.35), 1, tramo(t, T_PALMA, T_PALMA + 0.25)) : 1 - eOut(tramo(t, T_PALMA + 0.25, T_PALMA + 0.45));
        giro = Math.PI / 2 - lerp(0.445, 0.2, k);
      }
    }
    // salto de la palmada
    let salto = 0;
    if (t > T_PALMA + 0.3 && t < T_PALMA + 1.0) salto = Math.sin(tramo(t, T_PALMA + 0.3, T_PALMA + 1.0) * Math.PI) * 70;
    return { m: matAv(x, y - salto, ESC, giro, 1, sy, PIV_M), giro, k, salto };
  }
  guillermo(t) {
    let x = XG0, giro = 0, k = 0;
    if (t > T_FCOMBA) {
      const u = eIn(tramo(t, T_BAJAN + 0.12, T_BAJAN + 0.5));
      giro = (Math.PI / 2 - 0.55) * u; x = lerp(XG0, XGF, eOut(tramo(t, T_BAJAN + 0.12, T_BAJAN + 0.5)));
      if (t > T_FLEX) {
        k = this.rep(t, T_FLEX);
        if (t > T_PLAF - 0.12) k = 1 + 0.6 * eOut(tramo(t, T_PLAF - 0.12, T_PLAF));    // se desploma: plano en el suelo
        giro = Math.PI / 2 - Math.max(0.06, lerp(0.55, 0.245, k));
      }
    }
    return { m: matAv(x, PIES, ESC, giro, 1, 1, PIV_G), giro, k };
  }
  /** Matriz de Guillermo tumbado en la espalda de Marcos. */
  encima(mM, salto2 = 0) {
    return new DOMMatrix().translate(0, -salto2).multiply(mM.translate(-66, -14));
  }
  manosSuelo(m, hombro, R, sep = 14) {
    const s = aPant(m, hombro);
    const inv = m.inverse();
    const a = inv.transformPoint(new DOMPoint(s[0] + 4, PIES - 3)), b = inv.transformPoint(new DOMPoint(s[0] + sep, PIES - 3));
    void R;
    return [[a.x, a.y], [b.x, b.y]];
  }
  poses() {
    const t = this.t;
    const G = { cara: "sorpresa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "bombero", cara: "guino", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    const eM = this.marcos(t);
    let mM = eM.m, mG;
    // ------------- Marcos
    if (t < T_FCOMBA + 0.15) {
      const ph = (t - T_COMBA) * 13;
      M.manoD = [94, 140 + 6 * Math.cos(ph)]; M.manoI = [-20, 140 + 6 * Math.cos(ph)];
      M.cara = t < T_COMBA + 0.2 ? "sonrisa" : "guino"; M.rc = -0.05;
      if (t > T_COMBA) {
        const salto = Math.pow(Math.max(0, Math.cos(ph)), 0.6) * 30;
        mM = matAv(XM0, PIES - salto, ESC, 0, 1, 1, PIV_M);
        M.piernaI = [-6 * Math.max(0, Math.cos(ph)), 0.06]; M.piernaD = [-6 * Math.max(0, Math.cos(ph)), -0.06];
      }
    } else if (t < T_FLEX) {
      M.cara = "risa"; M.rc = -0.25 * tramo(t, T_BAJAN, T_BAJAN + 0.38);
      const [a, b] = this.manosSuelo(mM, [63, 93]);
      const k = eInOut(tramo(t, T_BAJAN, T_BAJAN + 0.38));
      M.manoD = mezcla([90, 110], a, k); M.manoI = mezcla([-20, 110], b, k);
    } else {
      const [a, b] = this.manosSuelo(mM, [63, 93]);
      M.manoD = a; M.manoI = b; M.rc = -0.35;
      M.cara = eM.k > 0.6 ? "dormido" : "guino";
      if (t > T_PLAF && t < T_SALTA) { M.cara = "risa"; }
      if (t > T_ENCIMA - 0.05 && t < T_ENCIMA + 0.5) M.cara = "sorpresa";
      if (t > T_ENCIMA + 0.5) M.cara = eM.k > 0.6 ? "dormido" : (t > 7.0 ? "risa" : "guino");
      if (t > T_PALMA + 0.3 && t < T_PALMA + 1.0) {
        // ¡palmada!
        const c = Math.sin(tramo(t, T_PALMA + 0.3, T_PALMA + 1.0) * Math.PI);
        const pecho = mM.inverse().transformPoint(new DOMPoint(aPant(mM, [80, 110])[0], aPant(mM, [80, 110])[1] + 30));
        M.manoD = mezcla(a, [pecho.x, pecho.y], c); M.manoI = mezcla(b, [pecho.x - 4, pecho.y - 8], c);
        M.cara = "risa";
      }
      if (t > T_PALMA + 1.0) M.cara = "guino";
    }
    // ------------- Guillermo
    if (t < T_FCOMBA) {
      G.cara = t < 0.9 ? "sorpresa" : "risa"; G.rc = 0.12;
      if (t > 0.9) { const s = Math.sin(t * 24); G.brazoIDelante = true; G.manoD = [50 + 6 * s, 112]; G.manoI = [30 - 6 * s, 112]; }
      mG = matAv(XG0, PIES, ESC, 0, 1, 1, PIV_G);
    } else if (t < T_SALTA) {
      const eG = this.guillermo(t);
      mG = eG.m;
      if (t < T_FLEX) {
        G.cara = t < T_BAJAN + 0.1 ? "guino" : "sonrisa";
        // brazo arriba: ¡me apunto!
        if (t < T_BAJAN + 0.1) { G.manoD = [86, 30]; G.manoI = [20, 140]; }
        else { const [a, b] = this.manosSuelo(mG, [69, 86]); const k = eInOut(tramo(t, T_BAJAN + 0.12, T_BAJAN + 0.5)); G.manoD = mezcla([90, 110], a, k); G.manoI = mezcla([-20, 110], b, k); G.rc = -0.3 * k; }
      } else {
        const [a, b] = this.manosSuelo(mG, [69, 86]);
        G.manoD = a; G.manoI = b; G.rc = -0.35;
        const n = this.cuenta(t, T_FLEX);
        G.cara = eG.k > 0.6 ? "dormido" : n < 1 ? "sonrisa" : "borracho";
        if (t > T_PLAF - 0.12) {
          // plano en el suelo, sin fuerzas
          G.cara = "borracho"; G.rc = -0.4;
          G.manoD = [96, 120]; G.manoI = [-10, 120];
        }
      }
    } else {
      // salta a la espalda de Marcos (dando una vuelta) y se tumba con las manos en la nuca
      const salto2 = t > T_PALMA + 0.3 && t < T_PALMA + 1.25 ? Math.sin(tramo(t, T_PALMA + 0.3, T_PALMA + 1.25) * Math.PI) * 70 : 0;
      const mOn = this.encima(mM, salto2);
      if (t < T_ENCIMA) {
        const eG = this.guillermo(T_SALTA), u = eInOut(tramo(t, T_SALTA, T_ENCIMA));
        const c0 = aPant(eG.m, [39, 116]), c1 = aPant(mOn, [39, 116]);
        const g0 = eG.giro, g1 = eM.giro + Math.PI * 2;
        mG = matAv(lerp(c0[0], c1[0], u), lerp(c0[1], c1[1], u) - Math.sin(u * Math.PI) * 170, ESC, lerp(g0, g1, u), 1, 1, [39, 116]);
        G.cara = "sorpresa"; G.puntas = Math.sin(u * Math.PI); G.manoD = [96, 60]; G.manoI = [-18, 60];
        G.piernaI = [-10, 0.2]; G.piernaD = [-10, -0.2];
      } else {
        mG = mOn;
        G.manoD = [62, 6]; G.manoI = [16, 6]; G.rc = -0.4;
        G.piernaD = [0, -0.12];
        G.cara = t < 6.6 ? "dormido" : t < 7.9 ? "risa" : "guino";
        if (t > 6.6 && t < 7.9) { G.manoD = [98 + 10 * Math.sin(t * 14), 40]; G.rc = -0.4; }
        if (salto2 > 0) { G.cara = "sorpresa"; G.puntas = salto2 / 70; G.manoD = [96, 40]; G.manoI = [-18, 40]; }
      }
    }
    // comba en las manos de Marcos
    return { G, M, mG, mM };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const polvo = (x, n, f = 1) => { for (let i = 0; i < n; i++) p.nueva(P.POLVO, x + azar(-60, 60) * f, PIES, azar(-120, 120) * f, azar(-50, -5), azar(0.4, 0.8), azar(18, 30)); };
    // la comba toca el suelo
    if (t > T_COMBA && t < T_FCOMBA) {
      const ph = (t - T_COMBA) * 13, n = Math.floor((ph + Math.PI) / (Math.PI * 2));
      this.una("comba" + n, n > 0, () => polvo(XM0, 3, 0.5));
    }
    this.una("bajan", t > T_BAJAN + 0.4, () => { temblar(6, 0.2); polvo(650, 6); });
    this.una("bajanG", t > T_BAJAN + 0.5, () => { temblar(6, 0.2); polvo(240, 6); });
    this.una("plaf", t > T_PLAF, () => { temblar(14, 0.35); polvo(240, 14, 1.6); });
    this.una("encima", t > T_ENCIMA, () => { temblar(12, 0.3); polvo(650, 10, 1.4); });
    this.una("palma", t > T_PALMA + 0.5, () => {
      temblar(14, 0.35);
      const e = this.poses(), c = aPant(e.mM, e.M._manoD || [80, 110]);
      p.nueva(P.DESTELLO, c[0], c[1], 0, 0, 0.35, 200);
      for (let i = 0; i < 14; i++) { const a = azar(0, 6.283), v = azar(120, 320); p.nueva(P.CHISPA, c[0], c[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(5, 8)); }
    });
    this.una("aterriza", t > T_PALMA + 1.0, () => { temblar(10, 0.25); polvo(650, 10, 1.4); });
    // sudor de Guillermo
    if (t > T_FLEX + PER && t < T_SALTA && Math.random() < 5 * dt) {
      const e = this.poses(), c = aPant(e.mG, [30, 18]);
      p.nueva(P.VAPOR, c[0], c[1], azar(-30, 30), azar(-60, -20), azar(0.4, 0.7), azar(12, 18));
    }
    p.actualizar(dt);
  }
  fondoFijo() {
    if (CT.has("fondo")) return CT.get("fondo");
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    // pared de ladrillo
    g.fillStyle = "#7a3426"; g.fillRect(-60, -60, W + 120, 610);
    const r = semilla(9);
    for (let y = -60; y < 430; y += 26) {
      for (let x = ((y / 26) % 2 ? -40 : -60); x < W + 60; x += 56) {
        const v = 0.85 + r() * 0.3;
        g.fillStyle = `rgb(${Math.round(150 * v)},${Math.round(68 * v)},${Math.round(50 * v)})`;
        rectR(g, x + 2, y + 2, 52, 22, 2); g.fill();
      }
    }
    // zócalo pintado
    g.fillStyle = "#3b4654"; g.fillRect(-60, 430, W + 120, 120);
    g.fillStyle = "#ffd23a"; g.fillRect(-60, 430, W + 120, 10);
    // ventanal con luz
    const gv = g.createLinearGradient(0, 70, 0, 250);
    gv.addColorStop(0, "#bfe6ff"); gv.addColorStop(1, "#6fb0dc");
    g.fillStyle = "#2a2e33"; g.fillRect(372, 166, 290, 168);
    g.fillStyle = gv; g.fillRect(380, 174, 274, 152);
    g.fillStyle = "#2a2e33"; g.fillRect(513, 174, 8, 152); g.fillRect(380, 246, 274, 8);
    g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.moveTo(400, 174); g.lineTo(440, 174); g.lineTo(390, 246); g.lineTo(380, 246); g.lineTo(380, 200); g.fill();
    // cuerda colgada a la derecha
    g.strokeStyle = "#8a6a3a"; g.lineWidth = 16; g.lineCap = "round";
    g.beginPath(); g.moveTo(1000, -60); g.quadraticCurveTo(1004, 200, 996, 420); g.stroke();
    g.strokeStyle = "#d9b77a"; g.lineWidth = 10; g.stroke();
    g.strokeStyle = "rgba(90,60,20,.6)"; g.lineWidth = 2;
    for (let y = -40; y < 410; y += 14) { g.beginPath(); g.moveTo(994, y); g.lineTo(1006, y + 8); g.stroke(); }
    g.fillStyle = "#c9a464"; g.beginPath(); g.ellipse(996, 428, 14, 18, 0, 0, 6.283); g.fill();
    // neumático apoyado a la izquierda
    g.save(); g.translate(18, 480);
    g.fillStyle = "#151515"; g.beginPath(); g.ellipse(0, 0, 70, 92, 0, 0, 6.283); g.fill();
    g.strokeStyle = "#333"; g.lineWidth = 6;
    for (let i = 0; i < 14; i++) { const a = i * 0.449; g.beginPath(); g.moveTo(Math.cos(a) * 58, Math.sin(a) * 78); g.lineTo(Math.cos(a) * 70, Math.sin(a) * 92); g.stroke(); }
    g.fillStyle = "#3b4654"; g.beginPath(); g.ellipse(0, 0, 34, 46, 0, 0, 6.283); g.fill();
    g.strokeStyle = "#2a2a2a"; g.lineWidth = 4; g.stroke();
    g.restore();
    // mancuernas
    for (const x of [930, 970]) {
      g.fillStyle = "#2a2e33"; g.fillRect(x - 14, 556, 28, 6);
      g.fillStyle = "#d8261c"; rectR(g, x - 18, 546, 9, 24, 3); g.fill(); rectR(g, x + 9, 546, 9, 24, 3); g.fill();
    }
    // colchonetas
    const gs = g.createLinearGradient(0, 548, 0, H + 60);
    gs.addColorStop(0, "#2f6fb8"); gs.addColorStop(1, "#163a66");
    g.fillStyle = gs; g.fillRect(-60, 548, W + 120, H);
    g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(-60, 548, W + 120, 3);
    g.fillStyle = "rgba(0,0,0,.25)";
    for (let x = 100; x < W + 60; x += 230) g.fillRect(x, 548, 4, 60);
    // marcador
    g.fillStyle = "#15181c"; rectR(g, 776, 40, 196, 128, 12); g.fill();
    g.strokeStyle = "#c9d0d6"; g.lineWidth = 4; g.stroke();
    txt(g, "FLEXIONES", 874, 74, { tam: 24, peso: 800, fam: FT, color: "#ffd34d", esp: 2 });
    CT.set("fondo", c);
    return c;
  }
  comba(g, e, delante) {
    const t = this.t;
    if (t < T_COMBA || t > T_FCOMBA + 0.15) return;
    const ph = (t - T_COMBA) * 13;
    const enFrente = Math.sin(ph) > 0;
    if (enFrente !== delante) return;
    const a = aPant(e.mM, e.M._manoI || [-20, 140]), b = aPant(e.mM, e.M._manoD || [94, 140]);
    const ym = (a[1] + b[1]) / 2;
    let cy = (lerp(215, 582, 0.5 + 0.5 * Math.cos(ph)) - 0.25 * ym) / 0.75;
    if (t > T_FCOMBA) cy = (582 - 0.25 * ym) / 0.75;
    g.save(); g.lineCap = "round";
    g.strokeStyle = "#1a1a1a"; g.lineWidth = 8;
    g.beginPath(); g.moveTo(a[0], a[1]); g.bezierCurveTo(a[0] - 34, cy, b[0] + 34, cy, b[0], b[1]); g.stroke();
    g.strokeStyle = "#ff3d84"; g.lineWidth = 5; g.stroke();
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.poses();
    fondo(g, "#000");
    g.drawImage(this.fondoFijo(), -60, -60);
    // número del marcador
    let n = 0;
    if (t > T_FLEX) n = t < T_ENCIMA ? Math.min(3, this.cuenta(t, T_FLEX)) : this.cuenta(Math.min(t, T_PALMA), T_ENCIMA + 0.35) + (t > T_PALMA + 0.5 ? 1 : 0);
    const reinicio = t > T_ENCIMA && t < T_ENCIMA + 0.5 && Math.sin(t * 40) > 0;
    txt(g, String(n).padStart(2, "0"), 874, 152, { tam: 76, peso: 900, fam: FD, color: reinicio ? "#ff3d84" : "#2bff5b", glow: reinicio ? "rgba(255,61,132,.8)" : "rgba(43,255,91,.8)", glowTam: 14, esp: 6 });
    // sombras en el suelo
    g.fillStyle = "rgba(0,0,0,.25)";
    for (const m of [e.mG, e.mM]) { const c = aPant(m, [39, 150]); g.beginPath(); g.ellipse(c[0], PIES + 4, 110, 10, 0, 0, 6.283); g.fill(); }
    this.comba(g, e, false);
    pintarAvatar(g, e.mM, e.M, t);
    // asas de la comba
    if (t > T_COMBA - 0.3 && t < T_FCOMBA + 0.15) {
      for (const q of [e.M._manoI, e.M._manoD]) {
        if (!q) continue;
        const c = aPant(e.mM, q);
        g.fillStyle = "#e9dcc0"; rectR(g, c[0] - 5, c[1] - 14, 10, 24, 4); g.fill();
      }
    }
    this.comba(g, e, true);
    if (t > T_FCOMBA + 0.15 && t < 5) {
      // la comba en el suelo
      g.strokeStyle = "#ff3d84"; g.lineWidth = 3.5; g.beginPath(); g.moveTo(770, 571); g.quadraticCurveTo(840, 560, 900, 572); g.stroke();
    }
    pintarAvatar(g, e.mG, e.G, t);
    this.p.dibujar(g);
    // gotas de sudor y Zzz
    if (t > T_PLAF && t < T_SALTA) {
      const c = aPant(e.mG, [52, 14]);
      for (let i = 0; i < 2; i++) { const u = (t * 2 + i * 0.5) % 1; g.fillStyle = `rgba(150,220,255,${1 - u})`; g.beginPath(); g.ellipse(c[0] + 20 + i * 18, c[1] - 10 + u * 30, 5, 8, 0, 0, 6.283); g.fill(); }
    }
    if (t > T_ENCIMA + 0.3 && t < 6.6) {
      const c = aPant(e.mG, [39, 20]);
      for (let i = 0; i < 3; i++) {
        const u = (t * 0.8 + i / 3) % 1;
        txt(g, "Z", c[0] + 20 + u * 40, c[1] - 30 - u * 70, { tam: 22 + 16 * u, peso: 400, fam: FC, color: "#fffdf5", borde: "#1b1b1b", bordeAncho: 5, alfa: Math.sin(u * Math.PI) });
      }
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
    ono("¡FIU, FIU!", 840, 260, 0.6, 1.0, 44, "#fffdf5", "#1b1b1b", 0.1);
    ono("¡HOP!", 520, 360, T_BAJAN + 0.35, 0.5, 52, "#fffdf5", "#1b1b1b", -0.08);
    ono("¡PLAF!", 250, 420, T_PLAF, 0.8, 70, "#ffd34d", "#3a2400", -0.1);
    ono("¡HOP!", 470, 260, T_SALTA + 0.1, 0.5, 52, "#fffdf5", "#1b1b1b", 0.1);
    ono("¡CLAP!", 700, 330, T_PALMA + 0.5, 0.6, 66, "#2fe3e8", "#06303a", 0.08);
    if (t > T_FCOMBA - 0.1 && t < T_BAJAN + 0.4) {
      const c = aPant(e.mG, [39, 10]);
      bocadillo(g, 230, 200, "¡ME APUNTO!", c[0], c[1] - 10, tramo(t, T_FCOMBA - 0.1, T_FCOMBA + 0.1) * (1 - tramo(t, T_BAJAN + 0.25, T_BAJAN + 0.4)), 38);
    }
    // ¡UNO, DOS!: con los dos haciendo flexiones y otra vez con Guillermo encima
    for (const [a0, a1] of [[T_FLEX + 0.25, T_PLAF - 0.1], [T_ENCIMA + 0.4, T_FIN + 0.75]]) {
      if (t > a0 && t < a1) {
        const d = t - a0, k = tramo(d, 0, 0.16), sal = tramo(t, a1 - 0.2, a1);
        const pulso = 1 + 0.06 * Math.max(0, Math.cos(((t - T_FLEX) / PER) * Math.PI * 2));
        const s = lerp(1.8, 1, eIn(k)) * pulso * (1 - 0.3 * sal);
        const spr = this.titulo();
        g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - sal); g.translate(400, 100); g.rotate(-0.04); g.scale(s, s);
        g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
      }
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.45), tramo(t, T_FIN + 0.1, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(700, 200), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 170);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.45, "#ffe08a"); gr.addColorStop(1, "#ff8a1a");
    txt(g, "¡UNO, DOS!", 356, 160, { tam: 150, peso: 900, fam: FD, color: "#2a1200", esp: 6, max: 660 });
    txt(g, "¡UNO, DOS!", 350, 152, { tam: 150, peso: 900, fam: FD, color: gr, borde: "#2a1200", bordeAncho: 12, esp: 6, glow: "rgba(255,170,40,.8)", glowTam: 24, max: 660 });
    CT.set("t", c);
    return c;
  }
}

registrar({ id: "00219", nombre: "Entrenamiento", crear: () => new Entrenamiento() });
})();
