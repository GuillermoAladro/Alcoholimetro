"use strict";
/* 00033 · Guillermo y Ander · El duelo de miradas
 *
 * Negro → cantina al atardecer, con el sol poniéndose en el ventanal entre los dos. En una mesa
 * alta, Guillermo (a la izquierda) entorna los ojos y señala a Ander con el dedo, retándole.
 * Ander (a la derecha, mirándole, con un palillo en la boca) se encoge de hombros.
 * Los dos apoyan los puños en la mesa, se inclinan cara a cara y empieza el duelo: bandas negras de
 * cine, primer plano de los ojos de uno y del otro, y una bola de paja que cruza el desierto por la
 * ventana → a Guillermo se le secan los ojos: se le ponen rojos, le salen venitas y le tiemblan los
 * párpados, suda y se le saltan las lágrimas. Ander, impasible, mueve el palillo → una mosca
 * revolotea y se le posa a Guillermo en la nariz; él se pone bizco mirándola, hincha los mofletes,
 * tiembla… y parpadea → la mosca vuela a la nariz de Ander, que ni se inmuta y levanta una ceja muy
 * despacio; la mosca se va → Guillermo, horrorizado, mira a cámara y se da un cabezazo contra la
 * mesa y se queda ahí, con estrellitas, levantando una mano sin fuerzas para rendirse; Ander por fin
 * parpadea, satisfecho, mira a cámara y guiña un ojo → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto. Los ojos rojos, las lágrimas y la mirada bizca de
 * Guillermo se dibujan en su capa de la cara (capaCabeza) repitiendo su ojo del montaje; el palillo
 * de Ander va en la suya.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, AN = Ander;
  const S = 0.31, SUELO = 560;
  const XG = 352, XA = 688;                    // pelvis de cada uno (pantalla)
  const TX = 516, TY = 318, GOLPE_X = TX - 62;                    // centro de la mesa y altura del tablero (pantalla)
  const DUR = 13.95;
  const T = {
    mira: 0.35, v0: 0.62, v1: 0.95, apunta0: 1.22, apunta1: 1.45, apoya0: 1.62, apoya1: 2.1,
    encoge0: 0.95, encoge1: 1.5, apoyaA0: 1.55, apoyaA1: 2.05,
    lb0: 1.95, lb1: 2.45, duelo: 2.2,
    zg0: 2.5, zg1: 2.85, za0: 3.3, za1: 3.58, dos0: 4.15, dos1: 4.6,
    seca0: 4.6, seca1: 7.0, mosca0: 5.25, posa: 7.0, bizco0: 7.05, bizco1: 7.35, cg0: 7.8, cg1: 8.35,
    parpadea: 8.55, abre: 8.98, despega: 8.62, posaA: 9.22, ceja0: 9.6, ceja1: 10.2, vuela: 10.25,
    lbFin0: 10.25, lbFin1: 10.7, horror: 9.0, camaraG: 10.5, carga: 10.88, golpe: 11.2,
    palma1: 11.9, palma2: 12.3, parpA0: 11.7, parpA1: 12.15, camaraA: 12.35, guino: 12.65, fin: 13.25
  };

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const R_M = G.MUNECA_R * G.JK;
  const DEDOS0 = { pulgar: 0, indice: 0, medio: 0, anular: 0, menique: 0 };
  // Mezcla de dos manos (posición en la hoja, giro, muñeca, puño y dedos).
  function mezclaMano(a, b, k) {
    if (k <= 0) return a; if (k >= 1) return b;
    const d = {}; for (const n in DEDOS0) d[n] = lerp(a.dedos[n], b.dedos[n], k);
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), ang: lerp(a.ang, b.ang, k), mu: lerp(a.mu, b.mu, k), puno: lerp(a.puno, b.puno, k),
      dobla: k < 0.5 ? a.dobla : b.dobla, dedos: d };
  }
  // Guion de una mano: cada tramo mezcla hacia un objetivo calculado en este fotograma.
  function guionMano(lista, objetivos, p, t) {
    let m = objetivos[lista[0][2]](p, t);
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; m = mezclaMano(m, objetivos[nom](p, t), (f || suave)(fase(t, t0, t1))); }
    return m;
  }
  const mano = (x, y, o) => Object.assign({ x, y, ang: 0, mu: -1.75, puno: 1, dobla: -1, dedos: DEDOS0 }, o);

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: -1, ci: -1, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, esp: 0, mof: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    const cd = e.cd >= 0 ? e.cd : e.c, ci = e.ci >= 0 ? e.ci : e.c;
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: Math.max(cd, parp), i: Math.max(ci, parp), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista, d = 0.15) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* =====================================================================================
   * GUILLERMO (a la izquierda, mira a la derecha)
   * ===================================================================================== */
  const CARAS_G = {
    inicio: E({ orig: 0, sonr: 0.4, sd: 6, gd: 0.08, si: 4, gi: 0.05 }),
    chulo: E({ mx: 0.9, my: 0.05, c: 0.2, sd: 4, gd: 0.04, si: -4, gi: -0.06, orig: 0, sonr: 0.55, ancho: 0.95 }),
    vigila: E({ mx: 0.95, my: 0.1, c: 0.42, sd: -12, gd: -0.24, si: -12, gi: -0.24, orig: 0, sonr: -0.1, ancho: 0.85 }),
    duelo: E({ mx: 0.95, my: 0.05, c: 0, iris: 0.88, sd: -9, gd: -0.2, si: -9, gi: -0.2, orig: 0, sonr: -0.15, ancho: 0.8 }),
    seco: E({ mx: 0.95, my: 0.05, c: 0, iris: 0.76, sd: 4, gd: -0.08, si: 4, gi: -0.08, orig: 0, sonr: -0.4, ancho: 0.75, abre: 2 }),
    aguanta: E({ mx: 0.95, my: 0.05, c: 0, iris: 0.72, sd: 10, gd: 0.05, si: 10, gi: 0.05, orig: 0, sonr: -0.35, ancho: 0.55, mof: 0.55 }),
    parpadea: E({ mx: 0.6, my: 0, c: 1, z: 1, sd: -8, gd: -0.22, si: -8, gi: -0.22, orig: 0, sonr: -0.3, ancho: 0.8, abre: 4 }),
    alivio: E({ mx: 0.9, my: 0.05, c: 0.25, sd: 6, gd: 0.1, si: 6, gi: 0.1, orig: 0, sonr: 0.2, ancho: 0.9, abre: 6 }),
    horror: E({ mx: 0.95, my: -0.05, iris: 0.7, sd: 26, gd: 0.2, si: 26, gi: 0.2, orig: 0, sonr: -0.3, abre: 34, ancho: 0.7, lengua: 0.2 }),
    camara: E({ mx: -0.85, my: -0.1, iris: 0.75, sd: 24, gd: 0.25, si: 24, gi: 0.25, orig: 0, sonr: -0.55, abre: 20, ancho: 0.95, lengua: 0.1 }),
    carga: E({ mx: 0.4, my: 0.6, c: 1, z: 0.8, sd: -10, gd: -0.25, si: -10, gi: -0.25, orig: 0, sonr: -0.4, ancho: 0.8 }),
    ko: E({ mx: 0, my: 0.3, c: 1, z: 0.4, sd: 8, gd: 0.15, si: 8, gi: 0.15, orig: 0, sonr: -0.45, abre: 6, ancho: 0.8 })
  };
  const GUION_CARA_G = [
    [T.mira, T.mira + 0.25, "chulo"], [T.v0, T.v0 + 0.2, "vigila"],
    [T.apoya1 - 0.2, T.duelo + 0.1, "duelo"], [T.seca0, 6.6, "seco"], [7.5, 7.9, "aguanta"],
    [T.parpadea, T.parpadea + 0.07, "parpadea"], [T.abre - 0.05, T.abre + 0.1, "alivio"], [T.horror + 0.12, T.horror + 0.3, "horror"],
    [T.camaraG, T.camaraG + 0.2, "camara"], [T.carga, T.carga + 0.15, "carga"], [T.golpe + 0.05, T.golpe + 0.3, "ko"]
  ];
  // postura: dx de pelvis (px), pel (hoja, + abajo), torso, cab (giro de cabeza), hdx/hdy (cabeza, hoja)
  const P0G = { dx: 0, pel: 0, torso: 0, cab: 0, hdx: 0, hdy: 0 };
  const CG = o => Object.assign({}, P0G, o);
  const CUERPOS_G = {
    bols: CG({}),
    vigila: CG({ dx: 4, torso: 0.04, cab: -0.04 }),
    apunta: CG({ dx: 8, torso: 0.07, cab: 0.02 }),
    apoya: CG({ dx: 6, pel: 22, torso: 0.2, cab: 0.06 }),
    duelo: CG({ dx: 12, pel: 30, torso: 0.27, cab: 0.08, hdx: 8 }),
    tenso: CG({ dx: 14, pel: 34, torso: 0.3, cab: 0.06, hdx: 12 }),
    alivio: CG({ dx: 8, pel: 28, torso: 0.24, cab: -0.02, hdx: 4 }),
    horror: CG({ dx: 4, pel: 26, torso: 0.18, cab: -0.1, hdx: 0 }),
    carga: CG({ dx: 0, pel: 24, torso: 0.1, cab: -0.22, hdx: 0 }),
    golpe: CG({ dx: -4, pel: 70, torso: 0.86, cab: 0.82, hdx: 0, hdy: 0 })
  };
  const GUION_CUERPO_G = [
    [T.v0, T.v1, "apunta"], [T.apoya0, T.apoya1, "apoya"], [T.apoya1, T.duelo + 0.3, "duelo"],
    [6.2, 7.6, "tenso"], [T.parpadea + 0.05, T.abre, "alivio"], [T.horror + 0.1, T.horror + 0.4, "horror"],
    [T.carga, T.golpe - 0.12, "carga"], [T.golpe - 0.12, T.golpe, "golpe", entrada]
  ];
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };

  // ojos de Guillermo (copiados de su montaje para repetirlos en la capa de la cara)
  function remuestrea(pts, n) {
    const P = pts.map(q => ({ x: q[0], y: q[1] })), d = [0];
    for (let i = 1; i < P.length; i++) d.push(d[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
    const out = [], L = d[d.length - 1];
    for (let k = 0; k < n; k++) { const s = L * k / (n - 1); let i = 1; while (i < d.length - 1 && d[i] < s) i++;
      const f = (s - d[i - 1]) / Math.max(1e-6, d[i] - d[i - 1]); out.push({ x: lerp(P[i - 1].x, P[i].x, f), y: lerp(P[i - 1].y, P[i].y, f) }); }
    return out;
  }
  const PZG = G.A.datos.piezas;
  const OJOS_G = {
    d: { arriba: [[733, 551], [737, 541], [748, 541], [762, 545], [776, 550], [790, 556], [803, 561], [809, 566]],
         abajo: [[733, 556], [737, 566], [748, 573], [762, 577], [778, 583], [795, 589], [808, 592]],
         poli: PZG.cabeza.ojos.derecho, c: { x: 771, y: 563 }, r: 17.5, rx: 25, ry: 9 },
    i: { arriba: [[866, 603], [872, 597], [885, 598], [900, 602], [913, 606], [921, 611]],
         abajo: [[866, 608], [868, 624], [880, 630], [895, 635], [910, 638], [921, 637]],
         poli: PZG.cabeza.ojos.izquierdo, c: { x: 894, y: 617 }, r: 15, rx: 19, ry: 7 }
  };
  for (const o of Object.values(OJOS_G)) { o.U = remuestrea(o.arriba, 14); o.D = remuestrea(o.abajo, 14); }
  const NARIZ_G = { x: 876, y: 668 }, OJOS_G_MEDIO = { x: 832, y: 592 }, FRENTE_G = { x: 790, y: 455 };

  /* =====================================================================================
   * ANDER (a la derecha, en espejo: mira a la izquierda)
   * ===================================================================================== */
  const CARAS_A = {
    inicio: E({ mx: 0.9, my: 0.05, c: 0.3, orig: 0, sonr: 0.3, ancho: 0.95, sd: 2, si: 2 }),
    encoge: E({ mx: 0.8, my: -0.1, c: 0.25, sd: 12, gd: 0.08, si: 12, gi: 0.08, orig: 0, sonr: 0.4, ancho: 0.9 }),
    duelo: E({ mx: 0.95, my: 0.05, c: 0.22, sd: -3, gd: -0.04, si: -3, gi: -0.04, orig: 0, sonr: 0.22, ancho: 0.9 }),
    ceja: E({ mx: 0.95, my: 0.05, c: 0.22, sd: 48, gd: -0.22, si: -6, gi: -0.08, orig: 0, sonr: 0.32, ancho: 0.95 }),
    mira: E({ mx: 0.7, my: 0.5, c: 0.3, sd: 14, gd: -0.06, si: -2, gi: -0.04, orig: 0, sonr: 0.35, ancho: 0.95 }),
    satisfecho: E({ mx: 0.7, my: 0.4, c: 0.35, sd: 4, gd: 0.02, si: 2, gi: 0.02, orig: 0, sonr: 0.6, ancho: 1 }),
    camara: E({ mx: -0.85, my: -0.05, c: 0.25, sd: 6, gd: 0.04, si: 10, gi: 0.08, orig: 0, sonr: 0.7, ancho: 1 }),
    guino: E({ mx: -0.85, my: -0.05, c: 0, cd: 1, ci: 0, h: 1, sd: 2, gd: 0.02, si: 14, gi: 0.12, orig: 0, sonr: 0.85, ancho: 1, abre: 3 })
  };
  const GUION_CARA_A = [
    [T.encoge0, T.encoge0 + 0.2, "encoge"], [T.encoge1, T.encoge1 + 0.2, "inicio"], [T.apoyaA1 - 0.2, T.duelo + 0.1, "duelo"],
    [T.ceja0, T.ceja1, "ceja"], [T.golpe + 0.15, T.golpe + 0.5, "mira"], [T.parpA1, T.parpA1 + 0.2, "satisfecho"],
    [T.camaraA, T.camaraA + 0.2, "camara"], [T.guino, T.guino + 0.12, "guino"], [T.guino + 0.55, T.guino + 0.7, "camara"]
  ];
  const P0A = { dx: 0, pel: 0, torso: 0, cab: 0, enc: 0 };
  const CA = o => Object.assign({}, P0A, o);
  const CUERPOS_A = {
    bols: CA({ torso: -0.02 }),
    encoge: CA({ torso: -0.02, enc: 1, cab: 0.05 }),
    apoya: CA({ dx: -6, pel: 20, torso: 0.18, cab: 0.04 }),
    duelo: CA({ dx: -10, pel: 26, torso: 0.24, cab: 0.06 }),
    erguido: CA({ dx: -2, pel: 8, torso: 0.06, cab: 0.0 })
  };
  const GUION_CUERPO_A = [
    [T.encoge0, T.encoge0 + 0.2, "encoge"], [T.encoge0 + 0.3, T.encoge1, "bols"], [T.apoyaA0, T.apoyaA1, "apoya"],
    [T.apoyaA1, T.duelo + 0.3, "duelo"], [10.35, 10.75, "erguido"]
  ];
  const TOB_A = { cerca: AN.SUELO - AN.TOBILLO_ALTO, lejos: AN.SUELO - AN.TOBILLO_ALTO - 10 };
  const NARIZ_A = { x: 897, y: 626 }, OJOS_A_MEDIO = { x: 880, y: 535 };

  /* ---------- poses ---------- */
  const pocketG = (p, lado) => { const Tr = G.tronco(p);
    const b = Tr(lado === "cerca" ? { x: 131, y: 652 } : { x: 372, y: 648 });
    const o = G.rotP({ x: Math.cos(-1.75) * R_M, y: Math.sin(-1.75) * R_M }, 0);
    return mano(b.x - o.x, b.y - o.y, { puno: 0, mu: -1.75 }); };
  const OBJ_G = {
    bolsC: p => pocketG(p, "cerca"),
    bolsL: p => pocketG(p, "lejos"),
    mesaC: p => { const q = G.aHoja(p, { x: TX - 72, y: TY - 7 }); return mano(q.x, q.y, { mu: -2.05, ang: 0.05 }); },
    mesaL: p => { const q = G.aHoja(p, { x: TX - 38, y: TY - 10 }); return mano(q.x, q.y, { mu: -2.1, ang: 0.05 }); },
    // señala a Ander con el índice (el dedo tiembla un poco: «tú y yo»)
    apunta: p => { const h = G.tronco(p)(G.HOMBRO); return mano(h.x + 272, h.y - 92 + 6 * Math.sin(p.tt * 9) * campana(p.tt, T.v1, T.apoya0), { mu: Math.PI - 0.36, ang: 0, dedos: { pulgar: 0.1, indice: 1, medio: 0, anular: 0, menique: 0 } }); },
    // tras el cabezazo los brazos cuelgan; luego da dos palmaditas en el tablero (se rinde)
    cuelgaC: p => { const q = G.aHoja(p, { x: GOLPE_X - 70, y: TY - 6 }); return mano(q.x, q.y, { mu: -2.1, ang: 0.1, dedos: { pulgar: 0.5, indice: 0.7, medio: 0.7, anular: 0.7, menique: 0.7 } }); },
    cuelgaL: p => { const h = G.tronco(p)(G.HOMBRO); return mano(h.x + 30, h.y + 290, { mu: -1.62, ang: 0.15, puno: 1 }); },
    // se rinde: levanta la mano sin fuerzas y la agita (bandera blanca)
    palma: (p, t) => { const k = tramo(t, T.palma1 - 0.35, T.palma1) * (1 - tramo(t, 12.7, 13.05)), w = Math.sin((t - T.palma1) * 9) * tramo(t, T.palma1 - 0.1, T.palma1 + 0.1);
      const q = G.aHoja(p, { x: 404 + 10 * w, y: 236 + 22 * (1 - k) }); return mano(q.x, q.y, { mu: -1.5 + 0.25 * w, ang: 0, dedos: { pulgar: 0.7, indice: 0.85, medio: 0.85, anular: 0.85, menique: 0.85 } }); }
  };
  const MANO_C_G = [[0, 0, "bolsC"], [T.apoya0, T.apoya1, "mesaC"], [T.golpe - 0.13, T.golpe + 0.05, "cuelgaC"], [T.golpe + 0.4, T.golpe + 0.65, "palma"]];
  const MANO_L_G = [[0, 0, "bolsL"], [T.v0 - 0.05, T.v1, "apunta"], [T.apoya0 + 0.08, T.apoya1, "mesaL"],
                    [T.golpe - 0.13, T.golpe + 0.08, "cuelgaL"]];

  function poseG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "bols", t);
    const respira = Math.sin(t * 2.3);
    const tension = tramo(t, 6.0, 7.4) * (1 - tramo(t, T.parpadea, T.parpadea + 0.1));
    const tiembla = tension * (1 + 2.5 * tramo(t, 7.6, 8.4));
    const golpe = t >= T.golpe ? Math.exp(-(t - T.golpe) * 9) * suave(fase(t, T.golpe, T.golpe + 0.03)) : 0;
    const p = {
      x: XG + b.dx + ruido(t * 40) * tiembla * 0.5, suelo: SUELO, s: S, tirasLimpias: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 * (1 - tramo(t, 7.4, 7.6) + tramo(t, 8.5, 8.7)) },
      torso: b.torso + ruido(t * 29 + 1) * tiembla * 0.006, torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.012 * tramo(t, 7.4, 7.7) * (1 - tramo(t, 8.5, 8.7)) },
      piernas: {}, cabeza: { ang: b.cab + ruido(t * 33 + 7) * tiembla * 0.012, dx: b.hdx, dy: b.hdy - 10 * golpe, esc: { x: 1 + 0.06 * golpe, y: 1 - 0.08 * golpe } }
    };
    for (const lado of ["cerca", "lejos"]) {
      const fx = lado === "cerca" ? XG - 22 : XG + 20;
      p.piernas[lado] = { tob: { x: G.PELVIS.x + (fx - p.x) / S, y: TOB_G[lado] }, ang: 0 };
    }
    // cabezazo: la frente acaba justo sobre el tablero
    const kg = entrada(fase(t, T.golpe - 0.12, T.golpe));
    if (kg > 0) {
      const f = G.aPantalla(p, G.cabeza(p).a(FRENTE_G));
      p.cabeza.dx += kg * clamp((GOLPE_X - f.x) / S, -110, 110); p.cabeza.dy += kg * clamp((TY - 5 - f.y) / S, -110, 110);
    }
    // cara
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    // párpados que tiemblan del esfuerzo
    const tic = tramo(t, 6.1, 7.0) * (1 - tramo(t, T.parpadea - 0.05, T.parpadea));
    ex.c = Math.max(ex.c, tic * 0.09 * (0.5 + 0.5 * Math.sin(t * 31)) * (0.6 + 0.4 * Math.sin(t * 7.3)));
    p.cara = cara(ex, parpadeo(t, [0.48, 1.32]));
    p.sudor = tramo(t, 5.7, 6.7) * (1 - tramo(t, 10.4, 10.7)) + 0.6 * tramo(t, T.horror + 0.2, T.horror + 0.5) * (1 - tramo(t, 10.4, 10.7));
    p.rojo = 0.0;
    // capa de los ojos (rojos, venas, lágrimas, bizco)
    const rojo = 0.95 * tramo(t, T.seca0, T.seca1) * (1 - 0.6 * tramo(t, T.abre, T.abre + 1.2));
    const est = {
      on: tramo(t, T.duelo - 0.1, T.duelo + 0.25) * (1 - tramo(t, 10.4, 10.65)),
      rojo, venas: tramo(t, 5.5, 7.2) * (1 - 0.7 * tramo(t, T.abre, T.abre + 1.2)),
      llanto: tramo(t, 6.3, 7.1) * (1 - tramo(t, 9.6, 10.2)),
      bizco: tramo(t, T.bizco0, T.bizco1) * (1 - tramo(t, T.parpadea - 0.04, T.parpadea + 0.04)),
      e: ex, c: p.cara.ojos
    };
    p.capaCabeza = (g, tt) => capaOjosG(g, tt, est);
    // manos
    p.tt = t;
    p.manoCerca = guionMano(MANO_C_G, OBJ_G, p, t);
    p.manoLejos = guionMano(MANO_L_G, OBJ_G, p, t);
    return p;
  }

  const pocketA = (p, lado) => { const m = AN.manoReposo(p, lado); m.dedos = DEDOS0; return m; };
  const OBJ_A = {
    bolsC: p => pocketA(p, "cerca"),
    bolsL: p => pocketA(p, "lejos"),
    mesaC: p => { const q = AN.aHoja(p, { x: TX + 78, y: TY - 7 }); return mano(q.x, q.y, { mu: -2.05, ang: 0.05, dobla: -1 }); },
    mesaL: p => { const q = AN.aHoja(p, { x: TX + 42, y: TY - 10 }); return mano(q.x, q.y, { mu: -2.1, ang: 0.05, dobla: -1 }); }
  };
  const MANO_C_A = [[0, 0, "bolsC"], [T.apoyaA0, T.apoyaA1, "mesaC"], [10.32, 10.72, "bolsC"]];
  const MANO_L_A = [[0, 0, "bolsL"], [T.apoyaA0 + 0.06, T.apoyaA1, "mesaL"], [10.37, 10.77, "bolsL"]];

  function poseA(t) {
    const b = guion(GUION_CUERPO_A, CUERPOS_A, "bols", t);
    const respira = Math.sin(t * 2.0 + 1);
    const p = {
      x: XA + b.dx, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: AN.PELVIS.x, y: AN.PELVIS.y + b.pel + respira * 1.1 }, torso: b.torso,
      torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.03 * b.enc }, piernas: {},
      cabeza: { ang: b.cab + 0.015 * Math.sin(t * 0.9), dx: 0, dy: 12 * b.enc, esc: { x: 1, y: 1 } }
    };
    for (const lado of ["cerca", "lejos"]) {
      const fx = lado === "cerca" ? XA + 24 : XA - 20;
      p.piernas[lado] = { tob: { x: AN.PELVIS.x + (AN.aHoja(p, { x: fx, y: 0 }).x - AN.PELVIS.x), y: TOB_A[lado] }, ang: 0 };
    }
    const ex = guion(GUION_CARA_A, CARAS_A, "inicio", t);
    // Ander solo parpadea antes del duelo y, al final, muy despacio y satisfecho
    const lento = campana(t, T.parpA0, T.parpA1);
    p.cara = cara(ex, Math.max(parpadeo(t, [0.72]), Math.pow(lento, 0.6)));
    // el golpe de la mesa: la cabeza da un respingo mínimo
    p.cabeza.dy += -3 * campana(t, T.golpe, T.golpe + 0.25);
    p.capaCabeza = (g, tt) => palillo(g, tt);
    p.manoCerca = guionMano(MANO_C_A, OBJ_A, p, t);
    p.manoLejos = guionMano(MANO_L_A, OBJ_A, p, t);
    return p;
  }

  function pose(t) { return { g: poseG(t), a: poseA(t) }; }

  /* ---------- capa de los ojos de Guillermo ---------- */
  const rutaPoli = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
  const ruta = (g, pts) => { g.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y); };
  const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mezclaColor = (a, b, k) => { const x = hexRgb(a), y = hexRgb(b); return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], k))).join(",")})`; };
  const IRIS_LUZ = (() => { const c = G.A.datos.paleta.iris; return `rgb(${c[0]},${c[1]},${c[2]})`; })();
  // venas: desde las esquinas hacia el iris (unidades del retrato, relativas a la esquina)
  const VENAS = [
    [0, [[0, 0], [9, -3], [15, 1], [22, -2]]], [0, [[0, 2], [8, 6], [13, 4], [19, 9]]], [0, [[1, -2], [6, -6], [12, -5]]],
    [1, [[0, 0], [-8, -2], [-13, 2], [-19, -1]]], [1, [[0, 2], [-7, 5], [-12, 3]]]
  ];
  function globoG(g, o, st, mx, my, lado) {
    g.save();
    g.beginPath(); rutaPoli(g, o.poli); g.fillStyle = mezclaColor("#fbf8f5", "#ffb2a8", st.rojo); g.fill(); g.clip();
    // venas rojas desde los rabillos
    if (st.venas > 0.01) {
      g.strokeStyle = `rgba(200,24,30,${0.9 * st.venas})`; g.lineWidth = 2.3; g.lineCap = "round"; g.lineJoin = "round";
      const iz = o.U[0], de = o.U[o.U.length - 1];
      const esq = [{ x: lerp(iz.x, o.D[0].x, 0.5), y: lerp(iz.y, o.D[0].y, 0.5) }, { x: lerp(de.x, o.D[o.D.length - 1].x, 0.5), y: lerp(de.y, o.D[o.D.length - 1].y, 0.5) }];
      for (const [i, pts] of VENAS) { const e = esq[i]; g.beginPath();
        pts.forEach(([x, y], k) => { const X = e.x + x * (o.r / 17.5), Y = e.y + y * (o.r / 17.5); if (k) g.lineTo(X, Y); else g.moveTo(X, Y); }); g.stroke(); }
    }
    const ix = o.c.x + o.rx * mx, iy = o.c.y + o.ry * my, r = o.r * (st.e.iris ?? 1);
    g.fillStyle = "#5e2d15"; g.beginPath(); g.arc(ix, iy, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = IRIS_LUZ; g.beginPath(); g.ellipse(ix, iy + r * 0.32, r * 0.7, r * 0.55, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#120806"; g.beginPath(); g.arc(ix, iy + r * 0.05, r * 0.46, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(ix - r * 0.36, iy - r * 0.34, r * 0.3, r * 0.24, -0.4, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(ix + r * 0.38, iy + r * 0.36, r * 0.12, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(112,92,110,0.38)"; g.lineWidth = 9; g.beginPath(); ruta(g, o.U); g.stroke();
    // humedad en el párpado de abajo
    if (st.llanto > 0.01) { g.strokeStyle = `rgba(170,230,255,${0.8 * st.llanto})`; g.lineWidth = 3 + 4 * st.llanto; g.beginPath(); ruta(g, o.D); g.stroke(); }
    g.restore();
  }
  function parpadosG(g, o, c, h, z, lado) {             // igual que el párpado del montaje de Guillermo
    if (c <= 0.002) return;
    const U = o.U, D = o.D, n = U.length, hz = Math.max(h, z);
    const M = U.map((u, i) => { const k = Math.sin(Math.PI * i / (n - 1));
      const abajo = { x: D[i].x, y: D[i].y + 3 * k };
      const medio = { x: lerp(u.x, D[i].x, 0.55), y: lerp(u.y, D[i].y, 0.55) - 9 * k * (1 - z) + (i % 2 ? 3 : -3) * k * z };
      return mezcla(abajo, medio, hz); });
    const Up = U.map((u, i) => mezcla(u, M[i], c)), Dp = D.map((d, i) => mezcla(d, M[i], c * hz));
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    g.fillStyle = G.C.piel; g.strokeStyle = G.C.piel; g.lineWidth = 2;
    g.beginPath(); ruta(g, U); for (let i = n - 1; i >= 0; i--) g.lineTo(Up[i].x, Up[i].y); g.closePath(); g.fill(); g.stroke();
    if (c * hz > 0.01) { g.beginPath(); ruta(g, D); for (let i = n - 1; i >= 0; i--) g.lineTo(Dp[i].x, Dp[i].y); g.closePath(); g.fill(); g.stroke(); }
    g.strokeStyle = G.C.tinta; g.lineWidth = 5 + 2.5 * c;
    g.beginPath(); M2.curva(g, Up, false, 0.5); g.stroke();
    if (c * hz > 0.01) { g.globalAlpha = clamp(c * hz * 1.4); g.lineWidth = 4; g.beginPath(); M2.curva(g, Dp, false, 0.5); g.stroke(); g.globalAlpha = 1; }
    const arr = z * clamp((c - 0.6) / 0.4);
    if (arr > 0.01) { const e = lado === "d" ? U[0] : U[n - 1], sg = lado === "d" ? -1 : 1;
      g.lineWidth = 3.5; g.globalAlpha = arr;
      for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(e.x + sg * 6, e.y + 8 + k * 9); g.lineTo(e.x + sg * 22, e.y + 6 + k * 14); g.stroke(); }
      g.globalAlpha = 1; }
    g.restore();
  }
  function lagrima(g, x, y, s, a) {
    if (a <= 0.01 || s <= 0.2) return;
    g.save(); g.globalAlpha = a; g.lineWidth = 3; g.strokeStyle = "#1d3b52";
    g.beginPath(); g.moveTo(x, y - s * 1.6); g.quadraticCurveTo(x + s, y, x, y + s); g.quadraticCurveTo(x - s, y, x, y - s * 1.6);
    g.fillStyle = "#bfe8ff"; g.fill(); g.stroke();
    g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x - s * 0.3, y - s * 0.1, s * 0.22, s * 0.35, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function capaOjosG(g, t, st) {
    if (!st || st.on <= 0.003) return;
    g.save(); g.globalAlpha = st.on;
    const e = st.e, bz = st.bizco;
    // bizco: el ojo cercano mira a la nariz (derecha, abajo) y el lejano también (izquierda, abajo)
    const md = { x: lerp(e.mx, 1.05, bz), y: lerp(e.my, 0.85, bz) }, mi = { x: lerp(e.mx, -0.95, bz), y: lerp(e.my, 0.75, bz) };
    globoG(g, OJOS_G.d, st, md.x, md.y, "d"); globoG(g, OJOS_G.i, st, mi.x, mi.y, "i");
    parpadosG(g, OJOS_G.d, st.c.d, st.c.feliz, st.c.apretado, "d");
    parpadosG(g, OJOS_G.i, st.c.i, st.c.feliz, st.c.apretado, "i");
    // lágrimas: asoman en el rabillo y ruedan por la mejilla
    if (st.llanto > 0.01) {
      for (const [x0, y0, x1, y1, t0, per] of [[740, 586, 724, 700, 7.25, 0.95], [918, 642, 930, 716, 7.55, 1.1]]) {
        const asoma = 7 * st.llanto;
        const ciclo = t < t0 ? -1 : ((t - t0) % per) / per;
        if (ciclo < 0) { lagrima(g, x0, y0, asoma * 0.8, 1); continue; }
        const k = entrada(clamp(ciclo / 0.85));
        lagrima(g, lerp(x0, x1, k), lerp(y0, y1, k), lerp(asoma, 5.5, k), (1 - clamp((ciclo - 0.8) / 0.2)) * st.llanto);
        lagrima(g, x0, y0, asoma * 0.8 * clamp(ciclo / 0.4), st.llanto);
      }
    }
    g.restore();
  }

  /* ---------- el palillo de Ander ---------- */
  function palillo(g, t) {
    const golpe = campana(t, T.golpe, T.golpe + 0.5);
    const a = 0.22 + 0.12 * Math.sin(t * 1.1) + 0.06 * Math.sin(t * 2.7 + 1) - 0.55 * golpe * (1 - tramo(t, T.golpe + 0.2, T.golpe + 0.5));
    const sale = 1 - 0.25 * campana(t, 4.9, 5.6);              // lo mordisquea: entra y sale un poco
    const b = { x: 884, y: 683 };
    g.save(); g.translate(b.x, b.y); g.rotate(a); g.lineCap = "round";
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 8.5; g.beginPath(); g.moveTo(-6, 0); g.lineTo(78 * sale, 0); g.stroke();
    g.strokeStyle = "#e7c48a"; g.lineWidth = 5; g.stroke();
    g.strokeStyle = "rgba(255,245,215,0.8)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(4, -1.2); g.lineTo(70 * sale, -1.2); g.stroke();
    g.restore();
    // los labios por encima, cerrando el palillo en la comisura
    g.save(); g.fillStyle = "#c9714f"; g.beginPath(); g.ellipse(b.x - 2, b.y + 1, 7, 5, 0.33, 0, Math.PI * 2); g.fill(); g.restore();
  }

  /* ---------- la mosca ---------- */
  let CAM_G = null, CAM_A = null, CAM_CARA = null, CAM_CARA_A = null;
  function vueloLibre(t) {
    const u = t - T.mosca0;
    return { x: 230 + 120 * u + 70 * Math.sin(u * 3.1) + 26 * Math.sin(u * 7.3), y: 150 + 38 * Math.sin(u * 2.3 + 0.5) + 18 * Math.cos(u * 5.9) };
  }
  function mosca(t, pg, pa) {
    if (t < T.mosca0 || t > 11.2) return null;
    const ng = G.aPantalla(pg, G.cabeza(pg).a(NARIZ_G)), na = AN.aPantalla(pa, AN.cabeza(pa).a(NARIZ_A));
    let q, posada = 0;
    if (t < T.posa) { const k = suave(fase(t, T.posa - 0.6, T.posa)); q = mezcla(vueloLibre(t), ng, k); posada = fase(t, T.posa - 0.08, T.posa); }
    else if (t < T.despega) { q = { x: ng.x + 1.5 * Math.sin(t * 2.2), y: ng.y }; posada = 1; }
    else if (t < T.posaA) { const k = fase(t, T.despega, T.posaA), ks = suave(k); q = mezcla(ng, na, ks); q.y -= 70 * Math.sin(Math.PI * k) + 12 * Math.sin(k * 18) * (1 - k); posada = 1 - fase(t, T.despega, T.despega + 0.05); posada = Math.max(posada, fase(t, T.posaA - 0.08, T.posaA)); }
    else if (t < T.vuela) { q = { x: na.x, y: na.y }; posada = 1; }
    else { const k = fase(t, T.vuela, 11.2); q = { x: na.x + 380 * entrada(k) + 30 * Math.sin(k * 14), y: na.y - 260 * k - 20 * Math.sin(k * 9) }; posada = 1 - fase(t, T.vuela, T.vuela + 0.05); }
    const dir = t < T.posa ? Math.cos((t - T.mosca0) * 3.1) : t < T.posaA ? 1 : -1;
    return { x: q.x, y: q.y, posada, dir, mira: t > T.ceja1 - 0.2 && t < T.vuela ? 1 : 0 };
  }
  function dibMosca(g, t, m) {
    if (!m) return;
    g.save(); g.translate(m.x, m.y - 3 * m.posada); g.scale(m.dir < 0 ? -1 : 1, 1);
    const aleteo = (1 - m.posada) * Math.sin(t * 90), ala = 0.5 + 0.5 * aleteo;
    // estela de zumbido
    if (m.posada < 0.5) {
      g.strokeStyle = "rgba(20,20,20,0.35)"; g.lineWidth = 1; g.setLineDash([2, 3]);
      g.beginPath(); g.moveTo(-6, 0); g.quadraticCurveTo(-14, -5, -22, 1); g.stroke(); g.setLineDash([]);
    }
    // alas
    g.fillStyle = "rgba(220,240,255,0.75)"; g.strokeStyle = "rgba(20,20,30,0.8)"; g.lineWidth = 0.8;
    for (const s of [-1, 1]) { g.save(); g.translate(-1, -2); g.rotate(s * (0.5 + 0.7 * ala * (1 - m.posada)) - 0.4 * m.posada);
      g.beginPath(); g.ellipse(-3, -4, 2.6, 5, -0.3, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore(); }
    // cuerpo, cabeza y ojos rojos
    g.fillStyle = "#1a1a22"; g.beginPath(); g.ellipse(-2, 0, 4.5, 3.2, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(3, -0.5, 2.6, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#c0322a"; g.beginPath(); g.arc(4.3, -1.6, 1.3, 0, Math.PI * 2); g.fill();
    // patitas al posarse
    if (m.posada > 0.3) { g.strokeStyle = "#1a1a22"; g.lineWidth = 0.8; g.beginPath();
      for (const x of [-4, -1.5, 1.5]) { g.moveTo(x, 2); g.lineTo(x - 1, 4.5); } g.stroke(); }
    g.restore();
  }

  /* ---------- decorado ---------- */
  let fondo = null;
  const VENT = { x0: 410, x1: 622, y0: 54, y1: 300 };             // ventanal (pantalla)
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 140; const g = c.getContext("2d");
    g.translate(60, 70);
    // pared de adobe terracota con desconchones
    const pared = g.createLinearGradient(0, -70, 0, 450); pared.addColorStop(0, "#7a3d26"); pared.addColorStop(1, "#b5653d");
    g.fillStyle = pared; g.fillRect(-60, -70, W + 120, 530);
    for (let i = 0; i < 26; i++) { const x = hash(i + 3) * (W + 80) - 40, y = hash(i + 11) * 360 - 40;
      g.fillStyle = i % 2 ? "rgba(255,210,170,0.07)" : "rgba(60,20,10,0.08)"; g.beginPath(); g.ellipse(x, y, 30 + 40 * hash(i + 5), 10 + 12 * hash(i + 7), 0, 0, Math.PI * 2); g.fill(); }
    // ventanal en arco con el atardecer en el desierto
    const { x0, x1, y0, y1 } = VENT, cx = (x0 + x1) / 2, rr = (x1 - x0) / 2;
    const arco = () => { g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0 + rr); g.arc(cx, y0 + rr, rr, Math.PI, 0); g.lineTo(x1, y1); g.closePath(); };
    g.save(); arco(); g.clip();
    const cielo = g.createLinearGradient(0, y0, 0, y1); cielo.addColorStop(0, "#4b2a6b"); cielo.addColorStop(0.45, "#e2603a"); cielo.addColorStop(0.75, "#ffb347"); cielo.addColorStop(1, "#ffd27a");
    g.fillStyle = cielo; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    const sol = g.createRadialGradient(cx, 236, 6, cx, 236, 120); sol.addColorStop(0, "rgba(255,250,200,1)"); sol.addColorStop(0.25, "rgba(255,220,120,0.8)"); sol.addColorStop(1, "rgba(255,160,60,0)");
    g.fillStyle = sol; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.fillStyle = "#fff4c8"; g.beginPath(); g.arc(cx, 240, 30, 0, Math.PI * 2); g.fill();
    // mesas (silueta) y suelo del desierto
    g.fillStyle = "#6b2f3a"; g.beginPath(); g.moveTo(x0, 250); g.lineTo(x0 + 30, 250); g.lineTo(x0 + 40, 212); g.lineTo(x0 + 92, 210); g.lineTo(x0 + 100, 250);
    g.lineTo(x1 - 70, 250); g.lineTo(x1 - 62, 222); g.lineTo(x1 - 20, 220); g.lineTo(x1 - 12, 250); g.lineTo(x1, 250); g.lineTo(x1, y1); g.lineTo(x0, y1); g.closePath(); g.fill();
    g.fillStyle = "#8a4a33"; g.fillRect(x0, 256, x1 - x0, y1 - 256);
    g.fillStyle = "#a8603f"; g.fillRect(x0, 256, x1 - x0, 3);
    // saguaros
    g.fillStyle = "#3d2236";
    for (const [sx, sh] of [[x0 + 58, 34], [x1 - 40, 26]]) { g.beginPath(); g.roundRect ? g.roundRect(sx - 4, 256 - sh, 8, sh, 4) : g.rect(sx - 4, 256 - sh, 8, sh); g.fill();
      g.beginPath(); g.roundRect ? g.roundRect(sx - 13, 256 - sh * 0.75, 6, sh * 0.45, 3) : g.rect(sx - 13, 256 - sh * 0.75, 6, sh * 0.45); g.fill();
      g.fillRect(sx - 13, 256 - sh * 0.36, 12, 5);
      g.beginPath(); g.roundRect ? g.roundRect(sx + 7, 256 - sh * 0.9, 6, sh * 0.4, 3) : g.rect(sx + 7, 256 - sh * 0.9, 6, sh * 0.4); g.fill(); g.fillRect(sx + 2, 256 - sh * 0.55, 11, 5); }
    g.restore();
    // marco de madera y cruceta
    g.lineJoin = "round";
    arco(); g.lineWidth = 16; g.strokeStyle = "#4a2716"; g.stroke(); g.lineWidth = 5; g.strokeStyle = "#0b0a0e"; g.stroke();
    g.lineWidth = 7; g.strokeStyle = "#4a2716"; g.beginPath(); g.moveTo(cx, y0); g.lineTo(cx, y1); g.moveTo(x0, 170); g.lineTo(x1, 170); g.stroke();
    g.lineWidth = 2; g.strokeStyle = "#0b0a0e"; g.stroke();
    g.fillStyle = "#5b3220"; g.fillRect(x0 - 22, y1 - 4, x1 - x0 + 44, 14); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(x0 - 22, y1 - 4, x1 - x0 + 44, 14);
    // luz del atardecer que entra por la ventana
    const haz = g.createLinearGradient(cx, y1, cx, 470); haz.addColorStop(0, "rgba(255,190,110,0.28)"); haz.addColorStop(1, "rgba(255,190,110,0)");
    g.fillStyle = haz; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x1, y1); g.lineTo(x1 + 120, 470); g.lineTo(x0 - 120, 470); g.closePath(); g.fill();
    // herradura y lazo colgados, y apliques
    g.save(); g.translate(150, 120); g.lineCap = "round";
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 12; g.beginPath(); g.arc(0, 0, 22, Math.PI * 0.85, Math.PI * 2.15, false); g.stroke();
    g.strokeStyle = "#9aa3ad"; g.lineWidth = 7; g.stroke();
    g.fillStyle = "#0b0a0e"; for (let i = 0; i < 6; i++) { const a = Math.PI * (0.95 + i * 0.22); g.beginPath(); g.arc(Math.cos(a) * 22, Math.sin(a) * 22, 1.6, 0, Math.PI * 2); g.fill(); }
    g.restore();
    g.save(); g.translate(880, 112); g.lineWidth = 5; g.strokeStyle = "#c9a26a";
    for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(0, 6 + i * 2, 34 - i * 3, 22 - i * 2, 0.1, 0, Math.PI * 2); g.stroke(); }
    g.lineWidth = 1.5; g.strokeStyle = "#5a3c1c"; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(0, 6 + i * 2, 34 - i * 3, 22 - i * 2, 0.1, 0, Math.PI * 2); g.stroke(); }
    g.lineWidth = 5; g.strokeStyle = "#c9a26a"; g.beginPath(); g.moveTo(14, 26); g.quadraticCurveTo(26, 60, 10, 90); g.stroke();
    g.fillStyle = "#3a2414"; g.beginPath(); g.arc(0, -16, 4, 0, Math.PI * 2); g.fill();
    g.restore();
    for (const lx of [260, 770]) {
      const halo = g.createRadialGradient(lx, 200, 4, lx, 200, 110); halo.addColorStop(0, "rgba(255,200,120,0.5)"); halo.addColorStop(1, "rgba(255,180,100,0)");
      g.fillStyle = halo; g.beginPath(); g.arc(lx, 200, 110, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#2a1a12"; g.fillRect(lx - 4, 206, 8, 16); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.strokeRect(lx - 4, 206, 8, 16);
      g.fillStyle = "#ffcf8a"; g.beginPath(); g.moveTo(lx - 14, 206); g.lineTo(lx + 14, 206); g.lineTo(lx + 9, 184); g.lineTo(lx - 9, 184); g.closePath(); g.fill(); g.stroke();
    }
    // zócalo de azulejos y suelo de barro cocido
    g.fillStyle = "#1f5a5a"; g.fillRect(-60, 392, W + 120, 52);
    for (let x = -60; x < W + 60; x += 26) for (const [y, f] of [[392, 0], [418, 13]]) {
      g.fillStyle = (Math.floor((x + f) / 26) % 2) ? "#2c7a73" : "#e9d9b6"; g.fillRect(x + f + 2, y + 2, 22, 22);
      g.fillStyle = "#c2552f"; g.beginPath(); g.arc(x + f + 13, y + 13, 4, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#3a1d12"; g.fillRect(-60, 444, W + 120, 6);
    const su = g.createLinearGradient(0, 450, 0, H + 70); su.addColorStop(0, "#9c4a2a"); su.addColorStop(1, "#5a2614");
    g.fillStyle = su; g.fillRect(-60, 450, W + 120, H + 70 - 450);
    g.strokeStyle = "rgba(40,14,6,0.45)"; g.lineWidth = 2;
    for (let i = -14; i <= 14; i++) { g.beginPath(); g.moveTo(512 + i * 40, 450); g.lineTo(512 + i * 110, H + 70); g.stroke(); }
    for (const y of [470, 500, 540, 590, 650]) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    // lámpara colgante sobre la mesa
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.beginPath(); g.moveTo(TX, -70); g.lineTo(TX, 20); g.stroke();
    g.fillStyle = "#1f3b3a"; g.beginPath(); g.moveTo(TX - 40, 46); g.quadraticCurveTo(TX, 6, TX + 40, 46); g.closePath(); g.fill(); g.lineWidth = 3; g.stroke();
    g.fillStyle = "#ffe0a0"; g.beginPath(); g.ellipse(TX, 46, 30, 7, 0, 0, Math.PI * 2); g.fill();
    // viñeta
    const v = g.createRadialGradient(512, 290, 280, 512, 290, 700); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.5)");
    g.fillStyle = v; g.fillRect(-60, -70, W + 120, H + 140);
    return c;
  }
  // bola de paja rodando por el desierto (detrás de los dos, recortada al ventanal)
  function bolaPaja(g, t) {
    const k = fase(t, 4.55, 6.6); if (k <= 0 || k >= 1) return;
    const { x0, x1, y0, y1 } = VENT, cx = (x0 + x1) / 2, rr = (x1 - x0) / 2;
    const x = lerp(x0 - 20, x1 + 20, k), y = 249 - 9 * Math.abs(Math.sin(k * 13)), a = k * 26;
    g.save(); g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0 + rr); g.arc(cx, y0 + rr, rr, Math.PI, 0); g.lineTo(x1, y1); g.closePath(); g.clip();
    g.translate(x, y); g.rotate(a); g.strokeStyle = "#5a3416"; g.lineWidth = 1.3;
    for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(0, 0, 9 - i * 0.6, 6 + i * 0.4, i * 0.9, 0, Math.PI * 2); g.stroke(); }
    g.restore();
    // polvo que levanta
    g.save(); g.fillStyle = "rgba(255,210,150,0.35)"; for (let i = 0; i < 3; i++) { const d = i * 10; g.beginPath(); g.arc(x - 12 - d, 255 - i, 4 + i, 0, Math.PI * 2); g.fill(); } g.restore();
  }
  function motas(g, t) {
    g.save(); g.fillStyle = "rgba(255,230,180,0.55)";
    for (let i = 0; i < 16; i++) { const ph = (t * (0.04 + 0.03 * hash(i)) + hash(i + 20)) % 1;
      const x = VENT.x0 - 40 + hash(i + 40) * 300 + 14 * Math.sin(t * 0.7 + i), y = 330 - ph * 260;
      g.globalAlpha = 0.6 * Math.sin(Math.PI * ph); g.beginPath(); g.arc(x, y, 1.2 + hash(i + 7) * 1.2, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // mesa alta redonda con un cactus en maceta y dos chupitos
  function mesa(g, t) {
    const salto = t >= T.golpe ? 6 * Math.exp(-(t - T.golpe) * 10) * Math.abs(Math.cos((t - T.golpe) * 30)) * suave(fase(t, T.golpe, T.golpe + 0.03)) : 0;
    g.save(); g.lineJoin = "round"; g.strokeStyle = "#0b0a0e";
    // pie
    g.fillStyle = "#2a2a30"; g.fillRect(TX - 5, TY + 6, 10, SUELO - TY - 12); g.lineWidth = 2.5; g.strokeRect(TX - 5, TY + 6, 10, SUELO - TY - 12);
    g.beginPath(); g.ellipse(TX, SUELO - 4, 48, 9, 0, 0, Math.PI * 2); g.fillStyle = "#1c1c22"; g.fill(); g.stroke();
    // tablero
    g.translate(0, -salto * 0.3);
    g.fillStyle = "#5a2e18"; g.beginPath(); g.ellipse(TX, TY + 6, 104, 16, 0, 0, Math.PI); g.lineTo(TX - 104, TY); g.ellipse(TX, TY, 104, 16, 0, Math.PI, 0, true); g.closePath(); g.fill(); g.lineWidth = 3; g.stroke();
    const tab = g.createLinearGradient(TX - 100, 0, TX + 100, 0); tab.addColorStop(0, "#8a4a26"); tab.addColorStop(0.5, "#b06a3a"); tab.addColorStop(1, "#7a3f20");
    g.fillStyle = tab; g.beginPath(); g.ellipse(TX, TY, 104, 16, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,230,180,0.25)"; g.beginPath(); g.ellipse(TX - 14, TY - 3, 60, 5, 0, 0, Math.PI * 2); g.fill();
    // cactus en maceta
    g.save(); g.translate(TX, TY - 4 - salto);
    g.fillStyle = "#c25a2c"; g.beginPath(); g.moveTo(-12, 0); g.lineTo(12, 0); g.lineTo(9, -16); g.lineTo(-9, -16); g.closePath(); g.fill(); g.lineWidth = 2; g.stroke();
    g.fillStyle = "#3f8f4e"; g.beginPath(); g.roundRect ? g.roundRect(-5, -44, 10, 30, 5) : g.rect(-5, -44, 10, 30); g.fill(); g.stroke();
    g.beginPath(); g.roundRect ? g.roundRect(-14, -36, 6, 14, 3) : g.rect(-14, -36, 6, 14); g.fill(); g.stroke(); g.fillRect(-10, -26, 6, 4);
    g.fillStyle = "#ff7aa8"; g.beginPath(); g.arc(0, -45, 3.5, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.2; g.stroke();
    g.restore();
    // chupitos
    for (const [x, d] of [[TX - 56, 0], [TX + 60, 0.3]]) {
      const sj = salto * (1 + d);
      g.save(); g.translate(x, TY - 2 - sj); g.rotate(salto * 0.02 * (d ? 1 : -1));
      g.fillStyle = "rgba(220,240,255,0.35)"; g.beginPath(); g.moveTo(-7, 0); g.lineTo(7, 0); g.lineTo(8, -17); g.lineTo(-8, -17); g.closePath(); g.fill();
      g.fillStyle = "#e09a2a"; g.beginPath(); g.moveTo(-6.4, -2); g.lineTo(6.4, -2); g.lineTo(7.1, -12); g.lineTo(-7.1, -12); g.closePath(); g.fill();
      g.lineWidth = 1.8; g.beginPath(); g.moveTo(-7, 0); g.lineTo(7, 0); g.lineTo(8, -17); g.lineTo(-8, -17); g.closePath(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.7)"; g.fillRect(-5, -15, 2, 11);
      g.restore();
    }
    g.restore();
  }
  function impacto(g, t, t0, x, y, tam) {
    const k = fase(t, t0, t0 + 0.32); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    const estrella = (r, rel, rot) => { g.beginPath(); for (let i = 0; i < 24; i++) { const a = rot + i * Math.PI / 12, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); };
    estrella(tam * (0.6 + 0.8 * salida(k)), 0.42, 0.3); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2.5; g.strokeStyle = "#0b0a0e"; g.stroke();
    estrella(tam * (0.35 + 0.5 * salida(k)), 0.5, 0.55); g.fillStyle = "#ffffff"; g.fill();
    g.restore();
  }
  function estrellitas(g, t, p) {
    const k = tramo(t, T.golpe + 0.1, T.golpe + 0.35) * (1 - tramo(t, 12.5, 13.1)); if (k <= 0.01) return;
    const c = G.aPantalla(p, G.cabeza(p).a({ x: 760, y: 420 }));
    const pts = [];
    for (let i = 0; i < 4; i++) { const a = t * 4 + i * Math.PI / 2; pts.push({ a, x: c.x + Math.cos(a) * 36, y: c.y - 24 + Math.sin(a) * 9, z: Math.sin(a) }); }
    pts.sort((u, v) => u.z - v.z);
    g.save();
    for (const q of pts) { const r = (6 + 2 * q.z) * k; g.beginPath();
      for (let i = 0; i < 10; i++) { const a = t * 3 + q.a + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; g.lineTo(q.x + Math.cos(a) * rr, q.y + Math.sin(a) * rr); }
      g.closePath(); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 1.5; g.strokeStyle = "#0b0a0e"; g.stroke(); }
    g.restore();
  }
  // rayitas de tensión entre las miradas (al principio del duelo) y de zumbido
  function rayoMiradas(g, t, pg, pa) {
    const k = campana(t, T.duelo, T.duelo + 1.6) * 0.9 + 0.5 * campana(t, T.dos1 - 0.1, T.dos1 + 1.1); if (k <= 0.01) return;
    const a = G.aPantalla(pg, G.cabeza(pg).a(OJOS_G_MEDIO)), b = AN.aPantalla(pa, AN.cabeza(pa).a(OJOS_A_MEDIO));
    g.save(); g.globalAlpha = k; g.lineCap = "round"; g.lineJoin = "round";
    for (const [col, w] of [["rgba(255,240,120,0.9)", 4], ["#ffffff", 1.6]]) {
      g.strokeStyle = col; g.lineWidth = w; g.beginPath();
      const n = 9; for (let i = 0; i <= n; i++) { const u = i / n, x = lerp(a.x + 14, b.x - 14, u), y = lerp(a.y, b.y, u) + (i % 2 ? -1 : 1) * (5 + 3 * Math.sin(t * 40 + i)) * Math.sin(Math.PI * u);
        if (i) g.lineTo(x, y); else g.moveTo(x, y); }
      g.stroke();
    }
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camaras() {
    if (CAM_G) return;
    const pg = poseG(2.95), pa = poseA(3.8), pc = poseG(7.5), pca = poseA(9.8);
    const og = G.aPantalla(pg, G.cabeza(pg).a(OJOS_G_MEDIO)), oa = AN.aPantalla(pa, AN.cabeza(pa).a(OJOS_A_MEDIO));
    const oc = G.aPantalla(pc, G.cabeza(pc).a({ x: 820, y: 610 })), oca = AN.aPantalla(pca, AN.cabeza(pca).a({ x: 860, y: 560 }));
    CAM_G = { k: 2.0, x: og.x - 88, y: og.y + 22 }; CAM_A = { k: 2.0, x: oa.x + 88, y: oa.y + 22 };
    CAM_CARA = { k: 2.15, x: oc.x - 6, y: oc.y + 4 }; CAM_CARA_A = { k: 2.15, x: oca.x + 6, y: oca.y + 4 };
  }
  function camara(t) {
    camaras();
    const C = { ancho: { k: 1, x: 512, y: 300 }, dos: { k: 1.6, x: 516, y: 214 }, dos2: { k: 1.72, x: 514, y: 208 }, ojosG: CAM_G, ojosA: CAM_A,
      cara: CAM_CARA, caraA: CAM_CARA_A, final: { k: 1.12, x: 512, y: 286 }, fin: { k: 1.04, x: 512, y: 295 } };
    const lista = [[1.75, 2.35, "dos"], [T.zg0, T.zg1, "ojosG"], [T.za0, T.za1, "ojosA"], [T.dos0, T.dos1, "dos"], [T.dos1, 6.2, "dos2"],
      [6.2, 6.65, "cara"], [8.72, 9.12, "dos"], [9.3, 9.62, "caraA"], [10.25, 10.6, "final"], [11.95, 13.2, "fin"]];
    let c = C.ancho;
    for (const [t0, t1, n] of lista) { if (t <= t0) break; const k = suave(fase(t, t0, t1)); c = { k: lerp(c.k, C[n].k, k), x: lerp(c.x, C[n].x, k), y: lerp(c.y, C[n].y, k) }; }
    return c;
  }
  const bandas = t => tramo(t, T.lb0, T.lb1) * (1 - tramo(t, T.lbFin0, T.lbFin1));

  class DueloMiradas extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !AN.listo()) return;
      if (!fondo) fondo = creaFondo();
      const P = pose(t), pg = P.g, pa = P.a;
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = t >= T.golpe ? 6 * Math.exp(-(t - T.golpe) * 7) * suave(fase(t, T.golpe, T.golpe + 0.04)) : 0;
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -60, -70);
      bolaPaja(g, t);
      motas(g, t);
      g.save(); g.fillStyle = "rgba(0,0,0,0.32)";
      g.beginPath(); g.ellipse(pg.x + 4, SUELO + 1, 95, 8, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pa.x, SUELO + 1, 92, 8, 0, 0, Math.PI * 2); g.fill(); g.restore();
      mesa(g, t);
      G.dibujar(g, pg, t);
      AN.dibujar(g, pa, t);
      rayoMiradas(g, t, pg, pa);
      { const f = G.aPantalla(pg, G.cabeza(pg).a(FRENTE_G)); impacto(g, t, T.golpe, f.x + 16, f.y + 6, 18); }
      estrellitas(g, t, pg);
      dibMosca(g, t, mosca(t, pg, pa));
      g.restore();
      const lb = bandas(t);
      if (lb > 0.002) { g.fillStyle = "#000"; g.fillRect(0, 0, W, 62 * lb); g.fillRect(0, H - 62 * lb, W, 62 * lb); }
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00033", nombre: "Guillermo y Ander · El duelo de miradas", crear: () => new DueloMiradas() });
  window.__A2D_00033 = { pose, poseG, poseA, T, DUR, camara, mosca: t => { const P = pose(t); return mosca(t, P.g, P.a); } };
})();
