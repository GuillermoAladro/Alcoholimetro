"use strict";
/* 00043 · Guillermo y Carla · El limbo
 *
 * Negro → fiesta hawaiana de noche: farolillos de colores, guirnalda de flores, una palmera
 * hinchable, un ukelele colgado y, en medio, el limbo (dos postes de bambú con un listón de rayas).
 * Carla, con una flor en el pelo, baila moviendo la cadera; Guillermo, con un collar de flores,
 * espera detrás con las manos en los bolsillos y cara de sobrado → Carla mira a cámara, se echa la
 * melena atrás y se dobla hacia atrás **imposiblemente baja**: rodillas por delante, el cuerpo casi
 * en horizontal y la melena barriendo el suelo; pasa bajo el listón a pasitos, al ritmo. Guillermo
 * se queda con la boca abierta → se levanta al otro lado, posa con los brazos en alto y guiña un
 * ojo → se da la vuelta, baja el listón una muesca con un dedo (¡clac!) y le invita con la palma →
 * Guillermo se cruje los dedos, mira a cámara muy chulo, se planta delante del listón y se echa
 * atrás: se tambalea, mueve los brazos como aspas, le cruje la espalda y se queda congelado a medio
 * camino, temblando, rojo y sudando, con las rodillas ya bajo el listón y el pecho sin pasar; pánico
 * → se desploma de espaldas (¡pum!) y suspira aliviado… los postes se tambalean y el listón le cae
 * en la barriga: ¡boing! Ojos en espiral y estrellitas → Carla se ríe tapándose la boca, se acerca
 * bailando, apoya la bota en el listón como un trofeo (a Guillermo se le hinchan los mofletes) y
 * guiña un ojo a cámara → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, C = Carla;
  const S = 0.3, SUELO = 560, DUR = 14.4;
  const BX = 540, BHW = 104;                 // centro del listón (pantalla) y media anchura entre postes
  const ALTO0 = 206, ALTO1 = 172;            // altura del listón sobre el suelo (px): antes y después de bajarlo
  const PEGS = [240, ALTO0, ALTO1, 138, 104];
  const T = {
    baila0: 0.3, mira: 1.7, melena: 1.85, baja0: 2.15, baja1: 2.75, pasa1: 5.0, sube1: 5.6,
    pose0: 5.6, guino: 5.95, gira0: 6.32, gira1: 6.6, liston0: 6.75, clac: 6.98, invita0: 7.1, invita1: 7.7,
    gCruje: 6.55, gChulo: 7.05, gAnda0: 7.25, gAnda1: 7.95, gBaja0: 8.0, gBaja1: 8.55, gAvanza1: 9.3, cruje: 9.0,
    congela: 9.3, panico: 9.55, cae0: 9.95, cae1: 10.3, suspira: 10.45, tiembla: 10.6, suelta: 10.92, boing: 11.18,
    risa0: 11.3, risa1: 11.95, va0: 11.95, va1: 12.5, bota: 12.6, gana: 12.85, fin: 13.6
  };

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  // recorrido por tramos: [[t, valor], …] con transición suave entre cada pareja
  const recorrido = (lista, t) => {
    if (t <= lista[0][0]) return lista[0][1];
    for (let i = 1; i < lista.length; i++) if (t < lista[i][0]) return lerp(lista[i - 1][1], lista[i][1], suave(fase(t, lista[i - 1][0], lista[i][0])));
    return lista[lista.length - 1][1];
  };
  // pie: lista de pasos [t0, t1, x de pantalla, altura del paso (px)]
  function pie(lista, t) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x, alza = 26] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    return { x: lerp(xa, x, suave5(u)), alza: alza * Math.sin(Math.PI * u), u };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const R_M = G.MUNECA_R * G.JK;
  const manoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const D0 = { pulgar: 0, indice: 0, medio: 0, anular: 0, menique: 0 };
  const dedosTodos = k => ({ pulgar: k, indice: k, medio: k, anular: k, menique: k });

  /* ---------- caras (los dos usan los mismos campos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, esp: 0, mof: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: Math.max(e.c, parp), i: Math.max(e.c, parp), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }

  /* =====================================================================================
   * CARLA: empieza a la izquierda del limbo mirando a la derecha; pasa por debajo, posa y se gira.
   * ===================================================================================== */
  const CARAS_C = {
    inicio: E({ orig: 0, sonr: 0.55, c: 0.2, sd: 6, gd: 0.05, si: 8, gi: 0.06 }),
    baila: E({ mx: 0.4, my: -0.1, c: 0.55, h: 0.8, sd: 10, gd: 0.08, si: 10, gi: 0.08, orig: 0, sonr: 0.85, abre: 8, ancho: 0.95 }),
    camara: E({ mx: -0.85, my: -0.05, c: 0.15, sd: 12, gd: 0.1, si: 16, gi: 0.12, orig: 0, sonr: 0.75, ancho: 0.95 }),
    limbo: E({ mx: 0.3, my: -0.9, c: 0.35, sd: 8, gd: 0.06, si: 8, gi: 0.06, orig: 0, sonr: 0.7, abre: 4, ancho: 0.9 }),
    pose: E({ mx: -0.85, my: -0.05, c: 0.1, sd: 14, gd: 0.1, si: 18, gi: 0.12, orig: 0, sonr: 0.95, abre: 14, ancho: 1.05 }),
    guino: E({ mx: -0.85, my: -0.05, c: 0, h: 1, sd: 12, gd: 0.08, si: 18, gi: 0.12, orig: 0, sonr: 0.95, abre: 6, ancho: 1 }),
    reta: E({ mx: 0.85, my: 0.05, c: 0.3, sd: 2, gd: 0.02, si: 18, gi: 0.15, orig: 0, sonr: 0.6, ancho: 0.9 }),
    mira: E({ mx: 0.85, my: 0.3, c: 0.2, sd: 10, gd: 0.06, si: 12, gi: 0.08, orig: 0, sonr: 0.3, ancho: 0.85 }),
    ojazo: E({ mx: 0.85, my: 0.35, iris: 1.08, sd: 20, gd: 0.12, si: 22, gi: 0.14, orig: 0, sonr: -0.05, abre: 16, ancho: 0.7 }),
    risa: E({ mx: 0.5, my: 0.4, c: 1, h: 1, sd: 16, gd: 0.12, si: 16, gi: 0.12, orig: 0, sonr: 1, abre: 34, ancho: 1.1, lengua: 0.4 }),
    gana: E({ mx: -0.85, my: -0.05, c: 0, h: 1, sd: 14, gd: 0.1, si: 20, gi: 0.14, orig: 0, sonr: 1, abre: 12, ancho: 1.05 })
  };
  const GUION_CARA_C = [
    [T.baila0, T.baila0 + 0.3, "baila"], [T.mira, T.mira + 0.2, "camara"], [T.baja0, T.baja0 + 0.3, "limbo"],
    [T.pasa1, T.pasa1 + 0.3, "pose"], [T.guino, T.guino + 0.12, "guino"], [T.guino + 0.45, T.guino + 0.6, "pose"],
    [T.gira0, T.gira1, "reta"], [T.invita1 + 0.1, T.invita1 + 0.4, "mira"], [T.cruje - 0.05, T.cruje + 0.15, "ojazo"],
    [T.cae1 + 0.05, T.cae1 + 0.3, "mira"], [T.boing - 0.05, T.boing + 0.08, "ojazo"], [T.risa0, T.risa0 + 0.2, "risa"],
    [T.va0, T.va0 + 0.3, "mira"], [T.gana, T.gana + 0.12, "gana"]
  ];
  // cuerpo (hoja de Carla): pel (+ abajo), torso, cab; manos respecto a su hombro (hoja)
  const P0C = { pel: 0, torso: 0, cab: 0, cx: 0, cy: 0, cmu: -1.75, cp: 0, cd: 0, lx: 0, ly: 0, lmu: -1.75, lp: 0, ld: 0, ldob: 1, pinza: 0 };
  const CC = o => Object.assign({}, P0C, o);
  const CUERPOS_C = {
    bolsillos: CC({}),
    baila: CC({ pel: 22, torso: -0.04, cab: 0.05, cx: -60, cy: -170, cmu: 1.4, cp: 1, cd: 1, lx: 70, ly: -190, lmu: 1.6, lp: 1, ld: 1, ldob: -1 }),
    melena: CC({ pel: 10, torso: -0.06, cab: -0.12, cx: -60, cy: -170, cmu: 1.4, cp: 1, cd: 1, lx: 30, ly: -300, lmu: 1.2, lp: 1, ld: 0.9, ldob: -1 }),
    limbo: CC({ pel: 468, torso: -1.36, cab: -1.5, cx: -200, cy: 260, cmu: -1.0, cp: 1, cd: 1, lx: 330, ly: -40, lmu: 3.0, lp: 1, ld: 1, ldob: -1 }),
    pose: CC({ pel: 6, torso: -0.05, cab: -0.04, cx: -150, cy: -250, cmu: 1.05, cp: 1, cd: 1, lx: 120, ly: -280, lmu: 2.0, lp: 1, ld: 1, ldob: -1 }),
    reta: CC({ pel: 0, torso: 0.02, cab: 0.04, cx: -40, cy: 170, cmu: -1.4, cp: 1, cd: 0.25, lx: 30, ly: 260, lmu: -1.75, lp: 0.0, ld: 0, ldob: 1 }),
    liston: CC({ pel: 0, torso: 0.04, cab: 0.06, cx: -40, cy: 170, cmu: -1.4, cp: 1, cd: 0.25, lx: 230, ly: -60, lmu: 3.14, lp: 1, ld: 0.3, ldob: -1, pinza: 1 }),
    invita: CC({ pel: 0, torso: 0.02, cab: 0.02, cx: -40, cy: 170, cmu: -1.4, cp: 1, cd: 0.25, lx: 220, ly: -50, lmu: 2.9, lp: 1, ld: 1, ldob: -1 }),
    mira: CC({ pel: 0, torso: 0.0, cab: 0.04, cx: -40, cy: 170, cmu: -1.4, cp: 1, cd: 0.25, lx: 30, ly: 260, lmu: -1.75, lp: 0, ld: 0, ldob: 1 }),
    risa: CC({ pel: 26, torso: 0.14, cab: 0.1, cx: -40, cy: 170, cmu: -1.4, cp: 1, cd: 0.25, lx: 150, ly: -150, lmu: 2.3, lp: 1, ld: 1, ldob: -1 }),
    gana: CC({ pel: 10, torso: -0.03, cab: -0.05, cx: -30, cy: 120, cmu: -0.9, cp: 1, cd: 0.2, lx: 100, ly: -280, lmu: 1.9, lp: 1, ld: 1, ldob: -1 })
  };
  const GUION_CUERPO_C = [
    [T.baila0, T.baila0 + 0.45, "baila"], [T.mira - 0.05, T.melena + 0.2, "melena"], [T.baja0, T.baja1, "limbo"],
    [T.pasa1, T.sube1, "pose"], [T.gira0 - 0.1, T.gira1, "reta"], [T.liston0, T.clac - 0.04, "liston"],
    [T.invita0, T.invita0 + 0.3, "invita"], [T.invita1, T.invita1 + 0.35, "mira"], [T.risa0, T.risa0 + 0.25, "risa"],
    [T.va0, T.va0 + 0.3, "mira"], [T.bota, T.gana, "gana"]
  ];
  // pelvis de Carla (x de pantalla) y profundidad (al final se pone por delante de Guillermo)
  const XC = [[0, 330], [T.baja0, 330], [T.baja1, 380], [T.pasa1, 690], [T.sube1, 722], [T.gira0, 732], [T.gira1, 736],
              [T.liston0, 734], [T.invita0, 740], [T.invita1, 832], [T.va0, 832], [T.va1, 626], [DUR, 626]];
  const PROF_C = [[0, 0], [T.va0, 0], [T.va1, 16], [DUR, 16]];
  // pasos de Carla (x de pantalla del tobillo): [t0, t1, x, alza]
  const PASOS_C = (() => {
    const cerca = [[-9, -8, 306]], lejos = [[-9, -8, 356]];
    // al agacharse para el limbo, los pies se adelantan
    cerca.push([T.baja0 + 0.05, T.baja0 + 0.35, 420, 18]); lejos.push([T.baja0 + 0.25, T.baja0 + 0.55, 462, 18]);
    // pasitos por debajo del listón (al ritmo)
    const n = 12, t0 = T.baja1, t1 = T.pasa1 - 0.1;
    for (let i = 0; i < n; i++) {
      const tt = lerp(t0, t1, i / n), dur = (t1 - t0) / n * 0.85;
      const xpel = recorrido(XC, tt + dur);
      (i % 2 ? lejos : cerca).push([tt, tt + dur, xpel + (i % 2 ? 128 : 92), 12]);
    }
    // se levanta: junta los pies
    cerca.push([T.pasa1, T.pasa1 + 0.3, 700, 24]); lejos.push([T.pasa1 + 0.15, T.pasa1 + 0.45, 752, 24]);
    // al girarse (a mitad del giro, cuando está estrechada) los pies cambian de lado
    const gm = (T.gira0 + T.gira1) / 2;
    cerca.push([gm, gm + 0.001, 760, 0]); lejos.push([gm, gm + 0.001, 708, 0]);
    // ya mirando a la izquierda: retrocede para dejarle sitio
    cerca.push([T.invita0 + 0.05, T.invita0 + 0.3, 800, 22]); lejos.push([T.invita0 + 0.25, T.invita0 + 0.5, 770, 22]);
    cerca.push([T.invita1 - 0.25, T.invita1, 858, 22]); lejos.push([T.invita1 - 0.05, T.invita1 + 0.2, 806, 22]);
    // se acerca bailando y planta la bota en el listón
    cerca.push([T.va0, T.va0 + 0.3, 764, 26]); lejos.push([T.va0 + 0.22, T.va0 + 0.52, 652, 26]);
    cerca.push([T.va0 + 0.42, T.va1, 610, 22]);
    return { cerca, lejos };
  })();
  const TOB_C = { cerca: C.SUELO - C.TOBILLO_ALTO, lejos: C.SUELO - C.TOBILLO_ALTO - 8 };

  /* =====================================================================================
   * GUILLERMO: a la izquierda, mira a la derecha. Lo intenta, se queda a medias y se desploma.
   * ===================================================================================== */
  const CARAS_G = {
    inicio: E({ orig: 0, sonr: 0.5, sd: 6, gd: 0.08, si: 4, gi: 0.05, mx: 0.9 }),
    sobrado: E({ mx: 0.9, my: 0.05, c: 0.25, sd: 4, gd: 0.04, si: 14, gi: 0.12, orig: 0, sonr: 0.6, ancho: 0.95 }),
    pasmo: E({ mx: 0.9, my: 0.3, iris: 0.82, sd: 26, gd: 0.15, si: 26, gi: 0.15, orig: 0, abre: 52, ancho: 0.8, sonr: -0.15, lengua: 0.4 }),
    chulo: E({ mx: -0.85, my: -0.2, sd: 18, gd: 0.16, si: -4, gi: -0.08, orig: 0, sonr: 0.85, abre: 4, ancho: 0.95 }),
    decidido: E({ mx: 0.9, my: 0.1, c: 0.3, sd: -8, gd: -0.18, si: -8, gi: -0.18, orig: 0, sonr: 0.35, ancho: 0.9 }),
    limbo: E({ mx: 0.6, my: -0.9, c: 0.15, sd: 10, gd: 0.06, si: 10, gi: 0.06, orig: 0, abre: 14, ancho: 0.9, sonr: 0.2 }),
    crack: E({ mx: 0.6, my: -0.9, iris: 0.75, sd: 26, gd: 0.18, si: 26, gi: 0.18, orig: 0, abre: 40, ancho: 0.75, sonr: -0.4, lengua: 0.2 }),
    tenso: E({ mx: 0.6, my: -0.9, c: 0.95, z: 1, sd: -10, gd: -0.25, si: -10, gi: -0.25, orig: 0, abre: 18, ancho: 1.2, sonr: -0.55, lengua: 0 }),
    panico: E({ mx: -0.85, my: -0.3, iris: 0.78, sd: 24, gd: 0.25, si: 24, gi: 0.25, orig: 0, abre: 24, ancho: 1.1, sonr: -0.75, lengua: 0 }),
    cae: E({ mx: 0, my: -0.6, iris: 0.8, sd: 26, gd: 0.15, si: 26, gi: 0.15, orig: 0, abre: 46, ancho: 0.8, sonr: -0.2, lengua: 0.4 }),
    alivio: E({ mx: 0, my: -0.4, c: 0.85, h: 0.5, sd: 8, gd: 0.05, si: 8, gi: 0.05, orig: 0, abre: 20, ancho: 0.7, sonr: 0.15 }),
    boing: E({ mx: 0, my: -0.8, iris: 0.6, sd: 30, gd: 0.2, si: 30, gi: 0.2, orig: 0, abre: 10, ancho: 0.6, sonr: -0.3, mof: 1 }),
    ko: E({ mx: 0, my: 0, esp: 1, sd: 12, gd: 0.2, si: -6, gi: -0.1, orig: 0, abre: 22, ancho: 0.8, sonr: -0.2, lengua: 0.9 }),
    aplastado: E({ mx: 0, my: 0, esp: 1, sd: 16, gd: 0.22, si: 4, gi: 0.05, orig: 0, abre: 0, ancho: 0.7, sonr: -0.2, mof: 1 })
  };
  const GUION_CARA_G = [
    [0.6, 0.9, "sobrado"], [3.4, 3.6, "pasmo"], [T.pose0 + 0.2, T.pose0 + 0.45, "sobrado"], [T.gChulo, T.gChulo + 0.2, "chulo"],
    [T.gAnda0 + 0.1, T.gAnda0 + 0.35, "decidido"], [T.gBaja0, T.gBaja0 + 0.3, "limbo"], [T.cruje, T.cruje + 0.06, "crack"],
    [T.cruje + 0.25, T.congela, "tenso"], [T.panico, T.panico + 0.12, "panico"], [T.cae0, T.cae0 + 0.1, "cae"],
    [T.suspira, T.suspira + 0.2, "alivio"], [T.boing - 0.02, T.boing + 0.05, "boing"], [T.boing + 0.45, T.boing + 0.7, "ko"],
    [T.bota - 0.02, T.bota + 0.08, "aplastado"], [T.bota + 0.5, T.bota + 0.8, "ko"]
  ];
  const P0G = { pel: 0, torso: 0, cab: 0, cx: 0, cy: 0, cmu: -1.75, cp: 0, cd: 0, lx: 0, ly: 0, lmu: -1.75, lp: 0, ld: 0 };
  const CG = o => Object.assign({}, P0G, o);
  const CUERPOS_G = {
    bolsillos: CG({}),
    cruje: CG({ pel: 4, torso: 0.04, cab: 0.03, cx: 210, cy: -40, cmu: 3.1, cp: 1, cd: 0.1, lx: 120, ly: -10, lmu: 3.0, lp: 1, ld: 0.1 }),
    limbo: CG({ pel: 280, torso: -1.1, cab: -0.95, cx: -200, cy: -120, cmu: 0.4, cp: 1, cd: 1, lx: 330, ly: -60, lmu: 2.8, lp: 1, ld: 1 }),
    congelado: CG({ pel: 340, torso: -1.3, cab: -1.15, cx: -90, cy: 290, cmu: -1.5, cp: 1, cd: 1, lx: 320, ly: 190, lmu: 2.7, lp: 1, ld: 1 }),
    // tumbado (antes de girar el bloque −90°): recto, brazos abiertos
    tumbado: CG({ pel: 0, torso: 0, cab: 0.08, cx: -60, cy: -300, cmu: 1.6, cp: 1, cd: 0.8, lx: 70, ly: 230, lmu: -1.4, lp: 1, ld: 0.8 })
  };
  const GUION_CUERPO_G = [
    [T.gCruje, T.gCruje + 0.3, "cruje"], [T.gChulo + 0.1, T.gAnda0 + 0.1, "bolsillos"], [T.gBaja0, T.gBaja1, "limbo"],
    [T.cruje + 0.05, T.congela, "congelado"], [T.cae0, T.cae1, "tumbado", salida]
  ];
  const XG = [[0, 80], [T.gAnda0, 80], [T.gAnda1, 318], [T.gBaja1, 336], [T.gAvanza1, 470], [DUR, 470]];
  const PASOS_G = (() => {
    const cerca = [[-9, -8, 61]], lejos = [[-9, -8, 102]];
    // anda hasta el listón
    lejos.push([T.gAnda0, T.gAnda0 + 0.28, 190, 40]); cerca.push([T.gAnda0 + 0.22, T.gAnda0 + 0.5, 262, 40]);
    lejos.push([T.gAnda0 + 0.45, T.gAnda1, 340, 36]); cerca.push([T.gAnda1 - 0.2, T.gAnda1 + 0.05, 299, 20]);
    // al echarse atrás adelanta los pies
    cerca.push([T.gBaja0 + 0.08, T.gBaja0 + 0.38, 386, 22]); lejos.push([T.gBaja0 + 0.25, T.gBaja1, 436, 22]);
    // pasitos temblorosos bajo el listón
    const n = 4, t0 = T.gBaja1, t1 = T.gAvanza1;
    for (let i = 0; i < n; i++) {
      const tt = lerp(t0, t1, i / n), dur = (t1 - t0) / n * 0.75, xpel = recorrido(XG, tt + dur);
      (i % 2 ? lejos : cerca).push([tt, tt + dur, xpel + (i % 2 ? 108 : 64), 12]);
    }
    return { cerca, lejos };
  })();
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const BOLS_GC = manoDesde({ x: 131, y: 652 }, 0, -1.75), BOLS_GL = manoDesde({ x: 372, y: 648 }, 0, -1.75);

  /* ---------- caída de Guillermo: el cuerpo entero gira como un bloque alrededor de la pelvis ---------- */
  const PELVIS_PIE = SUELO + (G.PELVIS.y - G.SUELO) * S;        // y de pantalla de la pelvis de pie
  const LY = SUELO - 40;                                         // pelvis tumbado (la espalda toca el suelo)
  const LX = 520;                                                // x de la pelvis tumbado (la barriga bajo el listón)
  function caida(t, o) {
    // o: pelvis de pantalla de la postura interna (sin girar)
    const k = salida(fase(t, T.cae0, T.cae1));
    if (k <= 0) return { k: 0, phi: 0, dx: 0, dy: 0 };
    const phi = -Math.PI / 2 * k;
    // la pelvis viaja de donde estaba (congelado) a tumbado; rebota al tocar el suelo
    const de = { x: recorrido(XG, T.cae0), y: PELVIS_PIE + CUERPOS_G.congelado.pel * S };
    const a = { x: LX, y: LY };
    let x = lerp(de.x, a.x, k), y = lerp(de.y, a.y, k);
    const r = t > T.cae1 ? Math.exp(-(t - T.cae1) * 9) * Math.sin((t - T.cae1) * 22) : 0;
    y -= 5 * Math.max(0, r);
    // aplastado por el listón (y luego por la bota de Carla)
    y += 3 * aplasta(t);
    return { k, phi, dx: x - o.x, dy: y - o.y };
  }

  /* ---------- listón ---------- */
  // altura del listón (px sobre el suelo) y estado: en los postes o cayendo/rebotando sobre la barriga
  const PALO_X = LX - 20;                // el listón cae centrado sobre la barriga
  const ALTO_BARRIGA = 74;                // altura del listón apoyado en la barriga de Guillermo
  function liston(t) {
    let alto = t < T.clac ? ALTO0 : ALTO1;
    // ¡clac!: baja una muesca con un rebotito
    if (t >= T.clac - 0.08 && t < T.clac + 0.4) {
      const u = fase(t, T.clac - 0.08, T.clac);
      alto = lerp(ALTO0, ALTO1, entrada(u));
      if (t >= T.clac) alto = ALTO1 + 5 * Math.exp(-(t - T.clac) * 14) * Math.abs(Math.sin((t - T.clac) * 30));
    }
    if (t < T.suelta) return { alto, x: BX, ang: 0, cae: 0, delante: 0 };
    // rueda hacia delante fuera de los tacos y cae (gravedad) hasta la barriga; rebota dos veces
    const tc = t - T.suelta, g0 = 1900, caidaT = T.boing - T.suelta;
    const h0 = ALTO1 - ALTO_BARRIGA;
    if (t < T.boing) {
      const u = tc / caidaT;
      return { alto: ALTO1 - h0 * u * u, x: lerp(BX, PALO_X, u), ang: 0.06 * u, cae: 1, delante: 1 };
    }
    const tb = t - T.boing;
    const rebote = 22 * Math.exp(-tb * 5) * Math.abs(Math.sin(tb * 13));
    return { alto: ALTO_BARRIGA + rebote - 3 * aplasta(t), x: PALO_X, ang: 0.06 + 0.04 * Math.exp(-tb * 4) * Math.cos(tb * 13), cae: 1, delante: 1, rebote };
  }
  // hundimiento de la barriga: golpe del listón y luego la bota de Carla
  function aplasta(t) {
    const b = t >= T.boing ? Math.exp(-(t - T.boing) * 7) * Math.abs(Math.cos((t - T.boing) * 13)) : 0;
    const bota = tramo(t, T.bota - 0.06, T.bota + 0.06) * (1 - 0.3 * campana(t, T.bota, T.bota + 0.3));
    return Math.max(b, bota);
  }
  // tambaleo de los postes al caer Guillermo
  const tambaleo = t => t >= T.cae1 ? 0.05 * Math.exp(-(t - T.cae1) * 2.4) * Math.sin((t - T.cae1) * 14) : 0;

  /* ---------- posturas ---------- */
  function poseC(t) {
    const b = guion(GUION_CUERPO_C, CUERPOS_C, "bolsillos", t);
    const giro = fase(t, T.gira0, T.gira1), espejo = giro >= 0.5;
    const x = recorrido(XC, t), prof = recorrido(PROF_C, t);
    const ritmo = Math.sin(t * Math.PI * 2 * 1.05);               // baile al ritmo (≈126 ppm)
    const bailando = tramo(t, T.baila0, T.baila0 + 0.4) * (1 - tramo(t, T.mira - 0.1, T.mira + 0.2)) + 0.6 * tramo(t, T.va0, T.va0 + 0.3) * (1 - tramo(t, T.bota - 0.2, T.bota));
    const limbo = tramo(t, T.baja0, T.baja1) * (1 - tramo(t, T.pasa1, T.sube1));
    const respira = Math.sin(t * 2.1 + 1);
    const p = {
      x: x + 9 * ritmo * bailando, suelo: SUELO + prof, s: S, espejo, tirasLimpias: true,
      pelvis: { x: C.PELVIS.x, y: C.PELVIS.y + b.pel + respira * 1.2 - 14 * Math.abs(ritmo) * bailando },
      torso: b.torso + 0.05 * ritmo * bailando + 0.03 * Math.sin(t * Math.PI * 2.1) * limbo,
      torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab + 0.06 * Math.sin(t * Math.PI * 2.1 + 0.5) * bailando, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      pelo: { viento: 0, inercia: 0 }
    };
    // melena: se la echa atrás; en el limbo arrastra por el suelo (inercia hacia atrás al avanzar)
    p.pelo.inercia = -0.9 * campana(t, T.melena, T.melena + 0.5) - 0.55 * limbo + 0.35 * campana(t, T.pasa1, T.sube1 + 0.3)
      + 0.4 * campana(t, T.gira0, T.gira1 + 0.3) + 0.25 * ritmo * bailando;
    // pies
    for (const lado of ["cerca", "lejos"]) {
      const f = pie(PASOS_C[lado], t);
      const tob = C.aHoja(p, { x: f.x, y: SUELO + prof }).x;
      p.piernas[lado] = { tob: { x: tob, y: TOB_C[lado] - f.alza / (S * C.K) }, ang: -0.15 * Math.sin(Math.PI * f.u) * (f.alza > 1 ? 1 : 0) };
    }
    // bota sobre el listón: el pie cercano sube hasta la barriga de Guillermo
    const bota = tramo(t, T.bota - 0.3, T.bota);
    if (bota > 0) {
      const L = liston(t), destino = C.aHoja(p, { x: L.x + 40, y: SUELO - L.alto - 5 });
      const q = p.piernas.cerca;
      q.tob = mezcla(q.tob, { x: destino.x, y: destino.y - C.TOBILLO_ALTO * 0.6 }, bota); q.ang = lerp(q.ang, -0.3, bota);
    }
    // cara
    const ex = guion(GUION_CARA_C, CARAS_C, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [1.25, 4.3, 7.95, 9.85, 12.2]));
    p.cara.rubor = 0.35 * tramo(t, T.risa0, T.risa0 + 0.3) * (1 - tramo(t, T.va1, T.va1 + 0.4));
    // manos (respecto a sus hombros); en el bolsillo hasta que baila
    const Tr = C.tronco(p), hc = Tr(C.HOMBRO_C), hl = Tr(C.HOMBRO);
    const bC = Tr(C.BOLSILLO_C), bL = Tr(C.BOLSILLO_L);
    let c = mezcla({ x: hc.x + b.cx, y: hc.y + b.cy }, bC, 1 - clamp(b.cp * 1.4));
    let l = mezcla({ x: hl.x + b.lx, y: hl.y + b.ly }, bL, 1 - clamp(b.lp * 1.4));
    // baile: las manos giran al ritmo; en el limbo se mecen para equilibrarse
    const rr = Math.sin(t * Math.PI * 2 * 1.05 + 1.2);
    c = { x: c.x + 22 * rr * bailando, y: c.y + 18 * Math.cos(t * Math.PI * 2.1) * bailando + 14 * Math.sin(t * 6) * limbo };
    l = { x: l.x - 20 * rr * bailando, y: l.y - 16 * Math.cos(t * Math.PI * 2.1) * bailando - 16 * Math.sin(t * 6 + 1) * limbo };
    if (limbo > 0) {
      const hs = C.aPantalla(p, hc), destino = C.aHoja(p, { x: hs.x - 64, y: Math.min(hs.y + 24, SUELO - 30) });
      c = mezcla(c, { x: destino.x + 22 * Math.sin(t * 6) * 0.3, y: destino.y }, limbo);
    }
    // listón: el índice de la mano lejana empuja el extremo derecho del listón
    if (b.pinza > 0.01) {
      const L = liston(t), punta = C.aHoja(p, { x: BX + BHW - 6, y: SUELO - L.alto - 14 });
      l = mezcla(l, punta, b.pinza);
    }
    // risa: la mano lejana a la boca
    const tapa = campana(t, T.risa0 - 0.05, T.risa1 + 0.2);
    if (tapa > 0) { const bo = C.boca(p); l = mezcla(l, { x: bo.x + 70, y: bo.y + 30 }, clamp(tapa * 1.6)); }
    const ldedos = b.pinza > 0.3 ? { pulgar: 0.2, indice: 1, medio: 0.15, anular: 0.1, menique: 0.1 } : dedosTodos(b.ld);
    p.manoCerca = { x: c.x, y: c.y, ang: 0, mu: b.cmu, dobla: -1, puno: b.cp, dedos: dedosTodos(b.cd) };
    p.manoLejos = { x: l.x, y: l.y, ang: 0, mu: lerp(b.lmu, -0.4, clamp(tapa * 1.6)), dobla: b.ldob, puno: b.lp, dedos: ldedos };
    p.giro = giro; p.prof = prof;
    // flor de hibisco en el pelo
    p.capaCabeza = g => flor(g, 690, 400, 46, -0.3, "#ff4f7b", "#ffd54a");
    return p;
  }

  function poseG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "bolsillos", t);
    const x = recorrido(XG, t), respira = Math.sin(t * 2.3);
    const tension = tramo(t, T.cruje, T.congela) * (1 - tramo(t, T.cae0, T.cae0 + 0.1));
    const tiembla = tension * (1.2 + 2.2 * tramo(t, T.congela, T.cae0));
    const bamboleo = tramo(t, T.gBaja0 + 0.2, T.gBaja1) * (1 - tramo(t, T.congela - 0.2, T.congela));
    const p = {
      x: x + ruido(t * 40) * tiembla * 0.6, suelo: SUELO, s: S, tirasLimpias: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 + ruido(t * 37 + 3) * tiembla },
      torso: b.torso + 0.12 * Math.sin((t - T.gBaja0) * 7.5) * bamboleo + ruido(t * 29 + 1) * tiembla * 0.008,
      torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab + 0.08 * Math.sin((t - T.gBaja0) * 7.5 + 0.6) * bamboleo + ruido(t * 33 + 7) * tiembla * 0.012, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // asiente al ritmo mientras mira
    const asiente = tramo(t, 0.5, 0.9) * (1 - tramo(t, 3.2, 3.5)) + tramo(t, T.pose0 + 0.3, T.pose0 + 0.6) * (1 - tramo(t, T.gCruje - 0.1, T.gCruje));
    p.cabeza.ang += 0.06 * Math.max(0, Math.sin(t * Math.PI * 2 * 1.05)) * asiente;
    p.pelvis.y -= 6 * Math.abs(Math.sin(t * Math.PI * 2 * 1.05)) * asiente;
    // pasmo: se inclina hacia delante mientras pasa Carla
    const pasmo = tramo(t, 3.3, 3.7) * (1 - tramo(t, T.pose0, T.pose0 + 0.4));
    p.torso += 0.09 * pasmo; p.cabeza.ang += 0.08 * pasmo; p.cabeza.dy = -0;
    // pies
    for (const lado of ["cerca", "lejos"]) {
      const f = pie(PASOS_G[lado], t);
      p.piernas[lado] = { tob: { x: G.PELVIS.x + (f.x - p.x) / S, y: TOB_G[lado] - f.alza / S + ruido(t * 41 + (lado === "cerca" ? 2 : 5)) * tiembla * 0.5 }, ang: -0.2 * Math.sin(Math.PI * f.u) * (f.alza > 1 ? 1 : 0) };
    }
    // tumbado: piernas rectas desde las caderas y, con el ¡boing!, suben de golpe
    const cae = salida(fase(t, T.cae0, T.cae1));
    if (cae > 0) {
      const sube = (t >= T.boing ? Math.exp(-(t - T.boing) * 4.5) * clamp((t - T.boing) / 0.06) : 0) + 0.35 * campana(t, T.bota, T.bota + 0.5);
      for (const lado of ["cerca", "lejos"]) {
        const cad = G.CADERA[lado], q = p.piernas[lado];
        const recto = { x: cad.x + (lado === "cerca" ? -6 : 10) + 340 * sube, y: G.SUELO - G.TOBILLO_ALTO - 10 - 260 * sube + (lado === "cerca" ? 0 : -12) };
        q.tob = mezcla(q.tob, recto, cae); q.ang = lerp(q.ang, -0.1 - 0.9 * sube, cae);
      }
    }
    // cara
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [1.4, 4.9, 6.25, 8.35]));
    p.rojo = 0.9 * tramo(t, T.cruje + 0.1, T.congela + 0.3) * (1 - tramo(t, T.cae0, T.cae1 + 0.4));
    p.cara.rubor = p.rojo * 0.8 + 0.4 * tramo(t, T.bota, T.bota + 0.2);
    p.sudor = tramo(t, T.cruje, T.congela) * (1 - tramo(t, T.cae1, T.cae1 + 0.6));
    p.enfado = 0;
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    let c = mezcla({ x: hc.x + b.cx, y: hc.y + b.cy }, BOLS_GC, 1 - clamp(b.cp * 1.4));
    let l = mezcla({ x: hl.x + b.lx, y: hl.y + b.ly }, BOLS_GL, 1 - clamp(b.lp * 1.4));
    // aspas: los brazos giran al tambalearse
    const aspa = bamboleo + 0.35 * tension;
    c = { x: c.x + 60 * Math.sin((t - T.gBaja0) * 9) * aspa, y: c.y + 70 * Math.cos((t - T.gBaja0) * 9) * aspa };
    l = { x: l.x - 50 * Math.sin((t - T.gBaja0) * 9 + 1) * aspa, y: l.y - 60 * Math.cos((t - T.gBaja0) * 9 + 1) * aspa };
    // crujirse los dedos: manos juntas delante del pecho
    const cruje = campana(t, T.gCruje, T.gChulo + 0.1);
    // boing: brazos arriba (en el marco girado: hacia delante)
    const sube = t >= T.boing ? Math.exp(-(t - T.boing) * 4) * clamp((t - T.boing) / 0.06) : 0;
    const mano = (m, hombro, k) => mezcla(m, { x: hombro.x + 300, y: hombro.y + 10 }, k);
    c = mano(c, hc, sube * cae); l = mano(l, hl, sube * cae);
    // tumbado: levanta una mano floja (se rinde)
    const rinde = tramo(t, T.gana + 0.15, T.gana + 0.45) * cae;
    l = mezcla(l, { x: hl.x + 280 + 10 * Math.sin(t * 16), y: hl.y - 40 }, rinde);
    p.manoCerca = { x: c.x, y: c.y, ang: 0, mu: b.cmu, dobla: -1, puno: b.cp, dedos: dedosTodos(lerp(b.cd, 0.1, cruje)) };
    p.manoLejos = { x: l.x, y: l.y, ang: 0, mu: lerp(b.lmu, 3.0, rinde), dobla: -1, puno: b.lp, dedos: dedosTodos(lerp(b.ld, 1, rinde)) };
    if (cruje > 0) {
      const pecho = Tr({ x: 330, y: 470 });
      p.manoCerca = Object.assign(p.manoCerca, mezcla(p.manoCerca, { x: pecho.x + 20, y: pecho.y }, cruje), { mu: lerp(b.cmu, 3.1, cruje), puno: Math.max(b.cp, cruje) });
      p.manoLejos = Object.assign(p.manoLejos, mezcla(p.manoLejos, { x: pecho.x + 60, y: pecho.y - 10 }, cruje), { mu: lerp(b.lmu, 3.1, cruje), puno: Math.max(b.lp, cruje) });
    }
    p.ikContinuo = false;
    // collar de flores
    p.capaTronco = g => collarFlores(g, t, p);
    const o = G.aPantalla(p, p.pelvis);
    p.caida = caida(t, o); p.o = o;
    return p;
  }
  const pose = t => ({ g: poseG(t), c: poseC(t) });

  /* ---------- atrezo: flores ---------- */
  function flor(g, x, y, r, rot, petalo, centro) {
    g.save(); g.translate(x, y); g.rotate(rot); g.lineJoin = "round";
    g.beginPath();
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; g.moveTo(Math.cos(a) * r * 0.55 + r * 0.45, Math.sin(a) * r * 0.55); g.arc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.45, 0, Math.PI * 2); }
    g.lineWidth = r * 0.14; g.strokeStyle = "#0b0a0e"; g.stroke(); g.fillStyle = petalo; g.fill();
    g.fillStyle = "rgba(255,255,255,0.35)"; for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; g.beginPath(); g.ellipse(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45, r * 0.16, r * 0.08, a, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = centro; g.beginPath(); g.arc(0, 0, r * 0.2, 0, Math.PI * 2); g.fill(); g.lineWidth = r * 0.06; g.stroke();
    g.restore();
  }
  // collar hawaiano de Guillermo (coordenadas de la hoja del torso)
  const COLORES_COLLAR = ["#ff4f7b", "#ffd54a", "#ffffff", "#ff8a3d", "#c86bff"];
  function collarFlores(g, t, p) {
    const n = 9;
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1), x = lerp(150, 345, u), cuelga = Math.sin(Math.PI * u);
      const y = 300 + 150 * cuelga + 6 * Math.sin(u * 9);
      flor(g, x, y, 34, i * 1.3 + 0.2 * Math.sin(t * 2 + i), COLORES_COLLAR[i % 5], "#ffe27a");
    }
  }

  /* ---------- decorado ---------- */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 140; const g = c.getContext("2d");
    g.translate(60, 70);
    // pared de bambú en tonos verde azulado
    const pared = g.createLinearGradient(0, -70, 0, 440); pared.addColorStop(0, "#0d2b2e"); pared.addColorStop(1, "#1d4f4a");
    g.fillStyle = pared; g.fillRect(-60, -70, W + 120, 520);
    for (let x = -60; x < W + 60; x += 26) {
      g.fillStyle = (Math.round(x / 26) % 2) ? "rgba(255,240,180,0.035)" : "rgba(0,0,0,0.07)"; g.fillRect(x, -70, 26, 520);
      g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(x, -70, 2, 520);
      for (let y = -40 + (Math.round(x / 26) % 3) * 30; y < 440; y += 92) { g.fillStyle = "rgba(0,0,0,0.22)"; g.fillRect(x + 2, y, 24, 3); g.fillStyle = "rgba(255,240,180,0.08)"; g.fillRect(x + 2, y + 3, 24, 2); }
    }
    // ventana redonda con la luna sobre el mar
    g.save(); g.translate(842, 116);
    g.fillStyle = "#3b2414"; g.beginPath(); g.arc(0, 0, 74, 0, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.arc(0, 0, 64, 0, Math.PI * 2); g.clip();
    const cielo = g.createLinearGradient(0, -64, 0, 64); cielo.addColorStop(0, "#0b1440"); cielo.addColorStop(1, "#283c8a"); g.fillStyle = cielo; g.fillRect(-64, -64, 128, 128);
    g.fillStyle = "#123a6a"; g.fillRect(-64, 16, 128, 60);
    g.fillStyle = "#fff3c4"; g.beginPath(); g.arc(14, -16, 17, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,243,196,0.5)"; for (let i = 0; i < 5; i++) g.fillRect(4 - i * 2, 22 + i * 7, 20 + i * 4, 2);
    g.fillStyle = "#ffffff"; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(-50 + hash(i + 3) * 100, -55 + hash(i + 9) * 60, 1.2, 0, Math.PI * 2); g.fill(); }
    // silueta de palmera en la playa
    g.strokeStyle = "#08101e"; g.lineWidth = 4; g.beginPath(); g.moveTo(-34, 30); g.quadraticCurveTo(-30, -2, -18, -20); g.stroke();
    g.fillStyle = "#08101e"; for (let i = 0; i < 5; i++) { const a = -2.6 + i * 0.6; g.beginPath(); g.ellipse(-18 + Math.cos(a) * 14, -20 + Math.sin(a) * 9, 16, 4, a, 0, Math.PI * 2); g.fill(); }
    g.restore();
    g.lineWidth = 4; g.strokeStyle = "#0b0a0e"; g.beginPath(); g.arc(0, 0, 74, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(0, 0, 64, 0, Math.PI * 2); g.stroke();
    g.restore();
    // ukelele colgado
    g.save(); g.translate(150, 150); g.rotate(-0.35); g.lineJoin = "round";
    g.fillStyle = "#3a2010"; g.fillRect(-5, -110, 10, 70); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.strokeRect(-5, -110, 10, 70);
    g.fillStyle = "#c8833e"; g.beginPath(); g.ellipse(0, -18, 22, 26, 0, 0, Math.PI * 2); g.ellipse(0, 22, 28, 30, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(0, -18, 22, 26, 0, Math.PI * 1.15, Math.PI * 1.85, false); g.stroke();
    g.beginPath(); g.ellipse(0, 22, 28, 30, 0, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.ellipse(0, -18, 22, 26, 0, -0.6, Math.PI + 0.6, true); g.stroke();
    g.fillStyle = "#1a0e06"; g.beginPath(); g.arc(0, 6, 9, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#5a3418"; g.fillRect(-9, 30, 18, 5);
    g.strokeStyle = "rgba(255,255,255,0.6)"; g.lineWidth = 0.8; for (let i = -1.5; i <= 1.5; i++) { g.beginPath(); g.moveTo(i * 2.2, -108); g.lineTo(i * 2.6, 32); g.stroke(); }
    g.restore();
    // cuadro con una ola (sin letras)
    g.fillStyle = "#3b2414"; g.fillRect(560, 46, 120, 84); g.fillStyle = "#f3e2b8"; g.fillRect(568, 54, 104, 68);
    g.fillStyle = "#2d8fb0"; g.beginPath(); g.moveTo(568, 122); g.quadraticCurveTo(590, 70, 632, 76); g.quadraticCurveTo(606, 84, 612, 100); g.quadraticCurveTo(640, 92, 672, 104); g.lineTo(672, 122); g.closePath(); g.fill();
    g.fillStyle = "#ff9a3d"; g.beginPath(); g.arc(650, 74, 9, 0, Math.PI * 2); g.fill();
    // palmera hinchable (a la izquierda)
    g.save(); g.translate(30, 430); g.lineJoin = "round"; g.lineCap = "round";
    g.fillStyle = "#b06a2a"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(-14, 0); g.quadraticCurveTo(-4, -140, 22, -230); g.lineTo(42, -226); g.quadraticCurveTo(18, -140, 18, 0); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = 2; for (let i = 1; i < 8; i++) { const y = -i * 28; g.beginPath(); g.moveTo(-10 + i * 2.5, y); g.lineTo(16 + i * 2.6, y - 4); g.stroke(); }
    for (let i = 0; i < 6; i++) { const a = -Math.PI + 0.2 + i * 0.55;
      g.save(); g.translate(32, -232); g.rotate(a); g.fillStyle = i % 2 ? "#3fae4a" : "#2c8c3a"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 3;
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(50, -24, 104, 10); g.quadraticCurveTo(52, 6, 0, 0); g.closePath(); g.fill(); g.stroke(); g.restore(); }
    g.fillStyle = "#8a4a1a"; g.beginPath(); g.arc(26, -226, 9, 0, Math.PI * 2); g.arc(40, -220, 8, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
    // zócalo de caña
    const zo = g.createLinearGradient(0, 432, 0, SUELO); zo.addColorStop(0, "#5a3a1a"); zo.addColorStop(1, "#3a240e");
    g.fillStyle = zo; g.fillRect(-60, 432, W + 120, SUELO - 432);
    for (let x = -60; x < W + 60; x += 14) { g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(x, 432, 2, SUELO - 432); g.fillStyle = "rgba(255,220,150,0.08)"; g.fillRect(x + 2, 432, 3, SUELO - 432); }
    g.fillStyle = "#8a5a2a"; g.fillRect(-60, 426, W + 120, 8); g.fillStyle = "#b07a3a"; g.fillRect(-60, 426, W + 120, 2);
    // suelo de tarima
    const su = g.createLinearGradient(0, SUELO, 0, H + 70); su.addColorStop(0, "#7a4a24"); su.addColorStop(1, "#2e1a0c");
    g.fillStyle = su; g.fillRect(-60, SUELO, W + 120, H + 70 - SUELO);
    g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = 2;
    for (let y = SUELO + 9; y < H + 70; y += 11 + (y - SUELO) * 0.28) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    for (let i = 0; i < 26; i++) { const x0 = -60 + i * 46; g.beginPath(); g.moveTo(x0 + 30, SUELO); g.lineTo(x0 + (x0 - 512) * 0.5 + 30, H + 70); g.stroke(); }
    g.fillStyle = "rgba(255,220,160,0.14)"; g.fillRect(-60, SUELO, W + 120, 2);
    // viñeta
    const v = g.createRadialGradient(512, 300, 300, 512, 300, 720); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.5)");
    g.fillStyle = v; g.fillRect(-60, -70, W + 120, H + 140);
    return c;
  }
  // farolillos y guirnalda (encima de la pared, se mecen un poco)
  const FAROLES = [[90, "#ff6b8b"], [210, "#ffb23d"], [330, "#7be0a0"], [450, "#ff6b8b"], [570, "#ffe15a"], [690, "#7fc8ff"], [810, "#ffb23d"], [930, "#c88bff"]];
  function farolillos(g, t) {
    g.save(); g.lineJoin = "round";
    g.strokeStyle = "#151515"; g.lineWidth = 2; g.beginPath(); g.moveTo(-40, 6);
    for (let x = -40; x <= W + 40; x += 20) g.lineTo(x, 34 + 16 * Math.pow(Math.sin(((x + 40) / 120) * Math.PI), 2));
    g.stroke();
    for (const [x, col] of FAROLES) {
      const y = 34 + 16 * Math.pow(Math.sin(((x + 40) / 120) * Math.PI), 2), a = 0.06 * Math.sin(t * 1.6 + x * 0.05);
      g.save(); g.translate(x, y); g.rotate(a);
      const halo = g.createRadialGradient(0, 22, 2, 0, 22, 46); halo.addColorStop(0, col + "88"); halo.addColorStop(1, col + "00");
      g.fillStyle = halo; g.beginPath(); g.arc(0, 22, 46, 0, Math.PI * 2); g.fill();
      g.fillStyle = col; g.beginPath(); g.ellipse(0, 22, 15, 18, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.stroke();
      g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 1.2; for (let i = -1; i <= 1; i++) { g.beginPath(); g.ellipse(0, 22, 15 * Math.abs(i * 0.6) + 0.5, 18, 0, 0, Math.PI * 2); g.stroke(); }
      g.fillStyle = "#151515"; g.fillRect(-6, 2, 12, 4); g.fillRect(-5, 39, 10, 3);
      g.restore();
    }
    g.restore();
  }
  // focos de colores que barren la pared (suaves)
  function focos(g, t) {
    g.save(); g.globalCompositeOperation = "lighter";
    const F = [["255,80,140", 0.0, 260], ["80,200,255", 2.1, 220], ["255,200,60", 4.2, 240]];
    for (const [col, fa, r] of F) {
      const x = 512 + 380 * Math.sin(t * 0.55 + fa), y = 230 + 60 * Math.sin(t * 0.8 + fa * 1.7);
      const gr = g.createRadialGradient(x, y, 10, x, y, r); gr.addColorStop(0, `rgba(${col},0.16)`); gr.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    g.restore();
  }
  // notas musicales que flotan (redondas)
  function notas(g, t) {
    const k = tramo(t, 0.3, 0.9) * (1 - tramo(t, T.cae0, T.cae0 + 0.3)) + tramo(t, T.risa0, T.risa0 + 0.4);
    if (k <= 0.01) return;
    g.save(); g.lineCap = "round";
    for (let i = 0; i < 5; i++) {
      const ph = (t * 0.32 + i / 5) % 1, x = 120 + i * 190 + 30 * Math.sin(t * 1.5 + i), y = 330 - ph * 220;
      g.globalAlpha = k * Math.sin(Math.PI * ph) * 0.85; g.fillStyle = ["#ffe15a", "#ff8ab0", "#9ef0ff"][i % 3]; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2;
      g.beginPath(); g.ellipse(x, y, 7, 5.2, -0.4, 0, Math.PI * 2); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(x + 6, y - 2); g.lineTo(x + 6, y - 24); g.quadraticCurveTo(x + 14, y - 20, x + 15, y - 12); g.stroke();
    }
    g.restore();
  }

  /* ---------- limbo: dos postes de bambú (por detrás) y el listón de rayas ---------- */
  const POSTE_ALTO = 262;
  function poste(g, x, t, lado) {
    const a = tambaleo(t) * (lado < 0 ? 1 : -0.8);
    g.save(); g.translate(x, SUELO - 6); g.rotate(a); g.lineJoin = "round"; g.lineCap = "round";
    // base en cruz
    g.fillStyle = "#6a4420"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5;
    g.beginPath(); g.ellipse(0, 3, 30, 6, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    // caña
    const gr = g.createLinearGradient(-6, 0, 6, 0); gr.addColorStop(0, "#c8a04a"); gr.addColorStop(0.5, "#f2d27a"); gr.addColorStop(1, "#a07a2a");
    g.fillStyle = gr; g.fillRect(-6, -POSTE_ALTO, 12, POSTE_ALTO); g.strokeRect(-6, -POSTE_ALTO, 12, POSTE_ALTO);
    for (let y = -40; y > -POSTE_ALTO; y -= 46) { g.strokeStyle = "#5a3a10"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-7, y); g.lineTo(7, y); g.stroke(); }
    g.fillStyle = "#f2d27a"; g.beginPath(); g.ellipse(0, -POSTE_ALTO, 6, 2.5, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.stroke();
    // tacos (las muescas) hacia dentro
    for (const h of PEGS) { g.fillStyle = "#3a2410"; g.beginPath(); g.ellipse(-lado * 9, -h + 6, 5, 3.4, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.5; g.stroke(); }
    g.restore();
  }
  function palo(g, x, y, ang, largo) {
    g.save(); g.translate(x, y); g.rotate(ang); g.lineJoin = "round";
    const w = 9, l = largo / 2;
    g.fillStyle = "#fff4e0"; g.beginPath(); g.roundRect ? g.roundRect(-l, -w / 2, largo, w, w / 2) : g.rect(-l, -w / 2, largo, w); g.fill();
    g.save(); g.clip();
    for (let i = 0; i < 14; i++) { const x0 = -l + i * largo / 14; g.fillStyle = ["#ff4f4f", "#ffd23d", "#3fbf6a", "#3d8bff"][i % 4]; g.beginPath(); g.moveTo(x0, -w); g.lineTo(x0 + largo / 28, -w); g.lineTo(x0 + largo / 28 - 6, w); g.lineTo(x0 - 6, w); g.closePath(); g.fill(); }
    g.fillStyle = "rgba(255,255,255,0.45)"; g.fillRect(-l, -w / 2 + 1, largo, 2);
    g.restore();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.2; g.beginPath(); g.roundRect ? g.roundRect(-l, -w / 2, largo, w, w / 2) : g.rect(-l, -w / 2, largo, w); g.stroke();
    g.restore();
  }
  const LARGO_PALO = 2 * BHW + 26;
  function listonEnPostes(g, t) {
    const L = liston(t); if (L.delante) return;
    const a = tambaleo(t);
    palo(g, L.x + a * 40, SUELO - L.alto, L.ang, LARGO_PALO);
  }
  function listonDelante(g, t) {
    const L = liston(t); if (!L.delante) return;
    palo(g, L.x, SUELO - L.alto, L.ang, LARGO_PALO);
  }

  /* ---------- efectos ---------- */
  function estrellaPuntas(g, x, y, r, puntas, rot, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function impacto(g, t, t0, x, y, tam) {
    const k = fase(t, t0, t0 + 0.3); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    estrellaPuntas(g, x, y, tam * (0.6 + 0.8 * salida(k)), 12, 0.3, 0.42); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 3; g.strokeStyle = "#0b0a0e"; g.stroke();
    estrellaPuntas(g, x, y, tam * (0.35 + 0.5 * salida(k)), 12, 0.55, 0.5); g.fillStyle = "#ffffff"; g.fill();
    g.restore();
  }
  function destello(g, x, y, k, t) {
    if (k <= 0.01) return;
    g.save(); g.globalAlpha = k; g.fillStyle = "#fffbe0"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) { const a = t * 2 + i * 2.1, r = (7 + 3 * Math.sin(t * 9 + i)) * k; const xx = x + Math.cos(a) * 26, yy = y + Math.sin(a) * 18;
      estrellaPuntas(g, xx, yy, r, 4, t * 1.5, 0.3); g.fill(); g.stroke(); }
    g.restore();
  }
  // cruje la espalda: zigzags blancos en la zona lumbar
  function crujido(g, t, pg) {
    const k = fase(t, T.cruje, T.cruje + 0.35); if (k <= 0 || k >= 1) return;
    const c = G.aPantalla(pg, G.tronco(pg)({ x: 150, y: 600 }));
    g.save(); g.strokeStyle = `rgba(255,255,255,${1 - k})`; g.lineWidth = 2.6; g.lineCap = "round"; g.lineJoin = "round";
    for (let i = 0; i < 3; i++) { const a = Math.PI * 0.75 + (i - 1) * 0.5, r0 = 14 + 14 * k;
      const x0 = c.x + Math.cos(a) * r0, y0 = c.y + Math.sin(a) * r0, dx = Math.cos(a) * 5, dy = Math.sin(a) * 5, nx = -dy, ny = dx;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + dx + nx * 0.8, y0 + dy + ny * 0.8); g.lineTo(x0 + 2 * dx - nx * 0.8, y0 + 2 * dy - ny * 0.8); g.lineTo(x0 + 3 * dx, y0 + 3 * dy); g.stroke(); }
    g.fillStyle = `rgba(255,225,77,${1 - k})`; estrellaPuntas(g, c.x - 6, c.y + 2, 8 * (1 - k * 0.5), 4, 0.4, 0.35); g.fill();
    g.restore();
  }
  function estrellitas(g, t, cabeza) {
    const k = tramo(t, T.boing + 0.25, T.boing + 0.55) * (1 - tramo(t, T.fin - 0.2, T.fin + 0.2)); if (k <= 0.01) return;
    const pts = [];
    for (let i = 0; i < 5; i++) { const a = t * 4 + i * Math.PI * 2 / 5; pts.push({ a, x: cabeza.x + Math.cos(a) * 42, y: cabeza.y + Math.sin(a) * 12, z: Math.sin(a) }); }
    pts.sort((u, v) => u.z - v.z);
    g.save();
    for (const q of pts) { const r = (7.5 + 2.5 * q.z) * k; estrellaPuntas(g, q.x, q.y, r, 5, t * 3 + q.a, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2; g.strokeStyle = "#0b0a0e"; g.stroke(); }
    g.restore();
  }
  function polvo(g, t, x0, t0) {
    const k = fase(t, t0 - 0.02, t0 + 0.9); if (k <= 0 || k >= 1) return;
    g.save();
    for (let i = 0; i < 10; i++) { const lado = i % 2 ? 1 : -1, d = (30 + 120 * salida(k)) * (0.5 + hash(i + 70) * 0.7);
      g.globalAlpha = 0.4 * (1 - k); g.fillStyle = "#c9a27a";
      g.beginPath(); g.ellipse(x0 + lado * d, SUELO - 6 - 22 * k * hash(i + 71), 14 + 22 * k, 7 + 10 * k, 0, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // líneas del giro de Carla
  function lineasGiro(g, t, pc) {
    const k = campana(t, T.gira0, T.gira1); if (k <= 0.01) return;
    const o = C.aPantalla(pc, pc.pelvis);
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.7 * k})`; g.lineWidth = 2.5; g.lineCap = "round";
    for (let i = 0; i < 4; i++) { const y = o.y - 140 + i * 50; g.beginPath(); g.ellipse(o.x, y, 50, 8, 0, Math.PI * 0.1, Math.PI * 0.9); g.stroke(); }
    g.restore();
  }
  // líneas de «¡boing!» alrededor del listón al rebotar
  function lineasBoing(g, t) {
    const k = fase(t, T.boing, T.boing + 0.45); if (k <= 0 || k >= 1) return;
    const L = liston(t);
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.9 * (1 - k)})`; g.lineWidth = 2.4; g.lineCap = "round";
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const x = L.x + s * (LARGO_PALO / 2 + 10 + 6 * i), y = SUELO - L.alto;
      g.beginPath(); g.moveTo(x, y - 12 + i * 2); g.quadraticCurveTo(x + s * 6, y, x, y + 12 - i * 2); g.stroke(); }
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const g1 = tramo(t, T.gBaja0, T.congela, suave) * (1 - tramo(t, T.cae1, T.cae1 + 0.8, suave));
    const c1 = tramo(t, T.baja0, T.baja1, suave) * (1 - tramo(t, T.pasa1, T.sube1 + 0.3, suave));
    const f1 = tramo(t, T.va0, T.gana, suave);
    return { k: 1.0 + 0.1 * g1 + 0.04 * c1 + 0.06 * f1, x: 512 - 30 * g1 - 10 * f1, y: 300 + 40 * g1 + 26 * c1 + 34 * f1 };
  }

  // dibuja a Carla con el giro (estrechándose de lado a lado)
  function dibujaCarla(g, pc, t) {
    const o = C.aPantalla(pc, pc.pelvis), sx = Math.max(0.02, Math.abs(Math.cos(Math.PI * pc.giro)));
    g.save();
    if (sx < 0.999) { g.translate(o.x, 0); g.scale(sx, 1); g.translate(-o.x, 0); }
    // en el limbo la melena llega al suelo: lo que pasaría por debajo se recorta y se dibuja barriendo
    if (t > T.baja0 && t < T.sube1 + 0.3) { g.beginPath(); g.rect(-200, -400, W + 400, SUELO + pc.prof + 1 + 400); g.clip(); }
    C.dibujar(g, pc, t);
    g.restore();
  }
  function dibujaGuillermo(g, pg, t) {
    const cd = pg.caida, o = pg.o;
    g.save();
    if (cd.k > 0) { g.translate(o.x + cd.dx, o.y + cd.dy); g.rotate(cd.phi); g.translate(-o.x, -o.y); }
    G.dibujar(g, pg, t);
    g.restore();
  }
  // punto de la pantalla de Guillermo con la caída aplicada
  function enCaida(pg, q) {
    const cd = pg.caida, o = pg.o; if (!cd.k) return q;
    const c = Math.cos(cd.phi), s = Math.sin(cd.phi), dx = q.x - o.x, dy = q.y - o.y;
    return { x: o.x + cd.dx + dx * c - dy * s, y: o.y + cd.dy + dx * s + dy * c };
  }

  class Limbo extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !C.listo()) return;
      if (!fondo) fondo = creaFondo();
      const P = pose(t), pg = P.g, pc = P.c;
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = (t >= T.cae1 ? 6 * Math.exp(-(t - T.cae1) * 7) * suave(fase(t, T.cae1, T.cae1 + 0.04)) : 0)
        + (t >= T.boing ? 4 * Math.exp(-(t - T.boing) * 8) * suave(fase(t, T.boing, T.boing + 0.04)) : 0);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -60, -70);
      focos(g, t);
      farolillos(g, t);
      // sombras
      g.save(); g.fillStyle = "rgba(0,0,0,0.34)";
      const cd = pg.caida, og = enCaida(pg, pg.o);
      g.beginPath(); g.ellipse(lerp(pg.o.x, og.x - 20, cd.k), SUELO + 1, lerp(80, 170, cd.k), 8, 0, 0, Math.PI * 2); g.fill();
      const oc = C.aPantalla(pc, pc.pelvis);
      g.beginPath(); g.ellipse(oc.x + (pc.espejo ? -20 : 20) * tramo(t, T.baja0, T.baja1) * (1 - tramo(t, T.pasa1, T.sube1)), SUELO + 1 + pc.prof, 76, 7, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(BX - BHW - 6, SUELO + 1, 34, 5, 0, 0, Math.PI * 2); g.ellipse(BX + BHW + 6, SUELO + 1, 34, 5, 0, 0, Math.PI * 2); g.fill();
      g.restore();
      // limbo (por detrás de los dos)
      poste(g, BX - BHW - 6, t, -1); poste(g, BX + BHW + 6, t, 1);
      listonEnPostes(g, t);
      notas(g, t);
      // Guillermo y Carla (al final Carla va por delante)
      if (pc.prof > 0.5) { dibujaGuillermo(g, pg, t); listonDelante(g, t); dibujaCarla(g, pc, t); }
      else { dibujaCarla(g, pc, t); dibujaGuillermo(g, pg, t); listonDelante(g, t); }
      // efectos
      crujido(g, t, pg);
      lineasGiro(g, t, pc);
      lineasBoing(g, t);
      polvo(g, t, LX - 40, T.cae1);
      const L = liston(t);
      impacto(g, t, T.boing, L.x, SUELO - L.alto - 4, 30);
      impacto(g, t, T.clac, BX + BHW, SUELO - ALTO1, 16);
      const cab = enCaida(pg, G.aPantalla(pg, G.cabeza(pg).a({ x: 760, y: 470 })));
      estrellitas(g, t, cab);
      const bc = C.aPantalla(pc, C.cabeza(pc).a({ x: 880, y: 330 }));
      destello(g, bc.x, bc.y, campana(t, T.guino - 0.1, T.guino + 0.6) + campana(t, T.gana - 0.05, T.gana + 0.75), t);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00043", nombre: "Guillermo y Carla · El limbo", crear: () => new Limbo() });
  window.__A2D_00043 = { pose, T, DUR, liston };
})();
