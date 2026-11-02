"use strict";
/* 00124 · Guillermo y Sara · La tormenta
 *
 * Negro → una buhardilla de noche: techo inclinado con vigas, papel pintado añil, una ventana grande
 * de dos hojas con cortinas de terciopelo mostaza, un sillón orejero verde con una manta de cuadros
 * echada por encima, una estantería con libros y plantas, una lámpara de pie que da luz cálida y una
 * alfombra redonda. Fuera, tormenta: nubes, lluvia y la ciudad al fondo.
 *
 * Sara, que adora las tormentas, quita el pestillo y abre la ventana de par en par: entra el viento,
 * la melena le vuela hacia atrás y ella cierra los ojos y sonríe al temporal. Guillermo, al lado, tirita
 * con las manos en los bolsillos. Primer trueno (relámpago y retumbo): Guillermo da un respingo y corre
 * a esconderse detrás de la cortina, donde solo asoman los ojos, los pinchos del pelo y las zapatillas,
 * temblando. Sara le mira de reojo y levanta una ceja. Segundo trueno, más fuerte: Guillermo sale de la
 * cortina de un salto más alto, se da la vuelta, corre al sillón, coge la manta y se la echa por encima: un
 * fantasma tembloroso que se acerca a saltitos. Tercer trueno, el más gordo: el fantasma pega el salto más
 * alto, la manta sale disparada hacia arriba, se queda un momento colgando vacía y cae arrugada al suelo, y
 * Guillermo aterriza en brazos de Sara, que le coge sin apartar la vista de la tormenta. Él se agarra a su
 * camiseta con las piernas colgando; ella le sostiene como a un gato, le rasca debajo de la barbilla (él
 * ronronea) y sigue mirando los relámpagos; un último relámpago le hace dar un respingo. Al final él mira a
 * cámara colorado y Sara, impasible, también mira a cámara con media sonrisa → negro.
 *
 * Los relámpagos son rampas suaves (sin fogonazos de un fotograma). Guillermo se dibuja con un «marco»
 * (traslación, giro y escala horizontal alrededor de la pelvis) para el giro aplastado, el vuelo y el
 * ovillo en brazos; las manos de Sara van a puntos de su cuerpo calculados con ese marco. Sin textos.
 * Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, resta, hash, ruido } = M2;
  const G = Guillermo, S = SaraSaez, R = Recortes;
  const S0 = 0.28, SUELO0 = 568, DUR = 14.8, TAU = Math.PI * 2;
  const P = (x, y) => ({ x, y });
  const difAng = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const rot = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return P(q.x * c - q.y * s, q.x * s + q.y * c); };
  const lienzo = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  const TINTA = "#16121c";

  const T = {
    entra: 0.8,
    // Sara abre la ventana
    latch0: 0.95, latch1: 1.38, gira: 1.52, empuja0: 1.58, abre: 1.72, empuja1: 2.02, racha: 1.9,
    brazos0: 2.35, brazos1: 3.7,
    // primer trueno: respingo y a la cortina
    rayo1: 3.9, salta1: 3.97, cae1: 4.3, corre1: 4.34, esconde: 4.8,
    sMira0: 5.2, ceja: 5.5, sMira1: 6.1,
    // segundo trueno: sale de la cortina de un salto, se da la vuelta, corre al sillón y se tapa con la manta
    rayo2: 6.9, salta2: 6.95, cae2: 7.4, gira0: 7.43, gira1: 7.6, corre2: 7.62, llega2: 8.16,
    coge: 8.24, tira0: 8.3, tapa: 8.62, giraF0: 8.68, giraF1: 8.84,
    saltitos: 8.88, saltitos1: 9.58,
    sMiraF0: 9.0, sonrisilla: 9.25, sMiraF1: 9.5,
    // tercer trueno: el gran salto a los brazos de Sara
    rayo3: 9.72, agacha: 9.76, despega: 9.9, atrapa: 10.42,
    sBrazos0: 9.98, sBrazos1: 10.36,
    // en brazos
    acaricia0: 11.25, acaricia1: 12.0, rayo4: 12.3,
    gCamara: 12.85, sCamara: 13.15, smirk: 13.45,
    fin: 14.1
  };

  /* =====================================================================================
   * UTILIDADES
   * ===================================================================================== */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function guion(lista, dic, base, t) {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const parpadeo = (t, lista, d = 0.15) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const D = (pu, ix, md, re) => ({ pulgar: pu, indice: ix, medio: md, anular: re, menique: re });
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const AGARRA = D(0.3, 0.3, 0.3, 0.3), PUNO = D(0, 0, 0, 0), PALMA = D(0.9, 1, 1, 1), RELAJ = D(0.5, 0.55, 0.5, 0.45), ZARPA = D(0.25, 0.35, 0.3, 0.25);
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));

  /* ---------- manos ----------
   * manoEn: mano centrada en `scr` (pantalla del muñeco, sin el marco). El antebrazo apunta al codo que
   * sale de la IK, así la mano siempre sigue al brazo; si el brazo no llega, se queda donde llega. */
  const CODO = new Map([[G, { l: G.BRAZO_L * 0.5, c: G.A.datos.piezas.brazo_cerca.codo }],
                        [S, { l: (S.A.datos.piezas.brazo || {}).codo ?? S.BRAZO_L * 0.5, c: (S.A.datos.piezas.brazo_cerca || {}).codo ?? S.BRAZO_C_L * 0.5 }]]);
  function manoEn(Pj, p, lado, scr, o = {}) {
    const cerca = lado === "cerca", Tr = Pj.tronco(p), h = Tr(cerca ? Pj.HOMBRO_C : Pj.HOMBRO);
    const L = cerca ? Pj.BRAZO_C_L : Pj.BRAZO_L, sj = CODO.get(Pj)[cerca ? "c" : "l"];
    const dobla = o.dobla ?? (cerca ? -1 : 1);
    let q = Pj.aHoja(p, scr);
    const d = Math.hypot(q.x - h.x, q.y - h.y), Lmax = L * (o.max || 1.04);
    if (d > Lmax) q = { x: h.x + (q.x - h.x) * Lmax / d, y: h.y + (q.y - h.y) * Lmax / d };
    const c = R.ik(h, q, L, sj, 42, dobla, 1.08), dir = R.dir(c.a1);
    const e = { x: h.x + dir.x * sj * c.estira, y: h.y + dir.y * sj * c.estira };
    const mu = Math.atan2(e.y - q.y, e.x - q.x) + (o.dmu || 0);
    return { x: q.x, y: q.y, ang: 0, mu, dobla, puno: o.puno ?? 1, dedos: o.dedos || AGARRA };
  }
  function mezclaMano(a, b, k) {
    if (k <= 0) return a; if (k >= 1) return b;
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), ang: 0, mu: a.mu + difAng(a.mu, b.mu) * k, dobla: k < 0.5 ? a.dobla : b.dobla,
      puno: lerp(a.puno ?? 1, b.puno ?? 1, k), dedos: DD(a.dedos || AGARRA, b.dedos || AGARRA, k) };
  }
  // pista de una mano: [t0, t1, f(p) → mano, curva]
  function pista(lista, t, p) {
    let c = lista[0][2](p);
    for (let i = 1; i < lista.length; i++) { const [t0, t1, f, e] = lista[i]; if (t <= t0) break; c = mezclaMano(c, f(p), (e || suave)(fase(t, t0, t1))); }
    return c;
  }
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { cerca: punoDesde(P(131, 652), -1.75), lejos: punoDesde(P(372, 648), -1.75) };
  function bolsillo(Pj, p, lado) {
    if (Pj === G) { const b = G.tronco(p)(BOLS_G[lado]); return { x: b.x, y: b.y, ang: 0, mu: -1.75, puno: 0, dobla: lado === "cerca" ? -1 : 1, dedos: D(0.4, 0.4, 0.4, 0.4) }; }
    const m = Pj.manoReposo(p, lado); return Object.assign({ dedos: D(0.4, 0.4, 0.4, 0.4) }, m);
  }
  // mano en un punto de la hoja (para Guillermo girado: sus manos van en su propia hoja)
  const manoHoja = (Pj, p, lado, q, o) => manoEn(Pj, p, lado, Pj.aPantalla(p, q), o);

  /* ---------- pies ---------- */
  // pasos: [t0, t1, x, alza] (x en pantalla del muñeco)
  function pieAndando(lista, t, x0) {
    let x = x0, alza = 0, u = 0;
    for (const [t0, t1, xx, a] of lista) {
      if (t <= t0) break;
      const k = fase(t, t0, t1);
      if (k < 1) { x = lerp(x, xx, suave5(k)); alza = a * Math.sin(Math.PI * k); u = k; break; }
      x = xx;
    }
    return { x, h: alza, a: alza > 0.5 ? -0.16 * Math.sin(Math.PI * u) : 0 };
  }
  function aPierna(Pj, p, w, lado) {
    const tob = Pj.SUELO - Pj.TOBILLO_ALTO;
    return { tob: P(Pj.aHoja(p, P(w.x, p.suelo)).x, tob - (lado === "lejos" ? 12 : 0) - w.h / (p.s * Pj.K)), ang: w.a };
  }

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
  const CU0 = { pel: 0, torso: 0, cab: 0, cdy: 0 };
  const CU = o => Object.assign({}, CU0, o);

  /* =====================================================================================
   * TORMENTA: viento, relámpagos y truenos
   * ===================================================================================== */
  // relámpago: subida rápida (pero en rampa), un par de parpadeos y bajada lenta; i = intensidad
  const RAYOS = [[T.rayo1, 0.75, 1], [T.rayo2, 0.9, 2], [T.rayo3, 1, 3], [T.rayo4, 0.32, 1]];
  function destello(t) {
    let f = 0;
    for (const [t0, k, n] of RAYOS) {
      const v = t - t0; if (v < -0.01 || v > 1.0) continue;
      let e = 0;
      const sube = 0.15;
      e = Math.max(e, suave(fase(v, 0, sube)) * (1 - suave(fase(v, sube, 0.72))));
      for (let i = 1; i < n; i++) { const c0 = 0.12 + i * 0.13; e = Math.max(e, 0.85 * campana(v, c0, c0 + 0.22)); }
      f = Math.max(f, k * e);
    }
    return f;
  }
  // el rayo visible en el cielo (solo mientras dura el destello)
  const rayoVisible = t => { let o = null; for (const [t0, k] of RAYOS) { const v = t - t0; if (v > -0.02 && v < 0.6) o = { t0, a: k * (1 - suave(fase(v, 0.16, 0.6))) * suave(fase(v, -0.02, 0.1)) }; } return o; };
  // temblor de cámara (los truenos retumban un poco después del destello)
  function temblor(t) {
    let x = 0, y = 0;
    for (const [t0, k, n] of RAYOS) {
      const v = t - t0 - 0.06; if (v < 0 || v > 1.1) continue;
      const a = k * k * 4.5 * (n === 3 ? 1.4 : 1) * Math.exp(-v * 4) * suave(fase(v, 0, 0.12)) * (1 - tramo(v, 0.9, 1.1));
      x += a * Math.sin(v * 30 + n); y += a * 0.7 * Math.sin(v * 37 + 2 * n);
    }
    return P(x, y);
  }
  // viento que entra por la ventana (0 cerrado; ~1 abierta; rachas con los truenos)
  function viento(t) {
    const abierta = tramo(t, T.abre - 0.05, T.racha + 0.15);
    let v = abierta * (0.85 + 0.25 * ruido(t * 1.7) + 0.12 * Math.sin(t * 5.3));
    for (const [t0, k] of RAYOS) v += abierta * 0.55 * k * campana(t, t0 + 0.05, t0 + 0.9);
    v += 0.5 * campana(t, T.racha - 0.05, T.racha + 0.7);
    return v;
  }

  /* =====================================================================================
   * DECORADO: medidas
   * ===================================================================================== */
  const VEN = { x0: 482, x1: 718, y0: 62, y1: 350, mx: 600 };          // hueco de la ventana
  const BARRA_Y = 40;                                                   // barra de las cortinas
  const CORT_I = { x0: 372, x1: 488 }, CORT_D = { x0: 712, x1: 828 };   // cortinas (recogidas)
  const CORT_BAJO = 556;
  const SILLON = { x0: 92, x1: 238, yTop: 352, ySeat: 456, ySuelo: 528 };
  const PESTILLO = P(603, 286);
  const ALFEIZAR = P(612, 354);

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  const CG = {
    nervioso: E({ mx: 0.85, my: -0.05, iris: 0.95, sd: 8, gd: 0.12, si: 8, gi: 0.12, abre: 2, ancho: 0.6, sonr: -0.3 }),
    tirita: E({ mx: 0.6, my: -0.15, c: 0.3, z: 0.2, sd: 14, gd: 0.2, si: 14, gi: 0.2, abre: 5, ancho: 0.75, sonr: -0.45 }),
    susto: E({ mx: 0.7, my: -0.5, iris: 0.58, sd: 32, si: 32, abre: 24, ancho: 0.7, sonr: -0.25 }),
    asoma: E({ mx: 0.9, my: -0.1, iris: 0.82, sd: 20, gd: 0.15, si: 20, gi: 0.15, abre: 2, ancho: 0.6, sonr: -0.3 }),
    grito: E({ mx: 0.5, my: -0.6, iris: 0.55, sd: 34, si: 34, abre: 30, ancho: 0.75, sonr: -0.3 }),
    corre: E({ mx: -0.2, my: 0.0, iris: 0.7, sd: 26, si: 26, abre: 16, ancho: 0.65, sonr: -0.3 }),
    fantasma: E({ mx: 0.85, my: -0.1, iris: 0.8, sd: 20, si: 20, abre: 4, ancho: 0.6, sonr: -0.3 }),
    vuelo: E({ mx: 0.4, my: -0.7, iris: 0.5, sd: 36, si: 36, abre: 30, ancho: 0.8, sonr: -0.3 }),
    brazos: E({ mx: 0.1, my: -0.6, iris: 1.25, sd: 26, gd: 0.25, si: 26, gi: 0.25, abre: 4, ancho: 0.5, sonr: -0.15 }),
    gusto: E({ mx: 0.2, my: -0.4, c: 0.62, h: 0.85, sd: 12, si: 12, abre: 0, ancho: 0.8, sonr: 0.7, rub: 0.55 }),
    respingo: E({ mx: 0.4, my: -0.7, iris: 0.72, sd: 26, si: 26, abre: 9, ancho: 0.55, sonr: -0.1, rub: 0.4 }),
    camara: E({ mx: -0.88, my: 0.05, c: 0.18, sd: 14, gd: 0.15, si: 14, gi: 0.15, abre: 2, ancho: 0.85, sonr: 0.45, rub: 0.8 })
  };
  const GUION_CG = [
    [1.85, 2.2, "tirita"], [T.rayo1 + 0.03, T.rayo1 + 0.1, "susto"], [T.esconde - 0.05, T.esconde + 0.12, "asoma"],
    [T.rayo2 + 0.02, T.rayo2 + 0.09, "grito"], [T.cae2, T.cae2 + 0.1, "corre"], [T.tapa, T.tapa + 0.12, "fantasma"],
    [T.agacha, T.despega, "vuelo"], [T.atrapa + 0.02, T.atrapa + 0.2, "brazos"], [T.acaricia0 + 0.15, T.acaricia0 + 0.45, "gusto"],
    [T.rayo4 + 0.02, T.rayo4 + 0.12, "respingo"], [T.gCamara, T.gCamara + 0.18, "camara"]
  ];
  const PARP_G = [0.6, 2.9, 5.6, 6.3, 8.7, 9.3, 11.0, 12.65, 13.7];
  const CUER_G = {
    base: CU({ pel: 4, torso: 0.02, cab: 0.0, cdy: 4 }),
    encogido: CU({ pel: 22, torso: 0.1, cab: 0.08, cdy: 16 }),
    agacha: CU({ pel: 50, torso: 0.16, cab: 0.1, cdy: 14 }),
    aire: CU({ pel: -14, torso: -0.12, cab: -0.16, cdy: -6 }),
    escondido: CU({ pel: 18, torso: 0.18, cab: 0.06, cdy: 12 }),
    corre: CU({ pel: 10, torso: 0.2, cab: 0.08, cdy: 6 }),
    coge: CU({ pel: 26, torso: 0.34, cab: 0.08, cdy: 6 }),
    tira: CU({ pel: 0, torso: -0.12, cab: -0.2, cdy: 0 }),
    fantasma: CU({ pel: 16, torso: 0.06, cab: 0.0, cdy: 10 }),
    ovillo: CU({ pel: 0, torso: 0.22, cab: 0.3, cdy: 14 }),
    camara: CU({ pel: 0, torso: 0.26, cab: 0.66, cdy: 12 })
  };
  const GUION_CUG = [
    [1.85, 2.3, "encogido"], [T.salta1 - 0.04, T.salta1, "agacha"], [T.salta1, T.salta1 + 0.1, "aire", salida], [T.cae1 - 0.03, T.cae1 + 0.06, "agacha"],
    [T.corre1, T.corre1 + 0.12, "corre"], [T.esconde - 0.1, T.esconde + 0.12, "escondido"],
    [T.salta2 - 0.04, T.salta2, "agacha"], [T.salta2, T.salta2 + 0.1, "aire", salida], [T.cae2 - 0.03, T.cae2 + 0.06, "agacha"],
    [T.gira1, T.gira1 + 0.1, "corre"], [T.llega2 - 0.05, T.coge, "coge"], [T.tira0, T.tira0 + 0.16, "tira"],
    [T.tapa - 0.02, T.tapa + 0.12, "fantasma"], [T.agacha, T.despega, "agacha"], [T.despega, T.despega + 0.14, "aire", salida],
    [T.despega + 0.14, T.atrapa - 0.04, "ovillo"], [T.gCamara - 0.05, T.gCamara + 0.3, "camara"]
  ];
  // dónde está (x de la pelvis) y hacia dónde mira (+1 derecha, −1 izquierda)
  const XG0 = 272, XG_CORT = 425, XG_SAL = 562, XG_SILLON = 302, XG_FIN = 442;
  // saltitos del fantasma: 3 brincos de ~47 px
  const BRINCOS = [0, 1, 2].map(i => [T.saltitos + i * 0.235, T.saltitos + i * 0.235 + 0.2]);
  function xG(t) {
    if (t < T.corre1) return XG0 + 6 * tramo(t, T.salta1, T.cae1);
    if (t < T.esconde) return lerp(XG0 + 6, XG_CORT, suave(fase(t, T.corre1, T.esconde)));
    if (t < T.salta2) return XG_CORT;
    if (t < T.cae2) return lerp(XG_CORT, XG_SAL, suave(fase(t, T.salta2, T.cae2)));
    if (t < T.corre2) return XG_SAL;
    if (t < T.saltitos) return lerp(XG_SAL, XG_SILLON, suave(fase(t, T.corre2, T.llega2)));
    let x = XG_SILLON;
    BRINCOS.forEach(([a, b]) => { x += (XG_FIN - XG_SILLON) / BRINCOS.length * suave(fase(t, a, b)); });
    return x;
  }
  // zancadas: los pies se alternan (primero el lejano) entre x0 y x1 (pantalla); off = separación de cada pie
  function zancadas(t, t0, t1, x0, x1, n, offC, offL, alza) {
    const d = (t1 - t0) / n, pie = { C: x0 + offC, L: x0 + offL }, h = { C: 0, L: 0 };
    for (let k = 0; k < n; k++) {
      const f = k % 2 ? "C" : "L", a = t0 + k * d - d * 0.15, b = t0 + (k + 1) * d + d * 0.15;
      const destino = (k >= n - 2 ? x1 : lerp(x0, x1, (k + 1.6) / n)) + (f === "C" ? offC : offL);
      if (t >= b) { pie[f] = destino; continue; }
      if (t > a) { const u = fase(t, a, b); pie[f] = lerp(pie[f], destino, suave(u)); h[f] = alza * Math.sin(Math.PI * u); }
    }
    return { wC: { x: pie.C, h: h.C, a: h.C > 1 ? -0.15 : 0 }, wL: { x: pie.L, h: h.L, a: h.L > 1 ? -0.15 : 0 } };
  }
  // giros aplastados: [t0, t1, de, a]
  const GIROS = [[T.gira0, T.gira1, 1, -1], [T.giraF0, T.giraF1, -1, 1]];
  function orientacion(t) {
    let lado = 1, esx = 1;
    for (const [a, b, de, aa] of GIROS) {
      if (t >= b) { lado = aa; esx = 1; continue; }
      if (t > a) { const u = fase(t, a, b); lado = u < 0.5 ? de : aa; esx = Math.max(0.04, Math.abs(Math.cos(Math.PI * suave(u)))); }
      break;
    }
    return { lado, esx };
  }
  // altura del cuerpo por los saltos (px de pantalla)
  function saltoG(t) {
    let h = 0;
    h += 34 * Math.sin(Math.PI * fase(t, T.salta1, T.cae1)) * (t > T.salta1 && t < T.cae1 ? 1 : 0);
    h += 86 * Math.sin(Math.PI * fase(t, T.salta2, T.cae2)) * (t > T.salta2 && t < T.cae2 ? 1 : 0);
    for (const [a, b] of BRINCOS) if (t > a && t < b) h += 16 * Math.sin(Math.PI * fase(t, a, b));
    return h;
  }

  /* ---------- marco de Guillermo (vuelo y ovillo en brazos) ---------- */
  const PHI_OVILLO = -1.2;
  // pelvis de Guillermo en brazos de Sara (mundo); el bote al cogerle lo pone `dipS`
  const dipS = t => 10 * campana(t, T.atrapa - 0.02, T.atrapa + 0.5);
  const W_OVILLO = t => P(652, 373 + dipS(t) + 2 * Math.sin(t * 2.1 + 0.8) * tramo(t, T.atrapa + 0.3, T.atrapa + 0.9));

  function poseG(t) {
    const b = guion(GUION_CUG, CUER_G, "base", t);
    const { lado, esx } = orientacion(t);
    const x = xG(t), respira = Math.sin(t * 2.3);
    const tir = tramo(t, 1.9, 2.3) * (1 - tramo(t, T.rayo1, T.rayo1 + 0.05));             // tiritona
    const tiemblaC = dentro(t, T.esconde, T.esconde + 0.2, T.salta2 - 0.05, T.salta2);      // tembleque tras la cortina
    const tiemblaF = dentro(t, T.tapa, T.tapa + 0.2, T.despega - 0.02, T.despega) * (1 + 1.2 * tramo(t, T.saltitos1, T.rayo3 + 0.05));
    const tiemblaB = dentro(t, T.atrapa, T.atrapa + 0.1, T.acaricia0 + 0.2, T.acaricia0 + 0.6) + 0.6 * campana(t, T.rayo4, T.rayo4 + 0.7);
    const tr = Math.max(tir * 0.6, tiemblaC, tiemblaF * 0.8, tiemblaB);
    const p = { x: x + 0.9 * Math.sin(t * 51) * tr, suelo: SUELO0, s: S0, espejo: lado < 0, tirasLimpias: true, ikContinuo: false,
      hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 - saltoG(t) / S0 },
      torso: b.torso + 0.012 * Math.sin(t * 47) * tr, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.015 * Math.sin(t * 43) * tr, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } } };
    p.lado = lado; p.ladoC = lado * esx;
    // asomado: se inclina hacia el borde de la cortina
    const aso = dentro(t, T.esconde - 0.1, T.esconde + 0.2, T.salta2 - 0.08, T.salta2);
    p.cabeza.ang += 0.08 * aso + 0.05 * Math.sin(t * 1.3) * aso;
    // pies
    pies(t, p, lado);
    // cara
    const e = guion(GUION_CG, CG, "nervioso", t);
    if (tir > 0.05 && t < T.rayo1) { e.abre += 3 * tir * (0.5 + 0.5 * Math.sin(t * 38)); }          // castañetean los dientes
    if (aso > 0.05) e.mx = lerp(e.mx, 0.9 * Math.sin(t * 2.7) * 0.5 + 0.4, aso * 0.8 * (Math.sin(t * 2.7) > 0 ? 1 : 0.7));
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.sudor = 0.6 * dentro(t, T.esconde, T.esconde + 0.5, T.rayo2, T.rayo2 + 0.2) + 0.7 * dentro(t, T.atrapa, T.atrapa + 0.3, T.acaricia0 + 0.2, T.acaricia0 + 0.6);
    // marco: giro aplastado, vuelo y ovillo
    p.marco = marcoG(t, p, esx);
    manosG(t, p);
    return p;
  }
  function pies(t, p, lado) {
    const ladoAnte = lado;           // a qué lado mira ahora
    let wC, wL;
    const plano = (xc, xl) => { wC = { x: xc, h: 0, a: 0 }; wL = { x: xl, h: 0, a: 0 }; };
    const x = xG(t);
    if (t < T.corre1) plano(x - 16, x + 28);
    else if (t < T.esconde + 0.05) ({ wC, wL } = zancadas(t, T.corre1, T.esconde, XG0 + 6, XG_CORT, 4, -16, 28, 16));
    else if (t < T.gira0) plano(x - 16, x + 28);
    else if (t < T.corre2) {
      // durante el giro aplastado el marco escala; tras la mitad, la hoja ya mira al otro lado
      if (ladoAnte > 0) plano(x - 16, x + 28); else plano(x + 16, x - 28);
    } else if (t < T.tapa + 0.02) ({ wC, wL } = zancadas(t, T.corre2, T.llega2, XG_SAL, XG_SILLON, 5, 16, -28, 18));
    else if (t < T.giraF1 + 0.01) {
      if (ladoAnte < 0) plano(x + 16, x - 28); else plano(x - 16, x + 28);
    } else plano(x - 16, x + 28);
    // tembleque de rodillas (las zapatillas golpean el suelo)
    const tc = dentro(t, T.esconde + 0.1, T.esconde + 0.3, T.salta2 - 0.1, T.salta2);
    if (tc > 0) { wC.h += 3 * tc * Math.max(0, Math.sin(t * 31)); wL.h += 3 * tc * Math.max(0, Math.sin(t * 31 + 2)); }
    // los saltos levantan los pies con el cuerpo
    const h = saltoG(t);
    wC.h += h; wL.h += h;
    if (h > 3) { const k = clamp(h / 40); wC.a = -0.35 * k; wL.a = -0.25 * k; }
    p.piernas.cerca = aPierna(G, p, wC, "cerca"); p.piernas.lejos = aPierna(G, p, wL, "lejos");
  }
  // marco: W = dónde va la pelvis (mundo), phi = giro, esx = escala horizontal (giro aplastado)
  function marcoG(t, p, esx) {
    const Pp = G.aPantalla(p, p.pelvis);
    if (t < T.despega) return { W: Pp, Pp, phi: 0, esx };
    const u = fase(t, T.despega, T.atrapa);
    const W1 = W_OVILLO(t);
    if (u < 1) {
      // parábola del salto: de donde estaba (de pie) a los brazos de Sara
      const W0 = P(Pp.x, Pp.y);
      const k = suave5(u) * 0.35 + u * 0.65;
      const x = lerp(W0.x, W1.x, k), y = lerp(W0.y, W1.y, k) - 150 * Math.sin(Math.PI * Math.pow(u, 0.85));
      const phi = PHI_OVILLO * suave(fase(u, 0.42, 0.98));
      return { W: P(x, y), Pp, phi, esx };
    }
    return { W: W1, Pp, phi: PHI_OVILLO + 0.03 * Math.sin(t * 1.9), esx };
  }
  const aMundoG = (p, scr) => { const M = p.marco; return P(M.W.x + rot(P((scr.x - M.Pp.x) * M.esx, scr.y - M.Pp.y), M.phi).x, M.W.y + rot(P((scr.x - M.Pp.x) * M.esx, scr.y - M.Pp.y), M.phi).y); };
  const mundoHojaG = (p, q) => aMundoG(p, G.aPantalla(p, q));
  const deMundoG = (p, w) => { const M = p.marco, q = rot(P(w.x - M.W.x, w.y - M.W.y), -M.phi); return P(M.Pp.x + q.x / Math.max(0.05, M.esx), M.Pp.y + q.y); };

  // piernas recogidas en el vuelo y en brazos (hoja de Guillermo)
  function piernasOvillo(p, t, kEnc, kCuelga) {
    const pc = p.piernas.cerca, pl = p.piernas.lejos;
    // en el vuelo: rodillas al pecho
    const ec = { tob: P(172 + 80, 712 + 160), ang: -0.3 }, el = { tob: P(328 + 60, 712 + 150), ang: -0.35 };
    // en brazos: muslos hacia delante y abajo (en pantalla, sobre el brazo de Sara) y las espinillas colgando (se balancean)
    const col = 16 * Math.sin(t * 2.6), col2 = 16 * Math.sin(t * 2.6 + 1.4);
    const oc = { tob: P(172 - 150 + col, 712 + 340), ang: 0.5 }, ol = { tob: P(328 - 165 + col2, 712 + 320), ang: 0.45 };
    const mz = (a, b, c) => ({ tob: mezcla(mezcla(a.tob, b.tob, kEnc), c.tob, kCuelga), ang: lerp(lerp(a.ang, b.ang, kEnc), c.ang, kCuelga) });
    p.piernas.cerca = mz(pc, ec, oc); p.piernas.lejos = mz(pl, el, ol);
  }

  function manosG(t, p) {
    const Tr = G.tronco(p);
    const hC = () => G.aPantalla(p, Tr(G.HOMBRO_C)), hL = () => G.aPantalla(p, Tr(G.HOMBRO));
    const bc = q => bolsillo(G, q, "cerca"), bl = q => bolsillo(G, q, "lejos");
    // respingo: manos arriba, abiertas
    const arribaC = q => { const h = hC(); return manoEn(G, q, "cerca", P(h.x - 44 * q.lado, h.y - 52), { dedos: PALMA, dobla: -1 }); };
    const arribaL = q => { const h = hL(); return manoEn(G, q, "lejos", P(h.x + 40 * q.lado, h.y - 56), { dedos: PALMA, dobla: 1 }); };
    // corre: braceo
    const braceaC = q => { const h = hC(), ph = Math.sin(t * 24); return manoEn(G, q, "cerca", P(h.x - 14 * ph * q.lado + 6 * q.lado, h.y + 50 + 12 * ph), { dedos: PUNO }); };
    const braceaL = q => { const h = hL(), ph = -Math.sin(t * 24); return manoEn(G, q, "lejos", P(h.x - 14 * ph * q.lado + 10 * q.lado, h.y + 48 + 12 * ph), { dedos: PUNO }); };
    // agarrado al borde de la cortina, a la altura de la boca
    const cortina = (q, dy) => { const b = G.aPantalla(q, G.boca(q)); return P(Math.max(b.x + 14, CORT_I.x1 + 8), b.y + dy); };
    const agarraC = q => manoEn(G, q, "cerca", cortina(q, 14), { dedos: D(0.2, 0.55, 0.5, 0.45), dobla: -1, max: 1.08 });
    const agarraL = q => manoEn(G, q, "lejos", cortina(q, -6), { dedos: D(0.2, 0.55, 0.5, 0.45), dobla: 1 });
    // coge la manta del respaldo del sillón (mira a la izquierda) y la tira por encima de la cabeza
    const cogeL = q => manoEn(G, q, "lejos", MANTA_ESQ, { dedos: D(0.3, 0.35, 0.3, 0.3), dobla: 1, max: 1.08 });
    const cogeC = q => { const h = hC(); return manoEn(G, q, "cerca", P(h.x + 30, h.y + 40), { dedos: PALMA }); };
    const tiraC = q => { const h = hC(); return manoEn(G, q, "cerca", P(h.x + 18 * q.lado, h.y - 62), { dedos: AGARRA, dobla: -1 }); };
    const tiraL = q => { const h = hL(); return manoEn(G, q, "lejos", P(h.x + 22 * q.lado, h.y - 64), { dedos: AGARRA, dobla: 1 }); };
    // fantasma: brazos hacia delante (los bultos de la manta)
    const fanC = q => { const h = hC(); return manoEn(G, q, "cerca", P(h.x + 52 * q.lado, h.y + 8), { dedos: RELAJ }); };
    const fanL = q => { const h = hL(); return manoEn(G, q, "lejos", P(h.x + 56 * q.lado, h.y + 2), { dedos: RELAJ }); };
    // sale de la cortina de un salto: brazos hacia delante y arriba
    const saleC = q => { const h = hC(); return manoEn(G, q, "cerca", P(h.x + 40 * q.lado, h.y - 34), { dedos: PALMA, dobla: -1 }); };
    const saleL = q => { const h = hL(); return manoEn(G, q, "lejos", P(h.x + 50 * q.lado, h.y - 44), { dedos: PALMA, dobla: 1 }); };
    // en brazos: se agarra a la camiseta de Sara con la mano cercana; la otra, sobre su propio pecho (hoja)
    const zarpaC = q => manoEn(G, q, "cerca", deMundoG(q, P(630, 320)), { dedos: D(0.25, 0.3, 0.3, 0.3), dobla: -1, max: 1.06 });
    const zarpaL = q => manoHoja(G, q, "lejos", G.tronco(q)(P(296, 505)), { dedos: D(0.45, 0.6, 0.6, 0.55), dobla: 1 });
    p.manoCerca = pista([
      [0, 0, bc], [T.rayo1 + 0.04, T.rayo1 + 0.14, arribaC, salida], [T.corre1, T.corre1 + 0.1, braceaC], [T.esconde - 0.16, T.esconde + 0.02, agarraC],
      [T.salta2, T.salta2 + 0.1, saleC, salida], [T.cae2 - 0.06, T.gira0 + 0.06, braceaC], [T.llega2 - 0.06, T.coge, cogeC], [T.tira0, T.tira0 + 0.14, tiraC],
      [T.tapa, T.tapa + 0.16, fanC], [T.despega, T.despega + 0.14, saleC, salida], [T.despega + 0.2, T.atrapa - 0.06, zarpaC]
    ], t, p);
    p.manoLejos = pista([
      [0, 0, bl], [T.rayo1 + 0.04, T.rayo1 + 0.14, arribaL, salida], [T.corre1, T.corre1 + 0.1, braceaL], [T.esconde - 0.16, T.esconde + 0.02, agarraL],
      [T.salta2, T.salta2 + 0.1, saleL, salida], [T.cae2 - 0.06, T.gira0 + 0.06, braceaL], [T.llega2 - 0.1, T.coge, cogeL], [T.tira0, T.tira0 + 0.14, tiraL],
      [T.tapa, T.tapa + 0.16, fanL], [T.despega, T.despega + 0.14, saleL, salida], [T.despega + 0.2, T.atrapa - 0.06, zarpaL]
    ], t, p);
    // en el vuelo recoge las piernas; en brazos las deja colgando
    const kCuelga = tramo(t, T.atrapa - 0.12, T.atrapa + 0.12);
    const kEnc = tramo(t, T.despega + 0.03, T.despega + 0.2) * (1 - kCuelga);
    if (kEnc + kCuelga > 0) piernasOvillo(p, t, kEnc, kCuelga);
  }

  /* =====================================================================================
   * SARA (a la derecha, mira a la izquierda: a la ventana)
   * ===================================================================================== */
  const CS = {
    fuera: E({ mx: 0.8, my: -0.18, c: 0.12, sd: 4, si: 4, abre: 0, ancho: 0.9, sonr: 0.35 }),
    pestillo: E({ mx: 0.7, my: 0.1, c: 0.2, sd: 2, si: 2, abre: 0, ancho: 0.85, sonr: 0.25 }),
    viento: E({ mx: 0.7, my: -0.2, c: 1, h: 0.6, sd: 10, si: 10, abre: 0, ancho: 1, sonr: 0.85 }),
    ooh: E({ mx: 0.8, my: -0.35, iris: 1.15, sd: 18, si: 18, abre: 13, ancho: 0.5, sonr: 0.35 }),
    sonrie: E({ mx: 0.75, my: -0.3, c: 0.2, h: 0.45, sd: 10, si: 10, abre: 4, ancho: 1, sonr: 0.95 }),
    miraG: E({ mx: 0.75, my: 0.12, c: 0.42, sd: -2, si: 18, gi: 0.2, abre: 0, ancho: 0.8, sonr: 0.0 }),
    sonrisilla: E({ mx: 0.6, my: 0.3, c: 0.45, sd: 0, si: 10, gi: 0.1, abre: 0, ancho: 0.85, sonr: 0.35 }),
    coge: E({ mx: 0.8, my: -0.3, c: 0.15, sd: 6, si: 6, abre: 0, ancho: 0.85, sonr: 0.45 }),
    camara: E({ mx: -0.88, my: 0.02, c: 0.4, sd: 0, si: 4, abre: 0, ancho: 0.8, sonr: 0.12 }),
    smirk: E({ mx: -0.88, my: 0.02, c: 0.42, sd: 0, si: 12, gi: 0.12, abre: 0, ancho: 0.9, sonr: 0.42 })
  };
  const GUION_CS = [
    [T.latch0, T.latch0 + 0.2, "pestillo"], [T.racha, T.racha + 0.3, "viento"], [T.rayo1 + 0.02, T.rayo1 + 0.12, "ooh"],
    [T.rayo1 + 0.7, T.rayo1 + 0.95, "sonrie"], [T.sMira0, T.sMira0 + 0.2, "miraG"], [T.sMira1, T.sMira1 + 0.25, "sonrie"],
    [T.rayo2 + 0.02, T.rayo2 + 0.12, "ooh"], [T.rayo2 + 0.6, T.rayo2 + 0.85, "viento"], [T.sMiraF0, T.sMiraF0 + 0.2, "miraG"],
    [T.sonrisilla, T.sonrisilla + 0.2, "sonrisilla"], [T.sMiraF1, T.sMiraF1 + 0.2, "sonrie"], [T.rayo3 + 0.02, T.rayo3 + 0.12, "ooh"],
    [T.atrapa - 0.1, T.atrapa + 0.2, "coge"], [T.acaricia1, T.acaricia1 + 0.3, "viento"], [T.rayo4, T.rayo4 + 0.12, "ooh"],
    [T.rayo4 + 0.45, T.rayo4 + 0.6, "coge"], [T.sCamara, T.sCamara + 0.2, "camara"], [T.smirk, T.smirk + 0.2, "smirk"]
  ];
  const PARP_S = [0.4, 2.1, 4.75, 5.95, 7.6, 9.6, 10.9, 13.0, 13.85];
  const CUER_S = {
    base: CU({ pel: 2, torso: 0.02, cab: 0.0 }),
    alcanza: CU({ pel: 4, torso: 0.1, cab: 0.04 }),
    empuja: CU({ pel: 6, torso: 0.16, cab: 0.02 }),
    viento: CU({ pel: 2, torso: -0.07, cab: -0.14, cdy: -2 }),
    ooh: CU({ pel: 0, torso: -0.03, cab: -0.18 }),
    apoya: CU({ pel: 4, torso: 0.07, cab: -0.04 }),
    mira: CU({ pel: 4, torso: 0.06, cab: 0.1, cdy: 4 }),
    coge: CU({ pel: 30, torso: 0.2, cab: 0.04, cdy: 6 }),
    lleva: CU({ pel: 14, torso: 0.14, cab: -0.08, cdy: 2 }),
    camara: CU({ pel: 14, torso: 0.12, cab: 0.0, cdy: 2 })
  };
  const GUION_CUS = [
    [T.latch0, T.latch1, "alcanza"], [T.empuja0, T.empuja1, "empuja"], [T.racha, T.racha + 0.35, "viento"],
    [T.rayo1 + 0.02, T.rayo1 + 0.15, "ooh"], [T.rayo1 + 0.7, T.rayo1 + 1.0, "apoya"], [T.sMira0, T.sMira0 + 0.25, "mira"],
    [T.sMira1, T.sMira1 + 0.3, "apoya"], [T.rayo2 + 0.02, T.rayo2 + 0.15, "ooh"], [T.llega2, T.llega2 + 0.3, "apoya"],
    [T.sMiraF0, T.sMiraF0 + 0.25, "mira"], [T.sMiraF1, T.sMiraF1 + 0.25, "apoya"], [T.sBrazos0, T.sBrazos1, "lleva"],
    [T.atrapa - 0.02, T.atrapa + 0.12, "coge", salida], [T.atrapa + 0.2, T.atrapa + 0.7, "lleva"], [T.sCamara, T.sCamara + 0.3, "camara"]
  ];
  const XS = 690;
  function poseS(t) {
    const b = guion(GUION_CUS, CUER_S, "base", t);
    const respira = Math.sin(t * 2.1 + 0.8);
    const p = { x: XS, suelo: SUELO0, s: S0, espejo: true, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: S.PELVIS.x, y: S.PELVIS.y + b.pel + respira * 1.1 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } },
      pelo: { viento: 0, inercia: 0 } };
    // el viento le echa la melena hacia atrás (mira al viento)
    const v = viento(t);
    p.pelo.viento = -v * (2.1 + 0.6 * ruido(t * 3.1 + 5) + 0.3 * Math.sin(t * 9.7) + 0.18 * Math.sin(t * 15.3));
    p.pelo.inercia = -0.5 * campana(t, T.atrapa - 0.05, T.atrapa + 0.4);
    // ooh / ríe: la cabeza
    p.cabeza.ang += 0.03 * Math.sin(t * 13) * campana(t, T.rayo2 + 0.15, T.rayo2 + 0.6);
    // pies quietos (un pasito para coger el pestillo)
    const paso = tramo(t, T.latch0, T.latch0 + 0.25) * (1 - tramo(t, T.brazos0, T.brazos0 + 0.3));
    const wL = { x: XS - 28 - 10 * paso, h: 6 * campana(t, T.latch0, T.latch0 + 0.25) + 6 * campana(t, T.brazos0, T.brazos0 + 0.3), a: 0 };
    const wC = { x: XS + 16, h: 0, a: 0 };
    p.piernas.lejos = aPierna(S, p, wL, "lejos"); p.piernas.cerca = aPierna(S, p, wC, "cerca");
    const e = guion(GUION_CS, CS, "fuera", t);
    p.cara = cara(e, parpadeo(t, PARP_S));
    return p;
  }
  function manosS(t, p, pg) {
    const Tr = S.tronco(p);
    const hC = () => S.aPantalla(p, Tr(S.HOMBRO_C)), hL = () => S.aPantalla(p, Tr(S.HOMBRO));
    const bc = q => bolsillo(S, q, "cerca"), bl = q => bolsillo(S, q, "lejos");
    // el pestillo: lo gira (la muñeca) y empuja la hoja
    const pestillo = q => manoEn(S, q, "lejos", P(PESTILLO.x + 6, PESTILLO.y + 4), { dedos: AGARRA, dobla: 1, dmu: 0.25 * tramo(t, T.latch1, T.gira) });
    const empuja = q => manoEn(S, q, "lejos", P(PESTILLO.x - 12, PESTILLO.y - 6), { dedos: PALMA, dobla: 1, dmu: 0.4 });
    // al viento: brazos un poco abiertos, palmas al aire
    const abreL = q => { const h = hL(); return manoEn(S, q, "lejos", P(h.x - 38, h.y + 50 + 4 * Math.sin(t * 3)), { dedos: PALMA, dobla: 1, dmu: 0.6 }); };
    const abreC = q => { const h = hC(); return manoEn(S, q, "cerca", P(h.x + 34, h.y + 54 + 4 * Math.sin(t * 3 + 1)), { dedos: PALMA, dobla: -1, dmu: -0.5 }); };
    // ¡ooh!: manos juntas bajo la barbilla
    const juntaL = q => { const b = S.aPantalla(q, S.boca(q)); return manoEn(S, q, "lejos", P(b.x + 4, b.y + 40), { dedos: D(0.6, 0.9, 0.9, 0.85), dobla: 1 }); };
    const juntaC = q => { const b = S.aPantalla(q, S.boca(q)); return manoEn(S, q, "cerca", P(b.x + 14, b.y + 44), { dedos: D(0.6, 0.9, 0.9, 0.85), dobla: -1 }); };
    // apoyada en el alféizar
    const apoya = q => manoEn(S, q, "lejos", P(ALFEIZAR.x, ALFEIZAR.y - 6), { dedos: D(0.6, 0.85, 0.85, 0.8), dobla: 1, dmu: 0.2 });
    // coge a Guillermo: la mano lejana bajo la espalda, la cercana bajo los muslos
    const espalda = q => manoEn(S, q, "lejos", pg.apoyoEspalda, { dedos: D(0.5, 0.6, 0.6, 0.55), dobla: 1, max: 1.08 });
    const muslos = q => manoEn(S, q, "cerca", pg.apoyoMuslos, { dedos: D(0.5, 0.6, 0.6, 0.55), dobla: -1, max: 1.08 });
    const listaL = q => { const h = hL(); return manoEn(S, q, "lejos", P(h.x - 60, h.y + 48), { dedos: PALMA, dobla: 1 }); };
    const listaC = q => { const h = hC(); return manoEn(S, q, "cerca", P(h.x - 48, h.y + 70), { dedos: PALMA, dobla: -1 }); };
    // como a un gato: le rasca debajo de la barbilla (dedos que se mueven)
    const rasca = q => {
      const r = 3 * Math.sin(t * 17), dd = 0.72 + 0.28 * Math.sin(t * 17), dm = 0.72 + 0.28 * Math.sin(t * 17 + 1.2);
      return manoEn(S, q, "lejos", P(pg.barbilla.x + 4 + r, pg.barbilla.y + 4 + 0.6 * r), { dedos: D(0.8, dd, dm, 0.55), dobla: 1, max: 1.08 });
    };
    p.manoLejos = pista([
      [0, 0, bl], [T.latch0, T.latch1, pestillo], [T.empuja0, T.abre, empuja], [T.empuja1, T.brazos0, abreL], [T.rayo1 + 0.03, T.rayo1 + 0.2, juntaL],
      [T.rayo1 + 0.8, T.rayo1 + 1.1, apoya], [T.rayo2 + 0.03, T.rayo2 + 0.2, juntaL], [T.llega2, T.llega2 + 0.3, apoya],
      [T.sBrazos0, T.sBrazos1 - 0.12, listaL], [T.sBrazos1 - 0.1, T.atrapa, espalda], [T.acaricia0, T.acaricia0 + 0.22, rasca], [T.acaricia1 - 0.12, T.acaricia1 + 0.14, espalda]
    ], t, p);
    p.manoCerca = pista([
      [0, 0, bc], [T.brazos0 - 0.3, T.brazos0, abreC], [T.rayo1 + 0.03, T.rayo1 + 0.2, juntaC], [T.rayo1 + 0.8, T.rayo1 + 1.1, bc],
      [T.rayo2 + 0.03, T.rayo2 + 0.2, juntaC], [T.llega2, T.llega2 + 0.3, bc],
      [T.sBrazos0, T.sBrazos1 - 0.12, listaC], [T.sBrazos1 - 0.1, T.atrapa, muslos]
    ], t, p);
  }

  /* ---------- puntos de apoyo de Guillermo (mundo) para las manos de Sara ---------- */
  const AP = { ex: 112, ey: 520, mx: 30, my: 200 };
  function apoyos(pg) {
    const Tr = G.tronco(pg);
    // en la hoja de Guillermo (mira a la derecha): la espalda es el lado izquierdo del torso
    pg.apoyoEspalda = mundoHojaG(pg, Tr(P(AP.ex, AP.ey)));
    pg.apoyoMuslos = mundoHojaG(pg, P(G.PELVIS.x + AP.mx, G.PELVIS.y + AP.my));
    // debajo de la barbilla (para rascarle como a un gato)
    pg.barbilla = mundoHojaG(pg, mezcla(G.boca(pg), Tr(P(260, 256)), 0.55));
  }

  function pose(t) {
    const pg = poseG(t), ps = poseS(t);
    apoyos(pg);
    manosS(t, ps, pg);
    return { g: pg, s: ps };
  }

  /* =====================================================================================
   * LA MANTA: echada en el sillón → agarrada → volando → fantasma → vacía → montón en el suelo
   * Todas las formas tienen N puntos en el mismo orden (desde el bajo izquierdo, en el sentido de las agujas).
   * ===================================================================================== */
  const N = 44;
  const MANTA_ESQ = P(234, 372);
  // forma echada en el respaldo y el brazo del sillón
  function formaSillon() {
    const pts = [];
    const bl = P(150, 470), tl = P(150, 356), tr = P(232, 358), br = P(246, 476);
    const lado = (a, b, n, bomba) => { for (let i = 0; i < n; i++) { const k = i / n; pts.push(P(lerp(a.x, b.x, k) + bomba * Math.sin(Math.PI * k), lerp(a.y, b.y, k))); } };
    lado(bl, tl, 11, -4); lado(tl, tr, 11, 0); lado(tr, br, 11, 6);
    for (let i = 0; i < 11; i++) { const k = i / 11; pts.push(P(lerp(br.x, bl.x, k), lerp(br.y, bl.y, k) + 5 * Math.sin(k * Math.PI * 4))); }
    return pts;
  }
  const FORMA_SILLON = formaSillon();
  // fantasma: sigue a la cabeza y al cuerpo de Guillermo (mundo); brazos hacia delante (lado)
  function formaFantasma(pg, t, temb) {
    const H = G.cabeza(pg), c0 = mundoHojaG(pg, G.centroCabeza(pg)), lado = pg.ladoC ?? pg.lado;
    const rx = 66, ry = 74, cx = c0.x - 3 * lado, cy = c0.y - 6, hemY = SUELO0 - 32;
    const manos = [mundoHojaG(pg, pg.manoCerca), mundoHojaG(pg, pg.manoLejos)];
    const ola = i => 3 * Math.sin(t * 9 + i * 1.3) * (0.4 + temb);
    // un costado (s = −1 izquierdo, +1 derecho), de abajo arriba; los brazos hacen bulto donde estén las manos
    const costado = s => {
      const o = [];
      for (let i = 0; i <= 10; i++) {
        const k = i / 10, y = lerp(hemY, cy, k), base = lerp(88, rx, Math.pow(k, 0.8));
        let bulto = 0;
        for (const m of manos) if ((m.x - cx) * s > 0) bulto = Math.max(bulto, (Math.abs(m.x - cx) + 17 - base) * Math.exp(-Math.pow((y - m.y) / 30, 2)));
        o.push(P(cx + s * (base + bulto) + ola(i + (s > 0 ? 3 : 0)), y));
      }
      return o;
    };
    const izq = costado(-1), der = costado(1), pts = izq.slice();
    // la cabeza: media vuelta por arriba con los bultitos de los pinchos
    for (let i = 1; i < 11; i++) {
      const a = Math.PI + Math.PI * i / 11, u = i / 11;
      const pin = 1 + 0.07 * Math.max(0, Math.sin(u * Math.PI * 5 - 0.6)) * campana(u, 0.15, 0.75);
      pts.push(P(cx + Math.cos(a) * rx * pin, cy + Math.sin(a) * ry * pin));
    }
    for (let i = 10; i >= 0; i--) pts.push(der[i]);
    // el bajo, ondulado (de derecha a izquierda)
    const quedan = N - pts.length, xd = der[0].x, xi = izq[0].x;
    for (let i = 1; i <= quedan; i++) { const k = i / (quedan + 1); pts.push(P(lerp(xd, xi, k), hemY + 5 * Math.sin(k * Math.PI * 5 + t * 4) * (0.5 + temb))); }
    // agujeros de los ojos: donde están sus ojos de verdad
    const ojos = [mundoHojaG(pg, H.a(P(772, 566))), mundoHojaG(pg, H.a(P(894, 618)))];
    return { pts, cab: P(cx, cy), r: rx, ojos };
  }
  // montón en el suelo (misma estructura de puntos que el fantasma)
  function formaMonton(x) {
    const pts = [], S1 = SUELO0 - 3;
    for (let i = 0; i <= 10; i++) { const k = i / 10; pts.push(P(x - 98 + 14 * k * k, lerp(S1, S1 - 22, Math.sin(k * Math.PI / 2)))); }
    for (let i = 1; i < 11; i++) { const u = i / 11; pts.push(P(lerp(x - 82, x + 84, u), S1 - 24 - 14 * Math.sin(u * Math.PI) - 7 * Math.sin(u * 17) * Math.sin(u * Math.PI))); }
    for (let i = 10; i >= 0; i--) { const k = i / 10; pts.push(P(x + 100 - 14 * k * k, lerp(S1, S1 - 20, Math.sin(k * Math.PI / 2)))); }
    const quedan = N - pts.length;
    for (let i = 1; i <= quedan; i++) { const k = i / (quedan + 1); pts.push(P(lerp(x + 100, x - 98, k), S1 + 2 * Math.sin(k * 9))); }
    return pts;
  }
  // forma volando (agarrada por las dos manos sobre la cabeza)
  function formaVuelo(pg, t) {
    const a = mundoHojaG(pg, pg.manoCerca), b = mundoHojaG(pg, pg.manoLejos);
    const c = mezcla(a, b, 0.5);
    const pts = [];
    for (let i = 0; i < N; i++) {
      const k = i / N, ang = Math.PI * 0.5 + TAU * k;
      const rx = 96, ry = 54;
      pts.push(P(c.x + Math.cos(ang) * rx * (1 + 0.08 * Math.sin(t * 20 + i)), c.y - 34 + Math.sin(ang) * ry + 10 * Math.sin(t * 14 + i * 0.7)));
    }
    return pts;
  }
  const lerpForma = (A, B, k) => A.map((q, i) => mezcla(q, B[i], k));
  // reordena para que la primera sea la de abajo a la izquierda (igual que el resto)
  function empiezaAbajoIzq(pts) {
    let mejor = 0, v = Infinity;
    pts.forEach((q, i) => { const s = q.x - q.y * 1.2; if (s < v) { v = s; mejor = i; } });
    return pts.slice(mejor).concat(pts.slice(0, mejor));
  }
  // estado de la manta en t: { pts, ojos, alfaOjos }
  function manta(t, pg) {
    const temb = clamp(dentro(t, T.tapa, T.tapa + 0.2, T.despega, T.despega + 0.01) * (1 + tramo(t, T.saltitos1, T.rayo3)));
    if (t < T.coge) return { pts: FORMA_SILLON, ojos: 0 };
    if (t < T.tapa) {
      const v = empiezaAbajoIzq(formaVuelo(pg, t));
      if (t < T.tira0 + 0.02) return { pts: lerpForma(FORMA_SILLON, estiraHacia(FORMA_SILLON, mundoHojaG(pg, pg.manoLejos), fase(t, T.coge, T.tira0 + 0.02)), 1), ojos: 0 };
      const k = suave(fase(t, T.tira0, T.tira0 + 0.16));
      const base = estiraHacia(FORMA_SILLON, mundoHojaG(pg, pg.manoLejos), 1);
      const u = fase(t, T.tira0 + 0.16, T.tapa);
      if (u <= 0) return { pts: lerpForma(base, v, k), ojos: 0 };
      const F = formaFantasma(pg, t, 0);
      return { pts: lerpForma(v, F.pts, suave(u)), ojos: 0, ojosK: suave(fase(u, 0.4, 1)), F };
    }
    if (t < T.despega) { const F = formaFantasma(pg, t, temb); return { pts: F.pts, ojos: 1, F }; }
    // vacía: al saltar Guillermo sube un poco con él, se queda flotando y cae al suelo arrugándose
    const pd = pgDespega(), F0 = formaFantasma(pd, t, 0.6), t1 = T.despega + 0.1;
    const dW = t < t1 ? resta(pg.marco.W, pd.marco.W) : resta(pgSuelta().marco.W, pd.marco.W);
    // sale disparada hacia arriba (Guillermo se escurre por debajo, hacia Sara), se queda colgando y cae revoloteando
    const s1 = salida(fase(t, T.despega + 0.02, T.despega + 0.42));
    const off = P(dW.x * 0.45 - 14 * s1, dW.y * 0.8 - 62 * s1);
    const k = suave(fase(t, T.despega + 0.44, T.despega + 0.92));
    const vaiven = 14 * Math.sin(Math.PI * k * 2) * (1 - k);
    const flota = F0.pts.map(q => P(q.x + off.x + vaiven + 7 * Math.sin(t * 7 + q.y * 0.05) * (1 - k), q.y + off.y));
    const mon = formaMonton(F0.cab.x + off.x);
    // al caer, la tela se queda atrás arriba (el bajo cae antes que la cabeza)
    const cae = flota.map((q, i) => { const r = mezcla(q, mon[i], Math.pow(k, 0.8 + 0.6 * clamp((560 - q.y) / 420))); return r; });
    const ojos = F0.ojos.map(q => P(q.x + off.x, q.y + off.y + k * 140));
    return { pts: cae, ojos: 1 - tramo(t, T.despega + 0.3, T.despega + 0.5), F: { cab: P(F0.cab.x + off.x, F0.cab.y + off.y), r: F0.r, ojos }, vacia: true, aplasta: k };
  }
  let PG_D = null, PG_S = null;
  const pgDespega = () => PG_D || (PG_D = poseG(T.despega - 0.004));
  const pgSuelta = () => PG_S || (PG_S = poseG(T.despega + 0.1));
  // la esquina agarrada tira de la forma echada hacia la mano
  function estiraHacia(F, mano, k) {
    const esq = 22;        // índice de la esquina de arriba a la derecha
    return F.map((q, i) => { const d = Math.abs(i - esq), w = Math.max(0, 1 - d / 14); return P(q.x + (mano.x - F[esq].x) * w * k, q.y + (mano.y - F[esq].y) * w * k); });
  }

  /* =====================================================================================
   * DIBUJO DE LA MANTA
   * ===================================================================================== */
  const MANTA_COL = { base: "#efe6d2", sombra: "#d3c4a6", raya: "#8e78b8", raya2: "#c96f5a" };
  function dibManta(g, t, M) {
    const pts = M.pts;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.beginPath(); M2.curva(g, pts, true, 0.5);
    g.fillStyle = MANTA_COL.base; g.fill();
    g.save(); g.clip();
    // sombreado: más oscuro abajo y en un costado
    let minY = Infinity, maxY = -Infinity, minX = Infinity, maxX = -Infinity;
    for (const q of pts) { minY = Math.min(minY, q.y); maxY = Math.max(maxY, q.y); minX = Math.min(minX, q.x); maxX = Math.max(maxX, q.x); }
    const gr = g.createLinearGradient(minX, 0, maxX, 0); gr.addColorStop(0, "rgba(120,100,130,0.28)"); gr.addColorStop(0.45, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(150,170,220,0.18)");
    g.fillStyle = gr; g.fillRect(minX - 5, minY - 5, maxX - minX + 10, maxY - minY + 10);
    // cuadros: rayas lilas y teja
    g.globalAlpha = 0.55;
    const paso = 26;
    for (let x = Math.floor(minX / paso) * paso; x < maxX + paso; x += paso) { g.fillStyle = (x / paso) % 2 ? MANTA_COL.raya : MANTA_COL.raya2; g.fillRect(x, minY - 5, 4, maxY - minY + 10); }
    for (let y = Math.floor(minY / paso) * paso + 8; y < maxY + paso; y += paso) { g.fillStyle = MANTA_COL.raya; g.fillRect(minX - 5, y, maxX - minX + 10, 3); }
    g.globalAlpha = 1;
    // pliegues
    g.strokeStyle = "rgba(110,90,110,0.35)"; g.lineWidth = 2;
    for (let i = 0; i < 4; i++) { const x = lerp(minX, maxX, 0.2 + i * 0.2) + 4 * Math.sin(t * 3 + i); g.beginPath(); g.moveTo(x, minY + (maxY - minY) * 0.3); g.quadraticCurveTo(x + 6, minY + (maxY - minY) * 0.65, x - 2, maxY); g.stroke(); }
    g.restore();
    g.beginPath(); M2.curva(g, pts, true, 0.5); g.strokeStyle = TINTA; g.lineWidth = 3.2; g.stroke();
    // flecos en el bajo
    if (!M.aplasta || M.aplasta < 0.9) {
      g.strokeStyle = "#a99572"; g.lineWidth = 1.6;
      const n = pts.length, ini = n - 12;
      for (let i = ini; i < n; i++) { const q = pts[i]; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q.x + 1.5 * Math.sin(t * 9 + i), q.y + 7); g.stroke(); }
    }
    // agujeros de los ojos
    const ok = M.ojos ?? 0, ojosK = M.ojosK ?? ok;
    if (ojosK > 0.01 && M.F && M.F.ojos) {
      for (const o of M.F.ojos) {
        const ex = o.x, ey = o.y;
        g.save(); g.globalAlpha = ojosK;
        g.fillStyle = "#14101a"; g.beginPath(); g.ellipse(ex, ey, 11, 14, 0, 0, TAU); g.fill();
        g.strokeStyle = "rgba(110,90,110,0.6)"; g.lineWidth = 1.5; g.stroke();
        if (!M.vacia) {
          // los ojos de Guillermo dentro
          const parp = M.parp || 0, mx = M.mx || 0;
          g.fillStyle = "#fbf8f5"; g.beginPath(); g.ellipse(ex, ey + 1, 7.5, 9 * (1 - parp * 0.9), 0, 0, TAU); g.fill();
          if (parp < 0.6) { g.fillStyle = "#2a160c"; g.beginPath(); g.arc(ex + 3.2 * mx, ey + 1 + (M.my || 0) * 3, 3.6 * (M.iris || 1), 0, TAU); g.fill();
            g.fillStyle = "#fff"; g.beginPath(); g.arc(ex + 3.2 * mx + 1.2, ey - 0.6 + (M.my || 0) * 3, 1.2, 0, TAU); g.fill(); }
        }
        g.restore();
      }
    }
    g.restore();
  }

  /* =====================================================================================
   * CORTINAS: terciopelo mostaza con pliegues; el viento las hincha; la izquierda tapa a Guillermo
   * ===================================================================================== */
  function dibCortina(g, t, C, lado, esconde) {
    // lado: −1 cortina izquierda, +1 derecha; el vuelo empuja el bajo hacia la habitación (hacia fuera de la ventana)
    const v = viento(t), n = 26, y0 = BARRA_Y + 6, y1 = CORT_BAJO;
    const izq = [], der = [];
    for (let i = 0; i <= n; i++) {
      const k = i / n, y = lerp(y0, y1, k);
      const vuela = v * (14 + 34 * k * k) * (0.7 + 0.3 * ruido(t * 1.3 + lado * 7 + k * 2)) + 6 * k * Math.sin(t * 2.2 + lado);
      let xl = C.x0 + 8 * (1 - k) * (1 - k) - lado * vuela * 0.25 + (lado < 0 ? -vuela * 0.7 : vuela * 0.35);
      let xr = C.x1 - 8 * (1 - k) * (1 - k) + (lado < 0 ? -vuela * 0.35 : vuela * 0.7);
      // Guillermo escondido: la cortina se pega a su cuerpo y el borde se aparta para que asomen los ojos
      if (esconde && esconde.k > 0) {
        const e = esconde, kk = e.k;
        xr = lerp(xr, e.borde(y), kk);
        xl = xl - 10 * kk * campana(y, e.y0, e.y1);
      }
      izq.push(P(xl, y)); der.push(P(xr, y));
    }
    const contorno = izq.concat(der.slice().reverse());
    g.save(); g.lineJoin = "round";
    g.beginPath(); g.moveTo(contorno[0].x, contorno[0].y); for (const q of contorno) g.lineTo(q.x, q.y); g.closePath();
    const gr = g.createLinearGradient(C.x0, 0, C.x1, 0);
    gr.addColorStop(0, "#9a6a1c"); gr.addColorStop(0.3, "#d4a03c"); gr.addColorStop(0.55, "#b6832a"); gr.addColorStop(0.8, "#d9a947"); gr.addColorStop(1, "#8f5f18");
    g.fillStyle = gr; g.fill();
    g.save(); g.clip();
    // pliegues verticales (siguen el ancho)
    for (let f = 1; f < 5; f++) {
      const kf = f / 5;
      g.beginPath();
      for (let i = 0; i <= n; i++) { const q = mezcla(izq[i], der[i], kf); if (i) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); }
      g.strokeStyle = f % 2 ? "rgba(90,52,8,0.42)" : "rgba(255,220,140,0.28)"; g.lineWidth = f % 2 ? 7 : 4; g.stroke();
    }
    // abultado del cuerpo de Guillermo
    if (esconde && esconde.k > 0) {
      g.fillStyle = `rgba(80,45,5,${0.22 * esconde.k})`;
      g.beginPath(); g.ellipse(esconde.cuerpo.x - 18, esconde.cuerpo.y, 34, 120, 0, 0, TAU); g.fill();
      g.fillStyle = `rgba(255,225,150,${0.18 * esconde.k})`;
      g.beginPath(); g.ellipse(esconde.cuerpo.x + 8, esconde.cuerpo.y - 20, 14, 90, 0, 0, TAU); g.fill();
    }
    // luz fría de la ventana en el canto interior
    const xb = lado < 0 ? der : izq;
    g.strokeStyle = `rgba(170,190,255,${0.12 + 0.5 * destello(t)})`; g.lineWidth = 10;
    g.beginPath(); xb.forEach((q, i) => i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); g.stroke();
    // bajo más oscuro
    g.fillStyle = "rgba(70,40,5,0.35)"; g.fillRect(C.x0 - 80, y1 - 16, C.x1 - C.x0 + 160, 20);
    g.restore();
    g.beginPath(); g.moveTo(contorno[0].x, contorno[0].y); for (const q of contorno) g.lineTo(q.x, q.y); g.closePath();
    g.strokeStyle = TINTA; g.lineWidth = 3; g.stroke();
    // fruncido arriba (anillas)
    g.fillStyle = "#3a2a18";
    for (let i = 0; i < 6; i++) { const x = lerp(C.x0 + 6, C.x1 - 6, i / 5); g.beginPath(); g.ellipse(x, BARRA_Y + 2, 5, 7, 0, 0, TAU); g.fill(); }
    g.restore();
  }
  // la cortina se pega a Guillermo escondido
  function escondite(t, pg) {
    const k = dentro(t, T.esconde - 0.14, T.esconde + 0.04, T.salta2 + 0.05, T.salta2 + 0.2);
    if (k <= 0) return null;
    const c = G.aPantalla(pg, G.centroCabeza(pg));       // centro de la cabeza
    const boca = G.aPantalla(pg, G.boca(pg));
    const mano = G.aPantalla(pg, pg.manoCerca);
    const top = c.y - 95, ojos = c.y - 6;
    const xRev = c.x - 26;           // hasta aquí se aparta el borde (asoman ojos y pinchos)
    const borde = y => {
      if (y < top - 40) return CORT_I.x1 + 2;
      if (y < top) return lerp(CORT_I.x1 + 2, xRev, suave(fase(y, top - 40, top)));
      if (y < ojos + 18) return xRev;
      if (y < mano.y) return lerp(xRev, mano.x - 2, suave(fase(y, ojos + 18, mano.y)));
      if (y < mano.y + 60) return lerp(mano.x - 2, CORT_I.x1 + 22, suave(fase(y, mano.y, mano.y + 60)));
      return CORT_I.x1 + 22 + 4 * Math.sin(y * 0.05);
    };
    return { k, borde, y0: top, y1: CORT_BAJO, cuerpo: P(pg.x + 6, SUELO0 - 200), boca };
  }

  /* =====================================================================================
   * DECORADO: la buhardilla (fondo cacheado) y la ventana (cielo y hojas, por fotograma)
   * ===================================================================================== */
  let fondo = null;
  const FX = -80, FY = -60;
  function creaFondo() {
    const c = lienzo(W + 160, H + 120);
    const g = c.getContext("2d"); g.translate(-FX, -FY); g.lineJoin = "round"; g.lineCap = "round";
    // pared añil con papel pintado de florecitas
    let gr = g.createLinearGradient(0, -60, 0, 480);
    gr.addColorStop(0, "#1c2240"); gr.addColorStop(1, "#2c3560");
    g.fillStyle = gr; g.fillRect(-80, -60, W + 160, 560);
    g.fillStyle = "rgba(170,180,230,0.07)";
    for (let y = -40; y < 470; y += 34) for (let x = -80 + ((y / 34) % 2) * 22; x < W + 80; x += 44) {
      g.beginPath(); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; g.ellipse(x + Math.cos(a) * 4, y + Math.sin(a) * 4, 3, 3, 0, 0, TAU); } g.fill();
    }
    // techo abuhardillado con vigas
    g.fillStyle = "#3a2a25";
    g.beginPath(); g.moveTo(-80, 210); g.lineTo(330, -60); g.lineTo(-80, -60); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(W + 80, 210); g.lineTo(W - 330, -60); g.lineTo(W + 80, -60); g.closePath(); g.fill();
    g.strokeStyle = "#2a1d19"; g.lineWidth = 3;
    for (let i = 1; i < 7; i++) { const k = i / 7; g.beginPath(); g.moveTo(lerp(-80, 330, k), lerp(210, -60, k)); g.lineTo(-80, lerp(210, -60, k) - 20); g.stroke();
      g.beginPath(); g.moveTo(lerp(W + 80, W - 330, k), lerp(210, -60, k)); g.lineTo(W + 80, lerp(210, -60, k) - 20); g.stroke(); }
    g.fillStyle = "#5b4033";
    for (const s of [-1, 1]) {
      g.beginPath();
      if (s < 0) { g.moveTo(-80, 236); g.lineTo(346, -60); g.lineTo(330, -60); g.lineTo(-80, 210); }
      else { g.moveTo(W + 80, 236); g.lineTo(W - 346, -60); g.lineTo(W - 330, -60); g.lineTo(W + 80, 210); }
      g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.stroke();
    }
    // zócalo y suelo de tablones
    gr = g.createLinearGradient(0, 470, 0, H + 60);
    gr.addColorStop(0, "#5a3d2b"); gr.addColorStop(1, "#7a5338");
    g.fillStyle = gr; g.fillRect(-80, 470, W + 160, H + 120);
    g.strokeStyle = "rgba(30,15,8,0.45)"; g.lineWidth = 2;
    for (let i = 0; i < 9; i++) { const y = 470 + 22 * i + i * i * 3; g.beginPath(); g.moveTo(-80, y); g.lineTo(W + 80, y); g.stroke(); }
    for (let i = -12; i < 22; i++) { const x0 = 512 + i * 70; g.beginPath(); g.moveTo(512 + (x0 - 512) * 0.55, 470); g.lineTo(512 + (x0 - 512) * 1.35, H + 60); g.stroke(); }
    g.fillStyle = "#e8dfcd"; g.fillRect(-80, 452, W + 160, 18);
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-80, 452); g.lineTo(W + 80, 452); g.moveTo(-80, 470); g.lineTo(W + 80, 470); g.stroke();
    // alfombra redonda
    g.save(); g.translate(520, 566); g.scale(1, 0.17);
    g.fillStyle = "#7b3f4c"; g.beginPath(); g.arc(0, 0, 330, 0, TAU); g.fill();
    g.strokeStyle = "#d9b26a"; g.lineWidth = 16; g.beginPath(); g.arc(0, 0, 290, 0, TAU); g.stroke();
    g.strokeStyle = "#e9d6b0"; g.lineWidth = 8; g.beginPath(); g.arc(0, 0, 230, 0, TAU); g.stroke();
    g.fillStyle = "#a75a62"; g.beginPath(); g.arc(0, 0, 150, 0, TAU); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 8; g.beginPath(); g.arc(0, 0, 330, 0, TAU); g.stroke();
    g.restore();
    // hueco de la ventana: marco grueso de madera pintada y alféizar
    const { x0, x1, y0, y1 } = VEN;
    g.fillStyle = "#151a30"; g.fillRect(x0 - 22, y0 - 22, x1 - x0 + 44, y1 - y0 + 34);
    // cuadro con un faro (sin letras) y lámpara de pie + estantería a la derecha
    g.save(); g.translate(170, 210);
    g.fillStyle = "#6b4a2a"; g.fillRect(-48, -38, 96, 76); g.fillStyle = "#24365a"; g.fillRect(-38, -28, 76, 56);
    g.fillStyle = "#3a5f8a"; g.fillRect(-38, 6, 76, 22); g.fillStyle = "#f2e2b0"; g.fillRect(-6, -14, 10, 26); g.fillStyle = "#c94b3b"; g.fillRect(-6, -6, 10, 5);
    g.fillStyle = "rgba(255,240,170,0.35)"; g.beginPath(); g.moveTo(0, -14); g.lineTo(38, -26); g.lineTo(38, -4); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 3; g.strokeRect(-48, -38, 96, 76); g.restore();
    // estantería
    g.save(); g.translate(842, 268);
    g.fillStyle = "#4e3426"; g.fillRect(0, 0, 150, 210);
    g.fillStyle = "#3a261b"; for (let i = 0; i < 4; i++) g.fillRect(8, 8 + i * 50, 134, 44);
    const COLS = ["#c25b4a", "#e2b04a", "#5a8f7b", "#7d6bb3", "#d58a5a", "#3f6f9a", "#b8c26b", "#e8d7b5"];
    for (let r = 0; r < 4; r++) { let x = 12; let j = r * 3;
      while (x < 136) { const w = 7 + (hash(j) * 9 | 0), h = 26 + (hash(j + 9) * 14 | 0); g.fillStyle = COLS[j % COLS.length];
        if (hash(j + 3) < 0.15) { g.save(); g.translate(x, 52 + r * 50); g.rotate(-0.25); g.fillRect(0, -h, w, h); g.restore(); x += w + 6; }
        else { g.fillRect(x, 52 + r * 50 - h, w, h); g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 1; g.strokeRect(x, 52 + r * 50 - h, w, h); x += w + 1; }
        j++; } }
    // planta en lo alto
    g.fillStyle = "#b5653a"; g.fillRect(56, -24, 36, 24);
    g.fillStyle = "#3f7a4c"; for (let i = 0; i < 9; i++) { g.save(); g.translate(74, -24); g.rotate(-1.2 + i * 0.3); g.beginPath(); g.ellipse(0, -22, 7, 22, 0, 0, TAU); g.fill(); g.restore(); }
    g.strokeStyle = TINTA; g.lineWidth = 3; g.strokeRect(0, 0, 150, 210); g.restore();
    // lámpara de pie (luz cálida)
    g.save();
    const lg = g.createRadialGradient(1008, 210, 10, 1008, 230, 330);
    lg.addColorStop(0, "rgba(255,200,120,0.42)"); lg.addColorStop(0.4, "rgba(255,170,90,0.14)"); lg.addColorStop(1, "rgba(255,160,80,0)");
    g.fillStyle = lg; g.fillRect(600, -60, 500, 700);
    g.strokeStyle = "#2b2420"; g.lineWidth = 6; g.beginPath(); g.moveTo(1008, 230); g.lineTo(1008, 520); g.stroke();
    g.fillStyle = "#2b2420"; g.beginPath(); g.ellipse(1008, 522, 30, 8, 0, 0, TAU); g.fill();
    g.fillStyle = "#f4d79a"; g.beginPath(); g.moveTo(976, 230); g.lineTo(1040, 230); g.lineTo(1028, 176); g.lineTo(988, 176); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 3; g.stroke();
    g.restore();
    // sillón orejero verde
    sillon(g);
    // viñeta
    const vg = g.createRadialGradient(W / 2, H / 2 + 20, 260, W / 2, H / 2, 700);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(5,5,20,0.55)");
    g.fillStyle = vg; g.fillRect(-80, -60, W + 160, H + 120);
    return c;
  }
  function sillon(g) {
    const { x0, x1, yTop, ySeat, ySuelo } = SILLON;
    g.save(); g.lineJoin = "round";
    const verde = "#3f6b5a", verdeO = "#2c4f42", verdeC = "#5a8a74";
    // patas
    g.fillStyle = "#3a261b"; for (const x of [x0 + 12, x1 - 18]) g.fillRect(x, ySuelo - 22, 8, 22);
    // respaldo con orejas
    g.fillStyle = verde; g.beginPath();
    g.moveTo(x0 + 8, ySeat); g.lineTo(x0 + 4, yTop + 40); g.quadraticCurveTo(x0 - 8, yTop + 6, x0 + 18, yTop);
    g.quadraticCurveTo((x0 + x1) / 2, yTop - 18, x1 - 18, yTop); g.quadraticCurveTo(x1 + 8, yTop + 6, x1 - 4, yTop + 40); g.lineTo(x1 - 8, ySeat); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 3; g.stroke();
    g.fillStyle = verdeO; g.beginPath(); g.ellipse((x0 + x1) / 2, yTop + 60, 40, 46, 0, 0, TAU); g.fill();
    // asiento y brazos
    g.fillStyle = verdeC; g.beginPath(); g.roundRect(x0 + 6, ySeat - 14, x1 - x0 - 12, 30, 10); g.fill(); g.stroke();
    for (const [ax, w] of [[x0 - 8, 30], [x1 - 22, 30]]) { g.fillStyle = verde; g.beginPath(); g.roundRect(ax, ySeat - 34, w, ySuelo - 22 - (ySeat - 34), 12); g.fill(); g.stroke(); }
    g.fillStyle = verdeO; g.fillRect(x0 + 6, ySeat + 16, x1 - x0 - 12, ySuelo - 22 - ySeat - 16); g.strokeRect(x0 + 6, ySeat + 16, x1 - x0 - 12, ySuelo - 22 - ySeat - 16);
    // botones del capitoné
    g.fillStyle = "#24433a"; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { g.beginPath(); g.arc(x0 + 40 + i * 33, yTop + 30 + j * 32, 3, 0, TAU); g.fill(); }
    g.restore();
  }
  // sprite del marco de la ventana (con el hueco transparente)
  let marco = null;
  function creaMarco() {
    const c = lienzo(W, H), g = c.getContext("2d");
    const { x0, x1, y0, y1 } = VEN;
    g.fillStyle = "#e9e2d2"; g.strokeStyle = TINTA; g.lineWidth = 3;
    g.beginPath(); g.rect(x0 - 16, y0 - 16, x1 - x0 + 32, y1 - y0 + 22); g.rect(x0, y0, x1 - x0, y1 - y0); g.fill("evenodd"); g.stroke();
    // sombra interior del marco
    g.fillStyle = "rgba(120,110,95,0.35)"; g.fillRect(x0, y0, x1 - x0, 6);
    // alféizar
    g.fillStyle = "#f2ece0"; g.beginPath(); g.roundRect(x0 - 30, y1 + 2, x1 - x0 + 60, 14, 4); g.fill(); g.stroke();
    g.fillStyle = "rgba(120,110,95,0.3)"; g.fillRect(x0 - 28, y1 + 12, x1 - x0 + 56, 4);
    // un cactus en la punta izquierda del alféizar
    g.fillStyle = "#c06a3c"; g.fillRect(x0 - 18, y1 - 14, 22, 16); g.strokeRect(x0 - 18, y1 - 14, 22, 16);
    g.fillStyle = "#4d8a5a"; g.beginPath(); g.roundRect(x0 - 12, y1 - 40, 10, 28, 5); g.fill(); g.stroke();
    g.beginPath(); g.roundRect(x0 - 20, y1 - 32, 8, 12, 4); g.fill(); g.stroke();
    // barra de las cortinas
    g.fillStyle = "#3a2a18"; g.fillRect(CORT_I.x0 - 20, BARRA_Y - 4, CORT_D.x1 - CORT_I.x0 + 40, 7);
    for (const x of [CORT_I.x0 - 22, CORT_D.x1 + 22]) { g.beginPath(); g.arc(x, BARRA_Y, 8, 0, TAU); g.fill(); }
    return c;
  }

  /* ---------- el cielo de la tormenta (dentro del hueco) ---------- */
  let cielo = null;
  function creaCielo() {
    const { x0, x1, y0, y1 } = VEN;
    const c = lienzo(x1 - x0 + 120, y1 - y0 + 20), g = c.getContext("2d");
    g.translate(-x0 + 60, -y0);
    const gr = g.createLinearGradient(0, y0, 0, y1);
    gr.addColorStop(0, "#0b1022"); gr.addColorStop(0.6, "#1d2444"); gr.addColorStop(1, "#33395c");
    g.fillStyle = gr; g.fillRect(x0 - 60, y0, x1 - x0 + 120, y1 - y0 + 20);
    // ciudad al fondo
    g.fillStyle = "#0d1020";
    let x = x0 - 60;
    let j = 0;
    while (x < x1 + 60) { const w = 18 + hash(j) * 30, h = 20 + hash(j + 40) * 60; g.fillRect(x, y1 - h, w, h + 20);
      g.fillStyle = "rgba(255,200,110,0.75)"; for (let k = 0; k < 6; k++) if (hash(j * 7 + k) > 0.55) g.fillRect(x + 4 + (k % 2) * (w / 2 - 2), y1 - h + 6 + (k >> 1) * 12, 3, 4);
      g.fillStyle = "#0d1020"; x += w + 2; j++; }
    return c;
  }
  // nubes (por fotograma: se iluminan con el relámpago)
  function nubes(g, t, f) {
    const { x0, x1, y0 } = VEN;
    for (let i = 0; i < 7; i++) {
      const x = x0 - 60 + ((hash(i + 11) * 400 + t * (6 + 4 * hash(i))) % 380), y = y0 + 20 + hash(i + 3) * 120, r = 30 + hash(i + 5) * 34;
      g.fillStyle = `rgba(${lerp(34, 150, f) | 0},${lerp(40, 160, f) | 0},${lerp(68, 210, f) | 0},0.9)`;
      g.beginPath(); g.ellipse(x, y, r * 1.6, r * 0.7, 0, 0, TAU); g.ellipse(x + r, y - 8, r, r * 0.6, 0, 0, TAU); g.fill();
    }
  }
  // el rayo: zigzag con una rama (semilla por relámpago)
  function rayo(g, t) {
    const r = rayoVisible(t); if (!r || r.a <= 0.01) return;
    const sem = r.t0 * 13.7, { x0, x1, y0, y1 } = VEN;
    const pts = [P(lerp(x0 + 30, x1 - 40, hash(sem)), y0)];
    for (let i = 1; i <= 9; i++) { const prev = pts[i - 1]; pts.push(P(prev.x + (hash(sem + i) - 0.5) * 46, lerp(y0, y1 - 40, i / 9))); }
    const rama = [pts[4]]; for (let i = 1; i <= 4; i++) rama.push(P(rama[i - 1].x + 12 + hash(sem + 20 + i) * 18, rama[i - 1].y + 22));
    g.save(); g.globalAlpha = r.a; g.lineJoin = "miter"; g.lineCap = "round";
    for (const [w, col] of [[14, "rgba(150,170,255,0.25)"], [6, "rgba(200,215,255,0.7)"], [2.4, "#ffffff"]]) {
      g.strokeStyle = col; g.lineWidth = w;
      g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); g.stroke();
      g.lineWidth = w * 0.6; g.beginPath(); rama.forEach((q, i) => i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); g.stroke();
    }
    g.restore();
  }
  // lluvia fuera (líneas inclinadas) y gotas que entran cuando está abierta
  function lluviaFuera(g, t) {
    const { x0, x1, y0, y1 } = VEN, sl = 0.28;
    g.strokeStyle = "rgba(170,190,235,0.45)"; g.lineWidth = 1.3; g.beginPath();
    for (let i = 0; i < 70; i++) {
      const v = 520 + 260 * hash(i + 2), y = y0 + ((hash(i + 7) * 400 + v * t) % 330) - 20, x = x0 - 40 + hash(i + 4) * (x1 - x0 + 80) - sl * (y - y0);
      const l = 12 + 10 * hash(i + 9); g.moveTo(x, y); g.lineTo(x + sl * l, y + l);
    }
    g.stroke();
  }
  // ángulo de las hojas (0 cerrada … ~1,25 rad abierta hacia fuera)
  function angHoja(t, lado) {
    const a0 = lado > 0 ? T.empuja0 + 0.05 : T.empuja0 + 0.2, a1 = lado > 0 ? T.empuja1 : T.empuja1 + 0.12;
    let a = 1.22 * salida(fase(t, a0, a1));
    if (t > a1) a += 0.08 * ruido(t * 2.4 + lado * 3) + 0.06 * Math.sin(t * 7 + lado);
    for (const [t0, k] of RAYOS) a += 0.08 * k * campana(t, t0 + 0.05, t0 + 0.6) * Math.sin((t - t0) * 30);
    return clamp(a, 0, 1.45);
  }
  // una hoja de la ventana (bisagra en el canto de fuera; se abre hacia fuera)
  function hoja(g, t, lado) {
    const { x0, x1, y0, y1, mx } = VEN;
    const a = angHoja(t, lado), bis = lado < 0 ? x0 : x1, w = mx - x0, c = Math.cos(a);
    const xl = bis - lado * w * c;                 // canto libre
    const enc = 1 - 0.14 * Math.sin(a);           // se aleja: el canto libre encoge
    const yc = (y0 + y1) / 2, h2 = (y1 - y0) / 2;
    const q = [P(bis, y0), P(xl, yc - h2 * enc), P(xl, yc + h2 * enc), P(bis, y1)];
    g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
    // cristal (oscuro, con reflejo), más oscuro cuanto más abierta
    g.beginPath(); g.moveTo(q[0].x, q[0].y); for (const p of q) g.lineTo(p.x, p.y); g.closePath();
    g.fillStyle = `rgba(30,40,80,${0.35 + 0.35 * Math.sin(a)})`; g.fill();
    // reflejo
    g.save(); g.clip();
    g.strokeStyle = `rgba(220,230,255,${0.16 + 0.4 * destello(t)})`; g.lineWidth = 10;
    g.beginPath(); g.moveTo(lerp(q[0].x, q[1].x, 0.2), y0 + 30); g.lineTo(lerp(q[0].x, q[1].x, 0.55), y1 - 40); g.stroke();
    // gotas en el cristal (bajan) cuando está cerrada
    if (a < 0.4) {
      g.fillStyle = "rgba(200,215,255,0.55)";
      for (let i = 0; i < 16; i++) { const fx = hash(i * 3 + lado * 50), fy = (hash(i * 5 + lado) + t * (0.05 + 0.1 * hash(i))) % 1;
        const x = lerp(bis, xl, 0.08 + fx * 0.84), y = lerp(y0 + 6, y1 - 6, fy); g.beginPath(); g.ellipse(x, y, 1.8, 2.8, 0, 0, TAU); g.fill(); }
    }
    g.restore();
    // bastidor y travesaños (2 × 3 cristales)
    g.strokeStyle = "#e9e2d2"; g.lineWidth = 7;
    g.beginPath(); g.moveTo(q[0].x, q[0].y); for (const p of q) g.lineTo(p.x, p.y); g.closePath(); g.stroke();
    g.lineWidth = 3.5;
    for (let i = 1; i < 3; i++) { const k = i / 3; g.beginPath(); g.moveTo(bis, lerp(y0, y1, k)); g.lineTo(xl, lerp(q[1].y, q[2].y, k)); g.stroke(); }
    g.beginPath(); g.moveTo(lerp(bis, xl, 0.5), lerp(y0, q[1].y, 0.5)); g.lineTo(lerp(bis, xl, 0.5), lerp(y1, q[2].y, 0.5)); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(q[0].x, q[0].y); for (const p of q) g.lineTo(p.x, p.y); g.closePath(); g.stroke();
    // pestillo (en la hoja derecha)
    if (lado > 0) { const px = lerp(xl, bis, 0.06), py = lerp(q[1].y, q[2].y, 0.8); g.fillStyle = "#c8a35a"; g.beginPath(); g.arc(px, py, 3.5, 0, TAU); g.fill(); g.stroke();
      const ga = -1.2 * tramo(t, T.latch1, T.gira); g.save(); g.translate(px, py); g.rotate(ga); g.fillRect(-1.5, 0, 3, 9); g.restore(); }
    g.restore();
  }
  function ventana(g, t) {
    const { x0, x1, y0, y1 } = VEN, f = destello(t);
    if (!cielo) cielo = creaCielo();
    g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
    g.drawImage(cielo, x0 - 60, y0);
    nubes(g, t, f);
    if (f > 0.002) { g.fillStyle = `rgba(190,205,255,${0.6 * f})`; g.fillRect(x0, y0, x1 - x0, y1 - y0); }
    rayo(g, t);
    lluviaFuera(g, t);
    g.restore();
    hoja(g, t, -1); hoja(g, t, 1);
    if (!marco) marco = creaMarco();
    g.drawImage(marco, 0, 0);
  }
  // lluvia que entra con el viento (gotas que vuelan hacia la habitación)
  function lluviaDentro(g, t) {
    const v = viento(t); if (v < 0.05) return;
    const { x0, x1, y0, y1 } = VEN;
    g.save(); g.strokeStyle = `rgba(190,210,255,${0.45 * clamp(v)})`; g.lineWidth = 1.4; g.beginPath();
    for (let i = 0; i < 26; i++) {
      const per = 0.7 + 0.5 * hash(i + 60), k = ((t + hash(i + 61) * per) % per) / per;
      const sx = lerp(x0 + 20, x1 - 20, hash(i + 62)), sy = lerp(y0 + 40, y1 - 20, hash(i + 63));
      const dir = sx < VEN.mx ? -1 : 1;
      const x = sx + dir * k * (90 + 80 * hash(i + 64)) * v, y = sy + k * k * 110 + k * 30;
      g.moveTo(x, y); g.lineTo(x - dir * 6, y - 5);
    }
    g.stroke(); g.restore();
  }
  // retumbo: rayas en zigzag alrededor de la ventana
  function retumbo(g, t) {
    for (const [t0, k, n] of RAYOS) {
      const v = t - t0 - 0.05; if (v < 0 || v > 0.7) continue;
      const a = k * (1 - suave(fase(v, 0.15, 0.7))) * suave(fase(v, 0, 0.08));
      g.save(); g.globalAlpha = a; g.strokeStyle = "#f2f0ff"; g.lineWidth = 3; g.lineJoin = "miter";
      const cx = VEN.mx, cy = VEN.y0 - 6, rr = 70 + v * 120 * (0.8 + 0.2 * n);
      for (let j = 0; j < 4 + n; j++) {
        const ang = -Math.PI * (0.15 + 0.7 * (j + 0.5) / (4 + n));
        g.beginPath();
        for (let s = 0; s < 4; s++) { const r2 = rr + s * 9, a2 = ang + (s % 2 ? 0.05 : -0.05); const q = P(cx + Math.cos(a2) * r2 * 1.5, cy + Math.sin(a2) * r2 * 0.55);
          if (s) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); }
        g.stroke();
      }
      g.restore();
    }
  }
  // estrellitas del susto / tiritona: rayitas alrededor de la cabeza
  function sustos(g, t, pg) {
    const k = Math.max(campana(t, T.rayo1, T.rayo1 + 0.5), campana(t, T.rayo2, T.rayo2 + 0.55));
    if (k < 0.02) return;
    const H = G.cabeza(pg), c = aMundoG(pg, G.aPantalla(pg, H.a(P(720, 560))));
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 3; g.globalAlpha = k; g.lineCap = "round";
    for (let i = 0; i < 6; i++) { const a = -Math.PI * (0.1 + 0.8 * i / 5), r1 = 84, r2 = 84 + 18 * k;
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1 * 1.1); g.lineTo(c.x + Math.cos(a) * r2, c.y + Math.sin(a) * r2 * 1.1); g.stroke(); }
    g.restore();
  }
  // tiritona: vaho y rayitas de frío
  function frio(g, t, pg) {
    const k = dentro(t, 2.0, 2.4, T.rayo1 - 0.1, T.rayo1);
    if (k < 0.02) return;
    const b = G.aPantalla(pg, G.boca(pg));
    g.save(); g.globalAlpha = 0.5 * k; g.fillStyle = "#dfe8ff";
    for (let i = 0; i < 3; i++) { const u = ((t * 0.9 + i / 3) % 1); g.beginPath(); g.ellipse(b.x + 10 + u * 30, b.y - 6 - u * 18, 5 + u * 9, 4 + u * 6, 0, 0, TAU); g.globalAlpha = 0.45 * k * (1 - u); g.fill(); }
    g.restore();
  }
  // ronroneo en brazos (rayitas de vibración) mientras le acarician
  function ronroneo(g, t, pg) {
    const k = dentro(t, T.acaricia0 + 0.3, T.acaricia0 + 0.5, T.rayo4, T.rayo4 + 0.05);
    if (k < 0.02) return;
    const c = mundoHojaG(pg, G.tronco(pg)(P(250, 520)));
    g.save(); g.strokeStyle = "rgba(255,240,210,0.85)"; g.lineWidth = 2; g.globalAlpha = k;
    for (let i = 0; i < 3; i++) { const ph = Math.sin(t * 40 + i * 2) * 2; g.beginPath(); g.arc(c.x, c.y - 40, 40 + i * 9 + ph, -2.6, -1.9); g.stroke(); g.beginPath(); g.arc(c.x, c.y - 40, 40 + i * 9 + ph, -1.2, -0.5); g.stroke(); }
    g.restore();
  }

  /* ---------- manos encima (las de Sara al sostenerle; las de Guillermo en la cortina) ---------- */
  function manosEncima(g, Pj, p, lados) {
    const k = p.s * Pj.K, col = { piel: Pj.C.piel, sombra: Pj.C.pielSombra, tinta: Pj.C.tinta };
    g.save(); g.translate(p.x, p.suelo); g.scale(p.espejo ? -k : k, k); g.translate(-Pj.PELVIS.x, -Pj.SUELO);
    for (const lado of lados) {
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m || (m.puno ?? 1) < 0.5) continue;
      g.save(); g.translate(m.x, m.y); g.rotate(m.ang || 0); g.scale(Pj.JK * (m.espejo ? -1 : 1), Pj.JK); g.scale((Pj === G ? 1 : 0.86) * m.puno, (Pj === G ? 1 : 0.86) * m.puno);
      if (m.dedos) Personaje2D.mano(g, m, col); else Personaje2D.puno(g, m.pulgar, col);
      g.restore();
    }
    g.restore();
  }
  function dibG(g, pg, t) {
    const M = pg.marco;
    g.save(); g.translate(M.W.x, M.W.y); g.rotate(M.phi); g.scale(M.esx, 1); g.translate(-M.Pp.x, -M.Pp.y);
    G.dibujar(g, pg, t);
    g.restore();
  }
  function sombra(g, x, y, w, a) { g.fillStyle = `rgba(8,6,20,${a})`; g.beginPath(); g.ellipse(x, y, w, 7, 0, 0, TAU); g.fill(); }

  /* =====================================================================================
   * CÁMARA
   * ===================================================================================== */
  function camara(t) {
    const z = tramo(t, T.atrapa + 0.3, T.atrapa + 2.0);
    const sh = temblor(t);
    return { k: 1 + 0.2 * z, x: lerp(W / 2, 600, z) + sh.x, y: lerp(H / 2, 330, z) + sh.y };
  }

  class Tormenta extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !S.listo()) return;
      if (!fondo) fondo = creaFondo();
      const { g: pg, s: ps } = pose(t);
      const luz = tramo(t, NEGRO_INICIO, T.entra, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t), f = destello(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      g.drawImage(fondo, FX, FY);
      ventana(g, t);
      // la luz del relámpago entra por la ventana y pinta el suelo
      if (f > 0.002) {
        g.save(); g.globalAlpha = 0.45 * f; g.fillStyle = "#cdd8ff";
        g.beginPath(); g.moveTo(VEN.x0, VEN.y1); g.lineTo(VEN.x1, VEN.y1); g.lineTo(VEN.x1 + 120, 600); g.lineTo(VEN.x0 - 120, 600); g.closePath(); g.fill(); g.restore();
      }
      // la cortina izquierda va delante de Guillermo hasta que sale de ella de un salto (y ya no se tocan)
      const esc = escondite(t, pg), cortinaDelante = t < T.cae2 + 0.01;
      dibCortina(g, t, CORT_D, 1, null);
      if (!cortinaDelante) dibCortina(g, t, CORT_I, -1, null);
      const M = manta(t, pg);
      M.parp = pg.cara.ojos.d; M.mx = pg.cara.mirada.x * (pg.ladoC ?? 1); M.my = pg.cara.mirada.y; M.iris = pg.cara.iris;
      if (t < T.coge) dibManta(g, t, M);
      // sombras
      const vuela = t >= T.despega && t < T.atrapa;
      if (t < T.despega) sombra(g, pg.marco.W.x, SUELO0 + 3, 46 * (1 - clamp(saltoG(t) / 160)), 0.35);
      if (vuela) { const k = fase(t, T.despega, T.atrapa); sombra(g, lerp(XG_FIN, 640, k), SUELO0 + 3, lerp(40, 30, campana(k, 0, 1)), 0.25); }
      sombra(g, ps.x - 4, SUELO0 + 3, 48, 0.35);
      const enBrazos = t >= T.despega;
      if (!enBrazos) {
        dibG(g, pg, t);
        if (t >= T.coge) dibManta(g, t, M);
        frio(g, t, pg);
      }
      if (cortinaDelante) {
        dibCortina(g, t, CORT_I, -1, esc);
        // las manos que agarran el borde de la cortina, por encima (aparecen y se van con un fundido corto)
        const a = dentro(t, T.esconde - 0.02, T.esconde + 0.08, T.salta2, T.salta2 + 0.07);
        if (a > 0.01) { g.save(); g.globalAlpha = a; manosEncima(g, G, pg, ["cerca", "lejos"]); g.restore(); }
      }
      S.dibujar(g, ps, t);
      if (enBrazos) {
        dibG(g, pg, t);
        // las manos de Sara, por encima de Guillermo (le sujetan por debajo)
        const a = tramo(t, T.atrapa - 0.1, T.atrapa - 0.02);
        if (a > 0.01) { g.save(); g.globalAlpha = a; manosEncima(g, S, ps, ["cerca", "lejos"]); g.restore(); }
        dibManta(g, t, M);
        ronroneo(g, t, pg);
      }
      sustos(g, t, pg);
      lluviaDentro(g, t);
      retumbo(g, t);
      g.restore();
      // el destello lo ilumina todo (en rampa)
      if (f > 0.002) { g.fillStyle = `rgba(215,225,255,${0.38 * f})`; g.fillRect(0, 0, W, H); }
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }

  registrar({ id: "00124", nombre: "Guillermo y Sara · La tormenta", crear: () => new Tormenta() });
  window.__A2D_00124 = { pose, T, DUR };
})();
