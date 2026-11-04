"use strict";
/* 00091.2 · Guillermo y Marta · El café con arte
 *
 * Negro → un café acogedor por la mañana: pared rosa teja con zócalo de azulejos blancos, una pizarra
 * con dibujos de tiza (taza humeante, corazón, hoja, granos, estrellas; sin letras), una balda con
 * tarros de café y tazas, un potos colgando, dos lámparas de latón, rayos de sol en diagonal y, al
 * fondo, la barra de madera con la cafetera de dos brazos, el molinillo y una campana de cristal con
 * bizcochos. Delante, una mesa alta de madera con dos cafés en su platillo, una jarrita de leche y un
 * tarro de palillos. Guillermo, a la izquierda, y Marta, a la derecha.
 *
 * Marta le mira con picardía, coge la jarrita y vierte la leche con mimo: en un globo (la taza vista
 * desde arriba) la mancha blanca crece meciéndose y, al cortar, se convierte en un corazón perfecto
 * (¡ting!). Guillermo, boquiabierto → Marta le cede el turno y le desliza la jarrita por la mesa (gira
 * por el camino y llega con el asa hacia él) → Guillermo la coge, mira a cámara muy chulo y vierte a lo
 * bruto: un chorro gordo, la espuma sube, rebosa y chorrea por la taza; en el globo, un borrón sin forma
 * que se sale por el borde. Marta se alarma → Guillermo, orgullosísimo, coge la taza, da un paso atrás y la
 * inclina hacia Marta para enseñársela… y la espuma se le cae encima de la zapatilla: ¡plaf!, mancha que se queda,
 * humo, saltitos a la pata coja. Marta se parte de risa → mirada seria a cámara → Marta coge un palillo
 * del tarro, Guillermo le tiende la taza y ella dibuja en su borrón una carita sonriente (en el globo:
 * ojo, ojo, sonrisa) → Guillermo se ilumina (chispitas, colorado), levanta la taza a cámara; Marta guiña
 * un ojo → negro.
 *
 * Sin textos. La jarrita, las tazas y el palillo se pintan en coordenadas de pantalla; lo que va en
 * una mano se pinta dentro de la mano (debajo de los dedos). El frente de la taza que recibe un chorro
 * se repinta encima del chorro. El globo es una lupa en coordenadas del mundo con un cono hasta la
 * taza. Todo depende de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, mezcla, hash, ruido, campana, rebote } = M2;
  const G = Guillermo, M = Marta;
  const DUR = 14.8;
  const TINTA = "#0b0a0e";

  /* ---------- guion (s) ---------- */
  const T = {
    // Marta: el corazón
    mPicara: 0.5, mCoge0: 0.85, mCoge: 1.12, mAlza: 1.45, mVierte: 1.7,
    mMenea0: 1.95, mMenea1: 3.12, mSube: 3.2, mCorta0: 3.24, mCorta1: 3.62, mCorte: 3.68,
    brillo: 3.82, gOoh: 3.78, mDeja0: 3.86, mDeja: 4.16,
    mTurno: 4.24, mEmpuja0: 4.62, mEmpuja: 4.78, mSuelta: 4.88, jarraLlega: 5.3,
    // Guillermo vierte
    gCoge0: 5.12, gCoge: 5.32, gChulo: 5.58, gApunta: 5.95, gVierte: 6.1, desborda: 6.48, gPara: 7.0,
    gDeja0: 7.06, gDeja: 7.32, gOrgullo: 7.36,
    mAlarma: 6.42,
    // enseña la taza y se la tira encima
    gCogeTaza0: 7.74, gCogeTaza: 7.94, gEnsena0: 8.0, gEnsena: 8.26, derrama: 8.24, endereza: 8.66, plaf: 8.62,
    salto0: 8.66, salto1: 9.4, gSerio: 9.5,
    mRie0: 8.7, mRie1: 9.7,
    // la carita
    mPalillo0: 9.74, mPalillo: 9.98, gTiende0: 9.95, gTiende: 10.32,
    ojo1: 10.5, ojo2: 10.78, sonrisa0: 11.04, sonrisa1: 11.5, mRetira: 11.62,
    gMira: 11.55, gRadiante: 11.95, gAlza: 12.45, gCamara: 12.62, mCamara: 12.85, guino: 13.2,
    fin: 13.95
  };
  // globos (lupa): [entra, sale]
  const GLOBO_A = [1.74, 4.42], GLOBO_B = [6.26, 7.78], GLOBO_C = [10.26, 12.5];

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
  const RELAJADA = D(0.55, 0.6, 0.55, 0.5, 0.45), ABRE = D(0.85, 0.9, 0.9, 0.85, 0.8), PALMA = D(1, 1),
    ASA = D(0.2, 0.26, 0.22, 0.22, 0.26),            // agarra el asa (de la jarrita o de la taza)
    PINZA = D(0.5, 0.55, 0.12, 0.1, 0.1),            // palillo entre pulgar e índice
    EMPUJA = D(0.7, 0.85, 0.85, 0.8, 0.75);

  /* ---------- caras (mismos campos para los dos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, wi: 0, rub: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }
  // pasito: la pelvis se desplaza d (px de pantalla); el pie de delante sale primero y el de detrás le sigue
  function pasito(t, t0, t1, d) {
    const L = t1 - t0;
    return { pel: d * tramo(t, t0, t1), del: d * tramo(t, t0, t0 + 0.62 * L), det: d * tramo(t, t0 + 0.38 * L, t1),
      levD: campana(t, t0, t0 + 0.62 * L), levT: campana(t, t0 + 0.38 * L, t1) };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* =====================================================================================
   * DISPOSICIÓN (px de pantalla)
   * ===================================================================================== */
  const S = 0.3, SUELO = 560;
  const XG = 345, XM = 660;                          // pelvis de cada uno (Marta mira a la izquierda)
  const MESA = { x: 505, y: 330, rx: 88, ry: 12 };
  const PY_PIE = rig => SUELO - (rig.SUELO - rig.PELVIS.y) * S * rig.K;
  const TAZA_G0 = { x: 464, y: 334 }, TAZA_M = { x: 526, y: 334 };
  const PALILLERO = { x: 553, y: 342 };
  const JARRA_Y = 312;                               // asa de la jarrita apoyada (fila de atrás de la mesa)
  const JARRA_M0 = { x: 590, y: JARRA_Y }, JARRA_G0 = { x: 426, y: JARRA_Y }, JARRA_GD = { x: 422, y: 328 };   // GD: donde la deja Guillermo   // asa (Marta: pico a la izquierda)

  /* =====================================================================================
   * JARRITA DE LECHE (origen en el asa, donde agarra la mano; pico hacia +x · dir)
   * ===================================================================================== */
  const LABIO = { x: 32, y: -15 };
  function rutaJarra(g) {
    g.beginPath(); g.moveTo(10, -12); g.lineTo(23, -12); g.quadraticCurveTo(28, -14, LABIO.x, LABIO.y);
    g.quadraticCurveTo(28, -9, 25, -7); g.bezierCurveTo(27, -1, 29, 6, 27.5, 10); g.quadraticCurveTo(27, 12, 24, 12);
    g.lineTo(10, 12); g.quadraticCurveTo(7, 12, 6.8, 9.5); g.bezierCurveTo(6.5, 4, 8.5, -6, 10, -12); g.closePath();
  }
  // j = { x, y, ang, f (−1…1: hacia dónde mira el pico; 0 = de canto en el giro) }
  function dibJarra(g, j) {
    g.save(); g.translate(j.x, j.y); g.scale(j.f === 0 ? 0.001 : j.f, 1); g.rotate(j.ang || 0); g.lineJoin = "round"; g.lineCap = "round";
    // asa
    g.strokeStyle = TINTA; g.lineWidth = 5.2; g.beginPath(); g.moveTo(9.5, -8); g.bezierCurveTo(1, -9, -1, -2, 0, 1); g.bezierCurveTo(1, 6, 4, 8, 8, 8); g.stroke();
    g.strokeStyle = "#c9ced3"; g.lineWidth = 2.6; g.stroke();
    // cuerpo de acero
    rutaJarra(g);
    const gr = g.createLinearGradient(7, 0, 28, 0); gr.addColorStop(0, "#8b939b"); gr.addColorStop(0.35, "#eef1f3"); gr.addColorStop(0.6, "#b6bec5"); gr.addColorStop(1, "#6f777f");
    g.fillStyle = gr; g.fill();
    g.save(); rutaJarra(g); g.clip();
    g.fillStyle = "rgba(255,255,255,0.85)"; g.fillRect(12.5, -10, 2, 20);
    g.fillStyle = "rgba(40,48,56,0.18)"; g.beginPath(); g.ellipse(18, 12, 12, 3.5, 0, 0, Math.PI * 2); g.fill();
    g.restore();
    rutaJarra(g); g.lineWidth = 1.7; g.strokeStyle = TINTA; g.stroke();
    // boca: borde de arriba
    g.fillStyle = "#f5efe4"; g.beginPath(); g.ellipse(16.5, -12, 6.5, 1.5, 0, 0, Math.PI * 2); g.fill();
    g.lineWidth = 1.1; g.stroke();
    g.restore();
  }
  // punto de la jarrita (sistema local) → pantalla
  const enJarra = (j, q) => { const r = rot(q, j.ang || 0); return { x: j.x + r.x * j.f, y: j.y + r.y }; };
  // asa para que el labio quede en `lab` con ese ángulo
  const asaPorLabio = (lab, ang, f) => { const r = rot(LABIO, ang); return { x: lab.x - r.x * f, y: lab.y - r.y }; };

  /* =====================================================================================
   * TAZA (origen: centro del fondo, sobre el platillo). asa ±1
   * ===================================================================================== */
  const ASA_TAZA = { x: 19, y: -11 };                 // donde agarra la mano (× asa)
  const anchoA = y => lerp(9.5, 14, clamp(-y / 20));   // media anchura a la altura y (local)
  function rutaCuerpo(g) {
    g.beginPath(); g.moveTo(-14, -20); g.bezierCurveTo(-14, -9, -12, -1, -8, 0); g.lineTo(8, 0);
    g.bezierCurveTo(12, -1, 14, -9, 14, -20); g.ellipse(0, -20, 14, 3.8, 0, 0, Math.PI, false); g.closePath();
  }
  function platillo(g, x, y) {
    g.save();
    g.fillStyle = "rgba(50,28,14,0.22)"; g.beginPath(); g.ellipse(x + 2, y + 3, 22, 4.6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fbf8f2"; g.strokeStyle = TINTA; g.lineWidth = 1.6;
    g.beginPath(); g.ellipse(x, y + 1, 22, 4.8, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = "rgba(120,110,100,0.45)"; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y + 0.6, 13, 2.6, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "#d77a5c"; g.lineWidth = 1.1; g.beginPath(); g.ellipse(x, y + 1, 19.8, 3.8, 0, 0.15, Math.PI - 0.15); g.stroke();
    g.restore();
  }
  const CREMA = "#8c4c21", CREMA_C = "#b97c44", LECHE = "#f8f1e4", LECHE_S = "#e7d7bf";
  /* c = { x, y, ang, asa, nivel (y local de la superficie), mancha (0…1 blanco en el centro), espuma (0…1 todo blanco),
   *       cupula (px de espuma por encima del borde), chorreo (0…1), soloFrente } */
  function dibTaza(g, c) {
    g.save(); g.translate(c.x, c.y); g.rotate(c.ang || 0); g.lineJoin = "round"; g.lineCap = "round";
    if (!c.soloFrente) {
      // interior: borde de atrás y superficie
      g.fillStyle = "#e6dfd2"; g.beginPath(); g.ellipse(0, -20, 14, 3.8, 0, 0, Math.PI * 2); g.fill();
      const lv = c.nivel ?? -11, rx = anchoA(lv) * 0.93, ry = 3.4 * rx / 14;
      g.save(); g.beginPath(); g.ellipse(0, -20, 13.2, 3.3, 0, 0, Math.PI * 2); g.rect(-14, -20, 28, 20); g.clip();
      g.fillStyle = CREMA; g.beginPath(); g.ellipse(0, lv, rx, ry, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = CREMA_C; g.beginPath(); g.ellipse(-0.5, lv - 0.2, rx * 0.8, ry * 0.7, 0, 0, Math.PI * 2); g.fill();
      const m = c.mancha || 0;
      if (m > 0.01) { g.fillStyle = LECHE; g.beginPath(); g.ellipse(0.5, lv + 0.2, rx * 0.62 * m, ry * 0.58 * m, 0, 0, Math.PI * 2); g.fill();
        g.strokeStyle = "rgba(140,76,33,0.5)"; g.lineWidth = 0.7; g.beginPath(); g.ellipse(0.5, lv + 0.2, rx * 0.4 * m, ry * 0.36 * m, 0, 0, Math.PI * 2); g.stroke(); }
      const es = c.espuma || 0;
      if (es > 0.01) { g.globalAlpha = es; g.fillStyle = LECHE; g.beginPath(); g.ellipse(0, lv, rx, ry, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = LECHE_S; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-7 + i * 4.5, lv + (i % 2 ? 0.8 : -0.6), 1.2, 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1; }
      g.restore();
      g.strokeStyle = TINTA; g.lineWidth = 1.5; g.beginPath(); g.ellipse(0, -20, 14, 3.8, 0, Math.PI, Math.PI * 2); g.stroke();
      // cúpula de espuma que rebosa
      const cu = c.cupula || 0;
      if (cu > 0.2) {
        g.fillStyle = LECHE; g.strokeStyle = TINTA; g.lineWidth = 1.3;
        g.beginPath(); g.moveTo(-14.5, -20);
        for (let i = 0; i <= 10; i++) { const u = i / 10, x = lerp(-14.5, 14.5, u), y = -20 - cu * Math.sin(Math.PI * u) * (1 + 0.12 * Math.sin(u * 19 + 1)); g.lineTo(x, y); }
        g.ellipse(0, -20, 14.5, 3.9, 0, 0, Math.PI, false); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = LECHE_S; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(-9 + i * 4.4, -20 - cu * 0.45 + (i % 2) * 1.6, 0.9 + 0.5 * (i % 3), 0, Math.PI * 2); g.fill(); }
      }
    }
    // cuerpo de porcelana (delante)
    rutaCuerpo(g); g.fillStyle = "#fbf8f2"; g.fill();
    g.save(); rutaCuerpo(g); g.clip();
    g.fillStyle = "#e3dccf"; g.beginPath(); g.ellipse(9, -9, 7, 16, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,0.95)"; g.beginPath(); g.ellipse(-7.5, -11, 2.1, 6.5, 0.12, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#d77a5c"; g.lineWidth = 1.5; g.beginPath(); g.ellipse(0, -16.5, 13.8, 3.6, 0, 0.05, Math.PI - 0.05); g.stroke();
    // regueros de espuma por fuera
    const ch = c.chorreo || 0;
    if (ch > 0.01) {
      g.fillStyle = LECHE; g.strokeStyle = "rgba(150,120,90,0.7)"; g.lineWidth = 0.9;
      for (const [x0, w, L] of [[-10, 3.4, 15], [-2.5, 4.2, 19], [6.5, 3.2, 12], [11, 2.6, 9]]) {
        const l = L * clamp(ch * 1.3 - Math.abs(x0) * 0.02);
        if (l <= 0.3) continue;
        g.beginPath(); g.moveTo(x0 - w, -21); g.lineTo(x0 - w * 0.6, -21 + l); g.quadraticCurveTo(x0, -21 + l + w * 0.9, x0 + w * 0.6, -21 + l); g.lineTo(x0 + w, -21); g.closePath(); g.fill(); g.stroke();
      }
    }
    g.restore();
    rutaCuerpo(g); g.lineWidth = 1.7; g.strokeStyle = TINTA; g.stroke();
    if (!c.soloFrente) {
      // asa
      const a = c.asa;
      g.beginPath(); g.ellipse(a * 16.2, -11, 5, 6.2, 0, -Math.PI / 2 - 0.25, Math.PI / 2 + 0.25, a < 0); g.lineWidth = 4.8; g.strokeStyle = TINTA; g.stroke();
      g.lineWidth = 2.4; g.strokeStyle = "#fbf8f2"; g.stroke();
    }
    g.restore();
  }
  const enTaza = (c, q) => { const r = rot(q, c.ang || 0); return { x: c.x + r.x, y: c.y + r.y }; };
  const tazaPorAsa = (asaPt, ang, asa) => { const r = rot({ x: asa * ASA_TAZA.x, y: ASA_TAZA.y }, ang); return { x: asaPt.x - r.x, y: asaPt.y - r.y }; };

  // tarro de palillos (cristal)
  function palillero(g, quedan) {
    const x = PALILLERO.x, y = PALILLERO.y;
    g.save(); g.lineCap = "round";
    g.fillStyle = "rgba(50,28,14,0.22)"; g.beginPath(); g.ellipse(x + 1.5, y + 1.5, 7, 2, 0, 0, Math.PI * 2); g.fill();
    // palillos
    const P = [[-3, -24, -0.12], [-1, -26, -0.04], [1.5, -25, 0.05], [3, -23, 0.13], [0, -22, 0.0], [-2.2, -21, -0.2], [2.4, -20.5, 0.22]];
    P.forEach(([dx, h, a], i) => { if (i === 1 && !quedan) return;
      g.strokeStyle = "#5d4426"; g.lineWidth = 1.9; g.beginPath(); g.moveTo(x + dx, y - 3); g.lineTo(x + dx + Math.sin(a) * -h, y + h * Math.cos(a) + 2); g.stroke();
      g.strokeStyle = "#e3c48f"; g.lineWidth = 1; g.stroke(); });
    g.fillStyle = "rgba(220,236,240,0.45)"; g.strokeStyle = TINTA; g.lineWidth = 1.3;
    g.beginPath(); g.moveTo(x - 5.5, y - 12); g.lineTo(x - 5, y); g.quadraticCurveTo(x, y + 1.5, x + 5, y); g.lineTo(x + 5.5, y - 12); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(x, y - 12, 5.5, 1.4, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - 3.4, y - 9); g.lineTo(x - 3.1, y - 2); g.stroke();
    g.restore();
  }
  // palillo en la mano: de la mano hacia la punta
  const PAL_L = 15;
  function dibPalillo(g, base, dir) {
    const p = { x: base.x + dir.x * PAL_L, y: base.y + dir.y * PAL_L }, q = { x: base.x - dir.x * 3, y: base.y - dir.y * 3 };
    g.save(); g.lineCap = "round";
    g.strokeStyle = "#5d4426"; g.lineWidth = 2.1; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(p.x, p.y); g.stroke();
    g.strokeStyle = "#e3c48f"; g.lineWidth = 1.1; g.stroke();
    g.restore();
  }

  /* =====================================================================================
   * ESTADOS DE LOS OBJETOS
   * ===================================================================================== */
  // jarrita: { x, y, ang, f, mano: "M" | "G" | null, flujo (0…1), gordo (0…1: chorro a lo bruto) }
  const OSC = (t, f, a) => a * Math.sin(t * Math.PI * 2 * f);
  function jarra(t) {
    // Marta vierte sobre su taza
    const labM = (tt) => {
      const menea = dentro(tt, T.mMenea0, T.mMenea0 + 0.2, T.mMenea1 - 0.15, T.mMenea1);
      const corta = tramo(tt, T.mCorta0, T.mCorta1);
      return { x: TAZA_M.x + 3 + OSC(tt, 4.2, 2.6) * menea - 11 * corta, y: lerp(299, 306, tramo(tt, T.mVierte, T.mMenea0 + 0.4)) - 6 * tramo(tt, T.mMenea1, T.mSube) };
    };
    if (t < T.mCoge) return { x: JARRA_M0.x, y: JARRA_M0.y, ang: 0, f: -1, mano: null };
    if (t < T.mDeja) {
      const ang = t < T.mCorte ? lerp(lerp(0.18 * tramo(t, T.mCoge, T.mAlza), 0.62, tramo(t, T.mAlza, T.mVierte)), 0.72, tramo(t, T.mMenea0, T.mMenea0 + 0.3)) - 0.24 * tramo(t, T.mCorta0, T.mCorta1)
        : lerp(0.48, 0, tramo(t, T.mCorte, T.mCorte + 0.14));
      const enVertido = asaPorLabio(labM(Math.min(t, T.mCorte)), ang, -1);
      const alto = { x: 576, y: 270 };
      let pos;
      if (t < T.mAlza) pos = mezcla(JARRA_M0, alto, tramo(t, T.mCoge + 0.02, T.mAlza));
      else if (t < T.mCorte) pos = mezcla(alto, enVertido, tramo(t, T.mAlza, T.mVierte));
      else if (t < T.mDeja0) pos = mezcla(enVertido, alto, tramo(t, T.mCorte, T.mDeja0 + 0.05));
      else pos = mezcla(alto, JARRA_M0, tramo(t, T.mDeja0, T.mDeja));
      if (t >= T.mDeja0) pos = mezcla(mezcla(enVertido, alto, tramo(t, T.mCorte, T.mDeja0 + 0.05)), JARRA_M0, tramo(t, T.mDeja0, T.mDeja));
      const flujo = dentro(t, T.mVierte - 0.04, T.mVierte + 0.06, T.mCorte - 0.06, T.mCorte + 0.04);
      return { x: pos.x, y: pos.y, ang, f: -1, mano: "M", flujo, gordo: 0, lab: labM(t) };
    }
    // empujón y deslizamiento hasta Guillermo (gira por el camino: queda con el asa hacia él)
    if (t < T.gCoge) {
      const cen0 = JARRA_M0.x - 17.5;                  // centro del cuerpo en la mesa
      const empuje = tramo(t, T.mEmpuja0 + 0.08, T.mSuelta, entrada);
      const desliza = tramo(t, T.mSuelta, T.jarraLlega, salida);
      const cen = lerp(lerp(cen0, cen0 - 14, empuje), JARRA_G0.x + 17.5, desliza);
      const giro = tramo(t, T.mSuelta + 0.04, T.jarraLlega - 0.08), f = -Math.cos(Math.PI * giro);
      const bamboleo = 0.06 * Math.sin((t - T.mSuelta) * 26) * campana(t, T.mSuelta, T.jarraLlega + 0.15);
      return { x: cen - f * 17.5, y: JARRA_Y, ang: bamboleo, f: Math.abs(f) < 0.02 ? 0 : f, mano: null, desliza: campana(t, T.mSuelta - 0.02, T.jarraLlega) };
    }
    // Guillermo: coge, la sube chulito, apunta y vierte a lo bruto
    if (t < T.gDeja) {
      const vierte = tramo(t, T.gVierte - 0.02, T.gVierte + 0.12, entrada);
      const temb = vierte * (1 - tramo(t, T.gPara - 0.1, T.gPara));
      const ang = t < T.gPara ? lerp(lerp(0, 0.5, tramo(t, T.gApunta - 0.15, T.gApunta + 0.12)), 1.12, vierte) + 0.07 * Math.sin(t * 31) * temb
        : lerp(1.12, 0, tramo(t, T.gPara, T.gPara + 0.16));
      const lab = { x: TAZA_G0.x + 3 + 2.2 * Math.sin(t * 37) * temb, y: lerp(297, 303, vierte) + 1.6 * Math.sin(t * 29 + 1) * temb };
      const enVertido = asaPorLabio(lab, ang, 1);
      const alto = { x: 416, y: 262 + 3 * Math.sin((t - T.gCoge) * 7) * dentro(t, T.gChulo, T.gChulo + 0.1, T.gApunta - 0.2, T.gApunta) };
      let pos;
      if (t < T.gChulo) pos = mezcla(JARRA_G0, alto, tramo(t, T.gCoge + 0.02, T.gChulo));
      else if (t < T.gPara) pos = mezcla(alto, enVertido, tramo(t, T.gApunta - 0.15, T.gApunta + 0.12));
      else pos = mezcla(mezcla(enVertido, { x: 416, y: 268 }, tramo(t, T.gPara, T.gDeja0 + 0.04)), JARRA_GD, tramo(t, T.gDeja0, T.gDeja));
      const flujo = dentro(t, T.gVierte, T.gVierte + 0.08, T.gPara - 0.04, T.gPara + 0.06);
      return { x: pos.x, y: pos.y, ang, f: 1, mano: "G", flujo, gordo: 1, lab };
    }
    return { x: JARRA_GD.x, y: JARRA_GD.y, ang: 0, f: 1, mano: null, delante: true };
  }

  // taza de Marta (siempre en la mesa)
  function tazaM(t) {
    const llena = tramo(t, T.mVierte, T.mCorte, s => s);
    return { x: TAZA_M.x, y: TAZA_M.y, ang: 0, asa: 1, nivel: lerp(-11, -18.6, llena), mancha: lerp(0, 1, tramo(t, T.mVierte + 0.2, T.mCorta1)) };
  }
  // taza de Guillermo: en la mesa y luego en su mano
  function estadoTazaG(t) {
    const sube = tramo(t, T.gVierte + 0.02, T.desborda, s => s);
    const rebosa = tramo(t, T.desborda, T.gPara + 0.05, salida);
    const vacia = tramo(t, T.derrama, T.endereza + 0.04);
    return {
      nivel: lerp(-11, -19.6, sube) + 2.6 * vacia, espuma: tramo(t, T.gVierte + 0.15, T.desborda),
      cupula: 8.5 * rebosa * (1 - vacia), chorreo: tramo(t, T.desborda + 0.05, T.gPara + 0.15) * (1 - 0.35 * vacia),
      charco: tramo(t, T.desborda + 0.2, T.gPara + 0.3)
    };
  }

  /* =====================================================================================
   * MANOS
   * ===================================================================================== */
  let BASE_M = null;
  function conCamara(g, f) { g.save(); g.setTransform(BASE_M); f(); g.restore(); }
  const evalua = (o, t, ctx) => (typeof o === "function" ? o(t, ctx) : o);
  function pista(lista, t, ctx) {
    let c = Object.assign({}, evalua(lista[0][2], t, ctx));
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i]; if (t <= t0) break;
      const o = evalua(obj, t, ctx), k = (f || suave)(fase(t, t0, t1));
      c = { x: lerp(c.x, o.x, k), y: lerp(c.y, o.y, k), d: mezclaD(c.d, o.d || c.d, k), mo: lerp(c.mo || 0, o.mo ?? (c.mo || 0), k), bol: lerp(c.bol || 0, o.bol || 0, k) };
    }
    return c;
  }
  const muHacia = (m, h, off) => Math.atan2(h.y - m.y, h.x - m.x) + off;
  // objetivo de pantalla → mano del muñeco; bol (0…1) la lleva al bolsillo
  function manoRig(rig, p, m, lado, bolsillo, dobla, objeto) {
    const h = rig.aHoja(p, m), hom = rig.tronco(p)(lado === "cerca" ? rig.HOMBRO_C : rig.HOMBRO);
    const k = clamp(m.bol || 0);
    const bs = rig.tronco(p)(bolsillo);           // el bolsillo va con la pelvis
    const mu0 = muHacia(h, hom, (m.mo || 0)), x = lerp(h.x, bs.x, k), y = lerp(h.y, bs.y, k);
    return { x, y, ang: 0, mu: lerpAng(mu0, -1.75, k), puno: 1 - k, dedos: m.d, dobla, objeto: k < 0.5 ? objeto : null };
  }
  const R_MG = G.MUNECA_R * G.JK;
  const manoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_MG, y: m.y - Math.sin(mu) * R_MG });
  const BOLS_GC = manoDesde({ x: 131, y: 652 }, -1.75), BOLS_GL = manoDesde({ x: 372, y: 648 }, -1.75);

  /* =====================================================================================
   * MARTA (derecha, mira a la izquierda)
   * ===================================================================================== */
  const CARAS_M = {
    inicio: E({ mx: 0.85, my: 0.15, c: 0.25, sd: 6, gd: 0.02, si: 6, gi: 0.02, sonr: 0.5, ancho: 0.9 }),
    picara: E({ mx: 0.9, my: 0.1, c: 0.35, sd: 22, gd: 0.12, si: 4, gi: -0.02, sonr: 0.7, ancho: 0.95 }),
    vierte: E({ mx: 0.45, my: 0.85, c: 0.45, sd: 8, gd: 0.04, si: 8, gi: 0.04, sonr: 0.4, ancho: 0.8 }),
    corta: E({ mx: 0.4, my: 0.9, c: 0.55, sd: 12, gd: 0.06, si: 12, gi: 0.06, sonr: 0.3, ancho: 0.62, abre: 3 }),
    orgullo: E({ mx: 0.9, my: 0.15, c: 0.45, h: 0.45, sd: 12, gd: 0.04, si: 12, gi: 0.04, sonr: 0.8, ancho: 0.95 }),
    turno: E({ mx: 0.9, my: 0.15, c: 0.3, sd: 16, gd: 0.06, si: 16, gi: 0.06, sonr: 0.65, abre: 6, ancho: 0.85 }),
    mira: E({ mx: 0.85, my: 0.25, c: 0.25, sd: 10, gd: 0.04, si: 10, gi: 0.04, sonr: 0.45 }),
    duda: E({ mx: 0.6, my: 0.7, c: 0.15, sd: 20, gd: 0.16, si: 20, gi: 0.16, abre: 6, ancho: 0.6, sonr: 0.05 }),
    alarma: E({ mx: 0.55, my: 0.6, iris: 0.86, c: 0, sd: 26, gd: 0.2, si: 26, gi: 0.2, abre: 16, ancho: 0.6, sonr: -0.15 }),
    aguanta: E({ mx: 0.85, my: 0.3, c: 0.5, h: 0.35, sd: 12, gd: 0.06, si: 12, gi: 0.06, abre: 0, ancho: 0.6, sonr: 0.55, mof: 0.35 }),
    risa: E({ mx: 0.5, my: 0, c: 1, h: 1, sd: 18, gd: 0.08, si: 18, gi: 0.08, abre: 24, ancho: 1.05, sonr: 0.9 }),
    tierna: E({ mx: 0.9, my: 0.2, c: 0.32, h: 0.25, sd: 14, gd: 0.08, si: 14, gi: 0.08, sonr: 0.65, ancho: 0.9 }),
    palillo: E({ mx: 0.5, my: 0.85, c: 0.35, sd: 8, gd: 0.04, si: 8, gi: 0.04, sonr: 0.5, ancho: 0.8 }),
    dibuja: E({ mx: 0.35, my: 0.8, c: 0.5, sd: 14, gd: 0.06, si: 14, gi: 0.06, sonr: 0.45, ancho: 0.7, abre: 4, lengua: 1 }),
    satisfecha: E({ mx: 0.9, my: 0.2, c: 0.6, h: 0.6, sd: 14, gd: 0.06, si: 14, gi: 0.06, sonr: 0.85, ancho: 0.95 }),
    camara: E({ mx: -0.85, my: 0.05, c: 0.35, h: 0.3, sd: 10, gd: 0.04, si: 14, gi: 0.06, sonr: 0.8, ancho: 0.95 })
  };
  const GUION_CARA_M = [
    [T.mPicara, T.mPicara + 0.25, "picara"], [T.mCoge0 + 0.2, T.mAlza, "vierte"], [T.mSube, T.mCorta0 + 0.1, "corta"],
    [T.mCorte + 0.05, T.mCorte + 0.3, "orgullo"], [T.mTurno, T.mTurno + 0.2, "turno"], [T.mSuelta + 0.05, T.mSuelta + 0.3, "mira"],
    [T.gVierte + 0.1, T.gVierte + 0.3, "duda"], [T.mAlarma, T.mAlarma + 0.12, "alarma"], [T.gOrgullo, T.gOrgullo + 0.3, "aguanta"],
    [T.gEnsena0 + 0.1, T.gEnsena, "duda"], [T.derrama + 0.05, T.derrama + 0.15, "alarma"],
    [T.mRie0, T.mRie0 + 0.15, "risa"], [T.mRie1 - 0.1, T.mRie1 + 0.15, "tierna"], [T.mPalillo0, T.mPalillo0 + 0.2, "palillo"],
    [T.ojo1 - 0.25, T.ojo1, "dibuja"], [T.mRetira, T.mRetira + 0.25, "satisfecha"], [T.mCamara, T.mCamara + 0.25, "camara"]
  ];
  const CUERPOS_M = {
    inicio: { torso: 0.02, cab: 0.04 }, picara: { torso: 0.0, cab: -0.05 }, coge: { torso: 0.1, cab: 0.1 },
    vierte: { torso: 0.08, cab: 0.2 }, corta: { torso: 0.09, cab: 0.24 }, orgullo: { torso: -0.02, cab: -0.02 },
    turno: { torso: 0.05, cab: 0.06 }, empuja: { torso: 0.12, cab: 0.08 }, mira: { torso: 0.03, cab: 0.05 },
    alarma: { torso: -0.06, cab: -0.08 }, aguanta: { torso: 0.02, cab: 0.03 }, risa: { torso: -0.07, cab: -0.16 },
    palillo: { torso: 0.16, cab: 0.18 }, dibuja: { torso: 0.24, cab: 0.26 }, satisfecha: { torso: 0.02, cab: -0.03 },
    camara: { torso: 0.0, cab: 0.06 }
  };
  const GUION_CUERPO_M = [
    [T.mPicara, T.mPicara + 0.3, "picara"], [T.mCoge0, T.mCoge, "coge"], [T.mAlza, T.mVierte, "vierte"], [T.mSube, T.mCorta0 + 0.1, "corta"],
    [T.mCorte, T.mCorte + 0.35, "orgullo"], [T.mTurno, T.mTurno + 0.25, "turno"], [T.mEmpuja0, T.mEmpuja, "empuja"],
    [T.mSuelta + 0.05, T.mSuelta + 0.4, "mira"], [T.mAlarma - 0.05, T.mAlarma + 0.15, "alarma"], [T.gOrgullo, T.gOrgullo + 0.35, "aguanta"],
    [T.mRie0 - 0.05, T.mRie0 + 0.15, "risa"], [T.mRie1 - 0.1, T.mRie1 + 0.2, "mira"], [T.mPalillo0, T.mPalillo, "palillo"],
    [T.gTiende - 0.15, T.ojo1 - 0.05, "dibuja"], [T.mRetira, T.mRetira + 0.35, "satisfecha"], [T.mCamara, T.mCamara + 0.3, "camara"]
  ];
  const cuerpoM = t => guion(GUION_CUERPO_M, CUERPOS_M, "inicio", t);

  function poseM(t) {
    const b = cuerpoM(t), b0 = cuerpoM(t - 0.1);
    const respira = Math.sin(t * 2.0 + 0.7);
    const p = {
      x: XM, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // risa: los hombros botan y la cabeza se mueve
    const rie = dentro(t, T.mRie0, T.mRie0 + 0.1, T.mRie1 - 0.25, T.mRie1);
    p.torsoEsc.y += 0.012 * Math.abs(Math.sin((t - T.mRie0) * 15)) * rie;
    p.cabeza.ang += 0.035 * Math.sin((t - T.mRie0) * 15) * rie;
    // guiño al final: ladea la cabeza
    p.cabeza.ang += -0.05 * campana(t, T.guino - 0.1, T.guino + 0.5);
    // melena: inercia por el movimiento del cuerpo y la cabeza, y algo hacia delante al inclinarse
    const vel = (b.torso - b0.torso) * 6 + (b.cab - b0.cab) * 4;
    p.pelo = { viento: 0, inercia: clamp(-vel * 1.2 + 0.9 * b.torso + 0.25 * Math.sin((t - T.mRie0) * 15) * rie, -1, 1) };
    // se acerca un paso para dibujar la carita y vuelve a su sitio
    const ida = pasito(t, T.mPalillo + 0.06, T.gTiende - 0.02, -18), vuelta = pasito(t, T.mRetira + 0.12, T.mRetira + 0.5, 18);
    const kS = 1 / (S * M.K);
    p.pelvis = M.aHoja(p, { x: XM + ida.pel + vuelta.pel, y: PY_PIE(M) + respira * 0.7 + 1.5 * Math.abs(Math.sin((t - T.mRie0) * 15)) * rie });
    const TOB = M.SUELO - M.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: M.CADERA.cerca.x - 6 - (ida.det + vuelta.del) * kS, y: TOB - 9 * kS * (ida.levT + vuelta.levD) }, ang: 0 };
    p.piernas.lejos = { tob: { x: M.CADERA.lejos.x + 22 - (ida.del + vuelta.det) * kS, y: TOB - 9 * kS * (ida.levD + vuelta.levT) }, ang: 0 };
    const ex = guion(GUION_CARA_M, CARAS_M, "inicio", t);
    // guiño: el ojo derecho (el de la cámara) se cierra un momento
    ex.wd = campana(t, T.guino, T.guino + 0.35);
    // sigue con la mirada la jarrita que se desliza
    const sigue = dentro(t, T.mSuelta, T.mSuelta + 0.1, T.jarraLlega - 0.05, T.jarraLlega + 0.2);
    if (sigue > 0) { ex.mx = lerp(ex.mx, 0.7, sigue); ex.my = lerp(ex.my, 0.75, sigue); }
    p.cara = cara(ex, parpadeo(t, [0.35, 2.45, 5.6, 7.45, 9.85, 12.2]));
    manosM(p, t);
    return p;
  }

  // punta del palillo dibujando en la taza de Guillermo (pantalla) y dirección del palillo
  const longitudDir = Math.hypot(-0.5, 0.87), DIR_PAL = { x: -0.5 / longitudDir, y: 0.87 / longitudDir };
  function trazoCarita(t) {
    const ojo1 = { u: -0.36, v: -0.32 }, ojo2 = { u: 0.34, v: -0.32 };
    const arco = k => { const a = lerp(0.18 * Math.PI, 0.82 * Math.PI, k); return { u: -0.5 * Math.cos(a), v: -0.05 + 0.42 * Math.sin(a) }; };
    const pausa = (p, altura) => ({ ...p, altura, dibuja: altura < 0.001 });
    const traslado = (a, b, k) => pausa({ u: lerp(a.u, b.u, k), v: lerp(a.v, b.v, k) }, 3 * Math.sin(Math.PI * k));
    if (t < T.ojo1 + 0.04) return pausa(ojo1, 3 * (1 - tramo(t, T.ojo1 - 0.04, T.ojo1 + 0.04)));
    if (t <= T.ojo1 + 0.14) return pausa(ojo1, 0);
    if (t < T.ojo2 + 0.04) return traslado(ojo1, ojo2, tramo(t, T.ojo1 + 0.14, T.ojo2 + 0.04));
    if (t <= T.ojo2 + 0.14) return pausa(ojo2, 0);
    if (t < T.sonrisa0) return traslado(ojo2, arco(0), tramo(t, T.ojo2 + 0.14, T.sonrisa0));
    if (t <= T.sonrisa1) return pausa(arco(tramo(t, T.sonrisa0, T.sonrisa1)), 0);
    return pausa(arco(1), 3 * tramo(t, T.sonrisa1, T.mRetira));
  }
  function puntaEspuma(t) {
    const c = tazaEnManoG(t), tr = trazoCarita(t), sup = enTaza(c, { x: 0, y: c.nivel });
    return { x: sup.x + tr.u * 8.5, y: sup.y + tr.v * 2.2 - tr.altura };
  }

  function manosM(p, t) {
    const j = jarra(t);
    const bolsillo = { x: 640, y: 360, d: RELAJADA, bol: 1 };
    const jMano = () => ({ x: jarra(t).x, y: jarra(t).y, d: ASA });
    // punta del palillo sobre la taza de Guillermo
    const puntaCarita = () => {
      const pt = puntaEspuma(t);
      return { x: pt.x - DIR_PAL.x * PAL_L, y: pt.y - DIR_PAL.y * PAL_L, d: PINZA };
    };
    const PL = [
      [0, 0, bolsillo],
      [T.mCoge0, T.mCoge - 0.06, { x: JARRA_M0.x + 2, y: JARRA_M0.y - 4, d: ABRE, bol: 0 }],
      [T.mCoge - 0.06, T.mCoge, jMano],
      [T.mCoge, T.mDeja, jMano, s => 1],
      // suelta la jarrita y le cede el turno con la palma hacia arriba
      [T.mDeja, T.mDeja + 0.08, { x: JARRA_M0.x + 3, y: JARRA_M0.y - 5, d: ABRE }],
      [T.mTurno, T.mTurno + 0.3, { x: 568, y: 300, d: PALMA, mo: -0.55 }],
      // empuja la jarrita por la mesa
      [T.mEmpuja0, T.mEmpuja0 + 0.1, { x: JARRA_M0.x + 1, y: JARRA_M0.y - 3, d: EMPUJA, mo: 0 }],
      [T.mEmpuja0 + 0.1, T.mSuelta, () => { const jj = jarra(t); return { x: jj.x + 1, y: jj.y - 3, d: EMPUJA }; }, s => s],
      [T.mSuelta, T.mSuelta + 0.12, { x: 582, y: 304, d: PALMA, mo: -0.3 }],
      [T.mSuelta + 0.3, T.mSuelta + 0.6, bolsillo],
      // ¡ay, ay, ay!: la mano sale del bolsillo
      [T.mAlarma - 0.05, T.mAlarma + 0.16, { x: 576, y: 290, d: PALMA, mo: -0.5, bol: 0 }],
      [T.gOrgullo + 0.15, T.gOrgullo + 0.45, bolsillo],
      // coge un palillo del tarro
      [T.mPalillo0, T.mPalillo - 0.05, { x: PALILLERO.x + 1, y: PALILLERO.y - 27, d: ABRE, bol: 0 }],
      [T.mPalillo - 0.05, T.mPalillo + 0.02, { x: PALILLERO.x + 1, y: PALILLERO.y - 27, d: PINZA }],
      [T.mPalillo + 0.04, T.gTiende, { x: 556, y: 268, d: PINZA }],
      [T.gTiende - 0.05, T.ojo1 - 0.04, puntaCarita],
      [T.ojo1 - 0.04, T.mRetira, puntaCarita, s => 1],
      [T.mRetira, T.mRetira + 0.3, { x: 578, y: 280, d: PINZA }],
      [T.mCamara - 0.2, T.mCamara + 0.2, bolsillo]
    ];
    const l = pista(PL, t);
    let objeto = null;
    if (j.mano === "M") objeto = g => conCamara(g, () => dibJarra(g, j));
    const conPalillo = t >= T.mPalillo && t < T.mCamara;
    if (conPalillo) {
      const sale = tramo(t, T.mPalillo, T.mPalillo + 0.18);
      const dir = { x: lerp(0, DIR_PAL.x, sale), y: lerp(1, DIR_PAL.y, sale) }, n = Math.hypot(dir.x, dir.y);
      const d = { x: dir.x / n, y: dir.y / n };
      objeto = g => conCamara(g, () => dibPalillo(g, { x: l.x, y: l.y }, d));
      p.palillo = { base: { x: l.x, y: l.y }, dir: d };
    }
    p.manoLejos = manoRig(M, p, l, "lejos", M.BOLSILLO_L, -1, objeto);
    p.manoCerca = M.manoReposo(p, "cerca");
  }

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha)
   * ===================================================================================== */
  const CARAS_G = {
    inicio: E({ mx: 0.9, my: 0.3, c: 0.2, sd: 10, gd: 0.04, si: 12, gi: 0.06, sonr: 0.3, ancho: 0.95 }),
    curioso: E({ mx: 0.85, my: 0.55, c: 0.15, sd: 16, gd: 0.06, si: 20, gi: 0.1, sonr: 0.2, ancho: 0.85 }),
    ooh: E({ mx: 0.8, my: 0.55, iris: 1.1, c: 0, sd: 26, gd: 0.14, si: 26, gi: 0.14, abre: 16, ancho: 0.45, sonr: 0.1 }),
    yo: E({ mx: 0.9, my: 0.1, c: 0.1, sd: 22, gd: 0.1, si: 22, gi: 0.1, abre: 8, ancho: 0.6, sonr: 0.3 }),
    decidido: E({ mx: 0.6, my: 0.5, c: 0.35, sd: -2, gd: -0.1, si: 6, gi: 0.02, sonr: 0.55, ancho: 1.02 }),
    chulo: E({ mx: -0.85, my: 0, c: 0.42, sd: 14, gd: 0.06, si: 14, gi: 0.06, abre: 2, ancho: 1.05, sonr: 0.85 }),
    bruto: E({ mx: 0.5, my: 0.75, c: 0.2, sd: -6, gd: -0.14, si: -6, gi: -0.14, abre: 12, ancho: 1.05, sonr: 0.7 }),
    uy: E({ mx: 0.5, my: 0.7, iris: 0.82, c: 0, sd: 24, gd: 0.18, si: 24, gi: 0.18, abre: 14, ancho: 0.6, sonr: -0.2 }),
    orgullo: E({ mx: 0.55, my: 0.7, c: 0.3, h: 0.4, sd: 14, gd: 0.05, si: 14, gi: 0.05, abre: 6, ancho: 1.05, sonr: 0.9 }),
    ensena: E({ mx: 0.9, my: 0.15, c: 0.25, h: 0.2, sd: 18, gd: 0.06, si: 18, gi: 0.06, abre: 12, ancho: 1.05, sonr: 0.95 }),
    plaf: E({ mx: 0.4, my: 0.9, iris: 0.8, c: 0, sd: 28, gd: 0.2, si: 28, gi: 0.2, abre: 18, ancho: 0.55, sonr: -0.3 }),
    ay: E({ mx: 0, my: 0, c: 1, z: 1, sd: 8, gd: 0.16, si: 8, gi: 0.16, abre: 24, ancho: 0.95, sonr: -0.5 }),
    serio: E({ mx: -0.85, my: 0, c: 0.48, sd: -2, gd: -0.04, si: -2, gi: -0.04, abre: 0, ancho: 0.75, sonr: -0.15 }),
    tiende: E({ mx: 0.9, my: 0.25, c: 0.3, sd: 20, gd: 0.22, si: 20, gi: 0.22, sonr: 0.25, ancho: 0.85 }),
    mira: E({ mx: 0.6, my: 0.75, c: 0.2, sd: 16, gd: 0.08, si: 16, gi: 0.08, abre: 4, ancho: 0.7, sonr: 0.3 }),
    radiante: E({ mx: 0.5, my: 0.5, c: 1, h: 1, sd: 20, gd: 0.08, si: 20, gi: 0.08, abre: 18, ancho: 1.12, sonr: 1, rub: 0.8 }),
    camara: E({ mx: -0.85, my: 0, c: 0.3, h: 0.5, sd: 16, gd: 0.06, si: 16, gi: 0.06, abre: 14, ancho: 1.1, sonr: 1, rub: 0.6 })
  };
  const GUION_CARA_G = [
    [T.mPicara + 0.15, T.mPicara + 0.4, "curioso"], [T.gOoh - 0.05, T.gOoh + 0.15, "ooh"], [T.mTurno + 0.1, T.mTurno + 0.3, "yo"],
    [T.mSuelta + 0.1, T.mSuelta + 0.35, "decidido"], [T.gChulo - 0.05, T.gChulo + 0.15, "chulo"], [T.gApunta - 0.15, T.gApunta + 0.05, "decidido"],
    [T.gVierte, T.gVierte + 0.15, "bruto"], [T.desborda + 0.1, T.desborda + 0.25, "uy"], [T.gOrgullo - 0.05, T.gOrgullo + 0.2, "orgullo"],
    [T.gEnsena0, T.gEnsena0 + 0.2, "ensena"], [T.plaf - 0.04, T.plaf + 0.04, "plaf"], [T.salto0 + 0.02, T.salto0 + 0.1, "ay"],
    [T.gSerio - 0.08, T.gSerio + 0.15, "serio"], [T.gTiende0 + 0.1, T.gTiende0 + 0.35, "tiende"], [T.gMira - 0.1, T.gMira + 0.15, "mira"],
    [T.gRadiante, T.gRadiante + 0.15, "radiante"], [T.gCamara, T.gCamara + 0.25, "camara"]
  ];
  const CUERPOS_G = {
    inicio: { torso: 0.03, cab: 0.03 }, curioso: { torso: 0.06, cab: 0.1 }, ooh: { torso: 0.1, cab: 0.16 },
    yo: { torso: -0.02, cab: -0.02 }, coge: { torso: 0.08, cab: 0.06 }, chulo: { torso: -0.04, cab: -0.07 },
    vierte: { torso: 0.08, cab: 0.18 }, uy: { torso: -0.06, cab: -0.04 }, orgullo: { torso: 0.03, cab: 0.08 },
    ensena: { torso: 0.1, cab: 0.04 }, plaf: { torso: 0.12, cab: 0.3 }, salto: { torso: -0.06, cab: -0.1 },
    serio: { torso: 0.02, cab: 0.0 }, tiende: { torso: 0.12, cab: 0.06 }, mira: { torso: 0.04, cab: 0.16 },
    radiante: { torso: -0.04, cab: -0.08 }, camara: { torso: 0.0, cab: -0.04 }
  };
  const GUION_CUERPO_G = [
    [T.mPicara + 0.1, T.mPicara + 0.5, "curioso"], [T.gOoh - 0.05, T.gOoh + 0.25, "ooh"], [T.mTurno + 0.1, T.mTurno + 0.35, "yo"],
    [T.gCoge0, T.gCoge, "coge"], [T.gCoge + 0.05, T.gChulo + 0.1, "chulo"], [T.gApunta - 0.1, T.gVierte, "vierte"],
    [T.desborda + 0.1, T.desborda + 0.3, "uy"], [T.gOrgullo - 0.05, T.gOrgullo + 0.3, "orgullo"], [T.gEnsena0, T.gEnsena, "ensena"],
    [T.plaf - 0.04, T.plaf + 0.06, "plaf"], [T.salto0, T.salto0 + 0.12, "salto"], [T.gSerio - 0.1, T.gSerio + 0.25, "serio"],
    [T.gTiende0, T.gTiende, "tiende"], [T.gMira - 0.1, T.gMira + 0.2, "mira"], [T.gRadiante, T.gRadiante + 0.2, "radiante"],
    [T.gCamara, T.gCamara + 0.3, "camara"]
  ];

  // el salto a la pata coja (después de quemarse el pie)
  function salto(t) {
    const on = dentro(t, T.salto0, T.salto0 + 0.08, T.salto1 - 0.12, T.salto1);
    const ph = (t - T.salto0) * 4.6;                  // brincos por segundo
    const bote = Math.abs(Math.sin(Math.PI * ph)) * on;
    return { on, bote, sacude: Math.sin((t - T.salto0) * 34) * on };
  }
  function poseG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const respira = Math.sin(t * 2.3);
    const p = {
      x: XG, suelo: SUELO, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.005 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // «¿yo?»: respingo hacia atrás con las cejas arriba
    const yo = campana(t, T.mTurno + 0.1, T.mTurno + 0.7);
    p.cabeza.ang -= 0.08 * yo; p.cabeza.dx -= 10 * yo;
    // el chorro a lo bruto: le tiembla el cuerpo
    const bruto = dentro(t, T.gVierte, T.gVierte + 0.1, T.gPara - 0.05, T.gPara + 0.05);
    p.torso += 0.012 * Math.sin(t * 31) * bruto;
    // radiante: brinquito de alegría
    const alegria = campana(t, T.gRadiante, T.gRadiante + 0.4);
    const sa = salto(t);
    // un paso atrás para enseñar la taza (el pie de delante se queda), vuelve y otro paso hacia Marta al tenderle la taza
    const atras = pasito(t, T.gCogeTaza + 0.04, T.gEnsena0 + 0.14, -45), vuelve = pasito(t, T.gSerio + 0.02, T.gTiende0, 45);
    const pg = pasito(t, T.gTiende0, T.gTiende0 + 0.42, 34);
    p.pelvis = G.aHoja(p, { x: XG + pg.pel + atras.pel + vuelve.pel, y: PY_PIE(G) + respira * 0.9 - 14 * sa.bote - 6 * alegria });
    const TOB = G.SUELO - G.TOBILLO_ALTO;
    // paso adelante al enseñar la taza (el pie de delante queda debajo del derrame)
    const paso = dentro(t, T.gEnsena0, T.gEnsena, T.gSerio, T.gSerio + 0.3);
    const elevaL = 70 * sa.on, elevaC = 14 * sa.bote / (S);
    const alzaAleg = 6 * alegria / S;
    p.piernas.cerca = { tob: { x: G.CADERA.cerca.x - 6 + (pg.det + atras.del + vuelve.del) / S, y: TOB - elevaC * 0.85 - alzaAleg - 9 * (pg.levT + atras.levD + vuelve.levD) / S }, ang: 0.1 * sa.bote };
    p.piernas.lejos = { tob: { x: G.CADERA.lejos.x + 14 + 62 * paso - 20 * sa.on + pg.del / S, y: TOB - elevaL - alzaAleg - elevaC * 0.6 - 9 * pg.levD / S }, ang: -0.3 * sa.on + 0.12 * sa.sacude };
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    // mira la jarrita que llega deslizándose
    const sigue = dentro(t, T.mSuelta + 0.05, T.mSuelta + 0.15, T.jarraLlega - 0.05, T.gCoge);
    if (sigue > 0) { ex.mx = lerp(ex.mx, 0.7, sigue); ex.my = lerp(ex.my, 0.75, sigue); }
    p.cara = cara(ex, parpadeo(t, [0.6, 2.3, 4.9, 7.5, 9.9, 13.5]));
    p.rojo = 0.35 * dentro(t, T.plaf, T.plaf + 0.1, T.salto1 - 0.1, T.salto1 + 0.4) + 0.2 * campana(t, T.gRadiante, T.gRadiante + 1.6);
    p.sudor = 0.45 * dentro(t, T.desborda + 0.15, T.desborda + 0.3, T.gOrgullo - 0.1, T.gOrgullo + 0.1) + 0.5 * dentro(t, T.plaf + 0.1, T.plaf + 0.3, T.gSerio + 0.3, T.gSerio + 0.6);
    manosG(p, t);
    return p;
  }

  // la taza en la mano de Guillermo (pantalla): asa en la mano
  const PT_TOMA = { x: TAZA_G0.x - ASA_TAZA.x, y: TAZA_G0.y + ASA_TAZA.y };
  function pistaTazaG(t) {
    const sa = salto(t);
    const PL = [
      [0, 0, { x: PT_TOMA.x, y: PT_TOMA.y, ang: 0 }],
      [T.gCogeTaza + 0.02, T.gEnsena0 + 0.06, { x: 404, y: 300, ang: 0 }],
      [T.gEnsena0 + 0.06, T.gEnsena, { x: 384, y: 294, ang: 0.92 }],
      [T.endereza, T.endereza + 0.12, { x: 388, y: 290, ang: -0.05 }, salida],
      [T.gSerio - 0.1, T.gSerio + 0.05, { x: 390, y: 292, ang: 0 }],
      [T.gSerio + 0.05, T.gTiende0, { x: 432, y: 292, ang: 0 }],
      [T.gTiende0, T.gTiende, { x: 488, y: 290, ang: 0 }],
      [T.mRetira, T.gRadiante, { x: 452, y: 292, ang: 0 }],
      [T.gAlza, T.gAlza + 0.3, { x: 458, y: 266, ang: -0.04 }, salida]
    ];
    let c = Object.assign({}, PL[0][2]);
    for (let i = 1; i < PL.length; i++) { const [t0, t1, o, f] = PL[i]; if (t <= t0) break; const k = (f || suave)(fase(t, t0, t1)); c = { x: lerp(c.x, o.x, k), y: lerp(c.y, o.y, k), ang: lerp(c.ang, o.ang, k) }; }
    c.y -= 10 * sa.bote;
    c.ang += 0.05 * Math.sin((t - T.salto0) * 21) * sa.on;
    const alegria = campana(t, T.gRadiante, T.gRadiante + 0.4); c.y -= 6 * alegria;
    return c;
  }
  function tazaEnManoG(t) {
    const m = pistaTazaG(t), o = tazaPorAsa(m, m.ang, -1), e = estadoTazaG(t);
    return Object.assign({ x: o.x, y: o.y, ang: m.ang, asa: -1, mano: m }, e);
  }

  function manosG(p, t) {
    const j = jarra(t);
    const reposo = { x: 440, y: 334, d: RELAJADA };
    const bolsillo = { x: 362, y: 360, d: RELAJADA, bol: 1 };
    const jMano = () => ({ x: jarra(t).x, y: jarra(t).y, d: ASA });
    const tMano = () => { const m = pistaTazaG(t); return { x: m.x, y: m.y, d: ASA }; };
    const PL = [
      [0, 0, bolsillo],
      [T.gCoge0, T.gCoge - 0.05, { x: JARRA_G0.x - 2, y: JARRA_G0.y - 4, d: ABRE, bol: 0 }],
      [T.gCoge - 0.05, T.gCoge, jMano],
      [T.gCoge, T.gDeja, jMano, s => 1],
      [T.gDeja, T.gDeja + 0.1, { x: JARRA_GD.x - 2, y: JARRA_GD.y - 5, d: ABRE }],
      [T.gDeja + 0.1, T.gCogeTaza0, reposo],
      [T.gCogeTaza0, T.gCogeTaza - 0.05, { x: PT_TOMA.x - 2, y: PT_TOMA.y - 4, d: ABRE }],
      [T.gCogeTaza - 0.05, T.gCogeTaza, tMano],
      [T.gCogeTaza, DUR, tMano, s => 1]
    ];
    const l = pista(PL, t);
    let objeto = null;
    if (j.mano === "G") objeto = g => conCamara(g, () => dibJarra(g, j));
    if (t >= T.gCogeTaza) { const c = tazaEnManoG(t); objeto = g => conCamara(g, () => dibTaza(g, c)); p.taza = c; }
    p.manoLejos = manoRig(G, p, l, "lejos", BOLS_GL, -1, objeto);
    const bc = G.tronco(p)(BOLS_GC);
    p.manoCerca = { x: bc.x, y: bc.y, ang: 0, mu: -1.75, puno: 0, dobla: -1 };
  }

  /* =====================================================================================
   * DECORADO: café acogedor por la mañana
   * ===================================================================================== */
  const ZOCALO = 246, BARRA = 372, SUELO_PARED = 470;
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 100; const g = c.getContext("2d");
    g.translate(60, 50); g.lineJoin = "round"; g.lineCap = "round";
    // pared rosa teja
    const gp = g.createLinearGradient(0, -50, 0, ZOCALO); gp.addColorStop(0, "#c9785b"); gp.addColorStop(1, "#dc9478");
    g.fillStyle = gp; g.fillRect(-60, -50, W + 120, ZOCALO + 50);
    // moldura de techo
    g.fillStyle = "#f2e2cf"; g.fillRect(-60, -50, W + 120, 30); g.fillStyle = "rgba(120,60,40,0.25)"; g.fillRect(-60, -20, W + 120, 3);
    // azulejos blancos detrás de la barra
    g.fillStyle = "#f1ebe1"; g.fillRect(-60, ZOCALO, W + 120, BARRA - ZOCALO);
    g.strokeStyle = "rgba(150,135,120,0.55)"; g.lineWidth = 1;
    for (let y = ZOCALO, f = 0; y < BARRA; y += 12, f++) {
      g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke();
      for (let x = -60 + (f % 2 ? 13 : 0); x < W + 60; x += 26) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 12); g.stroke(); }
    }
    g.fillStyle = "rgba(255,255,255,0.35)"; for (let y = ZOCALO + 2; y < BARRA; y += 12) g.fillRect(-60, y, W + 120, 2);
    g.fillStyle = "#a9654a"; g.fillRect(-60, ZOCALO - 5, W + 120, 6); g.fillStyle = "rgba(255,230,210,0.4)"; g.fillRect(-60, ZOCALO - 5, W + 120, 1.5);
    pizarra(g);
    balda(g);
    potos(g);
    // barra de madera del fondo
    g.fillStyle = "#4b2e1d"; g.fillRect(-60, BARRA + 8, W + 120, SUELO_PARED - BARRA - 8);
    for (let x = -60; x < W + 60; x += 34) { g.fillStyle = x % 68 ? "#553522" : "#4f311f"; g.fillRect(x, BARRA + 10, 33, SUELO_PARED - BARRA - 20); g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(x + 33, BARRA + 10, 1.5, SUELO_PARED - BARRA - 20); }
    g.fillStyle = "#2c1a10"; g.fillRect(-60, SUELO_PARED - 10, W + 120, 10);
    g.fillStyle = "#7a4c2e"; g.fillRect(-60, BARRA, W + 120, 10); g.fillStyle = "rgba(255,220,180,0.4)"; g.fillRect(-60, BARRA, W + 120, 2);
    g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(-60, BARRA + 10, W + 120, 4);
    campana_(g);
    molinillo(g);
    cafetera(g);
    tazasApiladas(g);
    // suelo de tarima clara en perspectiva
    const gs = g.createLinearGradient(0, SUELO_PARED, 0, H + 50); gs.addColorStop(0, "#9a6640"); gs.addColorStop(1, "#c18b5b");
    g.fillStyle = gs; g.fillRect(-60, SUELO_PARED, W + 120, H + 50 - SUELO_PARED);
    g.strokeStyle = "rgba(70,38,18,0.45)"; g.lineWidth = 1.4;
    for (let i = -14; i <= 16; i++) { g.beginPath(); g.moveTo(490 + i * 40, SUELO_PARED); g.lineTo(490 + i * 104, H + 50); g.stroke(); }
    let yy = SUELO_PARED + 9; for (let k = 0; k < 9; k++) { g.strokeStyle = "rgba(70,38,18,0.22)"; g.beginPath(); g.moveTo(-60, yy); g.lineTo(W + 60, yy); g.stroke(); yy += 10 + k * 7; }
    // lámparas y su luz
    for (const x of [276, 712]) lampara(g, x);
    // rayos de sol en diagonal desde la izquierda
    g.save(); g.globalCompositeOperation = "lighter";
    for (const [x0, w, a] of [[-40, 70, 0.07], [90, 46, 0.055], [190, 90, 0.05], [360, 40, 0.04]]) {
      const gr = g.createLinearGradient(x0, -50, x0 + 520, 520); gr.addColorStop(0, `rgba(255,236,190,${a})`); gr.addColorStop(1, "rgba(255,236,190,0)");
      g.fillStyle = gr; g.beginPath(); g.moveTo(x0, -50); g.lineTo(x0 + w, -50); g.lineTo(x0 + w + 520, 560); g.lineTo(x0 + 520, 560); g.closePath(); g.fill();
    }
    g.restore();
    // viñeta
    const vg = g.createRadialGradient(490, 300, 280, 490, 300, 780); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(40,10,0,0.42)");
    g.fillStyle = vg; g.fillRect(-60, -50, W + 120, H + 100);
    mesa(g);
    return c;
  }
  function pizarra(g) {
    const x = 70, y = 40, w = 200, h = 128;
    g.fillStyle = "rgba(60,25,10,0.3)"; g.fillRect(x + 5, y + 6, w, h);
    g.fillStyle = "#7a4c2a"; g.fillRect(x - 8, y - 8, w + 16, h + 16); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x - 8, y - 8, w + 16, h + 16);
    g.fillStyle = "#2f3a34"; g.fillRect(x, y, w, h); g.strokeRect(x, y, w, h);
    g.fillStyle = "rgba(255,255,255,0.05)"; g.beginPath(); g.ellipse(x + 70, y + 50, 70, 30, -0.3, 0, Math.PI * 2); g.fill();
    g.lineCap = "round"; g.lineJoin = "round";
    const tiza = (c, w2) => { g.strokeStyle = c; g.lineWidth = w2; };
    // taza humeante
    tiza("rgba(250,245,235,0.9)", 2.4);
    g.beginPath(); g.moveTo(x + 22, y + 58); g.lineTo(x + 26, y + 88); g.quadraticCurveTo(x + 40, y + 96, x + 54, y + 88); g.lineTo(x + 58, y + 58); g.closePath(); g.stroke();
    g.beginPath(); g.ellipse(x + 62, y + 70, 7, 8, 0, -1.3, 1.3); g.stroke();
    g.beginPath(); g.moveTo(x + 14, y + 100); g.quadraticCurveTo(x + 40, y + 106, x + 66, y + 100); g.stroke();
    for (const dx of [32, 44]) { g.beginPath(); g.moveTo(x + dx, y + 50); g.bezierCurveTo(x + dx - 6, y + 42, x + dx + 6, y + 36, x + dx, y + 26); g.stroke(); }
    // corazón rosa
    tiza("rgba(255,170,190,0.9)", 2.6);
    g.beginPath(); g.moveTo(x + 104, y + 52); g.bezierCurveTo(x + 104, y + 40, x + 88, y + 38, x + 88, y + 50); g.bezierCurveTo(x + 88, y + 60, x + 104, y + 68, x + 104, y + 74);
    g.bezierCurveTo(x + 104, y + 68, x + 120, y + 60, x + 120, y + 50); g.bezierCurveTo(x + 120, y + 38, x + 104, y + 40, x + 104, y + 52); g.stroke();
    // hoja de latte art (roseta)
    tiza("rgba(250,245,235,0.85)", 2);
    g.beginPath(); g.ellipse(x + 160, y + 58, 24, 30, 0, 0, Math.PI * 2); g.stroke();
    for (let i = 0; i < 5; i++) { const yy = y + 40 + i * 9, ww = 15 - i * 2.2; g.beginPath(); g.moveTo(x + 160 - ww, yy); g.quadraticCurveTo(x + 160, yy + 6, x + 160 + ww, yy); g.stroke(); }
    g.beginPath(); g.moveTo(x + 160, y + 34); g.lineTo(x + 160, y + 84); g.stroke();
    // granos de café
    tiza("rgba(240,200,140,0.9)", 2);
    for (const [bx, by, a] of [[x + 92, y + 98, 0.4], [x + 110, y + 108, -0.3], [x + 126, y + 96, 0.9]]) {
      g.save(); g.translate(bx, by); g.rotate(a); g.beginPath(); g.ellipse(0, 0, 7, 5, 0, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(-5, 0); g.quadraticCurveTo(0, -3, 5, 0); g.stroke(); g.restore(); }
    // estrellitas
    tiza("rgba(255,230,140,0.9)", 1.8);
    for (const [sx, sy, r] of [[x + 186, y + 18, 6], [x + 132, y + 22, 4], [x + 186, y + 104, 5], [x + 76, y + 20, 4]]) {
      g.beginPath(); g.moveTo(sx - r, sy); g.lineTo(sx + r, sy); g.moveTo(sx, sy - r); g.lineTo(sx, sy + r); g.moveTo(sx - r * 0.6, sy - r * 0.6); g.lineTo(sx + r * 0.6, sy + r * 0.6); g.stroke(); }
    // tiza y borrador en el canto
    g.fillStyle = "#f6f1e6"; g.fillRect(x + 30, y + h + 2, 14, 3); g.fillStyle = "#4a3a30"; g.fillRect(x + 150, y + h + 1, 22, 5);
  }
  function balda(g) {
    const y = 214, x0 = 56, x1 = 300;
    // escuadras
    g.fillStyle = "#3a2416"; for (const x of [x0 + 20, x1 - 24]) { g.beginPath(); g.moveTo(x, y + 6); g.lineTo(x + 5, y + 6); g.lineTo(x + 5, y + 26); g.closePath(); g.fill(); }
    // tarros de café (sin etiquetas)
    for (const [x, h, ll] of [[x0 + 14, 34, 0.7], [x0 + 46, 28, 0.55], [x0 + 74, 38, 0.85]]) {
      g.fillStyle = "rgba(225,240,245,0.5)"; g.strokeStyle = TINTA; g.lineWidth = 1.4;
      g.beginPath(); g.rect(x - 11, y - h, 22, h); g.fill(); g.stroke();
      g.fillStyle = "#4a2612"; g.fillRect(x - 10, y - h * ll, 20, h * ll - 1);
      g.fillStyle = "rgba(255,210,160,0.5)"; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(x - 7 + (i % 3) * 7, y - h * ll + 4 + Math.floor(i / 3) * 7, 2, 1.3, 0.5, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = "#b8893a"; g.fillRect(x - 12, y - h - 5, 24, 6); g.strokeRect(x - 12, y - h - 5, 24, 6);
      g.fillStyle = "rgba(255,255,255,0.6)"; g.fillRect(x - 8, y - h + 3, 2, h - 6);
    }
    // tazas boca abajo y una tetera
    for (const [x, col] of [[x0 + 120, "#f4ece0"], [x0 + 148, "#9fc1b6"], [x0 + 176, "#f4ece0"]]) {
      g.fillStyle = col; g.strokeStyle = TINTA; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(x - 11, y); g.lineTo(x - 9, y - 14); g.lineTo(x + 9, y - 14); g.lineTo(x + 11, y); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.ellipse(x + 12, y - 7, 3.5, 4.5, 0, -1.4, 1.4); g.stroke();
    }
    // maceta con planta
    const px = x1 - 50;
    g.fillStyle = "#c8643f"; g.strokeStyle = TINTA; g.lineWidth = 1.4; g.beginPath(); g.moveTo(px - 12, y - 18); g.lineTo(px + 12, y - 18); g.lineTo(px + 9, y); g.lineTo(px - 9, y); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#4f8a4c"; for (const [lx, ly, a] of [[-8, -26, -0.6], [0, -34, 0], [8, -27, 0.6], [-4, -30, -0.3], [5, -31, 0.35]]) { g.save(); g.translate(px + lx, y + ly); g.rotate(a); g.beginPath(); g.ellipse(0, 0, 4, 9, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
    // tabla
    g.fillStyle = "#6b4228"; g.fillRect(x0, y, x1 - x0, 7); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.strokeRect(x0, y, x1 - x0, 7);
    g.fillStyle = "rgba(255,220,180,0.35)"; g.fillRect(x0, y, x1 - x0, 1.5);
  }
  function potos(g) {
    // maceta colgante en la esquina de arriba a la derecha
    const x = 930, y = 30;
    g.strokeStyle = "#3a2a20"; g.lineWidth = 1.2; for (const dx of [-14, 0, 14]) { g.beginPath(); g.moveTo(x, -20); g.lineTo(x + dx, y); g.stroke(); }
    g.fillStyle = "#e9dccb"; g.strokeStyle = TINTA; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 18, y); g.lineTo(x + 18, y); g.quadraticCurveTo(x + 16, y + 22, x, y + 24); g.quadraticCurveTo(x - 16, y + 22, x - 18, y); g.closePath(); g.fill(); g.stroke();
    for (const [dx, L] of [[-14, 120], [-4, 160], [8, 100], [16, 140]]) {
      g.strokeStyle = "#3f6b39"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x + dx, y + 8);
      for (let k = 1; k <= 8; k++) g.lineTo(x + dx + 6 * Math.sin(k * 0.9 + dx), y + 8 + L * k / 8); g.stroke();
      for (let k = 1; k <= 7; k++) { const lx = x + dx + 6 * Math.sin(k * 0.9 + dx), ly = y + 8 + L * k / 8; g.fillStyle = k % 2 ? "#5d9a4f" : "#4a8441";
        g.save(); g.translate(lx, ly); g.rotate(k % 2 ? -0.7 : 0.7); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(8, -4, 10, 4); g.quadraticCurveTo(4, 8, 0, 0); g.fill(); g.restore(); }
    }
  }
  function campana_(g) {
    // campana de cristal con bizcochos en la barra (izquierda)
    const x = 120, y = BARRA;
    g.fillStyle = "#f6efe3"; g.strokeStyle = TINTA; g.lineWidth = 1.5; g.beginPath(); g.ellipse(x, y - 3, 44, 7, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#e6c7a0"; g.fillRect(x - 3, y - 2, 6, 3);
    for (const [dx, w, h, c1, c2] of [[-20, 26, 18, "#d9a35f", "#7a3d1c"], [10, 24, 22, "#f1d8b0", "#c86a7d"]]) {
      g.fillStyle = c1; g.beginPath(); g.rect(x + dx - w / 2, y - 6 - h, w, h); g.fill(); g.stroke();
      g.fillStyle = c2; g.fillRect(x + dx - w / 2 + 1, y - 6 - h + 1, w - 2, 5);
    }
    g.fillStyle = "rgba(220,240,250,0.25)"; g.beginPath(); g.moveTo(x - 40, y - 4); g.bezierCurveTo(x - 40, y - 70, x + 40, y - 70, x + 40, y - 4); g.closePath(); g.fill();
    g.lineWidth = 1.6; g.stroke();
    g.fillStyle = "#cfd8dc"; g.beginPath(); g.arc(x, y - 56, 5, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 30, y - 18); g.quadraticCurveTo(x - 32, y - 42, x - 18, y - 52); g.stroke();
  }
  function molinillo(g) {
    const x = 760, y = BARRA;
    g.fillStyle = "#2f2f33"; g.strokeStyle = TINTA; g.lineWidth = 1.5;
    g.beginPath(); g.rect(x - 14, y - 46, 28, 46); g.fill(); g.stroke();
    g.fillStyle = "#4a4a50"; g.fillRect(x - 10, y - 40, 20, 6);
    g.fillStyle = "rgba(220,235,240,0.45)"; g.beginPath(); g.moveTo(x - 14, y - 46); g.lineTo(x - 20, y - 88); g.lineTo(x + 20, y - 88); g.lineTo(x + 14, y - 46); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#4a2612"; g.beginPath(); g.moveTo(x - 15.5, y - 56); g.lineTo(x - 18, y - 74); g.lineTo(x + 18, y - 74); g.lineTo(x + 15.5, y - 56); g.closePath(); g.fill();
    g.fillStyle = "#2f2f33"; g.beginPath(); g.ellipse(x, y - 89, 21, 4, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  }
  function cafetera(g) {
    const x = 870, y = BARRA, w = 150, h = 82;
    g.save(); g.lineJoin = "round";
    // cuerpo
    const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0); gr.addColorStop(0, "#8e979f"); gr.addColorStop(0.3, "#f1f4f6"); gr.addColorStop(0.55, "#b9c2c9"); gr.addColorStop(1, "#7a838b");
    g.fillStyle = gr; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x - w / 2, y - h + 12); g.quadraticCurveTo(x - w / 2, y - h, x - w / 2 + 12, y - h); g.lineTo(x + w / 2 - 12, y - h); g.quadraticCurveTo(x + w / 2, y - h, x + w / 2, y - h + 12); g.lineTo(x + w / 2, y); g.closePath(); g.fill(); g.stroke();
    // panel rojo
    g.fillStyle = "#b2453a"; g.fillRect(x - w / 2 + 8, y - h + 10, w - 16, 18); g.strokeRect(x - w / 2 + 8, y - h + 10, w - 16, 18);
    g.fillStyle = "#f2d38a"; for (const dx of [-40, -20, 20, 40]) { g.beginPath(); g.arc(x + dx, y - h + 19, 3.2, 0, Math.PI * 2); g.fill(); }
    // manómetro
    g.fillStyle = "#fbf8f2"; g.beginPath(); g.arc(x, y - h + 19, 7, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.4; g.stroke();
    g.beginPath(); g.moveTo(x, y - h + 19); g.lineTo(x + 4, y - h + 15); g.stroke();
    // grupos y portafiltros
    for (const dx of [-34, 34]) {
      g.fillStyle = "#5d656c"; g.beginPath(); g.rect(x + dx - 10, y - 46, 20, 10); g.fill(); g.lineWidth = 1.4; g.stroke();
      g.fillStyle = "#2a2a2e"; g.beginPath(); g.moveTo(x + dx - 9, y - 36); g.lineTo(x + dx + 9, y - 36); g.lineTo(x + dx + 6, y - 30); g.lineTo(x + dx - 6, y - 30); g.closePath(); g.fill(); g.stroke();
      g.lineWidth = 4; g.strokeStyle = "#1c1c20"; g.beginPath(); g.moveTo(x + dx + 6, y - 33); g.lineTo(x + dx + 26, y - 36); g.stroke(); g.strokeStyle = TINTA; g.lineWidth = 1.4;
      // tacita debajo
      g.fillStyle = "#fbf8f2"; g.beginPath(); g.moveTo(x + dx - 6, y - 14); g.lineTo(x + dx - 5, y - 5); g.lineTo(x + dx + 5, y - 5); g.lineTo(x + dx + 6, y - 14); g.closePath(); g.fill(); g.stroke();
    }
    // bandeja
    g.fillStyle = "#5d656c"; g.fillRect(x - w / 2 + 6, y - 6, w - 12, 6); g.strokeRect(x - w / 2 + 6, y - 6, w - 12, 6);
    // lanza de vapor
    g.strokeStyle = TINTA; g.lineWidth = 4.2; g.beginPath(); g.moveTo(x + w / 2 - 8, y - 60); g.quadraticCurveTo(x + w / 2 + 8, y - 56, x + w / 2 + 6, y - 22); g.stroke();
    g.strokeStyle = "#c9ced3"; g.lineWidth = 2.2; g.stroke();
    // tazas calentándose arriba
    for (const dx of [-46, -24, 0, 24]) { g.fillStyle = "#fbf8f2"; g.strokeStyle = TINTA; g.lineWidth = 1.3;
      g.beginPath(); g.moveTo(x + dx - 8, y - h); g.lineTo(x + dx - 7, y - h - 11); g.lineTo(x + dx + 7, y - h - 11); g.lineTo(x + dx + 8, y - h); g.closePath(); g.fill(); g.stroke(); }
    g.restore();
  }
  const VAPOR_C = { x: 870 + 75 + 6, y: BARRA - 22 };
  function tazasApiladas(g) {
    const x = 640, y = BARRA;
    for (let i = 0; i < 4; i++) { const yy = y - i * 9;
      g.fillStyle = "#fbf8f2"; g.strokeStyle = TINTA; g.lineWidth = 1.3; g.beginPath(); g.ellipse(x, yy - 1, 15, 3.5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(x - 10, yy - 2); g.lineTo(x - 8, yy - 9); g.lineTo(x + 8, yy - 9); g.lineTo(x + 10, yy - 2); g.closePath(); g.fill(); g.stroke(); }
    // jarritas de leche colgadas no: un bote de cucharillas
    g.fillStyle = "#b9c2c9"; g.strokeStyle = TINTA; g.lineWidth = 1.3; g.beginPath(); g.rect(x + 34, y - 18, 12, 18); g.fill(); g.stroke();
    for (const dx of [-3, 0, 3]) { g.beginPath(); g.moveTo(x + 40 + dx, y - 18); g.lineTo(x + 40 + dx * 1.6, y - 30); g.stroke(); }
  }
  function lampara(g, x) {
    const y = 70;
    g.strokeStyle = "#2a1a10"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, -50); g.lineTo(x, y - 18); g.stroke();
    const gl = g.createRadialGradient(x, y + 10, 6, x, y + 10, 190); gl.addColorStop(0, "rgba(255,226,160,0.45)"); gl.addColorStop(1, "rgba(255,226,160,0)");
    g.fillStyle = gl; g.beginPath(); g.arc(x, y + 10, 190, 0, Math.PI * 2); g.fill();
    const gs = g.createLinearGradient(x - 26, 0, x + 26, 0); gs.addColorStop(0, "#7a5520"); gs.addColorStop(0.45, "#e2b860"); gs.addColorStop(1, "#6a4818");
    g.fillStyle = gs; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x - 5, y - 18); g.lineTo(x + 5, y - 18); g.quadraticCurveTo(x + 26, y - 12, x + 28, y); g.lineTo(x - 28, y); g.quadraticCurveTo(x - 26, y - 12, x - 5, y - 18); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#fff6d6"; g.beginPath(); g.ellipse(x, y + 1, 18, 4, 0, 0, Math.PI * 2); g.fill();
  }
  // mesa alta de madera (delante, en el fondo cacheado)
  function mesa(g) {
    const m = MESA;
    g.fillStyle = "rgba(40,18,6,0.35)"; g.beginPath(); g.ellipse(m.x, SUELO + 3, 64, 7, 0, 0, Math.PI * 2); g.fill();
    // pie de hierro
    g.fillStyle = "#26201e"; g.strokeStyle = TINTA; g.lineWidth = 1.8;
    g.beginPath(); g.rect(m.x - 5, m.y + 14, 10, SUELO - m.y - 22); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(m.x, SUELO - 3, 44, 7, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(m.x - 3, m.y + 16, 2, SUELO - m.y - 26);
    g.strokeStyle = "#3a302c"; g.lineWidth = 2; g.beginPath(); g.ellipse(m.x, m.y + 74, 22, 4, 0, 0, Math.PI * 2); g.stroke();
    // tablero: canto y cara de arriba
    g.fillStyle = "#6b3f22"; g.strokeStyle = TINTA; g.lineWidth = 1.8;
    g.beginPath(); g.ellipse(m.x, m.y + 6, m.rx, m.ry, 0, 0, Math.PI); g.lineTo(m.x - m.rx, m.y); g.ellipse(m.x, m.y, m.rx, m.ry, 0, Math.PI, 0, true); g.closePath(); g.fill(); g.stroke();
    const gt = g.createLinearGradient(m.x - m.rx, 0, m.x + m.rx, 0); gt.addColorStop(0, "#a8703f"); gt.addColorStop(0.5, "#c8915a"); gt.addColorStop(1, "#9a6236");
    g.fillStyle = gt; g.beginPath(); g.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, Math.PI * 2); g.clip();
    g.strokeStyle = "rgba(90,48,20,0.35)"; g.lineWidth = 1;
    for (let i = -3; i <= 3; i++) { g.beginPath(); g.ellipse(m.x + i * 6, m.y + i * 1.5, m.rx * (0.3 + 0.1 * Math.abs(i)), m.ry * 0.5, 0.02 * i, 0, Math.PI * 2); g.stroke(); }
    g.fillStyle = "rgba(255,240,210,0.25)"; g.beginPath(); g.ellipse(m.x - 22, m.y - 3, 34, 3.5, 0, 0, Math.PI * 2); g.fill();
    g.restore();
    g.lineWidth = 1.8; g.strokeStyle = TINTA; g.beginPath(); g.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, Math.PI * 2); g.stroke();
  }
  // vapor de la cafetera
  function vaporCafetera(g, t) {
    g.save(); g.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.45 + i / 3) % 1, x = VAPOR_C.x + 3 * Math.sin(t * 2 + i), y = VAPOR_C.y + 6 - ph * 60;
      g.strokeStyle = `rgba(255,255,255,${0.55 * Math.sin(Math.PI * ph)})`; g.lineWidth = 3 + 4 * ph;
      g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x - 8, y - 8, x + 8, y - 14, x, y - 22); g.stroke();
    }
    // vapor de las tazas de la mesa
    for (const c of [TAZA_M, TAZA_G0]) for (let i = 0; i < 2; i++) {
      const ph = (t * 0.5 + i / 2 + c.x * 0.01) % 1, x = c.x - 3 + i * 6 + 2 * Math.sin(t * 3 + i), y = c.y - 26 - ph * 34;
      g.strokeStyle = `rgba(255,255,255,${0.45 * Math.sin(Math.PI * ph)})`; g.lineWidth = 1.6 + 1.5 * ph;
      g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x - 4, y - 5, x + 4, y - 9, x, y - 14); g.stroke();
    }
    g.restore();
  }

  /* =====================================================================================
   * CHORROS, SALPICONES Y EFECTOS
   * ===================================================================================== */
  function trazo(g, pts, w, col, borde) {
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    const ruta = () => { g.beginPath(); g.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y); };
    if (borde) { ruta(); g.strokeStyle = TINTA; g.lineWidth = w + borde; g.stroke(); }
    ruta(); g.strokeStyle = col; g.lineWidth = w; g.stroke();
    g.restore();
  }
  // chorro de leche de la jarrita a la taza
  function limitesChorro(t, mano) {
    const marta = mano === "M";
    return {
      cabeza: marta ? tramo(t, T.mVierte - 0.04, T.mVierte + 0.06) : tramo(t, T.gVierte, T.gVierte + 0.08),
      cola: marta ? tramo(t, T.mCorte - 0.06, T.mCorte + 0.04) : tramo(t, T.gPara - 0.04, T.gPara + 0.06)
    };
  }
  function chorroLeche(g, t, j, destino) {
    const { cabeza, cola } = limitesChorro(t, j.mano);
    if (cabeza <= cola) return;
    const a = enJarra(j, LABIO), b = destino, gordo = j.gordo || 0;
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const u = lerp(cola, cabeza, i / 12);
      const x = lerp(a.x, b.x, u) + j.f * (1 - u) * u * (5 + 6 * gordo) + gordo * 1.6 * Math.sin(t * 40 + u * 9) * Math.sin(Math.PI * u);
      pts.push({ x, y: lerp(a.y, b.y, u * u * 0.4 + u * 0.6) });
    }
    const w = lerp(2.4, 7.5, gordo) * (0.7 + 0.3 * j.flujo);
    trazo(g, pts, w, LECHE, 1.8);
    // salpicaduras en la taza (a lo bruto)
    if (gordo > 0.5 && cabeza === 1 && cola < 1) {
      g.save(); g.fillStyle = LECHE; g.strokeStyle = TINTA; g.lineWidth = 0.9;
      for (let i = 0; i < 6; i++) {
        const ph = (t * 3.2 + hash(i + 3)) % 1, an = -Math.PI / 2 + (hash(i + 7) - 0.5) * 2.4, v = 26 + 20 * hash(i + 9);
        const x = b.x + Math.cos(an) * v * ph, y = b.y - 2 + Math.sin(an) * v * ph + 70 * ph * ph, r = 1.6 + 1.2 * hash(i + 11);
        g.globalAlpha = 1 - ph; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.stroke();
      }
      g.restore();
    }
  }
  // charco de espuma en el platillo de Guillermo
  function charco(g, k) {
    if (k <= 0.01) return;
    const x = TAZA_G0.x, y = TAZA_G0.y + 1;
    g.save(); g.fillStyle = LECHE; g.strokeStyle = "rgba(150,120,90,0.8)"; g.lineWidth = 1;
    g.beginPath(); g.ellipse(x - 2, y + 0.5, 19 * k, 4 * k, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(x + 15 * k, y + 2, 6 * k, 2 * k, 0.2, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
  }

  // el derrame: de la taza inclinada a la zapatilla de Guillermo
  const viajeEspuma = T.plaf - T.derrama;
  let primerImpacto;
  function puntoZapato(pG) {
    const q = pG.piernas.lejos, a = q.ang || 0;
    const o = rot({ x: 52, y: -26 }, a);
    return G.aPantalla(pG, { x: q.tob.x + o.x, y: q.tob.y + o.y });
  }
  function impactoEspuma() {
    if (!primerImpacto) primerImpacto = puntoZapato(poseG(T.plaf));
    return primerImpacto;
  }
  function gotaEspuma(emision, t) {
    const u = clamp((t - emision) / viajeEspuma);
    const sale = enTaza(tazaEnManoG(emision), { x: 14.5, y: -20.5 }), impacto = impactoEspuma();
    const y = lerp(impacto.y, SUELO, tramo(emision + viajeEspuma, T.salto0, T.salto0 + 0.14));
    return { x: lerp(sale.x, impacto.x, u) + 1.2 * Math.sin(emision * 30) * Math.sin(Math.PI * u), y: lerp(sale.y, y, u * u) };
  }
  function derrame(g, t) {
    const primera = Math.max(T.derrama, t - viajeEspuma), ultima = Math.min(t, T.endereza);
    if (ultima <= primera) return;
    const pts = [];
    for (let i = 0; i <= 14; i++) pts.push(gotaEspuma(lerp(ultima, primera, i / 14), t));
    const sale = enTaza(tazaEnManoG(t), { x: 14.5, y: -20.5 });
    // lengua de espuma que asoma por el borde mientras se derrama
    const lengua = dentro(t, T.derrama, T.derrama + 0.05, T.endereza - 0.04, T.endereza + 0.02);
    if (lengua > 0.01) { g.save(); g.fillStyle = LECHE; g.strokeStyle = TINTA; g.lineWidth = 1.2;
      g.beginPath(); g.ellipse(sale.x + 1, sale.y + 2, 5 * lengua, 4.5 * lengua, 0.4, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore(); }
    trazo(g, pts, 5.2 * (1 - 0.3 * tramo(t, T.endereza, T.endereza + 0.12)), "#efe2cc", 1.8);
  }
  // ¡plaf! en la zapatilla, mancha que se queda y humo de lo caliente
  function plaf(g, t, pG) {
    const z = puntoZapato(pG), u = t - T.plaf;
    if (u > 0) {
      // mancha (se queda)
      const k = tramo(u, 0, 0.08);
      g.save(); g.translate(z.x, z.y); g.rotate((pG.piernas.lejos.ang || 0) * 1);
      g.fillStyle = "#d9b98d"; g.strokeStyle = "rgba(110,70,30,0.7)"; g.lineWidth = 0.9;
      g.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, r = (6 + 2.5 * hash(i + 31)) * k; g.lineTo(Math.cos(a) * r * 1.5, Math.sin(a) * r * 0.75); } g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#e9d6b6"; g.beginPath(); g.ellipse(-2, -1, 4 * k, 1.6 * k, 0, 0, Math.PI * 2); g.fill();
      // gotitas que bajan por la zapatilla
      g.fillStyle = "#d9b98d"; for (let i = 0; i < 3; i++) { const l = 3 + 4 * tramo(u, 0.05 + i * 0.1, 0.6 + i * 0.1); g.beginPath(); g.ellipse(-6 + i * 6, 3 + l * 0.5, 1.4, l * 0.5 + 1, 0, 0, Math.PI * 2); g.fill(); }
      g.restore();
    }
    // salpicón
    if (u > 0 && u < 0.4) {
      g.save(); g.fillStyle = "#efe2cc"; g.strokeStyle = TINTA; g.lineWidth = 1;
      for (let i = 0; i < 9; i++) { const origen = impactoEspuma(), a = -Math.PI * (0.1 + 0.8 * i / 8), v = 70 + 50 * hash(i + 50), x = origen.x + Math.cos(a) * v * u, y = origen.y + Math.sin(a) * v * u + 0.5 * 1600 * u * u;
        g.globalAlpha = 1 - fase(u, 0.25, 0.4); g.beginPath(); g.arc(x, y, 1.8 + hash(i) * 1.4, 0, Math.PI * 2); g.fill(); g.stroke(); }
      const kc = campana(u, 0, 0.2);
      if (kc > 0) { g.globalAlpha = kc; g.beginPath(); for (let i = 0; i < 12; i++) { const a = Math.PI + i / 11 * Math.PI, r = (i % 2 ? 6 : 13) * (0.6 + 0.4 * kc); g.lineTo(z.x + Math.cos(a) * r * 1.3, z.y + Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke(); }
      g.restore();
    }
    // humo de lo caliente
    const hk = dentro(t, T.plaf + 0.05, T.plaf + 0.2, T.gSerio + 0.6, T.gTiende0 + 0.4);
    if (hk > 0.01) {
      g.save(); g.lineCap = "round";
      for (let i = 0; i < 3; i++) { const ph = (t * 1.4 + i / 3) % 1, x = z.x - 6 + i * 6 + 3 * Math.sin(t * 6 + i), y = z.y - 6 - ph * 34;
        g.strokeStyle = `rgba(255,255,255,${0.8 * hk * Math.sin(Math.PI * ph)})`; g.lineWidth = 2 + 2 * ph;
        g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x - 5, y - 5, x + 5, y - 9, x, y - 14); g.stroke(); }
      g.restore();
    }
  }
  // ¡ay!: rayitas alrededor del pie levantado
  function rayitasPie(g, t, pG) {
    const sa = salto(t); if (sa.on < 0.05) return;
    const z = puntoZapato(pG);
    g.save(); g.strokeStyle = `rgba(255,248,235,${0.9 * sa.on})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = 0; i < 4; i++) { const a = -Math.PI * 0.15 - i * 0.42, r0 = 20 + 3 * Math.sin(t * 30 + i), r1 = r0 + 9;
      g.beginPath(); g.moveTo(z.x + Math.cos(a) * r0, z.y + Math.sin(a) * r0); g.lineTo(z.x + Math.cos(a) * r1, z.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  function estrella(g, x, y, r, col) {
    if (r <= 0.2) return;
    g.save(); g.translate(x, y); g.fillStyle = col; g.strokeStyle = TINTA; g.lineWidth = 1;
    g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.38 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill(); g.stroke(); g.restore();
  }
  // Guillermo radiante: chispitas alrededor de la cabeza
  function chispas(g, t, pG) {
    const k = dentro(t, T.gRadiante, T.gRadiante + 0.15, T.fin - 0.3, T.fin + 0.3); if (k <= 0.01) return;
    const c = G.aPantalla(pG, G.centroCabeza(pG));
    g.save();
    for (let i = 0; i < 6; i++) {
      const ph = ((t - T.gRadiante) * 0.9 + i / 6) % 1, a = -Math.PI * 0.95 + i / 5 * Math.PI * 1.1, d = 58 + 14 * ph;
      estrella(g, c.x + Math.cos(a) * d, c.y + Math.sin(a) * d * 0.9, (3.5 + 2 * hash(i)) * Math.sin(Math.PI * ph) * k, i % 2 ? "#ffe08a" : "#ffffff");
    }
    g.restore();
  }
  // el «oooh» de Guillermo: estrellitas en los ojos
  function ooh(g, t, pG) {
    const k = campana(t, T.gOoh, T.gOoh + 0.9); if (k <= 0.01) return;
    const c = G.aPantalla(pG, G.cabeza(pG).a({ x: 860, y: 520 }));
    g.save(); g.globalAlpha = k;
    for (let i = 0; i < 3; i++) { const ph = ((t - T.gOoh) * 1.2 + i / 3) % 1; estrella(g, c.x + 8 + i * 9, c.y - 26 - ph * 18, 3.4 * Math.sin(Math.PI * ph), "#ffe08a"); }
    g.restore();
  }
  // rayitas de alarma junto a Marta
  function alarmaM(g, t, pM) {
    const k = campana(t, T.mAlarma - 0.02, T.mAlarma + 0.5) + campana(t, T.derrama + 0.05, T.derrama + 0.45); if (k <= 0.01) return;
    const c = M.aPantalla(pM, M.centroCabeza(pM));
    g.save(); g.strokeStyle = `rgba(255,248,235,${0.9 * Math.min(1, k)})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const a = -Math.PI * 0.62 + i * 0.32, r0 = 58, r1 = 70; g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }

  /* =====================================================================================
   * EL GLOBO: la taza vista desde arriba
   * ===================================================================================== */
  const GLOBO = { x: 504, y: 128, r: 66 };
  // forma: mezcla de círculo (k=0) y corazón (k=1), radio rb, en θ
  function puntoForma(th, rb, k) {
    const cx = rb * Math.sin(th), cy = -rb * Math.cos(th);
    const s = rb / 16 * 1.12;
    const hx = 16 * Math.pow(Math.sin(th), 3) * s, hy = -(13 * Math.cos(th) - 5 * Math.cos(2 * th) - 2 * Math.cos(3 * th) - Math.cos(4 * th)) * s - 2.5 * s;
    return { x: lerp(cx, hx, k), y: lerp(cy, hy, k) };
  }
  function forma(g, rb, k, ox, oy, onda, t) {
    g.beginPath();
    for (let i = 0; i <= 64; i++) { const th = i / 64 * Math.PI * 2, p = puntoForma(th, rb * (1 + onda * 0.05 * Math.sin(5 * th + t * 9)), k);
      if (i) g.lineTo(ox + p.x, oy + p.y); else g.moveTo(ox + p.x, oy + p.y); }
    g.closePath();
  }
  // borrón de Guillermo: radio irregular
  function borron(g, rb, sem, ox, oy) {
    g.beginPath();
    for (let i = 0; i <= 64; i++) { const th = i / 64 * Math.PI * 2, r = rb * (1 + 0.22 * ruido(th * 1.9 + sem) + 0.12 * Math.sin(3 * th + sem) + 0.1 * Math.max(0, Math.sin(5 * th + 1.3 * sem)));
      const x = ox + Math.cos(th) * r, y = oy + Math.sin(th) * r; if (i) g.lineTo(x, y); else g.moveTo(x, y); }
    g.closePath();
  }
  /* e = { tipo: "corazon" | "borron" | "carita", ... } (unidades del globo, centro 0,0, radio R) */
  function vistaTaza(g, R, e, t) {
    const RL = R * 0.6;                                // superficie del café
    // mesa
    g.fillStyle = "#b07a46"; g.fillRect(-R, -R, 2 * R, 2 * R);
    g.strokeStyle = "rgba(100,55,25,0.35)"; g.lineWidth = 1.2;
    for (let i = -4; i <= 4; i++) { g.beginPath(); g.moveTo(-R, i * 15); g.bezierCurveTo(-R * 0.3, i * 15 + 6, R * 0.3, i * 15 - 6, R, i * 15 + 3); g.stroke(); }
    // platillo
    g.fillStyle = "rgba(60,30,10,0.25)"; g.beginPath(); g.arc(3, 4, R * 0.93, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fbf8f2"; g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, R * 0.93, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = "#d77a5c"; g.lineWidth = 1.6; g.beginPath(); g.arc(0, 0, R * 0.86, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "rgba(120,110,100,0.35)"; g.lineWidth = 1; g.beginPath(); g.arc(0, 0, R * 0.74, 0, Math.PI * 2); g.stroke();
    // asa (hacia su dueño)
    const sa = e.asa;
    g.fillStyle = "#fbf8f2"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.moveTo(sa * R * 0.64, -R * 0.09); g.lineTo(sa * R * 0.86, -R * 0.08); g.quadraticCurveTo(sa * R * 0.92, 0, sa * R * 0.86, R * 0.08); g.lineTo(sa * R * 0.64, R * 0.09); g.closePath(); g.fill(); g.stroke();
    // taza
    g.fillStyle = "#fbf8f2"; g.beginPath(); g.arc(0, 0, R * 0.68, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#e6dfd2"; g.beginPath(); g.arc(0, 0, R * 0.63, 0, Math.PI * 2); g.fill();
    // café con crema
    const gr = g.createRadialGradient(-RL * 0.2, -RL * 0.2, 2, 0, 0, RL); gr.addColorStop(0, "#c48545"); gr.addColorStop(0.75, "#9a5426"); gr.addColorStop(1, "#6a3414");
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, RL, 0, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.arc(0, 0, RL, 0, Math.PI * 2); g.clip();
    if (e.tipo === "corazon") {
      const rb = RL * 0.62 * salida(e.crece), k = suave(e.corta), oy = RL * 0.06;
      if (rb > 0.5) {
        // halo de crema más oscura y capas (de la meneada)
        g.fillStyle = "rgba(110,52,18,0.45)"; forma(g, rb * 1.1, k, 0, oy, e.onda, t); g.fill();
        g.fillStyle = LECHE; forma(g, rb, k, 0, oy, e.onda, t); g.fill();
        g.strokeStyle = "rgba(196,140,90,0.55)"; g.lineWidth = 1.4;
        for (const f of [0.74, 0.5]) { forma(g, rb * f, k, 0, oy + rb * (1 - f) * 0.25, e.onda, t); g.stroke(); }
        // el corte: una línea fina que atraviesa de arriba abajo
        if (e.corta > 0.01) {
          const y0 = oy - rb * 1.25, y1 = lerp(y0, oy + rb * 1.5, salida(e.corta));
          g.strokeStyle = LECHE; g.lineWidth = 2.4; g.beginPath(); g.moveTo(0, y0); g.lineTo(0, y1); g.stroke();
        }
      }
      // brillo
      if (e.brillo > 0.01) {
        g.fillStyle = `rgba(255,255,255,${0.35 * e.brillo})`; g.beginPath(); g.ellipse(-RL * 0.35, -RL * 0.4, RL * 0.25, RL * 0.1, -0.6, 0, Math.PI * 2); g.fill();
      }
    } else {
      // borrón de Guillermo (y luego la carita encima)
      const rb = RL * e.tam, sem = 2.3;
      g.fillStyle = "rgba(110,52,18,0.4)"; borron(g, rb * 1.06, sem, RL * 0.04, 0); g.fill();
      g.fillStyle = LECHE; borron(g, rb, sem, RL * 0.04, 0); g.fill();
      // grumos, pompas y regueros de crema: un borrón sin forma
      g.strokeStyle = "rgba(150,95,50,0.55)"; g.lineWidth = 2.2; g.lineCap = "round";
      for (let i = 0; i < 3; i++) { const a = hash(i + 24) * Math.PI * 2, d = rb * 0.45;
        g.beginPath(); g.moveTo(Math.cos(a) * d * 0.2, Math.sin(a) * d * 0.2); g.quadraticCurveTo(Math.cos(a + 0.9) * d, Math.sin(a + 0.9) * d, Math.cos(a + 0.3) * d * 1.3, Math.sin(a + 0.3) * d * 1.3); g.stroke(); }
      g.strokeStyle = "rgba(170,140,110,0.7)"; g.lineWidth = 1;
      if (e.tipo !== "carita") for (let i = 0; i < 7; i++) { const a = hash(i + 4) * Math.PI * 2, d = rb * 0.75 * hash(i + 6); g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d, 1.5 + 2.5 * hash(i + 8), 0, Math.PI * 2); g.stroke(); }
      if (e.tipo === "carita") carita(g, RL, e, t);
    }
    g.restore();
    // borde de la taza encima (si no rebosa)
    if (!e.desborde) { g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, R * 0.68, 0, Math.PI * 2); g.stroke(); }
    else {
      // espuma que cae por fuera sobre el platillo
      g.fillStyle = LECHE; g.strokeStyle = "rgba(150,120,90,0.8)"; g.lineWidth = 1.2;
      for (let i = 0; i < 6; i++) { const a = -0.4 + i * 1.1 + hash(i) * 0.4, d = R * (0.66 + 0.16 * e.desborde * hash(i + 2)), r = R * 0.08 * e.desborde * (0.6 + hash(i + 5));
        g.beginPath(); g.ellipse(Math.cos(a) * d, Math.sin(a) * d, r * 1.3, r, a, 0, Math.PI * 2); g.fill(); g.stroke(); }
    }
  }
  function carita(g, RL, e, t) {
    const COL = "#6e3814";
    const s = RL * 0.66;
    g.strokeStyle = COL; g.fillStyle = COL; g.lineCap = "round"; g.lineWidth = 3.6;
    const E1 = { x: -0.36 * s, y: -0.32 * s }, E2 = { x: 0.34 * s, y: -0.32 * s };
    if (e.ojo1 > 0) { g.beginPath(); g.ellipse(E1.x, E1.y, 3.4 * e.ojo1, 4.4 * e.ojo1, 0, 0, Math.PI * 2); g.fill(); }
    if (e.ojo2 > 0) { g.beginPath(); g.ellipse(E2.x, E2.y, 3.4 * e.ojo2, 4.4 * e.ojo2, 0, 0, Math.PI * 2); g.fill(); }
    if (e.boca > 0) {
      g.beginPath();
      for (let i = 0; i <= 20; i++) { const k = i / 20 * e.boca, a = lerp(0.18 * Math.PI, 0.82 * Math.PI, k), x = 0.5 * Math.cos(a) * -1 * s, y = (-0.05 + 0.42 * Math.sin(a)) * s;
        if (i) g.lineTo(x, y); else g.moveTo(x, y); }
      g.stroke();
      // mofletes de la carita
      if (e.boca > 0.98) { g.lineWidth = 1.6; for (const sx of [-1, 1]) { g.beginPath(); g.arc(sx * 0.55 * s, 0.12 * s, 3, 0, Math.PI * 2); g.stroke(); } }
    }
    // el palillo: entra desde el lado de Marta
    if (e.palillo) {
      const p = { x: e.palillo.u * s, y: e.palillo.v * s }, d = { x: 0.62, y: -0.78 };
      g.lineWidth = 4.2; g.strokeStyle = "#5d4426"; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x + d.x * 90, p.y + d.y * 90); g.stroke();
      g.lineWidth = 2.4; g.strokeStyle = "#e3c48f"; g.stroke();
      if (e.palillo.dibuja) { g.fillStyle = "rgba(123,66,25,0.6)"; g.beginPath(); g.arc(p.x, p.y, 2.2, 0, Math.PI * 2); g.fill(); }
    }
  }
  function tangentes(c, r, p) {
    const dx = p.x - c.x, dy = p.y - c.y, d = Math.hypot(dx, dy); if (d <= r) return null;
    const a = Math.atan2(dy, dx), b = Math.acos(r / d);
    return [{ x: c.x + r * Math.cos(a + b), y: c.y + r * Math.sin(a + b) }, { x: c.x + r * Math.cos(a - b), y: c.y + r * Math.sin(a - b) }];
  }
  function globo(g, t, ventana, taza, estado) {
    const [t0, t1] = ventana;
    const k = t < (t0 + t1) / 2 ? rebote(fase(t, t0, t0 + 0.32), 1.4) : 1 - entrada(fase(t, t1 - 0.22, t1));
    if (k <= 0.01 || t > t1) return;
    const C = { x: GLOBO.x, y: GLOBO.y }, R = GLOBO.r * k;
    const bL = { x: taza.x - 13 * Math.cos(taza.ang || 0), y: taza.y }, bR = { x: taza.x + 13 * Math.cos(taza.ang || 0), y: taza.y };
    // cono hasta la taza
    const cen = { x: lerp(taza.x, C.x, k), y: lerp(taza.y, C.y, k) };
    g.save();
    const tl = tangentes(cen, R, bL), tr = tangentes(cen, R, bR);
    if (tl && tr) {
      g.fillStyle = `rgba(255,250,238,${0.3 * k})`; g.strokeStyle = `rgba(255,250,238,${0.75 * k})`; g.lineWidth = 1.4;
      const p1 = tl[0].x < tl[1].x ? tl[0] : tl[1], p2 = tr[0].x > tr[1].x ? tr[0] : tr[1];
      g.beginPath(); g.moveTo(bL.x, bL.y); g.lineTo(p1.x, p1.y); g.lineTo(p2.x, p2.y); g.lineTo(bR.x, bR.y); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(bL.x, bL.y); g.lineTo(p1.x, p1.y); g.moveTo(bR.x, bR.y); g.lineTo(p2.x, p2.y); g.stroke();
    }
    // sombra y marco
    g.fillStyle = "rgba(40,15,5,0.3)"; g.beginPath(); g.arc(cen.x + 4, cen.y + 5, R + 4, 0, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.arc(cen.x, cen.y, R, 0, Math.PI * 2); g.clip();
    g.translate(cen.x, cen.y); g.scale(k, k);
    vistaTaza(g, GLOBO.r, estado, t);
    g.restore();
    g.lineWidth = 5; g.strokeStyle = "#fffaf0"; g.beginPath(); g.arc(cen.x, cen.y, R, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 2; g.strokeStyle = TINTA; g.beginPath(); g.arc(cen.x, cen.y, R + 2.5, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(cen.x, cen.y, Math.max(0, R - 2.5), 0, Math.PI * 2); g.lineWidth = 1.2; g.stroke();
    // reflejo de cristal
    g.strokeStyle = `rgba(255,255,255,${0.7 * k})`; g.lineWidth = 3; if (R > 12) { g.beginPath(); g.arc(cen.x, cen.y, R - 9, Math.PI * 1.08, Math.PI * 1.38); g.stroke(); }
    g.restore();
    // ¡ting! sobre el corazón
    if (estado.tipo === "corazon" && estado.brillo > 0.01) {
      const ph = fase(t, T.brillo, T.brillo + 0.6), r = 11 * Math.sin(Math.PI * ph);
      estrella(g, cen.x + 22, cen.y - 18, r, "#ffffff");
      estrella(g, cen.x - 26, cen.y + 6, r * 0.6, "#ffe08a");
    }
  }
  function estadoGloboA(t) {
    return { tipo: "corazon", asa: 1, crece: tramo(t, T.mVierte + 0.1, T.mMenea1, s => s), onda: dentro(t, T.mMenea0, T.mMenea0 + 0.2, T.mMenea1 - 0.2, T.mMenea1),
      corta: tramo(t, T.mCorta0, T.mCorta1, s => s), brillo: campana(t, T.brillo, T.brillo + 0.6) };
  }
  function estadoGloboB(t) {
    const crece = tramo(t, T.gVierte + 0.08, T.desborda + 0.25, salida);
    return { tipo: "borron", asa: -1, tam: lerp(0.15, 0.74, crece), desborde: tramo(t, T.desborda, T.gPara + 0.1) };
  }
  function estadoGloboC(t) {
    const tr = trazoCarita(t);
    return { tipo: "carita", asa: -1, tam: 0.74, ojo1: tramo(t, T.ojo1 + 0.04, T.ojo1 + 0.14), ojo2: tramo(t, T.ojo2 + 0.04, T.ojo2 + 0.14),
      boca: tramo(t, T.sonrisa0, T.sonrisa1), palillo: t < T.mRetira + 0.25 && t > T.gTiende - 0.05 ? { u: tr.u, v: tr.v, dibuja: tr.dibuja } : null };
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const a = dentro(t, GLOBO_A[0] - 0.2, GLOBO_A[0] + 0.4, GLOBO_A[1] - 0.2, GLOBO_A[1] + 0.3);
    const b = dentro(t, T.derrama - 0.3, T.plaf, T.salto1 - 0.1, T.gSerio + 0.5);
    const c = dentro(t, T.gRadiante - 0.3, T.gRadiante + 0.4, DUR, DUR + 1);
    const k = 1.1 + 0.03 * a + 0.03 * b + 0.04 * c;
    const x = 504 - 22 * b + 4 * c, y = 310 + 10 * b - 6 * c;
    return { k, x, y };
  }

  function poses(t) { return { g: poseG(t), m: poseM(t) }; }

  class ElCafeConArte extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !M.listo()) return;
      if (!fondo) fondo = creaFondo();
      const pM = poseM(t), pG = poseG(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      BASE_M = g.getTransform();
      g.drawImage(fondo, -60, -50);
      vaporCafetera(g, t);
      // en la mesa: jarrita (fila de atrás), platillos, tazas y palillero
      const j = jarra(t);
      if (!j.mano && !j.delante) dibJarra(g, j);
      platillo(g, TAZA_M.x, TAZA_M.y); platillo(g, TAZA_G0.x, TAZA_G0.y);
      if (j.delante) dibJarra(g, j);
      const cM = tazaM(t);
      dibTaza(g, cM);
      const eG = estadoTazaG(t);
      const cG = Object.assign({ x: TAZA_G0.x, y: TAZA_G0.y, ang: 0, asa: -1 }, eG);
      charco(g, eG.charco);
      if (t < T.gCogeTaza) dibTaza(g, cG);
      palillero(g, t < T.mPalillo);
      // personajes
      M.dibujar(g, pM, t);
      G.dibujar(g, pG, t);
      // chorros (y el frente de la taza encima, para que el chorro entre)
      if (j.mano === "M") { chorroLeche(g, t, j, { x: TAZA_M.x + (j.lab ? j.lab.x - TAZA_M.x - 3 : 0) * 0.8, y: TAZA_M.y + cM.nivel }); dibTaza(g, Object.assign({}, cM, { soloFrente: true })); }
      if (j.mano === "G") { chorroLeche(g, t, j, { x: TAZA_G0.x + 1, y: TAZA_G0.y + Math.max(-20, eG.nivel) }); if (t < T.gCogeTaza) dibTaza(g, Object.assign({}, cG, { soloFrente: true })); }
      derrame(g, t);
      plaf(g, t, pG);
      rayitasPie(g, t, pG);
      ooh(g, t, pG);
      alarmaM(g, t, pM);
      chispas(g, t, pG);
      // el globo
      const rimM = { x: TAZA_M.x, y: TAZA_M.y - 21, ang: 0 }, rimG = { x: TAZA_G0.x, y: TAZA_G0.y - 21, ang: 0 };
      if (t > GLOBO_A[0] && t < GLOBO_A[1]) globo(g, t, GLOBO_A, rimM, estadoGloboA(t));
      if (t > GLOBO_B[0] && t < GLOBO_B[1]) globo(g, t, GLOBO_B, rimG, estadoGloboB(t));
      if (t > GLOBO_C[0] && t < GLOBO_C[1] && pG.taza) { const c = pG.taza, r = enTaza(c, { x: 0, y: -21 }); globo(g, t, GLOBO_C, { x: r.x, y: r.y, ang: c.ang }, estadoGloboC(t)); }
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00091.2", nombre: "Guillermo y Marta · El café con arte", crear: () => new ElCafeConArte() });
  window.__A2D_00091_2 = { pose: poses, poseG, poseM, T, DUR, limitesChorro, puntoZapato, gotaEspuma, tazaEnManoG, enTaza, trazoCarita, puntaEspuma, PAL_L, SUELO };
})();
