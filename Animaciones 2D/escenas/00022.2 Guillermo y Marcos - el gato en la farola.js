"use strict";
/* 00022.2 · Guillermo y Marcos · El gato en la farola
 *
 * Negro → de noche, en una plazuela delante del bar: un gato asustado maúlla subido en lo alto de
 * una farola → Guillermo llega andando, lo oye, se pone en jarras de héroe y se lanza a la farola →
 * trepa abrazado a ella a tirones, con la lengua fuera → arriba le pone morritos al gato y le hace
 * «ven» con el dedo… el gato le bufa y salta por encima de su cabeza hasta el farol → Guillermo mira
 * abajo, ve la altura y se queda abrazado a la farola, temblando y con los ojos apretados → llega
 * Marcos con una escalera al hombro; Guillermo le pide ayuda con la mano, pero Marcos apoya la
 * escalera en el farol, sube tranquilo y el gato salta a sus brazos → el gato le sube al casco y se
 * queda ronroneando → Marcos baja deslizándose por la escalera, se da la vuelta, coge la escalera y se
 * va; Guillermo estira la mano hacia la escalera que se aleja → resbala poco a poco por la farola, con
 * chirridos, y acaba hecho un ovillo al pie de la farola, mirando a cámara; el gato mueve la cola desde
 * el casco mientras se van → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, M = MarcosBombero;
  const S = 0.23, SUELO = 565;
  const DUR = 14.5;
  const PX = 430, CAP = 90;                       // eje de la farola y tapa de arriba (donde está el gato)
  const GANCHO = { x: 590, y: 124 };               // de aquí cuelga el farol
  const ESC_P = { pie: { x: 775, y: SUELO - 8 }, cima: { x: 628, y: 140 } };   // escalera apoyada en el brazo de la farola
  const T = {
    maulla: [0.6, 1.95, 3.2, 4.25], entra0: 0.15, entra1: 1.45, oye: 1.05, heroe0: 1.55, heroe1: 2.05,
    salta: 2.15, agarra: 2.42, trepa0: 2.45, trepa1: 4.6,
    llama0: 4.6, llama1: 5.15, bufa: 5.2, gSalta0: 5.42, gSalta1: 5.82,
    abajo: 5.98, panico: 6.25, espia: 6.95,
    mEntra0: 6.12, mEntra1: 7.6, mMira: 7.62, ayuda0: 7.8, ayuda1: 8.55,
    planta0: 7.95, planta1: 8.6, sube0: 8.7, sube1: 9.72,
    gBrazos0: 9.86, gBrazos1: 10.12, gCasco0: 10.48, gCasco1: 10.86,
    baja0: 10.95, baja1: 11.42, gira0: 11.44, gira1: 11.66, coge0: 11.66, coge1: 12.14, mSale0: 12.04, mSale1: 13.75,
    pide0: 11.45, pide1: 11.92, desliza0: 11.98, desliza1: 12.85, cae1: 13.08, camara: 13.18, fin: 13.85
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  // mezcla de dos especificaciones de postura (números, objetos anidados; lo demás se toma del segundo a partir de la mitad)
  function mezclaP(a, b, k) {
    if (k <= 0) return a; if (k >= 1) return b;
    if (typeof a === "number" && typeof b === "number") return lerp(a, b, k);
    if (a && b && typeof a === "object" && typeof b === "object") {
      const o = {}; for (const n of new Set([...Object.keys(a), ...Object.keys(b)])) o[n] = n in a && n in b ? mezclaP(a[n], b[n], k) : (n in b ? b[n] : a[n]);
      return o;
    }
    return k < 0.5 ? a : b;
  }
  const D = (pu, ix, re) => ({ pulgar: pu, indice: ix, medio: re, anular: re, menique: re });
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

  // Postura a partir de una especificación en pantalla: pelvis (px, suelo), pies y manos en px de pantalla.
  function construye(P, e) {
    const p = { x: e.px, suelo: e.suelo, s: S, espejo: !!e.espejo,
      pelvis: { x: P.PELVIS.x, y: P.PELVIS.y + e.pel }, torso: e.torso, torsoEsc: { x: e.tex || 1, y: e.tey || 1 },
      cabeza: { ang: e.cab, dx: 0, dy: e.cdy || 0, esc: { x: 1, y: 1 } }, piernas: {}, tirasLimpias: true, ikContinuo: true, hombrosContinuos: P === G, hombrosRecortados: P === G };
    for (const lado of ["cerca", "lejos"]) { const f = e.pies[lado]; p.piernas[lado] = { tob: P.aHoja(p, f), ang: f.ang || 0 }; }
    for (const [lado, nom] of [["cerca", "manoCerca"], ["lejos", "manoLejos"]]) {
      const m = e.manos[lado], h = P.aHoja(p, m);
      const o = { x: h.x, y: h.y, ang: m.ang || 0, mu: m.mu, dobla: m.dobla ?? -1, puno: m.puno ?? 1 };
      if (m.dedos) o.dedos = m.dedos;
      if (m.pulgar) o.pulgar = m.pulgar;
      p[nom] = o;
    }
    return p;
  }
  // de hoja a pantalla con una especificación (para colocar las manos respecto al propio cuerpo)
  const aPant = (P, e, q) => P.aPantalla({ x: e.px, suelo: e.suelo, s: S, espejo: !!e.espejo }, q);
  // punto de un tronco inclinado (hoja), igual que el montaje
  function enTronco(P, e, q) {
    const c = Math.cos(e.torso), s = Math.sin(e.torso), x = (q.x - P.PELVIS.x) * (e.tex || 1), y = (q.y - P.PELVIS.y) * (e.tey || 1);
    return { x: P.PELVIS.x + x * c - y * s, y: P.PELVIS.y + e.pel + x * s + y * c };
  }
  // no dejar que una mano se vaya más lejos de lo que llega el brazo
  function alcance(P, e, lado, m) {
    const h = aPant(P, e, enTronco(P, e, lado === "cerca" ? P.HOMBRO_C : P.HOMBRO));
    const L = (lado === "cerca" ? P.BRAZO_C_L : P.BRAZO_L) * S * (P.K || 1) * 1.02;
    const dx = m.x - h.x, dy = m.y - h.y, d = Math.hypot(dx, dy);
    if (d > L) { m.x = h.x + dx / d * L; m.y = h.y + dy / d * L; }
    return m;
  }

  /* ---------- pisadas ---------- */
  // pasos: [despega, apoya, x del tobillo]; el pie hace un arco y despega la punta
  function generaPasos(x0, x1, t0, t1, n, primero, anchoC, anchoL, iniC, iniL) {
    const P = { cerca: [[-10, -9, iniC]], lejos: [[-10, -9, iniL]] };
    const dt = (t1 - t0) / n, avance = (x1 - x0) / n;
    let pie = primero;
    for (let i = 0; i < n; i++) {
      const ta = t0 + i * dt, tb = ta + dt * 1.05;
      const objetivo = i >= n - 2 ? x1 + (pie === "cerca" ? anchoC : anchoL) : x0 + avance * (i + 1.5) + (pie === "cerca" ? anchoC : anchoL);
      P[pie].push([ta, tb, objetivo]);
      pie = pie === "cerca" ? "lejos" : "cerca";
    }
    return P;
  }
  function pisada(L, t, alto, dir) {
    let i = 0; while (i + 1 < L.length && t >= L[i + 1][0]) i++;
    const [t0, t1, x] = L[i], xa = i > 0 ? L[i - 1][2] : x, u = fase(t, t0, t1), arco = Math.sin(Math.PI * u);
    return { x: lerp(xa, x, suave5(u)), lev: alto * arco, ang: (-0.28 * Math.sin(Math.PI * Math.min(1, u * 1.3)) + 0.18 * campana(u, 0.55, 1)) * (u > 0 && u < 1 ? 1 : 0) };
  }
  const xAndar = (x0, x1, t0, t1, t) => { const u = fase(t, t0, t1); return lerp(x0, x1, 0.5 * u + 0.5 * suave(u)); };

  /* ================= Guillermo ================= */
  const XG_SUELO = 330, XG_POSTE = 388;
  const PAS_G = generaPasos(-110, XG_SUELO, T.entra0, T.entra1, 5, "lejos", -15, 14, -110 - 15, -110 + 14);
  const TOB_G = G.TOBILLO_ALTO * S;
  const BOLS_G = { c: { x: 131, y: 652 }, l: { x: 372, y: 648 } };     // muñecas en los bolsillos (hoja)
  const R_MG = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_MG, y: m.y - Math.sin(mu) * R_MG });

  function especGSuelo(t) {
    const x = xAndar(-110, XG_SUELO, T.entra0, T.entra1, t);
    const andando = t < T.entra1 + 0.05;
    const bote = andando ? Math.abs(Math.sin((t - T.entra0) * Math.PI / ((T.entra1 - T.entra0) / 5))) * tramo(t, T.entra0, T.entra0 + 0.2) * (1 - tramo(t, T.entra1 - 0.25, T.entra1)) : 0;
    const heroe = tramo(t, T.heroe0, T.heroe0 + 0.3);
    const agacha = campana(t, T.heroe1 - 0.05, T.salta + 0.1);       // impulso del salto
    const e = { px: x, suelo: SUELO, pel: -14 * bote + 58 * agacha - 6 * heroe, torso: 0.04 * (andando ? 1 : 0) - 0.06 * heroe + 0.12 * agacha, cab: -0.08 * tramo(t, T.oye, T.oye + 0.3) - 0.1 * heroe * (1 - tramo(t, T.heroe1 - 0.2, T.heroe1)),
      tex: 1 + 0.04 * heroe, tey: 1 + 0.02 * heroe, pies: {}, manos: {} };
    for (const lado of ["cerca", "lejos"]) {
      const f = pisada(PAS_G[lado], t, 30, 1);
      e.pies[lado] = { x: f.x, y: SUELO - TOB_G - (lado === "lejos" ? 12 * S : 0) - f.lev, ang: f.ang };
    }
    // manos: en los bolsillos al andar; en jarras de héroe después
    const bc = punoDesde(BOLS_G.c, -1.75), bl = punoDesde(BOLS_G.l, -1.75);
    const jc = { x: 118, y: 640 }, jl = { x: 395, y: 632 };
    const mc = mezcla(bc, jc, heroe), ml = mezcla(bl, jl, heroe);
    const sc = aPant(G, e, enTronco(G, e, mc)), sl = aPant(G, e, enTronco(G, e, ml));
    e.manos.cerca = { x: sc.x, y: sc.y, mu: lerp(-1.75, -2.1, heroe), ang: lerp(0, 0.5, heroe), puno: heroe, dobla: -1 };
    e.manos.lejos = { x: sl.x, y: sl.y, mu: lerp(-1.75, -1.2, heroe), ang: lerp(0, -0.4, heroe), puno: heroe, dobla: -1 };
    return e;
  }

  // trepar: las manos suben primero, luego el cuerpo y al final los pies (como un gusano)
  const ALT0 = 34, ALT1 = 126, NCIC = 4, DCIC = (T.trepa1 - T.trepa0) / NCIC, DALT = (ALT1 - ALT0) / NCIC;
  const sube = (t, a, b) => { let s = 0; for (let i = 0; i < NCIC; i++) { const t0 = T.trepa0 + i * DCIC; s += suave(fase(t, t0 + a * DCIC, t0 + b * DCIC)); } return s; };
  const altManos = t => ALT0 + DALT * sube(t, 0, 0.38);
  const altCuerpo = t => ALT0 + DALT * sube(t, 0.32, 0.78);
  const altPies = t => ALT0 + DALT * sube(t, 0.58, 0.96);
  // bajar resbalando: a tirones, con chirridos
  function altBaja(t) {
    const u = fase(t, T.desliza0, T.desliza1);
    const tir = u + 0.035 * Math.sin(u * Math.PI * 9) * (1 - u);
    return ALT1 * (1 - clamp(entrada(Math.min(1, tir * 1.0)) * 0.35 + tir * 0.65));
  }

  function especGPoste(t) {
    const trepando = t < T.trepa1;
    let alt = trepando ? altCuerpo(t) : ALT1, altM = trepando ? altManos(t) : ALT1, altP = trepando ? altPies(t) : ALT1;
    if (t >= T.desliza0) { alt = altM = altP = altBaja(t); }
    const panico = tramo(t, T.panico, T.panico + 0.25) * (1 - tramo(t, T.desliza1, T.cae1));
    const tiemb = panico * (1 - 0.6 * tramo(t, T.ayuda0, T.ayuda0 + 0.2) * (1 - tramo(t, T.ayuda1 - 0.1, T.ayuda1 + 0.2)));
    const e = { px: XG_POSTE + 1.6 * ruido(t * 31) * tiemb, suelo: SUELO - alt, pel: -6, torso: 0.1 + 0.02 * Math.sin((t - T.trepa0) * Math.PI * 2 / DCIC) * (trepando ? 1 : 0) + 0.015 * ruido(t * 27 + 5) * tiemb,
      cab: -0.18, pies: {}, manos: {} };
    // mira hacia arriba al trepar y al gato; abajo al darse cuenta; pegado a la farola con el pánico
    e.cab = -0.16 - 0.12 * tramo(t, T.trepa1 - 0.3, T.llama0 + 0.2) * (1 - tramo(t, T.gSalta0, T.abajo)) + 0.32 * tramo(t, T.abajo, T.abajo + 0.2) * (1 - tramo(t, T.panico, T.panico + 0.25))
      + 0.16 * panico + 0.02 * ruido(t * 23) * tiemb;
    e.cab += -0.15 * tramo(t, T.bufa, T.bufa + 0.08) * (1 - tramo(t, T.bufa + 0.15, T.bufa + 0.4));     // respingo
    // poste en la hoja
    const pp = { x: e.px, suelo: e.suelo, s: S };
    const xPost = G.aHoja(pp, { x: PX - 4, y: 0 }).x;
    // pies apoyados en la farola (punta contra el poste), uno más alto que otro
    const rel = (alt - altP) / S;
    const yC = 980 + rel + 40 * panico, yL = 1050 + rel * 0.8 + 30 * panico;
    const pc = aPant(G, e, { x: xPost - 125, y: yC }), pl = aPant(G, e, { x: xPost - 112, y: yL });
    e.pies.cerca = { x: pc.x, y: pc.y, ang: -1.1 }; e.pies.lejos = { x: pl.x, y: pl.y, ang: -1.0 };
    // manos agarradas al poste; al trepar suben antes que el cuerpo
    const relM = (altM - alt) / S;
    const hc = aPant(G, e, { x: xPost - 8, y: 372 - relM * 0.95 - 40 * panico }), hl = aPant(G, e, { x: xPost - 2, y: 250 - relM * 0.9 + 10 * panico });
    let mc = { x: hc.x, y: hc.y, mu: 2.2, ang: 0, puno: 1, dobla: -1 }, ml = { x: hl.x, y: hl.y, mu: 2.0, ang: 0, puno: 1, dobla: -1 };
    // «ven, gatito»: la mano lejana suelta el poste y llama con el índice
    const llama = tramo(t, T.llama0, T.llama0 + 0.3) * (1 - tramo(t, T.bufa, T.bufa + 0.12));
    if (llama > 0.001) {
      const q = aPant(G, e, { x: xPost + 46, y: 92 });
      const w = 0.5 + 0.5 * Math.sin((t - T.llama0) * 16);
      ml = mezclaP(ml, { x: q.x, y: q.y, mu: 1.75, ang: 0, puno: 1, dobla: -1, dedos: D(0.2, 0.45 + 0.55 * w, 0) }, llama);
      if (llama > 0.5) ml.dedos = D(0.2, 0.45 + 0.55 * w, 0); else ml.dedos = D(0, lerp(0, 0.45 + 0.55 * w, llama * 2), 0);
    }
    // pide ayuda a Marcos: mano lejana abierta hacia él, saludando
    const ayuda = tramo(t, T.ayuda0, T.ayuda0 + 0.25) * (1 - tramo(t, T.ayuda1 - 0.15, T.ayuda1 + 0.15));
    if (ayuda > 0.001) {
      const w = Math.sin((t - T.ayuda0) * 15);
      const q = aPant(G, e, { x: xPost + 140, y: 200 + 25 * w });
      ml = mezclaP(ml, { x: q.x, y: q.y, mu: 2.5, ang: 0.15 * w, puno: 1, dobla: -1, dedos: D(1, 1, 1) }, ayuda);
      ml.dedos = D(lerp(0, 1, ayuda), lerp(0, 1, ayuda), lerp(0, 1, ayuda));
    }
    // estira la mano hacia la escalera que se va
    const pide = tramo(t, T.pide0, T.pide0 + 0.2) * (1 - tramo(t, T.pide1, T.desliza0 + 0.15));
    if (pide > 0.001) {
      const w = Math.sin((t - T.pide0) * 22);
      const q = aPant(G, e, { x: xPost + 175, y: 300 + 10 * w });
      ml = mezclaP(ml, { x: q.x, y: q.y, mu: 2.9, ang: 0.08 * w, puno: 1, dobla: -1, dedos: D(1, 1, 1) }, pide);
      ml.dedos = D(lerp(0, 0.9, pide), lerp(0, 1, pide), lerp(0, 0.6 + 0.4 * w, pide));
    }
    e.manos.cerca = alcance(G, e, "cerca", mc); e.manos.lejos = alcance(G, e, "lejos", ml);
    return e;
  }
  // hecho un ovillo al pie de la farola
  function especGMonton(t) {
    const resp = Math.sin(t * 2.2);
    const e = { px: XG_POSTE - 10, suelo: SUELO, pel: 548 + resp * 1.5, torso: -0.2, cab: 0.18 - 0.14 * tramo(t, T.camara, T.camara + 0.35), pies: {}, manos: {} };
    const pc = aPant(G, e, { x: 470, y: SUELO_G - G.TOBILLO_ALTO - 8 }), pl = aPant(G, e, { x: 560, y: SUELO_G - G.TOBILLO_ALTO - 20 });
    e.pies.cerca = { x: pc.x, y: pc.y, ang: -1.2 }; e.pies.lejos = { x: pl.x, y: pl.y, ang: -1.35 };
    const mc = aPant(G, e, enTronco(G, e, { x: 60, y: 690 })), ml = aPant(G, e, enTronco(G, e, { x: 410, y: 670 }));
    e.manos.cerca = { x: mc.x, y: mc.y, mu: -1.9, ang: 0.2, puno: 1, dobla: -1, dedos: D(0.5, 0.6, 0.55) };
    e.manos.lejos = { x: ml.x, y: ml.y, mu: -1.4, ang: -0.3, puno: 1, dobla: -1, dedos: D(0.5, 0.6, 0.55) };
    return e;
  }
  const SUELO_G = G.SUELO;

  /* caras de Guillermo */
  const CG = {
    inicio: E({ mx: 0.8 }),
    oye: E({ mx: 0.65, my: -0.85, iris: 1.1, sd: 16, si: 16, gd: 0.12, gi: 0.12, orig: 0, abre: 9, ancho: 0.6, sonr: -0.05 }),
    heroe: E({ mx: -0.85, my: -0.1, sd: -6, si: 10, gd: -0.12, gi: 0.06, orig: 0, sonr: 0.7, ancho: 1.0, abre: 2 }),
    decidido: E({ mx: 0.7, my: -0.7, sd: -8, si: -8, gd: -0.2, gi: -0.2, orig: 0, sonr: 0.35, ancho: 0.95 }),
    esfuerzo: E({ mx: 0.7, my: -0.75, c: 0.35, z: 0.3, sd: -9, si: -9, gd: -0.22, gi: -0.22, orig: 0, abre: 6, ancho: 1.12, sonr: -0.55, lengua: 0.8, rub: 0.4, rojo: 0.15 }),
    llama: E({ mx: 0.4, my: -1, iris: 1.12, sd: 18, si: 18, gd: 0.15, gi: 0.15, orig: 0, abre: 3, ancho: 0.45, sonr: 0.2, rub: 0.5 }),
    respingo: E({ mx: 0.35, my: -1, iris: 0.75, sd: 24, si: 24, gd: 0.05, gi: 0.05, orig: 0, abre: 22, ancho: 0.62, sonr: -0.2, lengua: 0.2 }),
    sigue: E({ mx: 0.95, my: -0.7, iris: 0.9, sd: 18, si: 18, gd: 0.1, gi: 0.1, orig: 0, abre: 12, ancho: 0.62, sonr: -0.15 }),
    abajo: E({ mx: 0.45, my: 0.95, iris: 0.6, sd: 26, si: 26, gd: 0.18, gi: 0.18, orig: 0, abre: 14, ancho: 0.55, sonr: -0.4 }),
    panico: E({ mx: 0.4, my: 0.6, c: 1, z: 1, sd: 18, si: 18, gd: 0.32, gi: 0.32, orig: 0, abre: 8, ancho: 1.05, sonr: -0.75 }),
    espia: E({ mx: 0.35, my: 0.95, c: 1, z: 1, wi: -1.6, sd: 20, si: 22, gd: 0.3, gi: 0.25, orig: 0, abre: 7, ancho: 1.0, sonr: -0.7 }),
    esperanza: E({ mx: 0.95, my: -0.1, iris: 1.12, sd: 22, si: 22, gd: 0.25, gi: 0.25, orig: 0, abre: 20, ancho: 0.95, sonr: 0.65 }),
    mira: E({ mx: 0.95, my: -0.2, iris: 1.05, sd: 16, si: 16, gd: 0.22, gi: 0.22, orig: 0, abre: 6, ancho: 0.7, sonr: 0.3 }),
    celos: E({ mx: 0.95, my: -0.25, iris: 0.9, sd: 6, si: 20, gd: -0.15, gi: 0.12, orig: 0, abre: 22, ancho: 0.7, sonr: -0.3, lengua: 0.3 }),
    ruego: E({ mx: 0.95, my: 0.15, iris: 1.18, sd: 22, si: 22, gd: 0.34, gi: 0.34, orig: 0, abre: 10, ancho: 0.85, sonr: -0.7 }),
    resigna: E({ mx: 0.5, my: 0.3, c: 0.55, sd: 12, si: 12, gd: 0.3, gi: 0.3, orig: 0, abre: 3, ancho: 0.7, sonr: -0.55, mof: 0.2 }),
    monton: E({ mx: -0.85, my: -0.1, c: 0.18, iris: 1.2, sd: 20, si: 20, gd: 0.36, gi: 0.36, orig: 0, abre: 4, ancho: 0.6, sonr: -0.9 })
  };
  const GUION_CG = [
    [T.oye, T.oye + 0.25, "oye"], [T.heroe0, T.heroe0 + 0.25, "heroe"], [T.heroe1 - 0.1, T.heroe1 + 0.1, "decidido"],
    [T.agarra, T.agarra + 0.25, "esfuerzo"], [T.llama0, T.llama0 + 0.3, "llama"], [T.bufa, T.bufa + 0.07, "respingo"],
    [T.gSalta0, T.gSalta0 + 0.15, "sigue"], [T.abajo, T.abajo + 0.15, "abajo"], [T.panico, T.panico + 0.15, "panico"],
    [T.espia, T.espia + 0.12, "espia"], [T.espia + 0.45, T.espia + 0.6, "panico"], [T.mMira - 0.05, T.mMira + 0.2, "esperanza"],
    [T.ayuda1, T.ayuda1 + 0.3, "mira"], [T.gBrazos1 - 0.1, T.gBrazos1 + 0.12, "celos"], [T.gCasco1, T.gCasco1 + 0.3, "ruego"],
    [T.desliza0, T.desliza0 + 0.3, "resigna"], [T.camara, T.camara + 0.35, "monton"]
  ];
  const PARP_G = [0.4, 1.4, 3.6, 8.9, 10.3, 12.4, 13.6];

  function poseG(t) {
    let e = especGSuelo(t);
    const w = suave(fase(t, T.salta, T.agarra));
    if (w > 0) {
      const ep = especGPoste(t);
      // salto: sube en arco hasta agarrarse
      e = mezclaP(e, ep, w);
      e.suelo -= 26 * campana(t, T.salta, T.agarra + 0.05);
      e.px += 12*Math.sin(Math.PI*fase(t,T.salta,T.agarra));
    }
    const wm = suave(fase(t, T.desliza1 - 0.02, T.cae1));
    if (wm > 0) e = mezclaP(e, especGMonton(t), wm);
    const p = construye(G, e);
    // rebote al caer sentado
    p.pelvis.y -= 22 * campana(t, T.cae1 - 0.04, T.cae1 + 0.2);
    // cara
    const ex = linea(GUION_CG, CG, "inicio", t);
    p.cara = cara(ex, parpadeo(t, PARP_G));
    // dientes que castañetean con el pánico
    const pan = tramo(t, T.panico, T.panico + 0.2) * (1 - tramo(t, T.mMira - 0.1, T.mMira + 0.1));
    p.cara.boca.abre += 4 * pan * (0.5 + 0.5 * Math.sin(t * 38));
    p.rojo = ex.rojo;
    p.sudor = 0.7 * tramo(t, T.agarra + 0.4, T.agarra + 0.8) * (1 - tramo(t, T.llama0, T.llama0 + 0.3)) + 1.0 * tramo(t, T.abajo + 0.1, T.panico + 0.3) * (1 - tramo(t, T.cae1, T.fin));
    return p;
  }

  /* ================= Marcos ================= */
  const MX = 800;                                              // donde se para
  const TOB_M = M.TOBILLO_ALTO * S * M.K;
  const XM0 = 1270;
  const PAS_ME = generaPasos(XM0, MX, T.mEntra0, T.mEntra1, 5, "cerca", 16, -16, XM0 + 16, XM0 - 16);
  const PAS_MS = generaPasos(MX + 5, 1420, T.mSale0, T.mSale1, 6, "lejos", -16, 16, MX + 5 - 16, MX + 5 + 16);
  // escalera: eje desde el pie hacia la cima
  const ESC_L = Math.hypot(ESC_P.cima.x - ESC_P.pie.x, ESC_P.cima.y - ESC_P.pie.y);
  const U = { x: (ESC_P.cima.x - ESC_P.pie.x) / ESC_L, y: (ESC_P.cima.y - ESC_P.pie.y) / ESC_L }, NRM = { x: -U.y, y: U.x };
  const enEsc = (d, lado = 0) => ({ x: ESC_P.pie.x + U.x * d + NRM.x * lado, y: ESC_P.pie.y + U.y * d + NRM.y * lado });
  const ANG_APOYADA = Math.atan2(U.y, U.x);

  // escalera en cada instante: centro, ángulo (del pie hacia la cima)
  function escalera(t, eM) {
    const apoyada = { c: enEsc(ESC_L / 2), a: ANG_APOYADA };
    // al hombro al entrar (en la mano lejana, por encima del hombro), en la mano al salir (horizontal, colgando)
    if (t < T.planta0) {
      const h = eM.manos.lejos;
      return { c: { x: h.x + 150, y: h.y + 4 }, a: Math.PI, mano: true };
    }
    if (t < T.planta1) {
      const h = especM(T.planta0 - 0.001).manos.lejos, ini = { c: { x: h.x + 150, y: h.y + 4 }, a: Math.PI };
      const k = suave(fase(t, T.planta0, T.planta1));
      // la punta sube y el pie baja hasta el suelo
      const c = mezcla(ini.c, apoyada.c, k); c.y -= 40 * Math.sin(Math.PI * k);
      return { c, a: lerp(ini.a, apoyada.a + 2 * Math.PI, suave5(k)) };
    }
    if (t < T.coge0) return apoyada;
    const h = aPant(M,eM,enTronco(M,eM,{x:130,y:715}));
    const llevada = { c: { x: h.x - 85, y: h.y + 6 }, a: Math.PI };
    if (t < T.coge1) {
      const k = suave(fase(t, T.coge0, T.coge1));
      const c = mezcla(apoyada.c, llevada.c, k); c.y -= 30 * Math.sin(Math.PI * k);
      return { c, a: lerp(apoyada.a + 2 * Math.PI, llevada.a, k) };
    }
    return llevada;
  }
  const extremos = ec => ({ pie: { x: ec.c.x - Math.cos(ec.a) * ESC_L / 2, y: ec.c.y - Math.sin(ec.a) * ESC_L / 2 }, cima: { x: ec.c.x + Math.cos(ec.a) * ESC_L / 2, y: ec.c.y + Math.sin(ec.a) * ESC_L / 2 } });

  // pies sobre un peldaño: el tobillo encima, con el peldaño hacia la mitad de la suela
  const MITAD = (M.TALON.x + 0.55 * (M.PUNTA.x - M.TALON.x)) * S * M.K;
  const sobrePeldano = (d, espejo = true) => { const q = enEsc(d); return { x: q.x + (espejo ? MITAD : -MITAD), y: q.y - TOB_M, ang: 0 }; };

  // pies al subir: [despega, apoya, d del peldaño]
  const SUBE_PIES = {
    lejos: [[8.70, 8.95, 70], [9.2, 9.45, 175]],
    cerca: [[8.95, 9.2, 140], [9.45, 9.7, 140]]
  };
  const SUBE_MANOS = {
    lejos: [[8.6, 8.72, 270], [8.85, 9.05, 340], [9.3, 9.5, 400]],
    cerca: [[8.62, 8.75, 235], [9.08, 9.28, 300], [9.52, 9.7, 365]]
  };
  function dEn(lista, t, d0) {           // d (peldaño) y levantamiento de una lista de pasos de escalera
    let d = d0, lev = 0;
    for (const [t0, t1, dd] of lista) { if (t < t0) break; const u = fase(t, t0, t1); lev = Math.sin(Math.PI * u); d = lerp(d, dd, suave5(u)); }
    return { d, lev };
  }

  function especM(t) {
    const espejo = t < TG_MID;
    const aterriza = 18 * campana(t, T.baja1 - 0.08, T.baja1 + 0.25);
    // andar hacia la farola y salir por la derecha
    let px;
    if (t < T.baja0) px = xAndar(XM0, MX, T.mEntra0, T.mEntra1, t);
    else px = xAndar(MX + 5, 1420, T.mSale0, T.mSale1, t);
    const andando = (t > T.mEntra0 && t < T.mEntra1 + 0.05) || t > T.mSale0;
    const ciclo = t < T.baja0 ? (T.mEntra1 - T.mEntra0) / 5 : (T.mSale1 - T.mSale0) / 6;
    const t0a = t < T.baja0 ? T.mEntra0 : T.mSale0;
    const bote = andando ? Math.abs(Math.sin((t - t0a) * Math.PI / ciclo)) : 0;
    let e = { px, suelo: SUELO, espejo, pel: -12 * bote, torso: 0.04 * (andando ? 1 : 0), cab: 0, pies: {}, manos: {} };
    const PAS = t < T.baja0 ? PAS_ME : PAS_MS;
    for (const lado of ["cerca", "lejos"]) {
      const f = pisada(PAS[lado], t, 28, -1);
      e.pies[lado] = { x: f.x, y: SUELO - TOB_M - (lado === "lejos" ? 10 * S : 0) - f.lev, ang: f.ang };
    }
    // manos: la lejana sujeta la escalera por encima del hombro; la cercana se balancea al andar
    const balanceo = andando ? Math.sin((t - t0a) * Math.PI / ciclo) : 0;
    const hl = aPant(M, e, enTronco(M, e, { x: 470, y: 250 })), hc = aPant(M, e, enTronco(M, e, { x: 114 + 30 * balanceo, y: 748 }));
    e.manos.lejos = { x: hl.x, y: hl.y, mu: 1.9, ang: 0, puno: 1, dobla: -1, dedos: D(0.35, 0.35, 0.35) };
    e.manos.cerca = { x: hc.x, y: hc.y, mu: -1.66, ang: 0.08, puno: 1, dobla: -1, dedos: D(0.55, 0.62, 0.52) };
    // se para y mira arriba
    e.cab = -0.22 * tramo(t, T.mMira, T.mMira + 0.3) * (1 - tramo(t, T.planta0 + 0.1, T.planta1));
    // planta la escalera
    if (t >= T.planta0 && t < T.sube0 + 0.2) {
      const k = suave(fase(t, T.planta0, T.planta1));
      const ec = escalera(t, e), ex = extremos(ec);
      const u=150*(1-k),v=4*(1-k),q={x:ec.c.x+Math.cos(ec.a)*u-Math.sin(ec.a)*v,y:ec.c.y+Math.sin(ec.a)*u+Math.cos(ec.a)*v};
      e.manos.lejos={...e.manos.lejos,x:q.x,y:q.y,mu:lerp(1.9,1.6,k),dobla:-1};
      e.torso = 0.08 * k; e.pel = 10 * campana(t, T.planta0, T.planta1);
    }
    // sube
    if (t >= T.sube0 - 0.15 && t < T.baja0) {
      const pl = dEn(SUBE_PIES.lejos, t, 0), pc = dEn(SUBE_PIES.cerca, t, 0);
      const k0 = suave(fase(t, T.sube0 - 0.15, T.sube0 + 0.1));
      const sube = { px: 0, suelo: 0, espejo: true, pel: 0, torso: 0.18, cab: -0.1, pies: {}, manos: {} };
      // cuerpo: la pelvis va paralela a la escalera, por el lado de fuera
      const dAvg = (pl.d + pc.d) / 2, dP = dAvg + 110;
      const pv = enEsc(dP);            // punto del eje (luego se aparta hacia fuera)
      const off = 30 + 6 * Math.sin((t - T.sube0) * 6);
      sube.px = pv.x + NRM.x * off; sube.suelo = pv.y + NRM.y * off + (M.SUELO - M.PELVIS.y) * S * M.K;
      // en el suelo antes de empezar
      const pieSuelo = (lado, d) => d < 1 ? e.pies[lado] : sobrePeldano(d);
      const fl = pieSuelo("lejos", pl.d), fc = pieSuelo("cerca", pc.d);
      sube.pies.lejos = { x: fl.x, y: fl.y - 30 * pl.lev, ang: 0 }; sube.pies.cerca = { x: fc.x, y: fc.y - 30 * pc.lev, ang: 0 };
      const ml = dEn(SUBE_MANOS.lejos, t, 270), mc = dEn(SUBE_MANOS.cerca, t, 235);
      const ql = enEsc(ml.d), qc = enEsc(mc.d);
      sube.manos.lejos = { x: ql.x + 6 - 10*Math.sin(Math.PI*fase(t,9.3,9.5)), y: ql.y - 12 * ml.lev, mu: 2.0, ang: 0, puno: 1, dobla: -1, dedos: D(0.3, 0.35, 0.35) };
      sube.manos.cerca = { x: qc.x + 8, y: qc.y - 12 * mc.lev, mu: 2.1, ang: 0, puno: 1, dobla: -1, dedos: D(0.3, 0.35, 0.35) };
      let s = sube;
      // coge al gato en brazos y luego lo deja subir al casco
      const brazos = tramo(t, T.gBrazos0 - 0.05, T.gBrazos1) * (1 - tramo(t, T.gCasco0, T.gCasco1 - 0.1));
      if (brazos > 0.001) {
        const ch = aPant(M, s, enTronco(M, s, { x: 330, y: 500 }));
        const brz = { lejos: { x: ch.x - 26, y: ch.y + 8, mu: 2.4, ang: -0.3, puno: 1, dobla: -1, dedos: D(0.6, 0.7, 0.65) },
          cerca: { x: ch.x + 4, y: ch.y + 18, mu: 2.8, ang: -0.6, puno: 1, dobla: -1, dedos: D(0.6, 0.7, 0.65) } };
        s = mezclaP(s, Object.assign({}, s, { torso: 0.08, cab: 0.12, manos: brz }), brazos);
      }
      e = mezclaP(e, s, k0);
    }
    // baja deslizándose por la escalera
    if (t >= T.baja0 - 0.05 && t < TG_MID) {
      const k = suave(fase(t, T.baja0, T.baja1)), kk = entrada(fase(t, T.baja0, T.baja1));
      const arriba = especM(T.baja0 - 0.06);
      const abajo = { px: MX + 5, suelo: SUELO, espejo: true, pel: aterriza, torso: 0.05, cab: 0, pies: {
          cerca: { x: MX + 5 + 16, y: SUELO - TOB_M, ang: 0 }, lejos: { x: MX + 5 - 16, y: SUELO - TOB_M - 10 * S, ang: 0 } }, manos: {} };
      const qa = enEsc(200), qb = aPant(M,abajo,enTronco(M,abajo,{x:114,y:748}));
      abajo.manos.lejos = { x: qa.x + 4, y: qa.y, mu: 2.0, ang: 0, puno: 1, dobla: -1, dedos: D(0.3, 0.35, 0.35) };
      abajo.manos.cerca = { x: qb.x, y: qb.y, mu: -1.66, ang: 0.08, puno: 1, dobla: -1, dedos: D(0.55, 0.62, 0.52) };
      e = mezclaP(arriba, abajo, lerp(k, kk, 0.5));
      // suelta la escalera al girarse
      const suelta = suave(fase(t, T.baja1 - 0.06, T.gira0 + 0.1));
      if (suelta > 0) {
        const r1 = aPant(M, e, enTronco(M, e, { x: 114, y: 748 })), r2 = aPant(M, e, enTronco(M, e, { x: 420, y: 706 }));
        e.manos.cerca = mezclaP(e.manos.cerca, { x: r1.x, y: r1.y, mu: -1.66, ang: 0.08, puno: 1, dobla: -1, dedos: D(0.55, 0.62, 0.52) }, suelta);
        e.manos.lejos = mezclaP(e.manos.lejos, { x: r2.x, y: r2.y, mu: -1.75, ang: 0, puno: 0, dobla: -1, dedos: D(0.3, 0.3, 0.3) }, suelta);
      }
    }
    // girado (mira a la derecha): coge la escalera con la mano cercana y se va con ella colgando
    if (t >= TG_MID) {
      e.pel += aterriza;
      const k = suave(fase(t, T.coge0, T.coge0 + 0.25));
      const h = aPant(M, e, enTronco(M, e, { x: 130, y: 715 }));
      e.manos.cerca = { x: lerp(h.x, h.x, k), y: h.y, mu: lerp(-1.66, -1.75, k), ang: 0, puno: 1, dobla: -1, dedos: D(0.35, 0.35, 0.35) };
      const r2 = aPant(M, e, enTronco(M, e, { x: 420 + 25 * Math.sin((t - T.mSale0) * Math.PI / ((T.mSale1 - T.mSale0) / 6)), y: 720 }));
      e.manos.lejos = { x: r2.x, y: r2.y, mu: -1.6, ang: -0.05, puno: 1, dobla: -1, dedos: D(0.55, 0.62, 0.52) };
      e.cab = -0.05 + 0.04 * Math.sin(t * 3);
      const ec=escalera(t,e),carry=suave(fase(t,T.coge0,T.coge1)),u=lerp(-50,-85,carry),v=6,grip={x:ec.c.x+Math.cos(ec.a)*u-Math.sin(ec.a)*v,y:ec.c.y+Math.sin(ec.a)*u+Math.cos(ec.a)*v};
      const reach=suave(fase(t,TG_MID,T.coge0));e.manos.cerca.x=lerp(e.manos.cerca.x,grip.x,reach);e.manos.cerca.y=lerp(e.manos.cerca.y,grip.y,reach);
    }
    return e;
  }

  const CM = {
    inicio: E({ mx: 0.85 }),
    camina: E({ mx: 0.85, my: -0.05, orig: 0, sonr: 0.35, ancho: 0.9, sd: 4, si: 4 }),
    mira: E({ mx: 0.7, my: -0.85, sd: 18, si: 4, gd: 0.12, gi: -0.04, orig: 0, sonr: 0.45, ancho: 0.85 }),
    ojea: E({ mx: 0.95, my: -0.5, sd: 14, si: 8, gd: 0.1, orig: 0, sonr: 0.5, ancho: 0.85 }),
    sube: E({ mx: 0.6, my: -0.7, sd: 6, si: 6, orig: 0, sonr: 0.3, ancho: 0.9 }),
    tierno: E({ mx: 0.6, my: 0.2, c: 0.92, h: 1, sd: 12, si: 12, gd: 0.1, gi: 0.1, orig: 0, sonr: 0.85, abre: 5, ancho: 1.0, rub: 0.4 }),
    contento: E({ mx: 0.8, my: -0.3, sd: 8, si: 8, orig: 0, sonr: 0.7, ancho: 0.95 }),
    camara: E({ mx: -0.85, my: -0.05, wd: 1, h: 0.8, sd: 6, si: 14, gi: 0.1, orig: 0, sonr: 0.8, ancho: 0.95 })
  };
  const GUION_CM = [
    [T.mEntra0, T.mEntra0 + 0.3, "camina"], [T.mMira, T.mMira + 0.25, "mira"], [T.ayuda0 + 0.1, T.ayuda0 + 0.3, "ojea"],
    [T.planta1, T.planta1 + 0.2, "sube"], [T.gBrazos1 - 0.05, T.gBrazos1 + 0.2, "tierno"], [T.gCasco1, T.gCasco1 + 0.2, "contento"],
    [T.mSale0 + 0.4, T.mSale0 + 0.65, "camara"], [T.mSale0 + 1.0, T.mSale0 + 1.2, "contento"]
  ];
  const PARP_M = [7.0, 8.3, 10.7, 12.9];
  function poseM(t) {
    const e = especM(t);
    const p = construye(M, e);
    p.cara = cara(linea(GUION_CM, CM, "inicio", t), parpadeo(t, PARP_M));
    return p;
  }
  // giro: se aplasta en horizontal y cambia de lado (de mirar a la izquierda a mirar a la derecha)
  const TG_MID = (T.gira0 + T.gira1) / 2;
  const giroX = t => { const u = fase(t, T.gira0, T.gira1); return Math.abs(Math.cos(Math.PI * suave(u))); };

  /* ---------- gato ---------- */
  const NAR = "#f29a3a", NAR_O = "#c8661c", BLANCO = "#fff6ea", TINTA = "#0b0a0e";
  // Gato de dibujos: (x, y) entre sus patas; o: dir, estira (salto), echado (ovillo), arquea, erizo, boca, feliz, cola, orejas, mx/my
  function gato(g, x, y, esc, o, t) {
    const dir = o.dir ?? 1, es = clamp(o.estira || 0), ec = clamp(o.echado || 0), ar = clamp(o.arquea || 0), er = clamp(o.erizo || 0);
    const L3 = (a, b, c) => lerp(lerp(a, b, es), c, ec);
    const cuerpo = { x: L3(-2, 0, 0), y: L3(-17, -16, -11) - 4 * ar, rx: L3(14, 24, 19), ry: L3(15, 9, 10.5) + 2 * ar };
    const cab = { x: L3(9, 26, 15), y: L3(-37, -22, -21) - 3 * ar, r: 12 };
    g.save(); g.translate(x, y); g.scale(esc * dir, esc); g.rotate(o.rot || 0);
    g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = TINTA;
    // cola (por detrás)
    const cw = 4.2 + 3 * er, ca = (o.cola || 0);
    const c0 = { x: cuerpo.x - cuerpo.rx * 0.85, y: cuerpo.y + cuerpo.ry * 0.3 };
    const c1 = { x: c0.x - L3(12, 16, 12) + 6 * Math.sin(ca), y: c0.y - L3(10, 2, 2) - 8 * Math.cos(ca) * (1 - es) };
    const c2 = { x: c0.x - L3(10, 30, 16) + 14 * Math.sin(ca * 1.3), y: c0.y - L3(30, 4, 18) - 10 * Math.cos(ca * 1.3) * (1 - es) + 6 * es };
    g.beginPath(); g.moveTo(c0.x, c0.y); g.quadraticCurveTo(c1.x, c1.y, c2.x, c2.y);
    g.lineWidth = cw * 2 + 3.6; g.stroke(); g.strokeStyle = NAR; g.lineWidth = cw * 2; g.stroke();
    g.strokeStyle = NAR_O; g.lineWidth = 2.2; g.beginPath(); g.moveTo(lerp(c1.x, c2.x, 0.5) - 3, lerp(c1.y, c2.y, 0.5) - 2); g.lineTo(lerp(c1.x, c2.x, 0.5) + 3, lerp(c1.y, c2.y, 0.5) + 2); g.stroke();
    g.strokeStyle = TINTA;
    // patas traseras
    const pata = (x0, y0, x1, y1, w) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.lineWidth = w + 3.6; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = w; g.strokeStyle = NAR; g.stroke(); };
    if (ec < 0.95) {
      g.globalAlpha = 1 - ec;
      pata(cuerpo.x - L3(8, 14, 8), cuerpo.y + L3(8, 4, 6), cuerpo.x - L3(9, 28, 9), L3(-2, -10, -4), 7);
      g.globalAlpha = 1;
    }
    // cuerpo
    g.beginPath(); g.ellipse(cuerpo.x, cuerpo.y, cuerpo.rx, cuerpo.ry, L3(0, -0.06, 0), 0, Math.PI * 2);
    g.fillStyle = NAR; g.fill(); g.lineWidth = 3; g.stroke();
    // pelo erizado en el lomo
    if (er > 0.02) {
      g.beginPath();
      for (let i = 0; i <= 9; i++) { const a = Math.PI * (1.08 + 0.84 * i / 9), r = i % 2 ? 1 : 1 + 0.35 * er;
        const qx = cuerpo.x + Math.cos(a) * cuerpo.rx * r, qy = cuerpo.y + Math.sin(a) * cuerpo.ry * r; if (i) g.lineTo(qx, qy); else g.moveTo(qx, qy); }
      g.fillStyle = NAR; g.fill(); g.lineWidth = 2.2; g.stroke();
    }
    // rayas y barriga
    g.save(); g.beginPath(); g.ellipse(cuerpo.x, cuerpo.y, cuerpo.rx, cuerpo.ry, 0, 0, Math.PI * 2); g.clip();
    g.fillStyle = BLANCO; g.beginPath(); g.ellipse(cuerpo.x + cuerpo.rx * 0.45, cuerpo.y + cuerpo.ry * 0.55, cuerpo.rx * 0.55, cuerpo.ry * 0.55, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = NAR_O; g.lineWidth = 2.6;
    for (let i = 0; i < 3; i++) { const sx = cuerpo.x - cuerpo.rx * 0.5 + i * cuerpo.rx * 0.4; g.beginPath(); g.moveTo(sx, cuerpo.y - cuerpo.ry); g.quadraticCurveTo(sx + 3, cuerpo.y - cuerpo.ry * 0.4, sx - 1, cuerpo.y - cuerpo.ry * 0.1); g.stroke(); }
    g.restore();
    // patas delanteras
    if (ec < 0.95) {
      g.globalAlpha = 1 - ec;
      pata(cuerpo.x + L3(7, 16, 7), cuerpo.y + L3(4, 2, 4), cuerpo.x + L3(7, 32, 7) , L3(-1, -12, -2), 6);
      pata(cuerpo.x + L3(12, 18, 12), cuerpo.y + L3(5, 3, 5), cuerpo.x + L3(13, 28, 13), L3(-1, -16, -2), 6);
      g.globalAlpha = 1;
    } else {
      // patitas recogidas delante
      g.fillStyle = BLANCO; for (const dx of [8, 15]) { g.beginPath(); g.ellipse(cuerpo.x + dx, cuerpo.y + cuerpo.ry - 1.5, 4, 2.6, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.8; g.stroke(); }
    }
    // cabeza
    const orejas = clamp(o.orejas || 0);
    for (const sx of [-1, 1]) {
      const bx = cab.x + sx * 6.5, by = cab.y - 8, ang = sx * (0.25 + 0.9 * orejas);
      g.save(); g.translate(bx, by); g.rotate(ang);
      g.beginPath(); g.moveTo(-5, 2); g.lineTo(0, -10 + 3 * orejas); g.lineTo(5, 2); g.closePath(); g.fillStyle = NAR; g.fill(); g.lineWidth = 2.6; g.stroke();
      g.beginPath(); g.moveTo(-2.4, 0.5); g.lineTo(0, -5.5 + 2 * orejas); g.lineTo(2.4, 0.5); g.closePath(); g.fillStyle = "#f7b7a8"; g.fill();
      g.restore();
    }
    g.beginPath(); g.ellipse(cab.x, cab.y, cab.r * 1.08, cab.r, 0, 0, Math.PI * 2); g.fillStyle = NAR; g.fill(); g.lineWidth = 3; g.stroke();
    g.strokeStyle = NAR_O; g.lineWidth = 2.2;
    for (const dx of [-3, 1, 5]) { g.beginPath(); g.moveTo(cab.x + dx, cab.y - cab.r + 1); g.lineTo(cab.x + dx * 0.8, cab.y - cab.r + 5); g.stroke(); }
    // hocico
    g.fillStyle = BLANCO; g.beginPath(); g.ellipse(cab.x + 4, cab.y + 5, 7.5, 5, 0, 0, Math.PI * 2); g.fill();
    // ojos
    const fe = clamp(o.feliz || 0), mx = o.mx ?? 0.4, my = o.my ?? 0, sz = 1 + 0.25 * clamp(o.susto || 0);
    for (const [ox, k] of [[0, 1], [9, 0.85]]) {
      const ex = cab.x + ox - 1, ey = cab.y - 2;
      if (fe < 0.5) {
        g.beginPath(); g.ellipse(ex, ey, 3.6 * k * sz, 4.6 * sz, 0, 0, Math.PI * 2); g.fillStyle = "#fffbe6"; g.fill(); g.lineWidth = 1.6; g.strokeStyle = TINTA; g.stroke();
        const pr = clamp(o.susto || 0) > 0.5 ? 1.2 : 2.4;
        g.fillStyle = "#1a1a10"; g.beginPath(); g.ellipse(ex + mx * 1.6, ey + my * 1.8, pr * k, pr * 1.5, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#ffffff"; g.beginPath(); g.arc(ex + mx * 1.6 - 0.8, ey + my * 1.8 - 1.2, 0.8, 0, Math.PI * 2); g.fill();
      } else {
        g.strokeStyle = TINTA; g.lineWidth = 1.8; g.beginPath(); g.moveTo(ex - 3.4 * k, ey + 1); g.quadraticCurveTo(ex, ey - 3, ex + 3.4 * k, ey + 1); g.stroke();
      }
    }
    // nariz, boca y bigotes
    g.fillStyle = "#e86a7a"; g.beginPath(); g.moveTo(cab.x + 6.5, cab.y + 2.5); g.lineTo(cab.x + 10.5, cab.y + 2.5); g.lineTo(cab.x + 8.5, cab.y + 5); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.4;
    const bo = clamp(o.boca || 0);
    if (bo > 0.05) {
      g.fillStyle = "#6b1620"; g.beginPath(); g.ellipse(cab.x + 8.5, cab.y + 8 + 2 * bo, 3.5 + bo, 1 + 3.4 * bo, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      if (bo > 0.5) { g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(cab.x + 6.2, cab.y + 6.4); g.lineTo(cab.x + 7, cab.y + 9); g.lineTo(cab.x + 7.8, cab.y + 6.4); g.fill();
        g.beginPath(); g.moveTo(cab.x + 9.2, cab.y + 6.4); g.lineTo(cab.x + 10, cab.y + 9); g.lineTo(cab.x + 10.8, cab.y + 6.4); g.fill(); }
    } else {
      g.beginPath(); g.moveTo(cab.x + 8.5, cab.y + 5); g.lineTo(cab.x + 8.5, cab.y + 6.5); g.moveTo(cab.x + 6, cab.y + 7); g.quadraticCurveTo(cab.x + 7.2, cab.y + 8, cab.x + 8.5, cab.y + 6.5);
      g.quadraticCurveTo(cab.x + 9.8, cab.y + 8, cab.x + 11, cab.y + 7); g.stroke();
    }
    g.lineWidth = 1; g.strokeStyle = "rgba(20,15,10,0.8)";
    for (const dy of [-1, 1.5, 4]) { g.beginPath(); g.moveTo(cab.x + 12, cab.y + 5 + dy * 0.5); g.lineTo(cab.x + 22, cab.y + 3 + dy * 1.4); g.stroke();
      g.beginPath(); g.moveTo(cab.x - 2, cab.y + 5 + dy * 0.5); g.lineTo(cab.x - 11, cab.y + 3 + dy * 1.4); g.stroke(); }
    g.restore();
  }

  // dónde está el gato y qué hace
  const CASCO = { x: 800, y: 216 };          // punto alto del casco de Marcos (retrato)
  const ESC_GATO = 1.0;
  const sobreTapa = { x: PX + 2, y: CAP - 2 };
  function farolAng(t) {             // el farol se balancea al saltar el gato encima y al irse
    let a = 0;
    if (t > T.gSalta1) a += 0.22 * Math.exp(-(t - T.gSalta1) * 1.8) * Math.sin((t - T.gSalta1) * 7.5);
    if (t > T.gBrazos0 + 0.05) a += -0.16 * Math.exp(-(t - T.gBrazos0 - 0.05) * 1.8) * Math.sin((t - T.gBrazos0 - 0.05) * 7.5);
    return a;
  }
  const rotA = (q, c, a) => { const x = q.x - c.x, y = q.y - c.y; return { x: c.x + x * Math.cos(a) - y * Math.sin(a), y: c.y + x * Math.sin(a) + y * Math.cos(a) }; };
  const sobreFarol = t => rotA({ x: GANCHO.x, y: GANCHO.y + 2 }, { x: GANCHO.x, y: GANCHO.y - 6 }, farolAng(t));
  const arco = (a, b, k, h) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) - h * Math.sin(Math.PI * k) });

  function estadoGato(t, pM) {
    const meo = T.maulla.reduce((m, tm) => Math.max(m, campana(t, tm, tm + 0.35)), 0);
    const temblor = 0.6 * ruido(t * 30);
    const asust = { dir: 1, arquea: 0.7, erizo: 0.55, orejas: 0.7, susto: 1, boca: meo * 0.8, cola: 0.6 + 0.3 * Math.sin(t * 9), mx: -0.3, my: 0.9, rot: 0 };
    if (t < T.gSalta0) {
      const bufa = campana(t, T.bufa - 0.05, T.gSalta0 + 0.05);
      const o = Object.assign({}, asust, { erizo: lerp(0.55, 1, bufa), arquea: lerp(0.7, 1, bufa), boca: Math.max(asust.boca, bufa), orejas: lerp(0.7, 1, bufa), my: lerp(0.9, 0.7, tramo(t, 1.0, 1.4)) });
      return { x: sobreTapa.x + temblor * 0.5, y: sobreTapa.y, o };
    }
    if (t < T.gSalta1) {
      const k = fase(t, T.gSalta0, T.gSalta1);
      const q = arco(sobreTapa, sobreFarol(t), suave(k), 42);
      return { x: q.x, y: q.y, o: { dir: 1, estira: Math.sin(Math.PI * Math.min(1, k * 1.15)), erizo: 0.4, orejas: 0.5, susto: 1, cola: 0, mx: 0.8, my: 0.3, rot: -.4*Math.sin(Math.PI*k)+farolAng(t)*k } };
    }
    const enFarol = sobreFarol(t);
    if (t < T.gBrazos0) {
      const curioso = tramo(t, T.planta1, T.sube0 + 0.3);
      const meo2 = campana(t, 8.95, 9.3);
      return { x: enFarol.x, y: enFarol.y, o: { dir: 1, arquea: lerp(0.4, 0.1, curioso), erizo: lerp(0.35, 0, curioso), orejas: lerp(0.5, 0, curioso), susto: lerp(1, 0, curioso),
        boca: meo2 * 0.6, cola: 0.8 * Math.sin(t * 3), mx: lerp(-0.6, 0.9, curioso), my: lerp(0.8, 0.4, curioso), rot: farolAng(t) } };
    }
    // en brazos de Marcos: delante del pecho
    const pecho = M.aPantalla(pM, M.tronco(pM)({ x: 330, y: 470 }));
    const brazos = { x: pecho.x - 4, y: pecho.y + 26 };
    if (t < T.gBrazos1) {
      const k = fase(t, T.gBrazos0, T.gBrazos1);
      const q = arco(enFarol, brazos, suave(k), 30);
      return { x: q.x, y: q.y, o: { dir: 1, estira: Math.sin(Math.PI * k), echado: suave(k), feliz: suave(k), cola: 0, mx: 0.5, my: 0.5, rot: lerp(farolAng(T.gBrazos0), -0.1, k) } };
    }
    // en el casco
    const H = M.cabeza(pM), casco = M.aPantalla(pM, H.a(CASCO));
    const dirM = pM.espejo ? -1 : 1;
    const rotC = (pM.espejo ? -1 : 1) * pM.cabeza.ang * 0.8 + (pM.espejo ? 0.18 : -0.18);
    if (t < T.gCasco0) return { x: brazos.x, y: brazos.y, o: { dir: Math.cos(Math.PI*tramo(t,T.gBrazos1,T.gBrazos1+.16)), echado: 1, feliz: 1, cola: 0.5 * Math.sin(t * 5), rot: -0.1 } };
    if (t < T.gCasco1) {
      const k = fase(t, T.gCasco0, T.gCasco1);
      const q = arco(brazos, casco, suave(k), 34);
      return { x: q.x, y: q.y, o: { dir: lerp(-1, dirM, suave(k)) >= 0 ? 1 : -1, estira: Math.sin(Math.PI * k) * 0.7, echado: 1 - Math.sin(Math.PI * k), feliz: 1 - Math.sin(Math.PI * k), cola: 0, rot: lerp(-0.1, rotC, k) } };
    }
    return { x: casco.x, y: casco.y, o: { dir: dirM, echado: 1, feliz: 1, cola: 0.9 * Math.sin(t * 4.2), rot: rotC, mx: -0.9 } };
  }

  /* ---------- farola, farol, escalera ---------- */
  function farola(g, t) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = TINTA;
    const verde = "#1f4a40", verdeO = "#123129", verdeL = "#3f7d6c";
    // brazo con voluta hacia el farol
    g.lineWidth = 10; g.beginPath(); g.moveTo(PX, CAP + 30); g.bezierCurveTo(PX + 60, CAP + 14, GANCHO.x - 50, GANCHO.y - 18, GANCHO.x, GANCHO.y - 8); g.stroke();
    g.strokeStyle = verde; g.lineWidth = 5; g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 6; g.beginPath(); g.moveTo(PX + 4, CAP + 52); g.bezierCurveTo(PX + 30, CAP + 48, PX + 60, CAP + 32, PX + 84, CAP + 24); g.stroke();
    g.strokeStyle = verde; g.lineWidth = 2.5; g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 4; g.beginPath(); g.arc(PX + 34, CAP + 44, 9, 0.2, Math.PI * 1.7); g.stroke();
    // columna
    const col = g.createLinearGradient(PX - 9, 0, PX + 9, 0); col.addColorStop(0, verdeO); col.addColorStop(0.35, verdeL); col.addColorStop(0.6, verde); col.addColorStop(1, verdeO);
    g.fillStyle = col; g.beginPath(); g.moveTo(PX - 7, CAP + 16); g.lineTo(PX + 7, CAP + 16); g.lineTo(PX + 9, SUELO - 50); g.lineTo(PX - 9, SUELO - 50); g.closePath(); g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.25)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(PX - 3, CAP + 22); g.lineTo(PX - 4, SUELO - 54); g.stroke();
    // anillos
    g.strokeStyle = TINTA;
    for (const [y, w] of [[CAP + 62, 12], [320, 13], [SUELO - 70, 14]]) { g.fillStyle = verde; g.beginPath(); g.roundRect ? g.roundRect(PX - w, y - 5, 2 * w, 10, 3) : g.rect(PX - w, y - 5, 2 * w, 10); g.fill(); g.lineWidth = 2.5; g.stroke(); }
    // base acampanada
    g.fillStyle = verde; g.beginPath(); g.moveTo(PX - 10, SUELO - 52); g.quadraticCurveTo(PX - 14, SUELO - 20, PX - 30, SUELO - 6); g.lineTo(PX - 32, SUELO + 2); g.lineTo(PX + 32, SUELO + 2); g.lineTo(PX + 30, SUELO - 6); g.quadraticCurveTo(PX + 14, SUELO - 20, PX + 10, SUELO - 52); g.closePath(); g.fill(); g.lineWidth = 3; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.18)"; g.beginPath(); g.moveTo(PX - 6, SUELO - 48); g.quadraticCurveTo(PX - 10, SUELO - 20, PX - 24, SUELO - 6); g.lineTo(PX - 18, SUELO - 6); g.quadraticCurveTo(PX - 6, SUELO - 22, PX - 3, SUELO - 48); g.fill();
    // tapa de arriba con remate
    g.fillStyle = verde; g.beginPath(); g.moveTo(PX - 13, CAP + 18); g.lineTo(PX + 13, CAP + 18); g.lineTo(PX + 9, CAP + 6); g.lineTo(PX - 9, CAP + 6); g.closePath(); g.fill(); g.lineWidth = 2.5; g.stroke();
    g.beginPath(); g.ellipse(PX, CAP + 3, 11, 4, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
  }
  function farol(g, t) {
    const a = farolAng(t), c = { x: GANCHO.x, y: GANCHO.y - 6 };
    g.save(); g.translate(c.x, c.y); g.rotate(a); g.lineJoin = "round"; g.strokeStyle = TINTA;
    // cadena corta y tejadillo
    g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 8); g.stroke();
    g.fillStyle = "#1a3a33"; g.beginPath(); g.moveTo(-20, 22); g.lineTo(0, 6); g.lineTo(20, 22); g.closePath(); g.fill(); g.lineWidth = 2.5; g.stroke();
    // cristal con luz
    const enc = 0.85 + 0.15 * Math.sin(t * 13) * 0.2;
    const gl = g.createLinearGradient(0, 22, 0, 62); gl.addColorStop(0, `rgba(255,236,170,${enc})`); gl.addColorStop(1, `rgba(255,190,90,${enc})`);
    g.fillStyle = gl; g.beginPath(); g.moveTo(-15, 22); g.lineTo(15, 22); g.lineTo(11, 60); g.lineTo(-11, 60); g.closePath(); g.fill(); g.lineWidth = 2.2; g.stroke();
    g.strokeStyle = "#1a3a33"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 22); g.lineTo(0, 60); g.stroke();
    g.fillStyle = "#fff8dc"; g.beginPath(); g.ellipse(0, 42, 4, 7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#1a3a33"; g.strokeStyle = TINTA; g.beginPath(); g.moveTo(-13, 60); g.lineTo(13, 60); g.lineTo(4, 70); g.lineTo(-4, 70); g.closePath(); g.fill(); g.lineWidth = 2.2; g.stroke();
    g.restore();
  }
  function luzFarol(g, t) {
    const a = farolAng(t), c = rotA({ x: GANCHO.x, y: GANCHO.y + 36 }, { x: GANCHO.x, y: GANCHO.y - 6 }, a);
    g.save(); g.globalCompositeOperation = "lighter";
    const halo = g.createRadialGradient(c.x, c.y, 4, c.x, c.y, 90); halo.addColorStop(0, "rgba(255,210,120,0.45)"); halo.addColorStop(1, "rgba(255,190,90,0)");
    g.fillStyle = halo; g.beginPath(); g.arc(c.x, c.y, 90, 0, Math.PI * 2); g.fill();
    const cono = g.createLinearGradient(0, c.y, 0, SUELO + 10); cono.addColorStop(0, "rgba(255,210,130,0.20)"); cono.addColorStop(1, "rgba(255,200,120,0.05)");
    g.fillStyle = cono; g.beginPath(); g.moveTo(c.x - 12, c.y + 20); g.lineTo(c.x + 12, c.y + 20); g.lineTo(c.x + 150 + 300 * a, SUELO + 6); g.lineTo(c.x - 150 + 300 * a, SUELO + 6); g.closePath(); g.fill();
    g.restore();
  }
  function dibEscalera(g, ec) {
    const { pie, cima } = extremos(ec);
    const ux = (cima.x - pie.x) / ESC_L, uy = (cima.y - pie.y) / ESC_L, nx = -uy, ny = ux, W2 = 11;
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    // peldaños
    for (let d = 35; d < ESC_L - 8; d += 35) {
      const a = { x: pie.x + ux * d + nx * W2, y: pie.y + uy * d + ny * W2 }, b = { x: pie.x + ux * d - nx * W2, y: pie.y + uy * d - ny * W2 };
      g.strokeStyle = TINTA; g.lineWidth = 6.5; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
      g.strokeStyle = "#b9bec6"; g.lineWidth = 3.2; g.stroke();
    }
    // largueros rojos
    for (const s of [1, -1]) {
      const a = { x: pie.x + nx * W2 * s, y: pie.y + ny * W2 * s }, b = { x: cima.x + nx * W2 * s, y: cima.y + ny * W2 * s };
      g.strokeStyle = TINTA; g.lineWidth = 8.5; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
      g.strokeStyle = s > 0 ? "#c21f2b" : "#a3161f"; g.lineWidth = 5; g.stroke();
      g.strokeStyle = "rgba(255,180,180,0.55)"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(a.x - nx, a.y - ny); g.lineTo(b.x - nx, b.y - ny); g.stroke();
    }
    // tacos de goma en el pie
    g.fillStyle = "#1b1a20";
    for (const s of [1, -1]) { g.beginPath(); g.arc(pie.x + nx * W2 * s, pie.y + ny * W2 * s, 4, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }

  /* ---------- efectos ---------- */
  function ondasSonido(g, x, y, k, dir) {     // maullido: arcos que salen de la boca
    if (k <= 0.02) return;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.85 * k})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const r = 8 + i * 7 + 6 * (1 - k); g.beginPath(); g.arc(x, y, r, dir > 0 ? -0.6 : Math.PI - 0.6, dir > 0 ? 0.6 : Math.PI + 0.6); g.stroke(); }
    g.restore();
  }
  function bufido(g, x, y, k) {
    if (k <= 0.02) return;
    g.save(); g.strokeStyle = `rgba(255,255,255,${k})`; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.42, r0 = 16 + 6 * (1 - k), r1 = r0 + 10;
      g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  function temblorLineas(g, pG, k, t) {          // rayitas de temblor a los lados de Guillermo
    if (k <= 0.02) return;
    const c = G.aPantalla(pG, G.centroCabeza(pG));
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.7 * k})`; g.lineWidth = 2; g.lineCap = "round";
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      const x = c.x + s * (58 + 3 * Math.sin(t * 40 + i)), y = c.y + 10 + i * 14;
      g.beginPath(); g.moveTo(x, y - 5); g.lineTo(x + s * 4, y); g.lineTo(x, y + 5); g.stroke();
    }
    g.restore();
  }
  function chirridos(g, t, pG) {                   // al resbalar: rayitas y chispitas en las manos
    const k = campana(t, T.desliza0, T.desliza1 + 0.05); if (k <= 0.02) return;
    g.save(); g.lineCap = "round";
    for (const m of [pG.manoCerca, pG.manoLejos]) {
      const q = G.aPantalla(pG, m);
      for (let i = 0; i < 3; i++) {
        const ph = (t * 5 + i / 3 + hash(i + (m === pG.manoCerca ? 0 : 5))) % 1;
        g.globalAlpha = k * (1 - ph); g.strokeStyle = "#ffffff"; g.lineWidth = 2;
        const x = q.x + 12 + 8 * ph, y = q.y - 6 - 20 * ph + i * 4;
        g.beginPath(); g.arc(x, y, 5 + 4 * ph, -0.9, 0.9); g.stroke();
      }
    }
    g.restore();
  }
  function ronroneo(g, t, gt) {                    // corazoncitos y vibración del gato en el casco
    const k = tramo(t, T.gCasco1, T.gCasco1 + 0.3); if (k <= 0.02) return;
    g.save();
    for (let i = 0; i < 3; i++) {
      const ph = ((t - T.gCasco1) * 0.7 + i / 3) % 1;
      const x = gt.x + 10 * Math.sin(ph * 6 + i) + (i - 1) * 12, y = gt.y - 40 - ph * 55;
      g.globalAlpha = k * Math.sin(Math.PI * ph) * 0.95;
      corazon(g, x, y, 5 + 2 * ph, i % 2 ? "#ff6b8b" : "#ff9fb4");
    }
    g.globalAlpha = 0.7 * k; g.strokeStyle = "#ffffff"; g.lineWidth = 1.8; g.lineCap = "round";
    for (const s of [-1, 1]) { const x = gt.x + s * 26, y = gt.y - 16 + Math.sin(t * 30) * 1.5;
      g.beginPath(); g.moveTo(x, y - 6); g.quadraticCurveTo(x + s * 4, y - 3, x, y); g.quadraticCurveTo(x - s * 4, y + 3, x, y + 6); g.stroke(); }
    g.restore();
  }
  function corazon(g, x, y, r, col) {
    g.save(); g.translate(x, y); g.fillStyle = col; g.strokeStyle = TINTA; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(0, r * 0.9); g.bezierCurveTo(-r * 1.6, -r * 0.2, -r * 0.6, -r * 1.4, 0, -r * 0.45); g.bezierCurveTo(r * 0.6, -r * 1.4, r * 1.6, -r * 0.2, 0, r * 0.9); g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  function rayasBajada(g, t, pM) {                 // Marcos baja deslizándose: rayas de velocidad
    const k = campana(t, T.baja0, T.baja1); if (k <= 0.02) return;
    const c = M.aPantalla(pM, M.centroCabeza(pM));
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.75 * k})`; g.lineWidth = 2.5; g.lineCap = "round";
    for (let i = 0; i < 4; i++) { const x = c.x + 40 + i * 9, y = c.y - 50 - i * 10; g.beginPath(); g.moveTo(x, y); g.lineTo(x - U.x * 40, y - U.y * 40); g.stroke(); }
    g.restore();
  }
  function polvo(g, t, x) {
    const k = fase(t, T.cae1 - 0.05, T.cae1 + 0.8); if (k <= 0 || k >= 1) return;
    g.save();
    for (let i = 0; i < 7; i++) { const s = i % 2 ? 1 : -1, d = (18 + 60 * salida(k)) * (0.6 + hash(i + 40) * 0.6);
      g.globalAlpha = 0.45 * (1 - k); g.fillStyle = "#9aa3b0";
      g.beginPath(); g.ellipse(x + s * d, SUELO - 6 - 14 * k * hash(i + 41), 9 + 14 * k, 5 + 6 * k, 0, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }

  /* ---------- decorado: plazuela de noche delante del bar ---------- */
  let fondo = null;
  const FX0 = -120, FY0 = -120;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 240; c.height = H + 240; const g = c.getContext("2d");
    g.translate(-FX0, -FY0);
    // cielo
    const cielo = g.createLinearGradient(0, -120, 0, 420); cielo.addColorStop(0, "#070b22"); cielo.addColorStop(0.55, "#16245a"); cielo.addColorStop(1, "#2c3f7a");
    g.fillStyle = cielo; g.fillRect(-120, -120, W + 240, 560);
    g.fillStyle = "#ffffff";
    for (let i = 0; i < 60; i++) { const x = -100 + hash(i + 1) * (W + 200), y = -110 + hash(i + 2) * 300, r = 0.6 + hash(i + 3) * 1.4; g.globalAlpha = 0.4 + hash(i + 4) * 0.6; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
    g.globalAlpha = 1;
    // luna con halo
    const halo = g.createRadialGradient(830, 70, 20, 830, 70, 150); halo.addColorStop(0, "rgba(220,230,255,0.4)"); halo.addColorStop(1, "rgba(200,210,255,0)");
    g.fillStyle = halo; g.beginPath(); g.arc(830, 70, 150, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#f4f1dc"; g.beginPath(); g.arc(830, 70, 36, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(190,185,160,0.5)"; for (const [x, y, r] of [[818, 60, 7], [842, 82, 5], [838, 56, 3.5], [822, 86, 4]]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
    // casas lejanas: tejados con chimeneas y fachadas con ventanas encendidas hasta la plaza
    const tej = [[-120, 250], [-20, 250], [30, 215], [120, 215], [150, 240], [260, 240], [300, 205], [380, 205], [400, 230], [520, 230], [560, 190], [660, 190], [690, 228], [800, 228], [840, 200], [950, 200], [980, 236], [1144, 236]];
    const casas = g.createLinearGradient(0, 190, 0, 450); casas.addColorStop(0, "#111b3d"); casas.addColorStop(1, "#1a2854");
    g.fillStyle = casas; g.beginPath(); g.moveTo(-120, 450);
    for (const [x, y] of tej) g.lineTo(x, y);
    g.lineTo(1144, 450); g.closePath(); g.fill();
    g.fillStyle = "#0d1533";
    for (const [x, y] of [[60, 200], [330, 188], [600, 172], [880, 184]]) { g.fillRect(x, y, 16, 26); g.fillRect(x - 3, y - 4, 22, 6); }
    // separaciones entre casas
    g.strokeStyle = "rgba(5,8,25,0.6)"; g.lineWidth = 3;
    for (const x of [150, 400, 690, 980]) { g.beginPath(); g.moveTo(x, 240); g.lineTo(x, 450); g.stroke(); }
    for (let i = 0; i < 46; i++) {
      const x = -100 + hash(i + 70) * (W + 200), y = 250 + hash(i + 71) * 160;
      const on = hash(i + 72) < 0.5;
      g.fillStyle = on ? "#ffd98a" : "#0c1430"; g.globalAlpha = on ? 0.6 : 0.9; g.fillRect(x, y, 10, 14);
      if (on) { g.globalAlpha = 0.18; g.beginPath(); g.arc(x + 5, y + 7, 14, 0, Math.PI * 2); g.fill(); }
    }
    g.globalAlpha = 1;
    // plaza: suelo que se aleja
    const pl = g.createLinearGradient(0, 440, 0, SUELO); pl.addColorStop(0, "#1a2547"); pl.addColorStop(1, "#2a3c6c");
    g.fillStyle = pl; g.fillRect(-120, 440, W + 240, SUELO - 440);
    g.strokeStyle = "rgba(8,12,30,0.35)"; g.lineWidth = 1.5;
    for (let f = 0; f < 6; f++) { const y = 446 + f * f * 3.6 + f * 4; g.beginPath(); g.moveTo(-120, y); g.lineTo(W + 120, y); g.stroke(); }
    for (let x = -120; x < W + 120; x += 46) { g.beginPath(); g.moveTo(512 + (x - 512) * 0.55, 444); g.lineTo(x, SUELO); g.stroke(); }
    // fachada del bar a la izquierda (estuco azul petróleo y toldo de rayas)
    const fach = g.createLinearGradient(0, 120, 0, SUELO); fach.addColorStop(0, "#1f4a5a"); fach.addColorStop(1, "#163845");
    g.fillStyle = fach; g.fillRect(-120, 120, 380, SUELO - 120);
    g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 2;
    for (let y = 150; y < SUELO; y += 34) { g.beginPath(); g.moveTo(-120, y); g.lineTo(260, y); g.stroke(); }
    g.fillStyle = "#0e2a33"; g.fillRect(250, 120, 14, SUELO - 120);
    // ventana iluminada con botellas
    g.fillStyle = "#2a1a10"; g.fillRect(28, 268, 176, 132);
    const ven = g.createLinearGradient(0, 278, 0, 392); ven.addColorStop(0, "#ffcf7a"); ven.addColorStop(1, "#f29a3a");
    g.fillStyle = ven; g.fillRect(36, 276, 160, 116);
    g.fillStyle = "rgba(120,60,20,0.55)";
    for (let i = 0; i < 8; i++) { const x = 46 + i * 19, h = 22 + hash(i + 90) * 16; g.fillRect(x, 360 - h, 9, h); g.fillRect(x + 2.5, 360 - h - 8, 4, 9); }
    g.fillRect(36, 360, 160, 5);
    g.strokeStyle = "#2a1a10"; g.lineWidth = 6; g.beginPath(); g.moveTo(116, 276); g.lineTo(116, 392); g.stroke();
    // toldo de rayas
    for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? "#f2efe6" : "#c8323a"; g.beginPath(); g.moveTo(14 + i * 22, 236); g.lineTo(36 + i * 22, 236); g.lineTo(38 + i * 22, 268); g.lineTo(16 + i * 22, 268); g.closePath(); g.fill(); }
    g.fillStyle = "#8a1e24"; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(27 + i * 22, 268, 11, 0, Math.PI); g.fill(); }
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(14, 236, 198, 32);
    // farolillo de pared y halo cálido
    const hp = g.createRadialGradient(116, 300, 10, 116, 300, 200); hp.addColorStop(0, "rgba(255,190,100,0.28)"); hp.addColorStop(1, "rgba(255,190,100,0)");
    g.fillStyle = hp; g.fillRect(-84, 100, 400, 400);
    // puerta
    g.fillStyle = "#3b2414"; g.fillRect(-80, 300, 80, SUELO - 300); g.strokeStyle = TINTA; g.lineWidth = 3; g.strokeRect(-80, 300, 80, SUELO - 300);
    g.fillStyle = "#ffd27a"; g.fillRect(-66, 316, 52, 70);
    // cartel colgante con una copa (sin letras)
    g.strokeStyle = "#1a1a1a"; g.lineWidth = 3; g.beginPath(); g.moveTo(230, 170); g.lineTo(300, 170); g.stroke();
    g.beginPath(); g.moveTo(268, 170); g.lineTo(268, 182); g.moveTo(294, 170); g.lineTo(294, 182); g.stroke();
    g.fillStyle = "#e9d9b0"; g.beginPath(); g.ellipse(281, 202, 24, 22, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 3; g.stroke();
    g.strokeStyle = "#7a2030"; g.lineWidth = 3; g.beginPath(); g.moveTo(271, 192); g.lineTo(291, 192); g.lineTo(281, 204); g.closePath(); g.moveTo(281, 204); g.lineTo(281, 214); g.moveTo(275, 214); g.lineTo(287, 214); g.stroke();
    // a la derecha: muro bajo con macetas
    g.fillStyle = "#283a6a"; g.fillRect(880, 430, 264, SUELO - 430); g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = 2;
    for (let x = 880; x < 1144; x += 44) g.strokeRect(x, 430, 44, 22);
    for (const x of [905, 990, 1075]) {
      g.fillStyle = "#b5532b"; g.beginPath(); g.moveTo(x - 16, 432); g.lineTo(x + 16, 432); g.lineTo(x + 12, 404); g.lineTo(x - 12, 404); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
      g.fillStyle = "#2f7a4a"; for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(x - 12 + k * 6, 396 - 6 * Math.sin(k), 7, 11, (k - 2) * 0.3, 0, Math.PI * 2); g.fill(); }
    }
    const su = g.createLinearGradient(0, SUELO, 0, H + 120); su.addColorStop(0, "#344a7a"); su.addColorStop(1, "#16213f");
    g.fillStyle = su; g.fillRect(-120, SUELO, W + 240, H + 120 - SUELO);
    g.strokeStyle = "rgba(10,15,35,0.55)"; g.lineWidth = 2;
    for (let fila = 0; fila < 6; fila++) {
      const y = SUELO + 6 + fila * 14 + fila * fila * 2, h = 10 + fila * 3;
      for (let x = -120 + (fila % 2) * 18; x < W + 120; x += 36 + fila * 4) { g.beginPath(); g.roundRect ? g.roundRect(x, y, 30 + fila * 4, h, 5) : g.rect(x, y, 30 + fila * 4, h); g.stroke(); }
    }
    g.fillStyle = "rgba(255,220,160,0.12)"; g.fillRect(-120, SUELO, W + 240, 2);
    // viñeta
    const v = g.createRadialGradient(512, 300, 280, 512, 300, 720); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.6)");
    g.fillStyle = v; g.fillRect(-120, -120, W + 240, H + 240);
    return c;
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const tension = tramo(t, T.abajo, T.panico + 0.4) * (1 - tramo(t, T.mEntra0 + 0.2, T.mEntra1));
    const fin = tramo(t, T.cae1, T.camara + 0.4);
    return { k: 1 + 0.07 * tension + 0.08 * fin, x: 512 - 70 * tension - 80 * fin, y: 300 - 40 * tension + 40 * fin };
  }

  const pose = t => ({ g: poseG(t), m: poseM(t) });

  class GuillermoMarcosGato extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !M.listo()) return;
      if (!fondo) fondo = creaFondo();
      const pG = poseG(t), pM = poseM(t), eM = especM(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      const sacude = t >= T.cae1 ? 4 * Math.exp(-(t - T.cae1) * 8) * suave(fase(t,T.cae1,T.cae1+.04)) : 0;
      if (sacude > 0.05) g.translate(ruido(t * 50) * sacude, ruido(t * 50 + 7) * sacude);
      g.drawImage(fondo, FX0, FY0);
      // sombras
      g.save(); g.fillStyle = "rgba(0,0,0,0.35)";
      g.beginPath(); g.ellipse(PX, SUELO + 1, 40, 6, 0, 0, Math.PI * 2); g.fill();
      const altG = SUELO - pG.suelo;
      g.globalAlpha = clamp(1 - altG / 220);
      g.beginPath(); g.ellipse(pG.x + 10, SUELO + 1, 80 * (1 - altG / 400) + 30, 8, 0, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 1;
      g.beginPath(); g.ellipse(pM.x, SUELO + 1, 80, 8, 0, 0, Math.PI * 2); g.fill(); g.restore();
      farola(g, t);
      farol(g, t);
      // escalera (detrás de Marcos)
      const ec = escalera(t, eM);
      dibEscalera(g, ec);
      // Marcos (con el giro: se aplasta y cambia de lado)
      const gt = estadoGato(t, pM);
      const fx = t > T.gira0 && t < T.gira1 ? giroX(t) : 1;
      g.save(); g.translate(pM.x, 0); g.scale(Math.max(0.02, fx), 1); g.translate(-pM.x, 0);
      M.dibujar(g, pM, t);
      if (t >= T.gBrazos0) { gato(g, gt.x, gt.y, ESC_GATO, gt.o, t); ronroneo(g, t, gt); }
      g.restore();
      // Guillermo
      G.dibujar(g, pG, t);
      // gato en la farola o saltando (delante de Guillermo)
      if (t < T.gBrazos0) {
        gato(g, gt.x, gt.y, ESC_GATO, gt.o, t);
        const bo = { x: gt.x + 12, y: gt.y - 28 };
        ondasSonido(g, bo.x + 12, bo.y, T.maulla.reduce((m, tm) => Math.max(m, campana(t, tm, tm + 0.4)), 0) + campana(t, 8.95, 9.35), 1);
        bufido(g, gt.x + 8, gt.y - 30, campana(t, T.bufa - 0.02, T.gSalta0 + 0.1));
      }
      luzFarol(g, t);
      temblorLineas(g, pG, tramo(t, T.panico, T.panico + 0.2) * (1 - tramo(t, T.mMira - 0.1, T.mMira + 0.1)) + 0.6 * tramo(t, T.ayuda1, T.ayuda1 + 0.3) * (1 - tramo(t, T.desliza0, T.desliza0 + 0.2)), t);
      chirridos(g, t, pG);
      rayasBajada(g, t, pM);
      polvo(g, t, pG.x + 20);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00022.2", nombre: "Guillermo y Marcos · El gato en la farola", crear: () => new GuillermoMarcosGato() });
  window.__A2D_00022_2 = { pose, poseG, poseM, T, DUR, estadoGato, escalera: t => extremos(escalera(t, especM(t))), escaleraPose:t=>escalera(t,especM(t)), especM, camara, gato, CASCO, PX, CAP, SUELO, ESC_P, ESC_L, sobreFarol, sobreTapa, giroX, TG_MID, enEsc, SUBE_PIES, SUBE_MANOS, dEn, MITAD, TOB_M, dibEscalera, altManos, altCuerpo, altPies, altBaja };
})();

