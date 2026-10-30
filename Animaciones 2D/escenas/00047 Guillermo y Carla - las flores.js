"use strict";
/* 00047 · Guillermo y Carla · Las flores
 *
 * Negro → terraza con pérgola al atardecer: glicinias colgando, guirnalda de bombillas, tejados al
 * fondo y una maceta grande de barro vacía a la derecha. Carla espera y mira el reloj → Guillermo
 * llega muy orgulloso con un ramo enorme escondido detrás de la espalda; una abeja le sigue
 * zumbando alrededor de las flores → se planta, guiña a cámara; la abeja le ronda la cabeza y se
 * mete en el ramo → le pica la nariz: «ah… ah…», se aguanta con el dedo bajo la nariz… y se le
 * pasa → da dos pasos y, con una reverencia, le ofrece el ramo; Carla se emociona → la abeja sale
 * del ramo con una nube de polen justo bajo su nariz: «ah… ah…» y ¡ACHÍS!: todos los pétalos
 * salen volando en una tormenta de colores y la abeja sale despedida → Carla, despeinada por el
 * soplido, se queda con un ramillete de tallos pelados; cae el último pétalo → Carla mira los
 * tallos, mira a cámara… y se parte de risa; tira los tallos por encima del hombro, que acaban
 * plantados en la maceta → le quita a Guillermo una florecilla que se le había quedado en el pelo y
 * se la pone detrás de la oreja; él se derrite → la abeja vuelve, mareada, y se le posa en la
 * nariz: Guillermo se queda bizco → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto. El ramo es un único objeto que pasa de la mano de
 * Guillermo a la de Carla; los pétalos parten exactamente de donde estaban en el ramo y caen al
 * suelo, donde se quedan.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, CA = Carla;
  const S = 0.30, SUELO = 548;
  const KC = S * CA.K;
  const DUR = 15.0;
  const T = {
    gIn0: 0.25, gIn1: 2.3, cReloj0: 0.5, cReloj1: 0.8, cReloj2: 1.5, cReloj3: 1.8, cVe: 1.75,
    orgullo: 2.35, guinoG: 2.6,
    pica: 3.6, ah1: 3.82, ah2: 4.1, aguanta0: 4.22, aguanta1: 4.95, alivio: 5.0, chulo: 5.2,
    paso0: 5.5, paso1: 6.05, saca0: 5.62, saca1: 5.95, ofrece: 6.42,
    cAww: 6.4, polen: 6.72, ah3: 6.95, ah4: 7.32, achis: 7.75,
    ultimo: 8.85, cAbre: 9.05, cambio: 9.12, suelta: 9.8, vuela: 11.62, coge0: 9.3, coge1: 9.68, mira: 9.8, poker: 10.2,
    rie0: 10.5, rie1: 11.3, tira0: 11.3, tira1: 11.5, maceta: 12.0,
    perdon: 11.42, coger0: 11.6, coger1: 11.95, mano1: 12.2, pasa: 12.3, oreja1: 12.6, guinoC: 12.85,
    derrite: 12.7, abejaVuelve: 12.6, abejaPosa: 13.45, risita: 13.5,
    fin: 14.35
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
  const ABIERTA = D(1, 1), RELAJADA = D(0.55, 0.6, 0.55, 0.5, 0.45), AGARRA = D(0.32, 0.3, 0.3, 0.3, 0.3),
    INDICE = D(0.15, 1, 0.05, 0.05, 0.05), PINZA = D(0.75, 0.75, 0.15, 0.1, 0.1), PECHO = D(0.8, 0.95, 0.95, 0.9, 0.85),
    RASCA = D(0.6, 0.7, 0.65, 0.6, 0.55);
  const rot = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };

  /* ---------- caras (mismos campos para los dos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, wi: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* ---------- pasos: x de pantalla de cada tobillo ---------- */
  function pie(lista, t, alto) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x, h] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    const arco = Math.sin(Math.PI * u);
    return { x: lerp(xa, x, suave5(u)), alza: (h ?? alto) * arco, ang: -0.15 * arco, u, i };
  }

  /* =====================================================================================
   * GUILLERMO (a la izquierda, mira a la derecha)
   * ===================================================================================== */
  const XG_IN = -150, XG_A = 316, XG = 384;
  const OFF_G = { cerca: -19, lejos: 18 };
  const PASOS_G = (() => {
    const c = [[-10, -9, XG_IN + OFF_G.cerca]], l = [[-10, -9, XG_IN + OFF_G.lejos]];
    const n = 5, dt = (T.gIn1 - T.gIn0) / n;
    for (let i = 0; i < n; i++) {
      const t0 = T.gIn0 + i * dt, x = lerp(XG_IN, XG_A, (i + 1) / n);
      if (i % 2 === 0) c.push([t0, t0 + dt * 1.02, x + OFF_G.cerca]); else l.push([t0, t0 + dt * 1.02, x + OFF_G.lejos]);
    }
    l.push([T.gIn1 - 0.04, T.gIn1 + 0.24, XG_A + OFF_G.lejos, 14]);
    // dos pasitos hasta Carla para ofrecerle el ramo
    c.push([T.paso0, T.paso0 + 0.3, XG + OFF_G.cerca, 20]); l.push([T.paso0 + 0.24, T.paso1, XG + OFF_G.lejos, 16]);
    return { cerca: c, lejos: l };
  })();
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };

  const CARAS_G = {
    inicio: E({ mx: 0.85, my: -0.15, c: 0.32, sd: 8, gd: 0.06, si: 8, gi: 0.06, sonr: 0.55, ancho: 0.9 }),
    guino: E({ mx: -0.85, my: -0.1, c: 0.22, wd: 0.78, sd: 14, gd: 0.1, si: 2, gi: -0.04, abre: 4, ancho: 1.05, sonr: 0.85 }),
    abeja: E({ mx: 0.85, my: -0.4, iris: 1.05, sd: 14, gd: 0.1, si: 14, gi: 0.1, abre: 6, ancho: 0.7, sonr: 0.2 }),
    pica: E({ mx: 0.6, my: 0.5, c: 0.35, sd: 6, gd: 0.12, si: -2, gi: -0.06, abre: 0, ancho: 0.75, sonr: -0.35 }),
    ah1: E({ mx: 0.4, my: -0.6, c: 0.62, sd: 18, gd: 0.16, si: 18, gi: 0.16, abre: 22, ancho: 0.75, sonr: -0.1, dientes: 0 }),
    ah2: E({ mx: 0.3, my: -0.7, c: 0.86, sd: 24, gd: 0.2, si: 24, gi: 0.2, abre: 36, ancho: 0.8, sonr: -0.15, dientes: 0 }),
    aguanta: E({ mx: 0, my: 0, c: 1, z: 1, sd: 16, gd: 0.22, si: 16, gi: 0.22, abre: 0, ancho: 0.75, sonr: -0.55, mof: 0.6 }),
    alivio: E({ mx: 0.5, my: 0.1, c: 0.55, sd: 8, gd: 0.05, si: 8, gi: 0.05, abre: 10, ancho: 0.55, sonr: 0.1 }),
    chulo: E({ mx: -0.85, my: -0.1, c: 0.28, sd: 14, gd: 0.1, si: 4, gi: -0.02, abre: 0, ancho: 0.95, sonr: 0.75 }),
    galan: E({ mx: 0.85, my: 0.2, c: 0.92, h: 1, sd: 16, gd: 0.12, si: 16, gi: 0.12, abre: 14, ancho: 1.1, sonr: 0.95 }),
    polen: E({ mx: 0.7, my: 0.85, iris: 1.12, sd: 22, gd: 0.16, si: 22, gi: 0.16, abre: 6, ancho: 0.55, sonr: -0.2 }),
    ah3: E({ mx: 0.4, my: -0.6, c: 0.66, sd: 22, gd: 0.18, si: 22, gi: 0.18, abre: 26, ancho: 0.78, sonr: -0.1, dientes: 0 }),
    ah4: E({ mx: 0.3, my: -0.75, c: 0.9, sd: 28, gd: 0.22, si: 28, gi: 0.22, abre: 46, ancho: 0.85, sonr: -0.15, dientes: 0 }),
    achis: E({ mx: 0, my: 0, c: 1, z: 1, sd: 8, gd: 0.25, si: 8, gi: 0.25, abre: 58, ancho: 1.2, sonr: -0.4, lengua: 0.3 }),
    uy: E({ mx: 0.75, my: 0.45, iris: 0.9, sd: 24, gd: 0.18, si: 24, gi: 0.18, abre: 12, ancho: 0.55, sonr: -0.3 }),
    culpa: E({ mx: 0.85, my: -0.05, c: 0.2, sd: 22, gd: 0.22, si: 22, gi: 0.22, abre: 6, ancho: 1.1, sonr: 0.55 }),
    nervios: E({ mx: 0.6, my: 0.1, c: 0.55, h: 0.6, sd: 18, gd: 0.2, si: 18, gi: 0.2, abre: 22, ancho: 1.15, sonr: 0.85 }),
    perdon: E({ mx: 0.75, my: -0.85, c: 0.2, sd: 26, gd: 0.25, si: 26, gi: 0.25, abre: 4, ancho: 0.9, sonr: 0.45 }),
    mira: E({ mx: 0.9, my: -0.45, iris: 1.08, sd: 18, gd: 0.12, si: 18, gi: 0.12, abre: 8, ancho: 0.7, sonr: 0.3 }),
    derrite: E({ mx: 0.85, my: 0, c: 0.9, h: 1, sd: 20, gd: 0.18, si: 20, gi: 0.18, abre: 10, ancho: 1.05, sonr: 1 }),
    bizco: E({ mx: 0.85, my: 0.4, iris: 1.05, sd: 26, gd: 0.18, si: 26, gi: 0.18, abre: 10, ancho: 0.45, sonr: -0.2 })
  };
  const GUION_CARA_G = [
    [T.guinoG - 0.08, T.guinoG + 0.1, "guino"], [T.guinoG + 0.42, T.guinoG + 0.58, "abeja"],
    [T.pica, T.pica + 0.12, "pica"], [T.ah1 - 0.04, T.ah1 + 0.12, "ah1"], [T.ah2 - 0.04, T.ah2 + 0.1, "ah2"],
    [T.aguanta0, T.aguanta0 + 0.08, "aguanta"], [T.alivio, T.alivio + 0.15, "alivio"], [T.chulo, T.chulo + 0.2, "chulo"],
    [T.saca0 + 0.1, T.ofrece, "galan"], [T.polen, T.polen + 0.12, "polen"], [T.ah3 - 0.04, T.ah3 + 0.12, "ah3"],
    [T.ah4 - 0.04, T.ah4 + 0.12, "ah4"], [T.achis - 0.03, T.achis + 0.02, "achis"], [T.achis + 0.3, T.achis + 0.5, "uy"],
    [T.coge1 + 0.05, T.coge1 + 0.3, "culpa"], [T.rie0 + 0.05, T.rie0 + 0.25, "nervios"], [T.perdon, T.perdon + 0.3, "perdon"],
    [T.coger1 + 0.05, T.coger1 + 0.25, "mira"], [T.derrite, T.derrite + 0.3, "derrite"], [T.abejaPosa - 0.12, T.abejaPosa + 0.08, "bizco"]
  ];
  // cuerpo: px/pel (pelvis en la hoja), torso (+ hacia delante), cab
  const CUERPOS_G = {
    anda: { px: 0, pel: 0, torso: -0.06, cab: -0.1 },
    orgullo: { px: -4, pel: -4, torso: -0.1, cab: -0.14 },
    abeja: { px: 0, pel: 2, torso: -0.04, cab: -0.04 },
    pica: { px: 0, pel: 2, torso: -0.02, cab: 0.02 },
    ah1: { px: -6, pel: -2, torso: -0.1, cab: -0.16 },
    ah2: { px: -10, pel: -6, torso: -0.16, cab: -0.26 },
    aguanta: { px: -4, pel: 4, torso: -0.06, cab: -0.04 },
    alivio: { px: 0, pel: 4, torso: 0.02, cab: 0.04 },
    chulo: { px: -2, pel: 0, torso: -0.06, cab: -0.08 },
    reverencia: { px: -18, pel: 14, torso: 0.26, cab: 0.3 },
    ah3: { px: -26, pel: 6, torso: 0.08, cab: -0.12 },
    ah4: { px: -32, pel: 2, torso: -0.04, cab: -0.3 },
    tras: { px: -14, pel: 6, torso: -0.03, cab: -0.04 },
    culpa: { px: -10, pel: 6, torso: -0.02, cab: 0.0 },
    nervios: { px: -6, pel: 4, torso: 0.02, cab: -0.02 },
    perdon: { px: -50, pel: 80, torso: 0.2, cab: 0.4 },
    mira: { px: -10, pel: 8, torso: 0.08, cab: 0.04 },
    derrite: { px: -4, pel: 8, torso: 0.0, cab: -0.06 },
    bizco: { px: -4, pel: 6, torso: 0.02, cab: 0.0 }
  };
  const GUION_CUERPO_G = [
    [T.gIn1 - 0.1, T.orgullo + 0.2, "orgullo"], [T.guinoG + 0.4, T.guinoG + 0.6, "abeja"], [T.pica, T.pica + 0.15, "pica"],
    [T.ah1 - 0.05, T.ah1 + 0.2, "ah1"], [T.ah2 - 0.05, T.ah2 + 0.15, "ah2"], [T.aguanta0, T.aguanta0 + 0.15, "aguanta"],
    [T.alivio, T.alivio + 0.2, "alivio"], [T.chulo, T.chulo + 0.25, "chulo"], [T.saca1 - 0.05, T.ofrece, "reverencia"],
    [T.ah3 - 0.05, T.ah3 + 0.2, "ah3"], [T.ah4 - 0.05, T.ah4 + 0.2, "ah4"], [T.achis, T.achis + 0.06, "tras", salida],
    [T.coge1, T.coge1 + 0.3, "culpa"], [T.rie0, T.rie0 + 0.25, "nervios"], [T.perdon, T.perdon + 0.35, "perdon"],
    [T.coger1 + 0.03, T.mano1 + 0.1, "mira"], [T.derrite, T.derrite + 0.35, "derrite"], [T.abejaPosa - 0.1, T.abejaPosa + 0.15, "bizco"]
  ];

  // brazo del ramo (cercano): ángulo y distancia de la mano desde el hombro, en el marco del torso
  const HC = G.HOMBRO_C;
  function brazoRamo(t) {
    // detrás de la espalda → se echa atrás (amago) → barrido por abajo hasta ofrecerlo
    const k1 = suave(fase(t, T.saca0, T.saca1)), k2 = suave(fase(t, T.saca1, T.ofrece));
    let th = lerp(1.54, 1.95, k1), r = lerp(267, 312, k1);
    th = lerp(th, 0.36, k2); r = lerp(r, 316, k2) - 26 * Math.sin(Math.PI * k2);
    // balanceo al andar y al ofrecer
    th += 0.03 * Math.sin(t * 2.3) * tramo(t, T.ofrece, T.ofrece + 0.3);
    // el soplido le sacude el brazo
    th -= 0.16 * campana(t, T.achis, T.achis + 0.35);
    // se lo acerca a Carla para que lo coja
    r += 30 * dentro(t, T.cAbre + 0.1, T.coge0 + 0.1, T.coge1 + 0.1, T.coge1 + 0.4);
    return { th, r };
  }
  // ángulo del eje del ramo (pantalla; dirección de los tallos a las flores): detrás → abajo-atrás → hacia Carla
  function phiRamoG(t) {
    const k1 = suave(fase(t, T.saca0, T.saca1)), k2 = suave(fase(t, T.saca1, T.ofrece));
    let f = lerp(-1.18, 2.21, k1);
    f = lerp(f, -0.86, k2);
    f += 0.03 * Math.sin(t * 2.0) * tramo(t, T.ofrece, T.ofrece + 0.4);
    f -= 0.18 * campana(t, T.achis, T.achis + 0.4);
    return f;
  }

  function poseG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "anda", t);
    const respira = Math.sin(t * 2.4);
    const fc = pie(PASOS_G.cerca, t, 34), fl = pie(PASOS_G.lejos, t, 34);
    const X = (fc.x - OFF_G.cerca + fl.x - OFF_G.lejos) / 2;
    const andando = dentro(t, T.gIn0, T.gIn0 + 0.15, T.gIn1 - 0.1, T.gIn1 + 0.15) + 0.6 * dentro(t, T.paso0, T.paso0 + 0.1, T.paso1 - 0.1, T.paso1);
    const bote = Math.max(Math.sin(Math.PI * fc.u), Math.sin(Math.PI * fl.u)) * andando;
    // estornudo: latigazo hacia delante que vuelve
    const ach = t >= T.achis ? (1 - Math.exp(-(t - T.achis) * 45)) * Math.exp(-(t - T.achis) * 5) : 0;
    // tiembla aguantándose
    const tiembla = dentro(t, T.aguanta0, T.aguanta0 + 0.1, T.aguanta1 - 0.1, T.aguanta1) + 0.7 * dentro(t, T.ah4, T.ah4 + 0.2, T.achis - 0.02, T.achis);
    const inhala = dentro(t, T.ah1, T.ah2 + 0.1, T.aguanta0, T.aguanta0 + 0.1) + dentro(t, T.ah3, T.ah4 + 0.1, T.achis, T.achis + 0.08);
    const p = {
      x: X, suelo: SUELO, s: S, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: G.PELVIS.x + b.px - 18 * ach, y: G.PELVIS.y + b.pel + respira * 1.3 - 18 * bote + 4 * ruido(t * 30) * tiembla },
      torso: b.torso + 0.04 * bote * Math.sin(t * 8) + 0.22 * ach + 0.012 * ruido(t * 34) * tiembla,
      torsoEsc: { x: 1, y: 1 + respira * 0.005 + 0.035 * inhala },
      piernas: {}, cabeza: { ang: b.cab + 0.3 * ach + 0.02 * ruido(t * 31 + 5) * tiembla, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    for (const [ld, f] of [["cerca", fc], ["lejos", fl]]) {
      const hx = G.aHoja(p, { x: f.x, y: 0 }).x;
      p.piernas[ld] = { tob: { x: hx, y: TOB_G[ld] - f.alza / S }, ang: f.ang * 1.4 };
    }
    manosG(p, t);
    // cara: sigue a la abeja con la mirada mientras le ronda
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    const sigue = dentro(t, T.guinoG + 0.4, T.guinoG + 0.6, T.pica - 0.1, T.pica);
    if (sigue > 0) {
      const ab = abeja(t, p);
      const hc = G.aPantalla(p, G.centroCabeza(p));
      ex.mx = lerp(ex.mx, clamp((ab.x - hc.x) / 70, -1, 1.05), sigue); ex.my = lerp(ex.my, clamp((ab.y - hc.y) / 45, -1, 1), sigue);
    }
    p.cara = cara(ex, parpadeo(t, [1.2, 3.1, 5.35, 8.55, 9.05, 10.3, 11.95, 13.9]));
    p.cara.mofletes = 0.7 * dentro(t, T.aguanta0, T.aguanta0 + 0.1, T.aguanta1 - 0.05, T.alivio + 0.05);
    p.cara.rubor = 0.6 * dentro(t, T.coge1, T.coge1 + 0.3, T.derrite, T.derrite + 0.3) + 0.95 * tramo(t, T.derrite, T.derrite + 0.3);
    p.rojo = 0.35 * dentro(t, T.aguanta0, T.aguanta0 + 0.2, T.aguanta1, T.alivio + 0.1) + 0.3 * dentro(t, T.ah4, T.ah4 + 0.2, T.achis, T.achis + 0.3)
      + 0.25 * dentro(t, T.coge1, T.coge1 + 0.3, T.rie1, T.rie1 + 0.3);
    p.sudor = 0.7 * dentro(t, T.coge1 + 0.1, T.coge1 + 0.4, T.rie1, T.rie1 + 0.3);
    // capa propia de la cara: arruga de la nariz y ojos bizcos al final
    const arruga = dentro(t, T.pica, T.pica + 0.08, T.aguanta1, T.alivio + 0.1) + dentro(t, T.polen + 0.1, T.polen + 0.2, T.achis, T.achis + 0.05);
    const bz = tramo(t, T.abejaPosa - 0.05, T.abejaPosa + 0.15);
    p.capaCabeza = (arruga > 0.01 || bz > 0.01) ? (g, tt) => capaG(g, tt, p, arruga, bz) : null;
    return p;
  }
  // mano de Guillermo desde un punto del retrato (para rascarse la cabeza)
  function manosG(p, t) {
    const Tr = G.tronco(p);
    // --- mano cercana: el ramo, y luego a rascarse la nuca ---
    const br = brazoRamo(t);
    let c = Tr({ x: HC.x + br.r * Math.cos(br.th), y: HC.y + br.r * Math.sin(br.th) });
    let cmu = br.th + p.torso + Math.PI, cang = 0, cd = AGARRA, cpu = 1;
    const suelta = tramo(t, T.coge1, T.coge1 + 0.12);            // al soltar el ramo abre la mano y la retira
    if (suelta > 0) { c = { x: c.x - 40 * suelta, y: c.y + 50 * suelta }; cd = mezclaD(cd, ABIERTA, suelta); }
    const rasca = dentro(t, T.coge1 + 0.1, T.coge1 + 0.45, T.perdon, T.perdon + 0.3);
    if (rasca > 0) {
      const H = G.cabeza(p), q = H.a({ x: 548 + 10 * Math.sin(t * 13), y: 440 + 14 * Math.sin(t * 13 + 1.2) });
      c = mezcla(c, q, rasca); cmu = lerp(cmu, 1.25, rasca); cd = mezclaD(cd, RASCA, rasca);
    }
    // al derretirse, la mano cercana cae relajada junto al muslo
    const cae = tramo(t, T.perdon, T.perdon + 0.35);               // y la vuelve a meter en el bolsillo
    if (cae > 0) { const b = manoDesde({ x: 131, y: 652 }, 0, -1.75); c = mezcla(c, b, cae); cmu = lerp(cmu, -1.75, cae); cd = mezclaD(cd, RELAJADA, cae); cpu = 1 - cae; }
    // --- mano lejana: bolsillo, dedo bajo la nariz, mano al pecho ---
    const BL = manoDesde({ x: 372, y: 648 }, 0, -1.75);
    let l = { x: BL.x, y: BL.y }, lmu = -1.75, lang = 0, ld = RELAJADA, lpu = 0;
    const pone = (w, q, mu, d) => { if (w <= 0) return; l = mezcla(l, q, w); lmu = lerp(lmu, mu, w); ld = mezclaD(ld, d, w); lpu = lerp(lpu, 1, w); };
    const nariz = G.cabeza(p).a(NARIZ);
    const dedo = q => ({ x: q.x + 12, y: q.y + 30 });         // la mano bajo la nariz, con el índice tumbado debajo
    pone(dentro(t, T.aguanta0 - 0.18, T.aguanta0, T.aguanta1, T.alivio + 0.2), dedo(nariz), 0.75, INDICE);
    // la mano al pecho para la reverencia (y la vuelve a intentar con el dedo antes del estornudo)
    pone(dentro(t, T.chulo, T.saca0 + 0.1, T.ah4 - 0.15, T.ah4 + 0.05), Tr({ x: 300, y: 430 }), 2.6, PECHO);
    pone(dentro(t, T.ah4 - 0.12, T.ah4 + 0.12, T.achis + 0.05, T.achis + 0.3), dedo(nariz), 0.75, INDICE);
    // se frota la nariz después, y luego deja la mano junto al cuerpo
    pone(dentro(t, T.achis + 0.3, T.achis + 0.5, T.ultimo - 0.1, T.ultimo + 0.15), { x: nariz.x + 10 + 8 * Math.sin(t * 16), y: nariz.y + 26 }, 0.9, INDICE);
    pone(tramo(t, T.derrite, T.derrite + 0.4), Tr({ x: 300, y: 440 }), 2.6, PECHO);
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: -1, puno: cpu, dedos: cd };
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: -1, puno: lpu, dedos: ld };
    // el ramo va en la mano cercana mientras lo sostiene él (por delante del cuerpo)
    // (sigue pintándolo en su capa unos fotogramas más, hasta que su mano se ha apartado del ramo)
    if (t >= T.saca1 && t < T.suelta) p.manoCerca.objeto = objetoRamo(p, p.manoCerca, 1);
  }
  const R_M = G.MUNECA_R * G.JK;
  const manoDesde = (m, a, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, a); return { x: m.x - o.x, y: m.y - o.y }; };
  const NARIZ = { x: 866, y: 684 };                         // punta de la nariz de Guillermo (retrato)
  const FLOR_PELO = { x: 975, y: 480 };                     // donde se le queda la florecilla en el pelo (retrato)

  /* =====================================================================================
   * CARLA (a la derecha, en espejo: mira a la izquierda)
   * ===================================================================================== */
  const XC = 578, PASO_C1 = 8, PASO_C2 = 20;
  const OFF_C = { cerca: 60 * KC, lejos: -70 * KC };
  const PASOS_C = (() => {
    const c = [[-10, -9, XC + OFF_C.cerca]], l = [[-10, -9, XC + OFF_C.lejos]];
    // un pasito hacia él para coger el ramo, y otro para quitarle la flor del pelo
    l.push([T.coge0 - 0.25, T.coge0 + 0.02, XC + OFF_C.lejos - PASO_C1, 10]); c.push([T.coge0 - 0.1, T.coge0 + 0.16, XC + OFF_C.cerca - PASO_C1, 8]);
    l.push([T.coger0 - 0.14, T.coger0 + 0.12, XC + OFF_C.lejos - PASO_C2, 10]); c.push([T.coger0, T.coger0 + 0.26, XC + OFF_C.cerca - PASO_C2, 8]);
    return { cerca: c, lejos: l };
  })();
  const TOB_C = CA.SUELO - CA.TOBILLO_ALTO;
  const CARAS_C = {
    inicio: E({ mx: 0.8, my: 0.1, c: 0.38, sd: 2, gd: 0, si: 2, gi: 0, sonr: 0.05, ancho: 0.85 }),
    reloj: E({ mx: 0.55, my: 0.85, c: 0.42, sd: 6, gd: 0.04, si: -2, gi: -0.04, sonr: -0.1, ancho: 0.8 }),
    suspiro: E({ mx: 0.2, my: -0.5, c: 0.6, sd: 10, gd: 0.08, si: 10, gi: 0.08, abre: 10, ancho: 0.6, sonr: -0.1 }),
    ve: E({ mx: 0.9, my: 0.05, c: 0.2, sd: 16, gd: 0.1, si: 16, gi: 0.1, abre: 6, ancho: 0.9, sonr: 0.65 }),
    curiosa: E({ mx: 0.9, my: -0.3, c: 0.25, sd: 4, gd: -0.02, si: 18, gi: 0.12, abre: 0, ancho: 0.8, sonr: 0.35 }),
    aww: E({ mx: 0.9, my: 0.35, iris: 1.15, c: 0.1, sd: 22, gd: 0.14, si: 22, gi: 0.14, abre: 14, ancho: 0.7, sonr: 0.8 }),
    tensa: E({ mx: 0.9, my: 0.15, iris: 1.05, sd: 24, gd: 0.16, si: 24, gi: 0.16, abre: 0, ancho: 0.9, sonr: 0.35 }),
    sopla: E({ mx: 0, my: 0, c: 1, z: 1, sd: 6, gd: 0.18, si: 6, gi: 0.18, abre: 0, ancho: 0.7, sonr: -0.3 }),
    pasmada: E({ mx: 0.7, my: 0.55, c: 0.15, sd: 12, gd: 0.06, si: 12, gi: 0.06, abre: 4, ancho: 0.6, sonr: 0 }),
    mira: E({ mx: 0.5, my: -0.25, c: 0.2, sd: 14, gd: 0.08, si: 14, gi: 0.08, abre: 0, ancho: 0.6, sonr: -0.05 }),
    poker: E({ mx: -0.85, my: -0.05, c: 0.42, sd: 0, gd: -0.04, si: 20, gi: 0.14, abre: 0, ancho: 0.75, sonr: -0.05 }),
    risa: E({ mx: 0.4, my: 0.3, c: 1, h: 1, sd: 18, gd: 0.12, si: 18, gi: 0.12, abre: 36, ancho: 1.15, sonr: 1, lengua: 0.3 }),
    ve_flor: E({ mx: 0.9, my: -0.55, c: 0.15, sd: 18, gd: 0.1, si: 18, gi: 0.1, abre: 4, ancho: 0.8, sonr: 0.6 }),
    coqueta: E({ mx: 0.6, my: -0.1, c: 0.55, h: 0.5, sd: 12, gd: 0.08, si: 12, gi: 0.08, abre: 0, ancho: 0.85, sonr: 0.75 }),
    guino: E({ mx: -0.85, my: -0.05, c: 0.25, wi: 0.75, sd: 12, gd: 0.08, si: -4, gi: -0.05, abre: 6, ancho: 1.0, sonr: 0.9 }),
    huele: E({ mx: 0.35, my: 0.85, c: 0.4, h: 0.5, sd: 14, gd: 0.08, si: 14, gi: 0.08, abre: 0, ancho: 0.8, sonr: 0.75 }),
    risita: E({ mx: 0.85, my: 0.1, c: 0.85, h: 1, sd: 16, gd: 0.1, si: 16, gi: 0.1, abre: 8, ancho: 0.9, sonr: 0.9 })
  };
  const GUION_CARA_C = [
    [T.cReloj0 + 0.1, T.cReloj1, "reloj"], [T.cReloj2 - 0.1, T.cReloj2 + 0.1, "suspiro"], [T.cVe, T.cVe + 0.25, "ve"],
    [T.pica + 0.1, T.pica + 0.35, "curiosa"], [T.alivio + 0.1, T.alivio + 0.3, "ve"], [T.cAww, T.cAww + 0.25, "aww"],
    [T.ah3 + 0.05, T.ah3 + 0.3, "tensa"], [T.achis - 0.01, T.achis + 0.03, "sopla"], [T.cAbre, T.cAbre + 0.25, "pasmada"],
    [T.mira, T.mira + 0.2, "mira"], [T.poker, T.poker + 0.18, "poker"], [T.rie0 - 0.02, T.rie0 + 0.12, "risa"],
    [T.rie1, T.rie1 + 0.15, "ve_flor"], [T.coger1 + 0.04, T.coger1 + 0.25, "huele"], [T.pasa + 0.1, T.oreja1, "coqueta"],
    [T.guinoC - 0.05, T.guinoC + 0.12, "guino"], [T.guinoC + 0.45, T.guinoC + 0.6, "coqueta"], [T.risita - 0.05, T.risita + 0.15, "risita"]
  ];
  const CUERPOS_C = {
    espera: { pel: 0, torso: -0.04, cab: -0.04, cad: -14 },
    reloj: { pel: 2, torso: 0.02, cab: 0.16, cad: -16 },
    ve: { pel: 0, torso: -0.03, cab: -0.02, cad: -10 },
    aww: { pel: 6, torso: 0.04, cab: 0.12, cad: -8 },
    tensa: { pel: 2, torso: -0.08, cab: -0.1, cad: -6 },
    sopla: { pel: 4, torso: -0.14, cab: -0.24, cad: 4 },
    mira: { pel: 4, torso: 0.0, cab: 0.04, cad: -10 },
    poker: { pel: 4, torso: -0.02, cab: -0.06, cad: -16 },
    risa: { pel: 12, torso: -0.08, cab: -0.16, cad: -8 },
    coge: { pel: 6, torso: 0.12, cab: 0.06, cad: -4 },
    tira: { pel: 2, torso: -0.1, cab: -0.08, cad: -12 },
    alcanza: { pel: 0, torso: 0.06, cab: -0.12, cad: -6 },
    huele: { pel: 4, torso: 0.02, cab: 0.1, cad: -12 },
    coqueta: { pel: 4, torso: -0.02, cab: -0.12, cad: -16 },
    final: { pel: 6, torso: 0.02, cab: 0.04, cad: -12 }
  };
  const GUION_CUERPO_C = [
    [T.cReloj0, T.cReloj1, "reloj"], [T.cReloj2 + 0.05, T.cReloj3, "espera"], [T.cVe, T.cVe + 0.3, "ve"],
    [T.cAww, T.cAww + 0.3, "aww"], [T.ah3, T.ah3 + 0.3, "tensa"], [T.achis, T.achis + 0.08, "sopla", salida],
    [T.cAbre, T.cAbre + 0.3, "mira"], [T.coge0 - 0.1, T.coge0 + 0.15, "coge"], [T.coge1 + 0.02, T.mira + 0.1, "mira"],
    [T.poker, T.poker + 0.2, "poker"], [T.rie0, T.rie0 + 0.15, "risa"], [T.tira0 - 0.05, T.tira1, "tira"],
    [T.coger0 - 0.05, T.coger0 + 0.25, "alcanza"], [T.coger1 + 0.04, T.mano1, "huele"], [T.pasa, T.oreja1, "coqueta"],
    [T.risita - 0.1, T.risita + 0.2, "final"]
  ];
  const BOLS_C_C = CA.BOLSILLO_C, BOLS_C_L = CA.BOLSILLO_L;
  const OREJA_C = { x: 650, y: 468 };                          // detrás de la oreja visible (retrato de Carla)

  function poseC(t, pG) {
    const b = guion(GUION_CUERPO_C, CUERPOS_C, "espera", t);
    const fc = pie(PASOS_C.cerca, t, 16), fl = pie(PASOS_C.lejos, t, 16);
    const X = (fc.x - OFF_C.cerca + fl.x - OFF_C.lejos) / 2;
    const respira = Math.sin(t * 2.1 + 1);
    const rie = dentro(t, T.rie0, T.rie0 + 0.1, T.rie1 - 0.1, T.rie1 + 0.05) + 0.6 * dentro(t, T.risita, T.risita + 0.2, DUR, DUR + 1);
    const sopla = t >= T.achis ? (1 - Math.exp(-(t - T.achis) * 40)) * Math.exp(-(t - T.achis) * 3.2) : 0;
    const p = {
      x: X, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, ikContinuo: true,
      pelvis: { x: CA.PELVIS.x + b.cad, y: CA.PELVIS.y + b.pel + respira * 1.2 + 5 * Math.abs(Math.sin(t * 15)) * rie },
      torso: b.torso + 0.025 * Math.sin(t * 15) * rie - 0.06 * sopla, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.03 * Math.sin(t * 15 + 1) * rie - 0.08 * sopla, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    for (const [ld, f] of [["cerca", fc], ["lejos", fl]]) {
      const hx = CA.aHoja(p, { x: f.x, y: 0 }).x;
      p.piernas[ld] = { tob: { x: hx, y: TOB_C - (ld === "lejos" ? 6 : 0) - f.alza / KC }, ang: f.ang };
    }
    // la melena: el soplido se la echa hacia atrás de golpe; se mece al reír y al ladear la cabeza
    p.pelo = { viento: -1.6 * sopla + 0.05 * Math.sin(t * 1.3), inercia: -0.1 * Math.sin(t * 15) * rie + 0.04 * Math.sin(t * 1.7) };
    const ex = guion(GUION_CARA_C, CARAS_C, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [1.3, 3.05, 4.8, 6.0, 9.2, 9.45, 11.5, 13.0, 14.0]));
    p.cara.rubor = 0.6 * dentro(t, T.cAww, T.cAww + 0.3, T.ah3, T.ah3 + 0.3) + 0.45 * dentro(t, T.coger1, T.coger1 + 0.3, DUR, DUR + 1);
    manosC(p, t, pG);
    return p;
  }
  function manosC(p, t, pG) {
    const Tr = CA.tronco(p);
    const bc = Tr(BOLS_C_C), bl = Tr(BOLS_C_L);
    let c = { x: bc.x, y: bc.y }, l = { x: bl.x, y: bl.y };
    let cmu = -1.75, lmu = -1.75, cd = RELAJADA, ld = RELAJADA, cpu = 0, lpu = 0;
    const pone = (w, cc, ll) => {
      if (w <= 0) return;
      if (cc) { c = mezcla(c, cc.q, w); cmu = lerp(cmu, cc.mu, w); cd = mezclaD(cd, cc.d, w); cpu = lerp(cpu, 1, w); }
      if (ll) { l = mezcla(l, ll.q, w); lmu = lerp(lmu, ll.mu, w); ld = mezclaD(ld, ll.d, w); lpu = lerp(lpu, 1, w); }
    };
    const bocaC = CA.boca(p), TAPA = D(0.25, 1, 1, 0.95, 0.9);
    // mira el reloj (en la muñeca de la mano lejana, delante del pecho)
    pone(dentro(t, T.cReloj0, T.cReloj1, T.cReloj2, T.cReloj3), null, { q: Tr({ x: 452, y: 420 + 4 * Math.sin(t * 3) }), mu: Math.PI + 0.15, d: D(0.4, 0.45, 0.4, 0.35, 0.3) });
    // «¡ay, qué bonito!»: se lleva la mano cercana a la boca
    pone(dentro(t, T.cAww - 0.05, T.cAww + 0.2, T.achis - 0.15, T.achis + 0.03), { q: { x: bocaC.x - 8, y: bocaC.y + 22 }, mu: 1.15, d: TAPA }, null);
    // la mano lejana: coge el ramo por el cucurucho, lo mira, lo deja colgar riéndose, lo tira por encima del
    // hombro, va a por la florecilla del pelo de Guillermo, se la trae delante, se la pasa a la otra mano y a la cadera
    if (t >= T.coge0) {
      let q, mu = MU_AGARRE_C, d = AGARRA, w = tramo(t, T.coge0, T.coge1);
      if (t < T.coge1) q = CA.aHoja(p, puntoRamo(ramoEnG(t, pG), AGARRE_C));
      else if (t < T.tira1) { q = manoRamoC(t, p, Tr); mu = MU_AGARRE_C - (angRamoC(t) - angRamoC(T.coge1)); }
      else {
        const qFlor = CA.aHoja(p, florPelo(t, pG)), MU_F = 2.6;
        const k1 = suave(fase(t, T.tira1, T.coger1)), k2 = suave(fase(t, T.coger1 + 0.04, T.mano1)), k3 = suave(fase(t, T.pasa + 0.04, T.pasa + 0.4));
        q = mezcla(manoRamoC(T.tira1, p, Tr), { x: qFlor.x + Math.cos(MU_F) * DEDO_C, y: qFlor.y + Math.sin(MU_F) * DEDO_C }, k1);
        mu = lerp(MU_AGARRE_C - (angRamoC(T.tira1) - angRamoC(T.coge1)), MU_F, k1);
        d = mezclaD(mezclaD(AGARRA, ABIERTA, campana(t, T.tira1, T.tira1 + 0.3)), PINZA, k1);
        q = mezcla(q, Tr(FRENTE_C), k2); mu = lerp(mu, 1.9, k2);
        q = mezcla(q, Tr({ x: 368, y: 590 }), k3); mu = lerp(mu, -2.6, k3); d = mezclaD(d, D(0.45, 0.7, 0.7, 0.65, 0.6), k3);
      }
      pone(w, null, { q, mu, d });
    }
    // la mano cercana: en la tripa al reírse; recoge la flor delante del pecho, la pone detrás de la oreja y,
    // con la risita final, se tapa la boca
    pone(dentro(t, T.rie0, T.rie0 + 0.15, T.rie1, T.rie1 + 0.3), { q: Tr({ x: 238, y: 560 }), mu: -0.3, d: D(0.6, 0.8, 0.8, 0.75, 0.7) }, null);
    const flor = dentro(t, T.pasa - 0.2, T.pasa - 0.02, T.risita - 0.15, T.risita + 0.08);
    if (flor > 0) {
      const ka = suave(fase(t, T.pasa + 0.02, T.oreja1 - 0.05));
      // la punta de los dedos de la cercana va a la punta de los de la lejana (donde está la flor) y luego a la oreja
      const pf = Tr(FRENTE_C), tipL = { x: pf.x - Math.cos(1.9) * DEDO_C, y: pf.y - Math.sin(1.9) * DEDO_C };
      const enFrente = { x: tipL.x + Math.cos(2.5) * DEDO_C, y: tipL.y + Math.sin(2.5) * DEDO_C };
      const oreja = CA.cabeza(p).a(OREJA_C);
      const qOreja = { x: oreja.x + Math.cos(1.7) * DEDO_C, y: oreja.y + Math.sin(1.7) * DEDO_C + 4 * Math.sin(t * 5) * tramo(t, T.oreja1, T.oreja1 + 0.2) };
      pone(flor, { q: mezcla(enFrente, qOreja, ka), mu: lerp(2.5, 1.7, ka), d: mezclaD(PINZA, D(0.3, 0.2, 0.15, 0.2, 0.3), tramo(t, T.oreja1 - 0.05, T.oreja1 + 0.15)) }, null);
    }
    pone(tramo(t, T.risita - 0.15, T.risita + 0.1), { q: { x: bocaC.x - 8, y: bocaC.y + 22 }, mu: 1.15, d: TAPA }, null);
    p.manoCerca = { x: c.x, y: c.y, ang: 0, mu: cmu, dobla: -1, puno: cpu, dedos: cd };
    p.manoLejos = { x: l.x, y: l.y, ang: 0, mu: lmu, dobla: 1, puno: lpu, dedos: ld };
    const conRamo = t >= T.suelta && t < T.vuela;
    p.manoLejos.objeto = conRamo ? (g, tt) => { reloj(g, p.manoLejos); objetoRamo(p, p.manoLejos, CA.K)(g, tt); } : (g) => reloj(g, p.manoLejos);
  }
  const DEDO_C = 44;                                           // de la palma a la punta de los dedos (hoja de Carla)
  const FRENTE_C = { x: 396, y: 318 };
  const SUELTA_C = { x: 530, y: 210 };                         // donde lo suelta: por delante de la cara, a la altura de la barbilla                         // la flor delante de la barbilla, para mirarla
  const puntaDedos = (pC, m) => CA.aPantalla(pC, { x: m.x - Math.cos(m.mu) * DEDO_C, y: m.y - Math.sin(m.mu) * DEDO_C });
  // el reloj de Carla, en la muñeca de la mano lejana (marco de la mano: unidades de JK)
  function reloj(g, m) {
    const a = m.mu, d = CA.MUNECA_R * 1.55, x = Math.cos(a) * d, y = Math.sin(a) * d;
    g.save(); g.translate(x, y); g.rotate(a);
    g.fillStyle = "#3b2416"; g.strokeStyle = "#140a06"; g.lineWidth = 1;
    g.fillRect(-2.6, -7.5, 5.2, 15); g.strokeRect(-2.6, -7.5, 5.2, 15);
    g.beginPath(); g.arc(0, 0, 4.3, 0, Math.PI * 2); g.fillStyle = "#e8c66a"; g.fill(); g.stroke();
    g.beginPath(); g.arc(0, 0, 3.1, 0, Math.PI * 2); g.fillStyle = "#fffdf5"; g.fill();
    g.strokeStyle = "#140a06"; g.lineWidth = 0.7; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -2.4); g.moveTo(0, 0); g.lineTo(1.8, 0.6); g.stroke();
    g.restore();
  }
  // mano lejana de Carla mientras sostiene el ramo (hoja de Carla)
  function manoRamoC(t, p, Tr) {
    const enGuill = CA.aHoja(p, puntoRamo(ramoEnG(T.coge1, POSE_G_COGE), AGARRE_C));
    const alto = Tr({ x: 452, y: 420 }), cae = Tr({ x: 380, y: 590 });
    let q = mezcla(enGuill, alto, suave(fase(t, T.coge1 + 0.02, T.mira + 0.1)));
    q = mezcla(q, cae, suave(fase(t, T.rie0 - 0.05, T.rie0 + 0.2)));
    const k = suave(fase(t, T.tira0, T.tira1));
    if (k > 0) {      // un golpe de muñeca hacia arriba, por delante del pecho (sin taparse la cara)
      const c1 = Tr({ x: 540, y: 430 }), fin = Tr(SUELTA_C), a = (1 - k) * (1 - k), b = 2 * k * (1 - k), c = k * k;
      q = { x: a * q.x + b * c1.x + c * fin.x, y: a * q.y + b * c1.y + c * fin.y };
    }
    return q;
  }

  /* =====================================================================================
   * EL RAMO (un único objeto: detrás de la espalda → mano de Guillermo → mano de Carla → maceta)
   * Coordenadas locales en px de pantalla: agarre en (0,0); el eje −y va de los tallos a las flores.
   * ===================================================================================== */
  const AGARRE_C = { x: 0, y: -30 };                         // Carla lo coge por el cucurucho
  const MU_AGARRE_C = 3.0;                          // Carla lo coge por los tallos de abajo
  const FLORES = [  // x, y, radio, tipo, color, color oscuro
    [-9, -94, 11, "tulipan", "#a35bd1", "#6b2f96"], [14, -92, 12, "margarita", "#fffdf6", "#d9d2c2"],
    [-27, -82, 10, "rosa", "#ff8a3d", "#c85a1a"], [0, -78, 15, "rosa", "#e8283c", "#9c1426"],
    [-21, -64, 13, "rosa", "#ff8fb8", "#d0507e"], [22, -68, 13, "margarita", "#ffd23f", "#d9a316"],
    [27, -86, 10, "flor5", "#ff6fae", "#c93f7d"]                // la florecilla que acabará en el pelo
  ];
  const IDX_PELO = 6;
  const HOJAS = [[-30, -56, 13, 6, -0.9], [31, -54, 13, 6, 0.9], [-12, -104, 10, 5, -0.4], [36, -78, 10, 5, 1.2], [-38, -72, 10, 5, -1.3]];
  const PETALOS = [];                                            // todos los pétalos y botones en coordenadas del ramo
  FLORES.forEach(([fx, fy, r, tipo, col, osc], fi) => {
    if (fi === IDX_PELO) return;
    const n = tipo === "margarita" ? 9 : tipo === "rosa" ? 6 : tipo === "tulipan" ? 4 : 5;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + fi * 0.7;
      if (tipo === "margarita") PETALOS.push({ x: fx + Math.cos(a) * r * 0.62, y: fy + Math.sin(a) * r * 0.62, ang: a, rx: r * 0.55, ry: r * 0.2, col, osc, fi });
      else if (tipo === "rosa") PETALOS.push({ x: fx + Math.cos(a) * r * 0.42, y: fy + Math.sin(a) * r * 0.42, ang: a, rx: r * 0.55, ry: r * 0.42, col, osc, fi });
      else PETALOS.push({ x: fx + Math.cos(a) * r * 0.3, y: fy - r * 0.15 + Math.sin(a) * r * 0.25, ang: a + Math.PI / 2, rx: r * 0.42, ry: r * 0.62, col, osc, fi });
    }
    // centro (botón de la margarita / corazón de la rosa)
    if (tipo === "margarita") PETALOS.push({ x: fx, y: fy, ang: 0, rx: r * 0.32, ry: r * 0.32, col: "#f2a516", osc: "#b86f08", fi, centro: 1 });
    else if (tipo === "rosa") PETALOS.push({ x: fx, y: fy, ang: fi, rx: r * 0.36, ry: r * 0.3, col, osc, fi, centro: 2 });
  });
  // gipsófila: puntitos blancos
  for (let i = 0; i < 9; i++) PETALOS.push({ x: -34 + hash(i + 70) * 68, y: -104 + hash(i + 80) * 40, ang: 0, rx: 3, ry: 3, col: "#ffffff", osc: "#cfcfd8", fi: -1, gip: 1 });
  const IDX_ULTIMO = PETALOS.findIndex(q => q.fi === 3 && !q.centro);   // un pétalo de la rosa roja aguanta hasta el final

  function dibPetalo(g, q) {
    g.save(); g.translate(q.x, q.y); g.rotate(q.ang);
    g.beginPath(); g.ellipse(0, 0, q.rx, q.ry, 0, 0, Math.PI * 2); g.fillStyle = q.col; g.fill();
    if (q.centro === 2) { g.strokeStyle = q.osc; g.lineWidth = 1.4; g.beginPath(); g.arc(0, 0, q.rx * 0.55, 0.3, 4.6); g.stroke(); }
    g.lineWidth = 1.3; g.strokeStyle = "#2a1410"; g.beginPath(); g.ellipse(0, 0, q.rx, q.ry, 0, 0, Math.PI * 2); g.stroke();
    if (!q.gip && !q.centro) { g.fillStyle = "rgba(255,255,255,0.45)"; g.beginPath(); g.ellipse(-q.rx * 0.2, -q.ry * 0.3, q.rx * 0.35, q.ry * 0.25, 0, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  function dibFlor5(g, x, y, r, a) {                           // florecilla de cinco pétalos (la del pelo)
    g.save(); g.translate(x, y); g.rotate(a);
    for (let i = 0; i < 5; i++) { const b = i / 5 * Math.PI * 2;
      g.beginPath(); g.ellipse(Math.cos(b) * r * 0.55, Math.sin(b) * r * 0.55, r * 0.5, r * 0.36, b, 0, Math.PI * 2);
      g.fillStyle = "#ff6fae"; g.fill(); g.lineWidth = 1.3; g.strokeStyle = "#3a0f22"; g.stroke(); }
    g.beginPath(); g.arc(0, 0, r * 0.3, 0, Math.PI * 2); g.fillStyle = "#ffd23f"; g.fill(); g.lineWidth = 1.2; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.ellipse(-r * 0.55, -r * 0.35, r * 0.18, r * 0.1, -0.5, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // ramo: pelado = 0 entero, 1 sin pétalos. ultimo: el último pétalo sigue (1) o ya no (0). flor5: la florecilla sigue en el ramo
  function dibRamo(g, B, pelado, ultimo, flor5) {
    g.save(); g.translate(B.x, B.y); g.rotate(B.ang); g.lineCap = "round"; g.lineJoin = "round";
    // tallos
    const tallo = (x0, x1, y1) => { g.beginPath(); g.moveTo(x0 * 0.3, 32); g.quadraticCurveTo(x0 * 0.2, 0, x1, y1); };
    for (const [fx, fy] of FLORES) { tallo(fx, fx, fy + 6); g.strokeStyle = "#1d3a14"; g.lineWidth = 4.4; g.stroke(); tallo(fx, fx, fy + 6); g.strokeStyle = "#4f9a2c"; g.lineWidth = 2.4; g.stroke(); }
    // hojas
    for (const [x, y, rx, ry, a] of HOJAS) {
      g.save(); g.translate(x, y); g.rotate(a);
      g.beginPath(); g.moveTo(-rx, 0); g.quadraticCurveTo(0, -ry * 2, rx, 0); g.quadraticCurveTo(0, ry * 2, -rx, 0); g.closePath();
      g.fillStyle = "#5fae36"; g.fill(); g.lineWidth = 1.4; g.strokeStyle = "#1d3a14"; g.stroke();
      g.beginPath(); g.moveTo(-rx * 0.8, 0); g.lineTo(rx * 0.8, 0); g.strokeStyle = "#2f6a1c"; g.lineWidth = 1; g.stroke();
      g.restore();
    }
    // flores (antes del estornudo) o cálices pelados (después)
    if (pelado < 1) {
      PETALOS.forEach((q, i) => { if (!q.centro) dibPetalo(g, q); });
      PETALOS.forEach(q => { if (q.centro) dibPetalo(g, q); });
    } else {
      for (const [fx, fy, r, tipo] of FLORES) {
        g.beginPath(); g.ellipse(fx, fy + 4, 4, 3, 0, 0, Math.PI * 2); g.fillStyle = "#4f9a2c"; g.fill(); g.lineWidth = 1.2; g.strokeStyle = "#1d3a14"; g.stroke();
      }
      if (ultimo > 0) { const q = PETALOS[IDX_ULTIMO], f = FLORES[3];
        g.save(); g.translate(f[0], f[1] + 4); g.rotate(0.9 * (1 - ultimo)); dibPetalo(g, { ...q, x: 3, y: -3 }); g.restore(); }
    }
    if (flor5) { const f = FLORES[IDX_PELO]; dibFlor5(g, f[0], f[1], f[2], 0.3); }
    // papel de estraza en cono, con lazo
    const cono = () => { g.beginPath(); g.moveTo(-9, 10); g.lineTo(-34, -56); g.quadraticCurveTo(0, -46, 34, -56); g.lineTo(9, 10); g.quadraticCurveTo(0, 14, -9, 10); g.closePath(); };
    cono(); g.fillStyle = "#d9a86a"; g.fill();
    g.save(); cono(); g.clip(); g.fillStyle = "#b9824a"; g.beginPath(); g.moveTo(4, 12); g.lineTo(34, -56); g.lineTo(40, -56); g.lineTo(12, 14); g.closePath(); g.fill();
    g.strokeStyle = "rgba(120,80,40,0.5)"; g.lineWidth = 1; g.beginPath(); g.moveTo(-14, -6); g.lineTo(-22, -40); g.moveTo(14, -20); g.lineTo(20, -44); g.stroke(); g.restore();
    cono(); g.lineWidth = 2; g.strokeStyle = "#2a1a0c"; g.stroke();
    // lazo rojo
    g.fillStyle = "#e0303d"; g.strokeStyle = "#3a0a10"; g.lineWidth = 1.4;
    g.beginPath(); g.ellipse(-8, -4, 8, 5, 0.4, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(8, -4, 8, 5, -0.4, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-2, -2); g.lineTo(-8, 14); g.lineTo(-3, 12); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(2, -2); g.lineTo(7, 15); g.lineTo(3, 12); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.arc(0, -3, 3.5, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
  }
  // ramo en la mano de Guillermo
  let POSE_G_COGE = null;
  function ramoEnG(t, pG) {
    const m = G.aPantalla(pG, pG.manoCerca);
    return { x: m.x, y: m.y, ang: phiRamoG(t) + Math.PI / 2 };
  }
  const puntoRamo = (B, q) => { const r = rot(q, B.ang); return { x: B.x + r.x, y: B.y + r.y }; };
  // ángulo del ramo en la mano de Carla: lo endereza para mirarlo, cuelga al reír, gira al tirarlo
  function angRamoC(t) {
    let a = phiRamoG(T.coge1) + Math.PI / 2;
    a = lerp(a, -0.5, suave(fase(t, T.coge1 + 0.05, T.mira + 0.15)));
    a = lerp(a, -2.45, suave(fase(t, T.rie0 - 0.05, T.rie0 + 0.3)));    // cuelga mientras se ríe
    a = lerp(a, -0.1, suave(fase(t, T.tira0, T.tira1)));                // golpe de muñeca al lanzarlo
    return a;
  }
  // vuelo de los tallos por encima del hombro de Carla hasta la maceta
  const MACETA = { x: 884, y: SUELO - 44, r: 58 };
  let SUELTA = null;
  function ramoEstado(t, pG, pC) {
    if (t < T.coge1 || !pC) { const B = ramoEnG(Math.min(t, T.coge1), t < T.coge1 ? pG : POSE_G_COGE || pG); B.capa = t < T.saca1 ? "detras" : "G"; B.muC = 0.4; return B; }
    if (t < T.tira1) {
      const a = angRamoC(t), m = CA.aPantalla(pC, pC.manoLejos), off = rot(AGARRE_C, a);
      return { x: m.x - off.x, y: m.y - off.y, ang: a, capa: "C", muC: 0.4 };
    }
    const S0 = SUELTA, k = fase(t, T.tira1, T.maceta);
    if (k < 1) {
      const fin = { x: MACETA.x + 2, y: MACETA.y - 40 };   // (el ramo cae de pie: el agarre queda en la tierra)
      // sube primero y luego cae hacia atrás, por encima de la cabeza de Carla
      const x = lerp(S0.x, fin.x, Math.pow(k, 1.8)), y = lerp(S0.y, fin.y, k) - 300 * Math.sin(Math.PI * Math.pow(k, 0.8)) * (1 - 0.3 * k);
      const vuelta = 0.12 + 2 * Math.PI * Math.round((S0.ang - 0.12) / (2 * Math.PI)) + 2 * Math.PI;
      return { x, y, ang: lerp(S0.ang, vuelta, k), capa: "vuela" };
    }
    // clavado en la tierra de la maceta: se cimbrea
    const v = t - T.maceta;
    return { x: MACETA.x + 2, y: MACETA.y - 40 + 4 * Math.exp(-v * 9) * Math.sin(v * 30), ang: 0.12 + 0.2 * Math.exp(-v * 3.5) * Math.sin(v * 13), capa: "maceta" };
  }
  // objeto en la mano: dibuja el ramo con coordenadas absolutas de la escena (bajo los dedos)
  function objetoRamo(p, m, K) {
    return (g, t) => {
      const B = RAMO_ACTUAL; if (!B) return;
      const k = p.s * K, sp = p.espejo ? -1 : 1, sx = m.espejo ? -1 : 1;
      g.save(); g.scale(sx / G.JK, 1 / G.JK); g.rotate(-(m.ang || 0)); g.scale(sp / k, 1 / k);
      const h = (p.espejo ? CA : G).aPantalla(p, m);
      g.translate(-h.x, -h.y);
      dibRamo(g, B, t >= T.achis ? 1 : 0, t < T.ultimo ? 1 - 0.999 * suave(fase(t, T.ultimo - 0.4, T.ultimo)) : 0, t < T.achis);
      g.restore();
    };
  }
  let RAMO_ACTUAL = null;

  /* =====================================================================================
   * LA TORMENTA DE PÉTALOS (parten de donde estaban en el ramo; caen al suelo y se quedan)
   * ===================================================================================== */
  let TORMENTA = null, VUELO_FLOR = null;
  function preparaTormenta() {
    const pG = poseG(T.achis), B = ramoEnG(T.achis, pG);
    const boca = G.aPantalla(pG, G.boca(pG));
    TORMENTA = PETALOS.map((q, i) => {
      if (i === IDX_ULTIMO) return null;
      const P0 = puntoRamo(B, q);
      let dx = P0.x - boca.x, dy = P0.y - boca.y; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const ab = (hash(i + 3) - 0.5) * 1.1, c = Math.cos(ab), s = Math.sin(ab);
      const v = 420 + 520 * hash(i + 7);
      const vx = (dx * c - dy * s) * v, vy = (dx * s + dy * c) * v - 140 * hash(i + 11);
      const kk = 2.0 + 1.4 * hash(i + 13), vt = 40 + 40 * hash(i + 17);
      const o = { P0, a0: B.ang + q.ang, vx, vy, k: kk, vt, A: 8 + 16 * hash(i + 19), w: 3.5 + 3.5 * hash(i + 23), ph: hash(i + 29) * 6.28,
        giro: (hash(i + 31) - 0.5) * 14, suelo: SUELO + 6 + 40 * hash(i + 37), q };
      // momento en que toca el suelo
      o.tl = 99;
      for (let u = 0; u < 7; u += 1 / 240) { if (posPetalo(o, u).y >= o.suelo) { o.tl = u; break; } }
      return o;
    });
    // la florecilla: sube en arco y cae en el pelo de Guillermo
    const f = FLORES[IDX_PELO];
    VUELO_FLOR = { P0: puntoRamo(B, { x: f[0], y: f[1] }), a0: B.ang };
    // dónde suelta Carla los tallos
    const pGc = poseG(T.tira1), pCc = poseC(T.tira1 - 1e-4, pGc), Bc = ramoEstado(T.tira1 - 1e-4, pGc, pCc);
    SUELTA = { x: Bc.x, y: Bc.y, ang: Bc.ang };
  }
  function posPetalo(o, u) {
    const e = Math.exp(-o.k * u);
    const x = o.P0.x + o.vx / o.k * (1 - e) + 22 * u + o.A * Math.sin(o.w * u + o.ph) * (1 - e * 0.9);
    const y = o.P0.y + o.vt * u + (o.vy - o.vt) / o.k * (1 - e);
    return { x, y };
  }
  function dibTormenta(g, t) {
    if (!TORMENTA || t < T.achis) return;
    const u = t - T.achis;
    for (const o of TORMENTA) {
      if (!o) continue;
      const uu = Math.min(u, o.tl), q = posPetalo(o, uu);
      if (q.x < -60 || q.x > W + 80) continue;
      const a = o.a0 + o.giro / o.k * (1 - Math.exp(-o.k * uu)) + 0.7 * Math.sin(o.w * uu + o.ph);
      const plano = suave(fase(u, o.tl - 0.12, o.tl));       // al posarse se aplasta contra el suelo
      g.save(); g.translate(q.x, q.y); g.scale(1, 1 - 0.55 * plano); dibPetalo(g, { ...o.q, x: 0, y: 0, ang: a }); g.restore();
    }
  }
  // el último pétalo: se descuelga y cae revoloteando
  function dibUltimo(g, t, B) {
    if (t < T.ultimo || t > T.ultimo + 3) return;
    const q = PETALOS[IDX_ULTIMO], f = FLORES[3];
    // parte justo de donde estaba colgando en el ramo (mismo punto y mismo giro)
    const r0 = rot({ x: 3, y: -3 }, 0.9), P0 = puntoRamo(B0_ULTIMO, { x: f[0] + r0.x, y: f[1] + 4 + r0.y });
    const u = t - T.ultimo, caida = Math.min(u, 1.55);
    const x = P0.x + 18 * Math.sin(caida * 5) + 10 * caida, y = Math.min(SUELO + 20, P0.y + 95 * caida + 20 * caida * caida);
    g.save(); g.translate(x, y); g.scale(1, 1 - 0.55 * clamp((y - SUELO - 5) / 15));
    dibPetalo(g, { ...q, x: 0, y: 0, ang: B0_ULTIMO.ang + 0.9 + q.ang + 1.2 * Math.sin(caida * 5) }); g.restore();
  }
  let B0_ULTIMO = null;
  // la florecilla del pelo: vuela, se queda en el pelo, Carla la coge y se la pone detrás de la oreja
  function florPelo(t, pG) {
    const enPelo = G.aPantalla(pG, G.cabeza(pG).a(FLOR_PELO));
    if (t < T.achis + 0.85) {
      const k = fase(t, T.achis, T.achis + 0.85), P0 = VUELO_FLOR.P0;
      const ctrl = { x: lerp(P0.x, enPelo.x, 0.5) + 30, y: Math.min(P0.y, enPelo.y) - 170 };
      const a = (1 - k) * (1 - k), b = 2 * k * (1 - k), c = k * k;
      return { x: a * P0.x + b * ctrl.x + c * enPelo.x, y: a * P0.y + b * ctrl.y + c * enPelo.y, ang: VUELO_FLOR.a0 + 9 * salida(k) - 9, esc: 1 };
    }
    return { x: enPelo.x, y: enPelo.y, ang: pG.cabeza.ang + 0.3, esc: 1 };
  }
  function dibFlorPelo(g, t, pG, pC) {
    if (t < T.achis) return;
    let F = florPelo(t, pG);
    if (t >= T.coger1) {                                      // en la punta de los dedos de la mano lejana…
      const a = F.ang, L = puntaDedos(pC, pC.manoLejos);
      F = { x: L.x, y: L.y, ang: a + 0.8 * suave(fase(t, T.coger1, T.mano1)) };
      if (t >= T.pasa - 0.04) {                               // …pasa a la cercana…
        const C = puntaDedos(pC, pC.manoCerca), k = suave(fase(t, T.pasa - 0.04, T.pasa + 0.04));
        F = { x: lerp(F.x, C.x, k), y: lerp(F.y, C.y, k), ang: F.ang };
      }
      if (t >= T.oreja1 - 0.05) {                             // …y se queda detrás de la oreja
        const q = CA.aPantalla(pC, CA.cabeza(pC).a(OREJA_C)), k = suave(fase(t, T.oreja1 - 0.05, T.oreja1 + 0.05));
        F = { x: lerp(F.x, q.x, k), y: lerp(F.y, q.y, k), ang: F.ang - 0.3 * k - pC.cabeza.ang };
      }
    }
    dibFlor5(g, F.x, F.y, FLORES[IDX_PELO][2], F.ang);
  }

  /* =====================================================================================
   * LA ABEJA
   * ===================================================================================== */
  function abeja(t, pG, pC) {
    // A: ronda las flores escondidas (desde que entra) · B: ronda la cabeza · C: se mete en el ramo
    // D: sale del ramo con el polen · E: el estornudo la manda lejos · F: vuelve mareada y se posa en la nariz
    const hc = pG ? G.aPantalla(pG, G.centroCabeza(pG)) : { x: 300, y: 200 };
    const flores = () => { const B = ramoEnG(t, pG); return puntoRamo(B, { x: 0, y: -84 }); };
    if (t < T.guinoG + 0.3) {
      const f = flores(), a = t * 7.5;
      return { x: f.x + 32 * Math.cos(a), y: f.y + 16 * Math.sin(a) - 6, z: Math.sin(a), dir: -Math.sin(a), vis: 1 };
    }
    if (t < T.pica) {
      const f = flores(), a0 = (T.guinoG + 0.3) * 7.5, ff = { x: f.x + 32 * Math.cos(a0), y: f.y + 16 * Math.sin(a0) - 6 };
      const a = (t - T.guinoG - 0.3) * 6.2 + 2.2;
      const ronda = { x: hc.x + 10 + 78 * Math.cos(a), y: hc.y - 10 + 40 * Math.sin(a) };
      const k = suave(fase(t, T.guinoG + 0.3, T.guinoG + 0.75));
      return { x: lerp(ff.x, ronda.x, k), y: lerp(ff.y, ronda.y, k), z: Math.sin(a), dir: -Math.sin(a), vis: 1 };
    }
    if (t < T.aguanta0 + 0.2) {
      const a = (T.pica - T.guinoG - 0.3) * 6.2 + 2.2, ronda = { x: hc.x + 10 + 78 * Math.cos(a), y: hc.y - 10 + 40 * Math.sin(a) };
      const f = flores(), k = suave(fase(t, T.pica, T.aguanta0 + 0.2));
      return { x: lerp(ronda.x, f.x, k) + 26 * Math.sin(k * 9) * (1 - k), y: lerp(ronda.y, f.y, k) - 40 * Math.sin(Math.PI * k), z: -1, dir: -1, vis: 1 - fase(t, T.aguanta0, T.aguanta0 + 0.2) };
    }
    if (t < T.polen) return { x: 0, y: 0, z: -1, dir: 1, vis: 0 };
    if (t < T.achis) {
      const f = flores(), nz = G.aPantalla(pG, G.cabeza(pG).a(NARIZ));
      const k = suave(fase(t, T.polen, T.polen + 0.4)), a = (t - T.polen) * 9;
      const sobre = { x: lerp(f.x, nz.x + 30, 0.6) + 22 * Math.cos(a), y: lerp(f.y, nz.y, 0.4) - 20 + 12 * Math.sin(a * 1.3) };
      return { x: lerp(f.x, sobre.x, k), y: lerp(f.y, sobre.y, k), z: 1, dir: Math.cos(a) > 0 ? 1 : -1, vis: fase(t, T.polen, T.polen + 0.08) };
    }
    if (t < T.abejaVuelve) {
      // sale despedida dando vueltas (sale de cuadro enseguida)
      const f0 = abeja(T.achis - 1e-4, pG, pC), u = t - T.achis;
      return { x: f0.x + 900 * (1 - Math.exp(-u * 2.2)), y: f0.y - 260 * (1 - Math.exp(-u * 2.6)) + 30 * Math.sin(u * 14) * Math.exp(-u * 2), z: 1, dir: 1, vis: 1, gira: u * 16 };
    }
    // vuelve mareada desde la derecha y se posa en la nariz
    const nz = G.aPantalla(pG, G.cabeza(pG).a(NARIZ));
    const u = fase(t, T.abejaVuelve, T.abejaPosa), us = suave(u);
    const x = lerp(W + 60, nz.x + 11, us) + 34 * Math.sin(u * 13) * (1 - u), y = lerp(110, nz.y + 1, us) + 26 * Math.sin(u * 9 + 1) * (1 - u);
    return { x, y, z: 1, dir: -1, vis: 1, posada: tramo(t, T.abejaPosa - 0.06, T.abejaPosa + 0.05), mareo: 1 - u };
  }
  function dibAbeja(g, t, A) {
    if (!A || A.vis <= 0.01) return;
    const posada = A.posada || 0;
    g.save(); g.translate(A.x, A.y); const ea = lerp(1.35, 1.1, posada); g.scale(ea * A.vis * (A.dir < 0 ? -1 : 1), ea * A.vis); if (A.gira) g.rotate(A.gira);
    // estela de zumbido
    if (posada < 0.5 && !A.gira) { g.strokeStyle = "rgba(30,20,10,0.35)"; g.lineWidth = 1; g.setLineDash([2, 3]);
      g.beginPath(); g.moveTo(-9, 1); g.quadraticCurveTo(-18, -6, -28, 2); g.stroke(); g.setLineDash([]); }
    // alas (se agitan; posada, despacio)
    const al = posada > 0.5 ? 0.6 + 0.4 * Math.sin(t * 6) : 0.5 + 0.5 * Math.sin(t * 95);
    g.fillStyle = "rgba(220,240,255,0.85)"; g.strokeStyle = "#1a1a24"; g.lineWidth = 1.1;
    // posada, pliega las alas hacia atrás para no tapar los ojos de Guillermo
    const pl = clamp(posada);
    g.beginPath(); g.ellipse(lerp(-2, -9, pl), lerp(-8 - 2 * al, -6, pl), 5, 8 * (0.6 + 0.4 * al), lerp(-0.4, -1.25, pl), 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(lerp(3, -6, pl), lerp(-7 - 2 * al, -4, pl), 4, 7 * (0.6 + 0.4 * al), lerp(0.3, -1.1, pl), 0, Math.PI * 2); g.fill(); g.stroke();
    // cuerpo a rayas
    g.save(); g.beginPath(); g.ellipse(0, 0, 9, 6.5, 0, 0, Math.PI * 2); g.clip();
    g.fillStyle = "#ffd21f"; g.fillRect(-10, -8, 20, 16); g.fillStyle = "#1a1418"; g.fillRect(-4, -8, 3, 16); g.fillRect(2, -8, 3, 16);
    g.restore();
    g.beginPath(); g.ellipse(0, 0, 9, 6.5, 0, 0, Math.PI * 2); g.lineWidth = 1.5; g.strokeStyle = "#1a1418"; g.stroke();
    g.beginPath(); g.moveTo(-9, 0); g.lineTo(-13, 1); g.stroke();
    // cabeza con ojitos
    g.beginPath(); g.arc(9, -1, 4.6, 0, Math.PI * 2); g.fillStyle = "#1a1418"; g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(10.5, -2.2, 1.6, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#1a1418"; g.lineWidth = 1; g.beginPath(); g.moveTo(10, -5); g.quadraticCurveTo(12, -10, 15, -10); g.moveTo(8, -5); g.quadraticCurveTo(8, -10, 11, -11.5); g.stroke();
    g.restore();
    // mareada: estrellitas girando
    if ((A.mareo || 0) > 0.05) {
      g.save(); g.globalAlpha = clamp(A.mareo * 1.5); g.fillStyle = "#ffe14d"; g.strokeStyle = "#1a1418"; g.lineWidth = 1;
      for (let i = 0; i < 3; i++) { const a = t * 6 + i * 2.1; estrella(g, A.x + 14 * Math.cos(a), A.y - 14 + 5 * Math.sin(a), 4, 5, a); g.fill(); g.stroke(); }
      g.restore();
    }
  }
  function estrella(g, x, y, r, n, a0, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = a0 + i * Math.PI / n, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }

  /* ---------- efectos ---------- */
  // nube de polen: sale de las flores y sube a la nariz
  function dibPolen(g, t, pG) {
    const k = fase(t, T.polen, T.polen + 1.0); if (k <= 0 || k >= 1) return;
    const B = ramoEnG(t, pG), nz = G.aPantalla(pG, G.cabeza(pG).a(NARIZ));
    g.save();
    for (let i = 0; i < 18; i++) {
      const f = FLORES[i % 6], P0 = puntoRamo(B, { x: f[0] + (hash(i) - 0.5) * 14, y: f[1] });
      const kk = clamp(k * (1.2 + hash(i + 5) * 0.5) - hash(i + 9) * 0.2);
      const x = lerp(P0.x, nz.x + (hash(i + 2) - 0.5) * 16, salida(kk)) + 10 * Math.sin(kk * 6 + i);
      const y = lerp(P0.y, nz.y + 6, salida(kk)) - 18 * Math.sin(Math.PI * kk);
      g.globalAlpha = Math.sin(Math.PI * clamp(kk * 1.05)) * 0.95;
      g.fillStyle = i % 3 ? "#ffd84a" : "#ffb81f"; g.beginPath(); g.arc(x, y, 2 + 2 * hash(i + 4), 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  // el soplido del estornudo: rayas de aire y gotitas
  function dibSoplido(g, t, pG) {
    const k = fase(t, T.achis, T.achis + 0.5); if (k <= 0 || k >= 1) return;
    const b = G.aPantalla(pG, G.boca(pG));
    g.save(); g.lineCap = "round";
    for (let i = 0; i < 7; i++) {
      const a = -0.5 + i * 0.16, r0 = 20 + 260 * salida(k) * (0.6 + 0.4 * hash(i + 40)), r1 = r0 + 40 + 30 * hash(i + 41);
      g.globalAlpha = (1 - k) * 0.9; g.strokeStyle = "#ffffff"; g.lineWidth = 3.5;
      g.beginPath(); g.moveTo(b.x + Math.cos(a) * r0, b.y + Math.sin(a) * r0); g.lineTo(b.x + Math.cos(a) * r1, b.y + Math.sin(a) * r1); g.stroke();
    }
    for (let i = 0; i < 10; i++) {
      const a = 0.0 + (hash(i + 60) - 0.5) * 0.9, r = 30 + 200 * salida(k) * (0.4 + 0.6 * hash(i + 61));
      g.globalAlpha = (1 - k) * 0.8; g.fillStyle = "#cfefff";
      g.beginPath(); g.arc(b.x + Math.cos(a) * r, b.y + Math.sin(a) * r + 30 * k * k, 2.2, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  // corazones (de Carla al ver el ramo y de Guillermo al derretirse)
  function corazon(g, x, y, r) {
    g.beginPath(); g.moveTo(x, y + r * 0.9); g.bezierCurveTo(x - r * 1.5, y - r * 0.2, x - r * 0.6, y - r * 1.3, x, y - r * 0.45);
    g.bezierCurveTo(x + r * 0.6, y - r * 1.3, x + r * 1.5, y - r * 0.2, x, y + r * 0.9); g.closePath();
  }
  function dibCorazones(g, t, c0, t0, t1, n, color) {
    const on = dentro(t, t0, t0 + 0.15, t1, t1 + 0.4); if (on <= 0.01) return;
    g.save();
    for (let i = 0; i < n; i++) {
      const ph = ((t - t0) * 0.6 + i / n) % 1;
      const x = c0.x + (hash(i + 90) - 0.5) * 70 + 10 * Math.sin(t * 3 + i), y = c0.y - 20 - ph * 90;
      g.globalAlpha = on * Math.sin(Math.PI * ph); g.fillStyle = color; g.strokeStyle = "#5a0f22"; g.lineWidth = 1.4;
      corazon(g, x, y, 7 + 3 * hash(i + 91)); g.fill(); g.stroke();
    }
    g.restore();
  }
  // destello (el ramo al aparecer, el guiño)
  function destello(g, t, t0, x, y, r) {
    const k = fase(t, t0, t0 + 0.45); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = Math.sin(Math.PI * k); g.fillStyle = "#ffffff"; estrella(g, x, y, r * (0.6 + 0.6 * k), 4, 0.6 * k, 0.25); g.fill(); g.restore();
  }

  /* ---------- capa de la cara de Guillermo: arruga de la nariz y ojos bizcos ---------- */
  const PZG = G.A.datos.piezas;
  function remuestrea(pts, n) {
    const P = pts.map(q => ({ x: q[0], y: q[1] })), d = [0];
    for (let i = 1; i < P.length; i++) d.push(d[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
    const out = [], L = d[d.length - 1];
    for (let k = 0; k < n; k++) { const s = L * k / (n - 1); let i = 1; while (i < d.length - 1 && d[i] < s) i++;
      const f = (s - d[i - 1]) / Math.max(1e-6, d[i] - d[i - 1]); out.push({ x: lerp(P[i - 1].x, P[i].x, f), y: lerp(P[i - 1].y, P[i].y, f) }); }
    return out;
  }
  const OJOS_G = {
    d: { arriba: [[733, 551], [737, 541], [748, 541], [762, 545], [776, 550], [790, 556], [803, 561], [809, 566]],
         poli: PZG.cabeza.ojos.derecho, c: { x: 771, y: 563 }, r: 17.5, rx: 25, ry: 9 },
    i: { arriba: [[866, 603], [872, 597], [885, 598], [900, 602], [913, 606], [921, 611]],
         poli: PZG.cabeza.ojos.izquierdo, c: { x: 894, y: 617 }, r: 15, rx: 19, ry: 7 }
  };
  for (const o of Object.values(OJOS_G)) o.U = remuestrea(o.arriba, 14);
  const rutaPoli = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
  const IRIS_LUZ = (() => { const c = G.A.datos.paleta.iris; return `rgb(${c[0]},${c[1]},${c[2]})`; })();
  function ojoBizco(g, o, mx, my, ir, a) {
    g.save(); g.globalAlpha = a;
    g.beginPath(); rutaPoli(g, o.poli); g.fillStyle = "#fbf8f5"; g.fill(); g.clip();
    const ix = o.c.x + o.rx * mx, iy = o.c.y + o.ry * my, r = o.r * ir;
    g.fillStyle = "#5e2d15"; g.beginPath(); g.arc(ix, iy, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = IRIS_LUZ; g.beginPath(); g.ellipse(ix, iy + r * 0.32, r * 0.7, r * 0.55, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#120806"; g.beginPath(); g.arc(ix, iy + r * 0.05, r * 0.46, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(ix - r * 0.36, iy - r * 0.34, r * 0.3, r * 0.24, -0.4, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(112,92,110,0.38)"; g.lineWidth = 9; g.beginPath(); g.moveTo(o.U[0].x, o.U[0].y); for (const q of o.U) g.lineTo(q.x, q.y); g.stroke();
    g.restore();
    // vuelve a marcar el contorno del ojo de la pieza
    g.save(); g.globalAlpha = a; g.beginPath(); rutaPoli(g, o.poli); g.lineWidth = 3; g.strokeStyle = "#0b0a0e"; g.stroke(); g.restore();
  }
  function capaG(g, t, p, arruga, bz) {
    if (arruga > 0.01) {         // arruguitas en el puente de la nariz y aletas abiertas
      const tic = 0.5 + 0.5 * Math.sin(t * 38);
      g.save(); g.globalAlpha = arruga; g.strokeStyle = "#0b0a0e"; g.lineCap = "round"; g.lineWidth = 3.5;
      for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(838 + i * 9, 606 + i * 4 - 2 * tic); g.quadraticCurveTo(846 + i * 9, 600 + i * 4, 852 + i * 9, 608 + i * 4); g.stroke(); }
      g.lineWidth = 4; g.beginPath(); g.ellipse(870, 676, 7 + 2 * tic, 4, 0.3, 0, Math.PI * 2); g.stroke();
      g.restore();
    }
    if (bz > 0.01) { ojoBizco(g, OJOS_G.d, 0.95, 0.85, 0.95, bz); ojoBizco(g, OJOS_G.i, -0.9, 0.75, 0.95, bz); }
  }

  /* =====================================================================================
   * DECORADO: terraza con pérgola al atardecer
   * ===================================================================================== */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 100; const g = c.getContext("2d");
    g.translate(60, 50);
    // cielo de atardecer
    const cielo = g.createLinearGradient(0, -50, 0, 330); cielo.addColorStop(0, "#4a3d82"); cielo.addColorStop(0.45, "#b46f9f"); cielo.addColorStop(0.85, "#f4a774"); cielo.addColorStop(1, "#ffd39a");
    g.fillStyle = cielo; g.fillRect(-60, -50, W + 120, 400);
    const sol = g.createRadialGradient(780, 270, 10, 780, 270, 230); sol.addColorStop(0, "rgba(255,236,170,0.95)"); sol.addColorStop(0.18, "rgba(255,206,130,0.6)"); sol.addColorStop(1, "rgba(255,180,120,0)");
    g.fillStyle = sol; g.fillRect(480, 30, 600, 340);
    g.fillStyle = "#fff1c4"; g.beginPath(); g.arc(780, 285, 34, 0, Math.PI * 2); g.fill();
    // tejados y torres a contraluz con ventanas encendidas
    g.fillStyle = "#6b3f6e";
    const casas = [[-60, 250, 120], [55, 228, 90], [140, 262, 130], [262, 240, 70], [326, 214, 46], [366, 258, 150], [510, 236, 90], [596, 268, 120], [712, 226, 70], [778, 250, 110], [882, 232, 90], [966, 256, 120]];
    for (const [x, y, w] of casas) {
      g.fillRect(x, y, w, 360 - y);
      g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x + w / 2, y - 22); g.lineTo(x + w + 6, y); g.closePath(); g.fill();
      if (w > 80 && (x + w * 0.7 < 330 || x + w * 0.7 > 650)) g.fillRect(x + w * 0.7, y - 30, 10, 20);   // chimeneas, no detrás de las cabezas
    }
    g.fillStyle = "#7d4b7c"; g.beginPath(); g.arc(349, 214, 24, Math.PI, 0); g.fill(); g.fillRect(345, 180, 8, 14);
    g.fillStyle = "rgba(255,214,140,0.9)";
    for (let i = 0; i < 46; i++) { const x = -40 + hash(i + 300) * (W + 60), y = 262 + hash(i + 301) * 70; g.fillRect(x, y, 5, 7); }
    // pretil encalado con macetas de geranios
    const pre = g.createLinearGradient(0, 330, 0, 420); pre.addColorStop(0, "#fbf1e2"); pre.addColorStop(1, "#e2cdb2");
    g.fillStyle = pre; g.fillRect(-60, 336, W + 120, 84);
    g.fillStyle = "#fffaf0"; g.fillRect(-60, 326, W + 120, 14); g.strokeStyle = "#5b4232"; g.lineWidth = 2.5; g.strokeRect(-62, 326, W + 124, 14);
    g.strokeStyle = "rgba(91,66,50,0.25)"; g.lineWidth = 1.5;
    for (let x = -40; x < W + 60; x += 64) { g.beginPath(); g.moveTo(x, 340); g.lineTo(x, 420); g.stroke(); }
    for (const x of [70, 230, 690, 960]) {
      g.fillStyle = "#c86a3c"; g.strokeStyle = "#4a2112"; g.lineWidth = 2;
      g.beginPath(); g.moveTo(x - 20, 300); g.lineTo(x + 20, 300); g.lineTo(x + 15, 326); g.lineTo(x - 15, 326); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#3f8a2e"; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(x - 18 + i * 6, 292 - 8 * Math.sin(i * 1.3), 8, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = "#ef3b4a"; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(x - 15 + hash(i + x) * 30, 280 + hash(i + x + 1) * 14, 3.5, 0, Math.PI * 2); g.fill(); }
    }
    // suelo de barro cocido en perspectiva
    const sueloG = g.createLinearGradient(0, 420, 0, H + 50); sueloG.addColorStop(0, "#b85e34"); sueloG.addColorStop(1, "#8a3f22");
    g.fillStyle = sueloG; g.fillRect(-60, 420, W + 120, H - 370);
    g.strokeStyle = "rgba(60,22,10,0.45)"; g.lineWidth = 2;
    for (let i = 0, y = 426; y < H + 50; i++) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); y += 12 + i * 7; }
    for (let i = -14; i <= 14; i++) { g.beginPath(); g.moveTo(512 + i * 46, 420); g.lineTo(512 + i * 140, H + 50); g.stroke(); }
    g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(-60, 420, W + 120, 6);
    // pérgola de madera: postes, viga y travesaños
    const madera = (x, y, w, h) => { g.fillStyle = "#8a5a36"; g.fillRect(x, y, w, h); g.fillStyle = "rgba(255,220,170,0.25)"; g.fillRect(x, y, w, 3); g.strokeStyle = "#2a160a"; g.lineWidth = 2.5; g.strokeRect(x, y, w, h); };
    madera(-22, 30, 26, 420); madera(W - 4, 30, 26, 420);
    madera(-60, 22, W + 120, 22);
    for (let x = -40; x < W + 60; x += 70) madera(x, 4, 14, 26);
    // glicinias colgando de la viga
    for (let i = 0; i < 17; i++) {
      const x = -30 + i * 64 + hash(i + 120) * 24, L = 60 + hash(i + 121) * 70;
      g.fillStyle = "#3f7a2c"; for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(x - 14 + k * 9, 46 + 4 * Math.sin(k), 9, 5, 0.5 * (k - 1.5), 0, Math.PI * 2); g.fill(); }
      for (let k = 0; k < 26; k++) {
        const u = k / 26, yy = 48 + u * L, ww = (1 - u) * 14 + 3;
        g.fillStyle = ["#b48be0", "#9d6fd1", "#d4b4f2", "#8659c0"][k % 4];
        g.beginPath(); g.arc(x + (hash(k + i * 31) - 0.5) * ww * 2, yy, 4.2 - 2 * u, 0, Math.PI * 2); g.fill();
      }
    }
    // guirnalda de bombillas
    for (let k = 0; k < 2; k++) {
      const y0 = 60 + k * 26, caida = 48 + k * 10;
      g.strokeStyle = "#2a1a14"; g.lineWidth = 1.6; g.beginPath();
      for (let x = -20; x <= W + 20; x += 8) { const u = (x + 20) / (W + 40); const y = y0 + caida * 4 * u * (1 - u); if (x === -20) g.moveTo(x, y); else g.lineTo(x, y); }
      g.stroke();
      for (let i = 0; i < 13; i++) {
        const x = 20 + i * 80 + k * 40, u = (x + 20) / (W + 40), y = y0 + caida * 4 * u * (1 - u) + 7;
        const halo = g.createRadialGradient(x, y, 1, x, y, 26); halo.addColorStop(0, "rgba(255,230,160,0.75)"); halo.addColorStop(1, "rgba(255,210,130,0)");
        g.fillStyle = halo; g.fillRect(x - 26, y - 26, 52, 52);
        g.fillStyle = "#fff3c6"; g.beginPath(); g.ellipse(x, y, 4.5, 6, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#5a4020"; g.lineWidth = 1; g.stroke();
      }
    }
    // mesita de bistró con dos copas al fondo a la izquierda
    g.fillStyle = "#2b2b33"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2;
    g.fillRect(118, 382, 6, 92); g.beginPath(); g.ellipse(121, 476, 26, 6, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(121, 380, 44, 9, 0, 0, Math.PI * 2); g.fillStyle = "#e9e4dc"; g.fill(); g.stroke();
    for (const [x, col] of [[106, "#ffb24a"], [136, "#ff6f8a"]]) {
      g.strokeStyle = "#3a3a44"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, 377); g.lineTo(x, 362); g.stroke();
      g.fillStyle = col; g.beginPath(); g.moveTo(x - 8, 348); g.lineTo(x + 8, 348); g.lineTo(x, 362); g.closePath(); g.fill(); g.stroke();
    }
    // viñeta
    const v = g.createRadialGradient(512, 300, 300, 512, 300, 700); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(30,10,30,0.5)");
    g.fillStyle = v; g.fillRect(-60, -50, W + 120, H + 100);
    return c;
  }
  // maceta grande (por fotograma: los tallos se clavan dentro)
  function macetaAtras(g) {
    const { x, y, r } = MACETA;
    g.save(); g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse(x, y + 52, r * 0.95, 10, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#4a2a18"; g.beginPath(); g.ellipse(x, y - 34, r * 0.9, 12, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#6b3f22"; g.beginPath(); g.ellipse(x, y - 32, r * 0.84, 9, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function macetaDelante(g) {
    const { x, y, r } = MACETA;
    g.save(); g.lineJoin = "round";
    const cuerpo = () => { g.beginPath(); g.moveTo(x - r * 0.92, y - 30); g.lineTo(x + r * 0.92, y - 30); g.lineTo(x + r * 0.7, y + 50); g.quadraticCurveTo(x, y + 58, x - r * 0.7, y + 50); g.closePath(); };
    const gr = g.createLinearGradient(x - r, 0, x + r, 0); gr.addColorStop(0, "#a8502a"); gr.addColorStop(0.45, "#d8743f"); gr.addColorStop(1, "#8a3c1c");
    cuerpo(); g.fillStyle = gr; g.fill(); cuerpo(); g.lineWidth = 3; g.strokeStyle = "#2a1008"; g.stroke();
    // borde
    g.beginPath(); g.ellipse(x, y - 34, r, 12, 0, 0, Math.PI); g.lineTo(x - r, y - 22); g.ellipse(x, y - 22, r, 12, 0, Math.PI, 0, true); g.closePath();
    g.fillStyle = "#c9663a"; g.fill(); g.lineWidth = 2.5; g.stroke();
    g.fillStyle = "rgba(255,220,180,0.35)"; g.fillRect(x - r * 0.6, y - 14, 8, 50);
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const cerca = dentro(t, T.saca0, T.ofrece, T.achis + 0.25, T.ultimo);
    const fin = tramo(t, T.coger0, T.oreja1, suave);
    return { k: 1 + 0.1 * cerca + 0.06 * fin, x: 512 - 40 * cerca - 12 * fin, y: 300 - 18 * cerca - 20 * fin };
  }

  function poses(t) {
    const pG = poseG(t);
    const pC = poseC(t, pG);
    return { g: pG, c: pC };
  }
  function prepara() {
    POSE_G_COGE = poseG(T.coge1);
    const pGu = poseG(T.ultimo); B0_ULTIMO = ramoEnG(T.ultimo, pGu);
    preparaTormenta();
  }
  let listo = false;

  class GuillermoFlores extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !CA.listo()) return;
      if (!fondo) fondo = creaFondo();
      if (!listo) { prepara(); listo = true; }
      const { g: pG, c: pC } = poses(t);
      const B = ramoEstado(t, pG, pC); RAMO_ACTUAL = B;
      // en la mano de Carla, el último pétalo cae desde donde estaba
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = t >= T.achis ? 5 * Math.exp(-(t - T.achis) * 7) * suave(fase(t, T.achis, T.achis + 0.04)) : 0;
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -60, -50);
      macetaAtras(g);
      if (B.capa === "maceta") dibRamo(g, B, 1, 0, false);
      macetaDelante(g);
      // sombras
      g.save(); g.fillStyle = "rgba(40,10,0,0.35)";
      g.beginPath(); g.ellipse(G.aPantalla(pG, pG.pelvis).x, SUELO + 2, 62, 7, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pC.x, SUELO + 2, 52, 6, 0, 0, Math.PI * 2); g.fill(); g.restore();
      const A = abeja(t, pG, pC);
      const delanteC = t >= T.cambio;                    // al principio Guillermo va delante (el ramo); para cogerlo, Carla
      if (!delanteC) CA.dibujar(g, pC, t);
      if (A.z < 0) dibAbeja(g, t, A);
      if (B.capa === "detras") dibRamo(g, B, 0, 1, true);
      G.dibujar(g, pG, t);
      if (delanteC) CA.dibujar(g, pC, t);
      if (A.z >= 0) dibAbeja(g, t, A);
      if (B.capa === "vuela" && t >= T.vuela) dibRamo(g, B, 1, 0, false);   // vuela por delante (antes, en la capa de su mano)
      dibPolen(g, t, pG);
      dibSoplido(g, t, pG);
      dibTormenta(g, t);
      dibUltimo(g, t);
      dibFlorPelo(g, t, pG, pC);
      destello(g, t, T.ofrece - 0.05, puntoRamo(ramoEnG(T.ofrece, pG), { x: 30, y: -100 }).x, puntoRamo(ramoEnG(T.ofrece, pG), { x: 30, y: -100 }).y, 18);
      const hc = CA.aPantalla(pC, CA.centroCabeza(pC)), hg = G.aPantalla(pG, G.centroCabeza(pG));
      dibCorazones(g, t, { x: hc.x, y: hc.y - 40 }, T.cAww + 0.05, T.ah3, 4, "#ff5d8f");
      dibCorazones(g, t, { x: hg.x + 10, y: hg.y - 50 }, T.derrite + 0.1, T.abejaPosa - 0.2, 5, "#ff4f7d");
      const ojoC = CA.aPantalla(pC, CA.cabeza(pC).a({ x: 785, y: 440 }));
      destello(g, t, T.guinoC + 0.05, ojoC.x + 4, ojoC.y - 6, 13);
      const ojoG = G.aPantalla(pG, G.cabeza(pG).a({ x: 700, y: 525 }));
      destello(g, t, T.guinoG + 0.05, ojoG.x - 4, ojoG.y - 4, 13);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00047", nombre: "Guillermo y Carla · Las flores", crear: () => new GuillermoFlores() });
  window.__A2D_00047 = { pose: poses, T, DUR, ramo: (t) => { const p = poses(t); return ramoEstado(t, p.g, p.c); } };
})();
