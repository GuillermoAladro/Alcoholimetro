"use strict";
/* 00023 · Guillermo y Marcos · La barra de bomberos
 *
 * Negro → parque de bomberos: ladrillo rojo, taquillas, campana de latón y la barra que sube hasta
 * el agujero del techo. Guillermo, con las manos en los bolsillos, mira arriba → Marcos baja
 * deslizándose por la barra desde fuera de plano, con una sola mano y una pierna enroscada, frena y
 * aterriza con una flexión perfecta; da dos pasos atrás y posa con los puños en la cintura y un
 * guiño → Guillermo, boquiabierto, se decide: se sacude las manos, va a la barra y trepa a tirones,
 * mano sobre mano; la cámara sube con él hasta que se mete por el agujero → vuelve abajo: cae polvo,
 * la barra tiembla y Marcos levanta una ceja a cámara → Guillermo baja girando alrededor de la barra
 * como una broca, demasiado rápido y con las piernas al aire → se estampa de culo: polvo, temblor,
 * estrellitas y ojos en espiral → del agujero cae un casco que se le encaja hasta los ojos; tantea a
 * ciegas → Marcos se acerca, le levanta el casco con un dedo y le guiña a cámara; Guillermo saluda
 * avergonzado → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto. La barra se dibuja por detrás de los personajes (las
 * manos la agarran por delante); por delante solo en la pierna que se enrosca por detrás y cuando
 * Guillermo, al girar, pasa por detrás. El giro se hace estrechando su dibujo (cos del ángulo).
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, MB = MarcosBombero, R = Recortes;
  const S = 0.3, SUELO = 560, DUR = 14.45;
  const X = 470, TECHO = -250;                       // barra y borde inferior del techo (mundo: queda por encima del plano;
  const ARRIBA = 420;                                 //   la cámara sube con Guillermo al trepar). ARRIBA: alto extra del decorado
  const OFF_G = 270, OFF_M = 262;                     // barra delante del pecho (hoja): pelvis a OFF·S de la barra
  const XG0 = 222, XGb = X - OFF_G * S, XM0 = X + OFF_M * S, XM1 = X + 196, XM2 = X + 128;
  const T = {
    mira: 0.45, mDesde: 0.95, mAterriza: 2.3, mSuelta: 2.62, mPose: 3.3, guino: 3.75, mRelaja: 4.55,
    gManos: 3.55, gAnda: 4.2, gAgarra: 4.86, gSube: 5.2, subeFin: 7.55, panSube0: 5.35, panSube1: 7.45, panBaja0: 7.72, panBaja1: 8.05,
    polvo: 7.8, ceja: 8.12, tiembla: 8.35, gira0: 8.6, gira1: 9.5, culo: 9.62,
    casco0: 10.15, casco1: 10.62, ciego0: 10.9, ciego1: 11.8,
    mVa0: 11.15, mVa1: 11.75, mEstira: 12.15, levanta0: 12.22, levanta1: 12.55, quita1: 12.9,
    final: 13.05, fin: 13.7
  };
  const SUBE_FIN = T.subeFin;
  const SUBIDA = 762;                                  // px que trepa (más el brinco inicial): hasta meterse en el agujero

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* ---------- caras (mismos campos en los dos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.25, lengua: 0, esp: 0, mof: 0, gui: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    const cerr = Math.max(e.c, parp);
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: Math.max(cerr, e.gui), i: cerr, feliz: Math.max(e.h, e.gui), apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }

  const CARAS_G = {
    inicio: E({ sonr: 0.3 }),
    curioso: E({ mx: 0.45, my: -0.9, sd: 12, gd: 0.1, si: 12, gi: 0.1, abre: 8, ancho: 0.6, sonr: 0 }),
    sigue: E({ mx: 0.75, my: -0.4, iris: 1.08, sd: 22, gd: 0.16, si: 22, gi: 0.16, abre: 30, ancho: 0.7, sonr: 0, lengua: 0.3 }),
    wow: E({ mx: 0.85, my: -0.1, iris: 1.15, sd: 26, gd: 0.18, si: 26, gi: 0.18, abre: 40, ancho: 0.75, sonr: 0.2, lengua: 0.4 }),
    decidido: E({ mx: -0.85, my: -0.15, sd: 16, gd: 0.15, si: -6, gi: -0.1, sonr: 0.75, abre: 4, ancho: 0.95 }),
    serio: E({ mx: 0.85, my: -0.5, c: 0.2, sd: -8, gd: -0.18, si: -8, gi: -0.18, sonr: 0.2, ancho: 0.85 }),
    esfuerzo: E({ mx: 0.6, my: -0.9, c: 0.35, z: 0.2, sd: -12, gd: -0.22, si: -12, gi: -0.22, abre: 14, ancho: 1.15, sonr: -0.5, lengua: 0 }),
    terror: E({ mx: 0, my: 0.5, iris: 0.7, sd: 28, gd: 0.18, si: 28, gi: 0.18, abre: 52, ancho: 0.85, sonr: -0.3, lengua: 0.5 }),
    golpe: E({ mx: 0, my: 0, c: 1, z: 1, sd: 10, gd: 0.15, si: 10, gi: 0.15, abre: 26, ancho: 0.85, sonr: -0.4, lengua: 0.4 }),
    ko: E({ mx: 0, my: 0, esp: 1, sd: 14, gd: 0.2, si: -6, gi: -0.1, abre: 18, ancho: 0.85, sonr: -0.2, lengua: 0.8 }),
    ciego: E({ mx: 0, my: 0, esp: 1, sd: 14, gd: 0.2, si: -6, gi: -0.1, abre: 10, ancho: 0.7, sonr: -0.45, lengua: 0 }),
    descubre: E({ mx: 0.6, my: -0.7, iris: 1.05, sd: 18, gd: 0.15, si: 14, gi: 0.12, abre: 6, ancho: 0.8, sonr: 0.2 }),
    sonrisa: E({ mx: -0.85, my: -0.05, sd: 14, gd: 0.18, si: 14, gi: 0.18, sonr: 0.85, abre: 10, ancho: 1.05, h: 0.35 })
  };
  const GUION_CARA_G = [
    [T.mira, T.mira + 0.3, "curioso"], [1.25, 1.55, "sigue"], [T.mAterriza - 0.05, T.mAterriza + 0.15, "wow"],
    [T.gManos - 0.15, T.gManos + 0.15, "decidido"], [T.gAnda, T.gAnda + 0.25, "serio"], [T.gAgarra, T.gAgarra + 0.2, "esfuerzo"],
    [T.gira0 - 0.02, T.gira0 + 0.08, "terror"], [T.culo, T.culo + 0.05, "golpe"], [T.culo + 0.18, T.culo + 0.4, "ko"],
    [T.casco1, T.casco1 + 0.05, "golpe"], [T.casco1 + 0.15, T.casco1 + 0.35, "ciego"],
    [T.levanta1 - 0.05, T.levanta1 + 0.2, "descubre"], [T.final + 0.05, T.final + 0.35, "sonrisa"]
  ];
  const CARAS_M = {
    inicio: E({ sonr: 0.5 }),
    desliza: E({ mx: 0.4, my: 0.6, c: 0.25, sd: 6, gd: 0.05, si: 6, gi: 0.05, sonr: 0.55, ancho: 0.95 }),
    aterriza: E({ mx: 0.6, my: 0.2, c: 0.2, sd: -4, gd: -0.08, si: -4, gi: -0.08, sonr: 0.35 }),
    pose: E({ mx: -0.85, my: -0.25, sd: 10, gd: 0.08, si: 16, gi: 0.12, sonr: 0.85, abre: 5, ancho: 1.05 }),
    guino: E({ mx: -0.85, my: -0.2, sd: 6, gd: 0.04, si: 18, gi: 0.14, sonr: 0.95, abre: 7, ancho: 1.05, gui: 1 }),
    mira: E({ mx: 0.85, my: -0.1, sd: 6, gd: 0.04, si: 8, gi: 0.06, sonr: 0.45 }),
    arriba: E({ mx: 0.7, my: -0.9, sd: 12, gd: 0.08, si: 14, gi: 0.1, sonr: 0.35 }),
    ceja: E({ mx: -0.85, my: -0.05, c: 0.15, sd: -4, gd: -0.08, si: 22, gi: 0.18, sonr: 0.15, ancho: 0.85 }),
    sigue: E({ mx: 0.85, my: -0.2, iris: 1.1, sd: 20, gd: 0.12, si: 20, gi: 0.12, abre: 18, ancho: 0.7, sonr: 0 }),
    auch: E({ mx: 0.6, my: 0.3, c: 0.85, z: 0.7, sd: 12, gd: -0.15, si: 12, gi: -0.15, sonr: -0.3, abre: 10, ancho: 1.15 }),
    risa: E({ mx: 0.7, my: 0.2, c: 0.55, h: 0.8, sd: 14, gd: 0.1, si: 14, gi: 0.1, sonr: 0.9, abre: 24, ancho: 1.05, lengua: 0.3 }),
    tierno: E({ mx: 0.85, my: 0.25, sd: 10, gd: -0.1, si: 12, gi: -0.1, sonr: 0.7, abre: 4, ancho: 1 }),
    final: E({ mx: -0.85, my: -0.05, sd: 8, gd: 0.05, si: 14, gi: 0.1, sonr: 0.9, abre: 8, ancho: 1.05 }),
    guino2: E({ mx: -0.85, my: -0.05, sd: 6, gd: 0.04, si: 16, gi: 0.12, sonr: 0.95, abre: 8, ancho: 1.05, gui: 1 })
  };
  const GUION_CARA_M = [
    [T.mDesde, T.mDesde + 0.2, "desliza"], [T.mAterriza, T.mAterriza + 0.15, "aterriza"], [T.mPose - 0.1, T.mPose + 0.2, "pose"],
    [T.guino, T.guino + 0.1, "guino"], [T.guino + 0.45, T.guino + 0.6, "pose"], [T.mRelaja, T.mRelaja + 0.3, "mira"],
    [T.gSube + 0.2, T.gSube + 0.5, "arriba"], [T.ceja, T.ceja + 0.2, "ceja"], [T.gira0 - 0.05, T.gira0 + 0.15, "sigue"],
    [T.culo - 0.02, T.culo + 0.06, "auch"], [T.culo + 0.4, T.culo + 0.6, "mira"], [T.casco0, T.casco0 + 0.15, "arriba"],
    [T.casco1, T.casco1 + 0.06, "auch"], [T.casco1 + 0.25, T.casco1 + 0.45, "risa"], [T.mVa0 + 0.1, T.mVa0 + 0.35, "tierno"],
    [T.final, T.final + 0.25, "final"], [T.final + 0.45, T.final + 0.55, "guino2"]
  ];

  /* ---------- utilidades de postura ---------- */
  const muDesde = (h, s) => Math.atan2(s.y - h.y, s.x - h.x);            // la muñeca mira hacia el hombro
  const giro = (q, c, a) => { const s = Math.sin(a), k = Math.cos(a), x = q.x - c.x, y = q.y - c.y; return { x: c.x + x * k - y * s, y: c.y + x * s + y * k }; };
  // pies plantados: lista de [t0, t1, x de pantalla]; devuelve {x, alza (px), ang}
  function pie(lista, t) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    const arco = Math.sin(Math.PI * u);
    return { x: lerp(xa, x, suave5(u)), alza: 48 * arco, ang: -0.18 * arco };
  }
  // del pie en pantalla a la hoja del personaje
  const pieHoja = (C, p, f, desfase = 0) => ({ tob: { x: C.aHoja(p, { x: f.x, y: 0 }).x, y: C.SUELO - C.TOBILLO_ALTO - desfase - f.alza / S }, ang: (p.espejo ? -1 : 1) * 0 + f.ang });
  const mezPierna = (a, b, k) => ({ tob: mezcla(a.tob, b.tob, k), ang: lerp(a.ang, b.ang, k) });
  const mezMano = (a, b, k) => {
    const o = Object.assign({}, k < 0.5 ? a : b);
    o.x = lerp(a.x, b.x, k); o.y = lerp(a.y, b.y, k); o.ang = lerp(a.ang || 0, b.ang || 0, k);
    o.mu = lerp(a.mu ?? -1.75, b.mu ?? -1.75, k); o.puno = lerp(a.puno ?? 1, b.puno ?? 1, k);
    if (a.dedos || b.dedos) { const d = {}, A0 = a.dedos || {}, B0 = b.dedos || {};
      for (const n of ["pulgar", "indice", "medio", "anular", "menique"]) d[n] = lerp(A0[n] ?? 0, B0[n] ?? 0, k); o.dedos = d; }
    return o;
  };

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  const R_MG = G.MUNECA_R * G.JK;
  const punoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_MG, y: Math.sin(mu) * R_MG }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_GC = punoDesde({ x: 131, y: 652 }, 0, -1.75), BOLS_GL = punoDesde({ x: 372, y: 648 }, 0, -1.75);
  const PASOS_G = {
    cerca: [[-10, -9, XG0 - 19], [T.gAnda, T.gAnda + 0.24, XG0 + 52], [T.gAnda + 0.3, T.gAnda + 0.54, XGb - 30]],
    lejos: [[-10, -9, XG0 + 18], [T.gAnda + 0.14, T.gAnda + 0.4, XG0 + 108], [T.gAnda + 0.42, T.gAnda + 0.64, XGb + 14]]
  };
  const PG = G.PELVIS;
  // agarre de la barra (hoja, marco del cuerpo de Guillermo sin girar)
  const BX_G = PG.x + OFF_G;
  const GR_G = { lejos: { x: BX_G, y: 300 }, cerca: { x: BX_G, y: 400 } };
  const RANGO_G = 230;                                  // recorrido de cada mano al trepar (hoja)
  // piernas enroscadas a la barra (hoja)
  const ENR_G = { cerca: { tob: { x: PG.x + 168, y: PG.y + 452 }, ang: 0.95 }, lejos: { tob: { x: PG.x + 318, y: PG.y + 392 }, ang: 0.55 } };

  // altura del cuerpo al trepar (px de pantalla, negativa = arriba) y fase del tirón
  // Sube a velocidad constante (con un arranque suave) y las manos se turnan: cada una se queda
  // quieta en el mundo (baja respecto al cuerpo) y luego sube de golpe a agarrar más arriba.
  const V_SUBE = SUBIDA / (T.subeFin - T.gSube - 0.15);
  function trepa(t) {
    const u = t - T.gSube, arr = 0.15;
    const sube = u <= 0 ? 0 : u < arr ? V_SUBE * u * u / (2 * arr) : V_SUBE * (u - arr / 2);
    const brinco = 58 * tramo(t, T.gAgarra, T.gSube);
    return { dy: -brinco - Math.min(SUBIDA, sube), activo: t >= T.gSube && t < SUBE_FIN, u };
  }
  // posición de una mano respecto al cuerpo al trepar: 0 arriba (recién agarrada) … 1 abajo
  function manoTrepa(t, desfase) {
    const agarra = 0.72, P = RANGO_G / (agarra * V_SUBE / S), f = (((t - T.gSube) / P + desfase) % 1 + 1) % 1;
    return f < agarra ? f / agarra : 1 - suave((f - agarra) / (1 - agarra));
  }
  // giro alrededor de la barra al bajar
  const VUELTAS = 5;
  const faseGiro = t => { const u = fase(t, T.gira0, T.gira1); return Math.PI * 2 * VUELTAS * Math.pow(u, 1.45); };
  const bajadaDy = t => { const u = fase(t, T.gira0, T.gira1); return lerp(-920, 0, 0.5 * u + 0.5 * u * u); };

  function poseG(t) {
    const respira = Math.sin(t * 2.3);
    const fC = pie(PASOS_G.cerca, t), fL = pie(PASOS_G.lejos, t);
    const xAnda = t < T.gAnda ? XG0 : (fC.x + fL.x) / 2 + 0.5;
    const enBarra = tramo(t, T.gAgarra, T.gAgarra + 0.3);         // de pie → agarrado
    const sentado = tramo(t, T.gira1 - 0.02, T.culo + 0.04, suave);
    const giroK = t >= T.gira0 && t < T.culo + 0.04 ? 1 : 0;
    let x = lerp(xAnda, XGb, enBarra), dy = 0;
    const tr = trepa(t);
    if (t >= T.gAgarra && t < T.gira0) dy = tr.dy;
    if (t >= T.gira0) dy = lerp(bajadaDy(t), 0, sentado);
    if (t >= T.gira0) x = lerp(XGb, X - 88, sentado);
    // inclinación y pelvis
    let pel = respira * 1.2, torso = 0, cab = 0;
    torso = lerp(0, 0.3, enBarra) * (1 - sentado);
    cab = lerp(0, -0.12, enBarra) * (1 - sentado);
    // mira arriba al principio (Marcos bajando) y luego a cámara
    cab += -0.14 * tramo(t, T.mira, T.mira + 0.4) * (1 - tramo(t, T.mAterriza - 0.2, T.mAterriza + 0.2));
    const p = { x, suelo: SUELO + dy, s: S, tirasLimpias: true,
      pelvis: { x: PG.x, y: PG.y + pel }, torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    // piernas: de pie / andando → enroscadas → (girando: al aire) → sentado
    const deP = { cerca: pieHoja(G, p, fC), lejos: pieHoja(G, p, fL, 12) };
    let piernas = { cerca: mezPierna(deP.cerca, ENR_G.cerca, enBarra), lejos: mezPierna(deP.lejos, ENR_G.lejos, enBarra) };
    if (tr.activo) {                         // las rodillas suben y bajan al ritmo de los tirones
      const k = (0.5 - 0.5 * Math.cos((t - T.gSube) * 17)) * 36 * tramo(t, T.gSube, T.gSube + 0.2);
      piernas.cerca.tob = { x: piernas.cerca.tob.x + k * 0.6, y: piernas.cerca.tob.y - k };
      piernas.lejos.tob = { x: piernas.lejos.tob.x + k * 0.4, y: piernas.lejos.tob.y - k * 0.8 };
    }
    if (giroK) {                             // piernas al aire, pataleando
      const a = Math.sin(t * 19), b = Math.sin(t * 17 + 1.3), abre = tramo(t, T.gira0, T.gira0 + 0.25);
      const vC = { tob: { x: PG.x - 80 + 90 * a, y: PG.y + 470 - 60 * b }, ang: 0.3 + 0.5 * a };
      const vL = { tob: { x: PG.x + 360 + 60 * b, y: PG.y + 330 + 70 * a }, ang: -0.2 + 0.5 * b };
      piernas = { cerca: mezPierna(piernas.cerca, vC, abre), lejos: mezPierna(piernas.lejos, vL, abre) };
    }
    if (sentado > 0) {                       // de culo: piernas estiradas hacia delante, la punta arriba
      const sC = { tob: { x: PG.x + 300, y: G.SUELO - G.TOBILLO_ALTO }, ang: -1.2 }, sL = { tob: { x: PG.x + 470, y: G.SUELO - G.TOBILLO_ALTO - 8 }, ang: -1.28 };
      piernas = { cerca: mezPierna(piernas.cerca, sC, sentado), lejos: mezPierna(piernas.lejos, sL, sentado) };
      p.pelvis.y += 556 * sentado;
      p.torso = lerp(p.torso, -0.14, sentado);
    }
    p.piernas = piernas;
    // al caer: rebote de la pelvis y cabeza que se tambalea
    if (t >= T.culo) {
      const r = Math.exp(-(t - T.culo) * 9) * Math.sin((t - T.culo) * 26);
      p.pelvis.y -= 26 * Math.max(0, r);
      const mareo = tramo(t, T.culo + 0.1, T.culo + 0.4) * (1 - tramo(t, T.levanta1, T.final + 0.3));
      p.torso += 0.05 * Math.sin(t * 2.7) * mareo; p.cabeza.ang += 0.09 * Math.sin(t * 2.7 + 0.8) * mareo;
      // el casco le aplasta la cabeza un instante
      const ch = t >= T.casco1 ? Math.exp(-(t - T.casco1) * 10) * suave(fase(t, T.casco1, T.casco1 + 0.03)) : 0;
      p.cabeza.esc = { x: 1 + 0.08 * ch, y: 1 - 0.12 * ch }; p.cabeza.dy = 12 * ch;
      p.cabeza.ang += 0.12 * tramo(t, T.levanta0, T.levanta1) * (1 - tramo(t, T.final, T.final + 0.4)) - 0.06 * tramo(t, T.final, T.final + 0.4);
    }
    // cara
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [1.05, 3.1, 4.6, T.levanta1 + 0.3, 12.7]));
    p.rojo = 0.55 * tramo(t, T.gSube, T.gSube + 0.6) * (1 - tramo(t, SUBE_FIN - 0.1, SUBE_FIN + 0.3)) + 0.4 * tramo(t, T.levanta1, T.final) * (1 - tramo(t, T.final + 0.4, T.fin));
    p.cara.rubor = p.rojo;
    p.sudor = tramo(t, T.gSube + 0.4, T.gSube + 0.9) * (1 - tramo(t, SUBE_FIN, SUBE_FIN + 0.3)) + 0.8 * tramo(t, T.levanta1, T.final);
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    const bols = { cerca: Object.assign({ ang: 0, mu: -1.75, dobla: -1, puno: 0 }, Tr(BOLS_GC)), lejos: Object.assign({ ang: 0, mu: -1.75, dobla: -1, puno: 0 }, Tr(BOLS_GL)) };
    // se sacude las manos delante de la tripa
    const sac = tramo(t, T.gManos, T.gManos + 0.25) * (1 - tramo(t, T.gAnda - 0.05, T.gAnda + 0.15));
    const sacude = Math.sin((t - T.gManos) * 30);
    const delante = {
      cerca: { x: hc.x + 150 + 10 * sacude, y: hc.y + 190 + 14 * sacude, ang: 0.3 * sacude, mu: -2.3, dobla: -1, puno: 1, dedos: { pulgar: 0.8, indice: 0.9, medio: 0.9, anular: 0.9, menique: 0.9 } },
      lejos: { x: hl.x + 110 - 10 * sacude, y: hl.y + 170 - 14 * sacude, ang: -0.3 * sacude, mu: -2.1, dobla: -1, puno: 1, dedos: { pulgar: 0.8, indice: 0.9, medio: 0.9, anular: 0.9, menique: 0.9 } }
    };
    // al andar: brazos sueltos que se balancean
    const anda = tramo(t, T.gAnda - 0.05, T.gAnda + 0.15) * (1 - enBarra);
    const bal = Math.sin((t - T.gAnda) * 9);
    const sueltos = {
      cerca: { x: hc.x + 10 + 50 * bal, y: hc.y + 300, ang: 0, mu: -1.6, dobla: -1, puno: 1, dedos: { pulgar: 0.3, indice: 0.35, medio: 0.35, anular: 0.35, menique: 0.35 } },
      lejos: { x: hl.x + 20 - 50 * bal, y: hl.y + 290, ang: 0, mu: -1.6, dobla: -1, puno: 1, dedos: { pulgar: 0.3, indice: 0.35, medio: 0.35, anular: 0.35, menique: 0.35 } }
    };
    // agarrado a la barra: las manos quedan quietas en el mundo mientras tira y luego suben de una en una
    const agarre = lado => {
      const base = GR_G[lado];
      let y = base.y;
      if (tr.activo) {
        const k = tramo(t, T.gSube, T.gSube + 0.15) * (1 - tramo(t, SUBE_FIN - 0.12, SUBE_FIN));
        y = base.y + RANGO_G * k * (manoTrepa(t, lado === "lejos" ? 0 : 0.5) - (lado === "lejos" ? 0 : 0.5));
      }
      if (giroK) y = base.y + 10 * Math.sin(t * 23 + (lado === "lejos" ? 0 : 1.7));
      const h = lado === "lejos" ? hl : hc;
      return { x: base.x, y, ang: 0, mu: muDesde({ x: base.x, y }, h), dobla: lado === "lejos" ? 1 : -1, puno: 1 };
    };
    // sentado: manos al suelo; con el casco, tantea a ciegas; al final, se rasca la nuca
    const tantea = tramo(t, T.ciego0, T.ciego0 + 0.25) * (1 - tramo(t, T.ciego1 - 0.2, T.ciego1 + 0.1));
    const w1 = Math.sin((t - T.ciego0) * 7), w2 = Math.sin((t - T.ciego0) * 6 + 1.6);
    const suelo = {
      cerca: { x: hc.x - 40, y: hc.y + 300, ang: 0, mu: -1.4, dobla: -1, puno: 1, dedos: { pulgar: 0.7, indice: 0.8, medio: 0.8, anular: 0.8, menique: 0.8 } },
      lejos: { x: hl.x + 120, y: hl.y + 240, ang: 0, mu: -2.2, dobla: -1, puno: 1, dedos: { pulgar: 0.6, indice: 0.7, medio: 0.7, anular: 0.7, menique: 0.7 } }
    };
    const ciegas = {
      cerca: { x: hc.x + 230 + 40 * w2, y: hc.y + 40 + 40 * w1, ang: 0, mu: -2.9, dobla: -1, puno: 1, dedos: { pulgar: 1, indice: 1, medio: 1, anular: 1, menique: 1 } },
      lejos: { x: hl.x + 210 + 40 * w1, y: hl.y - 20 + 40 * w2, ang: 0, mu: -2.9, dobla: -1, puno: 1, dedos: { pulgar: 1, indice: 1, medio: 1, anular: 1, menique: 1 } }
    };
    // saludito avergonzado a cámara con la mano abierta, delante del hombro (sin taparse la cara)
    const ola = Math.sin((t - T.final) * 11) * tramo(t, T.final + 0.3, T.final + 0.5);
    const nuca = { x: hl.x + 215, y: hl.y - 135, ang: 0.3 * ola, mu: 1.95, dobla: 1, puno: 1, dedos: { pulgar: 0.9, indice: 1, medio: 1, anular: 1, menique: 1 } };
    // al estamparse suelta la barra y abre los brazos hacia fuera (sin pasar por delante de la cara)
    const abre = {
      cerca: { x: hc.x - 170, y: hc.y + 60, ang: 0, mu: 0.4, dobla: -1, puno: 1, dedos: { pulgar: 1, indice: 1, medio: 1, anular: 1, menique: 1 } },
      lejos: { x: hl.x + 250, y: hl.y + 40, ang: 0, mu: -2.9, dobla: -1, puno: 1, dedos: { pulgar: 1, indice: 1, medio: 1, anular: 1, menique: 1 } }
    };
    for (const lado of ["cerca", "lejos"]) {
      let m = mezMano(bols[lado], delante[lado], sac);
      if (anda > 0) m = mezMano(m, sueltos[lado], anda);
      if (enBarra > 0) m = mezMano(m, agarre(lado), enBarra);
      if (sentado > 0) {
        let s = suelo[lado];
        if (tantea > 0) s = mezMano(s, ciegas[lado], tantea);
        if (lado === "lejos") s = mezMano(s, nuca, tramo(t, T.final + 0.1, T.final + 0.45));
        const fuera = mezMano(agarre(lado), abre[lado], tramo(t, T.gira1 - 0.06, T.culo + 0.02));
        m = mezMano(fuera, s, tramo(t, T.culo + 0.1, T.culo + 0.42));
      }
      p[lado === "cerca" ? "manoCerca" : "manoLejos"] = m;
    }
    p.giro = giroK ? faseGiro(t) : 0;
    return p;
  }

  /* =====================================================================================
   * MARCOS (a la derecha, en espejo: mira a la izquierda)
   * ===================================================================================== */
  const PM = MB.PELVIS;
  const BX_M = PM.x + OFF_M;
  const GR_M = { cerca: { x: BX_M, y: 405 } };
  const BRAZO_FUERA_M = { x: PM.x + 470, y: 600, ang: 0, mu: -2.55, dobla: -1, puno: 1, dedos: { pulgar: 0.9, indice: 1, medio: 1, anular: 0.95, menique: 0.9 } };
  const ENR_M = { cerca: { tob: { x: PM.x + 150, y: PM.y + 432 }, ang: 0.95 }, lejos: { tob: { x: PM.x + 312, y: PM.y + 372 }, ang: 0.6 } };
  const PASOS_M = {
    cerca: [[-10, -9, XM0 + 33], [T.mSuelta + 0.05, T.mSuelta + 0.3, XM0 + 74], [T.mSuelta + 0.4, T.mSuelta + 0.62, XM1 + 33],
            [T.mVa0, T.mVa0 + 0.28, XM1 - 10], [T.mVa0 + 0.32, T.mVa0 + 0.58, XM2 + 33]],
    lejos: [[-10, -9, XM0 - 40], [T.mSuelta + 0.2, T.mSuelta + 0.46, XM0 + 2], [T.mSuelta + 0.5, T.mSuelta + 0.72, XM1 - 40],
            [T.mVa0 + 0.14, T.mVa0 + 0.42, XM1 - 74], [T.mVa0 + 0.46, T.mVa0 + 0.7, XM2 - 40]]
  };
  const deslizaDy = t => { const u = fase(t, T.mDesde, T.mAterriza); return -760 * Math.pow(1 - u, 1.7); };

  let CASCO_EN = null;                        // dónde está el casco (lo calcula la escena antes de posar a Marcos)
  function poseM(t) {
    const respira = Math.sin(t * 2.1 + 1);
    const fC = pie(PASOS_M.cerca, t), fL = pie(PASOS_M.lejos, t);
    const enBarra = 1 - tramo(t, T.mAterriza, T.mAterriza + 0.22);
    const xPies = (fC.x + fL.x) / 2 + 3.5;
    let x = t < T.mSuelta ? XM0 : xPies;
    const dy = t < T.mAterriza ? deslizaDy(t) : 0;
    // flexión al aterrizar
    const flexion = campana(t, T.mAterriza - 0.02, T.mSuelta + 0.18);
    const pecho = tramo(t, T.mPose, T.mPose + 0.3) * (1 - tramo(t, T.mRelaja, T.mRelaja + 0.4));
    const inclina = 0.38 * tramo(t, T.mVa1 - 0.2, T.mEstira) * (1 - tramo(t, T.quita1, T.final + 0.2));
    const p = { x, suelo: SUELO + dy, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: PM.x, y: PM.y + respira * 1.2 + 70 * flexion + 40 * inclina }, torso: 0.12 * enBarra + 0.05 * flexion - 0.05 * pecho + inclina,
      torsoEsc: { x: 1 + 0.03 * pecho, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: -0.1 * enBarra - 0.08 * pecho + 0.1 * flexion, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    // la cabeza sigue a Guillermo: arriba al trepar, abajo al caer
    p.cabeza.ang += -0.12 * tramo(t, T.gSube + 0.2, T.gSube + 0.6) * (1 - tramo(t, T.gira0, T.culo)) - 0.08 * tramo(t, T.casco0, T.casco0 + 0.2) * (1 - tramo(t, T.casco1, T.casco1 + 0.2));
    const deP = { cerca: pieHoja(MB, p, fC), lejos: pieHoja(MB, p, fL, 10) };
    p.piernas = { cerca: mezPierna(deP.cerca, ENR_M.cerca, enBarra), lejos: mezPierna(deP.lejos, ENR_M.lejos, enBarra) };
    // cara
    const ex = guion(GUION_CARA_M, CARAS_M, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [2.05, 5.4, 6.9, 9.4, 11.0]));
    // manos: en la barra → puños en la cintura → la cercana descansa → el dedo levanta el casco
    const Tr = MB.tronco(p), hc = Tr(MB.HOMBRO_C), hl = Tr(MB.HOMBRO);
    const barra = lado => {
      if (lado === "lejos") { const b = Tr(BRAZO_FUERA_M); return Object.assign({}, BRAZO_FUERA_M, { x: b.x + 10 * Math.sin(t * 2.4), y: b.y + 8 * Math.sin(t * 2.1) }); }
      const b = GR_M.cerca; return { x: b.x, y: b.y, ang: 0, mu: muDesde(b, hc), dobla: -1, puno: 1 }; };
    const cintura = {
      cerca: Object.assign({ ang: 0, mu: -0.6, dobla: -1, puno: 1 }, Tr({ x: 112, y: 700 })),
      lejos: Object.assign({ ang: 0, mu: -2.5, dobla: 1, puno: 1 }, Tr({ x: 418, y: 690 }))
    };
    const reposo = MB.manoReposo(p, "cerca");
    const suelta = tramo(t, T.mSuelta - 0.05, T.mSuelta + 0.3);
    const relaja = tramo(t, T.mRelaja, T.mRelaja + 0.4);
    let mc = mezMano(barra("cerca"), cintura.cerca, suelta), ml = mezMano(barra("lejos"), cintura.lejos, suelta);
    mc = mezMano(mc, reposo, relaja);
    // se tapa la boca al reírse del casco
    const tapa = tramo(t, T.casco1 + 0.25, T.casco1 + 0.45) * (1 - tramo(t, T.mVa0, T.mVa0 + 0.3));
    if (tapa > 0) {
      const b = MB.cabeza(p).a({ x: 860, y: 700 });
      mc = mezMano(mc, { x: b.x + 30, y: b.y + 40, ang: 0, mu: 1.9, dobla: -1, puno: 1, dedos: { pulgar: 0.5, indice: 0.9, medio: 0.9, anular: 0.9, menique: 0.9 } }, tapa);
    }
    // el dedo: estira el brazo lejano y engancha el ala del casco
    const estira = tramo(t, T.mVa1 - 0.25, T.mEstira);
    if (estira > 0 && CASCO_EN) {
      const punta = MB.aHoja(p, CASCO_EN.dedo);                     // donde tiene que estar la yema del índice
      const dedo = { x: punta.x, y: punta.y - 44, ang: 0, mu: -1.6, dobla: 1, puno: 1, dedos: { pulgar: 0.15, indice: 1, medio: 0.05, anular: 0.05, menique: 0.05 } };
      ml = mezMano(ml, dedo, estira);
    }
    p.manoCerca = mc; p.manoLejos = ml;
    return p;
  }

  /* =====================================================================================
   * CASCO (atrezo): en unidades del retrato; origen en el centro del ala, el frente hacia +x
   * ===================================================================================== */
  function dibCasco(g) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = "#0b0a0e";
    // cogotera (detrás) y ala
    g.fillStyle = "#1a1a1f"; g.beginPath(); g.moveTo(-300, -20); g.quadraticCurveTo(-420, 40, -430, 120); g.lineTo(-300, 90); g.quadraticCurveTo(-250, 40, -210, 10); g.closePath(); g.fill(); g.lineWidth = 12; g.stroke();
    g.fillStyle = "#e0b416"; g.beginPath(); g.ellipse(10, 0, 380, 46, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 14; g.stroke();
    // cúpula
    const cupula = () => { g.beginPath(); g.moveTo(-320, 0); g.bezierCurveTo(-330, -330, 330, -360, 330, 0); g.closePath(); };
    cupula(); g.fillStyle = "#fbd332"; g.fill();
    g.save(); cupula(); g.clip();
    g.fillStyle = "#d9a50f"; g.beginPath(); g.ellipse(170, -40, 230, 300, 0.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,250,200,0.85)"; g.beginPath(); g.ellipse(-120, -200, 90, 46, -0.5, 0, Math.PI * 2); g.fill();
    // banda reflectante
    g.fillStyle = "#c9ced6"; g.fillRect(-340, -95, 680, 52); g.fillStyle = "rgba(255,255,255,0.6)"; g.fillRect(-340, -90, 680, 12);
    g.restore();
    cupula(); g.lineWidth = 14; g.stroke();
    // cresta
    g.fillStyle = "#e9bd1e"; g.beginPath(); g.moveTo(-160, -235); g.quadraticCurveTo(0, -330, 170, -240); g.lineTo(150, -205); g.quadraticCurveTo(0, -285, -140, -205); g.closePath(); g.fill(); g.lineWidth = 9; g.stroke();
    // escudo del frente
    g.save(); g.translate(250, -150); g.rotate(0.35);
    g.fillStyle = "#1c1b20"; g.beginPath(); g.moveTo(-50, -60); g.lineTo(50, -60); g.lineTo(54, 10); g.quadraticCurveTo(0, 75, -54, 10); g.closePath(); g.fill(); g.lineWidth = 8; g.stroke();
    g.fillStyle = "#f2c230"; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 14 : 32; g.lineTo(Math.cos(a) * r, -5 + Math.sin(a) * r); } g.closePath(); g.fill();
    g.restore();
    g.restore();
  }
  // casco en pantalla: {x, y, ang, k (px por unidad), kx (para el giro)}
  function pintaCasco(g, c) {
    g.save(); g.translate(c.x, c.y); g.rotate(c.ang); g.scale(c.k * (c.kx ?? 1), c.k); dibCasco(g); g.restore();
  }
  // del retrato de Guillermo a la pantalla
  function retratoAPantalla(p, q) { return G.aPantalla(p, G.cabeza(p).a(q)); }
  const ALA_SOBRE = { x: 790, y: 330 }, ALA_OJOS = { x: 800, y: 640 };   // ala apoyada en el pelo / hundida hasta los ojos
  function cascoEnCabeza(p, hunde) {
    const a = retratoAPantalla(p, { x: lerp(ALA_SOBRE.x, ALA_OJOS.x, hunde), y: lerp(ALA_SOBRE.y, ALA_OJOS.y, hunde) });
    const H = G.cabeza(p);
    return { x: a.x, y: a.y, ang: H.ang + 0.05, k: S * H.kx * 0.95 };
  }
  // estado del casco en el tiempo (pG: postura de Guillermo, pM0: postura de Marcos sin el dedo)
  function casco(t, pG) {
    if (t < T.casco0) return null;
    const bocaAgujero = { x: X + 30, y: TECHO - 20 };
    const enCabeza = cascoEnCabeza(pG, t < T.casco1 ? 0 : clamp(salida(fase(t, T.casco1, T.casco1 + 0.22)) * (1 + 0.08 * Math.sin(fase(t, T.casco1, T.casco1 + 0.4) * Math.PI))));
    if (t < T.casco1) {
      const u = fase(t, T.casco0, T.casco1), dest = cascoEnCabeza(pG, 0);
      return { x: lerp(bocaAgujero.x, dest.x, u), y: lerp(bocaAgujero.y, dest.y, u * u), ang: lerp(1.9, dest.ang, salida(u)) + 0.25 * Math.sin(u * 9) * (1 - u), k: dest.k };
    }
    // Marcos engancha el ala de delante y lo levanta: gira sobre la parte de atrás y luego se lo quita
    const lev = suave(fase(t, T.levanta0, T.levanta1)), quita = suave(fase(t, T.levanta1, T.quita1));
    let c = Object.assign({}, enCabeza);
    if (lev > 0) {
      const piv = { x: c.x + Math.cos(c.ang) * -300 * c.k, y: c.y + Math.sin(c.ang) * -300 * c.k };
      const a = -0.75 * lev, q = giro({ x: c.x, y: c.y }, piv, a);
      c = { x: q.x, y: q.y, ang: c.ang + a, k: c.k };
    }
    if (quita > 0) { c.y -= 70 * quita; c.x += 18 * quita; c.ang += 0.25 * quita; }
    // balanceo colgado del dedo al final
    if (t > T.quita1) { const v = t - T.quita1; c.ang += 0.12 * Math.exp(-v * 2.2) * Math.sin(v * 8); }
    return c;
  }
  // yema del dedo: el ala de delante del casco
  const alaDelante = c => ({ x: c.x + Math.cos(c.ang) * 330 * c.k - Math.sin(c.ang) * 30 * c.k, y: c.y + Math.sin(c.ang) * 330 * c.k + Math.cos(c.ang) * 30 * c.k });

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 60 + ARRIBA; const g = c.getContext("2d");
    g.translate(40, ARRIBA);
    // pared de ladrillo rojo con luz cálida (sube hasta el techo, por encima del plano)
    const pared = g.createLinearGradient(0, TECHO, 0, 470); pared.addColorStop(0, "#3e100c"); pared.addColorStop(0.45, "#6a1c16"); pared.addColorStop(1, "#8e2a1f");
    g.fillStyle = pared; g.fillRect(-40, -ARRIBA, W + 80, 470 + ARRIBA);
    g.strokeStyle = "rgba(30,6,4,0.35)"; g.lineWidth = 2;
    for (let y = TECHO + 6, f = 0; y < 470; y += 22, f++) {
      g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke();
      for (let x = (f % 2) * 30 - 60; x < W + 40; x += 60) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 22); g.stroke(); }
    }
    for (let i = 0; i < 110; i++) { g.fillStyle = `rgba(${hash(i) > 0.5 ? "255,180,140" : "40,8,4"},0.08)`; const f = Math.floor(hash(i + 3) * 32), x = Math.floor(hash(i + 7) * 18) * 60 - 40 + (f % 2) * 30; g.fillRect(x + 2, TECHO + 8 + f * 22, 56, 18); }
    // luz de los apliques de la pared
    for (const lx of [200, 780]) {
      const h = g.createRadialGradient(lx, 110, 10, lx, 110, 330); h.addColorStop(0, "rgba(255,210,140,0.45)"); h.addColorStop(1, "rgba(255,190,120,0)"); g.fillStyle = h; g.fillRect(lx - 340, -120, 680, 590);
      g.fillStyle = "#0e0d10"; g.fillRect(lx - 4, 66, 8, 26); g.beginPath(); g.moveTo(lx - 24, 108); g.quadraticCurveTo(lx, 78, lx + 24, 108); g.closePath(); g.fill();
      g.fillStyle = "#ffe2a6"; g.beginPath(); g.ellipse(lx, 108, 18, 5, 0, 0, Math.PI * 2); g.fill();
    }
    // tubería y manómetro por la parte alta de la pared
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 16; g.beginPath(); g.moveTo(-40, -150); g.lineTo(W + 40, -150); g.stroke();
    g.strokeStyle = "#8f9aa3"; g.lineWidth = 11; g.stroke();
    for (let x = 60; x < W; x += 230) { g.fillStyle = "#6d767d"; g.fillRect(x - 6, -160, 12, 20); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.strokeRect(x - 6, -160, 12, 20); }
    g.fillStyle = "#e9e4d8"; g.beginPath(); g.arc(760, -110, 22, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 4; g.stroke();
    g.strokeStyle = "#c81d24"; g.lineWidth = 3; g.beginPath(); g.moveTo(760, -110); g.lineTo(774, -122); g.stroke();
    // escalera de mano colgada en la pared
    g.save(); g.translate(905, -40);
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 12; for (const dx of [0, 54]) { g.beginPath(); g.moveTo(dx, -160); g.lineTo(dx, 240); g.stroke(); }
    g.strokeStyle = "#c9ced6"; g.lineWidth = 7; for (const dx of [0, 54]) { g.beginPath(); g.moveTo(dx, -160); g.lineTo(dx, 240); g.stroke(); }
    for (let y = -140; y < 240; y += 42) { g.strokeStyle = "#0b0a0e"; g.lineWidth = 9; g.beginPath(); g.moveTo(0, y); g.lineTo(54, y); g.stroke(); g.strokeStyle = "#c9ced6"; g.lineWidth = 5; g.stroke(); }
    g.restore();
    // taquillas a la izquierda con chaquetones
    for (let i = 0; i < 3; i++) {
      const x0 = 18 + i * 62;
      g.fillStyle = "#3d4a52"; g.fillRect(x0, 250, 58, 214); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(x0, 250, 58, 214);
      g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(x0 + 4, 254, 10, 206);
      g.strokeStyle = "rgba(0,0,0,0.5)"; g.lineWidth = 2; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x0 + 16, 266 + k * 7); g.lineTo(x0 + 42, 266 + k * 7); g.stroke(); }
      g.fillStyle = "#c9ced6"; g.fillRect(x0 + 46, 350, 5, 16);
    }
    // perchero con chaquetón y casco
    g.fillStyle = "#b08a3c"; g.fillRect(212, 248, 8, 210); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.strokeRect(212, 248, 8, 210);
    g.fillStyle = "#2c2c35"; g.beginPath(); g.moveTo(216, 262); g.quadraticCurveTo(248, 270, 246, 360); g.lineTo(188, 362); g.quadraticCurveTo(184, 270, 216, 262); g.fill(); g.stroke();
    g.fillStyle = "#f2e030"; g.fillRect(190, 320, 56, 8); g.fillRect(190, 340, 56, 8);
    // campana de latón
    g.save(); g.translate(640, 190);
    g.fillStyle = "#6b4a1e"; g.fillRect(-36, -42, 72, 10); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.strokeRect(-36, -42, 72, 10);
    g.fillStyle = "#d9a33b"; g.beginPath(); g.moveTo(-18, -30); g.quadraticCurveTo(-20, 8, -32, 18); g.lineTo(32, 18); g.quadraticCurveTo(20, 8, 18, -30); g.quadraticCurveTo(0, -38, -18, -30); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,240,190,0.7)"; g.beginPath(); g.ellipse(-8, -6, 4, 14, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#3a2a10"; g.beginPath(); g.arc(0, 22, 5, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
    // ventana del portón a la derecha (noche)
    g.save(); g.translate(860, 150);
    g.fillStyle = "#16253a"; g.fillRect(0, 0, 140, 110); g.strokeStyle = "#0b0a0e"; g.lineWidth = 4; g.strokeRect(0, 0, 140, 110);
    g.fillStyle = "rgba(255,230,160,0.8)"; for (let i = 0; i < 12; i++) g.fillRect(8 + hash(i) * 120, 50 + hash(i + 5) * 50, 4, 5);
    g.strokeStyle = "#7a1d16"; g.lineWidth = 6; g.beginPath(); g.moveTo(70, 0); g.lineTo(70, 110); g.moveTo(0, 55); g.lineTo(140, 55); g.stroke();
    g.restore();
    // zócalo rojo bombero y suelo de hormigón
    g.fillStyle = "#b51d24"; g.fillRect(-40, 448, W + 80, 22); g.fillStyle = "#d8342c"; g.fillRect(-40, 448, W + 80, 4);
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(-40, 470, W + 80, 4);
    const su = g.createLinearGradient(0, 470, 0, H); su.addColorStop(0, "#7d7a74"); su.addColorStop(1, "#4d4a46");
    g.fillStyle = su; g.fillRect(-40, 470, W + 80, H + 60 - 470);
    g.strokeStyle = "rgba(0,0,0,0.18)"; g.lineWidth = 2;
    for (let x = -40; x < W + 40; x += 120) { g.beginPath(); g.moveTo(x, 474); g.lineTo(x - 70, H + 60); g.stroke(); }
    // franjas amarillas de seguridad en el suelo
    g.fillStyle = "rgba(245,200,40,0.55)"; g.fillRect(-40, 572, W + 80, 6);
    // colchoneta redonda al pie de la barra
    g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse(X, SUELO + 4, 130, 20, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#1e1d22"; g.beginPath(); g.ellipse(X, SUELO, 122, 17, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.stroke();
    g.strokeStyle = "#f5c518"; g.lineWidth = 4; g.beginPath(); g.ellipse(X, SUELO, 104, 13, 0, 0, Math.PI * 2); g.stroke();
    return c;
  }
  // viñeta fija en pantalla (no se mueve con la cámara)
  let vineta = null;
  function creaVineta() {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    const v = g.createRadialGradient(512, 320, 300, 512, 320, 700); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.5)");
    g.fillStyle = v; g.fillRect(0, 0, W, H); return c;
  }
  // techo de vigas con el agujero de la barra (va por delante de todo: quien sube se mete en él)
  let techo = null;
  function creaTecho() {
    const ALTO = 170;                                    // grosor visible del techo por encima de TECHO
    const c = document.createElement("canvas"); c.width = W + 80; c.height = ALTO + 40; const g = c.getContext("2d");
    g.translate(40, ALTO - TECHO);
    const gr = g.createLinearGradient(0, TECHO - ALTO, 0, TECHO); gr.addColorStop(0, "#1d120c"); gr.addColorStop(1, "#3b2416");
    g.fillStyle = gr; g.fillRect(-40, TECHO - ALTO, W + 80, ALTO);
    for (let x = -20; x < W + 40; x += 150) { g.fillStyle = "#2a1a10"; g.fillRect(x, TECHO - ALTO, 36, ALTO); g.fillStyle = "rgba(255,200,140,0.08)"; g.fillRect(x, TECHO - ALTO, 5, ALTO); }
    g.fillStyle = "#4a2d1a"; g.fillRect(-40, TECHO - 14, W + 80, 14); g.fillStyle = "rgba(0,0,0,0.5)"; g.fillRect(-40, TECHO - 2, W + 80, 2);
    // agujero: hueco oscuro con aro de latón
    g.fillStyle = "#050405"; g.beginPath(); g.ellipse(X, TECHO - 4, 74, 15, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#c8962e"; g.lineWidth = 6; g.beginPath(); g.ellipse(X, TECHO - 4, 76, 16, 0, 0, Math.PI); g.stroke();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.beginPath(); g.ellipse(X, TECHO - 4, 80, 19, 0, 0, Math.PI); g.stroke();
    return c;
  }
  // barra de latón entre y0 e y1 (pantalla)
  function barra(g, y0, y1, vibra) {
    const x = X + vibra;
    g.save(); g.lineCap = "butt";
    g.fillStyle = "#0b0a0e"; g.fillRect(x - 9, y0, 18, y1 - y0);
    const gr = g.createLinearGradient(x - 7, 0, x + 7, 0); gr.addColorStop(0, "#8a5d14"); gr.addColorStop(0.35, "#ffe08a"); gr.addColorStop(0.6, "#d9a33b"); gr.addColorStop(1, "#7a4f10");
    g.fillStyle = gr; g.fillRect(x - 7, y0, 14, y1 - y0);
    g.restore();
  }
  function baseBarra(g) {
    g.save(); g.fillStyle = "#b8862c"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5;
    g.beginPath(); g.ellipse(X, SUELO - 3, 20, 6, 0, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore();
  }
  // tramo de barra por delante de la pierna lejana (la que se enrosca por detrás)
  function barraSobrePiernaLejana(g, C, p, vibra) {
    const T0 = C.tronco(p), cad = T0(C.CADERA.lejos), q = p.piernas.lejos;
    const L = C.A.datos.piezas.pierna_lejos.largo || (C.A.datos.piezas.pierna_lejos.fin[1] - C.A.datos.piezas.pierna_lejos.raiz[1]);
    const c = R.ik(cad, q.tob, L, L * 0.5, 80, 1, 1.03), pts = R.muestras(c, 18).slice(9).concat([{ x: q.tob.x, y: q.tob.y + 60 }]);
    const sc = pts.map(v => C.aPantalla(p, v));
    g.save(); g.beginPath();
    for (let i = 0; i < sc.length; i++) { const v = sc[i]; if (i) g.lineTo(v.x, v.y); else g.moveTo(v.x, v.y); }
    // banda alrededor de la espinilla lejana
    const w = 26, ida = [], vuelta = [];
    for (let i = 0; i < sc.length; i++) { const a = sc[Math.max(0, i - 1)], b = sc[Math.min(sc.length - 1, i + 1)], nx = -(b.y - a.y), ny = b.x - a.x, l = Math.hypot(nx, ny) || 1; ida.push({ x: sc[i].x + nx / l * w, y: sc[i].y + ny / l * w }); vuelta.push({ x: sc[i].x - nx / l * w, y: sc[i].y - ny / l * w }); }
    g.beginPath(); M2.poligono(g, ida.concat(vuelta.reverse())); g.clip();
    barra(g, TECHO - 170, SUELO, vibra);
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrella(g, x, y, r, puntas, rot, rel = 0.45) { g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); }
  function impacto(g, t, t0, x, y, tam) {
    const k = fase(t, t0, t0 + 0.3); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    estrella(g, x, y, tam * (0.6 + 0.8 * salida(k)), 10, 0.3, 0.42); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 3; g.strokeStyle = "#0b0a0e"; g.stroke();
    estrella(g, x, y, tam * (0.35 + 0.5 * salida(k)), 10, 0.6, 0.5); g.fillStyle = "#ffffff"; g.fill();
    g.restore();
  }
  function estrellitas(g, t, pG) {
    const k = tramo(t, T.culo + 0.1, T.culo + 0.35) * (1 - tramo(t, T.casco1 - 0.05, T.casco1 + 0.05)); if (k <= 0.01) return;
    const c = retratoAPantalla(pG, { x: 790, y: 300 });
    const pts = []; for (let i = 0; i < 5; i++) { const a = t * 4.4 + i * Math.PI * 2 / 5; pts.push({ a, x: c.x + Math.cos(a) * 60, y: c.y - 24 + Math.sin(a) * 15, z: Math.sin(a) }); }
    pts.sort((u, v) => u.z - v.z);
    g.save(); for (const q of pts) { estrella(g, q.x, q.y, (9 + 3 * q.z) * k, 5, t * 3 + q.a); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2; g.strokeStyle = "#0b0a0e"; g.stroke(); } g.restore();
  }
  function polvoSuelo(g, t, t0, x, ancho) {
    const k = fase(t, t0 - 0.02, t0 + 0.9); if (k <= 0 || k >= 1) return;
    g.save();
    for (let i = 0; i < 10; i++) { const lado = i % 2 ? 1 : -1, d = (20 + ancho * salida(k)) * (0.55 + hash(i + 50) * 0.6);
      g.globalAlpha = 0.45 * (1 - k); g.fillStyle = "#bdb4a8";
      g.beginPath(); g.ellipse(x + lado * d, SUELO - 6 - 22 * k * hash(i + 51), 12 + 18 * k, 7 + 9 * k, 0, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // polvo que cae del agujero mientras Guillermo está arriba
  function polvoAgujero(g, t) {
    if (t < T.polvo || t > T.gira0 + 0.5) return;
    g.save();
    for (let i = 0; i < 14; i++) {
      const t0 = T.polvo + hash(i + 80) * 0.6, u = (t - t0) / 1.3; if (u <= 0 || u >= 1) continue;
      g.globalAlpha = 0.75 * Math.min(1, (1 - u) * 3); g.fillStyle = "#a89a88";
      g.beginPath(); g.arc(X - 50 + hash(i + 81) * 100 + 8 * Math.sin(u * 9 + i), TECHO + u * u * 760, 2 + hash(i + 82) * 2.5, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  // estelas del giro (arcos alrededor de la barra) y humito de rozar
  function estelasGiro(g, t, pG, delante) {
    if (t < T.gira0 || t > T.culo) return;
    const fuerza = tramo(t, T.gira0, T.gira0 + 0.2) * (1 - tramo(t, T.gira1 - 0.08, T.culo));
    const yC = pG.suelo - (G.SUELO - 500) * S;
    g.save(); g.lineCap = "round";
    for (let i = 0; i < 5; i++) {
      const y = yC - 150 + i * 62, ph = faseGiro(t) + i * 0.9, rx = 64 + 10 * Math.sin(i), ry = 13;
      g.strokeStyle = `rgba(255,255,255,${0.55 * fuerza})`; g.lineWidth = 4;
      g.beginPath(); g.ellipse(X, y, rx, ry, 0, delante ? ph % (Math.PI * 2) : (ph + Math.PI) % (Math.PI * 2), (delante ? ph % (Math.PI * 2) : (ph + Math.PI) % (Math.PI * 2)) + 1.6); g.stroke();
    }
    if (delante) for (let i = 0; i < 6; i++) {
      const u = ((t * 3 + hash(i + 90)) % 1); g.globalAlpha = 0.5 * fuerza * (1 - u); g.fillStyle = "#ece6dc";
      g.beginPath(); g.arc(X + (hash(i + 91) - 0.5) * 30, yC - 150 + hash(i + 92) * 60 - u * 40, 6 + 10 * u, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  // destello del casco de Marcos al posar
  function destello(g, t, pM) {
    const k = campana(t, T.guino - 0.05, T.guino + 0.45); if (k <= 0) return;
    const c = MB.aPantalla(pM, MB.cabeza(pM).a({ x: 700, y: 320 }));
    g.save(); g.globalAlpha = k; g.fillStyle = "#ffffff"; estrella(g, c.x, c.y, 16 * k, 4, t * 2, 0.25); g.fill(); g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const cerca = tramo(t, T.mVa0, T.levanta0, suave);
    // al trepar la cámara sigue a Guillermo (su coronilla a unos 60 px del borde de arriba) hasta ver el techo
    const coronilla = SUELO + trepa(Math.min(t, SUBE_FIN)).dy - 420;
    const sigue = clamp(coronilla + 240, -75, 300);
    const vuelve = tramo(t, T.panBaja0, T.panBaja1, suave);
    const y = lerp(t < T.gAgarra ? 300 : sigue, 300, vuelve);
    const sube = (300 - y) / 375;
    return { k: 1 + 0.14 * cerca, x: 512 - 70 * cerca - 30 * sube, y: y + 70 * cerca };
  }

  /* ---------- poses ---------- */
  let ESTADO = { t: -1 };
  function pose(t) {
    const g = poseG(t);
    const c = casco(t, g);
    CASCO_EN = c ? { dedo: alaDelante(cascoEnCabeza(g, 1)) } : null;
    // mientras levanta el casco, la yema sigue al ala de delante
    if (c && t >= T.levanta0 - 0.05) CASCO_EN.dedo = alaDelante(c);
    const m = poseM(t);
    return { g, m, casco: c };
  }

  class GuillermoBarra extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !MB.listo()) return;
      if (!fondo) { fondo = creaFondo(); techo = creaTecho(); vineta = creaVineta(); }
      const P = pose(t), pG = P.g, pM = P.m;
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = (t >= T.culo ? 7 * Math.exp(-(t - T.culo) * 7) : 0) + (t >= T.casco1 ? 3 * Math.exp(-(t - T.casco1) * 9) : 0) + (t >= T.mAterriza ? 2 * Math.exp(-(t - T.mAterriza) * 9) : 0);
      const vibra = 2.2 * campana(t, T.tiembla, T.gira0 + 0.05) * Math.sin(t * 60) + 1.5 * (t > T.gira0 && t < T.culo ? Math.sin(t * 70) : 0);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -40, -ARRIBA);
      // sombras
      g.save(); g.fillStyle = "rgba(0,0,0,0.32)";
      const sombra = (x, alto, ancho) => { const k = clamp(1 - alto / 400); if (k <= 0.02) return; g.globalAlpha = k; g.beginPath(); g.ellipse(x, SUELO + 2, ancho * (0.5 + 0.5 * k), 8, 0, 0, Math.PI * 2); g.fill(); };
      sombra(pG.x + 8, SUELO - pG.suelo, pG.pelvis.y > 1000 ? 130 : 80); sombra(pM.x - 4, SUELO - pM.suelo, 90);
      g.restore();
      barra(g, TECHO - 170, SUELO - 2, vibra); baseBarra(g);
      // Marcos (en la barra la pierna lejana queda por detrás de ella)
      const mEnBarra = t < T.mAterriza + 0.2;
      // Guillermo: al girar, por delante o por detrás de la barra (y estrecho de perfil)
      const visibleG = !(t > SUBE_FIN + 0.05 && t < T.gira0);
      const dibG = () => {
        if (!visibleG) return;
        if (pG.giro) {
          const xs = Math.cos(pG.giro);
          g.save(); g.translate(X, 0); g.scale(Math.abs(xs) < 0.04 ? 0.04 * Math.sign(xs || 1) : xs, 1); g.translate(-X, 0);
          G.dibujar(g, pG, t); g.restore();
        } else G.dibujar(g, pG, t);
      };
      const gDetras = pG.giro && Math.sin(pG.giro) < 0;
      estelasGiro(g, t, pG, false);
      if (gDetras) { dibG(); barra(g, TECHO - 170, SUELO - 2, vibra); } else dibG();
      if (!pG.giro && t >= T.gAgarra && t < T.gira0 && visibleG) barraSobrePiernaLejana(g, G, pG, vibra);
      estelasGiro(g, t, pG, true);
      if (P.casco) pintaCasco(g, P.casco);
      MB.dibujar(g, pM, t);
      if (mEnBarra && t > T.mDesde - 0.2) barraSobrePiernaLejana(g, MB, pM, vibra);
      destello(g, t, pM);
      estrellitas(g, t, pG);
      polvoSuelo(g, t, T.mAterriza, XM0, 70); polvoSuelo(g, t, T.culo, X - 70, 110);
      impacto(g, t, T.culo, X - 120, SUELO - 20, 34);
      if (P.casco && t >= T.casco1) { const c = cascoEnCabeza(pG, 0); impacto(g, t, T.casco1, c.x, c.y - 60, 30); }
      polvoAgujero(g, t);
      g.drawImage(techo, -40, TECHO - 170);
      g.restore();
      g.drawImage(vineta, 0, 0);
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00023", nombre: "Guillermo y Marcos · La barra de bomberos", crear: () => new GuillermoBarra() });
  window.__A2D_00023 = { pose, T, DUR };
})();
