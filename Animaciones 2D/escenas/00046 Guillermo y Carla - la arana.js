"use strict";
/* 00046 · Guillermo y Carla · La araña
 *
 * Negro → el rincón de una cafetería llena de plantas: pared verde salvia, una viga de madera, una
 * ventana con luz de mañana y una monstera en su maceta de barro. Guillermo presume de bíceps con los
 * ojos cerrados delante de Carla, que le mira con las manos en los bolsillos y una ceja levantada →
 * una arañita diminuta y monísima baja por su hilo desde la viga hasta quedarse justo delante de la
 * nariz de Guillermo y le saluda con una patita → Guillermo abre los ojos, se queda bizco y congelado…
 * y grita con la boca enorme y el pelo de punta (la araña sube del susto como un yoyó) → salta a los
 * brazos de Carla, que le coge en brazos como a una princesa sin inmutarse: dobla las rodillas, mira a
 * cámara y suspira → le deja en el suelo y Guillermo sale corriendo a esconderse detrás de ella →
 * Carla saca el dedo, la araña se columpia en su hilo y aterriza en la punta → se la acerca a la
 * cara, le lanza un besito (corazón incluido) y la deja en una hoja de la monstera → Guillermo sale de
 * su escondite, se estira la camiseta, se peina el pelo de punta y silba como si nada… hasta que la
 * araña le saluda desde la hoja: respingo, pelo de punta otra vez y a silbar más rápido → Carla guiña
 * un ojo a cámara → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto. Contactos exactos: Guillermo en brazos se coloca a
 * partir de la mano de Carla (la rodilla sobre la mano cercana, la espalda en la lejana), la araña va
 * pegada a la punta del índice de Carla (la misma cuenta que Personaje2D.mano) y luego a la hoja.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, CA = Carla;
  const S = 0.30, SUELO = 548;
  const KC = S * CA.K;                                   // escala en pantalla de la hoja de Carla
  const HP = (G.SUELO - G.PELVIS.y) * S;                 // pelvis de Guillermo sobre la suela (piernas rectas)
  const DUR = 13.9;
  const TECHO = 42;                                      // borde de abajo de la viga (de ahí cuelga el hilo)
  const T = {
    flex0: 0.4, flex1: 2.3, jarras: 2.5,
    baja0: 1.15, baja1: 2.8, cNota: 2.0, cEspera: 3.0,
    hola0: 3.0, hola1: 3.55,
    abre: 3.28, bizco: 3.42, grito: 3.98, agacha: 4.25, salta: 4.37, coge: 4.84,
    cListo: 4.38, cCamara: 5.05, ojea: 5.55, cSuspira: 5.95,
    dip: 6.1, suelta: 6.4, aterriza: 6.6, cambio: 6.86,
    corre0: 6.92, corre1: 7.3, gira0: 7.3, gira1: 7.5,
    araBaja0: 6.85, araBaja1: 7.45,
    dedo0: 7.0, dedo1: 7.38, llama0: 7.38, llama1: 7.78,
    columpio0: 7.72, posa: 8.3, hiloSuelta: 8.55,
    acerca0: 8.55, acerca1: 8.95,
    beso0: 9.0, beso1: 9.25, lanza: 9.32, lanza1: 9.55, corazon1: 9.85,
    planta0: 9.8, planta1: 10.25, paseo0: 10.28, paseo1: 10.66, retira0: 10.7, retira1: 11.05,
    eek: 8.3, puaj: 9.05, alivio: 10.62,
    sale0: 10.75, sale1: 11.2, tira0: 11.22, tira1: 11.72, peina0: 11.72, peina1: 12.1,
    silba0: 12.1, saludaA: 12.36, respingo: 12.5, silba2: 12.82, guinoC: 12.62,
    fin: 13.12
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
  const ABIERTA = D(1, 1), RELAJADA = D(0.55, 0.6, 0.55, 0.5, 0.45), PUNO = D(0, 0), CADERA = D(0.45, 0.7, 0.7, 0.65, 0.6),
    SENALA = D(0.55, 1, 0, 0, 0), COGE = D(0.85, 0.75, 0.75, 0.72, 0.7), BESO = D(0.25, 1, 1, 0.95, 0.9), TIRA = D(0.3, 0.25, 0.25, 0.25, 0.25);
  const rotar = (q, c, a) => { const s = Math.sin(a), k = Math.cos(a), x = q.x - c.x, y = q.y - c.y; return { x: c.x + x * k - y * s, y: c.y + x * s + y * k }; };

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
  // pasos: x de pantalla de cada tobillo
  function pie(lista, t, alto) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x, h] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    const arco = Math.sin(Math.PI * u);
    return { x: lerp(xa, x, suave5(u)), alza: (h ?? alto) * arco, ang: -0.15 * arco, u, i };
  }

  /* =====================================================================================
   * POSICIONES
   * ===================================================================================== */
  const XG0 = 300, XC = 600, XB = 742, XF = 812;          // Guillermo al empezar, Carla, Guillermo escondido y al final
  const OFF_C = { cerca: 60 * KC, lejos: -70 * KC };      // tobillos de Carla (pantalla, respecto a su pelvis; en espejo)
  const TOB_C = CA.SUELO - CA.TOBILLO_ALTO;
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const ST_G = { cerca: { x: G.PELVIS.x - 19 / S, y: TOB_G }, lejos: { x: G.PELVIS.x + 18 / S, y: TOB_G - 12 } };   // de pie (hoja)
  const AG_G = { cerca: { x: G.PELVIS.x - 30 / S, y: TOB_G }, lejos: { x: G.PELVIS.x + 26 / S, y: TOB_G - 10 } };   // agachado (hoja)
  // en brazos (hoja): piernas casi estiradas hacia delante; giradas con él quedan en horizontal, por encima de los vaqueros de Carla
  const PIES_SENTADO = { cerca: { x: 502, y: 972 }, lejos: { x: 638, y: 962 } };
  const ANG_SENTADO = { cerca: -0.15, lejos: -0.1 };
  let ESPALDA_G = { x: 150, y: 470 };                     // espalda de Guillermo (hoja, en el torso): mano lejana de Carla
  let AGARRE_MUSLO = 0.42;                                // mano cercana de Carla bajo el muslo (0 cadera, 1 rodilla)
  let ROT_BRAZOS = -0.78, TORSO_BRAZOS = -0.28;
  let HN = { x: 280, y: 500 };                            // mano cercana de Carla (hoja, en su torso) al tenerle en brazos

  /* =====================================================================================
   * CARLA (a la derecha, en espejo: mira a la izquierda)
   * ===================================================================================== */
  const CARAS_C = {
    inicio: E({ mx: 0.85, my: 0.05, c: 0.32, sd: 4, gd: 0.03, si: 14, gi: 0.08, sonr: 0.4, ancho: 0.85 }),
    divertida: E({ mx: 0.85, my: 0, c: 0.45, h: 0.3, sd: 2, gd: 0, si: 20, gi: 0.12, abre: 4, sonr: 0.6, ancho: 0.9 }),
    nota: E({ mx: 0.55, my: -0.65, c: 0.1, sd: 12, gd: 0.06, si: 14, gi: 0.08, abre: 6, sonr: 0.45, ancho: 0.8 }),
    espera: E({ mx: 0.85, my: 0, c: 0.35, sd: 6, gd: 0.04, si: 22, gi: 0.14, abre: 0, sonr: 0.65, ancho: 0.85 }),
    ruido: E({ mx: 0.6, my: 0, c: 0.85, z: 0.5, sd: -4, gd: -0.06, si: -4, gi: -0.06, abre: 0, sonr: -0.15, ancho: 0.7 }),
    aburrida: E({ mx: 0.7, my: -0.2, c: 0.55, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, sonr: 0.02, ancho: 0.7 }),
    camara: E({ mx: -0.85, my: -0.05, c: 0.5, sd: 0, gd: 0, si: 20, gi: 0.12, abre: 0, sonr: 0.12, ancho: 0.72 }),
    suspira: E({ mx: -0.6, my: 0.2, c: 1, sd: 6, gd: 0.04, si: 6, gi: 0.04, abre: 6, sonr: 0.15, ancho: 0.7 }),
    tierna: E({ mx: 0.75, my: -0.15, c: 0.18, h: 0.4, sd: 12, gd: 0.07, si: 12, gi: 0.07, abre: 6, sonr: 0.7, ancho: 0.9 }),
    encanto: E({ mx: 0.6, my: -0.1, c: 0.45, h: 0.9, sd: 14, gd: 0.09, si: 14, gi: 0.09, abre: 12, sonr: 0.9, ancho: 0.95 }),
    beso: E({ mx: 0.6, my: -0.1, c: 1, h: 1, sd: 14, gd: 0.09, si: 14, gi: 0.09, abre: 0, sonr: -0.05, ancho: 0.38 }),
    adios: E({ mx: 0.65, my: 0.05, c: 0.3, h: 0.7, sd: 12, gd: 0.07, si: 12, gi: 0.07, abre: 8, sonr: 0.8, ancho: 0.9 }),
    abajo: E({ mx: 0.7, my: 0.6, c: 0.22, h: 0.3, sd: 10, gd: 0.05, si: 10, gi: 0.05, abre: 4, sonr: 0.6, ancho: 0.85 }),
    deReojo: E({ mx: -0.9, my: 0.05, c: 0.4, sd: 0, gd: -0.02, si: 22, gi: 0.14, abre: 0, sonr: 0.45, ancho: 0.8 }),
    guino: E({ mx: -0.85, my: -0.05, c: 0.25, wi: 0.75, sd: 12, gd: 0.08, si: -4, gi: -0.05, abre: 8, sonr: 0.95, ancho: 1.0 })
  };
  const GUION_CARA_C = [
    [T.flex0 + 0.2, T.flex0 + 0.5, "divertida"], [T.cNota, T.cNota + 0.18, "nota"], [T.cEspera, T.cEspera + 0.2, "espera"],
    [T.grito, T.grito + 0.06, "ruido"], [T.cListo - 0.05, T.cListo + 0.12, "aburrida"], [T.cCamara, T.cCamara + 0.15, "camara"],
    [T.cSuspira, T.cSuspira + 0.2, "suspira"], [T.suelta + 0.1, T.suelta + 0.3, "aburrida"], [T.dedo0, T.dedo0 + 0.25, "tierna"],
    [T.posa - 0.05, T.posa + 0.15, "encanto"], [T.beso0, T.beso0 + 0.12, "beso"], [T.lanza + 0.05, T.lanza + 0.2, "adios"],
    [T.planta0, T.planta0 + 0.25, "abajo"], [T.retira0, T.retira0 + 0.3, "adios"], [T.sale1 - 0.1, T.sale1 + 0.2, "deReojo"],
    [T.guinoC - 0.05, T.guinoC + 0.12, "guino"]
  ];
  // cuerpo: pel (hoja, + abajo), torso (+ hacia delante), cab, cad (cadera fuera)
  const CUERPOS_C = {
    inicio: { pel: 6, torso: -0.04, cab: 0.05, cad: -20 },
    divertida: { pel: 8, torso: -0.05, cab: 0.1, cad: -24 },
    nota: { pel: 6, torso: -0.03, cab: -0.06, cad: -18 },
    espera: { pel: 6, torso: -0.04, cab: 0.06, cad: -20 },
    ruido: { pel: 2, torso: -0.1, cab: -0.08, cad: -10 },
    listo: { pel: 14, torso: 0.02, cab: 0.02, cad: 0 },
    brazos: { pel: 26, torso: -0.04, cab: -0.02, cad: 0 },
    deja: { pel: 52, torso: 0.1, cab: 0.08, cad: 0 },
    dedo: { pel: 8, torso: 0.02, cab: 0.0, cad: -14 },
    cerca: { pel: 6, torso: -0.03, cab: -0.04, cad: -16 },
    beso: { pel: 6, torso: -0.02, cab: 0.04, cad: -16 },
    planta: { pel: 26, torso: 0.12, cab: 0.12, cad: -8 },
    final: { pel: 6, torso: -0.04, cab: -0.04, cad: -20 }
  };
  const GUION_CUERPO_C = [
    [T.flex0 + 0.2, T.flex0 + 0.6, "divertida"], [T.cNota, T.cNota + 0.25, "nota"], [T.cEspera, T.cEspera + 0.25, "espera"],
    [T.grito, T.grito + 0.08, "ruido"], [T.cListo, T.salta + 0.2, "listo"], [T.coge + 0.25, T.coge + 0.6, "brazos"],
    [T.dip, T.suelta, "deja"], [T.suelta + 0.1, T.cambio + 0.1, "dedo"], [T.acerca0, T.acerca1, "cerca"], [T.beso0, T.beso1, "beso"],
    [T.planta0, T.planta1, "planta"], [T.retira0, T.retira1, "final"]
  ];

  function poseC(t, pG) {
    if (!GEO) preparaGeo();
    const b = guion(GUION_CUERPO_C, CUERPOS_C, "inicio", t);
    const respira = Math.sin(t * 2.1 + 1);
    // al coger a Guillermo: dobla las rodillas y se echa un poco atrás (y recupera)
    const u = t - T.coge;
    const golpe = u > 0 ? Math.sin(Math.min(1, u / 0.12) * Math.PI / 2) * Math.exp(-u * 3.2) : 0;
    const p = {
      x: XC, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, ikContinuo: true,
      pelvis: { x: CA.PELVIS.x + b.cad, y: CA.PELVIS.y + b.pel + respira * 1.2 + 60 * golpe },
      torso: b.torso - 0.1 * golpe, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.06 * golpe + 0.015 * Math.sin(t * 1.6), dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    for (const ld of ["cerca", "lejos"]) {
      const hx = CA.aHoja(p, { x: XC + OFF_C[ld], y: 0 }).x;
      p.piernas[ld] = { tob: { x: hx, y: TOB_C - (ld === "lejos" ? 6 : 0) }, ang: 0 };
    }
    p.pelo = { inercia: 0.05 * Math.sin(t * 1.7) + 0.35 * golpe * Math.sin(u * 14) - 0.1 * campana(t, T.grito, T.grito + 0.5), viento: 0.25 * campana(t, T.grito, T.grito + 0.35) };
    const ex = guion(GUION_CARA_C, CARAS_C, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [1.55, 2.75, 4.6, 6.75, 8.05, 10.95, 11.9]));
    p.cara.rubor = 0.35 * dentro(t, T.posa, T.posa + 0.3, T.retira0, T.retira1);
    manosC(p, t, pG);
    return p;
  }

  // punta del índice de una mano de Carla en pantalla (la misma cuenta que Personaje2D.mano)
  const ESC_MANO_C = 0.86;
  function dedoC(p, m, a) {           // a: 1 punta, 0 base del índice
    const d = m.dedos || {}, e = n => clamp(d[n] ?? 0);
    const abre = (e("indice") + e("medio") + e("anular") + e("menique")) / 4;
    const k = e("indice"), ang = 0.17 * (0.4 + 0.9 * abre), largo = (3.2 + (14.5 - 3.2) * Math.pow(k, 0.85)) * a;
    let q = { x: 6.9 + Math.sin(ang) * largo, y: 4.5 + Math.cos(ang) * largo };
    const mu = m.mu ?? -1.75, muL = m.espejo ? Math.PI - mu : mu;
    q = CA.rotP(q, muL + Math.PI / 2);
    const esc = CA.JK * clamp(m.puno ?? 1) * ESC_MANO_C;
    q = CA.rotP({ x: q.x * esc * (m.espejo ? -1 : 1), y: q.y * esc }, m.ang || 0);
    return CA.aPantalla(p, { x: m.x + q.x, y: m.y + q.y });
  }
  // sitio de la araña sobre el índice (pantalla): encima del dedo, cerca de la punta
  const R_A = 10;
  function sitioDedo(p) {
    const m = p.manoLejos, a = dedoC(p, m, 0.25), b = dedoC(p, m, 1);
    const q = mezcla(a, b, 0.72);
    return { x: q.x, y: q.y - 2 - R_A * 0.92 };
  }
  // la hoja de la monstera donde acaba la araña (pantalla); se mece y se hunde un poco cuando la pisa
  const HOJA = { x: 470, y: 342, ang: -0.5, largo: 52, ancho: 32 };
  function hojaEstado(t) {
    const u = t - (T.paseo0 + 0.2);
    const hunde = u > 0 ? 0.09 * Math.exp(-u * 4) * Math.cos(u * 13) * suave(fase(u, 0, 0.1)) + 0.03 * suave(fase(u, 0, 0.3)) : 0;
    const a = HOJA.ang + 0.025 * Math.sin(t * 1.3) + hunde;
    const dir = { x: Math.cos(a), y: Math.sin(a) };
    return { a, dir, base: { x: HOJA.x, y: HOJA.y }, punta: { x: HOJA.x + dir.x * HOJA.largo, y: HOJA.y + dir.y * HOJA.largo } };
  }
  function sitioHoja(t) {
    const h = hojaEstado(t), k = 0.7, n = { x: h.dir.y, y: -h.dir.x };      // normal hacia arriba
    const w = HOJA.ancho * 0.5 * Math.sin(Math.PI * Math.pow(k, 0.85)) * 0.75;
    return { x: h.base.x + h.dir.x * HOJA.largo * k + n.x * (w + R_A * 0.8), y: h.base.y + h.dir.y * HOJA.largo * k + n.y * (w + R_A * 0.8) };
  }

  function manosC(p, t, pG) {
    const Tr = CA.tronco(p);
    // bolsillos (puño escondido)
    let c = { x: CA.BOLSILLO_C.x, y: CA.BOLSILLO_C.y }, l = { x: CA.BOLSILLO_L.x, y: CA.BOLSILLO_L.y };
    c = Tr(c); l = Tr(l);
    let cpu = 0, lpu = 0, cmu = -1.75, lmu = -1.75, cang = 0, lang = 0, cd = RELAJADA, ld = RELAJADA, cdob = -1, ldob = 1;
    const pone = (w, cc, ll) => {
      if (w <= 0) return;
      if (cc) { c = mezcla(c, cc.q, w); cpu = lerp(cpu, cc.pu ?? 1, w); cang = lerp(cang, cc.ang || 0, w); cmu = lerp(cmu, cc.mu, w); cd = mezclaD(cd, cc.d, w); }
      if (ll) { l = mezcla(l, ll.q, w); lpu = lerp(lpu, ll.pu ?? 1, w); lang = lerp(lang, ll.ang || 0, w); lmu = lerp(lmu, ll.mu, w); ld = mezclaD(ld, ll.d, w); }
    };
    // lista para cogerle: saca las manos y pone los brazos delante como una carretilla
    const listo = tramo(t, T.cListo, T.coge - 0.12);
    pone(listo, { q: Tr({ x: 330, y: 470 }), mu: 2.4, d: COGE }, { q: Tr({ x: 560, y: 420 }), mu: 2.2, d: COGE });
    // en brazos: la cercana bajo los muslos (fija en su torso), la lejana en su espalda (de la postura de Guillermo)
    const enBrazos = tramo(t, T.coge - 0.12, T.coge) * (1 - tramo(t, T.suelta, T.suelta + 0.01));
    if (enBrazos > 0) {
      pone(enBrazos, { q: Tr(GEO.Hn), mu: GEO.muN, d: COGE }, null);
      if (pG && t < T.suelta) { const ag = agarresG(pG, pG.giro || 0); pone(enBrazos, null, { q: CA.aHoja(p, ag.espalda), mu: GEO.muF, d: COGE }); }
    }
    // le suelta: las manos se abren hacia delante y vuelven a la cintura
    if (t >= T.suelta) {
      const R = GEO.rel || (GEO.rel = soltar());
      const w0 = 1 - tramo(t, T.suelta, T.suelta + 0.3);
      pone(w0, { q: R.c, mu: GEO.muN, d: COGE }, { q: R.l, mu: GEO.muF, d: COGE });
      const abre = dentro(t, T.suelta, T.suelta + 0.15, T.suelta + 0.3, T.cambio);
      pone(abre, { q: Tr({ x: 300, y: 540 }), mu: 2.6, d: ABIERTA }, { q: Tr({ x: 480, y: 500 }), mu: 2.4, d: ABIERTA });
    }
    // manos en la cintura desde que le suelta hasta el final
    const jarras = tramo(t, T.suelta + 0.18, T.cambio - 0.06);
    pone(jarras, { q: Tr({ x: 132, y: 585 }), mu: -0.5, d: CADERA }, { q: Tr({ x: 372, y: 590 }), mu: -2.6, d: CADERA });
    // saca el índice para la araña (mano lejana): antebrazo horizontal, el dedo apunta a la araña
    const dedo = dentro(t, T.dedo0, T.dedo1, T.retira0, T.retira1);
    if (dedo > 0) {
      // llama con el dedo (dos veces) y espera; al posarse la araña la mano cede un poco
      const llama = campana(t, T.llama0, T.llama0 + 0.2) + campana(t, T.llama0 + 0.2, T.llama1);
      const pos = t - T.posa, cede = pos > 0 ? 5 * Math.exp(-pos * 7) * Math.sin(Math.min(1, pos / 0.05) * Math.PI / 2) : 0;
      let q = Tr({ x: 600, y: 352 + cede });
      // se la acerca a la cara
      q = mezcla(q, Tr({ x: 520, y: 300 }), dentro(t, T.acerca0, T.acerca1, T.planta0, T.planta1));
      // la baja hasta la hoja: la punta del dedo toca la punta de la hoja
      const pl = tramo(t, T.planta0, T.planta1);
      let mu = Math.PI + 0.06 * Math.sin(t * 2);
      let dd = mezclaD(SENALA, D(0.55, 0.45, 0, 0, 0), llama);
      if (pl > 0) {
        const h = hojaEstado(t), m0 = { x: 0, y: 0, mu: Math.PI + 0.25, ang: 0, dedos: SENALA, puno: 1 };
        const o = dedoC({ ...p }, m0, 1), z = CA.aPantalla(p, { x: 0, y: 0 });
        const meta = CA.aHoja(p, { x: h.punta.x + 4 - (o.x - z.x), y: h.punta.y - 3 - (o.y - z.y) });
        q = mezcla(q, meta, pl); mu = lerp(mu, Math.PI + 0.25, pl);
      }
      pone(dedo, null, { q, mu, d: dd });
    }
    // besito: la cercana a los labios y luego se abre hacia la araña
    const beso = dentro(t, T.beso0 - 0.12, T.beso0 + 0.12, T.lanza, T.lanza + 0.12);
    if (beso > 0) { const bb = CA.boca(p); pone(beso, { q: { x: bb.x + 8, y: bb.y + 12 }, mu: 1.15, d: BESO }, null); }
    const lanza = dentro(t, T.lanza, T.lanza + 0.14, T.lanza1, T.lanza1 + 0.3);
    if (lanza > 0) { const bb = CA.boca(p); pone(lanza, { q: { x: bb.x + 120, y: bb.y + 70 }, mu: 2.7, d: ABIERTA }, null); }
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: cdob, puno: cpu, dedos: cd };
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: ldob, puno: lpu, dedos: ld };
    // durante el abrazo, las manos se dibujan por encima de Guillermo
    if (t >= T.cListo && t < T.cambio) {
      p.encima = { cerca: { ...p.manoCerca }, lejos: { ...p.manoLejos } };
      p.manoCerca = { ...p.manoCerca, puno: 0 }; p.manoLejos = { ...p.manoLejos, puno: 0 };
    }
  }
  // dibuja una mano de Carla con la misma transformación que su montaje
  const COL_C = () => ({ piel: CA.C.piel, sombra: CA.C.pielSombra, tinta: CA.C.tinta });
  function manoEncima(g, p, m) {
    const k = clamp(m.puno ?? 1); if (k < 0.01) return;
    g.save();
    const s = p.s * CA.K;
    g.translate(p.x, p.suelo); g.scale(p.espejo ? -s : s, s); g.translate(-CA.PELVIS.x, -CA.SUELO);
    g.translate(m.x, m.y); g.rotate(m.ang || 0); g.scale(CA.JK * k * ESC_MANO_C, CA.JK * k * ESC_MANO_C);
    if (m.dedos) Personaje2D.mano(g, m, COL_C()); else Personaje2D.puno(g, m.pulgar, COL_C());
    g.restore();
  }

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  const R_M = G.MUNECA_R * G.JK;
  const manoDesde = (m, a, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, a); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_C = manoDesde({ x: 131, y: 652 }, 0, -1.75), BOLS_L = manoDesde({ x: 372, y: 648 }, 0, -1.75);

  // postura de Guillermo con la pelvis en (px, py) de pantalla
  function poseGBase(px, py, pel, torso, cab, espejo) {
    return { x: px, suelo: py + HP - pel * S, s: S, espejo: !!espejo, tirasLimpias: true, ikContinuo: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + pel }, torso, torsoEsc: { x: 1, y: 1 },
      piernas: { cerca: { tob: { ...ST_G.cerca }, ang: 0 }, lejos: { tob: { ...ST_G.lejos }, ang: 0 } },
      cabeza: { ang: cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
  }
  const pelvisPantalla = p => G.aPantalla(p, p.pelvis);
  function rodilla(p, lado) {
    const cad = G.tronco(p)(G.CADERA[lado]), L = G.A.datos.piezas["pierna_" + lado].largo;
    const c = Recortes.ik(cad, p.piernas[lado].tob, L, L * 0.5, 80, 1, 1.03);
    return Recortes.muestras(c, 2)[1];
  }
  // puntos de agarre de Carla en Guillermo (pantalla, ya girados alrededor de su pelvis)
  function agarresG(p, rot) {
    const P = pelvisPantalla(p);
    const kn = rodilla(p, "cerca"), cad = G.tronco(p)(G.CADERA.cerca), mu = { x: lerp(cad.x, kn.x, AGARRE_MUSLO), y: lerp(cad.y, kn.y, AGARRE_MUSLO) };
    const bajo = G.aPantalla(p, { x: mu.x - 10, y: mu.y + 34 });
    const esp = G.aPantalla(p, G.tronco(p)(ESPALDA_G));
    return { rodilla: rotar(bajo, P, rot), espalda: rotar(esp, P, rot), P };
  }
  function poseSentado(px, py) {
    const p = poseGBase(px, py, 0, TORSO_BRAZOS, -0.1);
    p.piernas.cerca = { tob: { ...PIES_SENTADO.cerca }, ang: ANG_SENTADO.cerca };
    p.piernas.lejos = { tob: { ...PIES_SENTADO.lejos }, ang: ANG_SENTADO.lejos };
    return p;
  }

  const CARAS_G = {
    inicio: E({ mx: 0.85, my: 0.05, c: 0.2, sd: 4, gd: 0.02, si: 4, gi: 0.02, abre: 6, sonr: 0.45, ancho: 0.9 }),
    presume: E({ mx: 0.85, my: -0.1, c: 1, h: 1, sd: 16, gd: 0.1, si: 16, gi: 0.1, abre: 14, ancho: 1.1, sonr: 0.9 }),
    chulo: E({ mx: 0.85, my: -0.2, c: 1, h: 0.6, sd: 14, gd: 0.08, si: 14, gi: 0.08, abre: 6, ancho: 1.0, sonr: 0.85 }),
    abre: E({ mx: 0.9, my: 0.15, c: 0.05, sd: 8, gd: 0.04, si: 8, gi: 0.04, abre: 2, ancho: 0.9, sonr: 0.45 }),
    bizco: E({ mx: 0.95, my: 0.25, iris: 0.55, sd: 22, gd: 0.12, si: 22, gi: 0.12, abre: 6, ancho: 0.55, sonr: -0.2 }),
    grito: E({ mx: 0.9, my: 0.05, iris: 0.42, sd: 34, gd: 0.22, si: 34, gi: 0.22, abre: 74, ancho: 1.3, sonr: -0.6, lengua: 0.7 }),
    aprieta: E({ mx: 0, my: 0, c: 1, z: 1, sd: -6, gd: -0.15, si: -6, gi: -0.15, abre: 16, ancho: 0.85, sonr: -0.55 }),
    ojea: E({ mx: -0.6, my: -0.5, c: 0, wi: 1, iris: 0.7, sd: 20, gd: 0.12, si: -6, gi: -0.1, abre: 14, ancho: 0.8, sonr: -0.5 }),
    cae: E({ mx: 0.5, my: 0.6, iris: 0.6, sd: 30, gd: 0.2, si: 30, gi: 0.2, abre: 44, ancho: 1.0, sonr: -0.5, lengua: 0.3 }),
    aturdido: E({ mx: 0.4, my: 0.1, iris: 0.8, c: 0.1, sd: 16, gd: 0.1, si: 16, gi: 0.1, abre: 12, ancho: 0.7, sonr: -0.3 }),
    huye: E({ mx: 0.9, my: 0, iris: 0.6, sd: 30, gd: 0.22, si: 30, gi: 0.22, abre: 52, ancho: 1.1, sonr: -0.55, lengua: 0.4 }),
    asoma: E({ mx: 0.9, my: 0.05, iris: 0.75, sd: 20, gd: 0.14, si: 20, gi: 0.14, abre: 8, ancho: 0.6, sonr: -0.4 }),
    eek: E({ mx: 0.9, my: 0.1, iris: 0.5, sd: 32, gd: 0.22, si: 32, gi: 0.22, abre: 40, ancho: 0.8, sonr: -0.6 }),
    puaj: E({ mx: 0.9, my: 0, c: 0.4, z: 0.5, sd: -4, gd: -0.1, si: 20, gi: 0.12, abre: 24, ancho: 1.1, sonr: -0.55, lengua: 1 }),
    alivio: E({ mx: 0, my: 0.3, c: 1, sd: 8, gd: 0.05, si: 8, gi: 0.05, abre: 18, ancho: 0.8, sonr: 0.1 }),
    digno: E({ mx: 0.9, my: -0.3, c: 1, sd: 14, gd: 0.1, si: 14, gi: 0.1, abre: 0, ancho: 0.8, sonr: 0.25 }),
    silba: E({ mx: 0.9, my: -0.3, c: 1, sd: 16, gd: 0.1, si: 16, gi: 0.1, abre: 12, ancho: 0.36, sonr: 0, dientes: 0 }),
    ojo: E({ mx: 0.95, my: 0.35, c: 0, wi: 1, iris: 0.8, sd: 10, gd: 0.04, si: 14, gi: 0.1, abre: 12, ancho: 0.36, sonr: 0, dientes: 0 }),
    respingo: E({ mx: 0.95, my: 0.35, iris: 0.45, sd: 32, gd: 0.22, si: 32, gi: 0.22, abre: 36, ancho: 0.75, sonr: -0.5 }),
    silba2: E({ mx: 0.9, my: -0.3, c: 1, z: 0.3, sd: 20, gd: 0.14, si: 20, gi: 0.14, abre: 12, ancho: 0.34, sonr: -0.05, dientes: 0 })
  };
  const GUION_CARA_G = [
    [T.flex0, T.flex0 + 0.2, "presume"], [T.flex1, T.jarras, "chulo"], [T.abre, T.abre + 0.1, "abre"], [T.bizco, T.bizco + 0.12, "bizco"],
    [T.grito - 0.03, T.grito + 0.04, "grito", salida], [T.coge + 0.02, T.coge + 0.12, "aprieta"], [T.ojea, T.ojea + 0.12, "ojea"],
    [T.ojea + 0.45, T.ojea + 0.55, "aprieta"], [T.suelta - 0.02, T.suelta + 0.08, "cae"], [T.aterriza, T.aterriza + 0.1, "aturdido"],
    [T.corre0 - 0.06, T.corre0 + 0.04, "huye"], [T.gira1, T.gira1 + 0.2, "asoma"], [T.eek, T.eek + 0.06, "eek"], [T.eek + 0.5, T.eek + 0.7, "asoma"],
    [T.puaj, T.puaj + 0.15, "puaj"], [T.lanza1 + 0.15, T.lanza1 + 0.35, "asoma"], [T.alivio, T.alivio + 0.2, "alivio"],
    [T.sale0 + 0.15, T.sale0 + 0.35, "digno"], [T.silba0, T.silba0 + 0.15, "silba"], [T.saludaA + 0.04, T.saludaA + 0.1, "ojo"],
    [T.respingo, T.respingo + 0.05, "respingo"], [T.silba2, T.silba2 + 0.12, "silba2"]
  ];
  const CUERPOS_G = {
    inicio: { pel: 0, torso: -0.02, cab: 0 },
    flex: { pel: -4, torso: -0.07, cab: -0.1 },
    jarras: { pel: 0, torso: -0.07, cab: -0.14 },
    mira: { pel: 4, torso: 0.03, cab: 0.08 },
    tieso: { pel: -6, torso: -0.05, cab: 0.02 },
    grito: { pel: -16, torso: -0.14, cab: -0.16 },
    agacha: { pel: 48, torso: 0.2, cab: -0.04 }
  };
  const GUION_CUERPO_G = [
    [T.flex0 - 0.1, T.flex0 + 0.25, "flex"], [T.flex1, T.jarras, "jarras"], [T.abre, T.abre + 0.14, "mira"], [T.bizco + 0.08, T.bizco + 0.22, "tieso"],
    [T.grito, T.grito + 0.06, "grito", salida], [T.agacha, T.salta, "agacha"]
  ];

  // de pie, antes del salto
  function gDePie(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const flex = dentro(t, T.flex0, T.flex0 + 0.3, T.flex1, T.jarras);
    let bombeo = 0; for (const tb of [0.95, 1.45, 1.95]) bombeo += campana(t, tb, tb + 0.32);
    const grita = dentro(t, T.grito, T.grito + 0.05, T.agacha, T.salta);
    const salto = 22 * campana(t, T.grito, T.grito + 0.2);       // saltito en el sitio al gritar
    const tiembla = dentro(t, T.bizco + 0.25, T.bizco + 0.35, T.grito, T.grito + 0.02);
    const p = { x: XG0 + 1.2 * ruido(t * 40) * tiembla, suelo: SUELO - salto, s: S, espejo: false, tirasLimpias: true, ikContinuo: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + 6 * bombeo * flex },
      torso: b.torso - 0.02 * bombeo * flex + 0.012 * Math.sin(t * 50) * grita,
      torsoEsc: { x: 1 + 0.025 * bombeo * flex, y: 1 + 0.004 * Math.sin(t * 2.4) + 0.05 * grita },
      piernas: {}, cabeza: { ang: b.cab + 0.04 * Math.sin(t * 47) * grita, dx: 0, dy: -20 * grita, esc: { x: 1 - 0.04 * grita, y: 1 + 0.1 * grita } } };
    const ag = tramo(t, T.agacha, T.salta);
    for (const ld of ["cerca", "lejos"]) {
      const q = mezcla(ST_G[ld], AG_G[ld], ag);
      p.piernas[ld] = { tob: { x: q.x, y: q.y + salto / S * (ld === "cerca" ? 0 : 0) }, ang: 0 };
    }
    return p;
  }
  // en el aire: de los pies de Guillermo a los brazos de Carla
  function gVuelo(t) {
    const u = fase(t, T.salta, T.coge);
    const P0 = { x: XG0, y: SUELO - HP + CUERPOS_G.agacha.pel * S }, P1 = GEO.Pc;
    const P = { x: lerp(P0.x, P1.x, u), y: lerp(P0.y, P1.y, u) - 4 * 58 * u * (1 - u) };
    const gira = suave(fase(u, 0.2, 1));
    const p = poseGBase(P.x, P.y, 0, lerp(0.2, TORSO_BRAZOS, suave(u)), lerp(-0.05, -0.1, u));
    // piernas: se estiran al despegar y se recogen en sentado
    const est = campana(u, 0, 0.5);
    for (const ld of ["cerca", "lejos"]) {
      const recto = { x: ST_G[ld].x - 40 * est, y: ST_G[ld].y + 10 * est };
      const ini = AG_G[ld];
      const a = mezcla(ini, recto, suave(fase(u, 0, 0.25)));
      p.piernas[ld].tob = mezcla(a, PIES_SENTADO[ld], suave(fase(u, 0.3, 0.92)));
      p.piernas[ld].ang = lerp(0.25 * est, ANG_SENTADO[ld], suave(fase(u, 0.3, 0.92)));
    }
    p.giro = ROT_BRAZOS * gira;
    return p;
  }
  // en brazos: la rodilla queda justo sobre la mano cercana de Carla (que se mueve con ella)
  function gBrazos(t, pC) {
    const mano = CA.aPantalla(pC, CA.tronco(pC)(GEO.Hn));
    const P = { x: mano.x - GEO.offRodilla.x, y: mano.y - GEO.offRodilla.y };
    const tiembla = dentro(t, T.coge, T.coge + 0.1, T.dip, T.suelta);
    const p = poseGBase(P.x, P.y, 0, TORSO_BRAZOS + 0.006 * Math.sin(t * 2.5), -0.1 + 0.03 * Math.sin(t * 43) * tiembla);
    p.piernas.cerca = { tob: { ...PIES_SENTADO.cerca }, ang: ANG_SENTADO.cerca };
    // la pierna lejana patalea un poco (de miedo)
    const pat = Math.sin(t * 19) * dentro(t, T.coge + 0.15, T.coge + 0.3, T.ojea, T.ojea + 0.2);
    p.piernas.lejos = { tob: { x: PIES_SENTADO.lejos.x + 14 * pat, y: PIES_SENTADO.lejos.y - 26 * Math.max(0, pat) }, ang: ANG_SENTADO.lejos + 0.15 * pat };
    // aplastón al caer en brazos
    const u = t - T.coge, ap = Math.exp(-u * 9) * Math.sin(Math.min(1, u / 0.06) * Math.PI / 2);
    p.torsoEsc = { x: 1 + 0.06 * ap, y: 1 - 0.08 * ap };
    p.cabeza.ang += -0.08 * ap;
    p.cabeza.dx = 2.5 * Math.sin(t * 41) * tiembla;
    p.giro = ROT_BRAZOS;
    return p;
  }
  // le suelta: resbala de los brazos hacia delante y cae de pie, agachado
  function gCae(t) {
    const R = GEO.rel || (GEO.rel = soltar());
    const u = fase(t, T.suelta, T.aterriza);
    const PL = { x: R.P.x - 165, y: SUELO - HP + 44 * S };
    const P = { x: lerp(R.P.x, PL.x, salida(u)), y: lerp(R.P.y, PL.y, u * u) - 16 * Math.sin(Math.PI * Math.min(1, u * 1.4)) };
    const p = poseGBase(P.x, P.y, lerp(0, 44, u), lerp(TORSO_BRAZOS, 0.12, suave(u)), lerp(-0.1, 0, u));
    for (const ld of ["cerca", "lejos"]) {
      p.piernas[ld].tob = mezcla(PIES_SENTADO[ld], AG_G[ld], suave(u));
      p.piernas[ld].ang = lerp(ANG_SENTADO[ld], 0, suave(u));
    }
    p.giro = ROT_BRAZOS * (1 - suave(u));
    return p;
  }
  // en el suelo: aterriza, corre a esconderse detrás de Carla, se gira, se asoma y luego sale
  const XL = () => (GEO.rel || (GEO.rel = soltar())).P.x - 165;
  let PASOS_RUN = null, PASOS_SALE = null;
  function preparaPasos() {
    const xl = XL();
    const c = [[-10, -9, xl - 30], [T.corre0, T.corre0 + 0.13, xl + 70, 34], [T.corre0 + 0.19, T.corre0 + 0.32, XB - 70, 34], [T.gira0, T.gira1, XB - 30, 0]];
    const l = [[-10, -9, xl + 26], [T.corre0 + 0.09, T.corre0 + 0.22, xl + 140, 34], [T.corre0 + 0.27, T.corre1, XB + 26, 26]];
    PASOS_RUN = { cerca: c, lejos: l };
    // de lado hacia la derecha (mirando a la izquierda): primero el pie cercano (a la derecha)
    const c2 = [[-10, -9, XB + 30], [T.sale0, T.sale0 + 0.18, XB + 30 + 46, 22], [T.sale0 + 0.24, T.sale0 + 0.42, XF + 19, 22]];
    const l2 = [[-10, -9, XB - 26], [T.sale0 + 0.1, T.sale0 + 0.28, XB - 26 + 46, 18], [T.sale0 + 0.32, T.sale1, XF - 18, 18]];
    PASOS_SALE = { cerca: c2, lejos: l2 };
  }
  // giro: 0 → π (a mitad de vuelta se ve de canto); con espejo a partir de π/2
  const giroG = t => Math.PI * suave(fase(t, T.gira0 + 0.02, T.gira1));
  function gSuelo(t) {
    if (!PASOS_RUN) preparaPasos();
    const xl = XL();
    const th = giroG(t), esp = th > Math.PI / 2;
    const sale = tramo(t, T.sale0, T.sale1 - 0.1);
    // x de la pelvis
    let X = xl;
    if (t >= T.corre0) X = lerp(xl, XB, suave(fase(t, T.corre0, T.corre1)));
    if (t >= T.sale0) X = lerp(XB, XF, suave(fase(t, T.sale0 + 0.05, T.sale1)));
    // agachado: al aterrizar, corriendo, asomado; se incorpora al salir
    const atr = t - T.aterriza, rebote = atr > 0 ? 18 * Math.exp(-atr * 10) * Math.cos(atr * 20) : 0;
    const corre = dentro(t, T.corre0 - 0.05, T.corre0 + 0.05, T.corre1, T.gira1);
    const eek = dentro(t, T.eek, T.eek + 0.06, T.eek + 0.35, T.eek + 0.7);
    let pel = lerp(44 + rebote, 30, corre), torso = lerp(0.12, 0.32, corre), cab = lerp(0, -0.12, corre);
    const asoma = dentro(t, T.gira1 - 0.05, T.gira1 + 0.15, T.sale0, T.sale0 + 0.25);
    pel = lerp(pel, 96 + 26 * eek, asoma); torso = lerp(torso, 0.4 - 0.1 * eek, asoma); cab = lerp(cab, 0.06 + 0.08 * eek, asoma);
    const alivio = dentro(t, T.alivio, T.alivio + 0.15, T.sale0, T.sale0 + 0.2);
    pel += 10 * alivio; torso += 0.06 * alivio;
    // de pie, digno: pecho fuera y barbilla arriba; se balancea al silbar
    const silba = tramo(t, T.silba0, T.silba0 + 0.2);
    const rsp = campana(t, T.respingo, T.respingo + 0.28);
    pel = lerp(pel, -2 + 3 * Math.sin(t * 5.5) * silba - 8 * rsp, sale); torso = lerp(torso, -0.07 + 0.02 * Math.sin(t * 5.5) * silba + 0.05 * rsp, sale);
    cab = lerp(cab, -0.16 + 0.03 * Math.sin(t * 5.5 + 0.6) * silba + 0.06 * rsp, sale);
    const hop = 26 * campana(t, T.gira0 + 0.02, T.gira1) + 14 * campana(t, T.respingo, T.respingo + 0.2);
    const tiembla = dentro(t, T.gira1, T.gira1 + 0.1, T.alivio, T.alivio + 0.1);
    const p = { x: X + 1.2 * ruido(t * 37) * tiembla, suelo: SUELO - hop, s: S, espejo: esp, tirasLimpias: true, ikContinuo: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + pel }, torso, torsoEsc: { x: 1, y: 1 + 0.004 * Math.sin(t * 2.4) },
      piernas: {}, cabeza: { ang: cab + 0.03 * Math.sin(t * 39) * tiembla, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    // pies
    for (const ld of ["cerca", "lejos"]) {
      let tob, ang = 0;
      if (t < T.corre0) { tob = { ...AG_G[ld] }; }
      else if (t < T.gira0) {
        const f = pie(PASOS_RUN[ld], t, 30);
        tob = { x: G.aHoja(p, { x: f.x, y: 0 }).x, y: AG_G[ld].y - f.alza / S }; ang = f.ang * 1.6;
      } else if (t < T.sale0) {
        tob = { ...AG_G[ld] };
        // las rodillas tiemblan
        tob.x += 6 * ruido(t * 31 + (ld === "cerca" ? 0 : 7)) * tiembla;
      } else {
        const f = pie(PASOS_SALE[ld], t, 20);
        const yy = lerp(AG_G[ld].y, ST_G[ld].y, sale);
        tob = { x: G.aHoja(p, { x: f.x, y: 0 }).x, y: yy - f.alza / S }; ang = f.ang;
      }
      p.piernas[ld] = { tob, ang };
    }
    p.giroX = th;
    return p;
  }

  function poseG(t, pC) {
    if (!GEO) preparaGeo();
    let p;
    if (t < T.salta) p = gDePie(t);
    else if (t < T.coge) p = gVuelo(t);
    else if (t < T.suelta) p = gBrazos(t, pC || poseC(t, null));
    else if (t < T.aterriza) p = gCae(t);
    else p = gSuelo(t);
    manosG(p, t);
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [0.25, 2.95, 6.78, 7.95, 9.7, 11.05]));
    p.cara.rubor = 0.7 * dentro(t, T.sale0, T.sale0 + 0.3, T.silba0 + 0.4, T.silba0 + 0.8);
    p.rojo = 0.35 * dentro(t, T.sale0, T.sale0 + 0.3, T.peina1, T.peina1 + 0.4);
    p.sudor = 0.9 * dentro(t, T.bizco + 0.15, T.bizco + 0.4, T.grito + 0.5, T.grito + 0.8) + 0.8 * dentro(t, T.gira1, T.gira1 + 0.2, T.alivio + 0.2, T.alivio + 0.5)
      + 0.9 * dentro(t, T.respingo, T.respingo + 0.15, T.fin + 2, T.fin + 3);
    p.erizado = pelo(t);
    return p;
  }
  // pelo de punta (0 normal … 1 erizado del todo)
  function pelo(t) {
    let k = 0;
    const g0 = t - T.grito;
    if (g0 > 0) k = 1 + 0.18 * Math.exp(-g0 * 9) * Math.sin(Math.min(1, g0 / 0.06) * Math.PI);
    k *= 1 - 0.55 * tramo(t, T.coge + 0.9, T.suelta);
    k = Math.max(k, 0.85 * dentro(t, T.suelta, T.suelta + 0.06, T.gira1 + 0.3, T.gira1 + 0.9));
    if (t > T.suelta) k = Math.max(k, 0.42 * (1 - tramo(t, T.peina0 + 0.05, T.peina1 - 0.05)));
    k = Math.max(k, 0.95 * dentro(t, T.respingo, T.respingo + 0.05, T.respingo + 0.25, T.respingo + 0.7));
    return k;
  }

  function manosG(p, t) {
    const Tr = G.tronco(p);
    let c = Tr(BOLS_C), l = Tr(BOLS_L);
    let cpu = 0, lpu = 0, cang = 0, lang = 0, cmu = -1.75, lmu = -1.75, cd = RELAJADA, ld = RELAJADA;
    const pone = (w, cc, ll) => {
      if (w <= 0) return;
      if (cc) { c = mezcla(c, cc.q, w); cpu = lerp(cpu, 1, w); cang = lerp(cang, cc.ang || 0, w); cmu = lerp(cmu, cc.mu, w); cd = mezclaD(cd, cc.d, w); }
      if (ll) { l = mezcla(l, ll.q, w); lpu = lerp(lpu, 1, w); lang = lerp(lang, ll.ang || 0, w); lmu = lerp(lmu, ll.mu, w); ld = mezclaD(ld, ll.d, w); }
    };
    // bíceps: los dos brazos arriba con los puños cerrados (y bombea)
    const flex = dentro(t, T.flex0, T.flex0 + 0.3, T.flex1, T.jarras);
    if (flex > 0) {
      let b = 0; for (const tb of [0.95, 1.45, 1.95]) b += campana(t, tb, tb + 0.32);
      pone(flex, { q: Tr({ x: -10 + 8 * b, y: 205 - 14 * b }), mu: 1.95, d: PUNO }, { q: Tr({ x: 505 - 8 * b, y: 215 - 14 * b }), mu: 1.2, d: PUNO });
    }
    // brazos en jarras (puños en la cintura, codos fuera)
    const jarras = dentro(t, T.flex1, T.jarras + 0.05, T.grito - 0.02, T.grito + 0.06);
    pone(jarras, { q: Tr({ x: 96, y: 640 }), mu: 3.6, d: PUNO }, { q: Tr({ x: 404, y: 636 }), mu: -0.55, d: PUNO });
    // grito: manos abiertas arriba, a los lados de la cara, temblando
    const grito = dentro(t, T.grito, T.grito + 0.06, T.agacha, T.salta);
    if (grito > 0) { const f = Math.sin(t * 52), f2 = Math.sin(t * 47 + 1);
      pone(grito, { q: Tr({ x: 20 + 6 * f, y: 210 + 6 * f2 }), mu: 1.45, d: ABIERTA }, { q: Tr({ x: 490 + 6 * f2, y: 190 + 6 * f }), mu: 1.75, d: ABIERTA }); }
    // coge impulso: brazos atrás
    const imp = dentro(t, T.agacha, T.salta - 0.04, T.salta, T.salta + 0.12);
    pone(imp, { q: Tr({ x: -40, y: 560 }), mu: -1.2, d: RELAJADA }, { q: Tr({ x: 250, y: 650 }), mu: -1.4, d: RELAJADA });
    // en el aire: brazos arriba agitándose
    const vuelo = dentro(t, T.salta, T.salta + 0.1, T.coge - 0.18, T.coge - 0.02);
    if (vuelo > 0) { const f = Math.sin(t * 30), f2 = Math.sin(t * 27 + 1.2);
      pone(vuelo, { q: Tr({ x: 10 + 25 * f, y: 140 + 25 * f2 }), mu: 1.0, d: ABIERTA }, { q: Tr({ x: 500 + 22 * f2, y: 130 + 22 * f }), mu: 2.1, d: ABIERTA }); }
    // en brazos: puños apretados bajo la barbilla, temblando
    const encoge = dentro(t, T.coge - 0.18, T.coge, T.suelta, T.suelta + 0.06);
    if (encoge > 0) { const f = 3 * Math.sin(t * 45), ojea = dentro(t, T.ojea, T.ojea + 0.1, T.ojea + 0.45, T.ojea + 0.55);
      pone(encoge, { q: Tr({ x: 300 + f, y: 400 - 16 * ojea }), mu: 2.1, d: PUNO }, { q: Tr({ x: 395 - f, y: 395 - 10 * ojea }), mu: 1.9, d: PUNO }); }
    // cae: brazos arriba
    const cae = dentro(t, T.suelta, T.suelta + 0.06, T.aterriza, T.aterriza + 0.15);
    pone(cae, { q: Tr({ x: 0, y: 170 }), mu: 0.9, d: ABIERTA }, { q: Tr({ x: 510, y: 160 }), mu: 2.2, d: ABIERTA });
    // al aterrizar: manos al suelo / delante, y luego corre con los brazos arriba
    const at = dentro(t, T.aterriza, T.aterriza + 0.1, T.corre0 - 0.05, T.corre0 + 0.05);
    pone(at, { q: Tr({ x: 40, y: 330 }), mu: 1.3, d: ABIERTA }, { q: Tr({ x: 330, y: 330 }), mu: 1.9, d: ABIERTA });
    const run = dentro(t, T.corre0 - 0.04, T.corre0 + 0.06, T.gira1 - 0.05, T.gira1 + 0.1);
    if (run > 0) { const f = Math.sin(t * 34), f2 = Math.sin(t * 31 + 1);
      pone(run, { q: Tr({ x: 0 + 20 * f, y: 170 + 18 * f2 }), mu: 1.0, d: ABIERTA }, { q: Tr({ x: 500 + 18 * f2, y: 160 + 18 * f }), mu: 2.1, d: ABIERTA }); }
    // asomado detrás de Carla: puños bajo la barbilla (se tapa la cara del susto al ver la araña en el dedo)
    const asoma = dentro(t, T.gira1 - 0.05, T.gira1 + 0.12, T.sale0, T.sale0 + 0.2);
    if (asoma > 0) { const f = 2.5 * Math.sin(t * 43), tapa = dentro(t, T.eek, T.eek + 0.08, T.eek + 0.4, T.eek + 0.65);
      pone(asoma, { q: Tr({ x: 330 + f, y: 330 - 90 * tapa }), mu: 1.85, d: mezclaD(PUNO, ABIERTA, tapa) }, { q: Tr({ x: 420 - f, y: 320 - 95 * tapa }), mu: 1.6, d: mezclaD(PUNO, ABIERTA, tapa) }); }
    // se estira la camiseta (dos tirones hacia abajo)
    const tira = dentro(t, T.sale1 - 0.1, T.tira0 + 0.08, T.tira1 - 0.06, T.peina0 + 0.05);
    if (tira > 0) { const y = 34 * (campana(t, T.tira0 + 0.05, T.tira0 + 0.25) + campana(t, T.tira0 + 0.27, T.tira0 + 0.47));
      pone(tira, { q: Tr({ x: 140, y: 618 + y }), mu: -1.65, d: TIRA }, { q: Tr({ x: 352, y: 614 + y }), mu: -1.5, d: TIRA }); }
    // se rasca la nuca (y se aplasta el pelo de punta) con la mano cercana: gesto de vergüenza
    const peina = dentro(t, T.peina0, T.peina0 + 0.12, T.peina1 - 0.06, T.peina1 + 0.1);
    if (peina > 0) {
      const H = G.cabeza(p), f = Math.sin((t - T.peina0) * 26);
      const q = H.a({ x: 600 + 14 * f, y: 440 + 26 * f });
      pone(peina, { q, mu: 2.15 + 0.12 * f, d: D(0.55, 0.85, 0.85, 0.8, 0.75) }, null);
    }
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: -1, puno: cpu, dedos: cd };
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: -1, puno: lpu, dedos: ld };
  }

  /* =====================================================================================
   * GEOMETRÍA del abrazo
   * ===================================================================================== */
  let GEO = null;
  function preparaGeo() {
    GEO = { Hn: { ...HN }, muN: 2.25, muF: 2.1 };
    const p0 = poseSentado(0, 0); p0.giro = ROT_BRAZOS;
    const a0 = agarresG(p0, ROT_BRAZOS);
    GEO.offRodilla = { x: a0.rodilla.x - a0.P.x, y: a0.rodilla.y - a0.P.y };
    // Carla justo al cogerle: la rodilla sobre su mano cercana
    const pC = poseC(T.coge, null);
    const mano = CA.aPantalla(pC, CA.tronco(pC)(GEO.Hn));
    GEO.Pc = { x: mano.x - GEO.offRodilla.x, y: mano.y - GEO.offRodilla.y };
    const pc = poseSentado(GEO.Pc.x, GEO.Pc.y); pc.giro = ROT_BRAZOS;
    const ac = agarresG(pc, ROT_BRAZOS);
    const hn = CA.aPantalla(pC, CA.tronco(pC)(CA.HOMBRO_C)), hf = CA.aPantalla(pC, CA.tronco(pC)(CA.HOMBRO));
    const alcC = (CA.BRAZO_C_L + CA.MUNECA_R * CA.JK) * KC, alcL = (CA.BRAZO_L + CA.MUNECA_R * CA.JK) * KC;
    GEO.chk = { cerca: Math.hypot(mano.x - hn.x, mano.y - hn.y) / alcC, lejos: Math.hypot(ac.espalda.x - hf.x, ac.espalda.y - hf.y) / alcL,
      Pc: GEO.Pc, mano, espalda: ac.espalda, hn, hf };
  }
  // instante en que le suelta: posición de la pelvis de Guillermo y de las manos de Carla (en su hoja)
  function soltar() {
    const t = T.suelta - 1e-4;
    const pc0 = poseC(t, null), pg = poseG(t, pc0), pc = poseC(t, pg);
    return { P: pelvisPantalla(pg), c: { x: pc.encima.cerca.x, y: pc.encima.cerca.y }, l: { x: pc.encima.lejos.x, y: pc.encima.lejos.y } };
  }

  /* =====================================================================================
   * LA ARAÑA
   * ===================================================================================== */
  let SX = null, Y0 = 0;
  const Y_ARRIBA = TECHO - 14;                    // escondida en la viga (se recorta)
  function preparaArana() {
    const p = gDePie(T.baja1); manosG(p, T.baja1);
    const n = G.aPantalla(p, G.cabeza(p).a({ x: 1060, y: 560 })), c = G.aPantalla(p, G.centroCabeza(p));
    SX = n.x + 30; Y0 = c.y - 4;
  }
  function arana(t, pG, pC) {
    if (SX === null) preparaArana();
    const A = { x: SX, y: TECHO + 9, ancla: { x: SX, y: TECHO }, hilo: 1, hiloFin: null, sx: 1, sy: 1,
      patas: 0, anda: 0, saluda: 0, saludaDer: false, mira: { x: -0.6, y: 0.2 }, susto: 0, rubor: 0, feliz: 0, parp: parpadeo(t, [1.0, 2.5, 5.2, 6.4, 8.9, 11.4, 12.95]),
      cuelga: 1, ang: 0 };
    // baja a saltitos (rapel) hasta la cara de Guillermo
    const escalon = u => { const n = 3; const k = u * n, i = Math.floor(Math.min(k, n - 1e-6)), f = k - i; return (i + suave(f)) / n; };
    let y = TECHO + 9;
    if (t >= T.baja0) {
      const u = fase(t, T.baja0, T.baja1);
      y = lerp(TECHO + 9, Y0, escalon(u));
      const tt = t - T.baja1; if (tt > 0) y += 7 * Math.exp(-tt * 3.5) * Math.sin(tt * 9);
      y += 1.5 * Math.sin(t * 2.2);
    }
    let x = SX;
    // susto del grito: sube como un yoyó y el grito la empuja
    if (t >= T.grito) {
      const u = fase(t, T.grito + 0.02, T.grito + 0.3);
      y = lerp(y, Y_ARRIBA, salida(u));
      const g0 = t - T.grito;
      const th = 0.55 * Math.exp(-g0 * 2.6) * Math.sin(g0 * 7 + 0.4) * suave(fase(g0, 0, 0.06));
      const r = y - TECHO; x = SX + r * Math.sin(th); y = TECHO + r * Math.cos(th);
      A.susto = dentro(t, T.grito, T.grito + 0.05, T.grito + 0.9, T.grito + 1.3);
      y += 2 * Math.sin(t * 2.6);
    }
    // se asoma por debajo de la viga a mirar el lío
    if (t >= T.coge + 0.5) { const u = tramo(t, T.coge + 0.5, T.coge + 0.75); y = lerp(y, TECHO + 9, u) + 1.2 * Math.sin(t * 3) * u; }
    // vuelve a bajar cuando Guillermo se esconde
    if (t >= T.araBaja0) { const u = tramo(t, T.araBaja0, T.araBaja1); y = lerp(y, Y0 + 12, u); x = lerp(x, SX, u); }
    A.x = x; A.y = y;
    // mira: a Guillermo de pie; luego a Carla
    if (pG && t < T.coge + 1.4) { const cg = G.aPantalla(pG, G.centroCabeza(pG)); const dx = cg.x - x, dy = cg.y - y, d = Math.hypot(dx, dy) || 1; A.mira = { x: dx / d, y: dy / d }; }
    else if (pC) { const cc = CA.aPantalla(pC, CA.centroCabeza(pC)); const dx = cc.x - x, dy = cc.y - y, d = Math.hypot(dx, dy) || 1; A.mira = { x: dx / d, y: dy / d }; }
    A.saluda = dentro(t, T.hola0, T.hola0 + 0.1, T.hola1 - 0.1, T.hola1);
    // se columpia hasta el dedo de Carla
    if (t >= T.columpio0 && pC) {
      const dst = sitioDedo(pC);
      const ax = A.ancla.x, ay = A.ancla.y;
      const r0 = Math.hypot(x - ax, y - ay), th0 = Math.atan2(x - ax, y - ay);
      const r1 = Math.hypot(dst.x - ax, dst.y - ay), th1 = Math.atan2(dst.x - ax, dst.y - ay);
      if (t < T.posa) {
        const u = fase(t, T.columpio0, T.posa);
        // primero hacia atrás (impulso) y luego vuela hasta el dedo
        const atras = -0.32 * Math.sin(Math.PI * Math.min(1, u / 0.45));
        const th = lerp(th0, th1, suave(fase(u, 0.25, 1))) + atras * (1 - fase(u, 0.45, 1));
        const r = lerp(r0, r1, suave(fase(u, 0.3, 1)));
        A.x = ax + r * Math.sin(th); A.y = ay + r * Math.cos(th);
        A.ang = -0.6 * (th - th0) * (1 - u) ;
        A.feliz = campana(u, 0.3, 1);
      } else {
        A.x = dst.x; A.y = dst.y; A.cuelga = 0;
        const pu = t - T.posa, bote = Math.exp(-pu * 9) * Math.sin(Math.min(1, pu / 0.04) * Math.PI);
        A.sx = 1 + 0.25 * bote; A.sy = 1 - 0.25 * bote;
        A.feliz = dentro(t, T.posa, T.posa + 0.1, T.posa + 0.5, T.posa + 0.7);
      }
    }
    // el hilo: cuelga de la viga; cuando ya está en el dedo se suelta y sube
    if (t >= T.hiloSuelta) { const u = fase(t, T.hiloSuelta, T.hiloSuelta + 0.4); A.hilo = 1 - u; A.hiloFin = { x: lerp(A.x, A.ancla.x, salida(u)), y: lerp(A.y - R_A, A.ancla.y, salida(u)) }; }
    // en el dedo: saluda a Carla, recibe el beso (se pone colorada) y pasea hasta la hoja
    if (t >= T.posa) {
      A.saluda = Math.max(A.saluda, dentro(t, T.acerca1 - 0.1, T.acerca1, T.beso0 - 0.05, T.beso0 + 0.05));
      const besada = dentro(t, T.corazon1 - 0.05, T.corazon1 + 0.05, T.paseo0, T.paseo0 + 0.3);
      A.rubor = besada; A.feliz = Math.max(A.feliz, besada);
      if (besada > 0) A.sy *= 1 + 0.06 * Math.sin(t * 20) * besada;
    }
    if (t >= T.paseo0 && pC) {
      const u = fase(t, T.paseo0, T.paseo1);
      const a = sitioDedo(pC), b = sitioHoja(t);
      if (u < 1) { A.x = lerp(a.x, b.x, suave(u)); A.y = lerp(a.y, b.y, suave(u)) - 1.5 * Math.abs(Math.sin(u * Math.PI * 4)); A.anda = 1; A.patas = u * 6; }
      else { A.x = b.x; A.y = b.y; }
      A.mira = { x: 0.2, y: 0.4 };
    }
    // ya en la hoja: saluda a Guillermo
    if (t >= T.paseo1) {
      A.mira = t > T.retira1 ? { x: 0.95, y: 0.1 } : { x: 0.6, y: -0.4 };
      A.saluda = Math.max(dentro(t, T.paseo1 + 0.05, T.paseo1 + 0.12, T.paseo1 + 0.45, T.paseo1 + 0.55), dentro(t, T.saludaA, T.saludaA + 0.08, T.saludaA + 0.6, T.saludaA + 0.7));
      A.saludaDer = t > T.saludaA - 0.2;
    }
    return A;
  }

  // dibujo de la araña: redondita, ojazos, sonrisa y ocho patitas cortas
  const TINTA = "#0b0a0e";
  function dibArana(g, A, t) {
    g.save(); g.beginPath(); g.rect(-2000, TECHO, 5000, 3000); g.clip();          // se esconde dentro de la viga
    // hilo
    const fin = A.hiloFin || { x: A.x, y: A.y - R_A * A.sy };
    if (A.hilo > 0.01 && fin.y > A.ancla.y + 1) {
      g.save(); g.globalAlpha = Math.min(1, A.hilo * 1.5); g.lineCap = "round";
      g.strokeStyle = "rgba(40,50,40,0.35)"; g.lineWidth = 2.4; g.beginPath(); g.moveTo(A.ancla.x, A.ancla.y); g.lineTo(fin.x, fin.y); g.stroke();
      g.strokeStyle = "rgba(255,255,250,0.95)"; g.lineWidth = 1.1; g.beginPath(); g.moveTo(A.ancla.x, A.ancla.y); g.lineTo(fin.x, fin.y); g.stroke();
      g.restore();
    }
    g.save(); g.translate(A.x, A.y); g.rotate(A.ang); g.scale(A.sx, A.sy); g.lineCap = "round"; g.lineJoin = "round";
    // patas: cuatro a cada lado (colgando, recogidas; andando, alternan)
    const patas = (lado) => {
      for (let i = 0; i < 4; i++) {
        const a0 = -0.55 + i * 0.42;                    // de arriba abajo
        const anda = A.anda ? Math.sin(A.patas * Math.PI * 2 + i * 1.7 + (lado > 0 ? Math.PI : 0)) : 0;
        const meneo = 0.08 * Math.sin(t * 3 + i + lado);
        const sal = A.saluda > 0 && i === 0 && ((lado < 0) !== !!A.saludaDer);
        const bx = lado * Math.cos(a0) * R_A * 0.9, by = Math.sin(a0) * R_A * 0.9;
        let kx, ky, fx, fy;
        if (sal) {
          const w = A.saluda, ond = Math.sin(t * 16) * 0.5;
          kx = bx + lado * lerp(7, 5, w); ky = by + lerp(-5, -11, w);
          fx = kx + lado * lerp(3, 6 + 3 * ond, w); fy = ky + lerp(9, -6 + 2 * ond, w);
        } else {
          const recoge = A.cuelga * 0.35;
          kx = bx + lado * (7.5 - 2 * recoge); ky = by - 5.5 + 2 * recoge + meneo * 6 - 2 * Math.max(0, anda);
          fx = kx + lado * (3.2 + 1.5 * anda); fy = ky + 9 - 2 * recoge + (A.cuelga ? 0 : 1.5);
        }
        g.strokeStyle = TINTA; g.lineWidth = 3.4; g.beginPath(); g.moveTo(bx, by); g.lineTo(kx, ky); g.lineTo(fx, fy); g.stroke();
        g.strokeStyle = "#5b4378"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(bx, by); g.lineTo(kx, ky); g.lineTo(fx, fy); g.stroke();
      }
    };
    patas(-1); patas(1);
    // cuerpo
    const gr = g.createRadialGradient(-3.5, -4, 1, 0, 0, R_A * 1.1);
    gr.addColorStop(0, "#8e72b8"); gr.addColorStop(0.55, "#5a3f7d"); gr.addColorStop(1, "#3a2654");
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R_A, 0, Math.PI * 2); g.fill();
    g.lineWidth = 1.8; g.strokeStyle = TINTA; g.stroke();
    // pelillo arriba
    g.lineWidth = 1.3; g.beginPath(); g.moveTo(-1.5, -R_A + 0.5); g.quadraticCurveTo(-2.5, -R_A - 3, -0.5, -R_A - 4); g.moveTo(1.2, -R_A + 0.5); g.quadraticCurveTo(2.5, -R_A - 2.5, 3.5, -R_A - 3); g.stroke();
    // ojazos
    const pa = A.parp, abre = 1 + 0.25 * A.susto;
    for (const s of [-1, 1]) {
      const ex = s * 3.9, ey = -1.5;
      if (A.feliz > 0.5 && pa < 0.5) {
        g.strokeStyle = TINTA; g.lineWidth = 1.5; g.beginPath(); g.arc(ex, ey + 1, 2.8, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
      } else {
        const ry = 4.6 * abre * (1 - 0.9 * pa);
        g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(ex, ey, 3.6 * abre, Math.max(0.4, ry), 0, 0, Math.PI * 2); g.fill();
        g.lineWidth = 1.1; g.strokeStyle = TINTA; g.stroke();
        if (pa < 0.6) {
          const pr = A.susto > 0.5 ? 1.3 : 2.3;
          g.fillStyle = "#140c18"; g.beginPath(); g.arc(ex + A.mira.x * 1.3, ey + A.mira.y * 1.6, pr, 0, Math.PI * 2); g.fill();
          g.fillStyle = "#ffffff"; g.beginPath(); g.arc(ex + A.mira.x * 1.3 - 0.8, ey + A.mira.y * 1.6 - 0.9, 0.75, 0, Math.PI * 2); g.fill();
        }
      }
    }
    // mofletes
    g.fillStyle = `rgba(255,120,150,${0.35 + 0.5 * A.rubor})`;
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 6.4, 3.6, 2, 1.3, 0, 0, Math.PI * 2); g.fill(); }
    // boca: sonrisa (o «o» del susto)
    g.strokeStyle = TINTA; g.lineWidth = 1.2;
    if (A.susto > 0.5) { g.fillStyle = "#3a0f1a"; g.beginPath(); g.ellipse(0, 4.8, 1.5, 2, 0, 0, Math.PI * 2); g.fill(); g.stroke(); }
    else { g.beginPath(); g.arc(0, 3.2, 2.2 + 0.6 * A.feliz, Math.PI * 0.2, Math.PI * 0.8); g.stroke(); }
    // brillo
    g.fillStyle = "rgba(255,255,255,0.45)"; g.beginPath(); g.ellipse(-5, -6, 2.2, 1.2, -0.6, 0, Math.PI * 2); g.fill();
    g.restore();
    g.restore();
  }

  /* =====================================================================================
   * PELO DE PUNTA (por detrás de la cabeza de Guillermo, en pantalla)
   * ===================================================================================== */
  // bases del pelo (retrato) y largo de cada púa; salen hacia fuera desde el centro de la cabeza
  const PUAS = [[600, 380, 150], [660, 300, 190], [745, 262, 215], [835, 252, 220], [925, 282, 205], [1000, 336, 180], [1050, 410, 140]];
  const CENTRO_P = { x: 820, y: 560 };
  function puas(g, pG, k, t) {
    if (k < 0.01) return;
    const H = G.cabeza(pG), aP = q => G.aPantalla(pG, H.a(q));
    const pts = [];
    pts.push(aP(CENTRO_P));
    PUAS.forEach(([x, y, L], i) => {
      const dx = x - CENTRO_P.x, dy = y - CENTRO_P.y, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
      const w = 34;
      const vib = 6 * Math.sin(t * 37 + i * 1.9) * k;
      const ll = L * k + vib;
      pts.push(aP({ x: x - uy * w - ux * 20, y: y + ux * w - uy * 20 }));
      pts.push(aP({ x: x + ux * ll + uy * 10 * Math.sin(i * 1.3), y: y + uy * ll - ux * 10 * Math.sin(i * 1.3) }));
      pts.push(aP({ x: x + uy * w - ux * 20, y: y - ux * w - uy * 20 }));
    });
    g.save(); g.lineJoin = "round";
    g.beginPath(); g.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y); g.closePath();
    const c = pts[0], gr = g.createRadialGradient(c.x, c.y, 10, c.x, c.y, 120);
    gr.addColorStop(0, "#5c2f17"); gr.addColorStop(0.55, "#86492a"); gr.addColorStop(1, "#b0703f");
    g.fillStyle = gr; g.fill(); g.lineWidth = 2.3; g.strokeStyle = TINTA; g.stroke();
    // mechas claras
    g.strokeStyle = "rgba(225,150,95,0.75)"; g.lineWidth = 1.6; g.lineCap = "round";
    for (let i = 0; i < PUAS.length; i++) { const v = pts[2 + i * 3], b = mezcla(c, v, 0.55); g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(lerp(b.x, v.x, 0.8), lerp(b.y, v.y, 0.8)); g.stroke(); }
    g.restore();
  }

  /* =====================================================================================
   * DECORADO: rincón de cafetería con plantas
   * ===================================================================================== */
  const PX = 452;                                          // maceta de la monstera
  let fondo = null;
  function hojaMonstera(g, x, y, a, L, Wd, col, conHuecos) {
    g.save(); g.translate(x, y); g.rotate(a); g.lineJoin = "round";
    const forma = () => {
      g.beginPath(); g.moveTo(0, 0);
      g.bezierCurveTo(L * 0.15, -Wd * 0.75, L * 0.75, -Wd * 0.7, L, 0);
      g.bezierCurveTo(L * 0.75, Wd * 0.7, L * 0.15, Wd * 0.75, 0, 0); g.closePath();
    };
    forma(); const gr = g.createLinearGradient(0, -Wd * 0.6, 0, Wd * 0.6); gr.addColorStop(0, col[0]); gr.addColorStop(1, col[1]);
    g.fillStyle = gr; g.fill(); g.lineWidth = 1.8; g.strokeStyle = TINTA; g.stroke();
    // nervios
    g.strokeStyle = "rgba(220,255,200,0.55)"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(2, 0); g.quadraticCurveTo(L * 0.5, -1.5, L * 0.95, 0); g.stroke();
    g.strokeStyle = "rgba(20,60,30,0.45)"; g.lineWidth = 1;
    for (let i = 1; i < 5; i++) { const s = L * i / 5.2; g.beginPath(); g.moveTo(s, -0.5); g.lineTo(s + L * 0.1, -Wd * 0.42 * Math.sin(Math.PI * s / L)); g.moveTo(s, 0.5); g.lineTo(s + L * 0.1, Wd * 0.42 * Math.sin(Math.PI * s / L)); g.stroke(); }
    // cortes típicos de la monstera (muescas en el borde)
    if (conHuecos) {
      g.fillStyle = col[2];
      for (const [s, sg] of [[0.35, -1], [0.55, -1], [0.45, 1], [0.68, 1]]) {
        const xx = L * s, yy = sg * Wd * 0.48 * Math.sin(Math.PI * s);
        g.beginPath(); g.ellipse(xx + 2, yy * 0.9, 2.2, Wd * 0.14, 0.3 * sg, 0, Math.PI * 2); g.fill();
      }
    }
    g.restore();
  }
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 100; const g = c.getContext("2d");
    g.translate(60, 50);
    // pared verde salvia con un estampado suave de ramitas
    const pared = g.createLinearGradient(0, -50, 0, 480); pared.addColorStop(0, "#a8c39b"); pared.addColorStop(1, "#86a77e");
    g.fillStyle = pared; g.fillRect(-60, -50, W + 120, 530);
    g.strokeStyle = "rgba(250,255,235,0.16)"; g.lineWidth = 2; g.lineCap = "round";
    for (let j = 0; j < 6; j++) for (let i = 0; i < 17; i++) {
      const x = -40 + i * 68 + (j % 2) * 34, y = 70 + j * 52;
      g.beginPath(); g.moveTo(x, y + 10); g.quadraticCurveTo(x + 2, y, x + 6, y - 9); g.stroke();
      g.beginPath(); g.ellipse(x - 3, y, 4, 2, -0.6, 0, Math.PI * 2); g.ellipse(x + 6, y - 4, 4, 2, 0.6, 0, Math.PI * 2); g.stroke();
    }
    // ventana de arco con luz de mañana (al fondo a la izquierda)
    const VX = 70, VY = 78, VW = 230, VH = 250;
    const arco = (ins) => { g.beginPath(); g.moveTo(VX + ins, VY + VH - ins); g.lineTo(VX + ins, VY + VW / 2); g.arc(VX + VW / 2, VY + VW / 2, VW / 2 - ins, Math.PI, 0); g.lineTo(VX + VW - ins, VY + VH - ins); g.closePath(); };
    arco(-10); g.fillStyle = "#f1e8d4"; g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    arco(4); const cielo = g.createLinearGradient(0, VY, 0, VY + VH); cielo.addColorStop(0, "#bfe3f2"); cielo.addColorStop(0.7, "#e9f4ea"); cielo.addColorStop(1, "#f7f1d6");
    g.fillStyle = cielo; g.fill();
    g.save(); arco(4); g.clip();
    // arbustos de fuera y una nube
    g.fillStyle = "#8cc07a"; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(VX + 10 + i * 36, VY + VH - 8, 28 + (i % 3) * 6, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#6fa865"; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(VX + 28 + i * 40, VY + VH + 6, 24, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "rgba(255,255,255,0.9)"; g.beginPath(); g.ellipse(VX + 80, VY + 70, 30, 11, 0, 0, Math.PI * 2); g.ellipse(VX + 104, VY + 62, 20, 12, 0, 0, Math.PI * 2); g.fill();
    g.restore();
    g.strokeStyle = "#f1e8d4"; g.lineWidth = 7;
    g.beginPath(); g.moveTo(VX + VW / 2, VY + 4); g.lineTo(VX + VW / 2, VY + VH - 4); g.moveTo(VX + 4, VY + 150); g.lineTo(VX + VW - 4, VY + 150); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 2; arco(4); g.stroke();
    // alféizar con dos macetitas
    g.fillStyle = "#e6dcc4"; g.fillRect(VX - 18, VY + VH - 2, VW + 36, 12); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(VX - 18, VY + VH - 2, VW + 36, 12);
    const macetita = (x, y, k, verde) => {
      g.fillStyle = "#c66a3f"; g.beginPath(); g.moveTo(x - 13 * k, y - 22 * k); g.lineTo(x + 13 * k, y - 22 * k); g.lineTo(x + 10 * k, y); g.lineTo(x - 10 * k, y); g.closePath(); g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
      g.fillStyle = "#d9804f"; g.fillRect(x - 15 * k, y - 26 * k, 30 * k, 6 * k); g.strokeRect(x - 15 * k, y - 26 * k, 30 * k, 6 * k);
      g.fillStyle = verde; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.45; g.beginPath(); g.ellipse(x + Math.cos(a) * 12 * k, y - 26 * k + Math.sin(a) * 12 * k, 4 * k, 9 * k, a + Math.PI / 2, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.4; g.stroke(); }
    };
    macetita(VX + 30, VY + VH - 2, 1, "#5d9c58"); macetita(VX + VW - 34, VY + VH - 2, 0.85, "#7cb36a");
    // luz de la ventana sobre la pared y el suelo
    g.save(); g.globalCompositeOperation = "lighter";
    const rayo = g.createLinearGradient(VX, VY, VX + 380, VY + 460); rayo.addColorStop(0, "rgba(255,245,200,0.16)"); rayo.addColorStop(1, "rgba(255,245,200,0)");
    g.fillStyle = rayo; g.beginPath(); g.moveTo(VX + 4, VY + 40); g.lineTo(VX + VW - 4, VY + 10); g.lineTo(VX + VW + 330, 520); g.lineTo(VX + 90, 520); g.closePath(); g.fill();
    g.restore();
    // friso de madera clara (zócalo alto)
    const FY = 352;
    g.fillStyle = "#efe4cc"; g.fillRect(-60, FY, W + 120, 470 - FY);
    g.strokeStyle = "rgba(140,105,70,0.28)"; g.lineWidth = 2;
    for (let x = -50; x < W + 60; x += 26) { g.beginPath(); g.moveTo(x, FY + 14); g.lineTo(x, 466); g.stroke(); }
    g.fillStyle = "#d8c49b"; g.fillRect(-60, FY, W + 120, 14); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-60, FY); g.lineTo(W + 60, FY); g.moveTo(-60, FY + 14); g.lineTo(W + 60, FY + 14); g.stroke();
    // balda a la derecha con plantitas, una tetera y tazas
    const BY = 196;
    g.fillStyle = "#8a5a36"; g.fillRect(800, BY, 200, 12); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(800, BY, 200, 12);
    g.fillStyle = "#6b4428"; for (const x of [818, 978]) { g.beginPath(); g.moveTo(x, BY + 12); g.lineTo(x + 4, BY + 12); g.lineTo(x + 4, BY + 34); g.closePath(); g.fill(); g.stroke(); }
    macetita(830, BY, 0.9, "#4f8f4c");
    // tetera blanca
    g.fillStyle = "#f7f3ea"; g.strokeStyle = TINTA; g.lineWidth = 2.2;
    g.beginPath(); g.ellipse(890, BY - 16, 22, 16, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(910, BY - 20); g.quadraticCurveTo(926, BY - 26, 930, BY - 36); g.lineWidth = 4; g.stroke(); g.strokeStyle = "#f7f3ea"; g.lineWidth = 2; g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 2.2; g.beginPath(); g.arc(868, BY - 16, 8, Math.PI * 0.5, Math.PI * 1.5); g.stroke();
    g.fillStyle = "#e3b04b"; g.beginPath(); g.ellipse(890, BY - 32, 9, 4, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    // tazas
    for (const [x, col] of [[948, "#e0795a"], [972, "#6aa3c9"]]) { g.fillStyle = col; g.beginPath(); g.moveTo(x - 9, BY - 18); g.lineTo(x + 9, BY - 18); g.lineTo(x + 7, BY); g.lineTo(x - 7, BY); g.closePath(); g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke(); }
    // potus colgando de la balda
    g.strokeStyle = "#3f7a3c"; g.lineWidth = 2;
    for (let j = 0; j < 2; j++) { const x0 = 812 + j * 26; g.beginPath(); g.moveTo(x0, BY + 8); g.quadraticCurveTo(x0 - 12, BY + 60, x0 + 4, BY + 110 + j * 20); g.stroke();
      for (let i = 0; i < 6; i++) { const y = BY + 20 + i * 16 + j * 4, x = x0 - 6 * Math.sin(i * 0.9) + (i % 2 ? 5 : -5);
        g.fillStyle = i % 2 ? "#6db15f" : "#4f9449"; g.beginPath(); g.ellipse(x, y, 6, 4, (i % 2 ? 0.6 : -0.6), 0, Math.PI * 2); g.fill(); g.lineWidth = 1.2; g.strokeStyle = TINTA; g.stroke(); g.strokeStyle = "#3f7a3c"; g.lineWidth = 2; } }
    // cuadro con una hoja botánica (sin letras)
    g.fillStyle = "#f6f0e2"; g.fillRect(610, 96, 96, 120); g.lineWidth = 6; g.strokeStyle = "#8a5a36"; g.strokeRect(610, 96, 96, 120); g.lineWidth = 2; g.strokeStyle = TINTA; g.strokeRect(607, 93, 102, 126);
    hojaMonstera(g, 640, 196, -1.15, 82, 52, ["#79b56c", "#4d8d4a", "#f6f0e2"], true);
    // lámpara colgante de mimbre
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(560, 30); g.lineTo(560, 92); g.stroke();
    g.fillStyle = "#d9a85b"; g.beginPath(); g.moveTo(534, 120); g.quadraticCurveTo(536, 90, 560, 90); g.quadraticCurveTo(584, 90, 586, 120); g.closePath(); g.fill(); g.lineWidth = 2.4; g.stroke();
    g.strokeStyle = "rgba(120,80,30,0.55)"; g.lineWidth = 1.2; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(538 + i * 11, 118); g.lineTo(552 + i * 4, 93); g.stroke(); }
    g.fillStyle = "#fff6c8"; g.beginPath(); g.ellipse(560, 121, 16, 4, 0, 0, Math.PI * 2); g.fill();
    // suelo de barro (baldosas en perspectiva)
    const su = g.createLinearGradient(0, 470, 0, H + 50); su.addColorStop(0, "#c27650"); su.addColorStop(1, "#9c5638");
    g.fillStyle = su; g.fillRect(-60, 470, W + 120, H + 50 - 470);
    g.strokeStyle = "rgba(90,40,20,0.35)"; g.lineWidth = 2;
    for (let i = 0, y = 478; y < H + 50; i++, y += 9 + i * 7) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    for (let i = -14; i <= 14; i++) { g.beginPath(); g.moveTo(512 + i * 58, 470); g.lineTo(512 + i * 150, H + 50); g.stroke(); }
    g.fillStyle = "#5e3d24"; g.fillRect(-60, 462, W + 120, 10); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-60, 472); g.lineTo(W + 60, 472); g.stroke();
    // la monstera: maceta de barro y hojas (la hoja de la araña se pinta en cada fotograma)
    const PB = 528;
    g.strokeStyle = "#3d6b33"; g.lineWidth = 4; g.lineCap = "round";
    for (const [x1, y1] of [[PX - 70, 360], [PX - 40, 300], [PX + 10, 290], [PX + 40, 340], [PX - 90, 420], [HOJA.x, HOJA.y]]) {
      g.beginPath(); g.moveTo(PX, PB - 64); g.quadraticCurveTo((PX + x1) / 2, y1 + 40, x1, y1); g.stroke();
    }
    const VERDES = [["#5fae5c", "#367a3a", "#86a77e"], ["#6dbb64", "#3f8a44", "#86a77e"]];
    hojaMonstera(g, PX - 70, 360, -2.5, 70, 46, VERDES[0], true);
    hojaMonstera(g, PX - 40, 300, -2.0, 66, 44, VERDES[1], true);
    hojaMonstera(g, PX + 10, 290, -1.2, 64, 42, VERDES[0], true);
    hojaMonstera(g, PX + 40, 340, -0.8, 54, 36, VERDES[1], true);
    hojaMonstera(g, PX - 90, 420, 2.8, 58, 38, VERDES[1], true);
    g.fillStyle = "#c4683c"; g.beginPath(); g.moveTo(PX - 38, PB - 62); g.lineTo(PX + 38, PB - 62); g.lineTo(PX + 28, PB); g.lineTo(PX - 28, PB); g.closePath(); g.fill(); g.lineWidth = 2.6; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "#d9824f"; g.fillRect(PX - 42, PB - 72, 84, 12); g.strokeRect(PX - 42, PB - 72, 84, 12);
    g.fillStyle = "rgba(255,230,200,0.35)"; g.fillRect(PX - 30, PB - 56, 8, 48);
    g.fillStyle = "rgba(60,30,20,0.3)"; g.beginPath(); g.ellipse(PX, PB + 2, 40, 5, 0, 0, Math.PI * 2); g.fill();
    // viga de madera del techo
    g.fillStyle = "#6e4a2c"; g.fillRect(-60, -50, W + 120, TECHO + 50);
    g.strokeStyle = "rgba(40,22,10,0.35)"; g.lineWidth = 2;
    for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-60, -40 + i * 13); for (let x = -60; x < W + 60; x += 80) g.quadraticCurveTo(x + 40, -40 + i * 13 + 4 * Math.sin(x * 0.03 + i), x + 80, -40 + i * 13); g.stroke(); }
    g.fillStyle = "#8b5f3a"; g.fillRect(-60, TECHO - 8, W + 120, 8);
    g.strokeStyle = TINTA; g.lineWidth = 3; g.beginPath(); g.moveTo(-60, TECHO); g.lineTo(W + 60, TECHO); g.stroke();
    // macetero de macramé colgando a la derecha
    const MX = 946, MY = 150;
    g.strokeStyle = "#efe2c4"; g.lineWidth = 2;
    for (const dx of [-16, 0, 16]) { g.beginPath(); g.moveTo(MX, TECHO); g.lineTo(MX + dx, MY); g.stroke(); }
    g.fillStyle = "#e9dfcf"; g.beginPath(); g.ellipse(MX, MY + 12, 20, 16, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.strokeStyle = "#3f7a3c"; g.lineWidth = 2;
    for (let j = 0; j < 3; j++) { const x0 = MX - 14 + j * 14; g.beginPath(); g.moveTo(x0, MY + 4); g.quadraticCurveTo(x0 + 10 * (j - 1), MY + 60, x0 + 6 * (j - 1), MY + 90 + j * 18); g.stroke();
      for (let i = 0; i < 5; i++) { const y = MY + 14 + i * 17 + j * 3, x = x0 + 7 * (j - 1) * i / 5 + (i % 2 ? 5 : -5);
        g.fillStyle = i % 2 ? "#6db15f" : "#4f9449"; g.beginPath(); g.ellipse(x, y, 6, 4, (i % 2 ? 0.6 : -0.6), 0, Math.PI * 2); g.fill(); g.lineWidth = 1.2; g.strokeStyle = TINTA; g.stroke(); g.strokeStyle = "#3f7a3c"; g.lineWidth = 2; } }
    // viñeta
    const v = g.createRadialGradient(512, 320, 260, 512, 320, 700); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(30,20,10,0.45)");
    g.fillStyle = v; g.fillRect(-60, -50, W + 120, H + 100);
    return c;
  }
  // la hoja de la araña (por fotograma: se mece y se hunde al pisarla)
  function dibHoja(g, t) {
    const h = hojaEstado(t);
    hojaMonstera(g, h.base.x, h.base.y, h.a, HOJA.largo, HOJA.ancho, ["#72c068", "#3f8a44", "#86a77e"], true);
  }
  // motas de polvo en la luz de la ventana
  function motas(g, t) {
    g.save(); g.fillStyle = "rgba(255,250,220,0.7)";
    for (let i = 0; i < 14; i++) {
      const ph = (t * 0.05 + hash(i)) % 1, x = 90 + hash(i + 3) * 320 + 30 * Math.sin(t * 0.4 + i) + ph * 120, y = 120 + hash(i + 9) * 330 + 20 * Math.sin(t * 0.6 + i * 2);
      g.globalAlpha = 0.5 * Math.sin(Math.PI * ph); g.beginPath(); g.arc(x, y, 1.4 + hash(i + 5), 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  /* ---------- efectos ---------- */
  // ondas del grito (arcos que salen de la boca)
  function ondasGrito(g, t, pG) {
    const env = dentro(t, T.grito, T.grito + 0.04, T.salta - 0.05, T.salta + 0.1); if (env <= 0.01) return;
    const b = G.aPantalla(pG, G.boca(pG));
    g.save(); g.lineCap = "round"; g.strokeStyle = "#ffffff"; g.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const ph = ((t - T.grito) * 3.2 + i / 3) % 1, r = 24 + 70 * ph;
      g.globalAlpha = env * (1 - ph);
      g.beginPath(); g.arc(b.x + 4, b.y, r, -0.55, 0.55); g.stroke();
    }
    // rayitas de susto alrededor de la cabeza
    const c = G.aPantalla(pG, G.centroCabeza(pG));
    g.globalAlpha = env; g.strokeStyle = TINTA; g.lineWidth = 2.6;
    for (let j = 0; j < 6; j++) { const a = -Math.PI * 0.95 + j * 0.36 + 0.05 * Math.sin(t * 40 + j), r0 = 92 + 4 * Math.sin(t * 50 + j), r1 = r0 + 16;
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // estrellitas del impacto al cogerle
  function estrellaPuntas(g, x, y, r, puntas, rot, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function impacto(g, t, pC) {
    const k = fase(t, T.coge, T.coge + 0.4); if (k <= 0 || k >= 1) return;
    const c = CA.aPantalla(pC, CA.tronco(pC)({ x: 420, y: 520 }));
    g.save(); g.globalAlpha = 1 - k; g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.lineCap = "round";
    for (let j = 0; j < 7; j++) { const a = Math.PI * (0.65 + 0.22 * j), r0 = 50 + 40 * salida(k), r1 = r0 + 18;
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // líneas de velocidad y polvo al correr
  function polvo(g, t, pG) {
    const env = dentro(t, T.corre0, T.corre0 + 0.05, T.corre1, T.corre1 + 0.35); if (env <= 0.01) return;
    g.save();
    for (let i = 0; i < 6; i++) {
      const t0 = T.corre0 + i * 0.07, u = fase(t, t0, t0 + 0.45); if (u <= 0 || u >= 1) continue;
      const x = lerp(XL() + 40, XB - 40, i / 5) - 18 * u, y = SUELO - 6 - 10 * u;
      g.globalAlpha = 0.6 * (1 - u) * env; g.fillStyle = "#f0dcc8"; g.strokeStyle = "rgba(90,50,30,0.6)"; g.lineWidth = 1.5;
      g.beginPath(); g.arc(x, y, 6 + 10 * u, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    const rap = dentro(t, T.corre0, T.corre0 + 0.06, T.corre1 - 0.1, T.corre1);
    if (rap > 0.01) {
      const P = G.aPantalla(pG, pG.pelvis);
      g.globalAlpha = 0.8 * rap; g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.lineCap = "round";
      for (let j = 0; j < 4; j++) { const y = P.y - 110 + j * 45, l = 40 + 20 * hash(j); g.beginPath(); g.moveTo(P.x - 70 - l, y); g.lineTo(P.x - 70, y); g.stroke(); }
    }
    g.restore();
  }
  // corazón del besito: de los labios de Carla a la araña
  function corazon(g, x, y, r, col) {
    g.beginPath(); g.moveTo(x, y + r * 0.9); g.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.4, x, y - r * 0.5);
    g.bezierCurveTo(x + r * 0.7, y - r * 1.4, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); g.closePath();
    g.fillStyle = col; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
  }
  function besito(g, t, pC, A) {
    const u = fase(t, T.lanza, T.corazon1);
    if (u > 0 && u < 1) {
      const b = CA.aPantalla(pC, CA.boca(pC)), dst = { x: A.x + 2, y: A.y - 4 };
      const x = lerp(b.x - 10, dst.x, suave(u)), y = lerp(b.y, dst.y, suave(u)) - 26 * Math.sin(Math.PI * u) + 3 * Math.sin(t * 18);
      const r = 7 * (0.6 + 0.4 * Math.sin(Math.PI * Math.min(1, u * 1.6))) * (1 - 0.5 * fase(u, 0.85, 1));
      g.save(); g.globalAlpha = 1 - fase(u, 0.88, 1); corazon(g, x, y, r, "#ff5d8a"); g.restore();
    }
    // corazoncitos que suben de la araña al recibirlo
    const k = fase(t, T.corazon1, T.corazon1 + 0.9);
    if (k > 0 && k < 1) {
      g.save();
      for (let i = 0; i < 3; i++) { const ph = clamp(k * 1.4 - i * 0.18); if (ph <= 0 || ph >= 1) continue;
        g.globalAlpha = Math.sin(Math.PI * ph); corazon(g, A.x - 8 + i * 9 + 4 * Math.sin(t * 6 + i), A.y - 16 - 34 * ph, 3.6, i % 2 ? "#ff8fb0" : "#ff5d8a"); }
      g.restore();
    }
  }
  // notas musicales del silbido
  function notas(g, t, pG) {
    const env = dentro(t, T.silba0, T.silba0 + 0.2, T.fin - 0.1, T.fin + 0.3) * (1 - campana(t, T.saludaA + 0.08, T.silba2));
    if (env <= 0.01) return;
    const b = G.aPantalla(pG, G.boca(pG)), dir = pG.espejo ? -1 : 1;
    const rap = t > T.silba2 ? 1.9 : 1;
    g.save(); g.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const ph = (((t - T.silba0) * 0.75 * rap) + i / 3) % 1;
      const x = b.x + dir * (12 + 46 * ph) + 6 * Math.sin(t * 5 + i), y = b.y - 10 - 60 * ph;
      g.globalAlpha = env * Math.sin(Math.PI * ph);
      g.fillStyle = TINTA; g.strokeStyle = TINTA; g.lineWidth = 2.2;
      g.save(); g.translate(x, y); g.rotate(0.2 * Math.sin(t * 4 + i));
      g.beginPath(); g.ellipse(0, 0, 4.2, 3, -0.4, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.moveTo(3.6, -1); g.lineTo(3.6, -15); g.stroke();
      if (i % 2) { g.beginPath(); g.moveTo(3.6, -15); g.quadraticCurveTo(9, -12, 8, -6); g.stroke(); }
      g.restore();
    }
    g.restore();
  }
  // destello del guiño de Carla
  function destelloGuino(g, t, pC) {
    const k = fase(t, T.guinoC + 0.05, T.guinoC + 0.55); if (k <= 0 || k >= 1) return;
    const c = CA.aPantalla(pC, CA.cabeza(pC).a({ x: 990, y: 470 }));
    g.save(); g.globalAlpha = Math.sin(Math.PI * k); g.fillStyle = "#ffffff"; g.strokeStyle = "#ffe14d"; g.lineWidth = 1.5;
    estrellaPuntas(g, c.x + 10, c.y - 8, 9 * Math.sin(Math.PI * k) + 2, 4, t * 2, 0.25); g.fill(); g.stroke(); g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const base = { k: 1.0, x: 520, y: 300 };
    const grito = dentro(t, T.abre, T.bizco + 0.3, T.grito + 0.05, T.salta);
    const brazos = dentro(t, T.coge, T.coge + 0.6, T.suelta, T.aterriza + 0.3);
    const dedo = dentro(t, T.columpio0, T.posa, T.retira0, T.sale1);
    const fin = tramo(t, T.sale0, T.sale1 + 0.3);
    let k = base.k, x = base.x, y = base.y;
    k = lerp(k, 1.12, grito); x = lerp(x, 430, grito); y = lerp(y, 270, grito);
    k = lerp(k, 1.06, brazos); x = lerp(x, 540, brazos); y = lerp(y, 300, brazos);
    k = lerp(k, 1.14, dedo); x = lerp(x, 560, dedo); y = lerp(y, 290, dedo);
    k = lerp(k, 1.06, fin); x = lerp(x, 588, fin); y = lerp(y, 300, fin);
    return { k, x, y };
  }

  function poses(t) {
    const pC0 = poseC(t, null);
    const pG = poseG(t, pC0);
    const pC = poseC(t, pG);
    return { g: pG, c: pC };
  }

  class GuillermoArana extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !CA.listo()) return;
      if (!fondo) fondo = creaFondo();
      const { g: pG, c: pC } = poses(t);
      const A = arana(t, pG, pC);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = t >= T.coge ? 2.5 * Math.exp(-(t - T.coge) * 8) * suave(fase(t, T.coge, T.coge + 0.05)) : 0;
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -60, -50);
      dibHoja(g, t);
      motas(g, t);
      // sombras
      const PGs = G.aPantalla(pG, pG.pelvis), alto = clamp((SUELO - HP - PGs.y) / 200);
      g.save(); g.fillStyle = "rgba(60,25,10,0.32)";
      g.beginPath(); g.ellipse(PGs.x, SUELO + 2, 56 * (1 - 0.4 * alto), 6 * (1 - 0.4 * alto), 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pC.x, SUELO + 2, 50, 6, 0, 0, Math.PI * 2); g.fill();
      g.restore();
      const dibG = () => {
        const P = pelvisPantalla(pG);
        g.save();
        if (pG.giro) { g.translate(P.x, P.y); g.rotate(pG.giro); g.translate(-P.x, -P.y); }
        if (pG.giroX !== undefined) {
          const gx = Math.abs(Math.cos(pG.giroX));
          g.translate(pG.x, 0); g.scale(Math.max(0.03, gx), 1); g.translate(-pG.x, 0);
        }
        puas(g, pG, pG.erizado, t);
        G.dibujar(g, pG, t);
        g.restore();
      };
      const delante = t >= T.salta - 0.02 && t < T.cambio;       // Guillermo por delante de Carla (salto, en brazos, al soltarle)
      polvo(g, t, pG);                                           // polvo y rayas de la carrera: por detrás de los dos
      if (!delante) dibG();
      CA.dibujar(g, pC, t);
      if (delante) dibG();
      if (pC.encima) { manoEncima(g, pC, pC.encima.lejos); manoEncima(g, pC, pC.encima.cerca); }
      impacto(g, t, pC);
      dibArana(g, A, t);
      ondasGrito(g, t, pG);
      besito(g, t, pC, A);
      notas(g, t, pG);
      destelloGuino(g, t, pC);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00046", nombre: "Guillermo y Carla · La araña", crear: () => new GuillermoArana() });
  window.__A2D_00046 = {
    pose: t => poses(t), T, DUR, geo: () => (GEO || preparaGeo(), GEO), arana: t => { const p = poses(t); return arana(t, p.g, p.c); },
    prueba: (rot, torso, mus, hx, hy, ex, ey) => { ROT_BRAZOS = rot; TORSO_BRAZOS = torso; AGARRE_MUSLO = mus; HN = { x: hx, y: hy }; if (ex !== undefined) ESPALDA_G = { x: ex, y: ey }; GEO = null; SX = null; PASOS_RUN = null; preparaGeo(); return GEO.chk; }
  };
})();
