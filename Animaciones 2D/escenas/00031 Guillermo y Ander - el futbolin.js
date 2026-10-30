"use strict";
/* 00031 · Guillermo y Ander · El futbolín
 *
 * Negro → sala de juegos retro (pared de rayas setenteras, banderines, póster de un balón y una
 * lámpara alargada de billar). En el centro, un futbolín visto desde su portería: Guillermo a la
 * izquierda (rojos) y Ander a la derecha (azules, en espejo), cada uno con sus barras. Guillermo,
 * agachado y muy chulo, mira a cámara; Ander, con un vaso en la otra mano, le levanta una ceja y bebe.
 * → Saque: Guillermo hace girar sus barras como un loco (muñequitos dando vueltas, la mesa tiembla);
 * Ander, con un golpecito de muñeca, para la bola con su delantero y ¡gol! en la portería de
 * Guillermo (clac). Ander corre una bolita del marcador con un dedo.
 * → Segundo saque: Guillermo, rojo y sudando, gira todavía más rápido… gol de Ander. Segunda bolita.
 * → Tercer saque: Guillermo, con la vena hinchada, coge aire y gira con todo el cuerpo: la mesa
 * echa humo y uno de sus muñecos le da a la bola tan fuerte que sale disparada hacia arriba fuera
 * de plano. Los dos miran arriba… la bola vuelve a caer, ¡plof!, justo en la jarra de cerveza de
 * Guillermo, que le salpica toda la cara.
 * → Guillermo se queda helado, chorreando espuma. Ander, sin inmutarse, corre la tercera bolita
 * con un dedo, da un sorbo a su vaso y mira a cámara. Guillermo se limpia los ojos y pone pucheros.
 * → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`. El giro de las barras se integra una sola vez al
 * cargar (tabla de ángulos), así cualquier instante sale igual a cualquier fps.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, A = Ander;
  const S = 0.30, SUELO = 560, DUR = 13.5;
  const T = {
    chulo: 0.35, ceja: 0.5, sorbe0: 0.85, sorbe1: 1.35,
    saque1: 1.05, f1: 1.25, atrapa1: 2.98, atras1: 3.22, chuta1: 3.34, gol1: 3.5,
    cuenta1: 3.85, saque2: 4.55, f2: 4.75, sorbe2: 5.25, sorbe3: 5.8, atrapa2: 6.42, atras2: 6.6, chuta2: 6.7, gol2: 6.86,
    cuenta2: 7.15, furia: 7.5, inspira0: 7.85, saque3: 7.95, f3: 8.15, lanza: 9.0, plof: 10.0,
    cuenta3: 10.95, limpia0: 11.45, limpia1: 11.95, sorbe4: 11.55, sorbe5: 12.15, fin: 12.7
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const rot = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const D = (pu, ix, re) => ({ pulgar: pu, indice: ix, medio: re, anular: re, menique: re });
  const mezclaD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k), anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const PUNO = D(0, 0, 0), INDICE = D(0, 1, 0), VASO_D = D(0.3, 0.38, 0.4);

  /* =====================================================================================
   * FUTBOLÍN: campo en perspectiva visto desde la portería de Guillermo (v = 0 cerca, 1 lejos)
   * ===================================================================================== */
  const TX = 512, YN = 362, YF = 282, WN = 300, WF = 228;
  const Wv = v => lerp(WN, WF, v), kv = v => Wv(v) / WN, yv = v => lerp(YN, YF, v);
  const P3 = (u, v, h = 0) => ({ x: TX + (u - 0.5) * Wv(v), y: yv(v) - h * kv(v) });
  const H_BARRA = 9, RAIL = 13, FRENTE = 62;
  // barras: profundidad, dueño (g/a), número de muñecos
  const BARRAS = [
    { v: 0.07, d: "g", n: 1 }, { v: 0.19, d: "g", n: 2 }, { v: 0.33, d: "a", n: 3 }, { v: 0.46, d: "g", n: 5 },
    { v: 0.57, d: "a", n: 5 }, { v: 0.69, d: "g", n: 3 }, { v: 0.82, d: "a", n: 2 }, { v: 0.93, d: "a", n: 1 }
  ];
  const POS_U = { 1: [0.5], 2: [0.31, 0.69], 3: [0.22, 0.5, 0.78], 5: [0.13, 0.315, 0.5, 0.685, 0.87] };
  const COL = { g: ["#d8323a", "#8e1a22"], a: ["#2f6fd6", "#173d86"] };
  // extremo de cada barra: el puño (mango) va por fuera de la pared del dueño
  function mango(i) {
    const b = BARRAS[i], k = kv(b.v), y = yv(b.v) - H_BARRA * k;
    if (b.d === "g") { const xw = TX - Wv(b.v) / 2 - RAIL * k; return { x0: xw, x1: xw - 15, x2: xw - 15 - 30, y, k, lado: -1 }; }
    const xw = TX + Wv(b.v) / 2 + RAIL * k; return { x0: xw, x1: xw + 15, x2: xw + 15 + 30, y, k, lado: 1 };
  }
  const centroMango = (i, sh) => { const m = mango(i); return { x: (m.x1 + m.x2) / 2 + sh.x, y: m.y + sh.y }; };

  /* ---------- giro de las barras de Guillermo (integrado una vez) ---------- */
  const frenesi = t => 0.62 * tramo(t, T.f1, T.f1 + 0.3) * (1 - tramo(t, T.gol1 + 0.02, T.gol1 + 0.4))
    + 0.86 * tramo(t, T.f2, T.f2 + 0.25) * (1 - tramo(t, T.gol2 + 0.02, T.gol2 + 0.4))
    + 1.0 * tramo(t, T.f3, T.f3 + 0.2) * (1 - tramo(t, T.lanza + 0.05, T.lanza + 1.5, suave));
  const DT = 1 / 480, NP = Math.ceil((DUR + 1) / DT);
  function integra(w) { const a = new Float64Array(NP); let s = 0; for (let i = 0; i < NP; i++) { a[i] = s; s += w(i * DT) * DT; } return a; }
  const muestra = (a, t) => { const x = clamp(t, 0, DUR) / DT, i = Math.floor(x), f = x - i; return lerp(a[i], a[Math.min(a.length - 1, i + 1)], f); };
  const OMEGA = { 1: 31, 3: -27, 5: 18 };
  const GIRO = {};
  for (const i of [1, 3, 5]) GIRO[i] = integra(t => OMEGA[i] * frenesi(t) * (i === 5 ? tramo(t, T.f3, T.f3 + 0.3) : 1));
  // barra del delantero de Ander: atrapa, carga y chuta en cada gol
  function giroAnder(t) {
    let a = 0.12 + 0.05 * Math.sin(t * 1.3);
    for (const [ta, tb, tc] of [[T.atrapa1, T.atras1, T.chuta1], [T.atrapa2, T.atras2, T.chuta2]]) {
      a = lerp(a, 0.55, tramo(t, ta - 0.08, ta + 0.04));              // pisa la bola
      a = lerp(a, -0.95, tramo(t, tb, tc - 0.02, salida));            // echa la pierna atrás
      a = lerp(a, 1.15, tramo(t, tc - 0.02, tc + 0.035, salida));     // ¡chut!
      a = lerp(a, 0.12, tramo(t, tc + 0.1, tc + 0.45));               // vuelve
    }
    return a;
  }
  function giroBarra(i, t) {
    if (i === 1 || i === 3 || i === 5) return muestra(GIRO[i], t);
    if (i === 2) return giroAnder(t);
    return 0.06 * Math.sin(t * 1.1 + i);
  }
  const omegaBarra = (i, t) => (giroBarra(i, t + 0.004) - giroBarra(i, t - 0.004)) / 0.008;
  function deslizaBarra(i, t) {
    const f = frenesi(t);
    if (i === 1) return 0.07 * Math.sin(t * 6.3) * f;
    if (i === 3) return 0.06 * Math.sin(t * 5.1 + 1) * f;
    if (i === 5) return 0.05 * Math.sin(t * 7.3 + 2) * f;
    if (i === 0) return -0.12;                                         // el portero se quedó a un lado
    if (i === 2) return -0.06 * tramo(t, 6.1, 6.4) * (1 - tramo(t, 7.0, 7.4)) + 0.02 * Math.sin(t * 0.9);
    return 0.015 * Math.sin(t * 0.7 + i);
  }
  // temblor de la mesa con el frenesí (y con el ¡pum! de la bola)
  function temblor(t) {
    const f = frenesi(t), amp = 1.6 * f * f + 3 * Math.exp(-Math.max(0, t - T.lanza) * 9) * (t >= T.lanza ? 1 : 0);
    return { x: ruido(t * 38) * amp, y: ruido(t * 41 + 7) * amp * 0.6 };
  }

  /* ---------- la bola ---------- */
  // tramos [t, u, v, h]; entre puntos se interpola con Catmull-Rom (rebotes del frenesí)
  const CAOS1 = [[1.05, 1.03, 0.5, 9], [1.2, 0.9, 0.5, 0], [1.45, 0.64, 0.53, 0], [1.68, 0.44, 0.48, 0], [1.88, 0.6, 0.58, 0], [2.08, 0.4, 0.44, 0],
    [2.3, 0.62, 0.5, 0], [2.52, 0.43, 0.56, 0], [2.72, 0.57, 0.42, 0], [2.9, 0.5, 0.37, 0], [T.atrapa1, 0.5, 0.345, 0], [T.chuta1, 0.5, 0.345, 0]];
  const CAOS2 = [[T.saque2, 1.03, 0.5, 9], [4.7, 0.9, 0.5, 0], [4.92, 0.62, 0.56, 0], [5.12, 0.38, 0.47, 0], [5.3, 0.63, 0.43, 0], [5.48, 0.41, 0.6, 0],
    [5.66, 0.6, 0.55, 0], [5.84, 0.37, 0.45, 0], [6.02, 0.58, 0.6, 0], [6.2, 0.47, 0.42, 0], [6.34, 0.45, 0.37, 0], [T.atrapa2, 0.44, 0.345, 0], [T.chuta2, 0.44, 0.345, 0]];
  const CAOS3 = [[T.saque3, 1.03, 0.5, 9], [8.1, 0.9, 0.5, 0], [8.3, 0.62, 0.57, 0], [8.47, 0.4, 0.49, 0], [8.63, 0.62, 0.42, 0], [8.79, 0.39, 0.56, 0],
    [8.93, 0.5, 0.48, 0], [T.lanza, 0.47, 0.475, 0]];
  function catmull(L, t) {
    let i = 0; while (i < L.length - 2 && t > L[i + 1][0]) i++;
    const a = L[Math.max(0, i - 1)], b = L[i], c = L[i + 1], d = L[Math.min(L.length - 1, i + 2)];
    const k = clamp((t - b[0]) / (c[0] - b[0])), k2 = k * k, k3 = k2 * k;
    const f = j => 0.5 * ((2 * b[j]) + (-a[j] + c[j]) * k + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * k2 + (-a[j] + 3 * b[j] - 3 * c[j] + d[j]) * k3);
    return { u: f(1), v: f(2), h: lerp(b[3], c[3], k) };
  }
  const PINTA = { x: 398, y: YN + 27 };                // base de la jarra de Guillermo (portavasos del frente)
  const BOCA_PINTA = { x: PINTA.x, y: PINTA.y - 52 };
  // estado de la bola: {modo: "campo"|"aire"|"jarra"|null, …}
  function bola(t) {
    const enCampo = (L, chuta, gol, uGol) => {
      if (t < chuta) return { modo: "campo", ...catmull(L, t) };
      const k = fase(t, chuta, gol), u0 = L[L.length - 1][1];
      return k < 1 ? { modo: "campo", u: lerp(u0, uGol, k), v: lerp(0.345, -0.03, k), h: 0 } : null;
    };
    if (t >= T.saque1 && t < T.gol1 + 0.02) return enCampo(CAOS1, T.chuta1, T.gol1, 0.57);
    if (t >= T.saque2 && t < T.gol2 + 0.02) return enCampo(CAOS2, T.chuta2, T.gol2, 0.6);
    if (t >= T.saque3 && t < T.lanza) return { modo: "campo", ...catmull(CAOS3, t) };
    if (t >= T.lanza && t < T.plof) {
      const k = fase(t, T.lanza, T.plof), p0 = P3(0.47, 0.475, 0);
      const x = lerp(p0.x, BOCA_PINTA.x, k) + 26 * Math.sin(Math.PI * k), alto = 218;
      const y = lerp(p0.y, BOCA_PINTA.y - 4, k) - 4 * alto * k * (1 - k);
      return { modo: "aire", x, y, r: lerp(4.4, 5.2, k), giro: t * 30 };
    }
    if (t >= T.plof) return { modo: "jarra", hunde: fase(t, T.plof, T.plof + 0.25) };
    return null;
  }

  /* ---------- marcador de bolitas en la barandilla de cada lado ---------- */
  const CUENTA = [[T.cuenta1 + 0.15, T.cuenta1 + 0.3], [T.cuenta2 + 0.15, T.cuenta2 + 0.3], [T.cuenta3 + 0.15, T.cuenta3 + 0.3]];
  const VB0 = 0.62, VB1 = 0.9;            // tramo del alambre (profundidad)
  // profundidad de la bolita j (0 = la más cercana al lado que puntúa) de Ander
  function bolitaAnder(j, t) {
    const libre = VB1 - (4 - j) * 0.04;            // en reposo, al fondo
    const punto = VB0 + (j) * 0.04;                // movida, delante
    if (j >= CUENTA.length) return libre;
    const [t0, t1] = CUENTA[j];
    return lerp(libre, punto, suave(fase(t, t0, t1)));
  }
  const bolitaPos = (lado, v, sh) => { const k = kv(v), x = lado > 0 ? TX + Wv(v) / 2 + RAIL * k * 0.5 : TX - Wv(v) / 2 - RAIL * k * 0.5;
    return { x: x + sh.x, y: yv(v) - 4 * k + sh.y, r: 4.6 * k }; };

  /* =====================================================================================
   * CARAS (los dos usan los mismos campos)
   * ===================================================================================== */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, mof: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: 0,
      ojos: { d: Math.max(e.c, parp), i: Math.max(e.c, parp), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha; rojos)
   * ===================================================================================== */
  const XG = 286;
  const CARAS_G = {
    inicio: E({ mx: 0.7, my: 0.6, orig: 0, sonr: 0.45, sd: 4 }),
    chulo: E({ mx: -0.85, my: -0.15, sd: 18, gd: 0.16, si: -4, gi: -0.08, orig: 0, sonr: 0.85, abre: 5, ancho: 0.95 }),
    foco: E({ mx: 0.7, my: 0.95, c: 0.22, sd: -8, gd: -0.16, si: -8, gi: -0.16, orig: 0, abre: 9, ancho: 0.55, sonr: 0.05, lengua: 1 }),
    loco: E({ mx: 0.6, my: 0.95, iris: 0.82, sd: 10, gd: -0.1, si: 10, gi: -0.1, orig: 0, abre: 16, ancho: 1.25, sonr: 0.75 }),
    pasmo: E({ mx: 0.55, my: 1, iris: 0.78, sd: 24, gd: 0.18, si: 24, gi: 0.18, orig: 0, abre: 44, ancho: 0.7, sonr: -0.15, lengua: 0.3 }),
    decidido: E({ mx: 0.7, my: 0.9, c: 0.3, sd: -14, gd: -0.26, si: -14, gi: -0.26, orig: 0, abre: 0, ancho: 0.85, sonr: -0.25 }),
    rabia: E({ mx: 0.6, my: 0.95, c: 0.38, z: 0.2, sd: -14, gd: -0.3, si: -14, gi: -0.3, orig: 0, abre: 22, ancho: 1.25, sonr: -0.6 }),
    furia: E({ mx: 0.92, my: 0.1, c: 0.32, sd: -18, gd: -0.32, si: -18, gi: -0.32, orig: 0, abre: 12, ancho: 1.15, sonr: -0.6 }),
    inspira: E({ mx: 0.85, my: 0.1, c: 0.6, z: 0.2, sd: -6, gd: -0.2, si: -6, gi: -0.2, orig: 0, abre: 0, ancho: 0.8, sonr: 0, mof: 0.85 }),
    total: E({ mx: 0.6, my: 0.95, c: 0.45, z: 0.5, sd: -12, gd: -0.3, si: -12, gi: -0.3, orig: 0, abre: 46, ancho: 1.3, sonr: -0.25, lengua: 0.4 }),
    arriba: E({ mx: 0.35, my: -1, iris: 0.85, sd: 22, gd: 0.15, si: 22, gi: 0.15, orig: 0, abre: 26, ancho: 0.55, sonr: -0.1, lengua: 0 }),
    abajo: E({ mx: 0.65, my: 0.85, iris: 0.85, sd: 18, gd: 0.12, si: 18, gi: 0.12, orig: 0, abre: 22, ancho: 0.6, sonr: -0.1 }),
    salpica: E({ mx: 0.5, my: 0.3, c: 1, z: 1, sd: 6, gd: 0.1, si: 6, gi: 0.1, orig: 0, abre: 8, ancho: 0.9, sonr: -0.4 }),
    helado: E({ mx: 0.5, my: 0.3, c: 1, z: 0.15, sd: 4, gd: 0.04, si: 4, gi: 0.04, orig: 0, abre: 0, ancho: 0.85, sonr: -0.35 }),
    mira: E({ mx: 0.85, my: 0.35, c: 0.3, sd: 10, gd: -0.18, si: 10, gi: -0.18, orig: 0, abre: 2, ancho: 0.8, sonr: -0.45 }),
    pucheros: E({ mx: -0.85, my: -0.05, c: 0.3, sd: 14, gd: -0.24, si: 14, gi: -0.24, orig: 0, abre: 0, ancho: 0.62, sonr: -0.75 })
  };
  const GUION_CARA_G = [
    [T.chulo, T.chulo + 0.25, "chulo"], [0.95, 1.15, "foco"], [T.f1 + 0.15, T.f1 + 0.4, "loco"], [T.gol1, T.gol1 + 0.12, "pasmo"],
    [4.15, 4.4, "decidido"], [T.f2, T.f2 + 0.3, "rabia"], [T.gol2, T.gol2 + 0.12, "pasmo"], [T.furia, T.furia + 0.2, "furia"],
    [T.inspira0, T.inspira0 + 0.2, "inspira"], [T.f3, T.f3 + 0.12, "total"], [T.lanza + 0.04, T.lanza + 0.2, "arriba"],
    [9.62, 9.85, "abajo"], [T.plof + 0.08, T.plof + 0.14, "salpica"], [T.plof + 0.45, T.plof + 0.7, "helado"],
    [T.limpia1 - 0.05, T.limpia1 + 0.15, "mira"], [12.1, 12.35, "pucheros"]
  ];
  // postura: dx (px), pel (hoja), torso, cab
  const CUERPOS_G = {
    listo: { dx: 0, pel: 42, torso: 0.24, cab: 0.08, ey: 0 },
    frenesi: { dx: 3, pel: 56, torso: 0.3, cab: 0.12, ey: 0 },
    pasmo: { dx: -2, pel: 30, torso: 0.16, cab: 0.16, ey: 0 },
    furia: { dx: 0, pel: 48, torso: 0.26, cab: 0.02, ey: 0 },
    inspira: { dx: -3, pel: 24, torso: 0.12, cab: -0.1, ey: 0.035 },
    total: { dx: 4, pel: 62, torso: 0.33, cab: 0.1, ey: 0 },
    arriba: { dx: -4, pel: 26, torso: 0.06, cab: -0.32, ey: 0 },
    abajo: { dx: 0, pel: 34, torso: 0.18, cab: 0.06, ey: 0 },
    salpica: { dx: -8, pel: 30, torso: 0.02, cab: -0.2, ey: 0 },
    helado: { dx: -6, pel: 32, torso: 0.08, cab: -0.06, ey: 0 },
    final: { dx: -4, pel: 30, torso: 0.1, cab: 0.04, ey: 0 }
  };
  const GUION_CUERPO_G = [
    [T.f1 - 0.1, T.f1 + 0.3, "frenesi"], [T.gol1, T.gol1 + 0.3, "pasmo"], [4.15, 4.6, "listo"], [T.f2, T.f2 + 0.3, "frenesi"],
    [T.gol2, T.gol2 + 0.3, "pasmo"], [T.furia, T.furia + 0.3, "furia"], [T.inspira0, T.inspira0 + 0.3, "inspira"], [T.f3, T.f3 + 0.15, "total"],
    [T.lanza + 0.04, T.lanza + 0.4, "arriba"], [9.62, 9.9, "abajo"], [T.plof + 0.04, T.plof + 0.16, "salpica"], [T.plof + 0.3, T.plof + 0.8, "helado"],
    [T.limpia0, T.limpia1, "final"]
  ];
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const PARP_G = [0.62, 2.0, 4.3, 7.3, 11.98, 12.55];

  function poseG(t) {
    const b = linea(GUION_CUERPO_G, CUERPOS_G, "listo", t);
    const f = frenesi(t), respira = Math.sin(t * 2.4), sh = temblor(t);
    // brinquitos y sacudidas con el frenesí (más en el último, con todo el cuerpo)
    const total = tramo(t, T.f3, T.f3 + 0.15) * (1 - tramo(t, T.lanza, T.lanza + 0.25));
    const bote = Math.abs(Math.sin(t * 15)) * (6 * f + 14 * total);
    const p = {
      x: XG + b.dx + ruido(t * 23) * (2 * f + 3 * total), suelo: SUELO, s: S, tirasLimpias: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.3 - bote },
      torso: b.torso + 0.03 * ruido(t * 19 + 2) * (f + total), torsoEsc: { x: 1, y: 1 + respira * 0.004 + b.ey },
      piernas: {}, cabeza: { ang: b.cab + 0.05 * ruido(t * 27 + 4) * (f + total), dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // ¡plof!: la cabeza da un respingo hacia atrás
    const golpe = t >= T.plof + 0.08 ? Math.exp(-(t - T.plof - 0.08) * 7) * suave(fase(t, T.plof + 0.08, T.plof + 0.12)) : 0;
    p.cabeza.ang -= 0.12 * golpe; p.cabeza.dx -= 10 * golpe;
    for (const [lado, fx] of [["cerca", XG - 40], ["lejos", XG + 34]]) {
      p.piernas[lado] = { tob: { x: G.PELVIS.x + (fx - p.x) / S, y: TOB_G[lado] }, ang: 0 };
    }
    // cara
    const ex = guion => linea(guion, CARAS_G, "inicio", t);
    const e = ex(GUION_CARA_G);
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.rojo = 0.55 * tramo(t, T.f2 + 0.3, T.f2 + 1.0) * (1 - tramo(t, T.gol2 + 0.3, T.gol2 + 1.0)) + 0.75 * tramo(t, T.furia, T.f3 + 0.3) * (1 - tramo(t, T.lanza + 0.3, T.plof));
    p.cara.rubor = p.rojo;
    p.sudor = tramo(t, T.f2 + 0.4, T.f2 + 1.0) * (1 - tramo(t, T.plof, T.plof + 0.3));
    p.enfado = tramo(t, T.furia, T.furia + 0.25) * (1 - tramo(t, T.lanza, T.lanza + 0.3));
    // manos en los mangos de sus barras 1 (cercana) y 3 (lejana); giran con la barra
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    const manoEn = (i, hombro) => {
      const m = centroMango(i, sh), phi = giroBarra(i, t), amp = Math.min(1, Math.abs(omegaBarra(i, t)) / 12);
      const q = { x: m.x + 1.6 * Math.cos(phi) * amp, y: m.y + 4.5 * Math.sin(phi) * amp };
      const h = G.aHoja(p, q);
      return { x: h.x, y: h.y, ang: 0.32 * Math.sin(phi) * amp, mu: Math.atan2(hombro.y - h.y, hombro.x - h.x) * 0.7 + (-1.75) * 0.3, puno: 1, dobla: -1 };
    };
    p.manoCerca = manoEn(1, hc);
    p.manoLejos = manoEn(3, hl);
    // se limpia la espuma de los ojos con el dorso de la mano cercana
    const limpia = tramo(t, T.limpia0, T.limpia0 + 0.18) * (1 - tramo(t, T.limpia1 - 0.12, T.limpia1 + 0.15));
    if (limpia > 0) {
      const ojo = G.cabeza(p).a({ x: 820, y: 600 }), barre = Math.sin((t - T.limpia0) * 14);
      const objetivo = { x: ojo.x - 10 + 60 * barre, y: ojo.y + 40 };
      p.manoCerca.x = lerp(p.manoCerca.x, objetivo.x, limpia); p.manoCerca.y = lerp(p.manoCerca.y, objetivo.y, limpia);
      p.manoCerca.ang = lerp(p.manoCerca.ang, 0.9, limpia); p.manoCerca.mu = lerp(p.manoCerca.mu, -2.6, limpia);
    }
    p.capaCabeza = (g, tt) => espumaCara(g, tt);
    return p;
  }

  /* =====================================================================================
   * ANDER (derecha, en espejo; azules)
   * ===================================================================================== */
  const XA = 2 * TX - XG;
  const CARAS_A = {
    inicio: E({ mx: 0.7, my: 0.5, c: 0.32, orig: 0, sonr: 0.22 }),
    ceja: E({ mx: 0.85, my: 0.05, c: 0.28, sd: 2, gd: 0.02, si: 18, gi: 0.14, orig: 0, sonr: 0.3, ancho: 0.9 }),
    sorbe: E({ mx: 0.5, my: 0.4, c: 0.55, sd: 6, gd: 0.05, si: 8, gi: 0.06, orig: 0, abre: 3, ancho: 0.45, sonr: 0.05 }),
    juega: E({ mx: 0.65, my: 0.75, c: 0.4, sd: 0, gd: 0, si: 4, gi: 0.04, orig: 0, sonr: 0.18, ancho: 0.9 }),
    mira: E({ mx: 0.9, my: 0.1, c: 0.36, sd: 4, gd: 0.02, si: 12, gi: 0.1, orig: 0, sonr: 0.1, ancho: 0.85 }),
    sonrie: E({ mx: 0.7, my: 0.8, c: 0.42, h: 0.4, sd: 6, gd: 0.04, si: 6, gi: 0.04, orig: 0, sonr: 0.62, ancho: 0.95 }),
    camara: E({ mx: -0.85, my: -0.05, c: 0.32, sd: 4, gd: 0.03, si: 16, gi: 0.12, orig: 0, sonr: 0.3, ancho: 0.9 }),
    arriba: E({ mx: 0.4, my: -1, c: 0.12, sd: 14, gd: 0.08, si: 18, gi: 0.12, orig: 0, sonr: 0.1, abre: 4, ancho: 0.7 }),
    abajo: E({ mx: 0.92, my: 0.55, c: 0.2, sd: 12, gd: 0.06, si: 16, gi: 0.1, orig: 0, sonr: 0.05, abre: 2, ancho: 0.75 }),
    respingo: E({ mx: 0.9, my: 0.4, c: 0.7, z: 0.3, sd: 10, gd: 0.06, si: 10, gi: 0.06, orig: 0, sonr: 0.0, abre: 6, ancho: 0.9 }),
    impasible: E({ mx: 0.9, my: 0.25, c: 0.4, sd: 4, gd: 0.02, si: 10, gi: 0.08, orig: 0, sonr: 0.12, ancho: 0.85 }),
    cuenta: E({ mx: 0.4, my: 0.8, c: 0.42, sd: 2, gd: 0.02, si: 6, gi: 0.04, orig: 0, sonr: 0.35, ancho: 0.9 }),
    final: E({ mx: -0.85, my: -0.05, c: 0.3, h: 0.25, sd: 6, gd: 0.04, si: 18, gi: 0.14, orig: 0, sonr: 0.55, ancho: 0.95 })
  };
  const GUION_CARA_A = [
    [T.ceja, T.ceja + 0.2, "ceja"], [T.sorbe0 + 0.05, T.sorbe0 + 0.25, "sorbe"], [T.sorbe1, T.sorbe1 + 0.2, "juega"],
    [2.0, 2.2, "mira"], [2.5, 2.7, "juega"], [T.gol1 + 0.05, T.gol1 + 0.25, "sonrie"], [T.cuenta1 - 0.1, T.cuenta1 + 0.1, "cuenta"],
    [4.45, 4.65, "juega"], [T.sorbe2, T.sorbe2 + 0.15, "sorbe"], [5.62, 5.8, "camara"], [6.1, 6.3, "juega"], [T.gol2 + 0.05, T.gol2 + 0.25, "sonrie"],
    [T.cuenta2 - 0.1, T.cuenta2 + 0.1, "cuenta"], [T.furia + 0.1, T.furia + 0.3, "mira"], [8.3, 8.5, "ceja"],
    [T.lanza + 0.08, T.lanza + 0.28, "arriba"], [9.62, 9.88, "abajo"], [T.plof + 0.03, T.plof + 0.1, "respingo"], [T.plof + 0.35, T.plof + 0.6, "impasible"],
    [T.cuenta3 - 0.1, T.cuenta3 + 0.1, "cuenta"], [T.sorbe4 - 0.05, T.sorbe4 + 0.15, "sorbe"], [T.sorbe5 - 0.05, T.sorbe5 + 0.2, "final"]
  ];
  const CUERPOS_A = {
    relax: { pel: 8, torso: 0.05, cab: 0.04 },
    sorbe: { pel: 4, torso: -0.02, cab: -0.08 },
    juega: { pel: 14, torso: 0.1, cab: 0.08 },
    atras: { pel: 6, torso: -0.04, cab: 0.02 },
    arriba: { pel: 4, torso: -0.04, cab: -0.28 },
    cuenta: { pel: 18, torso: 0.16, cab: 0.1 }
  };
  const GUION_CUERPO_A = [
    [T.sorbe0, T.sorbe0 + 0.25, "sorbe"], [T.sorbe1, T.sorbe1 + 0.3, "juega"], [T.cuenta1 - 0.15, T.cuenta1 + 0.15, "cuenta"], [T.cuenta1 + 0.45, T.cuenta1 + 0.7, "juega"],
    [T.sorbe2, T.sorbe2 + 0.25, "sorbe"], [T.sorbe3, T.sorbe3 + 0.3, "juega"], [T.cuenta2 - 0.15, T.cuenta2 + 0.15, "cuenta"], [T.cuenta2 + 0.45, T.cuenta2 + 0.7, "juega"],
    [8.2, 8.6, "atras"], [T.lanza + 0.08, T.lanza + 0.35, "arriba"], [9.62, 9.9, "juega"], [T.cuenta3 - 0.15, T.cuenta3 + 0.15, "cuenta"],
    [T.sorbe4 - 0.15, T.sorbe4 + 0.15, "sorbe"], [T.sorbe5, T.sorbe5 + 0.3, "relax"]
  ];
  const TOB_A = { cerca: A.SUELO - A.TOBILLO_ALTO, lejos: A.SUELO - A.TOBILLO_ALTO - 12 };
  const PARP_A = [1.7, 3.95, 5.15, 7.7, 10.45, 12.9];
  const R_M = A.MUNECA_R * A.JK;
  // punta del índice de una mano con dedos {indice:1} respecto a su centro (hoja), mano sin espejo propio
  function puntaIndice(mu, ang, esc) {
    const a = 0.17 * (0.4 + 0.9 * 0.25), L = 14.5, t0 = { x: 6.9 + Math.sin(a) * L, y: 4.5 + Math.cos(a) * L };
    const r1 = rot(t0, mu + Math.PI / 2);
    return rot({ x: r1.x * A.JK * esc, y: r1.y * A.JK * esc }, ang);
  }
  // nivel del vaso de Ander
  const nivelVaso = t => 0.82 - 0.12 * tramo(t, T.sorbe0 + 0.15, T.sorbe1) - 0.1 * tramo(t, T.sorbe2 + 0.15, T.sorbe3) - 0.1 * tramo(t, T.sorbe4 + 0.1, T.sorbe5);

  function poseA(t) {
    const b = linea(GUION_CUERPO_A, CUERPOS_A, "relax", t);
    const respira = Math.sin(t * 2.1 + 1), sh = temblor(t);
    const p = {
      x: XA, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: A.PELVIS.x, y: A.PELVIS.y + b.pel + respira * 1.1 }, torso: b.torso + 0.012 * Math.sin(t * 0.9),
      torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {}, cabeza: { ang: b.cab + 0.03 * Math.sin(t * 1.1), dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    const golpe = t >= T.plof ? Math.exp(-(t - T.plof) * 8) * suave(fase(t, T.plof, T.plof + 0.05)) : 0;
    p.cabeza.ang -= 0.05 * golpe;
    for (const [lado, fx] of [["cerca", XA + 30], ["lejos", XA - 34]]) {
      p.piernas[lado] = { tob: { x: A.aHoja(p, { x: fx, y: 0 }).x, y: TOB_A[lado] }, ang: 0 };
    }
    const e = linea(GUION_CARA_A, CARAS_A, "inicio", t);
    p.cara = cara(e, parpadeo(t, PARP_A));
    const Tr = A.tronco(p), hc = Tr(A.HOMBRO_C), hl = Tr(A.HOMBRO);
    // lejana: en el mango de su delantero (barra 2); da golpecitos de muñeca y corre las bolitas
    const m = centroMango(2, sh), phi = giroBarra(2, t);
    const enMango = A.aHoja(p, { x: m.x, y: m.y + 2.2 * Math.sin(phi) });
    let l = { x: enMango.x, y: enMango.y, ang: 0.35 * Math.sin(phi), mu: Math.atan2(hl.y - enMango.y, hl.x - enMango.x) * 0.7 + (-1.75) * 0.3, puno: 1, dobla: 1 };
    let ldedos = null;
    for (let j = 0; j < 3; j++) {
      const t0 = [T.cuenta1, T.cuenta2, T.cuenta3][j], [c0, c1] = CUENTA[j];
      const va = tramo(t, t0 - 0.12, c0) * (1 - tramo(t, c1 + 0.12, c1 + 0.45));
      if (va <= 0) continue;
      const bp = bolitaPos(1, bolitaAnder(j, t), sh);
      const muB = -2.45, angB = 0, esc = 1;
      const tip = puntaIndice(muB, angB, esc);
      const bh = A.aHoja(p, { x: bp.x + (bp.x > 0 ? 0 : 0), y: bp.y });
      // la yema toca la bolita por su lado de atrás (del fondo) para empujarla hacia delante
      const empuja = A.aHoja(p, { x: bp.x + 1.5, y: bp.y - bp.r * 0.9 });
      const centro = { x: empuja.x - tip.x, y: empuja.y - tip.y };
      void bh;
      const sube = { x: centro.x - 10, y: centro.y - 60 };                       // arco de ida y vuelta
      const arco = Math.sin(Math.PI * clamp(va)) * (1 - tramo(t, c0 - 0.06, c0));
      const obj = mezcla(centro, sube, 0.35 * arco);
      l = { x: lerp(l.x, obj.x, va), y: lerp(l.y, obj.y, va), ang: lerp(l.ang, angB, va), mu: lerp(l.mu, muB, va), puno: 1, dobla: 1 };
      ldedos = mezclaD(PUNO, INDICE, tramo(t, t0 - 0.05, c0 - 0.05) * (1 - tramo(t, c1 + 0.15, c1 + 0.35)));
    }
    p.manoLejos = Object.assign(l, ldedos ? { dedos: ldedos } : {});
    // cercana: sujeta el vaso a la altura del pecho y bebe
    const boca = A.boca(p);
    const pecho = Tr({ x: 240, y: 520 });
    const sorbo = tramo(t, T.sorbe0, T.sorbe0 + 0.22) * (1 - tramo(t, T.sorbe1 - 0.1, T.sorbe1 + 0.15))
      + tramo(t, T.sorbe2, T.sorbe2 + 0.22) * (1 - tramo(t, T.sorbe3 - 0.1, T.sorbe3 + 0.15))
      + tramo(t, T.sorbe4, T.sorbe4 + 0.22) * (1 - tramo(t, T.sorbe5 - 0.05, T.sorbe5 + 0.25));
    const enBoca = { x: boca.x + 46, y: boca.y + 104 };
    const brinda = campana(t, T.sorbe5 + 0.15, T.fin + 0.5) * 0.6;
    let c = mezcla(pecho, enBoca, sorbo);
    c = { x: c.x + 30 * brinda, y: c.y - 50 * brinda };
    const nv = nivelVaso(t), inclina = -0.55 * sorbo;
    p.manoCerca = { x: c.x, y: c.y, ang: inclina - 0.1 * brinda, mu: -2.0, puno: 1, dobla: -1, dedos: VASO_D,
      objeto: (g, tt) => vaso(g, nv, tt) };
    return p;
  }
  const pose = t => ({ g: poseG(t), a: poseA(t) });

  /* ---------- vaso de Ander (unidades de mano, origen en el puño) ---------- */
  const VASO = { arriba: -40, abajo: 6, ancho: 13 };
  function vaso(g, nivel, t) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const forma = () => { g.beginPath(); g.moveTo(-VASO.ancho, VASO.arriba); g.lineTo(VASO.ancho, VASO.arriba); g.lineTo(VASO.ancho * 0.86, VASO.abajo); g.lineTo(-VASO.ancho * 0.86, VASO.abajo); g.closePath(); };
    forma(); g.fillStyle = "rgba(214,236,255,0.3)"; g.fill();
    const top = lerp(VASO.abajo - 3, VASO.arriba + 5, nivel);
    g.save(); forma(); g.clip();
    g.fillStyle = "#c9781e"; g.fillRect(-VASO.ancho, top, VASO.ancho * 2, VASO.abajo - top);
    g.fillStyle = "#e8a23c"; g.fillRect(-VASO.ancho, top, VASO.ancho * 2, 3);
    g.fillStyle = "rgba(240,252,255,0.85)"; g.strokeStyle = "rgba(60,110,140,0.7)"; g.lineWidth = 0.9;
    for (const [x, y, r] of [[-4, top + 4, 0.3], [4, top + 6, -0.4]]) { g.save(); g.translate(x, y); g.rotate(r); g.beginPath(); g.rect(-3.6, -3.6, 7.2, 7.2); g.fill(); g.stroke(); g.restore(); }
    g.fillStyle = "rgba(255,255,255,0.7)"; g.fillRect(-VASO.ancho + 2.5, VASO.arriba + 3, 2.2, VASO.abajo - VASO.arriba - 6);
    g.restore();
    forma(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.7; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(-VASO.ancho * 0.86, VASO.abajo - 4, VASO.ancho * 1.72, 4);
    g.restore();
  }

  /* ---------- espuma de cerveza en la cara de Guillermo (coordenadas del retrato) ---------- */
  const MANCHAS = [[805, 470, 46, 0], [880, 560, 30, 0.06], [745, 600, 40, 0.1], [850, 690, 34, 0.04], [700, 520, 26, 0.12],
    [930, 640, 22, 0.08], [790, 790, 30, 0.14], [660, 640, 24, 0.16]];
  function espumaCara(g, t) {
    const k = tramo(t, T.plof + 0.12, T.plof + 0.22, salida);
    if (k <= 0.001) return;
    const limpia = tramo(t, T.limpia0 + 0.1, T.limpia1);
    g.save(); g.lineJoin = "round";
    // chorretones de cerveza que bajan por la cara
    for (let i = 0; i < 6; i++) {
      const x = 680 + i * 52 + 10 * hash(i + 3), y0 = 470 + 60 * hash(i + 5), largo = (40 + 60 * hash(i + 7)) * clamp((t - T.plof - 0.14) / 1.2);
      g.globalAlpha = 0.42 * k * (1 - 0.75 * limpia); g.fillStyle = "#e9b04a";
      g.beginPath(); g.moveTo(x - 7, y0); g.quadraticCurveTo(x - 9, y0 + largo * 0.6, x, y0 + largo); g.quadraticCurveTo(x + 9, y0 + largo * 0.6, x + 7, y0); g.closePath(); g.fill();
    }
    // espuma (se va al limpiarse los ojos)
    MANCHAS.forEach(([x, y, r, d], i) => {
      const a = clamp((k - d) / 0.4), ojo = (i === 0 || i === 2 || i === 1) ? 1 - limpia : 1 - 0.35 * limpia;
      const rr = r * a * (1 + 0.04 * Math.sin(t * 3 + i)) * ojo;
      if (rr < 1) return;
      g.globalAlpha = 1;
      const nube = () => { g.beginPath(); for (let j = 0; j < 5; j++) { const aa = j / 5 * Math.PI * 2 + i, cx = x + Math.cos(aa) * rr * 0.55, cy = y + Math.sin(aa) * rr * 0.4; g.moveTo(cx + rr * 0.6, cy); g.arc(cx, cy, rr * 0.6, 0, Math.PI * 2); } };
      nube(); g.lineWidth = 7; g.strokeStyle = "#7a5c40"; g.stroke();
      nube(); g.fillStyle = "#fff6e0"; g.fill();
      g.fillStyle = "#ffffff"; g.beginPath(); g.arc(x - rr * 0.25, y - rr * 0.25, rr * 0.22, 0, Math.PI * 2); g.fill();
    });
    // gotas que caen de la barbilla y de la nariz
    for (let i = 0; i < 3; i++) {
      const ph = ((t - T.plof) * (0.9 + 0.3 * i) + i * 0.37) % 1, x = [820, 905, 760][i], y = [820, 720, 830][i] + ph * 140;
      g.globalAlpha = k * Math.sin(Math.PI * ph); g.fillStyle = "#f2c25a"; g.strokeStyle = "#6b4a10"; g.lineWidth = 3;
      g.beginPath(); g.moveTo(x, y - 16); g.quadraticCurveTo(x + 10, y, x, y + 10); g.quadraticCurveTo(x - 10, y, x, y - 16); g.fill(); g.stroke();
    }
    g.restore();
  }

  /* =====================================================================================
   * DIBUJO DEL FUTBOLÍN
   * ===================================================================================== */
  let capaAtras = null, capaDelante = null;
  const MADERA = "#8a5226", MADERA_C = "#b3743c", MADERA_O = "#5a3214", TINTA = "#0b0a0e";
  function poli(g, pts) { g.beginPath(); g.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y); g.closePath(); }
  function creaCapas() {
    // capa de atrás: patas traseras, pared del fondo, campo y barandillas laterales
    capaAtras = document.createElement("canvas"); capaAtras.width = W; capaAtras.height = H;
    let g = capaAtras.getContext("2d"); g.lineJoin = "round"; g.lineCap = "round";
    const yBackBottom = YF + 4 + FRENTE * kv(1) * 0.5;
    for (const sx of [-1, 1]) {
      const x = TX + sx * (WF / 2 + 4);
      g.fillStyle = "#3a2210"; g.strokeStyle = TINTA; g.lineWidth = 2.5;
      g.beginPath(); g.rect(x - 7, yBackBottom, 14, SUELO - 12 - yBackBottom); g.fill(); g.stroke();
      g.fillStyle = "#23140a"; g.beginPath(); g.ellipse(x, SUELO - 12, 13, 4, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    // travesaño entre patas traseras
    g.fillStyle = "#2c1a0c"; g.fillRect(TX - WF / 2, SUELO - 70, WF, 9); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(TX - WF / 2, SUELO - 70, WF, 9);
    // pared del fondo (cara interior) con su portería
    const fondoIzq = P3(0, 1), fondoDer = P3(1, 1), alto = 16 * kv(1);
    g.fillStyle = MADERA_O; g.strokeStyle = TINTA; g.lineWidth = 2.5;
    g.beginPath(); g.rect(fondoIzq.x - RAIL * kv(1), fondoIzq.y - alto, fondoDer.x - fondoIzq.x + 2 * RAIL * kv(1), alto); g.fill(); g.stroke();
    g.fillStyle = "#120a06"; const pg0 = P3(0.38, 1), pg1 = P3(0.62, 1);
    g.beginPath(); g.roundRect ? g.roundRect(pg0.x, pg0.y - alto * 0.75, pg1.x - pg0.x, alto * 0.75, 2) : g.rect(pg0.x, pg0.y - alto * 0.75, pg1.x - pg0.x, alto * 0.75); g.fill();
    // campo: fieltro verde con su luz y las líneas blancas
    const campo = [P3(0, 0), P3(1, 0), P3(1, 1), P3(0, 1)];
    const gr = g.createLinearGradient(0, YF, 0, YN); gr.addColorStop(0, "#1e6b3a"); gr.addColorStop(1, "#2c8a4c");
    poli(g, campo); g.fillStyle = gr; g.fill();
    const luz = g.createRadialGradient(TX, (YN + YF) / 2, 10, TX, (YN + YF) / 2, 170); luz.addColorStop(0, "rgba(255,240,180,0.28)"); luz.addColorStop(1, "rgba(255,240,180,0)");
    poli(g, campo); g.fillStyle = luz; g.fill();
    // franjas de césped
    g.save(); poli(g, campo); g.clip();
    for (let i = 0; i < 8; i += 2) { poli(g, [P3(0, i / 8), P3(1, i / 8), P3(1, (i + 1) / 8), P3(0, (i + 1) / 8)]); g.fillStyle = "rgba(255,255,255,0.045)"; g.fill(); }
    g.strokeStyle = "rgba(255,255,255,0.75)"; g.lineWidth = 1.6;
    poli(g, [P3(0.03, 0.02), P3(0.97, 0.02), P3(0.97, 0.98), P3(0.03, 0.98)]); g.stroke();
    g.beginPath(); const m0 = P3(0.03, 0.5), m1 = P3(0.97, 0.5); g.moveTo(m0.x, m0.y); g.lineTo(m1.x, m1.y); g.stroke();
    g.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2, q = P3(0.5 + 0.12 * Math.cos(a), 0.5 + 0.1 * Math.sin(a)); if (i) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); } g.stroke();
    for (const v0 of [0.02, 0.98]) { const s = v0 < 0.5 ? 1 : -1; poli(g, [P3(0.3, v0), P3(0.7, v0), P3(0.7, v0 + s * 0.11), P3(0.3, v0 + s * 0.11)]); g.stroke(); }
    g.restore();
    poli(g, campo); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    // barandillas laterales (madera) con el alambre del marcador
    for (const sx of [-1, 1]) {
      const pts = [];
      for (const v of [0, 1]) { const k = kv(v), xi = TX + sx * Wv(v) / 2; pts.push({ x: xi, y: yv(v) }); }
      const k0 = kv(0), k1 = kv(1);
      const fuera = [{ x: TX + sx * (WN / 2 + RAIL * k0), y: YN }, { x: TX + sx * (WF / 2 + RAIL * k1), y: YF }];
      poli(g, [pts[0], pts[1], fuera[1], fuera[0]]);
      const gr2 = g.createLinearGradient(pts[0].x, 0, fuera[0].x, 0); gr2.addColorStop(0, MADERA_C); gr2.addColorStop(1, MADERA);
      g.fillStyle = gr2; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
      // alambre del marcador
      const a0 = bolitaPos(sx, VB0 - 0.02, { x: 0, y: 0 }), a1 = bolitaPos(sx, VB1 + 0.02, { x: 0, y: 0 });
      g.strokeStyle = "#c9ced6"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(a0.x, a0.y); g.lineTo(a1.x, a1.y); g.stroke();
      g.fillStyle = "#c9ced6"; for (const q of [a0, a1]) { g.beginPath(); g.arc(q.x, q.y, 1.8, 0, Math.PI * 2); g.fill(); }
      // agujero de saque en la barandilla de Ander
      if (sx > 0) { const sq = P3(1.0, 0.5); g.fillStyle = "#120a06"; g.beginPath(); g.ellipse(sq.x + 5, sq.y - 3, 5, 3.4, 0, 0, Math.PI * 2); g.fill(); }
    }
    // capa de delante: borde cercano, frente con la portería, portavasos y patas delanteras
    capaDelante = document.createElement("canvas"); capaDelante.width = W; capaDelante.height = H;
    g = capaDelante.getContext("2d"); g.lineJoin = "round"; g.lineCap = "round";
    const xl = TX - WN / 2 - RAIL, xr = TX + WN / 2 + RAIL;
    for (const x of [xl + 10, xr - 10]) {
      g.fillStyle = "#4a2a12"; g.strokeStyle = TINTA; g.lineWidth = 2.6;
      g.beginPath(); g.rect(x - 9, YN + FRENTE, 18, SUELO - YN - FRENTE - 2); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,220,170,0.18)"; g.fillRect(x - 6, YN + FRENTE + 2, 3, SUELO - YN - FRENTE - 8);
      g.fillStyle = "#23140a"; g.beginPath(); g.ellipse(x, SUELO - 2, 15, 4.5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    // borde superior cercano y frente
    g.fillStyle = MADERA_C; g.beginPath(); g.rect(xl, YN, xr - xl, 7); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    const gf = g.createLinearGradient(0, YN + 7, 0, YN + FRENTE); gf.addColorStop(0, MADERA); gf.addColorStop(1, MADERA_O);
    g.fillStyle = gf; g.beginPath(); g.rect(xl, YN + 7, xr - xl, FRENTE - 7); g.fill(); g.lineWidth = 2.5; g.stroke();
    // vetas y paneles del frente
    g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 1.5;
    for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(xl + 8, YN + 7 + i * 13); g.quadraticCurveTo(TX, YN + 10 + i * 13, xr - 8, YN + 7 + i * 13); g.stroke(); }
    g.strokeStyle = "rgba(255,230,190,0.25)"; g.lineWidth = 2; g.strokeRect(xl + 10, YN + 26, 70, 28); g.strokeRect(xr - 80, YN + 26, 70, 28);
    // boca de la portería de Guillermo
    const gx0 = P3(0.38, 0).x, gx1 = P3(0.62, 0).x;
    g.fillStyle = "#0a0604"; g.beginPath(); g.roundRect ? g.roundRect(gx0, YN + 3, gx1 - gx0, 16, 3) : g.rect(gx0, YN + 3, gx1 - gx0, 16); g.fill();
    g.strokeStyle = "#c9ced6"; g.lineWidth = 2; g.stroke();
    // bandeja de la bola, abajo
    g.fillStyle = "#1a1210"; g.beginPath(); g.roundRect ? g.roundRect(TX - 22, YN + FRENTE - 16, 44, 11, 3) : g.rect(TX - 22, YN + FRENTE - 16, 44, 11); g.fill(); g.strokeStyle = "#c9ced6"; g.lineWidth = 1.5; g.stroke();
    // portavasos cromados en el frente: el de Guillermo (con su jarra) y el de Ander (vacío)
    for (const x of [PINTA.x, 2 * TX - PINTA.x]) {
      g.fillStyle = "#8d939c"; g.strokeStyle = TINTA; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(x - 6, PINTA.y - 14); g.lineTo(x + 6, PINTA.y - 14); g.lineTo(x + 4, PINTA.y - 2); g.lineTo(x - 4, PINTA.y - 2); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#c9ced6"; g.beginPath(); g.ellipse(x, PINTA.y, 17, 5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = "#5c6168"; g.beginPath(); g.ellipse(x, PINTA.y, 12.5, 3.3, 0, 0, Math.PI * 2); g.fill();
    }
  }
  // un muñequito colgado de su barra: phi gira sobre el eje de la barra (escala vertical cos φ)
  function munneco(g, x, y, k, phi, col, blur) {
    const c = Math.cos(phi), s = Math.sin(phi), frente = c >= 0;
    g.save(); g.translate(x, y); g.scale(k, k);
    if (blur > 0.05) {
      g.globalAlpha = 0.32 * blur; g.fillStyle = col[0];
      g.beginPath(); g.ellipse(0, 0, 5.2, 13, 0, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 0.6 * blur; g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 1.1;
      g.beginPath(); g.ellipse(0, 0, 6, 13.5, 0, -1.2, 0.3); g.stroke();
      g.beginPath(); g.ellipse(0, 0, 6, 13.5, 0, 1.9, 3.4); g.stroke();
      g.globalAlpha = 1 - 0.55 * blur;
    }
    g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = TINTA; g.lineWidth = 1.4;
    const fy = y0 => y0 * c, depth = y0 => -y0 * s * 0.18;     // al girar, la pierna se va hacia el fondo o hacia delante
    const cuerpo = frente ? col[0] : col[1];
    // pierna y pie (paleta)
    g.fillStyle = cuerpo; g.beginPath(); g.moveTo(-2.4, fy(3)); g.lineTo(2.4, fy(3)); g.lineTo(2.8 + depth(11), fy(11)); g.lineTo(-2.8 + depth(11), fy(11)); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#111"; g.beginPath(); g.ellipse(depth(12), fy(12), 3.6, Math.max(0.6, 1.6 * Math.abs(c)), 0, 0, Math.PI * 2); g.fill();
    // tronco (camiseta)
    g.fillStyle = cuerpo; g.beginPath(); g.moveTo(-3.6, fy(-5)); g.lineTo(3.6, fy(-5)); g.lineTo(3.2, fy(3.5)); g.lineTo(-3.2, fy(3.5)); g.closePath(); g.fill(); g.stroke();
    if (frente) { g.fillStyle = "rgba(255,255,255,0.85)"; g.fillRect(-0.8, fy(-3.5), 1.6, Math.abs(fy(4))); }
    // cabeza
    g.fillStyle = frente ? "#f2c9a0" : "#3a2414"; g.beginPath(); g.ellipse(0, fy(-8.4), 2.9, Math.max(0.8, 2.9 * Math.abs(c)), 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
  }
  function barras(g, t, sh, b) {
    // de lejos a cerca; la bola se mete en su profundidad
    const orden = BARRAS.map((r, i) => i).sort((p, q) => BARRAS[q].v - BARRAS[p].v);
    let bolaPintada = !(b && b.modo === "campo");
    for (const i of orden) {
      const r = BARRAS[i];
      if (!bolaPintada && b.v > r.v) { pintaBolaCampo(g, b, sh); bolaPintada = true; }
      const m = mango(i), k = m.k, phi = giroBarra(i, t), du = deslizaBarra(i, t), w = Math.abs(omegaBarra(i, t));
      const xa = TX - Wv(r.v) / 2 - RAIL * k - 6, xb = TX + Wv(r.v) / 2 + RAIL * k + 6;
      const desliza = du * Wv(r.v);
      // barra cromada
      g.save(); g.translate(sh.x, sh.y); g.lineCap = "round";
      const x0 = Math.min(xa, m.x2) + desliza, x1 = Math.max(xb, m.x2) + desliza;
      g.strokeStyle = TINTA; g.lineWidth = 3.4 * k; g.beginPath(); g.moveTo(x0, m.y); g.lineTo(x1, m.y); g.stroke();
      g.strokeStyle = "#d9dde3"; g.lineWidth = 1.8 * k; g.stroke();
      g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 0.7 * k; g.beginPath(); g.moveTo(x0, m.y - 0.6 * k); g.lineTo(x1, m.y - 0.6 * k); g.stroke();
      // tope del lado sin mango
      const xt = m.lado < 0 ? xb + desliza : xa + desliza;
      g.fillStyle = "#c9ced6"; g.strokeStyle = TINTA; g.lineWidth = 1.2; g.beginPath(); g.arc(xt, m.y, 2.6 * k, 0, Math.PI * 2); g.fill(); g.stroke();
      // mango negro
      const gx1 = m.x1 + desliza, gx2 = m.x2 + desliza;
      g.strokeStyle = TINTA; g.lineWidth = 9 * k; g.beginPath(); g.moveTo(gx1, m.y); g.lineTo(gx2, m.y); g.stroke();
      g.strokeStyle = "#2a2a30"; g.lineWidth = 6.6 * k; g.stroke();
      g.strokeStyle = "rgba(255,255,255,0.25)"; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(gx1, m.y - 2 * k); g.lineTo(gx2, m.y - 2 * k); g.stroke();
      // estrías del mango que giran con la barra
      g.strokeStyle = "rgba(255,255,255,0.22)"; g.lineWidth = 1;
      for (let j = 0; j < 4; j++) { const ph = ((phi / (Math.PI * 2) + j / 4) % 1 + 1) % 1, yy = m.y + Math.cos(ph * Math.PI * 2) * 3 * k;
        if (Math.sin(ph * Math.PI * 2) > 0) { g.beginPath(); g.moveTo(gx1 + 3 * m.lado, yy); g.lineTo(gx2 - 3 * m.lado, yy); g.stroke(); } }
      g.restore();
      // muñecos
      const blur = clamp((w - 9) / 14);
      for (const u of POS_U[r.n]) {
        const q = P3(u + du, r.v);
        g.save(); g.fillStyle = "rgba(0,0,0,0.22)"; g.beginPath(); g.ellipse(q.x + sh.x, q.y + sh.y, 5 * k, 1.8 * k, 0, 0, Math.PI * 2); g.fill(); g.restore();
        munneco(g, q.x + sh.x, m.y + sh.y, k * 1.05, phi, COL[r.d], blur);
      }
    }
    if (!bolaPintada) pintaBolaCampo(g, b, sh);
  }
  function pintaBolaCampo(g, b, sh) {
    if (b.v < 0) return;
    const q = P3(b.u, b.v, b.h), q0 = P3(b.u, b.v, 0), k = kv(b.v), r = 4.6 * k;
    g.save(); g.translate(sh.x, sh.y);
    g.fillStyle = "rgba(0,0,0,0.3)"; g.beginPath(); g.ellipse(q0.x, q0.y + r * 0.4, r * 1.1, r * 0.4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fffaf0"; g.strokeStyle = TINTA; g.lineWidth = 1.3; g.beginPath(); g.arc(q.x, q.y - r * 0.6, r, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#d8cdb8"; g.beginPath(); g.arc(q.x + r * 0.25, q.y - r * 0.4, r * 0.55, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(q.x - r * 0.35, q.y - r * 0.95, r * 0.28, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function bolitas(g, t, sh) {
    for (const sx of [-1, 1]) for (let j = 0; j < 5; j++) {
      const v = sx > 0 ? bolitaAnder(j, t) : VB1 - (4 - j) * 0.04, q = bolitaPos(sx, v, sh);
      g.fillStyle = sx > 0 ? "#3a7ee6" : "#e04a4a"; g.strokeStyle = TINTA; g.lineWidth = 1.1;
      g.beginPath(); g.arc(q.x, q.y - q.r * 0.3, q.r, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.75)"; g.beginPath(); g.arc(q.x - q.r * 0.3, q.y - q.r * 0.65, q.r * 0.3, 0, Math.PI * 2); g.fill();
    }
  }
  // líneas de movimiento alrededor de las manos de Guillermo cuando gira como un loco
  function lineasGiro(g, t, sh) {
    const f = frenesi(t); if (f < 0.25) return;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.75 * (f - 0.25)})`; g.lineWidth = 2; g.lineCap = "round";
    for (const i of [1, 3]) {
      const m = centroMango(i, sh), phi = giroBarra(i, t);
      for (let j = 0; j < 2; j++) { const a0 = phi + j * Math.PI; g.beginPath(); g.ellipse(m.x - 6, m.y, 9, 17, 0, a0, a0 + 1.1); g.stroke(); }
    }
    g.restore();
  }
  // humo de las barras recalentadas (frenesí final)
  function humo(g, t, sh) {
    const k = tramo(t, T.f3 + 0.3, T.f3 + 0.6) * (1 - tramo(t, T.lanza + 0.6, T.lanza + 1.8)); if (k <= 0.01) return;
    g.save();
    for (let i = 0; i < 8; i++) {
      const ph = (t * 0.9 + i / 8) % 1, base = centroMango(i % 2 ? 3 : 1, sh);
      const x = base.x + 24 + 10 * Math.sin(t * 2 + i) + 20 * ph, y = base.y - 8 - 70 * ph;
      g.globalAlpha = 0.5 * k * Math.sin(Math.PI * ph); g.fillStyle = i % 2 ? "#cfcac4" : "#a39e98";
      g.beginPath(); g.arc(x, y, 5 + 12 * ph, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  function estrellaPuntas(g, x, y, r, puntas, rotac, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rotac + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function impacto(g, t, t0, x, y, tam, dur = 0.28) {
    const k = fase(t, t0, t0 + dur); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    estrellaPuntas(g, x, y, tam * (0.55 + 0.7 * salida(k)), 10, 0.3, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2.4; g.strokeStyle = TINTA; g.stroke();
    estrellaPuntas(g, x, y, tam * (0.3 + 0.45 * salida(k)), 10, 0.6, 0.5); g.fillStyle = "#ffffff"; g.fill();
    g.strokeStyle = "#ffffff"; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2, r0 = tam * (0.8 + 0.8 * k), r1 = r0 + tam * 0.45; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // estela del chut de Ander (rayas detrás de la bola)
  function estelaChut(g, t, sh) {
    for (const [tc, tg, u0, u1] of [[T.chuta1, T.gol1, 0.5, 0.57], [T.chuta2, T.gol2, 0.44, 0.6]]) {
      const k = fase(t, tc, tg + 0.08); if (k <= 0 || k >= 1) continue;
      const kb = Math.min(1, fase(t, tc, tg)), q = P3(lerp(u0, u1, kb), lerp(0.345, -0.03, kb)), q0 = P3(u0, 0.345);
      g.save(); g.translate(sh.x, sh.y); g.strokeStyle = `rgba(255,255,255,${0.8 * (1 - k)})`; g.lineCap = "round";
      for (let j = -1; j <= 1; j++) { g.lineWidth = 2 - Math.abs(j) * 0.6; g.beginPath(); g.moveTo(lerp(q0.x, q.x, 0.25) + j * 3, lerp(q0.y, q.y, 0.25) - 3); g.lineTo(q.x + j * 3, q.y - 3); g.stroke(); }
      g.restore();
    }
  }

  /* ---------- jarra de Guillermo (pantalla) ---------- */
  function jarra(g, t) {
    const x = PINTA.x, y = PINTA.y, hunde = t >= T.plof ? 1 : 0;
    const sacude = t >= T.plof ? Math.exp(-(t - T.plof) * 8) * Math.sin((t - T.plof) * 40) * 2.5 : 0;
    const nivel = t < T.plof ? 0.84 : lerp(0.84, 0.6, tramo(t, T.plof, T.plof + 0.2));
    const top = -50, bot = 0, wTop = 15, wBot = 12;
    g.save(); g.translate(x + sacude, y); g.lineJoin = "round";
    // asa
    g.strokeStyle = TINTA; g.lineWidth = 5.5; g.beginPath(); g.moveTo(-wTop + 1, top + 10); g.bezierCurveTo(-wTop - 13, top + 10, -wTop - 13, -12, -wBot + 1, -12); g.stroke();
    g.strokeStyle = "#e3eef6"; g.lineWidth = 2.6; g.stroke();
    const forma = () => { g.beginPath(); g.moveTo(-wTop, top); g.lineTo(wTop, top); g.lineTo(wBot, bot); g.lineTo(-wBot, bot); g.closePath(); };
    forma(); g.fillStyle = "rgba(214,236,255,0.25)"; g.fill();
    const yb = lerp(bot - 3, top + 4, nivel);
    g.save(); forma(); g.clip();
    g.fillStyle = "#f5aa1d"; g.fillRect(-wTop, yb, wTop * 2, bot - yb);
    g.fillStyle = "rgba(207,122,11,0.5)"; g.fillRect(-wTop, bot - 14, wTop * 2, 14);
    g.fillStyle = "#fff8e8"; g.fillRect(-wTop, yb - 5, wTop * 2, 6);
    g.fillStyle = "#ffd25c"; for (let i = 0; i < 5; i++) { const ph = (t * 0.7 + hash(i) * 0.9) % 1; g.beginPath(); g.arc(-9 + i * 4.5, bot - 4 - ph * (bot - yb - 6), 0.9, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "rgba(255,255,255,0.7)"; g.fillRect(-wTop + 3, top + 4, 2.5, bot - top - 8);
    g.restore();
    // la bola flotando en la espuma
    if (hunde) {
      const k = fase(t, T.plof, T.plof + 0.25), yy = lerp(top - 6, yb - 3, salida(k)) + 1.2 * Math.sin(t * 5);
      g.fillStyle = "#fffaf0"; g.strokeStyle = TINTA; g.lineWidth = 1.3; g.beginPath(); g.arc(2, yy, 5, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = "#d8cdb8"; g.beginPath(); g.arc(3.5, yy + 1.4, 2.6, 0, Math.PI * 2); g.fill();
      // espuma que rebosa y chorrea por el cristal
      const reb = tramo(t, T.plof + 0.02, T.plof + 0.4);
      g.fillStyle = "#fff8e8"; g.strokeStyle = "#7a5c40"; g.lineWidth = 1.4;
      g.beginPath(); for (let i = 0; i < 4; i++) { const cx = -wTop + 4 + i * 8.6; g.moveTo(cx + 6, top); g.arc(cx, top - 1, 5.5 * reb + 1, 0, Math.PI * 2); } g.fill(); g.stroke();
      for (const [cx, L] of [[-wTop + 1, 20], [wTop - 2, 30]]) { const l = L * reb * (0.85 + 0.15 * Math.sin(t * 2 + cx)); g.beginPath(); g.ellipse(cx, top + l * 0.5, 3, l * 0.5 + 2, 0, 0, Math.PI * 2); g.fill(); g.stroke(); }
    }
    forma(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.restore();
  }
  // ¡plof!: chorro de cerveza que sale de la jarra hacia la cara de Guillermo
  function salpicon(g, t, pg) {
    const k = fase(t, T.plof, T.plof + 0.7); if (k <= 0 || k >= 1) return;
    const cara0 = G.aPantalla(pg, G.cabeza(pg).a({ x: 820, y: 640 }));
    g.save(); g.lineCap = "round";
    for (let i = 0; i < 22; i++) {
      const d = 0.75 + 0.5 * hash(i + 11), tt = k * 4.2 * d;
      if (tt > 1.35) continue;
      const objetivo = { x: cara0.x + (hash(i + 3) - 0.5) * 80, y: cara0.y + (hash(i + 5) - 0.5) * 70 };
      const x = lerp(BOCA_PINTA.x, objetivo.x, Math.min(1, tt)) + (tt > 1 ? (tt - 1) * 30 * (hash(i + 7) - 0.5) : 0);
      const y = lerp(BOCA_PINTA.y, objetivo.y, Math.min(1, tt)) - 90 * Math.sin(Math.PI * Math.min(1, tt)) + (tt > 1 ? 200 * (tt - 1) * (tt - 1) : 0);
      const r = (2.5 + 3.5 * hash(i + 9)) * (1 - 0.4 * k);
      g.globalAlpha = 1 - clamp((tt - 1) / 0.35);
      g.fillStyle = i % 3 ? "#f5aa1d" : "#fff8e8"; g.strokeStyle = "#6b4a10"; g.lineWidth = 1.2;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    // columna de cerveza que sube al principio
    const col = campana(t, T.plof, T.plof + 0.28);
    if (col > 0.02) {
      g.globalAlpha = 1; g.fillStyle = "#f5aa1d"; g.strokeStyle = "#6b4a10"; g.lineWidth = 1.6;
      const h = 70 * col;
      g.beginPath(); g.moveTo(BOCA_PINTA.x - 8, BOCA_PINTA.y); g.quadraticCurveTo(BOCA_PINTA.x - 10, BOCA_PINTA.y - h * 0.6, BOCA_PINTA.x - 4 - 14 * col, BOCA_PINTA.y - h);
      g.quadraticCurveTo(BOCA_PINTA.x + 6, BOCA_PINTA.y - h * 0.7, BOCA_PINTA.x + 8, BOCA_PINTA.y); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#fff8e8"; g.beginPath(); g.arc(BOCA_PINTA.x - 4 - 14 * col, BOCA_PINTA.y - h, 6 * col + 2, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    g.restore();
  }
  // la bola por el aire tras el pelotazo
  function bolaAire(g, b, t) {
    const vel = 1;
    g.save();
    // estela
    g.strokeStyle = "rgba(255,255,255,0.55)"; g.lineCap = "round";
    for (let j = 1; j <= 4; j++) {
      const bb = bola(t - j * 0.018); if (!bb || bb.modo !== "aire") break;
      g.globalAlpha = 0.5 - j * 0.1; g.lineWidth = b.r * 1.6 * (1 - j * 0.18); g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(bb.x, bb.y); g.stroke();
    }
    g.globalAlpha = 1; void vel;
    g.translate(b.x, b.y); g.rotate(b.giro);
    g.fillStyle = "#fffaf0"; g.strokeStyle = TINTA; g.lineWidth = 1.4; g.beginPath(); g.arc(0, 0, b.r, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#d8cdb8"; g.beginPath(); g.arc(b.r * 0.3, b.r * 0.2, b.r * 0.5, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  /* =====================================================================================
   * DECORADO: sala de juegos retro
   * ===================================================================================== */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 140; const g = c.getContext("2d");
    g.translate(60, 70);
    // pared crema con rayas setenteras
    const pared = g.createLinearGradient(0, -70, 0, 440); pared.addColorStop(0, "#c9a878"); pared.addColorStop(1, "#e4c89a");
    g.fillStyle = pared; g.fillRect(-60, -70, W + 120, 520);
    const RAYAS = [["#5a2e16", 16], ["#c8642a", 22], ["#e0a83a", 18], ["#f1d9a6", 10], ["#8a4a20", 12]];
    let y = 150;
    for (const [col, h] of RAYAS) { g.fillStyle = col; g.fillRect(-60, y, W + 120, h); y += h; }
    g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(-60, 150, W + 120, 3);
    // luz cálida sobre el futbolín
    const foco = g.createRadialGradient(TX, 260, 20, TX, 260, 460); foco.addColorStop(0, "rgba(255,226,160,0.45)"); foco.addColorStop(0.6, "rgba(255,190,110,0.12)"); foco.addColorStop(1, "rgba(255,190,110,0)");
    g.fillStyle = foco; g.fillRect(-60, -70, W + 120, 520);
    // guirnalda de banderines (sin letras)
    g.strokeStyle = "#3a2414"; g.lineWidth = 2; g.beginPath(); g.moveTo(-60, 22); g.quadraticCurveTo(W / 2, 74, W + 60, 22); g.stroke();
    const cols = ["#d8323a", "#2f6fd6", "#f2c14e", "#2c8a4c", "#ffffff"];
    for (let i = 0; i < 17; i++) {
      const x = -30 + i * 66, k = (x + 60) / (W + 120), yy = 22 + 4 * 52 * k * (1 - k);
      g.fillStyle = cols[i % cols.length]; g.strokeStyle = "#2a1a10"; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(x - 13, yy); g.lineTo(x + 13, yy); g.lineTo(x, yy + 28); g.closePath(); g.fill(); g.stroke();
    }
    // póster con un balón (izquierda) y bufanda colgada (derecha)
    g.fillStyle = "#3b2414"; g.fillRect(84, 220, 104, 132); g.fillStyle = "#2c8a4c"; g.fillRect(92, 228, 88, 116);
    g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 2; g.strokeRect(98, 234, 76, 104); g.beginPath(); g.moveTo(98, 286); g.lineTo(174, 286); g.stroke();
    g.save(); g.translate(136, 286); g.fillStyle = "#ffffff"; g.strokeStyle = TINTA; g.lineWidth = 2.2; g.beginPath(); g.arc(0, 0, 24, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#151318"; g.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; g.lineTo(Math.cos(a) * 9, Math.sin(a) * 9); } g.closePath(); g.fill();
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; g.save(); g.rotate(a); g.beginPath(); g.moveTo(9, 0); g.lineTo(22, 0); g.stroke(); g.restore(); }
    g.restore();
    g.save(); g.translate(880, 210); g.lineJoin = "round";
    g.fillStyle = "#5a5a62"; g.beginPath(); g.arc(0, 0, 5, 0, Math.PI * 2); g.fill();
    for (const [dx, largo] of [[-16, 150], [16, 128]]) {
      g.save(); g.beginPath(); g.moveTo(dx - 11, 4); g.lineTo(dx + 11, 4); g.lineTo(dx + 9, largo); g.lineTo(dx - 13, largo); g.closePath(); g.clip();
      for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? "#ffffff" : "#c8282e"; g.fillRect(dx - 14, 4 + i * 14, 30, 14); }
      g.restore();
      g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(dx - 11, 4); g.lineTo(dx + 11, 4); g.lineTo(dx + 9, largo); g.lineTo(dx - 13, largo); g.closePath(); g.stroke();
      g.strokeStyle = "#c8282e"; g.lineWidth = 1.5; for (let j = 0; j < 5; j++) { g.beginPath(); g.moveTo(dx - 11 + j * 5, largo); g.lineTo(dx - 12 + j * 5, largo + 12); g.stroke(); }
    }
    g.restore();
    // zócalo de madera oscura
    const mad = g.createLinearGradient(0, 410, 0, SUELO); mad.addColorStop(0, "#4a2a16"); mad.addColorStop(1, "#2a160a");
    g.fillStyle = mad; g.fillRect(-60, 410, W + 120, SUELO - 410);
    g.fillStyle = "#7a4824"; g.fillRect(-60, 404, W + 120, 10); g.fillStyle = "#a8683a"; g.fillRect(-60, 404, W + 120, 3);
    g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = 2; for (let x = -40; x < W + 60; x += 96) { g.strokeRect(x, 426, 80, SUELO - 440); }
    // suelo de baldosas de barro
    const su = g.createLinearGradient(0, SUELO, 0, H + 70); su.addColorStop(0, "#a8582e"); su.addColorStop(1, "#5e2c14");
    g.fillStyle = su; g.fillRect(-60, SUELO, W + 120, H + 70 - SUELO);
    g.strokeStyle = "rgba(40,16,6,0.45)"; g.lineWidth = 2;
    for (let yy = SUELO + 12; yy < H + 70; yy += 14 + (yy - SUELO) * 0.35) { g.beginPath(); g.moveTo(-60, yy); g.lineTo(W + 60, yy); g.stroke(); }
    for (let i = -14; i <= 14; i++) { g.beginPath(); g.moveTo(TX + i * 44, SUELO); g.lineTo(TX + i * 90, H + 70); g.stroke(); }
    g.fillStyle = "rgba(255,220,170,0.18)"; g.fillRect(-60, SUELO, W + 120, 2);
    // lámpara alargada de billar sobre el futbolín
    for (const sx of [-1, 1]) { g.strokeStyle = "#1a1a1e"; g.lineWidth = 2; g.beginPath(); g.moveTo(TX + sx * 70, -70); g.lineTo(TX + sx * 70, 92); g.stroke(); }
    g.fillStyle = "#1f5a3a"; g.strokeStyle = TINTA; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(TX - 120, 118); g.lineTo(TX - 96, 90); g.lineTo(TX + 96, 90); g.lineTo(TX + 120, 118); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#2c7a50"; g.fillRect(TX - 94, 93, 188, 6);
    g.fillStyle = "#fff0c0"; g.beginPath(); g.ellipse(TX - 50, 118, 26, 5, 0, 0, Math.PI * 2); g.ellipse(TX + 50, 118, 26, 5, 0, 0, Math.PI * 2); g.fill();
    const cono = g.createLinearGradient(0, 118, 0, 380); cono.addColorStop(0, "rgba(255,236,180,0.34)"); cono.addColorStop(1, "rgba(255,236,180,0)");
    g.fillStyle = cono; g.beginPath(); g.moveTo(TX - 118, 118); g.lineTo(TX + 118, 118); g.lineTo(TX + 250, 380); g.lineTo(TX - 250, 380); g.closePath(); g.fill();
    // viñeta
    const v = g.createRadialGradient(512, 300, 300, 512, 300, 720); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.5)");
    g.fillStyle = v; g.fillRect(-60, -70, W + 120, H + 140);
    return c;
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const tension = tramo(t, T.f3 - 0.4, T.f3 + 0.4) * (1 - tramo(t, T.plof + 0.6, T.plof + 1.6));
    const fin = tramo(t, T.cuenta3 - 0.2, T.fin);
    return { k: 1.15 + 0.07 * tension + 0.02 * fin, x: 512 - 42 * tension, y: 326 - 6 * tension + 2 * fin };
  }

  class Futbolin extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !A.listo()) return;
      if (!fondo) fondo = creaFondo();
      if (!capaAtras) creaCapas();
      const P = pose(t), pg = P.g, pa = P.a;
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t), sh = temblor(t), b = bola(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      g.drawImage(fondo, -60, -70);
      // sombras en el suelo
      g.save(); g.fillStyle = "rgba(0,0,0,0.34)";
      g.beginPath(); g.ellipse(TX, SUELO - 4, 200, 12, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pg.x - 4, SUELO + 1, 105, 9, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pa.x, SUELO + 1, 95, 8, 0, 0, Math.PI * 2); g.fill(); g.restore();
      // futbolín: fondo, barras con sus muñecos y la bola, frente
      g.drawImage(capaAtras, sh.x, sh.y);
      bolitas(g, t, sh);
      barras(g, t, sh, b);
      estelaChut(g, t, sh);
      g.drawImage(capaDelante, sh.x, sh.y);
      // los dos jugadores
      G.dibujar(g, pg, t);
      A.dibujar(g, pa, t);
      // jarra de Guillermo en su portavasos (delante de su mano)
      g.save(); g.translate(sh.x, sh.y); jarra(g, t); g.restore();
      lineasGiro(g, t, sh);
      humo(g, t, sh);
      // goles y pelotazo
      const pGol = P3(0.58, 0);
      impacto(g, t, T.gol1, pGol.x + sh.x, YN + 10, 20);
      impacto(g, t, T.gol2, P3(0.6, 0).x + sh.x, YN + 10, 22);
      const pl = P3(0.47, 0.475);
      impacto(g, t, T.lanza, pl.x + sh.x, pl.y - 6 + sh.y, 26);
      if (b && b.modo === "aire") bolaAire(g, b, t);
      salpicon(g, t, pg);
      impacto(g, t, T.plof, BOCA_PINTA.x, BOCA_PINTA.y - 6, 18, 0.22);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00031", nombre: "Guillermo y Ander · El futbolín", crear: () => new Futbolin() });
  window.__A2D_00031 = { pose, T, DUR, bola };
})();
