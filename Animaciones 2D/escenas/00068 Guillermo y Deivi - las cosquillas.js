"use strict";
/* 00068 · Guillermo y Deivi · Las cosquillas
 *
 * Negro → salón de casa por la noche: papel pintado verde azulado, un sofá de terciopelo teja con
 * cojines, lámpara de pie encendida a la izquierda, ventana con luna y mesita con planta a la derecha,
 * alfombra de flecos. La tele queda fuera de cuadro, delante: su luz azulada parpadea sobre los dos.
 * Guillermo zapea, repantigado; Deivi, sin apartar la vista de la pantalla, busca el mando a tientas…
 * y le clava el dedo en el costado → Guillermo pega un bote y el mando sale volando a la alfombra →
 * Deivi le mira, se mira el dedo y, muy despacio, vuelve a tocarle: otro respingo y una risita; Guillermo
 * se tapa el costado y le suplica que no → Deivi mira a cámara con sonrisa de pillo, sube y baja las
 * cejas y menea los dedos → se lanza de rodillas sobre el sofá y le ataca: Guillermo se parte de risa
 * (ojos apretados, lágrimas que saltan, boca abierta), se retuerce, aporrea el cojín y resbala hasta
 * caer de espaldas a la alfombra (Deivi se lleva las manos a la boca), donde sigue revolcándose y pataleando
 * mientras Deivi, inclinado desde el sofá, le hace cosquillas al aire → Deivi para, levanta las manos y se deja caer en su sitio → Guillermo se calma,
 * jadea, se seca una lágrima, se incorpora y se queda de pie, con las manos en las rodillas, sudando →
 * Deivi levanta un dedo y lo menea… → Guillermo se queda helado, se da la vuelta y sale disparado de
 * cuadro (rayas de velocidad y una nube de polvo) → Deivi se ríe solo y guiña a cámara → negro.
 *
 * Sin textos. Guillermo se dibuja con su propia transformación (giro alrededor de la pelvis) para
 * resbalar del sofá, revolcarse en el suelo y levantarse; los toques y las cosquillas de Deivi van
 * a puntos del costado de Guillermo calculados en cada fotograma. Todo depende solo de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, DV = Deivi, R = Recortes;
  const S = 0.30, DUR = 14.9, TAU = Math.PI * 2;
  const SUELO_S = 548;                       // suela de los dos sentados (pies en la alfombra, delante del sofá)
  const ASIENTO = 105, COJIN = SUELO_S - ASIENTO;   // cara de arriba del cojín del asiento
  const SUELO_F = 562;                       // alfombra delante del sofá (Guillermo tumbado y de pie)
  const XG = 384, XD = 634, XD2 = 652;       // pelvis de los dos sentados (Deivi, al dejarse caer, queda un poco más a la derecha)
  const T = {
    zap1: 0.95, zap2: 1.3,
    busca: 1.35, palpa: 1.72, toca1: 2.05, bote1: 2.07, mira: 2.25,
    dedo0: 2.7, dedo1: 3.25, acerca: 3.35, toca2: 3.95, bote2: 3.97,
    tapa: 4.1, niega0: 4.25, niega1: 4.95,
    picaro: 4.45, cejas0: 4.75, cejas1: 5.2, menea: 4.85, miedo: 5.15,
    carga: 5.62, salta: 5.76, contacto: 6.0,
    resbala: 7.0, cae: 7.48, suelo: 7.9,
    aire: 7.7, para: 9.0, plof: 9.15, plof1: 9.6,
    calma: 9.1, jadea: 9.65, lagrima: 9.8,
    incorpora: 10.2, levanta: 10.62, dePie: 11.15,
    dedo: 11.45, panico: 11.72, gira: 11.92, gira1: 12.08, corre: 12.26, fuera: 12.6,
    risaD: 12.62, guino: 13.45, fin: 13.95
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const rot = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const suma = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const Dd = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? m ?? i, menique: me ?? a ?? m ?? i });
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n], b[n], k); return o; };
  const RELAJ = Dd(0.55, 0.6, 0.55, 0.5, 0.45), MUSLO = Dd(0.7, 0.82, 0.8, 0.76, 0.72), ABIERTA = Dd(1, 1), PUNO = Dd(0.2, 0.04),
    SENALA = Dd(0.35, 1, 0.06, 0.04, 0.04), GARRA = Dd(0.55, 0.42, 0.4, 0.38, 0.36), AGARRA = Dd(0.55, 0.28, 0.26, 0.25, 0.24),
    PALMA = Dd(0.8, 0.95, 0.95, 0.92, 0.88), SECA = Dd(0.3, 0.9, 0.3, 0.2, 0.2);
  // dedos que se menean (cosquillas): una onda que recorre los dedos, del índice al meñique
  const FASES = { pulgar: 2.4, indice: 0, medio: 0.85, anular: 1.7, menique: 2.55 };
  const menea = (f, lo = 0.18, hi = 1, ph = 0) => t => { const o = {}; for (const n of DED) o[n] = lerp(lo, hi, 0.5 + 0.5 * Math.sin(TAU * f * t - FASES[n] + ph));
    o.pulgar = lerp(0.35, 0.72, 0.5 + 0.5 * Math.sin(TAU * f * t - FASES.pulgar + ph)); return o; };     // el pulgar se mueve poco (nada de «pulgar arriba»)
  // un solo dedo que se dobla y se estira (el índice), el resto recogido
  const dedito = (f) => t => Dd(0.3, lerp(0.25, 1, 0.5 + 0.5 * Math.sin(TAU * f * t)), 0.06, 0.05, 0.05);

  const SJ = {
    G: { l: G.BRAZO_L * 0.5, c: G.A.datos.piezas.brazo_cerca.codo },
    D: { l: DV.A.datos.piezas.brazo.codo, c: DV.A.datos.piezas.brazo_cerca.codo }
  };
  const PIERNA = rig => ({ cerca: rig.A.datos.piezas.pierna_cerca.largo, lejos: rig.A.datos.piezas.pierna_lejos.largo });
  const PIER = { G: PIERNA(G), D: PIERNA(DV) };
  // rodilla (hoja) por la misma cuenta que el recortable
  function rodilla(rig, p, lado) {
    const L = (rig === G ? PIER.G : PIER.D)[lado];
    const cad = rig.tronco(p)(rig.CADERA[lado]), c = R.ik(cad, p.piernas[lado].tob, L, L * 0.5, 80, 1, 1.03), d = R.dir(c.a1);
    return { x: cad.x + d.x * L * 0.5 * c.estira, y: cad.y + d.y * L * 0.5 * c.estira };
  }

  /* ---------- manos por pistas: [t0, t1, objetivo, curva]; el objetivo se resuelve cada fotograma ---------- */
  function pista(lista, p, t) {
    const res = o => ({ q: o.en(p, t), mx: o.mx ?? 0, puno: o.puno ?? 1, ang: o.ang ?? 0,
      dedos: typeof o.dedos === "function" ? o.dedos(t) : o.dedos });
    let c = res(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, o, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)), d = res(o);
      c = { q: mezcla(c.q, d.q, k), mx: lerp(c.mx, d.mx, k), puno: lerp(c.puno, d.puno, k), ang: lerp(c.ang, d.ang, k), dedos: mezclaD(c.dedos, d.dedos, k) };
    }
    return c;
  }
  // mano final: el antebrazo llega por su lado natural (mu = de la mano hacia el codo) + un giro extra
  function manoDe(rig, p, lado, h, dobla = -1) {
    const T = rig.tronco(p), cerca = lado === "c";
    const hom = T(cerca ? rig.HOMBRO_C : rig.HOMBRO);
    const L = cerca ? rig.BRAZO_C_L : rig.BRAZO_L, sj = SJ[rig === G ? "G" : "D"][lado];
    const c = R.ik(hom, h.q, L, sj, 42, dobla, 1.08), d = R.dir(c.a1);
    const e = { x: hom.x + d.x * sj * c.estira, y: hom.y + d.y * sj * c.estira };
    const mu = Math.atan2(e.y - h.q.y, e.x - h.q.x) + h.mx;
    return { x: h.q.x, y: h.q.y, ang: h.ang, mu, dobla, puno: h.puno, dedos: h.dedos };
  }
  // punta del índice respecto al centro de la mano (hoja), para tocar exactamente con ella
  const PUNTA_INDICE = { x: 9.5, y: 19.5 };
  function puntaIndice(rig, m) {
    const k = rig.JK * (m.puno ?? 1), q = rot({ x: PUNTA_INDICE.x * k, y: PUNTA_INDICE.y * k }, m.mu + Math.PI / 2 + (m.ang || 0));
    return { x: m.x + q.x, y: m.y + q.y };
  }

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, rub: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* ---------- la tele (fuera de cuadro, delante): color de cada canal ---------- */
  const CANALES = [[0, [120, 168, 255]], [T.zap1, [150, 240, 190]], [T.zap2, [255, 196, 140]], [T.resbala + 0.4, [140, 175, 255]], [T.dedo - 0.3, [230, 150, 235]]];
  function tele(t) {
    let col = CANALES[0][1];
    for (const [t0, c] of CANALES) if (t >= t0) { const k = tramo(t, t0, t0 + 0.12); col = col.map((v, i) => lerp(v, c[i], k)); }
    const zap = Math.max(campana(t, T.zap1, T.zap1 + 0.16), campana(t, T.zap2, T.zap2 + 0.16));
    const b = 0.86 + 0.08 * ruido(t * 3.1 + 2) + 0.05 * ruido(t * 7.3 + 9) + 0.25 * zap;
    return { col, b };
  }

  /* =====================================================================================
   * GUILLERMO: cuerpo en su marco (sentado en XG) + transformación propia (M: pivote o, destino W, giro phi, espejo sx)
   * ===================================================================================== */
  const PEL_S = G.SUELO - (ASIENTO + 20) / S;          // pelvis (hoja) sentado en el cojín
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const COSTADO = { x: 343, y: 525 };                  // costado (hoja de Guillermo): donde le pinchan
  const LX = 400, LY = SUELO_F - 40, LX1 = 318;        // tumbado en la alfombra: pelvis (se revuelca hacia la izquierda)
  const XF = 318, YF = SUELO_F - 34;                   // sentado en la alfombra
  const XP = 394, YP = SUELO_F - 184;                  // de pie (pelvis), un poco agachado
  const mundo = (M, q) => { const r = rot({ x: (q.x - M.o.x) * M.sx, y: q.y - M.o.y }, M.phi); return { x: M.W.x + r.x, y: M.W.y + r.y }; };
  const deMundo = (M, q) => { const r = rot({ x: q.x - M.W.x, y: q.y - M.W.y }, -M.phi); return { x: M.o.x + r.x / (M.sx || 1e-4), y: M.o.y + r.y }; };
  // de pantalla (mundo) a la hoja de Guillermo y al revés
  const hojaG = (p, q) => G.aHoja(p, deMundo(p.M, q));
  const pantG = (p, q) => mundo(p.M, G.aPantalla(p, q));

  const CARAS_G = {
    tele: E({ mx: -0.55, my: 0.12, c: 0.32, sd: 2, si: 4, sonr: 0.12, ancho: 0.85 }),
    zapea: E({ mx: -0.6, my: 0.1, c: 0.25, sd: 4, si: 8, gi: 0.06, sonr: 0.25, ancho: 0.9 }),
    susto: E({ mx: 0.2, my: -0.2, iris: 0.6, sd: 32, gd: 0.1, si: 32, gi: 0.1, abre: 36, ancho: 0.6, sonr: -0.3, lengua: 0.2 }),
    queEs: E({ mx: 0.85, my: 0.05, iris: 0.85, sd: 18, gd: -0.06, si: 22, gi: 0.08, abre: 6, ancho: 0.6, sonr: -0.15 }),
    recelo: E({ mx: 0.9, my: 0.2, c: 0.42, sd: -2, gd: -0.14, si: 6, gi: 0.04, abre: 0, ancho: 0.62, sonr: -0.1 }),
    risita: E({ mx: 0.4, my: 0, c: 1, h: 1, sd: 14, si: 14, abre: 20, ancho: 1.1, sonr: 0.85, rub: 0.6 }),
    suplica: E({ mx: 0.9, my: 0.05, c: 0.15, sd: 20, gd: -0.2, si: 22, gi: -0.2, abre: 8, ancho: 0.95, sonr: 0.5, rub: 0.5 }),
    miedo: E({ mx: 0.9, my: 0.05, iris: 0.66, sd: 28, gd: -0.12, si: 30, gi: -0.12, abre: 12, ancho: 0.8, sonr: 0.28, rub: 0.3 }),
    carcajada: E({ mx: 0, my: 0, c: 1, z: 1, sd: 18, gd: 0.12, si: 18, gi: 0.12, abre: 50, ancho: 1.18, sonr: 0.95, lengua: 0.55, rub: 0.8 }),
    agotado: E({ mx: -0.2, my: -0.2, c: 0.55, sd: 10, gd: -0.1, si: 10, gi: -0.1, abre: 26, ancho: 0.82, sonr: 0.15, lengua: 0.65, rub: 0.5 }),
    alivio: E({ mx: 0.85, my: 0.15, c: 0.4, sd: 8, gd: -0.08, si: 10, gi: -0.08, abre: 14, ancho: 0.9, sonr: 0.5, rub: 0.35 }),
    panico: E({ mx: 0.9, my: 0.1, iris: 0.42, sd: 36, gd: 0.14, si: 36, gi: 0.14, abre: 12, ancho: 0.46, sonr: -0.45, rub: 0 }),
    huye: E({ mx: 0.85, my: 0, iris: 0.5, sd: 30, gd: 0.18, si: 30, gi: 0.18, abre: 40, ancho: 0.72, sonr: -0.4, lengua: 0.2 })
  };
  const GUION_CARA_G = [
    [T.zap1 - 0.2, T.zap1, "zapea"], [T.zap2 + 0.25, T.zap2 + 0.5, "tele"],
    [T.bote1 - 0.02, T.bote1 + 0.08, "susto"], [T.mira + 0.15, T.mira + 0.45, "queEs"], [T.acerca + 0.1, T.acerca + 0.4, "recelo"],
    [T.bote2, T.bote2 + 0.06, "risita"], [T.niega0, T.niega0 + 0.3, "suplica"], [T.miedo, T.miedo + 0.2, "miedo"],
    [T.contacto - 0.02, T.contacto + 0.08, "carcajada"], [T.calma + 0.2, T.jadea + 0.1, "agotado"],
    [T.dePie, T.dePie + 0.3, "alivio"], [T.panico - 0.02, T.panico + 0.1, "panico"], [T.gira + 0.05, T.gira1, "huye"]
  ];
  const PARP_G = [0.55, 1.62, 2.95, 3.3, 5.0, 10.4, 11.3];
  // cuerpo sentado: torso (+ hacia delante), cabeza, pel (hoja: + hacia abajo)
  const CUERPOS_G = {
    tele: { torso: -0.07, cab: 0.04, pel: 0 },
    bote: { torso: -0.24, cab: -0.22, pel: -110 },
    vuelve: { torso: -0.04, cab: 0.08, pel: 0 },
    recelo: { torso: -0.12, cab: 0.06, pel: 8 },
    bote2: { torso: -0.17, cab: -0.14, pel: -60 },
    encogido: { torso: 0.1, cab: 0.1, pel: 10 },
    miedo: { torso: -0.24, cab: -0.06, pel: 0 },
    risa: { torso: -0.3, cab: -0.2, pel: 0 }
  };
  const GUION_G = [
    [T.bote1 - 0.02, T.bote1 + 0.14, "bote"], [T.bote1 + 0.15, T.bote1 + 0.42, "vuelve", entrada],
    [T.acerca + 0.15, T.toca2 - 0.1, "recelo"], [T.bote2, T.bote2 + 0.08, "bote2", salida], [T.bote2 + 0.1, T.tapa + 0.25, "encogido"],
    [T.miedo, T.miedo + 0.35, "miedo"], [T.contacto - 0.03, T.contacto + 0.12, "risa"]
  ];
  // intensidad de la risa (0–1): en el sofá, en el suelo y luego se calma
  const risaG = t => Math.max(0.45 * campana(t, T.bote2 + 0.02, T.tapa + 0.4), dentro(t, T.contacto - 0.02, T.contacto + 0.1, T.calma, T.jadea));
  // jadeo (0–1)
  const jadeoG = t => dentro(t, T.calma + 0.2, T.jadea, T.panico - 0.1, T.panico + 0.05);

  // mando a distancia (px de pantalla, eje largo en x, centro en el medio)
  function dibMando(g) {
    g.save(); g.lineJoin = "round";
    g.fillStyle = "#24242c"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.6;
    g.beginPath(); g.roundRect(-21, -6.5, 42, 13, 5); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.14)"; g.beginPath(); g.roundRect(-19, -5.2, 38, 3, 1.5); g.fill();
    g.fillStyle = "#e0453c"; g.beginPath(); g.arc(15.5, 0, 2.2, 0, TAU); g.fill();
    g.fillStyle = "#8d8f9c"; g.beginPath(); g.arc(6, 0, 3.4, 0, TAU); g.fill();
    g.fillStyle = "#5d5f6a"; for (let i = 0; i < 3; i++) for (let j = -1; j <= 1; j += 2) { g.beginPath(); g.arc(-4 - i * 5, j * 2.6, 1.3, 0, TAU); g.fill(); }
    g.fillStyle = "#6bd06b"; g.fillRect(19.6, -2, 1.4, 4);
    g.restore();
  }
  const mandoEnMano = () => g => {           // en unidades de mano: eje largo hacia los dedos (hacia delante)
    g.save(); const k = 1 / (G.JK * S); g.rotate(-0.25); g.translate(1, 2); g.scale(k, k); dibMando(g); g.restore();
  };

  function poseG(t) {
    const b = guion(GUION_G, CUERPOS_G, "tele", t);
    const respira = Math.sin(t * 2.3), ri = risaG(t), ja = jadeoG(t);
    const p = { x: XG, suelo: SUELO_S, s: S, tirasLimpias: true, piernas: {},
      pelvis: { x: G.PELVIS.x, y: PEL_S + b.pel + respira * 4 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.022 * ja * Math.max(0, Math.sin(t * 13)) },
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    // risa: sacudidas rítmicas del pecho y la cabeza («ja-ja-ja»)
    const pulso = Math.abs(Math.sin(t * 15.5));
    p.torsoEsc.y += 0.03 * ri * pulso; p.cabeza.ang += 0.06 * ri * Math.sin(t * 15.5); p.cabeza.dy -= 10 * ri * pulso;
    // se retuerce en el sofá
    const retuerce = dentro(t, T.contacto, T.contacto + 0.15, T.cae - 0.1, T.cae + 0.1);
    p.torso += 0.13 * retuerce * Math.sin(t * 19) + 0.06 * retuerce * Math.sin(t * 7.3);
    // niega con la cabeza («no, no, no…»)
    const niega = dentro(t, T.niega0, T.niega0 + 0.1, T.niega1 - 0.15, T.niega1);
    p.cabeza.ang += 0.09 * niega * Math.sin((t - T.niega0) * 17);
    const tiembla = dentro(t, T.miedo + 0.1, T.miedo + 0.25, T.contacto - 0.05, T.contacto);
    p.cabeza.ang += 0.02 * tiembla * Math.sin(t * 40);

    // ---- transformación propia y fases ----
    const o = G.aPantalla(p, p.pelvis);
    let W = { x: o.x, y: o.y }, phi = 0, sx = 1;
    const escapa = tramo(t, T.contacto, T.resbala);                  // se escurre hacia la izquierda en el sofá
    W.x -= 26 * escapa;
    const res = fase(t, T.resbala, T.cae), cae = fase(t, T.cae, T.suelo);
    // resbala: el culo se va hacia el borde del cojín y se tumba hacia atrás
    W.x += 30 * suave(res); W.y += 18 * suave(res); p.torso = lerp(p.torso, -0.62, suave(res));
    // cae de espaldas a la alfombra
    if (cae > 0) {
      const k = entrada(cae), kx = suave(cae);
      const desde = { x: o.x - 26 + 30, y: o.y + 18 };
      W = { x: lerp(desde.x, LX, kx), y: lerp(desde.y, LY, k) - 24 * Math.sin(Math.PI * kx) };
      phi = -Math.PI / 2 * suave(clamp(cae * 1.15));
      p.torso = lerp(-0.62, -0.08, suave(clamp(cae * 1.15)));
    }
    const enSuelo = t >= T.suelo;
    const sienta = fase(t, T.incorpora, T.levanta), levanta = fase(t, T.levanta, T.dePie);
    if (enSuelo) {
      const v = t - T.suelo;
      const rebote = 9 * Math.exp(-v * 9) * Math.abs(Math.sin(v * 15));
      const meneo = ri * tramo(t, T.suelo, T.suelo + 0.3) * (0.16 * Math.sin(t * 9.5) + 0.05 * Math.sin(t * 21));    // se revuelca de un lado a otro
      phi = -Math.PI / 2 + meneo * (1 - tramo(t, T.calma, T.jadea));
      p.torso = -0.08 + 0.08 * tramo(t, T.calma, T.jadea);
      const xs = lerp(LX, LX1, tramo(t, T.suelo, T.calma + 0.3));
      W = { x: xs - 30 * meneo, y: LY - rebote };
      if (sienta > 0) {               // se incorpora: sentado en la alfombra, inclinado hacia delante
        const k = suave(sienta);
        phi = lerp(phi, 0, k); p.torso = lerp(p.torso, 0.3, k);
        W = mezcla(W, { x: XF, y: YF }, k);
      }
      if (levanta > 0) {              // se pone de pie sobre los pies plantados
        const k = suave(levanta);
        W = { x: lerp(XF, XP, k), y: lerp(YF, YP, k) - 8 * Math.sin(Math.PI * k) };
        p.torso = 0.3 + 0.3 * Math.sin(Math.PI * k) + 0.16 * k;
      }
    }
    // de pie, con las manos en las rodillas; susto, media vuelta y a correr
    const pan = tramo(t, T.panico - 0.02, T.panico + 0.16), gira = fase(t, T.gira, T.gira1), corre = fase(t, T.corre, T.fuera);
    if (t >= T.dePie) {
      p.torso = lerp(0.46 + 0.035 * Math.sin(t * 13) * ja, -0.12, pan);
      W.y += 6 * pan - 12 * campana(t, T.gira - 0.05, T.gira1 + 0.08);
      sx = Math.cos(Math.PI * suave(gira));
      if (Math.abs(sx) < 0.04) sx = sx < 0 ? -0.04 : 0.04;
      if (t >= T.gira1) { p.torso = lerp(p.torso, 0.32, tramo(t, T.gira1, T.corre)); }
      if (corre > 0) W.x -= 760 * Math.pow(corre, 2.2);
    }
    p.M = { o, W, phi, sx };

    // ---- piernas (en el mundo o respecto a la pelvis según la fase) ----
    for (const [lado, rep, dy, ph] of [["cerca", 222, 0, 0], ["lejos", 262, -10, Math.PI]]) {
      // sentado: tobillos en el suelo, delante del sofá (marco del cuerpo = mundo)
      let tob = { x: G.PELVIS.x + rep, y: TOB_G + dy }, ang = 0;
      // brincos: los pies se levantan con el bote
      const salto = campana(t, T.bote1 - 0.02, T.bote1 + 0.45) + 0.6 * campana(t, T.bote2 - 0.02, T.bote2 + 0.3);
      tob.y -= (lado === "cerca" ? 150 : 110) * salto; tob.x += 40 * salto; ang -= 0.4 * salto;
      // pataleo en el sofá (pisotones alternos)
      if (ri > 0 && t < T.cae) { const w = Math.max(0, Math.sin(t * 14 + ph)); tob.y -= 120 * ri * w * (1 - suave(res)); tob.x += 30 * ri * w; ang -= 0.3 * ri * w; }
      // resbala: piernas estiradas hacia delante
      tob = mezcla(tob, { x: G.PELVIS.x + rep + 150, y: TOB_G + dy - 40 - 90 * (lado === "cerca" ? 1 : 0.6) }, suave(res)); ang -= 0.5 * suave(res);
      // tumbado: piernas arriba (respecto a la pelvis) dando patadas de bicicleta
      if (cae > 0) {
        const w = t * 11 + ph, pat = lerp(0.6, ri, tramo(t, T.suelo - 0.1, T.suelo + 0.3));
        const arriba = { x: p.pelvis.x + 370 + 85 * pat * Math.sin(w), y: p.pelvis.y + (lado === "cerca" ? 70 : -60) + 120 * pat * Math.cos(w) };
        tob = mezcla(tob, arriba, suave(cae)); ang = lerp(ang, -1.2 + 0.4 * pat * Math.sin(w + 1), suave(cae));
        // calmado: pies plantados en la alfombra, rodillas arriba
        const planta = tramo(t, T.calma + 0.15, T.jadea + 0.15);
        if (planta > 0) {
          const pie = hojaG(p, { x: W.x + (lado === "cerca" ? XP - 18 - XF : XP + 22 - XF), y: SUELO_F - G.TOBILLO_ALTO * S + (lado === "cerca" ? 0 : -6) });
          tob = mezcla(tob, pie, planta); ang = lerp(ang, -phi, planta);
        }
      }
      // de pie: los pies se quedan plantados (mundo) y el cuerpo sube
      if (levanta > 0 || t >= T.dePie) {
        const pie = hojaG(p, { x: XP + (lado === "cerca" ? -18 : 22), y: SUELO_F - G.TOBILLO_ALTO * S + (lado === "cerca" ? 0 : -6) });
        tob = pie; ang = t < T.dePie ? lerp(ang, 0, suave(levanta)) : 0;
      }
      // carrera: ruedas de dibujos animados (marco del cuerpo, mirando hacia donde corre)
      const rueda = tramo(t, T.gira1 - 0.02, T.gira1 + 0.08);
      if (rueda > 0) {
        const w = (t - T.gira1) * 46 + ph;
        const corriendo = { x: G.PELVIS.x + 40 + 190 * Math.sin(w), y: p.pelvis.y + 470 - 120 * Math.max(0, Math.cos(w)) };
        tob = mezcla(tob, corriendo, rueda); ang = lerp(ang, -0.35 * Math.cos(w), rueda);
      }
      p.piernas[lado] = { tob, ang };
    }

    // ---- cara ----
    const e = guion(GUION_CARA_G, CARAS_G, "tele", t);
    e.abre += 12 * ri * pulso; e.abre += 10 * ja * Math.max(0, Math.sin(t * 13));
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.sudor = 0.7 * dentro(t, T.miedo, T.miedo + 0.3, T.contacto, T.contacto + 0.2) + 0.9 * dentro(t, T.jadea - 0.2, T.jadea + 0.2, T.panico + 0.4, T.gira1);
    p.rojo = 0.22 * ri;

    // ---- manos ----
    manosG(p, t);
    return p;
  }

  /* ---------- manos de Guillermo ---------- */
  const trG = q => p => G.tronco(p)(q);
  const deHombro = (lado, d) => p => { const h = G.tronco(p)(lado === "c" ? G.HOMBRO_C : G.HOMBRO); return { x: h.x + d.x, y: h.y + d.y }; };
  const dePelvis = d => p => ({ x: p.pelvis.x + d.x, y: p.pelvis.y + d.y });
  const rodillaG = (lado, d) => p => { const r = rodilla(G, p, lado); return { x: r.x + d.x, y: r.y + d.y }; };
  // esquina de fuera del ojo cercano (retrato) → hoja
  const ojoG = d => p => { const q = G.cabeza(p).a({ x: 728, y: 565 }); return { x: q.x + d.x, y: q.y + d.y }; };
  const agita = (f, ax, ay, ph = 0) => (p, t) => ({ x: ax * Math.sin(TAU * f * t + ph), y: ay * Math.cos(TAU * f * t * 1.3 + ph) });
  const con = (base, extra) => (p, t) => suma(base(p, t), extra(p, t));
  const PISTA_GL = [            // mano lejana (la de delante): mando, susto, costado, «no», agitar, barriga…
    [0, 0, { en: trG({ x: 372, y: 612 }), dedos: AGARRA, mx: 0.15 }],
    [T.zap1 - 0.25, T.zap1 - 0.05, { en: trG({ x: 395, y: 590 }), dedos: AGARRA, mx: 0.05 }],
    [T.zap2 + 0.15, T.zap2 + 0.45, { en: trG({ x: 372, y: 612 }), dedos: AGARRA, mx: 0.15 }],
    [T.bote1 - 0.02, T.bote1 + 0.15, { en: deHombro("l", { x: 250, y: -90 }), dedos: ABIERTA, mx: 0 }],
    [T.bote1 + 0.25, T.bote1 + 0.6, { en: dePelvis({ x: 185, y: -45 }), dedos: MUSLO, mx: 0 }],
    [T.bote2, T.bote2 + 0.08, { en: deHombro("l", { x: 110, y: -150 }), dedos: ABIERTA, mx: 0 }, salida],
    [T.tapa - 0.02, T.tapa + 0.16, { en: trG({ x: 352, y: 545 }), dedos: PALMA, mx: -0.3 }],
    [T.miedo, T.miedo + 0.22, { en: con(deHombro("l", { x: 170, y: -40 }), agita(5.5, 10, 4)), dedos: ABIERTA, mx: 0.2 }],
    [T.contacto - 0.06, T.contacto + 0.12, { en: con(deHombro("l", { x: 55, y: -215 }), agita(3.2, 30, 26)), dedos: ABIERTA, mx: 0 }],
    [T.cae - 0.05, T.cae + 0.25, { en: con(deHombro("l", { x: 215, y: 70 }), agita(2.8, 30, 30)), dedos: ABIERTA, mx: 0 }],
    [T.suelo - 0.05, T.suelo + 0.2, { en: con(trG({ x: 330, y: 590 }), agita(7.75, 0, 8)), dedos: GARRA, mx: -0.2 }],
    [T.lagrima, T.lagrima + 0.22, { en: ojoG({ x: -38, y: 16 }), dedos: SECA, mx: 0.4 }],
    [T.lagrima + 0.35, T.lagrima + 0.6, { en: trG({ x: 330, y: 590 }), dedos: RELAJ, mx: -0.2 }],
    [T.incorpora, T.incorpora + 0.3, { en: rodillaG("lejos", { x: -10, y: -40 }), dedos: MUSLO, mx: 0 }],
    [T.levanta, T.levanta + 0.25, { en: rodillaG("lejos", { x: -8, y: -45 }), dedos: MUSLO, mx: 0 }],
    [T.panico - 0.02, T.panico + 0.16, { en: deHombro("l", { x: 60, y: -70 }), dedos: ABIERTA, mx: 0 }],
    [T.gira1 - 0.05, T.corre, { en: con(deHombro("l", { x: 130, y: 120 }), agita(7.3, 110, 50)), dedos: PUNO, mx: 0 }]
  ];
  const PISTA_GC = [            // mano cercana: muslo, susto, barriga, «no», aporrea el cojín, se agarra, barriga…
    [0, 0, { en: dePelvis({ x: 40, y: -42 }), dedos: RELAJ, mx: 0 }],
    [T.bote1 - 0.02, T.bote1 + 0.15, { en: deHombro("c", { x: -40, y: -230 }), dedos: ABIERTA, mx: 0 }],
    [T.bote1 + 0.25, T.bote1 + 0.6, { en: dePelvis({ x: 40, y: -42 }), dedos: RELAJ, mx: 0 }],
    [T.tapa, T.tapa + 0.18, { en: trG({ x: 300, y: 600 }), dedos: PALMA, mx: -0.2 }],
    [T.miedo + 0.04, T.miedo + 0.26, { en: con(deHombro("c", { x: 255, y: 0 }), agita(5.5, 8, 4, 1)), dedos: ABIERTA, mx: 0.2 }],
    [T.contacto - 0.04, T.contacto + 0.1, { en: (p, t) => hojaG(p, { x: p.M.W.x - 70, y: COJIN - 6 - 40 * Math.abs(Math.sin(TAU * 1.6 * (t - T.contacto))) }), dedos: PUNO, mx: 0 }],
    [T.resbala, T.resbala + 0.2, { en: p => hojaG(p, { x: p.M.W.x - 52, y: COJIN + 4 }), dedos: GARRA, mx: 0 }],
    [T.cae + 0.05, T.cae + 0.3, { en: con(deHombro("c", { x: 250, y: 90 }), agita(3.1, 25, 25, 2)), dedos: ABIERTA, mx: 0 }],
    [T.suelo, T.suelo + 0.25, { en: con(trG({ x: 285, y: 625 }), agita(7.75, 0, 8, 1)), dedos: GARRA, mx: -0.2 }],
    [T.incorpora, T.incorpora + 0.25, { en: p => hojaG(p, { x: p.M.W.x - 62, y: SUELO_F - 8 }), dedos: PALMA, mx: 0.5 }],
    [T.levanta, T.levanta + 0.3, { en: rodillaG("cerca", { x: -12, y: -40 }), dedos: MUSLO, mx: 0 }],
    [T.panico - 0.02, T.panico + 0.16, { en: deHombro("c", { x: -20, y: -60 }), dedos: ABIERTA, mx: 0 }],
    [T.gira1 - 0.05, T.corre, { en: con(deHombro("c", { x: 90, y: 160 }), agita(7.3, -110, -50)), dedos: PUNO, mx: 0 }]
  ];
  function manosG(p, t) {
    const L = pista(PISTA_GL, p, t), C = pista(PISTA_GC, p, t);
    p.manoLejos = manoDe(G, p, "l", L);
    p.manoCerca = manoDe(G, p, "c", C);
    // zapping: el pulgar pulsa
    const zap = Math.max(campana(t, T.zap1 - 0.05, T.zap1 + 0.12), campana(t, T.zap2 - 0.05, T.zap2 + 0.12));
    if (t < T.bote1 + 0.02) { p.manoLejos.dedos = Object.assign({}, p.manoLejos.dedos, { pulgar: lerp(0.55, 0.15, zap) }); p.manoLejos.objeto = mandoEnMano(); }
  }

  /* =====================================================================================
   * DEIVI: sentado → busca el mando → mira su dedo → pica → se lanza de rodillas → cosquillas → se deja caer
   * ===================================================================================== */
  const PEL_DS = DV.SUELO - (ASIENTO + 20) / S;       // pelvis (hoja) sentado
  const TOB_D = DV.SUELO - DV.TOBILLO_ALTO;
  const YK = 354;                                      // pelvis de rodillas sobre el cojín (pantalla)
  const CARAS_D = {
    tele: E({ mx: -0.5, my: 0.12, c: 0.3, sd: 4, si: 4, sonr: 0.18, ancho: 0.85 }),
    busca: E({ mx: -0.6, my: 0.1, c: 0.25, sd: 2, si: 8, gi: 0.05, abre: 0, ancho: 0.6, sonr: 0.0 }),
    sorpresa: E({ mx: 0.85, my: 0.1, iris: 0.8, sd: 20, gd: 0.06, si: 22, gi: 0.08, abre: 14, ancho: 0.6, sonr: 0 }),
    curioso: E({ mx: 0.75, my: 0.05, c: 0.2, sd: 4, gd: 0, si: 24, gi: 0.15, abre: 2, ancho: 0.75, sonr: 0.3 }),
    pica: E({ mx: 0.9, my: 0.2, c: 0.35, sd: 8, gd: 0.04, si: 14, gi: 0.1, abre: 0, ancho: 0.8, sonr: 0.55 }),
    picaro: E({ mx: -0.85, my: 0.05, c: 0.45, sd: 12, gd: 0.1, si: 4, gi: -0.02, abre: 6, ancho: 1.05, sonr: 0.95 }),
    ataque: E({ mx: 0.9, my: 0.25, c: 0.35, h: 0.3, sd: 10, gd: 0.06, si: 10, gi: 0.06, abre: 22, ancho: 1.08, sonr: 0.85 }),
    risa: E({ mx: 0.6, my: 0.3, c: 1, h: 1, sd: 12, si: 12, abre: 30, ancho: 1.1, sonr: 0.9 }),
    para: E({ mx: 0.85, my: 0.3, c: 0.55, h: 0.7, sd: 14, si: 14, abre: 14, ancho: 1, sonr: 0.8 }),
    mira: E({ mx: 0.9, my: 0.15, c: 0.3, sd: 6, si: 10, gi: 0.05, abre: 0, ancho: 0.85, sonr: 0.45 }),
    dedo: E({ mx: 0.9, my: 0.1, c: 0.4, sd: 4, gd: 0.06, si: 24, gi: 0.16, abre: 0, ancho: 0.9, sonr: 0.7 }),
    carcajada: E({ mx: 0.5, my: 0.1, c: 1, h: 1, sd: 14, si: 14, abre: 34, ancho: 1.12, sonr: 0.95 }),
    camara: E({ mx: -0.85, my: 0, c: 0.3, sd: 10, gd: 0.06, si: 8, gi: 0.04, abre: 4, ancho: 0.95, sonr: 0.75 }),
    guino: E({ mx: -0.85, my: 0, c: 0.08, wd: 0.92, sd: -2, gd: -0.06, si: 20, gi: 0.12, abre: 8, ancho: 1.05, sonr: 1 })
  };
  const GUION_CARA_D = [
    [T.busca - 0.1, T.busca + 0.15, "busca"], [T.bote1 + 0.02, T.bote1 + 0.1, "sorpresa"], [T.dedo0, T.dedo0 + 0.3, "curioso"],
    [T.acerca, T.acerca + 0.3, "pica"], [T.toca2 + 0.05, T.toca2 + 0.2, "sorpresa"], [T.picaro - 0.05, T.picaro + 0.25, "picaro"],
    [T.salta - 0.05, T.salta + 0.1, "ataque"], [T.cae - 0.1, T.cae + 0.05, "sorpresa"], [T.suelo + 0.05, T.suelo + 0.3, "risa"], [T.para, T.para + 0.15, "para"],
    [T.plof1, T.plof1 + 0.3, "mira"], [T.dedo - 0.2, T.dedo + 0.1, "dedo"], [T.fuera - 0.25, T.fuera, "carcajada"],
    [T.guino - 0.45, T.guino - 0.2, "camara"], [T.guino, T.guino + 0.12, "guino"]
  ];
  const PARP_D = [0.8, 2.35, 3.15, 4.3, 7.3, 9.4, 10.6, 11.25, 13.05];
  const CUERPOS_D = {
    tele: { torso: -0.05, cab: 0.0 },
    busca: { torso: 0.4, cab: -0.24 },
    retira: { torso: -0.1, cab: 0.04 },
    mira: { torso: 0.0, cab: 0.08 },
    dedo: { torso: 0.04, cab: 0.12 },
    acerca: { torso: 0.42, cab: 0.06 },
    picaro: { torso: -0.04, cab: -0.07 },
    carga: { torso: -0.16, cab: 0.02 },
    ataque: { torso: 0.55, cab: -0.12 },
    aire: { torso: 0.62, cab: 0.02 },
    para: { torso: 0.08, cab: -0.04 },
    sentado: { torso: -0.06, cab: 0.04 },
    dedo2: { torso: 0.14, cab: 0.06 },
    risa: { torso: 0.08, cab: 0.1 },
    guino: { torso: -0.03, cab: -0.05 }
  };
  const GUION_D = [
    [T.busca, T.palpa, "busca"], [T.toca1 + 0.03, T.toca1 + 0.22, "retira", salida], [T.mira, T.mira + 0.3, "mira"], [T.dedo0, T.dedo0 + 0.3, "dedo"],
    [T.acerca, T.toca2, "acerca"], [T.toca2 + 0.05, T.toca2 + 0.3, "mira"], [T.picaro - 0.1, T.picaro + 0.25, "picaro"],
    [T.carga - 0.05, T.salta, "carga"], [T.salta, T.contacto, "ataque", salida], [T.cae - 0.12, T.cae + 0.15, "mira"], [T.suelo, T.suelo + 0.35, "aire"],
    [T.para, T.para + 0.15, "para"], [T.plof, T.plof1, "sentado"], [T.dedo - 0.3, T.dedo, "dedo2"], [T.risaD, T.risaD + 0.3, "risa"],
    [T.guino - 0.45, T.guino - 0.15, "guino"]
  ];
  const XK = t => lerp(588, 574, tramo(t, T.contacto, T.resbala));    // de rodillas, sigue a Guillermo
  const rodillasD = t => dentro(t, T.salta, T.contacto, T.plof, T.plof1);
  const ANG_RODILLAS = 2.3;                            // zapatillas de rodillas: punta hacia atrás, suela hacia arriba

  function poseD(t, pg) {
    const b = guion(GUION_D, CUERPOS_D, "tele", t);
    const respira = Math.sin(t * 2.05 + 0.6);
    const sal = fase(t, T.salta, T.contacto), plo = fase(t, T.plof, T.plof1);
    const ku = rodillasD(t);
    // pelvis: sentado ↔ de rodillas (con un saltito al lanzarse y un rebote al dejarse caer)
    const yS = SUELO_S - (ASIENTO + 20);
    let px = lerp(t < T.plof ? XD : XD2, XK(t), ku), py = lerp(yS, YK, ku) - 34 * Math.sin(Math.PI * sal);
    if (t >= T.plof) { const v = t - T.plof1; py += v > 0 ? 7 * Math.exp(-v * 7) * Math.sin(v * 16) : -20 * Math.sin(Math.PI * plo); }
    const carga = campana(t, T.carga - 0.05, T.salta + 0.04);
    py += 10 * carga;
    const p = { x: px, suelo: SUELO_S, s: S, espejo: true, tirasLimpias: true, piernas: {},
      pelvis: { x: DV.PELVIS.x, y: DV.SUELO + (py - SUELO_S) / S + respira * 4 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    // cejas de pillo y risa
    const ri = Math.max(dentro(t, T.suelo, T.suelo + 0.3, T.plof1, T.plof1 + 0.3), dentro(t, T.risaD, T.risaD + 0.2, T.guino - 0.5, T.guino - 0.25));
    p.cabeza.ang += 0.05 * ri * Math.sin(t * 14); p.cabeza.dy -= 6 * ri * Math.abs(Math.sin(t * 14));
    // cosquillas: el cuerpo acompaña a las manos
    const cq = dentro(t, T.contacto - 0.05, T.contacto + 0.05, T.cae - 0.05, T.cae + 0.1);
    p.torso += 0.03 * cq * Math.sin(t * 22);

    // ---- piernas: sentado (pies delante, en el suelo) ↔ de rodillas (espinillas en el cojín) ----
    for (const [lado, rep, dy, atras, alto] of [["cerca", 215, 0, 92, 18], ["lejos", 255, -10, 58, 13]]) {
      const sent = { x: DV.PELVIS.x + rep, y: TOB_D + dy };
      const rod = DV.aHoja(p, { x: px + atras, y: COJIN - alto });
      const rel = q => ({ x: q.x - DV.PELVIS.x, y: q.y - p.pelvis.y });
      const encogido = { x: 30, y: 210 };
      let tob, ang;
      if (t < T.contacto || t >= T.plof) {
        // de camino: pasan por debajo del culo, encogidos
        const u = t < T.contacto ? suave(sal) : 1 - suave(plo);
        const a = rel(sent), c = rel(rod), m = { x: lerp(a.x, c.x, u), y: lerp(a.y, c.y, u) };
        const enc = Math.sin(Math.PI * u);
        const q = { x: lerp(m.x, encogido.x, enc * 0.85), y: lerp(m.y, encogido.y, enc * 0.6) };
        tob = { x: DV.PELVIS.x + q.x, y: p.pelvis.y + q.y };
        ang = lerp(0, ANG_RODILLAS, u) + 0.4 * enc;
      } else { tob = rod; ang = ANG_RODILLAS; }
      p.piernas[lado] = { tob, ang };
    }

    p.cara = cara(guion(GUION_CARA_D, CARAS_D, "tele", t), parpadeo(t, PARP_D));
    // sube y baja las cejas (pícaro)
    const cj = dentro(t, T.cejas0 - 0.05, T.cejas0, T.cejas1, T.cejas1 + 0.05);
    const ce = 14 * cj * Math.max(0, Math.sin((t - T.cejas0) * 4 * Math.PI));
    p.cara.cejas.d.sube += ce; p.cara.cejas.i.sube += ce;
    manosD(p, t, pg);
    return p;
  }

  /* ---------- manos de Deivi ---------- */
  const trD = q => p => DV.tronco(p)(q);
  const deHombroD = (lado, d) => p => { const h = DV.tronco(p)(lado === "c" ? DV.HOMBRO_C : DV.HOMBRO); return { x: h.x + d.x, y: h.y + d.y }; };
  const dePelvisD = d => p => ({ x: p.pelvis.x + d.x, y: p.pelvis.y + d.y });
  const enMundoD = q => p => DV.aHoja(p, q);
  let PG = null;                    // pose de Guillermo del fotograma (para tocarle)
  const costadoG = d => () => { const q = pantG(PG, G.tronco(PG)(COSTADO)); return { x: q.x + d.x, y: q.y + d.y }; };
  // centro de la mano para que la punta del índice caiga en q (mundo)
  const indiceEn = (q, mx) => (p, t) => {
    const qq = DV.aHoja(p, typeof q === "function" ? q(p, t) : q);
    // primera aproximación del giro de la mano con el centro en el punto
    const m0 = manoDe(DV, p, "l", { q: qq, mx, puno: 1, ang: 0, dedos: SENALA });
    const pt = puntaIndice(DV, m0);
    return { x: qq.x - (pt.x - qq.x), y: qq.y - (pt.y - qq.y) };
  };
  const frota = (f, r) => (p, t) => ({ x: r * Math.cos(TAU * f * t), y: r * 0.8 * Math.sin(TAU * f * t * 1.07) });
  const conD = (base, extra) => (p, t) => suma(base(p, t), extra(p, t));
  const aHojaD = f => (p, t) => DV.aHoja(p, f(p, t));
  const PISTA_DL = [               // mano lejana (hacia Guillermo)
    [0, 0, { en: dePelvisD({ x: 175, y: -48 }), dedos: MUSLO, mx: 0 }],
    [T.busca, T.palpa - 0.12, { en: enMundoD({ x: 506, y: COJIN - 10 }), dedos: PALMA, mx: 0.3 }],
    [T.palpa - 0.12, T.palpa, { en: enMundoD({ x: 492, y: COJIN - 3 }), dedos: PALMA, mx: 0.3 }],
    [T.palpa + 0.04, T.palpa + 0.14, { en: enMundoD({ x: 470, y: COJIN - 28 }), dedos: PALMA, mx: 0.2 }],
    [T.palpa + 0.16, T.toca1, { en: indiceEn(costadoG({ x: 3, y: 0 }), 0), dedos: SENALA, mx: 0 }],
    [T.toca1 + 0.03, T.toca1 + 0.24, { en: deHombroD("l", { x: 150, y: 120 }), dedos: ABIERTA, mx: 0 }, salida],
    [T.dedo0, T.dedo0 + 0.35, { en: deHombroD("l", { x: 325, y: 45 }), dedos: SENALA, mx: 0 }],
    [T.acerca, T.toca2 - 0.02, { en: indiceEn(costadoG({ x: 2, y: -6 }), 0), dedos: SENALA, mx: 0 }],
    [T.toca2 + 0.05, T.toca2 + 0.3, { en: deHombroD("l", { x: 160, y: 140 }), dedos: RELAJ, mx: 0 }, salida],
    [T.menea - 0.25, T.menea + 0.1, { en: deHombroD("l", { x: 135, y: -70 }), dedos: menea(3.2), mx: 0.25, puno: 1.2 }],
    [T.carga, T.salta, { en: deHombroD("l", { x: 70, y: 0 }), dedos: menea(3.2), mx: 0.25, puno: 1.18 }],
    [T.salta, T.contacto, { en: aHojaD(conD(costadoG({ x: 16, y: 4 }), frota(3.6, 7))), dedos: menea(5.5, 0.15, 0.95), mx: 0.1, puno: 1.15 }, salida],
    [T.cae - 0.14, T.cae + 0.1, { en: deHombroD("l", { x: 100, y: -70 }), dedos: ABIERTA, mx: 0.2 }, salida],
    [T.suelo + 0.05, T.suelo + 0.35, { en: aHojaD(conD(() => ({ x: 494, y: 372 }), frota(2.2, 9))), dedos: menea(4.2), mx: 0.2, puno: 1.2 }],
    [T.para, T.para + 0.14, { en: deHombroD("l", { x: 110, y: -150 }), dedos: ABIERTA, mx: 0.4 }, salida],
    [T.plof, T.plof1, { en: dePelvisD({ x: 175, y: -48 }), dedos: MUSLO, mx: 0 }],
    [T.dedo - 0.28, T.dedo, { en: deHombroD("l", { x: 230, y: 20 }), dedos: dedito(3.4), mx: 0 }],
    [T.risaD, T.risaD + 0.3, { en: trD({ x: 330, y: 560 }), dedos: GARRA, mx: -0.2 }],
    [T.guino - 0.35, T.guino - 0.1, { en: dePelvisD({ x: 175, y: -48 }), dedos: MUSLO, mx: 0 }]
  ];
  const PISTA_DC = [               // mano cercana
    [0, 0, { en: dePelvisD({ x: 40, y: -40 }), dedos: MUSLO, mx: 0 }],
    [T.menea - 0.2, T.menea + 0.15, { en: deHombroD("c", { x: 235, y: -30 }), dedos: menea(3.2, 0.18, 1, 1.3), mx: 0.25, puno: 1.2 }],
    [T.carga, T.salta, { en: deHombroD("c", { x: 180, y: 60 }), dedos: menea(3.2, 0.18, 1, 1.3), mx: 0.25, puno: 1.18 }],
    [T.salta, T.contacto, { en: conD(deHombroD("c", { x: 300, y: 70 }), frota(2.8, 10)), dedos: menea(5, 0.18, 1, 1.3), mx: 0.2, puno: 1.18 }, salida],
    [T.cae - 0.12, T.cae + 0.12, { en: deHombroD("c", { x: 190, y: -60 }), dedos: ABIERTA, mx: 0.2 }, salida],
    [T.suelo + 0.08, T.suelo + 0.4, { en: conD(deHombroD("c", { x: 265, y: 200 }), frota(2.5, 8)), dedos: menea(4.2, 0.18, 1, 1.3), mx: 0.2, puno: 1.2 }],
    [T.para + 0.02, T.para + 0.16, { en: deHombroD("c", { x: 170, y: -120 }), dedos: ABIERTA, mx: 0.4 }, salida],
    [T.plof, T.plof1, { en: dePelvisD({ x: 40, y: -40 }), dedos: MUSLO, mx: 0 }],
    [T.risaD + 0.05, T.risaD + 0.35, { en: p => { const b = DV.boca(p); return { x: b.x - 10, y: b.y + 40 }; }, dedos: PALMA, mx: 0.3 }],
    [T.guino - 0.4, T.guino - 0.15, { en: dePelvisD({ x: 40, y: -40 }), dedos: MUSLO, mx: 0 }]
  ];
  function manosD(p, t, pg) {
    PG = pg;
    const L = pista(PISTA_DL, p, t), C = pista(PISTA_DC, p, t);
    p.manoLejos = manoDe(DV, p, "l", L);
    p.manoCerca = manoDe(DV, p, "c", C);
  }

  function pose(t) {
    const pg = poseG(t), pd = poseD(t, pg);
    return { g: pg, d: pd };
  }

  /* =====================================================================================
   * FONDO (una vez): papel pintado, estantería, lámpara, ventana, mesita, suelo, alfombra y sofá
   * ===================================================================================== */
  const TINTA = "#0b0a0e";
  const SOFA = { x0: 196, x1: 828, alto: 288, brazo: 352, cojin0: 266, cojin1: 758, base: 490, pata: 534 };
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 120;
    const g = c.getContext("2d"); g.translate(60, 60);
    g.lineJoin = "round"; g.lineCap = "round";
    // pared: papel pintado de rayas con hojitas
    const pa = g.createLinearGradient(0, -60, 0, 470); pa.addColorStop(0, "#2c5a64"); pa.addColorStop(1, "#356a73");
    g.fillStyle = pa; g.fillRect(-60, -60, W + 120, 530);
    for (let x = -60; x < W + 60; x += 36) { g.fillStyle = "rgba(255,255,255,0.045)"; g.fillRect(x, -60, 16, 530); }
    g.fillStyle = "rgba(190,226,214,0.12)";
    for (let y = -40, f = 0; y < 450; y += 46, f++) for (let x = -60 + (f % 2) * 18; x < W + 60; x += 36) {
      g.save(); g.translate(x + 8, y); g.rotate(0.6); g.beginPath(); g.ellipse(0, 0, 3, 7, 0, 0, TAU); g.fill(); g.restore();
      g.save(); g.translate(x + 8, y + 9); g.rotate(-0.6); g.beginPath(); g.ellipse(0, 0, 3, 7, 0, 0, TAU); g.fill(); g.restore();
    }
    // ventana (derecha) con luna
    const V = { x0: 862, x1: 1000, y0: 58, y1: 300 };
    const cie = g.createLinearGradient(0, V.y0, 0, V.y1); cie.addColorStop(0, "#0d1530"); cie.addColorStop(1, "#273a6a");
    g.fillStyle = cie; g.fillRect(V.x0, V.y0, V.x1 - V.x0, V.y1 - V.y0);
    g.fillStyle = "#fff6d6";
    for (let i = 0; i < 14; i++) { const x = V.x0 + 8 + hash(i + 40) * (V.x1 - V.x0 - 16), y = V.y0 + 8 + hash(i + 70) * 150; g.globalAlpha = 0.4 + 0.5 * hash(i + 90); g.fillRect(x, y, 2, 2); }
    g.globalAlpha = 1;
    g.save(); g.beginPath(); g.arc(950, 112, 20, 0, TAU); g.fillStyle = "#fff4cf"; g.fill();
    g.beginPath(); g.arc(940, 106, 18, 0, TAU); g.fillStyle = "#16213f"; g.globalCompositeOperation = "source-atop"; g.fill(); g.restore();
    const lu = g.createRadialGradient(950, 112, 10, 950, 112, 70); lu.addColorStop(0, "rgba(255,240,200,0.25)"); lu.addColorStop(1, "rgba(255,240,200,0)");
    g.fillStyle = lu; g.fillRect(V.x0, V.y0, V.x1 - V.x0, 140);
    // tejados lejanos
    g.fillStyle = "#121a33";
    g.beginPath(); g.moveTo(V.x0, V.y1); for (let x = V.x0, i = 0; x <= V.x1; x += 18, i++) { const h = 30 + 40 * hash(i + 300); g.lineTo(x, V.y1 - h); g.lineTo(x + 18, V.y1 - h); } g.lineTo(V.x1, V.y1); g.closePath(); g.fill();
    g.fillStyle = "#ffd98a"; for (let i = 0; i < 8; i++) { const x = V.x0 + 6 + hash(i + 500) * 120, y = V.y1 - 8 - hash(i + 520) * 30; g.fillRect(x, y, 3, 4); }
    // marco y cruz de la ventana
    g.strokeStyle = "#e9e1cf"; g.lineWidth = 9; g.strokeRect(V.x0, V.y0, V.x1 - V.x0, V.y1 - V.y0);
    g.lineWidth = 5; g.beginPath(); g.moveTo((V.x0 + V.x1) / 2, V.y0); g.lineTo((V.x0 + V.x1) / 2, V.y1); g.moveTo(V.x0, 175); g.lineTo(V.x1, 175); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(V.x0 - 5, V.y0 - 5, V.x1 - V.x0 + 10, V.y1 - V.y0 + 10);
    g.fillStyle = "#e9e1cf"; g.fillRect(V.x0 - 12, V.y1 + 4, V.x1 - V.x0 + 24, 10); g.strokeRect(V.x0 - 12, V.y1 + 4, V.x1 - V.x0 + 24, 10);
    // cortinas mostaza
    for (const [x, dir] of [[V.x0 - 22, 1], [V.x1 + 22, -1]]) {
      g.save(); g.fillStyle = "#c9932e"; g.beginPath(); g.moveTo(x - 22, 30); g.lineTo(x + 22, 30);
      g.bezierCurveTo(x + 18 * dir + 10, 160, x - 6 * dir, 260, x + 8 * dir, 420); g.lineTo(x - 26 * dir, 420); g.bezierCurveTo(x - 30 * dir, 300, x - 20 * dir, 150, x - 22, 30);
      g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2.4; g.stroke();
      g.strokeStyle = "rgba(120,70,10,0.5)"; g.lineWidth = 2; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x - 12 + k * 10, 40); g.quadraticCurveTo(x - 8 + k * 9 + 6 * dir, 230, x - 14 * dir + k * 6, 410); g.stroke(); }
      g.restore();
    }
    g.fillStyle = "#6b4a2a"; g.fillRect(V.x0 - 60, 24, V.x1 - V.x0 + 120, 7); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.strokeRect(V.x0 - 60, 24, V.x1 - V.x0 + 120, 7);
    // estantería encima del sofá: libros, una plantita y un cuadrito
    g.fillStyle = "#8a5a33"; g.fillRect(392, 74, 250, 9); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(392, 74, 250, 9);
    g.fillStyle = "#5e3c22"; g.fillRect(410, 83, 8, 12); g.fillRect(616, 83, 8, 12);
    const LIB = ["#c0453a", "#e0b84a", "#3d6fa8", "#e8e0cc", "#4f8a5b", "#9a4f8c", "#d27a3a"];
    let lx = 402;
    for (let i = 0; i < 9; i++) { const w = 9 + Math.round(hash(i + 7) * 6), h = 34 + Math.round(hash(i + 17) * 14), inc = i === 8 ? 0.25 : 0;
      g.save(); g.translate(lx, 74); g.rotate(inc); g.fillStyle = LIB[i % LIB.length]; g.fillRect(0, -h, w, h); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.strokeRect(0, -h, w, h);
      g.fillStyle = "rgba(255,255,255,0.3)"; g.fillRect(2, -h + 6, w - 4, 2); g.fillRect(2, -12, w - 4, 2); g.restore(); lx += w + 1; }
    // cuadrito (montañas al atardecer)
    g.save(); g.translate(560, 28); g.fillStyle = "#c79b4a"; g.fillRect(-2, -2, 50, 46); g.strokeStyle = TINTA; g.lineWidth = 1.8; g.strokeRect(-2, -2, 50, 46);
    const cu = g.createLinearGradient(0, 0, 0, 42); cu.addColorStop(0, "#f2a86a"); cu.addColorStop(1, "#f6d79a"); g.fillStyle = cu; g.fillRect(3, 3, 40, 36);
    g.fillStyle = "#6d4e8f"; g.beginPath(); g.moveTo(3, 39); g.lineTo(18, 16); g.lineTo(28, 28); g.lineTo(34, 20); g.lineTo(43, 39); g.closePath(); g.fill(); g.restore();
    // plantita en la balda
    g.save(); g.translate(520, 74); g.fillStyle = "#c2683d"; g.beginPath(); g.moveTo(-10, 0); g.lineTo(10, 0); g.lineTo(13, -16); g.lineTo(-13, -16); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.stroke();
    g.fillStyle = "#4f9a5a"; for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.42; g.save(); g.translate(0, -16); g.rotate(a + Math.PI / 2); g.beginPath(); g.ellipse(0, -14, 4.5, 13, 0, 0, TAU); g.fill(); g.stroke(); g.restore(); }
    g.restore();
    // rodapié y suelo de tarima
    g.fillStyle = "#e3d8c2"; g.fillRect(-60, 450, W + 120, 20); g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(-60, 468, W + 120, 3);
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(-60, 450); g.lineTo(W + 60, 450); g.stroke();
    const su = g.createLinearGradient(0, 470, 0, H + 60); su.addColorStop(0, "#6e4227"); su.addColorStop(1, "#8f5a35");
    g.fillStyle = su; g.fillRect(-60, 470, W + 120, H - 410);
    g.strokeStyle = "rgba(40,20,8,0.35)"; g.lineWidth = 1.5;
    for (let i = -14; i <= 14; i++) { g.beginPath(); g.moveTo(512 + i * 34, 470); g.lineTo(512 + i * 92, H + 60); g.stroke(); }
    for (const y of [492, 522, 562, 612]) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    // alfombra (perspectiva) con cenefa y flecos
    const RA = [{ x: 140, y: 500 }, { x: 884, y: 500 }, { x: 1010, y: 660 }, { x: 14, y: 660 }];
    const rutaR = (k) => { const c0 = { x: 512, y: 580 }; g.beginPath(); RA.forEach((q, i) => { const x = lerp(c0.x, q.x, k), y = lerp(c0.y, q.y, k); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); };
    g.fillStyle = "#e7d7b8"; rutaR(1); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.strokeStyle = "#b5533a"; g.lineWidth = 9; rutaR(0.9); g.stroke();
    g.strokeStyle = "#2f3e66"; g.lineWidth = 3; rutaR(0.82); g.stroke(); rutaR(0.95); g.stroke();
    g.fillStyle = "rgba(181,83,58,0.5)";
    for (let i = 0; i < 9; i++) { const x = lerp(260, 764, i / 8), y = 552; g.save(); g.translate(x, y + (i % 2) * 18); g.scale(1, 0.45); g.rotate(Math.PI / 4); g.fillRect(-7, -7, 14, 14); g.restore(); }
    g.strokeStyle = "#d8c7a4"; g.lineWidth = 2; for (let x = 146; x < 880; x += 7) { g.beginPath(); g.moveTo(x, 500); g.lineTo(x - 1, 493); g.stroke(); }
    // lámpara de pie (izquierda)
    g.save(); g.fillStyle = "#3a2f28"; g.beginPath(); g.ellipse(104, 560, 34, 9, 0, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.strokeStyle = "#c9a45a"; g.lineWidth = 6; g.beginPath(); g.moveTo(104, 556); g.lineTo(104, 180); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 1.5; g.beginPath(); g.moveTo(101, 556); g.lineTo(101, 180); g.moveTo(107, 556); g.lineTo(107, 180); g.stroke();
    const pan = g.createLinearGradient(0, 108, 0, 186); pan.addColorStop(0, "#fff2cf"); pan.addColorStop(1, "#ffd99a");
    g.fillStyle = pan; g.beginPath(); g.moveTo(70, 108); g.lineTo(138, 108); g.lineTo(162, 186); g.lineTo(46, 186); g.closePath(); g.fill(); g.lineWidth = 2.4; g.stroke();
    g.strokeStyle = "rgba(160,110,50,0.35)"; g.lineWidth = 1.5; for (let k = 1; k < 6; k++) { g.beginPath(); g.moveTo(70 + k * 11.3, 110); g.lineTo(46 + k * 19.3, 184); g.stroke(); }
    g.restore();
    // mesita redonda con planta y taza (derecha)
    g.save();
    g.fillStyle = "#5a3a22"; g.fillRect(926, 432, 10, 118); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(926, 432, 10, 118);
    g.beginPath(); g.ellipse(931, 552, 30, 8, 0, 0, TAU); g.fillStyle = "#4a2f1b"; g.fill(); g.stroke();
    g.beginPath(); g.ellipse(931, 430, 62, 15, 0, 0, TAU); g.fillStyle = "#8a5a33"; g.fill(); g.stroke();
    g.fillStyle = "#6e4628"; g.fillRect(869, 430, 124, 8); g.strokeRect(869, 430, 124, 8);
    g.beginPath(); g.ellipse(931, 430, 62, 15, 0, 0, TAU); g.fillStyle = "#9c6a3f"; g.fill(); g.stroke();
    // maceta y hojas grandes
    g.fillStyle = "#e7e0d2"; g.beginPath(); g.moveTo(905, 428); g.lineTo(951, 428); g.lineTo(946, 392); g.lineTo(910, 392); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#3f8a52";
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.33; g.save(); g.translate(928, 392); g.rotate(a + Math.PI / 2);
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(14, -30, 0, -58 - (i % 3) * 10); g.quadraticCurveTo(-14, -30, 0, 0); g.fill(); g.lineWidth = 1.8; g.stroke();
      g.strokeStyle = "rgba(255,255,255,0.25)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, -4); g.lineTo(0, -50); g.stroke(); g.strokeStyle = TINTA; g.restore(); }
    // taza
    g.fillStyle = "#e85d4a"; g.beginPath(); g.roundRect(964, 408, 18, 20, 3); g.fill(); g.lineWidth = 1.8; g.stroke();
    g.beginPath(); g.arc(984, 417, 5, -Math.PI / 2, Math.PI / 2); g.stroke();
    g.restore();
    // sofá: respaldo, cojines del respaldo, brazos y base
    const SO = "#b9552c", SO_OSC = "#8c3c1d", SO_LUZ = "#d26c3d";
    g.save();
    // respaldo
    g.fillStyle = SO_OSC; g.beginPath(); g.moveTo(214, 470); g.lineTo(214, 316); g.quadraticCurveTo(214, SOFA.alto, 246, SOFA.alto); g.lineTo(778, SOFA.alto);
    g.quadraticCurveTo(810, SOFA.alto, 810, 316); g.lineTo(810, 470); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2.6; g.stroke();
    // cojines del respaldo
    for (const [x0, x1] of [[262, 514], [510, 762]]) {
      const cj = g.createLinearGradient(0, 298, 0, 450); cj.addColorStop(0, SO_LUZ); cj.addColorStop(1, SO);
      g.fillStyle = cj; g.beginPath(); g.moveTo(x0 + 18, 300); g.quadraticCurveTo((x0 + x1) / 2, 292, x1 - 18, 300); g.quadraticCurveTo(x1, 302, x1 - 2, 322);
      g.lineTo(x1 - 4, 446); g.lineTo(x0 + 4, 446); g.lineTo(x0 + 2, 322); g.quadraticCurveTo(x0, 302, x0 + 18, 300); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = "rgba(90,30,10,0.35)"; g.lineWidth = 3; g.beginPath(); g.moveTo(x0 + 30, 318); g.quadraticCurveTo((x0 + x1) / 2, 330, x1 - 30, 318); g.stroke();
      g.fillStyle = "rgba(255,210,170,0.18)"; g.beginPath(); g.ellipse((x0 + x1) / 2 - 30, 330, 70, 14, -0.05, 0, TAU); g.fill();
      g.strokeStyle = TINTA; g.lineWidth = 2.6;
    }
    // cojines sueltos en las esquinas (mostaza con pompones; verde con rayas)
    g.save(); g.translate(300, 398); g.rotate(-0.2); g.fillStyle = "#e0ac3e"; g.beginPath(); g.roundRect(-38, -44, 76, 86, 18); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.35)"; for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { g.beginPath(); g.arc(i * 20, j * 22, 3.2, 0, TAU); g.fill(); }
    g.restore();
    g.save(); g.translate(722, 398); g.rotate(0.18); g.fillStyle = "#3f8a7e"; g.beginPath(); g.roundRect(-36, -42, 72, 82, 18); g.fill(); g.stroke();
    g.save(); g.beginPath(); g.roundRect(-36, -42, 72, 82, 18); g.clip(); g.fillStyle = "rgba(240,230,200,0.55)"; for (let x = -34; x < 36; x += 16) g.fillRect(x, -44, 6, 90); g.restore();
    g.restore();
    // brazos
    for (const [x0, x1, s] of [[190, 268, 1], [756, 834, -1]]) {
      const br = g.createLinearGradient(x0, 0, x1, 0); br.addColorStop(0, s > 0 ? SO_OSC : SO); br.addColorStop(1, s > 0 ? SO : SO_OSC);
      g.fillStyle = br; g.beginPath(); g.moveTo(x0 + 4, 522); g.lineTo(x0, 372); g.quadraticCurveTo(x0, SOFA.brazo - 8, (x0 + x1) / 2, SOFA.brazo - 10);
      g.quadraticCurveTo(x1, SOFA.brazo - 8, x1, 372); g.lineTo(x1 - 4, 522); g.closePath(); g.fill(); g.stroke();
      // voluta del brazo
      g.fillStyle = SO_LUZ; g.beginPath(); g.ellipse((x0 + x1) / 2, SOFA.brazo + 12, 30, 18, 0, 0, TAU); g.fill(); g.stroke();
      g.strokeStyle = "rgba(90,30,10,0.5)"; g.lineWidth = 2.2; g.beginPath(); g.ellipse((x0 + x1) / 2, SOFA.brazo + 12, 16, 9, 0, 0, TAU); g.stroke();
      g.strokeStyle = TINTA; g.lineWidth = 2.6;
    }
    // base bajo los cojines del asiento y patas
    g.fillStyle = SO_OSC; g.beginPath(); g.rect(SOFA.cojin0 - 4, SOFA.base - 4, SOFA.cojin1 - SOFA.cojin0 + 8, 36); g.fill(); g.stroke();
    g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(SOFA.cojin0 - 2, SOFA.base + 18, SOFA.cojin1 - SOFA.cojin0 + 4, 12);
    g.fillStyle = "#3a2414";
    for (const x of [214, 266, 758, 810]) { g.beginPath(); g.moveTo(x - 6, 522); g.lineTo(x + 6, 522); g.lineTo(x + 3, SOFA.pata); g.lineTo(x - 3, SOFA.pata); g.closePath(); g.fill(); g.stroke(); }
    // sombra del sofá en el suelo
    g.restore();
    g.fillStyle = "rgba(20,8,4,0.28)"; g.beginPath(); g.ellipse(512, 536, 330, 9, 0, 0, TAU); g.fill();
    return c;
  }

  /* ---------- cojines del asiento (se hunden con lo que tengan encima) ---------- */
  function cojines(g, t, pg, pd) {
    const SO = "#b9552c", SO_OSC = "#8c3c1d", SO_LUZ = "#d77445";
    // hundimientos: [x, ancho, profundidad]
    const hund = [];
    const gSent = 1 - tramo(t, T.resbala + 0.2, T.cae + 0.15);
    if (gSent > 0) hund.push([pg.M.W.x - 8, 70, 9 * gSent + 4 * gSent * risaG(t) * Math.abs(Math.sin(t * 15.5))]);
    const ku = rodillasD(t);
    hund.push([pd.x - 10 * (1 - ku), 70 * (1 - ku) + 40, lerp(9, 6, ku)]);
    if (ku > 0.05) hund.push([pd.x + 20, 60, 4 * ku]);
    const dy = x => { let d = 0; for (const [cx, w, p] of hund) { const u = (x - cx) / w; if (Math.abs(u) < 1) d += p * (1 + Math.cos(Math.PI * u)) / 2; } return d; };
    for (const [x0, x1] of [[SOFA.cojin0, 512], [512, SOFA.cojin1]]) {
      g.save(); g.lineJoin = "round";
      // cara de arriba (ondulada por los hundimientos) y frente
      const top = []; for (let x = x0 + 4; x <= x1 - 4; x += 8) top.push({ x, y: COJIN - 10 + dy(x) * 0.6 });
      const front = []; for (let x = x0; x <= x1; x += 8) front.push({ x, y: COJIN + 2 + dy(x) });
      g.beginPath(); g.moveTo(x0 + 6, COJIN - 6);
      for (const q of top) g.lineTo(q.x, q.y);
      g.quadraticCurveTo(x1 + 2, COJIN - 6, x1, COJIN + 6); g.lineTo(x1 - 2, SOFA.base + 2); g.lineTo(x0 + 2, SOFA.base + 2); g.lineTo(x0, COJIN + 6);
      g.quadraticCurveTo(x0 - 2, COJIN - 6, x0 + 6, COJIN - 6); g.closePath();
      const gr = g.createLinearGradient(0, COJIN - 12, 0, SOFA.base); gr.addColorStop(0, SO_LUZ); gr.addColorStop(0.3, SO); gr.addColorStop(1, SO_OSC);
      g.fillStyle = gr; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2.6; g.stroke();
      // ribete entre la cara de arriba y el frente
      g.beginPath(); front.forEach((q, i) => (i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)));
      g.strokeStyle = "rgba(70,22,8,0.55)"; g.lineWidth = 3; g.stroke();
      g.strokeStyle = "rgba(255,190,150,0.35)"; g.lineWidth = 1.6; g.beginPath(); front.forEach((q, i) => (i ? g.lineTo(q.x, q.y - 3) : g.moveTo(q.x, q.y - 3))); g.stroke();
      g.restore();
    }
  }

  /* ---------- efectos ---------- */
  // rayitas de susto alrededor de un punto
  function susto(g, t, t0, c, r0, n = 9) {
    const k = fase(t, t0, t0 + 0.35); if (k <= 0 || k >= 1) return;
    g.save(); g.strokeStyle = TINTA; g.lineCap = "round"; g.lineWidth = 3.2; g.globalAlpha = clamp(k / 0.2) * (1 - k * k);
    for (let i = 0; i < n; i++) { const a = -Math.PI * 0.95 + i * Math.PI * 0.9 / (n - 1) * 1.05, r = r0 + 22 * salida(k), L = 14 * (1 - 0.4 * k);
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r); g.lineTo(c.x + Math.cos(a) * (r + L), c.y + Math.sin(a) * (r + L)); g.stroke(); }
    g.restore();
  }
  // arcos de risa a los lados de la cabeza
  function arcosRisa(g, t, c, r, k) {
    if (k < 0.02) return;
    g.save(); g.strokeStyle = TINTA; g.lineCap = "round"; g.lineWidth = 3;
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) {
      const ph = (t * 3.1 + i * 0.5) % 1, rr = r + 8 + 18 * ph;
      g.globalAlpha = k * Math.sin(Math.PI * ph);
      g.beginPath(); g.arc(c.x, c.y, rr, s > 0 ? -0.5 : Math.PI - 0.35, s > 0 ? 0.35 : Math.PI + 0.5); g.stroke();
    }
    g.restore();
  }
  // rayitas que vibran junto a los dedos que se menean
  function vibra(g, t, q, k) {
    if (k < 0.02) return;
    g.save(); g.strokeStyle = TINTA; g.lineCap = "round"; g.lineWidth = 2.2; g.globalAlpha = 0.85 * k;
    for (const s of [-1, 1]) { const o = 3 * Math.sin(t * 40 + s); g.beginPath(); g.arc(q.x + s * (18 + o), q.y - 6, 7, s > 0 ? -0.9 : Math.PI - 0.9, s > 0 ? 0.9 : Math.PI + 0.9); g.stroke(); }
    g.restore();
  }
  // lágrimas de risa: salen de las esquinas de los ojos (calculadas en el instante en que salen)
  const LAGRIMAS = [];
  (() => { let i = 0; for (let tt = T.contacto + 0.05; tt < T.calma + 0.2; tt += 0.075, i++) LAGRIMAS.push({ t0: tt, lado: i % 2, sem: i }); })();
  const memo = new Map();
  function salidaLagrima(L) {
    if (memo.has(L.sem)) return memo.get(L.sem);
    const p = poseG(L.t0), H = G.cabeza(p);
    const ojo = L.lado ? [{ x: 924, y: 612 }, { x: 990, y: 600 }] : [{ x: 731, y: 556 }, { x: 670, y: 540 }];
    const a = pantG(p, H.a(ojo[0])), b = pantG(p, H.a(ojo[1]));
    const d = { x: b.x - a.x, y: b.y - a.y }, n = Math.hypot(d.x, d.y) || 1;
    const v = 130 + 90 * hash(L.sem * 3.1);
    const r = { p: a, v: { x: d.x / n * v, y: d.y / n * v - 150 - 80 * hash(L.sem * 7.7) } };
    memo.set(L.sem, r); return r;
  }
  function lagrimas(g, t) {
    g.save();
    for (const L of LAGRIMAS) {
      const v = t - L.t0; if (v < 0 || v > 0.62) continue;
      const s = salidaLagrima(L), x = s.p.x + s.v.x * v, y = s.p.y + s.v.y * v + 0.5 * 900 * v * v;
      const r = 4.2 * (1 - 0.35 * v), a = Math.atan2(s.v.y + 900 * v, s.v.x);
      g.globalAlpha = clamp((0.62 - v) / 0.15);
      g.save(); g.translate(x, y); g.rotate(a - Math.PI / 2);
      g.beginPath(); g.moveTo(0, -r * 2.2); g.quadraticCurveTo(r * 1.1, -r * 0.2, 0, r); g.quadraticCurveTo(-r * 1.1, -r * 0.2, 0, -r * 2.2);
      g.fillStyle = "#a9dcff"; g.fill(); g.strokeStyle = "#1d3b52"; g.lineWidth = 1.4; g.stroke();
      g.fillStyle = "#fff"; g.beginPath(); g.arc(-r * 0.3, -r * 0.2, r * 0.3, 0, TAU); g.fill();
      g.restore();
    }
    g.restore();
  }
  // polvo (nubecitas que crecen y se desvanecen)
  function polvo(g, t, t0, x, y, n, ancho, dur = 0.9) {
    const v = t - t0; if (v < 0 || v > dur) return;
    g.save();
    for (let i = 0; i < n; i++) {
      const h = hash(i * 13.7 + t0), s = (i / (n - 1) - 0.5) * 2, k = v / dur;
      const px = x + s * ancho * (0.4 + 0.8 * salida(k)), py = y - 6 - 20 * salida(k) * (0.5 + h), r = (8 + 10 * h) * (0.6 + 0.8 * salida(k));
      g.globalAlpha = 0.5 * (1 - k); g.fillStyle = "#efe3cc"; g.beginPath(); g.arc(px, py, r, 0, TAU); g.fill();
    }
    g.restore();
  }
  function velocidad(g, x, y, k) {
    if (k < 0.02) return;
    g.save(); g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineCap = "round";
    for (let i = 0; i < 7; i++) { const yy = y - 150 + i * 46 + 10 * hash(i + 3), L = 50 + 50 * hash(i + 9);
      g.globalAlpha = k * (0.5 + 0.5 * hash(i + 5)); g.lineWidth = 3; g.beginPath(); g.moveTo(x + 40 + 20 * hash(i), yy); g.lineTo(x + 40 + L, yy); g.stroke(); }
    g.restore();
  }

  /* ---------- luz: noche, lámpara cálida y la tele ---------- */
  function luces(g, t) {
    const tv = tele(t);
    g.save();
    g.globalCompositeOperation = "multiply";
    const gr = g.createRadialGradient(104, 160, 30, 360, 300, 1050);
    gr.addColorStop(0, "rgb(255,246,226)"); gr.addColorStop(0.45, "rgb(230,220,216)"); gr.addColorStop(1, "rgb(140,142,176)");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = "lighter";
    const c = tv.col.map(v => Math.round(v));
    const tg = g.createRadialGradient(512, 800, 120, 512, 760, 720);
    tg.addColorStop(0, `rgba(${c},${0.2 * tv.b})`); tg.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = tg; g.fillRect(0, 0, W, H);
    const la = g.createRadialGradient(104, 150, 10, 104, 150, 230);
    la.addColorStop(0, "rgba(255,200,120,0.32)"); la.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = la; g.fillRect(0, 0, 340, 400);
    g.restore();
  }

  function camara(t) {
    const z = dentro(t, T.picaro - 0.05, T.picaro + 0.45, T.carga - 0.12, T.salta + 0.08);
    const izq = dentro(t, T.cae - 0.1, T.suelo + 0.3, T.levanta, T.dePie + 0.2);     // en el suelo, la cámara se va un poco a la izquierda
    return { k: 1 + 0.13 * z, x: lerp(512, 590, z) - 40 * izq, y: lerp(300, 255, z) };
  }

  function dibujaG(g, pg, t) {
    const M = pg.M;
    g.save(); g.translate(M.W.x, M.W.y); g.rotate(M.phi); g.scale(M.sx, 1); g.translate(-M.o.x, -M.o.y);
    G.dibujar(g, pg, t);
    g.restore();
  }
  // mando: en la mano, volando y en la alfombra
  const MANDO_FIN = { x: 676, y: 584, a: 0.22 };
  let mandoSale = null;
  function mando(t) {
    if (!mandoSale) {
      const p = poseG(T.bote1 + 0.02), m = p.manoLejos, c = pantG(p, { x: m.x, y: m.y });
      mandoSale = { x: c.x, y: c.y };
    }
    const k = fase(t, T.bote1 + 0.02, T.bote1 + 0.62);
    const x = lerp(mandoSale.x, MANDO_FIN.x, k), y = lerp(mandoSale.y, MANDO_FIN.y, k) - 230 * Math.sin(Math.PI * k) * (1 - 0.3 * k);
    const v = t - (T.bote1 + 0.62), bote = v > 0 ? 10 * Math.exp(-v * 9) * Math.abs(Math.sin(v * 14)) : 0;
    return { x, y: y - bote, a: lerp(-0.3, MANDO_FIN.a + TAU * 2, salida(k)) };
  }

  class Cosquillas extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !DV.listo()) return;
      if (!fondo) fondo = creaFondo();
      const P = pose(t), pg = P.g, pd = P.d;
      const luz = tramo(t, NEGRO_INICIO, 0.85) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      g.drawImage(fondo, -60, -60);
      // sombras en la alfombra
      g.save(); g.fillStyle = "rgba(20,8,4,0.25)";
      const enSofa = t < T.cae + 0.1;
      g.beginPath(); g.ellipse(pd.x - 70 * (1 - rodillasD(t)), SUELO_S + 2, 70, 6, 0, 0, TAU); g.fill();
      if (enSofa) { g.beginPath(); g.ellipse(XG + 75, SUELO_S + 2, 70, 6, 0, 0, TAU); g.fill(); }
      else if (t < T.fuera) { const x = pg.M.W.x; g.beginPath(); g.ellipse(x - 40, SUELO_F + 3, 150 * (1 - tramo(t, T.incorpora, T.dePie)) + 70, 8, 0, 0, TAU); g.fill(); }
      g.restore();
      cojines(g, t, pg, pd);
      // mando en la alfombra (o volando)
      const enAire = t >= T.bote1 + 0.02;
      if (enAire) { const m = mando(t); g.save(); g.fillStyle = "rgba(20,8,4,0.3)"; g.beginPath(); g.ellipse(m.x, MANDO_FIN.y + 8, 22 * clamp(1 - (MANDO_FIN.y - m.y) / 300), 4, 0, 0, TAU); g.fill();
        g.translate(m.x, m.y); g.rotate(m.a); dibMando(g); g.restore(); }
      // orden: sentados, Guillermo detrás (Deivi le alcanza con la mano); en el suelo, Guillermo delante
      const gDelante = t >= T.cae - 0.04;
      if (!gDelante) dibujaG(g, pg, t);
      DV.dibujar(g, pd, t);
      if (gDelante) { polvo(g, t, T.suelo, pg.M.W.x - 60, SUELO_F, 7, 120); dibujaG(g, pg, t); }
      // efectos
      const cabG = pantG(pg, G.centroCabeza(pg)), torG = pantG(pg, G.tronco(pg)({ x: 250, y: 480 }));
      susto(g, t, T.bote1, torG, 95, 11);
      susto(g, t, T.bote2, torG, 85, 7);
      arcosRisa(g, t, cabG, 70, risaG(t) * (t > T.contacto - 0.1 ? 1 : 0.6));
      lagrimas(g, t);
      // dedos que se menean
      const meneaK = Math.max(dentro(t, T.menea - 0.1, T.menea + 0.1, T.contacto + 0.2, T.contacto + 0.4), dentro(t, T.suelo + 0.1, T.suelo + 0.3, T.para - 0.05, T.para + 0.05));
      for (const m of [pd.manoLejos, pd.manoCerca]) vibra(g, t, DV.aPantalla(pd, m), meneaK);
      vibra(g, t, DV.aPantalla(pd, pd.manoLejos), dentro(t, T.dedo - 0.1, T.dedo + 0.1, T.fuera - 0.2, T.fuera));
      // huida: rayas de velocidad y nube de polvo
      polvo(g, t, T.corre - 0.05, XP + 10, SUELO_F + 4, 9, 70, 1.3);
      polvo(g, t, T.gira1, XP, SUELO_F + 4, 5, 40, 0.6);
      velocidad(g, pg.M.W.x, pg.M.W.y, dentro(t, T.corre, T.corre + 0.06, T.fuera - 0.1, T.fuera + 0.15));
      g.restore();
      luces(g, t);
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00068", nombre: "Guillermo y Deivi · Las cosquillas", crear: () => new Cosquillas() });
  window.__A2D_00068 = { pose, T, DUR };
})();
