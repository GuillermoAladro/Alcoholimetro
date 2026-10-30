"use strict";
/* 00071 · Guillermo y Gabacho · El penalti
 *
 * Negro → el patio trasero del bar a la hora azul: tapia de ladrillo, la puerta de atrás con su
 * aplique, cajas de cerveza, un barril, una guirnalda de bombillas y, sobre un trozo de césped
 * artificial, una portería pequeñita (más baja que el portero) con la red abombada.
 * Gabacho, de portero, calienta muy teatral: molinillos con los brazos, zancadas con las manos en la
 * rodilla, sacude brazos y piernas, se da dos palmadas y se pone en guardia. Guillermo, con el balón en
 * las manos, lo suelta con mimo, lo para con la suela y lo coloca en el punto rodándolo a un lado y a
 * otro; levanta el pie despacio («quieto…») y asiente → retrocede contando los pasos con los dedos
 * (uno, dos, tres), mide la portería, decide que no es bastante y recula hasta salir de plano por la
 * izquierda → Gabacho se queda solo, se asoma, mira a cámara y se encoge de hombros («bof») → una
 * polvareda: Guillermo vuelve a toda carrera (líneas de velocidad), frena derrapando, hace unos
 * pasitos de bailarín con amagos (Gabacho los sigue con el cuerpo), arma la pierna… y la puntera se
 * clava en el césped: ¡crac!, terrones y polvo. El balón, apenas rozado, rueda despacito, despacito,
 * y se para justo delante de la bota de Gabacho → Guillermo se queda congelado, se pone rojo, se
 * agarra la pierna y salta a la pata coja con lágrimas, mientras a la bota le late la puntera →
 * Gabacho, sin agacharse, se sube el balón con la puntera a las manos, se lo pone en la cadera, bosteza
 * y lo lanza a la punta del índice, donde lo hace girar; guiño a cámara. Guillermo, a la pata coja,
 * mira a cámara haciendo pucheros → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`. El balón es un icosaedro truncado de verdad que
 * se proyecta en cada fotograma (rueda sobre el eje de profundidad y gira sobre el vertical en el
 * dedo). Los pies que apoyan están quietos en el mundo (pantalla) y se pasan a la hoja con aHoja.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, GB = Gabacho;
  const S = 0.29, SUELO = 552, XD = 830, DUR = 14.4;
  const RB = 21, GRAV = 1800, TINTA = "#0b0a0e";
  const X_PUNTO = 500;                                  // punto de penalti (centro del balón)
  const BASE_PORT = 528;                                // pie de la portería (línea de gol, más al fondo)
  const PX0 = 700, PX1 = 985, P_ALTO = 205;             // postes delanteros y altura del larguero
  const P_FONDO = { x: 34, y: -24 };                    // profundidad de la portería (hacia el fondo)

  const T = {
    // Guillermo coloca el balón con la suela
    mira: 0.3, sube0: 0.42, sube1: 0.8, suelta: 0.9, cae: 1.3, pisa: 1.37,
    rueda: [[1.3, 478], [1.4, 478], [1.64, 506], [1.85, 494], [2.04, 500]],
    quita0: 2.08, quita1: 2.52, bajaPie: 2.8, asiente: 2.84,
    pasos: [3.0, 3.42, 3.84], durPaso: 0.36,
    mas0: 4.28, mas1: 4.72,
    atras0: 4.75,
    // carrera, amagos y la patada
    corre0: 6.3, frena0: 7.2, frena1: 7.5, chop0: 7.5, chop1: 7.98, planta: 8.18,
    arma0: 8.02, arma1: 8.22, golpe: 8.3, empuja: 8.38,
    duele: 8.85, agarra0: 8.9, agarra1: 9.12, salto0: 9.16, salto1: 12.6, gCam: 12.8,
    // el balón
    para: 11.1,
    // Gabacho
    molino0: 0.2, molino1: 1.62, zanc0: 1.62, zanc1: 2.8, sacude0: 2.8, sacude1: 3.42, palmas: [3.52, 3.72], guardia0: 3.82,
    asoma: 5.72, bof0: 5.98, bof1: 6.3, polvo: 6.3, vuelve0: 6.36, vuelve1: 6.56,
    fintas: [7.56, 7.72, 7.88],
    ay: 8.3, relaja0: 8.62, relaja1: 9.1, dCam0: 9.55, dCam1: 10.25,
    flick0: 11.15, flick1: 11.4, pop: 11.47, atrapa: 11.76, cadera0: 11.84, cadera1: 12.08,
    bosteza0: 12.06, bosteza1: 12.56, lanza0: 12.5, lanza: 12.64, dedo: 12.92, dCam: 13.1, guino: 13.36,
    fin: 13.92
  };

  /* ---------- utilidades ---------- */
  const P = (x, y) => ({ x, y });
  const rotP = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  // interpolación cúbica monótona por claves [t, v1, v2…] (sin rebasar: los tramos iguales se quedan quietos)
  function pista(K, t) {
    const n = K.length;
    if (t <= K[0][0]) return K[0].slice(1);
    if (t >= K[n - 1][0]) return K[n - 1].slice(1);
    let i = 0; while (t > K[i + 1][0]) i++;
    const h = K[i + 1][0] - K[i][0], u = (t - K[i][0]) / h, u2 = u * u, u3 = u2 * u, out = [];
    const tg = (j, c) => {
      if (j <= 0 || j >= n - 1) return 0;
      const h0 = K[j][0] - K[j - 1][0], h1 = K[j + 1][0] - K[j][0];
      const a = (K[j][c] - K[j - 1][c]) / h0, b = (K[j + 1][c] - K[j][c]) / h1;
      if (a * b <= 0) return 0;
      const w1 = 2 * h1 + h0, w2 = h1 + 2 * h0;
      return (w1 + w2) / (w1 / a + w2 / b);
    };
    for (let c = 1; c < K[i].length; c++)
      out.push((2 * u3 - 3 * u2 + 1) * K[i][c] + (u3 - 2 * u2 + u) * h * tg(i, c) + (-2 * u3 + 3 * u2) * K[i + 1][c] + (u3 - u2) * h * tg(i + 1, c));
    return out;
  }
  // parábola que pasa por a (en t0) y por b (en t1) con gravedad constante
  function vuelo(t0, a, t1, b, t) {
    const d = t1 - t0, u = clamp(t - t0, 0, d), vx = (b.x - a.x) / d, vy0 = (b.y - a.y) / d - 0.5 * GRAV * d;
    return P(a.x + vx * u, a.y + vy0 * u + 0.5 * GRAV * u * u);
  }

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.12, lengua: 0, esp: 0, mof: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  function parpadeo(t, lista) {
    let o = 0;
    for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); }
    return o;
  }
  // la mirada sigue a un punto de la pantalla (para Gabacho, que mira a la izquierda, se invierte la x)
  function miraA(R, p, q, ojo, w) {
    if (!q || w <= 0) return;
    const o = R.aPantalla(p, R.cabeza(p).a(ojo)), dx = (q.x - o.x) * (p.espejo ? -1 : 1), dy = q.y - o.y, d = Math.hypot(dx, dy) || 1;
    p.cara.mirada = mezcla(p.cara.mirada, P(clamp(dx / d * 1.1, -1, 1), clamp(dy / d * 1.1, -1, 1)), w);
  }
  const OJO_G = P(835, 585), OJO_B = P(830, 510);

  /* ---------- manos ---------- */
  const CERO = { pulgar: 0, indice: 0, medio: 0, anular: 0, menique: 0 };
  const todos = k => ({ pulgar: k, indice: k, medio: k, anular: k, menique: k });
  const dedosDe = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m, anular: a, menique: me });
  const M = (x, y, mu, puno, dedos, dobla, ang = 0) => ({ x, y, mu, ang, puno, dedos, dobla });
  function mezM(a, b, k) {
    const d = {}; for (const n in a.dedos) d[n] = lerp(a.dedos[n], b.dedos[n], k);
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), mu: lerp(a.mu, b.mu, k), ang: lerp(a.ang, b.ang, k), puno: lerp(a.puno, b.puno, k), dedos: d, dobla: lerp(a.dobla, b.dobla, k) };
  }
  // guion de una mano: cada clave en coordenadas del tronco (se pasan a la hoja con Tr)
  function rutaMano(t, lista, ini, Tr) {
    const aH = m => { const q = Tr(P(m.x, m.y)); return Object.assign({}, m, { x: q.x, y: q.y }); };
    let e = aH(ini);
    for (const [t0, t1, d, f] of lista) { if (t <= t0) break; e = mezM(e, aH(d), (f || suave)(fase(t, t0, t1))); }
    return e;
  }
  const comoMano = m => ({ x: m.x, y: m.y, ang: m.ang, mu: m.mu, dobla: m.dobla, puno: m.puno, dedos: m.dedos });
  const desdeMuneca = (R, w, mu) => { const r = R.MUNECA_R * R.JK; return P(w.x - Math.cos(mu) * r, w.y - Math.sin(mu) * r); };
  // punta del índice de una mano (hoja)
  function puntaIndice(R, m) {
    const d = m.dedos, abre = (d.indice + d.medio + d.anular + d.menique) / 4;
    const an = 0.17 * (0.4 + 0.9 * abre), largo = 3.2 + (14.5 - 3.2) * Math.pow(clamp(d.indice), 0.85);
    let q = P(6.9 + Math.sin(an) * largo, 4.5 + Math.cos(an) * largo);
    q = rotP(q, m.mu + Math.PI / 2);
    const k = (m.puno ?? 1) * R.JK;
    q = rotP(P(q.x * k, q.y * k), m.ang || 0);
    return P(m.x + q.x, m.y + q.y);
  }
  // rodilla de una pierna (hoja), con la misma IK que dibuja el personaje
  function rodilla(R, p, lado) {
    const cad = R.tronco(p)(R.CADERA[lado]), L = R.A.datos.piezas["pierna_" + lado].largo;
    const c = Recortes.ik(cad, p.piernas[lado].tob, L, L * 0.5, 80, 1, 1.03), l1 = c.sj * (c.estira || 1);
    return { k: P(cad.x - Math.sin(c.a1) * l1, cad.y + Math.cos(c.a1) * l1), cad, a1: c.a1, a2: c.a2 };
  }

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  const TOB_G = G.SUELO - G.TOBILLO_ALTO, XG0 = 415;
  const SUELA_G = P(110, 88);                         // punto de la suela que pisa el balón (respecto al tobillo)
  const BOLS_GC = desdeMuneca(G, P(131, 652), -1.75), BOLS_GL = desdeMuneca(G, P(372, 648), -1.75);
  const B_G = P(306, 528);                           // balón en las manos de Guillermo (coordenadas del tronco)

  // posición del cuerpo en la pantalla
  const CLAVES_XG = [[0, XG0], [3.0, XG0], [3.36, 365], [3.42, 365], [3.78, 312], [3.84, 312], [4.2, 258], [4.75, 258],
    [4.93, 230], [5.13, 172], [5.34, 88], [5.55, -8], [5.76, -110], [5.97, -215], [6.12, -300]];
  const V_RUN = 620;
  const CLAVES_XG2 = [[7.5, 289], [7.62, 294], [7.74, 302], [7.86, 309], [7.98, 318], [8.2, 378], [8.3, 386], [8.38, 398], [8.85, 401], [9.14, 419]];
  function xRun(t) {
    if (t <= T.frena0) return 196 - V_RUN * (T.frena0 - t);
    const u = fase(t, T.frena0, T.frena1); return 196 + 93 * (1 - (1 - u) * (1 - u));
  }
  // saltos a la pata coja: [despega, aterriza, x del pie cercano]
  const SALTOS = (() => { const L = [], xs = [402, 394, 405, 391, 400, 409, 396, 389, 402, 395, 404];
    let t = T.salto0; for (let i = 0; i < xs.length && t < T.salto1; i++) { L.push([t, t + 0.21, xs[i]]); t += 0.33; } return L; })();
  const X_PIE_SALTO0 = 400;
  function xPieSalto(t) {
    let x = X_PIE_SALTO0;
    for (const [t0, t1, xx] of SALTOS) { if (t < t0) break; x = lerp(x, xx, suave(fase(t, t0, t1))); }
    return x;
  }
  function altoSalto(t) {
    for (const [t0, t1] of SALTOS) if (t >= t0 && t <= t1) return Math.sin(Math.PI * fase(t, t0, t1));
    return 0;
  }
  function xG(t) {
    if (t < 6.12) return pista(CLAVES_XG, t)[0];
    if (t < T.corre0 - 0.15) return -400;
    if (t < T.frena1) return xRun(t);
    if (t < T.salto0) return pista(CLAVES_XG2, t)[0];
    return xPieSalto(t) + 19;
  }

  /* ---------- pies de Guillermo (en el mundo): pasos [t0, t1, xDestino, alto] ---------- */
  const RUN = { per: 0.27, apoyo: 0.09, delante: 30, alto: 60 }, DERRAPE = 10;
  const APOYOS = (() => {           // carrera: apoyos [t, x, lado]
    const L = [];
    for (let k = -3; k < 4; k++) { const tf = T.corre0 + k * RUN.per; L.push([tf, xRun(tf) + RUN.delante, k % 2 ? "lejos" : "cerca"]); }
    L.push([T.frena0 + 0.12, xRun(T.frena0 + 0.12) + 20, "cerca"]);          // frenada: entra de talón y derrapa
    L.push([T.frena1 - 0.02, 307, "lejos"]);
    return L;
  })();
  const X_FRENA = xRun(T.frena0 + 0.12) + 20 + 10;
  const PASOS_G = {
    cerca: [[3.42, 3.78, 285, 13], [4.75, 4.93, 182, 16], [5.13, 5.3, 28, 18], [5.53, 5.7, -150, 20], [5.9, 6.05, -330, 20],
      // tras la frenada: pasitos y el último paso, junto al balón
      [7.48, 7.48, X_FRENA, 0], [7.54, 7.64, 282, 9], [7.78, 7.88, 297, 9], [8.0, 8.18, 400, 22]],
    lejos: [[3.0, 3.36, 340, 13], [3.84, 4.2, 232, 13], [4.95, 5.12, 108, 17], [5.33, 5.5, -60, 19], [5.72, 5.88, -240, 20],
      [7.47, 7.47, 307, 0], [7.66, 7.76, 317, 9], [7.9, 8.0, 333, 9]]
  };
  const ANG_PASO = u => 0.28 * Math.sin(Math.PI * u) - 0.05 * Math.sin(2 * Math.PI * u);
  function pieLista(lista, x0, t) {
    let x = x0, h = 0, a = 0;
    for (const [t0, t1, xd, alto] of lista) {
      if (t < t0) break;
      const u = fase(t, t0, t1);
      if (u < 1) { const xi = x; x = lerp(xi, xd, suave(u)); h = alto * Math.sin(Math.PI * u); a = ANG_PASO(u); return { x, h, a }; }
      x = xd;
    }
    return { x, h, a };
  }
  // carrera: pie de un lado en el instante t (apoyo quieto; vuelo con talón al culo y rodilla alta)
  function pieCarrera(lado, t) {
    const mios = APOYOS.filter(a => a[2] === lado);
    let i = -1; for (let k = 0; k < mios.length; k++) if (mios[k][0] <= t) i = k;
    if (i < 0) i = 0;
    const [tf, xf] = mios[i];
    if (i === mios.length - 1) {                                     // último apoyo: frenada (el cercano derrapa)
      if (lado === "cerca") { const u = fase(t, tf, tf + 0.18); return { x: xf + DERRAPE * salida(u), h: 0, a: lerp(-0.34, -0.04, suave(u)) }; }
      return { x: xf, h: 0, a: 0 };
    }
    if (t <= tf + RUN.apoyo) {
      const u = clamp((t - tf) / RUN.apoyo);
      return { x: xf, h: 0, a: lerp(-0.12, 0.38, u) };
    }
    const [tn, xn] = mios[i + 1], toff = tf + RUN.apoyo, u = clamp((t - toff) / (tn - toff));
    const k = suave(clamp((u - 0.1) / 0.9));
    const h = RUN.alto * Math.sin(Math.PI * Math.pow(u, 0.72));
    const a = u < 0.3 ? lerp(0.38, 1.05, suave(u / 0.3)) : u < 0.75 ? lerp(1.05, 0.15, suave((u - 0.3) / 0.45)) : lerp(0.15, -0.12, suave((u - 0.75) / 0.25));
    return { x: lerp(xf, xn, k), h, a };
  }
  // la pierna lejana en la patada: armado, golpe en el césped (la puntera se clava) y el empujoncito
  const PUNTA_G = G.PUNTA;
  const GOLPE = { x: 465, y: SUELO + 2, ang: 0.62 };
  function tobilloDesdePunta(px, py, ang) { const o = rotP(PUNTA_G, ang); return { x: px - o.x * S, y: py - o.y * S }; }

  // pie del mundo → pierna en la hoja
  const aPierna = (p, w, lado) => ({ tob: P(G.aHoja(p, P(w.x, 0)).x, TOB_G - (lado === "lejos" ? 12 : 0) - w.h / S), ang: w.a });

  /* ---------- cuerpo de Guillermo ---------- */
  const CG0 = { pel: 0, torso: 0.03, cab: 0, cdy: 0, hom: 0 };
  const CG = o => Object.assign({}, CG0, o);
  const CUERPOS_G = {
    base: CG({}), mira: CG({ torso: 0.07, cab: 0.14 }), sube: CG({ pel: -4, torso: -0.02, cab: 0.06, hom: 0.4 }),
    suelta: CG({ pel: 8, torso: 0.1, cab: 0.18 }), pisa: CG({ pel: 16, torso: -0.05, cab: 0.16 }), quieto: CG({ pel: 20, torso: 0.17, cab: 0.2 }),
    erguido: CG({ torso: 0.02, cab: 0.04 }), cuenta: CG({ torso: -0.02, cab: 0.0 }), mide: CG({ torso: -0.05, cab: -0.08, hom: 0.3 }),
    recula: CG({ pel: 18, torso: -0.1, cab: 0.04 }), corre: CG({ pel: 26, torso: 0.3, cab: -0.2 }), frena: CG({ pel: 34, torso: -0.24, cab: 0.06 }),
    chop: CG({ pel: 30, torso: 0.1, cab: -0.04 }), carga: CG({ pel: 24, torso: -0.16, cab: -0.06 }), golpe: CG({ pel: 30, torso: 0.22, cab: 0.1 }),
    tieso: CG({ pel: 26, torso: 0.18, cab: 0.06 }), dolor: CG({ pel: 40, torso: 0.35, cab: -0.3, hom: 0.4 }), puchero: CG({ pel: 36, torso: 0.3, cab: -0.12, hom: 0.2 })
  };
  const GUION_CUERPO_G = [
    [0.25, 0.5, "mira"], [T.sube0, T.sube1, "sube"], [T.suelta, T.suelta + 0.18, "suelta"], [1.05, 1.32, "pisa"],
    [T.quita0, T.quita0 + 0.3, "quieto"], [T.bajaPie, T.bajaPie + 0.25, "erguido"], [2.98, 3.2, "cuenta"],
    [T.mas0, T.mas0 + 0.2, "mide"], [T.atras0 - 0.05, T.atras0 + 0.2, "recula"],
    [T.corre0 - 0.2, T.corre0 - 0.1, "corre"], [T.frena0, T.frena0 + 0.12, "frena"], [T.frena1, T.frena1 + 0.15, "chop"],
    [T.arma0, T.arma1, "carga"], [T.golpe - 0.03, T.golpe + 0.03, "golpe", salida], [T.empuja, T.empuja + 0.3, "tieso"],
    [T.agarra0, T.agarra1, "dolor"], [T.salto1 + 0.05, T.salto1 + 0.4, "puchero"]
  ];
  const CARAS_G = {
    inicio: E({ mx: 0.6, my: 0.65, sd: 6, si: 4, sonr: 0.2 }),
    mimo: E({ mx: 0.5, my: 0.9, c: 0.2, sd: 12, gd: 0.06, si: 10, abre: 6, ancho: 0.6, sonr: 0.15, lengua: 0.9 }),
    quieto: E({ mx: 0.45, my: 0.95, iris: 0.92, sd: 18, si: 16, abre: 4, ancho: 0.5, sonr: 0.05 }),
    contento: E({ mx: 0.55, my: 0.7, c: 0.3, h: 0.4, sd: 8, si: 8, sonr: 0.7 }),
    cuenta: E({ mx: 0.9, my: 0.1, sd: 10, si: 6, abre: 10, ancho: 0.7, sonr: 0.3 }),
    mide: E({ mx: 0.95, my: -0.05, c: 0.45, sd: -6, gd: -0.12, si: -4, gi: -0.1, abre: 0, ancho: 0.55, sonr: -0.2 }),
    mas: E({ mx: 0.9, my: 0.05, c: 0.2, sd: 14, gd: 0.1, si: -4, abre: 4, ancho: 0.45, sonr: -0.15 }),
    decidido: E({ mx: 0.95, my: 0.1, c: 0.25, sd: -8, gd: -0.16, si: -6, gi: -0.14, abre: 6, ancho: 0.85, sonr: 0.55 }),
    furia: E({ mx: 0.95, my: 0.2, c: 0.2, sd: -12, gd: -0.22, si: -10, gi: -0.2, abre: 22, ancho: 1, sonr: 0.25 }),
    chulo: E({ mx: 0.9, my: 0.3, c: 0.3, sd: 8, gd: 0.08, si: -6, gi: -0.1, abre: 7, ancho: 0.7, sonr: 0.3, lengua: 0.9 }),
    carga: E({ mx: 0.9, my: 0.55, c: 0.15, sd: -10, gd: -0.2, si: -8, gi: -0.18, abre: 16, ancho: 0.9, sonr: 0.1 }),
    tieso: E({ mx: 0.6, my: 0.8, iris: 0.62, sd: 22, gd: 0.04, si: 22, abre: 9, ancho: 0.42, sonr: -0.1 }),
    dolor: E({ c: 1, z: 1, sd: 18, gd: 0.25, si: 18, gi: 0.25, abre: 46, ancho: 1.05, sonr: -0.75 }),
    puchero: E({ mx: -0.55, my: 0.05, c: 0.25, sd: 16, gd: 0.3, si: 16, gi: 0.3, abre: 4, ancho: 0.55, sonr: -0.6 })
  };
  const GUION_CARA_G = [
    [0.55, 0.75, "mimo"], [T.quita0, T.quita0 + 0.15, "quieto"], [T.asiente - 0.05, T.asiente + 0.12, "contento"],
    [2.96, 3.15, "cuenta"], [T.mas0, T.mas0 + 0.15, "mide"], [T.mas0 + 0.28, T.mas0 + 0.4, "mas"], [T.atras0, T.atras0 + 0.15, "decidido"],
    [T.corre0, T.corre0 + 0.1, "furia"], [T.frena1, T.frena1 + 0.12, "chulo"], [T.arma0, T.arma0 + 0.12, "carga"],
    [T.golpe + 0.02, T.golpe + 0.1, "tieso"], [T.duele, T.duele + 0.08, "dolor", salida], [T.gCam, T.gCam + 0.3, "puchero"]
  ];
  // boca que cuenta (uno, dos, tres)
  function cuchicheo(t) {
    let k = 0; for (const tp of T.pasos) k = Math.max(k, campana(t, tp + 0.22, tp + 0.5));
    return k;
  }

  const MEMO = new Map();
  function memo(clave, f) { if (MEMO.has(clave)) return MEMO.get(clave); if (MEMO.size > 12) MEMO.clear(); const v = f(); MEMO.set(clave, v); return v; }
  function poseG(t, geo = false) { return memo("g" + geo + t, () => poseG0(t, geo)); }
  function poseG0(t, geo) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "base", t);
    const respira = Math.sin(t * 2.2);
    const x = xG(t);
    // botes del cuerpo: carrera, pasitos y saltos
    let bote = 0;
    if (t > T.corre0 - 0.3 && t < T.frena0 + 0.1) bote = -10 * Math.cos(2 * Math.PI * (t - T.corre0 - RUN.apoyo * 0.5) / RUN.per);
    if (t > T.chop0 && t < T.chop1 + 0.02) bote = -5 * Math.abs(Math.sin(Math.PI * (t - T.chop0) / 0.12));
    const salto = altoSalto(t);
    let aterriza = 0; for (const [, t1] of SALTOS) { const u = t - t1; if (u > 0 && u < 0.12) aterriza = Math.max(aterriza, Math.sin(Math.PI * u / 0.12)); }
    // amagos de cadera en los pasitos, asentir, negar con la cabeza
    const amago = (t > T.chop0 && t < T.chop1 + 0.1) ? 0.07 * Math.sin((t - T.chop0) * 2 * Math.PI / 0.24) * tramo(t, T.chop0, T.chop0 + 0.06) * (1 - tramo(t, T.chop1 - 0.06, T.chop1 + 0.06)) : 0;
    const asiente = 0.07 * Math.sin((t - T.asiente) * 2 * Math.PI / 0.24) * campana(t, T.asiente, T.asiente + 0.48);
    const niega = 0.09 * Math.sin((t - T.mas0 - 0.3) * 2 * Math.PI / 0.22) * campana(t, T.mas0 + 0.28, T.mas0 + 0.72);
    const tiembla = (t > T.empuja && t < T.duele) ? ruido(t * 30) * tramo(t, T.empuja, T.empuja + 0.2) : 0;
    const latido = (t > T.salto0) ? 0.03 * Math.sin(t * 9) : 0;
    const p = {
      x, suelo: SUELO, s: S, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 + bote / S * 0.35 - salto * 26 / S + aterriza * 10 },
      torso: b.torso + amago + 0.004 * tiembla, torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.02 * b.hom },
      piernas: {}, cabeza: { ang: b.cab + asiente + niega + 0.01 * tiembla + latido, dx: 0, dy: -10 * b.hom, esc: { x: 1, y: 1 } }
    };
    // pies
    const w = { cerca: null, lejos: null };
    if (t >= T.corre0 - 0.6 && t < T.frena1 - 0.02) {
      w.cerca = pieCarrera("cerca", t); w.lejos = pieCarrera("lejos", t);
    } else {
      w.cerca = pieLista(PASOS_G.cerca, XG0 - 19, t);
      w.lejos = pieLista(PASOS_G.lejos, XG0 + 18, t);
    }
    // pie cercano: pisar el balón (suela encima) y hacerlo rodar
    if (t > 0.95 && t < T.bajaPie) {
      const bx = balonX(t), sube = tramo(t, T.quita0, T.quita1);
      const c = P(bx, SUELO - 2 * RB + 1.5);                                                  // arriba del balón
      // la suela rueda sobre el balón: el pie avanza el doble que el balón
      const avance = 2 * (bx - 478);
      const o = rotP(SUELA_G, -0.12);
      const tob = P(478 + avance - o.x * S, c.y - o.y * S - 16 * sube);
      const wPisa = { x: tob.x, h: (SUELO - G.TOBILLO_ALTO * S) - tob.y, a: -0.12 + 0.1 * sube };
      // espera levantado detrás del sitio donde va a caer, y lo pisa en cuanto toca el suelo
      const base = { x: XG0 - 19, h: 0, a: 0 };
      const listo = { x: wPisa.x - 34, h: wPisa.h + 34, a: -0.3 };
      if (t < T.pisa) {
        const k1 = tramo(t, 0.95, 1.22), k2 = tramo(t, T.cae - 0.02, T.pisa, entrada);
        const a1 = { x: lerp(base.x, listo.x, k1), h: lerp(0, listo.h, k1) + 10 * campana(t, 0.95, 1.22), a: lerp(0, listo.a, k1) };
        w.cerca = { x: lerp(a1.x, wPisa.x, k2), h: lerp(a1.h, wPisa.h, k2), a: lerp(a1.a, wPisa.a, k2) };
      } else {
        const kk = 1 - tramo(t, T.quita1 - 0.05, T.bajaPie), arco = campana(t, T.quita1 - 0.1, T.bajaPie) * 0.6;
        w.cerca = { x: lerp(base.x, wPisa.x, kk), h: lerp(base.h, wPisa.h, kk) + arco * 24, a: lerp(base.a, wPisa.a, kk) };
      }
    }
    // pierna lejana: armado, golpe, empujoncito y luego en alto (agarrada)
    if (t >= T.arma0 && t < T.agarra1 + 0.5) {
      const tp = tobilloDesdePunta(GOLPE.x, GOLPE.y, GOLPE.ang);
      const golpe = { x: tp.x, h: (SUELO - G.TOBILLO_ALTO * S) - tp.y, a: GOLPE.ang };
      const empuje = 12 * tramo(t, T.golpe, T.empuja, salida);
      const desde = pieLista(PASOS_G.lejos, XG0 + 18, T.arma0);
      const atras = { x: xG(T.arma1) - 64, h: 78, a: 1.15 };
      let f;
      if (t < T.arma1) { const u = fase(t, T.arma0, T.arma1); f = { x: lerp(desde.x, atras.x, suave(u)), h: lerp(desde.h, atras.h, suave(u)), a: lerp(desde.a, atras.a, suave(u)) }; }
      else if (t < T.golpe) { const u = entrada(fase(t, T.arma1, T.golpe)); f = { x: lerp(atras.x, golpe.x, u), h: lerp(atras.h, golpe.h, u) + 18 * Math.sin(Math.PI * u) * -0.5, a: lerp(atras.a, golpe.a, u) }; }
      else f = { x: golpe.x + empuje, h: golpe.h + 1.5 * tramo(t, T.golpe, T.empuja), a: golpe.a - 0.08 * tramo(t, T.golpe, T.empuja) };
      w.lejos = f;
    }
    if (t >= T.salto0 - 0.25) {
      // pie cercano: a la pata coja
      const k = tramo(t, T.salto0 - 0.25, T.salto0);
      const xs = xPieSalto(t), h = altoSalto(t) * 26;
      w.cerca = { x: lerp(w.cerca.x, xs, k), h: h, a: 0.18 * altoSalto(t) };
    }
    p.piernas.cerca = aPierna(p, w.cerca, "cerca");
    p.piernas.lejos = aPierna(p, w.lejos, "lejos");
    // pierna lejana recogida: rodilla arriba, abrazada (relativa a la cadera, en la hoja)
    if (t >= T.agarra0) {
      const cad = G.tronco(p)(G.CADERA.lejos);
      const pend = 0.08 * Math.sin(t * 9.4) + 0.12 * altoSalto(t);
      const recog = { tob: P(cad.x + 120 + 20 * pend, cad.y + 80 - 25 * pend), ang: 0.35 + 0.25 * Math.sin(t * 9.4 + 1) };
      const k = tramo(t, T.agarra0, T.agarra1);
      p.piernas.lejos = { tob: mezcla(p.piernas.lejos.tob, recog.tob, k), ang: lerp(p.piernas.lejos.ang, recog.ang, k) };
    }
    // cara
    const e = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    e.abre += 10 * cuchicheo(t);
    if (t > T.duele) { e.abre += 6 * Math.sin(t * 13); }
    p.cara = cara(e, parpadeo(t, [1.95, 3.25, 4.55, 6.95, 12.95]));
    p.rojo = 0.75 * tramo(t, T.duele - 0.1, T.duele + 0.15) * (1 - 0.35 * tramo(t, T.gCam, T.gCam + 0.6));
    const llora = tramo(t, T.duele + 0.1, T.duele + 0.4);
    p.capaCabeza = (llora > 0.01) ? (gg, tt) => lagrimas(gg, llora, tt, t > T.gCam + 0.1 ? 0.45 : 1) : null;
    // manos
    const Tr = G.tronco(p);
    manosG(p, t, Tr);
    // el balón en las manos: dentro del tronco (detrás de los brazos)
    if (!geo && modoBalon(t) === "manosG") p.capaTronco = gg => dibujaBalonEnCapa(gg, t);
    if (!geo) {
      const q = posBalon(t);
      const wm = tramo(t, 0.2, 0.5) * (1 - tramo(t, 2.92, 3.05)) + 0.7 * tramo(t, T.empuja + 0.05, T.empuja + 0.2) * (1 - tramo(t, T.duele - 0.05, T.duele + 0.05));
      miraA(G, p, q, OJO_G, clamp(wm));
    }
    return p;
  }

  function manosG(p, t, Tr) {
    const enBL = M(BOLS_GL.x, BOLS_GL.y, -1.75, 0, CERO, 1), enBC = M(BOLS_GC.x, BOLS_GC.y, -1.75, 0, CERO, -1);
    const sube = P(0, -28 * tramo(t, T.sube0, T.sube1) * (1 - tramo(t, T.suelta - 0.02, T.suelta + 0.1)));
    const bc = P(B_G.x - 100, B_G.y + 8), bl = P(B_G.x + 98, B_G.y - 2);
    const sujC = M(bc.x, bc.y + sube.y, 2.4, 1, todos(0.55), -1), sujL = M(bl.x, bl.y + sube.y, 0.75, 1, todos(0.55), 1);
    const abreC = M(bc.x - 30, bc.y + 6, 2.2, 1, todos(1), -1), abreL = M(bl.x + 30, bl.y + 4, 0.9, 1, todos(1), 1);
    const equiC = M(-55, 545, 0.2, 1, todos(1), -1), equiL = M(565, 520, Math.PI - 0.25, 1, todos(1), 1);
    const quietoC = M(296, 606, Math.PI + 0.3, 1, dedosDe(0.6, 1, 1, 1, 1), -1), quietoL = M(505, 636, Math.PI - 0.12, 1, dedosDe(0.6, 1, 1, 1, 1), 1);
    const reposoL = M(430, 640, 1.6, 1, todos(0.3), 1);
    const cuentaL = (n) => M(535, 262, Math.PI / 2 + 0.12, 1, dedosDe(0, n >= 1 ? 1 : 0, n >= 2 ? 1 : 0, n >= 3 ? 1 : 0, 0), 1);
    const masL = M(470, 236, 2.3, 1, todos(1), 1);
    const listaL = [
      [0.0, 0.01, sujL], [T.suelta, T.suelta + 0.1, abreL, salida], [T.suelta + 0.12, T.cae, equiL],
      [T.quita0, T.quita0 + 0.24, quietoL], [T.bajaPie, T.bajaPie + 0.2, reposoL], [2.98, 3.3, cuentaL(1)],
      [T.pasos[1] + 0.22, T.pasos[1] + 0.36, cuentaL(2)], [T.pasos[2] + 0.22, T.pasos[2] + 0.36, cuentaL(3)],
      [T.mas0 + 0.3, T.mas0 + 0.42, masL], [T.mas0 + 0.42, T.mas0 + 0.54, M(535, 250, 1.75, 1, todos(1), 1)],
      [T.mas0 + 0.54, T.mas0 + 0.64, masL], [T.atras0, T.atras0 + 0.2, M(470, 560, 1.4, 1, CERO, 1)]
    ];
    // el primer dedo se estira justo al apoyar el pie
    listaL[5] = [T.pasos[0] + 0.1, T.pasos[0] + 0.36, cuentaL(1)];
    const listaC = [
      [0.0, 0.01, sujC], [T.suelta, T.suelta + 0.1, abreC, salida], [T.suelta + 0.12, T.cae, equiC],
      [T.quita0, T.quita0 + 0.24, quietoC], [T.bajaPie, T.bajaPie + 0.25, enBC], [T.atras0, T.atras0 + 0.2, M(140, 570, 1.9, 1, CERO, -1)]
    ];
    let L = rutaMano(t, listaL, sujL, Tr), C = rutaMano(t, listaC, sujC, Tr);
    const palmadita = 9 * Math.sin((t - T.quita0) * 2 * Math.PI / 0.3) * campana(t, T.quita0 + 0.05, T.bajaPie);
    L.y += palmadita; C.y += palmadita * 0.8;
    // sujetando el balón: las manos siguen al balón (que sube un poco antes de soltarlo)
    // braceo al recular (de 4.75 a 6.1): codos doblados, adelante y atrás
    const kRec = tramo(t, T.atras0, T.atras0 + 0.2);
    if (kRec > 0 && t < T.corre0) {
      const ph = Math.sin((t - T.atras0) * 2 * Math.PI / 0.4);
      const bl = Tr(P(450 + 70 * ph, 560 - 30 * ph)), bcp = Tr(P(150 - 70 * ph, 575 + 30 * ph));
      L = mezM(L, M(bl.x, bl.y, 1.4 + 0.3 * ph, 1, CERO, 1), kRec);
      C = mezM(C, M(bcp.x, bcp.y, 1.9 - 0.3 * ph, 1, CERO, -1), kRec);
    }
    // carrera: brazos contrarios a las piernas
    if (t > T.corre0 - 0.6 && t < T.frena1 + 0.3) {
      const ph = Math.cos(2 * Math.PI * (t - T.corre0) / (2 * RUN.per));      // +1: pierna cercana delante → brazo lejano delante
      const kC = tramo(t, T.corre0 - 0.6, T.corre0 - 0.3) * (1 - tramo(t, T.frena0, T.frena0 + 0.15));
      const lD = Tr(P(470 + 130 * ph, 525 - 95 * ph)), cD = Tr(P(150 - 170 * ph, 525 + 95 * ph));
      L = mezM(L, M(lD.x, lD.y, 1.1 + 0.9 * ph, 1, CERO, 1), kC);
      C = mezM(C, M(cD.x, cD.y, 1.5 - 0.9 * ph, 1, CERO, -1), kC);
      // frenada: brazos adelante, manos abiertas
      const kF = tramo(t, T.frena0, T.frena0 + 0.12) * (1 - tramo(t, T.frena1, T.frena1 + 0.15));
      const fL = Tr(P(560, 420)), fC = Tr(P(300, 380));
      L = mezM(L, M(fL.x, fL.y, Math.PI - 0.5, 1, todos(1), 1), kF);
      C = mezM(C, M(fC.x, fC.y, Math.PI - 0.2, 1, todos(1), -1), kF);
    }
    // pasitos: brazos abiertos de bailarín (manos abiertas que se mecen)
    const kCh = tramo(t, T.frena1, T.frena1 + 0.15) * (1 - tramo(t, T.arma0, T.arma0 + 0.12));
    if (kCh > 0) {
      const ph = Math.sin((t - T.chop0) * 2 * Math.PI / 0.24);
      const aL = Tr(P(575, 470 + 18 * ph)), aC = Tr(P(-70, 470 - 18 * ph));
      L = mezM(L, M(aL.x, aL.y, Math.PI - 0.15, 1, dedosDe(0.7, 1, 1, 0.9, 0.8), 1), kCh);
      C = mezM(C, M(aC.x, aC.y, 0.15, 1, dedosDe(0.7, 1, 1, 0.9, 0.8), -1), kCh);
    }
    // armado y golpe: brazo cercano adelante, lejano atrás; susto con las manos abiertas
    const kA = tramo(t, T.arma0, T.arma0 + 0.14);
    if (kA > 0 && t < T.agarra1 + 0.3) {
      const golpe = tramo(t, T.golpe - 0.02, T.golpe + 0.06, salida);
      const aL = Tr(P(lerp(470, 610, golpe), lerp(470, 330, golpe))), aC = Tr(P(lerp(260, -80, golpe), lerp(350, 330, golpe)));
      const tiembla = (t > T.empuja) ? 3 * ruido(t * 26) : 0;
      L = mezM(L, M(aL.x + tiembla, aL.y, lerp(1.4, Math.PI - 0.7, golpe), 1, todos(golpe), 1), kA);
      C = mezM(C, M(aC.x, aC.y - tiembla, lerp(2.4, 0.6, golpe), 1, todos(golpe), -1), kA);
    }
    // agarra la pierna: mano cercana sobre la rodilla, lejana en la espinilla
    const kG = tramo(t, T.agarra0 + 0.04, T.agarra1);
    if (kG > 0) {
      const r = rodilla(G, p, "lejos"), tb = p.piernas.lejos.tob;
      const sh = mezcla(r.k, tb, 0.42);
      const rC = P(r.k.x - 10, r.k.y - 52), rL = P(sh.x + 52, sh.y - 6);
      C = mezM(C, M(rC.x, rC.y, Math.PI + 0.75, 1, dedosDe(0.4, 0.55, 0.5, 0.45, 0.4), -1), kG);
      L = mezM(L, M(rL.x, rL.y, 0.4 - Math.PI, 1, dedosDe(0.3, 0.5, 0.45, 0.4, 0.35), 1), kG);
    }
    p.manoLejos = comoMano(L); p.manoCerca = comoMano(C);
  }

  /* ---------- lágrimas de dolor (retrato de Guillermo) ---------- */
  function lagrimas(g, k, t, chorro) {
    g.save(); g.lineCap = "round";
    for (const [x, y, sg, d] of [[742, 586, -1, 0], [918, 632, 1, 0.37]]) {
      for (let i = 0; i < 4; i++) {
        const ph = (t * 2.4 + d + i / 4) % 1, vx = sg * (90 + 40 * hash(i + d * 10)) * chorro, a = clamp(k * 2) * (1 - ph);
        const xx = x + vx * ph, yy = y - 60 * ph * chorro + 240 * ph * ph;
        g.globalAlpha = 0.95 * a; g.fillStyle = "#a6e1ff"; g.strokeStyle = "#1d5f8a"; g.lineWidth = 4;
        g.beginPath(); g.ellipse(xx, yy, 10, 13, Math.atan2(1, sg * 0.8) * 0.4, 0, Math.PI * 2); g.fill(); g.stroke();
        g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(xx - 3, yy - 4, 3, 4, 0, 0, Math.PI * 2); g.fill();
      }
    }
    g.restore();
  }

  /* =====================================================================================
   * GABACHO
   * ===================================================================================== */
  const TOB_B = GB.SUELO - GB.TOBILLO_ALTO;
  const PB = GB.PELVIS;
  const B_D = P(330, 585);                                      // balón en las manos de Gabacho (tronco)
  const B_CADERA = P(88, 645);                                  // balón en la cadera (lado cercano)
  const B_LANZA = P(-55, 575);                                  // de aquí lo lanza hacia arriba (hacia fuera)
  const DEDO_D = P(-150, 372);                                  // mano con el índice arriba, apartada de la cara
  function bLocalD(t) {
    const kc = tramo(t, T.cadera0, T.cadera1), kp = tramo(t, T.lanza0 - 0.25, T.lanza0);
    return mezcla(mezcla(B_D, B_CADERA, kc), B_LANZA, kp);
  }
  const CD0 = { dx: 0, pel: 0, torso: 0.02, cab: 0.05, cdy: 0, hom: 0, nx: PB.x - 50, fx: PB.x + 70, nh: 0, fh: 0, na: 0, fa: 0 };
  const CD = o => Object.assign({}, CD0, o);
  const GUARDIA = { dx: 0, pel: 70, torso: 0.14, cab: 0.08, nx: PB.x - 150, fx: PB.x + 175 };
  const CUERPOS_D = {
    base: CD({}), molino: CD({ torso: -0.04, cab: -0.05, hom: 0.2 }),
    abre: CD({ pel: 10, nx: PB.x - 165, fx: PB.x + 185 }),
    zancC: CD({ dx: -70, pel: 95, torso: 0.1, cab: 0.1, nx: PB.x - 165, fx: PB.x + 185 }),
    zancL: CD({ dx: 70, pel: 95, torso: 0.05, cab: 0.0, nx: PB.x - 165, fx: PB.x + 185 }),
    centro: CD({ pel: 20, nx: PB.x - 70, fx: PB.x + 80 }),
    sacude: CD({ pel: 8, torso: 0.0, cab: 0.04 }),
    palmas: CD({ pel: 10, torso: 0.06, cab: 0.1, nx: PB.x - 80, fx: PB.x + 90 }),
    guardia: CD(GUARDIA), asoma: CD({ dx: 30, pel: 14, torso: 0.18, cab: 0.12, nx: PB.x - 110, fx: PB.x + 130 }),
    bof: CD({ pel: 6, torso: -0.04, cab: -0.14, cdy: 16, hom: 1.2, nx: PB.x - 110, fx: PB.x + 130 }),
    ay: CD({ pel: 74, torso: 0.02, cab: -0.06, nx: PB.x - 150, fx: PB.x + 175 }),
    jarras: CD({ pel: 4, torso: -0.04, cab: 0.1, nx: PB.x - 60, fx: PB.x + 80 }),
    camara: CD({ pel: 4, torso: -0.05, cab: -0.04, nx: PB.x - 60, fx: PB.x + 80 }),
    mira: CD({ pel: 4, torso: 0.0, cab: 0.16, nx: PB.x - 60, fx: PB.x + 80 }),
    flick: CD({ pel: 14, torso: -0.06, cab: 0.18, nx: PB.x - 60, fx: PB.x + 80 }),
    atrapa: CD({ pel: 6, torso: 0.02, cab: 0.12, nx: PB.x - 60, fx: PB.x + 80 }),
    bosteza: CD({ pel: 0, torso: -0.08, cab: -0.22, cdy: -4, hom: 0.6, nx: PB.x - 60, fx: PB.x + 80 }),
    dedo: CD({ pel: 2, torso: -0.03, cab: 0.0, nx: PB.x - 60, fx: PB.x + 80 }),
    final: CD({ pel: 2, torso: -0.04, cab: -0.06, nx: PB.x - 60, fx: PB.x + 80 })
  };
  const GUION_CUERPO_D = [
    [T.molino0, T.molino0 + 0.25, "molino"], [T.zanc0, T.zanc0 + 0.25, "abre"], [T.zanc0 + 0.3, T.zanc0 + 0.55, "zancC"],
    [T.zanc0 + 0.68, T.zanc0 + 0.98, "zancL"], [T.zanc1 - 0.18, T.zanc1, "centro"], [T.sacude0, T.sacude0 + 0.15, "sacude"],
    [T.sacude1, T.sacude1 + 0.12, "palmas"], [T.guardia0, T.guardia0 + 0.22, "guardia"],
    [T.asoma, T.asoma + 0.25, "asoma"], [T.bof0, T.bof0 + 0.18, "bof"], [T.vuelve0, T.vuelve1, "guardia", salida],
    [T.ay - 0.02, T.ay + 0.08, "ay"], [T.relaja0, T.relaja1, "jarras"], [T.dCam0, T.dCam0 + 0.2, "camara"], [T.dCam1, T.dCam1 + 0.25, "mira"],
    [T.flick0, T.flick0 + 0.15, "flick"], [T.pop, T.atrapa, "atrapa"], [T.bosteza0, T.bosteza0 + 0.2, "bosteza"],
    [T.bosteza1, T.lanza, "dedo"], [T.dCam, T.dCam + 0.3, "final"]
  ];
  const CARAS_D = {
    inicio: E({ mx: 0.6, my: 0.2, c: 0.45, sd: 6, si: 10, gi: 0.06, sonr: 0.6, ancho: 0.95 }),
    teatro: E({ c: 1, h: 0.7, sd: 14, si: 16, abre: 6, sonr: 0.7, ancho: 0.95 }),
    esfuerzo: E({ c: 0.5, sd: -4, gd: -0.1, si: 4, abre: 10, ancho: 0.9, sonr: 0.3 }),
    sacude: E({ c: 0.3, h: 0.5, sd: 10, si: 12, abre: 14, sonr: 0.6 }),
    guardia: E({ mx: 0.9, my: 0.15, c: 0.25, sd: -6, gd: -0.14, si: -2, gi: -0.1, sonr: 0.45, ancho: 0.9 }),
    asoma: E({ mx: 1, my: 0, iris: 0.95, sd: 16, si: 4, gi: -0.08, sonr: 0.1, ancho: 0.8 }),
    bof: E({ mx: -0.2, my: 0.05, c: 0.35, sd: 22, gd: 0.12, si: 22, gi: 0.12, abre: 3, ancho: 0.5, sonr: -0.55 }),
    alerta: E({ mx: 1, my: 0.1, iris: 0.9, sd: 18, si: 18, abre: 8, ancho: 0.7, sonr: 0.0 }),
    ay: E({ mx: 0.9, my: 0.5, c: 0.55, z: 0.4, sd: 6, gd: 0.15, si: 6, gi: 0.15, abre: 12, ancho: 0.9, sonr: -0.4 }),
    aburre: E({ mx: 0.7, my: 0.6, c: 0.5, sd: 2, si: 14, gi: 0.08, sonr: 0.05, ancho: 0.75 }),
    camara: E({ mx: -0.35, my: 0.05, c: 0.4, sd: 0, si: 22, gi: 0.12, abre: 0, ancho: 0.6, sonr: -0.2 }),
    flick: E({ mx: 0.6, my: 0.8, c: 0.4, sd: 4, si: 10, sonr: 0.5, ancho: 0.9 }),
    bostezo: E({ c: 1, z: 0.3, sd: 20, gd: 0.1, si: 20, gi: 0.1, abre: 58, ancho: 0.95, sonr: -0.1, orig: 0 }),
    chulo: E({ mx: 0.3, my: -0.6, c: 0.4, sd: 10, si: 12, sonr: 0.75, ancho: 1 }),
    guino: E({ mx: -0.35, my: 0, ci: 1, sd: 14, gd: 0.06, si: 0, sonr: 0.9, ancho: 1.05 })
  };
  const GUION_CARA_D = [
    [T.molino0, T.molino0 + 0.2, "teatro"], [T.zanc0 + 0.3, T.zanc0 + 0.45, "esfuerzo"], [T.sacude0, T.sacude0 + 0.15, "sacude"],
    [T.guardia0, T.guardia0 + 0.15, "guardia"], [T.asoma, T.asoma + 0.2, "asoma"], [T.bof0, T.bof0 + 0.15, "bof"],
    [T.polvo + 0.02, T.polvo + 0.1, "alerta"], [T.vuelve1, T.vuelve1 + 0.15, "guardia"], [T.ay, T.ay + 0.08, "ay"],
    [T.relaja0, T.relaja1, "aburre"], [T.dCam0, T.dCam0 + 0.15, "camara"], [T.dCam1, T.dCam1 + 0.2, "aburre"],
    [T.flick0, T.flick0 + 0.12, "flick"], [T.bosteza0, T.bosteza0 + 0.22, "bostezo"], [T.bosteza1 - 0.05, T.bosteza1 + 0.1, "chulo"],
    [T.dCam, T.dCam + 0.2, "chulo"], [T.guino, T.guino + 0.1, "guino"]
  ];

  // pie lejano en el toque: la puntera se mete bajo el balón y lo sube
  function pieFlick(t, pd) {
    const u = fase(t, T.flick0, T.flick1), v = fase(t, T.flick1, T.pop + 0.08), bx = X_PARA;
    const sx = GB.aHoja(pd, P(bx, 0)).x;                       // x del balón en la hoja de Gabacho
    const punta = GB.PUNTA;
    const metido = { x: sx - punta.x + 18, y: TOB_B - 4, ang: -0.1 };
    const arriba = { x: sx - punta.x + 30, y: TOB_B - 120, ang: -0.55 };
    const base = { x: CUERPOS_D.flick.fx, y: TOB_B - 10, ang: 0 };
    if (t < T.flick1) return { x: lerp(base.x, metido.x, suave(u)), y: lerp(base.y, metido.y, suave(u)) - 14 * Math.sin(Math.PI * u), ang: lerp(0, -0.1, u) };
    if (t < T.pop + 0.08) return { x: lerp(metido.x, arriba.x, salida(v)), y: lerp(metido.y, arriba.y, salida(v)), ang: lerp(metido.ang, arriba.ang, v) };
    const w = fase(t, T.pop + 0.08, T.pop + 0.4);
    return { x: lerp(arriba.x, base.x, suave(w)), y: lerp(arriba.y, base.y, suave(w)), ang: lerp(arriba.ang, 0, suave(w)) };
  }

  function poseD(t, geo = false) { return memo("d" + geo + t, () => poseD0(t, geo)); }
  function poseD0(t, geo) {
    const b = guion(GUION_CUERPO_D, CUERPOS_D, "base", t);
    const respira = Math.sin(t * 2.0 + 1.1);
    // vaivén de portero en guardia y amagos siguiendo a Guillermo
    const enGuardia = tramo(t, T.guardia0 + 0.1, T.guardia0 + 0.4) * (1 - tramo(t, T.asoma - 0.05, T.asoma + 0.2))
      + tramo(t, T.vuelve1, T.vuelve1 + 0.15) * (1 - tramo(t, T.ay + 0.25, T.relaja0 + 0.1));
    let vaiven = 26 * Math.sin((t - T.guardia0) * 2.6) * enGuardia;
    for (const [i, tf] of T.fintas.entries()) vaiven += (i % 2 ? -1 : 1) * 46 * campana(t, tf - 0.02, tf + 0.2);
    const saltito = enGuardia * Math.abs(Math.sin((t - T.guardia0) * 5.2)) * 8;
    const sacude = campana(t, T.sacude0, T.sacude1) * Math.abs(Math.sin((t - T.sacude0) * Math.PI / 0.16)) * 22;
    const zan = (t > T.zanc0 + 0.3 && t < T.zanc1 - 0.18) ? 8 * Math.sin((t - T.zanc0) * 2 * Math.PI / 0.22) * campana(t, T.zanc0 + 0.3, T.zanc1 - 0.18) : 0;
    const p = { x: XD, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: PB.x + b.dx + vaiven, y: PB.y + b.pel + respira * 1.1 - saltito - sacude + zan },
      torso: b.torso + 0.0006 * vaiven, torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.025 * b.hom },
      piernas: {}, cabeza: { ang: b.cab - 0.0012 * vaiven, dx: 0, dy: b.cdy - 9 * b.hom, esc: { x: 1, y: 1 } } };
    // pies: los de la postura; en «sacude» levanta uno y otro
    const levC = campana(t, T.sacude0 + 0.05, T.sacude0 + 0.3) * 40, levL = campana(t, T.sacude0 + 0.3, T.sacude0 + 0.56) * 40;
    p.piernas.cerca = { tob: P(b.nx, TOB_B - b.nh - levC), ang: b.na + 0.3 * levC / 40 };
    p.piernas.lejos = { tob: P(b.fx, TOB_B - 10 - b.fh - levL), ang: b.fa + 0.3 * levL / 40 };
    if (t > T.flick0 && t < T.pop + 0.45) { const f = pieFlick(t, p); p.piernas.lejos = { tob: P(f.x, f.y), ang: f.ang }; }
    // cara
    const e = guion(GUION_CARA_D, CARAS_D, "inicio", t);
    p.cara = cara(e, parpadeo(t, [1.9, 4.6, 5.5, 7.2, 9.3, 10.8, 12.95, 13.9]));
    // lagrimita del bostezo
    const lag = campana(t, T.bosteza0 + 0.2, T.bosteza1 + 0.5);
    if (lag > 0.01) p.capaCabeza = gg => lagrimita(gg, lag);
    const Tr = GB.tronco(p);
    manosD(p, t, Tr);
    const modo = geo ? null : modoBalon(t);
    if (modo === "manosD") p.capaTronco = gg => dibujaBalonEnCapa(gg, t);
    if (!geo) {
      const q = (t > T.asoma && t < T.vuelve1) || (t > 5.1 && t < T.corre0 + 0.4) ? null : (t < T.golpe ? P(xG(t) + 20, 300) : posBalon(t));
      const wm = tramo(t, T.guardia0, T.guardia0 + 0.2) * (1 - tramo(t, T.asoma - 0.05, T.asoma + 0.1))
        + tramo(t, T.vuelve1, T.vuelve1 + 0.1) * (1 - tramo(t, T.dCam0 - 0.05, T.dCam0 + 0.1)) + tramo(t, T.dCam1, T.dCam1 + 0.1) * (1 - tramo(t, T.dCam - 0.05, T.dCam + 0.1));
      miraA(GB, p, q || P(xG(Math.min(t, 5.0)), 380), OJO_B, clamp(wm) * (q ? 1 : 0.0));
    }
    return p;
  }

  function manosD(p, t, Tr) {
    const enBL = M(GB.BOLSILLO_L.x, GB.BOLSILLO_L.y, -1.75, 0, CERO, 1), enBC = M(GB.BOLSILLO_C.x, GB.BOLSILLO_C.y, -1.75, 0, CERO, -1);
    const abierta = todos(1);
    // guardia: brazos abiertos a los lados, manos abiertas
    const gC = M(-95, 455, 0.25, 1, abierta, -1), gL = M(610, 440, Math.PI - 0.25, 1, abierta, 1);
    const bofC = M(-10, 575, -0.45, 1, dedosDe(1, 1, 1, 1, 1), -1, 0), bofL = M(530, 572, Math.PI + 0.45, 1, dedosDe(1, 1, 1, 1, 1), 1, 0);
    const jarC = M(92, 640, -1.9, 1, CERO, -1), jarL = M(420, 640, -1.25, 1, CERO, 1);
    const palC = M(232, 470, 1.9, 1, abierta, -1), palL = M(292, 466, 1.25, 1, abierta, 1);
    const sueltoC = M(150, 690, 1.6, 1, todos(0.45), -1), sueltoL = M(380, 690, 1.55, 1, todos(0.45), 1);
    const sujC = M(B_D.x - 104, B_D.y + 4, 2.3, 1, todos(0.6), -1), sujL = M(B_D.x + 100, B_D.y - 4, 0.8, 1, todos(0.6), 1);
    const listaC = [
      [T.sacude0, T.sacude0 + 0.15, sueltoC], [T.sacude1, T.sacude1 + 0.1, palC], [T.guardia0, T.guardia0 + 0.2, gC],
      [T.asoma, T.asoma + 0.22, jarC], [T.bof0, T.bof0 + 0.18, bofC], [T.vuelve0, T.vuelve1, gC, salida],
      [T.relaja0, T.relaja1, jarC], [T.flick0 - 0.1, T.flick0 + 0.2, M(60, 600, 0.3, 1, todos(0.8), -1)],
      [T.pop, T.atrapa, sujC]
    ];
    const listaL = [
      [T.sacude0, T.sacude0 + 0.15, sueltoL], [T.sacude1, T.sacude1 + 0.1, palL], [T.guardia0, T.guardia0 + 0.2, gL],
      [T.asoma, T.asoma + 0.22, jarL], [T.bof0, T.bof0 + 0.18, bofL], [T.vuelve0, T.vuelve1, gL, salida],
      [T.relaja0, T.relaja1, jarL], [T.flick0 - 0.1, T.flick0 + 0.2, M(470, 580, Math.PI - 0.3, 1, todos(0.8), 1)],
      [T.pop, T.atrapa, sujL]
    ];
    let C = rutaMano(t, listaC, enBC, Tr), L = rutaMano(t, listaL, enBL, Tr);
    // calentamiento: brazos en cruz haciendo círculos (tres vueltas), muy teatral
    const kM = tramo(t, T.molino0, T.molino0 + 0.3) * (1 - tramo(t, T.molino1 - 0.25, T.molino1));
    if (kM > 0) {
      const a = 2 * Math.PI * 3 * (t - T.molino0) / (T.molino1 - T.molino0), r = 48;
      const cC = Tr(P(-160, 335)), cL = Tr(P(640, 330));
      const qC = P(cC.x + Math.cos(a) * r, cC.y + Math.sin(a) * r), qL = P(cL.x - Math.cos(a) * r, cL.y + Math.sin(a) * r);
      C = mezM(C, M(qC.x, qC.y, 0.05, 1, todos(1), -1), kM);
      L = mezM(L, M(qL.x, qL.y, Math.PI - 0.05, 1, todos(1), 1), kM);
    }
    // zancadas: las dos manos sobre la rodilla doblada
    const kZ = tramo(t, T.zanc0 + 0.2, T.zanc0 + 0.4) * (1 - tramo(t, T.zanc1 - 0.25, T.zanc1 - 0.05));
    if (kZ > 0) {
      const lado = (t < T.zanc0 + 0.62) ? "cerca" : "lejos", kk = (t < T.zanc0 + 0.62) ? 1 : tramo(t, T.zanc0 + 0.62, T.zanc0 + 0.8);
      const rc = rodilla(GB, p, "cerca").k, rl = rodilla(GB, p, "lejos").k, r = mezcla(rc, rl, kk);
      C = mezM(C, M(r.x - 46, r.y - 40, Math.PI + 0.9, 1, todos(0.4), -1), kZ);
      L = mezM(L, M(r.x + 40, r.y - 30, -0.7, 1, todos(0.4), 1), kZ);
    }
    // sacudir: manos colgando que se agitan
    const kS = campana(t, T.sacude0, T.sacude1);
    if (kS > 0) { const s = Math.sin(t * 42) * 22 * kS; C.x += s; L.x -= s; C.mu += 0.4 * Math.sin(t * 42); L.mu -= 0.4 * Math.sin(t * 42); }
    // palmadas
    for (const tp of T.palmas) { const k = campana(t, tp - 0.08, tp + 0.08); if (k > 0) { const j = Tr(P(262, 468)); C.x = lerp(C.x, j.x - 20, k); C.y = lerp(C.y, j.y, k); L.x = lerp(L.x, j.x + 20, k); L.y = lerp(L.y, j.y, k); } }
    // con el balón: a la cadera (mano cercana), bostezo (mano lejana a la boca); lo lanza hacia arriba con
    // la misma mano y lo recoge en la punta del índice, hacia fuera (lejos de la cara)
    if (t > T.atrapa) {
      const b = bLocalD(t), kc = tramo(t, T.cadera0, T.cadera1), kp = tramo(t, T.lanza0 - 0.25, T.lanza0);
      // mano cercana: de agarrar el balón por el lado a sujetarlo en la cadera, luego debajo para lanzarlo
      const lado = M(b.x - lerp(104, 86, kc), b.y + lerp(4, 22, kc), lerp(2.3, 2.6, kc), 1, todos(lerp(0.6, 0.7, kc)), -1);
      const debajo = M(b.x - 14, b.y + 92, 0.2, 1, todos(0.85), -1);
      const mano = mezM(lado, debajo, kp), qm = Tr(P(mano.x, mano.y));
      C = Object.assign({}, mano, { x: qm.x, y: qm.y });
      // golpe de muñeca hacia arriba y la mano sube a esperar el balón con el índice estirado
      const kl = tramo(t, T.lanza - 0.06, T.lanza, salida);
      if (kl > 0) { const up = Tr(P(b.x - 24, b.y - 10)); C = mezM(C, M(up.x, up.y, 0.6, 1, todos(1), -1), kl); }
      const kd = tramo(t, T.lanza + 0.02, T.dedo - 0.03);
      const dd = Tr(DEDO_D);
      C = mezM(C, M(dd.x, dd.y, Math.PI / 2 - 0.04, 1, dedosDe(0, 1, 0, 0, 0), -1), kd);
      if (t > T.dedo) { const bal = Math.sin((t - T.dedo) * 3.1) * 4 * tramo(t, T.dedo, T.dedo + 0.3); C.x += bal; }
      // mano lejana: suelta el balón y se va a la boca (palmaditas del bostezo); luego abajo, relajada
      const suelta = tramo(t, T.cadera0, T.cadera1), lsuel = Tr(P(390, 690));
      const lagarre = Tr(P(B_D.x + 100, B_D.y - 4));
      L = mezM(M(lagarre.x, lagarre.y, 0.8, 1, todos(0.6), 1), M(lsuel.x, lsuel.y, 1.55, 1, todos(0.45), 1), suelta);
      const boca = GB.boca(p);
      const kb = tramo(t, T.bosteza0, T.bosteza0 + 0.2) * (1 - tramo(t, T.bosteza1 - 0.06, T.bosteza1 + 0.16));
      const pal = Math.sin((t - T.bosteza0) * 2 * Math.PI / 0.17) * campana(t, T.bosteza0 + 0.14, T.bosteza1 - 0.04);
      L = mezM(L, M(boca.x + 40 + 10 * pal, boca.y + 22, 1.15, 1, dedosDe(0.7, 1, 1, 1, 1), 1), kb);
    }
    p.manoCerca = comoMano(C); p.manoLejos = comoMano(L);
  }
  function lagrimita(g, k) {
    g.save(); g.globalAlpha = k; g.fillStyle = "#a6e1ff"; g.strokeStyle = "#1d5f8a"; g.lineWidth = 3;
    g.beginPath(); g.ellipse(700, 520 + 20 * k, 8, 11, 0, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore();
  }

  /* =====================================================================================
   * EL BALÓN
   * ===================================================================================== */
  const X_PARA = 740;                                            // se para justo delante de la bota de Gabacho
  let GEO = null;
  function preparaGeo() {
    GEO = {};
    const pg = poseG(T.suelta, true);
    GEO.suelta = G.aPantalla(pg, G.tronco(pg)(P(B_G.x, B_G.y - 28)));
    // toque: de la puntera de Gabacho a sus manos
    const pPop = poseD(T.pop, true), pie = pPop.piernas.lejos;
    const o = rotP(GB.PUNTA, pie.ang), punta = GB.aPantalla(pPop, P(pie.tob.x + o.x - 30, pie.tob.y + o.y));
    GEO.pop = P(punta.x, punta.y - RB - 4);
    const pAt = poseD(T.atrapa, true);
    GEO.atrapa = GB.aPantalla(pAt, GB.tronco(pAt)(B_D));
    const pLz = poseD(T.lanza, true);
    GEO.lanza = GB.aPantalla(pLz, GB.tronco(pLz)(bLocalD(T.lanza)));
    const pDd = poseD(T.dedo, true);
    const pd = puntaIndice(GB, pDd.manoCerca);
    GEO.dedo = (() => { const q = GB.aPantalla(pDd, pd); return P(q.x, q.y - RB); })();
  }
  // x del balón en el suelo
  function balonX(t) {
    if (t < T.cae) return 478;
    if (t < T.quita0) return pista(T.rueda, t)[0];
    if (t < T.empuja) return X_PUNTO + 1.6 * Math.sin((t - T.quita1) * 13) * campana(t, T.quita1 - 0.1, T.bajaPie + 0.2);
    const u = fase(t, T.empuja, T.para);
    return X_PUNTO + (X_PARA - X_PUNTO) * (1 - Math.pow(1 - u, 2.1));
  }
  function modoBalon(t) {
    if (t < T.suelta) return "manosG";
    if (t < T.cae) return "aire";
    if (t < T.flick0 + 0.12) return "suelo";
    if (t < T.atrapa) return "aire";
    if (t < T.lanza) return "manosD";
    return "aire";
  }
  // centro del balón en la pantalla
  function posBalon(t) { if (!GEO) preparaGeo(); return memo("b" + t, () => posBalon0(t)); }
  function posBalon0(t) {
    if (t < T.suelta) { const pg = poseG(t, true); const sube = -28 * tramo(t, T.sube0, T.sube1); return G.aPantalla(pg, G.tronco(pg)(P(B_G.x, B_G.y + sube))); }
    if (t < T.cae) return vuelo(T.suelta, GEO.suelta, T.cae, P(478, SUELO - RB), t);
    if (t < T.flick0) {
      const aplasta = 1.5 * tramo(t, T.pisa - 0.02, T.pisa + 0.04) * (1 - tramo(t, T.quita0, T.quita0 + 0.1));
      return P(balonX(t), SUELO - RB + aplasta);
    }
    if (t < T.pop) {
      const pd = poseD(t, true), pie = pd.piernas.lejos, o = rotP(GB.PUNTA, pie.ang);
      const pu = GB.aPantalla(pd, P(pie.tob.x + o.x - 30, pie.tob.y + o.y));
      const k = tramo(t, T.flick0 + 0.05, T.flick1);
      return P(lerp(X_PARA, pu.x, k * 0.6), Math.min(SUELO - RB, lerp(SUELO - RB, pu.y - RB - 4, k)));
    }
    if (t < T.atrapa) return vuelo(T.pop, GEO.pop, T.atrapa, GEO.atrapa, t);
    if (t < T.lanza) { const pd = poseD(t, true); return GB.aPantalla(pd, GB.tronco(pd)(bLocalD(t))); }
    if (t < T.dedo) return vuelo(T.lanza, GEO.lanza, T.dedo, GEO.dedo, t);
    const pd = poseD(t, true), q = GB.aPantalla(pd, puntaIndice(GB, pd.manoCerca));
    return P(q.x + 0.8 * Math.sin(t * 17), q.y - RB);
  }
  // giros del balón: rz (rodar) y ry (girar sobre el dedo)
  function girosBalon(t) {
    let rz = 0.4, ry = 0;
    if (t >= T.suelta) rz += 0.6 * (Math.min(t, T.cae) - T.suelta);
    if (t >= T.cae) rz += (balonX(Math.min(t, T.flick0)) - 478) / RB;
    if (t >= T.flick0) rz -= 3 * (Math.min(t, T.atrapa) - T.flick0);
    if (t >= T.lanza) { rz -= 1.2 * (Math.min(t, T.dedo) - T.lanza); ry += 4 * (Math.min(t, T.dedo) - T.lanza); }
    if (t >= T.dedo) ry += 15 * (t - T.dedo) - 2.5 * (1 - Math.exp(-(t - T.dedo) * 3));
    return { rz, ry };
  }
  let M0 = null;                                                   // transformación de la pantalla (para dibujar el balón desde la capa)
  function dibujaBalon(g, t) {
    const q = posBalon(t), { rz, ry } = girosBalon(t);
    g.save(); g.translate(q.x, q.y);
    const ap = (t > T.cae - 0.01 && t < T.cae + 0.1) ? 0.1 * campana(t, T.cae - 0.01, T.cae + 0.1) : 0;
    if (ap) g.scale(1 + 0.6 * ap, 1 - ap);
    balon(g, RB, rz, ry);
    g.restore();
  }
  function dibujaBalonEnCapa(g, t) { g.save(); g.setTransform(M0); dibujaBalon(g, t); g.restore(); }
  function sombraBalon(g, t) {
    const q = posBalon(t), h = clamp((SUELO - RB - q.y) / 300);
    g.save(); g.fillStyle = `rgba(10,20,10,${0.35 * (1 - 0.7 * h)})`;
    g.beginPath(); g.ellipse(q.x + 3, SUELO + 1, RB * (1.1 - 0.4 * h), 3.6 * (1 - 0.4 * h), 0, 0, Math.PI * 2); g.fill(); g.restore();
  }
  // líneas de giro del balón en el dedo
  function lineasGiro(g, t) {
    const k = tramo(t, T.dedo, T.dedo + 0.2); if (k <= 0) return;
    const q = posBalon(t);
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.85 * k})`; g.lineWidth = 2; g.lineCap = "round";
    for (let i = 0; i < 2; i++) {
      const ph = (t * 3 + i * 0.5) % 1, a0 = Math.PI * (0.15 + 0.7 * ph);
      g.globalAlpha = Math.sin(Math.PI * ph);
      g.beginPath(); g.ellipse(q.x, q.y + 2, RB + 8, 6, 0, a0, a0 + 0.9); g.stroke();
      g.beginPath(); g.ellipse(q.x, q.y + 2, RB + 8, 6, 0, a0 + Math.PI, a0 + Math.PI + 0.9); g.stroke();
    }
    g.restore();
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  // polvo: [t0, x, y, tamaño, dirección]
  const POLVOS = (() => {
    const L = [];
    for (const [tf, x] of APOYOS) if (tf > 6.55) L.push([tf, x, SUELO, 1, -1]);
    L.push([T.frena0 + 0.12, X_FRENA - 10, SUELO, 1.6, 1], [T.frena0 + 0.22, X_FRENA, SUELO, 1.3, 1]);
    for (const [tc, x] of [[7.64, 282], [7.76, 317], [7.88, 297], [8.0, 333]]) L.push([tc, x, SUELO, 0.55, 0]);
    L.push([8.18, 400, SUELO, 0.8, 0]);
    for (const [, t1, x] of SALTOS) L.push([t1, x, SUELO, 0.7, 0]);
    for (const [tf, x] of [[5.3, 28], [5.5, -60], [5.7, -150]]) L.push([tf, x, SUELO, 0.9, 1]);
    for (let i = 0; i < 7; i++) L.push([T.polvo + i * 0.06, -16 + 10 * i, SUELO - 4 - 14 * hash(i), 2.1, 1]);
    return L;
  })();
  function polvo(g, t) {
    g.save();
    for (const [t0, x, y, k, dir] of POLVOS) {
      const u = (t - t0) / 0.6; if (u <= 0 || u >= 1) continue;
      for (let i = 0; i < 5; i++) {
        const h = hash(t0 * 13 + i), a = Math.PI + (i - 2) * 0.45 + dir * 0.5;
        const d = (10 + 26 * h) * salida(u) * k, r = (5 + 7 * h) * k * (0.6 + 0.8 * u);
        g.fillStyle = `rgba(210,200,180,${0.5 * (1 - u)})`;
        g.beginPath(); g.arc(x + Math.cos(a) * d * (dir || (i - 2) * 0.5), y - 4 - Math.abs(Math.sin(a)) * d * 0.5 - 10 * u * k, r, 0, Math.PI * 2); g.fill();
      }
    }
    g.restore();
  }
  function rayasVelocidad(g, t, pg) {
    const k = tramo(t, T.corre0 + 0.2, T.corre0 + 0.35) * (1 - tramo(t, T.frena0, T.frena0 + 0.2));
    if (k <= 0) return;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.7 * k})`; g.lineCap = "round"; g.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      const y = SUELO - 40 - i * 52 + 8 * hash(i), x = pg.x - 70 - 30 * hash(i + 3), L = 60 + 70 * hash(i + 6);
      const ph = (t * 6 + hash(i + 9)) % 1;
      g.globalAlpha = Math.sin(Math.PI * ph);
      g.beginPath(); g.moveTo(x - ph * 40, y); g.lineTo(x - ph * 40 - L, y); g.stroke();
    }
    g.restore();
  }
  // el golpe en el césped: estrella, terrones y la marca (que se queda)
  function estrella(g, x, y, r, puntas, rot, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function marcaCesped(g, t) {
    const k = tramo(t, T.golpe, T.golpe + 0.06); if (k <= 0) return;
    g.save(); g.globalAlpha = k;
    g.fillStyle = "#4a3222"; g.beginPath(); g.ellipse(GOLPE.x + 2, SUELO + 2, 13, 3.6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#2c5e2b"; g.strokeStyle = TINTA; g.lineWidth = 1;
    g.beginPath(); g.moveTo(GOLPE.x - 12, SUELO + 1); g.lineTo(GOLPE.x - 18, SUELO - 6); g.lineTo(GOLPE.x - 6, SUELO - 2); g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  function golpeEfecto(g, t) {
    const u = t - T.golpe; if (u <= 0) return;
    g.save();
    if (u < 0.3) {
      const k = u / 0.3;
      g.globalAlpha = 1 - k;
      estrella(g, GOLPE.x, SUELO - 4, 12 + 22 * salida(k), 8, 0.2, 0.42); g.fillStyle = "#ffe14d"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
      estrella(g, GOLPE.x, SUELO - 4, 6 + 12 * salida(k), 8, 0.5, 0.5); g.fillStyle = "#ffffff"; g.fill();
      g.globalAlpha = 1;
    }
    for (let i = 0; i < 9; i++) {
      const vx = (hash(i) - 0.35) * 160, vy = -180 - 160 * hash(i + 10), x = GOLPE.x + vx * u, y = SUELO - 4 + vy * u + 0.5 * 1400 * u * u;
      if (y > SUELO + 2 || u > 1.2) continue;
      g.fillStyle = i % 3 ? "#3d8a3b" : "#5b3b26"; g.strokeStyle = TINTA; g.lineWidth = 1;
      g.save(); g.translate(x, y); g.rotate(u * 9 * (hash(i + 4) - 0.5)); g.beginPath(); g.rect(-3, -2, 6 + 3 * hash(i + 2), 4); g.fill(); g.stroke(); g.restore();
    }
    for (let i = 0; i < 6; i++) {
      const k = clamp(u / (0.5 + 0.3 * hash(i))); if (k >= 1) continue;
      const a = Math.PI + (hash(i + 7) - 0.5) * 2.4, d = 6 + 30 * salida(k);
      g.fillStyle = `rgba(200,185,160,${0.55 * (1 - k)})`; g.beginPath(); g.arc(GOLPE.x + Math.cos(a) * d, SUELO - 6 + Math.sin(a) * d * 0.5 - 12 * k, 5 + 8 * k, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  // la bota dolorida late: halo rojo y rayitas de dolor
  function dolorPie(g, t, pg) {
    const k = tramo(t, T.duele, T.duele + 0.2); if (k <= 0) return;
    const pie = pg.piernas.lejos, o = rotP(P(110, 70), pie.ang), q = G.aPantalla(pg, P(pie.tob.x + o.x, pie.tob.y + o.y));
    const lat = 0.5 + 0.5 * Math.sin(t * 13);
    g.save();
    const h = g.createRadialGradient(q.x, q.y, 2, q.x, q.y, 26 + 8 * lat); h.addColorStop(0, `rgba(255,60,40,${0.55 * k})`); h.addColorStop(1, "rgba(255,60,40,0)");
    g.fillStyle = h; g.beginPath(); g.arc(q.x, q.y, 34, 0, Math.PI * 2); g.fill();
    g.strokeStyle = `rgba(255,236,120,${0.95 * k})`; g.lineWidth = 2.6; g.lineCap = "round"; g.lineJoin = "round";
    for (let i = 0; i < 4; i++) {
      const a = -0.4 + i * 0.75 + 0.15 * Math.sin(t * 7), r0 = 20 + 5 * lat, r1 = r0 + 12;
      const c = Math.cos(a), s = Math.sin(a), nx = -s * 3, ny = c * 3;
      g.beginPath(); g.moveTo(q.x + c * r0, q.y + s * r0); g.lineTo(q.x + c * (r0 + 4) + nx, q.y + s * (r0 + 4) + ny); g.lineTo(q.x + c * (r0 + 8) - nx, q.y + s * (r0 + 8) - ny); g.lineTo(q.x + c * r1, q.y + s * r1); g.stroke();
    }
    g.restore();
  }
  function destelloGuino(g, t, pd) {
    const k = campana(t, T.guino + 0.02, T.guino + 0.5); if (k <= 0) return;
    const q = GB.aPantalla(pd, GB.cabeza(pd).a(P(900, 529)));
    g.save(); g.globalAlpha = k; estrella(g, q.x - 17, q.y - 3, 9 * k + 3, 4, t * 2, 0.3); g.fillStyle = "#fff6c8"; g.fill(); g.restore();
  }

  /* ---------- decorado: patio trasero del bar al anochecer ---------- */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    // cielo de la hora azul
    const cielo = g.createLinearGradient(0, 0, 0, 190);
    cielo.addColorStop(0, "#1d2353"); cielo.addColorStop(0.55, "#4b3a78"); cielo.addColorStop(1, "#d8805a");
    g.fillStyle = cielo; g.fillRect(0, 0, W, 200);
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,240,${0.3 + 0.5 * hash(i + 5)})`; g.fillRect(hash(i) * W, hash(i + 50) * 80, 1.5, 1.5); }
    // tejados y una chimenea al fondo
    g.fillStyle = "#2a2348";
    g.beginPath(); g.moveTo(0, 150); g.lineTo(70, 120); g.lineTo(180, 120); g.lineTo(230, 146); g.lineTo(420, 146); g.lineTo(450, 112); g.lineTo(560, 112); g.lineTo(600, 140);
    g.lineTo(760, 140); g.lineTo(790, 126); g.lineTo(900, 126); g.lineTo(940, 142); g.lineTo(W, 142); g.lineTo(W, 200); g.lineTo(0, 200); g.closePath(); g.fill();
    g.fillRect(492, 84, 22, 30); g.fillRect(488, 80, 30, 6);
    for (const [x, y] of [[100, 132], [128, 132], [480, 124], [520, 124], [820, 134]]) { g.fillStyle = "#f6c766"; g.fillRect(x, y, 10, 8); }
    // tapia de ladrillo
    const TY = 168, PIE = 470;
    const lad = g.createLinearGradient(0, TY, 0, PIE); lad.addColorStop(0, "#7a3428"); lad.addColorStop(1, "#5c261f");
    g.fillStyle = lad; g.fillRect(0, TY, W, PIE - TY);
    for (let y = TY + 12, f = 0; y < PIE; y += 17, f++) {
      for (let x = (f % 2) * -28, i = 0; x < W; x += 56, i++) {
        const k = hash(f * 37 + i);
        g.fillStyle = `rgba(${150 + 40 * k},${70 + 20 * k},${50 + 15 * k},0.55)`; g.fillRect(x + 1.5, y + 1.5, 53, 14);
      }
      g.fillStyle = "rgba(30,12,10,0.35)"; g.fillRect(0, y, W, 1.5);
    }
    g.fillStyle = "#a59384"; g.fillRect(0, TY - 6, W, 14); g.fillStyle = "#cfbfae"; g.fillRect(0, TY - 6, W, 4);
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(-2, TY - 6, W + 4, 14);
    // puerta trasera del bar con su aplique
    const DX0 = 150, DX1 = 252, DY0 = 270;
    const halo = g.createRadialGradient(201, 248, 6, 201, 290, 190); halo.addColorStop(0, "rgba(255,206,120,0.5)"); halo.addColorStop(1, "rgba(255,206,120,0)");
    g.fillStyle = "#3b2418"; g.fillRect(DX0 - 9, DY0 - 9, DX1 - DX0 + 18, PIE - DY0 + 9);
    g.fillStyle = "#5d7d6a"; g.fillRect(DX0, DY0, DX1 - DX0, PIE - DY0);
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(DX0 - 9, DY0 - 9, DX1 - DX0 + 18, PIE - DY0 + 9); g.strokeRect(DX0, DY0, DX1 - DX0, PIE - DY0);
    g.lineWidth = 1.6; g.strokeRect(DX0 + 12, DY0 + 14, DX1 - DX0 - 24, 70); g.strokeRect(DX0 + 12, DY0 + 100, DX1 - DX0 - 24, PIE - DY0 - 115);
    g.fillStyle = "#e6c35c"; g.beginPath(); g.arc(DX1 - 16, DY0 + 105, 4, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = halo; g.fillRect(0, 140, 420, 340);
    g.fillStyle = "#2a2420"; g.fillRect(193, 238, 16, 6); g.beginPath(); g.moveTo(189, 244); g.lineTo(213, 244); g.lineTo(208, 262); g.lineTo(194, 262); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#ffe7a6"; g.beginPath(); g.ellipse(201, 256, 5, 6, 0, 0, Math.PI * 2); g.fill();
    // ventanuco
    g.fillStyle = "#f2b75c"; g.fillRect(560, 228, 70, 54); g.strokeStyle = "#2c1b14"; g.lineWidth = 6; g.strokeRect(560, 228, 70, 54);
    g.lineWidth = 3; g.beginPath(); g.moveTo(595, 228); g.lineTo(595, 282); g.stroke(); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.strokeRect(556, 224, 78, 62);
    g.fillStyle = "rgba(90,40,10,0.45)"; for (let i = 0; i < 4; i++) g.fillRect(566 + i * 15, 256, 7, 22);
    // suelo: hormigón con un rectángulo de césped artificial
    const sue = g.createLinearGradient(0, PIE, 0, H); sue.addColorStop(0, "#6e6a72"); sue.addColorStop(1, "#47434c");
    g.fillStyle = sue; g.fillRect(0, PIE, W, H - PIE);
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(0, PIE, W, 6);
    const CX0 = 70, CX1 = W + 10, CY0 = 486, CY1 = 590;
    const cesped = g.createLinearGradient(0, CY0, 0, CY1); cesped.addColorStop(0, "#3d8a3b"); cesped.addColorStop(1, "#2f7232");
    g.fillStyle = cesped; g.beginPath(); g.moveTo(CX0 + 26, CY0); g.lineTo(CX1, CY0); g.lineTo(CX1, CY1); g.lineTo(CX0 - 10, CY1); g.closePath(); g.fill();
    for (let i = 0; i < 12; i++) { const x = CX0 + 26 + i * 84; g.fillStyle = i % 2 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
      g.beginPath(); g.moveTo(x, CY0); g.lineTo(x + 84, CY0); g.lineTo(x + 84 - 32, CY1); g.lineTo(x - 32, CY1); g.closePath(); g.fill(); }
    for (let i = 0; i < 900; i++) { const x = CX0 + hash(i) * (CX1 - CX0), y = CY0 + 2 + hash(i + 900) * (CY1 - CY0 - 4);
      g.strokeStyle = hash(i + 7) > 0.5 ? "rgba(120,190,90,0.5)" : "rgba(20,60,25,0.45)"; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (hash(i + 3) - 0.5) * 2, y - 3); g.stroke(); }
    g.strokeStyle = "#1c3d1d"; g.lineWidth = 2; g.beginPath(); g.moveTo(CX0 + 26, CY0); g.lineTo(CX1, CY0); g.moveTo(CX0 + 26, CY0); g.lineTo(CX0 - 10, CY1); g.stroke();
    // líneas pintadas: línea de gol y punto de penalti
    g.fillStyle = "rgba(245,245,235,0.9)";
    g.beginPath(); g.moveTo(PX0 - 60, BASE_PORT - 2); g.lineTo(W + 10, BASE_PORT - 2); g.lineTo(W + 10, BASE_PORT + 3); g.lineTo(PX0 - 62, BASE_PORT + 3); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(X_PUNTO, SUELO + 1, 10, 3.6, 0, 0, Math.PI * 2); g.fill();
    // cajas de cerveza a la izquierda
    for (const [bx, by, col] of [[22, 410, "#2f6db5"], [30, 372, "#2f6db5"], [96, 430, "#e0a325"]]) {
      g.fillStyle = col; g.fillRect(bx, by, 66, 40); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(bx, by, 66, 40);
      g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(bx + 22, by + 8, 22, 7); g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(bx + 3, by + 3, 60, 4);
    }
    for (let i = 0; i < 5; i++) { const x = 36 + i * 12; g.fillStyle = "#3c6e2e"; g.fillRect(x, 352, 7, 20); g.fillRect(x + 2, 344, 3, 9); g.strokeStyle = TINTA; g.lineWidth = 1; g.strokeRect(x, 352, 7, 20); }
    // barril metálico junto a la puerta
    const BX = 276, bar = g.createLinearGradient(BX, 0, BX + 64, 0); bar.addColorStop(0, "#7d8794"); bar.addColorStop(0.4, "#dfe6ee"); bar.addColorStop(1, "#5b6470");
    g.fillStyle = bar; g.fillRect(BX, 410, 64, 66); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(BX, 410, 64, 66);
    g.beginPath(); g.ellipse(BX + 32, 410, 32, 6, 0, 0, Math.PI * 2); g.fillStyle = "#aab3bd"; g.fill(); g.stroke();
    g.lineWidth = 1.5; g.beginPath(); g.moveTo(BX, 428); g.lineTo(BX + 64, 428); g.moveTo(BX, 458); g.lineTo(BX + 64, 458); g.stroke();
    // maceta con planta a la derecha del todo
    g.fillStyle = "#b5532f"; g.beginPath(); g.moveTo(992, 470); g.lineTo(1030, 470); g.lineTo(1024, 430); g.lineTo(996, 430); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? "#2e7a3c" : "#3f9a4a"; g.beginPath(); g.ellipse(1010 + (hash(i) - 0.5) * 30, 418 - hash(i + 9) * 40, 7, 16, (hash(i + 3) - 0.5) * 1.4, 0, Math.PI * 2); g.fill(); g.lineWidth = 1; g.stroke(); }
    // viñeta
    const v = g.createRadialGradient(512, 330, 300, 512, 330, 760); v.addColorStop(0, "rgba(10,5,30,0)"); v.addColorStop(1, "rgba(10,5,30,0.45)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    return c;
  }

  /* ---------- portería pequeña con su red (se cachea aparte) ---------- */
  function creaPorteria() {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    const F = (x, y) => P(x + P_FONDO.x, y + P_FONDO.y);
    const yTop = BASE_PORT - P_ALTO;
    const a = P(PX0, BASE_PORT), b = P(PX1, BASE_PORT), a2 = P(PX0, yTop), b2 = P(PX1, yTop);
    const fa = F(PX0, BASE_PORT), fb = F(PX1, BASE_PORT), fa2 = F(PX0, yTop + 30), fb2 = F(PX1, yTop + 30);
    const red = (pts, abombe) => {
      g.save(); g.beginPath(); M2.curva(g, pts, true, abombe); g.clip();
      g.fillStyle = "rgba(230,235,240,0.08)"; g.fillRect(0, 0, W, H);
      g.strokeStyle = "rgba(235,238,242,0.55)"; g.lineWidth = 1;
      for (let k = -60; k < 60; k++) { g.beginPath(); g.moveTo(PX0 - 100 + k * 14, BASE_PORT + 40); g.lineTo(PX0 - 100 + k * 14 + 300, BASE_PORT - 260); g.stroke();
        g.beginPath(); g.moveTo(PX0 - 100 + k * 14, BASE_PORT - 260); g.lineTo(PX0 - 100 + k * 14 + 300, BASE_PORT + 40); g.stroke(); }
      g.restore();
    };
    const mid = (p, q, dx, dy) => P((p.x + q.x) / 2 + dx, (p.y + q.y) / 2 + dy);
    red([fa, mid(fa, fb, 0, 4), fb, mid(fb, fb2, 10, 0), fb2, mid(fb2, fa2, 0, -6), fa2, mid(fa2, fa, -6, 0)], 0.15);
    red([a2, b2, fb2, fa2], 0);
    red([b, fb, fb2, b2], 0);
    g.lineCap = "round"; g.strokeStyle = "#9aa2ad"; g.lineWidth = 4;
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(fa.x, fa.y); g.lineTo(fb.x, fb.y); g.lineTo(b.x, b.y); g.moveTo(fa.x, fa.y); g.lineTo(fa2.x, fa2.y); g.moveTo(fb.x, fb.y); g.lineTo(fb2.x, fb2.y);
    g.moveTo(a2.x, a2.y); g.lineTo(fa2.x, fa2.y); g.moveTo(b2.x, b2.y); g.lineTo(fb2.x, fb2.y); g.stroke();
    red([a, fa, fa2, a2], 0);
    const tubo = (pts, w) => { g.lineJoin = "round"; g.strokeStyle = TINTA; g.lineWidth = w + 4; g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); g.stroke();
      g.strokeStyle = "#f4f4f0"; g.lineWidth = w; g.stroke(); g.strokeStyle = "rgba(160,170,190,0.6)"; g.lineWidth = w * 0.35; g.stroke(); };
    tubo([a, a2, b2, b], 9);
    g.fillStyle = "rgba(10,20,10,0.25)"; g.beginPath(); g.moveTo(a.x, a.y + 2); g.lineTo(b.x, b.y + 2); g.lineTo(fb.x + 10, fb.y + 6); g.lineTo(fa.x + 10, fa.y + 6); g.closePath(); g.fill();
    return c;
  }

  /* ---------- guirnalda de bombillas ---------- */
  const GUIRNALDA = (() => { const pts = [];
    for (let i = 0; i <= 18; i++) { const u = i / 18, x = -20 + u * (W + 40), y = 96 + 54 * Math.sin(Math.PI * u) - 14 * u; pts.push(P(x, y)); }
    return pts; })();
  function guirnaldaFija(g) {           // cable, portalámparas y halos (en el fondo cacheado)
    g.save(); g.strokeStyle = "#1a1416"; g.lineWidth = 1.6; g.beginPath(); M2.curva(g, GUIRNALDA, false, 0.5); g.stroke();
    for (let i = 1; i < GUIRNALDA.length - 1; i++) {
      const q = GUIRNALDA[i];
      const h = g.createRadialGradient(q.x, q.y + 9, 1, q.x, q.y + 9, 26); h.addColorStop(0, "rgba(255,220,140,0.32)"); h.addColorStop(1, "rgba(255,220,140,0)");
      g.fillStyle = h; g.fillRect(q.x - 26, q.y - 17, 52, 52);
      g.fillStyle = "#2a2226"; g.fillRect(q.x - 2.5, q.y, 5, 4);
    }
    g.restore();
  }
  function guirnalda(g, t) {             // las bombillas titilan un poco
    g.save(); g.lineWidth = 1; g.strokeStyle = TINTA;
    for (let i = 1; i < GUIRNALDA.length - 1; i++) {
      const q = GUIRNALDA[i], k = 0.85 + 0.15 * Math.sin(t * 2.3 + i * 1.7);
      g.fillStyle = ["#ffd36b", "#ff9f6b", "#fff1b0", "#8ee0ff"][i % 4]; g.globalAlpha = 0.75 + 0.25 * k;
      g.beginPath(); g.ellipse(q.x, q.y + 9, 4.2, 5.5, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; g.stroke();
    }
    g.restore();
  }

  /* ---------- balón de fútbol en 3D (icosaedro truncado proyectado) ---------- */
  const FI = (1 + Math.sqrt(5)) / 2;
  const norm = v => { const d = Math.hypot(v[0], v[1], v[2]); return [v[0] / d, v[1] / d, v[2] / d]; };
  const VERT = [[0, 1, FI], [0, 1, -FI], [0, -1, FI], [0, -1, -FI], [1, FI, 0], [1, -FI, 0], [-1, FI, 0], [-1, -FI, 0],
    [FI, 0, 1], [FI, 0, -1], [-FI, 0, 1], [-FI, 0, -1]];
  const ARISTAS = [];
  for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) {
    const d = Math.hypot(VERT[i][0] - VERT[j][0], VERT[i][1] - VERT[j][1], VERT[i][2] - VERT[j][2]);
    if (Math.abs(d - 2) < 0.01) ARISTAS.push([i, j]);
  }
  const PENT = VERT.map((v, i) => {
    const vec = ARISTAS.filter(a => a[0] === i || a[1] === i).map(a => VERT[a[0] === i ? a[1] : a[0]]);
    const n = norm(v), ref = norm([vec[0][0] - v[0], vec[0][1] - v[1], vec[0][2] - v[2]]);
    const b = [n[1] * ref[2] - n[2] * ref[1], n[2] * ref[0] - n[0] * ref[2], n[0] * ref[1] - n[1] * ref[0]];
    return vec.map(w => { const d = [w[0] - v[0], w[1] - v[1], w[2] - v[2]];
      return { a: Math.atan2(d[0] * b[0] + d[1] * b[1] + d[2] * b[2], d[0] * ref[0] + d[1] * ref[1] + d[2] * ref[2]),
        p: norm([v[0] + d[0] / 3, v[1] + d[1] / 3, v[2] + d[2] / 3]) }; }).sort((x, y) => x.a - y.a).map(o => o.p);
  });
  const COSTURAS = ARISTAS.map(([i, j]) => { const a = VERT[i], b = VERT[j];
    return [norm([a[0] + (b[0] - a[0]) / 3, a[1] + (b[1] - a[1]) / 3, a[2] + (b[2] - a[2]) / 3]), norm([a[0] + 2 * (b[0] - a[0]) / 3, a[1] + 2 * (b[1] - a[1]) / 3, a[2] + 2 * (b[2] - a[2]) / 3])]; });
  const mul3 = (A, B) => A.map(f => [0, 1, 2].map(j => f[0] * B[0][j] + f[1] * B[1][j] + f[2] * B[2][j]));
  const BASE_M = (() => { const b1 = 0.5, b2 = 0.35;
    return mul3([[Math.cos(b2), 0, Math.sin(b2)], [0, 1, 0], [-Math.sin(b2), 0, Math.cos(b2)]], [[1, 0, 0], [0, Math.cos(b1), -Math.sin(b1)], [0, Math.sin(b1), Math.cos(b1)]]); })();
  function matriz(rz, ry) {
    const Rz = [[Math.cos(rz), -Math.sin(rz), 0], [Math.sin(rz), Math.cos(rz), 0], [0, 0, 1]];
    const Ry = [[Math.cos(ry), 0, Math.sin(ry)], [0, 1, 0], [-Math.sin(ry), 0, Math.cos(ry)]];
    return mul3(Ry, mul3(Rz, BASE_M));
  }
  const aplica = (Mt, v) => [Mt[0][0] * v[0] + Mt[0][1] * v[1] + Mt[0][2] * v[2], Mt[1][0] * v[0] + Mt[1][1] * v[1] + Mt[1][2] * v[2], Mt[2][0] * v[0] + Mt[2][1] * v[1] + Mt[2][2] * v[2]];
  // dibuja el balón con centro (0,0) y radio r; rz: rodar (eje de profundidad), ry: girar sobre el eje vertical
  function balon(g, r, rz, ry) {
    const Mt = matriz(rz, ry);
    g.save();
    g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fillStyle = "#fbfaf4"; g.fill();
    g.save(); g.clip();
    const proy = v => { const q = aplica(Mt, v); if (q[2] < 0) { const d = Math.hypot(q[0], q[1]) || 1; return { x: q[0] / d * r * 1.02, y: q[1] / d * r * 1.02 }; } return { x: q[0] * r, y: q[1] * r }; };
    g.fillStyle = "#18161c";
    for (let i = 0; i < 12; i++) {
      const c = aplica(Mt, norm(VERT[i])); if (c[2] < -0.45) continue;
      g.beginPath(); PENT[i].forEach((v, k) => { const q = proy(v); if (k) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); }); g.closePath(); g.fill();
    }
    g.strokeStyle = "rgba(70,66,80,0.85)"; g.lineWidth = Math.max(0.8, r * 0.06); g.lineCap = "round";
    for (const [a, b] of COSTURAS) {
      const qa = aplica(Mt, a), qb = aplica(Mt, b); if (qa[2] < 0 && qb[2] < 0) continue;
      let A = qa, B = qb;
      if (A[2] < 0 || B[2] < 0) { const k = A[2] / (A[2] - B[2]); const m = [A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k]; if (A[2] < 0) A = [m[0], m[1], 0]; else B = [m[0], m[1], 0]; }
      g.beginPath(); g.moveTo(A[0] * r, A[1] * r); g.lineTo(B[0] * r, B[1] * r); g.stroke();
    }
    const sm = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, -r * 0.1, -r * 0.1, r * 1.15);
    sm.addColorStop(0, "rgba(255,250,235,0.3)"); sm.addColorStop(0.45, "rgba(255,240,220,0)"); sm.addColorStop(0.8, "rgba(40,40,80,0.22)"); sm.addColorStop(1, "rgba(20,20,50,0.5)");
    g.fillStyle = sm; g.fillRect(-r, -r, 2 * r, 2 * r);
    g.restore();
    g.fillStyle = "rgba(255,255,255,0.85)"; g.beginPath(); g.ellipse(-r * 0.42, -r * 0.46, r * 0.17, r * 0.1, -0.7, 0, Math.PI * 2); g.fill();
    g.lineWidth = Math.max(1.6, r * 0.1); g.strokeStyle = TINTA; g.beginPath(); g.arc(0, 0, r - g.lineWidth / 2, 0, Math.PI * 2); g.stroke();
    g.restore();
  }

  /* ---------- cámara: tiembla un poco con el golpe en el césped ---------- */
  function temblor(t) { const u = t - T.golpe; if (u <= 0 || u > 0.6) return P(0, 0); const k = Math.exp(-u * 7); return P(2.2 * k * Math.sin(u * 55), 1.6 * k * Math.sin(u * 47 + 1)); }

  function pose(t) { return { g: poseG(t), d: poseD(t) }; }

  class GuillermoGabachoPenalti extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !GB.listo()) return;
      if (!fondo) { fondo = creaFondo(); const gf = fondo.getContext("2d"); guirnaldaFija(gf); gf.drawImage(creaPorteria(), 0, 0); }
      if (!GEO) preparaGeo();
      const luz = tramo(t, NEGRO_INICIO, 0.75, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      g.save();
      const tb = temblor(t); g.translate(tb.x, tb.y);
      M0 = g.getTransform();
      const pg = poseG(t), pd = poseD(t), modo = modoBalon(t);
      g.drawImage(fondo, 0, 0);
      guirnalda(g, t);
      marcaCesped(g, t);
      // sombras
      g.save(); g.fillStyle = "rgba(10,20,10,0.32)";
      const sg = clamp(1 - (pg.pelvis.y < G.PELVIS.y - 20 ? 0.3 : 0));
      g.beginPath(); g.ellipse(pg.x + 2, SUELO + 2, 70 * sg, 7, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pd.x, SUELO + 2, 78, 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
      sombraBalon(g, t);
      if (modo === "suelo") dibujaBalon(g, t);
      polvo(g, t);
      rayasVelocidad(g, t, pg);
      GB.dibujar(g, pd, t);
      G.dibujar(g, pg, t);
      if (modo === "aire") dibujaBalon(g, t);
      lineasGiro(g, t);
      golpeEfecto(g, t);
      dolorPie(g, t, pg);
      destelloGuino(g, t, pd);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00071", nombre: "Guillermo y Gabacho · El penalti", crear: () => new GuillermoGabachoPenalti() });
  window.__A2D_00071 = { pose, T, DUR, balon: t => posBalon(t) };
})();
