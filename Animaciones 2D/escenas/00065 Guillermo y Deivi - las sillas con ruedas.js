"use strict";
/* 00065 · Guillermo y Deivi · Las sillas con ruedas
 *
 * Negro → trastienda del bar, vacía: pared mostaza con azulejos verdes, suelo de cemento pulido,
 * dos tubos fluorescentes, una cinta a cuadros pegada en el suelo (la meta) y, a la izquierda,
 * una pila de cajas de cartón altísima. Guillermo y Deivi, sentados cada uno en una silla de
 * oficina con ruedas, se miran: Guillermo pica con las cejas; Deivi, con un vaso de refresco con
 * pajita, brinda y da un sorbo → los dos se inclinan y ¡salen! → Deivi se impulsa con los talones
 * sin prisa y se desliza recto hasta la meta, sin derramar ni una gota → Guillermo patalea como
 * loco, la silla se le pone a girar y da vueltas como una peonza por media sala → Deivi frena con
 * un giro elegante de la silla y se queda mirando, sorbiendo → Guillermo, mareado (ojos en
 * espiral, estrellitas), sacude la cabeza, se agarra al asiento, recoge los pies y empuja con
 * todas sus fuerzas… y sale disparado hacia atrás → se estampa de espaldas contra la pila: las
 * cajas se le caen encima una tras otra → solo le asoman las piernas, que patalean de vez en
 * cuando, y una rueda de la silla que sigue girando en el aire → Deivi pasa rodando despacito a
 * su lado, sorbiendo hasta el fondo, y guiña un ojo a cámara → negro.
 *
 * Sin textos. Las sillas son atrezo de la escena: la pelvis de cada uno va pegada al asiento en
 * cada fotograma y el asiento sale de la posición de la silla. Los pies se impulsan contra el suelo
 * (mientras apoyan, el pie se queda quieto en el suelo y la silla avanza). Los giros de silla son
 * un aplastado horizontal del asiento con su ocupante (la base de cinco patas no gira). Las cajas
 * caen con trayectorias y vueltas fijas. Todo depende solo de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, mezcla, ruido, hash, campana } = M2;
  const G = Guillermo, DV = Deivi;
  const DUR = 14.4;
  const T = {
    mira: 0.55, cejas: 0.95, brinda: 1.05, sorbo0: 1.25, sorbo1: 1.7, prepara: 1.8, sale: 2.25,
    giro0: 2.62, giro1: 4.9, frenaD: 4.35, pivote0: 4.45, pivote1: 5.3, mareo1: 6.0, sacude1: 6.32,
    carga: 6.35, empuja: 6.82, despega: 6.97, choque: 7.27, tapado: 8.0, quieto: 8.7,
    rueda0: 9.2, guino: 12.55, fin: 13.55
  };

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const ABIERTA = D(1, 1), RELAJADA = D(0.55, 0.6, 0.55, 0.5, 0.45), MUSLO = D(0.7, 0.8, 0.78, 0.74, 0.7),
    AGARRA = D(0.3, 0.12, 0.1, 0.1, 0.1), VASO = D(0.55, 0.32, 0.3, 0.3, 0.3);

  /* ---------- caras (mismos campos para los dos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, wi: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* =====================================================================================
   * SILLAS: geometría común (px de pantalla con escala k = s / 0,30)
   * ===================================================================================== */
  const ASIENTO = 100;                       // altura del cojín sobre el suelo
  const SG = 0.30, SUELO_G = 556, SD = 0.29, SUELO_D = 526;
  const kG = SG / 0.3, kD = SD / 0.3;
  // pelvis (hoja) para que el culo quede sobre el cojín, y tobillo en el suelo (hoja)
  const pelSentado = (rig, s, k) => (-(ASIENTO + 20) * k) / (s * rig.K) + rig.SUELO - rig.PELVIS.y;
  const PEL_G = pelSentado(G, SG, kG), PEL_D = pelSentado(DV, SD, kD);
  const TOB_G = G.SUELO - G.TOBILLO_ALTO, TOB_D = DV.SUELO - DV.TOBILLO_ALTO;
  const ADELANTE = 8;                        // la pelvis va un poco por delante del eje de la silla

  // hoja ↔ pantalla de un pie, con la silla girada cos θ = ±1 alrededor de su eje cx
  const hojaX = (rig, s, cx, dir, X) => rig.PELVIS.x + ((X - cx) * dir - ADELANTE * (s / 0.3)) / (s * rig.K);
  const mundoX = (rig, s, cx, dir, hx) => cx + dir * (ADELANTE * (s / 0.3) + (hx - rig.PELVIS.x) * s * rig.K);

  /* ---------- pies que se impulsan: apoyos [lado, t0, t1, fuerza] ---------- */
  const APOYO_X = 345;                       // dónde clava el talón por defecto (hoja, respecto a la pelvis)
  // pie apoyado: queda quieto en el suelo mientras la silla avanza
  function piePegado(rig, s, xSilla, dirSilla, rel, t0, t) {
    const cx0 = xSilla(t0), dir = dirSilla(t0);
    const X = mundoX(rig, s, cx0, dir, rig.PELVIS.x + rel);
    return hojaX(rig, s, xSilla(t), dirSilla(t), X) - rig.PELVIS.x;
  }
  // pie con lista de apoyos: entre apoyos vuelve por el aire al siguiente; sin apoyos, a su reposo
  function pieImpulso(rig, s, xSilla, dirSilla, lista, lado, t, reposo, tob) {
    const mios = lista.filter(a => a[0] === lado);
    for (const a of mios) if (t >= a[1] && t <= a[2]) {
      const u = fase(t, a[1], a[2]);
      return { x: rig.PELVIS.x + piePegado(rig, s, xSilla, dirSilla, a[4] ?? APOYO_X, a[1], t), y: tob, ang: lerp(-0.42, 0.05, suave(u)), apoyo: 1 };
    }
    let prev = null, next = null;
    for (const a of mios) { if (a[2] < t) prev = a; else if (a[1] > t && !next) next = a; }
    const desde = prev ? { x: piePegado(rig, s, xSilla, dirSilla, prev[4] ?? APOYO_X, prev[1], prev[2]), t: prev[2] } : null;
    const hasta = next ? { x: next[4] ?? APOYO_X, t: next[1] } : null;
    if (!desde && !hasta) return { x: rig.PELVIS.x + reposo, y: tob, ang: 0, apoyo: 0 };
    const t0 = desde ? desde.t : hasta.t - 0.4, t1 = hasta ? hasta.t : desde.t + 0.45;
    const x0 = desde ? desde.x : reposo, x1 = hasta ? hasta.x : reposo;
    const u = fase(t, t0, t1), arco = Math.sin(Math.PI * u);
    return { x: rig.PELVIS.x + lerp(x0, x1, suave(u)), y: tob - 70 * arco, ang: lerp(desde ? 0.05 : 0, hasta ? -0.42 : 0, suave(u)) - 0.15 * arco, apoyo: 0 };
  }

  /* =====================================================================================
   * DEIVI (carril del fondo): carrera suave → giro de silla en la meta → pasa despacito
   * ===================================================================================== */
  const XD0 = 528;
  // apoyos de la carrera (talón delante y tira) y los dos empujoncitos perezosos del final
  const APOYOS_D = [
    ["cerca", 2.25, 2.62, 1, 340], ["lejos", 2.78, 3.15, 1, 360], ["cerca", 3.3, 3.67, 1, 340], ["lejos", 3.82, 4.18, 0.8, 360],
    ["cerca", 9.3, 9.85, -0.7, 330], ["lejos", 10.75, 11.3, -0.5, 350]
  ];
  const F_D = 550;
  function fuerzaD(t) {
    let f = 0;
    for (const a of APOYOS_D) { const u = fase(t, a[1], a[2]); if (u > 0 && u < 1) f += a[3] * F_D * Math.sin(Math.PI * u) ** 2; }
    return f;
  }
  // rozamiento: rueda suelto en carrera; frena con los talones al llegar; al final frena muy poco a poco
  const frenoD = t => lerp(lerp(0.75, 6, tramo(t, T.frenaD, T.frenaD + 0.4)), 0.42, tramo(t, 9.0, 9.3)) + 1.1 * tramo(t, 12.3, 13.6);
  const PASO = 1 / 1000;
  const TABLA_D = (() => {
    const n = Math.ceil(DUR / PASO) + 2, xs = new Float64Array(n);
    let x = XD0, v = 0;
    for (let i = 0; i < n; i++) { const t = i * PASO; xs[i] = x; v += (fuerzaD(t) - frenoD(t) * v) * PASO; x += v * PASO; }
    return xs;
  })();
  const xD = t => { const u = clamp(t, 0, DUR) / PASO, i = Math.floor(u), k = u - i; return lerp(TABLA_D[i], TABLA_D[Math.min(i + 1, TABLA_D.length - 1)], k); };
  const thD = t => Math.PI * suave5(fase(t, T.pivote0, T.pivote1));
  const dirD = t => (t < (T.pivote0 + T.pivote1) / 2 ? 1 : -1);

  // sorbos: cuánto tiene el vaso en la boca (0…1) y nivel del refresco
  const SORBOS = [[T.sorbo0, T.sorbo1, 0.1], [3.0, 3.42, 0.07], [5.55, 6.35, 0.12], [9.45, 12.5, 0.5]];
  function sorbe(t) { let k = 0; for (const [a, b] of SORBOS) k = Math.max(k, dentro(t, a, a + 0.28, b, b + 0.3)); return k * (1 - dentro(t, T.empuja, T.empuja + 0.1, T.choque + 0.6, T.choque + 0.9)); }
  function nivel(t) { let n = 0.86; for (const [a, b, q] of SORBOS) n -= q * fase(t, a + 0.25, b); return Math.max(0.0, n); }

  const CARAS_D = {
    inicio: E({ mx: -0.7, my: 0.05, c: 0.4, sd: 6, gd: 0.04, si: 8, gi: 0.06, sonr: 0.45, ancho: 0.85 }),
    brinda: E({ mx: -0.75, my: 0, c: 0.3, sd: 2, gd: 0, si: 18, gi: 0.14, abre: 4, sonr: 0.65, ancho: 0.95 }),
    sorbe: E({ mx: 0.3, my: 0.2, c: 0.6, sd: 6, gd: 0.04, si: 10, gi: 0.08, abre: 0, ancho: 0.42, sonr: 0.05 }),
    listo: E({ mx: 0.9, my: 0, c: 0.35, sd: 4, gd: 0.02, si: 6, gi: 0.04, sonr: 0.55, ancho: 0.9 }),
    carrera: E({ mx: 0.9, my: 0.05, c: 0.45, sd: 6, gd: 0.04, si: 6, gi: 0.04, sonr: 0.6, ancho: 0.95 }),
    mira: E({ mx: 0.9, my: 0.1, c: 0.35, sd: 4, gd: 0.02, si: 16, gi: 0.12, sonr: 0.3, ancho: 0.8 }),
    asombro: E({ mx: 0.9, my: 0.05, iris: 0.85, c: 0, sd: 22, gd: 0.12, si: 24, gi: 0.14, abre: 18, ancho: 0.7, sonr: -0.1 }),
    auch: E({ mx: 0.9, my: 0.1, c: 1, z: 1, sd: 12, gd: 0.16, si: 12, gi: 0.16, abre: 20, ancho: 1.05, sonr: -0.55 }),
    impasible: E({ mx: 0.9, my: 0.25, c: 0.55, sd: 2, gd: 0, si: 12, gi: 0.1, abre: 0, ancho: 0.7, sonr: 0.1 }),
    camara: E({ mx: -0.85, my: 0, c: 0.3, sd: 10, gd: 0.06, si: 6, gi: 0.04, abre: 2, ancho: 0.9, sonr: 0.7 }),
    guino: E({ mx: -0.85, my: 0, c: 0.25, wi: 0.75, sd: 12, gd: 0.08, si: -2, gi: -0.04, abre: 4, ancho: 1, sonr: 0.9 })
  };
  const GUION_CARA_D = [
    [T.brinda - 0.1, T.brinda + 0.2, "brinda"], [T.prepara - 0.1, T.prepara + 0.25, "listo"], [T.sale + 0.1, T.sale + 0.4, "carrera"],
    [T.pivote1 - 0.2, T.pivote1 + 0.2, "mira"], [T.empuja + 0.05, T.empuja + 0.2, "asombro"], [T.choque - 0.02, T.choque + 0.08, "auch"],
    [T.choque + 0.75, T.choque + 1.1, "impasible"], [T.guino - 0.4, T.guino - 0.1, "camara"], [T.guino, T.guino + 0.14, "guino"]
  ];
  const CUERPOS_D = {
    inicio: { torso: -0.06, cab: -0.02 },
    brinda: { torso: -0.08, cab: -0.06 },
    listo: { torso: 0.1, cab: 0.04 },
    carrera: { torso: 0.04, cab: 0.0 },
    pivote: { torso: -0.12, cab: -0.08 },
    mira: { torso: -0.04, cab: 0.02 },
    auch: { torso: -0.14, cab: -0.12 },
    rueda: { torso: -0.07, cab: 0.06 }
  };
  const GUION_CUERPO_D = [
    [T.brinda - 0.05, T.brinda + 0.3, "brinda"], [T.prepara, T.sale, "listo"], [T.sale + 0.1, T.sale + 0.5, "carrera"],
    [T.pivote0, T.pivote0 + 0.4, "pivote"], [T.pivote1 - 0.1, T.pivote1 + 0.4, "mira"], [T.choque - 0.02, T.choque + 0.12, "auch"],
    [T.choque + 0.5, T.choque + 1.0, "mira"], [T.rueda0, T.rueda0 + 0.6, "rueda"]
  ];

  function poseD(t) {
    const b = guion(GUION_CUERPO_D, CUERPOS_D, "inicio", t);
    const cx = xD(t), th = thD(t), dir = Math.cos(th) >= 0 ? 1 : -1;
    const respira = Math.sin(t * 2.0 + 0.6);
    const p = {
      x: cx + ADELANTE * kD, suelo: SUELO_D, s: SD, tirasLimpias: true,
      pelvis: { x: DV.PELVIS.x, y: DV.PELVIS.y + PEL_D + respira * 1.2 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // cabeceo suave al tirar de cada talón
    const tira = clamp(fuerzaD(t) / F_D);
    p.torso += 0.05 * Math.abs(tira) * (t < 6 ? 1 : 0.6); p.cabeza.ang -= 0.03 * Math.abs(tira);
    // pies: reposo con las piernas por delante (uno algo más adelantado)
    for (const [lado, rep] of [["cerca", 255], ["lejos", 330]]) {
      const f = pieImpulso(DV, SD, xD, dirD, APOYOS_D, lado, t, rep, TOB_D - (lado === "lejos" ? 10 : 0));
      // en el giro de la silla los pies se levantan un poco
      const sube = campana(t, T.pivote0 - 0.05, T.pivote1 + 0.1);
      p.piernas[lado] = { tob: { x: f.x, y: f.y - 60 * sube }, ang: f.ang - 0.25 * sube };
    }
    p.cara = cara(guion(GUION_CARA_D, CARAS_D, "inicio", t), parpadeo(t, [0.4, 2.0, 4.0, 7.9, 8.6, 10.2, 11.8, 13.3]));
    // sorbiendo: labios fruncidos en la pajita
    const so = sorbe(t);
    p.cara.boca.abre *= 1 - so; p.cara.boca.ancho = lerp(p.cara.boca.ancho, 0.42, so); p.cara.boca.sonrisa = lerp(p.cara.boca.sonrisa, 0.05, so);
    p.cara.ojos.d = Math.max(p.cara.ojos.d, 0.55 * so); p.cara.ojos.i = Math.max(p.cara.ojos.i, 0.55 * so);
    manosD(p, t, so);
    return p;
  }

  // vaso de refresco con hielo, rodaja de limón y pajita doblada (unidades de jarra; centro en la mano)
  const PAJITA = { x: 20, y: -44 };          // punta de la pajita
  const vasoObj = t => (g) => {
    const n = nivel(t);
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const forma = () => { g.beginPath(); g.moveTo(-13, -24); g.lineTo(13, -24); g.lineTo(10.5, 21); g.quadraticCurveTo(10, 23, 8, 23); g.lineTo(-8, 23); g.quadraticCurveTo(-10, 23, -10.5, 21); g.closePath(); };
    // pajita (por detrás del cristal la parte de dentro)
    const paj = () => { g.beginPath(); g.moveTo(3, 18); g.lineTo(8, -30); g.quadraticCurveTo(9.5, -38, 15, -40); g.lineTo(PAJITA.x, PAJITA.y + 1); };
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 5.2; paj(); g.stroke();
    g.strokeStyle = "#f4f1ea"; g.lineWidth = 3.2; paj(); g.stroke();
    g.save(); paj(); g.setLineDash([3, 3.2]); g.strokeStyle = "#e0453c"; g.lineWidth = 3.2; g.stroke(); g.restore();
    // refresco
    const top = lerp(21, -18, n);
    g.save(); forma(); g.clip();
    g.fillStyle = "rgba(225,240,248,0.55)"; g.fillRect(-15, -26, 30, 52);
    if (n > 0.02) {
      g.fillStyle = "#6b2a12"; g.fillRect(-15, top, 30, 50);
      g.fillStyle = "#a8502a"; g.fillRect(-15, top, 30, 3);
      // burbujitas
      g.fillStyle = "rgba(255,220,190,0.7)";
      for (let i = 0; i < 4; i++) { const ph = (t * 0.7 + hash(i + 900)) % 1, y = lerp(21, top + 2, ph); if (y > top + 1) { g.beginPath(); g.arc(-7 + i * 4.5, y, 0.9, 0, Math.PI * 2); g.fill(); } }
    }
    // cubitos de hielo (flotan en la superficie, o en el fondo si se acaba)
    for (let i = 0; i < 3; i++) {
      const y = Math.min(16, top + 4 + i * 3), x = -6 + i * 6;
      g.save(); g.translate(x, y); g.rotate(0.3 * i - 0.3 + 0.05 * Math.sin(t * 2 + i));
      g.fillStyle = "rgba(235,248,255,0.9)"; g.strokeStyle = "rgba(90,120,140,0.8)"; g.lineWidth = 0.9;
      g.beginPath(); g.rect(-3.2, -3.2, 6.4, 6.4); g.fill(); g.stroke(); g.restore();
    }
    g.fillStyle = "rgba(255,255,255,0.45)"; g.fillRect(-10, -22, 3, 40);
    g.restore();
    forma(); g.lineWidth = 2; g.strokeStyle = "#0b0a0e"; g.stroke();
    // rodaja de limón en el borde
    g.save(); g.translate(-11, -24); g.fillStyle = "#f2e04a"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.5;
    g.beginPath(); g.arc(0, 0, 6.5, Math.PI * 0.55, Math.PI * 2.45); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "#c9b42a"; g.lineWidth = 0.8; for (let i = 0; i < 4; i++) { const a = Math.PI * (0.8 + i * 0.35); g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 5, Math.sin(a) * 5); g.stroke(); }
    g.restore();
    g.restore();
  };

  function manosD(p, t, so) {
    const Tr = DV.tronco(p), P0 = (dx, dy) => ({ x: DV.PELVIS.x + dx, y: p.pelvis.y + dy });
    // vaso en la mano cercana, delante del pecho; mano lejana sobre el muslo
    let c = Tr({ x: 350, y: 520 }), cmu = 2.3, cang = 0;
    let l = P0(225, -50), lmu = -2.35, ld = MUSLO;
    // brindis: levanta el vaso
    const br = campana(t, T.brinda - 0.05, T.sorbo0 + 0.05);
    c = mezcla(c, Tr({ x: 400, y: 380 }), br); cang -= 0.1 * br;
    // sorbo: la punta de la pajita a los labios
    if (so > 0) {
      const ang = -0.12, boca = DV.boca(p), r = DV.rotP({ x: PAJITA.x * DV.JK, y: PAJITA.y * DV.JK }, ang);
      c = mezcla(c, { x: boca.x - r.x + 4, y: boca.y - r.y + 2 }, so); cang = lerp(cang, ang, so); cmu = lerp(cmu, 2.0, so);
    }
    // sorbo final, vaso vacío: tiembla con el ruidito
    const tiembla = dentro(t, 12.05, 12.15, 12.5, 12.65);
    c = { x: c.x + 5 * Math.sin(t * 38) * tiembla, y: c.y + 3 * Math.sin(t * 47) * tiembla };
    // en el giro de la silla: el vaso en alto, la otra mano abierta hacia fuera (floritura)
    const fl = campana(t, T.pivote0 - 0.1, T.pivote1 + 0.25);
    c = mezcla(c, Tr({ x: 380, y: 400 }), fl);
    l = mezcla(l, Tr({ x: 600, y: 470 }), fl); lmu = lerp(lmu, Math.PI, fl); ld = mezclaD(ld, ABIERTA, fl);
    // ¡auch!: encoge los hombros, la mano lejana a medio camino de la cara
    const au = dentro(t, T.choque - 0.02, T.choque + 0.1, T.choque + 0.5, T.choque + 0.9);
    l = mezcla(l, Tr({ x: 470, y: 330 }), au); lmu = lerp(lmu, 2.2, au); ld = mezclaD(ld, D(0.8, 0.9, 0.9, 0.85, 0.8), au);
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: -1, puno: 1, dedos: VASO, objeto: vasoObj(t) };
    p.manoLejos = { x: l.x, y: l.y, ang: 0, mu: lmu, dobla: 1, puno: 1, dedos: ld };
  }

  /* =====================================================================================
   * GUILLERMO (carril de delante): pataleo → peonza → mareo → empujón hacia atrás → ¡cajas!
   * ===================================================================================== */
  const XG0 = 330, XG_GIRO = 548, X_CHOQUE = 304;
  const V_DISPARO = 0.15;                    // tiempo de empuje (pies apoyados)
  const V_G = (XG_GIRO - X_CHOQUE) / (V_DISPARO / 2 + (T.choque - T.empuja - V_DISPARO));
  function xG(t) {
    if (t < T.sale) return XG0 + 3 * Math.sin(t * 1.3) * tramo(t, 0.3, 0.9) * (1 - tramo(t, T.prepara, T.sale));
    if (t < T.giro0) return XG0 + 14 * suave(fase(t, T.sale, T.giro0));
    if (t < T.giro1) { const u = fase(t, T.giro0, T.giro1); return lerp(XG0 + 14, XG_GIRO, suave(u)) + 34 * Math.sin(3 * Math.PI * u) * Math.sin(Math.PI * u); }
    if (t < T.empuja) return XG_GIRO + 4 * Math.sin((t - T.giro1) * 5) * dentro(t, T.giro1, T.giro1 + 0.4, T.mareo1, T.carga);
    if (t < T.choque) {
      const tau = t - T.empuja, u = Math.min(1, tau / V_DISPARO);
      const d = tau < V_DISPARO ? V_DISPARO * (u * u * u - u * u * u * u / 2) : V_DISPARO / 2 + (tau - V_DISPARO);
      return XG_GIRO - V_G * d;
    }
    const tau = t - T.choque;
    return X_CHOQUE + 9 * Math.exp(-tau * 8) * Math.sin(tau * 22);
  }
  // vueltas de la peonza (4 vueltas) y bamboleo del mareo
  function thG(t) {
    const u = fase(t, T.giro0, T.giro1);
    return 8 * Math.PI * suave(u) + 0.3 * Math.sin((t - T.giro1) * 7) * dentro(t, T.giro1, T.giro1 + 0.25, T.giro1 + 0.6, T.mareo1);
  }
  // inclinación hacia atrás de la silla al estamparse (gira sobre la rueda de atrás)
  function vuelcoG(t) {
    if (t < T.choque) return 0;
    const tau = t - T.choque, A = -0.32;
    return A * (1 - Math.exp(-tau * 9) * (Math.cos(tau * 16) + 0.56 * Math.sin(tau * 16))) * suave(fase(tau, 0, 0.05));
  }

  const CARAS_G = {
    inicio: E({ mx: 0.9, my: -0.05, c: 0.2, sd: 8, gd: 0.06, si: 6, gi: 0.04, sonr: 0.55, ancho: 0.95 }),
    pica: E({ mx: 0.9, my: -0.1, c: 0.15, sd: 18, gd: 0.12, si: 6, gi: 0.02, abre: 6, sonr: 0.75, ancho: 1.05 }),
    listo: E({ mx: 0.9, my: 0, c: 0.4, sd: -2, gd: -0.12, si: -2, gi: -0.12, abre: 10, ancho: 1.05, sonr: 0.45 }),
    patalea: E({ mx: 0.9, my: 0, c: 1, z: 1, sd: 10, gd: 0.14, si: 10, gi: 0.14, abre: 24, ancho: 1, sonr: 0.1 }),
    gira: E({ mx: 0, my: 0, iris: 0.8, sd: 26, gd: 0.2, si: 26, gi: 0.2, abre: 38, ancho: 0.72, sonr: -0.3, lengua: 0.3 }),
    mareo: E({ mx: 0, my: 0, esp: 1, sd: 12, gd: 0.2, si: -6, gi: -0.1, abre: 16, ancho: 0.85, sonr: -0.1, lengua: 0.85 }),
    sacude: E({ mx: 0.4, my: 0, c: 0.85, z: 0.6, sd: 6, gd: 0.06, si: 6, gi: 0.06, abre: 4, ancho: 0.8, sonr: -0.2 }),
    decidido: E({ mx: 0.9, my: 0.05, c: 0.45, sd: -4, gd: -0.2, si: -4, gi: -0.2, abre: 12, ancho: 1.08, sonr: 0.25 }),
    empuja: E({ mx: 0.9, my: -0.05, c: 0.25, h: 0.2, sd: 14, gd: 0.08, si: 14, gi: 0.08, abre: 16, ancho: 1.1, sonr: 0.85 }),
    horror: E({ mx: -0.85, my: 0, iris: 0.72, c: 0, sd: 30, gd: 0.24, si: 30, gi: 0.24, abre: 40, ancho: 0.75, sonr: -0.55 }),
    choque: E({ mx: 0, my: 0, c: 1, z: 1, sd: 14, gd: 0.2, si: 14, gi: 0.2, abre: 32, ancho: 0.9, sonr: -0.55, lengua: 0.4 })
  };
  const GUION_CARA_G = [
    [T.mira, T.mira + 0.25, "pica"], [T.prepara - 0.1, T.prepara + 0.2, "listo"], [T.sale, T.sale + 0.08, "patalea"],
    [T.giro0 + 0.15, T.giro0 + 0.45, "gira"], [T.giro1 - 0.2, T.giro1 + 0.15, "mareo"], [T.mareo1, T.mareo1 + 0.1, "sacude"],
    [T.sacude1, T.sacude1 + 0.15, "decidido"], [T.empuja, T.empuja + 0.06, "empuja"], [T.despega + 0.04, T.despega + 0.14, "horror"],
    [T.choque - 0.02, T.choque + 0.03, "choque"]
  ];
  // cuerpo: torso (+ hacia delante), cab
  const CUERPOS_G = {
    inicio: { torso: 0.02, cab: 0.02 },
    pica: { torso: 0.06, cab: -0.04 },
    listo: { torso: 0.2, cab: -0.1 },
    patalea: { torso: 0.08, cab: -0.04 },
    gira: { torso: -0.1, cab: -0.12 },
    mareo: { torso: -0.06, cab: 0.04 },
    carga: { torso: 0.26, cab: -0.14 },
    empuja: { torso: -0.14, cab: -0.2 },
    vuela: { torso: 0.1, cab: 0.08 },
    choque: { torso: -0.12, cab: -0.24 },
    tapado: { torso: 0.3, cab: 0.32 }
  };
  const GUION_CUERPO_G = [
    [T.mira, T.mira + 0.3, "pica"], [T.prepara, T.sale, "listo"], [T.sale, T.sale + 0.1, "patalea"], [T.giro0, T.giro0 + 0.4, "gira"],
    [T.giro1 - 0.3, T.giro1 + 0.2, "mareo"], [T.carga, T.empuja, "carga"], [T.empuja, T.empuja + 0.1, "empuja", salida],
    [T.despega, T.despega + 0.18, "vuela"], [T.choque, T.choque + 0.06, "choque", salida],
    [T.choque + 0.1, T.choque + 0.4, "tapado"]
  ];
  const APOYOS_G = [["cerca", T.empuja - 0.02, T.despega, 1, 205], ["lejos", T.empuja - 0.02, T.despega, 1, 255]];
  const dirG = () => 1;

  function poseG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const cx = xG(t);
    const respira = Math.sin(t * 2.4);
    const p = {
      x: cx + ADELANTE * kG, suelo: SUELO_G, s: SG, tirasLimpias: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + PEL_G + respira * 1.3 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.005 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // pique de cejas
    const pica = dentro(t, T.cejas - 0.05, T.cejas + 0.05, T.cejas + 0.5, T.cejas + 0.6);
    // pies
    const pat = dentro(t, T.sale - 0.02, T.sale + 0.06, T.giro0 + 0.1, T.giro0 + 0.3);          // pataleo loco
    const vueltas = dentro(t, T.giro0 + 0.1, T.giro0 + 0.4, T.giro1 - 0.55, T.giro1 - 0.1);     // piernas estiradas al aire
    const recoge = tramo(t, T.carga, T.empuja - 0.05);                                            // pies cerca para empujar
    const vuela = tramo(t, T.despega - 0.02, T.despega + 0.2);                                    // piernas arriba
    for (const [lado, rep, fi] of [["cerca", 280, 0], ["lejos", 345, Math.PI]]) {
      const tob = TOB_G - (lado === "lejos" ? 12 : 0);
      let x = G.PELVIS.x + rep, y = tob, ang = 0;
      if (pat > 0) { const w = t * 2 * Math.PI / 0.23 + fi;
        x = lerp(x, G.PELVIS.x + rep - 10 + 75 * Math.sin(w), pat); y = lerp(y, tob - 55 * Math.max(0, Math.cos(w)) - 10, pat); ang = lerp(ang, -0.3 + 0.35 * Math.sin(w), pat); }
      if (vueltas > 0) { x = lerp(x, G.PELVIS.x + rep + 50, vueltas); y = lerp(y, tob - 170 + 20 * Math.sin(t * 9 + fi), vueltas); ang = lerp(ang, -0.5, vueltas); }
      // empujón: pies recogidos y apoyados; mientras empuja se quedan clavados en el suelo
      const ap = APOYOS_G.find(a => a[0] === lado);
      if (recoge > 0) { const rel = t >= ap[1] ? piePegado(G, SG, xG, dirG, ap[4], ap[1], Math.min(t, ap[2])) : ap[4];
        x = lerp(x, G.PELVIS.x + rel, recoge); y = lerp(y, tob, recoge); ang = lerp(ang, -0.12, recoge); }
      if (vuela > 0) { x = lerp(x, G.PELVIS.x + (lado === "cerca" ? 420 : 470), vuela); y = lerp(y, tob - (lado === "cerca" ? 470 : 455), vuela); ang = lerp(ang, -0.75, vuela); }
      // tras el choque, debajo de las cajas: pataleos de vez en cuando
      if (t > T.choque) {
        const tw = patadita(t, lado);
        y -= 40 * tw.k; ang += tw.a;
      }
      p.piernas[lado] = { tob: { x, y }, ang };
    }
    // mareo: la cabeza da vueltas y el cuerpo se bambolea
    const mareo = dentro(t, T.giro1 - 0.1, T.giro1 + 0.2, T.mareo1 - 0.1, T.mareo1 + 0.05);
    p.torso += 0.06 * Math.sin(t * 3.1) * mareo;
    p.cabeza.ang += 0.12 * Math.sin(t * 3.1 + 0.9) * mareo; p.cabeza.dx += 10 * Math.cos(t * 3.1) * mareo; p.cabeza.dy += 6 * Math.sin(t * 3.1) * mareo;
    // sacude la cabeza
    const sac = fase(t, T.mareo1, T.sacude1);
    if (sac > 0 && sac < 1) p.cabeza.ang += 0.2 * Math.sin(sac * Math.PI * 6) * Math.sin(Math.PI * sac);
    // cargando: rebotito de impaciencia
    p.pelvis.y -= 6 * Math.max(0, Math.sin((t - T.carga) * 18)) * dentro(t, T.carga, T.carga + 0.1, T.empuja - 0.15, T.empuja);
    // choque: aplastado contra el respaldo
    const golpe = t >= T.choque ? Math.exp(-(t - T.choque) * 8) * suave(fase(t, T.choque, T.choque + 0.03)) : 0;
    p.torsoEsc.x = 1 - 0.06 * golpe; p.cabeza.esc = { x: 1 - 0.1 * golpe, y: 1 + 0.05 * golpe };
    p.th = thG(t); p.vuelco = vuelcoG(t);
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    ex.sd += 14 * Math.sin((t - T.cejas) * 22) * pica; ex.si += 14 * Math.sin((t - T.cejas) * 22) * pica;
    p.cara = cara(ex, parpadeo(t, [0.35, 1.6, 6.45]));
    p.enfado = dentro(t, T.sacude1 + 0.05, T.sacude1 + 0.2, T.empuja + 0.1, T.despega + 0.1);
    p.rojo = 0.35 * dentro(t, T.carga, T.carga + 0.2, T.empuja + 0.1, T.despega + 0.1) + 0.25 * pat;
    manosG(p, t, pat, vueltas, mareo);
    return p;
  }
  // pataditas de las piernas que asoman (sacudidas cortas, el pie se agita)
  const PATADAS = [[8.75, "cerca"], [8.95, "lejos"], [10.55, "cerca"], [11.45, "lejos"], [11.62, "cerca"], [13.05, "lejos"]];
  function patadita(t, lado) {
    let k = 0, a = 0;
    for (const [t0, l] of PATADAS) { if (l !== lado) continue; const u = fase(t, t0, t0 + 0.42); if (u > 0 && u < 1) { k += Math.sin(Math.PI * u) * Math.abs(Math.sin(u * Math.PI * 3)); a += 0.45 * Math.sin(u * Math.PI * 4) * Math.sin(Math.PI * u); } }
    // y un meneo continuo de los pies, cansado
    a += 0.08 * Math.sin(t * 2.2 + (lado === "cerca" ? 0 : 1.7)) * tramo(t, T.quieto, T.quieto + 0.5);
    return { k, a };
  }

  function manosG(p, t, pat, vueltas, mareo) {
    const Tr = G.tronco(p), P0 = (dx, dy) => ({ x: G.PELVIS.x + dx, y: p.pelvis.y + dy });
    // de partida, manos sobre los muslos
    let c = P0(40, -50), l = P0(170, -55), cmu = -2.3, lmu = -2.4, cd = MUSLO, ld = MUSLO, cang = 0, lang = 0;
    const pone = (w, cc, ll) => {
      if (w <= 0) return;
      if (cc) { c = mezcla(c, cc.q, w); cang = lerp(cang, cc.ang || 0, w); cmu = lerp(cmu, cc.mu, w); cd = mezclaD(cd, cc.d, w); }
      if (ll) { l = mezcla(l, ll.q, w); lang = lerp(lang, ll.ang || 0, w); lmu = lerp(lmu, ll.mu, w); ld = mezclaD(ld, ll.d, w); }
    };
    // listo / cargando: agarrado al borde del asiento
    const agarra = Math.max(dentro(t, T.prepara - 0.05, T.prepara + 0.25, T.sale, T.sale + 0.15), dentro(t, T.carga - 0.05, T.carga + 0.2, T.despega, T.despega + 0.1));
    pone(agarra, { q: P0(95, 40), mu: -2.0, d: AGARRA }, { q: P0(235, 35), mu: -2.1, d: AGARRA });
    // pataleo: los brazos se agitan
    if (pat > 0) { const w = Math.sin(t * 2 * Math.PI / 0.23);
      pone(pat, { q: Tr({ x: 230 + 40 * w, y: 470 }), mu: 2.4, d: AGARRA }, { q: Tr({ x: 450 - 40 * w, y: 450 }), mu: 2.3, d: AGARRA }); }
    // peonza: brazos en cruz
    if (vueltas > 0) { const f = Math.sin(t * 11);
      pone(vueltas, { q: Tr({ x: -150, y: 300 + 20 * f }), mu: 0.15, d: ABIERTA }, { q: Tr({ x: 640, y: 300 - 20 * f }), mu: Math.PI - 0.15, d: ABIERTA }); }
    // mareo: manos flojas sobre los muslos
    pone(mareo * 0.6, { q: P0(70, -40), mu: -2.6, d: RELAJADA }, { q: P0(200, -45), mu: -2.6, d: RELAJADA });
    // volando hacia atrás: brazos hacia delante, agitándose
    const vuela = dentro(t, T.despega - 0.03, T.despega + 0.1, T.choque, T.choque + 0.04);
    if (vuela > 0) { const f = Math.sin(t * 30);
      pone(vuela, { q: Tr({ x: 320, y: 470 + 30 * f }), mu: 2.6, d: ABIERTA }, { q: Tr({ x: 480, y: 420 - 30 * f }), mu: 2.5, d: ABIERTA }); }
    // choque: se tapa la cabeza
    const tapa = tramo(t, T.choque, T.choque + 0.15);
    pone(tapa, { q: Tr({ x: 330, y: 190 }), mu: 2.2, d: D(0.8, 0.9, 0.9, 0.85, 0.8) }, { q: Tr({ x: 430, y: 170 }), mu: 2.3, d: D(0.8, 0.9, 0.9, 0.85, 0.8) });
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: -1, puno: 1, dedos: cd };
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: 1, puno: 1, dedos: ld };
  }

  /* =====================================================================================
   * SILLA DE OFICINA (atrezo): base de cinco patas que no gira + asiento y respaldo que sí
   * ===================================================================================== */
  const TINTA = "#0b0a0e";
  const R_RUEDA = 8.5;
  function rueda(g, x, y, r, ang, k, zumba) {
    g.save(); g.translate(x, y);
    // horquilla
    g.fillStyle = "#3a3d44"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.moveTo(-r * 0.6, -r * 1.55); g.lineTo(r * 0.55, -r * 1.55); g.quadraticCurveTo(r * 1.05, -r * 0.9, r * 0.6, -r * 0.1); g.lineTo(-r * 0.2, -r * 0.3); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#24262b"; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill(); g.stroke();
    // marcas que giran
    g.save(); g.rotate(ang); g.strokeStyle = "#8a909b"; g.lineWidth = 1.6;
    for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3; g.beginPath(); g.moveTo(Math.cos(a) * r * 0.35, Math.sin(a) * r * 0.35); g.lineTo(Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82); g.stroke(); }
    g.restore();
    g.fillStyle = "#b9bec8"; g.beginPath(); g.arc(0, 0, r * 0.3, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.2; g.stroke();
    if (zumba > 0.02) {           // la rueda zumba: arcos de giro alrededor
      g.strokeStyle = `rgba(255,255,255,${0.8 * zumba})`; g.lineWidth = 2; g.lineCap = "round";
      for (let i = 0; i < 2; i++) { const a0 = ang * 0.6 + i * Math.PI; g.beginPath(); g.arc(0, 0, r * 1.6, a0, a0 + 1.3); g.stroke(); }
    }
    g.restore();
  }
  // base (no gira): cubo central, patas y ruedas. a = ángulo de las ruedas; frente = ángulo extra de la delantera
  function baseSilla(g, s, k, a, delantera) {
    const cx = s.x, y0 = s.suelo, hub = y0 - 26 * k;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // patas de detrás (más finas y altas)
    g.strokeStyle = TINTA; g.fillStyle = "#2c2f35";
    const pata = (x1, y1, w) => { g.lineWidth = w + 4; g.strokeStyle = TINTA; g.beginPath(); g.moveTo(cx, hub); g.quadraticCurveTo((cx + x1) / 2, hub - 3 * k, x1, y1); g.stroke();
      g.lineWidth = w; g.strokeStyle = "#3b3f47"; g.stroke(); g.lineWidth = 1.5; g.strokeStyle = "rgba(255,255,255,0.25)"; g.beginPath(); g.moveTo(cx, hub - w * 0.3); g.quadraticCurveTo((cx + x1) / 2, hub - 3 * k - w * 0.3, x1, y1 - w * 0.3); g.stroke(); };
    pata(cx - 30 * k, y0 - 18 * k, 5 * k); pata(cx + 30 * k, y0 - 18 * k, 5 * k);
    rueda(g, cx - 30 * k, y0 - 9 * k - 2, R_RUEDA * k * 0.8, a, k, 0); rueda(g, cx + 30 * k, y0 - 9 * k - 2, R_RUEDA * k * 0.8, a + 1, k, 0);
    // patas de los lados y la de delante
    pata(cx - 52 * k, y0 - 14 * k, 7 * k); pata(cx + 52 * k, y0 - 14 * k, 7 * k); pata(cx + 6 * k, y0 - 9 * k, 8 * k);
    rueda(g, cx - 52 * k, y0 - R_RUEDA * k, R_RUEDA * k, a + 2, k, 0);
    rueda(g, cx + 52 * k, y0 - R_RUEDA * k, R_RUEDA * k, a + (delantera ? delantera.a : 0.5), k, delantera ? delantera.zumba : 0);
    rueda(g, cx + 6 * k, y0 - R_RUEDA * k + 3, R_RUEDA * k * 1.05, a + 1.7, k, 0);
    // cubo
    g.fillStyle = "#3b3f47"; g.strokeStyle = TINTA; g.lineWidth = 2.5;
    g.beginPath(); g.ellipse(cx, hub, 14 * k, 7 * k, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
  }
  // pistón y mecanismo (no gira)
  function piston(g, s, k) {
    const cx = s.x, top = s.suelo - ASIENTO * k + 14 * k, bot = s.suelo - 30 * k;
    g.save();
    g.fillStyle = "#2a2c31"; g.strokeStyle = TINTA; g.lineWidth = 2.5;
    g.beginPath(); g.rect(cx - 7 * k, top + 20 * k, 14 * k, bot - top - 20 * k); g.fill(); g.stroke();
    const cr = g.createLinearGradient(cx - 5 * k, 0, cx + 5 * k, 0); cr.addColorStop(0, "#8e949e"); cr.addColorStop(0.45, "#f2f4f7"); cr.addColorStop(1, "#7a808a");
    g.fillStyle = cr; g.beginPath(); g.rect(cx - 4.5 * k, top, 9 * k, 24 * k); g.fill(); g.stroke();
    g.restore();
  }
  // asiento y respaldo (giran con el ocupante: se dibujan dentro del aplastado)
  function respaldoSilla(g, s, k) {
    const cx = s.x, top = s.suelo - ASIENTO * k, col = s.color;
    g.save(); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = TINTA;
    // varilla del respaldo
    g.lineWidth = 11 * k; g.beginPath(); g.moveTo(cx - 30 * k, top + 12 * k); g.quadraticCurveTo(cx - 62 * k, top + 12 * k, cx - 62 * k, top - 22 * k); g.stroke();
    g.lineWidth = 6 * k; g.strokeStyle = "#3b3f47"; g.stroke();
    // respaldo: almohadón alto, algo inclinado hacia atrás
    g.save(); g.translate(cx - 64 * k, top - 22 * k); g.rotate(-0.13);
    const forma = () => { g.beginPath(); g.moveTo(-10 * k, 0); g.bezierCurveTo(-15 * k, -40 * k, -16 * k, -88 * k, -8 * k, -118 * k); g.quadraticCurveTo(0, -128 * k, 10 * k, -118 * k);
      g.bezierCurveTo(14 * k, -88 * k, 16 * k, -40 * k, 12 * k, 0); g.quadraticCurveTo(1 * k, 8 * k, -10 * k, 0); g.closePath(); };
    forma(); g.fillStyle = col.base; g.fill();
    g.save(); forma(); g.clip(); g.fillStyle = col.sombra; g.fillRect(-20 * k, -130 * k, 12 * k, 140 * k); g.fillStyle = col.luz; g.fillRect(4 * k, -112 * k, 3 * k, 96 * k); g.restore();
    forma(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    // costura
    g.strokeStyle = col.sombra; g.lineWidth = 1.5; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(1 * k, -10 * k); g.lineTo(2 * k, -110 * k); g.stroke(); g.setLineDash([]);
    g.restore();
    g.restore();
  }
  function cojin(g, s, k) {
    const cx = s.x, top = s.suelo - ASIENTO * k, col = s.color;
    g.save(); g.lineJoin = "round";
    // placa del mecanismo
    g.fillStyle = "#2a2c31"; g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.rect(cx - 26 * k, top + 13 * k, 46 * k, 8 * k); g.fill(); g.stroke();
    // palanca
    g.lineWidth = 3 * k; g.strokeStyle = "#2a2c31"; g.beginPath(); g.moveTo(cx + 18 * k, top + 18 * k); g.lineTo(cx + 34 * k, top + 24 * k); g.stroke();
    const forma = () => { g.beginPath(); g.moveTo(cx - 56 * k, top + 4 * k); g.quadraticCurveTo(cx - 58 * k, top - 3 * k, cx - 46 * k, top - 4 * k); g.lineTo(cx + 42 * k, top - 4 * k);
      g.quadraticCurveTo(cx + 58 * k, top - 3 * k, cx + 56 * k, top + 7 * k); g.quadraticCurveTo(cx + 54 * k, top + 15 * k, cx + 40 * k, top + 15 * k); g.lineTo(cx - 46 * k, top + 15 * k);
      g.quadraticCurveTo(cx - 56 * k, top + 14 * k, cx - 56 * k, top + 4 * k); g.closePath(); };
    forma(); g.fillStyle = col.base; g.fill();
    g.save(); forma(); g.clip(); g.fillStyle = col.sombra; g.fillRect(cx - 60 * k, top + 8 * k, 120 * k, 10 * k); g.fillStyle = col.luz; g.fillRect(cx - 44 * k, top - 2 * k, 84 * k, 2.5 * k); g.restore();
    forma(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    g.restore();
  }
  const COL_G = { base: "#d8413a", sombra: "#9c2620", luz: "#ff8a74" };
  const COL_D = { base: "#2f6fbf", sombra: "#1d4787", luz: "#7fb2ee" };
  // la unidad completa: silla + ocupante. th: giro del asiento; vuelco: la silla entera se inclina sobre la rueda de atrás
  function dibUnidad(g, t, rig, p, s, k, ruedas) {
    g.save();
    if (s.vuelco) { const px = s.x - 52 * k, py = s.suelo; g.translate(px, py); g.rotate(s.vuelco); g.translate(-px, -py); }
    baseSilla(g, s, k, ruedas.a, ruedas.delantera);
    piston(g, s, k);
    const cth = Math.cos(s.th || 0), sx = Math.abs(cth) < 0.03 ? 0.03 * (cth < 0 ? -1 : 1) : cth;
    g.save(); g.translate(s.x, 0); g.scale(sx, 1); g.translate(-s.x, 0);
    respaldoSilla(g, s, k);
    cojin(g, s, k);
    rig.dibujar(g, p, t);
    g.restore();
    g.restore();
  }

  /* =====================================================================================
   * LA PILA DE CAJAS: posición inicial (apiladas) y final (encima de Guillermo)
   * ===================================================================================== */
  // [ancho, alto, x, y (centro inicial), x, y, giro (final), t0, t1 (caída), estilo, z]
  const CAJAS = [
    [104, 82, 70, 515, 74, 515, 0.0, 7.3, 7.46, 0, 0],
    [112, 92, 180, 510, 206, 510, 0.03, 7.27, 7.45, 1, 1],
    [96, 74, 74, 437, 150, 412, -0.08, 7.31, 7.6, 2, 2],
    [100, 70, 178, 429, 214, 436, 0.1, 7.28, 7.58, 3, 3],
    [100, 78, 108, 355, 250, 352, -0.08, 7.32, 7.74, 0, 7],
    [92, 72, 203, 360, 300, 441, 0.22, 7.28, 7.62, 2, 5],
    [116, 84, 112, 279, 262, 271, 0.12, 7.36, 7.86, 1, 9],
    [90, 74, 205, 296, 284, 520, 0.05, 7.3, 7.66, 3, 4],
    [96, 66, 125, 209, 232, 196, -0.22, 7.42, 7.98, 0, 10],
    [74, 56, 200, 238, 322, 292, -0.45, 7.33, 7.78, 2, 8],
    [84, 60, 128, 146, 303, 209, 0.45, 7.46, 8.08, 1, 11],
    [56, 44, 196, 188, 163, 351, -0.15, 7.4, 7.9, 3, 6],
    [50, 40, 130, 96, 276, 152, -0.3, 7.52, 8.3, 2, 12]
  ];
  // sacudida previa: las cajas de abajo se desplazan un poco; las de arriba vuelcan
  function estadoCaja(c, t) {
    const [w, h, x0, y0, x1, y1, r1, t0, t1] = c;
    if (t <= t0) return { x: x0, y: y0, r: 0, w, h };
    const u = fase(t, t0, t1);
    const cae = Math.abs(y1 - y0) > 20 || Math.abs(x1 - x0) > 30;
    let x, y, r;
    if (!cae) { const e = salida(u); x = lerp(x0, x1, e); y = lerp(y0, y1, e); r = lerp(0, r1, e) - 0.05 * Math.sin(Math.PI * u); }
    else {
      // vuelco: primero se inclina sobre su esquina y luego cae en arco con su vuelta fija
      x = lerp(x0, x1, u * (1.15 - 0.15 * u)); y = lerp(y0, y1, u * u) - 30 * Math.sin(Math.PI * u) * (1 - u);
      r = r1 * entrada(Math.min(1, u * 1.1)) + (r1 >= 0 ? 1 : -1) * 0.25 * Math.sin(Math.PI * u);
    }
    // al tocar: rebotito y bamboleo amortiguados
    if (u >= 1) { const tau = t - t1; y -= (cae ? 9 : 2) * Math.abs(Math.sin(tau * 15)) * Math.exp(-tau * 7); r += (cae ? 0.08 : 0.02) * Math.sin(tau * 13) * Math.exp(-tau * 5); }
    return { x, y, r, w, h };
  }
  function dibCaja(g, st, estilo, aplasta) {
    const { x, y, r, w, h } = st;
    g.save(); g.translate(x, y); g.rotate(r); g.scale(1 + 0.04 * aplasta, 1 - 0.06 * aplasta);
    g.lineJoin = "round"; g.lineCap = "round";
    const hw = w / 2, hh = h / 2;
    g.fillStyle = "#c99559"; g.strokeStyle = TINTA; g.lineWidth = 2.6;
    g.beginPath(); g.rect(-hw, -hh, w, h); g.fill();
    // cara lateral más oscura y borde de arriba claro
    g.fillStyle = "#a9733d"; g.fillRect(hw - w * 0.22, -hh, w * 0.22, h);
    g.fillStyle = "#e0b47a"; g.fillRect(-hw, -hh, w, 4);
    g.strokeStyle = "rgba(90,55,20,0.6)"; g.lineWidth = 1.3; g.beginPath(); g.moveTo(hw - w * 0.22, -hh); g.lineTo(hw - w * 0.22, hh); g.stroke();
    // solapas y cinta de embalar
    g.beginPath(); g.moveTo(-hw + 2, -hh + 9); g.lineTo(hw - w * 0.22, -hh + 9); g.stroke();
    g.fillStyle = "rgba(235,214,160,0.9)"; g.fillRect(-w * 0.17, -hh, w * 0.12, h * 0.42);
    g.strokeStyle = "rgba(150,110,60,0.6)"; g.lineWidth = 1; g.strokeRect(-w * 0.17, -hh, w * 0.12, h * 0.42);
    // símbolos impresos (sin letras): flechas «hacia arriba», copa «frágil», asas
    g.strokeStyle = "#4a2c12"; g.fillStyle = "#4a2c12"; g.lineWidth = 2;
    const cx = -hw * 0.25, cy = hh * 0.25;
    if (estilo === 1) { for (const dx of [-7, 7]) { g.beginPath(); g.moveTo(cx + dx, cy + 9); g.lineTo(cx + dx, cy - 7); g.stroke(); g.beginPath(); g.moveTo(cx + dx - 5, cy - 3); g.lineTo(cx + dx, cy - 9); g.lineTo(cx + dx + 5, cy - 3); g.stroke(); } }
    else if (estilo === 2) { g.beginPath(); g.moveTo(cx - 6, cy - 9); g.lineTo(cx + 6, cy - 9); g.quadraticCurveTo(cx + 6, cy, cx, cy + 1); g.quadraticCurveTo(cx - 6, cy, cx - 6, cy - 9); g.fill();
      g.beginPath(); g.moveTo(cx, cy + 1); g.lineTo(cx, cy + 8); g.moveTo(cx - 5, cy + 9); g.lineTo(cx + 5, cy + 9); g.stroke(); }
    else if (estilo === 3) { g.beginPath(); g.ellipse(cx - 8, -hh + 18, 7, 3, 0, 0, Math.PI * 2); g.fillStyle = "#5a3612"; g.fill(); }
    else { g.beginPath(); g.moveTo(cx - 9, cy + 6); g.lineTo(cx + 9, cy + 6); g.moveTo(cx - 9, cy + 1); g.lineTo(cx + 3, cy + 1); g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = 2.6; g.beginPath(); g.rect(-hw, -hh, w, h); g.stroke();
    g.restore();
  }
  function dibCajas(g, t) {
    const lista = CAJAS.map((c, i) => ({ c, i, st: estadoCaja(c, t) }));
    // antes del choque, en orden de apilado; luego, en el orden en que quedan encima
    lista.sort((a, b) => (t < T.choque ? a.i - b.i : a.c[10] - b.c[10]));
    for (const { c, st } of lista) {
      const ap = c[7] < 7.3 ? campana(t, T.choque, T.choque + 0.18) : 0;
      dibCaja(g, st, c[9], ap);
    }
  }

  /* =====================================================================================
   * DECORADO: trastienda del bar
   * ===================================================================================== */
  const PARED = 440;                          // línea pared-suelo
  const META = { x0: 836, x1: 802 };          // cinta a cuadros: arriba (en la pared) y abajo (borde de la imagen)
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 100; const g = c.getContext("2d");
    g.translate(60, 50);
    // pared mostaza
    const gp = g.createLinearGradient(0, -50, 0, PARED); gp.addColorStop(0, "#b58a3c"); gp.addColorStop(0.3, "#dcb35f"); gp.addColorStop(1, "#d3a952");
    g.fillStyle = gp; g.fillRect(-60, -50, W + 120, PARED + 50);
    // azulejos verde botella en la parte baja
    const AZ = 318;
    g.fillStyle = "#2f5d50"; g.fillRect(-60, AZ, W + 120, PARED - AZ);
    g.strokeStyle = "rgba(10,30,24,0.55)"; g.lineWidth = 2;
    for (let y = AZ; y <= PARED; y += 30) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    for (let r = 0; r < 4; r++) for (let x = -60 + (r % 2) * 22; x < W + 60; x += 44) { g.beginPath(); g.moveTo(x, AZ + r * 30); g.lineTo(x, AZ + r * 30 + 30); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,0.08)"; for (let r = 0; r < 4; r++) for (let x = -60 + (r % 2) * 22; x < W + 60; x += 44) g.fillRect(x + 4, AZ + r * 30 + 4, 14, 4);
    g.fillStyle = "#1d3a32"; g.fillRect(-60, AZ - 8, W + 120, 9); g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(-60, AZ - 8, W + 120, 2);
    // rodapié
    g.fillStyle = "#1b1a1c"; g.fillRect(-60, PARED - 10, W + 120, 12);
    // estantería metálica al fondo a la izquierda, con cajas de botellas (asoma por encima de la pila)
    const ex = 10, ew = 270;
    g.strokeStyle = "#5c6168"; g.lineWidth = 7; for (const x of [ex, ex + ew]) { g.beginPath(); g.moveTo(x, 60); g.lineTo(x, PARED - 4); g.stroke(); }
    for (const y of [92, 190, 290]) {
      g.fillStyle = "#7d838b"; g.fillRect(ex - 6, y, ew + 12, 9); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(ex - 6, y, ew + 12, 9);
    }
    const caja = (x, y, w, h, col, bot) => {
      g.fillStyle = col; g.fillRect(x, y - h, w, h); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x, y - h, w, h);
      for (let i = 0; i < 4; i++) { const bx = x + 8 + i * (w - 16) / 3.4; g.fillStyle = bot; g.beginPath(); g.moveTo(bx - 4, y - h); g.lineTo(bx - 4, y - h - 14); g.quadraticCurveTo(bx - 4, y - h - 20, bx - 1.5, y - h - 24); g.lineTo(bx - 1.5, y - h - 32);
        g.lineTo(bx + 1.5, y - h - 32); g.lineTo(bx + 1.5, y - h - 24); g.quadraticCurveTo(bx + 4, y - h - 20, bx + 4, y - h - 14); g.lineTo(bx + 4, y - h); g.closePath(); g.fill(); g.lineWidth = 1.4; g.stroke(); }
      g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(x + 6, y - h + 8, w - 12, 6);
    };
    caja(24, 92, 110, 30, "#b8332c", "#2f6b3a"); caja(142, 92, 120, 30, "#2a5b9a", "#7a4a1c");
    caja(30, 190, 112, 30, "#2a5b9a", "#2f6b3a"); caja(150, 190, 108, 30, "#e0a22c", "#3e6a2c");
    // barriles de cerveza metálicos a la derecha del fondo
    for (const [bx, by] of [[965, PARED + 2], [1010, PARED + 2]]) {
      const gb = g.createLinearGradient(bx - 28, 0, bx + 28, 0); gb.addColorStop(0, "#7d848d"); gb.addColorStop(0.4, "#e7ebef"); gb.addColorStop(1, "#6c727b");
      g.fillStyle = gb; g.strokeStyle = TINTA; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(bx - 26, by); g.lineTo(bx - 28, by - 46); g.lineTo(bx - 26, by - 92); g.lineTo(bx + 26, by - 92); g.lineTo(bx + 28, by - 46); g.lineTo(bx + 26, by); g.closePath(); g.fill(); g.stroke();
      g.lineWidth = 2; for (const yy of [by - 20, by - 72]) { g.beginPath(); g.moveTo(bx - 27, yy); g.lineTo(bx + 27, yy); g.stroke(); }
      g.fillStyle = "#3b3f47"; g.fillRect(bx - 6, by - 100, 12, 8); g.strokeRect(bx - 6, by - 100, 12, 8);
    }
    // puerta batiente con ojo de buey
    const px = 640, pw = 120, ptop = 150;
    g.fillStyle = "#7a4a2c"; g.fillRect(px - 8, ptop - 8, pw + 16, PARED - ptop + 2);
    g.fillStyle = "#a8683e"; g.fillRect(px, ptop, pw, PARED - ptop - 6); g.strokeStyle = TINTA; g.lineWidth = 3; g.strokeRect(px, ptop, pw, PARED - ptop - 6); g.strokeRect(px - 8, ptop - 8, pw + 16, PARED - ptop + 2);
    g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(px + 6, ptop + 6, 8, PARED - ptop - 20);
    g.fillStyle = "#c9c2b0"; g.fillRect(px + 10, PARED - 70, pw - 20, 34); g.strokeRect(px + 10, PARED - 70, pw - 20, 34);
    const oj = { x: px + pw / 2, y: ptop + 70 };
    g.fillStyle = "#b8bec7"; g.beginPath(); g.arc(oj.x, oj.y, 30, 0, Math.PI * 2); g.fill(); g.stroke();
    const vj = g.createRadialGradient(oj.x - 8, oj.y - 8, 2, oj.x, oj.y, 24); vj.addColorStop(0, "#fff6d8"); vj.addColorStop(1, "#f1b96a");
    g.fillStyle = vj; g.beginPath(); g.arc(oj.x, oj.y, 22, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 3; g.beginPath(); g.arc(oj.x, oj.y, 16, -2.4, -1.5); g.stroke();
    // reloj de pared (sin números)
    const rl = { x: 470, y: 110 };
    g.fillStyle = "#f6f1e6"; g.strokeStyle = TINTA; g.lineWidth = 5; g.beginPath(); g.arc(rl.x, rl.y, 34, 0, Math.PI * 2); g.fill(); g.stroke();
    g.lineWidth = 2.5; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, r0 = i % 3 ? 27 : 24; g.beginPath(); g.moveTo(rl.x + Math.cos(a) * r0, rl.y + Math.sin(a) * r0); g.lineTo(rl.x + Math.cos(a) * 30, rl.y + Math.sin(a) * 30); g.stroke(); }
    // cartel de la jarra (sin letras)
    const cx0 = 340, cy0 = 170;
    g.fillStyle = "#f3e7cc"; g.fillRect(cx0, cy0, 96, 120); g.strokeStyle = TINTA; g.lineWidth = 3; g.strokeRect(cx0, cy0, 96, 120);
    g.fillStyle = "#c9493b"; g.fillRect(cx0 + 8, cy0 + 8, 80, 104);
    g.fillStyle = "#f2b733"; g.beginPath(); g.moveTo(cx0 + 28, cy0 + 40); g.lineTo(cx0 + 64, cy0 + 40); g.lineTo(cx0 + 62, cy0 + 96); g.lineTo(cx0 + 30, cy0 + 96); g.closePath(); g.fill(); g.lineWidth = 2.5; g.stroke();
    g.fillStyle = "#fffaf0"; g.beginPath(); g.ellipse(cx0 + 46, cy0 + 40, 22, 9, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(cx0 + 36, cy0 + 33, 9, 7, 0, 0, Math.PI * 2); g.fill(); g.stroke(); g.beginPath(); g.ellipse(cx0 + 54, cy0 + 32, 10, 8, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.lineWidth = 5; g.strokeStyle = "#f2b733"; g.beginPath(); g.arc(cx0 + 66, cy0 + 66, 12, -1.3, 1.3); g.stroke(); g.lineWidth = 2; g.strokeStyle = TINTA; g.beginPath(); g.arc(cx0 + 66, cy0 + 66, 15, -1.3, 1.3); g.stroke();
    // suelo de cemento pulido
    const gs = g.createLinearGradient(0, PARED, 0, H + 50); gs.addColorStop(0, "#7c8086"); gs.addColorStop(1, "#a3a7ad");
    g.fillStyle = gs; g.fillRect(-60, PARED, W + 120, H + 50 - PARED);
    // juntas de dilatación en perspectiva
    g.strokeStyle = "rgba(40,44,50,0.35)"; g.lineWidth = 2;
    for (let i = -6; i <= 8; i++) { const xa = 512 + i * 150, xb = 512 + i * 230; g.beginPath(); g.moveTo(xa, PARED); g.lineTo(xb, H + 50); g.stroke(); }
    g.beginPath(); g.moveTo(-60, 492); g.lineTo(W + 60, 492); g.stroke();
    // brillos del fluorescente en el suelo
    for (const fx of [280, 760]) { const rf = g.createRadialGradient(fx, 500, 10, fx, 500, 220); rf.addColorStop(0, "rgba(255,255,240,0.38)"); rf.addColorStop(1, "rgba(255,255,240,0)");
      g.fillStyle = rf; g.beginPath(); g.ellipse(fx, 500, 230, 36, 0, 0, Math.PI * 2); g.fill(); }
    // la meta: cinta a cuadros pegada en el suelo
    const n = 9;
    for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) {
      const ya = PARED + (H + 50 - PARED) * i / n, yb = PARED + (H + 50 - PARED) * (i + 1) / n;
      const xa = lerp(META.x0, META.x1, (ya - PARED) / (H + 50 - PARED)), xb = lerp(META.x0, META.x1, (yb - PARED) / (H + 50 - PARED));
      const wa = lerp(10, 20, (ya - PARED) / (H + 50 - PARED)), wb = lerp(10, 20, (yb - PARED) / (H + 50 - PARED));
      g.fillStyle = (i + j) % 2 ? "#f4f1ea" : "#16161a";
      g.beginPath(); g.moveTo(xa + j * wa, ya); g.lineTo(xa + (j + 1) * wa, ya); g.lineTo(xb + (j + 1) * wb, yb); g.lineTo(xb + j * wb, yb); g.closePath(); g.fill();
    }
    // sumidero
    g.fillStyle = "#4b4f56"; g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.ellipse(600, 585, 26, 7, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = "#2a2d32"; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(600 + i * 8, 580); g.lineTo(600 + i * 8, 590); g.stroke(); }
    // fluorescentes colgados
    for (const fx of [280, 760]) {
      g.strokeStyle = "#2a2a2e"; g.lineWidth = 2; g.beginPath(); g.moveTo(fx - 70, -50); g.lineTo(fx - 70, 18); g.moveTo(fx + 70, -50); g.lineTo(fx + 70, 18); g.stroke();
      g.fillStyle = "#d9dce0"; g.fillRect(fx - 100, 16, 200, 12); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(fx - 100, 16, 200, 12);
      g.fillStyle = "#fbfff4"; g.fillRect(fx - 94, 28, 188, 7); g.strokeRect(fx - 94, 28, 188, 7);
      const hz = g.createRadialGradient(fx, 34, 4, fx, 34, 260); hz.addColorStop(0, "rgba(255,255,235,0.35)"); hz.addColorStop(1, "rgba(255,255,235,0)");
      g.fillStyle = hz; g.beginPath(); g.ellipse(fx, 60, 300, 160, 0, 0, Math.PI * 2); g.fill();
    }
    // viñeta
    const v = g.createRadialGradient(512, 320, 280, 512, 320, 720); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(40,20,0,0.42)");
    g.fillStyle = v; g.fillRect(-60, -50, W + 120, H + 100);
    return c;
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  function estrellaPuntas(g, x, y, r, n, rot, ri) {
    g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr = i % 2 ? r * ri : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  // remolinos alrededor de la silla que gira
  function lineasGiro(g, t, cx) {
    const k = dentro(t, T.giro0 + 0.2, T.giro0 + 0.5, T.giro1 - 0.6, T.giro1 - 0.15); if (k <= 0.01) return;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.85 * k})`; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const y = SUELO_G - 70 - i * 95, r = 82 + 10 * i, a0 = t * 15 + i * 1.7;
      g.beginPath(); g.ellipse(cx + 10, y, r, 14, 0, a0, a0 + 2.2); g.stroke(); }
    g.restore();
  }
  function estrellitas(g, t, pG, aPant) {
    const k = dentro(t, T.giro1 - 0.15, T.giro1 + 0.15, T.mareo1, T.sacude1); if (k <= 0.01) return;
    const c = aPant(G.cabeza(pG).a({ x: 790, y: 330 }));
    const pts = [];
    for (let i = 0; i < 5; i++) { const a = t * 4.2 + i * Math.PI * 2 / 5; pts.push({ a, x: c.x + Math.cos(a) * 56, y: c.y - 30 + Math.sin(a) * 13, z: Math.sin(a) }); }
    pts.sort((u, v) => u.z - v.z);
    g.save();
    for (const q of pts) { const r = (9 + 3 * q.z) * k;
      estrellaPuntas(g, q.x, q.y, r, 5, t * 3 + q.a, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke(); }
    g.restore();
  }
  // estela de velocidad (líneas detrás de la silla)
  function estela(g, t, x, y0, alto, sentido, k) {
    if (k <= 0.01) return;
    g.save(); g.lineCap = "round"; g.strokeStyle = `rgba(255,255,255,${0.75 * k})`;
    for (let i = 0; i < 5; i++) { const y = y0 - alto * (0.12 + 0.19 * i), L = (40 + 50 * hash(i + 40)) * k, d = 18 + 22 * hash(i + 41) + 10 * Math.sin(t * 20 + i);
      g.lineWidth = 3 - 0.3 * i; g.beginPath(); g.moveTo(x - sentido * d, y); g.lineTo(x - sentido * (d + L), y); g.stroke(); }
    g.restore();
  }
  // polvo: nubecillas
  function nube(g, x, y, r, a) {
    if (a <= 0.01 || r <= 0.5) return;
    g.save(); g.globalAlpha = a; g.fillStyle = "#e9dcc2"; g.strokeStyle = "rgba(120,95,60,0.55)"; g.lineWidth = 1.5;
    g.beginPath(); for (let i = 0; i < 5; i++) { const an = i * Math.PI * 2 / 5; g.moveTo(x + Math.cos(an) * r * 0.5 + r * 0.6, y + Math.sin(an) * r * 0.4); g.arc(x + Math.cos(an) * r * 0.5, y + Math.sin(an) * r * 0.4, r * 0.6, 0, Math.PI * 2); }
    g.fill(); g.stroke(); g.restore();
  }
  function polvoChoque(g, t) {
    const u = fase(t, T.choque, T.choque + 1.5); if (u <= 0 || u >= 1) return;
    for (let i = 0; i < 12; i++) {
      const a = -Math.PI * (0.05 + 0.9 * hash(i + 300)), d = (40 + 110 * hash(i + 301)) * salida(u), r = (14 + 16 * hash(i + 302)) * (0.5 + u);
      nube(g, 250 + Math.cos(a) * d * 1.3, 470 + Math.sin(a) * d * 0.9 + 40 * u * hash(i + 303), r, 0.85 * (1 - u) * (1 - u));
    }
  }
  function polvoEmpuje(g, t, x) {
    const u = fase(t, T.empuja, T.empuja + 0.6); if (u <= 0 || u >= 1) return;
    for (let i = 0; i < 4; i++) nube(g, x + 100 + 30 * i * salida(u), SUELO_G - 6 - 8 * hash(i + 60), (8 + 6 * i) * (0.4 + u), 0.7 * (1 - u));
  }
  function impacto(g, t, x, y) {
    const k = fase(t, T.choque, T.choque + 0.3); if (k <= 0 || k >= 1) return;
    const s = Math.sin(Math.PI * Math.min(1, k * 1.6)), r = 70 * salida(k);
    g.save(); g.globalAlpha = 1 - k;
    estrellaPuntas(g, x, y, r, 9, 0.3, 0.55); g.fillStyle = "#fff6c8"; g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.2, r0 = r * 1.05 + 6, r1 = r0 + 26 * s; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // sorbo final con el vaso vacío: el vaso tiembla y salen rayitas de ruido a los lados
  function sorbido(g, t, pD) {
    const k = dentro(t, 12.05, 12.15, 12.5, 12.65); if (k <= 0.01) return;
    const v = aPantD(pD.manoCerca);
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 2.2; g.lineCap = "round";
    for (const lado of [-1, 1]) for (let i = 0; i < 3; i++) {
      const ph = (t * 5 + i / 3 + (lado > 0 ? 0.5 : 0)) % 1, d = 20 + 10 * ph;
      g.globalAlpha = k * Math.sin(Math.PI * ph);
      g.beginPath(); g.moveTo(v.x + lado * d, v.y - 12 + i * 9); g.lineTo(v.x + lado * (d + 9), v.y - 15 + i * 9); g.stroke();
    }
    g.restore();
  }
  // polvillo del pataleo loco
  function pataleoPolvo(g, t, x) {
    const k = dentro(t, T.sale, T.sale + 0.06, T.giro0, T.giro0 + 0.2); if (k <= 0.01) return;
    for (let i = 0; i < 3; i++) { const ph = (t * 4 + i / 3) % 1; nube(g, x + 85 + 25 * i + 20 * ph, SUELO_G - 6 - 14 * ph, 6 + 8 * ph, 0.6 * k * (1 - ph)); }
  }

  /* ---------- pantalla: puntos de la hoja de cada uno, con la silla girada o volcada ---------- */
  function aPantSilla(rig, p, s) {
    const cth = Math.cos(s.th || 0);
    return q => {
      let r = rig.aPantalla(p, q);
      r = { x: s.x + (r.x - s.x) * cth, y: r.y };
      if (s.vuelco) { const k = s.k, px = s.x - 52 * k, py = s.suelo, o = G.rotP({ x: r.x - px, y: r.y - py }, s.vuelco); r = { x: px + o.x, y: py + o.y }; }
      return r;
    };
  }
  let aPantD = null;

  /* ---------- cámara ---------- */
  function camara(t) {
    const fin = tramo(t, 8.9, 12.2);
    return { k: 1 + 0.07 * fin, x: 512 - 70 * fin, y: 300 + 30 * fin };
  }

  function poses(t) { return { g: poseG(t), d: poseD(t) }; }
  const sillaG = t => ({ x: xG(t), suelo: SUELO_G, th: thG(t), vuelco: vuelcoG(t), color: COL_G, k: kG });
  const sillaD = t => ({ x: xD(t), suelo: SUELO_D, th: thD(t), vuelco: 0, color: COL_D, k: kD });
  // ruedas: giran según lo que avanza la silla; la delantera de Guillermo sigue girando en el aire tras el choque
  function ruedasG(t) {
    const x = xG(t), a = -(x - XG0) / (R_RUEDA * kG);
    if (t < T.choque) return { a, delantera: { a: 0.5, zumba: 0 } };
    const tau = t - T.choque, w0 = 26, kk = 0.22;
    const extra = -(w0 / kk) * (1 - Math.exp(-kk * tau));
    return { a, delantera: { a: 0.5 + extra * suave(fase(tau, 0, 0.15)), zumba: clamp(Math.exp(-kk * tau) * 1.2) * tramo(tau, 0.1, 0.4) } };
  }
  const ruedasD = t => ({ a: -(xD(t) - XD0) / (R_RUEDA * kD), delantera: null });

  class SillasConRuedas extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !DV.listo()) return;
      if (!fondo) fondo = creaFondo();
      const { g: pG, d: pD } = poses(t);
      const sG = sillaG(t), sD = sillaD(t);
      aPantD = aPantSilla(DV, pD, sD);
      const aPantG = aPantSilla(G, pG, sG);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = t >= T.choque ? 7 * Math.exp(-(t - T.choque) * 6) * suave(fase(t, T.choque, T.choque + 0.03)) : 0;
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -60, -50);
      // sombras en el suelo
      g.save(); g.fillStyle = "rgba(30,30,40,0.28)";
      g.beginPath(); g.ellipse(sD.x + 4, SUELO_D + 1, 66 * kD, 8, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(sG.x + 4, SUELO_G + 1, 66, 9, 0, 0, Math.PI * 2); g.fill();
      g.restore();
      // Deivi (carril de atrás)
      estela(g, t, sD.x - 60 * kD, SUELO_D - 40, 240, 1, 0.8 * dentro(t, T.sale + 0.4, T.sale + 0.8, T.frenaD - 0.3, T.frenaD + 0.1));
      dibUnidad(g, t, DV, pD, sD, kD, ruedasD(t));
      // Guillermo (carril de delante)
      pataleoPolvo(g, t, sG.x);
      estela(g, t, sG.x + 70, SUELO_G - 30, 300, -1, dentro(t, T.empuja + 0.06, T.despega + 0.05, T.choque - 0.02, T.choque + 0.02));
      dibUnidad(g, t, G, pG, sG, kG, ruedasG(t));
      lineasGiro(g, t, sG.x);
      polvoEmpuje(g, t, sG.x);
      // la pila de cajas (delante de todo)
      dibCajas(g, t);
      impacto(g, t, 236, 410);
      polvoChoque(g, t);
      estrellitas(g, t, pG, aPantG);
      sorbido(g, t, pD);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00065", nombre: "Guillermo y Deivi · Las sillas con ruedas", crear: () => new SillasConRuedas() });
  window.__A2D_00065 = { pose: poses, poseG, poseD, T, DUR, xD, xG };
})();
