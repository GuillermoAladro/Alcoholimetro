"use strict";
/* 00125 · Guillermo y Sara · No te rías
 *
 * Negro → un rincón tranquilo de un bar, de noche: pared azul tinta con friso de madera, una
 * ventana con la luna y la ciudad, una diana con dos dardos, un reloj sin números, una balda con
 * cajas de juegos de mesa (sin letras) y un cuadrito, una guirnalda de bombillas, suelo de tablas;
 * una mesita redonda con una vela, un refresco con pajita y una copa de vino, una lámpara colgante
 * encima y dos sillas de madera, una a cada lado. En la silla de Guillermo, bien a la vista, un
 * cojín de broma rosa.
 *
 * Reto de «el primero que se ría pierde». Sara, sentada con una mano en la mesa, es un muro de
 * piedra: cara de nada y parpadeos lentos. Guillermo, de pie, la señala, se cruje el cuello, se
 * inclina sobre la mesa y la cámara se acerca a las caras; va y viene despacio entre los dos
 * (sin cortes) mientras él hace muecas, cada una con su preparación y su pausa: lengua fuera y
 * bizco; mofletes hinchados y pedorreta (una gota de saliva le cae a Sara en la mejilla y ni
 * parpadea… bueno, despacio); las aletas de la nariz abriéndose con las cejas subiendo y bajando
 * a destiempo; y la oreja aleteando. Sara: nada (solo un tic en un ojo, una vez). Guillermo se
 * rinde, suspira y se deja caer en su silla… encima del cojín: se aplasta, suelta una pedorretita
 * (ondas de sonido y una nubecilla, sin letras). Silencio. Sara aguanta… y revienta de risa:
 * cabeza atrás, lágrimas, mano en la tripa, hombros temblando, la melena botando, la silla se le
 * va hacia atrás y casi se cae; vuelve y da palmadas en la mesa. Guillermo mira a cámara
 * sorprendido, sonríe encantado y guiña un ojo → negro.
 *
 * Todo depende de `t` (determinista). Las muecas de Guillermo se dibujan en su capa de la cara
 * (coordenadas del retrato): ojos bizcos repitiendo su globo del montaje, lengua, carrillo
 * cercano, labios de la pedorreta, aletas de la nariz y la oreja (una copia del retrato recortada
 * a la oreja y estirada desde la raíz, así siempre tapa la original). Las lágrimas, el tic y la
 * gota van en la capa de la cara de Sara.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, mezcla, hash, campana } = M2;
  const G = Guillermo, Sa = SaraSaez, R = Recortes;
  const DUR = 14.85;
  const TINTA = "#0b0a0e", TAU = Math.PI * 2;

  /* ---------- guion (s) ---------- */
  const T = {
    // el reto: la señala, se cruje el cuello y se inclina sobre la mesa
    reto: 0.5, retoFin: 1.3, cuello: 1.4, cuelloFin: 1.9, inclina: 1.95, inclinado: 2.6,
    // mueca 1: lengua fuera y bizco
    c1: 3.1, c1Ya: 3.4, c1Fin: 4.25,
    // mueca 2: mofletes y pedorreta (la gota vuela hasta Sara)
    c2: 4.95, c2Ya: 5.2, pedo: 5.6, pedoFin: 6.15, gota: 5.72, gotaLlega: 6.08,
    // mueca 3: aletas de la nariz y cejas
    c3: 6.85, c3Ya: 7.05, c3Fin: 8.05,
    // mueca 4: la oreja; el tic de Sara
    c4: 8.3, c4Ya: 8.5, c4Fin: 9.4, tic: 9.02,
    // se rinde, suspira y se sienta encima del cojín
    rinde: 9.5, suspiro: 9.85, sienta: 10.3, plof: 10.75,
    // Sara aguanta y revienta
    aguanta: 11.0, risa: 11.45, vuelca: 11.55, volcada: 11.98, vuelve: 12.08, vuelta: 12.32,
    palmadas: [12.45, 12.77, 13.09], recuesta: 13.3,
    // Guillermo: la mira, mira a cámara, sonríe y guiña
    gMira: 11.6, gCamara: 12.15, gContento: 12.55, guino: 13.15, guinoFin: 13.62,
    fin: 14.05
  };

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const lerpAng = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const RELAJADA = D(0.55, 0.62, 0.56, 0.52, 0.48), PLANA = D(0.78, 0.95, 0.92, 0.9, 0.86),
    SENALA = D(0.12, 1, 0.08, 0.06, 0.06), MUSLO = D(0.72, 0.9, 0.86, 0.82, 0.78), FLOJA = D(0.7, 0.8, 0.76, 0.72, 0.7),
    TRIPA = D(0.75, 0.82, 0.78, 0.74, 0.7), GARRA = D(0.5, 0.45, 0.4, 0.38, 0.36);

  /* ---------- caras (mismos campos para los dos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, wi: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: clamp(e.mof), rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista, d = 0.15) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* =====================================================================================
   * DISPOSICIÓN (px de pantalla, antes de la cámara)
   * ===================================================================================== */
  const S = 0.36, SUELO = 560;
  const XG = 352, XS = 656;                                 // pelvis de cada uno (Guillermo, de pie)
  const SILLA_G = { x: 300, y: 425 }, SILLA_S = { x: 662, y: 425 };   // centro del asiento (arriba)
  const MESA = { x: 512, y: 356, rx: 62, ry: 11 };
  const Y_PELVIS_G = SILLA_G.y - 18, Y_PELVIS_S = SILLA_S.y - 16;
  const PY_PIE = SUELO - (G.SUELO - G.PELVIS.y) * S;      // pelvis de Guillermo de pie
  // el cojín de broma, encima del asiento de Guillermo
  const COJIN = { x: SILLA_G.x - 6, y: SILLA_G.y - 5 };

  /* =====================================================================================
   * PISTAS DE MANOS (pantalla): [t0, t1, objetivo] con objetivo {x, y, mu, d, pu} o función (t) → {…}
   * mu = hacia el codo, en ángulo de pantalla; pu = tamaño de la mano (0 dentro del bolsillo)
   * ===================================================================================== */
  const evalua = (o, t) => (typeof o === "function" ? o(t) : o);
  const mezclaM = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), mu: lerpAng(a.mu, b.mu, k), d: mezclaD(a.d, b.d, k), pu: lerp(a.pu ?? 1, b.pu ?? 1, k) });
  function pista(lista, t) {
    let c = evalua(lista[0][2], t);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i]; if (t <= t0) break;
      c = mezclaM(c, evalua(obj, t), (f || suave)(fase(t, t0, t1)));
    }
    return c;
  }
  function manoRig(rig, p, m, dobla, objeto) {
    const h = rig.aHoja(p, m), pu = m.pu ?? 1;
    // la mano asoma del bolsillo creciendo deprisa (sin saltos)
    return { x: h.x, y: h.y, ang: 0, mu: p.espejo ? Math.PI - m.mu : m.mu, puno: pu < 0.02 ? 0 : clamp(pu), dedos: m.d, dobla, objeto };
  }
  let BASE_M = null;
  function conCamara(g, f) { g.save(); g.setTransform(BASE_M); f(); g.restore(); }

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha): de pie e inclinado sobre la mesa; luego, sentado
   * ===================================================================================== */
  const R_M = G.MUNECA_R * G.JK;
  const manoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_GC = manoDesde({ x: 131, y: 652 }, 0, -1.75), BOLS_GL = manoDesde({ x: 372, y: 648 }, 0, -1.75);

  const CARAS_G = {
    inicio: E({ mx: 0.9, my: 0.3, c: 0.25, sd: -4, gd: -0.1, si: -2, gi: -0.08, sonr: 0.1 }),
    reto: E({ mx: 0.9, my: 0.35, c: 0.48, sd: -6, gd: -0.16, si: 4, gi: -0.06, abre: 0, ancho: 0.95, sonr: 0.55 }),
    serio: E({ mx: 0.9, my: 0.45, c: 0.3, sd: -8, gd: -0.18, si: -6, gi: -0.16, abre: 0, ancho: 0.8, sonr: -0.05 }),
    apretar: E({ mx: 0.9, my: 0.4, c: 1, z: 1, sd: -8, gd: -0.1, si: -8, gi: -0.1, abre: 0, ancho: 0.55, sonr: -0.25 }),
    lengua: E({ mx: 0, my: 0.5, iris: 0.8, c: 0, sd: 32, gd: 0.1, si: 26, gi: 0.08, abre: 30, ancho: 0.82, sonr: 0.2, dientes: 1, lengua: 1 }),
    inspira: E({ mx: 0.9, my: 0.35, c: 0.05, iris: 0.9, sd: 18, gd: 0, si: 18, gi: 0, abre: 12, ancho: 0.5, sonr: 0, dientes: 0 }),
    hincha: E({ mx: 0.9, my: 0.4, c: 0, iris: 0.82, sd: 28, gd: 0.06, si: 28, gi: 0.06, abre: 0, ancho: 0.4, sonr: 0, mof: 1 }),
    pedorreta: E({ mx: 0.9, my: 0.4, c: 0.62, z: 0.6, sd: 16, gd: -0.06, si: 16, gi: -0.06, abre: 2, ancho: 0.46, sonr: -0.1, dientes: 0, mof: 0.35 }),
    arruga: E({ mx: 0.9, my: 0.4, c: 0.6, z: 0.3, sd: -8, gd: -0.12, si: -8, gi: -0.12, abre: 0, ancho: 0.7, sonr: -0.3 }),
    nariz: E({ mx: 0.9, my: 0.45, c: 0, iris: 0.9, sd: 16, si: 16, abre: 9, ancho: 0.78, sonr: -0.35, dientes: 1 }),
    pillo: E({ mx: 0.95, my: 0.35, c: 0.42, sd: 4, gd: -0.08, si: 14, gi: 0.04, abre: 0, ancho: 0.85, sonr: 0.5 }),
    orejas: E({ mx: 0.95, my: 0.4, c: 0.15, sd: 12, si: 12, abre: 11, ancho: 0.42, sonr: 0, dientes: 0 }),
    rinde: E({ mx: 0.75, my: 0.6, c: 0.55, sd: 8, gd: 0.24, si: 8, gi: 0.24, abre: 0, ancho: 0.8, sonr: -0.35 }),
    suspiro: E({ mx: 0.4, my: 0.55, c: 0.72, sd: 10, gd: 0.22, si: 10, gi: 0.22, abre: 15, ancho: 0.42, sonr: -0.2, dientes: 0 }),
    plof: E({ mx: 0.35, my: 0.85, c: 0, iris: 0.68, sd: 30, gd: 0.15, si: 30, gi: 0.15, abre: 12, ancho: 0.5, sonr: -0.1, dientes: 0 }),
    miraS: E({ mx: 0.92, my: 0.05, c: 0, iris: 0.8, sd: 28, gd: 0.12, si: 28, gi: 0.12, abre: 9, ancho: 0.6, sonr: 0.05, dientes: 0 }),
    camara: E({ mx: -0.85, my: 0, c: 0, iris: 0.82, sd: 30, gd: 0.08, si: 30, gi: 0.08, abre: 13, ancho: 0.62, sonr: 0.1, dientes: 0 }),
    contento: E({ mx: -0.85, my: 0, c: 0.3, h: 0.35, sd: 18, gd: 0.04, si: 18, gi: 0.04, abre: 12, ancho: 1.1, sonr: 1.0 }),
    guino: E({ mx: -0.85, my: 0, c: 0.25, h: 0.35, sd: 2, gd: -0.12, si: 24, gi: 0.06, abre: 10, ancho: 1.12, sonr: 1.0, wd: 1 })
  };
  const GUION_CARA_G = [
    [T.reto - 0.1, T.reto + 0.15, "reto"], [T.cuello, T.cuello + 0.2, "serio"],
    [T.c1, T.c1 + 0.12, "apretar"], [T.c1Ya - 0.04, T.c1Ya + 0.05, "lengua", salida], [T.c1Fin, T.c1Fin + 0.2, "serio"],
    [T.c2, T.c2 + 0.15, "inspira"], [T.c2Ya - 0.05, T.c2Ya + 0.06, "hincha", salida], [T.pedo - 0.03, T.pedo + 0.06, "pedorreta", salida],
    [T.pedoFin, T.pedoFin + 0.2, "serio"],
    [T.c3, T.c3 + 0.12, "arruga"], [T.c3Ya - 0.04, T.c3Ya + 0.06, "nariz", salida], [T.c3Fin, T.c3Fin + 0.2, "serio"],
    [T.c4, T.c4 + 0.15, "pillo"], [T.c4Ya - 0.03, T.c4Ya + 0.08, "orejas"], [T.c4Fin, T.c4Fin + 0.15, "serio"],
    [T.rinde, T.rinde + 0.3, "rinde"], [T.suspiro, T.suspiro + 0.15, "suspiro"], [T.suspiro + 0.45, T.sienta, "rinde"],
    [T.plof - 0.02, T.plof + 0.06, "plof", salida], [T.gMira, T.gMira + 0.12, "miraS"], [T.gCamara, T.gCamara + 0.15, "camara"],
    [T.gContento, T.gContento + 0.25, "contento"], [T.guino, T.guino + 0.1, "guino"], [T.guinoFin, T.guinoFin + 0.15, "contento"]
  ];
  const CUERPOS_G = {
    inicio: { torso: 0.03, cab: 0.04, dx: 0, dy: 0 },
    reto: { torso: 0.1, cab: 0.08, dx: 2, dy: 0 },
    cuello: { torso: 0.04, cab: 0.04, dx: 0, dy: 0 },
    inclina: { torso: 0.6, cab: 0.05, dx: -12, dy: 8 },
    prepara: { torso: 0.5, cab: -0.1, dx: -16, dy: 6 },
    mueca: { torso: 0.68, cab: 0.08, dx: -10, dy: 9 },
    rinde: { torso: 0.16, cab: 0.2, dx: -6, dy: 4 },
    suspiro: { torso: 0.06, cab: 0.04, dx: -6, dy: 0 },
    sentado: { torso: 0.04, cab: 0.04, dx: 0, dy: 0 },
    sorpresa: { torso: -0.05, cab: -0.05, dx: 0, dy: 0 },
    contento: { torso: -0.04, cab: -0.03, dx: 0, dy: 0 }
  };
  const MUECAS = [[T.c1, T.c1Ya, T.c1Fin], [T.c2, T.c2Ya, T.pedoFin], [T.c3, T.c3Ya, T.c3Fin], [T.c4, T.c4Ya, T.c4Fin]];
  const GUION_CUERPO_G = [
    [T.reto - 0.15, T.reto + 0.25, "reto"], [T.cuello, T.cuello + 0.15, "cuello"], [T.inclina, T.inclinado, "inclina"],
    ...MUECAS.flatMap(([a, b, c]) => [[a, a + 0.2, "prepara"], [b - 0.05, b + 0.12, "mueca", salida], [c, c + 0.3, "inclina"]]),
    [T.rinde, T.rinde + 0.4, "rinde"], [T.suspiro, T.suspiro + 0.35, "suspiro"], [T.sienta, T.plof, "sentado"],
    [T.gMira, T.gMira + 0.2, "sorpresa"], [T.gContento, T.gContento + 0.3, "contento"]
  ];
  // caer sentado: x hacia la silla y luego abajo, acelerando
  const sientaX = t => suave(fase(t, T.sienta, T.plof - 0.05));
  const sientaY = t => entrada(fase(t, T.sienta + 0.1, T.plof));
  // muecas (0…1)
  const bizco = t => dentro(t, T.c1Ya - 0.02, T.c1Ya + 0.08, T.c1Fin, T.c1Fin + 0.12);
  const lenguaK = t => dentro(t, T.c1Ya - 0.03, T.c1Ya + 0.1, T.c1Fin - 0.04, T.c1Fin + 0.12);
  const carrilloK = t => dentro(t, T.c2Ya - 0.06, T.c2Ya + 0.06, T.pedo, T.pedo + 0.4);
  const pedoK = t => dentro(t, T.pedo - 0.02, T.pedo + 0.05, T.pedoFin - 0.08, T.pedoFin + 0.05);
  const narizK = t => dentro(t, T.c3Ya - 0.05, T.c3Ya + 0.1, T.c3Fin - 0.1, T.c3Fin + 0.1);
  const aleteo = t => 0.5 - 0.5 * Math.cos(TAU * 2.7 * Math.max(0, t - T.c3Ya));
  const orejaK = t => dentro(t, T.c4Ya - 0.03, T.c4Ya + 0.1, T.c4Fin - 0.1, T.c4Fin + 0.08);
  const flap = t => 0.5 - 0.5 * Math.cos(TAU * 4.4 * Math.max(0, t - T.c4Ya));

  const cacheG = new Map();
  function poseG(t) {
    const k0 = t.toFixed(5);
    if (cacheG.has(k0)) return cacheG.get(k0);
    if (cacheG.size > 8) cacheG.clear();
    const p = poseG0(t); cacheG.set(k0, p); return p;
  }
  function poseG0(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const respira = Math.sin(t * 2.3);
    const p = {
      x: XG, suelo: SUELO, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.005 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // pelvis: de pie (inclinado) → sentado en la silla, con rebote en el cojín
    const kx = sientaX(t), ky = sientaY(t), u = t - T.plof;
    const rebote = u > 0 ? 7 * Math.exp(-u * 8) * Math.abs(Math.sin(u * 17)) : 0;
    const pel = { x: lerp(XG + b.dx, SILLA_G.x + 16, kx), y: lerp(PY_PIE + b.dy, Y_PELVIS_G, ky) - rebote + respira * 0.5 };
    p.pelvis = G.aHoja(p, pel);
    p.pelScr = pel;
    // al bajar se echa un poco adelante para compensar; al caer, se aplasta
    p.torso += 0.14 * campana(t, T.sienta, T.plof);
    if (u > 0) p.torsoEsc.y -= 0.045 * Math.exp(-u * 9) * Math.cos(u * 17);
    // el cuello: crac a un lado y al otro
    p.cabeza.ang += -0.2 * campana(t, T.cuello, T.cuello + 0.24) + 0.2 * campana(t, T.cuello + 0.24, T.cuello + 0.5);
    // inspira antes de hinchar los mofletes (pecho arriba)
    const ins = campana(t, T.c2 - 0.02, T.c2Ya + 0.1);
    p.torsoEsc.y += 0.03 * ins;
    // mueca 1: la cabeza se bambolea con la lengua
    const lk = lenguaK(t), w1 = Math.sin(TAU * 3.2 * Math.max(0, t - T.c1Ya));
    p.cabeza.ang += 0.07 * w1 * lk;
    // pedorreta: la cabeza vibra
    const pk = pedoK(t);
    p.cabeza.ang += 0.014 * pk * Math.sin(t * 190);
    // nariz: la cabeza sube un pelo con cada aleteo
    const nk = narizK(t), al = aleteo(t);
    p.cabeza.ang -= 0.03 * al * nk;
    // orejas: la cabeza se mece al ritmo
    const ok = orejaK(t), fl = flap(t);
    p.cabeza.ang += 0.025 * Math.sin(TAU * 2.2 * Math.max(0, t - T.c4Ya)) * ok;
    // se rinde: hombros abajo; suspiro (sube y baja el pecho)
    const sus = campana(t, T.suspiro - 0.15, T.suspiro + 0.5);
    p.torsoEsc.y += 0.03 * campana(t, T.suspiro - 0.25, T.suspiro + 0.05) - 0.025 * dentro(t, T.suspiro + 0.05, T.suspiro + 0.4, T.sienta, T.plof);
    p.cabeza.ang += 0.06 * sus;
    // contento: un saltito de hombros al guiñar
    p.pelvis.y -= 4 * campana(t, T.guino - 0.05, T.guino + 0.3) / S;
    // piernas: de pie con los pies quietos; al sentarse se adelantan y al caer dan una patadita
    const patada = u > 0 ? Math.exp(-u * 7) * Math.abs(Math.sin(u * 11)) : 0;
    for (const [lado, x0] of [["cerca", G.CADERA.cerca.x - 6], ["lejos", G.CADERA.lejos.x - 2]]) {
      const ade = 70 * kx + (lado === "cerca" ? 0 : 10) * kx;
      p.piernas[lado] = { tob: { x: x0 + ade + 30 * patada, y: G.SUELO - G.TOBILLO_ALTO - (lado === "cerca" ? 44 : 34) * patada }, ang: -0.35 * patada };
    }
    // cara
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    // nariz: las cejas suben y bajan a destiempo
    const ce = Math.sin(TAU * 2.7 * Math.max(0, t - T.c3Ya));
    ex.sd += 16 * ce * nk; ex.si -= 16 * ce * nk; ex.gd += 0.08 * ce * nk; ex.gi -= 0.08 * ce * nk;
    // orejas: las cejas botan con la oreja
    ex.sd += 9 * fl * ok; ex.si += 9 * fl * ok;
    // lengua: boca algo más abierta al menear
    ex.abre += 4 * Math.abs(w1) * lk;
    // pedorreta: los labios tiemblan
    ex.abre += 2.5 * pk * Math.sin(t * 160);
    // al aguantar la sorpresa del cojín
    p.cara = cara(ex, bizco(t) > 0.02 ? 0 : parpadeo(t, [0.25, 2.85, 6.55, 10.05, 11.95, 12.95]));
    p.sudor = 0.0;
    p.rojo = 0.32 * dentro(t, T.plof, T.plof + 0.2, T.gMira, T.gMira + 0.5) + 0.12 * carrilloK(t);
    manosG(p, t);
    p.capaCabeza = (g, tt) => capaCabezaG(g, tt, p);
    return p;
  }

  /* ---------- manos de Guillermo ---------- */
  // en la mesa (lejana, plana) y en el bolsillo (cercana); al final, en los muslos
  const MESA_L = { x: MESA.x - 40, y: MESA.y + 2, mu: -2.2, d: PLANA, pu: 1 };
  function bolsilloG(p, lado) {
    const q = G.aPantalla(p, G.tronco(p)(lado === "cerca" ? BOLS_GC : BOLS_GL));
    return { x: q.x, y: q.y, mu: -1.75 + p.torso, d: RELAJADA, pu: 0 };
  }
  function manosG(p, t) {
    const pel = p.pelScr;
    const hL = G.aPantalla(p, G.tronco(p)(G.HOMBRO));
    // señala a Sara con el antebrazo horizontal
    const SENAL = { x: hL.x + 84, y: hL.y + 18, mu: Math.PI - 0.12, d: SENALA, pu: 1 };
    const MUSLO_L = { x: pel.x + 36, y: pel.y - 18, mu: -2.45, d: MUSLO, pu: 1 };
    const MUSLO_C = { x: pel.x - 14, y: pel.y - 12, mu: -2.5, d: MUSLO, pu: 1 };
    const bl = bolsilloG(p, "lejos"), bc = bolsilloG(p, "cerca");
    // la mano de la mesa se aprieta en cada mueca
    const PL = [
      [0, 0, bl],
      [T.reto, T.reto + 0.3, SENAL, salida],
      [T.retoFin, T.cuello + 0.1, bl],
      [T.inclina + 0.08, T.inclinado, MESA_L],
      [T.rinde, T.rinde + 0.45, bl],
      [T.sienta + 0.12, T.plof - 0.05, MUSLO_L]
    ];
    const l = pista(PL, t);
    // golpecito de dedo al señalar
    l.x += 6 * campana(t, T.reto + 0.45, T.reto + 0.6) + 6 * campana(t, T.reto + 0.7, T.reto + 0.85);
    p.manoLejos = manoRig(G, p, l, -1, null);
    const PC = [
      [0, 0, bc],
      [T.sienta + 0.12, T.plof - 0.05, MUSLO_C]
    ];
    const c = pista(PC, t);
    p.manoCerca = manoRig(G, p, c, -1, null);
  }

  /* =====================================================================================
   * CAPA DE LA CARA DE GUILLERMO (coordenadas del retrato)
   * ===================================================================================== */
  const BOCA_C = { x: 803, y: 730 }, BOCA_ANG = 0.26, BOCA_ANCHO = 88;
  const OJOS = {
    d: { arriba: [[733, 551], [737, 541], [748, 541], [762, 545], [776, 550], [790, 556], [803, 561], [809, 566]], c: { x: 771, y: 563 }, r: 17.5, rx: 25, ry: 9 },
    i: { arriba: [[866, 603], [872, 597], [885, 598], [900, 602], [913, 606], [921, 611]], c: { x: 894, y: 617 }, r: 15, rx: 19, ry: 7 }
  };
  let ojosListos = false;
  function preparaOjos() {
    if (ojosListos) return; ojosListos = true;
    const PO = G.A.datos.piezas.cabeza.ojos; OJOS.d.poli = PO.derecho; OJOS.i.poli = PO.izquierdo;
    for (const o of Object.values(OJOS)) {                         // párpado superior remuestreado (como en el montaje)
      const P = o.arriba.map(q => ({ x: q[0], y: q[1] })), d = [0];
      for (let i = 1; i < P.length; i++) d.push(d[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
      o.U = []; const L = d[d.length - 1];
      for (let k = 0; k < 14; k++) { const s = L * k / 13; let i = 1; while (i < d.length - 1 && d[i] < s) i++; const f = (s - d[i - 1]) / Math.max(1e-6, d[i] - d[i - 1]); o.U.push({ x: lerp(P[i - 1].x, P[i].x, f), y: lerp(P[i - 1].y, P[i].y, f) }); }
    }
  }
  function ojo(g, o, m, escIris) {             // el globo del ojo del montaje, con su propia mirada
    const C = G.C;
    g.save(); g.beginPath(); g.moveTo(o.poli[0][0], o.poli[0][1]); for (let i = 1; i < o.poli.length; i++) g.lineTo(o.poli[i][0], o.poli[i][1]); g.closePath();
    g.fillStyle = C.blanco; g.fill(); g.clip();
    const ix = o.c.x + o.rx * m.x, iy = o.c.y + o.ry * m.y, r = o.r * escIris;
    g.fillStyle = C.iris; g.beginPath(); g.arc(ix, iy, r, 0, TAU); g.fill();
    g.fillStyle = C.irisLuz; g.beginPath(); g.ellipse(ix, iy + r * 0.32, r * 0.7, r * 0.55, 0, 0, TAU); g.fill();
    g.fillStyle = "#120806"; g.beginPath(); g.arc(ix, iy + r * 0.05, r * 0.46, 0, TAU); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(ix - r * 0.36, iy - r * 0.34, r * 0.3, r * 0.24, -0.4, 0, TAU); g.fill();
    g.beginPath(); g.arc(ix + r * 0.38, iy + r * 0.36, r * 0.12, 0, TAU); g.fill();
    g.strokeStyle = C.ojoSombra; g.lineWidth = 9; g.beginPath(); g.moveTo(o.U[0].x, o.U[0].y); for (let i = 1; i < o.U.length; i++) g.lineTo(o.U[i].x, o.U[i].y); g.stroke();
    g.restore();
  }
  // lengua fuera, colgando de la boca y meneándose a los lados
  function lenguaFuera(g, t, k, b) {
    if (k <= 0.01) return;
    const hw = BOCA_ANCHO / 2 * b.ancho, s = b.sonrisa, o = b.abre, yInf = 12 * s + 2 + o * 1.25;
    const w = Math.sin(TAU * 3.2 * Math.max(0, t - T.c1Ya));
    g.save(); g.translate(BOCA_C.x, BOCA_C.y); g.rotate(BOCA_ANG); g.translate(4, yInf * 0.45);
    g.rotate(-0.42 * w); g.scale(1, 0.25 + 0.75 * k);
    g.lineJoin = "round"; g.lineCap = "round";
    const L = 92, A = 30;
    const forma = () => { g.beginPath(); g.moveTo(-A, -6); g.bezierCurveTo(-A - 4, L * 0.55, -A * 0.6, L + 6, 0, L + 8); g.bezierCurveTo(A * 0.6, L + 6, A + 4, L * 0.55, A, -6); g.closePath(); };
    forma(); g.fillStyle = "#ec7883"; g.fill();
    g.save(); forma(); g.clip(); g.fillStyle = "rgba(160,40,60,0.33)"; g.beginPath(); g.ellipse(A * 0.55, L * 0.6, 16, L * 0.5, 0, 0, TAU); g.fill(); g.restore();
    forma(); g.lineWidth = 6; g.strokeStyle = TINTA; g.stroke();
    g.strokeStyle = "rgba(140,30,50,0.7)"; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 8); g.quadraticCurveTo(2, L * 0.45, 0, L * 0.72); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.ellipse(-A * 0.45, L * 0.38, 5, 12, 0.15, 0, TAU); g.fill();
    g.restore();
    // el labio de abajo por encima de la raíz de la lengua
    g.save(); g.translate(BOCA_C.x, BOCA_C.y); g.rotate(BOCA_ANG); g.lineCap = "round"; g.strokeStyle = TINTA; g.lineWidth = 6.5;
    g.beginPath(); g.moveTo(-hw * 0.6, yInf * 0.7); g.quadraticCurveTo(0, yInf * 1.02, hw * 0.6, yInf * 0.68); g.stroke(); g.restore();
  }
  // carrillo cercano hinchado (de la oreja a la barbilla)
  function carrillo(g, k) {
    if (k <= 0.01) return;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const A = { x: 600, y: 684 }, B = { x: 768, y: 842 }, b = 30 * k;
    const c1 = { x: 586 - b * 0.9, y: 748 + b * 0.5 }, c2 = { x: 690 - b * 0.5, y: 850 + b * 0.8 };
    g.beginPath(); g.moveTo(A.x, A.y); g.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, B.x, B.y); g.lineTo(760, 800); g.lineTo(640, 700); g.closePath();
    g.fillStyle = G.C.piel; g.fill();
    g.beginPath(); g.moveTo(A.x, A.y); g.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, B.x, B.y); g.lineWidth = 6; g.strokeStyle = TINTA; g.stroke();
    g.globalAlpha = 0.5 * clamp(k); g.fillStyle = "#fff1dc";
    g.beginPath(); g.ellipse(706, 664, 20 + 12 * k, 13 + 7 * k, -0.35, 0, TAU); g.fill();
    g.globalAlpha = clamp(k); g.strokeStyle = TINTA; g.lineWidth = 4.5;
    g.beginPath(); g.moveTo(744, 694 - 4 * k); g.quadraticCurveTo(756 - 4 * k, 716, 748, 742 + 3 * k); g.stroke();
    g.restore();
  }
  // pedorreta: los labios apretados vibran con la punta de la lengua entre ellos
  function labiosPedorreta(g, t, k) {
    if (k <= 0.01) return;
    const v = Math.sin(t * 150), v2 = Math.sin(t * 173 + 1);
    g.save(); g.translate(BOCA_C.x + 4, BOCA_C.y + 2); g.rotate(BOCA_ANG); g.scale(1.35, 1.35); g.globalAlpha = clamp(k * 1.5);
    g.lineJoin = "round"; g.lineCap = "round";
    // punta de la lengua
    g.fillStyle = "#ec7883"; g.strokeStyle = TINTA; g.lineWidth = 5;
    g.beginPath(); g.ellipse(6, 4 + 2 * v, 18, 11 + 2 * v2, 0, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.ellipse(0, 0, 5, 3, -0.2, 0, TAU); g.fill();
    // labios fruncidos que tiemblan
    g.lineWidth = 7; g.strokeStyle = TINTA;
    g.beginPath(); g.moveTo(-26, -4 + 3 * v); g.quadraticCurveTo(4, -14 - 4 * v2, 30, -4 - 3 * v); g.stroke();
    g.beginPath(); g.moveTo(-24, 10 - 3 * v); g.quadraticCurveTo(6, 22 + 4 * v2, 30, 10 + 3 * v); g.stroke();
    // rayitas de vibración delante de la boca
    g.lineWidth = 4.5; g.globalAlpha = clamp(k) * (0.6 + 0.4 * Math.abs(v2));
    for (let i = 0; i < 3; i++) {
      const x = 48 + i * 15, a = 10 + i * 6, ph = Math.sin(t * 60 + i * 2);
      g.beginPath(); g.moveTo(x, -a); g.quadraticCurveTo(x + 6 + 4 * ph, 0, x, a); g.stroke();
    }
    g.restore();
  }
  // aletas de la nariz que se abren (y soplan): la punta y el ala crecen y el agujero se hace enorme
  function nariz(g, t, k, al) {
    if (k <= 0.01) return;
    const f = k * (0.25 + 0.75 * al);
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // arrugas del puente
    g.globalAlpha = clamp(k); g.strokeStyle = "rgba(90,40,20,0.8)"; g.lineWidth = 4.5;
    for (let i = 0; i < 3; i++) { const y = 612 + i * 9 - 3 * f; g.beginPath(); g.moveTo(842 + i * 3, y); g.quadraticCurveTo(853 + i * 3, y + 5 + 3 * f, 864 + i * 3, y); g.stroke(); }
    g.globalAlpha = 1;
    // bulbo de la nariz con el ala hinchada
    const tip = { x: 886 + 8 * f, y: 670 + 2 * f }, und = { x: 846, y: 702 + 8 * f }, ala = { x: 812 - 26 * f, y: 684 };
    // contorno de abajo: de la punta, por debajo, al ala hinchada (el puente es el del retrato)
    const bajo = () => { g.moveTo(tip.x, tip.y);
      g.bezierCurveTo(tip.x + 4 + 4 * f, tip.y + 16 + 6 * f, und.x + 28, und.y + 4, und.x, und.y);
      g.bezierCurveTo(und.x - 20 - 10 * f, und.y + 2, ala.x - 4, ala.y + 16 + 6 * f, ala.x, ala.y);
      g.bezierCurveTo(ala.x + 1, ala.y - 10 - 5 * f, 820, 668 - 4 * f, 834, 668 - 2 * f); };
    g.beginPath(); g.moveTo(870, 640); g.lineTo(tip.x, tip.y); bajo(); g.lineTo(850, 650); g.closePath(); g.fillStyle = G.C.piel; g.fill();
    g.save(); g.beginPath(); g.moveTo(870, 640); g.lineTo(tip.x, tip.y); bajo(); g.lineTo(850, 650); g.closePath(); g.clip();
    g.fillStyle = "rgba(200,110,60,0.35)"; g.beginPath(); g.ellipse(und.x + 6, und.y - 4, 34 + 10 * f, 10, -0.1, 0, TAU); g.fill(); g.restore();
    g.beginPath(); g.moveTo(874, 648); g.quadraticCurveTo(880 + 3 * f, 660, tip.x, tip.y); bajo(); g.lineWidth = 6.5; g.strokeStyle = TINTA; g.stroke();
    // agujero: grande y oscuro, se abre con cada aleteo
    g.fillStyle = "#2a0d07";
    g.beginPath(); g.ellipse(846 + 4 * f, 688 + 3 * f, 10 + 16 * f, 4 + 9 * f, -0.2, 0, TAU); g.fill(); g.lineWidth = 4; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.75)"; g.beginPath(); g.ellipse(tip.x - 10, tip.y - 12, 6, 4, -0.5, 0, TAU); g.fill();
    // soplidos al abrirse
    const sp = clamp(k) * Math.max(0, Math.sin(TAU * 2.7 * Math.max(0, t - T.c3Ya) - 0.6));
    if (sp > 0.05) {
      g.globalAlpha = sp; g.strokeStyle = "rgba(255,255,255,0.95)"; g.lineWidth = 6;
      for (const [x, y, a] of [[834, 720, 1.95], [856, 722, 1.6], [880, 708, 1.2]]) {
        const r0 = 14 + 26 * (1 - sp), r1 = r0 + 22;
        g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke();
      }
    }
    g.restore();
  }
  // la oreja: una copia del retrato recortada a la oreja, estirada hacia fuera desde la raíz
  const OREJA = [[582, 501], [565, 507], [550, 520], [540, 540], [533, 575], [535, 600], [547, 625], [565, 645], [580, 656], [605, 658], [607, 640], [603, 600], [610, 560], [612, 525], [600, 507]];
  const OREJA_RAIZ = { x: 608, y: 580 };
  function oreja(g, t, k, fl) {
    if (k <= 0.01) return;
    const sx = 1 + 0.8 * fl * k, sy = 1 + 0.2 * fl * k;
    g.save(); g.translate(OREJA_RAIZ.x, OREJA_RAIZ.y); g.scale(sx, sy); g.translate(-OREJA_RAIZ.x, -OREJA_RAIZ.y);
    g.beginPath(); g.moveTo(OREJA[0][0], OREJA[0][1]); for (let i = 1; i < OREJA.length; i++) g.lineTo(OREJA[i][0], OREJA[i][1]); g.closePath();
    g.clip(); R.pieza(g, G.A, "cabeza");
    g.restore();
    // rayas de aleteo (por fuera de la oreja)
    const v = Math.sin(TAU * 4.4 * Math.max(0, t - T.c4Ya));
    g.save(); g.lineCap = "round"; g.strokeStyle = TINTA; g.lineWidth = 7; g.globalAlpha = clamp(k) * (0.5 + 0.5 * Math.abs(v));
    for (let i = 0; i < 3; i++) {
      const r = 105 + i * 26 + 26 * fl;
      g.beginPath(); g.arc(OREJA_RAIZ.x, OREJA_RAIZ.y, r, Math.PI * 0.78 + i * 0.04, Math.PI * 0.94); g.stroke();
      g.beginPath(); g.arc(OREJA_RAIZ.x, OREJA_RAIZ.y, r, Math.PI * 1.06, Math.PI * 1.22 - i * 0.04); g.stroke();
    }
    g.restore();
  }
  function capaCabezaG(g, t, p) {
    preparaOjos();
    const f = p.cara;
    const bz = bizco(t);
    if (bz > 0.01) { g.save(); g.globalAlpha = bz; ojo(g, OJOS.d, { x: 1.05, y: 0.75 }, 0.9); ojo(g, OJOS.i, { x: -1.1, y: 0.65 }, 0.9); g.restore(); }
    lenguaFuera(g, t, lenguaK(t), f.boca);
    carrillo(g, carrilloK(t));
    labiosPedorreta(g, t, pedoK(t));
    nariz(g, t, narizK(t), aleteo(t));
    oreja(g, t, orejaK(t), flap(t));
  }

  /* =====================================================================================
   * SARA (derecha, mira a la izquierda), sentada; la mano lejana en la mesa
   * ===================================================================================== */
  const PEL_S = Sa.SUELO + (Y_PELVIS_S - SUELO) / (S * Sa.K) - Sa.PELVIS.y;
  const TOB_S = Sa.SUELO - Sa.TOBILLO_ALTO;
  const CARAS_S = {
    piedra: E({ mx: 0.85, my: -0.3, c: 0.5, sd: 0, gd: 0, si: 2, gi: 0.02, abre: 0, ancho: 0.8, sonr: 0.0 }),
    abre: E({ mx: 0.6, my: 0.2, c: 0.18, iris: 0.92, sd: 8, gd: 0.04, si: 10, gi: 0.05, abre: 0, ancho: 0.78, sonr: 0.05 }),
    aguanta: E({ mx: 0.8, my: 0.1, c: 0.35, sd: 10, gd: 0.12, si: 12, gi: 0.12, abre: 0, ancho: 0.6, sonr: 0.35, mof: 0.6 }),
    risa: E({ mx: 0.5, my: 0, c: 1, h: 1, sd: 16, gd: 0.14, si: 18, gi: 0.14, abre: 32, ancho: 1.22, sonr: 1.0, dientes: 1, lengua: 1 }),
    risaBaja: E({ mx: 0.6, my: 0.3, c: 1, h: 1, sd: 14, gd: 0.16, si: 16, gi: 0.16, abre: 26, ancho: 1.18, sonr: 1.0, dientes: 1, lengua: 1 })
  };
  const GUION_CARA_S = [
    [T.plof + 0.05, T.plof + 0.15, "abre", salida], [T.aguanta, T.aguanta + 0.15, "aguanta"], [T.risa - 0.02, T.risa + 0.08, "risa", salida],
    [T.vuelve, T.vuelta, "risaBaja"], [T.recuesta, T.recuesta + 0.3, "risa"]
  ];
  const CUERPOS_S = {
    inicio: { torso: 0.08, cab: 0.0 },
    aguanta: { torso: 0.12, cab: 0.06 },
    risa: { torso: -0.14, cab: -0.36 },
    doblada: { torso: 0.3, cab: 0.18 },
    recuesta: { torso: -0.06, cab: -0.26 }
  };
  const GUION_CUERPO_S = [
    [T.aguanta, T.aguanta + 0.2, "aguanta"], [T.risa - 0.02, T.risa + 0.12, "risa", salida],
    [T.vuelve, T.vuelta + 0.05, "doblada"], [T.recuesta, T.recuesta + 0.4, "recuesta"]
  ];
  // la silla de Sara se va hacia atrás (gira sobre la pata de atrás) y vuelve
  const PIVOTE_S = { x: SILLA_S.x + 32, y: SUELO };
  function vuelco(t) {
    const a = salida(fase(t, T.vuelca, T.volcada)), b = entrada(fase(t, T.vuelve, T.vuelta));
    let th = 0.2 * a * (1 - b);
    // en lo alto, se balancea a punto de caer
    th += 0.03 * Math.sin((t - T.volcada) * 14) * dentro(t, T.volcada - 0.05, T.volcada + 0.02, T.vuelve - 0.04, T.vuelve + 0.02);
    // el golpe al volver: rebota un poco
    const u = t - T.vuelta;
    if (u > 0) th += 0.03 * Math.exp(-u * 8) * Math.abs(Math.sin(u * 16));
    return th;
  }
  const rota = (q, c, a) => { const x = q.x - c.x, y = q.y - c.y, co = Math.cos(a), si = Math.sin(a); return { x: c.x + x * co - y * si, y: c.y + x * si + y * co }; };
  // ritmo de la risa («ja-ja-ja»)
  const RITMO = 5.2;
  const risaK = t => tramo(t, T.risa - 0.02, T.risa + 0.1, salida);
  const ja = t => Math.sin(TAU * RITMO * Math.max(0, t - T.risa));
  // el tic del ojo (tres latidos)
  const tic = t => campana(t, T.tic, T.tic + 0.07) + campana(t, T.tic + 0.11, T.tic + 0.18) + 0.75 * campana(t, T.tic + 0.22, T.tic + 0.28);

  const cacheS = new Map();
  function poseS(t) {
    const k0 = t.toFixed(5);
    if (cacheS.has(k0)) return cacheS.get(k0);
    if (cacheS.size > 8) cacheS.clear();
    const p = poseS0(t); cacheS.set(k0, p); return p;
  }
  function poseS0(t) {
    const b = guion(GUION_CUERPO_S, CUERPOS_S, "inicio", t);
    const respira = Math.sin(t * 1.7 + 0.7);
    const rk = risaK(t), j = ja(t), th = vuelco(t);
    const p = {
      x: XS, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      torso: b.torso - th, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab - th, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      pelo: { viento: 0, inercia: 0 }
    };
    // pelvis en el asiento (gira con la silla)
    const pel0 = Sa.aPantalla({ x: XS, suelo: SUELO, s: S, espejo: true }, { x: Sa.PELVIS.x, y: Sa.PELVIS.y + PEL_S });
    const bote = 2.4 * Math.abs(j) * rk;
    const pel = rota({ x: pel0.x, y: pel0.y - bote + respira * 0.35 }, PIVOTE_S, th);
    p.pelvis = Sa.aHoja(p, pel);
    // hombros que tiemblan, cabeza que va y viene con cada «ja»
    p.torso += 0.035 * j * rk; p.cabeza.ang += 0.06 * Math.sin(TAU * RITMO * Math.max(0, t - T.risa) + 0.7) * rk;
    p.torsoEsc.y += 0.012 * Math.abs(j) * rk;
    // aguantando la risa: tiembla
    const ag = dentro(t, T.aguanta, T.aguanta + 0.1, T.risa - 0.02, T.risa + 0.02);
    p.torso += 0.012 * Math.sin(t * 47) * ag; p.cabeza.ang += 0.015 * Math.sin(t * 41 + 1) * ag;
    // melena: sigue a la inclinación y bota con la risa
    const b2 = guion(GUION_CUERPO_S, CUERPOS_S, "inicio", t - 0.1);
    p.pelo.inercia = clamp((b.torso - b2.torso) * 4 + (th - vuelco(t - 0.1)) * -6 + 0.5 * Math.sin(TAU * RITMO * Math.max(0, t - T.risa) - 0.9) * rk, -0.9, 0.9);
    // piernas: pies en el suelo; con la silla volcada los pies se levantan y patalean
    const pat = clamp(th / 0.2);
    for (const [lado, dx, dy] of [["cerca", 168, 0], ["lejos", 214, -10]]) {
      const q0 = Sa.aPantalla({ x: XS, suelo: SUELO, s: S, espejo: true }, { x: Sa.PELVIS.x + dx, y: TOB_S + dy });
      let q = rota(q0, PIVOTE_S, th);
      const kick = Math.sin(t * 16 + (lado === "cerca" ? 0 : 2.2));
      q = { x: q.x - 6 * pat * kick, y: q.y - 10 * pat * Math.max(0, kick) };
      p.piernas[lado] = { tob: Sa.aHoja(p, q), ang: -th * 0.8 + 0.25 * pat * kick };
    }
    // cara
    const ex = guion(GUION_CARA_S, CARAS_S, "piedra", t);
    const tc = tic(t);
    ex.wd += 0.3 * tc; ex.sonr += 0.22 * tc; ex.sd -= 4 * tc;
    ex.abre += 8 * j * rk;
    ex.mof += 0.25 * Math.sin(t * 37) * ag;
    p.cara = cara(ex, rk > 0.5 ? 0 : parpadeo(t, [1.2, 4.55, 6.38, 8.05], 0.38) + parpadeo(t, [10.9], 0.14));
    p.tic = tc;
    manosS(p, t);
    p.capaCabeza = (g, tt) => capaCabezaS(g, tt, p);
    return p;
  }

  /* ---------- manos de Sara ---------- */
  function manosS(p, t) {
    const Tr = Sa.tronco(p);
    const hL = Sa.aPantalla(p, Tr(Sa.HOMBRO));
    const EN_MESA = { x: MESA.x + 52, y: MESA.y + 2, mu: -0.75, d: PLANA, pu: 1 };
    // agarrándose al aire al volcarse (delante del pecho)
    const AIRE = { x: hL.x - 52, y: hL.y + 26, mu: -0.2, d: GARRA, pu: 1 };
    // palmadas en la mesa: sube y golpea
    const ARRIBA = { x: MESA.x + 46, y: MESA.y - 30, mu: -0.4, d: PLANA, pu: 1 };
    const PL = [
      [0, 0, EN_MESA],
      [T.risa + 0.05, T.volcada - 0.1, AIRE, salida],
      [T.vuelve, T.vuelta, EN_MESA]
    ];
    const l = pista(PL, t);
    for (const tp of T.palmadas) {
      const sube = campana(t, tp - 0.28, tp);
      if (sube > 0) { const m = mezclaM(l, ARRIBA, suave(fase(t, tp - 0.28, tp - 0.14)) * (1 - entrada(fase(t, tp - 0.1, tp)))); Object.assign(l, m); }
    }
    p.manoLejos = manoRig(Sa, p, l, -1, null);
    // mano cercana: en el bolsillo; al reír, a la tripa
    const rep = Sa.manoReposo(p, "cerca"), rq = Sa.aPantalla(p, rep);
    const BOLS = { x: rq.x, y: rq.y, mu: Math.PI - (rep.mu ?? -1.75), d: RELAJADA, pu: 0 };
    const tq = Sa.aPantalla(p, Tr({ x: Sa.PELVIS.x + 20, y: Sa.PELVIS.y - 120 }));
    const TRIPA_M = { x: tq.x, y: tq.y, mu: -0.15 + p.torso, d: TRIPA, pu: 1 };
    const PC = [[0, 0, BOLS], [T.risa + 0.1, T.risa + 0.42, TRIPA_M]];
    if (t < T.risa + 0.1) p.manoCerca = null;
    else {
      const c = pista(PC, t);
      // se frota la tripa al ritmo de la risa
      c.y += 2 * ja(t) * risaK(t);
      p.manoCerca = manoRig(Sa, p, c, -1, null);
    }
  }

  /* ---------- capa de la cara de Sara (retrato): tic, gota y lágrimas ---------- */
  const OJO_S = { d: { c: [812, 383], ext: [778, 370] }, i: { c: [921, 420], ext: [952, 418] } };
  const GOTA_MEJILLA = { x: 900, y: 500 };
  function capaCabezaS(g, t, p) {
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    // tic: dos rayitas junto al ojo cercano
    const tc = p.tic || 0;
    if (tc > 0.05) {
      g.globalAlpha = clamp(tc * 1.4); g.strokeStyle = TINTA; g.lineWidth = 6;
      g.beginPath(); g.moveTo(774, 352); g.lineTo(760, 338); g.moveTo(770, 372); g.lineTo(752, 372); g.moveTo(774, 392); g.lineTo(760, 404); g.stroke();
      g.globalAlpha = 1;
    }
    // la gota de saliva en la mejilla: resbala despacio y se seca
    const kg = dentro(t, T.gotaLlega, T.gotaLlega + 0.02, 7.3, 7.9);
    if (kg > 0.01) {
      const u = Math.max(0, t - T.gotaLlega), y = GOTA_MEJILLA.y + 22 * Math.min(1, u / 1.4);
      gotita(g, GOTA_MEJILLA.x, y, 9, kg);
      // salpicadura al llegar
      const sp = fase(t, T.gotaLlega, T.gotaLlega + 0.22);
      if (sp > 0 && sp < 1) { g.globalAlpha = 1 - sp; g.strokeStyle = "#bfe6ff"; g.lineWidth = 4;
        for (let i = 0; i < 5; i++) { const a = i * TAU / 5 + 0.4, r0 = 14 + 16 * sp, r1 = r0 + 10; g.beginPath(); g.moveTo(GOTA_MEJILLA.x + Math.cos(a) * r0, GOTA_MEJILLA.y + Math.sin(a) * r0); g.lineTo(GOTA_MEJILLA.x + Math.cos(a) * r1, GOTA_MEJILLA.y + Math.sin(a) * r1); g.stroke(); }
        g.globalAlpha = 1; }
    }
    // lágrimas de risa: chorritos que saltan de los ojos y regueros por la cara
    const rk = risaK(t);
    if (rk > 0.01) {
      const u = Math.max(0, t - T.risa);
      // regueros
      g.globalAlpha = clamp(rk) * 0.85; g.strokeStyle = "#9fd8ff"; g.lineWidth = 9;
      const lr = Math.min(1, u / 0.8);
      g.beginPath(); g.moveTo(OJO_S.d.ext[0] + 6, OJO_S.d.ext[1] + 14); g.quadraticCurveTo(760, 430, 770, 430 + 70 * lr); g.stroke();
      g.beginPath(); g.moveTo(OJO_S.i.ext[0] - 4, OJO_S.i.ext[1] + 10); g.quadraticCurveTo(958, 460, 948, 450 + 50 * lr); g.stroke();
      g.globalAlpha = 1;
      // gotas que saltan (cada una sale en su momento)
      for (let n = 0; n < 12; n++) {
        const lado = n % 2 ? "i" : "d", t0 = T.risa + 0.05 + n * 0.17, a = t - t0;
        if (a < 0 || a > 0.55) continue;
        const sg = lado === "d" ? -1 : 1, o = OJO_S[lado].ext;
        const vx = sg * (150 + 60 * hash(n * 3.7)), vy = -170 - 70 * hash(n * 1.9);
        gotita(g, o[0] + vx * a, o[1] + vy * a + 600 * a * a, 8 + 3 * hash(n), clamp(1 - a / 0.55) * rk);
      }
    }
    g.restore();
  }
  function gotita(g, x, y, r, k) {
    if (k <= 0.01) return;
    g.save(); g.globalAlpha = clamp(k); g.translate(x, y);
    g.beginPath(); g.moveTo(0, -r * 1.6); g.bezierCurveTo(r * 0.9, -r * 0.4, r, r * 0.9, 0, r); g.bezierCurveTo(-r, r * 0.9, -r * 0.9, -r * 0.4, 0, -r * 1.6); g.closePath();
    g.fillStyle = "#a8dcff"; g.fill(); g.lineWidth = Math.max(1.5, r * 0.3); g.strokeStyle = "#3d7fb8"; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.9)"; g.beginPath(); g.ellipse(-r * 0.3, -r * 0.1, r * 0.22, r * 0.35, 0.3, 0, TAU); g.fill();
    g.restore();
  }

  /* =====================================================================================
   * ATREZO (pantalla)
   * ===================================================================================== */
  const MADERA = { base: "#6b4128", luz: "#8f5a37", sombra: "#3e2416" };
  // silla de madera de bar: lado = -1 respaldo a la izquierda (Guillermo), +1 a la derecha (Sara)
  function silla(g, cx, y, lado, giro, piv) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    if (giro) { g.translate(piv.x, piv.y); g.rotate(giro); g.translate(-piv.x, -piv.y); }
    g.translate(cx, y); g.scale(lado, 1);
    const h = SUELO - y;
    // patas lejanas (más oscuras)
    g.strokeStyle = TINTA; g.lineWidth = 7.5;
    for (const [x0, x1] of [[-20, -26], [26, 30]]) { g.beginPath(); g.moveTo(x0 + 4, 4); g.lineTo(x1 + 4, h - 6); g.stroke(); }
    g.strokeStyle = MADERA.sombra; g.lineWidth = 4.5;
    for (const [x0, x1] of [[-20, -26], [26, 30]]) { g.beginPath(); g.moveTo(x0 + 4, 4); g.lineTo(x1 + 4, h - 6); g.stroke(); }
    // travesaño
    g.strokeStyle = TINTA; g.lineWidth = 6; g.beginPath(); g.moveTo(-26, h * 0.62); g.lineTo(30, h * 0.62); g.stroke();
    g.strokeStyle = MADERA.base; g.lineWidth = 3; g.beginPath(); g.moveTo(-26, h * 0.62); g.lineTo(30, h * 0.62); g.stroke();
    // respaldo: dos palos curvos y tres barrotes
    const top = -118;
    const palo = (dx) => { g.beginPath(); g.moveTo(30 + dx, 6); g.bezierCurveTo(34 + dx, -40, 30 + dx, -80, 40 + dx, top); };
    for (const [dx, col] of [[-8, MADERA.sombra], [0, MADERA.base]]) {
      palo(dx); g.strokeStyle = TINTA; g.lineWidth = 9; g.stroke(); palo(dx); g.strokeStyle = col; g.lineWidth = 5.5; g.stroke();
    }
    for (let i = 0; i < 3; i++) {
      const yy = -36 - i * 26, xx = 32 + i * 1.6;
      g.fillStyle = MADERA.base; g.strokeStyle = TINTA; g.lineWidth = 1.8;
      g.beginPath(); g.roundRect(xx - 9, yy - 5, 11, 10, 3); g.fill(); g.stroke();
    }
    // copete del respaldo
    g.fillStyle = MADERA.luz; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.roundRect(31, top - 8, 16, 14, 6); g.fill(); g.stroke();
    // asiento
    g.fillStyle = MADERA.base; g.beginPath(); g.roundRect(-40, -6, 82, 13, 5); g.fill(); g.stroke();
    g.fillStyle = MADERA.luz; g.beginPath(); g.roundRect(-36, -6, 74, 4, 2); g.fill();
    g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(-38, 3, 78, 3);
    // patas cercanas
    g.strokeStyle = TINTA; g.lineWidth = 9;
    for (const [x0, x1] of [[-28, -34], [32, 38]]) { g.beginPath(); g.moveTo(x0, 6); g.lineTo(x1, h); g.stroke(); }
    g.strokeStyle = MADERA.base; g.lineWidth = 5.5;
    for (const [x0, x1] of [[-28, -34], [32, 38]]) { g.beginPath(); g.moveTo(x0, 6); g.lineTo(x1, h); g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = 6; g.beginPath(); g.moveTo(-31, h * 0.7); g.lineTo(35, h * 0.7); g.stroke();
    g.strokeStyle = MADERA.luz; g.lineWidth = 3; g.beginPath(); g.moveTo(-31, h * 0.7); g.lineTo(35, h * 0.7); g.stroke();
    g.restore();
  }
  // mesita redonda de pie central (detrás de los dos)
  function mesa(g) {
    const { x, y, rx, ry } = MESA;
    g.save(); g.lineJoin = "round"; g.strokeStyle = TINTA; g.lineWidth = 2;
    // pie de hierro
    g.fillStyle = "#1c1a1f"; g.beginPath(); g.ellipse(x, SUELO - 2, 40, 7, 0, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = "#26232a"; g.fillRect(x - 6, y + 8, 12, SUELO - y - 12); g.strokeRect(x - 6, y + 8, 12, SUELO - y - 12);
    g.fillStyle = "#4a4650"; g.fillRect(x - 3, y + 10, 3, SUELO - y - 18);
    g.fillStyle = "#26232a"; g.beginPath(); g.ellipse(x, y + 50, 13, 5, 0, 0, TAU); g.fill(); g.stroke();
    // tablero: canto y cara de arriba
    g.fillStyle = MADERA.sombra; g.beginPath(); g.ellipse(x, y + 7, rx, ry, 0, 0, Math.PI); g.lineTo(x - rx, y); g.ellipse(x, y, rx, ry, 0, Math.PI, 0, true); g.closePath(); g.fill(); g.stroke();
    const gt = g.createLinearGradient(x - rx, y - ry, x + rx, y + ry); gt.addColorStop(0, "#7a4a2c"); gt.addColorStop(0.5, "#94603a"); gt.addColorStop(1, "#6a3f25");
    g.fillStyle = gt; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); g.stroke();
    g.strokeStyle = "rgba(255,220,170,0.18)"; g.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(x + 4, y + 1, rx * (0.3 + i * 0.17), ry * (0.3 + i * 0.17), 0, 3.6, 5.6); g.stroke(); }
    g.restore();
  }
  // vela en un tarro, un refresco con pajita (de él) y una copa de vino (de ella)
  function bodegon(g, t) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = TINTA;
    // refresco
    const rx = MESA.x - 14, ry = MESA.y - 1;
    g.fillStyle = "rgba(220,235,245,0.35)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(rx - 8, ry - 30); g.lineTo(rx + 8, ry - 30); g.lineTo(rx + 7, ry); g.lineTo(rx - 7, ry); g.closePath(); g.fill();
    g.fillStyle = "#4a1c10"; g.beginPath(); g.moveTo(rx - 7.4, ry - 22); g.lineTo(rx + 7.4, ry - 22); g.lineTo(rx + 7, ry - 1); g.lineTo(rx - 7, ry - 1); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,0.55)"; g.fillRect(rx - 5, ry - 21, 4, 4); g.fillRect(rx + 1, ry - 18, 4, 4);
    g.strokeStyle = TINTA; g.beginPath(); g.moveTo(rx - 8, ry - 30); g.lineTo(rx - 7, ry); g.lineTo(rx + 7, ry); g.lineTo(rx + 8, ry - 30); g.stroke();
    // pajita a rayas
    g.lineWidth = 3; g.strokeStyle = "#f4f0ea"; g.beginPath(); g.moveTo(rx + 2, ry - 12); g.lineTo(rx + 6, ry - 40); g.lineTo(rx + 13, ry - 44); g.stroke();
    g.lineWidth = 1.4; g.strokeStyle = "#d8344a"; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(rx + 2, ry - 12); g.lineTo(rx + 6, ry - 40); g.lineTo(rx + 13, ry - 44); g.stroke(); g.setLineDash([]);
    // copa de vino
    const cx = MESA.x + 30, cy = MESA.y - 2;
    g.strokeStyle = TINTA; g.lineWidth = 1.6; g.fillStyle = "rgba(220,235,245,0.3)";
    g.beginPath(); g.ellipse(cx, cy, 7, 2, 0, 0, TAU); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy - 14); g.stroke();
    g.beginPath(); g.moveTo(cx - 8, cy - 32); g.quadraticCurveTo(cx - 9, cy - 16, cx, cy - 14); g.quadraticCurveTo(cx + 9, cy - 16, cx + 8, cy - 32); g.fill();
    g.fillStyle = "#6e0f22"; g.beginPath(); g.moveTo(cx - 8.4, cy - 25); g.quadraticCurveTo(cx - 8, cy - 15, cx, cy - 15); g.quadraticCurveTo(cx + 8, cy - 15, cx + 8.4, cy - 25); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(cx - 8, cy - 32); g.quadraticCurveTo(cx - 9, cy - 16, cx, cy - 14); g.quadraticCurveTo(cx + 9, cy - 16, cx + 8, cy - 32); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.6)"; g.fillRect(cx - 6, cy - 29, 1.6, 9);
    // vela en su tarro (llama que tiembla)
    const vx = MESA.x + 6, vy = MESA.y - 5;
    const fl = 1 + 0.12 * Math.sin(t * 13) + 0.08 * Math.sin(t * 23 + 1), ln = 0.08 * Math.sin(t * 7.3);
    const gl = g.createRadialGradient(vx, vy - 22, 1, vx, vy - 22, 40 * fl);
    gl.addColorStop(0, "rgba(255,200,110,0.4)"); gl.addColorStop(1, "rgba(255,200,110,0)");
    g.fillStyle = gl; g.fillRect(vx - 44, vy - 66, 88, 88);
    g.fillStyle = "#efe2c8"; g.fillRect(vx - 5, vy - 14, 10, 13);
    g.save(); g.translate(vx, vy - 15); g.rotate(ln); g.scale(1, fl);
    g.fillStyle = "#ffd36a"; g.beginPath(); g.moveTo(0, -11); g.quadraticCurveTo(4.4, -3, 0, 1); g.quadraticCurveTo(-4.4, -3, 0, -11); g.fill();
    g.fillStyle = "#fff6d6"; g.beginPath(); g.moveTo(0, -6); g.quadraticCurveTo(2, -2, 0, 0.5); g.quadraticCurveTo(-2, -2, 0, -6); g.fill();
    g.restore();
    g.fillStyle = "rgba(255,190,120,0.22)"; g.strokeStyle = "rgba(20,14,10,0.9)"; g.lineWidth = 1.5;
    g.beginPath(); g.roundRect(vx - 8, vy - 22, 16, 22, 3); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.4)"; g.fillRect(vx - 6, vy - 19, 2, 15);
    g.restore();
  }
  // lámpara colgante de latón encima de la mesa y su cono de luz
  const FOCO = { x: 540, y: 96 };
  function lampara(g, t) {
    const bal = 0.015 * Math.sin(t * 0.8);
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.translate(FOCO.x, -90); g.rotate(bal);
    const L = FOCO.y + 90;
    g.strokeStyle = TINTA; g.lineWidth = 2.2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, L - 30); g.stroke();
    g.fillStyle = "#3a2d1e"; g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.roundRect(-4, L - 34, 8, 10, 2); g.fill(); g.stroke();
    const gp = g.createLinearGradient(-30, 0, 30, 0); gp.addColorStop(0, "#6a4a1c"); gp.addColorStop(0.35, "#d9a84e"); gp.addColorStop(0.6, "#a8792e"); gp.addColorStop(1, "#4e3412");
    g.fillStyle = gp; g.beginPath(); g.moveTo(-9, L - 25); g.quadraticCurveTo(-28, L - 22, -30, L); g.lineTo(30, L); g.quadraticCurveTo(28, L - 22, 9, L - 25); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#fff3cc"; g.beginPath(); g.ellipse(0, L, 30, 5.5, 0, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(0, L + 1, 10, 2.6, 0, 0, TAU); g.fill();
    g.restore();
  }
  function conoLuz(g, t) {
    const k = 0.93 + 0.07 * Math.sin(t * 0.7);
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createLinearGradient(0, FOCO.y, 0, MESA.y + 10);
    gr.addColorStop(0, `rgba(255,200,130,${0.085 * k})`); gr.addColorStop(1, "rgba(255,200,130,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(FOCO.x - 28, FOCO.y + 2); g.lineTo(FOCO.x + 28, FOCO.y + 2); g.lineTo(FOCO.x + 120, MESA.y + 10); g.lineTo(FOCO.x - 120, MESA.y + 10); g.closePath(); g.fill();
    const gp = g.createRadialGradient(MESA.x + 10, MESA.y, 4, MESA.x + 10, MESA.y, 110);
    gp.addColorStop(0, `rgba(255,190,120,${0.12 * k})`); gp.addColorStop(1, "rgba(255,190,120,0)");
    g.fillStyle = gp; g.fillRect(MESA.x - 100, MESA.y - 110, 220, 220);
    const gh = g.createRadialGradient(FOCO.x, FOCO.y, 4, FOCO.x, FOCO.y, 70);
    gh.addColorStop(0, `rgba(255,220,160,${0.18 * k})`); gh.addColorStop(1, "rgba(255,220,160,0)");
    g.fillStyle = gh; g.fillRect(FOCO.x - 70, FOCO.y - 70, 140, 140);
    g.restore();
  }
  // sombras en el suelo
  function sombras(g, pS) {
    g.save(); g.fillStyle = "rgba(0,0,0,0.32)";
    for (const [x, w] of [[MESA.x, 60], [SILLA_G.x + 2, 52], [SILLA_S.x + 4, 52]]) { g.beginPath(); g.ellipse(x, SUELO + 2, w, 7, 0, 0, TAU); g.fill(); }
    g.restore();
  }

  /* ---------- el cojín de broma (pantalla) ---------- */
  // aplastado: 0 inflado → 1 chafado; el aire se va a la parte de atrás (que asoma tras él) y sale
  // por la boquilla, que cuelga por detrás del asiento
  const BOQUILLA = 0.55, L_BOQ = 18;
  const aplasta = t => salida(fase(t, T.plof - 0.05, T.plof + 0.03));
  const saleAire = t => dentro(t, T.plof - 0.03, T.plof + 0.02, T.plof + 0.42, T.plof + 0.62);
  function formaCojin(t) {
    const a = aplasta(t), u = t - T.plof;
    const tiembla = u > 0 ? Math.exp(-u * 6) * Math.sin(u * 60) : 0;
    const rx = lerp(25, 30, a) + 1.2 * tiembla, ry = lerp(7.5, 2.6, a), x = COJIN.x - 2 * a, y = COJIN.y + 2.5 * a;
    // bulto de atrás: se hincha al aplastarlo y se desinfla al salir el aire
    const bu = a * lerp(1, 0.4, salida(fase(t, T.plof + 0.05, T.plof + 0.6)));
    const bx = x - rx + 2, by = y - 3 * bu, brx = 12 * bu, bry = 8.5 * bu;
    const nx = Math.min(x - rx, bx - brx) + 3, ny = y;
    const ab = 0.55 * Math.sin(Math.max(0, u) * 55) * saleAire(t);
    const an = BOQUILLA + ab;
    return { a, rx, ry, x, y, bu, bx, by, brx, bry, nx, ny, an, punta: { x: nx - L_BOQ * Math.sin(an), y: ny + L_BOQ * Math.cos(an) } };
  }
  function cojin(g, t) {
    const c = formaCojin(t), sale = saleAire(t);
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // boquilla: un tubito que se estrecha, con su aro; aletea al salir el aire
    g.save(); g.translate(c.nx, c.ny); g.rotate(c.an);
    g.fillStyle = "#e85d97"; g.strokeStyle = TINTA; g.lineWidth = 1.8;
    const w1 = 3.4, w2 = 2.2 + 1.4 * sale;
    g.beginPath(); g.moveTo(-w1, 0); g.lineTo(w1, 0); g.lineTo(w2, L_BOQ); g.lineTo(-w2, L_BOQ); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#b8336c"; g.beginPath(); g.roundRect(-w2 - 1.2, L_BOQ - 3, 2 * w2 + 2.4, 4, 1.5); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.5)"; g.fillRect(-w1 + 1.2, 2, 1.2, L_BOQ - 6);
    g.restore();
    // el cojín (y el bulto de atrás)
    const gr = g.createLinearGradient(0, c.y - 9, 0, c.y + c.ry); gr.addColorStop(0, "#ffb3d2"); gr.addColorStop(0.5, "#ff78ae"); gr.addColorStop(1, "#d24c86");
    g.fillStyle = gr; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, TAU);
    if (c.bu > 0.02) g.ellipse(c.bx, c.by, c.brx, c.bry, 0, 0, TAU);
    g.fill(); g.stroke();
    if (c.bu > 0.02) { g.fillStyle = gr; g.beginPath(); g.ellipse(c.bx + c.brx * 0.6, c.y, c.brx * 0.7, c.ry * 0.9, 0, 0, TAU); g.fill(); }
    g.fillStyle = "rgba(255,255,255,0.65)";
    g.beginPath(); g.ellipse(c.x - c.rx * 0.35, c.y - c.ry * 0.45, c.rx * 0.28, Math.max(0.8, c.ry * 0.25), -0.1, 0, TAU); g.fill();
    if (c.bu > 0.02) { g.beginPath(); g.ellipse(c.bx - c.brx * 0.3, c.by - c.bry * 0.4, c.brx * 0.3, c.bry * 0.22, -0.3, 0, TAU); g.fill(); }
    g.restore();
  }
  function efectoCojin(g, t) {
    const u = t - T.plof;
    if (u < -0.03 || u > 1.0) return;
    const c = formaCojin(t), q = c.punta, sale = saleAire(t);
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    // nubecilla de aire
    for (let i = 0; i < 5; i++) {
      const v = u - i * 0.06; if (v < 0 || v > 0.8) continue;
      const k = v / 0.8, r = 3 + 10 * Math.sqrt(k);
      g.globalAlpha = 0.85 * (1 - k); g.fillStyle = "#f1eef8"; g.strokeStyle = "rgba(70,60,80,0.55)"; g.lineWidth = 1.3;
      g.beginPath(); g.arc(q.x - 6 - 34 * k - i * 2, q.y + 4 - 18 * k - (i % 2) * 5, r, 0, TAU); g.fill(); g.stroke();
    }
    // ondas de sonido: arcos limpios que se abren hacia atrás
    for (let i = 0; i < 3; i++) {
      const v = u - i * 0.11; if (v < 0 || v > 0.6) continue;
      const k = v / 0.6, r = 9 + 42 * k;
      g.globalAlpha = 1 - k; g.strokeStyle = "#fff3c4"; g.lineWidth = 3.4;
      g.beginPath(); g.arc(q.x, q.y, r, Math.PI - 0.8, Math.PI + 0.8); g.stroke();
    }
    // rayitas de vibración junto a la boquilla
    if (sale > 0.05) {
      g.globalAlpha = sale * (0.5 + 0.5 * Math.abs(Math.sin(u * 50))); g.strokeStyle = "#fff3c4"; g.lineWidth = 2;
      for (const sg of [-1, 1]) { const nx = Math.cos(c.an) * sg, ny = Math.sin(c.an) * sg;
        g.beginPath(); g.moveTo(q.x + nx * 7, q.y + ny * 7); g.lineTo(q.x + nx * 12, q.y + ny * 12); g.stroke(); }
    }
    g.restore();
  }

  /* ---------- fondo (una vez) ---------- */
  let fondo = null, vineta = null;
  const FRISO = 330, PARED = 508;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 160; c.height = H + 140; const g = c.getContext("2d");
    g.translate(80, 70); g.lineJoin = "round"; g.lineCap = "round";
    // pared azul tinta con un papel de rombos muy suave
    const gr = g.createLinearGradient(0, -70, 0, FRISO);
    gr.addColorStop(0, "#0f1a28"); gr.addColorStop(0.55, "#182a3e"); gr.addColorStop(1, "#14243a");
    g.fillStyle = gr; g.fillRect(-80, -70, W + 160, FRISO + 70);
    g.strokeStyle = "rgba(160,190,230,0.05)"; g.lineWidth = 1;
    for (let x = -80; x < W + 80; x += 28) for (let y = -70; y < FRISO; y += 28) { g.beginPath(); g.moveTo(x, y + 14); g.lineTo(x + 14, y); g.lineTo(x + 28, y + 14); g.lineTo(x + 14, y + 28); g.closePath(); g.stroke(); }
    for (let i = 0; i < 260; i++) { const x = -80 + hash(i * 3.1) * (W + 160), y = -70 + hash(i * 7.7) * (FRISO + 70), r = 8 + 26 * hash(i * 1.3);
      g.fillStyle = `rgba(${hash(i) > 0.5 ? "190,210,255" : "0,0,0"},${0.02 + 0.025 * hash(i * 9.1)})`; g.beginPath(); g.ellipse(x, y, r, r * 0.7, hash(i) * 3, 0, TAU); g.fill(); }
    // friso de madera con cuarterones
    g.fillStyle = "#3a2216"; g.fillRect(-80, FRISO, W + 160, PARED - FRISO);
    for (let x = -60; x < W + 80; x += 96) {
      g.fillStyle = "#43281a"; g.fillRect(x + 8, FRISO + 22, 80, PARED - FRISO - 46);
      g.strokeStyle = "rgba(0,0,0,0.55)"; g.lineWidth = 2; g.strokeRect(x + 8, FRISO + 22, 80, PARED - FRISO - 46);
      g.strokeStyle = "rgba(255,200,150,0.12)"; g.beginPath(); g.moveTo(x + 9, PARED - 25); g.lineTo(x + 87, PARED - 25); g.lineTo(x + 87, FRISO + 23); g.stroke();
    }
    g.fillStyle = "#5a3826"; g.fillRect(-80, FRISO - 6, W + 160, 12); g.fillStyle = "rgba(255,210,160,0.22)"; g.fillRect(-80, FRISO - 6, W + 160, 3);
    g.fillStyle = "rgba(0,0,0,0.5)"; g.fillRect(-80, FRISO + 6, W + 160, 3);
    g.fillStyle = "#1e120c"; g.fillRect(-80, PARED - 14, W + 160, 14);
    // suelo de tablas en perspectiva
    const VP = { x: 512, y: -300 };
    const xEn = (X, y) => VP.x + (X - VP.x) * (y - VP.y) / (PARED - VP.y);
    for (let k = -14; k < 16; k++) {
      const X0 = 512 + k * 48, X1 = X0 + 48, yb = H + 70;
      g.beginPath(); g.moveTo(xEn(X0, PARED), PARED); g.lineTo(xEn(X1, PARED), PARED); g.lineTo(xEn(X1, yb), yb); g.lineTo(xEn(X0, yb), yb); g.closePath();
      g.fillStyle = k % 2 ? "#4a2d1b" : "#55341f"; g.fill(); g.strokeStyle = "rgba(0,0,0,0.45)"; g.lineWidth = 1.5; g.stroke();
      // juntas de las tablas
      const yj = PARED + 20 + 70 * hash(k * 5.3);
      g.beginPath(); g.moveTo(xEn(X0, yj), yj); g.lineTo(xEn(X1, yj), yj); g.stroke();
    }
    const gs = g.createLinearGradient(0, PARED, 0, PARED + 130); gs.addColorStop(0, "rgba(8,6,12,0.55)"); gs.addColorStop(1, "rgba(8,6,12,0.2)"); g.fillStyle = gs; g.fillRect(-80, PARED, W + 160, 170);
    // ventana con la luna y la ciudad (izquierda)
    g.save(); g.translate(40, 70);
    const gc = g.createLinearGradient(0, 0, 0, 170); gc.addColorStop(0, "#0a1430"); gc.addColorStop(1, "#24366a");
    g.fillStyle = gc; g.fillRect(0, 0, 110, 170);
    g.fillStyle = "#fff8dc"; g.beginPath(); g.arc(78, 34, 14, 0, TAU); g.fill(); g.fillStyle = "#0e1934"; g.beginPath(); g.arc(84, 29, 12, 0, TAU); g.fill();
    for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(255,255,240,${0.4 + 0.5 * hash(i * 4.2)})`; g.fillRect(4 + hash(i * 2.7) * 100, 4 + hash(i * 6.1) * 80, 1.6, 1.6); }
    for (let i = 0; i < 7; i++) { const x = i * 17 - 4, h = 40 + 50 * hash(i * 3.3); g.fillStyle = "#0b1120"; g.fillRect(x, 170 - h, 16, h);
      for (let r = 0; r < h / 10 - 1; r++) for (let q = 0; q < 2; q++) if (hash(i * 10 + r * 3 + q) > 0.55) { g.fillStyle = "#ffcf6a"; g.fillRect(x + 3 + q * 7, 170 - h + 6 + r * 10, 3, 4); } }
    g.strokeStyle = "#2a1c12"; g.lineWidth = 8; g.strokeRect(0, 0, 110, 170);
    g.lineWidth = 5; g.beginPath(); g.moveTo(55, 0); g.lineTo(55, 170); g.moveTo(0, 85); g.lineTo(110, 85); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(-4, -4, 118, 178);
    g.fillStyle = "#4a3020"; g.fillRect(-10, 172, 130, 9); g.strokeRect(-10, 172, 130, 9);
    g.fillStyle = "rgba(255,255,255,0.07)"; g.beginPath(); g.moveTo(6, 6); g.lineTo(40, 6); g.lineTo(6, 60); g.closePath(); g.fill();
    g.restore();
    // diana con dos dardos
    g.save(); g.translate(222, 150);
    g.fillStyle = "#1c1410"; g.beginPath(); g.arc(0, 0, 40, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    for (let i = 0; i < 20; i++) { const a0 = i * TAU / 20 - Math.PI / 20, a1 = a0 + TAU / 20;
      for (const [r0, r1, c1, c2] of [[0, 30, "#141210", "#efe3c4"], [26, 30, "#c8202f", "#1f7a3c"], [14, 17, "#c8202f", "#1f7a3c"]]) {
        g.fillStyle = i % 2 ? c1 : c2; g.beginPath(); g.arc(0, 0, r1, a0, a1); g.arc(0, 0, r0, a1, a0, true); g.closePath(); g.fill(); } }
    g.fillStyle = "#1f7a3c"; g.beginPath(); g.arc(0, 0, 5, 0, TAU); g.fill(); g.fillStyle = "#c8202f"; g.beginPath(); g.arc(0, 0, 2.4, 0, TAU); g.fill();
    g.strokeStyle = "#c9c2b0"; g.lineWidth = 0.7; g.beginPath(); g.arc(0, 0, 30, 0, TAU); g.stroke();
    for (const [x, y, a] of [[-8, -12, -0.5], [11, 6, -0.25]]) {
      g.save(); g.translate(x, y); g.rotate(a);
      g.strokeStyle = "#9aa0aa"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(-14, 0); g.stroke();
      g.fillStyle = "#e0a020"; g.beginPath(); g.moveTo(-14, 0); g.lineTo(-24, -6); g.lineTo(-22, 0); g.lineTo(-24, 6); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1; g.stroke();
      g.restore();
    }
    g.restore();
    // reloj sin números
    g.save(); g.translate(700, 92);
    g.fillStyle = "#2a1c12"; g.beginPath(); g.arc(0, 0, 25, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#efe6cf"; g.beginPath(); g.arc(0, 0, 20, 0, TAU); g.fill();
    g.strokeStyle = "#2a1c12"; for (let i = 0; i < 12; i++) { const a = i * TAU / 12, r0 = i % 3 ? 16 : 14; g.lineWidth = i % 3 ? 1.2 : 2.2; g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.lineTo(Math.cos(a) * 18.5, Math.sin(a) * 18.5); g.stroke(); }
    g.restore();
    // balda con cajas de juegos de mesa (sin letras), un tarro de dados y un cuadrito debajo
    g.save(); g.translate(790, 168);
    g.fillStyle = "#4a2d1b"; g.fillRect(0, 0, 200, 9); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(0, 0, 200, 9);
    g.fillStyle = "#2c1a10"; g.beginPath(); g.moveTo(18, 9); g.lineTo(18, 26); g.lineTo(30, 9); g.closePath(); g.fill(); g.beginPath(); g.moveTo(182, 9); g.lineTo(182, 26); g.lineTo(170, 9); g.closePath(); g.fill();
    const cajas = [[6, 14, 46, "#c8402f"], [8, 10, 44, "#2a6fd0"], [10, 12, 40, "#e0b030"], [12, 9, 38, "#2c9a54"]];
    let yy = 0;
    for (const [x, h, w, col] of cajas) { yy -= h; g.fillStyle = col; g.fillRect(x, yy, w, h); g.strokeRect(x, yy, w, h); g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(x + 4, yy + 3, w * 0.3, 2.5);
      g.fillStyle = "rgba(0,0,0,0.25)"; g.beginPath(); g.arc(x + w - 9, yy + h / 2, Math.min(3, h * 0.25), 0, TAU); g.fill(); }
    // cajas de pie
    for (const [x, w, h, col] of [[64, 9, 44, "#8a3ac8"], [74, 8, 40, "#d65a20"], [83, 10, 46, "#1d1d24"], [94, 7, 36, "#e7d9b8"]]) {
      g.fillStyle = col; g.fillRect(x, -h, w, h); g.strokeRect(x, -h, w, h); g.fillStyle = "rgba(255,255,255,0.3)"; g.fillRect(x + 2, -h + 4, 2, h - 8); }
    // tarro con dados
    g.fillStyle = "rgba(210,230,240,0.35)"; g.beginPath(); g.roundRect(116, -26, 24, 26, 4); g.fill(); g.stroke();
    for (const [x, y, col] of [[121, -9, "#f2efe8"], [130, -8, "#c8202f"], [125, -18, "#2a6fd0"], [133, -17, "#f2efe8"]]) { g.fillStyle = col; g.fillRect(x, y, 7, 7); g.lineWidth = 0.8; g.strokeRect(x, y, 7, 7); g.fillStyle = col === "#f2efe8" ? "#111" : "#fff"; g.beginPath(); g.arc(x + 3.5, y + 3.5, 1, 0, TAU); g.fill(); }
    g.lineWidth = 2;
    // una planta pequeña
    g.fillStyle = "#b5643a"; g.beginPath(); g.moveTo(152, -16); g.lineTo(176, -16); g.lineTo(172, 0); g.lineTo(156, 0); g.closePath(); g.fill(); g.stroke();
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.36; g.fillStyle = i % 2 ? "#3f8f4c" : "#4fa85c"; g.beginPath(); g.ellipse(164 + Math.cos(a) * 12, -18 + Math.sin(a) * 12, 9, 3.5, a, 0, TAU); g.fill(); g.lineWidth = 1; g.stroke(); }
    g.restore();
    // cuadrito: montañas y luna
    g.save(); g.translate(880, 262);
    g.fillStyle = "#2a1c12"; g.fillRect(-40, -30, 80, 60); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(-40, -30, 80, 60);
    const gq = g.createLinearGradient(0, -24, 0, 24); gq.addColorStop(0, "#f2b36a"); gq.addColorStop(1, "#c8604a"); g.fillStyle = gq; g.fillRect(-34, -24, 68, 48);
    g.fillStyle = "#fff4d8"; g.beginPath(); g.arc(14, -8, 6, 0, TAU); g.fill();
    g.fillStyle = "#5a2e3a"; g.beginPath(); g.moveTo(-34, 24); g.lineTo(-14, -4); g.lineTo(0, 10); g.lineTo(14, -2); g.lineTo(34, 24); g.closePath(); g.fill();
    g.fillStyle = "#3a1c28"; g.beginPath(); g.moveTo(-34, 24); g.lineTo(-20, 12); g.lineTo(-4, 24); g.closePath(); g.fill();
    g.restore();
    // guirnalda de bombillas (cable y bombillas con su halo)
    const cuelga = x => 26 + 26 * Math.abs(Math.sin((x + 60) / 340 * Math.PI)) + 6 * Math.sin(x / 50);
    g.strokeStyle = "#0a0a0c"; g.lineWidth = 2; g.beginPath(); for (let x = -80; x <= W + 80; x += 8) { const y = cuelga(x); if (x === -80) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke();
    const cols = ["#ffd36a", "#ff8a5a", "#ffe9a8", "#ffb84a"];
    for (let i = 0, x = -60; x < W + 80; x += 46, i++) {
      const y = cuelga(x) + 7, col = cols[i % 4];
      const gl = g.createRadialGradient(x, y, 1, x, y, 22); gl.addColorStop(0, "rgba(255,210,140,0.35)"); gl.addColorStop(1, "rgba(255,210,140,0)");
      g.fillStyle = gl; g.fillRect(x - 22, y - 22, 44, 44);
      g.fillStyle = "#1a1a1e"; g.fillRect(x - 2, y - 9, 4, 4);
      g.fillStyle = col; g.beginPath(); g.ellipse(x, y, 3.6, 5, 0, 0, TAU); g.fill();
    }
    return c;
  }
  function creaVineta() {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    const gv = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.68);
    gv.addColorStop(0, "rgba(0,0,0,0)"); gv.addColorStop(1, "rgba(0,0,8,0.5)");
    g.fillStyle = gv; g.fillRect(0, 0, W, H);
    return c;
  }

  /* ---------- efectos (pantalla) ---------- */
  function puntoBocaG(pG) { return G.aPantalla(pG, G.cabeza(pG).a({ x: 830, y: 742 })); }
  function puntoMejillaS(pS) { return Sa.aPantalla(pS, Sa.cabeza(pS).a(GOTA_MEJILLA)); }
  function efectos(g, t, pG, pS) {
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    // crac del cuello: rayitas junto al cuello
    for (const tc of [T.cuello + 0.2, T.cuello + 0.44]) {
      const k = fase(t, tc, tc + 0.22);
      if (k > 0 && k < 1) {
        const n = G.aPantalla(pG, G.tronco(pG)(G.CUELLO));
        g.strokeStyle = `rgba(255,248,220,${Math.sin(Math.PI * k)})`; g.lineWidth = 1.5;
        for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.5, r0 = 10 + 6 * k, r1 = r0 + 5; g.beginPath(); g.moveTo(n.x - 10 + Math.cos(a) * r0, n.y - 6 + Math.sin(a) * r0); g.lineTo(n.x - 10 + Math.cos(a) * r1, n.y - 6 + Math.sin(a) * r1); g.stroke(); }
      }
    }
    // saliva de la pedorreta: gotitas que salen hacia Sara (y una que llega a su mejilla)
    const b = puntoBocaG(pG);
    for (let n = 0; n < 9; n++) {
      const t0 = T.pedo + 0.04 + n * 0.055, a = t - t0;
      if (a < 0 || a > 0.4) continue;
      const vx = 120 + 90 * hash(n * 2.1), vy = -40 - 60 * hash(n * 5.3);
      gotitaP(g, b.x + vx * a, b.y + vy * a + 260 * a * a, 1.4 + 0.8 * hash(n), 1 - a / 0.4);
    }
    const kg = fase(t, T.gota, T.gotaLlega);
    if (kg > 0 && kg < 1) {
      const b0 = puntoBocaG(poseG(T.gota)), m1 = puntoMejillaS(poseS(T.gotaLlega));
      const x = lerp(b0.x, m1.x, kg), y = lerp(b0.y, m1.y, kg) - 34 * Math.sin(Math.PI * kg);
      gotitaP(g, x, y, 2.4, 1);
    }
    // suspiro: una nube que sale de la boca y cae
    for (let i = 0; i < 5; i++) {
      const t0 = T.suspiro + 0.02 + i * 0.07, k = fase(t, t0, t0 + 0.75);
      if (k <= 0 || k >= 1) continue;
      const bs = puntoBocaG(poseG(t0));
      g.globalAlpha = 0.7 * Math.sin(Math.PI * Math.sqrt(k)); g.fillStyle = "#f2f4fa"; g.strokeStyle = "rgba(70,80,100,0.5)"; g.lineWidth = 1;
      g.beginPath(); g.arc(bs.x + 6 + 26 * k + (i % 2) * 4, bs.y + 2 + 20 * k - (i % 3) * 3, 2.5 + 7 * Math.sqrt(k), 0, TAU); g.fill(); g.stroke();
    }
    g.globalAlpha = 1;
    // ¡pfff! de Sara al reventar
    const kr = fase(t, T.risa, T.risa + 0.3);
    if (kr > 0 && kr < 1) {
      const bS = Sa.aPantalla(pS, Sa.boca(pS));
      g.strokeStyle = `rgba(255,248,220,${Math.sin(Math.PI * kr)})`; g.lineWidth = 1.8;
      for (let i = 0; i < 6; i++) { const a = Math.PI + (i - 2.5) * 0.4, r0 = 8 + 10 * kr, r1 = r0 + 7; g.beginPath(); g.moveTo(bS.x + Math.cos(a) * r0, bS.y + Math.sin(a) * r0); g.lineTo(bS.x + Math.cos(a) * r1, bS.y + Math.sin(a) * r1); g.stroke(); }
    }
    // palmadas: rayitas de golpe en la mesa
    for (const tp of T.palmadas) {
      const k = fase(t, tp, tp + 0.2);
      if (k > 0 && k < 1) {
        const x = MESA.x + 46, y = MESA.y - 2;
        g.strokeStyle = `rgba(255,240,200,${1 - k})`; g.lineWidth = 1.8;
        for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.45, r0 = 8 + 8 * k, r1 = r0 + 6; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
      }
    }
    // guiño: destellito
    const kw = campana(t, T.guino + 0.02, T.guino + 0.42);
    if (kw > 0.01) {
      const o = G.aPantalla(pG, G.cabeza(pG).a({ x: 705, y: 600 }));
      estrellita(g, o.x, o.y, 6, t * 3, kw);
    }
    g.restore();
  }
  function gotitaP(g, x, y, r, k) {
    if (k <= 0.01) return;
    g.save(); g.globalAlpha = clamp(k); g.fillStyle = "#c4e8ff"; g.strokeStyle = "#3d7fb8"; g.lineWidth = 0.7;
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.35, r * 0.3, 0, TAU); g.fill();
    g.restore();
  }
  function estrellita(g, x, y, r, a, k) {
    if (k <= 0.01) return;
    g.save(); g.translate(x, y); g.rotate(a); g.scale(k, k); g.beginPath();
    for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.3 : r, an = i * Math.PI / 4; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
    g.closePath(); g.fillStyle = "#fff6b8"; g.fill(); g.lineWidth = 1.2; g.strokeStyle = "#e0a400"; g.stroke(); g.restore();
  }

  /* ---------- cámara: plano general → caras (va y viene despacio) → plano medio ---------- */
  let FOCOS = null;
  function focos() {
    if (FOCOS) return FOCOS;
    const cG = G.aPantalla(poseG(3.0), G.centroCabeza(poseG(3.0))), cS = Sa.aPantalla(poseS(3.0), Sa.centroCabeza(poseS(3.0)));
    const nz = G.aPantalla(poseG(3.0), G.cabeza(poseG(3.0)).a({ x: 830, y: 660 }));
    FOCOS = { g: cG, s: cS, nariz: nz, m: { x: (cG.x + cS.x) / 2, y: (cG.y + cS.y) / 2 } };
    return FOCOS;
  }
  function camara(t) {
    const F = focos();
    const K = (k, q, dx = 0, dy = 0) => ({ k, x: q.x + dx, y: q.y + dy });
    const ANCHO = { k: 1.12, x: 512, y: 300 }, DOS = K(2.2, F.m, 0, 12), CG = K(2.65, F.g, 10, 18), CS = K(2.65, F.s, -10, 14),
      DOS_O = K(2.25, { x: lerp(F.g.x, F.s.x, 0.4), y: lerp(F.g.y, F.s.y, 0.4) }, -14, 10), DOS_G = K(2.35, { x: lerp(F.g.x, F.s.x, 0.4), y: lerp(F.g.y, F.s.y, 0.4) }, 0, 16), CN = K(2.8, F.nariz, -6, -6),
      TIC = K(2.45, { x: lerp(F.g.x, F.s.x, 0.62), y: lerp(F.g.y, F.s.y, 0.62) }, -10, 12),
      MEDIO = { k: 1.32, x: 470, y: 336 }, MEDIO2 = { k: 1.4, x: 478, y: 334 },
      RISA = { k: 1.46, x: 548, y: 320 }, FIN = { k: 1.58, x: 456, y: 318 };
    const L = [
      [0, 0, ANCHO],
      [2.05, 3.0, DOS],
      [3.0, 3.5, CG],
      [4.25, 4.85, CS],
      [4.88, 5.45, DOS_G],
      [6.15, 6.62, CS],
      [6.62, 7.12, CN],
      [8.05, 8.55, DOS_O],
      [8.75, 9.3, TIC],
      [9.5, 10.55, MEDIO],
      [10.55, 11.3, MEDIO2],
      [11.45, 12.1, RISA],
      [12.1, 12.85, FIN]
    ];
    let c = L[0][2];
    for (let i = 1; i < L.length; i++) { const [t0, t1, o] = L[i]; if (t <= t0) break; const k = suave(fase(t, t0, t1)); c = { k: lerp(c.k, o.k, k), x: lerp(c.x, o.x, k), y: lerp(c.y, o.y, k) }; }
    // pulso de cámara al caer en el cojín
    const u = t - T.plof; let dy = 0;
    if (u > 0 && u < 0.5) dy = 1.6 * Math.exp(-u * 9) * Math.sin(u * 40);
    return { k: c.k, x: c.x + 2 * Math.sin(t * 0.6), y: c.y + 1.5 * Math.sin(t * 0.8 + 1) + dy };
  }

  function poses(t) { return { g: poseG(t), s: poseS(t) }; }

  class NoTeRias extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Sa.listo()) return;
      if (!fondo) { fondo = creaFondo(); vineta = creaVineta(); }
      const pG = poseG(t), pS = poseS(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      BASE_M = g.getTransform();
      g.drawImage(fondo, -80, -70);
      conoLuz(g, t);
      lampara(g, t);
      sombras(g, pS);
      silla(g, SILLA_G.x, SILLA_G.y, -1, 0.012 * (t > T.plof ? Math.exp(-(t - T.plof) * 8) * Math.sin((t - T.plof) * 30) : 0), { x: SILLA_G.x - 32, y: SUELO });
      cojin(g, t);
      mesa(g);
      bodegon(g, t);
      silla(g, SILLA_S.x, SILLA_S.y, 1, vuelco(t), PIVOTE_S);
      Sa.dibujar(g, pS, t);
      G.dibujar(g, pG, t);
      efectoCojin(g, t);
      efectos(g, t, pG, pS);
      g.restore();
      g.drawImage(vineta, 0, 0);
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }

  registrar({ id: "00125", nombre: "Guillermo y Sara · No te rías", crear: () => new NoTeRias() });
  // diagnóstico: distancia hombro → muñeca / largo del brazo (≤ 1,08 o la mano se despega)
  function diag(t) {
    const out = {};
    for (const [n, Rg, p] of [["g", G, poseG(t)], ["s", Sa, poseS(t)]]) for (const lado of ["cerca", "lejos"]) {
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m) continue;
      const Tr = Rg.tronco(p), h = Tr(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO), mu = m.mu ?? -1.75;
      const w = { x: m.x + Math.cos(mu) * Rg.MUNECA_R * Rg.JK, y: m.y + Math.sin(mu) * Rg.MUNECA_R * Rg.JK };
      out[n + lado] = +(Math.hypot(w.x - h.x, w.y - h.y) / (lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L)).toFixed(3);
    }
    return out;
  }
  window.__A2D_00125 = { pose: poses, poseG, poseS, T, DUR, diag };
})();
