"use strict";
/* 00121 · Guillermo y Sara · El tatuaje
 *
 * Negro → el rincón de un estudio de tatuajes, de noche: pared color ciruela con hojas de dibujos
 * (flash) clavadas con chinchetas (corazones, golondrina, ancla, estrella, rosa, calavera simpática;
 * sin letras), un neón de corazón con alas, una balda con botes de tinta de colores sin etiqueta,
 * una planta colgante, suelo de damero; un sillón de tatuar de cuero negro con reposacabezas, un
 * reposabrazos acolchado en su pie, un carrito con bandeja (tapones de tinta, rollo de papel, el
 * rotulador) y una lámpara colgante que alumbra el reposabrazos.
 *
 * Sara, la experta, en su taburete con ruedas y la máquina de tatuar en la mano (cómica: armazón y
 * bobinas, sin aguja), la prueba (bzzz). Guillermo traga saliva, se hace el valiente, se sube la
 * manga de un tirón, pone el brazo en el reposabrazos y aparta la cara apretando los ojos… suda…
 * Sara se acerca rodando y arranca la máquina: al primer bzzz, antes de que le toque, Guillermo se
 * desmaya (ojos en blanco, cabeza atrás contra el reposacabezas, lengua fuera, el otro brazo
 * colgando). Sara le mira sin inmutarse, mira a cámara, deja la máquina en el carrito, coge un
 * rotulador, le quita el capuchón de un golpe de pulgar (¡pop!) y le dibuja en el antebrazo un
 * corazoncito, trazo a trazo; sopla la tinta, deja el rotulador y espera mirándose las uñas y dando
 * golpecitos con el pie. Guillermo se despierta de un respingo, mira a todos lados, se mira el
 * brazo… ve el corazón y se hincha de orgullo: saca bíceps con el corazón bien a la vista (late una
 * vez entre chispitas) y mira a cámara; Sara sonríe de lado y mira a cámara → negro.
 *
 * Todo depende de `t` (determinista). El corazón se dibuja en coordenadas del antebrazo de Guillermo
 * (misma IK que el muñeco), así va pegado al brazo en el reposabrazos y al sacar bíceps.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, mezcla, hash, campana } = M2;
  const G = Guillermo, Sa = SaraSaez, R = Recortes;
  const DUR = 14.6;
  const TINTA = "#0b0a0e", TAU = Math.PI * 2;

  /* ---------- guion (s) ---------- */
  const T = {
    // Sara prueba la máquina; Guillermo traga y se hace el valiente
    prueba: 0.6, pruebaFin: 1.1, traga: 1.0, valiente: 1.4,
    // la manga y el brazo
    manga: 1.8, tiron1: 2.02, tiron2: 2.22, mangaFin: 2.4, brazo: 2.42, brazoPuesto: 2.9, aparta: 2.98, apartado: 3.28,
    // Sara se acerca y arranca la máquina
    sAcerca: 3.0, sLista: 3.75, bzz: 4.02, bzzFin: 4.9,
    // el desmayo
    tieso: 4.18, desmayo: 4.36, desmayado: 4.9,
    // Sara le mira, mira a cámara y deja la máquina
    sMira: 5.1, sCamara: 5.65, sDeja: 6.05, sDejada: 6.55, sCoge: 6.65, sCogido: 7.0, pop: 7.14,
    // el corazón
    trazo1: 7.5, trazo1Fin: 8.12, trazo2: 8.24, trazo2Fin: 8.86, sopla: 8.98, soplaFin: 9.38,
    sDejaR: 9.45, sDejadoR: 9.85,
    // espera
    unas: 9.95,
    // Guillermo se despierta
    despierta: 10.95, mira: 11.2, miraBrazo: 11.55, ve: 11.78, orgullo: 12.02, flexion: 12.1, flexionado: 12.5,
    latido: 12.62, gCamara: 12.85, sSonrisa: 12.4, sCamaraFin: 13.0,
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
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const RELAJADA = D(0.55, 0.62, 0.56, 0.52, 0.48), FLOJA = D(0.8, 0.9, 0.86, 0.84, 0.8),
    AGARRA = D(0.3, 0.12, 0.1, 0.1, 0.1), PINZA = D(0.42, 0.3, 0.12, 0.1, 0.1), PUNO = D(0, 0, 0, 0, 0),
    MUSLO = D(0.6, 0.72, 0.68, 0.64, 0.6), UNAS = D(0.25, 0.28, 0.24, 0.22, 0.2), PALMA = D(0.7, 0.66, 0.6, 0.56, 0.5),
    TIRON = D(0.5, 0.3, 0.1, 0.08, 0.08), ROTU = D(0.5, 0.36, 0.14, 0.12, 0.12), CAPUCHON = D(0.95, 0.36, 0.14, 0.12, 0.12);

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
  const parpadeo = (t, lista, d = 0.15) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* =====================================================================================
   * DISPOSICIÓN (px de pantalla, antes de la cámara)
   * ===================================================================================== */
  const S = 0.36, SUELO = 560;
  const XG = 318, XS = 664;                                // pelvis de cada uno
  const Y_ASIENTO_G = 425, Y_PELVIS_G = Y_ASIENTO_G - 18;  // sillón de tatuar
  const Y_ASIENTO_S = 420, Y_PELVIS_S = Y_ASIENTO_S - 16;  // taburete de Sara
  // reposabrazos acolchado (encima, el antebrazo de Guillermo)
  const POSA = { x0: 400, x1: 482, y: 305, poste: 448 };
  // carrito con bandeja (detrás, entre los dos)
  const CARRO = { x: 524, y: 368, w: 74 };
  const MARCADOR_CARRO = { x: 532, y: 362, rot: -0.12 };      // el rotulador, tumbado en la bandeja
  const MAQ_CARRO = { x: 508, y: 360, rot: -0.35 };           // donde deja la máquina
  const CAP_CARRO = { x: 512, y: 364 };                       // donde cae el capuchón

  /* =====================================================================================
   * PISTAS DE MANOS (pantalla): [t0, t1, objetivo] con objetivo {x, y, mu, d} o función (t) → {…}
   * mu = hacia el codo, en ángulo de pantalla
   * ===================================================================================== */
  const evalua = (o, t) => (typeof o === "function" ? o(t) : o);
  const mezclaM = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), mu: lerpAng(a.mu, b.mu, k), d: mezclaD(a.d, b.d, k) });
  function pista(lista, t) {
    let c = evalua(lista[0][2], t);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i]; if (t <= t0) break;
      c = mezclaM(c, evalua(obj, t), (f || suave)(fase(t, t0, t1)));
    }
    return c;
  }
  function manoRig(rig, p, m, dobla, objeto) {
    const h = rig.aHoja(p, m);
    return { x: h.x, y: h.y, ang: 0, mu: p.espejo ? Math.PI - m.mu : m.mu, puno: 1, dedos: m.d, dobla, objeto };
  }
  // punto de pinza de una mano (entre pulgar e índice), en pantalla: hacia el lado contrario al codo
  const pinza = (m, r = 12) => ({ x: m.x - Math.cos(m.mu) * r, y: m.y - Math.sin(m.mu) * r });
  // mano cuya pinza cae en `q` (pantalla)
  const desdePinza = (q, mu, d, r = 12) => ({ x: q.x + Math.cos(mu) * r, y: q.y + Math.sin(mu) * r, mu, d });
  let BASE_M = null;
  function conCamara(g, f) { g.save(); g.setTransform(BASE_M); f(); g.restore(); }

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha), sentado en el sillón
   * ===================================================================================== */
  const PEL_G = G.SUELO + (Y_PELVIS_G - SUELO) / S - G.PELVIS.y;
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const CARAS_G = {
    inicio: E({ mx: 0.9, my: 0.1, c: 0.15, sd: 8, gd: 0.05, si: 10, gi: 0.05, sonr: 0.25 }),
    traga: E({ mx: 0.9, my: 0.25, iris: 0.82, c: 0, sd: 24, gd: 0.16, si: 26, gi: 0.16, abre: 0, ancho: 0.6, sonr: -0.25, mof: 0.3 }),
    valiente: E({ mx: 0.88, my: 0, c: 0.38, sd: -4, gd: -0.12, si: 2, gi: -0.08, abre: 0, ancho: 1.0, sonr: 0.55 }),
    manga: E({ mx: 0.5, my: 0.55, c: 0.3, sd: -4, gd: -0.12, si: -2, gi: -0.1, abre: 10, ancho: 0.8, sonr: 0.4 }),
    aparta: E({ mx: -0.8, my: 0.1, c: 1, z: 1, sd: 6, gd: 0.12, si: 6, gi: 0.12, abre: 0, ancho: 0.62, sonr: -0.4 }),
    tieso: E({ mx: -0.8, my: 0, c: 0, iris: 0.55, sd: 32, gd: 0.22, si: 32, gi: 0.22, abre: 14, ancho: 0.52, sonr: -0.45 }),
    blanco: E({ mx: 0.1, my: -1, c: 0.45, iris: 0.82, sd: 10, gd: 0.18, si: 10, gi: 0.18, abre: 28, ancho: 0.72, sonr: -0.25 }),
    despierta: E({ mx: 0.4, my: 0, c: 0, iris: 0.68, sd: 28, gd: 0.15, si: 28, gi: 0.15, abre: 20, ancho: 0.6, sonr: -0.1 }),
    miraIzq: E({ mx: -0.8, my: 0, c: 0.1, iris: 0.85, sd: 14, gd: 0.08, si: 14, gi: 0.08, abre: 6, ancho: 0.7, sonr: -0.05 }),
    miraBrazo: E({ mx: 0.75, my: 0.75, c: 0.15, sd: 10, gd: 0.04, si: 12, gi: 0.04, abre: 4, ancho: 0.75, sonr: 0 }),
    ve: E({ mx: 0.75, my: 0.75, c: 0, iris: 1.14, sd: 30, gd: 0.18, si: 30, gi: 0.18, abre: 24, ancho: 0.62, sonr: 0.2 }),
    orgullo: E({ mx: 0.65, my: -0.1, c: 0.4, h: 0.4, sd: 18, gd: 0.06, si: 18, gi: 0.06, abre: 10, ancho: 1.08, sonr: 0.95 }),
    camara: E({ mx: -0.85, my: 0, c: 0.3, h: 0.3, sd: 22, gd: 0.08, si: 22, gi: 0.08, abre: 12, ancho: 1.1, sonr: 1.0 })
  };
  const GUION_CARA_G = [
    [T.traga, T.traga + 0.12, "traga"], [T.valiente, T.valiente + 0.2, "valiente"], [T.manga, T.manga + 0.2, "manga"],
    [T.mangaFin, T.mangaFin + 0.15, "valiente"], [T.aparta, T.apartado, "aparta"], [T.tieso, T.tieso + 0.07, "tieso", salida],
    [T.desmayo, T.desmayado - 0.15, "blanco"], [T.despierta, T.despierta + 0.08, "despierta", salida], [T.mira, T.mira + 0.15, "miraIzq"],
    [T.miraBrazo, T.miraBrazo + 0.15, "miraBrazo"], [T.ve, T.ve + 0.08, "ve", salida], [T.orgullo, T.orgullo + 0.2, "orgullo"],
    [T.gCamara, T.gCamara + 0.2, "camara"]
  ];
  const CUERPOS_G = {
    inicio: { torso: 0.02, cab: 0.03, dx: 0, dy: 0 },
    traga: { torso: -0.02, cab: -0.04, dx: 0, dy: 0 },
    valiente: { torso: -0.08, cab: -0.1, dx: 0, dy: -4 },
    manga: { torso: 0.06, cab: 0.16, dx: 0, dy: 0 },
    brazo: { torso: 0.1, cab: 0.04, dx: 4, dy: 0 },
    aparta: { torso: -0.02, cab: -0.24, dx: 0, dy: 0 },
    tieso: { torso: -0.02, cab: -0.3, dx: 0, dy: -3 },
    desmayo: { torso: -0.1, cab: -0.6, dx: -2, dy: 4 },
    despierta: { torso: 0.04, cab: 0.02, dx: 0, dy: -6 },
    miraBrazo: { torso: 0.1, cab: 0.22, dx: 4, dy: 0 },
    orgullo: { torso: -0.06, cab: -0.06, dx: 0, dy: -6 },
    camara: { torso: -0.04, cab: -0.05, dx: 0, dy: -4 }
  };
  const GUION_CUERPO_G = [
    [T.traga, T.traga + 0.15, "traga"], [T.valiente, T.valiente + 0.25, "valiente", salida], [T.manga, T.manga + 0.2, "manga"],
    [T.brazo, T.brazoPuesto, "brazo"], [T.aparta, T.apartado, "aparta"], [T.tieso, T.tieso + 0.08, "tieso", salida],
    [T.desmayo, T.desmayado, "desmayo", entrada], [T.despierta, T.despierta + 0.15, "despierta", salida],
    [T.miraBrazo, T.miraBrazo + 0.2, "miraBrazo"], [T.orgullo, T.flexionado, "orgullo"], [T.gCamara, T.gCamara + 0.25, "camara"]
  ];
  const desmayo = t => dentro(t, T.desmayo, T.desmayado, T.despierta - 0.02, T.despierta + 0.1);

  const cacheG = new Map();
  function poseG(t) {
    const k0 = t.toFixed(5);
    if (cacheG.has(k0)) return cacheG.get(k0);
    if (cacheG.size > 8) cacheG.clear();
    const p = poseG0(t); cacheG.set(k0, p); return p;
  }
  function poseG0(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const des = desmayo(t);
    const respira = Math.sin(t * 2.4) * (1 - des) + Math.sin(t * 1.5) * des * 1.4;
    const p = {
      x: XG, suelo: SUELO, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x + b.dx / S, y: G.PELVIS.y + PEL_G + b.dy / S + respira * 1.3 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.005 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // traga saliva: la nuez sube y baja (la cabeza da un respingo)
    p.cabeza.ang -= 0.04 * campana(t, T.traga + 0.1, T.traga + 0.35);
    // tirones de la manga: el hombro sube a cada tirón
    const tir = campana(t, T.tiron1 - 0.06, T.tiron1 + 0.1) + campana(t, T.tiron2 - 0.06, T.tiron2 + 0.1);
    p.torso -= 0.03 * tir; p.pelvis.y -= 6 * tir;
    // temblor con los ojos apretados (antes del bzzz)
    const miedo = dentro(t, T.aparta + 0.1, T.apartado + 0.1, T.desmayo, T.desmayo + 0.05);
    p.cabeza.ang += 0.02 * miedo * Math.sin(t * 41); p.torso += 0.008 * miedo * Math.sin(t * 37);
    // ¡tieso! al oír el bzzz
    const ti = dentro(t, T.tieso, T.tieso + 0.04, T.desmayo, T.desmayo + 0.06);
    p.cabeza.ang += 0.03 * ti * Math.sin(t * 70); p.torsoEsc.y += 0.025 * ti;
    // la cabeza cae atrás y rebota contra el reposacabezas
    const u = t - T.desmayado;
    if (u > 0 && des > 0.5) { p.cabeza.ang += 0.06 * Math.exp(-u * 7) * Math.sin(u * 20) + 0.025 * Math.sin(t * 1.3) * des; }
    // se despierta de un respingo
    const v = t - T.despierta;
    const salto = v > 0 && v < 0.7 ? 24 * Math.exp(-v * 9) * Math.abs(Math.sin(v * 15)) : 0;
    p.pelvis.y -= salto / S;
    p.dyMuslo = b.dy - salto;          // las manos que descansan en los muslos van con la pelvis
    // mira a un lado y a otro
    const mira = dentro(t, T.mira, T.mira + 0.1, T.miraBrazo - 0.05, T.miraBrazo + 0.05);
    p.cabeza.ang += 0.12 * Math.sin((t - T.mira) * 12) * mira;
    // orgullo: saca pecho al flexionar
    const org = dentro(t, T.flexion, T.flexionado, T.fin + 1, T.fin + 2);
    p.torsoEsc.x += 0.03 * org;
    // piernas: sentado; despatarrado al desmayarse
    for (const [lado, dx, dy] of [["cerca", 258, 0], ["lejos", 312, -10]]) {
      let x = G.PELVIS.x + dx, y = TOB_G + dy, ang = 0;
      x += (lado === "cerca" ? 40 : 22) * des; ang -= (lado === "cerca" ? 0.3 : 0.4) * des;
      p.piernas[lado] = { tob: { x, y }, ang };
    }
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    // tragar: la boca se cierra fuerte
    ex.mof += 0.15 * campana(t, T.traga, T.traga + 0.3);
    p.cara = cara(ex, parpadeo(t, [0.4, 2.62, 11.42, 13.45]));
    p.sudor = 0.65 * dentro(t, T.traga, T.traga + 0.15, T.valiente, T.valiente + 0.3) + 0.95 * dentro(t, T.aparta, T.apartado + 0.2, T.desmayo + 0.2, T.desmayado);
    p.rojo = 0.3 * dentro(t, T.ve + 0.1, T.orgullo + 0.1, T.gCamara, T.gCamara + 0.5);
    p.lenguaFuera = dentro(t, T.desmayado - 0.2, T.desmayado + 0.1, T.despierta - 0.02, T.despierta + 0.06);
    manosG(p, t);
    p.capaCabeza = (g, tt) => capaCabezaG(g, tt, p);
    return p;
  }

  /* ---------- manos de Guillermo ---------- */
  // reposo en los muslos (sentado)
  const MUSLO_C = { x: 300, y: 396, mu: -2.0, d: MUSLO }, MUSLO_L = { x: 352, y: 396, mu: -1.95, d: MUSLO };
  // antebrazo en el reposabrazos: la muñeca por encima del cojín, la mano abierta (palma arriba)
  const EN_POSA = { x: 471, y: 297, mu: Math.PI - 0.06, d: PALMA };
  // bíceps: puño arriba al lado de la cara, antebrazo vertical
  const BICEPS = { x: 418, y: 232, mu: Math.PI / 2 + 0.08, d: PUNO };
  function manosG(p, t) {
    // brazo lejano (el del tatuaje): al reposabrazos; flojo al desmayarse; bíceps al final
    const Tr = G.tronco(p), hL = G.aPantalla(p, Tr(G.HOMBRO));
    const manga = { x: hL.x + 6, y: hL.y + 30 };
    const mL = Object.assign({}, MUSLO_L, { y: MUSLO_L.y + p.dyMuslo }), mC = Object.assign({}, MUSLO_C, { y: MUSLO_C.y + p.dyMuslo });
    const PL = [
      [0, 0, mL],
      [T.brazo, T.brazoPuesto, EN_POSA],
      [T.desmayo + 0.1, T.desmayado, Object.assign({}, EN_POSA, { x: EN_POSA.x - 12, y: EN_POSA.y + 3, mu: Math.PI - 0.12, d: FLOJA })],
      [T.despierta, T.despierta + 0.2, EN_POSA],
      [T.flexion, T.flexionado, BICEPS, salida]
    ];
    const l = pista(PL, t);
    // el bíceps tiembla de fuerza
    const fu = dentro(t, T.flexionado, T.flexionado + 0.1, T.fin, T.fin + 0.3);
    l.y += 1.2 * fu * Math.sin(t * 38);
    p.manoLejos = manoRig(G, p, l, -1, g => conCamara(g, () => corazonDibujado(g, t, p)));
    // brazo cercano: en el muslo; se sube la manga del otro (dos tirones); cuelga al desmayarse
    const tira = k => ({ x: manga.x - 4, y: manga.y - 8 * k, mu: 2.75, d: TIRON });
    const PC = [
      [0, 0, mC],
      [T.manga, T.tiron1 - 0.05, tira(0)],
      [T.tiron1 - 0.05, T.tiron1 + 0.08, tira(1), salida],
      [T.tiron1 + 0.08, T.tiron2 - 0.05, tira(0.2)],
      [T.tiron2 - 0.05, T.tiron2 + 0.08, tira(1.2), salida],
      [T.mangaFin, T.brazoPuesto, mC],
      [T.desmayo + 0.15, T.desmayado, { x: 236, y: 398, mu: -1.62, d: FLOJA }, entrada],
      [T.despierta, T.despierta + 0.2, mC]
    ];
    const c = pista(PC, t);
    // la mano colgando se balancea un poco
    const cu = dentro(t, T.desmayado, T.desmayado + 0.2, T.despierta - 0.05, T.despierta);
    c.x += 3 * Math.sin(t * 1.5) * cu;
    p.manoCerca = manoRig(G, p, c, -1, null);
  }

  /* ---------- capa de la cara de Guillermo (retrato): lengua fuera ---------- */
  function lengua(g, t, k) {          // lengua fuera, colgando por la comisura
    if (k <= 0.01) return;
    g.save(); g.translate(812, 744); g.rotate(0.26 + 0.08 * Math.sin(t * 1.7)); g.scale(1, k);
    g.lineJoin = "round";
    const forma = () => { g.beginPath(); g.moveTo(-20, -6); g.lineTo(26, -4); g.bezierCurveTo(30, 30, 28, 62, 6, 66); g.bezierCurveTo(-14, 68, -22, 34, -20, -6); g.closePath(); };
    forma(); g.fillStyle = "#ec7883"; g.fill();
    g.save(); forma(); g.clip(); g.fillStyle = "rgba(160,40,60,0.35)"; g.beginPath(); g.ellipse(16, 40, 14, 30, 0, 0, TAU); g.fill(); g.restore();
    forma(); g.lineWidth = 6; g.strokeStyle = TINTA; g.stroke();
    g.strokeStyle = "rgba(140,30,50,0.7)"; g.lineWidth = 3.5; g.beginPath(); g.moveTo(4, 6); g.quadraticCurveTo(6, 30, 4, 50); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.ellipse(-8, 22, 4, 9, 0.2, 0, TAU); g.fill();
    g.restore();
  }
  function capaCabezaG(g, t, p) {
    lengua(g, t, p.lenguaFuera || 0);
  }

  /* =====================================================================================
   * EL CORAZÓN: en el antebrazo lejano de Guillermo (pantalla). Lóbulos hacia la muñeca, punta
   * hacia el codo: en el reposabrazos se ve de lado y al sacar bíceps queda derecho.
   * ===================================================================================== */
  function antebrazo(p) {
    const m = p.manoLejos, Tr = G.tronco(p), h = Tr(G.HOMBRO), mu = m.mu ?? -1.75;
    const w = { x: m.x + Math.cos(mu) * G.MUNECA_R * G.JK, y: m.y + Math.sin(mu) * G.MUNECA_R * G.JK };
    const c = R.ik(h, w, G.BRAZO_L, G.BRAZO_L * 0.5, 42, m.dobla ?? -1, 1.08);
    const d1 = R.dir(c.a1), d2 = R.dir(c.a2), l1 = c.sj * c.estira, l2 = (c.L - c.sj) * c.estira;
    const codo = { x: h.x + d1.x * l1, y: h.y + d1.y * l1 }, mun = { x: codo.x + d2.x * l2, y: codo.y + d2.y * l2 };
    const a = G.aPantalla(p, codo), b = G.aPantalla(p, mun);
    const L = Math.hypot(b.x - a.x, b.y - a.y) || 1, u = { x: (b.x - a.x) / L, y: (b.y - a.y) / L };
    // normal hacia el lado de la cámara (arriba en el reposabrazos)
    let n = { x: u.y, y: -u.x }; if (n.y > 0) n = { x: -n.x, y: -n.y };
    return { a, b, u, n, L };
  }
  const RC = 7.6;                                    // medio ancho del corazón (px de pantalla)
  // punto del corazón para s ∈ [0, 2π] (curva clásica): s = 0 hendidura de arriba, s = π punta
  function curva(s) { const x = 16 * Math.pow(Math.sin(s), 3), y = 13 * Math.cos(s) - 5 * Math.cos(2 * s) - 2 * Math.cos(3 * s) - Math.cos(4 * s); return { x: x / 16, y: (y + 2) / 16 }; }
  function marco(p, esc = 1) {
    const f = antebrazo(p), cx = f.a.x + f.u.x * f.L * 0.56 + f.n.x * 1.5, cy = f.a.y + f.u.y * f.L * 0.56 + f.n.y * 1.5;
    // ejes: «arriba» del corazón = hacia la muñeca (u); «derecha» = n
    return { c: { x: cx, y: cy }, en: q => ({ x: cx + (q.x * f.n.x + q.y * f.u.x) * RC * esc, y: cy + (q.x * f.n.y + q.y * f.u.y) * RC * esc }), f };
  }
  // trazo 1: hendidura → lóbulo izquierdo → punta (s de 2π a π); trazo 2: hendidura → lóbulo derecho → punta (0 → π)
  const s1 = k => TAU - Math.PI * k, s2 = k => Math.PI * k;
  function puntaRotu(p, t) {
    const M = marco(p);
    if (t < T.trazo2 - 0.04) return M.en(curva(s1(suave(fase(t, T.trazo1, T.trazo1Fin)))));
    return M.en(curva(s2(suave(fase(t, T.trazo2, T.trazo2Fin)))));
  }
  function corazonDibujado(g, t, p) {
    if (t < T.trazo1) return;
    const k1 = suave(fase(t, T.trazo1, T.trazo1Fin)), k2 = suave(fase(t, T.trazo2, T.trazo2Fin));
    const lat = campana(t, T.latido, T.latido + 0.3), esc = 1 + 0.32 * lat;
    const M = marco(p, esc);
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    const trazo = (fs, k) => { if (k <= 0.001) return; const n = Math.max(2, Math.ceil(36 * k)); g.beginPath();
      for (let i = 0; i <= n; i++) { const q = M.en(curva(fs(k * i / n))); if (i) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); } g.stroke(); };
    // relleno rojo suave cuando está acabado (tinta de rotulador sobre la piel: solo el contorno, y
    // un toque de brillo); al latir se enrojece un poco
    if (k2 >= 1) {
      g.beginPath(); for (let i = 0; i <= 40; i++) { const q = M.en(curva(TAU * i / 40)); if (i) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); } g.closePath();
      g.fillStyle = `rgba(214,40,58,${0.18 + 0.5 * lat})`; g.fill();
    }
    g.strokeStyle = "#141017"; g.lineWidth = 1.7 * Math.sqrt(esc);
    trazo(s1, k1); trazo(s2, k2);
    if (k2 >= 1) { const q = M.en({ x: -0.42, y: 0.42 }); g.fillStyle = "rgba(255,255,255,0.75)"; g.beginPath(); g.arc(q.x, q.y, 0.9 * esc, 0, TAU); g.fill(); }
    g.restore();
  }

  /* =====================================================================================
   * SARA (derecha, mira a la izquierda), sentada en su taburete con ruedas
   * ===================================================================================== */
  const PEL_S = Sa.SUELO + (Y_PELVIS_S - SUELO) / (S * Sa.K) - Sa.PELVIS.y;
  const TOB_S = Sa.SUELO - Sa.TOBILLO_ALTO;
  const CARAS_S = {
    seria: E({ mx: 0.85, my: 0.1, c: 0.42, sd: 0, gd: 0, si: 2, gi: 0.02, abre: 0, ancho: 0.82, sonr: 0.02 }),
    prueba: E({ mx: 0.3, my: -0.3, c: 0.42, sd: 0, gd: 0, si: 4, gi: 0.03, abre: 0, ancho: 0.8, sonr: 0.06 }),
    trabaja: E({ mx: 0.7, my: 0.55, c: 0.45, sd: 0, gd: 0, si: 2, gi: 0.02, abre: 0, ancho: 0.8, sonr: 0.0 }),
    mira: E({ mx: 0.8, my: -0.1, c: 0.38, sd: 2, gd: 0.02, si: 12, gi: 0.07, abre: 0, ancho: 0.8, sonr: 0.0 }),
    camara: E({ mx: -0.85, my: 0, c: 0.52, sd: 0, gd: 0, si: 6, gi: 0.04, abre: 0, ancho: 0.78, sonr: 0.0 }),
    sopla: E({ mx: 0.7, my: 0.6, c: 0.5, sd: 0, gd: 0, si: 2, gi: 0.02, abre: 9, ancho: 0.36, sonr: -0.1, dientes: 0 }),
    unas: E({ mx: 0.55, my: 0.7, c: 0.55, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 0.8, sonr: 0.02 }),
    sonrisa: E({ mx: 0.85, my: -0.05, c: 0.45, sd: 2, gd: 0.02, si: 9, gi: 0.05, abre: 0, ancho: 0.86, sonr: 0.42 }),
    camaraFin: E({ mx: -0.85, my: 0, c: 0.4, sd: 2, gd: 0.02, si: 11, gi: 0.06, abre: 0, ancho: 0.88, sonr: 0.5 })
  };
  const GUION_CARA_S = [
    [T.prueba - 0.1, T.prueba + 0.1, "prueba"], [T.pruebaFin, T.pruebaFin + 0.2, "seria"], [T.sAcerca + 0.3, T.sLista, "trabaja"],
    [T.sMira, T.sMira + 0.2, "mira"], [T.sCamara, T.sCamara + 0.15, "camara"], [T.sDeja, T.sDeja + 0.2, "trabaja"],
    [T.sopla, T.sopla + 0.1, "sopla"], [T.soplaFin, T.soplaFin + 0.1, "trabaja"], [T.unas, T.unas + 0.2, "unas"],
    [T.despierta + 0.1, T.despierta + 0.3, "mira"], [T.sSonrisa, T.sSonrisa + 0.25, "sonrisa"], [T.sCamaraFin, T.sCamaraFin + 0.25, "camaraFin"]
  ];
  const CUERPOS_S = {
    inicio: { torso: 0.08, cab: 0.04, dx: 0 },
    prueba: { torso: 0.04, cab: -0.06, dx: 0 },
    acerca: { torso: 0.3, cab: 0.16, dx: -66 },
    mira: { torso: 0.26, cab: -0.04, dx: -66 },
    camara: { torso: 0.24, cab: -0.06, dx: -66 },
    deja: { torso: 0.28, cab: 0.12, dx: -66 },
    dibuja: { torso: 0.3, cab: 0.28, dx: -70 },
    espera: { torso: 0.06, cab: 0.08, dx: -56 },
    final: { torso: 0.05, cab: -0.04, dx: -56 }
  };
  const GUION_CUERPO_S = [
    [T.prueba - 0.15, T.prueba + 0.15, "prueba"], [T.pruebaFin, T.pruebaFin + 0.3, "inicio"], [T.sAcerca, T.sLista, "acerca"],
    [T.sMira, T.sMira + 0.3, "mira"], [T.sCamara, T.sCamara + 0.2, "camara"], [T.sDeja, T.sDeja + 0.3, "deja"],
    [T.trazo1 - 0.3, T.trazo1, "dibuja"], [T.sDejaR + 0.15, T.unas + 0.1, "espera"], [T.sSonrisa, T.sSonrisa + 0.3, "final"]
  ];
  const xTaburete = t => XS + guion(GUION_CUERPO_S, CUERPOS_S, "inicio", t).dx;

  function poseS(t) {
    const b = guion(GUION_CUERPO_S, CUERPOS_S, "inicio", t);
    const respira = Math.sin(t * 1.9 + 0.7);
    const p = {
      x: XS + b.dx, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: Sa.PELVIS.x, y: Sa.PELVIS.y + PEL_S + respira * 1.0 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      pelo: { viento: 0, inercia: 0 }
    };
    // la melena sigue al cuerpo: inercia con la velocidad de la inclinación y del rodar del taburete
    const b2 = guion(GUION_CUERPO_S, CUERPOS_S, "inicio", t - 0.1);
    p.pelo.inercia = clamp((b.torso - b2.torso) * 5 + (b.dx - b2.dx) * 0.04, -0.8, 0.8);
    // sopla: la cabeza se adelanta
    const so = dentro(t, T.sopla, T.sopla + 0.1, T.soplaFin, T.soplaFin + 0.12);
    p.cabeza.ang += 0.06 * so;
    // mirarse las uñas: cabeza baja y un ladeo
    const un = dentro(t, T.unas, T.unas + 0.25, T.despierta, T.despierta + 0.2);
    p.cabeza.ang += 0.12 * un + 0.03 * Math.sin((t - T.unas) * 2.2) * un;
    // golpecitos con el pie mientras espera
    const tap = dentro(t, T.unas + 0.2, T.unas + 0.35, T.despierta, T.despierta + 0.1);
    for (const [lado, dx, dy] of [["cerca", 168, 0], ["lejos", 214, -10]]) {
      let x = Sa.PELVIS.x + dx, y = TOB_S + dy, ang = 0;
      if (lado === "cerca") { const k = Math.max(0, Math.sin((t - T.unas) * 12)); y -= 26 * k * tap; ang -= 0.36 * k * tap; }
      p.piernas[lado] = { tob: { x, y }, ang };
    }
    const ex = guion(GUION_CARA_S, CARAS_S, "seria", t);
    p.cara = cara(ex, parpadeo(t, [1.85, 5.42, 9.2, 10.55, 11.9, 13.6], 0.16) + parpadeo(t, [T.sCamara + 0.25], 0.32));
    manosS(p, t);
    return p;
  }

  /* ---------- manos de Sara ---------- */
  // ángulo de la máquina (hacia la punta) y distancia del centro del puño a la punta
  const MAQ_PUNTA = 26, MAQ_ESC = 1.3;
  function manosS(p, t) {
    const pg = poseG(t), M = marco(pg);
    const xs = p.x;
    // máquina: en reposo, con la punta hacia arriba; en la prueba, en alto; al trabajar, sobre el antebrazo
    const MAQ_REPOSO = { x: xs - 54, y: 372, mu: -0.25, d: AGARRA, a: -1.9 };
    const MAQ_PRUEBA = { x: xs - 62, y: 340, mu: 0.15, d: AGARRA, a: -2.2 };
    const encima = (alto) => { const a = 2.25; return { x: M.c.x - Math.cos(a) * MAQ_PUNTA + 2, y: M.c.y - alto - Math.sin(a) * MAQ_PUNTA, mu: 0.05, d: AGARRA, a }; };
    const MAQ_DEJA = { x: MAQ_CARRO.x + 4, y: MAQ_CARRO.y - 8, mu: 0.4, d: AGARRA, a: Math.PI + MAQ_CARRO.rot };
    // rotulador: lo coge de la bandeja, lo destapa y dibuja con la punta exacta sobre el corazón
    const A_ROTU = 2.02, L_ROTU = 20;
    const conRotu = q => desdePinza({ x: q.x - Math.cos(A_ROTU) * L_ROTU, y: q.y - Math.sin(A_ROTU) * L_ROTU }, 0.6, ROTU);
    const COGE = desdePinza({ x: MARCADOR_CARRO.x, y: MARCADOR_CARRO.y - 2 }, 0.5, PINZA);
    const ALZA = { x: xs - 70, y: 330, mu: 0.2, d: ROTU };
    const sobre = (k, alto = 0) => { const q = puntaRotu(pg, k); return Object.assign(conRotu({ x: q.x, y: q.y - alto }), {}); };
    const DEJA_R = desdePinza({ x: MARCADOR_CARRO.x, y: MARCADOR_CARRO.y - 2 }, 0.5, PINZA);
    // uñas: la mano levantada bajo la barbilla, dedos doblados hacia ella (se las mira y gira la muñeca)
    const hS = Sa.aPantalla(p, Sa.tronco(p)(Sa.HOMBRO));
    const UNA = t2 => ({ x: hS.x - 46, y: hS.y - 4, mu: 1.36 + 0.16 * Math.sin((t2 - T.unas) * 3.1), d: UNAS });
    // reposo final: la mano en el muslo
    const MUSLO_S = { x: xs - 60, y: 392, mu: -1.1, d: RELAJADA };
    const PL = [
      [0, 0, MAQ_REPOSO],
      [T.prueba - 0.2, T.prueba, MAQ_PRUEBA],
      [T.pruebaFin, T.pruebaFin + 0.3, MAQ_REPOSO],
      [T.sAcerca + 0.1, T.sLista, t2 => encima(46)],
      [T.bzz, T.tieso + 0.08, t2 => encima(20)],
      [T.desmayo + 0.15, T.desmayado, t2 => encima(34)],
      [T.sDeja, T.sDejada, MAQ_DEJA],
      [T.sCoge - 0.05, T.sCogido - 0.1, COGE],
      [T.sCogido - 0.08, T.pop - 0.04, ALZA],
      [T.trazo1 - 0.32, T.trazo1, t2 => sobre(T.trazo1, 7)],
      [T.trazo1, T.trazo1Fin, t2 => sobre(t2), x => x],
      [T.trazo1Fin, T.trazo2 - 0.03, t2 => sobre(T.trazo2, 4)],
      [T.trazo2 - 0.03, T.trazo2Fin, t2 => sobre(t2), x => x],
      [T.trazo2Fin, T.sopla, t2 => sobre(T.trazo2Fin + 1, 12)],
      [T.sDejaR, T.sDejadoR, DEJA_R],
      [T.sDejadoR + 0.05, T.unas + 0.3, UNA],
      [T.despierta + 0.15, T.despierta + 0.55, MUSLO_S]
    ];
    const l = pista(PL, t);
    // ángulo de la máquina, mezclado igual que la mano
    let aMaq = -1.9;
    if (t >= T.prueba - 0.2) aMaq = lerp(-1.9, -2.2, suave(fase(t, T.prueba - 0.2, T.prueba)));
    if (t >= T.pruebaFin) aMaq = lerp(-2.2, -1.9, suave(fase(t, T.pruebaFin, T.pruebaFin + 0.3)));
    if (t >= T.sAcerca + 0.1) aMaq = lerpAng(-1.9, 2.25, suave(fase(t, T.sAcerca + 0.1, T.sLista)));
    if (t >= T.sDeja) aMaq = lerpAng(2.25, Math.PI + MAQ_CARRO.rot, suave(fase(t, T.sDeja, T.sDejada)));
    // vibración de la máquina mientras zumba
    const zz = zumbido(t);
    if (zz > 0.01) { l.x += 0.7 * zz * Math.sin(t * 157); l.y += 0.5 * zz * Math.sin(t * 131 + 1); }
    // ¿qué lleva en la mano?
    const conMaq = t < T.sDejada, conRotu_ = t >= T.sCogido - 0.12 && t < T.sDejadoR;
    p.maquina = conMaq ? { m: l, a: aMaq } : null;
    p.rotu = conRotu_ ? { m: l, a: t < T.trazo1 - 0.32 ? lerpAng(Math.PI + MARCADOR_CARRO.rot, A_ROTU, suave(fase(t, T.sCogido - 0.12, T.pop - 0.1))) : A_ROTU } : null;
    // golpe de pulgar al destapar
    if (Math.abs(t - T.pop) < 0.12) l.d = mezclaD(l.d, CAPUCHON, campana(t, T.pop - 0.1, T.pop + 0.1));
    p.manoLejos = manoRig(Sa, p, l, -1, g => conCamara(g, () => { if (p.maquina) maquina(g, t, p.maquina); if (p.rotu) rotulador(g, t, p.rotu); }));
    // mano cercana: en el bolsillo del pantalón (la de reposo del muñeco)
    p.manoCerca = null;
  }
  const zumbido = t => campana(t, T.prueba - 0.05, T.pruebaFin + 0.05) * 0.8 + dentro(t, T.bzz, T.bzz + 0.05, T.desmayo + 0.25, T.bzzFin);

  /* =====================================================================================
   * ATREZO
   * ===================================================================================== */
  // máquina de tatuar cómica (pantalla): punto de agarre en m, punta hacia el ángulo a
  function maquina(g, t, mq) {
    const m = mq.m, a = mq.a;
    g.save(); g.translate(m.x, m.y); g.rotate(a); g.scale(MAQ_ESC, MAQ_ESC); g.lineJoin = "round"; g.lineCap = "round";
    // cable que sale por detrás
    g.strokeStyle = "#1c1a1e"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-14, 0);
    g.bezierCurveTo(-22, 4, -26, 12, -22, 18); g.bezierCurveTo(-18, 24, -28, 28, -32, 34); g.stroke();
    // tubo de agarre y boquilla (sin aguja)
    g.fillStyle = "#c9ccd2"; g.strokeStyle = TINTA; g.lineWidth = 1.1;
    g.beginPath(); g.rect(-14, -2.6, 24, 5.2); g.fill(); g.stroke();
    g.fillStyle = "#e3e5ea"; g.beginPath(); g.moveTo(10, -2.6); g.lineTo(18, -1.2); g.lineTo(20, 0); g.lineTo(18, 1.2); g.lineTo(10, 2.6); g.closePath(); g.fill(); g.stroke();
    // armazón negro encima del tubo con sus dos bobinas de cobre
    g.fillStyle = "#24222a"; g.beginPath(); g.moveTo(-12, -2.6); g.lineTo(-12, -14); g.lineTo(6, -14); g.lineTo(6, -9); g.lineTo(-6, -9); g.lineTo(-6, -2.6); g.closePath(); g.fill(); g.stroke();
    for (const x of [-4, 2]) {
      g.fillStyle = "#c46a2e"; g.beginPath(); g.rect(x - 2.6, -9, 5.2, 6.4); g.fill(); g.stroke();
      g.strokeStyle = "rgba(255,210,160,0.7)"; g.lineWidth = 0.6; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x - 2.2, -7.6 + k * 2); g.lineTo(x + 2.2, -7.6 + k * 2); g.stroke(); }
      g.strokeStyle = TINTA; g.lineWidth = 1.1;
    }
    // muelle y barra de arriba (vibra al zumbar)
    const zz = zumbido(t), osc = zz > 0.01 ? Math.sin(t * 190) * 1.2 * zz : 0;
    g.fillStyle = "#9aa0aa"; g.beginPath(); g.rect(-8, -16.5 + osc, 14, 2.4); g.fill(); g.stroke();
    g.fillStyle = "#e4c35a"; g.beginPath(); g.arc(6, -15 + osc, 1.6, 0, TAU); g.fill(); g.stroke();
    g.restore();
    // líneas de zumbido
    if (zz > 0.02) {
      const pu = { x: m.x + Math.cos(a) * 4, y: m.y + Math.sin(a) * 4 - 8 };
      g.save(); g.strokeStyle = `rgba(255,236,180,${0.85 * zz})`; g.lineWidth = 1.4; g.lineCap = "round";
      for (const sg of [-1, 1]) for (let i = 0; i < 2; i++) {
        const r = 16 + i * 6 + 2 * Math.sin(t * 40 + i), a0 = (sg > 0 ? 0 : Math.PI) - 0.5, a1 = a0 + 1.0;
        g.beginPath();
        for (let k = 0; k <= 8; k++) { const an = lerp(a0, a1, k / 8), rr = r + (k % 2 ? 1.6 : -1.6); const x = pu.x + Math.cos(an) * rr, y = pu.y + Math.sin(an) * rr; if (k) g.lineTo(x, y); else g.moveTo(x, y); }
        g.stroke();
      }
      g.restore();
    }
  }
  // rotulador negro (pantalla): sale de la pinza de la mano m hacia el ángulo a (la punta)
  function rotulador(g, t, rt) {
    const q = pinza(rt.m), a = rt.a;
    g.save(); g.translate(q.x, q.y); g.rotate(a); g.lineJoin = "round";
    g.fillStyle = "#1e1c22"; g.strokeStyle = TINTA; g.lineWidth = 1;
    g.beginPath(); g.rect(-12, -2.2, 27, 4.4); g.fill(); g.stroke();
    g.fillStyle = "#5c5866"; g.fillRect(-9, -2.2, 3, 4.4);
    // punta (o capuchón hasta el pop)
    if (t < T.pop) {
      g.fillStyle = "#2a2730"; g.beginPath(); g.rect(12, -2.6, 9, 5.2); g.fill(); g.stroke();
      g.fillStyle = "#77737e"; g.fillRect(13, -3.6, 6, 1.2);
    } else {
      g.fillStyle = "#cfc8bf"; g.beginPath(); g.moveTo(15, -1.8); g.lineTo(17.4, -1.2); g.lineTo(17.4, 1.2); g.lineTo(15, 1.8); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#111"; g.beginPath(); g.moveTo(17.4, -1.1); g.lineTo(20, -0.4); g.lineTo(20, 0.4); g.lineTo(17.4, 1.1); g.closePath(); g.fill();
    }
    g.restore();
  }
  // capuchón volando hasta la bandeja (pantalla)
  function capuchon(g, t, enVuelo) {
    if (t < T.pop) return;
    const u = fase(t, T.pop, T.pop + 0.55);
    if (enVuelo !== (u < 1)) return;
    let x, y, rot;
    if (u < 1) {
      // sale de la punta del rotulador en el momento del pop
      const p0 = popPunto, p1 = CAP_CARRO;
      x = lerp(p0.x, p1.x, u); y = lerp(p0.y, p1.y, u) - 42 * Math.sin(Math.PI * u); rot = popAng + u * 9;
    } else { const v = t - (T.pop + 0.55); x = CAP_CARRO.x; y = CAP_CARRO.y - 3 * Math.exp(-v * 12) * Math.abs(Math.sin(v * 26)); rot = 0.3; }
    g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = "#2a2730"; g.strokeStyle = TINTA; g.lineWidth = 1;
    g.beginPath(); g.rect(-4.5, -2.6, 9, 5.2); g.fill(); g.stroke(); g.fillStyle = "#77737e"; g.fillRect(-3.5, -3.6, 6, 1.2); g.restore();
  }
  let popPunto = { x: 0, y: 0 }, popAng = 0;
  function calculaPop() {
    const pS = poseS(T.pop), rt = pS.rotu || { m: { x: 0, y: 0, mu: 0 }, a: 0 }, q = pinza(rt.m);
    popPunto = { x: q.x + Math.cos(rt.a) * 17, y: q.y + Math.sin(rt.a) * 17 }; popAng = rt.a;
  }

  /* ---------- muebles (pantalla) ---------- */
  function sillon(g) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = TINTA; g.lineWidth = 2;
    // base cromada
    g.fillStyle = "#2a2a30"; g.beginPath(); g.ellipse(XG + 2, SUELO + 2, 54, 8, 0, 0, TAU); g.fill(); g.stroke();
    const gb = g.createLinearGradient(XG - 8, 0, XG + 10, 0); gb.addColorStop(0, "#8d9098"); gb.addColorStop(0.45, "#eef0f4"); gb.addColorStop(1, "#6d7078");
    g.fillStyle = gb; g.fillRect(XG - 7, Y_ASIENTO_G + 18, 16, SUELO - Y_ASIENTO_G - 18); g.strokeRect(XG - 7, Y_ASIENTO_G + 18, 16, SUELO - Y_ASIENTO_G - 18);
    g.fillStyle = "#3a3a42"; g.fillRect(XG - 26, Y_ASIENTO_G + 14, 54, 8); g.strokeRect(XG - 26, Y_ASIENTO_G + 14, 54, 8);
    // respaldo reclinado y reposacabezas (cuero negro con costuras)
    const cuero = (path, brillo) => { path(); g.fillStyle = "#1d1b20"; g.fill(); g.stroke();
      g.save(); path(); g.clip(); g.strokeStyle = "rgba(255,255,255,0.08)"; g.lineWidth = 6; g.beginPath(); brillo(); g.stroke(); g.restore(); };
    g.save(); g.translate(266, Y_ASIENTO_G + 4); g.rotate(-0.14);
    cuero(() => { g.beginPath(); g.roundRect(-14, -176, 30, 182, 12); }, () => { g.moveTo(-4, -164); g.lineTo(-4, -10); });
    g.strokeStyle = "rgba(255,255,255,0.12)"; g.lineWidth = 1; g.setLineDash([3, 3]); g.beginPath(); g.roundRect(-10, -170, 22, 170, 9); g.stroke(); g.setLineDash([]);
    // varilla y reposacabezas
    g.strokeStyle = TINTA; g.lineWidth = 2; g.fillStyle = "#b8bcc4"; g.fillRect(-2, -211, 6, 38); g.strokeRect(-2, -211, 6, 38);
    cuero(() => { g.beginPath(); g.roundRect(-17, -248, 36, 40, 15); }, () => { g.moveTo(-7, -240); g.lineTo(-7, -216); });
    g.restore();
    // asiento
    cuero(() => { g.beginPath(); g.roundRect(256, Y_ASIENTO_G - 6, 136, 26, 11); }, () => { g.moveTo(268, Y_ASIENTO_G); g.lineTo(380, Y_ASIENTO_G); });
    g.strokeStyle = "rgba(255,255,255,0.12)"; g.lineWidth = 1; g.setLineDash([3, 3]); g.beginPath(); g.roundRect(261, Y_ASIENTO_G - 2, 126, 18, 8); g.stroke(); g.setLineDash([]);
    g.restore();
  }
  function reposabrazos(g, t) {
    g.save(); g.lineJoin = "round"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.fillStyle = "#2a2a30"; g.beginPath(); g.ellipse(POSA.poste, SUELO + 1, 30, 5, 0, 0, TAU); g.fill(); g.stroke();
    const gb = g.createLinearGradient(POSA.poste - 5, 0, POSA.poste + 6, 0); gb.addColorStop(0, "#8d9098"); gb.addColorStop(0.45, "#eef0f4"); gb.addColorStop(1, "#6d7078");
    g.fillStyle = gb; g.fillRect(POSA.poste - 4, POSA.y + 12, 9, SUELO - POSA.y - 12); g.strokeRect(POSA.poste - 4, POSA.y + 12, 9, SUELO - POSA.y - 12);
    g.fillStyle = "#3a3a42"; g.fillRect(POSA.poste - 14, POSA.y + 10, 30, 5); g.strokeRect(POSA.poste - 14, POSA.y + 10, 30, 5);
    // cojín: cuero negro y un papel protector encima
    g.fillStyle = "#1d1b20"; g.beginPath(); g.roundRect(POSA.x0, POSA.y - 2, POSA.x1 - POSA.x0, 14, 7); g.fill(); g.stroke();
    g.fillStyle = "rgba(240,236,228,0.85)"; g.beginPath(); g.roundRect(POSA.x0 + 6, POSA.y - 3, POSA.x1 - POSA.x0 - 12, 4, 2); g.fill();
    // charco de luz de la lámpara
    const k = 0.9 + 0.1 * Math.sin(t * 0.7);
    const gl = g.createRadialGradient(440, POSA.y - 4, 2, 440, POSA.y - 4, 70);
    gl.addColorStop(0, `rgba(255,244,214,${0.22 * k})`); gl.addColorStop(1, "rgba(255,244,214,0)");
    g.fillStyle = gl; g.fillRect(370, POSA.y - 74, 140, 140);
    g.restore();
  }
  function taburete(g, t) {
    const x = xTaburete(t) + 6, roda = xTaburete(t) - XS;
    g.save(); g.lineJoin = "round"; g.strokeStyle = TINTA; g.lineWidth = 2;
    // patas en estrella con ruedas (giran al rodar)
    for (const [dx, dy, s] of [[-30, 4, 0.85], [30, 4, 0.85], [-14, 9, 1], [16, 9, 1], [0, 1, 0.7]]) {
      g.strokeStyle = "#3a3a42"; g.lineWidth = 4 * s; g.beginPath(); g.moveTo(x, SUELO - 14); g.lineTo(x + dx, SUELO - 6 + dy); g.stroke();
      g.save(); g.translate(x + dx, SUELO - 2 + dy); g.rotate(-roda / 5); g.fillStyle = "#16151a"; g.strokeStyle = TINTA; g.lineWidth = 1.4;
      g.beginPath(); g.arc(0, 0, 4.5 * s, 0, TAU); g.fill(); g.stroke(); g.strokeStyle = "#55535c"; g.beginPath(); g.moveTo(-3 * s, 0); g.lineTo(3 * s, 0); g.stroke(); g.restore();
    }
    g.strokeStyle = TINTA; g.lineWidth = 2;
    const gb = g.createLinearGradient(x - 5, 0, x + 6, 0); gb.addColorStop(0, "#8d9098"); gb.addColorStop(0.45, "#eef0f4"); gb.addColorStop(1, "#6d7078");
    g.fillStyle = gb; g.fillRect(x - 4, Y_ASIENTO_S + 6, 9, SUELO - 14 - Y_ASIENTO_S - 6); g.strokeRect(x - 4, Y_ASIENTO_S + 6, 9, SUELO - 14 - Y_ASIENTO_S - 6);
    // asiento redondo
    g.fillStyle = "#121115"; g.beginPath(); g.ellipse(x, Y_ASIENTO_S + 6, 34, 9, 0, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = "#1d1b20"; g.beginPath(); g.ellipse(x, Y_ASIENTO_S, 34, 9, 0, 0, TAU); g.fill(); g.stroke();
    g.restore();
  }
  function carrito(g, t, pS) {
    const { x, y, w } = CARRO;
    g.save(); g.lineJoin = "round"; g.strokeStyle = TINTA; g.lineWidth = 1.8;
    // patas y ruedas
    for (const dx of [-w / 2 + 6, w / 2 - 6]) {
      g.fillStyle = "#9aa0aa"; g.fillRect(x + dx - 2, y, 4, SUELO - y - 8); g.strokeRect(x + dx - 2, y, 4, SUELO - y - 8);
      g.fillStyle = "#16151a"; g.beginPath(); g.arc(x + dx, SUELO - 4, 4, 0, TAU); g.fill(); g.stroke();
    }
    g.fillStyle = "#7d828c"; g.fillRect(x - w / 2 + 4, y + 96, w - 8, 4); g.strokeRect(x - w / 2 + 4, y + 96, w - 8, 4);
    // bandeja de acero
    g.fillStyle = "#c9ccd2"; g.beginPath(); g.roundRect(x - w / 2, y, w, 7, 2); g.fill(); g.stroke();
    // rollo de papel y tapones de tinta
    g.fillStyle = "#f2efe8"; g.beginPath(); g.roundRect(x + 21, y - 20, 14, 20, 3); g.fill(); g.stroke();
    g.fillStyle = "#c9c2b6"; g.beginPath(); g.ellipse(x + 28, y - 20, 7, 2.4, 0, 0, TAU); g.fill(); g.stroke();
    [["#141016", -33], ["#c8202f", -26]].forEach(([c, dx]) => {
      g.fillStyle = "#e8e6e2"; g.beginPath(); g.roundRect(x + dx - 3, y - 6, 6, 6, 1); g.fill(); g.stroke();
      g.fillStyle = c; g.beginPath(); g.ellipse(x + dx, y - 6, 2.6, 1, 0, 0, TAU); g.fill();
    });
    g.restore();
    // la máquina, cuando la deja
    if (t >= T.sDejada && !pS.maquina) maquina(g, t, { m: { x: MAQ_CARRO.x + 4, y: MAQ_CARRO.y - 8 }, a: Math.PI + MAQ_CARRO.rot });
    capuchon(g, t, false);
    // el rotulador tumbado (antes de cogerlo y después de dejarlo)
    if (!pS.rotu) {
      g.save(); g.translate(MARCADOR_CARRO.x, MARCADOR_CARRO.y); g.rotate(MARCADOR_CARRO.rot);
      g.fillStyle = "#1e1c22"; g.strokeStyle = TINTA; g.lineWidth = 1; g.beginPath(); g.rect(-13, -2.2, 26, 4.4); g.fill(); g.stroke();
      g.fillStyle = "#5c5866"; g.fillRect(-10, -2.2, 3, 4.4);
      if (t < T.pop) { g.fillStyle = "#2a2730"; g.beginPath(); g.rect(10, -2.6, 9, 5.2); g.fill(); g.stroke(); }
      else { g.fillStyle = "#cfc8bf"; g.beginPath(); g.moveTo(13, -1.8); g.lineTo(15, -1.2); g.lineTo(15, 1.2); g.lineTo(13, 1.8); g.closePath(); g.fill(); g.stroke(); }
      g.restore();
    }
  }
  // lámpara colgante de taller (pantalla): cable desde el techo y pantalla cónica sobre el reposabrazos
  const FOCO = { x: 452, y: 128 };
  function lampara(g, t) {
    const bal = 0.02 * Math.sin(t * 0.9);
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.translate(FOCO.x, -80); g.rotate(bal);
    const L = FOCO.y + 80;
    g.strokeStyle = TINTA; g.lineWidth = 2.4; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, L - 26); g.stroke();
    // casquillo y pantalla de metal oscuro
    g.fillStyle = "#3a3a42"; g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.roundRect(-5, L - 30, 10, 10, 2); g.fill(); g.stroke();
    const gp = g.createLinearGradient(-26, 0, 26, 0); gp.addColorStop(0, "#1e1d24"); gp.addColorStop(0.35, "#4a4a56"); gp.addColorStop(1, "#16151a");
    g.fillStyle = gp; g.beginPath(); g.moveTo(-8, L - 21); g.lineTo(8, L - 21); g.lineTo(27, L); g.lineTo(-27, L); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#fff6d8"; g.beginPath(); g.ellipse(0, L, 27, 5, 0, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.9)"; g.beginPath(); g.ellipse(0, L + 1, 9, 2.4, 0, 0, TAU); g.fill();
    g.restore();
  }
  function conoLuz(g, t) {
    const k = 0.92 + 0.08 * Math.sin(t * 0.7), bal = 0.02 * Math.sin(t * 0.9) * (FOCO.y + 80);
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createLinearGradient(0, FOCO.y, 0, POSA.y + 8);
    gr.addColorStop(0, `rgba(255,236,190,${0.13 * k})`); gr.addColorStop(1, "rgba(255,236,190,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(FOCO.x - bal - 26, FOCO.y + 2); g.lineTo(FOCO.x - bal + 26, FOCO.y + 2); g.lineTo(FOCO.x + 74, POSA.y + 8); g.lineTo(FOCO.x - 74, POSA.y + 8); g.closePath(); g.fill();
    g.restore();
  }

  /* ---------- fondo (una vez) ---------- */
  let fondo = null, neon = null;
  const PARED = 508;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 160; c.height = H + 140; const g = c.getContext("2d");
    g.translate(80, 70); g.lineJoin = "round"; g.lineCap = "round";
    // pared color ciruela con un estuco suave
    const gr = g.createLinearGradient(0, -70, 0, PARED);
    gr.addColorStop(0, "#241521"); gr.addColorStop(0.6, "#33202f"); gr.addColorStop(1, "#2a1a27");
    g.fillStyle = gr; g.fillRect(-80, -70, W + 160, PARED + 70);
    for (let i = 0; i < 420; i++) { const x = -80 + hash(i * 3.1) * (W + 160), y = -70 + hash(i * 7.7) * (PARED + 70), r = 6 + 22 * hash(i * 1.3);
      g.fillStyle = `rgba(${hash(i) > 0.5 ? "255,220,240" : "0,0,0"},${0.025 + 0.03 * hash(i * 9.1)})`; g.beginPath(); g.ellipse(x, y, r, r * 0.7, hash(i) * 3, 0, TAU); g.fill(); }
    // zócalo negro
    g.fillStyle = "#121014"; g.fillRect(-80, PARED - 16, W + 160, 16); g.fillStyle = "#2b2830"; g.fillRect(-80, PARED - 17, W + 160, 2);
    // suelo de damero blanco y negro (perspectiva)
    const Y0 = PARED, VP = { x: 512, y: -320 };
    const filas = [Y0, 521, 538, 561, 592, 634, 690];
    const xEn = (X, y) => VP.x + (X - VP.x) * (y - VP.y) / (Y0 - VP.y);
    for (let r = 0; r < filas.length - 1; r++) for (let k = -16; k < 16; k++) {
      const X0 = 512 + k * 56, X1 = X0 + 56, ya = filas[r], yb = filas[r + 1];
      g.beginPath(); g.moveTo(xEn(X0, ya), ya); g.lineTo(xEn(X1, ya), ya); g.lineTo(xEn(X1, yb), yb); g.lineTo(xEn(X0, yb), yb); g.closePath();
      g.fillStyle = (r + k) % 2 ? "#a49a8e" : "#1a171c"; g.fill();
    }
    const gs = g.createLinearGradient(0, Y0, 0, Y0 + 130); gs.addColorStop(0, "rgba(20,8,20,0.62)"); gs.addColorStop(1, "rgba(20,8,20,0.3)"); g.fillStyle = gs; g.fillRect(-80, Y0, W + 160, 160);
    // hojas de flash clavadas con chinchetas (sin letras)
    const hoja = (x, y, w, h, rot, dib) => {
      g.save(); g.translate(x, y); g.rotate(rot);
      g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(-w / 2 + 3, -h / 2 + 4, w, h);
      g.fillStyle = "#efe4cc"; g.fillRect(-w / 2, -h / 2, w, h); g.strokeStyle = "rgba(90,70,50,0.6)"; g.lineWidth = 1; g.strokeRect(-w / 2, -h / 2, w, h);
      dib(); g.fillStyle = "#c8202f"; g.beginPath(); g.arc(0, -h / 2 + 5, 3, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.stroke();
      g.restore();
    };
    const tinta = (c, w = 1.8) => { g.strokeStyle = c; g.lineWidth = w; };
    const corazonD = (x, y, r, rel, borde) => { g.beginPath(); for (let i = 0; i <= 40; i++) { const q = curva(TAU * i / 40); const X = x + q.x * r, Y = y - q.y * r; if (i) g.lineTo(X, Y); else g.moveTo(X, Y); } g.closePath(); g.fillStyle = rel; g.fill(); tinta(borde); g.stroke(); };
    // corazón con cinta en blanco
    hoja(96, 148, 74, 86, -0.05, () => {
      corazonD(0, 6, 22, "#d23a48", TINTA);
      g.fillStyle = "#f6efe0"; g.beginPath(); g.moveTo(-30, 4); g.lineTo(30, 4); g.lineTo(34, 12); g.lineTo(30, 20); g.lineTo(-30, 20); g.lineTo(-34, 12); g.closePath(); g.fill(); tinta(TINTA, 1.4); g.stroke();
    });
    // golondrina
    hoja(176, 226, 70, 60, 0.07, () => {
      g.fillStyle = "#2a5bb0"; g.beginPath(); g.moveTo(-24, -4); g.quadraticCurveTo(-6, -18, 8, -6); g.quadraticCurveTo(20, -2, 26, -10); g.quadraticCurveTo(20, 6, 6, 4);
      g.lineTo(-6, 18); g.lineTo(-4, 4); g.quadraticCurveTo(-16, 6, -24, -4); g.closePath(); g.fill(); tinta(TINTA, 1.4); g.stroke();
      g.fillStyle = "#e0b040"; g.beginPath(); g.arc(14, -6, 2, 0, TAU); g.fill();
    });
    // ancla
    hoja(70, 262, 56, 72, -0.09, () => {
      tinta("#1d1d24", 3.2); g.beginPath(); g.moveTo(0, -24); g.lineTo(0, 18); g.moveTo(-10, -12); g.lineTo(10, -12); g.moveTo(-16, 8); g.quadraticCurveTo(-12, 22, 0, 22); g.quadraticCurveTo(12, 22, 16, 8); g.stroke();
      g.beginPath(); g.arc(0, -28, 4, 0, TAU); g.stroke();
    });
    // estrella náutica y rosa (derecha)
    hoja(868, 150, 66, 66, 0.06, () => {
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * TAU / 5; g.fillStyle = i % 2 ? "#1d1d24" : "#c8202f";
        g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 24, Math.sin(a) * 24); g.lineTo(Math.cos(a + TAU / 10) * 10, Math.sin(a + TAU / 10) * 10); g.closePath(); g.fill(); tinta(TINTA, 1); g.stroke(); }
    });
    hoja(940, 236, 70, 78, -0.06, () => {
      g.fillStyle = "#2c8a4c"; g.beginPath(); g.ellipse(-12, 18, 10, 5, -0.6, 0, TAU); g.fill(); tinta(TINTA, 1.2); g.stroke();
      g.beginPath(); g.ellipse(12, 20, 10, 5, 0.6, 0, TAU); g.fill(); g.stroke();
      g.fillStyle = "#c8202f"; g.beginPath(); g.arc(0, 0, 16, 0, TAU); g.fill(); g.stroke();
      tinta("#7a101c", 1.6); for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(1, 1, 4 + k * 4, 0.5 + k, 4.6 + k); g.stroke(); }
    });
    // calavera simpática (gótica, sin miedo)
    hoja(810, 250, 58, 64, 0.1, () => {
      g.fillStyle = "#f6f1e6"; g.beginPath(); g.ellipse(0, -4, 16, 15, 0, 0, TAU); g.fill(); tinta(TINTA, 1.6); g.stroke();
      g.beginPath(); g.roundRect(-8, 6, 16, 10, 3); g.fill(); g.stroke();
      g.fillStyle = TINTA; g.beginPath(); g.ellipse(-6, -4, 4.5, 5, 0, 0, TAU); g.ellipse(6, -4, 4.5, 5, 0, 0, TAU); g.fill();
      g.fillStyle = "#c8202f"; g.beginPath(); g.arc(-6, -3, 1.6, 0, TAU); g.arc(6, -3, 1.6, 0, TAU); g.fill();
      tinta(TINTA, 1.2); for (const x of [-4, 0, 4]) { g.beginPath(); g.moveTo(x, 9); g.lineTo(x, 15); g.stroke(); }
    });
    // balda con botes de tinta de colores (derecha, sin etiquetas)
    g.save(); g.translate(690, 318);
    g.fillStyle = "#1a141a"; g.fillRect(0, 0, 250, 10); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(0, 0, 250, 10);
    g.fillStyle = "#121014"; g.fillRect(20, 10, 8, 16); g.fillRect(222, 10, 8, 16);
    ["#141016", "#c8202f", "#e0a020", "#2a6fd0", "#2c9a54", "#8a3ac8", "#ef6aa0", "#f2efe8", "#141016", "#d65a20"].forEach((col, i) => {
      const x = 12 + i * 23, h = 26 + 8 * hash(i * 2.3);
      g.fillStyle = "rgba(240,240,250,0.85)"; g.beginPath(); g.roundRect(x, -h, 16, h, 3); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke();
      g.fillStyle = col; g.fillRect(x + 2, -h * 0.62, 12, h * 0.62 - 2);
      g.fillStyle = "#1a1a20"; g.fillRect(x + 4, -h - 6, 8, 7); g.strokeRect(x + 4, -h - 6, 8, 7);
      g.fillStyle = "rgba(255,255,255,0.5)"; g.fillRect(x + 3, -h + 4, 2, h - 8);
    });
    g.restore();
    // planta colgante (izquierda), de una maceta en un gancho
    g.save(); g.translate(250, 20);
    g.strokeStyle = "#8a7a62"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, -90); g.lineTo(-14, 0); g.moveTo(0, -90); g.lineTo(14, 0); g.stroke();
    g.fillStyle = "#b5643a"; g.beginPath(); g.moveTo(-18, 0); g.lineTo(18, 0); g.lineTo(13, 22); g.lineTo(-13, 22); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.stroke();
    for (let r = 0; r < 4; r++) {
      const x0 = -16 + r * 11; let x = x0, y = 4;
      g.strokeStyle = "#2f6a3a"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 7 + r; k++) { x += 3 * Math.sin(k * 1.3 + r); y += 12; g.lineTo(x, y); }
      g.stroke();
      x = x0; y = 4;
      for (let k = 0; k < 7 + r; k++) { x += 3 * Math.sin(k * 1.3 + r); y += 12; g.fillStyle = k % 2 ? "#3f8f4c" : "#4fa85c";
        g.beginPath(); g.ellipse(x + (k % 2 ? 5 : -5), y, 6, 3.6, k % 2 ? 0.6 : -0.6, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1; g.stroke(); }
    }
    g.restore();
    return c;
  }
  // neón de corazón con alas (sin letras): se dibuja con su halo una vez y respira despacio
  function creaNeon() {
    const c = document.createElement("canvas"); c.width = 300; c.height = 170; const g = c.getContext("2d");
    g.translate(150, 85); g.lineJoin = "round"; g.lineCap = "round";
    const forma = () => {
      g.beginPath(); for (let i = 0; i <= 40; i++) { const q = curva(TAU * i / 40); const X = q.x * 30, Y = -q.y * 30; if (i) g.lineTo(X, Y); else g.moveTo(X, Y); } g.closePath();
      for (const sg of [-1, 1]) {
        g.moveTo(sg * 30, -12); g.quadraticCurveTo(sg * 70, -48, sg * 110, -36);
        g.moveTo(sg * 32, -2); g.quadraticCurveTo(sg * 66, -26, sg * 98, -16);
        g.moveTo(sg * 30, 8); g.quadraticCurveTo(sg * 60, -6, sg * 84, 2);
      }
    };
    g.filter = "blur(8px)"; forma(); g.strokeStyle = "rgba(255,80,170,0.9)"; g.lineWidth = 10; g.stroke();
    g.filter = "blur(3px)"; forma(); g.strokeStyle = "rgba(255,120,200,0.9)"; g.lineWidth = 6; g.stroke();
    g.filter = "none"; forma(); g.strokeStyle = "#ffd6ef"; g.lineWidth = 2.6; g.stroke();
    return c;
  }

  /* ---------- efectos ---------- */
  function estrellita(g, x, y, r, a, k) {
    if (k <= 0.01) return;
    g.save(); g.translate(x, y); g.rotate(a); g.scale(k, k); g.beginPath();
    for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.3 : r, an = i * Math.PI / 4; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
    g.closePath(); g.fillStyle = "#fff6b8"; g.fill(); g.lineWidth = 1.2; g.strokeStyle = "#e0a400"; g.stroke(); g.restore();
  }
  function efectos(g, t, pG, pS) {
    // ¡pop! del capuchón
    const kp = fase(t, T.pop, T.pop + 0.28);
    if (kp > 0 && kp < 1) {
      g.save(); g.strokeStyle = `rgba(255,248,220,${Math.sin(Math.PI * kp)})`; g.lineWidth = 1.4; g.lineCap = "round";
      for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + 0.3, r0 = 4 + 8 * kp, r1 = r0 + 4; g.beginPath(); g.moveTo(popPunto.x + Math.cos(a) * r0, popPunto.y + Math.sin(a) * r0); g.lineTo(popPunto.x + Math.cos(a) * r1, popPunto.y + Math.sin(a) * r1); g.stroke(); }
      g.restore();
    }
    capuchon(g, t, true);
    // soplido: rayitas de la boca de Sara al corazón
    const so = dentro(t, T.sopla + 0.05, T.sopla + 0.15, T.soplaFin - 0.05, T.soplaFin + 0.05);
    if (so > 0.01) {
      const b = Sa.aPantalla(pS, Sa.boca(pS)), M = marco(pG);
      g.save(); g.strokeStyle = `rgba(230,240,255,${0.8 * so})`; g.lineWidth = 1.3; g.lineCap = "round";
      for (let i = 0; i < 3; i++) {
        const k = ((t * 2.4 + i / 3) % 1), x = lerp(b.x - 6, M.c.x + 6, k), y = lerp(b.y + 2, M.c.y - 4, k) + (i - 1) * 4;
        g.globalAlpha = Math.sin(Math.PI * k); g.beginPath(); g.moveTo(x + 6, y - 2); g.quadraticCurveTo(x, y - 4 + 3 * Math.sin(t * 20 + i), x - 6, y); g.stroke();
      }
      g.restore();
    }
    // chispitas alrededor del corazón al verlo y al sacar bíceps; el latido
    const M = marco(pG);
    const ve = dentro(t, T.ve, T.ve + 0.1, T.orgullo + 0.1, T.orgullo + 0.3), bi = dentro(t, T.flexionado - 0.05, T.flexionado + 0.15, T.fin, T.fin + 0.3);
    for (let i = 0; i < 5; i++) {
      const a = i * TAU / 5 + t * 1.6, r = 16 + 4 * Math.sin(t * 5 + i), k = Math.max(ve, bi) * (0.6 + 0.4 * Math.sin(t * 9 + i * 2));
      estrellita(g, M.c.x + Math.cos(a) * r, M.c.y + Math.sin(a) * r, 4.2, t * 2 + i, k);
    }
    const lat = fase(t, T.latido, T.latido + 0.45);
    if (lat > 0 && lat < 1) {
      g.save(); g.strokeStyle = `rgba(255,120,140,${Math.sin(Math.PI * lat)})`; g.lineWidth = 1.4; g.lineCap = "round";
      for (const sg of [-1, 1]) for (let i = 0; i < 2; i++) { const r = 12 + 8 * lat + i * 4; g.beginPath(); g.arc(M.c.x, M.c.y, r, (sg > 0 ? 0 : Math.PI) - 0.45, (sg > 0 ? 0 : Math.PI) + 0.45); g.stroke(); }
      g.restore();
    }
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const pG = poseG(Math.min(t, T.trazo1)), M = marco(pG);
    // acercamiento al antebrazo mientras dibuja; vuelve para el despertar
    const a = tramo(t, T.sCoge, T.trazo1, suave) * (1 - tramo(t, T.soplaFin + 0.2, T.despierta, suave));
    const b = tramo(t, T.orgullo - 0.1, T.gCamara + 0.4, suave);
    const k = lerp(lerp(1.14, 1.36, b), 1.95, a);
    const x = lerp(lerp(500, 462, b), M.c.x + 20, a), y = lerp(lerp(330, 286, b), M.c.y - 12, a);
    // pequeño respingo de la cámara al desmayarse
    const u = t - T.desmayado; let dy = 0;
    if (u > 0 && u < 0.5) dy = 1.4 * Math.exp(-u * 9) * Math.sin(u * 40);
    return { k, x, y: y + dy };
  }

  function poses(t) { return { g: poseG(t), s: poseS(t) }; }

  class ElTatuaje extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Sa.listo()) return;
      if (!fondo) { fondo = creaFondo(); neon = creaNeon(); calculaPop(); }
      const pG = poseG(t), pS = poseS(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      BASE_M = g.getTransform();
      g.drawImage(fondo, -80, -70);
      g.save(); g.globalAlpha = 0.85 + 0.15 * Math.sin(t * 1.3); g.drawImage(neon, 668 - 150, 112 - 85); g.restore();
      conoLuz(g, t);
      lampara(g, t);
      carrito(g, t, pS);
      sillon(g);
      reposabrazos(g, t);
      taburete(g, t);
      G.dibujar(g, pG, t);
      Sa.dibujar(g, pS, t);
      efectos(g, t, pG, pS);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }

  registrar({ id: "00121", nombre: "Guillermo y Sara · El tatuaje", crear: () => new ElTatuaje() });
  // diagnóstico: distancia hombro → muñeca / largo del brazo (≤ 1,08 o la mano se despega)
  function diag(t) {
    const out = {};
    for (const [n, Rg, p] of [["g", G, poseG(t)], ["s", Sa, poseS(t)]]) for (const lado of ["cerca", "lejos"]) {
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m) continue;
      const Tr = Rg.tronco(p), h = Tr(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO), mu = m.mu ?? -1.75;
      const w = { x: m.x + Math.cos(mu) * Rg.MUNECA_R * Rg.JK, y: m.y + Math.sin(mu) * Rg.MUNECA_R * Rg.JK };
      out[n + lado] = +(Math.hypot(w.x - h.x, w.y - h.y) / (lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L)).toFixed(3);
    }
    return out;
  }
  window.__A2D_00121 = { pose: poses, poseG, poseS, T, DUR, diag };
})();
