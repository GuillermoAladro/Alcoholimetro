"use strict";
/* 00028 · Guillermo y Marcos · Vestirse en tres segundos
 *
 * Negro → vestuario del parque de bomberos: taquillas, un cronómetro enorme en la pared, el timbre de
 * alarma y una percha con un equipo de repuesto (dos botas y un pantalón de intervención con tirantes).
 * Marcos se toma un café junto a Guillermo → suena la alarma: los dos dan un respingo, el cronómetro
 * arranca y Marcos, con una sonrisa a cámara, se convierte en un torbellino → sale equipado (botella de
 * aire a la espalda, correas y hacha al hombro) en posa de héroe; el cronómetro apenas se ha movido.
 * Mira el reloj, orgulloso, y le cede el turno a Guillermo → Guillermo, picado, va a la percha: mete la
 * mano en una bota y se la queda puesta en la mano; la mira y la sacude sin suerte → coge el pantalón y
 * salta a la pata coja intentando meter el pie → tira tan fuerte que el pantalón sale volando y le cae
 * en la cabeza, con las perneras colgando como orejas → a ciegas, los tirantes se le enrollan y le atan
 * los brazos → se cae de culo; la otra bota se suelta de la percha y le da en la cabeza → Marcos mira el
 * cronómetro (ya ha dado más de una vuelta), mira a Guillermo y niega con la cabeza; Guillermo mueve la
 * bota de la mano con una sonrisa de circunstancias → negro.
 *
 * Sin textos (el cronómetro solo tiene marcas). Todo depende del tiempo absoluto. El atrezo (botas,
 * pantalón, tirantes, hacha, botella) se dibuja aparte con el mismo trazo; los cuerpos son los montajes.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, MB = MarcosBombero;
  const S = 0.3, SUELO = 560, DUR = 14.2;
  const TINTA = "#0b0a0e", NAVY = "#25252e", NAVY_L = "#363642", NAVY_D = "#17171d", AMAR = "#f2d32a", PLATA = "#d3d9df", ROJO = "#c8202a";
  const T = {
    sorbo0: 0.55, sorbo1: 1.2, timbre: 1.55, mCam: 1.88, remo0: 2.1, cambio: 2.33, remo1: 2.62, heroe: 2.62, brillo: 2.85,
    mReloj: 3.15, mTurno: 3.55, mTurno1: 4.15,
    gCam: 3.3, gVa0: 3.95, gVa1: 4.47, bota0: 4.47, botaEn: 4.75, mira0: 4.85, sacude0: 5.12, sacude1: 5.5,
    panta0: 5.55, agarra: 5.8, sujeta: 6.02, salta0: 6.08, salta1: 7.88, tira: 7.9, suelta: 8.12, cabeza: 8.4,
    enreda0: 8.6, enreda1: 9.3, cae0: 9.35, culo: 9.72, botaCae: 10.05, bonk: 10.32,
    mMira: 10.9, mMira1: 11.5, mNiega0: 11.72, mNiega1: 12.72, gOla0: 11.85, gOla1: 12.85, mCamFin: 12.95, fin: 13.45
  };
  const XG0 = 288, XG1 = 385, XG2 = 425, XM = 778;
  // percha (pantalla): botas colgadas por el tirador y el pantalón colgado por la cintura
  const GANCHO_B1 = { x: 472, y: 262 }, GANCHO_B2 = { x: 500, y: 262 }, GANCHO_PA = { x: 526, y: 262 }, GANCHO_PB = { x: 564, y: 262 };

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.25, lengua: 0, esp: 0, mof: 0, gui: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    const cerr = Math.max(e.c, parp);
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: Math.max(cerr, e.gui), i: cerr, feliz: Math.max(e.h, e.gui), apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  const CARAS_G = {
    inicio: E({ mx: 0.85, sonr: 0.35 }),
    charla: E({ mx: 0.85, my: -0.05, sd: 6, gd: 0.06, si: 6, gi: 0.06, sonr: 0.55, abre: 6, ancho: 0.95 }),
    susto: E({ mx: 0.6, my: -0.5, iris: 0.8, sd: 26, gd: 0.18, si: 26, gi: 0.18, abre: 40, ancho: 0.8, sonr: -0.2, lengua: 0.3 }),
    pasmo: E({ mx: 0.85, my: 0, iris: 1.12, sd: 22, gd: 0.15, si: 22, gi: 0.15, abre: 46, ancho: 0.75, sonr: 0, lengua: 0.4 }),
    reto: E({ mx: -0.85, my: -0.1, sd: 18, gd: 0.16, si: -8, gi: -0.12, sonr: 0.8, abre: 4, ancho: 0.95 }),
    apunta: E({ mx: 0.85, my: -0.35, c: 0.15, sd: -6, gd: -0.15, si: -6, gi: -0.15, sonr: 0.3, abre: 8, ancho: 0.8, lengua: 0.8 }),
    lio: E({ mx: 0.55, my: 0.1, sd: 20, gd: 0.18, si: -6, gi: -0.12, sonr: -0.25, abre: 10, ancho: 0.7 }),
    fastidio: E({ mx: 0.6, my: 0.1, c: 0.25, sd: -10, gd: -0.22, si: -10, gi: -0.22, sonr: -0.45, abre: 6, ancho: 1.1 }),
    salta: E({ mx: 0.3, my: 0.8, iris: 0.9, sd: 18, gd: -0.05, si: 18, gi: -0.05, abre: 22, ancho: 0.85, sonr: -0.3, lengua: 0.9 }),
    tira: E({ mx: 0.85, my: -0.6, c: 0.75, z: 0.7, sd: -10, gd: -0.25, si: -10, gi: -0.25, abre: 30, ancho: 1.2, sonr: -0.1 }),
    ciego: E({ mx: 0, my: -0.3, iris: 0.75, sd: 24, gd: 0.15, si: 24, gi: 0.15, abre: 26, ancho: 0.8, sonr: -0.3, lengua: 0.3 }),
    panico: E({ mx: -0.4, my: 0.3, iris: 0.7, sd: 28, gd: 0.2, si: 28, gi: 0.2, abre: 44, ancho: 0.9, sonr: -0.5, lengua: 0.2 }),
    golpe: E({ mx: 0, my: 0, c: 1, z: 1, sd: 10, gd: 0.15, si: 10, gi: 0.15, abre: 26, ancho: 0.85, sonr: -0.4, lengua: 0.4 }),
    ko: E({ mx: 0, my: 0, esp: 1, sd: 14, gd: 0.2, si: -6, gi: -0.1, abre: 16, ancho: 0.85, sonr: -0.15, lengua: 0.8 }),
    sonrisa: E({ mx: -0.85, my: -0.05, c: 0.25, h: 0.3, sd: 12, gd: 0.15, si: 12, gi: 0.15, sonr: 0.7, abre: 8, ancho: 1.0 })
  };
  const GUION_CARA_G = [
    [0.3, 0.6, "charla"], [T.timbre, T.timbre + 0.06, "susto"], [T.remo0, T.remo0 + 0.2, "pasmo"], [T.gCam, T.gCam + 0.25, "reto"],
    [T.gVa0, T.gVa0 + 0.2, "apunta"], [T.mira0, T.mira0 + 0.2, "lio"], [T.sacude0, T.sacude0 + 0.15, "fastidio"],
    [T.panta0 + 0.1, T.panta0 + 0.3, "apunta"], [T.salta0, T.salta0 + 0.2, "salta"], [T.tira - 0.05, T.tira + 0.08, "tira"],
    [T.cabeza, T.cabeza + 0.06, "ciego"], [T.enreda0 + 0.25, T.enreda0 + 0.45, "panico"], [T.culo, T.culo + 0.05, "golpe"],
    [T.culo + 0.15, T.culo + 0.35, "ko"], [T.bonk, T.bonk + 0.04, "golpe"], [T.bonk + 0.15, T.bonk + 0.35, "ko"],
    [T.gOla0, T.gOla0 + 0.45, "sonrisa"]
  ];
  const CARAS_M = {
    inicio: E({ mx: 0.85, sonr: 0.45 }),
    escucha: E({ mx: 0.85, my: 0, sd: 6, gd: 0.05, si: 8, gi: 0.06, sonr: 0.5 }),
    sorbo: E({ mx: 0.85, my: 0.2, c: 0.55, sd: 4, gd: 0.04, si: 4, gi: 0.04, sonr: 0.2, ancho: 0.75 }),
    alerta: E({ mx: 0.4, my: -0.6, sd: 20, gd: 0.12, si: 20, gi: 0.12, abre: 14, ancho: 0.7, sonr: 0 }),
    listo: E({ mx: -0.85, my: -0.1, sd: 10, gd: 0.08, si: 16, gi: 0.12, sonr: 0.8, abre: 4, ancho: 1.0 }),
    heroe: E({ mx: -0.6, my: -0.3, sd: 12, gd: 0.1, si: 12, gi: 0.1, sonr: 0.85, abre: 6, ancho: 1.05 }),
    reloj: E({ mx: 0.55, my: -0.95, sd: 12, gd: 0.1, si: 14, gi: 0.1, sonr: 0.7 }),
    turno: E({ mx: 0.85, my: 0.1, sd: 4, gd: 0.04, si: 18, gi: 0.15, sonr: 0.6, abre: 4 }),
    ceja: E({ mx: 0.85, my: 0.15, c: 0.15, sd: -4, gd: -0.08, si: 22, gi: 0.18, sonr: 0.2, ancho: 0.85 }),
    risa: E({ mx: 0.7, my: 0.2, c: 0.55, h: 0.8, sd: 14, gd: 0.1, si: 14, gi: 0.1, sonr: 0.9, abre: 22, ancho: 1.05, lengua: 0.3 }),
    auch: E({ mx: 0.6, my: 0.3, c: 0.85, z: 0.7, sd: 12, gd: -0.15, si: 12, gi: -0.15, sonr: -0.3, abre: 10, ancho: 1.15 }),
    mira: E({ mx: 0.85, my: 0.35, sd: 6, gd: 0.04, si: 10, gi: 0.08, sonr: 0.2 }),
    niega: E({ mx: 0.3, my: 0.3, c: 0.85, sd: -6, gd: -0.1, si: -6, gi: -0.1, sonr: -0.15, ancho: 0.9 }),
    final: E({ mx: -0.85, my: -0.05, sd: 4, gd: 0.02, si: 18, gi: 0.14, sonr: 0.35, ancho: 0.95 })
  };
  const GUION_CARA_M = [
    [0.3, 0.5, "escucha"], [T.sorbo0 + 0.1, T.sorbo0 + 0.3, "sorbo"], [T.sorbo1, T.sorbo1 + 0.2, "escucha"],
    [T.timbre, T.timbre + 0.08, "alerta"], [T.mCam, T.mCam + 0.12, "listo"], [T.heroe, T.heroe + 0.15, "heroe"],
    [T.mReloj, T.mReloj + 0.2, "reloj"], [T.mTurno, T.mTurno + 0.2, "turno"], [T.mira0, T.mira0 + 0.2, "ceja"],
    [T.salta0 + 0.3, T.salta0 + 0.5, "risa"], [T.cabeza, T.cabeza + 0.15, "ceja"], [T.culo, T.culo + 0.06, "auch"],
    [T.culo + 0.3, T.culo + 0.5, "mira"], [T.bonk, T.bonk + 0.06, "auch"], [T.bonk + 0.3, T.bonk + 0.5, "mira"],
    [T.mMira, T.mMira + 0.25, "reloj"], [T.mMira1, T.mMira1 + 0.2, "mira"], [T.mNiega0, T.mNiega0 + 0.25, "niega"],
    [T.mCamFin, T.mCamFin + 0.3, "final"]
  ];

  /* ---------- utilidades de postura ---------- */
  const muDesde = (h, s) => Math.atan2(s.y - h.y, s.x - h.x);            // la muñeca mira hacia el hombro
  function pie(lista, t) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    const arco = Math.sin(Math.PI * u);
    return { x: lerp(xa, x, suave5(u)), alza: 44 * arco, ang: -0.18 * arco };
  }
  const pieHoja = (C, p, f, desfase = 0) => ({ tob: { x: C.aHoja(p, { x: f.x, y: 0 }).x, y: C.SUELO - C.TOBILLO_ALTO - desfase - f.alza / S }, ang: f.ang });
  const mezPierna = (a, b, k) => ({ tob: mezcla(a.tob, b.tob, k), ang: lerp(a.ang, b.ang, k) });
  const mezMano = (a, b, k) => {
    const o = Object.assign({}, k < 0.5 ? a : b);
    o.x = lerp(a.x, b.x, k); o.y = lerp(a.y, b.y, k); o.ang = lerp(a.ang || 0, b.ang || 0, k);
    o.mu = lerp(a.mu ?? -1.75, b.mu ?? -1.75, k); o.puno = lerp(a.puno ?? 1, b.puno ?? 1, k);
    if (a.dedos || b.dedos) { const d = {}, A0 = a.dedos || {}, B0 = b.dedos || {};
      for (const n of ["pulgar", "indice", "medio", "anular", "menique"]) d[n] = lerp(A0[n] ?? 0, B0[n] ?? 0, k); o.dedos = d; }
    return o;
  };
  const DED = (a, pu = a) => ({ pulgar: pu, indice: a, medio: a, anular: a, menique: a });

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  const PG = G.PELVIS, JK = G.JK, R_MG = G.MUNECA_R * G.JK;
  const punoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_MG, y: Math.sin(mu) * R_MG }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_GC = punoDesde({ x: 131, y: 652 }, 0, -1.75), BOLS_GL = punoDesde({ x: 372, y: 648 }, 0, -1.75);
  const PASOS_G = {
    cerca: [[-10, -9, XG0 - 19], [T.gVa0, T.gVa0 + 0.24, XG0 + 42], [T.gVa0 + 0.3, T.gVa0 + 0.52, XG1 - 19], [T.panta0, T.panta0 + 0.22, XG2 - 19]],
    lejos: [[-10, -9, XG0 + 18], [T.gVa0 + 0.14, T.gVa0 + 0.38, XG1 + 18], [T.panta0 + 0.1, T.panta0 + 0.32, XG2 + 18]]
  };
  // salto a la pata coja (pantalla): x de la pelvis y altura del bote
  const xSalto = t => { const u = t - T.salta0; return XG2 + 22 * Math.sin(u * 3.4) + 9 * Math.sin(u * 8.1) - 6 * u; };
  const hSalto = t => { const u = t - T.salta0; return 30 * Math.abs(Math.sin(Math.PI * 2.7 * u)) * tramo(t, T.salta0, T.salta0 + 0.15) * (1 - tramo(t, T.salta1 - 0.1, T.salta1)); };
  const X_TIRA = xSalto(T.salta1);
  // a ciegas: tropieza de un lado a otro
  const xCiego = t => { const u = Math.max(0, t - T.cabeza); return X_TIRA + 26 * Math.sin(u * 4.2) - 10 * u; };
  const X_CAE = xCiego(T.cae0);
  const X_CULO = X_CAE - 30;

  function poseG(t) {
    const respira = Math.sin(t * 2.3);
    const fC = pie(PASOS_G.cerca, t), fL = pie(PASOS_G.lejos, t);
    const xAnda = (fC.x + fL.x) / 2 + 0.5;
    const enSalto = tramo(t, T.salta0 - 0.04, T.salta0 + 0.16) * (1 - tramo(t, T.salta1 - 0.08, T.salta1 + 0.04));
    const ciego = tramo(t, T.cabeza, T.cabeza + 0.2);
    const cae = tramo(t, T.cae0, T.culo, entrada), sentado = tramo(t, T.cae0 + 0.12, T.culo + 0.02, suave);
    let x = xAnda;
    if (t > T.salta0 - 0.04) x = lerp(x, xSalto(Math.min(t, T.salta1)), tramo(t, T.salta0 - 0.04, T.salta0 + 0.16));
    if (t > T.cabeza) x = lerp(X_TIRA, xCiego(Math.min(t, T.cae0)), ciego);
    if (t > T.cae0) x = lerp(X_CAE, X_CULO, cae);
    const bote = t > T.salta0 && t < T.salta1 ? hSalto(t) : 0;
    const p = { x, suelo: SUELO - bote, s: S, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: PG.x, y: PG.y + respira * 1.2 }, torso: 0, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: 0, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    // respingo con la alarma
    const sus = campana(t, T.timbre, T.timbre + 0.35);
    p.pelvis.y -= 14 * sus; p.cabeza.dy -= 8 * sus;
    // tambaleo al saltar (crece), al tirar y a ciegas
    p.torso += 0.1 * Math.sin((t - T.salta0) * 5.3) * enSalto * (0.5 + 0.5 * fase(t, T.salta0, T.salta1));
    p.cabeza.ang += 0.08 * Math.sin((t - T.salta0) * 4.1 + 1) * enSalto;
    const tira = campana(t, T.tira - 0.05, T.cabeza + 0.05);
    p.torso -= 0.12 * tira; p.torsoEsc.y += 0.02 * tira; p.pelvis.y -= 10 * tira;
    p.torso += 0.12 * Math.sin((t - T.cabeza) * 4.2 + 0.4) * ciego * (1 - sentado);
    p.cabeza.ang += 0.14 * Math.sin((t - T.cabeza) * 3.1) * ciego * (1 - sentado);
    // el pantalón le aplasta la cabeza al caer encima
    const choca = t >= T.cabeza ? Math.exp(-(t - T.cabeza) * 9) * suave(fase(t, T.cabeza, T.cabeza + 0.03)) : 0;
    p.cabeza.esc = { x: 1 + 0.06 * choca, y: 1 - 0.08 * choca }; p.cabeza.dy += 8 * choca;
    // piernas: andando → a la pata coja → a ciegas → de culo
    const deP = { cerca: pieHoja(G, p, fC), lejos: pieHoja(G, p, fL, 12) };
    let piernas = deP;
    if (enSalto > 0) {
      const u = t - T.salta0, sube = Math.abs(Math.sin(Math.PI * 2.7 * u));
      const apoyo = { tob: { x: PG.x - 36, y: G.SUELO - G.TOBILLO_ALTO }, ang: -0.12 * sube };
      const levantada = { tob: { x: PG.x + 150 + 46 * Math.sin(u * 7.3), y: G.SUELO - G.TOBILLO_ALTO - 250 - 50 * Math.abs(Math.sin(u * 6.1)) }, ang: 0.25 + 0.3 * Math.sin(u * 7.3) };
      piernas = { cerca: mezPierna(deP.cerca, apoyo, enSalto), lejos: mezPierna(deP.lejos, levantada, enSalto) };
    }
    if (t > T.salta1 - 0.08) {                // aterriza con los dos pies, plantado debajo de la pelvis
      const base = { cerca: { tob: { x: PG.x - 62, y: G.SUELO - G.TOBILLO_ALTO }, ang: 0 }, lejos: { tob: { x: PG.x + 58, y: G.SUELO - G.TOBILLO_ALTO - 12 }, ang: 0 } };
      const k = tramo(t, T.salta1 - 0.08, T.salta1 + 0.04);
      piernas = { cerca: mezPierna(piernas.cerca, base.cerca, k), lejos: mezPierna(piernas.lejos, base.lejos, k) };
      if (ciego > 0) {                      // pasitos a ciegas: los pies se alternan
        const u = t - T.cabeza, w = Math.sin(u * 8.4);
        const pc = { tob: { x: PG.x - 62 + 30 * w, y: G.SUELO - G.TOBILLO_ALTO - 70 * Math.max(0, w) }, ang: -0.15 * Math.max(0, w) };
        const pl = { tob: { x: PG.x + 58 - 30 * w, y: G.SUELO - G.TOBILLO_ALTO - 12 - 70 * Math.max(0, -w) }, ang: -0.15 * Math.max(0, -w) };
        const kc = ciego * (1 - cae);
        piernas = { cerca: mezPierna(piernas.cerca, pc, kc), lejos: mezPierna(piernas.lejos, pl, kc) };
      }
    }
    if (sentado > 0 || cae > 0) {            // de culo: piernas estiradas hacia delante
      const sC = { tob: { x: PG.x + 300, y: G.SUELO - G.TOBILLO_ALTO }, ang: -1.2 }, sL = { tob: { x: PG.x + 470, y: G.SUELO - G.TOBILLO_ALTO - 8 }, ang: -1.28 };
      piernas = { cerca: mezPierna(piernas.cerca, sC, sentado), lejos: mezPierna(piernas.lejos, sL, sentado) };
      p.pelvis.y += 556 * sentado;
      p.torso = lerp(p.torso, -0.32, cae) + 0.12 * sentado;
    }
    p.piernas = piernas;
    if (t >= T.culo) {                       // rebote al caer y mareo
      const r = Math.exp(-(t - T.culo) * 9) * Math.sin((t - T.culo) * 26);
      p.pelvis.y -= 26 * Math.max(0, r);
      const mareo = tramo(t, T.culo + 0.1, T.culo + 0.4) * (1 - tramo(t, T.gOla0, T.gOla0 + 0.5));
      p.torso += 0.05 * Math.sin(t * 2.7) * mareo; p.cabeza.ang += 0.08 * Math.sin(t * 2.7 + 0.8) * mareo;
      const bk = t >= T.bonk ? Math.exp(-(t - T.bonk) * 10) * suave(fase(t, T.bonk, T.bonk + 0.03)) : 0;
      p.cabeza.esc = { x: 1 + 0.07 * bk, y: 1 - 0.1 * bk }; p.cabeza.dy += 10 * bk;
      p.torso += 0.06 * Math.sin((t - T.gOla0) * 2.2) * tramo(t, T.gOla0, T.gOla0 + 0.4);
    }
    // cara
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    if (ciego > 0 && t < T.cae0) ex.mx = lerp(ex.mx, 0.7 * Math.sin((t - T.cabeza) * 5.5), ciego * 0.8);
    p.cara = cara(ex, parpadeo(t, [1.05, 3.05, 5.0, 8.62, 11.4, 12.4]));
    p.rojo = 0.45 * tramo(t, T.salta0, T.salta0 + 0.5) * (1 - tramo(t, T.cabeza, T.cabeza + 0.4)) + 0.3 * tramo(t, T.enreda0, T.enreda0 + 0.4) * (1 - tramo(t, T.culo, T.culo + 0.6));
    p.cara.rubor = p.rojo + 0.35 * tramo(t, T.gOla0, T.gOla0 + 0.4);
    p.sudor = tramo(t, T.salta0 + 0.2, T.salta0 + 0.7) * (1 - tramo(t, T.culo, T.culo + 0.5)) + 0.6 * tramo(t, T.gOla0, T.gOla0 + 0.5);

    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    const bols = { cerca: Object.assign({ ang: 0, mu: -1.75, dobla: -1, puno: 0 }, Tr(BOLS_GC)), lejos: Object.assign({ ang: 0, mu: -1.75, dobla: -1, puno: 0 }, Tr(BOLS_GL)) };
    // el reto: se frota las manos delante del pecho
    const frota = Math.sin((t - T.gCam) * 26);
    const reto = {
      cerca: { x: hc.x + 175 + 8 * frota, y: hc.y + 150, ang: 0, mu: -2.2, dobla: -1, puno: 1, dedos: DED(0.85, 0.8) },
      lejos: { x: hl.x + 55 - 8 * frota, y: hl.y + 140, ang: 0, mu: -2.0, dobla: -1, puno: 1, dedos: DED(0.85, 0.8) }
    };
    // andando: brazos sueltos que se balancean
    const bal = Math.sin((t - T.gVa0) * 9);
    const sueltos = {
      cerca: { x: hc.x + 15 + 45 * bal, y: hc.y + 300, ang: 0, mu: -1.6, dobla: -1, puno: 1, dedos: DED(0.35, 0.3) },
      lejos: { x: hl.x + 25 - 45 * bal, y: hl.y + 290, ang: 0, mu: -1.6, dobla: -1, puno: 1, dedos: DED(0.35, 0.3) }
    };
    // la bota: alarga la mano lejana hasta la percha y la mete dentro
    const bota1 = G.aHoja(p, { x: GANCHO_B1.x, y: GANCHO_B1.y + 24 });
    const alcanza = { x: bota1.x - 10, y: bota1.y + 10, ang: 0, puno: 1, mu: muDesde(bota1, hl), dobla: -1, dedos: DED(0.9, 0.9) };
    const dentro = Object.assign({}, alcanza, { puno: 0 });
    const mira = { x: hl.x + 120, y: hl.y - 20, ang: 0, puno: 0, mu: 1.45, dobla: -1 };
    const sac = Math.sin((t - T.sacude0) * 34) * campana(t, T.sacude0, T.sacude1);
    const sacude = Object.assign({}, mira, { x: mira.x + 26 * sac, y: mira.y + 18 * sac, ang: 0.35 * sac });
    // el pantalón: la bota lo engancha en la percha y la otra mano lo coge delante de la tripa
    const pa = G.aHoja(p, GANCHO_PB);
    const engancha = { x: pa.x - 6, y: pa.y + 22, ang: 0, puno: 0, mu: muDesde(pa, hl), dobla: -1 };
    const sujetaC = { x: PG.x + 30, y: 600, ang: 0, mu: -2.0, dobla: -1, puno: 1, dedos: DED(0.45, 0.4) };
    const sujetaL = { x: PG.x + 210, y: 590, ang: 0, puno: 0, mu: -2.3, dobla: -1 };
    // al tirar: las dos manos arriba, delante de la frente
    const arribaC = { x: hc.x + 205, y: hc.y - 70, ang: 0, mu: -2.6, dobla: -1, puno: 1, dedos: DED(0.45, 0.4) };
    const arribaL = { x: hl.x + 95, y: hl.y - 95, ang: 0, puno: 0, mu: -2.0, dobla: -1 };
    const sueltaC = Object.assign({}, arribaC, { dedos: DED(1, 1), x: arribaC.x + 20, y: arribaC.y - 10 });
    // a ciegas: brazos hacia delante tanteando
    const w1 = Math.sin((t - T.cabeza) * 6.5), w2 = Math.sin((t - T.cabeza) * 5.7 + 1.4);
    const tanteaC = { x: hc.x + 235 + 30 * w2, y: hc.y + 90 + 35 * w1, ang: 0, mu: -2.9, dobla: -1, puno: 1, dedos: DED(1, 1) };
    const tanteaL = { x: hl.x + 170 + 30 * w1, y: hl.y + 70 + 35 * w2, ang: 0.2 * w2, puno: 0, mu: -2.8, dobla: -1 };
    // atado por los tirantes: brazos pegados al cuerpo
    const atadoC = { x: hc.x + 6, y: hc.y + 296, ang: 0, mu: -1.62, dobla: -1, puno: 1, dedos: DED(0.6, 0.5) };
    const atadoL = { x: hl.x + 18, y: hl.y + 288, ang: 0, puno: 0, mu: -1.62, dobla: -1 };
    // al final mueve la bota de la mano con una sonrisa de circunstancias
    const ola = Math.sin((t - T.gOla0) * 10) * tramo(t, T.gOla0 + 0.2, T.gOla0 + 0.4) * (1 - tramo(t, T.gOla1 - 0.2, T.gOla1));
    const olaL = { x: hl.x + 70, y: hl.y + 235, ang: 0.35 * ola, puno: 0, mu: -1.9, dobla: -1 };

    let mc = bols.cerca, ml = bols.lejos;
    const kReto = tramo(t, T.gCam, T.gCam + 0.25) * (1 - tramo(t, T.gVa0 - 0.05, T.gVa0 + 0.15));
    mc = mezMano(mc, reto.cerca, kReto); ml = mezMano(ml, reto.lejos, kReto);
    const kAnda = tramo(t, T.gVa0 - 0.05, T.gVa0 + 0.15);
    mc = mezMano(mc, sueltos.cerca, kAnda); ml = mezMano(ml, sueltos.lejos, kAnda);
    ml = mezMano(ml, alcanza, tramo(t, T.bota0 - 0.05, T.bota0 + 0.2));
    ml = mezMano(ml, dentro, tramo(t, T.bota0 + 0.2, T.botaEn));
    ml = mezMano(ml, mira, tramo(t, T.botaEn + 0.02, T.mira0 + 0.15));
    if (t > T.sacude0) ml = mezMano(ml, sacude, 1);
    ml = mezMano(ml, engancha, tramo(t, T.panta0 + 0.05, T.agarra));
    ml = mezMano(ml, sujetaL, tramo(t, T.agarra + 0.02, T.sujeta));
    mc = mezMano(mc, sujetaC, tramo(t, T.agarra - 0.05, T.sujeta));
    if (enSalto > 0) {                       // las manos botan con el cuerpo y se agitan un poco
      const u = t - T.salta0;
      mc = Object.assign({}, mc, { x: mc.x + 10 * Math.sin(u * 9), y: mc.y + 8 * Math.sin(u * 11) });
      ml = Object.assign({}, ml, { x: ml.x - 10 * Math.sin(u * 9 + 1), y: ml.y + 8 * Math.sin(u * 11 + 1) });
    }
    mc = mezMano(mc, arribaC, tramo(t, T.tira - 0.04, T.suelta, salida));
    ml = mezMano(ml, arribaL, tramo(t, T.tira - 0.04, T.suelta, salida));
    mc = mezMano(mc, sueltaC, tramo(t, T.suelta, T.suelta + 0.12));
    mc = mezMano(mc, tanteaC, tramo(t, T.cabeza + 0.02, T.cabeza + 0.25));
    ml = mezMano(ml, tanteaL, tramo(t, T.cabeza + 0.02, T.cabeza + 0.25));
    mc = mezMano(mc, atadoC, tramo(t, T.enreda0 + 0.35, T.enreda1));
    ml = mezMano(ml, atadoL, tramo(t, T.enreda0 + 0.35, T.enreda1));
    ml = mezMano(ml, olaL, tramo(t, T.gOla0, T.gOla0 + 0.3));
    p.manoCerca = mc; p.manoLejos = ml;
    return p;
  }

  /* =====================================================================================
   * MARCOS (a la derecha, en espejo: mira a la izquierda)
   * ===================================================================================== */
  const PM = MB.PELVIS;
  function poseM(t) {
    const respira = Math.sin(t * 2.1 + 1);
    const heroe = tramo(t, T.remo0 + 0.1, T.remo1 - 0.05);
    const pecho = heroe * (1 - 0.6 * tramo(t, T.mReloj + 0.5, T.mTurno1));
    const sus = campana(t, T.timbre, T.timbre + 0.35);
    const ris = tramo(t, T.salta0 + 0.3, T.salta0 + 0.5) * (1 - tramo(t, T.salta1, T.salta1 + 0.3));
    const p = { x: XM, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: PM.x, y: PM.y + respira * 1.2 - 12 * sus + 10 * heroe + 4 * Math.abs(Math.sin(t * 13)) * ris },
      torso: -0.06 * pecho + 0.03 * Math.sin(t * 13) * ris, torsoEsc: { x: 1 + 0.03 * pecho, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: -0.08 * pecho, dx: 0, dy: -8 * sus, esc: { x: 1, y: 1 } } };
    // sorbo: la cabeza se echa un poco atrás
    p.cabeza.ang += 0.08 * campana(t, T.sorbo0 + 0.1, T.sorbo1);
    // mira el cronómetro (arriba a la izquierda) y niega con la cabeza
    p.cabeza.ang += -0.1 * (tramo(t, T.mReloj, T.mReloj + 0.2) * (1 - tramo(t, T.mTurno, T.mTurno + 0.2)) + tramo(t, T.mMira, T.mMira + 0.25) * (1 - tramo(t, T.mMira1, T.mMira1 + 0.2)));
    const niega = Math.sin((t - T.mNiega0) * 2 * Math.PI * 1.5) * campana(t, T.mNiega0, T.mNiega1);
    p.cabeza.ang += 0.13 * niega;
    const wince = campana(t, T.culo, T.culo + 0.5) + campana(t, T.bonk, T.bonk + 0.45);
    p.cabeza.ang += 0.06 * wince; p.pelvis.y += 5 * wince;
    // piernas: su postura abierta del avatar, sin moverse
    const ab = 6 * heroe;
    p.piernas = { cerca: { tob: { x: PM.x - 122 - ab, y: MB.SUELO - MB.TOBILLO_ALTO }, ang: 0 },
                  lejos: { tob: { x: PM.x + 128 + ab, y: MB.SUELO - MB.TOBILLO_ALTO - 10 }, ang: 0 } };
    // cara
    const ex = guion(GUION_CARA_M, CARAS_M, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [1.35, 3.45, 5.3, 7.95, 9.0, 11.2, 13.2]));
    // manos
    const Tr = MB.tronco(p), hc = Tr(MB.HOMBRO_C), hl = Tr(MB.HOMBRO);
    const reposoL = MB.manoReposo(p, "lejos");
    // café: la cercana sujeta la taza delante del pecho y la lleva a la boca
    const taza = { x: hc.x + 128, y: hc.y + 190, ang: 0, mu: -1.6, dobla: -1, puno: 1, dedos: DED(0.38, 0.45), objeto: tazaObj };
    const boca = MB.boca(p);
    const sorbo = Object.assign({}, taza, { x: boca.x - 70, y: boca.y + 62, ang: -0.35 });
    const salta = Object.assign({}, taza, { y: taza.y - 40, ang: 0.4 });
    // hacha al hombro (cercana) y puño en la cintura (lejana)
    const hacha = { x: hc.x + 112, y: hc.y + 170, ang: -0.62, mu: -1.15, dobla: -1, puno: 1, dedos: DED(0.38, 0.45), objeto: hachaObj };
    const cintura = Object.assign({ ang: 0, mu: -2.5, dobla: 1, puno: 1 }, Tr({ x: 418, y: 690 }));
    const turno = { x: hl.x + 165, y: hl.y + 135, ang: 0, mu: -2.9, dobla: 1, puno: 1, dedos: DED(1, 0.9) };
    // se ríe tapándose la boca con la lejana
    const bocaT = MB.cabeza(p).a({ x: 860, y: 700 });
    const tapa = { x: bocaT.x + 40, y: bocaT.y + 70, ang: 0, mu: 1.9, dobla: 1, puno: 1, dedos: DED(0.9, 0.5) };
    let mc = taza, ml = reposoL;
    mc = mezMano(mc, sorbo, campana(t, T.sorbo0, T.sorbo1) > 0 ? suave(campana(t, T.sorbo0, T.sorbo1)) : 0);
    mc = mezMano(mc, salta, campana(t, T.timbre, T.timbre + 0.4));
    mc = mezMano(mc, hacha, tramo(t, T.remo0 + 0.08, T.remo1 - 0.08));
    ml = mezMano(ml, cintura, tramo(t, T.remo0 + 0.08, T.remo1 - 0.08));
    ml = mezMano(ml, turno, tramo(t, T.mTurno, T.mTurno + 0.25) * (1 - tramo(t, T.mTurno1, T.mTurno1 + 0.3)));
    ml = mezMano(ml, tapa, tramo(t, T.salta0 + 0.4, T.salta0 + 0.65) * (1 - tramo(t, T.salta1 - 0.1, T.salta1 + 0.2)));
    // el objeto cambia bajo el torbellino (taza → hacha)
    mc.objeto = t < T.cambio ? tazaObj : hachaObj;
    p.manoCerca = mc; p.manoLejos = ml;
    p.equipo = tramo(t, T.cambio - 0.03, T.cambio + 0.03);
    if (p.equipo > 0) p.capaTronco = g => correas(g, p.equipo);
    return p;
  }

  /* =====================================================================================
   * ATREZO
   * ===================================================================================== */
  // taza de café (unidades de mano; el puño agarra el asa, la taza queda delante)
  function tazaObj(g, t) {
    g.save(); g.lineJoin = "round"; g.strokeStyle = TINTA; g.lineWidth = 1.8;
    g.beginPath(); g.ellipse(4, 0, 7, 9, 0, 0, Math.PI * 2); g.lineWidth = 4.5; g.stroke(); g.lineWidth = 2.6; g.strokeStyle = "#f2f2ee"; g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 1.8;
    g.beginPath(); g.moveTo(10, -14); g.lineTo(34, -14); g.lineTo(32, 14); g.quadraticCurveTo(22, 18, 12, 14); g.closePath(); g.fillStyle = "#f2f2ee"; g.fill(); g.stroke();
    g.fillStyle = "#c62d2d"; g.fillRect(11, -4, 22, 6);
    g.fillStyle = "#5a3418"; g.beginPath(); g.ellipse(22, -14, 12, 3, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
  }
  // hacha de bombero (unidades de mano; el mango pasa por el puño hacia −y)
  function hachaObj(g, t) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = TINTA;
    g.beginPath(); g.moveTo(0, 24); g.lineTo(0, -98); g.lineWidth = 9; g.stroke(); g.strokeStyle = "#e0ab3c"; g.lineWidth = 6; g.stroke();
    g.strokeStyle = "rgba(255,240,190,0.7)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-1.4, 18); g.lineTo(-1.4, -92); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 2;
    // cabeza: hoja a un lado y pico al otro
    g.beginPath(); g.moveTo(-5, -104); g.lineTo(5, -104); g.lineTo(6, -84); g.lineTo(-6, -84); g.closePath(); g.fillStyle = ROJO; g.fill(); g.stroke();
    g.beginPath(); g.moveTo(5, -104); g.quadraticCurveTo(24, -110, 34, -118); g.lineTo(36, -72); g.quadraticCurveTo(24, -80, 6, -84); g.closePath(); g.fillStyle = ROJO; g.fill(); g.stroke();
    g.beginPath(); g.moveTo(30, -116); g.lineTo(36, -118); g.lineTo(38, -72); g.lineTo(32, -74); g.closePath(); g.fillStyle = PLATA; g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-5, -102); g.quadraticCurveTo(-22, -98, -34, -92); g.lineTo(-6, -88); g.closePath(); g.fillStyle = "#9aa1a8"; g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.4)"; g.fillRect(8, -100, 18, 4);
    g.restore();
  }
  // correas del equipo de respiración sobre el pecho de Marcos (coordenadas de su hoja, encima del torso)
  function correas(g, k) {
    g.save(); g.globalAlpha *= k; g.lineCap = "round"; g.lineJoin = "round";
    const tira = (pts, w) => { g.beginPath(); M2.curva(g, pts, false, 0.5); g.strokeStyle = TINTA; g.lineWidth = w + 8; g.stroke(); g.strokeStyle = "#2b2b31"; g.lineWidth = w; g.stroke(); };
    tira([{ x: 150, y: 300 }, { x: 168, y: 420 }, { x: 185, y: 560 }, { x: 196, y: 660 }], 22);
    tira([{ x: 342, y: 312 }, { x: 330, y: 430 }, { x: 318, y: 560 }, { x: 306, y: 660 }], 22);
    tira([{ x: 160, y: 470 }, { x: 250, y: 478 }, { x: 330, y: 470 }], 16);
    tira([{ x: 130, y: 668 }, { x: 250, y: 678 }, { x: 372, y: 668 }], 24);
    for (const [x, y] of [[250, 478], [250, 678]]) { g.fillStyle = PLATA; g.strokeStyle = TINTA; g.lineWidth = 4; g.beginPath(); g.roundRect ? g.roundRect(x - 18, y - 14, 36, 28, 6) : g.rect(x - 18, y - 14, 36, 28); g.fill(); g.stroke(); }
    // máscara colgando sobre el pecho
    g.fillStyle = "#1c1c22"; g.strokeStyle = TINTA; g.lineWidth = 6; g.beginPath(); g.ellipse(232, 560, 48, 58, 0.15, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "rgba(170,210,235,0.55)"; g.beginPath(); g.ellipse(232, 548, 32, 36, 0.15, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#4a4a52"; g.beginPath(); g.arc(240, 600, 16, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
  }
  // botella de aire a la espalda de Marcos (pantalla, por detrás del cuerpo)
  function botella(g, pM, k) {
    if (k <= 0.01) return;
    const Tr = MB.tronco(pM), a = MB.aPantalla(pM, Tr({ x: 62, y: 270 })), b = MB.aPantalla(pM, Tr({ x: 72, y: 600 }));
    const ang = Math.atan2(b.y - a.y, b.x - a.x) - Math.PI / 2, L = Math.hypot(b.x - a.x, b.y - a.y), r = 17;
    g.save(); g.globalAlpha *= k; g.translate(a.x, a.y); g.rotate(ang); g.lineJoin = "round"; g.strokeStyle = TINTA; g.lineWidth = 2.6;
    g.beginPath(); g.moveTo(-r, 10); g.quadraticCurveTo(-r, -4, 0, -6); g.quadraticCurveTo(r, -4, r, 10); g.lineTo(r, L - 6); g.quadraticCurveTo(r, L + 4, 0, L + 4); g.quadraticCurveTo(-r, L + 4, -r, L - 6); g.closePath();
    g.fillStyle = "#f0c419"; g.fill();
    g.save(); g.clip(); g.fillStyle = "#c79a0c"; g.fillRect(4, -10, r, L + 20); g.fillStyle = "rgba(255,250,210,0.7)"; g.fillRect(-r + 3, 0, 4, L - 6); g.fillStyle = "#1e1e24"; g.fillRect(-r, L * 0.3, 2 * r, 6); g.restore();
    g.stroke();
    g.fillStyle = "#2a2a30"; g.fillRect(-5, -14, 10, 9); g.strokeRect(-5, -14, 10, 9);
    g.fillStyle = PLATA; g.beginPath(); g.arc(0, -17, 5, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
  }

  // bota de bombero (px de pantalla): origen en el centro de la boca de la caña, la caña hacia +y y la puntera hacia +x
  function bota(g, abierta = true) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = TINTA; g.lineWidth = 2.2;
    g.beginPath(); g.moveTo(-12, 0); g.lineTo(12, 0); g.lineTo(12, 28); g.quadraticCurveTo(26, 29, 33, 37); g.lineTo(33, 44); g.lineTo(-13, 44); g.lineTo(-13, 30); g.closePath();
    g.fillStyle = "#1f1f25"; g.fill();
    g.save(); g.clip(); g.fillStyle = "#34343c"; g.fillRect(-13, 0, 7, 44); g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(-10, 3, 2.5, 24);
    g.fillStyle = AMAR; g.fillRect(-13, 8, 27, 6); g.fillStyle = PLATA; g.fillRect(-13, 10, 27, 2);
    g.fillStyle = "#3c3c44"; g.fillRect(-14, 39, 50, 6); g.restore();
    g.stroke();
    g.lineWidth = 1.4; g.beginPath(); g.moveTo(-13, 39); g.lineTo(33, 39); g.stroke();
    // tiradores
    g.lineWidth = 2; g.strokeStyle = TINTA; g.fillStyle = "#1f1f25";
    for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(sx * 8, -3, 3.4, 5, 0, 0, Math.PI * 2); g.stroke(); }
    if (abierta) { g.fillStyle = "#08080a"; g.beginPath(); g.ellipse(0, 0, 12, 3.4, 0, 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.restore();
  }
  // la bota puesta en una mano de Guillermo: posición de la boca de la caña y giro en pantalla
  function botaEnMano(p, m) {
    const ang = (m.ang || 0) + (m.mu ?? -1.75) + Math.PI / 2;            // eje de la mano: de la muñeca a los dedos
    const boca = G.rotP({ x: 0, y: -15 * JK }, ang);
    const q = G.aPantalla(p, { x: m.x + boca.x, y: m.y + boca.y });
    return { x: q.x, y: q.y, ang: ang - Math.PI / 2 * 0 - 0 };
  }

  /* ---------- pantalón de intervención (pantalla) ---------- */
  // c: centro de la cintura; ang: giro del marco (0 = cintura arriba y perneras abajo); ww: ancho de la cintura;
  // h: de la cintura a la entrepierna; vuelo: balanceo lateral de las perneras.
  const H_PANT = 50;
  function pantalon(g, P, t) {
    const { c, ang, ww, h } = P;
    const ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux;          // eje x (cintura) y eje y (hacia las perneras)
    const F = (x, y) => ({ x: c.x + ux * x + nx * y, y: c.y + uy * x + ny * y });
    const flip = clamp((1 - ny) / 2), L = lerp(190, 92, flip);                  // 0 de pie, 1 boca abajo (en la cabeza: perneras tiesas como orejas)
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // perneras: salen de la entrepierna en la dirección del marco y caen por su peso
    for (const lado of [-1, 1]) {
      const r = F(lado * ww * 0.25, h * 0.86);
      const sw = (P.vuelo || 0) * (lado < 0 ? 1 : 0.8);
      // colgando: caen por su peso; en la cabeza: suben tiesas y se doblan hacia la nuca (atrás = −x)
      const p1 = { x: r.x + nx * L * (0.28 + 0.2 * flip) + lado * 6 * (1 - flip), y: r.y + ny * L * (0.28 + 0.2 * flip) };
      const cuelga = { x: r.x + lado * 0.06 * L + sw, y: r.y + 0.96 * L };
      const orejas = { x: r.x + nx * L * 0.5 - (0.62 + 0.12 * lado) * L + sw * 0.6, y: r.y + ny * L * 0.5 + (0.32 + 0.06 * lado) * L };
      const p2 = mezcla(cuelga, orejas, flip);
      const pts = [];
      for (let i = 0; i <= 16; i++) { const k = i / 16, a = (1 - k) * (1 - k), b = 2 * k * (1 - k), d = k * k;
        let x = a * r.x + b * p1.x + d * p2.x, y = a * r.y + b * p1.y + d * p2.y;
        if (y > SUELO - 3) { const sobra = y - (SUELO - 3); y = SUELO - 3; x += lado * sobra * 0.6; }
        pts.push({ x, y }); }
      const ancho = k => 12.5 + 3 * k;
      const izq = [], der = [];
      for (let i = 0; i < pts.length; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
        let tx = b.x - a.x, ty = b.y - a.y; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l; const w = ancho(i / 16);
        izq.push({ x: pts[i].x - ty * w, y: pts[i].y + tx * w }); der.push({ x: pts[i].x + ty * w, y: pts[i].y - tx * w }); }
      const forma = () => { g.beginPath(); M2.poligono(g, izq.concat(der.slice().reverse())); };
      forma(); g.fillStyle = NAVY; g.fill();
      g.save(); forma(); g.clip();
      g.beginPath(); M2.poligono(g, izq.concat(pts.slice().reverse())); g.fillStyle = NAVY_L; g.fill();
      for (const [k0, k1] of [[0.66, 0.73], [0.8, 0.87]]) {
        const i0 = Math.round(k0 * 16), i1 = Math.round(k1 * 16);
        const banda = izq.slice(i0, i1 + 1).concat(der.slice(i0, i1 + 1).reverse());
        g.beginPath(); M2.poligono(g, banda); g.fillStyle = AMAR; g.fill();
        const im = Math.round((k0 + k1) / 2 * 16);
        g.strokeStyle = PLATA; g.lineWidth = 2.4; g.beginPath(); g.moveTo(izq[im].x, izq[im].y); g.lineTo(der[im].x, der[im].y); g.stroke();
      }
      g.restore();
      forma(); g.strokeStyle = TINTA; g.lineWidth = 2.2; g.stroke();
      g.lineWidth = 3; g.beginPath(); g.moveTo(izq[16].x, izq[16].y); g.lineTo(der[16].x, der[16].y); g.stroke();
    }
    // culera (de la cintura a la entrepierna)
    const culera = [F(-ww / 2, 0), F(-ww * 0.55, h * 0.5), F(-ww * 0.42, h * 0.95), F(0, h * 0.82), F(ww * 0.42, h * 0.95), F(ww * 0.55, h * 0.5), F(ww / 2, 0)];
    g.beginPath(); M2.curva(g, culera, true, 0.35); g.fillStyle = NAVY; g.fill();
    g.save(); g.beginPath(); M2.curva(g, culera, true, 0.35); g.clip();
    g.beginPath(); M2.poligono(g, [F(-ww * 0.6, 0), F(-ww * 0.1, 0), F(-ww * 0.2, h), F(-ww * 0.6, h)]); g.fillStyle = NAVY_L; g.fill();
    g.strokeStyle = "rgba(0,0,0,0.5)"; g.lineWidth = 1.6; g.beginPath(); const a0 = F(0, 6), a1 = F(0, h * 0.8); g.moveTo(a0.x, a0.y); g.lineTo(a1.x, a1.y); g.stroke();
    g.restore();
    g.beginPath(); M2.curva(g, culera, true, 0.35); g.strokeStyle = TINTA; g.lineWidth = 2.2; g.stroke();
    // cinturilla con presillas y los enganches rojos de los tirantes
    const b0 = F(-ww / 2 - 1, -3), b1 = F(ww / 2 + 1, -3), b2 = F(ww / 2 + 1, 5), b3 = F(-ww / 2 - 1, 5);
    g.beginPath(); M2.poligono(g, [b0, b1, b2, b3]); g.fillStyle = NAVY_D; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    for (const k of [-0.3, 0.3]) { const q = F(ww * k, 1); g.save(); g.translate(q.x, q.y); g.rotate(ang); g.fillStyle = ROJO; g.fillRect(-3, -5, 6, 10); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.strokeRect(-3, -5, 6, 10); g.restore(); }
    g.restore();
    return { F };
  }
  // tirantes colgando: lazo rojo entre los dos enganches
  function tirantesSueltos(g, P, t, largo = 46) {
    const { c, ang, ww } = P, ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux;
    const A = { x: c.x - ux * ww * 0.3, y: c.y - uy * ww * 0.3 }, B = { x: c.x + ux * ww * 0.3, y: c.y + uy * ww * 0.3 };
    const sw = 10 * Math.sin(t * 5);
    const m = { x: (A.x + B.x) / 2 + sw, y: Math.max(A.y, B.y) + largo };
    tira(g, [A, { x: A.x - 4 + sw * 0.5, y: A.y + largo * 0.8 }, m, { x: B.x + 4 + sw * 0.5, y: B.y + largo * 0.8 }, B]);
  }
  function tira(g, pts, w = 5) {
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); M2.curva(g, pts, false, 0.5); g.strokeStyle = TINTA; g.lineWidth = w + 3.4; g.stroke();
    g.strokeStyle = ROJO; g.lineWidth = w; g.stroke();
    g.strokeStyle = "rgba(255,210,120,0.8)"; g.lineWidth = 1; g.setLineDash([3, 3]); g.stroke(); g.setLineDash([]);
    g.restore();
  }

  // estado del pantalón en cada instante (pantalla)
  const EN_CABEZA = { atras: { x: 585, y: 455 }, delante: { x: 985, y: 420 } };   // cintura sobre la frente (retrato)
  const retratoAPantalla = (p, q) => G.aPantalla(p, G.cabeza(p).a(q));
  function pantEnCabeza(pG) {
    const a = retratoAPantalla(pG, EN_CABEZA.atras), b = retratoAPantalla(pG, EN_CABEZA.delante);
    // marco girado media vuelta: la cintura abajo (en la frente) y la entrepierna encima del pelo
    return { c: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, ang: Math.atan2(a.y - b.y, a.x - b.x), ww: Math.hypot(b.x - a.x, b.y - a.y) * 1.08, h: 58 };
  }
  function manoPant(pG, m) { return G.aPantalla(pG, { x: m.x, y: m.y }); }
  function estadoPant(t, pG) {
    const vuelo = 6 * Math.sin(t * 2.3) + 10 * Math.sin(t * 7.1) * tramo(t, T.salta0, T.salta0 + 0.2) * (1 - tramo(t, T.salta1, T.salta1 + 0.2));
    const enPercha = { c: { x: (GANCHO_PA.x + GANCHO_PB.x) / 2, y: GANCHO_PA.y + 8 }, ang: 0, ww: GANCHO_PB.x - GANCHO_PA.x, h: H_PANT, vuelo: 3 * Math.sin(t * 1.7) };
    if (t < T.agarra) return Object.assign(enPercha, { fase: "percha" });
    // en las manos: A = mano cercana, B = la bota de la lejana (la cintura queda entre las dos)
    const bB = manoPant(pG, pG.manoLejos), bA = manoPant(pG, pG.manoCerca);
    const Bp = { x: bB.x, y: bB.y + 4 };
    const kA = tramo(t, T.agarra + 0.05, T.sujeta);
    const Acolg = { x: Bp.x - 30 + 8 * Math.sin(t * 6), y: Bp.y + 14 };
    const Ap = mezcla(Acolg, { x: bA.x, y: bA.y + 2 }, kA);
    const enManos = { c: mezcla(Ap, Bp, 0.5), ang: Math.atan2(Bp.y - Ap.y, Bp.x - Ap.x), ww: Math.max(30, Math.hypot(Bp.x - Ap.x, Bp.y - Ap.y)), h: H_PANT, vuelo };
    if (t < T.agarra + 0.12) {                // sale de la percha enganchado a la bota
      const k = tramo(t, T.agarra, T.agarra + 0.12);
      return { c: mezcla(enPercha.c, enManos.c, k), ang: lerp(0, enManos.ang, k), ww: lerp(enPercha.ww, enManos.ww, k), h: H_PANT, vuelo, fase: "manos" };
    }
    if (t < T.suelta) return Object.assign(enManos, { fase: "manos" });
    const cab = pantEnCabeza(pG);
    if (t >= T.cabeza) return Object.assign(cab, { vuelo: 4 * Math.sin(t * 3.1), fase: "cabeza" });
    // vuela de las manos a la cabeza dando media vuelta
    const pS = poseG(T.suelta - 1e-4), s0 = (() => { const b = manoPant(pS, pS.manoLejos), a = manoPant(pS, pS.manoCerca); return { c: mezcla(a, b, 0.5), ang: Math.atan2(b.y - a.y, b.x - a.x), ww: Math.hypot(b.x - a.x, b.y - a.y) }; })();
    const k = fase(t, T.suelta, T.cabeza), ke = suave(k);
    const fin = cab, cx = lerp(s0.c.x, fin.c.x, ke), cy = lerp(s0.c.y, fin.c.y, k) - 120 * Math.sin(Math.PI * k);
    let a1 = fin.ang; while (a1 - s0.ang < 0) a1 += Math.PI * 2; while (a1 - s0.ang > Math.PI * 2) a1 -= Math.PI * 2;
    return { c: { x: cx, y: cy }, ang: lerp(s0.ang, a1, ke), ww: lerp(s0.ww, fin.ww, ke), h: lerp(H_PANT, fin.h, ke), vuelo: 14 * Math.sin(k * 9), fase: "vuela" };
  }

  // vueltas de los tirantes alrededor del pecho y los brazos (pantalla)
  function enredo(g, t, pG, P) {
    const w = tramo(t, T.enreda0, T.enreda1, x => x);
    const Tr = G.tronco(pG), Q = q => G.aPantalla(pG, Tr(q));
    const vueltas = [[{ x: 62, y: 440 }, { x: 250, y: 458 }, { x: 424, y: 470 }], [{ x: 66, y: 540 }, { x: 250, y: 556 }, { x: 420, y: 566 }], [{ x: 74, y: 628 }, { x: 250, y: 642 }, { x: 412, y: 652 }]];
    // de la cintura del pantalón (en la cabeza) baja por el costado hasta la primera vuelta
    const { c, ang, ww } = P, ux = Math.cos(ang), uy = Math.sin(ang);
    const ancla = { x: c.x + ux * ww * 0.42, y: c.y + uy * ww * 0.42 }, ancla2 = { x: c.x + ux * ww * 0.3, y: c.y + uy * ww * 0.3 + 4 };
    const v0 = Q(vueltas[0][0]), suelto = { x: ancla.x - 6 + 10 * Math.sin(t * 5), y: ancla.y + 60 };
    const llega = mezcla(suelto, v0, clamp(w * 3));
    tira(g, [ancla, mezcla({ x: ancla.x - 10, y: ancla.y + 30 }, { x: (ancla.x + v0.x) / 2 - 12, y: (ancla.y + v0.y) / 2 }, clamp(w * 3)), llega]);
    const s2 = { x: ancla2.x - 2 + 10 * Math.sin(t * 5 + 1), y: ancla2.y + 50 };
    const v2 = Q(vueltas[2][0]), k2 = clamp(w * 3 - 2);
    tira(g, [ancla2, mezcla({ x: ancla2.x - 4, y: ancla2.y + 28 }, { x: Math.min(ancla2.x, v2.x) - 14, y: (ancla2.y + v2.y) / 2 }, k2), mezcla(s2, v2, k2)]);
    for (let i = 0; i < 3; i++) {
      const k = clamp(w * 3 - i); if (k <= 0.01) continue;
      const pts = vueltas[i].map(Q), n = 12, out = [];
      for (let j = 0; j <= n * k; j++) { const u = j / n, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), d = u * u;
        out.push({ x: a * pts[0].x + b * pts[1].x + d * pts[2].x, y: a * pts[0].y + b * (pts[1].y + 10) + d * pts[2].y }); }
      if (out.length > 1) tira(g, out, 6);
    }
  }

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  const RELOJ = { x: 512, y: 92, r: 52 }, TIMBRE = { x: 150, y: 120 }, BALIZA = { x: 900, y: 70 };
  let fondo = null, vineta = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 60; const g = c.getContext("2d");
    g.translate(40, 0);
    // pared de azulejo verde agua arriba y pintura azul petróleo abajo
    const pared = g.createLinearGradient(0, 0, 0, 470); pared.addColorStop(0, "#5f8f8c"); pared.addColorStop(1, "#86b3ad");
    g.fillStyle = pared; g.fillRect(-40, 0, W + 80, 470);
    g.strokeStyle = "rgba(20,50,50,0.18)"; g.lineWidth = 1.5;
    for (let y = 8; y < 300; y += 24) { g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); }
    for (let x = -40; x < W + 40; x += 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 300); g.stroke(); }
    g.fillStyle = "#24464f"; g.fillRect(-40, 300, W + 80, 170);
    g.fillStyle = "#e7e2d4"; g.fillRect(-40, 294, W + 80, 9); g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(-40, 303, W + 80, 3);
    // luz cálida de los fluorescentes
    for (const lx of [260, 760]) {
      const h = g.createRadialGradient(lx, 30, 10, lx, 120, 360); h.addColorStop(0, "rgba(255,245,215,0.45)"); h.addColorStop(1, "rgba(255,240,200,0)"); g.fillStyle = h; g.fillRect(lx - 380, 0, 760, 480);
      g.fillStyle = "#e9edf0"; g.fillRect(lx - 70, 4, 140, 10); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(lx - 70, 4, 140, 10);
      g.fillStyle = "#fffbe8"; g.fillRect(lx - 64, 14, 128, 4);
    }
    // taquillas a la izquierda y a la derecha
    const taquillas = (x0, n) => { for (let i = 0; i < n; i++) {
      const x = x0 + i * 66;
      g.fillStyle = "#c9502f"; g.fillRect(x, 190, 62, 280); g.strokeStyle = TINTA; g.lineWidth = 3; g.strokeRect(x, 190, 62, 280);
      g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(x + 4, 194, 9, 272); g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(x + 50, 194, 9, 272);
      g.strokeStyle = "rgba(0,0,0,0.45)"; g.lineWidth = 2; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(x + 16, 206 + k * 7); g.lineTo(x + 46, 206 + k * 7); g.stroke(); }
      g.fillStyle = "#d8dde2"; g.fillRect(x + 44, 320, 6, 22); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.strokeRect(x + 44, 320, 6, 22);
      g.fillStyle = "#e9e4d6"; g.fillRect(x + 18, 262, 26, 12); g.strokeRect(x + 18, 262, 26, 12);
    } };
    taquillas(-30, 6); taquillas(640, 6);
    // estante de arriba de las taquillas con cascos y un rollo de cuerda
    g.fillStyle = "#6b4a2b"; g.fillRect(-40, 182, 440, 9); g.fillRect(630, 182, 440, 9);
    for (const x of [40, 210, 655, 985]) { g.fillStyle = "#f3d02b"; g.beginPath(); g.ellipse(x, 172, 26, 14, 0, Math.PI, 0); g.fill(); g.fillRect(x - 34, 170, 68, 6); g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.ellipse(x, 172, 26, 14, 0, Math.PI, 0); g.stroke(); g.strokeRect(x - 34, 170, 68, 6); }
    g.strokeStyle = "#c7a05a"; g.lineWidth = 5; for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(925, 168 - k * 3, 30, 10, 0, 0, Math.PI * 2); g.stroke(); }
    // percha del equipo de repuesto (tabla con ganchos)
    g.fillStyle = "#7b5530"; g.fillRect(450, 246, 132, 14); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(450, 246, 132, 14);
    g.fillStyle = "rgba(255,220,170,0.35)"; g.fillRect(452, 248, 128, 3);
    for (const q of [GANCHO_B1, GANCHO_B2, GANCHO_PA, GANCHO_PB]) { g.strokeStyle = TINTA; g.lineWidth = 5; g.beginPath(); g.moveTo(q.x, 253); g.lineTo(q.x, q.y + 4); g.quadraticCurveTo(q.x, q.y + 12, q.x + 7, q.y + 8); g.stroke();
      g.strokeStyle = "#d9a33b"; g.lineWidth = 2.6; g.stroke(); }
    // esfera del cronómetro (las agujas se dibujan en cada fotograma)
    const { x: rx, y: ry, r } = RELOJ;
    g.fillStyle = "rgba(0,0,0,0.25)"; g.beginPath(); g.arc(rx + 4, ry + 5, r + 8, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#c9ced6"; g.beginPath(); g.arc(rx, ry, r + 8, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 3; g.stroke();
    g.fillStyle = "#fbfaf4"; g.beginPath(); g.arc(rx, ry, r, 0, Math.PI * 2); g.fill(); g.lineWidth = 2; g.stroke();
    for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, l = i % 5 ? 4 : 10; g.strokeStyle = i % 15 ? TINTA : "#c8202a"; g.lineWidth = i % 5 ? 1.2 : 3;
      g.beginPath(); g.moveTo(rx + Math.sin(a) * (r - 3), ry - Math.cos(a) * (r - 3)); g.lineTo(rx + Math.sin(a) * (r - 3 - l), ry - Math.cos(a) * (r - 3 - l)); g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = 1.5; g.beginPath(); g.arc(rx, ry + 22, 11, 0, Math.PI * 2); g.stroke();
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; g.beginPath(); g.moveTo(rx + Math.sin(a) * 8, ry + 22 - Math.cos(a) * 8); g.lineTo(rx + Math.sin(a) * 11, ry + 22 - Math.cos(a) * 11); g.stroke(); }
    g.fillStyle = "#c9ced6"; g.fillRect(rx - 26, ry - r - 14, 8, 8); g.fillRect(rx + 18, ry - r - 14, 8, 8); g.strokeRect(rx - 26, ry - r - 14, 8, 8); g.strokeRect(rx + 18, ry - r - 14, 8, 8);
    // extintor y un cartel con pictogramas (sin letras)
    g.save(); g.translate(400, 330);
    g.fillStyle = "#c8202a"; g.beginPath(); g.roundRect ? g.roundRect(-14, 0, 28, 62, 10) : g.rect(-14, 0, 28, 62); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.stroke();
    g.fillStyle = "#1e1e24"; g.fillRect(-6, -10, 12, 10); g.strokeRect(-6, -10, 12, 10); g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(-9, 6, 4, 48);
    g.fillStyle = "#e9e4d6"; g.fillRect(-11, 22, 22, 16); g.strokeRect(-11, 22, 22, 16);
    g.restore();
    g.save(); g.translate(605, 330); g.fillStyle = "#1d7a3a"; g.fillRect(0, 0, 54, 38); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(0, 0, 54, 38);
    g.fillStyle = "#fff"; g.beginPath(); g.arc(17, 11, 4, 0, Math.PI * 2); g.fill(); g.fillRect(14, 15, 6, 12); g.beginPath(); g.moveTo(26, 19); g.lineTo(44, 19); g.lineTo(38, 13); g.moveTo(44, 19); g.lineTo(38, 25); g.strokeStyle = "#fff"; g.lineWidth = 3; g.stroke(); g.restore();
    // suelo de goma oscura con la franja de seguridad
    g.fillStyle = "#3b4044"; g.fillRect(-40, 470, W + 80, H + 60 - 470);
    const su = g.createLinearGradient(0, 470, 0, H + 60); su.addColorStop(0, "rgba(255,255,255,0.06)"); su.addColorStop(1, "rgba(0,0,0,0.35)"); g.fillStyle = su; g.fillRect(-40, 470, W + 80, H + 60 - 470);
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(-40, 470, W + 80, 5);
    for (let x = -40; x < W + 40; x += 40) { g.fillStyle = (x / 40) % 2 ? "#e8c11c" : "#1a1a1e"; g.beginPath(); g.moveTo(x, 482); g.lineTo(x + 40, 482); g.lineTo(x + 30, 492); g.lineTo(x - 10, 492); g.closePath(); g.fill(); }
    g.strokeStyle = "rgba(0,0,0,0.2)"; g.lineWidth = 2;
    for (let x = -40; x < W + 40; x += 110) { g.beginPath(); g.moveTo(x, 494); g.lineTo(x - 60, H + 60); g.stroke(); }
    return c;
  }
  function creaVineta() {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    const v = g.createRadialGradient(512, 320, 300, 512, 320, 700); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.5)");
    g.fillStyle = v; g.fillRect(0, 0, W, H); return c;
  }
  // agujas del cronómetro: arranca con la alarma y da una vuelta cada 8 s
  function agujas(g, t) {
    const { x, y, r } = RELOJ, corre = Math.max(0, t - T.timbre), a = corre / 8 * Math.PI * 2, a2 = corre / 8 / 6 * Math.PI * 2;
    const pulsa = campana(t, T.timbre - 0.05, T.timbre + 0.15);
    g.save(); g.lineCap = "round";
    g.fillStyle = "#c9ced6"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.fillRect(x - 7, y - r - 22 + 4 * pulsa, 14, 14); g.strokeRect(x - 7, y - r - 22 + 4 * pulsa, 14, 14);
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x, y + 22); g.lineTo(x + Math.sin(a2) * 9, y + 22 - Math.cos(a2) * 9); g.stroke();
    g.strokeStyle = ROJO; g.lineWidth = 3.4; g.beginPath(); g.moveTo(x - Math.sin(a) * 10, y + Math.cos(a) * 10); g.lineTo(x + Math.sin(a) * (r - 8), y - Math.cos(a) * (r - 8)); g.stroke();
    g.fillStyle = ROJO; g.beginPath(); g.arc(x, y, 4.5, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke();
    // cuando Marcos lo mira al final, un brillo en el cristal
    const brilla = campana(t, T.mMira, T.mMira1 + 0.2);
    if (brilla > 0) { g.strokeStyle = `rgba(255,255,255,${0.7 * brilla})`; g.lineWidth = 4; g.beginPath(); g.arc(x, y, r + 14 + 4 * Math.sin(t * 8), 0, Math.PI * 2); g.stroke(); }
    g.restore();
  }
  function timbre(g, t) {
    const suena = tramo(t, T.timbre, T.timbre + 0.05) * (1 - tramo(t, T.remo1 - 0.1, T.remo1 + 0.05));
    const v = suena * Math.sin(t * 70);
    g.save(); g.translate(TIMBRE.x + 2 * v, TIMBRE.y); g.lineJoin = "round"; g.strokeStyle = TINTA; g.lineWidth = 2.5;
    g.fillStyle = "#3a3a42"; g.fillRect(-6, -34, 12, 10); g.strokeRect(-6, -34, 12, 10);
    g.fillStyle = "#d7262e"; g.beginPath(); g.arc(0, 0, 26, Math.PI, 0); g.lineTo(28, 4); g.lineTo(-28, 4); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,200,200,0.6)"; g.beginPath(); g.ellipse(-10, -10, 5, 9, -0.5, 0, Math.PI * 2); g.fill();
    g.save(); g.rotate(0.5 * v); g.strokeStyle = TINTA; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -4); g.lineTo(0, 16); g.stroke(); g.fillStyle = "#c9ced6"; g.beginPath(); g.arc(0, 18, 5, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore();
    if (suena > 0.02) {
      g.strokeStyle = `rgba(255,255,255,${0.85 * suena})`; g.lineWidth = 3; g.lineCap = "round";
      for (let i = 0; i < 3; i++) { const ph = (t * 3 + i / 3) % 1, rr = 34 + ph * 30; g.globalAlpha = (1 - ph); g.beginPath(); g.arc(0, -4, rr, -0.6, 0.6); g.stroke(); g.beginPath(); g.arc(0, -4, rr, Math.PI - 0.6, Math.PI + 0.6); g.stroke(); }
    }
    g.restore();
  }
  function baliza(g, t) {
    const enc = tramo(t, T.timbre, T.timbre + 0.1) * (1 - tramo(t, T.mReloj, T.mReloj + 0.5));
    const { x, y } = BALIZA;
    g.save();
    if (enc > 0.01) {                         // resplandor rojo que late en la pared
      const late = 0.55 + 0.45 * Math.sin(t * 14);
      const r = g.createRadialGradient(x, y, 4, x, y, 170); r.addColorStop(0, `rgba(255,60,40,${0.55 * enc * late})`); r.addColorStop(1, "rgba(255,60,40,0)");
      g.fillStyle = r; g.fillRect(x - 170, y - 170, 340, 340);
    }
    g.fillStyle = "#3a3a42"; g.fillRect(x - 18, y + 6, 36, 9); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x - 18, y + 6, 36, 9);
    g.fillStyle = enc > 0.01 ? `rgb(${Math.round(lerp(150, 255, enc))},${Math.round(lerp(40, 70, enc))},40)` : "#962a22";
    g.beginPath(); g.arc(x, y + 6, 15, Math.PI, 0); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.5)"; g.beginPath(); g.ellipse(x - 5, y - 1, 3, 5, -0.4, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrella(g, x, y, r, puntas, rot, rel = 0.45) { g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); }
  function impacto(g, t, t0, x, y, tam) {
    const k = fase(t, t0, t0 + 0.3); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    estrella(g, x, y, tam * (0.6 + 0.8 * salida(k)), 10, 0.3, 0.42); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    estrella(g, x, y, tam * (0.35 + 0.5 * salida(k)), 10, 0.6, 0.5); g.fillStyle = "#ffffff"; g.fill();
    g.restore();
  }
  function estrellitas(g, t, c) {
    const k = tramo(t, T.culo + 0.12, T.culo + 0.35) * (1 - tramo(t, T.gOla0 - 0.2, T.gOla0 + 0.3)); if (k <= 0.01) return;
    const pts = []; for (let i = 0; i < 5; i++) { const a = t * 4.4 + i * Math.PI * 2 / 5; pts.push({ a, x: c.x + Math.cos(a) * 58, y: c.y + Math.sin(a) * 14, z: Math.sin(a) }); }
    pts.sort((u, v) => u.z - v.z);
    g.save(); for (const q of pts) { estrella(g, q.x, q.y, (9 + 3 * q.z) * k, 5, t * 3 + q.a); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke(); } g.restore();
  }
  function polvo(g, t, t0, x, ancho) {
    const k = fase(t, t0 - 0.02, t0 + 0.9); if (k <= 0 || k >= 1) return;
    g.save();
    for (let i = 0; i < 10; i++) { const lado = i % 2 ? 1 : -1, d = (20 + ancho * salida(k)) * (0.55 + hash(i + 50) * 0.6);
      g.globalAlpha = 0.45 * (1 - k); g.fillStyle = "#aab0b2";
      g.beginPath(); g.ellipse(x + lado * d, SUELO - 6 - 22 * k * hash(i + 51), 12 + 18 * k, 7 + 9 * k, 0, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // torbellino que tapa a Marcos mientras se equipa
  function torbellino(g, t, pM) {
    const k = tramo(t, T.remo0, T.remo0 + 0.12) * (1 - tramo(t, T.remo1 - 0.17, T.remo1));
    if (k <= 0.005) return;
    const c = MB.aPantalla(pM, MB.tronco(pM)({ x: 250, y: 560 }));
    g.save();
    g.globalAlpha = 0.93 * k; g.fillStyle = "#dfe6ea";
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + t * 9, rx = 70 + 12 * Math.sin(i * 2.1 + t * 13);
      g.beginPath(); g.ellipse(c.x + Math.cos(a) * 34, c.y - 30 + Math.sin(a) * 120, rx, 58, 0, 0, Math.PI * 2); g.fill(); }
    g.beginPath(); g.ellipse(c.x, c.y - 30, 92, 190, 0, 0, Math.PI * 2); g.fill();
    g.globalAlpha = k; g.strokeStyle = "#9aa6ad"; g.lineWidth = 4; g.lineCap = "round";
    for (let i = 0; i < 7; i++) { const yy = c.y - 190 + i * 55, ph = t * 22 + i * 1.3;
      g.beginPath(); g.ellipse(c.x, yy, 80 - Math.abs(i - 3) * 6, 14, 0, ph % (Math.PI * 2), ph % (Math.PI * 2) + 2.2); g.stroke(); }
    g.strokeStyle = "#ffffff"; g.lineWidth = 3;
    for (let i = 0; i < 6; i++) { const yy = c.y - 170 + i * 62 + 8 * Math.sin(t * 30 + i); g.beginPath(); g.moveTo(c.x + 100 + 10 * i % 30, yy); g.lineTo(c.x + 150 + 14 * (i % 3), yy); g.stroke();
      g.beginPath(); g.moveTo(c.x - 100 - 10 * i % 30, yy + 20); g.lineTo(c.x - 150 - 14 * (i % 3), yy + 20); g.stroke(); }
    g.restore();
  }
  function salpicaCafe(g, t, pM) {
    const k = fase(t, T.timbre, T.timbre + 0.45); if (k <= 0 || k >= 1) return;
    const m = poseM(T.timbre), q = MB.aPantalla(m, { x: m.manoCerca.x, y: m.manoCerca.y });
    g.save(); g.fillStyle = "#5a3418"; g.strokeStyle = TINTA; g.lineWidth = 1;
    for (let i = 0; i < 6; i++) { const vx = (hash(i + 20) - 0.6) * 90, vy = -140 - hash(i + 21) * 80;
      const x = q.x - 12 + vx * k, y = q.y - 26 + vy * k + 420 * k * k; g.globalAlpha = 1 - k;
      g.beginPath(); g.arc(x, y, 2.5 + 1.5 * hash(i), 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.restore();
  }
  function brillo(g, t, pM) {
    const k = campana(t, T.brillo - 0.05, T.brillo + 0.4); if (k <= 0) return;
    const c = MB.aPantalla(pM, MB.cabeza(pM).a({ x: 700, y: 320 }));
    g.save(); g.globalAlpha = k; g.fillStyle = "#ffffff"; estrella(g, c.x, c.y, 16 * k, 4, t * 2, 0.25); g.fill(); g.restore();
  }
  function suspiro(g, t, pM) {
    const k = fase(t, T.mNiega1 - 0.2, T.mNiega1 + 0.6); if (k <= 0 || k >= 1) return;
    const b = MB.aPantalla(pM, MB.boca(pM));
    g.save(); g.globalAlpha = 0.6 * Math.sin(Math.PI * k); g.fillStyle = "#e9eef0";
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(b.x - 14 - 26 * k - i * 9, b.y + 4 + 6 * k, 6 + 5 * k + i * 2, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // gotas de sudor del esfuerzo al saltar (salen despedidas)
  function gotas(g, t, pG) {
    const k = tramo(t, T.salta0 + 0.3, T.salta0 + 0.6) * (1 - tramo(t, T.salta1 - 0.2, T.salta1)); if (k <= 0.01) return;
    const c = retratoAPantalla(pG, { x: 760, y: 380 });
    g.save(); g.fillStyle = "#bfe8ff"; g.strokeStyle = "#1d3b52"; g.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) { const ph = (t * 1.8 + i / 4) % 1, a = -2.2 + i * 0.45; g.globalAlpha = k * (1 - ph);
      const x = c.x + Math.cos(a) * (30 + 50 * ph), y = c.y + Math.sin(a) * (30 + 50 * ph) + 60 * ph * ph;
      g.beginPath(); g.ellipse(x, y, 3.5, 5, a, 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.restore();
  }

  /* ---------- botas: dónde está cada una ---------- */
  function botaColgada(gancho, t, desfase) { return { x: gancho.x, y: gancho.y + 10, ang: 0.05 * Math.sin(t * 1.9 + desfase) }; }
  function estadoBota1(t, pG) {
    const col = botaColgada(GANCHO_B1, t, 0);
    if (t < T.bota0 + 0.2) return col;
    const enMano = botaEnMano(pG, pG.manoLejos);
    const k = tramo(t, T.bota0 + 0.2, T.botaEn);
    return { x: lerp(col.x, enMano.x, k), y: lerp(col.y, enMano.y, k), ang: lerp(col.ang, enMano.ang, k) };
  }
  // la segunda bota tiembla con el golpe, se suelta y le cae en la cabeza; luego rebota al suelo
  function estadoBota2(t, pG) {
    const col = botaColgada(GANCHO_B2, t, 1.3);
    const tiembla = campana(t, T.culo, T.botaCae) * Math.sin(t * 40);
    if (t < T.botaCae) return { x: col.x, y: col.y, ang: col.ang + 0.25 * tiembla };
    const cab = pantEnCabeza(poseG(T.bonk)), tope = { x: cab.c.x, y: cab.c.y - 64 - 34 };
    const a0 = col.ang;
    if (t < T.bonk) { const k = fase(t, T.botaCae, T.bonk); return { x: lerp(col.x, tope.x, k), y: lerp(col.y, tope.y, entrada(k)), ang: a0 + 1.4 * k }; }
    // rebota hacia la derecha en parábola y cae de lado al suelo, girando justo lo que le falta para quedar tumbada
    const u = t - T.bonk, vx = 230, vy = -330, gg = 1700, yS = SUELO - 16;
    const tl = (-vy + Math.sqrt(vy * vy + 2 * gg * (yS - tope.y))) / gg;
    const aIni = a0 + 1.4, giros = Math.round((aIni + 8 * tl - (-Math.PI / 2)) / (Math.PI * 2));
    const aFin = -Math.PI / 2 + giros * Math.PI * 2;
    if (u < tl) return { x: tope.x + vx * u, y: tope.y + vy * u + 0.5 * gg * u * u, ang: lerp(aIni, aFin, u / tl) };
    const d = u - tl, desliza = 0.3 * vx * (1 - Math.exp(-d * 6)) / 6;     // resbala un poco y se para
    return { x: tope.x + vx * tl + desliza, y: yS, ang: aFin };
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const cerca = tramo(t, T.culo - 0.2, T.culo + 0.8, suave);
    return { k: 1 + 0.05 * cerca, x: 512 + 18 * cerca, y: 300 + 14 * cerca };
  }

  /* ---------- poses ---------- */
  function pose(t) { return { g: poseG(t), m: poseM(t) }; }
  // vuelve a dibujar la mano cercana de Guillermo encima del pantalón (lo agarra)
  function manoEncima(g, pG, m) {
    g.save(); g.translate(pG.x, pG.suelo); g.scale(pG.s, pG.s); g.translate(-G.PELVIS.x, -G.SUELO);
    g.translate(m.x, m.y); g.rotate(m.ang || 0); g.scale(JK, JK);
    const k = m.puno ?? 1; if (k > 0.01) { if (k < 0.999) g.scale(k, k);
      if (m.dedos) Personaje2D.mano(g, m, { piel: G.C.piel, sombra: G.C.pielSombra, tinta: G.C.tinta }); else Personaje2D.puno(g, m.pulgar, { piel: G.C.piel, sombra: G.C.pielSombra, tinta: G.C.tinta }); }
    g.restore();
  }
  function pintaBota(g, b) { g.save(); g.translate(b.x, b.y); g.rotate(b.ang); g.scale(1.18, 1.18); bota(g); g.restore(); }

  class GuillermoVestirse extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !MB.listo()) return;
      if (!fondo) { fondo = creaFondo(); vineta = creaVineta(); }
      const P = pose(t), pG = P.g, pM = P.m;
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = (t >= T.culo ? 7 * Math.exp(-(t - T.culo) * 7) : 0) + (t >= T.bonk ? 3 * Math.exp(-(t - T.bonk) * 9) : 0) + (t >= T.cabeza ? 2 * Math.exp(-(t - T.cabeza) * 10) : 0);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -40, 0);
      agujas(g, t); timbre(g, t); baliza(g, t);
      // equipo de repuesto en la percha
      const pant = estadoPant(t, pG);
      const b1 = estadoBota1(t, pG), b2 = estadoBota2(t, pG);
      if (pant.fase === "percha") { tirantesSueltos(g, pant, t, 34); pantalon(g, pant, t); }
      const b1Colgada = t < T.bota0 + 0.2, b2Colgada = t < T.botaCae;
      if (b1Colgada) pintaBota(g, b1);
      if (b2Colgada) pintaBota(g, b2);
      // sombras
      g.save(); g.fillStyle = "rgba(0,0,0,0.32)";
      const sombra = (x, alto, ancho) => { const k = clamp(1 - alto / 400); g.globalAlpha = k; g.beginPath(); g.ellipse(x, SUELO + 2, ancho * (0.5 + 0.5 * k), 8, 0, 0, Math.PI * 2); g.fill(); };
      sombra(pG.x + (pG.pelvis.y > 1000 ? 60 : 6), SUELO - pG.suelo, pG.pelvis.y > 1000 ? 130 : 82); sombra(pM.x - 4, 0, 96);
      g.restore();
      // Marcos con su botella a la espalda y el torbellino
      botella(g, pM, pM.equipo || 0);
      MB.dibujar(g, pM, t);
      salpicaCafe(g, t, pM);
      torbellino(g, t, pM);
      brillo(g, t, pM);
      suspiro(g, t, pM);
      // Guillermo y el equipo que se va poniendo
      G.dibujar(g, pG, t);
      if (pant.fase !== "percha") {
        if (pant.fase === "manos") tirantesSueltos(g, pant, t, 40);
        pantalon(g, pant, t);
        if (pant.fase === "cabeza") enredo(g, t, pG, pant);
        if (pant.fase === "manos" && t > T.agarra + 0.05) manoEncima(g, pG, pG.manoCerca);
      }
      if (!b1Colgada) pintaBota(g, b1);
      if (!b2Colgada) pintaBota(g, b2);
      gotas(g, t, pG);
      // golpes
      polvo(g, t, T.culo, X_CULO + 40, 110);
      impacto(g, t, T.culo, X_CULO - 30, SUELO - 22, 34);
      if (t >= T.bonk) { const c = pantEnCabeza(pG); impacto(g, t, T.bonk, c.c.x, c.c.y - 66, 30); }
      if (t >= T.culo) { const c = pantEnCabeza(pG); estrellitas(g, t, { x: c.c.x, y: c.c.y - 70 }); }
      g.restore();
      g.drawImage(vineta, 0, 0);
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00028", nombre: "Guillermo y Marcos · Vestirse en tres segundos", crear: () => new GuillermoVestirse() });
  window.__A2D_00028 = { pose, T, DUR };
})();
