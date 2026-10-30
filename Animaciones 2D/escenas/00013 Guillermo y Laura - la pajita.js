"use strict";
/* 00013 · Guillermo y Laura · La pajita
 *
 * Negro → bar tiki al atardecer: Guillermo y Laura, cada uno a un lado de una mesita alta con un
 * cóctel gigante en pecera (sombrilla, rodaja de naranja, guinda y dos pajitas) → se miran con
 * ojitos, ella le hace caídas de pestañas y a él se le suben los colores; salen corazones → se
 * acercan a la vez a las pajitas con los ojos cerrados y sorben despacito → Guillermo abre un ojo,
 * la mira de reojo… y sorbe con todas sus fuerzas: el cóctel baja de golpe en remolino, la sombrilla
 * gira y a él se le hinchan los mofletes → a Laura solo le llega el borboteo del fondo (burbujas y
 * hielos que tintinean); abre los ojos, mira la pecera vacía y luego a él → Guillermo, con los
 * carrillos llenos, traga; le sube un eructo, se tapa la boca… y se le escapa: a Laura se le vuela
 * la melena → él se rasca la cabeza con cara de culpa → Laura, sin inmutarse, coge la guinda por el
 * rabito, se la enseña balanceándola y se la come con mucha chulería → Guillermo hace pucheros y
 * mira a cámara; ella tira el rabito a la pecera y guiña un ojo → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, L = Laura;
  const S = 0.30, SUELO = 560, XG = 372, XL = 650;
  const DUR = 13.4;
  const T = {
    mira0: 0.45, tierno0: 1.0, inclina0: 1.95, inclina1: 2.7, engancha0: 2.25, engancha1: 2.7,
    pilla0: 3.5, sorbe0: 3.95, vacio: 4.95, gluglu1: 5.55, suelta: 5.2, abreL: 5.45, miraVaso: 5.55, miraG: 6.05,
    trago: 6.3, tapa0: 6.62, eructo: 7.35, rasca0: 7.85, rasca1: 9.2,
    coge0: 8.3, pinza: 8.75, sube1: 9.25, boca0: 9.8, muerde: 10.22, suelta0: 10.95, tira: 11.3, guino: 11.75,
    puchero0: 10.35, camara0: 11.1, fin: 12.45
  };

  /* ---------- utilidades de posturas ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, -1.75), l: punoDesde({ x: 372, y: 648 }, -1.75) };
  const BOLS_L = { c: L.BOLSILLO_C, l: L.BOLSILLO_L };
  const rot = (q, a) => ({ x: q.x * Math.cos(a) - q.y * Math.sin(a), y: q.x * Math.sin(a) + q.y * Math.cos(a) });
  const D = (pu, ix, re) => ({ pulgar: pu, indice: ix, medio: re, anular: re, menique: re });

  /* ---------- caras (se mezclan) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, wd: 0, wi: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12,
    dientes: 1, lengua: 0, mof: 0, rub: 0, rojo: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, extraC) {
    const c = clamp(e.c + extraC);
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: 0, ojos: { d: clamp(c + e.wd), i: clamp(c + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* ================= Guillermo ================= */
  const CG = {
    inicio: E({}),
    mira: E({ mx: 0.7, my: 0.5, orig: 0, sonr: 0.55, sd: 8, si: 8 }),
    tierno: E({ mx: 0.9, my: -0.05, c: 0.22, sd: 14, si: 14, gd: 0.08, gi: 0.08, orig: 0, sonr: 0.7, ancho: 0.95, rub: 0.85, rojo: 0.12 }),
    beso: E({ mx: 0.9, c: 1, h: 0.25, sd: 9, si: 9, orig: 0, abre: 4, ancho: 0.52, sonr: 0.12, rub: 0.7 }),
    pilla: E({ mx: 0.95, my: -0.1, c: 1, wi: -0.72, sd: -4, si: 16, gd: -0.05, gi: 0.15, orig: 0, abre: 4, ancho: 0.52, sonr: 0.38, rub: 0.3 }),
    sorbe: E({ mx: 0.9, c: 1, z: 1, sd: -7, si: -7, gd: -0.18, gi: -0.18, orig: 0, abre: 3, ancho: 0.46, sonr: -0.15, mof: 0.95, rub: 0.6, rojo: 0.42 }),
    lleno: E({ mx: 0.85, my: 0.05, iris: 0.78, sd: 18, si: 18, gd: 0.12, gi: 0.12, orig: 0, abre: 0, ancho: 0.58, sonr: 0.22, mof: 1, rub: 0.5, rojo: 0.18 }),
    trago: E({ mx: 0.6, my: -0.2, c: 0.75, z: 0.6, sd: 10, si: 10, orig: 0, abre: 0, ancho: 0.62, sonr: 0, mof: 0, rub: 0.4 }),
    aguanta: E({ mx: 0.85, iris: 0.82, sd: 21, si: 21, gd: 0.14, gi: 0.14, orig: 0, abre: 0, ancho: 0.55, sonr: -0.05, mof: 0.85, rub: 0.55, rojo: 0.2 }),
    eructo: E({ mx: 0.5, c: 0.75, h: 0.5, sd: 12, si: 12, orig: 0, abre: 14, ancho: 0.8, sonr: 0.25, mof: 0, rub: 0.6 }),
    culpa: E({ mx: 0.85, my: 0.05, c: 0.32, h: 0.85, sd: 13, si: 13, gd: 0.22, gi: 0.22, orig: 0, abre: 5, ancho: 0.95, sonr: 0.65, rub: 0.6 }),
    anhelo: E({ mx: 0.75, my: -0.45, iris: 1.12, sd: 16, si: 16, gd: 0.26, gi: 0.26, orig: 0, abre: 5, ancho: 0.6, sonr: -0.25, rub: 0.2 }),
    pasmo: E({ mx: 0.85, my: -0.2, iris: 0.85, sd: 22, si: 22, gd: 0.1, gi: 0.1, orig: 0, abre: 30, ancho: 0.75, sonr: -0.1, lengua: 0.3 }),
    puchero: E({ mx: 0.55, my: 0.4, iris: 1.15, c: 0.15, sd: 12, si: 12, gd: 0.32, gi: 0.32, orig: 0, abre: 3, ancho: 0.62, sonr: -0.85 }),
    camara: E({ mx: -0.85, my: -0.15, iris: 1.18, c: 0.1, sd: 14, si: 14, gd: 0.34, gi: 0.34, orig: 0, abre: 4, ancho: 0.62, sonr: -0.9 })
  };
  const GUION_CG = [
    [T.mira0, T.mira0 + 0.35, "mira"], [T.tierno0, T.tierno0 + 0.4, "tierno"], [T.inclina0 + 0.3, T.inclina0 + 0.6, "beso"],
    [T.pilla0, T.pilla0 + 0.22, "pilla"], [T.sorbe0 - 0.05, T.sorbe0 + 0.2, "sorbe"], [T.suelta - 0.05, T.suelta + 0.25, "lleno"],
    [T.trago - 0.04, T.trago + 0.12, "trago"], [T.trago + 0.3, T.trago + 0.55, "aguanta"], [T.eructo - 0.04, T.eructo + 0.14, "eructo"],
    [T.rasca0, T.rasca0 + 0.35, "culpa"], [T.boca0 - 0.5, T.boca0 - 0.15, "anhelo"], [T.muerde - 0.02, T.muerde + 0.12, "pasmo"],
    [T.puchero0, T.puchero0 + 0.4, "puchero"], [T.camara0, T.camara0 + 0.35, "camara"]
  ];
  const PARP_G = [0.3, 1.75, 6.0, 8.45, 9.6, 11.9];

  // cuerpo: dx (px de pantalla hacia delante), pel (hoja, + agacha), torso (+ hacia delante), cab, tex (ancho del torso),
  // mano cercana (c*) y lejana (l*) respecto a su hombro (hoja); cp/lp: fuera del bolsillo (0..1)
  const P0G = { dx: 0, pel: 0, torso: 0, cab: 0, tex: 1, cx: 0, cy: 300, ca: 0, cmu: -1.75, cp: 0, lx: 0, ly: 280, la: 0, lmu: -1.75, lp: 0 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    erguido: CuG({}),
    inclina: CuG({ dx: -8, pel: 22, torso: 0.36, cab: 0.1 }),
    sorbe: CuG({ dx: -12, pel: 16, torso: 0.3, cab: 0.04, tex: 1.05 }),
    lleno: CuG({ dx: -4, pel: 2, torso: 0.02, cab: -0.07, tex: 1.06 }),
    trago: CuG({ dx: -4, pel: 6, torso: 0.05, cab: 0.08, tex: 1.03 }),
    aguanta: CuG({ dx: -6, pel: 0, torso: -0.04, cab: -0.05, tex: 1.03, cp: 1 }),
    eructo: CuG({ dx: -2, pel: 8, torso: 0.1, cab: 0.12, tex: 1.0, cp: 1 }),
    rasca: CuG({ dx: -6, pel: 4, torso: -0.03, cab: 0.06, cp: 1 }),
    anhelo: CuG({ dx: 2, pel: 6, torso: 0.06, cab: -0.08 }),
    puchero: CuG({ dx: -4, pel: 14, torso: 0.08, cab: 0.15 })
  };
  const GUION_G = [
    [T.inclina0, T.inclina1, "inclina", suave5], [T.sorbe0 - 0.25, T.sorbe0 + 0.15, "sorbe"], [T.suelta, T.suelta + 0.45, "lleno"],
    [T.trago - 0.04, T.trago + 0.18, "trago"], [T.tapa0, T.tapa0 + 0.32, "aguanta"], [T.eructo - 0.04, T.eructo + 0.18, "eructo"],
    [T.rasca0, T.rasca0 + 0.4, "rasca"], [T.rasca1, T.rasca1 + 0.45, "anhelo"], [T.puchero0, T.puchero0 + 0.5, "puchero"]
  ];
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };

  function poseG(t) {
    const b = linea(GUION_G, CUER_G, "erguido", t);
    const respira = Math.sin(t * 2.3 + 0.4);
    // durante el sorbetón: tirones con cada trago
    const tiron = campana(t, T.sorbe0, T.vacio) * (0.5 + 0.5 * Math.sin((t - T.sorbe0) * 26));
    const p = {
      x: XG + b.dx, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 },
      torso: b.torso - 0.012 * tiron, torsoEsc: { x: b.tex + 0.01 * tiron, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }, tirasLimpias: true, ikContinuo: true
    };
    // eructo: sacudida de la cabeza
    const er = t >= T.eructo ? Math.exp(-(t - T.eructo) * 6) * suave(fase(t, T.eructo, T.eructo + 0.1)) : 0;
    p.cabeza.ang += 0.06 * er; p.cabeza.esc = { x: 1 + 0.05 * er, y: 1 - 0.05 * er };
    // trago: la cabeza baja y sube
    p.cabeza.dy += 6 * campana(t, T.trago, T.trago + 0.3);
    // pucheros: tiembla el morro (y un poco la cabeza)
    p.cabeza.ang += 0.012 * Math.sin(t * 17) * tramo(t, T.puchero0 + 0.3, T.puchero0 + 0.6);
    for (const lado of ["cerca", "lejos"]) p.piernas[lado] = { tob: { x: G.PELVIS.x + (lado === "cerca" ? -19 : 18) / S, y: TOB_G[lado] }, ang: 0 };
    // cara
    const e = linea(GUION_CG, CG, "inicio", t);
    const mof = e.mof * (1 - 0.18 * tiron);
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.cara.mofletes = mof;
    p.rojo = e.rojo; p.sudor = 0.8 * campana(t, T.sorbe0 + 0.3, T.trago + 0.2);
    // pucheros: el labio de abajo tiembla
    if (t > T.puchero0) p.cara.boca.abre += 1.5 * Math.sin(t * 21) * tramo(t, T.puchero0 + 0.3, T.puchero0 + 0.6);
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    let c = { x: hc.x + b.cx, y: hc.y + b.cy }, l = { x: hl.x + b.lx, y: hl.y + b.ly };
    c = mezcla(Tr(BOLS_G.c), c, clamp(b.cp * 1.5)); l = mezcla(Tr(BOLS_G.l), l, clamp(b.lp * 1.5));
    let cmu = b.cmu, cang = b.ca, dedosC = null;
    // se tapa la boca y luego se rasca la cabeza (mano cercana, palma abierta): un solo recorrido sin cortes
    const arriba = tramo(t, T.tapa0, T.tapa0 + 0.32) * (1 - tramo(t, T.rasca1, T.rasca1 + 0.45));
    if (arriba > 0.001) {
      const H = G.cabeza(p);
      const boca = H.a({ x: 812, y: 742 });
      const tapaP = { x: boca.x + 8 + 10 * er, y: boca.y + 14 };
      const ras = 0.5 + 0.5 * Math.sin((t - T.rasca0) * 16) * tramo(t, T.rasca0 + 0.3, T.rasca0 + 0.5);
      const nuca = H.a({ x: 548 + 14 * ras, y: 500 - 20 * ras });
      const k = suave(fase(t, T.eructo + 0.3, T.rasca0 + 0.38));
      c = mezcla(c, mezcla(tapaP, nuca, k), arriba);
      cmu = lerp(cmu, lerp(1.95, 1.25, k), arriba); cang = lerp(cang, lerp(-0.15, 0.3, k), arriba);
      const dt = D(0.8, 0.95, 0.95), dr = D(0.35, 0.55 + 0.35 * ras, 0.5 + 0.35 * ras);
      dedosC = { pulgar: lerp(dt.pulgar, dr.pulgar, k), indice: lerp(dt.indice, dr.indice, k), medio: lerp(dt.medio, dr.medio, k), anular: lerp(dt.anular, dr.anular, k), menique: lerp(dt.menique, dr.menique, k) };
    }
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: -1, puno: Math.max(b.cp, arriba) };
    if (dedosC) p.manoCerca.dedos = dedosC;
    // mientras Laura enseña la guinda, él estira la mano lejana pidiéndola (palma arriba)
    const pide = tramo(t, T.sube1 + 0.05, T.sube1 + 0.45) * (1 - tramo(t, T.muerde + 0.2, T.muerde + 0.75));
    let lmu = b.lmu, lang = b.la, dedosL = null;
    if (pide > 0.001) {
      const obj = G.aHoja(p, { x: 520 + 6 * Math.sin(t * 5), y: 246 });
      l = mezcla(l, obj, pide); lmu = lerp(lmu, -3.0, pide); lang = lerp(lang, 0.1, pide);
      dedosL = D(lerp(0, 0.9, pide), lerp(0, 1, pide), lerp(0, 0.95, pide));
    }
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: -1, puno: Math.max(b.lp, pide) };
    if (dedosL) p.manoLejos.dedos = dedosL;
    return p;
  }

  /* ================= Laura ================= */
  const CL = {
    inicio: E({ mx: 0.8 }),
    tierna: E({ mx: 0.9, my: -0.05, c: 0.2, sd: 7, si: 7, gd: 0.05, gi: 0.05, orig: 0, sonr: 0.7, ancho: 0.9, rub: 0.55 }),
    besito: E({ mx: 0.9, c: 1, h: 0.45, sd: 9, si: 9, orig: 0, abre: 3, ancho: 0.6, sonr: 0.3, rub: 0.5 }),
    extrana: E({ mx: 0.9, c: 1, h: 0, sd: 19, si: 4, gd: 0.16, gi: -0.04, orig: 0, abre: 5, ancho: 0.58, sonr: -0.15, rub: 0.2 }),
    vaso: E({ mx: 0.35, my: 0.65, iris: 1.05, sd: 15, si: 15, gd: 0.08, gi: 0.08, orig: 0, abre: 9, ancho: 0.55, sonr: -0.2 }),
    seria: E({ mx: 0.95, my: 0, c: 0.42, sd: -5, si: 13, gd: -0.12, gi: 0.12, orig: 0, abre: 0, ancho: 0.8, sonr: -0.28 }),
    viento: E({ mx: 0.5, c: 0.9, z: 0.85, sd: -7, si: -7, gd: -0.1, gi: -0.1, orig: 0, abre: 6, ancho: 0.8, sonr: -0.45 }),
    picara: E({ mx: 0.95, my: 0.05, c: 0.3, sd: 3, si: 14, gd: -0.05, gi: 0.12, orig: 0, sonr: 0.55, ancho: 0.85 }),
    guinda: E({ mx: 0.6, my: -0.25, c: 0.12, sd: 8, si: 16, gi: 0.1, orig: 0, sonr: 0.62, ancho: 0.9 }),
    muerde: E({ mx: 0.95, c: 0.3, sd: 6, si: 12, orig: 0, abre: 24, ancho: 0.72, sonr: 0.3 }),
    mastica: E({ mx: 0.9, c: 0.9, h: 1, sd: 10, si: 10, orig: 0, sonr: 0.62, ancho: 0.82, mof: 0.3, rub: 0.25 }),
    guino: E({ mx: -0.85, my: -0.1, c: 0, wd: 1, h: 0.8, sd: 6, si: 14, gi: 0.1, orig: 0, sonr: 0.8, ancho: 0.95, rub: 0.25 })
  };
  const GUION_CL = [
    [T.tierno0 + 0.1, T.tierno0 + 0.45, "tierna"], [T.inclina0 + 0.2, T.inclina0 + 0.5, "besito"], [T.vacio - 0.05, T.vacio + 0.2, "extrana"],
    [T.abreL, T.abreL + 0.15, "vaso"], [T.miraG, T.miraG + 0.3, "seria"], [T.eructo + 0.08, T.eructo + 0.3, "viento"],
    [T.eructo + 0.65, T.coge0, "picara"], [T.sube1 - 0.2, T.sube1 + 0.2, "guinda"], [T.muerde - 0.25, T.muerde - 0.05, "muerde"],
    [T.muerde + 0.08, T.muerde + 0.3, "mastica"], [T.guino, T.guino + 0.3, "guino"]
  ];
  const PARP_L = [0.75, 1.32, 1.55, 6.55, 8.1, 9.55, 11.3];

  const P0L = { dx: 0, pel: 0, torso: 0, cab: 0, lw: 0 };
  const CuL = o => Object.assign({}, P0L, o);
  const CUER_L = {
    erguida: CuL({}),
    coqueta: CuL({ cab: -0.06, torso: -0.02 }),
    inclina: CuL({ dx: -6, pel: 16, torso: 0.34, cab: 0.07 }),
    endereza: CuL({ dx: -2, pel: 4, torso: 0.06, cab: -0.02 }),
    viento: CuL({ dx: -10, pel: 6, torso: -0.12, cab: -0.14 }),
    coge: CuL({ dx: 0, pel: 8, torso: 0.14, cab: 0.04 }),
    muestra: CuL({ dx: -2, pel: 2, torso: -0.02, cab: -0.06 }),
    come: CuL({ dx: -2, pel: 2, torso: -0.05, cab: -0.12 }),
    chula: CuL({ dx: -4, pel: 0, torso: -0.04, cab: -0.05 }),
    tira: CuL({ dx: 0, pel: 6, torso: 0.1, cab: 0.03 }),
    final: CuL({ dx: -3, pel: 0, torso: -0.03, cab: -0.07 })
  };
  const GUION_L = [
    [T.tierno0 + 0.1, T.tierno0 + 0.5, "coqueta"], [T.inclina0 + 0.05, T.inclina1, "inclina", suave5], [T.abreL + 0.05, T.abreL + 0.5, "endereza"],
    [T.eructo + 0.08, T.eructo + 0.34, "viento"], [T.eructo + 0.45, T.eructo + 0.95, "endereza"], [T.coge0, T.pinza, "coge"],
    [T.pinza + 0.05, T.sube1, "muestra"], [T.boca0, T.muerde, "come"], [T.muerde + 0.1, T.muerde + 0.5, "chula"],
    [T.suelta0 - 0.3, T.suelta0, "tira"], [T.tira + 0.05, T.tira + 0.45, "final"]
  ];

  // guinda: rabito sujeto entre el pulgar y el índice de la mano lejana de Laura
  const ESC_MANO_L = 0.88, MU_PINZA = -2.2, ANG_PINZA = 0, PINZA_LOC = { x: 10.5, y: 14 };   // punta de los dedos (unidades de mano)
  const pinzaLocal = () => { const q = rot({ x: PINZA_LOC.x * ESC_MANO_L, y: PINZA_LOC.y * ESC_MANO_L }, MU_PINZA + Math.PI / 2); return q; };
  const pinzaHoja = mano => { const q = rot(pinzaLocal(), mano.ang || 0); return { x: mano.x + q.x * L.JK, y: mano.y + q.y * L.JK }; };

  function poseLBase(t) {
    const b = linea(GUION_L, CUER_L, "erguida", t);
    const respira = Math.sin(t * 2.1 + 1.3);
    const p = {
      x: XL - b.dx, suelo: SUELO, s: S, espejo: true,
      pelvis: { x: L.PELVIS.x, y: L.PELVIS.y + b.pel + respira * 1.1 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }, tirasLimpias: true, ikContinuo: true
    };
    const ty = L.SUELO - L.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: L.PELVIS.x - 55, y: ty }, ang: 0 };
    p.piernas.lejos = { tob: { x: L.PELVIS.x + 60, y: ty - 10 }, ang: 0 };
    return { p, b };
  }
  // trayectoria del punto de agarre (pantalla): borde de la pecera → a la altura de los ojos → boca → encima de la pecera
  let RABITO0 = null;
  function agarre(t, pL) {
    const ojos = L.aPantalla(pL, L.cabeza(pL).a({ x: 860, y: 470 }));
    const boca = L.aPantalla(pL, L.boca(pL));
    const arriba = { x: ojos.x - 64 + 4 * Math.sin(t * 2.4), y: ojos.y - 4 };
    // la guinda llega a la boca con el rabito inclinado (la mano queda delante de la barbilla, no de los ojos)
    const aBoca = { x: boca.x - 2 - Math.sin(ANG_BOCA) * RABITO_L, y: boca.y - 2 - Math.cos(ANG_BOCA) * RABITO_L };
    const sobre = { x: BX + 18, y: RIMY - 46 };
    let q = RABITO0;
    q = mezcla(q, arriba, suave5(fase(t, T.pinza + 0.08, T.sube1)));
    q = mezcla(q, aBoca, suave5(fase(t, T.boca0, T.muerde)));
    q = mezcla(q, { x: aBoca.x + 6, y: aBoca.y + 40 }, suave(fase(t, T.muerde + 0.15, T.muerde + 0.55)));
    q = mezcla(q, sobre, suave5(fase(t, T.suelta0 - 0.3, T.suelta0)));
    return q;
  }
  function poseL(t) {
    const { p, b } = poseLBase(t);
    // inercia de la melena con el movimiento del torso; la ventolera del eructo la echa hacia atrás
    const d = (linea(GUION_L, CUER_L, "erguida", t).torso - linea(GUION_L, CUER_L, "erguida", t - 0.12).torso) / 0.12;
    const vt = t >= T.eructo ? Math.exp(-Math.max(0, t - T.eructo - 0.3) * 3.2) * suave(fase(t, T.eructo + 0.06, T.eructo + 0.32)) : 0;
    p.pelo = { inercia: clamp(-0.6 * d, -0.8, 0.8), viento: -2.1 * vt * (1 + 0.15 * Math.sin((t - T.eructo) * 18)) + 0.12 * Math.sin(t * 1.1) };
    // cara
    const e = linea(GUION_CL, CL, "inicio", t);
    let extra = parpadeo(t, PARP_L, 0.13);
    p.cara = cara(e, extra);
    // masticando: carrillo y boca
    const masc = tramo(t, T.muerde + 0.1, T.muerde + 0.25) * (1 - tramo(t, T.suelta0 - 0.2, T.suelta0 + 0.1));
    if (masc > 0) { const m = 0.5 + 0.5 * Math.sin((t - T.muerde) * 15); p.cara.mofletes = (0.15 + 0.25 * m) * masc + e.mof * (1 - masc); p.cara.boca.abre += 3 * m * masc; }
    p.rojo = e.rojo;
    // manos: las dos en los bolsillos menos la lejana cuando coge la guinda
    const Tr = L.tronco(p);
    p.manoCerca = { x: Tr(BOLS_L.c).x, y: Tr(BOLS_L.c).y, ang: 0, mu: -1.75, puno: 0, dobla: -1 };
    const bol = Tr(BOLS_L.l), hl = Tr(L.HOMBRO);
    const sale = tramo(t, T.coge0, T.coge0 + 0.25) * (1 - tramo(t, T.tira + 0.15, T.tira + 0.55));
    const coge = suave5(fase(t, T.coge0, T.pinza)) * (1 - suave5(fase(t, T.tira + 0.05, T.tira + 0.55)));
    let m = { x: bol.x, y: bol.y, ang: 0, mu: -1.75, puno: 0, dobla: 1 };
    if (coge > 0.0005) {
      const objetivo = L.aHoja(p, agarre(t, p)), q = rot(pinzaLocal(), ANG_PINZA);
      const mano = { x: objetivo.x - q.x * L.JK, y: objetivo.y - q.y * L.JK };
      // el codo sale hacia fuera y abajo: al salir del bolsillo pasa por delante de la cadera
      const via = { x: hl.x + 120, y: hl.y + 170 };
      const k = coge, ida = mezcla(mezcla(bol, via, Math.min(1, k * 2)), mano, clamp(k * 2 - 1));
      m = { x: ida.x, y: ida.y, ang: ANG_PINZA * k, mu: lerp(-1.75, MU_PINZA, clamp(k * 1.6)), puno: sale, dobla: 1,
        dedos: D(lerp(0.3, 0.72, coge), lerp(0.3, 0.8, coge), 0.12) };
      // al soltar el rabito los dedos se abren
      const abre = tramo(t, T.tira, T.tira + 0.12);
      if (abre > 0) m.dedos = D(lerp(0.72, 1, abre), lerp(0.8, 1, abre), lerp(0.12, 0.8, abre));
      const tieneGuinda = t >= T.pinza && t < T.tira;
      if (tieneGuinda) m.objeto = (g, tt) => guindaEnMano(g, tt, p, m);
    }
    p.manoLejos = m;
    return p;
  }

  /* ---------- decorado: bar tiki al atardecer ---------- */
  const BX = 512, MESA_Y = 376, R = 64, BY = MESA_Y - 22 - R, RIMY = BY - 0.78 * R, RW = R * Math.sqrt(1 - 0.78 * 0.78);
  let fondo = null;
  function bambu(g, x, y0, y1, w, tono) {
    const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    gr.addColorStop(0, tono[0]); gr.addColorStop(0.45, tono[1]); gr.addColorStop(1, tono[2]);
    g.fillStyle = gr; g.fillRect(x - w / 2, y0, w, y1 - y0);
    g.strokeStyle = "#2a1606"; g.lineWidth = 2.5; g.strokeRect(x - w / 2, y0, w, y1 - y0);
    g.lineWidth = 2;
    for (let y = y0 + 30 + (x * 7) % 25; y < y1 - 10; y += 58) {
      g.beginPath(); g.moveTo(x - w / 2, y); g.quadraticCurveTo(x, y + 4, x + w / 2, y); g.stroke();
      g.strokeStyle = "rgba(255,240,190,0.35)"; g.beginPath(); g.moveTo(x - w / 2 + 2, y + 3); g.quadraticCurveTo(x, y + 7, x + w / 2 - 2, y + 3); g.stroke(); g.strokeStyle = "#2a1606";
    }
  }
  function palmera(g, x, y, esc, inclina) {
    g.save(); g.translate(x, y); g.scale(esc, esc); g.fillStyle = "#3a1440"; g.strokeStyle = "#3a1440";
    g.lineWidth = 9; g.lineCap = "round"; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(inclina * 40, -90, inclina * 30, -180); g.stroke();
    const cx = inclina * 30, cy = -180;
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (i - 3) * 0.5 + inclina * 0.2, L0 = 95 - Math.abs(i - 3) * 6;
      g.beginPath(); g.moveTo(cx, cy);
      g.quadraticCurveTo(cx + Math.cos(a) * L0 * 0.6, cy + Math.sin(a) * L0 * 0.6 - 25, cx + Math.cos(a) * L0, cy + Math.sin(a) * L0 + 20);
      g.quadraticCurveTo(cx + Math.cos(a) * L0 * 0.55, cy + Math.sin(a) * L0 * 0.5 - 8, cx, cy + 6); g.fill();
    }
    g.restore();
  }
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60);
    // ventanal al atardecer
    const cielo = g.createLinearGradient(0, -60, 0, 300);
    cielo.addColorStop(0, "#2c1850"); cielo.addColorStop(0.35, "#7b2f6f"); cielo.addColorStop(0.7, "#f2645a"); cielo.addColorStop(1, "#ffb347");
    g.fillStyle = cielo; g.fillRect(-40, -60, W + 80, 380);
    const sol = g.createRadialGradient(805, 296, 10, 805, 296, 200); sol.addColorStop(0, "rgba(255,236,160,0.95)"); sol.addColorStop(0.25, "rgba(255,200,110,0.6)"); sol.addColorStop(1, "rgba(255,150,90,0)");
    g.fillStyle = sol; g.fillRect(560, 90, 520, 260);
    g.fillStyle = "#ffe08a"; g.beginPath(); g.arc(805, 300, 46, Math.PI, 0); g.fill();
    // nubes rosas alargadas
    g.fillStyle = "rgba(255,170,170,0.55)";
    for (const [x, y, w] of [[200, 190, 150], [560, 168, 200], [880, 214, 130], [380, 236, 110]]) { g.beginPath(); g.ellipse(x, y, w / 2, 9, 0, 0, Math.PI * 2); g.fill(); }
    // mar
    const mar = g.createLinearGradient(0, 300, 0, 360); mar.addColorStop(0, "#c2496f"); mar.addColorStop(1, "#3b2a63");
    g.fillStyle = mar; g.fillRect(-40, 300, W + 80, 60);
    g.fillStyle = "rgba(255,226,140,0.75)";
    for (let i = 0; i < 9; i++) { const y = 306 + i * 6, w = 70 - i * 6 + (i % 2) * 12; g.fillRect(805 - w / 2, y, w, 2.5); }
    palmera(g, 168, 360, 0.95, 0.5); palmera(g, 872, 360, 0.9, -0.55); palmera(g, 236, 360, 0.62, 0.25);
    // marco de bambú del ventanal y pared de cañas
    g.fillStyle = "#6a3f1d"; g.fillRect(-40, 356, W + 80, 90);
    for (let x = -30; x < W + 40; x += 22) bambu(g, x, 360, 444, 22, ["#8a5a2a", "#c99a55", "#7a4a20"]);
    g.fillStyle = "#4a2a10"; g.fillRect(-40, 352, W + 80, 10);
    bambu(g, -10, -60, 444, 44, ["#9a6a30", "#e0b46a", "#8a5a26"]); bambu(g, W + 10, -60, 444, 44, ["#9a6a30", "#e0b46a", "#8a5a26"]);
    g.save(); g.translate(0, 0);
    // travesaño
    const tg = g.createLinearGradient(0, 330, 0, 356); tg.addColorStop(0, "#e0b46a"); tg.addColorStop(1, "#8a5a26");
    g.fillStyle = tg; g.fillRect(-40, 330, W + 80, 24); g.strokeStyle = "#2a1606"; g.lineWidth = 2.5; g.strokeRect(-40, 330, W + 80, 24);
    g.restore();
    // tejadillo de paja
    g.fillStyle = "#7a5420"; g.fillRect(-40, -60, W + 80, 165);
    for (let capa = 0; capa < 3; capa++) {
      g.fillStyle = ["#9a6c28", "#c99a45", "#e2b862"][capa];
      g.beginPath(); g.moveTo(-40, -60);
      for (let x = -40; x <= W + 40; x += 11) { const largo = 125 + capa * 18 + 14 * hash(x * 0.37 + capa * 11); g.lineTo(x + 5, largo); g.lineTo(x + 11, 113 + capa * 16); }
      g.lineTo(W + 40, -60); g.closePath(); g.fill();
    }
    g.strokeStyle = "rgba(60,30,5,0.45)"; g.lineWidth = 1.5;
    for (let x = -36; x < W + 40; x += 9) { g.beginPath(); g.moveTo(x, 135 + 10 * hash(x)); g.lineTo(x + 3, 165 + 22 * hash(x + 3)); g.stroke(); }
    // farolillos de papel
    for (const [x, col] of [[262, "#ff8a3d"], [512, "#ff5d8f"], [762, "#ffd23d"]]) {
      g.strokeStyle = "#2a1606"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 150); g.lineTo(x, 164); g.stroke();
      const halo = g.createRadialGradient(x, 184, 4, x, 184, 70); halo.addColorStop(0, "rgba(255,210,140,0.55)"); halo.addColorStop(1, "rgba(255,200,120,0)");
      g.fillStyle = halo; g.beginPath(); g.arc(x, 184, 70, 0, Math.PI * 2); g.fill();
      g.fillStyle = col; g.beginPath(); g.ellipse(x, 184, 22, 24, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 2.5; g.stroke();
      g.strokeStyle = "rgba(60,20,0,0.45)"; g.lineWidth = 1.5;
      for (const dx of [-11, 0, 11]) { g.beginPath(); g.ellipse(x, 184, Math.abs(dx) < 1 ? 1 : Math.abs(dx), 24, 0, 0, Math.PI * 2); g.stroke(); }
      g.fillStyle = "#2a1606"; g.fillRect(x - 9, 158, 18, 5); g.fillRect(x - 9, 206, 18, 5);
    }
    // suelo de tablones
    const su = g.createLinearGradient(0, 444, 0, H + 60); su.addColorStop(0, "#5a3218"); su.addColorStop(1, "#2c160a");
    g.fillStyle = su; g.fillRect(-40, 444, W + 80, H + 60 - 444);
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 2;
    for (let i = 0, y = 452; y < H + 60; i++, y += 10 + i * 5) { g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); }
    for (let x = -40; x < W + 40; x += 90) { g.beginPath(); g.moveTo(512 + (x - 512) * 0.55, 444); g.lineTo(512 + (x - 512) * 1.4, H + 60); g.stroke(); }
    g.fillStyle = "rgba(255,190,120,0.16)"; g.fillRect(-40, 444, W + 80, 3);
    // luz cálida del atardecer y viñeta
    const lz = g.createRadialGradient(560, 300, 60, 560, 300, 620); lz.addColorStop(0, "rgba(255,170,100,0.18)"); lz.addColorStop(1, "rgba(255,120,80,0)");
    g.fillStyle = lz; g.fillRect(-40, -60, W + 80, H + 120);
    const v = g.createRadialGradient(512, 300, 300, 512, 300, 700); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(20,0,20,0.55)");
    g.fillStyle = v; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }
  // antorchas tiki a los lados (la llama se mueve)
  function antorcha(g, x, t) {
    g.save(); g.lineJoin = "round";
    g.fillStyle = "#5a3412"; g.strokeStyle = "#1a0d04"; g.lineWidth = 2.5;
    g.beginPath(); g.rect(x - 5, 250, 10, SUELO - 250); g.fill(); g.stroke();
    g.fillStyle = "#c9953f"; g.beginPath(); g.moveTo(x - 13, 232); g.lineTo(x + 13, 232); g.lineTo(x + 9, 256); g.lineTo(x - 9, 256); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "#6b4413"; g.lineWidth = 1.5; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x - 11, 238 + i * 6); g.lineTo(x + 11, 238 + i * 6); g.stroke(); }
    const halo = g.createRadialGradient(x, 210, 4, x, 210, 80); halo.addColorStop(0, "rgba(255,200,90,0.5)"); halo.addColorStop(1, "rgba(255,150,60,0)");
    g.fillStyle = halo; g.beginPath(); g.arc(x, 210, 80, 0, Math.PI * 2); g.fill();
    const f = 1 + 0.12 * ruido(t * 6 + x), l = 0.18 * ruido(t * 4.3 + x * 0.1);
    const llama = (k, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(x - 11 * k, 232);
      g.quadraticCurveTo(x - 14 * k, 212, x + l * 40 * k, 232 - 44 * k * f); g.quadraticCurveTo(x + 14 * k, 212, x + 11 * k, 232); g.closePath(); g.fill(); };
    llama(1, "#ff7a1a"); llama(0.62, "#ffd04a"); llama(0.3, "#fff6c8");
    g.restore();
  }

  /* ---------- mesa y pecera ---------- */
  function mesa(g) {
    g.save(); g.lineJoin = "round"; g.strokeStyle = "#140a04"; g.lineWidth = 3;
    g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse(BX, SUELO + 2, 60, 8, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#3a200c"; g.beginPath(); g.ellipse(BX, SUELO - 4, 40, 8, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#4a2a10"; g.fillRect(BX - 6, MESA_Y + 8, 12, SUELO - MESA_Y - 12); g.strokeRect(BX - 6, MESA_Y + 8, 12, SUELO - MESA_Y - 12);
    g.fillStyle = "#5a3416"; g.beginPath(); g.ellipse(BX, MESA_Y + 6, 74, 12, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    const tg = g.createLinearGradient(BX - 74, 0, BX + 74, 0); tg.addColorStop(0, "#8a5426"); tg.addColorStop(0.5, "#c08040"); tg.addColorStop(1, "#7a4620");
    g.fillStyle = tg; g.beginPath(); g.ellipse(BX, MESA_Y, 74, 12, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = "rgba(255,230,180,0.35)"; g.lineWidth = 2; g.beginPath(); g.ellipse(BX, MESA_Y - 1, 60, 8, 0, Math.PI * 1.1, Math.PI * 1.6); g.stroke();
    g.restore();
  }
  // nivel del cóctel (0..1) y altura de la superficie en pantalla
  const Y_FONDO = BY + R - 8, Y_LLENO = RIMY + 16;
  function nivel(t) {
    let v = 0.9 - 0.06 * suave(fase(t, T.engancha1, T.pilla0 + 0.2));
    const k = fase(t, T.sorbe0, T.vacio);
    v *= 1 - (0.15 * k + 0.85 * k * k);       // arranca y se vacía cada vez más rápido
    return clamp(v);
  }
  const ySup = v => lerp(Y_FONDO, Y_LLENO, v);
  const dentro = (x, y) => (x - BX) * (x - BX) + (y - BY) * (y - BY) < (R - 5) * (R - 5);
  const fondoEn = x => BY + Math.sqrt(Math.max(0, (R - 14) * (R - 14) - (x - BX) * (x - BX)));
  // remolino hacia la pajita de Guillermo mientras sorbe
  const remolino = t => campana(t, T.sorbe0 + 0.1, T.vacio + 0.1);
  function superficie(t, x) {
    const v = nivel(t), y = ySup(v), r = remolino(t);
    return y + 11 * r * Math.exp(-((x - PAJ.g.base.x) ** 2) / 300) + 2.5 * Math.sin(x * 0.12 - t * 9) * r + 1.2 * Math.sin(x * 0.08 + t * 3);
  }
  function peceraAtras(g, t) {
    g.save();
    // pie y tallo
    g.fillStyle = "rgba(220,240,255,0.45)"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5;
    g.beginPath(); g.ellipse(BX, MESA_Y - 3, 30, 6, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(BX - 6, MESA_Y - 4); g.quadraticCurveTo(BX - 4, BY + R + 2, BX - 14, BY + R - 3); g.lineTo(BX + 14, BY + R - 3); g.quadraticCurveTo(BX + 4, BY + R + 2, BX + 6, MESA_Y - 4); g.closePath(); g.fill(); g.stroke();
    // cristal (fondo)
    g.fillStyle = "rgba(210,236,255,0.2)"; g.beginPath(); g.arc(BX, BY, R, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 2; g.beginPath(); g.ellipse(BX, RIMY, RW, 6, 0, Math.PI, Math.PI * 2); g.stroke();
    // cóctel en degradado de atardecer
    const v = nivel(t);
    g.save(); g.beginPath(); g.arc(BX, BY, R - 4, 0, Math.PI * 2); g.clip();
    if (v > 0.004) {
      const y0 = ySup(v) - 14, w = R + 10;
      g.beginPath(); g.moveTo(BX - w, BY + R + 10);
      for (let i = 0; i <= 20; i++) { const x = BX - w + 2 * w * i / 20; g.lineTo(x, superficie(t, x)); }
      g.lineTo(BX + w, BY + R + 10); g.closePath();
      const gr = g.createLinearGradient(0, Y_LLENO, 0, Y_FONDO); gr.addColorStop(0, "#ff4f8b"); gr.addColorStop(0.45, "#ff8a3d"); gr.addColorStop(1, "#ffcf3a");
      g.fillStyle = gr; g.fill();
      // brillo de la superficie
      g.strokeStyle = "rgba(255,230,240,0.85)"; g.lineWidth = 2.5; g.beginPath();
      for (let i = 0; i <= 20; i++) { const x = BX - w + 2 * w * i / 20; if (i) g.lineTo(x, superficie(t, x) + 1.5); else g.moveTo(x, superficie(t, x) + 1.5); }
      g.stroke();
      // burbujitas
      g.fillStyle = "rgba(255,255,255,0.7)";
      for (let i = 0; i < 8; i++) { const ph = (t * (0.45 + hash(i) * 0.4) + hash(i + 5)) % 1, x = BX - 40 + hash(i + 2) * 80, y = lerp(Y_FONDO, ySup(v) + 4, ph);
        if (y > ySup(v) + 3) { g.beginPath(); g.arc(x, y, 1.4 + hash(i + 7), 0, Math.PI * 2); g.fill(); } }
      // espiral del remolino
      const r = remolino(t);
      if (r > 0.05) { g.strokeStyle = `rgba(255,255,255,${0.5 * r})`; g.lineWidth = 2; g.beginPath();
        for (let k = 0; k < 30; k++) { const a = -t * 14 + k * 0.35, rr = 4 + k * 1.2; const x = PAJ.g.base.x + Math.cos(a) * rr * 1.4, y = ySup(v) + 10 + Math.sin(a) * rr * 0.3 + k * 0.7; if (k) g.lineTo(x, y); else g.moveTo(x, y); }
        g.stroke(); }
    } else {
      // restos en el fondo
      g.fillStyle = "rgba(255,120,90,0.55)"; g.beginPath(); g.ellipse(BX, Y_FONDO + 2, 26, 4, 0, 0, Math.PI * 2); g.fill();
    }
    g.restore();
    // hielos (flotan; al vaciarse quedan en el fondo y tintinean con el borboteo)
    const tiembla = campana(t, T.vacio - 0.05, T.gluglu1);
    [[-24, 0.3, 0], [-6, -0.2, 1], [12, 0.5, 2], [28, -0.4, 3]].forEach(([dx0, a0, i]) => {
      let x = BX + dx0 + 3 * Math.sin(t * 1.3 + i);
      const r = remolino(t); x = lerp(x, PAJ.g.base.x + 18 * Math.cos(t * 11 + i * 1.6), 0.45 * r);
      const flota = superficie(t, x) - 4 + 1.5 * Math.sin(t * 2.2 + i);
      const y = Math.min(flota, fondoEn(x) - 7) + ruido(t * 40 + i * 9) * 2.5 * tiembla;
      g.save(); g.translate(x, y); g.rotate(a0 + 0.2 * Math.sin(t * 1.7 + i) + r * t * 3 * (i % 2 ? 1 : -1));
      g.fillStyle = "rgba(240,252,255,0.9)"; g.strokeStyle = "rgba(40,90,120,0.95)"; g.lineWidth = 1.5;
      g.beginPath(); g.roundRect ? g.roundRect(-8, -8, 16, 16, 3) : g.rect(-8, -8, 16, 16); g.fill(); g.stroke();
      g.fillStyle = "#ffffff"; g.fillRect(-5, -5, 5, 3); g.restore();
    });
    // sombrilla de papel (clavada en el hielo; gira con el remolino y acaba apoyada en el borde)
    const r = remolino(t), cae = tramo(t, T.vacio - 0.2, T.vacio + 0.4);
    const baseS = { x: BX + 10, y: Math.min(superficie(t, BX + 10) + 8, fondoEn(BX + 10) - 4) };
    const angS = lerp(0.35, 0.95, cae) + 0.25 * r * Math.sin(t * 7);
    const largo = 92, punta = { x: baseS.x + Math.sin(angS) * largo, y: baseS.y - Math.cos(angS) * largo };
    g.strokeStyle = "#e8d2a8"; g.lineWidth = 3; g.beginPath(); g.moveTo(baseS.x, baseS.y); g.lineTo(punta.x, punta.y); g.stroke();
    g.save(); g.translate(punta.x, punta.y); g.rotate(angS);
    const gira = t * 1.2 + r * (t - T.sorbe0) * 18;
    g.fillStyle = "#ff5d8f"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(-26, 6); g.quadraticCurveTo(0, -20, 26, 6); g.closePath(); g.fill();
    g.save(); g.clip(); g.fillStyle = "#ffd23d";
    for (let k = -3; k <= 3; k++) { const x0 = ((k * 13 + gira * 13) % 52 + 78) % 52 - 26; g.beginPath(); g.moveTo(0, -9); g.lineTo(x0, 7); g.lineTo(x0 + 6, 7); g.closePath(); g.fill(); }
    g.restore();
    g.beginPath(); g.moveTo(-26, 6); g.quadraticCurveTo(0, -20, 26, 6); g.closePath(); g.stroke();
    g.fillStyle = "#0b0a0e"; g.beginPath(); g.arc(0, -8, 2.5, 0, Math.PI * 2); g.fill();
    g.restore();
    g.restore();
  }
  function peceraDelante(g, t) {
    g.save(); g.lineCap = "round";
    // brillos del cristal
    g.strokeStyle = "rgba(255,255,255,0.75)"; g.lineWidth = 5; g.beginPath(); g.arc(BX, BY, R - 10, Math.PI * 0.95, Math.PI * 1.22); g.stroke();
    g.lineWidth = 2.5; g.beginPath(); g.arc(BX, BY, R - 10, Math.PI * 1.3, Math.PI * 1.36); g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.45)"; g.lineWidth = 3; g.beginPath(); g.arc(BX, BY, R - 8, Math.PI * 0.15, Math.PI * 0.35); g.stroke();
    // contorno del cuenco y boca
    const f0 = Math.asin((RIMY - BY) / R);
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.beginPath(); g.arc(BX, BY, R, -Math.PI - f0, f0, true); g.stroke();
    g.beginPath(); g.arc(BX, BY, R, f0 + 0.0, -Math.PI - f0); g.stroke();
    g.lineWidth = 2.5; g.beginPath(); g.ellipse(BX, RIMY, RW, 6, 0, 0, Math.PI); g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 1.5; g.beginPath(); g.ellipse(BX, RIMY + 1, RW - 4, 4, 0, 0.2, Math.PI - 0.2); g.stroke();
    // rodaja de naranja en el borde (lado de Guillermo)
    g.save(); g.translate(BX - RW + 2, RIMY - 4); g.rotate(-0.35);
    g.fillStyle = "#ff9a1a"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 17, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#ffd36a"; g.beginPath(); g.arc(0, 0, 13, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#ffa23a"; g.lineWidth = 1.5; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 12, Math.sin(a) * 12); g.stroke(); }
    g.fillStyle = "#0b0a0e"; g.beginPath(); g.moveTo(-3, 14); g.lineTo(3, 14); g.lineTo(0, 20); g.closePath(); g.fill();
    g.restore();
    g.restore();
  }

  /* ---------- pajitas: tramo recto dentro de la pecera, codo de acordeón y tramo libre hasta la boca ---------- */
  const PAJ = {
    g: { base: { x: BX - 17, y: BY + R - 14 }, codo: { x: BX - 24, y: RIMY - 30 }, reposo: { x: -32, y: -34 }, raya: "#2f8fd8", eng: [T.engancha0, T.engancha1, T.suelta, T.suelta + 0.3] },
    l: { base: { x: BX + 15, y: BY + R - 14 }, codo: { x: BX + 22, y: RIMY - 38 }, reposo: { x: 30, y: -30 }, raya: "#ff4f8b", eng: [T.engancha0 + 0.05, T.engancha1 + 0.03, T.abreL + 0.1, T.abreL + 0.45] }
  };
  function puntaPaja(qq, t, boca) {
    const [a0, a1, b0, b1] = qq.eng;
    const e = suave5(fase(t, a0, a1)) * (1 - suave5(fase(t, b0, b1)));
    const rep = { x: qq.codo.x + qq.reposo.x, y: qq.codo.y + qq.reposo.y };
    // al soltarla, la punta vuelve dando un pequeño rebote
    const reb = t > b1 ? Math.exp(-(t - b1) * 6) * Math.sin((t - b1) * 22) * 6 : 0;
    const q = mezcla(rep, boca, e);
    return { x: q.x + reb * (qq === PAJ.g ? -1 : 1), y: q.y + reb * 0.5, e };
  }
  // parte: "dentro" (bajo la boca de la pecera, detrás del cristal) o "fuera" (encima de todo, hasta los labios)
  function pajita(g, qq, punta, t, liquido, parte) {
    const pts = [qq.base, qq.codo, punta];
    const ruta = () => { g.beginPath(); g.moveTo(pts[0].x, pts[0].y); g.lineTo(pts[1].x, pts[1].y); g.lineTo(pts[2].x, pts[2].y); };
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    // dentro: el cuenco por debajo de la boca; fuera: todo lo demás
    const cuenco = () => { const f0 = Math.asin((RIMY - 0.5 - BY) / R); g.moveTo(BX + R * Math.cos(f0), RIMY - 0.5); g.arc(BX, BY, R + 6, f0, Math.PI - f0); g.closePath(); };
    g.beginPath(); if (parte === "dentro") { cuenco(); g.clip(); } else { g.rect(-200, -400, W + 400, 1400); cuenco(); g.clip("evenodd"); }
    ruta(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 10; g.stroke();
    ruta(); g.strokeStyle = "#fbf8f5"; g.lineWidth = 6.5; g.stroke();
    // rayas
    g.setLineDash([6, 6]); g.lineDashOffset = 0; ruta(); g.strokeStyle = qq.raya; g.lineWidth = 6.5; g.stroke(); g.setLineDash([]);
    // líquido dentro de la pajita
    if (liquido) liquido(g, pts);
    // codo de acordeón
    const a = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
    g.strokeStyle = "rgba(11,10,14,0.85)"; g.lineWidth = 1.4;
    for (let k = -2; k <= 1; k++) { const c = { x: pts[1].x + Math.cos(a) * k * 3.2, y: pts[1].y + Math.sin(a) * k * 3.2 };
      g.beginPath(); g.moveTo(c.x - Math.sin(a) * 4, c.y + Math.cos(a) * 4); g.lineTo(c.x + Math.sin(a) * 4, c.y - Math.cos(a) * 4); g.stroke(); }
    g.restore();
  }
  // tramo de la pajita entre s0 y s1 (fracción de la longitud total)
  function tramoRuta(g, pts, s0, s1) {
    const L1 = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y), L2 = Math.hypot(pts[2].x - pts[1].x, pts[2].y - pts[1].y), Lt = L1 + L2;
    const en = s => { const d = s * Lt; if (d <= L1) return mezcla(pts[0], pts[1], d / L1); return mezcla(pts[1], pts[2], (d - L1) / Math.max(1e-6, L2)); };
    g.beginPath(); const a = en(s0); g.moveTo(a.x, a.y);
    if (s0 * Lt < L1 && s1 * Lt > L1) g.lineTo(pts[1].x, pts[1].y);
    const b = en(s1); g.lineTo(b.x, b.y);
    return en;
  }
  function liquidoG(t) {
    const sorbito = tramo(t, T.engancha1, T.engancha1 + 0.3) * (1 - tramo(t, T.pilla0, T.pilla0 + 0.2));
    const fuerte = tramo(t, T.sorbe0 - 0.05, T.sorbe0 + 0.12) * (1 - tramo(t, T.vacio - 0.05, T.vacio + 0.25));
    return (g, pts) => {
      const k = Math.max(sorbito * 0.9, fuerte);
      if (k < 0.01) return;
      g.save(); g.lineCap = "round";
      tramoRuta(g, pts, 0, k); g.strokeStyle = "#ff5d7e"; g.lineWidth = fuerte > 0.05 ? 4.5 : 3.2; g.globalAlpha = 0.95; g.stroke();
      if (fuerte > 0.05) { g.setLineDash([4, 10]); g.lineDashOffset = -t * 260; tramoRuta(g, pts, 0, k); g.strokeStyle = "rgba(255,230,180,0.9)"; g.lineWidth = 2; g.stroke(); }
      g.restore();
    };
  }
  function liquidoL(t) {
    const sorbito = tramo(t, T.engancha1, T.engancha1 + 0.3) * (1 - tramo(t, T.vacio - 0.25, T.vacio));
    const borbotea = campana(t, T.vacio - 0.1, T.gluglu1);
    return (g, pts) => {
      g.save(); g.lineCap = "round";
      if (sorbito > 0.01) { tramoRuta(g, pts, 0, 0.92 * sorbito); g.strokeStyle = "#ff5d7e"; g.lineWidth = 3.2; g.stroke(); }
      if (borbotea > 0.01) {
        // burbujas de aire y restos que suben a trompicones
        for (let i = 0; i < 6; i++) {
          const ph = ((t - T.vacio) * 1.8 + i / 6) % 1, en = tramoRuta(g, pts, 0, 0.001);
          const q = en(clamp(ph * 0.95));
          g.globalAlpha = borbotea * Math.sin(Math.PI * ph);
          g.fillStyle = i % 2 ? "#ff7a8e" : "rgba(255,255,255,0.95)";
          g.beginPath(); g.arc(q.x, q.y, i % 2 ? 2.4 : 2.8, 0, Math.PI * 2); g.fill();
        }
      }
      g.restore();
    };
  }
  // borboteo: burbujas en el fondo y rayitas de vibración alrededor de la pecera
  function borboteo(g, t) {
    const k = campana(t, T.vacio - 0.1, T.gluglu1); if (k <= 0.01) return;
    g.save();
    for (let i = 0; i < 7; i++) {
      const ph = ((t - T.vacio) * 2.2 + hash(i + 31)) % 1, x = PAJ.l.base.x + (hash(i + 3) - 0.5) * 18, y = PAJ.l.base.y - ph * 22;
      g.globalAlpha = k * (1 - ph); g.strokeStyle = "rgba(255,255,255,0.95)"; g.lineWidth = 1.5;
      g.beginPath(); g.arc(x, y, 2 + 3 * ph, 0, Math.PI * 2); g.stroke();
    }
    g.globalAlpha = k; g.strokeStyle = "#fff6d0"; g.lineWidth = 2.5; g.lineCap = "round";
    for (const [a, d] of [[0.35, 1], [0.15, 1], [Math.PI - 0.35, -1], [Math.PI - 0.15, -1]]) {
      const w = Math.sin((t - T.vacio) * 30 + a * 5) * 2;
      const r0 = R + 8 + w; g.beginPath(); g.arc(BX, BY, r0, a - 0.08, a + 0.08); g.stroke();
    }
    g.restore();
  }

  // centro de la boca en cada retrato
  const BOCA_G = { x: 805, y: 736 }, BOCA_L = { x: 837, y: 616 };
  // labios fruncidos alrededor de la punta de la pajita (encima de la pajita)
  function labios(g, punta, p, P, tinta, sup, inf) {
    const e = punta.e; if (e < 0.6) return;
    const H = P.cabeza(p), k = clamp((e - 0.6) / 0.3), esc = H.kx * p.s * (P.K || 1);
    const a = (p.espejo ? -1 : 1) * (H.ang + 0.26);
    g.save(); g.globalAlpha = k; g.translate(punta.x, punta.y); g.rotate(a); g.scale(esc / 0.18, esc / 0.18);
    g.lineJoin = "round"; g.lineCap = "round";
    // piel / labios que tapan el final de la pajita
    g.fillStyle = sup || P.C.piel; g.beginPath(); g.ellipse(0, -1.5, 8, 4.2, 0, Math.PI, Math.PI * 2); g.fill();
    g.fillStyle = inf || P.C.piel; g.beginPath(); g.ellipse(0, 1.5, 8, 5, 0, 0, Math.PI); g.fill();
    g.fillStyle = "#4f1512"; g.beginPath(); g.ellipse(0, 0, 4.6, 2.6, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = tinta; g.lineWidth = 1.6;
    g.beginPath(); g.ellipse(0, 0, 8, 5.2, 0, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
    g.beginPath(); g.ellipse(0, 0.5, 7.5, 5.5, 0, Math.PI * 0.12, Math.PI * 0.88); g.stroke();
    g.restore();
  }

  /* ---------- guinda ---------- */
  const GUINDA_R = 9, RABITO_L = 26;
  RABITO0 = { x: BX + RW + 6, y: RIMY - 30 };
  function dibGuinda(g, top, ang, esc = 1) {   // top: punta del rabito; ang: hacia dónde cuelga (0 = recto abajo, + hacia la derecha)
    const c = { x: top.x + Math.sin(ang) * RABITO_L, y: top.y + Math.cos(ang) * RABITO_L };
    const GUINDA_R = 9 * esc;
    g.save(); g.lineCap = "round";
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 4.5; g.beginPath(); g.moveTo(top.x, top.y); g.quadraticCurveTo(top.x + 6, top.y + RABITO_L * 0.5, c.x, c.y - GUINDA_R + 2); g.stroke();
    g.strokeStyle = "#5a7a1a"; g.lineWidth = 2.2; g.stroke();
    const gr = g.createRadialGradient(c.x - 3, c.y - 3, 1, c.x, c.y, GUINDA_R * 1.2); gr.addColorStop(0, "#ff6a6a"); gr.addColorStop(0.5, "#d4101e"); gr.addColorStop(1, "#7a0010");
    g.fillStyle = gr; g.beginPath(); g.arc(c.x, c.y, GUINDA_R, 0, Math.PI * 2); g.fill(); g.lineWidth = 2.2; g.strokeStyle = "#0b0a0e"; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.85)"; g.beginPath(); g.ellipse(c.x - 3, c.y - 3.5, 2.6, 1.6, -0.6, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function dibRabito(g, top, ang) {
    g.save(); g.lineCap = "round";
    const c = { x: top.x + Math.sin(ang) * RABITO_L * 0.85, y: top.y + Math.cos(ang) * RABITO_L * 0.85 };
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 4.5; g.beginPath(); g.moveTo(top.x, top.y); g.quadraticCurveTo(top.x + 5, top.y + RABITO_L * 0.45, c.x, c.y); g.stroke();
    g.strokeStyle = "#5a7a1a"; g.lineWidth = 2.2; g.stroke(); g.restore();
  }
  // balanceo de la guinda colgando (ángulo en pantalla)
  function balanceo(t) {
    if (t < T.pinza) return -0.55;                  // apoyada en el borde, el rabito hacia arriba
    const u = t - T.pinza;
    const a = -0.55 * Math.exp(-u * 5) + 0.5 * Math.exp(-(u) * 1.6) * Math.sin(u * 8.5) * tramo(t, T.pinza, T.pinza + 0.15);
    const k = suave(fase(t, T.boca0, T.muerde - 0.05)) * (1 - suave(fase(t, T.muerde + 0.1, T.muerde + 0.5)));
    return lerp(a, ANG_BOCA, k);
  }
  const ANG_BOCA = 1.25;
    // dibujada dentro de la mano (unidades de mano; antes que los dedos, así el rabito queda pinzado)
  function guindaEnMano(g, t, pL, m) {
    const q = pinzaLocal();
    const ang = balanceo(t), dir = { x: Math.sin(ang) * (pL.espejo ? -1 : 1), y: Math.cos(ang) };
    const loc = rot(dir, -(m.ang || 0));
    const a = Math.atan2(loc.x, loc.y);
    const k = 1 / L.JK;      // de px de pantalla a unidades de mano (aprox.: la escala de la hoja la hace la transformación)
    g.save(); g.translate(q.x, q.y);
    const e = 1 / (S * L.K);
    g.scale(k * e, k * e);
    const se = 1 - fase(t, T.muerde - 0.04, T.muerde + 0.03);
    if (se > 0.001) dibGuinda(g, { x: 0, y: 0 }, a, se); else dibRabito(g, { x: 0, y: 0 }, a);
    g.restore();
  }
  // el rabito cae dentro de la pecera al soltarlo
  function rabitoCae(g, t, pL) {
    if (t < T.tira) return;
    const u = t - T.tira, desde = SUELTA_EN || { x: BX + 18, y: RIMY - 46 };
    const yFin = Y_FONDO - 4;
    const y = Math.min(yFin, desde.y + 30 * u + 0.5 * 1400 * u * u), x = desde.x - 10 * Math.min(u, 0.35);
    const ang = 0.5 + 2.2 * Math.min(u, 0.4);
    dibRabito(g, { x, y }, ang);
    const cl = fase(t, T.tira + 0.25, T.tira + 0.5);
    if (cl > 0 && cl < 1 && y >= yFin - 0.5) { g.save(); g.strokeStyle = `rgba(255,255,230,${1 - cl})`; g.lineWidth = 2; g.lineCap = "round";
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.45, r0 = 8 + 12 * cl; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, yFin + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * (r0 + 6), yFin + Math.sin(a) * (r0 + 6)); g.stroke(); }
      g.restore(); }
  }
  let SUELTA_EN = null;

  /* ---------- efectos ---------- */
  function corazon(g, x, y, r, a) {
    g.save(); g.translate(x, y); g.rotate(a); g.beginPath();
    g.moveTo(0, r * 0.9); g.bezierCurveTo(-r * 1.4, -r * 0.1, -r * 0.7, -r * 1.2, 0, -r * 0.45); g.bezierCurveTo(r * 0.7, -r * 1.2, r * 1.4, -r * 0.1, 0, r * 0.9); g.closePath();
    g.fillStyle = "#ff4f8b"; g.fill(); g.lineWidth = 2; g.strokeStyle = "#0b0a0e"; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(-r * 0.45, -r * 0.35, r * 0.22, r * 0.14, -0.5, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function corazones(g, t) {
    const k = tramo(t, T.tierno0 + 0.2, T.tierno0 + 0.6) * (1 - tramo(t, T.pilla0, T.sorbe0 + 0.1));
    if (k <= 0.01) return;
    for (let i = 0; i < 6; i++) {
      const ph = ((t - T.tierno0) * 0.42 + i / 6) % 1;
      const x = BX + (hash(i + 70) - 0.5) * 120 + 10 * Math.sin(t * 2.5 + i), y = 236 - ph * 150;
      const r = (6 + 5 * hash(i + 71)) * Math.min(1, ph * 4);
      g.save(); g.globalAlpha = k * Math.sin(Math.PI * ph); corazon(g, x, y, r, 0.25 * Math.sin(t * 3 + i)); g.restore();
    }
  }
  function eructo(g, t, pG) {
    const k = fase(t, T.eructo, T.eructo + 0.7); if (k <= 0 || k >= 1) return;
    const b = G.aPantalla(pG, G.boca(pG));
    g.save();
    // nubecilla que sale entre los dedos hacia Laura
    for (let i = 0; i < 4; i++) {
      const u = clamp(k * 1.4 - i * 0.12); if (u <= 0) continue;
      const x = b.x + 18 + 120 * salida(u) + i * 6, y = b.y + 6 - 10 * Math.sin(i + 1) * u;
      g.globalAlpha = (1 - u) * 0.65; g.fillStyle = "#e8f0dc";
      g.beginPath(); g.arc(x, y, 7 + 16 * u, 0, Math.PI * 2); g.fill();
    }
    // rayas de viento
    g.globalAlpha = 1 - k; g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.lineCap = "round";
    for (let i = -1; i <= 1; i++) {
      const x0 = b.x + 30 + 170 * salida(k), y0 = b.y + 4 + i * 16;
      g.beginPath(); g.moveTo(x0 - 40, y0); g.quadraticCurveTo(x0 - 18, y0 - 4, x0, y0 + i * 3); g.stroke();
    }
    g.restore();
  }
  function destello(g, x, y, k, r) {
    if (k <= 0.01) return;
    g.save(); g.globalAlpha = k; g.fillStyle = "#ffffff"; g.translate(x, y); g.rotate(0.3);
    g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.25 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill();
    g.restore();
  }
  // gotitas de sudor de esfuerzo en el aire mientras sorbe (líneas de velocidad hacia la pajita)
  function rayasSorbo(g, t, pG) {
    const k = campana(t, T.sorbe0 + 0.05, T.vacio); if (k <= 0.02) return;
    const b = G.aPantalla(pG, G.boca(pG));
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.75 * k})`; g.lineWidth = 2.5; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const ph = ((t - T.sorbe0) * 3 + i / 3) % 1, x = b.x + 60 - ph * 40, y = b.y - 22 + i * 18;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - 16, y + (i - 1) * 3); g.stroke(); }
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const k = tramo(t, T.sorbe0 - 0.3, T.sorbe0 + 0.4) * (1 - tramo(t, T.miraG + 0.2, T.trago + 0.8));
    const fin = tramo(t, T.boca0 - 0.6, T.muerde) * (1 - tramo(t, T.camara0 + 0.4, T.fin));
    return { k: 1.28 + 0.07 * k + 0.04 * fin, x: 512, y: 352 - 4 * k - 2 * fin };
  }

  const pose = t => ({ g: poseG(t), l: poseL(t) });

  class GuillermoLauraPajita extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !L.listo()) return;
      if (!fondo) fondo = creaFondo();
      const pG = poseG(t), pL = poseL(t);
      // dónde se suelta el rabito (para que caiga desde la mano)
      if (t >= T.tira && !SUELTA_EN) { const pp = poseL(T.tira - 1e-4); SUELTA_EN = L.aPantalla(pp, pinzaHoja(pp.manoLejos)); }
      const luz = tramo(t, NEGRO_INICIO, 0.9, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      g.drawImage(fondo, -40, -60);
      antorcha(g, 150, t); antorcha(g, 875, t);
      // sombras
      g.save(); g.fillStyle = "rgba(0,0,0,0.35)";
      g.beginPath(); g.ellipse(pG.x + 6, SUELO + 1, 105, 9, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pL.x - 4, SUELO + 1, 95, 8, 0, 0, Math.PI * 2); g.fill(); g.restore();
      mesa(g);
      peceraAtras(g, t);
      borboteo(g, t);
      // pajitas (la punta va a los labios)
      const bocaG = G.aPantalla(pG, G.cabeza(pG).a(BOCA_G)), bocaL = L.aPantalla(pL, L.cabeza(pL).a(BOCA_L));
      const pg = puntaPaja(PAJ.g, t, bocaG), pl = puntaPaja(PAJ.l, t, bocaL);
      const lqL = liquidoL(t), lqG = liquidoG(t);
      pajita(g, PAJ.l, pl, t, lqL, "dentro");
      pajita(g, PAJ.g, pg, t, lqG, "dentro");
      peceraDelante(g, t);
      if (t < T.pinza) dibGuinda(g, RABITO0, balanceo(t));
      rabitoCae(g, t, pL);
      // tramo de fuera de las pajitas: mientras está en la boca va por encima de la cara (llega a los labios);
      // suelta, por detrás de los personajes (la mano de Guillermo pasa por delante)
      if (pl.e <= 0) pajita(g, PAJ.l, pl, t, lqL, "fuera");
      if (pg.e <= 0) pajita(g, PAJ.g, pg, t, lqG, "fuera");
      G.dibujar(g, pG, t);
      L.dibujar(g, pL, t);
      if (pl.e > 0) pajita(g, PAJ.l, pl, t, lqL, "fuera");
      if (pg.e > 0) pajita(g, PAJ.g, pg, t, lqG, "fuera");
      labios(g, pg, pG, G, "#0b0a0e", null, null);
      labios(g, pl, pL, L, "#0b0a0e", "#b65a4a", "#d97b66");
      corazones(g, t);
      rayasSorbo(g, t, pG);
      eructo(g, t, pG);
      // destello de chulería al tragarse la guinda y en el guiño
      const bL = L.aPantalla(pL, L.boca(pL));
      destello(g, bL.x + 24, bL.y - 16, campana(t, T.muerde + 0.15, T.muerde + 0.55), 13);
      const oL = L.aPantalla(pL, L.cabeza(pL).a({ x: 812, y: 466 }));
      destello(g, oL.x - 4, oL.y - 22, campana(t, T.guino + 0.1, T.guino + 0.5), 16);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00013", nombre: "Guillermo y Laura · La pajita", crear: () => new GuillermoLauraPajita() });
  window.__A2D_00013 = { pose, poseG, poseL, T, DUR };
})();
