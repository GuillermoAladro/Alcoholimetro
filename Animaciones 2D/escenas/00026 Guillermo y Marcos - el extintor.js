"use strict";
/* 00026 · Guillermo y Marcos · El extintor
 *
 * Negro → en una cafetería-pastelería de paredes coral, Guillermo (izquierda) y Marcos Bombero
 * (derecha, cara a cara) están junto a una mesita alta con una magdalena de cumpleaños y una bengala
 * encendida. Marcos se la ofrece con la mano abierta; Guillermo se emociona → la bengala chisporrotea
 * fuerte y a Guillermo le entra el pánico: manos a la cara, mira el extintor de la pared, lo descuelga,
 * tira de la anilla, saca la boquilla y apunta. Marcos levanta la mano («¡no!») → ¡fuuush! El chorro
 * de polvo llena la sala hasta dejar la pantalla en blanco → al posarse el polvo, los dos se han
 * quedado blancos como estatuas de yeso: solo se les mueven los ojos, que parpadean, se miran y miran
 * la bengala… que sigue chisporroteando → Marcos se inclina despacio y la apaga con un soplidito →
 * a Guillermo le pica la nariz: «aah… aah…» ¡achís! El estornudo le sacude todo el polvo y vuelve a
 * tener color; Marcos sigue de yeso y mira a cámara con cara de póquer; Guillermo sonríe culpable → negro.
 *
 * Yeso: cada personaje se dibuja en un lienzo auxiliar del tamaño de la pantalla (solo se limpia y se
 * tiñe su recuadro), se tiñe de blanco con «source-atop» y se pega en la escena; los ojos (blanco,
 * iris y pupila) se copian antes de teñir y se vuelven a poner encima, así son lo único con color.
 * Sin textos. Todo depende del tiempo absoluto.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, MB = MarcosBombero;
  const S = 0.30, SUELO = 560, DUR = 13.2;
  const TINTA = "#0b0a0e";
  const T = {
    presenta: 0.45, emocion: 0.8, chispa: 1.35, susto: 1.52,
    mira: 1.95, paso: 2.12, coge: 2.55, sube: 2.62, lleva: 2.95,
    anilla0: 2.95, anilla: 3.12, boquilla0: 3.18, boquilla: 3.34, apunta: 3.55,
    mAlarma: 3.02, mStop: 3.28,
    dispara: 3.62, corta: 4.4,
    blanco0: 3.7, blanco1: 4.06, blanco2: 4.45, posa: 5.8,
    seMiran: 6.95, bengala: 7.6, camara: 8.15,
    mBaja: 8.3, mSopla0: 8.62, apaga: 9.02, mEndereza: 9.32,
    aah0: 9.55, aah1: 9.98, achis: 10.32, limpio0: 10.4, limpio1: 10.6,
    mira2: 10.9, culpa: 11.35, mCamara: 11.1,
    fin: 12.35
  };

  /* ---------- sitio de las cosas (px de pantalla) ---------- */
  const XG = 350, XM = 694;
  const MESA = { x: 522, top: 374 };                 // tablero de la mesita alta
  const MAGD = { x: 518, y: 374 };                   // base de la magdalena (sobre el tablero)
  const PUNTA_BENGALA = { x: MAGD.x + 7, y: MAGD.y - 78 };
  const ASA_PARED = { x: 236, y: 300 };              // asa del extintor colgado (centro del puño que lo coge)

  /* ---------- maquinaria de posturas (como en 00004/00021) ---------- */
  const P0 = { pel: 0, dx: 0, torso: 0, cab: 0, cx: 40, cy: 300, ca: 0, cmu: -1.75, cp: 0, lx: 0, ly: 280, la: 0, lmu: -1.75, lp: 0,
    c0: 0, c1: 0, c2: 0, c3: 0, c4: 0, l0: 0, l1: 0, l2: 0, l3: 0, l4: 0 };
  const C_ = o => Object.assign({}, P0, o);
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function guion(lista, tabla, t, base) {
    let c = tabla[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, tabla[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const ABC = { c0: 1, c1: 1, c2: 1, c3: 1, c4: 1 }, ABL = { l0: 1, l1: 1, l2: 1, l3: 1, l4: 1 };
  const AGC = { c0: 0.35, c1: 0.38, c2: 0.38, c3: 0.36, c4: 0.34 }, AGL = { l0: 0.38, l1: 0.36, l2: 0.36, l3: 0.36, l4: 0.36 };
  const SUELTA_L = { l0: 0.5, l1: 0.55, l2: 0.5, l3: 0.45, l4: 0.4 };
  const dedos = (b, ch) => ({ pulgar: b[ch + "0"], indice: b[ch + "1"], medio: b[ch + "2"], anular: b[ch + "3"], menique: b[ch + "4"] });

  // Guillermo: c = mano cercana (la del extintor), l = mano lejana (anilla y boquilla)
  const CUERPOS_G = {
    bolsillos: C_({}),
    emocion: C_(Object.assign({ cab: 0.04, cx: 120, cy: 70, cp: 1, cmu: 2.6, ca: 0 }, { c0: 0.9, c1: 0.95, c2: 0.95, c3: 0.9, c4: 0.85 })),
    susto: C_(Object.assign({ torso: -0.07, cab: -0.05, pel: -10, cp: 1, lp: 1, cmu: 1.75, lmu: 1.35 }, ABC, ABL)),
    mira: C_(Object.assign({ torso: -0.04, cab: -0.12, pel: -4, cp: 1, lp: 1, cmu: 1.75, lmu: 1.35 }, ABC, ABL)),
    coge: C_(Object.assign({ dx: -26, torso: -0.1, cab: -0.08, pel: 6, cp: 1, cmu: -1.75, lp: 1, lx: 40, ly: 270, lmu: -1.75 }, AGC, SUELTA_L)),
    lleva: C_(Object.assign({ dx: -6, torso: 0.02, cab: 0.04, cp: 1, cx: 100, cy: 205, cmu: -1.75, lp: 1, lx: 40, ly: 270, lmu: -1.75 }, AGC, SUELTA_L)),
    anilla: C_(Object.assign({ dx: -4, torso: 0.04, cab: 0.08, cp: 1, cx: 100, cy: 205, cmu: -1.75, lp: 1, lmu: -2.2 }, AGC, AGL)),
    apunta: C_(Object.assign({ dx: 6, torso: 0.07, cab: 0.02, pel: 10, cp: 1, cx: 96, cy: 215, cmu: -1.75, lp: 1, lx: 140, ly: 222, lmu: -2.8 }, AGC, AGL)),
    retro: C_(Object.assign({ dx: 0, torso: -0.03, cab: -0.04, pel: 14, cp: 1, cx: 90, cy: 212, cmu: -1.75, lp: 1, lx: 132, ly: 214, lmu: -2.8 }, AGC, AGL)),
    aah: C_(Object.assign({ dx: 0, torso: -0.1, cab: -0.32, pel: 6, cp: 1, cx: 90, cy: 212, cmu: -1.75, lp: 1, lx: 132, ly: 214, lmu: -2.8 }, AGC, AGL)),
    achis: C_(Object.assign({ dx: 4, torso: 0.13, cab: 0.2, pel: 18, cp: 1, cx: 96, cy: 224, cmu: -1.75, lp: 1, lx: 140, ly: 232, lmu: -2.8 }, AGC, AGL)),
    baja: C_(Object.assign({ dx: 0, torso: 0.0, cab: 0.03, pel: 4, cp: 1, cx: 70, cy: 290, cmu: -1.75, lp: 1, lx: 70, ly: 292, lmu: -1.95 }, AGC, AGL)),
    culpa: C_(Object.assign({ dx: 0, torso: -0.02, cab: -0.07, pel: -8, cp: 1, cx: 70, cy: 282, cmu: -1.75, lp: 1, lx: 70, ly: 284, lmu: -1.95 }, AGC, AGL))
  };
  const GUION_G = [
    [T.emocion, T.emocion + 0.35, "emocion"], [T.susto - 0.04, T.susto + 0.16, "susto", salida], [T.mira, T.mira + 0.25, "mira"],
    [T.paso, T.coge, "coge"], [T.sube + 0.02, T.lleva, "lleva"], [T.anilla0, T.anilla0 + 0.15, "anilla"],
    [T.boquilla + 0.02, T.apunta, "apunta"], [T.dispara, T.dispara + 0.12, "retro", salida],
    [T.aah0, T.aah0 + 0.22, "aah"], [T.aah0 + 0.22, T.aah0 + 0.32, "retro"], [T.aah1 - 0.08, T.aah1 + 0.25, "aah"],
    [T.achis - 0.02, T.achis + 0.07, "achis", salida], [T.achis + 0.25, T.achis + 0.6, "baja"], [T.culpa, T.culpa + 0.4, "culpa"]
  ];
  // Marcos: c = mano cercana (en reposo), l = mano lejana (ofrece, para y luego cuelga)
  const CM = o => Object.assign({}, P0, { lp: 1, lx: 46, ly: 292, lmu: -1.75, ca: 0 }, SUELTA_L, o);   // la lejana cuelga suelta (codo atrás)
  const CUERPOS_M = {
    base: CM({}),
    presenta: CM(Object.assign({ lp: 1, lx: 185, ly: 120, lmu: 3.05, torso: 0.05, cab: 0.05 }, ABL)),
    base2: CM({}),
    alarma: CM(Object.assign({ lp: 1, lx: 135, ly: -40, lmu: 1.6, torso: -0.03, cab: -0.04, pel: -4 }, ABL)),
    stop: CM(Object.assign({ lp: 1, lx: 150, ly: -95, lmu: 1.6, torso: -0.06, cab: -0.07, pel: -6 }, ABL)),
    baja: CM(Object.assign({ lp: 1, lx: 70, ly: 265, lmu: -1.75, torso: 0, cab: 0 }, SUELTA_L)),
    sopla: CM(Object.assign({ lp: 1, lx: 80, ly: 255, lmu: -1.75, torso: 0.17, cab: 0.16, pel: 14 }, SUELTA_L)),
    fin: CM(Object.assign({ lp: 1, lx: 70, ly: 265, lmu: -1.75, torso: -0.01, cab: -0.03 }, SUELTA_L))
  };
  const GUION_M = [
    [T.presenta, T.presenta + 0.45, "presenta"], [T.chispa + 0.2, T.chispa + 0.6, "base2"],
    [T.mAlarma, T.mAlarma + 0.18, "alarma"], [T.mStop - 0.05, T.mStop + 0.14, "stop", salida],
    [T.mBaja, T.mBaja + 0.4, "baja"], [T.mSopla0, T.mSopla0 + 0.35, "sopla"], [T.mEndereza, T.mEndereza + 0.5, "fin"]
  ];

  /* ---------- caras ---------- */
  const BASEC = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, mof: 0 };
  const E = o => Object.assign({}, BASEC, o);
  const ESTATUA_G = { orig: 0, abre: 30, ancho: 1.15, sonr: -0.25, sd: -4, gd: -0.15, si: -4, gi: -0.15, iris: 1.05 };
  const ESTATUA_M = { orig: 0, abre: 26, ancho: 0.85, sonr: -0.3, sd: 22, gd: 0.18, si: 22, gi: 0.18, iris: 1.1 };
  const CARAS_G = {
    inicio: E({ mx: 0.85, my: 0.2 }),
    mira_m: E({ mx: 0.9, my: 0.05, orig: 0, sonr: 0.35, ancho: 0.95 }),
    ilusion: E({ mx: 0.9, my: 0.4, c: 0.45, h: 0.8, sd: 14, gd: 0.1, si: 14, gi: 0.1, orig: 0, sonr: 0.9, abre: 10, ancho: 1.05 }),
    susto: E({ mx: 0.9, my: 0.4, iris: 1.15, sd: 26, gd: 0.25, si: 26, gi: 0.25, orig: 0, abre: 42, ancho: 0.9, sonr: -0.55, lengua: 0.3 }),
    mira: E({ mx: -0.95, my: 0.15, iris: 1.12, sd: 24, gd: 0.2, si: 24, gi: 0.2, orig: 0, abre: 24, ancho: 0.7, sonr: -0.35 }),
    decidido: E({ mx: 0.85, my: 0.35, c: 0.22, sd: -12, gd: -0.28, si: -12, gi: -0.28, orig: 0, abre: 10, ancho: 1.12, sonr: -0.45, dientes: 1 }),
    dispara: E(Object.assign({ mx: 0.9, my: 0.3, c: 0.55, z: 0.7 }, ESTATUA_G)),
    est_m: E(Object.assign({ mx: 0.92, my: 0.0 }, ESTATUA_G)),
    est_b: E(Object.assign({ mx: 0.85, my: 0.65 }, ESTATUA_G)),
    est_cam: E(Object.assign({ mx: -0.85, my: -0.25 }, ESTATUA_G)),
    est_m2: E(Object.assign({ mx: 0.92, my: 0.05 }, ESTATUA_G)),
    aah: E({ mx: 0.3, my: -0.6, c: 0.62, z: 0.35, sd: 18, gd: 0.15, si: 18, gi: 0.15, orig: 0, abre: 26, ancho: 0.78, sonr: -0.15, lengua: 0.2 }),
    achis: E({ mx: 0, my: 0, c: 1, z: 1, sd: -6, gd: -0.1, si: -6, gi: -0.1, orig: 0, abre: 44, ancho: 1.1, sonr: -0.3, lengua: 0.4 }),
    limpio: E({ mx: 0.35, my: 0.95, iris: 1.12, sd: 22, gd: 0.2, si: 22, gi: 0.2, orig: 0, abre: 18, ancho: 0.62, sonr: 0, lengua: 0.2 }),
    culpa: E({ mx: -0.85, my: -0.25, h: 0.25, sd: 20, gd: 0.18, si: 6, gi: 0.02, orig: 0, sonr: 0.9, abre: 8, ancho: 1.08, dientes: 1 })
  };
  const GUION_CARA_G = [
    [0.3, 0.6, "mira_m"], [T.emocion - 0.1, T.emocion + 0.25, "ilusion"], [T.susto - 0.05, T.susto + 0.1, "susto"],
    [T.mira, T.mira + 0.2, "mira"], [T.lleva - 0.1, T.lleva + 0.2, "decidido"], [T.dispara - 0.05, T.dispara + 0.08, "dispara"],
    [T.posa - 0.3, T.posa, "est_m"],                                // ya de yeso (escondido bajo la nube): ojos abiertos
    [T.seMiran - 0.6, T.seMiran - 0.45, "est_cam"], [T.seMiran, T.seMiran + 0.18, "est_m2"], [T.bengala, T.bengala + 0.2, "est_b"],
    [T.camara, T.camara + 0.2, "est_cam"], [T.mSopla0, T.mSopla0 + 0.2, "est_b"],
    [T.aah0 - 0.1, T.aah0 + 0.2, "aah"], [T.achis - 0.03, T.achis + 0.04, "achis"], [T.mira2, T.mira2 + 0.25, "limpio"],
    [T.culpa, T.culpa + 0.3, "culpa"]
  ];
  const CARAS_M = {
    inicio: E({ mx: 0.85, my: 0.15, c: 0.1, orig: 1 }),
    presenta: E({ mx: 0.85, my: 0.1, c: 0.3, h: 0.5, sd: 10, gd: 0.08, si: 10, gi: 0.08, orig: 0, sonr: 0.75, abre: 6, ancho: 0.95 }),
    tranqui: E({ mx: 0.85, my: 0.3, c: 0.25, sd: 4, si: 4, orig: 0, sonr: 0.3, ancho: 0.9 }),
    extrana: E({ mx: 0.9, my: 0.05, c: 0.15, sd: 16, gd: 0.12, si: 2, gi: -0.05, orig: 0, sonr: 0.05, ancho: 0.8 }),
    alarma: E(Object.assign({ mx: 0.95, my: 0.05 }, ESTATUA_M)),
    est_g: E(Object.assign({ mx: 0.95, my: 0.08 }, ESTATUA_M)),
    est_b: E(Object.assign({ mx: 0.8, my: 0.6 }, ESTATUA_M)),
    sopla: E({ mx: 0.8, my: 0.6, c: 0.3, sd: 8, gd: 0.05, si: 8, gi: 0.05, orig: 0, abre: 4, ancho: 0.34, sonr: 0, dientes: 0, mof: 0.45, iris: 1 }),
    tras: E({ mx: 0.85, my: 0.2, c: 0.4, sd: 4, si: 4, orig: 0, abre: 0, ancho: 0.8, sonr: 0.05 }),
    poker: E({ mx: -0.85, my: -0.22, c: 0.48, sd: -2, gd: -0.06, si: 12, gi: 0.08, orig: 0, abre: 0, ancho: 0.78, sonr: -0.12 })
  };
  const GUION_CARA_M = [
    [T.presenta, T.presenta + 0.3, "presenta"], [T.susto + 0.1, T.susto + 0.4, "extrana"], [T.mAlarma, T.mAlarma + 0.12, "alarma"],
    [T.seMiran, T.seMiran + 0.18, "est_g"], [T.bengala + 0.08, T.bengala + 0.28, "est_b"], [T.mSopla0 - 0.05, T.mSopla0 + 0.25, "sopla"],
    [T.apaga + 0.05, T.mEndereza + 0.3, "tras"], [T.mCamara, T.mCamara + 0.5, "poker"]
  ];
  function parpadeos(lista, t) {
    let o = 0;
    for (const tb of lista) { const k = fase(t, tb, tb + 0.16); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); }
    return o;
  }
  const PARP_G = [1.05, 2.4, 6.55, 7.3, 8.6, 11.0, 12.1], PARP_M = [0.7, 2.2, 6.82, 7.95, 9.7, 11.75];
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
  // yeso: 0 = normal, 1 = estatua blanca
  const yesoM = t => tramo(t, T.blanco1 - 0.12, T.blanco1 + 0.3);
  const yesoG = t => yesoM(t) * (1 - tramo(t, T.limpio0, T.limpio1));
  const polvo = t => tramo(t, T.blanco1 - 0.1, T.blanco1 + 0.3);       // polvo en el suelo, la mesa y la magdalena
  // quieto como una estatua (sin respirar) entre el chorro y el estornudo / el soplido
  const quietoG = t => tramo(t, T.dispara + 0.5, T.dispara + 0.8) * (1 - tramo(t, T.aah0 - 0.15, T.aah0 + 0.05));
  const quietoM = t => tramo(t, T.dispara + 0.5, T.dispara + 0.8) * (1 - tramo(t, T.mBaja - 0.1, T.mBaja + 0.1)) + tramo(t, T.mEndereza + 0.3, T.mEndereza + 0.6);   // vuelve a quedarse de piedra

  /* ---------- Guillermo ---------- */
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const PASOS = {
    cerca: [[-10, -9, XG - 19], [T.paso, T.paso + 0.22, XG - 52], [T.lleva - 0.05, T.lleva + 0.2, XG - 26], [T.apunta - 0.25, T.apunta - 0.02, XG - 14]],
    lejos: [[-10, -9, XG + 18], [T.paso + 0.1, T.paso + 0.32, XG - 6], [T.lleva + 0.05, T.lleva + 0.28, XG + 26], [T.apunta - 0.15, T.apunta + 0.05, XG + 40]]
  };
  function pie(lado, t) {
    const L = PASOS[lado]; let i = 0; while (i + 1 < L.length && t >= L[i + 1][0]) i++;
    const [t0, t1, x] = L[i], xa = i > 0 ? L[i - 1][2] : x, u = fase(t, t0, t1);
    const arco = Math.sin(Math.PI * u);
    return { x: lerp(xa, x, suave5(u)), y: TOB_G[lado] - 40 * arco, ang: -0.18 * arco };
  }
  // geometría del extintor (px de pantalla, origen en el centro del puño que lo coge por el asa)
  const EXT = { ancho: 30, y0: 18, y1: 116, valvula: { x: 9, y: 3 }, anilla: { x: 13, y: 1 }, guardada: { x: 21, y: 28 } };
  let cacheG = new Map();
  function poseG(t) {
    const key = Math.round(t * 1e5); if (cacheG.has(key)) return cacheG.get(key);
    if (cacheG.size > 400) cacheG = new Map();
    const b = guion(GUION_G, CUERPOS_G, t, "bolsillos"), e = guion(GUION_CARA_G, CARAS_G, t, "inicio");
    const quieto = quietoG(t), respira = Math.sin(t * 2.2) * (1 - quieto);
    const p = {
      x: XG + b.dx, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.3 }, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      cara: cara(e, parpadeos(PARP_G, t)), tirasLimpias: true, ikContinuo: false
    };
    for (const lado of ["cerca", "lejos"]) { const f = pie(lado, t); p.piernas[lado] = { tob: { x: G.PELVIS.x + (f.x - p.x) / S, y: f.y }, ang: f.ang }; }
    // temblores: pánico, retroceso del chorro y estornudo
    const nerv = tramo(t, T.susto, T.susto + 0.15) * (1 - tramo(t, T.lleva, T.lleva + 0.2));
    p.torso += 0.018 * ruido(t * 22) * nerv; p.cabeza.ang += 0.03 * ruido(t * 26 + 4) * nerv;
    const chorro = tramo(t, T.dispara, T.dispara + 0.06) * (1 - tramo(t, T.corta - 0.15, T.corta));
    p.torso += 0.02 * ruido(t * 34 + 2) * chorro; p.cabeza.ang += 0.03 * ruido(t * 30 + 7) * chorro;
    p.sudor = tramo(t, T.susto, T.susto + 0.3) * (1 - tramo(t, T.dispara, T.dispara + 0.2));
    // picor de nariz: la cabeza tiembla arriba y abajo antes del estornudo
    const pica = tramo(t, T.aah0 - 0.05, T.aah0 + 0.1) * (1 - tramo(t, T.achis - 0.05, T.achis));
    p.cabeza.ang += 0.035 * Math.sin(t * 38) * pica; p.cabeza.dy = -6 * Math.abs(Math.sin(t * 19)) * pica;
    p.rojo = 0.25 * campana(t, T.emocion, T.chispa + 0.2); p.cara.rubor = p.rojo * 1.6;
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    let c = { x: hc.x + b.cx, y: hc.y + b.cy }, l = { x: hl.x + b.lx, y: hl.y + b.ly };
    c = mezcla(c, Tr(BOLS_G.c), (1 - clamp(b.cp * 1.5)) * (1 - b.cp)); l = mezcla(l, Tr(BOLS_G.l), (1 - clamp(b.lp * 1.5)) * (1 - b.lp));
    const H = q => G.aHoja(p, q), Sc = q => G.aPantalla(p, q);
    // pánico: las dos manos a las mejillas
    const kp = tramo(t, T.susto - 0.04, T.susto + 0.16, salida) * (1 - tramo(t, T.paso - 0.05, T.paso + 0.2));
    if (kp > 0) { const C = G.cabeza(p); c = mezcla(c, C.a({ x: 680, y: 770 }), kp); l = mezcla(l, C.a({ x: 950, y: 790 }), kp * (1 - tramo(t, T.mira + 0.1, T.paso + 0.2))); }
    // descolgar el extintor: el puño va justo al asa y se lo lleva
    const kc = tramo(t, T.paso + 0.08, T.coge) * (1 - tramo(t, T.sube, T.lleva));
    if (kc > 0) c = mezcla(c, H({ x: ASA_PARED.x, y: ASA_PARED.y - 30 * tramo(t, T.coge + 0.02, T.sube + 0.05) }), kc);
    const cogido = t >= T.coge;
    // la lejana: a la anilla (y tira), luego a la boquilla guardada en el costado y a apuntar
    const puno = Sc(c);
    if (t > T.anilla0 - 0.2) {
      const ka = tramo(t, T.anilla0, T.anilla - 0.03) * (1 - tramo(t, T.anilla, T.boquilla0 + 0.02));
      const anillaS = { x: puno.x + EXT.anilla.x + 4, y: puno.y + EXT.anilla.y - 4 };
      if (ka > 0) l = mezcla(l, H(anillaS), ka);
      // tirón: la mano sale disparada hacia arriba y atrás
      const tiro = campana(t, T.anilla - 0.02, T.anilla + 0.16);
      if (tiro > 0) l = mezcla(l, H({ x: anillaS.x + 26, y: anillaS.y - 30 }), tiro * 0.8);
      const kb = tramo(t, T.boquilla0, T.boquilla - 0.02) * (1 - tramo(t, T.boquilla + 0.02, T.apunta));
      if (kb > 0) l = mezcla(l, H({ x: puno.x + EXT.guardada.x, y: puno.y + EXT.guardada.y + 14 }), kb);
    }
    // apuntar: la boquilla mira a la bengala (dir), con el retroceso del chorro
    const tieneBoq = t >= T.boquilla;
    const dirApunta = { x: 0.97, y: 0.24 };
    p.manoCerca = { x: c.x, y: c.y, ang: b.ca, mu: b.cmu, dobla: -1, puno: b.cp, dedos: dedos(b, "c") };
    p.manoLejos = { x: l.x, y: l.y, ang: b.la, mu: b.lmu, dobla: -1, puno: b.lp, dedos: dedos(b, "l") };
    // boquilla en la lejana: su dirección pasa de colgar (abajo) a apuntar
    const apuntaK = tramo(t, T.boquilla, T.apunta);
    const baja = tramo(t, T.achis + 0.25, T.achis + 0.6);
    const dirBoq = (() => { const a0 = Math.PI / 2 - 0.15, a1 = Math.atan2(dirApunta.y, dirApunta.x), a2 = Math.PI / 2 - 0.35;
      const a = lerp(lerp(a0, a1, suave(apuntaK)), a2, baja) + 0.04 * ruido(t * 30) * chorro; return { x: Math.cos(a), y: Math.sin(a) }; })();
    const manoL = p.manoLejos, manoC = p.manoCerca;
    if (tieneBoq) manoL.objeto = g => { g.save(); enPantalla(g, G, p, manoL); boquilla(g, dirBoq); g.restore(); };
    if (cogido) {
      const pl = Sc(manoL), pc = Sc(manoC);
      const atras = { x: pl.x - dirBoq.x * 9 - pc.x, y: pl.y - dirBoq.y * 9 - pc.y };
      manoC.objeto = g => { g.save(); enPantalla(g, G, p, manoC);
        extintor(g, { anilla: t < T.anilla + 0.01, guardada: !tieneBoq, atras: tieneBoq ? atras : null, dirBoq }); g.restore(); };
    }
    p.salida = tieneBoq ? (() => { const s = Sc(manoL); return { x: s.x + dirBoq.x * 34, y: s.y + dirBoq.y * 34, dir: dirBoq }; })() : null;
    cacheG.set(key, p);
    return p;
  }

  /* ---------- Marcos ---------- */
  const TOB_M = { cerca: MB.SUELO - MB.TOBILLO_ALTO, lejos: MB.SUELO - MB.TOBILLO_ALTO - 6 };
  const PIES_M = { cerca: -128, lejos: 132 };
  let cacheM = new Map();
  function poseM(t) {
    const key = Math.round(t * 1e5); if (cacheM.has(key)) return cacheM.get(key);
    if (cacheM.size > 400) cacheM = new Map();
    const b = guion(GUION_M, CUERPOS_M, t, "base"), e = guion(GUION_CARA_M, CARAS_M, t, "inicio");
    const quieto = quietoM(t), respira = Math.sin(t * 2.0 + 1.1) * (1 - quieto);
    const p = {
      x: XM, suelo: SUELO, s: S, espejo: true,
      pelvis: { x: MB.PELVIS.x, y: MB.PELVIS.y + b.pel + respira * 1.4 }, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      cara: cara(e, parpadeos(PARP_M, t)), tirasLimpias: true, ikContinuo: true
    };
    for (const lado of ["cerca", "lejos"]) p.piernas[lado] = { tob: { x: MB.PELVIS.x + PIES_M[lado], y: TOB_M[lado] }, ang: 0 };
    // el soplido: un poco de pecho hacia delante y vuelta
    p.torsoEsc.y += 0.02 * campana(t, T.mSopla0, T.apaga + 0.1);
    const Tr = MB.tronco(p), hl = Tr(MB.HOMBRO);
    const reposoC = MB.manoReposo(p, "cerca");
    p.manoCerca = Object.assign({}, reposoC);
    const bol = Tr(MB.BOLSILLO_L);
    let l = { x: hl.x + b.lx, y: hl.y + b.ly };
    const fuera = b.lp, enBols = 1 - clamp(fuera * 1.5);
    l = mezcla(l, bol, enBols * (1 - fuera));
    p.manoLejos = { x: l.x, y: l.y, ang: b.la, mu: b.lmu, dobla: -1, puno: fuera, dedos: dedos(b, "l") };
    cacheM.set(key, p);
    return p;
  }
  function pose(t) { return { g: poseG(t), m: poseM(t) }; }

  /* ---------- objetos ---------- */
  const mezclaCol = (a, k) => {      // color hacia blanco de polvo
    const h = a.length === 7 ? [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)) : [0, 0, 0];
    const w = [244, 241, 235];
    return `rgb(${h.map((v, i) => Math.round(lerp(v, w[i], k))).join(",")})`;
  };
  // Extintor de polvo en px de pantalla con el origen en el centro del asa (donde va el puño).
  function extintor(g, o) {
    const d = o.polvo || 0, col = c => (d > 0 ? mezclaCol(c, d * 0.85) : c);
    const w = EXT.ancho / 2, y0 = EXT.y0, y1 = EXT.y1;
    g.save(); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = TINTA;
    // botella roja
    const botella = () => { g.beginPath(); g.moveTo(-w + 3, y0 + 10); g.quadraticCurveTo(-w, y0 + 4, -w + 6, y0); g.lineTo(w - 6, y0);
      g.quadraticCurveTo(w, y0 + 4, w - 3, y0 + 10); g.lineTo(w - 1, y1 - 6); g.quadraticCurveTo(w - 1, y1, w - 7, y1); g.lineTo(-w + 7, y1);
      g.quadraticCurveTo(-w + 1, y1, -w + 1, y1 - 6); g.closePath(); };
    botella(); g.fillStyle = col("#d6202c"); g.fill();
    g.save(); botella(); g.clip();
    g.fillStyle = col("#9c1019"); g.fillRect(w - 9, y0, 9, y1 - y0);
    g.fillStyle = d > 0 ? "rgba(255,255,255,0.4)" : "rgba(255,190,190,0.75)"; g.fillRect(-w + 4, y0 + 8, 4, y1 - y0 - 20);
    // etiqueta sin letras: banda clara con un dibujito de llama
    g.fillStyle = col("#f2efe6"); g.fillRect(-w + 1, y0 + 38, EXT.ancho - 2, 34);
    g.strokeStyle = col("#3a3a40"); g.lineWidth = 1.2; g.strokeRect(-w + 3, y0 + 41, EXT.ancho - 6, 28);
    g.fillStyle = col("#e65a1e"); g.beginPath(); g.moveTo(-3, y0 + 64); g.quadraticCurveTo(-9, y0 + 56, -2, y0 + 45); g.quadraticCurveTo(-1, y0 + 53, 3, y0 + 52);
    g.quadraticCurveTo(8, y0 + 58, 3, y0 + 64); g.closePath(); g.fill();
    g.fillStyle = col("#9c1019"); g.fillRect(-w, y1 - 9, EXT.ancho, 9);
    g.restore();
    botella(); g.strokeStyle = TINTA; g.lineWidth = 2.2; g.stroke();
    // cuello y válvula
    g.fillStyle = col("#3a3a40"); g.fillRect(-5, y0 - 6, 10, 7); g.lineWidth = 1.6; g.strokeRect(-5, y0 - 6, 10, 7);
    g.fillStyle = col("#c9ced6"); g.beginPath(); g.roundRect ? g.roundRect(-9, -5, 18, 12, 3) : g.rect(-9, -5, 18, 12); g.fill(); g.stroke();
    // manómetro
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(-11, 6, 4.6, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.3; g.stroke();
    g.strokeStyle = col("#2fa84f"); g.lineWidth = 1.6; g.beginPath(); g.arc(-11, 6, 3, -2.4, -0.6); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 1; g.beginPath(); g.moveTo(-11, 6); g.lineTo(-9, 3.5); g.stroke();
    // asa y palanca (por encima del puño)
    g.fillStyle = col("#2b2b31"); g.lineWidth = 1.6; g.strokeStyle = TINTA;
    g.beginPath(); g.moveTo(-11, -4); g.lineTo(12, -11); g.lineTo(13, -7); g.lineTo(-9, 0); g.closePath(); g.fill(); g.stroke();
    // anilla con su pasador
    if (o.anilla) { g.strokeStyle = col("#b9bec6"); g.lineWidth = 2.2; g.beginPath(); g.arc(EXT.anilla.x + 3, EXT.anilla.y - 2, 4.5, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = TINTA; g.lineWidth = 0.9; g.beginPath(); g.arc(EXT.anilla.x + 3, EXT.anilla.y - 2, 5.6, 0, Math.PI * 2); g.stroke(); }
    // manguera y boquilla
    const v = EXT.valvula;
    if (o.guardada) {
      manguera(g, [v, { x: v.x + 12, y: v.y + 8 }, { x: EXT.guardada.x, y: EXT.guardada.y - 6 }]);
      g.save(); g.translate(EXT.guardada.x, EXT.guardada.y); boquilla(g, { x: 0.08, y: 1 }, 0.9, d); g.restore();
    } else if (o.atras) {
      const a = o.atras, m1 = { x: v.x + 16, y: v.y + 22 }, m2 = { x: (v.x + a.x) / 2 + 6, y: Math.max(v.y, a.y) + 26 };
      manguera(g, [v, m1, m2, a], d);
    }
    g.restore();
  }
  function manguera(g, pts, d = 0) {
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); M2.curva(g, pts, false, 0.5); g.strokeStyle = TINTA; g.lineWidth = 6.4; g.stroke();
    g.beginPath(); M2.curva(g, pts, false, 0.5); g.strokeStyle = d > 0 ? mezclaCol("#34343c", d * 0.85) : "#34343c"; g.lineWidth = 3.6; g.stroke();
    g.beginPath(); M2.curva(g, pts, false, 0.5); g.strokeStyle = "rgba(255,255,255,0.25)"; g.lineWidth = 1.2; g.stroke();
    g.restore();
  }
  // boquilla de bocina negra; origen en el puño; dir = hacia dónde sale el polvo
  function boquilla(g, dir, esc = 1, d = 0) {
    const a = Math.atan2(dir.y, dir.x);
    g.save(); g.rotate(a); g.scale(esc, esc); g.lineJoin = "round"; g.strokeStyle = TINTA; g.lineWidth = 1.8;
    g.fillStyle = d > 0 ? mezclaCol("#26252b", d * 0.85) : "#26252b";
    g.beginPath(); g.moveTo(-9, -3.4); g.lineTo(12, -4); g.lineTo(34, -9); g.lineTo(34, 9); g.lineTo(12, 4); g.lineTo(-9, 3.4); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.22)"; g.beginPath(); g.moveTo(13, -3); g.lineTo(32, -7); g.lineTo(32, -4.5); g.lineTo(13, -1.4); g.closePath(); g.fill();
    g.fillStyle = "#0e0d10"; g.beginPath(); g.ellipse(34, 0, 2.6, 9, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
  }
  // soporte de pared (queda siempre)
  function soporte(g, d) {
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 2; g.fillStyle = d > 0 ? mezclaCol("#8d939c", d * 0.6) : "#8d939c";
    g.beginPath(); g.roundRect ? g.roundRect(ASA_PARED.x - 6, ASA_PARED.y + 14, 12, 34, 3) : g.rect(ASA_PARED.x - 6, ASA_PARED.y + 14, 12, 34); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(ASA_PARED.x - 6, ASA_PARED.y + 44); g.lineTo(ASA_PARED.x - 15, ASA_PARED.y + 50); g.lineTo(ASA_PARED.x + 15, ASA_PARED.y + 50); g.lineTo(ASA_PARED.x + 6, ASA_PARED.y + 44); g.stroke();
    g.fillStyle = TINTA; for (const y of [20, 40]) { g.beginPath(); g.arc(ASA_PARED.x, ASA_PARED.y + y, 1.6, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // anilla que sale volando al tirar de ella
  function anillaVuela(g, t, d) {
    if (t < T.anilla) return;
    const pg = poseG(T.anilla), pc = G.aPantalla(pg, pg.manoCerca);
    const x0 = pc.x + EXT.anilla.x + 3, y0 = pc.y + EXT.anilla.y - 2;
    const gr = 1500, sueloY = SUELO + 1;
    let x = x0, y = y0, vx = 110, vy = -330, tt = t - T.anilla;
    for (let r = 0; r < 4; r++) {
      const disc = vy * vy + 2 * gr * (sueloY - y), tc = (-vy + Math.sqrt(Math.max(0, disc))) / gr;
      if (tt < tc) { x += vx * tt; y += vy * tt + 0.5 * gr * tt * tt; tt = -1; break; }
      x += vx * tc; y = sueloY; vy = -(vy + gr * tc) * 0.35; vx *= 0.55; tt -= tc;
    }
    if (tt > 0) { const roda = Math.min(tt, 0.5); x += vx * roda - 0.5 * vx / 0.5 * roda * roda; }
    g.save(); g.strokeStyle = d > 0 ? mezclaCol("#b9bec6", d * 0.8) : "#b9bec6"; g.lineWidth = 2.2;
    g.beginPath(); g.ellipse(x, y - 3, 4.5, y >= sueloY - 0.5 ? 2.2 : 4.5, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 0.9; g.beginPath(); g.ellipse(x, y - 3, 5.6, y >= sueloY - 0.5 ? 3 : 5.6, 0, 0, Math.PI * 2); g.stroke();
    g.restore();
  }

  /* ---------- la mesita, la magdalena y la bengala ---------- */
  function mesa(g, d) {
    const x = MESA.x, y = MESA.top;
    g.save(); g.lineJoin = "round"; g.strokeStyle = TINTA; g.lineWidth = 2.5;
    // pie de hierro
    g.fillStyle = "#26252b"; g.fillRect(x - 4, y + 10, 8, SUELO - y - 14); g.strokeRect(x - 4, y + 10, 8, SUELO - y - 14);
    g.beginPath(); g.ellipse(x, SUELO - 3, 34, 6, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    // tablero de mármol
    g.fillStyle = "#efe9e1"; g.beginPath(); g.ellipse(x, y, 62, 11, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#cfc6bb"; g.beginPath(); g.ellipse(x, y + 4, 60, 8, 0, 0.1, Math.PI - 0.1); g.lineTo(x - 60, y + 8); g.fill();
    g.beginPath(); g.ellipse(x, y, 62, 11, 0, 0, Math.PI * 2); g.lineWidth = 2.5; g.stroke();
    g.strokeStyle = "rgba(120,110,100,0.35)"; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 40, y - 4); g.quadraticCurveTo(x - 10, y + 2, x + 20, y - 6); g.stroke();
    // capa de polvo encima
    if (d > 0.01) { g.globalAlpha = d; g.fillStyle = "#f6f3ee"; g.beginPath(); g.ellipse(x, y - 1, 64, 12, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#e4ded6"; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(x - 50 + i * 25, y + 9 + (i % 2), 6, 3, 0, 0, Math.PI * 2); g.fill(); } }
    g.restore();
  }
  function magdalena(g, d) {
    const x = MAGD.x, y = MAGD.y, col = c => (d > 0 ? mezclaCol(c, d * 0.88) : c);
    g.save(); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = TINTA; g.lineWidth = 2;
    // platito
    g.fillStyle = col("#ffffff"); g.beginPath(); g.ellipse(x, y - 1, 22, 4, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    // cápsula de papel con pliegues
    g.fillStyle = col("#2fb3a7"); g.beginPath(); g.moveTo(x - 15, y - 26); g.lineTo(x + 15, y - 26); g.lineTo(x + 11, y - 3); g.lineTo(x - 11, y - 3); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = col("#1b7d74"); g.lineWidth = 1.3; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(x + i * 5.6, y - 25); g.lineTo(x + i * 4.2, y - 4); g.stroke(); }
    // nata rosa en espiral
    g.strokeStyle = TINTA; g.lineWidth = 2; g.fillStyle = col("#f7a8c4");
    for (const [ox, oy, rx, ry] of [[0, -29, 18, 7], [0, -36, 14, 6], [1, -42, 9, 5]]) { g.beginPath(); g.ellipse(x + ox, y + oy, rx, ry, 0, 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.fillStyle = col("#fde0ea"); g.beginPath(); g.ellipse(x - 5, y - 38, 4, 2, -0.3, 0, Math.PI * 2); g.fill();
    // virutas de colores
    const vir = ["#ffd23f", "#3fa7ff", "#7bd25a", "#ff6b6b"];
    for (let i = 0; i < 9; i++) { const a = i * 2.3, r = 6 + 6 * hash(i + 3); g.strokeStyle = col(vir[i % 4]); g.lineWidth = 1.8;
      const px = x + Math.cos(a) * r * 1.3, py = y - 33 + Math.sin(a) * r * 0.5; g.beginPath(); g.moveTo(px - 1.5, py); g.lineTo(px + 1.5, py - 0.8); g.stroke(); }
    // guinda
    g.fillStyle = col("#d81f2a"); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.beginPath(); g.arc(x - 6, y - 47, 4.2, 0, Math.PI * 2); g.fill(); g.stroke();
    // palito de la bengala
    g.strokeStyle = col("#6d6a66"); g.lineWidth = 2.2; g.beginPath(); g.moveTo(x + 2, y - 40); g.lineTo(PUNTA_BENGALA.x, PUNTA_BENGALA.y + 22); g.stroke();
    g.strokeStyle = col("#3d3b38"); g.lineWidth = 3.6; g.beginPath(); g.moveTo(PUNTA_BENGALA.x - 0.8, PUNTA_BENGALA.y + 22); g.lineTo(PUNTA_BENGALA.x, PUNTA_BENGALA.y); g.stroke();
    g.restore();
  }
  // intensidad de la bengala: viva desde el principio, chisporroteo, y apagada por el soplido de Marcos
  const viva = t => 1 - tramo(t, T.apaga, T.apaga + 0.14);
  const fuerte = t => campana(t, T.chispa - 0.05, T.chispa + 0.55);
  function chispas(g, t) {
    const v = viva(t); if (v <= 0.005) return;
    const x = PUNTA_BENGALA.x, y = PUNTA_BENGALA.y, f = fuerte(t), fr = Math.floor(t * 24);
    g.save(); g.globalCompositeOperation = "lighter";
    const r0 = (16 + 22 * f) * v, gr = g.createRadialGradient(x, y, 1, x, y, r0 * 1.8);
    gr.addColorStop(0, `rgba(255,240,180,${0.85 * v})`); gr.addColorStop(0.4, `rgba(255,190,90,${0.4 * v})`); gr.addColorStop(1, "rgba(255,150,60,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r0 * 1.8, 0, Math.PI * 2); g.fill();
    g.lineCap = "round";
    const n = Math.round((10 + 10 * f) * v);
    for (let i = 0; i < n; i++) {
      const s = fr * 31 + i * 7, a = hash(s) * Math.PI * 2, L = (7 + 14 * hash(s + 1) + 26 * f * hash(s + 4)) * v, l0 = 3 + 3 * hash(s + 2);
      g.strokeStyle = ["#fff6c8", "#ffd35a", "#ffb03a", "#ffffff"][i % 4]; g.lineWidth = 1.4 + 0.8 * hash(s + 3);
      g.beginPath(); g.moveTo(x + Math.cos(a) * l0, y + Math.sin(a) * l0); g.lineTo(x + Math.cos(a) * (l0 + L), y + Math.sin(a) * (l0 + L) + 0.004 * L * L * 8); g.stroke();
      if (hash(s + 5) > 0.6) { g.fillStyle = "#fff3b0"; g.beginPath(); g.arc(x + Math.cos(a) * (l0 + L + 3), y + Math.sin(a) * (l0 + L + 3), 1.3, 0, Math.PI * 2); g.fill(); }
    }
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(x, y, 2.6 * v, 0, Math.PI * 2); g.fill();
    g.restore();
    // chispas gordas que saltan a la mesa en el chisporroteo
    if (f > 0.02) {
      g.save();
      for (let i = 0; i < 6; i++) {
        const t0 = T.chispa + i * 0.06, k = fase(t, t0, t0 + 0.45); if (k <= 0 || k >= 1) continue;
        const vx = (hash(i + 60) - 0.5) * 220, vy = -160 - 120 * hash(i + 61), tt = k * 0.45;
        const px = x + vx * tt, py = Math.min(MESA.top - 2, y + vy * tt + 0.5 * 1300 * tt * tt);
        g.globalAlpha = 1 - k; g.fillStyle = "#ffe066"; g.beginPath(); g.arc(px, py, 2.2, 0, Math.PI * 2); g.fill();
        g.strokeStyle = "#ff9a2a"; g.lineWidth = 1; g.stroke();
      }
      g.restore();
    }
  }
  function humoBengala(g, t) {
    const k = fase(t, T.apaga, T.apaga + 1.4); if (k <= 0 || k >= 1) return;
    const x = PUNTA_BENGALA.x, y = PUNTA_BENGALA.y;
    g.save(); g.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const kk = clamp(k * 1.3 - i * 0.12); if (kk <= 0) continue;
      g.globalAlpha = Math.sin(Math.PI * kk) * 0.55; g.strokeStyle = "#cfcac4"; g.lineWidth = 3 + 3 * kk;
      g.beginPath();
      for (let j = 0; j <= 10; j++) { const u = j / 10, yy = y - u * 70 * kk - i * 4, xx = x + Math.sin(u * 5 + t * 3 + i) * 6 * u; if (j) g.lineTo(xx, yy); else g.moveTo(xx, yy); }
      g.stroke();
    }
    g.restore();
  }

  /* ---------- polvo del extintor ---------- */
  const NUBE = [   // bocanadas que llenan la sala: [x, y, r final, retraso]
    [470, 330, 170, 0.0], [560, 300, 190, 0.05], [380, 300, 160, 0.1], [650, 260, 200, 0.12], [520, 200, 220, 0.16], [300, 220, 190, 0.2],
    [760, 340, 210, 0.2], [200, 360, 180, 0.24], [860, 220, 200, 0.26], [130, 180, 190, 0.3], [600, 460, 220, 0.18], [340, 470, 200, 0.24],
    [920, 450, 200, 0.3], [80, 470, 190, 0.34], [512, 80, 230, 0.3]];
  // cuánto tapa la nube de color blanco liso (0…1)
  const blancoTotal = t => 0.97 * tramo(t, T.blanco0 + 0.05, T.blanco1, suave) * (1 - tramo(t, T.blanco2, T.posa, suave));
  function chorroPolvo(g, t, pg) {
    const k = tramo(t, T.dispara, T.dispara + 0.05) * (1 - tramo(t, T.corta - 0.12, T.corta));
    if (k <= 0.005 || !pg.salida) return;
    const { x, y, dir } = pg.salida, nx = -dir.y, ny = dir.x;
    const largo = 60 + 330 * tramo(t, T.dispara, T.dispara + 0.25, salida);
    g.save();
    // chorro: un cono blanco que se abre
    const borde = sg => { const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8, d = largo * u, w = (5 + 70 * u * u) * sg;
      pts.push({ x: x + dir.x * d + nx * w + 6 * ruido(t * 9 + i) * u, y: y + dir.y * d + ny * w + 6 * ruido(t * 9 + i + 30) * u }); } return pts; };
    const a = borde(1), b = borde(-1).reverse();
    // contorno suave (curva cerrada) y remate redondo al final, para que no quede un pico de papel
    const fin = { x: x + dir.x * largo, y: y + dir.y * largo }, rf = 5 + 70;
    const cono = () => { g.beginPath(); M2.curva(g, a.concat(b), true, 0.4); g.moveTo(fin.x + rf, fin.y); g.arc(fin.x, fin.y, rf, 0, Math.PI * 2); };
    g.globalAlpha = 0.92 * k; cono(); g.lineWidth = 6; g.strokeStyle = "#cbc5bd"; g.stroke();
    g.fillStyle = "#fbfaf7"; cono(); g.fill();
    // bocanadas que salen por la boca de la boquilla
    for (let i = 0; i < 18; i++) {
      const ph = (t * 2.6 + i / 18) % 1, d = largo * ph, w = (hash(i + 2) - 0.5) * 90 * ph, r = 6 + 34 * ph;
      const px = x + dir.x * d + nx * w, py = y + dir.y * d + ny * w;
      g.globalAlpha = k * (1 - ph * 0.6); g.fillStyle = "#cbc5bd"; g.beginPath(); g.arc(px, py, r + 2.5, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#fbfaf7"; g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  function nube(g, t) {
    const k0 = fase(t, T.blanco0 - 0.05, T.posa + 0.4); if (k0 <= 0 || k0 >= 1) return;
    g.save();
    const caer = tramo(t, T.blanco2, T.posa + 0.4);
    const lista = NUBE.map(([x, y, r, ret]) => {
      const sale = tramo(t, T.blanco0 - 0.05 + ret, T.blanco0 + 0.45 + ret, salida);
      const a = sale * (1 - caer);
      return { x: x + 30 * ruido(t * 0.7 + x * 0.01), y: y + 90 * caer * caer + 12 * ruido(t * 0.6 + y * 0.01), r: r * (0.25 + 0.75 * sale) * (1 + 0.15 * caer), a };
    }).filter(q => q.a > 0.005);
    for (const q of lista) { g.globalAlpha = q.a; g.fillStyle = "#cbc5bd"; g.beginPath(); g.arc(q.x, q.y, q.r + 4, 0, Math.PI * 2); g.fill(); }
    for (const q of lista) { g.globalAlpha = q.a; g.fillStyle = "#fbfaf7"; g.beginPath(); g.arc(q.x, q.y, q.r, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#ffffff"; g.beginPath(); g.arc(q.x - q.r * 0.3, q.y - q.r * 0.35, q.r * 0.35, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // motas de polvo que siguen cayendo después
  function motas(g, t) {
    const k = tramo(t, T.blanco2, T.posa) * (1 - tramo(t, T.fin - 1.5, T.fin)); if (k <= 0.01) return;
    g.save(); g.fillStyle = "#ffffff";
    for (let i = 0; i < 26; i++) {
      const per = 4 + 3 * hash(i + 90), ph = ((t - T.blanco2) / per + hash(i + 91)) % 1;
      const x = 60 + hash(i + 92) * 900 + 18 * Math.sin(t * 0.9 + i), y = 40 + ph * 520;
      g.globalAlpha = k * 0.75 * Math.sin(Math.PI * ph); g.beginPath(); g.arc(x, y, 1.4 + 1.4 * hash(i + 93), 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  // polvo posado en el suelo y en la pared
  function polvoPosado(g, t) {
    const d = polvo(t); if (d <= 0.005) return;
    g.save();
    // velo blanco en el aire
    const v = g.createRadialGradient(520, 300, 60, 520, 300, 620); v.addColorStop(0, `rgba(255,255,255,${0.16 * d})`); v.addColorStop(1, `rgba(255,255,255,${0.05 * d})`);
    g.fillStyle = v; g.fillRect(-40, -60, W + 80, H + 120);
    // capa en el suelo, más gruesa delante de la boquilla
    g.globalAlpha = d;
    for (const [x, rx, ry] of [[520, 330, 14], [400, 120, 9], [650, 140, 10], [250, 110, 8], [820, 130, 9]]) {
      g.fillStyle = "#e7e2da"; g.beginPath(); g.ellipse(x, SUELO + 6, rx + 3, ry + 2, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#f7f4ef"; g.beginPath(); g.ellipse(x, SUELO + 5, rx, ry, 0, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  // bocanada del soplido de Marcos y nube del estornudo
  function soplidoM(g, t, pm) {
    const k = fase(t, T.mSopla0 + 0.25, T.apaga + 0.12); if (k <= 0 || k >= 1) return;
    const b = MB.aPantalla(pm, MB.boca(pm));
    const x = lerp(b.x - 6, PUNTA_BENGALA.x + 6, salida(k)), y = lerp(b.y + 2, PUNTA_BENGALA.y, salida(k));
    g.save(); g.globalAlpha = Math.sin(Math.PI * k) * 0.9;
    for (const [dx, dy, r] of [[0, 0, 7], [6, -3, 5], [-5, 3, 5]]) { g.fillStyle = "#cbc5bd"; g.beginPath(); g.arc(x + dx, y + dy, r * (0.6 + 0.6 * k) + 1.5, 0, Math.PI * 2); g.fill(); }
    for (const [dx, dy, r] of [[0, 0, 7], [6, -3, 5], [-5, 3, 5]]) { g.fillStyle = "#ffffff"; g.beginPath(); g.arc(x + dx, y + dy, r * (0.6 + 0.6 * k), 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 1.6; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x - 14 - i * 3, y - 5 + i * 5); g.lineTo(x - 22 - i * 3, y - 5 + i * 5 - 1); g.stroke(); }
    g.restore();
  }
  const ESTORNUDO = [[0, -10, 70, 0], [40, -40, 60, 0.02], [-40, -50, 58, 0.03], [10, 60, 80, 0.04], [-50, 40, 70, 0.05], [60, 30, 66, 0.05],
    [0, -110, 64, 0.06], [80, -90, 52, 0.08], [-70, -120, 50, 0.08], [110, 10, 56, 0.07], [-20, 140, 76, 0.06]];
  function estornudo(g, t, pg) {
    const k = fase(t, T.achis - 0.02, T.achis + 1.5); if (k <= 0 || k >= 1) return;
    const c = G.aPantalla(pg, G.tronco(pg)({ x: 250, y: 420 }));
    // la boca en el instante del estornudo (la nube sale de ahí hacia delante)
    const pa = poseG(T.achis), bo = G.aPantalla(pa, G.boca(pa));
    g.save();
    const sev = tramo(t, T.achis + 0.4, T.achis + 1.5);
    const deBoca = [[0, 0, 26, 0], [30, -6, 30, 0.015], [62, 4, 34, 0.03], [92, -10, 38, 0.045], [40, 22, 28, 0.03]].map(([dx, dy, r, ret]) => {
      const sale = tramo(t, T.achis - 0.03 + ret, T.achis + 0.12 + ret, salida), a = sale * (1 - sev);
      return { x: bo.x + dx * sale + 70 * sev, y: bo.y + dy * sale - 20 * sev, r: r * (0.3 + 0.7 * sale) * (1 + 0.4 * sev), a };
    });
    const lista = deBoca.concat(ESTORNUDO.map(([dx, dy, r, ret], i) => {
      const sale = tramo(t, T.achis + 0.02 + ret, T.achis + 0.2 + ret, salida);
      const a = sale * (1 - sev);
      return { x: c.x + dx * (0.6 + 0.5 * sale) + 60 * sev * Math.sign(dx || 1) + 50 * sev, y: c.y + dy * (0.6 + 0.5 * sale) + 40 * sev * sev, r: r * (0.3 + 0.7 * sale) * (1 + 0.3 * sev), a };
    })).filter(q => q.a > 0.005);
    for (const q of lista) { g.globalAlpha = q.a; g.fillStyle = "#cbc5bd"; g.beginPath(); g.arc(q.x, q.y, q.r + 3.5, 0, Math.PI * 2); g.fill(); }
    for (const q of lista) { g.globalAlpha = q.a; g.fillStyle = "#fbfaf7"; g.beginPath(); g.arc(q.x, q.y, q.r, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#ffffff"; g.beginPath(); g.arc(q.x - q.r * 0.3, q.y - q.r * 0.35, q.r * 0.33, 0, Math.PI * 2); g.fill(); }
    // rayitas del estornudo
    const kr = campana(t, T.achis - 0.02, T.achis + 0.3);
    if (kr > 0) { const b = G.aPantalla(pg, G.boca(pg)); g.globalAlpha = kr; g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.lineCap = "round";
      for (let i = -2; i <= 2; i++) { const a = 0.15 + i * 0.32, r0 = 30 + 40 * kr; g.beginPath(); g.moveTo(b.x + Math.cos(a) * r0, b.y + Math.sin(a) * r0); g.lineTo(b.x + Math.cos(a) * (r0 + 18), b.y + Math.sin(a) * (r0 + 18)); g.stroke(); } }
    g.restore();
  }

  /* ---------- yeso: el personaje entero en blanco, menos los ojos ---------- */
  // Cada personaje se dibuja en un lienzo auxiliar (O), se pasa a gris con la fusión «saturation», se
  // recorta a su silueta y se aclara hacia blanco cálido (Y). Mientras está quieto como una estatua y la
  // cámara no se mueve, la estatua de yeso se reutiliza tal cual (solo cambian los ojos, que se dibujan
  // aparte con su color: blanco, iris y pupila, y un párpado de yeso al parpadear).
  let O = null, oc = null;
  const ESTADO = [{}, {}];
  function lienzos() {
    if (O) return;
    O = document.createElement("canvas"); O.width = W; O.height = H; oc = O.getContext("2d");
    for (const e of ESTADO) { e.Y = document.createElement("canvas"); e.Y.width = W; e.Y.height = H; e.yc = e.Y.getContext("2d"); e.clave = null; }
  }
  const aDisp = (M, q) => ({ x: M.a * q.x + M.c * q.y + M.e, y: M.b * q.x + M.d * q.y + M.f });
  function recuadro(M, x0, y0, x1, y1) {
    const pts = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => aDisp(M, { x, y }));
    const bx0 = Math.max(0, Math.floor(Math.min(...pts.map(q => q.x))) - 2), by0 = Math.max(0, Math.floor(Math.min(...pts.map(q => q.y))) - 2);
    const bx1 = Math.min(W, Math.ceil(Math.max(...pts.map(q => q.x))) + 2), by1 = Math.min(H, Math.ceil(Math.max(...pts.map(q => q.y))) + 2);
    return bx1 > bx0 && by1 > by0 ? { x: bx0, y: by0, w: bx1 - bx0, h: by1 - by0 } : null;
  }
  // todo lo que cambia el dibujo del cuerpo (los ojos no: van aparte)
  function clave(p, M, k) {
    const r = v => Math.round(v * 1000), m = h => h ? [r(h.x), r(h.y), r(h.ang || 0), r(h.mu || 0), r(h.puno ?? 1), ...Object.values(h.dedos || {}).map(r)] : [];
    const c = p.cara, oj = c.ojos, parp = Math.max(oj.d, oj.i, oj.feliz || 0, oj.apretado || 0);
    return [r(M.a), r(M.b), r(M.c), r(M.d), r(M.e), r(M.f), r(k), r(p.x), r(p.pelvis.y), r(p.torso), r(p.torsoEsc.y), r(p.cabeza.ang), r(p.cabeza.dy),
      r(p.cabeza.esc.x), r(p.cabeza.esc.y), ...["cerca", "lejos"].flatMap(l => [r(p.piernas[l].tob.x), r(p.piernas[l].tob.y), r(p.piernas[l].ang)]),
      ...m(p.manoCerca), ...m(p.manoLejos), r(c.boca.abre), r(c.boca.ancho), r(c.boca.sonrisa), r(c.boca.orig), r(c.mofletes || 0),
      r(c.cejas.d.sube), r(c.cejas.d.giro), r(c.cejas.i.sube), r(c.cejas.i.giro), r(p.rojo || 0), r(p.sudor || 0), parp > 0.02 ? r(parp) : 0].join(",");
  }
  function dibujaYeso(g, P, p, t, k, caja, M, n) {
    const bb = recuadro(M, ...caja); if (!bb) return;
    lienzos();
    const st = ESTADO[n], key = clave(p, M, k);
    if (st.clave !== key || k < 0.999) {
      oc.setTransform(1, 0, 0, 1, 0, 0); oc.globalCompositeOperation = "source-over"; oc.globalAlpha = 1;
      oc.clearRect(bb.x, bb.y, bb.w, bb.h);
      oc.setTransform(M); P.dibujar(oc, p, t); oc.setTransform(1, 0, 0, 1, 0, 0);
      const yc = st.yc;
      yc.setTransform(1, 0, 0, 1, 0, 0); yc.globalAlpha = 1; yc.globalCompositeOperation = "source-over";
      if (st.bb) yc.clearRect(st.bb.x, st.bb.y, st.bb.w, st.bb.h);
      yc.clearRect(bb.x, bb.y, bb.w, bb.h); yc.drawImage(O, bb.x, bb.y, bb.w, bb.h, bb.x, bb.y, bb.w, bb.h);
      yc.globalCompositeOperation = "saturation"; yc.fillStyle = "#808080"; yc.fillRect(bb.x, bb.y, bb.w, bb.h);
      // «destination-in» afecta a todo el lienzo: se limita al recuadro con un recorte (si no, es carísimo)
      yc.save(); yc.beginPath(); yc.rect(bb.x, bb.y, bb.w, bb.h); yc.clip();
      yc.globalCompositeOperation = "destination-in"; yc.drawImage(O, bb.x, bb.y, bb.w, bb.h, bb.x, bb.y, bb.w, bb.h); yc.restore();
      const yeso = yc.createLinearGradient(0, bb.y, 0, bb.y + bb.h);
      yeso.addColorStop(0, "rgba(248,244,238,0.7)"); yeso.addColorStop(1, "rgba(226,219,210,0.7)");
      yc.globalCompositeOperation = "source-atop"; yc.fillStyle = yeso; yc.fillRect(bb.x, bb.y, bb.w, bb.h);
      yc.globalCompositeOperation = "source-over";
      st.clave = k < 0.999 ? null : key; st.bb = bb;
    }
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    if (k < 0.999) g.drawImage(O, bb.x, bb.y, bb.w, bb.h, bb.x, bb.y, bb.w, bb.h);
    g.globalAlpha = k; g.drawImage(st.Y, st.bb.x, st.bb.y, st.bb.w, st.bb.h, st.bb.x, st.bb.y, st.bb.w, st.bb.h);
    g.restore();
    ojosYeso(g, P, p, n === 0 ? OJOS_G : OJOS_M);
  }
  // Ojos con color encima del yeso (coordenadas del retrato de cada uno).
  const OJOS_G = { piv: { x: 700, y: 800 }, col: { blanco: G.C.blanco, iris: G.C.iris, irisLuz: G.C.irisLuz, pupila: "#120806" },
    d: { poli: G.A.datos.piezas.cabeza.ojos.derecho, c: { x: 771, y: 563 }, r: 17.5, rx: 25, ry: 9 },
    i: { poli: G.A.datos.piezas.cabeza.ojos.izquierdo, c: { x: 894, y: 617 }, r: 15, rx: 19, ry: 7 } };
  const OJOS_M = { piv: { x: MB.A.datos.piezas.cabeza.pivote[0], y: MB.A.datos.piezas.cabeza.pivote[1] },
    col: { blanco: MB.C.blanco, iris: MB.C.iris, irisLuz: MB.C.irisLuz, pupila: MB.C.pupila }, d: MB.OJOS.d, i: MB.OJOS.i };
  function ojosYeso(g, P, p, D) {
    const H = P.cabeza(p), k = p.s * (P.K || 1), f = p.cara;
    g.save();
    g.translate(p.x, p.suelo); g.scale(p.espejo ? -k : k, k); g.translate(-P.PELVIS.x, -P.SUELO);
    g.translate(H.cx, H.cy); g.rotate(H.ang); g.scale(H.kx, H.ky); g.translate(-D.piv.x, -D.piv.y);
    for (const lado of ["d", "i"]) {
      const o = D[lado], c = clamp(Math.max(f.ojos[lado], (f.ojos.feliz || 0) * f.ojos[lado], (f.ojos.apretado || 0) * f.ojos[lado]));
      const ys = o.poli.map(q => q[1]), xs = o.poli.map(q => q[0]), y0 = Math.min(...ys) - 3, y1 = Math.max(...ys) + 3, x0 = Math.min(...xs) - 6, x1 = Math.max(...xs) + 6;
      g.save(); g.beginPath(); o.poli.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
      g.fillStyle = D.col.blanco; g.fill(); g.clip();
      const ix = o.c.x + o.rx * f.mirada.x, iy = o.c.y + o.ry * f.mirada.y, r = o.r * (f.iris ?? 1);
      g.fillStyle = D.col.iris; g.beginPath(); g.arc(ix, iy, r, 0, Math.PI * 2); g.fill();
      g.fillStyle = D.col.irisLuz; g.beginPath(); g.ellipse(ix, iy + r * 0.32, r * 0.7, r * 0.55, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = D.col.pupila; g.beginPath(); g.arc(ix, iy + r * 0.05, r * 0.46, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(ix - r * 0.36, iy - r * 0.34, r * 0.3, r * 0.24, -0.4, 0, Math.PI * 2); g.fill();
      // sombra del párpado arriba
      const sb = g.createLinearGradient(0, y0, 0, y0 + (y1 - y0) * 0.45); sb.addColorStop(0, "rgba(112,92,110,0.45)"); sb.addColorStop(1, "rgba(112,92,110,0)");
      g.fillStyle = sb; g.fillRect(x0, y0, x1 - x0, y1 - y0);
      // párpado de yeso al parpadear
      if (c > 0.01) {
        const yl = lerp(y0, y1, c);
        g.fillStyle = "#e2dcd4"; g.fillRect(x0, y0 - 10, x1 - x0, yl - y0 + 10);
        g.strokeStyle = "#857d76"; g.lineWidth = 5; g.beginPath(); g.moveTo(x0, yl); g.lineTo(x1, yl); g.stroke();
      }
      g.restore();
    }
    g.restore();
  }

  /* ---------- decorado: cafetería-pastelería ---------- */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60);
    // pared coral con rayas suaves
    const pared = g.createLinearGradient(0, -60, 0, 400); pared.addColorStop(0, "#c8533f"); pared.addColorStop(1, "#ea8a6c");
    g.fillStyle = pared; g.fillRect(-40, -60, W + 80, 480);
    for (let x = -40, i = 0; x < W + 40; x += 46, i++) { g.fillStyle = i % 2 ? "rgba(255,235,215,0.10)" : "rgba(120,30,20,0.05)"; g.fillRect(x, -60, 23, 480); }
    // luz cálida de la lámpara sobre la mesa
    const luz = g.createRadialGradient(MESA.x, 120, 20, MESA.x, 200, 420); luz.addColorStop(0, "rgba(255,230,180,0.55)"); luz.addColorStop(1, "rgba(255,220,170,0)");
    g.fillStyle = luz; g.fillRect(-40, -60, W + 80, 500);
    // estante con tartas bajo campana, entre las cabezas
    g.save(); g.translate(MESA.x, 168);
    g.fillStyle = "#7a4a2b"; g.fillRect(-112, 0, 224, 10); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.strokeRect(-112, 0, 224, 10);
    for (const [x, col, h] of [[-70, "#f6d27a", 30], [0, "#8a4a2a", 38], [70, "#f2a7c0", 32]]) {
      g.fillStyle = "#d9d4cc"; g.beginPath(); g.ellipse(x, -2, 26, 4, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = col; g.beginPath(); g.roundRect ? g.roundRect(x - 18, -4 - h, 36, h, 5) : g.rect(x - 18, -4 - h, 36, h); g.fill(); g.lineWidth = 2; g.stroke();
      g.fillStyle = "rgba(255,255,255,0.75)"; g.fillRect(x - 18, -4 - h, 36, 6);
      g.fillStyle = "#d81f2a"; g.beginPath(); g.arc(x, -8 - h, 4, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = "rgba(220,240,255,0.22)"; g.beginPath(); g.moveTo(x - 25, -2); g.lineTo(x - 25, -h - 14); g.quadraticCurveTo(x, -h - 40, x + 25, -h - 14); g.lineTo(x + 25, -2); g.closePath(); g.fill();
      g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 1.6; g.stroke(); g.strokeStyle = TINTA; g.lineWidth = 2.5;
      g.fillStyle = "#c9ced6"; g.beginPath(); g.arc(x, -h - 30, 3.5, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.5; g.stroke(); g.lineWidth = 2.5;
    }
    g.restore();
    // lámpara colgante
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.moveTo(MESA.x, -60); g.lineTo(MESA.x, 38); g.stroke();
    g.fillStyle = "#2fb3a7"; g.beginPath(); g.moveTo(MESA.x - 34, 70); g.quadraticCurveTo(MESA.x, 18, MESA.x + 34, 70); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#fff1c4"; g.beginPath(); g.ellipse(MESA.x, 70, 30, 6, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.5; g.stroke();
    // espejo redondo y un cuadro con una magdalena (sin letras)
    g.save(); g.translate(860, 170); g.fillStyle = "#e8c66a"; g.beginPath(); g.arc(0, 0, 52, 0, Math.PI * 2); g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    const esp = g.createLinearGradient(-40, -40, 40, 40); esp.addColorStop(0, "#b9cfd4"); esp.addColorStop(1, "#7f9ea6");
    g.fillStyle = esp; g.beginPath(); g.arc(0, 0, 42, 0, Math.PI * 2); g.fill(); g.lineWidth = 2; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.6)"; g.lineWidth = 5; g.beginPath(); g.moveTo(-22, 18); g.lineTo(10, -26); g.stroke(); g.restore();
    g.save(); g.translate(110, 120); g.fillStyle = "#2b2b31"; g.fillRect(-42, -52, 84, 104); g.lineWidth = 3; g.strokeStyle = TINTA; g.strokeRect(-42, -52, 84, 104);
    g.fillStyle = "#fff2e0"; g.fillRect(-34, -44, 68, 88);
    g.fillStyle = "#2fb3a7"; g.beginPath(); g.moveTo(-18, 0); g.lineTo(18, 0); g.lineTo(13, 30); g.lineTo(-13, 30); g.closePath(); g.fill(); g.lineWidth = 2; g.stroke();
    g.fillStyle = "#f7a8c4"; g.beginPath(); g.ellipse(0, -4, 22, 9, 0, 0, Math.PI * 2); g.fill(); g.stroke(); g.beginPath(); g.ellipse(0, -14, 15, 7, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#d81f2a"; g.beginPath(); g.arc(-2, -24, 5, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore();
    // señal de seguridad del extintor (solo dibujo)
    g.save(); g.translate(ASA_PARED.x, 218); g.fillStyle = "#d6202c"; g.beginPath(); g.roundRect ? g.roundRect(-20, -20, 40, 40, 4) : g.rect(-20, -20, 40, 40); g.fill(); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "#ffffff"; g.fillRect(-6, -10, 12, 22); g.fillRect(-3, -14, 6, 4); g.beginPath(); g.moveTo(3, -12); g.quadraticCurveTo(14, -12, 12, 4); g.lineTo(9, 4); g.quadraticCurveTo(11, -8, 3, -9); g.fill();
    g.restore();
    // friso de madera blanca
    g.fillStyle = "#f3e6cf"; g.fillRect(-40, 398, W + 80, SUELO - 398);
    g.fillStyle = "#fff6e6"; g.fillRect(-40, 392, W + 80, 9); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.beginPath(); g.moveTo(-40, 392); g.lineTo(W + 40, 392); g.moveTo(-40, 401); g.lineTo(W + 40, 401); g.stroke();
    for (let x = -10; x < W + 40; x += 96) { g.strokeStyle = "rgba(140,110,80,0.5)"; g.lineWidth = 2; g.strokeRect(x + 8, 414, 80, SUELO - 440); g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 1.5; g.strokeRect(x + 11, 417, 74, SUELO - 446); }
    g.fillStyle = "#c9b18e"; g.fillRect(-40, SUELO - 14, W + 80, 14); g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(-40, SUELO - 14); g.lineTo(W + 40, SUELO - 14); g.stroke();
    // suelo de madera clara en espiga
    const su = g.createLinearGradient(0, SUELO, 0, H + 60); su.addColorStop(0, "#c08a55"); su.addColorStop(1, "#7a5232");
    g.fillStyle = su; g.fillRect(-40, SUELO, W + 80, H + 60 - SUELO);
    g.strokeStyle = "rgba(60,30,10,0.35)"; g.lineWidth = 1.5;
    for (let r = 0; r < 5; r++) { const y0 = SUELO + r * 9 + r * r * 2.5, y1 = SUELO + (r + 1) * 9 + (r + 1) * (r + 1) * 2.5, w = 34 + r * 6;
      for (let x = -40 + (r % 2) * w / 2; x < W + 40; x += w) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x + w / 2, y1); g.lineTo(x + w, y0); g.stroke(); } }
    g.fillStyle = "rgba(255,230,200,0.2)"; g.fillRect(-40, SUELO, W + 80, 2);
    // viñeta
    const v = g.createRadialGradient(512, 300, 320, 512, 300, 700); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(30,0,0,0.45)");
    g.fillStyle = v; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const chispa = campana(t, T.chispa - 0.1, T.mira + 0.2);
    const cerca = tramo(t, T.posa - 0.1, T.seMiran - 0.1, suave) * (1 - 0.65 * tramo(t, T.achis + 0.15, T.culpa, suave));
    return { k: 1 + 0.03 * chispa + 0.32 * cerca, x: 512 + 8 * cerca, y: 300 - 4 * chispa - 62 * cerca };
  }

  class GuillermoMarcosExtintor extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !MB.listo()) return;
      if (!fondo) fondo = creaFondo();
      const { g: pg, m: pm } = pose(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = (t >= T.dispara ? 2.5 * Math.exp(-(t - T.dispara) * 5) : 0) + (t >= T.achis ? 2 * Math.exp(-(t - T.achis) * 7) : 0);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.6);
      const M = g.getTransform();
      g.drawImage(fondo, -40, -60);
      const d = polvo(t);
      polvoPosado(g, t);
      // sombras
      g.save(); g.fillStyle = "rgba(60,20,10,0.3)";
      g.beginPath(); g.ellipse(pg.x + 8, SUELO + 2, 96, 8, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pm.x - 4, SUELO + 2, 112, 9, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(MESA.x, SUELO + 1, 44, 6, 0, 0, Math.PI * 2); g.fill(); g.restore();
      // extintor colgado (hasta que lo coge) y su soporte
      soporte(g, d);
      if (t < T.coge) { g.save(); g.translate(ASA_PARED.x, ASA_PARED.y); extintor(g, { anilla: true, guardada: true }); g.restore(); }
      mesa(g, d); magdalena(g, d);
      anillaVuela(g, t, d);
      // personajes (de yeso después del chorro)
      const kM = yesoM(t), kG = yesoG(t);
      if (kM > 0.001) dibujaYeso(g, MB, pm, t, kM, [pm.x - 165, SUELO - 478, pm.x + 160, SUELO + 6], M, 1);
      else MB.dibujar(g, pm, t);
      if (kG > 0.001) dibujaYeso(g, G, pg, t, kG, [pg.x - 150, SUELO - 470, pg.x + 165, SUELO + 6], M, 0);
      else G.dibujar(g, pg, t);
      chispas(g, t); humoBengala(g, t);
      chorroPolvo(g, t, pg);
      soplidoM(g, t, pm);
      nube(g, t);
      estornudo(g, t, pg);
      motas(g, t);
      g.restore();
      const bl = blancoTotal(t);
      if (bl > 0.001) { g.fillStyle = `rgba(250,248,244,${bl})`; g.fillRect(0, 0, W, H); }
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00026", nombre: "Guillermo y Marcos · El extintor", crear: () => new GuillermoMarcosExtintor() });
  window.__A2D_00026 = { pose, poseG, poseM, T, DUR };
})();
