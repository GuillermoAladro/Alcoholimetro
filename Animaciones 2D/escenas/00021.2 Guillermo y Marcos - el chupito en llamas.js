"use strict";
/* 00021.2 · Guillermo y Marcos · El chupito en llamas
 *
 * Negro → en un saloon del oeste, Guillermo (izquierda) y Marcos Bombero (derecha, cara a cara) están
 * cada uno en una punta de la barra. Encima hay una fila de cinco chupitos, una servilleta y un cóctel
 * con sombrillita. Marcos, con la lanza de su manguera colgando de la mano, se toma un vaso de leche →
 * Guillermo saca el mechero, prende el primer chupito y el segundo, y guiña a cámara → la llama salta
 * sola de chupito en chupito hasta el último, a la servilleta y a la sombrilla: fuego en la barra,
 * humo → Guillermo, en pánico, sopla y abanica: las llamas crecen → Marcos, sin inmutarse, se acaba la
 * leche (bigote blanco incluido), deja el vaso, levanta la lanza y apaga el fuego con un chorro
 * preciso, llama a llama, de derecha a izquierda… y sigue hasta Guillermo, que acaba empapado: el pelo
 * aplastado y chorreando, un charco a sus pies → Marcos sopla la boca de la lanza como un pistolero y
 * levanta el pulgar; a Guillermo le sale agua de la oreja y escupe un chorrito → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, MB = MarcosBombero;
  const S = 0.30, SUELO = 560, DUR = 14.1;
  const TINTA = "#0b0a0e";
  const T = {
    mira: 0.45, mSorbo0: 0.85, mSorbo1: 1.75,
    saca0: 1.15, saca1: 1.6, clic: 1.82, prende: 1.9,
    l1a: 2.05, l1: 2.4, l2a: 2.55, l2: 2.92, vuelve: 3.02, cierra: 3.12,
    guino: 3.1,
    salta3: 3.52, salta4: 3.7, salta5: 3.86, serv: 4.06, somb: 4.28,
    sorpresa: 3.56, panico: 4.35, sopla0: 4.8, sopla1: 5.3, abanica0: 5.45, abanica1: 6.35, atras0: 6.45, atras1: 6.9,
    mNota: 4.12, mBebe0: 4.45, mBebe1: 5.45, mDeja0: 5.55, mDeja: 5.82, mSube0: 6.0, mSube1: 6.6, mApunta: 6.85,
    abre: 6.95,
    gVe: 7.62, moja: 8.3, cierra0: 9.02, cierraJ: 9.2,
    mSopla0: 9.45, mSopla1: 10.12, mBaja: 10.3,
    oreja0: 10.3, oreja: 10.45, oreja1: 10.85,
    mPulgar0: 10.85, mPulgar1: 11.8,
    gMofle0: 11.55, gEscupe: 11.92, gEscupe1: 12.3,
    fin: 13.05
  };

  /* ---------- barra y cosas de encima (px de pantalla) ---------- */
  const BX0 = 352, BX1 = 708, BTOP = 318, BFRENTE = 334, BASE = 327;        // base de los vasos sobre la barra
  const XG = 268, XM = 806;
  const X_CHUPI = [392, 434, 476, 518, 560], X_SERV = 604, X_COPA = 648, X_LECHE = 686;
  // fuego: cuándo prende cada cosa (los chupitos 1 y 2 los prende Guillermo; el resto salta solo)
  const PRENDE = [T.l1, T.l2, T.salta3, T.salta4, T.salta5];
  // barrido del chorro: de derecha a izquierda, apagando cada cosa, y luego a Guillermo
  const BARRIDO = [[T.abre + 0.15, X_COPA - 10, 286], [T.abre + 0.31, X_SERV, 312], [T.abre + 0.47, X_CHUPI[4], 300],
    [T.abre + 0.61, X_CHUPI[3], 300], [T.abre + 0.75, X_CHUPI[2], 300], [T.abre + 0.89, X_CHUPI[1], 300], [T.abre + 1.03, X_CHUPI[0], 300]];
  const T_APAGA = { somb: BARRIDO[0][0], serv: BARRIDO[1][0], chupi: [6, 5, 4, 3, 2].map(i => BARRIDO[i][0]) };
  // charquitos de alcohol ardiendo entre los chupitos (aparecen al abanicar)
  const CHARCOS = [[455, 4.72], [497, 4.92], [539, 5.12]];
  const apagaX = x => { for (let i = 0; i < BARRIDO.length - 1; i++) { const [t0, x0] = BARRIDO[i], [t1, x1] = BARRIDO[i + 1]; if (x <= x0 && x >= x1) return lerp(t0, t1, (x0 - x) / (x0 - x1)); } return BARRIDO[BARRIDO.length - 1][0]; };

  /* ---------- posturas: manos respecto a su hombro (hoja de cada uno) ---------- */
  const P0 = { pel: 0, dx: 0, torso: 0, cab: 0, cx: 40, cy: 300, ca: 0, cmu: -1.75, cp: 0, lx: 0, ly: 280, la: 0, lmu: -1.75, lp: 0,
    c0: 0, c1: 0, c2: 0, c3: 0, c4: 0, l0: 0, l1: 0, l2: 0, l3: 0, l4: 0 };
  const C_ = o => Object.assign({}, P0, o);
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function guion(lista, tabla, t, base) {
    let c = tabla[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, tabla[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const AG = { l0: 0.4, l1: 0.38, l2: 0.38, l3: 0.38, l4: 0.38 };          // agarre (mechero) en la mano lejana
  const ABC = { c0: 1, c1: 1, c2: 1, c3: 1, c4: 1 }, ABL = { l0: 1, l1: 1, l2: 1, l3: 1, l4: 1 };   // palmas abiertas
  const CUERPOS_G = {
    bolsillos: C_({}),
    chulo: C_({ torso: -0.04, cab: -0.04 }),
    mechero: C_(Object.assign({ torso: -0.02, lx: 95, ly: 75, lmu: -2.5, lp: 1 }, AG)),
    enciende: C_(Object.assign({ torso: 0.08, cab: 0.05, lx: 120, ly: 95, lmu: -2.5, lp: 1 }, AG)),
    guino: C_(Object.assign({ torso: -0.05, cab: -0.05, lx: 95, ly: 70, lmu: -2.5, lp: 1 }, AG)),
    sorpresa: C_(Object.assign({ torso: -0.08, cab: -0.06, pel: -6, lx: 105, ly: 55, lmu: -2.5, lp: 1 }, AG)),
    panico: C_(Object.assign({ torso: -0.04, cab: 0.0, cp: 1, lp: 1, cmu: 1.75, lmu: 1.35, ca: 0, la: 0 }, ABC, ABL)),
    sopla: C_(Object.assign({ torso: 0.16, cab: 0.08, pel: 10, cx: -40, cy: 250, cp: 1, cmu: -1.4, lx: -20, ly: 250, lp: 1, lmu: -1.9 }, ABC, ABL)),
    abanica: C_(Object.assign({ torso: 0.1, cab: 0.04, pel: 6, cp: 1, lp: 1, cmu: -3.0, lmu: -2.95 }, ABC, ABL)),
    atras: C_(Object.assign({ torso: -0.1, cab: -0.06, pel: -4, cx: 115, cy: 70, cp: 1, cmu: -2.0, lx: 160, ly: 40, lp: 1, lmu: -2.2 }, ABC, ABL)),
    moja: C_(Object.assign({ torso: -0.16, cab: -0.14, pel: 6, cx: -95, cy: 95, cp: 1, cmu: -0.6, ca: 0, lx: 200, ly: 35, lp: 1, lmu: -2.6 }, ABC, ABL)),
    empapado: C_({ torso: 0.05, cab: 0.06, pel: 10, cx: 18, cy: 300, cp: 1, cmu: -1.6, lx: 26, ly: 292, lp: 1, lmu: -1.75,
      c0: 0.55, c1: 0.7, c2: 0.65, c3: 0.6, c4: 0.55, l0: 0.55, l1: 0.7, l2: 0.65, l3: 0.6, l4: 0.55 }),
    oreja: C_({ torso: -0.06, cab: -0.3, pel: 4, cx: 0, cy: 300, cp: 1, cmu: -1.6, lx: 70, ly: 250, lp: 1, lmu: -1.75,
      c0: 0.55, c1: 0.7, c2: 0.65, c3: 0.6, c4: 0.55, l0: 0.55, l1: 0.7, l2: 0.65, l3: 0.6, l4: 0.55 }),
    escupe: C_({ torso: 0.07, cab: 0.08, pel: 10, cx: 18, cy: 300, cp: 1, cmu: -1.6, lx: 26, ly: 292, lp: 1, lmu: -1.75,
      c0: 0.55, c1: 0.7, c2: 0.65, c3: 0.6, c4: 0.55, l0: 0.55, l1: 0.7, l2: 0.65, l3: 0.6, l4: 0.55 })
  };
  const GUION_G = [
    [T.mira, T.mira + 0.4, "chulo"], [T.saca0, T.saca1, "mechero"], [T.l1a, T.l1, "enciende"], [T.vuelve, T.guino + 0.1, "guino"],
    [T.sorpresa, T.sorpresa + 0.18, "sorpresa", salida], [T.panico - 0.1, T.panico + 0.22, "panico"], [T.sopla0 - 0.2, T.sopla0 + 0.1, "sopla"],
    [T.abanica0 - 0.1, T.abanica0 + 0.15, "abanica"], [T.atras0, T.atras0 + 0.3, "atras"], [T.moja - 0.03, T.moja + 0.1, "moja", salida],
    [T.cierraJ, T.cierraJ + 0.55, "empapado"], [T.oreja0, T.oreja0 + 0.2, "oreja"], [T.oreja1 - 0.05, T.oreja1 + 0.3, "empapado"],
    [T.gMofle0, T.gEscupe, "escupe"], [T.gEscupe1 + 0.1, T.gEscupe1 + 0.5, "empapado"]
  ];
  // Marcos: c = mano cercana (la de la lanza), l = mano lejana (vaso de leche, luego delante en la lanza)
  const LANZA_CUELGA = { cx: 30, cy: 395, ca: -0.55, cmu: -2.05 };
  const AGM = { c0: 0.35, c1: 0.35, c2: 0.35, c3: 0.35, c4: 0.35, l0: 0.38, l1: 0.36, l2: 0.36, l3: 0.36, l4: 0.36 };
  const CUERPOS_M = {
    base: C_(Object.assign({ cp: 1, lx: 120, ly: 135, la: 0, lmu: -2.45, lp: 1 }, LANZA_CUELGA, AGM)),
    sorbo: C_(Object.assign({ cp: 1, cab: -0.05, lp: 1, la: 0, lmu: -2.6 }, LANZA_CUELGA, AGM)),
    nota: C_(Object.assign({ cp: 1, cab: 0.03, lx: 120, ly: 135, la: 0, lmu: -2.45, lp: 1 }, LANZA_CUELGA, AGM)),
    bebe: C_(Object.assign({ cp: 1, cab: -0.2, torso: -0.05, lp: 1, la: 0, lmu: -2.7 }, LANZA_CUELGA, AGM)),
    deja: C_(Object.assign({ cp: 1, torso: 0.1, cab: 0.05, lp: 1, la: 0, lmu: -2.3 }, LANZA_CUELGA, AGM)),
    libre: C_(Object.assign({ cp: 1, torso: 0.0, lx: 70, ly: 250, la: 0, lmu: -1.75, lp: 1, l0: 0.5, l1: 0.55, l2: 0.5, l3: 0.45, l4: 0.4 }, LANZA_CUELGA,
      { c0: 0.35, c1: 0.35, c2: 0.35, c3: 0.35, c4: 0.35 })),
    apunta: C_(Object.assign({ cp: 1, torso: 0.06, cab: 0.04, pel: 12, cx: 185, cy: 120, ca: -1.45, cmu: -2.6, lp: 1, la: 0, lmu: -2.2 }, AGM)),
    sopla: C_(Object.assign({ cp: 1, torso: -0.03, cab: -0.04, cmu: -2.6, lp: 1, lx: 60, ly: 250, la: 0, lmu: -1.75, l0: 0.5, l1: 0.55, l2: 0.5, l3: 0.45, l4: 0.4 },
      { c0: 0.35, c1: 0.35, c2: 0.35, c3: 0.35, c4: 0.35 })),
    pulgar: C_(Object.assign({ cp: 1, torso: -0.03, cab: -0.06, lx: 195, ly: 160, la: 0, lmu: -3.1, lp: 1, l0: 1, l1: 0, l2: 0, l3: 0, l4: 0 }, LANZA_CUELGA,
      { c0: 0.35, c1: 0.35, c2: 0.35, c3: 0.35, c4: 0.35 })),
    fin: C_(Object.assign({ cp: 1, torso: 0, cab: 0, lx: 80, ly: 220, la: 0, lmu: -1.75, lp: 1, l0: 0.5, l1: 0.55, l2: 0.5, l3: 0.45, l4: 0.4 }, LANZA_CUELGA,
      { c0: 0.35, c1: 0.35, c2: 0.35, c3: 0.35, c4: 0.35 }))
  };
  const GUION_M = [
    [T.mSorbo0, T.mSorbo0 + 0.3, "sorbo"], [T.mSorbo1 - 0.3, T.mSorbo1, "base"], [T.mNota, T.mNota + 0.3, "nota"],
    [T.mBebe0, T.mBebe0 + 0.35, "bebe"], [T.mDeja0 - 0.1, T.mDeja, "deja"], [T.mDeja + 0.05, T.mSube0 + 0.1, "libre"],
    [T.mSube0, T.mSube1, "apunta"], [T.mSopla0, T.mSopla0 + 0.35, "sopla"], [T.mBaja, T.mBaja + 0.35, "libre"],
    [T.mPulgar0, T.mPulgar0 + 0.35, "pulgar"], [T.mPulgar1, T.mPulgar1 + 0.5, "fin"]
  ];

  /* ---------- caras ---------- */
  const BASEC = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, mof: 0 };
  const E = o => Object.assign({}, BASEC, o);
  const CARAS_G = {
    inicio: E({}),
    chulo: E({ mx: -0.85, my: -0.25, sd: 14, gd: 0.14, si: -2, gi: -0.05, orig: 0, sonr: 0.6, ancho: 0.95 }),
    mechero: E({ mx: 0.85, my: 0.3, sd: 8, gd: 0.08, si: 4, gi: 0.04, orig: 0, sonr: 0.5, ancho: 0.9 }),
    enciende: E({ mx: 0.9, my: 0.55, sd: 6, gd: 0.05, si: 6, gi: 0.05, orig: 0, sonr: 0.25, ancho: 0.8, lengua: 0 }),
    guino: E({ mx: -0.85, my: -0.25, ci: 1, h: 1, sd: 16, gd: 0.15, si: 4, gi: 0.05, orig: 0, sonr: 0.85, ancho: 1, abre: 6 }),
    sorpresa: E({ mx: 0.9, my: 0.4, iris: 1.12, sd: 24, gd: 0.15, si: 24, gi: 0.15, orig: 0, abre: 26, ancho: 0.6, sonr: -0.1, lengua: 0.2 }),
    panico: E({ mx: 0.85, my: 0.45, iris: 1.15, sd: 26, gd: 0.25, si: 26, gi: 0.25, orig: 0, abre: 40, ancho: 0.9, sonr: -0.55, lengua: 0.3 }),
    sopla: E({ mx: 0.9, my: 0.4, c: 0.3, sd: 10, gd: 0.1, si: 10, gi: 0.1, orig: 0, abre: 4, ancho: 0.38, sonr: -0.2, mof: 0.9, dientes: 0 }),
    abanica: E({ mx: 0.9, my: 0.45, iris: 1.1, sd: 22, gd: 0.25, si: 22, gi: 0.25, orig: 0, abre: 30, ancho: 0.85, sonr: -0.6, lengua: 0.2 }),
    atras: E({ mx: 0.95, my: 0.1, iris: 1.12, sd: 26, gd: 0.25, si: 26, gi: 0.25, orig: 0, abre: 22, ancho: 0.7, sonr: -0.5 }),
    ve: E({ mx: 0.95, my: 0.05, iris: 0.9, sd: 30, gd: 0.1, si: 30, gi: 0.1, orig: 0, abre: 34, ancho: 0.55, sonr: -0.3, lengua: 0.2 }),
    moja: E({ mx: 0, my: 0, c: 1, z: 1, sd: 6, gd: 0.15, si: 6, gi: 0.15, orig: 0, abre: 0, ancho: 0.6, sonr: -0.5, mof: 0.6 }),
    empapado: E({ mx: -0.8, my: -0.15, c: 0.48, sd: 2, gd: -0.05, si: 2, gi: -0.05, orig: 0, abre: 0, ancho: 0.82, sonr: -0.2 }),
    oreja: E({ mx: -0.6, my: 0.2, c: 0.62, z: 0.4, sd: 8, gd: 0.1, si: -4, gi: -0.1, orig: 0, abre: 6, ancho: 0.6, sonr: -0.3 }),
    mofle: E({ mx: 0.85, my: 0.1, c: 0.4, sd: 6, gd: 0, si: 6, gi: 0, orig: 0, abre: 0, ancho: 0.45, sonr: -0.15, mof: 1, dientes: 0 }),
    escupe: E({ mx: 0.85, my: 0.15, c: 0.45, sd: 8, gd: 0.05, si: 8, gi: 0.05, orig: 0, abre: 8, ancho: 0.32, sonr: -0.1, mof: 0.3, dientes: 0 }),
    final: E({ mx: -0.85, my: -0.2, c: 0.45, sd: 4, gd: -0.05, si: 4, gi: -0.05, orig: 0, abre: 0, ancho: 0.85, sonr: -0.1 })
  };
  const GUION_CARA_G = [
    [T.mira, T.mira + 0.3, "chulo"], [T.saca0 + 0.1, T.saca1, "mechero"], [T.l1a, T.l1a + 0.2, "enciende"], [T.guino - 0.05, T.guino + 0.18, "guino"],
    [T.sorpresa, T.sorpresa + 0.12, "sorpresa"], [T.panico - 0.05, T.panico + 0.2, "panico"], [T.sopla0 - 0.1, T.sopla0 + 0.08, "sopla"],
    [T.sopla1, T.sopla1 + 0.12, "abanica"], [T.atras0 + 0.1, T.atras0 + 0.35, "atras"], [T.gVe, T.gVe + 0.2, "ve"],
    [T.moja - 0.02, T.moja + 0.06, "moja"], [T.cierraJ + 0.05, T.cierraJ + 0.45, "empapado"], [T.oreja0, T.oreja0 + 0.15, "oreja"],
    [T.oreja1, T.oreja1 + 0.3, "empapado"], [T.gMofle0, T.gMofle0 + 0.25, "mofle"], [T.gEscupe - 0.04, T.gEscupe + 0.06, "escupe"],
    [T.gEscupe1, T.gEscupe1 + 0.35, "final"]
  ];
  const CARAS_M = {
    inicio: E({ mx: 0.85, my: 0.1, c: 0.12, orig: 1 }),
    sorbo: E({ mx: 0.85, my: 0.15, c: 0.55, sd: 4, si: 4, orig: 0, abre: 4, ancho: 0.5, sonr: 0.05, dientes: 0 }),
    tranqui: E({ mx: 0.85, my: 0.25, c: 0.35, sd: 2, si: 2, orig: 0, sonr: 0.15, ancho: 0.9 }),
    nota: E({ mx: 0.6, my: 0.3, c: 0.42, sd: 14, gd: 0.1, si: 0, gi: -0.05, orig: 0, sonr: 0.05, ancho: 0.85 }),
    bebe: E({ mx: 0.6, my: -0.35, c: 0.75, sd: 6, si: 6, orig: 0, abre: 6, ancho: 0.5, sonr: 0, dientes: 0 }),
    suspiro: E({ mx: 0.8, my: 0.3, c: 0.45, sd: 6, gd: 0.05, si: 6, gi: 0.05, orig: 0, sonr: 0.05, ancho: 0.85 }),
    apunta: E({ mx: 0.95, my: 0.3, c: 0.3, sd: -6, gd: -0.12, si: -6, gi: -0.12, orig: 0, sonr: 0.12, ancho: 0.85 }),
    vaya: E({ mx: 0.95, my: 0.05, c: 0.2, sd: 16, gd: 0.12, si: 6, gi: 0.05, orig: 0, sonr: 0.3, ancho: 0.85 }),
    sopla: E({ mx: 0.4, my: -0.5, c: 0.55, sd: 10, gd: 0.08, si: 10, gi: 0.08, orig: 0, abre: 6, ancho: 0.36, sonr: 0, dientes: 0 }),
    pulgar: E({ mx: -0.85, my: -0.2, ci: 1, h: 1, sd: 16, gd: 0.12, si: 6, gi: 0.05, orig: 0, sonr: 0.85, ancho: 1, abre: 4 }),
    fin: E({ mx: 0.9, my: 0.1, c: 0.25, sd: 10, gd: 0.08, si: 6, gi: 0.05, orig: 0, sonr: 0.45, ancho: 0.95 })
  };
  const GUION_CARA_M = [
    [T.mSorbo0, T.mSorbo0 + 0.25, "sorbo"], [T.mSorbo1 - 0.2, T.mSorbo1 + 0.1, "tranqui"], [T.mNota, T.mNota + 0.25, "nota"],
    [T.mBebe0, T.mBebe0 + 0.3, "bebe"], [T.mBebe1, T.mBebe1 + 0.25, "suspiro"], [T.mSube0 + 0.2, T.mApunta, "apunta"],
    [T.moja + 0.25, T.moja + 0.5, "vaya"], [T.mSopla0 + 0.1, T.mSopla0 + 0.3, "sopla"], [T.mPulgar0, T.mPulgar0 + 0.3, "pulgar"],
    [T.mPulgar1 - 0.1, T.mPulgar1 + 0.3, "fin"]
  ];
  function parpadeos(lista, t) {
    let o = 0;
    for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); }
    return o;
  }
  const PARP_G = [1.0, 2.2, 3.95, 6.0, 7.2, 9.75, 10.95, 12.65], PARP_M = [0.6, 2.45, 3.6, 6.3, 8.95, 11.2, 12.8];
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: 0,
      ojos: { d: Math.max(e.c, e.cd, parp), i: Math.max(e.c, e.ci, parp), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }

  /* ---------- utilidades ---------- */
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, 0, -1.75), l: punoDesde({ x: 372, y: 648 }, 0, -1.75) };
  // dentro de mano.objeto: dibujar en px de pantalla, derechos, con origen en el centro del puño
  const enPantalla = (g, P, p, m) => { g.scale(1 / P.JK, 1 / P.JK); g.rotate(-(m.ang || 0)); const k = p.s * (P.K || 1); g.scale((p.espejo ? -1 : 1) / k, 1 / k); };
  const dedos = (b, ch) => ({ pulgar: b[ch + "0"], indice: b[ch + "1"], medio: b[ch + "2"], anular: b[ch + "3"], menique: b[ch + "4"] });

  /* ---------- Guillermo ---------- */
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  // empujón del chorro: se va resbalando hacia atrás
  const empuje = t => -34 * suave(fase(t, T.moja, T.moja + 0.75));
  function piesG(t) {
    const paso = campana(t, T.l2a - 0.05, T.l2a + 0.2), vuelta = campana(t, T.vuelve, T.vuelve + 0.25);
    const xl = XG + 18 + 26 * tramo(t, T.l2a - 0.05, T.l2a + 0.2, suave5) * (1 - tramo(t, T.vuelve, T.vuelve + 0.25, suave5));
    const atras = -22 * tramo(t, T.atras0, T.atras0 + 0.3, suave5);
    const e = empuje(t);
    return { cerca: { x: XG - 19 + atras * 0.6 + e, y: TOB_G.cerca - 40 * campana(t, T.atras0, T.atras0 + 0.3), ang: -0.15 * campana(t, T.atras0, T.atras0 + 0.3) },
             lejos: { x: xl + atras + e, y: TOB_G.lejos - 40 * (paso + vuelta) - 30 * campana(t, T.atras0 + 0.1, T.atras0 + 0.4), ang: -0.2 * (paso + vuelta) } };
  }
  // posición del mechero en el puño (px de pantalla): ángulo e inclinación
  const MECH_ANG = 0.95;
  function puntaMechero(fx, fy, a) { return { x: fx + Math.sin(a) * 24, y: fy - Math.cos(a) * 24 }; }
  let poseGCache = new Map();
  function poseG(t) {
    const key = t; if (poseGCache.has(key)) return poseGCache.get(key);
    if (poseGCache.size > 400) poseGCache = new Map();
    const b = guion(GUION_G, CUERPOS_G, t, "bolsillos"), e = guion(GUION_CARA_G, CARAS_G, t, "inicio");
    const respira = Math.sin(t * 2.2);
    const pasoX = 14 * tramo(t, T.l2a, T.l2, suave) * (1 - tramo(t, T.vuelve, T.vuelve + 0.3, suave));
    const atras = -14 * tramo(t, T.atras0, T.atras0 + 0.35, suave);
    const p = {
      x: XG + pasoX + atras + empuje(t), suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.3 }, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      cara: cara(e, parpadeos(PARP_G, t)), tirasLimpias: true, ikContinuo: true, hombrosContinuos: true, hombrosRecortados: true
    };
    const pies = piesG(t);
    for (const lado of ["cerca", "lejos"]) { const f = pies[lado]; p.piernas[lado] = { tob: { x: G.PELVIS.x + (f.x - p.x) / S, y: f.y }, ang: f.ang }; }
    // temblores: pánico, empujón del agua y escalofrío
    const nerv = tramo(t, T.panico, T.panico + 0.2) * (1 - tramo(t, T.atras1, T.moja));
    p.torso += 0.02 * ruido(t * 22) * nerv; p.cabeza.ang += 0.03 * ruido(t * 26 + 4) * nerv;
    const chorro = tramo(t, T.moja, T.moja + 0.08) * (1 - tramo(t, T.cierraJ - 0.1, T.cierraJ + 0.1));
    p.torso += 0.03 * ruido(t * 30 + 2) * chorro; p.cabeza.ang += 0.05 * ruido(t * 34 + 7) * chorro;
    const escalofrio = campana(t, T.cierraJ + 0.15, T.cierraJ + 0.65);
    p.torso += 0.035 * Math.sin(t * 60) * escalofrio; p.cabeza.ang += 0.05 * Math.sin(t * 55 + 1) * escalofrio;
    p.cabeza.ang -= 0.06 * campana(t, T.oreja, T.oreja + 0.3) * Math.sin((t - T.oreja) * 40);   // sacude la cabeza
    p.rojo = 0.45 * tramo(t, T.sopla0, T.sopla0 + 0.3) * (1 - tramo(t, T.abanica1, T.atras1));
    p.cara.rubor = p.rojo * 0.7;
    p.sudor = tramo(t, T.panico, T.panico + 0.4) * (1 - tramo(t, T.moja - 0.1, T.moja));
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    let c = { x: hc.x + b.cx, y: hc.y + b.cy }, l = { x: hl.x + b.lx, y: hl.y + b.ly };
    const bc = Tr(BOLS_G.c), bl = Tr(BOLS_G.l);
    c = mezcla(c, bc, (1 - clamp(b.cp * 1.5)) * (1 - b.cp)); l = mezcla(l, bl, (1 - clamp(b.lp * 1.5)) * (1 - b.lp));
    const H = (q) => G.aHoja(p, q);
    // encender: el puño va donde la punta del mechero toca el borde del chupito
    for (const [ta, tb, i] of [[T.l1a, T.l1, 0], [T.l2a, T.l2, 1]]) {
      const top = { x: X_CHUPI[i] - 9, y: BASE - 22 }, fx = top.x - Math.sin(MECH_ANG) * 24, fy = top.y + Math.cos(MECH_ANG) * 24;
      const k = tramo(t, ta, tb - 0.04) * (1 - tramo(t, tb + 0.08, i === 0 ? T.l2a + 0.02 : T.vuelve + 0.1));
      if (k > 0) l = mezcla(l, H({ x: fx, y: fy }), k);
    }
    // manos a las mejillas (pánico)
    const kp = tramo(t, T.panico - 0.1, T.panico + 0.22) * (1 - tramo(t, T.sopla0 - 0.2, T.sopla0 + 0.1));
    if (kp > 0) {
      const C = G.cabeza(p);
      c = mezcla(c, C.a({ x: 690, y: 700 }), kp); l = mezcla(l, C.a({ x: 945, y: 712 }), kp);
    }
    // abanicar: las dos manos encima de los primeros chupitos, arriba y abajo
    const ka = tramo(t, T.abanica0 - 0.1, T.abanica0 + 0.15) * (1 - tramo(t, T.atras0, T.atras0 + 0.3));
    let abanico = null;
    if (ka > 0) {
      const w = (t - T.abanica0) * 15;
      const qc = H({ x: p.x + 34 + 5 * Math.sin(w + 1.5), y: BASE - 62 - 14 * Math.sin(w + 1.5) });      // la cercana abanica delante del pecho
      const ql = H({ x: X_CHUPI[0] + 4 + 5 * Math.sin(w), y: BASE - 72 - 16 * Math.sin(w) });
      abanico = { k: ka, w };
      c = mezcla(c, qc, ka); l = mezcla(l, ql, ka);
    }
    const giroC = abanico ? 0.35 * abanico.k * Math.cos(abanico.w + 1.5) : 0, giroL = abanico ? 0.35 * abanico.k * Math.cos(abanico.w) : 0;
    p.manoCerca = { x: c.x, y: c.y, ang: b.ca + giroC, mu: b.cmu, dobla: -1, puno: b.cp, dedos: dedos(b, "c") };
    p.manoLejos = { x: l.x, y: l.y, ang: b.la + giroL, mu: b.lmu, dobla: -1, puno: b.lp, dedos: dedos(b, "l") };
    for(const [m,h] of [[p.manoCerca,hc]]){const w=G.rotP({x:Math.cos(m.mu)*G.MUNECA_R*G.JK,y:Math.sin(m.mu)*G.MUNECA_R*G.JK},m.ang),dx=m.x+w.x-h.x,dy=m.y+w.y-h.y,d=Math.hypot(dx,dy),dd=(d+88+Math.sqrt((d-88)**2+4))/2;m.x+=dx*(dd/Math.max(d,.001)-1);m.y+=dy*(dd/Math.max(d,.001)-1);}
    // mechero en la mano lejana
    const conMech = t > T.saca0 + 0.15 && t < T.panico + 0.05;
    if (conMech) {
      const m = p.manoLejos, sale = tramo(t, T.saca0 + 0.15, T.saca0 + 0.35), guarda = 1 - tramo(t, T.panico - 0.15, T.panico + 0.05);
      const llamaK = tramo(t, T.prende, T.prende + 0.12) * (1 - tramo(t, T.cierra, T.cierra + 0.08));
      const inclina = lerp(0.1, MECH_ANG, tramo(t, T.l1a, T.l1a + 0.2) * (1 - tramo(t, T.vuelve, T.vuelve + 0.2)));
      m.objeto = g => { g.save(); enPantalla(g, G, p, m); g.scale(sale * guarda, sale * guarda); mechero(g, t, inclina, llamaK); g.restore(); };
    }
    // capa: pelo mojado y aplastado
    const moj = mojado(t);
    if (moj > 0.001) {
      p.capaCabeza = g => peloMojado(g, t, moj);
      p.capaTronco = g => camisetaMojada(g, t, moj);
    }
    poseGCache.set(key, p);
    return p;
  }

  /* ---------- Marcos ---------- */
  const TOB_M = { cerca: MB.SUELO - MB.TOBILLO_ALTO, lejos: MB.SUELO - MB.TOBILLO_ALTO - 6 };
  const PIES_M = { cerca: -130, lejos: 137 };
  // a dónde apunta el chorro (pantalla)
  function objetivo(t, pg) {
    if (t < BARRIDO[0][0]) { const [, x, y] = BARRIDO[0]; return { x, y }; }
    for (let i = 0; i < BARRIDO.length - 1; i++) {
      const [t0, x0, y0] = BARRIDO[i], [t1, x1, y1] = BARRIDO[i + 1];
      if (t < t1) { const k = suave(fase(t, t0 + 0.04, t1)); return { x: lerp(x0, x1, k), y: lerp(y0, y1, k) }; }
    }
    // después de la barra: sube hasta Guillermo y se queda en él (cara ↔ pecho)
    const ult = BARRIDO[BARRIDO.length - 1];
    const cara = G.aPantalla(pg, G.centroCabeza(pg)), pecho = G.aPantalla(pg, G.tronco(pg)({ x: 255, y: 470 }));
    const enG = mezcla(cara, pecho, 0.5 - 0.5 * Math.cos((t - T.moja) * 9));
    const subeK = suave(fase(t, ult[0] + 0.04, T.moja));
    const haciaPecho = mezcla({ x: ult[1], y: ult[2] }, pecho, suave(fase(t, ult[0] + 0.04, T.moja - 0.12)));
    if (t < T.moja) return mezcla(haciaPecho, cara, suave(fase(t, T.moja - 0.12, T.moja)) * subeK);
    return mezcla(cara, enG, tramo(t, T.moja, T.moja + 0.15));
  }
  const fuerzaChorro = t => tramo(t, T.abre, T.abre + 0.12) * (1 - tramo(t, T.cierra0, T.cierraJ));
  // resuelve largo y ángulo para que el chorro (con su caída) llegue justo al objetivo
  function apuntado(boca, obj) {
    const vx = obj.x - boca.x, vy = obj.y - boca.y;
    const L = (-0.7 * vy + Math.sqrt(0.49 * vy * vy + 3.51 * (vx * vx + vy * vy))) / 1.755;
    return { L, ang: Math.atan2(vy / L - 0.35, vx / L) };
  }
  let poseMCache = new Map();
  function poseM(t, pg) {
    const key = t; if (poseMCache.has(key)) return poseMCache.get(key);
    if (poseMCache.size > 400) poseMCache = new Map();
    const b = guion(GUION_M, CUERPOS_M, t, "base"), e = guion(GUION_CARA_M, CARAS_M, t, "inicio");
    const respira = Math.sin(t * 2.0 + 1.1);
    const p = {
      x: XM, suelo: SUELO, s: S, espejo: true,
      pelvis: { x: MB.PELVIS.x, y: MB.PELVIS.y + b.pel + respira * 1.4 }, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      cara: cara(e, parpadeos(PARP_M, t)), tirasLimpias: true, ikContinuo: true
    };
    for (const lado of ["cerca", "lejos"]) p.piernas[lado] = { tob: { x: MB.PELVIS.x + PIES_M[lado], y: TOB_M[lado] }, ang: 0 };
    // suspiro al dejar el vaso
    p.torsoEsc.y += 0.02 * campana(t, T.mDeja + 0.05, T.mSube0 + 0.2);
    const Tr = MB.tronco(p), hc = Tr(MB.HOMBRO_C), hl = Tr(MB.HOMBRO);
    let c = { x: hc.x + b.cx, y: hc.y + b.cy }, l = { x: hl.x + b.lx, y: hl.y + b.ly };
    const H = q => MB.aHoja(p, q);
    // vaso de leche: a la boca (sorbo y trago largo) y a la barra
    const bocaS = MB.aPantalla(p, MB.boca(p));
    const kS = tramo(t, T.mSorbo0, T.mSorbo0 + 0.3) * (1 - tramo(t, T.mSorbo1 - 0.3, T.mSorbo1));
    const kB = tramo(t, T.mBebe0, T.mBebe0 + 0.35) * (1 - tramo(t, T.mBebe1 - 0.05, T.mDeja0 + 0.05));
    const incV = incVaso(t), rim = { x: -3 + 34 * Math.sin(incV), y: -12 - 34 * Math.cos(incV) };
    const aBoca = { x: bocaS.x - 4 - rim.x, y: bocaS.y + 2 - rim.y };
    l = mezcla(l, H(aBoca), Math.max(kS, kB));
    const kD = tramo(t, T.mDeja0, T.mDeja - 0.03) * (1 - tramo(t, T.mDeja + 0.05, T.mSube0 + 0.1));
    l = mezcla(l, H({ x: X_LECHE + 3, y: BASE + 8 }), kD);
    l.x += 60 * Math.sin(Math.PI*fase(t,T.mBebe0,T.mBebe0+.35)) + 40*Math.sin(Math.PI*fase(t,T.mSorbo1-.3,T.mSorbo1)) + 40*Math.sin(Math.PI*fase(t,T.mSorbo0,T.mSorbo0+.3));
    let ang = b.ca;
    // apuntar: la lanza en la mano cercana; la lejana delante, en la lanza
    const kA = tramo(t, T.mSube0, T.mSube1) * (1 - tramo(t, T.mSopla0, T.mSopla0 + 0.35));
    let chorro = null;
    if (kA > 0) {
      const obj = objetivo(t, pg);
      let a = b.ca;
      const mc = { x: c.x, y: c.y, ang: a, mu: b.cmu };
      for (let it = 0; it < 12; it++) {
        mc.ang = a; const boca = MB.puntoLanza(p, mc, "boca");
        const s = apuntado(boca, obj); a = Math.PI / 2 - s.ang; chorro = { boca, L: s.L };
      }
      a=b.ca+Math.atan2(Math.sin(a-b.ca),Math.cos(a-b.ca));
      ang = lerp(b.ca, a, suave(fase(t, T.mSube0 + 0.15, T.mApunta)));
    }
    // soplar la lanza como un pistolero: la boca de la lanza delante de su boca, apuntando arriba
    const kP = tramo(t, T.mSopla0, T.mSopla0 + 0.35) * (1 - tramo(t, T.mBaja, T.mBaja + 0.35));
    if (kP > 0) {
      const punta = { x: bocaS.x - 22, y: bocaS.y - 10 };
      const a = -Math.PI, ps = H(punta), r = MB.rotP({ x: 0, y: MB.LANZA.BOCA * MB.JK }, a);
      c = mezcla(c, { x: ps.x - r.x, y: ps.y - r.y }, kP);
      ang = lerp(ang, a, kP);
    }
    p.manoCerca = { x: c.x, y: c.y, ang, mu: b.cmu, dobla: -1, puno: b.cp, dedos: dedos(b, "c"), objeto: MB.lanza() };
    p.manoLejos = { x: l.x, y: l.y, ang: b.la, mu: b.lmu, dobla: -1, puno: b.lp, dedos: dedos(b, "l") };
    // la lejana agarra la lanza por delante mientras apunta
    if (kA > 0) {
      const q = MB.puntoLanza(p, p.manoCerca, 20).hoja;
      const kk = tramo(t, T.mSube0 + 0.1, T.mSube1) * (1 - tramo(t, T.mSopla0, T.mSopla0 + 0.3));
      p.manoLejos = { x: lerp(l.x, q.x, kk), y: lerp(l.y, q.y, kk), ang: lerp(b.la, ang, kk), mu: lerp(b.lmu, -2.2, kk), dobla: -1, puno: b.lp,
        dedos: { pulgar: lerp(b.l0, 0.35, kk), indice: lerp(b.l1, 0.35, kk), medio: lerp(b.l2, 0.35, kk), anular: lerp(b.l3, 0.35, kk), menique: lerp(b.l4, 0.35, kk) } };
    }
    // vaso de leche en la mano lejana (hasta dejarlo en la barra)
    if (t < T.mDeja) {
      const m = p.manoLejos, inc = incVaso(t);
      m.objeto = g => { g.save(); enPantalla(g, MB, p, m); g.translate(-3, -12); vasoLeche(g, t, inc); g.restore(); };
    }
    // bigote de leche
    const big = tramo(t, T.mBebe1 - 0.05, T.mBebe1 + 0.15);
    if (big > 0.001) p.capaCabeza = g => bigoteLeche(g, t, big);
    p.chorro = chorro;
    poseMCache.set(key, p);
    return p;
  }
  // inclinación del vaso de leche (positiva: la boca del vaso hacia su cara, que en pantalla está a la derecha)
  const incVaso = t => 1.15 * tramo(t, T.mSorbo0, T.mSorbo0 + 0.3) * (1 - tramo(t, T.mSorbo1 - 0.3, T.mSorbo1)) +
    1.95 * tramo(t, T.mBebe0, T.mBebe0 + 0.4) * (1 - tramo(t, T.mBebe1 - 0.1, T.mBebe1 + 0.2));
  function pose(t) { const g = poseG(t); return { g, m: poseM(t, g) }; }

  /* ---------- objetos ---------- */
  // Llama de cómic (base en el origen, hacia arriba): la misma de 00005.
  function llama(g, t, k, inc, sem, azul = 1) {
    if (k <= 0.01) return;
    const h = 40 * k, w = 13 * Math.min(1.25, k);
    const fl = ruido(t * 9 + sem) * 0.14 + ruido(t * 19 + sem * 3) * 0.07;
    const tx = inc + fl * 22 * k, ty = -h * (1 + fl * 0.6);
    const forma = (sw, sh, dx) => {
      const px = tx * sh / h + dx, py = ty * sh / h;
      g.beginPath(); g.moveTo(-sw, 0);
      g.bezierCurveTo(-sw * 1.25, -sh * 0.42, px * 0.45 - sw * 0.55, -sh * 0.72, px, py);
      g.bezierCurveTo(px * 0.45 + sw * 0.6, -sh * 0.62, sw * 1.25, -sh * 0.4, sw, 0);
      g.quadraticCurveTo(0, sw * 0.55, -sw, 0); g.closePath();
    };
    g.save(); g.lineJoin = "round";
    for (const [lx, s0] of [[-0.7, 1], [0.75, 2]]) {
      const kk = 0.45 + 0.25 * ruido(t * 13 + sem + s0 * 5);
      g.save(); g.translate(lx * w, -h * 0.1); g.scale(0.4, kk);
      forma(w * 0.8, h * 0.9, inc * 0.4); g.fillStyle = "#ff8a1f"; g.fill(); g.lineWidth = 2.6; g.strokeStyle = "#8a2600"; g.stroke(); g.restore();
    }
    forma(w, h, 0); g.fillStyle = "#ff7a1a"; g.fill(); g.lineWidth = 1.5; g.strokeStyle = "#8a2600"; g.stroke();
    forma(w * 0.7, h * 0.72, inc * 0.1); g.fillStyle = "#ffd03a"; g.fill();
    if (azul > 0.01) { g.globalAlpha = azul; g.fillStyle = "#3d8bff"; g.beginPath(); g.ellipse(0, -h * 0.08, w * 0.72, h * 0.17, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
    forma(w * 0.34, h * 0.4, inc * 0.05); g.fillStyle = "#fff6cc"; g.fill();
    g.restore();
  }
  // mechero de gasolina (px de pantalla, origen en el puño): inclinado `inc`, llama `k`
  function mechero(g, t, inc, k) {
    g.save(); g.rotate(inc); g.lineJoin = "round"; g.strokeStyle = TINTA;
    const cuerpo = () => { g.beginPath(); g.roundRect ? g.roundRect(-5.5, -17, 11, 23, 2.5) : g.rect(-5.5, -17, 11, 23); };
    cuerpo(); g.fillStyle = "#c9ced6"; g.fill();
    g.save(); cuerpo(); g.clip(); g.fillStyle = "#8f959f"; g.fillRect(2, -18, 4, 25); g.fillStyle = "rgba(255,255,255,0.8)"; g.fillRect(-4, -15, 1.6, 19); g.restore();
    cuerpo(); g.lineWidth = 1.3; g.stroke();
    g.lineWidth = 0.9; g.beginPath(); g.moveTo(-5.5, -10); g.lineTo(5.5, -10); g.stroke();
    // chimenea y tapa abierta
    g.fillStyle = "#b9bec6"; g.beginPath(); g.rect(-4, -23, 8, 6); g.fill(); g.lineWidth = 1.1; g.stroke();
    g.fillStyle = "#3a3c42"; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(-2 + i * 2, -20, 0.7, 0, Math.PI * 2); g.fill(); }
    const abre = tramo(t, T.clic - 0.08, T.clic + 0.02);
    g.save(); g.translate(5.5, -17); g.rotate(1.9 * abre); g.fillStyle = "#c9ced6"; g.beginPath(); g.rect(-11, -7, 11, 7); g.fill(); g.lineWidth = 1.2; g.stroke(); g.restore();
    g.restore();
    // chispa y llama (siempre hacia arriba)
    const top = { x: Math.sin(inc) * 23, y: -Math.cos(inc) * 23 };
    const ch = fase(t, T.clic, T.clic + 0.14);
    if (ch > 0 && ch < 1) {
      g.save(); g.lineCap = "round";
      for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (hash(i + 3) - 0.5) * 2.4, d0 = 2 + 8 * ch, d1 = d0 + 3 + 3 * hash(i);
        g.globalAlpha = 1 - ch; g.strokeStyle = i % 2 ? "#fff6c0" : "#ffb02e"; g.lineWidth = 1.3;
        g.beginPath(); g.moveTo(top.x + Math.cos(a) * d0, top.y + Math.sin(a) * d0); g.lineTo(top.x + Math.cos(a) * d1, top.y + Math.sin(a) * d1); g.stroke(); }
      g.restore();
    }
    if (k > 0.01) { g.save(); g.translate(top.x, top.y); g.scale(0.34, 0.34); llama(g, t, k * (1 + 0.08 * Math.sin(t * 31)), 0, 7, 0.6); g.restore(); }
  }
  const volumenLeche=t=>lerp(0.85, 0.72, tramo(t, T.mSorbo0 + 0.3, T.mSorbo1 - 0.3)) * (1 - tramo(t, T.mBebe0 + 0.35, T.mBebe1 - 0.15));
  function vasoLeche(g, t, inc) {
    // vaso alto (px de pantalla); inc: inclinación (negativa: hacia la boca, que está a su izquierda en pantalla)
    const vol = volumenLeche(t);
    g.save(); g.rotate(inc); g.lineJoin = "round";
    const cuerpo = () => { g.beginPath(); g.moveTo(-8, -34); g.lineTo(8, -34); g.lineTo(6.5, 4); g.lineTo(-6.5, 4); g.closePath(); };
    cuerpo(); g.fillStyle = "rgba(225,240,250,0.35)"; g.fill();
    if (vol > 0.01) {
      g.save(); cuerpo(); g.clip();
      // superficie horizontal en pantalla: se dibuja girando al revés
      const yS = 4 - 38 * vol;
      g.rotate(-inc); g.fillStyle = "#fbfaf4"; g.fillRect(-40, yS * Math.cos(inc) + 0, 80, 80);
      g.fillStyle = "rgba(200,205,215,0.55)"; g.fillRect(-40, yS * Math.cos(inc) + 1, 80, 2.5);
      g.restore();
    }
    g.save(); cuerpo(); g.clip(); g.fillStyle = "rgba(255,255,255,0.7)"; g.fillRect(-6.5, -31, 2.2, 32); g.restore();
    cuerpo(); g.lineWidth = 1.5; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.ellipse(0, -34, 8, 1.8, 0, 0, Math.PI * 2); g.lineWidth = 1.1; g.stroke();
    g.restore();
  }
  // bigote de leche de Marcos (coordenadas de su retrato, sobre el labio de arriba)
  function bigoteLeche(g, t, k) {
    g.save(); g.translate(856, 664); g.rotate(0.21); g.scale(k, k);
    const blobs = [[-50, 0, 12], [-32, -6, 15], [-12, -8, 16], [9, -8, 16], [29, -6, 15], [47, -1, 12]];
    const camino = () => { g.beginPath(); for (const [x, y, r] of blobs) { g.moveTo(x + r, y); g.arc(x, y, r, 0, Math.PI * 2); } };
    camino(); g.lineWidth = 7; g.strokeStyle = "#5b6470"; g.stroke();
    camino(); g.fillStyle = "#fdfdf8"; g.fill();
    g.fillStyle = "rgba(190,200,215,0.8)"; g.beginPath(); g.ellipse(0, 6, 48, 5, 0, 0, Math.PI); g.fill();
    for (const [x, ln] of [[-26, 9], [18, 12]]) { const l = ln * (0.8 + 0.2 * Math.sin(t * 3 + x));
      g.beginPath(); g.ellipse(x, 8 + l * 0.5, 4, l * 0.6, 0, 0, Math.PI * 2); g.fillStyle = "#fdfdf8"; g.fill(); g.lineWidth = 2.6; g.strokeStyle = "#5b6470"; g.stroke(); }
    g.restore();
  }

  /* ---------- fuego: estado de cada cosa ---------- */
  // tamaño de la llama de cada chupito (avivada al soplar y al abanicar)
  function aviva(t) {
    const sopla = tramo(t, T.sopla0 + 0.05, T.sopla0 + 0.25) * (1 - tramo(t, T.sopla1, T.sopla1 + 0.3));
    const aban = tramo(t, T.abanica0, T.abanica0 + 0.3) * (1 - tramo(t, T.abanica1, T.abanica1 + 0.5));
    return { k: 1 + 0.55 * sopla + 0.35 * aban + 0.25 * aban * Math.sin((t - T.abanica0) * 15), inc: 16 * sopla + 6 * aban * Math.sin((t - T.abanica0) * 15) };
  }
  const llamaChupi = (t, i) => { const tl = PRENDE[i], te = T_APAGA.chupi[i]; return t < tl ? 0 : salida(fase(t, tl, tl + 0.14)) * (1 + 0.3 * Math.exp(-(t - tl) * 7)) * (1 - tramo(t, te, te + 0.07)); };
  const fuegoServ = t => t < T.serv ? 0 : salida(fase(t, T.serv, T.serv + 0.3)) * (1 + 0.5 * tramo(t, T.abanica0, T.abanica1)) * (1 - tramo(t, T_APAGA.serv, T_APAGA.serv + 0.08));
  const fuegoSomb = t => t < T.somb ? 0 : salida(fase(t, T.somb, T.somb + 0.25)) * (1 - 0.35 * tramo(t, T.somb + 1.2, T.somb + 2.2)) * (1 - tramo(t, T_APAGA.somb, T_APAGA.somb + 0.08));
  const fuegoCharco = (t, i) => { const [x, t0] = CHARCOS[i], te = apagaX(x); return t < t0 ? 0 : salida(fase(t, t0, t0 + 0.3)) * (1 - tramo(t, te, te + 0.08)); };

  function chupito(g, x, t, i) {
    g.save(); g.translate(x, BASE); g.lineJoin = "round";
    const cuerpo = () => { g.beginPath(); g.moveTo(-8.5, -23); g.lineTo(8.5, -23); g.lineTo(6.5, 0); g.lineTo(-6.5, 0); g.closePath(); };
    cuerpo(); g.fillStyle = "rgba(220,238,250,0.3)"; g.fill();
    const apagado = t > T_APAGA.chupi[i];
    const nivel = -15 + 3 * tramo(t, PRENDE[i], PRENDE[i] + 3);       // el alcohol se va quemando
    g.save(); cuerpo(); g.clip();
    g.fillStyle = apagado ? "#e9c37a" : "#d9861c"; g.fillRect(-10, nivel, 20, 30);
    g.fillStyle = "rgba(255,240,190,0.6)"; g.fillRect(-10, nivel, 20, 2);
    g.fillStyle = "rgba(255,255,255,0.7)"; g.fillRect(-6.5, -21, 2, 18);
    g.fillStyle = "rgba(235,248,255,0.55)"; g.fillRect(-8, -4, 16, 4);
    g.restore();
    cuerpo(); g.lineWidth = 1.5; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.ellipse(0, -23, 8.5, 1.8, 0, 0, Math.PI * 2); g.lineWidth = 1; g.stroke();
    g.restore();
  }
  function servilleta(g, t) {
    const quema = tramo(t, T.serv, T_APAGA.serv);
    g.save(); g.translate(X_SERV, BASE - 1); g.lineJoin = "round";
    const forma = () => { g.beginPath(); g.moveTo(-17, 0); g.lineTo(13, 0); g.lineTo(18, -6 + 2 * quema); g.lineTo(-12, -6 + 1 * quema); g.closePath(); };
    forma(); g.fillStyle = "#f4f1ea"; g.fill();
    g.save(); forma(); g.clip();
    g.fillStyle = "rgba(200,190,175,0.6)"; g.fillRect(-20, -3.5, 40, 1.2);
    if (quema > 0) { g.fillStyle = "#1d1714"; g.beginPath(); g.ellipse(-4, -3, 30 * quema, 6, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#4a3a30"; g.beginPath(); g.ellipse(-4, -3, 30 * quema + 3, 7, 0, 0, Math.PI * 2); g.globalCompositeOperation = "destination-over"; g.fill(); }
    g.restore();
    forma(); g.lineWidth = 1.3; g.strokeStyle = TINTA; g.stroke();
    // brasas después de apagada
    const br = t > T_APAGA.serv ? Math.exp(-(t - T_APAGA.serv) * 1.5) : 0;
    if (br > 0.02) { g.fillStyle = `rgba(255,120,30,${br})`; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-12 + i * 8, -2 - (i % 2), 1.4, 0, Math.PI * 2); g.fill(); } }
    g.restore();
  }
  function copaSombrilla(g, t) {
    const quema = tramo(t, T.somb, T.somb + 1.6);
    g.save(); g.translate(X_COPA, BASE); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = TINTA;
    // copa de cóctel
    g.fillStyle = "rgba(220,238,250,0.35)"; g.beginPath(); g.ellipse(0, -1, 9, 2.2, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.2; g.stroke();
    g.beginPath(); g.moveTo(-0.9, -1); g.lineTo(-0.9, -16); g.lineTo(0.9, -16); g.lineTo(0.9, -1); g.closePath(); g.fill(); g.stroke();
    const cono = () => { g.beginPath(); g.moveTo(-15, -34); g.lineTo(15, -34); g.lineTo(0, -15); g.closePath(); };
    cono(); g.fillStyle = "rgba(220,238,250,0.3)"; g.fill();
    g.save(); cono(); g.clip(); g.fillStyle = t > T_APAGA.somb ? "#8fd3e8" : "#2fa7d8"; g.fillRect(-16, -30, 32, 20); g.fillStyle = "rgba(255,255,255,0.6)"; g.fillRect(-16, -30, 32, 1.5); g.restore();
    cono(); g.lineWidth = 1.4; g.stroke();
    // sombrilla de papel: palillo y tela (se quema hasta quedar las varillas)
    g.save(); g.translate(-4, -30); g.rotate(-0.42);
    g.lineWidth = 1.2; g.strokeStyle = "#7a5a2a"; g.beginPath(); g.moveTo(0, 8); g.lineTo(0, -22); g.stroke();
    const tela = 1 - quema;
    g.translate(0, -22);
    if (tela > 0.02) {
      g.save(); g.scale(tela, 0.7 + 0.3 * tela);
      g.beginPath(); g.moveTo(-14, 0); g.quadraticCurveTo(0, -12, 14, 0); g.closePath();
      g.fillStyle = quema > 0.05 ? `rgb(${Math.round(lerp(240, 60, quema))},${Math.round(lerp(98, 40, quema))},${Math.round(lerp(150, 40, quema))})` : "#f062a0"; g.fill();
      g.lineWidth = 1.2; g.strokeStyle = TINTA; g.stroke();
      g.strokeStyle = "rgba(255,255,255,0.6)"; g.lineWidth = 0.8; for (const x of [-7, 0, 7]) { g.beginPath(); g.moveTo(0, -6); g.lineTo(x, -1); g.stroke(); }
      g.restore();
    }
    if (quema > 0.05) { g.strokeStyle = "#2a1d14"; g.lineWidth = 1; for (const x of [-12, -6, 0, 6, 12]) { g.beginPath(); g.moveTo(0, -5); g.lineTo(x * (0.4 + 0.6 * quema), x === 0 ? -6 : -1); g.stroke(); } }
    g.restore();
    g.restore();
  }
  // punta de la sombrilla (donde arde) en pantalla
  const SOMB_PUNTA = (() => { const a = -0.42, c = Math.cos(a), s = Math.sin(a); return { x: X_COPA - 4 + (-(-22) * s), y: BASE - 30 + (-22) * c }; })();
  function vasoLecheBarra(g, t) {
    if (t < T.mDeja) return;
    g.save(); g.translate(X_LECHE, BASE - 4); vasoLeche(g,t,0); g.restore();
  }

  /* ---------- efectos ---------- */
  function salto(g, t, t0, a, b) {      // bola de fuego que salta de una llama a otra
    const k = fase(t, t0 - 0.14, t0); if (k <= 0 || k >= 1) return;
    const x = lerp(a.x, b.x, k), y = lerp(a.y, b.y, k) - 26 * Math.sin(Math.PI * k);
    g.save(); g.translate(x, y); g.rotate(Math.atan2(b.y - a.y - 26 * Math.PI * Math.cos(Math.PI * k), b.x - a.x) + Math.PI / 2);
    g.scale(0.32, 0.32); llama(g, t, 1, 0, 11 + t0, 0); g.restore();
    g.save(); g.lineCap = "round";
    for (let i = 1; i <= 4; i++) { const kk = clamp(k - i * 0.08); if (kk <= 0) continue;
      const xx = lerp(a.x, b.x, kk), yy = lerp(a.y, b.y, kk) - 26 * Math.sin(Math.PI * kk);
      g.globalAlpha = 0.8 - i * 0.18; g.fillStyle = i % 2 ? "#ffd03a" : "#ff7a1a"; g.beginPath(); g.arc(xx, yy, 2.6 - i * 0.4, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  function brillo(g, x, y, k, r = 70) {
    if (k <= 0.01) return;
    const gr = g.createRadialGradient(x, y, 2, x, y, r); gr.addColorStop(0, `rgba(255,170,70,${0.32 * Math.min(1.4, k)})`); gr.addColorStop(1, "rgba(255,140,40,0)");
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  function humo(g, t) {
    const f = Math.max(fuegoServ(t), fuegoSomb(t) * 0.8);
    const vivo = tramo(t, T.serv, T.serv + 0.5) * (1 - tramo(t, T_APAGA.somb + 0.2, T_APAGA.somb + 1.2));
    if (vivo <= 0.01) return;
    g.save();
    for (let i = 0; i < 9; i++) {
      const ph = ((t - T.serv) * 0.42 + i / 9) % 1, x0 = i % 2 ? X_SERV : SOMB_PUNTA.x;
      const x = x0 + Math.sin(t * 1.3 + i * 2) * 10 + ph * 26 - 8, y = BASE - 30 - ph * 210;
      g.globalAlpha = Math.sin(Math.PI * ph) * 0.42 * vivo * (0.6 + 0.4 * f); g.fillStyle = i % 3 ? "#7d7570" : "#5f5853";
      g.beginPath(); g.arc(x, y, 9 + 26 * ph, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  function vapores(g, t) {           // nubecitas de vapor donde el agua apaga cada llama
    const puntos = [[T_APAGA.somb, SOMB_PUNTA.x, SOMB_PUNTA.y - 4], [T_APAGA.serv, X_SERV, BASE - 6]];
    X_CHUPI.forEach((x, i) => puntos.push([T_APAGA.chupi[i], x, BASE - 26]));
    CHARCOS.forEach(([x]) => puntos.push([apagaX(x), x, BASE - 4]));
    g.save();
    for (const [t0, x, y] of puntos) {
      const k = fase(t, t0, t0 + 1.1); if (k <= 0 || k >= 1) continue;
      for (let j = 0; j < 3; j++) {
        const kk = clamp(k * 1.2 - j * 0.12); if (kk <= 0) continue;
        g.globalAlpha = (1 - kk) * 0.75; g.fillStyle = "#f2f5f7";
        g.beginPath(); g.arc(x + (j - 1) * 7 + Math.sin(t * 4 + j) * 3, y - 8 - 46 * salida(kk) - j * 5, 6 + 14 * kk, 0, Math.PI * 2); g.fill();
      }
      // chisporroteo
      if (k < 0.25) { g.globalAlpha = 1 - k / 0.25; g.strokeStyle = "#ffffff"; g.lineWidth = 1.6; g.lineCap = "round";
        for (let j = 0; j < 5; j++) { const a = -Math.PI / 2 + (j - 2) * 0.5, r0 = 8 + 16 * k; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * (r0 + 6), y + Math.sin(a) * (r0 + 6)); g.stroke(); } }
    }
    g.restore();
  }
  function soplido(g, t, pg) {      // rayitas de aire al soplar (Guillermo al fuego, Marcos a la lanza)
    const k = tramo(t, T.sopla0 + 0.02, T.sopla0 + 0.15) * (1 - tramo(t, T.sopla1 - 0.1, T.sopla1 + 0.05));
    if (k > 0.01) {
      const b = G.aPantalla(pg, G.boca(pg));
      g.save(); g.strokeStyle = `rgba(235,245,255,${0.85 * k})`; g.lineWidth = 2.2; g.lineCap = "round";
      for (let i = 0; i < 4; i++) { const ph = ((t * 3 + i * 0.25) % 1), y = b.y + 6 + (i - 1.5) * 7, x0 = b.x + 10 + ph * 70;
        g.globalAlpha = Math.sin(Math.PI * ph) * k; g.beginPath(); g.moveTo(x0, y + ph * 8); g.lineTo(x0 + 18, y + ph * 10); g.stroke(); }
      g.restore();
    }
  }
  // agua que salpica donde pega el chorro
  function salpicaduras(g, t, q, k, sem) {
    if (k <= 0.01) return;
    g.save(); g.lineWidth = 1.4; g.strokeStyle = "rgba(20,70,120,0.85)";
    for (let i = 0; i < 12; i++) {
      const ph = (t * 3.2 + hash(i + sem)) % 1, a = -Math.PI / 2 + (hash(i * 7 + sem) - 0.5) * 2.8;
      const d = 6 + 60 * ph * (0.6 + 0.6 * hash(i + 3)), x = q.x + Math.cos(a) * d, y = q.y + Math.sin(a) * d + 120 * ph * ph;
      g.globalAlpha = (1 - ph) * k; g.fillStyle = i % 3 ? "#bfe8ff" : "#ffffff";
      g.beginPath(); g.arc(x, y, 2 + 2.4 * hash(i + 11), 0, Math.PI * 2); g.fill(); g.stroke();
    }
    g.restore();
  }

  /* ---------- Guillermo mojado ---------- */
  const mojado = t => tramo(t, T.moja + 0.02, T.moja + 0.22);
  // Pelo aplastado: casquete de pelo mojado (coordenadas del retrato). Las púas que sobresalen se borran
  // repintando el fondo encima (solo en la zona de fuera de la cabeza, la piel y la frente).
  const PIEL = [956,503,938,501,918,520,896,531,895,526,907,504,907,491,894,491,867,505,845,509,873,470,873,457,854,448,853,442,830,439,824,431,801,432,799,438,779,437,729,464,736,428,723,428,679,454,676,477,649,496,635,536,629,543,624,542,619,526,589,500,572,499,556,507,544,522,531,568,530,593,539,614,572,657,572,664,527,801,521,812,492,833,492,853,738,853,738,847,704,811,705,806,741,830,769,840,767,853,801,853,802,845,812,843,822,835,907,719,932,645,954,612,954,594,892,588,891,583,896,578,941,581,947,587,960,586,964,518,957,516];
  const CUP = [[536,610],[522,540],[524,470],[542,410],[574,360],[625,316],[694,286],[775,270],[860,272],[940,294],[1006,332],[1050,382],[1068,440],[1062,500]];
  const FLEQUILLO = [[1062,500],[1042,552],[1028,522],[1004,570],[984,526],[954,566],[934,522],[902,556],[882,515],[848,540],[826,498],[792,515],[770,478],[728,486],[690,466],[656,488],[642,530],[632,575],[618,528],[598,505],[574,502],[556,520],[546,560]];
  const FRENTE = [[640,482],[720,452],[830,452],[930,470],[985,500],[1000,570],[960,615],[640,600]];
  const CAJA = [[200,20],[1400,20],[1400,690],[200,690]];
  const CENTRO_C = { x: 800, y: 470 };
  const PUNTAS = [[1004, 570], [954, 566], [902, 556], [848, 540], [632, 575]];      // de aquí gotea
  let MATRIZ = null, fondo = null;
  function ruta(g, pts) { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); }
  function rutaPiel(g) { g.moveTo(PIEL[0], PIEL[1]); for (let i = 2; i < PIEL.length; i += 2) g.lineTo(PIEL[i], PIEL[i + 1]); g.closePath(); }
  function casquete(k) {           // k: 0 = tan grande que no borra nada, 1 = aplastado
    const e = lerp(1.65, 1, k);
    return CUP.map(([x, y]) => ({ x: CENTRO_C.x + (x - CENTRO_C.x) * e, y: CENTRO_C.y + (y - CENTRO_C.y) * e })).concat(FLEQUILLO.map(([x, y]) => ({ x, y })));
  }
  function peloMojado(g, t, k) {
    // 1) borrar las púas: repinta el fondo fuera de (casquete ∪ piel ∪ frente)
    if (MATRIZ && fondo) {
      const cas = casquete(k);
      g.save();
      g.beginPath(); ruta(g, CAJA); M2.curva(g, cas, true, 0.35); g.clip("evenodd");
      g.beginPath(); ruta(g, CAJA); rutaPiel(g); g.clip("evenodd");
      g.beginPath(); ruta(g, CAJA); ruta(g, FRENTE); g.clip("evenodd");
      g.setTransform(MATRIZ); g.drawImage(fondo, -40, -60);
      g.restore();
    }
    // 2) el pelo mojado, oscuro y brillante, pegado a la cabeza
    const cas = casquete(1), cam = () => { g.beginPath(); M2.curva(g, cas, true, 0.35); };
    g.save(); g.globalAlpha = k; g.lineJoin = "round"; g.lineCap = "round";
    cam(); g.fillStyle = "#3a2312"; g.fill();
    g.save(); cam(); g.clip();
    g.fillStyle = "#28170a"; g.beginPath(); g.ellipse(600, 470, 110, 200, -0.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#4a2d16"; g.beginPath(); g.ellipse(880, 360, 170, 70, 0.15, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(255,240,215,0.62)"; g.lineWidth = 13; g.beginPath(); g.moveTo(660, 320); g.quadraticCurveTo(810, 262, 960, 322); g.stroke();
    g.lineWidth = 7; g.strokeStyle = "rgba(255,240,215,0.38)"; g.beginPath(); g.moveTo(585, 390); g.quadraticCurveTo(560, 440, 565, 500); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.75)"; for (const [x, y, r] of [[720, 300, 5], [905, 312, 4], [1010, 372, 4]]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = "rgba(0,0,0,0.5)"; g.lineWidth = 4;
    for (const [a, b, c, d] of [[700, 296, 770, 470], [790, 280, 830, 500], [880, 288, 915, 530], [960, 318, 1000, 540], [1020, 360, 1040, 520], [630, 330, 640, 500], [580, 380, 570, 520]]) {
      g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo((a + c) / 2 + 18, (b + d) / 2, c, d); g.stroke(); }
    g.restore();
    cam(); g.lineWidth = 7; g.strokeStyle = TINTA; g.stroke();
    // gotitas colgando de las puntas del flequillo, la nariz y la barbilla
    const gotas = PUNTAS.concat([[968, 690], [826, 846], [590, 650]]);
    gotas.forEach(([x, y], i) => {
      const per = 0.55 + 0.25 * hash(i + 40), ph = ((t - T.moja) / per + hash(i + 50)) % 1, r = 4 + 10 * ph;
      g.fillStyle = "#cdeeff"; g.strokeStyle = "#1d3b52"; g.lineWidth = 3;
      g.beginPath(); g.moveTo(x - r * 0.6, y); g.quadraticCurveTo(x, y + r * 2.2, x + r * 0.6, y); g.closePath(); g.fill(); g.stroke();
    });
    g.restore();
  }
  function camisetaMojada(g, t, k) {
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    // brillos de tela mojada: tres regueros que bajan ondulando y gotitas
    g.globalAlpha = 0.42 * k; g.strokeStyle = "rgba(170,205,235,0.9)";
    for (const [x0, y0, L, w, f] of [[196, 340, 220, 5, 0], [262, 330, 180, 4, 2], [310, 380, 150, 3.5, 4]]) {
      g.lineWidth = w; g.beginPath();
      for (let i = 0; i <= 12; i++) { const u = i / 12, x = x0 + 7 * Math.sin(u * 7 + f + t * 1.5) * u, y = y0 + L * u; if (i) g.lineTo(x, y); else g.moveTo(x, y); }
      g.stroke();
    }
    g.globalAlpha = 0.7 * k; g.fillStyle = "rgba(255,255,255,0.85)";
    for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(160 + hash(i + 70) * 180, 330 + hash(i + 80) * 260, 2.5 + 2.5 * hash(i), 3.5 + 3 * hash(i), 0, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // gotas que caen de Guillermo y del pelo al suelo (pantalla); y el charco
  const FUENTES = [[1004, 570], [902, 556], [968, 690], [826, 846], [590, 650]];
  function goteo(g, t) {
    if (t < T.cierraJ - 0.2) return;
    g.save(); g.strokeStyle = "#1d3b52"; g.lineWidth = 1.3;
    FUENTES.forEach(([x, y], i) => {
      const per = 0.55 + 0.25 * hash(i + 40), fase0 = hash(i + 50);
      const n = Math.floor((t - T.moja) / per + fase0);
      for (let j = n - 2; j <= n; j++) {
        const tsuelta = T.moja + (j + 1 - fase0) * per;           // cuando la gota se suelta de la punta
        if (tsuelta > t || tsuelta < T.cierraJ - 0.2) continue;
        const pg = poseG(tsuelta), q = G.aPantalla(pg, G.cabeza(pg).a({ x, y: y + 18 }));
        const dt = t - tsuelta, yy = q.y + 0.5 * 1500 * dt * dt;
        if (yy > SUELO + 2) continue;
        g.fillStyle = "#cdeeff"; g.beginPath(); g.ellipse(q.x, yy, 1.8, 2.6 + dt * 6, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      }
    });
    g.restore();
  }
  function charco(g, t, pg) {
    const k = tramo(t, T.moja + 0.1, T.cierraJ + 0.6, salida);
    if (k <= 0.01) return;
    const x = pg.x + 6, rx = 26 + 70 * k, ry = 4 + 6 * k;
    g.save();
    g.fillStyle = "rgba(120,190,235,0.55)"; g.beginPath(); g.ellipse(x, SUELO + 3, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(20,70,120,0.7)"; g.lineWidth = 1.4; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.ellipse(x - rx * 0.35, SUELO + 1.5, rx * 0.25, ry * 0.25, 0, 0, Math.PI * 2); g.fill();
    // ondas de las gotas que caen
    for (let i = 0; i < 3; i++) { const ph = (t * 1.6 + i / 3) % 1, xx = x + (hash(i + Math.floor(t * 1.6 + i / 3) * 3) - 0.5) * rx;
      g.globalAlpha = (1 - ph) * k; g.strokeStyle = "rgba(255,255,255,0.8)"; g.beginPath(); g.ellipse(xx, SUELO + 3, 3 + 12 * ph, 1 + 3 * ph, 0, 0, Math.PI * 2); g.stroke(); }
    g.restore();
  }
  // chorrito por la oreja y chorrito escupido (pantalla)
  function chorrito(g, t, t0, t1, q, vx, vy, grosor) {
    const k = fase(t, t0, t1); if (k <= 0 || k >= 1) return;
    const sale = clamp(k * 3), corta = clamp((k - 0.6) / 0.4);
    const pts = []; const n = 16;
    for (let i = 0; i <= n; i++) { const u = lerp(corta, sale, i / n) * 0.5; pts.push({ x: q.x + vx * u, y: q.y + vy * u + 0.5 * 1400 * u * u }); }
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); M2.curva(g, pts, false, 0.5); g.strokeStyle = "rgba(20,70,120,0.9)"; g.lineWidth = grosor + 2.6; g.stroke();
    g.beginPath(); M2.curva(g, pts, false, 0.5); g.strokeStyle = "rgba(170,225,255,0.95)"; g.lineWidth = grosor; g.stroke();
    g.beginPath(); M2.curva(g, pts, false, 0.5); g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = grosor * 0.3; g.stroke();
    const f = pts[pts.length - 1];
    g.fillStyle = "#cdeeff"; g.strokeStyle = "rgba(20,70,120,0.9)"; g.lineWidth = 1.3;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(f.x + (i - 1) * 4, f.y + 3 + 3 * hash(i + t0), 1.8 + hash(i), 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.restore();
  }

  /* ---------- decorado: saloon ---------- */
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60);
    // pared de tablones
    const pared = g.createLinearGradient(0, -60, 0, 420); pared.addColorStop(0, "#3e2614"); pared.addColorStop(1, "#6e4626");
    g.fillStyle = pared; g.fillRect(-40, -60, W + 80, 500);
    for (let x = -40, i = 0; x < W + 40; x += 38, i++) {
      g.fillStyle = `rgba(${i % 3 ? 0 : 255},${i % 3 ? 0 : 220},${i % 3 ? 0 : 160},${i % 3 ? 0.06 + 0.05 * hash(i) : 0.03})`; g.fillRect(x, -60, 38, 500);
      g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(x, -60, 2, 500);
      g.fillStyle = "rgba(0,0,0,0.4)"; for (const y of [30 + 60 * hash(i), 250 + 50 * hash(i + 9)]) { g.beginPath(); g.arc(x + 19, y, 1.6, 0, Math.PI * 2); g.fill(); }
      g.strokeStyle = "rgba(0,0,0,0.12)"; g.lineWidth = 1; g.beginPath(); g.ellipse(x + 12 + 14 * hash(i + 3), 120 + 200 * hash(i + 5), 3, 9, 0, 0, Math.PI * 2); g.stroke();
    }
    // luz cálida de los quinqués
    for (const lx of [150, 900]) { const h = g.createRadialGradient(lx, 150, 10, lx, 160, 300); h.addColorStop(0, "rgba(255,200,110,0.45)"); h.addColorStop(1, "rgba(255,180,90,0)"); g.fillStyle = h; g.fillRect(lx - 320, -60, 640, 500); }
    // puertas batientes del saloon, a la izquierda (luz de fuera entre las lamas)
    g.save(); g.translate(40, 0);
    g.fillStyle = "#f6d99a"; g.fillRect(0, 110, 150, 300);
    const luz = g.createLinearGradient(0, 110, 0, 410); luz.addColorStop(0, "rgba(255,240,200,0.9)"); luz.addColorStop(1, "rgba(240,190,120,0.9)"); g.fillStyle = luz; g.fillRect(0, 110, 150, 300);
    g.lineWidth = 6; g.strokeStyle = "#2a170b"; g.strokeRect(0, 110, 150, 300);
    for (const [x0, w] of [[6, 66], [78, 66]]) {
      g.fillStyle = "#7a4a26"; g.beginPath(); g.moveTo(x0, 190); g.quadraticCurveTo(x0 + w / 2, 176, x0 + w, 190); g.lineTo(x0 + w, 330); g.lineTo(x0, 330); g.closePath(); g.fill();
      g.lineWidth = 3; g.strokeStyle = "#2a170b"; g.stroke();
      g.strokeStyle = "rgba(0,0,0,0.45)"; g.lineWidth = 2; for (let y = 200; y < 322; y += 11) { g.beginPath(); g.moveTo(x0 + 6, y); g.lineTo(x0 + w - 6, y); g.stroke(); }
      g.fillStyle = "#c9a14a"; g.beginPath(); g.arc(x0 + (x0 < 40 ? w - 4 : 4), 260, 3, 0, Math.PI * 2); g.fill();
    }
    g.restore();
    // trasera de la barra: espejo grande y estantes con botellas
    g.save(); g.translate(380, 40);
    g.fillStyle = "#2b190c"; g.fillRect(-14, -14, 336, 196); g.lineWidth = 4; g.strokeStyle = TINTA; g.strokeRect(-14, -14, 336, 196);
    const esp = g.createLinearGradient(0, 0, 308, 168); esp.addColorStop(0, "#8fa3a6"); esp.addColorStop(0.5, "#b8c6c4"); esp.addColorStop(1, "#7d9093"); g.fillStyle = esp; g.fillRect(0, 0, 308, 168);
    g.strokeStyle = "rgba(255,255,255,0.45)"; g.lineWidth = 10; g.beginPath(); g.moveTo(40, 160); g.lineTo(120, 10); g.stroke(); g.lineWidth = 4; g.beginPath(); g.moveTo(140, 160); g.lineTo(200, 40); g.stroke();
    g.lineWidth = 3; g.strokeStyle = TINTA; g.strokeRect(0, 0, 308, 168);
    // remate tallado
    g.fillStyle = "#3b2312"; g.beginPath(); g.moveTo(-20, -14); g.quadraticCurveTo(154, -60, 328, -14); g.closePath(); g.fill(); g.lineWidth = 3; g.stroke();
    g.fillStyle = "#c9a14a"; g.beginPath(); g.arc(154, -30, 7, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
    // estante de botellas bajo el espejo
    g.fillStyle = "#3b2312"; g.fillRect(360, 238, 370, 10); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.strokeRect(360, 238, 370, 10);
    const COLS = ["#2f6b3a", "#7a2a1c", "#c79a2e", "#3a4f7a", "#5a2a5a", "#8a6a2a", "#2f6b3a", "#9a3a2a", "#c7c2b0", "#4a6a2a"];
    for (let i = 0; i < 12; i++) {
      const x = 375 + i * 29, h = 34 + 14 * hash(i + 20), col = COLS[i % COLS.length];
      g.fillStyle = col; g.strokeStyle = TINTA; g.lineWidth = 1.8;
      g.beginPath(); g.moveTo(x - 7, 238); g.lineTo(x - 7, 238 - h * 0.6); g.quadraticCurveTo(x - 7, 238 - h * 0.75, x - 3, 238 - h * 0.8); g.lineTo(x - 3, 238 - h); g.lineTo(x + 3, 238 - h); g.lineTo(x + 3, 238 - h * 0.8);
      g.quadraticCurveTo(x + 7, 238 - h * 0.75, x + 7, 238 - h * 0.6); g.lineTo(x + 7, 238); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(x - 5, 238 - h * 0.55, 2, h * 0.45);
      g.fillStyle = "#e9dcc0"; g.fillRect(x - 5, 238 - h * 0.42, 10, 8);
    }
    // quinqués de pared
    for (const lx of [150, 900]) {
      g.save(); g.translate(lx, 150);
      g.strokeStyle = TINTA; g.lineWidth = 3; g.beginPath(); g.moveTo(-18, 20); g.lineTo(0, 20); g.lineTo(0, -6); g.stroke();
      g.fillStyle = "#c9a14a"; g.beginPath(); g.ellipse(0, 12, 12, 5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,235,180,0.85)"; g.beginPath(); g.moveTo(-9, 8); g.quadraticCurveTo(-14, -14, -6, -26); g.lineTo(6, -26); g.quadraticCurveTo(14, -14, 9, 8); g.closePath(); g.fill(); g.lineWidth = 2; g.stroke();
      g.fillStyle = "#ffd36a"; g.beginPath(); g.ellipse(0, -6, 3.5, 7, 0, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    // herradura y cactus
    g.save(); g.translate(990, 120); g.strokeStyle = TINTA; g.lineWidth = 9; g.lineCap = "round"; g.beginPath(); g.arc(0, 0, 16, 0.35, Math.PI * 2 - 0.35 + Math.PI, false); g.stroke();
    g.strokeStyle = "#9aa0a8"; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 16, Math.PI * 0.6, Math.PI * 2.4); g.stroke(); g.restore();
    g.save(); g.translate(975, SUELO);
    g.fillStyle = "#a0522d"; g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-26, -40); g.lineTo(26, -40); g.lineTo(20, 0); g.lineTo(-20, 0); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#4f8a3a"; g.lineWidth = 2.5;
    const brazo = (x, y, w, h) => { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, w / 2) : g.rect(x, y, w, h); g.fill(); g.stroke(); };
    brazo(-11, -150, 22, 112); brazo(-34, -118, 14, 46); brazo(-34, -82, 26, 12); brazo(20, -132, 14, 52); brazo(8, -92, 26, 12);
    g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = 1.2; for (const x of [-4, 4]) { g.beginPath(); g.moveTo(x, -145); g.lineTo(x, -42); g.stroke(); }
    g.restore();
    // suelo de tablas
    const su = g.createLinearGradient(0, SUELO - 10, 0, H + 60); su.addColorStop(0, "#5a3a1e"); su.addColorStop(1, "#2a170b");
    g.fillStyle = "#3a2312"; g.fillRect(-40, 420, W + 80, SUELO - 420);
    g.fillStyle = "#24150a"; g.fillRect(-40, SUELO - 14, W + 80, 14);
    g.fillStyle = su; g.fillRect(-40, SUELO, W + 80, H + 60 - SUELO);
    g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = 2;
    for (let i = 0; i < 4; i++) { const y = SUELO + 10 + i * i * 8 + i * 6; g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); }
    for (let x = -60; x < W + 80; x += 84) { g.beginPath(); g.moveTo(x, SUELO); g.lineTo(x + (x - 512) * 0.35, H + 60); g.stroke(); }
    g.fillStyle = "rgba(255,210,150,0.14)"; g.fillRect(-40, SUELO, W + 80, 2);
    // la barra: frente de paneles, barra de latón para los pies y tablero
    g.save();
    const fr = g.createLinearGradient(0, BFRENTE, 0, SUELO); fr.addColorStop(0, "#6b3e1f"); fr.addColorStop(1, "#3e220f");
    g.fillStyle = fr; g.fillRect(BX0, BFRENTE, BX1 - BX0, SUELO - BFRENTE); g.lineWidth = 3; g.strokeStyle = TINTA; g.strokeRect(BX0, BFRENTE, BX1 - BX0, SUELO - BFRENTE);
    for (let i = 0; i < 4; i++) { const x = BX0 + 14 + i * (BX1 - BX0 - 28) / 4, w = (BX1 - BX0 - 28) / 4 - 10;
      g.strokeStyle = "rgba(0,0,0,0.5)"; g.lineWidth = 3; g.strokeRect(x + 5, BFRENTE + 26, w, SUELO - BFRENTE - 70);
      g.strokeStyle = "rgba(255,210,150,0.15)"; g.lineWidth = 1.5; g.strokeRect(x + 9, BFRENTE + 30, w - 8, SUELO - BFRENTE - 78);
      g.fillStyle = "rgba(255,200,140,0.06)"; g.fillRect(x + 9, BFRENTE + 30, w - 8, 20); }
    g.fillStyle = "#c9a14a"; g.fillRect(BX0 - 6, SUELO - 32, BX1 - BX0 + 12, 6); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(BX0 - 6, SUELO - 32, BX1 - BX0 + 12, 6);
    g.fillStyle = "rgba(255,255,255,0.45)"; g.fillRect(BX0 - 6, SUELO - 31, BX1 - BX0 + 12, 1.5);
    for (const x of [BX0 + 40, (BX0 + BX1) / 2, BX1 - 40]) { g.fillStyle = "#c9a14a"; g.fillRect(x - 3, SUELO - 28, 6, 18); g.strokeRect(x - 3, SUELO - 28, 6, 18); }
    // tablero (con un poco de perspectiva)
    g.fillStyle = "#4a2a12"; g.beginPath(); g.moveTo(BX0 - 10, BFRENTE); g.lineTo(BX0 - 2, BTOP); g.lineTo(BX1 + 2, BTOP); g.lineTo(BX1 + 10, BFRENTE); g.closePath(); g.fill();
    g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "#7a4520"; g.fillRect(BX0 - 10, BFRENTE, BX1 - BX0 + 20, 8); g.strokeRect(BX0 - 10, BFRENTE, BX1 - BX0 + 20, 8);
    g.fillStyle = "rgba(255,220,170,0.35)"; g.fillRect(BX0 - 8, BFRENTE + 1, BX1 - BX0 + 16, 1.5);
    g.fillStyle = "rgba(255,220,170,0.12)"; g.beginPath(); g.moveTo(BX0 + 20, BTOP + 3); g.lineTo(BX1 - 40, BTOP + 3); g.lineTo(BX1 - 50, BTOP + 7); g.lineTo(BX0 + 14, BTOP + 7); g.closePath(); g.fill();
    g.restore();
    // viñeta
    const v = g.createRadialGradient(512, 300, 320, 512, 300, 700); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.5)");
    g.fillStyle = v; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const fuego = tramo(t, T.serv, T.panico + 0.5) * (1 - tramo(t, T.abre, T.abre + 0.5));
    const final = tramo(t, T.cierraJ + 0.3, T.fin, suave);
    return { k: 1 + 0.04 * fuego + 0.04 * final, x: 512 + 20 * fuego - 25 * final, y: 300 + 6 * fuego + 10 * final };
  }

  class GuillermoMarcosChupito extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !MB.listo()) return;
      if (!fondo) fondo = creaFondo();
      const { g: pg, m: pm } = pose(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = (t >= T.moja ? 3 * Math.exp(-(t - T.moja) * 6) * suave(fase(t,T.moja,T.moja+.04)) : 0);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.6);
      MATRIZ = g.getTransform();
      g.drawImage(fondo, -40, -60);
      // luz del fuego en la pared
      const av = aviva(t);
      g.save(); g.globalCompositeOperation = "lighter";
      X_CHUPI.forEach((x, i) => brillo(g, x, BASE - 30, llamaChupi(t, i) * av.k * 0.7, 80));
      brillo(g, X_SERV, BASE - 20, fuegoServ(t) * 1.4, 120); brillo(g, SOMB_PUNTA.x, SOMB_PUNTA.y, fuegoSomb(t), 90);
      CHARCOS.forEach(([x], i) => brillo(g, x, BASE - 8, fuegoCharco(t, i) * 0.8, 70));
      g.restore();
      // sombras
      g.save(); g.fillStyle = "rgba(0,0,0,0.34)";
      g.beginPath(); g.ellipse(pg.x + 6, SUELO + 2, 92, 8, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pm.x - 4, SUELO + 2, 110, 9, 0, 0, Math.PI * 2); g.fill(); g.restore();
      charco(g, t, pg);
      // manguera: rollo detrás de Marcos y tubo hasta la cola de la lanza
      const esc = S * MB.K;
      MB.rollo(g, XM + 112, SUELO + 4, esc);
      const cola = MB.puntoLanza(pm, pm.manoCerca, "cola"), atr = { x: -Math.cos(cola.ang), y: -Math.sin(cola.ang) };
      MB.manguera(g, [cola, { x: cola.x + atr.x * 22, y: cola.y + atr.y * 22 }, { x: Math.max(cola.x + 40, XM + 40), y: (cola.y + SUELO) / 2 + 30 },
        { x: XM + 70, y: SUELO - 5 }, { x: XM + 112 - 40, y: SUELO - 4 }], esc);
      // cosas de la barra
      X_CHUPI.forEach((x, i) => chupito(g, x, t, i));
      servilleta(g, t); copaSombrilla(g, t); vasoLecheBarra(g, t);
      // llamas
      X_CHUPI.forEach((x, i) => { const k = llamaChupi(t, i) * av.k; if (k > 0.01) { g.save(); g.translate(x, BASE - 22); g.scale(0.62, 0.62); llama(g, t, k, av.inc * 1.5, i * 3.1, 0.8); g.restore(); } });
      CHARCOS.forEach(([x], i) => { const k = fuegoCharco(t, i) * (0.75 + 0.25 * av.k); if (k > 0.01) { g.save(); g.translate(x, BASE - 1); g.scale(0.55, 0.38); llama(g, t, k, av.inc, 20 + i, 1); g.restore(); } });
      const fs = fuegoServ(t) * av.k;
      if (fs > 0.01) for (let j = 0; j < 3; j++) { g.save(); g.translate(X_SERV - 11 + j * 11, BASE - 3); g.scale(0.62, 0.62); llama(g, t, fs * (0.8 + 0.3 * (j % 2)), av.inc * 1.2, 30 + j * 2.3, 0.2); g.restore(); }
      const fb = fuegoSomb(t) * (0.8 + 0.2 * av.k);
      if (fb > 0.01) { g.save(); g.translate(SOMB_PUNTA.x, SOMB_PUNTA.y + 2); g.scale(0.55, 0.55); llama(g, t, fb, av.inc, 41, 0); g.restore(); }
      // saltos de la llama de un sitio a otro
      const top = i => ({ x: X_CHUPI[i], y: BASE - 40 });
      salto(g, t, T.salta3, top(1), top(2)); salto(g, t, T.salta4, top(2), top(3)); salto(g, t, T.salta5, top(3), top(4));
      salto(g, t, T.serv, top(4), { x: X_SERV, y: BASE - 12 }); salto(g, t, T.somb, { x: X_SERV + 8, y: BASE - 26 }, { x: SOMB_PUNTA.x, y: SOMB_PUNTA.y - 4 });
      // personajes
      G.dibujar(g, pg, t);
      MB.dibujar(g, pm, t);
      // chorro de agua desde la lanza (con su caída llega justo al objetivo)
      const f = fuerzaChorro(t);
      if (f > 0.01 && pm.chorro) {
        const boca = MB.puntoLanza(pm, pm.manoCerca, "boca"), obj = objetivo(t, pg), s = apuntado(boca, obj);
        MB.chorro(g, { x: boca.x, y: boca.y, ang: s.ang }, s.L, t, esc, f);
        const pega = tramo(t, T.abre + 0.1, T.abre + 0.16) * f;
        salpicaduras(g, t, {x:boca.x+Math.cos(s.ang)*s.L*f,y:boca.y+Math.sin(s.ang)*s.L*f+.35*s.L*f*f}, pega * (t > T.moja - 0.05 ? 1.3 : 0.8), t > T.moja ? 5 : 1);
      }
      goteo(g, t);
      vapores(g, t); humo(g, t); soplido(g, t, pg);
      // Marcos sopla la boca de la lanza: rayitas y un hilo de vapor
      const kp = tramo(t, T.mSopla0 + 0.3, T.mSopla0 + 0.4) * (1 - tramo(t, T.mSopla1 - 0.1, T.mSopla1));
      if (kp > 0.01) {
        const bl = MB.puntoLanza(pm, pm.manoCerca, "boca");
        g.save(); g.lineCap = "round";
        for (let i = 0; i < 5; i++) { const ph = ((t - T.mSopla0) * 0.9 + i / 5) % 1; g.globalAlpha = Math.sin(Math.PI * ph) * 0.6 * kp; g.strokeStyle = "#eef3f6"; g.lineWidth = 3 + 4 * ph;
          g.beginPath(); g.moveTo(bl.x + Math.sin(ph * 8 + i) * 4, bl.y - 4 - ph * 46); g.quadraticCurveTo(bl.x + 6 + Math.sin(ph * 6 + i) * 8, bl.y - 12 - ph * 52, bl.x + Math.sin(ph * 7 + i + 1) * 5, bl.y - 20 - ph * 56); g.stroke(); }
        const bm = MB.aPantalla(pm, MB.boca(pm));
        g.globalAlpha = kp; g.strokeStyle = "rgba(235,245,255,0.9)"; g.lineWidth = 2;
        for (let i = 0; i < 3; i++) { const ph = (t * 2.6 + i / 3) % 1; g.beginPath(); g.moveTo(bm.x - 8 - ph * 14, bm.y - 4 - (i - 1) * 4 - ph * 6); g.lineTo(bm.x - 16 - ph * 14, bm.y - 6 - (i - 1) * 4 - ph * 8); g.stroke(); }
        g.restore();
      }
      // agua por la oreja y chorrito escupido
      const oreja = G.aPantalla(pg, G.cabeza(pg).a({ x: 590, y: 600 }));
      chorrito(g, t, T.oreja, T.oreja1, oreja, -150, -60, 4);
      const bocaG = G.aPantalla(pg, G.boca(pg));
      chorrito(g, t, T.gEscupe, T.gEscupe1, { x: bocaG.x + 4, y: bocaG.y }, 230, -130, 3.4);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00021.2", nombre: "Guillermo y Marcos · El chupito en llamas", crear: () => new GuillermoMarcosChupito() });
  window.__A2D_00021_2 = { pose, T, DUR, objetivo, poseG, poseM, camara, incVaso, puntaMechero, MECH_ANG, X_CHUPI, BASE, X_LECHE, fuerzaChorro, apuntado, BARRIDO, T_APAGA, PRENDE, llamaChupi, fuegoServ, fuegoSomb, fuegoCharco, mojado, SUELO, piesG, volumenLeche, XM };
})();
