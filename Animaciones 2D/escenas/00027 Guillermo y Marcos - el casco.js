"use strict";
/* 00027 · Guillermo y Marcos · El casco
 *
 * Negro → vestuario del parque de bomberos: taquillas rojas, pared de azulejos, banco y un perchero
 * de pared con un casco de repuesto colgado. Guillermo (izquierda) y Marcos (derecha, cara a cara) →
 * Guillermo mira el casco de Marcos embobado, lo señala y le pide uno poniendo ojitos → Marcos arquea
 * una ceja, descuelga el casco de repuesto y se lo lanza → Guillermo lo caza al vuelo: pesa tanto que
 * se le doblan las rodillas → lo admira, mira a cámara muy chulo y se lo echa a la cabeza de un
 * lanzamiento… le cae encima y se lo traga hasta los hombros → a ciegas, agita los brazos, se da la
 * vuelta y anda a tientas con los brazos por delante hasta darse de morros con las taquillas (¡clonc!,
 * abolladura y estrellitas) → se tambalea, se gira y llega dando traspiés hasta Marcos, que no puede
 * aguantar la risa → Marcos agarra el casco y tira: ¡plop! → Guillermo sale con el pelo aplastado
 * (pelo de casco), se lo toca preocupado… y ¡boing!, las púas vuelven a saltar → Marcos se parte de
 * risa; Guillermo se mete las manos en los bolsillos y guiña a cámara → negro.
 *
 * El casco de Marcos es parte de su cabeza (no se quita): el de repuesto es atrezo dibujado aquí con el
 * mismo estilo. Sin textos. Todo depende del tiempo absoluto.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, MB = MarcosBombero;
  const S = 0.30, SUELO = 560, DUR = 13.5;
  const TINTA = "#0b0a0e";
  const T = {
    mira: 0.5, apunta0: 0.95, apunta1: 1.25, pide0: 1.45, pide1: 1.95,
    mCeja: 1.35, mSonr: 1.7, mAlcanza0: 1.8, coge: 2.2, suelta: 2.85, atrapa: 3.15,
    admira: 3.45, chulo: 3.9, lanza: 4.3, encaja: 4.98,
    agita0: 5.05, agita1: 5.3, giro1a: 5.32, giro1b: 5.6,
    anda0: 5.7, anda1: 6.9, choque: 7.0,
    tambal0: 7.05, tambal1: 7.75, giro2a: 7.8, giro2b: 8.08,
    tropieza0: 8.12, tropieza1: 8.95,
    mBoca0: 5.55, mBoca1: 7.6, mAvanza0: 8.28, mAvanza1: 8.75, agarra: 8.88,
    tiron: 9.02, pop: 9.24, suelto: 9.36, dejaCae: 9.62, cae: 9.9,
    endereza1: 9.62, toca0: 9.78, toca1: 10.25, boing: 10.38,
    risa: 10.5, bolsillos: 11.15, guino: 11.75,
    fin: 12.75
  };

  /* ---------- posturas: manos respecto a su hombro (hoja de cada uno) ---------- */
  const P0 = { pel: 0, torso: 0, cab: 0, cx: 40, cy: 300, ca: 0, cmu: -1.75, cp: 0, lx: 0, ly: 280, la: 0, lmu: -1.75, lp: 0,
    c0: 0, c1: 0, c2: 0, c3: 0, c4: 0, l0: 0, l1: 0, l2: 0, l3: 0, l4: 0 };
  const C_ = o => Object.assign({}, P0, o);
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function guion(lista, tabla, t, base) {
    let c = tabla[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, tabla[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const ABC = { c0: 1, c1: 1, c2: 1, c3: 1, c4: 1 }, ABL = { l0: 1, l1: 1, l2: 1, l3: 1, l4: 1 };
  const AGC = { c0: 0.42, c1: 0.45, c2: 0.45, c3: 0.45, c4: 0.42 }, AGL = { l0: 0.42, l1: 0.45, l2: 0.45, l3: 0.45, l4: 0.42 };
  const INDL = { l0: 0.1, l1: 1, l2: 0, l3: 0, l4: 0 };
  const CUERPOS_G = {
    bolsillos: C_({}),
    mira: C_({ torso: -0.03, cab: -0.06 }),
    apunta: C_(Object.assign({ torso: -0.04, cab: -0.08, lx: 215, ly: -125, la: 0, lmu: -2.55, lp: 1 }, INDL)),
    pide: C_(Object.assign({ torso: 0.07, cab: 0.06, pel: 8, cx: 175, cy: 60, cmu: -2.2, cp: 1, lx: 70, ly: 70, lmu: -2.2, lp: 1 }, AGC, AGL)),
    espera: C_(Object.assign({ torso: 0.02, cab: 0, pel: 4, cx: 150, cy: 120, cmu: -2.0, cp: 1, lx: 80, ly: 110, lmu: -2.2, lp: 1 }, ABC, ABL)),
    atrapa: C_(Object.assign({ torso: 0.05, cab: 0.08, pel: 40 }, AGC, AGL, { cp: 1, lp: 1 })),
    sostiene: C_(Object.assign({ torso: 0.0, cab: 0.1, pel: 6 }, AGC, AGL, { cp: 1, lp: 1 })),
    chulo: C_(Object.assign({ torso: -0.04, cab: -0.05, pel: 2 }, AGC, AGL, { cp: 1, lp: 1 })),
    lanza: C_(Object.assign({ torso: -0.08, cab: -0.1, pel: -14, cx: 90, cy: -120, cmu: -1.4, cp: 1, lx: 40, ly: -130, lmu: -1.9, lp: 1 }, ABC, ABL)),
    encajado: C_(Object.assign({ torso: 0.04, cab: 0.04, pel: 34 }, ABC, ABL, { cp: 1, lp: 1 })),
    zombi: C_(Object.assign({ torso: 0.1, cab: 0.06, pel: 10, cx: 235, cy: 70, cmu: -2.95, ca: 0, cp: 1, lx: 175, ly: 55, lmu: -3.0, la: 0, lp: 1 }, ABC, ABL)),
    choque: C_(Object.assign({ torso: -0.22, cab: -0.2, pel: 16, cx: -40, cy: -110, cmu: -1.2, cp: 1, lx: 120, ly: -150, lmu: -1.9, lp: 1 }, ABC, ABL)),
    tambalea: C_(Object.assign({ torso: -0.12, cab: -0.1, pel: 22, cx: -90, cy: 110, cmu: -1.0, cp: 1, lx: 180, ly: 60, lmu: -2.6, lp: 1 }, ABC, ABL)),
    inclinado: C_(Object.assign({ torso: 0.95, cab: 1.0, pel: 80, cx: 60, cy: 230, cmu: -1.6, cp: 1, lx: 80, ly: 220, lmu: -1.7, lp: 1 },
      { c0: 0.55, c1: 0.7, c2: 0.65, c3: 0.6, c4: 0.55, l0: 0.55, l1: 0.7, l2: 0.65, l3: 0.6, l4: 0.55 })),
    pop: C_(Object.assign({ torso: -0.14, cab: -0.12, pel: 12, cx: -70, cy: 120, cmu: -1.1, cp: 1, lx: 170, ly: 90, lmu: -2.6, lp: 1 }, ABC, ABL)),
    aturdido: C_(Object.assign({ torso: -0.02, cab: 0.02, pel: 6, cx: 20, cy: 290, cmu: -1.6, cp: 1, lx: 40, ly: 280, lmu: -1.75, lp: 1 },
      { c0: 0.55, c1: 0.7, c2: 0.65, c3: 0.6, c4: 0.55, l0: 0.55, l1: 0.7, l2: 0.65, l3: 0.6, l4: 0.55 })),
    toca: C_(Object.assign({ torso: -0.03, cab: 0.05, pel: 6, cp: 1, cmu: -1.4, lx: 40, ly: 280, lmu: -1.75, lp: 1 }, ABC,
      { l0: 0.55, l1: 0.7, l2: 0.65, l3: 0.6, l4: 0.55 })),
    boing: C_(Object.assign({ torso: -0.06, cab: -0.08, pel: -10, cx: -60, cy: 160, cmu: -1.2, cp: 1, lx: 150, ly: 120, lmu: -2.5, lp: 1 }, ABC, ABL)),
    final: C_({ torso: -0.05, cab: -0.06 })
  };
  const GUION_G = [
    [T.mira, T.mira + 0.35, "mira"], [T.apunta0, T.apunta1, "apunta"], [T.pide0, T.pide0 + 0.3, "pide"],
    [T.suelta - 0.25, T.suelta, "espera"], [T.atrapa - 0.04, T.atrapa + 0.08, "atrapa", salida], [T.atrapa + 0.15, T.admira, "sostiene"],
    [T.chulo, T.chulo + 0.25, "chulo"], [T.lanza - 0.05, T.lanza + 0.2, "lanza"], [T.encaja - 0.02, T.encaja + 0.08, "encajado", salida],
    [T.giro1a, T.giro1b, "encajado"], [T.anda0 - 0.1, T.anda0 + 0.25, "zombi"], [T.choque - 0.01, T.choque + 0.07, "choque", salida],
    [T.tambal0 + 0.12, T.tambal0 + 0.4, "tambalea"], [T.tropieza0 + 0.2, T.tropieza1, "inclinado"],
    [T.pop - 0.01, T.pop + 0.1, "pop", salida], [T.endereza1 - 0.1, T.toca0, "aturdido"], [T.toca0, T.toca0 + 0.3, "toca"],
    [T.boing - 0.01, T.boing + 0.08, "boing", salida], [T.boing + 0.35, T.bolsillos, "aturdido"], [T.bolsillos, T.bolsillos + 0.45, "final"]
  ];
  // Marcos: mano lejana = la de delante (hacia Guillermo); la cercana cuelga (reposo)
  const CUERPOS_M = {
    base: C_({}),
    ceja: C_({ cab: -0.04 }),
    alcanza: C_({ torso: 0.22, cab: 0.06, pel: 6 }),
    lanza: C_({ torso: 0.08, cab: -0.02, pel: 4 }),
    contiene: C_({ torso: 0.06, cab: 0.08 }),
    mueca: C_({ torso: -0.06, cab: -0.1 }),
    tira: C_({ torso: 0.08, cab: 0.04, pel: 10 }),
    tiraAtras: C_({ torso: -0.18, cab: -0.12, pel: 16 }),
    mira: C_({ torso: 0.02, cab: 0.06 }),
    risa: C_({ torso: -0.12, cab: -0.24, pel: 6 }),
    fin: C_({ torso: -0.04, cab: -0.06 })
  };
  const GUION_M = [
    [T.mCeja, T.mCeja + 0.3, "ceja"], [T.mAlcanza0, T.coge, "alcanza"], [T.coge + 0.25, T.suelta, "lanza"], [T.suelta + 0.15, T.suelta + 0.6, "base"],
    [T.mBoca0, T.mBoca0 + 0.3, "contiene"], [T.choque, T.choque + 0.1, "mueca", salida], [T.choque + 0.5, T.mBoca1, "contiene"],
    [T.mAvanza0, T.agarra, "tira"], [T.tiron + 0.05, T.pop, "tiraAtras"], [T.pop + 0.1, T.endereza1, "mira"],
    [T.risa - 0.05, T.risa + 0.25, "risa"], [T.fin - 0.6, T.fin, "fin"]
  ];

  /* ---------- caras ---------- */
  const BASEC = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, mof: 0 };
  const E = o => Object.assign({}, BASEC, o);
  const CARAS_G = {
    inicio: E({}),
    mira: E({ mx: 0.9, my: -0.75, iris: 1.12, sd: 18, gd: 0.08, si: 18, gi: 0.08, orig: 0, abre: 18, ancho: 0.55, sonr: 0.2, lengua: 0.2 }),
    pide: E({ mx: 0.85, my: -0.45, iris: 1.22, sd: 24, gd: -0.18, si: 24, gi: -0.18, orig: 0, abre: 0, ancho: 0.7, sonr: 0.35 }),
    espera: E({ mx: 0.9, my: -0.3, iris: 1.15, sd: 22, gd: 0.05, si: 22, gi: 0.05, orig: 0, abre: 22, ancho: 0.7, sonr: 0.5 }),
    oof: E({ mx: 0.6, my: 0.5, c: 0.3, z: 0.5, sd: 10, gd: 0.15, si: 10, gi: 0.15, orig: 0, abre: 6, ancho: 0.5, sonr: -0.4, mof: 0.85, dientes: 0 }),
    admira: E({ mx: 0.85, my: 0.55, iris: 1.2, sd: 20, gd: 0.1, si: 20, gi: 0.1, orig: 0, abre: 30, ancho: 0.95, sonr: 0.95, lengua: 0.3 }),
    chulo: E({ mx: -0.85, my: -0.2, ci: 0.15, sd: 16, gd: 0.15, si: -2, gi: -0.05, orig: 0, sonr: 0.8, ancho: 1 }),
    lanza: E({ mx: 0.4, my: -0.9, iris: 1.1, sd: 22, gd: 0.1, si: 22, gi: 0.1, orig: 0, abre: 26, ancho: 0.9, sonr: 0.9 }),
    aturdido: E({ mx: 0, my: 0.1, c: 0.45, sd: 6, gd: 0.15, si: -4, gi: -0.1, orig: 0, abre: 8, ancho: 0.7, sonr: -0.2 }),
    toca: E({ mx: -0.5, my: -0.8, iris: 1.12, sd: 24, gd: -0.2, si: 24, gi: -0.2, orig: 0, abre: 12, ancho: 0.6, sonr: -0.45 }),
    boing: E({ mx: 0, my: -0.6, iris: 1.25, sd: 30, gd: 0.2, si: 30, gi: 0.2, orig: 0, abre: 36, ancho: 0.62, sonr: -0.1, lengua: 0.2 }),
    alivio: E({ mx: -0.85, my: -0.15, sd: 14, gd: 0.1, si: 14, gi: 0.1, orig: 0, abre: 10, ancho: 0.95, sonr: 0.85 }),
    guino: E({ mx: -0.85, my: -0.2, ci: 1, h: 1, sd: 16, gd: 0.15, si: 4, gi: 0.05, orig: 0, sonr: 0.9, ancho: 1, abre: 4 })
  };
  const GUION_CARA_G = [
    [T.mira, T.mira + 0.3, "mira"], [T.pide0, T.pide0 + 0.25, "pide"], [T.suelta - 0.2, T.suelta, "espera"],
    [T.atrapa - 0.02, T.atrapa + 0.08, "oof"], [T.atrapa + 0.35, T.admira, "admira"], [T.chulo, T.chulo + 0.2, "chulo"],
    [T.lanza - 0.1, T.lanza + 0.1, "lanza"], [T.pop + 0.04, T.pop + 0.2, "aturdido"], [T.toca0, T.toca0 + 0.25, "toca"],
    [T.boing - 0.02, T.boing + 0.06, "boing"], [T.boing + 0.4, T.boing + 0.7, "alivio"], [T.guino - 0.05, T.guino + 0.2, "guino"]
  ];
  const CARAS_M = {
    inicio: E({ mx: -0.6, my: 0.1, orig: 1 }),
    ceja: E({ mx: -0.85, my: 0.05, sd: 18, gd: 0.15, si: 0, gi: -0.05, orig: 0, sonr: 0.45, ancho: 0.9 }),
    alcanza: E({ mx: -0.8, my: -0.6, sd: 6, gd: 0.05, si: 6, gi: 0.05, orig: 0, sonr: 0.35, ancho: 0.85 }),
    lanza: E({ mx: -0.9, my: 0.15, ci: 0.15, sd: 14, gd: 0.1, si: 6, gi: 0.05, orig: 0, sonr: 0.7, ancho: 0.95, abre: 6 }),
    sorpresa: E({ mx: -0.85, my: -0.3, iris: 1.12, sd: 22, gd: 0.1, si: 22, gi: 0.1, orig: 0, abre: 22, ancho: 0.6, sonr: 0.1 }),
    contiene: E({ mx: -0.85, my: 0.05, c: 0.55, h: 1, sd: 12, gd: 0.15, si: 12, gi: 0.15, orig: 0, abre: 0, ancho: 0.7, sonr: 0.4, mof: 0.7, dientes: 0 }),
    mueca: E({ mx: -0.85, my: 0, c: 0.85, z: 1, sd: 6, gd: 0.2, si: 6, gi: 0.2, orig: 0, abre: 14, ancho: 1.1, sonr: -0.5 }),
    tira: E({ mx: -0.9, my: 0.2, c: 0.3, z: 0.4, sd: -8, gd: -0.2, si: -8, gi: -0.2, orig: 0, abre: 10, ancho: 1.05, sonr: -0.35 }),
    mira: E({ mx: -0.9, my: -0.25, iris: 1.12, sd: 22, gd: 0.1, si: 22, gi: 0.1, orig: 0, abre: 0, ancho: 0.7, sonr: 0.3, mof: 0.8, dientes: 0 }),
    risa: E({ mx: 0, my: -0.3, c: 1, h: 1, sd: 18, gd: 0.15, si: 18, gi: 0.15, orig: 0, abre: 46, ancho: 1.15, sonr: 1, lengua: 0.6 }),
    fin: E({ mx: -0.85, my: 0, c: 0.4, h: 1, sd: 14, gd: 0.12, si: 14, gi: 0.12, orig: 0, abre: 14, ancho: 1.05, sonr: 0.9 })
  };
  const GUION_CARA_M = [
    [T.mCeja, T.mCeja + 0.25, "ceja"], [T.mAlcanza0, T.mAlcanza0 + 0.25, "alcanza"], [T.coge + 0.2, T.coge + 0.4, "lanza"],
    [T.encaja - 0.05, T.encaja + 0.15, "sorpresa"], [T.mBoca0, T.mBoca0 + 0.25, "contiene"], [T.choque, T.choque + 0.06, "mueca"],
    [T.choque + 0.5, T.choque + 0.8, "contiene"], [T.agarra - 0.2, T.agarra, "tira"], [T.pop + 0.08, T.pop + 0.3, "mira"],
    [T.risa - 0.04, T.risa + 0.12, "risa"], [T.fin - 0.6, T.fin, "fin"]
  ];
  function parpadeos(lista, t) {
    let o = 0;
    for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); }
    return o;
  }
  const PARP_G = [1.15, 2.45, 3.75, 9.5, 9.72, 11.0, 12.4], PARP_M = [0.75, 2.6, 3.9, 4.6, 8.1, 9.9, 12.2];
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: 0,
      ojos: { d: Math.max(e.c, e.cd, parp), i: Math.max(e.c, e.ci, parp), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  // giro de la muñeca hacia el hombro (el antebrazo apunta a la mano), mezclado con el de la postura
  const angCorto = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
  const muHacia = (sh, m, base, k) => angCorto(base, Math.atan2(sh.y - m.y, sh.x - m.x), k);
  const dedos = (b, ch) => ({ pulgar: b[ch + "0"], indice: b[ch + "1"], medio: b[ch + "2"], anular: b[ch + "3"], menique: b[ch + "4"] });
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, 0, -1.75), l: punoDesde({ x: 372, y: 648 }, 0, -1.75) };

  /* ---------- pasos (x de pantalla de cada pie; izq = el de la izquierda de la pantalla) ---------- */
  // [t0, t1, x, alto del paso]
  const PASOS_G = {
    izq: [[-10, -9, 301, 0], [T.anda0 + 0.3, T.anda0 + 0.6, 255, 26], [T.anda0 + 0.9, T.anda1 + 0.02, 210, 26],
          [T.tambal0 + 0.33, T.tambal0 + 0.6, 250, 34], [T.tropieza0 + 0.03, T.tropieza0 + 0.26, 310, 40], [T.tropieza0 + 0.52, T.tropieza0 + 0.72, 331, 24]],
    der: [[-10, -9, 338, 0], [T.anda0, T.anda0 + 0.3, 280, 26], [T.anda0 + 0.6, T.anda0 + 0.9, 247, 26],
          [T.tambal0 + 0.05, T.tambal0 + 0.33, 287, 34], [T.tropieza0 + 0.26, T.tropieza0 + 0.52, 368, 40],
          [T.pop + 0.06, T.pop + 0.3, 356, 26]]
  };
  function pie(L, t) {
    let i = 0; while (i + 1 < L.length && t >= L[i + 1][0]) i++;
    const [t0, t1, x, alto] = L[i], xa = i > 0 ? L[i - 1][2] : x, u = fase(t, t0, t1);
    const arco = Math.sin(Math.PI * u);
    return { x: lerp(xa, x, suave5(u)), lev: alto * arco };
  }
  // pelvis: entre los pies, con la inclinación de cada momento
  const XPEL = [[-10, 320], [T.anda0 - 0.05, 320], [T.anda1 + 0.1, 228], [T.choque, 228], [T.choque + 0.12, 238], [T.tambal1, 268],
    [T.tropieza0, 268], [T.tropieza1 - 0.1, 350], [T.pop + 0.02, 350], [T.endereza1, 340], [DUR + 1, 340]];
  function xPelvis(t) {
    let i = 0; while (i + 1 < XPEL.length && t >= XPEL[i + 1][0]) i++;
    const [t0, x0] = XPEL[i], [t1, x1] = XPEL[Math.min(i + 1, XPEL.length - 1)];
    return t1 > t0 ? lerp(x0, x1, suave(fase(t, t0, t1))) : x0;
  }
  // hacia dónde mira y aplastado del giro (se da la vuelta pasando por perfil)
  function giroG(t) {
    const g1 = fase(t, T.giro1a, T.giro1b), g2 = fase(t, T.giro2a, T.giro2b);
    let dir = 1, sx = 1;
    if (t >= T.giro1a && t < T.giro2a) { dir = g1 < 0.5 ? 1 : -1; sx = Math.max(0.03, Math.abs(Math.cos(Math.PI * suave(g1)))); }
    else if (t >= T.giro2a) { dir = g2 < 0.5 ? -1 : 1; sx = Math.max(0.03, Math.abs(Math.cos(Math.PI * suave(g2)))); }
    return { dir, sx };
  }

  /* ---------- el casco de repuesto ---------- */
  // Coordenadas propias: origen en el centro del borde inferior, +x hacia la visera, arriba = −y; px de pantalla.
  const KX = 0.85, KY = 0.8;                                           // escala del dibujo (≈1,4 veces el casco de Marcos)
  const CASCO = { atras: -88, delante: 93, alto: 142, agarre: { x: 30, y: -142 } };
  const PERCHA = { x: 520, y: 166 };                                   // gancho de la pared
  const COLG = { x: PERCHA.x, y: PERCHA.y + 150 };                     // borde del casco colgado
  const RIM_CABEZA = { x: 745, y: 872 }, ARRIBA_CABEZA = { x: 760, y: 400 };   // retrato de Guillermo
  const HOLD = { x: 250 + 58 / S, y: 1344 + (384 - 560) / S };       // hoja de Guillermo (casco en las manos)
  const enMundo = (c, q) => { const k = Math.cos(c.ang), s = Math.sin(c.ang), x = q.x * KX * c.dir * c.sc, y = q.y * KY * c.sc; return { x: c.x + x * k - y * s, y: c.y + x * s + y * k }; };
  // casco encajado: sigue la cabeza (que no se le salga ni una púa)
  function puestoEn(pg) {
    const H = G.cabeza(pg), a = G.aPantalla(pg, H.a(RIM_CABEZA)), b = G.aPantalla(pg, H.a(ARRIBA_CABEZA));
    const ux = b.x - a.x, uy = b.y - a.y;
    return { x: a.x, y: a.y, ang: Math.atan2(ux, -uy), dir: pg.espejo ? -1 : 1, sc: 1 };
  }
  const enManosG = pg => { const q = G.aPantalla(pg, G.tronco(pg)(HOLD)); return { x: q.x, y: q.y, ang: -0.1 + 0.8 * (pg.torso || 0), dir: 1, sc: 1 }; };
  // mano lejana de Marcos mientras lleva el casco (pantalla, agarrado por arriba)
  const MANO_M = [[T.coge, COLG.x + 30 * KX, COLG.y - 142 * KY], [T.coge + 0.18, 580, 190], [T.coge + 0.42, 630, 236], [T.suelta, 574, 194]];
  function manoMarcos(t) {
    let i = 0; while (i + 1 < MANO_M.length && t >= MANO_M[i + 1][0]) i++;
    const [t0, x0, y0] = MANO_M[i], [t1, x1, y1] = MANO_M[Math.min(i + 1, MANO_M.length - 1)];
    const k = t1 > t0 ? suave(fase(t, t0, t1)) : 0;
    return { x: lerp(x0, x1, k), y: lerp(y0, y1, k) };
  }
  const angLlevado = t => 0.05 * Math.sin((t - T.coge) * 9) * (1 - tramo(t, T.coge, T.coge + 0.3)) + 0.28 * campana(t, T.coge + 0.15, T.coge + 0.55) - 0.32 * tramo(t, T.coge + 0.5, T.suelta);
  const colgadoDe = (m, ang) => { const c = { x: 0, y: 0, ang, dir: 1, sc: 1 }; const g0 = enMundo(c, CASCO.agarre); return { x: m.x - g0.x, y: m.y - g0.y, ang, dir: 1, sc: 1 }; };
  // estado del casco en cada instante: dónde está y en qué capa se dibuja
  const cacheC = new Map();
  function casco(t) {
    const key = Math.round(t * 1e5); if (cacheC.has(key)) return cacheC.get(key);
    if (cacheC.size > 300) cacheC.clear();
    let c;
    if (t < T.coge) {
      const sway = 0.03 * Math.sin(t * 2.1) * (1 - tramo(t, T.coge - 0.3, T.coge));
      c = { x: COLG.x + 40 * Math.sin(sway), y: COLG.y, ang: sway, dir: 1, sc: 1, capa: "percha" };
    } else if (t < T.suelta) {
      c = Object.assign(colgadoDe(manoMarcos(t), angLlevado(t)), { capa: "marcos" });
    } else if (t < T.atrapa) {
      const a = colgadoDe(manoMarcos(T.suelta), angLlevado(T.suelta)), b = enManosG(poseG(T.atrapa));
      const u = fase(t, T.suelta, T.atrapa);
      c = { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) - 70 * 4 * u * (1 - u), ang: lerp(a.ang, b.ang, u) - 0.5 * Math.sin(Math.PI * u), dir: 1, sc: 1,
        capa: u < 0.3 ? "marcos" : u < 0.7 ? "vuelo" : "guillermo" };
    } else if (t < T.lanza) {
      c = Object.assign(enManosG(poseG(t)), { capa: "guillermo" });
    } else if (t < T.encaja) {
      const a = enManosG(poseG(T.lanza)), b = puestoEn(poseG(T.encaja)), u = fase(t, T.lanza, T.encaja);
      const ap = b.y - 170;
      const y = u < 0.5 ? lerp(a.y, ap, suave(u / 0.5)) : lerp(ap, b.y, entrada((u - 0.5) / 0.5));
      c = { x: lerp(a.x, b.x, suave(u)), y, ang: lerp(a.ang, b.ang, suave(u)) - 0.35 * Math.sin(Math.PI * u), dir: 1, sc: 1, capa: "guillermo" };
    } else if (t < T.tiron) {
      const pg = poseG(t); c = Object.assign(puestoEn(pg), { capa: "guillermo" });
      // aterriza, rebota hacia abajo y bambolea
      const u = t - T.encaja, rebote = -10 * Math.exp(-u * 10) * Math.abs(Math.sin(u * 30));   // rebota hacia arriba sobre la cabeza
      const bam = 0.06 * Math.exp(-u * 4) * Math.sin(u * 17) + 0.05 * Math.exp(-(t - T.choque) * 5) * Math.sin((t - T.choque) * 24) * (t > T.choque ? 1 : 0);
      c.x -= Math.sin(c.ang) * rebote; c.y += Math.cos(c.ang) * rebote; c.ang += bam;
    } else if (t < T.suelto) {
      // Marcos tira: se resiste un poco y sale de golpe a lo largo de su eje
      // mientras resiste sigue la cabeza; al salir se queda con la postura de ese momento
      const pg = poseG(Math.min(t, T.pop - 0.04)); c = Object.assign(puestoEn(pg), { capa: "marcos" });
      const resiste = 4 * Math.sin((t - T.tiron) * 70) * (1 - tramo(t, T.pop - 0.05, T.pop));
      const d = resiste + 72 * salida(fase(t, T.pop - 0.04, T.suelto));
      c.x += Math.sin(c.ang) * d; c.y -= Math.cos(c.ang) * d;
    } else if (t < T.dejaCae) {
      // colgando de la mano de Marcos (péndulo hacia derecho)
      const c0 = casco(T.suelto - 1e-4), u = t - T.suelto;
      const ang = c0.ang * Math.exp(-u * 4) * Math.cos(u * 9);
      c = Object.assign(colgadoDe(manoSostiene(t), ang), { capa: "marcos" });
    } else if (t < T.cae) {
      // lo suelta: cae al suelo, entre los dos
      const a = casco(T.dejaCae - 1e-4), u = fase(t, T.dejaCae, T.cae);
      c = { x: lerp(a.x, SUELTO.x, u), y: lerp(a.y, SUELTO.y, entrada(u)), ang: a.ang * (1 - u) - 0.25 * Math.sin(Math.PI * u), dir: 1, sc: 1, capa: "marcos" };
    } else {
      // rebota en el borde y se balancea hasta pararse
      const u = t - T.cae, ang = 0.2 * Math.exp(-u * 3.2) * Math.sin(u * 13) - 0.06 * Math.exp(-u * 9);
      const bote = 10 * Math.exp(-u * 9) * Math.abs(Math.sin(u * 16));
      c = { x: SUELTO.x + 28 * Math.sin(ang), y: SUELTO.y - bote - Math.abs(ang) * 14, ang, dir: 1, sc: 1, capa: "marcos" };
    }
    cacheC.set(key, c);
    return c;
  }
  // tras el tirón Marcos lo sostiene un momento en alto, mirándolo, antes de soltarlo
  const SUELTO = { x: 548, y: SUELO - 2 };
  function manoSostiene(t) {
    const g0 = enMundo(casco(T.suelto - 1e-4), CASCO.agarre), u = suave(fase(t, T.suelto, T.dejaCae - 0.05));
    return { x: lerp(g0.x, 590, u), y: lerp(g0.y, 212, u) };
  }

  function dibCasco(g, c, t, puesto) {
    g.save(); g.translate(c.x, c.y); g.rotate(c.ang); g.scale(c.dir * c.sc, c.sc); g.scale(KX, KY);
    g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = TINTA;
    // cogotera (detrás)
    g.beginPath(); g.moveTo(-84, -14); g.quadraticCurveTo(-98, 20, -86, 50); g.quadraticCurveTo(-52, 60, -22, 40); g.lineTo(-18, 2); g.closePath();
    g.fillStyle = "#1d1d25"; g.fill(); g.lineWidth = 3.4; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.12)"; g.lineWidth = 2; g.beginPath(); g.moveTo(-70, 6); g.quadraticCurveTo(-74, 28, -64, 44); g.stroke();
    // barboquejo colgando (si no está puesto)
    if (!puesto) {
      g.strokeStyle = TINTA; g.lineWidth = 6; g.beginPath(); g.moveTo(-30, -40); g.bezierCurveTo(-26, 34, 46, 40, 54, -14); g.stroke();
      g.strokeStyle = "#2a2a31"; g.lineWidth = 3; g.stroke();
      g.fillStyle = "#9aa0a8"; g.beginPath(); g.roundRect ? g.roundRect(4, 22, 14, 8, 2) : g.rect(4, 22, 14, 8); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke();
    }
    // casquete amarillo
    const casq = () => { g.beginPath(); g.moveTo(-88, 0); g.bezierCurveTo(-98, -80, -58, -142, 4, -142); g.bezierCurveTo(64, -142, 98, -94, 93, -18);
      g.lineTo(91, 2); g.quadraticCurveTo(0, 14, -88, 0); g.closePath(); };
    casq(); g.fillStyle = "#f6ec1e"; g.fill();
    g.save(); casq(); g.clip();
    g.fillStyle = "#d7c80d"; g.beginPath(); g.ellipse(-46, -6, 74, 46, 0.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#c4b40a"; g.beginPath(); g.ellipse(-70, 6, 40, 26, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(255,253,200,0.95)"; g.lineWidth = 13; g.beginPath(); g.moveTo(-56, -104); g.quadraticCurveTo(-18, -134, 38, -128); g.stroke();
    g.lineWidth = 5; g.beginPath(); g.moveTo(-74, -62); g.quadraticCurveTo(-72, -86, -60, -100); g.stroke();
    // pantalla (visera transparente recogida) en la parte de delante
    g.fillStyle = "rgba(140,165,178,0.55)"; g.beginPath(); g.moveTo(-6, -146); g.bezierCurveTo(56, -146, 100, -100, 98, -22);
    g.lineTo(76, -24); g.bezierCurveTo(78, -86, 44, -118, -6, -120); g.closePath(); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.75)"; g.lineWidth = 4; g.beginPath(); g.moveTo(24, -126); g.quadraticCurveTo(62, -112, 78, -70); g.stroke();
    g.strokeStyle = "rgba(40,50,60,0.65)"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-6, -120); g.bezierCurveTo(44, -118, 78, -86, 76, -24); g.stroke();
    g.restore();
    casq(); g.lineWidth = 4.2; g.strokeStyle = TINTA; g.stroke();
    // ribete negro del borde
    g.beginPath(); g.moveTo(-88, 0); g.quadraticCurveTo(0, 14, 91, 2); g.lineWidth = 7; g.stroke();
    // soporte de linterna arriba y pinza lateral con su tornillo
    g.save(); g.translate(30, -144); g.rotate(0.32);
    g.fillStyle = "#1b1a20"; g.beginPath(); g.roundRect ? g.roundRect(-20, -12, 40, 22, 4) : g.rect(-20, -12, 40, 22); g.fill(); g.lineWidth = 2.5; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(-15, -8, 24, 3); g.restore();
    g.save(); g.translate(-40, -70); g.rotate(-0.22);
    g.fillStyle = "#1b1a20"; g.beginPath(); g.roundRect ? g.roundRect(-17, -14, 34, 28, 5) : g.rect(-17, -14, 34, 28); g.fill(); g.lineWidth = 2.5; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.22)"; g.fillRect(-12, -9, 18, 3); g.restore();
    g.fillStyle = "#1b1a20"; g.beginPath(); g.arc(-12, -34, 8, 0, Math.PI * 2); g.fill(); g.lineWidth = 2; g.stroke();
    g.fillStyle = "#7d828a"; g.beginPath(); g.arc(-12, -34, 3, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // tiras del barboquejo hasta el gancho (colgado en la pared)
  function tirasPercha(g, c) {
    const a = enMundo(c, { x: -30, y: -40 }), b = enMundo(c, { x: 54, y: -14 });
    g.save(); g.lineCap = "round"; g.strokeStyle = TINTA; g.lineWidth = 6;
    for (const q of [a, b]) { g.beginPath(); g.moveTo(q.x, q.y); g.quadraticCurveTo((q.x + PERCHA.x) / 2, (q.y + PERCHA.y) / 2 + 8, PERCHA.x, PERCHA.y + 6); g.stroke(); }
    g.strokeStyle = "#2a2a31"; g.lineWidth = 3;
    for (const q of [a, b]) { g.beginPath(); g.moveTo(q.x, q.y); g.quadraticCurveTo((q.x + PERCHA.x) / 2, (q.y + PERCHA.y) / 2 + 8, PERCHA.x, PERCHA.y + 6); g.stroke(); }
    g.restore();
  }

  /* ---------- pelo de casco (aplastado) y su ¡boing! ---------- */
  // Igual que el pelo mojado de la 00021: se repinta el fondo fuera del casquete, la piel y la frente,
  // y encima va el pelo pegado a la forma del casco. Al soltarse, el casquete crece y las púas reaparecen.
  const PIEL = [956,503,938,501,918,520,896,531,895,526,907,504,907,491,894,491,867,505,845,509,873,470,873,457,854,448,853,442,830,439,824,431,801,432,799,438,779,437,729,464,736,428,723,428,679,454,676,477,649,496,635,536,629,543,624,542,619,526,589,500,572,499,556,507,544,522,531,568,530,593,539,614,572,657,572,664,527,801,521,812,492,833,492,853,738,853,738,847,704,811,705,806,741,830,769,840,767,853,801,853,802,845,812,843,822,835,907,719,932,645,954,612,954,594,892,588,891,583,896,578,941,581,947,587,960,586,964,518,957,516];
  const CUP = [[536,610],[522,540],[524,470],[542,410],[574,360],[625,316],[694,286],[775,270],[860,272],[940,294],[1006,332],[1050,382],[1068,440],[1062,500]];
  const FLEQUILLO = [[1062,500],[1040,540],[1012,520],[990,556],[962,522],[930,552],[904,516],[872,540],[846,500],[812,520],[786,482],[744,490],[704,470],[668,492],[650,530],[636,572],[620,530],[598,505],[574,502],[556,520],[546,560]];
  const FRENTE = [[640,482],[720,452],[830,452],[930,470],[985,500],[1000,570],[960,615],[640,600]];
  const CAJA = [[200,20],[1400,20],[1400,690],[200,690]];
  const CENTRO_C = { x: 800, y: 470 };
  let MATRIZ = null, fondo = null, taquillas = null;
  function ruta(g, pts) { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); }
  function rutaPiel(g) { g.moveTo(PIEL[0], PIEL[1]); for (let i = 2; i < PIEL.length; i += 2) g.lineTo(PIEL[i], PIEL[i + 1]); g.closePath(); }
  function casquete(k) {
    const e = lerp(1.65, 1, k);
    return CUP.map(([x, y]) => ({ x: CENTRO_C.x + (x - CENTRO_C.x) * e, y: CENTRO_C.y + (y - CENTRO_C.y) * e })).concat(FLEQUILLO.map(([x, y]) => ({ x, y })));
  }
  // cuánto pelo aplastado queda: 1 al quitarle el casco, 0 tras el boing
  const aplastado = t => t < T.boing ? suave(fase(t, T.encaja - 0.07, T.encaja + 0.02)) : 1 - salida(fase(t, T.boing, T.boing + 0.09));
  function peloAplastado(g, t, k, sx) {
    if (MATRIZ && fondo) {
      const cas = casquete(k);
      g.save();
      g.beginPath(); ruta(g, CAJA); M2.curva(g, cas, true, 0.35); g.clip("evenodd");
      g.beginPath(); ruta(g, CAJA); rutaPiel(g); g.clip("evenodd");
      g.beginPath(); ruta(g, CAJA); ruta(g, FRENTE); g.clip("evenodd");
      g.setTransform(MATRIZ); g.drawImage(fondo, -40, -60); dibTaquillas(g, t);      // lo que hay detrás de la cabeza
      g.restore();
    }
    const cas = casquete(1), cam = () => { g.beginPath(); M2.curva(g, cas, true, 0.35); };
    g.save(); g.globalAlpha = clamp(k * 1.2); g.lineJoin = "round"; g.lineCap = "round";
    cam(); g.fillStyle = "#874621"; g.fill();
    g.save(); cam(); g.clip();
    g.fillStyle = "#5e2f15"; g.beginPath(); g.ellipse(590, 480, 100, 190, -0.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#9a5428"; g.beginPath(); g.ellipse(860, 350, 180, 70, 0.12, 0, Math.PI * 2); g.fill();
    // surco que ha dejado el borde del casco
    g.strokeStyle = "rgba(60,25,8,0.75)"; g.lineWidth = 9; g.beginPath(); g.moveTo(560, 452); g.quadraticCurveTo(800, 372, 1052, 432); g.stroke();
    g.strokeStyle = "rgba(255,215,170,0.45)"; g.lineWidth = 5; g.beginPath(); g.moveTo(566, 438); g.quadraticCurveTo(800, 358, 1050, 418); g.stroke();
    // mechones peinados hacia delante, muy pegados
    g.strokeStyle = "rgba(45,20,6,0.55)"; g.lineWidth = 4;
    for (const [a, b, c2, d] of [[640, 330, 700, 480], [720, 300, 770, 470], [810, 285, 850, 490], [900, 296, 930, 510], [980, 330, 1000, 520], [600, 380, 600, 520]]) {
      g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo((a + c2) / 2 + 22, (b + d) / 2, c2, d); g.stroke(); }
    g.strokeStyle = "rgba(255,225,185,0.55)"; g.lineWidth = 10; g.beginPath(); g.moveTo(670, 318); g.quadraticCurveTo(800, 270, 940, 312); g.stroke();
    g.restore();
    cam(); g.lineWidth = 7; g.strokeStyle = TINTA; g.stroke();
    // un pelillo rebelde que se resiste (tiembla como un muelle)
    const w = Math.sin(t * 9) * 0.25 + Math.sin(t * 23) * 0.08;
    g.save(); g.translate(812, 272); g.rotate(w);
    g.beginPath(); g.moveTo(-10, 4); g.quadraticCurveTo(-6, -40, 18, -66); g.quadraticCurveTo(4, -36, 10, 4); g.closePath();
    g.fillStyle = "#874621"; g.fill(); g.lineWidth = 5; g.strokeStyle = TINTA; g.stroke(); g.restore();
    g.restore();
  }

  /* ---------- Guillermo ---------- */
  let poseGCache = new Map();
  function poseG(t) {
    const key = Math.round(t * 1e5); if (poseGCache.has(key)) return poseGCache.get(key);
    if (poseGCache.size > 400) poseGCache = new Map();
    const b = guion(GUION_G, CUERPOS_G, t, "bolsillos"), e = guion(GUION_CARA_G, CARAS_G, t, "inicio");
    const respira = Math.sin(t * 2.2);
    const { dir, sx } = giroG(t), esp = dir < 0;
    // saltitos de súplica y cabeceo
    const salt = campana(t, T.pide0 + 0.1, T.pide1) * Math.abs(Math.sin((t - T.pide0) * 14));
    const p = {
      x: xPelvis(t), suelo: SUELO, s: S, espejo: esp, sx,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.3 - 26 * salt }, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      cara: cara(e, parpadeos(PARP_G, t)), tirasLimpias: true, ikContinuo: true
    };
    // atrapar: el peso le dobla las rodillas (rebote)
    const peso = t > T.atrapa ? Math.exp(-(t - T.atrapa) * 5) * Math.sin(Math.min(Math.PI, (t - T.atrapa) * 9)) : 0;
    p.pelvis.y += 28 * Math.max(0, peso) * (t < T.lanza ? 1 : 0);
    // casco encima: le hunde un poco
    const hunde = t > T.encaja ? Math.exp(-(t - T.encaja) * 7) * Math.sin(Math.min(Math.PI, (t - T.encaja) * 12)) : 0;
    p.pelvis.y += 30 * Math.max(0, hunde) * (t < T.tiron ? 1 : 0);
    // a ciegas: cabeceo de pasos y tambaleo
    const anda = tramo(t, T.anda0, T.anda0 + 0.2) * (1 - tramo(t, T.anda1, T.anda1 + 0.15));
    p.pelvis.y -= 6 * Math.abs(Math.sin((t - T.anda0) * Math.PI / 0.3)) * anda;
    const tamb = tramo(t, T.tambal0, T.tambal0 + 0.2) * (1 - tramo(t, T.tropieza1 - 0.2, T.tropieza1));
    p.torso += 0.09 * Math.sin((t - T.tambal0) * 9) * tamb;
    // al salir el casco: cabeza hacia atrás y sacudida
    const sac = campana(t, T.pop, T.pop + 0.35);
    p.cabeza.ang -= 0.12 * sac;
    // boing: la cabeza se estira como un muelle
    if (t > T.boing) { const u = t - T.boing, m = Math.exp(-u * 6) * Math.sin(u * 32); p.cabeza.esc = { x: 1 - 0.07 * m, y: 1 + 0.14 * m }; p.cabeza.dy = -10 * Math.max(0, m); }
    const pies = { izq: pie(PASOS_G.izq, t), der: pie(PASOS_G.der, t) };
    // mirando a la derecha: cercano = izq; a la izquierda: cercano = der
    const cerca = esp ? pies.der : pies.izq, lejos = esp ? pies.izq : pies.der;
    const TOB = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
    for (const [lado, f] of [["cerca", cerca], ["lejos", lejos]]) {
      p.piernas[lado] = { tob: { x: G.PELVIS.x + (f.x - p.x) / S * dir, y: TOB[lado] - f.lev / S * 0.3 - 0 }, ang: -0.18 * (f.lev / 30) };
    }
    p.rojo = 0.3 * tramo(t, T.atrapa, T.atrapa + 0.1) * (1 - tramo(t, T.atrapa + 0.4, T.admira)) + 0.15 * tramo(t, T.pop, T.pop + 0.15) * (1 - tramo(t, T.endereza1, T.toca0));
    p.cara.rubor = 0.5 * tramo(t, T.pide0, T.pide0 + 0.3) * (1 - tramo(t, T.suelta, T.atrapa)) + p.rojo * 0.6 + 0.4 * tramo(t, T.guino - 0.3, T.guino);
    p.sudor = 0.7 * tramo(t, T.toca0, T.toca0 + 0.3) * (1 - tramo(t, T.boing + 0.3, T.boing + 0.8));
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    let c = { x: hc.x + b.cx, y: hc.y + b.cy }, l = { x: hl.x + b.lx, y: hl.y + b.ly };
    const bc = Tr(BOLS_G.c), bl = Tr(BOLS_G.l);
    c = mezcla(c, bc, (1 - clamp(b.cp * 1.5)) * (1 - b.cp)); l = mezcla(l, bl, (1 - clamp(b.lp * 1.5)) * (1 - b.lp));
    const Hj = q => G.aHoja(p, q);
    let angC = b.ca, angL = b.la;
    // manos en el casco: atraparlo, sostenerlo y lanzárselo
    const sostener = tramo(t, T.atrapa - 0.12, T.atrapa) * (1 - tramo(t, T.lanza + 0.05, T.lanza + 0.2));
    if (sostener > 0) {
      const ca = t < T.atrapa ? enManosG(poseG(T.atrapa)) : t > T.lanza + 1e-4 ? casco(t) : enManosG(p);
      const gc = enMundo(ca, { x: -66, y: -62 }), gl = enMundo(ca, { x: 70, y: -66 });
      c = mezcla(c, Hj(gc), sostener); l = mezcla(l, Hj(gl), sostener);
      angC = lerp(angC, 0.9, sostener); angL = lerp(angL, -0.6, sostener);
    }
    // con el casco puesto: se lo agarra por los lados y lo zarandea
    const agita = tramo(t, T.encaja + 0.05, T.agita0) * (1 - tramo(t, T.agita1, T.giro1a + 0.1));
    if (agita > 0) {
      const ca = puestoEn(p), w = Math.sin((t - T.agita0) * 22) * 6;
      const gc = enMundo(ca, { x: -84 + w * 0.3, y: -55 + w }), gl = enMundo(ca, { x: 86, y: -55 - w });
      c = mezcla(c, Hj(gc), agita); l = mezcla(l, Hj(gl), agita);
      angC = lerp(angC, 0.6, agita); angL = lerp(angL, -0.6, agita);
    }
    // brazos de zombi: palpan el aire
    const zom = tramo(t, T.anda0 - 0.1, T.anda0 + 0.25) * (1 - tramo(t, T.choque - 0.01, T.choque + 0.07));
    if (zom > 0) { const w = (t - T.anda0) * 7; c.y += 18 * Math.sin(w) * zom; l.y += 18 * Math.sin(w + 2) * zom; c.x += 10 * Math.cos(w) * zom; }
    // tambaleo: brazos como aspas
    if (tamb > 0) { const w = (t - T.tambal0) * 10; c.x += 50 * Math.sin(w) * tamb; c.y += 60 * Math.cos(w) * tamb; l.x += 50 * Math.sin(w + 2.3) * tamb; l.y += 60 * Math.cos(w + 2.3) * tamb; }
    // se toca el pelo aplastado (palmaditas en el lado de la cabeza)
    const toca = tramo(t, T.toca0, T.toca0 + 0.3) * (1 - tramo(t, T.boing - 0.03, T.boing + 0.05));
    if (toca > 0) {
      const H = G.cabeza(p), q = G.aPantalla(p, H.a({ x: 600, y: 420 + 30 * Math.abs(Math.sin((t - T.toca0) * 9)) }));
      c = mezcla(c, Hj(q), toca); angC = lerp(angC, 1.5, toca);
    }
    const apw = tramo(t, T.apunta0, T.apunta1) * (1 - tramo(t, T.pide0, T.pide0 + 0.3));
    const autoC = Math.max(sostener, agita, zom, tamb, toca) * 0.85, autoL = Math.max(sostener, agita, zom, tamb, apw) * 0.85;
    p.manoCerca = { x: c.x, y: c.y, ang: angC * (1 - autoC), mu: muHacia(hc, c, b.cmu, autoC), dobla: -1, puno: b.cp, dedos: dedos(b, "c") };
    p.manoLejos = { x: l.x, y: l.y, ang: angL * (1 - autoL), mu: muHacia(hl, l, b.lmu, autoL), dobla: -1, puno: b.lp, dedos: dedos(b, "l") };
    // capa de la cabeza: casco en sus manos / puesto, y pelo aplastado
    const ap = aplastado(t);
    p.capaCabeza = (g, tt) => {
      if (ap > 0.001) peloAplastado(g, tt, ap, sx);
      const cc = casco(tt);
      if (cc.capa === "guillermo") { g.save(); g.setTransform(MATRIZ); squash(g, p); dibCasco(g, cc, tt, tt > T.encaja); g.restore(); }
    };
    poseGCache.set(key, p);
    return p;
  }
  // aplastado horizontal del giro (alrededor de la pelvis)
  function squash(g, p) { if (p.sx < 0.999) { g.translate(p.x, 0); g.scale(p.sx, 1); g.translate(-p.x, 0); } }

  /* ---------- Marcos ---------- */
  const TOB_M = { cerca: MB.SUELO - MB.TOBILLO_ALTO, lejos: MB.SUELO - MB.TOBILLO_ALTO - 6 };
  // pies de Marcos (pantalla): F = el de delante (izquierda de la pantalla), N = el de detrás
  const PASOS_M = {
    F: [[-10, -9, 674, 0], [T.mAvanza0, T.mAvanza0 + 0.22, 660, 22], [T.pop + 0.12, T.pop + 0.34, 686, 18]],
    N: [[-10, -9, 754, 0], [T.mAvanza0 + 0.22, T.mAvanza1, 741, 22], [T.pop - 0.02, T.pop + 0.18, 767, 22]]
  };
  const XM = [[-10, 715], [T.mAvanza0, 715], [T.mAvanza1, 702], [T.pop - 0.04, 702], [T.pop + 0.36, 728], [DUR + 1, 728]];
  function xMarcos(t) {
    let i = 0; while (i + 1 < XM.length && t >= XM[i + 1][0]) i++;
    const [t0, x0] = XM[i], [t1, x1] = XM[Math.min(i + 1, XM.length - 1)];
    return t1 > t0 ? lerp(x0, x1, suave(fase(t, t0, t1))) : x0;
  }
  let poseMCache = new Map();
  function poseM(t) {
    const key = Math.round(t * 1e5); if (poseMCache.has(key)) return poseMCache.get(key);
    if (poseMCache.size > 400) poseMCache = new Map();
    const b = guion(GUION_M, CUERPOS_M, t, "base"), e = guion(GUION_CARA_M, CARAS_M, t, "inicio");
    const respira = Math.sin(t * 2.0 + 1.1);
    const p = {
      x: xMarcos(t), suelo: SUELO, s: S, espejo: true,
      pelvis: { x: MB.PELVIS.x, y: MB.PELVIS.y + b.pel + respira * 1.4 }, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      cara: cara(e, parpadeos(PARP_M, t)), tirasLimpias: true, ikContinuo: true
    };
    // risa contenida y carcajada: se le sacuden los hombros
    const cont = tramo(t, T.mBoca0, T.mBoca0 + 0.2) * (1 - tramo(t, T.mAvanza0 - 0.2, T.mAvanza0)) + 0.6 * campana(t, T.pop + 0.3, T.risa);
    p.torso += 0.025 * Math.sin(t * 30) * cont; p.cabeza.ang += 0.03 * Math.sin(t * 30 + 1) * cont;
    const risa = tramo(t, T.risa, T.risa + 0.2) * (1 - tramo(t, T.fin - 0.5, T.fin));
    p.torso += 0.05 * Math.sin(t * 13) * risa; p.pelvis.y += 8 * Math.abs(Math.sin(t * 13)) * risa; p.cabeza.ang += 0.06 * Math.sin(t * 13 + 0.6) * risa;
    for (const [lado, f] of [["lejos", pie(PASOS_M.F, t)], ["cerca", pie(PASOS_M.N, t)]]) {
      p.piernas[lado] = { tob: { x: MB.PELVIS.x - (f.x - p.x) / (S * MB.K), y: TOB_M[lado] - f.lev / (S * MB.K) }, ang: -0.15 * (f.lev / 22) };
    }
    p.cara.rubor = 0.45 * risa + 0.3 * campana(t, T.mBoca0, T.mAvanza0);
    const Hj = q => MB.aHoja(p, q);
    // mano cercana: cuelga relajada; en la carcajada, a la barriga
    const rc = MB.manoReposo(p, "cerca");
    let c = { x: rc.x, y: rc.y }, angC = rc.ang || 0, dC = rc.dedos || { pulgar: 0.55, indice: 0.62, medio: 0.58, anular: 0.52, menique: 0.48 };
    const barriga = tramo(t, T.risa - 0.05, T.risa + 0.25) * (1 - tramo(t, T.fin - 0.6, T.fin));
    if (barriga > 0) { const q = MB.aPantalla(p, MB.tronco(p)({ x: 300, y: 560 })); c = mezcla(c, Hj(q), barriga); angC = lerp(angC, -1.2, barriga); }
    // mano lejana: bolsillo → percha → lleva y lanza el casco → a la boca (risa) → agarra y tira → lo lleva
    const rl = MB.manoReposo(p, "lejos"), hl = MB.tronco(p)(MB.HOMBRO);
    let l = { x: rl.x, y: rl.y }, angL = 0;
    const AGR = { pulgar: 0.4, indice: 0.45, medio: 0.45, anular: 0.42, menique: 0.4 }, ABRE = { pulgar: 1, indice: 1, medio: 1, anular: 1, menique: 1 };
    let dL = AGR;
    const fuera = clamp(tramo(t, T.mAlcanza0 - 0.05, T.mAlcanza0 + 0.12) * (1 - tramo(t, T.suelta + 0.35, T.suelta + 0.7))
      + tramo(t, T.mBoca0 - 0.12, T.mBoca0 + 0.05) * (1 - tramo(t, T.mBoca1 + 0.1, T.mBoca1 + 0.45))
      + tramo(t, T.mAvanza0 + 0.1, T.mAvanza0 + 0.28) * (1 - tramo(t, T.fin - 0.7, T.fin - 0.1)));
    const cc = casco(t);
    if (t < T.coge) l = mezcla(l, Hj(manoMarcos(T.coge)), tramo(t, T.mAlcanza0, T.coge));
    else if (t < T.suelta) l = Hj(manoMarcos(t));
    else {
      const a = manoMarcos(T.suelta), u = salida(fase(t, T.suelta, T.suelta + 0.22));
      l = mezcla(Hj({ x: a.x - 34 * u, y: a.y - 16 * u }), l, tramo(t, T.suelta + 0.25, T.suelta + 0.7));
      dL = { pulgar: lerp(0.4, 1, u), indice: lerp(0.45, 1, u), medio: lerp(0.45, 1, u), anular: lerp(0.42, 1, u), menique: lerp(0.4, 1, u) };
    }
    // risa contenida: se tapa la boca
    const boca = tramo(t, T.mBoca0 - 0.05, T.mBoca0 + 0.25) * (1 - tramo(t, T.mBoca1 - 0.1, T.mBoca1 + 0.3));
    if (boca > 0) { const q = MB.aPantalla(p, MB.boca(p)); l = mezcla(l, Hj({ x: q.x + 4, y: q.y + 8 }), boca); dL = boca > 0.5 ? { pulgar: 0.7, indice: 0.9, medio: 0.9, anular: 0.85, menique: 0.8 } : dL; }
    // agarra el casco por arriba, tira, lo sostiene y lo suelta
    if (t >= T.mAvanza0 + 0.3 && t < T.dejaCae + 0.05) {
      const kk = tramo(t, T.mAvanza0 + 0.3, T.agarra);
      const gp = t < T.dejaCae ? enMundo(cc, CASCO.agarre) : manoSostiene(T.dejaCae);
      l = mezcla(l, Hj(gp), t < T.agarra ? kk : 1); dL = AGR;
    }
    if (t >= T.dejaCae) {
      // al soltarlo abre la mano; luego se tapa la boca aguantando la risa y, tras el boing, le señala riéndose
      const u = fase(t, T.dejaCae, T.dejaCae + 0.15), h = Hj(manoSostiene(T.dejaCae));
      l = { x: h.x, y: h.y - 30 * salida(u) };
      dL = { pulgar: lerp(0.4, 1, u), indice: lerp(0.45, 1, u), medio: lerp(0.45, 1, u), anular: lerp(0.42, 1, u), menique: lerp(0.4, 1, u) };
      const qb = MB.aPantalla(p, MB.boca(p)), tapa = tramo(t, T.dejaCae + 0.15, T.dejaCae + 0.45) * (1 - tramo(t, T.boing + 0.05, T.risa + 0.1));
      l = mezcla(l, Hj({ x: qb.x + 4, y: qb.y + 8 }), tapa);
      const pg = poseG(t), qg = G.aPantalla(pg, G.centroCabeza(pg)), hs = MB.aPantalla(p, hl);
      const dx = qg.x - hs.x, dy = qg.y - hs.y, dd = Math.hypot(dx, dy) || 1;
      const senala = tramo(t, T.risa, T.risa + 0.25) * (1 - tramo(t, T.fin - 0.7, T.fin - 0.2));
      l = mezcla(l, Hj({ x: hs.x + dx / dd * 92, y: hs.y + dy / dd * 92 + 6 * Math.sin(t * 13) }), senala);
      if (senala > 0.5) dL = { pulgar: 0.15, indice: 1, medio: 0, anular: 0, menique: 0 };
      else if (tapa > 0.5) dL = { pulgar: 0.7, indice: 0.9, medio: 0.9, anular: 0.85, menique: 0.8 };
    }
    const mu = muHacia(hl, l, -1.75, fuera * 0.9);
    p.manoCerca = { x: c.x, y: c.y, ang: angC, mu: rc.mu ?? -1.66, dobla: -1, puno: rc.puno ?? 1, dedos: dC };
    p.manoLejos = { x: l.x, y: l.y, ang: angL, mu, dobla: 1, puno: fuera, dedos: dL };
    if (cc.capa === "marcos") p.manoLejos.objeto = (g, tt) => { g.save(); g.setTransform(MATRIZ); dibCasco(g, casco(tt), tt, false); g.restore(); };
    poseMCache.set(key, p);
    return p;
  }
  function pose(t) { return { g: poseG(t), m: poseM(t) }; }

  /* ---------- taquillas (se pegan al casco en el choque) ---------- */
  let XTAQ = null, YGOLPE = 0;
  function preparaTaquillas() {
    const pg = poseG(T.choque), c = puestoEn(pg);
    const delante = enMundo(c, { x: CASCO.delante, y: -60 });
    XTAQ = delante.x; YGOLPE = delante.y;
  }
  function creaTaquillas() {
    const w = 190, h = 470, c = document.createElement("canvas"); c.width = w + 30; c.height = h + 20; const g = c.getContext("2d");
    g.translate(4, 4); g.lineJoin = "round";
    // dos columnas de puertas rojas (de frente) y el costado gris (lo que golpea)
    const X1 = w - 24;            // borde derecho del frente = donde empieza el costado
    for (let col = 0; col < 2; col++) {
      const x0 = col * (X1 / 2);
      for (let fila = 0; fila < 2; fila++) {
        const y0 = fila * (h / 2), hh = h / 2;
        const gr = g.createLinearGradient(x0, 0, x0 + X1 / 2, 0); gr.addColorStop(0, "#c2323a"); gr.addColorStop(1, "#a3222b");
        g.fillStyle = gr; g.fillRect(x0, y0, X1 / 2, hh); g.lineWidth = 3; g.strokeStyle = TINTA; g.strokeRect(x0, y0, X1 / 2, hh);
        g.strokeStyle = "rgba(0,0,0,0.45)"; g.lineWidth = 2.5;
        for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(x0 + 18, y0 + 22 + i * 9); g.lineTo(x0 + X1 / 2 - 18, y0 + 22 + i * 9); g.stroke(); }
        g.fillStyle = "#e8e2d6"; g.fillRect(x0 + X1 / 2 - 22, y0 + hh * 0.45, 8, 26); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.strokeRect(x0 + X1 / 2 - 22, y0 + hh * 0.45, 8, 26);
        g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(x0 + 6, y0 + 6, 6, hh - 12);
      }
    }
    // costado (en perspectiva)
    g.fillStyle = "#8c1a22"; g.beginPath(); g.moveTo(X1, 0); g.lineTo(X1 + 22, 10); g.lineTo(X1 + 22, h + 4); g.lineTo(X1, h); g.closePath(); g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(X1 + 4, 14, 4, h - 20);
    // techo de las taquillas
    g.fillStyle = "#6e1218"; g.beginPath(); g.moveTo(0, 0); g.lineTo(X1, 0); g.lineTo(X1 + 22, 10); g.lineTo(22, 10); g.closePath(); g.fill(); g.stroke();
    // zócalo
    g.fillStyle = "#2a2a30"; g.fillRect(0, h - 18, X1, 18); g.strokeRect(0, h - 18, X1, 18);
    return { c, X1, h };
  }
  function dibTaquillas(g, t) {
    if (!taquillas) taquillas = creaTaquillas();
    const { c, X1, h } = taquillas;
    const tiembla = t > T.choque ? 4 * Math.exp(-(t - T.choque) * 7) * Math.sin((t - T.choque) * 60) : 0;
    const x0 = XTAQ - X1 - 4 + tiembla, y0 = SUELO - h - 4;
    g.drawImage(c, x0, y0);
    // abolladura en el costado
    if (t > T.choque) {
      const k = salida(fase(t, T.choque, T.choque + 0.06));
      g.save(); g.translate(XTAQ + 10 + tiembla, YGOLPE); g.scale(k, k);
      g.fillStyle = "#5e0f15"; g.beginPath(); g.ellipse(0, 0, 9, 26, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = TINTA; g.lineWidth = 2.2; g.beginPath(); g.ellipse(0, 0, 9, 26, 0, -Math.PI / 2, Math.PI / 2); g.stroke();
      g.strokeStyle = "rgba(255,170,170,0.5)"; g.lineWidth = 2; g.beginPath(); g.ellipse(-2, 0, 7, 22, 0, Math.PI / 2, Math.PI * 1.5); g.stroke();
      g.strokeStyle = TINTA; g.lineWidth = 1.6;
      for (const [a, b2] of [[[-4, -30], [-10, -40]], [[4, 28], [10, 38]], [[6, -16], [14, -22]]]) { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b2[0], b2[1]); g.stroke(); }
      g.restore();
    }
  }

  /* ---------- efectos ---------- */
  function estrellaPuntas(g, x, y, r, puntas, rot, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function impacto(g, t, t0, x, y, tam) {
    const k = fase(t, t0, t0 + 0.3); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    estrellaPuntas(g, x, y, tam * (0.6 + 0.8 * salida(k)), 12, 0.3, 0.42); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    estrellaPuntas(g, x, y, tam * (0.35 + 0.5 * salida(k)), 12, 0.55, 0.5); g.fillStyle = "#ffffff"; g.fill();
    g.strokeStyle = "#ffffff"; g.lineWidth = 4; g.lineCap = "round";
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + 0.2, r0 = tam * (0.9 + 0.9 * k), r1 = r0 + tam * 0.5; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // estrellitas girando sobre el casco tras el golpe
  function estrellitas(g, t, c) {
    const k = tramo(t, T.choque + 0.05, T.choque + 0.25) * (1 - tramo(t, T.tropieza0, T.tropieza0 + 0.4)); if (k <= 0.01) return;
    const top = enMundo(c, { x: 0, y: -150 });
    const pts = [];
    for (let i = 0; i < 5; i++) { const a = t * 4.4 + i * Math.PI * 2 / 5; pts.push({ a, x: top.x + Math.cos(a) * 56, y: top.y - 4 + Math.sin(a) * 15, z: Math.sin(a) }); }
    pts.sort((u, v) => u.z - v.z);
    g.save();
    for (const q of pts) { const r = (9 + 3 * q.z) * k; estrellaPuntas(g, q.x, q.y, r, 5, t * 3 + q.a, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke(); }
    g.restore();
  }
  // líneas de «no veo nada» que salen del casco (ondas apagadas)
  function ondasCasco(g, t, c) {
    const k = tramo(t, T.encaja + 0.1, T.encaja + 0.3) * (1 - tramo(t, T.anda0 + 0.2, T.anda0 + 0.5)); if (k <= 0.01) return;
    g.save(); g.lineCap = "round"; g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const ph = (t * 2.2 + i / 3) % 1, q = enMundo(c, { x: 100 + 30 * ph, y: -70 });
      g.globalAlpha = Math.sin(Math.PI * ph) * k;
      g.beginPath(); g.arc(q.x, q.y, 10 + 16 * ph, -0.7 + c.ang, 0.7 + c.ang); g.stroke();
    }
    g.restore();
  }
  // tirón: ¡plop! (anillo de aire en el borde)
  function plop(g, t, c) {
    const k = fase(t, T.pop - 0.02, T.pop + 0.28); if (k <= 0 || k >= 1) return;
    const q = enMundo(c, { x: 0, y: 6 });
    g.save(); g.globalAlpha = 1 - k; g.strokeStyle = "#ffffff"; g.lineWidth = 4; g.lineCap = "round";
    for (let i = 0; i < 8; i++) { const a = c.ang + Math.PI / 2 + (i - 3.5) * 0.32, r0 = 20 + 50 * salida(k), r1 = r0 + 14; g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * r1, q.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // boing: muelles y arcos de movimiento sobre la cabeza
  function boing(g, t, pg) {
    const k = fase(t, T.boing, T.boing + 0.55); if (k <= 0 || k >= 1) return;
    const H = G.cabeza(pg), top = G.aPantalla(pg, H.a({ x: 800, y: 150 }));
    g.save(); g.globalAlpha = 1 - k * k; g.lineCap = "round"; g.lineJoin = "round";
    // muelle que se estira y vibra
    const alto = 46 * salida(k) * (1 + 0.25 * Math.sin(k * 30) * (1 - k));
    g.strokeStyle = TINTA; g.lineWidth = 5; g.beginPath();
    for (let i = 0; i <= 40; i++) { const u = i / 40, x = top.x + Math.sin(u * Math.PI * 8) * 9, y = top.y - 6 - u * alto; if (i) g.lineTo(x, y); else g.moveTo(x, y); }
    g.stroke(); g.strokeStyle = "#e8e2d6"; g.lineWidth = 2.5; g.stroke();
    // arcos de movimiento
    g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 3.5;
    for (const [dx, a0] of [[-58, Math.PI * 1.1], [58, Math.PI * 1.65]]) { g.beginPath(); g.arc(top.x + dx * 0.3, top.y + 30, 50 + 10 * k, a0, a0 + 0.6); g.stroke(); }
    g.restore();
  }
  // risa de Marcos: rayitas alrededor de la cabeza
  function risaM(g, t, pm) {
    const k = tramo(t, T.risa, T.risa + 0.2) * (1 - tramo(t, T.fin - 0.5, T.fin)); if (k <= 0.01) return;
    const c = MB.aPantalla(pm, MB.centroCabeza(pm));
    g.save(); g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 3; g.lineCap = "round"; g.globalAlpha = k;
    for (let i = 0; i < 3; i++) { const ph = (t * 3 + i / 3) % 1, a = -2.4 + i * 0.5, r0 = 64 + 12 * ph;
      g.globalAlpha = k * Math.sin(Math.PI * ph); g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0); g.lineTo(c.x + Math.cos(a) * (r0 + 12), c.y + Math.sin(a) * (r0 + 12)); g.stroke(); }
    g.restore();
  }

  /* ---------- decorado: vestuario del parque ---------- */
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60);
    // pared de arriba pintada (verde agua) y alicatado blanco abajo
    const pared = g.createLinearGradient(0, -60, 0, 300); pared.addColorStop(0, "#7fa79a"); pared.addColorStop(1, "#a9c8bb");
    g.fillStyle = pared; g.fillRect(-40, -60, W + 80, 360);
    g.fillStyle = "#e9ece4"; g.fillRect(-40, 300, W + 80, SUELO - 300);
    g.strokeStyle = "rgba(90,110,100,0.35)"; g.lineWidth = 1.5;
    for (let y = 300; y < SUELO; y += 26) { g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); }
    for (let x = -40; x < W + 40; x += 26) { g.beginPath(); g.moveTo(x, 300); g.lineTo(x, SUELO); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,0.35)"; for (let i = 0; i < 40; i++) { const x = -40 + Math.floor(hash(i) * 42) * 26, y = 300 + Math.floor(hash(i + 3) * 10) * 26; g.fillRect(x + 3, y + 3, 8, 3); }
    // franja roja de parque de bomberos
    g.fillStyle = "#c62e33"; g.fillRect(-40, 288, W + 80, 14); g.fillStyle = "#8f1e24"; g.fillRect(-40, 300, W + 80, 3);
    g.fillStyle = "rgba(255,255,255,0.3)"; g.fillRect(-40, 289, W + 80, 2);
    // tubos fluorescentes del techo
    for (const lx of [260, 760]) {
      const h = g.createRadialGradient(lx, -20, 10, lx, 40, 360); h.addColorStop(0, "rgba(240,255,250,0.5)"); h.addColorStop(1, "rgba(220,250,240,0)");
      g.fillStyle = h; g.fillRect(lx - 380, -60, 760, 480);
      g.fillStyle = "#3c4a46"; g.fillRect(lx - 90, -30, 180, 12); g.fillStyle = "#f4fffb"; g.fillRect(lx - 82, -18, 164, 7);
      g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(lx - 90, -30, 180, 12);
    }
    // tablero del perchero con ganchos (aquí cuelga el casco de repuesto) y una chaqueta
    g.fillStyle = "#7a4b27"; g.fillRect(460, 154, 450, 22); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(460, 154, 450, 22);
    g.fillStyle = "rgba(255,220,170,0.25)"; g.fillRect(462, 156, 446, 4);
    for (const hx of [PERCHA.x, 700, 868]) { g.fillStyle = "#c9a14a"; g.beginPath(); g.arc(hx, 165, 5, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.5; g.stroke();
      g.strokeStyle = "#8a6a2a"; g.lineWidth = 4; g.beginPath(); g.moveTo(hx, 165); g.quadraticCurveTo(hx + 2, 180, hx + 9, 176); g.stroke(); g.strokeStyle = TINTA; }
    // chaqueta de intervención colgada a la derecha del perchero
    g.save(); g.translate(868, 172);
    g.fillStyle = "#24242c"; g.strokeStyle = TINTA; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(-30, 4); g.quadraticCurveTo(0, -8, 30, 4); g.lineTo(52, 30); g.lineTo(60, 128); g.lineTo(44, 132); g.lineTo(38, 70);
    g.lineTo(36, 150); g.lineTo(-36, 150); g.lineTo(-38, 70); g.lineTo(-44, 132); g.lineTo(-60, 128); g.lineTo(-52, 30); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#e9e85a"; g.fillRect(-36, 104, 72, 7); g.fillStyle = "#c9ced6"; g.fillRect(-36, 111, 72, 4); g.fillStyle = "#e9e85a"; g.fillRect(-36, 115, 72, 6);
    g.fillStyle = "#e9e85a"; g.fillRect(-60, 106, 15, 6); g.fillRect(45, 106, 15, 6);
    g.strokeStyle = "rgba(255,255,255,0.14)"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -2); g.lineTo(0, 150); g.stroke();
    g.fillStyle = "#1a1a20"; g.beginPath(); g.moveTo(-14, -2); g.lineTo(0, 22); g.lineTo(14, -2); g.closePath(); g.fill();
    g.restore();
    // reloj de pared
    g.save(); g.translate(930, 60); g.fillStyle = "#f6f4ec"; g.beginPath(); g.arc(0, 0, 30, 0, Math.PI * 2); g.fill(); g.lineWidth = 5; g.strokeStyle = "#c62e33"; g.stroke();
    g.lineWidth = 2; g.strokeStyle = TINTA; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.beginPath(); g.moveTo(Math.cos(a) * 22, Math.sin(a) * 22); g.lineTo(Math.cos(a) * 26, Math.sin(a) * 26); g.stroke(); }
    g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(10, -12); g.moveTo(0, 0); g.lineTo(-4, 16); g.stroke(); g.restore();
    // cuadro con un camión de bomberos
    g.save(); g.translate(300, 70); g.fillStyle = "#3b2312"; g.fillRect(-60, -38, 120, 76); g.fillStyle = "#dfe9f0"; g.fillRect(-52, -30, 104, 60);
    g.fillStyle = "#c62e33"; g.fillRect(-40, -6, 70, 24); g.fillRect(30, 0, 14, 18); g.fillStyle = "#bfe0ff"; g.fillRect(33, 3, 8, 7);
    g.fillStyle = "#c9ced6"; g.fillRect(-36, -12, 60, 4); g.fillStyle = TINTA; for (const x of [-26, 28]) { g.beginPath(); g.arc(x, 20, 7, 0, Math.PI * 2); g.fill(); }
    g.lineWidth = 3; g.strokeStyle = TINTA; g.strokeRect(-60, -38, 120, 76); g.restore();
    // banco de madera al fondo, a la derecha
    g.save(); g.translate(880, 470);
    g.fillStyle = "#8a5a32"; g.fillRect(-90, 0, 180, 14); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(-90, 0, 180, 14);
    g.fillStyle = "#5a3a1e"; for (const x of [-76, 70]) { g.fillRect(x, 14, 8, 60); g.strokeRect(x, 14, 8, 60); }
    g.fillStyle = "#f2efe6"; g.beginPath(); g.moveTo(-40, -2); g.quadraticCurveTo(-20, -14, 10, -4); g.lineTo(14, 2); g.lineTo(-44, 2); g.closePath(); g.fill(); g.lineWidth = 1.5; g.stroke();
    g.restore();
    // suelo de goma gris verdoso
    const su = g.createLinearGradient(0, SUELO, 0, H + 60); su.addColorStop(0, "#56625d"); su.addColorStop(1, "#2c3431");
    g.fillStyle = "#3d4743"; g.fillRect(-40, SUELO - 10, W + 80, 10);
    g.fillStyle = su; g.fillRect(-40, SUELO, W + 80, H + 60 - SUELO);
    g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 2;
    for (let x = -60; x < W + 80; x += 90) { g.beginPath(); g.moveTo(x, SUELO); g.lineTo(x + (x - 512) * 0.3, H + 60); g.stroke(); }
    g.fillStyle = "rgba(230,255,245,0.15)"; g.fillRect(-40, SUELO, W + 80, 2);
    const v = g.createRadialGradient(512, 300, 330, 512, 300, 720); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.42)");
    g.fillStyle = v; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const pelo = tramo(t, T.pop + 0.1, T.endereza1 + 0.2, suave) * (1 - tramo(t, T.risa + 0.3, T.bolsillos + 0.4, suave));
    return { k: 1 + 0.06 * pelo, x: 512 - 24 * pelo, y: 300 };
  }

  class GuillermoMarcosCasco extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !MB.listo()) return;
      if (!fondo) fondo = creaFondo();
      if (XTAQ === null) preparaTaquillas();
      const { g: pg, m: pm } = pose(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = (t >= T.choque ? 5 * Math.exp(-(t - T.choque) * 7) : 0) + (t >= T.encaja ? 2.5 * Math.exp(-(t - T.encaja) * 8) : 0) + (t >= T.pop ? 2 * Math.exp(-(t - T.pop) * 9) : 0);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.6);
      MATRIZ = g.getTransform();
      g.drawImage(fondo, -40, -60);
      const cc = casco(t);
      if (cc.capa === "percha") { tirasPercha(g, cc); dibCasco(g, cc, t, false); }
      if (cc.capa === "suelo") dibCasco(g, cc, t, false);
      dibTaquillas(g, t);
      // sombras
      g.save(); g.fillStyle = "rgba(0,0,0,0.3)";
      g.beginPath(); g.ellipse(pg.x + 4, SUELO + 2, 72 * pg.sx + 16, 8, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pm.x - 4, SUELO + 2, 92, 9, 0, 0, Math.PI * 2); g.fill(); g.restore();
      // personajes
      g.save(); squash(g, pg); G.dibujar(g, pg, t); g.restore();
      MB.dibujar(g, pm, t);
      if (cc.capa === "vuelo") dibCasco(g, cc, t, false);
      // efectos
      if (t >= T.choque) impacto(g, t, T.choque, XTAQ + 6, YGOLPE, 40);
      if (cc.capa === "guillermo" && t > T.encaja) { estrellitas(g, t, cc); ondasCasco(g, t, cc); }
      if (t > T.pop - 0.05 && t < T.pop + 0.4) plop(g, t, casco(Math.min(t, T.pop + 0.05)));
      boing(g, t, pg);
      risaM(g, t, pm);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00027", nombre: "Guillermo y Marcos · El casco", crear: () => new GuillermoMarcosCasco() });
  window.__A2D_00027 = { pose, T, DUR, casco, poseG, poseM };
})();
