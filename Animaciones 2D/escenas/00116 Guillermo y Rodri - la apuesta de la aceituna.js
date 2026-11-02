"use strict";
/* 00116 · Guillermo y Rodri · La aceituna
 *
 * Negro → una taberna de tapas al anochecer: pared de cal ocre con zócalo de azulejos azules y
 * amarillos, viga de madera, una barra con su vitrina de tapas, jamones colgando, una balda de
 * botellas sin etiqueta, una ventana en arco a la calle (hora azul, farolas) con ristras de ajos y
 * guindillas, un farolillo de esparto sobre la mesa y suelo de barro. Guillermo y Rodri, de pie, a
 * los lados de un barril que hace de mesa: en el tablero, un platito con UNA aceituna (rellena de
 * pimiento) en su chorrito de aceite, un vaso de palillos, dos vermús con su rodaja de naranja, una
 * rebanada de pan sobre una servilleta y un servilletero.
 *
 * Los dos miran la última aceituna, se miran (reto) y sacan un palillo cada uno; cruzan los palillos
 * como espadas (¡tin!) y empieza el duelo: cada pinchazo hace que la aceituna salga disparada y vaya
 * rebotando por el tablero (contra los vasos, por encima del pan, contra el servilletero y el vaso
 * de palillos, girando, con su reguero de aceite) hasta volver al plato. Turnos cada vez más
 * rápidos, lengua fuera y sudor. Rodri se rinde: tira su palillo por encima del hombro, coge la
 * aceituna con los dedos, la lanza al aire y se la zampa al vuelo, en la gloria. Guillermo, con los
 * ojos cerrados de pura concentración, carga… y ¡zas!: le clava el palillo a Rodri en la manga del
 * plumífero (sale una nubecilla de plumón que se queda flotando). Rodri levanta el brazo y mira la
 * manga, mira a Guillermo, traga; Guillermo pide perdón con la palma, colorado. Rodri, muy serio,
 * sopla: el plumón vuela a la nariz de Guillermo, que estornuda. Los dos miran a cámara; Rodri
 * guiña → negro.
 *
 * Sin letras ni números. Todo depende de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, hash, campana } = M2;
  const G = Guillermo, R = Rodri;
  const DUR = 14.6;
  const TINTA = "#0b0a0e";
  const P = (x, y) => ({ x, y });

  /* ---------- guion (s) ---------- */
  const T = {
    mira: 0.55, gMiraR: 1.05, rMiraG: 1.2, reto: 1.4, retoFin: 2.0,
    gCoge: 2.0, gSaca: 2.22, rCoge: 2.2, rSaca: 2.42, guardia: 2.55, cruce: 3.02, cruceFin: 3.3, vuelta: 3.35,
    zoom0: 2.6, zoom1: 3.5,
    quieta: 8.02,
    rRinde: 8.12, rTira: 8.36, rCogeO: 8.62, rCogida: 8.8, rAlza: 8.98, rLanza: 9.04, rTraga: 9.44, mastica: 9.5,
    rApoya: 9.18, rApoyado: 9.82,
    gCierra: 8.18, gAlza: 8.45, gAlzado: 9.15, gCarga: 9.62, pincha: 10.02,
    gSuelta: 10.24, gAbre: 10.36, gMiraPlato: 10.46, gMiraManga: 10.82, rMiraManga: 10.34, rLevanta: 10.4, rLevantado: 10.8,
    rMiraG2: 10.92, gMiraR2: 11.12, trago: 11.3, gPerdon: 11.5,
    rSopla: 11.95, sopla: 12.1, soplaFin: 12.4, gPica: 12.36, estornudo: 12.62, gPerdonFin: 12.62,
    rBaja: 12.5, rBajado: 12.9,
    camara: 12.98, guino: 13.36, fin: 13.95
  };
  // pinchazos: quién y cuándo (la punta llega a la aceituna en t)
  const GOLPES = [
    { q: "g", t: 3.75, sube: 0.22 }, { q: "r", t: 4.95, sube: 0.22 }, { q: "g", t: 5.95, sube: 0.2 }, { q: "g", t: 6.13, sube: 0.06, falla: true },
    { q: "r", t: 6.5, sube: 0.16 }, { q: "g", t: 6.98, sube: 0.12 }, { q: "r", t: 7.26, sube: 0.11 }, { q: "g", t: 7.54, sube: 0.1 }, { q: "r", t: 7.8, sube: 0.1 }
  ];

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
  const RELAJA = D(0.6, 0.7, 0.66, 0.62, 0.58), PINZA = D(0.38, 0.3, 0.16, 0.14, 0.14), PALILLO = D(0.3, 0.42, 0.12, 0.1, 0.1),
    COGE = D(0.55, 0.75, 0.3, 0.25, 0.25), ABIERTA = D(1, 1, 1, 1, 1), PERDON = D(0.9, 1, 1, 0.95, 0.92), TIRA = D(0.75, 0.85, 0.8, 0.75, 0.7);

  /* ---------- caras (mismos campos para los dos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, wi: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista, d = 0.15) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* =====================================================================================
   * DISPOSICIÓN (px de pantalla, antes de la cámara)
   * ===================================================================================== */
  const S = 0.31, SUELO = 560;
  const XG = 390, XR = 636;
  // barril: tablero (centro, radios) y cuerpo
  const BAR = { x: 512, y: 344, rx: 92, ry: 23, grueso: 7, ancho: 88, panza: 97 };
  const enTablero = (x, y, m = 0) => { const dx = (x - BAR.x) / (BAR.rx - m), dy = (y - BAR.y) / (BAR.ry - m * 0.25); return dx * dx + dy * dy < 1; };
  // cosas del tablero (punto de apoyo = centro de la base)
  const PLATO = { x: 512, y: 345, rx: 30, ry: 9 };
  const PALILLERO = { x: 519, y: 328, r: 6.5, h: 14 };
  const VASO_G = { x: 471, y: 335, r: 8, h: 20 }, VASO_R = { x: 555, y: 336, r: 8, h: 20 };
  const PAN = { x: 485, y: 357 };
  const SERV = { x: 546, y: 358 };
  const OR = 6;                          // radio de la aceituna
  const REPOSO = P(512, 342);           // aceituna quieta en el plato (punto de apoyo)

  /* =====================================================================================
   * LA ACEITUNA: recorridos tras cada pinchazo (t, x, y, salto del tramo que empieza, choque al llegar)
   * ===================================================================================== */
  const RECORRIDOS = [
    [[3.75, 512, 342, 8], [3.9, 541, 338, 0, "vasoR"], [4.05, 526, 354, 5], [4.18, 501, 360, 0], [4.32, 487, 354, 7, "pan"], [4.46, 498, 348, 0], [4.6, 512, 342, 0, "plato"]],
    [[4.95, 512, 342, 9], [5.1, 485, 337, 0, "vasoG"], [5.22, 480, 351, 4], [5.36, 498, 361, 0], [5.5, 531, 358, 0, "serv"], [5.62, 523, 351, 5], [5.75, 512, 342, 0, "plato"]],
    [[5.95, 512, 342, 36], [6.3, 514, 342, 7, "plato"], [6.44, 512, 342, 0, "plato"]],
    [[6.5, 512, 342, 6], [6.6, 511, 334, 0, "palillos"], [6.72, 500, 350, 4], [6.84, 512, 342, 0, "plato"]],
    [[6.98, 512, 342, 5], [7.08, 532, 349, 3], [7.18, 512, 342, 0, "plato"]],
    [[7.26, 512, 342, 5], [7.36, 492, 347, 3], [7.46, 512, 342, 0, "plato"]],
    [[7.54, 512, 342, 6], [7.64, 530, 337, 3], [7.74, 512, 342, 0, "plato"]],
    [[7.8, 512, 342, 4], [7.9, 494, 340, 3], [8.0, 512, 342, 0, "plato"]]
  ];
  // choques (para los efectos): {t, x, y, tipo}
  const CHOQUES = [];
  RECORRIDOS.forEach(r => r.forEach(k => { if (k[4]) CHOQUES.push({ t: k[0], x: k[1], y: k[2], tipo: k[4] }); }));
  // giro acumulado (rodando: ángulo = recorrido / radio; en el aire, un giro de más)
  RECORRIDOS.forEach(r => { let a = 0; r.forEach((k, i) => { if (i) a += (k[1] - r[i - 1][1]) / OR + 0.9 * Math.sign(k[1] - r[i - 1][1] || 1) * r[i - 1][3] / 6; k.rot = a; }); });
  // posición de la aceituna en el tablero (sin contar la mano de Rodri)
  function olivaMesa(t) {
    let rotBase = 0;
    for (const r of RECORRIDOS) {
      const t0 = r[0][0], t1 = r[r.length - 1][0];
      if (t >= t0 && t < t1) {
        let i = 0; while (i < r.length - 2 && t >= r[i + 1][0]) i++;
        const a = r[i], b = r[i + 1], u = fase(t, a[0], b[0]), ue = a[3] > 0 ? u : suave(u);
        const x = lerp(a[1], b[1], ue), y = lerp(a[2], b[2], ue), h = a[3] * 4 * u * (1 - u);
        return { x, y, h, rot: rotBase + lerp(a.rot, b.rot, u), mueve: 1 };
      }
      if (t >= t1) rotBase += r[r.length - 1].rot;
    }
    // quieta: tambaleo al aterrizar en el plato
    let ult = -9; for (const c of CHOQUES) if (c.tipo === "plato" && c.t <= t) ult = c.t;
    const u = t - ult, bam = u < 0.5 ? 0.35 * Math.exp(-u * 9) * Math.sin(u * 32) : 0;
    return { x: REPOSO.x + 1.2 * bam, y: REPOSO.y, h: 0, rot: rotBase + bam, mueve: 0 };
  }

  /* =====================================================================================
   * PISTAS DE MANOS (pantalla): [t0, t1, objetivo] con objetivo {x, y, mu, d, pal?} o función (t) → {…}
   * mu = hacia el codo, en ángulo de pantalla · pal = ángulo del palillo (de la pinza a la punta)
   * ===================================================================================== */
  const evalua = (o, t) => (typeof o === "function" ? o(t) : o);
  const mezclaM = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), mu: lerpAng(a.mu, b.mu, k), d: mezclaD(a.d, b.d, k),
    pal: lerpAng(a.pal ?? b.pal ?? 0, b.pal ?? a.pal ?? 0, k) });
  function pista(lista, t) {
    let c = evalua(lista[0][2], t);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i]; if (t <= t0) break;
      c = mezclaM(c, evalua(obj, t), (f || suave)(fase(t, t0, t1)));
    }
    return c;
  }
  const RP = 12, LP = 22, LB = 6;               // pinza: distancia al centro de la mano · palillo: hasta la punta · cola
  const pinza = (m, r = RP) => ({ x: m.x - Math.cos(m.mu) * r, y: m.y - Math.sin(m.mu) * r });
  // mano que deja la punta del palillo en `tip`
  const desdePunta = (tip, pal, mu, d = PALILLO) => {
    const pz = { x: tip.x - Math.cos(pal) * LP, y: tip.y - Math.sin(pal) * LP };
    return { x: pz.x + Math.cos(mu) * RP, y: pz.y + Math.sin(mu) * RP, mu, d, pal };
  };
  // mano cuya pinza está en `q`
  const desdePinza = (q, mu, d = PINZA, pal) => ({ x: q.x + Math.cos(mu) * RP, y: q.y + Math.sin(mu) * RP, mu, d, pal });
  const palilloDe = l => { const pz = pinza(l); return { a: { x: pz.x - Math.cos(l.pal) * LB, y: pz.y - Math.sin(l.pal) * LB }, b: { x: pz.x + Math.cos(l.pal) * LP, y: pz.y + Math.sin(l.pal) * LP } }; };
  function manoRig(rig, p, m, dobla, objeto) {
    const h = rig.aHoja(p, m);
    return { x: h.x, y: h.y, ang: 0, mu: p.espejo ? Math.PI - m.mu : m.mu, puno: 1, dedos: m.d, dobla, objeto };
  }
  // pinchazos de cada uno: la punta sube y baja hasta la aceituna
  const PUNTA_OLIVA = P(REPOSO.x, REPOSO.y - 2 * OR + 1);
  function pistaDuelo(q, lista, espera, pal0, palG, mu) {
    for (const gp of GOLPES) {
      if (gp.q !== q) continue;
      const arriba = { x: espera.x + (q === "g" ? 4 : -4), y: espera.y - 16 };
      lista.push([gp.t - gp.sube, gp.t - 0.06, desdePunta(arriba, pal0, mu)]);
      const dest = gp.falla ? P(REPOSO.x - 2, REPOSO.y - 3) : PUNTA_OLIVA;
      lista.push([gp.t - 0.06, gp.t, desdePunta(dest, palG, mu), entrada]);
      lista.push([gp.t + 0.05, gp.t + 0.2, desdePunta(espera, pal0, mu)]);
    }
  }

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha)
   * ===================================================================================== */
  const R_MG = G.MUNECA_R * G.JK;
  const bolsilloG = (p, x, y) => { const q = G.tronco(p)({ x: x - Math.cos(-1.75) * R_MG, y: y - Math.sin(-1.75) * R_MG }); return { x: q.x, y: q.y, mu: -1.75 + p.torso, ang: 0, puno: 0, dobla: -1 }; };
  const CARAS_G = {
    inicio: E({ mx: 0.7, my: 0.4, c: 0.25, sonr: 0.3 }),
    oliva: E({ mx: 0.55, my: 0.75, c: 0.3, sd: 4, si: 4, sonr: 0.15, ancho: 0.9 }),
    reto: E({ mx: 0.9, my: 0.05, c: 0.45, sd: 22, gd: 0.12, si: -2, gi: -0.08, abre: 0, ancho: 1.0, sonr: 0.7 }),
    guardia: E({ mx: 0.6, my: -0.3, c: 0.4, sd: -4, gd: -0.12, si: -4, gi: -0.12, abre: 6, ancho: 1.05, sonr: 0.6 }),
    duelo: E({ mx: 0.55, my: 0.75, c: 0.35, z: 0.2, sd: -6, gd: -0.14, si: -6, gi: -0.14, abre: 8, ancho: 0.8, sonr: 0.1, lengua: 0.85 }),
    zen: E({ mx: 0.5, my: 0.6, c: 1, z: 0.35, sd: -8, gd: -0.18, si: -8, gi: -0.18, abre: 0, ancho: 0.7, sonr: -0.05, lengua: 0.6, dientes: 0 }),
    carga: E({ mx: 0.5, my: 0.6, c: 1, z: 0.8, sd: -10, gd: -0.2, si: -10, gi: -0.2, abre: 14, ancho: 0.95, sonr: -0.2 }),
    abre: E({ mx: 0.55, my: 0.8, c: 0, sd: 10, gd: 0.04, si: 10, gi: 0.04, abre: 4, ancho: 0.8, sonr: 0.05 }),
    manga: E({ mx: 0.85, my: 0.65, iris: 0.85, c: 0, sd: 26, gd: 0.16, si: 26, gi: 0.16, abre: 16, ancho: 0.6, sonr: -0.2 }),
    pillado: E({ mx: 0.9, my: 0.1, iris: 0.9, c: 0.1, sd: 18, gd: 0.14, si: 18, gi: 0.14, abre: 2, ancho: 0.85, sonr: -0.25 }),
    perdon: E({ mx: 0.9, my: 0.05, c: 0.35, h: 0.3, sd: 16, gd: 0.18, si: 16, gi: 0.18, abre: 6, ancho: 1.1, sonr: 0.75 }),
    // el plumón en la nariz: bizquea, se le arruga la cara… ¡achís!
    pica: E({ mx: 0.5, my: 0.5, iris: 0.8, c: 0.55, z: 0.3, sd: 22, gd: 0.22, si: 22, gi: 0.22, abre: 10, ancho: 0.75, sonr: -0.1 }),
    achis: E({ mx: 0.5, my: 0.3, c: 1, z: 1, sd: -8, gd: -0.16, si: -8, gi: -0.16, abre: 20, ancho: 1.15, sonr: 0.1 }),
    camara: E({ mx: -0.85, my: 0, c: 0.35, h: 0.4, sd: 14, gd: 0.14, si: 14, gi: 0.14, abre: 6, ancho: 1.1, sonr: 0.8 })
  };
  const GUION_CARA_G = [
    [T.mira - 0.1, T.mira + 0.25, "oliva"], [T.gMiraR, T.gMiraR + 0.2, "reto"], [T.guardia, T.guardia + 0.2, "guardia"],
    [T.vuelta, T.vuelta + 0.25, "duelo"], [T.gCierra, T.gCierra + 0.25, "zen"], [T.gCarga, T.gCarga + 0.2, "carga"],
    [T.gAbre, T.gAbre + 0.12, "abre"], [T.gMiraManga, T.gMiraManga + 0.15, "manga", salida], [T.gMiraR2, T.gMiraR2 + 0.2, "pillado"],
    [T.gPerdon, T.gPerdon + 0.2, "perdon"], [T.gPica, T.estornudo - 0.04, "pica"], [T.estornudo - 0.04, T.estornudo, "achis", entrada],
    [T.estornudo + 0.2, T.camara, "perdon"], [T.camara, T.camara + 0.25, "camara"]
  ];
  const CUERPOS_G = {
    inicio: { torso: 0.1, cab: 0.06, dx: 0, dy: 0 }, oliva: { torso: 0.16, cab: 0.18, dx: 2, dy: 0 }, reto: { torso: 0.18, cab: -0.04, dx: 6, dy: 0 },
    guardia: { torso: 0.08, cab: -0.08, dx: -4, dy: -6 }, duelo: { torso: 0.15, cab: 0.2, dx: 2, dy: 2 }, zen: { torso: 0.02, cab: -0.1, dx: -4, dy: -8 },
    carga: { torso: -0.06, cab: -0.14, dx: -8, dy: -10 }, pincha: { torso: 0.32, cab: 0.12, dx: 12, dy: 4 }, abre: { torso: 0.18, cab: 0.18, dx: 4, dy: 2 },
    perdon: { torso: 0.12, cab: -0.04, dx: 2, dy: 0 }, pica: { torso: -0.04, cab: -0.2, dx: -4, dy: -6 }, achis: { torso: 0.3, cab: 0.26, dx: 8, dy: 6 },
    camara: { torso: 0.1, cab: -0.04, dx: 0, dy: 0 }
  };
  const GUION_CUERPO_G = [
    [T.mira - 0.1, T.mira + 0.35, "oliva"], [T.gMiraR, T.gMiraR + 0.3, "reto"], [T.guardia, T.guardia + 0.25, "guardia"], [T.vuelta, T.vuelta + 0.3, "duelo"],
    [T.gCierra, T.gAlzado, "zen"], [T.gCarga, T.pincha - 0.05, "carga"], [T.pincha - 0.06, T.pincha, "pincha", entrada], [T.gSuelta, T.gSuelta + 0.3, "abre"],
    [T.gPerdon, T.gPerdon + 0.3, "perdon"], [T.gPica, T.estornudo - 0.05, "pica"], [T.estornudo - 0.05, T.estornudo, "achis", entrada],
    [T.estornudo + 0.12, T.estornudo + 0.45, "perdon"], [T.camara, T.camara + 0.3, "camara"]
  ];
  const ESPERA_G = P(497, 316);
  function poseGBase(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const respira = Math.sin(t * 2.3) + 1.8 * campana(t, T.gAlza, T.gCarga) * Math.sin((t - T.gAlza) * 3);
    // sacudida al pinchar
    let tiemb = 0; for (const gp of GOLPES) if (gp.q === "g") tiemb += campana(t, gp.t - 0.02, gp.t + 0.12) * 0.03;
    return { x: XG, suelo: SUELO, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x + b.dx / S, y: G.PELVIS.y + b.dy / S + respira * 1.4 },
      torso: b.torso + tiemb, torsoEsc: { x: 1, y: 1 + respira * 0.005 }, piernas: {},
      cabeza: { ang: b.cab + tiemb * 0.5, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
  }
  function poseG(t) {
    const p = poseGBase(t);
    const tob = G.SUELO - G.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: G.PELVIS.x - 52, y: tob }, ang: 0 };
    p.piernas.lejos = { tob: { x: G.PELVIS.x + 54, y: tob - 12 }, ang: 0 };
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    // la lengua se mueve con cada pinchazo
    ex.lengua *= 0.8 + 0.2 * Math.sin(t * 9);
    // tic de cejas del reto
    const cejas = dentro(t, T.gMiraR + 0.15, T.gMiraR + 0.3, T.retoFin - 0.1, T.retoFin + 0.05);
    ex.sd += 8 * Math.sin((t - T.gMiraR) * 14) * cejas;
    // abre un ojo y luego los dos
    if (t > T.gAbre - 0.05 && t < T.gAbre + 0.2) ex.wi = 0.6 * campana(t, T.gAbre - 0.05, T.gAbre + 0.2);
    // tic de la nariz antes del estornudo
    ex.abre += 3 * Math.sin((t - T.gPica) * 30) * dentro(t, T.gPica + 0.05, T.gPica + 0.1, T.estornudo - 0.08, T.estornudo - 0.04);
    p.cara = cara(ex, parpadeo(t, [0.42, 2.6, 5.4, 11.85, 13.6]));
    p.sudor = 0.8 * dentro(t, 6.3, 6.6, T.gCierra, T.gCierra + 0.3) + 0.9 * dentro(t, T.gMiraManga, T.gMiraManga + 0.2, T.camara + 0.3, T.fin);
    p.rojo = 0.45 * dentro(t, T.gMiraR2 + 0.1, T.gMiraR2 + 0.3, T.camara + 0.2, T.fin) + 0.2 * dentro(t, T.gCarga, T.gCarga + 0.15, T.pincha, T.pincha + 0.2);
    manosG(p, t);
    return p;
  }
  function manosG(p, t) {
    const MU = -2.25, PAL_ABAJO = 1.24, PAL_GOLPE = 1.32;
    const reposo = { x: 470, y: 352, mu: -2.0, d: RELAJA, pal: PAL_ABAJO };
    const PL = [
      [0, 0, reposo],
      // dedos que tamborilean del reto
      [T.reto, T.reto + 0.2, { x: 474, y: 350, mu: -2.05, d: RELAJA, pal: PAL_ABAJO }],
      // coge un palillo del vaso
      [T.gCoge - 0.25, T.gCoge, desdePinza(P(PALILLERO.x - 2, PALILLERO.y - PALILLERO.h - 4), -2.0, COGE, -1.45)],
      [T.gCoge + 0.02, T.gSaca, desdePinza(P(PALILLERO.x - 4, PALILLERO.y - PALILLERO.h - 26), -2.1, PALILLO, -1.45)],
      // en guardia: el palillo como una espada, hacia arriba y hacia el centro
      [T.guardia, T.guardia + 0.3, desdePinza(P(486, 300), -2.3, PALILLO, -0.95)],
      [T.cruce - 0.16, T.cruce, desdePinza(P(497, 296), -2.35, PALILLO, -0.5), salida],
      [T.cruceFin, T.vuelta, desdePinza(P(488, 298), -2.3, PALILLO, -0.95)],
      // floritura: le da la vuelta al palillo y se pone a esperar sobre el plato
      [T.vuelta, T.vuelta + 0.28, desdePunta(ESPERA_G, PAL_ABAJO, MU)]
    ];
    pistaDuelo("g", PL, ESPERA_G, PAL_ABAJO, PAL_GOLPE, MU);
    // concentración: lo sube a la altura de los ojos, como un dardo, con los ojos cerrados
    PL.push([T.gAlza, T.gAlzado, desdePunta(P(510, 268), 1.15, -2.6)]);
    PL.push([T.gCarga, T.pincha - 0.07, desdePunta(P(516, 256), 1.05, -2.75)]);
    // ¡zas!: a la manga de Rodri
    PL.push([T.pincha - 0.07, T.pincha, t2 => desdePunta(mangaR(t2), 1.28, -2.2), entrada]);
    PL.push([T.pincha, T.gSuelta, t2 => desdePunta(mangaR(t2), 1.28, -2.2)]);
    // suelta el palillo (se queda clavado) y retira la mano
    PL.push([T.gSuelta, T.gSuelta + 0.3, { x: 492, y: 326, mu: -2.2, d: ABIERTA, pal: 1.28 }]);
    // perdón: la palma hacia Rodri
    PL.push([T.gPerdon, T.gPerdon + 0.3, { x: 474, y: 280, mu: 2.3, d: PERDON }]);
    PL.push([T.gPerdonFin - 0.05, T.gPerdonFin + 0.4, reposo]);
    const l = pista(PL, t);
    // ¿lleva el palillo?
    const conPalillo = t >= T.gCoge && t < T.gSuelta;
    // tembleque de la mano esperando
    if (t > T.vuelta + 0.3 && t < T.gCierra) { l.x += 0.6 * Math.sin(t * 37); l.y += 0.5 * Math.sin(t * 29); }
    p.palilloG = conPalillo ? palilloDe(l) : null;
    p.manoLejosQ = l;
    p.manoLejos = manoRig(G, p, l, 1, conPalillo ? (g => conCamara(g, () => dibPalillo(g, palilloDe(l)))) : null);
    p.manoCerca = bolsilloG(p, 131, 652);
  }

  /* =====================================================================================
   * RODRI (derecha, mira a la izquierda)
   * ===================================================================================== */
  const CARAS_R = {
    inicio: E({ mx: 0.7, my: 0.4, c: 0.2, sonr: 0.35 }),
    oliva: E({ mx: 0.5, my: 0.75, c: 0.3, sonr: 0.3, ancho: 0.95 }),
    reto: E({ mx: 0.9, my: 0.05, c: 0.55, h: 0.15, abre: 4, ancho: 1.05, sonr: 0.75 }),
    guardia: E({ mx: 0.6, my: -0.3, c: 0.5, abre: 8, ancho: 1.05, sonr: 0.7 }),
    duelo: E({ mx: 0.55, my: 0.75, c: 0.5, z: 0.35, abre: 6, ancho: 1.0, sonr: 0.45 }),
    harto: E({ mx: 0.85, my: 0.0, c: 0.5, abre: 0, ancho: 0.8, sonr: -0.1 }),
    coge: E({ mx: 0.55, my: 0.75, c: 0.3, h: 0.2, abre: 0, ancho: 1.0, sonr: 0.55 }),
    alza: E({ mx: 0.7, my: -0.5, c: 0.3, h: 0.3, abre: 0, ancho: 1.0, sonr: 0.6 }),
    come: E({ mx: 0.45, my: -0.9, c: 0.05, abre: 22, ancho: 0.85, sonr: 0.25 }),
    gloria: E({ mx: 0.3, my: -0.2, c: 1, h: 1, abre: 0, ancho: 0.85, sonr: 0.6, mof: 0.35, dientes: 0 }),
    manga: E({ mx: 0.5, my: 0.85, c: 0.15, abre: 0, ancho: 0.75, sonr: 0, mof: 0.35, dientes: 0 }),
    seco: E({ mx: 0.9, my: 0.05, c: 0.5, abre: 0, ancho: 0.75, sonr: -0.15, mof: 0.3, dientes: 0 }),
    traga: E({ mx: 0.9, my: 0.05, c: 0.45, abre: 0, ancho: 0.7, sonr: -0.05, mof: 0, dientes: 0 }),
    infla: E({ mx: 0.9, my: 0.0, c: 0.45, abre: 0, ancho: 0.5, sonr: 0, mof: 0.8, dientes: 0 }),
    sopla: E({ mx: 0.9, my: -0.05, c: 0.4, abre: 8, ancho: 0.38, sonr: 0, mof: 0.45, dientes: 0 }),
    satisfecho: E({ mx: 0.9, my: 0.05, c: 0.5, h: 0.2, abre: 0, ancho: 0.9, sonr: 0.55, dientes: 0 }),
    camara: E({ mx: -0.85, my: 0, c: 0.15, h: 0.3, abre: 0, ancho: 0.95, sonr: 0.65, dientes: 0 })
  };
  const GUION_CARA_R = [
    [T.mira, T.mira + 0.25, "oliva"], [T.rMiraG, T.rMiraG + 0.2, "reto"], [T.guardia, T.guardia + 0.2, "guardia"], [T.vuelta, T.vuelta + 0.25, "duelo"],
    [T.rRinde - 0.05, T.rRinde + 0.15, "harto"], [T.rCogeO - 0.15, T.rCogeO, "coge"], [T.rCogida, T.rAlza, "alza"], [T.rLanza - 0.04, T.rLanza + 0.1, "come"],
    [T.rTraga - 0.02, T.rTraga + 0.06, "gloria", entrada],
    [T.rMiraManga, T.rMiraManga + 0.2, "manga"], [T.rMiraG2, T.rMiraG2 + 0.2, "seco"], [T.trago - 0.05, T.trago + 0.15, "traga"],
    [T.rSopla, T.sopla - 0.02, "infla"], [T.sopla - 0.02, T.sopla + 0.04, "sopla"], [T.soplaFin, T.soplaFin + 0.15, "seco"],
    [T.estornudo + 0.08, T.estornudo + 0.3, "satisfecho"], [T.camara, T.camara + 0.25, "camara"]
  ];
  const CUERPOS_R = {
    inicio: { torso: 0.1, cab: 0.06, dx: 0, dy: 0 }, oliva: { torso: 0.15, cab: 0.18, dx: -2, dy: 0 }, reto: { torso: 0.18, cab: -0.02, dx: -6, dy: 0 },
    guardia: { torso: 0.08, cab: -0.08, dx: 4, dy: -6 }, duelo: { torso: 0.14, cab: 0.2, dx: -2, dy: 2 }, harto: { torso: 0.04, cab: -0.06, dx: 0, dy: -4 },
    coge: { torso: 0.2, cab: 0.14, dx: -6, dy: 2 }, alza: { torso: 0.06, cab: -0.04, dx: 0, dy: -2 }, come: { torso: -0.04, cab: -0.38, dx: 4, dy: -4 },
    gloria: { torso: 0.08, cab: -0.12, dx: -4, dy: -2 },
    manga: { torso: 0.2, cab: 0.22, dx: -6, dy: 2 }, seco: { torso: 0.12, cab: 0.02, dx: -4, dy: 0 }, infla: { torso: 0.08, cab: -0.06, dx: 2, dy: -4 },
    sopla: { torso: 0.2, cab: 0.06, dx: -8, dy: 0 }, satisfecho: { torso: 0.1, cab: -0.04, dx: -2, dy: 0 }, camara: { torso: 0.08, cab: -0.04, dx: 0, dy: 0 }
  };
  const GUION_CUERPO_R = [
    [T.mira, T.mira + 0.35, "oliva"], [T.rMiraG, T.rMiraG + 0.3, "reto"], [T.guardia, T.guardia + 0.25, "guardia"], [T.vuelta, T.vuelta + 0.3, "duelo"],
    [T.rRinde - 0.05, T.rRinde + 0.2, "harto"], [T.rCogeO - 0.25, T.rCogeO, "coge"], [T.rCogida, T.rAlza, "alza"], [T.rLanza - 0.04, T.rTraga - 0.06, "come"],
    [T.rTraga, T.rTraga + 0.3, "gloria"],
    [T.rMiraManga, T.rMiraManga + 0.25, "manga"], [T.rMiraG2, T.rMiraG2 + 0.3, "seco"], [T.rSopla, T.sopla - 0.02, "infla"], [T.sopla - 0.02, T.sopla + 0.1, "sopla", salida],
    [T.soplaFin, T.soplaFin + 0.3, "seco"], [T.estornudo + 0.08, T.estornudo + 0.4, "satisfecho"], [T.camara, T.camara + 0.3, "camara"]
  ];
  const ESPERA_R = P(533, 318);
  function poseRBase(t) {
    const b = guion(GUION_CUERPO_R, CUERPOS_R, "inicio", t);
    const respira = Math.sin(t * 2.0 + 0.7);
    let tiemb = 0; for (const gp of GOLPES) if (gp.q === "r") tiemb += campana(t, gp.t - 0.02, gp.t + 0.12) * 0.03;
    // ¡ay! al pincharle la manga
    const ay = campana(t, T.pincha, T.pincha + 0.25) * 0.05;
    return { x: XR, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: R.PELVIS.x - b.dx / S, y: R.PELVIS.y + b.dy / S + respira * 1.2 },
      torso: b.torso + tiemb - ay, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab + tiemb * 0.5 - ay, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
  }
  function poseR(t) {
    const p = poseRBase(t);
    const tob = R.SUELO - R.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: R.PELVIS.x - 52, y: tob }, ang: 0 };
    p.piernas.lejos = { tob: { x: R.PELVIS.x + 54, y: tob - 12 }, ang: 0 };
    const ex = guion(GUION_CARA_R, CARAS_R, "inicio", t);
    // masticar: la boca y el moflete van y vienen
    const mas = dentro(t, T.mastica, T.mastica + 0.1, T.rMiraManga + 0.3, T.rMiraManga + 0.4) + 0.6 * dentro(t, T.rMiraG2 - 0.2, T.rMiraG2, T.trago - 0.1, T.trago);
    // ¡zas!: los ojos como platos un instante
    ex.c *= 1 - 0.8 * campana(t, T.pincha, T.pincha + 0.3);
    const w = (t - T.mastica) * 13;
    ex.mof += 0.18 * Math.sin(w) * mas; ex.abre += 3 * Math.max(0, Math.sin(w + 0.5)) * mas;
    p.cara = cara(ex, parpadeo(t, [0.9, 2.5, 5.3, 11.7, 13.7]));
    const gu = campana(t, T.guino, T.guino + 0.36);
    p.cara.ojos.d = clamp(p.cara.ojos.d + gu);
    p.sudor = 0.75 * dentro(t, 6.4, 6.7, T.rRinde, T.rRinde + 0.3);
    manosR(p, t);
    return p;
  }
  // la manga del plumífero de Rodri (punto donde se clava el palillo), en pantalla
  const MANGA_D = 19;
  let mangaCache = null;
  function mangaR(t) {
    const l = manoRQ(t);
    return { x: l.x + Math.cos(l.mu) * MANGA_D, y: l.y + Math.sin(l.mu) * MANGA_D };
  }
  const bocaR = t => { const p = poseRBase(t); return R.aPantalla(p, R.boca(p)); };
  // mano lejana de Rodri (pantalla)
  const APOYO_R = { x: 539, y: 346, mu: -1.15, d: RELAJA };
  const MIRA_MANGA = { x: 525, y: 284, mu: 0.26, d: RELAJA };
  function manoRQ(t) {
    if (mangaCache && mangaCache.t === t) return Object.assign({}, mangaCache.l);
    const MU = -0.9, PAL_ABAJO = Math.PI - 1.24, PAL_GOLPE = Math.PI - 1.32;
    const reposo = { x: 556, y: 353, mu: -1.1, d: RELAJA, pal: PAL_ABAJO };
    const PL = [
      [0, 0, reposo],
      [T.rCoge - 0.25, T.rCoge, desdePinza(P(PALILLERO.x + 3, PALILLERO.y - PALILLERO.h - 4), -1.05, COGE, -1.7)],
      [T.rCoge + 0.02, T.rSaca, desdePinza(P(PALILLERO.x + 6, PALILLERO.y - PALILLERO.h - 26), -0.95, PALILLO, -1.7)],
      [T.guardia + 0.1, T.guardia + 0.35, desdePinza(P(540, 300), -0.85, PALILLO, Math.PI + 0.95)],
      [T.cruce - 0.16, T.cruce, desdePinza(P(528, 296), -0.8, PALILLO, Math.PI + 0.5), salida],
      [T.cruceFin, T.vuelta, desdePinza(P(537, 298), -0.85, PALILLO, Math.PI + 0.95)],
      [T.vuelta + 0.05, T.vuelta + 0.33, desdePunta(ESPERA_R, PAL_ABAJO, MU)]
    ];
    pistaDuelo("r", PL, ESPERA_R, PAL_ABAJO, PAL_GOLPE, MU);
    // se rinde: tira el palillo por encima del hombro (golpe de muñeca)
    PL.push([T.rRinde, T.rTira - 0.08, desdePinza(P(534, 292), 0.6, PALILLO, -1.35)]);
    PL.push([T.rTira - 0.08, T.rTira, desdePinza(P(542, 280), 0.9, TIRA, -1.0), salida]);
    // coge la aceituna con los dedos
    PL.push([T.rCogeO - 0.22, T.rCogeO, desdePinza(P(REPOSO.x + 1, REPOSO.y - OR - 1), -0.95, COGE)]);
    PL.push([T.rCogeO + 0.02, T.rCogida, desdePinza(P(REPOSO.x + 1, REPOSO.y - OR - 1), -0.95, PINZA)]);
    // la sube… y la lanza al aire
    PL.push([T.rCogida + 0.02, T.rAlza, desdePinza(P(538, 292), 0.95, PINZA)]);
    PL.push([T.rAlza, T.rLanza, desdePinza(P(545, 272), 1.15, ABIERTA), salida]);
    // apoya el antebrazo en el tablero, junto al plato
    PL.push([T.rApoya, T.rApoyado, APOYO_R]);
    // ¡ay! (respingo de la mano al pincharle)
    PL.push([T.pincha, T.pincha + 0.06, Object.assign({}, APOYO_R, { y: APOYO_R.y - 3, d: D(0.7, 0.85, 0.8, 0.75, 0.7) }), salida]);
    PL.push([T.pincha + 0.1, T.pincha + 0.3, APOYO_R]);
    // levanta el antebrazo para mirarse la manga
    PL.push([T.rLevanta, T.rLevantado, MIRA_MANGA]);
    PL.push([T.rBaja, T.rBajado, APOYO_R]);
    const l = pista(PL, t);
    if (t > T.vuelta + 0.35 && t < T.rRinde) { l.x += 0.6 * Math.sin(t * 33 + 1); l.y += 0.5 * Math.sin(t * 27); }
    mangaCache = { t, l };
    return Object.assign({}, l);
  }
  function manosR(p, t) {
    const l = manoRQ(t);
    const conPalillo = t >= T.rCoge && t < T.rTira;
    const conOliva = t >= T.rCogeO && t < T.rLanza;
    p.palilloR = conPalillo ? palilloDe(l) : null;
    let obj = null;
    if (conPalillo) obj = g => conCamara(g, () => dibPalillo(g, palilloDe(l)));
    if (conOliva) obj = g => conCamara(g, () => { const q = pinza(l); oliva(g, q.x, q.y + OR - 1, 0, 0.3); });
    p.manoLejosQ = l;
    p.manoLejos = manoRig(R, p, l, -1, obj);
    p.manoCerca = R.manoReposo(p, "cerca");
  }

  /* =====================================================================================
   * DIBUJOS DE ATREZO
   * ===================================================================================== */
  let BASE_M = null;
  function conCamara(g, f) { g.save(); g.setTransform(BASE_M); f(); g.restore(); }
  // palillo de madera (de a a b)
  function dibPalillo(g, s) {
    g.save(); g.lineCap = "round";
    g.strokeStyle = TINTA; g.lineWidth = 3.2; g.beginPath(); g.moveTo(s.a.x, s.a.y); g.lineTo(s.b.x, s.b.y); g.stroke();
    g.strokeStyle = "#e9c98f"; g.lineWidth = 1.7; g.stroke();
    g.strokeStyle = "rgba(255,248,225,0.8)"; g.lineWidth = 0.7; g.beginPath(); g.moveTo(lerp(s.a.x, s.b.x, 0.1) - 0.4, lerp(s.a.y, s.b.y, 0.1) - 0.4); g.lineTo(lerp(s.a.x, s.b.x, 0.8) - 0.4, lerp(s.a.y, s.b.y, 0.8) - 0.4); g.stroke();
    g.restore();
  }
  // aceituna verde rellena de pimiento: (x, y) = punto de apoyo; h = altura sobre el tablero; rot = giro
  function oliva(g, x, y, h, rot) {
    const cx = x, cy = y - OR - h;
    g.save(); g.translate(cx, cy); g.rotate(rot);
    g.beginPath(); g.ellipse(0, 0, OR * 1.12, OR * 0.92, 0, 0, Math.PI * 2);
    const gr = g.createRadialGradient(-2, -2.5, 0.5, 0, 0, OR * 1.2); gr.addColorStop(0, "#c8e070"); gr.addColorStop(0.55, "#86a832"); gr.addColorStop(1, "#4f6e17");
    g.fillStyle = gr; g.fill();
    g.lineWidth = 1.4; g.strokeStyle = TINTA; g.stroke();
    // relleno de pimiento en una punta
    g.fillStyle = "#d8262e"; g.beginPath(); g.ellipse(OR * 0.82, 0, 2.2, 2.6, 0, 0, Math.PI * 2); g.fill();
    g.lineWidth = 0.9; g.strokeStyle = "#5a0d10"; g.stroke();
    g.restore();
    // brillo (no gira)
    g.fillStyle = "rgba(255,255,240,0.85)"; g.beginPath(); g.ellipse(cx - 2.4, cy - 2.6, 1.8, 1.1, -0.5, 0, Math.PI * 2); g.fill();
  }
  function sombraOliva(g, x, y, h) {
    const k = 1 / (1 + h / 14);
    g.fillStyle = `rgba(40,22,8,${0.35 * k})`; g.beginPath(); g.ellipse(x + 1, y, OR * 1.1 * (0.6 + 0.4 * k), 2.2 * (0.6 + 0.4 * k), 0, 0, Math.PI * 2); g.fill();
  }
  // platito de loza con filete azul y su chorrito de aceite
  function plato(g, t) {
    const { x, y, rx, ry } = PLATO;
    g.save();
    g.fillStyle = "rgba(40,22,8,0.3)"; g.beginPath(); g.ellipse(x + 2, y + 3, rx + 1, ry + 1.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#e9e4d8"; g.beginPath(); g.ellipse(x, y + 1.5, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fbf8f1"; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#2c5fa8"; g.lineWidth = 1.6; g.beginPath(); g.ellipse(x, y, rx - 3, ry - 1.2, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#efe9dc"; g.beginPath(); g.ellipse(x, y + 0.5, rx * 0.62, ry * 0.55, 0, 0, Math.PI * 2); g.fill();
    // aceite (se va gastando con cada salida)
    const gasta = 1 - 0.35 * clamp((t - 3.75) / 4.3);
    g.fillStyle = `rgba(214,190,40,${0.55 * gasta})`; g.beginPath(); g.ellipse(x + 1, y + 0.5, 11 * gasta + 3, 3.4 * gasta + 1, 0.05, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,250,200,0.6)"; g.beginPath(); g.ellipse(x - 3, y - 0.5, 3, 0.9, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.4; g.beginPath(); g.ellipse(x, y + 1.5, rx, ry, 0, 0, Math.PI); g.stroke();
    g.beginPath(); g.ellipse(x, y, rx, ry, 0, Math.PI, Math.PI * 2); g.stroke();
    g.restore();
  }
  // vasito de palillos (los palillos tiemblan cuando le da la aceituna)
  function palillero(g, t, quedan) {
    const { x, y, r, h } = PALILLERO;
    const u = t - 6.6, rat = u > 0 && u < 0.6 ? Math.exp(-u * 7) * Math.sin(u * 50) : 0;
    g.save();
    g.fillStyle = "rgba(40,22,8,0.3)"; g.beginPath(); g.ellipse(x + 2, y + 1, r + 1, 2.4, 0, 0, Math.PI * 2); g.fill();
    // palillos (detrás del cristal de delante)
    g.lineCap = "round";
    for (let i = 0; i < quedan; i++) {
      const a = -Math.PI / 2 + (i - (quedan - 1) / 2) * 0.13 + 0.15 * rat * (i % 2 ? 1 : -1), bx = x + (i - (quedan - 1) / 2) * 1.6, by = y - 2;
      const L = h + 9 + 2 * hash(i + 3);
      g.strokeStyle = TINTA; g.lineWidth = 2.6; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + Math.cos(a) * L, by + Math.sin(a) * L); g.stroke();
      g.strokeStyle = "#e9c98f"; g.lineWidth = 1.3; g.stroke();
    }
    // cristal
    g.fillStyle = "rgba(200,225,235,0.35)"; g.beginPath(); g.moveTo(x - r, y - h); g.lineTo(x - r + 1, y); g.lineTo(x + r - 1, y); g.lineTo(x + r, y - h); g.closePath(); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 1.1; g.beginPath(); g.moveTo(x - r + 2, y - h + 2); g.lineTo(x - r + 2.6, y - 2); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - r, y - h); g.lineTo(x - r + 1, y); g.ellipse(x, y, r - 1, 1.6, 0, Math.PI, 0, true); g.lineTo(x + r, y - h); g.stroke();
    g.beginPath(); g.ellipse(x, y - h, r, 1.8, 0, 0, Math.PI * 2); g.stroke();
    g.restore();
  }
  // vaso de vermú con hielo y su rodaja de naranja (tambaleo al chocar)
  function vaso(g, v, t, tChoque) {
    const u = t - tChoque, tamb = u > 0 && u < 0.9 ? 0.12 * Math.exp(-u * 6) * Math.sin(u * 26) : 0;
    const { x, y, r, h } = v;
    g.save();
    g.fillStyle = "rgba(40,22,8,0.3)"; g.beginPath(); g.ellipse(x + 2, y + 1, r + 2, 2.8, 0, 0, Math.PI * 2); g.fill();
    g.translate(x, y); g.rotate(tamb);
    const forma = () => { g.beginPath(); g.moveTo(-r, -h); g.lineTo(-r + 1.5, 0); g.ellipse(0, 0, r - 1.5, 2, 0, Math.PI, 0, true); g.lineTo(r, -h); g.closePath(); };
    // vermú (con su vaivén)
    const ola = 1.2 * Math.sin(u * 30) * (u > 0 && u < 1 ? Math.exp(-u * 4) : 0);
    g.save(); forma(); g.clip();
    g.fillStyle = "#7a1418"; g.beginPath(); g.moveTo(-r - 2, -h * 0.55 + ola); g.lineTo(r + 2, -h * 0.55 - ola); g.lineTo(r + 2, 2); g.lineTo(-r - 2, 2); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,120,90,0.35)"; g.fillRect(-r + 2, -h * 0.5, 2.2, h * 0.45);
    // hielo
    g.fillStyle = "rgba(235,250,255,0.75)"; g.fillRect(-3.5, -h * 0.72, 6, 5.5); g.strokeStyle = "rgba(120,150,170,0.8)"; g.lineWidth = 0.7; g.strokeRect(-3.5, -h * 0.72, 6, 5.5);
    g.restore();
    // cristal
    g.fillStyle = "rgba(210,235,245,0.22)"; forma(); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.75)"; g.lineWidth = 1.1; g.beginPath(); g.moveTo(-r + 2.2, -h + 2); g.lineTo(-r + 3, -3); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 1.3; forma(); g.stroke();
    g.beginPath(); g.ellipse(0, -h, r, 2.2, 0, 0, Math.PI * 2); g.stroke();
    // rodaja de naranja en el borde
    g.fillStyle = "#f29a1e"; g.beginPath(); g.arc(r - 1, -h + 1, 5.2, Math.PI * 0.95, Math.PI * 2.05); g.closePath(); g.fill();
    g.fillStyle = "#ffd36a"; g.beginPath(); g.arc(r - 1, -h + 1, 3.8, Math.PI * 0.98, Math.PI * 2.02); g.closePath(); g.fill();
    g.strokeStyle = "rgba(242,154,30,0.9)"; g.lineWidth = 0.6; for (let k = 1; k < 5; k++) { const a = Math.PI + k * Math.PI / 5; g.beginPath(); g.moveTo(r - 1, -h + 1); g.lineTo(r - 1 + Math.cos(a) * 3.6, -h + 1 + Math.sin(a) * 3.6); g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = 1; g.beginPath(); g.arc(r - 1, -h + 1, 5.2, Math.PI * 0.95, Math.PI * 2.05); g.closePath(); g.stroke();
    g.restore();
  }
  // rebanada de pan en su servilleta (bota con la aceituna)
  function pan(g, t) {
    const { x, y } = PAN;
    g.save();
    // servilleta de papel
    g.fillStyle = "rgba(40,22,8,0.25)"; g.beginPath(); g.moveTo(x - 19, y + 1); g.lineTo(x + 5, y - 7); g.lineTo(x + 21, y + 1); g.lineTo(x - 3, y + 9); g.closePath(); g.fill();
    g.fillStyle = "#fbfaf4"; g.beginPath(); g.moveTo(x - 20, y); g.lineTo(x + 4, y - 8); g.lineTo(x + 20, y); g.lineTo(x - 4, y + 8); g.closePath(); g.fill();
    g.strokeStyle = "rgba(60,50,40,0.6)"; g.lineWidth = 0.8; g.stroke();
    // rebanada
    const bote = campana(t, 4.3, 4.42) * 1.5;
    g.translate(x, y - 3 - bote);
    g.fillStyle = "#b0712b"; g.beginPath(); g.ellipse(0, 1.6, 13, 5.2, -0.08, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#f3d9a2"; g.beginPath(); g.ellipse(0, 0, 11.5, 4.2, -0.08, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(170,120,60,0.5)"; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(-8 + 16 * hash(i), -2.5 + 5 * hash(i + 7), 0.6 + 0.5 * hash(i + 2), 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = TINTA; g.lineWidth = 1.1; g.beginPath(); g.ellipse(0, 1.6, 13, 5.2, -0.08, 0, Math.PI * 2); g.stroke();
    g.restore();
  }
  // servilletero de metal (sin letras)
  function servilletero(g, t) {
    const { x, y } = SERV;
    const u = t - 5.5, tamb = u > 0 && u < 0.6 ? 0.06 * Math.exp(-u * 8) * Math.sin(u * 40) : 0;
    g.save();
    g.fillStyle = "rgba(40,22,8,0.3)"; g.beginPath(); g.ellipse(x + 2, y + 1, 13, 3, 0, 0, Math.PI * 2); g.fill();
    g.translate(x, y); g.rotate(tamb);
    // servilletas
    g.fillStyle = "#fffdf6"; g.fillRect(-9, -16, 18, 10); g.strokeStyle = "rgba(60,50,40,0.6)"; g.lineWidth = 0.8; g.strokeRect(-9, -16, 18, 10);
    // chapa
    const gr = g.createLinearGradient(-11, 0, 11, 0); gr.addColorStop(0, "#8d949c"); gr.addColorStop(0.35, "#e3e8ee"); gr.addColorStop(1, "#6d747c");
    g.fillStyle = gr; g.beginPath(); g.moveTo(-11, 0); g.lineTo(-10, -12); g.quadraticCurveTo(0, -15, 10, -12); g.lineTo(11, 0); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 1; g.beginPath(); g.moveTo(-6, -2); g.lineTo(-5.5, -11); g.stroke();
    g.restore();
  }
  // gotas de aceite que deja la aceituna en el tablero (se quedan) y su reguero (se va)
  const MANCHAS = CHOQUES.filter(c => c.tipo !== "plato" && c.tipo !== "palillos").map((c, i) => ({ t: c.t, x: c.x + 3 * (hash(i) - 0.5), y: c.y + 1, r: 2 + 1.4 * hash(i + 5) }));
  function aceite(g, t) {
    g.save();
    for (const m of MANCHAS) {
      if (t < m.t) continue;
      g.fillStyle = "rgba(190,165,40,0.4)"; g.beginPath(); g.ellipse(m.x, m.y, m.r * 1.6, m.r * 0.5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "rgba(255,250,200,0.45)"; g.beginPath(); g.ellipse(m.x - 1, m.y - 0.3, m.r * 0.5, m.r * 0.18, 0, 0, Math.PI * 2); g.fill();
    }
    // reguero de lo que acaba de rodar
    g.lineCap = "round";
    let prev = null;
    for (let k = 14; k >= 0; k--) {
      const tt = t - k * 0.025; if (tt < 3.7 || tt > T.quieta + 0.1) { prev = null; continue; }
      const o = olivaMesa(tt);
      if (o.h > 1.5 || !o.mueve || !enTablero(o.x, o.y, 4)) { prev = null; continue; }
      const q = { x: o.x, y: o.y - 0.5 };
      if (prev) { g.strokeStyle = `rgba(200,175,45,${0.5 * (1 - k / 15)})`; g.lineWidth = 2.6 * (1 - k / 18); g.beginPath(); g.moveTo(prev.x, prev.y); g.lineTo(q.x, q.y); g.stroke(); }
      prev = q;
    }
    g.restore();
  }

  /* ---------- efectos ---------- */
  function tin(g, x, y, k, sg = 1, r0 = 8) {
    if (k <= 0.01 || k >= 1) return;
    g.save(); g.strokeStyle = `rgba(255,250,225,${0.95 * Math.sin(Math.PI * k)})`; g.lineWidth = 1.6; g.lineCap = "round";
    for (let i = -1; i <= 1; i++) { const a = -Math.PI / 2 + sg * 0.5 + i * 0.5, ra = r0 + 7 * k, rb = ra + 5; g.beginPath(); g.moveTo(x + Math.cos(a) * ra, y + Math.sin(a) * ra); g.lineTo(x + Math.cos(a) * rb, y + Math.sin(a) * rb); g.stroke(); }
    g.restore();
  }
  function destello(g, x, y, k, r = 9) {
    if (k <= 0.01 || k >= 1) return;
    const rr = r * Math.sin(Math.PI * k);
    g.save(); g.translate(x, y); g.rotate(k * 1.4); g.fillStyle = "#fffbe0"; g.beginPath();
    for (let i = 0; i < 8; i++) { const q = i % 2 ? rr * 0.25 : rr, an = i * Math.PI / 4; g.lineTo(Math.cos(an) * q, Math.sin(an) * q); }
    g.closePath(); g.fill(); g.strokeStyle = "rgba(230,170,40,0.8)"; g.lineWidth = 0.8; g.stroke(); g.restore();
  }
  // rayitas de golpe donde pincha
  function golpe(g, x, y, k) {
    if (k <= 0.01 || k >= 1) return;
    g.save(); g.strokeStyle = `rgba(30,22,16,${0.8 * Math.sin(Math.PI * k)})`; g.lineWidth = 1.6; g.lineCap = "round";
    for (const a of [-2.6, -2.0, -1.15, -0.55]) { const r0 = 8 + 6 * k; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0 * 0.6); g.lineTo(x + Math.cos(a) * (r0 + 6), y + Math.sin(a) * (r0 + 6) * 0.6); g.stroke(); }
    g.restore();
  }
  // migas del pan
  function migas(g, t) {
    const t0 = 4.32, u = t - t0; if (u < 0 || u > 0.7) return;
    g.save();
    for (let i = 0; i < 6; i++) {
      const vx = (hash(i) - 0.5) * 60, vy = -40 - 50 * hash(i + 3), k = u;
      const x = PAN.x + vx * k, y = PAN.y - 5 + vy * k + 260 * k * k;
      if (y > PAN.y + 4 && k > 0.2) continue;
      g.fillStyle = i % 2 ? "#b0712b" : "#f3d9a2"; g.globalAlpha = 1 - u / 0.7;
      g.fillRect(x - 1, y - 1, 2.2, 2);
    }
    g.restore();
  }
  // estela de la aceituna (rayitas) cuando va rápida o en el aire
  function estela(g, t, o) {
    if (!o.mueve) return;
    const prev = olivaMesa(t - 0.035); const dx = o.x - prev.x, dy = (o.y - o.h) - (prev.y - prev.h), v = Math.hypot(dx, dy);
    if (v < 1.2) return;
    const nx = dx / v, ny = dy / v, cx = o.x, cy = o.y - OR - o.h;
    g.save(); g.strokeStyle = "rgba(255,250,230,0.75)"; g.lineWidth = 1.3; g.lineCap = "round";
    for (const s of [-1, 0, 1]) { const ox = -ny * s * 3.5, oy = nx * s * 3.5, L = Math.min(16, v * 2.2) * (s ? 0.7 : 1); g.beginPath(); g.moveTo(cx - nx * (OR + 2) + ox, cy - ny * (OR + 2) + oy); g.lineTo(cx - nx * (OR + 2 + L) + ox, cy - ny * (OR + 2 + L) + oy); g.stroke(); }
    g.restore();
  }
  // plumón del plumífero: plumitas que salen de la manga y bajan meciéndose
  function plumita(g, x, y, a, k) {
    g.save(); g.translate(x, y); g.rotate(a); g.globalAlpha = k;
    g.fillStyle = "#fbfbf8"; g.beginPath(); g.moveTo(-5, 0); g.quadraticCurveTo(-1, -3.2, 5, -0.6); g.quadraticCurveTo(-1, 3.2, -5, 0); g.fill();
    g.strokeStyle = "rgba(150,150,160,0.9)"; g.lineWidth = 0.7; g.beginPath(); g.moveTo(-5.5, 0.3); g.lineTo(4.5, -0.4); g.stroke();
    g.strokeStyle = "rgba(170,170,180,0.6)"; g.lineWidth = 0.5;
    for (let i = -3; i <= 3; i += 2) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 1.2, -2.2); g.moveTo(i, 0); g.lineTo(i + 1.2, 2.2); g.stroke(); }
    g.restore();
  }
  // 4 caen al tablero; 5 suben y se quedan flotando entre los dos (hasta que Rodri sopla)
  const PLUMAS = Array.from({ length: 9 }, (_, i) => ({ vx: (hash(i * 3 + 1) - 0.45) * 90, vy: -50 - 60 * hash(i * 3 + 2), fase: hash(i + 11) * 6, cae: 14 + 10 * hash(i + 4),
    flota: i >= 4, hx: -26 + 13 * (i - 4) + 6 * hash(i + 30), hy: -58 - 22 * hash(i + 31), nx: 5 * (hash(i + 40) - 0.5) * 2, ny: 5 * (hash(i + 41) - 0.5) * 2,
    sx: 0.6 + 0.6 * hash(i + 42), sy: (hash(i + 43) - 0.6) * 1.4 }));
  const narizG = t => { const p = poseGBase(t), b = G.aPantalla(p, G.boca(p)); return { x: b.x + 4, y: b.y - 10 }; };
  function plumaEn(i, t, origen) {
    const pl = PLUMAS[i], u = t - T.pincha;
    const fr = 1 - Math.exp(-u * 5);
    if (!pl.flota) {
      // salen disparadas, frenan en el aire y bajan meciéndose hasta posarse en el tablero
      const x = origen.x + pl.vx * fr / 5 + 7 * Math.sin(u * 2.6 + pl.fase) * clamp(u * 2);
      let y = origen.y + pl.vy * fr / 5 + pl.cae * Math.max(0, u - 0.3);
      const fondoY = BAR.y + 10 + 8 * hash(i + 20);
      if (y > fondoY) y = fondoY;
      return { x, y, a: 0.6 * Math.sin(u * 3 + pl.fase) + (y >= fondoY ? 0.2 : 0), k: 1 };
    }
    // suben y flotan, meciéndose despacio
    const fl = tt => { const v = tt - T.pincha, f = 1 - Math.exp(-v * 4);
      return { x: origen.x + pl.hx * f + 6 * Math.sin(v * 1.7 + pl.fase) * clamp(v), y: origen.y + pl.hy * f + 3 * Math.max(0, v - 0.6) + 3 * Math.sin(v * 2.3 + pl.fase) }; };
    const t0 = T.sopla + 0.03 * (i - 4), t1 = t0 + 0.24;
    if (t < t0) { const q = fl(t); return { x: q.x, y: q.y, a: 0.5 * Math.sin(u * 2.2 + pl.fase), k: 1 }; }
    // soplido: a la nariz de Guillermo
    const q0 = fl(t0), n = narizG(t);
    if (t < T.estornudo) {
      const k = entrada(fase(t, t0, t1)), x = lerp(q0.x, n.x + pl.nx, k), y = lerp(q0.y, n.y + pl.ny, k) - 10 * Math.sin(Math.PI * k);
      return { x, y, a: 0.5 * Math.sin(u * 2.2 + pl.fase) + 2 * k + 0.25 * Math.sin(t * 40 + i) * k, k: 1 };
    }
    // ¡achís!: salen volando y se pierden
    const ne = narizG(T.estornudo), v = t - T.estornudo, fv = (1 - Math.exp(-v * 3.5)) / 3.5;
    return { x: ne.x + pl.nx + 260 * pl.sx * fv, y: ne.y + pl.ny + 260 * pl.sy * fv + 10 * v * v, a: 2 + v * 6 * (i % 2 ? 1 : -1), k: 1 - clamp(v / 0.75) };
  }
  function plumas(g, t, origen) {
    const u = t - T.pincha; if (u < 0) return;
    for (let i = 0; i < PLUMAS.length; i++) {
      const q = plumaEn(i, t, origen);
      plumita(g, q.x, q.y, q.a, clamp(u * 8) * q.k * (1 - tramo(t, T.fin - 0.4, T.fin)));
    }
  }
  // soplido de Rodri: rayitas de aire hacia Guillermo
  function soplido(g, t, pR) {
    const k = dentro(t, T.sopla - 0.02, T.sopla + 0.05, T.soplaFin - 0.05, T.soplaFin + 0.02); if (k <= 0) return;
    const b = R.aPantalla(pR, R.boca(pR)), n = narizG(t);
    g.save(); g.lineCap = "round"; g.strokeStyle = `rgba(255,252,240,${0.8 * k})`; g.lineWidth = 1.5;
    for (let j = 0; j < 3; j++) {
      const ph = ((t - T.sopla) * 3.2 + j / 3) % 1, off = (j - 1) * 6;
      const x0 = lerp(b.x - 6, n.x + 10, ph), y0 = lerp(b.y + 2, n.y + 2, ph) + off * (0.4 + ph);
      g.beginPath(); g.moveTo(x0, y0);
      g.quadraticCurveTo(x0 - 8, y0 - 3 * Math.sin(ph * 9 + j), x0 - 16, y0); g.stroke();
    }
    g.restore();
  }
  // estornudo de Guillermo: salpicón de aire hacia delante
  function achis(g, t, pG) {
    const k = fase(t, T.estornudo, T.estornudo + 0.32); if (k <= 0 || k >= 1) return;
    const b = G.aPantalla(pG, G.boca(pG));
    g.save(); g.lineCap = "round"; g.strokeStyle = `rgba(255,252,240,${0.9 * Math.sin(Math.PI * k)})`; g.lineWidth = 1.8;
    for (const a of [-0.55, -0.2, 0.15, 0.5]) { const r0 = 10 + 22 * k; g.beginPath(); g.moveTo(b.x + Math.cos(a) * r0, b.y + Math.sin(a) * r0); g.lineTo(b.x + Math.cos(a) * (r0 + 9), b.y + Math.sin(a) * (r0 + 9)); g.stroke(); }
    g.fillStyle = `rgba(255,255,255,${0.35 * (1 - k)})`;
    for (let j = 0; j < 4; j++) { g.beginPath(); g.arc(b.x + 14 + 26 * k + 6 * j, b.y - 4 + 5 * Math.sin(j * 2.1), 4 + 3 * k, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // la aceituna por el aire, a la boca de Rodri
  function olivaVuelo(t) {
    if (t < T.rLanza || t >= T.rTraga) return null;
    const q = pinza(manoRQ(T.rLanza)), b = bocaR(t), u = fase(t, T.rLanza, T.rTraga);
    // parábola alta que cae a la boca abierta; se mete (encoge) al final
    return { x: lerp(q.x, b.x - 1, u), y: lerp(q.y - 1, b.y, u) - 4 * 120 * u * (1 - u), rot: u * 9, k: 1 - tramo(u, 0.94, 1) };
  }

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  const PARED = 470;
  let fondo = null, barrilAtras = null, barrilDelante = null, BARRIL_O = null;
  function azulejo(g, x, y, s) {
    g.fillStyle = "#f6f1e3"; g.fillRect(x, y, s, s);
    const c = s / 2;
    g.fillStyle = "#2d5fa6";
    g.beginPath(); g.moveTo(x + c, y + 3); g.lineTo(x + s - 3, y + c); g.lineTo(x + c, y + s - 3); g.lineTo(x + 3, y + c); g.closePath(); g.fill();
    g.fillStyle = "#f2c230"; g.beginPath(); g.arc(x + c, y + c, s * 0.17, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#2d5fa6";
    for (const [dx, dy] of [[0, 0], [s, 0], [0, s], [s, s]]) { g.beginPath(); g.arc(x + dx, y + dy, s * 0.2, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#f6f1e3"; g.beginPath(); g.arc(x + c, y + c, s * 0.07, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(90,80,70,0.35)"; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
  }
  function jamon(g, x, y, k) {
    g.save(); g.translate(x, y); g.scale(k, k);
    g.strokeStyle = "#e9e2cf"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -40); g.lineTo(0, -6); g.stroke();
    // pezuña y caña
    g.fillStyle = "#2a1a12"; g.beginPath(); g.ellipse(0, -2, 5, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#c98b52"; g.beginPath(); g.moveTo(-4, 2); g.lineTo(4, 2); g.lineTo(7, 30); g.lineTo(-6, 30); g.closePath(); g.fill();
    // maza
    const gr = g.createLinearGradient(-26, 0, 26, 0); gr.addColorStop(0, "#7a3a1c"); gr.addColorStop(0.45, "#b8643a"); gr.addColorStop(1, "#6a2e14");
    const forma = () => { g.beginPath(); g.moveTo(-6, 28); g.bezierCurveTo(-28, 48, -30, 98, -6, 118); g.bezierCurveTo(10, 126, 28, 108, 24, 74); g.bezierCurveTo(20, 50, 10, 36, 7, 28); g.closePath(); };
    g.fillStyle = gr; forma(); g.fill();
    g.fillStyle = "rgba(255,220,180,0.25)"; g.beginPath(); g.ellipse(-10, 76, 6, 26, 0.1, 0, Math.PI * 2); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2; forma(); g.stroke();
    // conito de papel para la grasa
    g.fillStyle = "#f4f1e6"; g.beginPath(); g.moveTo(-9, 120); g.lineTo(9, 120); g.lineTo(0, 140); g.closePath(); g.fill(); g.lineWidth = 1.2; g.stroke();
    g.restore();
  }
  function botella(g, x, y, h, col) {
    g.fillStyle = col; g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x - 6, y - h * 0.62); g.quadraticCurveTo(x - 6, y - h * 0.72, x - 2.5, y - h * 0.78); g.lineTo(x - 2.5, y - h); g.lineTo(x + 2.5, y - h); g.lineTo(x + 2.5, y - h * 0.78); g.quadraticCurveTo(x + 6, y - h * 0.72, x + 6, y - h * 0.62); g.lineTo(x + 6, y); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x - 3.5, y - 3); g.lineTo(x - 3.5, y - h * 0.6); g.stroke();
    g.fillStyle = "#7a1c1c"; g.fillRect(x - 3, y - h - 2, 6, 4);
  }
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 160; c.height = H + 140; const g = c.getContext("2d");
    g.translate(80, 70); g.lineJoin = "round";
    // pared de cal ocre
    const gp = g.createLinearGradient(0, -70, 0, PARED); gp.addColorStop(0, "#b8743f"); gp.addColorStop(0.5, "#d69a5c"); gp.addColorStop(1, "#c98a4f");
    g.fillStyle = gp; g.fillRect(-80, -70, W + 160, PARED + 70);
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${hash(i) > 0.5 ? "255,240,210" : "120,60,20"},${0.04 + 0.05 * hash(i + 1)})`; g.beginPath(); g.ellipse(-80 + hash(i + 2) * (W + 160), -60 + hash(i + 3) * (PARED + 40), 6 + 14 * hash(i + 4), 3 + 6 * hash(i + 5), 0, 0, Math.PI * 2); g.fill(); }
    // viga
    g.fillStyle = "#4a2c18"; g.fillRect(-80, -70, W + 160, 46);
    g.fillStyle = "#6b4226"; g.fillRect(-80, -30, W + 160, 6);
    g.strokeStyle = "rgba(20,8,2,0.5)"; g.lineWidth = 1.5; for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(-80 + i * 110 + 20 * hash(i), -60); g.quadraticCurveTo(-40 + i * 110, -48, -20 + i * 110, -56); g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(-80, -24); g.lineTo(W + 80, -24); g.stroke();
    // zócalo de azulejos (con cenefa)
    const Z0 = 318, ZS = 26;
    for (let y = Z0; y < PARED; y += ZS) for (let x = -80; x < W + 80; x += ZS) azulejo(g, x, y, ZS);
    g.fillStyle = "#2d5fa6"; g.fillRect(-80, Z0 - 10, W + 160, 10);
    g.fillStyle = "#f2c230"; for (let x = -80; x < W + 80; x += 13) { g.beginPath(); g.arc(x + 6.5, Z0 - 5, 2.6, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#e2d6bd"; g.fillRect(-80, Z0 - 14, W + 160, 4);
    g.strokeStyle = TINTA; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-80, Z0 - 14); g.lineTo(W + 80, Z0 - 14); g.stroke();
    // suelo de barro (baldosas en perspectiva)
    g.fillStyle = "#a9562f"; g.fillRect(-80, PARED, W + 160, H + 70 - PARED);
    const VX = 512, VY = 120;
    g.strokeStyle = "rgba(60,22,8,0.6)"; g.lineWidth = 1.6;
    for (let i = -14; i <= 14; i++) { const xb = VX + i * 95; g.beginPath(); g.moveTo(lerp(VX, xb, (PARED - VY) / (H + 70 - VY)), PARED); g.lineTo(xb, H + 70); g.stroke(); }
    for (let k = 0, y = PARED; y < H + 70; k++) { g.beginPath(); g.moveTo(-80, y); g.lineTo(W + 80, y); g.stroke(); y += 10 + k * 9; }
    for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(${hash(i) > 0.5 ? "255,190,140" : "70,25,8"},0.08)`; g.fillRect(-80 + hash(i + 1) * (W + 160), PARED + hash(i + 2) * 200, 30, 6); }
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(-80, PARED); g.lineTo(W + 80, PARED); g.stroke();

    // --- izquierda: la balda de botellas, los jamones y la barra con su vitrina ---
    g.fillStyle = "#5a3520"; g.fillRect(-60, 178, 300, 9); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.strokeRect(-60, 178, 300, 9);
    const cols = ["#1f3b26", "#3a1c12", "#1f3b26", "#59341c", "#2a2f1c", "#3a1c12", "#1f3b26"];
    for (let i = 0; i < 8; i++) botella(g, -40 + i * 27, 178, 46 + 10 * hash(i + 30), cols[i % cols.length]);
    g.fillStyle = "#c26b3a"; g.beginPath(); g.ellipse(214, 160, 12, 18, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke(); g.fillStyle = "#f3e6c8"; g.fillRect(204, 152, 20, 4);
    g.strokeStyle = "#2b1a10"; g.lineWidth = 5; g.beginPath(); g.moveTo(-40, 14); g.lineTo(250, 14); g.stroke();
    jamon(g, 30, 54, 0.85); jamon(g, 120, 50, 0.92); jamon(g, 205, 56, 0.8);
    g.fillStyle = "#6b3a1e"; g.fillRect(-80, 352, 320, PARED - 352);
    for (let x = -70; x < 230; x += 52) { g.strokeStyle = "rgba(30,12,4,0.6)"; g.lineWidth = 2; g.strokeRect(x, 366, 42, PARED - 380); g.strokeStyle = "rgba(255,200,150,0.15)"; g.strokeRect(x + 3, 369, 36, PARED - 386); }
    g.fillStyle = "#8a4e2a"; g.fillRect(-80, 344, 324, 10); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.strokeRect(-80, 344, 324, 10);
    // vitrina de tapas
    g.fillStyle = "rgba(220,240,245,0.35)"; g.beginPath(); g.moveTo(-60, 344); g.lineTo(-50, 296); g.lineTo(200, 296); g.lineTo(210, 344); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke();
    const band = (x, f) => { g.fillStyle = "#eae6dc"; g.fillRect(x - 24, 330, 48, 8); g.strokeStyle = TINTA; g.lineWidth = 1; g.strokeRect(x - 24, 330, 48, 8); f(x); };
    band(-22, x => { g.fillStyle = "#f2c94c"; g.beginPath(); g.arc(x, 330, 18, Math.PI, 0); g.fill(); g.fillStyle = "#c98a2a"; g.beginPath(); g.moveTo(x, 330); g.lineTo(x + 18, 330); g.arc(x, 330, 18, 0, -0.6, true); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.beginPath(); g.arc(x, 330, 18, Math.PI, 0); g.stroke(); });
    band(40, x => { for (let i = 0; i < 4; i++) { g.fillStyle = "#b5722f"; g.beginPath(); g.ellipse(x - 15 + i * 10, 325, 5, 4, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 0.8; g.stroke(); } });
    band(102, x => { for (let i = 0; i < 5; i++) { g.fillStyle = "#c8cfd4"; g.beginPath(); g.ellipse(x - 16 + i * 8, 326, 3, 6, 0.5, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 0.6; g.stroke(); } });
    band(164, x => { for (let i = 0; i < 4; i++) { g.fillStyle = "#3f7d25"; g.beginPath(); g.ellipse(x - 14 + i * 9, 325, 4, 6, 0.2, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 0.6; g.stroke(); } });
    g.strokeStyle = "rgba(255,255,255,0.5)"; g.lineWidth = 2; g.beginPath(); g.moveTo(-44, 340); g.lineTo(-36, 302); g.stroke();
    // grifo de cerveza (sin marcas)
    g.fillStyle = "#3a2618"; g.fillRect(222, 270, 8, 30); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.strokeRect(222, 270, 8, 30);
    g.fillStyle = "#c9ced3"; g.fillRect(222, 300, 8, 44); g.strokeRect(222, 300, 8, 44);
    g.fillStyle = "#e9ecef"; g.beginPath(); g.ellipse(226, 300, 12, 5, 0, 0, Math.PI * 2); g.fill(); g.stroke();

    // --- derecha: ventana en arco a la calle y ristras ---
    const VX0 = 780, VX1 = 960, VY0 = 120, VY1 = 330, VC = (VX0 + VX1) / 2, VR = (VX1 - VX0) / 2;
    const arco = () => { g.beginPath(); g.moveTo(VX0, VY1); g.lineTo(VX0, VY0 + 60); g.arc(VC, VY0 + 60, VR, Math.PI, 0); g.lineTo(VX1, VY1); };
    g.save(); arco(); g.closePath(); g.clip();
    const gc = g.createLinearGradient(0, VY0, 0, VY1); gc.addColorStop(0, "#1c2a5c"); gc.addColorStop(0.6, "#4a4f8a"); gc.addColorStop(1, "#c67d6a");
    g.fillStyle = gc; g.fillRect(VX0, VY0 - 40, VX1 - VX0, VY1 - VY0 + 40);
    g.fillStyle = "#2b2140"; g.fillRect(VX0, 210, 70, 130); g.fillRect(VX0 + 80, 190, 110, 150);
    g.fillStyle = "#ffc96b"; for (let i = 0; i < 10; i++) { const x = VX0 + 10 + (i % 5) * 34 + (i > 4 ? 6 : 0), y = 225 + Math.floor(i / 5) * 40; if (hash(i + 40) > 0.3) g.fillRect(x, y, 10, 14); }
    g.strokeStyle = "#151020"; g.lineWidth = 3; g.beginPath(); g.moveTo(VX0 + 150, VY1); g.lineTo(VX0 + 150, 240); g.stroke();
    const gl = g.createRadialGradient(VX0 + 150, 236, 1, VX0 + 150, 236, 34); gl.addColorStop(0, "rgba(255,220,140,0.9)"); gl.addColorStop(1, "rgba(255,220,140,0)");
    g.fillStyle = gl; g.fillRect(VX0 + 110, 200, 80, 80);
    g.strokeStyle = "rgba(20,15,25,0.8)"; g.lineWidth = 1; g.beginPath(); g.moveTo(VX0, 170); g.quadraticCurveTo(VC, 200, VX1, 166); g.stroke();
    for (let i = 0; i < 8; i++) { const u = (i + 0.5) / 8, x = lerp(VX0, VX1, u), y = lerp(170, 166, u) + 2 * u * (1 - u) * (200 - 168); g.fillStyle = ["#ffd76b", "#ff8a5c", "#9be37a"][i % 3]; g.beginPath(); g.arc(x, y + 3, 3, 0, Math.PI * 2); g.fill(); }
    g.restore();
    g.strokeStyle = "#f2e6cf"; g.lineWidth = 10; arco(); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 2; arco(); g.stroke();
    g.strokeStyle = "#f2e6cf"; g.lineWidth = 4; g.beginPath(); g.moveTo(VC, VY0 - 30); g.lineTo(VC, VY1); g.moveTo(VX0, 230); g.lineTo(VX1, 230); g.stroke();
    g.fillStyle = "#e9dcc2"; g.fillRect(VX0 - 14, VY1, VX1 - VX0 + 28, 10); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.strokeRect(VX0 - 14, VY1, VX1 - VX0 + 28, 10);
    // maceta de geranios en el alféizar
    g.fillStyle = "#b85a2e"; g.beginPath(); g.moveTo(VX0 + 6, VY1); g.lineTo(VX0 + 10, VY1 - 22); g.lineTo(VX0 + 40, VY1 - 22); g.lineTo(VX0 + 44, VY1); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.3; g.stroke();
    for (let i = 0; i < 9; i++) { g.fillStyle = i % 3 ? "#3e7d2a" : "#e3343f"; g.beginPath(); g.arc(VX0 + 12 + 26 * hash(i + 60), VY1 - 30 - 14 * hash(i + 61), i % 3 ? 6 : 4.5, 0, Math.PI * 2); g.fill(); }
    // ristras de ajos y de guindillas
    const ristra = (x, y0, n, ajo) => {
      g.strokeStyle = "#cdb48a"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y0 - 10); g.lineTo(x, y0 + n * 11); g.stroke();
      for (let i = 0; i < n; i++) {
        const yy = y0 + i * 11, xx = x + (i % 2 ? 5 : -5);
        if (ajo) { g.fillStyle = "#f4ecdc"; g.beginPath(); g.ellipse(xx, yy, 7, 6, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = "rgba(120,90,70,0.8)"; g.lineWidth = 0.8; g.stroke(); g.beginPath(); g.moveTo(xx, yy - 6); g.lineTo(xx, yy + 5); g.stroke(); }
        else { g.fillStyle = "#c21f1a"; g.beginPath(); g.ellipse(xx, yy, 3, 8, i % 2 ? 0.3 : -0.3, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 0.7; g.stroke(); }
      }
    };
    ristra(752, 40, 9, true); ristra(984, 50, 10, false);
    // penumbra (la luz cae sobre el barril)
    const gv = g.createRadialGradient(512, 300, 140, 512, 330, 720); gv.addColorStop(0, "rgba(0,0,0,0)"); gv.addColorStop(1, "rgba(30,10,0,0.5)");
    g.fillStyle = gv; g.fillRect(-80, -70, W + 160, H + 140);
    return c;
  }
  // barril: el tablero (detrás de todo lo de encima) y el cuerpo (delante de las piernas)
  function creaBarril() {
    const { x, y, rx, ry, grueso, ancho, panza } = BAR;
    const pad = 10, cw = (panza + pad) * 2, ch = SUELO - y + ry + 40;
    const ox = x - cw / 2, oy = y - ry - 12;
    const mk = () => { const c = document.createElement("canvas"); c.width = cw; c.height = ch; const g = c.getContext("2d"); g.translate(-ox, -oy); g.lineJoin = "round"; return { c, g }; };
    // tablero
    const A = mk(), g = A.g;
    const gt = g.createRadialGradient(x - 20, y - 6, 4, x, y, rx); gt.addColorStop(0, "#d8a868"); gt.addColorStop(0.7, "#bf8a4c"); gt.addColorStop(1, "#9b6a35");
    g.fillStyle = gt; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.clip();
    g.strokeStyle = "rgba(110,62,24,0.35)"; g.lineWidth = 1;
    for (let i = -6; i <= 6; i++) { g.beginPath(); g.moveTo(x - rx, y + i * 3.6); g.bezierCurveTo(x - 30, y + i * 3.6 + 2 * Math.sin(i), x + 30, y + i * 3.6 - 2 * Math.cos(i), x + rx, y + i * 3.6); g.stroke(); }
    g.strokeStyle = "rgba(60,30,10,0.45)"; g.lineWidth = 1.2; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(x + i * 26, y - ry); g.lineTo(x + i * 26 + 2, y + ry); g.stroke(); }
    g.restore();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.stroke();
    barrilAtras = A.c;
    // cuerpo (duelas, aros) y canto del tablero
    const B = mk(), h = B.g;
    const ybot = SUELO - 6, yt = y + grueso;
    const perfil = yy => { const u = clamp((yy - yt) / (ybot - yt)); return lerp(ancho, panza, Math.sin(Math.PI * u)); };
    h.fillStyle = "rgba(0,0,0,0.35)"; h.beginPath(); h.ellipse(x, SUELO + 2, ancho + 16, 10, 0, 0, Math.PI * 2); h.fill();
    const pts = []; for (let k = 0; k <= 20; k++) { const yy = lerp(yt, ybot, k / 20); pts.push({ x: x + perfil(yy), y: yy }); }
    const forma = () => {
      h.beginPath(); h.moveTo(x - ancho, yt); pts.forEach(q => h.lineTo(2 * x - q.x, q.y));
      h.ellipse(x, ybot, ancho, 12, 0, Math.PI, 0, true);
      for (let k = pts.length - 1; k >= 0; k--) h.lineTo(pts[k].x, pts[k].y);
      h.ellipse(x, yt, ancho, ry - 1, 0, 0, Math.PI, false); h.closePath();
    };
    forma();
    const gb = h.createLinearGradient(x - panza, 0, x + panza, 0); gb.addColorStop(0, "#5a2f14"); gb.addColorStop(0.3, "#a8642e"); gb.addColorStop(0.55, "#c07a3c"); gb.addColorStop(1, "#4e2810");
    h.fillStyle = gb; h.fill();
    h.save(); forma(); h.clip();
    for (let i = -7; i <= 7; i++) {
      const u = i / 7.6;
      h.strokeStyle = "rgba(40,18,6,0.55)"; h.lineWidth = 1.4; h.beginPath();
      for (let k = 0; k <= 20; k++) { const yy = lerp(yt, ybot, k / 20), px = x + Math.sin(u * Math.PI / 2) * perfil(yy), py = yy + Math.cos(u * Math.PI / 2) * 10; k ? h.lineTo(px, py) : h.moveTo(px, py); }
      h.stroke();
    }
    for (const yy of [yt + 22, yt + 56, ybot - 64, ybot - 26]) {
      const w = perfil(yy);
      h.strokeStyle = "#2c2a2a"; h.lineWidth = 9; h.beginPath(); h.ellipse(x, yy, w + 1, 13, 0, 0.05, Math.PI - 0.05); h.stroke();
      h.strokeStyle = "rgba(200,200,210,0.35)"; h.lineWidth = 2; h.beginPath(); h.ellipse(x, yy - 3, w, 12, 0, 0.3, Math.PI * 0.55); h.stroke();
      h.fillStyle = "#77736e"; for (let a = 0.35; a < Math.PI - 0.2; a += 0.42) { h.beginPath(); h.arc(x + Math.cos(a) * w, yy + Math.sin(a) * 13, 1.6, 0, Math.PI * 2); h.fill(); }
    }
    const gl = h.createLinearGradient(0, yt, 0, ybot); gl.addColorStop(0, "rgba(255,200,120,0.25)"); gl.addColorStop(0.5, "rgba(255,200,120,0)"); gl.addColorStop(1, "rgba(0,0,0,0.25)");
    h.fillStyle = gl; h.fillRect(x - panza - 4, yt, panza * 2 + 8, ybot - yt + 14);
    h.restore();
    forma(); h.strokeStyle = TINTA; h.lineWidth = 2; h.stroke();
    // canto del tablero
    h.beginPath(); h.ellipse(x, y, rx, ry, 0, 0, Math.PI); h.lineTo(x - rx, y + grueso); h.ellipse(x, y + grueso, rx, ry, 0, Math.PI, 0, true); h.closePath();
    h.fillStyle = "#7d4c22"; h.fill(); h.strokeStyle = TINTA; h.lineWidth = 1.8; h.stroke();
    h.strokeStyle = "rgba(255,210,150,0.35)"; h.lineWidth = 1.2; h.beginPath(); h.ellipse(x, y + 1.5, rx - 1, ry - 0.5, 0, 0.25, Math.PI - 0.25); h.stroke();
    barrilDelante = B.c;
    return { ox, oy };
  }
  // farolillo de esparto colgando sobre el barril, con su cono de luz
  const FAROL = { x: 512, y: 62 };
  const angFarol = t => 0.012 * Math.sin(t * 0.8) + (t > T.pincha ? 0.02 * Math.exp(-(t - T.pincha) * 1.5) * Math.sin((t - T.pincha) * 6) : 0);
  function farol(g, t) {
    const a = angFarol(t);
    g.save(); g.translate(FAROL.x, -80); g.rotate(a); g.translate(-FAROL.x, 80);
    const { x, y } = FAROL;
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x, -80); g.lineTo(x, y - 12); g.stroke();
    const forma = () => { g.beginPath(); g.moveTo(x - 10, y - 12); g.bezierCurveTo(x - 30, y - 8, x - 44, y + 18, x - 48, y + 34); g.lineTo(x + 48, y + 34); g.bezierCurveTo(x + 44, y + 18, x + 30, y - 8, x + 10, y - 12); g.closePath(); };
    forma(); const gr = g.createLinearGradient(x - 48, 0, x + 48, 0); gr.addColorStop(0, "#8a5a24"); gr.addColorStop(0.4, "#d6a45a"); gr.addColorStop(1, "#7a4c1c"); g.fillStyle = gr; g.fill();
    g.save(); forma(); g.clip(); g.strokeStyle = "rgba(90,50,15,0.55)"; g.lineWidth = 1.2;
    for (let yy = y - 10; yy < y + 36; yy += 5) { g.beginPath(); for (let xx = x - 50, i = 0; xx < x + 50; xx += 6, i++) g.lineTo(xx, yy + (i % 2 ? 1.5 : -1.5)); g.stroke(); }
    g.restore();
    forma(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#fff2c4"; g.beginPath(); g.ellipse(x, y + 34, 46, 5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fffae6"; g.beginPath(); g.arc(x, y + 36, 9, 0, Math.PI); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.5; g.beginPath(); g.ellipse(x, y + 34, 48, 5, 0, 0, Math.PI * 2); g.stroke();
    g.restore();
  }
  function luzFarol(g, t) {
    const a = angFarol(t), bx = FAROL.x - Math.sin(a) * 180;
    g.save();
    const gr = g.createLinearGradient(0, FAROL.y + 36, 0, BAR.y + 30);
    gr.addColorStop(0, "rgba(255,225,150,0.28)"); gr.addColorStop(1, "rgba(255,215,140,0.06)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(bx - 44, FAROL.y + 36); g.lineTo(bx + 44, FAROL.y + 36); g.lineTo(BAR.x + 210, BAR.y + 30); g.lineTo(BAR.x - 210, BAR.y + 30); g.closePath(); g.fill();
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const a = suave(fase(t, T.zoom0, T.zoom1)) * (1 - suave(fase(t, 8.05, 8.9)));
    const b = suave(fase(t, 8.05, 8.9)) * (1 - suave(fase(t, 12.5, 13.4)));
    const k = 1.2 + 0.27 * a + 0.13 * b;
    let x = 512, y = 318 - 12 * a - 6 * b;
    const u = t - T.pincha;
    if (u > 0 && u < 0.5) { const s = Math.exp(-u * 9) * Math.sin(u * 55); y += 2 * s; x += 1 * s; }
    return { k, x, y };
  }

  function poses(t) { return { g: poseG(t), r: poseR(t) }; }

  /* =====================================================================================
   * ESCENA
   * ===================================================================================== */
  const ultimoChoque = (tipo, t) => { let u = -9; for (const c of CHOQUES) if (c.tipo === tipo && c.t <= t) u = c.t; return u; };
  // el palillo que tira Rodri por encima del hombro
  function palilloVolando(g, t) {
    const u = t - T.rTira; if (u < 0 || u > 0.9) return;
    const s0 = palilloDe(manoRQ(T.rTira));
    const c0 = { x: (s0.a.x + s0.b.x) / 2, y: (s0.a.y + s0.b.y) / 2 };
    const x = c0.x + 170 * u, y = c0.y - 210 * u + 420 * u * u, a = -2.2 + u * 16;
    dibPalillo(g, { a: { x: x - Math.cos(a) * 12, y: y - Math.sin(a) * 12 }, b: { x: x + Math.cos(a) * 12, y: y + Math.sin(a) * 12 } });
  }
  // el palillo clavado en la manga (gira con el antebrazo de Rodri)
  function palilloClavado(g, t) {
    if (t < T.gSuelta) return;
    const m = mangaR(t), tb = T.pincha;
    const vib = t < tb + 0.5 ? 0.15 * Math.exp(-(t - tb) * 8) * Math.sin((t - tb) * 60) : 0;
    const a = 1.28 + vib + (manoRQ(t).mu - APOYO_R.mu);
    dibPalillo(g, { a: { x: m.x - Math.cos(a) * 20, y: m.y - Math.sin(a) * 20 }, b: { x: m.x + Math.cos(a) * 6, y: m.y + Math.sin(a) * 6 } });
  }
  function efectos(g, t, pG, pR) {
    // cruce de palillos: ¡tin!
    destello(g, 512, 286, fase(t, T.cruce, T.cruce + 0.35), 11);
    tin(g, 512, 286, fase(t, T.cruce, T.cruce + 0.3), 0, 10);
    // pinchazos
    for (const gp of GOLPES) golpe(g, gp.falla ? REPOSO.x - 2 : REPOSO.x, REPOSO.y - 2, fase(t, gp.t, gp.t + 0.22));
    // choques de la aceituna
    for (const c of CHOQUES) {
      const k = fase(t, c.t, c.t + 0.3);
      if (c.tipo === "vasoR") tin(g, VASO_R.x - 6, VASO_R.y - 20, k, -1);
      else if (c.tipo === "vasoG") tin(g, VASO_G.x + 6, VASO_G.y - 20, k, 1);
      else if (c.tipo === "serv") tin(g, SERV.x - 8, SERV.y - 16, k, -1);
      else if (c.tipo === "palillos") tin(g, PALILLERO.x - 4, PALILLERO.y - 24, k, 0);
    }
    migas(g, t);
    palilloVolando(g, t);
    palilloClavado(g, t);
    // la aceituna, al vuelo
    const ov = olivaVuelo(t);
    if (ov && ov.k > 0.02) { g.save(); g.translate(ov.x, ov.y); g.scale(ov.k, ov.k); oliva(g, 0, OR, 0, ov.rot); g.restore(); }
    // ¡zas!: golpecito y plumón
    if (t >= T.pincha) { const m = mangaR(T.pincha); golpe(g, m.x, m.y, fase(t, T.pincha, T.pincha + 0.25)); plumas(g, t, m); }
    soplido(g, t, pR);
    achis(g, t, pG);
  }
  class LaAceituna extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !R.listo()) return;
      if (!fondo) { fondo = creaFondo(); BARRIL_O = creaBarril(); }
      mangaCache = null;
      const pG = poseG(t), pR = poseR(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      BASE_M = g.getTransform();
      g.drawImage(fondo, -80, -70);
      luzFarol(g, t);
      g.drawImage(barrilAtras, BARRIL_O.ox, BARRIL_O.oy);
      // lo de encima del tablero, de atrás a delante
      const o = t >= T.rCogeO ? null : olivaMesa(t);
      aceite(g, t);
      const items = [
        { y: VASO_G.y, f: () => vaso(g, VASO_G, t, ultimoChoque("vasoG", t)) },
        { y: VASO_R.y, f: () => vaso(g, VASO_R, t, ultimoChoque("vasoR", t)) },
        { y: PALILLERO.y, f: () => palillero(g, t, 7 - (t >= T.gCoge ? 1 : 0) - (t >= T.rCoge ? 1 : 0)) },
        { y: PLATO.y - 6, f: () => plato(g, t) },
        { y: PAN.y, f: () => pan(g, t) },
        { y: SERV.y, f: () => servilletero(g, t) }
      ];
      const alto = o && o.h > 9;
      if (o) items.push({ y: o.y + 0.5, f: () => { sombraOliva(g, o.x, o.y, o.h); if (!alto) oliva(g, o.x, o.y, o.h, o.rot); } });
      items.sort((a, b) => a.y - b.y).forEach(it => it.f());
      // personajes
      R.dibujar(g, pR, t);
      G.dibujar(g, pG, t);
      g.drawImage(barrilDelante, BARRIL_O.ox, BARRIL_O.oy);
      if (o && alto) oliva(g, o.x, o.y, o.h, o.rot);
      if (o) estela(g, t, o);
      efectos(g, t, pG, pR);
      farol(g, t);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }

  registrar({ id: "00116", nombre: "Guillermo y Rodri · La aceituna", crear: () => new LaAceituna() });
  // diagnóstico: distancia hombro → muñeca / largo del brazo (≤ 1,08 o la mano se despega)
  function diag(t) {
    const out = {};
    for (const [n, Rg, p] of [["g", G, poseG(t)], ["r", R, poseR(t)]]) for (const lado of ["cerca", "lejos"]) {
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m || !m.puno) continue;
      const Tr = Rg.tronco(p), h = Tr(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO), mu = m.mu ?? -1.75;
      const w = { x: m.x + Math.cos(mu) * Rg.MUNECA_R * Rg.JK, y: m.y + Math.sin(mu) * Rg.MUNECA_R * Rg.JK };
      out[n + lado] = +(Math.hypot(w.x - h.x, w.y - h.y) / (lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L)).toFixed(3);
    }
    return out;
  }
  window.__A2D_00116 = { pose: poses, poseG, poseR, T, DUR, diag, olivaMesa };
})();
