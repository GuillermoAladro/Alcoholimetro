"use strict";
/* 00025 · Guillermo y Marcos · Las pesas
 *
 * Negro → gimnasio del parque de bomberos. Guillermo, en la jaula de sentadillas, mira a cámara muy
 * chulo y se frota las manos (sale una nubecita de magnesio) → agarra la barra cargada de discos y
 * tira con todo: se pone rojo, suda, le sale la vena y la barra se dobla por el medio… pero los
 * discos ni se mueven de los ganchos → la suelta (la barra vibra) y retrocede jadeando con las manos
 * en las rodillas → Marcos, que miraba bebiendo de su botella, se acerca, le coge por la cinturilla
 * del vaquero con una mano y lo levanta → hace curl de bíceps con Guillermo como si fuera una
 * mancuerna mientras bebe tan tranquilo de su botella; Guillermo, subiendo y bajando, se cruza de
 * brazos muy digno… y acaba mareado, con los ojos en espiral y estrellitas → Marcos lo deja en el
 * suelo y lo suelta (la cinturilla vuelve con un chasquido) → Guillermo se tambalea, sacude la
 * cabeza, se enfada, se da la vuelta de un salto y, agachado como en un peso muerto, agarra a Marcos
 * por el chaquetón y tira… Marcos ni se inmuta: bebe, le mira aburrido, mira a cámara → le apoya la
 * mano en la cabeza, se deja caer encima con desgana y Guillermo se queda aplastado como una tortita
 * → Marcos guiña un ojo a cámara → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto. Mientras Marcos lo sujeta, la posición de Guillermo
 * se calcula en cada fotograma a partir del puño de Marcos: la cinturilla nunca resbala.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, MB = MarcosBombero;
  const S = 0.28, SUELO = 572;
  const DUR = 14.7;
  const T = {
    mira: 0.35, frota0: 0.75, frota1: 1.3, agacha0: 1.3, agacha1: 1.72, tira: 1.78, maxi: 2.6, suelta: 3.4,
    atras0: 3.62, atras1: 4.4, jadea0: 4.05, jadea1: 5.15,
    msorbo0: 0.85, msorbo1: 1.55, manda0: 3.85, manda1: 4.95, magarra0: 4.9, agarra: 5.3,
    alza0: 5.34, alza1: 5.86, curl0: 5.95, curl1: 9.35, cruza0: 6.0, cruza1: 6.38, msorbo2: 6.85, msorbo3: 7.75,
    mareo0: 8.05, baja0: 9.35, baja1: 9.86, suelta2: 9.92, matras0: 10.02, matras1: 10.36,
    tamb0: 9.92, tamb1: 10.42, sacude0: 10.42, sacude1: 10.7, gira0: 10.74, gira1: 11.0,
    paso0: 11.02, paso1: 11.36, agarraM: 11.58, tiraM0: 11.62, tiraM1: 12.62, msorbo4: 11.8, msorbo5: 12.35,
    mcamara: 12.42, mmano0: 12.62, mmano1: 12.92, aplasta0: 12.92, aplasta1: 13.18, guino: 13.5, fin: 14.0
  };
  const G0 = 300, G1 = 527, G1b = 503;          // Guillermo: en la jaula, tras retroceder, tras tambalearse
  const M0 = 868;                                // Marcos al principio (luego se calcula dónde se pone)
  const BAR_Y = 404, HALF = 150, GANCHO = 92;    // barra: altura, media longitud y ganchos de la jaula
  const CURL_N = 4, CURL_P = (T.curl1 - T.curl0) / CURL_N;

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const tramoDentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const ang = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);

  /* ---------- caras (los dos usan los mismos campos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.15, dientes: 1, lengua: 0, esp: 0, mof: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: Math.max(e.c, parp), i: Math.max(e.c, parp), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  const CARAS_G = {
    inicio: E({ orig: 0, sonr: 0.45, sd: 6, gd: 0.08, si: 4, gi: 0.05 }),
    chulo: E({ mx: -0.85, my: -0.15, sd: 18, gd: 0.16, si: -4, gi: -0.08, sonr: 0.85, abre: 4, ancho: 0.95 }),
    concentra: E({ mx: 0.6, my: 0.9, c: 0.3, sd: -12, gd: -0.24, si: -12, gi: -0.24, sonr: -0.1, ancho: 0.85 }),
    tira: E({ mx: 0.5, my: 0.4, c: 1, z: 1, sd: -10, gd: -0.25, si: -10, gi: -0.25, abre: 2, ancho: 0.8, sonr: -0.3, mof: 0.9 }),
    maxi: E({ mx: 0.5, my: 0.4, c: 0.7, z: 0.6, sd: -14, gd: -0.3, si: -14, gi: -0.3, abre: 26, ancho: 1.25, sonr: -0.6, lengua: 0 }),
    jadea: E({ mx: 0.4, my: 0.6, c: 0.45, sd: 8, gd: 0.15, si: 8, gi: 0.15, abre: 30, ancho: 0.9, sonr: -0.2, lengua: 1 }),
    sorpresa: E({ mx: -0.4, my: -0.6, iris: 0.75, sd: 26, gd: 0.15, si: 26, gi: 0.15, abre: 40, ancho: 0.75, sonr: -0.1, lengua: 0.3 }),
    molesto: E({ mx: -0.85, my: 0.05, c: 0.5, sd: -6, gd: -0.18, si: 2, gi: 0.02, sonr: -0.35, ancho: 0.8 }),
    mareo: E({ mx: 0, my: 0, esp: 1, sd: 12, gd: 0.2, si: -6, gi: -0.1, abre: 18, ancho: 0.85, sonr: -0.15, lengua: 0.8 }),
    enfado: E({ mx: 0.9, my: 0.1, c: 0.3, sd: -14, gd: -0.3, si: -14, gi: -0.3, abre: 10, ancho: 1.1, sonr: -0.5 }),
    tiraM: E({ mx: 0.6, my: -0.3, c: 1, z: 1, sd: -10, gd: -0.25, si: -10, gi: -0.25, abre: 2, ancho: 0.8, sonr: -0.3, mof: 0.9 }),
    tiraM2: E({ mx: 0.6, my: -0.4, c: 0.75, z: 0.6, sd: -14, gd: -0.3, si: -14, gi: -0.3, abre: 26, ancho: 1.25, sonr: -0.6 }),
    arriba: E({ mx: 0.3, my: -1, iris: 0.75, sd: 22, gd: 0.15, si: 22, gi: 0.15, abre: 14, ancho: 0.7, sonr: -0.2 }),
    aplastado: E({ mx: 0, my: 0, c: 1, z: 1, sd: -4, gd: -0.1, si: -4, gi: -0.1, abre: 6, ancho: 1.3, sonr: -0.5, mof: 0.6 }),
    ko: E({ mx: 0, my: 0, esp: 1, sd: 14, gd: 0.2, si: 8, gi: 0.1, abre: 10, ancho: 1.1, sonr: -0.3, lengua: 0.6 })
  };
  const GUION_CARA_G = [
    [T.mira, T.mira + 0.25, "chulo"], [T.agacha0, T.agacha0 + 0.2, "concentra"], [T.tira, T.tira + 0.12, "tira"],
    [T.maxi, T.maxi + 0.2, "maxi"], [T.suelta, T.suelta + 0.15, "jadea"], [T.agarra - 0.02, T.agarra + 0.08, "sorpresa"],
    [T.cruza0 + 0.1, T.cruza1 + 0.1, "molesto"], [T.mareo0, T.mareo0 + 0.4, "mareo"], [T.sacude1 - 0.1, T.sacude1 + 0.1, "enfado"],
    [T.tiraM0, T.tiraM0 + 0.12, "tiraM"], [T.tiraM0 + 0.55, T.tiraM0 + 0.75, "tiraM2"], [T.mmano0 + 0.05, T.mmano0 + 0.2, "arriba"],
    [T.aplasta0, T.aplasta0 + 0.06, "aplastado"], [T.aplasta1 + 0.35, T.aplasta1 + 0.6, "ko"]
  ];
  // cuerpo: pel (hoja, + abajo), torso (+ = hacia delante), cab
  const CUERPO_G0 = { pel: 0, torso: 0, cab: 0 };
  const CUERPOS_G = {
    inicio: CUERPO_G0,
    chulo: { pel: 0, torso: -0.04, cab: -0.06 },
    agacha: { pel: 92, torso: 0.1, cab: 0.06 },
    tira: { pel: 70, torso: -0.06, cab: -0.06 },
    jadea: { pel: 70, torso: 0.3, cab: 0.12 },
    recto: { pel: 0, torso: -0.02, cab: 0 },
    colgado: { pel: 0, torso: 0.02, cab: 0.02 },
    tambalea: { pel: 10, torso: 0, cab: 0 },
    agachaM: { pel: 240, torso: -0.2, cab: -0.06 },
    tiraM: { pel: 262, torso: -0.27, cab: -0.12 }
  };
  const GUION_CUERPO_G = [
    [T.mira, T.mira + 0.3, "chulo"], [T.agacha0, T.agacha1, "agacha"], [T.tira, T.tira + 0.25, "tira"],
    [T.suelta + 0.05, T.atras1, "jadea"], [T.agarra - 0.05, T.agarra + 0.25, "recto"], [T.alza0, T.alza1, "colgado"],
    [T.baja1 - 0.1, T.baja1 + 0.1, "tambalea"], [T.sacude1, T.gira0, "recto"], [T.paso1 - 0.1, T.agarraM, "agachaM"],
    [T.tiraM0, T.tiraM0 + 0.3, "tiraM"]
  ];
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  // pasos (x de pantalla de cada tobillo). Guillermo mira a la izquierda hasta que se da la vuelta:
  // entonces la pierna cercana queda a su derecha en pantalla.
  const PASOS_G = {
    cerca: [[-10, -9, G0 + 22], [T.atras0, T.atras0 + 0.32, G0 + 130], [T.atras0 + 0.42, T.atras1, G1 + 24],
            [T.tamb0 + 0.05, T.tamb0 + 0.25, G1 + 4], [T.tamb0 + 0.3, T.tamb1, G1b + 24], [T.gira0, T.gira1, G1b - 20],
            [T.paso0, T.paso0 + 0.22, 0 /* G2 - 34 */]],
    lejos: [[-10, -9, G0 - 20], [T.atras0 + 0.2, T.atras0 + 0.5, G0 + 60], [T.atras0 + 0.6, T.atras1 + 0.05, G1 - 20],
            [T.tamb0 + 0.15, T.tamb0 + 0.35, G1b - 30], [T.gira0, T.gira1, G1b + 24], [T.paso0 + 0.1, T.paso1, 0 /* G2 + 40 */]]
  };
  function pie(lista, t) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    const arco = Math.sin(Math.PI * u);
    return { x: lerp(xa, x, suave5(u)), alza: 34 * arco, ang: -0.15 * arco };
  }

  /* =====================================================================================
   * MARCOS (a la derecha, en espejo: mira a la izquierda)
   * ===================================================================================== */
  const CARAS_M = {
    inicio: E({ mx: 0.85, my: 0.1, sd: 4, gd: 0.04, si: 6, gi: 0.06, sonr: 0.3, ancho: 0.9 }),
    sorbo: E({ mx: 0.6, my: -0.5, c: 0.55, sd: 8, gd: 0.06, si: 8, gi: 0.06, abre: 16, ancho: 0.55, sonr: 0, lengua: 0 }),
    divierte: E({ mx: 0.85, my: 0.15, c: 0.2, sd: 10, gd: 0.1, si: 16, gi: 0.14, sonr: 0.6, ancho: 0.95 }),
    camara: E({ mx: -0.85, my: -0.05, c: 0.15, sd: 6, gd: 0.04, si: 14, gi: 0.12, sonr: 0.7, ancho: 0.95 }),
    sorboC: E({ mx: -0.85, my: -0.2, c: 0.45, sd: 8, gd: 0.06, si: 12, gi: 0.1, abre: 16, ancho: 0.55, sonr: 0 }),
    aburre: E({ mx: 0.7, my: 0.55, c: 0.5, sd: -2, gd: -0.04, si: 4, gi: 0.02, sonr: 0.05, ancho: 0.85 }),
    aburreC: E({ mx: -0.85, my: 0, c: 0.5, sd: 0, gd: 0, si: 10, gi: 0.1, sonr: 0.25, ancho: 0.85 }),
    guino: E({ mx: -0.85, my: -0.05, c: 0, h: 1, sd: 8, gd: 0.06, si: 16, gi: 0.14, sonr: 0.85, ancho: 1, abre: 4 })
  };
  const GUION_CARA_M = [
    [T.msorbo0, T.msorbo0 + 0.15, "sorbo"], [T.msorbo1, T.msorbo1 + 0.15, "inicio"], [T.tira + 0.4, T.tira + 0.7, "divierte"],
    [T.manda0 - 0.2, T.manda0, "camara"], [T.manda0 + 0.5, T.manda0 + 0.7, "divierte"], [T.alza1, T.alza1 + 0.2, "camara"],
    [T.msorbo2, T.msorbo2 + 0.15, "sorboC"], [T.msorbo3, T.msorbo3 + 0.15, "camara"], [T.baja0, T.baja0 + 0.2, "divierte"],
    [T.tiraM0 + 0.05, T.tiraM0 + 0.25, "aburre"], [T.msorbo4, T.msorbo4 + 0.15, "sorbo"], [T.msorbo5, T.msorbo5 + 0.1, "aburre"],
    [T.mcamara, T.mcamara + 0.15, "aburreC"], [T.aplasta1 + 0.1, T.aplasta1 + 0.3, "camara"], [T.guino, T.guino + 0.12, "guino"],
    [T.guino + 0.55, T.guino + 0.7, "camara"]
  ];
  const CUERPOS_M = {
    inicio: { pel: 0, torso: 0, cab: 0.02 },
    agarra: { pel: 30, torso: 0.1, cab: 0.06 },
    curl: { pel: 6, torso: -0.06, cab: -0.02 },
    deja: { pel: 26, torso: 0.08, cab: 0.04 },
    recto: { pel: 0, torso: 0, cab: 0 },
    apoya: { pel: 10, torso: 0.2, cab: 0.08 },
    aplasta: { pel: 30, torso: 0.3, cab: 0.1 }
  };
  const GUION_CUERPO_M = [
    [T.magarra0, T.agarra, "agarra"], [T.alza0, T.alza1, "curl"], [T.baja0, T.baja1, "deja"], [T.suelta2, T.matras1, "recto"],
    [T.mmano0, T.mmano1, "apoya"], [T.aplasta0, T.aplasta1, "aplasta"]
  ];

  /* =====================================================================================
   * GEOMETRÍA
   * ===================================================================================== */
  const WB = { x: 142, y: 684 };               // cinturilla de Guillermo por detrás (hoja)
  const DOBLADILLO_M = { x: 356, y: 712 };     // bajo del chaquetón de Marcos por delante (hoja)
  const CABEZA_G = { x: 790, y: 300 };         // coronilla de Guillermo (retrato) donde Marcos apoya la mano
  const BAJO_PUNO = 6;                        // la cinturilla queda estos px por debajo del centro del puño
  let GEO = null;

  // poses mínimas para medir
  const poseMin = (Pj, x, extra) => Object.assign({ x, suelo: SUELO, s: S, pelvis: { x: Pj.PELVIS.x, y: Pj.PELVIS.y }, torso: 0, torsoEsc: { x: 1, y: 1 },
    cabeza: { ang: 0, dx: 0, dy: 0, esc: { x: 1, y: 1 } } }, extra || {});
  function preparaGeo() {
    // Guillermo de pie tras retroceder: dónde queda su cinturilla
    const pg = poseMin(G, G1, { espejo: true, pelvis: { x: G.PELVIS.x, y: G.PELVIS.y } });
    const wb = G.aPantalla(pg, WB);
    const F = { x: wb.x, y: wb.y - BAJO_PUNO };
    // Marcos: con su postura de agarrar, colocarlo para que el puño llegue con el brazo casi estirado
    const b = CUERPOS_M.agarra, alcance = (MB.BRAZO_L + G.MUNECA_R * G.JK) * S * MB.K;
    const hombroM = x => { const p = poseMin(MB, x, { espejo: true, pelvis: { x: MB.PELVIS.x, y: MB.PELVIS.y + b.pel }, torso: b.torso });
      return MB.aPantalla(p, MB.tronco(p)(MB.HOMBRO)); };
    let lo = F.x, hi = F.x + 260;
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, h = hombroM(m); if (Math.hypot(h.x - F.x, h.y - F.y) < 0.97 * alcance) lo = m; else hi = m; }
    const M1 = (lo + hi) / 2, M2 = M1 + 30;
    // curl: el codo queda fijo un poco por delante y por debajo del hombro; el puño gira a su alrededor
    const pc = poseMin(MB, M1, { espejo: true, pelvis: { x: MB.PELVIS.x, y: MB.PELVIS.y + CUERPOS_M.curl.pel }, torso: CUERPOS_M.curl.torso });
    const hc = MB.aPantalla(pc, MB.tronco(pc)(MB.HOMBRO));
    const Lu = MB.A.datos.piezas.brazo.codo * S * MB.K, Lf = (MB.BRAZO_L - MB.A.datos.piezas.brazo.codo + G.MUNECA_R * G.JK * 0.8) * S * MB.K;
    const codo = { x: hc.x - Lu * 0.55, y: hc.y + Lu * 0.83 };
    // Parte 2: Guillermo agachado agarra el bajo del chaquetón de Marcos
    const pm2 = poseMin(MB, M2, { espejo: true });
    const dob = MB.aPantalla(pm2, DOBLADILLO_M);
    const b2 = CUERPOS_G.tiraM, alcG = (G.BRAZO_L + G.MUNECA_R * G.JK) * S;
    const hombroG = x => { const p = poseMin(G, x, { pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b2.pel }, torso: b2.torso });
      return G.aPantalla(p, G.tronco(p)(G.HOMBRO)); };
    lo = dob.x - 260; hi = dob.x;
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, h = hombroG(m); if (Math.hypot(dob.x - h.x, dob.y - h.y) > 0.95 * alcG) lo = m; else hi = m; }
    const G2 = (lo + hi) / 2;
    PASOS_G.cerca[PASOS_G.cerca.length - 1][2] = G2 - 28;
    PASOS_G.lejos[PASOS_G.lejos.length - 1][2] = G2 + 34;
    GEO = { F, M1, M2, codo, Lf, G2, dob };
    // la cinturilla exacta en el instante del agarre (con su pose real)
    const pa = poseG(T.agarra), wa = G.aPantalla(pa, WB);
    GEO.F = { x: wa.x, y: wa.y - BAJO_PUNO };
  }
  const PASOS_M = () => ({
    cerca: [[-10, -9, M0 + 38], [T.manda0, T.manda0 + 0.32, lerp(M0, GEO.M1, 0.36) + 38], [T.manda0 + 0.36, T.manda0 + 0.7, lerp(M0, GEO.M1, 0.75) + 38],
            [T.manda0 + 0.74, T.manda1, GEO.M1 + 38], [T.matras0 + 0.1, T.matras1, GEO.M2 + 38]],
    lejos: [[-10, -9, M0 - 36], [T.manda0 + 0.16, T.manda0 + 0.5, lerp(M0, GEO.M1, 0.56) - 36], [T.manda0 + 0.54, T.manda0 + 0.9, GEO.M1 - 36],
            [T.matras0, T.matras0 + 0.26, GEO.M2 - 36]]
  });
  let PM = null;

  // ángulo del antebrazo de Marcos durante el curl (respecto a la horizontal, hacia Guillermo)
  const ABAJO = 2.0, ARRIBA = -1.95;         // radianes en pantalla: 2.0 ≈ abajo-izquierda, −1.95 ≈ arriba
  function puñoCurl(t) {
    const c = GEO.codo, L = GEO.Lf;
    const u = (t - T.curl0) / CURL_P, k = clamp(u, 0, CURL_N);
    // cada repetición: sube (60 %) y baja (40 %), con un poco más de brío en las dos últimas
    let ph = k - Math.floor(k); if (k >= CURL_N) ph = 0;
    const sube = ph < 0.55 ? suave(ph / 0.55) : 1 - suave((ph - 0.55) / 0.45);
    const a = lerp(ABAJO, ARRIBA + Math.PI * 2, sube) * 1;   // pasa por la horizontal (π) hacia arriba
    return { x: c.x + Math.cos(a) * L, y: c.y + Math.sin(a) * L, a };
  }
  const puñoAbajo = () => { const c = GEO.codo, L = GEO.Lf; return { x: c.x + Math.cos(ABAJO) * L, y: c.y + Math.sin(ABAJO) * L, a: ABAJO }; };

  /* ---------- puño de Marcos que agarra la cinturilla (pantalla) ---------- */
  function puñoM(t) {
    const F = GEO.F, Fb = puñoAbajo();
    if (t < T.alza0) return { x: F.x, y: F.y, a: 2.0 };
    if (t < T.curl0) { const k = suave(fase(t, T.alza0, T.alza1)); return { x: lerp(F.x, Fb.x, k), y: lerp(F.y, Fb.y, k), a: lerp(2.0, ABAJO, k) }; }
    if (t < T.baja0) return puñoCurl(t);
    const k = suave(fase(t, T.baja0, T.baja1));
    return { x: lerp(Fb.x, F.x, k), y: lerp(Fb.y, F.y, k), a: lerp(ABAJO, 2.0, k) };
  }
  const agarrado = t => t >= T.agarra && t < T.suelta2;

  /* =====================================================================================
   * BARRA (se dobla por el medio pero los discos no se mueven)
   * ===================================================================================== */
  function flexBarra(t) {
    if (t < T.tira) return 0;
    const tiembla = 1 + 0.12 * ruido(t * 30);
    const subida = suave(fase(t, T.tira, T.maxi)) * 9 + 4 * tramo(t, T.maxi, T.maxi + 0.4);
    if (t < T.suelta) return subida * tiembla;
    const f0 = (9 + 4) * (1 + 0.12 * ruido(T.suelta * 30)), u = t - T.suelta;
    return f0 * Math.exp(-u * 5.5) * Math.cos(u * 26);
  }
  // altura de la barra en x (pantalla)
  function barraY(x, t) {
    const f = flexBarra(t), d = (x - G0) / GANCHO;
    if (Math.abs(d) <= 1) return BAR_Y - f * Math.cos(d * Math.PI / 2) * (1 - 0.1 * d * d);
    return BAR_Y + f * 0.35 * (Math.abs(x - G0) - GANCHO) / (HALF - GANCHO);    // fuera de los ganchos los extremos bajan un poco
  }
  const AGARRE_BARRA = [G0 - 38, G0 + 38];     // x de las manos en la barra (lejos, cerca)

  /* =====================================================================================
   * POSE DE GUILLERMO
   * ===================================================================================== */
  const R_M = G.MUNECA_R * G.JK;
  const manoDesde = (m, a, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, a); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_C = manoDesde({ x: 131, y: 652 }, 0, -1.75), BOLS_L = manoDesde({ x: 372, y: 648 }, 0, -1.75);
  function poseG(t, pM0) {
    if (!GEO) preparaGeo();
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const respira = Math.sin(t * 2.4) * (1 + 1.5 * tramoDentro(t, T.suelta, T.suelta + 0.2, T.jadea1, T.jadea1 + 0.4));
    const espejo = t < (T.gira0 + T.gira1) / 2;
    // temblor de esfuerzo
    const esf1 = tramoDentro(t, T.tira, T.tira + 0.3, T.suelta - 0.05, T.suelta + 0.05) * (0.6 + 0.4 * tramo(t, T.maxi - 0.3, T.maxi));
    const esf2 = tramoDentro(t, T.tiraM0, T.tiraM0 + 0.3, T.aplasta0, T.aplasta0 + 0.05) * (0.6 + 0.4 * tramo(t, T.tiraM0 + 0.4, T.tiraM0 + 0.7));
    const tiembla = (esf1 + esf2) * 2.2;
    const fc = pie(PASOS_G.cerca, t), fl = pie(PASOS_G.lejos, t);
    const X = (fc.x + fl.x) / 2;
    const p = {
      x: X, suelo: SUELO, s: S, espejo, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.4 + ruido(t * 37 + 3) * tiembla },
      torso: b.torso + ruido(t * 29 + 1) * tiembla * 0.006, torsoEsc: { x: 1, y: 1 + respira * 0.005 },
      piernas: {}, cabeza: { ang: b.cab + ruido(t * 33 + 7) * tiembla * 0.012, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // jadeo: la cabeza sube y baja
    p.cabeza.ang += 0.04 * Math.sin(t * 9) * tramoDentro(t, T.suelta + 0.1, T.suelta + 0.3, T.jadea1 - 0.2, T.jadea1);
    // tambaleo mareado tras bajar, y sacudida de cabeza
    const tamb = tramoDentro(t, T.baja1 - 0.05, T.baja1 + 0.1, T.sacude0, T.sacude1);
    p.torso += 0.09 * Math.sin((t - T.baja1) * 7) * tamb; p.cabeza.ang += 0.12 * Math.sin((t - T.baja1) * 6 + 1) * tamb;
    p.cabeza.ang += 0.2 * Math.sin((t - T.sacude0) * 34) * campana(t, T.sacude0, T.sacude1);
    // mareo mientras sube y baja
    const mar = tramoDentro(t, T.mareo0, T.mareo0 + 0.4, T.baja1, T.baja1 + 0.3);
    p.cabeza.ang += 0.1 * Math.sin(t * 5.2) * mar; p.torso += 0.03 * Math.sin(t * 5.2 + 1) * mar;
    // pies (de pantalla a hoja)
    const pies = { cerca: fc, lejos: fl };
    for (const lado of ["cerca", "lejos"]) {
      const f = pies[lado], hx = G.aHoja(p, { x: f.x, y: 0 }).x;
      p.piernas[lado] = { tob: { x: hx, y: TOB_G[lado] - f.alza / S }, ang: f.ang };
    }
    // ---- colgado de la cinturilla ----
    const colg = agarrado(t) ? tramoDentro(t, T.alza0, T.alza1, T.baja1 - 0.25, T.baja1) : 0;
    if (colg > 0) {
      const balancea = Math.sin((t - T.alza0) * 4.6) * colg;
      for (const lado of ["cerca", "lejos"]) {
        const sg = lado === "cerca" ? -1 : 1, q = p.piernas[lado];
        const cuelga = { x: G.PELVIS.x + sg * 52 + 26 * balancea + 10, y: G.PELVIS.y + 500 + (lado === "cerca" ? 0 : -14) };
        q.tob = mezcla(q.tob, cuelga, colg); q.ang = lerp(q.ang, 0.5 + 0.1 * balancea, colg);
      }
      p.torso += 0.05 * balancea;
    }
    // ---- manos ----
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    let c = { x: BOLS_C.x, y: BOLS_C.y }, l = { x: BOLS_L.x, y: BOLS_L.y };
    let cpu = 0, lpu = 0, cang = 0, lang = 0, cmu = -1.75, lmu = -1.75;
    // se frota las manos delante de la tripa (y suelta magnesio)
    const frota = tramoDentro(t, T.frota0, T.frota0 + 0.22, T.frota1 - 0.08, T.agacha1);
    if (frota > 0) {
      const fr = Math.sin((t - T.frota0) * 30) * tramo(t, T.frota0 + 0.15, T.frota0 + 0.3) * (1 - tramo(t, T.frota1 - 0.25, T.frota1 - 0.1));
      c = mezcla(c, Tr({ x: 252 + 9 * fr, y: 545 }), frota); l = mezcla(l, Tr({ x: 276 - 9 * fr, y: 548 }), frota);
      cpu = Math.max(cpu, frota); lpu = Math.max(lpu, frota); cang = lerp(cang, 0.6, frota); lang = lerp(lang, -0.5, frota);
    }
    // agarra la barra: las manos siguen a la barra doblada
    const barra = tramoDentro(t, T.agacha0 + 0.1, T.agacha1, T.suelta, T.suelta + 0.2);
    if (barra > 0) {
      const xl = AGARRE_BARRA[0], xc = AGARRE_BARRA[1];
      const gl = G.aHoja(p, { x: xl, y: barraY(xl, t) }), gc = G.aHoja(p, { x: xc, y: barraY(xc, t) });
      l = mezcla(l, gl, barra); c = mezcla(c, gc, barra);
      cpu = Math.max(cpu, barra); lpu = Math.max(lpu, barra);
      cmu = lerp(cmu, -1.62, barra); lmu = lerp(lmu, -1.62, barra);
    }
    // manos en las rodillas, jadeando
    const rod = tramoDentro(t, T.suelta + 0.15, T.atras1 - 0.2, T.jadea1, T.agarra - 0.05);
    if (rod > 0) {
      const kc = { x: 205, y: 955 }, kl = { x: 345, y: 945 };
      c = mezcla(c, kc, rod); l = mezcla(l, kl, rod); cpu = Math.max(cpu, rod); lpu = Math.max(lpu, rod);
      cang = lerp(cang, 0.15, rod); lang = lerp(lang, -0.15, rod);
    }
    // sorpresa al notar la mano de Marcos: brazos un poco abiertos
    const sor = tramoDentro(t, T.agarra - 0.05, T.agarra + 0.15, T.cruza0, T.cruza1);
    if (sor > 0) {
      c = mezcla(c, Tr({ x: 30, y: 520 }), sor); l = mezcla(l, Tr({ x: 470, y: 470 }), sor);
      cpu = Math.max(cpu, sor); lpu = Math.max(lpu, sor); cang = lerp(cang, -0.3, sor); lang = lerp(lang, 0.4, sor);
    }
    // se cruza de brazos, muy digno
    const cruza = tramoDentro(t, T.cruza0, T.cruza1, T.mareo0 + 0.2, T.mareo0 + 0.6);
    if (cruza > 0) {
      c = mezcla(c, Tr({ x: 312, y: 470 }), cruza); l = mezcla(l, Tr({ x: 176, y: 478 }), cruza);
      cpu = Math.max(cpu, cruza); lpu = Math.max(lpu, cruza); cang = lerp(cang, -1.35, cruza); lang = lerp(lang, 1.35, cruza);
      cmu = lerp(cmu, -3.0, cruza); lmu = lerp(lmu, -0.2, cruza);
    }
    // mareado: brazos colgando flojos
    const flojo = tramoDentro(t, T.mareo0 + 0.2, T.mareo0 + 0.6, T.baja1, T.baja1 + 0.2);
    if (flojo > 0) {
      const ba = Math.sin(t * 5.2) * 14;
      c = mezcla(c, Tr({ x: 70 + ba, y: 640 }), flojo); l = mezcla(l, Tr({ x: 420 + ba, y: 630 }), flojo);
      cpu = Math.max(cpu, flojo); lpu = Math.max(lpu, flojo); cang = lerp(cang, 0.1, flojo); lang = lerp(lang, -0.1, flojo);
    }
    // tambaleándose: brazos abiertos para no caerse
    const abre = tramoDentro(t, T.baja1 - 0.05, T.baja1 + 0.2, T.sacude1, T.gira0);
    if (abre > 0) {
      const ba = Math.sin((t - T.baja1) * 7) * 30;
      c = mezcla(c, Tr({ x: -60, y: 470 + ba }), abre); l = mezcla(l, Tr({ x: 560, y: 470 - ba }), abre);
      cpu = Math.max(cpu, abre); lpu = Math.max(lpu, abre); cang = lerp(cang, -0.4, abre); lang = lerp(lang, 0.4, abre);
    }
    // puños apretados de enfado y se da la vuelta
    const puños = tramoDentro(t, T.sacude1 - 0.1, T.sacude1 + 0.1, T.paso0 + 0.1, T.paso1);
    if (puños > 0) {
      c = mezcla(c, Tr({ x: 90, y: 600 }), puños); l = mezcla(l, Tr({ x: 400, y: 590 }), puños);
      cpu = Math.max(cpu, puños); lpu = Math.max(lpu, puños); cang = lerp(cang, 0.1, puños); lang = lerp(lang, -0.1, puños);
    }
    // agarra el chaquetón de Marcos (mano lejana) y apoya la otra en el muslo
    const chaq = tramoDentro(t, T.paso0 + 0.1, T.agarraM, T.aplasta0, T.aplasta0 + 0.12);
    if (chaq > 0) {
      const d = pM0 ? MB.aPantalla(pM0, MB.tronco(pM0)(DOBLADILLO_M)) : GEO.dob, tir = esf2 * 3 * ruido(t * 21);
      const gl = G.aHoja(p, { x: d.x, y: d.y + tir });
      l = mezcla(l, gl, chaq); lpu = Math.max(lpu, chaq); lang = lerp(lang, -0.25, chaq); lmu = lerp(lmu, -2.6, chaq);
      c = mezcla(c, { x: 186, y: 860 }, chaq); cpu = Math.max(cpu, chaq); cang = lerp(cang, 0.2, chaq);
    }
    // aplastado: brazos hacia fuera
    const apl = tramo(t, T.aplasta0, T.aplasta0 + 0.15);
    if (apl > 0) {
      c = mezcla(c, Tr({ x: -40, y: 640 }), apl); l = mezcla(l, Tr({ x: 540, y: 630 }), apl);
      cpu = Math.max(cpu, apl); lpu = Math.max(lpu, apl); cang = lerp(cang, 0.5, apl); lang = lerp(lang, -0.5, apl);
    }
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: -1, puno: cpu };
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: -1, puno: lpu };
    p.agarraBarra = barra;
    // cara
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [0.25, 1.15, 4.7, 6.9, 7.6, 11.4]));
    p.rojo = 0.9 * tramoDentro(t, T.tira + 0.2, T.maxi, T.suelta + 0.3, T.jadea1) + 0.9 * tramoDentro(t, T.tiraM0 + 0.2, T.tiraM0 + 0.7, T.aplasta1, T.aplasta1 + 0.6)
      + 0.5 * tramoDentro(t, T.sacude1, T.sacude1 + 0.2, T.paso1, T.tiraM0);
    p.cara.rubor = Math.max(p.rojo, 0.4 * tramoDentro(t, T.cruza1, T.cruza1 + 0.3, T.mareo0, T.mareo0 + 0.4));
    p.sudor = tramoDentro(t, T.tira + 0.4, T.maxi, T.jadea1, T.jadea1 + 0.5) + tramoDentro(t, T.tiraM0 + 0.3, T.tiraM0 + 0.8, T.aplasta1, T.aplasta1 + 0.4);
    p.enfado = tramoDentro(t, T.maxi - 0.3, T.maxi, T.suelta, T.suelta + 0.3) + tramoDentro(t, T.sacude1 - 0.05, T.sacude1 + 0.15, T.aplasta0, T.aplasta0 + 0.2);
    return p;
  }

  /* =====================================================================================
   * POSE DE MARCOS
   * ===================================================================================== */
  function poseM(t, pG) {
    if (!GEO) preparaGeo();
    if (!PM) PM = PASOS_M();
    const b = guion(GUION_CUERPO_M, CUERPOS_M, "inicio", t);
    const respira = Math.sin(t * 2.0 + 1);
    const fc = pie(PM.cerca, t), fl = pie(PM.lejos, t);
    const X = (fc.x + fl.x) / 2;
    const p = {
      x: X, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: MB.PELVIS.x, y: MB.PELVIS.y + b.pel + respira * 1.2 }, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // el curl hace que el cuerpo se balancee un poco
    const enCurl = tramoDentro(t, T.curl0, T.curl0 + 0.2, T.curl1 - 0.2, T.curl1);
    if (enCurl > 0) { const pc = puñoCurl(t); p.torso += -0.025 * Math.sin(pc.a) * enCurl; }
    const TOB = MB.SUELO - MB.TOBILLO_ALTO;
    for (const [lado, f] of [["cerca", fc], ["lejos", fl]]) {
      const hx = MB.aHoja(p, { x: f.x, y: 0 }).x;
      p.piernas[lado] = { tob: { x: hx, y: TOB - (lado === "lejos" ? 8 : 0) - f.alza / (S * MB.K) }, ang: f.ang };
    }
    const Tr = MB.tronco(p), hl = Tr(MB.HOMBRO), hc = Tr(MB.HOMBRO_C);
    // ---- mano cercana: la botella; bebe con la boquilla en la boca ----
    const rc = MB.manoReposo(p, "cerca");
    let c = { x: rc.x, y: rc.y }, cang = 0.1, cmu = -1.66;
    const sorbo = Math.max(tramoDentro(t, T.msorbo0 - 0.25, T.msorbo0, T.msorbo1, T.msorbo1 + 0.3),
      tramoDentro(t, T.msorbo2 - 0.25, T.msorbo2, T.msorbo3, T.msorbo3 + 0.3), tramoDentro(t, T.msorbo4 - 0.25, T.msorbo4, T.msorbo5, T.msorbo5 + 0.3));
    if (sorbo > 0) {
      // la mano queda delante de la cara (sin taparla) y la boquilla llega a la boca
      const mano = Tr({ x: 432, y: 178 });
      c = mezcla(c, mano, sorbo); cang = lerp(cang, -1.72, sorbo);
    }
    // ---- mano lejana ----
    let l = { x: MB.BOLSILLO_L.x, y: MB.BOLSILLO_L.y }, lpu = 0, lang = 0, lmu = -1.75, ldob = 1;
    const sale = tramoDentro(t, T.manda0 + 0.2, T.manda0 + 0.6, T.magarra0, T.agarra);
    if (sale > 0) { const r = Tr({ x: 430, y: 640 }); l = mezcla(l, r, sale); lpu = Math.max(lpu, sale); }
    // agarra la cinturilla: el puño va a la cinturilla de Guillermo y la sujeta
    const aga = tramoDentro(t, T.magarra0, T.agarra, T.suelta2, T.suelta2 + 0.3);
    if (aga > 0) {
      // el puño siempre está justo encima de la cinturilla real de Guillermo: no resbala nunca
      const a = t < T.agarra ? 2.0 : puñoM(t).a;
      const F = pG ? (() => { const wb = G.aPantalla(pG, WB); return { x: wb.x, y: wb.y - BAJO_PUNO }; })() : GEO.F;
      const q = MB.aHoja(p, F);
      l = mezcla(l, q, aga); lpu = Math.max(lpu, aga);
      // la muñeca mira hacia el codo: en la hoja reflejada, dirección −a; con mu = −1,75, ang = 1,75 − a
      lang = lerp(lang, 1.75 - a, aga); ldob = 1;
    }
    // la suelta y el brazo vuelve a colgar
    const cuelga = tramoDentro(t, T.suelta2, T.suelta2 + 0.35, T.mmano0 - 0.05, T.mmano0 + 0.1);
    if (cuelga > 0) { const r = Tr({ x: 432, y: 720 }); l = mezcla(l, r, cuelga); lpu = Math.max(lpu, cuelga); lang = lerp(lang, -0.08, cuelga); }
    // apoya la mano en la cabeza de Guillermo y se deja caer
    const apoya = tramo(t, T.mmano0, T.mmano1);
    if (apoya > 0 && pG) {
      const top = cabezaGPantalla(pG, t);
      const q = MB.aHoja(p, { x: top.x + 4, y: top.y - 4 });
      l = mezcla(l, q, apoya); lpu = Math.max(lpu, apoya); lang = lerp(lang, -0.5, apoya); lmu = lerp(lmu, -2.2, apoya);
    }
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: -1, puno: 1, objeto: botella,
      dedos: { pulgar: 0.4, indice: 0.38, medio: 0.38, anular: 0.38, menique: 0.38 } };
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: ldob, puno: lpu };
    if (apoya > 0) p.manoLejos.dedos = { pulgar: 0.9 * apoya, indice: 0.95 * apoya, medio: 0.95 * apoya, anular: 0.95 * apoya, menique: 0.9 * apoya };
    const ex = guion(GUION_CARA_M, CARAS_M, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [0.55, 2.3, 3.6, 5.8, 8.4, 10.6, 11.55, 13.0]));
    return p;
  }

  /* ---------- botella deportiva (unidades de mano; el tapón va hacia −y) ---------- */
  function botella(g) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.4;
    g.translate(0, -15);
    // cuerpo
    g.beginPath(); g.moveTo(-6.5, -16); g.quadraticCurveTo(-7.5, -12, -7, -6); g.lineTo(-6.6, 14); g.quadraticCurveTo(-6.6, 17, -3.5, 17);
    g.lineTo(3.5, 17); g.quadraticCurveTo(6.6, 17, 6.6, 14); g.lineTo(7, -6); g.quadraticCurveTo(7.5, -12, 6.5, -16); g.closePath();
    g.fillStyle = "#d8232f"; g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.45)"; g.fillRect(-4.5, -12, 2, 24);
    g.fillStyle = "#a3141f"; g.fillRect(-6.8, -2, 13.6, 3); g.fillRect(-6.8, 5, 13.6, 3);
    // tapón y boquilla
    g.beginPath(); g.rect(-5.5, -21, 11, 5); g.fillStyle = "#eef1f4"; g.fill(); g.stroke();
    g.beginPath(); g.rect(-2, -26, 4, 5); g.fillStyle = "#f9fafb"; g.fill(); g.stroke();
    g.restore();
  }

  /* ---------- coronilla de Guillermo en pantalla (con el aplastamiento aplicado) ---------- */
  function aplasto(t) {
    const k = tramo(t, T.aplasta0, T.aplasta1, salida);
    const reb = t > T.aplasta1 ? Math.exp(-(t - T.aplasta1) * 7) * Math.sin((t - T.aplasta1) * 22) : 0;
    return { sy: 1 - 0.5 * k + 0.05 * reb, sx: 1 + 0.28 * k - 0.03 * reb, k };
  }
  function cabezaGPantalla(pG, t) {
    const q = G.aPantalla(pG, G.cabeza(pG).a(CABEZA_G)), a = aplasto(t);
    return { x: pG.x + (q.x - pG.x) * a.sx, y: SUELO + (q.y - SUELO) * a.sy };
  }

  /* ---------- Guillermo con la vuelta (salto) y el aplastamiento ---------- */
  function dibG(g, p, t) {
    g.save();
    const u = fase(t, T.gira0, T.gira1);
    if (u > 0 && u < 1) {                       // se da la vuelta de un saltito: se estrecha hasta 0 y sale reflejado
      const kx = Math.max(0.02, Math.abs(Math.cos(Math.PI * u))), alto = 26 * Math.sin(Math.PI * u);
      g.translate(p.x, 0); g.scale(kx, 1); g.translate(-p.x, -alto);
    }
    const a = aplasto(t);
    if (a.k > 0) { g.translate(p.x, SUELO); g.scale(a.sx, a.sy); g.translate(-p.x, -SUELO); }
    G.dibujar(g, p, t);
    g.restore();
  }
  // mientras Marcos lo sujeta, Guillermo se coloca para que su cinturilla quede bajo el puño
  function colocaG(pG, t) {
    const w = suave(fase(t, T.agarra, T.alza0 + 0.14)) * (1 - suave(fase(t, T.baja1 - 0.2, T.baja1 + 0.02)));
    if (w <= 0) return;
    const F = puñoM(t), wb = G.aPantalla(pG, WB);
    pG.x += (F.x - wb.x) * w; pG.suelo += (F.y + BAJO_PUNO - wb.y) * w;
  }

  /* =====================================================================================
   * DECORADO: gimnasio del parque de bomberos
   * ===================================================================================== */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 240; c.height = H + 120; const g = c.getContext("2d");
    g.translate(120, 60);
    // pared de bloques color crema
    const pared = g.createLinearGradient(0, -60, 0, 470); pared.addColorStop(0, "#d9cfb8"); pared.addColorStop(1, "#c8bb9d");
    g.fillStyle = pared; g.fillRect(-120, -60, W + 240, 540);
    g.strokeStyle = "rgba(90,70,40,0.18)"; g.lineWidth = 2;
    for (let y = -50; y < 300; y += 34) { g.beginPath(); g.moveTo(-120, y); g.lineTo(W + 120, y); g.stroke();
      const off = Math.round((y + 50) / 34) % 2 ? 0 : 50; for (let x = off - 200; x < W + 120; x += 100) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 34); g.stroke(); } }
    // franja roja de bomberos con cinta de peligro
    g.fillStyle = "#b5161f"; g.fillRect(-120, 300, W + 240, 132);
    g.fillStyle = "#d42a2f"; g.fillRect(-120, 300, W + 240, 10);
    g.save(); g.beginPath(); g.rect(-120, 432, W + 240, 18); g.clip();
    g.fillStyle = "#f6c419"; g.fillRect(-120, 432, W + 240, 18); g.fillStyle = "#1a1a1e";
    for (let x = -140; x < W + 140; x += 36) { g.beginPath(); g.moveTo(x, 450); g.lineTo(x + 18, 432); g.lineTo(x + 34, 432); g.lineTo(x + 16, 450); g.closePath(); g.fill(); }
    g.restore();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.beginPath(); g.moveTo(-120, 300); g.lineTo(W + 120, 300); g.moveTo(-120, 432); g.lineTo(W + 120, 432); g.moveTo(-120, 450); g.lineTo(W + 120, 450); g.stroke();
    // ventanas altas con luz de día
    for (const wx of [560, 760]) {
      g.fillStyle = "#26303a"; g.fillRect(wx - 4, 8, 148, 96);
      const cielo = g.createLinearGradient(0, 12, 0, 100); cielo.addColorStop(0, "#9fd2f2"); cielo.addColorStop(1, "#dff1fb");
      g.fillStyle = cielo; g.fillRect(wx, 12, 140, 88);
      g.strokeStyle = "#26303a"; g.lineWidth = 5; g.beginPath(); g.moveTo(wx + 70, 12); g.lineTo(wx + 70, 100); g.moveTo(wx, 56); g.lineTo(wx + 140, 56); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.5)"; g.beginPath(); g.moveTo(wx + 8, 96); g.lineTo(wx + 40, 16); g.lineTo(wx + 54, 16); g.lineTo(wx + 22, 96); g.closePath(); g.fill();
      g.lineWidth = 3; g.strokeStyle = "#0b0a0e"; g.strokeRect(wx - 4, 8, 148, 96);
      // rayo de luz
      const rayo = g.createLinearGradient(wx, 100, wx - 120, 480); rayo.addColorStop(0, "rgba(255,248,220,0.28)"); rayo.addColorStop(1, "rgba(255,248,220,0)");
      g.fillStyle = rayo; g.beginPath(); g.moveTo(wx, 100); g.lineTo(wx + 140, 100); g.lineTo(wx + 20, 520); g.lineTo(wx - 160, 520); g.closePath(); g.fill();
    }
    // reloj de pared (solo marcas)
    g.save(); g.translate(150, 70);
    g.fillStyle = "#f7f3ea"; g.beginPath(); g.arc(0, 0, 34, 0, Math.PI * 2); g.fill(); g.lineWidth = 6; g.strokeStyle = "#b5161f"; g.stroke();
    g.lineWidth = 2; g.strokeStyle = "#0b0a0e"; g.beginPath(); g.arc(0, 0, 37, 0, Math.PI * 2); g.stroke();
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.lineWidth = i % 3 ? 2 : 4; g.beginPath(); g.moveTo(Math.cos(a) * 26, Math.sin(a) * 26); g.lineTo(Math.cos(a) * 31, Math.sin(a) * 31); g.stroke(); }
    g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(13, -9); g.moveTo(0, 0); g.lineTo(-4, -22); g.stroke();
    g.fillStyle = "#0b0a0e"; g.beginPath(); g.arc(0, 0, 3, 0, Math.PI * 2); g.fill(); g.restore();
    // escudo de bomberos (llama dentro de un escudo, sin letras)
    g.save(); g.translate(400, 150);
    g.beginPath(); g.moveTo(0, -46); g.lineTo(38, -30); g.quadraticCurveTo(38, 30, 0, 52); g.quadraticCurveTo(-38, 30, -38, -30); g.closePath();
    g.fillStyle = "#b5161f"; g.fill(); g.lineWidth = 4; g.strokeStyle = "#f6c419"; g.stroke(); g.lineWidth = 2; g.strokeStyle = "#0b0a0e"; g.stroke();
    g.beginPath(); g.moveTo(0, 32); g.bezierCurveTo(-22, 22, -16, 0, -6, -10); g.bezierCurveTo(-6, 0, 0, 2, 2, -4); g.bezierCurveTo(4, -16, 0, -24, 6, -32);
    g.bezierCurveTo(14, -16, 24, 4, 14, 22); g.quadraticCurveTo(8, 32, 0, 32); g.closePath(); g.fillStyle = "#f6c419"; g.fill(); g.stroke();
    g.beginPath(); g.moveTo(1, 26); g.bezierCurveTo(-9, 18, -5, 6, 0, 0); g.bezierCurveTo(4, 8, 10, 14, 6, 24); g.closePath(); g.fillStyle = "#ff8a1e"; g.fill();
    g.restore();
    // casco de repuesto y manguera enrollada colgados en la pared
    g.save(); g.translate(930, 190);
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.fillStyle = "#8a8f99"; g.beginPath(); g.arc(0, -40, 6, 0, Math.PI * 2); g.fill(); g.stroke();
    for (let k = 0; k < 3; k++) { g.lineWidth = 12; g.strokeStyle = "#0b0a0e"; g.beginPath(); g.ellipse(0, 6 + k * 4, 46 - k * 5, 52 - k * 4, 0, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 8; g.strokeStyle = k % 2 ? "#a3141f" : "#c9202c"; g.stroke(); }
    g.restore();
    g.save(); g.translate(30, 210);
    g.fillStyle = "#f6c419"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(-34, 18); g.quadraticCurveTo(-36, -30, 0, -32); g.quadraticCurveTo(36, -30, 34, 18); g.lineTo(46, 22); g.quadraticCurveTo(0, 30, -46, 22); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#d9a90c"; g.beginPath(); g.moveTo(-6, -31); g.lineTo(6, -31); g.lineTo(5, 16); g.lineTo(-5, 16); g.closePath(); g.fill(); g.stroke();
    g.restore();
    // estantería de mancuernas al fondo (izquierda)
    g.save(); g.translate(40, 380);
    g.fillStyle = "#2b2c33"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 3;
    g.fillRect(-10, -6, 210, 10); g.strokeRect(-10, -6, 210, 10); g.fillRect(-10, 40, 210, 10); g.strokeRect(-10, 40, 210, 10);
    g.fillRect(-6, -6, 10, 98); g.fillRect(186, -6, 10, 98);
    const manc = (x, y, r) => { g.fillStyle = "#1c1c22"; g.beginPath(); g.roundRect ? g.roundRect(x - r * 1.6, y - r, r * 0.9, r * 2, 3) : g.rect(x - r * 1.6, y - r, r * 0.9, r * 2); g.fill(); g.stroke();
      g.beginPath(); g.roundRect ? g.roundRect(x + r * 0.7, y - r, r * 0.9, r * 2, 3) : g.rect(x + r * 0.7, y - r, r * 0.9, r * 2); g.fill(); g.stroke();
      g.fillStyle = "#b9bec6"; g.fillRect(x - r * 0.7, y - 2.5, r * 1.4, 5); g.strokeRect(x - r * 0.7, y - 2.5, r * 1.4, 5); };
    for (let i = 0; i < 5; i++) { manc(20 + i * 40, -16, 7 + i); manc(20 + i * 40, 30, 8 + i); }
    g.restore();
    // pesas rusas en el suelo, a la derecha
    for (const [kx, kr, col] of [[700, 15, "#b5161f"], [742, 19, "#1f1f26"], [790, 13, "#f6c419"]]) {
      g.fillStyle = col; g.strokeStyle = "#0b0a0e"; g.lineWidth = 3;
      g.beginPath(); g.arc(kx, 478 - kr, kr, 0, Math.PI * 2); g.fill(); g.stroke();
      g.lineWidth = 5; g.beginPath(); g.arc(kx, 478 - kr * 2.1, kr * 0.6, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.ellipse(kx - kr * 0.4, 478 - kr * 1.3, kr * 0.25, kr * 0.15, -0.5, 0, Math.PI * 2); g.fill();
    }
    // suelo de caucho negro con motas
    const su = g.createLinearGradient(0, 450, 0, H + 60); su.addColorStop(0, "#3a3b42"); su.addColorStop(1, "#1d1e23");
    g.fillStyle = su; g.fillRect(-120, 450, W + 240, H + 60 - 450);
    g.fillStyle = "rgba(255,255,255,0.1)";
    for (let i = 0; i < 220; i++) { const x = -120 + hash(i * 3.1) * (W + 240), y = 455 + hash(i * 7.3) * (H + 50 - 455); g.fillRect(x, y, 2, 2); }
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 2;
    for (let x = -120; x < W + 160; x += 128) { g.beginPath(); g.moveTo(x, 452); g.lineTo(x - 30, H + 60); g.stroke(); }
    g.beginPath(); g.moveTo(-120, 512); g.lineTo(W + 120, 512); g.stroke();
    // jaula de sentadillas: los dos postes (detrás de Guillermo)
    for (const px of [G0 - GANCHO - 12, G0 + GANCHO + 12]) {
      g.fillStyle = "#2e2f37"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 3;
      g.fillRect(px - 8, 214, 16, SUELO - 214 + 4); g.strokeRect(px - 8, 214, 16, SUELO - 214 + 4);
      g.fillStyle = "#4a4c56"; g.fillRect(px - 6, 214, 4, SUELO - 214);
      g.fillStyle = "#0b0a0e"; for (let y = 240; y < SUELO - 20; y += 22) { g.beginPath(); g.arc(px, y, 2.2, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = "#2e2f37"; g.fillRect(px - 16, SUELO - 4, 32, 10); g.strokeRect(px - 16, SUELO - 4, 32, 10);
    }
    g.fillStyle = "#2e2f37"; g.fillRect(G0 - GANCHO - 20, 206, 2 * GANCHO + 40, 12); g.strokeStyle = "#0b0a0e"; g.strokeRect(G0 - GANCHO - 20, 206, 2 * GANCHO + 40, 12);
    // viñeta
    const v = g.createRadialGradient(512, 320, 280, 512, 320, 700); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.42)");
    g.fillStyle = v; g.fillRect(-120, -60, W + 240, H + 120);
    return c;
  }

  /* ---------- barra con discos ---------- */
  function dibBarra(g, t) {
    const pts = []; for (let i = 0; i <= 24; i++) { const x = G0 - HALF + 2 * HALF * i / 24; pts.push({ x, y: barraY(x, t) }); }
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    const camino = () => { g.beginPath(); M2.curva(g, pts, false, 0.5); };
    camino(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 10; g.stroke();
    camino(); g.strokeStyle = "#c9ced6"; g.lineWidth = 5.5; g.stroke();
    g.save(); g.translate(0, -1.5); camino(); g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 1.6; g.stroke(); g.restore();
    // ganchos de la jaula (por delante de la barra)
    for (const sg of [-1, 1]) {
      const x = G0 + sg * (GANCHO + 12);
      g.fillStyle = "#3a3c45"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(x - 9, BAR_Y - 10); g.lineTo(x + 9, BAR_Y - 10); g.lineTo(x + 9, BAR_Y + 8); g.lineTo(x - 2 * sg, BAR_Y + 8); g.closePath(); g.fill(); g.stroke();
    }
    // discos: grande rojo y pequeño azul a cada lado, se inclinan con el extremo de la barra
    for (const sg of [-1, 1]) {
      const x0 = G0 + sg * (GANCHO + 34), y0 = barraY(x0, t), ycol = barraY(G0 + sg * (GANCHO + 22), t);
      const inc = Math.atan2(barraY(G0 + sg * HALF, t) - barraY(G0 + sg * (GANCHO + 12), t), sg * (HALF - GANCHO - 12));
      // collarín
      g.save(); g.translate(G0 + sg * (GANCHO + 22), ycol); g.rotate(inc);
      g.fillStyle = "#b9bec6"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.fillRect(-4, -9, 8, 18); g.strokeRect(-4, -9, 8, 18); g.restore();
      for (const [dx, h, w, col, col2] of [[0, 62, 16, "#c4151f", "#8f0d16"], [sg * 18, 44, 11, "#1e57b8", "#163f86"]]) {
        g.save(); g.translate(x0 + dx, y0 + dx * Math.tan(inc)); g.rotate(inc);
        g.fillStyle = col; g.strokeStyle = "#0b0a0e"; g.lineWidth = 3;
        g.beginPath(); g.roundRect ? g.roundRect(-w / 2, -h, w, 2 * h, 5) : g.rect(-w / 2, -h, w, 2 * h); g.fill(); g.stroke();
        g.fillStyle = col2; g.fillRect(w * 0.1, -h + 4, w * 0.35, 2 * h - 8);
        g.fillStyle = "rgba(255,255,255,0.3)"; g.fillRect(-w * 0.38, -h + 5, w * 0.18, 2 * h - 10);
        g.restore();
      }
      // tope del extremo
      g.save(); g.translate(G0 + sg * HALF, barraY(G0 + sg * HALF, t)); g.rotate(inc);
      g.fillStyle = "#c9ced6"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.fillRect(-3, -6, 6, 12); g.strokeRect(-3, -6, 6, 12); g.restore();
    }
    g.restore();
  }
  // puños de Guillermo encima de la barra (la mano del montaje se oculta mientras agarra)
  const COL_G = { piel: G.C.piel, sombra: G.C.pielSombra, tinta: G.C.tinta };
  function punosBarra(g, p, t) {
    if (p.agarraBarra <= 0.01) return;
    for (const m of [p.manoLejos, p.manoCerca]) {
      g.save();
      g.translate(p.x, p.suelo); g.scale(p.espejo ? -p.s : p.s, p.s); g.translate(-G.PELVIS.x, -G.SUELO);
      g.translate(m.x, m.y); g.rotate(m.ang || 0); g.scale(G.JK, G.JK);
      Personaje2D.puno(g, 0, COL_G);
      g.restore();
    }
  }

  /* ---------- efectos ---------- */
  // giro de un saltito: dos estelas blancas alrededor del cuerpo
  function estelaGiro(g, t, p) {
    const u = fase(t, T.gira0 - 0.04, T.gira1 + 0.08); if (u <= 0 || u >= 1) return;
    const c = G.aPantalla(p, G.tronco(p)({ x: 250, y: 520 })), a = Math.sin(Math.PI * u);
    g.save(); g.strokeStyle = "#ffffff"; g.lineCap = "round"; g.globalAlpha = 0.9 * a;
    for (let i = 0; i < 2; i++) {
      const y = c.y - 40 + i * 70, r = 46 + 6 * i, a0 = Math.PI * (0.15 + 1.1 * u), a1 = a0 + 1.6;
      g.lineWidth = 3.5 - i; g.beginPath(); g.ellipse(c.x, y, r, r * 0.28, 0, a0, a1); g.stroke();
    }
    g.restore();
  }
  function estrellaPuntas(g, x, y, r, puntas, rot, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function magnesio(g, t, p) {
    const k = fase(t, T.frota0 + 0.2, T.frota0 + 1.1); if (k <= 0 || k >= 1) return;
    const c = G.aPantalla(p, p.manoCerca);
    g.save();
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (hash(i + 40) - 0.5) * 2.6, d = 6 + 34 * salida(k) * (0.5 + hash(i + 41));
      g.globalAlpha = 0.55 * (1 - k); g.fillStyle = "#fbfbf6";
      g.beginPath(); g.arc(c.x + Math.cos(a) * d, c.y + Math.sin(a) * d - 10 * k, 4 + 7 * k * hash(i + 42), 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  function lineasEsfuerzo(g, t, centro, k) {
    if (k <= 0.01) return;
    g.save(); g.strokeStyle = "#ffffff"; g.lineWidth = 2.6; g.lineCap = "round"; g.globalAlpha = 0.85 * k;
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (i - 2.5) * 0.42, ph = ((t * 3 + i * 0.37) % 1), r0 = 58 + 10 * ph, r1 = r0 + 12;
      g.beginPath(); g.moveTo(centro.x + Math.cos(a) * r0, centro.y + Math.sin(a) * r0); g.lineTo(centro.x + Math.cos(a) * r1, centro.y + Math.sin(a) * r1); g.stroke();
    }
    g.restore();
  }
  function vibraBarra(g, t) {
    const k = fase(t, T.suelta, T.suelta + 0.5); if (k <= 0 || k >= 1) return;
    g.save(); g.strokeStyle = "#ffffff"; g.lineWidth = 2.5; g.lineCap = "round"; g.globalAlpha = (1 - k) * suave(fase(t, T.suelta, T.suelta + 0.06));
    for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) {
      const x = G0 + sg * (36 + i * 16), y = BAR_Y - 18 - 6 * k;
      g.beginPath(); g.moveTo(x - 5, y - 4); g.quadraticCurveTo(x, y - 9, x + 5, y - 4); g.stroke();
    }
    // chispazo de los ganchos
    for (const sg of [-1, 1]) { const x = G0 + sg * (GANCHO + 12), y = BAR_Y - 8;
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.5, d0 = 8 + 14 * k, d1 = d0 + 8;
        g.strokeStyle = i % 2 ? "#fff6c0" : "#ffb02e"; g.beginPath(); g.moveTo(x + Math.cos(a) * d0, y + Math.sin(a) * d0); g.lineTo(x + Math.cos(a) * d1, y + Math.sin(a) * d1); g.stroke(); } }
    g.restore();
  }
  // chasquido de la cinturilla al soltarla
  function cinturilla(g, t, pG) {
    if (!agarrado(t) && !(t >= T.suelta2 && t < T.suelta2 + 0.25)) return;
    const wb = G.aPantalla(pG, WB);
    // chasquido al soltar
    const k = fase(t, T.suelta2, T.suelta2 + 0.3);
    if (k > 0 && k < 1) {
      g.save(); g.strokeStyle = "#ffffff"; g.lineWidth = 2.5; g.lineCap = "round"; g.globalAlpha = 1 - k;
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.55, d0 = 10 + 16 * k, d1 = d0 + 9;
        g.beginPath(); g.moveTo(wb.x + Math.cos(a) * d0, wb.y + Math.sin(a) * d0); g.lineTo(wb.x + Math.cos(a) * d1, wb.y + Math.sin(a) * d1); g.stroke(); }
      g.restore();
    }
  }
  function estrellitas(g, t, p, k, centroExtra) {
    if (k <= 0.01) return;
    const c0 = G.aPantalla(p, G.cabeza(p).a({ x: 790, y: 330 }));
    const c = centroExtra ? centroExtra(c0) : c0;
    const pts = [];
    for (let i = 0; i < 5; i++) { const a = t * 4.2 + i * Math.PI * 2 / 5; pts.push({ a, x: c.x + Math.cos(a) * 54, y: c.y - 26 + Math.sin(a) * 14, z: Math.sin(a) }); }
    pts.sort((u, v) => u.z - v.z);
    g.save();
    for (const q of pts) { const r = (8 + 2.5 * q.z) * k; estrellaPuntas(g, q.x, q.y, r, 5, t * 3 + q.a, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2; g.strokeStyle = "#0b0a0e"; g.stroke(); }
    g.restore();
  }
  function aplastamiento(g, t, p) {
    const k = fase(t, T.aplasta0, T.aplasta0 + 0.4); if (k <= 0 || k >= 1) return;
    g.save(); g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.lineCap = "round"; g.globalAlpha = 1 - k;
    const y = SUELO - 70;
    for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) {
      const x0 = p.x + sg * (70 + 18 * k + i * 4), yy = y - 30 + i * 30;
      g.beginPath(); g.moveTo(x0, yy); g.lineTo(x0 + sg * 22, yy + (i - 1) * 6); g.stroke();
    }
    g.restore();
    // polvo
    g.save();
    for (let i = 0; i < 7; i++) { const sg = i % 2 ? 1 : -1, d = (40 + 70 * salida(k)) * (0.6 + hash(i + 70) * 0.6);
      g.globalAlpha = 0.35 * (1 - k); g.fillStyle = "#cfc8bd";
      g.beginPath(); g.ellipse(p.x + sg * d, SUELO - 6 - 14 * k * hash(i + 71), 12 + 16 * k, 6 + 8 * k, 0, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const tira = tramoDentro(t, T.tira, T.maxi, T.suelta + 0.2, T.atras1);
    const tira2 = tramoDentro(t, T.tiraM0, T.tiraM1, T.fin - 0.2, T.fin + 0.6);
    const golpe = t >= T.aplasta0 ? Math.exp(-(t - T.aplasta0) * 6) * suave(fase(t, T.aplasta0, T.aplasta0 + 0.04)) : 0;
    return { k: 1 + 0.07 * tira + 0.06 * tira2 + 0.02 * golpe, x: 512 - 150 * tira + 70 * tira2, y: 300 + 40 * tira + 30 * tira2 };
  }

  class GuillermoPesas extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !MB.listo()) return;
      if (!fondo) fondo = creaFondo();
      if (!GEO) preparaGeo();
      const pM0 = poseM(t, null);                 // Marcos sin depender de Guillermo (para el dobladillo)
      const pG = poseG(t, pM0);
      colocaG(pG, t);
      const pM = poseM(t, pG);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = (t >= T.suelta ? 2.5 * Math.exp(-(t - T.suelta) * 9) * suave(fase(t, T.suelta, T.suelta + 0.05)) : 0)
        + (t >= T.aplasta0 ? 5 * Math.exp(-(t - T.aplasta0) * 7) * suave(fase(t, T.aplasta0, T.aplasta0 + 0.05)) : 0);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -120, -60);
      // sombras
      const a = aplasto(t);
      g.save(); g.fillStyle = "rgba(0,0,0,0.35)";
      const altoG = SUELO - (pG.suelo);                    // colgado: la sombra se encoge
      g.beginPath(); g.ellipse(pG.x - 4, SUELO + 2, (62 - Math.min(30, -altoG * 0.25)) * a.sx, 7, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pM.x + 2, SUELO + 2, 70, 7, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(G0, SUELO + 2, HALF + 10, 6, 0, 0, Math.PI * 2); g.fill();
      g.restore();
      const segunda = t >= (T.sacude0 + 0.02);
      if (!segunda) {
        dibG(g, pG, t);
        dibBarra(g, t);
        punosBarra(g, pG, t);
        cinturilla(g, t, pG);
        MB.dibujar(g, pM, t);
      } else {
        dibBarra(g, t);
        MB.dibujar(g, pM, t);
        dibG(g, pG, t);
        // el brazo de Marcos que se apoya en la cabeza va por delante de Guillermo
        if (t >= T.mmano0) {
          const T_ = MB.tronco(pM), h = MB.aPantalla(pM, T_(MB.HOMBRO)), m = MB.aPantalla(pM, pM.manoLejos);
          const dx = m.x - h.x, dy = m.y - h.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, r = 30;
          const ini = { x: h.x + dx * 0.32, y: h.y + dy * 0.32 }, fin = { x: m.x + dx / L * 22, y: m.y + dy / L * 22 };
          g.save(); g.beginPath();
          g.moveTo(ini.x + nx * r, ini.y + ny * r); g.lineTo(fin.x + nx * r, fin.y + ny * r); g.lineTo(fin.x - nx * r, fin.y - ny * r); g.lineTo(ini.x - nx * r, ini.y - ny * r); g.closePath();
          g.clip(); MB.dibujar(g, pM, t); g.restore();
        }
      }
      magnesio(g, t, pG);
      estelaGiro(g, t, pG);
      const cabG = G.aPantalla(pG, G.centroCabeza(pG));
      lineasEsfuerzo(g, t, cabG, tramoDentro(t, T.maxi - 0.2, T.maxi, T.suelta - 0.1, T.suelta) + tramoDentro(t, T.tiraM0 + 0.5, T.tiraM0 + 0.7, T.aplasta0 - 0.1, T.aplasta0));
      vibraBarra(g, t);
      estrellitas(g, t, pG, tramoDentro(t, T.mareo0 + 0.2, T.mareo0 + 0.5, T.sacude0, T.sacude1));
      estrellitas(g, t, pG, tramoDentro(t, T.aplasta1 + 0.3, T.aplasta1 + 0.6, T.fin, T.fin + 0.5),
        c => ({ x: pG.x + (c.x - pG.x) * a.sx, y: SUELO + (c.y - SUELO) * a.sy }));
      aplastamiento(g, t, pG);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00025", nombre: "Guillermo y Marcos · Las pesas", crear: () => new GuillermoPesas() });
  window.__A2D_00025 = { pose: t => { const pG = poseG(t, poseM(t, null)); colocaG(pG, t); return { g: pG, m: poseM(t, pG) }; }, T, DUR, geo: () => (GEO || preparaGeo(), GEO) };
})();
