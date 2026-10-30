"use strict";
/* 00019 · Guillermo y Laura · El paraguas
 *
 * Negro → noche de lluvia a la salida del bar (portal con luz cálida, toldo que gotea, acera mojada
 * con charcos, farola y luna). Laura se tapa la cabeza con la mano; Guillermo, con un paraguas
 * grande cerrado como si fuera un bastón, la mira y se hace el galán a cámara → hace molinete con el
 * paraguas, lo abre de golpe y la cubre; ella sonríe encantada y él saca pecho → se levanta viento:
 * la lluvia se inclina, vuelan hojas, a Laura se le alborota la melena y el paraguas cabecea →
 * una racha le da la vuelta al paraguas: tirón, Guillermo se queda de puntillas y sale volando
 * agarrado al paraguas, pataleando, como Mary Poppins; desde arriba le dice adiós a Laura con cara de
 * apuro y desaparece por arriba → Laura, otra vez bajo la lluvia, se encoge de hombros, saca un
 * paraguas plegable del bolsillo y lo abre → le dice adiós al cielo: Guillermo, chiquitito, cruza
 * por delante de la luna colgado del paraguas → ella guiña un ojo a cámara → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, L = Laura;
  const S = 0.27, SUELO = 545, XG = 400, XL = 612;
  const DUR = 13.6;
  const T = {
    mira0: 0.45, chulo0: 1.1, giro0: 1.62, suelta: 1.84, giro1: 2.48, abre: 2.64, cubre0: 2.74, cubre1: 3.22,
    sonrie: 3.3, corazon: 3.55, camara0: 3.95, viento0: 4.65, preocupa: 5.0, racha: 5.5, tiron1: 5.95, despega: 6.1,
    abajo: 7.05, adiosG0: 7.25, adiosG1: 8.05, sale: 8.75,
    sigue0: 5.62, tapa0: 6.35, tapa1: 7.35, encoge: 8.55, saca0: 9.05, sube: 9.4, abreL: 9.72,
    adios0: 10.1, adios1: 11.55, luna0: 10.25, luna1: 12.35, guino: 11.95, fin: 12.75
  };

  /* ---------- utilidades de posturas ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, -1.75), l: punoDesde({ x: 372, y: 648 }, -1.75) };
  const BOLS_L = { c: L.BOLSILLO_C, l: L.BOLSILLO_L };
  const D = (pu, ix, re) => ({ pulgar: pu, indice: ix, medio: re, anular: re, menique: re });
  const mezclaD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k), anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const PALMA = D(1, 1, 1), PUNO = D(0, 0, 0);

  /* ---------- viento (0 calma … 1 vendaval) ---------- */
  function viento(t) {
    const sube = tramo(t, T.viento0, T.racha - 0.05, suave);
    const racha = t >= T.racha - 0.1 ? Math.exp(-Math.max(0, t - T.racha) * 1.6) * suave(fase(t, T.racha - 0.1, T.racha + 0.05)) : 0;
    const baja = tramo(t, T.sale - 0.4, T.adios0, suave);
    return lerp(0.4 * sube + 0.55 * racha + 0.55 * tramo(t, T.racha, T.racha + 0.3), 0.12, baja) + 0.06 * ruido(t * 1.7) * sube;
  }

  /* ---------- caras (se mezclan) ---------- */
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
    inicio: E({ mx: 0.85, my: 0.05 }),
    mira: E({ mx: 0.9, my: 0.1, orig: 0, sonr: 0.3, sd: 8, si: 8, gd: 0.1, gi: 0.1 }),
    chulo: E({ mx: -0.85, my: -0.1, sd: 15, gd: 0.16, si: -3, gi: -0.06, orig: 0, sonr: 0.72, ancho: 0.95 }),
    sigue: E({ mx: 0.45, my: -0.9, iris: 1.05, sd: 16, si: 16, gd: 0.08, gi: 0.08, orig: 0, sonr: 0.5, ancho: 0.85 }),
    galante: E({ mx: 0.9, my: -0.35, c: 0.12, sd: 10, si: 10, orig: 0, sonr: 0.65, ancho: 0.95 }),
    tierno: E({ mx: 0.92, my: -0.05, c: 0.2, sd: 12, si: 12, gd: 0.08, gi: 0.08, orig: 0, sonr: 0.7, rub: 0.45 }),
    orgullo: E({ mx: -0.85, my: -0.05, c: 0.35, h: 0.7, sd: 12, si: 12, orig: 0, sonr: 0.9, ancho: 1.05, rub: 0.35 }),
    preocupa: E({ mx: 0.35, my: -0.95, iris: 0.92, sd: 17, si: 23, gd: 0.26, gi: 0.32, orig: 0, abre: 7, ancho: 0.6, sonr: -0.35 }),
    susto: E({ mx: 0.15, my: -0.95, iris: 0.72, sd: 27, si: 27, gd: 0.1, gi: 0.1, orig: 0, abre: 42, ancho: 0.75, sonr: -0.1, lengua: 0.3 }),
    panico: E({ mx: 0.25, my: 0.75, iris: 0.74, sd: 25, si: 25, gd: 0.32, gi: 0.32, orig: 0, abre: 52, ancho: 1.0, sonr: -0.45, lengua: 0.5 }),
    adios: E({ mx: 0.75, my: 0.9, c: 0.22, h: 0.55, sd: 13, si: 13, gd: 0.24, gi: 0.24, orig: 0, abre: 9, ancho: 0.95, sonr: 0.55, rub: 0.35 }),
    arriba: E({ mx: 0.1, my: -0.95, iris: 0.85, sd: 22, si: 22, gd: 0.2, gi: 0.2, orig: 0, abre: 30, ancho: 0.8, sonr: -0.2 })
  };
  const GUION_CG = [
    [T.mira0, T.mira0 + 0.35, "mira"], [T.chulo0, T.chulo0 + 0.3, "chulo"], [T.giro0 - 0.05, T.giro0 + 0.2, "sigue"], [T.giro1 - 0.1, T.giro1 + 0.2, "galante"],
    [T.cubre1 - 0.1, T.cubre1 + 0.25, "tierno"], [T.camara0, T.camara0 + 0.3, "orgullo"], [T.preocupa, T.preocupa + 0.3, "preocupa"],
    [T.racha - 0.02, T.racha + 0.1, "susto"], [T.despega - 0.05, T.despega + 0.25, "panico"], [T.abajo, T.abajo + 0.3, "adios"],
    [T.adiosG1, T.adiosG1 + 0.3, "arriba"]
  ];
  const PARP_G = [0.3, 2.05, 3.7, 4.55, 7.9];

  const P0G = { dx: 0, pel: 0, torso: 0, cab: 0, tex: 1, tey: 1 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    erguido: CuG({}),
    mira: CuG({ dx: 2, pel: 2, torso: 0.02, cab: 0.03 }),
    chulo: CuG({ dx: 0, pel: 0, torso: -0.03, cab: -0.05, tex: 1.02 }),
    gira: CuG({ dx: 6, pel: 8, torso: 0.05, cab: 0.02 }),
    cubre: CuG({ dx: 10, pel: 4, torso: 0.05, cab: -0.02 }),
    orgullo: CuG({ dx: 8, pel: 0, torso: -0.06, cab: -0.07, tex: 1.05, tey: 1.02 }),
    preocupa: CuG({ dx: 6, pel: 8, torso: 0.0, cab: -0.14 }),
    tiron: CuG({ dx: -2, pel: -34, torso: -0.05, cab: -0.2, tey: 1.03 }),
    vuela: CuG({ dx: 0, pel: -14, torso: -0.06, cab: -0.08 }),
    adios: CuG({ dx: 0, pel: -14, torso: 0.02, cab: 0.16 }),
    arriba: CuG({ dx: 0, pel: -14, torso: -0.06, cab: -0.12 })
  };
  const GUION_G = [
    [T.mira0, T.mira0 + 0.4, "mira"], [T.chulo0, T.chulo0 + 0.3, "chulo"], [T.giro0, T.giro1, "gira"], [T.cubre0, T.cubre1, "cubre", suave5],
    [T.camara0, T.camara0 + 0.35, "orgullo"], [T.preocupa, T.preocupa + 0.35, "preocupa"], [T.racha + 0.05, T.tiron1, "tiron", salida],
    [T.despega, T.despega + 0.5, "vuela"], [T.abajo, T.abajo + 0.35, "adios"], [T.adiosG1, T.adiosG1 + 0.35, "arriba"]
  ];
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };

  // mano del paraguas respecto al hombro lejano (px de pantalla) y eje del paraguas (0 = arriba, + hacia la derecha)
  const PM = {
    baston: { x: 18, y: 78, th: Math.PI - 0.05 },
    lanza: { x: 52, y: 22 },
    alto: { x: 50, y: -72, th: 0.08 },
    cubre: { x: 58, y: -58, th: 0.2 },
    tiron: { x: 50, y: -64, th: -0.3 }
  };
  // ángulo del paraguas a lo largo de la escena (antes de despegar; en vuelo se añade el viento)
  function ejeParaguas(t) {
    // lo lanza al aire dando vuelta y media y lo coge por el mango con la punta hacia arriba
    let th = PM.baston.th - 0.12 * campana(t, T.giro0, T.suelta);
    const k = fase(t, T.suelta, T.giro1);
    if (t >= T.suelta) th = lerp(PM.baston.th, 4 * Math.PI + PM.alto.th, suave5(k));
    if (t >= T.giro1) th = lerp(PM.alto.th, PM.cubre.th, suave5(fase(t, T.cubre0, T.cubre1))) - 0.08 * Math.exp(-(t - T.giro1) * 9) * Math.sin((t - T.giro1) * 30);
    // cabeceo con el viento
    const w = viento(t);
    th += (0.05 + 0.12 * w) * Math.sin(t * 7.3) * tramo(t, T.viento0, T.racha) - 0.1 * w * tramo(t, T.viento0, T.racha);
    if (t >= T.racha) th = lerp(th, PM.tiron.th, salida(fase(t, T.racha, T.racha + 0.25)));
    th += 0.12 * Math.sin((t - T.racha) * 5.1) * tramo(t, T.racha + 0.2, T.racha + 0.6) - 0.06 * Math.sin(t * 2.3) * tramo(t, T.despega, T.despega + 0.6);
    return th;
  }
  // apertura (0 cerrado … 1 abierto … 2 del revés), con rebote al abrirse y al darse la vuelta
  function aperturaGrande(t) {
    let a = clamp(salida(fase(t, T.abre, T.abre + 0.16)) + 0.12 * Math.sin(Math.PI * fase(t, T.abre + 0.1, T.abre + 0.35)));
    // el viento lo va levantando antes de la racha
    a += 0.18 * tramo(t, T.viento0 + 0.3, T.racha) * (0.5 + 0.5 * Math.sin(t * 9.1));
    // racha: se da la vuelta
    const v = fase(t, T.racha, T.racha + 0.17);
    a = lerp(a, 2 + 0.1 * Math.sin(Math.PI * fase(t, T.racha + 0.12, T.racha + 0.42)), suave(v));
    return a;
  }
  // vuelo: desplazamiento del cuerpo (px de pantalla) y balanceo (rad) colgado de la mano
  function vuelo(t) {
    const u = Math.max(0, t - T.despega);
    const pre = tramo(t, T.racha + 0.05, T.despega, suave);
    const fy = -14 * pre - (40 * u + 98 * u * u);
    const fx = -(22 * u + 26 * u * u);
    const en = tramo(t, T.despega - 0.05, T.despega + 0.4);
    const sw = (-0.16 + 0.2 * Math.sin(u * 3.4 + 0.4) * Math.exp(-u * 0.25)) * en;
    return { fx, fy, sw, en };
  }

  // durante el lanzamiento: posición del mango (pantalla); el centro del paraguas hace una parábola
  const LARGO = 92;                          // del mango al centro del paraguas plegado (px)
  const dirEje = th => ({ x: Math.sin(th), y: -Math.cos(th) });
  let LANZ = null;
  function vueloParaguas(t, p) {
    if (!LANZ) {
      const a = poseG(T.suelta - 1e-4), b = poseG(T.giro1 + 1e-4);
      const d0 = dirEje(a.paraguas.th), d1 = dirEje(b.paraguas.th);
      LANZ = { c0: { x: a.paraguas.mano.x + d0.x * LARGO, y: a.paraguas.mano.y + d0.y * LARGO },
               c1: { x: b.paraguas.mano.x + d1.x * LARGO, y: b.paraguas.mano.y + d1.y * LARGO } };
    }
    const k = fase(t, T.suelta, T.giro1), th = ejeParaguas(t), d = dirEje(th);
    const c = { x: lerp(LANZ.c0.x, LANZ.c1.x, k) + 22 * Math.sin(Math.PI * k), y: lerp(LANZ.c0.y, LANZ.c1.y, k) - 4 * 215 * k * (1 - k) };
    return { x: c.x - d.x * LARGO, y: c.y - d.y * LARGO };
  }

  function poseG(t) {
    const b = linea(GUION_G, CUER_G, "erguido", t);
    const respira = Math.sin(t * 2.3 + 0.4);
    const V = vuelo(t);
    const p = {
      x: XG + b.dx + V.fx, suelo: SUELO + V.fy, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 },
      torso: b.torso, torsoEsc: { x: b.tex, y: b.tey + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }, tirasLimpias: true
    };
    // pies: de pie, de puntillas al tirón y pataleando en el aire
    const punt = tramo(t, T.racha + 0.08, T.tiron1, salida), aire = tramo(t, T.despega - 0.05, T.despega + 0.35);
    for (const lado of ["cerca", "lejos"]) {
      const f = lado === "cerca" ? 0 : Math.PI;
      const pat = Math.sin((t - T.despega) * 9.5 + f), pat2 = Math.cos((t - T.despega) * 9.5 + f);
      const base = { x: G.PELVIS.x + (lado === "cerca" ? -19 : 18) / S, y: TOB_G[lado] };
      const pun = { x: base.x + 8, y: base.y - 46 };
      const cuelga = { x: G.PELVIS.x + (lado === "cerca" ? -30 : 26) + 70 * pat2, y: TOB_G.cerca + 26 - 95 * Math.max(0, pat) };
      const q = mezcla(mezcla(base, pun, punt), cuelga, aire);
      p.piernas[lado] = { tob: q, ang: lerp(lerp(0, 0.5, punt), 0.55 + 0.25 * pat, aire) };
    }
    // cara
    const e = linea(GUION_CG, CG, "inicio", t);
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.rojo = e.rojo; p.cara.rubor = e.rub;
    p.sudor = 0.7 * tramo(t, T.preocupa, T.racha) * (1 - tramo(t, T.despega, T.despega + 0.4));
    // grito: la boca tiembla
    if (t > T.despega) p.cara.boca.abre += 6 * Math.sin(t * 31) * (1 - tramo(t, T.abajo - 0.2, T.abajo + 0.1));
    // --- manos ---
    const Tr = G.tronco(p), hl = Tr(G.HOMBRO), hc = Tr(G.HOMBRO_C);
    const hlS = G.aPantalla(p, hl);
    // paraguas: mano lejana
    let off = { x: PM.baston.x, y: PM.baston.y + 8 * campana(t, T.giro0, T.giro0 + 0.16) };
    off = mezcla(off, PM.lanza, salida(fase(t, T.giro0 + 0.1, T.suelta)));
    off = mezcla(off, PM.alto, suave5(fase(t, T.suelta + 0.05, T.giro1 - 0.08)));
    off = { x: off.x, y: off.y + 7 * campana(t, T.giro1 - 0.02, T.giro1 + 0.16) };        // el peso del paraguas al cogerlo
    off = mezcla(off, PM.cubre, suave5(fase(t, T.cubre0, T.cubre1)));
    off = mezcla(off, { x: PM.cubre.x - 6, y: PM.cubre.y - 3 }, tramo(t, T.preocupa, T.racha));
    off = mezcla(off, PM.tiron, salida(fase(t, T.racha, T.racha + 0.22)));
    // el viento sacude la mano
    const w = viento(t);
    off = { x: off.x + 4 * w * ruido(t * 6), y: off.y + 3 * w * ruido(t * 6 + 7) };
    const th = ejeParaguas(t);
    const manoS = { x: hlS.x + off.x, y: hlS.y + off.y };
    const mL = G.aHoja(p, manoS);
    const mu = lerp(-1.75, -4.05, suave(fase(t, T.giro0 + 0.1, T.suelta + 0.4)));
    // dedos: agarra el mango, se abre al soltar, espera abierta y se cierra al cogerlo
    const abreM = tramo(t, T.suelta - 0.04, T.suelta + 0.06) * (1 - tramo(t, T.giro1 - 0.05, T.giro1 + 0.03));
    const AGARRA = D(0.25, 0.3, 0.32);
    // el puño sigue al mango; mientras el paraguas vuela la mano pasa suavemente a su postura de espera
    const libre = campana(t, T.suelta - 0.06, T.giro1 + 0.06);
    const angM = lerp(0.22 * Math.sin(2 * th), 0.1, Math.pow(libre, 0.5));
    p.manoLejos = { x: mL.x, y: mL.y, ang: angM - V.sw, mu, dobla: -1, puno: 1,
      dedos: mezclaD(AGARRA, PALMA, abreM) };
    // mano cercana: en el bolsillo; en el vuelo agita la mano y luego dice adiós
    const bc = Tr(BOLS_G.c);
    let c = { x: bc.x, y: bc.y }, cmu = -1.75, cang = 0, cpu = 0, dedos = PUNO;
    const sale = tramo(t, T.racha + 0.05, T.racha + 0.3);
    if (sale > 0) {
      const hcS = G.aPantalla(p, hc);
      const agita = { x: hcS.x - 62 + 10 * Math.sin(t * 13), y: hcS.y - 10 + 14 * Math.sin(t * 11 + 1) };
      const adios = tramo(t, T.adiosG0, T.adiosG0 + 0.25) * (1 - tramo(t, T.adiosG1, T.adiosG1 + 0.3));
      const saluda = { x: hcS.x - 56 + 5 * Math.sin((t - T.adiosG0) * 7), y: hcS.y - 34 };
      const obj = G.aHoja(p, mezcla(agita, saluda, adios));
      c = mezcla(c, obj, sale);
      cmu = lerp(-1.75, lerp(-1.2, -4.5, adios), sale); cang = lerp(0, lerp(0.25 * Math.sin(t * 13), 0.45 * Math.sin((t - T.adiosG0) * 7), adios), sale) - V.sw;
      cpu = sale; dedos = mezclaD(PUNO, PALMA, sale);
    }
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: -1, puno: cpu, dedos };
    let ancla = manoS;
    if (t >= T.suelta && t < T.giro1) ancla = vueloParaguas(t, p);
    p.paraguas = { th, mano: ancla, abre: aperturaGrande(t), enMano: t < T.suelta || t >= T.giro1 };
    p.vuelo = V;
    return p;
  }

  /* ================= Laura ================= */
  const CL = {
    inicio: E({ mx: 0.55, my: -0.7, sd: 8, si: 15, gd: 0.12, gi: 0.24, orig: 0, sonr: -0.32, ancho: 0.78 }),
    mira: E({ mx: 0.9, my: 0.02, sd: 10, si: 12, gd: 0.05, gi: 0.1, orig: 0, sonr: -0.05, ancho: 0.85 }),
    encantada: E({ mx: 0.92, my: -0.15, c: 0.28, h: 0.7, sd: 12, si: 12, orig: 0, sonr: 0.85, ancho: 0.95, rub: 0.75 }),
    viento: E({ mx: 0.6, my: -0.35, c: 0.55, z: 0.45, sd: -4, si: -4, orig: 0, abre: 5, ancho: 0.72, sonr: -0.3 }),
    sorpresa: E({ mx: 0.65, my: -0.95, iris: 0.86, sd: 22, si: 22, gd: 0.05, gi: 0.05, orig: 0, abre: 26, ancho: 0.7, sonr: 0 }),
    tapa: E({ mx: 0.55, my: -0.95, iris: 0.9, sd: 20, si: 20, gd: 0.15, gi: 0.15, orig: 0, abre: 8, ancho: 0.6, sonr: -0.2 }),
    encoge: E({ mx: -0.85, my: 0.05, c: 0.2, sd: 17, si: 7, gd: 0.16, gi: -0.05, orig: 0, sonr: 0.35, ancho: 0.85 }),
    plegable: E({ mx: 0.1, my: 0.55, c: 0.1, sd: 8, si: 10, orig: 0, sonr: 0.45, ancho: 0.9 }),
    adios: E({ mx: 0.6, my: -0.9, c: 0.22, h: 0.85, sd: 13, si: 13, orig: 0, sonr: 0.9, ancho: 1.0, abre: 7 }),
    guino: E({ mx: -0.85, my: -0.1, wd: 1, h: 0.8, sd: 6, si: 14, gi: 0.1, orig: 0, sonr: 0.82, ancho: 0.95, rub: 0.25 })
  };
  const GUION_CL = [
    [T.mira0 + 0.3, T.mira0 + 0.65, "mira"], [T.sonrie, T.sonrie + 0.35, "encantada"], [T.viento0 + 0.2, T.viento0 + 0.6, "viento"],
    [T.sigue0, T.sigue0 + 0.2, "sorpresa"], [T.tapa0, T.tapa0 + 0.3, "tapa"], [T.encoge, T.encoge + 0.3, "encoge"],
    [T.saca0, T.saca0 + 0.3, "plegable"], [T.adios0 - 0.1, T.adios0 + 0.3, "adios"], [T.guino, T.guino + 0.3, "guino"]
  ];
  const PARP_L = [1.0, 2.9, 4.3, 8.25, 9.6, 11.3];

  const P0L = { dx: 0, pel: 0, torso: 0, cab: 0, hom: 0 };
  const CuL = o => Object.assign({}, P0L, o);
  const CUER_L = {
    encogida: CuL({ pel: 8, torso: 0.06, cab: 0.04, hom: 0.4 }),
    erguida: CuL({ pel: 2, torso: 0.02, cab: 0 }),
    coqueta: CuL({ pel: 0, torso: -0.03, cab: -0.07 }),
    viento: CuL({ dx: -2, pel: 8, torso: 0.1, cab: 0.06, hom: 0.3 }),
    mira: CuL({ dx: 4, pel: 4, torso: -0.08, cab: -0.24 }),
    encoge: CuL({ dx: 0, pel: 6, torso: 0.02, cab: 0.08, hom: 1 }),
    saca: CuL({ dx: 0, pel: 10, torso: 0.08, cab: 0.05 }),
    adios: CuL({ dx: 2, pel: 2, torso: -0.06, cab: -0.2 }),
    final: CuL({ dx: 0, pel: 2, torso: -0.02, cab: -0.06 })
  };
  const GUION_L = [
    [T.sonrie - 0.1, T.sonrie + 0.35, "erguida"], [T.corazon, T.corazon + 0.4, "coqueta"], [T.viento0 + 0.2, T.racha, "viento"],
    [T.sigue0, T.sigue0 + 0.5, "mira"], [T.encoge, T.encoge + 0.25, "encoge"], [T.encoge + 0.3, T.saca0 + 0.2, "saca"],
    [T.adios0 - 0.1, T.adios0 + 0.35, "adios"], [T.guino - 0.2, T.guino + 0.2, "final"]
  ];

  function poseL(t) {
    const b = linea(GUION_L, CUER_L, "encogida", t);
    const respira = Math.sin(t * 2.1 + 1.3);
    const hombros = b.hom * (1 - 0.6 * campana(t, T.encoge, T.encoge + 0.55) * 0) + 0.6 * campana(t, T.encoge, T.encoge + 0.6);
    const p = {
      x: XL - b.dx, suelo: SUELO, s: S, espejo: true,
      pelvis: { x: L.PELVIS.x, y: L.PELVIS.y + b.pel + respira * 1.1 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.02 * hombros },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 8 * hombros, esc: { x: 1, y: 1 } }, tirasLimpias: true
    };
    const ty = L.SUELO - L.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: L.PELVIS.x - 55, y: ty }, ang: 0 };
    p.piernas.lejos = { tob: { x: L.PELVIS.x + 60, y: ty - 10 }, ang: 0 };
    // melena: el viento sopla desde la derecha (por detrás de ella) y la echa hacia delante
    const w = viento(t);
    p.pelo = { viento: 1.5 * w * (1 + 0.25 * Math.sin(t * 9)) * (1 - 0.7 * cubiertaL(t)), inercia: 0.15 * Math.sin(t * 1.3) };
    // cara
    const e = linea(GUION_CL, CL, "inicio", t);
    p.cara = cara(e, parpadeo(t, PARP_L, 0.13));
    p.cara.rubor = e.rub;
    // --- manos ---
    const Tr = L.tronco(p), hl = Tr(L.HOMBRO), hc = Tr(L.HOMBRO_C);
    const H = L.cabeza(p);
    // mano lejana: visera sobre la frente → bolsillo → boca → bolsillo → adiós → bolsillo
    const bl = Tr(BOLS_L.l);
    const frente = L.aPantalla(p, H.a({ x: 780, y: 205 }));
    const visera = L.aHoja(p, { x: frente.x, y: frente.y });
    const boca = L.aPantalla(p, L.boca(p));
    const tapaB = L.aHoja(p, { x: boca.x - 4, y: boca.y + 6 });
    const hlS = L.aPantalla(p, hl);
    const ola = Math.sin((t - T.adios0) * 11);
    const adios = L.aHoja(p, { x: hlS.x - 42 + 12 * ola, y: hlS.y - 78 });
    let m = { x: bl.x, y: bl.y }, mu = -1.75, ang = 0, dd = PUNO, pu = 0;
    const tapa = suave5(fase(t, T.tapa0, T.tapa0 + 0.35)) * (1 - suave5(fase(t, T.tapa1, T.tapa1 + 0.4)));
    if (tapa > 0) { m = mezcla(m, tapaB, tapa); mu = lerp(mu, -4.35, tapa); ang = lerp(ang, 0.1, tapa); dd = mezclaD(dd, D(0.6, 1, 1), tapa); pu = Math.max(pu, clamp(tapa * 2)); }
    const ad = suave5(fase(t, T.adios0, T.adios0 + 0.4)) * (1 - suave5(fase(t, T.adios1, T.adios1 + 0.45)));
    if (ad > 0) { m = mezcla(m, adios, ad); mu = lerp(mu, -4.6, ad); ang = lerp(ang, 0.3 * ola, ad); dd = mezclaD(dd, PALMA, ad); pu = Math.max(pu, clamp(ad * 2)); }
    p.manoLejos = { x: m.x, y: m.y, ang, mu, dobla: 1, puno: pu, dedos: dd };
    // mano cercana: bolsillo → saca el plegable → lo sube por encima de la cabeza
    const bc = Tr(BOLS_L.c);
    const hcS = L.aPantalla(p, hc);
    const frenteC = L.aHoja(p, { x: hcS.x - 8, y: hcS.y + 36 });
    const alto = L.aHoja(p, { x: hcS.x + 4, y: hcS.y - 44 });
    const sale = suave5(fase(t, T.saca0, T.saca0 + 0.35)), sube = suave5(fase(t, T.sube, T.abreL + 0.05));
    let c = mezcla(mezcla(bc, frenteC, sale), alto, sube);
    c.x += 2 * Math.sin(t * 1.9) * sube; c.y += 1.5 * Math.sin(t * 2.3) * sube;
    // al principio la mano cercana hace de tejadillo sobre la cabeza (tiembla con el chaparrón) y baja al bolsillo
    const baja1 = suave5(fase(t, T.sonrie, T.sonrie + 0.5));
    const visC = { x: visera.x + 2 * Math.sin(t * 17), y: visera.y };
    const vis = 1 - baja1;
    // baja por detrás de la cabeza (por la nuca), no por delante de la cara
    const nuca = L.aHoja(p, L.aPantalla(p, H.a({ x: 600, y: 560 })));
    const viaN = mezcla(mezcla(visC, nuca, clamp(baja1 * 2)), c, clamp(baja1 * 2 - 1));
    c = vis >= 1 ? visC : (baja1 >= 1 ? c : viaN);
    const dC = mezclaD(PUNO, D(0.85, 1, 1), clamp(vis * 1.6));
    p.manoCerca = { x: c.x, y: c.y, ang: lerp(0, -0.25, vis), mu: lerp(lerp(-1.75, -4.4, sube), -3.0, vis), dobla: -1, puno: Math.max(clamp(sale * 1.4), clamp(vis * 1.6)),
      dedos: vis > 0.001 ? dC : undefined };
    if (!p.manoCerca.dedos) delete p.manoCerca.dedos;
    p.plegable = { mano: L.aPantalla(p, c), visible: clamp((sale - 0.35) / 0.3), abre: aperturaPeque(t), th: -0.05 + 0.04 * Math.sin(t * 1.7) * sube };
    return p;
  }
  // ¿está Laura bajo el paraguas de Guillermo? (para la melena y el gesto)
  function cubiertaL(t) { return tramo(t, T.cubre0 + 0.2, T.cubre1) * (1 - tramo(t, T.racha, T.racha + 0.2)); }
  function aperturaPeque(t) { return clamp(salida(fase(t, T.abreL, T.abreL + 0.14)) + 0.14 * Math.sin(Math.PI * fase(t, T.abreL + 0.08, T.abreL + 0.3))); }

  /* ---------- paraguas ---------- */
  // Dibujado en pantalla desde la mano: eje th (0 = punta hacia arriba). a: 0 plegado, 1 abierto, 2 del revés.
  const GRANDE = { mango: 24, vara: 168, varilla: 160, tela: ["#c8202c", "#e94a3f"], forro: "#7d0f1a", lunares: false, gancho: true };
  const PEQUE = { mango: 12, vara: 92, varilla: 84, tela: ["#f58fb4", "#ffb5cf"], forro: "#b84f7a", lunares: true, gancho: false };
  function phiDe(a) { return a <= 1 ? lerp(0.07, 1.18, a) : lerp(1.18, 2.42, a - 1); }
  function geomParaguas(st, a, e) {
    const phi = phiDe(a), ya = -st.vara * e, Lr = st.varilla * e;
    const tipD = { x: Lr * Math.sin(phi), y: ya + Lr * Math.cos(phi) }, tipI = { x: -tipD.x, y: tipD.y };
    const bow = 24 * e * suave(fase(phi, 0.15, 0.85)) * (1 - 2 * suave(fase(phi, 1.45, 2.15)));
    return { phi, ya, Lr, tipD, tipI, bow };
  }
  // punto de una varilla (de la punta del eje al extremo) con su comba
  function varilla(A, P, bow, u, lado) {
    const dx = P.x - A.x, dy = P.y - A.y, l = Math.hypot(dx, dy) || 1;
    let nx = dy / l, ny = -dx / l; if (lado < 0) { nx = -nx; ny = -ny; }
    const cx = (A.x + P.x) / 2 + nx * bow, cy = (A.y + P.y) / 2 + ny * bow;
    const k = 1 - u;
    return { x: k * k * A.x + 2 * k * u * cx + u * u * P.x, y: k * k * A.y + 2 * k * u * cy + u * u * P.y, cx, cy };
  }
  function paraguas(g, o, th, a, st, e, t) {
    const Gm = geomParaguas(st, a, e), A = { x: 0, y: Gm.ya };
    g.save(); g.translate(o.x, o.y); g.rotate(th); g.lineJoin = "round"; g.lineCap = "round";
    const tinta = "#0b0a0e";
    // mango (madera) bajo la mano
    g.strokeStyle = tinta; g.lineWidth = 7.5 * e + 2.6;
    const mango = () => { g.beginPath(); g.moveTo(0, -4 * e); g.lineTo(0, st.mango * e);
      if (st.gancho) g.arc(-9 * e, st.mango * e, 9 * e, 0, Math.PI, false); };
    mango(); g.stroke(); g.strokeStyle = st.gancho ? "#8a4b22" : "#3a3a44"; g.lineWidth = 7.5 * e; mango(); g.stroke();
    // vara
    g.strokeStyle = tinta; g.lineWidth = 3.4 * e + 2.2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, Gm.ya - 14 * e); g.stroke();
    g.strokeStyle = "#c9ced6"; g.lineWidth = 3.4 * e; g.stroke();
    // tela: cuatro gajos entre cinco varillas (extremo izquierdo, intermedios y derecho)
    const inv = clamp((a - 1.3) / 0.6);
    const N = 4, puntas = [];
    for (let i = 0; i <= N; i++) {
      const f = i / N, x = lerp(Gm.tipI.x, Gm.tipD.x, f);
      const fondo = Math.sin(Math.PI * f) * 7 * e * (1 - 2 * inv);           // las varillas del medio quedan algo más cerca
      puntas.push({ x, y: lerp(Gm.tipI.y, Gm.tipD.y, f) + fondo });
    }
    const comba = i => Gm.bow * (1 - Math.abs(i / N - 0.5) * 2 * 0.15) * (i < N / 2 ? 1 : 1);
    const ruta = (i, s0, s1, mover) => {        // varilla i de s0 a s1 (0 = punta del eje, 1 = extremo)
      const P = puntas[i], lado = P.x < 0 ? -1 : 1, n = 8;
      for (let k = 0; k <= n; k++) { const q = varilla(A, P, i === N / 2 ? Gm.bow * 0.9 : comba(i), lerp(s0, s1, k / n), lado);
        if (k === 0 && mover) g.moveTo(q.x, q.y); else g.lineTo(q.x, q.y); }
    };
    // festón entre dos puntas
    const feston = (i, j) => { const P = puntas[i], Q = puntas[j], mx = (P.x + Q.x) / 2, my = (P.y + Q.y) / 2;
      g.quadraticCurveTo(mx, my - (7 * e) * (1 - 2 * inv) * (a > 0.25 ? 1 : 0), Q.x, Q.y); };
    for (let i = 0; i < N; i++) {
      g.beginPath(); ruta(i, 0, 1, true); feston(i, i + 1); ruta(i + 1, 1, 0, false); g.closePath();
      const col = st.tela[i % 2];
      g.fillStyle = inv > 0.5 ? st.forro : col; g.fill();
      if (inv > 0.02 && inv < 0.98) { g.globalAlpha = inv < 0.5 ? inv * 1.2 : (1 - inv) * 1.2; g.fillStyle = st.forro; g.fill(); g.globalAlpha = 1; }
      // brillo en los gajos de fuera (abierto)
      if (a > 0.4 && inv < 0.5) { g.save(); g.clip(); g.fillStyle = "rgba(255,255,255,0.16)";
        const q = varilla(A, puntas[i], comba(i), 0.45, puntas[i].x < 0 ? -1 : 1); g.beginPath(); g.ellipse(q.x, q.y - 4 * e, 10 * e, 5 * e, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
    }
    // lunares (paraguas de Laura)
    if (st.lunares && a > 0.5) {
      g.save(); g.beginPath(); ruta(0, 0, 1, true); for (let i = 0; i < N; i++) feston(i, i + 1); ruta(N, 1, 0, false); g.closePath(); g.clip();
      g.fillStyle = "rgba(255,255,255,0.85)";
      for (let i = 0; i < 9; i++) { const ii = i % N, u = 0.3 + 0.55 * hash(i + 31), q = varilla(A, puntas[ii], comba(ii), u, puntas[ii].x < 0 ? -1 : 1);
        const q2 = varilla(A, puntas[ii + 1], comba(ii + 1), u, puntas[ii + 1].x < 0 ? -1 : 1);
        g.beginPath(); g.arc(lerp(q.x, q2.x, 0.5), lerp(q.y, q2.y, 0.5) + 2 * e, 3.2 * e * clamp((a - 0.5) * 2), 0, Math.PI * 2); g.fill(); }
      g.restore();
    }
    // contornos: varillas y festón
    g.strokeStyle = tinta; g.lineWidth = 2.2;
    g.beginPath(); ruta(0, 0, 1, true); for (let i = 0; i < N; i++) feston(i, i + 1); ruta(N, 1, 0, false); g.closePath(); g.stroke();
    g.lineWidth = 1.4; for (let i = 1; i < N; i++) { g.beginPath(); ruta(i, 0, 1, true); g.stroke(); }
    // del revés se ven las varillas metálicas
    if (inv > 0.3) { g.globalAlpha = clamp((inv - 0.3) * 2); g.strokeStyle = "#d9dde3"; g.lineWidth = 1.6;
      for (let i = 0; i <= N; i++) { g.beginPath(); ruta(i, 0.08, 0.95, true); g.stroke(); } g.globalAlpha = 1; }
    // plegado: cinta que lo cierra
    if (a < 0.2) { g.globalAlpha = 1 - a * 5; const q = { x: 0, y: Gm.ya + Gm.Lr * 0.55 };
      g.fillStyle = "#3a0a10"; g.strokeStyle = tinta; g.lineWidth = 1.4; g.beginPath(); g.rect(q.x - 7 * e, q.y - 3 * e, 14 * e, 6 * e); g.fill(); g.stroke(); g.globalAlpha = 1; }
    // contera
    g.strokeStyle = tinta; g.lineWidth = 3 * e + 2; g.beginPath(); g.moveTo(0, Gm.ya); g.lineTo(0, Gm.ya - 14 * e); g.stroke();
    g.strokeStyle = "#c9ced6"; g.lineWidth = 3 * e; g.stroke();
    g.restore();
    return Gm;
  }
  // forma del techo del paraguas (en pantalla) para saber qué gotas quedan debajo
  function abrigo(o, th, a, st, e) {
    if (a < 0.6 || a > 1.45) return null;
    const Gm = geomParaguas(st, a, e), c = Math.cos(-th), s = Math.sin(-th);
    return { o, c, s, half: Gm.tipD.x * 0.98, top: Gm.ya - 4 * e, rim: Gm.tipD.y };
  }
  function debajo(ab, x, y) {
    if (!ab) return false;
    const dx = x - ab.o.x, dy = y - ab.o.y, lx = dx * ab.c - dy * ab.s, ly = dx * ab.s + dy * ab.c;
    if (Math.abs(lx) > ab.half) return false;
    const k = lx / ab.half, techo = lerp(ab.top, ab.rim, k * k);
    return ly > techo && ly < ab.rim + 520;
  }

  // puño redibujado encima del mango (el puño del montaje queda debajo del paraguas)
  function punoEncima(g, P, p, mano, sw) {
    const q = P.aPantalla(p, mano), k = p.s * (P.K || 1), esc = P === L ? 0.88 : 1;
    g.save(); g.translate(q.x, q.y);
    if (p.espejo) g.scale(-1, 1);
    g.rotate((mano.ang || 0) + (sw || 0)); g.scale(P.JK * k * esc, P.JK * k * esc);
    const col = { piel: P.C.piel, sombra: P.C.pielSombra, tinta: P.C.tinta };
    if (mano.dedos) Personaje2D.mano(g, mano, col); else Personaje2D.puno(g, mano.pulgar, col);
    g.restore();
  }

  /* ---------- decorado: calle de noche bajo la lluvia ---------- */
  const LUNA = { x: 236, y: 96, r: 38 }, ARRIBA = 240, LADO = 110;
  const PUERTA = { x0: 138, x1: 236, y0: 338 };
  const TOLDO = { x0: 112, x1: 268, y: 324 };
  const FAROLA = { x: 912, y: 226 };
  const CHARCOS = [[176, 578, 82, 9], [528, 588, 104, 8], [842, 573, 70, 8]];
  let fondo = null, nubes = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 2 * LADO; c.height = H + 300; const g = c.getContext("2d");
    g.translate(LADO, ARRIBA);
    // cielo (sube por encima del encuadre: la cámara mira hacia arriba al volar)
    const cielo = g.createLinearGradient(0, -ARRIBA, 0, 360); cielo.addColorStop(0, "#05081a"); cielo.addColorStop(0.45, "#0b1229"); cielo.addColorStop(1, "#1b2647");
    g.fillStyle = cielo; g.fillRect(-LADO, -ARRIBA, W + 2 * LADO, 440 + ARRIBA);
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,255,${0.25 + 0.5 * hash(i + 300)})`; g.fillRect(hash(i + 100) * W, -ARRIBA + hash(i + 200) * (ARRIBA + 120), 2, 2); }
    // luna con halo
    const halo = g.createRadialGradient(LUNA.x, LUNA.y, LUNA.r * 0.8, LUNA.x, LUNA.y, LUNA.r * 3.2);
    halo.addColorStop(0, "rgba(240,236,200,0.35)"); halo.addColorStop(1, "rgba(240,236,200,0)");
    g.fillStyle = halo; g.beginPath(); g.arc(LUNA.x, LUNA.y, LUNA.r * 3.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#f3eccb"; g.beginPath(); g.arc(LUNA.x, LUNA.y, LUNA.r, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(190,180,140,0.45)";
    for (const [dx, dy, r] of [[-12, -8, 8], [10, 6, 6], [-4, 16, 5], [14, -14, 4]]) { g.beginPath(); g.arc(LUNA.x + dx, LUNA.y + dy, r, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = "rgba(120,110,80,0.6)"; g.lineWidth = 2; g.beginPath(); g.arc(LUNA.x, LUNA.y, LUNA.r, 0, Math.PI * 2); g.stroke();
    // edificios lejanos con ventanas
    const tejados = [[300, 232], [372, 196], [452, 250], [520, 210], [600, 178], [688, 238], [760, 204], [840, 252], [930, 192], [1010, 226]];
    for (let i = 0; i < tejados.length; i++) {
      const [x, y] = tejados[i], w = (tejados[i + 1] ? tejados[i + 1][0] : 1070) - x;
      g.fillStyle = i % 2 ? "#141c37" : "#18213f"; g.fillRect(x, y, w + 2, 420 - y);
      for (let wy = y + 16; wy < 400; wy += 28) for (let wx = x + 10; wx < x + w - 14; wx += 22) {
        const h = hash(wx * 0.37 + wy * 1.31);
        g.fillStyle = h < 0.28 ? "rgba(255,206,120,0.75)" : h < 0.36 ? "rgba(150,200,255,0.4)" : "rgba(8,12,26,0.6)"; g.fillRect(wx, wy, 9, 12);
      }
    }
    // acera de enfrente y calzada mojada
    g.fillStyle = "#2a3247"; g.fillRect(-LADO, 398, W + 2 * LADO, 12);
    g.fillStyle = "#4a5470"; g.fillRect(-LADO, 396, W + 2 * LADO, 3);
    const cz = g.createLinearGradient(0, 410, 0, SUELO); cz.addColorStop(0, "#0e1324"); cz.addColorStop(1, "#1a2134");
    g.fillStyle = cz; g.fillRect(-LADO, 410, W + 2 * LADO, SUELO - 410);
    // reflejos de las ventanas y de la farola en la calzada
    for (let i = 0; i < 26; i++) { const x = 320 + hash(i * 2.3) * 720, w = 6 + hash(i * 4.1) * 10, a0 = 0.12 + 0.2 * hash(i * 6.7);
      const rg = g.createLinearGradient(0, 412, 0, 500); rg.addColorStop(0, `rgba(255,200,120,${a0})`); rg.addColorStop(1, "rgba(255,200,120,0)");
      g.fillStyle = rg; for (let k = 0; k < 5; k++) g.fillRect(x + (hash(i + k) - 0.5) * 4, 414 + k * 16, w, 8); }
    g.strokeStyle = "rgba(230,230,200,0.25)"; g.lineWidth = 4; g.setLineDash([46, 40]);
    g.beginPath(); g.moveTo(-LADO, 476); g.lineTo(W + LADO, 476); g.stroke(); g.setLineDash([]);
    // bordillo de nuestra acera
    g.fillStyle = "#3d465e"; g.fillRect(-LADO, 524, W + 2 * LADO, 8); g.fillStyle = "#59647f"; g.fillRect(-LADO, 524, W + 2 * LADO, 2);
    g.fillStyle = "#222a3c"; g.fillRect(-LADO, 532, W + 2 * LADO, SUELO - 532);
    // fachada del bar (izquierda): ladrillo
    g.fillStyle = "#4a231d"; g.fillRect(-LADO, 150, 340, SUELO - 150);
    g.strokeStyle = "rgba(20,8,6,0.55)"; g.lineWidth = 1.5;
    for (let y = 160, f = 0; y < SUELO; y += 18, f++) { g.beginPath(); g.moveTo(-LADO, y); g.lineTo(300, y); g.stroke();
      for (let x = -40 + (f % 2) * 22; x < 300; x += 44) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 18); g.stroke(); } }
    g.fillStyle = "#2a120e"; g.fillRect(296, 150, 10, SUELO - 150);
    g.fillStyle = "#1d0c09"; g.fillRect(-LADO, 140, 350, 14);
    // escaparate con botellas
    const vg = g.createLinearGradient(0, 360, 0, 470); vg.addColorStop(0, "#ffd28a"); vg.addColorStop(1, "#e08a3a");
    g.fillStyle = vg; g.fillRect(4, 362, 104, 104);
    for (let i = 0; i < 6; i++) { const bx = 14 + i * 16, bh = 30 + hash(i + 3) * 18; g.fillStyle = ["#2f5a2c", "#5a2a1a", "#22324f", "#6b4a12"][i % 4];
      g.fillRect(bx, 452 - bh, 9, bh); g.fillRect(bx + 3, 452 - bh - 9, 3, 9); }
    g.fillStyle = "#3a1d12"; g.fillRect(4, 452, 104, 6);
    g.strokeStyle = "#140806"; g.lineWidth = 6; g.strokeRect(4, 362, 104, 104);
    // puerta abierta con luz cálida
    const pg = g.createLinearGradient(0, PUERTA.y0, 0, SUELO); pg.addColorStop(0, "#ffe2a8"); pg.addColorStop(1, "#f0a050");
    g.fillStyle = pg; g.fillRect(PUERTA.x0, PUERTA.y0, PUERTA.x1 - PUERTA.x0, SUELO - PUERTA.y0);
    g.fillStyle = "rgba(160,80,30,0.35)"; g.fillRect(PUERTA.x0 + 52, PUERTA.y0 + 30, 30, SUELO - PUERTA.y0 - 30);     // interior
    g.fillStyle = "#3b1c10"; g.beginPath(); g.moveTo(PUERTA.x0, PUERTA.y0); g.lineTo(PUERTA.x0 + 26, PUERTA.y0 + 14); g.lineTo(PUERTA.x0 + 26, SUELO - 8); g.lineTo(PUERTA.x0, SUELO); g.closePath(); g.fill();
    g.strokeStyle = "#140806"; g.lineWidth = 7; g.strokeRect(PUERTA.x0, PUERTA.y0, PUERTA.x1 - PUERTA.x0, SUELO - PUERTA.y0 + 4);
    // toldo a rayas
    g.save(); g.beginPath(); g.moveTo(TOLDO.x0, TOLDO.y - 26); g.lineTo(TOLDO.x1, TOLDO.y - 26); g.lineTo(TOLDO.x1 + 10, TOLDO.y); g.lineTo(TOLDO.x0 - 10, TOLDO.y); g.closePath(); g.clip();
    for (let x = TOLDO.x0 - 14, i = 0; x < TOLDO.x1 + 14; x += 18, i++) { g.fillStyle = i % 2 ? "#e9e2d0" : "#2c6b4f"; g.fillRect(x, TOLDO.y - 30, 18, 34); }
    g.restore();
    g.fillStyle = "#2c6b4f";
    for (let x = TOLDO.x0 - 10; x < TOLDO.x1 + 10; x += 18) { g.beginPath(); g.arc(x + 9, TOLDO.y, 9, 0, Math.PI); g.fill(); }
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.beginPath(); g.moveTo(TOLDO.x0, TOLDO.y - 26); g.lineTo(TOLDO.x1, TOLDO.y - 26); g.lineTo(TOLDO.x1 + 10, TOLDO.y); g.lineTo(TOLDO.x0 - 10, TOLDO.y); g.closePath(); g.stroke();
    // neón de copa de cóctel (sin letras)
    g.save(); g.translate(188, 236); g.lineCap = "round"; g.lineJoin = "round";
    for (const [lw, col] of [[12, "rgba(255,80,170,0.25)"], [6, "rgba(255,120,200,0.6)"], [2.5, "#ffe0f2"]]) {
      g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(-34, -30); g.lineTo(34, -30); g.lineTo(0, 6); g.closePath(); g.moveTo(0, 6); g.lineTo(0, 34); g.moveTo(-18, 36); g.lineTo(18, 36);
      g.moveTo(16, -30); g.lineTo(28, -46); g.stroke();
      g.beginPath(); g.arc(-10, -38, 6, 0, Math.PI * 2); g.stroke();
    }
    g.restore();
    // farola
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 10; g.beginPath(); g.moveTo(FAROLA.x, SUELO); g.lineTo(FAROLA.x, FAROLA.y + 10); g.stroke();
    g.strokeStyle = "#2c3346"; g.lineWidth = 6; g.stroke();
    const fh = g.createRadialGradient(FAROLA.x, FAROLA.y + 6, 4, FAROLA.x, FAROLA.y + 6, 160);
    fh.addColorStop(0, "rgba(255,226,150,0.55)"); fh.addColorStop(1, "rgba(255,210,120,0)");
    g.fillStyle = fh; g.beginPath(); g.arc(FAROLA.x, FAROLA.y + 6, 160, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#1a1d26"; g.beginPath(); g.moveTo(FAROLA.x - 26, FAROLA.y); g.lineTo(FAROLA.x + 26, FAROLA.y); g.lineTo(FAROLA.x + 14, FAROLA.y - 22); g.lineTo(FAROLA.x - 14, FAROLA.y - 22); g.closePath(); g.fill();
    g.fillStyle = "#ffe7a6"; g.beginPath(); g.ellipse(FAROLA.x, FAROLA.y + 3, 18, 7, 0, 0, Math.PI * 2); g.fill();
    // cono de luz de la farola
    const cono = g.createLinearGradient(0, FAROLA.y, 0, SUELO); cono.addColorStop(0, "rgba(255,226,150,0.22)"); cono.addColorStop(1, "rgba(255,226,150,0.05)");
    g.fillStyle = cono; g.beginPath(); g.moveTo(FAROLA.x - 16, FAROLA.y + 6); g.lineTo(FAROLA.x + 16, FAROLA.y + 6); g.lineTo(FAROLA.x + 120, SUELO); g.lineTo(FAROLA.x - 120, SUELO); g.closePath(); g.fill();
    // acera mojada
    const ac = g.createLinearGradient(0, SUELO, 0, H + 60); ac.addColorStop(0, "#232a3a"); ac.addColorStop(1, "#10141f");
    g.fillStyle = ac; g.fillRect(-LADO, SUELO, W + 2 * LADO, H + 60 - SUELO);
    g.fillStyle = "#3a4258"; g.fillRect(-LADO, SUELO - 2, W + 2 * LADO, 4);
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 2;
    for (let x = -30; x < W + LADO; x += 96) { g.beginPath(); g.moveTo(x, SUELO + 2); g.lineTo(x - 30, H + 60); g.stroke(); }
    // reflejos en el suelo mojado (puerta, escaparate, farola)
    for (const [x, w, col] of [[187, 96, "255,196,110"], [56, 90, "255,190,110"], [FAROLA.x, 60, "255,226,150"]]) {
      const rg = g.createLinearGradient(0, SUELO, 0, H + 10); rg.addColorStop(0, `rgba(${col},0.42)`); rg.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = rg;
      for (let k = 0; k < 7; k++) { const yy = SUELO + 3 + k * 8; g.fillRect(x - w / 2 + hash(k + x) * 10, yy, w - hash(k * 3 + x) * 22, 4); }
    }
    // charcos
    for (const [x, y, rx, ry] of CHARCOS) {
      g.fillStyle = "#0b1020"; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "rgba(160,190,255,0.25)"; g.lineWidth = 2; g.stroke();
      g.fillStyle = "rgba(170,200,255,0.18)"; g.beginPath(); g.ellipse(x - rx * 0.3, y - ry * 0.2, rx * 0.35, ry * 0.3, 0, 0, Math.PI * 2); g.fill();
    }
    // viñeta
    return c;
  }
  // viñeta aparte (fija a la pantalla, no se mueve con la cámara)
  let vineta = null;
  function creaVineta() {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    const v = g.createRadialGradient(512, 300, 280, 512, 300, 700); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.5)");
    g.fillStyle = v; g.fillRect(0, 0, W, H); return c;
  }
  function creaNubes() {
    const c = document.createElement("canvas"); c.width = 360; c.height = 120; const g = c.getContext("2d");
    for (let i = 0; i < 9; i++) { const x = 40 + i * 34 + hash(i) * 20, y = 60 + (hash(i + 4) - 0.5) * 30, r = 26 + hash(i + 8) * 22;
      const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, "rgba(60,70,100,0.55)"); gr.addColorStop(1, "rgba(60,70,100,0)");
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
    return c;
  }

  /* ---------- lluvia ---------- */
  const N_GOTAS = 130;
  function inclinacion(t) { return -(0.1 + 0.42 * viento(t)); }
  function lluvia(g, t, abrigos) {
    const inc = inclinacion(t), alto = H + 140, ancho = W + 400;
    const n = Math.hypot(inc, 1), ux = inc / n, uy = 1 / n;
    g.save(); g.lineCap = "round"; g.strokeStyle = "rgba(196,214,255,0.55)"; g.lineWidth = 1.6;
    g.beginPath();
    for (let i = 0; i < N_GOTAS; i++) {
      const v = 820 + 300 * hash(i * 3.1), L0 = 14 + 10 * hash(i * 7.7);
      const y = ((t * v / alto + hash(i * 5.3)) % 1) * alto - 70;
      let x = hash(i * 1.7) * ancho + inc * y; x = ((x % ancho) + ancho) % ancho - 200;
      if (abrigos.some(ab => debajo(ab, x, y))) continue;
      g.moveTo(x - ux * L0, y - uy * L0); g.lineTo(x, y);
    }
    g.stroke(); g.restore();
  }
  // salpicaduras en la acera
  function salpicaduras(g, t) {
    g.save(); g.strokeStyle = "rgba(200,220,255,0.55)"; g.lineWidth = 1.3; g.lineCap = "round";
    for (let i = 0; i < 22; i++) {
      const per = 0.55 + 0.4 * hash(i + 90), ph = ((t / per) + hash(i + 91)) % 1, ciclo = Math.floor(t / per + hash(i + 91));
      if (ph > 0.35) continue;
      const k = ph / 0.35, x = hash(i * 13 + ciclo * 7) * (W + 40) - 20, y = SUELO + 4 + hash(i * 17 + ciclo) * 50;
      g.globalAlpha = 1 - k; const r = 3 + 7 * k;
      g.beginPath(); g.moveTo(x - r, y); g.quadraticCurveTo(x - r * 0.7, y - 6 * Math.sin(Math.PI * k), x - r * 0.4, y - 7 * k); g.stroke();
      g.beginPath(); g.moveTo(x + r, y); g.quadraticCurveTo(x + r * 0.7, y - 6 * Math.sin(Math.PI * k), x + r * 0.4, y - 7 * k); g.stroke();
    }
    g.restore();
  }
  function ondas(g, t) {
    g.save(); g.strokeStyle = "rgba(190,215,255,0.5)"; g.lineWidth = 1.2;
    CHARCOS.forEach(([x, y, rx, ry], j) => {
      g.save(); g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.clip();
      for (let i = 0; i < 4; i++) {
        const per = 0.7 + 0.3 * hash(i + j * 9), ph = ((t / per) + hash(i * 3 + j)) % 1, ciclo = Math.floor(t / per + hash(i * 3 + j));
        const cx = x + (hash(i * 5 + j + ciclo * 11) - 0.5) * rx * 1.3, cy = y + (hash(i * 7 + j + ciclo * 3) - 0.5) * ry;
        g.globalAlpha = 0.8 * (1 - ph); g.beginPath(); g.ellipse(cx, cy, 3 + 22 * ph, 1 + 3.5 * ph, 0, 0, Math.PI * 2); g.stroke();
      }
      g.restore();
    });
    g.restore();
  }
  // gotas que caen del toldo
  function goteoToldo(g, t) {
    g.save(); g.fillStyle = "rgba(200,220,255,0.7)";
    for (let i = 0; i < 7; i++) {
      const x = TOLDO.x0 - 4 + i * 26 + hash(i) * 8, per = 0.5 + 0.35 * hash(i + 2), ph = ((t / per) + hash(i + 5)) % 1;
      const y = TOLDO.y + 8 + (SUELO - TOLDO.y - 8) * ph * ph;
      g.beginPath(); g.ellipse(x, y, 1.8, 3.5 + 4 * ph, 0, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  // gotas que rebotan en la tela del paraguas abierto
  function rebotes(g, t, o, th, a, st, e) {
    if (a < 0.7 || a > 1.3) return;
    const Gm = geomParaguas(st, a, e);
    g.save(); g.translate(o.x, o.y); g.rotate(th); g.fillStyle = "rgba(210,228,255,0.85)";
    for (let i = 0; i < 9; i++) {
      const per = 0.32 + 0.2 * hash(i + 60), ph = ((t / per) + hash(i + 61)) % 1, ciclo = Math.floor(t / per + hash(i + 61));
      const u = hash(i * 7 + ciclo) * 2 - 1, x = u * Gm.tipD.x * 0.9, y = lerp(Gm.ya - 2, Gm.tipD.y, u * u) - 3;
      const k = ph; if (k > 0.6) continue;
      g.globalAlpha = 1 - k / 0.6;
      for (const s of [-1, 1]) { g.beginPath(); g.arc(x + s * (4 + 10 * k), y - 12 * Math.sin(Math.PI * k / 0.6), 1.6, 0, Math.PI * 2); g.fill(); }
    }
    g.restore();
  }
  // hojas que arrastra el viento
  function hojas(g, t) {
    for (let i = 0; i < 5; i++) {
      const t0 = T.viento0 + 0.3 + i * 0.32, k = fase(t, t0, t0 + 1.5); if (k <= 0 || k >= 1) continue;
      const x = lerp(W + 30, -40, k), y = 180 + i * 62 + 40 * Math.sin(k * 7 + i) - 60 * k, r = t * (6 + i) + i;
      g.save(); g.translate(x, y); g.rotate(r); g.scale(1, 0.55 + 0.45 * Math.sin(t * 9 + i));
      g.fillStyle = ["#d9822b", "#b5541c", "#e0a33a"][i % 3]; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(-9, 0); g.quadraticCurveTo(0, -7, 9, 0); g.quadraticCurveTo(0, 7, -9, 0); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(-9, 0); g.lineTo(-13, 1); g.stroke();
      g.restore();
    }
  }
  // líneas de racha y un corazón cuando ella sonríe
  function rachaLineas(g, t) {
    const k = campana(t, T.racha - 0.15, T.racha + 0.6); if (k <= 0) return;
    g.save(); g.strokeStyle = `rgba(220,235,255,${0.55 * k})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = 0; i < 6; i++) { const y = 120 + i * 58, x = W + 40 - (t - T.racha + 0.15) * 1400 - i * 70;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - 60, y - 8, x - 130, y + 2); g.stroke(); }
    g.restore();
  }
  function corazon(g, x, y, r, a) {
    if (a <= 0.01) return;
    g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(r / 10, r / 10);
    g.beginPath(); g.moveTo(0, 8); g.bezierCurveTo(-12, -2, -8, -12, 0, -6); g.bezierCurveTo(8, -12, 12, -2, 0, 8); g.closePath();
    g.fillStyle = "#ff5d8a"; g.fill(); g.lineWidth = 1.6; g.strokeStyle = "#0b0a0e"; g.stroke(); g.restore();
  }
  function destello(g, x, y, k, r) {
    if (k <= 0.01) return;
    g.save(); g.globalAlpha = k; g.fillStyle = "#ffffff"; g.translate(x, y); g.rotate(0.3);
    g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.28 : r * k; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill();
    g.restore();
  }

  /* ---------- Guillermo (con su paraguas) ---------- */
  function dibujaGuillermo(g, pG, t, conParaguas = true) {
    const V = pG.vuelo, P = pG.paraguas;
    g.save();
    if (Math.abs(V.sw) > 1e-4) { g.translate(P.mano.x, P.mano.y); g.rotate(V.sw); g.translate(-P.mano.x, -P.mano.y); }
    G.dibujar(g, pG, t);
    g.restore();
    if (conParaguas) paraguasDeG(g, pG, t);
  }
  function paraguasDeG(g, pG, t) {
    const P = pG.paraguas;
    paraguas(g, P.mano, P.th, P.abre, GRANDE, S / 0.27, t);
    if (P.enMano) punoEncima(g, G, pG, pG.manoLejos, pG.vuelo.sw);
  }

  /* ---------- cámara ---------- */
  // sigue a Guillermo hacia arriba mientras vuela y luego baja a Laura
  function camara(t) {
    const tierno = tramo(t, T.cubre1, T.cubre1 + 0.8) * (1 - tramo(t, T.viento0, T.racha));
    const sigue = tramo(t, T.racha - 0.3, T.racha + 0.15) * (1 - tramo(t, T.sale - 0.25, T.sale + 0.4));
    const V = vuelo(Math.min(t, T.sale));
    const cy = Math.max(95, Math.min(215, SUELO + V.fy - 290)), cx = Math.max(470, Math.min(512, XG + V.fx + 160));
    const racha = t >= T.racha ? Math.exp(-(t - T.racha) * 5) * suave(fase(t, T.racha, T.racha + 0.05)) : 0;
    // final: se acerca a Laura sin perder la luna
    const fin = tramo(t, T.sale + 0.2, T.abreL + 0.3, suave);
    return { k: 1 + 0.05 * tierno * (1 - sigue) - 0.08 * sigue + 0.015 * racha + 0.12 * fin,
      x: lerp(lerp(512 + 6 * tierno, cx, sigue), 560, fin), y: lerp(lerp(300 + 8 * tierno, cy, sigue), 310, fin), sacude: 3 * racha };
  }

  const pose = t => ({ g: poseG(t), l: poseL(t) });

  class GuillermoLauraParaguas extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !L.listo()) return;
      if (!fondo) { fondo = creaFondo(); nubes = creaNubes(); vineta = creaVineta(); }
      const pG = poseG(t), pL = poseL(t);
      const luz = tramo(t, NEGRO_INICIO, 0.9, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (cam.sacude > 0.05) g.translate(ruido(t * 40) * cam.sacude, ruido(t * 40 + 9) * cam.sacude * 0.6);
      g.drawImage(fondo, -LADO, -ARRIBA);
      g.drawImage(nubes, 520 - t * 9, 20); g.drawImage(nubes, -60 - t * 6, 150, 300, 100);
      // Guillermo, chiquitito, cruza por delante de la luna colgado del paraguas
      const kl = fase(t, T.luna0, T.luna1);
      if (kl > 0 && kl < 1) {
        const pp = poseG(t), x = lerp(LUNA.x + 110, LUNA.x - 110, kl), y = LUNA.y - 48 + 7 * Math.sin(kl * 6.5) - 8 * kl;
        g.save(); g.translate(x, y); g.scale(0.16, 0.16); g.translate(-pp.paraguas.mano.x, -pp.paraguas.mano.y);
        dibujaGuillermo(g, pp, t); g.restore();
      }
      ondas(g, t);
      // sombras (la de Guillermo se encoge al despegar)
      const alt = Math.max(0, SUELO - (pG.suelo));
      g.save(); g.fillStyle = "rgba(0,0,0,0.38)";
      const sg = clamp(1 - alt / 260);
      if (sg > 0.01) { g.beginPath(); g.ellipse(XG + 6, SUELO + 2, 92 * sg, 8 * sg, 0, 0, Math.PI * 2); g.fill(); }
      g.beginPath(); g.ellipse(pL.x - 4, SUELO + 2, 80, 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
      // personajes y paraguas
      const P = pG.paraguas;
      dibujaGuillermo(g, pG, t, false);
      L.dibujar(g, pL, t);
      const PL = pL.plegable;
      if (PL.visible > 0.01) {
        g.save(); g.globalAlpha = PL.visible; paraguas(g, PL.mano, PL.th, PL.abre, PEQUE, S / 0.27, t); g.restore();
        punoEncima(g, L, pL, pL.manoCerca, 0);
      }
      // el paraguas grande va delante de los dos (cuando la cubre su borde queda por encima de las cabezas)
      paraguasDeG(g, pG, t);
      rebotes(g, t, P.mano, P.th, P.abre, GRANDE, S / 0.27);
      if (PL.visible > 0.5) rebotes(g, t, PL.mano, PL.th, PL.abre, PEQUE, S / 0.27);
      const abrigos = [abrigo(P.mano, P.th, P.abre, GRANDE, S / 0.27)];
      if (PL.visible > 0.5) abrigos.push(abrigo(PL.mano, PL.th, PL.abre, PEQUE, S / 0.27));
      lluvia(g, t, abrigos.filter(Boolean));
      salpicaduras(g, t);
      goteoToldo(g, t);
      hojas(g, t);
      rachaLineas(g, t);
      // corazón cuando ella sonríe y destello del guiño
      const cab = L.aPantalla(pL, L.cabeza(pL).a({ x: 830, y: 330 }));
      const kc = campana(t, T.corazon, T.corazon + 1.0);
      corazon(g, cab.x - 18, cab.y - 40 - 30 * fase(t, T.corazon, T.corazon + 1.0), 11 * Math.min(1, kc * 2), Math.min(1, kc * 2));
      const oL = L.aPantalla(pL, L.cabeza(pL).a({ x: 812, y: 466 }));
      destello(g, oL.x - 4, oL.y - 22, campana(t, T.guino + 0.1, T.guino + 0.5), 14);
      g.restore();
      g.drawImage(vineta, 0, 0);
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00019", nombre: "Guillermo y Laura · El paraguas", crear: () => new GuillermoLauraParaguas() });
  window.__A2D_00019 = { pose, poseG, poseL, T, DUR };
})();
