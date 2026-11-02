"use strict";
/* 00077 · Guillermo y Gabacho · El karaoke
 *
 * Negro → el escenario pequeño de un bar de noche: telón de terciopelo granate con su bambalina de
 * flecos dorados, tarima de madera, un foco que baja del techo con motas de polvo, un amplificador al
 * fondo, una banqueta con una guitarra, una pantalla de karaoke con barras de colores (sin letras) y,
 * delante, las siluetas de las mesitas del público con sus velas.
 * Gabacho canta una balada en el micro del pie de jirafa: ojos cerrados, mano en el corazón, se mece;
 * de su boca salen notas redondas y suaves. Baja la jirafa y se arrodilla con el brazo abierto, muy
 * dramático → Guillermo entra corriendo por la izquierda y aterriza de un salto («¡tachán!»); Gabacho
 * abre un ojo → Guillermo le roba el micro tirando de la jirafa y desafina a pleno pulmón: notas con
 * pinchos, torcidas, que salen disparadas. Gabacho lo recupera; Guillermo se lo vuelve a quitar. Las
 * notas redondas y las de pinchos chocan en el aire y revientan como pompas → se miran mal, agarran los
 * dos el mástil y tiran: el pie se tambalea a un lado y a otro… las manos resbalan, salen despedidos
 * hacia atrás y el pie, suelto, se balancea y cae de espaldas con el micro justo delante del
 * amplificador → ¡acople! Ondas de sonido en zigzag que les echan el pelo hacia atrás (rizos y pinchos
 * peinados por el viento), ojos apretados, el foco parpadea y la pantalla se llena de nieve → silencio:
 * se quedan tiesos, despeinados para siempre, se miran… y se parten de risa señalándose el pelo; los
 * dos miran a cámara y Gabacho guiña → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`. El pie de micro es una cadena de dos tramos
 * (jirafa + micro) que apunta a la boca del que canta; las manos que lo agarran se colocan en sus
 * puntos con aHoja. El pelo despeinado se hace con la propia pieza de la cabeza de cada avatar: se
 * borra el pelo de arriba (se repinta el fondo cacheado y, donde había frente, piel) y se vuelve a
 * dibujar en franjas desplazadas hacia atrás, que ondean con el viento.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, GB = Gabacho;
  const S = 0.29, SUELO = 528, DUR = 14.8, TINTA = "#0b0a0e";
  // pie de micro de jirafa: base, mástil, jirafa y micro (pantalla)
  const XS = 512, BASE_Y = 526, HP = 250, LB = 70, LMIC = 34, KD = 0.25;
  // donde se apoya al caer: la punta del mástil en la esquina de arriba del amplificador
  const APOYO = { th: -0.185, fi: 0.85 };
  // amplificador al fondo (la rejilla mira a cámara)
  const AMP = { x0: 456, x1: 568, y0: 318, y1: 422, cx: 512, cy: 374 };

  const T = {
    canta0: 0.7,
    baja0: 2.75, baja1: 3.45, abre0: 3.25, abre1: 3.75,          // Gabacho baja la jirafa y se arrodilla
    corre0: 4.35, salto0: 4.92, aterriza: 5.36,                  // Guillermo entra corriendo y salta
    ojo: 5.08, sube0: 5.48, sube1: 6.02,                         // Gabacho abre un ojo y se levanta
    roba0: 5.98, roba1: 6.18,                                    // Guillermo le quita el micro
    quita0: 6.68, quita1: 6.9,                                   // Gabacho lo recupera
    roba20: 7.36, roba21: 7.54,                                  // y Guillermo otra vez
    pops: [6.98, 7.44, 7.88],
    miran: 7.95, agarra0: 8.08, agarra1: 8.4,
    suelta: 9.86, tras1: 10.45,
    cae0: 10.26, golpe: 10.6,
    pita0: 10.74, pita1: 12.05,
    mira: 12.55, rie0: 12.85, rie1: 13.72, cam: 13.75, guino: 13.98, fin: 14.2
  };

  /* ---------- utilidades ---------- */
  const P = (x, y) => ({ x, y });
  const rotP = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const dir = a => P(Math.cos(a), Math.sin(a));
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  // interpolación cúbica monótona por claves [t, v…]
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
  const MEMO = new Map();
  function memo(clave, f) { if (MEMO.has(clave)) return MEMO.get(clave); if (MEMO.size > 40) MEMO.clear(); const v = f(); MEMO.set(clave, v); return v; }

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.12, lengua: 0, esp: 0, mof: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: clamp(e.h), apretado: clamp(e.z) },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: clamp(e.mof), rubor: 0, bigote: 0 };
  }
  function parpadeo(t, lista) {
    let o = 0;
    for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); }
    return o;
  }
  // la mirada sigue a un punto de la pantalla
  function miraA(R, p, q, ojo, w) {
    if (!q || w <= 0) return;
    const o = R.aPantalla(p, R.cabeza(p).a(ojo)), dx = (q.x - o.x) * (p.espejo ? -1 : 1), dy = q.y - o.y, d = Math.hypot(dx, dy) || 1;
    p.cara.mirada = mezcla(p.cara.mirada, P(clamp(dx / d * 1.1, -1, 1), clamp(dy / d * 1.1, -1, 1)), w);
  }
  const OJO_G = P(835, 585), OJO_B = P(830, 510);
  // boca cantando: sílabas que abren y cierran
  const silabas = (t, f) => 0.5 + 0.5 * Math.sin(t * f + 1.6 * Math.sin(t * f * 0.31 + 0.7));

  /* ---------- manos ---------- */
  const CERO = { pulgar: 0, indice: 0, medio: 0, anular: 0, menique: 0 };
  const todos = k => ({ pulgar: k, indice: k, medio: k, anular: k, menique: k });
  const dedosDe = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m, anular: a, menique: me });
  const M = (x, y, mu, dedos, dobla, ang = 0) => ({ x, y, mu, ang, puno: 1, dedos, dobla });
  function mezM(a, b, k) {
    const d = {}; for (const n in a.dedos) d[n] = lerp(a.dedos[n], b.dedos[n], k);
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), mu: lerp(a.mu, b.mu, k), ang: lerp(a.ang, b.ang, k), puno: lerp(a.puno, b.puno, k), dedos: d, dobla: lerp(a.dobla, b.dobla, k) };
  }
  const comoMano = m => ({ x: m.x, y: m.y, ang: m.ang, mu: m.mu, dobla: m.dobla, puno: m.puno, dedos: m.dedos });
  // guion de una mano: claves en coordenadas del tronco (Tr) o ya en la hoja ({ hoja: true })
  function rutaMano(t, lista, ini, Tr) {
    const aH = m => { if (m.hoja) return m; const q = Tr(P(m.x, m.y)); return Object.assign({}, m, { x: q.x, y: q.y }); };
    let e = aH(ini);
    for (const [t0, t1, d, f] of lista) { if (t <= t0) break; e = mezM(e, aH(d), (f || suave)(fase(t, t0, t1))); }
    return e;
  }
  // mano que agarra un punto del mundo (pantalla): puño con la muñeca hacia el hombro
  function agarra(R, p, q, hombro, dobla, dedos = CERO) {
    const h = R.aHoja(p, q), sh = R.tronco(p)(hombro);
    const mu = Math.atan2(sh.y - h.y, sh.x - h.x) + 0.35 * dobla;
    return Object.assign(M(h.x, h.y, mu, dedos, dobla), { hoja: true });
  }
  // rodilla de una pierna (hoja), con la misma IK que dibuja el personaje
  function rodilla(R, p, lado) {
    const cad = R.tronco(p)(R.CADERA[lado]), L = R.A.datos.piezas["pierna_" + lado].largo;
    const c = Recortes.ik(cad, p.piernas[lado].tob, L, L * 0.5, 80, 1, 1.03), l1 = c.sj * (c.estira || 1);
    return P(cad.x - Math.sin(c.a1) * l1, cad.y + Math.cos(c.a1) * l1);
  }

  /* ---------- pies: [t0, t1, xDestino, alto] en el mundo ---------- */
  const ANG_PASO = u => 0.28 * Math.sin(Math.PI * u) - 0.05 * Math.sin(2 * Math.PI * u);
  function pieLista(lista, x0, t) {
    let x = x0;
    for (const [t0, t1, xd, alto, ang] of lista) {
      if (t < t0) break;
      const u = fase(t, t0, t1);
      if (u < 1) { const xi = x; return { x: lerp(xi, xd, suave(u)), h: alto * Math.sin(Math.PI * u), a: (ang ?? 1) * ANG_PASO(u) }; }
      x = xd;
    }
    return { x, h: 0, a: 0 };
  }
  const aPierna = (R, p, w, tob) => ({ tob: P(R.aHoja(p, P(w.x, 0)).x, tob - w.h / S), ang: w.a });

  /* =====================================================================================
   * CUERPOS (sin manos): Guillermo
   * ===================================================================================== */
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const RUN = { per: 0.26, apoyo: 0.09, delante: 26, alto: 52 };
  const X_RUN0 = -150, X_RUN1 = 238;
  const xRun = t => lerp(X_RUN0, X_RUN1, (t - T.corre0) / (T.salto0 - T.corre0));
  const V_RUN = (X_RUN1 - X_RUN0) / (T.salto0 - T.corre0);
  const XG_FIN = 332;
  const CLAVES_XG = [[T.aterriza, 398], [T.aterriza + 0.3, 402], [7.98, 402], [8.32, 415], [T.suelta, 415], [T.suelta + 0.12, 405],
    [10.12, 392], [10.32, 360], [10.5, 352], [10.84, 352], [11.3, XG_FIN], [DUR, XG_FIN]];
  function xG(t) {
    if (t < T.corre0) return X_RUN0;
    if (t < T.salto0) return xRun(t);
    if (t < T.aterriza) { const u = fase(t, T.salto0, T.aterriza); return lerp(X_RUN1, 398, u); }
    return pista(CLAVES_XG, t)[0];
  }
  // carrera: apoyos de cada pie [t, x]
  function apoyos(lado) {
    const L = [], off = lado === "cerca" ? 0 : 0.5;
    for (let k = -2; k < 6; k++) { const tf = T.corre0 + (k + off) * RUN.per; if (tf > T.salto0 + 0.01) break; L.push([tf, xRun(tf) + RUN.delante]); }
    return L;
  }
  const APOYOS = { cerca: apoyos("cerca"), lejos: apoyos("lejos") };
  function pieCarrera(lado, t) {
    const L = APOYOS[lado]; let i = 0; for (let k = 0; k < L.length; k++) if (L[k][0] <= t) i = k;
    const [tf, xf] = L[i];
    if (t <= tf + RUN.apoyo || i === L.length - 1) { const u = clamp((t - tf) / RUN.apoyo); return { x: xf, h: 0, a: lerp(-0.1, 0.4, u) }; }
    const [tn, xn] = L[i + 1], toff = tf + RUN.apoyo, u = clamp((t - toff) / (tn - toff));
    const k = suave(clamp((u - 0.1) / 0.9)), h = RUN.alto * Math.sin(Math.PI * Math.pow(u, 0.72));
    const a = u < 0.3 ? lerp(0.4, 1.05, suave(u / 0.3)) : u < 0.75 ? lerp(1.05, 0.15, suave((u - 0.3) / 0.45)) : lerp(0.15, -0.1, suave((u - 0.75) / 0.25));
    return { x: lerp(xf, xn, k), h, a };
  }
  // pasos después de aterrizar (mundo)
  const PASOS_G = {
    cerca: [[T.aterriza, T.aterriza, 380, 0, 0], [5.42, 5.62, 383, 6], [8.0, 8.2, 372, 12], [T.suelta + 0.06, T.suelta + 0.22, 360, 18],
      [10.16, 10.32, 340, 16], [10.86, 11.3, 312, 0, 0]],
    lejos: [[T.aterriza, T.aterriza, 416, 0, 0], [8.12, 8.32, 446, 12], [T.suelta + 0.2, T.suelta + 0.36, 384, 18], [10.3, 10.46, 368, 12],
      [10.86, 11.3, 350, 0, 0]]
  };
  const CG0 = { pel: 0, torso: 0.03, cab: 0, hom: 0 };
  const CG = o => Object.assign({}, CG0, o);
  const CUERPOS_G = {
    base: CG({}), corre: CG({ pel: 22, torso: 0.28, cab: -0.18 }), vuela: CG({ pel: -10, torso: 0.08, cab: -0.12 }),
    aterriza: CG({ pel: 60, torso: 0.16, cab: 0.06 }), tachan: CG({ pel: 6, torso: -0.04, cab: -0.08, hom: 0.4 }),
    roba: CG({ pel: 8, torso: 0.12, cab: 0.06 }), canta: CG({ pel: 14, torso: -0.1, cab: -0.26, hom: 0.3 }),
    pierde: CG({ pel: 10, torso: 0.14, cab: 0.04 }), canta2: CG({ pel: 16, torso: -0.12, cab: -0.3, hom: 0.3 }),
    mira: CG({ pel: 4, torso: 0.08, cab: 0.1 }), agarra: CG({ pel: 26, torso: 0.02, cab: 0.04 }),
    tira: CG({ pel: 44, torso: -0.26, cab: -0.08 }), cede: CG({ pel: 30, torso: 0.12, cab: 0.08 }), tiembla: CG({ pel: 40, torso: -0.16, cab: -0.04 }),
    vuela2: CG({ pel: 30, torso: -0.42, cab: -0.16, hom: 0.3 }), recupera: CG({ pel: 40, torso: -0.08, cab: 0.06 }),
    pita: CG({ pel: 46, torso: -0.24, cab: -0.2, hom: 0.5 }), tieso: CG({ pel: 38, torso: -0.16, cab: -0.1, hom: 0.4 }),
    gira: CG({ pel: 30, torso: -0.06, cab: 0.08, hom: 0.2 }), rie: CG({ pel: 26, torso: 0.1, cab: -0.14, hom: 0.2 }),
    final: CG({ pel: 18, torso: 0.02, cab: -0.04 })
  };
  const GUION_CUERPO_G = [
    [T.corre0 - 0.1, T.corre0 + 0.05, "corre"], [T.salto0 - 0.06, T.salto0 + 0.12, "vuela"], [T.aterriza - 0.02, T.aterriza + 0.08, "aterriza", salida],
    [T.aterriza + 0.12, T.aterriza + 0.42, "tachan"], [T.roba0 - 0.1, T.roba0 + 0.12, "roba"], [T.roba1, T.roba1 + 0.18, "canta"],
    [T.quita0, T.quita0 + 0.16, "pierde"], [T.roba20 - 0.05, T.roba20 + 0.1, "roba"], [T.roba21, T.roba21 + 0.15, "canta2"],
    [T.miran, T.miran + 0.14, "mira"], [T.agarra0, T.agarra1, "agarra"],
    [T.suelta, T.suelta + 0.1, "vuela2", salida], [10.2, 10.5, "recupera"],
    [T.pita0 + 0.02, T.pita0 + 0.12, "pita", salida], [T.pita1, T.pita1 + 0.2, "tieso"], [T.mira, T.mira + 0.25, "gira"],
    [T.rie0, T.rie0 + 0.2, "rie", salida], [T.cam, T.cam + 0.3, "final"]
  ];
  const CARAS_G = {
    inicio: E({ mx: 0.6, my: 0.1, sd: 6, si: 4, sonr: 0.3 }),
    corre: E({ mx: 0.95, my: 0.1, c: 0.15, sd: 14, si: 12, abre: 18, ancho: 0.9, sonr: 0.75 }),
    tachan: E({ mx: 0.9, my: -0.05, c: 0.1, sd: 22, gd: 0.08, si: 20, gi: 0.06, abre: 34, ancho: 1, sonr: 0.85 }),
    roba: E({ mx: 0.9, my: 0.15, c: 0.35, sd: 6, gd: 0.05, si: -6, gi: -0.1, abre: 6, ancho: 0.8, sonr: 0.7 }),
    canta: E({ c: 1, z: 0.75, sd: 24, gd: 0.3, si: 24, gi: 0.3, abre: 50, ancho: 1.04, sonr: -0.35, lengua: 1 }),
    pierde: E({ mx: 0.95, my: 0.05, iris: 0.9, sd: 18, si: 18, abre: 16, ancho: 0.7, sonr: -0.1 }),
    mira: E({ mx: 1, my: 0.05, c: 0.45, sd: -10, gd: -0.24, si: -8, gi: -0.2, abre: 0, ancho: 0.6, sonr: -0.35 }),
    tira: E({ mx: 0.9, my: 0.1, c: 0.55, z: 0.5, sd: -12, gd: -0.25, si: -12, gi: -0.25, abre: 14, ancho: 1.05, sonr: -0.1, mof: 0.3 }),
    vuela: E({ mx: 0.6, my: -0.4, iris: 0.85, sd: 26, gd: 0.1, si: 26, gi: 0.1, abre: 30, ancho: 0.8, sonr: -0.3 }),
    pita: E({ c: 1, z: 1, sd: 16, gd: 0.25, si: 16, gi: 0.25, abre: 34, ancho: 1.06, sonr: -0.7 }),
    tieso: E({ mx: 0.4, my: 0.05, iris: 0.72, sd: 26, si: 26, abre: 8, ancho: 0.5, sonr: -0.15 }),
    mira2: E({ mx: 1, my: 0.0, iris: 0.8, sd: 20, si: 20, abre: 4, ancho: 0.5, sonr: 0.1 }),
    rie: E({ c: 1, h: 1, sd: 16, si: 16, abre: 46, ancho: 1.05, sonr: 0.85 }),
    final: E({ mx: -0.45, my: 0.05, c: 0.3, h: 0.6, sd: 14, gd: 0.05, si: 12, abre: 22, ancho: 1, sonr: 0.9 })
  };
  const GUION_CARA_G = [
    [T.corre0, T.corre0 + 0.1, "corre"], [T.aterriza, T.aterriza + 0.12, "tachan"], [T.roba0 - 0.12, T.roba0 + 0.04, "roba"],
    [T.roba1, T.roba1 + 0.08, "canta"], [T.quita0 + 0.05, T.quita0 + 0.15, "pierde"], [T.quita1 + 0.08, T.quita1 + 0.18, "canta"],
    [T.roba20, T.roba20 + 0.06, "roba"], [T.roba21, T.roba21 + 0.08, "canta"],
    [T.miran, T.miran + 0.1, "mira"], [T.agarra1 - 0.05, T.agarra1 + 0.1, "tira"], [T.suelta, T.suelta + 0.06, "vuela", salida],
    [10.4, 10.55, "tieso"], [T.pita0, T.pita0 + 0.06, "pita", salida], [T.pita1, T.pita1 + 0.1, "tieso"], [T.mira, T.mira + 0.2, "mira2"],
    [T.rie0, T.rie0 + 0.12, "rie", salida], [T.cam, T.cam + 0.25, "final"]
  ];
  const cantaG = t => tramo(t, T.roba1 - 0.12, T.roba1 + 0.04) * (1 - tramo(t, T.miran - 0.12, T.miran + 0.04));

  // geo: solo la geometría (sin miradas ni capas), para que los dos se puedan mirar sin bucles
  function cuerpoG(t, geo = false) { return memo("cg" + geo + t, () => cuerpoG0(t, geo)); }
  function cuerpoG0(t, geo) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "base", t);
    const respira = Math.sin(t * 2.2);
    const x = xG(t);
    let bote = 0, sube = 0;
    if (t > T.corre0 - 0.2 && t < T.salto0) bote = -9 * Math.cos(2 * Math.PI * (t - T.corre0 - RUN.apoyo * 0.5) / (RUN.per * 0.5)) * (1 - tramo(t, T.salto0 - 0.08, T.salto0));
    if (t >= T.salto0 && t < T.aterriza) { const u = fase(t, T.salto0, T.aterriza); sube = 78 * 4 * u * (1 - u); }
    // tirones del pie: se echa atrás cuando tira él y se va hacia delante cuando tira Gabacho
    const tir = tironG(t);
    const temblor = (t > T.pita0 && t < T.pita1 + 0.1) ? ruido(t * 34) * tramo(t, T.pita0, T.pita0 + 0.1) * (1 - tramo(t, T.pita1 - 0.1, T.pita1 + 0.05)) : 0;
    const risa = (t > T.rie0 && t < T.cam + 0.4) ? Math.abs(Math.sin((t - T.rie0) * 2 * Math.PI * 4.2)) * tramo(t, T.rie0, T.rie0 + 0.15) * (1 - tramo(t, T.rie1, T.cam + 0.3)) : 0;
    const p = {
      x, suelo: SUELO, s: S, tirasLimpias: true, ikContinuo: true, hombrosContinuos: true,
      pelvis: { x: G.PELVIS.x + 46 * tir.atras - 20 * tir.cede, y: G.PELVIS.y + b.pel + respira * 1.2 + bote / S * 0.3 - sube / S + 20 * tir.atras - 10 * risa },
      torso: b.torso - 0.3 * tir.atras + 0.12 * tir.cede + 0.01 * temblor + 0.035 * risa, torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.02 * b.hom },
      piernas: {}, cabeza: { ang: b.cab + 0.02 * temblor - 0.05 * risa, dx: 0, dy: -10 * b.hom, esc: { x: 1, y: 1 } }
    };
    // vibrato al desafinar: la cabeza tiembla
    const kCanta = cantaG(t), conMicroG = t < T.agarra0 ? dueno(t) : 0;
    p.cabeza.ang += 0.035 * Math.sin(t * 46) * kCanta * lerp(0.6, 1, conMicroG);
    // pies
    let wc, wl;
    if (t < T.salto0) { wc = pieCarrera("cerca", t); wl = pieCarrera("lejos", t); }
    else if (t < T.aterriza) {
      // en el aire: tijera (el cercano atrás, el lejano adelante) desde donde despegaron, y aterrizan juntos
      const u = fase(t, T.salto0, T.aterriza), s = Math.sin(Math.PI * u);
      const c0 = pieCarrera("cerca", T.salto0), l0 = pieCarrera("lejos", T.salto0);
      wc = { x: lerp(c0.x, 380, suave(u)) - 46 * s, h: lerp(c0.h, 0, suave(u)) + sube + 36 * s, a: lerp(c0.a, 0, suave(u)) + 0.9 * s };
      wl = { x: lerp(l0.x, 416, suave(u)) + 40 * s, h: lerp(l0.h, 0, suave(u)) + sube + 10 * s, a: lerp(l0.a, 0, suave(u)) - 0.25 * s };
    } else { wc = pieLista(PASOS_G.cerca, 380, t); wl = pieLista(PASOS_G.lejos, 416, t); }
    p.piernas.cerca = aPierna(G, p, wc, TOB_G);
    p.piernas.lejos = aPierna(G, p, wl, TOB_G - 8);
    // cara
    const e = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    e.abre += (14 * silabas(t, 19) - 6) * kCanta * lerp(0.75, 1, conMicroG);
    const kPita = tramo(t, T.pita0, T.pita0 + 0.08) * (1 - tramo(t, T.pita1 - 0.1, T.pita1 + 0.05));
    e.abre += 6 * Math.sin(t * 40) * kPita; e.mof += (0.25 + 0.25 * Math.sin(t * 52)) * kPita;
    if (risa > 0) e.abre += 10 * risa;
    p.cara = cara(e, parpadeo(t, [1.0, 5.75, 8.0, 12.32, 13.3]));
    p.sudor = 0.8 * envTiron(t) + 0.6 * tramo(t, T.pita1, T.pita1 + 0.3) * (1 - tramo(t, T.rie0, T.rie0 + 0.3));
    p.enfado = tramo(t, T.miran, T.miran + 0.15) * (1 - tramo(t, T.agarra1 + 0.3, T.agarra1 + 0.6));
    if (geo) return p;
    if (t > T.mira && t < T.cam) miraA(G, p, ojoD(t), OJO_G, tramo(t, T.mira, T.mira + 0.2) * (1 - tramo(t, T.rie0, T.rie0 + 0.1)));
    if (t > 5.42 && t < T.roba0) miraA(G, p, bocaD(t), OJO_G, 0.9 * tramo(t, 5.42, 5.6) * (1 - tramo(t, T.roba0 - 0.12, T.roba0)));
    // pelo al viento (desde el acople)
    const v = viento(t);
    if (v.k > 0.002) p.capaCabeza = (gg, tt) => peloAlViento(gg, tt, PELO_G, v.k, v.v);
    return p;
  }
  // tirones: >0 cuando tira él (se echa atrás) o cuando le arrastran (cede)
  const envTiron = t => tramo(t, T.agarra0 + 0.1, T.agarra1) * (1 - tramo(t, T.suelta, T.suelta + 0.12));
  function tironG(t) {
    const env = envTiron(t); if (env <= 0) return { atras: 0, cede: 0 };
    const th = estadoMastil(t).th;
    return { atras: env * (clamp(-th / 0.14) * 0.6 + 0.5), cede: env * clamp(th / 0.14) * 0.6 };
  }

  /* =====================================================================================
   * CUERPOS (sin manos): Gabacho (mira a la izquierda)
   * ===================================================================================== */
  const TOB_B = GB.SUELO - GB.TOBILLO_ALTO;
  const PB = GB.PELVIS;
  const CLAVES_XD = [[0, 625], [T.baja0 + 0.1, 625], [T.baja1, 641], [T.sube0, 641], [T.sube1, 625], [7.98, 625], [8.32, 610], [T.suelta, 610],
    [T.suelta + 0.12, 620], [10.12, 650], [10.32, 682], [10.5, 690], [10.84, 690], [11.3, 708], [DUR, 708]];
  const xD = t => pista(CLAVES_XD, t)[0];
  // pies (mundo): el cercano va detrás (a la derecha), el lejano delante
  const PASOS_D = {
    cerca: [[T.baja0 + 0.05, T.baja0 + 0.45, 750, 26, 0], [T.sube0 + 0.02, T.sube0 + 0.36, 640, 24], [8.0, 8.2, 652, 12],
      [T.suelta + 0.06, T.suelta + 0.22, 642, 18], [10.18, 10.34, 708, 16], [10.86, 11.3, 724, 0, 0]],
    lejos: [[T.sube1 - 0.12, T.sube1 + 0.06, 605, 8], [8.14, 8.32, 580, 12], [T.suelta + 0.2, T.suelta + 0.36, 662, 18], [10.3, 10.46, 670, 12],
      [10.86, 11.3, 688, 0, 0]]
  };
  const CD0 = { pel: 0, torso: 0.02, cab: 0.04, hom: 0, rod: 0 };
  const CD = o => Object.assign({}, CD0, o);
  const CUERPOS_D = {
    base: CD({}), canta: CD({ pel: 4, torso: -0.05, cab: -0.12 }), baja: CD({ pel: 60, torso: 0.02, cab: -0.04 }),
    rodilla: CD({ pel: 300, torso: -0.08, cab: -0.24, rod: 1, hom: 0.3 }), ojo: CD({ pel: 300, torso: -0.04, cab: -0.06, rod: 1, hom: 0.1 }),
    levanta: CD({ pel: 40, torso: 0.04, cab: 0.02 }), canta2: CD({ pel: 6, torso: -0.06, cab: -0.14 }),
    pierde: CD({ pel: 10, torso: 0.12, cab: 0.06 }), mira: CD({ pel: 4, torso: 0.08, cab: 0.1 }), agarra: CD({ pel: 26, torso: 0.02, cab: 0.04 }),
    vuela2: CD({ pel: 30, torso: -0.42, cab: -0.16, hom: 0.3 }), recupera: CD({ pel: 40, torso: -0.08, cab: 0.06 }),
    pita: CD({ pel: 46, torso: -0.24, cab: -0.2, hom: 0.5 }), tieso: CD({ pel: 38, torso: -0.16, cab: -0.1, hom: 0.4 }),
    gira: CD({ pel: 30, torso: -0.06, cab: 0.08, hom: 0.2 }), rie: CD({ pel: 26, torso: 0.12, cab: -0.16, hom: 0.2 }),
    final: CD({ pel: 18, torso: 0.02, cab: -0.06 })
  };
  const GUION_CUERPO_D = [
    [T.canta0 - 0.3, T.canta0 + 0.2, "canta"], [T.baja0, T.baja0 + 0.3, "baja"], [T.baja0 + 0.3, T.baja1, "rodilla"],
    [T.ojo, T.ojo + 0.2, "ojo"], [T.sube0, T.sube0 + 0.3, "levanta"], [T.sube0 + 0.3, T.sube1, "canta2"],
    [T.roba0, T.roba1, "pierde"], [T.quita0, T.quita1, "canta2"], [T.roba20, T.roba21, "pierde"],
    [T.miran, T.miran + 0.14, "mira"], [T.agarra0, T.agarra1, "agarra"],
    [T.suelta, T.suelta + 0.1, "vuela2", salida], [10.2, 10.5, "recupera"],
    [T.pita0 + 0.02, T.pita0 + 0.12, "pita", salida], [T.pita1, T.pita1 + 0.2, "tieso"], [T.mira, T.mira + 0.25, "gira"],
    [T.rie0, T.rie0 + 0.2, "rie", salida], [T.cam, T.cam + 0.3, "final"]
  ];
  const CARAS_D = {
    inicio: E({ c: 1, h: 0.6, sd: 14, gd: 0.08, si: 16, gi: 0.1, abre: 10, ancho: 0.75, sonr: 0.4 }),
    canta: E({ c: 1, h: 0.6, sd: 18, gd: 0.12, si: 20, gi: 0.14, abre: 16, ancho: 0.78, sonr: 0.35 }),
    rodilla: E({ my: -0.6, c: 0.85, h: 0.25, sd: 28, gd: 0.24, si: 28, gi: 0.24, abre: 26, ancho: 0.82, sonr: 0.15 }),
    ojo: E({ mx: 1, my: 0.15, cd: 1, ci: 0.15, sd: 26, gd: 0.24, si: 6, gi: -0.1, abre: 10, ancho: 0.7, sonr: 0.0 }),
    molesto: E({ mx: 1, my: 0.05, c: 0.4, sd: -8, gd: -0.2, si: -6, gi: -0.18, abre: 0, ancho: 0.6, sonr: -0.3 }),
    canta2: E({ c: 1, h: 0.4, sd: 16, gd: 0.1, si: 22, gi: 0.16, abre: 18, ancho: 0.8, sonr: 0.4 }),
    pierde: E({ mx: 1, my: 0.05, iris: 0.9, sd: 20, si: 20, abre: 14, ancho: 0.72, sonr: -0.15 }),
    mira: E({ mx: 1, my: 0.05, c: 0.45, sd: -10, gd: -0.24, si: -8, gi: -0.2, abre: 0, ancho: 0.6, sonr: -0.35 }),
    tira: E({ mx: 0.9, my: 0.1, c: 0.55, z: 0.5, sd: -12, gd: -0.25, si: -12, gi: -0.25, abre: 14, ancho: 1.05, sonr: -0.1, mof: 0.3 }),
    vuela: E({ mx: 0.6, my: -0.4, iris: 0.85, sd: 26, gd: 0.1, si: 26, gi: 0.1, abre: 30, ancho: 0.8, sonr: -0.3 }),
    pita: E({ c: 1, z: 1, sd: 6, gd: -0.22, si: 6, gi: -0.22, abre: 16, ancho: 1.1, sonr: -0.95 }),
    tieso: E({ mx: 0.4, my: 0.05, iris: 0.72, sd: 26, si: 26, abre: 8, ancho: 0.5, sonr: -0.15 }),
    mira2: E({ mx: 1, my: 0.0, iris: 0.8, sd: 20, si: 20, abre: 4, ancho: 0.5, sonr: 0.1 }),
    rie: E({ c: 1, h: 1, sd: 16, si: 16, abre: 48, ancho: 1.05, sonr: 0.85 }),
    final: E({ mx: -0.4, my: 0.05, c: 0.3, h: 0.5, sd: 12, si: 14, gi: 0.05, abre: 16, ancho: 1, sonr: 0.9 }),
    guino: E({ mx: -0.4, my: 0, ci: 1, sd: 16, gd: 0.06, si: 0, abre: 10, sonr: 0.95, ancho: 1.05 })
  };
  const GUION_CARA_D = [
    [T.canta0 - 0.2, T.canta0 + 0.2, "canta"], [T.baja0 + 0.3, T.baja1, "rodilla"], [T.ojo, T.ojo + 0.12, "ojo"],
    [T.sube0, T.sube0 + 0.2, "molesto"], [T.sube1 - 0.15, T.sube1, "canta2"], [T.roba0 + 0.05, T.roba0 + 0.15, "pierde"],
    [T.roba1 + 0.15, T.roba1 + 0.3, "molesto"], [T.quita1 - 0.05, T.quita1 + 0.1, "canta2"], [T.roba20 + 0.03, T.roba20 + 0.12, "pierde"],
    [T.roba21 + 0.1, T.roba21 + 0.25, "molesto"], [T.miran, T.miran + 0.1, "mira"], [T.agarra1 - 0.05, T.agarra1 + 0.1, "tira"],
    [T.suelta, T.suelta + 0.06, "vuela", salida], [10.4, 10.55, "tieso"], [T.pita0, T.pita0 + 0.06, "pita", salida],
    [T.pita1, T.pita1 + 0.1, "tieso"], [T.mira, T.mira + 0.2, "mira2"], [T.rie0, T.rie0 + 0.12, "rie", salida],
    [T.cam, T.cam + 0.25, "final"], [T.guino, T.guino + 0.1, "guino"]
  ];
  // ¿canta Gabacho? (con o sin micro)
  const cantaD = t => tramo(t, T.canta0 - 0.1, T.canta0 + 0.1) * (1 - tramo(t, T.ojo - 0.1, T.ojo + 0.02))
    + tramo(t, T.sube1 - 0.2, T.sube1) * (1 - tramo(t, T.roba0, T.roba0 + 0.1)) + tramo(t, T.roba1 + 0.25, T.roba1 + 0.4) * (1 - tramo(t, T.miran - 0.12, T.miran + 0.04));

  function cuerpoD(t, geo = false) { return memo("cd" + geo + t, () => cuerpoD0(t, geo)); }
  function cuerpoD0(t, geo) {
    const b = guion(GUION_CUERPO_D, CUERPOS_D, "base", t);
    const respira = Math.sin(t * 2.0 + 1.1);
    const x = xD(t);
    // se mece al cantar
    const mece = Math.sin((t - T.canta0) * 2.4) * (tramo(t, 0.3, 0.9) * (1 - tramo(t, T.baja0 - 0.15, T.baja0 + 0.15)) + tramo(t, T.sube1, T.sube1 + 0.3) * (1 - tramo(t, T.miran - 0.25, T.miran)));
    const tir = tironD(t);
    const temblor = (t > T.pita0 && t < T.pita1 + 0.1) ? ruido(t * 31 + 7) * tramo(t, T.pita0, T.pita0 + 0.1) * (1 - tramo(t, T.pita1 - 0.1, T.pita1 + 0.05)) : 0;
    const risa = (t > T.rie0 && t < T.cam + 0.4) ? Math.abs(Math.sin((t - T.rie0) * 2 * Math.PI * 3.8 + 0.6)) * tramo(t, T.rie0, T.rie0 + 0.15) * (1 - tramo(t, T.rie1, T.cam + 0.3)) : 0;
    const p = { x, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, ikContinuo: true,
      pelvis: { x: PB.x + 8 * mece + 46 * tir.atras - 20 * tir.cede, y: PB.y + b.pel + respira * 1.1 + 20 * tir.atras - 10 * risa },
      torso: b.torso + 0.02 * mece - 0.3 * tir.atras + 0.12 * tir.cede + 0.01 * temblor + 0.035 * risa,
      torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.025 * b.hom },
      piernas: {}, cabeza: { ang: b.cab + 0.05 * mece + 0.02 * temblor - 0.05 * risa, dx: 0, dy: -10 * b.hom, esc: { x: 1, y: 1 } }
    };
    // pies del mundo
    const wc = pieLista(PASOS_D.cerca, 640, t), wl = pieLista(PASOS_D.lejos, 605, t);
    p.piernas.cerca = aPierna(GB, p, wc, TOB_B);
    p.piernas.lejos = aPierna(GB, p, wl, TOB_B - 6);
    // de rodillas: la rodilla cercana en el suelo y los dedos del pie doblados
    if (b.rod > 0.001) {
      const k = b.rod;
      const tc = p.piernas.cerca.tob;
      p.piernas.cerca = { tob: P(tc.x, lerp(tc.y, GB.SUELO - 168, k)), ang: lerp(p.piernas.cerca.ang, 1.22, k) };
    }
    // cara
    const e = guion(GUION_CARA_D, CARAS_D, "inicio", t);
    const conMicroD = t < T.agarra0 ? 1 - dueno(t) : 0;
    e.abre += (12 * silabas(t, 13) - 4) * clamp(cantaD(t)) * lerp(0.7, 1, conMicroD);
    const kPita = tramo(t, T.pita0, T.pita0 + 0.08) * (1 - tramo(t, T.pita1 - 0.1, T.pita1 + 0.05));
    e.abre += 6 * Math.sin(t * 38 + 1) * kPita; e.mof += (0.25 + 0.25 * Math.sin(t * 49 + 1)) * kPita;
    if (risa > 0) e.abre += 10 * risa;
    p.cara = cara(e, parpadeo(t, [5.62, 8.04, 12.3, 13.4]));
    p.sudor = 0.8 * envTiron(t) + 0.6 * tramo(t, T.pita1, T.pita1 + 0.3) * (1 - tramo(t, T.rie0, T.rie0 + 0.3));
    p.enfado = tramo(t, T.miran + 0.03, T.miran + 0.18) * (1 - tramo(t, T.agarra1 + 0.3, T.agarra1 + 0.6));
    if (geo) return p;
    if (t > T.mira && t < T.cam) miraA(GB, p, ojoG(t), OJO_B, tramo(t, T.mira, T.mira + 0.2) * (1 - tramo(t, T.rie0, T.rie0 + 0.1)));
    if (t > T.ojo && t < T.sube0 + 0.4) miraA(GB, p, cabezaG(t), OJO_B, 0.95 * tramo(t, T.ojo, T.ojo + 0.1) * (1 - tramo(t, T.sube0 + 0.2, T.sube0 + 0.4)));
    const v = viento(t);
    if (v.k > 0.002) p.capaCabeza = (gg, tt) => peloAlViento(gg, tt, PELO_B, v.k, v.v);
    return p;
  }
  function tironD(t) {
    const env = envTiron(t); if (env <= 0) return { atras: 0, cede: 0 };
    const th = estadoMastil(t).th;
    return { atras: env * (clamp(th / 0.14) * 0.6 + 0.5), cede: env * clamp(-th / 0.14) * 0.6 };
  }

  // puntos de la cara en pantalla (solo del cuerpo, sin manos)
  const bocaPant = (R, p) => R.aPantalla(p, R.boca(p));
  const bocaG = t => bocaPant(G, cuerpoG(t, true)), bocaD = t => bocaPant(GB, cuerpoD(t, true));
  const ojoG = t => { const p = cuerpoG(t, true); return G.aPantalla(p, G.cabeza(p).a(OJO_G)); };
  const ojoD = t => { const p = cuerpoD(t, true); return GB.aPantalla(p, GB.cabeza(p).a(OJO_B)); };
  const cabezaG = t => { const p = cuerpoG(t, true); return G.aPantalla(p, G.centroCabeza(p)); };

  /* =====================================================================================
   * PIE DE MICRO: mástil (inclinación th en el plano, caída fi hacia el fondo), jirafa (a) y micro (m)
   * ===================================================================================== */
  // ¿quién tiene el micro? 0 = Gabacho, 1 = Guillermo
  function dueno(t) {
    return tramo(t, T.roba0, T.roba1) * (1 - tramo(t, T.quita0, T.quita1)) + tramo(t, T.roba20, T.roba21);
  }
  const tieneMicro = t => t > T.agarra0 ? "" : (dueno(t) > 0.5 ? "G" : "D");
  // objetivo del micro: delante de la boca del que canta
  const objetivo = (boca, lado) => P(boca.x + lado * 40, boca.y + 7);
  function ikMicro(pv, H, lado) {
    const dx = H.x - pv.x, dy = H.y - pv.y, d = Math.hypot(dx, dy);
    const dd = clamp(d, Math.abs(LB - LMIC) + 1, LB + LMIC - 0.5);
    const f0 = Math.atan2(dy, dx), al = Math.acos(clamp((LB * LB + dd * dd - LMIC * LMIC) / (2 * LB * dd), -1, 1));
    const a = f0 - lado * al, e = P(pv.x + LB * Math.cos(a), pv.y + LB * Math.sin(a));
    return { a, m: Math.atan2(H.y - e.y, H.x - e.x) };
  }
  // inclinación del mástil durante los tirones (negativa: hacia Guillermo)
  const CLAVES_TH = [[T.agarra1, 0], [8.62, -0.065], [8.96, 0.06], [9.28, -0.075], [9.58, 0.07], [9.78, 0.0], [T.suelta, 0.0],
    [10.0, 0.07], [10.12, -0.05], [10.22, 0.03], [T.cae0, 0.0]];
  function estadoMastil(t) {
    return memo("m" + t, () => {
      let th = 0, fi = 0;
      if (t > T.agarra1 && t < T.cae0 + 0.01) th = pista(CLAVES_TH, t)[0];
      if (t > T.suelta - 0.15 && t < T.suelta) th += 0.012 * Math.sin(t * 70);                   // tiemblan los dos tirando a la vez
      // cae hacia atrás y a la izquierda, acelerando, hasta apoyarse en la esquina del amplificador; rebota un poco
      if (t > T.cae0) {
        const u = fase(t, T.cae0, T.golpe), k = t < T.golpe ? 0.8 * entrada(u) + 0.2 * u * u : 1;
        const reb = t > T.golpe ? 0.16 * campana(t, T.golpe, T.golpe + 0.15) + 0.05 * campana(t, T.golpe + 0.15, T.golpe + 0.25) : 0;
        th = lerp(th, APOYO.th, k) * (1 - reb); fi = APOYO.fi * k * (1 - reb);
      }
      return { th, fi };
    });
  }
  function pie(t) {
    return memo("p" + t, () => {
      const { th, fi } = estadoMastil(t);
      const base = P(XS, BASE_Y), c = Math.cos(fi) + KD * Math.sin(fi);
      // punto del mástil a la altura h (pantalla)
      const mastil = h => P(base.x + h * Math.sin(th), base.y - h * Math.cos(th) * c);
      const pv = mastil(HP);
      // ángulos de la jirafa y del micro
      let a, m;
      if (t < T.agarra0 + 0.02) {
        const pvR = P(XS, BASE_Y - HP);
        const sD = ikMicro(pvR, objetivo(bocaD(t), -1), 1), sG = ikMicro(pvR, objetivo(bocaG(t), 1), -1);
        const w = suave(dueno(t));
        a = lerp(sD.a, sG.a, w); m = lerp(sD.m, sG.m, w);
      } else {
        // suelto: la jirafa se queda hacia Guillermo y luego cabecea con los tirones
        const s0 = ikMicro(P(XS, BASE_Y - HP), objetivo(bocaG(T.agarra0 + 0.02), 1), -1);
        const u = tramo(t, T.agarra0, T.agarra1);
        // mientras tiran, la jirafa va recta con el mástil (la agarran); el micro cabecea en su pinza.
        // al soltarse, la jirafa queda libre y se bambolea
        const thp = (t > T.agarra1) ? estadoMastil(Math.max(T.agarra1, t - 0.09)).th : 0;
        const libre = tramo(t, T.suelta, T.suelta + 0.1);
        const cabeceo = (-3 * thp + 0.22 * Math.sin((t - T.suelta) * 11) * (1 - tramo(t, T.suelta + 0.4, T.cae0))) * libre;
        a = lerp(s0.a, -Math.PI / 2 + th, u) + cabeceo;
        m = lerp(s0.m, -Math.PI / 2 + th, u) - 4 * thp + 0.12 * Math.sin(t * 11) * u + 1.3 * cabeceo;
        // al caer, la jirafa se descuelga (por la derecha) y se queda colgando delante de la rejilla, balanceándose
        const kc = tramo(t, T.cae0 + 0.06, T.golpe + 0.1, entrada);
        const dt = Math.max(0, t - T.golpe), pend = 0.55 * Math.exp(-3.6 * dt) * Math.sin(10.5 * dt);
        a = lerp(a, 1.38 + pend, kc); m = lerp(m, 1.5 + 1.25 * pend, kc);
      }
      const vb = P(LB * Math.cos(a), LB * Math.sin(a) * c), vm = P(LMIC * Math.cos(m), LMIC * Math.sin(m) * c);
      const fin = P(pv.x + vb.x, pv.y + vb.y), cabeza = P(fin.x + vm.x, fin.y + vm.y);
      const asa = P(fin.x + vm.x * 0.3, fin.y + vm.y * 0.3);
      const jirafa = u => P(pv.x + vb.x * u, pv.y + vb.y * u);
      return { th, fi, c, base, pv, a, m, fin, cabeza, asa, mastil, jirafa, vb, vm };
    });
  }

  /* =====================================================================================
   * MANOS (con el pie de micro ya resuelto)
   * ===================================================================================== */
  const H_G = G.HOMBRO, H_GC = G.HOMBRO_C, H_B = GB.HOMBRO, H_BC = GB.HOMBRO_C;
  const ALT_G = 274, ALT_D = 252;                     // altura del mástil donde agarra cada uno
  function poseG(t) { return memo("g" + t, () => poseG0(t)); }
  function poseG0(t) {
    const p = Object.assign({}, cuerpoG(t)), Tr = G.tronco(p), q = pie(t);
    // carrera: brazos contrarios a las piernas
    const ph = Math.cos(2 * Math.PI * (t - T.corre0) / (2 * RUN.per));
    const correL = M(470 + 130 * ph, 520 - 95 * ph, 1.1 + 0.9 * ph, CERO, 1), correC = M(150 - 170 * ph, 520 + 95 * ph, 1.5 - 0.9 * ph, CERO, -1);
    const vuelaL = M(540, 190, 2.3, dedosDe(1, 1, 1, 1, 1), 1), vuelaC = M(-90, 175, 0.75, dedosDe(1, 1, 1, 1, 1), -1);
    const tachanL = M(590, 330, 2.5, dedosDe(1, 1, 1, 1, 1), 1), tachanC = M(-140, 360, 0.5, dedosDe(1, 1, 1, 1, 1), -1);
    const cantaC = M(-150, 250, 0.36, dedosDe(0.8, 1, 1, 1, 1), -1);
    const punoC = M(-60, 200, 1.0, CERO, -1);
    const reposoL = M(450, 610, -1.9, todos(0.3), 1), reposoC = M(120, 640, -1.6, todos(0.3), -1);
    const tiraC = M(30, 590, -1.2, CERO, -1);
    const escudoL = M(560, 250, 2.3, dedosDe(0.8, 1, 1, 1, 1), 1), escudoC = M(260, 470, -2.6, todos(0.15), -1);
    const senalaL = M(590, 330, Math.PI, dedosDe(0, 1, 0, 0, 0), 1), barrigaC = M(300, 600, -2.4, todos(0.55), -1);
    const listaC = [
      [0, 0.01, correC], [T.salto0 - 0.04, T.salto0 + 0.12, vuelaC], [T.aterriza, T.aterriza + 0.15, tachanC, salida],
      [T.roba0 - 0.05, T.roba1, reposoC], [T.roba1, T.roba1 + 0.2, cantaC], [T.quita0, T.quita0 + 0.2, reposoC],
      [T.quita1 + 0.05, T.quita1 + 0.25, punoC], [T.roba20, T.roba21, reposoC], [T.roba21, T.roba21 + 0.18, cantaC],
      [T.miran, T.miran + 0.15, reposoC], [T.agarra0, T.agarra1, tiraC],
      [T.pita0, T.pita0 + 0.1, escudoC, salida], [T.rie0, T.rie0 + 0.2, barrigaC]
    ];
    let C = rutaMano(t, listaC, correC, Tr);
    // la lejana: carrera, salto, ¡tachán!, el micro, el mástil, escudo y señalar
    const listaL = [[0, 0.01, correL], [T.salto0 - 0.04, T.salto0 + 0.12, vuelaL], [T.aterriza, T.aterriza + 0.15, tachanL, salida],
      [T.miran, T.miran + 0.14, reposoL], [T.pita0, T.pita0 + 0.1, escudoL, salida], [T.rie0 + 0.1, T.rie0 + 0.3, senalaL], [T.cam + 0.05, T.cam + 0.35, reposoL]];
    let L = rutaMano(t, listaL, correL, Tr);
    // agarrar la jirafa (roba) y soltarla cuando Gabacho la recupera
    const enJirafa = (u, k, dd) => { L = mezM(L, agarra(G, p, q.jirafa(u), H_G, 1, CERO), k); };
    const kR1 = tramo(t, T.roba0 - 0.18, T.roba0) * (1 - tramo(t, T.quita0 + 0.04, T.quita0 + 0.16));
    if (kR1 > 0) enJirafa(0.36, kR1, todos(0.3));
    const kR2 = tramo(t, T.roba20 - 0.14, T.roba20) * (1 - tramo(t, T.agarra0, T.agarra0 + 0.14));
    if (kR2 > 0) enJirafa(0.36, kR2, todos(0.3));
    // al perderlo, la mano se queda abierta, estirada hacia el micro
    const kP = tramo(t, T.quita0 + 0.06, T.quita0 + 0.2) * (1 - tramo(t, T.roba20 - 0.2, T.roba20 - 0.05));
    if (kP > 0) { const h = Tr(P(470, 300)); L = mezM(L, M(h.x, h.y, 1.95, dedosDe(0.8, 1, 1, 1, 1), 1), kP); }
    // el mástil, en los tirones
    const kM = tramo(t, T.agarra0, T.agarra1) * (1 - tramo(t, T.suelta, T.suelta + 0.08));
    if (kM > 0) L = mezM(L, agarra(G, p, q.mastil(ALT_G), H_G, 1, CERO), kM);
    // resbalan: las manos suben por el mástil y se abren
    const kS = tramo(t, T.suelta, T.suelta + 0.1) * (1 - tramo(t, T.suelta + 0.1, T.suelta + 0.3));
    if (kS > 0) { const a = aH(Tr, M(600, 330, 2.6, dedosDe(1, 1, 1, 1, 1), 1)); L = mezM(L, a, kS); }
    // tambaleo hacia atrás: molinillo con los dos brazos
    const kT = tramo(t, T.suelta + 0.08, T.suelta + 0.2) * (1 - tramo(t, 10.3, 10.5));
    if (kT > 0) {
      // braceo para no caerse: la lejana por delante y la cercana por detrás, sin pasar por la cara
      const w = Math.sin((t - T.suelta) * 2 * Math.PI * 2.6), w2 = Math.sin((t - T.suelta) * 2 * Math.PI * 2.6 + 2.2);
      const mL = Tr(P(590 - 20 * w, 440 + 120 * w)), mC = Tr(P(-140 + 40 * w2, 420 + 130 * w2));
      L = mezM(L, M(mL.x, mL.y, 2.6 - 0.5 * w, dedosDe(1, 1, 1, 1, 1), 1), kT);
      C = mezM(C, M(mC.x, mC.y, 0.4 + 0.5 * w2, dedosDe(1, 1, 1, 1, 1), -1), kT);
    }
    // acople: la mano tiembla delante de la cara
    if (t > T.pita0 && t < T.pita1 + 0.2) { const s = 7 * ruido(t * 40) * tramo(t, T.pita0, T.pita0 + 0.08) * (1 - tramo(t, T.pita1, T.pita1 + 0.2)); L.x += s; L.y += s * 0.6; }
    // se ríe: la mano que señala se mueve con la risa
    if (t > T.rie0) { L.y += 10 * Math.sin((t - T.rie0) * 26) * (1 - tramo(t, T.rie1, T.cam + 0.2)); }
    p.manoLejos = comoMano(L); p.manoCerca = comoMano(C);
    return p;
  }
  const aH = (Tr, m) => { const q = Tr(P(m.x, m.y)); return Object.assign({}, m, { x: q.x, y: q.y }); };

  function poseD(t) { return memo("d" + t, () => poseD0(t)); }
  function poseD0(t) {
    const p = Object.assign({}, cuerpoD(t)), Tr = GB.tronco(p), q = pie(t);
    const corazonC = M(300, 488, 2.45, dedosDe(0.5, 1, 1, 1, 1), -1);
    const abiertoC = M(-165, 125, 0.64, dedosDe(1, 1, 1, 1, 1), -1);
    const caderaC = M(118, 650, -1.25, CERO, -1);
    const tiraC = M(40, 590, -1.2, CERO, -1);
    const reposoL = M(450, 610, -1.9, todos(0.3), 1);
    const eyL = M(452, 300, 1.95, dedosDe(0.9, 1, 1, 1, 1), 1);
    const escudoL = M(560, 240, 2.3, dedosDe(0.8, 1, 1, 1, 1), 1), escudoC = M(270, 470, -2.6, todos(0.15), -1);
    const senalaL = M(590, 320, Math.PI, dedosDe(0, 1, 0, 0, 0), 1), barrigaC = M(300, 610, -2.4, todos(0.55), -1);
    const listaC = [
      [T.abre0, T.abre1, abiertoC], [T.sube0, T.sube0 + 0.35, caderaC], [T.agarra0, T.agarra1, tiraC],
      [T.pita0, T.pita0 + 0.1, escudoC, salida], [T.rie0, T.rie0 + 0.2, barrigaC]
    ];
    let C = rutaMano(t, listaC, corazonC, Tr);
    // brazo abierto: los dedos se abren en abanico y el brazo flota
    if (t > T.abre0 && t < T.sube0 + 0.3) { C.y += 10 * Math.sin((t - T.abre0) * 3.1) * tramo(t, T.abre0, T.abre1) * (1 - tramo(t, T.sube0, T.sube0 + 0.3)); }
    const listaL = [[T.roba0 + 0.05, T.roba0 + 0.3, eyL], [T.miran, T.miran + 0.14, reposoL], [T.pita0, T.pita0 + 0.1, escudoL, salida],
      [T.rie0 + 0.15, T.rie0 + 0.35, senalaL], [T.cam, T.cam + 0.3, reposoL]];
    let L = rutaMano(t, listaL, reposoL, Tr);
    // la mano del micro (asa) mientras canta y mientras se lo quitan (hasta soltarlo)
    const kA = tramo(t, 0.15, 0.55) * (1 - tramo(t, T.roba0 + 0.04, T.roba0 + 0.14));
    if (kA > 0) L = mezM(L, agarra(GB, p, q.asa, H_B, 1, CERO), kA);
    // la recupera agarrando la jirafa, y la suelta cuando Guillermo se la vuelve a quitar
    const kJ = tramo(t, T.quita0 - 0.16, T.quita0) * (1 - tramo(t, T.roba20 + 0.03, T.roba20 + 0.13));
    if (kJ > 0) L = mezM(L, agarra(GB, p, q.jirafa(0.66), H_B, 1, CERO), kJ);
    const kE = tramo(t, T.roba20 + 0.1, T.roba20 + 0.25) * (1 - tramo(t, T.miran, T.miran + 0.14));
    if (kE > 0) L = mezM(L, eyL.hoja ? eyL : aH(Tr, eyL), kE);
    // el mástil, en los tirones
    const kM = tramo(t, T.agarra0, T.agarra1) * (1 - tramo(t, T.suelta, T.suelta + 0.08));
    if (kM > 0) L = mezM(L, agarra(GB, p, q.mastil(ALT_D), H_B, 1, CERO), kM);
    const kS = tramo(t, T.suelta, T.suelta + 0.1) * (1 - tramo(t, T.suelta + 0.1, T.suelta + 0.3));
    if (kS > 0) { const a = aH(Tr, M(610, 320, 2.6, dedosDe(1, 1, 1, 1, 1), 1)); L = mezM(L, a, kS); }
    const kT = tramo(t, T.suelta + 0.08, T.suelta + 0.2) * (1 - tramo(t, 10.3, 10.5));
    if (kT > 0) {
      const w = Math.sin((t - T.suelta) * 2 * Math.PI * 2.4 + 0.7), w2 = Math.sin((t - T.suelta) * 2 * Math.PI * 2.4 + 2.9);
      const mL = Tr(P(600 - 20 * w, 430 + 130 * w)), mC = Tr(P(-150 + 40 * w2, 410 + 140 * w2));
      L = mezM(L, M(mL.x, mL.y, 2.6 - 0.5 * w, dedosDe(1, 1, 1, 1, 1), 1), kT);
      C = mezM(C, M(mC.x, mC.y, 0.4 + 0.5 * w2, dedosDe(1, 1, 1, 1, 1), -1), kT);
    }
    if (t > T.pita0 && t < T.pita1 + 0.2) { const s = 7 * ruido(t * 37 + 3) * tramo(t, T.pita0, T.pita0 + 0.08) * (1 - tramo(t, T.pita1, T.pita1 + 0.2)); L.x += s; L.y += s * 0.6; }
    if (t > T.rie0) { L.y += 10 * Math.sin((t - T.rie0) * 24 + 1) * tramo(t, T.rie0, T.rie0 + 0.15) * (1 - tramo(t, T.rie1, T.cam + 0.2)); }
    p.manoLejos = comoMano(L); p.manoCerca = comoMano(C);
    return p;
  }

  /* =====================================================================================
   * NOTAS: redondas (Gabacho) y con pinchos (Guillermo); tres parejas chocan y revientan
   * ===================================================================================== */
  const POPS = [[T.pops[0], P(517, 104)], [T.pops[1], P(504, 82)], [T.pops[2], P(529, 116)]];
  const NOTAS = (() => {
    const L = [];
    // Gabacho, solo (de pie y de rodillas)
    for (let t0 = T.canta0 + 0.2, i = 0; t0 < T.ojo - 0.2; t0 += 0.38 + 0.12 * hash(i * 3.3), i++) L.push({ t0, vida: 2.0 + 0.6 * hash(i * 5.1), tipo: "D", i, libre: true });
    // dúo: notas sueltas y las de los choques
    for (let t0 = T.sube1 + 0.05, i = 0; t0 < T.miran - 0.3; t0 += 0.46, i++) if (cantaD(t0) > 0.5) L.push({ t0, vida: 1.5, tipo: "D", i: i + 20, libre: true });
    for (let t0 = T.roba1 + 0.02, i = 0; t0 < T.miran - 0.15; t0 += 0.27, i++) L.push({ t0, vida: 0.9, tipo: "G", i: i + 40, libre: true });
    POPS.forEach(([tc, q], j) => { L.push({ t0: tc - 0.62, vida: 0.62, tipo: "D", i: 60 + j, choca: q }); L.push({ t0: tc - 0.36, vida: 0.36, tipo: "G", i: 70 + j, choca: q }); });
    return L;
  })();
  const ORIGEN = new Map();
  function origenNota(n) {
    if (!ORIGEN.has(n)) { const b = n.tipo === "D" ? bocaD(n.t0) : bocaG(n.t0); ORIGEN.set(n, P(b.x + (n.tipo === "D" ? -46 : 46), b.y - 14)); }
    return ORIGEN.get(n);
  }
  function posNota(n, t) {
    const u = (t - n.t0) / n.vida, o = origenNota(n);
    if (n.choca) {
      // curva suave (redonda) o recta temblona (pinchos) hasta el punto del choque
      const q = n.choca, k = n.tipo === "D" ? suave(u) : salida(u);
      const ctl = n.tipo === "D" ? P(o.x - 10, q.y + 20) : P(lerp(o.x, q.x, 0.5), lerp(o.y, q.y, 0.5) - 10);
      const a = mezcla(o, ctl, k), b = mezcla(ctl, q, k);
      const p = mezcla(a, b, k);
      if (n.tipo === "G") { p.x += 4 * Math.sin(t * 60 + n.i); p.y += 3 * Math.cos(t * 53 + n.i); }
      return p;
    }
    if (n.tipo === "D") {
      // suben despacio, hacia delante (izquierda) y ondulando
      const hx = 45 + 85 * hash(n.i * 1.93), hy = 85 + 55 * hash(n.i * 2.71), ph = 6.3 * hash(n.i * 0.77);
      return P(o.x - hx * u + 13 * Math.sin(u * 5 + ph), o.y - hy * u - 30 * u * u + 7 * Math.sin(u * 7 + ph * 2));
    }
    // pinchos: salen disparadas, torcidas y temblando
    const ang = -1.2 - 0.5 * hash(n.i * 3.1);
    return P(o.x + Math.cos(ang) * 190 * salida(u) * 1.2 + 6 * Math.sin(t * 50 + n.i), o.y + Math.sin(ang) * 190 * salida(u) + 5 * Math.cos(t * 47 + n.i));
  }
  function notaRedonda(g, s, gir, col) {
    g.save(); g.scale(s, s); g.rotate(gir);
    g.lineJoin = "round"; g.lineCap = "round";
    const forma = () => {
      g.beginPath(); g.ellipse(-8, 10, 9.5, 7.2, -0.4, 0, Math.PI * 2);
      g.moveTo(0.5, 8); g.lineTo(0.5, -22); g.quadraticCurveTo(10, -17, 12, -6);
    };
    g.strokeStyle = TINTA; g.lineWidth = 6; forma(); g.stroke();
    g.fillStyle = col; g.beginPath(); g.ellipse(-8, 10, 9.5, 7.2, -0.4, 0, Math.PI * 2); g.fill();
    g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.moveTo(0.5, 8); g.lineTo(0.5, -22); g.quadraticCurveTo(10, -17, 12, -6); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(-11, 7, 3.2, 2, -0.4, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function notaPincho(g, s, gir, col, t, i) {
    g.save(); g.scale(s, s); g.rotate(gir);
    g.lineJoin = "miter"; g.lineCap = "butt";
    const cab = () => { g.beginPath();
      for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2, r = (k % 2 ? 6 : 13) + 1.5 * Math.sin(t * 30 + k + i);
        const x = -8 + Math.cos(a) * r * 1.15, y = 10 + Math.sin(a) * r; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); };
    const palo = () => { g.beginPath(); g.moveTo(2, 4); g.lineTo(-2, -5); g.lineTo(5, -12); g.lineTo(-1, -19); g.lineTo(4, -27); g.lineTo(17, -16); g.lineTo(10, -12); g.lineTo(19, -3); };
    g.strokeStyle = TINTA; g.lineWidth = 7.5; palo(); g.stroke(); cab(); g.lineWidth = 4.5; g.stroke();
    g.fillStyle = col; cab(); g.fill();
    g.strokeStyle = col; g.lineWidth = 3.8; palo(); g.stroke();
    g.fillStyle = TINTA; g.beginPath(); g.arc(-8, 10, 2.2, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  const COL_D = ["#ffb3c7", "#c9b5ff", "#ffe08a", "#a8e6ff"], COL_G = ["#c8f03c", "#ffd13b", "#ff8a3c"];
  function dibujaNotas(g, t) {
    for (const n of NOTAS) {
      const u = (t - n.t0) / n.vida; if (u <= 0 || u >= 1) continue;
      const q = posNota(n, t);
      const nace = salida(clamp(u / 0.18)), muere = n.choca ? 1 : 1 - tramo(u, 0.65, 1);
      g.save(); g.translate(q.x, q.y); g.globalAlpha = muere * clamp(u / 0.08);
      if (n.tipo === "D") {
        const s = (n.i < 20 && n.t0 > T.baja1 ? 1.25 : 1) * 0.95 * nace;
        notaRedonda(g, s, 0.25 * Math.sin(u * 4 + n.i), COL_D[n.i % 4]);
      } else {
        notaPincho(g, 1.12 * nace, 0.4 * Math.sin(t * 13 + n.i) + 0.25, COL_G[n.i % 3], t, n.i);
      }
      g.restore();
    }
  }
  function dibujaPops(g, t) {
    POPS.forEach(([tc, q], j) => {
      const u = fase(t, tc, tc + 0.42); if (u <= 0 || u >= 1) return;
      g.save(); g.translate(q.x, q.y); g.lineCap = "round";
      // anillo de pompa
      g.globalAlpha = 1 - u; g.strokeStyle = "#ffffff"; g.lineWidth = 4 * (1 - u) + 1;
      g.beginPath(); g.arc(0, 0, 8 + 26 * salida(u), 0, Math.PI * 2); g.stroke();
      g.strokeStyle = TINTA; g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, 10 + 26 * salida(u), 0, Math.PI * 2); g.stroke();
      // rayitas de estallido
      g.strokeStyle = j % 2 ? "#ffd13b" : "#ffb3c7"; g.lineWidth = 3.5;
      for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2 + j, r0 = 12 + 24 * salida(u), r1 = r0 + 10 * (1 - u);
        g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); g.stroke(); }
      // gotitas de las dos notas, que caen
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + 0.3, v = 40 + 25 * hash(k + j * 9);
        const x = Math.cos(a) * v * u, y = Math.sin(a) * v * u + 90 * u * u;
        g.fillStyle = k % 2 ? COL_D[(k + j) % 4] : COL_G[(k + j) % 3]; g.beginPath(); g.arc(x, y, 3.2 * (1 - u) + 0.8, 0, Math.PI * 2); g.fill(); }
      g.restore();
      // destello inicial
      const f = campana(t, tc - 0.02, tc + 0.1); if (f > 0) { g.save(); g.globalAlpha = f; g.translate(q.x, q.y); estrella(g, 0, 0, 16 * f + 4, 5, j, 0.4); g.fillStyle = "#fffbe0"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke(); g.restore(); }
    });
  }
  function estrella(g, x, y, r, n, gir, ri = 0.45) {
    g.beginPath();
    for (let k = 0; k < n * 2; k++) { const a = gir + k * Math.PI / n, rr = k % 2 ? r * ri : r; const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; k ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.closePath();
  }

  /* =====================================================================================
   * EL ACOPLE: ondas en zigzag desde el amplificador y el micro; el viento que despeina
   * ===================================================================================== */
  function viento(t) {
    if (t < T.pita0) return { k: 0, v: 0 };
    const sube = tramo(t, T.pita0 + 0.02, T.pita0 + 0.18, salida);
    const queda = 0.72 + 0.28 * (1 - tramo(t, T.pita1, T.pita1 + 0.35));
    const v = tramo(t, T.pita0, T.pita0 + 0.1) * (1 - tramo(t, T.pita1 - 0.05, T.pita1 + 0.12));
    return { k: sube * queda, v };
  }
  function ondas(g, t) {
    if (t < T.pita0 || t > T.pita1 + 0.25) return;
    const fin = 1 - tramo(t, T.pita1, T.pita1 + 0.2);
    const c = P(AMP.cx, AMP.cy - 6);
    g.save(); g.lineJoin = "miter"; g.lineCap = "round";
    for (let k = 0; k < 12; k++) {
      const t0 = T.pita0 + k * 0.13; if (t0 > T.pita1) break;
      const u = (t - t0) / 0.8; if (u <= 0 || u >= 1) continue;
      const r = 20 + 430 * u, a = (1 - u) * fin;
      const zig = 6 + 5 * (1 - u), n = 64;
      const ruta = () => { g.beginPath(); for (let i = 0; i <= n; i++) { const ang = i / n * Math.PI * 2, rr = r + (i % 2 ? zig : -zig);
        const x = c.x + Math.cos(ang) * rr, y = c.y + Math.sin(ang) * rr * 0.62; i ? g.lineTo(x, y) : g.moveTo(x, y); } };
      g.globalAlpha = a * 0.8; ruta(); g.strokeStyle = TINTA; g.lineWidth = 5; g.stroke();
      ruta(); g.strokeStyle = k % 3 === 0 ? "#ff6bd5" : k % 3 === 1 ? "#7ff0ff" : "#ffffff"; g.lineWidth = 2.5; g.stroke();
    }
    // rayos de chirrido
    g.globalAlpha = 0.85 * fin * tramo(t, T.pita0, T.pita0 + 0.06);
    for (let k = 0; k < 7; k++) {
      const ang = -Math.PI + (k + 0.5) / 7 * Math.PI + 0.15 * Math.sin(t * 30 + k), L0 = 60, L1 = 118 + 22 * Math.sin(t * 25 + k * 2);
      g.beginPath(); for (let i = 0; i <= 6; i++) { const r = lerp(L0, L1, i / 6), off = (i % 2 ? 9 : -9);
        const x = c.x + Math.cos(ang) * r - Math.sin(ang) * off, y = c.y + Math.sin(ang) * r * 0.7 + Math.cos(ang) * off; i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.strokeStyle = TINTA; g.lineWidth = 5; g.stroke(); g.strokeStyle = "#fff36b"; g.lineWidth = 2.4; g.stroke();
    }
    g.restore();
  }

  /* ---------- pelo al viento: la pieza de la cabeza de cada avatar, en franjas ---------- */
  // zona del pelo que se mueve (por encima de yRef) y cráneo (lo que se destapa es piel)
  const PELO_G = { R: G, yRef: 470, yTop: 170, A: 165,
    craneo: [[600, 470], [610, 430], [660, 400], [740, 385], [840, 385], [930, 400], [990, 430], [1010, 470]], piel: null };
  const PELO_B = { R: GB, yRef: 432, yTop: 180, A: 190,
    craneo: [[640, 432], [660, 385], [720, 345], [800, 330], [900, 335], [980, 360], [1030, 400], [1046, 432]], piel: null };
  const SC_P = 0.25;
  function prepPelo(Z) {
    const pz = Z.R.A.datos.piezas.cabeza, [ox, oy] = pz.origen, [tw, th] = pz.tam_hoja;
    const w = Math.ceil(tw * SC_P), h = Math.ceil(th * SC_P);
    const lienzo = () => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
    const pelo = lienzo(), gp = pelo.getContext("2d");
    gp.scale(SC_P, SC_P); gp.translate(-ox, -oy); Recortes.pieza(gp, Z.R.A, "cabeza");
    gp.setTransform(1, 0, 0, 1, 0, 0); gp.globalCompositeOperation = "destination-in";
    // se queda solo lo de encima de yRef (con un borde suave)
    const grad = gp.createLinearGradient(0, (Z.yRef - 8 - oy) * SC_P, 0, (Z.yRef - oy) * SC_P);
    grad.addColorStop(0, "rgba(0,0,0,1)"); grad.addColorStop(1, "rgba(0,0,0,0)");
    gp.fillStyle = grad; gp.fillRect(0, 0, w, h);
    gp.globalCompositeOperation = "source-over";
    Z.ox = ox; Z.oy = oy; Z.w = w; Z.h = h; Z.pelo = pelo; Z.tmp = lienzo();
    Z.piel = Z.R.C.piel;
  }
  let M0 = null, fondo = null;
  function peloAlViento(g, t, Z, k, v) {
    if (!Z.pelo || !fondo || !M0) return;
    const { ox, oy, w, h } = Z;
    // 1) borrar el pelo de arriba: fondo cacheado (o piel, dentro del cráneo) con la forma del pelo
    const o = Z.tmp.getContext("2d");
    o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = "source-over"; o.clearRect(0, 0, w, h);
    o.drawImage(Z.pelo, 0, 0);
    o.globalCompositeOperation = "source-in";
    const Mh = g.getTransform();
    const A = new DOMMatrix().scale(SC_P, SC_P).translate(-ox, -oy).multiply(Mh.inverse()).multiply(M0);
    o.setTransform(A); o.drawImage(fondo, 0, 0);
    o.setTransform(new DOMMatrix().scale(SC_P, SC_P).translate(-ox, -oy));
    o.globalCompositeOperation = "source-atop";
    o.beginPath(); Z.craneo.forEach(([x, y], i) => i ? o.lineTo(x, y) : o.moveTo(x, y)); o.lineTo(Z.craneo[Z.craneo.length - 1][0], Z.yRef + 30); o.lineTo(Z.craneo[0][0], Z.yRef + 30); o.closePath();
    o.fillStyle = Z.piel; o.fill();
    o.globalCompositeOperation = "source-over"; o.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(Z.tmp, ox, oy, w / SC_P, h / SC_P);
    // 2) el pelo, en franjas desplazadas hacia atrás (−x del retrato), estiradas y ondeando
    const N = 18, y0 = Z.yTop - 10, y1 = Z.yRef, dh = (y1 - y0) / N;
    for (let j = 0; j < N; j++) {
      const ya = y0 + j * dh, ym = ya + dh / 2;
      const f = Math.pow(clamp((Z.yRef - ym) / (Z.yRef - Z.yTop)), 1.25);
      const ondea = v * (9 * Math.sin(t * 47 + j * 0.9) + 5 * Math.sin(t * 29 + j * 2.3)) * f;
      const dx = -k * Z.A * f + ondea, estira = 1 + 0.22 * k * f, baja = k * 18 * f;
      const sy = (ya - oy) * SC_P, sh = dh * SC_P + 0.6;
      if (sy + sh <= 0 || sy >= h) continue;
      const xFrente = ox + w / SC_P;                       // el borde de delante se queda más quieto que el de atrás
      const dw = (w / SC_P) * estira;
      g.drawImage(Z.pelo, 0, sy, w, sh, xFrente + dx - dw, ya + baja, dw, dh + 0.6 / SC_P);
    }
    // 3) mechones sueltos que salen volando y rayas de viento
    if (v > 0.01) {
      g.save(); g.lineCap = "round";
      for (let i = 0; i < 6; i++) {
        const ph = (t * 2.6 + i / 6) % 1, x = lerp(Z.yRef > 440 ? 960 : 1000, 380, ph), y = lerp(260, 330, hash(i * 7.1)) + 40 * ph * Math.sin(i);
        g.globalAlpha = v * Math.sin(Math.PI * ph) * 0.8; g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 7;
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - 80, y - 14 * Math.sin(t * 20 + i), x - 170, y + 6); g.stroke();
      }
      g.restore();
    }
  }

  /* =====================================================================================
   * DECORADO: escenario pequeño de un bar, de noche
   * ===================================================================================== */
  const W_ = W, H_ = H, Y_FONDO = 410, Y_BORDE = 556;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W_; c.height = H_; const g = c.getContext("2d");
    // telón de terciopelo con pliegues
    const tel = g.createLinearGradient(0, 0, 0, Y_FONDO); tel.addColorStop(0, "#3e0610"); tel.addColorStop(0.5, "#6d0d1c"); tel.addColorStop(1, "#4a0812");
    g.fillStyle = tel; g.fillRect(0, 0, W_, Y_FONDO);
    for (let x = -20; x < W_ + 40; x += 46) {
      const k = hash(x * 0.37);
      const gr = g.createLinearGradient(x, 0, x + 46, 0);
      gr.addColorStop(0, "rgba(20,0,5,0.55)"); gr.addColorStop(0.35, `rgba(255,90,110,${0.1 + 0.08 * k})`); gr.addColorStop(0.55, "rgba(255,120,130,0.04)"); gr.addColorStop(1, "rgba(20,0,5,0.5)");
      g.fillStyle = gr; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 10, 200, x - 6, 300, x + 4, Y_FONDO); g.lineTo(x + 50, Y_FONDO); g.bezierCurveTo(x + 40, 300, x + 56, 200, x + 46, 0); g.closePath(); g.fill();
    }
    // bambalina arriba con ondas y flecos dorados
    g.fillStyle = "#5a0a17";
    g.beginPath(); g.moveTo(0, 0); g.lineTo(W_, 0); g.lineTo(W_, 40);
    for (let i = 8; i >= 0; i--) { const x0 = i * (W_ / 8), xm = x0 - W_ / 16; g.quadraticCurveTo(xm + W_ / 16 * 0, 74, x0 - W_ / 8, 40); }
    g.closePath(); g.fill();
    g.strokeStyle = "#2a0309"; g.lineWidth = 2; g.stroke();
    for (let i = 0; i < 8; i++) {
      const x0 = i * (W_ / 8), x1 = x0 + W_ / 8;
      g.strokeStyle = "rgba(255,120,140,0.18)"; g.lineWidth = 6; g.beginPath(); g.moveTo(x0 + 12, 42); g.quadraticCurveTo((x0 + x1) / 2, 62, x1 - 12, 42); g.stroke();
      for (let k = 0; k <= 24; k++) {
        const u = k / 24, x = lerp(x0, x1, u), y = 40 + 34 * 4 * u * (1 - u) * 0.98;
        g.strokeStyle = k % 2 ? "#e6b24f" : "#b8832c"; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 0.5, y + 11); g.stroke();
      }
      g.strokeStyle = "#f0c66a"; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, 40); g.quadraticCurveTo((x0 + x1) / 2, 74, x1, 40); g.stroke();
    }
    // tarima: tablas de madera en perspectiva
    const tar = g.createLinearGradient(0, Y_FONDO, 0, Y_BORDE); tar.addColorStop(0, "#4a2a17"); tar.addColorStop(1, "#7b4a28");
    g.fillStyle = tar; g.fillRect(0, Y_FONDO, W_, Y_BORDE - Y_FONDO);
    const VX = 512, VY = -500;
    for (let i = -14; i <= 14; i++) {
      const xb = 512 + i * 74, xt = VX + (xb - VX) * (Y_FONDO - VY) / (Y_BORDE - VY);
      g.strokeStyle = "rgba(25,10,4,0.55)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(xt, Y_FONDO); g.lineTo(xb, Y_BORDE); g.stroke();
      g.strokeStyle = "rgba(255,200,140,0.08)"; g.lineWidth = 1; g.beginPath(); g.moveTo(xt + 2, Y_FONDO); g.lineTo(xb + 3, Y_BORDE); g.stroke();
    }
    for (let i = 0; i < 40; i++) { const x = hash(i * 3.3) * W_, y = lerp(Y_FONDO + 6, Y_BORDE - 6, hash(i * 7.7));
      g.fillStyle = "rgba(25,10,4,0.4)"; g.fillRect(x, y, 2, 1.2); }
    g.fillStyle = "rgba(0,0,0,0.45)"; g.fillRect(0, Y_FONDO, W_, 5);
    // borde de la tarima y frente
    g.fillStyle = "#b3773f"; g.fillRect(0, Y_BORDE - 4, W_, 6);
    const fr = g.createLinearGradient(0, Y_BORDE, 0, H_); fr.addColorStop(0, "#2a150a"); fr.addColorStop(1, "#120804");
    g.fillStyle = fr; g.fillRect(0, Y_BORDE + 2, W_, H_ - Y_BORDE);
    g.strokeStyle = TINTA; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, Y_BORDE - 4); g.lineTo(W_, Y_BORDE - 4); g.moveTo(0, Y_BORDE + 2); g.lineTo(W_, Y_BORDE + 2); g.stroke();
    // banqueta con guitarra a la izquierda
    banquetaGuitarra(g);
    // pantalla de karaoke (marco, pie y ruedas; la imagen es dinámica)
    pantallaFija(g);
    // amplificador (cuerpo; el cono y la luz son dinámicos)
    amplificador(g);
    // cono de luz del foco y su charco en la tarima
    const cono = g.createLinearGradient(0, 0, 0, SUELO);
    cono.addColorStop(0, "rgba(255,240,200,0.22)"); cono.addColorStop(1, "rgba(255,236,190,0.08)");
    g.fillStyle = cono; g.beginPath(); g.moveTo(452, 0); g.lineTo(572, 0); g.lineTo(830, SUELO); g.lineTo(194, SUELO); g.closePath(); g.fill();
    const charco = g.createRadialGradient(512, SUELO, 20, 512, SUELO, 330);
    charco.addColorStop(0, "rgba(255,236,190,0.35)"); charco.addColorStop(1, "rgba(255,236,190,0)");
    g.save(); g.translate(512, SUELO); g.scale(1, 0.16); g.translate(-512, -SUELO); g.fillStyle = charco; g.beginPath(); g.arc(512, SUELO, 330, 0, Math.PI * 2); g.fill(); g.restore();
    // viñeta
    const vg = g.createRadialGradient(512, 300, 260, 512, 300, 720); vg.addColorStop(0, "rgba(10,0,8,0)"); vg.addColorStop(1, "rgba(10,0,8,0.55)");
    g.fillStyle = vg; g.fillRect(0, 0, W_, H_);
    return c;
  }
  function banquetaGuitarra(g) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // banqueta alta
    g.strokeStyle = TINTA; g.lineWidth = 7; g.beginPath(); g.moveTo(132, 352); g.lineTo(116, 436); g.moveTo(186, 352); g.lineTo(204, 436); g.moveTo(160, 356); g.lineTo(162, 430); g.stroke();
    g.strokeStyle = "#5a3a22"; g.lineWidth = 4; g.beginPath(); g.moveTo(132, 352); g.lineTo(116, 436); g.moveTo(186, 352); g.lineTo(204, 436); g.moveTo(160, 356); g.lineTo(162, 430); g.stroke();
    g.strokeStyle = "#5a3a22"; g.lineWidth = 3; g.beginPath(); g.moveTo(124, 400); g.lineTo(196, 400); g.stroke();
    g.fillStyle = "#8a2e2e"; g.beginPath(); g.ellipse(159, 350, 36, 9, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.15)"; g.beginPath(); g.ellipse(150, 347, 18, 3, 0, 0, Math.PI * 2); g.fill();
    // guitarra apoyada
    g.save(); g.translate(206, 432); g.rotate(-0.16);
    g.fillStyle = "#d4893b"; g.strokeStyle = TINTA; g.lineWidth = 2.4;
    g.beginPath(); g.ellipse(0, -22, 30, 26, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(0, -62, 23, 21, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#d4893b"; g.fillRect(-22, -64, 44, 30);
    g.fillStyle = "#2a160b"; g.beginPath(); g.arc(0, -50, 9, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#3a2110"; g.fillRect(-5, -150, 10, 92); g.strokeRect(-5, -150, 10, 92);
    g.fillStyle = "#2a160b"; g.fillRect(-7, -168, 14, 20); g.strokeRect(-7, -168, 14, 20);
    g.fillStyle = "#3a2110"; g.fillRect(-12, -12, 24, 5);
    g.strokeStyle = "rgba(240,230,200,0.7)"; g.lineWidth = 0.8; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 1.6, -150); g.lineTo(i * 1.6, -10); g.stroke(); }
    g.restore();
    g.restore();
  }
  const PANT = { x0: 830, y0: 218, x1: 962, y1: 306 };
  function pantallaFija(g) {
    g.save(); g.lineJoin = "round";
    // pie con ruedas
    g.strokeStyle = TINTA; g.lineWidth = 6; g.beginPath(); g.moveTo(896, 306); g.lineTo(896, 418); g.moveTo(860, 420); g.lineTo(932, 420); g.stroke();
    g.strokeStyle = "#555a66"; g.lineWidth = 3; g.beginPath(); g.moveTo(896, 306); g.lineTo(896, 418); g.moveTo(860, 420); g.lineTo(932, 420); g.stroke();
    for (const x of [862, 930]) { g.fillStyle = "#222"; g.beginPath(); g.arc(x, 424, 4.5, 0, Math.PI * 2); g.fill(); }
    // marco
    g.fillStyle = "#1b1c22"; g.strokeStyle = TINTA; g.lineWidth = 2.5;
    g.beginPath(); g.roundRect(PANT.x0 - 9, PANT.y0 - 9, PANT.x1 - PANT.x0 + 18, PANT.y1 - PANT.y0 + 18, 8); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(PANT.x0 - 6, PANT.y0 - 7, PANT.x1 - PANT.x0 + 12, 3);
    g.fillStyle = "#e33"; g.beginPath(); g.arc(PANT.x1 + 2, PANT.y1 + 4, 1.8, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function pantalla(g, t) {
    const { x0, y0, x1, y1 } = PANT, w = x1 - x0, h = y1 - y0;
    g.save(); g.beginPath(); g.roundRect(x0, y0, w, h, 4); g.clip();
    const nieve = tramo(t, T.pita0, T.pita0 + 0.05) * (1 - tramo(t, T.pita1 + 0.1, T.pita1 + 0.4));
    if (nieve < 0.999) {
      const bg = g.createLinearGradient(0, y0, 0, y1); bg.addColorStop(0, "#1c1f6e"); bg.addColorStop(1, "#5a1d7a");
      g.fillStyle = bg; g.fillRect(x0, y0, w, h);
      // estrellitas que pasan
      for (let i = 0; i < 10; i++) { const x = x0 + ((hash(i) * w + t * 14 * (0.5 + hash(i + 4))) % w), y = y0 + hash(i + 9) * h * 0.4 + 4;
        g.fillStyle = "rgba(255,255,255,0.6)"; g.fillRect(x, y, 1.6, 1.6); }
      // dos barras de «letra» (sin letras): se llenan de color al ritmo, con la pelotita que bota encima
      const linea = Math.floor((t - 0.3) / 2.4), u = ((t - 0.3) / 2.4) % 1;
      for (let r = 0; r < 2; r++) {
        const by = y0 + 46 + r * 22, bx = x0 + 12 + (r ? 10 : 0), bw = w - 24 - (r ? 20 : 0);
        g.fillStyle = "rgba(255,255,255,0.75)"; g.beginPath(); g.roundRect(bx, by, bw, 9, 4.5); g.fill();
        const lleno = r === 0 ? clamp(u * 1.6) : clamp(u * 1.6 - 0.6);
        g.fillStyle = (linea % 2) ? "#ff7ad9" : "#5ef2ff"; g.beginPath(); g.roundRect(bx, by, bw * lleno, 9, 4.5); g.fill();
        if (lleno > 0 && lleno < 1) { const px = bx + bw * lleno, py = by - 6 - 9 * Math.abs(Math.sin(t * 9));
          g.fillStyle = "#fff36b"; g.beginPath(); g.arc(px, py, 3.6, 0, Math.PI * 2); g.fill(); }
      }
    }
    if (nieve > 0.001) {
      g.globalAlpha = nieve;
      g.fillStyle = "#8a8a8a"; g.fillRect(x0, y0, w, h);
      for (let i = 0; i < 160; i++) { const k = hash(i * 1.37 + Math.floor(t * 60) * 0.71); g.fillStyle = k > 0.5 ? "#f2f2f2" : "#222";
        g.fillRect(x0 + hash(i * 3.1 + Math.floor(t * 60)) * w, y0 + hash(i * 5.3 + Math.floor(t * 60) * 1.3) * h, 3, 2); }
      const yb = y0 + ((t * 160) % h); g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(x0, yb, w, 6);
      g.globalAlpha = 1;
    }
    // brillo del cristal
    g.fillStyle = "rgba(255,255,255,0.07)"; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + w * 0.5, y0); g.lineTo(x0 + w * 0.2, y1); g.lineTo(x0, y1); g.closePath(); g.fill();
    g.restore();
  }
  function amplificador(g) {
    const { x0, x1, y0, y1 } = AMP;
    g.save(); g.lineJoin = "round";
    g.fillStyle = "rgba(0,0,0,0.4)"; g.beginPath(); g.ellipse((x0 + x1) / 2, y1 + 2, 70, 7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#17161a"; g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.roundRect(x0, y0, x1 - x0, y1 - y0, 7); g.fill(); g.stroke();
    // panel de mandos
    g.fillStyle = "#2b2a30"; g.fillRect(x0 + 6, y0 + 6, x1 - x0 - 12, 14);
    for (let i = 0; i < 6; i++) { const x = x0 + 18 + i * 15; g.fillStyle = "#d8d2c4"; g.beginPath(); g.arc(x, y0 + 13, 3.6, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1; g.stroke(); }
    // rejilla
    g.fillStyle = "#2e2a26"; g.fillRect(x0 + 8, y0 + 26, x1 - x0 - 16, y1 - y0 - 34);
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 1;
    for (let x = x0 + 10; x < x1 - 8; x += 4) { g.beginPath(); g.moveTo(x, y0 + 26); g.lineTo(x, y1 - 8); g.stroke(); }
    for (let y = y0 + 28; y < y1 - 8; y += 4) { g.beginPath(); g.moveTo(x0 + 8, y); g.lineTo(x1 - 8, y); g.stroke(); }
    g.strokeStyle = "#b9a66a"; g.lineWidth = 2; g.strokeRect(x0 + 8, y0 + 26, x1 - x0 - 16, y1 - y0 - 34);
    // esquineras metálicas
    for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) { g.fillStyle = "#9aa0a8"; g.beginPath(); g.arc(x, y, 5, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke(); }
    g.restore();
  }
  function amplificadorVivo(g, t) {
    const { x0, y0, cx, cy } = AMP;
    // el cono del altavoz (se intuye tras la rejilla) bombea con el acople
    const bombeo = (t > T.pita0 && t < T.pita1) ? 0.5 + 0.5 * Math.sin(t * 90) : 0;
    g.save();
    g.globalAlpha = 0.35 + 0.35 * bombeo; g.strokeStyle = "#5c544a"; g.lineWidth = 2;
    g.beginPath(); g.arc(cx, cy + 4, 30 + 4 * bombeo, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(cx, cy + 4, 10 + 2 * bombeo, 0, Math.PI * 2); g.stroke();
    g.globalAlpha = 1;
    // piloto: rojo; durante el acople parpadea blanco
    const on = (t > T.pita0 && t < T.pita1) ? (Math.sin(t * 70) > 0 ? 1 : 0.4) : 0;
    g.fillStyle = on > 0.5 ? "#fff6c0" : "#ff2a2a"; g.beginPath(); g.arc(x0 + 104, y0 + 13, 2.8, 0, Math.PI * 2); g.fill();
    const halo = g.createRadialGradient(x0 + 104, y0 + 13, 0, x0 + 104, y0 + 13, 9); halo.addColorStop(0, "rgba(255,60,60,0.6)"); halo.addColorStop(1, "rgba(255,60,60,0)");
    g.fillStyle = halo; g.fillRect(x0 + 94, y0 + 3, 20, 20);
    g.restore();
    // humo después del acople
    const hu = fase(t, T.pita1 - 0.05, T.pita1 + 1.6);
    if (hu > 0 && hu < 1) {
      g.save();
      for (let i = 0; i < 9; i++) { const ui = clamp(hu * 1.25 - i * 0.03); if (ui <= 0 || ui >= 1) continue;
        g.globalAlpha = 0.13 * Math.sin(Math.PI * ui); g.fillStyle = "#b9b4c4";
        g.beginPath(); g.arc(x0 + 40 + (i % 4) * 11 + 18 * Math.sin(ui * 4 + i), y0 + 20 - 120 * ui - 8 * i * ui, 5 + 16 * ui, 0, Math.PI * 2); g.fill(); }
      g.restore();
    }
  }

  /* ---------- el pie de micro ---------- */
  function dibujaPie(g, t) {
    const q = pie(t), { base, pv, fin, cabeza, fi } = q;
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    // cable: del micro al suelo y al amplificador
    const caida = P((fin.x + base.x) / 2 + 14, BASE_Y - 6);
    g.strokeStyle = "#111014"; g.lineWidth = 2.6;
    g.beginPath(); g.moveTo(fin.x, fin.y); g.quadraticCurveTo(fin.x + 18 * Math.sin(t * 2 + 1), lerp(fin.y, BASE_Y, 0.7), caida.x, caida.y);
    g.quadraticCurveTo(AMP.x1 + 10, BASE_Y - 10, AMP.x1 - 14, AMP.y1 - 4); g.stroke();
    // base: disco que se levanta al caer
    const lev = Math.sin(fi);
    g.save(); g.translate(base.x, base.y - 8 * lev); g.rotate(q.th * 0.6);
    g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse(0, 4 + 8 * lev, 30, 5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#2a2b31"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.ellipse(0, 0, 26, 6 + 14 * lev, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.2)"; g.beginPath(); g.ellipse(-8, -2 - 6 * lev, 10, 1.6 + 3 * lev, 0, 0, Math.PI * 2); g.fill();
    g.restore();
    // mástil cromado con su rosca a media altura
    const tubo = (a, b, w) => {
      g.strokeStyle = TINTA; g.lineWidth = w + 3.5; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
      g.strokeStyle = "#8d939d"; g.lineWidth = w; g.stroke();
      g.strokeStyle = "rgba(255,255,255,0.65)"; g.lineWidth = w * 0.3; g.beginPath(); g.moveTo(a.x - w * 0.18, a.y); g.lineTo(b.x - w * 0.18, b.y); g.stroke();
    };
    const m1 = q.mastil(0), m2 = q.mastil(HP * 0.55);
    tubo(m1, m2, 6.5); tubo(m2, pv, 4.6);
    g.fillStyle = "#1d1e23"; g.strokeStyle = TINTA; g.lineWidth = 1.5; g.beginPath(); g.ellipse(m2.x, m2.y, 6.5, 4, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    // jirafa con contrapeso
    const atras = P(pv.x - q.vb.x * 0.36, pv.y - q.vb.y * 0.36);
    tubo(atras, fin, 3.6);
    g.fillStyle = "#30323a"; g.beginPath(); g.ellipse(atras.x, atras.y, 7, 6, q.a, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = "#1d1e23"; g.beginPath(); g.arc(pv.x, pv.y, 5.5, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#c9ccd2"; g.beginPath(); g.arc(pv.x + 5, pv.y - 1, 2.6, 0, Math.PI * 2); g.fill(); g.stroke();
    // micro: pinza, mango negro y rejilla cromada
    const vm = q.vm, Lm = Math.hypot(vm.x, vm.y) || 1, ux = vm.x / Lm, uy = vm.y / Lm;
    g.strokeStyle = TINTA; g.lineWidth = 9; g.beginPath(); g.moveTo(fin.x, fin.y); g.lineTo(fin.x + vm.x * 0.72, fin.y + vm.y * 0.72); g.stroke();
    g.strokeStyle = "#232328"; g.lineWidth = 6.5; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.25)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(fin.x - uy * 1.8, fin.y + ux * 1.8); g.lineTo(fin.x + vm.x * 0.7 - uy * 1.8, fin.y + vm.y * 0.7 + ux * 1.8); g.stroke();
    g.fillStyle = "#3a3b41"; g.beginPath(); g.arc(fin.x, fin.y, 4.2, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke();
    const rj = P(cabeza.x - ux * 2, cabeza.y - uy * 2);
    const gr = g.createRadialGradient(rj.x - 2.5, rj.y - 2.5, 1, rj.x, rj.y, 9); gr.addColorStop(0, "#f4f6f8"); gr.addColorStop(1, "#7b818a");
    g.fillStyle = gr; g.beginPath(); g.arc(rj.x, rj.y, 8, 0, Math.PI * 2); g.fill();
    g.save(); g.clip(); g.strokeStyle = "rgba(40,40,50,0.55)"; g.lineWidth = 0.8;
    for (let i = -8; i <= 8; i += 2.6) { g.beginPath(); g.moveTo(rj.x + i, rj.y - 9); g.lineTo(rj.x + i, rj.y + 9); g.stroke(); g.beginPath(); g.moveTo(rj.x - 9, rj.y + i); g.lineTo(rj.x + 9, rj.y + i); g.stroke(); }
    g.restore();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.arc(rj.x, rj.y, 8, 0, Math.PI * 2); g.stroke();
    g.restore();
  }

  /* ---------- delante: siluetas de las mesitas con velas ---------- */
  function mesitas(g, t) {
    g.save();
    for (const [cx, dirx] of [[70, 1], [960, -1]]) {
      g.fillStyle = "#0e0709";
      // sillas
      g.beginPath(); g.roundRect(cx - 120 * dirx - 20, 548, 40, 70, 8); g.fill();
      // mesa redonda
      g.beginPath(); g.ellipse(cx, 572, 118, 18, 0, 0, Math.PI * 2); g.fill();
      g.fillRect(cx - 8, 572, 16, 40);
      // borde iluminado por el escenario
      g.strokeStyle = "rgba(255,170,110,0.35)"; g.lineWidth = 1.5; g.beginPath(); g.ellipse(cx, 572, 118, 18, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
      // vela en su vaso
      const vx = cx + 34 * dirx, fl = 1 + 0.12 * Math.sin(t * 13 + cx) + 0.08 * Math.sin(t * 31 + cx);
      const halo = g.createRadialGradient(vx, 556, 2, vx, 556, 46 * fl); halo.addColorStop(0, "rgba(255,170,80,0.45)"); halo.addColorStop(1, "rgba(255,170,80,0)");
      g.fillStyle = halo; g.fillRect(vx - 50, 506, 100, 100);
      g.fillStyle = "rgba(200,40,40,0.75)"; g.fillRect(vx - 7, 552, 14, 16);
      g.fillStyle = "#ffd27a"; g.beginPath(); g.ellipse(vx, 548 - 2 * fl, 2.6, 5 * fl, 0.1 * Math.sin(t * 9), 0, Math.PI * 2); g.fill();
      // copa y botella en silueta
      g.fillStyle = "#0e0709"; const bx = cx - 30 * dirx;
      g.beginPath(); g.moveTo(bx - 8, 556); g.lineTo(bx + 8, 556); g.lineTo(bx + 1.5, 545); g.lineTo(bx + 1.5, 534); g.lineTo(bx + 9, 528); g.lineTo(bx - 9, 528); g.lineTo(bx - 1.5, 534); g.lineTo(bx - 1.5, 545); g.closePath(); g.fill();
      const ox = cx - 64 * dirx; g.beginPath(); g.roundRect(ox - 8, 520, 16, 36, 4); g.fill(); g.fillRect(ox - 3, 504, 6, 18);
      g.strokeStyle = "rgba(255,170,110,0.4)"; g.lineWidth = 1; g.beginPath(); g.moveTo(ox + 6 * dirx, 524); g.lineTo(ox + 6 * dirx, 552); g.stroke();
    }
    g.restore();
  }
  // motas de polvo en el haz del foco
  function motas(g, t) {
    g.save();
    for (let i = 0; i < 34; i++) {
      const y = (hash(i * 1.7) * SUELO + t * (6 + 8 * hash(i))) % SUELO, half = lerp(60, 318, y / SUELO);
      const x = 512 + (hash(i * 2.9) * 2 - 1) * half * 0.9 + 6 * Math.sin(t * 0.8 + i);
      g.globalAlpha = 0.25 + 0.35 * Math.sin(t * 1.3 + i * 1.7) ** 2; g.fillStyle = "#fff4d6";
      g.beginPath(); g.arc(x, y, 0.9 + hash(i * 4.1) * 1.3, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  // estrellitas al guiñar
  function destelloGuino(g, t, pd) {
    const k = campana(t, T.guino + 0.02, T.guino + 0.5); if (k <= 0) return;
    const q = GB.aPantalla(pd, GB.cabeza(pd).a(P(900, 529)));
    g.save(); g.globalAlpha = k; estrella(g, q.x - 16, q.y - 3, 9 * k + 3, 4, t * 2, 0.3); g.fillStyle = "#fff6c8"; g.fill(); g.restore();
  }
  // líneas de impacto cuando el pie cae
  function golpePie(g, t) {
    const u = fase(t, T.golpe, T.golpe + 0.35); if (u <= 0 || u >= 1) return;
    const q = pie(t), c = q.pv;
    g.save(); g.globalAlpha = 1 - u; g.strokeStyle = "#fff"; g.lineWidth = 3; g.lineCap = "round";
    for (let k = 0; k < 7; k++) { const a = Math.PI + k / 6 * Math.PI, r0 = 18 + 20 * u, r1 = r0 + 14;
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0 * 0.5); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1 * 0.5); g.stroke(); }
    g.fillStyle = "rgba(220,200,170,0.5)"; for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(c.x - 30 + k * 12, c.y - 4 - 12 * u * hash(k), 4 + 6 * u, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // polvo al aterrizar y al salir despedidos
  function polvo(g, t) {
    for (const [t0, x, n] of [[T.aterriza, 398, 1], [T.suelta + 0.2, 400, -1], [T.suelta + 0.2, 640, 1], [T.pita0 + 0.08, 336, -1], [T.pita0 + 0.08, 704, 1]]) {
      const u = fase(t, t0, t0 + 0.6); if (u <= 0 || u >= 1) continue;
      g.save(); g.fillStyle = "rgba(230,205,170,0.5)";
      for (let k = 0; k < 6; k++) { const s = k % 2 ? 1 : -1; g.globalAlpha = 0.6 * (1 - u);
        g.beginPath(); g.arc(x + s * (14 + 40 * u) * (0.6 + 0.5 * hash(k + t0)) * (n > 0 ? 1 : 1), SUELO - 6 - 14 * u * hash(k * 2 + t0), 5 + 9 * u, 0, Math.PI * 2); g.fill(); }
      g.restore();
    }
  }
  // líneas de velocidad de la carrera
  function rayasCarrera(g, t, pg) {
    const k = tramo(t, T.corre0, T.corre0 + 0.1) * (1 - tramo(t, T.salto0 + 0.1, T.aterriza));
    if (k <= 0) return;
    g.save(); g.globalAlpha = 0.7 * k; g.strokeStyle = "#ffe9c4"; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < 5; i++) { const y = SUELO - 70 - i * 46 + 6 * Math.sin(t * 20 + i), x = pg.x - 70 - 12 * i;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - 50 - 20 * hash(i), y); g.stroke(); }
    g.restore();
  }

  /* ---------- cámara: tiembla con el acople y se acerca un poco al final ---------- */
  function camara(t) {
    let x = 0, y = 0;
    if (t > T.pita0 && t < T.pita1 + 0.2) { const k = tramo(t, T.pita0, T.pita0 + 0.05) * (1 - tramo(t, T.pita1 - 0.1, T.pita1 + 0.2)); x = 2.6 * k * Math.sin(t * 61); y = 2 * k * Math.sin(t * 53 + 1); }
    const u = tramo(t, T.pita1 + 0.2, T.fin + 0.4), z = 1 + 0.05 * u;
    return { x, y, z };
  }

  function pose(t) { return { g: poseG(t), d: poseD(t) }; }

  class GuillermoGabachoKaraoke extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !GB.listo()) return;
      if (!fondo) { fondo = creaFondo(); prepPelo(PELO_G); prepPelo(PELO_B); }
      const luz = tramo(t, NEGRO_INICIO, 0.75, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(512 + cam.x, 330 + cam.y); g.scale(cam.z, cam.z); g.translate(-512, -330);
      M0 = g.getTransform();
      const pg = poseG(t), pd = poseD(t);
      g.drawImage(fondo, 0, 0);
      pantalla(g, t);
      amplificadorVivo(g, t);
      // sombras en la tarima
      g.save(); g.fillStyle = "rgba(20,8,4,0.35)";
      const sg = clamp(1 - (pg.pelvis.y < G.PELVIS.y - 60 ? 0.4 : 0));
      if (pg.x > -100) { g.beginPath(); g.ellipse(pg.x + 2, SUELO + 2, 66 * sg, 7, 0, 0, Math.PI * 2); g.fill(); }
      g.beginPath(); g.ellipse(pd.x - 4, SUELO + 2, 74, 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
      dibujaPie(g, t);
      golpePie(g, t);
      polvo(g, t);
      rayasCarrera(g, t, pg);
      ondas(g, t);
      GB.dibujar(g, pd, t);
      if (pg.x > -130) G.dibujar(g, pg, t);
      dibujaNotas(g, t);
      dibujaPops(g, t);
      motas(g, t);
      destelloGuino(g, t, pd);
      mesitas(g, t);
      // el foco parpadea con el acople
      const envP = tramo(t, T.pita0, T.pita0 + 0.12) * (1 - tramo(t, T.pita1 - 0.1, T.pita1 + 0.15));
      const parp = envP * (0.09 + 0.07 * Math.sin(t * 31) * Math.sin(t * 13 + 1));
      if (parp > 0.001) { g.fillStyle = `rgba(0,0,0,${parp})`; g.fillRect(-20, -20, W_ + 40, H_ + 40); }
      const flash = campana(t, T.pita0 - 0.04, T.pita0 + 0.24);
      if (flash > 0) { g.fillStyle = `rgba(255,250,235,${0.16 * flash})`; g.fillRect(-20, -20, W_ + 40, H_ + 40); }
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W_, H_); }
    }
  }
  registrar({ id: "00077", nombre: "Guillermo y Gabacho · El karaoke", crear: () => new GuillermoGabachoKaraoke() });
  window.__A2D_00077 = { pose, T, DUR, pie: t => pie(t) };
})();
