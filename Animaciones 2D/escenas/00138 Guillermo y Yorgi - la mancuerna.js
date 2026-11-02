"use strict";
/* 00138 · Guillermo y Yorgi · La mancuerna
 *
 * Negro → el rincón de pesas de un gimnasio: pared de bloques verde azulado con una franja naranja,
 * a la izquierda la pared de espejos (con sus brillos), en el centro el mueble de mancuernas con las
 * cabezas hexagonales en fila (falta una), carteles con iconos (un bíceps, un rayo, un corazón con su
 * latido), un banco plano con una toalla y un botellín, dos kettlebells, lámparas colgantes de nave
 * y suelo de caucho con motitas de colores.
 *
 * Yorgi juega con una mancuerna enorme de hierro: la sopesa y se la pasa de una mano a otra, dando
 * una vuelta en el aire cada vez, y la recoge con un golpe de muñeca. Guillermo la sigue con los
 * ojos y la cabeza, alucinando. Yorgi le levanta una ceja («¿quieres?»); Guillermo asiente, saca las
 * manos y Yorgi se la lanza. La caza al vuelo y pone cara de chulo… y el peso le arrastra: primero
 * caen los brazos, luego el cuerpo (se le doblan las rodillas, encorvado). Tiembla, colorado, la sube
 * hasta el pecho con un esfuerzo enorme, se tambalea hacia atrás y cae de espaldas como un tablón:
 * ¡pum!, nube de polvo, la mancuerna rebota sobre su pecho y se queda encima. Atrapado: solo se le
 * mueven los brazos y la cabeza. Estrellitas; levanta la cabeza y ve la mancuerna, empuja un disco
 * sin conseguir nada, boquea, sacude el brazo en el aire y da tres palmadas en el suelo (se rinde).
 * Yorgi, aguantándose la risa con la mano en la boca, se acerca paseando con las manos en los
 * bolsillos por detrás de él, se da la vuelta, se agacha y la levanta con un dedo debajo de la barra.
 * La hace botar en el dedo, la caza por un disco y la aprieta: el disco se aplasta y chirría (era de
 * gomaespuma). Otra vez. Guillermo la mira inexpresivo, con un tic en el ojo… y se levanta tieso como
 * una tabla, girando sobre los talones. Se da la vuelta, se sacude la camiseta y el hombro y saca
 * bíceps con la barbilla alta, como si nada (un brillito en su bracito). Yorgi se parte de risa con
 * la mancuerna colgando; los dos miran a cámara, Yorgi la aprieta una última vez (¡ñic!) → negro.
 *
 * Tumbado, Guillermo es su muñeco girado 90° alrededor de la pelvis (como en 00043): la cara mira a
 * cámara, la espalda está en el suelo y la mancuerna (vista de lado: ▮—▮) descansa en el borde de su
 * pecho. Todo pasa por un «marco» (giro, posición de la pelvis en el mundo y aplastamiento para darse
 * la vuelta): las manos se piden en coordenadas del mundo y se pasan a la hoja del muñeco. La
 * mancuerna también vive en el mundo: en las manos de Yorgi, en el aire (parábola con media vuelta;
 * el dibujo es simétrico y no salta), en las de Guillermo, en su pecho, en el dedo y en el puño. Se
 * dibuja como objeto de la mano que la lleva (debajo de sus dedos). Sin textos. Todo depende de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, ruido, hash } = M2;
  const G = Guillermo, Y = Yorgi;
  const DUR = 14.4, TAU = Math.PI * 2, TINTA = "#0b0a0e";
  const P = (x, y) => ({ x, y });
  const rot = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return P(q.x * c - q.y * s, q.x * s + q.y * c); };
  const sub = (a, b) => P(a.x - b.x, a.y - b.y), add = (a, b) => P(a.x + b.x, a.y + b.y), mul = (a, k) => P(a.x * k, a.y * k);
  const len = q => Math.hypot(q.x, q.y);
  const norm = q => { const l = len(q) || 1; return P(q.x / l, q.y / l); };
  const lerpP = (a, b, k) => P(lerp(a.x, b.x, k), lerp(a.y, b.y, k));
  const angDif = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const lerpAng = (a, b, k) => a + angDif(a, b) * k;
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const golpecito = (t, t0, d) => { const u = fase(t, t0, t0 + d); return u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * Math.pow(u, 0.55)); };
  const KF = (arr, f) => { arr.f = f; return arr; };
  function claves(lista, t) {
    if (t <= lista[0][0]) return lista[0].slice(1);
    for (let i = 1; i < lista.length; i++) if (t < lista[i][0]) {
      const a = lista[i - 1], b = lista[i], k = (b.f || suave)(fase(t, a[0], b[0]));
      return a.slice(1).map((v, j) => lerp(v, b[j + 1], k));
    }
    return lista[lista.length - 1].slice(1);
  }

  /* ---------- guion (s) ---------- */
  const T = {
    // 1 · Yorgi juega con la mancuerna
    tiros: [[0.62, 1.04], [1.3, 1.72], [1.98, 2.4]],        // cercana → lejana → cercana → lejana
    ofrece: 2.5, ceja: 2.56, gSi: 2.7, gSaca0: 2.9, gSaca1: 3.22,
    carga0: 3.0, suelta: 3.3, atrapa: 3.86,
    // 2 · el peso
    cae0: 4.18, cae1: 4.32, sube0: 4.6, sube1: 4.96, atras0: 4.96, vuelca0: 5.2, golpe: 5.6,
    // 3 · atrapado
    mira: 6.15, empuja0: 6.4, empuja1: 6.95, palmas: [7.12, 7.4, 7.68],
    yHop0: 5.3, yHop1: 5.64, yTapa0: 5.72, yTapa1: 6.1, yAnda0: 6.15, yAnda1: 7.5, yGira0: 7.52, yGira1: 7.78,
    yAgacha0: 7.86, engancha: 8.28, levanta1: 8.78, bota0: 8.92, bota1: 9.2,
    yPaso0: 8.9, yPaso1: 9.26, aprieta: [[9.32, 9.44], [9.58, 9.7]], cuelga0: 9.86, cuelga1: 10.2,
    tic: [9.98, 10.12, 10.24], yAtras0: 9.96, yAtras1: 10.42, ySale0: 11.3, ySale1: 11.64,
    // 4 · como si nada
    alza0: 10.48, alza1: 11.0, gGira0: 11.1, gGira1: 11.36, sacude: [11.42, 11.6, 11.8], saca0: 11.92, saca1: 12.16, brillo: 12.22,
    yRisa0: 12.08, yRisa1: 12.9, camara: 12.92, ultimo: 13.22, fin: 13.6
  };

  /* =====================================================================================
   * DISPOSICIÓN (px de pantalla, antes de la cámara)
   * ===================================================================================== */
  const S = 0.30, SUELO = 548, FONDO = 26, SUELO_Y1 = SUELO - FONDO, SUELO_Y2 = SUELO - 40, SUELO_Y3 = SUELO - 14;
  // Yorgi va por detrás: 26 px más al fondo (al 97 %); detrás de la cabeza de Guillermo, 40 px; al final vuelve a 14 px
  const XY0 = 300, XYA = 205, XY1 = 694, XY1B = 736, XY2 = 790, XY3 = 770;   // Yorgi: jugando, apartado, al recogerla, pasito, al apartarse y al final
  const XG0 = 540;                             // Guillermo (su muñeco siempre en x = XG0; lo mueve el marco)
  const LYG = SUELO - 57;                      // pelvis de Guillermo tumbado
  const MP = { hx: 26, pw: 13, ph: 33, hr: 6.5 };   // mancuerna (px): media barra, medio disco, medio alto, radio barra
  const PLACA = MP.hx + MP.pw;                 // del centro al centro de un disco

  /* =====================================================================================
   * UTILIDADES DE POSTURA: marco (giro + posición + aplastamiento) y manos en el mundo
   * ===================================================================================== */
  function marco(R, p, phi, Wp, sx = 1) {
    const Pp = R.aPantalla(p, p.pelvis);
    const aMundo = q => { const r = add(Wp, rot(sub(q, Pp), phi)); return P(Wp.x + (r.x - Wp.x) * sx, r.y); };
    const aRig = w => add(Pp, rot(sub(P(Wp.x + (w.x - Wp.x) / sx, w.y), Wp), -phi));
    return { phi, W: Wp, Pp, sx, aMundo, aRig };
  }
  const enMundo = (Q, q) => Q.M.aMundo(Q.R.aPantalla(Q.p, q));
  const aHojaM = (Q, w) => Q.R.aHoja(Q.p, Q.M.aRig(w));
  function dirHoja(Q, d) { const r = rot(d, -Q.M.phi); if (Q.p.espejo) r.x = -r.x; return r; }
  const hombroH = (Q, lado) => Q.R.tronco(Q.p)(lado === "cerca" ? Q.R.HOMBRO_C : Q.R.HOMBRO);
  const hombroM = (Q, lado) => enMundo(Q, hombroH(Q, lado));
  const largoBrazo = (R, lado) => lado === "cerca" ? R.BRAZO_C_L : R.BRAZO_L;
  const R_M = R => R.MUNECA_R * R.JK;

  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const D5 = (pu, ix, md, an, me) => ({ pulgar: pu, indice: ix, medio: md ?? ix, anular: an ?? ix, menique: me ?? ix });
  const PUNO = D5(0.08, 0.04), ABIERTA = D5(1, 1), FLOJA = D5(0.55, 0.6, 0.55, 0.5, 0.45), BOLS_D = D5(0.4, 0.4),
    DEDO = D5(0.1, 1, 0, 0, 0), AGARRA = D5(0.3, 0.18, 0.16, 0.14, 0.12), APRIETA = D5(0.05, 0, 0, 0, 0),
    PALMA = D5(0.8, 1, 1, 0.98, 0.95), GARRA = D5(0.85, 0.72, 0.66, 0.6, 0.55), LACIA = D5(0.7, 0.85, 0.8, 0.75, 0.7),
    TAPA = D5(0.85, 0.95, 0.95, 0.9, 0.85);
  const mezD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp((a || PUNO)[n] ?? 0, (b || PUNO)[n] ?? 0, k); return o; };

  // mano con centro c (mundo); o.codo: dirección (mundo) de la mano al codo; si no, hacia el hombro (+ o.gira)
  function manoW(Q, lado, c, o = {}) {
    const h = aHojaM(Q, c), hom = hombroH(Q, lado);
    let mu;
    if (o.codo) { const u = dirHoja(Q, norm(o.codo)); mu = Math.atan2(u.y, u.x); }
    else mu = Math.atan2(hom.y - h.y, hom.x - h.x) + (o.gira || 0);
    return { x: h.x, y: h.y, mu, ang: 0, puno: o.puno ?? 1, espejo: !!o.esp, dobla: o.dobla ?? -1, dedos: o.dedos || FLOJA };
  }
  // espejo de la mano con el que el pulgar sale hacia `pulgar` (mundo)
  function espPulgar(Q, haciaCodo, pulgar) {
    const u = dirHoja(Q, norm(haciaCodo)), d = dirHoja(Q, norm(pulgar));
    return (-u.y * d.x + u.x * d.y) < 0;
  }
  function mezMano(a, b, k) {
    if (k <= 0) return a; if (k >= 1) return b;
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), mu: lerpAng(a.mu, b.mu, k), ang: 0, puno: lerp(a.puno ?? 1, b.puno ?? 1, k),
      espejo: k < 0.5 ? a.espejo : b.espejo, dobla: k < 0.5 ? a.dobla : b.dobla, dedos: mezD(a.dedos, b.dedos, k) };
  }
  // pista: [t0, t1, fn(Q, t) → mano, curva]
  function pista(lista, Q, t) {
    let c = lista[0][2](Q, t);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, fn, f] = lista[i];
      if (t <= t0) break;
      c = mezMano(c, fn(Q, t), (f || suave)(fase(t, t0, t1)));
    }
    return c;
  }
  // la mano no va más lejos de lo que da el brazo
  function alcanza(Q, m, lado, k = 1.05) {
    const R = Q.R, h = hombroH(Q, lado), L = largoBrazo(R, lado) * k;
    const o = P(Math.cos(m.mu) * R_M(R), Math.sin(m.mu) * R_M(R));
    const dx = m.x + o.x - h.x, dy = m.y + o.y - h.y, d = Math.hypot(dx, dy);
    if (d > L) { const f = L / d; m.x = h.x + dx * f - o.x; m.y = h.y + dy * f - o.y; }
    return m;
  }
  function alcance(Q, lado) {
    const R = Q.R, m = lado === "cerca" ? Q.p.manoCerca : Q.p.manoLejos; if (!m) return 0;
    const w = P(m.x + Math.cos(m.mu) * R_M(R), m.y + Math.sin(m.mu) * R_M(R));
    return len(sub(w, hombroH(Q, lado))) / largoBrazo(R, lado);
  }

  /* =====================================================================================
   * CARAS
   * ===================================================================================== */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function guion(lista, dic, base, t) {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.2,
    lengua: 0, esp: 0, mof: 0, rub: 0, wd: 0, wi: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: clamp(e.mx, -1, 1), y: clamp(e.my, -1, 1) }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }
  const parpadeo = (t, lista, d = 0.15) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  // mirada hacia un punto del mundo
  function miraA(e, Q, q, w) {
    if (!q || w <= 0.001) return;
    const o = enMundo(Q, Q.R.centroCabeza(Q.p));
    let d = dirHoja(Q, norm(sub(q, o)));
    d = rot(d, -Q.p.cabeza.ang);
    e.mx = lerp(e.mx, 0.95 * d.x, w); e.my = lerp(e.my, 0.95 * d.y, w);
  }

  /* =====================================================================================
   * YORGI: el cuerpo (sin manos)
   * ===================================================================================== */
  const TOB_Y = Y.SUELO - Y.TOBILLO_ALTO;
  // paseo hasta la cabeza: arranca, pasa de una zancada larga por detrás de las zapatillas de Guillermo y frena
  const LIN = k => k;
  const KANDA = [[T.yAnda0, 0], KF([6.36, 40], entrada), KF([6.56, 158], LIN), KF([6.74, 272], LIN), KF([6.92, 346], LIN), KF([7.1, 408], LIN), KF([7.3, 462], LIN), KF([T.yAnda1, XY1 - XYA], salida)];
  const xY = t => {
    let x = lerp(XY0, XYA, tramo(t, T.yHop0, T.yHop1));
    if (t > T.yAnda0) x = XYA + claves(KANDA, t)[0];
    x = lerp(x, XY1B, tramo(t, T.yPaso0, T.yPaso1));
    x = lerp(x, XY2, tramo(t, T.yAtras0, T.yAtras1));
    return lerp(x, XY3, tramo(t, T.ySale0, T.ySale1));
  };
  const giroY = t => fase(t, T.yGira0, T.yGira1);            // 0 → 1: se da la vuelta (mira a la izquierda)
  const espejoY = t => giroY(t) >= 0.5;
  // pasos: [t0, t1, x (mundo, con el espejo de entonces), alto, suelo de ese pie]
  const PASOS_Y = (() => {
    const L = { cerca: [[0, 0, XY0 - 22, 0, SUELO]], lejos: [[0, 0, XY0 + 22, 0, SUELO]] };
    // se aparta con dos pasitos hacia atrás cuando los pies de Guillermo resbalan hacia él
    L.cerca.push([T.yHop0, T.yHop0 + 0.2, XYA - 22, 12, SUELO]); L.lejos.push([T.yHop0 + 0.13, T.yHop1, XYA + 22, 14, SUELO]);
    // va por detrás (más al fondo) y ningún pie se apoya junto a las zapatillas de Guillermo (x 340–412):
    // pasa por detrás de ellas con dos zancadas largas y bajas (tapadas por sus piernas)
    L.cerca.push([T.yAnda0, 6.36, 292, 14, SUELO_Y1], [6.56, 6.78, 520, 12, SUELO_Y1], [6.88, 7.1, 650, 14, SUELO_Y1 - 6], [7.26, T.yAnda1, XY1 - 22, 10, SUELO_Y2]);
    L.lejos.push([6.3, 6.56, 452, 12, SUELO_Y1], [6.72, 6.94, 590, 14, SUELO_Y1], [7.06, 7.3, XY1 + 22, 12, SUELO_Y2]);
    return L;
  })();
  // después de darse la vuelta (cerca a la derecha): un pasito al hacer botar la mancuerna y luego se aparta
  const PASOS_Y2 = {
    cerca: [[0, 0, XY1 + 22, 0, SUELO_Y2], [T.yPaso0, T.yPaso0 + 0.2, XY1B + 22, 10, SUELO_Y2], [T.yAtras0, T.yAtras1 - 0.08, XY2 + 22, 9, SUELO_Y2],
      [T.ySale0, T.ySale0 + 0.2, XY3 + 22, 9, SUELO_Y3]],
    lejos: [[0, 0, XY1 - 22, 0, SUELO_Y2], [T.yPaso0 + 0.12, T.yPaso1, XY1B - 22, 10, SUELO_Y2], [T.yAtras0 + 0.12, T.yAtras1, XY2 - 22, 9, SUELO_Y2],
      [T.ySale0 + 0.14, T.ySale1, XY3 - 22, 9, SUELO_Y3]]
  };
  function pie(t, lista) {
    let x = lista[0][2], lev = 0, fl = lista[0][4];
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, x1, alto, s1] = lista[i]; if (t <= t0) break;
      const k = tramo(t, t0, t1);
      x = lerp(x, x1, k); fl = lerp(fl, s1, k); lev = Math.max(lev, alto * campana(t, t0, t1));
    }
    return { x, lev, fl };
  }
  const CUERPOS_Y = {
    base: { pel: 0, torso: 0.0, cab: -0.04, px: 0 },
    juega: { pel: 6, torso: 0.02, cab: -0.07, px: 0 },
    ofrece: { pel: -4, torso: 0.04, cab: 0.08, px: 4 },
    carga: { pel: 18, torso: -0.08, cab: 0.02, px: -10 },
    lanza: { pel: -6, torso: 0.1, cab: 0.06, px: 10 },
    mira: { pel: 0, torso: 0.03, cab: 0.05, px: 2 },
    tapa: { pel: 10, torso: -0.04, cab: -0.1, px: -4 },
    pasea: { pel: 0, torso: 0.03, cab: 0.06, px: 0 },
    agacha: { pel: 230, torso: 0.76, cab: 0.36, px: 72 },
    alza: { pel: 0, torso: 0.02, cab: 0.02, px: 0 },
    muestra: { pel: -4, torso: -0.04, cab: -0.05, px: -4 },
    sorpresa: { pel: -6, torso: -0.08, cab: -0.08, px: -6 },
    risa: { pel: 14, torso: -0.12, cab: -0.24, px: -8 },
    final: { pel: 0, torso: -0.03, cab: -0.06, px: -2 }
  };
  const GUION_CUERPO_Y = [
    [0.3, 0.6, "juega"], [T.ofrece, T.ofrece + 0.2, "ofrece"], [T.carga0, T.suelta - 0.1, "carga"], [T.suelta - 0.1, T.suelta + 0.08, "lanza", salida],
    [T.suelta + 0.3, T.suelta + 0.6, "mira"], [T.yHop0, T.yHop0 + 0.15, "sorpresa", salida], [T.yTapa0, T.yTapa0 + 0.15, "tapa"], [T.yAnda0, T.yAnda0 + 0.3, "pasea"],
    [T.yAgacha0, T.engancha, "agacha"], [T.engancha + 0.06, T.levanta1, "alza"], [T.aprieta[0][0], T.aprieta[0][0] + 0.2, "muestra"],
    [T.alza0 - 0.05, T.alza0 + 0.25, "sorpresa"], [T.alza1 + 0.2, T.alza1 + 0.5, "alza"], [T.yRisa0, T.yRisa0 + 0.2, "risa", salida],
    [T.camara, T.camara + 0.3, "final"]
  ];
  const rieY = t => dentro(t, T.yRisa0, T.yRisa0 + 0.1, T.yRisa1, T.yRisa1 + 0.25);
  const tapaY = t => dentro(t, T.yTapa0 + 0.05, T.yTapa0 + 0.15, T.yTapa1 - 0.1, T.yTapa1);
  const cuerpoY = t => memoCuerpoY(t);
  function cuerpoY0(t) {
    const b = guion(GUION_CUERPO_Y, CUERPOS_Y, "base", t);
    const esp = espejoY(t), g = giroY(t), sx = Math.max(0.06, Math.abs(Math.cos(Math.PI * g)));
    const x = xY(t), respira = Math.sin(t * 2.1 + 0.7);
    // pies (cada uno con su suelo) y profundidad: más al fondo, un poco más pequeño
    const lista = esp ? PASOS_Y2 : PASOS_Y;
    const fc = pie(t, lista.cerca), fl = pie(t, lista.lejos);
    const suelo = (fc.fl + fl.fl) / 2, s = S * (1 - 0.03 * (SUELO - suelo) / FONDO);
    const p = { x, suelo, s, espejo: esp, tirasLimpias: true, torso: b.torso, torsoEsc: { x: 1, y: 1 + 0.005 * respira }, piernas: {},
      pelvis: { x: Y.PELVIS.x + b.px, y: Y.PELVIS.y + b.pel + 1.2 * respira }, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    // juega: el cuerpo acompaña cada recogida
    for (const [, t1] of T.tiros) p.pelvis.y += 12 * golpecito(t, t1, 0.36);
    // risa: sacudidas
    const ri = rieY(t), tp = tapaY(t);
    p.torso += 0.02 * Math.sin((t - T.yRisa0) * 21) * ri; p.cabeza.ang += 0.05 * Math.sin((t - T.yRisa0) * 21 + 0.6) * ri;
    p.pelvis.y += 6 * Math.abs(Math.sin((t - T.yRisa0) * 21)) * ri;
    p.cabeza.ang += 0.03 * Math.sin((t - T.yTapa0) * 24) * tp; p.torso += 0.01 * Math.sin((t - T.yTapa0) * 24) * tp;
    // pasos
    p.pelvis.y -= (fc.lev + fl.lev) * 0.3 / s + 4 * Math.abs(Math.sin(Math.PI * 7 * fase(t, T.yAnda0, T.yAnda1))) * dentro(t, T.yAnda0, T.yAnda0 + 0.2, T.yAnda1 - 0.2, T.yAnda1);
    const hoja = fx => Y.aHoja(p, P(fx, suelo)).x;
    p.piernas.cerca = { tob: P(hoja(fc.x), TOB_Y + (fc.fl - suelo) / s - fc.lev / s), ang: 0.15 * Math.sin(Math.PI * fase(fc.lev, 0, 14)) * (esp ? -1 : 1) };
    p.piernas.lejos = { tob: P(hoja(fl.x), TOB_Y + (fl.fl - suelo) / s - fl.lev / s), ang: 0.15 * Math.sin(Math.PI * fase(fl.lev, 0, 14)) * (esp ? -1 : 1) };
    const Q = { R: Y, p, sg: esp ? -1 : 1 };
    Q.M = marco(Y, p, 0, Y.aPantalla(p, p.pelvis), sx);
    return Q;
  }

  /* =====================================================================================
   * GUILLERMO: el cuerpo (sin manos) y su marco
   * ===================================================================================== */
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const hojaXG = d => G.PELVIS.x + d / S;
  const TALON_S = P(hojaXG(0) + G.TALON.x, TOB_G + G.TALON.y);     // entre los dos talones (hoja)
  function nuevaPG(esp) {
    return { x: XG0, suelo: SUELO, s: S, espejo: esp, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y }, torso: 0, torsoEsc: { x: 1, y: 1 },
      piernas: { cerca: { tob: P(hojaXG(-24), TOB_G), ang: 0 }, lejos: { tob: P(hojaXG(25), TOB_G), ang: 0 } },
      cabeza: { ang: 0, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
  }
  const CUERPOS_G = {
    base: { pel: 0, torso: 0.02, cab: 0.03, px: 0 },
    sigue: { pel: 0, torso: 0.05, cab: 0.06, px: 2 },
    listo: { pel: 10, torso: 0.08, cab: 0.02, px: 4 },
    atrapa: { pel: 24, torso: 0.1, cab: 0.08, px: 6 },
    chulo: { pel: -8, torso: -0.06, cab: -0.14, px: -4 },
    cae: { pel: 160, torso: 0.34, cab: 0.26, px: 30 },
    aguanta: { pel: 145, torso: 0.3, cab: 0.16, px: 26 },
    sube: { pel: 95, torso: -0.06, cab: -0.12, px: 0 },
    atras: { pel: 70, torso: -0.24, cab: -0.24, px: -14 },
    plancha: { pel: 0, torso: 0, cab: 0, px: 0 },
    tieso: { pel: 0, torso: 0, cab: -0.04, px: 0 },
    sacude: { pel: 4, torso: 0.06, cab: 0.12, px: 4 },
    saca: { pel: -10, torso: -0.07, cab: -0.16, px: -6 }
  };
  const GUION_CUERPO_G = [
    [0.4, 0.8, "sigue"], [T.gSaca0, T.gSaca1, "listo"], [T.atrapa - 0.02, T.atrapa + 0.08, "atrapa", salida], [T.atrapa + 0.1, T.atrapa + 0.3, "chulo"],
    [T.cae0 + 0.04, T.cae1 + 0.04, "cae", entrada], [T.cae1 + 0.12, T.sube0, "aguanta"], [T.sube0, T.sube1, "sube"],
    [T.atras0, T.vuelca0, "atras"], [T.vuelca0, T.vuelca0 + 0.2, "plancha"],
    [T.alza1, T.alza1 + 0.1, "tieso"], [T.sacude[0] - 0.1, T.sacude[0] + 0.1, "sacude"], [T.saca0 - 0.05, T.saca1, "saca", salida]
  ];
  // temblor del esfuerzo (de pie)
  const tiemblaG = t => dentro(t, T.cae1, T.cae1 + 0.1, T.vuelca0, T.vuelca0 + 0.1);
  // impactos en el suelo (tumbado): aplastamiento
  const golpeG = t => t < T.golpe ? 0 : Math.exp(-(t - T.golpe) * 9) * Math.abs(Math.cos((t - T.golpe) * 17));
  // cabeza tumbado: cuánto la levanta (rad, hacia arriba)
  const KCAB = [
    [T.golpe, 0.25], KF([T.golpe + 0.1, 0.0], salida), [5.95, 0.02], [T.mira, 0.48], [T.empuja0, 0.42], [T.empuja0 + 0.12, 0.3], [T.empuja1, 0.32],
    [T.empuja1 + 0.12, 0.02], [7.05, 0.08], [7.8, 0.1], [7.95, 0.2], [T.engancha, 0.18], [T.levanta1, 0.26], [9.0, 0.16], [9.25, 0.22],
    [10.3, 0.2], [T.alza0, 0.0]
  ];
  // geometría de referencia (pose neutra) para los giros
  let REF = null;
  function refG() {
    if (REF) return REF;
    const p = nuevaPG(true), Pp = G.aPantalla(p, p.pelvis), Talon = G.aPantalla(p, TALON_S);
    const W1 = P(XG0 + 6, LYG);
    const Hl = add(W1, rot(sub(Talon, Pp), Math.PI / 2));                     // talón tumbado (mundo)
    const Hf = P(Hl.x, SUELO - (G.TOBILLO_ALTO - G.TALON.y) * S);              // talón de pie
    const Wfin = add(Hf, sub(Pp, Talon));                                      // pelvis de pie tras levantarse
    REF = { Pp, Talon, W1, Hl, Hf, Wfin };
    return REF;
  }
  let W0_CACHE = null;
  const cuerpoG = t => memoCuerpoG(t);
  function cuerpoG0(t) {
    const tumb = t >= T.golpe && t < T.alza0;
    const espFinal = t >= (T.gGira0 + T.gGira1) / 2;
    const p = nuevaPG(!espFinal);
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "base", t);
    const respira = Math.sin(t * 2.3 + 0.4);
    if (!tumb) {
      p.pelvis.x += b.px; p.pelvis.y += b.pel + 1.2 * respira; p.torso = b.torso; p.cabeza.ang = b.cab;
      p.torsoEsc.y = 1 + 0.005 * respira;
      // asiente («¡sí!») y sigue la mancuerna con la cabeza
      p.cabeza.ang += 0.1 * Math.sin((t - T.gSi) * 20) * dentro(t, T.gSi, T.gSi + 0.05, T.gSi + 0.3, T.gSi + 0.36);
      for (const [, t1] of T.tiros) p.cabeza.ang += 0.04 * golpecito(t, t1 + 0.04, 0.3);
      // temblor
      const tb = tiemblaG(t);
      p.pelvis.y += 6 * tb * ruido(t * 28); p.torso += 0.012 * tb * ruido(t * 31 + 4); p.cabeza.ang += 0.02 * tb * ruido(t * 27 + 9);
      p.pelvis.x += 4 * tb * ruido(t * 23 + 2);
      // atrapa: un golpe hacia abajo; al levantarse, se asienta
      p.pelvis.y += 14 * golpecito(t, T.atrapa, 0.3);
      p.torsoEsc.y -= 0.04 * golpecito(t, T.alza1, 0.3);
    } else {
      // tumbado: el pecho respira (y boquea), se aplasta con los golpes
      const boq = dentro(t, 6.95, 7.1, 8.2, 8.4) + 0.6 * dentro(t, T.golpe + 0.4, T.golpe + 0.6, T.mira, T.mira + 0.2);
      const alivio = campana(t, T.levanta1, T.levanta1 + 0.7);
      p.torsoEsc.x = 1 - 0.1 * golpeG(t) + 0.015 * Math.sin(t * (2.3 + 6 * boq)) + 0.07 * alivio
        - 0.035 * dentro(t, T.golpe + 0.2, T.golpe + 0.4, T.engancha, T.levanta1);
      p.torsoEsc.y = 1 + 0.03 * golpeG(t);
      p.cabeza.ang = claves(KCAB, t)[0] + 0.03 * Math.sin(t * 9) * boq;
      p.cabeza.esc = { x: 1 + 0.06 * golpeG(t), y: 1 - 0.07 * golpeG(t) };
      // forcejea al empujar
      const em = dentro(t, T.empuja0, T.empuja0 + 0.12, T.empuja1 - 0.1, T.empuja1);
      p.cabeza.ang += 0.04 * em * ruido(t * 26);
    }
    // giro final: se da la vuelta con un aplastamiento
    const gG = fase(t, T.gGira0, T.gGira1), sx = Math.max(0.06, Math.abs(Math.cos(Math.PI * gG)));
    const Q = { R: G, p, sg: p.espejo ? -1 : 1 };
    const Pp = G.aPantalla(p, p.pelvis), r = refG();
    if (t < T.vuelca0) Q.M = marco(G, p, 0, Pp);
    else if (t < T.golpe) {
      if (!W0_CACHE) { const q = cuerpoG(T.vuelca0 - 1e-6); W0_CACHE = q.M.W; }
      const k = fase(t, T.vuelca0, T.golpe), phi = Math.PI / 2 * k * k;
      const Wt = P(lerp(W0_CACHE.x, r.W1.x, suave(k)), lerp(W0_CACHE.y, r.W1.y, k * k));
      let M = marco(G, p, phi, Wt);
      // los pies no se meten en el suelo
      const pieM = M.aMundo(G.aPantalla(p, P(hojaXG(0), G.SUELO))), sobra = pieM.y - SUELO;
      if (sobra > 0) M = marco(G, p, phi, P(Wt.x, Wt.y - sobra));
      Q.M = M;
    } else if (t < T.alza0) Q.M = marco(G, p, Math.PI / 2, r.W1);
    else if (t < T.alza1) {
      // se levanta tieso como una tabla girando sobre los talones
      const e = suave5(fase(t, T.alza0, T.alza1)), phi = Math.PI / 2 * (1 - e);
      const piv = lerpP(r.Hl, r.Hf, e), Talon = G.aPantalla(p, TALON_S);
      Q.M = marco(G, p, phi, add(piv, rot(sub(Pp, Talon), phi)));
    } else {
      const Pn = G.aPantalla(p, G.PELVIS);                       // pelvis neutra (no cambia con el espejo)
      Q.M = marco(G, p, 0, add(r.Wfin, sub(Pp, Pn)), sx);
    }
    return Q;
  }
  // puntos del muñeco de Guillermo tumbado (hoja)
  const PECHO_S = P(386, 560);               // borde del pecho (lado lejano) donde se apoya la mancuerna

  /* =====================================================================================
   * LA MANCUERNA (mundo): { c, a, sqA, sqB, jx, jy, quien }
   * quien: "yC" / "yL" (en una mano de Yorgi), "g" (con Guillermo), "aire"
   * ===================================================================================== */
  const PY0 = P(XY0, SUELO - (Y.SUELO - Y.PELVIS.y) * S);
  const HC0 = add(PY0, P(-44, -38)), HL0 = add(PY0, P(52, -38));
  // la mano lejana: se la enseña, coge impulso y lanza
  const KLANZA = [[T.ofrece - 0.05, 0, 0], [T.ofrece + 0.25, 4, -34], [T.carga0, 6, -30], KF([T.suelta - 0.1, -12, 24], suave), KF([T.suelta, 30, -30], entrada),
    KF([T.suelta + 0.2, 34, -52], salida)];
  function manoJuego(lado, t) {
    let q = lado === "cerca" ? HC0 : HL0;
    if (lado === "cerca") q = add(q, P(0, -9 * Math.max(0, Math.sin((t - 0.18) * 8)) * dentro(t, 0.14, 0.2, 0.5, 0.58)));
    T.tiros.forEach(([t0, t1], i) => {
      const lanza = i % 2 ? "lejos" : "cerca";
      if (lado === lanza) q = add(q, P(lado === "cerca" ? 4 : -4, 9 * campana(t, t0 - 0.26, t0 - 0.03) - 16 * campana(t, t0 - 0.06, t0 + 0.22)));
      else q = add(q, P(0, 13 * golpecito(t, t1, 0.36)));
    });
    if (lado === "lejos" && t > T.ofrece - 0.05) { const [dx, dy] = claves(KLANZA, t); q = add(q, P(dx, dy)); }
    return q;
  }
  const vuelo = (A, B, u, h) => P(lerp(A.x, B.x, u), lerp(A.y, B.y, u) - 4 * h * u * (1 - u));

  // Guillermo: dónde la sostiene (desplazamiento sobre GC)
  const GC = P(XG0 - 6, 334);
  const KPESA_G = [
    [T.atrapa, 0, 0, 0], KF([T.atrapa + 0.08, 0, 11, 0.03], salida), [T.atrapa + 0.28, 0, -2, -0.02], [T.cae0, 0, 0, 0],
    KF([T.cae1, -14, 66, 0.07], entrada), KF([T.cae1 + 0.07, -14, 58, 0.05], salida), [T.cae1 + 0.16, -14, 66, 0.06],
    [T.sube0, -14, 64, 0.05], [T.sube0 + 0.14, -10, 46, -0.07], [T.sube1, 0, -4, 0.06], [T.atras0 + 0.12, 6, -8, -0.03], [T.vuelca0, 12, -12, 0]
  ];
  function pesaG(t) {
    const [dx, dy, a] = claves(KPESA_G, t), tb = tiemblaG(t);
    return { c: P(GC.x + dx + 2.5 * tb * ruido(t * 30), GC.y + dy + 2.5 * tb * ruido(t * 30 + 7)), a: a + 0.03 * tb * ruido(t * 17 + 3) };
  }
  // en el pecho de Guillermo (tumbado): centro de la mancuerna
  function enPecho(t) {
    const Q = cuerpoG(t), q = enMundo(Q, PECHO_S);
    return P(q.x, q.y - MP.ph);
  }
  let D0R = null;     // punto del muñeco (pantalla sin girar) donde la lleva al empezar a caer
  const botePecho = t => t < T.golpe ? 0 : 16 * Math.abs(Math.sin((t - T.golpe) * 15)) * Math.exp(-(t - T.golpe) * 7.5);
  // el dedo de Yorgi y el puño
  const Q1 = P(XY1 - 54, 302);                // la sostiene en el dedo (a la altura del pecho)
  const Q1B = P(Q1.x + 30, Q1.y);             // y la caza por el disco tras dar un pasito a la derecha
  const APRIETOS = [...T.aprieta, [T.ultimo, T.ultimo + 0.1]];
  const pinza = (t, a, b) => t < a ? 0 : t < b ? tramo(t, a, a + 0.06) : Math.max(0, Math.exp(-(t - b) * 14) * Math.cos((t - b) * 26));
  const vaiven = (t, b) => t < b ? 0 : Math.exp(-(t - b) * 7) * Math.sin((t - b) * 36);
  // mano lejana de Yorgi colgando a su lado (después de apretarla)
  function punoColgado(t) {
    const QY = cuerpoY(t);
    return enMundo(QY, P(418, 676));
  }
  const mancuerna = t => memoPesa(t);
  function mancuerna0(t) {
    const m = { c: P(0, 0), a: 0, sqA: 0, sqB: 0, jx: 1, jy: 1, quien: "aire" };
    const tr = T.tiros;
    if (t < tr[0][0]) { m.c = manoJuego("cerca", t); m.quien = "yC"; return m; }
    for (let i = 0; i < tr.length; i++) {
      const [t0, t1] = tr[i], de = i % 2 ? "lejos" : "cerca", a = i % 2 ? "cerca" : "lejos";
      if (t < t1) { const u = fase(t, t0, t1); m.c = vuelo(manoJuego(de, t0), manoJuego(a, t1), u, 48); m.a = (i % 2 ? -1 : 1) * Math.PI * u; return m; }
      if (i === tr.length - 1 ? t < T.suelta : t < tr[i + 1][0]) { m.c = manoJuego(a, t); m.quien = a === "cerca" ? "yC" : "yL"; return m; }
    }
    if (t < T.atrapa) {
      const u = fase(t, T.suelta, T.atrapa);
      m.c = vuelo(manoJuego("lejos", T.suelta), GC, u, 62); m.a = Math.PI * u; return m;
    }
    m.quien = "g";
    if (t < T.vuelca0) { const q = pesaG(t); m.c = q.c; m.a = q.a; return m; }
    if (t < T.golpe) {
      if (!D0R) { const Q0 = cuerpoG(T.vuelca0); D0R = Q0.M.aRig(pesaG(T.vuelca0).c); }
      const Q = cuerpoG(t), enMano = Q.M.aMundo(D0R), k = suave(fase(t, T.golpe - 0.17, T.golpe));
      m.c = k > 0 ? lerpP(enMano, enPecho(t), k) : enMano;
      m.a = lerp(0.04 * Math.sin(fase(t, T.vuelca0, T.golpe) * 6), 0, k);
      return m;
    }
    if (t < T.engancha) {
      m.c = enPecho(t); m.c.y -= botePecho(t);
      // la empuja: el disco derecho sube un poco (gira sobre la esquina izquierda)
      const em = dentro(t, T.empuja0 + 0.08, T.empuja0 + 0.25, T.empuja1 - 0.12, T.empuja1) * (0.75 + 0.25 * Math.sin(t * 23));
      if (em > 0) { const piv = add(m.c, P(-PLACA - MP.pw, MP.ph)); m.a = -0.09 * em; m.c = add(piv, rot(sub(m.c, piv), m.a)); }
      // golpecito al soltarla
      m.c.y -= 4 * campana(t, T.empuja1, T.empuja1 + 0.12);
      return m;
    }
    if (t < T.bota0) {
      // la levanta con un dedo
      const u = fase(t, T.engancha, T.levanta1), e = suave(u), A = enPecho(T.engancha);
      m.c = P(lerp(A.x, Q1.x, e) - 10 * Math.sin(Math.PI * u), lerp(A.y, Q1.y, e));
      m.c.y += 3 * campana(t, T.levanta1, T.levanta1 + 0.14);
      m.a = 0.03 * Math.sin(Math.PI * u);
      return m;
    }
    if (t < T.bota1) {
      // la hace botar: media vuelta en el aire y la caza por el disco derecho
      const u = fase(t, T.bota0, T.bota1);
      m.c = vuelo(Q1, Q1B, u, 40); m.a = Math.PI * suave(u); m.quien = "aire";
      return m;
    }
    m.quien = "yL";
    let sq = 0, jig = 0;
    for (const [a0, b0] of APRIETOS) { sq = Math.max(sq, pinza(t, a0, b0)); jig += vaiven(t, b0); }
    const ag = P(Q1B.x + PLACA, Q1B.y);                                // puño en el disco derecho
    let mano = ag, a = 0;
    if (t >= T.cuelga0) {
      const k = suave(fase(t, T.cuelga0, T.cuelga1));
      mano = lerpP(ag, punoColgado(t), k);
      a = lerp(0, -1.2, k);
      // se balancea: al moverse y al reírse
      a += 0.12 * Math.sin((t - T.cuelga1) * 6.5) * Math.exp(-Math.max(0, t - T.cuelga1) * 1.8) * tramo(t, T.cuelga0 + 0.1, T.cuelga1)
        + 0.1 * Math.sin((t - T.yAtras0) * 9) * dentro(t, T.yAtras0, T.yAtras0 + 0.1, T.yAtras1, T.yAtras1 + 0.3)
        + 0.14 * Math.sin((t - T.yRisa0) * 21 + 1) * rieY(t);
    }
    // el bote del puño al cazarla
    mano = add(mano, P(0, 8 * golpecito(t, T.bota1, 0.3)));
    m.c = add(mano, rot(P(-PLACA, 0), a)); m.a = a; m.sqB = sq;
    // la gomaespuma tiembla al soltar
    m.jx = 1 + 0.06 * jig; m.jy = 1 - 0.06 * jig;
    m.mano = mano;
    return m;
  }

  /* =====================================================================================
   * MANOS DE YORGI
   * ===================================================================================== */
  const BOLS_YC = (Q, t) => Q.R.manoReposo(Q.p, "cerca");
  const BOLS_YL = (Q, t) => Q.R.manoReposo(Q.p, "lejos");
  const sale = (fn, dedos) => (Q, t) => Object.assign({}, fn(Q, t), { puno: 1, dedos: dedos || FLOJA });
  // jugando: la mano que la tiene la agarra por el medio; la otra espera abierta
  // [coge, suelta] de cada mano mientras juega
  const AGARRES = { cerca: [[-1, T.tiros[0][0]], [T.tiros[1][1], T.tiros[2][0]]], lejos: [[T.tiros[0][1], T.tiros[1][0]], [T.tiros[2][1], T.suelta]] };
  const agarre = (lado, t) => { let o = 0; for (const [a, b] of AGARRES[lado]) o = Math.max(o, tramo(t, a - 0.07, a) * (1 - tramo(t, b, b + 0.12))); return o; };
  function juegoY(lado) {
    return (Q, t) => {
      const m = mancuerna(t), tiene = m.quien === (lado === "cerca" ? "yC" : "yL");
      const c = tiene ? m.c : manoJuego(lado, t), sg = lado === "cerca" ? -1 : 1;
      return manoW(Q, lado, c, { codo: P(0.55 * sg, 0.85), dobla: lado === "cerca" ? -1 : 1, dedos: mezD(PALMA, AGARRA, agarre(lado, t)) });
    };
  }
  // tapa la boca (aguanta la risa)
  const TAPA_Y = (Q, t) => {
    const b = enMundo(Q, Y.boca(Q.p));
    return manoW(Q, "cerca", add(b, P(-4 * Q.sg, 8)), { codo: P(-0.45 * Q.sg, 0.9), dobla: -1, dedos: TAPA, esp: false });
  };
  // puño en la cadera
  const CADERA_YL = (Q, t) => Object.assign(manoW(Q, "lejos", enMundo(Q, P(392, 668)), { codo: P(0.85 * Q.sg, -0.45), dobla: 1, dedos: PUNO }), {});
  // el dedo bajo la barra: la mancuerna descansa encima del índice
  function dedoBarra(Q, t) {
    const m = mancuerna(t), f = norm(P(Q.sg, 0.12)), n = P(f.y, -f.x), nn = n.y < 0 ? n : mul(n, -1);
    const contacto = add(m.c, P(0, MP.hr + 3.4));
    const h = sub(sub(contacto, mul(nn, 5.4)), mul(f, 9.1));
    const codo = mul(f, -1);
    return manoW(Q, "lejos", h, { codo, dobla: 1, dedos: DEDO, esp: espPulgar(Q, codo, nn) });
  }
  // baja el dedo hacia la barra (todavía en el pecho de Guillermo)
  const BAJA_DEDO = (Q, t) => { const m = dedoBarra(Q, T.engancha); return m; };
  // agarra el disco derecho
  function punoDisco(Q, t) {
    const m = mancuerna(t), q = m.mano || add(P(Q1B.x + PLACA, Q1B.y), P(0, 8 * golpecito(t, T.bota1, 0.3)));
    return manoW(Q, "lejos", q, { codo: P(0.6 * Q.sg, -0.25), dobla: 1, dedos: lerpD(AGARRA, APRIETA, m.sqB) });
  }
  const lerpD = (a, b, k) => mezD(a, b, clamp(k));
  const BARRIGA_Y = (Q, t) => manoW(Q, "cerca", enMundo(Q, P(250, 610)), { codo: P(-0.9 * Q.sg, 0.3), dobla: -1, dedos: PALMA });
  function manosY(Q, t) {
    const PC = [
      [0, 0, juegoY("cerca")],
      [2.42, 2.62, sale(BOLS_YC)], [2.62, 2.7, BOLS_YC],
      [T.yTapa0, T.yTapa0 + 0.06, sale(BOLS_YC, TAPA)], [T.yTapa0 + 0.06, T.yTapa0 + 0.22, TAPA_Y, salida],
      [T.yTapa1 - 0.06, T.yTapa1 + 0.08, sale(BOLS_YC)], [T.yTapa1 + 0.08, T.yTapa1 + 0.14, BOLS_YC],
      [T.yRisa0 - 0.05, T.yRisa0 + 0.05, sale(BOLS_YC, PALMA)], [T.yRisa0 + 0.05, T.yRisa0 + 0.25, BARRIGA_Y]
    ];
    const PL = [
      [0, 0, juegoY("lejos")],
      [T.suelta + 0.22, T.suelta + 0.5, CADERA_YL],
      [T.yAnda0 - 0.16, T.yAnda0 - 0.04, sale(BOLS_YL, PUNO)], [T.yAnda0 - 0.04, T.yAnda0 + 0.02, BOLS_YL],
      [T.yAgacha0 + 0.02, T.yAgacha0 + 0.1, sale(BOLS_YL, DEDO)], [T.yAgacha0 + 0.1, T.engancha, BAJA_DEDO],
      [T.engancha, T.engancha, dedoBarra],
      [T.bota0 + 0.02, T.bota1, punoDisco]
    ];
    let C = pista(PC, Q, t), L = pista(PL, Q, t);
    alcanza(Q, C, "cerca"); alcanza(Q, L, "lejos");
    Q.p.manoCerca = C; Q.p.manoLejos = L;
  }

  /* =====================================================================================
   * MANOS DE GUILLERMO
   * ===================================================================================== */
  const punoDesde = (m, mu) => P(m.x - Math.cos(mu) * R_M(G), m.y - Math.sin(mu) * R_M(G));
  const BOLS_G = { cerca: punoDesde(P(131, 652), -1.75), lejos: punoDesde(P(372, 648), -1.75) };
  const bolsG = lado => (Q, t) => { const b = Q.R.tronco(Q.p)(BOLS_G[lado]); return { x: b.x, y: b.y, mu: -1.75, ang: 0, puno: 0, espejo: false, dobla: -1, dedos: BOLS_D }; };
  const PREPARA_G = lado => (Q, t) => {
    const sg = lado === "cerca" ? 1 : -1;             // cerca: a la derecha (mira a la izquierda)
    return manoW(Q, lado, add(GC, P(sg * 16, -4)), { codo: P(0.6 * sg, 0.8), dobla: -1, dedos: ABIERTA });
  };
  // las dos manos en la barra
  const BARRA_G = lado => (Q, t) => {
    const m = mancuerna(t), sg = lado === "cerca" ? 1 : -1, q = add(m.c, rot(P(sg * 13, 0), m.a));
    const tensa = dentro(t, T.cae0, T.cae1, T.vuelca0 + 0.1, T.vuelca0 + 0.2);
    return manoW(Q, lado, q, { codo: P(0.55 * sg * (1 - tensa) + 0.15 * sg * tensa, 0.84), dobla: -1, dedos: AGARRA });
  };
  // tumbado: mano lejana (arriba) y cercana (en el suelo, delante)
  const ARRIBA = P(0, -1);
  function brazoArriba(Q, t) {
    const h = hombroM(Q, "lejos");
    // pataleta en el aire, empuja el disco, se aferra al aire, suplica, se rinde
    const mueve = dentro(t, T.golpe + 0.42, T.golpe + 0.6, T.empuja0 - 0.08, T.empuja0) + dentro(t, T.empuja1 + 0.1, T.empuja1 + 0.3, 7.82, 7.95);
    const th = -Math.PI / 2 + 0.5 + 0.45 * Math.sin(t * 13) * mueve + 0.15 * Math.sin(t * 4.1);
    const r = 70 + 10 * Math.sin(t * 9.3);
    let c = add(h, P(Math.cos(th) * r, Math.sin(th) * r));
    let o = { dobla: -1, dedos: mezD(GARRA, ABIERTA, 0.5 + 0.5 * Math.sin(t * 17)) };
    return manoW(Q, "lejos", c, o);
  }
  const EMPUJA_G = (Q, t) => {
    const m = mancuerna(t), d = add(m.c, rot(P(PLACA + MP.pw + 6, 12), m.a));
    return manoW(Q, "lejos", d, { codo: P(0.35, 0.95), dobla: -1, dedos: PALMA });
  };
  const SUPLICA_G = (Q, t) => { const h = hombroM(Q, "lejos"); return manoW(Q, "lejos", add(h, P(62 + 4 * Math.sin(t * 8), -60)), { dobla: -1, dedos: PALMA }); };
  const RENDIDA_L = (Q, t) => { const h = hombroM(Q, "lejos"); return manoW(Q, "lejos", add(h, P(-84, 4)), { dobla: -1, dedos: LACIA }); };
  const LACIA_L = (Q, t) => { const h = hombroM(Q, "lejos"); return manoW(Q, "lejos", add(h, P(42, -48)), { dobla: -1, dedos: LACIA }); };
  function palmadas(t) { let o = 0; for (const tp of T.palmas) o = Math.max(o, campana(t, tp - 0.2, tp)); return o; }
  const SUELO_C = (Q, t) => {
    const h = hombroM(Q, "cerca"), al = 20 * palmadas(t);
    return manoW(Q, "cerca", P(h.x - 44, SUELO + 22 - al), { dobla: -1, dedos: PALMA, codo: P(0.5, -0.86) });
  };
  const LADO_C = (Q, t) => { const h = hombroM(Q, "cerca"); return manoW(Q, "cerca", P(h.x - 90, h.y + 4), { dobla: -1, dedos: LACIA }); };
  const LADO_L = (Q, t) => { const h = hombroM(Q, "lejos"); return manoW(Q, "lejos", P(h.x - 92, h.y - 4), { dobla: -1, dedos: LACIA }); };
  // de pie tras levantarse: brazos rectos pegados al cuerpo (en la hoja, como un tablón)
  const TIESO = lado => (Q, t) => {
    const Tr = Q.R.tronco(Q.p), h = Tr(lado === "cerca" ? G.HOMBRO_C : G.HOMBRO), L = largoBrazo(G, lado) * 0.97 + R_M(G);
    const dx = lado === "cerca" ? -0.12 : 0.12;
    return { x: h.x + dx * L, y: h.y + L, mu: Math.atan2(-1, -dx), ang: 0, puno: 1, espejo: false, dobla: -1, dedos: LACIA };
  };
  // se sacude: la cercana por el pecho; la lejana el hombro
  const SACUDE_C = (Q, t) => {
    const Tr = Q.R.tronco(Q.p), k = Math.sin((t - T.sacude[0]) * 22);
    const q = Tr(P(178, 480 + 55 * k));
    return { x: q.x, y: q.y, mu: 1.95 + Q.p.torso, ang: 0, puno: 1, espejo: false, dobla: -1, dedos: PALMA };
  };
  const SACUDE_L = (Q, t) => {
    const Tr = Q.R.tronco(Q.p), k = Math.sin((t - T.sacude[2]) * 24);
    const q = Tr(P(384 + 16 * k, 334 + 10 * k));
    return { x: q.x, y: q.y, mu: 1.05 + Q.p.torso, ang: 0, puno: 1, espejo: false, dobla: 1, dedos: PALMA };
  };
  // saca bíceps (la cercana) con la lejana en la cadera
  const BICEPS = (Q, t) => {
    const bombea = campana(t, 12.42, 12.62) + campana(t, 12.66, 12.86);
    const Tr = Q.R.tronco(Q.p), q = Tr(P(-62 + 6 * bombea, 196 + 22 * bombea));
    return { x: q.x, y: q.y, mu: Math.PI / 2 + 0.1 + Q.p.torso, ang: 0, puno: 1, espejo: false, dobla: 1, dedos: PUNO };
  };
  const CADERA_GL = (Q, t) => { const q = Q.R.tronco(Q.p)(P(372, 640)); return { x: q.x, y: q.y, mu: -0.75, ang: 0, puno: 1, espejo: false, dobla: 1, dedos: PUNO }; };
  function manosG(Q, t) {
    const PC = [
      [0, 0, bolsG("cerca")],
      [T.gSaca0, T.gSaca0 + 0.1, sale(bolsG("cerca"), ABIERTA)], [T.gSaca0 + 0.1, T.gSaca1, PREPARA_G("cerca")],
      [T.atrapa - 0.04, T.atrapa, BARRA_G("cerca")],
      [T.golpe - 0.15, T.golpe + 0.05, SUELO_C, salida],
      [T.alza0 - 0.2, T.alza0, TIESO("cerca")],
      [T.sacude[0] - 0.12, T.sacude[0], SACUDE_C], [T.sacude[2] - 0.08, T.sacude[2] + 0.06, TIESO("cerca")],
      [T.saca0, T.saca1, BICEPS, salida]
    ];
    const PL = [
      [0, 0, bolsG("lejos")],
      [T.gSaca0 + 0.04, T.gSaca0 + 0.14, sale(bolsG("lejos"), ABIERTA)], [T.gSaca0 + 0.14, T.gSaca1, PREPARA_G("lejos")],
      [T.atrapa - 0.04, T.atrapa, BARRA_G("lejos")],
      [T.golpe - 0.15, T.golpe + 0.08, brazoArriba, salida],
      [T.empuja0 - 0.08, T.empuja0 + 0.08, EMPUJA_G], [T.empuja1, T.empuja1 + 0.15, brazoArriba],
      [7.8, 7.98, SUPLICA_G], [T.yAgacha0 + 0.12, T.engancha - 0.04, LACIA_L], [T.levanta1 + 0.1, T.levanta1 + 0.4, RENDIDA_L],
      [T.alza0 - 0.2, T.alza0, TIESO("lejos")],
      [T.sacude[2] - 0.12, T.sacude[2], SACUDE_L], [T.saca0 - 0.04, T.saca1, CADERA_GL, salida]
    ];
    const C = pista(PC, Q, t), L = pista(PL, Q, t);
    alcanza(Q, C, "cerca"); alcanza(Q, L, "lejos");
    Q.p.manoCerca = C; Q.p.manoLejos = L;
  }

  /* =====================================================================================
   * EXPRESIONES
   * ===================================================================================== */
  const CG = {
    base: E({ mx: 0.85, my: 0.05, sd: 6, si: 8, sonr: 0.45, ancho: 0.95 }),
    ooh: E({ iris: 1.12, sd: 24, gd: 0.06, si: 26, gi: 0.06, abre: 16, ancho: 0.55, sonr: 0.1 }),
    ilusion: E({ iris: 1.1, sd: 22, si: 24, abre: 14, ancho: 1.05, sonr: 0.95 }),
    listo: E({ c: 0.1, sd: 14, si: 16, abre: 4, ancho: 1.0, sonr: 0.75 }),
    chulo: E({ mx: 0.9, c: 0.42, h: 0.3, sd: 6, gd: -0.06, si: 18, abre: 0, ancho: 1.08, sonr: 0.95 }),
    uy: E({ mx: 0.2, my: 0.7, iris: 0.7, sd: 28, gd: 0.2, si: 28, gi: 0.2, abre: 24, ancho: 0.8, sonr: -0.5 }),
    esfuerzo: E({ c: 1, z: 1, sd: -6, gd: -0.2, si: -6, gi: -0.2, abre: 12, ancho: 1.08, sonr: -0.4, mof: 0.3 }),
    sube: E({ c: 0.95, z: 1, sd: -4, gd: -0.24, si: -4, gi: -0.24, abre: 10, ancho: 1.15, sonr: -0.55, mof: 0.6 }),
    ohno: E({ mx: 0.3, my: -0.4, iris: 0.72, sd: 28, gd: 0.18, si: 28, gi: 0.18, abre: 26, ancho: 0.72, sonr: -0.4 }),
    plaf: E({ c: 1, z: 0.8, sd: 6, si: 6, abre: 12, ancho: 1.2, sonr: -0.4, lengua: 0.8 }),
    mareo: E({ mx: 0, my: 0, esp: 0.85, sd: 14, gd: 0.18, si: -4, gi: -0.08, abre: 9, ancho: 0.85, sonr: -0.15, lengua: 0.6 }),
    panico: E({ mx: 0.6, my: 0.8, iris: 0.8, sd: 28, gd: 0.22, si: 28, gi: 0.22, abre: 22, ancho: 0.9, sonr: -0.55 }),
    empuja: E({ mx: 0.6, my: 0.6, c: 0.9, z: 1, sd: -8, gd: -0.24, si: -8, gi: -0.24, abre: 8, ancho: 1.15, sonr: -0.5, mof: 0.5 }),
    boquea: E({ mx: 0.1, my: -0.2, c: 0.35, sd: 18, gd: 0.2, si: 18, gi: 0.2, abre: 20, ancho: 0.8, sonr: -0.45 }),
    suplica: E({ mx: 0.5, my: -0.9, iris: 1.16, sd: 24, gd: 0.26, si: 24, gi: 0.26, abre: 8, ancho: 0.8, sonr: -0.3 }),
    alivio: E({ c: 0.85, h: 0.35, sd: 10, si: 10, abre: 20, ancho: 0.9, sonr: 0.1 }),
    pasmo: E({ mx: 0.3, my: -0.6, c: 0.5, sd: -2, si: -2, abre: 0, ancho: 0.72, sonr: 0 }),
    serio: E({ mx: 0.85, my: 0, c: 0.58, sd: -4, gd: -0.06, si: -4, gi: -0.06, abre: 0, ancho: 0.75, sonr: 0.05 }),
    digno: E({ mx: 0.6, my: 0.1, c: 0.62, h: 0.15, sd: 12, si: 6, abre: 0, ancho: 0.9, sonr: 0.45 }),
    saca: E({ mx: -0.2, my: -0.1, c: 0.55, h: 0.45, sd: 16, gd: -0.05, si: 22, abre: 4, ancho: 1.1, sonr: 0.95 }),
    camara: E({ mx: -0.6, my: 0, c: 0.25, h: 0.35, sd: 18, gd: -0.04, si: 22, abre: 8, ancho: 1.12, sonr: 1 })
  };
  const GUION_CARA_G = [
    [T.tiros[0][1] - 0.05, T.tiros[0][1] + 0.1, "ooh", salida], [2.0, 2.3, "base"], [T.ceja + 0.05, T.ceja + 0.2, "ilusion"], [T.gSaca0 + 0.1, T.gSaca1, "listo"],
    [T.atrapa, T.atrapa + 0.04, "uy"], [T.atrapa + 0.06, T.atrapa + 0.22, "chulo"],
    [T.cae0, T.cae0 + 0.06, "uy", salida], [T.cae1 + 0.1, T.cae1 + 0.25, "esfuerzo"], [T.sube0, T.sube0 + 0.15, "sube"],
    [T.atras0, T.atras0 + 0.15, "ohno"], [T.golpe - 0.03, T.golpe + 0.02, "plaf"], [T.golpe + 0.18, T.golpe + 0.35, "mareo"],
    [T.mira - 0.12, T.mira + 0.03, "panico", salida], [T.empuja0 + 0.05, T.empuja0 + 0.18, "empuja"], [T.empuja1, T.empuja1 + 0.15, "boquea"],
    [7.82, 7.98, "suplica"], [T.levanta1, T.levanta1 + 0.15, "alivio"], [9.12, 9.32, "pasmo"],
    [T.alza0 - 0.12, T.alza0, "serio"], [T.sacude[0], T.sacude[0] + 0.2, "digno"], [T.saca0, T.saca0 + 0.15, "saca"], [T.camara, T.camara + 0.25, "camara"]
  ];
  const CY = {
    base: E({ mx: 0.5, my: -0.3, c: 0.1, sd: 6, si: 6, abre: 0, ancho: 1, sonr: 0.6 }),
    juega: E({ mx: 0.4, my: -0.5, c: 0.2, h: 0.2, sd: 10, si: 10, abre: 3, ancho: 1.05, sonr: 0.85 }),
    ceja: E({ mx: 0.92, my: 0.05, c: 0.28, sd: 22, gd: 0.12, si: -2, gi: -0.08, abre: 2, ancho: 1.05, sonr: 0.9 }),
    lanza: E({ mx: 0.9, my: -0.2, c: 0.1, sd: 14, si: 14, abre: 12, ancho: 1.05, sonr: 1 }),
    mira: E({ mx: 0.9, my: 0.1, sd: 10, si: 12, sonr: 0.6 }),
    divertido: E({ mx: 0.9, my: 0.25, c: 0.25, h: 0.3, sd: 12, gd: 0.04, si: 18, abre: 3, ancho: 1.04, sonr: 0.85 }),
    oops: E({ mx: 0.9, my: 0.35, iris: 0.92, sd: 24, gd: 0.12, si: 24, gi: 0.12, abre: 8, ancho: 0.85, sonr: 0.1 }),
    aguanta: E({ mx: 0.9, my: 0.4, c: 0.55, h: 0.6, sd: 14, si: 14, abre: 0, ancho: 0.9, sonr: 0.8, mof: 0.7 }),
    pasea: E({ mx: 0.85, my: 0.45, c: 0.28, h: 0.2, sd: 8, si: 8, abre: 0, ancho: 1, sonr: 0.8 }),
    facil: E({ mx: 0.85, my: 0.55, c: 0.38, h: 0.3, sd: 10, si: 4, abre: 2, ancho: 1.02, sonr: 0.85 }),
    muestra: E({ mx: 0.6, my: 0.5, c: 0.2, sd: 18, gd: 0.06, si: 16, abre: 8, ancho: 1.05, sonr: 1 }),
    cejas: E({ mx: 0.9, my: 0.3, iris: 1.05, sd: 24, gd: 0.1, si: 26, gi: 0.1, abre: 4, ancho: 0.9, sonr: 0.55 }),
    risa: E({ mx: 0.6, my: 0.2, c: 1, h: 1, sd: 16, si: 16, abre: 28, ancho: 1.06, sonr: 1 }),
    camara: E({ mx: -0.6, my: 0, c: 0.3, h: 0.45, sd: 16, si: 16, abre: 12, ancho: 1.06, sonr: 1 }),
    guino: E({ mx: -0.6, my: 0, c: 0.2, h: 0.3, wd: 0.8, sd: -6, gd: -0.08, si: 18, gi: 0.06, abre: 10, ancho: 1.08, sonr: 1, mof: 0.2 })
  };
  const GUION_CARA_Y = [
    [0.3, 0.5, "juega"], [T.ceja - 0.05, T.ceja + 0.1, "ceja"], [T.carga0, T.carga0 + 0.15, "mira"], [T.suelta - 0.05, T.suelta + 0.05, "lanza"],
    [T.suelta + 0.3, T.suelta + 0.5, "mira"], [T.cae1, T.cae1 + 0.12, "cejas", salida], [T.cae1 + 0.35, T.cae1 + 0.6, "divertido"],
    [T.golpe - 0.08, T.golpe + 0.05, "oops", salida], [T.yTapa0, T.yTapa0 + 0.12, "aguanta"],
    [T.yAnda0, T.yAnda0 + 0.25, "pasea"], [T.yAgacha0, T.engancha, "facil"], [T.aprieta[0][0] - 0.1, T.aprieta[0][0] + 0.05, "muestra"],
    [T.alza0, T.alza0 + 0.12, "cejas"], [T.yRisa0, T.yRisa0 + 0.1, "risa", salida], [T.yRisa1, T.camara + 0.2, "camara"],
    [T.ultimo - 0.06, T.ultimo + 0.04, "guino"], [T.ultimo + 0.4, T.ultimo + 0.6, "camara"]
  ];

  /* =====================================================================================
   * POSES COMPLETAS
   * ===================================================================================== */
  const cacheY = new Map(), cacheG = new Map();
  function memo(cache, fn) { return t => { const k = t.toFixed(5); if (cache.has(k)) return cache.get(k); if (cache.size > 24) cache.clear(); const v = fn(t); cache.set(k, v); return v; }; }
  const memoCuerpoY = memo(new Map(), cuerpoY0), memoCuerpoG = memo(new Map(), cuerpoG0), memoPesa = memo(new Map(), mancuerna0);
  const poseY = memo(cacheY, t => {
    const Q = cuerpoY(t), p = Q.p;
    manosY(Q, t);
    const e = guion(GUION_CARA_Y, CY, "base", t);
    // sigue la mancuerna con la vista mientras juega y la lanza
    const m = mancuerna(t);
    miraA(e, Q, m.c, t < T.ceja - 0.08 ? 0.9 : t < T.suelta + 0.25 && t > T.suelta - 0.05 ? 0.6 : 0);
    // cuando Guillermo se levanta, lo sigue con la vista
    if (t > T.alza0 - 0.1 && t < T.yRisa0) { const QG = cuerpoG(t); miraA(e, Q, enMundo(QG, G.centroCabeza(QG.p)), 0.8 * dentro(t, T.alza0 - 0.1, T.alza0 + 0.1, T.yRisa0 - 0.1, T.yRisa0)); }
    const ri = rieY(t);
    e.abre += 8 * Math.abs(Math.sin((t - T.yRisa0) * 21)) * ri;
    p.cara = cara(e, parpadeo(t, [1.62, 3.55, 5.2, 7.2, 9.0, 11.4, 13.0]));
    p.rojo = 0;
    return Q;
  });
  const poseG = memo(cacheG, t => {
    const Q = cuerpoG(t), p = Q.p;
    manosG(Q, t);
    const e = guion(GUION_CARA_G, CG, "base", t);
    // sigue la mancuerna con los ojos (juego y vuelo)
    const m = mancuerna(t);
    miraA(e, Q, m.c, t < T.ceja ? 0.85 : t > T.suelta - 0.05 && t < T.atrapa ? 0.85 : 0);
    // tumbado: mira la mancuerna o a Yorgi
    if (t > T.mira - 0.1 && t < T.alza0) {
      const yo = poseYcuerpoCabeza(t);
      const aYorgi = dentro(t, 7.8, 7.95, T.engancha - 0.1, T.engancha);
      const aPesa = dentro(t, T.mira - 0.1, T.mira + 0.05, 7.75, 7.85) + dentro(t, T.engancha - 0.05, T.engancha + 0.05, T.alza0 - 0.2, T.alza0);
      miraA(e, Q, m.c, 0.85 * aPesa); miraA(e, Q, yo, 0.85 * aYorgi);
    }
    // boquea: la boca se abre y se cierra
    const boq = dentro(t, T.empuja1, T.empuja1 + 0.1, 7.8, 7.95) + dentro(t, T.levanta1, T.levanta1 + 0.1, 9.0, 9.15);
    e.abre += 14 * Math.abs(Math.sin(t * 9)) * boq; e.ancho -= 0.15 * Math.abs(Math.sin(t * 9)) * boq;
    // tic en el ojo
    let tic = 0; for (const tt of T.tic) tic = Math.max(tic, campana(t, tt, tt + 0.07));
    e.wd += 0.45 * tic;
    p.cara = cara(e, e.esp > 0.3 ? 0 : parpadeo(t, [0.95, 2.05, 3.62, 6.62, 8.15, 11.05, 12.7, 13.4]));
    p.rojo = 0.9 * dentro(t, T.cae1 - 0.05, T.cae1 + 0.3, T.golpe + 0.6, T.golpe + 1.0) + 0.8 * dentro(t, T.empuja0, T.empuja0 + 0.25, T.empuja1, 7.3)
      + 0.5 * dentro(t, 7.5, 7.7, T.levanta1, T.levanta1 + 0.4);
    p.sudor = dentro(t, T.cae1 + 0.1, T.sube0, T.golpe + 0.3, T.golpe + 0.6) + 0.8 * dentro(t, T.empuja0, T.empuja0 + 0.3, 8.0, 8.5);
    p.enfado = 0;
    p.capaCabeza = (g, tt) => ticOjo(g, tic);
    return Q;
  });
  function poseYcuerpoCabeza(t) { const Q = cuerpoY(t); return enMundo(Q, Y.centroCabeza(Q.p)); }

  /* ---------- capa de la cabeza de Guillermo: rayitas del tic (retrato) ---------- */
  function ticOjo(g, k) {
    if (k <= 0.02) return;
    g.save(); g.strokeStyle = TINTA; g.lineCap = "round"; g.lineWidth = 7; g.globalAlpha = clamp(k * 1.6);
    for (let i = 0; i < 3; i++) {
      const a = Math.PI + 0.5 - i * 0.5, r0 = 70, r1 = 100;
      g.beginPath(); g.moveTo(760 + Math.cos(a) * r0, 556 + Math.sin(a) * r0 * 0.9); g.lineTo(760 + Math.cos(a) * r1, 556 + Math.sin(a) * r1 * 0.9); g.stroke();
    }
    g.restore();
  }

  /* =====================================================================================
   * LA MANCUERNA: dibujo (px de pantalla, centrada en su centro)
   * ===================================================================================== */
  function disco(g, cx, sq) {
    const w = MP.pw * (1 + 0.38 * sq), h = MP.ph * (1 + 0.12 * sq), ch = 6 + 4 * sq, pin = sq * w * 0.4;
    const forma = () => {
      g.beginPath();
      g.moveTo(cx - w + ch, -h); g.lineTo(cx + w - ch, -h); g.quadraticCurveTo(cx + w, -h, cx + w, -h + ch);
      g.quadraticCurveTo(cx + w - 2 * pin, 0, cx + w, h - ch); g.quadraticCurveTo(cx + w, h, cx + w - ch, h);
      g.lineTo(cx - w + ch, h); g.quadraticCurveTo(cx - w, h, cx - w, h - ch);
      g.quadraticCurveTo(cx - w + 2 * pin, 0, cx - w, -h + ch); g.quadraticCurveTo(cx - w, -h, cx - w + ch, -h); g.closePath();
    };
    forma(); g.fillStyle = "#24262b"; g.fill();
    g.save(); forma(); g.clip();
    // dos caras del hexágono (simétricas) y sus brillos
    g.fillStyle = "#33363d"; g.fillRect(cx - w - 2, -h * 0.55, 2 * w + 4, h * 1.1);
    g.strokeStyle = "rgba(255,255,255,0.22)"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(cx - w + 3, -h * 0.55); g.lineTo(cx + w - 3, -h * 0.55); g.moveTo(cx - w + 3, h * 0.55); g.lineTo(cx + w - 3, h * 0.55); g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.14)"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(cx - w * 0.35, -h + 4); g.lineTo(cx - w * 0.35, h - 4); g.stroke();
    g.restore();
    forma(); g.lineWidth = 2.6; g.strokeStyle = TINTA; g.stroke();
  }
  function pesa(g, m) {
    g.save(); g.translate(m.c.x, m.c.y); g.rotate(m.a); g.scale(m.jx ?? 1, m.jy ?? 1);
    g.lineJoin = "round"; g.lineCap = "round";
    // barra cromada con moleteado
    const hx = MP.hx + 2, hr = MP.hr;
    g.beginPath(); g.rect(-hx, -hr, 2 * hx, 2 * hr);
    const gr = g.createLinearGradient(0, -hr, 0, hr);
    gr.addColorStop(0, "#8d939b"); gr.addColorStop(0.35, "#f1f4f7"); gr.addColorStop(0.65, "#f1f4f7"); gr.addColorStop(1, "#8d939b");
    g.fillStyle = gr; g.fill();
    g.save(); g.clip(); g.strokeStyle = "rgba(60,64,70,0.35)"; g.lineWidth = 1;
    for (let x = -hx + 3; x < hx; x += 4) { g.beginPath(); g.moveTo(x, -hr); g.lineTo(x + 3, hr); g.moveTo(x + 3, -hr); g.lineTo(x, hr); g.stroke(); }
    g.restore();
    g.lineWidth = 2.2; g.strokeStyle = TINTA; g.strokeRect(-hx, -hr, 2 * hx, 2 * hr);
    // collarines
    for (const sg of [-1, 1]) {
      g.beginPath(); g.rect(sg * (MP.hx - 4) - 3, -hr - 4, 6, 2 * hr + 8); g.fillStyle = "#c9ced5"; g.fill(); g.lineWidth = 2; g.stroke();
    }
    disco(g, -PLACA, m.sqA || 0); disco(g, PLACA, m.sqB || 0);
    g.restore();
  }
  let CAM = null;
  const objetoPesa = m => (g, t) => { g.save(); g.setTransform(CAM); pesa(g, m); g.restore(); };

  /* =====================================================================================
   * DIBUJO DE LOS MUÑECOS
   * ===================================================================================== */
  function dibuja(g, Q, t) {
    const { R, p, M } = Q;
    g.save();
    if (M.sx < 0.999) { g.translate(M.W.x, 0); g.scale(M.sx, 1); g.translate(-M.W.x, 0); }
    g.translate(M.W.x, M.W.y); g.rotate(M.phi); g.translate(-M.Pp.x, -M.Pp.y);
    R.dibujar(g, p, t);
    g.restore();
  }

  /* =====================================================================================
   * FONDO (se pinta una vez)
   * ===================================================================================== */
  const FX = -160, FY = -70, FW = W + 320, FH = H + 130, FS = 1.25;
  const PARED = 432, FUGA = P(512, 140);
  let fondo = null;
  function lienzo(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  function creaFondo() {
    const c = lienzo(Math.ceil(FW * FS), Math.ceil(FH * FS)), g = c.getContext("2d");
    g.scale(FS, FS); g.translate(-FX, -FY); g.lineJoin = "round"; g.lineCap = "round";
    const X0 = FX, X1 = FX + FW, Y0 = FY, Y1 = FY + FH;
    // pared alta: bloques pintados verde azulado
    let gr = g.createLinearGradient(0, Y0, 0, 270);
    gr.addColorStop(0, "#26343b"); gr.addColorStop(0.55, "#425a64"); gr.addColorStop(1, "#4f6b76");
    g.fillStyle = gr; g.fillRect(X0, Y0, FW, 270 - Y0);
    g.strokeStyle = "rgba(18,28,34,0.28)"; g.lineWidth = 1.6;
    for (let y = 270, f = 0; y > Y0; y -= 36, f++) {
      g.beginPath(); g.moveTo(X0, y); g.lineTo(X1, y); g.stroke();
      for (let x = X0 + (f % 2) * 46; x < X1; x += 92) { g.beginPath(); g.moveTo(x, y - 36); g.lineTo(x, y); g.stroke(); }
    }
    g.strokeStyle = "rgba(200,230,240,0.06)"; g.lineWidth = 1.2;
    for (let y = 270 - 34; y > Y0; y -= 36) { g.beginPath(); g.moveTo(X0, y); g.lineTo(X1, y); g.stroke(); }
    // franja naranja y raya amarilla
    g.fillStyle = "#e8792b"; g.fillRect(X0, 270, FW, 20);
    g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(X0, 271, FW, 3);
    g.fillStyle = "#f4c542"; g.fillRect(X0, 294, FW, 5);
    // pared baja carbón
    gr = g.createLinearGradient(0, 299, 0, PARED); gr.addColorStop(0, "#2c3338"); gr.addColorStop(1, "#1f2428");
    g.fillStyle = gr; g.fillRect(X0, 299, FW, PARED - 299);
    g.fillStyle = "#121417"; g.fillRect(X0, PARED - 12, FW, 12);
    g.fillStyle = "rgba(255,255,255,0.07)"; g.fillRect(X0, PARED - 12, FW, 2);
    // lámparas: luz en la pared
    for (const lx of [380, 790]) {
      const r = g.createRadialGradient(lx, 120, 10, lx, 160, 330);
      r.addColorStop(0, "rgba(255,236,200,0.22)"); r.addColorStop(1, "rgba(255,236,200,0)");
      g.fillStyle = r; g.fillRect(lx - 340, Y0, 680, PARED - Y0);
    }
    espejos(g);
    carteles(g);
    mueble(g);
    banco(g);
    // suelo de caucho
    gr = g.createLinearGradient(0, PARED, 0, Y1); gr.addColorStop(0, "#1a1c20"); gr.addColorStop(1, "#2e3138");
    g.fillStyle = gr; g.fillRect(X0, PARED, FW, Y1 - PARED);
    g.save(); g.beginPath(); g.rect(X0, PARED, FW, Y1 - PARED); g.clip();
    for (let i = 0; i < 2200; i++) {
      const x = X0 + hash(i * 1.37 + 0.2) * FW, v = hash(i * 2.71 + 5), y = PARED + Math.pow(v, 0.75) * (Y1 - PARED);
      const k = (y - PARED) / (Y1 - PARED), cc = hash(i * 0.91 + 9);
      g.fillStyle = cc < 0.4 ? "rgba(150,160,175,0.35)" : cc < 0.6 ? "rgba(60,120,200,0.35)" : cc < 0.75 ? "rgba(220,90,60,0.32)" : "rgba(235,235,225,0.28)";
      const s = 1 + 1.6 * k; g.fillRect(x, y, s, s * 0.7);
    }
    g.strokeStyle = "rgba(0,0,0,0.55)"; g.lineWidth = 1.8;
    for (let i = -18; i <= 18; i++) { const xb = 512 + i * 120, xt = lerp(FUGA.x, xb, (PARED - FUGA.y) / (Y1 - FUGA.y)); g.beginPath(); g.moveTo(xt, PARED); g.lineTo(xb, Y1); g.stroke(); }
    for (let j = 1; j < 8; j++) { const y = PARED + Math.pow(j / 8, 1.45) * (Y1 - PARED); g.beginPath(); g.moveTo(X0, y); g.lineTo(X1, y); g.stroke(); }
    g.strokeStyle = "rgba(255,255,255,0.05)"; g.lineWidth = 1.2;
    for (let j = 1; j < 8; j++) { const y = PARED + Math.pow(j / 8, 1.45) * (Y1 - PARED) + 2; g.beginPath(); g.moveTo(X0, y); g.lineTo(X1, y); g.stroke(); }
    // charcos de luz de las lámparas
    for (const lx of [380, 790]) {
      g.save(); g.translate(lx, 520); g.scale(1, 0.28);
      const r = g.createRadialGradient(0, 0, 10, 0, 0, 380);
      r.addColorStop(0, "rgba(255,230,190,0.2)"); r.addColorStop(1, "rgba(255,230,190,0)");
      g.fillStyle = r; g.fillRect(-400, -400, 800, 800); g.restore();
    }
    g.restore();
    kettlebell(g, 486, PARED + 22, 1, "#e8792b");
    kettlebell(g, 930, PARED + 34, 0.85, "#4b525c");
    lamparas(g);
    // viñeta
    const r = g.createRadialGradient(512, 330, 280, 512, 330, 760);
    r.addColorStop(0, "rgba(0,0,0,0)"); r.addColorStop(1, "rgba(0,0,0,0.55)");
    g.fillStyle = r; g.fillRect(X0, Y0, FW, FH);
    return c;
  }
  function espejos(g) {
    const x0 = FX, x1 = 232, y0 = 34, y1 = PARED - 12;
    g.save();
    g.fillStyle = "#1a1d20"; g.fillRect(x0, y0 - 8, x1 - x0 + 8, y1 - y0 + 8);
    g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
    let gr = g.createLinearGradient(0, y0, 0, y1);
    gr.addColorStop(0, "#7d939e"); gr.addColorStop(0.55, "#9fb4be"); gr.addColorStop(0.62, "#c78456"); gr.addColorStop(0.66, "#9fb4be");
    gr.addColorStop(0.67, "#56656d"); gr.addColorStop(1, "#3c464c");
    g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    // reflejo vago del otro lado de la sala: siluetas de máquinas
    g.fillStyle = "rgba(40,50,58,0.35)";
    g.fillRect(-90, 190, 60, 120); g.fillRect(-40, 150, 14, 160); g.fillRect(60, 210, 90, 100); g.fillRect(140, 170, 12, 140);
    // brillos en diagonal
    g.fillStyle = "rgba(255,255,255,0.16)";
    for (const [x, w] of [[-120, 36], [-60, 12], [30, 50], [120, 16], [170, 30]]) {
      g.beginPath(); g.moveTo(x, y1); g.lineTo(x + w, y1); g.lineTo(x + w + 150, y0); g.lineTo(x + 150, y0); g.closePath(); g.fill();
    }
    g.restore();
    // marcos de los paneles
    g.strokeStyle = "#cdd3d8"; g.lineWidth = 4;
    for (let x = x0; x <= x1 + 1; x += (x1 - x0) / 3) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); }
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); g.moveTo(x0, y1); g.lineTo(x1, y1); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 1.5;
    g.strokeRect(x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4);
  }
  function carteles(g) {
    const cartel = (x, y, w, h, fondoC, dib) => {
      g.save(); g.fillStyle = "rgba(0,0,0,0.3)"; g.fillRect(x + 4, y + 5, w, h);
      g.fillStyle = fondoC; g.fillRect(x, y, w, h); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(x, y, w, h);
      g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(x + 3, y + 3, w - 6, 5);
      g.translate(x + w / 2, y + h / 2); dib(); g.restore();
    };
    // bíceps
    cartel(424, 74, 70, 98, "#f4c542", () => {
      g.fillStyle = TINTA; g.beginPath();
      g.moveTo(-24, 30); g.lineTo(-24, 6); g.quadraticCurveTo(-22, -6, -8, -4); g.quadraticCurveTo(-2, -26, 10, -30);
      g.quadraticCurveTo(22, -32, 22, -20); g.quadraticCurveTo(22, -12, 12, -12); g.quadraticCurveTo(8, -6, 12, 4);
      g.quadraticCurveTo(22, 4, 22, 16); g.quadraticCurveTo(18, 30, 0, 30); g.closePath(); g.fill();
      g.strokeStyle = "#f4c542"; g.lineWidth = 2; g.beginPath(); g.moveTo(-6, 4); g.quadraticCurveTo(2, 0, 8, 8); g.stroke();
    });
    // rayo
    cartel(904, 86, 62, 88, "#d63a33", () => {
      g.fillStyle = "#fff4e0"; g.beginPath(); g.moveTo(6, -34); g.lineTo(-14, 4); g.lineTo(-1, 4); g.lineTo(-8, 34); g.lineTo(14, -6); g.lineTo(1, -6); g.closePath(); g.fill();
      g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke();
    });
    // corazón con latido
    cartel(1004, 100, 66, 76, "#2f6fae", () => {
      g.fillStyle = "#ff8a80"; g.beginPath(); g.moveTo(0, 22); g.bezierCurveTo(-34, -2, -18, -30, 0, -12); g.bezierCurveTo(18, -30, 34, -2, 0, 22); g.fill();
      g.strokeStyle = "#ffffff"; g.lineWidth = 2.6; g.beginPath(); g.moveTo(-26, 0); g.lineTo(-10, 0); g.lineTo(-5, -10); g.lineTo(1, 10); g.lineTo(6, -4); g.lineTo(26, -4); g.stroke();
    });
  }
  function hexCabeza(g, x, y, r) {
    g.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath();
    g.fillStyle = "#262a30"; g.fill(); g.lineWidth = 1.8; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.12)"; g.beginPath(); g.moveTo(x - r * 0.86, y - r * 0.5); g.lineTo(x, y - r); g.lineTo(x + r * 0.86, y - r * 0.5); g.lineTo(x, y - r * 0.6); g.closePath(); g.fill();
    g.fillStyle = "#c9ced5"; g.beginPath(); g.arc(x, y, r * 0.32, 0, TAU); g.fill(); g.lineWidth = 1.2; g.stroke();
  }
  function mueble(g) {
    const x0 = 556, x1 = 846, base = PARED + 6;
    g.save();
    g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse((x0 + x1) / 2, base + 4, (x1 - x0) / 2 + 20, 8, 0, 0, TAU); g.fill();
    // patas y estructura
    g.fillStyle = "#1b1e22"; g.strokeStyle = TINTA; g.lineWidth = 2;
    for (const x of [x0, x1 - 12]) { g.beginPath(); g.rect(x, 302, 12, base - 302); g.fill(); g.stroke(); }
    for (const [y, h] of [[338, 10], [398, 10]]) {
      g.fillStyle = "#e8792b"; g.beginPath(); g.rect(x0 - 6, y, x1 - x0 + 12, h); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(x0 - 4, y + 1, x1 - x0 + 8, 2);
    }
    // cabezas de las mancuernas (de frente), de menor a mayor; falta una arriba
    let x = x0 + 18;
    for (let i = 0; i < 9; i++) { const r = 11 + i * 0.9; if (i !== 6) hexCabeza(g, x + r, 338 - r + 2, r); else { g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(x + 2, 334, 2 * r - 4, 3); } x += 2 * r + 6; }
    x = x0 + 16;
    for (let i = 0; i < 7; i++) { const r = 17 + i * 1.1; hexCabeza(g, x + r, 398 - r + 2, r); x += 2 * r + 5; }
    g.restore();
  }
  function banco(g) {
    const x0 = 868, x1 = 1110, y = 392;
    g.save(); g.lineJoin = "round";
    g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse((x0 + x1) / 2, PARED + 18, (x1 - x0) / 2, 8, 0, 0, TAU); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2.2;
    g.fillStyle = "#b9c0c8";
    for (const lx of [x0 + 26, x1 - 40]) { g.beginPath(); g.rect(lx, y + 14, 10, PARED + 16 - y - 14); g.fill(); g.stroke(); g.beginPath(); g.rect(lx - 18, PARED + 12, 46, 7); g.fill(); g.stroke(); }
    g.fillStyle = "#8b8f96"; g.beginPath(); g.rect(x0 + 20, y + 12, x1 - x0 - 50, 8); g.fill(); g.stroke();
    // cojín
    g.fillStyle = "#7d1e24"; g.beginPath(); g.moveTo(x0 + 8, y); g.lineTo(x1 - 8, y); g.quadraticCurveTo(x1, y, x1, y + 8); g.lineTo(x1, y + 12); g.lineTo(x0, y + 12); g.lineTo(x0, y + 8); g.quadraticCurveTo(x0, y, x0 + 8, y); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(x0 + 8, y + 2, x1 - x0 - 16, 2);
    // toalla
    g.fillStyle = "#8fd0e0"; g.beginPath(); g.moveTo(x0 + 60, y - 3); g.lineTo(x0 + 112, y - 3); g.lineTo(x0 + 116, y + 40); g.quadraticCurveTo(x0 + 100, y + 44, x0 + 92, y + 36); g.lineTo(x0 + 86, y + 14); g.lineTo(x0 + 62, y + 12); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.6)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0 + 66, y + 2); g.lineTo(x0 + 108, y + 2); g.stroke();
    // botellín
    g.strokeStyle = TINTA; g.lineWidth = 2; g.fillStyle = "rgba(120,200,240,0.75)";
    g.beginPath(); g.rect(x1 - 70, y - 34, 18, 34); g.fill(); g.stroke();
    g.fillStyle = "#2f6fae"; g.beginPath(); g.rect(x1 - 67, y - 42, 12, 8); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.5)"; g.fillRect(x1 - 66, y - 30, 3, 24);
    g.restore();
  }
  function kettlebell(g, x, y, e, col) {
    g.save(); g.translate(x, y); g.scale(e, e); g.lineJoin = "round";
    g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse(0, 2, 30, 6, 0, 0, TAU); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 9; g.beginPath(); g.moveTo(-14, -34); g.quadraticCurveTo(-16, -56, 0, -56); g.quadraticCurveTo(16, -56, 14, -34); g.stroke();
    g.strokeStyle = "#2a2e33"; g.lineWidth = 5.5; g.stroke();
    g.fillStyle = col; g.beginPath(); g.arc(0, -20, 24, 0, TAU); g.fill(); g.lineWidth = 2.4; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "rgba(0,0,0,0.25)"; g.beginPath(); g.arc(4, -16, 20, 0.2, 2.6); g.fill();
    g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.ellipse(-8, -30, 7, 4, -0.6, 0, TAU); g.fill();
    g.fillStyle = "#1b1e22"; g.fillRect(-16, -2, 32, 4);
    g.restore();
  }
  function lamparas(g) {
    for (const lx of [380, 790]) {
      g.save(); g.strokeStyle = "#0e1013"; g.lineWidth = 2; g.beginPath(); g.moveTo(lx, FY); g.lineTo(lx, 10); g.stroke();
      g.fillStyle = "#2b3a40"; g.strokeStyle = TINTA; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(lx - 6, 8); g.lineTo(lx + 6, 8); g.lineTo(lx + 34, 40); g.lineTo(lx - 34, 40); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#fff4d6"; g.beginPath(); g.ellipse(lx, 40, 30, 5, 0, 0, TAU); g.fill();
      // cono de luz
      const gr = g.createLinearGradient(0, 40, 0, 300);
      gr.addColorStop(0, "rgba(255,240,205,0.16)"); gr.addColorStop(1, "rgba(255,240,205,0)");
      g.fillStyle = gr; g.beginPath(); g.moveTo(lx - 30, 40); g.lineTo(lx + 30, 40); g.lineTo(lx + 150, 300); g.lineTo(lx - 150, 300); g.closePath(); g.fill();
      g.restore();
    }
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  function sombra(g, x, y, rx, ry, a) {
    if (a <= 0.01) return;
    g.save(); g.fillStyle = `rgba(6,8,10,${a})`; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); g.restore();
  }
  function nube(g, t, t0, c, ancho, alto, dur, n, op) {
    const k = fase(t, t0, t0 + dur); if (k <= 0 || k >= 1) return;
    const a = tramo(t, t0, t0 + 0.07) * (1 - tramo(t, t0 + dur * 0.45, t0 + dur)) * op;
    g.save(); g.globalAlpha = a;
    const bolas = [];
    for (let i = 0; i < n; i++) {
      const s = n > 1 ? i / (n - 1) * 2 - 1 : 0, h = hash(i * 7.31 + t0 * 3), ex = salida(fase(t, t0, t0 + dur * 0.6));
      bolas.push({ x: c.x + s * ancho * (0.35 + 0.65 * ex) + (h - 0.5) * 10, y: c.y - alto * (0.15 + 0.5 * (1 - Math.abs(s)) * (0.6 + 0.4 * h)) * (0.5 + 0.5 * ex) - 14 * k,
        r: (alto * 0.32 + alto * 0.22 * h) * (0.55 + 0.45 * ex) * (1 - 0.25 * k) });
    }
    g.fillStyle = TINTA; for (const b of bolas) { g.beginPath(); g.arc(b.x, b.y, b.r + 2.6, 0, TAU); g.fill(); }
    g.fillStyle = "#b9bcc2"; for (const b of bolas) { g.beginPath(); g.arc(b.x, b.y, b.r, 0, TAU); g.fill(); }
    g.fillStyle = "#e2e4e8"; for (const b of bolas) { g.beginPath(); g.arc(b.x - b.r * 0.25, b.y - b.r * 0.28, b.r * 0.55, 0, TAU); g.fill(); }
    g.restore();
  }
  function polvillo(g, t, t0, x, y, dir, n, op) {
    const k = fase(t, t0, t0 + 0.45); if (k <= 0 || k >= 1) return;
    const a = tramo(t, t0, t0 + 0.05) * (1 - suave(k)) * op;
    g.save(); g.fillStyle = "#d9dde2";
    for (let i = 0; i < n; i++) {
      const h = hash(i * 3.7 + t0), s = dir * (0.3 + 0.7 * h) * (i % 2 ? 1 : -0.6);
      g.globalAlpha = a * (0.5 + 0.5 * h);
      g.beginPath(); g.arc(x + s * 34 * salida(k), y - 4 - 18 * salida(k) * h, 3 + 6 * salida(k), 0, TAU); g.fill();
    }
    g.restore();
  }
  function estrellitas(g, t, c, k) {
    if (k <= 0.02) return;
    g.save(); g.globalAlpha = k;
    for (let i = 0; i < 4; i++) {
      const a = t * 4.5 + i * TAU / 4, x = c.x + Math.cos(a) * 18, y = c.y + Math.sin(a) * 52;
      g.save(); g.translate(x, y); g.rotate(t * 3 + i);
      g.beginPath(); for (let j = 0; j < 10; j++) { const r = j % 2 ? 4 : 10, aa = j * Math.PI / 5 - Math.PI / 2; g.lineTo(Math.cos(aa) * r, Math.sin(aa) * r); } g.closePath();
      g.fillStyle = "#ffe066"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke(); g.restore();
    }
    g.restore();
  }
  function gotas(g, t, c, k, dir) {
    if (k <= 0.02) return;
    g.save(); g.fillStyle = "#bfe6ff"; g.strokeStyle = "#1d3b52"; g.lineWidth = 1.8;
    for (let i = 0; i < 3; i++) {
      const ph = (t * 1.6 + i / 3) % 1, sg = i % 2 ? 1 : -1, x = c.x + sg * (30 + 46 * ph), y = c.y - 30 - 40 * ph + 90 * ph * ph;
      g.globalAlpha = k * Math.sin(Math.PI * ph);
      g.save(); g.translate(x, y); g.rotate(sg * (0.4 + ph)); g.beginPath(); g.moveTo(0, -7); g.quadraticCurveTo(5, 1, 0, 4); g.quadraticCurveTo(-5, 1, 0, -7); g.fill(); g.stroke(); g.restore();
    }
    g.restore();
  }
  // rayitas de golpe (al cazar, palmadas, chirrido)
  function rayas(g, t, t0, c, r0, r1, a0, a1, n, col, e = 1) {
    const k = fase(t, t0 - 0.02, t0 + 0.28); if (k <= 0 || k >= 1) return;
    const a = tramo(t, t0 - 0.02, t0 + 0.03) * (1 - tramo(t, t0 + 0.1, t0 + 0.28));
    g.save(); g.lineCap = "round"; g.globalAlpha = a;
    for (let i = 0; i < n; i++) {
      const an = lerp(a0, a1, n > 1 ? i / (n - 1) : 0.5), ra = (r0 + 18 * salida(k)) * e, rb = (r1 + 22 * salida(k)) * e;
      const p0 = P(c.x + Math.cos(an) * ra, c.y + Math.sin(an) * ra), p1 = P(c.x + Math.cos(an) * rb, c.y + Math.sin(an) * rb);
      g.strokeStyle = TINTA; g.lineWidth = 5.5 * e; g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.stroke();
      g.strokeStyle = col; g.lineWidth = 2.8 * e; g.stroke();
    }
    g.restore();
  }
  // chirrido de la gomaespuma: rayitas y ondas
  function chirrido(g, t, t0, c, sg) {
    const k = fase(t, t0 - 0.02, t0 + 0.4); if (k <= 0 || k >= 1) return;
    const a = tramo(t, t0 - 0.02, t0 + 0.03) * (1 - tramo(t, t0 + 0.18, t0 + 0.4));
    rayas(g, t, t0, c, 40, 54, -Math.PI / 2 - 0.9, -Math.PI / 2 + 0.9, 5, "#fff3b0", 0.85);
    g.save(); g.globalAlpha = a; g.lineCap = "round";
    for (let i = 0; i < 2; i++) {
      const r = 26 + 14 * i + 18 * salida(k);
      for (const [col, w] of [[TINTA, 5], ["#ffffff", 2.4]]) {
        g.strokeStyle = col; g.lineWidth = w;
        g.beginPath(); g.arc(c.x + sg * 22, c.y - 6, r, -0.5, 0.5); g.stroke();
        g.beginPath(); g.arc(c.x - sg * 22, c.y - 6, r, Math.PI - 0.5, Math.PI + 0.5); g.stroke();
      }
    }
    g.restore();
  }
  function brillo(g, x, y, r, a, rot0) {
    if (a <= 0.01) return;
    g.save(); g.translate(x, y); g.rotate(rot0); g.globalAlpha = a;
    g.beginPath();
    for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.28 : r, aa = i * Math.PI / 4; g.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); }
    g.closePath(); g.fillStyle = "#fffbe0"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.8; g.stroke();
    g.restore();
  }
  // estela de la mancuerna en el aire
  function estela(g, t) {
    const m = mancuerna(t); if (m.quien !== "aire") return;
    g.save(); g.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const pts = []; for (let j = 1; j < 7; j++) { const mm = mancuerna(t - 0.022 * j); if (mm.quien !== "aire") break; pts.push(add(mm.c, P(0, (i - 1) * 22))); }
      if (pts.length < 3) continue;
      g.globalAlpha = 0.55; g.strokeStyle = "#f2f6f8"; g.lineWidth = 3.5 - i * 0.6;
      g.beginPath(); g.moveTo(pts[1].x, pts[1].y); for (let j = 2; j < pts.length; j++) g.lineTo(pts[j].x, pts[j].y); g.stroke();
    }
    g.restore();
  }

  /* =====================================================================================
   * CÁMARA
   * ===================================================================================== */
  const PLANOS = [
    [0, 0, 1.2, 420, 318],
    [3.2, 3.85, 1.26, 470, 322],
    [4.12, 4.6, 1.38, 520, 330],
    [5.2, 5.7, 1.18, 515, 372],
    [6.3, 7.3, 1.12, 560, 345],
    [7.62, 8.3, 1.3, 640, 345],
    [10.36, 10.95, 1.08, 560, 322],
    [11.8, 12.3, 1.14, 572, 316],
    [12.9, 13.6, 1.18, 578, 312]
  ];
  function camara(t) {
    let k = PLANOS[0][2], x = PLANOS[0][3], y = PLANOS[0][4];
    for (let i = 1; i < PLANOS.length; i++) { const [t0, t1, kk, xx, yy] = PLANOS[i]; if (t <= t0) break; const s = tramo(t, t0, t1); k = lerp(k, kk, s); x = lerp(x, xx, s); y = lerp(y, yy, s); }
    let tb = 0;
    for (const [t0, a] of [[T.cae1, 2.5], [T.golpe, 5]]) if (t >= t0) tb += a * Math.exp(-(t - t0) * 9) * tramo(t, t0, t0 + 0.03);
    // el encuadre no se sale del fondo
    const mx = W / 2 / k, my = H / 2 / k;
    x = clamp(x, FX + mx + 2, FX + FW - mx - 2); y = clamp(y, FY + my + 2, FY + FH - my - 2);
    return { k, x: x + ruido(t * 40) * tb, y: y + ruido(t * 40 + 13) * tb * 0.6 };
  }

  /* =====================================================================================
   * ESCENA
   * ===================================================================================== */
  class LaMancuerna extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Y.listo()) return;
      if (!fondo) fondo = creaFondo();
      const QY = poseY(t), QG = poseG(t), m = mancuerna(t);
      const luz = tramo(t, NEGRO_INICIO, 0.75, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      CAM = g.getTransform();
      g.drawImage(fondo, FX, FY, FW, FH);
      // sombras
      const tum = t >= T.golpe && t < T.alza0;
      sombra(g, QY.M.W.x, QY.p.suelo + 2, 64 * (QY.M.sx * 0.6 + 0.4), 8, 0.4);
      if (t < T.vuelca0 || t >= T.alza1) sombra(g, QG.M.W.x, SUELO + 2, 62 * (QG.M.sx * 0.6 + 0.4), 8, 0.42);
      else {
        const ph = QG.M.phi / (Math.PI / 2), cx = QG.M.W.x + 30 * ph;
        sombra(g, cx, SUELO + 2, lerp(62, 230, ph), lerp(8, 12, ph), 0.42);
      }
      if (m.quien === "aire") { const h = clamp((SUELO - m.c.y) / 300); sombra(g, m.c.x, SUELO + 2, 46 * (1 - 0.4 * h), 5, 0.3 * (1 - 0.5 * h)); }
      // la mancuerna va con la mano que la lleva (objeto: debajo de los dedos)
      if (m.quien === "yC") QY.p.manoCerca.objeto = objetoPesa(m);
      if (m.quien === "yL") QY.p.manoLejos.objeto = objetoPesa(m);
      if (m.quien === "g") QG.p.manoLejos.objeto = objetoPesa(m);
      // orden: Yorgi detrás (se queda arriba cuando Guillermo está en el suelo)
      dibuja(g, QY, t);
      dibuja(g, QG, t);
      if (m.quien === "aire") { estela(g, t); pesa(g, m); }
      efectos(g, t, QY, QG, m);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  function efectos(g, t, QY, QG, m) {
    // recogidas de Yorgi y caza de Guillermo
    T.tiros.forEach(([, t1], i) => { const q = mancuerna(t1 + 0.001).c; rayas(g, t, t1, q, 34, 44, -Math.PI / 2 - 0.7, -Math.PI / 2 + 0.7, 3, "#ffffff", 0.7); });
    rayas(g, t, T.atrapa, mancuerna(T.atrapa + 0.001).c, 40, 54, -Math.PI / 2 - 0.9, -Math.PI / 2 + 0.9, 5, "#fff3c4", 0.85);
    // ¡zas! hacia abajo
    if (t > T.cae1 - 0.05 && t < T.cae1 + 0.35) rayas(g, t, T.cae1, add(mancuerna(T.cae1).c, P(0, 30)), 52, 66, 0.4, Math.PI - 0.4, 5, "#fff3c4", 0.9);
    // sudor de pie
    if (t < T.vuelca0) { const cab = enMundo(QG, G.centroCabeza(QG.p)); gotas(g, t, cab, dentro(t, T.cae1 + 0.15, T.sube0, T.vuelca0 - 0.1, T.vuelca0), 1); }
    // golpe en el suelo
    nube(g, t, T.golpe - 0.02, P(QG.M.W.x + 40, SUELO + 6), 210, 62, 0.85, 14, 0.9);
    rayas(g, t, T.golpe, add(mancuerna(T.golpe + 0.001).c, P(0, -10)), 46, 62, -Math.PI / 2 - 0.8, -Math.PI / 2 + 0.8, 5, "#fff3c4", 0.95);
    if (t >= T.golpe && t < T.alza0) {
      const cab = enMundo(QG, G.centroCabeza(QG.p));
      estrellitas(g, t, add(cab, P(48, -6)), dentro(t, T.golpe + 0.12, T.golpe + 0.3, T.mira - 0.2, T.mira));
      gotas(g, t, cab, 0.9 * dentro(t, T.empuja0 + 0.1, T.empuja0 + 0.3, 7.9, 8.1), 1);
      // palmadas en el suelo
      for (const tp of T.palmas) { const h = hombroM(QG, "cerca"); rayas(g, t, tp, P(h.x - 44, SUELO + 34), 22, 32, Math.PI + 0.3, TAU - 0.3, 4, "#ffffff", 0.7); }
      // el empujón: rayitas de esfuerzo junto al disco
      if (t > T.empuja0 && t < T.empuja1) {
        const k = dentro(t, T.empuja0 + 0.1, T.empuja0 + 0.2, T.empuja1 - 0.1, T.empuja1), q = add(m.c, P(PLACA + 30, -8));
        g.save(); g.strokeStyle = TINTA; g.lineCap = "round"; g.lineWidth = 2.6;
        for (let i = 0; i < 3; i++) { g.globalAlpha = k * (0.6 + 0.4 * Math.sin(t * 40 + i * 2)); g.beginPath(); g.moveTo(q.x + i * 7, q.y - 9 + i * 3); g.quadraticCurveTo(q.x + i * 7 + 4, q.y, q.x + i * 7, q.y + 9 - i * 3); g.stroke(); }
        g.restore();
      }
    }
    // el bote en el dedo y el chirrido
    if (t > T.bota1 - 0.05 && t < T.bota1 + 0.3) rayas(g, t, T.bota1, add(m.mano || m.c, P(0, 0)), 30, 40, -Math.PI / 2 - 0.6, -Math.PI / 2 + 0.6, 3, "#ffffff", 0.6);
    for (const [a] of T.aprieta) chirrido(g, t, a + 0.05, add(mancuerna(a + 0.06).mano, P(0, -MP.ph - 6)), 1);
    chirrido(g, t, T.ultimo + 0.05, add(mancuerna(T.ultimo + 0.06).mano, P(0, -18)), 1);
    // se levanta: rayas de giro
    if (t > T.alza0 && t < T.alza1 + 0.2) {
      const k = dentro(t, T.alza0 + 0.06, T.alza0 + 0.16, T.alza1 - 0.14, T.alza1 - 0.02), r = refG();
      const piv = lerpP(r.Hl, r.Hf, suave5(fase(t, T.alza0, T.alza1))), th = -Math.PI / 2 + QG.M.phi;
      g.save(); g.strokeStyle = "#f2f6f8"; g.lineCap = "round";
      for (const [rr, w, a] of [[250, 3, 0.35], [330, 3.5, 0.5], [400, 3, 0.4]]) { g.globalAlpha = a * k; g.lineWidth = w; g.beginPath(); g.arc(piv.x, piv.y, rr, th + 0.08, th + 0.32); g.stroke(); }
      g.restore();
    }
    // se sacude: polvillo
    for (const [i, ts] of T.sacude.entries()) {
      const QQ = poseG(ts), q = i < 2 ? enMundo(QQ, QQ.p.manoCerca) : enMundo(QQ, QQ.p.manoLejos);
      polvillo(g, t, ts, q.x, q.y, i < 2 ? -1 : 1, 5, 0.6);
    }
    // brillo del bíceps
    if (t > T.brillo - 0.05) {
      const q = enMundo(QG, QG.R.tronco(QG.p)(P(4, 312))), k = campana(t, T.brillo, T.brillo + 0.55);
      brillo(g, q.x, q.y, 16 * k, k, t * 3);
    }
  }

  registrar({ id: "00138", nombre: "Guillermo y Yorgi · La mancuerna", crear: () => new LaMancuerna() });
  // diagnóstico: hombro → muñeca / largo del brazo (≤ 1,08 o la mano se despega)
  function diag(t) {
    const out = {};
    for (const [n, Q] of [["y", poseY(t)], ["g", poseG(t)]]) for (const lado of ["cerca", "lejos"]) out[n + "_" + lado] = +alcance(Q, lado).toFixed(3);
    return out;
  }
  window.__A2D_00138 = { pose: t => ({ g: poseG(t).p, y: poseY(t).p }), T, DUR, diag, mancuerna, refG, cuerpoG, cuerpoY,
    mundo: (who, t, q) => { const Q = who === "g" ? poseG(t) : poseY(t); return enMundo(Q, q); } };
})();
