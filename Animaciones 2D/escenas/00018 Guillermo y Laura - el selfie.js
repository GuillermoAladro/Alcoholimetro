"use strict";
/* 00018 · Guillermo y Laura · El selfie
 *
 * Negro → azotea de un bar a la hora azul (cielo malva, ciudad con ventanas encendidas, guirnalda
 * de bombillas, barandilla de cristal) → Laura saca el móvil del bolsillo y llama a Guillermo, que
 * se arrima → lo levanta para hacerse un selfie y sonríen → FLASH 1: él parpadea justo en el
 * fogonazo (la foto sale en una esquina: con los ojos cerrados); ella le mira de reojo y él se rasca
 * la cabeza → FLASH 2: le pica la nariz… ¡estornudo! (la foto sale movida y salpicada); Laura se
 * limpia la mejilla con asco y él se frota la nariz → FLASH 3: ella pone morritos y él, a escondidas,
 * le hace los cuernos… las orejas de conejo detrás de la cabeza (la foto le pilla); Laura se gira,
 * él esconde la mano y silba disimulando; ella niega con la cabeza y sonríe → foto final: él guiña
 * con la uve, ella feliz con la uve bajo la barbilla → FLASH: la imagen se congela y se convierte en
 * una foto con marco blanco, algo torcida → negro.
 *
 * Sin textos. Las fotos se dibujan una sola vez (en un lienzo pequeño) a partir de la escena en el
 * instante del flash: todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, L = Laura;
  const S = 0.31, SUELO = 560, XG0 = 468, XG1 = 510, XL = 640;
  const DUR = 13.3;
  const T = {
    mira0: 0.35, saca0: 0.7, saca1: 1.35, llama0: 1.25, paso0: 1.55, paso1: 2.05, alza0: 1.95, alza1: 2.5,
    flash1: 3.05, baja1: 3.3, ojo1: 3.75, rasca0: 3.8, rasca1: 4.5, alza2: 4.45,
    picor0: 4.95, achis: 5.52, flash2: 5.6, limpia0: 5.8, limpia1: 6.55, frota0: 5.85, frota1: 6.7,
    alza3: 6.85, morros: 7.25, orejas0: 7.35, flash3: 8.1, baja3: 8.35, pilla: 8.7, gira: 8.95, esconde: 9.0,
    silba0: 9.15, perdona: 9.65, alza4: 9.9, finalPose: 10.25, flash4: 10.85, fin: 12.55
  };
  const FLASHES = [T.flash1, T.flash2, T.flash3, T.flash4];

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const rot = (q, a) => ({ x: q.x * Math.cos(a) - q.y * Math.sin(a), y: q.x * Math.sin(a) + q.y * Math.cos(a) });
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const D = (pu, ix, me, re) => ({ pulgar: pu, indice: ix, medio: me ?? re, anular: re, menique: re });
  // mano = { x, y, ang, mu, k (fuera del bolsillo), d: dedos }
  const mezclaMano = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), ang: lerp(a.ang, b.ang, k), mu: lerp(a.mu, b.mu, k),
    k: lerp(a.k, b.k, k), d: Object.fromEntries(DED.map(n => [n, lerp(a.d[n], b.d[n], k)])) });
  function lineaMano(guion, estados, ini, p, t) {
    let c = estados[ini](p, t);
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaMano(c, estados[nom](p, t), (f || suave)(fase(t, t0, t1))); }
    return c;
  }
  const aMano = (m, dobla) => ({ x: m.x, y: m.y, ang: m.ang, mu: m.mu, dobla, puno: clamp(m.k * 1.6), dedos: m.d });
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, -1.75), l: punoDesde({ x: 372, y: 648 }, -1.75) };

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, wd: 0, wi: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12,
    dientes: 1, lengua: 0, mof: 0, rub: 0, rojo: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, extraC) {
    const c = clamp(e.c + extraC);
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: 0, ojos: { d: clamp(c + e.wd), i: clamp(c + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* ================= Guillermo ================= */
  const CG = {
    inicio: E({ mx: 0.8, my: 0.05 }),
    mira: E({ mx: 0.9, my: 0.05, orig: 0, sonr: 0.45, sd: 6, si: 6 }),
    ansia: E({ mx: 0.92, my: -0.1, orig: 0, sonr: 0.72, abre: 8, ancho: 1.0, sd: 12, si: 12, gd: 0.06, gi: 0.06 }),
    pose: E({ mx: 0.95, my: -0.32, orig: 0, sonr: 0.88, abre: 15, ancho: 1.06, sd: 10, si: 10, lengua: 0 }),
    culpa: E({ mx: 0.6, my: 0.2, c: 0.3, h: 0.7, sd: 15, si: 15, gd: 0.22, gi: 0.22, orig: 0, abre: 5, ancho: 0.95, sonr: 0.55, rub: 0.55 }),
    picor: E({ mx: 0.6, my: -0.65, c: 0.55, z: 0.25, sd: 22, si: 22, gd: 0.18, gi: 0.18, orig: 0, abre: 20, ancho: 0.72, sonr: -0.1, lengua: 0.2 }),
    achis: E({ mx: 0.5, my: 0.1, c: 1, z: 1, sd: -6, si: -6, gd: -0.15, gi: -0.15, orig: 0, abre: 34, ancho: 0.95, sonr: -0.3, lengua: 0.4, rojo: 0.15 }),
    perdon: E({ mx: 0.7, my: 0.15, c: 0.28, h: 0.5, sd: 14, si: 14, gd: 0.25, gi: 0.25, orig: 0, abre: 3, ancho: 0.9, sonr: 0.42, rub: 0.65 }),
    picaro: E({ mx: -0.85, my: -0.2, c: 0.1, sd: 18, si: -3, gd: 0.15, gi: -0.1, orig: 0, abre: 6, ancho: 1.0, sonr: 0.8 }),
    pose3: E({ mx: 0.95, my: -0.3, orig: 0, sonr: 0.9, abre: 12, ancho: 1.05, sd: 12, si: 4, gi: -0.05 }),
    pillado: E({ mx: 0.95, my: -0.05, iris: 0.82, sd: 22, si: 22, gd: 0.1, gi: 0.1, orig: 0, abre: 10, ancho: 0.7, sonr: -0.15 }),
    silba: E({ mx: 0.25, my: -0.85, c: 0.15, sd: 16, si: 16, gd: 0.12, gi: 0.12, orig: 0, abre: 7, ancho: 0.34, sonr: 0.0 }),
    alivio: E({ mx: 0.9, my: 0, c: 0.25, h: 0.6, sd: 10, si: 10, orig: 0, abre: 6, ancho: 1.0, sonr: 0.7 }),
    guino: E({ mx: 0.95, my: -0.3, wd: 1, h: 0.85, sd: 6, si: 16, gi: 0.12, orig: 0, abre: 18, ancho: 1.08, sonr: 1.0, lengua: 0.25 })
  };
  const GUION_CG = [
    [T.mira0, T.mira0 + 0.35, "mira"], [T.llama0 + 0.15, T.llama0 + 0.45, "ansia"], [T.alza1 - 0.2, T.alza1 + 0.1, "pose"],
    [T.ojo1, T.ojo1 + 0.3, "culpa"], [T.alza2 + 0.05, T.alza2 + 0.35, "pose"], [T.picor0, T.picor0 + 0.45, "picor"],
    [T.achis - 0.06, T.achis + 0.02, "achis", salida], [T.flash2 + 0.25, T.flash2 + 0.6, "perdon"], [T.orejas0 - 0.15, T.orejas0 + 0.2, "picaro"],
    [T.flash3 - 0.3, T.flash3 - 0.08, "pose3"], [T.gira + 0.05, T.gira + 0.2, "pillado"], [T.silba0, T.silba0 + 0.25, "silba"],
    [T.perdona + 0.15, T.perdona + 0.45, "alivio"], [T.finalPose, T.finalPose + 0.3, "guino"]
  ];
  // parpadeos (el del primer flash va aparte: ojos cerrados justo en el fogonazo)
  const PARP_G = [1.0, 4.25, 7.05, 9.95];
  const ojosFlash1 = t => tramo(t, T.flash1 - 0.09, T.flash1 - 0.03) * (1 - tramo(t, T.flash1 + 0.2, T.flash1 + 0.32));

  const P0G = { dx: 0, pel: 0, torso: 0, cab: 0 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    erguido: CuG({}),
    arrima: CuG({ dx: 4, pel: 6, torso: 0.07, cab: 0.07 }),
    rasca: CuG({ dx: 0, pel: 4, torso: 0.0, cab: 0.06 }),
    picor: CuG({ dx: -2, pel: 2, torso: -0.1, cab: -0.2 }),
    achis: CuG({ dx: 8, pel: 14, torso: 0.2, cab: 0.26 }),
    perdon: CuG({ dx: 2, pel: 6, torso: 0.03, cab: 0.08 }),
    orejas: CuG({ dx: 8, pel: 8, torso: 0.11, cab: 0.05 }),
    silba: CuG({ dx: -2, pel: 2, torso: -0.05, cab: -0.12 }),
    final: CuG({ dx: 8, pel: 10, torso: 0.1, cab: 0.12 })
  };
  const GUION_G = [
    [T.paso0, T.paso1, "arrima", suave5], [T.rasca0 - 0.1, T.rasca0 + 0.25, "rasca"], [T.alza2, T.alza2 + 0.35, "arrima"],
    [T.picor0, T.picor0 + 0.5, "picor"], [T.achis - 0.06, T.achis + 0.03, "achis", salida], [T.flash2 + 0.2, T.flash2 + 0.65, "perdon"],
    [T.orejas0, T.orejas0 + 0.45, "orejas"], [T.esconde, T.esconde + 0.3, "silba"], [T.perdona + 0.15, T.perdona + 0.5, "arrima"],
    [T.finalPose - 0.1, T.finalPose + 0.3, "final"]
  ];
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const PASOS_G = { cerca: [[-10, -9, XG0 - 19], [T.paso0, T.paso0 + 0.32, XG1 - 19]], lejos: [[-10, -9, XG0 + 18], [T.paso0 + 0.16, T.paso0 + 0.48, XG1 + 20]] };
  function pieG(lado, t) {
    const Ls = PASOS_G[lado]; let i = 0; while (i + 1 < Ls.length && t >= Ls[i + 1][0]) i++;
    const [t0, t1, x] = Ls[i], xa = i > 0 ? Ls[i - 1][2] : x, u = fase(t, t0, t1), arco = Math.sin(Math.PI * u);
    return { x: lerp(xa, x, suave5(u)), y: TOB_G[lado] - 40 * arco, ang: -0.18 * arco };
  }

  // manos de Guillermo (hoja). Cercana: bolsillo → rascarse la nuca → bolsillo → uve junto a la mejilla
  const MANOS_GC = {
    bolsillo: p => { const b = G.tronco(p)(BOLS_G.c); return { x: b.x, y: b.y, ang: 0, mu: -1.75, k: 0, d: D(0, 0, 0, 0) }; },
    rasca: (p, t) => {
      const H = G.cabeza(p), ras = 0.5 + 0.5 * Math.sin((t - T.rasca0) * 17);
      const q = H.a({ x: 552 + 16 * ras, y: 498 - 18 * ras });
      return { x: q.x, y: q.y, ang: 0.3, mu: 1.25, k: 1, d: D(0.35, 0.55 + 0.35 * ras, 0.5 + 0.35 * ras, 0.5 + 0.3 * ras) };
    },
  };
  const GUION_GC = [[T.rasca0 - 0.15, T.rasca0 + 0.25, "rasca"], [T.rasca1, T.rasca1 + 0.35, "bolsillo"]];

  /* ================= Laura ================= */
  const CL = {
    inicio: E({ mx: 0.8, my: 0.1 }),
    movil: E({ mx: 0.75, my: 0.6, orig: 0, sonr: 0.45, sd: 6, si: 6 }),
    llama: E({ mx: -0.92, my: 0, orig: 0, sonr: 0.75, abre: 4, ancho: 0.95, sd: 14, si: 14, gd: 0.08, gi: 0.08 }),
    pose: E({ mx: 0.95, my: -0.25, orig: 0, sonr: 0.85, abre: 10, ancho: 1.0, sd: 10, si: 10 }),
    mira: E({ mx: 0.85, my: 0.6, orig: 0, sonr: 0.15, sd: 8, si: 8 }),
    reojo: E({ mx: -0.95, my: 0.05, c: 0.38, sd: -4, si: 12, gd: -0.1, gi: 0.12, orig: 0, sonr: -0.2, ancho: 0.85 }),
    risita: E({ mx: -0.9, my: 0.1, c: 0.3, h: 0.7, sd: 8, si: 8, orig: 0, sonr: 0.6, abre: 3, ancho: 0.85 }),
    salpica: E({ mx: -0.5, my: 0, c: 1, z: 0.85, sd: -6, si: -6, gd: -0.12, gi: -0.12, orig: 0, abre: 6, ancho: 0.8, sonr: -0.45 }),
    asco: E({ mx: -0.95, my: 0.05, c: 0.35, sd: -9, si: -9, gd: -0.18, gi: -0.18, orig: 0, abre: 5, ancho: 0.75, sonr: -0.55 }),
    morros: E({ mx: 0.95, my: -0.25, c: 0.3, sd: 14, si: 14, gd: 0.08, gi: 0.08, orig: 0, abre: 3, ancho: 0.42, sonr: 0.12 }),
    mira3: E({ mx: 0.8, my: 0.6, orig: 0, sonr: 0.1, sd: 8, si: 8 }),
    pasmo: E({ mx: 0.8, my: 0.55, iris: 0.82, sd: 20, si: 20, gd: 0.1, gi: 0.1, orig: 0, abre: 14, ancho: 0.62, sonr: -0.1 }),
    sospecha: E({ mx: -0.95, my: 0, c: 0.42, sd: -7, si: 15, gd: -0.14, gi: 0.14, orig: 0, abre: 0, ancho: 0.8, sonr: -0.3 }),
    sonrie: E({ mx: -0.9, my: 0.05, c: 0.25, h: 0.6, sd: 8, si: 8, orig: 0, abre: 4, ancho: 0.95, sonr: 0.7 }),
    feliz: E({ mx: 0.95, my: -0.25, c: 1, h: 1, sd: 12, si: 12, gd: 0.06, gi: 0.06, orig: 0, abre: 16, ancho: 1.05, sonr: 1.0, rub: 0.35 })
  };
  const GUION_CL = [
    [T.saca0, T.saca0 + 0.3, "movil"], [T.llama0, T.llama0 + 0.25, "llama"], [T.alza0 + 0.15, T.alza0 + 0.45, "pose"],
    [T.baja1, T.baja1 + 0.25, "mira"], [T.ojo1, T.ojo1 + 0.2, "reojo"], [T.ojo1 + 0.55, T.ojo1 + 0.85, "risita"],
    [T.alza2 + 0.05, T.alza2 + 0.35, "pose"], [T.achis + 0.03, T.achis + 0.1, "salpica", salida], [T.limpia0 + 0.15, T.limpia0 + 0.4, "asco"],
    [T.alza3 + 0.1, T.morros + 0.15, "morros"], [T.baja3, T.baja3 + 0.25, "mira3"], [T.pilla, T.pilla + 0.12, "pasmo"],
    [T.gira, T.gira + 0.25, "sospecha"], [T.perdona, T.perdona + 0.35, "sonrie"], [T.finalPose, T.finalPose + 0.3, "feliz"]
  ];
  const PARP_L = [0.55, 2.0, 4.35, 7.55, 9.9];

  const P0L = { dx: 0, pel: 0, torso: 0, cab: 0 };
  const CuL = o => Object.assign({}, P0L, o);
  const CUER_L = {
    erguida: CuL({}),
    saca: CuL({ pel: 6, torso: 0.05, cab: 0.04 }),
    llama: CuL({ pel: 2, torso: -0.04, cab: -0.12 }),
    pose: CuL({ pel: 4, torso: -0.05, cab: -0.1 }),
    mira: CuL({ pel: 6, torso: 0.05, cab: 0.08 }),
    asco: CuL({ dx: 4, pel: 4, torso: 0.07, cab: 0.1 }),
    morros: CuL({ pel: 4, torso: -0.06, cab: -0.14 }),
    gira: CuL({ pel: 2, torso: -0.05, cab: -0.16 }),
    final: CuL({ pel: 6, torso: -0.08, cab: -0.17 })
  };
  const GUION_L = [
    [T.saca0, T.saca1, "saca"], [T.llama0, T.llama0 + 0.3, "llama"], [T.alza0, T.alza1, "pose"], [T.baja1, T.baja1 + 0.3, "mira"],
    [T.alza2, T.alza2 + 0.35, "pose"], [T.flash2 + 0.02, T.flash2 + 0.35, "asco"], [T.alza3, T.morros, "morros"],
    [T.baja3, T.baja3 + 0.3, "mira"], [T.gira, T.gira + 0.3, "gira"], [T.alza4, T.alza4 + 0.35, "pose"], [T.finalPose, T.finalPose + 0.3, "final"]
  ];

  // mano lejana de Laura: el móvil (hoja, respecto a su hombro)
  const MOVIL_K = 1;
  const MANOS_LL = {
    bolsillo: p => { const b = L.tronco(p)(L.BOLSILLO_L); return { x: b.x, y: b.y, ang: 0, mu: -1.75, k: 0, d: D(0.35, 0.4, 0.4, 0.4) }; },
    pecho: p => { const h = L.tronco(p)(L.HOMBRO); return { x: h.x + 175, y: h.y + 95, ang: -0.12, mu: -2.35, k: 1, d: D(0.45, 0.42, 0.42, 0.4) }; },
    alto: (p, t) => { const h = L.tronco(p)(L.HOMBRO); const v = 3 * Math.sin(t * 2.2);
      return { x: h.x + 222, y: h.y - 168 + v, ang: -0.22, mu: -2.55, k: 1, d: D(0.45, 0.42, 0.42, 0.4) }; }
  };
  const GUION_LL = [
    [T.saca0, T.saca1, "pecho", suave5], [T.alza0, T.alza1, "alto", suave5], [T.baja1, T.baja1 + 0.3, "pecho"], [T.alza2 - 0.05, T.alza2 + 0.35, "alto"],
    [T.baja3 - 0.05, T.baja3 + 0.25, "pecho"], [T.alza4, T.alza4 + 0.35, "alto"]
  ];
  // mano cercana de Laura: bolsillo → limpiarse la mejilla → bolsillo → uve bajo la barbilla
  const MANOS_LC = {
    bolsillo: p => { const b = L.tronco(p)(L.BOLSILLO_C); return { x: b.x, y: b.y, ang: 0, mu: -1.75, k: 0, d: D(0, 0, 0, 0) }; },
    limpia: (p, t) => {
      const H = L.cabeza(p), fr = Math.sin((t - T.limpia0) * 15) * tramo(t, T.limpia0 + 0.2, T.limpia0 + 0.35);
      const q = H.a({ x: 738 + 18 * fr, y: 600 - 22 * fr });
      return { x: q.x - 18, y: q.y + 10, ang: 0.15, mu: 1.9, k: 1, d: D(0.75, 0.92, 0.92, 0.85) };
    },
    uve: (p, t) => {
      const H = L.cabeza(p), q = H.a({ x: 770, y: 790 });
      return { x: q.x, y: q.y + 2 * Math.sin((t - T.finalPose) * 3 + 1), ang: 0.1, mu: 1.55, k: 1, d: D(0, 1, 1, 0) };
    }
  };
  const GUION_LC = [[T.limpia0 - 0.1, T.limpia0 + 0.25, "limpia"], [T.limpia1, T.limpia1 + 0.35, "bolsillo"], [T.finalPose - 0.15, T.finalPose + 0.3, "uve"]];

  /* ---------- posturas ---------- */
  function poseG(t, pL) {
    const b = linea(GUION_G, CUER_G, "erguido", t);
    const respira = Math.sin(t * 2.3 + 0.4);
    const avance = lerp(XG0, XG1, suave5(fase(t, T.paso0, T.paso0 + 0.5)));
    const p = {
      x: avance + b.dx, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }, tirasLimpias: true, ikContinuo: true
    };
    // estornudo: latigazo de la cabeza
    const ac = t >= T.achis - 0.04 ? Math.exp(-Math.max(0, t - T.achis) * 7) * suave(fase(t, T.achis - 0.04, T.achis + 0.02)) : 0;
    p.cabeza.esc = { x: 1 + 0.05 * ac, y: 1 - 0.06 * ac }; p.cabeza.dy = 8 * ac;
    // picor: la nariz tiembla (la cabeza da tironcitos hacia atrás)
    p.cabeza.ang += -0.03 * Math.sin((t - T.picor0) * 22) * campana(t, T.picor0 + 0.1, T.achis - 0.04);
    // silbando: balanceo inocente
    p.cabeza.ang += 0.05 * Math.sin((t - T.silba0) * 5) * tramo(t, T.silba0, T.silba0 + 0.3) * (1 - tramo(t, T.perdona, T.perdona + 0.3));
    for (const lado of ["cerca", "lejos"]) { const f = pieG(lado, t); p.piernas[lado] = { tob: { x: G.PELVIS.x + (f.x - p.x) / S, y: f.y }, ang: f.ang }; }
    // cara
    const e = linea(GUION_CG, CG, "inicio", t);
    p.cara = cara(e, Math.max(parpadeo(t, PARP_G), ojosFlash1(t)));
    p.rojo = e.rojo; p.cara.rubor = e.rub;
    // manos
    const mc = lineaMano(GUION_GC, MANOS_GC, "bolsillo", p, t);
    p.manoCerca = aMano(mc, -1);
    // lejana: bolsillo → frotarse la nariz → bolsillo → orejas de conejo tras la cabeza de Laura → bolsillo
    const Tr = G.tronco(p), bol = Tr(BOLS_G.l);
    let ml = { x: bol.x, y: bol.y, ang: 0, mu: -1.75, k: 0, d: D(0, 0, 0, 0) };
    const H = G.cabeza(p);
    const fr = tramo(t, T.frota0, T.frota0 + 0.3) * (1 - tramo(t, T.frota1, T.frota1 + 0.35));
    if (fr > 0.0005) {
      const osc = Math.sin((t - T.frota0) * 16) * tramo(t, T.frota0 + 0.25, T.frota0 + 0.4) * (1 - tramo(t, T.frota1 - 0.2, T.frota1));
      const q = H.a({ x: 930 + 22 * osc, y: 705 });
      ml = mezclaMano(ml, { x: q.x + 12, y: q.y + 24, ang: -0.1, mu: 2.45, k: 1, d: D(0.2, 1, 0.1, 0) }, fr);
    }
    const oj = tramo(t, T.orejas0, T.orejas0 + 0.5) * (1 - tramo(t, T.esconde, T.esconde + 0.3));
    if (oj > 0.0005 && pL) {
      const cima = L.aPantalla(pL, L.cabeza(pL).a({ x: 745, y: 205 }));
      const q = G.aHoja(p, { x: cima.x - 4, y: cima.y - 2 + 2 * Math.sin(t * 6) });
      const vv = tramo(t, T.orejas0 + 0.3, T.orejas0 + 0.5);
      // las orejas se mueven (dedos que se doblan un poco)
      const meneo = 0.12 * (0.5 + 0.5 * Math.sin((t - T.orejas0) * 9)) * tramo(t, T.orejas0 + 0.45, T.orejas0 + 0.6);
      ml = mezclaMano(ml, { x: q.x, y: q.y, ang: 0.05, mu: 1.45, k: 1, d: D(0, lerp(0.3, 1 - meneo, vv), lerp(0.3, 1 - meneo, vv), 0) }, oj);
    }
    // foto final: uve bajo la barbilla
    const uv = tramo(t, T.finalPose - 0.15, T.finalPose + 0.3);
    if (uv > 0.0005) {
      const q = H.a({ x: 815, y: 905 });
      ml = mezclaMano(ml, { x: q.x, y: q.y + 3 * Math.sin((t - T.finalPose) * 3), ang: 0.05, mu: 1.5, k: 1, d: D(0, 1, 1, 0) }, uv);
    }
    p.manoLejos = aMano(ml, -1);
    return p;
  }

  function poseL(t) {
    const b = linea(GUION_L, CUER_L, "erguida", t);
    const respira = Math.sin(t * 2.1 + 1.3);
    // «niega con la cabeza» sonriendo
    const niega = Math.sin((t - T.perdona) * 13) * campana(t, T.perdona - 0.05, T.perdona + 0.5);
    const p = {
      x: XL + b.dx, suelo: SUELO, s: S,
      pelvis: { x: L.PELVIS.x, y: L.PELVIS.y + b.pel + respira * 1.1 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.05 * niega, dx: 0, dy: 0, esc: { x: 1, y: 1 } }, tirasLimpias: true, ikContinuo: true
    };
    const ty = L.SUELO - L.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: L.PELVIS.x - 58, y: ty }, ang: 0 };
    p.piernas.lejos = { tob: { x: L.PELVIS.x + 62, y: ty - 10 }, ang: 0 };
    // melena: inercia del torso y la ráfaga del estornudo (la empuja hacia delante)
    const d = (linea(GUION_L, CUER_L, "erguida", t).cab - linea(GUION_L, CUER_L, "erguida", t - 0.1).cab) / 0.1;
    const rafaga = t >= T.achis ? Math.exp(-(t - T.achis) * 3.5) * suave(fase(t, T.achis, T.achis + 0.12)) : 0;
    p.pelo = { inercia: clamp(-0.5 * d, -0.7, 0.7), viento: 1.3 * rafaga * (1 + 0.2 * Math.sin((t - T.achis) * 20)) + 0.1 * Math.sin(t * 0.9) };
    // cara
    const e = linea(GUION_CL, CL, "inicio", t);
    p.cara = cara(e, parpadeo(t, PARP_L, 0.13));
    p.rojo = e.rojo; p.cara.rubor = e.rub;
    // manos
    p.manoCerca = aMano(lineaMano(GUION_LC, MANOS_LC, "bolsillo", p, t), -1);
    const ml = lineaMano(GUION_LL, MANOS_LL, "bolsillo", p, t);
    const m = aMano(ml, 1);
    m.objeto = (g, tt) => movil(g, tt, ml.k);
    p.manoLejos = m;
    return p;
  }
  const poses = t => { const l = poseL(t); return { g: poseG(t, l), l }; };

  /* ---------- el móvil (unidades de mano; origen en el puño) ---------- */
  const MOV = { x0: -15, y0: -60, w: 30, h: 66, r: 7 };
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r);
    g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath(); }
  function movil(g, t, k) {
    if (k <= 0.01) return;
    const f = flashK(t);
    g.save(); g.scale(k, k); g.lineJoin = "round";
    const { x0, y0, w, h, r } = MOV;
    // canto de la pantalla (mira hacia ellos): una franja que se enciende con el flash
    rr(g, x0 - 5, y0 + 2, 10, h - 4, 4); g.fillStyle = f > 0.02 ? `rgb(${Math.round(lerp(150, 255, f))},${Math.round(lerp(205, 255, f))},255)` : "#96cdf0"; g.fill();
    g.lineWidth = 2; g.strokeStyle = "#0b0a0e"; g.stroke();
    // trasera con funda coral
    rr(g, x0, y0, w, h, r); const gr = g.createLinearGradient(x0, 0, x0 + w, 0); gr.addColorStop(0, "#ff8c9b"); gr.addColorStop(0.55, "#ee6a80"); gr.addColorStop(1, "#c94b63");
    g.fillStyle = gr; g.fill(); g.lineWidth = 2.4; g.strokeStyle = "#0b0a0e"; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.35)"; rr(g, x0 + 4, y0 + 6, 5, h - 18, 2.5); g.fill();
    // módulo de cámara: dos lentes y el led
    rr(g, x0 + 5, y0 + 5, 17, 25, 5); g.fillStyle = "#3a2a33"; g.fill(); g.lineWidth = 1.6; g.stroke();
    for (const [cx, cy] of [[x0 + 13.5, y0 + 11.5], [x0 + 13.5, y0 + 23]]) { g.fillStyle = "#14141c"; g.beginPath(); g.arc(cx, cy, 4.6, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = "#4f6fa8"; g.beginPath(); g.arc(cx, cy, 2.4, 0, Math.PI * 2); g.fill(); g.fillStyle = "#ffffff"; g.beginPath(); g.arc(cx - 1.2, cy - 1.2, 0.9, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = f > 0.02 ? "#ffffff" : "#ffe9a8"; g.beginPath(); g.arc(x0 + 25, y0 + 9, 2.4, 0, Math.PI * 2); g.fill(); g.lineWidth = 1; g.stroke();
    g.restore();
  }
  // punto del móvil en pantalla (para el destello)
  function puntoMovil(pL, local) {
    const m = pL.manoLejos, k = m.puno > 0 ? Math.min(1, m.puno) : 0;
    const q = rot({ x: local.x * k * L.JK, y: local.y * k * L.JK }, m.ang || 0);
    return L.aPantalla(pL, { x: m.x + q.x, y: m.y + q.y });
  }

  /* ---------- flash ---------- */
  function flashK(t) {
    let f = 0;
    for (const tf of FLASHES) {
      if (t < tf - 0.1) continue;
      f = Math.max(f, t < tf ? Math.pow(Math.sin(fase(t, tf - 0.1, tf) * Math.PI / 2), 2) : Math.exp(-(t - tf) * 7.5));
    }
    return f;
  }
  // pre-destello del led justo antes de cada foto
  const preDestello = t => FLASHES.reduce((a, tf) => Math.max(a, campana(t, tf - 0.42, tf - 0.3)), 0);
  function destello(g, t, pL) {
    const f = flashK(t), pre = preDestello(t);
    if (f < 0.01 && pre < 0.01) return;
    const c = puntoMovil(pL, { x: MOV.x0 - 2, y: MOV.y0 + MOV.h * 0.42 });
    g.save(); g.globalCompositeOperation = "lighter";
    const r = 30 + 150 * f + 26 * pre, gr = g.createRadialGradient(c.x, c.y, 2, c.x, c.y, r);
    gr.addColorStop(0, `rgba(255,255,255,${0.95 * Math.max(f, pre * 0.6)})`); gr.addColorStop(0.3, `rgba(220,240,255,${0.55 * Math.max(f, pre * 0.5)})`); gr.addColorStop(1, "rgba(200,230,255,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(c.x, c.y, r, 0, Math.PI * 2); g.fill();
    if (f > 0.05) { g.strokeStyle = `rgba(255,255,255,${0.8 * f})`; g.lineWidth = 3; g.lineCap = "round";
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + 0.3, r0 = 14 + 10 * f, r1 = r0 + 30 * f; g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1); g.stroke(); } }
    g.restore();
  }

  /* ---------- efectos ---------- */
  // picor: la nariz se mueve (rayitas); estornudo: gotitas hacia la cara de Laura
  let BOCA_ACHIS = null;
  function estornudo(g, t, pG) {
    const H = G.cabeza(pG);
    const pic = campana(t, T.picor0 + 0.1, T.flash2 - 0.02);
    if (pic > 0.01) {
      const n = G.aPantalla(pG, H.a({ x: 905, y: 665 }));
      g.save(); g.strokeStyle = `rgba(20,16,20,${0.7 * pic})`; g.lineWidth = 2; g.lineCap = "round";
      for (let i = 0; i < 3; i++) { const a = -0.9 + i * 0.5 + 0.15 * Math.sin(t * 30 + i); g.beginPath(); g.moveTo(n.x + Math.cos(a) * 14, n.y + Math.sin(a) * 14); g.lineTo(n.x + Math.cos(a) * 22, n.y + Math.sin(a) * 22); g.stroke(); }
      g.restore();
    }
    const u = t - T.achis; if (u < 0 || u > 0.95) return;
    if (!BOCA_ACHIS) { const q = poses(T.achis); BOCA_ACHIS = G.aPantalla(q.g, G.boca(q.g)); }
    const o = BOCA_ACHIS;
    g.save();
    for (let i = 0; i < 30; i++) {
      const a = -0.45 + (hash(i + 300) - 0.5) * 0.95, v = 230 + 300 * hash(i + 301), tt = Math.max(0, u - 0.025 * hash(i + 302));
      const x = o.x + 6 + Math.cos(a) * v * tt, y = o.y + Math.sin(a) * v * tt + 300 * tt * tt;
      const al = clamp(1.15 - u / 0.6) * (tt > 0 ? 1 : 0); if (al <= 0) continue;
      g.globalAlpha = al; g.fillStyle = i % 3 ? "#d9f3ff" : "#ffffff"; g.strokeStyle = "#2f6688"; g.lineWidth = 1.2;
      g.beginPath(); g.arc(x, y, 2 + 2.6 * hash(i + 303), 0, Math.PI * 2); g.fill(); g.stroke();
    }
    // nubecilla del estornudo
    const k = salida(fase(u, 0, 0.3)), al = clamp(1 - u / 0.75);
    g.globalAlpha = 0.55 * al; g.fillStyle = "#eef8ff"; g.strokeStyle = "rgba(60,100,130,0.6)"; g.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(o.x + 14 + 30 * k + i * 10 * k, o.y - 2 + (i % 2 ? 7 : -7) * k, 5 + 9 * k, 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.restore();
  }
  function notas(g, t, pG) {
    const k = tramo(t, T.silba0 + 0.05, T.silba0 + 0.25) * (1 - tramo(t, T.perdona + 0.1, T.perdona + 0.35)); if (k <= 0.01) return;
    const b = G.aPantalla(pG, G.boca(pG));
    g.save(); g.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const ph = ((t - T.silba0) * 0.9 + i / 3) % 1, x = b.x + 12 + 40 * ph + 6 * Math.sin(ph * 9 + i), y = b.y - 10 - 60 * ph;
      g.globalAlpha = k * Math.sin(Math.PI * ph); g.fillStyle = "#ffe08a"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.6;
      g.save(); g.translate(x, y); g.rotate(-0.2 + 0.2 * Math.sin(ph * 6)); g.scale(0.9, 0.9);
      g.beginPath(); g.ellipse(0, 0, 5.5, 4, -0.4, 0, Math.PI * 2); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(5, -1.5); g.lineTo(5, -18); g.quadraticCurveTo(10, -14, 12, -10); g.stroke();
      g.restore();
    }
    g.restore();
  }
  function brillos(g, t, pG, pL) {
    const k = tramo(t, T.finalPose + 0.1, T.finalPose + 0.35); if (k <= 0.01) return;
    const a = G.aPantalla(pG, G.cabeza(pG).a({ x: 860, y: 760 })), b = L.aPantalla(pL, L.cabeza(pL).a({ x: 860, y: 640 }));
    g.save();
    for (const [c, f] of [[a, 0], [b, 1.3]]) {
      const tw = 0.5 + 0.5 * Math.sin(t * 9 + f), r = (6 + 4 * tw) * k;
      g.fillStyle = "#ffffff"; g.globalAlpha = 0.9 * k;
      g.beginPath(); for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4, rr2 = i % 2 ? r * 0.3 : r; g.lineTo(c.x + 16 + Math.cos(an) * rr2, c.y - 6 + Math.sin(an) * rr2); } g.closePath(); g.fill();
    }
    g.restore();
  }
  // rayitas que marcan el meneo de las «orejas de conejo»
  function orejitas(g, t, pG) {
    const k = tramo(t, T.orejas0 + 0.45, T.orejas0 + 0.6) * (1 - tramo(t, T.esconde - 0.05, T.esconde + 0.1)); if (k <= 0.01) return;
    const m = pG.manoLejos, c = G.aPantalla(pG, { x: m.x, y: m.y });
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.85 * k})`; g.lineWidth = 2; g.lineCap = "round";
    const w = Math.sin((t - T.orejas0) * 9);
    for (const [dx, a] of [[-12, Math.PI + 0.5], [12, -0.5]]) {
      const x = c.x + dx + 2 * w, y = c.y - 16;
      for (let i = -1; i <= 1; i++) { const aa = a + i * 0.35; g.beginPath(); g.moveTo(x + Math.cos(aa) * 4, y + Math.sin(aa) * 4); g.lineTo(x + Math.cos(aa) * 10, y + Math.sin(aa) * 10); g.stroke(); }
    }
    g.restore();
  }
  // luz del móvil en la cara de Laura cuando mira la pantalla
  function luzPantalla(g, t, pL) {
    const k = (tramo(t, T.baja1 + 0.1, T.baja1 + 0.3) * (1 - tramo(t, T.alza2 - 0.1, T.alza2 + 0.1)) +
               tramo(t, T.baja3 + 0.1, T.baja3 + 0.3) * (1 - tramo(t, T.alza4 - 0.1, T.alza4 + 0.1)));
    if (k <= 0.01) return;
    const c = L.aPantalla(pL, L.cabeza(pL).a({ x: 860, y: 560 }));
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createRadialGradient(c.x, c.y, 4, c.x, c.y, 62); gr.addColorStop(0, `rgba(120,170,255,${0.22 * k})`); gr.addColorStop(1, "rgba(120,170,255,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(c.x, c.y, 62, 0, Math.PI * 2); g.fill(); g.restore();
  }

  /* ---------- decorado: azotea a la hora azul ---------- */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60);
    const cielo = g.createLinearGradient(0, -60, 0, 340);
    cielo.addColorStop(0, "#0b1030"); cielo.addColorStop(0.4, "#232a63"); cielo.addColorStop(0.72, "#4f478c"); cielo.addColorStop(0.9, "#a06e9e"); cielo.addColorStop(1, "#e3a08c");
    g.fillStyle = cielo; g.fillRect(-40, -60, W + 80, 420);
    // estrellas
    for (let i = 0; i < 80; i++) { const x = -40 + hash(i + 11) * (W + 80), y = -55 + hash(i + 97) * 210, r = 0.5 + hash(i + 7) * 1.3;
      g.globalAlpha = 0.25 + 0.6 * hash(i + 3) * clamp(1 - (y + 55) / 230); g.fillStyle = "#fff6e0"; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
    g.globalAlpha = 1;
    // ciudad: dos capas de edificios con ventanas encendidas
    const capas = [[300, "#2a2c64", "#3a3a78", 0.35, 70, 150], [330, "#191a40", "#24254f", 0.55, 40, 120]];
    capas.forEach(([base, col, borde, luces, hmin, hmax], ci) => {
      let x = -40, n = 0;
      while (x < W + 40) {
        const w = 34 + hash(ci * 100 + n) * 60, h = hmin + hash(ci * 100 + n + 50) * (hmax - hmin);
        g.fillStyle = col; g.fillRect(x, base - h, w, h + 50);
        g.fillStyle = borde; g.fillRect(x, base - h, w, 3);
        if (hash(ci * 100 + n + 7) > 0.7) { g.fillStyle = col; g.fillRect(x + w * 0.4, base - h - 18, 4, 18); }
        for (let yy = base - h + 8; yy < base - 6; yy += 11) for (let xx = x + 5; xx < x + w - 6; xx += 9) {
          const hh = hash(xx * 0.37 + yy * 1.7 + ci * 13);
          if (hh < luces) { g.fillStyle = hh < luces * 0.25 ? "#ffd27a" : hh < luces * 0.6 ? "#ffb85c" : "#e8e2ff"; g.globalAlpha = 0.55 + 0.4 * hash(xx + yy); g.fillRect(xx, yy, 4, 5); g.globalAlpha = 1; }
        }
        x += w + 2; n++;
      }
    });
    // antena con luz roja
    g.strokeStyle = "#191a40"; g.lineWidth = 4; g.beginPath(); g.moveTo(905, 205); g.lineTo(905, 120); g.stroke();
    const roja = g.createRadialGradient(905, 118, 1, 905, 118, 16); roja.addColorStop(0, "rgba(255,80,80,0.9)"); roja.addColorStop(1, "rgba(255,60,60,0)");
    g.fillStyle = roja; g.beginPath(); g.arc(905, 118, 16, 0, Math.PI * 2); g.fill();
    // pretil y barandilla de cristal
    g.fillStyle = "#2b2236"; g.fillRect(-40, 452, W + 80, 26);
    g.fillStyle = "#3b304a"; g.fillRect(-40, 452, W + 80, 4);
    const vid = g.createLinearGradient(0, 360, 0, 452); vid.addColorStop(0, "rgba(170,200,255,0.16)"); vid.addColorStop(1, "rgba(120,150,220,0.3)");
    g.fillStyle = vid; g.fillRect(-40, 362, W + 80, 90);
    g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 3;
    for (let x = -10; x < W + 40; x += 150) { g.beginPath(); g.moveTo(x + 20, 372); g.lineTo(x + 60, 440); g.stroke(); g.beginPath(); g.moveTo(x + 40, 372); g.lineTo(x + 66, 416); g.stroke(); }
    g.fillStyle = "#9aa3b8"; for (let x = -10; x < W + 40; x += 150) { g.fillRect(x - 4, 356, 8, 98); }
    g.fillStyle = "#c9d1e2"; g.fillRect(-40, 352, W + 80, 9); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.strokeRect(-41, 352, W + 82, 9);
    // tarima de madera
    const mad = g.createLinearGradient(0, 478, 0, H + 60); mad.addColorStop(0, "#5e3f2c"); mad.addColorStop(1, "#3a2519");
    g.fillStyle = mad; g.fillRect(-40, 478, W + 80, H + 60 - 478);
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 2;
    let yy = 478; for (let i = 0; yy < H + 60; i++) { g.beginPath(); g.moveTo(-40, yy); g.lineTo(W + 40, yy); g.stroke();
      const paso = 9 + i * 4; for (let x = -40 + (i * 53) % 120; x < W + 40; x += 160 + i * 20) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x, yy + paso); g.stroke(); } yy += paso; }
    g.fillStyle = "rgba(255,200,140,0.08)"; g.fillRect(-40, 478, W + 80, 3);
    // macetero con planta grande (izquierda)
    planta(g, 118, 552);
    // mesita con dos copas y una vela (derecha)
    g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse(902, 556, 60, 7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#1c1a22"; g.fillRect(898, 432, 8, 122); g.fillRect(872, 550, 60, 6);
    g.fillStyle = "#e9e3d8"; g.beginPath(); g.ellipse(902, 430, 62, 12, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.stroke();
    copa(g, 878, 418, "#ff7aa8"); copa(g, 930, 418, "#ffb347");
    g.fillStyle = "#f4ede0"; g.fillRect(897, 402, 10, 22); g.strokeRect(897, 402, 10, 22);
    // guirnalda de bombillas
    g.strokeStyle = "#141218"; g.lineWidth = 2;
    const cat = x => 40 + 70 * Math.sin(Math.PI * (x + 40) / (W + 80));
    g.beginPath(); for (let x = -40; x <= W + 40; x += 8) { const y = cat(x); if (x === -40) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke();
    for (let i = 0; i < 17; i++) { const x = -20 + i * 66, y = cat(x) + 8;
      const halo = g.createRadialGradient(x, y + 6, 1, x, y + 6, 26); halo.addColorStop(0, "rgba(255,214,140,0.65)"); halo.addColorStop(1, "rgba(255,200,120,0)");
      g.fillStyle = halo; g.beginPath(); g.arc(x, y + 6, 26, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#2a2630"; g.fillRect(x - 3, y - 4, 6, 5);
      g.fillStyle = "#ffe6a6"; g.beginPath(); g.ellipse(x, y + 6, 5, 7, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#5a3a10"; g.lineWidth = 1; g.stroke(); }
    // viñeta
    const v = g.createRadialGradient(560, 290, 280, 560, 290, 720); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.5)");
    g.fillStyle = v; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }
  function copa(g, x, y, col) {
    g.save(); g.lineJoin = "round"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.6;
    g.fillStyle = "rgba(230,240,255,0.5)"; g.beginPath(); g.ellipse(x, y + 12, 7, 2, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(x, y + 11); g.lineTo(x, y - 2); g.stroke();
    g.beginPath(); g.moveTo(x - 11, y - 18); g.lineTo(x + 11, y - 18); g.lineTo(x, y - 2); g.closePath(); g.fillStyle = col; g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.moveTo(x - 7, y - 16); g.lineTo(x - 3, y - 16); g.lineTo(x - 2, y - 8); g.closePath(); g.fill();
    g.restore();
  }
  function planta(g, x, y) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse(x, y + 4, 54, 7, 0, 0, Math.PI * 2); g.fill();
    const hojas = [[-70, -150, -0.9, 46], [-30, -190, -0.35, 52], [20, -200, 0.15, 54], [64, -160, 0.75, 48], [-62, -95, -1.2, 40], [70, -100, 1.15, 40], [0, -130, 0, 44]];
    for (const [dx, dy, a, r] of hojas) {
      g.strokeStyle = "#1d3a24"; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y - 50); g.quadraticCurveTo(x + dx * 0.3, y + dy * 0.5, x + dx, y + dy); g.stroke();
      g.save(); g.translate(x + dx, y + dy); g.rotate(a);
      g.fillStyle = "#2f6b3e"; g.beginPath(); g.ellipse(0, -r * 0.5, r * 0.55, r * 0.8, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#3f8a50"; g.beginPath(); g.ellipse(-r * 0.15, -r * 0.6, r * 0.28, r * 0.55, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.4; g.beginPath(); g.ellipse(0, -r * 0.5, r * 0.55, r * 0.8, 0, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = "#1d3a24"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, 0.25 * r); g.lineTo(0, -r * 1.2); g.stroke();
      g.restore();
    }
    g.fillStyle = "#b5643c"; g.beginPath(); g.moveTo(x - 46, y - 60); g.lineTo(x + 46, y - 60); g.lineTo(x + 36, y); g.lineTo(x - 36, y); g.closePath(); g.fill();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.6; g.stroke();
    g.fillStyle = "#cf7a4c"; g.fillRect(x - 48, y - 66, 96, 10); g.strokeRect(x - 48, y - 66, 96, 10);
    g.restore();
  }
  // titileo de unas bombillas y la llama de la vela (por fotograma, barato)
  function vivos(g, t) {
    g.save(); g.globalCompositeOperation = "lighter";
    for (const i of [3, 8, 13]) { const x = -20 + i * 66, y = 40 + 70 * Math.sin(Math.PI * (x + 40) / (W + 80)) + 14;
      const a = 0.18 * (0.5 + 0.5 * Math.sin(t * (2.1 + i * 0.3) + i)); g.fillStyle = `rgba(255,210,130,${a})`; g.beginPath(); g.arc(x, y, 14, 0, Math.PI * 2); g.fill(); }
    const fl = 1 + 0.12 * ruido(t * 7);
    const gr = g.createRadialGradient(902, 396, 1, 902, 396, 26); gr.addColorStop(0, "rgba(255,190,90,0.55)"); gr.addColorStop(1, "rgba(255,170,60,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(902, 396, 26, 0, Math.PI * 2); g.fill();
    g.restore();
    g.save(); g.fillStyle = "#ffcf5a"; g.strokeStyle = "#7a3d00"; g.lineWidth = 1;
    g.beginPath(); g.moveTo(902, 402); g.quadraticCurveTo(897, 396, 902, 388 - 3 * fl); g.quadraticCurveTo(907, 396, 902, 402); g.fill(); g.stroke(); g.restore();
  }

  /* ---------- escena (sin interfaz: también sirve para pintar las fotos) ---------- */
  function escena(g, t, pp, enFoto) {
    g.drawImage(fondo, -40, -60);
    vivos(g, t);
    g.save(); g.fillStyle = "rgba(0,0,0,0.35)";
    g.beginPath(); g.ellipse(pp.g.x + 6, SUELO + 1, 82, 8, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(pp.l.x + 4, SUELO + 1, 74, 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
    G.dibujar(g, pp.g, t);
    L.dibujar(g, pp.l, t);
    luzPantalla(g, t, pp.l);
    estornudo(g, t, pp.g);
    if (!enFoto) { notas(g, t, pp.g); destello(g, t, pp.l); orejitas(g, t, pp.g); }
  }

  /* ---------- fotos ---------- */
  const FW = 300, FH = 196, fotos = {};
  function foto(i) {
    if (fotos[i]) return fotos[i];
    const tf = FLASHES[i], pp = poses(tf);
    const c = document.createElement("canvas"); c.width = FW; c.height = FH; const g = c.getContext("2d");
    const a = G.aPantalla(pp.g, G.centroCabeza(pp.g)), b = L.aPantalla(pp.l, L.centroCabeza(pp.l));
    const cx = (a.x + b.x) / 2 + 14, cy = (a.y + b.y) / 2 + 14;
    g.save(); g.translate(FW / 2, FH / 2); g.scale(1.05, 1.05); g.translate(-cx, -cy); escena(g, tf, pp, true); g.restore();
    g.fillStyle = "rgba(255,255,255,0.13)"; g.fillRect(0, 0, FW, FH);           // fogonazo del flash en la foto
    return (fotos[i] = c);
  }
  // foto pequeña que sale en la esquina tras cada flash (la que mira Laura en el móvil)
  function miniatura(g, t, i) {
    const tf = FLASHES[i], t0 = tf + 0.16, t1 = tf + 1.35;
    if (t < t0 || t > t1 + 0.4) return;
    const entra = fase(t, t0, t0 + 0.35), sale = suave(fase(t, t1, t1 + 0.4));
    const esc = 0.55 + 0.45 * M2.rebote(entra, 1.4), giro = [-0.07, 0.06, -0.05][i] - 0.25 * (1 - salida(entra)) - 0.2 * sale;
    const x = 186 - 420 * sale * sale, y = 150 + 30 * (1 - salida(entra)) + 40 * sale * sale;
    const im = foto(i), bw = FW * 0.98, bh = FH * 0.98, borde = 9;
    g.save(); g.translate(x, y); g.rotate(giro); g.scale(esc, esc); g.globalAlpha = clamp(entra * 3) * (1 - sale * 0.6);
    g.fillStyle = "rgba(0,0,0,0.4)"; g.fillRect(-bw / 2 - borde + 6, -bh / 2 - borde + 8, bw + borde * 2, bh + borde * 2 + 22);
    g.fillStyle = "#fbf8f2"; g.fillRect(-bw / 2 - borde, -bh / 2 - borde, bw + borde * 2, bh + borde * 2 + 22);
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.strokeRect(-bw / 2 - borde, -bh / 2 - borde, bw + borde * 2, bh + borde * 2 + 22);
    g.drawImage(im, -bw / 2, -bh / 2, bw, bh);
    g.lineWidth = 1.5; g.strokeRect(-bw / 2, -bh / 2, bw, bh);
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const fin = tramo(t, T.finalPose - 0.4, T.flash4 - 0.1, suave);
    const lento = 0.04 * tramo(t, 0.5, T.finalPose - 0.4);
    return { k: 1 + lento + 0.3 * fin, x: lerp(520, 596, fin) + 10 * tramo(t, 0.5, T.finalPose - 0.4) * (1 - fin), y: lerp(300, 246, fin) };
  }
  const aplicaCamara = (g, cam) => { g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y); };

  /* ---------- foto final congelada ---------- */
  let congelada = null;
  function fotoFinal() {
    if (congelada) return congelada;
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    const tf = T.flash4, pp = poses(tf);
    g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
    g.save(); aplicaCamara(g, camara(tf)); escena(g, tf, pp, true); g.restore();
    return (congelada = c);
  }
  function dibFinal(g, t) {
    const u = salida(fase(t, T.flash4 + 0.12, T.flash4 + 0.85)), asienta = Math.sin(Math.PI * fase(t, T.flash4 + 0.6, T.flash4 + 1.2)) * 0.008;
    // mesa oscura detrás de la foto
    const fondoF = g.createRadialGradient(512, 300, 60, 512, 300, 620); fondoF.addColorStop(0, "#3a2f3f"); fondoF.addColorStop(1, "#120d16");
    g.fillStyle = fondoF; g.fillRect(0, 0, W, H);
    const esc = lerp(1, 0.78, u), giro = lerp(0, -0.045, u) + asienta, borde = lerp(0, 16, u), pie = lerp(0, 34, u);
    g.save(); g.translate(512, 300 - 8 * u); g.rotate(giro); g.scale(esc, esc);
    if (u > 0.001) {
      g.fillStyle = `rgba(0,0,0,${0.5 * u})`; g.fillRect(-512 - borde + 14, -300 - borde + 18, 1024 + 2 * borde, 600 + 2 * borde + pie);
      g.fillStyle = "#fbf8f2"; g.fillRect(-512 - borde, -300 - borde, 1024 + 2 * borde, 600 + 2 * borde + pie);
    }
    g.drawImage(fotoFinal(), -512, -300);
    if (u > 0.001) { g.strokeStyle = `rgba(11,10,14,${u})`; g.lineWidth = 3; g.strokeRect(-512 - borde, -300 - borde, 1024 + 2 * borde, 600 + 2 * borde + pie); g.lineWidth = 2; g.strokeRect(-512, -300, 1024, 600); }
    // brillo del papel fotográfico
    if (u > 0.001) { const br = g.createLinearGradient(-512, -300, 200, 300); br.addColorStop(0, `rgba(255,255,255,${0.12 * u})`); br.addColorStop(0.5, "rgba(255,255,255,0)");
      g.fillStyle = br; g.fillRect(-512, -300, 1024, 600); }
    g.restore();
  }

  class GuillermoLauraSelfie extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !L.listo()) return;
      if (!fondo) fondo = creaFondo();
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      if (t < T.flash4) {
        const pp = poses(t);
        g.save(); aplicaCamara(g, camara(t)); escena(g, t, pp, false); g.restore();
        for (let i = 0; i < 3; i++) miniatura(g, t, i);
      } else dibFinal(g, t);
      const f = flashK(t);
      if (f > 0.003) { g.fillStyle = `rgba(255,255,255,${0.62 * f})`; g.fillRect(0, 0, W, H); }
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00018", nombre: "Guillermo y Laura · El selfie", crear: () => new GuillermoLauraSelfie() });
  window.__A2D_00018 = { pose: poses, T, DUR };
})();
