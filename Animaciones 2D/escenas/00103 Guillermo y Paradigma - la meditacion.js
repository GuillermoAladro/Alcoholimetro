"use strict";
/* 00103 · Guillermo y Paradigma · La meditación
 *
 * Negro → una azotea tranquila al anochecer: cielo de morado a naranja con las primeras estrellas,
 * la ciudad recortada con ventanas encendidas, un murete de estuco, bambú en macetas de barro, una
 * guirnalda de farolillos de papel, tarima de madera, una varilla de incienso que humea y, en el
 * rincón, un «shishi-odoshi» (la caña de bambú que se llena de agua y bascula: ¡toc!). Paradigma
 * medita sentado con las piernas cruzadas, las manos en las rodillas (el pulgar y el índice en
 * círculo), los ojos cerrados, flotando un palmo por encima de su cojín entre un halo dorado.
 * Guillermo, de pie junto a su cojín, alucina; mira a cámara, se sienta… y se lía: se agarra a la
 * idea de ponerse el pie detrás de la cabeza, el pie se le queda allí enganchado, bracea como un
 * molino, se tambalea y se cae de lado (¡pum!, polvo, ¡toc!). Se levanta de un rebote y lo intenta
 * otra vez: manos en las rodillas, ojos cerrados… una mosca le ronda la cabeza; le tiembla un ojo,
 * otro tic… y le suelta un manotazo enorme: falla, la mosca se va (rebota en el halo de Paradigma
 * y se marcha) y Guillermo se va de espaldas y se queda meciéndose sobre el cojín con las piernas
 * en el aire. Vuelve a sentarse, resopla, decidido, y por fin se queda quieto: respira despacio,
 * sonríe en paz… y se duerme: cabecea y le sale un globo de moco que crece y mengua con cada
 * ronquido. Paradigma abre un ojo, le mira y sonríe; mira a cámara. ¡Toc!: el globo revienta y
 * Guillermo se despierta de golpe; mira a cámara con cara de «no estaba dormido» → negro.
 *
 * Sin textos (el ronquido es el globo de moco, sin zetas). Las piernas cruzadas no caben en la IK de
 * las piernas del muñeco (rodilla siempre hacia delante): la escena dibuja ella misma las piernas
 * con las mismas tiras y zapatillas del avatar (cadera → rodilla → tobillo puestos a mano, con el
 * muslo y la espinilla en escorzo) y, mientras dibuja al muñeco, le pide a Recortes que se salte
 * sus piernas (se restaura en el mismo fotograma; no se toca ningún archivo del muñeco). Los
 * vuelcos de Guillermo giran todo su dibujo alrededor de un punto del cojín (nunca una vuelta
 * entera). Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, ruido, hash } = M2;
  const G = Guillermo, P = Paradigma, R = Recortes;
  const S = 0.36, SUELO = 522, DUR = 14.6;
  const XG = 330, XP = 708;                        // pelvis de Guillermo y Paradigma (pantalla)
  const T = {
    // Guillermo mira y se sienta
    mira: 0.55, ooh: 0.9, camara1: 1.4, asiente: 1.62, sienta0: 1.85, sienta1: 2.4,
    // primer intento: el pie detrás de la cabeza
    pie0: 2.55, pie1: 3.05, molino0: 3.15, molino1: 3.85, cae0: 3.85, cae1: 4.18,
    tumbado: 4.25, miraCam2: 4.55, rebote0: 5.0, rebote1: 5.38,
    // segundo intento: la mosca
    manos2: 5.45, cierra2: 5.75, mosca0: 5.9, tic1: 6.35, tic2: 6.75, abre2: 6.95, mano0: 7.0, mano1: 7.22,
    vuelca0: 7.22, vuelca1: 7.5, mece1: 8.35, sube0: 8.4, sube1: 8.8,
    // tercer intento: se duerme
    resopla: 8.95, manos3: 9.2, cierra3: 9.45, calma: 9.9, cabecea: 10.4, globo0: 10.55,
    // Paradigma abre un ojo; ¡toc! y el globo revienta
    ojoP: 11.35, sonrieP: 11.6, camP: 12.2, toc: 12.82, pop: 12.9, despierta: 12.95, camG: 13.35,
    fin: 13.95
  };
  const TOCS = [2.05, T.cae1 + 0.02, 7.55, 10.6, T.toc];   // la caña de bambú bascula

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const D5 = (pu, ix, md, an, me) => ({ pulgar: pu, indice: ix, medio: md, anular: an, menique: me });
  const D = (pu, ix, md, re) => D5(pu, ix, md, re, re);
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const rota = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const mz = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });
  const TINTA = "#1a120c";
  const MUDRA = D5(0.45, 0.04, 1, 0.95, 0.95);      // pulgar e índice en círculo, los otros tres estirados

  /* ---------- manos ---------- */
  const R_M = G.MUNECA_R * G.JK;
  const BOLS_G = { c: { x: 131 - Math.cos(-1.75) * R_M, y: 652 - Math.sin(-1.75) * R_M }, l: { x: 372 - Math.cos(-1.75) * R_M, y: 648 - Math.sin(-1.75) * R_M } };
  function bolsillo(Rg, p, lado) {
    if (Rg === G) return G.tronco(p)(lado === "cerca" ? BOLS_G.c : BOLS_G.l);
    const m = Rg.manoReposo(p, lado); return { x: m.x, y: m.y };
  }
  // objetivo: { bols } | { tr: punto del tronco (hoja) } | { hoja: () => punto de la hoja }
  function resolutor(Rg, p, lado) {
    return o => {
      if (o.bols) { const b = bolsillo(Rg, p, lado);
        return { x: b.x, y: b.y, mu: -1.75, ang: 0, puno: o.sale ? 1 : 0, dedos: o.dedos || D(0.4, 0.4, 0.4, 0.4), dobla: lado === "cerca" ? -1 : 1 }; }
      const q = o.tr ? Rg.tronco(p)(o.tr) : o.hoja();
      return { x: q.x, y: q.y, mu: o.mu, ang: o.ang || 0, puno: o.puno ?? 1, dedos: o.dedos || D(0.35, 0.35, 0.35, 0.35), dobla: o.dobla ?? (lado === "cerca" ? -1 : 1) };
    };
  }
  function pista(lista, t, resuelve) {
    let c = resuelve(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)), d = resuelve(obj);
      c = { x: lerp(c.x, d.x, k), y: lerp(c.y, d.y, k), mu: lerp(c.mu, d.mu, k), ang: lerp(c.ang, d.ang, k), puno: lerp(c.puno, d.puno, k),
        dedos: DD(c.dedos, d.dedos, k), dobla: k < 0.5 ? c.dobla : d.dobla };
    }
    return c;
  }
  const mano = m => ({ x: m.x, y: m.y, ang: m.ang, mu: m.mu, dobla: m.dobla, puno: m.puno, dedos: m.dedos });

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, rub: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0, espiral: e.esp };
  }

  /* ================= piernas cruzadas: dibujadas por la escena =================
   * Cada pierna es la tira del avatar (pierna_cerca / pierna_lejos) curvada por cadera → rodilla →
   * tobillo (puntos de la hoja), con el muslo y la espinilla en el largo que haga falta (escorzo), y
   * su zapatilla (la lejana, al cruzar, reflejada para que apunte hacia la otra rodilla). */
  const TIRA = R.tira, PIEZA = R.pieza;
  function cadena(hip, knee, ank, L) {
    let tgt = { x: ank.x, y: ank.y }, c = null;
    const a1 = R.angDe(knee.x - hip.x, knee.y - hip.y);
    for (let it = 0; it < 5; it++) {
      const l1 = Math.max(20, Math.hypot(knee.x - hip.x, knee.y - hip.y)), l2 = Math.max(20, Math.hypot(tgt.x - knee.x, tgt.y - knee.y));
      let a2 = R.angDe(tgt.x - knee.x, tgt.y - knee.y);
      a2 = a1 + Math.atan2(Math.sin(a2 - a1), Math.cos(a2 - a1));
      const sig = (l1 + l2) / L, sj = L * l1 / (l1 + l2);
      const r = Math.min(150, 0.85 * Math.min(sj, L - sj));
      c = { raiz: hip, a1, a2, L, sj, r, estira: sig };
      const e = R.extremo(c), ex = ank.x - e.x, ey = ank.y - e.y;
      if (Math.abs(ex) + Math.abs(ey) < 0.05) break;
      tgt = { x: tgt.x + ex, y: tgt.y + ey };
    }
    c.cuna = true; c.cunaAjustada = true;
    return c;
  }
  function piernaTira(Rg, g, lado, hip, knee, ank) {
    const nom = lado === "lejos" ? "pierna_lejos" : "pierna_cerca", L = Rg.A.datos.piezas[nom].largo;
    TIRA(g, Rg.A, nom, cadena(hip, knee, ank, L), 18);
  }
  function zapatilla(Rg, g, lado, ank, ang, refleja, esc = 1) {
    const PZ = Rg.A.datos.piezas;
    g.save(); g.translate(ank.x, ank.y); g.rotate(ang); g.scale(refleja ? -esc : esc, esc);
    PIEZA(g, Rg.A, lado === "lejos" ? "zapato_lejos" : "zapato", PZ.zapato.pivote); g.restore();
  }
  // piernas de una postura: { cerca: { k, a, za, zr, ze }, lejos: {…} } (hoja; k rodilla, a tobillo)
  function dibPiernas(Rg, g, p, lados) {
    const T_ = Rg.tronco(p);
    for (const lado of lados) {
      const q = p.cruz[lado], hip = T_(Rg.CADERA[lado]);
      zapatilla(Rg, g, lado, q.a, q.za, q.zr > 0.5, q.ze);
      piernaTira(Rg, g, lado, hip, q.k, q.a);
    }
  }
  // dibuja al muñeco sin sus piernas (la escena dibuja las suyas)
  const SIN = new Set(["pierna_cerca", "pierna_lejos", "zapato", "zapato_lejos"]);
  function dibujaSinPiernas(Rg, g, p, t) {
    const A = Rg.A;
    R.tira = function (gg, AA, n) { return AA === A && SIN.has(n) ? [] : TIRA.apply(this, arguments); };
    R.pieza = function (gg, AA, n) { return AA === A && SIN.has(n) ? undefined : PIEZA.apply(this, arguments); };
    try { Rg.dibujar(g, p, t); } finally { R.tira = TIRA; R.pieza = PIEZA; }
  }
  // el marco de la hoja del personaje (para dibujar sus piernas)
  function marcoHoja(Rg, g, p) {
    const k = p.s * Rg.K;
    g.translate(p.x, p.suelo); g.scale(p.espejo ? -k : k, k); g.translate(-Rg.PELVIS.x, -Rg.SUELO);
  }
  // rodilla de una pierna de pie (la misma IK que el muñeco)
  function rodillaDePie(Rg, p, lado, tob) {
    const hip = Rg.tronco(p)(Rg.CADERA[lado]), L = Rg.A.datos.piezas[lado === "lejos" ? "pierna_lejos" : "pierna_cerca"].largo;
    const c = R.ik(hip, tob, L, L * 0.5, 80, 1, 1.03), d = R.dir(c.a1);
    return { x: hip.x + d.x * c.sj * c.estira, y: hip.y + d.y * c.sj * c.estira };
  }

  /* ================= Paradigma ================= */
  const YP = 456;                                   // pelvis de Paradigma sentado (pantalla, sin flotar)
  const PEL_P = P.SUELO + (YP - SUELO) / (S * P.K);
  const flota = t => 27 + 5 * Math.sin(t * 2.6 + 0.4) + 1.5 * Math.sin(t * 1.1);
  const CRUZ_P = {         // relativo a la pelvis (hoja)
    cerca: { k: { x: -218, y: 48 }, a: { x: -18, y: 66 }, za: -0.12, zr: 0, ze: 0.86 },
    lejos: { k: { x: 214, y: 44 }, a: { x: 34, y: 62 }, za: 0.12, zr: 1, ze: 0.86 }
  };
  const CP = {
    medita: E({ c: 1, h: 0.3, sd: 4, si: 4, sonr: 0.32, ancho: 0.95 }),
    ceja: E({ c: 1, h: 0.2, sd: 16, si: 6, gd: 0.08, sonr: 0.15, ancho: 0.9 }),
    ojo: E({ cd: 0.05, ci: 1, h: 0.2, mx: 0.95, my: 0.25, sd: 14, si: 2, gd: 0.06, sonr: 0.45, ancho: 1 }),
    sonrie: E({ cd: 0.05, ci: 1, h: 0.25, mx: 0.95, my: 0.3, sd: 16, si: 4, gd: 0.08, sonr: 0.85, ancho: 1.05 }),
    camara: E({ cd: 0.02, ci: 1, h: 0.25, mx: -0.35, my: 0.05, sd: 18, si: 6, gd: 0.1, sonr: 0.9, ancho: 1.05 })
  };
  const GUION_CP = [
    [T.cae1, T.cae1 + 0.12, "ceja"], [T.cae1 + 0.6, T.cae1 + 0.9, "medita"],
    [T.vuelca1, T.vuelca1 + 0.12, "ceja"], [T.vuelca1 + 0.7, T.vuelca1 + 1.0, "medita"],
    [T.ojoP, T.ojoP + 0.22, "ojo"], [T.sonrieP, T.sonrieP + 0.3, "sonrie"], [T.camP, T.camP + 0.25, "camara"]
  ];
  function poseP(t) {
    const respira = Math.sin(t * 1.6);
    const p = { x: XP, suelo: SUELO - flota(t), s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: P.PELVIS.x, y: PEL_P + respira * 1.5 }, torso: -0.02, torsoEsc: { x: 1, y: 0.86 + respira * 0.006 },
      piernas: { cerca: { tob: { x: 200, y: 1262 }, ang: 0 }, lejos: { tob: { x: 330, y: 1262 }, ang: 0 } },
      cabeza: { ang: 0.04 + 0.02 * Math.sin(t * 0.9), dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    // se le escapa la mirada hacia Guillermo y luego a cámara
    p.cabeza.ang += 0.05 * tramo(t, T.ojoP, T.ojoP + 0.3) - 0.07 * tramo(t, T.camP, T.camP + 0.3);
    // al «toc» final, un respingo mínimo
    if (t > T.toc) { const u = t - T.toc; p.cabeza.dy += -10 * Math.sin(u * 16) * Math.exp(-u * 8); }
    const pv = p.pelvis;
    p.cruz = {};
    for (const lado of ["cerca", "lejos"]) {
      const q = CRUZ_P[lado];
      p.cruz[lado] = { k: { x: pv.x + q.k.x, y: pv.y + q.k.y }, a: { x: pv.x + q.a.x, y: pv.y + q.a.y }, za: q.za, zr: q.zr, ze: q.ze };
    }
    const e = linea(GUION_CP, CP, "medita", t);
    p.cara = cara(e, 0);
    // las manos en las rodillas (mudra), quietas con la respiración
    const res = resolutor(P, p, "cerca"), resL = resolutor(P, p, "lejos");
    const kC = p.cruz.cerca.k, kL = p.cruz.lejos.k;
    const C = res({ hoja: () => ({ x: kC.x + 18, y: kC.y - 62 }), mu: -1.2, dedos: MUDRA, dobla: -1 });
    const L = resL({ hoja: () => ({ x: kL.x - 14, y: kL.y - 64 }), mu: -1.95, dedos: MUDRA, dobla: 1 });
    p.manoCerca = mano(C); p.manoLejos = mano(L);
    return p;
  }

  /* ================= Guillermo ================= */
  const YG = 472;                                    // pelvis sentado (pantalla)
  const PEL_G_PIE = G.PELVIS.y, PEL_G_SENT = G.SUELO + (YG - SUELO) / S;
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const aHojaG = sx => G.PELVIS.x + (sx - XG) / S;
  // tobillos de pie (absolutos, hoja)
  const PIE = { cerca: { x: aHojaG(XG - 30), y: TOB_G }, lejos: { x: aHojaG(XG + 34), y: TOB_G } };
  const PIE_SENT = { cerca: { x: aHojaG(XG + 58), y: TOB_G - 6 }, lejos: { x: aHojaG(XG + 92), y: TOB_G - 10 } };
  // posturas de piernas (relativas a la pelvis, hoja)
  const CRUZ_G = {
    cerca: { k: { x: -205, y: 52 }, a: { x: -14, y: 70 }, za: -0.12, zr: 0, ze: 0.86 },
    lejos: { k: { x: 202, y: 48 }, a: { x: 36, y: 66 }, za: 0.12, zr: 1, ze: 0.86 }
  };
  const NUDO_G = {          // el pie cercano detrás de la cabeza, el otro cruzado debajo
    cerca: { k: { x: -262, y: -170 }, a: { x: -78, y: -430 }, za: -1.75, zr: 0, ze: 0.86 },
    lejos: { k: { x: 196, y: 52 }, a: { x: 20, y: 70 }, za: 0.12, zr: 1, ze: 0.86 }
  };
  const ESC_SENT = 0.86;
  const CUER_G = {
    pie: { pel: 0, sent: 0, torso: 0, esc: 1, cab: 0, cdy: 0 },
    mira: { pel: 0, sent: 0, torso: 0.03, esc: 1, cab: 0.04, cdy: 0 },
    asiente: { pel: 6, sent: 0, torso: 0.05, esc: 1, cab: 0.1, cdy: 4 },
    agacha: { pel: 0, sent: 0.55, torso: 0.18, esc: 0.93, cab: 0.06, cdy: 0 },
    sentado: { pel: 0, sent: 1, torso: 0.05, esc: ESC_SENT, cab: 0, cdy: 0 },
    tira: { pel: 0, sent: 1, torso: -0.12, esc: ESC_SENT, cab: -0.1, cdy: 0 },
    nudo: { pel: 0, sent: 1, torso: 0.02, esc: ESC_SENT, cab: 0.08, cdy: 6 },
    medita: { pel: 0, sent: 1, torso: 0.0, esc: ESC_SENT, cab: 0.02, cdy: 0 },
    manotazo: { pel: 0, sent: 1, torso: -0.14, esc: ESC_SENT, cab: -0.12, cdy: 0 },
    resopla: { pel: 0, sent: 1, torso: 0.06, esc: ESC_SENT, cab: 0.1, cdy: 4 },
    dormido: { pel: 0, sent: 1, torso: 0.09, esc: ESC_SENT - 0.02, cab: 0.2, cdy: 18 },
    despierta: { pel: 0, sent: 1, torso: -0.05, esc: ESC_SENT + 0.03, cab: -0.08, cdy: -10 },
    camara: { pel: 0, sent: 1, torso: 0.0, esc: ESC_SENT, cab: -0.04, cdy: 0 }
  };
  const GUION_G = [
    [T.mira - 0.1, T.mira + 0.2, "mira"], [T.asiente, T.asiente + 0.12, "asiente"], [T.asiente + 0.14, T.sienta0, "mira"],
    [T.sienta0, T.sienta0 + 0.3, "agacha"], [T.sienta0 + 0.3, T.sienta1, "sentado", salida],
    [T.pie0, T.pie0 + 0.25, "tira"], [T.pie1 - 0.1, T.pie1 + 0.1, "nudo"],
    [T.rebote1, T.rebote1 + 0.2, "medita"],
    [T.mano0 - 0.05, T.mano0 + 0.08, "manotazo"], [T.sube1, T.sube1 + 0.15, "medita"],
    [T.resopla, T.resopla + 0.15, "resopla"], [T.resopla + 0.25, T.manos3 + 0.15, "medita"],
    [T.cabecea, T.cabecea + 0.9, "dormido", x => x], [T.despierta, T.despierta + 0.08, "despierta"], [T.camG, T.camG + 0.3, "camara"]
  ];
  // vuelcos: giro de todo el dibujo alrededor de un punto (pantalla)
  function vuelco(t) {
    // de lado: se tambalea, cae y se queda tumbado; rebota de vuelta
    let a = 0, dx = 0, dy = 0;
    const tamb = campana(t, T.molino0 - 0.1, T.cae0 + 0.05);
    a += 0.12 * Math.sin((t - T.molino0) * 9) * tamb;
    const cae = tramo(t, T.cae0, T.cae1, entrada) * (1 - tramo(t, T.rebote0, T.rebote1, salida));
    a += -1.36 * cae;
    if (t > T.cae1 && t < T.rebote0) { const u = t - T.cae1; a += 0.09 * Math.sin(u * 22) * Math.exp(-u * 9); }
    dy += 22 * cae; dx += -8 * cae;
    // el rebote: sube con un salto
    const reb = fase(t, T.rebote0, T.rebote1);
    if (reb > 0 && reb < 1) dy -= 40 * Math.sin(Math.PI * reb);
    if (t > T.rebote1) { const u = t - T.rebote1; a += 0.08 * Math.sin(u * 18) * Math.exp(-u * 8); }
    let piv = { x: XG - 38, y: 500 };
    // de espaldas: se mece sobre el cojín con las piernas en el aire
    const atr = tramo(t, T.vuelca0, T.vuelca1, entrada) * (1 - tramo(t, T.sube0, T.sube1, salida));
    if (atr > 0) {
      const u = Math.max(0, t - T.vuelca1);
      const mece = 0.24 * Math.sin(u * 8.5) * Math.exp(-u * 2.6);
      a += (-0.82 + mece) * atr;
      piv = mz(piv, { x: XG - 18, y: 506 }, clamp(atr * 3));
    }
    if (t > T.sube1) { const u = t - T.sube1; a += 0.07 * Math.sin(u * 17) * Math.exp(-u * 8); }
    return { a, piv, dx, dy };
  }
  function sentadoPiernas(p) {         // de pie → sentado con las rodillas arriba (pies plantados)
    const r = {};
    for (const lado of ["cerca", "lejos"]) {
      const s = suave(clamp((p.sent - 0.2) / 0.8));
      const tob = mz(PIE[lado], PIE_SENT[lado], s);
      r[lado] = { k: rodillaDePie(G, p, lado, tob), a: tob, za: 0, zr: 0, ze: 1 };
    }
    return r;
  }
  function relativa(p, POS) {
    const pv = p.pelvis, r = {};
    for (const lado of ["cerca", "lejos"]) { const q = POS[lado]; r[lado] = { k: { x: pv.x + q.k.x, y: pv.y + q.k.y }, a: { x: pv.x + q.a.x, y: pv.y + q.a.y }, za: q.za, zr: q.zr, ze: q.ze }; }
    return r;
  }
  const mezclaPiernas = (A_, B_, k) => {
    const r = {};
    for (const lado of ["cerca", "lejos"]) { const a = A_[lado], b = B_[lado];
      r[lado] = { k: mz(a.k, b.k, k), a: mz(a.a, b.a, k), za: lerp(a.za, b.za, k), zr: k < 0.5 ? a.zr : b.zr, ze: lerp(a.ze, b.ze, k) }; }
    return r;
  };
  const CG = {
    mira: E({ mx: 0.95, my: 0.15, sd: 10, si: 12, sonr: 0.1, ancho: 0.8 }),
    ooh: E({ mx: 0.95, my: 0.1, iris: 1.05, sd: 22, si: 24, abre: 12, ancho: 0.45, sonr: 0.05 }),
    decidido: E({ mx: -0.45, my: 0.05, sd: -4, gd: -0.12, si: -2, gi: -0.12, sonr: 0.55, ancho: 0.95 }),
    estira: E({ mx: 0.3, my: -0.4, z: 0.55, c: 0.45, sd: 8, si: 10, abre: 12, ancho: 0.6, sonr: -0.15, lengua: 1 }),
    panico: E({ mx: 0.2, my: -0.6, iris: 0.66, sd: 28, si: 28, abre: 26, ancho: 0.7, sonr: -0.45 }),
    golpe: E({ c: 1, z: 1, sd: -4, si: -4, abre: 12, ancho: 0.8, sonr: -0.4 }),
    tumbado: E({ mx: -0.4, my: 0.05, sd: 10, si: 6, gi: 0.1, abre: 2, ancho: 0.6, sonr: -0.2, rub: 0.7 }),
    rebote: E({ mx: 0.6, my: -0.2, sd: 20, si: 20, abre: 6, ancho: 0.6, sonr: 0.3 }),
    medita: E({ c: 1, h: 0.25, sd: 6, si: 6, sonr: 0.22, ancho: 0.85 }),
    mosca: E({ c: 0.85, z: 0.25, sd: 2, si: 8, gi: 0.12, sonr: 0.05, ancho: 0.8 }),
    tic: E({ cd: 1, ci: 0.15, mx: 0.4, my: -0.5, iris: 0.85, sd: -2, si: 18, gi: 0.15, sonr: -0.15, ancho: 0.7 }),
    furia: E({ mx: 0.5, my: -0.5, iris: 0.8, sd: -6, gd: -0.2, si: -6, gi: -0.2, abre: 16, ancho: 0.75, sonr: -0.5, rub: 0.4 }),
    susto: E({ mx: -0.2, my: -0.7, iris: 0.62, sd: 30, si: 30, abre: 22, ancho: 0.6, sonr: -0.3 }),
    resopla: E({ mx: 0.2, my: 0.3, sd: -6, gd: -0.15, si: -6, gi: -0.15, mof: 0.9, ancho: 0.5, sonr: -0.1 }),
    calma: E({ c: 1, h: 0.35, sd: 8, si: 8, sonr: 0.38, ancho: 0.95 }),
    dormido: E({ c: 1, sd: 2, si: 2, abre: 9, ancho: 0.45, sonr: -0.05 }),
    despierta: E({ mx: 0.0, my: -0.3, iris: 0.6, sd: 32, si: 32, abre: 18, ancho: 0.55, sonr: -0.2 }),
    camara: E({ mx: -0.45, my: 0.05, sd: 16, si: 4, gi: -0.1, sonr: 0.55, ancho: 0.95, rub: 0.75 })
  };
  const GUION_CG = [
    [T.mira - 0.1, T.mira + 0.15, "mira"], [T.ooh, T.ooh + 0.15, "ooh"], [T.camara1, T.camara1 + 0.2, "decidido"],
    [T.sienta0 + 0.2, T.sienta1, "mira"], [T.pie0, T.pie0 + 0.15, "estira"], [T.molino0 - 0.05, T.molino0 + 0.1, "panico"],
    [T.cae1 - 0.04, T.cae1 + 0.02, "golpe"], [T.tumbado + 0.1, T.tumbado + 0.3, "tumbado"], [T.rebote0, T.rebote0 + 0.15, "rebote"],
    [T.cierra2 - 0.2, T.cierra2, "medita"], [T.mosca0 + 0.2, T.mosca0 + 0.5, "mosca"],
    [T.tic1, T.tic1 + 0.05, "tic"], [T.tic1 + 0.16, T.tic1 + 0.24, "mosca"], [T.tic2, T.tic2 + 0.05, "tic"], [T.tic2 + 0.1, T.tic2 + 0.16, "mosca"],
    [T.abre2, T.abre2 + 0.06, "furia"], [T.vuelca0 + 0.02, T.vuelca0 + 0.1, "susto"],
    [T.resopla, T.resopla + 0.15, "resopla"], [T.resopla + 0.28, T.resopla + 0.4, "decidido"],
    [T.cierra3 - 0.1, T.cierra3 + 0.05, "medita"], [T.calma, T.calma + 0.4, "calma"], [T.cabecea, T.cabecea + 0.5, "dormido"],
    [T.despierta, T.despierta + 0.06, "despierta"], [T.camG, T.camG + 0.25, "camara"]
  ];
  const PARP_G = [0.3, 1.2, 2.2, 4.75, 5.25, 8.95, 9.1, 13.8];
  function poseG(t) {
    const b = linea(GUION_G, CUER_G, "pie", t);
    const respira = Math.sin(t * 2.2 + 0.4);
    // al dormirse respira más despacio y el globo sigue la respiración
    const ronca = tramo(t, T.cabecea, T.globo0 + 0.4);
    const resp = lerp(respira, Math.sin((t - T.globo0) * 4.6), ronca);
    const pelSent = lerp(PEL_G_PIE + b.pel, PEL_G_SENT, b.sent);
    const p = {
      x: XG, suelo: SUELO, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x, y: pelSent + resp * 1.4 }, torso: b.torso, torsoEsc: { x: 1, y: b.esc + resp * 0.006 * (1 + ronca) },
      piernas: { cerca: { tob: PIE.cerca, ang: 0 }, lejos: { tob: PIE.lejos, ang: 0 } },
      cabeza: { ang: b.cab, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } }, sent: b.sent
    };
    // cabeceo dormido: la cabeza cae despacio y da un respingo
    if (t > T.cabecea && t < T.despierta) {
      const u = t - T.cabecea;
      p.cabeza.ang += 0.05 * Math.sin(u * 2.3) + 0.03 * resp;
      const resping = campana(t, 11.9, 12.15);
      p.cabeza.ang -= 0.16 * resping; p.cabeza.dy -= 10 * resping;
    }
    // asiente (decidido) y el «ooh»
    p.cabeza.ang += 0.08 * campana(t, T.asiente, T.asiente + 0.28) - 0.05 * campana(t, T.ooh, T.ooh + 0.4);
    // el despertar: brinco
    if (t > T.despierta) { const u = t - T.despierta; p.pelvis.y -= 26 * Math.sin(Math.min(Math.PI, u * 9)) * (u < 0.35 ? 1 : 0); }
    // sacude la cabeza al resoplar
    p.cabeza.ang += 0.09 * Math.sin((t - T.resopla) * 26) * campana(t, T.resopla - 0.05, T.resopla + 0.3);
    // piernas
    let pier;
    if (t < T.pie0) pier = sentadoPiernas(p);
    else {
      const sent = sentadoPiernas(Object.assign({}, p, { sent: 1 }));
      const cruz = relativa(p, CRUZ_G), nudo = relativa(p, NUDO_G);
      // el pie sube detrás de la cabeza; al caer se queda; en el rebote vuelve a cruzarse
      const sube = tramo(t, T.pie0, T.pie1, salida), baja = tramo(t, T.rebote0, T.rebote1 - 0.05);
      pier = t < T.rebote0 ? mezclaPiernas(sent, nudo, sube) : mezclaPiernas(nudo, cruz, baja);
      // al principio de subir, el pie cercano pasa primero por el cruce
      if (t < T.pie1) { const k = campana(t, T.pie0, T.pie1); pier.cerca.k = mz(pier.cerca.k, { x: p.pelvis.x - 300, y: p.pelvis.y - 40 }, 0.35 * k); }
      // pataleo en el aire mientras se mece de espaldas
      const pat = campana(t, T.vuelca0, T.sube0);
      if (pat > 0) for (const [lado, f] of [["cerca", 0], ["lejos", 1.7]]) { const q = pier[lado]; q.a = { x: q.a.x + 26 * Math.sin(t * 15 + f) * pat, y: q.a.y - 20 * Math.abs(Math.sin(t * 15 + f)) * pat }; }
      // el pie detrás de la cabeza tiembla con el molino
      if (t > T.molino0 && t < T.cae1) pier.cerca.a = { x: pier.cerca.a.x + 6 * Math.sin(t * 31), y: pier.cerca.a.y };
    }
    p.cruz = pier;
    // cara
    const e = linea(GUION_CG, CG, "mira", t);
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.rojo = 0.55 * campana(t, T.pie0, T.cae0) + 0.6 * campana(t, T.tumbado, T.rebote0 + 0.2) + 0.45 * campana(t, T.abre2 - 0.1, T.vuelca1 + 0.3);
    p.sudor = 0.8 * campana(t, T.molino0 - 0.2, T.cae1 + 0.3) + 0.6 * campana(t, T.vuelca0, T.sube1) + 0.5 * campana(t, T.despierta, DUR);
    p.enfado = 0.9 * campana(t, T.abre2 - 0.05, T.mano1 + 0.15);
    // tic del ojo: la ceja salta
    const tic = campana(t, T.tic1, T.tic1 + 0.18) + campana(t, T.tic2, T.tic2 + 0.14);
    if (tic > 0) { p.cara.cejas.i.sube += 8 * Math.sin(t * 70) * tic; }
    // manos
    const res = resolutor(G, p, "cerca"), resL = resolutor(G, p, "lejos");
    const kc = () => p.cruz.cerca.k, kl = () => p.cruz.lejos.k;
    const T_ = G.tronco(p), hC = T_(G.HOMBRO_C), hL = T_(G.HOMBRO);
    const RODILLA_C = { hoja: () => ({ x: kc().x + 16, y: kc().y - 60 }), mu: -1.2, dedos: MUDRA, dobla: -1 };
    const RODILLA_L = { hoja: () => ({ x: kl().x - 14, y: kl().y - 62 }), mu: -1.95, dedos: MUDRA, dobla: 1 };
    const ABRAZA_C = { hoja: () => ({ x: kc().x - 10, y: kc().y + 30 }), mu: -1.9, dedos: D(0.5, 0.6, 0.6, 0.6), dobla: -1 };
    const ABRAZA_L = { hoja: () => ({ x: kl().x + 20, y: kl().y + 40 }), mu: -1.6, dedos: D(0.5, 0.6, 0.6, 0.6), dobla: 1 };
    const molino = (h, R0, ph, sg) => () => { const a = (t - T.molino0) * 13 * sg + ph; return { x: h.x + Math.cos(a) * R0, y: h.y + Math.sin(a) * R0 * 0.9 }; };
    const MOLINO_C = { hoja: molino(hC, 230, 2.6, -1), mu: -0.6, dedos: D(1, 1, 1, 1), dobla: -1 };
    const MOLINO_L = { hoja: molino(hL, 205, -0.2, 1), mu: -2.4, dedos: D(1, 1, 1, 1), dobla: 1 };
    const TIRA_C = { hoja: () => ({ x: hC.x - 30, y: hC.y + 150 }), mu: -1.4, dedos: D(0.3, 0.3, 0.3, 0.3), dobla: -1 };
    const TIRA_L = { hoja: () => ({ x: hL.x + 30, y: hL.y + 150 }), mu: -1.7, dedos: D(0.3, 0.3, 0.3, 0.3), dobla: 1 };
    const TUMBA_C = { hoja: () => ({ x: hC.x - 250, y: hC.y - 60 }), mu: 0.2, dedos: D(0.7, 0.8, 0.8, 0.8), dobla: -1 };
    const TUMBA_L = { hoja: () => ({ x: hL.x + 40, y: hL.y + 230 }), mu: -1.7, dedos: D(0.5, 0.5, 0.5, 0.5), dobla: 1 };
    // el manotazo: arriba a la derecha, por delante de la cara y hasta el otro lado
    // el manotazo, con la mano cercana: arriba, por fuera de la cabeza, y de un barrido hasta la mosca
    const ARMA_C = { hoja: () => ({ x: hC.x - 120, y: hC.y - 285 }), mu: 0.9, dedos: D(1, 1, 1, 1), dobla: -1 };
    const BARRE_C = { hoja: () => ({ x: hC.x + 330, y: hC.y - 140 }), mu: 1.5, dedos: D(1, 1, 1, 1), dobla: -1 };
    const FIN_C = { hoja: () => ({ x: hC.x + 250, y: hC.y + 190 }), mu: 2.1, dedos: D(1, 1, 1, 1), dobla: -1 };
    const EQUIL_L = { hoja: () => ({ x: hL.x + 200, y: hL.y + 60 }), mu: -0.3, dedos: D(1, 1, 1, 1), dobla: 1 };
    const AIRE_C = { hoja: () => ({ x: hC.x - 170, y: hC.y - 170 + 30 * Math.sin(t * 14) }), mu: 0.4, dedos: D(1, 1, 1, 1), dobla: -1 };
    const AIRE_L = { hoja: () => ({ x: hL.x + 120, y: hL.y - 200 + 30 * Math.sin(t * 14 + 1.4) }), mu: 2.4, dedos: D(1, 1, 1, 1), dobla: 1 };
    const SALTA_C = { hoja: () => ({ x: hC.x - 200, y: hC.y - 110 }), mu: 0.3, dedos: D(1, 1, 1, 1), dobla: -1 };
    const SALTA_L = { hoja: () => ({ x: hL.x + 190, y: hL.y - 100 }), mu: 2.8, dedos: D(1, 1, 1, 1), dobla: 1 };
    const PISTA_C = [
      [0, 0, { bols: true }],
      [T.sienta0 + 0.05, T.sienta0 + 0.25, { bols: true, sale: true, dedos: D(0.6, 0.6, 0.6, 0.6) }],
      [T.sienta0 + 0.25, T.sienta1, ABRAZA_C],
      [T.pie0 - 0.05, T.pie0 + 0.15, TIRA_C], [T.molino0 - 0.1, T.molino0 + 0.08, MOLINO_C],
      [T.cae1 - 0.1, T.cae1 + 0.1, TUMBA_C], [T.rebote0, T.rebote0 + 0.2, SALTA_C], [T.rebote1, T.manos2, RODILLA_C],
      [T.abre2 - 0.05, T.mano0, ARMA_C, salida], [T.mano0, T.mano0 + 0.07, BARRE_C, entrada], [T.mano0 + 0.07, T.mano1, FIN_C, salida],
      [T.vuelca0 + 0.02, T.vuelca0 + 0.18, AIRE_C], [T.sube0, T.sube1, RODILLA_C],
      [T.despierta, T.despierta + 0.08, SALTA_C], [T.despierta + 0.4, T.camG + 0.2, RODILLA_C]
    ];
    const PISTA_L = [
      [0, 0, { bols: true }],
      [T.sienta0 + 0.1, T.sienta0 + 0.3, { bols: true, sale: true, dedos: D(0.6, 0.6, 0.6, 0.6) }],
      [T.sienta0 + 0.3, T.sienta1, ABRAZA_L],
      [T.pie0, T.pie0 + 0.18, TIRA_L], [T.molino0 - 0.05, T.molino0 + 0.1, MOLINO_L],
      [T.cae1 - 0.1, T.cae1 + 0.12, TUMBA_L], [T.rebote0 + 0.04, T.rebote0 + 0.22, SALTA_L], [T.rebote1, T.manos2, RODILLA_L],
      [T.vuelca0 + 0.05, T.vuelca0 + 0.2, AIRE_L], [T.sube0 + 0.05, T.sube1, RODILLA_L],
      [T.despierta, T.despierta + 0.08, SALTA_L], [T.despierta + 0.45, T.camG + 0.25, RODILLA_L]
    ];
    const C = pista(PISTA_C, t, res), L = pista(PISTA_L, t, resL);
    // dormido: las manos resbalan un poco de las rodillas
    const resb = tramo(t, T.cabecea, T.cabecea + 1.2) * (1 - tramo(t, T.despierta, T.despierta + 0.1));
    C.y += 14 * resb; L.y += 16 * resb; L.dedos = DD(L.dedos, D(0.5, 0.6, 0.7, 0.7), resb * 0.6); C.dedos = DD(C.dedos, D(0.5, 0.6, 0.7, 0.7), resb * 0.6);
    p.manoCerca = mano(C); p.manoLejos = mano(L);
    p.vuelco = vuelco(t);
    return p;
  }

  /* ---------- la mosca ---------- */
  // centro de la cabeza de Guillermo en pantalla (con su vuelco)
  function enPantalla(pG, q) {
    const v = pG.vuelco, s = G.aPantalla(pG, q);
    const r = rota({ x: s.x - v.piv.x, y: s.y - v.piv.y }, v.a);
    return { x: v.piv.x + r.x + v.dx, y: v.piv.y + r.y + v.dy };
  }
  function moscaEn(t, pG) {
    if (t < T.mosca0 - 0.6 || t > 8.6) return null;
    const cab = enPantalla(pG, G.cabeza(pG).a({ x: 820, y: 520 }));
    if (t < T.mosca0) {               // llega zigzagueando desde la izquierda
      const k = fase(t, T.mosca0 - 0.6, T.mosca0);
      const a = { x: -30, y: 230 }, b = { x: cab.x - 70, y: cab.y - 40 };
      return { x: lerp(a.x, b.x, k) + 10 * Math.sin(t * 25), y: lerp(a.y, b.y, k) + 18 * Math.sin(t * 13), vx: 1 };
    }
    if (t < T.mano0 + 0.02) {         // ronda la cabeza
      const u = t - T.mosca0;
      const x = cab.x + 72 * Math.cos(u * 4.4 + Math.PI) + 14 * Math.sin(u * 17);
      const y = cab.y - 30 + 34 * Math.sin(u * 8.8) + 8 * Math.sin(u * 23);
      // justo antes del manotazo se pone delante de la cara
      const k = tramo(t, T.abre2 - 0.25, T.mano0);
      const fr = { x: cab.x + 98, y: cab.y + 58 + 4 * Math.sin(t * 30) };
      return { x: lerp(x, fr.x, k), y: lerp(y, fr.y, k), vx: -Math.sin(u * 4.4 + Math.PI) };
    }
    // esquiva y se va hacia Paradigma; rebota en su halo y se marcha por arriba
    const halo = haloCentro(t), rad = 118;
    const t0 = T.mano0 + 0.02, tc = 7.62, t2 = 8.6;
    const p0 = { x: cab.x + 98, y: cab.y + 58 }, choque = { x: halo.x - rad * 0.95, y: halo.y - 40 };
    if (t < tc) {
      const k = fase(t, t0, tc);
      return { x: lerp(p0.x, choque.x, k) + 12 * Math.sin(t * 21), y: lerp(p0.y, choque.y, k) - 110 * Math.sin(Math.PI * Math.sqrt(k)), vx: 1 };
    }
    const k = fase(t, tc, t2);
    return { x: choque.x - 60 * Math.sin(Math.PI * k * 0.5) + 200 * k * k, y: choque.y - 260 * k + 10 * Math.sin(t * 19), vx: k < 0.3 ? -1 : 1 };
  }
  function dibMosca(g, t, m) {
    if (!m) return;
    // estela de puntitos
    g.save(); g.fillStyle = "rgba(30,20,30,0.45)";
    for (let i = 1; i <= 5; i++) {
      const q = moscaEn(t - i * 0.045, ultimaPG); if (!q) continue;
      g.beginPath(); g.arc(q.x, q.y, 2, 0, Math.PI * 2); g.fill();
    }
    g.restore();
    g.save(); g.translate(m.x, m.y); g.scale(m.vx < 0 ? -1.8 : 1.8, 1.8);
    const al = 0.55 + 0.35 * Math.sin(t * 90);
    g.fillStyle = `rgba(220,235,255,${0.55 * al})`; g.strokeStyle = `rgba(80,90,110,${0.6 * al})`; g.lineWidth = 0.6;
    g.beginPath(); g.ellipse(-1, -4, 4.5, 2.4, -0.7 + 0.5 * Math.sin(t * 90), 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(1, -4, 4.5, 2.4, 0.7 - 0.5 * Math.sin(t * 90), 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#1b1820"; g.beginPath(); g.ellipse(0, 0, 3.6, 2.6, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(3, -0.5, 1.9, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#c0392b"; g.beginPath(); g.arc(3.8, -1, 0.8, 0, Math.PI * 2); g.fill();
    g.restore();
    // zumbido: rayitas
    g.save(); g.strokeStyle = "rgba(40,30,40,0.55)"; g.lineWidth = 1; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const a = t * 6 + i * 2.1, r = 15 + 3 * Math.sin(t * 40 + i);
      g.beginPath(); g.arc(m.x, m.y, r, a, a + 0.7); g.stroke(); }
    g.restore();
  }
  let ultimaPG = null;

  /* ---------- el halo de Paradigma ---------- */
  function haloCentro(t) { const pP = poseP(t); return P.aPantalla(pP, P.tronco(pP)({ x: 262, y: 470 })); }
  function dibHalo(g, t, pP) {
    const c = P.aPantalla(pP, P.tronco(pP)({ x: 262, y: 470 }));
    const pulso = 0.85 + 0.15 * Math.sin(t * 2.1);
    const r = 165 * pulso;
    const gr = g.createRadialGradient(c.x, c.y, 10, c.x, c.y, r);
    gr.addColorStop(0, "rgba(255,232,160,0.62)"); gr.addColorStop(0.5, "rgba(255,200,120,0.3)"); gr.addColorStop(1, "rgba(255,180,120,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(c.x, c.y, r, 0, Math.PI * 2); g.fill();
    // el anillo que se ondula cuando rebota la mosca
    const on = campana(t, 7.58, 8.1);
    g.save(); g.strokeStyle = `rgba(255,240,180,${0.4 + 0.4 * on})`; g.lineWidth = 1.5 + 1.5 * on;
    g.beginPath();
    for (let i = 0; i <= 60; i++) {
      const a = i / 60 * Math.PI * 2, rr = 118 * pulso + on * 6 * Math.sin(a * 7 - t * 20) * clamp(Math.cos(a - Math.PI * 1.1) * 1.4);
      const x = c.x + Math.cos(a) * rr, y = c.y + Math.sin(a) * rr * 0.92; if (i) g.lineTo(x, y); else g.moveTo(x, y);
    }
    g.stroke(); g.restore();
    // motas doradas que suben despacio
    g.save();
    for (let i = 0; i < 14; i++) {
      const ph = (t * 0.22 + hash(i * 3.7)) % 1, ang = hash(i * 9.1) * Math.PI * 2;
      const x = c.x + Math.cos(ang) * (40 + 80 * hash(i * 1.3)) + 6 * Math.sin(t * 1.5 + i);
      const y = c.y + 70 - ph * 200;
      g.globalAlpha = 0.75 * Math.sin(Math.PI * ph);
      estrella(g, x, y, 2.2 + 2 * hash(i * 5.5), t * 0.6 + i, "#fff1b8");
    }
    g.restore();
  }
  function estrella(g, x, y, r, a, col) {
    g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = col; g.beginPath();
    for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.38 : r, aa = i * Math.PI / 4; if (i) g.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); else g.moveTo(rr, 0); }
    g.closePath(); g.fill(); g.restore();
  }

  /* ---------- el globo de moco ---------- */
  const NARIZ_G = { x: 878, y: 676 };              // ventanilla de la nariz (retrato de Guillermo)
  function globoMoco(t) {
    if (t < T.globo0 || t > T.pop + 0.4) return null;
    const crece = tramo(t, T.globo0, T.globo0 + 0.7);
    const ciclo = 0.5 + 0.5 * Math.sin((t - T.globo0) * 4.6 - Math.PI / 2);
    const extra = 0.35 * tramo(t, 11.8, T.pop);
    const r = crece * (40 + 105 * ciclo + 95 * extra);
    return { r, pop: fase(t, T.pop, T.pop + 0.35) };
  }
  function dibGlobo(g, t) {             // en coordenadas del retrato de Guillermo (capaCabeza)
    const b = globoMoco(t); if (!b) return;
    const dir = { x: 0.62, y: 0.78 };
    if (b.pop <= 0) {
      const r = b.r, c = { x: NARIZ_G.x + dir.x * r * 0.92, y: NARIZ_G.y + dir.y * r * 0.92 };
      g.save();
      g.fillStyle = "rgba(205,236,170,0.42)"; g.strokeStyle = "rgba(110,150,80,0.9)"; g.lineWidth = 6;
      g.beginPath(); g.arc(c.x, c.y, r, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.85)"; g.beginPath(); g.ellipse(c.x - r * 0.38, c.y - r * 0.4, r * 0.22, r * 0.13, -0.6, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(c.x + r * 0.35, c.y + r * 0.3, r * 0.07, 0, Math.PI * 2); g.fill();
      g.restore();
    } else if (b.pop < 1) {
      const k = b.pop, c = { x: NARIZ_G.x + dir.x * 200, y: NARIZ_G.y + dir.y * 200 };
      g.save(); g.globalAlpha = 1 - k; g.strokeStyle = "rgba(140,180,100,0.9)"; g.lineWidth = 10; g.lineCap = "round";
      for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + 0.3, r0 = 150 + 120 * k, r1 = r0 + 50;
        g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1); g.stroke(); }
      g.fillStyle = "rgba(190,225,150,0.8)";
      for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + 1, rr = 120 + 220 * k;
        g.beginPath(); g.arc(c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr + 120 * k * k, 16 * (1 - k * 0.5), 0, Math.PI * 2); g.fill(); }
      g.restore();
    }
  }

  /* ---------- fondo (se pinta una vez) ---------- */
  let fondo = null, farolillo = null;
  const HZ = 368, MURO0 = 352, MURO1 = 404;          // horizonte, murete
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120;
    const g = c.getContext("2d"); g.translate(40, 60);
    // cielo
    const cie = g.createLinearGradient(0, -60, 0, HZ);
    cie.addColorStop(0, "#1c1a44"); cie.addColorStop(0.32, "#3e2c6a"); cie.addColorStop(0.6, "#8a4a7e"); cie.addColorStop(0.82, "#e0806a"); cie.addColorStop(1, "#f6c27e");
    g.fillStyle = cie; g.fillRect(-40, -60, W + 80, HZ + 60);
    // resplandor del sol que se acaba de poner
    const sol = g.createRadialGradient(560, HZ, 10, 560, HZ, 330);
    sol.addColorStop(0, "rgba(255,214,140,0.85)"); sol.addColorStop(0.4, "rgba(250,160,110,0.35)"); sol.addColorStop(1, "rgba(250,150,110,0)");
    g.fillStyle = sol; g.fillRect(-40, -60, W + 80, HZ + 60);
    // estrellas
    for (let i = 0; i < 70; i++) {
      const x = hash(i * 7.31) * (W + 60) - 30, y = -50 + Math.pow(hash(i * 3.17), 1.6) * 250;
      const a = clamp(1 - (y + 50) / 260) * (0.4 + 0.6 * hash(i * 2.2));
      g.fillStyle = `rgba(255,248,225,${a})`; g.beginPath(); g.arc(x, y, 0.6 + 1.1 * hash(i * 5.9), 0, Math.PI * 2); g.fill();
    }
    // una luna fina
    g.save(); g.fillStyle = "#fff4d6"; g.beginPath(); g.arc(860, 70, 17, 0, Math.PI * 2); g.fill();
    g.globalCompositeOperation = "destination-out"; g.beginPath(); g.arc(868, 64, 15, 0, Math.PI * 2); g.fill(); g.restore();
    g.save(); g.globalCompositeOperation = "destination-over"; g.restore();
    // ciudad lejana
    const ciudad = (y0, col, sem, alto, ventanas) => {
      g.fillStyle = col; g.beginPath(); g.moveTo(-40, HZ + 10);
      let x = -40, i = 0;
      while (x < W + 40) {
        const w = 26 + 40 * hash(sem + i * 1.7), h = alto * (0.35 + 0.65 * hash(sem + i * 3.3));
        g.lineTo(x, y0 - h); g.lineTo(x + w, y0 - h);
        if (hash(sem + i * 5.1) < 0.18) { g.lineTo(x + w * 0.5, y0 - h - 18); g.lineTo(x + w * 0.5 + 1.5, y0 - h - 18); g.lineTo(x + w * 0.5 + 1.5, y0 - h); }
        x += w; i++;
      }
      g.lineTo(W + 40, HZ + 10); g.closePath(); g.fill();
      if (ventanas) {
        x = -40; i = 0;
        while (x < W + 40) {
          const w = 26 + 40 * hash(sem + i * 1.7), h = alto * (0.35 + 0.65 * hash(sem + i * 3.3));
          for (let k = 0; k < 6; k++) {
            if (hash(sem + i * 7.7 + k * 1.9) < 0.55) continue;
            const wx = x + 5 + (w - 12) * hash(sem + i * 2.9 + k * 4.1), wy = y0 - h + 6 + (h - 12) * hash(sem + i * 6.1 + k * 2.3);
            g.fillStyle = hash(i + k) < 0.5 ? "rgba(255,214,130,0.9)" : "rgba(255,186,110,0.75)"; g.fillRect(wx, wy, 3, 4);
          }
          x += w; i++;
        }
      }
    };
    ciudad(HZ, "#5a3c6c", 11, 70, false);
    ciudad(HZ + 4, "#3b2850", 37, 110, true);
    // murete de estuco de la azotea, con su remate
    const mu = g.createLinearGradient(0, MURO0, 0, MURO1);
    mu.addColorStop(0, "#d79d7c"); mu.addColorStop(1, "#a96e57");
    g.fillStyle = mu; g.fillRect(-40, MURO0, W + 80, MURO1 - MURO0);
    g.fillStyle = "#efc3a0"; g.fillRect(-40, MURO0 - 8, W + 80, 10);
    g.fillStyle = "rgba(90,50,40,0.25)"; g.fillRect(-40, MURO0 + 2, W + 80, 4);
    g.strokeStyle = "rgba(110,62,48,0.35)"; g.lineWidth = 1;
    for (let i = 0; i < 40; i++) { const x = hash(i * 4.4) * W, y = MURO0 + 8 + hash(i * 8.8) * 38; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6 + 10 * hash(i), y + 1); g.stroke(); }
    // tarima
    const ta = g.createLinearGradient(0, MURO1, 0, H + 60);
    ta.addColorStop(0, "#a8774e"); ta.addColorStop(0.5, "#8c5c38"); ta.addColorStop(1, "#5e3a22");
    g.fillStyle = ta; g.fillRect(-40, MURO1, W + 80, H + 60 - MURO1);
    let y = MURO1, h = 9, fila = 0;
    while (y < H + 60) {
      g.fillStyle = "rgba(60,32,16,0.55)"; g.fillRect(-40, y, W + 80, 1.6);
      g.fillStyle = "rgba(255,220,170,0.12)"; g.fillRect(-40, y + 2, W + 80, 1.2);
      const off = hash(fila * 3.3) * 200;
      for (let x = -40 + off; x < W + 40; x += 220 + 60 * hash(fila + x)) { g.fillStyle = "rgba(60,32,16,0.45)"; g.fillRect(x, y, 1.5, h); }
      y += h; h *= 1.16; fila++;
    }
    // reflejo cálido del cielo en la tarima
    const re = g.createRadialGradient(560, MURO1 + 10, 10, 560, MURO1 + 10, 420);
    re.addColorStop(0, "rgba(255,190,130,0.22)"); re.addColorStop(1, "rgba(255,190,130,0)");
    g.fillStyle = re; g.fillRect(-40, MURO1, W + 80, 300);
    // bambú en macetas de barro (izquierda y derecha)
    bambu(g, 22, SUELO - 6, 1.0, 3); bambu(g, 1004, SUELO - 4, 1.05, 9);
    // cojines y esterillas
    esterilla(g, XG + 2, SUELO - 6, "#2f5864", "#3f7381");
    esterilla(g, XP - 2, SUELO - 6, "#6e2a35", "#8c3a46");
    zafu(g, XG + 4, SUELO - 22, "#2e7d86", "#1f5a61");
    zafu(g, XP - 4, SUELO - 22, "#b2493f", "#86342d");
    // el pebetero del incienso
    g.save(); g.fillStyle = "#3a2a24"; g.beginPath(); g.ellipse(522, SUELO - 6, 16, 5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#5c4336"; g.beginPath(); g.ellipse(522, SUELO - 9, 14, 4, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#6b3b22"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(522, SUELO - 10); g.lineTo(528, SUELO - 58); g.stroke(); g.restore();
    // pie de la caña (shishi-odoshi): pila de piedra
    g.save(); g.fillStyle = "#6f6a68"; g.beginPath(); g.ellipse(916, SUELO - 2, 56, 13, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#87817e"; g.beginPath(); g.ellipse(916, SUELO - 8, 50, 10, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#4a6f78"; g.beginPath(); g.ellipse(916, SUELO - 9, 38, 6.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,230,190,0.35)"; g.beginPath(); g.ellipse(906, SUELO - 10, 16, 2, 0, 0, Math.PI * 2); g.fill();
    for (const [x, y, r] of [[862, SUELO - 4, 12], [968, SUELO - 3, 10], [978, SUELO - 10, 7]]) { g.fillStyle = "#56514f"; g.beginPath(); g.ellipse(x, y, r, r * 0.7, 0, 0, Math.PI * 2); g.fill(); }
    // postes de la caña
    g.fillStyle = "#7c8a3c"; g.fillRect(888, SUELO - 98, 7, 88); g.fillRect(906, SUELO - 98, 7, 88);
    g.fillStyle = "rgba(40,50,10,0.5)"; for (const yy of [SUELO - 70, SUELO - 40]) { g.fillRect(888, yy, 7, 3); g.fillRect(906, yy, 7, 3); }
    // caño que trae el agua
    g.fillStyle = "#8ea24a"; g.save(); g.translate(1060, SUELO - 128); g.rotate(0.22); g.fillRect(-120, -6, 120, 12); g.restore();
    g.restore();
    return c;
  }
  function bambu(g, x, y, esc, sem) {
    g.save(); g.translate(x, y); g.scale(esc, esc);
    // tallos
    for (let i = 0; i < 6; i++) {
      const dx = -26 + 11 * i + 6 * hash(sem + i), alto = 230 + 120 * hash(sem + i * 2.1), ln = -0.04 + 0.08 * hash(sem + i * 3.2);
      g.save(); g.rotate(ln);
      g.fillStyle = i % 2 ? "#6f9a3e" : "#86b04a"; g.fillRect(dx - 3.5, -alto, 7, alto);
      g.fillStyle = "#4d7429"; for (let yy = -40; yy > -alto; yy -= 38 + 6 * hash(i + yy)) g.fillRect(dx - 4.5, yy, 9, 3);
      // hojas
      for (let k = 0; k < 7; k++) {
        const yy = -alto * (0.45 + 0.55 * hash(sem + i * 1.1 + k * 0.7)), sg = hash(sem + i + k * 3.3) < 0.5 ? -1 : 1, a = sg * (0.5 + 0.5 * hash(k * 9 + i));
        g.save(); g.translate(dx, yy); g.rotate(a + (sg < 0 ? Math.PI : 0) * 0); g.scale(sg, 1);
        g.fillStyle = k % 2 ? "#4f7d33" : "#6ea547"; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(14, -7, 34, 2); g.quadraticCurveTo(14, 4, 0, 0); g.fill();
        g.restore();
      }
      g.restore();
    }
    // maceta
    g.fillStyle = "#b5643c"; g.beginPath(); g.moveTo(-42, -60); g.lineTo(42, -60); g.lineTo(32, 0); g.lineTo(-32, 0); g.closePath(); g.fill();
    g.fillStyle = "#c97a4e"; g.fillRect(-46, -66, 92, 12);
    g.fillStyle = "rgba(80,30,10,0.3)"; g.fillRect(-36, -54, 8, 50);
    g.fillStyle = "rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(0, 2, 40, 6, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function esterilla(g, x, y, c1, c2) {
    g.save(); g.fillStyle = "rgba(30,15,5,0.3)"; g.beginPath(); g.ellipse(x, y + 6, 118, 15, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = c1; g.beginPath(); g.moveTo(x - 104, y + 4); g.lineTo(x - 90, y - 12); g.lineTo(x + 90, y - 12); g.lineTo(x + 104, y + 4); g.lineTo(x + 100, y + 10); g.lineTo(x - 100, y + 10); g.closePath(); g.fill();
    g.fillStyle = c2; g.beginPath(); g.moveTo(x - 104, y + 4); g.lineTo(x - 90, y - 12); g.lineTo(x + 90, y - 12); g.lineTo(x + 104, y + 4); g.closePath(); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 1; g.setLineDash([4, 4]);
    g.beginPath(); g.moveTo(x - 94, y + 1); g.lineTo(x - 84, y - 8); g.lineTo(x + 84, y - 8); g.lineTo(x + 94, y + 1); g.closePath(); g.stroke(); g.setLineDash([]);
    g.restore();
  }
  function zafu(g, x, y, c1, c2) {
    g.save();
    g.fillStyle = c2; g.beginPath(); g.ellipse(x, y + 8, 52, 15, 0, 0, Math.PI); g.lineTo(x - 52, y - 4); g.ellipse(x, y - 4, 52, 15, 0, Math.PI, 0, true); g.closePath(); g.fill();
    g.fillStyle = c1; g.beginPath(); g.ellipse(x, y - 4, 52, 15, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(0,0,0,0.2)"; g.lineWidth = 1.2;
    for (let i = -4; i <= 4; i++) { g.beginPath(); g.moveTo(x + i * 11, y + 9 - Math.abs(i) * 0.6); g.lineTo(x + i * 12, y - 2); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,0.14)"; g.beginPath(); g.ellipse(x - 12, y - 8, 26, 6, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // farolillo de papel con su resplandor (sprite)
  function creaFarolillo() {
    const c = document.createElement("canvas"); c.width = 120; c.height = 140;
    const g = c.getContext("2d"); g.translate(60, 70);
    const gl = g.createRadialGradient(0, 4, 4, 0, 4, 60); gl.addColorStop(0, "rgba(255,200,120,0.55)"); gl.addColorStop(1, "rgba(255,170,90,0)");
    g.fillStyle = gl; g.beginPath(); g.arc(0, 4, 60, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#3a2418"; g.fillRect(-9, -22, 18, 5); g.fillRect(-9, 26, 18, 5);
    const cu = g.createRadialGradient(-5, 0, 2, 0, 4, 26); cu.addColorStop(0, "#fff0c0"); cu.addColorStop(0.6, "#f2a053"); cu.addColorStop(1, "#c7542e");
    g.fillStyle = cu; g.beginPath(); g.ellipse(0, 4, 19, 23, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(140,50,20,0.55)"; g.lineWidth = 1;
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(0, 4, Math.abs(i) * 7 + 1, 23, 0, 0, Math.PI * 2); g.stroke(); }
    return c;
  }
  const FAROLES = [70, 228, 386, 544, 702, 860, 998];
  const cuerda = x => 26 + 44 * (1 - Math.pow((x - 520) / 560, 2));
  function dibFaroles(g, t) {
    g.save(); g.strokeStyle = "#20141a"; g.lineWidth = 1.5; g.beginPath();
    for (let x = -30; x <= W + 30; x += 20) { const y = cuerda(x) + 2 * Math.sin(t * 0.8 + x * 0.01); if (x === -30) g.moveTo(x, y); else g.lineTo(x, y); }
    g.stroke(); g.restore();
    FAROLES.forEach((x, i) => {
      const y = cuerda(x) + 2 * Math.sin(t * 0.8 + x * 0.01), a = 0.06 * Math.sin(t * 1.1 + i * 1.7), e = 0.8 + 0.15 * hash(i * 3.1);
      g.save(); g.translate(x, y); g.rotate(a);
      g.strokeStyle = "#20141a"; g.lineWidth = 1; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 14); g.stroke();
      g.translate(0, 14 + 22 * e); g.scale(e, e); g.globalAlpha = 0.92 + 0.08 * Math.sin(t * 3 + i);
      g.drawImage(farolillo, -60, -70); g.restore();
    });
  }
  function dibEstrellasVivas(g, t) {
    g.save();
    for (let i = 0; i < 9; i++) {
      const x = 60 + hash(i * 13.3) * 900, y = 18 + hash(i * 7.7) * 130, k = 0.5 + 0.5 * Math.sin(t * (1.5 + hash(i)) + i * 2);
      g.globalAlpha = 0.4 + 0.6 * k; estrella(g, x, y, 2 + 2 * k, 0, "#fff6dc");
    }
    g.restore();
  }
  // el humo del incienso: una voluta que sube
  function dibIncienso(g, t) {
    g.save(); g.lineCap = "round";
    for (let j = 0; j < 2; j++) {
      g.strokeStyle = `rgba(235,225,240,${0.35 - j * 0.12})`; g.lineWidth = 2.2 - j * 0.8; g.beginPath();
      for (let i = 0; i <= 26; i++) {
        const u = i / 26, x = 528 + u * 10 + 12 * u * Math.sin(u * 7 - t * 1.6 + j) , y = SUELO - 60 - u * 150;
        if (i) g.lineTo(x, y); else g.moveTo(x, y);
      }
      g.stroke();
    }
    g.fillStyle = "#ff8a3a"; g.beginPath(); g.arc(528, SUELO - 59, 1.8, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // shishi-odoshi: la caña se llena, bascula (¡toc!) y vuelve
  function angCana(t) {
    let a = 0.32;                                  // reposo: la boca hacia arriba (llenándose)
    for (const tc of TOCS) {
      const baja = tramo(t, tc - 0.12, tc, entrada), sube = tramo(t, tc + 0.18, tc + 0.75, suave);
      if (t > tc - 0.12 && t < tc + 0.75) a = lerp(0.32, -0.42, baja * (1 - sube));
      if (t > tc && t < tc + 0.3) a += 0.05 * Math.sin((t - tc) * 40) * Math.exp(-(t - tc) * 12);
    }
    return a;
  }
  function dibCana(g, t) {
    const a = angCana(t), piv = { x: 900, y: SUELO - 82 };
    // chorrito del caño
    g.save(); g.strokeStyle = "rgba(190,225,240,0.75)"; g.lineWidth = 2; g.beginPath();
    g.moveTo(944, SUELO - 117); g.quadraticCurveTo(936, SUELO - 108, 934 + 1.5 * Math.sin(t * 20), SUELO - 96); g.stroke(); g.restore();
    g.save(); g.translate(piv.x, piv.y); g.rotate(a);
    g.fillStyle = "#93a94c"; g.beginPath(); g.moveTo(-58, -8); g.lineTo(46, -8); g.lineTo(58, -18); g.lineTo(60, 6); g.lineTo(-58, 8); g.closePath(); g.fill();
    g.strokeStyle = "#4e5f1e"; g.lineWidth = 1.6; g.stroke();
    g.fillStyle = "#6b7d2c"; g.fillRect(-10, -9, 4, 17); g.fillRect(-46, -9, 4, 17);
    g.fillStyle = "#2c3a14"; g.beginPath(); g.ellipse(57, -6, 3, 11, 0.6, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#3a2a1a"; g.beginPath(); g.arc(0, 0, 3, 0, Math.PI * 2); g.fill();
    g.restore();
    // el golpe: rayitas y el agua que cae
    for (const tc of TOCS) {
      const k = campana(t, tc, tc + 0.32); if (k <= 0) continue;
      const p = { x: piv.x + Math.cos(a) * 60, y: piv.y + Math.sin(a) * 60 + 4 };
      g.save(); g.strokeStyle = `rgba(255,248,220,${0.9 * k})`; g.lineWidth = 2; g.lineCap = "round";
      for (let i = 0; i < 4; i++) { const aa = -2.6 + i * 0.5; g.beginPath(); g.moveTo(p.x + Math.cos(aa) * 12, p.y + Math.sin(aa) * 12); g.lineTo(p.x + Math.cos(aa) * (20 + 8 * k), p.y + Math.sin(aa) * (20 + 8 * k)); g.stroke(); }
      g.fillStyle = `rgba(190,225,240,${0.8 * k})`;
      for (let i = 0; i < 5; i++) { const u = fase(t, tc, tc + 0.32); g.beginPath(); g.arc(p.x - 6 + i * 3, p.y + 6 + u * 26 + i * 2, 1.8, 0, Math.PI * 2); g.fill(); }
      g.restore();
    }
  }

  /* ---------- efectos ---------- */
  function polvo(g, x, y, t, t0, esc = 1) {
    const k = fase(t, t0, t0 + 0.7); if (k <= 0 || k >= 1) return;
    g.save();
    for (let i = 0; i < 7; i++) {
      const sg = i % 2 ? 1 : -1, d = (14 + 50 * k) * (0.6 + 0.6 * hash(i * 3.1)) * esc;
      g.globalAlpha = 0.5 * (1 - k); g.fillStyle = "#e7cfae";
      g.beginPath(); g.arc(x + sg * d * (0.5 + i * 0.12), y - 6 - 18 * k * hash(i * 7.7), (7 + 10 * k) * esc * (0.6 + 0.4 * hash(i)), 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  function golpeFx(g, x, y, t, t0) {
    const k = campana(t, t0, t0 + 0.28); if (k <= 0) return;
    g.save(); g.strokeStyle = `rgba(255,250,230,${k})`; g.lineWidth = 2.6; g.lineCap = "round";
    for (let i = 0; i < 6; i++) { const a = -Math.PI * (0.15 + i * 0.14); g.beginPath(); g.moveTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14); g.lineTo(x + Math.cos(a) * (28 + 10 * k), y + Math.sin(a) * (28 + 10 * k)); g.stroke(); }
    g.restore();
  }
  function oohFx(g, t, pG) {          // rayitas de asombro al ver flotar a Paradigma
    const k = campana(t, T.ooh, T.ooh + 0.55); if (k <= 0) return;
    const c = enPantalla(pG, G.cabeza(pG).a({ x: 790, y: 300 }));
    g.save(); g.strokeStyle = `rgba(255,250,235,${k})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const a = -2.1 + i * 0.45; g.beginPath(); g.moveTo(c.x + Math.cos(a) * 42, c.y + Math.sin(a) * 42); g.lineTo(c.x + Math.cos(a) * 54, c.y + Math.sin(a) * 54); g.stroke(); }
    g.restore();
  }
  function estrellitas(g, t, pG, t0, t1) {
    const k = campana(t, t0, t1); if (k <= 0.01) return;
    const c = enPantalla(pG, G.cabeza(pG).a({ x: 760, y: 260 }));
    for (let i = 0; i < 4; i++) { const a = t * 5 + i * Math.PI / 2; g.save(); g.globalAlpha = clamp(k * 1.6); estrella(g, c.x + Math.cos(a) * 30, c.y - 4 + Math.sin(a) * 8, 5, t * 3 + i, "#fff2a8"); g.restore(); }
  }
  function sustoFx(g, t, pG) {        // el sobresalto al despertar
    const k = campana(t, T.despierta, T.despierta + 0.4); if (k <= 0) return;
    const c = enPantalla(pG, G.cabeza(pG).a({ x: 780, y: 420 }));
    g.save(); g.strokeStyle = `rgba(255,250,235,${k})`; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.05 + i * 0.15); const r0 = 66, r1 = 80 + 8 * k; g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0 * 1.1); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1 * 1.1); g.stroke(); }
    g.restore();
  }

  /* ---------- cámara ---------- */
  const PLANOS = [[0, 1.0, 512, 300], [2.5, 1.0, 512, 300], [3.4, 1.1, 505, 330], [3.85, 1.1, 505, 330], [4.35, 1.1, 448, 334], [5.0, 1.1, 448, 334],
    [5.7, 1.1, 505, 330], [10.0, 1.1, 505, 330], [11.6, 1.17, 520, 346], [DUR, 1.18, 522, 348]];
  function camara(t) {
    let i = 0; while (i < PLANOS.length - 2 && t > PLANOS[i + 1][0]) i++;
    const a = PLANOS[i], b = PLANOS[i + 1], k = suave(fase(t, a[0], b[0]));
    const kk = lerp(a[1], b[1], k), x = lerp(a[2], b[2], k), y = lerp(a[3], b[3], k);
    const tem = 0.7 * campana(t, T.cae1, T.cae1 + 0.3);
    return { k: kk, x: x + tem * 3 * ruido(t * 34), y: y + tem * 2.5 * ruido(t * 29 + 4) };
  }

  /* ---------- poses (con caché por fotograma) ---------- */
  let cacheT = -1, cacheV = null;
  function poseCache(t) {
    if (t !== cacheT) { cacheT = t; cacheV = { p: poseP(t), g: null }; cacheV.g = poseG(t); }
    return cacheV;
  }
  const pose = t => { const v = poseCache(t); return { g: v.g, p: v.p }; };

  class GuillermoParadigmaMeditacion extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !P.listo()) return;
      if (!fondo) { fondo = creaFondo(); farolillo = creaFarolillo(); }
      const v = poseCache(t), pG = v.g, pP = v.p;
      ultimaPG = pG;
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      g.drawImage(fondo, -40, -60);
      dibEstrellasVivas(g, t);
      dibFaroles(g, t);
      dibCana(g, t);
      dibIncienso(g, t);
      // Paradigma: halo, sombra en su cojín y él, flotando
      dibHalo(g, t, pP);
      const fl = flota(t);
      g.save(); g.fillStyle = `rgba(30,10,10,${0.34 - fl * 0.008})`; g.beginPath(); g.ellipse(XP - 4, SUELO - 26, 50 - fl * 0.6, 11 - fl * 0.12, 0, 0, Math.PI * 2); g.fill(); g.restore();
      g.save(); marcoHoja(P, g, pP); dibPiernas(P, g, pP, ["lejos", "cerca"]); g.restore();
      dibujaSinPiernas(P, g, pP, t);
      // Guillermo (girado cuando se cae)
      const vu = pG.vuelco;
      g.save();
      g.translate(vu.piv.x + vu.dx, vu.piv.y + vu.dy); g.rotate(vu.a); g.translate(-vu.piv.x, -vu.piv.y);
      g.save(); marcoHoja(G, g, pG); dibPiernas(G, g, pG, ["lejos", "cerca"]); g.restore();
      pG.capaCabeza = gg => dibGlobo(gg, t);
      dibujaSinPiernas(G, g, pG, t);
      g.restore();
      // efectos
      const cabG = enPantalla(pG, G.cabeza(pG).a({ x: 760, y: 560 }));
      polvo(g, cabG.x, SUELO - 4, t, T.cae1, 1.1);
      golpeFx(g, cabG.x, SUELO - 30, t, T.cae1);
      polvo(g, XG - 40, SUELO - 6, t, T.vuelca1, 0.8);
      estrellitas(g, t, pG, T.cae1, T.miraCam2);
      oohFx(g, t, pG);
      sustoFx(g, t, pG);
      dibMosca(g, t, moscaEn(t, pG));
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00103", nombre: "Guillermo y Paradigma · La meditación", crear: () => new GuillermoParadigmaMeditacion() });
  function diag(t) {
    const v = poseCache(t), o = {};
    const dist = (Rg, p, lado) => { const m = lado === "cerca" ? p.manoCerca : p.manoLejos, h = Rg.tronco(p)(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO);
      const L = lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L;
      const mu = m.mu ?? -1.75, w = rota({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, m.ang || 0);
      return +(Math.hypot(m.x + w.x - h.x, m.y + w.y - h.y) / L).toFixed(3); };
    o.gC = dist(G, v.g, "cerca"); o.gL = dist(G, v.g, "lejos"); o.pC = dist(P, v.p, "cerca"); o.pL = dist(P, v.p, "lejos");
    return o;
  }
  window.__A2D_00103 = { pose, T, DUR, diag };
})();
