"use strict";
/* 00014 · Guillermo y Laura · El baile lento
 *
 * Negro → salón de baile de noche (ventanal con luna, cortinas de terciopelo) y un foco cálido
 * sobre la pareja. Bailan agarrados: él con la mano en la cintura de ella y la otra en el corazón,
 * ella con la mano en su hombro; él lleva una rosa roja entre los dientes y suben corazones →
 * él le pisa el pie (estrellitas, mueca de dolor) y, al rato, otra vez más fuerte: un corazón se
 * parte → Laura mira a cámara harta, levanta el dedo («no, no») y toma el mando: la luz se vuelve
 * roja de tango, lo empuja hacia atrás, lo lanza a la distancia de los brazos con la mano en la
 * cadera y lo recoge → remata con un «paso de tango» en el que el inclinado hacia atrás es él,
 * desmayado con la mano en la frente → se le cae la rosa, se pone colorado, ojos de corazón y
 * estallan los corazones → ella guiña un ojo a cámara → negro.
 *
 * Los dos salen de sus avatares 2D (Guillermo y Laura). Sin textos. Todo depende del tiempo absoluto.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, L = Laura;
  const S = 0.32, SUELO = 566;
  const DUR = 14.2;
  const XG = 438, XL = 586;                       // pelvis de cada uno (pantalla)
  const T = {
    pisa1: 3.0, pisa2: 4.75, harta: 5.45, manda: 6.25, lleva1: 6.7, lleva2: 7.5, lleva3: 8.2,
    prepara: 8.75, inclina: 9.25, rosa: 9.45, corazones: 9.9, guino: 11.55, fin: 13.05
  };
  const TAU = Math.PI * 2;
  const lerpAng = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  const guion = (t, base, lista, tabla, curva = suave) => {
    let e = tabla[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; e = mezclaE(e, tabla[nom], (f || curva)(fase(t, t0, t1))); }
    return Object.assign({}, e);                   // copia: quien la use puede sumarle cosas sin tocar la tabla
  };

  /* ---------- balanceo lento (el compás del baile) ---------- */
  // Un vaivén cada 2,4 s mientras bailan agarrados; cuando manda Laura, los vaivenes los marca ella.
  const vaiven = t => Math.sin((t - 0.2) * TAU / 2.4);
  const bailaSuave = t => 1 - tramo(t, T.manda - 0.3, T.manda + 0.2);

  /* ---------- pies (x de pantalla de cada tobillo) ---------- */
  const PIE_G = { cerca: XG - 20, lejos: XG + 21 }, PIE_L = { cerca: XL + 22, lejos: XL - 21 };
  // el pie de Laura que pisa él: el lejano (el de en medio)
  const PISADA = { x: PIE_L.lejos - 38, alto: 36 };   // tobillo de Guillermo sobre la puntera de ella; alto en hoja
  // [t0, t1, x, alto (hoja), giro]: el pie va de la posición anterior a esta con un arco
  const PASOS_G = {
    cerca: [[-9, -8, PIE_G.cerca, 0, 0], [T.lleva1 - 0.02, T.lleva1 + 0.3, PIE_G.cerca - 62, 0, 0], [T.lleva2 + 0.05, T.lleva2 + 0.35, PIE_G.cerca - 120, 0, 0],
            [T.lleva3 + 0.05, T.lleva3 + 0.35, PIE_G.cerca - 40, 0, 0]],
    lejos: [[-9, -8, PIE_G.lejos, 0, 0],
            [T.pisa1 - 0.32, T.pisa1, PISADA.x, PISADA.alto, 0.16], [T.pisa1 + 0.55, T.pisa1 + 0.85, PIE_G.lejos, 0, 0],
            [T.pisa2 - 0.4, T.pisa2, PISADA.x + 3, PISADA.alto, 0.18], [T.pisa2 + 0.45, T.pisa2 + 0.75, PIE_G.lejos, 0, 0],
            [T.lleva1 + 0.12, T.lleva1 + 0.42, PIE_G.lejos - 62, 0, 0], [T.lleva2 + 0.12, T.lleva2 + 0.42, PIE_G.lejos - 112, 0, 0],
            [T.lleva3 + 0.15, T.lleva3 + 0.45, PIE_G.lejos - 40, 0, 0]]
  };
  const PASOS_L = {
    cerca: [[-9, -8, PIE_L.cerca, 0, 0], [T.lleva1 + 0.08, T.lleva1 + 0.38, PIE_L.cerca - 58, 0, 0], [T.lleva2 + 0.02, T.lleva2 + 0.32, PIE_L.cerca - 34, 0, 0],
            [T.lleva3 + 0.08, T.lleva3 + 0.38, PIE_L.cerca - 38, 0, 0]],
    lejos: [[-9, -8, PIE_L.lejos, 0, 0], [T.lleva1 - 0.04, T.lleva1 + 0.26, PIE_L.lejos - 58, 0, 0], [T.lleva2 + 0.1, T.lleva2 + 0.4, PIE_L.lejos - 40, 0, 0],
            [T.lleva3 - 0.02, T.lleva3 + 0.28, PIE_L.lejos - 38, 0, 0]]
  };
  function pie(lista, t) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x, alto, giro] = lista[i], prev = i > 0 ? lista[i - 1] : lista[i];
    const u = fase(t, t0, t1), arco = Math.sin(Math.PI * u);
    const k = suave5(u);
    return { x: lerp(prev[2], x, k), alto: lerp(prev[3], alto, k) + 40 * arco * (alto > prev[3] ? 1.4 : 1), ang: lerp(prev[4], giro, k) - 0.18 * arco };
  }

  /* ---------- cuerpos ---------- */
  // dx: pelvis (px de pantalla) · pel: pelvis arriba/abajo (hoja) · torso, cab: giros (rad)
  const B0 = { dx: 0, pel: 0, torso: 0, cab: 0 };
  const CG = {
    baila: { dx: 0, pel: 6, torso: 0.1, cab: 0.04 },
    lleva1: { dx: -62, pel: 16, torso: -0.28, cab: -0.25 },
    lleva2: { dx: -118, pel: 22, torso: -0.12, cab: 0.18 },
    lleva3: { dx: -40, pel: 22, torso: -0.22, cab: -0.2 },
    prepara: { dx: 10, pel: 30, torso: -0.3, cab: -0.15 },
    inclina: { dx: 40, pel: 90, torso: -1.25, cab: -0.35 },
  };
  const sacudido = k => M2.rebote(k, 1.3);          // él va un poco detrás y se pasa (como un muñeco)
  const GUION_G = [[T.lleva1 - 0.08, T.lleva1 + 0.4, "lleva1", sacudido], [T.lleva2 + 0.05, T.lleva2 + 0.5, "lleva2", sacudido], [T.lleva3 + 0.05, T.lleva3 + 0.5, "lleva3", sacudido],
  ];
  const CL = {
    baila: { dx: 0, pel: 4, torso: 0.09, cab: 0.06 },
    harta: { dx: 4, pel: 2, torso: -0.03, cab: -0.06 },
    manda: { dx: 2, pel: 8, torso: -0.02, cab: -0.04 },
    lleva1: { dx: -56, pel: 14, torso: 0.0, cab: -0.04 },
    lleva2: { dx: -36, pel: 8, torso: -0.1, cab: -0.06 },
    lleva3: { dx: -38, pel: 16, torso: 0.2, cab: 0.04 },
    prepara: { dx: -24, pel: 30, torso: 0.3, cab: 0.1 },
    inclina: { dx: -36, pel: 70, torso: 0.95, cab: 0.25 },
  };
  const GUION_L = [[T.harta - 0.15, T.harta + 0.25, "harta"], [T.manda - 0.1, T.manda + 0.3, "manda"],
    [T.lleva1, T.lleva1 + 0.42, "lleva1"], [T.lleva2 - 0.05, T.lleva2 + 0.35, "lleva2", salida], [T.lleva3 - 0.05, T.lleva3 + 0.35, "lleva3", salida],
  ];

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, ruborC: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  const CARAS_G = {
    sueno: E({ mx: 0.7, my: -0.1, c: 0.62, h: 0.85, sd: 10, gd: 0.12, si: 8, gi: 0.1, orig: 0, sonr: 0.55, ancho: 0.82, ruborC: 0.55 }),
    pisa: E({ mx: 0.7, my: -0.1, c: 0.66, h: 0.9, sd: 12, gd: 0.14, si: 10, gi: 0.12, orig: 0, sonr: 0.7, ancho: 0.85, ruborC: 0.6 }),
    ojito: E({ mx: 0.8, my: 0.15, c: 0.3, h: 0.25, sd: 4, gd: 0.04, si: 14, gi: 0.12, orig: 0, sonr: 0.45, ancho: 0.82, ruborC: 0.45 }),
    sorpresa: E({ mx: 0.9, my: -0.05, iris: 0.85, sd: 26, gd: 0.18, si: 26, gi: 0.18, orig: 0, abre: 8, ancho: 0.6, sonr: -0.15, ruborC: 0.2 }),
    zarandeo: E({ mx: 0.4, my: -0.4, iris: 0.8, sd: 30, gd: 0.25, si: 22, gi: 0.15, orig: 0, abre: 10, ancho: 0.6, sonr: -0.2, ruborC: 0.2 }),
    inclinado: E({ mx: 0.95, my: -0.55, iris: 1.12, sd: 24, gd: 0.15, si: 24, gi: 0.15, orig: 0, abre: 22, ancho: 0.55, sonr: 0.0, lengua: 0.2, ruborC: 1 }),
    enamorado: E({ mx: 0.9, my: -0.55, iris: 1.22, c: 0, h: 0, sd: 22, gd: 0.16, si: 22, gi: 0.16, orig: 0, abre: 5, ancho: 0.6, sonr: 0.55, ruborC: 1 })
  };
  const GUION_CARA_G = [[T.pisa1 - 0.1, T.pisa1 + 0.15, "pisa"], [T.pisa1 + 0.7, T.pisa1 + 1.0, "sueno"],
    [T.pisa2 - 0.1, T.pisa2 + 0.15, "pisa"], [T.harta, T.harta + 0.3, "ojito"], [T.harta + 0.55, T.harta + 0.8, "sueno"],
    [T.manda - 0.05, T.manda + 0.12, "sorpresa"], [T.lleva1 + 0.1, T.lleva1 + 0.4, "zarandeo"],
    [T.inclina - 0.25, T.inclina, "inclinado"], [T.corazones, T.corazones + 0.6, "enamorado"]];
  const CARAS_L = {
    sueno: E({ mx: 0.6, my: 0.1, c: 0.9, h: 0.8, sd: 6, gd: 0.08, si: 6, gi: 0.08, orig: 0, sonr: 0.55, ancho: 0.9, ruborC: 0.3 }),
    ay: E({ mx: 0.3, my: 0.4, c: 1, z: 1, sd: 26, gd: 0.32, si: 26, gi: 0.32, orig: 0, abre: 24, ancho: 0.7, sonr: -0.7 }),
    forzada: E({ mx: 0.75, my: 0.0, c: 0.35, h: 0.2, sd: 4, gd: -0.06, si: 4, gi: -0.06, orig: 0, sonr: 0.35, ancho: 1.05, abre: 3 }),
    ay2: E({ mx: 0.3, my: 0.5, c: 1, z: 1, sd: 30, gd: 0.36, si: 30, gi: 0.36, orig: 0, abre: 36, ancho: 0.7, sonr: -0.8, lengua: 0.3 }),
    harta: E({ mx: -0.9, my: 0.05, c: 0.42, sd: -6, gd: -0.08, si: -2, gi: -0.05, orig: 0, sonr: -0.15, ancho: 0.9 }),
    decidida: E({ mx: 0.85, my: 0.05, c: 0.2, sd: -10, gd: -0.22, si: 14, gi: 0.12, orig: 0, sonr: 0.55, ancho: 1.0 }),
    lleva: E({ mx: 0.85, my: 0.15, c: 0.12, sd: -6, gd: -0.15, si: 10, gi: 0.1, orig: 0, sonr: 0.7, ancho: 1.05, abre: 5 }),
    domina: E({ mx: 0.8, my: 0.65, c: 0.25, sd: 6, gd: -0.05, si: 16, gi: 0.12, orig: 0, sonr: 0.8, ancho: 1.0, abre: 4 }),
    guino: E({ mx: -0.9, my: 0.1, c: 0.1, sd: 12, gd: 0.06, si: 6, gi: 0.04, orig: 0, sonr: 0.85, ancho: 1.05, abre: 6, ruborC: 0.2 })
  };
  const GUION_CARA_L = [[T.pisa1, T.pisa1 + 0.08, "ay"], [T.pisa1 + 0.6, T.pisa1 + 0.9, "forzada"], [T.pisa1 + 1.25, T.pisa1 + 1.6, "sueno"],
    [T.pisa2, T.pisa2 + 0.08, "ay2"], [T.harta - 0.1, T.harta + 0.25, "harta"], [T.manda - 0.25, T.manda + 0.05, "decidida"],
    [T.lleva1, T.lleva1 + 0.3, "lleva"], [T.prepara + 0.2, T.inclina + 0.2, "domina"], [T.guino, T.guino + 0.3, "guino"]];
  const cara = (e, parp, guinoI) => ({
    mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
    ojos: { d: Math.max(e.c, parp), i: Math.max(e.c, parp, guinoI || 0), feliz: e.h, apretado: e.z },
    cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
    boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
    mofletes: 0, rubor: e.ruborC, bigote: 0 });
  function parpadeo(t, lista) {
    let o = 0;
    for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); }
    return o;
  }

  /* ---------- manos ---------- */
  // Cada mano pasa de un «modo» a otro mezclando posición, giros y dedos; los modos que tocan al
  // otro se calculan a partir de su postura en ese instante (contacto exacto).
  const DED = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m, anular: a, menique: me });
  const mezclaMano = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), ang: lerpAng(a.ang, b.ang, k), mu: lerpAng(a.mu, b.mu, k),
    dedos: Object.fromEntries(Object.keys(a.dedos).map(n => [n, lerp(a.dedos[n], b.dedos[n], k)])) });
  function manoModos(t, lista, modos, ctx) {
    let m = modos[lista[0][2]](ctx, t);
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; m = mezclaMano(m, modos[nom](ctx, t), (f || suave)(fase(t, t0, t1))); }
    return m;
  }
  const deHoja = (C_, p, q) => C_.aPantalla(p, C_.tronco(p)(q));        // punto del torso → pantalla
  // punto entre los dos hombros de en medio (donde se cogen de la mano al estirarse)
  const enMedio = c => { const a = deHoja(G, c.g, G.HOMBRO), b = deHoja(L, c.l, L.HOMBRO); return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + 30 }; };
  const enHoja = (C_, p, q, ang, mu, dedos) => { const h = C_.aHoja(p, q); return { x: h.x, y: h.y, ang, mu, dedos }; };

  // Guillermo
  const MG_CERCA = {   // mano cercana (lado de la cámara)
    corazon: (c) => { const q = G.tronco(c.g)({ x: 218, y: 448 }); return { x: q.x, y: q.y, ang: 0.15, mu: 2.25, dedos: DED(0.7, 1, 1, 1, 1) }; },
    susto: (c) => { const q = G.tronco(c.g)({ x: 40, y: 150 }); return { x: q.x, y: q.y, ang: -0.5, mu: 1.7, dedos: DED(1, 1, 1, 1, 1) }; },
    vuela: (c, t) => { const q = G.tronco(c.g)({ x: -10 + 30 * Math.sin(t * 7), y: 230 + 40 * Math.cos(t * 6) }); return { x: q.x, y: q.y, ang: -0.3, mu: 1.5, dedos: DED(1, 1, 1, 1, 1) }; },
    cuelga: (c, t) => { const h = G.aPantalla(c.g, G.tronco(c.g)(G.HOMBRO_C)); return enHoja(G, c.g, { x: h.x - 74, y: h.y + 46 + 3 * Math.sin(t * 2) }, -0.3, -0.75, DED(0.55, 0.95, 0.85, 0.75, 0.65)); }
  };
  const GUION_MG_CERCA = [[T.manda - 0.05, T.manda + 0.15, "susto"], [T.lleva1, T.lleva1 + 0.3, "vuela"], [T.prepara + 0.1, T.inclina + 0.2, "cuelga"]];
  const MG_LEJOS = {   // mano lejana: en la cintura de Laura; al final, rodeándole el cuello
    cintura: (c) => enHoja(G, c.g, deHoja(L, c.l, { x: 350, y: 520 }), 0.15, -2.2, DED(0.75, 0.85, 0.85, 0.85, 0.85)),
    estira: (c) => { const q = enMedio(c); return enHoja(G, c.g, { x: q.x - 4, y: q.y }, 0, Math.PI, DED(0.5, 0.4, 0.4, 0.4, 0.4)); },
    // desmayo de galán: el dorso de la mano en la frente
    frente: (c, t) => { const H = G.cabeza(c.g), q = G.aPantalla(c.g, H.a({ x: 720, y: 475 }));
      return enHoja(G, c.g, q, H.ang - 0.2, H.ang + 0.6, DED(0.7, 0.95, 0.95, 0.9, 0.85)); }
  };
  const GUION_MG_LEJOS = [[T.lleva2 - 0.1, T.lleva2 + 0.22, "estira"], [T.lleva3 + 0.05, T.lleva3 + 0.4, "cintura"], [T.inclina - 0.1, T.inclina + 0.35, "frente"]];

  // Laura (coordenadas de su hoja; mira a la izquierda: +x de su hoja = hacia Guillermo)
  const ML_LEJOS = {   // mano de en medio: en el hombro de él; al inclinarlo, por detrás de su espalda
    hombro: (c) => enHoja(L, c.l, deHoja(G, c.g, { x: 352, y: 330 }), 0.25, 2.4, DED(0.8, 0.85, 0.85, 0.85, 0.85)),
    agarra: (c) => enHoja(L, c.l, deHoja(G, c.g, { x: 340, y: 360 }), 0.1, 2.5, DED(0.55, 0.5, 0.5, 0.5, 0.5)),
    estira: (c) => { const q = enMedio(c); return enHoja(L, c.l, { x: q.x + 5, y: q.y - 2 }, 0, Math.PI, DED(0.8, 0.75, 0.75, 0.75, 0.75)); },   // le envuelve el puño
    espalda: (c) => enHoja(L, c.l, deHoja(G, c.g, { x: 290, y: 640 }), 0.4, -2.36, DED(0.6, 0.7, 0.7, 0.7, 0.7))
  };
  const GUION_ML_LEJOS = [[T.manda - 0.05, T.manda + 0.25, "agarra"], [T.lleva2 - 0.1, T.lleva2 + 0.22, "estira"], [T.lleva3 + 0.05, T.lleva3 + 0.4, "agarra"], [T.prepara, T.inclina, "espalda"]];
  const ML_CERCA = {   // mano de fuera: en su brazo, luego el dedo («no, no»), luego al aire
    brazo: (c) => { const m = G.aPantalla(c.g, c.g.manoLejos); return enHoja(L, c.l, { x: m.x + 4, y: m.y - 12 }, 0.2, -2.0, DED(0.75, 0.8, 0.8, 0.8, 0.8)); },
    puno: (c) => { const m = G.aPantalla(c.g, c.g.manoLejos); return enHoja(L, c.l, { x: m.x + 6, y: m.y - 14 }, 0.2, -2.0, DED(0.2, 0.1, 0.1, 0.1, 0.1)); },
    dedo: (c, t) => { const h = L.tronco(c.l)(L.HOMBRO_C); const w = Math.sin((t - T.harta) * 14) * 0.35;
      return { x: h.x + 70, y: h.y - 70, ang: w, mu: 1.65 + w, dedos: DED(0.1, 1, 0, 0, 0) }; },
    toma: (c) => { const m = G.aPantalla(c.g, c.g.manoLejos); return enHoja(L, c.l, { x: m.x - 4, y: m.y - 18 }, 0.1, -2.2, DED(0.5, 0.45, 0.45, 0.45, 0.45)); },
    cadera: (c) => { const q = L.tronco(c.l)({ x: 150, y: 585 }); return { x: q.x, y: q.y, ang: 0.3, mu: -0.9, dedos: DED(0.3, 0.2, 0.2, 0.2, 0.2) }; },
    floreo: (c, t) => { const h = L.tronco(c.l)(L.HOMBRO_C); return { x: h.x - 175, y: h.y - 205 + 6 * Math.sin(t * 2.2), ang: -0.5, mu: 1.35, dedos: DED(1, 1, 1, 1, 1) }; }
  };
  const GUION_ML_CERCA = [[T.pisa1, T.pisa1 + 0.08, "puno"], [T.pisa1 + 0.6, T.pisa1 + 0.9, "brazo"], [T.pisa2, T.pisa2 + 0.08, "puno"],
    [T.harta + 0.25, T.harta + 0.5, "dedo"], [T.manda - 0.15, T.manda + 0.1, "toma"], [T.lleva2 - 0.15, T.lleva2 + 0.2, "cadera"],
    [T.lleva3 + 0.1, T.lleva3 + 0.4, "toma"], [T.prepara + 0.1, T.inclina + 0.25, "floreo"]];

  /* ---------- posturas ---------- */
  /* Paso de tango: posturas finales en pantalla (pelvis, giros y pies). Se llega mezclando desde
   * donde estén y cada pie da su paso con un arco (sin deslizar). */
  const DIP = {
    g: { t0: T.prepara + 0.1, t1: T.inclina + 0.2, x: 404, pel: 85, torso: -1.05, cab: -0.35,
         pies: { cerca: { t0: T.prepara + 0.15, t1: T.prepara + 0.45, x: 428, ang: 0 }, lejos: { t0: T.prepara + 0.05, t1: T.prepara + 0.35, x: 460, ang: 0 } } },
    l: { t0: T.prepara, t1: T.inclina + 0.1, x: 598, pel: 75, torso: 0.95, cab: 0.3,
         pies: { cerca: { t0: T.prepara - 0.05, t1: T.prepara + 0.25, x: 702, ang: 0 }, lejos: { t0: T.prepara + 0.1, t1: T.prepara + 0.4, x: 566, ang: 0 } } }
  };
  function cuerpoBase(C_, lado, b, X, pasos, t) {
    const respira = Math.sin(t * 2.1 + (lado === "g" ? 0 : 1.3));
    const D = DIP[lado], k = tramo(t, D.t0, D.t1, suave5);
    const p = {
      x: lerp(X + b.dx, D.x, k), suelo: SUELO, s: S, espejo: lado === "l",
      pelvis: { x: C_.PELVIS.x, y: C_.PELVIS.y + lerp(b.pel, D.pel, k) + respira * 1.2 }, torso: lerp(b.torso, D.torso, k), torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      cabeza: { ang: lerp(b.cab, D.cab, k), dx: 0, dy: 0, esc: { x: 1, y: 1 } }, piernas: {}, tirasLimpias: true, ikContinuo: lado === "g"
    };
    const tobY = { cerca: C_.SUELO - C_.TOBILLO_ALTO, lejos: C_.SUELO - C_.TOBILLO_ALTO - 10 };
    for (const ld of ["cerca", "lejos"]) {
      const f = pie(pasos[ld], t), d = D.pies[ld], kp = tramo(t, d.t0, d.t1, suave5), arco = Math.sin(Math.PI * kp);
      const x = lerp(f.x, d.x, kp), alto = f.alto * (1 - kp) + 34 * arco, ang = lerp(f.ang, d.ang, kp) - 0.18 * arco;
      const q = C_.aHoja(p, { x, y: SUELO });
      p.piernas[ld] = { tob: { x: q.x, y: tobY[ld] - alto }, ang };
    }
    return p;
  }
  function poseBase(t) {
    const sv = vaiven(t) * bailaSuave(t), lv = (t - T.lleva1) * 0;
    // Guillermo
    const bg = guion(t, "baila", GUION_G, Object.assign({ baila: CG.baila }, CG));
    bg.dx += 9 * sv; bg.torso += 0.04 * sv; bg.cab += 0.05 * sv;
    const zar = tramo(t, T.lleva1, T.lleva1 + 0.3) * (1 - tramo(t, T.prepara, T.prepara + 0.4));   // cabeza bamboleándose
    bg.cab += 0.13 * Math.sin((t - T.lleva1) * 8.5) * zar; bg.torso += 0.04 * Math.sin((t - T.lleva1) * 8.5 - 0.8) * zar;
    const pg = cuerpoBase(G, "g", bg, XG, PASOS_G, t);
    // Laura
    const bl = guion(t, "baila", GUION_L, CL);
    bl.dx += 9 * sv; bl.torso += -0.04 * sv; bl.cab += -0.04 * sv;
    const pl = cuerpoBase(L, "l", bl, XL, PASOS_L, t);
    // el pie que le pisan: se encoge y lo sacude
    for (const [tp, k0] of [[T.pisa1, 0.7], [T.pisa2, 1]]) {
      const lev = campana(t, tp + 0.35, tp + 1.05) * k0;
      if (lev > 0) { const q = pl.piernas.lejos; q.tob.y -= 60 * lev; q.ang += -0.25 * lev + 0.12 * Math.sin((t - tp) * 30) * lev; }
    }
    // rebote de los pisotones en el cuerpo de ella (da un respingo)
    for (const [tp, k0] of [[T.pisa1, 1], [T.pisa2, 1.6]]) {
      const r = t >= tp ? Math.exp(-(t - tp) * 7) * suave(fase(t, tp, tp + 0.05)) * k0 : 0;
      pl.pelvis.y -= 22 * r; pl.cabeza.ang -= 0.08 * r;
    }
    return { g: pg, l: pl };
  }
  function pose(t) {
    const { g: pg, l: pl } = poseBase(t);
    const ctx = { g: pg, l: pl };
    // caras
    const eg = guion(t, "sueno", GUION_CARA_G, CARAS_G);
    pg.cara = cara(eg, parpadeo(t, [1.9, 7.15, 12.2]));
    pg.rojo = 0.75 * tramo(t, T.inclina - 0.1, T.corazones + 0.3);
    pg.sudor = 0.6 * tramo(t, T.lleva1 + 0.2, T.lleva1 + 0.6) * (1 - tramo(t, T.inclina, T.corazones));
    const el = guion(t, "sueno", GUION_CARA_L, CARAS_L);
    const guino = campana(t, T.guino + 0.15, T.guino + 0.95);
    pl.cara = cara(el, parpadeo(t, [2.35, 6.0, 8.6, 12.7]), Math.min(1, guino * 1.6));
    pl.rojo = 0.3 * campana(t, T.harta - 0.2, T.manda + 0.3) + 0.3 * campana(t, T.pisa1, T.pisa1 + 0.7) + 0.4 * campana(t, T.pisa2, T.pisa2 + 0.8);
    // pelo: inercia del vaivén (derivada numérica del desplazamiento) y cae hacia él al inclinarse
    const vx = (t2 => { const a = vaiven(t2) * bailaSuave(t2); return a; });
    const iner = (vx(t + 0.05) - vx(t - 0.05)) * 1.2;
    pl.pelo = { viento: 0, inercia: clamp(iner + 0.9 * tramo(t, T.prepara, T.inclina + 0.3) - 0.5 * campana(t, T.lleva1 - 0.1, T.lleva1 + 0.6) + 0.5 * campana(t, T.lleva2 - 0.1, T.lleva2 + 0.6), -1, 1) };
    // manos
    pl.manoLejos = Object.assign(manoModos(t, [[0, 0, "hombro"]].concat(GUION_ML_LEJOS), ML_LEJOS, ctx), { dobla: 1, puno: 1 });
    pg.manoCerca = Object.assign(manoModos(t, [[0, 0, "corazon"]].concat(GUION_MG_CERCA), MG_CERCA, ctx), { dobla: -1, puno: 1 });
    pg.manoLejos = Object.assign(manoModos(t, [[0, 0, "cintura"]].concat(GUION_MG_LEJOS), MG_LEJOS, ctx), { dobla: -1, puno: 1 });
    pl.manoCerca = Object.assign(manoModos(t, [[0, 0, "brazo"]].concat(GUION_ML_CERCA), ML_CERCA, ctx), { dobla: -1, puno: 1 });
    // rosa entre los dientes
    const flechado = tramo(t, T.corazones, T.corazones + 0.4);        // pupilas de corazón al final
    pg.capaCabeza = (g2) => {
      if (t < T.rosa) rosa(g2, ROSA_BOCA.x, ROSA_BOCA.y, ROSA_BOCA.a, ROSA_ESC, t);
      if (flechado > 0.01) for (const [cx, cy, rx, ry, r] of [[771, 563, 25, 9, 17.5], [894, 617, 19, 7, 15]]) {
        const late = 1 + 0.12 * Math.max(0, Math.sin(t * 9));
        corazon(g2, cx + rx * eg.mx, cy + ry * eg.my + 2, r * 0.13 * flechado * late, 0, "#ff2d55", 0);
      }
    };
    return { g: pg, l: pl };
  }

  /* ---------- rosa ---------- */
  const ROSA_BOCA = { x: 856, y: 744, a: 0.62 }, ROSA_ESC = 1.35;      // retrato de Guillermo: comisura hacia Laura
  function rosa(g, x, y, a, esc, t) {
    g.save(); g.translate(x, y); g.rotate(a); g.scale(esc, esc); g.lineJoin = "round"; g.lineCap = "round";
    // tallo con espinas y hoja (sale de la boca hacia delante); la flor en la punta
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 9; g.beginPath(); g.moveTo(-40, 0); g.quadraticCurveTo(60, -8, 150, -2); g.stroke();
    g.strokeStyle = "#2f8a3a"; g.lineWidth = 5; g.stroke();
    g.fillStyle = "#2f8a3a"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.4;
    g.beginPath(); g.moveTo(62, -6); g.quadraticCurveTo(80, -42, 112, -34); g.quadraticCurveTo(92, -12, 62, -6); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "#1d5a25"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(66, -8); g.quadraticCurveTo(86, -24, 106, -32); g.stroke();
    for (const ex of [20, 100]) { g.fillStyle = "#2f8a3a"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.8; g.beginPath(); g.moveTo(ex - 5, 1); g.lineTo(ex, 10); g.lineTo(ex + 5, 1); g.closePath(); g.fill(); g.stroke(); }
    // cáliz y flor
    g.translate(160, -4);
    g.fillStyle = "#2f8a3a"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.4;
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(-12, 0); g.quadraticCurveTo(0, 20 * s, 18, 16 * s); g.quadraticCurveTo(6, 6 * s, -12, 0); g.closePath(); g.fill(); g.stroke(); }
    const petalo = (cx, cy, rx, ry, rot, col) => { g.save(); g.translate(cx, cy); g.rotate(rot); g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, TAU); g.fillStyle = col; g.fill(); g.lineWidth = 3; g.strokeStyle = "#0b0a0e"; g.stroke(); g.restore(); };
    petalo(30, 0, 34, 40, 0, "#c3122b");
    petalo(22, -14, 24, 22, -0.4, "#e0243d");
    petalo(24, 16, 24, 20, 0.5, "#e0243d");
    petalo(40, -2, 20, 24, 0.1, "#f2405a");
    g.strokeStyle = "#7a0716"; g.lineWidth = 3; g.beginPath(); g.arc(38, -2, 10, -0.5, 3.6); g.stroke();
    g.beginPath(); g.arc(36, 0, 4, 0, 4); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.ellipse(24, -22, 8, 4, -0.5, 0, TAU); g.fill();
    g.restore();
  }
  // Al soltarla, la rosa conserva dónde estaba (pegada a la boca) y cae girando hasta el suelo.
  let ROSA_SUELTA = null;
  function prepararRosa() {
    const p = pose(T.rosa).g, H = G.cabeza(p);
    const o = G.aPantalla(p, H.a(ROSA_BOCA));
    ROSA_SUELTA = { x: o.x, y: o.y, a: H.ang + ROSA_BOCA.a, k: H.kx * S * ROSA_ESC };   // escala retrato → pantalla
  }
  function rosaCayendo(g, t) {
    if (t < T.rosa) return;
    if (!ROSA_SUELTA) prepararRosa();
    const u = t - T.rosa, gr = 1400, suelo = SUELO - 6;
    const R0 = ROSA_SUELTA;
    let x = R0.x + 30 * u, y = R0.y - 120 * u + 0.5 * gr * u * u, a = R0.a + 4.2 * u;
    const tc = (120 + Math.sqrt(120 * 120 + 2 * gr * (suelo - R0.y))) / gr;
    if (u > tc) {                                         // toca el suelo: un botecito y se queda tumbada
      const v = u - tc, x0 = R0.x + 30 * tc, a0 = R0.a + 4.2 * tc;
      const bote = Math.max(0, Math.sin(Math.min(1, v / 0.28) * Math.PI)) * 18 * (v < 0.28 ? 1 : 0);
      x = x0 + 14 * salida(Math.min(1, v / 0.6)); y = suelo - bote;
      a = lerpAng(a0, Math.PI * 2 + 0.08, salida(Math.min(1, v / 0.5)));
    }
    rosa(g, x, y, a, R0.k, t);
  }

  /* ---------- corazones y destellos ---------- */
  function corazon(g, x, y, s, rot, col, roto) {
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.lineJoin = "round";
    const forma = () => { g.beginPath(); g.moveTo(0, 8); g.bezierCurveTo(-14, -2, -12, -16, 0, -9); g.bezierCurveTo(12, -16, 14, -2, 0, 8); g.closePath(); };
    if (roto > 0) {
      for (const sg of [-1, 1]) {
        g.save(); g.translate(sg * roto * 8, roto * 6); g.rotate(sg * roto * 0.6);
        g.beginPath(); g.rect(sg < 0 ? -20 : 0, -20, 20, 40); g.clip();
        forma(); g.fillStyle = col; g.fill(); g.lineWidth = 1.6; g.strokeStyle = "#0b0a0e"; g.stroke();
        g.beginPath(); g.moveTo(0, -9); g.lineTo(-2, -4); g.lineTo(2, 0); g.lineTo(-1, 4); g.lineTo(0, 8); g.lineWidth = 1.6; g.stroke();
        g.restore();
      }
    } else {
      forma(); g.fillStyle = col; g.fill(); g.lineWidth = 1.6; g.strokeStyle = "#0b0a0e"; g.stroke();
      g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(-5, -7, 2.6, 1.6, -0.6, 0, TAU); g.fill();
    }
    g.restore();
  }
  // corazones que suben de entre los dos mientras bailan agarrados (y paran al pisarla)
  function corazonesSuben(g, t, centro) {
    const flujo = (1 - tramo(t, T.pisa2 - 0.2, T.pisa2 + 0.2)) * tramo(t, 0.3, 1.0);
    for (let i = 0; i < 7; i++) {
      const ciclo = 2.6, ph = ((t + i * ciclo / 7) / ciclo) % 1, n = Math.floor((t + i * ciclo / 7) / ciclo);
      const nacio = t - ph * ciclo; if (nacio < 0.2) continue;
      const vivo = (1 - tramo(nacio, T.pisa2 - 0.6, T.pisa2 - 0.2)) * tramo(nacio, 0.2, 0.8);
      if (vivo <= 0.01) continue;
      const x = centro.x + (hash(i * 7 + n) - 0.5) * 60 + Math.sin(t * 2 + i) * 8, y = centro.y - ph * 170;
      g.save(); g.globalAlpha = Math.sin(Math.PI * ph) * vivo * Math.max(0.0001, flujo + (1 - flujo) * (ph > 0.05 ? 1 : 0));
      corazon(g, x, y, 0.75 + 0.35 * hash(i + 3 + n), Math.sin(t * 2.5 + i) * 0.25, i % 2 ? "#ff5d7a" : "#ff8fb0", 0);
      g.restore();
    }
  }
  // el corazón grande que se parte en el segundo pisotón
  function corazonRoto(g, t, centro) {
    const k = fase(t, T.pisa2 - 0.5, T.pisa2 + 1.4); if (k <= 0 || k >= 1) return;
    const crece = salida(fase(t, T.pisa2 - 0.5, T.pisa2 - 0.15)), roto = salida(fase(t, T.pisa2, T.pisa2 + 0.35));
    const cae = entrada(fase(t, T.pisa2 + 0.35, T.pisa2 + 1.4));
    g.save(); g.globalAlpha = 1 - cae;
    corazon(g, centro.x, centro.y - 50 + 160 * cae, 1.8 * crece + 0.001, 0, "#ff4d6d", roto);
    g.restore();
  }
  function explosionCorazones(g, t, centro) {
    const k = fase(t, T.corazones, T.corazones + 2.6); if (k <= 0) return;
    for (let i = 0; i < 12; i++) {
      const a = -Math.PI / 2 + (i / 12 - 0.5) * 2.6 + (hash(i + 40) - 0.5) * 0.3, v = 120 + 120 * hash(i + 41);
      const kk = salida(Math.min(1, k * 1.6)), d = v * kk;
      const x = centro.x + Math.cos(a) * d, y = centro.y + Math.sin(a) * d * 0.8 - 30 * k + 10 * Math.sin(t * 3 + i);
      const al = 1 - tramo(t, T.fin - 0.6, T.fin + 0.2);
      g.save(); g.globalAlpha = al * Math.min(1, k * 8);
      corazon(g, x, y, (0.8 + 0.6 * hash(i + 42)) * (0.6 + 0.4 * salida(Math.min(1, k * 3))), Math.sin(t * 3 + i) * 0.3, i % 3 ? "#ff5d7a" : "#ffb3c8", 0);
      g.restore();
    }
  }
  function estrellitasPie(g, t, en) {
    for (const [tp, tam] of [[T.pisa1, 1], [T.pisa2, 1.35]]) {
      const k = fase(t, tp, tp + 0.55); if (k <= 0 || k >= 1) continue;
      g.save(); g.globalAlpha = 1 - k * k;
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i - 2) * 0.55, d = (18 + 34 * salida(k)) * tam;
        const x = en.x + Math.cos(a) * d, y = en.y - 10 + Math.sin(a) * d;
        estrella(g, x, y, 9 * tam * (1 - 0.35 * k), t * 6 + i);
      }
      g.restore();
    }
  }
  function estrella(g, x, y, r, rot) {
    g.beginPath(); for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
    g.fillStyle = "#fff06a"; g.fill(); g.lineWidth = 2; g.strokeStyle = "#0b0a0e"; g.stroke();
  }
  function destellos(g, t, luz) {           // motas brillantes en el haz del foco
    g.save(); g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 16; i++) {
      const ph = (t * (0.05 + 0.04 * hash(i)) + hash(i + 7)) % 1;
      const x = 380 + hash(i + 3) * 270 + Math.sin(t * 0.7 + i) * 14, y = 90 + ph * 440;
      const b = 0.5 + 0.5 * Math.sin(t * 2.4 + i * 1.7);
      g.globalAlpha = luz * b * Math.sin(Math.PI * ph) * 0.65;
      g.fillStyle = "#ffe9c4"; g.beginPath(); g.arc(x, y, 1.4 + hash(i + 9) * 1.6, 0, TAU); g.fill();
    }
    g.restore();
  }

  /* ---------- decorado: salón de baile de noche (en caché) ---------- */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 140; const g = c.getContext("2d");
    g.translate(60, 70);
    // pared azul noche con damasco tenue
    const pared = g.createLinearGradient(0, -70, 0, 450); pared.addColorStop(0, "#120c2a"); pared.addColorStop(1, "#2a1d4a");
    g.fillStyle = pared; g.fillRect(-60, -70, W + 120, 520);
    g.fillStyle = "rgba(255,220,255,0.045)";
    for (let y = -40; y < 440; y += 46) for (let x = -50 + ((y / 46) % 2 ? 23 : 0); x < W + 60; x += 46) {
      g.beginPath(); g.moveTo(x, y - 10); g.quadraticCurveTo(x + 9, y, x, y + 10); g.quadraticCurveTo(x - 9, y, x, y - 10); g.fill(); }
    // ventanal en arco con la luna y estrellas, detrás de la pareja
    const vx = 512, vy = 60, vw = 300, vh = 360;
    const arco = () => { g.beginPath(); g.moveTo(vx - vw / 2, vy + vh); g.lineTo(vx - vw / 2, vy + vw / 2); g.arc(vx, vy + vw / 2, vw / 2, Math.PI, 0); g.lineTo(vx + vw / 2, vy + vh); g.closePath(); };
    arco(); const cielo = g.createLinearGradient(0, vy, 0, vy + vh); cielo.addColorStop(0, "#0b1b46"); cielo.addColorStop(1, "#24407a"); g.fillStyle = cielo; g.fill();
    g.save(); arco(); g.clip();
    const halo = g.createRadialGradient(vx + 70, vy + 105, 10, vx + 70, vy + 105, 120); halo.addColorStop(0, "rgba(255,246,210,0.6)"); halo.addColorStop(1, "rgba(255,246,210,0)");
    g.fillStyle = halo; g.fillRect(vx - vw / 2, vy, vw, vh);
    g.fillStyle = "#fff6d8"; g.beginPath(); g.arc(vx + 70, vy + 105, 38, 0, TAU); g.fill();
    g.fillStyle = "rgba(200,190,150,0.55)"; for (const [dx, dy, r] of [[-12, -8, 8], [10, 10, 6], [-6, 16, 4.5], [16, -14, 4]]) { g.beginPath(); g.arc(vx + 70 + dx, vy + 105 + dy, r, 0, TAU); g.fill(); }
    g.fillStyle = "#ffffff"; for (let i = 0; i < 26; i++) { const sx = vx - vw / 2 + hash(i + 100) * vw, sy = vy + hash(i + 200) * vh * 0.7, r = 0.6 + hash(i + 300) * 1.4; g.globalAlpha = 0.5 + 0.5 * hash(i + 400); g.beginPath(); g.arc(sx, sy, r, 0, TAU); g.fill(); }
    g.globalAlpha = 1;
    // tejados lejanos
    g.fillStyle = "#0a1230"; g.beginPath(); g.moveTo(vx - vw / 2, vy + vh); for (let i = 0; i <= 10; i++) { const x = vx - vw / 2 + i * vw / 10; g.lineTo(x, vy + vh - 40 - hash(i + 500) * 50); g.lineTo(x + vw / 20, vy + vh - 40 - hash(i + 500) * 50); } g.lineTo(vx + vw / 2, vy + vh); g.closePath(); g.fill();
    g.fillStyle = "#ffd77a"; for (let i = 0; i < 9; i++) { g.globalAlpha = 0.7; g.fillRect(vx - vw / 2 + 12 + hash(i + 600) * (vw - 30), vy + vh - 30 - hash(i + 700) * 50, 4, 5); } g.globalAlpha = 1;
    g.restore();
    // marco del ventanal (madera oscura con parteluces dorados)
    g.save(); arco(); g.lineWidth = 16; g.strokeStyle = "#1a0f0a"; g.stroke(); g.lineWidth = 6; g.strokeStyle = "#b8893a"; g.stroke(); g.restore();
    g.save(); arco(); g.clip(); g.strokeStyle = "#1a0f0a"; g.lineWidth = 7;
    g.beginPath(); g.moveTo(vx, vy); g.lineTo(vx, vy + vh); g.moveTo(vx - vw / 2, vy + 210); g.lineTo(vx + vw / 2, vy + 210); g.stroke();
    g.strokeStyle = "#b8893a"; g.lineWidth = 2.5; g.stroke(); g.restore();
    // cortinas de terciopelo granate con alzapaños dorados
    for (const lado of [-1, 1]) {
      const x0 = lado < 0 ? -60 : W + 60, x1 = lado < 0 ? 210 : W - 210;
      g.save();
      g.beginPath(); g.moveTo(x0, -70); g.lineTo(x1, -70);
      g.bezierCurveTo(x1 + lado * 10, 120, lado < 0 ? 90 : W - 90, 230, lado < 0 ? 70 : W - 70, 300);
      g.bezierCurveTo(lado < 0 ? 120 : W - 120, 380, lado < 0 ? 150 : W - 150, 440, lado < 0 ? 170 : W - 170, 470);
      g.lineTo(x0, 470); g.closePath();
      const tela = g.createLinearGradient(x0, 0, x1, 0); tela.addColorStop(0, "#3a0414"); tela.addColorStop(0.55, "#8a1230"); tela.addColorStop(1, "#5a0820");
      g.fillStyle = tela; g.fill(); g.lineWidth = 4; g.strokeStyle = "#0b0a0e"; g.stroke();
      g.clip();
      for (let i = 0; i < 9; i++) {           // pliegues
        const fx = x0 + (x1 - x0) * (i + 0.5) / 9;
        g.strokeStyle = i % 2 ? "rgba(0,0,0,0.28)" : "rgba(255,120,150,0.14)"; g.lineWidth = 10;
        g.beginPath(); g.moveTo(fx, -70); g.quadraticCurveTo(fx + lado * 20, 240, lerp(fx, lado < 0 ? 120 : W - 120, 0.7), 470); g.stroke();
      }
      g.restore();
      // alzapaño
      const ax = lado < 0 ? 78 : W - 78, ay = 302;
      g.fillStyle = "#e0b04a"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5;
      g.beginPath(); g.ellipse(ax, ay, 26, 9, lado * 0.3, 0, TAU); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(ax + lado * 6, ay + 6); g.lineTo(ax + lado * 14, ay + 50); g.lineTo(ax + lado * 2, ay + 50); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = "#8a6420"; g.lineWidth = 1.2; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(ax + lado * (4 + i * 2), ay + 26); g.lineTo(ax + lado * (3 + i * 2.4), ay + 49); g.stroke(); }
    }
    // cenefa superior con festones y fleco dorado
    g.fillStyle = "#6e0e28"; g.beginPath(); g.moveTo(-60, -70); g.lineTo(W + 60, -70); g.lineTo(W + 60, -10);
    for (let x = W + 60; x >= -60; x -= 80) g.quadraticCurveTo(x - 40, 28, x - 80, -10);
    g.closePath(); g.fill(); g.lineWidth = 4; g.strokeStyle = "#0b0a0e"; g.stroke();
    g.strokeStyle = "#e0b04a"; g.lineWidth = 3; g.beginPath(); g.moveTo(-60, -10);
    for (let x = -60; x <= W + 60; x += 80) g.quadraticCurveTo(x + 40, 22, x + 80, -10); g.stroke();
    // zócalo y suelo de parqué encerado
    g.fillStyle = "#1c1030"; g.fillRect(-60, 440, W + 120, SUELO - 440);
    g.fillStyle = "#3b2552"; g.fillRect(-60, 436, W + 120, 6); g.fillStyle = "rgba(0,0,0,0.4)"; g.fillRect(-60, 442, W + 120, 5);
    const su = g.createLinearGradient(0, SUELO - 40, 0, H + 70); su.addColorStop(0, "#3a2016"); su.addColorStop(1, "#160a05");
    g.fillStyle = su; g.fillRect(-60, SUELO - 60, W + 120, H + 130 - SUELO);
    g.save(); g.beginPath(); g.rect(-60, SUELO - 60, W + 120, H + 130 - SUELO); g.clip();
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 1.5;
    for (let i = -24; i <= 24; i++) { g.beginPath(); g.moveTo(512 + i * 40, SUELO - 60); g.lineTo(512 + i * 120, H + 70); g.stroke(); }
    for (let k = 0; k < 7; k++) { const y = SUELO - 60 + Math.pow(k / 6, 1.6) * (H + 130 - SUELO); g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    const brillo = g.createLinearGradient(0, SUELO - 60, 0, H + 70); brillo.addColorStop(0, "rgba(255,200,220,0.12)"); brillo.addColorStop(0.4, "rgba(255,200,220,0)");
    g.fillStyle = brillo; g.fillRect(-60, SUELO - 60, W + 120, H + 130 - SUELO);
    g.restore();
    g.fillStyle = "rgba(255,190,210,0.12)"; g.fillRect(-60, SUELO - 60, W + 120, 2);
    const v = g.createRadialGradient(512, 300, 260, 512, 300, 720); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.6)");
    g.fillStyle = v; g.fillRect(-60, -70, W + 120, H + 140);
    return c;
  }
  // foco: rosa dorado mientras bailan agarrados; rojo de tango cuando manda ella
  function foco(g, t, luz, cx) {
    const tango = tramo(t, T.manda - 0.2, T.manda + 0.6);
    const col = (a) => `rgba(${Math.round(lerp(255, 255, tango))},${Math.round(lerp(214, 70, tango))},${Math.round(lerp(190, 80, tango))},${a})`;
    g.save(); g.globalCompositeOperation = "lighter";
    const top = { x: cx, y: -60 }, w0 = 50, w1 = 250 + 10 * Math.sin(t * 0.9);
    const gr = g.createLinearGradient(0, top.y, 0, SUELO);
    gr.addColorStop(0, col(0.22 * luz)); gr.addColorStop(1, col(0.07 * luz));
    g.fillStyle = gr; g.beginPath(); g.moveTo(top.x - w0, top.y); g.lineTo(top.x + w0, top.y); g.lineTo(cx + w1, SUELO); g.lineTo(cx - w1, SUELO); g.closePath(); g.fill();
    const pool = g.createRadialGradient(cx, SUELO + 6, 10, cx, SUELO + 6, 260);
    pool.addColorStop(0, col(0.32 * luz)); pool.addColorStop(1, col(0));
    g.fillStyle = pool; g.save(); g.translate(cx, SUELO + 6); g.scale(1, 0.18); g.translate(-cx, -(SUELO + 6)); g.beginPath(); g.arc(cx, SUELO + 6, 260, 0, TAU); g.fill(); g.restore();
    g.restore();
    // oscurece un poco el resto del salón (vira a rojo con el tango)
    g.save(); g.globalAlpha = 0.25 * tango; g.fillStyle = "#3a0010"; g.globalCompositeOperation = "multiply"; g.fillRect(-60, -70, W + 120, H + 140); g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const acerca = tramo(t, 0.2, T.pisa2, suave) * 0.05, tango = tramo(t, T.prepara - 0.2, T.inclina + 0.6, suave);
    const k = 1.0 + acerca + 0.1 * tango;
    return { k, x: 512 - 42 * tango, y: 300 + 4 * acerca * 20 + 40 * tango };
  }

  class GuillermoLauraBaile extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !L.listo()) return;
      if (!fondo) fondo = creaFondo();
      const P = pose(t), pg = P.g, pl = P.l;
      const luz = tramo(t, NEGRO_INICIO, 0.9, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = (t >= T.pisa2 ? 2.5 * Math.exp(-(t - T.pisa2) * 8) : 0);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 40) * tb, ruido(t * 40 + 9) * tb * 0.6);
      g.drawImage(fondo, -60, -70);
      const cx = (pg.x + pl.x) / 2;
      foco(g, t, 1, cx);
      // sombras en el suelo
      g.save(); g.fillStyle = "rgba(0,0,0,0.4)";
      g.beginPath(); g.ellipse(cx, SUELO + 2, 150, 10, 0, 0, TAU); g.fill(); g.restore();
      // Laura detrás, Guillermo delante (sus manos van sobre la cintura de ella y su pie sobre el de ella)
      L.dibujar(g, pl, t);
      G.dibujar(g, pg, t);
      rosaCayendo(g, t);
      // centro entre las dos cabezas
      const cg = G.aPantalla(pg, G.centroCabeza(pg)), cl = L.aPantalla(pl, L.centroCabeza(pl));
      const centro = { x: (cg.x + cl.x) / 2, y: Math.min(cg.y, cl.y) - 20 };
      corazonesSuben(g, t, centro);
      corazonRoto(g, t, centro);
      explosionCorazones(g, t, { x: centro.x, y: centro.y + 40 });
      estrellitasPie(g, t, { x: PISADA.x + 6, y: SUELO - 14 });
      destellos(g, t, 1);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00014", nombre: "Guillermo y Laura · El baile lento", crear: () => new GuillermoLauraBaile() });
  window.__A2D_00014 = { pose, poseBase, T, DUR };
})();
