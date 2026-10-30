"use strict";
/* 00024 · Guillermo y Marcos · La manguera loca
 *
 * Negro → patio de maniobras del parque de bomberos a pleno sol (fachada de ladrillo con portones
 * rojos, torre de prácticas, conos). Marcos, junto a la columna de la válvula, sujeta la lanza;
 * Guillermo le suplica con las manos juntas dando saltitos → Marcos suspira y se la da; Guillermo la
 * coge con las dos manos, recula y apunta muy chulo mirando a cámara → Marcos, sin mirar, abre la
 * válvula: un bulto de agua recorre la manguera hasta la lanza → ¡chorro! El retroceso empuja a
 * Guillermo y la manguera se vuelve loca: lo zarandea arriba y abajo, mientras Marcos salta la
 * manguera como a la comba → la manguera le barre los pies, cae sentado encima y el chorro lo
 * arrastra de culo por el patio hasta llevarse los conos → la manguera se encabrita y lo levanta
 * por los aires: lo monta como un toro mecánico, y a la tercera sacudida Guillermo agita la mano
 * y se lo pasa en grande → Marcos, aburrido, cierra la válvula: la manguera se desinfla y Guillermo
 * cae de culo en el charco → mareado, mira por la boca de la lanza… y le cae el último chorrito en
 * la cara. Marcos se encoge de hombros a cámara → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`. La lanza es un objeto del mundo: las manos de
 * los dos se calculan sobre ella y se vuelven a dibujar encima para que la agarren.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, MB = MarcosBombero;
  const S = 0.27, SUELO = 548, DUR = 13.9;
  const U = G.JK * S;                         // 1 unidad de lanza en px de pantalla
  const COLA = MB.LANZA.COLA, BOCA = MB.LANZA.BOCA;
  const T = {
    ruega0: 0.35, ceja: 0.75, suspira: 1.2, ofrece0: 1.6, ofrece1: 2.15, paso0: 1.6, paso1: 2.2, toma: 2.25, suelta: 2.5,
    recula0: 2.55, recula1: 3.05, apunta1: 3.2, chulo: 3.3, mAtras0: 2.7, mAtras1: 3.35, valv0: 3.45, valv1: 4.0,
    bulto0: 3.95, mira: 4.1, chorro: 4.5, latigo0: 4.62, salta: 5.12, latigo1: 6.22, sienta: 6.55,
    arrastra0: 6.55, conos: 7.92, arrastra1: 8.2, alza1: 8.7, yeehaw: 9.3, aburre: 9.0, cierra0: 10.0, cierra1: 10.45,
    cae: 10.9, mareo: 11.0, asoma0: 11.55, chorrito: 12.05, encoge: 11.95, fin: 12.95
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const D = (pu, ix, re) => ({ pulgar: pu, indice: ix, medio: re, anular: re, menique: re });
  const mezclaD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k), anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const PALMA = D(1, 1, 1), PUNO = D(0, 0, 0), AGARRA = D(0.25, 0.3, 0.32), RUEGA = D(0.7, 0.95, 0.95);
  const rot = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const dirA = a => ({ x: Math.cos(a), y: Math.sin(a) });
  const angDif = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, wd: 0, wi: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12,
    dientes: 1, lengua: 0, mof: 0, rub: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, extraC) {
    const c = clamp(e.c + extraC);
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp, ojos: { d: clamp(c + e.wd), i: clamp(c + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* ---------- la columna de la válvula (izquierda) ---------- */
  const VAL = { x: 176, rueda: { x: 178, y: 352, r: 19 }, boca: { x: 192, y: SUELO - 34 } };
  // giro de la rueda (rad): se abre y luego se cierra
  const giroRueda = t => 2.6 * Math.PI * suave(fase(t, T.valv0 + 0.1, T.valv1)) - 2.6 * Math.PI * suave(fase(t, T.cierra0 + 0.08, T.cierra1));
  // presión del agua (0…1)
  const presion = t => tramo(t, T.chorro - 0.02, T.chorro + 0.08, salida) * (1 - tramo(t, T.cierra1 - 0.1, T.cierra1 + 0.3, suave));

  /* ================= Guillermo (mira a la izquierda) ================= */
  const CG = {
    inicio: E({ mx: 0.9, my: 0.05, orig: 0, sonr: 0.3 }),
    ruega: E({ mx: 0.92, my: -0.25, iris: 1.32, sd: 22, si: 22, gd: 0.3, gi: 0.3, orig: 0, abre: 4, ancho: 0.55, sonr: -0.22, rub: 0.25 }),
    contento: E({ mx: 0.6, my: -0.6, c: 0.25, h: 0.8, sd: 14, si: 14, orig: 0, abre: 22, ancho: 1.1, sonr: 1, rub: 0.3 }),
    chulo: E({ mx: -0.85, my: -0.05, sd: 15, gd: 0.16, si: -3, gi: -0.06, orig: 0, sonr: 0.75, ancho: 0.95 }),
    intriga: E({ mx: 0.3, my: 0.95, iris: 0.95, sd: 14, si: 20, gd: 0.1, gi: 0.2, orig: 0, abre: 6, ancho: 0.5, sonr: -0.1 }),
    susto: E({ mx: 0.85, my: -0.3, iris: 0.68, sd: 28, si: 28, gd: 0.08, gi: 0.08, orig: 0, abre: 46, ancho: 0.78, sonr: -0.15, lengua: 0.3 }),
    panico: E({ mx: 0.4, my: -0.6, iris: 0.72, sd: 25, si: 25, gd: 0.3, gi: 0.3, orig: 0, abre: 56, ancho: 1.05, sonr: -0.5, lengua: 0.5 }),
    aprieta: E({ mx: 0.7, my: 0, c: 0.85, z: 0.9, sd: -6, si: -6, gd: -0.2, gi: -0.2, orig: 0, abre: 22, ancho: 1.22, sonr: -0.3, lengua: 0 }),
    yeehaw: E({ mx: 0.5, my: -0.7, c: 0.75, h: 1, sd: 18, si: 18, orig: 0, abre: 48, ancho: 1.15, sonr: 1, lengua: 0.6, rub: 0.4 }),
    cae: E({ mx: 0.2, my: 0.95, iris: 0.7, sd: 27, si: 27, orig: 0, abre: 36, ancho: 0.7, sonr: -0.1, lengua: 0.3 }),
    mareo: E({ mx: 0, my: 0, esp: 1, sd: 8, si: -4, gd: 0.15, gi: -0.1, orig: 0, abre: 14, ancho: 0.8, sonr: -0.15, lengua: 0.6 }),
    asoma: E({ mx: 0.6, my: 0.75, wd: 0.85, sd: 0, si: 16, gi: 0.12, orig: 0, abre: 0, ancho: 0.62, sonr: 0.05 }),
    pum: E({ mx: 0, my: 0, c: 1, z: 1, sd: 6, si: 6, orig: 0, abre: 0, ancho: 0.7, sonr: -0.3, mof: 1 }),
    final: E({ mx: -0.85, my: 0, c: 0.5, sd: 2, si: 2, gd: 0.05, gi: 0.05, orig: 0, abre: 7, ancho: 0.55, sonr: -0.25 })
  };
  const GUION_CG = [
    [T.ruega0, T.ruega0 + 0.35, "ruega"], [T.toma - 0.05, T.toma + 0.25, "contento"], [T.chulo, T.chulo + 0.3, "chulo"],
    [T.mira, T.mira + 0.25, "intriga"], [T.chorro - 0.02, T.chorro + 0.08, "susto"], [T.latigo0 + 0.2, T.latigo0 + 0.45, "panico"],
    [T.sienta - 0.1, T.sienta + 0.25, "aprieta"], [T.arrastra1, T.arrastra1 + 0.2, "panico"], [T.yeehaw - 0.15, T.yeehaw + 0.25, "yeehaw"],
    [T.cierra1 - 0.05, T.cierra1 + 0.15, "cae"], [T.mareo, T.mareo + 0.25, "mareo"], [T.asoma0, T.asoma0 + 0.3, "asoma"],
    [T.chorrito, T.chorrito + 0.06, "pum"], [T.chorrito + 0.55, T.chorrito + 0.85, "final"]
  ];
  const PARP_G = [0.2, 1.45, 3.75, 7.1, 11.3];

  // cuerpo: dx (px, hacia delante = izquierda), pel (hoja, + abajo), torso, cab, sentado (0…1: piernas hacia delante)
  const P0G = { pel: 0, torso: 0, cab: 0, sen: 0, tey: 1 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    ruega: CuG({ pel: 14, torso: 0.1, cab: 0.1 }),
    toma: CuG({ pel: 6, torso: 0.06, cab: 0.02 }),
    apunta: CuG({ pel: 34, torso: -0.06, cab: -0.04, tey: 1.02 }),
    intriga: CuG({ pel: 30, torso: 0.08, cab: 0.2 }),
    retro: CuG({ pel: 46, torso: -0.22, cab: -0.2 }),
    latigo: CuG({ pel: 60, torso: 0.0, cab: 0 }),
    sentado: CuG({ pel: 556, torso: -0.12, cab: 0.04, sen: 1 }),
    arrastra: CuG({ pel: 556, torso: -0.2, cab: -0.1, sen: 1 }),
    jinete: CuG({ pel: 470, torso: 0.02, cab: 0, sen: 1 }),
    charco: CuG({ pel: 560, torso: -0.05, cab: 0.08, sen: 1 }),
    asoma: CuG({ pel: 560, torso: 0.12, cab: 0.2, sen: 1 }),
    pum: CuG({ pel: 560, torso: -0.1, cab: -0.22, sen: 1 }),
    final: CuG({ pel: 560, torso: -0.03, cab: 0.03, sen: 1 })
  };
  const GUION_G = [
    [T.ruega0, T.ruega0 + 0.3, "ruega"], [T.toma - 0.1, T.toma + 0.2, "toma"], [T.recula0, T.apunta1, "apunta"],
    [T.mira, T.mira + 0.3, "intriga"], [T.chorro, T.chorro + 0.1, "retro", salida], [T.chorro + 0.25, T.latigo0 + 0.4, "latigo"],
    [T.latigo1, T.sienta, "sentado", entrada], [T.sienta + 0.1, T.sienta + 0.4, "arrastra"], [T.arrastra1, T.alza1, "jinete"],
    [T.cierra1 + 0.05, T.cae, "charco", entrada], [T.asoma0, T.asoma0 + 0.35, "asoma"], [T.chorrito, T.chorrito + 0.08, "pum", salida],
    [T.chorrito + 0.5, T.chorrito + 0.9, "final"]
  ];

  // x del cuerpo (px de pantalla)
  function xG(t) {
    let x = 650;
    x = lerp(x, 520, suave(fase(t, T.paso0, T.paso1)));
    x = lerp(x, 640, suave(fase(t, T.recula0, T.recula1)));
    x += 26 * salida(fase(t, T.chorro, T.chorro + 0.18));
    // latigazos: le tiran a un lado y a otro
    const lat = tramo(t, T.latigo0, T.latigo0 + 0.2) * (1 - tramo(t, T.latigo1 - 0.1, T.sienta));
    x += lat * (22 * Math.sin((t - T.latigo0) * 6.1) + 10 * ruido(t * 3.3));
    // arrastre de culo hacia la derecha (el chorro empuja hacia atrás)
    const k = fase(t, T.arrastra0, T.arrastra1);
    x += 150 * (k * k * (3 - 2 * k)) + 10 * Math.sin(k * Math.PI * 3) * campana(t, T.arrastra0, T.arrastra1);
    // en el aire, la manguera lo mece
    x += -14 * tramo(t, T.arrastra1, T.alza1) + 16 * Math.sin((t - T.alza1) * 4.4) * tramo(t, T.alza1, T.alza1 + 0.3) * (1 - tramo(t, T.cierra1, T.cae));
    return x;
  }
  // altura sobre el suelo (px) y balanceo (rad) al montar la manguera
  function rodeo(t) {
    const sube = tramo(t, T.arrastra1, T.alza1, suave5);
    const u = Math.max(0, t - T.alza1);
    const bote = Math.abs(Math.sin(u * 4.6)) * tramo(t, T.alza1, T.alza1 + 0.25);
    const cae = fase(t, T.cierra1 - 0.02, T.cae);
    let h = (150 + 46 * bote) * sube;
    if (t > T.cierra1 - 0.02) h *= 1 - cae * cae;                 // cae con la gravedad
    const rho = (0.22 * Math.sin(u * 4.6 + 0.6) * tramo(t, T.alza1, T.alza1 + 0.3) - 0.08 * sube) * (1 - tramo(t, T.cierra1, T.cae));
    return { h, rho, bote };
  }
  // pasos de Guillermo (x de pantalla de cada tobillo)
  const PASOS_G = {
    cerca: [[-9, -8, 668], [1.6, 1.84, 590], [1.9, 2.14, 538], [2.55, 2.78, 600], [2.86, 3.08, 658], [T.chorro + 0.02, T.chorro + 0.16, 686],
            [4.95, 5.12, 660], [5.5, 5.66, 694], [5.95, 6.1, 664]],
    lejos: [[-9, -8, 632], [1.72, 1.96, 560], [2.02, 2.24, 500], [2.62, 2.86, 572], [2.92, 3.14, 622], [T.chorro + 0.06, T.chorro + 0.2, 646],
            [5.22, 5.38, 614], [5.7, 5.86, 650], [6.05, 6.2, 618]]
  };
  function pieG(lado, t) {
    const L = PASOS_G[lado]; let i = 0; while (i + 1 < L.length && t >= L[i + 1][0]) i++;
    const [t0, t1, x] = L[i], xa = i > 0 ? L[i - 1][2] : x, u = fase(t, t0, t1);
    const arrastre = t0 > T.chorro - 0.1;                           // con el chorro los pies resbalan, no levantan
    return { x: lerp(xa, x, suave(u)), alto: (arrastre ? 12 : 48) * Math.sin(Math.PI * u) };
  }
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;

  function cuerpoG(t) {
    const b = linea(GUION_G, CUER_G, "ruega", t);
    const respira = Math.sin(t * 2.4);
    const R = rodeo(t);
    const ruegaBote = Math.abs(Math.sin((t - T.ruega0) * 7.5)) * tramo(t, T.ruega0, T.ruega0 + 0.2) * (1 - tramo(t, T.paso0 - 0.15, T.paso0));
    const p = {
      x: xG(t), suelo: SUELO - R.h, s: S, espejo: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 - 26 * ruegaBote },
      torso: b.torso, torsoEsc: { x: 1, y: b.tey + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }, tirasLimpias: true, ikContinuo: false
    };
    // tirones del látigo en el torso y la cabeza
    const lat = tramo(t, T.latigo0, T.latigo0 + 0.15) * (1 - tramo(t, T.latigo1 - 0.1, T.sienta));
    const w1 = Math.sin((t - T.latigo0) * 6.1);
    p.torso += lat * (0.26 * Math.sin((t - T.latigo0) * 9.3 + 1.1) + 0.08 * ruido(t * 5));
    p.cabeza.ang += lat * 0.16 * Math.sin((t - T.latigo0) * 6.1 + 2.2);
    p.pelvis.y -= lat * (34 * Math.max(0, -w1) - 16 * Math.max(0, w1));      // lo levanta de puntillas y lo aplasta
    // arrastre: traqueteo
    const arr = tramo(t, T.arrastra0, T.arrastra0 + 0.15) * (1 - tramo(t, T.arrastra1 - 0.1, T.arrastra1 + 0.1));
    p.pelvis.y -= arr * 10 * Math.abs(Math.sin(t * 17));
    p.cabeza.ang += arr * 0.05 * Math.sin(t * 17);
    // jinete: el cuerpo se dobla con cada bote
    const jin = tramo(t, T.alza1, T.alza1 + 0.25) * (1 - tramo(t, T.cierra1, T.cae));
    p.torso += jin * 0.12 * Math.sin((t - T.alza1) * 4.6 + 1.6);
    p.cabeza.ang += jin * 0.14 * Math.sin((t - T.alza1) * 4.6 + 2.4);
    // al caer en el charco: aplastado un momento
    const plaf = t > T.cae ? Math.exp(-(t - T.cae) * 9) * suave(fase(t, T.cae, T.cae + 0.07)) : 0;
    p.pelvis.y += 22 * plaf; p.torsoEsc.y -= 0.06 * plaf; p.cabeza.dy = 8 * plaf;
    p.R = R;
    // piernas: de pie (pasos) → sentado con las piernas hacia delante → colgando a los lados de la manguera
    const sen = b.sen;
    const sgn = -1;                                   // espejo: hoja +x = pantalla −x
    for (const lado of ["cerca", "lejos"]) {
      const f = pieG(lado, t);
      const pie = { x: G.PELVIS.x + (f.x - p.x) / S * sgn, y: TOB_G - f.alto - (lado === "lejos" ? 12 : 0) };
      // sentado en el suelo: rodillas arriba, talones delante
      const delante = lado === "cerca" ? 236 : 300;
      const sentado = { x: G.PELVIS.x + delante, y: TOB_G - 16 - (lado === "lejos" ? 8 : 0) };
      // a horcajadas: piernas colgando y pataleando
      const pat = Math.sin((t - T.alza1) * 9 + (lado === "cerca" ? 0 : 2.2));
      const cuelga = { x: G.PELVIS.x + (lado === "cerca" ? 215 : 245) + 34 * pat * jin, y: p.pelvis.y + 300 - 50 * Math.max(0, pat) * jin };
      const kc = tramo(t, T.arrastra1 - 0.05, T.alza1) * (1 - tramo(t, T.cierra1 + 0.1, T.cae));
      let q = mezcla(pie, sentado, sen);
      q = mezcla(q, cuelga, kc);
      // al arrastrarle, los pies rebotan
      q.y -= arr * 26 * Math.abs(Math.sin(t * 13 + (lado === "cerca" ? 0 : 1.3)));
      const ang = lerp(0, lado === "cerca" ? -1.05 : -0.8, sen) + kc * ((lado === "cerca" ? 1.35 : 1.1) + 0.3 * pat * jin);
      p.piernas[lado] = { tob: q, ang };
    }
    // cara
    const e = linea(GUION_CG, CG, "inicio", t);
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.cara.rubor = e.rub;
    if (t > T.chorro && t < T.cierra1) p.cara.boca.abre += 5 * Math.sin(t * 29) * (1 - tramo(t, T.yeehaw - 0.2, T.yeehaw));
    return p;
  }
  const pecho = p => G.aPantalla(p, G.tronco(p)({ x: 250, y: 470 }));

  /* ================= Marcos (mira a la derecha) ================= */
  const CM = {
    inicio: E({ mx: 0.85, my: 0.05, orig: 1 }),
    ceja: E({ mx: 0.9, my: 0, sd: 4, si: 18, gi: 0.18, orig: 0, sonr: -0.1, ancho: 0.8 }),
    suspira: E({ mx: 0.5, my: -0.4, c: 1, sd: 10, si: 10, orig: 0, abre: 6, ancho: 0.6, sonr: -0.15 }),
    ofrece: E({ mx: 0.9, my: 0.1, sd: 6, si: 8, orig: 0, sonr: 0.35, ancho: 0.9 }),
    tranquilo: E({ mx: 0.9, my: 0.05, c: 0.25, sd: 4, si: 4, orig: 0, sonr: 0.2, ancho: 0.85 }),
    mira: E({ mx: 0.92, my: -0.2, c: 0.2, sd: 8, si: 14, gi: 0.1, orig: 0, sonr: 0.05, ancho: 0.75 }),
    aburre: E({ mx: 0.9, my: -0.4, c: 0.55, sd: -2, si: 2, orig: 0, sonr: -0.1, ancho: 0.7 }),
    camara: E({ mx: -0.85, my: 0, c: 0.5, sd: 0, si: 10, gi: 0.12, orig: 0, sonr: -0.05, ancho: 0.7 }),
    cierra: E({ mx: 0.9, my: 0.1, c: 0.4, sd: 2, si: 2, orig: 0, sonr: 0.1, ancho: 0.75 }),
    encoge: E({ mx: -0.85, my: -0.05, c: 0.2, sd: 16, si: 16, gd: 0.12, gi: 0.12, orig: 0, sonr: -0.35, ancho: 0.8 })
  };
  const GUION_CM = [
    [T.ceja, T.ceja + 0.3, "ceja"], [T.suspira, T.suspira + 0.2, "suspira"], [T.ofrece0, T.ofrece0 + 0.3, "ofrece"],
    [T.suelta + 0.1, T.suelta + 0.4, "tranquilo"], [T.chorro + 0.4, T.chorro + 0.7, "mira"], [T.aburre, T.aburre + 0.3, "camara"],
    [T.aburre + 0.65, T.aburre + 0.9, "aburre"], [T.cierra0 - 0.1, T.cierra0 + 0.2, "cierra"], [T.cae + 0.1, T.cae + 0.4, "mira"],
    [T.encoge, T.encoge + 0.3, "encoge"]
  ];
  const PARP_M = [0.55, 2.3, 4.0, 6.4, 8.2, 10.7, 12.6];
  const PASOS_M = {
    cerca: [[-9, -8, 296], [T.mAtras0, T.mAtras0 + 0.28, 256], [T.mAtras0 + 0.36, T.mAtras0 + 0.62, 218]],
    lejos: [[-9, -8, 366], [T.mAtras0 + 0.18, T.mAtras0 + 0.46, 326], [T.mAtras0 + 0.5, T.mAtras0 + 0.65, 289]]
  };
  function pieM(lado, t) {
    const L = PASOS_M[lado]; let i = 0; while (i + 1 < L.length && t >= L[i + 1][0]) i++;
    const [t0, t1, x] = L[i], xa = i > 0 ? L[i - 1][2] : x, u = fase(t, t0, t1);
    return { x: lerp(xa, x, suave(u)), alto: 40 * Math.sin(Math.PI * u) };
  }
  const xM = t => lerp(330, 252, suave(fase(t, T.mAtras0, T.mAtras1)));
  const TOB_M = MB.SUELO - MB.TOBILLO_ALTO;
  function cuerpoM(t) {
    const respira = Math.sin(t * 2.1 + 1.1);
    // salto a la comba cuando pasa la ola de la manguera
    const sal = campana(t, T.salta, T.salta + 0.3);
    const agacha = 18 * campana(t, T.salta - 0.12, T.salta + 0.02) + 22 * campana(t, T.salta + 0.26, T.salta + 0.42);
    const enc = campana(t, T.encoge, T.encoge + 0.75);
    const p = {
      x: xM(t), suelo: SUELO - 46 * sal, s: S,
      pelvis: { x: MB.PELVIS.x, y: MB.PELVIS.y + respira * 1.2 + agacha + 10 * tramo(t, T.valv0, T.valv0 + 0.25) * (1 - tramo(t, T.valv1, T.valv1 + 0.3)) },
      torso: -0.03 * tramo(t, T.valv0, T.valv0 + 0.3) * (1 - tramo(t, T.valv1, T.valv1 + 0.3)) + 0.05 * campana(t, T.suspira, T.suspira + 0.6),
      torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.02 * enc }, piernas: {},
      cabeza: { ang: -0.05 * campana(t, T.suspira, T.suspira + 0.6) + 0.04 * Math.sin(t * 0.9), dx: 0, dy: 7 * enc, esc: { x: 1, y: 1 } },
      tirasLimpias: true
    };
    for (const lado of ["cerca", "lejos"]) {
      const f = pieM(lado, t);
      p.piernas[lado] = { tob: { x: MB.PELVIS.x + (f.x - p.x) / S, y: TOB_M - f.alto - (lado === "lejos" ? 10 : 0) - 40 * sal }, ang: -0.25 * sal * (lado === "cerca" ? 1 : 0.7) };
    }
    const e = linea(GUION_CM, CM, "inicio", t);
    p.cara = cara(e, parpadeo(t, PARP_M));
    return p;
  }

  /* ================= la lanza (objeto del mundo) ================= */
  // pose: {x, y} = centro del puño de la lanza (origen de MB.dibLanza), a = hacia dónde apunta la boca
  const ofrecida = t => {
    const p = cuerpoM(t), h = MB.aPantalla(p, MB.tronco(p)(MB.HOMBRO));
    const cadera = { x: h.x + 16, y: h.y + 90 }, ofrece = { x: h.x + 66, y: h.y + 10 };
    const k = suave5(fase(t, T.ofrece0, T.ofrece1));
    const c = mezcla(cadera, ofrece, k);
    c.y += -4 * campana(t, T.suspira, T.suspira + 0.6);
    // de apuntar hacia abajo y adelante a apuntar hacia arriba (pasa por delante)
    return { x: c.x, y: c.y, a: lerp(0.75, -Math.PI / 2, k) + 0.03 * Math.sin(t * 1.7) };
  };
  let OFF0 = null;
  // en el sistema local de Guillermo (antes de girar con el rodeo): respecto a su pecho
  function lanzaLocal(t, p) {
    if (!OFF0) { const q = cuerpoG(T.toma), c = pecho(q), o = ofrecida(T.toma); OFF0 = { x: o.x - c.x, y: o.y - c.y, a: o.a }; }
    const c = pecho(p);
    // poses relativas al pecho (px) y ángulo de la boca
    const APUNTA = { x: -44, y: -14, a: -2.25 };
    let o = { x: OFF0.x, y: OFF0.y, a: OFF0.a };
    const k1 = suave5(fase(t, T.suelta - 0.05, T.apunta1));
    o = { x: lerp(o.x, APUNTA.x, k1), y: lerp(o.y, APUNTA.y, k1), a: lerp(o.a, APUNTA.a, k1) };
    o.y += 4 * Math.sin(t * 2.3) * tramo(t, T.apunta1, T.apunta1 + 0.3) * (1 - tramo(t, T.chorro, T.chorro + 0.1));
    // la mira de reojo cuando llega el bulto: la baja un poco
    o.a += 0.25 * campana(t, T.mira, T.chorro + 0.05); o.y += 8 * campana(t, T.mira, T.chorro + 0.05);
    // retroceso y latigazos
    const ret = campana(t, T.chorro, T.chorro + 0.35);
    o.x += 14 * ret; o.y -= 10 * ret; o.a += 0.4 * ret;
    const lat = tramo(t, T.latigo0, T.latigo0 + 0.15) * (1 - tramo(t, T.latigo1 - 0.15, T.sienta));
    const w1 = Math.sin((t - T.latigo0) * 6.1), w2 = Math.sin((t - T.latigo0) * 9.3 + 1.1);
    o.x += lat * (30 * w2); o.y += lat * (-46 * w1 + 10 * ruido(t * 4.4)); o.a += lat * (0.55 * w1 + 0.25 * w2 + 0.3);
    // sentado (arrastre): la sujeta delante, apuntando hacia delante y un poco arriba
    const ARR = { x: -48, y: 18, a: Math.PI + 0.6 };
    const ks = suave(fase(t, T.latigo1 - 0.05, T.sienta + 0.2));
    const aArr = ARR.a + 0.12 * Math.sin(t * 11) * tramo(t, T.arrastra0, T.arrastra0 + 0.2);
    o = { x: lerp(o.x, ARR.x, ks), y: lerp(o.y, ARR.y + 6 * Math.sin(t * 17) * tramo(t, T.arrastra0, T.arrastra0 + 0.1), ks), a: lerp(o.a, aArr - 2 * Math.PI, ks) };
    // a horcajadas: apunta abajo y adelante (el chorro le sostiene en el aire)
    const kj = suave(fase(t, T.arrastra1 - 0.05, T.alza1));
    const JIN = { x: -46, y: 10, a: -Math.PI - 1.05 + 0.25 * Math.sin((t - T.alza1) * 4.6 + 0.3) * tramo(t, T.alza1, T.alza1 + 0.3) };
    o = { x: lerp(o.x, JIN.x, kj), y: lerp(o.y, JIN.y, kj), a: lerp(o.a, JIN.a + 0 * Math.PI, kj) };
    // en el charco: la deja en el regazo y luego se asoma a la boca
    const kc = suave(fase(t, T.cierra1, T.cae + 0.2));
    const REG = { x: -40, y: 34, a: -Math.PI + 0.25 };
    o = { x: lerp(o.x, REG.x, kc), y: lerp(o.y, REG.y, kc), a: lerp(o.a, REG.a, kc) };
    const ka = suave5(fase(t, T.asoma0, T.asoma0 + 0.4));
    const ojo = G.aPantalla(p, G.cabeza(p).a({ x: 771, y: 563 })), dAs = -0.66;
    const bocaAs = { x: ojo.x - 30, y: ojo.y + 22 };
    const ASOMA = { x: bocaAs.x - Math.cos(dAs) * BOCA * U - c.x, y: bocaAs.y - Math.sin(dAs) * BOCA * U - c.y, a: dAs };
    o = { x: lerp(o.x, ASOMA.x, ka), y: lerp(o.y, ASOMA.y, ka), a: lerp(o.a, ASOMA.a, ka) };
    // el chorrito le echa la cabeza atrás y la lanza da un respingo
    const pum = t > T.chorrito ? Math.exp(-(t - T.chorrito) * 6) * suave(fase(t, T.chorrito, T.chorrito + 0.05)) : 0;
    o.y += 10 * pum; o.a += 0.3 * pum;
    // al bajar, la vuelve a dejar en el regazo
    const kb = suave(fase(t, T.chorrito + 0.5, T.chorrito + 0.9));
    o = { x: lerp(o.x, REG.x, kb), y: lerp(o.y, REG.y, kb), a: lerp(o.a, REG.a, kb) };
    return { x: c.x + o.x, y: c.y + o.y, a: o.a };
  }
  // del sistema local de Guillermo al mundo (rodeo: giro alrededor de la pelvis)
  function giroG(p) {
    const piv = G.aPantalla(p, p.pelvis), r = p.R.rho;
    return { piv, r, f: q => { const d = rot({ x: q.x - piv.x, y: q.y - piv.y }, r); return { x: piv.x + d.x, y: piv.y + d.y }; } };
  }
  const puntoLanza = (L, u) => ({ x: L.x + Math.cos(L.a) * u * U, y: L.y + Math.sin(L.a) * u * U });

  /* ---------- manos sobre la lanza ---------- */
  // mano del montaje (hoja) que agarra el punto `q` de la lanza con ángulo de boca `a` (pantalla)
  function manoEn(P, p, q, a, hombro) {
    const h = P.aHoja(p, q), sx = p.espejo ? -1 : 1;
    const ah = Math.atan2(Math.sin(a), Math.cos(a) * sx);         // dirección de la boca en la hoja
    const ang = ah - Math.PI / 2;
    const wd = rot({ x: hombro.x - h.x, y: hombro.y - h.y }, -ang);
    return { x: h.x, y: h.y, ang, mu: Math.atan2(wd.y, wd.x), dobla: -1, puno: 1, dedos: AGARRA };
  }

  function poseG(t) {
    const p = cuerpoG(t);
    const Tr = G.tronco(p), hl = Tr(G.HOMBRO), hc = Tr(G.HOMBRO_C);
    const L = t >= T.toma ? lanzaLocal(t, p) : null;
    // manos: suplica con las palmas juntas bajo la barbilla → la lejana coge la lanza por delante →
    // cuando Marcos la suelta, la cercana la agarra por detrás
    const bl = G.aPantalla(p, hl), bc = G.aPantalla(p, hc), c = pecho(p);
    const ruegaK = tramo(t, T.ruega0 - 0.1, T.ruega0 + 0.3) * (1 - tramo(t, T.paso0, T.toma - 0.3));
    const bote = 4 * Math.sin((t - T.ruega0) * 7.5) * ruegaK;
    const J = { x: c.x - 30, y: c.y - 34 + bote };
    const REZA = D(0.85, 1, 1);
    const bolL = { x: c.x - 26, y: c.y + 90 }, bolC = { x: c.x + 30, y: c.y + 92 };
    const reza = (q, ang) => { const h = G.aHoja(p, q); return { x: h.x, y: h.y, ang, mu: 1.5, dobla: -1, puno: 1, dedos: REZA }; };
    const mezM = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), ang: lerp(a.ang, b.ang, k), mu: lerp(a.mu, b.mu, k), dobla: -1,
      puno: lerp(a.puno, b.puno, k), dedos: mezclaD(a.dedos, b.dedos, k) });
    const enBolsa = q => { const h = G.aHoja(p, q); return { x: h.x, y: h.y, ang: 0, mu: -1.75, dobla: -1, puno: 0, dedos: PUNO }; };
    const espera = (() => { const h = G.aHoja(p, { x: c.x - 12, y: c.y + 16 }); return { x: h.x, y: h.y, ang: 0, mu: -1.6, dobla: -1, puno: 1, dedos: D(0.6, 0.7, 0.7) }; })();
    let ml, mc;
    if (L) {
      const del = puntoLanza(L, 15), tras = puntoLanza(L, -11);
      ml = manoEn(G, p, del, L.a, hl);
      const mT = manoEn(G, p, tras, L.a, hc);
      mc = mezM(espera, mT, suave5(fase(t, T.suelta - 0.05, T.suelta + 0.3)));
    } else {
      const sigue = tramo(t, T.toma - 0.4, T.toma, suave5);
      const o = ofrecida(t), agarre = manoEn(G, p, puntoLanza(o, 15), o.a, hl);
      ml = mezM(mezM(enBolsa(bolL), reza({ x: J.x - 3, y: J.y }, 0.12), ruegaK), agarre, sigue);
      mc = mezM(mezM(enBolsa(bolC), reza({ x: J.x + 4, y: J.y + 3 }, -0.1), ruegaK), espera, sigue);
    }
    // a horcajadas, a la tercera sacudida suelta una mano y la agita en el aire («¡yiha!»)
    const yi = tramo(t, T.yeehaw - 0.2, T.yeehaw + 0.15) * (1 - tramo(t, T.cierra0 + 0.1, T.cierra1));
    if (yi > 0) {
      const arriba = { x: bc.x + 26 + 18 * Math.sin((t - T.yeehaw) * 13), y: bc.y - 82 + 6 * Math.sin((t - T.yeehaw) * 9) };
      const a = G.aHoja(p, arriba);
      mc = Object.assign({}, mc, { x: lerp(mc.x, a.x, yi), y: lerp(mc.y, a.y, yi), ang: lerp(mc.ang, 0.35 * Math.sin((t - T.yeehaw) * 13), yi),
        mu: lerp(mc.mu, -4.55, yi), dedos: mezclaD(mc.dedos, PALMA, yi), suelta: yi > 0.5 });
    }
    p.manoLejos = ml; p.manoCerca = mc;
    p.lanza = L;
    // mojado
    p.moja = clamp((t - T.chorro - 0.1) / 1.4) * 0.6 + 0.4 * tramo(t, T.cae, T.cae + 0.3) + 0.3 * tramo(t, T.chorrito, T.chorrito + 0.1);
    p.capaCabeza = (g, tt) => mojado(g, tt, p.moja, true);
    return p;
  }

  function poseM(t, pG) {
    const p = cuerpoM(t);
    const Tr = MB.tronco(p), hl = Tr(MB.HOMBRO), hc = Tr(MB.HOMBRO_C);
    // mano lejana: sujeta la lanza (hasta soltarla) → en la cadera → encoge con la palma arriba
    let ml;
    const sueltaK = suave5(fase(t, T.suelta, T.suelta + 0.4));
    const L = t < T.toma ? ofrecida(t) : lanzaMundo(pG || poseG(t));
    const agarre = manoEn(MB, p, puntoLanza(L, -11), L.a, hl);
    const cadera = MB.aHoja(p, { x: MB.aPantalla(p, hl).x + 30, y: MB.aPantalla(p, hl).y + 92 });
    const enc = tramo(t, T.encoge, T.encoge + 0.3) * (1 - tramo(t, T.encoge + 0.75, T.encoge + 1.05));
    const encL = MB.aHoja(p, { x: MB.aPantalla(p, hl).x + 40, y: MB.aPantalla(p, hl).y + 48 });
    if (sueltaK <= 0) ml = agarre;
    else {
      const m = mezcla(agarre, cadera, sueltaK);
      ml = { x: m.x, y: m.y, ang: lerp(agarre.ang, 0.4, sueltaK), mu: lerp(agarre.mu, -2.6, sueltaK), dobla: 1, puno: 1, dedos: mezclaD(AGARRA, PUNO, sueltaK) };
    }
    if (enc > 0) { const m = mezcla(ml, encL, enc); ml = Object.assign({}, ml, { x: m.x, y: m.y, ang: lerp(ml.ang, 0, enc), mu: lerp(ml.mu, -3.54, enc), dedos: mezclaD(ml.dedos, PALMA, enc) }); }
    // mano cercana: suelta → a la rueda de la válvula (sin mirar) → la gira → se apoya → la cierra → encoge
    const rep = MB.manoReposo(p, "cerca");
    const g0 = giroRueda(t), R = VAL.rueda;
    const enRueda = { x: R.x + Math.cos(-2.1 + g0) * R.r * 0.85, y: R.y + Math.sin(-2.1 + g0) * R.r * 0.85 };
    const ruedaH = MB.aHoja(p, enRueda);
    const va = suave5(fase(t, T.valv0 - 0.15, T.valv0 + 0.15)) * (1 - suave5(fase(t, T.encoge - 0.15, T.encoge + 0.15)));
    const encC = MB.aHoja(p, { x: MB.aPantalla(p, hc).x - 40, y: MB.aPantalla(p, hc).y + 50 });
    let mc = Object.assign({}, rep);
    if (va > 0) { const m = mezcla(rep, ruedaH, va); mc = { x: m.x, y: m.y, ang: lerp(rep.ang || 0, 0.6 + g0 * 0.05, va), mu: lerp(rep.mu ?? -1.75, -1.0, va), dobla: -1, puno: 1, dedos: mezclaD(rep.dedos || D(0.5, 0.6, 0.5), AGARRA, va) }; }
    if (enc > 0) { const m = mezcla(mc, encC, enc); mc = Object.assign({}, mc, { x: m.x, y: m.y, ang: lerp(mc.ang, 0, enc), mu: lerp(mc.mu, 0.4, enc), dedos: mezclaD(mc.dedos, PALMA, enc) }); }
    p.manoLejos = ml; p.manoCerca = mc;
    p.sujeta = t < T.suelta + 0.02;
    return p;
  }
  function lanzaMundo(pG) {
    const L = pG.lanza; if (!L) return null;
    const Gr = giroG(pG), q = Gr.f(L);
    return { x: q.x, y: q.y, a: L.a + Gr.r };
  }
  function lanzaActual(t, pG) { return t < T.toma ? ofrecida(t) : lanzaMundo(pG); }

  /* ---------- mojado: gotas en el pelo y brillo en la cara (coordenadas del retrato) ---------- */
  function mojado(g, t, k, guille) {
    if (k <= 0.01) return;
    g.save(); g.lineCap = "round";
    // brillos de agua sobre el pelo y la frente
    g.globalAlpha = 0.55 * k; g.strokeStyle = "rgba(220,240,255,0.9)"; g.lineWidth = 7;
    for (const [x, y, l, a] of [[640, 300, 60, 0.5], [760, 250, 70, 0.2], [880, 290, 50, -0.3], [700, 470, 40, 0.1], [930, 520, 30, 0.4]]) {
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    // gotas que caen del pelo y de la barbilla
    g.globalAlpha = 1;
    for (let i = 0; i < 6; i++) {
      const x0 = [610, 700, 980, 1040, 820, 900][i], y0 = [420, 360, 380, 470, 820, 800][i];
      const per = 0.7 + 0.3 * hash(i + 40), ph = ((t / per) + hash(i + 41)) % 1, a = clamp(k * 2 - i * 0.25);
      if (a <= 0) continue;
      const y = y0 + ph * ph * 260, s = 12 * (1 - 0.4 * ph);
      g.globalAlpha = a * (1 - ph * 0.6);
      g.beginPath(); g.moveTo(x0, y - s * 1.6); g.quadraticCurveTo(x0 + s, y, x0, y + s); g.quadraticCurveTo(x0 - s, y, x0, y - s * 1.6);
      g.fillStyle = "#bfe8ff"; g.fill(); g.lineWidth = 4; g.strokeStyle = "#1d3b52"; g.stroke();
      g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x0 - s * 0.3, y - s * 0.1, s * 0.22, s * 0.35, 0, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  /* ================= manguera ================= */
  // ola grande que recorre la manguera por el suelo (para que Marcos la salte) y olas pequeñas del látigo
  function alturaSuelo(x, t) {
    let h = 0;
    const kl = tramo(t, T.latigo0, T.latigo0 + 0.25) * (1 - tramo(t, T.cierra1 - 0.1, T.cierra1 + 0.25));
    h += kl * 26 * Math.pow(Math.max(0, Math.sin(x * 0.022 - t * 9)), 2);
    // la ola de la comba: sale de la válvula y pasa bajo los pies de Marcos en T.salta + 0.15
    const xo = VAL.boca.x + (t - (T.salta - 0.05)) * 520;
    h += 46 * Math.exp(-Math.pow((x - xo) / 34, 2)) * campana(t, T.salta - 0.1, T.salta + 0.55);
    return h;
  }
  // puntos de la manguera: válvula → suelo → (sale del suelo en Q) → bajo el asiento S → cola de la lanza
  function puntosManguera(t, pG, pM) {
    const L = lanzaActual(t, pG);
    const cola = puntoLanza(L, COLA - 2), dcola = dirA(L.a + Math.PI);
    const gy = SUELO - 7;
    const B = VAL.boca;
    // dónde deja el suelo: junto a quien la lleva
    const quien = t < T.toma + 0.1 ? pM.x + 42 : pG.x + 34;
    const kSent = tramo(t, T.latigo1 - 0.05, T.sienta + 0.1);
    const kJin = tramo(t, T.arrastra1 - 0.1, T.alza1) * (1 - tramo(t, T.cierra1, T.cae));
    const kFin = tramo(t, T.cierra1, T.cae + 0.3);                 // ya en el charco: la manguera le llega por delante
    const qx = lerp(lerp(lerp(quien, pG.x + 70, kSent), pG.x + 150, kJin), pG.x - 78, kFin);
    const pts = [{ x: B.x, y: B.y }, { x: B.x + 16, y: B.y + 6 }, { x: B.x + 34, y: gy }];
    const x0 = B.x + 34;
    const n = Math.max(2, Math.round((qx - x0) / 48));
    for (let i = 1; i <= n; i++) { const x = lerp(x0, qx, i / n); pts.push({ x, y: gy - alturaSuelo(x, t) }); }
    const Q = pts[pts.length - 1];
    // asiento: bajo la pelvis de Guillermo (en el mundo)
    const Gr = giroG(pG), piv = G.aPantalla(pG, pG.pelvis);
    const asiento = Gr.f({ x: piv.x + 10, y: piv.y + 18 });
    const kS = kSent * (1 - kFin);
    const atras = [];
    if (kJin > 0.01) {
      // se encabrita: sube del suelo detrás de él en curva
      atras.push({ x: lerp(Q.x, Q.x + 10, kJin), y: lerp(Q.y, Q.y - 70, kJin) });
      atras.push({ x: lerp(Q.x - 20, asiento.x + 40, kJin), y: lerp(Q.y, asiento.y + 18, kJin) });
    }
    // tramo delantero (se dibuja delante de Guillermo): del asiento (o de Q) a la cola
    const S0 = { x: lerp(Q.x - 18, asiento.x, kS), y: lerp(Q.y, asiento.y, kS) };
    const delante = [S0];
    // de S a la cola: sale por detrás de la cola, con una curva que cuelga
    const caida = 36 * (1 - kS * 0.6) * (1 - 0.7 * kFin);
    const ctrl = { x: cola.x + dcola.x * 26 * S / 0.27, y: cola.y + dcola.y * 26 + caida * 0.6 };
    delante.push({ x: lerp(S0.x, ctrl.x, 0.5), y: Math.max(lerp(S0.y, ctrl.y, 0.5) + caida * 0.6, Math.min(S0.y, ctrl.y)) });
    delante.push(ctrl, cola);
    return { detras: pts.concat(atras).concat([S0]), delante };
  }
  // curva densa (Catmull-Rom) para medir y para el bulto
  function densa(pts, n = 6) {
    const out = [], P = i => pts[Math.max(0, Math.min(pts.length - 1, i))];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      for (let k = 0; k < n; k++) { const u = k / n, u2 = u * u, u3 = u2 * u;
        out.push({ x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * u + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3),
                   y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * u + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3) }); }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  // bulto de agua que recorre la manguera antes del chorro (u: 0 válvula … 1 cola)
  function bulto(g, dens, u, k) {
    if (k <= 0.01) return;
    const L = [0]; for (let i = 1; i < dens.length; i++) L.push(L[i - 1] + Math.hypot(dens[i].x - dens[i - 1].x, dens[i].y - dens[i - 1].y));
    const tot = L[L.length - 1], c = u * tot, half = 24;
    const seg = []; for (let i = 0; i < dens.length; i++) if (L[i] > c - half && L[i] < c + half) seg.push(dens[i]);
    if (seg.length < 2) return;
    const w = 26 * S * (1 + 1.1 * k);
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    const camino = () => { g.beginPath(); g.moveTo(seg[0].x, seg[0].y); for (const q of seg) g.lineTo(q.x, q.y); };
    camino(); g.strokeStyle = "#0b0a0e"; g.lineWidth = w + 2 * Math.max(1.6, 5 * S); g.stroke();
    camino(); g.strokeStyle = "#c92633"; g.lineWidth = w; g.stroke();
    g.save(); g.translate(-w * 0.18, -w * 0.22); camino(); g.strokeStyle = "rgba(255,170,175,0.8)"; g.lineWidth = w * 0.2; g.stroke(); g.restore();
    g.restore();
  }

  /* ================= agua ================= */
  // gotas lanzadas desde la boca de la lanza (balísticas, deterministas)
  function gotas(g, t, bocaEn) {
    if (t < T.chorro) return;
    g.save(); g.fillStyle = "#bfe8ff"; g.strokeStyle = "rgba(20,70,120,0.85)"; g.lineWidth = 1.4;
    for (let i = 0; i < 34; i++) {
      const per = 0.9 + 0.5 * hash(i + 7), ciclo = Math.floor((t - T.chorro) / per + hash(i)), t0 = T.chorro + (ciclo - hash(i)) * per;
      const u = t - t0; if (t0 < T.chorro || t0 > T.cierra1) continue;
      const B = bocaEn(t0); if (!B || B.f < 0.2) continue;
      const a = B.a + (hash(i * 3 + ciclo) - 0.5) * 1.2, v = 260 + 260 * hash(i * 5 + ciclo);
      const x = B.x + Math.cos(a) * v * u, y = B.y + Math.sin(a) * v * u + 600 * u * u;
      if (y > SUELO + 30) continue;
      const r = 2.2 + 2.6 * hash(i + ciclo * 3);
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    g.restore();
  }
  // punto donde el chorro toca el suelo (o null)
  function impacto(boca, largo, f) {
    const L = largo * f, cx = Math.cos(boca.ang), cy = Math.sin(boca.ang);
    for (let i = 1; i <= 30; i++) { const d = L * i / 30, y = boca.y + cy * d + 0.35 * d * d / largo; if (y > SUELO - 2) return { x: boca.x + cx * d, y: SUELO - 2, k: i / 30 }; }
    return null;
  }
  function salpica(g, x, y, t, k, tam = 1) {
    if (k <= 0.01) return;
    g.save(); g.strokeStyle = "rgba(210,236,255,0.9)"; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = 0; i < 9; i++) {
      const ph = ((t * 3.1 + hash(i + 70)) % 1), a = -Math.PI / 2 + (hash(i + 71) - 0.5) * 2.4;
      const d = (10 + 40 * ph) * tam, yy = y - Math.sin(Math.PI * ph) * 26 * tam;
      g.globalAlpha = k * (1 - ph);
      g.beginPath(); g.moveTo(x + Math.cos(a) * d * 0.6, yy + Math.sin(a) * d * 0.3); g.lineTo(x + Math.cos(a) * d, yy + Math.sin(a) * d * 0.5); g.stroke();
    }
    g.globalAlpha = 0.55 * k; g.fillStyle = "rgba(220,240,255,0.8)";
    g.beginPath(); g.ellipse(x, y + 2, 22 * tam, 6 * tam, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // corona del chapuzón en el charco
  function chapuzon(g, x, t) {
    const k = fase(t, T.cae, T.cae + 0.75); if (k <= 0 || k >= 1) return;
    g.save(); g.lineCap = "round";
    for (let i = 0; i < 16; i++) {
      const a = -Math.PI + (i + 0.5) / 16 * Math.PI, v = 140 + 120 * hash(i + 90);
      const dx = Math.cos(a) * v * k * 0.75, dy = Math.sin(a) * v * k * 0.9 + 520 * k * k * 0.75;
      g.globalAlpha = (1 - k) * clamp(k * 14); g.fillStyle = "#cdeeff"; g.strokeStyle = "rgba(20,70,120,0.85)"; g.lineWidth = 1.5;
      g.beginPath(); g.arc(x + dx, SUELO - 6 + dy * 0.6 - 10, 3.5 + 2 * hash(i + 91), 0, Math.PI * 2); g.fill(); g.stroke();
    }
    g.globalAlpha = 0.7 * (1 - k) * clamp(k * 14); g.strokeStyle = "rgba(220,240,255,0.95)"; g.lineWidth = 3;
    g.beginPath(); g.ellipse(x, SUELO + 2, 40 + 120 * k, 7 + 14 * k, 0, 0, Math.PI * 2); g.stroke();
    g.restore();
  }
  // charcos que crecen con el agua
  const CHARCOS = [[420, 8, 3.0, 5.6, 92], [560, 6, 6.8, 8.2, 80], [790, 4, 8.6, 10.6, 150]];
  function charcos(g, t) {
    g.save();
    for (const [x, ry, t0, t1, rx] of CHARCOS) {
      const k = tramo(t, t0, t1, salida); if (k <= 0.01) continue;
      const w = rx * k;
      g.fillStyle = "rgba(120,170,210,0.55)"; g.beginPath(); g.ellipse(x, SUELO + 10, w, (ry + 6) * (0.4 + 0.6 * k), 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "rgba(235,248,255,0.55)"; g.beginPath(); g.ellipse(x - w * 0.3, SUELO + 8, w * 0.35, 2.2, 0, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  /* ================= conos ================= */
  const CONOS = [[858, 0], [902, 1], [946, 2]];
  function conos(g, t) {
    for (const [x0, i] of CONOS) {
      const t0 = T.conos + i * 0.06, u = Math.max(0, t - t0);
      let x = x0, y = SUELO, a = 0;
      if (t > t0) {
        const vx = 170 + 60 * i, vy = -260 + 40 * i, tv = Math.min(u, 0.62);
        x = x0 + vx * tv; y = SUELO + vy * tv + 900 * tv * tv * 0.5; a = Math.min(u, 0.62) * (8 + i);
        if (y > SUELO) y = SUELO;
        if (u > 0.62) { // en el suelo, tumbado y rodando un poco
          const r = Math.min(u - 0.62, 0.5); x += 40 * r - 30 * r * r; a = (0.62 * (8 + i)) + r * 2;
          a = lerp(a, Math.PI / 2 + Math.round((a - Math.PI / 2) / Math.PI) * Math.PI, suave(fase(u, 0.62, 1.1)));
          y = SUELO - 9;
        }
      }
      x = Math.min(x, 1000 - i * 6);
      g.save(); g.translate(x, y); g.rotate(a); g.lineJoin = "round";
      g.fillStyle = "#ff6a1a"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(-6, -40); g.lineTo(6, -40); g.lineTo(15, -6); g.lineTo(-15, -6); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#f6f6f2"; g.beginPath(); g.moveTo(-9, -28); g.lineTo(9, -28); g.lineTo(11, -20); g.lineTo(-11, -20); g.closePath(); g.fill();
      g.fillStyle = "#e4500e"; g.fillRect(-20, -7, 40, 7); g.strokeRect(-20, -7, 40, 7);
      g.restore();
    }
  }

  /* ================= válvula ================= */
  function valvula(g, t) {
    const R = VAL.rueda;
    g.save(); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = "#0b0a0e";
    // columna
    g.fillStyle = "#c8202c"; g.lineWidth = 3;
    g.beginPath(); g.rect(VAL.x - 13, R.y + 6, 26, SUELO - R.y - 6); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(VAL.x - 9, R.y + 10, 5, SUELO - R.y - 14);
    g.fillStyle = "#8e141e"; g.fillRect(VAL.x + 6, R.y + 10, 5, SUELO - R.y - 14);
    // base y anillos
    g.fillStyle = "#a81b26"; g.beginPath(); g.rect(VAL.x - 20, SUELO - 14, 40, 14); g.fill(); g.stroke();
    g.beginPath(); g.rect(VAL.x - 17, R.y + 40, 34, 9); g.fill(); g.stroke();
    // salida con racor de latón (aquí va la manguera)
    g.fillStyle = "#d9a93a"; g.beginPath(); g.rect(VAL.x + 10, VAL.boca.y - 9, 14, 18); g.fill(); g.stroke();
    g.fillStyle = "#f3d27a"; g.fillRect(VAL.x + 12, VAL.boca.y - 7, 4, 14);
    // rueda (de frente) que gira
    const gr = giroRueda(t);
    g.translate(R.x, R.y);
    g.fillStyle = "#9aa1ab"; g.beginPath(); g.arc(0, 0, 5, 0, Math.PI * 2); g.fill(); g.stroke();
    g.rotate(gr);
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 8; g.beginPath(); g.arc(0, 0, R.r, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "#d8202c"; g.lineWidth = 5; g.stroke();
    for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; g.strokeStyle = "#0b0a0e"; g.lineWidth = 5; g.beginPath(); g.moveTo(Math.cos(a) * 5, Math.sin(a) * 5); g.lineTo(Math.cos(a) * R.r, Math.sin(a) * R.r); g.stroke();
      g.strokeStyle = "#d8202c"; g.lineWidth = 2.6; g.stroke(); }
    g.fillStyle = "#c9ced6"; g.beginPath(); g.arc(R.r * Math.cos(0.5), R.r * Math.sin(0.5), 4, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.6; g.strokeStyle = "#0b0a0e"; g.stroke();
    g.restore();
  }

  /* ================= decorado: patio de maniobras a pleno sol ================= */
  let fondo = null, vineta = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 80; const g = c.getContext("2d");
    g.translate(40, 40);
    // cielo
    const cielo = g.createLinearGradient(0, 0, 0, 420); cielo.addColorStop(0, "#5fb3ec"); cielo.addColorStop(1, "#cfeaf9");
    g.fillStyle = cielo; g.fillRect(-40, -40, W + 80, 480);
    const sol = g.createRadialGradient(900, 40, 10, 900, 40, 260); sol.addColorStop(0, "rgba(255,250,210,0.9)"); sol.addColorStop(1, "rgba(255,250,210,0)");
    g.fillStyle = sol; g.fillRect(600, 0, 424, 320);
    // nubes
    g.fillStyle = "rgba(255,255,255,0.9)";
    for (const [x, y, s] of [[560, 70, 1], [760, 130, 0.7], [380, 40, 0.6]]) {
      g.beginPath(); for (const [dx, dy, r] of [[0, 0, 26], [26, -10, 30], [56, 0, 24], [30, 8, 24]]) { g.moveTo(x + dx * s + r * s, y + dy * s); g.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2); } g.fill(); }
    // torre de prácticas (derecha, al fondo)
    g.fillStyle = "#9a9ea6"; g.fillRect(720, 60, 150, 390);
    g.fillStyle = "#83878f"; g.fillRect(850, 60, 20, 390);
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(720, 60, 150, 390);
    for (let y = 92; y < 420; y += 70) for (const x of [744, 806]) { g.fillStyle = "#2e3540"; g.fillRect(x, y, 34, 40); g.strokeRect(x, y, 34, 40);
      g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(x + 4, y + 4, 8, 32); }
    g.fillStyle = "#6c7078"; g.fillRect(712, 50, 166, 14); g.strokeRect(712, 50, 166, 14);
    // escalera de la torre
    g.strokeStyle = "#5a5f66"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(880, 120); g.lineTo(880, 440); g.moveTo(898, 120); g.lineTo(898, 440); g.stroke();
    for (let y = 130; y < 440; y += 18) { g.beginPath(); g.moveTo(880, y); g.lineTo(898, y); g.stroke(); }
    // valla metálica
    g.fillStyle = "rgba(120,140,120,0.15)"; g.fillRect(470, 330, 594, 110);
    g.strokeStyle = "rgba(70,80,80,0.45)"; g.lineWidth = 1.2;
    for (let x = 470; x < W + 110; x += 16) { g.beginPath(); g.moveTo(x, 330); g.lineTo(x - 110, 440); g.stroke(); g.beginPath(); g.moveTo(x - 110, 330); g.lineTo(x, 440); g.stroke(); }
    g.strokeStyle = "#4c5552"; g.lineWidth = 4; g.beginPath(); g.moveTo(470, 330); g.lineTo(W + 40, 330); g.stroke();
    for (let x = 480; x < W; x += 120) { g.beginPath(); g.moveTo(x, 326); g.lineTo(x, 440); g.stroke(); }
    // arbustos tras la valla
    g.fillStyle = "#4f8f3e";
    for (let i = 0; i < 10; i++) { const x = 480 + i * 64, r = 24 + 10 * hash(i + 5); g.beginPath(); g.arc(x, 432, r, Math.PI, 0); g.fill(); }
    // parque de bomberos (izquierda): ladrillo y dos portones rojos
    g.fillStyle = "#a34a32"; g.fillRect(-40, 70, 510, 370);
    g.strokeStyle = "rgba(60,20,12,0.45)"; g.lineWidth = 1.4;
    for (let y = 80, f = 0; y < 440; y += 16, f++) { g.beginPath(); g.moveTo(-40, y); g.lineTo(470, y); g.stroke();
      for (let x = (f % 2) * 20 - 40; x < 470; x += 40) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 16); g.stroke(); } }
    g.fillStyle = "#e7dfcf"; g.fillRect(-40, 62, 518, 16); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(-44, 62, 522, 16);
    for (const x0 of [40, 250]) {
      g.fillStyle = "#6e1a14"; g.fillRect(x0 - 8, 182, 196, 260);
      g.fillStyle = "#c62a24"; g.fillRect(x0, 190, 180, 252);
      g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(x0, 190, 180, 252);
      g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = 2;
      for (let y = 220; y < 440; y += 30) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + 180, y); g.stroke(); }
      g.fillStyle = "#cfe6f2"; for (let i = 0; i < 4; i++) { g.fillRect(x0 + 14 + i * 42, 232, 32, 16); g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.6; g.strokeRect(x0 + 14 + i * 42, 232, 32, 16); }
      g.fillStyle = "rgba(255,255,255,0.15)"; g.fillRect(x0 + 6, 196, 10, 240);
    }
    // escudo con llama (sin letras)
    g.save(); g.translate(238, 126);
    g.fillStyle = "#f6c625"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 3;
    g.beginPath(); g.arc(0, 0, 34, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#d8202c"; g.beginPath(); g.moveTo(0, -24); g.bezierCurveTo(18, -6, 16, 14, 0, 22); g.bezierCurveTo(-16, 14, -18, -6, -6, -14); g.bezierCurveTo(-4, -4, 2, -2, 0, -24); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#ffb02e"; g.beginPath(); g.moveTo(0, -4); g.bezierCurveTo(8, 4, 7, 14, 0, 18); g.bezierCurveTo(-7, 14, -8, 6, 0, -4); g.fill();
    g.restore();
    // farol de pared
    g.fillStyle = "#1c1b20"; g.fillRect(452, 140, 8, 30); g.fillStyle = "#ffe7a6"; g.beginPath(); g.ellipse(456, 176, 12, 9, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.stroke();
    // patio de hormigón con líneas amarillas
    const su = g.createLinearGradient(0, 440, 0, H); su.addColorStop(0, "#b9b8b1"); su.addColorStop(1, "#8d8c86");
    g.fillStyle = su; g.fillRect(-40, 440, W + 80, H + 40 - 440);
    g.fillStyle = "#77766f"; g.fillRect(-40, 438, W + 80, 5);
    g.strokeStyle = "rgba(60,60,55,0.25)"; g.lineWidth = 2;
    for (let x = -40; x < W + 200; x += 170) { g.beginPath(); g.moveTo(x, 444); g.lineTo(x - 120, H); g.stroke(); }
    g.beginPath(); g.moveTo(-40, 520); g.lineTo(W + 40, 520); g.stroke();
    g.fillStyle = "#f2c230";
    g.save(); g.transform(1, 0, -0.55, 1, 0, 0);
    for (const x of [380, 560, 740, 920]) g.fillRect(x + 300, 456, 10, 70);
    g.restore();
    g.fillRect(-40, 574, W + 80, 7);
    // rejilla del desagüe
    g.fillStyle = "#4b4a46"; g.fillRect(640, 584, 70, 12); g.strokeStyle = "#2a2a27"; g.lineWidth = 2;
    for (let x = 646; x < 710; x += 8) { g.beginPath(); g.moveTo(x, 585); g.lineTo(x, 595); g.stroke(); }
    // grietas y manchas
    g.strokeStyle = "rgba(50,50,45,0.35)"; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(120, 560); g.lineTo(150, 566); g.lineTo(162, 580); g.moveTo(860, 470); g.lineTo(890, 476); g.lineTo(900, 490); g.stroke();
    return c;
  }
  function creaVineta() {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    const v = g.createRadialGradient(512, 300, 330, 512, 300, 700); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.38)");
    g.fillStyle = v; g.fillRect(0, 0, W, H); return c;
  }

  /* ================= dibujo ================= */
  // mano redibujada encima de la lanza (agarre)
  function manoEncima(g, P, p, mano) {
    const q = P.aPantalla(p, mano), k = p.s * (P.K || 1);
    g.save(); g.translate(q.x, q.y);
    if (p.espejo) g.scale(-1, 1);
    g.rotate(mano.ang || 0); g.scale(P.JK * k, P.JK * k);
    const col = { piel: P.C.piel, sombra: P.C.pielSombra, tinta: P.C.tinta };
    if (mano.dedos) Personaje2D.mano(g, mano, col); else Personaje2D.puno(g, mano.pulgar, col);
    g.restore();
  }
  function dibujaManguera(g, pts) { if (pts.length > 1) MB.manguera(g, pts, S); }

  // chorro y su fuerza
  function bocaChorro(t, pG) {
    const L = lanzaActual(t, pG); if (!L) return null;
    const b = puntoLanza(L, BOCA);
    let f = presion(t);
    // último chorrito en la cara
    const ch = campana(t, T.chorrito - 0.02, T.chorrito + 0.22);
    return { x: b.x, y: b.y, ang: L.a, a: L.a, f, ch };
  }
  // boca del chorro en instantes pasados (para las gotas): se recuerda por instante
  const MEMO = new Map();
  function bocaMemo(t0) {
    const k = Math.round(t0 * 1000);
    if (!MEMO.has(k)) { if (MEMO.size > 400) MEMO.clear(); const b = bocaChorro(t0, poseG(t0)); MEMO.set(k, b ? { x: b.x, y: b.y, a: b.a, f: b.f } : null); }
    return MEMO.get(k);
  }
  const largoChorro = t => {
    const lat = tramo(t, T.latigo0, T.latigo0 + 0.3) * (1 - tramo(t, T.latigo1 - 0.2, T.latigo1 + 0.1));
    let L = 290 - 60 * lat + 40 * Math.sin(t * 3.1) * lat;
    L = lerp(L, 205 + 15 * Math.sin(t * 7), tramo(t, T.latigo1 - 0.25, T.latigo1 + 0.1));
    L = lerp(L, 190, tramo(t, T.arrastra1, T.alza1));
    return L + 8 * Math.sin(t * 5);
  };

  const pose = t => { const g = poseG(t); return { g, m: poseM(t, g) }; };

  // cámara: casi fija; sacudidas en el chorro, el arrastre y el chapuzón
  function camara(t) {
    const ch = t >= T.chorro ? Math.exp(-(t - T.chorro) * 5) : 0;
    const cae = t >= T.cae ? Math.exp(-(t - T.cae) * 6) * suave(fase(t, T.cae, T.cae + 0.07)) : 0;
    const arr = campana(t, T.arrastra0, T.arrastra1) * 0.8 + 1.2 * (t >= T.conos ? Math.exp(-(t - T.conos) * 6) : 0);
    const rod = tramo(t, T.alza1, T.alza1 + 0.3) * (1 - tramo(t, T.cierra1, T.cae)) * 0.8;
    const fin = tramo(t, T.cae + 0.3, T.encoge, suave);
    return { k: 1 + 0.025 * fin, x: 512 + 10 * fin, y: 300 + 6 * fin, sacude: 4 * ch + 7 * cae + 2.5 * arr + 1.5 * rod };
  }

  class GuillermoMarcosManguera extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !MB.listo()) return;
      if (!fondo) { fondo = creaFondo(); vineta = creaVineta(); }
      const pG = poseG(t), pM = poseM(t, pG);
      const luz = tramo(t, NEGRO_INICIO, 0.85, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (cam.sacude > 0.05) g.translate(ruido(t * 41) * cam.sacude, ruido(t * 41 + 9) * cam.sacude * 0.6);
      g.drawImage(fondo, -40, -40);
      charcos(g, t);
      // sombras
      g.save(); g.fillStyle = "rgba(0,0,0,0.28)";
      const alt = Math.max(0, pG.R.h);
      const sg = clamp(1 - alt / 320);
      g.beginPath(); g.ellipse(pG.x + 6, SUELO + 3, (pG.cara && pG.R.h > 1 ? 70 : 82) * sg, 8 * sg, 0, 0, Math.PI * 2); g.fill();
      const sM = clamp(1 - (SUELO - pM.suelo) / 120);
      g.beginPath(); g.ellipse(pM.x + 2, SUELO + 3, 92 * sM, 8 * sM, 0, 0, Math.PI * 2); g.fill();
      g.restore();
      valvula(g, t);
      // manguera: el tramo del suelo por detrás de los dos
      const M = puntosManguera(t, pG, pM);
      const dDet = densa(M.detras), dDel = densa(M.delante);
      dibujaManguera(g, M.detras);
      // bulto de agua que viaja por la manguera
      const ub = fase(t, T.bulto0, T.chorro);
      if (ub > 0 && ub < 1) {
        const todo = dDet.concat(dDel);
        bulto(g, todo, ub, campana(t, T.bulto0 - 0.05, T.chorro + 0.02) * 1.0 + 0.0);
      }
      conos(g, t);
      MB.dibujar(g, pM, t);
      // Guillermo (girado con el rodeo) con la lanza y sus manos encima
      const Gr = giroG(pG);
      g.save();
      if (Math.abs(Gr.r) > 1e-5) { g.translate(Gr.piv.x, Gr.piv.y); g.rotate(Gr.r); g.translate(-Gr.piv.x, -Gr.piv.y); }
      G.dibujar(g, pG, t);
      g.restore();
      // tramo de manguera que va a la lanza (delante del cuerpo)
      dibujaManguera(g, M.delante);
      if (ub > 0 && ub < 1) bulto(g, dDet.concat(dDel), ub, campana(t, T.bulto0 - 0.05, T.chorro + 0.02));
      // la lanza y las manos que la agarran
      const L = lanzaActual(t, pG);
      MB.dibLanza(g, L.x, L.y, L.a, S);
      if (pM.sujeta) manoEncima(g, MB, pM, pM.manoLejos);
      g.save();
      if (Math.abs(Gr.r) > 1e-5) { g.translate(Gr.piv.x, Gr.piv.y); g.rotate(Gr.r); g.translate(-Gr.piv.x, -Gr.piv.y); }
      if (t >= T.toma - 0.02) manoEncima(g, G, pG, pG.manoLejos);
      if (t >= T.suelta + 0.25 && !pG.manoCerca.suelta) manoEncima(g, G, pG, pG.manoCerca);
      g.restore();
      // chorro
      const B = bocaChorro(t, pG);
      if (B && B.f > 0.01) {
        const largo = largoChorro(t);
        const imp = impacto(B, largo, B.f);
        g.save(); g.beginPath(); g.rect(-50, -200, W + 100, SUELO + 202); g.clip();
        MB.chorro(g, B, largo, t, S, B.f);
        g.restore();
        if (imp) salpica(g, imp.x, imp.y, t, B.f, 1.2);
      }
      // gotas que salen disparadas
      gotas(g, t, bocaMemo);
      // el último chorrito, a la cara
      if (B && B.ch > 0.01) MB.chorro(g, B, 46, t, S, B.ch);
      chapuzon(g, pG.x - 6, t);
      // salpicón al barrer los pies y al arrastrarse
      const ka = campana(t, T.arrastra0, T.arrastra1);
      if (ka > 0.01) salpica(g, pG.x + 30, SUELO - 2, t, ka, 1.1);
      g.restore();
      g.drawImage(vineta, 0, 0);
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00024", nombre: "Guillermo y Marcos · La manguera loca", crear: () => new GuillermoMarcosManguera() });
  window.__A2D_00024 = { pose, poseG, poseM, T, DUR };
})();
