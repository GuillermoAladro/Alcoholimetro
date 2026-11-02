"use strict";
/* 00085 · Guillermo y Kiriku · La cata de vino
 *
 * Negro → una vinoteca elegante de noche: pared granate con damasco, zócalo de nogal, barricas
 * apiladas a la izquierda, un botellero de rombos a la derecha (botellas sin etiquetas), un cuadro de
 * viñedo al atardecer, apliques con velas y una lámpara de latón sobre una mesa alta con mantel
 * blanco, un decantador, una vela y un platito de uvas y queso. Guillermo y Kiriku, de pie a los
 * lados de la mesa, cada uno con su copa de tinto.
 *
 * Kiriku coge su copa por el tallo (meñique fuera), la hace girar con suavidad (el vino sube por la
 * pared y deja lágrimas), la huele con los ojos cerrados (volutas de aroma) y da un sorbito: «mm» →
 * Guillermo, impresionado, le imita: la coge con el meñique bien tieso, mira a cámara muy chulo y la
 * hace girar… cada vez más fuerte, hasta que el vino sale de la copa en un anillo que da la vuelta y
 * se le estampa en la cara (las manchas se quedan y gotean) → mirada seria a cámara; Kiriku aguanta la
 * risa → Guillermo vuelve a imitarle: ojos cerrados, nariz dentro de la copa… y sorbe: el vino se le
 * mete por la nariz; ah… ah… ah… ¡achís!: una rociada de vino que acaba en el mantel (Kiriku salva su
 * copa) → se limpia con la muñeca, mira la copa con decisión y se la bebe de un trago, cabeza atrás, y
 * hace gárgaras (burbujas, mofletes temblando) → Kiriku deja su copa y se pellizca el puente de la nariz
 * con los ojos cerrados, suspirando → Guillermo traga, sonríe a cámara con bigote de vino, le da hipo y
 * brinda con la copa vacía; Kiriku abre un ojo hacia la cámara → negro.
 *
 * Sin textos. Las copas se dibujan en coordenadas de pantalla dentro de la mano (debajo de los dedos);
 * el vino es un polígono del interior de la copa recortado por la superficie, que siempre queda
 * horizontal en el mundo (con chapoteo al girar y el volumen conservado). Todo depende de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, mezcla, hash, campana } = M2;
  const G = Guillermo, K = Kiriku;
  const DUR = 14.8;
  const TINTA = "#0b0a0e";

  /* ---------- guion (s) ---------- */
  const T = {
    // Kiriku enseña a catar
    kSale: 0.35, kCoge: 0.72, kAlza: 1.05, kGira0: 1.15, kGira1: 2.45,
    kHuele0: 2.55, kHuele: 2.85, kAspira: 3.0, kAspira1: 3.5,
    kSorbo0: 3.6, kSorbo: 3.85, kSorbo1: 4.15, kMm: 4.2, kBaja: 4.6,
    // Guillermo le imita: el giro
    gSale: 4.05, gCoge: 4.4, gAlza: 4.75, gGira0: 4.85, gChulo: 5.2, gFrenesi: 5.55, derrame: 6.2, cara: 6.5,
    gSerio: 6.95,
    // la nariz
    gHuele0: 7.7, gHunde: 8.02, gSnif: 8.1, gSnif1: 8.42, gPica: 8.5,
    ah1: 8.75, ah2: 9.0, ah3: 9.22, achis: 9.42, kProtege: 8.78,
    gLimpia0: 9.85, gLimpia1: 10.2,
    // el trago y las gárgaras
    gTraga0: 10.28, gTraga: 10.55, gTraga1: 11.05, gGarg0: 11.12, gGarg1: 12.0, gTrague: 12.08,
    kDeja0: 10.35, kDeja: 10.7, kPinza0: 10.85, kPinza: 11.15, kPinza1: 12.85,
    gSonrie: 12.3, hipo: 12.95, gBrinda: 13.25, kOjo: 13.15,
    fin: 13.95
  };

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const lerpAng = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
  const rot = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const RELAJADA = D(0.55, 0.6, 0.55, 0.5, 0.45), ABRE = D(0.85, 0.9, 0.9, 0.85, 0.8), ABIERTA = D(1, 1),
    TALLO = D(0.12, 0.2, 0.16, 0.16, 0.85),       // agarra el tallo con el meñique fuera (pulgar recogido: sin «cuernos»)
    TALLO_G = D(0.1, 0.18, 0.14, 0.16, 1),       // Guillermo: meñique tiesísimo
    PUNO = D(0.15, 0.12, 0.1, 0.1, 0.12),
    PINZA = D(0.55, 0.62, 0.12, 0.1, 0.1);        // pulgar e índice (pellizco en el puente de la nariz)

  /* ---------- caras (mismos campos para los dos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, wi: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* =====================================================================================
   * DISPOSICIÓN (px de pantalla)
   * ===================================================================================== */
  const S = 0.3, SUELO = 562;
  const XG = 376, XK = 656;                         // pelvis de cada uno (Kiriku mira a la izquierda)
  const MESA = { x: 516, y: 334, rx: 86, ry: 12 };
  const PY_PIE = rig => SUELO - (rig.SUELO - rig.PELVIS.y) * S * rig.K;
  const COPA_G0 = { x: 458, y: MESA.y + 4 - 13 }, COPA_K0 = { x: 574, y: MESA.y + 4 - 13 };

  /* =====================================================================================
   * COPA DE VINO (pantalla; origen en el tallo, donde agarra la mano; y hacia abajo)
   * ===================================================================================== */
  const EC = 1.15;                                   // escala de la copa
  const P = (x, y) => ({ x: x * EC, y: y * EC });
  const LADO_D = [[10.5, -36], [11.6, -32.5], [12.8, -28], [13.4, -22], [12.6, -16.5], [9.8, -11.5], [5.5, -8.2], [0, -7]];
  const CUENCO = [...LADO_D.map(([x, y]) => P(x, y)), ...LADO_D.slice(0, -1).reverse().map(([x, y]) => P(-x, y))];
  const INT_D = [[9.4, -35.2], [10.5, -32], [11.6, -27.6], [12.1, -22], [11.3, -17], [8.8, -12.4], [5, -9.4], [0, -8.4]];
  const INT = [...INT_D.map(([x, y]) => P(x, y)), ...INT_D.slice(0, -1).reverse().map(([x, y]) => P(-x, y))];
  const RIM = { y: -36 * EC, r: 10.5 * EC };
  const area = pts => { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p.x * q.y - q.x * p.y; } return Math.abs(a) / 2; };
  const AREA_INT = area(INT);
  // parte del polígono con q·n ≥ c (lo que queda «debajo» de la superficie)
  function recorta(pts, n, c) {
    const out = [], d = q => q.x * n.x + q.y * n.y - c;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], da = d(a), db = d(b);
      if (da >= 0) out.push(a);
      if ((da >= 0) !== (db >= 0)) { const k = da / (da - db); out.push({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), sup: true }); }
    }
    return out;
  }
  function nivel(n, vol) {
    let lo = Infinity, hi = -Infinity;
    for (const q of INT) { const v = q.x * n.x + q.y * n.y; lo = Math.min(lo, v); hi = Math.max(hi, v); }
    const objetivo = vol * AREA_INT;
    for (let i = 0; i < 18; i++) { const m = (lo + hi) / 2; if (area(recorta(INT, n, m)) > objetivo) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  const poli = (g, pts) => { g.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y); g.closePath(); };
  const VINO = "#5e0b20", VINO_C = "#8f1631", VINO_S = "#b0263f", VINO_L = "#d4566c";
  /* c = { x, y, ang, vol, chap (inclinación extra de la superficie), curva (sube por las paredes),
   *       lagrimas (0…1: película en la pared), alto (hasta dónde mojó), burbujas, t } */
  function dibCopa(g, c) {
    g.save(); g.translate(c.x, c.y); g.rotate(c.ang || 0); g.lineJoin = "round"; g.lineCap = "round";
    // pie y tallo
    g.fillStyle = "rgba(226,240,250,0.5)"; g.strokeStyle = TINTA; g.lineWidth = 1.5;
    g.beginPath(); g.ellipse(0, 11 * EC, 11 * EC, 2.8 * EC, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-1.4 * EC, -7.2 * EC); g.lineTo(-1.2 * EC, 10.4 * EC); g.lineTo(1.2 * EC, 10.4 * EC); g.lineTo(1.4 * EC, -7.2 * EC); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.75)"; g.fillRect(-0.6 * EC, -5 * EC, 0.8, 13 * EC);
    // cuenco: fondo del cristal
    g.beginPath(); poli(g, CUENCO); g.fillStyle = "rgba(214,232,246,0.2)"; g.fill();
    g.save(); g.beginPath(); poli(g, INT); g.clip();
    const n = rot({ x: 0, y: 1 }, -(c.ang || 0) + (c.chap || 0));
    const tg = { x: -n.y, y: n.x };
    // lágrimas: película de vino en la pared, por encima de la superficie
    if ((c.lagrimas || 0) > 0.01) {
      g.globalAlpha = 0.28 * c.lagrimas; g.fillStyle = VINO_C;
      const cl0 = nivel(n, Math.min(0.92, (c.vol || 0) + 0.3 * (c.alto || 0.5)));
      const pl = recorta(INT, n, cl0); if (pl.length > 2) { g.beginPath(); poli(g, pl); g.fill(); }
      g.globalAlpha = 0.55 * c.lagrimas; g.strokeStyle = VINO_C; g.lineWidth = 1.3;
      for (let i = 0; i < 6; i++) {
        const u = (i - 2.5) * 3.6 * EC, baja = ((c.t || 0) * 0.07 + hash(i + 3)) % 1;
        const y0 = -30 * EC + 4 * hash(i), y1 = y0 + 4 + 12 * baja;
        g.beginPath(); g.moveTo(u, y0); g.lineTo(u + 0.3, y1); g.stroke();
        g.beginPath(); g.ellipse(u + 0.3, y1 + 1, 1.1, 1.5, 0, 0, Math.PI * 2); g.fillStyle = VINO_C; g.fill();
      }
      g.globalAlpha = 1;
    }
    // vino
    const vol = c.vol || 0;
    let sup = null;
    if (vol > 0.004) {
      const cl = nivel(n, vol), kap = c.curva || 0;
      let pl;
      if (kap > 0.01) {
        // superficie curva: sube por las paredes (giro); se conserva el volumen aproximadamente
        const base = { x: n.x * cl, y: n.y * cl }, U = 15 * EC;
        pl = [];
        for (let i = 0; i <= 16; i++) { const u = -U * 1.6 + (U * 3.2) * i / 16, h = kap * (u * u / (U * U) - 0.33) * U * 0.55;
          pl.push({ x: base.x + tg.x * u - n.x * h, y: base.y + tg.y * u - n.y * h }); }
        const fondo1 = { x: base.x + tg.x * U * 1.6 + n.x * 80, y: base.y + tg.y * U * 1.6 + n.y * 80 }, fondo0 = { x: base.x - tg.x * U * 1.6 + n.x * 80, y: base.y - tg.y * U * 1.6 + n.y * 80 };
        pl.push(fondo1, fondo0);
        sup = { curva: pl.slice(0, 17) };
      } else {
        pl = recorta(INT, n, cl);
        const ss = pl.filter(q => q.sup); if (ss.length >= 2) sup = { a: ss[0], b: ss[1] };
      }
      if (pl.length > 2) {
        const gr = g.createLinearGradient(n.x * cl, n.y * cl, n.x * (cl + 26), n.y * (cl + 26));
        gr.addColorStop(0, VINO_C); gr.addColorStop(1, VINO);
        g.beginPath(); poli(g, pl); g.fillStyle = gr; g.fill();
        // reflejo dentro del vino
        g.save(); g.beginPath(); poli(g, pl); g.clip();
        g.fillStyle = "rgba(255,120,140,0.18)"; g.beginPath(); g.ellipse(-6 * EC, -16 * EC, 2.5 * EC, 6 * EC, 0.2, 0, Math.PI * 2); g.fill();
        // burbujas (al sorber por la nariz o al hacer gárgaras)
        if ((c.burbujas || 0) > 0.01) {
          g.fillStyle = "rgba(255,190,200,0.85)";
          for (let i = 0; i < 7; i++) { const ph = ((c.t || 0) * 2.4 + hash(i + 11)) % 1, bx = (hash(i + 5) - 0.5) * 16 * EC;
            g.globalAlpha = c.burbujas;
            const q = { x: n.x * (cl + 2 + 12 * (1 - ph)) + tg.x * bx, y: n.y * (cl + 2 + 12 * (1 - ph)) + tg.y * bx };
            g.beginPath(); g.arc(q.x, q.y, 0.8 + 1.4 * hash(i + 7), 0, Math.PI * 2); g.fill(); }
          g.globalAlpha = 1;
        }
        g.restore();
        // superficie vista un poco desde arriba
        if (sup && sup.a) {
          const m = mezcla(sup.a, sup.b, 0.5), rx = Math.hypot(sup.b.x - sup.a.x, sup.b.y - sup.a.y) / 2, an = Math.atan2(sup.b.y - sup.a.y, sup.b.x - sup.a.x);
          g.save(); g.translate(m.x, m.y); g.rotate(an);
          g.fillStyle = VINO_S; g.beginPath(); g.ellipse(0, 0, rx, Math.min(2.6 * EC, rx * 0.3), 0, 0, Math.PI * 2); g.fill();
          g.fillStyle = "rgba(255,170,185,0.55)"; g.beginPath(); g.ellipse(-rx * 0.3, -0.5, rx * 0.35, 0.8, 0, 0, Math.PI * 2); g.fill();
          g.restore();
        } else if (sup && sup.curva) {
          g.beginPath(); for (let i = 0; i < sup.curva.length; i++) { const q = sup.curva[i]; if (i) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); }
          g.lineWidth = 2.6 * EC; g.strokeStyle = VINO_S; g.stroke();
          g.lineWidth = 0.9; g.strokeStyle = "rgba(255,170,185,0.7)"; g.stroke();
        }
      }
    }
    g.restore();
    // brillos y contorno del cristal
    g.save(); g.beginPath(); poli(g, CUENCO); g.clip();
    g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 1.8;
    g.beginPath(); g.moveTo(-9.6 * EC, -30 * EC); g.quadraticCurveTo(-11.8 * EC, -21 * EC, -8 * EC, -13 * EC); g.stroke();
    g.lineWidth = 1; g.beginPath(); g.moveTo(9.8 * EC, -27 * EC); g.quadraticCurveTo(10.8 * EC, -22 * EC, 9.6 * EC, -18 * EC); g.stroke();
    g.restore();
    g.beginPath(); poli(g, CUENCO); g.lineWidth = 1.6; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.ellipse(0, RIM.y, RIM.r, 2.3 * EC, 0, 0, Math.PI * 2); g.lineWidth = 1.2; g.strokeStyle = "rgba(15,12,18,0.9)"; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.6)"; g.lineWidth = 0.8; g.beginPath(); g.ellipse(0, RIM.y, RIM.r - 1.5, 1.4 * EC, 0, Math.PI * 1.1, Math.PI * 1.6); g.stroke();
    g.restore();
  }
  // punto de la copa (sistema de la copa) → pantalla
  const enCopa = (c, q) => { const r = rot(q, c.ang || 0); return { x: c.x + r.x, y: c.y + r.y }; };
  // copa con el borde (centro de la boca de la copa desplazado `lado` a lo largo del borde) en un punto
  const copaEn = (pt, ang, lado = 0) => { const r = rot({ x: lado * RIM.r, y: RIM.y }, ang); return { x: pt.x - r.x, y: pt.y - r.y }; };

  /* =====================================================================================
   * MANOS
   * ===================================================================================== */
  let BASE_M = null;
  function conCamara(g, f) { g.save(); g.setTransform(BASE_M); f(); g.restore(); }
  const evalua = (o, t, ctx) => (typeof o === "function" ? o(t, ctx) : o);
  // pista de objetivos de pantalla {x, y, ang, d, mo (desplazamiento del mu), ...}
  function pista(lista, t, ctx) {
    let c = Object.assign({}, evalua(lista[0][2], t, ctx));
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i]; if (t <= t0) break;
      const o = evalua(obj, t, ctx), k = (f || suave)(fase(t, t0, t1));
      c = { x: lerp(c.x, o.x, k), y: lerp(c.y, o.y, k), ang: lerpAng(c.ang || 0, o.ang ?? (c.ang || 0), k),
        d: mezclaD(c.d, o.d || c.d, k), mo: lerp(c.mo || 0, o.mo ?? (c.mo || 0), k), bol: lerp(c.bol || 0, o.bol || 0, k) };
    }
    return c;
  }
  const muHacia = (m, h, off) => Math.atan2(h.y - m.y, h.x - m.x) + off;
  const R_MG = G.MUNECA_R * G.JK;
  const manoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_MG, y: m.y - Math.sin(mu) * R_MG });
  const BOLS_GC = manoDesde({ x: 131, y: 652 }, -1.75), BOLS_GL = manoDesde({ x: 372, y: 648 }, -1.75);
  // objetivo de pantalla → mano del muñeco; bol (0…1) la lleva al bolsillo
  function manoRig(rig, p, m, lado, bolsillo, dobla, objeto) {
    const h = rig.aHoja(p, m), hom = rig.tronco(p)(lado === "cerca" ? rig.HOMBRO_C : rig.HOMBRO);
    const k = clamp(m.bol || 0);
    const mu0 = muHacia(h, hom, (m.mo || 0)), x = lerp(h.x, bolsillo.x, k), y = lerp(h.y, bolsillo.y, k);
    return { x, y, ang: 0, mu: lerpAng(mu0, -1.75, k), puno: 1 - k, dedos: m.d, dobla, objeto: k < 0.5 ? objeto : null };
  }

  /* =====================================================================================
   * KIRIKU (derecha, mira a la izquierda)
   * ===================================================================================== */
  const CARAS_K = {
    inicio: E({ mx: 0.55, my: 0.6, c: 0.35, sd: 6, gd: 0.03, si: 6, gi: 0.03, sonr: 0.35, ancho: 0.9 }),
    admira: E({ mx: 0.4, my: 0.55, c: 0.42, sd: 10, gd: 0.05, si: 10, gi: 0.05, sonr: 0.4, ancho: 0.85 }),
    huele: E({ c: 1, sd: 14, gd: 0.07, si: 14, gi: 0.07, sonr: 0.3, ancho: 0.8 }),
    aspira: E({ c: 1, sd: 20, gd: 0.1, si: 20, gi: 0.1, sonr: 0.2, ancho: 0.7 }),
    sorbo: E({ c: 0.85, sd: 12, gd: 0.05, si: 12, gi: 0.05, abre: 2, ancho: 0.5, sonr: 0.05 }),
    mm: E({ c: 1, h: 0.7, sd: 16, gd: 0.08, si: 16, gi: 0.08, sonr: 0.6, ancho: 0.7 }),
    miraG: E({ mx: 0.9, my: 0.15, c: 0.3, sd: 8, gd: 0.03, si: 8, gi: 0.03, sonr: 0.35, ancho: 0.9 }),
    ceja: E({ mx: 0.9, my: 0.12, c: 0.32, sd: 26, gd: 0.12, si: 0, gi: -0.05, sonr: 0, ancho: 0.8 }),
    alarma: E({ mx: 0.9, my: 0.1, iris: 0.85, c: 0, sd: 26, gd: 0.18, si: 26, gi: 0.18, abre: 12, ancho: 0.6, sonr: -0.25 }),
    contiene: E({ mx: 0.9, my: 0.1, c: 0.5, h: 0.35, sd: 10, gd: 0.05, si: 10, gi: 0.05, abre: 0, ancho: 0.62, sonr: 0.5, mof: 0.4 }),
    curioso: E({ mx: 0.9, my: 0.15, c: 0.25, sd: 14, gd: 0.06, si: 18, gi: 0.1, sonr: 0.25, ancho: 0.85 }),
    preocupa: E({ mx: 0.9, my: 0.15, c: 0.2, sd: 18, gd: 0.2, si: 18, gi: 0.2, abre: 3, ancho: 0.7, sonr: -0.15 }),
    aparta: E({ mx: -0.3, c: 1, z: 1, sd: 12, gd: 0.18, si: 12, gi: 0.18, abre: 0, ancho: 0.6, sonr: -0.4 }),
    pasmo: E({ mx: 0.9, my: -0.1, iris: 0.8, c: 0, sd: 28, gd: 0.15, si: 28, gi: 0.15, abre: 14, ancho: 0.55, sonr: -0.1 }),
    suspiro: E({ c: 1, sd: 4, gd: 0.22, si: 4, gi: 0.22, abre: 3, ancho: 0.6, sonr: -0.25 }),
    camara: E({ mx: -0.85, my: 0.05, c: 0.45, wd: 0.55, sd: 2, gd: 0.05, si: 18, gi: 0.08, sonr: 0.05, ancho: 0.8 })
  };
  const GUION_CARA_K = [
    [T.kCoge - 0.2, T.kCoge + 0.1, "admira"], [T.kHuele0 + 0.05, T.kHuele, "huele"], [T.kAspira, T.kAspira + 0.25, "aspira"],
    [T.kSorbo0 + 0.1, T.kSorbo, "sorbo"], [T.kMm - 0.05, T.kMm + 0.2, "mm"], [T.kBaja + 0.05, T.kBaja + 0.3, "miraG"],
    [T.gFrenesi + 0.1, T.gFrenesi + 0.35, "ceja"], [T.derrame - 0.02, T.derrame + 0.12, "alarma"], [T.cara + 0.25, T.cara + 0.5, "contiene"],
    [T.gHuele0, T.gHuele0 + 0.3, "curioso"], [T.gPica, T.gPica + 0.2, "preocupa"], [T.kProtege - 0.05, T.kProtege + 0.12, "alarma"],
    [T.achis - 0.06, T.achis + 0.04, "aparta"], [T.gLimpia0 - 0.1, T.gLimpia0 + 0.2, "preocupa"], [T.gTraga, T.gTraga + 0.2, "pasmo"],
    [T.kPinza0, T.kPinza0 + 0.3, "suspiro"], [T.kOjo, T.kOjo + 0.25, "camara"]
  ];
  const CUERPOS_K = {
    inicio: { torso: 0.02, cab: 0.02 }, coge: { torso: 0.08, cab: 0.1 }, alza: { torso: 0.02, cab: 0.06 },
    huele: { torso: 0.07, cab: 0.26 }, sorbo: { torso: 0.04, cab: 0.14 }, mm: { torso: -0.03, cab: -0.12 },
    mira: { torso: 0.02, cab: 0.04 }, ceja: { torso: -0.02, cab: -0.02 }, atras: { torso: -0.08, cab: -0.08 },
    curioso: { torso: 0.04, cab: 0.08 }, protege: { torso: -0.13, cab: -0.1 }, aparta: { torso: -0.15, cab: -0.22 },
    deja: { torso: 0.1, cab: 0.1 }, pinza: { torso: 0.05, cab: 0.2 }, camara: { torso: 0.02, cab: 0.12 }
  };
  const GUION_CUERPO_K = [
    [T.kSale, T.kCoge, "coge"], [T.kCoge + 0.05, T.kAlza + 0.1, "alza"], [T.kHuele0, T.kHuele, "huele"], [T.kSorbo0, T.kSorbo, "sorbo"],
    [T.kSorbo1, T.kMm + 0.25, "mm"], [T.kBaja, T.kBaja + 0.35, "mira"], [T.gFrenesi + 0.1, T.gFrenesi + 0.4, "ceja"],
    [T.derrame, T.derrame + 0.25, "atras"], [T.gSerio, T.gSerio + 0.4, "mira"], [T.gHuele0, T.gHuele0 + 0.4, "curioso"],
    [T.kProtege, T.kProtege + 0.25, "protege"], [T.achis - 0.05, T.achis + 0.08, "aparta"], [T.gLimpia0, T.gLimpia0 + 0.35, "mira"],
    [T.kDeja0, T.kDeja, "deja"], [T.kPinza0, T.kPinza, "pinza"], [T.kOjo, T.kOjo + 0.3, "camara"]
  ];

  // giro de muñeca: elipse en pantalla (amplitud x, y) con su fase
  function giroK(t) {
    const k = dentro(t, T.kGira0, T.kGira0 + 0.3, T.kGira1 - 0.3, T.kGira1);
    const ph = (t - T.kGira0) * Math.PI * 2 * 1.6;
    return { k, ph, dx: 5.5 * k * Math.cos(ph), dy: 1.6 * k * Math.sin(ph), w: Math.PI * 2 * 1.6 };
  }
  function volK(t) { return 0.36 - 0.05 * tramo(t, T.kSorbo, T.kSorbo1); }

  function poseK(t) {
    const b = guion(GUION_CUERPO_K, CUERPOS_K, "inicio", t);
    const respira = Math.sin(t * 2.0 + 0.7);
    const p = {
      x: XK, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // al aspirar el pecho sube; en el suspiro los hombros caen
    const aspira = campana(t, T.kAspira, T.kAspira1 + 0.15), suspira = campana(t, T.kPinza, T.kPinza + 1.0);
    p.torsoEsc.y += 0.02 * aspira - 0.015 * suspira;
    // «no, no»: la cabeza se mueve despacio mientras se pellizca la nariz
    const nono = dentro(t, T.kPinza + 0.5, T.kPinza + 0.8, T.kPinza1 - 0.3, T.kPinza1);
    p.cabeza.ang += 0.05 * Math.sin((t - T.kPinza) * 6) * nono;
    p.pelvis = K.aHoja(p, { x: XK, y: PY_PIE(K) + respira * 0.8 + 1.5 * suspira });
    // piernas: tobillos bajo las caderas
    const TOB = K.SUELO - K.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: K.CADERA.cerca.x - 4, y: TOB }, ang: 0 };
    p.piernas.lejos = { tob: { x: K.CADERA.lejos.x + 10, y: TOB }, ang: 0 };
    const ex = guion(GUION_CARA_K, CARAS_K, "inicio", t);
    // mira la copa de Guillermo mientras gira
    p.cara = cara(ex, parpadeo(t, [0.5, 4.75, 7.4, 10.1, 12.2]));
    manosK(p, t);
    return p;
  }

  function manosK(p, t) {
    const boca = K.aPantalla(p, K.boca(p)), H = K.cabeza(p);
    const nariz = K.aPantalla(p, H.a({ x: 930, y: 484 })), puente = K.aPantalla(p, H.a({ x: 912, y: 418 }));
    const gi = giroK(t);
    const pecho = { x: 586 + gi.dx, y: 288 + gi.dy, ang: 0, d: TALLO };
    // huele: la nariz sobre la boca de la copa (inclinada hacia él)
    const huele = tt => { const a = 0.78, c = copaEn({ x: nariz.x - 7, y: nariz.y + 9 }, a, 0); return { x: c.x, y: c.y, ang: a, d: TALLO }; };
    // sorbo: el borde toca el labio
    const sorbo = tt => { const a = 0.95, c = copaEn({ x: boca.x - 2, y: boca.y + 1 }, a, 1); return { x: c.x, y: c.y, ang: a, d: TALLO }; };
    const mesa = { x: COPA_K0.x, y: COPA_K0.y, ang: 0, d: TALLO };
    const PL = [
      [0, 0, { x: COPA_K0.x + 20, y: COPA_K0.y + 30, ang: 0, d: RELAJADA, bol: 1 }],
      [T.kSale, T.kCoge - 0.08, { x: COPA_K0.x, y: COPA_K0.y - 4, ang: 0, d: ABRE, bol: 0 }],
      [T.kCoge - 0.08, T.kCoge + 0.05, mesa],
      [T.kAlza - 0.25, T.kAlza + 0.1, () => pecho],
      [T.kHuele0, T.kHuele, huele],
      [T.kSorbo0, T.kSorbo, sorbo],
      [T.kSorbo1, T.kBaja, { x: 590, y: 286, ang: 0, d: TALLO }],
      [T.derrame, T.derrame + 0.25, { x: 598, y: 278, ang: -0.05, d: TALLO }],
      [T.gSerio, T.gSerio + 0.4, { x: 590, y: 287, ang: 0, d: TALLO }],
      // la protege contra el pecho
      [T.kProtege - 0.05, T.kProtege + 0.2, { x: 604, y: 276, ang: -0.12, d: TALLO }],
      [T.gLimpia0, T.gLimpia0 + 0.3, { x: 592, y: 287, ang: 0, d: TALLO }],
      // la deja en la mesa
      [T.kDeja0, T.kDeja, mesa],
      [T.kDeja + 0.02, T.kDeja + 0.12, { x: COPA_K0.x + 1, y: COPA_K0.y - 3, ang: 0, d: ABRE }],
      // se pellizca el puente de la nariz
      [T.kPinza0, T.kPinza, () => ({ x: puente.x - 11, y: puente.y + 17, ang: 0, d: PINZA, mo: -0.35 })],
      [T.kPinza1, T.kPinza1 + 0.35, { x: 598, y: 300, ang: 0, d: RELAJADA, mo: 0 }],
      [T.kPinza1 + 0.35, T.kPinza1 + 0.75, { x: COPA_K0.x + 20, y: COPA_K0.y + 30, ang: 0, d: RELAJADA, bol: 1 }]
    ];
    const l = pista(PL, t);
    const lleva = t >= T.kCoge + 0.05 && t < T.kDeja + 0.015;
    const copa = lleva ? { x: l.x, y: l.y, ang: l.ang } : { x: COPA_K0.x, y: COPA_K0.y, ang: 0 };
    Object.assign(copa, { vol: volK(t), t, chap: chapK(t), curva: 0.55 * gi.k, lagrimas: lagrimasK(t), alto: 0.8 });
    p.copa = copa; p.copaEnMano = lleva;
    p.manoLejos = manoRig(K, p, l, "lejos", K.BOLSILLO_L, -1, lleva ? (g => conCamara(g, () => dibCopa(g, copa))) : null);
    p.manoCerca = K.manoReposo(p, "cerca");
    void boca;
  }
  // chapoteo del vino de Kiriku: sigue el giro con retraso y se calma después
  function chapK(t) {
    const gi = giroK(t);
    const alza = 0.12 * Math.exp(-Math.max(0, t - T.kAlza) * 5) * Math.sin(Math.max(0, t - T.kAlza) * 13) * (t > T.kAlza ? 1 : 0);
    const calma = t > T.kGira1 ? 0.1 * Math.exp(-(t - T.kGira1) * 3.5) * Math.sin((t - T.kGira1) * 11) : 0;
    return 0.26 * gi.k * Math.sin(gi.ph - 0.9) + alza + calma;
  }
  const lagrimasK = t => tramo(t, T.kGira0 + 0.4, T.kGira1) * (1 - 0.6 * tramo(t, T.kGira1 + 2, T.kGira1 + 6));

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha)
   * ===================================================================================== */
  const CARAS_G = {
    inicio: E({ mx: 0.9, my: 0.25, c: 0.2, sd: 10, gd: 0.04, si: 12, gi: 0.06, abre: 0, ancho: 0.9, sonr: 0.3 }),
    atento: E({ mx: 0.9, my: 0.2, c: 0.15, sd: 12, gd: 0.05, si: 14, gi: 0.07, abre: 2, ancho: 0.85, sonr: 0.25 }),
    impres: E({ mx: 0.9, my: 0.1, c: 0, sd: 22, gd: 0.12, si: 24, gi: 0.14, abre: 12, ancho: 0.55, sonr: 0.08 }),
    decidido: E({ mx: 0.55, my: 0.55, c: 0.35, sd: -2, gd: -0.1, si: 6, gi: 0.02, sonr: 0.5, ancho: 1.02 }),
    camara: E({ mx: -0.85, my: 0, c: 0.42, sd: 14, gd: 0.06, si: 14, gi: 0.06, abre: 2, ancho: 1.05, sonr: 0.85 }),
    frenesi: E({ mx: 0.55, my: 0.6, c: 0.25, sd: -4, gd: -0.12, si: 4, gi: -0.02, abre: 10, ancho: 1.05, sonr: 0.7 }),
    horror: E({ mx: 0.5, my: 0.4, iris: 0.8, c: 0, sd: 26, gd: 0.2, si: 26, gi: 0.2, abre: 18, ancho: 0.6, sonr: -0.3 }),
    salpica: E({ mx: 0, my: 0, c: 1, z: 1, sd: 6, gd: 0.04, si: 6, gi: 0.04, abre: 0, ancho: 0.8, sonr: -0.5 }),
    serio: E({ mx: -0.85, my: 0, c: 0.48, sd: -2, gd: -0.04, si: -2, gi: -0.04, abre: 0, ancho: 0.75, sonr: -0.15 }),
    huele: E({ c: 1, sd: 18, gd: 0.06, si: 18, gi: 0.06, sonr: 0.45, ancho: 0.85 }),
    snif: E({ c: 1, z: 0.7, sd: 10, gd: 0.04, si: 10, gi: 0.04, abre: 0, ancho: 0.5, sonr: 0, mof: 0.35 }),
    pica: E({ mx: 0.1, my: 0.1, iris: 0.72, c: 0, sd: 28, gd: 0.2, si: 28, gi: 0.2, abre: 6, ancho: 0.5, sonr: -0.4 }),
    ah: E({ mx: 0, my: -0.4, c: 0.75, sd: 22, gd: 0.16, si: 22, gi: 0.16, abre: 20, ancho: 0.7, sonr: -0.2 }),
    achis: E({ c: 1, z: 1, sd: 4, gd: 0.1, si: 4, gi: 0.1, abre: 28, ancho: 0.95, sonr: -0.3 }),
    aturdido: E({ mx: 0.7, my: 0.3, c: 0.45, sd: 8, gd: 0.1, si: 8, gi: 0.1, abre: 3, ancho: 0.8, sonr: -0.1 }),
    decide2: E({ mx: 0.6, my: 0.55, c: 0.4, sd: -6, gd: -0.14, si: -6, gi: -0.14, abre: 0, ancho: 0.85, sonr: 0.25 }),
    traga: E({ c: 1, sd: 10, gd: 0.04, si: 10, gi: 0.04, abre: 14, ancho: 0.6, sonr: 0, mof: 0.4 }),
    gargara: E({ c: 1, z: 0.5, sd: 14, gd: 0.06, si: 14, gi: 0.06, abre: 26, ancho: 0.78, sonr: 0 }),
    trague: E({ mx: 0.2, my: 0, iris: 0.85, c: 0, sd: 22, gd: 0.1, si: 22, gi: 0.1, abre: 0, ancho: 0.7, sonr: 0.1, mof: 0.3 }),
    satisfecho: E({ mx: -0.85, my: 0, c: 0.3, h: 0.6, sd: 14, gd: 0.05, si: 14, gi: 0.05, abre: 10, ancho: 1.1, sonr: 0.95 }),
    hipo: E({ mx: -0.85, my: 0, iris: 0.85, c: 0, sd: 24, gd: 0.1, si: 24, gi: 0.1, abre: 9, ancho: 0.6, sonr: 0.2 }),
    final: E({ mx: -0.85, my: 0, c: 0.38, h: 0.4, sd: 12, gd: 0.04, si: 16, gi: 0.08, abre: 4, ancho: 1.0, sonr: 0.85 })
  };
  const GUION_CARA_G = [
    [T.kHuele0, T.kHuele0 + 0.25, "impres"], [T.kMm + 0.1, T.kMm + 0.35, "atento"], [T.gSale + 0.1, T.gCoge, "decidido"],
    [T.gChulo, T.gChulo + 0.2, "camara"], [T.gFrenesi, T.gFrenesi + 0.2, "frenesi"], [T.derrame + 0.02, T.derrame + 0.12, "horror"],
    [T.cara - 0.03, T.cara + 0.05, "salpica"], [T.gSerio - 0.05, T.gSerio + 0.25, "serio"], [T.gHuele0, T.gHuele0 + 0.25, "huele"],
    [T.gSnif, T.gSnif + 0.08, "snif"], [T.gPica - 0.02, T.gPica + 0.06, "pica"], [T.ah1 - 0.1, T.ah3, "ah"],
    [T.achis - 0.04, T.achis + 0.02, "achis"], [T.achis + 0.3, T.achis + 0.55, "aturdido"], [T.gTraga0, T.gTraga0 + 0.25, "decide2"],
    [T.gTraga - 0.08, T.gTraga + 0.1, "traga"], [T.gGarg0, T.gGarg0 + 0.15, "gargara"], [T.gTrague - 0.03, T.gTrague + 0.08, "trague"],
    [T.gSonrie - 0.05, T.gSonrie + 0.2, "satisfecho"], [T.hipo - 0.03, T.hipo + 0.05, "hipo"], [T.hipo + 0.3, T.hipo + 0.55, "final"]
  ];
  const CUERPOS_G = {
    inicio: { torso: 0.03, cab: 0.02 }, mira: { torso: 0.05, cab: 0.07 }, coge: { torso: 0.1, cab: 0.08 },
    chulo: { torso: -0.02, cab: -0.06 }, frenesi: { torso: 0.05, cab: 0.1 }, salpica: { torso: -0.12, cab: -0.26 },
    serio: { torso: 0.01, cab: 0.0 }, huele: { torso: 0.07, cab: 0.28 }, snif: { torso: 0.08, cab: 0.32 },
    pica: { torso: -0.06, cab: -0.14 }, ah1: { torso: -0.04, cab: -0.16 }, ah2: { torso: -0.08, cab: -0.26 }, ah3: { torso: -0.11, cab: -0.36 },
    achis: { torso: 0.17, cab: 0.36 }, tras: { torso: 0.04, cab: 0.06 }, limpia: { torso: 0.04, cab: 0.1 },
    decide: { torso: 0.02, cab: 0.02 }, traga: { torso: -0.12, cab: -0.55 }, gargara: { torso: -0.16, cab: -0.78 },
    trague: { torso: 0.02, cab: 0.04 }, sonrie: { torso: 0.0, cab: -0.04 }, brinda: { torso: 0.02, cab: -0.02 }
  };
  const GUION_CUERPO_G = [
    [T.kGira0, T.kGira0 + 0.4, "mira"], [T.gSale, T.gCoge, "coge"], [T.gCoge + 0.05, T.gChulo + 0.1, "chulo"],
    [T.gFrenesi, T.gFrenesi + 0.4, "frenesi"], [T.cara - 0.02, T.cara + 0.1, "salpica", salida], [T.cara + 0.25, T.gSerio + 0.1, "serio"],
    [T.gHuele0, T.gHunde, "huele"], [T.gSnif, T.gSnif + 0.15, "snif"], [T.gPica - 0.03, T.gPica + 0.08, "pica", salida],
    [T.ah1 - 0.1, T.ah1 + 0.06, "ah1"], [T.ah2 - 0.06, T.ah2 + 0.06, "ah2"], [T.ah3 - 0.06, T.ah3 + 0.06, "ah3"],
    [T.achis - 0.03, T.achis + 0.05, "achis", salida], [T.achis + 0.15, T.achis + 0.45, "tras"], [T.gLimpia0, T.gLimpia0 + 0.15, "limpia"],
    [T.gTraga0 - 0.1, T.gTraga0 + 0.15, "decide"], [T.gTraga - 0.15, T.gTraga + 0.05, "traga"], [T.gGarg0, T.gGarg0 + 0.15, "gargara"],
    [T.gTrague - 0.03, T.gTrague + 0.12, "trague"], [T.gSonrie, T.gSonrie + 0.3, "sonrie"], [T.gBrinda, T.gBrinda + 0.3, "brinda"]
  ];

  // el giro de Guillermo: empieza pequeño y se desboca
  function giroG(t) {
    const on = tramo(t, T.gGira0, T.gGira0 + 0.25) * (1 - tramo(t, T.derrame + 0.12, T.derrame + 0.4));
    const a = lerp(5, 17, tramo(t, T.gFrenesi - 0.1, T.derrame - 0.05, entrada));
    // fase: frecuencia que sube de 1,6 a 3,4 vueltas/s (integrada a mano)
    const f0 = 1.6, f1 = 3.4, ta = T.gFrenesi - 0.1, tb = T.derrame;
    let ph;
    if (t < ta) ph = (t - T.gGira0) * f0;
    else if (t < tb) { const u = t - ta, Lb = tb - ta; ph = (ta - T.gGira0) * f0 + f0 * u + (f1 - f0) * u * u / (2 * Lb); }
    else ph = (ta - T.gGira0) * f0 + f0 * (tb - ta) + (f1 - f0) * (tb - ta) / 2 + f1 * (t - tb);
    ph *= Math.PI * 2;
    const k = on;
    return { k, a, ph, dx: a * k * Math.cos(ph), dy: a * 0.32 * k * Math.sin(ph), fuerza: k * tramo(t, T.gFrenesi - 0.1, T.derrame, entrada) };
  }
  function volG(t) {
    let v = 0.46;
    v -= 0.25 * tramo(t, T.derrame, T.derrame + 0.24, s => s);
    v -= 0.07 * tramo(t, T.gSnif, T.gSnif1);
    v *= 1 - tramo(t, T.gTraga + 0.05, T.gTraga1, s => s);
    return Math.max(0, v);
  }

  function poseG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const respira = Math.sin(t * 2.3);
    const p = {
      x: XG, suelo: SUELO, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.005 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // el cuerpo sigue el giro desbocado
    const gi = giroG(t);
    p.torso += 0.05 * gi.fuerza * Math.cos(gi.ph - 0.4); p.cabeza.ang += 0.06 * gi.fuerza * Math.cos(gi.ph - 0.9);
    // salpicadura: rebote amortiguado de la cabeza
    if (t > T.cara) { const u = t - T.cara; p.cabeza.ang += 0.08 * Math.exp(-u * 6) * Math.sin(u * 22); }
    // trago: la garganta sube y baja; gárgaras: la cabeza tiembla
    const glu = dentro(t, T.gTraga, T.gTraga + 0.05, T.gTraga1 - 0.05, T.gTraga1);
    p.cabeza.dy += 3 * Math.abs(Math.sin((t - T.gTraga) * Math.PI * 5.5)) * glu;
    const garg = dentro(t, T.gGarg0 + 0.05, T.gGarg0 + 0.15, T.gGarg1 - 0.1, T.gGarg1);
    p.cabeza.ang += 0.025 * Math.sin(t * 47) * garg; p.cabeza.dx += 1.5 * Math.sin(t * 39) * garg;
    // hipo: brinco
    const hip = campana(t, T.hipo - 0.02, T.hipo + 0.2);
    const ach = campana(t, T.achis - 0.02, T.achis + 0.25);
    p.pelvis = G.aHoja(p, { x: XG + 3 * ach, y: PY_PIE(G) + respira * 0.9 - 9 * hip + 3 * ach });
    const TOB = G.SUELO - G.TOBILLO_ALTO;
    const pies = 9 * hip / (S * G.K);
    p.piernas.cerca = { tob: { x: G.CADERA.cerca.x - 6, y: TOB - pies }, ang: 0 };
    p.piernas.lejos = { tob: { x: G.CADERA.lejos.x + 14, y: TOB - pies }, ang: 0 };
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    // sigue con los ojos la copa de Kiriku mientras gira
    const sigue = dentro(t, T.kGira0, T.kGira0 + 0.2, T.kGira1 - 0.1, T.kGira1 + 0.1);
    if (sigue > 0) { const gk = giroK(t); ex.mx = lerp(ex.mx, 0.9 + 0.08 * Math.cos(gk.ph), sigue); ex.my = lerp(ex.my, 0.35 + 0.1 * Math.sin(gk.ph), sigue); }
    // ah… ah… ah…: la boca se abre a golpes
    const ahs = [T.ah1, T.ah2, T.ah3].reduce((s, a) => s + 0.35 * campana(t, a - 0.12, a + 0.2), 0);
    ex.abre += 14 * ahs;
    // gárgaras: mofletes y boca temblando
    if (garg > 0) { ex.mof = lerp(ex.mof, 0.4 + 0.25 * Math.sin(t * 31), garg); ex.abre += 4 * Math.sin(t * 37) * garg; }
    // trague: carrillos llenos un instante
    p.cara = cara(ex, parpadeo(t, [0.6, 2.2, 3.4, 5.0, 7.45, 10.05, 13.6]));
    p.rojo = 0.32 * dentro(t, T.gPica, T.gPica + 0.15, T.achis + 0.25, T.achis + 0.9) + 0.18 * campana(t, T.cara, T.cara + 0.8);
    p.sudor = 0.5 * dentro(t, T.ah1, T.ah1 + 0.2, T.achis, T.achis + 0.3);
    manosG(p, t);
    p.capaCabeza = (g, tt) => capaCabezaG(g, tt, p);
    return p;
  }

  function manosG(p, t) {
    const H = G.cabeza(p), boca = G.aPantalla(p, G.boca(p)), nariz = G.aPantalla(p, H.a({ x: 846, y: 694 }));
    const gi = giroG(t);
    const pecho = { x: 442, y: 284, ang: 0, d: TALLO_G };
    // el giro: el centro sube hacia la barbilla a medida que se anima
    const gira = () => { const s = tramo(t, T.gFrenesi - 0.1, T.derrame, salida); return { x: lerp(442, 450, s) + gi.dx, y: lerp(282, 290, s) + gi.dy, ang: 0.06 * gi.fuerza * Math.sin(gi.ph), d: TALLO_G }; };
    // la nariz dentro de la copa
    const hunde = tt => { const a = -0.82, c = copaEn({ x: nariz.x + 5, y: nariz.y + 6 }, a, 0); return { x: c.x, y: c.y, ang: a, d: TALLO_G }; };
    // el trago: copa boca abajo sobre la boca abierta
    const traga = tt => { const a = lerp(-1.75, -2.25, tramo(tt, T.gTraga, T.gTraga1)), c = copaEn({ x: boca.x + 2, y: boca.y - 4 }, a, -0.35); return { x: c.x, y: c.y, ang: a, d: TALLO_G }; };
    // se limpia la nariz con la muñeca (la copa casi vacía, inclinada)
    const limpia = tt => { const u = tramo(tt, T.gLimpia0 + 0.1, T.gLimpia1 - 0.05); return { x: nariz.x + 32 - 22 * u, y: nariz.y + 30, ang: -0.35, d: TALLO_G, mo: 0.4 }; };
    const PL = [
      [0, 0, { x: COPA_G0.x - 30, y: COPA_G0.y + 40, ang: 0, d: RELAJADA, bol: 1 }],
      [T.gSale, T.gCoge - 0.08, { x: COPA_G0.x, y: COPA_G0.y - 4, ang: 0, d: ABRE, bol: 0 }],
      [T.gCoge - 0.08, T.gCoge + 0.05, { x: COPA_G0.x, y: COPA_G0.y, ang: 0, d: TALLO_G }],
      [T.gAlza - 0.25, T.gAlza, pecho],
      [T.gGira0 - 0.02, T.gGira0 + 0.1, gira],
      [T.derrame + 0.12, T.derrame + 0.3, { x: 446, y: 282, ang: -0.1, d: TALLO_G }],
      [T.cara, T.cara + 0.25, { x: 446, y: 282, ang: 0.05, d: TALLO_G }],
      [T.gHuele0, T.gHunde, hunde],
      [T.gPica - 0.02, T.gPica + 0.18, { x: 446, y: 292, ang: -0.1, d: TALLO_G }, salida],
      [T.ah2, T.ah3 + 0.1, { x: 438, y: 312, ang: 0.1, d: TALLO_G }],
      [T.achis - 0.03, T.achis + 0.08, { x: 442, y: 318, ang: 0.2, d: TALLO_G }],
      [T.gLimpia0, T.gLimpia0 + 0.12, limpia],
      [T.gLimpia1, T.gTraga0 + 0.1, { x: 446, y: 282, ang: 0, d: TALLO_G }],
      [T.gTraga0 + 0.1, T.gTraga - 0.02, traga],
      [T.gTraga1 + 0.02, T.gGarg0 + 0.3, { x: 452, y: 296, ang: 0.25, d: TALLO_G }],
      [T.gTrague, T.gTrague + 0.2, { x: 447, y: 288, ang: 0.1, d: TALLO_G }],
      // brinda con la copa vacía hacia la cámara
      [T.gBrinda, T.gBrinda + 0.3, { x: 470, y: 240, ang: 0.15, d: TALLO_G }, salida]
    ];
    let l = pista(PL, t);
    // respingo con el hipo
    const hip = campana(t, T.hipo - 0.02, T.hipo + 0.2);
    l = Object.assign({}, l, { y: l.y - 8 * hip });
    const copa = { x: l.x, y: l.y, ang: l.ang };
    const lleva = t >= T.gCoge + 0.05;
    if (!lleva) Object.assign(copa, { x: COPA_G0.x, y: COPA_G0.y, ang: 0 });
    Object.assign(copa, { vol: volG(t), t, chap: chapG(t), curva: 0.9 * gi.k * (0.4 + gi.fuerza), lagrimas: lagrimasG(t), alto: 1,
      burbujas: campana(t, T.gSnif, T.gSnif1 + 0.05) });
    p.copa = copa; p.copaEnMano = lleva;
    p.manoLejos = manoRig(G, p, l, "lejos", BOLS_GL, -1, lleva ? (g => conCamara(g, () => dibCopa(g, copa))) : null);
    p.manoCerca = { x: BOLS_GC.x, y: BOLS_GC.y, ang: 0, mu: -1.75, puno: 0, dobla: -1 };
  }
  function chapG(t) {
    const gi = giroG(t);
    const alza = t > T.gAlza ? 0.14 * Math.exp(-(t - T.gAlza) * 5) * Math.sin((t - T.gAlza) * 13) : 0;
    const tras = t > T.derrame + 0.2 ? 0.25 * Math.exp(-(t - T.derrame - 0.2) * 4) * Math.sin((t - T.derrame - 0.2) * 14) : 0;
    const ach = t > T.achis ? 0.3 * Math.exp(-(t - T.achis) * 5) * Math.sin((t - T.achis) * 16) : 0;
    return (0.26 + 0.9 * gi.fuerza) * gi.k * Math.sin(gi.ph - 0.9) + alza + tras + ach;
  }
  const lagrimasG = t => tramo(t, T.gGira0 + 0.3, T.derrame) * (1 - 0.7 * tramo(t, T.gTraga0, T.gTraga1));

  /* ---------- capa de la cara de Guillermo (retrato): manchas de vino, lágrimas, bigote, moflete ---------- */
  // salpicaduras de vino en el retrato: [x, y, radio, giro, gotitas alrededor]
  const MANCHAS = [[704, 640, 25, 0.5, 4], [792, 478, 17, -0.3, 3], [902, 700, 12, 0.2, 2], [858, 556, 9, 0.8, 2],
                   [748, 796, 12, 1.2, 2], [640, 560, 9, 0.4, 1], [830, 640, 7, 0, 1]];
  const MANCHA = "#6a1336", MANCHA_L = "rgba(255,175,205,0.55)";
  function salpicon(g, x, y, r, a, n, sem) {
    g.save(); g.translate(x, y); g.rotate(a);
    g.fillStyle = MANCHA; g.beginPath();
    for (let j = 0; j < 12; j++) { const an = j / 12 * Math.PI * 2, rr = r * (0.72 + 0.4 * hash(sem * 11 + j)) * (j % 3 ? 1 : 1.25); g.lineTo(Math.cos(an) * rr * 1.18, Math.sin(an) * rr); }
    g.closePath(); g.fill();
    for (let j = 0; j < n; j++) { const an = hash(sem * 7 + j) * Math.PI * 2, d = r * (1.5 + 0.6 * hash(sem + j * 3)), rr = r * (0.16 + 0.14 * hash(sem * 5 + j));
      g.beginPath(); g.arc(Math.cos(an) * d * 1.15, Math.sin(an) * d, rr, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = MANCHA_L; g.beginPath(); g.ellipse(-r * 0.35, -r * 0.38, r * 0.3, r * 0.17, -0.5, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  const BOCA_G = { x: 803, y: 730 }, BOCA_G_ANG = 0.26;
  function capaCabezaG(g, t, p) {
    const k = tramo(t, T.cara - 0.02, T.cara + 0.1);
    if (k > 0) MANCHAS.forEach(([x, y, r, a, n], i) => { const e = clamp(k * 1.5 - i * 0.07); if (e > 0) salpicon(g, x, y, r * e, a, n, i + 1); });
    // lagrimitas al picarle la nariz
    const lg = dentro(t, T.gPica + 0.05, T.gPica + 0.15, T.achis + 0.4, T.achis + 0.8);
    if (lg > 0.01) {
      g.save(); g.globalAlpha = lg; g.fillStyle = "#bfe8ff"; g.strokeStyle = "#1d3b52"; g.lineWidth = 4;
      for (const [x, y, f] of [[742, 590, 0], [925, 640, 0.5]]) {
        const ph = ((t - T.gPica) * 1.6 + f) % 1, yy = y + ph * 40, s = 11 * (1 - 0.3 * ph);
        g.beginPath(); g.moveTo(x, yy - s * 1.5); g.quadraticCurveTo(x + s, yy, x, yy + s); g.quadraticCurveTo(x - s, yy, x, yy - s * 1.5); g.fill(); g.stroke();
      }
      g.restore();
    }
    // bigote de vino (después del trago)
    const bg = tramo(t, T.gTraga + 0.2, T.gTraga1);
    if (bg > 0.01) {
      g.save(); g.translate(BOCA_G.x, BOCA_G.y - 6); g.rotate(BOCA_G_ANG); g.globalAlpha = 0.72 * bg;
      g.fillStyle = MANCHA; g.beginPath(); g.moveTo(-58, -16); g.quadraticCurveTo(-30, -44, 2, -34); g.quadraticCurveTo(38, -44, 62, -18);
      g.quadraticCurveTo(36, -26, 2, -22); g.quadraticCurveTo(-30, -26, -58, -16); g.closePath(); g.fill();
      g.fillStyle = MANCHA_L; g.beginPath(); g.ellipse(-22, -33, 12, 3.5, -0.2, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    // moflete cercano hinchado (gárgaras y trague)
    const inf = Math.max(p.cara.mofletes * dentro(t, T.gTraga, T.gTraga + 0.1, T.gTrague + 0.1, T.gTrague + 0.25), 0);
    carrillo(g, inf);
  }
  const PIEL_G = G.C.piel;
  function carrillo(g, k) {
    if (k <= 0.01) return;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const A = { x: 600, y: 684 }, Bq = { x: 768, y: 842 }, b = 30 * k;
    const c1 = { x: 586 - b * 0.9, y: 748 + b * 0.5 }, c2 = { x: 690 - b * 0.5, y: 850 + b * 0.8 };
    g.beginPath(); g.moveTo(A.x, A.y); g.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, Bq.x, Bq.y); g.lineTo(760, 800); g.lineTo(640, 700); g.closePath();
    g.fillStyle = PIEL_G; g.fill();
    g.beginPath(); g.moveTo(A.x, A.y); g.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, Bq.x, Bq.y); g.lineWidth = 6; g.strokeStyle = TINTA; g.stroke();
    g.restore();
  }

  /* =====================================================================================
   * DECORADO: vinoteca de noche
   * ===================================================================================== */
  const ZOCALO = 372, SUELO_PARED = 468;
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 100; const g = c.getContext("2d");
    g.translate(60, 50); g.lineJoin = "round"; g.lineCap = "round";
    // pared granate con damasco
    const gp = g.createLinearGradient(0, -50, 0, ZOCALO); gp.addColorStop(0, "#3a1019"); gp.addColorStop(1, "#5b1c28");
    g.fillStyle = gp; g.fillRect(-60, -50, W + 120, ZOCALO + 50);
    g.fillStyle = "rgba(255,190,170,0.06)";
    for (let fy = -40; fy < ZOCALO; fy += 46) for (let fx = -60 + ((fy / 46) % 2 ? 23 : 0); fx < W + 60; fx += 46) {
      g.beginPath(); g.moveTo(fx, fy - 10); g.quadraticCurveTo(fx + 7, fy, fx, fy + 10); g.quadraticCurveTo(fx - 7, fy, fx, fy - 10); g.fill();
      g.beginPath(); g.arc(fx, fy - 13, 2, 0, Math.PI * 2); g.fill();
    }
    // zócalo de nogal con cuarterones
    g.fillStyle = "#3a2416"; g.fillRect(-60, ZOCALO, W + 120, SUELO_PARED - ZOCALO);
    g.fillStyle = "#5a3a22"; g.fillRect(-60, ZOCALO - 6, W + 120, 10);
    g.fillStyle = "rgba(255,220,170,0.18)"; g.fillRect(-60, ZOCALO - 6, W + 120, 2);
    for (let x = -50; x < W + 60; x += 112) {
      g.fillStyle = "#2f1d11"; g.fillRect(x + 8, ZOCALO + 16, 92, SUELO_PARED - ZOCALO - 30);
      g.strokeStyle = "rgba(255,210,160,0.12)"; g.lineWidth = 2; g.strokeRect(x + 12, ZOCALO + 20, 84, SUELO_PARED - ZOCALO - 38);
    }
    g.fillStyle = "#241509"; g.fillRect(-60, SUELO_PARED - 10, W + 120, 10);
    // suelo de tarima oscura en perspectiva
    const gs = g.createLinearGradient(0, SUELO_PARED, 0, H + 50); gs.addColorStop(0, "#2d1c10"); gs.addColorStop(1, "#4a2f1c");
    g.fillStyle = gs; g.fillRect(-60, SUELO_PARED, W + 120, H + 50 - SUELO_PARED);
    g.strokeStyle = "rgba(15,8,4,0.55)"; g.lineWidth = 1.5;
    for (let i = -14; i <= 16; i++) { g.beginPath(); g.moveTo(512 + i * 44, SUELO_PARED); g.lineTo(512 + i * 110, H + 50); g.stroke(); }
    let yy = SUELO_PARED + 8; for (let k = 0; k < 9; k++) { g.strokeStyle = "rgba(15,8,4,0.3)"; g.beginPath(); g.moveTo(-60, yy); g.lineTo(W + 60, yy); g.stroke(); yy += 10 + k * 7; }
    // reflejo cálido de la lámpara en el suelo
    const rf = g.createRadialGradient(516, 520, 10, 516, 520, 260); rf.addColorStop(0, "rgba(255,190,110,0.22)"); rf.addColorStop(1, "rgba(255,190,110,0)");
    g.fillStyle = rf; g.fillRect(200, SUELO_PARED, 640, 200);
    barricas(g);
    botellero(g);
    cuadro(g);
    for (const x of [300, 732]) aplique(g, x, 196);
    lampara(g);
    // viñeta
    const vg = g.createRadialGradient(516, 300, 260, 516, 300, 760); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.55)");
    g.fillStyle = vg; g.fillRect(-60, -50, W + 120, H + 100);
    mesa(g);
    return c;
  }
  function barricas(g) {
    // cuna de madera
    g.fillStyle = "#2a190d"; g.fillRect(40, 462, 280, 16);
    g.fillStyle = "#3d2614"; g.fillRect(40, 458, 280, 6);
    const barrica = (x, y, r) => {
      g.save();
      g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse(x + 6, y + r * 0.92, r * 0.95, 8, 0, 0, Math.PI * 2); g.fill();
      const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 4, x, y, r); gr.addColorStop(0, "#9a6436"); gr.addColorStop(1, "#5b371b");
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      g.save(); g.beginPath(); g.arc(x, y, r * 0.86, 0, Math.PI * 2); g.clip();
      g.strokeStyle = "rgba(40,22,10,0.55)"; g.lineWidth = 1.6;
      for (let i = -4; i <= 4; i++) { g.beginPath(); g.moveTo(x + i * r * 0.21, y - r); g.lineTo(x + i * r * 0.21, y + r); g.stroke(); }
      g.strokeStyle = "rgba(255,210,150,0.12)"; g.lineWidth = 1;
      for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(x - r * 0.1, y + r * 0.05, r * (0.18 + i * 0.12), 0.3 + i, 2.3 + i); g.stroke(); }
      g.restore();
      // aros de hierro y canto
      g.lineWidth = r * 0.12; g.strokeStyle = "#2b2622"; g.beginPath(); g.arc(x, y, r * 0.93, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 1.2; g.strokeStyle = "rgba(255,255,255,0.16)"; g.beginPath(); g.arc(x, y, r * 0.98, Math.PI * 1.1, Math.PI * 1.6); g.stroke();
      g.lineWidth = 2.5; g.strokeStyle = TINTA; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, r * 0.86, 0, Math.PI * 2); g.stroke();
      // tapón de corcho
      g.fillStyle = "#c79a5c"; g.beginPath(); g.ellipse(x + r * 0.45, y - r * 0.38, r * 0.08, r * 0.06, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 1; g.stroke();
      g.restore();
    };
    barrica(108, 408, 56); barrica(228, 408, 56); barrica(168, 306, 54);
    // espita de latón en la de arriba
    g.fillStyle = "#b8893a"; g.strokeStyle = TINTA; g.lineWidth = 1.5;
    g.beginPath(); g.rect(162, 330, 12, 16); g.fill(); g.stroke(); g.beginPath(); g.rect(158, 344, 20, 5); g.fill(); g.stroke();
    // botellas de pie delante
    for (const [x, h, c] of [[300, 64, "#1d3a24"], [318, 60, "#3a1420"]]) {
      g.fillStyle = c; g.strokeStyle = TINTA; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(x - 9, 470); g.lineTo(x - 9, 470 - h * 0.62); g.quadraticCurveTo(x - 9, 470 - h * 0.78, x - 3, 470 - h * 0.82); g.lineTo(x - 3, 470 - h); g.lineTo(x + 3, 470 - h);
      g.lineTo(x + 3, 470 - h * 0.82); g.quadraticCurveTo(x + 9, 470 - h * 0.78, x + 9, 470 - h * 0.62); g.lineTo(x + 9, 470); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.22)"; g.fillRect(x - 6, 470 - h * 0.58, 2.5, h * 0.48);
      g.fillStyle = "#b02a3a"; g.fillRect(x - 3.5, 470 - h - 1, 7, 9);
    }
  }
  function botellero(g) {
    const x0 = 772, x1 = 1010, y0 = 96, y1 = SUELO_PARED - 6;
    g.fillStyle = "#24150b"; g.fillRect(x0 - 10, y0 - 14, x1 - x0 + 20, y1 - y0 + 14);
    g.fillStyle = "#1a0f08"; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
    // rombos: diagonales de madera; en cada celda, culos de botella
    const paso = 58;
    for (let i = -8; i < 14; i++) for (let j = 0; j < 10; j++) {
      const cx = x0 + i * paso + (j % 2) * paso / 2, cy = y0 + j * paso / 2;
      for (let b = 0; b < 4; b++) {
        const bx = cx + ((b % 2) - 0.5) * 15, by = cy + (Math.floor(b / 2) - 0.5) * 13 + 4;
        const tono = hash(i * 13 + j * 7 + b);
        g.fillStyle = tono > 0.55 ? "#13261a" : tono > 0.25 ? "#24101a" : "#1d1c12";
        g.beginPath(); g.arc(bx, by, 7, 0, Math.PI * 2); g.fill();
        g.strokeStyle = "rgba(0,0,0,0.7)"; g.lineWidth = 1.2; g.stroke();
        if (tono > 0.82) { g.fillStyle = hash(b + i) > 0.5 ? "#a8243a" : "#c9a03c"; g.beginPath(); g.arc(bx, by, 3.4, 0, Math.PI * 2); g.fill(); }
        else { g.fillStyle = "rgba(255,240,220,0.35)"; g.beginPath(); g.arc(bx - 2.2, by - 2.2, 1.6, 0, Math.PI * 2); g.fill(); }
      }
    }
    g.strokeStyle = "#5a3820"; g.lineWidth = 7;
    for (let k = -10; k < 16; k++) {
      g.beginPath(); g.moveTo(x0 + k * paso, y0); g.lineTo(x0 + k * paso + (y1 - y0), y1); g.stroke();
      g.beginPath(); g.moveTo(x0 + k * paso, y0); g.lineTo(x0 + k * paso - (y1 - y0), y1); g.stroke();
    }
    g.strokeStyle = "rgba(255,210,150,0.15)"; g.lineWidth = 1.5;
    for (let k = -10; k < 16; k++) { g.beginPath(); g.moveTo(x0 + k * paso - 2, y0); g.lineTo(x0 + k * paso - 2 + (y1 - y0), y1); g.stroke(); }
    g.restore();
    g.strokeStyle = "#3a2414"; g.lineWidth = 10; g.strokeRect(x0 - 5, y0 - 5, x1 - x0 + 10, y1 - y0 + 5);
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x0 - 10, y0 - 10, x1 - x0 + 20, y1 - y0 + 10);
    // copas colgadas boca abajo encima del botellero
    g.fillStyle = "#3a2414"; g.fillRect(x0 - 14, y0 - 34, x1 - x0 + 28, 8);
    for (let i = 0; i < 7; i++) {
      const cx = x0 + 14 + i * 33, cy = y0 - 26;
      g.strokeStyle = "rgba(220,235,245,0.55)"; g.lineWidth = 1.4; g.fillStyle = "rgba(220,235,245,0.12)";
      g.beginPath(); g.moveTo(cx - 8, cy); g.lineTo(cx + 8, cy); g.stroke();
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy + 10); g.stroke();
      g.beginPath(); g.moveTo(cx - 7, cy + 26); g.quadraticCurveTo(cx - 9, cy + 13, cx, cy + 10); g.quadraticCurveTo(cx + 9, cy + 13, cx + 7, cy + 26); g.closePath(); g.fill(); g.stroke();
    }
  }
  function cuadro(g) {
    const x0 = 452, y0 = 104, w = 128, h = 90;
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(x0 - 8, y0 - 4, w + 20, h + 20);
    // marco dorado
    g.fillStyle = "#a27a2c"; g.fillRect(x0 - 12, y0 - 12, w + 24, h + 24);
    g.strokeStyle = "#e3c070"; g.lineWidth = 2; g.strokeRect(x0 - 9, y0 - 9, w + 18, h + 18);
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x0 - 12, y0 - 12, w + 24, h + 24); g.strokeRect(x0, y0, w, h);
    g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
    // cielo de atardecer
    const gc = g.createLinearGradient(0, y0, 0, y0 + h); gc.addColorStop(0, "#f2a35e"); gc.addColorStop(0.55, "#f7d18a"); gc.addColorStop(1, "#e9c27a");
    g.fillStyle = gc; g.fillRect(x0, y0, w, h);
    g.fillStyle = "#fff0c0"; g.beginPath(); g.arc(x0 + 92, y0 + 40, 11, 0, Math.PI * 2); g.fill();
    // colinas con hileras de viñas
    for (const [yb, col, amp] of [[y0 + 52, "#7a8a4a", 8], [y0 + 64, "#5e7a3a", 10], [y0 + 78, "#46622c", 9]]) {
      g.fillStyle = col; g.beginPath(); g.moveTo(x0, y0 + h);
      for (let x = 0; x <= w; x += 8) g.lineTo(x0 + x, yb + amp * Math.sin(x * 0.045 + yb));
      g.lineTo(x0 + w, y0 + h); g.closePath(); g.fill();
    }
    g.strokeStyle = "rgba(40,55,20,0.6)"; g.lineWidth = 1.4;
    for (let i = -6; i < 12; i++) { g.beginPath(); g.moveTo(x0 + 64 + i * 5, y0 + 62); g.lineTo(x0 + 64 + i * 18, y0 + h); g.stroke(); }
    // casita
    g.fillStyle = "#e9dcc0"; g.fillRect(x0 + 24, y0 + 46, 14, 9); g.fillStyle = "#b5543a"; g.beginPath(); g.moveTo(x0 + 22, y0 + 46); g.lineTo(x0 + 31, y0 + 40); g.lineTo(x0 + 40, y0 + 46); g.closePath(); g.fill();
    g.restore();
    // lamparita de cuadro
    g.fillStyle = "#b8893a"; g.strokeStyle = TINTA; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(x0 + w / 2 - 22, y0 - 26); g.lineTo(x0 + w / 2 + 22, y0 - 26); g.lineTo(x0 + w / 2 + 18, y0 - 18); g.lineTo(x0 + w / 2 - 18, y0 - 18); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(x0 + w / 2, y0 - 18); g.lineTo(x0 + w / 2, y0 - 12); g.stroke();
    const gl = g.createRadialGradient(x0 + w / 2, y0, 4, x0 + w / 2, y0 + 20, 110); gl.addColorStop(0, "rgba(255,220,150,0.28)"); gl.addColorStop(1, "rgba(255,220,150,0)");
    g.fillStyle = gl; g.fillRect(x0 - 60, y0 - 30, w + 120, h + 90);
  }
  function aplique(g, x, y) {
    const hl = g.createRadialGradient(x, y - 14, 4, x, y - 14, 90); hl.addColorStop(0, "rgba(255,200,120,0.4)"); hl.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = hl; g.beginPath(); g.arc(x, y - 14, 90, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#b8893a"; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y + 26); g.quadraticCurveTo(x, y + 8, x, y); g.stroke();
    g.fillStyle = "#b8893a"; g.strokeStyle = TINTA; g.lineWidth = 1.5;
    g.beginPath(); g.ellipse(x, y + 28, 10, 4, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(x, y, 9, 3, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#f6efe2"; g.fillRect(x - 3.5, y - 22, 7, 22); g.strokeRect(x - 3.5, y - 22, 7, 22);
    g.fillStyle = "#ffe7a8"; g.beginPath(); g.moveTo(x, y - 36); g.quadraticCurveTo(x + 5, y - 27, x, y - 23); g.quadraticCurveTo(x - 5, y - 27, x, y - 36); g.fill();
  }
  function lampara(g) {
    const x = 516, y = 70;
    g.strokeStyle = "#1a120c"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, -50); g.lineTo(x, y - 20); g.stroke();
    // cono de luz hacia la mesa
    const gc = g.createLinearGradient(0, y, 0, MESA.y + 20); gc.addColorStop(0, "rgba(255,214,140,0.22)"); gc.addColorStop(1, "rgba(255,214,140,0.04)");
    g.fillStyle = gc; g.beginPath(); g.moveTo(x - 26, y); g.lineTo(x + 26, y); g.lineTo(x + 150, MESA.y + 20); g.lineTo(x - 150, MESA.y + 20); g.closePath(); g.fill();
    const gs = g.createLinearGradient(x - 30, 0, x + 30, 0); gs.addColorStop(0, "#7a5520"); gs.addColorStop(0.45, "#e2b860"); gs.addColorStop(1, "#6a4818");
    g.fillStyle = gs; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x - 6, y - 22); g.lineTo(x + 6, y - 22); g.quadraticCurveTo(x + 30, y - 16, x + 32, y); g.lineTo(x - 32, y); g.quadraticCurveTo(x - 30, y - 16, x - 6, y - 22); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#fff3cf"; g.beginPath(); g.ellipse(x, y + 1, 22, 4, 0, 0, Math.PI * 2); g.fill();
  }
  // mesa alta con mantel blanco (en el fondo); las manchas se pintan aparte
  function rutaMantel(g) {
    const m = MESA, yb = 444;
    g.beginPath(); g.moveTo(m.x - m.rx, m.y);
    g.bezierCurveTo(m.x - m.rx - 2, m.y + 40, m.x - m.rx - 8, yb - 30, m.x - m.rx - 10, yb);
    for (let i = 0; i < 8; i++) { const xa = m.x - m.rx - 10 + i * (2 * m.rx + 20) / 8, xb = xa + (2 * m.rx + 20) / 8; g.quadraticCurveTo((xa + xb) / 2, yb + 7, xb, yb); }
    g.bezierCurveTo(m.x + m.rx + 8, yb - 30, m.x + m.rx + 2, m.y + 40, m.x + m.rx, m.y);
    g.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, Math.PI, false);
    g.closePath();
  }
  function mesa(g) {
    const m = MESA;
    // pie de madera y base
    g.fillStyle = "rgba(0,0,0,0.4)"; g.beginPath(); g.ellipse(m.x, SUELO + 2, 70, 7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#2c1a0e"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.rect(m.x - 7, 436, 14, SUELO - 446); g.fill(); g.stroke();
    for (const sg of [-1, 1]) { g.beginPath(); g.moveTo(m.x, SUELO - 14); g.quadraticCurveTo(m.x + sg * 30, SUELO - 10, m.x + sg * 56, SUELO); g.lineTo(m.x + sg * 46, SUELO + 2); g.quadraticCurveTo(m.x + sg * 24, SUELO - 4, m.x, SUELO - 4); g.closePath(); g.fill(); g.stroke(); }
    // mantel: caída con pliegues
    rutaMantel(g); g.fillStyle = "#efeae0"; g.fill();
    g.save(); rutaMantel(g); g.clip();
    for (let i = 0; i < 9; i++) { const x = m.x - m.rx + 6 + i * 20; const gf = g.createLinearGradient(x - 9, 0, x + 9, 0); gf.addColorStop(0, "rgba(120,100,90,0)"); gf.addColorStop(0.5, "rgba(120,100,90,0.18)"); gf.addColorStop(1, "rgba(120,100,90,0)");
      g.fillStyle = gf; g.fillRect(x - 9, m.y + 6, 18, 120); }
    const gl = g.createLinearGradient(m.x - m.rx, 0, m.x + m.rx, 0); gl.addColorStop(0, "rgba(60,40,40,0.25)"); gl.addColorStop(0.45, "rgba(255,240,210,0.1)"); gl.addColorStop(1, "rgba(60,40,40,0.3)");
    g.fillStyle = gl; g.fillRect(m.x - m.rx - 20, m.y, 2 * m.rx + 40, 120);
    g.restore();
    rutaMantel(g); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    // tablero (cara de arriba del mantel)
    g.fillStyle = "#f8f4ec"; g.beginPath(); g.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,220,160,0.25)"; g.beginPath(); g.ellipse(m.x - 10, m.y - 2, m.rx * 0.55, m.ry * 0.5, 0, 0, Math.PI * 2); g.fill();
    g.lineWidth = 1.6; g.strokeStyle = "rgba(20,15,15,0.7)"; g.beginPath(); g.ellipse(m.x, m.y, m.rx, m.ry, 0, Math.PI, Math.PI * 2); g.stroke();
    // decantador
    const dx = 504, db = m.y - 2;
    g.save(); g.lineJoin = "round";
    const forma = () => { g.beginPath(); g.moveTo(dx - 4, db - 62); g.lineTo(dx - 4, db - 38); g.bezierCurveTo(dx - 6, db - 30, dx - 24, db - 22, dx - 24, db - 8);
      g.quadraticCurveTo(dx - 24, db, dx - 16, db); g.lineTo(dx + 16, db); g.quadraticCurveTo(dx + 24, db, dx + 24, db - 8); g.bezierCurveTo(dx + 24, db - 22, dx + 6, db - 30, dx + 4, db - 38); g.lineTo(dx + 4, db - 62); g.closePath(); };
    forma(); g.fillStyle = "rgba(214,232,246,0.25)"; g.fill();
    g.save(); forma(); g.clip(); const gv = g.createLinearGradient(0, db - 22, 0, db); gv.addColorStop(0, VINO_C); gv.addColorStop(1, VINO); g.fillStyle = gv; g.fillRect(dx - 30, db - 20, 60, 22);
    g.fillStyle = VINO_S; g.beginPath(); g.ellipse(dx, db - 20, 21, 2.4, 0, 0, Math.PI * 2); g.fill(); g.restore();
    forma(); g.lineWidth = 1.6; g.strokeStyle = TINTA; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 2; g.beginPath(); g.moveTo(dx - 18, db - 16); g.quadraticCurveTo(dx - 19, db - 8, dx - 14, db - 4); g.stroke();
    g.beginPath(); g.ellipse(dx, db - 62, 5.5, 1.6, 0, 0, Math.PI * 2); g.lineWidth = 1.3; g.strokeStyle = TINTA; g.stroke();
    g.restore();
    // platito de uvas y queso
    const px = 488, py = m.y + 6;
    g.fillStyle = "#f9f7f2"; g.strokeStyle = TINTA; g.lineWidth = 1.4; g.beginPath(); g.ellipse(px, py, 18, 4.5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    for (const [ux, uy] of [[-8, -4], [-4, -6], [-6, -9], [-1, -4], [-3, -10], [-9, -7]]) { g.fillStyle = "#5a2a5e"; g.beginPath(); g.arc(px + ux, py + uy, 2.6, 0, Math.PI * 2); g.fill(); g.lineWidth = 0.9; g.stroke(); g.fillStyle = "rgba(255,255,255,0.5)"; g.beginPath(); g.arc(px + ux - 0.8, py + uy - 0.8, 0.8, 0, Math.PI * 2); g.fill(); }
    for (const [qx, qy] of [[5, -5], [10, -3]]) { g.fillStyle = "#f0c95a"; g.beginPath(); g.moveTo(px + qx - 3, py + qy); g.lineTo(px + qx + 3, py + qy); g.lineTo(px + qx + 3, py + qy - 5); g.lineTo(px + qx - 3, py + qy - 5); g.closePath(); g.fill(); g.lineWidth = 1; g.stroke(); }
    // portavelas (la llama se pinta en cada fotograma)
    g.fillStyle = "#b8893a"; g.strokeStyle = TINTA; g.lineWidth = 1.4;
    g.beginPath(); g.ellipse(VELA.x, VELA.y, 9, 2.6, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#f6efe2"; g.fillRect(VELA.x - 3.5, VELA.y - 24, 7, 23); g.strokeRect(VELA.x - 3.5, VELA.y - 24, 7, 23);
  }
  const VELA = { x: 538, y: MESA.y + 3 };
  function llama(g, t) {
    const f = 1 + 0.12 * Math.sin(t * 17) + 0.08 * Math.sin(t * 29 + 1), sw = 1.2 * Math.sin(t * 9);
    const x = VELA.x, y = VELA.y - 24;
    const gl = g.createRadialGradient(x, y - 6, 2, x, y - 6, 60 * f); gl.addColorStop(0, "rgba(255,210,120,0.35)"); gl.addColorStop(1, "rgba(255,210,120,0)");
    g.fillStyle = gl; g.beginPath(); g.arc(x, y - 6, 60 * f, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ffd66b"; g.beginPath(); g.moveTo(x + sw, y - 14 * f); g.quadraticCurveTo(x + 5, y - 4, x, y); g.quadraticCurveTo(x - 5, y - 4, x + sw, y - 14 * f); g.fill();
    g.fillStyle = "#fff6d8"; g.beginPath(); g.ellipse(x, y - 4, 1.6, 3, 0, 0, Math.PI * 2); g.fill();
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  // manchas del mantel: gotas que caen (del anillo y del estornudo) y se quedan
  const GOTAS_ANILLO = Array.from({ length: 7 }, (_, i) => ({ t0: T.derrame + 0.1 + 0.035 * i, x: 446 + 18 * hash(i + 1) + i * 4, y: MESA.y - 2 + 8 * hash(i + 2), r: 2.4 + 1.6 * hash(i + 3) }));
  const GOTAS_ACHIS = Array.from({ length: 24 }, (_, i) => { const enDrapeado = hash(i + 24) > 0.6;
    return { t0: T.achis + 0.07 + 0.2 * hash(i + 20), x: 462 + 120 * hash(i + 21), y: enDrapeado ? MESA.y + 18 + 60 * hash(i + 22) : MESA.y - 8 + 18 * hash(i + 22), r: 1.6 + 2.4 * hash(i + 23) }; });
  function manchasMantel(g, t) {
    g.save(); rutaMantel(g); g.clip();
    for (const d of [...GOTAS_ANILLO, ...GOTAS_ACHIS]) {
      const k = tramo(t, d.t0, d.t0 + 0.06); if (k <= 0) continue;
      g.fillStyle = "rgba(125,16,39,0.85)"; g.beginPath(); g.ellipse(d.x, d.y, d.r * 1.3 * k, d.r * 0.5 * k, 0, 0, Math.PI * 2); g.fill();
      if (d.r > 3) { g.beginPath(); g.ellipse(d.x + d.r * 1.6, d.y + 0.6, d.r * 0.35 * k, d.r * 0.2 * k, 0, 0, Math.PI * 2); g.fill(); }
    }
    g.restore();
  }
  // gota que cae (pantalla) desde (x0, y0) con velocidad (vx, vy) hasta la altura yf
  function gotaVuelo(g, t, t0, t1, a, b, alto) {
    const k = fase(t, t0, t1); if (k <= 0 || k >= 1) return;
    const x = lerp(a.x, b.x, k), y = lerp(a.y, b.y, k) - alto * Math.sin(Math.PI * k);
    g.beginPath(); g.ellipse(x, y, 2.4, 3, 0, 0, Math.PI * 2); g.fill();
  }
  // giro: arcos de movimiento alrededor de la copa
  function arcosGiro(g, c, k, fuerte) {
    if (k <= 0.02) return;
    const cen = enCopa(c, { x: 0, y: -18 * EC });
    g.save(); g.lineCap = "round"; g.strokeStyle = `rgba(255,240,225,${0.7 * k})`; g.lineWidth = fuerte ? 2.4 : 1.6;
    const rx = (fuerte ? 34 : 24), ry = rx * 0.32;
    g.beginPath(); g.ellipse(cen.x, cen.y + 12, rx, ry, 0, 0.2, 1.3); g.stroke();
    g.beginPath(); g.ellipse(cen.x, cen.y + 12, rx, ry, 0, Math.PI + 0.2, Math.PI + 1.3); g.stroke();
    if (fuerte) { g.lineWidth = 1.6; g.beginPath(); g.ellipse(cen.x, cen.y + 10, rx + 10, ry + 4, 0, 2.2, 2.9); g.stroke(); g.beginPath(); g.ellipse(cen.x, cen.y + 10, rx + 10, ry + 4, 0, 5.2, 5.9); g.stroke(); }
    g.restore();
  }
  // volutas de aroma que suben de la copa a la nariz
  function aroma(g, t, c, nariz, k) {
    if (k <= 0.01) return;
    const o = enCopa(c, { x: 0, y: RIM.y });
    g.save(); g.lineCap = "round"; g.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.9 + i / 3) % 1;
      g.strokeStyle = `rgba(232,150,175,${0.6 * k * Math.sin(Math.PI * ph)})`;
      g.beginPath();
      for (let j = 0; j <= 10; j++) { const u = j / 10, x = lerp(o.x - 4 + i * 4, nariz.x, u * ph * 1.4) + 4 * Math.sin(u * 7 + t * 4 + i * 2), y = lerp(o.y, nariz.y, u * ph * 1.4); if (j) g.lineTo(x, y); else g.moveTo(x, y); }
      g.stroke();
    }
    g.restore();
  }
  // «mm»: chispitas y unas curvitas de gusto junto a la cara
  function gusto(g, t, pK) {
    const k = dentro(t, T.kMm, T.kMm + 0.1, T.kBaja + 0.1, T.kBaja + 0.35); if (k <= 0.01) return;
    const c = K.aPantalla(pK, K.cabeza(pK).a({ x: 760, y: 330 }));
    g.save(); g.globalAlpha = k;
    for (let i = 0; i < 3; i++) { const ph = ((t - T.kMm) * 0.8 + i / 3) % 1, x = c.x + 26 - i * 22, y = c.y - 4 - ph * 26, r = 4 + 2 * Math.sin(Math.PI * ph);
      estrella(g, x, y, r * Math.sin(Math.PI * ph), "#ffe08a"); }
    g.restore();
  }
  function estrella(g, x, y, r, col) {
    if (r <= 0.2) return;
    g.save(); g.translate(x, y); g.fillStyle = col; g.strokeStyle = TINTA; g.lineWidth = 1;
    g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.4 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill(); g.stroke(); g.restore();
  }
  /* El anillo de vino: la cabeza del chorro sale del borde, da una vuelta alrededor de la copa (un anillo
   * que se abre) y luego se lanza a la cara; el resto del chorro sigue el mismo camino con retraso. */
  const T_ANILLO = 0.22, T_VUELO = 0.1, T_COLA = 0.2;
  function caminoAnillo(c0, cara, tau) {
    const cen = enCopa(c0, { x: 0, y: RIM.y + 4 });
    if (tau < T_ANILLO) {
      // sale por el borde de delante y da una vuelta entera alrededor de la copa abriéndose
      const u = tau / T_ANILLO, ang = 0.3 + u * Math.PI * 2.15, r = RIM.r + 34 * salida(u);
      return { x: cen.x + r * Math.cos(ang), y: cen.y - 14 * u + r * 0.3 * Math.sin(ang) };
    }
    const fin = caminoAnillo(c0, cara, T_ANILLO - 1e-4), u = clamp((tau - T_ANILLO) / T_VUELO);
    return { x: lerp(fin.x, cara.x, u), y: lerp(fin.y, cara.y, u) - 22 * Math.sin(Math.PI * u) };
  }
  let C_DERRAME = null;
  function anillo(g, t, pG) {
    const tau = t - T.derrame; if (tau < 0 || tau > T_ANILLO + T_VUELO + T_COLA + 0.05) return;
    if (!C_DERRAME) { const p0 = poseG(T.derrame), p1 = poseG(T.cara); C_DERRAME = { c: Object.assign({}, p0.copa), cara: G.aPantalla(p1, G.cabeza(p1).a({ x: 800, y: 600 })) }; }
    const c = pG.copa, objetivo = C_DERRAME.cara;
    const fin = T_ANILLO + T_VUELO;
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const s = i / 24, ta = tau - s * T_COLA;
      if (ta < 0) break;
      if (ta > fin) continue;               // ya se ha estampado
      pts.push(Object.assign(caminoAnillo(c, objetivo, ta), { s }));
    }
    if (pts.length < 2) return;
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], w = 5.5 * (1 - 0.6 * b.s);
      g.strokeStyle = TINTA; g.lineWidth = w + 2.4; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    }
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], w = 5.5 * (1 - 0.6 * b.s);
      g.strokeStyle = VINO_C; g.lineWidth = w; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    }
    g.strokeStyle = "rgba(255,170,185,0.7)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(pts[0].x, pts[0].y - 1.5); for (const q of pts) g.lineTo(q.x, q.y - 1.5); g.stroke();
    g.restore();
    void pG;
  }
  // ¡chof!: estallido de gotas alrededor de la cara
  function chof(g, t, pG) {
    const u = t - T.cara; if (u < 0 || u > 0.55) return;
    const c = G.aPantalla(pG, G.cabeza(pG).a({ x: 800, y: 600 }));
    g.save(); g.fillStyle = VINO_C; g.strokeStyle = TINTA; g.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI * 0.1 - i / 10 * Math.PI * 1.25, v = 120 + 90 * hash(i + 60), x = c.x + Math.cos(a) * v * u, y = c.y + Math.sin(a) * v * u + 0.5 * 1500 * u * u;
      g.globalAlpha = 1 - fase(u, 0.3, 0.55); g.beginPath(); g.ellipse(x, y, 2.6, 3.2, a, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    // salpicón en forma de estrella
    const k = campana(u, 0, 0.25);
    if (k > 0) { g.globalAlpha = k; g.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, r = (i % 2 ? 9 : 20) * (0.6 + 0.4 * k); g.lineTo(c.x + 12 + Math.cos(a) * r, c.y + Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke(); }
    g.restore();
  }
  // gotas que caen de la barbilla y de la nariz
  function goteoCara(g, t, pG) {
    if (t < T.cara + 0.3 || t > T.gHuele0 + 0.3) return;
    const b = G.aPantalla(pG, G.cabeza(pG).a({ x: 740, y: 820 }));
    g.save(); g.fillStyle = VINO_C;
    for (let i = 0; i < 4; i++) { const t0 = T.cara + 0.35 + i * 0.32, u = t - t0; if (u < 0 || u > 0.4) continue;
      g.beginPath(); g.ellipse(b.x + i * 3, b.y + 0.5 * 1500 * u * u, 2, 2.8, 0, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // ¡sniiif!: el vino sube por la nariz; rayitas que entran
  function sorbe(g, t, pG) {
    const k = campana(t, T.gSnif - 0.02, T.gSnif1 + 0.04); if (k <= 0.01) return;
    const n = G.aPantalla(pG, G.cabeza(pG).a({ x: 850, y: 702 })), c = pG.copa;
    const o = enCopa(c, { x: -0.45 * RIM.r, y: RIM.y + 9 });
    g.save(); g.lineCap = "round";
    g.strokeStyle = VINO_C; g.lineWidth = 2.6 * k;
    g.beginPath(); g.moveTo(o.x, o.y); g.quadraticCurveTo((o.x + n.x) / 2 + 2 * Math.sin(t * 40), (o.y + n.y) / 2, n.x, n.y); g.stroke();
    g.strokeStyle = `rgba(255,240,235,${0.95 * k})`; g.lineWidth = 2;
    for (let i = 0; i < 3; i++) { const a = -0.9 + i * 0.55, ph = ((t - T.gSnif) * 4 + i / 3) % 1, r0 = 30 - 14 * ph, r1 = r0 - 8;
      g.beginPath(); g.moveTo(n.x + Math.cos(a) * r0, n.y + Math.sin(a) * r0); g.lineTo(n.x + Math.cos(a) * r1, n.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // ah… ah…: rayitas de tensión alrededor de la cabeza
  function tension(g, t, pG) {
    const k = dentro(t, T.ah1 - 0.1, T.ah1 + 0.1, T.achis - 0.04, T.achis); if (k <= 0.01) return;
    const c = G.aPantalla(pG, G.cabeza(pG).a({ x: 770, y: 520 }));
    const n = 3 + Math.round(3 * tramo(t, T.ah1, T.ah3));
    g.save(); g.strokeStyle = `rgba(255,236,220,${0.9 * k})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = 0; i < n; i++) { const a = -Math.PI * 0.95 + i / 6 * Math.PI * 1.1, r0 = 66 + 3 * Math.sin(t * 40 + i), r1 = r0 + 10;
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0 * 0.9); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1 * 0.9); g.stroke(); }
    g.restore();
  }
  // ¡achís!: nube y rociada de vino hacia la mesa
  function rociada(g, t, pG) {
    const u = t - T.achis; if (u < 0 || u > 0.8) return;
    const H = G.cabeza(pG), n = G.aPantalla(pG, H.a({ x: 850, y: 704 }));
    g.save();
    // nube en abanico hacia delante y abajo
    const kn = 1 - fase(u, 0.12, 0.5);
    for (let i = 0; i < 9; i++) {
      const a = 0.25 + i / 8 * 0.8, d = 14 + 110 * salida(fase(u, 0, 0.4)) * (0.6 + 0.4 * hash(i + 70)), r = 4 + 9 * fase(u, 0, 0.45) * (0.6 + 0.5 * hash(i + 71));
      g.fillStyle = `rgba(250,205,220,${0.55 * kn * (0.6 + 0.4 * hash(i + 72))})`;
      g.beginPath(); g.arc(n.x + Math.cos(a) * d, n.y + Math.sin(a) * d * 0.8, r, 0, Math.PI * 2); g.fill();
    }
    // rayas del golpe
    const kr = campana(u, 0, 0.3);
    if (kr > 0) { g.strokeStyle = `rgba(255,240,240,${0.9 * kr})`; g.lineWidth = 2.2; g.lineCap = "round";
      for (let i = 0; i < 5; i++) { const a = 0.05 + i * 0.22, r0 = 20 + 40 * u, r1 = r0 + 22; g.beginPath(); g.moveTo(n.x + Math.cos(a) * r0, n.y + Math.sin(a) * r0); g.lineTo(n.x + Math.cos(a) * r1, n.y + Math.sin(a) * r1); g.stroke(); } }
    // gotas: de la nariz a su sitio del mantel
    g.fillStyle = VINO_C; g.strokeStyle = "rgba(40,5,15,0.8)"; g.lineWidth = 0.8;
    for (const d of GOTAS_ACHIS) { if (t >= d.t0) continue;
      const k = fase(t, T.achis, d.t0), x = lerp(n.x + 6, d.x, k), y = lerp(n.y + 4, d.y, k) - 26 * Math.sin(Math.PI * k);
      g.beginPath(); g.arc(x, y, d.r * 0.85, 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.restore();
  }
  // el trago: chorrito del borde a la boca; y «glu, glu» (arquitos en la garganta)
  function trago(g, t, pG) {
    const k = dentro(t, T.gTraga - 0.02, T.gTraga + 0.05, T.gTraga1 - 0.1, T.gTraga1); if (k <= 0.01) return;
    const c = pG.copa, borde = enCopa(c, { x: -0.35 * RIM.r, y: RIM.y }), b = G.aPantalla(pG, G.boca(pG));
    g.save(); g.lineCap = "round"; g.strokeStyle = VINO_C; g.lineWidth = 4 * k;
    g.beginPath(); g.moveTo(borde.x, borde.y); g.quadraticCurveTo((borde.x + b.x) / 2 - 2, (borde.y + b.y) / 2 + 3, b.x, b.y); g.stroke();
    const cu = G.aPantalla(pG, G.cabeza(pG).a({ x: 780, y: 872 }));
    g.strokeStyle = `rgba(255,236,220,${0.9 * k})`; g.lineWidth = 2;
    for (let i = 0; i < 3; i++) { const ph = ((t - T.gTraga) * 2.8 + i / 3) % 1; g.globalAlpha = Math.sin(Math.PI * ph);
      g.beginPath(); g.arc(cu.x + 4 + ph * 6, cu.y + 4 - i * 5, 3.5 + ph * 3, -Math.PI * 0.4, Math.PI * 0.4); g.stroke(); }
    g.restore();
  }
  // gárgaras: burbujas que salen de la boca y revientan
  function gargaras(g, t, pG) {
    const k = dentro(t, T.gGarg0 + 0.05, T.gGarg0 + 0.15, T.gGarg1 - 0.05, T.gGarg1 + 0.05); if (k <= 0.01) return;
    const H = G.cabeza(pG), b = G.aPantalla(pG, H.a({ x: 812, y: 742 })), dir = rot({ x: 0.85, y: -0.55 }, H.ang);
    g.save(); g.lineWidth = 1.2; g.strokeStyle = "rgba(90,10,30,0.9)";
    for (let i = 0; i < 9; i++) {
      const ph = ((t - T.gGarg0) * 1.9 + hash(i + 40)) % 1, d = 8 + ph * 40, lat = 9 * (hash(i + 41) - 0.5) + 3 * Math.sin(ph * 6 + i);
      const x = b.x + dir.x * d - dir.y * lat, y = b.y + dir.y * d + dir.x * lat - ph * ph * 22, r = 2.5 + 5 * hash(i + 42) * (0.5 + ph);
      if (ph > 0.88) { g.globalAlpha = k * 0.9; g.strokeStyle = "rgba(255,230,235,0.9)"; for (let j = 0; j < 4; j++) { const a = j * Math.PI / 2 + 0.4; g.beginPath(); g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.lineTo(x + Math.cos(a) * r * 1.8, y + Math.sin(a) * r * 1.8); g.stroke(); } g.strokeStyle = "rgba(90,10,30,0.9)"; continue; }
      g.globalAlpha = k; g.fillStyle = "rgba(225,110,140,0.65)"; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.8)"; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.35, r * 0.25, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  // hipo: una burbujita sale de la boca y revienta
  function hipo(g, t, pG) {
    const u = t - T.hipo; if (u < 0 || u > 0.6) return;
    const b = G.aPantalla(pG, G.boca(pG)), x = b.x + 10 + 10 * u, y = b.y - 10 - 50 * u, r = 4 + 3 * u;
    g.save(); g.lineWidth = 1.4;
    if (u < 0.45) { g.fillStyle = "rgba(240,150,170,0.55)"; g.strokeStyle = "rgba(90,10,30,0.9)"; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.stroke(); }
    else { const k = fase(u, 0.45, 0.6); g.strokeStyle = `rgba(255,236,220,${1 - k})`; for (let j = 0; j < 6; j++) { const a = j * Math.PI / 3; g.beginPath(); g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.lineTo(x + Math.cos(a) * r * (1.6 + k), y + Math.sin(a) * r * (1.6 + k)); g.stroke(); } }
    // rayitas del respingo
    const kk = campana(u, 0, 0.3);
    if (kk > 0) { const c = G.aPantalla(pG, G.cabeza(pG).a({ x: 770, y: 420 })); g.strokeStyle = `rgba(255,236,220,${kk})`; g.lineWidth = 2;
      for (const dx of [-14, 0, 14]) { g.beginPath(); g.moveTo(c.x + dx, c.y - 40); g.lineTo(c.x + dx * 1.3, c.y - 52); g.stroke(); } }
    g.restore();
  }
  // suspiro de Kiriku: bocanada por la nariz
  function suspiro(g, t, pK) {
    const u = t - (T.kPinza + 0.15); if (u < 0 || u > 1.1) return;
    const n = K.aPantalla(pK, K.cabeza(pK).a({ x: 930, y: 500 }));
    g.save();
    for (let i = 0; i < 3; i++) { const v = u - i * 0.12; if (v < 0) continue; const k = 1 - fase(v, 0.2, 0.9);
      g.fillStyle = `rgba(255,240,235,${0.6 * k})`; g.beginPath(); g.arc(n.x - 6 - v * 46, n.y + 10 + v * 30, 4 + v * 13, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const a = dentro(t, T.cara - 0.15, T.cara + 0.25, T.gSerio + 0.6, T.gHuele0 + 0.3);
    const b = dentro(t, T.ah1 - 0.2, T.ah3, T.gLimpia1, T.gTraga0 + 0.3);
    const c = dentro(t, T.gSonrie - 0.1, T.gSonrie + 0.5, T.fin + 0.2, DUR);
    let k = 1.12 + 0.1 * a + 0.08 * b + 0.06 * c, x = 514 - 40 * a - 30 * b - 20 * c, y = 338 - 14 * a - 12 * b - 8 * c;
    // sacudida del estornudo
    const s = t > T.achis ? 2.5 * Math.exp(-(t - T.achis) * 9) * Math.sin((t - T.achis) * 60) : 0;
    return { k, x: x + s, y: y + s * 0.6 };
  }

  function poses(t) { return { g: poseG(t), k: poseK(t) }; }

  class LaCata extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !K.listo()) return;
      if (!fondo) fondo = creaFondo();
      const pK = poseK(t), pG = poseG(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      BASE_M = g.getTransform();
      g.drawImage(fondo, -60, -50);
      manchasMantel(g, t);
      llama(g, t);
      // copas en la mesa (cuando no están en la mano)
      if (!pK.copaEnMano) dibCopa(g, pK.copa);
      if (!pG.copaEnMano) dibCopa(g, pG.copa);
      // personajes
      K.dibujar(g, pK, t);
      G.dibujar(g, pG, t);
      // efectos
      arcosGiro(g, pK.copa, dentro(t, T.kGira0 + 0.2, T.kGira0 + 0.4, T.kGira1 - 0.2, T.kGira1), false);
      arcosGiro(g, pG.copa, dentro(t, T.gGira0 + 0.2, T.gGira0 + 0.4, T.derrame, T.derrame + 0.15), giroG(t).fuerza > 0.3);
      aroma(g, t, pK.copa, K.aPantalla(pK, K.cabeza(pK).a({ x: 930, y: 484 })), dentro(t, T.kHuele - 0.1, T.kHuele + 0.1, T.kAspira1, T.kAspira1 + 0.15));
      gusto(g, t, pK);
      anillo(g, t, pG);
      chof(g, t, pG);
      goteoCara(g, t, pG);
      g.fillStyle = VINO_C;
      for (const d of GOTAS_ANILLO) gotaVuelo(g, t, d.t0 - 0.2, d.t0, enCopa(C_DERRAME ? C_DERRAME.c : pG.copa, { x: 0, y: RIM.y }), d, 10);
      sorbe(g, t, pG);
      tension(g, t, pG);
      rociada(g, t, pG);
      trago(g, t, pG);
      gargaras(g, t, pG);
      hipo(g, t, pG);
      suspiro(g, t, pK);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00085", nombre: "Guillermo y Kiriku · La cata de vino", crear: () => new LaCata() });
  window.__A2D_00085 = { pose: poses, poseG, poseK, T, DUR };
})();
