"use strict";
/* 00029 · Guillermo y Marcos · La sirena
 *
 * Negro → cochera del parque de bomberos al atardecer: azulejos verdes, ventanales con el cielo
 * naranja, cascos colgados y, a la derecha, el frontal de un camión de bomberos con su bocina de
 * sirena cromada a la altura de la cabeza, un botón rojo y los rotativos en el techo. Marcos está
 * delante del camión; Guillermo, con las manos en los bolsillos, lo mira embobado → señala el botón
 * y le pregunta a Marcos con la mirada; Marcos le invita con la mano abierta → mientras Guillermo se
 * acerca frotándose las manos, Marcos se pone tranquilamente un tapón en el oído → Guillermo pulsa
 * el botón: los rotativos empiezan a girar y la bocina tiembla… él se asoma a mirar dentro → ¡la
 * sirena le revienta en la cara! El pelo se le va hacia atrás de golpe, los mofletes le flamean como
 * en un túnel de viento, le saltan las lágrimas y el chorro de sonido lo arrastra de espaldas por el
 * suelo; pelea contra el viento, rojo, y lo vuelve a empujar → Marcos, aburrido, se mira las uñas,
 * mira a cámara, se acerca y apaga la sirena → silencio: Guillermo se queda congelado, inclinado,
 * con el pelo tieso hacia atrás y los oídos pitando → se tambalea; Marcos se quita el tapón y le
 * pregunta si está bien; Guillermo se pone la mano en la oreja («¿qué?») y Marcos, mirando a cámara,
 * le ofrece el tapón → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, MB = MarcosBombero;
  const S = 0.30, SUELO = 560, DUR = 13.5;
  const TINTA = "#0b0a0e";
  const T = {
    mira: 0.45, senala0: 1.2, senala1: 1.55, mMira: 1.6, mEncoge0: 1.95, mEncoge1: 2.35, senalaFin: 2.35,
    anda0: 2.42, anda1: 3.25,
    mTapon0: 2.6, mTapon1: 3.0, mTapon2: 3.35, mTaponB: 3.55, mTaponB1: 3.95, mTaponFin: 4.3,
    pulsa0: 3.2, pulsa: 3.48, suelta: 3.72,
    arranca: 3.5, asoma0: 3.8, asoma1: 4.25,
    sopla: 4.38,
    empuje0: 4.42, empuje1: 5.35, resiste0: 5.35, resiste1: 6.15, empuje2: 6.15, empuje3: 7.2,
    mUnas0: 4.75, mUnas1: 5.25, mCamara: 5.75, mVa0: 6.55, mVa1: 7.05, mPulsa0: 7.05, mPulsa: 7.3, mVuelve0: 7.55, mVuelve1: 8.1,
    apaga: 7.32,
    tambalea0: 8.9, tambalea1: 10.4,
    mQuita0: 9.45, mQuita1: 9.9, mPregunta0: 10.05, mPregunta1: 10.45,
    gQue0: 10.6, gQue1: 11.0, mEncoge2: 11.55,
    fin: 12.65
  };

  /* ---------- decorado: puntos fijos (pantalla) ---------- */
  const HORN = { x: 703, y: 206, r: 30 };             // boca de la bocina (apunta a la izquierda)
  const BOTON = { x: 716, y: 300 };                    // cara de arriba del botón
  const BEACON = [{ x: 868, y: 30, col: [255, 60, 50], fase: 0 }, { x: 1000, y: 30, col: [70, 140, 255], fase: Math.PI }];
  const XG0 = 470, XG1 = 598, XM0 = 862, XM1 = 806;

  /* ---------- utilidades de posturas ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function guion(lista, tabla, t, base) {
    let c = tabla[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, tabla[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const P0 = { pel: 0, torso: 0, cab: 0, cx: 40, cy: 300, ca: 0, cmu: -1.75, cp: 0, lx: 0, ly: 280, la: 0, lmu: -1.75, lp: 0,
    c0: 0, c1: 0, c2: 0, c3: 0, c4: 0, l0: 0, l1: 0, l2: 0, l3: 0, l4: 0 };
  const C_ = o => Object.assign({}, P0, o);
  const dedos = (b, ch) => ({ pulgar: b[ch + "0"], indice: b[ch + "1"], medio: b[ch + "2"], anular: b[ch + "3"], menique: b[ch + "4"] });
  const ABC = { c0: 1, c1: 1, c2: 1, c3: 1, c4: 1 }, ABL = { l0: 1, l1: 1, l2: 1, l3: 1, l4: 1 };
  const INDL = { l0: 0, l1: 1, l2: 0, l3: 0, l4: 0 };
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, 0, -1.75), l: punoDesde({ x: 372, y: 648 }, 0, -1.75) };
  function parpadeos(lista, t) {
    let o = 0;
    for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); }
    return o;
  }
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: 0,
      ojos: { d: Math.max(e.c, e.cd, parp), i: Math.max(e.c, e.ci, parp), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  const BASEC = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, mof: 0 };
  const E = o => Object.assign({}, BASEC, o);

  // intensidad del soplido de la sirena (0…1) y del aleteo (sigue al viento)
  const viento = t => tramo(t, T.sopla - 0.02, T.sopla + 0.1, salida) * (1 - tramo(t, T.apaga, T.apaga + 0.18));
  // cuánto se le ha ido el pelo hacia atrás (se queda así hasta el final)
  const peloAtras = t => tramo(t, T.sopla - 0.02, T.sopla + 0.12, salida);

  /* ---------- Guillermo ---------- */
  const CUERPOS_G = {
    bolsillos: C_({}),
    mira: C_({ torso: -0.03, cab: -0.06 }),
    senala: C_(Object.assign({ torso: 0.02, cab: 0.02, lx: 175, ly: 70, la: 0, lmu: -3.05, lp: 1 }, INDL)),
    frota: C_({ torso: 0.04, cab: 0.03, cx: 205, cy: 205, cmu: -1.0, cp: 1, lx: -45, ly: 200, lmu: -2.4, lp: 1,
      c0: 0.6, c1: 0.85, c2: 0.85, c3: 0.85, c4: 0.8, l0: 0.6, l1: 0.85, l2: 0.85, l3: 0.85, l4: 0.8 }),
    pulsa: C_(Object.assign({ torso: 0.1, cab: 0.08, cx: 130, cy: 300, cmu: -1.5, cp: 1, lmu: -1.75, lp: 1,
      c0: 0.3, c1: 0.35, c2: 0.35, c3: 0.35, c4: 0.35 }, INDL)),
    asoma: C_({ torso: 0.3, cab: 0.16, pel: 26, cx: 205, cy: 405, cmu: -1.3, cp: 1, lx: 70, ly: 360, lmu: -1.5, lp: 1,
      c0: 0.5, c1: 0.6, c2: 0.6, c3: 0.6, c4: 0.6, l0: 0.5, l1: 0.6, l2: 0.6, l3: 0.6, l4: 0.6 }),
    soplo: C_(Object.assign({ torso: 0.24, cab: -0.06, pel: 22, cx: -225, cy: 110, cmu: -0.2, cp: 1, lx: 150, ly: 45, lmu: -4.3, lp: 1 }, ABC, ABL)),
    resiste: C_(Object.assign({ torso: 0.4, cab: 0.06, pel: 34, cx: 175, cy: 215, cmu: -3.0, cp: 1, lx: 190, ly: 40, lmu: -3.7, lp: 1 }, ABC, ABL)),
    congela: C_(Object.assign({ torso: 0.26, cab: -0.04, pel: 22, cx: -225, cy: 110, cmu: -0.2, cp: 1, lx: 150, ly: 45, lmu: -4.3, lp: 1 }, ABC, ABL)),
    afloja: C_({ torso: 0.08, cab: 0.04, pel: 10, cx: 30, cy: 315, cmu: -1.6, cp: 1, lx: 30, ly: 300, lmu: -1.75, lp: 1,
      c0: 0.6, c1: 0.7, c2: 0.65, c3: 0.6, c4: 0.55, l0: 0.6, l1: 0.7, l2: 0.65, l3: 0.6, l4: 0.55 }),
    que: C_({ torso: 0.04, cab: 0.1, pel: 8, cp: 1, cmu: -2.6, lx: 30, ly: 300, lmu: -1.75, lp: 1,
      c0: 0.55, c1: 0.9, c2: 0.9, c3: 0.9, c4: 0.85, l0: 0.6, l1: 0.7, l2: 0.65, l3: 0.6, l4: 0.55 })
  };
  const GUION_G = [
    [T.mira, T.mira + 0.4, "mira"], [T.senala0, T.senala1, "senala"], [T.senalaFin + 0.05, T.anda0 + 0.25, "frota"],
    [T.pulsa0, T.pulsa0 + 0.2, "pulsa"], [T.asoma0 - 0.1, T.asoma1, "asoma"], [T.sopla - 0.01, T.sopla + 0.09, "soplo", salida],
    [T.resiste0, T.resiste0 + 0.3, "resiste"], [T.empuje2, T.empuje2 + 0.16, "soplo", salida], [T.apaga + 0.02, T.apaga + 0.22, "congela"],
    [T.tambalea0 + 0.1, T.tambalea0 + 0.9, "afloja"], [T.gQue0, T.gQue1, "que"], [T.mEncoge2 + 0.4, T.mEncoge2 + 0.8, "afloja"]
  ];
  const CARAS_G = {
    inicio: E({ mx: 0.9, my: -0.1 }),
    admira: E({ mx: 0.95, my: -0.45, iris: 1.08, sd: 14, gd: 0.1, si: 10, gi: 0.08, orig: 0, sonr: 0.65, ancho: 0.95, abre: 6 }),
    pregunta: E({ mx: 0.95, my: -0.12, sd: 22, gd: 0.18, si: 6, gi: 0.02, orig: 0, abre: 9, ancho: 0.55, sonr: 0.2 }),
    picaro: E({ mx: 0.95, my: 0.15, sd: -4, gd: -0.12, si: 12, gi: 0.08, orig: 0, sonr: 0.85, ancho: 1.0 }),
    pulsa: E({ mx: 0.9, my: 0.55, sd: 8, gd: 0.05, si: 8, gi: 0.05, orig: 0, abre: 12, ancho: 0.75, sonr: 0.45, lengua: 1 }),
    asoma: E({ mx: 1, my: 0.05, iris: 1.18, ci: 0.8, sd: 24, gd: 0.18, si: -6, gi: -0.12, orig: 0, abre: 8, ancho: 0.5, sonr: 0.0 }),
    soplado: E({ mx: 0, my: 0, c: 1, z: 1, sd: 30, gd: 0.25, si: 30, gi: 0.25, orig: 0, abre: 20, ancho: 1.32, sonr: -0.7, lengua: 0 }),
    resiste: E({ mx: 0.9, my: 0, c: 0.75, z: 1, sd: -8, gd: -0.2, si: -8, gi: -0.2, orig: 0, abre: 8, ancho: 1.2, sonr: -0.65, lengua: 0 }),
    congela: E({ mx: 0.9, my: -0.05, iris: 0.62, sd: 32, gd: 0.22, si: 32, gi: 0.22, orig: 0, abre: 24, ancho: 1.1, sonr: -0.25, lengua: 0.3 }),
    aturdido: E({ mx: 0.3, my: 0.1, iris: 0.8, c: 0.3, sd: 10, gd: 0.1, si: 16, gi: 0.15, orig: 0, abre: 12, ancho: 0.75, sonr: -0.1, lengua: 0.6 }),
    que: E({ mx: 0.95, my: -0.05, iris: 1.05, sd: 26, gd: 0.2, si: 2, gi: -0.05, orig: 0, abre: 15, ancho: 0.55, sonr: -0.05, lengua: 0.2 }),
    fin: E({ mx: -0.85, my: -0.1, iris: 0.85, c: 0.25, sd: 14, gd: 0.1, si: 18, gi: 0.15, orig: 0, abre: 8, ancho: 0.8, sonr: -0.05 })
  };
  const GUION_CARA_G = [
    [T.mira, T.mira + 0.3, "admira"], [T.senala0 + 0.1, T.senala1 + 0.1, "pregunta"], [T.mEncoge1, T.mEncoge1 + 0.25, "picaro"],
    [T.pulsa0, T.pulsa0 + 0.2, "pulsa"], [T.asoma0, T.asoma0 + 0.3, "asoma"], [T.sopla - 0.01, T.sopla + 0.06, "soplado"],
    [T.resiste0, T.resiste0 + 0.2, "resiste"], [T.empuje2, T.empuje2 + 0.1, "soplado"], [T.apaga + 0.04, T.apaga + 0.2, "congela"],
    [T.tambalea0, T.tambalea0 + 0.6, "aturdido"], [T.gQue0, T.gQue0 + 0.25, "que"], [T.mEncoge2 + 0.3, T.mEncoge2 + 0.7, "fin"]
  ];
  const PARP_G = [0.95, 2.05, 3.0, 9.5, 11.3, 12.2];

  // posición x de Guillermo (pelvis en pantalla)
  function xG(t) {
    let x = lerp(XG0, XG1, tramo(t, T.anda0, T.anda1, suave));
    x -= 125 * tramo(t, T.empuje0, T.empuje1, salida);
    x += 10 * Math.sin((t - T.resiste0) * 9) * campana(t, T.resiste0, T.resiste1);           // pelea contra el viento
    x -= 165 * tramo(t, T.empuje2, T.empuje3, (k) => suave(k) * 0.4 + salida(k) * 0.6);
    x -= 8 * campana(t, T.asoma0 - 0.05, T.sopla) * 0;                                         // (sin retroceso al asomarse)
    return x;
  }
  // pies (px de pantalla): andar dos pasos, abrirse al recibir el soplido, patinar y pelear
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  function piesG(t, x) {
    // al andar, tres pasos: medio paso del lejano, uno entero del cercano y el lejano se junta
    const D = XG1 - XG0, du = (T.anda1 - T.anda0) / 3;
    const a1 = fase(t, T.anda0, T.anda0 + du * 1.15), a2 = fase(t, T.anda0 + du * 0.95, T.anda0 + du * 2.1), a3 = fase(t, T.anda0 + du * 1.9, T.anda1);
    const xa = lerp(XG0, XG1, tramo(t, T.anda0, T.anda1, suave));
    let lejos = { x: XG0 + 18 + D * (0.5 * suave5(a1) + 0.5 * suave5(a3)), y: 0, ang: 0 }, cerca = { x: XG0 - 19 + D * suave5(a2), y: 0, ang: 0 };
    const al1 = Math.sin(Math.PI * a1) + Math.sin(Math.PI * a3), al2 = Math.sin(Math.PI * a2);
    lejos.y = -40 * al1; lejos.ang = -0.18 * al1;
    cerca.y = -46 * al2; cerca.ang = -0.2 * al2;
    // a partir de aquí los pies van con el cuerpo (que patina)
    const dx = x - xa;
    lejos.x += dx; cerca.x += dx;
    // postura de aguante: pie lejano adelante y cercano atrás (paso de reflejo al llegar el soplido)
    const abre = tramo(t, T.sopla, T.sopla + 0.16, salida);
    cerca.x -= 46 * abre; cerca.y -= 34 * campana(t, T.sopla, T.sopla + 0.16);
    lejos.x += 14 * abre;
    // pelea: pasitos en el sitio, alternos, que el viento le devuelve
    const pel = campana(t, T.resiste0, T.resiste1) > 0 ? 1 : 0;
    if (pel) {
      const u = (t - T.resiste0) * 3.2;
      cerca.y -= 30 * Math.max(0, Math.sin(u * Math.PI)); cerca.x += 14 * Math.max(0, Math.sin(u * Math.PI));
      lejos.y -= 30 * Math.max(0, -Math.sin(u * Math.PI)); lejos.x += 14 * Math.max(0, -Math.sin(u * Math.PI));
      const env = campana(t, T.resiste0, T.resiste1);
      cerca.y *= Math.min(1, env * 3); lejos.y *= Math.min(1, env * 3);
    }
    // talones clavados mientras patina
    const patina = viento(t);
    cerca.ang += -0.12 * patina; lejos.ang += -0.08 * patina;
    // al tambalearse, un pasito para no caerse
    const tb = campana(t, T.tambalea0 + 0.55, T.tambalea0 + 0.85);
    lejos.y -= 26 * tb; lejos.x += 10 * tramo(t, T.tambalea0 + 0.55, T.tambalea0 + 0.85);
    return { cerca: { x: cerca.x, y: TOB_G.cerca + cerca.y, ang: cerca.ang }, lejos: { x: lejos.x, y: TOB_G.lejos + lejos.y, ang: lejos.ang } };
  }
  const boton = () => ({ x: BOTON.x, y: BOTON.y + 2 });
  let cacheG = new Map();
  function poseG(t) {
    const key = Math.round(t * 1e5); if (cacheG.has(key)) return cacheG.get(key);
    if (cacheG.size > 400) cacheG = new Map();
    const b = guion(GUION_G, CUERPOS_G, t, "bolsillos"), e = guion(GUION_CARA_G, CARAS_G, t, "inicio");
    const respira = Math.sin(t * 2.2), x = xG(t), v = viento(t);
    const p = {
      x, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.3 }, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      cara: cara(e, parpadeos(PARP_G, t)), tirasLimpias: true, ikContinuo: true
    };
    const pies = piesG(t, x);
    for (const lado of ["cerca", "lejos"]) { const f = pies[lado]; p.piernas[lado] = { tob: { x: G.PELVIS.x + (f.x - x) / S, y: f.y }, ang: f.ang }; }
    // temblor del viento: todo el cuerpo vibra
    p.torso += 0.025 * ruido(t * 24) * v; p.cabeza.ang += 0.04 * ruido(t * 29 + 3) * v;
    p.cabeza.dy += 4 * ruido(t * 31 + 8) * v;
    // tambaleo final: péndulo que se va calmando
    const tamb = tramo(t, T.tambalea0, T.tambalea0 + 0.3) * (1 - tramo(t, T.tambalea1, T.tambalea1 + 0.6));
    const ph = (t - T.tambalea0) * 4.2;
    p.torso += 0.09 * Math.sin(ph) * tamb; p.cabeza.ang += 0.12 * Math.sin(ph - 0.6) * tamb;
    p.pelvis.x += 10 * Math.sin(ph + 0.4) * tamb;
    // rojo del esfuerzo al pelear contra el viento
    p.rojo = 0.35 * campana(t, T.resiste0 - 0.1, T.resiste1 + 0.2);
    p.cara.rubor = p.rojo;
    // mofletes que flamean
    p.cara.mofletes = Math.max(e.mof, v * (0.55 + 0.45 * Math.sin(t * 44)) * (1 - 0.6 * campana(t, T.resiste0, T.resiste1)));
    // boca: los labios aletean
    p.cara.boca.abre += 8 * Math.sin(t * 38) * v * (1 - campana(t, T.resiste0, T.resiste1));
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    let c = { x: hc.x + b.cx, y: hc.y + b.cy }, l = { x: hl.x + b.lx, y: hl.y + b.ly };
    const bc = Tr(BOLS_G.c), bl = Tr(BOLS_G.l);
    c = mezcla(c, bc, (1 - clamp(b.cp * 1.5)) * (1 - b.cp)); l = mezcla(l, bl, (1 - clamp(b.lp * 1.5)) * (1 - b.lp));
    const H = q => G.aHoja(p, q);
    // frotarse las manos: vaivén
    const fr = campana(t, T.senalaFin + 0.1, T.pulsa0 + 0.1);
    c.x += 16 * Math.sin(t * 16) * fr; l.x -= 16 * Math.sin(t * 16) * fr;
    // pulsar: la punta del índice baja hasta el botón
    const kp = tramo(t, T.pulsa0, T.pulsa - 0.04) * (1 - tramo(t, T.suelta, T.asoma0 + 0.15));
    if (kp > 0) {
      const bt = boton(), hund = 5 * campana(t, T.pulsa - 0.06, T.suelta);
      l = mezcla(l, H({ x: bt.x - 2, y: bt.y - 15 + hund }), kp);
    }
    // aleteo de los brazos con el viento
    const al = v * (1 - 0.5 * campana(t, T.resiste0, T.resiste1));
    c.x += 18 * ruido(t * 13) * al; c.y += 26 * Math.sin(t * 19) * al;
    l.x += 16 * ruido(t * 12 + 5) * al; l.y += 22 * Math.sin(t * 17 + 1.3) * al;
    // «¿qué?»: mano cercana abierta detrás de la oreja
    const kq = tramo(t, T.gQue0, T.gQue1) * (1 - tramo(t, T.mEncoge2 + 0.4, T.mEncoge2 + 0.8));
    if (kq > 0) c = mezcla(c, G.cabeza(p).a({ x: 520, y: 600 }), kq);
    const ang = (b) => b;
    p.manoCerca = { x: c.x, y: c.y, ang: b.ca + 0.25 * Math.sin(t * 21) * al, mu: b.cmu, dobla: -1, puno: b.cp, dedos: dedos(b, "c") };
    p.manoLejos = { x: l.x, y: l.y, ang: b.la + 0.25 * Math.sin(t * 23 + 1) * al, mu: b.lmu, dobla: -1, puno: b.lp, dedos: dedos(b, "l") };
    // pelo hacia atrás, flameo de la cara y lágrimas: capa sobre la cabeza
    const pa = peloAtras(t);
    if (pa > 0.001) p.capaCabeza = g => peloVolado(g, t, pa, v);
    cacheG.set(key, p);
    return p;
  }

  /* ---------- Marcos ---------- */
  const TOB_M = { cerca: MB.SUELO - MB.TOBILLO_ALTO, lejos: MB.SUELO - MB.TOBILLO_ALTO - 6 };
  const PIES_M = { cerca: -128, lejos: 132 };
  const OREJA_M = { x: 630, y: 612 };
  const CUERPOS_M = {
    base: C_({}),
    mira: C_({ cab: 0.04 }),
    adelante: C_(Object.assign({ cab: 0.1, lx: 205, ly: 160, la: 0.1, lmu: -2.55, lp: 1 }, ABL)),
    tapon: C_({ cab: -0.06, cp: 1, cmu: -2.4, c0: 0.6, c1: 0.55, c2: 0.2, c3: 0.15, c4: 0.15 }),
    calma: C_({ cab: -0.03 }),
    unas: C_({ cab: 0.2, lx: 120, ly: 45, la: 0.5, lmu: -2.4, lp: 1, l0: 0.25, l1: 0.55, l2: 0.55, l3: 0.55, l4: 0.55 }),
    pulsa: C_(Object.assign({ torso: 0.08, cab: 0.06, lmu: -1.75, lp: 1 }, INDL)),
    quita: C_({ cab: -0.06, cp: 1, cmu: -2.4, c0: 0.6, c1: 0.55, c2: 0.2, c3: 0.15, c4: 0.15 }),
    pregunta: C_({ cab: 0.06, cp: 1, cx: 60, cy: 330, cmu: -1.7, c0: 0.6, c1: 0.55, c2: 0.2, c3: 0.15, c4: 0.15,
      lx: 215, ly: 210, lmu: -2.6, lp: 1, l0: 1, l1: 1, l2: 1, l3: 1, l4: 1 }),
    ofrece: C_({ cab: -0.04, cp: 1, cx: 300, cy: 150, cmu: -3.0, c0: 0.55, c1: 0.75, c2: 0.75, c3: 0.75, c4: 0.7 })
  };
  const GUION_M = [
    [T.mMira, T.mMira + 0.25, "mira"], [T.mEncoge0, T.mEncoge1, "adelante"],
    [T.mTapon0, T.mTapon0 + 0.3, "base"], [T.mTapon0 + 0.25, T.mTapon1, "tapon"], [T.mTapon2, T.mTaponFin, "calma"], [T.mUnas0, T.mUnas1, "unas"], [T.mCamara, T.mCamara + 0.3, "calma"],
    [T.mPulsa0, T.mPulsa - 0.02, "pulsa"], [T.mVuelve0, T.mVuelve0 + 0.35, "calma"], [T.mQuita0, T.mQuita0 + 0.25, "quita"],
    [T.mPregunta0, T.mPregunta1, "pregunta"], [T.mEncoge2, T.mEncoge2 + 0.35, "ofrece"]
  ];
  const CARAS_M = {
    inicio: E({ mx: 0.6, my: 0.2, c: 0.1, orig: 1 }),
    mira: E({ mx: 0.95, my: 0.05, sd: 6, si: 6, orig: 0, sonr: 0.25, ancho: 0.9 }),
    picaro: E({ mx: 0.95, my: 0.05, sd: 16, gd: 0.12, si: -2, gi: -0.05, orig: 0, sonr: 0.7, ancho: 1, ci: 0.15 }),
    tapon: E({ mx: -0.4, my: 0.2, c: 0.45, sd: 8, si: 8, orig: 0, sonr: 0.45, ancho: 0.95 }),
    calma: E({ mx: 0, my: 0, c: 0.85, h: 1, sd: 6, si: 6, orig: 0, sonr: 0.55, ancho: 0.95 }),
    unas: E({ mx: 0.4, my: 0.75, c: 0.45, sd: 4, si: 4, orig: 0, sonr: 0.25, ancho: 0.85 }),
    camara: E({ mx: -0.85, my: -0.15, c: 0.25, sd: 14, gd: 0.1, si: 4, gi: 0.02, orig: 0, sonr: 0.45, ancho: 0.95 }),
    pulsa: E({ mx: 0.9, my: 0.5, c: 0.3, sd: 2, si: 2, orig: 0, sonr: 0.3, ancho: 0.9 }),
    mira2: E({ mx: 0.95, my: 0.05, sd: 12, gd: 0.08, si: 12, gi: 0.08, orig: 0, sonr: 0.35, ancho: 0.9 }),
    pregunta: E({ mx: 0.95, my: 0.0, sd: 18, gd: 0.12, si: 18, gi: 0.12, orig: 0, abre: 8, ancho: 0.7, sonr: 0.3 }),
    encoge2: E({ mx: -0.85, my: -0.1, c: 0.3, sd: 20, gd: 0.15, si: 2, gi: -0.05, orig: 0, sonr: 0.35, ancho: 0.9 })
  };
  const GUION_CARA_M = [
    [T.mMira, T.mMira + 0.25, "mira"], [T.mEncoge0, T.mEncoge0 + 0.2, "picaro"], [T.mTapon0 + 0.2, T.mTapon0 + 0.45, "tapon"],
    [T.mTaponFin, T.mTaponFin + 0.35, "calma"], [T.mUnas0, T.mUnas0 + 0.25, "unas"], [T.mCamara, T.mCamara + 0.25, "camara"],
    [T.mVa0, T.mVa0 + 0.2, "pulsa"], [T.mVuelve0 + 0.1, T.mVuelve0 + 0.35, "mira2"], [T.mPregunta0, T.mPregunta0 + 0.2, "pregunta"],
    [T.mEncoge2, T.mEncoge2 + 0.25, "encoge2"]
  ];
  const PARP_M = [0.75, 1.75, 2.45, 8.4, 9.2, 11.0, 12.3];
  function xM(t) {
    return lerp(XM0, XM1, tramo(t, T.mVa0, T.mVa1, suave)) + (XM0 - XM1) * tramo(t, T.mVuelve0, T.mVuelve1, suave);
  }
  // pies de Marcos (hoja): dos pasos al ir y al volver, y el pie de delante marcando el ritmo
  function piesM(t, p) {
    const ps = { cerca: { x: MB.PELVIS.x + PIES_M.cerca, y: TOB_M.cerca, ang: 0 }, lejos: { x: MB.PELVIS.x + PIES_M.lejos, y: TOB_M.lejos, ang: 0 } };
    const k = p.s * MB.K;
    for (const [t0, t1, sg] of [[T.mVa0, T.mVa1, 1], [T.mVuelve0, T.mVuelve1, -1]]) {
      const d = (XM0 - XM1) / k * sg;                      // hacia delante en la hoja (+x) al ir hacia la izquierda
      const a1 = fase(t, t0, t0 + (t1 - t0) * 0.55), a2 = fase(t, t0 + (t1 - t0) * 0.45, t1);
      const tot = tramo(t, t0, t1, suave);
      // el cuerpo avanza «tot»; cada pie compensa: va retrasado y luego da su paso
      const pl = sg > 0 ? "lejos" : "cerca", pc = sg > 0 ? "cerca" : "lejos";
      if (t > t0 && t < t1 + 0.01) {
        ps[pl].x += d * (suave5(a1) - tot); ps[pl].y -= 40 * Math.sin(Math.PI * a1);
        ps[pc].x += d * (suave5(a2) - tot); ps[pc].y -= 40 * Math.sin(Math.PI * a2);
      }
    }
    // golpecitos con la punta del pie (aburrido)
    const tap = campana(t, T.mUnas0 - 0.2, T.mVa0 - 0.05);
    ps.lejos.ang = -0.18 * Math.max(0, Math.sin((t - T.mUnas0) * 9)) * Math.min(1, tap * 3);
    return ps;
  }
  let cacheM = new Map();
  function poseM(t, pg) {
    const key = Math.round(t * 1e5); if (cacheM.has(key)) return cacheM.get(key);
    if (cacheM.size > 400) cacheM = new Map();
    const b = guion(GUION_M, CUERPOS_M, t, "base"), e = guion(GUION_CARA_M, CARAS_M, t, "inicio");
    const respira = Math.sin(t * 2.0 + 1.1);
    const p = {
      x: xM(t), suelo: SUELO, s: S, espejo: true,
      pelvis: { x: MB.PELVIS.x, y: MB.PELVIS.y + b.pel + respira * 1.4 }, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      cara: cara(e, parpadeos(PARP_M, t)), tirasLimpias: true, ikContinuo: true
    };
    const pies = piesM(t, p);
    for (const lado of ["cerca", "lejos"]) p.piernas[lado] = { tob: { x: pies[lado].x, y: pies[lado].y }, ang: pies[lado].ang };
    // cabeceo tranquilo con los tapones puestos, como si oyera música
    const musica = campana(t, T.mTaponFin, T.mUnas0 + 0.1) + campana(t, T.mCamara + 0.3, T.mVa0 + 0.05);
    p.cabeza.ang += 0.05 * Math.sin(t * 7) * musica;
    const Tr = MB.tronco(p), hc = Tr(MB.HOMBRO_C), hl = Tr(MB.HOMBRO);
    const H = q => MB.aHoja(p, q);
    const rC = MB.manoReposo(p, "cerca"), rL = MB.manoReposo(p, "lejos");
    let c = { x: hc.x + b.cx, y: hc.y + b.cy }, l = { x: hl.x + b.lx, y: hl.y + b.ly };
    c = mezcla(rC, c, b.cp); l = mezcla(rL, l, b.lp);
    // tapones: la mano cercana a la oreja visible, la lejana al otro lado del casco
    const cab = MB.cabeza(p);
    const oreja = cab.a(OREJA_M);
    const kT = tramo(t, T.mTapon0 + 0.25, T.mTapon1) * (1 - tramo(t, T.mTapon2 - 0.05, T.mTapon2 + 0.25));
    const kQ = tramo(t, T.mQuita0, T.mQuita0 + 0.25) * (1 - tramo(t, T.mQuita1, T.mPregunta1));
    const kO = Math.max(kT, kQ);
    if (kO > 0) c = mezcla(c, { x: oreja.x + 52, y: oreja.y + 30 }, kO);
    // apagar: el índice al botón
    const kP = tramo(t, T.mPulsa0, T.mPulsa - 0.02) * (1 - tramo(t, T.mVuelve0, T.mVuelve0 + 0.3));
    if (kP > 0) { const bt = boton(), hund = 5 * campana(t, T.mPulsa - 0.04, T.mPulsa + 0.2); l = mezcla(l, H({ x: bt.x + 2, y: bt.y - 15 + hund }), kP); }
    p.manoCerca = { x: c.x, y: c.y, ang: b.ca, mu: lerp(rC.mu ?? -1.75, b.cmu, b.cp), dobla: -1, puno: 1,
      dedos: b.cp > 0.01 ? dedos(b, "c") : rC.dedos };
    p.manoLejos = { x: l.x, y: l.y, ang: b.la, mu: b.lmu, dobla: 1, puno: lerp(0, 1, clamp(b.lp * 1.6)), dedos: dedos(b, "l") };
    if (b.lp < 0.02) p.manoLejos = Object.assign({}, rL);
    // tapón en la mano mientras lo lleva y después de quitárselo
    const enMano = (t > T.mTapon0 + 0.15 && t < T.mTapon1 + 0.05) || (t > T.mQuita0 + 0.2 && t < T.mEncoge2);
    if (enMano) { const m = p.manoCerca; m.objeto = g => { g.save(); g.translate(4, 10); tapon(g, 1); g.restore(); }; }
    p.taponOfrecido = t >= T.mEncoge2 ? tramo(t, T.mEncoge2, T.mEncoge2 + 0.3) : 0;
    // tapones puestos: capa sobre la cabeza
    const puesto = t >= T.mTapon1 && t < T.mQuita0 + 0.2;
    if (puesto) p.capaCabeza = g => taponOreja(g, OREJA_M, 0);
    cacheM.set(key, p);
    return p;
  }
  function pose(t) { const g = poseG(t); return { g, m: poseM(t, g) }; }

  /* ---------- tapones ---------- */
  function tapon(g, k) {                // en unidades de mano: cilindro de espuma naranja
    g.save(); g.scale(k, k); g.lineJoin = "round";
    g.fillStyle = "#ff8a1f"; g.strokeStyle = TINTA; g.lineWidth = 1.4;
    g.beginPath(); g.ellipse(0, 0, 4.2, 6.5, 0.2, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,230,180,0.85)"; g.beginPath(); g.ellipse(-1.4, -2.2, 1.3, 2.2, 0.2, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function taponOreja(g, o, lado) {     // retrato de Marcos
    g.save(); g.translate(o.x, o.y); g.rotate(lado ? 0.4 : -0.3); g.lineJoin = "round";
    g.fillStyle = "#ff8a1f"; g.strokeStyle = TINTA; g.lineWidth = 6;
    g.beginPath(); g.ellipse(0, 0, lado ? 12 : 18, lado ? 16 : 24, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,230,180,0.85)"; g.beginPath(); g.ellipse(-5, -7, 5, 8, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  /* ---------- pelo hacia atrás (retrato de Guillermo) ---------- */
  // Zonas del retrato que se conservan al borrar las púas (piel y frente), igual que en la 00021.
  const PIEL = [956,503,938,501,918,520,896,531,895,526,907,504,907,491,894,491,867,505,845,509,873,470,873,457,854,448,853,442,830,439,824,431,801,432,799,438,779,437,729,464,736,428,723,428,679,454,676,477,649,496,635,536,629,543,624,542,619,526,589,500,572,499,556,507,544,522,531,568,530,593,539,614,572,657,572,664,527,801,521,812,492,833,492,853,738,853,738,847,704,811,705,806,741,830,769,840,767,853,801,853,802,845,812,843,822,835,907,719,932,645,954,612,954,594,892,588,891,583,896,578,941,581,947,587,960,586,964,518,957,516];
  const FRENTE = [[640,482],[720,452],[830,452],[930,470],[985,500],[1000,570],[960,615],[640,600]];
  const CAJA = [[160,20],[1400,20],[1400,690],[160,690]];
  // flequillo (borde de abajo del pelo, de delante a atrás) y contorno de arriba aplastado por el viento
  const FLEQUILLO = [[1062,500],[1042,552],[1028,522],[1004,570],[984,526],[954,566],[934,522],[902,556],[882,515],[848,540],[826,498],[792,515],[770,478],[728,486],[690,466],[656,488],[642,530],[632,575],[618,528],[598,505],[574,502],[556,520],[546,560],[536,606]];
  // púas hacia atrás: [punta x, punta y, valle x, valle y] de abajo arriba
  const PUAS_V = [[340,585, 505,525], [262,505, 488,452], [228,425, 492,388], [262,342, 520,330], [352,276, 590,290]];
  const ARRIBA = [[690,262],[790,250],[890,258],[972,284],[1036,330],[1074,394],[1080,456]];
  const CENTRO_C = { x: 800, y: 470 };
  function siluetaPelo(t, v, e) {         // e: escala (para la máscara de borrado); v: viento (aleteo)
    const pts = FLEQUILLO.map(([x, y]) => ({ x, y }));
    PUAS_V.forEach(([px, py, vx, vy], i) => {
      const fl = v * (12 * Math.sin(t * 31 + i * 1.7) + 6 * Math.sin(t * 53 + i));
      const lx = v * 16 * Math.sin(t * 27 + i * 2.3);
      pts.push({ x: px + lx, y: py + fl }); pts.push({ x: vx, y: vy + fl * 0.3 });
    });
    ARRIBA.forEach(([x, y], i) => pts.push({ x, y: y + v * 3 * Math.sin(t * 40 + i * 1.3) }));
    if (e === 1) return pts;
    return pts.map(q => ({ x: CENTRO_C.x + (q.x - CENTRO_C.x) * e, y: CENTRO_C.y + (q.y - CENTRO_C.y) * e }));
  }
  let MATRIZ = null, fondo = null;
  function ruta(g, pts) { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); }
  function rutaPiel(g) { g.moveTo(PIEL[0], PIEL[1]); for (let i = 2; i < PIEL.length; i += 2) g.lineTo(PIEL[i], PIEL[i + 1]); g.closePath(); }
  function rutaPts(g, pts) { g.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y); g.closePath(); }
  function peloVolado(g, t, k, v) {
    // 1) borrar el pelo de punta: se repinta el fondo fuera de (pelo nuevo ∪ piel ∪ frente)
    if (MATRIZ && fondo) {
      const mas = siluetaPelo(t, v, lerp(1.75, 1, k));
      g.save();
      g.beginPath(); ruta(g, CAJA); rutaPts(g, mas); g.clip("evenodd");
      g.beginPath(); ruta(g, CAJA); rutaPiel(g); g.clip("evenodd");
      g.beginPath(); ruta(g, CAJA); ruta(g, FRENTE); g.clip("evenodd");
      g.setTransform(MATRIZ); g.drawImage(fondo, -40, -60);
      g.restore();
    }
    // 2) el pelo nuevo, tieso hacia atrás
    const pts = siluetaPelo(t, v, 1), forma = () => { g.beginPath(); rutaPts(g, pts); };
    g.save(); g.globalAlpha = k; g.lineJoin = "round"; g.lineCap = "round";
    forma(); g.fillStyle = "#86492a"; g.fill();
    g.save(); forma(); g.clip();
    // sombra de abajo y mechas oscuras y claras en la dirección del viento
    g.fillStyle = "#5c2f17"; g.beginPath(); g.moveTo(1062, 505); g.lineTo(536, 610); g.lineTo(200, 600); g.lineTo(200, 470); g.lineTo(560, 470); g.lineTo(900, 470); g.closePath(); g.fill();
    g.strokeStyle = "#4a2611"; g.lineWidth = 9;
    for (let i = 0; i < 7; i++) {
      const y0 = 290 + i * 34, fl = v * 8 * Math.sin(t * 29 + i * 1.9);
      g.beginPath(); g.moveTo(1040 - i * 12, y0 + 40); g.quadraticCurveTo(700, y0 + 6 + fl, 260 + i * 10, y0 + 30 + fl * 1.6); g.stroke();
    }
    g.strokeStyle = "rgba(225,150,95,0.85)"; g.lineWidth = 10;
    for (let i = 0; i < 3; i++) {
      const y0 = 286 + i * 26, fl = v * 7 * Math.sin(t * 33 + i * 2.1);
      g.beginPath(); g.moveTo(1010 - i * 30, y0 + 22); g.quadraticCurveTo(760, y0 - 4 + fl, 420 - i * 30, y0 + 14 + fl * 1.4); g.stroke();
    }
    g.restore();
    forma(); g.lineWidth = 7; g.strokeStyle = TINTA; g.stroke();
    g.restore();
    // 3) la cara flamea: ondas que corren hacia atrás por la mejilla
    if (v > 0.01) {
      g.save(); g.lineCap = "round"; g.strokeStyle = "rgba(120,50,25,0.75)"; g.lineWidth = 5;
      for (let i = 0; i < 4; i++) {
        const ph = ((t * 3.4 + i / 4) % 1), x = lerp(900, 640, ph), a = Math.sin(Math.PI * ph) * v;
        g.globalAlpha = a; g.beginPath(); g.moveTo(x, 640); g.quadraticCurveTo(x - 26, 690, x + 4, 760); g.stroke();
      }
      g.restore();
    }
  }

  /* ---------- efectos ---------- */
  // giro del rotativo: arranca al pulsar, se para al apagar
  const W_MAX = 10;
  function anguloRot(t) {
    // integral de ω(t): rampa de subida 3.5→4.35, constante, rampa de bajada apaga→apaga+0.9
    const a0 = T.arranca, a1 = T.sopla, b0 = T.apaga, b1 = T.apaga + 0.9;
    const sub = Math.max(0, Math.min(t, a1) - a0), rampa1 = (sub * sub) / (2 * (a1 - a0)) * W_MAX;
    const cte = Math.max(0, Math.min(t, b0) - a1) * W_MAX;
    const u = Math.max(0, Math.min(t, b1) - b0), rampa2 = (u - u * u / (2 * (b1 - b0))) * W_MAX;
    return rampa1 + cte + rampa2;
  }
  const luzRot = t => tramo(t, T.arranca, T.arranca + 0.35) * (1 - tramo(t, T.apaga + 0.4, T.apaga + 1.1));
  function rotativos(g, t) {
    const th = anguloRot(t), L = luzRot(t);
    for (const b of BEACON) {
      const a = th + b.fase, cara = 0.5 + 0.5 * Math.cos(a);      // 1 = mira a cámara
      const [r, gg, bb] = b.col;
      // cúpula con el reflector que gira dentro
      g.save(); g.translate(b.x, b.y);
      g.beginPath(); g.moveTo(-20, 14); g.lineTo(-17, -6); g.quadraticCurveTo(0, -22, 17, -6); g.lineTo(20, 14); g.closePath();
      g.fillStyle = `rgba(${r},${gg},${bb},${0.55 + 0.35 * L * cara})`; g.fill();
      g.save(); g.clip();
      const rx = 14 * Math.sin(a);
      g.fillStyle = `rgba(255,255,230,${0.25 + 0.7 * L * cara})`; g.beginPath(); g.ellipse(rx, 2, 6 + 6 * cara, 10, 0, 0, Math.PI * 2); g.fill();
      g.restore();
      g.lineWidth = 2.4; g.strokeStyle = TINTA; g.stroke();
      g.fillStyle = "#2a2a30"; g.fillRect(-23, 13, 46, 7); g.strokeRect(-23, 13, 46, 7);
      g.restore();
      if (L <= 0.01) continue;
      g.save(); g.globalCompositeOperation = "lighter";
      // halo cuando el reflector mira hacia nosotros
      const hr = 70 + 60 * cara, halo = g.createRadialGradient(b.x, b.y, 4, b.x, b.y, hr);
      halo.addColorStop(0, `rgba(${r},${gg},${bb},${0.45 * L * cara})`); halo.addColorStop(1, `rgba(${r},${gg},${bb},0)`);
      g.fillStyle = halo; g.beginPath(); g.arc(b.x, b.y, hr, 0, Math.PI * 2); g.fill();
      // haz que barre la cochera (de derecha a izquierda cuando el reflector gira hacia la izquierda)
      const dirx = -Math.sin(a), alfa = 0.1 * L * clamp(0.3 + 0.7 * Math.abs(dirx)) * (0.6 + 0.4 * cara);
      const fx = b.x + dirx * 900, fy = 420;
      const gr = g.createLinearGradient(b.x, b.y, fx, fy);
      gr.addColorStop(0, `rgba(${r},${gg},${bb},${alfa})`); gr.addColorStop(1, `rgba(${r},${gg},${bb},0)`);
      g.fillStyle = gr; g.beginPath(); g.moveTo(b.x, b.y);
      const nx = -(fy - b.y), ny = fx - b.x, nl = Math.hypot(nx, ny) || 1, ab = 120 + 80 * cara;
      g.lineTo(fx + nx / nl * ab, fy + ny / nl * ab); g.lineTo(fx - nx / nl * ab, fy - ny / nl * ab); g.closePath(); g.fill();
      // mancha de luz en la pared que corre
      const mx = b.x + dirx * 520, my = 230, mg = g.createRadialGradient(mx, my, 10, mx, my, 160);
      mg.addColorStop(0, `rgba(${r},${gg},${bb},${0.15 * L * Math.abs(dirx)})`); mg.addColorStop(1, `rgba(${r},${gg},${bb},0)`);
      g.fillStyle = mg; g.fillRect(mx - 160, my - 160, 320, 320);
      g.restore();
    }
  }
  // ondas de sonido saliendo de la bocina (arcos hacia la izquierda)
  function ondas(g, t) {
    const pre = campana(t, T.arranca + 0.05, T.sopla + 0.05) * (t < T.sopla ? 1 : 0);
    const fuerte = viento(t);
    g.save(); g.lineCap = "round";
    if (pre > 0.01) {                    // rumor de arranque: arquitos pequeños que tiemblan
      for (let i = 0; i < 3; i++) {
        const ph = (t * 2.4 + i / 3) % 1, r = HORN.r + 6 + 34 * ph;
        g.globalAlpha = Math.sin(Math.PI * ph) * pre * 0.8; g.strokeStyle = "#fff6d0"; g.lineWidth = 3;
        g.beginPath(); g.arc(HORN.x + 10, HORN.y, r, Math.PI - 0.6, Math.PI + 0.6); g.stroke();
      }
    }
    if (fuerte > 0.01) {
      for (let i = 0; i < 7; i++) {
        const ph = (t * 1.9 + i / 7) % 1, r = HORN.r + 10 + 520 * ph, a = 0.32 + 0.06 * ph;
        g.globalAlpha = Math.sin(Math.PI * Math.min(1, ph * 1.15)) * fuerte * 0.5;
        g.strokeStyle = i % 2 ? "#ffffff" : "#fff3c4"; g.lineWidth = 4.5 * (1 - ph) + 1.5;
        g.beginPath(); g.arc(HORN.x + 14, HORN.y + 6 * ph, r, Math.PI - a, Math.PI + a); g.stroke();
      }
      // rayas de viento dentro del cono
      for (let i = 0; i < 26; i++) {
        const ph = (t * (2.2 + hash(i) * 1.4) + hash(i + 30)) % 1, d = 40 + 620 * ph;
        const ang = Math.PI + (hash(i + 60) - 0.5) * 0.52, x = HORN.x + Math.cos(ang) * d, y = HORN.y + Math.sin(ang) * d + 30 * ph * ph;
        const L = 26 + 40 * hash(i + 90);
        g.globalAlpha = Math.sin(Math.PI * ph) * fuerte * 0.55; g.strokeStyle = "#ffffff"; g.lineWidth = 2.2;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + L, y - 2); g.stroke();
      }
    }
    g.restore();
  }
  // la bocina vibra (líneas alrededor) y el botón
  function bocina(g, t) {
    const vib = Math.max(campana(t, T.arranca, T.sopla + 0.05) * (t < T.sopla ? 0.6 : 0), viento(t));
    if (vib > 0.01) {
      g.save(); g.strokeStyle = TINTA; g.lineWidth = 2.4; g.lineCap = "round"; g.globalAlpha = vib;
      for (const [dx, dy, a] of [[18, -40, -0.9], [40, -44, -0.5], [18, 42, 0.9], [40, 46, 0.5]]) {
        const j = 2 * Math.sin(t * 60 + dx);
        g.beginPath(); g.moveTo(HORN.x + dx + j, HORN.y + dy); g.lineTo(HORN.x + dx + Math.cos(a) * 12 + j, HORN.y + dy + Math.sin(a) * 12); g.stroke();
      }
      g.restore();
    }
  }
  function botonRojo(g, t) {
    const hundG = campana(t, T.pulsa - 0.06, T.suelta), hundM = campana(t, T.mPulsa - 0.04, T.mPulsa + 0.2);
    const h = 5 * Math.max(hundG, hundM), enc = luzRot(t);
    g.save(); g.translate(BOTON.x, BOTON.y + h); g.lineJoin = "round";
    g.fillStyle = "#7a0d14"; g.beginPath(); g.ellipse(0, 6 - h, 15, 5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = `rgb(${Math.round(lerp(214, 255, enc))},${Math.round(lerp(30, 90, enc))},${Math.round(lerp(40, 70, enc))})`;
    g.beginPath(); g.moveTo(-13, 6 - h); g.lineTo(-13, 0); g.ellipse(0, 0, 13, 6, 0, Math.PI, 0); g.lineTo(13, 6 - h); g.closePath(); g.fill();
    g.lineWidth = 2.2; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "#ff8a8a"; g.beginPath(); g.ellipse(0, 0, 13, 6, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(-4, -1.5, 4, 1.8, -0.2, 0, Math.PI * 2); g.fill();
    g.restore();
    // chispita al pulsar
    for (const t0 of [T.pulsa - 0.02, T.mPulsa - 0.01]) {
      const k = fase(t, t0, t0 + 0.25); if (k <= 0 || k >= 1) continue;
      g.save(); g.strokeStyle = `rgba(255,250,210,${1 - k})`; g.lineWidth = 2.4; g.lineCap = "round";
      for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.45, r0 = 16 + 10 * k; g.beginPath(); g.moveTo(BOTON.x + Math.cos(a) * r0, BOTON.y + Math.sin(a) * r0); g.lineTo(BOTON.x + Math.cos(a) * (r0 + 8), BOTON.y + Math.sin(a) * (r0 + 8)); g.stroke(); }
      g.restore();
    }
  }
  // lágrimas que el viento se lleva hacia atrás
  function lagrimas(g, t, pg) {
    const v = viento(t) * (1 - 0.7 * campana(t, T.resiste0, T.resiste1)); if (v <= 0.01) return;
    const cab = G.cabeza(pg);
    g.save();
    for (const [ex, ey, sem] of [[742, 566, 0], [872, 618, 5]]) {
      const o = G.aPantalla(pg, cab.a({ x: ex, y: ey }));
      for (let i = 0; i < 4; i++) {
        const ph = (t * 2.6 + hash(i + sem) ) % 1, x = o.x - 6 - 120 * ph, y = o.y + 4 - 10 * ph + 18 * ph * ph + 3 * Math.sin(t * 20 + i);
        g.globalAlpha = Math.sin(Math.PI * ph) * v; g.fillStyle = "#bfe8ff"; g.strokeStyle = "#1d3b52"; g.lineWidth = 1.4;
        const r = 2.6 + 1.6 * hash(i + 9 + sem);
        g.beginPath(); g.ellipse(x, y, r * 1.8, r, -0.1, 0, Math.PI * 2); g.fill(); g.stroke();
      }
    }
    g.restore();
  }
  // pitido de oídos: rayitas en zigzag y espirales junto a la oreja
  function pitido(g, t, pg) {
    const k = tramo(t, T.apaga + 0.08, T.apaga + 0.35) * (1 - tramo(t, T.mEncoge2 + 0.2, T.fin - 0.1));
    if (k <= 0.01) return;
    const extra = 1 + 0.6 * campana(t, T.gQue0, T.mEncoge2 + 0.2);
    const o = G.aPantalla(pg, G.cabeza(pg).a({ x: 560, y: 560 }));
    g.save(); g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = TINTA; g.lineWidth = 2.2;
    for (let i = 0; i < 3; i++) {
      const a = Math.PI + (i - 1) * 0.55, r0 = 16 + 4 * Math.sin(t * 30 + i), L = 14 * extra;
      g.globalAlpha = k * (0.7 + 0.3 * Math.sin(t * 24 + i * 2));
      g.beginPath();
      for (let j = 0; j <= 6; j++) {
        const d = r0 + L * j / 6, z = (j % 2 ? 1 : -1) * 3;
        const x = o.x + Math.cos(a) * d - Math.sin(a) * z, y = o.y + Math.sin(a) * d + Math.cos(a) * z;
        if (j) g.lineTo(x, y); else g.moveTo(x, y);
      }
      g.stroke();
    }
    // espirales que giran sobre la cabeza
    for (let i = 0; i < 2; i++) {
      const cx = o.x - 18 - i * 16, cy = o.y - 34 - i * 10, gi = t * 8 * (i ? -1 : 1);
      g.globalAlpha = k * 0.9; g.beginPath();
      for (let j = 0; j <= 24; j++) { const a = gi + j / 24 * Math.PI * 3.5, r = 1 + j / 24 * 7 * extra; const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.8; if (j) g.lineTo(x, y); else g.moveTo(x, y); }
      g.stroke();
    }
    g.restore();
  }
  // marcas de derrape en el suelo (de donde estaba a donde ha llegado)
  function derrape(g, t, pg) {
    if (t < T.sopla) return;
    const x0 = XG1 + 10, x1 = pg.x + 10;
    if (x0 - x1 < 2) return;
    g.save(); g.lineCap = "round";
    for (const [dx, dy, w] of [[-40, 2, 4], [20, -3, 3.5]]) {
      const gr = g.createLinearGradient(x1 + dx, 0, x0 + dx, 0);
      gr.addColorStop(0, "rgba(30,25,25,0.55)"); gr.addColorStop(1, "rgba(30,25,25,0.1)");
      g.strokeStyle = gr; g.lineWidth = w; g.beginPath(); g.moveTo(x1 + dx, SUELO + dy); g.lineTo(x0 + dx, SUELO + dy); g.stroke();
    }
    // polvillo que levanta al patinar
    const v = viento(t) * (pg.x < XG1 - 4 ? 1 : 0);
    if (v > 0.01) for (let i = 0; i < 6; i++) {
      const ph = (t * 3 + i / 6) % 1;
      g.globalAlpha = Math.sin(Math.PI * ph) * 0.35 * v; g.fillStyle = "#cfc3b0";
      g.beginPath(); g.ellipse(pg.x - 30 - 50 * ph + i * 8, SUELO - 6 - 14 * ph, 8 + 10 * ph, 5 + 5 * ph, 0, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  // papelitos y hojas que vuelan con el chorro de sonido
  function voladores(g, t) {
    const v = viento(t); if (v <= 0.01) return;
    g.save();
    for (let i = 0; i < 9; i++) {
      const ph = (t * (0.9 + 0.5 * hash(i + 3)) + hash(i + 7)) % 1, x = 690 - 760 * ph, y = 170 + 300 * hash(i + 11) + 40 * Math.sin(t * 3 + i) + 60 * ph;
      g.globalAlpha = Math.sin(Math.PI * ph) * v; g.save(); g.translate(x, y); g.rotate(t * (4 + 4 * hash(i)) + i);
      g.fillStyle = i % 3 ? "#f2e9d0" : "#d9a441"; g.strokeStyle = TINTA; g.lineWidth = 1.2;
      g.beginPath(); g.rect(-6, -4, 12, 8); g.fill(); g.stroke(); g.restore();
    }
    g.restore();
  }

  /* ---------- decorado ---------- */
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60); g.lineJoin = "round";
    // pared de arriba (crema) con ventanales al atardecer
    const pared = g.createLinearGradient(0, -60, 0, 300); pared.addColorStop(0, "#d8c49a"); pared.addColorStop(1, "#ead9b4");
    g.fillStyle = pared; g.fillRect(-40, -60, W + 80, 380);
    for (const x0 of [40, 300]) {
      const w = 210, y0 = -10, h = 150;
      const cielo = g.createLinearGradient(0, y0, 0, y0 + h); cielo.addColorStop(0, "#f2895b"); cielo.addColorStop(0.55, "#ffc27a"); cielo.addColorStop(1, "#ffe3a8");
      g.fillStyle = cielo; g.fillRect(x0, y0, w, h);
      // tejados al fondo
      g.fillStyle = "#b25c4a"; g.beginPath(); g.moveTo(x0, y0 + h); g.lineTo(x0, y0 + 112); g.lineTo(x0 + 50, y0 + 96); g.lineTo(x0 + 90, y0 + 118);
      g.lineTo(x0 + 140, y0 + 100); g.lineTo(x0 + w, y0 + 120); g.lineTo(x0 + w, y0 + h); g.closePath(); g.fill();
      g.fillStyle = "rgba(255,250,220,0.85)"; g.beginPath(); g.arc(x0 + 150, y0 + 70, 18, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "#3a3f46"; g.lineWidth = 8; g.strokeRect(x0, y0, w, h);
      g.lineWidth = 5; for (const k of [1, 2]) { g.beginPath(); g.moveTo(x0 + w * k / 3, y0); g.lineTo(x0 + w * k / 3, y0 + h); g.stroke(); }
      g.beginPath(); g.moveTo(x0, y0 + h / 2); g.lineTo(x0 + w, y0 + h / 2); g.stroke();
      g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(x0 - 4, y0 - 4, w + 8, h + 8);
    }
    // haces de luz de los ventanales sobre el suelo
    g.save(); g.globalCompositeOperation = "lighter";
    for (const x0 of [40, 300]) {
      const gr = g.createLinearGradient(x0, 140, x0 + 260, SUELO + 40); gr.addColorStop(0, "rgba(255,190,110,0.16)"); gr.addColorStop(1, "rgba(255,190,110,0)");
      g.fillStyle = gr; g.beginPath(); g.moveTo(x0, 140); g.lineTo(x0 + 210, 140); g.lineTo(x0 + 420, SUELO + 40); g.lineTo(x0 + 150, SUELO + 40); g.closePath(); g.fill();
    }
    g.restore();
    // zócalo de azulejo verde
    const zo = g.createLinearGradient(0, 300, 0, 470); zo.addColorStop(0, "#2f8b84"); zo.addColorStop(1, "#22665f");
    g.fillStyle = zo; g.fillRect(-40, 300, W + 80, 170);
    g.strokeStyle = "rgba(255,255,255,0.13)"; g.lineWidth = 1.5;
    for (let y = 300; y < 470; y += 22) { g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); }
    for (let y = 300, f = 0; y < 470; y += 22, f++) for (let x = (f % 2 ? 0 : 22) - 40; x < W + 40; x += 44) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 22); g.stroke(); }
    g.fillStyle = "#b8202c"; g.fillRect(-40, 292, W + 80, 10); g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(-40, 302, W + 80, 4);
    // perchero con cascos y chaquetones
    g.fillStyle = "#6b4a2f"; g.fillRect(560, 196, 150, 12); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(560, 196, 150, 12);
    for (const [x, col] of [[585, "#2c2c35"], [635, "#2c2c35"], [685, "#2c2c35"]]) {
      g.fillStyle = col; g.beginPath(); g.moveTo(x - 20, 212); g.lineTo(x + 20, 212); g.lineTo(x + 24, 290); g.lineTo(x - 24, 290); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#e8d54a"; g.fillRect(x - 24, 262, 48, 7); g.fillRect(x - 22, 236, 44, 6);
      g.fillStyle = "#f2d22a"; g.beginPath(); g.ellipse(x, 186, 22, 15, 0, Math.PI, 0); g.lineTo(x + 26, 190); g.lineTo(x - 26, 190); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.ellipse(x - 7, 178, 7, 3, -0.3, 0, Math.PI * 2); g.fill();
    }
    // mangueras plegadas en su estante (izquierda)
    g.fillStyle = "#5a5f66"; g.fillRect(36, 316, 150, 8); g.strokeRect(36, 316, 150, 8);
    for (let i = 0; i < 5; i++) { const y = 326 + i * 16; g.fillStyle = i % 2 ? "#c9b98a" : "#b8a876"; g.beginPath(); g.roundRect ? g.roundRect(40, y, 142, 14, 7) : g.rect(40, y, 142, 14); g.fill(); g.stroke(); }
    // hacha y campana de latón
    g.save(); g.translate(212, 372); g.rotate(-0.5); g.fillStyle = "#7b4a24"; g.fillRect(-4, -50, 8, 100); g.strokeRect(-4, -50, 8, 100);
    g.fillStyle = "#c3262f"; g.beginPath(); g.moveTo(4, -50); g.lineTo(30, -58); g.quadraticCurveTo(36, -40, 30, -22); g.lineTo(4, -30); g.closePath(); g.fill(); g.stroke(); g.restore();
    g.fillStyle = "#d9a441"; g.beginPath(); g.moveTo(450, 170); g.quadraticCurveTo(452, 140, 470, 136); g.quadraticCurveTo(488, 140, 490, 170); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#6b4a2f"; g.fillRect(466, 122, 8, 14); g.strokeRect(466, 122, 8, 14);
    // suelo de hormigón pulido con rayas de seguridad
    const su = g.createLinearGradient(0, 470, 0, H + 60); su.addColorStop(0, "#8f9497"); su.addColorStop(1, "#5b6064");
    g.fillStyle = su; g.fillRect(-40, 470, W + 80, H + 60 - 470);
    g.fillStyle = "#2b2f33"; g.fillRect(-40, 466, W + 80, 6);
    g.fillStyle = "#e8c22a"; for (let x = -40; x < W + 40; x += 64) { g.save(); g.beginPath(); g.rect(-40, 586, W + 80, 10); g.clip(); g.beginPath(); g.moveTo(x, 596); g.lineTo(x + 26, 586); g.lineTo(x + 52, 586); g.lineTo(x + 26, 596); g.closePath(); g.fill(); g.restore(); }
    g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(-40, 476, W + 80, 3);
    // camión de bomberos (frontal, cortado por la derecha)
    camion(g);
    // viñeta
    const v = g.createRadialGradient(512, 300, 330, 512, 300, 720); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.5)");
    g.fillStyle = v; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }
  function camion(g) {
    g.save(); g.lineJoin = "round"; g.strokeStyle = TINTA; g.lineWidth = 3;
    // rueda delantera (vista de frente: banda negra)
    g.fillStyle = "#1a1a1e"; g.fillRect(756, 470, 64, 92); g.strokeRect(756, 470, 64, 92);
    g.fillStyle = "#33333a"; for (let y = 480; y < 556; y += 14) g.fillRect(762, y, 52, 5);
    g.fillStyle = "#1a1a1e"; g.fillRect(990, 470, 60, 92);
    // carrocería
    const ro = g.createLinearGradient(740, 0, 1064, 0); ro.addColorStop(0, "#a50f23"); ro.addColorStop(0.12, "#d8202f"); ro.addColorStop(1, "#c81a2a");
    g.fillStyle = ro; g.beginPath(); g.moveTo(742, 470); g.lineTo(742, 70); g.quadraticCurveTo(744, 46, 772, 44); g.lineTo(1070, 44); g.lineTo(1070, 470); g.closePath(); g.fill(); g.stroke();
    // parabrisas
    const vi = g.createLinearGradient(0, 64, 0, 200); vi.addColorStop(0, "#1c2b3c"); vi.addColorStop(1, "#3b5674");
    g.fillStyle = vi; g.beginPath(); g.moveTo(768, 200); g.lineTo(768, 80); g.quadraticCurveTo(770, 66, 786, 66); g.lineTo(1070, 66); g.lineTo(1070, 200); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.16)"; g.beginPath(); g.moveTo(800, 196); g.lineTo(880, 70); g.lineTo(920, 70); g.lineTo(840, 196); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,0.1)"; g.beginPath(); g.moveTo(870, 196); g.lineTo(950, 70); g.lineTo(966, 70); g.lineTo(886, 196); g.closePath(); g.fill();
    g.lineWidth = 6; g.beginPath(); g.moveTo(940, 66); g.lineTo(940, 200); g.stroke(); g.lineWidth = 3;
    // franja reflectante
    g.fillStyle = "#f5e6a0"; g.fillRect(742, 214, 328, 16); g.strokeRect(742, 214, 328, 16);
    g.fillStyle = "#e8c22a"; for (let x = 748; x < 1064; x += 34) g.fillRect(x, 214, 17, 16);
    // rejilla cromada
    g.fillStyle = "#b9bec6"; g.beginPath(); g.roundRect ? g.roundRect(800, 248, 230, 150, 10) : g.rect(800, 248, 230, 150); g.fill(); g.stroke();
    g.strokeStyle = "#6e737b"; g.lineWidth = 4; for (let y = 262; y < 392; y += 14) { g.beginPath(); g.moveTo(808, y); g.lineTo(1022, y); g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = 3;
    g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(806, 252, 8, 142);
    // faro y luces de posición
    g.fillStyle = "#c9ced6"; g.beginPath(); g.arc(772, 290, 22, 0, Math.PI * 2); g.fill(); g.stroke();
    const fa = g.createRadialGradient(768, 286, 2, 772, 290, 17); fa.addColorStop(0, "#ffffff"); fa.addColorStop(1, "#ffe9a8");
    g.fillStyle = fa; g.beginPath(); g.arc(772, 290, 16, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#ff9a1f"; g.beginPath(); g.roundRect ? g.roundRect(758, 324, 28, 12, 4) : g.rect(758, 324, 28, 12); g.fill(); g.stroke();
    // parachoques
    g.fillStyle = "#c9ced6"; g.beginPath(); g.roundRect ? g.roundRect(728, 420, 350, 32, 8) : g.rect(728, 420, 350, 32); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.6)"; g.fillRect(734, 424, 330, 5);
    // caja de mandos con rayas (el botón va encima) sobre su poste
    g.fillStyle = "#3a3f46"; g.fillRect(711, 340, 10, 82); g.strokeRect(711, 340, 10, 82);
    g.fillStyle = "#f2d22a"; g.beginPath(); g.rect(694, 306, 46, 38); g.fill(); g.stroke();
    g.save(); g.beginPath(); g.rect(694, 306, 46, 38); g.clip(); g.fillStyle = "#1a1a1e";
    for (let x = 680; x < 760; x += 16) { g.beginPath(); g.moveTo(x, 344); g.lineTo(x + 8, 344); g.lineTo(x + 26, 306); g.lineTo(x + 18, 306); g.closePath(); g.fill(); } g.restore();
    g.strokeRect(694, 306, 46, 38);
    g.fillStyle = "#2a2a30"; g.beginPath(); g.ellipse(BOTON.x, BOTON.y + 7, 17, 6, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    // soporte y bocina de la sirena (cromada, la boca hacia la izquierda)
    g.fillStyle = "#6e737b"; g.fillRect(742, 196, 30, 10); g.strokeRect(742, 196, 30, 10);
    g.fillStyle = "#3a3f46"; g.fillRect(754, 206, 10, 30); g.strokeRect(754, 206, 10, 30);
    const cr = g.createLinearGradient(0, HORN.y - HORN.r, 0, HORN.y + HORN.r); cr.addColorStop(0, "#f4f6f8"); cr.addColorStop(0.45, "#aeb4bc"); cr.addColorStop(1, "#5d636b");
    g.fillStyle = cr; g.beginPath(); g.moveTo(774, HORN.y - 9); g.quadraticCurveTo(735, HORN.y - 11, HORN.x + 6, HORN.y - HORN.r);
    g.lineTo(HORN.x + 6, HORN.y + HORN.r); g.quadraticCurveTo(735, HORN.y + 11, 774, HORN.y + 9); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#c9ced6"; g.beginPath(); g.ellipse(776, HORN.y, 6, 12, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#1a1a1e"; g.beginPath(); g.ellipse(HORN.x + 6, HORN.y, 9, HORN.r, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#4a4f57"; g.beginPath(); g.ellipse(HORN.x + 8, HORN.y, 4, HORN.r * 0.45, 0, 0, Math.PI * 2); g.fill();
    g.lineWidth = 4; g.beginPath(); g.ellipse(HORN.x + 6, HORN.y, 9, HORN.r, 0, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 3; g.fillStyle = "rgba(255,255,255,0.75)"; g.beginPath(); g.moveTo(744, HORN.y - 10); g.quadraticCurveTo(725, HORN.y - 14, HORN.x + 12, HORN.y - HORN.r + 6); g.lineTo(HORN.x + 12, HORN.y - HORN.r + 12); g.quadraticCurveTo(728, HORN.y - 8, 744, HORN.y - 6); g.closePath(); g.fill();
    // retrovisor
    g.fillStyle = "#2a2a30"; g.fillRect(738, 96, 6, 60); g.strokeRect(738, 96, 6, 60);
    g.fillStyle = "#3b5674"; g.beginPath(); g.roundRect ? g.roundRect(718, 100, 22, 40, 5) : g.rect(718, 100, 22, 40); g.fill(); g.stroke();
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const sopla = viento(t), final = tramo(t, T.apaga + 0.3, T.tambalea0, suave) * (1 - tramo(t, T.mQuita0 - 0.2, T.mPregunta1, suave));
    return { k: 1 + 0.03 * sopla + 0.05 * final, x: 512 - 34 * final, y: 300 + 8 * final };
  }

  class GuillermoMarcosSirena extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !MB.listo()) return;
      if (!fondo) fondo = creaFondo();
      const { g: pg, m: pm } = pose(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t), tb = 2.2 * viento(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 40) * tb, ruido(t * 40 + 13) * tb * 0.6);
      MATRIZ = g.getTransform();
      g.drawImage(fondo, -40, -60);
      // sombras
      g.save(); g.fillStyle = "rgba(0,0,0,0.3)";
      g.beginPath(); g.ellipse(pg.x + 4, SUELO + 2, 92, 8, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pm.x - 4, SUELO + 2, 108, 9, 0, 0, Math.PI * 2); g.fill(); g.restore();
      derrape(g, t, pg);
      botonRojo(g, t);
      bocina(g, t);
      G.dibujar(g, pg, t);
      MB.dibujar(g, pm, t);
      if (pm.taponOfrecido > 0) {
        const q = MB.aPantalla(pm, pm.manoCerca);
        g.save(); g.translate(q.x - 2, q.y - 9 * pm.taponOfrecido - 4); g.rotate(1.35); g.scale(1.35, 1.35); tapon(g, 1); g.restore();
      }
      rotativos(g, t);
      ondas(g, t);
      voladores(g, t);
      lagrimas(g, t, pg);
      pitido(g, t, pg);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00029", nombre: "Guillermo y Marcos · La sirena", crear: () => new GuillermoMarcosSirena() });
  window.__A2D_00029 = { pose, poseG, poseM, T, DUR };
})();
