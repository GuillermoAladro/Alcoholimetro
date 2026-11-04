"use strict";
/* 00087.2 · Guillermo y Kiriku · El baile de salón
 *
 * Negro → salón de baile de noche: paredes de marfil con molduras doradas, dos ventanales en arco con
 * el jardín y la luna, cortinas de terciopelo granate con alzapaños, un espejo dorado en el centro,
 * apliques de velas, una lámpara de araña de cristal que se mece y destella, parqué encerado que
 * brilla, y un gramófono en el rincón del que salen notas al compás de un vals (tres tiempos).
 * Kiriku, muy erguido y con la barbilla alta, se pone en posición (una mano en el aire y la otra a
 * la espalda) y hace el paso del vals él solo: adelante-lado-junta con su subida y bajada, y atrás
 * con una vuelta entera, suavísimo → le cede el turno a Guillermo con la palma hacia arriba; él se
 * señala («¿yo?»), asiente y lo imita tieso como un soldadito de madera: brazos rígidos, rodillas
 * bloqueadas, la lengua fuera de concentración, pasos a trompicones y una vuelta a golpes que acaba
 * en tambaleo agitando los brazos → Kiriku suspira, se acerca y le caza la mano al vuelo: Guillermo
 * se pone colorado y bailan juntos, Kiriku llevando, dos compases de vals por el salón (Guillermo, en
 * la gloria) → Kiriku sube las manos, le da cuerda con un floreo y lo suelta: Guillermo sale girando
 * solo como una peonza por el parqué hasta salir de cuadro → ¡crac! fuera de plano: tiembla todo,
 * entra una polvareda, la cortina del borde desaparece de un tirón y entra rodando un cuadro dorado
 * que se queda en el suelo → Guillermo vuelve mareado, con los ojos en espiral, envuelto en la
 * cortina como en una capa de rey y con la barra de latón en la mano como un cetro → Kiriku hace
 * una reverencia a cámara con un brazo cruzado en la cintura; Guillermo la imita tambaleándose → negro.
 *
 * Los dos salen de sus avatares 2D (Guillermo y Kiriku). Sin textos. Todo depende del tiempo
 * absoluto. Los giros son aplastados en 2D (escala horizontal cos θ alrededor de la pelvis), nunca
 * una vuelta entera del dibujo. Las manos que se agarran se calculan cada fotograma a partir de la
 * postura del otro (contacto exacto).
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, KI = Kiriku;
  const S = 0.3, SUELO = 548, MURO = 414, DUR = 14.75, TAU = Math.PI * 2;
  const BT = 0.55;                              // un tiempo del vals (tres por compás)
  const T = {
    prep0: 0.45, prep1: 1.0,
    c1: 1.1, c2: 2.75, kGiro0: 3.3, kGiro1: 4.35,           // Kiriku solo
    inv0: 4.45, inv1: 4.85, gYo0: 4.55, gYo1: 4.85, gSi: 4.95,
    gPos0: 5.05, gPos1: 5.35, c3: 5.4, gGiro0: 7.04, gGiro1: 7.64, tamb0: 7.64, tamb1: 8.08,
    kVa0: 7.78, kVa1: 8.34, coge: 8.37,
    c4: 8.5, c5: 10.15, sube: 10.7, cuerda: 10.95, suelta: 11.2,
    sale: 11.95, choque: 12.05,
    vuelve0: 12.38, vuelve1: 13.3,
    kRev0: 12.78, kRev1: 13.2, kRev2: 13.52, kRev3: 13.85,
    gRev0: 13.38, gRev1: 13.72,
    fin: 13.95
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const D5 = (pu, ix, md, an, me) => ({ pulgar: pu, indice: ix, medio: md, anular: an, menique: me });
  const D = (pu, ix, md, re) => D5(pu, ix, md, re, re);
  const angDif = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const lerpAng = (a, b, k) => a + angDif(a, b) * k;
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  // golpe seco: casi todo el recorrido en el primer tercio, con un pelín de rebote (movimiento de muñeco)
  const seco = k => { k = clamp(k); const a = 1 - Math.pow(1 - clamp(k * 2.4), 3); return a + 0.08 * Math.sin(Math.PI * clamp((k - 0.35) / 0.65)) * (k > 0.35 ? 1 : 0); };
  const TINTA = "#141018";

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, rub: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* =====================================================================================
   * PASOS: cada pie va de la posición anterior a la nueva con un arco (sin deslizar)
   * [t0, t1, x de pantalla, alto (hoja), curva]
   * ===================================================================================== */
  function pie(lista, t) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x, alto, cur] = lista[i], prev = i > 0 ? lista[i - 1] : lista[i];
    const u = fase(t, t0, t1), k = (cur || suave5)(u);
    const anda = Math.abs(prev[2] - x) > 2 ? Math.sin(Math.PI * clamp(u)) : 0;
    return { x: lerp(prev[2], x, k), alto: lerp(prev[3], alto, k) + 34 * anda * (Math.abs(x - prev[2]) > 30 ? 1 : 0.6), u, anda };
  }
  // subida y bajada del vals en un compás que empieza en c: baja en el 1, sube en el 2 y el 3, baja al final
  const SUB_K = [[0, 0], [0.12, 1], [0.38, -0.85], [0.86, -1], [1, 0]];
  function subida(t, c, dur = 3 * BT) {
    const u = (t - c) / dur; if (u <= 0 || u >= 1) return 0;
    let i = 0; while (i + 1 < SUB_K.length - 1 && u > SUB_K[i + 1][0]) i++;
    const [u0, v0] = SUB_K[i], [u1, v1] = SUB_K[i + 1];
    return lerp(v0, v1, suave((u - u0) / (u1 - u0)));          // + = rodillas dobladas, − = de puntillas
  }

  /* =====================================================================================
   * KIRIKU (derecha, reflejado: mira a la izquierda; su pie lejano es el de delante)
   * ===================================================================================== */
  const XK0 = 650;
  const KL0 = XK0 - 23, KC0 = XK0 + 22;
  const PASOS_K = {
    lejos: [[-9, -8, KL0, 0],
      [T.c1, T.c1 + 0.4, KL0 - 50, 0], [T.c1 + 2 * BT, T.c1 + 2 * BT + 0.25, KL0 - 44, 0],
      [T.kGiro0, T.kGiro0 + 0.42, KL0 + 1, 0],
      [T.kVa0, T.kVa0 + 0.2, KL0 - 50, 0], [T.kVa0 + 0.37, T.kVa0 + 0.57, 511, 0],
      [T.c4, T.c4 + 0.4, 456, 0], [T.c4 + 2 * BT, T.c4 + 2 * BT + 0.25, 462, 0],
      [T.c5 + BT, T.c5 + BT + 0.4, 502, 0]],
    cerca: [[-9, -8, KC0, 0],
      [T.c1 + BT, T.c1 + BT + 0.38, KC0 - 57, 0],
      [T.c2, T.c2 + 0.4, KC0 - 5, 0], [T.c2 + 2 * BT, T.c2 + 2 * BT + 0.28, KC0, 0],
      [T.kVa0 + 0.2, T.kVa0 + 0.4, 556, 0],
      [T.c4 + BT, T.c4 + BT + 0.38, 490, 0],
      [T.c5, T.c5 + 0.4, 538, 0]]
  };
  const CK = {
    inicio: E({ mx: 0.6, my: 0.1, c: 0.25, sd: 4, si: 6, sonr: 0.4, ancho: 0.9 }),
    posh: E({ mx: -0.5, my: -0.3, c: 0.55, sd: 10, si: 8, sonr: 0.55, ancho: 0.9 }),
    baila: E({ mx: 0, my: -0.3, c: 0.82, h: 0.35, sd: 12, si: 10, sonr: 0.7, ancho: 0.95 }),
    invita: E({ mx: 0.9, my: 0.15, c: 0.2, sd: 14, si: 8, gi: -0.05, sonr: 0.75, ancho: 1 }),
    juzga: E({ mx: 0.9, my: 0.25, c: 0.35, sd: 22, gd: 0.12, si: -2, gi: -0.06, sonr: 0.05, ancho: 0.7 }),
    mueca: E({ mx: 0.9, my: 0.1, c: 0.6, z: 0.5, sd: 18, gd: 0.15, si: 16, gi: 0.12, sonr: -0.25, ancho: 0.75 }),
    paciencia: E({ mx: 0.9, my: 0.1, c: 0.45, h: 0.2, sd: 8, si: 8, sonr: 0.5, ancho: 0.9 }),
    lleva: E({ mx: 0.9, my: 0.05, c: 0.3, sd: 10, si: 10, sonr: 0.8, ancho: 1 }),
    floreo: E({ mx: 0.9, my: -0.35, c: 0.2, sd: 16, si: 12, sonr: 0.85, ancho: 1, abre: 4 }),
    sigue: E({ mx: 1, my: 0.05, c: 0.05, sd: 22, si: 20, sonr: 0.2, ancho: 0.7, abre: 6 }),
    encoge: E({ mx: 0.6, my: 0.2, c: 1, z: 1, sd: 18, gd: 0.2, si: 18, gi: 0.2, sonr: -0.4, ancho: 0.8, abre: 4 }),
    asoma: E({ mx: 1, my: 0.1, cd: 1, z: 0.6, ci: 0.15, sd: 10, si: 22, gi: 0.1, sonr: -0.1, ancho: 0.8 }),
    reverencia: E({ mx: 0.2, my: 0.6, c: 0.9, h: 0.6, sd: 8, si: 8, sonr: 0.6, ancho: 0.95 }),
    final: E({ mx: -0.4, my: 0.05, c: 0.15, sd: 14, si: 10, gi: 0.04, sonr: 0.9, ancho: 1.02 })
  };
  const GUION_CK = [
    [T.prep0, T.prep1, "posh"], [T.c1 + 0.1, T.c1 + 0.5, "baila"], [T.inv0, T.inv0 + 0.25, "invita"], [T.gPos0 + 0.1, T.gPos0 + 0.35, "juzga"],
    [T.tamb0, T.tamb0 + 0.12, "mueca"], [T.kVa0 + 0.05, T.kVa0 + 0.3, "paciencia"], [T.c4, T.c4 + 0.4, "lleva"],
    [T.sube, T.sube + 0.3, "floreo"], [T.suelta + 0.15, T.suelta + 0.35, "sigue"], [T.choque, T.choque + 0.06, "encoge"],
    [T.choque + 0.38, T.choque + 0.55, "asoma"], [T.kRev0, T.kRev0 + 0.3, "reverencia"], [T.kRev2, T.kRev3, "final"]
  ];
  const PARP_K = [0.35, 4.98, 6.3, 9.35, 11.75, 13.95];
  const P0K = { torso: -0.03, cab: -0.04, dy: 0 };
  const CuK = o => Object.assign({}, P0K, o);
  const CUER_K = {
    quieto: CuK({}),
    posh: CuK({ torso: -0.06, cab: -0.13 }),
    baila: CuK({ torso: -0.05, cab: -0.12 }),
    invita: CuK({ torso: 0.07, cab: 0.1 }),
    juzga: CuK({ torso: -0.04, cab: 0.02 }),
    lleva: CuK({ torso: -0.04, cab: -0.04 }),
    floreo: CuK({ torso: -0.1, cab: -0.14 }),
    encoge: CuK({ torso: 0.08, cab: 0.16, dy: 10 }),
    asoma: CuK({ torso: 0.02, cab: 0.06, dy: 4 }),
    reverencia: CuK({ torso: 0.5, cab: 0.32 }),
    final: CuK({ torso: -0.05, cab: -0.1 })
  };
  const GUION_K = [
    [T.prep0, T.prep1, "posh"], [T.c1, T.c1 + 0.3, "baila"], [T.inv0, T.inv1, "invita"], [T.gPos0, T.gPos0 + 0.4, "juzga"],
    [T.c4 - 0.2, T.c4 + 0.2, "lleva"], [T.sube, T.sube + 0.3, "floreo"], [T.suelta + 0.2, T.suelta + 0.5, "lleva"],
    [T.choque, T.choque + 0.08, "encoge", salida], [T.choque + 0.35, T.choque + 0.6, "asoma"],
    [T.kRev0, T.kRev1, "reverencia"], [T.kRev2, T.kRev3, "final"]
  ];
  // compases en los que baila con su subida y bajada
  const COMP_K = [[T.c1, 1], [T.c2, 1], [T.c4, 1], [T.c5, 0.8]];
  const TOB_K = KI.SUELO - KI.TOBILLO_ALTO;
  // giro aplastado de Kiriku (una vuelta entera en el compás 2)
  const giroK = t => TAU * suave(fase(t, T.kGiro0, T.kGiro1));

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha; su pie lejano es el de delante)
   * ===================================================================================== */
  const XG0 = 330;
  const GL0 = XG0 + 23, GC0 = XG0 - 23;
  // el compás tieso: pasos de soldadito (pierna recta, a golpes)
  const PASOS_G = {
    lejos: [[-9, -8, GL0, 0],
      [T.c3, T.c3 + 0.3, GL0 + 40, 0, seco], [T.c3 + 2 * BT, T.c3 + 2 * BT + 0.22, GL0 + 38, 0, seco],
      [T.c4 + BT, T.c4 + BT + 0.38, 330, 0], [T.c5, T.c5 + 0.4, 380, 0]],
    cerca: [[-9, -8, GC0, 0],
      [T.c3 + BT, T.c3 + BT + 0.3, GC0 + 38, 0, seco],
      [T.c4, T.c4 + 0.4, 290, 0], [T.c4 + 2 * BT, T.c4 + 2 * BT + 0.25, 296, 0],
      [T.c5 + BT, T.c5 + BT + 0.4, 340, 0]]
  };
  const CG = {
    inicio: E({ mx: 0.85, my: 0, sd: 2, si: 2, sonr: 0.2 }),
    asombro: E({ mx: 0.9, my: -0.1, iris: 0.95, sd: 20, gd: 0.1, si: 18, gi: 0.08, abre: 9, ancho: 0.55, sonr: 0.1 }),
    sigue: E({ mx: 0.95, my: -0.05, sd: 16, si: 14, abre: 5, ancho: 0.6, sonr: 0.3 }),
    yo: E({ mx: 0.9, my: 0.05, iris: 1.05, sd: 24, gd: 0.15, si: 22, gi: 0.14, abre: 4, ancho: 0.7, sonr: 0.25 }),
    decidido: E({ mx: 0.85, my: 0, sd: -10, gd: -0.12, si: -8, gi: -0.1, sonr: 0.45, ancho: 1 }),
    tieso: E({ mx: 0.6, my: 0.5, c: 0.25, sd: -8, gd: -0.15, si: 14, gi: 0.1, sonr: 0, ancho: 0.62 }),
    alarma: E({ mx: 0.5, my: -0.4, iris: 0.85, sd: 26, gd: 0.2, si: 26, gi: 0.2, abre: 18, ancho: 0.6, sonr: -0.2 }),
    sorpresa: E({ mx: 0.9, my: -0.05, iris: 0.9, sd: 24, gd: 0.12, si: 22, gi: 0.1, abre: 6, ancho: 0.55, sonr: 0.15, rub: 0.6 }),
    gloria: E({ mx: 0.8, my: -0.1, c: 0.9, h: 0.9, sd: 12, gd: 0.1, si: 10, gi: 0.08, sonr: 0.75, ancho: 0.9, rub: 0.55 }),
    vuelta: E({ mx: 0.9, my: -0.2, iris: 0.9, sd: 18, si: 20, abre: 12, ancho: 0.62, sonr: 0.35, rub: 0.3 }),
    peonza: E({ esp: 1, sd: 24, si: 24, gd: 0.12, gi: 0.12, abre: 22, ancho: 0.62, sonr: 0.1 }),
    mareo: E({ esp: 1, sd: 14, gd: 0.15, si: 6, gi: -0.1, abre: 6, ancho: 0.8, sonr: 0.55 }),
    reverencia: E({ esp: 0.6, c: 0.5, sd: 10, si: 8, sonr: 0.6, ancho: 0.9 }),
    final: E({ esp: 0.35, mx: -0.6, sd: 12, gd: 0.1, si: 6, sonr: 0.8, ancho: 1, abre: 3 })
  };
  const GUION_CG = [
    [T.c1 - 0.1, T.c1 + 0.25, "asombro"], [T.c2, T.c2 + 0.4, "sigue"], [T.kGiro0 + 0.2, T.kGiro0 + 0.5, "asombro"],
    [T.gYo0, T.gYo0 + 0.15, "yo"], [T.gSi - 0.05, T.gSi + 0.12, "decidido"], [T.gPos0 + 0.1, T.gPos1, "tieso"],
    [T.tamb0, T.tamb0 + 0.1, "alarma"], [T.coge - 0.04, T.coge + 0.1, "sorpresa"], [T.c4 + 0.35, T.c4 + 0.8, "gloria"],
    [T.sube, T.sube + 0.2, "vuelta"], [T.suelta, T.suelta + 0.1, "peonza"],
    [T.vuelve0, T.vuelve0 + 0.1, "mareo"], [T.gRev0, T.gRev0 + 0.2, "reverencia"], [T.gRev1, T.gRev1 + 0.25, "final"]
  ];
  const PARP_G = [0.6, 2.4, 4.2, 7.3, 8.05];
  const COMP_G = [[T.c4, 0.9], [T.c5, 0.7]];
  // lengua de concentración (asoma por la comisura de delante)
  const lenguaG = t => tramo(t, T.gPos0 + 0.1, T.gPos1) * (1 - tramo(t, T.tamb0, T.tamb0 + 0.1));
  // giro aplastado de Guillermo: a golpes en el compás tieso; de peonza al soltarlo
  function giroG(t) {
    if (t < T.suelta) {
      // tres golpes: de frente → de espaldas (reflejado) → otra vez de frente, con paradas
      const a = TAU * 0.5 * suave(fase(t, T.gGiro0, T.gGiro0 + 0.26)) + TAU * 0.5 * suave(fase(t, T.gGiro0 + 0.34, T.gGiro1));
      return a;
    }
    const u = t - T.suelta;
    return TAU * (3.3 * u + 0.4 * u * u);
  }
  const salidaX = t => { const u = fase(t, T.suelta, T.sale); return lerp(360, -230, Math.pow(u, 1.25)); };

  function cuerpo(R, p, lado, b, subeAmt, alto, tobBase) {
    // la subida de puntillas levanta el tobillo y gira el zapato sobre la puntera
    const h = Math.max(0, -subeAmt) * 14, dobla = Math.max(0, subeAmt) * 20;
    return { pel: dobla - h, h };
  }

  /* ---------- manos: modos (coordenadas de la hoja de cada uno) ---------- */
  const mezclaMano = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), ang: lerpAng(a.ang, b.ang, k), mu: lerpAng(a.mu, b.mu, k),
    dedos: Object.fromEntries(Object.keys(a.dedos).map(n => [n, lerp(a.dedos[n], b.dedos[n], k)])),
    dobla: k < 0.5 ? a.dobla : b.dobla, detras: k < 0.5 ? a.detras : b.detras, puno: lerp(a.puno ?? 1, b.puno ?? 1, k) });
  function manoModos(t, lista, modos, ctx) {
    let m = modos[lista[0][2]](ctx, t);
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; m = mezclaMano(m, modos[nom](ctx, t), (f || suave)(fase(t, t0, t1))); }
    return m;
  }
  const deHoja = (R, p, q) => R.aPantalla(p, R.tronco(p)(q));
  const enHoja = (R, p, q, o) => { const h = R.aHoja(p, q); return Object.assign({ ang: 0, puno: 1, dobla: -1, detras: false }, o, { x: h.x, y: h.y }); };
  const enTronco = (R, p, q, o) => { const h = R.tronco(p)(q); return Object.assign({ ang: 0, puno: 1, dobla: -1, detras: false }, o, { x: h.x, y: h.y }); };
  // mu para que los dedos sigan la línea del brazo (de hombro a mano)
  const muBrazo = (R, p, h, q) => { const s = R.tronco(p)(h), m = R.tronco(p)(q); return Math.atan2(s.y - m.y, s.x - m.x); };
  // punto donde se cogen de la mano: entre los dos hombros de en medio, a su altura (y subido)
  let ultimaUnion;
  function agarre(c, t) {
    if (t > T.suelta) {
      if (!ultimaUnion) ultimaUnion = agarre({ g: poseG(T.suelta), k: poseK(T.suelta) }, T.suelta);
      return ultimaUnion;
    }
    const a = deHoja(G, c.g, G.HOMBRO), b = deHoja(KI, c.k, KI.HOMBRO);
    const sube = tramo(t, T.sube, T.sube + 0.25);
    const gira = campana(t, T.cuerda, T.suelta);
    const an = (t - T.cuerda) * 22;
    const q = { x: (a.x + b.x) / 2 - 6 * sube, y: (a.y + b.y) / 2 - 28 - 26 * sube };
    q.x += 9 * gira * Math.cos(an); q.y += 7 * gira * Math.sin(an);
    return q;
  }

  // ---- Kiriku ----
  const ABIERTA_K = D5(0.55, 0.95, 0.9, 0.85, 0.95), FLOJA = D(0.35, 0.4, 0.4, 0.4);
  const MK_LEJOS = {
    bols: c => Object.assign(KI.manoReposo(c.k, "lejos"), { dedos: FLOJA, detras: false }),
    sale: c => Object.assign(KI.manoReposo(c.k, "lejos"), { puno: 1, dedos: FLOJA, detras: false, dobla: 1 }),
    // en posición: el brazo en el aire, como si llevara a una pareja invisible
    marco: (c, t) => enTronco(KI, c.k, { x: 684 + 6 * Math.sin(t * 2), y: 336 }, { mu: Math.PI - 0.65, ang: 0, dedos: ABIERTA_K, dobla: -1 }),
    // le cede el turno: palma arriba hacia Guillermo
    invita: c => enTronco(KI, c.k, { x: 620, y: 560 }, { mu: Math.PI + 0.25, ang: 0.15, dedos: D5(0.9, 1, 1, 1, 1), dobla: 1 }),
    tiende: c => enTronco(KI, c.k, { x: 630, y: 420 }, { mu: Math.PI - 0.1, ang: 0, dedos: D5(0.7, 0.85, 0.85, 0.85, 0.85), dobla: -1 }),
    coge: (c, t) => { const q = agarre(c, t); return enHoja(KI, c.k, { x: q.x + 6, y: q.y - 2 }, { mu: Math.PI, dedos: D(0.75, 0.68, 0.68, 0.7), dobla: -1 }); },
    suelta: c => enTronco(KI, c.k, { x: 560, y: 60 }, { mu: Math.PI / 2 + 0.35, ang: 0, dedos: D5(0.9, 1, 1, 1, 1), dobla: 1 }),
    baja: c => enTronco(KI, c.k, { x: 560, y: 470 }, { mu: Math.PI - 0.6, ang: 0, dedos: D(0.6, 0.7, 0.7, 0.7), dobla: 1 }),
    encoge: c => enTronco(KI, c.k, { x: 470, y: 380 }, { mu: 2.4, ang: 0, dedos: D(0.6, 0.5, 0.5, 0.5), dobla: 1 }),
    // reverencia: el brazo sale hacia delante y abajo, con la mano abierta
    floreoRev: c => enTronco(KI, c.k, { x: 640, y: 520 }, { mu: Math.PI - 0.95, ang: 0, dedos: D5(0.8, 1, 1, 0.95, 1), dobla: 1 })
  };
  const GUION_MKL = [
    [T.prep0, T.prep0 + 0.12, "sale"], [T.prep0 + 0.12, T.prep1, "marco"],
    [T.inv0, T.inv1, "invita"], [T.gPos0 + 0.2, T.gPos0 + 0.45, "sale"], [T.gPos0 + 0.45, T.gPos0 + 0.6, "bols"],
    [T.kVa0, T.kVa0 + 0.15, "sale"], [T.kVa0 + 0.15, T.coge - 0.12, "tiende"], [T.coge - 0.12, T.coge, "coge", salida],
    [T.suelta, T.suelta + 0.18, "suelta", salida], [T.suelta + 0.45, T.choque, "baja"], [T.choque, T.choque + 0.08, "encoge", salida],
    [T.kRev0 - 0.25, T.kRev1, "floreoRev"]
  ];
  const MK_CERCA = {
    bols: c => Object.assign(KI.manoReposo(c.k, "cerca"), { dedos: FLOJA, detras: false }),
    sale: c => Object.assign(KI.manoReposo(c.k, "cerca"), { puno: 1, dedos: FLOJA, detras: false, dobla: -1 }),
    // fuera del cuerpo (por detrás) para pasar el brazo a la espalda sin que se note el cambio de capa
    fuera: c => enTronco(KI, c.k, { x: -40, y: 610 }, { mu: -1.25, ang: 0, dedos: D(0.5, 0.6, 0.6, 0.6), dobla: -1 }),
    fueraD: c => enTronco(KI, c.k, { x: -40, y: 610 }, { mu: -1.25, ang: 0, dedos: D(0.5, 0.6, 0.6, 0.6), dobla: -1, detras: true }),
    espalda: c => enTronco(KI, c.k, { x: 196, y: 592 }, { mu: -1.4, ang: 0, dedos: D(0.5, 0.5, 0.5, 0.5), dobla: -1, detras: true }),
    // reverencia: el brazo cruzado por delante de la cintura
    cintura: c => enTronco(KI, c.k, { x: 300, y: 590 }, { mu: -2.7, ang: 0, dedos: D5(0.75, 0.9, 0.9, 0.9, 0.9), dobla: -1 })
  };
  const GUION_MKC = [
    [T.prep0 + 0.05, T.prep0 + 0.17, "sale"], [T.prep0 + 0.17, T.prep0 + 0.42, "fuera"], [T.prep0 + 0.42, T.prep0 + 0.44, "fueraD"],
    [T.prep0 + 0.44, T.prep1 + 0.1, "espalda"],
    [T.kRev0 - 0.3, T.kRev0 - 0.05, "fueraD"], [T.kRev0 - 0.05, T.kRev0 - 0.03, "fuera"], [T.kRev0 - 0.03, T.kRev1, "cintura"]
  ];

  // ---- Guillermo ----
  const RECTA = D5(1, 1, 1, 1, 1);
  const MG_LEJOS = {
    bols: c => ({ ...G.tronco(c.g)(BOLS_G.l), mu: -1.75, ang: 0, puno: 0, dedos: FLOJA, dobla: 1, detras: false }),
    sale: c => ({ ...G.tronco(c.g)(BOLS_G.l), mu: -1.75, ang: 0, puno: 1, dedos: FLOJA, dobla: 1, detras: false }),
    yo: c => enTronco(G, c.g, { x: 290, y: 470 }, { mu: -0.35, ang: 0, dedos: D5(0.2, 1, 0, 0, 0), dobla: 1 }),
    // brazo tieso hacia delante, recto como un palo
    tieso: (c, t) => { const q = { x: 650, y: 376 + 6 * Math.sin(t * 31) * campana(t, T.gPos0, T.gGiro1) * 0.3 };
      return enTronco(G, c.g, q, { mu: muBrazo(G, c.g, G.HOMBRO, q), dedos: RECTA, dobla: 1 }); },
    // aspavientos: el brazo sube y baja como un ala
    aleteo: (c, t) => { const a = -0.25 + 0.75 * Math.sin((t - T.tamb0) * 26), q = { x: 370 + 270 * Math.cos(a), y: 372 + 270 * Math.sin(a) };
      return enTronco(G, c.g, q, { mu: muBrazo(G, c.g, G.HOMBRO, q), dedos: RECTA, dobla: 1 }); },
    coge: (c, t) => { const q = agarre(c, t); return enHoja(G, c.g, { x: q.x - 5, y: q.y }, { mu: Math.PI, dedos: D(0.5, 0.45, 0.45, 0.45), dobla: -1 }); },
    // girando: los brazos recogidos sobre el pecho
    pecho: c => enTronco(G, c.g, { x: 260, y: 470 }, { mu: -0.2, ang: 0, dedos: D(0.3, 0.2, 0.2, 0.2), dobla: 1 }),
    // vuelta: sujeta la capa por delante, como un rey
    capa: (c, t) => enTronco(G, c.g, { x: 300 + 6 * Math.sin(t * 5), y: 470 }, { mu: -0.9, ang: 0, dedos: D(0.3, 0.25, 0.25, 0.25), dobla: 1 })
  };
  const GUION_MGL = [
    [T.gYo0 - 0.12, T.gYo0, "sale"], [T.gYo0, T.gYo1, "yo"], [T.gPos0, T.gPos0 + 0.18, "tieso", seco],
    [T.tamb0, T.tamb0 + 0.08, "aleteo"], [T.coge - 0.12, T.coge, "coge", salida],
    [T.suelta + 0.02, T.suelta + 0.18, "pecho"], [T.vuelve0 - 0.1, T.vuelve0, "capa"]
  ];
  const MG_CERCA = {
    bols: c => ({ ...G.tronco(c.g)(BOLS_G.c), mu: -1.75, ang: 0, puno: 0, dedos: FLOJA, dobla: -1, detras: false }),
    sale: c => ({ ...G.tronco(c.g)(BOLS_G.c), mu: -1.75, ang: 0, puno: 1, dedos: FLOJA, dobla: -1, detras: false }),
    tieso: (c, t) => { const q = { x: -150, y: 560 }; return enTronco(G, c.g, q, { mu: muBrazo(G, c.g, G.HOMBRO_C, q), dedos: RECTA, dobla: -1 }); },
    aleteo: (c, t) => { const a = Math.PI + 0.3 - 0.7 * Math.sin((t - T.tamb0) * 26 + 1.4), q = { x: 88 + 300 * Math.cos(a), y: 345 + 300 * Math.sin(a) };
      return enTronco(G, c.g, q, { mu: muBrazo(G, c.g, G.HOMBRO_C, q), dedos: RECTA, dobla: -1 }); },
    // bailando: el brazo de fuera abierto con floritura (el meñique arriba)
    floritura: (c, t) => enTronco(G, c.g, { x: -205 + 8 * Math.sin(t * 3.2), y: 290 + 10 * Math.sin(t * 2.4) }, { mu: -0.35, ang: 0, dedos: D5(0.9, 0.95, 0.9, 0.85, 1), dobla: -1 }),
    pecho: c => enTronco(G, c.g, { x: 210, y: 500 }, { mu: -0.6, ang: 0, dedos: D(0.3, 0.2, 0.2, 0.2), dobla: -1 }),
    // la barra de la cortina como un cetro
    cetro: (c, t) => enTronco(G, c.g, { x: -40, y: 590 + 6 * Math.sin(t * 7) }, { mu: -1.3, ang: 0, dedos: D(0.2, 0.1, 0.1, 0.1), dobla: -1 })
  };
  const GUION_MGC = [
    [T.gPos0 - 0.12, T.gPos0, "sale"], [T.gPos0, T.gPos0 + 0.18, "tieso", seco],
    [T.tamb0 + 0.02, T.tamb0 + 0.1, "aleteo"], [T.coge, T.coge + 0.35, "floritura"],
    [T.suelta + 0.02, T.suelta + 0.18, "pecho"], [T.vuelve0 - 0.1, T.vuelve0, "cetro"]
  ];
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, -1.75), l: punoDesde({ x: 372, y: 648 }, -1.75) };

  /* =====================================================================================
   * POSTURAS
   * ===================================================================================== */
  // tobillo de un pie en la hoja; con «tieso» la pierna va recta (paso de soldadito)
  function tobillo(R, p, lado, f, h, tieso) {
    const TOB = R.SUELO - R.TOBILLO_ALTO, q = R.aHoja(p, { x: f.x, y: SUELO });
    let y = TOB - f.alto - h;
    if (tieso && f.anda > 0) {
      // paso de soldadito: la pierna recta sube por delante (patada) y baja en su sitio
      q.x += 105 / S * f.anda;
      const cad = R.tronco(p)(R.CADERA[lado]), L = (lado === "cerca" ? 541.6 : 540.9) * 0.995, dx = q.x - cad.x;
      y = Math.min(y, cad.y + Math.sqrt(Math.max(0, L * L - dx * dx)));
    }
    const px = R.PUNTA.x, ang = h > 0 ? Math.asin(clamp(h / Math.hypot(px, R.PUNTA.y), 0, 0.9)) * 1.05 : 0;
    return { tob: { x: q.x, y }, ang: ang + (f.anda > 0 && !tieso ? -0.12 * f.anda : 0) - (tieso ? 0.25 * f.anda : 0) };
  }
  function suma(lista, t) { let s = 0; for (const [c, a] of lista) s += a * subida(t, c); return s; }

  // vaivén de la pareja: los dos se inclinan hacia donde avanzan (izquierda en el compás 4, derecha en el 5)
  const vaivenPareja = t => 0.06 * (Math.sin(Math.PI * fase(t, T.c4, T.c5)) - Math.sin(Math.PI * fase(t, T.c5, T.c5 + 3 * BT)) * (1 - tramo(t, T.sube, T.sube + 0.3)));
  function poseK(t) {
    const b = linea(GUION_K, CUER_K, "quieto", t);
    const fl = pie(PASOS_K.lejos, t), fc = pie(PASOS_K.cerca, t);
    const sb = suma(COMP_K, t);
    const respira = Math.sin(t * 1.9 + 1.4);
    const h = Math.max(0, -sb) * 13, dob = Math.max(0, sb) * 22;
    const x = (fl.x + fc.x) / 2;
    const p = {
      x, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: KI.PELVIS.x, y: KI.PELVIS.y + dob - h + respira * 1.1 + b.dy },
      torso: b.torso + 0.03 * Math.sin((t - T.c1) * TAU / (3 * BT)) * tramo(t, T.c1, T.c1 + 0.3) * (1 - tramo(t, T.inv0, T.inv1)),
      torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // vaivén elegante de la cabeza con el compás
    p.cabeza.ang += 0.05 * Math.sin((t - T.c1) * TAU / (3 * BT) + 0.6) * (tramo(t, T.c1, T.c1 + 0.4) * (1 - tramo(t, T.inv0, T.inv1)) + tramo(t, T.c4, T.c4 + 0.4) * (1 - tramo(t, T.sube, T.sube + 0.2)));
    p.torso += vaivenPareja(t);
    // suspira (hombros) antes de ir a por él
    p.pelvis.y += 6 * campana(t, T.tamb1 - 0.45, T.kVa0 + 0.1);
    p.piernas.lejos = tobillo(KI, p, "lejos", fl, h, false);
    p.piernas.cerca = tobillo(KI, p, "cerca", fc, h, false);
    // reverencia: el pie de delante se adelanta un poco, la cadera baja
    const rev = tramo(t, T.kRev0, T.kRev1) * (1 - tramo(t, T.kRev2, T.kRev3));
    p.pelvis.y += 20 * rev;
    const e = linea(GUION_CK, CK, "inicio", t);
    p.cara = cara(e, parpadeo(t, PARP_K));
    p.sx = Math.cos(giroK(t));
    return p;
  }

  function poseG(t) {
    const fueraGiro = t >= T.suelta && t < T.vuelve0;
    // cuerpo
    const tieso = tramo(t, T.gPos0, T.gPos1, seco) * (1 - tramo(t, T.tamb0, T.tamb0 + 0.15));
    const fl = pie(PASOS_G.lejos, t), fc = pie(PASOS_G.cerca, t);
    let x = (fl.x + fc.x) / 2;
    const respira = Math.sin(t * 2.1 + 0.4);
    // subida a golpes en el compás tieso (salta de puntillas y se tambalea)
    const golpeSube = tramo(t, T.c3 + BT, T.c3 + BT + 0.08) * (1 - tramo(t, T.c3 + 3 * BT - 0.12, T.c3 + 3 * BT));
    let sb = suma(COMP_G, t) - golpeSube;
    let h = Math.max(0, -sb) * 13, dob = Math.max(0, sb) * 20;
    const p = {
      x, suelo: SUELO, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + dob - h + respira * 1.2 },
      torso: 0, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: 0.02, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // mira a Kiriku con la cabeza; asiente; tieso: la cabeza a golpes
    p.cabeza.ang += 0.08 * campana(t, T.c1, T.kGiro1) - 0.05 * campana(t, T.kGiro0, T.kGiro1);
    p.cabeza.ang += 0.12 * Math.sin((t - T.gSi) * 18) * campana(t, T.gSi, T.gSi + 0.4);
    const golpes = [T.c3, T.c3 + BT, T.c3 + 2 * BT];
    for (const tg of golpes) p.cabeza.ang += 0.06 * Math.sin((t - tg) * 30) * Math.exp(-Math.max(0, t - tg) * 9) * (t > tg ? 1 : 0);
    p.torso += 0.03 * tieso;
    // tambaleo tras la vuelta a golpes
    const tb = campana(t, T.tamb0, T.tamb1);
    p.torso += 0.16 * Math.sin((t - T.tamb0) * 15) * tb;
    p.cabeza.ang += 0.1 * Math.sin((t - T.tamb0) * 15 - 0.6) * tb;
    // bailando: en la gloria, con un vaivén
    const enBaile = tramo(t, T.c4, T.c4 + 0.5) * (1 - tramo(t, T.sube, T.sube + 0.3));
    p.cabeza.ang += (-0.08 + 0.05 * Math.sin((t - T.c4) * TAU / (3 * BT))) * enBaile;
    p.torso += -0.04 * enBaile - vaivenPareja(t);
    // piernas
    p.piernas.lejos = tobillo(G, p, "lejos", fl, h, tieso > 0.5);
    p.piernas.cerca = tobillo(G, p, "cerca", fc, h, tieso > 0.5);
    // giro de peonza: sale girando hacia la izquierda sobre un pie, con el otro recogido
    if (fueraGiro) {
      // pasa del baile a la peonza en un instante (sin saltos): sube la pierna y se queda en un pie
      const kk = tramo(t, T.suelta, T.suelta + 0.14);
      x = salidaX(t); p.x = x;
      p.inclina = 0.07 * Math.sin((t - T.suelta) * 9) * kk;
      p.pelvis.y = lerp(p.pelvis.y, G.PELVIS.y - 6, kk);
      const pc = p.piernas.cerca, pl = p.piernas.lejos;
      p.piernas.cerca = { tob: mezcla(pc.tob, { x: G.PELVIS.x - 30, y: G.SUELO - G.TOBILLO_ALTO }, kk), ang: lerp(pc.ang, 0, kk) };
      p.piernas.lejos = { tob: mezcla(pl.tob, { x: G.PELVIS.x + 40, y: 1020 }, kk), ang: lerp(pl.ang, 0.5, kk) };
      p.torso = lerp(p.torso, -0.04, kk); p.cabeza.ang = lerp(p.cabeza.ang, -0.1, kk);
    }
    // vuelta tambaleándose con la capa
    if (t >= T.vuelve0) {
      const w = vueltaG(t); p.x = w.x;
      p.piernas.lejos = w.lejos; p.piernas.cerca = w.cerca;
      p.pelvis.y = G.PELVIS.y + w.pel;
      p.torso = w.torso + w.inclina; p.cabeza.ang = w.cab;
      p.inclina = 0;
    }
    const e = linea(GUION_CG, CG, "inicio", t);
    p.cara = cara(e, t > T.suelta ? 0 : parpadeo(t, PARP_G));
    p.rojo = 0.55 * tramo(t, T.coge, T.coge + 0.25) * (1 - tramo(t, T.sube, T.suelta));
    p.sudor = 0.6 * campana(t, T.gGiro0, T.kVa1 + 0.3);
    p.sx = Math.cos(giroG(t));
    if (t >= T.vuelve0) p.sx = 1;
    return p;
  }

  // vuelta: entra tambaleándose desde la izquierda, con pasos cortos y desiguales
  // Posiciones de los dos tobillos en el suelo. En cada intervalo solo avanza uno.
  const VUELTA_PASOS = [
    [T.vuelve0, -172, -124], [T.vuelve0 + 0.13, -70, -124], [T.vuelve0 + 0.26, -70, -15],
    [T.vuelve0 + 0.39, 45, -15], [T.vuelve0 + 0.52, 45, 100], [T.vuelve0 + 0.66, 157, 100],
    [T.vuelve0 + 0.8, 157, 206], [T.vuelve1, 254, 206]
  ];
  function vueltaG(t) {
    let i = 0;
    while (i < VUELTA_PASOS.length - 2 && t >= VUELTA_PASOS[i + 1][0]) i++;
    const a = VUELTA_PASOS[i], b = VUELTA_PASOS[i + 1], u = fase(t, a[0], b[0]), k = suave(u);
    const xL = lerp(a[1], b[1], k), xC = lerp(a[2], b[2], k), x = (xL + xC) / 2 - 2;
    const alza = Math.sin(Math.PI * u), tobY = G.SUELO - G.TOBILLO_ALTO;
    const paso = (pie, anda) => ({ tob: { x: G.PELVIS.x + (pie - x) / S, y: tobY - (anda ? 40 * alza : 0) },
      ang: anda ? -0.15 * alza : 0 });
    const lejos = paso(xL, a[1] !== b[1]), cerca = paso(xC, a[2] !== b[2]);
    const tamb = Math.sin((t - T.vuelve0) * 8.5) * (1 - 0.6 * tramo(t, T.vuelve1 + 0.4, T.fin));
    const rev = tramo(t, T.gRev0, T.gRev1 - 0.12) * (1 - tramo(t, T.gRev1, T.gRev1 + 0.3));
    return { x, lejos, cerca, pel: 6 * alza + 18 * rev,
      torso: 0.08 * tamb + 0.42 * rev, cab: -0.04 + 0.12 * Math.sin((t - T.vuelve0) * 8.5 - 0.9) * (1 - 0.5 * tramo(t, T.vuelve1, T.fin)) + 0.3 * rev,
      inclina: 0.06 * tamb };
  }

  function pose(t) {
    const pk = poseK(t), pg = poseG(t);
    const ctx = { g: pg, k: pk };
    // manos
    pk.manoLejos = manoModos(t, [[0, 0, "bols"]].concat(GUION_MKL), MK_LEJOS, ctx);
    pk.manoCerca = manoModos(t, [[0, 0, "bols"]].concat(GUION_MKC), MK_CERCA, ctx);
    pg.manoLejos = manoModos(t, [[0, 0, "bols"]].concat(GUION_MGL), MG_LEJOS, ctx);
    pg.manoCerca = manoModos(t, [[0, 0, "bols"]].concat(GUION_MGC), MG_CERCA, ctx);
    // brazo extendido del floreo final de Kiriku: un giro de muñeca
    pk.manoLejos.ang += 0.25 * Math.sin((t - T.suelta) * 14) * campana(t, T.suelta, T.suelta + 0.45);
    // lengua de concentración y, al final, la cortina
    const lk = lenguaG(t);
    pg.capaCabeza = g2 => lengua(g2, lk, pg.cara.boca);
    if (t >= T.vuelve0) {
      pg.capaTronco = g2 => capaHombros(g2, t);
      pg.manoCerca.objeto = g2 => barra(g2, t);
    }
    return { g: pg, k: pk };
  }

  /* ---------- lengua (retrato de Guillermo) ---------- */
  function lengua(g, k, b) {
    if (k <= 0.01) return;
    const hw = 44 * (b.ancho ?? 1), s = b.sonrisa ?? 0, ca = Math.cos(0.26), sa = Math.sin(0.26);
    const yR = -10 * s, cx = 803 + hw * ca - yR * sa, cy = 730 + hw * sa + yR * ca;
    g.save(); g.translate(cx - 6, cy + 2); g.rotate(0.95);
    const L = 46 * k;
    g.beginPath(); g.moveTo(-15, -4); g.quadraticCurveTo(-19, L * 0.75, 0, L); g.quadraticCurveTo(19, L * 0.75, 15, -4); g.closePath();
    g.fillStyle = "#e0675c"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 5; g.stroke();
    g.strokeStyle = "rgba(130,24,30,0.6)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 4); g.lineTo(0, L * 0.6); g.stroke();
    g.restore();
    g.save(); g.translate(803, 730); g.rotate(0.26); g.strokeStyle = TINTA; g.lineWidth = 6.5; g.lineCap = "round";
    g.beginPath(); g.moveTo(hw - 26, 12 * s + 2 - 2); g.quadraticCurveTo(hw - 10, 4 * s + 1, hw + 1, yR); g.stroke(); g.restore();
  }

  /* =====================================================================================
   * LA CORTINA (terciopelo granate con flecos dorados)
   * ===================================================================================== */
  const TERC = { base: "#7c1024", luz: "#b52a42", sombra: "#3c0612", flecos: "#d9a441", flecosOsc: "#9a6d1c" };
  // paño con pliegues verticales entre dos curvas: arriba (xa0..xa1, ya) y abajo (xb0..xb1, yb)
  function pano(g, top, bot, n, t, ondea = 0) {
    // top/bot: listas de puntos {x,y} de izquierda a derecha (mismo número)
    g.save();
    g.beginPath(); g.moveTo(top[0].x, top[0].y);
    for (let i = 1; i < top.length; i++) g.lineTo(top[i].x, top[i].y);
    for (let i = bot.length - 1; i >= 0; i--) g.lineTo(bot[i].x, bot[i].y);
    g.closePath();
    g.fillStyle = TERC.base; g.fill();
    g.save(); g.clip();
    // pliegues: franjas de luz y sombra que siguen la caída
    const m = top.length - 1;
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n, a = Math.floor(u * m), f = u * m - a;
      const pa = mezcla(top[a], top[Math.min(m, a + 1)], f), pb = mezcla(bot[a], bot[Math.min(m, a + 1)], f);
      const w = Math.abs(top[m].x - top[0].x) / n, wb = Math.abs(bot[m].x - bot[0].x) / n;
      const osc = ondea * Math.sin(t * 3 + i * 1.7);
      g.fillStyle = i % 2 ? "rgba(30,0,8,0.38)" : "rgba(255,120,140,0.16)";
      g.beginPath(); g.moveTo(pa.x - w * 0.22, pa.y); g.lineTo(pa.x + w * 0.22, pa.y); g.lineTo(pb.x + wb * 0.3 + osc, pb.y); g.lineTo(pb.x - wb * 0.3 + osc, pb.y); g.closePath(); g.fill();
    }
    g.restore();
    g.strokeStyle = TINTA; g.lineWidth = 2.2; g.lineJoin = "round"; g.stroke();
    g.restore();
  }
  function flecos(g, pts, largo = 12) {
    g.save(); g.lineCap = "round";
    g.strokeStyle = TERC.flecosOsc; g.lineWidth = 7; g.beginPath(); g.moveTo(pts[0].x, pts[0].y); for (const q of pts) g.lineTo(q.x, q.y); g.stroke();
    g.strokeStyle = TERC.flecos; g.lineWidth = 4; g.stroke();
    g.lineWidth = 2.4;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.round(Math.hypot(b.x - a.x, b.y - a.y) / 5));
      for (let j = 0; j < n; j++) { const q = mezcla(a, b, j / n); g.strokeStyle = j % 2 ? TERC.flecos : TERC.flecosOsc; g.beginPath(); g.moveTo(q.x, q.y + 2); g.lineTo(q.x + 0.6, q.y + largo); g.stroke(); }
    }
    g.restore();
  }
  // cortina del borde izquierdo (otra ventana fuera de cuadro): se dibuja aparte para poder arrancarla
  let cortinaImg = null;
  function creaCortina() {
    const c = document.createElement("canvas"); c.width = 170; c.height = 440; const g = c.getContext("2d");
    g.translate(50, 10);
    // barra de latón
    g.lineCap = "round"; g.strokeStyle = TINTA; g.lineWidth = 10; g.beginPath(); g.moveTo(-50, 16); g.lineTo(110, 16); g.stroke();
    g.strokeStyle = "#d8ad4c"; g.lineWidth = 6; g.stroke();
    g.fillStyle = "#e8c264"; g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.arc(108, 16, 9, 0, TAU); g.fill(); g.stroke();
    // paño (fruncido arriba, cae hasta el suelo con un poco de charco)
    const top = [], bot = [];
    for (let i = 0; i <= 8; i++) { top.push({ x: -40 + i * 16.5, y: 20 + 3 * Math.sin(i * 2.1) }); bot.push({ x: -46 + i * 18.4 + 4 * Math.sin(i * 1.3), y: 408 + 4 * Math.sin(i * 1.7) }); }
    pano(g, top, bot, 9, 0);
    flecos(g, bot, 12);
    for (let i = 0; i <= 8; i++) { g.fillStyle = "#e0b555"; g.strokeStyle = TINTA; g.lineWidth = 1.6; g.beginPath(); g.ellipse(-40 + i * 16.5, 18, 5, 7, 0, 0, TAU); g.fill(); g.stroke(); }
    return c;
  }
  // la capa: el paño cae de los hombros por la espalda hasta el suelo (se dibuja detrás de Guillermo)
  function capaDetras(g, p, t) {
    const T_ = G.tronco(p), aP = q => G.aPantalla(p, T_(q));
    const hC = aP({ x: 70, y: 330 }), cu = aP({ x: 200, y: 285 }), hL = aP({ x: 352, y: 335 });
    const ond = Math.sin(t * 6.5), ond2 = Math.sin(t * 4.1 + 1);
    const bajo = SUELO + 4;
    const top = [hL, cu, hC, { x: hC.x - 26, y: hC.y + 60 }];
    const bot = [{ x: hL.x - 30, y: bajo - 40 }, { x: cu.x - 60 + 6 * ond, y: bajo }, { x: hC.x - 110 + 10 * ond2, y: bajo + 2 }, { x: hC.x - 150 + 14 * ond, y: bajo - 6 }];
    pano(g, top, bot, 7, t, 3);
    flecos(g, [bot[0], bot[1], bot[2], bot[3]], 10);
  }
  // sobre los hombros (hoja de Guillermo, encima de la camiseta y debajo de la cabeza)
  function capaHombros(g, t) {
    g.save(); g.lineJoin = "round";
    const top = [{ x: 40, y: 330 }, { x: 140, y: 268 }, { x: 250, y: 262 }, { x: 360, y: 300 }, { x: 410, y: 360 }];
    const bot = [{ x: 30, y: 470 }, { x: 120, y: 360 }, { x: 250, y: 340 }, { x: 340, y: 380 }, { x: 395, y: 520 }];
    pano(g, top, bot, 6, t, 2);
    // borde rasgado con dos anillas todavía colgando
    g.strokeStyle = TERC.sombra; g.lineWidth = 6;
    g.beginPath(); for (let i = 0; i < 9; i++) { const x = 60 + i * 38; g.lineTo(x, 268 + (i % 2 ? 10 : -4) + (x > 300 ? (x - 300) * 0.5 : 0)); } g.stroke();
    for (const [x, y] of [[150, 262], [300, 278]]) { g.fillStyle = "#e0b555"; g.strokeStyle = TINTA; g.lineWidth = 4; g.beginPath(); g.ellipse(x, y, 16, 22, 0.3, 0, TAU); g.stroke(); g.strokeStyle = "#e0b555"; g.lineWidth = 7; g.beginPath(); g.ellipse(x, y, 16, 22, 0.3, 0, TAU); g.stroke(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke(); }
    flecos(g, [bot[3], bot[4]], 30);
    flecos(g, [bot[0], bot[1]], 30);
    g.restore();
  }
  // barra de latón en la mano (unidades de la mano; vertical, como un cetro)
  function barra(g, t) {
    g.save(); g.rotate(-0.08 + 0.05 * Math.sin(t * 7));
    g.lineCap = "round"; g.strokeStyle = TINTA; g.lineWidth = 11; g.beginPath(); g.moveTo(0, -170); g.lineTo(0, 46); g.stroke();
    g.strokeStyle = "#d8ad4c"; g.lineWidth = 6.5; g.stroke();
    g.strokeStyle = "rgba(255,240,190,0.8)"; g.lineWidth = 2; g.beginPath(); g.moveTo(-1.6, -160); g.lineTo(-1.6, 40); g.stroke();
    for (const y of [-182, 56]) { g.fillStyle = "#e8c264"; g.strokeStyle = TINTA; g.lineWidth = 2.4; g.beginPath(); g.arc(0, y, 13, 0, TAU); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.arc(-4, y - 4, 4, 0, TAU); g.fill(); }
    // una anilla suelta que baila en la barra
    const ya = -120 + 14 * Math.sin(t * 7.5);
    g.strokeStyle = TINTA; g.lineWidth = 5; g.beginPath(); g.ellipse(0, ya, 11, 5, 0, 0, TAU); g.stroke(); g.strokeStyle = "#e0b555"; g.lineWidth = 3; g.stroke();
    g.restore();
  }

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  let fondo = null, arana = null;
  const VEN = [215, 809], VW = 150, VT = 40, VB = 318;      // ventanales: centro x, ancho, arriba, alfeizar
  const ORO = "#c9a14a", ORO_L = "#f3d98b", ORO_O = "#7d5a1c";
  function moldura(g, x, y, w, h, r = 6) {
    g.save(); g.lineJoin = "round";
    g.strokeStyle = ORO_O; g.lineWidth = 5; g.strokeRect(x, y, w, h);
    g.strokeStyle = ORO; g.lineWidth = 3; g.strokeRect(x, y, w, h);
    g.strokeStyle = ORO_L; g.lineWidth = 1; g.strokeRect(x - 1, y - 1, w, h);
    g.restore();
  }
  function rutaArco(g, x0, x1, top, bot) {
    const r = (x1 - x0) / 2, cx = (x0 + x1) / 2;
    g.beginPath(); g.moveTo(x0, bot); g.lineTo(x0, top + r); g.arc(cx, top + r, r, Math.PI, 0); g.lineTo(x1, bot); g.closePath();
  }
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 80; const g = c.getContext("2d");
    g.translate(40, 40); g.lineJoin = "round"; g.lineCap = "round";
    // pared de marfil, más oscura arriba (la luz viene de la araña y los apliques)
    const pa = g.createLinearGradient(0, -40, 0, MURO);
    pa.addColorStop(0, "#8a7350"); pa.addColorStop(0.16, "#cdb488"); pa.addColorStop(0.55, "#ead7b0"); pa.addColorStop(1, "#e2cca2");
    g.fillStyle = pa; g.fillRect(-40, -40, W + 80, MURO + 40);
    // paneles altos con moldura dorada
    for (const [x0, x1] of [[-30, 110], [318, 410], [614, 706], [914, 1060]]) moldura(g, x0 + 10, 30, x1 - x0 - 20, 270);
    // friso de techo con dentellones
    g.fillStyle = "#b99a62"; g.fillRect(-40, -40, W + 80, 26);
    g.fillStyle = ORO; g.fillRect(-40, -14, W + 80, 6);
    g.fillStyle = ORO_O; for (let x = -40; x < W + 40; x += 14) g.fillRect(x, -8, 8, 9);
    g.fillStyle = ORO_L; g.fillRect(-40, 1, W + 80, 2);
    // zócalo de paneles y rodapié
    g.fillStyle = "#dcc396"; g.fillRect(-40, 330, W + 80, MURO - 330);
    g.fillStyle = ORO; g.fillRect(-40, 326, W + 80, 6); g.fillStyle = ORO_L; g.fillRect(-40, 326, W + 80, 1.5);
    for (let x = -30; x < W + 40; x += 92) moldura(g, x, 342, 74, 52);
    g.fillStyle = "#4a2c18"; g.fillRect(-40, MURO - 10, W + 80, 10); g.fillStyle = ORO; g.fillRect(-40, MURO - 11, W + 80, 2);
    // pilastras estriadas con capitel dorado
    for (const x of [340, 684]) {
      g.fillStyle = "#efe0bd"; g.fillRect(x - 15, 10, 30, 316);
      g.strokeStyle = "rgba(120,90,40,0.35)"; g.lineWidth = 2; for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(x + k * 8, 34); g.lineTo(x + k * 8, 310); g.stroke(); }
      g.fillStyle = ORO; g.fillRect(x - 20, 6, 40, 16); g.fillStyle = ORO_L; g.fillRect(x - 20, 6, 40, 3);
      g.strokeStyle = ORO_O; g.lineWidth = 2; g.strokeRect(x - 20, 6, 40, 16); g.strokeRect(x - 15, 10, 30, 316);
    }
    // ventanales en arco: noche, jardín y luna
    VEN.forEach((cx, iv) => {
      const x0 = cx - VW / 2, x1 = cx + VW / 2;
      g.save(); rutaArco(g, x0, x1, VT, VB); g.clip();
      const ci = g.createLinearGradient(0, VT, 0, VB); ci.addColorStop(0, "#08112b"); ci.addColorStop(0.7, "#1b2f5c"); ci.addColorStop(1, "#2e4a7a");
      g.fillStyle = ci; g.fillRect(x0, VT, VW, VB - VT);
      for (let i = 0; i < 22; i++) { const sx = x0 + hash(i * 3 + iv * 50) * VW, sy = VT + hash(i * 7 + iv * 50 + 1) * 170; g.fillStyle = `rgba(255,250,220,${0.4 + 0.6 * hash(i + iv * 9)})`; g.beginPath(); g.arc(sx, sy, 0.8 + hash(i + 3) * 1.2, 0, TAU); g.fill(); }
      if (iv === 1) { const mx = cx + 30, my = 98; const hal = g.createRadialGradient(mx, my, 4, mx, my, 70); hal.addColorStop(0, "rgba(255,248,210,0.5)"); hal.addColorStop(1, "rgba(255,248,210,0)");
        g.fillStyle = hal; g.fillRect(x0, VT, VW, 160); g.fillStyle = "#fbf3d2"; g.beginPath(); g.arc(mx, my, 18, 0, TAU); g.fill();
        g.fillStyle = "rgba(200,190,150,0.5)"; g.beginPath(); g.arc(mx - 5, my - 3, 4, 0, TAU); g.arc(mx + 6, my + 6, 3, 0, TAU); g.fill(); }
      // jardín: setos y árboles recortados, farolas lejanas
      g.fillStyle = "#0a1a1a";
      for (let i = 0; i < 6; i++) { const tx = x0 + 10 + i * 28 + hash(i + iv * 20) * 10, th = 50 + hash(i * 2 + iv) * 50; g.beginPath(); g.ellipse(tx, VB - 40 - th * 0.5, 16, th * 0.55, 0, 0, TAU); g.fill(); }
      g.fillRect(x0, VB - 46, VW, 46);
      for (let i = 0; i < 3; i++) { const lx = x0 + 30 + i * 46, ly = VB - 52; const hl = g.createRadialGradient(lx, ly, 1, lx, ly, 14); hl.addColorStop(0, "rgba(255,210,120,0.9)"); hl.addColorStop(1, "rgba(255,210,120,0)"); g.fillStyle = hl; g.beginPath(); g.arc(lx, ly, 14, 0, TAU); g.fill(); }
      g.restore();
      // carpintería blanca y dorada
      g.strokeStyle = "#f4efe3"; g.lineWidth = 6;
      g.beginPath(); g.moveTo(cx, VT); g.lineTo(cx, VB); for (const y of [140, 230]) { g.moveTo(x0, y); g.lineTo(x1, y); } g.stroke();
      g.beginPath(); g.arc(cx, VT + VW / 2, VW / 2 - 24, Math.PI, 0); g.stroke();
      g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
      rutaArco(g, x0, x1, VT, VB); g.strokeStyle = "#f4efe3"; g.lineWidth = 10; g.stroke(); g.strokeStyle = ORO; g.lineWidth = 3; g.stroke();
      // alféizar
      g.fillStyle = "#f2ead6"; g.fillRect(x0 - 12, VB - 2, VW + 24, 12); g.strokeStyle = ORO_O; g.lineWidth = 1.5; g.strokeRect(x0 - 12, VB - 2, VW + 24, 12);
      // cortinas recogidas con alzapaño y galería de festones
      for (const sg of [-1, 1]) {
        const xe = cx + sg * (VW / 2 + 22), xi = cx + sg * (VW / 2 - 18);
        const top = [], bot = [];
        const lado = (k, y) => ({ x: lerp(xe, xi, k), y });
        // arriba ancha, se estrecha en el alzapaño (y 236) y se abre al caer
        const ancho = y => y < 236 ? lerp(1, 0.34, (y - 30) / 206) : lerp(0.34, 0.95, (y - 236) / (MURO - 236));
        const pts = n => Array.from({ length: n }, (_, i) => i / (n - 1));
        for (const k of pts(6)) top.push({ x: xe + (xi - xe) * k, y: 30 });
        for (const k of pts(6)) bot.push({ x: xe + (xi - xe) * k * 0.95 + sg * 6 * Math.sin(k * 5), y: MURO + 2 });
        // dos tramos: hasta el alzapaño y desde el alzapaño
        const mid = pts(6).map(k => ({ x: xe + (xi - xe) * k * 0.34, y: 236 }));
        pano(g, top, mid, 6, 0); pano(g, mid, bot, 6, 0);
        flecos(g, bot, 10);
        // alzapaño de cordón dorado con borla
        const ax = xe + (xi - xe) * 0.17;
        g.fillStyle = ORO; g.strokeStyle = TINTA; g.lineWidth = 2;
        g.beginPath(); g.ellipse(ax, 236, Math.abs(xi - xe) * 0.24, 7, 0, 0, TAU); g.fill(); g.stroke();
        g.beginPath(); g.moveTo(ax - 6, 242); g.lineTo(ax + 6, 242); g.lineTo(ax + 9, 270); g.lineTo(ax - 9, 270); g.closePath(); g.fill(); g.stroke();
      }
      // galería con festones
      const gx0 = cx - VW / 2 - 34, gx1 = cx + VW / 2 + 34;
      g.fillStyle = TERC.base; g.strokeStyle = TINTA; g.lineWidth = 2.2;
      g.beginPath(); g.moveTo(gx0, 18); g.lineTo(gx1, 18); g.lineTo(gx1, 40);
      const nf = 4; for (let i = nf; i > 0; i--) { const a = gx0 + (gx1 - gx0) * i / nf, b = gx0 + (gx1 - gx0) * (i - 1) / nf; g.quadraticCurveTo((a + b) / 2, 74, b, 40); }
      g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,130,150,0.18)"; g.fillRect(gx0, 20, gx1 - gx0, 6);
      const fes = []; for (let i = 0; i <= 24; i++) { const u = i / 24, seg = Math.min(nf - 1, Math.floor(u * nf)), f = u * nf - seg; fes.push({ x: gx0 + (gx1 - gx0) * u, y: 40 + 34 * Math.sin(Math.PI * f) * 0.95 }); }
      flecos(g, fes, 9);
      g.fillStyle = ORO; g.fillRect(gx0 - 4, 12, gx1 - gx0 + 8, 8); g.strokeStyle = ORO_O; g.lineWidth = 1.5; g.strokeRect(gx0 - 4, 12, gx1 - gx0 + 8, 8);
    });
    // espejo dorado en el centro
    { const cx = 512, x0 = cx - 82, x1 = cx + 82, y0 = 46, y1 = 312;
      g.save(); rutaArco(g, x0, x1, y0, y1); g.clip();
      const es = g.createLinearGradient(x0, y0, x1, y1); es.addColorStop(0, "#5e4a33"); es.addColorStop(0.45, "#a8916c"); es.addColorStop(1, "#4a3925");
      g.fillStyle = es; g.fillRect(x0, y0, x1 - x0, y1 - y0);
      const re = g.createRadialGradient(cx, y0 + 40, 4, cx, y0 + 40, 90); re.addColorStop(0, "rgba(255,236,170,0.75)"); re.addColorStop(1, "rgba(255,236,170,0)");
      g.fillStyle = re; g.fillRect(x0, y0, x1 - x0, 160);
      g.fillStyle = "rgba(255,255,255,0.22)"; g.beginPath(); g.moveTo(x0 + 20, y1); g.lineTo(x0 + 70, y0); g.lineTo(x0 + 96, y0); g.lineTo(x0 + 46, y1); g.closePath(); g.fill();
      g.fillStyle = "rgba(255,255,255,0.12)"; g.beginPath(); g.moveTo(x0 + 70, y1); g.lineTo(x0 + 120, y0); g.lineTo(x0 + 130, y0); g.lineTo(x0 + 80, y1); g.closePath(); g.fill();
      g.restore();
      rutaArco(g, x0 - 6, x1 + 6, y0 - 6, y1 + 6); g.strokeStyle = ORO_O; g.lineWidth = 16; g.stroke(); g.strokeStyle = ORO; g.lineWidth = 11; g.stroke(); g.strokeStyle = ORO_L; g.lineWidth = 2; g.stroke();
      // copete del marco: concha con volutas
      g.fillStyle = ORO; g.strokeStyle = ORO_O; g.lineWidth = 2;
      g.beginPath(); g.moveTo(cx - 34, y0 - 4); g.quadraticCurveTo(cx - 30, y0 - 40, cx, y0 - 44); g.quadraticCurveTo(cx + 30, y0 - 40, cx + 34, y0 - 4); g.closePath(); g.fill(); g.stroke();
      for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(cx, y0 - 6); g.lineTo(cx + k * 9, y0 - 38 + Math.abs(k) * 5); g.stroke(); }
      g.fillStyle = ORO_L; g.beginPath(); g.arc(cx, y0 - 8, 5, 0, TAU); g.fill();
      for (const sg of [-1, 1]) { g.strokeStyle = ORO; g.lineWidth = 6; g.beginPath(); g.arc(cx + sg * 50, y0 + 4, 12, sg > 0 ? Math.PI : 0, sg > 0 ? TAU * 0.9 : Math.PI * 0.9 + Math.PI); g.stroke(); }
      // consola dorada bajo el espejo
      g.fillStyle = "#3a2414"; g.fillRect(cx - 96, 322, 192, 10);
      g.fillStyle = ORO; g.fillRect(cx - 100, 318, 200, 6); g.strokeStyle = ORO_O; g.lineWidth = 1.5; g.strokeRect(cx - 100, 318, 200, 6);
      for (const sg of [-1, 1]) { g.strokeStyle = ORO; g.lineWidth = 6; g.beginPath(); g.moveTo(cx + sg * 88, 332); g.bezierCurveTo(cx + sg * 100, 360, cx + sg * 70, 380, cx + sg * 84, MURO - 10); g.stroke(); }
      // jarrón con flores
      g.fillStyle = "#f1ece0"; g.strokeStyle = TINTA; g.lineWidth = 1.8;
      g.beginPath(); g.moveTo(cx - 12, 318); g.quadraticCurveTo(cx - 20, 296, cx - 8, 282); g.lineTo(cx + 8, 282); g.quadraticCurveTo(cx + 20, 296, cx + 12, 318); g.closePath(); g.fill(); g.stroke();
      for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.28, r = 26 + 10 * hash(i + 70); const fx = cx + Math.cos(a) * r, fy = 282 + Math.sin(a) * r;
        g.strokeStyle = "#3d6b2a"; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, 284); g.lineTo(fx, fy); g.stroke();
        g.fillStyle = ["#f4f0f4", "#e9a3b4", "#f7d36b"][i % 3]; g.beginPath(); g.arc(fx, fy, 6, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1; g.stroke(); }
    }
    // apliques de velas en las pilastras (con su halo)
    for (const x of [340, 684]) aplique(g, x, 176);
    // soporte de la barra de la cortina del borde (se ve cuando la arrancan)
    g.fillStyle = ORO; g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.rect(48, 22, 10, 18); g.fill(); g.stroke();
    g.beginPath(); g.arc(53, 26, 6, 0, TAU); g.fill(); g.stroke();
    // gramófono sobre un velador
    gramofono(g, 936, MURO);
    // suelo de parqué encerado
    parque(g);
    // luz cálida y viñeta
    const ar = g.createRadialGradient(512, 20, 20, 512, 120, 560); ar.addColorStop(0, "rgba(255,226,150,0.35)"); ar.addColorStop(1, "rgba(255,226,150,0)");
    g.fillStyle = ar; g.fillRect(-40, -40, W + 80, H + 80);
    const vi = g.createRadialGradient(512, 320, 300, 512, 300, 720); vi.addColorStop(0, "rgba(0,0,0,0)"); vi.addColorStop(1, "rgba(30,14,4,0.42)");
    g.fillStyle = vi; g.fillRect(-40, -40, W + 80, H + 80);
    return c;
  }
  function aplique(g, x, y) {
    const hal = g.createRadialGradient(x, y - 30, 4, x, y - 30, 90); hal.addColorStop(0, "rgba(255,220,140,0.55)"); hal.addColorStop(1, "rgba(255,220,140,0)");
    g.fillStyle = hal; g.fillRect(x - 90, y - 120, 180, 180);
    g.strokeStyle = ORO_O; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y + 20); g.quadraticCurveTo(x - 30, y + 10, x - 30, y - 14); g.moveTo(x, y + 20); g.quadraticCurveTo(x + 30, y + 10, x + 30, y - 14); g.stroke();
    g.strokeStyle = ORO; g.lineWidth = 3; g.stroke();
    g.fillStyle = ORO; g.strokeStyle = TINTA; g.lineWidth = 1.5; g.beginPath(); g.ellipse(x, y + 20, 8, 12, 0, 0, TAU); g.fill(); g.stroke();
    for (const sg of [-1, 1]) {
      const cx = x + sg * 30;
      g.fillStyle = ORO; g.beginPath(); g.ellipse(cx, y - 14, 9, 4, 0, 0, TAU); g.fill(); g.stroke();
      g.fillStyle = "#fbf6ea"; g.fillRect(cx - 4, y - 38, 8, 24); g.strokeRect(cx - 4, y - 38, 8, 24);
      g.fillStyle = "#ffcf5a"; g.beginPath(); g.moveTo(cx, y - 52); g.quadraticCurveTo(cx + 6, y - 42, cx, y - 38); g.quadraticCurveTo(cx - 6, y - 42, cx, y - 52); g.fill();
      g.fillStyle = "#fff6d0"; g.beginPath(); g.ellipse(cx, y - 42, 2, 4, 0, 0, TAU); g.fill();
    }
  }
  function gramofono(g, x, yb) {
    g.save();
    // velador
    g.fillStyle = "#3d2414"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.ellipse(x, 340, 42, 9, 0, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = "#5a3820"; g.fillRect(x - 5, 344, 10, yb - 360); g.strokeRect(x - 5, 344, 10, yb - 360);
    g.beginPath(); g.moveTo(x - 28, yb - 2); g.quadraticCurveTo(x, yb - 22, x + 28, yb - 2); g.lineWidth = 6; g.strokeStyle = "#3d2414"; g.stroke();
    // caja y plato
    g.fillStyle = "#6b3b1c"; g.strokeStyle = TINTA; g.lineWidth = 2; g.fillRect(x - 30, 306, 60, 30); g.strokeRect(x - 30, 306, 60, 30);
    g.fillStyle = ORO; g.fillRect(x - 30, 318, 60, 3);
    g.fillStyle = "#151015"; g.beginPath(); g.ellipse(x, 304, 28, 5, 0, 0, TAU); g.fill(); g.stroke();
    // brazo y bocina de latón
    g.strokeStyle = "#a7802c"; g.lineWidth = 6; g.beginPath(); g.moveTo(x + 18, 304); g.quadraticCurveTo(x + 20, 270, x, 250); g.stroke();
    const bo = g.createLinearGradient(x - 90, 170, x, 250); bo.addColorStop(0, "#f6d77d"); bo.addColorStop(1, "#a7802c");
    g.fillStyle = bo; g.strokeStyle = TINTA; g.lineWidth = 2.2;
    g.beginPath(); g.moveTo(x + 2, 252); g.quadraticCurveTo(x - 30, 236, x - 54, 172); g.quadraticCurveTo(x - 90, 196, x - 96, 238); g.quadraticCurveTo(x - 40, 240, x - 4, 258); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#4a3410"; g.beginPath(); g.ellipse(x - 76, 205, 16, 30, 0.75, 0, TAU); g.fill(); g.stroke();
    g.restore();
  }
  function parque(g) {
    const y0 = MURO, y1 = H + 40, vy = MURO - 820, vx = 512;
    g.save();
    g.beginPath(); g.rect(-40, y0, W + 80, y1 - y0); g.clip();
    g.fillStyle = "#b07a3e"; g.fillRect(-40, y0, W + 80, y1 - y0);
    const xAt = (xb, y) => vx + (xb - vx) * (y - vy) / (y0 - vy);
    // tablas (con su veta y juntas al tresbolillo)
    const filas = []; for (let k = 0; k <= 14; k++) filas.push(y0 + (y1 - y0) * Math.pow(k / 14, 1.35));
    let n = 0;
    for (let xb = -500; xb < W + 500; xb += 30, n++) {
      for (let f = 0; f < filas.length - 1; f++) {
        const ya = filas[f], yb = filas[f + 1], tono = hash(n * 13 + f * 7 + 3);
        const col = `rgb(${Math.round(150 + 40 * tono)},${Math.round(98 + 30 * tono)},${Math.round(48 + 18 * tono)})`;
        g.fillStyle = col;
        g.beginPath(); g.moveTo(xAt(xb, ya), ya); g.lineTo(xAt(xb + 30, ya), ya); g.lineTo(xAt(xb + 30, yb), yb); g.lineTo(xAt(xb, yb), yb); g.closePath(); g.fill();
        if ((f + n) % 2 === 0) { g.strokeStyle = "rgba(60,30,10,0.45)"; g.lineWidth = 1; g.beginPath(); g.moveTo(xAt(xb, ya), ya); g.lineTo(xAt(xb + 30, ya), ya); g.stroke(); }
      }
      g.strokeStyle = "rgba(60,30,10,0.5)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(xAt(xb, y0), y0); g.lineTo(xAt(xb, y1), y1); g.stroke();
    }
    // brillo del encerado: reflejos de los ventanales, del espejo y de la araña
    for (const cx of VEN) {
      const gr = g.createLinearGradient(0, y0, 0, y0 + 150); gr.addColorStop(0, "rgba(150,180,255,0.32)"); gr.addColorStop(1, "rgba(150,180,255,0)");
      g.fillStyle = gr; g.beginPath(); g.moveTo(cx - 70, y0); g.lineTo(cx + 70, y0); g.lineTo(xAt(cx + 70, y0 + 150), y0 + 150); g.lineTo(xAt(cx - 70, y0 + 150), y0 + 150); g.closePath(); g.fill();
    }
    const ge = g.createLinearGradient(0, y0, 0, y0 + 130); ge.addColorStop(0, "rgba(255,226,160,0.4)"); ge.addColorStop(1, "rgba(255,226,160,0)");
    g.fillStyle = ge; g.beginPath(); g.moveTo(436, y0); g.lineTo(588, y0); g.lineTo(xAt(588, y0 + 130), y0 + 130); g.lineTo(xAt(436, y0 + 130), y0 + 130); g.closePath(); g.fill();
    const ra = g.createRadialGradient(512, 520, 10, 512, 520, 300); ra.addColorStop(0, "rgba(255,236,190,0.28)"); ra.addColorStop(1, "rgba(255,236,190,0)");
    g.fillStyle = ra; g.fillRect(-40, y0, W + 80, y1 - y0);
    // sombra al pie de la pared
    const so = g.createLinearGradient(0, y0, 0, y0 + 26); so.addColorStop(0, "rgba(40,20,5,0.4)"); so.addColorStop(1, "rgba(40,20,5,0)");
    g.fillStyle = so; g.fillRect(-40, y0, W + 80, 26);
    g.restore();
  }
  // lámpara de araña (se cachea una vez; cada fotograma se mece y destella)
  const ARANA = { x: 512, y: -70, w: 340, h: 230 };
  const GOTAS = [];
  function creaArana() {
    const c = document.createElement("canvas"); c.width = ARANA.w; c.height = ARANA.h; const g = c.getContext("2d");
    const cx = ARANA.w / 2; g.translate(cx, 0); g.lineCap = "round"; g.lineJoin = "round";
    // cadena
    g.strokeStyle = ORO_O; g.lineWidth = 5; for (let y = 0; y < 60; y += 10) { g.beginPath(); g.ellipse(0, y + 5, 3, 5, 0, 0, TAU); g.stroke(); }
    // fuste
    g.fillStyle = ORO; g.strokeStyle = TINTA; g.lineWidth = 1.8;
    g.beginPath(); g.moveTo(-6, 60); g.lineTo(6, 60); g.lineTo(10, 120); g.quadraticCurveTo(22, 140, 0, 156); g.quadraticCurveTo(-22, 140, -10, 120); g.closePath(); g.fill(); g.stroke();
    // brazos (dos pisos) con velas
    const brazos = [[150, 132, 128, 6], [100, 98, 80, 4]];
    for (const [yb, yv, r, nB] of brazos) {
      for (let i = 0; i < nB; i++) {
        const u = nB === 1 ? 0 : i / (nB - 1), x = lerp(-r, r, u), z = 1 - Math.abs(lerp(-1, 1, u)) * 0.25;
        g.strokeStyle = ORO_O; g.lineWidth = 6; g.beginPath(); g.moveTo(0, yb); g.bezierCurveTo(x * 0.4, yb + 14, x * 0.9, yb + 6, x, yv); g.stroke();
        g.strokeStyle = ORO; g.lineWidth = 3.5; g.stroke();
        g.fillStyle = ORO; g.strokeStyle = TINTA; g.lineWidth = 1.3; g.beginPath(); g.ellipse(x, yv, 9, 3.5, 0, 0, TAU); g.fill(); g.stroke();
        g.fillStyle = "#fbf6ea"; g.fillRect(x - 3.5, yv - 20, 7, 18); g.strokeRect(x - 3.5, yv - 20, 7, 18);
        g.fillStyle = "#ffd06a"; g.beginPath(); g.moveTo(x, yv - 32); g.quadraticCurveTo(x + 5, yv - 24, x, yv - 20); g.quadraticCurveTo(x - 5, yv - 24, x, yv - 32); g.fill();
        // gota de cristal colgando de cada brazo
        GOTAS.push({ x: x * 1, y: yv + 18 + (yb === 150 ? 12 : 0) });
        g.strokeStyle = "rgba(220,240,255,0.9)"; g.lineWidth = 1; g.beginPath(); g.moveTo(x, yv + 3); g.lineTo(x, yv + 10 + (yb === 150 ? 12 : 0)); g.stroke();
        g.fillStyle = "rgba(225,245,255,0.92)"; g.strokeStyle = "#6c8fb0"; g.beginPath();
        const gy = yv + 10 + (yb === 150 ? 12 : 0); g.moveTo(x, gy); g.quadraticCurveTo(x + 6, gy + 10, x, gy + 18); g.quadraticCurveTo(x - 6, gy + 10, x, gy); g.fill(); g.stroke();
      }
    }
    // guirnaldas de cuentas entre los brazos
    g.fillStyle = "rgba(230,248,255,0.95)";
    for (const [r, yv, nB] of [[128, 132, 6], [80, 98, 4]]) {
      for (let i = 0; i < nB - 1; i++) {
        const xa = lerp(-r, r, i / (nB - 1)), xb = lerp(-r, r, (i + 1) / (nB - 1));
        for (let k = 1; k < 8; k++) { const u = k / 8, x = lerp(xa, xb, u), y = yv + 4 + 16 * Math.sin(Math.PI * u); g.beginPath(); g.arc(x, y, 1.9, 0, TAU); g.fill(); }
      }
    }
    // remate: bola de cristal
    g.fillStyle = "rgba(225,245,255,0.95)"; g.strokeStyle = "#6c8fb0"; g.lineWidth = 1.2;
    g.beginPath(); g.arc(0, 172, 9, 0, TAU); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(0, 181); g.quadraticCurveTo(7, 194, 0, 206); g.quadraticCurveTo(-7, 194, 0, 181); g.fill(); g.stroke();
    return c;
  }
  // balanceo de la araña: suave siempre; tras el golpe, más fuerte y amortiguado
  function vaivenArana(t) {
    const u = Math.max(0, t - T.choque);
    return 0.012 * Math.sin(t * 1.3) + (t > T.choque ? 0.06 * Math.sin(u * 5.5) * Math.exp(-u * 1.6) : 0);
  }
  function dibArana(g, t) {
    const a = vaivenArana(t);
    // halo cálido
    const hal = g.createRadialGradient(ARANA.x, 50, 10, ARANA.x, 50, 220); hal.addColorStop(0, "rgba(255,224,150,0.42)"); hal.addColorStop(1, "rgba(255,224,150,0)");
    g.fillStyle = hal; g.fillRect(ARANA.x - 230, -60, 460, 300);
    g.save(); g.translate(ARANA.x, ARANA.y); g.rotate(a);
    g.drawImage(arana, -ARANA.w / 2, 0);
    // destellos que van saltando de gota en gota
    for (let i = 0; i < GOTAS.length; i++) {
      const ph = (t * 0.9 + hash(i * 5.3)) % 1, k = Math.max(0, 1 - Math.abs(ph - 0.5) * 6) + (t > T.choque && t < T.choque + 0.8 ? 0.6 * hash(i + Math.floor(t * 20)) : 0);
      if (k > 0.02) estrella4(g, GOTAS[i].x, GOTAS[i].y, 7 * k, clamp(k));
    }
    // llamas que tiemblan
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrella4(g, x, y, r, a, col = "#ffffff") {
    if (a <= 0.01) return;
    g.save(); g.translate(x, y); g.globalAlpha = a; g.fillStyle = col; g.beginPath();
    for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.18 : r, an = i * Math.PI / 4; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
    g.closePath(); g.fill(); g.restore();
  }
  // notas del vals que salen de la bocina (una por tiempo)
  function notas(g, t) {
    const sonando = t0 => (t0 > 0.7 && t0 < T.choque) || t0 > T.choque + 0.75;
    g.save(); g.lineCap = "round";
    for (let i = -4; i < 40; i++) {
      const t0 = 0.6 + i * BT; if (!sonando(t0)) continue;
      const u = (t - t0) / 2.6; if (u <= 0 || u >= 1) continue;
      const x = 860 - 140 * u + 16 * Math.sin(u * 7 + i), y = 205 - 150 * u - 8 * Math.sin(u * 5 + i * 1.3);
      const a = Math.sin(Math.PI * u) * 0.95, r = 6.5;
      g.globalAlpha = a; g.fillStyle = i % 3 === 0 ? "#f3d98b" : "#e8c264"; g.strokeStyle = "#6b4a10"; g.lineWidth = 1.6;
      g.save(); g.translate(x, y); g.rotate(-0.2 + 0.2 * Math.sin(t * 3 + i));
      const doble = i % 3 === 1;
      g.beginPath(); g.ellipse(0, 0, r, r * 0.72, -0.35, 0, TAU); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(r * 0.85, -2); g.lineTo(r * 0.85, -26); g.stroke();
      if (doble) { g.beginPath(); g.ellipse(16, -4, r, r * 0.72, -0.35, 0, TAU); g.fill(); g.stroke(); g.beginPath(); g.moveTo(16 + r * 0.85, -6); g.lineTo(16 + r * 0.85, -30); g.stroke();
        g.lineWidth = 4; g.strokeStyle = "#6b4a10"; g.beginPath(); g.moveTo(r * 0.85, -26); g.lineTo(16 + r * 0.85, -30); g.stroke(); }
      else { g.beginPath(); g.moveTo(r * 0.85, -26); g.quadraticCurveTo(r * 0.85 + 10, -18, r * 0.85 + 6, -8); g.stroke(); }
      g.restore();
    }
    g.restore();
    // la aguja salta con el golpe: un zigzag
    const k = campana(t, T.choque, T.choque + 0.5);
    if (k > 0.01) { g.save(); g.globalAlpha = k; g.strokeStyle = "#f3d98b"; g.lineWidth = 3; g.beginPath();
      for (let i = 0; i <= 8; i++) g.lineTo(880 - i * 9, 230 - (i % 2 ? 10 : -4) - i * 4); g.stroke(); g.restore(); }
  }
  // rayas de giro alrededor de la peonza y estela
  function rayasGiro(g, p, t, k) {
    if (k <= 0.01) return;
    g.save(); g.globalAlpha = k; g.lineCap = "round";
    for (const [y, rx, gr] of [[SUELO - 60, 62, 3], [SUELO - 210, 70, 3.5], [SUELO - 330, 58, 3]]) {
      for (let j = 0; j < 2; j++) {
        const a0 = t * 16 + j * Math.PI + y;
        g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = gr;
        g.beginPath(); g.ellipse(p.x, y, rx, rx * 0.2, 0, a0, a0 + 1.4); g.stroke();
      }
    }
    // estela hacia atrás (a la derecha)
    g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 3;
    for (let i = 0; i < 4; i++) { const y = SUELO - 80 - i * 85; g.beginPath(); g.moveTo(p.x + 70, y); g.lineTo(p.x + 150 + 20 * i, y); g.stroke(); }
    g.restore();
  }
  function polvo(g, x, y, k, t, sem) {
    if (k <= 0.01) return;
    g.save();
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI * (0.1 + 0.8 * hash(sem + i)), d = 10 + 70 * k * (0.5 + hash(sem + i * 3));
      const r = (14 + 22 * hash(sem + i * 5)) * (0.5 + k);
      g.globalAlpha = 0.75 * (1 - k * 0.9); g.fillStyle = i % 2 ? "#e8dcc4" : "#cbbd9f";
      g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.7, r, 0, TAU); g.fill();
    }
    g.restore();
  }
  // estallido del golpe en el borde izquierdo
  function estallido(g, t) {
    const k = campana(t, T.choque, T.choque + 0.28); if (k <= 0) return;
    g.save(); g.translate(0, 330); g.scale(0.7 + 0.5 * k, 0.7 + 0.5 * k);
    g.fillStyle = "#fff4c2"; g.strokeStyle = TINTA; g.lineWidth = 3;
    g.beginPath(); for (let i = 0; i < 18; i++) { const a = i * TAU / 18, r = i % 2 ? 38 : 90; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#ffb53c"; g.beginPath(); for (let i = 0; i < 18; i++) { const a = i * TAU / 18 + 0.1, r = i % 2 ? 20 : 48; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill();
    g.restore();
  }
  // cuadro dorado que entra rodando tras el golpe y se queda tirado en el suelo
  function poseCuadro(t) {
    const u = t - (T.choque + 0.04);
    if (u < 0) return null;
    const vuelo = clamp(u / 0.42), rebote = clamp((u - 0.42) / 0.45), s = salida(rebote);
    const a = -1.6 + 3.6 * vuelo + 0.28 * s + 0.15 * Math.sin(rebote * 12) * (1 - rebote);
    // Incluye la mitad del trazo exterior de 11 px para hallar la esquina que apoya.
    const borde = 35.5 * Math.abs(Math.sin(a)) + 41.5 * Math.abs(Math.cos(a));
    const x = -50 + 120 * vuelo + 28 * s;
    const y = lerp(380, SUELO - borde, vuelo * vuelo) - 90 * Math.sin(Math.PI * vuelo)
      - 8 * Math.abs(Math.sin(2 * Math.PI * rebote)) * (1 - rebote);
    return { x, y, a };
  }
  function cuadroSuelto(g, t) {
    const cuadro = poseCuadro(t);
    if (!cuadro) return;
    const { x, y, a } = cuadro;
    g.save(); g.translate(x, y); g.rotate(a);
    g.fillStyle = "#3a5d3a"; g.fillRect(-26, -32, 52, 64);
    g.fillStyle = "#e9d6a6"; g.beginPath(); g.ellipse(0, -6, 12, 15, 0, 0, TAU); g.fill();
    g.fillStyle = "#3a2a1a"; g.beginPath(); g.ellipse(0, -14, 13, 9, 0, Math.PI, TAU); g.fill();
    g.fillStyle = "#2c3d5c"; g.beginPath(); g.moveTo(-18, 32); g.quadraticCurveTo(0, 6, 18, 32); g.fill();
    g.strokeStyle = ORO_O; g.lineWidth = 11; g.strokeRect(-30, -36, 60, 72); g.strokeStyle = ORO; g.lineWidth = 7; g.strokeRect(-30, -36, 60, 72);
    g.strokeStyle = ORO_L; g.lineWidth = 1.5; g.strokeRect(-33, -39, 66, 78);
    g.restore();
  }
  // anillas que ruedan por el suelo
  function anillas(g, t) {
    if (t < T.choque + 0.06) return;
    for (let i = 0; i < 3; i++) {
      const u = t - (T.choque + 0.06 + i * 0.07), v = clamp(u / (0.9 + 0.2 * i));
      const x = -10 + (120 + 40 * i) * salida(v), y = SUELO - 30 - i * 14 - 40 * Math.abs(Math.sin(v * Math.PI * (2 + i))) * (1 - v);
      g.save(); g.translate(x, y); g.rotate(v * 8); g.strokeStyle = TINTA; g.lineWidth = 5; g.beginPath(); g.ellipse(0, 0, 9, 9, 0, 0, TAU); g.stroke();
      g.strokeStyle = "#e0b555"; g.lineWidth = 3; g.stroke(); g.restore();
    }
  }

  /* ---------- cámara ---------- */
  const PLANOS = [
    [0, 1.0, 512, 300], [1.0, 1.0, 512, 300], [1.6, 1.07, 560, 304], [4.3, 1.07, 560, 304],
    [5.0, 1.05, 486, 304], [7.6, 1.05, 486, 304], [8.4, 1.12, 432, 312], [10.0, 1.12, 400, 312], [10.9, 1.1, 420, 312],
    [11.35, 1.0, 512, 300], [12.6, 1.0, 512, 300], [13.3, 1.04, 470, 306], [DUR, 1.04, 470, 306]
  ];
  function camara(t) {
    let i = 0; while (i < PLANOS.length - 2 && t > PLANOS[i + 1][0]) i++;
    const a = PLANOS[i], b = PLANOS[i + 1], k = suave(fase(t, a[0], b[0]));
    const kk = lerp(a[1], b[1], k), x = lerp(a[2], b[2], k), y = lerp(a[3], b[3], k);
    const mx = W / 2 / kk, my = H / 2 / kk;
    // temblor del golpe
    const u = t - T.choque, tb = t > T.choque ? 9 * Math.exp(-u * 5.5) : 0;
    return { k: kk, x: clamp(x, mx - 30, W + 30 - mx) + tb * Math.sin(u * 61), y: clamp(y, my - 30, H + 30 - my) + tb * 0.6 * Math.sin(u * 47) };
  }

  // dibuja a un personaje con su giro aplastado (sx) e inclinación alrededor de sus pies
  function dibuja(R, g, p, t) {
    const sx = p.sx ?? 1, inc = p.inclina || 0;
    if (Math.abs(sx - 1) < 1e-4 && !inc) { R.dibujar(g, p, t); return; }
    g.save(); g.translate(p.x, SUELO); if (inc) g.rotate(inc); g.scale(Math.abs(sx) < 0.02 ? 0.02 * Math.sign(sx || 1) : sx, 1); g.translate(-p.x, -SUELO);
    R.dibujar(g, p, t); g.restore();
  }
  function sombra(g, x, ancho, k = 1) {
    g.save(); g.fillStyle = `rgba(50,22,6,${0.32 * k})`; g.beginPath(); g.ellipse(x, SUELO + 3, ancho, 9, 0, 0, TAU); g.fill();
    // reflejo en el encerado
    const re = g.createLinearGradient(0, SUELO, 0, SUELO + 60); re.addColorStop(0, `rgba(30,12,4,${0.18 * k})`); re.addColorStop(1, "rgba(30,12,4,0)");
    g.fillStyle = re; g.fillRect(x - ancho * 0.6, SUELO, ancho * 1.2, 60); g.restore();
  }

  const posa = t => pose(t);
  class GuillermoKirikuBaile extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !KI.listo()) return;
      if (!fondo) { fondo = creaFondo(); arana = creaArana(); cortinaImg = creaCortina(); }
      const { g: pg, k: pk } = pose(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      g.drawImage(fondo, -40, -40);
      dibArana(g, t);
      // la cortina del borde: hasta el golpe cuelga; con el golpe sale de un tirón hacia la izquierda
      const tir = tramo(t, T.choque + 0.02, T.choque + 0.24, entrada);
      if (tir < 1) { g.save(); g.translate(-160 * tir, -30 * tir); g.rotate(-0.25 * tir); g.drawImage(cortinaImg, -50, 12); g.restore(); }
      notas(g, t);
      // sombras
      const enCuadroG = pg.x > -140;
      sombra(g, pk.x, 56 * Math.max(0.35, Math.abs(pk.sx)));
      if (enCuadroG) sombra(g, pg.x, 54 * Math.max(0.35, Math.abs(pg.sx)));
      // personajes (Kiriku delante: su mano envuelve la de Guillermo)
      // lo que entra rodando tras el golpe queda en el suelo, por detrás de los dos
      cuadroSuelto(g, t);
      anillas(g, t);
      if (t >= T.vuelve0) capaDetras(g, pg, t);
      if (enCuadroG) dibuja(G, g, pg, t);
      dibuja(KI, g, pk, t);
      // efectos
      const girando = t > T.suelta && t < T.sale + 0.05;
      rayasGiro(g, pg, t, girando ? tramo(t, T.suelta, T.suelta + 0.15) : 0);
      polvo(g, pg.x + 30, SUELO, girando ? fase(t, T.suelta, T.suelta + 0.5) : 0, t, 11);
      // golpe fuera de cuadro
      for (let i = 0; i < 3; i++) polvo(g, 10, 360 + i * 70, fase(t, T.choque + i * 0.05, T.choque + 0.9 + i * 0.1), t, 40 + i * 9);
      estallido(g, t);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00087.2", nombre: "Guillermo y Kiriku · El baile de salón", crear: () => new GuillermoKirikuBaile() });
  // diagnóstico: distancia hombro → muñeca de cada mano frente al máximo del brazo
  function diag(t) {
    const { g: pg, k: pk } = pose(t), o = {};
    const dist = (R, p, lado) => { const m = lado === "cerca" ? p.manoCerca : p.manoLejos, h = R.tronco(p)(lado === "cerca" ? R.HOMBRO_C : R.HOMBRO);
      const mu = m.mu ?? -1.75, w = R.rotP({ x: Math.cos(mu) * 13 * 2.6, y: Math.sin(mu) * 13 * 2.6 }, m.ang || 0);
      return Math.round(Math.hypot(m.x + w.x - h.x, m.y + w.y - h.y)); };
    o.gC = dist(G, pg, "cerca"); o.gL = dist(G, pg, "lejos"); o.kC = dist(KI, pk, "cerca"); o.kL = dist(KI, pk, "lejos");
    o.max = { gC: Math.round(G.BRAZO_C_L * 1.08), gL: Math.round(G.BRAZO_L * 1.08), kC: Math.round(KI.BRAZO_C_L * 1.08), kL: Math.round(KI.BRAZO_L * 1.08) };
    o.xg = Math.round(pg.x); o.xk = Math.round(pk.x);
    return o;
  }
  window.__A2D_00087_2 = { pose: posa, T, DUR, diag, camara, poseCuadro, vueltaPasos: VUELTA_PASOS, suelo: SUELO };
})();
