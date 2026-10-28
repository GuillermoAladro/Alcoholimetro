"use strict";
/*
 * 00215 · LA OLLA EXPRÉS
 *
 * Animación del banco. Empieza y acaba en negro.
 * En la cocina del bar, la olla exprés pita y tiembla. Guillermo se esconde detrás de una tapadera. Marcos se acerca a
 * cámara lenta (franjas negras, todo despacio, gota de sudor), alarga la mano con muchísimo cuidado y abre la válvula:
 * ¡PSSSS! Sale un géiser de lentejas que llega al techo y les llueve encima. Marcos apaga el fuego y Guillermo, con
 * lentejas hasta en el pelo, saca una cuchara y las prueba del casco de Marcos: ¡RICAS!
 */
(() => {
const ESC = 1.35;
const XG = 262, XM = 676, XM0 = 1150, XG_F = 520;
const OLLA = [520, 418];                       // base de la olla (encima del fuego)
const VALV = [520, 316];                       // válvula
const T_ENTRA = 0.75, T_LENTA = 1.35, T_LLEGA = 4.1, T_MANO = 4.25, T_ABRE = 5.35, T_TECHO = 5.75;
const T_LLUVIA = 6.0, T_SECA = 7.25, T_APAGA = 7.3, T_QUITA = 7.85, T_BOL = 8.3, T_ANDA_G = 7.75, T_CUCHARA = 8.5, T_PRUEBA = 8.95, T_FIN = 9.9, DUR = 10.45;
const CT = cacheTexto();
const aU = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
const LENTEJA = ["#8a5222", "#a8682a", "#6e3e18", "#b8782e"];

class OllaExpres extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(160);
    this.p.suelo = () => PIES + 4;
    this.len = [];                    // lentejas en el aire
    this.nSuelo = 0;                  // lentejas en el suelo (se pintan una vez en su lienzo)
    this.cSuelo = null;
    const r = semilla(21);
    this.puntos = Array.from({ length: 60 }, () => [r() * 2 - 1, r(), (r() * 4) | 0, r() * 3]);
  }
  /** Factor de cámara lenta (1 = normal). */
  lento(t) { return t > T_LENTA && t < T_ABRE ? lerp(1, 0.22, tramo(t, T_LENTA, T_LENTA + 0.3)) : 1; }
  franjas(t) { return eInOut(tramo(t, T_LENTA, T_LENTA + 0.35)) * (1 - eIn(tramo(t, T_ABRE, T_ABRE + 0.12))); }
  /** Cuánto montón de lentejas tienen encima (0–1). */
  monte(t) { return eOut(tramo(t, T_LLUVIA, T_SECA)); }
  poses() {
    const t = this.t;
    const G = { cara: "sorpresa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [56, 112], manoI: [24, 116], brazoIDelante: true };
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let xm = XM, ym = PIES, giroM = 0, yg = PIES, xg = XG;
    let cucharon = { a: Math.PI / 2 + 0.25, hasta: null };     // el cucharón de Marcos: ángulo o punto al que llega
    let cascoMano = null;                                        // el casco en las manos (cuando se lo quita)
    // ---------------- Marcos
    const brazoHacia = (m, q, L) => {
      // la mano izquierda, a L px del hombro en dirección a q (pantalla)
      const h = aPant(m, avatar("bombero").rig.hombroI2), d = Math.hypot(q[0] - h[0], q[1] - h[1]);
      return aU(m, [h[0] + (q[0] - h[0]) / d * L, h[1] + (q[1] - h[1]) / d * L]);
    };
    if (t < T_ENTRA) xm = XM0;
    else if (t < T_LLEGA) {
      // entra… y a partir de T_LENTA, a cámara lenta: pasos enormes y despacio
      const lenta = t > T_LENTA;
      const u = lenta ? tramo(t, T_LENTA, T_LLEGA) : 0, x0 = lerp(XM0, 930, eOut(tramo(t, T_ENTRA, T_LENTA)));
      xm = lenta ? lerp(930, XM, u) : x0;
      const fase = lenta ? 1.6 + (t - T_LENTA) * 3.2 : (t - T_ENTRA) * 12;
      const a = andar(fase, lenta ? 2.2 : 1);
      M.piernaI = a.piernaI; M.piernaD = a.piernaD; ym += a.bote * (lenta ? 0.5 : 1);
      const s = Math.sin(fase);
      M.manoD = [70 + 10 * s, 140]; M.manoI = [2 - 10 * s, 140];
      M.cara = lenta ? (u < 0.5 ? "guino" : "sonrisa") : "sonrisa"; M.rc = -0.05;
    } else if (t < T_ABRE) {
      // alarga el cucharón muy despacio hasta la válvula
      const k = eInOut(tramo(t, T_MANO, T_ABRE - 0.05));
      const m0 = matAv(XM, PIES, ESC);
      M.brazoIDelante = true; M.manoI = mezcla([2, 140], brazoHacia(m0, VALV, 74), k);
      M.manoD = [74, 130];
      cucharon = k > 0.02 ? { a: null, hasta: VALV, k } : cucharon;
      M.cara = k < 0.5 ? "sonrisa" : "dormido"; M.rc = 0.08 * k;
    } else {
      M.cara = t < T_LLUVIA ? "sorpresa" : t < T_SECA ? (Math.floor(t * 3) % 2 ? "sorpresa" : "dormido") : "risa";
      M.puntas = t < T_SECA ? 0.6 : 0;
      const m0 = matAv(XM, PIES, ESC);
      if (t < T_LLUVIA) { M.brazoIDelante = true; M.manoI = brazoHacia(m0, [VALV[0] - 10, VALV[1] - 70], 74); M.manoD = [94, 70]; cucharon = { a: -2.3, hasta: null }; }
      else if (t < T_APAGA) { M.manoI = [-14, 64]; M.manoD = [92, 70]; M.brazoIDelante = false; cucharon = { a: -1.9, hasta: null }; }
      else if (t < T_QUITA) {
        // apaga el fuego (con el cucharón, sin acercarse)
        const k = Math.sin(Math.PI * tramo(t, T_APAGA, T_QUITA));
        const mando = [OLLA[0] + 40, 466];
        M.brazoIDelante = true; M.manoI = mezcla([6, 152], brazoHacia(m0, mando, 74), k); M.cara = "guino";
        cucharon = k > 0.3 ? { a: null, hasta: mando, k } : { a: Math.PI / 2 + 0.25, hasta: null };
      } else {
        // se quita el casco y lo ofrece de cuenco
        cucharon = null;
        const k1 = eInOut(tramo(t, T_QUITA, T_QUITA + 0.2)), k2 = eInOut(tramo(t, T_QUITA + 0.25, T_BOL));
        M.brazoIDelante = true;
        M.manoD = mezcla(mezcla([67, 152], [64, 40], k1), [56, 116], k2); M.manoI = mezcla(mezcla([6, 152], [10, 40], k1), [20, 116], k2);
        if (t > T_QUITA + 0.2) {
          M.casco = false;
          const mm = matAv(XM, PIES, ESC), c0 = aPant(mm, [37, 18]), c1 = aPant(mm, [38, 108]);
          cascoMano = { c: mezcla([c0[0], c0[1] - 14 * Math.sin(Math.PI * k2)], c1, k2), ang: Math.PI * k2 };
        }
        M.cara = t < T_BOL ? "guino" : t < T_PRUEBA ? "sonrisa" : "risa"; M.rc = t > T_PRUEBA ? 0.1 * Math.sin(t * 8) : 0.05;
      }
    }
    // ---------------- Guillermo (escondido tras una tapadera)
    let tapa = true, cuchara = false;
    if (t < T_ABRE) {
      const lento = t > T_LENTA ? 0.25 : 1;
      const tiembla = Math.sin(t * 40 * lento) * 1.2;
      G.manoD = [58 + tiembla, 116]; G.manoI = [22 + tiembla, 118];
      G.cara = t < T_ENTRA ? "sorpresa" : t < T_LENTA ? "sonrisa" : t < T_MANO ? "sorpresa" : "dormido";
      G.rc = t > T_ENTRA && t < T_LENTA ? -0.14 : 0.1;
      if (t > T_MANO) { G.rc = 0.16; G.manoD = [54, 104]; G.manoI = [24, 106]; }   // asoma por encima de la tapa
      yg = PIES - 2 * Math.abs(tiembla);
    } else if (t < T_ANDA_G) {
      G.cara = t < T_LLUVIA ? "sorpresa" : t < T_SECA ? "dormido" : "risa"; G.puntas = t < T_SECA ? 0.7 : 0;
      G.manoD = [62, 82]; G.manoI = [16, 84]; G.rc = 0;
      if (t > T_SECA) { tapa = false; G.brazoIDelante = false; G.manoD = [96, 120]; G.manoI = [-18, 122]; G.cara = "risa"; }
    } else {
      // con una cuchara, a probar las lentejas del casco de Marcos
      tapa = false; cuchara = true;
      const u = tramo(t, T_ANDA_G, T_CUCHARA);
      xg = lerp(XG, XG_F, eInOut(u));
      if (u > 0 && u < 1) { const a = andar((t - T_ANDA_G) * 12, 0.9); G.piernaI = a.piernaI; G.piernaD = a.piernaD; yg += a.bote; }
      const mG0 = matAv(xg, PIES, ESC);
      const bol = aPant(matAv(XM, PIES, ESC), [38, 100]);
      const k = eInOut(tramo(t, T_CUCHARA - 0.15, T_CUCHARA + 0.2)), kB = eInOut(tramo(t, T_PRUEBA - 0.2, T_PRUEBA + 0.1));
      const b = boca(0.1);
      G.manoD = mezcla(mezcla([84, 120], aU(mG0, [bol[0] - 26, bol[1] - 4]), k), [b[0] + 8, b[1] + 6], kB);
      G.cara = t < T_PRUEBA ? "risa" : t < T_PRUEBA + 0.35 ? "sonrisa" : "guino"; G.rc = t > T_PRUEBA ? 0.1 : 0.06;
      G.brazoIDelante = false;
    }
    if (tapa) G.objD2 = (g, mano) => {
      g.save(); g.translate(mano[0] - 16, mano[1] + 6);
      const gr = g.createRadialGradient(-10, -10, 2, 0, 0, 36); gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.6, "#c9d0d6"); gr.addColorStop(1, "#7a848d");
      g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 34, 30, 0, 0, 6.283); g.fill();
      g.strokeStyle = "#5a626a"; g.lineWidth = 2; g.stroke();
      g.fillStyle = "#2a2a2e"; rectR(g, -8, -4, 16, 8, 3); g.fill();
      g.restore();
    };
    if (cuchara) G.objD2 = (g, mano) => {
      g.save(); g.translate(mano[0], mano[1]); g.rotate(t < T_PRUEBA - 0.2 ? -0.3 : -1.1);
      g.fillStyle = "#c9d0d6"; g.fillRect(-2, -2, 30, 4);
      g.beginPath(); g.ellipse(34, 0, 8, 5.5, 0, 0, 6.283); g.fill();
      if (t > T_CUCHARA + 0.1 && t < T_PRUEBA + 0.1) { g.fillStyle = LENTEJA[0]; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(31 + (i % 2) * 5, -2 + (i >> 1) * 3, 2, 1.5, 0, 0, 6.283); g.fill(); } }
      g.restore();
    };
    const mM = matAv(xm, ym, ESC, giroM), mG = matAv(xg, yg, ESC);
    return { G, M, mG, mM, cucharon, cascoMano };
  }
  /** Cucharón de madera: del puño hasta `hasta` (o con un ángulo fijo). */
  dibujarCucharon(g, e, t) {
    const c = e.cucharon;
    if (!c) return;
    const h = aPant(e.mM, e.M._manoI || e.M.manoI);
    let ang, L = 150;
    if (c.hasta) { ang = Math.atan2(c.hasta[1] - h[1], c.hasta[0] - h[0]); L = lerp(150, Math.hypot(c.hasta[0] - h[0], c.hasta[1] - h[1]) + 6, c.k); }
    else ang = c.a;
    g.save(); g.translate(h[0], h[1]); g.rotate(ang);
    g.strokeStyle = "#7a4a1a"; g.lineWidth = 9; g.lineCap = "round"; g.beginPath(); g.moveTo(-14, 0); g.lineTo(L - 16, 0); g.stroke();
    g.strokeStyle = "#c08a4a"; g.lineWidth = 5; g.stroke();
    g.fillStyle = "#b07a3a"; g.beginPath(); g.ellipse(L - 6, 0, 14, 10, 0, 0, 6.283); g.fill();
    g.fillStyle = "#8a5a2a"; g.beginPath(); g.ellipse(L - 4, 1, 9, 6, 0, 0, 6.283); g.fill();
    g.restore();
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, L = this.lento(t), dl = dt * L;
    // vapor y pitido
    if (t < T_ABRE && Math.random() < 18 * dl) p.nueva(P.VAPOR, VALV[0] + azar(-4, 4), VALV[1] - 10, azar(-60, 60), azar(-180, -120), azar(0.6, 1.0), azar(14, 22));
    this.una("abre", t > T_ABRE, () => {
      temblar(22, 0.6);
      for (let i = 0; i < 18; i++) p.nueva(P.VAPOR, VALV[0] + azar(-20, 20), VALV[1], azar(-200, 200), azar(-300, -60), azar(0.8, 1.4), azar(30, 50));
    });
    // el géiser: sube hasta el techo
    if (t > T_ABRE && t < T_TECHO + 0.25) {
      for (let i = 0; i < 9; i++) if (this.len.length < 300) this.len.push({ x: VALV[0] + azar(-10, 10), y: VALV[1] - 10, vx: azar(-70, 70), vy: azar(-1350, -1050), c: (Math.random() * 4) | 0, r: azar(3, 4.4), a: azar(0, 6), techo: false });
      if (Math.random() < 30 * dt) p.nueva(P.VAPOR, VALV[0] + azar(-14, 14), VALV[1] - 30, azar(-30, 30), azar(-500, -300), azar(0.5, 0.8), azar(24, 40));
    }
    this.una("techo", t > T_TECHO, () => temblar(12, 0.3));
    // lluvia de lentejas
    if (t > T_LLUVIA && t < T_SECA - 0.3) for (let i = 0; i < 5; i++) if (this.len.length < 300) this.len.push({ x: azar(60, 960), y: azar(-30, 0), vx: azar(-30, 30), vy: azar(100, 300), c: (Math.random() * 4) | 0, r: azar(3, 4.4), a: azar(0, 6), techo: true });
    for (const q of this.len) {
      if (!q.techo && q.y < 12) { q.techo = true; q.vy = azar(20, 120); q.vx = azar(-420, 420); }
      q.vy += (q.techo ? 900 : 300) * dt; q.vx *= 1 - 1.2 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.a += 8 * dt;
      if (q.y > PIES + 2) { this.posar(q); q.muerta = true; }
    }
    this.len = this.len.filter((q) => !q.muerta);
    this.una("apaga", t > T_APAGA + 0.25, () => { for (let i = 0; i < 6; i++) p.nueva(P.HUMO, OLLA[0] + azar(-20, 20), OLLA[1], azar(-20, 20), azar(-60, -20), azar(0.5, 0.9), azar(12, 20)); });
    this.una("prueba", t > T_PRUEBA + 0.15, () => { for (let i = 0; i < 12; i++) p.nueva(P.PURPURINA, XG_F + azar(-50, 50), 300 + azar(-30, 30), azar(-40, 40), azar(-40, 0), azar(0.8, 1.2), azar(10, 16)); });
    p.actualizar(dl);
  }
  /** Deja una lenteja en el suelo: se pinta una sola vez en el lienzo del suelo. */
  posar(q) {
    if (this.nSuelo >= 420 || q.x < -60 || q.x > W + 60) return;
    if (!this.cSuelo) this.cSuelo = lienzoNuevo(W + 120, 40);
    const g = this.cSuelo.getContext("2d");
    g.fillStyle = LENTEJA[q.c]; g.beginPath(); g.ellipse(q.x + 60, 12 + azar(-2, 8), 4, 2.8, q.a, 0, 6.283); g.fill();
    this.nSuelo++;
  }
  // ------------------------------------------------------------------ dibujo
  fondoFijo() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    // azulejos
    g.fillStyle = "#dfe9ee"; g.fillRect(-60, -60, W + 120, 640);
    for (let y = -60; y < 470; y += 40) for (let x = -60; x < W + 60; x += 40) { g.fillStyle = ((x + y) / 40) % 2 ? "#cfe0e8" : "#e9f2f5"; g.fillRect(x + 1, y + 1, 38, 38); }
    g.fillStyle = "#2f6f9a"; g.fillRect(-60, 230, W + 120, 14);
    // techo
    g.fillStyle = "#9aa8b0"; g.fillRect(-60, -60, W + 120, 66);
    // estantes con cacharros
    g.fillStyle = "#7a5a3a"; g.fillRect(40, 140, 220, 10); g.fillRect(760, 140, 230, 10);
    for (const [x, w, h, col] of [[60, 50, 40, "#c9d0d6"], [126, 60, 30, "#d8261c"], [200, 44, 52, "#c9d0d6"], [780, 56, 44, "#e0a400"], [860, 40, 30, "#c9d0d6"], [920, 54, 50, "#2f6f9a"]]) {
      g.fillStyle = col; rectR(g, x, 140 - h, w, h, 6); g.fill(); g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(x + 6, 140 - h + 4, 5, h - 8);
    }
    // ristras de ajos (dibujo)
    for (const x of [320, 700]) { g.strokeStyle = "#8a6a3a"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, 6); g.lineTo(x, 110); g.stroke(); g.fillStyle = "#f4ead0"; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(x + (i % 2 ? 7 : -7), 40 + i * 16, 9, 8, 0, 0, 6.283); g.fill(); } }
    // encimeras
    const enc = (x0, x1) => {
      g.fillStyle = "#c9d0d6"; g.fillRect(x0, 448, x1 - x0, PIES - 448);
      g.fillStyle = "#e9edf0"; g.fillRect(x0 - 6, 436, x1 - x0 + 12, 14);
      g.fillStyle = "rgba(0,0,0,.12)"; for (let x = x0 + 70; x < x1; x += 90) g.fillRect(x, 456, 2, PIES - 460);
    };
    enc(-60, 410); enc(632, W + 60);
    // la cocina
    g.fillStyle = "#f4f6f8"; g.fillRect(410, 432, 222, PIES - 432);
    g.fillStyle = "#2a2e34"; g.fillRect(404, 424, 234, 14);
    g.fillStyle = "#3a3f46"; rectR(g, 432, 488, 178, 76, 6); g.fill();
    g.fillStyle = "rgba(255,170,80,.25)"; rectR(g, 444, 498, 154, 56, 4); g.fill();
    g.fillStyle = "#c9d0d6"; g.fillRect(450, 478, 142, 6);
    // suelo
    const gs = g.createLinearGradient(0, PIES, 0, H + 60); gs.addColorStop(0, "#8a7a6a"); gs.addColorStop(1, "#4a4038");
    g.fillStyle = gs; g.fillRect(-60, PIES - 4, W + 120, H + 60 - PIES);
    g.fillStyle = "rgba(255,255,255,.2)"; g.fillRect(-60, PIES - 4, W + 120, 2);
    return (this.cF = c);
  }
  olla(g, t) {
    const [x, y] = OLLA;
    const tiembla = t < T_ABRE ? Math.sin(t * 60 * this.lento(t)) * 2.5 : 0, salta = t < T_ABRE ? Math.abs(Math.sin(t * 23 * this.lento(t))) * 3 : 0;
    // fuego pequeño (de dibujos)
    if (t < T_APAGA + 0.25) {
      for (let i = 0; i < 7; i++) {
        const fx = x - 42 + i * 14, h = 9 + 3 * Math.sin(t * 20 * this.lento(t) + i);
        g.fillStyle = "#3a8cff"; g.beginPath(); g.moveTo(fx - 4, y + 6); g.quadraticCurveTo(fx, y + 6 - h * 1.6, fx + 4, y + 6); g.fill();
        g.fillStyle = "#bfe4ff"; g.beginPath(); g.moveTo(fx - 2, y + 6); g.quadraticCurveTo(fx, y + 6 - h * 0.8, fx + 2, y + 6); g.fill();
      }
    }
    // mando
    const giro = t > T_APAGA + 0.2 ? -1.5 : 0;
    g.save(); g.translate(x + 40, 466); g.rotate(giro); g.fillStyle = "#1a1a1a"; g.beginPath(); g.arc(0, 0, 10, 0, 6.283); g.fill(); g.fillStyle = "#e9edf0"; g.fillRect(-2, -10, 4, 9); g.restore();
    g.fillStyle = "#1a1a1a"; g.beginPath(); g.arc(x - 40, 466, 10, 0, 6.283); g.fill();
    g.save(); g.translate(x + tiembla, y - salta);
    const gr = g.createLinearGradient(-60, 0, 60, 0);
    gr.addColorStop(0, "#6a727a"); gr.addColorStop(0.3, "#e9eef2"); gr.addColorStop(0.55, "#ffffff"); gr.addColorStop(1, "#5a626a");
    // asas
    g.fillStyle = "#1a1a1a"; rectR(g, -98, -66, 44, 12, 5); g.fill(); rectR(g, 56, -66, 26, 12, 5); g.fill();
    // cuerpo
    g.fillStyle = gr; rectR(g, -58, -84, 116, 84, 10); g.fill();
    g.strokeStyle = "#4a5258"; g.lineWidth = 2; g.stroke();
    // tapa
    g.fillStyle = gr; g.beginPath(); g.ellipse(0, -84, 62, 16, 0, Math.PI, 0); g.fill(); g.stroke();
    g.fillStyle = "#3a3f46"; rectR(g, -50, -92, 100, 8, 3); g.fill();
    // válvula
    const vy = -100 + (t < T_ABRE ? -2 * Math.abs(Math.sin(t * 30 * this.lento(t))) : 0);
    g.fillStyle = "#3a3f46"; g.fillRect(-5, vy, 10, 10);
    g.save(); g.translate(0, vy); g.rotate(t < T_ABRE ? 0.3 * Math.sin(t * 25 * this.lento(t)) : 1.2);
    g.fillStyle = "#d8261c"; rectR(g, -10, -10, 20, 10, 4); g.fill();
    g.restore();
    g.fillStyle = "rgba(255,255,255,.5)"; g.fillRect(-46, -76, 6, 66);
    g.restore();
  }
  monton(g, m, k, t, q, sinCasco = false) {
    if (k <= 0) return;
    // lentejas encima de la cabeza (casco) y de los hombros, en coordenadas del avatar
    conMat(g, m, () => {
      const R = avatar(q).rig;
      const n = Math.floor(this.puntos.length * k);
      for (let i = 0; i < n; i++) {
        const [u, v, c, a] = this.puntos[i];
        let x, y;
        if (i % 3 === 2) { x = (u < 0 ? R.hombroI2[0] + 4 : R.hombroD[0] - 4) + u * 6; y = R.hombroD[1] - 6 - v * 5; }
        else if (sinCasco) continue;
        else { x = R.frente[0] + u * 24 * (1 - v * 0.4); y = (q === "bombero" ? 2 : -2) - v * 9 * k + Math.abs(u) * 8; }
        g.fillStyle = LENTEJA[c]; g.beginPath(); g.ellipse(x, y, 3.2, 2.3, a, 0, 6.283); g.fill();
      }
    });
  }
  rotulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(760, 210), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 170);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#e6f6ff"); gr.addColorStop(1, "#8ac8ff");
    txt(g, "¡PSSSS!", 386, 168, { tam: 170, peso: 400, fam: FC, color: "#05203a", esp: 8 });
    txt(g, "¡PSSSS!", 380, 160, { tam: 170, peso: 400, fam: FC, color: gr, borde: "#05203a", bordeAncho: 13, esp: 8, glow: "rgba(200,235,255,.9)", glowTam: 26 });
    CT.set("t", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses(), fr = this.franjas(t);
    fondo(g, "#000");
    g.drawImage(this.fondoFijo(), -60, -60);
    // lentejas en el suelo
    if (this.cSuelo) g.drawImage(this.cSuelo, -60, PIES - 12);
    this.olla(g, t);
    // sombras
    g.fillStyle = "rgba(0,0,0,.28)";
    for (const m of [e.mG, e.mM]) { const q = aPant(m, [39, 232]); g.beginPath(); g.ellipse(q[0], PIES + 2, 54, 8, 0, 0, 6.283); g.fill(); }
    // el géiser (columna)
    if (t > T_ABRE && t < T_LLUVIA + 0.2) {
      const k = tramo(t, T_ABRE, T_ABRE + 0.2) * (1 - tramo(t, T_LLUVIA - 0.1, T_LLUVIA + 0.2)), top = lerp(VALV[1], 0, eOut(tramo(t, T_ABRE, T_TECHO)));
      g.save(); g.globalAlpha = k;
      const gr = g.createLinearGradient(VALV[0] - 30, 0, VALV[0] + 30, 0);
      gr.addColorStop(0, "rgba(138,82,34,0)"); gr.addColorStop(0.5, "rgba(150,95,40,.85)"); gr.addColorStop(1, "rgba(138,82,34,0)");
      g.fillStyle = gr; g.beginPath(); g.moveTo(VALV[0] - 8, VALV[1] - 6); g.lineTo(VALV[0] - 34, top); g.lineTo(VALV[0] + 34, top); g.lineTo(VALV[0] + 8, VALV[1] - 6); g.closePath(); g.fill();
      if (top < 20) { g.fillStyle = "rgba(140,90,40,.7)"; g.beginPath(); g.ellipse(VALV[0], 8, 160 * k, 26, 0, 0, 6.283); g.fill(); }
      g.restore();
    }
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    this.dibujarCucharon(g, e, t);
    const mo = this.monte(t);
    this.monton(g, e.mG, mo, t, "guillermo");
    this.monton(g, e.mM, mo, t, "bombero", !!e.cascoMano);
    // el casco de cuenco, lleno de lentejas
    if (e.cascoMano) {
      const { c, ang } = e.cascoMano, e2 = 88 / 94;
      g.save(); g.translate(c[0], c[1]); g.rotate(ang); g.translate(-44 * e2, -18 * e2); cascoBombero(g, 88 * e2); g.restore();
      if (ang > 2.5) {
        const n = t > T_CUCHARA + 0.1 ? 26 : 34;
        for (let i = 0; i < n; i++) { const [u, v, cc, a] = this.puntos[i]; g.fillStyle = LENTEJA[cc]; g.beginPath(); g.ellipse(c[0] + u * 36 * (1 - v * 0.5), c[1] - 14 - v * 12 + Math.abs(u) * 6, 4, 2.8, a, 0, 6.283); g.fill(); }
      }
    }
    // gota de sudor (cámara lenta)
    if (t > T_LENTA + 0.6 && t < T_ABRE) {
      const c = aPant(e.mM, [60, 30]), d = ((t - T_LENTA - 0.6) * 0.35) % 1;
      g.fillStyle = "#8ad0ff"; g.beginPath(); g.moveTo(c[0], c[1] + d * 40 - 10); g.quadraticCurveTo(c[0] + 8, c[1] + d * 40 + 6, c[0], c[1] + d * 40 + 8); g.quadraticCurveTo(c[0] - 8, c[1] + d * 40 + 6, c[0], c[1] + d * 40 - 10); g.fill();
    }
    // lentejas volando
    for (const q of this.len) { g.fillStyle = LENTEJA[q.c]; g.beginPath(); g.ellipse(q.x, q.y, q.r, q.r * 0.72, q.a, 0, 6.283); g.fill(); }
    this.p.dibujar(g);
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    // pitido de la olla (también a cámara lenta)
    if (t < T_ABRE) {
      const L = this.lento(t), k = L < 0.5 ? 0.7 : 1;
      g.save(); g.translate(VALV[0] + 70, VALV[1] - 70); g.rotate(0.1 + 0.05 * Math.sin(t * 30 * L)); g.globalAlpha = tramo(t, 0.15, 0.4);
      txt(g, L < 0.5 ? "¡piiiiiii…!" : "¡PIIII!", 0, 0, { tam: 44 * k, peso: 400, fam: FC, color: "#fffdf5", borde: "#1b1b1b", bordeAncho: 8, esp: 2 });
      g.restore();
    }
    ono("¡PLIC, PLIC!", 760, 160, T_LLUVIA + 0.4, 0.8, 42, "#ffd9a0", "#3a1a00", 0.1);
    ono("¡RICAS!", 320, 210, T_PRUEBA + 0.1, 1.0, 62, "#ffd34d", "#3a2400", -0.1);
    // ¡PSSSS!
    if (t > T_ABRE && t < T_SECA + 0.6) {
      const d = t - T_ABRE, k = tramo(d, 0, 0.14), sal = tramo(t, T_SECA + 0.3, T_SECA + 0.6);
      const s = lerp(1.7, 1, eIn(k)) * (1 + 0.04 * Math.sin(d * 18)) * 0.95;
      const r = this.rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - sal); g.translate(250 + azar(-2, 2), 130); g.rotate(-0.08); g.scale(s * 0.7, s * 0.7);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    // franjas de cine (cámara lenta)
    if (fr > 0) {
      g.fillStyle = "#000"; g.fillRect(-60, -60, W + 120, 60 + 62 * fr); g.fillRect(-60, H - 62 * fr, W + 120, 62 * fr + 60);
      g.fillStyle = `rgba(30,40,60,${0.18 * fr})`; g.fillRect(-60, -60, W + 120, H + 120);
      txt(g, "CÁMARA LENTA", 512, H - 22 * fr, { tam: 22, peso: 800, fam: FT, color: "#ffffff", esp: 6, alfa: fr * (0.6 + 0.4 * Math.sin(t * 4)) });
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.4), tramo(t, T_FIN, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00215", nombre: "La olla exprés", crear: () => new OllaExpres() });
})();
