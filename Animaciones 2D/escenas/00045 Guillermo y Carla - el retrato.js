"use strict";
/* 00045 · Guillermo y Carla · El retrato
 *
 * Negro → estudio de pintor en una buhardilla: ventanal con tejados, cortina granate de modelo,
 * cuadros en la pared y el suelo lleno de salpicaduras. Guillermo posa de héroe subido a un taburete:
 * pecho fuera, barbilla arriba, una mano en la cadera y el otro brazo señalando al horizonte. Carla,
 * en el caballete (vemos la parte de atrás del lienzo), le mide con el pincel guiñando un ojo y se
 * pone a pintar con la lengua fuera → Guillermo aguanta la pose cada vez más: le tiembla el brazo,
 * suda, se pone rojo… una mosca le ronda y se le posa en la nariz; él ni se mueve: tic en el ojo,
 * mofletes hinchados y un soplido de lado que no la espanta → Carla pinta a lo loco, se aparta a
 * mirar con la cabeza ladeada, remata con una floritura y gira el lienzo → Guillermo, aliviado y
 * expectante, ve el cuadro: un muñequito de palotes con el pelo de pinchos y una sonrisa enorme.
 * Se le cae la mandíbula y mira a cámara → Carla, orgullosísima, le añade un corazoncito rojo y
 * guiña un ojo → él señala el cuadro y se señala a sí mismo, ella asiente encantada, y él se encoge
 * de hombros con una sonrisa resignada → negro.
 *
 * Sin textos ni firmas: el cuadro es un garabato infantil. Todo depende del tiempo absoluto. La
 * punta del pincel de Carla, la mosca en la nariz de Guillermo y el corazón se calculan a partir de
 * las posturas.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, tramo, mezcla, ruido, hash } = M2;
  const G = Guillermo, CA = Carla;
  const S = 0.30, SUELO = 540;
  const KC = S * CA.K;                                   // escala en pantalla de la hoja de Carla
  const DUR = 14.0;
  const T = {
    // Carla
    mide0: 0.9, mide1: 1.95, pinta0: 2.25, atras0: 4.75, atras1: 5.2, vuelve0: 5.75, vuelve1: 6.2, pinta2: 6.35,
    flor0: 7.32, flor1: 7.62, alto: 7.85, agarra: 8.38, gira0: 8.5, gira1: 9.05, presenta: 8.75,
    corazon0: 10.45, corazon1: 11.15, orgullo: 11.3, guino: 11.75, asiente0: 12.05, asiente1: 12.6,
    // Guillermo
    guinoG: 1.2, tiembla0: 2.6, mosca0: 4.3, posa: 5.95, aguanta: 6.4, sopla: 7.1, relaja0: 8.42, relaja1: 8.8,
    ve: 9.15, camaraG: 10.1, senala0: 11.15, yo0: 11.7, encoge: 12.45,
    fin: 13.25
  };

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  // pista de fotogramas clave: [t, {campos}] con transiciones suaves entre claves consecutivas
  function pista(claves, t) {
    if (t <= claves[0][0]) return Object.assign({}, claves[0][1]);
    for (let i = 0; i < claves.length - 1; i++) {
      const [t0, a] = claves[i], [t1, b] = claves[i + 1];
      if (t <= t1) { const k = suave(fase(t, t0, t1)), o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; }
    }
    return Object.assign({}, claves[claves.length - 1][1]);
  }
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const ABIERTA = D(1, 1), RELAJADA = D(0.55, 0.6, 0.55, 0.5, 0.45), PUNO = D(0.05, 0), SENALA = D(0.15, 1, 0, 0, 0),
    AGARRA = D(0.4, 0.42, 0.4, 0.38, 0.36), FROTA = D(0.7, 0.85, 0.8, 0.75, 0.7);

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

  /* =====================================================================================
   * DECORADO: caballete y lienzo (pantalla)
   * ===================================================================================== */
  const LZ = { x: 640, y: 333, w: 150, h: 118 };          // lienzo: centro y tamaño de frente
  const LZ_X0 = LZ.x - LZ.w / 2, LZ_X1 = LZ.x + LZ.w / 2, LZ_Y0 = LZ.y - LZ.h / 2, LZ_Y1 = LZ.y + LZ.h / 2;
  const CORAZON = { x: 47, y: -36, r: 9 };                 // corazón en el lienzo (respecto al centro)
  // giro del lienzo sobre el caballete: escala horizontal (1 → −1)
  const escLienzo = t => Math.cos(Math.PI * suave(fase(t, T.gira0, T.gira1)));
  const girado = t => t >= (T.gira0 + T.gira1) / 2;

  /* =====================================================================================
   * CARLA (a la derecha, en espejo: mira a la izquierda, hacia el caballete y Guillermo)
   * ===================================================================================== */
  const XC = 788, XC_ATRAS = 832;
  const TOB_C = CA.SUELO - CA.TOBILLO_ALTO;
  const PIES_C = { cerca: 186, lejos: 316 };              // x de los tobillos en su hoja (de pie)
  // pasos: [t0, t1, x de la pelvis en pantalla] de cada pie (el pie se levanta en arco)
  const PASOS_C = {
    lejos: [[-10, -9, XC], [T.atras0, T.atras0 + 0.24, XC_ATRAS], [T.vuelve0 + 0.2, T.vuelve1, XC]],
    cerca: [[-10, -9, XC], [T.atras0 + 0.18, T.atras1, XC_ATRAS], [T.vuelve0, T.vuelve0 + 0.24, XC]]
  };
  function pie(lista, t, alto) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    return { x: lerp(xa, x, suave5(u)), alza: alto * Math.sin(Math.PI * u), u };
  }

  const CARAS_C = {
    inicio: E({ mx: 0.85, my: -0.15, c: 0.15, sd: 6, gd: 0.04, si: 6, gi: 0.04, sonr: 0.45, ancho: 0.85 }),
    mide: E({ mx: 0.9, my: -0.25, c: 0.1, wd: 0.85, sd: -4, gd: -0.08, si: 14, gi: 0.1, abre: 4, ancho: 0.55, sonr: 0.05, lengua: 0.6 }),
    pinta: E({ mx: 0.9, my: 0.3, c: 0.22, sd: 4, gd: -0.05, si: 6, gi: -0.02, abre: 4, ancho: 0.55, sonr: 0.2, lengua: 0.7 }),
    miraG: E({ mx: 0.85, my: -0.25, c: 0.1, sd: 12, gd: 0.06, si: 12, gi: 0.06, sonr: 0.4, ancho: 0.8 }),
    admira: E({ mx: 0.9, my: 0.25, c: 0.45, h: 0.5, sd: 14, gd: 0.1, si: 4, gi: -0.05, sonr: 0.55, ancho: 0.8 }),
    frenetica: E({ mx: 0.9, my: 0.28, iris: 1.12, sd: 20, gd: 0.12, si: 20, gi: 0.12, abre: 12, ancho: 0.8, sonr: 0.65, lengua: 0.5 }),
    flor: E({ mx: 0.9, my: 0.1, c: 0.6, h: 1, sd: 16, gd: 0.1, si: 16, gi: 0.1, abre: 14, ancho: 0.95, sonr: 0.95 }),
    orgullo: E({ mx: -0.85, my: -0.05, c: 0.55, h: 1, sd: 12, gd: 0.08, si: 12, gi: 0.08, abre: 4, sonr: 0.9, ancho: 0.95 }),
    presenta: E({ mx: 0.85, my: -0.25, c: 0.05, sd: 18, gd: 0.1, si: 18, gi: 0.1, abre: 22, ancho: 1.05, sonr: 1 }),
    corazon: E({ mx: 0.9, my: 0.15, c: 0.2, sd: 8, gd: 0.04, si: 8, gi: 0.04, abre: 2, ancho: 0.6, sonr: 0.65, lengua: 0.35 }),
    guino: E({ mx: -0.85, my: -0.05, c: 0.2, wi: 0.78, sd: 14, gd: 0.08, si: -4, gi: -0.05, abre: 6, ancho: 1, sonr: 0.95 }),
    asiente: E({ mx: 0.85, my: -0.2, c: 0.55, h: 1, sd: 16, gd: 0.1, si: 16, gi: 0.1, abre: 20, ancho: 1.1, sonr: 1 })
  };
  const GUION_CARA_C = [
    [0.4, 0.7, "inicio"], [T.mide0, T.mide0 + 0.2, "mide"], [T.mide1, T.mide1 + 0.2, "pinta"], [3.0, 3.15, "miraG"], [3.35, 3.5, "pinta"],
    [4.2, 4.35, "miraG"], [4.5, 4.65, "pinta"], [T.atras0 + 0.1, T.atras1, "admira"], [5.5, 5.7, "miraG"], [T.pinta2 - 0.1, T.pinta2 + 0.1, "frenetica"],
    [T.flor0, T.flor0 + 0.15, "flor"], [T.alto, T.alto + 0.2, "orgullo"], [T.agarra, T.agarra + 0.2, "presenta"], [10.3, 10.5, "corazon"],
    [T.orgullo, T.orgullo + 0.2, "orgullo"], [T.guino - 0.05, T.guino + 0.1, "guino"], [T.guino + 0.35, T.guino + 0.5, "orgullo"],
    [T.asiente0, T.asiente0 + 0.15, "asiente"]
  ];
  // cuerpo: pel (hoja, + abajo), torso (+ hacia delante), cab
  const CUERPOS_C = {
    inicio: { pel: 0, torso: 0.03, cab: 0 },
    mide: { pel: 4, torso: -0.03, cab: -0.06 },
    pinta: { pel: 8, torso: 0.1, cab: 0.06 },
    admira: { pel: 6, torso: -0.07, cab: 0.2 },
    frenetica: { pel: 10, torso: 0.12, cab: 0.04 },
    alto: { pel: 2, torso: -0.05, cab: -0.08 },
    presenta: { pel: 4, torso: 0.02, cab: -0.04 },
    corazon: { pel: 8, torso: 0.1, cab: 0.06 },
    orgullo: { pel: 2, torso: -0.06, cab: -0.1 }
  };
  const GUION_CUERPO_C = [
    [T.mide0, T.mide0 + 0.25, "mide"], [T.mide1, T.pinta0 + 0.2, "pinta"], [T.atras0, T.atras1, "admira"], [T.vuelve0, T.vuelve1, "pinta"],
    [T.pinta2, T.pinta2 + 0.2, "frenetica"], [T.flor1, T.alto + 0.1, "alto"], [T.agarra - 0.05, T.presenta, "presenta"],
    [10.3, 10.55, "corazon"], [T.orgullo, T.orgullo + 0.25, "orgullo"]
  ];

  /* ---------- pincel y paleta ---------- */
  const L_PUNTA = 44;                                      // de la mano a la punta del pincel (unidades de jarra)
  const COLORES = ["#e2453a", "#2f7fd8", "#f2c230", "#3bb36a", "#9b4bd6"];
  // color de la punta: cambia en cada mojada
  const MOJADAS = [2.32, 3.52, 6.1, 6.92];
  const colorPunta = t => { let i = 0; for (const m of MOJADAS) if (t >= m) i++; return COLORES[(i + 1) % COLORES.length]; };
  function pincel(b, color) {
    return g => {
      const dx = Math.cos(b), dy = Math.sin(b), nx = -dy, ny = dx;
      g.save(); g.lineCap = "round"; g.lineJoin = "round";
      // mango de madera
      g.strokeStyle = "#0b0a0e"; g.lineWidth = 7.4; g.beginPath(); g.moveTo(-30 * dx, -30 * dy); g.lineTo(26 * dx, 26 * dy); g.stroke();
      g.strokeStyle = "#c0773a"; g.lineWidth = 4.2; g.stroke();
      g.strokeStyle = "rgba(255,220,170,0.7)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-28 * dx + nx, -28 * dy + ny); g.lineTo(22 * dx + nx, 22 * dy + ny); g.stroke();
      // virola metálica
      g.strokeStyle = "#0b0a0e"; g.lineWidth = 8.4; g.beginPath(); g.moveTo(26 * dx, 26 * dy); g.lineTo(33 * dx, 33 * dy); g.stroke();
      g.strokeStyle = "#c9ced6"; g.lineWidth = 5.4; g.stroke();
      // pelo del pincel con pintura
      g.beginPath(); g.moveTo(33 * dx + nx * 4, 33 * dy + ny * 4); g.quadraticCurveTo(40 * dx + nx * 4.4, 40 * dy + ny * 4.4, L_PUNTA * dx, L_PUNTA * dy);
      g.quadraticCurveTo(40 * dx - nx * 4.4, 40 * dy - ny * 4.4, 33 * dx - nx * 4, 33 * dy - ny * 4); g.closePath();
      g.fillStyle = color; g.fill(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.8; g.stroke();
      g.restore();
    };
  }
  // paleta de madera con manchas de color (en la mano cercana, hacia delante)
  function paleta(g) {
    g.save(); g.translate(30, 10); g.rotate(-0.12); g.lineJoin = "round";
    const forma = () => { g.beginPath(); g.moveTo(-40, -6); g.bezierCurveTo(-40, -30, 20, -34, 42, -18); g.bezierCurveTo(56, -8, 50, 16, 30, 22);
      g.bezierCurveTo(8, 30, -22, 30, -36, 18); g.bezierCurveTo(-24, 12, -24, 2, -40, -6); g.closePath(); };
    forma(); g.fillStyle = "#c9935c"; g.fill();
    g.save(); forma(); g.clip(); g.fillStyle = "#a8723f"; g.beginPath(); g.ellipse(10, 26, 52, 12, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(120,70,30,0.45)"; g.lineWidth = 1.2; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-34, -14 + i * 9); g.quadraticCurveTo(6, -20 + i * 9, 46, -8 + i * 8); g.stroke(); } g.restore();
    forma(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3.4; g.stroke();
    [[-14, -18, 6.5, 0], [4, -22, 6, 1], [22, -17, 6.5, 2], [36, -6, 5.5, 3], [32, 10, 6, 4], [14, 14, 5, 0]].forEach(([x, y, r, i]) => {
      g.fillStyle = COLORES[i]; g.beginPath(); g.ellipse(x, y, r, r * 0.8, 0.3, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.6; g.stroke();
      g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.arc(x - r * 0.3, y - r * 0.3, r * 0.25, 0, Math.PI * 2); g.fill();
    });
    g.restore();
  }

  // mano lejana de Carla (hoja): x, y, b (ángulo del pincel), mu (hacia la muñeca), pin (0..1 = dando pinceladas)
  const REPOSO = { x: 335, y: 452, b: -1.15, mu: 1.85, pin: 0, dob: 1 };
  const MIDE = { x: 612, y: 212, b: -Math.PI / 2, mu: Math.PI, pin: 0, dob: 1 };
  const MOJA = { x: 262, y: 470, b: 1.05, mu: -2.25, pin: 0, dob: 1 };
  const LIENZO_C = { x: 588, y: 440, b: -0.55, mu: 2.75, pin: 1, dob: 1 };
  const BARBILLA = { x: 352, y: 300, b: -1.35, mu: 1.95, pin: 0, dob: 1 };
  const FLOR_A = { x: 600, y: 380, b: -0.9, mu: 2.8, pin: 0, dob: 1 };
  const FLOR_B = { x: 472, y: 336, b: -1.0, mu: 2.4, pin: 0, dob: 1 };
  const ALTO = { x: 455, y: 250, b: -1.45, mu: 2.2, pin: 0, dob: 1 };
  const BORDE = { x: 528, y: 488, b: -0.6, mu: 3.0, pin: 0, dob: 1 };
  const PRESENTA = { x: 520, y: 470, b: 0.35, mu: 3.25, pin: 0, dob: 1 };
  const PECHO = { x: 330, y: 400, b: -1.3, mu: 1.95, pin: 0, dob: 1 };
  const CLAVES_C = [
    [0, REPOSO], [T.mide0 - 0.1, REPOSO], [T.mide0 + 0.2, MIDE], [T.mide1, MIDE],
    [2.18, MOJA], [2.4, MOJA], [2.65, LIENZO_C], [3.28, LIENZO_C], [3.45, MOJA], [3.6, MOJA], [3.85, LIENZO_C], [4.6, LIENZO_C],
    [4.95, BARBILLA], [5.85, BARBILLA], [6.02, MOJA], [6.15, MOJA], [6.38, LIENZO_C], [6.82, LIENZO_C], [6.95, MOJA], [7.02, MOJA],
    [7.18, LIENZO_C], [7.28, LIENZO_C], [7.36, FLOR_A], [T.flor1, FLOR_B], [T.alto, ALTO], [8.22, ALTO], [T.agarra, BORDE], [T.agarra + 0.12, BORDE],
    [T.presenta, PRESENTA], [10.2, PRESENTA], [10.42, PRESENTA], [11.2, PRESENTA], [T.orgullo + 0.15, PECHO]
  ];
  // corazón: recorrido de la punta del pincel (en el lienzo, respecto al centro), de 0 a 1
  function puntoCorazon(u) {
    const a = Math.PI * 2 * u - Math.PI / 2, r = CORAZON.r;
    // curva de corazón paramétrica que empieza arriba en el centro
    const s = Math.sin(a + Math.PI / 2), c = Math.cos(a + Math.PI / 2);
    const x = 16 * Math.pow(Math.sin(a + Math.PI / 2 + Math.PI), 3);
    const y = -(13 * c - 5 * Math.cos(2 * (a + Math.PI / 2)) - 2 * Math.cos(3 * (a + Math.PI / 2)) - Math.cos(4 * (a + Math.PI / 2)));
    return { x: CORAZON.x + x * r / 16, y: CORAZON.y + y * r / 16 + s * 0 };
  }

  function poseC(t) {
    const b = guion(GUION_CUERPO_C, CUERPOS_C, "inicio", t);
    const fc = pie(PASOS_C.cerca, t, 26), fl = pie(PASOS_C.lejos, t, 26);
    const X = (fc.x + fl.x) / 2;
    const respira = Math.sin(t * 2.1 + 1);
    // asiente al final
    const asiente = dentro(t, T.asiente0, T.asiente0 + 0.08, T.asiente1 - 0.1, T.asiente1) * Math.sin(Math.PI * 2 * 2.5 * fase(t, T.asiente0, T.asiente1));
    // bailoteo frenético mientras pinta a lo loco
    const loca = dentro(t, T.pinta2, T.pinta2 + 0.15, 7.25, T.flor0);
    const p = {
      x: X, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, ikContinuo: true,
      pelvis: { x: CA.PELVIS.x + 6 * Math.sin(t * 13) * loca, y: CA.PELVIS.y + b.pel + respira * 1.2 - 4 * Math.abs(Math.sin(t * 13)) * loca },
      torso: b.torso + 0.02 * Math.sin(t * 13) * loca, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.09 * asiente + 0.03 * Math.sin(t * 13 + 1) * loca, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    for (const [ld, f] of [["cerca", fc], ["lejos", fl]]) {
      // el tobillo sigue la x del paso (en pantalla) y se levanta en arco
      const dxs = f.x - X;                                        // desfase del pie respecto a la pelvis (pantalla)
      p.piernas[ld] = { tob: { x: PIES_C[ld] - dxs / KC, y: TOB_C - (ld === "lejos" ? 6 : 0) - f.alza / KC }, ang: -0.18 * Math.sin(Math.PI * f.u) };
    }
    p.pelo = { inercia: 0.06 * Math.sin(t * 1.6) + 0.18 * (fl.u > 0 && fl.u < 1 ? Math.sin(Math.PI * fl.u) : 0) * (fl.x > X ? -1 : 1)
      + 0.12 * Math.sin(t * 13) * loca, viento: 0 };
    const ex = guion(GUION_CARA_C, CARAS_C, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [1.55, 3.9, 5.45, 8.0, 9.6, 10.9, 12.85]));
    p.cara.rubor = 0.45 * dentro(t, T.orgullo, T.orgullo + 0.3, 13.6, 14) + 0.25 * dentro(t, T.flor0, T.flor0 + 0.2, T.agarra, T.agarra + 0.3);
    manosC(p, t);
    return p;
  }
  // punta del pincel (pantalla) para una mano dada
  const puntaPincel = (p, m) => CA.aPantalla(p, { x: m.x + Math.cos(m.b) * L_PUNTA * CA.JK, y: m.y + Math.sin(m.b) * L_PUNTA * CA.JK });
  function manoPincel(p, t) {
    const m = pista(CLAVES_C, t);
    // pinceladas detrás del lienzo: arriba y abajo con algún zigzag
    if (m.pin > 0.001) {
      const loca = t > T.pinta2 - 0.1, w = loca ? 17 : 10;
      m.x += m.pin * 16 * Math.sin(t * w * 0.5 + 0.7);
      m.y += m.pin * 62 * Math.sin(t * w);
      m.b += m.pin * 0.22 * Math.sin(t * w + 1.2);
    }
    // corazón: la punta recorre el contorno del corazón pintado en el lienzo (ya de frente)
    const k = dentro(t, T.corazon0 - 0.25, T.corazon0, T.corazon1, T.corazon1 + 0.2);
    if (k > 0) {
      const u = fase(t, T.corazon0, T.corazon1), q = puntoCorazon(u);
      const bC = 0.15, objetivo = CA.aHoja(p, { x: LZ.x + q.x, y: LZ.y + q.y });
      const h = { x: objetivo.x - Math.cos(bC) * L_PUNTA * CA.JK, y: objetivo.y - Math.sin(bC) * L_PUNTA * CA.JK };
      m.x = lerp(m.x, h.x, k); m.y = lerp(m.y, h.y, k); m.b = lerp(m.b, bC, k); m.mu = lerp(m.mu, 3.3, k);
    }
    return m;
  }
  function manosC(p, t) {
    const m = manoPincel(p, t);
    const col = t >= T.corazon0 - 0.3 && t < T.orgullo + 0.5 ? "#e2453a" : colorPunta(t);
    p.manoLejos = { x: m.x, y: m.y, ang: 0, mu: m.mu, dobla: m.dob, puno: 1, dedos: AGARRA, objeto: pincel(m.b, col) };
    p.pincel = m;
    // paleta en la mano cercana, delante de la tripa
    const bob = 4 * Math.sin(t * 2.1 + 1);
    p.manoCerca = { x: 200, y: 548 + bob, ang: 0, mu: -1.95, dobla: -1, puno: 1, dedos: AGARRA, objeto: paleta };
  }

  /* =====================================================================================
   * GUILLERMO (a la izquierda, subido al taburete, mira a la derecha)
   * ===================================================================================== */
  const XG = 252;
  const TAB = { x: XG + 2, top: 497, rx: 72, ry: 13 };   // taburete: centro y altura del asiento
  const PIES_G = { cerca: G.PELVIS.x - 70, lejos: G.PELVIS.x + 66 };
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };

  const CARAS_G = {
    heroe: E({ mx: 0.9, my: -0.6, c: 0.12, sd: 12, gd: 0.08, si: 10, gi: 0.06, abre: 0, ancho: 0.9, sonr: 0.5 }),
    camara: E({ mx: -0.85, my: -0.25, c: 0.12, wd: 0.75, sd: 14, gd: 0.1, si: 4, gi: -0.04, abre: 0, ancho: 0.95, sonr: 0.75 }),
    esfuerzo: E({ mx: 0.9, my: -0.6, c: 0.28, sd: 2, gd: -0.08, si: 2, gi: -0.08, abre: 0, ancho: 0.85, sonr: 0.25 }),
    mosca: E({ mx: 0.6, my: 0.9, iris: 0.85, c: 0.05, sd: 22, gd: 0.15, si: 10, gi: 0.02, abre: 0, ancho: 0.6, sonr: 0 }),
    aguanta: E({ mx: 0.6, my: 0.9, iris: 0.85, c: 0.15, sd: 20, gd: 0.12, si: 8, gi: 0, abre: 0, ancho: 0.45, sonr: -0.1, mof: 1 }),
    sopla: E({ mx: 0.6, my: 0.9, iris: 0.85, c: 0.15, sd: 22, gd: 0.12, si: 10, gi: 0, abre: 7, ancho: 0.3, sonr: -0.2, mof: 0.35, dientes: 0 }),
    relaja: E({ mx: 0.9, my: 0.2, c: 0.55, h: 0.7, sd: 10, gd: 0.06, si: 10, gi: 0.06, abre: 10, ancho: 1, sonr: 0.6 }),
    ansia: E({ mx: 0.88, my: 0.18, iris: 1.12, c: 0, sd: 16, gd: 0.1, si: 16, gi: 0.1, abre: 18, ancho: 1.05, sonr: 0.95 }),
    susto: E({ mx: 0.85, my: 0.15, iris: 0.62, sd: 32, gd: 0.22, si: 32, gi: 0.22, abre: 64, ancho: 0.8, sonr: -0.2, lengua: 0.4 }),
    camaraG: E({ mx: -0.85, my: -0.05, iris: 0.8, c: 0.38, sd: 4, gd: -0.06, si: 4, gi: -0.06, abre: 30, ancho: 0.6, sonr: -0.3, lengua: 0.2 }),
    senala: E({ mx: 0.88, my: 0.15, c: 0.05, sd: 20, gd: 0.12, si: 24, gi: 0.15, abre: 14, ancho: 0.7, sonr: -0.1 }),
    yo: E({ mx: 0.85, my: 0.05, sd: 24, gd: 0.14, si: 28, gi: 0.18, abre: 10, ancho: 0.6, sonr: 0 }),
    encoge: E({ mx: -0.85, my: 0, c: 0.32, h: 0.5, sd: 16, gd: 0.16, si: 16, gi: 0.16, abre: 6, ancho: 1.05, sonr: 0.65 })
  };
  const GUION_CARA_G = [
    [0.3, 0.6, "heroe"], [T.guinoG, T.guinoG + 0.15, "camara"], [T.guinoG + 0.5, T.guinoG + 0.7, "heroe"], [3.5, 4.2, "esfuerzo"],
    [T.posa, T.posa + 0.12, "mosca"], [T.aguanta, T.aguanta + 0.25, "aguanta"], [T.sopla, T.sopla + 0.08, "sopla"], [T.sopla + 0.35, T.sopla + 0.55, "aguanta"],
    [T.relaja0, T.relaja0 + 0.3, "relaja"], [T.relaja1, T.relaja1 + 0.15, "ansia"], [T.ve, T.ve + 0.1, "susto"], [T.camaraG, T.camaraG + 0.35, "camaraG"],
    [T.senala0, T.senala0 + 0.2, "senala"], [T.yo0, T.yo0 + 0.2, "yo"], [T.encoge, T.encoge + 0.3, "encoge"]
  ];
  // cuerpo: pel (hoja), torso, cab, ex (pecho hinchado)
  const CUERPOS_G = {
    heroe: { pel: 0, torso: -0.07, cab: -0.15, ex: 1.06 },
    relaja: { pel: 10, torso: 0.03, cab: 0.02, ex: 1 },
    ansia: { pel: 12, torso: 0.15, cab: 0.08, ex: 1 },
    susto: { pel: -6, torso: -0.15, cab: -0.12, ex: 1.02 },
    camara: { pel: 6, torso: -0.04, cab: 0.03, ex: 1 },
    senala: { pel: 6, torso: 0.07, cab: 0.04, ex: 1 },
    yo: { pel: 4, torso: -0.02, cab: -0.02, ex: 1 },
    encoge: { pel: -8, torso: 0, cab: 0.1, ex: 1 }
  };
  const GUION_CUERPO_G = [
    [T.relaja0, T.relaja1, "relaja"], [T.relaja1, T.ve - 0.02, "ansia"], [T.ve, T.ve + 0.16, "susto", salida], [T.camaraG, T.camaraG + 0.45, "camara"],
    [T.senala0, T.senala0 + 0.3, "senala"], [T.yo0, T.yo0 + 0.3, "yo"], [T.encoge, T.encoge + 0.3, "encoge"]
  ];
  // la mosca: vuela alrededor de la cabeza, se posa en la nariz y se va
  const NARIZ = { x: 866, y: 706 };                      // punta de la nariz (retrato)
  function posMosca(t, pG) {
    if (t < T.mosca0 || t > T.relaja0 + 1.2) return null;
    const H = G.cabeza(pG), c = G.aPantalla(pG, H.a({ x: 790, y: 560 })), n = G.aPantalla(pG, H.a(NARIZ));
    if (t < T.posa) {
      // entra por la izquierda y da vueltas alrededor de la cabeza
      const u = fase(t, T.mosca0, T.posa), a = u * Math.PI * 2 * 2.3 + 2.4;
      const r = lerp(150, 50, u), orb = { x: c.x + Math.cos(a) * r * 1.15 + 18 * Math.sin(t * 9), y: c.y + Math.sin(a) * r * 0.62 + 10 * Math.sin(t * 13) };
      const entra = { x: lerp(-30, orb.x, suave(fase(t, T.mosca0, T.mosca0 + 0.5))), y: lerp(80, orb.y, suave(fase(t, T.mosca0, T.mosca0 + 0.5))) };
      const llega = suave(fase(t, T.posa - 0.35, T.posa));
      return { x: lerp(entra.x, n.x, llega), y: lerp(entra.y, n.y - 5, llega), ala: 1, ang: 0.25 * Math.sin(t * 7), posada: llega };
    }
    if (t < T.relaja0 + 0.08) {
      // posada en la nariz: se frota las patitas y camina un poco
      return { x: n.x + 2 * Math.sin(t * 2.3), y: n.y - 5, ala: 0.15 + 0.85 * Math.max(0, Math.sin((t - T.sopla) * 40)) * dentro(t, T.sopla, T.sopla + 0.02, T.sopla + 0.3, T.sopla + 0.4), ang: -0.2, posada: 1 };
    }
    // despega y se va por arriba a la izquierda
    const u = fase(t, T.relaja0 + 0.08, T.relaja0 + 1.2);
    return { x: n.x - 260 * u * u - 40 * Math.sin(u * 9) * u, y: n.y - 5 - 330 * u, ala: 1, ang: -0.5, posada: 0 };
  }

  function poseG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "heroe", t);
    const respira = Math.sin(t * 2.3);
    // temblor creciente mientras aguanta la pose
    const pose = 1 - tramo(t, T.relaja0, T.relaja1);
    const tiembla = Math.pow(tramo(t, T.tiembla0, T.relaja0 - 0.1, x => x), 1.4) * pose;
    const n1 = ruido(t * 17), n2 = ruido(t * 19 + 7), n3 = ruido(t * 23 + 3);
    // susto: respingo hacia atrás; encogerse de hombros: saltito
    const respingo = t >= T.ve ? Math.exp(-(t - T.ve) * 6) * Math.sin(Math.min(1, (t - T.ve) / 0.12) * Math.PI / 2) : 0;
    const enc = Math.sin(Math.PI * fase(t, T.encoge, T.encoge + 0.5));
    const p = {
      x: XG + 2.5 * n1 * tiembla, suelo: TAB.top + 1, s: S, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * (1.3 - 1.1 * dentro(t, T.aguanta - 0.2, T.aguanta, T.relaja0, T.relaja0 + 0.1)) - 18 * enc },
      torso: b.torso + 0.015 * n2 * tiembla - 0.06 * respingo, torsoEsc: { x: b.ex + 0.03 * dentro(t, T.aguanta - 0.2, T.aguanta, T.relaja0, T.relaja1), y: 1 + respira * 0.005 },
      piernas: {}, cabeza: { ang: b.cab + 0.025 * n3 * tiembla - 0.08 * respingo, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    for (const ld of ["cerca", "lejos"]) p.piernas[ld] = { tob: { x: PIES_G[ld], y: TOB_G[ld] }, ang: 0 };
    manosG(p, t, tiembla, n1, n2);
    // cara
    const ex = guion(GUION_CARA_G, CARAS_G, "heroe", t);
    // los ojos siguen a la mosca mientras vuela alrededor
    const sigue = dentro(t, T.mosca0 + 0.3, T.mosca0 + 0.6, T.posa - 0.1, T.posa + 0.05);
    if (sigue > 0) {
      const f = posMosca(t, p);
      if (f) { const c = G.aPantalla(p, G.cabeza(p).a({ x: 830, y: 590 }));
        ex.mx = lerp(ex.mx, clamp((f.x - c.x) / 90, -1, 1), sigue); ex.my = lerp(ex.my, clamp((f.y - c.y) / 60, -1, 1), sigue); ex.iris = lerp(ex.iris, 0.9, sigue); }
    }
    // tic en el ojo y la ceja con la mosca en la nariz
    const tic = dentro(t, T.posa + 0.2, T.posa + 0.3, T.relaja0, T.relaja0 + 0.05);
    const pulso = Math.max(0, Math.sin(t * 11)) ** 6 * tic;
    ex.wd += 0.45 * pulso; ex.sd += 10 * pulso;
    p.cara = cara(ex, parpadeo(t, [0.9, 2.15, 3.3, 4.75, 9.75, 10.55, 12.1]));
    // rojo, sudor
    p.rojo = 0.55 * tramo(t, 4.0, 8.0) * (1 - tramo(t, T.relaja0, T.relaja1 + 0.3)) + 0.25 * dentro(t, T.encoge, T.encoge + 0.3, 13.6, 14);
    p.cara.rubor = 0.6 * dentro(t, T.encoge, T.encoge + 0.3, 13.6, 14);
    p.sudor = clamp(tramo(t, 3.4, 6.5) * 1.1) * (1 - tramo(t, T.relaja1, T.relaja1 + 0.6)) + 0.7 * dentro(t, T.ve + 0.1, T.ve + 0.4, T.senala0, T.senala0 + 0.4);
    return p;
  }
  function manosG(p, t, tiembla, n1, n2) {
    const Tr = G.tronco(p);
    // pose de héroe: puño en la cadera y el otro brazo señalando al horizonte (tiembla cada vez más)
    let c = Tr({ x: 120, y: 612 }), l = Tr({ x: 596 + 14 * n1 * tiembla, y: 270 + 18 * n2 * tiembla });
    let cmu = -2.25, lmu = 2.72, cd = PUNO, ld = SENALA, cdob = -1, ldob = -1;
    const pone = (w, cc, ll) => {
      if (w <= 0) return;
      if (cc) { c = mezcla(c, cc.q, w); cmu = lerp(cmu, cc.mu, w); cd = mezclaD(cd, cc.d, w); }
      if (ll) { l = mezcla(l, ll.q, w); lmu = lerp(lmu, ll.mu, w); ld = mezclaD(ld, ll.d, w); }
    };
    // se relaja: los brazos caen y se frota las manos expectante
    const relaja = dentro(t, T.relaja0, T.relaja1, T.ve, T.ve + 0.08);
    const fr = Math.sin(t * 22);
    pone(relaja, { q: Tr({ x: 272 + 10 * fr, y: 566 }), mu: 2.6, d: FROTA }, { q: Tr({ x: 312 - 10 * fr, y: 572 }), mu: -2.2, d: FROTA });
    // susto: brazos abiertos con las manos abiertas
    const susto = dentro(t, T.ve, T.ve + 0.14, T.camaraG, T.camaraG + 0.5);
    pone(susto, { q: Tr({ x: -40, y: 300 }), mu: 0.35, d: ABIERTA }, { q: Tr({ x: 528, y: 288 }), mu: 2.75, d: ABIERTA });
    // mira a cámara: brazos caídos
    const cae = dentro(t, T.camaraG, T.camaraG + 0.5, T.senala0, T.senala0 + 0.25);
    pone(cae, { q: Tr({ x: 104, y: 648 }), mu: -1.62, d: RELAJADA }, { q: Tr({ x: 392, y: 630 }), mu: -1.68, d: RELAJADA });
    // señala el cuadro (mano lejana)…
    const sen = dentro(t, T.senala0, T.senala0 + 0.25, T.yo0, T.yo0 + 0.3);
    pone(sen, { q: Tr({ x: 104, y: 648 }), mu: -1.62, d: RELAJADA }, { q: Tr({ x: 596, y: 452 }), mu: 0.34 + Math.PI, d: SENALA });
    // …y luego se señala a sí mismo (mano cercana al pecho)
    const yo = dentro(t, T.yo0, T.yo0 + 0.25, T.encoge, T.encoge + 0.25);
    const toque = 6 * Math.max(0, Math.sin((t - T.yo0) * 18)) * yo;
    pone(yo, { q: Tr({ x: 205 + toque, y: 452 }), mu: 2.04, d: D(0.7, 1) }, { q: Tr({ x: 596, y: 452 + 5 * Math.sin(t * 9) }), mu: 0.34 + Math.PI, d: SENALA });
    // se encoge de hombros con las palmas arriba
    const enc = tramo(t, T.encoge, T.encoge + 0.3);
    pone(enc, { q: Tr({ x: -50, y: 630 }), mu: -0.8, d: ABIERTA }, { q: Tr({ x: 515, y: 596 }), mu: -2.35, d: ABIERTA });
    p.manoCerca = { x: c.x, y: c.y, ang: 0, mu: cmu, dobla: cdob, puno: 1, dedos: cd };
    p.manoLejos = { x: l.x, y: l.y, ang: 0, mu: lmu, dobla: ldob, puno: 1, dedos: ld };
  }

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  let fondo = null, dorso = null, frente = null, caballeteAtras = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 100; const g = c.getContext("2d");
    g.translate(60, 50); g.lineJoin = "round"; g.lineCap = "round";
    // pared de yeso verde salvia
    const pared = g.createLinearGradient(0, -50, 0, 460); pared.addColorStop(0, "#6f8d7c"); pared.addColorStop(1, "#9db39a");
    g.fillStyle = pared; g.fillRect(-60, -50, W + 120, 520);
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,240,${0.03 + hash(i) * 0.04})`; g.beginPath(); g.ellipse(hash(i + 3) * (W + 60), hash(i + 5) * 440, 20 + hash(i + 7) * 40, 8 + hash(i + 8) * 14, 0, 0, Math.PI * 2); g.fill(); }
    // techo abuhardillado con vigas
    g.fillStyle = "#5a3a24"; g.beginPath(); g.moveTo(-60, -50); g.lineTo(W + 60, -50); g.lineTo(W + 60, -10); g.lineTo(-60, 26); g.closePath(); g.fill();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.beginPath(); g.moveTo(-60, 26); g.lineTo(W + 60, -10); g.stroke();
    for (let x = 30; x < W + 60; x += 150) { g.fillStyle = "#7a4e2e"; g.beginPath(); g.moveTo(x, -50); g.lineTo(x + 26, -50); g.lineTo(x + 30, 22 - x * 0.035); g.lineTo(x + 4, 24 - x * 0.035); g.closePath(); g.fill(); g.stroke(); }
    // ventanal con tejados y cielo de tarde
    const VX0 = 400, VX1 = 540, VY0 = 40, VY1 = 230;
    g.fillStyle = "#3b2516"; g.fillRect(VX0 - 10, VY0 - 10, VX1 - VX0 + 20, VY1 - VY0 + 20);
    const cielo = g.createLinearGradient(0, VY0, 0, VY1); cielo.addColorStop(0, "#8fc4f0"); cielo.addColorStop(0.7, "#f6d8a8"); cielo.addColorStop(1, "#f1b98a");
    g.fillStyle = cielo; g.fillRect(VX0, VY0, VX1 - VX0, VY1 - VY0);
    g.save(); g.beginPath(); g.rect(VX0, VY0, VX1 - VX0, VY1 - VY0); g.clip();
    g.fillStyle = "rgba(255,255,255,0.8)"; g.beginPath(); g.ellipse(440, 80, 26, 9, 0, 0, Math.PI * 2); g.ellipse(462, 74, 18, 10, 0, 0, Math.PI * 2); g.fill();
    // tejados y chimeneas
    g.fillStyle = "#b5583a"; g.beginPath(); g.moveTo(VX0, 190); g.lineTo(430, 160); g.lineTo(470, 186); g.lineTo(500, 168); g.lineTo(VX1, 192); g.lineTo(VX1, VY1); g.lineTo(VX0, VY1); g.closePath(); g.fill();
    g.fillStyle = "#8d3f2a"; g.fillRect(482, 150, 10, 24); g.fillStyle = "#c46a48"; g.fillRect(410, 200, 22, 30); g.fillRect(470, 205, 30, 25);
    g.fillStyle = "rgba(255,240,200,0.8)"; g.fillRect(416, 208, 6, 8); g.fillRect(478, 212, 6, 8); g.fillRect(490, 212, 6, 8);
    g.restore();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(VX0, VY0, VX1 - VX0, VY1 - VY0);
    g.fillStyle = "#4a2d1a"; g.fillRect((VX0 + VX1) / 2 - 4, VY0, 8, VY1 - VY0); g.fillRect(VX0, (VY0 + VY1) / 2 - 4, VX1 - VX0, 8);
    g.strokeRect((VX0 + VX1) / 2 - 4, VY0, 8, VY1 - VY0); g.strokeRect(VX0, (VY0 + VY1) / 2 - 4, VX1 - VX0, 8);
    g.fillStyle = "#6a4128"; g.fillRect(VX0 - 18, VY1 + 8, VX1 - VX0 + 36, 10); g.strokeRect(VX0 - 18, VY1 + 8, VX1 - VX0 + 36, 10);
    // haz de sol hacia el taburete del modelo
    const haz = g.createLinearGradient(VX0, VY0, 250, 470); haz.addColorStop(0, "rgba(255,236,190,0.32)"); haz.addColorStop(1, "rgba(255,236,190,0.04)");
    g.fillStyle = haz; g.beginPath(); g.moveTo(VX0, VY0 + 6); g.lineTo(VX1, VY1); g.lineTo(380, 520); g.lineTo(110, 520); g.closePath(); g.fill();
    // cortina granate de modelo detrás del taburete
    g.fillStyle = "#3b2516"; g.fillRect(70, 44, 330, 8); g.strokeRect(70, 44, 330, 8);
    for (const x of [70, 400]) { g.fillStyle = "#c9a24a"; g.beginPath(); g.arc(x, 48, 8, 0, Math.PI * 2); g.fill(); g.stroke(); }
    const pl = 11;
    for (let i = 0; i < pl; i++) {
      const x0 = 84 + i * 28, x1 = x0 + 28, ond = 8 * Math.sin(i * 1.7);
      const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, "#5a1420"); gr.addColorStop(0.5, "#8e2433"); gr.addColorStop(1, "#5a1420");
      g.fillStyle = gr; g.beginPath(); g.moveTo(x0, 52); g.lineTo(x1, 52); g.quadraticCurveTo(x1 + ond, 300, x1 + 4, 472); g.lineTo(x0 + 4, 472); g.quadraticCurveTo(x0 + ond, 300, x0, 52); g.closePath(); g.fill();
    }
    g.strokeStyle = "#2a0810"; g.lineWidth = 2; for (let i = 1; i < pl; i++) { const x = 84 + i * 28; g.beginPath(); g.moveTo(x, 54); g.quadraticCurveTo(x + 8 * Math.sin(i * 1.7), 300, x + 4, 470); g.stroke(); }
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.beginPath(); g.moveTo(84, 52); g.lineTo(88, 472); g.moveTo(392, 52); g.lineTo(396, 472); g.stroke();
    // cuadros en la pared derecha (sin letras): girasoles y abstracto
    const marco = (x, y, w, h, dib) => { g.fillStyle = "#c9a24a"; g.fillRect(x - 8, y - 8, w + 16, h + 16); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(x - 8, y - 8, w + 16, h + 16);
      g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); dib(); g.restore(); g.strokeRect(x, y, w, h); };
    marco(850, 60, 92, 112, () => { g.fillStyle = "#2e4a8a"; g.fillRect(850, 60, 92, 112); g.fillStyle = "#c46a2e"; g.fillRect(872, 140, 48, 40);
      for (const [x, y] of [[880, 105], [905, 92], [925, 112]]) { g.fillStyle = "#f2c230"; for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; g.beginPath(); g.ellipse(x + Math.cos(a) * 9, y + Math.sin(a) * 9, 6, 3, a, 0, Math.PI * 2); g.fill(); }
        g.fillStyle = "#6a3a10"; g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#3a6a2a"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y + 8); g.lineTo(896, 142); g.stroke(); } });
    marco(700, 50, 96, 70, () => { g.fillStyle = "#f3ead8"; g.fillRect(700, 50, 96, 70); g.fillStyle = "#e2453a"; g.beginPath(); g.arc(728, 82, 18, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#2f7fd8"; g.beginPath(); g.moveTo(752, 108); g.lineTo(782, 58); g.lineTo(790, 112); g.closePath(); g.fill(); g.fillStyle = "#f2c230"; g.fillRect(744, 62, 14, 14);
      g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(704, 110); g.lineTo(790, 66); g.stroke(); });
    // estante con botes de pinceles y pintura
    g.fillStyle = "#6a4128"; g.fillRect(860, 230, 170, 10); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(860, 230, 170, 10);
    [[880, "#e2453a"], [910, "#2f7fd8"], [990, "#3bb36a"]].forEach(([x, col]) => { g.fillStyle = "#d8d2c4"; g.fillRect(x - 10, 204, 20, 26); g.strokeRect(x - 10, 204, 20, 26);
      g.fillStyle = col; g.fillRect(x - 10, 204, 20, 7); g.strokeRect(x - 10, 204, 20, 7); g.beginPath(); g.moveTo(x - 6, 219); g.quadraticCurveTo(x - 9, 232, x - 2, 231); g.lineWidth = 2; g.strokeStyle = col; g.stroke(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; });
    g.fillStyle = "#4a6aa0"; g.beginPath(); g.moveTo(940, 230); g.lineTo(944, 196); g.lineTo(966, 196); g.lineTo(970, 230); g.closePath(); g.fill(); g.stroke();
    for (let i = 0; i < 5; i++) { const a = -1.9 + i * 0.18; g.strokeStyle = "#0b0a0e"; g.lineWidth = 4; g.beginPath(); g.moveTo(955, 200); g.lineTo(955 + Math.cos(a) * 40, 200 + Math.sin(a) * 40); g.stroke();
      g.strokeStyle = ["#c0773a", "#d9a45a", "#a8603a"][i % 3]; g.lineWidth = 2; g.stroke(); }
    // zócalo y suelo de tarima con salpicaduras
    g.fillStyle = "#5a3a24"; g.fillRect(-60, 462, W + 120, 14); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.beginPath(); g.moveTo(-60, 462); g.lineTo(W + 60, 462); g.stroke();
    const su = g.createLinearGradient(0, 476, 0, H + 50); su.addColorStop(0, "#9a6a40"); su.addColorStop(1, "#5a3a20");
    g.fillStyle = su; g.fillRect(-60, 476, W + 120, H + 50 - 476);
    g.strokeStyle = "rgba(40,20,8,0.45)"; g.lineWidth = 2;
    for (let i = 0; i < 6; i++) { const y = 476 + (i + 1) * (i + 3) * 2.6; g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    for (let i = 0; i < 18; i++) { const x = -40 + i * 64, y0 = 476; g.beginPath(); g.moveTo(x, y0); g.lineTo(x + (x - 512) * 0.35, H + 50); g.stroke(); }
    for (let i = 0; i < 26; i++) {
      const x = 40 + hash(i * 3.1) * 980, y = 488 + hash(i * 5.3) * 100, r = 3 + hash(i * 7.7) * 7;
      g.fillStyle = COLORES[i % COLORES.length]; g.globalAlpha = 0.75; g.beginPath(); g.ellipse(x, y, r * 1.6, r * 0.6, 0, 0, Math.PI * 2); g.fill();
      for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(x + (hash(i + k * 11) - 0.5) * r * 5, y + (hash(i + k * 13) - 0.5) * r * 1.2, r * 0.35, r * 0.18, 0, 0, Math.PI * 2); g.fill(); }
      g.globalAlpha = 1;
    }
    // lienzos apoyados en la pared (de espaldas) a la derecha
    for (const [x, w, h, a] of [[930, 88, 120, -0.08], [975, 70, 96, -0.12]]) {
      g.save(); g.translate(x, 478); g.rotate(a); g.fillStyle = "#d9c9a6"; g.fillRect(-w / 2, -h, w, h); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(-w / 2, -h, w, h);
      g.fillStyle = "#a87a48"; g.fillRect(-w / 2 + 4, -h + 4, w - 8, 8); g.fillRect(-w / 2 + 4, -12, w - 8, 8); g.fillRect(-w / 2 + 4, -h + 4, 8, h - 8); g.fillRect(w / 2 - 12, -h + 4, 8, h - 8); g.restore();
    }
    // planta en una maceta (izquierda)
    g.fillStyle = "#b5583a"; g.beginPath(); g.moveTo(14, 478); g.lineTo(18, 440); g.lineTo(62, 440); g.lineTo(66, 478); g.closePath(); g.fill(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.stroke();
    for (let i = 0; i < 7; i++) { const a = -2.6 + i * 0.36, L = 50 + hash(i) * 30; g.fillStyle = i % 2 ? "#3f7a3a" : "#56994a";
      g.save(); g.translate(40, 440); g.rotate(a + Math.PI / 2); g.beginPath(); g.ellipse(0, -L / 2, 9, L / 2, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 2; g.stroke(); g.restore(); }
    // viñeta
    const v = g.createRadialGradient(470, 290, 260, 470, 290, 700); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.5)");
    g.fillStyle = v; g.fillRect(-60, -50, W + 120, H + 100);
    return c;
  }
  // taburete del modelo (pantalla)
  function taburete(g) {
    const { x, top, rx, ry } = TAB, alto = SUELO - top;
    g.save(); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = "#0b0a0e";
    // patas
    for (const [dx, dz, col] of [[-0.62, -1, "#6a4128"], [0.62, -1, "#6a4128"], [-0.7, 1, "#8a5634"], [0.7, 1, "#8a5634"]]) {
      const x0 = x + dx * rx * 0.85, y0 = top + dz * ry * 0.4 + 6, x1 = x + dx * rx * 1.08, y1 = SUELO + dz * 4;
      g.lineWidth = 11; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = col; g.lineWidth = 6.5; g.stroke(); g.strokeStyle = "#0b0a0e";
    }
    // travesaño
    g.lineWidth = 7; g.beginPath(); g.moveTo(x - rx * 0.92, top + alto * 0.62); g.lineTo(x + rx * 0.92, top + alto * 0.62); g.stroke();
    g.strokeStyle = "#8a5634"; g.lineWidth = 3.5; g.stroke(); g.strokeStyle = "#0b0a0e";
    // asiento
    g.fillStyle = "#7a4a2a"; g.beginPath(); g.ellipse(x, top + 6, rx, ry, 0, 0, Math.PI); g.lineTo(x - rx, top); g.ellipse(x, top, rx, ry, 0, Math.PI, 0, true); g.closePath(); g.fill(); g.lineWidth = 3; g.stroke();
    g.fillStyle = "#a8703f"; g.beginPath(); g.ellipse(x, top, rx, ry, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = "rgba(60,30,10,0.5)"; g.lineWidth = 1.5; g.beginPath(); g.ellipse(x, top, rx * 0.6, ry * 0.55, 0, 0, Math.PI * 2); g.stroke();
    g.restore();
  }
  // caballete: patas y mástil por detrás del lienzo (cacheado)
  function creaCaballete() {
    const c = document.createElement("canvas"); c.width = 260; c.height = 360; const g = c.getContext("2d");
    g.translate(-510, -200); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = "#0b0a0e";
    const listón = (x0, y0, x1, y1, ancho, col) => { g.strokeStyle = "#0b0a0e"; g.lineWidth = ancho + 5; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = col; g.lineWidth = ancho; g.stroke(); };
    listón(LZ.x, 238, LZ.x + 22, 528, 7, "#7a4a2a");                          // pata trasera
    listón(LZ.x - 10, 236, LZ.x - 88, SUELO, 9, "#a8703f");                  // patas delanteras
    listón(LZ.x + 10, 236, LZ.x + 88, SUELO, 9, "#a8703f");
    listón(LZ.x, 226, LZ.x, 500, 9, "#b97c45");                               // mástil
    listón(LZ.x - 74, 470, LZ.x + 74, 470, 6, "#8a5634");                    // travesaño bajo
    g.fillStyle = "#b97c45"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 3;
    g.beginPath(); g.arc(LZ.x, 224, 7, 0, Math.PI * 2); g.fill(); g.stroke();
    return c;
  }
  function caballeteDelante(g) {
    // repisa donde apoya el lienzo y mordaza de arriba
    g.save(); g.lineJoin = "round"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 3;
    g.fillStyle = "#b97c45"; g.fillRect(LZ_X0 - 12, LZ_Y1 - 2, LZ.w + 24, 10); g.strokeRect(LZ_X0 - 12, LZ_Y1 - 2, LZ.w + 24, 10);
    g.fillStyle = "#8a5634"; g.fillRect(LZ_X0 - 12, LZ_Y1 + 8, LZ.w + 24, 4); g.strokeRect(LZ_X0 - 12, LZ_Y1 + 8, LZ.w + 24, 4);
    g.fillStyle = "#b97c45"; g.fillRect(LZ.x - 12, LZ_Y0 - 10, 24, 16); g.strokeRect(LZ.x - 12, LZ_Y0 - 10, 24, 16);
    g.restore();
  }
  // dorso del lienzo (bastidor de madera) y frente con el garabato, cacheados
  function creaDorso() {
    const c = document.createElement("canvas"); c.width = LZ.w + 8; c.height = LZ.h + 8; const g = c.getContext("2d");
    g.translate(4, 4); g.lineJoin = "round";
    // lino crudo con trama
    g.fillStyle = "#cdb487"; g.fillRect(0, 0, LZ.w, LZ.h);
    g.strokeStyle = "rgba(120,90,50,0.22)"; g.lineWidth = 1;
    for (let i = -LZ.h; i < LZ.w; i += 5) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + LZ.h, LZ.h); g.stroke(); }
    g.strokeStyle = "rgba(255,240,210,0.18)"; for (let i = 0; i < LZ.w + LZ.h; i += 7) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i - LZ.h, LZ.h); g.stroke(); }
    // bastidor: marco y travesaño horizontal, con cuñas en las esquinas
    const b = 9;
    g.fillStyle = "#8a5a32"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2;
    for (const r of [[0, 0, LZ.w, b], [0, LZ.h - b, LZ.w, b], [0, 0, b, LZ.h], [LZ.w - b, 0, b, LZ.h], [b, LZ.h / 2 - 4, LZ.w - 2 * b, 8]]) { g.fillRect(...r); g.strokeRect(...r); }
    g.fillStyle = "#b07a45";
    for (const [x, y, sx, sy] of [[b, b, 1, 1], [LZ.w - b, b, -1, 1], [b, LZ.h - b, 1, -1], [LZ.w - b, LZ.h - b, -1, -1]]) {
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + 14 * sx, y); g.lineTo(x, y + 14 * sy); g.closePath(); g.fill(); g.stroke();
    }
    g.fillStyle = "#6a6a72"; for (let i = 0; i < 8; i++) { g.fillRect(12 + i * 17.5, 3, 3, 3); g.fillRect(12 + i * 17.5, LZ.h - 6, 3, 3); }
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(0, 0, LZ.w, LZ.h);
    return c;
  }
  // trazo tembloroso de niño pequeño
  function garabato(g, pts, ancho, col, cerrado) {
    g.save(); g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = col; g.lineWidth = ancho;
    g.beginPath();
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const [x, y] = pts[i], j = 1.4 * (hash(i * 7.3 + x) - 0.5), k = 1.4 * (hash(i * 3.1 + y) - 0.5);
      if (i) g.lineTo(x + j, y + k); else g.moveTo(x + j, y + k);
    }
    if (cerrado) g.closePath();
    g.stroke(); g.restore();
  }
  function creaFrente() {
    const c = document.createElement("canvas"); c.width = LZ.w + 8; c.height = LZ.h + 8; const g = c.getContext("2d");
    g.translate(4, 4);
    g.fillStyle = "#fbf8f0"; g.fillRect(0, 0, LZ.w, LZ.h);
    g.fillStyle = "rgba(200,190,170,0.18)"; for (let i = 0; i < 40; i++) g.fillRect(hash(i) * LZ.w, hash(i + 9) * LZ.h, 2, 2);
    g.translate(LZ.w / 2, LZ.h / 2);
    // sol de esquina con rayos
    g.fillStyle = "#f7c93a"; g.beginPath(); g.arc(-55, -40, 11, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + 0.2; garabato(g, [[-55 + Math.cos(a) * 15, -40 + Math.sin(a) * 15], [-55 + Math.cos(a) * 22, -40 + Math.sin(a) * 22]], 2.4, "#f0a020"); }
    // suelo verde
    garabato(g, [[-70, 44], [-40, 42], [-10, 45], [20, 43], [50, 45], [70, 43]], 3, "#4caf50");
    // taburete: un rectángulo con dos patas
    garabato(g, [[-24, 30], [10, 30], [10, 34], [-24, 34]], 2.6, "#a0622d", true);
    garabato(g, [[-21, 34], [-23, 44]], 2.6, "#a0622d"); garabato(g, [[7, 34], [9, 44]], 2.6, "#a0622d");
    // muñeco de palotes: piernas, cuerpo, brazos (uno en la cadera y otro señalando arriba)
    const tinta = "#1b1716";
    garabato(g, [[-12, 30], [-7, 12]], 2.8, tinta); garabato(g, [[-2, 30], [-7, 12]], 2.8, tinta);
    garabato(g, [[-7, 12], [-7, -6]], 2.8, tinta);
    garabato(g, [[-7, 0], [-18, 6], [-10, 12]], 2.8, tinta);
    garabato(g, [[-7, -2], [8, -10], [22, -20]], 2.8, tinta);
    garabato(g, [[22, -20], [26, -23]], 2.2, tinta);
    // cabeza redonda torcida
    const cab = []; for (let i = 0; i <= 18; i++) { const a = i / 18 * Math.PI * 2; cab.push([-8 + Math.cos(a) * 14 * (1 + 0.06 * Math.sin(a * 3)), -20 + Math.sin(a) * 13]); }
    g.fillStyle = "#ffd9b0"; g.beginPath(); g.ellipse(-8, -20, 13.5, 12.5, 0, 0, Math.PI * 2); g.fill();
    garabato(g, cab, 2.8, tinta);
    // pelo de pinchos (zigzag marrón)
    garabato(g, [[-22, -26], [-20, -40], [-15, -30], [-11, -44], [-6, -31], [-1, -43], [3, -29], [9, -38], [7, -25]], 3, "#7a4a1e");
    // ojos de punto y sonrisa enorme
    g.fillStyle = tinta; g.beginPath(); g.arc(-13, -22, 1.9, 0, Math.PI * 2); g.arc(-3, -23, 1.9, 0, Math.PI * 2); g.fill();
    garabato(g, [[-17, -16], [-13, -11], [-8, -9.5], [-3, -11], [1, -16]], 2.4, "#d23a2e");
    // mofletes
    g.fillStyle = "rgba(240,110,110,0.55)"; g.beginPath(); g.arc(-18, -15, 2.6, 0, Math.PI * 2); g.arc(2, -16, 2.6, 0, Math.PI * 2); g.fill();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(4, 4, LZ.w, LZ.h);
    return c;
  }
  // corazón pintado (en el lienzo de frente): avance 0..1 del trazo y relleno al cerrar
  function corazonPintado(g, t) {
    const k = fase(t, T.corazon0, T.corazon1); if (k <= 0) return;
    const n = 40, m = Math.max(2, Math.round(n * k));
    g.save(); g.translate(LZ.x, LZ.y); g.lineCap = "round"; g.lineJoin = "round";
    const relleno = tramo(t, T.corazon1 - 0.15, T.corazon1 + 0.15);
    if (relleno > 0) { g.globalAlpha = relleno; g.beginPath(); for (let i = 0; i <= n; i++) { const q = puntoCorazon(i / n); if (i) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); } g.closePath(); g.fillStyle = "#e8434f"; g.fill(); g.globalAlpha = 1; }
    g.beginPath(); for (let i = 0; i < m; i++) { const q = puntoCorazon(Math.min(k, i / n)); if (i) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); }
    const q = puntoCorazon(k); g.lineTo(q.x, q.y);
    g.strokeStyle = "#c2232f"; g.lineWidth = 3; g.stroke();
    g.restore();
  }
  function lienzo(g, t) {
    if (!dorso) { dorso = creaDorso(); frente = creaFrente(); }
    const sx = escLienzo(t), a = Math.abs(sx);
    g.save(); g.translate(LZ.x, LZ.y); g.scale(Math.max(0.02, a), 1);
    // un poco de perspectiva al girar: el borde que se acerca crece
    g.drawImage(sx >= 0 ? dorso : frente, -LZ.w / 2 - 4, -LZ.h / 2 - 4);
    if (a < 0.98) { g.fillStyle = `rgba(0,0,0,${0.25 * (1 - a)})`; g.fillRect(-LZ.w / 2, -LZ.h / 2, LZ.w, LZ.h); }
    g.restore();
    if (girado(t)) corazonPintado(g, t);
    // rayas del giro
    const gk = Math.sin(Math.PI * fase(t, T.gira0, T.gira1));
    if (gk > 0.02) {
      g.save(); g.strokeStyle = `rgba(255,255,255,${0.8 * gk})`; g.lineWidth = 3; g.lineCap = "round";
      for (const dy of [-40, 0, 40]) { g.beginPath(); g.ellipse(LZ.x, LZ.y + dy, LZ.w * 0.62, 10, 0, Math.PI * 0.1, Math.PI * 0.9); g.stroke(); }
      g.restore();
    }
  }

  /* ---------- efectos ---------- */
  function estrellaPuntas(g, x, y, r, puntas, rot, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function destello(g, t, t0, x, y, r) {
    const k = fase(t, t0, t0 + 0.4); if (k <= 0 || k >= 1) return;
    const s = Math.sin(Math.PI * k);
    g.save(); estrellaPuntas(g, x, y, r * s, 4, t * 2, 0.22); g.fillStyle = "#fffbe0"; g.fill(); g.lineWidth = 1.6; g.strokeStyle = "#0b0a0e"; g.stroke(); g.restore();
  }
  // motitas de polvo en el haz de sol
  function polvo(g, t) {
    g.save(); g.fillStyle = "rgba(255,245,215,0.75)";
    for (let i = 0; i < 22; i++) {
      const u = (t * (0.03 + hash(i) * 0.03) + hash(i + 5)) % 1, x = 140 + hash(i + 1) * 300 + 20 * Math.sin(t * 0.7 + i), y = 80 + u * 400;
      g.globalAlpha = 0.5 * Math.sin(Math.PI * u); g.beginPath(); g.arc(x, y, 1.2 + hash(i + 2) * 1.4, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  // la mosca (pantalla)
  function mosca(g, t, pG) {
    const f = posMosca(t, pG); if (!f) return;
    g.save(); g.translate(f.x, f.y); g.rotate(f.ang); g.lineJoin = "round";
    // estela de vuelo punteada
    if (!f.posada || f.posada < 1) {
      g.restore(); g.save(); g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 1.5; g.setLineDash([3, 4]); g.beginPath();
      for (let i = 0; i <= 8; i++) { const q = posMosca(t - i * 0.035, pG); if (!q) break; if (i) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); }
      g.globalAlpha = 1 - (f.posada || 0); g.stroke(); g.setLineDash([]); g.restore(); g.save(); g.translate(f.x, f.y); g.rotate(f.ang);
    }
    // alas (aleteo rápido)
    const al = f.ala * (0.6 + 0.4 * Math.abs(Math.sin(t * 90)));
    g.fillStyle = "rgba(220,240,255,0.75)"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1;
    g.beginPath(); g.ellipse(-2, -5, 5, 2.5 + 2 * al, -0.6 - 0.5 * al, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(2, -5, 5, 2.5 + 2 * al, 0.6 + 0.5 * al, 0, Math.PI * 2); g.fill(); g.stroke();
    // cuerpo
    g.fillStyle = "#1c1c22"; g.beginPath(); g.ellipse(0, 0, 4.5, 3.4, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(4.2, -0.5, 2.4, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#c0303a"; g.beginPath(); g.arc(5, -1.2, 1.1, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#1c1c22"; g.lineWidth = 0.9; g.beginPath();
    for (const dx of [-2, 0, 2]) { g.moveTo(dx, 2); g.lineTo(dx - 1, 5); }
    g.stroke();
    g.restore();
    // zumbido: rayitas mientras vuela
    if (!(f.posada >= 1)) {
      g.save(); g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 1.4; g.lineCap = "round";
      for (let i = 0; i < 2; i++) { const a = t * 8 + i * 3; g.beginPath(); g.arc(f.x, f.y, 9 + i * 4, a, a + 0.6); g.stroke(); }
      g.restore();
    }
  }
  // soplido de lado (nubecilla) que no espanta a la mosca
  function soplido(g, t, pG) {
    const k = fase(t, T.sopla, T.sopla + 0.45); if (k <= 0 || k >= 1) return;
    const b = G.aPantalla(pG, G.boca(pG));
    g.save(); g.globalAlpha = 0.8 * (1 - k); g.fillStyle = "#ffffff"; g.strokeStyle = "rgba(60,80,100,0.6)"; g.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) { const d = 8 + 30 * salida(k) * (0.7 + 0.3 * i), x = b.x + 6 + d * 0.8, y = b.y - d * 0.9;
      g.beginPath(); g.arc(x, y, 3 + 5 * k + i, 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.restore();
  }
  // salpicaduras de pintura que asoman por detrás del lienzo al pintar
  function salpicaduras(g, t) {
    g.save(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 1;
    for (let i = 0; i < 26; i++) {
      const t0 = 2.75 + i * 0.18 + (i > 9 ? 0.75 : 0) + (i > 13 ? 0.15 : 0) - (i > 15 ? 0.32 * (i - 15) * 0.4 : 0);
      if (t0 > 7.3 || (t0 > 4.6 && t0 < 6.4)) continue;
      const u = (t - t0) / 0.55; if (u <= 0 || u >= 1) continue;
      const x0 = LZ_X1 - 4, y0 = LZ_Y0 + 20 + hash(i) * 70, vx = 50 + hash(i + 3) * 70, vy = -70 - hash(i + 5) * 60;
      const x = x0 + vx * u * 0.55, y = y0 + vy * u * 0.55 + 260 * (u * 0.55) ** 2;
      g.fillStyle = COLORES[i % COLORES.length]; g.globalAlpha = 1 - u * u;
      g.beginPath(); g.arc(x, y, 2.6, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    g.restore();
  }
  // líneas de susto alrededor de Guillermo
  function susto(g, t, pG) {
    const k = fase(t, T.ve, T.ve + 0.6); if (k <= 0 || k >= 1) return;
    const c = G.aPantalla(pG, G.cabeza(pG).a({ x: 790, y: 520 }));
    g.save(); g.globalAlpha = 1 - k; g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < 9; i++) { const a = -Math.PI * 0.95 + i * Math.PI * 0.95 / 8 - 0.05, r0 = 70 + 26 * salida(k), r1 = r0 + 18;
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0 * 0.9); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1 * 0.9); g.stroke(); }
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const aguanta = dentro(t, 4.2, 5.2, T.relaja0, T.relaja1 + 0.2);
    const cuadro = dentro(t, T.gira1, T.gira1 + 0.6, 12.4, 13.2);
    return { k: 1 + 0.1 * aguanta + 0.06 * cuadro, x: 512 - 50 * aguanta - 20 * cuadro, y: 300 - 4 * aguanta + 6 * cuadro };
  }

  function poses(t) { return { g: poseG(t), c: poseC(t) }; }

  class GuillermoRetrato extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !CA.listo()) return;
      if (!fondo) { fondo = creaFondo(); caballeteAtras = creaCaballete(); }
      const { g: pG, c: pC } = poses(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      g.drawImage(fondo, -60, -50);
      polvo(g, t);
      // sombras
      g.save(); g.fillStyle = "rgba(0,0,0,0.35)";
      g.beginPath(); g.ellipse(TAB.x, SUELO + 2, 92, 9, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pC.x, SUELO + 2, 56, 7, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(LZ.x, SUELO + 2, 96, 8, 0, 0, Math.PI * 2); g.fill();
      g.restore();
      taburete(g);
      G.dibujar(g, pG, t);
      soplido(g, t, pG);
      mosca(g, t, pG);
      susto(g, t, pG);
      // caballete: antes del giro el lienzo (de espaldas) tapa la mano del pincel; después Carla pinta por delante
      const delante = !girado(t);
      if (!delante) { g.drawImage(caballeteAtras, 510, 200); lienzo(g, t); caballeteDelante(g); }
      CA.dibujar(g, pC, t);
      if (delante) { g.drawImage(caballeteAtras, 510, 200); lienzo(g, t); caballeteDelante(g); }
      salpicaduras(g, t);
      // destellos: floritura, guiño de Carla y guiño de Guillermo
      const pt = puntaPincel(pC, pC.pincel);
      destello(g, t, T.flor1 - 0.05, pt.x, pt.y, 16);
      const ojoC = CA.aPantalla(pC, CA.cabeza(pC).a({ x: 960, y: 470 }));
      destello(g, t, T.guino + 0.05, ojoC.x - 4, ojoC.y - 8, 13);
      const ojoG = G.aPantalla(pG, G.cabeza(pG).a({ x: 735, y: 535 }));
      destello(g, t, T.guinoG + 0.08, ojoG.x - 6, ojoG.y - 8, 11);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00045", nombre: "Guillermo y Carla · El retrato", crear: () => new GuillermoRetrato() });
  window.__A2D_00045 = { pose: poses, T, DUR, posMosca };
})();
