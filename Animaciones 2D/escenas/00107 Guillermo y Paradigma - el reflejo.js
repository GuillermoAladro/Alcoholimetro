"use strict";
/* 00107 · Guillermo y Paradigma · El espejo
 *
 * Negro → el recibidor de un piso antiguo, de noche, simétrico como su propio reflejo: papel
 * pintado de damasco verde, zócalo de nogal, suelo de tablillas, una alfombra persa, una lámpara de
 * pie y un cuadro con un velero a cada lado (cada velero navega hacia un lado) y, en medio, un marco
 * de espejo dorado, enorme y vacío: no tiene cristal. A la izquierda, Paradigma se arregla el cuello
 * de la cazadora delante del «espejo»; a la derecha, Guillermo hace de su reflejo y le copia cada
 * gesto en espejo (las mismas posturas reflejadas, hasta las caras y los parpadeos).
 * Paradigma sospecha: se acerca, levanta una ceja, ladea la cabeza a un lado y al otro, saluda
 * despacio, se agacha de golpe y se asoma… pone la palma contra el «cristal» (las dos palmas casi se
 * tocan en el plano del marco) y menea los dedos. Guillermo, sudando, le sigue en todo.
 * Paradigma sonríe de pillo y acelera: manos arriba, brazos en cruz, señala con la mano en la
 * cadera, sentadilla con los mofletes hinchados, salto, brazo en diagonal… Guillermo va cada vez más
 * tarde, se equivoca de brazo y lo cambia en el acto. Remate: Paradigma da una vuelta entera y cae a
 * la pata coja con un brazo arriba (¡ting!); Guillermo la intenta tarde, se pasa de vuelta y se queda
 * hecho un lío (levanta la pierna que no es y se la engancha detrás de la rodilla, los brazos
 * cruzados al revés, la lengua fuera), da tres saltitos a la pata coja hacia el marco, lo cruza dando
 * vueltas y cae sentado de culo al otro lado (¡pum!, el marco se bambolea), mareado con estrellitas. Paradigma, que se ha apartado de un salto, se ríe,
 * se acerca, le tiende la mano y tira de él; se dan un apretón de manos. Cada uno vuelve a su lado
 * (Guillermo cruza el marco andando hacia atrás) y, por fin perfectamente sincronizados, posan los
 * dos en jarras mirando a cámara y guiñan el ojo a la vez, en espejo → negro.
 *
 * Coreografía: una sola pista de posturas «normalizadas» (cuerpo en la hoja, manos relativas al
 * hombro en largos de brazo) que dibujan los dos muñecos; como Guillermo va con `espejo`, la misma
 * postura sale reflejada respecto al marco (x = 512). Guillermo la lee con retraso (`retraso(t)`),
 * que crece cuando Paradigma acelera. Las manos se mezclan en polares alrededor del hombro (el brazo
 * no se encoge al barrer) y el codo solo cambia de lado con el brazo casi estirado. Los contactos
 * (palmas en el plano del marco, la mano que le tiende, el apretón) se dan en pantalla y se pasan
 * a la hoja de cada uno con `aHoja`. Sin textos. Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, ruido, hash } = M2;
  const G = Guillermo, P = Paradigma, R = Recortes;
  const S = 0.30, SUELO = 536, DUR = 14.7, CX = 512;
  const XP0 = 378, XG0 = 646;                     // pelvis en su sitio (simétricos respecto al marco)

  const T = {
    // sincronía perfecta
    cuello0: 0.3, cuello1: 1.15, bols: 1.2, acerca: 1.5, ceja: 1.95, ladea0: 2.25, ladea1: 3.0,
    saluda0: 3.05, onda0: 3.3, onda1: 3.9, saluda1: 4.15, agacha: 4.22, asoma0: 4.6, asoma1: 5.0,
    palma0: 5.05, palma1: 5.35, dedos1: 5.85, pillo: 5.9,
    // la tanda rápida
    m1: 6.0, m2: 6.35, m3: 6.7, m4: 7.05, m5: 7.4, m6: 7.75, m7: 8.1,
    // el remate
    giro0: 8.45, giro1: 8.8, flamenco: 8.95, baja: 9.45,
    // Guillermo se lía y cruza el marco
    gGiro0: 8.72, gGiro1: 9.22, lio0: 9.3, lio1: 9.5, saltos0: 9.6, saltos1: 9.95, cruza1: 10.27,
    pApartado0: 9.85, pApartado1: 10.15, risa0: 10.3, risa1: 10.75,
    ofrece0: 10.75, ofrece1: 11.08, agarra: 11.1, tira0: 11.15, tira1: 11.65, apreton1: 12.1,
    vuelta0: 12.1, vuelta1: 12.72, final0: 12.8, final1: 13.05, guino0: 13.35, guino1: 13.75,
    fin: 13.95
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = typeof ini === "string" ? estados[ini] : ini;
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const D5 = (pu, ix, md, an, me) => ({ pulgar: pu, indice: ix, medio: md, anular: an, menique: me });
  const D = (pu, ix, md, re) => D5(pu, ix, md, re, re);
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const rota = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const mz = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });
  // tabla de (t, valor) con interpolación lineal
  const tabla = (tab, t) => { if (t <= tab[0][0]) return tab[0][1]; for (let i = 1; i < tab.length; i++) if (t <= tab[i][0]) return lerp(tab[i - 1][1], tab[i][1], (t - tab[i - 1][0]) / (tab[i][0] - tab[i - 1][0])); return tab[tab.length - 1][1]; };
  // tabla con tramos suaves entre puntos
  const tablaSuave = (tab, t) => { if (t <= tab[0][0]) return tab[0][1]; for (let i = 1; i < tab.length; i++) if (t <= tab[i][0]) return lerp(tab[i - 1][1], tab[i][1], suave((t - tab[i - 1][0]) / (tab[i][0] - tab[i - 1][0]))); return tab[tab.length - 1][1]; };

  const OPEN = D(1, 1, 1, 1), REL = D(0.45, 0.55, 0.6, 0.62), FIST = D(0, 0, 0, 0), POINT = D5(0.15, 1, 0, 0, 0), GRIP = D(0.4, 0.42, 0.42, 0.42);

  /* ================= cuerpo (normalizado: hoja) ================= */
  const CB = { pdx: 0, pdy: 0, torso: 0.02, ex: 1, ey: 1, ca: 0, cdx: 0, cdy: 0, pcx: 0, pcy: 0, pca: 0, plx: 0, ply: 0, pla: 0, sube: 0 };
  const B = o => Object.assign({}, CB, o);
  const CU = {
    pie: B({}),
    admira: B({ torso: -0.03, ca: -0.08 }),
    tira: B({ torso: -0.05, ca: -0.12, pdy: -8, ey: 1.01 }),
    acerca: B({ torso: 0.15, ca: 0.06, cdx: 16, pdx: 10, plx: 30 }),
    ladea1: B({ torso: 0.1, ca: 0.22, cdx: 10, plx: 22 }),
    ladea2: B({ torso: 0.1, ca: -0.16, cdx: 10, plx: 22 }),
    centro: B({ torso: 0.06, ca: 0.02, plx: 10 }),
    saluda: B({ torso: 0.04, ca: 0.05 }),
    agacha: B({ pdy: 230, torso: 0.3, ca: 0.12, ey: 0.95, pcx: -24, plx: 24 }),
    asoma: B({ pdy: 120, torso: 0.24, ca: -0.04, pcx: -10, plx: 12 }),
    palma: B({ torso: 0.2, pdx: 40, plx: 60, ca: 0.04, cdx: 6 }),
    arriba: B({ torso: -0.05, ca: -0.07, ey: 1.02 }),
    te: B({ torso: 0.0, ca: 0.0, pcx: -30, plx: 30 }),
    senala: B({ torso: 0.1, pdx: 16, plx: 70, ca: 0.04 }),
    sentadilla: B({ pdy: 200, torso: 0.22, ca: 0.06, pcx: -50, plx: 50, ey: 0.96 }),
    salto: B({ torso: -0.06, ca: -0.09, sube: 44, pcy: -30, ply: -24, pca: 0.2, pla: 0.2 }),
    diagonal: B({ torso: 0.02, ca: -0.06, plx: 20 }),
    cruzado: B({ torso: -0.05, ca: -0.15, pdx: -6 }),
    giro: B({ pdy: 30, torso: 0.04 }),
    flamenco: B({ torso: -0.07, ca: -0.16, pcx: 150, pcy: -260, pca: -0.35 }),
    final: B({ torso: -0.04, ca: -0.1, ey: 1.01, pcx: -20, plx: 20 }),
    // propias de Paradigma
    mira: B({ torso: 0.06, ca: 0.1 }),
    susto: B({ torso: -0.12, ca: -0.12, pdy: -10 }),
    risa: B({ torso: 0.14, ca: 0.16, pdy: 20 }),
    ayuda: B({ torso: 0.34, ca: 0.26, pdy: 70 }),
    tirar: B({ torso: -0.14, ca: -0.04, pdy: 40 }),
    apreton: B({ torso: 0.04, ca: 0.06 }),
    camina: B({ torso: 0.05, ca: 0.02 }),
    // propias de Guillermo
    lio: B({ pdy: 40, torso: 0.1, ex: 0.94, ca: 0.2, pcx: 20, plx: -200, ply: -250, pla: 0.7 }),
    gira: B({ pdy: 130, torso: 0.05, ca: 0.1, pcx: 90, plx: 40 }),
    sentado: B({ pdy: 499, torso: -0.1, ey: 0.94, ca: 0.08, pcx: 525, pcy: 40, pca: -1.05, plx: 100, ply: 18, pla: -0.15 }),
    alcanza: B({ pdy: 499, torso: 0.1, ey: 0.95, ca: 0.0, pcx: 525, pcy: 40, pca: -1.05, plx: 100, ply: 18, pla: -0.15 }),
    levanta: B({ pdy: 230, torso: 0.22, ca: 0.1, pcx: 160, plx: 90 }),
    tirado: B({ torso: 0.08, ca: 0.0 })
  };
  const GUION_C = [
    [T.cuello0, T.cuello0 + 0.25, "admira"],
    [0.6, 0.7, "tira"], [0.7, 0.85, "admira"], [0.9, 1.0, "tira"], [1.0, 1.15, "admira"],
    [T.bols, T.acerca, "pie"], [T.acerca, T.acerca + 0.35, "acerca"],
    [T.ladea0, T.ladea0 + 0.25, "ladea1"], [2.55, 2.8, "ladea2"], [2.85, T.ladea1, "centro"],
    [T.saluda0, T.saluda0 + 0.25, "saluda"],
    [T.agacha, T.agacha + 0.2, "agacha", salida], [T.asoma0, T.asoma1, "asoma"],
    [T.palma0, T.palma1, "palma"],
    [T.m1, T.m1 + 0.11, "arriba"], [T.m2, T.m2 + 0.11, "te"], [T.m3, T.m3 + 0.11, "senala"], [T.m4, T.m4 + 0.12, "sentadilla"],
    [T.m5, T.m5 + 0.12, "salto"], [T.m5 + 0.2, T.m5 + 0.32, "pie", entrada], [T.m6, T.m6 + 0.11, "diagonal"], [T.m7, T.m7 + 0.12, "cruzado"],
    [T.giro0, T.giro0 + 0.12, "giro"], [T.giro1, T.flamenco, "flamenco", salida],
    [T.baja, T.baja + 0.2, "pie"],
    [T.final0, T.final1, "final"]
  ];

  /* ================= manos ================= */
  const R_M = G.MUNECA_R * G.JK;
  const LARGO = (Rg, lado) => lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L;
  const CODO = (Rg, lado) => lado === "cerca" ? Rg.A.datos.piezas.brazo_cerca.codo : (Rg === G ? G.BRAZO_L * 0.5 : Rg.A.datos.piezas.brazo.codo);
  const HOMBRO = (Rg, p, lado) => Rg.tronco(p)(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO);
  const BOLS_G = { cerca: { x: 131, y: 652 }, lejos: { x: 372, y: 648 } };           // muñecas de Guillermo en los bolsillos
  function munecaBolsillo(Rg, p, lado) {
    if (Rg === G) return G.tronco(p)(BOLS_G[lado]);
    const m = Rg.manoReposo(p, lado); return { x: m.x + Math.cos(-1.75) * R_M, y: m.y + Math.sin(-1.75) * R_M };
  }
  // dirección del antebrazo (de la muñeca al codo) con la misma IK que el muñeco
  function muAuto(sh, w, L, sj, dobla) {
    const c = R.ik(sh, w, L, sj, 42, dobla, 1.08), d = R.dir(c.a1), e = { x: sh.x + d.x * c.sj * c.estira, y: sh.y + d.y * c.sj * c.estira };
    return Math.atan2(e.y - w.y, e.x - w.x);
  }
  function munecaDeMano(sh, h, L, sj, dobla, muOff) {
    let mu = Math.atan2(sh.y - h.y, sh.x - h.x), w = h;
    for (let i = 0; i < 4; i++) { w = { x: h.x + Math.cos(mu) * R_M, y: h.y + Math.sin(mu) * R_M }; mu = muAuto(sh, w, L, sj, dobla) + muOff; }
    return w;
  }
  const valor = (v, tt) => typeof v === "function" ? v(tt) : v;
  // especificación → muñeca resuelta (hoja). { bols } | { r: [rx, ry] en largos de brazo } | { pant: (dir, tt) → punto de pantalla de la mano } | { hoja: (p, Rg, tt) → mano en la hoja }
  function resuelve(Rg, p, lado, e, tt) {
    const sh = HOMBRO(Rg, p, lado), L = LARGO(Rg, lado), sj = CODO(Rg, lado);
    let dobla = e.dobla ?? (lado === "cerca" ? -1 : 1), w;
    const muOff = e.muOff || 0;
    if (e.bols) { w = munecaBolsillo(Rg, p, lado); dobla = lado === "cerca" ? -1 : 1; return { w, sh, dobla, dedos: e.dedos || REL, puno: e.sale ? 1 : 0, muOff: 0 }; }
    if (e.r) { const r = valor(e.r, tt); w = { x: sh.x + r[0] * L, y: sh.y + r[1] * L }; }
    else if (e.pant) { const s = e.pant(Rg === P ? 1 : -1, tt), h = Rg.aHoja(p, s); w = munecaDeMano(sh, h, L, sj, dobla, muOff); }
    else { const h = e.hoja(p, Rg, tt); w = munecaDeMano(sh, h, L, sj, dobla, muOff); }
    return { w, sh, dobla, dedos: valor(e.dedos, tt) || REL, puno: e.puno ?? 1, muOff };
  }
  // mezcla en polares alrededor del hombro (el brazo barre sin encogerse); via: +1/−1 sentido del barrido
  function mezclaMano(a, b, k, via = 0) {
    if (k <= 0) return a; if (k >= 1) return b;
    const sh = mz(a.sh, b.sh, k);
    const ax = a.w.x - a.sh.x, ay = a.w.y - a.sh.y, bx = b.w.x - b.sh.x, by = b.w.y - b.sh.y;
    const aa = Math.atan2(ay, ax), ab = Math.atan2(by, bx);
    let d = ab - aa;
    if (via > 0) { while (d < 0) d += Math.PI * 2; while (d > Math.PI * 2) d -= Math.PI * 2; }
    else if (via < 0) { while (d > 0) d -= Math.PI * 2; while (d < -Math.PI * 2) d += Math.PI * 2; }
    else d = Math.atan2(Math.sin(d), Math.cos(d));
    const an = aa + d * k, r = lerp(Math.hypot(ax, ay), Math.hypot(bx, by), k);
    return { w: { x: sh.x + Math.cos(an) * r, y: sh.y + Math.sin(an) * r }, sh, dobla: k < 0.5 ? a.dobla : b.dobla,
      dedos: DD(a.dedos, b.dedos, k), puno: lerp(a.puno, b.puno, k), muOff: lerp(a.muOff, b.muOff, k) };
  }
  // pista de manos: [t0, t1, especificación, curva, via]
  function pista(Rg, p, lado, lista, tt) {
    let c = resuelve(Rg, p, lado, lista[0][2], tt);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, e, f, via] = lista[i];
      if (tt <= t0) break;
      c = mezclaMano(c, resuelve(Rg, p, lado, e, tt), (f || suave)(fase(tt, t0, t1)), via || e.via || 0);
    }
    return c;
  }
  // muñeca resuelta → mano del muñeco
  function mano(Rg, lado, m) {
    const mu = muAuto(m.sh, m.w, LARGO(Rg, lado), CODO(Rg, lado), m.dobla) + m.muOff;
    return { x: m.w.x - Math.cos(mu) * R_M, y: m.w.y - Math.sin(mu) * R_M, mu, ang: 0, dobla: m.dobla, puno: m.puno, dedos: m.dedos };
  }

  // brazo cercano (hombro en el lado de atrás) y lejano (hacia donde mira): r = muñeca respecto al hombro
  const C_ = {
    bols: { bols: true },
    cuelloA: { r: [0.3, 0.2], dobla: -1, dedos: GRIP },
    cuelloB: { r: [0.3, 0.1], dobla: -1, dedos: GRIP },
    arriba: { r: [-0.18, -0.95], dobla: 1, dedos: OPEN, via: 1 },
    te: { r: [-0.98, 0.08], dobla: 1, dedos: OPEN },
    cadera: { r: [0.18, 0.84], dobla: -1, dedos: FIST },
    rodilla: { r: [0.46, 0.84], dobla: -1, dedos: GRIP },
    cruzado: { r: [0.72, 0.3], dobla: -1, dedos: GRIP },
    flamenco: { r: [0.62, 0.14], dobla: -1, dedos: OPEN },
    susto: { r: [0.55, -0.22], dobla: -1, dedos: OPEN },
    barriga: { r: [0.52, 0.64], dobla: -1, dedos: REL },
    lio: { r: [0.82, 0.04], dobla: -1, dedos: GRIP },
    muslo: { r: [0.5, 0.8], dobla: -1, dedos: REL }
  };
  const L_ = {
    bols: { bols: true },
    cuelloA: { r: [-0.2, 0.2], dobla: 1, dedos: GRIP },
    cuelloB: { r: [-0.2, 0.1], dobla: 1, dedos: GRIP },
    saluda: { r: tt => [0.66 + 0.13 * Math.sin((tt - T.onda0) / 0.3 * Math.PI * 2) * campana(tt, T.onda0, T.onda1), -0.6], dobla: -1, dedos: OPEN, muOff: 0.15 },
    // la palma en el plano del marco (un pelo antes, como si hubiera cristal)
    palma: { pant: (dir, tt) => ({ x: CX - dir * 11, y: 205 }), dobla: -1,
      dedos: tt => { const k = campana(tt, T.palma1, T.dedos1 + 0.05), f = i => 1 - 0.3 * k * (0.5 + 0.5 * Math.sin((tt - T.palma1) * 24 - i * 1.4));
        return D5(1, f(0), f(1), f(2), f(3)); } },
    arriba: { r: [0.42, -0.88], dobla: -1, dedos: OPEN },
    te: { r: [0.98, 0.06], dobla: -1, dedos: OPEN },
    senala: { r: [0.96, -0.14], dobla: -1, dedos: POINT },
    rodilla: { r: [0.3, 0.92], dobla: 1, dedos: GRIP, via: 1 },
    diagonal: { r: [0.8, -0.58], dobla: -1, dedos: POINT, via: -1 },
    abajo: { r: [0.25, 0.96], dobla: 1, dedos: REL, via: 1 },
    cruzado: { r: [-0.6, 0.38], dobla: 1, dedos: GRIP },
    flamenco: { r: [0.5, -0.85], dobla: -1, dedos: OPEN, via: -1 },
    cadera: { r: [-0.12, 0.82], dobla: 1, dedos: FIST },
    susto: { r: [0.62, -0.5], dobla: -1, dedos: OPEN, via: -1 },
    boca: { hoja: (p, Rg) => { const b = Rg.boca(p); return { x: b.x + 26, y: b.y + 30 }; }, dobla: -1, dedos: D(0.6, 0.85, 0.85, 0.85), muOff: 0.2 },
    lio: { r: [-0.6, 0.7], dobla: 1, dedos: GRIP, via: 1 },
    suelo: { r: [0.55, 0.75], dobla: 1, dedos: REL }
  };

  const MANOS_C = [
    [0, 0, C_.cuelloA],
    [0.6, 0.7, C_.cuelloB], [0.7, 0.85, C_.cuelloA], [0.9, 1.0, C_.cuelloB], [1.0, 1.15, C_.cuelloA],
    [T.bols, T.acerca, C_.bols],
    [T.m1, T.m1 + 0.11, C_.arriba, suave, 1], [T.m2, T.m2 + 0.11, C_.te], [T.m3, T.m3 + 0.11, C_.cadera, suave, -1],
    [T.m4, T.m4 + 0.12, C_.rodilla], [T.m5, T.m5 + 0.12, C_.arriba, suave, 1], [T.m6, T.m6 + 0.11, C_.cadera, suave, -1],
    [T.m7, T.m7 + 0.12, C_.cruzado], [T.giro1, T.flamenco, C_.flamenco, salida],
    [T.baja, T.baja + 0.2, C_.bols],
    [T.final0, T.final1, C_.cadera]
  ];
  const MANOS_L = [
    [0, 0, L_.cuelloA],
    [0.6, 0.7, L_.cuelloB], [0.7, 0.85, L_.cuelloA], [0.9, 1.0, L_.cuelloB], [1.0, 1.15, L_.cuelloA],
    [T.bols, T.acerca, L_.bols],
    [T.saluda0, T.onda0, L_.saluda, suave, -1], [T.onda1, T.saluda1, L_.bols, suave, 1],
    [T.palma0, T.palma1, L_.palma, suave, -1],
    [T.m1, T.m1 + 0.11, L_.arriba], [T.m2, T.m2 + 0.11, L_.te], [T.m3, T.m3 + 0.11, L_.senala],
    [T.m4, T.m4 + 0.12, L_.rodilla, suave, 1], [T.m5, T.m5 + 0.12, L_.arriba, suave, -1], [T.m6, T.m6 + 0.11, L_.diagonal],
    [T.m7, T.m7 + 0.06, L_.abajo, suave, 1], [T.m7 + 0.06, T.m7 + 0.15, L_.cruzado],
    [T.giro0, T.giro0 + 0.12, L_.abajo], [T.giro1, T.flamenco, L_.flamenco, salida, -1],
    [T.baja, T.baja + 0.2, L_.bols, suave, 1],
    [T.final0, T.final1, L_.cadera]
  ];

  /* ================= caras ================= */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, rub: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0, espiral: e.esp };
  }
  const CA = {
    admira: E({ my: -0.1, c: 0.45, h: 0.25, sonr: 0.5, sd: 8, si: 8 }),
    tira: E({ my: -0.15, c: 0.55, h: 0.3, sonr: 0.55, sd: 10, si: 10 }),
    calma: E({ c: 0.22, sonr: 0.32, sd: 4, si: 4 }),
    sospecha: E({ mx: 0.95, my: 0.05, c: 0.55, z: 0.1, sd: -6, gd: -0.12, si: -6, gi: -0.12, sonr: 0.0, ancho: 0.85 }),
    ceja: E({ mx: 0.95, c: 0.35, sd: 20, gd: 0.12, si: -6, gi: -0.1, sonr: 0.18, ancho: 0.9 }),
    saluda: E({ mx: 0.9, c: 0.15, sonr: 0.55, sd: 8, si: 8 }),
    agacha: E({ mx: 0.9, c: 0.05, iris: 1.05, sd: 14, si: 14, sonr: 0.3 }),
    asoma: E({ mx: 0.95, my: -0.15, c: 0.6, sd: -4, si: -4, gd: -0.1, gi: -0.1, sonr: -0.05, ancho: 0.8 }),
    palma: E({ mx: 0.95, c: 0.45, sd: 4, si: 10, gi: 0.06, sonr: 0.1 }),
    pillo: E({ mx: 0.9, c: 0.4, h: 0.2, sd: 14, gd: 0.1, si: 2, sonr: 0.7, ancho: 1.05 }),
    m1: E({ mx: 0.8, my: -0.2, sd: 22, si: 22, abre: 16, ancho: 0.6, sonr: 0.2 }),
    m2: E({ mx: 0.9, c: 0.3, sonr: 0.45, sd: 6, si: 6 }),
    m3: E({ mx: 0.95, c: 0.2, sonr: 0.75, ancho: 1.05, sd: 8 }),
    m4: E({ mx: 0.9, c: 0.1, mof: 0.95, sd: 10, si: 10, ancho: 0.5, sonr: 0 }),
    m5: E({ mx: 0.8, my: -0.3, sd: 18, si: 18, abre: 22, ancho: 0.8, sonr: 0.6 }),
    m6: E({ mx: 0.95, c: 0.35, sonr: 0.6, sd: 10 }),
    m7: E({ mx: 0.9, c: 0.45, h: 0.2, sd: 14, si: 6, sonr: 0.55 }),
    giro: E({ c: 0.7, h: 0.3, sonr: 0.6 }),
    flamenco: E({ mx: -0.3, my: -0.05, c: 0.35, h: 0.3, sonr: 0.85, ancho: 1.05, sd: 10, si: 10 }),
    camara: E({ mx: -0.45, my: 0.05, c: 0.2, sonr: 0.75, sd: 10, si: 6 }),
    guino: E({ mx: -0.45, my: 0.05, c: 0.2, cd: 1, h: 0.2, sonr: 0.85, sd: 4, si: 12 }),
    // Paradigma, después
    mira: E({ mx: 0.95, my: 0.1, c: 0.2, sd: 12, si: 12, sonr: 0.2 }),
    alarma: E({ mx: 0.9, my: 0.25, iris: 0.8, sd: 24, si: 24, abre: 14, ancho: 0.6, sonr: -0.2 }),
    risa: E({ c: 1, h: 1, sd: 10, si: 10, abre: 18, ancho: 1.0, sonr: 0.95, rub: 0.2 }),
    ayuda: E({ mx: 0.9, my: 0.45, c: 0.15, sonr: 0.6, sd: 8, si: 8 }),
    tirar: E({ mx: 0.9, my: 0.2, z: 0.6, c: 0.5, sd: -4, si: -4, sonr: 0.2 }),
    apreton: E({ mx: 0.9, c: 0.2, h: 0.4, sonr: 0.85, ancho: 1.05, sd: 8, si: 8 }),
    // Guillermo, después
    oops: E({ mx: 0.6, my: -0.5, iris: 0.7, sd: 26, si: 26, abre: 12, ancho: 0.5, sonr: -0.3, rub: 0.4 }),
    lio: E({ mx: 0.3, my: -0.3, z: 0.5, c: 0.35, sd: 6, si: 14, gi: 0.15, abre: 14, ancho: 0.7, sonr: 0.1, lengua: 1 }),
    panico: E({ mx: 0.9, my: 0.1, iris: 0.62, sd: 30, si: 30, abre: 24, ancho: 0.65, sonr: -0.45 }),
    golpe: E({ c: 1, z: 1, abre: 12, ancho: 0.8, sonr: -0.4 }),
    mareo: E({ esp: 1, abre: 8, ancho: 0.6, sonr: 0.1, sd: 6, si: 2 }),
    agarra: E({ mx: 0.9, my: -0.35, sd: 16, si: 12, sonr: 0.45, rub: 0.3 }),
    tirado: E({ mx: 0.9, my: -0.2, sd: 22, si: 22, abre: 12, ancho: 0.6, sonr: 0.2 }),
    gApreton: E({ mx: 0.9, h: 0.5, c: 0.4, sonr: 0.85, ancho: 1.0, rub: 0.5 }),
    camina: E({ mx: 0.9, sonr: 0.6, sd: 8, si: 8 })
  };
  const GUION_CA = [
    [T.cuello0, T.cuello0 + 0.25, "admira"], [0.6, 0.7, "tira"], [0.7, 0.85, "admira"], [0.9, 1.0, "tira"], [1.0, 1.15, "admira"],
    [T.bols, T.acerca, "calma"], [T.acerca + 0.1, T.acerca + 0.35, "sospecha"], [T.ceja, T.ceja + 0.2, "ceja"],
    [T.ladea0, T.ladea0 + 0.2, "sospecha"], [T.saluda0, T.saluda0 + 0.25, "saluda"], [T.saluda1, T.saluda1 + 0.1, "calma"],
    [T.agacha, T.agacha + 0.06, "agacha"], [T.asoma0, T.asoma0 + 0.2, "asoma"], [T.palma0, T.palma0 + 0.2, "palma"],
    [T.pillo, T.pillo + 0.12, "pillo"],
    [T.m1, T.m1 + 0.08, "m1"], [T.m2, T.m2 + 0.08, "m2"], [T.m3, T.m3 + 0.08, "m3"], [T.m4, T.m4 + 0.1, "m4"],
    [T.m5, T.m5 + 0.08, "m5"], [T.m6, T.m6 + 0.08, "m6"], [T.m7, T.m7 + 0.08, "m7"],
    [T.giro0, T.giro0 + 0.1, "giro"], [T.giro1, T.flamenco, "flamenco"], [T.baja, T.baja + 0.15, "calma"],
    [T.final0, T.final1, "camara"], [T.guino0, T.guino0 + 0.08, "guino"], [T.guino1 - 0.1, T.guino1, "camara"]
  ];
  const PARP = [1.85, 3.0, 5.0, 9.6, 12.95];

  /* ================= el retraso de Guillermo ================= */
  const RETRASO = [[0, 0.03], [4.15, 0.03], [4.25, 0.065], [5.0, 0.065], [5.1, 0.035], [5.9, 0.035], [6.0, 0.06], [6.35, 0.08], [6.7, 0.1],
    [7.05, 0.13], [7.4, 0.16], [7.75, 0.2], [8.1, 0.21], [8.45, 0.24], [11.0, 0.24], [12.0, 0.0]];
  const retraso = t => tabla(RETRASO, t);

  /* ================= pies ================= */
  const PIE_DEF = { cerca: -95, lejos: 100 };          // tobillos respecto a la pelvis (hoja)
  const TOB = Rg => Rg.SUELO - Rg.TOBILLO_ALTO;          // altura del tobillo de pie (hoja)
  function piesDeCuerpo(Rg, b) {
    return { cerca: { tob: { x: Rg.PELVIS.x + PIE_DEF.cerca + b.pcx, y: TOB(Rg) + b.pcy }, ang: b.pca },
      lejos: { tob: { x: Rg.PELVIS.x + PIE_DEF.lejos + b.plx, y: TOB(Rg) + b.ply }, ang: b.pla } };
  }
  // pasos en pantalla: [t0, t1, lado, x destino, altura]
  function pasos(ini, lista, t) {
    const q = { cerca: { x: ini.cerca, alza: 0, k: 0 }, lejos: { x: ini.lejos, alza: 0, k: 0 } };
    for (const [t0, t1, lado, x1, alto = 18] of lista) {
      if (t <= t0) continue;
      const k = fase(t, t0, t1), f = q[lado];
      f.x = lerp(f.x, x1, suave(k)); f.alza = k < 1 ? alto * Math.sin(Math.PI * k) : 0; f.k = k < 1 ? k : 0;
    }
    return q;
  }
  function piesDePasos(Rg, p, q) {
    const o = {};
    for (const lado of ["cerca", "lejos"]) {
      const f = q[lado], ys = p.suelo + (TOB(Rg) - Rg.SUELO) * p.s - f.alza;
      o[lado] = { tob: Rg.aHoja(p, { x: f.x, y: ys }), ang: -0.25 * Math.sin(Math.PI * f.k) };
    }
    return o;
  }
  const mezclaPies = (a, b, k) => ({ cerca: { tob: mz(a.cerca.tob, b.cerca.tob, k), ang: lerp(a.cerca.ang, b.cerca.ang, k) },
    lejos: { tob: mz(a.lejos.tob, b.lejos.tob, k), ang: lerp(a.lejos.ang, b.lejos.ang, k) } });

  /* ================= Paradigma ================= */
  const W_P = t => tramo(t, T.baja + 0.2, T.baja + 0.3) * (1 - tramo(t, T.vuelta1 + 0.03, T.final0 + 0.05));
  const X_P = t => tablaSuave([[0, XP0], [T.pApartado0, XP0], [T.pApartado1, 230], [T.ofrece0, 230], [T.ofrece0 + 0.25, 256], [T.tira0, 256],
    [T.tira0 + 0.25, 246], [T.vuelta0, 246], [T.vuelta1, XP0]], t);
  const PASOS_P = [[T.pApartado0, T.pApartado0 + 0.15, "lejos", 260, 22], [T.pApartado0 + 0.1, T.pApartado1 - 0.03, "cerca", 201.5, 22],
    [T.ofrece0, T.ofrece0 + 0.2, "lejos", 272, 14],
    [T.vuelta0, T.vuelta0 + 0.22, "cerca", 300], [T.vuelta0 + 0.18, T.vuelta0 + 0.4, "lejos", 408], [T.vuelta0 + 0.36, T.vuelta0 + 0.58, "cerca", 349.5]];
  const GUION_P = [
    [T.baja + 0.25, T.baja + 0.4, "mira"], [T.pApartado0, T.pApartado0 + 0.1, "susto"], [T.risa0, T.risa0 + 0.15, "risa"],
    [T.ofrece0, T.ofrece0 + 0.3, "ayuda"], [T.tira0, T.tira0 + 0.2, "tirar"], [T.tira1 - 0.1, T.tira1 + 0.05, "apreton"],
    [T.vuelta0, T.vuelta0 + 0.2, "camina"], [T.vuelta1 - 0.1, T.vuelta1, "pie"]
  ];
  const CARA_P = [
    [T.baja + 0.25, T.baja + 0.4, "mira"], [T.pApartado0, T.pApartado0 + 0.08, "alarma"], [T.risa0, T.risa0 + 0.12, "risa"],
    [T.ofrece0 - 0.05, T.ofrece0 + 0.15, "ayuda"], [T.tira0, T.tira0 + 0.12, "tirar"], [T.tira1 - 0.15, T.tira1, "apreton"],
    [T.vuelta0 + 0.1, T.vuelta0 + 0.3, "calma"]
  ];

  /* ---------- el punto donde se agarran (pantalla) ---------- */
  const M0 = { x: 384, y: 344 }, H0 = { x: 350, y: 292 };
  function agarre(t) {
    const k = salida(fase(t, T.tira0, T.tira1));
    const c = mz(M0, H0, k);
    const ap = campana(t, T.tira1 + 0.02, T.apreton1 - 0.02);
    if (ap > 0) c.y += 9 * Math.sin((t - T.tira1) / 0.2 * Math.PI * 2) * ap;
    return c;
  }
  const MANOS_P_C = [[0, 0, C_.bols], [T.pApartado0, T.pApartado0 + 0.1, C_.susto], [T.risa0, T.risa0 + 0.15, C_.barriga], [T.ofrece0, T.ofrece0 + 0.2, C_.bols]];
  const L_OFRECE = { pant: (dir, tt) => { const a = agarre(tt); return { x: a.x - 7, y: a.y + 1 }; }, dobla: -1, dedos: GRIP };
  const MANOS_P_L = [[0, 0, L_.bols], [T.pApartado0, T.pApartado0 + 0.1, L_.susto, suave, -1], [T.risa0, T.risa0 + 0.15, L_.boca],
    [T.ofrece0, T.ofrece1, L_OFRECE], [T.vuelta0, T.vuelta0 + 0.25, L_.bols, suave, 1]];

  const giroP = t => Math.cos(Math.PI * 2 * suave(fase(t, T.giro0, T.giro1)));

  function poseP(t) {
    const w = W_P(t);
    const bs = linea(GUION_C, CU, "admira", t);
    const bo = linea(GUION_P, CU, "pie", t);
    const b = mezclaE(bs, bo, w);
    // la risa le sacude los hombros
    b.torso += 0.035 * Math.sin(t * 34) * campana(t, T.risa0 + 0.05, T.risa1);
    const respira = Math.sin(t * 2.1 + 0.3);
    const X = lerp(XP0, X_P(t), w);
    const p = { x: X, suelo: SUELO - b.sube, s: S, tirasLimpias: true,
      pelvis: { x: P.PELVIS.x + b.pdx, y: P.PELVIS.y + b.pdy }, torso: b.torso, torsoEsc: { x: b.ex, y: b.ey + respira * 0.006 },
      cabeza: { ang: b.ca, dx: b.cdx, dy: b.cdy, esc: { x: 1, y: 1 } } };
    const pS = piesDeCuerpo(P, bs);
    p.piernas = w > 0 ? mezclaPies(pS, piesDePasos(P, p, pasos({ cerca: XP0 + PIE_DEF.cerca * S, lejos: XP0 + PIE_DEF.lejos * S }, PASOS_P, t)), w) : pS;
    // cara
    const es = linea(GUION_CA, CA, "admira", t), eo = linea(CARA_P, CA, "calma", t);
    p.cara = cara(mezclaE(es, eo, w), parpadeo(t, PARP));
    p.rojo = 0.25 * campana(t, T.risa0, T.risa1 + 0.1);
    // manos
    const ms = { cerca: pista(P, p, "cerca", MANOS_C, t), lejos: pista(P, p, "lejos", MANOS_L, t) };
    let mc = ms.cerca, ml = ms.lejos;
    if (w > 0) {
      mc = mezclaMano(ms.cerca, pista(P, p, "cerca", MANOS_P_C, t), w);
      ml = mezclaMano(ms.lejos, pista(P, p, "lejos", MANOS_P_L, t), w);
    }
    p.manoCerca = mano(P, "cerca", mc); p.manoLejos = mano(P, "lejos", ml);
    p.giro = giroP(t);
    return p;
  }

  /* ================= Guillermo ================= */
  const W_G = t => tramo(t, 9.15, 9.27) * (1 - tramo(t, T.vuelta1 + 0.03, T.final0 + 0.05));
  // saltitos a la pata coja hacia el marco, lo cruza girando y cae sentado; le levantan; vuelve andando hacia atrás
  const X_G = t => {
    if (t < T.saltos0) return XG0;
    if (t < T.saltos1) { const n = (t - T.saltos0) / ((T.saltos1 - T.saltos0) / 3), i = Math.min(2, Math.floor(n)), k = n - i;
      return lerp(XG0 - i * 27, XG0 - (i + 1) * 27, salida(Math.min(1, k))); }
    return tablaSuave([[T.saltos1, XG0 - 81], [T.cruza1, 490], [T.tira0, 490], [T.tira1, 440], [T.vuelta0, 440], [T.vuelta1, XG0]], t);
  };
  const subeG = t => {
    let s = 0;
    if (t > T.saltos0 && t < T.saltos1) { const n = (t - T.saltos0) / ((T.saltos1 - T.saltos0) / 3); s = 34 * Math.sin(Math.PI * (n % 1)); }
    // el bote al caer sentado
    if (t > T.cruza1 && t < T.cruza1 + 0.4) { const u = t - T.cruza1; s += 14 * Math.abs(Math.sin(u * 15)) * Math.exp(-u * 9); }
    return s;
  };
  const GUION_G = [
    [T.lio0, T.lio1, "lio"], [T.saltos1, T.saltos1 + 0.12, "gira"], [T.saltos1 + 0.12, T.cruza1, "sentado", entrada], [T.ofrece0 + 0.05, T.agarra, "alcanza"],
    [T.tira0, T.tira0 + 0.28, "levanta"], [T.tira0 + 0.28, T.tira1, "tirado", salida], [T.tira1, T.tira1 + 0.15, "apreton"],
    [T.vuelta0, T.vuelta0 + 0.15, "camina"], [T.vuelta1 - 0.1, T.vuelta1, "pie"]
  ];
  const PASOS_G = [[T.vuelta0, T.vuelta0 + 0.17, "cerca", 532, 16], [T.vuelta0 + 0.12, T.vuelta0 + 0.32, "lejos", 590, 16],
    [T.vuelta0 + 0.28, T.vuelta0 + 0.48, "cerca", 674.5, 16], [T.vuelta0 + 0.44, T.vuelta0 + 0.62, "lejos", 616, 12]];
  const MANOS_G_C = [[0, 0, C_.flamenco], [T.lio0, T.lio1, C_.lio],
    [T.saltos1, T.saltos1 + 0.1, C_.te, suave, 1], [T.saltos1 + 0.2, T.cruza1 + 0.05, C_.muslo, suave, -1], [T.vuelta0, T.vuelta0 + 0.2, C_.bols]];
  const L_AGARRA = { pant: (dir, tt) => { const a = agarre(tt); return { x: a.x + 7, y: a.y - 1 }; }, dobla: -1, dedos: GRIP };
  const MANOS_G_L = [[0, 0, L_.flamenco], [T.lio0, T.lio1, L_.lio, suave, 1],
    [T.saltos1, T.saltos1 + 0.1, L_.te, suave, -1], [T.saltos1 + 0.2, T.cruza1 + 0.05, L_.suelo, suave, 1],
    [T.ofrece0 + 0.1, T.agarra, L_AGARRA, suave, -1], [T.vuelta0, T.vuelta0 + 0.25, L_.bols, suave, 1]];
  const CARA_G = [
    [T.lio0, T.lio0 + 0.12, "lio"], [T.saltos0 + 0.1, T.saltos0 + 0.2, "panico"], [T.cruza1 - 0.03, T.cruza1 + 0.02, "golpe"],
    [T.cruza1 + 0.08, T.cruza1 + 0.2, "mareo"], [T.ofrece0 + 0.05, T.ofrece0 + 0.2, "agarra"], [T.tira0, T.tira0 + 0.12, "tirado"],
    [T.tira1 - 0.1, T.tira1 + 0.05, "gApreton"], [T.vuelta0 + 0.1, T.vuelta0 + 0.3, "camina"], [T.vuelta1 - 0.1, T.vuelta1, "calma"]
  ];
  const PARP_G = [10.95, 11.9, 12.4];
  // giro de Guillermo: tarde y pasado de vuelta; luego otro al cruzar el marco
  function giroG(t) {
    let a = Math.PI * 2 * suave(fase(t, T.gGiro0, T.gGiro1));
    if (t > T.gGiro1) { const u = t - T.gGiro1; a += 0.9 * Math.sin(u * 12) * Math.exp(-u * 5); }
    a += Math.PI * 2 * suave(fase(t, T.saltos1, T.cruza1 - 0.02));
    return Math.cos(a);
  }
  // tambaleo del lío: gira todo su dibujo alrededor de los pies
  function vuelcoG(t, X) {
    const k = campana(t, T.lio0, T.saltos1);
    return { a: 0.1 * Math.sin((t - T.lio0) * 10) * k, piv: { x: X, y: SUELO } };
  }
  // el despiste: sube el brazo cercano en vez del lejano y lo cambia
  const OOPS = [7.94, 8.0, 8.1, 8.22];
  const pesoOops = t => tramo(t, OOPS[0], OOPS[1]) * (1 - tramo(t, OOPS[2], OOPS[3]));

  function poseG(t) {
    const tl = t - retraso(t), w = W_G(t);
    const bs = linea(GUION_C, CU, "admira", tl);
    const bo = linea(GUION_G, CU, "flamenco", t);
    const b = mezclaE(bs, bo, w);
    const X = lerp(XG0, X_G(t), w);
    const respira = Math.sin(tl * 2.1 + 0.3);
    const p = { x: X, suelo: SUELO - b.sube - (w > 0 ? subeG(t) * w : 0), s: S, espejo: true,
      tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x + b.pdx, y: G.PELVIS.y + b.pdy }, torso: b.torso, torsoEsc: { x: b.ex, y: b.ey + respira * 0.006 },
      cabeza: { ang: b.ca, dx: b.cdx, dy: b.cdy, esc: { x: 1, y: 1 } } };
    // mareado: la cabeza da vueltas
    const mar = campana(t, T.cruza1, T.ofrece0 + 0.2);
    p.cabeza.ang += 0.08 * Math.sin(t * 9) * mar; p.cabeza.dx += 10 * Math.cos(t * 9) * mar;
    // pies
    const pS = piesDeCuerpo(G, bs), pO = piesDeCuerpo(G, bo);
    let pw = pO;
    if (t > T.vuelta0 && t < T.vuelta1 + 0.05) {
      const ini = { cerca: 440 - PIE_DEF.cerca * S, lejos: 440 - PIE_DEF.lejos * S };
      pw = piesDePasos(G, p, pasos(ini, PASOS_G, t));
    }
    p.piernas = w > 0 ? mezclaPies(pS, pw, w) : pS;
    // cara: copia la de Paradigma con retraso… y lo que le pasa a él
    const es = linea(GUION_CA, CA, "admira", tl);
    const ov = pesoOops(t);
    let e = ov > 0 ? mezclaE(es, CA.oops, campana(t, 8.06, 8.3) * 0.9) : es;
    e = mezclaE(e, linea(CARA_G, CA, "flamenco", t), w);
    // el apuro: se le suben un poco las cejas cuando va tarde
    const apuro = tramo(t, 6.0, 7.0) * (1 - w);
    e.sd += 5 * apuro; e.si += 5 * apuro;
    p.cara = cara(e, Math.max(parpadeo(tl, PARP), parpadeo(t, PARP_G) * w));
    p.sudor = 0.35 * tramo(t, 5.55, 5.9) + 0.55 * tramo(t, 6.6, 7.6) * (1 - tramo(t, 11.6, 12.2));
    p.rojo = 0.5 * campana(t, 8.02, 8.4) + 0.45 * campana(t, T.lio0, T.saltos1 + 0.2);
    // manos
    let mc = pista(G, p, "cerca", MANOS_C, tl), ml = pista(G, p, "lejos", MANOS_L, tl);
    if (ov > 0) {          // el brazo equivocado
      mc = mezclaMano(mc, resuelve(G, p, "cerca", C_.arriba, tl), ov, 1);
      ml = mezclaMano(ml, resuelve(G, p, "lejos", L_.abajo, tl), ov);
    }
    if (w > 0) {
      mc = mezclaMano(mc, pista(G, p, "cerca", MANOS_G_C, t), w);
      ml = mezclaMano(ml, pista(G, p, "lejos", MANOS_G_L, t), w);
    }
    p.manoCerca = mano(G, "cerca", mc); p.manoLejos = mano(G, "lejos", ml);
    p.giro = giroG(t);
    p.vuelco = vuelcoG(t, X);
    return p;
  }

  /* ================= decorado ================= */
  let fondo = null, marco = null;
  const SUELO_FONDO = 462;                // donde empieza el suelo (pie de la pared)
  function damasco(g, x, y) {
    g.save(); g.translate(x, y);
    g.beginPath();
    g.moveTo(0, -24); g.bezierCurveTo(9, -16, 14, -6, 4, 2); g.bezierCurveTo(12, 0, 18, 6, 14, 14); g.bezierCurveTo(8, 10, 4, 12, 0, 22);
    g.bezierCurveTo(-4, 12, -8, 10, -14, 14); g.bezierCurveTo(-18, 6, -12, 0, -4, 2); g.bezierCurveTo(-14, -6, -9, -16, 0, -24);
    g.fill();
    g.beginPath(); g.arc(0, -6, 3, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function cuadroVelero(g, x0, y0, w, h) {
    // marco dorado
    g.save();
    g.fillStyle = "#1b120a"; g.fillRect(x0 - 2, y0 - 2, w + 4, h + 4);
    const gr = g.createLinearGradient(x0, y0, x0 + w, y0 + h);
    gr.addColorStop(0, "#8a6224"); gr.addColorStop(0.45, "#e8c46e"); gr.addColorStop(1, "#7a541c");
    g.fillStyle = gr; g.fillRect(x0, y0, w, h);
    const m = 9, iw = w - 2 * m, ih = h - 2 * m;
    // cielo de atardecer, mar y un velero hacia la derecha (el del otro lado va hacia la izquierda)
    const cielo = g.createLinearGradient(0, y0 + m, 0, y0 + m + ih * 0.6);
    cielo.addColorStop(0, "#3d4f7a"); cielo.addColorStop(1, "#e9a26a");
    g.fillStyle = cielo; g.fillRect(x0 + m, y0 + m, iw, ih * 0.6);
    g.fillStyle = "#2c4f6b"; g.fillRect(x0 + m, y0 + m + ih * 0.6, iw, ih * 0.4);
    g.fillStyle = "#f6dfa0"; g.beginPath(); g.arc(x0 + m + iw * 0.25, y0 + m + ih * 0.5, 9, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(246,223,160,0.6)"; g.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x0 + m + iw * 0.12 + i * 3, y0 + m + ih * (0.66 + i * 0.07)); g.lineTo(x0 + m + iw * 0.38 - i * 3, y0 + m + ih * (0.66 + i * 0.07)); g.stroke(); }
    const bx = x0 + m + iw * 0.62, by = y0 + m + ih * 0.72;
    g.fillStyle = "#5a3a22"; g.beginPath(); g.moveTo(bx - 16, by); g.lineTo(bx + 18, by); g.lineTo(bx + 12, by + 6); g.lineTo(bx - 12, by + 6); g.closePath(); g.fill();
    g.strokeStyle = "#2a1a10"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx, by - 30); g.stroke();
    g.fillStyle = "#f4efe2"; g.beginPath(); g.moveTo(bx + 1, by - 30); g.quadraticCurveTo(bx + 18, by - 16, bx + 15, by - 3); g.lineTo(bx + 1, by - 3); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(bx - 1, by - 26); g.lineTo(bx - 1, by - 4); g.lineTo(bx - 12, by - 4); g.closePath(); g.fill();
    g.strokeStyle = "rgba(255,240,200,0.5)"; g.lineWidth = 1; g.strokeRect(x0 + 3, y0 + 3, w - 6, h - 6);
    g.strokeStyle = "#5a3d12"; g.lineWidth = 1.5; g.strokeRect(x0 + m, y0 + m, iw, ih);
    g.restore();
  }
  function lampara(g, x) {
    const yb = SUELO_FONDO + 26, yp = 186;
    // halo en la pared
    const hl = g.createRadialGradient(x, 150, 10, x, 160, 260);
    hl.addColorStop(0, "rgba(255,200,120,0.42)"); hl.addColorStop(0.5, "rgba(255,170,90,0.14)"); hl.addColorStop(1, "rgba(255,160,80,0)");
    g.fillStyle = hl; g.beginPath(); g.arc(x, 160, 260, 0, Math.PI * 2); g.fill();
    g.save();
    g.fillStyle = "rgba(10,6,4,0.35)"; g.beginPath(); g.ellipse(x, yb + 4, 34, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#6e4f1e"; g.beginPath(); g.ellipse(x, yb, 26, 7, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#2c1d0a"; g.lineWidth = 1.5; g.stroke();
    const pg = g.createLinearGradient(x - 4, 0, x + 4, 0); pg.addColorStop(0, "#7a5a22"); pg.addColorStop(0.5, "#e8c46e"); pg.addColorStop(1, "#6a4c1a");
    g.fillStyle = pg; g.fillRect(x - 3.5, yp, 7, yb - yp);
    g.fillStyle = "#c79a40"; g.beginPath(); g.ellipse(x, yp + 60, 7, 4, 0, 0, Math.PI * 2); g.fill();
    // pantalla
    const sg = g.createLinearGradient(x - 50, 0, x + 50, 0);
    sg.addColorStop(0, "#d9a768"); sg.addColorStop(0.5, "#ffe7b8"); sg.addColorStop(1, "#d39a5c");
    g.fillStyle = sg; g.beginPath(); g.moveTo(x - 34, 128); g.lineTo(x + 34, 128); g.lineTo(x + 52, 190); g.lineTo(x - 52, 190); g.closePath(); g.fill();
    g.strokeStyle = "#8a5a2a"; g.lineWidth = 2; g.stroke();
    g.fillStyle = "rgba(255,240,200,0.9)"; g.beginPath(); g.ellipse(x, 190, 52, 6, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(150,90,40,0.5)"; g.lineWidth = 1;
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(x + i * 13, 129); g.lineTo(x + i * 20, 189); g.stroke(); }
    g.restore();
    // luz hacia el suelo
    const lf = g.createRadialGradient(x, 200, 10, x, 320, 220);
    lf.addColorStop(0, "rgba(255,210,140,0.18)"); lf.addColorStop(1, "rgba(255,200,130,0)");
    g.fillStyle = lf; g.beginPath(); g.moveTo(x - 52, 190); g.lineTo(x + 52, 190); g.lineTo(x + 200, 470); g.lineTo(x - 200, 470); g.closePath(); g.fill();
  }
  function consola(g, x) {
    g.save();
    g.fillStyle = "rgba(10,6,4,0.3)"; g.beginPath(); g.ellipse(x, SUELO_FONDO + 8, 52, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#3a2215"; g.fillRect(x - 46, 384, 92, 14);
    g.fillStyle = "#5c3a24"; g.fillRect(x - 48, 380, 96, 6);
    g.strokeStyle = "#1e110a"; g.lineWidth = 1.5; g.strokeRect(x - 48, 380, 96, 18);
    g.fillStyle = "#3a2215";
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x + s * 40, 398); g.quadraticCurveTo(x + s * 46, 430, x + s * 38, SUELO_FONDO + 6); g.lineTo(x + s * 33, SUELO_FONDO + 6); g.quadraticCurveTo(x + s * 38, 430, x + s * 33, 398); g.closePath(); g.fill(); g.stroke(); }
    // jarrón con flores
    g.fillStyle = "#2f5d66"; g.beginPath(); g.moveTo(x - 10, 380); g.quadraticCurveTo(x - 20, 360, x - 8, 342); g.lineTo(x + 8, 342); g.quadraticCurveTo(x + 20, 360, x + 10, 380); g.closePath(); g.fill();
    g.strokeStyle = "#173238"; g.lineWidth = 1.5; g.stroke();
    g.strokeStyle = "#3f6b2e"; g.lineWidth = 2;
    const fl = [[-22, 302, "#e46f6a"], [-6, 292, "#f2c14e"], [10, 298, "#e46f6a"], [24, 312, "#f4efe2"], [-30, 322, "#f2c14e"]];
    for (const [dx, y] of fl) { g.beginPath(); g.moveTo(x, 344); g.quadraticCurveTo(x + dx * 0.4, 320, x + dx, y); g.stroke(); }
    for (const [dx, y, c] of fl) { g.fillStyle = c; for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; g.beginPath(); g.arc(x + dx + Math.cos(a) * 5, y + Math.sin(a) * 5, 4, 0, Math.PI * 2); g.fill(); } g.fillStyle = "#7a4a1a"; g.beginPath(); g.arc(x + dx, y, 3, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  function mitad(g) {
    // pared de damasco
    g.fillStyle = "#21423b"; g.fillRect(-40, -40, 1104, 380);
    const pared = g.createLinearGradient(0, -40, 0, 340);
    pared.addColorStop(0, "rgba(8,14,12,0.45)"); pared.addColorStop(1, "rgba(8,14,12,0)");
    g.fillStyle = pared; g.fillRect(-40, -40, 1104, 380);
    g.fillStyle = "rgba(214,186,120,0.12)";
    for (let fila = 0; fila < 7; fila++) {
      const y = 0 + fila * 58, off = fila % 2 ? 28 : 0;
      for (let j = -11; j <= 11; j++) damasco(g, CX + j * 56 + off, y);
    }
    // moldura de techo y riel de cuadros
    g.fillStyle = "#d8c49a"; g.fillRect(-40, -40, 1104, 46);
    g.fillStyle = "#b39a6a"; g.fillRect(-40, 2, 1104, 4);
    g.fillStyle = "#8a7448"; g.fillRect(-40, 6, 1104, 3);
    g.fillStyle = "#c9a46a"; g.fillRect(-40, 54, 1104, 3);
    // zócalo de nogal con cuarterones
    g.fillStyle = "#4b2f20"; g.fillRect(-40, 330, 1104, SUELO_FONDO - 330);
    g.fillStyle = "#d8c49a"; g.fillRect(-40, 324, 1104, 9);
    g.fillStyle = "#a88a5a"; g.fillRect(-40, 331, 1104, 3);
    for (let k = 0; k < 5; k++) {
      const cx = CX - 70 - 140 * k, x0 = cx - 55;
      g.fillStyle = "#553624"; g.fillRect(x0, 350, 110, 86);
      g.strokeStyle = "#2e1c12"; g.lineWidth = 2; g.strokeRect(x0, 350, 110, 86);
      g.strokeStyle = "rgba(220,170,120,0.25)"; g.lineWidth = 1.5; g.strokeRect(x0 + 4, 354, 102, 78);
    }
    g.fillStyle = "#2a1a12"; g.fillRect(-40, SUELO_FONDO - 14, 1104, 16);
    g.fillStyle = "#6a4a30"; g.fillRect(-40, SUELO_FONDO - 14, 1104, 2);
    // suelo de tablillas
    g.fillStyle = "#7a4a2a"; g.fillRect(-40, SUELO_FONDO, 1104, 680 - SUELO_FONDO);
    let fila = 0;
    for (let y = SUELO_FONDO; y < 640; y += 15, fila++) {
      const off = (fila % 2) * 35;
      for (let x = CX - 70 * 9 + off; x < CX + 70 * 9; x += 70) {
        const h = hash(Math.round(Math.abs(x - CX) / 10) * 1.7 + fila * 3.1);
        g.fillStyle = `rgb(${Math.round(142 + 26 * h)},${Math.round(88 + 18 * h)},${Math.round(50 + 12 * h)})`;
        g.fillRect(x, y, 69, 14);
      }
    }
    g.fillStyle = "rgba(40,20,8,0.5)";
    for (let y = SUELO_FONDO; y < 640; y += 15) g.fillRect(-40, y + 14, 1104, 1);
    const fs = g.createLinearGradient(0, SUELO_FONDO, 0, 640);
    fs.addColorStop(0, "rgba(20,10,4,0.45)"); fs.addColorStop(0.35, "rgba(20,10,4,0.05)"); fs.addColorStop(1, "rgba(20,10,4,0.35)");
    g.fillStyle = fs; g.fillRect(-40, SUELO_FONDO, 1104, 640 - SUELO_FONDO);
    // alfombra persa
    const alf = (dx, top, bot) => { g.beginPath(); g.moveTo(CX - 312 + dx, top); g.lineTo(CX + 312 - dx, top); g.lineTo(CX + 402 - dx * 1.3, bot); g.lineTo(CX - 402 + dx * 1.3, bot); g.closePath(); };
    g.fillStyle = "rgba(10,4,2,0.35)"; alf(-6, 486, 646); g.fill();
    g.fillStyle = "#1f2a4a"; alf(0, 482, 640); g.fill();
    g.fillStyle = "#6e1c22"; alf(16, 490, 632); g.fill();
    g.fillStyle = "#86272c"; alf(30, 498, 624); g.fill();
    g.strokeStyle = "#d8b062"; g.lineWidth = 1.5; alf(16, 490, 632); g.stroke(); alf(30, 498, 624); g.stroke();
    // medallón y motivos
    g.fillStyle = "#1f2a4a"; g.beginPath(); g.ellipse(CX, 562, 128, 34, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#d8b062"; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#b8862e"; g.beginPath(); g.ellipse(CX, 562, 70, 18, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#6e1c22"; g.beginPath(); g.ellipse(CX, 562, 34, 9, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(216,176,98,0.55)";
    for (let i = 0; i < 9; i++) { const x = CX - 280 + i * 70; if (Math.abs(x - CX) < 150) continue; g.beginPath(); g.moveTo(x, 520); g.lineTo(x + 10, 530); g.lineTo(x, 540); g.lineTo(x - 10, 530); g.closePath(); g.fill(); }
    g.fillStyle = "#e8dcc0";
    for (let x = CX - 312; x <= CX + 312; x += 8) g.fillRect(x, 476, 2, 6);
    // lámpara, consola y cuadro (el reflejo los pone al otro lado)
    lampara(g, 92);
    consola(g, 250);
    cuadroVelero(g, 196, 128, 110, 96);
    // luz cálida desde arriba y viñeta
    const arriba = g.createRadialGradient(CX, -80, 40, CX, -80, 620);
    arriba.addColorStop(0, "rgba(255,214,150,0.22)"); arriba.addColorStop(1, "rgba(255,214,150,0)");
    g.fillStyle = arriba; g.fillRect(-40, -40, 1104, 720);
    const vi = g.createRadialGradient(CX, 300, 300, CX, 300, 760);
    vi.addColorStop(0, "rgba(0,0,0,0)"); vi.addColorStop(1, "rgba(0,0,0,0.55)");
    g.fillStyle = vi; g.fillRect(-40, -40, 1104, 720);
  }
  function creaFondo() {
    const a = document.createElement("canvas"); a.width = 1104; a.height = 680;
    const ga = a.getContext("2d"); ga.translate(40, 40); mitad(ga);
    const c = document.createElement("canvas"); c.width = 1104; c.height = 680;
    const g = c.getContext("2d");
    g.drawImage(a, 0, 0, 552, 680, 0, 0, 552, 680);
    g.save(); g.translate(1104, 0); g.scale(-1, 1); g.drawImage(a, 0, 0, 552, 680, 0, 0, 552, 680); g.restore();
    return c;
  }

  /* ---------- el marco del espejo (sin cristal), de tres cuartos ---------- */
  const MARCO = { TL: { x: 460, y: 80 }, TR: { x: 562, y: 98 }, BR: { x: 562, y: 506 }, BL: { x: 460, y: 524 },
    iTL: { x: 486, y: 106 }, iTR: { x: 545, y: 118 }, iBR: { x: 545, y: 490 }, iBL: { x: 486, y: 504 } };
  const PIV_MARCO = { x: 511, y: 516 };
  function creaMarco() {
    const c = document.createElement("canvas"); c.width = 200; c.height = 560;
    const g = c.getContext("2d"); g.translate(-411, -10);
    const M = MARCO;
    const poli = pts => { g.beginPath(); g.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y); g.closePath(); };
    const oro = g.createLinearGradient(458, 0, 566, 0);
    oro.addColorStop(0, "#7d5a1c"); oro.addColorStop(0.1, "#f3d784"); oro.addColorStop(0.2, "#a8781f"); oro.addColorStop(0.27, "#d9b257");
    oro.addColorStop(0.5, "#9b6f22"); oro.addColorStop(0.78, "#e9c96e"); oro.addColorStop(0.9, "#8a6420"); oro.addColorStop(1, "#c79c42");
    // la moldura: el contorno de fuera menos el hueco
    g.save();
    g.beginPath();
    g.moveTo(M.TL.x, M.TL.y); g.lineTo(M.TR.x, M.TR.y); g.lineTo(M.BR.x, M.BR.y); g.lineTo(M.BL.x, M.BL.y); g.closePath();
    g.moveTo(M.iTL.x, M.iTL.y); g.lineTo(M.iBL.x, M.iBL.y); g.lineTo(M.iBR.x, M.iBR.y); g.lineTo(M.iTR.x, M.iTR.y); g.closePath();
    g.fillStyle = oro; g.fill("evenodd");
    g.lineJoin = "round"; g.strokeStyle = "#3b2708"; g.lineWidth = 2.5; g.stroke();
    g.restore();
    // canto interior (sombra) y brillo
    g.save();
    g.strokeStyle = "rgba(60,36,6,0.7)"; g.lineWidth = 4;
    poli([{ x: M.iTL.x - 3, y: M.iTL.y - 3 }, { x: M.iTR.x + 3, y: M.iTR.y - 3 }, { x: M.iBR.x + 3, y: M.iBR.y + 3 }, { x: M.iBL.x - 3, y: M.iBL.y + 3 }]); g.stroke();
    g.strokeStyle = "rgba(255,245,200,0.55)"; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(M.TL.x + 7, M.TL.y + 10); g.lineTo(M.BL.x + 7, M.BL.y - 10); g.stroke();
    g.beginPath(); g.moveTo(M.TL.x + 10, M.TL.y + 7); g.lineTo(M.TR.x - 8, M.TR.y + 6); g.stroke();
    // perlas a lo largo de las molduras
    g.fillStyle = "rgba(255,236,170,0.75)";
    for (let i = 0; i <= 26; i++) { const k = i / 26; g.beginPath(); g.arc(lerp(M.TL.x, M.BL.x, k) + 17, lerp(M.TL.y, M.BL.y, k) + 4 + 12 * (1 - k), 1.6, 0, Math.PI * 2); g.fill(); }
    for (let i = 0; i <= 22; i++) { const k = i / 22; g.beginPath(); g.arc(lerp(M.TR.x, M.BR.x, k) - 10, lerp(M.TR.y, M.BR.y, k) + 6 * (1 - k), 1.3, 0, Math.PI * 2); g.fill(); }
    // rosetas en las esquinas
    const roseta = (x, y, r) => { g.fillStyle = "#e9c96e"; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#5a3d0e"; g.lineWidth = 1.2; g.stroke();
      g.fillStyle = "#a8781f"; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; g.beginPath(); g.arc(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.28, 0, Math.PI * 2); g.fill(); } };
    roseta(M.TL.x + 12, M.TL.y + 12, 9); roseta(M.TR.x - 8, M.TR.y + 10, 7); roseta(M.BL.x + 12, M.BL.y - 12, 9); roseta(M.BR.x - 8, M.BR.y - 9, 7);
    // volutas en los largueros
    g.strokeStyle = "#5a3d0e"; g.lineWidth = 2;
    for (const [x, y, s] of [[M.TL.x + 12, 300, 1], [M.TR.x - 8, 300, 0.75]]) {
      g.beginPath(); g.arc(x, y - 16 * s, 6 * s, Math.PI * 0.5, Math.PI * 2.2); g.stroke();
      g.beginPath(); g.arc(x, y + 16 * s, 6 * s, -Math.PI * 0.5, Math.PI * 1.2); g.stroke();
      g.fillStyle = "#f3d784"; g.beginPath(); g.ellipse(x, y, 5 * s, 9 * s, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    // la concha de arriba
    const cx = 509, cy = 86;
    g.fillStyle = "#e3bd62"; g.strokeStyle = "#4a3108"; g.lineWidth = 1.8;
    g.beginPath(); g.moveTo(cx - 34, cy + 6);
    for (let i = 0; i <= 7; i++) { const a = Math.PI + i * Math.PI / 7, r = 30 + (i % 2) * 4; g.quadraticCurveTo(cx + Math.cos(a - 0.2) * (r + 8), cy + Math.sin(a - 0.2) * (r + 8) - 6, cx + Math.cos(a) * r, cy + Math.sin(a) * r - 4); }
    g.lineTo(cx + 34, cy + 6); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "rgba(90,60,14,0.8)"; g.lineWidth = 1.3;
    for (let i = 1; i < 7; i++) { const a = Math.PI + i * Math.PI / 7; g.beginPath(); g.moveTo(cx, cy + 4); g.lineTo(cx + Math.cos(a) * 28, cy + Math.sin(a) * 28 - 4); g.stroke(); }
    g.fillStyle = "#f6e09a"; g.beginPath(); g.ellipse(cx, cy + 4, 7, 5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    // patas: la delantera grande y la trasera pequeña, y el travesaño
    g.fillStyle = "#b28030"; g.strokeStyle = "#3b2708"; g.lineWidth = 1.8;
    g.beginPath(); g.moveTo(M.BL.x - 4, M.BL.y - 4); g.quadraticCurveTo(M.BL.x - 18, M.BL.y + 4, M.BL.x - 14, M.BL.y + 12); g.lineTo(M.BL.x + 26, M.BL.y + 10); g.quadraticCurveTo(M.BL.x + 30, M.BL.y + 2, M.BL.x + 22, M.BL.y - 4); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(M.BR.x - 18, M.BR.y - 2); g.quadraticCurveTo(M.BR.x - 2, M.BR.y + 2, M.BR.x + 8, M.BR.y + 8); g.lineTo(M.BR.x - 22, M.BR.y + 8); g.closePath(); g.fill(); g.stroke();
    g.restore();
    return c;
  }
  function dibMarco(g, t) {
    // se bambolea cuando Guillermo lo cruza
    const u = t - (T.saltos1 + 0.12);
    const a = u > 0 ? 0.045 * Math.sin(u * 16) * Math.exp(-u * 3.2) : 0;
    g.save(); g.fillStyle = "rgba(12,6,2,0.45)"; g.beginPath(); g.ellipse(PIV_MARCO.x - 2, PIV_MARCO.y + 6, 74, 9, -0.12, 0, Math.PI * 2); g.fill(); g.restore();
    g.save(); g.translate(PIV_MARCO.x, PIV_MARCO.y); g.rotate(a); g.translate(-PIV_MARCO.x, -PIV_MARCO.y);
    g.drawImage(marco, 411, 10);
    g.restore();
  }

  /* ---------- personajes ---------- */
  function dibPersonaje(Rg, g, p, t) {
    g.save();
    const v = p.vuelco;
    if (v && Math.abs(v.a) > 1e-4) { g.translate(v.piv.x, v.piv.y); g.rotate(v.a); g.translate(-v.piv.x, -v.piv.y); }
    if (Math.abs(p.giro - 1) > 1e-4) { const cx = Rg.aPantalla(p, p.pelvis).x; g.translate(cx, 0); g.scale(p.giro, 1); g.translate(-cx, 0); }
    // sombra en el suelo
    const sx = Rg.aPantalla(p, p.pelvis).x, alto = SUELO - p.suelo;
    g.save(); g.fillStyle = `rgba(12,4,2,${0.32 - alto * 0.003})`; g.beginPath(); g.ellipse(sx, SUELO - 2, 62 - alto * 0.3, 8, 0, 0, Math.PI * 2); g.fill(); g.restore();
    Rg.dibujar(g, p, t);
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrella(g, x, y, r, a, col) {
    g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = col; g.beginPath();
    for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.38 : r, aa = i * Math.PI / 4; if (i) g.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); else g.moveTo(rr, 0); }
    g.closePath(); g.fill(); g.restore();
  }
  function remolino(g, cx, cy, t, t0, t1, r) {         // rayas de giro alrededor del cuerpo
    const k = campana(t, t0, t1); if (k <= 0) return;
    g.save(); g.strokeStyle = `rgba(255,248,225,${0.7 * k})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const y = cy - 120 + i * 90, a0 = t * 14 + i; g.beginPath(); g.ellipse(cx, y, r, 14, 0, a0, a0 + 2.2); g.stroke(); }
    g.restore();
  }
  function polvo(g, x, y, t, t0, esc = 1) {
    const k = fase(t, t0, t0 + 0.7); if (k <= 0 || k >= 1) return;
    g.save();
    for (let i = 0; i < 8; i++) {
      const sg = i % 2 ? 1 : -1, d = (14 + 60 * k) * (0.6 + 0.6 * hash(i * 3.1)) * esc;
      g.globalAlpha = 0.5 * (1 - k); g.fillStyle = "#e7cfae";
      g.beginPath(); g.arc(x + sg * d * (0.5 + i * 0.12), y - 6 - 20 * k * hash(i * 7.7), (7 + 11 * k) * esc * (0.6 + 0.4 * hash(i)), 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  function golpeFx(g, x, y, t, t0) {
    const k = campana(t, t0, t0 + 0.28); if (k <= 0) return;
    g.save(); g.strokeStyle = `rgba(255,250,230,${k})`; g.lineWidth = 2.6; g.lineCap = "round";
    for (let i = 0; i < 6; i++) { const a = -Math.PI * (0.12 + i * 0.15); g.beginPath(); g.moveTo(x + Math.cos(a) * 16, y + Math.sin(a) * 16); g.lineTo(x + Math.cos(a) * (32 + 10 * k), y + Math.sin(a) * (32 + 10 * k)); g.stroke(); }
    g.restore();
  }
  function rayitas(g, c, t, t0, t1, r0 = 50, n = 5, a0 = -2.4, da = 0.45) {   // sobresalto / «¡ups!»
    const k = campana(t, t0, t1); if (k <= 0) return;
    g.save(); g.strokeStyle = `rgba(255,250,235,${k})`; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < n; i++) { const a = a0 + i * da; g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0); g.lineTo(c.x + Math.cos(a) * (r0 + 12 + 6 * k), c.y + Math.sin(a) * (r0 + 12 + 6 * k)); g.stroke(); }
    g.restore();
  }
  function centroCab(Rg, p) {               // centro de la cabeza en pantalla (con giro y vuelco)
    let s = Rg.aPantalla(p, Rg.centroCabeza(p));
    if (Math.abs(p.giro - 1) > 1e-4) { const cx = Rg.aPantalla(p, p.pelvis).x; s = { x: cx + (s.x - cx) * p.giro, y: s.y }; }
    const v = p.vuelco; if (v && v.a) { const r = rota({ x: s.x - v.piv.x, y: s.y - v.piv.y }, v.a); s = { x: v.piv.x + r.x, y: v.piv.y + r.y }; }
    return s;
  }
  function estrellitas(g, t, c, t0, t1) {
    const k = campana(t, t0, t1); if (k <= 0.01) return;
    for (let i = 0; i < 4; i++) { const a = t * 5 + i * Math.PI / 2; g.save(); g.globalAlpha = clamp(k * 1.6); estrella(g, c.x + Math.cos(a) * 40, c.y - 62 + Math.sin(a) * 10, 6, t * 3 + i, "#fff2a8"); g.restore(); }
  }
  function destello(g, x, y, t, t0, r = 16) {
    const k = campana(t, t0, t0 + 0.4); if (k <= 0) return;
    g.save(); g.globalAlpha = k; estrella(g, x, y, r * (0.6 + 0.6 * k), t0 + (t - t0) * 2, "#fff7cf");
    g.strokeStyle = `rgba(255,247,207,${k})`; g.lineWidth = 1.8;
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; g.beginPath(); g.moveTo(x + Math.cos(a) * r * 1.2, y + Math.sin(a) * r * 1.2); g.lineTo(x + Math.cos(a) * r * 1.9, y + Math.sin(a) * r * 1.9); g.stroke(); }
    g.restore();
  }
  function bambola(g, t, X) {            // rayitas de tambaleo a los lados de Guillermo
    const k = campana(t, T.lio0 + 0.1, T.saltos0 + 0.1); if (k <= 0) return;
    g.save(); g.strokeStyle = `rgba(255,250,235,${0.8 * k})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const x = X + s * (78 + i * 12), y = 300 + i * 14;
      g.beginPath(); g.arc(x, y, 18, s > 0 ? -0.9 : Math.PI - 0.9 + 1.8 * 0, s > 0 ? 0.9 : Math.PI + 0.9); g.stroke(); }
    g.restore();
  }
  function apretonFx(g, t) {
    const k = campana(t, T.tira1, T.apreton1); if (k <= 0) return;
    const a = agarre(t);
    g.save(); g.strokeStyle = `rgba(255,250,235,${0.85 * k})`; g.lineWidth = 2; g.lineCap = "round";
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(a.x - 22, a.y + s * 22); g.lineTo(a.x - 30, a.y + s * 30); g.stroke(); g.beginPath(); g.moveTo(a.x + 22, a.y + s * 22); g.lineTo(a.x + 30, a.y + s * 30); g.stroke(); }
    g.restore();
  }

  /* ---------- cámara ---------- */
  const PLANOS = [[0, 1.0, 512, 300], [4.95, 1.0, 512, 300], [5.3, 1.08, 512, 280], [5.85, 1.08, 512, 280], [6.15, 1.0, 512, 300],
    [9.9, 1.0, 512, 300], [10.35, 1.03, 470, 300], [12.0, 1.03, 470, 300], [12.8, 1.0, 512, 300], [13.5, 1.05, 512, 292], [DUR, 1.06, 512, 290]];
  function camara(t) {
    let i = 0; while (i < PLANOS.length - 2 && t > PLANOS[i + 1][0]) i++;
    const a = PLANOS[i], b = PLANOS[i + 1], k = suave(fase(t, a[0], b[0]));
    const kk = lerp(a[1], b[1], k), x = lerp(a[2], b[2], k), y = lerp(a[3], b[3], k);
    const tem = campana(t, T.cruza1, T.cruza1 + 0.3);
    return { k: kk, x: x + tem * 3 * ruido(t * 34), y: y + tem * 2.5 * ruido(t * 29 + 4) };
  }

  /* ---------- poses (con caché por fotograma) ---------- */
  let cacheT = -1, cacheV = null;
  function poseCache(t) {
    if (t !== cacheT) { cacheT = t; cacheV = { p: poseP(t), g: poseG(t) }; }
    return cacheV;
  }
  const pose = t => { const v = poseCache(t); return { g: v.g, p: v.p }; };

  class GuillermoParadigmaReflejo extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !P.listo()) return;
      if (!fondo) { fondo = creaFondo(); marco = creaMarco(); }
      const v = poseCache(t), pG = v.g, pP = v.p;
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      g.drawImage(fondo, -40, -40);
      dibMarco(g, t);
      // Guillermo y luego Paradigma (su mano queda encima al agarrarse)
      dibPersonaje(G, g, pG, t);
      dibPersonaje(P, g, pP, t);
      // efectos
      const cP = centroCab(P, pP), cG = centroCab(G, pG);
      remolino(g, P.aPantalla(pP, pP.pelvis).x, 330, t, T.giro0, T.giro1 + 0.05, 70);
      remolino(g, G.aPantalla(pG, pG.pelvis).x, 340, t, T.gGiro0, T.gGiro1 + 0.08, 70);
      remolino(g, G.aPantalla(pG, pG.pelvis).x, 400, t, T.saltos1, T.cruza1, 60);
      if (t > T.flamenco - 0.1 && t < T.flamenco + 0.5) { const m = pP.manoLejos; const s = P.aPantalla(pP, m); destello(g, s.x + 4, s.y - 30, t, T.flamenco); }
      rayitas(g, cG, t, 8.06, 8.36, 70, 5, -2.5, 0.45);
      bambola(g, t, G.aPantalla(pG, pG.pelvis).x);
      polvo(g, G.aPantalla(pG, pG.pelvis).x, SUELO - 4, t, T.cruza1, 1.1);
      golpeFx(g, G.aPantalla(pG, pG.pelvis).x, SUELO - 24, t, T.cruza1);
      estrellitas(g, t, cG, T.cruza1 + 0.05, T.ofrece0 + 0.25);
      rayitas(g, cP, t, T.pApartado0, T.pApartado0 + 0.35, 66, 6, -2.6, 0.42);
      apretonFx(g, t);
      if (t > T.guino0) { destello(g, cP.x + 26, cP.y - 18, t, T.guino0 + 0.05, 10); destello(g, cG.x - 26, cG.y - 18, t, T.guino0 + 0.05, 10); }
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00107", nombre: "Guillermo y Paradigma · El espejo", crear: () => new GuillermoParadigmaReflejo() });
  function diag(t) {
    const v = poseCache(t), o = {};
    const dist = (Rg, p, lado) => { const m = lado === "cerca" ? p.manoCerca : p.manoLejos, h = HOMBRO(Rg, p, lado), L = LARGO(Rg, lado);
      const w = { x: m.x + Math.cos(m.mu) * R_M, y: m.y + Math.sin(m.mu) * R_M };
      return +(Math.hypot(w.x - h.x, w.y - h.y) / L).toFixed(3); };
    o.gC = dist(G, v.g, "cerca"); o.gL = dist(G, v.g, "lejos"); o.pC = dist(P, v.p, "cerca"); o.pL = dist(P, v.p, "lejos");
    o.pLs = P.aPantalla(v.p, v.p.manoLejos); o.gLs = G.aPantalla(v.g, v.g.manoLejos);
    return o;
  }
  window.__A2D_00107 = { pose, T, DUR, diag };
})();
