"use strict";
/* 00062 · Guillermo y Deivi · El robot
 *
 * Negro → pista retro con un sol de neón, rejilla en el suelo y ecualizadores que saltan con la
 * música (115 pulsaciones por minuto; todo va a ese ritmo). Deivi «se enciende» y baila el robot a
 * la perfección: posturas angulosas que cambian de golpe en cada pulso (cada cambio es una mezcla
 * rapidísima de 0,07–0,09 s, nunca un salto), tics de cabeza y dos ondas que le recorren los brazos
 * del hombro al codo y a la muñeca → señala a Guillermo: «te toca» → Guillermo saca las manos de los
 * bolsillos y le copia; la primera le sale, pero cada postura le cuesta más: va a tirones y le crujen
 * los codos y el cuello (rayitas y chispas) → al intentar la onda se le atasca en el codo y se queda
 * bloqueado del todo en una postura rarísima, temblando, con las rodillas dobladas y crujiendo →
 * Deivi lo mira, tiene una idea, saca una aceitera del bolsillo y le engrasa los codos y las rodillas
 * (gota, gota) → Guillermo parpadea y se desbloquea con una onda líquida que le baja por todo el
 * cuerpo; sigue bailando suavísimo, sorprendido de sí mismo → Deivi guarda la aceitera y se une → en
 * el último golpe los dos se señalan a la vez, ya como dos robots perfectos → negro.
 *
 * Sin textos: las notas musicales son dibujos. Todo depende del tiempo absoluto. Los brazos se
 * calculan con cinemática directa (ángulo del brazo, doblez del codo y de la muñeca) y la mano se
 * coloca donde cae la muñeca: así la onda es de verdad una onda que viaja por el brazo. Cada brazo
 * dobla el codo siempre hacia el mismo lado (el cercano −1, el lejano +1), sin cambios de rama.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, tramo, campana, mezcla, hash } = M2;
  const G = Guillermo, D = Deivi, R = Recortes;
  const S = 0.30, SUELO = 556;
  const DUR = 15.0;
  const BEAT = 0.52, M0 = 0.85;                     // 115 ppm; el golpe 0 es el primer movimiento de Deivi
  const b = n => M0 + n * BEAT;
  const XG = 318, XD0 = 712, XD_OIL = 556, XD_FIN = 736;
  const T = {
    enciende: 0.5,
    sacaG: b(8), marG: b(9), cajaG: b(10), cabG: b(10.5), senG: b(11), olaG: b(12),
    atasco: 7.36, bloqueo0: 7.42, bloqueo1: 7.86,
    piensa: 7.95, idea: 8.22, bols0: 8.3, bols1: 8.82, anda0: 8.84, anda1: 9.44,
    apunta0: 9.5, levanta: 11.36, atras0: 11.4, atras1: 11.76,
    parpadeo: 11.4, suelta0: 11.52, suelta1: 12.55, guarda0: 11.82, guarda1: 12.22,
    une: b(22), final: b(25), fin: 14.25
  };
  const golpe = t => { if (t < M0 - 0.25) return 0; const c = 0.5 + 0.5 * Math.cos(2 * Math.PI * (t - M0) / BEAT); return c * c; };
  const musica = t => tramo(t, NEGRO_INICIO, 0.6);
  const W_OLA = Math.PI / BEAT;                     // una onda completa cada dos golpes

  const mezclaE = (a, c, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], c[n] ?? a[n], k); return o; };
  // pista de posturas: [t final, postura, duración de la mezcla, curva]
  function pista(lista, dic, base, t) {
    let c = dic[base];
    for (const [t1, nom, d, f] of lista) { const t0 = t1 - d; if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  // a tirones: n pasitos, cada uno con su propia mezcla corta (sin cortes de un fotograma)
  const tirones = n => u => { const x = clamp(u) * n, k = Math.min(n - 1, Math.floor(x)); return (k + suave(clamp((x - k) / 0.62))) / n; };
  const cercaDe = (a, ref) => a + 2 * Math.PI * Math.round((ref - a) / (2 * Math.PI));
  const dirR = a => ({ x: -Math.sin(a), y: Math.cos(a) });          // convenio de Recortes (0 = abajo)

  /* ---------- manos ---------- */
  const DD = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const mezclaD = (a, c, k) => { const o = {}; for (const n of ["pulgar", "indice", "medio", "anular", "menique"]) o[n] = lerp(a[n], c[n], k); return o; };
  const PLANA = DD(0.45, 1), INDICE = DD(0.3, 1, 0, 0, 0), GARRA = DD(1, 0.5, 0.65, 0.4, 0.55), RELAJADA = DD(0.6, 0.85, 0.8, 0.72, 0.66);
  const dedosDe = (ind, gar, rel) => mezclaD(mezclaD(mezclaD(PLANA, INDICE, ind), GARRA, gar), RELAJADA, rel);

  /* ---------- esqueletos (hoja de cada uno) ---------- */
  const R_M = G.MUNECA_R * G.JK;
  function rig(P, l1L, l1C) {
    const pz = P.A.datos.piezas;
    return {
      P,
      lejos: { H: P.HOMBRO, l1: l1L, L: P.BRAZO_L, dobla: 1 },
      cerca: { H: P.HOMBRO_C, l1: l1C, L: P.BRAZO_C_L, dobla: -1 },
      pierna: { cerca: pz.pierna_cerca.largo, lejos: pz.pierna_lejos.largo }
    };
  }
  const RG = rig(G, G.BRAZO_L * 0.5, G.A.datos.piezas.brazo_cerca.codo);
  const RD = rig(D, D.A.datos.piezas.brazo.codo, D.A.datos.piezas.brazo_cerca.codo);

  // Ángulos «de brazo lejano»: u = brazo (0 hacia delante, +π/2 abajo), b = doblez del codo, w = muñeca.
  // El brazo cercano usa los mismos números reflejados (su «fuera» es hacia atrás).
  function brazoFK(P, r, p, lado, u, bb, w) {
    let a1 = u, a2 = u + bb, a3 = u + bb + w;
    if (lado === "cerca") { a1 = Math.PI - a1; a2 = Math.PI - a2; a3 = Math.PI - a3; }
    a1 += p.torso; a2 += p.torso; a3 += p.torso;
    const H = P.tronco(p)(r.H), l2 = r.L - r.l1;
    const E = { x: H.x + r.l1 * Math.cos(a1), y: H.y + r.l1 * Math.sin(a1) };
    const Wm = { x: E.x + l2 * Math.cos(a2), y: E.y + l2 * Math.sin(a2) };
    const M = { x: Wm.x + R_M * Math.cos(a3), y: Wm.y + R_M * Math.sin(a3) };
    return { H, E, W: Wm, M, mu: a3 + Math.PI };
  }
  // codo que de verdad dibuja el muñeco (la misma IK que el recortable)
  function codoIK(P, r, p, m) {
    const H = P.tronco(p)(r.H), o = P.rotP({ x: Math.cos(m.mu) * R_M, y: Math.sin(m.mu) * R_M }, m.ang || 0);
    const c = R.ik(H, { x: m.x + o.x, y: m.y + o.y }, r.L, r.l1, 42, m.dobla, 1.08), d = dirR(c.a1);
    return { x: H.x + d.x * r.l1 * c.estira, y: H.y + d.y * r.l1 * c.estira };
  }
  function rodilla(P, rg, p, lado) {
    const cad = P.tronco(p)(P.CADERA[lado]), L = rg.pierna[lado];
    const c = R.ik(cad, p.piernas[lado].tob, L, L * 0.5, 80, 1, 1.03), d = dirR(c.a1);
    return { x: cad.x + d.x * L * 0.5 * c.estira, y: cad.y + d.y * L * 0.5 * c.estira };
  }
  // mu apuntando al codo (para el puño con la aceitera: el antebrazo entra por el lado del codo)
  function muHaciaCodo(P, r, p, m) {
    let mu = Math.PI;
    for (let i = 0; i < 4; i++) { const E = codoIK(P, r, p, Object.assign({}, m, { mu })); mu = cercaDe(Math.atan2(E.y - m.y, E.x - m.x) - (m.ang || 0), mu); }
    return mu;
  }

  /* ---------- ondas del brazo ---------- */
  // A partir del desplazamiento vertical de hombro, codo, muñeca y yemas sale el giro de cada tramo
  function ondaAng(yS, yE, yW, yT, r) {
    const l2 = r.L - r.l1, du = Math.atan2(yE - yS, r.l1), df = Math.atan2(yW - yE, l2), dh = Math.atan2(yT - yW, 48);
    return { u: du, b: df - du, w: dh - df };
  }
  const bulto = x => (x > 0 && x < 1 ? Math.pow(Math.sin(Math.PI * x), 2) : 0);
  // un bulto que sale del hombro y recorre el brazo (ph de 0 a ~1,9)
  function ondaBulto(ph, A, r) {
    return ondaAng(-A * 0.6 * bulto(ph), -A * bulto(ph - 0.3), -A * bulto(ph - 0.6), -A * 0.8 * bulto(ph - 0.9), r);
  }
  // onda continua (baile líquido): la misma forma con fase que avanza hombro → codo → muñeca
  function ondaSeno(w, A, r) {
    const f = 0.95;
    return ondaAng(A * 0.5 * Math.sin(w), A * Math.sin(w - f), A * Math.sin(w - 2 * f), A * 0.8 * Math.sin(w - 3 * f), r);
  }
  const sumaOnda = (e, o, lado, k = 1) => { const p = lado === "cerca" ? "c" : "l"; e[p + "u"] += o.u * k; e[p + "b"] += o.b * k; e[p + "w"] += o.w * k; };

  /* ---------- posturas (los dos usan las mismas) ---------- */
  const P0 = { cu: 1.4, cb: 0.2, cw: 0.05, lu: 1.4, lb: 0.2, lw: 0.05, torso: 0, pel: 0, pdx: 0, cab: 0, cdx: 0, bc: 0, bl: 0, ind: 0, gar: 0, rel: 0 };
  const Pz = o => Object.assign({}, P0, o);
  const sim = (u, bb, w) => ({ cu: u, cb: bb, cw: w, lu: u, lb: bb, lw: w });
  const POSES = {
    bolsillos: Pz({ bc: 1, bl: 1, rel: 1 }),
    reposo: Pz({}),
    mira: Pz({ torso: 0.03, pel: 6, rel: 0.6 }),
    marioneta: Pz(Object.assign(sim(-0.08, 1.62, 0.1), { pel: 12 })),
    caja: Pz(Object.assign(sim(1.22, 1.88, 0), { pel: 4 })),
    senala: Pz({ cu: 1.22, cb: 1.88, cw: 0, lu: -0.04, lb: 0.16, lw: -0.04, torso: 0.05, pel: 16 }),
    zigzag: Pz({ cu: 0.62, cb: 1.32, cw: 0.12, lu: -0.48, lb: 2.0, lw: 0.12, torso: -0.05, pel: 22 }),
    ola: Pz(Object.assign(sim(-0.26, 0.5, -0.2), { pel: 8 })),
    tuTurno: Pz({ cu: 1.4, cb: 0.25, cw: 0.05, lu: -0.08, lb: 0.22, lw: 0.02, torso: 0.07, pel: 10, ind: 1 }),
    raro: Pz({ cu: 2.59, cb: 0.85, cw: 0.35, lu: -0.16, lb: 1.42, lw: -0.6, torso: -0.12, pel: 95, pdx: -10, gar: 1 }),
    fluido: Pz(Object.assign(sim(0.1, 0.5, -0.1), { pel: 22, rel: 1 })),
    apunta: Pz({ cu: 1.22, cb: 1.88, cw: 0, lu: -0.06, lb: 0.18, lw: -0.02, torso: 0.05, pel: 14, ind: 1 })
  };
  const CABEZAS = {
    c0: { cab: 0, cdx: 0 }, atras: { cab: -0.1, cdx: -22 }, delante: { cab: 0.1, cdx: 22 }, mira: { cab: 0.06, cdx: 12 },
    ladeo: { cab: -0.13, cdx: 0 }, ladeo2: { cab: 0.14, cdx: 6 }, rigida: { cab: 0.2, cdx: 16 }, raro: { cab: 0.27, cdx: 20 }
  };

  /* ---------- caras ---------- */
  const BASE = { mx: 0.9, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15, dientes: 1, lengua: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: 0,
      ojos: { d: Math.max(e.c, parp), i: Math.max(e.c, parp), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: 0, rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const guionCara = (lista, dic, base, t) => { let c = dic[base]; for (const [t0, t1, nom] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], suave(fase(t, t0, t1))); } return Object.assign({}, c); };

  /* =====================================================================================
   * GUILLERMO (a la izquierda, mira a la derecha)
   * ===================================================================================== */
  const PISTA_G = [
    [T.sacaG, "reposo", 0.32], [T.marG, "marioneta", 0.1], [T.cajaG, "caja", 0.17, tirones(2)],
    [T.senG, "senala", 0.26, tirones(3)], [T.olaG, "ola", 0.3, tirones(3)],
    [T.bloqueo1, "raro", T.bloqueo1 - T.bloqueo0, tirones(4)]
  ];
  const CABEZA_G = [
    [T.cabG, "rigida", 0.16, tirones(2)], [T.senG, "mira", 0.2, tirones(2)], [T.olaG, "c0", 0.2], [T.bloqueo1, "raro", T.bloqueo1 - T.bloqueo0, tirones(4)]
  ];
  // crujidos: [t, juntas, fuerza]
  const CRUJIDOS = [
    [T.cajaG - 0.06, ["codoC", "codoL"], 0.55], [T.cabG - 0.06, ["cuello"], 0.7], [T.senG - 0.12, ["codoL"], 0.85], [T.senG - 0.02, ["codoC"], 0.6],
    [T.olaG - 0.14, ["codoL", "codoC"], 0.9], [T.atasco - 0.02, ["codoL", "codoC"], 1],
    [T.bloqueo0 + 0.06, ["rodillaC", "rodillaL"], 1], [T.bloqueo0 + 0.18, ["codoC", "codoL", "cuello"], 1], [T.bloqueo0 + 0.3, ["rodillaL", "codoL"], 1],
    [8.3, ["codoC"], 0.55], [8.75, ["rodillaL"], 0.5], [9.15, ["cuello"], 0.45], [9.7, ["codoC"], 0.45], [10.3, ["rodillaC"], 0.5], [10.8, ["rodillaC"], 0.4]
  ];
  // engrase a chorro: [llega a apuntar, se va, junta, pel, torso]; el chorro sale CHORRO s después de llegar
  const APUNTA = [
    [9.52, 9.98, "codoL", 6, 0.04], [10.1, 10.5, "codoC", 10, 0.06], [10.62, 10.98, "rodillaL", 46, 0.14], [11.08, 11.36, "rodillaC", 52, 0.16]
  ];
  const CHORRO = 0.14, VUELO = 0.22;
  const ENGRASE = {}; for (const [t1, , j] of APUNTA) ENGRASE[j] = t1 + CHORRO + VUELO;      // cuándo le llega el aceite
  const CARAS_G = {
    inicio: E({ c: 0.1, sd: 6, gd: 0.05, si: 6, gi: 0.05, sonr: 0.6, ancho: 1 }),
    asombro: E({ my: -0.05, iris: 1.05, sd: 22, gd: 0.12, si: 22, gi: 0.12, abre: 26, ancho: 0.62, sonr: 0.3, lengua: 0.2 }),
    chulo: E({ mx: -0.85, c: 0.25, sd: 14, gd: 0.15, si: -2, gi: -0.06, sonr: 0.85, ancho: 1.05, abre: 4 }),
    concentra: E({ mx: 0.5, my: 0.35, c: 0.3, sd: -6, gd: -0.1, si: -6, gi: -0.1, abre: 16, ancho: 0.72, sonr: 0.1, lengua: 1 }),
    esfuerzo: E({ mx: 0.4, c: 0.12, sd: 18, gd: 0.18, si: 18, gi: 0.18, abre: 12, ancho: 1.1, sonr: -0.35 }),
    atascado: E({ iris: 0.62, sd: 30, gd: 0.22, si: 30, gi: 0.22, abre: 14, ancho: 1.15, sonr: -0.45 }),
    camara: E({ mx: -0.85, iris: 0.62, sd: 30, gd: 0.22, si: 30, gi: 0.22, abre: 14, ancho: 1.15, sonr: -0.45 }),
    sorpresa: E({ mx: 0.65, my: 0.5, iris: 1.05, sd: 26, gd: 0.14, si: 26, gi: 0.14, abre: 32, ancho: 0.6, sonr: 0.15, lengua: 0.2 }),
    encantado: E({ my: -0.1, c: 0.55, h: 1, sd: 16, gd: 0.12, si: 16, gi: 0.12, abre: 26, ancho: 1.2, sonr: 1, lengua: 0.3 }),
    final: E({ c: 0.15, h: 0.4, sd: 14, gd: 0.14, si: 10, gi: 0.1, abre: 20, ancho: 1.15, sonr: 0.95 })
  };
  const GUION_CARA_G = [
    [b(2), b(2) + 0.3, "asombro"], [b(7) + 0.1, b(7) + 0.35, "chulo"], [T.cajaG - 0.15, T.cajaG + 0.1, "concentra"],
    [T.senG - 0.2, T.senG + 0.05, "esfuerzo"], [T.bloqueo0, T.bloqueo0 + 0.15, "atascado"], [8.6, 8.85, "camara"], [9.2, 9.45, "atascado"],
    [T.suelta0 + 0.15, T.suelta0 + 0.4, "sorpresa"], [12.6, 12.9, "encantado"], [T.final - 0.12, T.final, "final"]
  ];

  // baile líquido (Guillermo desbloqueado y, al final, también Deivi)
  function fluido(t, rg) {
    const e = Object.assign({}, POSES.fluido), w = W_OLA * (t - M0);
    sumaOnda(e, ondaSeno(w, 95, rg.cerca), "cerca");
    sumaOnda(e, ondaSeno(w + Math.PI, 95, rg.lejos), "lejos");
    e.cu += 0.42 * Math.sin(w + 0.5); e.lu += 0.42 * Math.sin(w + Math.PI + 0.5);
    e.pdx = 22 * Math.sin(w); e.torso = 0.05 * Math.sin(w - 0.5);
    e.pel += 14 * (0.5 - 0.5 * Math.cos(2 * w));
    e.cab = 0.07 * Math.sin(w - 1.1); e.cdx = 14 * Math.sin(w - 0.8);
    return e;
  }
  // retraso de cada parte en la onda que lo desbloquea (de arriba abajo y del hombro a la mano)
  const RETRASO = { cab: 0, cdx: 0, torso: 0.07, lu: 0.12, lb: 0.24, lw: 0.36, cu: 0.16, cb: 0.28, cw: 0.4, pel: 0.34, pdx: 0.3, gar: 0.3, rel: 0.4 };

  function estadoG(t) {
    let e;
    if (t < T.suelta0) {
      e = Object.assign(pista(PISTA_G, POSES, "bolsillos", t), pista(CABEZA_G, CABEZAS, "c0", t));
      // intento de onda: arranca bien en el hombro… y se atasca en el codo
      if (t > T.olaG - 0.05) {
        const ph = 0.5 * tirones(3)(fase(t, T.olaG + 0.02, T.atasco)) + 0.04 * Math.sin(t * 40) * tramo(t, T.atasco - 0.1, T.atasco);
        const k = 1 - tirones(4)(fase(t, T.bloqueo0, T.bloqueo1));
        for (const lado of ["cerca", "lejos"]) sumaOnda(e, ondaBulto(ph, 60, RG[lado]), lado, k);
        e.pel -= 8 * bulto(ph) * k;
      }
    } else {
      const A = Object.assign({}, POSES.raro, CABEZAS.raro);
      let B = fluido(t, RG);
      B = mezclaE(B, Object.assign({}, POSES.apunta, CABEZAS.mira), suave(fase(t, T.final - 0.09, T.final)));
      e = {};
      for (const n in A) { const r = RETRASO[n] ?? 0.2; e[n] = lerp(A[n], B[n], suave5(fase(t, T.suelta0 + r, T.suelta0 + r + 0.62))); }
      // la onda líquida: dos bultos grandes que bajan por los brazos
      const ph = fase(t, T.suelta0 + 0.05, T.suelta0 + 1.0) * 1.9;
      const env = 1 - tramo(t, T.suelta1 - 0.2, T.suelta1 + 0.3);
      for (const lado of ["cerca", "lejos"]) sumaOnda(e, ondaBulto(ph, 85, RG[lado]), lado, env);
      e.torso += 0.07 * Math.sin(Math.PI * 2 * fase(t, T.suelta0 + 0.1, T.suelta0 + 0.9)) * env;
      e.pel += 18 * bulto(fase(t, T.suelta0 + 0.3, T.suelta0 + 1.0));
    }
    // golpecitos de cabeza al ritmo mientras mira a Deivi
    e.cab += 0.05 * golpe(t) * (1 - tramo(t, T.sacaG - 0.3, T.sacaG)) * tramo(t, M0 - 0.2, M0 + 0.3);
    // temblor de estar bloqueado
    const tb = tramo(t, T.bloqueo1 - 0.1, T.bloqueo1 + 0.1) * (1 - tramo(t, T.parpadeo, T.suelta0 + 0.1));
    if (tb > 0) {
      const f = k => Math.sin(t * 53 + k * 1.9) * 0.6 + Math.sin(t * 71 + k * 0.7) * 0.4;
      e.lu += 0.014 * f(1) * tb; e.lb += 0.016 * f(2) * tb; e.cu += 0.014 * f(3) * tb; e.cb += 0.016 * f(4) * tb;
      e.torso += 0.005 * f(5) * tb; e.cab += 0.012 * f(6) * tb; e.pel += 2.2 * f(7) * tb;
    }
    return e;
  }

  function poseG(t) {
    const e = estadoG(t), respira = Math.sin(t * 2.3);
    const p = {
      x: XG, suelo: SUELO, s: S, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: G.PELVIS.x + e.pdx, y: G.PELVIS.y + e.pel + respira * 1.2 },
      torso: e.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: e.cab, dx: e.cdx, dy: 0, esc: { x: 1, y: 1 } }
    };
    for (const [lado, x] of [["cerca", XG - 28], ["lejos", XG + 26]])
      p.piernas[lado] = { tob: { x: G.PELVIS.x + (x - XG) / S, y: G.SUELO - G.TOBILLO_ALTO - (lado === "lejos" ? 12 : 0) }, ang: 0 };
    // manos: cinemática directa y, al principio, en los bolsillos
    p.fk = {};
    for (const lado of ["cerca", "lejos"]) {
      const c = lado === "cerca", r = RG[lado];
      const k = brazoFK(G, r, p, lado, c ? e.cu : e.lu, c ? e.cb : e.lb, c ? e.cw : e.lw);
      p.fk[lado] = k;
      let m = { x: k.M.x, y: k.M.y, ang: 0, mu: k.mu, dobla: r.dobla, puno: 1, dedos: dedosDe(c ? 0 : e.ind, e.gar, e.rel) };
      const wb = c ? e.bc : e.bl;
      if (wb > 0.001) {
        const B = G.tronco(p)(c ? BOLS_G.cerca : BOLS_G.lejos), q = mezcla(m, B, wb);
        m = Object.assign(m, { x: q.x, y: q.y, mu: lerp(cercaDe(m.mu, -1.75), -1.75, wb), puno: clamp((1 - wb) / 0.35) });
      }
      p[c ? "manoCerca" : "manoLejos"] = m;
    }
    // cara
    const ex = guionCara(GUION_CARA_G, CARAS_G, "inicio", t);
    const bl = tramo(t, T.bloqueo0, T.bloqueo1) * (1 - tramo(t, T.suelta0, T.suelta0 + 0.5));
    // ojos que van de un lado a otro mientras está bloqueado (a saltitos, pero mezclados)
    if (bl > 0) { const s = Math.floor((t - T.bloqueo1) / 0.42), k = suave(clamp(((t - T.bloqueo1) / 0.42 - s) / 0.25)); ex.mx = lerp(ex.mx, lerp(s % 2 ? 0.9 : -0.6, s % 2 ? -0.6 : 0.9, k), bl * (t > 8.55 && t < 9.25 ? 0 : 1)); }
    p.cara = cara(ex, parpadeo(t, [0.35, 3.2, T.parpadeo, 13.2]));
    p.cara.rubor = 0.2 * musica(t) + 0.35 * bl;
    p.sudor = tramo(t, T.olaG, T.bloqueo1 + 0.3) * (1 - tramo(t, T.suelta1, T.suelta1 + 0.5));
    p.rojo = 0.18 * bl;
    return p;
  }
  const R_MG = R_M;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_MG, y: m.y - Math.sin(mu) * R_MG });
  const BOLS_G = { cerca: punoDesde({ x: 131, y: 652 }, -1.75), lejos: punoDesde({ x: 372, y: 648 }, -1.75) };

  /* =====================================================================================
   * DEIVI (a la derecha, en espejo: mira a la izquierda)
   * ===================================================================================== */
  const PISTA_D = [
    [b(0), "marioneta", 0.08], [b(1), "caja", 0.08], [b(2), "senala", 0.07], [b(3), "zigzag", 0.09],
    [b(4), "ola", 0.09], [b(6), "caja", 0.08], [b(7), "tuTurno", 0.08], [b(8), "mira", 0.25],
    [T.une, "fluido", 0.4]
  ];
  const CABEZA_D = [
    [b(0.5), "atras", 0.07], [b(1.5), "delante", 0.08], [b(2), "mira", 0.07], [b(2.5), "c0", 0.07], [b(3.5), "ladeo", 0.08],
    [b(4), "c0", 0.08], [b(6.5), "ladeo2", 0.08], [b(7), "mira", 0.07], [b(8), "c0", 0.25]
  ];
  // pasos (x de pantalla de cada tobillo)
  const PASOS_D = {
    lejos: [[-10, -9, XD0 - 26], [T.anda0, T.anda0 + 0.22, 634 - 26], [T.anda0 + 0.28, T.anda0 + 0.5, XD_OIL - 26], [T.atras0 + 0.16, T.atras1, XD_FIN - 26]],
    cerca: [[-10, -9, XD0 + 26], [T.anda0 + 0.14, T.anda0 + 0.36, 595 + 26], [T.anda0 + 0.42, T.anda0 + 0.62, XD_OIL + 26], [T.atras0, T.atras0 + 0.24, XD_FIN + 26]]
  };
  function pie(lista, t, alto = 30) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1), arco = Math.sin(Math.PI * u);
    return { x: lerp(xa, x, suave5(u)), alza: alto * arco, ang: -0.15 * arco, u };
  }
  const CARAS_D = {
    dormido: E({ c: 1, sd: 0, si: 0, sonr: 0.1, ancho: 0.9 }),
    robot: E({ mx: -0.85, c: 0.3, sd: -2, gd: -0.04, si: -2, gi: -0.04, ancho: 0.9, sonr: 0.25 }),
    tuTurno: E({ c: 0.2, sd: 16, gd: 0.15, si: -2, gi: -0.05, sonr: 0.8, ancho: 1.05, abre: 6 }),
    aprueba: E({ c: 0.45, h: 0.6, sd: 10, gd: 0.1, si: 10, gi: 0.1, sonr: 0.7, abre: 4 }),
    extrana: E({ my: 0.05, c: 0.1, sd: -4, gd: -0.08, si: 22, gi: 0.12, abre: 6, ancho: 0.7, sonr: 0 }),
    preocupa: E({ sd: 22, gd: 0.2, si: 22, gi: 0.2, abre: 12, ancho: 0.62, sonr: -0.25 }),
    piensa: E({ mx: -0.85, my: -0.6, c: 0.15, sd: -6, gd: -0.1, si: 14, gi: 0.08, abre: 0, ancho: 0.75, sonr: -0.1 }),
    idea: E({ mx: -0.85, my: -0.2, iris: 1.05, sd: 26, gd: 0.15, si: 26, gi: 0.15, abre: 22, ancho: 1.1, sonr: 0.9 }),
    aceita: E({ mx: 0.75, my: 0.35, c: 0.2, sd: 4, gd: 0.05, si: 4, gi: 0.05, abre: 12, ancho: 0.8, sonr: 0.3, lengua: 0.9 }),
    sorpresa: E({ iris: 1.05, sd: 24, gd: 0.12, si: 24, gi: 0.12, abre: 26, ancho: 0.8, sonr: 0.4 }),
    feliz: E({ c: 0.6, h: 1, sd: 14, gd: 0.12, si: 14, gi: 0.12, abre: 22, ancho: 1.2, sonr: 1, lengua: 0.2 }),
    final: E({ c: 0.15, h: 0.3, sd: 16, gd: 0.15, si: 4, gi: 0.02, sonr: 0.95, ancho: 1.1, abre: 10 })
  };
  const GUION_CARA_D = [
    [T.enciende, T.enciende + 0.08, "robot"], [b(6.5), b(6.5) + 0.1, "tuTurno"], [T.marG - 0.05, T.marG + 0.2, "aprueba"],
    [T.senG - 0.1, T.senG + 0.15, "extrana"], [T.atasco, T.atasco + 0.2, "preocupa"], [T.piensa, T.piensa + 0.2, "piensa"],
    [T.idea, T.idea + 0.1, "idea"], [T.apunta0 - 0.15, T.apunta0 + 0.05, "aceita"], [T.levanta, T.levanta + 0.2, "sorpresa"],
    [T.suelta1 - 0.3, T.suelta1, "feliz"], [T.final - 0.1, T.final, "final"]
  ];

  /* ---------- aceitera (en la mano, unidades de jarra; el puño agarra el asa) ---------- */
  const PUNTA_LATA = { x: 84, y: -16 };
  function aceitera(k, bomba) {
    return g => {
      if (k <= 0.02) return;
      g.save(); g.scale(k, k); g.lineJoin = "round"; g.lineCap = "round";
      const tinta = "#0b0a0e";
      // asa (la tapa casi toda el puño)
      g.strokeStyle = tinta; g.lineWidth = 7.5; g.beginPath(); g.moveTo(18, -11); g.quadraticCurveTo(-12, -22, -10, 0); g.quadraticCurveTo(-8, 17, 18, 10); g.stroke();
      g.strokeStyle = "#7d1f19"; g.lineWidth = 3.6; g.stroke();
      // pitorro
      g.strokeStyle = tinta; g.lineWidth = 6.4; g.beginPath(); g.moveTo(42, -6); g.lineTo(PUNTA_LATA.x, PUNTA_LATA.y); g.stroke();
      g.strokeStyle = "#c9ccd4"; g.lineWidth = 3; g.stroke();
      // cuerpo
      const cuerpo = () => { g.beginPath(); g.moveTo(15, 15); g.lineTo(53, 15); g.quadraticCurveTo(56, 15, 55, 9); g.quadraticCurveTo(52, -6, 41, -12); g.lineTo(27, -12); g.quadraticCurveTo(16, -6, 14, 9); g.quadraticCurveTo(13, 15, 15, 15); g.closePath(); };
      cuerpo(); g.fillStyle = "#d8382b"; g.fill();
      g.save(); cuerpo(); g.clip(); g.fillStyle = "#9e231b"; g.fillRect(14, 8, 44, 8); g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.ellipse(24, -1, 3, 8, 0.2, 0, Math.PI * 2); g.fill(); g.restore();
      cuerpo(); g.strokeStyle = tinta; g.lineWidth = 2.6; g.stroke();
      // tapón y bomba
      g.fillStyle = "#c9ccd4"; g.beginPath(); g.ellipse(34, -13, 8, 3.5, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 2; g.stroke();
      const hb = 7 - 4 * bomba;             // la bomba baja al apretar
      g.fillStyle = "#e7c64a"; g.fillRect(30, -13 - hb, 8, hb); g.strokeRect(30, -13 - hb, 8, hb);
      g.restore();
    };
  }

  function estadoD(t) {
    const e = Object.assign(pista(PISTA_D, POSES, "reposo", t), pista(CABEZA_D, CABEZAS, "c0", t));
    // dos ondas por los brazos, hombro → codo → muñeca
    for (let i = 0; i < 2; i++) {
      const t0 = b(4) + 0.04 + i * BEAT, ph = 1.9 * fase(t, t0, t0 + 0.92);
      if (ph > 0 && ph < 1.9) { for (const lado of ["cerca", "lejos"]) sumaOnda(e, ondaBulto(ph, 96, RD[lado]), lado); e.pel -= 12 * bulto(ph); }
    }
    // el robot respira con las rodillas en cada golpe (corto y seco)
    e.pel += 6 * golpe(t) * tramo(t, M0 - 0.2, M0) * (1 - tramo(t, T.piensa, T.piensa + 0.2));
    // asiente cuando a Guillermo le sale la primera
    e.cab += 0.1 * campana(t, T.marG + 0.05, T.marG + 0.45);
    // engrase: se agacha según la junta
    let pel = 0, torso = 0, k = 0;
    for (let i = 0; i < APUNTA.length; i++) {
      const [t1, t2, , pe, to] = APUNTA[i], tp = i ? APUNTA[i - 1][1] : t1 - 0.2, tn = i + 1 < APUNTA.length ? APUNTA[i + 1][0] : t2 + 0.25;
      const w = suave(fase(t, tp, t1)) * (1 - suave(fase(t, t2, tn))); pel += pe * w; torso += to * w; k = Math.max(k, w);
    }
    const eng = tramo(t, T.apunta0 - 0.3, T.apunta0 - 0.05) * (1 - tramo(t, T.levanta, T.levanta + 0.3));
    e.pel = lerp(e.pel, Math.max(pel, 4), eng); e.torso = lerp(e.torso, Math.max(torso, 0.03), eng);
    e.cab = lerp(e.cab, 0.1 + 0.12 * clamp(torso / 0.16), eng);
    // mano lejana al bolsillo mientras usa la aceitera (con la cercana)
    const bl = tramo(t, T.idea, T.idea + 0.3) * (1 - tramo(t, T.guarda1 - 0.1, T.une - 0.05));
    e.bl = Math.max(e.bl, bl);
    if (t > T.une - 0.45) { const f = fluido(t, RD), w = suave(fase(t, T.une - 0.4, T.une)); for (const n in f) e[n] = lerp(e[n], f[n], w); e.bl = lerp(bl, 0, w); }
    const fin = suave(fase(t, T.final - 0.08, T.final));
    if (fin > 0) { const a = Object.assign({}, POSES.apunta, CABEZAS.mira); for (const n in a) e[n] = lerp(e[n], a[n], fin); }
    return e;
  }

  // apuntar a una junta: brazo casi estirado hacia ella y el pitorro en la misma dirección
  function apuntaA(p, q) {
    // el pitorro se queda a unos 45 px de la junta (el aceite sale a chorrito)
    const H = D.tronco(p)(D.HOMBRO_C), dl = Math.atan2(q.y - H.y, q.x - H.x);
    const r = clamp(Math.hypot(q.x - H.x, q.y - H.y) - Math.hypot(PUNTA_LATA.x, PUNTA_LATA.y) * D.JK - 150, 0.5 * RD.cerca.L, 0.9 * RD.cerca.L);
    return { x: H.x + Math.cos(dl) * r, y: H.y + Math.sin(dl) * r, ang: dl + 0.19, dl };
  }
  function manoEngrase(t, p, J) {
    let A = null;
    for (let i = 0; i < APUNTA.length; i++) {
      const [t1, , j] = APUNTA[i], q = apuntaA(p, D.aHoja(p, J[j]));
      // bombeo: empuja un poco y la lata da un respingo
      const ts = t1 + CHORRO, bo = campana(t, ts - 0.07, ts + 0.12);
      q.x += Math.cos(q.dl) * 14 * bo; q.y += Math.sin(q.dl) * 14 * bo; q.ang -= 0.08 * bo; q.bomba = bo;
      if (!A) { A = q; continue; }
      const w = suave(fase(t, APUNTA[i - 1][1], t1));
      A = { x: lerp(A.x, q.x, w), y: lerp(A.y, q.y, w), ang: lerp(A.ang, cercaDe(q.ang, A.ang), w), bomba: Math.max(A.bomba * (1 - w), q.bomba * w) };
    }
    return A;
  }

  function poseD(t, pG) {
    const e = estadoD(t), respira = Math.sin(t * 2.1 + 1);
    const fc = pie(PASOS_D.cerca, t), fl = pie(PASOS_D.lejos, t), X = (fc.x + fl.x) / 2;
    const bob = -10 * (Math.max(Math.sin(Math.PI * clamp(fc.u)), Math.sin(Math.PI * clamp(fl.u))) || 0);
    const p = {
      x: X, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: D.PELVIS.x + e.pdx, y: D.PELVIS.y + e.pel + respira * 1.2 + bob },
      torso: e.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: e.cab, dx: e.cdx, dy: 0, esc: { x: 1, y: 1 } }
    };
    for (const [lado, f] of [["cerca", fc], ["lejos", fl]]) {
      const hx = D.aHoja(p, { x: f.x, y: 0 }).x;
      p.piernas[lado] = { tob: { x: hx, y: D.SUELO - D.TOBILLO_ALTO - (lado === "lejos" ? 8 : 0) - f.alza / (S * D.K) }, ang: f.ang };
    }
    for (const lado of ["cerca", "lejos"]) {
      const c = lado === "cerca", r = RD[lado];
      const k = brazoFK(D, r, p, lado, c ? e.cu : e.lu, c ? e.cb : e.lb, c ? e.cw : e.lw);
      p[c ? "manoCerca" : "manoLejos"] = { x: k.M.x, y: k.M.y, ang: 0, mu: k.mu, dobla: r.dobla, puno: 1, dedos: dedosDe(c ? 0 : e.ind, e.gar, e.rel) };
    }
    // ---- la aceitera (mano lejana): bolsillo → enseñarla → engrasar → guardarla ----
    const enBols = Math.max(tramo(t, T.bols0, T.bols0 + 0.2) * (1 - tramo(t, T.bols0 + 0.27, T.bols1 - 0.04)),
                            tramo(t, T.guarda0, T.guarda0 + 0.2) * (1 - tramo(t, T.guarda0 + 0.27, T.guarda1)));
    const conLata = t > T.bols0 + 0.23 && t < T.guarda0 + 0.23;
    // (la aceitera va en la mano cercana: codo siempre hacia abajo, sin cambiar de rama)
    let mL = p.manoCerca;
    if (conLata) {
      // enseñarla: delante del pecho, con el pitorro hacia arriba
      const Tr = D.tronco(p), h = Tr(D.HOMBRO_C);
      let M = { x: h.x + 230, y: h.y + 170 }, ang = -0.25;
      const levanta = campana(t, T.bols1 - 0.05, T.bols1 + 0.45);
      M.y -= 60 * levanta; ang -= 0.25 * levanta;
      // engrasar
      const eng = tramo(t, T.apunta0 - 0.3, T.apunta0) * (1 - tramo(t, T.levanta - 0.02, T.levanta + 0.28));
      let bomba = 0;
      if (eng > 0 && pG) {
        const A = manoEngrase(t, p, juntasG(pG));
        M = mezcla(M, A, eng); ang = lerp(ang, cercaDe(A.ang, ang), eng); bomba = A.bomba * eng;
      }
      // al acabar la levanta, orgulloso
      const orgullo = campana(t, T.levanta + 0.05, T.guarda0 + 0.05);
      M.y -= 50 * orgullo; ang -= 0.3 * orgullo;
      mL = { x: M.x, y: M.y, ang, mu: Math.PI, dobla: -1, puno: 1, bomba };
      mL.mu = muHaciaCodo(D, RD.cerca, p, mL);
    }
    if (enBols > 0.001) {
      const B = D.tronco(p)(D.BOLSILLO_C), q = mezcla(mL, B, enBols);
      mL = Object.assign({}, mL, { x: q.x, y: q.y, ang: lerp(mL.ang || 0, 0, enBols), mu: lerp(cercaDe(mL.mu, -1.75), -1.75, enBols), puno: clamp((1 - enBols) / 0.35) });
    }
    if (conLata) mL.objeto = aceitera(mL.puno, mL.bomba || 0);
    p.manoCerca = mL;
    // mano lejana al bolsillo
    if (e.bl > 0.001) {
      const m = p.manoLejos, B = D.tronco(p)(D.BOLSILLO_L), q = mezcla(m, B, e.bl);
      p.manoLejos = Object.assign({}, m, { x: q.x, y: q.y, mu: lerp(cercaDe(m.mu, -1.75), -1.75, e.bl), puno: clamp((1 - e.bl) / 0.35) });
    }
    const ex = guionCara(GUION_CARA_D, CARAS_D, "dormido", t);
    p.cara = cara(ex, parpadeo(t, [2.15, 6.35, 9.3, 12.75]));
    p.cara.rubor = 0.15 * musica(t);
    return p;
  }

  // juntas de Guillermo en pantalla
  function juntasG(p) {
    const J = {};
    J.codoC = G.aPantalla(p, codoIK(G, RG.cerca, p, p.manoCerca));
    J.codoL = G.aPantalla(p, codoIK(G, RG.lejos, p, p.manoLejos));
    J.rodillaC = G.aPantalla(p, rodilla(G, RG, p, "cerca"));
    J.rodillaL = G.aPantalla(p, rodilla(G, RG, p, "lejos"));
    J.cuello = G.aPantalla(p, G.tronco(p)(G.CUELLO));
    return J;
  }
  const puntaLata = (p, m) => { const o = D.rotP({ x: PUNTA_LATA.x * D.JK, y: PUNTA_LATA.y * D.JK }, m.ang || 0); return D.aPantalla(p, { x: m.x + o.x, y: m.y + o.y }); };

  function pose(t) { const g = poseG(t); return { g, d: poseD(t, g) }; }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  function estrella(g, x, y, r, col) {
    g.fillStyle = col; g.beginPath(); g.moveTo(x, y - r); g.quadraticCurveTo(x, y, x + r * 0.7, y); g.quadraticCurveTo(x, y, x, y + r);
    g.quadraticCurveTo(x, y, x - r * 0.7, y); g.quadraticCurveTo(x, y, x, y - r); g.fill();
  }
  // crujido: arcos «)))» que salen de la junta, una rayita en zigzag y chispas
  function crujido(g, J, centro, u, f, semilla, angFijo) {
    const al = Math.sin(Math.PI * clamp(u)) * f; if (al <= 0.02) return;
    const ang = angFijo ?? Math.atan2(J.y - centro.y, J.x - centro.x) + 0.5 * (hash(semilla) - 0.5);
    g.save(); g.translate(J.x, J.y); g.rotate(ang); g.lineCap = "round"; g.lineJoin = "round";
    for (let i = 0; i < 3; i++) {
      const r = 11 + i * 7 + 10 * u, a = 0.46 - i * 0.05;
      g.globalAlpha = al; g.strokeStyle = "#140a18"; g.lineWidth = 5.4; g.beginPath(); g.arc(0, 0, r, -a, a); g.stroke();
      g.strokeStyle = "#fffbe0"; g.lineWidth = 2.6; g.beginPath(); g.arc(0, 0, r, -a, a); g.stroke();
    }
    // rayita en zigzag (chirrido)
    g.globalAlpha = al; g.strokeStyle = "#140a18"; g.lineWidth = 5;
    const zz = () => { g.beginPath(); g.moveTo(14, -22); for (let k = 1; k <= 4; k++) g.lineTo(14 + k * 6 + 7 * u, -22 - (k % 2 ? 6 : -1) - k * 2.4); };
    zz(); g.stroke(); g.strokeStyle = "#ffd23a"; g.lineWidth = 2.6; zz(); g.stroke();
    // chispas
    for (let j = 0; j < 3; j++) {
      const a = -0.9 + j * 0.8 + 0.3 * hash(semilla + j), d = 12 + 26 * u * (0.7 + 0.5 * hash(semilla + j + 9));
      g.globalAlpha = al; estrella(g, Math.cos(a) * d, Math.sin(a) * d + 8 * u * u, 3 + 5 * (1 - u), j === 1 ? "#ffffff" : "#ffd23a");
    }
    g.restore();
  }
  function crujidos(g, t, pG, J) {
    const centro = G.aPantalla(pG, G.tronco(pG)({ x: 250, y: 560 }));
    CRUJIDOS.forEach(([t0, js, f], i) => {
      const u = (t - t0) / 0.42; if (u <= 0 || u >= 1) return;
      for (const j of js) {
        if (ENGRASE[j] !== undefined && t0 > ENGRASE[j]) continue;
        // el cuello cruje por detrás (hacia la nuca), no encima de la cara
        if (j === "cuello") crujido(g, { x: J.cuello.x - 30, y: J.cuello.y + 16 }, centro, u, f, i * 7, -2.85);
        else crujido(g, J[j], centro, u, f, i * 7 + j.length);
      }
    });
  }

  /* ---------- aceite: chorrito, mancha brillante y goteo ---------- */
  const AMBAR = "#e0a21e", AMBAR_T = "#3a2204";
  function gota(g, x, y, r, estira, ang = 0) {
    g.save(); g.translate(x, y); g.rotate(ang);
    g.beginPath(); g.moveTo(0, -r * (1.4 + estira)); g.quadraticCurveTo(r * 1.05, -r * 0.2, r, r * 0.2);
    g.arc(0, r * 0.2, r, 0, Math.PI); g.quadraticCurveTo(-r * 1.05, -r * 0.2, 0, -r * (1.4 + estira)); g.closePath();
    g.fillStyle = AMBAR; g.fill(); g.lineWidth = 1.6; g.strokeStyle = AMBAR_T; g.stroke();
    g.fillStyle = "rgba(255,255,230,0.85)"; g.beginPath(); g.ellipse(-r * 0.35, 0, r * 0.22, r * 0.38, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // chorrito: cuatro gotas que salen del pitorro en arco y llegan a la junta (salpican un poco)
  function chorros(g, t, punta, J) {
    for (const [t1, , j] of APUNTA) {
      const ts = t1 + CHORRO, q = J[j];
      for (let i = 0; i < 4; i++) {
        const t0 = ts + i * 0.03, u = (t - t0) / VUELO;
        if (u > 0 && u < 1 && punta) {
          const h = 0.2 * Math.hypot(q.x - punta.x, q.y - punta.y);
          const x = lerp(punta.x, q.x, u), y = lerp(punta.y, q.y - 4, u) - h * 4 * u * (1 - u);
          const vx = q.x - punta.x, vy = q.y - 4 - punta.y - h * 4 * (1 - 2 * u);
          gota(g, x, y, 3.3 - 0.35 * i, 0.9, Math.atan2(vy, vx) - Math.PI / 2);
        }
        const v = (t - t0 - VUELO) / 0.22;
        if (v > 0 && v < 1 && i % 2 === 0) {
          g.save(); g.globalAlpha = 1 - v; g.fillStyle = AMBAR;
          for (const s of [-1, 1]) { g.beginPath(); g.arc(q.x + s * (4 + 11 * v), q.y - 6 - 12 * Math.sin(Math.PI * v), 2, 0, Math.PI * 2); g.fill(); }
          g.restore();
        }
      }
    }
  }
  // manchas brillantes en las juntas engrasadas
  function manchas(g, t, J) {
    Object.entries(ENGRASE).forEach(([j, tc], n) => {
      const k = tramo(t, tc, tc + 0.12) * (1 - tramo(t, T.suelta1 + 0.5, T.final - 0.3)); if (k <= 0.01) return;
      const q = J[j], baja = 7 * suave(fase(t, tc + 0.1, tc + 1.2));
      g.save(); g.globalAlpha = k; g.fillStyle = AMBAR; g.strokeStyle = AMBAR_T; g.lineWidth = 1.4;
      g.beginPath(); g.ellipse(q.x, q.y - 2, 6.5, 3.6, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(q.x + 2, q.y); g.lineTo(q.x + 2, q.y + baja); g.lineWidth = 3; g.strokeStyle = AMBAR; g.stroke();
      g.fillStyle = "rgba(255,255,240,0.9)"; g.beginPath(); g.ellipse(q.x - 2, q.y - 3, 2, 1.1, -0.3, 0, Math.PI * 2); g.fill();
      // destello al desbloquearse
      const t0 = T.suelta0 + 0.1 + 0.12 * n, br = campana(t, t0, t0 + 0.4);
      if (br > 0) { g.globalAlpha = br; estrella(g, q.x + 6, q.y - 8, 10 * br, "#fffbe0"); }
      g.restore();
    });
  }
  // goteo: de cada junta engrasada caen dos gotas al suelo (gota, gota) y dejan un charquito
  const GOTEOS = [];
  Object.entries(ENGRASE).forEach(([j, tc]) => { GOTEOS.push({ j, t: tc + 0.32 }); GOTEOS.push({ j, t: tc + 0.78 }); });
  const juntasEn = new Map();
  const juntasA = tt => { if (!juntasEn.has(tt)) juntasEn.set(tt, juntasG(poseG(tt))); return juntasEn.get(tt); };
  function goteo(g, t, J, suelo) {
    for (const d of GOTEOS) {
      const tf = d.t - 0.22; if (t < tf) continue;
      if (t < d.t) { if (suelo) continue; const q = J[d.j], k = fase(t, tf, d.t); gota(g, q.x + 2, q.y + 6 + 3 * k, 1.2 + 2.2 * k, 0.4 * k); continue; }
      const q = juntasA(d.t), x = q[d.j].x + 2, y0 = q[d.j].y + 9, tau = t - d.t, y = y0 + 900 * tau * tau;
      if (y < SUELO - 2) { if (!suelo) gota(g, x, y, 3.3, 0.5 + Math.min(1, tau * 4)); continue; }
      if (!suelo) continue;
      // charquito en el suelo
      const tl = Math.sqrt((SUELO - 2 - y0) / 900), v = clamp((tau - tl) / 0.18);
      g.save(); g.globalAlpha = 0.95; g.fillStyle = AMBAR; g.strokeStyle = AMBAR_T; g.lineWidth = 1.2;
      g.beginPath(); g.ellipse(x, SUELO, 3 + 6 * suave(v), 1.2 + 1.8 * suave(v), 0, 0, Math.PI * 2); g.fill(); g.stroke();
      if (v < 1) { g.globalAlpha = 1 - v; for (const s of [-1, 1]) { g.beginPath(); g.arc(x + s * (3 + 9 * v), SUELO - 3 - 8 * Math.sin(Math.PI * v), 1.6, 0, Math.PI * 2); g.fill(); } }
      g.restore();
    }
  }

  /* =====================================================================================
   * DECORADO: pista retro con sol de neón, rejilla y ecualizadores
   * ===================================================================================== */
  const HOR = 330, VPX = 512;
  const LINEAS_Z = [1.0, 1.32, 1.75, 2.35, 3.15, 4.3, 6.0, 8.6];
  const yZ = z => HOR + 252 / z;
  const PALETA = [[255, 61, 168], [46, 230, 255], [255, 214, 64], [170, 92, 255]];
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  let fondo = null, cono = null, charco = null, vineta = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    const pa = g.createLinearGradient(0, 0, 0, HOR); pa.addColorStop(0, "#06041a"); pa.addColorStop(0.65, "#1d0a3c"); pa.addColorStop(1, "#3a0f52");
    g.fillStyle = pa; g.fillRect(0, 0, W, HOR);
    // estrellas
    for (let i = 0; i < 70; i++) { const x = hash(i * 3 + 1) * W, y = hash(i * 3 + 2) * (HOR - 90); g.fillStyle = `rgba(255,255,255,${0.25 + 0.5 * hash(i * 3 + 3)})`; g.fillRect(x, y, 1.6, 1.6); }
    // sol de neón con franjas
    const sx = VPX, sy = 238, sr = 116;
    const halo = g.createRadialGradient(sx, sy, sr * 0.7, sx, sy, sr * 1.7); halo.addColorStop(0, "rgba(255,80,160,0.35)"); halo.addColorStop(1, "rgba(255,80,160,0)");
    g.fillStyle = halo; g.fillRect(sx - sr * 1.8, sy - sr * 1.8, sr * 3.6, sr * 3.6);
    g.save(); g.beginPath(); g.arc(sx, sy, sr, 0, Math.PI * 2); g.clip();
    const sg = g.createLinearGradient(0, sy - sr, 0, sy + sr); sg.addColorStop(0, "#fff06a"); sg.addColorStop(0.5, "#ff7a6e"); sg.addColorStop(1, "#d92f9c");
    g.fillStyle = sg; g.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
    g.fillStyle = pa; for (let k = 0; k < 6; k++) { const y = sy + 4 + k * 17, h = 2.5 + k * 1.8; g.fillRect(sx - sr, y, sr * 2, h); }
    g.restore();
    // montañas
    for (const [col, alt, sem] of [["#2a0b47", 60, 11], ["#170630", 38, 23]]) {
      g.fillStyle = col; g.beginPath(); g.moveTo(0, HOR);
      for (let x = 0; x <= W; x += 32) g.lineTo(x, HOR - alt * (0.35 + 0.65 * Math.abs(Math.sin(x * 0.011 + sem) * Math.sin(x * 0.027 + sem * 0.3))));
      g.lineTo(W, HOR); g.closePath(); g.fill();
      g.strokeStyle = "rgba(255,90,200,0.35)"; g.lineWidth = 1.5; g.stroke();
    }
    // suelo
    const su = g.createLinearGradient(0, HOR, 0, H); su.addColorStop(0, "#2b0846"); su.addColorStop(0.35, "#13052a"); su.addColorStop(1, "#05020c");
    g.fillStyle = su; g.fillRect(0, HOR, W, H - HOR);
    // rejilla (apagada)
    g.strokeStyle = "rgba(255,70,190,0.42)"; g.lineWidth = 1.6;
    for (let k = -9; k <= 9; k++) { g.beginPath(); g.moveTo(VPX + k * 14, HOR + 2); g.lineTo(VPX + k * 150, H); g.stroke(); }
    for (const z of LINEAS_Z) { g.beginPath(); g.moveTo(0, yZ(z)); g.lineTo(W, yZ(z)); g.stroke(); }
    // línea del horizonte
    const hz = g.createLinearGradient(0, HOR - 6, 0, HOR + 8); hz.addColorStop(0, "rgba(255,120,220,0)"); hz.addColorStop(0.5, "rgba(255,150,230,0.9)"); hz.addColorStop(1, "rgba(255,120,220,0)");
    g.fillStyle = hz; g.fillRect(0, HOR - 6, W, 14);
    // paneles de los ecualizadores
    for (const x0 of [26, W - 26 - 132]) {
      g.fillStyle = "#0a0716"; g.strokeStyle = "#3d2a66"; g.lineWidth = 3;
      g.beginPath(); g.roundRect ? g.roundRect(x0 - 8, 96, 148, 214, 10) : g.rect(x0 - 8, 96, 148, 214); g.fill(); g.stroke();
      g.fillStyle = "#14102a"; for (let i = 0; i < 7; i++) for (let s = 0; s < 18; s++) g.fillRect(x0 + i * 19, 290 - s * 10.5, 15, 8);
    }
    return c;
  }
  function creaCono() {
    const c = document.createElement("canvas"); c.width = 300; c.height = 600; const g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, 600); gr.addColorStop(0, "rgba(255,255,255,0.55)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(140, 0); g.lineTo(160, 0); g.lineTo(300, 600); g.lineTo(0, 600); g.closePath(); g.fill();
    return c;
  }
  function creaCharco() {
    const c = document.createElement("canvas"); c.width = 260; c.height = 70; const g = c.getContext("2d");
    const gr = g.createRadialGradient(130, 35, 4, 130, 35, 130); gr.addColorStop(0, "rgba(255,255,255,0.6)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.save(); g.scale(1, 70 / 260); g.fillStyle = gr; g.beginPath(); g.arc(130, 130, 130, 0, Math.PI * 2); g.fill(); g.restore();
    return c;
  }
  function creaVineta() {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    const v = g.createRadialGradient(512, 300, 280, 512, 300, 680); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.55)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    return c;
  }
  // pulso de luz que viaja por la rejilla desde el horizonte hacia nosotros en cada golpe
  function rejilla(g, t) {
    const mu = musica(t); if (mu <= 0.01) return;
    const f = (t - M0) / BEAT, fr = f - Math.floor(f);
    g.save(); g.globalCompositeOperation = "lighter"; g.lineWidth = 2.4;
    LINEAS_Z.forEach((z, i) => {
      const pos = 1 - i / (LINEAS_Z.length - 1), d = Math.abs(fr - pos), k = Math.max(0, 1 - d / 0.22);
      const al = mu * (0.12 + 0.55 * k * k) * (t < M0 - 0.2 ? 0.4 : 1);
      g.strokeStyle = rgba([255, 90, 210], al); g.beginPath(); g.moveTo(0, yZ(z)); g.lineTo(W, yZ(z)); g.stroke();
    });
    g.restore();
  }
  function ecualizadores(g, t) {
    const mu = musica(t), gp = golpe(t);
    for (const [p, x0] of [[0, 26], [1, W - 26 - 132]]) for (let i = 0; i < 7; i++) {
      const v = 0.18 + 0.42 * (0.5 + 0.5 * Math.sin(t * (3.1 + i * 0.7) + i * 1.7 + p * 2)) * (0.5 + 0.5 * Math.sin(t * 1.3 + i)) + 0.4 * gp * (1 - Math.abs(i - 3) / 5);
      const n = Math.round(18 * clamp(v * mu));
      for (let s = 0; s < n; s++) {
        const col = s < 9 ? [46, 230, 255] : s < 14 ? [255, 214, 64] : [255, 61, 168];
        g.fillStyle = rgba(col, 0.9); g.fillRect(x0 + i * 19, 290 - s * 10.5, 15, 8);
      }
    }
  }
  function conos(g, t) {
    const mu = musica(t); if (mu <= 0.01) return;
    const f = (t - M0) / BEAT;
    g.save(); g.globalCompositeOperation = "lighter";
    [[XG, 0, PALETA[1]], [710, 1, PALETA[0]]].forEach(([x, i]) => {
      const al = mu * (0.1 + 0.12 * Math.pow(0.5 + 0.5 * Math.cos(Math.PI * (f - i)), 4));
      g.globalAlpha = al; g.drawImage(cono, x - 150, -30, 300, 600);
    });
    g.restore();
  }
  function charcos(g, t, xs) {
    const mu = musica(t);
    g.save(); g.globalCompositeOperation = "lighter";
    xs.forEach((x, i) => { g.globalAlpha = 0.12 + 0.18 * mu * (0.6 + 0.4 * golpe(t + i * BEAT)); g.drawImage(charco, x - 130, SUELO - 32, 260, 64); });
    g.restore();
  }
  // notas musicales dibujadas (no son texto)
  function nota(g, x, y, s, ang, doble, col) {
    g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s); g.lineJoin = "round"; g.lineCap = "round";
    const forma = () => { g.beginPath(); g.ellipse(0, 0, 9, 6.5, -0.45, 0, Math.PI * 2); if (doble) g.ellipse(24, -6, 9, 6.5, -0.45, 0, Math.PI * 2); };
    const palo = () => { g.beginPath(); g.moveTo(7.5, -2); g.lineTo(7.5, -34); if (doble) { g.lineTo(31.5, -40); g.lineTo(31.5, -8); } else g.quadraticCurveTo(20, -24, 16, -12); };
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 7; palo(); g.stroke(); forma(); g.fillStyle = "#0b0a0e"; g.fill(); g.lineWidth = 6; g.stroke();
    g.strokeStyle = col; g.lineWidth = 3.2; palo(); g.stroke(); forma(); g.fillStyle = col; g.fill();
    g.restore();
  }
  function notas(g, t) {
    if (t < M0) return;
    const n1 = Math.floor((t - M0) / BEAT);
    for (let n = Math.max(0, n1 - 4); n <= n1; n++) {
      if (n % 2) continue;
      const t0 = M0 + n * BEAT, u = (t - t0) / 1.9; if (u < 0 || u > 1) continue;
      const lado = (n / 2) % 2, x = (lado ? W - 92 : 92) + (lado ? -1 : 1) * 40 * u + 8 * Math.sin(u * 7 + n), y = 92 - 70 * u;
      g.save(); g.globalAlpha = Math.min(1, u / 0.12) * (1 - suave((u - 0.6) / 0.4));
      nota(g, x, y, 0.75 + 0.25 * salida(Math.min(1, u * 4)), 0.25 * Math.sin(u * 6 + n), n % 3 === 1, rgba(PALETA[n % PALETA.length], 1));
      g.restore();
    }
  }
  // ojos de Deivi al «encenderse»: un brillo fugaz
  function encendido(g, t, pD) {
    const k = campana(t, T.enciende - 0.02, T.enciende + 0.3); if (k <= 0) return;
    const c = D.aPantalla(pD, D.cabeza(pD).a({ x: 860, y: 490 }));
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = k; estrella(g, c.x, c.y, 16 * k, "#bff6ff"); g.restore();
  }

  // bombilla de «¡tengo una idea!» sobre la cabeza de Deivi (dibujo, no texto)
  function bombilla(g, t, pD) {
    const u = fase(t, T.idea - 0.02, T.idea + 0.62); if (u <= 0 || u >= 1) return;
    const k = M2.rebote(clamp(u / 0.22), 2.2) * (1 - suave(clamp((u - 0.75) / 0.25)));
    const c = D.aPantalla(pD, D.cabeza(pD).a({ x: 820, y: 40 }));
    g.save(); g.translate(c.x - 6, c.y - 34); g.scale(1.3 * k, 1.3 * k); g.lineJoin = "round"; g.lineCap = "round";
    g.globalCompositeOperation = "lighter"; g.fillStyle = "rgba(255,240,140,0.35)"; g.beginPath(); g.arc(0, -4, 26, 0, Math.PI * 2); g.fill();
    g.globalCompositeOperation = "source-over";
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3;
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.55, r0 = 22, r1 = 30 + 3 * Math.sin(u * 30 + i); g.beginPath(); g.moveTo(Math.cos(a) * r0, -4 + Math.sin(a) * r0); g.lineTo(Math.cos(a) * r1, -4 + Math.sin(a) * r1); g.stroke(); }
    g.fillStyle = "#fff27a"; g.beginPath(); g.arc(0, -6, 13, Math.PI * 0.8, Math.PI * 2.2); g.lineTo(5, 10); g.lineTo(-5, 10); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#b9bcc6"; g.fillRect(-5.5, 10, 11, 8); g.strokeRect(-5.5, 10, 11, 8);
    g.lineWidth = 1.5; g.beginPath(); g.moveTo(-5.5, 13); g.lineTo(5.5, 14); g.moveTo(-5.5, 16); g.lineTo(5.5, 17); g.stroke();
    g.strokeStyle = "#e0a21e"; g.lineWidth = 1.8; g.beginPath(); g.moveTo(-3, 9); g.lineTo(-3, -2); g.lineTo(0, -6); g.lineTo(3, -2); g.lineTo(3, 9); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.85)"; g.beginPath(); g.ellipse(-6, -11, 2.5, 4.5, 0.5, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  function sombra(g, x, ancho) { g.fillStyle = "rgba(0,0,0,0.45)"; g.beginPath(); g.ellipse(x, SUELO + 3, ancho, 9, 0, 0, Math.PI * 2); g.fill(); }

  class GuillermoDeiviRobot extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !D.listo()) return;
      if (!fondo) { fondo = creaFondo(); cono = creaCono(); charco = creaCharco(); vineta = creaVineta(); }
      const pG = poseG(t), pD = poseD(t, pG);
      const luz = tramo(t, NEGRO_INICIO, 0.9, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      g.save();
      g.drawImage(fondo, 0, 0);
      rejilla(g, t);
      ecualizadores(g, t);
      notas(g, t);
      charcos(g, t, [XG, pD.x]);
      sombra(g, XG + 2, 82); sombra(g, pD.x, 80);
      const J = juntasG(pG);
      goteo(g, t, J, true);
      G.dibujar(g, pG, t);
      D.dibujar(g, pD, t);
      const pl = pD.manoCerca.objeto ? puntaLata(pD, pD.manoCerca) : null;
      manchas(g, t, J);
      goteo(g, t, J, false);
      chorros(g, t, pl, J);
      bombilla(g, t, pD);
      crujidos(g, t, pG, J);
      encendido(g, t, pD);
      conos(g, t);
      g.drawImage(vineta, 0, 0);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00062", nombre: "Guillermo y Deivi · El robot", crear: () => new GuillermoDeiviRobot() });
  window.__A2D_00062 = { pose, T, DUR };
})();
