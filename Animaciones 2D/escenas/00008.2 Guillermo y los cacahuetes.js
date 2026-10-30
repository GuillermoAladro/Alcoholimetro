"use strict";
/* 00008.2 · Guillermo y los cacahuetes
 *
 * Negro → Guillermo está junto a una mesa alta con un cuenco de cacahuetes y los mira con
 * antojo → coge uno, lo lanza al aire y lo sigue con los ojos con la boca abierta: le rebota
 * en la nariz, se queda bizco y sacude la cabeza → el segundo lo tira muy alto, chulito, y
 * recula para cazarlo, pero le pasa por detrás y cae al suelo; lo busca a un lado y a otro
 * hasta que lo ve en el suelo → vuelve a la mesa, apunta con un ojo cerrado y la lengua
 * fuera, y lo lanza tan alto que sale de la escena → espera echándose hacia atrás como en el
 * limbo (echa una mirada impaciente a cámara) y el cacahuete le cae justo en la boca: ¡ñam! →
 * mastica con el carrillo hinchado, lo celebra con un salto y los brazos arriba, y guiña un ojo
 * a cámara con el pulgar arriba → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto; las trayectorias de los cacahuetes se
 * calculan una vez a partir de la postura (la mano que lanza y la nariz o la boca de llegada).
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo;
  const S = 0.31, SUELO = 560, XG = 392;
  const DUR = 13.45;
  const GRAV = 1500;                                    // px/s² (un poco de dibujos animados)
  const T = {
    mira: 0.45, coge1: 0.8, agarra1: 1.2, sube1: 1.32, listo1: 1.65, amago1: 1.72, lanza1: 1.92, golpe1: 2.72,
    bizcoFin: 3.5, sacude0: 3.55, sacude1: 3.95,
    coge2: 3.78, agarra2: 4.12, sube2: 4.22, chulo0: 4.35, amago2: 4.74, lanza2: 4.94, cae2: 6.24,
    atras0: 5.12, busca0: 6.5, abajo0: 7.05, molesto0: 7.35,
    vuelve0: 7.45, coge3: 7.78, agarra3: 8.12, sube3: 8.22, apunta0: 8.3, carga3: 8.72, lanza3: 9.05, caza: 10.9,
    triunfo0: 11.42, salto0: 11.56, salto1: 11.92, guino0: 12.3, fin: 12.98
  };

  /* ---------- pasos (x de pantalla de cada tobillo; altura del paso en unidades de hoja) ---------- */
  const PASOS = {
    cerca: [[-10, -9, XG - 19, 0],
            [T.atras0, T.atras0 + 0.24, XG - 49, 50], [T.atras0 + 0.46, T.atras0 + 0.7, XG - 76, 50],
            [T.vuelve0, T.vuelve0 + 0.26, XG - 19, 60],
            [T.lanza3 + 0.34, T.lanza3 + 0.56, XG - 34, 44], [T.lanza3 + 1.18, T.lanza3 + 1.34, XG - 42, 28],
            [T.salto0, T.salto1, XG - 22, 190]],
    lejos: [[-10, -9, XG + 18, 0],
            [T.atras0 + 0.22, T.atras0 + 0.46, XG - 12, 50], [T.atras0 + 0.68, T.atras0 + 0.92, XG - 36, 50],
            [T.vuelve0 + 0.22, T.vuelve0 + 0.48, XG + 18, 60],
            [T.lanza3 + 0.14, T.lanza3 + 0.36, XG + 46, 50], [T.lanza3 + 0.9, T.lanza3 + 1.06, XG + 38, 28],
            [T.salto0, T.salto1, XG + 20, 190]]
  };
  const TOB_Y = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  function pie(lado, t) {
    const L = PASOS[lado]; let i = 0; while (i + 1 < L.length && t >= L[i + 1][0]) i++;
    const [t0, t1, x, alto] = L[i], xa = i > 0 ? L[i - 1][2] : x, u = fase(t, t0, t1);
    const arco = Math.sin(Math.PI * u);
    return { x: lerp(xa, x, suave5(u)), y: TOB_Y[lado] - alto * arco, ang: (t0 === T.salto0 ? 0.35 : -0.2) * arco };
  }
  const centroPies = t => (pie("cerca", t).x + pie("lejos", t).x) / 2;
  const CENTRO0 = (XG - 19 + XG + 18) / 2;

  /* ---------- posturas del cuerpo (se mezclan) ---------- */
  // dx: pelvis (px de pantalla), pel: pelvis abajo (hoja), manos respecto a su hombro (hoja), lc: mano lejana al cuenco.
  const P0 = { dx: 0, pel: 0, torso: 0, cab: 0, cx: 49, cy: 340, ca: 0, cmu: -1.75, cp: 0, lx: 0, ly: 300, la: 0, lmu: -1.75, lp: 0, lpu: 0, lc: 0 };
  const C_ = o => Object.assign({}, P0, o);
  const CUERPOS = {
    bolsillos: C_({}),
    mira: C_({ cab: 0.07, torso: 0.02 }),
    alcanza: C_({ torso: 0.07, cab: 0.1, lx: 150, ly: 170, la: 0.45, lmu: -1.75, lp: 1, lc: 1 }),
    sostiene: C_({ cab: -0.02, lx: 140, ly: 30, la: -0.25, lmu: -3.4, lp: 1 }),
    amago: C_({ pel: 22, cab: 0.02, lx: 140, ly: 115, la: 0.15, lmu: -3.4, lp: 1 }),
    lanza: C_({ pel: -8, torso: -0.03, cab: -0.12, lx: 165, ly: -110, la: -0.7, lmu: -3.6, lp: 1 }),
    mira1: C_({ pel: 6, torso: -0.05, cab: -0.16, lx: 105, ly: 190, la: 0.1, lmu: -1.75, lp: 1 }),
    aturdido: C_({ pel: 8, torso: 0.02, cab: 0.07, lx: 70, ly: 245, la: 0.1, lmu: -1.75, lp: 1 }),
    chulo: C_({ cab: -0.03, torso: -0.02, lx: 105, ly: -45, la: -0.3, lmu: -3.4, lp: 1 }),
    lanza2: C_({ pel: -12, torso: -0.06, cab: -0.28, lx: 150, ly: -165, la: -0.9, lmu: -3.8, lp: 1 }),
    atras: C_({ pel: 34, torso: -0.2, cab: -0.55, lx: 150, ly: -130, la: -0.7, lmu: -3.7, lp: 1 }),
    busca: C_({ pel: 6, torso: 0, cab: 0.03, lx: 55, ly: 255, la: 0.1, lmu: -1.75, lp: 1 }),
    abajo: C_({ pel: 14, torso: 0.05, cab: 0.18, lx: 55, ly: 255, la: 0.1, lmu: -1.75, lp: 1 }),
    apunta: C_({ pel: 30, torso: 0.05, cab: 0.05, lx: 95, ly: -150, la: -0.2, lmu: -3.4, lp: 1 }),
    carga3: C_({ pel: 85, torso: 0.1, cab: 0.06, lx: 120, ly: 250, la: 0.4, lmu: -3.2, lp: 1 }),
    lanza3: C_({ pel: -20, torso: -0.08, cab: -0.4, lx: 110, ly: -292, la: -1.4, lmu: -3.9, lp: 1 }),
    espera: C_({ dx: 14, pel: 70, torso: -0.24, cab: -0.62, lx: 170, ly: -40, la: -0.1, lmu: -3.3, lp: 1 }),
    limbo: C_({ dx: 26, pel: 140, torso: -0.44, cab: -0.92, cx: -150, cy: 150, ca: 0.5, cmu: -1.2, cp: 1, lx: 205, ly: -90, la: -0.25, lmu: -3.4, lp: 1 }),
    mastica: C_({ dx: 6, pel: 18, torso: -0.04, cab: -0.04, cx: 30, cy: 280, ca: 0.1, cmu: -1.75, cp: 1, lx: 60, ly: 250, la: 0.1, lmu: -1.75, lp: 1 }),
    agacha: C_({ dx: 4, pel: 70, torso: 0.04, cab: 0.02, cx: 70, cy: 150, ca: 0.2, cmu: -1.75, cp: 1, lx: 80, ly: 160, la: 0.2, lmu: -1.75, lp: 1 }),
    triunfo: C_({ pel: -6, torso: -0.04, cab: -0.12, cx: -105, cy: -300, ca: 0.35, cmu: -4.5, cp: 1, lx: 150, ly: -255, la: -2.4, lmu: -1.75, lp: 1 }),
    guino: C_({ pel: 0, torso: 0.02, cab: 0.04, lx: 105, ly: -70, la: 0, lmu: -4.5, lp: 1, lpu: 1 })
  };
  const GUION_CUERPO = [
    [T.mira, T.mira + 0.4, "mira"], [T.coge1, T.agarra1, "alcanza"], [T.sube1, T.listo1, "sostiene"],
    [T.amago1, T.lanza1 - 0.06, "amago"], [T.lanza1 - 0.06, T.lanza1 + 0.12, "lanza"], [T.lanza1 + 0.2, T.lanza1 + 0.6, "mira1"],
    [T.golpe1, T.golpe1 + 0.14, "aturdido"], [T.coge2, T.agarra2, "alcanza"], [T.sube2, T.sube2 + 0.3, "chulo"],
    [T.amago2, T.lanza2 - 0.06, "amago"], [T.lanza2 - 0.06, T.lanza2 + 0.12, "lanza2"], [T.atras0 - 0.05, T.atras0 + 0.55, "atras"],
    [T.busca0 - 0.1, T.busca0 + 0.3, "busca"], [T.abajo0, T.abajo0 + 0.3, "abajo"], [T.vuelve0, T.vuelve0 + 0.3, "busca"],
    [T.coge3, T.agarra3, "alcanza"], [T.sube3, T.sube3 + 0.3, "apunta"], [T.carga3, T.lanza3 - 0.08, "carga3"],
    [T.lanza3 - 0.08, T.lanza3 + 0.16, "lanza3"], [T.lanza3 + 0.25, T.lanza3 + 0.8, "espera"], [T.lanza3 + 0.8, T.caza - 0.05, "limbo"],
    [T.caza + 0.12, T.caza + 0.55, "mastica"], [T.triunfo0, T.salto0, "agacha"], [T.salto0 - 0.06, T.salto0 + 0.32, "triunfo"],
    [T.guino0, T.guino0 + 0.45, "guino"]
  ];
  const LANZAS = [];
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function postura(t) {
    let c = CUERPOS.bolsillos;
    for (const [t0, t1, nom] of GUION_CUERPO) { if (t <= t0) break; c = mezclaE(c, CUERPOS[nom], (LANZAS.includes(nom) ? salida : suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }

  /* ---------- caras ---------- */
  // tr: los ojos siguen al cacahuete; cd/ci: cierre extra de cada ojo; lg: lengua fuera; mof: carrillo lleno.
  const BASE = { mx: 0.85, my: 0.2, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12,
    dientes: 1, lengua: 0, cd: 0, ci: 0, tr: 0, lg: 0, mof: 0 };
  const E = o => Object.assign({}, BASE, o);
  const CARAS = {
    inicio: E({}),
    antojo: E({ mx: 0.9, my: 0.7, sd: 10, gd: 0.1, si: 8, gi: 0.1, orig: 0, sonr: 0.55, ancho: 0.95, tr: 0.6 }),
    sigue: E({ tr: 1, iris: 1.1, sd: 18, gd: 0.1, si: 18, gi: 0.1, orig: 0, abre: 56, ancho: 1.08, sonr: 0.05, lengua: 0.5 }),
    pum: E({ mx: 0, my: 0, sd: 20, gd: 0.2, si: 4, gi: -0.1, orig: 0, abre: 10, ancho: 0.7, sonr: -0.3 }),
    decidido: E({ mx: 0.85, my: 0.15, c: 0.2, sd: -9, gd: -0.22, si: -9, gi: -0.22, orig: 0, sonr: 0.15, ancho: 0.95, tr: 0.3 }),
    chulo: E({ mx: -0.85, my: -0.2, sd: 16, gd: 0.15, si: -4, gi: -0.08, orig: 0, sonr: 0.7, abre: 4, ancho: 1 }),
    sigue2: E({ tr: 1, iris: 1.1, sd: 20, gd: 0.12, si: 20, gi: 0.12, orig: 0, abre: 60, ancho: 1.1, sonr: 0, lengua: 0.5 }),
    buscaD: E({ mx: 0.95, my: 0, sd: 14, gd: 0.15, si: -6, gi: -0.1, orig: 0, abre: 14, ancho: 0.6, sonr: -0.1 }),
    buscaI: E({ mx: -0.95, my: 0.1, sd: -6, gd: -0.1, si: 14, gi: 0.15, orig: 0, abre: 14, ancho: 0.6, sonr: -0.1 }),
    abajo: E({ tr: 1, sd: 8, gd: 0.05, si: 8, gi: 0.05, orig: 0, abre: 10, ancho: 0.62, sonr: -0.3 }),
    molesto: E({ mx: 0.9, my: 0.2, c: 0.35, sd: -12, gd: -0.28, si: -12, gi: -0.28, orig: 0, sonr: -0.35, ancho: 0.9 }),
    apunta: E({ tr: 1, c: 0.22, cd: 0.78, z: 0.6, sd: -14, gd: -0.3, si: -4, gi: -0.1, orig: 0, sonr: 0.1, ancho: 0.85, lg: 1 }),
    carga: E({ tr: 1, c: 0.32, sd: -12, gd: -0.25, si: -12, gi: -0.25, orig: 0, sonr: 0.05, ancho: 0.85, lg: 1 }),
    impaciente: E({ tr: 0, mx: -0.9, my: -0.15, iris: 1.05, sd: 24, gd: 0.15, si: 8, gi: -0.05, orig: 0, abre: 46, ancho: 0.95, sonr: 0, lengua: 0.3 }),
    espera: E({ tr: 1, iris: 1.12, sd: 20, gd: 0.12, si: 20, gi: 0.12, orig: 0, abre: 80, ancho: 1.25, sonr: 0, lengua: 0.4 }),
    nam: E({ tr: 0, mx: 0.3, my: -0.6, iris: 1.12, sd: 24, gd: 0.14, si: 24, gi: 0.14, orig: 0, abre: 0, ancho: 0.9, sonr: 0.2 }),
    mastica: E({ mx: 0.6, my: -0.2, c: 0.72, h: 1, sd: 12, gd: 0.1, si: 12, gi: 0.1, orig: 0, abre: 0, sonr: 0.45, ancho: 0.95, mof: 1 }),
    triunfo: E({ mx: 0.4, my: -0.5, c: 0.65, h: 1, sd: 20, gd: 0.18, si: 20, gi: 0.18, orig: 0, abre: 34, ancho: 1.15, sonr: 1 }),
    guino: E({ mx: -0.85, my: -0.25, ci: 1, h: 1, sd: 18, gd: 0.15, si: -2, gi: -0.05, orig: 0, abre: 6, sonr: 0.85, ancho: 1.05 })
  };
  const GUION_CARA = [
    [T.mira, T.mira + 0.35, "antojo"], [T.lanza1 - 0.05, T.lanza1 + 0.2, "sigue"], [T.golpe1, T.golpe1 + 0.12, "pum"],
    [T.sacude0 + 0.1, T.sacude1, "decidido"], [T.chulo0, T.chulo0 + 0.25, "chulo"], [T.lanza2 - 0.08, T.lanza2 + 0.15, "sigue2"],
    [T.busca0, T.busca0 + 0.2, "buscaD"], [T.busca0 + 0.3, T.busca0 + 0.5, "buscaI"], [T.abajo0, T.abajo0 + 0.25, "abajo"],
    [T.molesto0, T.molesto0 + 0.2, "molesto"], [T.apunta0, T.apunta0 + 0.3, "apunta"], [T.carga3 - 0.05, T.carga3 + 0.15, "carga"],
    [T.lanza3 - 0.02, T.lanza3 + 0.2, "espera"], [T.lanza3 + 0.95, T.lanza3 + 1.13, "impaciente"], [T.lanza3 + 1.34, T.lanza3 + 1.52, "espera"],
    [T.caza, T.caza + 0.09, "nam"], [T.caza + 0.18, T.caza + 0.45, "mastica"],
    [T.triunfo0 + 0.08, T.triunfo0 + 0.3, "triunfo"], [T.guino0 + 0.05, T.guino0 + 0.3, "guino"]
  ];
  function expresion(t) {
    let e = CARAS.inicio;
    for (const [t0, t1, nom] of GUION_CARA) { if (t <= t0) break; e = mezclaE(e, CARAS[nom], suave(fase(t, t0, t1))); }
    return Object.assign({}, e);
  }
  function parpadeos(t) {
    let o = 0;
    for (const tb of [1.0, 3.56, 3.74, 6.75, 10.2]) { const k = fase(t, tb, tb + 0.14); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); }
    return o;
  }

  /* ---------- geometría ---------- */
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLSILLO_C = punoDesde({ x: 131, y: 652 }, 0, -1.75), BOLSILLO_L = punoDesde({ x: 372, y: 648 }, 0, -1.75);
  const aHoja = (p, q) => ({ x: G.PELVIS.x + (q.x - p.x) / S, y: G.SUELO + (q.y - SUELO) / S });
  // pantalla → retrato (inversa de la transformación de la cabeza)
  function aRetrato(p, q) {
    const h = aHoja(p, q), H = G.cabeza(p), dx = h.x - H.cx, dy = h.y - H.cy, c = Math.cos(H.ang), s = Math.sin(H.ang);
    return { x: (dx * c + dy * s) / H.kx + 700, y: (-dx * s + dy * c) / H.ky + 800 };
  }
  const deRetrato = (p, q) => G.aPantalla(p, G.cabeza(p).a(q));
  const NARIZ = { x: 912, y: 652 };                     // punta de la nariz (retrato), donde rebota el primero
  const BOCA_C = { x: 803, y: 730 }, BOCA_ANG = 0.26;
  const dentroBoca = b => { const y = 12 * (b.sonrisa ?? 0) + 2 + 0.45 * Math.max(0, b.abre ?? 0); return { x: BOCA_C.x - y * Math.sin(BOCA_ANG), y: BOCA_C.y + y * Math.cos(BOCA_ANG) }; };
  const CUENCO = { x: 503, y: 300 };                    // donde la mano coge el cacahuete (pantalla)
  const MESA = { x: 548, y: 322 };
  // cacahuete que sujeta la mano (unidades de jarra respecto al puño)
  const EN_MANO = { x: 3, y: -17, a: -0.2 };
  function enMano(p) {
    const m = p.manoLejos, o = G.rotP({ x: EN_MANO.x * G.JK, y: EN_MANO.y * G.JK }, m.ang);
    const q = G.aPantalla(p, { x: m.x + o.x, y: m.y + o.y });
    return { x: q.x, y: q.y, rot: m.ang + EN_MANO.a };
  }

  /* ---------- trayectorias ---------- */
  const apoyoCacahuete=rot=>1.3*Math.max(-2.8*Math.sin(rot)+4.5,2.8*Math.sin(rot)+.2*Math.cos(rot)+4.2);
  let TR = null;
  function balistica(a, b, D) { return { vx: (b.x - a.x) / D, vy: (b.y - a.y - 0.5 * GRAV * D * D) / D }; }
  function preparaTrayectorias() {
    const q1 = poseBase(T.lanza1, true), q2 = poseBase(T.lanza2, true), q3 = poseBase(T.lanza3, true);
    const r1 = enMano(q1), r2 = enMano(q2), r3 = enMano(q3);
    const n = poseBase(T.golpe1, true), N = deRetrato(n, NARIZ);
    const qc = poseBase(T.caza, true), M = deRetrato(qc, dentroBoca(qc.cara.boca));
    const caida2 = { x: 186, y: SUELO - apoyoCacahuete(r2.rot+7*(T.cae2-T.lanza2)) };
    // giro del tercero: que llegue alineado con la boca
    const angBoca = G.cabeza(qc).ang + BOCA_ANG, D3 = T.caza - T.lanza3;
    let w3 = 9; { const dif = angBoca - (r3.rot + w3 * D3); w3 += (dif - Math.PI * Math.round(dif / Math.PI)) / D3; }
    TR = {
      1: Object.assign({ t0: T.lanza1, t1: T.golpe1, a: r1, b: N, w: -8 }, balistica(r1, N, T.golpe1 - T.lanza1)),
      2: Object.assign({ t0: T.lanza2, t1: T.cae2, a: r2, b: caida2, w: 7 }, balistica(r2, caida2, T.cae2 - T.lanza2)),
      3: Object.assign({ t0: T.lanza3, t1: T.caza, a: r3, b: M, w: w3, angPortrait: r3.rot + w3 * D3 - G.cabeza(qc).ang }, balistica(r3, M, D3)),
      bocaCaza: dentroBoca(qc.cara.boca), angCaza: G.cabeza(qc).ang
    };
  }
  // rebotes en el suelo (o en la nariz) a partir de un estado
  function rebota(x, y, vx, vy, rot, w, suelo, tt) {
    for (let i = 0; i < 4; i++) {
      const disc = vy * vy + 2 * GRAV * (suelo - y), tc = (-vy + Math.sqrt(Math.max(0, disc))) / GRAV;
      if (tt < tc) return { x: x + vx * tt, y: y + vy * tt + 0.5 * GRAV * tt * tt, rot: rot + w * tt, vel: Math.hypot(vx, vy + GRAV * tt) };
      x += vx * tc; rot += w * tc; y = suelo; vy = -(vy + GRAV * tc) * 0.36; vx *= 0.62; w *= 0.55; tt -= tc;
    }
    const dur = 0.4, k = Math.min(tt, dur);
    x += vx * k - 0.5 * vx / dur * k * k;
    const rf = Math.PI * Math.round(rot / Math.PI);
    return { x, y: suelo, rot: lerp(rot, rf, suave(k / dur)), vel: 0 };
  }
  // posición de cada cacahuete en pantalla (null si no está suelto)
  function trayectoriaCacahuete(i, t) {
    const c = TR[i]; if (t < c.t0) return null;
    if (t <= c.t1) { const u = t - c.t0; return { x: c.a.x + c.vx * u, y: c.a.y + c.vy * u + 0.5 * GRAV * u * u, rot: c.a.rot + c.w * u, vel: Math.hypot(c.vx, c.vy + GRAV * u) }; }
    if (i === 3) return null;                                           // ya está en la boca
    const D = c.t1 - c.t0, x = c.b.x, y = c.b.y, vyL = c.vy + GRAV * D, rot = c.a.rot + c.w * D;
    if (i === 1) return rebota(x, y, 150, -330, rot, -11, SUELO - 5.3, t - c.t1);     // rebote en la nariz
    return rebota(x, y, c.vx * 0.55, -vyL * 0.36, rot, c.w * 0.55, SUELO - 5.3, t - c.t1);   // segundo: bota en el suelo
  }

  function cacahuete(i,t){const q=trayectoriaCacahuete(i,t);if(q&&i!==3&&t>=TR[i].t1)q.y=Math.min(q.y,SUELO-apoyoCacahuete(q.rot));return q;}

  /* ---------- postura completa ---------- */
  function poseBase(t, sinOjos) {
    const b = postura(t);
    const respira = Math.sin(t * 2.3);
    const salto = campana(t, T.salto0 + 0.02, T.salto1 - 0.04);
    const p = {
      x: XG + b.dx + (centroPies(t) - CENTRO0), suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 - 175 * Math.pow(salto, 0.8) },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }, cara: null,
      ikContinuo: true, hombrosContinuos: true, tirasLimpias: true                               // rodillas y codos sin dientes en las tiras
    };
    for (const lado of ["cerca", "lejos"]) { const f = pie(lado, t); p.piernas[lado] = { tob: { x: G.PELVIS.x + (f.x - p.x) / S, y: f.y }, ang: f.ang }; }
    // nariz: la cabeza da un respingo
    const pum = t >= T.golpe1 ? Math.exp(-(t - T.golpe1) * 9) * suave(fase(t, T.golpe1, T.golpe1 + 0.03)) : 0;
    p.cabeza.ang += 0.12 * pum; p.cabeza.dy += 10 * pum; p.cabeza.esc = { x: 1 + 0.05 * pum, y: 1 - 0.06 * pum };
    // aturdido: la cabeza oscila; luego la sacude para despejarse
    p.cabeza.ang += 0.05 * Math.sin((t - T.golpe1) * 7) * tramo(t, T.golpe1 + 0.1, T.golpe1 + 0.3) * (1 - tramo(t, T.bizcoFin - 0.15, T.bizcoFin));
    p.cabeza.ang += 0.14 * Math.sin((t - T.sacude0) * 34) * campana(t, T.sacude0, T.sacude1);
    // ñam: mordisco y carrillo
    const nam = t >= T.caza ? Math.exp(-(t - T.caza) * 10) * suave(fase(t, T.caza, T.caza + 0.04)) : 0;
    p.cabeza.esc = { x: p.cabeza.esc.x + 0.04 * nam, y: p.cabeza.esc.y - 0.07 * nam }; p.cabeza.dy += 8 * nam;
    // espera: pequeños ajustes de equilibrio
    const eq = tramo(t, T.lanza3 + 0.6, T.lanza3 + 1.0) * (1 - tramo(t, T.caza - 0.1, T.caza + 0.2));
    p.torso += 0.035 * Math.sin((t - T.lanza3) * 5.3) * eq;
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    const enBolsC = 1 - clamp(b.cp * 1.5), enBolsL = 1 - clamp(b.lp * 1.5);
    let c = { x: hc.x + b.cx, y: hc.y + b.cy }, l = { x: hl.x + b.lx, y: hl.y + b.ly };
    c = mezcla(c, Tr(BOLSILLO_C), enBolsC * (1 - b.cp)); l = mezcla(l, Tr(BOLSILLO_L), enBolsL * (1 - b.lp));
    if (b.lc > 0.001) {
      let hunde = 0; for (const ta of [T.agarra1, T.agarra2, T.agarra3]) hunde = Math.max(hunde, campana(t, ta - 0.1, ta + 0.14));
      l = mezcla(l, aHoja(p, { x: CUENCO.x, y: CUENCO.y + 7 * hunde }), b.lc);
    }
    // Arco exterior al subir el brazo y al devolver la mano al bolsillo.
    c.x-=100*campana(t,T.salto0-.06,T.salto0+.32)+160*campana(t,T.guino0,T.guino0+.45);
    const ca=b.ca+(1-b.cp)*b.torso,w=G.rotP({x:Math.cos(b.cmu)*R_M,y:Math.sin(b.cmu)*R_M},ca);
    const dx=c.x+w.x-hc.x,dy=c.y+w.y-hc.y,d=Math.hypot(dx,dy),min=88;
    const dd=(d+min+Math.sqrt((d-min)*(d-min)+4))/2,k=dd/Math.max(d,.001)-1;
    c.x+=dx*k;c.y+=dy*k;
    p.manoCerca = { x: c.x, y: c.y, ang: b.ca + (1 - b.cp) * b.torso, mu: b.cmu, dobla: -1, puno: b.cp };
    p.manoLejos = { x: l.x, y: l.y, ang: b.la + (1 - b.lp) * b.torso, mu: b.lmu, dobla: -1, puno: b.lp, pulgar: b.lpu };
    // cacahuete en la mano
    // cacahuete en la mano: sale de entre los dedos al levantar la mano del cuenco
    let asoma = -1;
    for (const [ta, tl] of [[T.agarra1, T.lanza1], [T.agarra2, T.lanza2], [T.agarra3, T.lanza3]]) if (t > ta && t < tl) asoma = suave(fase(t, ta + 0.04, ta + 0.24));
    if (asoma >= 0) p.manoLejos.objeto = gg => { gg.save(); gg.translate(EN_MANO.x, lerp(-2, EN_MANO.y, asoma)); gg.rotate(EN_MANO.a); gg.scale(1 / (G.JK * S), 1 / (G.JK * S)); dibCacahuete(gg, 0, 0, 0); gg.restore(); };
    // cara
    const e = expresion(t);
    e.c = Math.max(e.c, parpadeos(t));
    e.sonr += 0.22 * Math.sin(t * 17) * campana(t, T.golpe1 + 0.1, T.bizcoFin + 0.1);       // boca temblona de aturdido
    const boca = { orig: e.orig, abre: e.abre, ancho: e.ancho + 0.05 * Math.sin((t - T.caza) * 15) * e.mof, sonrisa: e.sonr + 0.12 * Math.sin((t - T.caza) * 15 + 1) * e.mof, dientes: e.dientes > 0.5, lengua: e.lengua };
    p.cara = { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: 0, ojos: { d: clamp(e.c + e.cd), i: clamp(e.c + e.ci), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } }, boca,
      mofletes: e.mof * (0.55 + 0.3 * Math.sin((t - T.caza) * 15)), rubor: 0, bigote: 0 };
    p.cara.rubor = 0.5 * tramo(t, T.triunfo0, T.triunfo0 + 0.3) + 0.4 * tramo(t, T.caza + 0.2, T.caza + 0.5) * (1 - tramo(t, T.triunfo0, T.triunfo0 + 0.3)) * 0.8;
    const capa = { lg: e.lg, nariz: t >= T.golpe1 ? suave(fase(t, T.golpe1, T.golpe1 + 0.08)) * (1 - tramo(t, T.golpe1 + 1.2, T.golpe1 + 2.2)) : 0, bz: 0, md: null, mi: null, boca: null };
    if (!sinOjos && TR) {
      // los ojos siguen al cacahuete (o al suelo, donde quedó)
      // (media de las últimas posiciones: los ojos van un pelín por detrás y nunca saltan)
      let obj = null;
      if (e.tr > 0.001) { obj = { x: 0, y: 0 }; for (let i = 0; i < 6; i++) { const q = objetivo(t - i * 0.02, p); obj.x += q.x / 6; obj.y += q.y / 6; } }
      if (obj) {
        const r = aRetrato(p, obj), dx = r.x - 832, dy = r.y - 590, n = Math.max(200, Math.hypot(dx, dy));   // de cerca, la mirada pasa por el centro sin saltos
        p.cara.mirada = mezcla(p.cara.mirada, { x: dx / n, y: dy / n }, e.tr);
      }
      // bizco: los ojos se cruzan al acercarse a la nariz y así se quedan tras el golpe
      let bz = 0;
      if (t > T.lanza1 && t < T.golpe1) { const q = cacahuete(1, t), r = aRetrato(p, q); bz = e.tr * clamp(1 - (Math.hypot(r.x - NARIZ.x, r.y - NARIZ.y) - 90) / 300); }
      else if (t >= T.golpe1) bz = 1 - tramo(t, T.bizcoFin - 0.2, T.bizcoFin);
      if (bz > 0.001) { capa.bz = bz; capa.md = mezcla(p.cara.mirada, { x: 0.95, y: 0.75 }, bz); capa.mi = mezcla(p.cara.mirada, { x: -0.95, y: 0.7 }, bz); }
      if (t >= T.caza && t < T.caza + 0.3) capa.boca = { b: boca, k: fase(t, T.caza, T.caza + 0.3) };
    }
    p.capaCabeza = (g, tt) => capaCara(g, p, capa);
    return p;
  }
  function objetivo(t, p) {
    const mano = enMano(p), cogiendo = ta => mezcla(CUENCO, mano, tramo(t, ta - 0.1, ta + 0.1));
    if (t < T.lanza1) return cogiendo(T.agarra1);
    if (t < T.coge2) return cacahuete(1, t);
    if (t < T.lanza2) return mezcla(cacahuete(1, t), cogiendo(T.agarra2), tramo(t, T.coge2, T.coge2 + 0.3));
    if (t < T.coge3) return cacahuete(2, t);
    if (t < T.lanza3) return mezcla(cacahuete(2, t), cogiendo(T.agarra3), tramo(t, T.coge3, T.coge3 + 0.3));
    if (t <= T.caza) return cacahuete(3, t);
    return TR[3].b;
  }
  function pose(t) { if (!TR) preparaTrayectorias(); return poseBase(t); }

  /* ---------- capa de la cara: nariz roja, lengua, ojos bizcos y el cacahuete dentro de la boca ---------- */
  const OJOS = {
    d: { arriba: [[733, 551], [737, 541], [748, 541], [762, 545], [776, 550], [790, 556], [803, 561], [809, 566]], c: { x: 771, y: 563 }, r: 17.5, rx: 25, ry: 9 },
    i: { arriba: [[866, 603], [872, 597], [885, 598], [900, 602], [913, 606], [921, 611]], c: { x: 894, y: 617 }, r: 15, rx: 19, ry: 7 }
  };
  {
    const PO = G.A.datos.piezas.cabeza.ojos; OJOS.d.poli = PO.derecho; OJOS.i.poli = PO.izquierdo;
    for (const o of Object.values(OJOS)) {                         // párpado superior remuestreado (como en el montaje)
      const P = o.arriba.map(q => ({ x: q[0], y: q[1] })), d = [0];
      for (let i = 1; i < P.length; i++) d.push(d[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
      o.U = []; const L = d[d.length - 1];
      for (let k = 0; k < 14; k++) { const s = L * k / 13; let i = 1; while (i < d.length - 1 && d[i] < s) i++; const f = (s - d[i - 1]) / Math.max(1e-6, d[i] - d[i - 1]); o.U.push({ x: lerp(P[i - 1].x, P[i].x, f), y: lerp(P[i - 1].y, P[i].y, f) }); }
    }
  }
  function ojo(g, o, m, escIris) {             // igual que el globo del ojo del montaje, con su propia mirada
    const C = G.C;
    g.save(); g.beginPath(); g.moveTo(o.poli[0][0], o.poli[0][1]); for (let i = 1; i < o.poli.length; i++) g.lineTo(o.poli[i][0], o.poli[i][1]); g.closePath();
    g.fillStyle = C.blanco; g.fill(); g.clip();
    const ix = o.c.x + o.rx * m.x, iy = o.c.y + o.ry * m.y, r = o.r * escIris;
    g.fillStyle = C.iris; g.beginPath(); g.arc(ix, iy, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = C.irisLuz; g.beginPath(); g.ellipse(ix, iy + r * 0.32, r * 0.7, r * 0.55, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#120806"; g.beginPath(); g.arc(ix, iy + r * 0.05, r * 0.46, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(ix - r * 0.36, iy - r * 0.34, r * 0.3, r * 0.24, -0.4, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(ix + r * 0.38, iy + r * 0.36, r * 0.12, 0, Math.PI * 2); g.fill();
    g.strokeStyle = C.ojoSombra; g.lineWidth = 9; g.beginPath(); g.moveTo(o.U[0].x, o.U[0].y); for (let i = 1; i < o.U.length; i++) g.lineTo(o.U[i].x, o.U[i].y); g.stroke();
    g.restore();
  }
  function formaBoca(g, b) {
    const hw = 44 * (b.ancho ?? 1), s = b.sonrisa ?? 0, o = Math.max(0, b.abre ?? 0);
    const yL = -8 * s, yR = -10 * s, ySup = 12 * s + 2 - o * 0.35, yInf = 12 * s + 2 + o * 1.25;
    g.beginPath(); g.moveTo(-hw, yL); g.quadraticCurveTo(0, ySup, hw, yR); g.bezierCurveTo(hw * 0.78, yInf, -hw * 0.78, yInf * 1.04, -hw, yL); g.closePath();
  }
  function capaCara(g, p, k) {
    const C = G.C, f = p.cara;
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    if (k.nariz > 0.01) {                      // nariz colorada del golpe
      g.globalAlpha = 0.6 * k.nariz; g.fillStyle = "#ff5a4e";
      g.beginPath(); g.ellipse(876, 660, 24, 17, -0.5, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 0.8 * k.nariz; g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(882, 650, 6, 3.5, -0.5, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 1;
    }
    if (k.lg > 0.01) {                         // lengua fuera por la comisura (concentración)
      const b = f.boca, hw = 44 * (b.ancho ?? 1), yR = -10 * (b.sonrisa ?? 0);
      g.save(); g.translate(BOCA_C.x, BOCA_C.y); g.rotate(BOCA_ANG); g.translate(hw * 0.62, yR + 2); g.rotate(-0.25); g.scale(k.lg, k.lg);
      g.beginPath(); g.moveTo(-16, -2); g.bezierCurveTo(-18, 30, 16, 34, 15, -2); g.closePath();
      g.fillStyle = C.lengua; g.fill(); g.lineWidth = 5; g.strokeStyle = C.tinta; g.stroke();
      g.strokeStyle = "rgba(120,20,20,0.6)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 4); g.lineTo(0, 16); g.stroke();
      g.lineWidth = 6.5; g.strokeStyle = C.tinta; g.beginPath(); g.moveTo(-24, -4); g.quadraticCurveTo(0, 2, 24, -3); g.stroke();
      g.restore();
    }
    if (k.boca) {                              // el tercero, ya dentro: desaparece al cerrar la boca
      g.save(); g.translate(BOCA_C.x, BOCA_C.y); g.rotate(BOCA_ANG); formaBoca(g, k.boca.b); g.clip();
      g.rotate(-BOCA_ANG); g.translate(-BOCA_C.x, -BOCA_C.y);
      const q = TR.bocaCaza, e = 1 / (S * 0.6);
      g.translate(q.x - 8 * k.boca.k * Math.sin(BOCA_ANG), q.y + 8 * k.boca.k * Math.cos(BOCA_ANG)); g.rotate(TR[3].angPortrait); g.scale(e, e);
      dibCacahuete(g, 0, 0, 0);
      g.restore();
    }
    if (k.bz > 0.001) { ojo(g, OJOS.d, k.md, f.iris ?? 1); ojo(g, OJOS.i, k.mi, f.iris ?? 1); }
    g.restore();
  }

  /* ---------- cacahuete (px de pantalla) ---------- */
  function dibCacahuete(g, x, y, rot) {
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(1.3, 1.3);
    const L = 2.8, r1 = 3.3, r2 = 3.0;
    g.fillStyle = "#0b0a0e";
    g.beginPath(); g.arc(-L, 0, r1 + 1.2, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(L, 0.2, r2 + 1.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#d9a15c"; g.beginPath(); g.arc(-L, 0, r1, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(L, 0.2, r2, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#b9803f"; g.beginPath(); g.ellipse(-L + 0.4, 1.3, r1 * 0.75, r1 * 0.45, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(L + 0.3, 1.4, r2 * 0.7, r2 * 0.42, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#f3cf94"; g.beginPath(); g.ellipse(-L - 0.6, -1.3, 1.5, 0.9, -0.3, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(L - 0.5, -1.1, 1.2, 0.75, -0.3, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(110,62,22,0.75)"; g.lineWidth = 0.6;
    g.beginPath(); g.moveTo(-L - 1.6, -0.8); g.lineTo(-L + 1.2, 1.4); g.moveTo(-L + 0.6, -2); g.lineTo(-L - 1.2, 1.6); g.moveTo(L - 1, -0.6); g.lineTo(L + 1.2, 1.2); g.stroke();
    g.restore();
  }
  function estelas(g, q) {                     // rayitas de velocidad detrás del cacahuete
    if (!q || q.vel < 700) return;
    const k = clamp((q.vel - 700) / 600);
    g.save(); g.strokeStyle = `rgba(255,248,225,${0.55 * k})`; g.lineCap = "round"; g.lineWidth = 1.6;
    for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(q.x + i * 4, q.y - 9); g.lineTo(q.x + i * 4, q.y - 9 - 16 * k * (1 - Math.abs(i) * 0.3)); g.stroke(); }
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrellaPuntas(g, x, y, r, puntas, rot, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function toc(g, t, t0, x, y, tam) {          // golpecito: estrella pequeña y rayas
    const k = fase(t, t0, t0 + 0.26); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    estrellaPuntas(g, x, y, tam * (0.5 + 0.7 * salida(k)), 8, 0.2, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2; g.strokeStyle = "#0b0a0e"; g.stroke();
    g.strokeStyle = "#ffffff"; g.lineWidth = 2.5; g.lineCap = "round";
    for (let i = 0; i < 7; i++) { const a = -Math.PI * 0.95 + i / 6 * Math.PI * 0.9, r0 = tam * (0.9 + 0.8 * k), r1 = r0 + tam * 0.45; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  function crunch(g, t, p) {                   // al masticar: rayitas junto al carrillo
    if (t < T.caza + 0.2 || t > T.triunfo0) return;
    const q = deRetrato(p, { x: 950, y: 720 });
    g.save(); g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineCap = "round"; g.lineWidth = 2;
    for (let n = 0; n < 3; n++) {
      const k = fase((t - T.caza - 0.2) * (15 / (2 * Math.PI)) - n, 0, 0.5); if (k <= 0 || k >= 1) continue;
      g.globalAlpha = Math.sin(Math.PI * k);
      for (let i = -1; i <= 1; i++) { const a = -0.2 + i * 0.5, r0 = 8 + 6 * k; g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * (r0 + 6), q.y + Math.sin(a) * (r0 + 6)); g.stroke(); }
    }
    g.restore();
  }
  function sombraCacahuete(g, q) {
    if (!q) return;
    const h = clamp(1 - (SUELO - q.y) / 220); if (h <= 0.02) return;
    g.save(); g.globalAlpha = 0.35 * h; g.fillStyle = "#000"; g.beginPath(); g.ellipse(q.x, SUELO + 1, 6 * (0.6 + 0.4 * h), 1.8, 0, 0, Math.PI * 2); g.fill(); g.restore();
  }

  /* ---------- decorado: taberna granate, suelo de damero y mesa alta ---------- */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60);
    const BASE_PARED = 518;
    const pared = g.createLinearGradient(0, -60, 0, BASE_PARED); pared.addColorStop(0, "#1e0710"); pared.addColorStop(0.6, "#4a1424"); pared.addColorStop(1, "#5c1a2b");
    g.fillStyle = pared; g.fillRect(-40, -60, W + 80, BASE_PARED + 60);
    // papel pintado de rayas
    for (let x = -40; x < W + 40; x += 36) { g.fillStyle = "rgba(255,190,150,0.035)"; g.fillRect(x, -60, 18, BASE_PARED + 60); }
    g.strokeStyle = "rgba(255,200,120,0.06)"; g.lineWidth = 1;
    for (let x = -31; x < W + 40; x += 36) for (let y = -50; y < 360; y += 30) { g.beginPath(); g.arc(x, y + ((x / 36) % 2) * 15, 3, 0, Math.PI * 2); g.stroke(); }
    // luz cálida general
    const foco = g.createRadialGradient(480, 280, 30, 480, 280, 520);
    foco.addColorStop(0, "rgba(255,170,110,0.32)"); foco.addColorStop(0.55, "rgba(200,90,70,0.12)"); foco.addColorStop(1, "rgba(120,30,40,0)");
    g.fillStyle = foco; g.fillRect(-40, -60, W + 80, BASE_PARED + 60);
    // estantería con botellas (izquierda)
    const botellas = (y0, n, x0, x1, sem) => {
      for (let i = 0; i < n; i++) {
        const x = lerp(x0, x1, (i + 0.5) / n) + (hash(sem + i) - 0.5) * 6, h = 50 + hash(sem + i + 20) * 26, w = 15 + hash(sem + i + 40) * 7;
        const col = ["#2f6b3a", "#7a3a12", "#c9a24a", "#3b4f7a", "#8a1f2a", "#d8d2c0"][Math.floor(hash(sem + i + 60) * 6)];
        g.fillStyle = col; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.2;
        g.beginPath(); g.moveTo(x - w / 2, y0); g.lineTo(x - w / 2, y0 - h * 0.62); g.quadraticCurveTo(x - w / 2, y0 - h * 0.78, x - w * 0.18, y0 - h * 0.84);
        g.lineTo(x - w * 0.18, y0 - h); g.lineTo(x + w * 0.18, y0 - h); g.lineTo(x + w * 0.18, y0 - h * 0.84); g.quadraticCurveTo(x + w / 2, y0 - h * 0.78, x + w / 2, y0 - h * 0.62);
        g.lineTo(x + w / 2, y0); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(x - w / 2 + 3, y0 - h * 0.6, 2.5, h * 0.5);
        g.fillStyle = "rgba(255,240,215,0.7)"; g.fillRect(x - w / 2 + 2, y0 - h * 0.38, w - 4, h * 0.16);
      }
    };
    g.fillStyle = "#2a130c"; g.fillRect(36, 92, 238, 290); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(36, 92, 238, 290);
    const fondoEst = g.createLinearGradient(0, 92, 0, 382); fondoEst.addColorStop(0, "#3b1a10"); fondoEst.addColorStop(1, "#1c0b06");
    g.fillStyle = fondoEst; g.fillRect(44, 100, 222, 274);
    for (const [y, n, s] of [[190, 7, 3], [290, 6, 17], [372, 7, 31]]) {
      const luz = g.createLinearGradient(0, y - 80, 0, y); luz.addColorStop(0, "rgba(255,190,110,0)"); luz.addColorStop(1, "rgba(255,190,110,0.28)");
      g.fillStyle = luz; g.fillRect(44, y - 80, 222, 80);
      botellas(y, n, 52, 258, s);
      g.fillStyle = "#6a3a1e"; g.fillRect(40, y, 230, 9); g.fillStyle = "#9a6038"; g.fillRect(40, y, 230, 2.5); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.strokeRect(40, y, 230, 9);
    }
    // letrero de neón con forma de cacahuete (sin letras)
    const neon = (fn, col, glow) => { g.save(); g.lineCap = "round"; g.lineJoin = "round";
      for (const [w, a] of [[22, 0.07], [14, 0.12], [8, 0.25]]) { g.strokeStyle = glow.replace("A", a); g.lineWidth = w; fn(); g.stroke(); }
      g.strokeStyle = col; g.lineWidth = 4.5; fn(); g.stroke(); g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 1.6; fn(); g.stroke(); g.restore(); };
    const NX = 822, NY = 138;
    g.fillStyle = "#170409"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.beginPath(); g.roundRect ? g.roundRect(NX - 120, NY - 70, 240, 140, 18) : g.rect(NX - 120, NY - 70, 240, 140); g.fill(); g.stroke();
    neon(() => { g.beginPath(); g.arc(NX - 30, NY, 44, -0.652, 0.652, true); g.arc(NX + 32, NY, 38, 2.362, -2.362, true); g.closePath(); },
      "#ffb2d6", "rgba(255,80,170,A)");
    neon(() => { g.beginPath(); for (const [x0, y0, x1, y1] of [[-62, -14, -44, 4], [-48, -22, -30, -4], [-26, 8, -10, 24], [26, -16, 44, 2], [44, -10, 62, 8], [30, 12, 48, 28]]) { g.moveTo(NX + x0, NY + y0); g.lineTo(NX + x1, NY + y1); } },
      "#bff6ff", "rgba(60,220,255,A)");
    // lámpara colgante sobre la mesa
    g.strokeStyle = "#0a0a0c"; g.lineWidth = 3; g.beginPath(); g.moveTo(MESA.x, -60); g.lineTo(MESA.x, 96); g.stroke();
    const cono = g.createLinearGradient(0, 120, 0, 330); cono.addColorStop(0, "rgba(255,226,160,0.32)"); cono.addColorStop(1, "rgba(255,226,160,0)");
    g.fillStyle = cono; g.beginPath(); g.moveTo(MESA.x - 30, 122); g.lineTo(MESA.x + 30, 122); g.lineTo(MESA.x + 130, 330); g.lineTo(MESA.x - 130, 330); g.closePath(); g.fill();
    const halo = g.createRadialGradient(MESA.x, 120, 4, MESA.x, 120, 120); halo.addColorStop(0, "rgba(255,220,150,0.6)"); halo.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = halo; g.beginPath(); g.arc(MESA.x, 120, 120, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#1f5a3e"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(MESA.x - 8, 94); g.lineTo(MESA.x + 8, 94); g.lineTo(MESA.x + 38, 122); g.lineTo(MESA.x - 38, 122); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#3f8f66"; g.beginPath(); g.moveTo(MESA.x - 4, 98); g.lineTo(MESA.x - 26, 118); g.lineTo(MESA.x - 18, 118); g.closePath(); g.fill();
    g.fillStyle = "#fff0c4"; g.beginPath(); g.ellipse(MESA.x, 122, 30, 5, 0, 0, Math.PI * 2); g.fill();
    // zócalo de madera con barandilla de latón
    const z = g.createLinearGradient(0, 372, 0, BASE_PARED); z.addColorStop(0, "#3a1d10"); z.addColorStop(1, "#24110a");
    g.fillStyle = z; g.fillRect(-40, 372, W + 80, BASE_PARED - 372);
    g.strokeStyle = "rgba(0,0,0,0.45)"; g.lineWidth = 2.5;
    for (let x = -30; x < W + 40; x += 96) { g.strokeRect(x + 8, 392, 80, BASE_PARED - 410); }
    g.strokeStyle = "rgba(255,200,140,0.08)"; g.lineWidth = 1.5; for (let x = -30; x < W + 40; x += 96) { g.beginPath(); g.moveTo(x + 10, 394); g.lineTo(x + 86, 394); g.stroke(); }
    g.fillStyle = "#c9953a"; g.fillRect(-40, 366, W + 80, 7); g.fillStyle = "#f1cf7a"; g.fillRect(-40, 366, W + 80, 2); g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(-40, 373, W + 80, 4);
    // suelo de damero en perspectiva
    const Y0 = BASE_PARED, Y1 = H + 60, VX = 512, VY = -620;
    const filas = []; for (let i = 0; i <= 8; i++) filas.push(Y0 + (Y1 - Y0) * Math.pow(i / 8, 1.35));
    const xEn = (xb, y) => VX + (xb - VX) * (y - VY) / (Y1 - VY);
    for (let i = 0; i < 8; i++) for (let j = -9; j < 9; j++) {
      const xa = VX + j * 92, xb = xa + 92, ya = filas[i], yb = filas[i + 1];
      g.fillStyle = (i + j) % 2 ? "#e6d4b0" : "#2a1416";
      g.beginPath(); g.moveTo(xEn(xa, ya), ya); g.lineTo(xEn(xb, ya), ya); g.lineTo(xEn(xb, yb), yb); g.lineTo(xEn(xa, yb), yb); g.closePath(); g.fill();
    }
    const brillo = g.createLinearGradient(0, Y0, 0, Y1); brillo.addColorStop(0, "rgba(40,10,15,0.55)"); brillo.addColorStop(0.35, "rgba(40,10,15,0.15)"); brillo.addColorStop(1, "rgba(0,0,0,0.35)");
    g.fillStyle = brillo; g.fillRect(-40, Y0, W + 80, Y1 - Y0);
    const charco = g.createRadialGradient(470, 560, 10, 470, 560, 300); charco.addColorStop(0, "rgba(255,200,140,0.22)"); charco.addColorStop(1, "rgba(255,200,140,0)");
    g.fillStyle = charco; g.fillRect(-40, Y0, W + 80, Y1 - Y0);
    g.fillStyle = "#1a0b06"; g.fillRect(-40, BASE_PARED - 8, W + 80, 10); g.fillStyle = "#4a2614"; g.fillRect(-40, BASE_PARED - 8, W + 80, 2);
    // mesa alta: pie, tablero, cuenco de cacahuetes y una caña
    g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse(MESA.x + 6, 538, 70, 9, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#1b1a1f"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 3;
    g.beginPath(); g.ellipse(MESA.x, 532, 46, 9, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    const col = g.createLinearGradient(MESA.x - 8, 0, MESA.x + 8, 0); col.addColorStop(0, "#2c2a30"); col.addColorStop(0.4, "#8d8a92"); col.addColorStop(1, "#1d1c21");
    g.fillStyle = col; g.fillRect(MESA.x - 7, MESA.y + 10, 14, 520 - MESA.y); g.strokeRect(MESA.x - 7, MESA.y + 10, 14, 520 - MESA.y);
    g.fillStyle = "#4a2414"; g.beginPath(); g.ellipse(MESA.x, MESA.y + 9, 88, 16, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    const tab = g.createLinearGradient(MESA.x - 88, 0, MESA.x + 88, 0); tab.addColorStop(0, "#6b3519"); tab.addColorStop(0.5, "#9b5a2c"); tab.addColorStop(1, "#5a2b13");
    g.fillStyle = tab; g.beginPath(); g.ellipse(MESA.x, MESA.y, 88, 16, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = "#d9a54a"; g.lineWidth = 1.5; g.beginPath(); g.ellipse(MESA.x, MESA.y, 82, 13, 0, 0.2, Math.PI - 0.2); g.stroke();
    // caña
    const KX = 598, KY = 316;
    g.fillStyle = "rgba(214,236,255,0.25)"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(KX - 13, KY - 48); g.lineTo(KX + 13, KY - 48); g.lineTo(KX + 10, KY); g.lineTo(KX - 10, KY); g.closePath(); g.fill();
    g.fillStyle = "#f5aa1d"; g.beginPath(); g.moveTo(KX - 12, KY - 30); g.lineTo(KX + 12, KY - 30); g.lineTo(KX + 10, KY - 2); g.lineTo(KX - 10, KY - 2); g.closePath(); g.fill();
    g.fillStyle = "#fff8e8"; g.beginPath(); g.moveTo(KX - 12.5, KY - 38); g.lineTo(KX + 12.5, KY - 38); g.lineTo(KX + 12, KY - 30); g.lineTo(KX - 12, KY - 30); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,0.6)"; g.fillRect(KX - 9, KY - 44, 3, 38);
    g.beginPath(); g.moveTo(KX - 13, KY - 48); g.lineTo(KX + 13, KY - 48); g.lineTo(KX + 10, KY); g.lineTo(KX - 10, KY); g.closePath(); g.stroke();
    // cuenco con cacahuetes
    const BX = CUENCO.x, BY = 306;
    for (let i = 0; i < 16; i++) { const a = hash(i + 70) * Math.PI * 2, r = Math.sqrt(hash(i + 90)); dibCacahuete(g, BX + Math.cos(a) * r * 20, BY - 4 - Math.abs(Math.sin(a)) * r * 5 - (1 - r) * 6, hash(i + 110) * 6); }
    g.fillStyle = "#e9e4da"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.4;
    g.beginPath(); g.moveTo(BX - 27, BY - 2); g.bezierCurveTo(BX - 26, BY + 14, BX + 26, BY + 14, BX + 27, BY - 2); g.quadraticCurveTo(BX, BY + 6, BX - 27, BY - 2); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "#2f6fb2"; g.lineWidth = 2; g.beginPath(); g.moveTo(BX - 25, BY + 3); g.bezierCurveTo(BX - 18, BY + 8, BX + 18, BY + 8, BX + 25, BY + 3); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.8)"; g.beginPath(); g.ellipse(BX - 14, BY + 4, 5, 2.2, 0.2, 0, Math.PI * 2); g.fill();
    // viñeta
    const v = g.createRadialGradient(470, 300, 290, 470, 300, 700); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.6)");
    g.fillStyle = v; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }

  /* ---------- cámara ---------- */
  let FOCOS = null;
  function camara(t) {
    if (!FOCOS) { const a = poseBase(T.golpe1, true), b = poseBase(T.caza + 0.55, true), c = poseBase(T.guino0 + 0.6, true);
      FOCOS = { nariz: G.aPantalla(a, G.centroCabeza(a)), mastica: G.aPantalla(b, G.centroCabeza(b)), guino: G.aPantalla(c, G.centroCabeza(c)) }; }
    // plano general (cuerpo entero) con primeros planos en el golpe, al masticar y en el guiño
    let k = 1.1, x = 452, y = 326;
    const zoom = (w, c, kk) => { x = lerp(x, c.x, w); y = lerp(y, c.y, w); k = lerp(k, kk, w); };
    zoom(tramo(t, T.apunta0, T.lanza3, suave) * (1 - tramo(t, T.caza + 0.05, T.caza + 0.4, suave)), { x: 462, y: 336 }, 1.2);
    zoom(tramo(t, T.golpe1 - 0.02, T.golpe1 + 0.2, suave) * (1 - tramo(t, T.bizcoFin + 0.05, T.sacude1 + 0.25, suave)), { x: FOCOS.nariz.x + 20, y: FOCOS.nariz.y + 40 }, 1.75);
    zoom(tramo(t, T.caza + 0.05, T.caza + 0.4, suave) * (1 - tramo(t, T.triunfo0 - 0.12, T.triunfo0 + 0.2, suave)), { x: FOCOS.mastica.x + 20, y: FOCOS.mastica.y + 45 }, 1.7);
    zoom(tramo(t, T.guino0 + 0.05, T.guino0 + 0.55, suave), { x: FOCOS.guino.x + 30, y: FOCOS.guino.y + 90 }, 1.4);
    const abre=tramo(t,T.salto0-.15,T.salto0)*(1-tramo(t,T.salto1,T.salto1+.15));
    k=lerp(k,1.03,abre);y=lerp(y,326,abre);
    return { k, x, y };
  }

  const temblor=t=>[[T.golpe1,2.5],[T.caza,3],[T.salto1,3]].reduce((v,[a,f])=>v+(t>=a?f*Math.exp(-(t-a)*9)*tramo(t,a,a+.035):0),0);

  class GuillermoCacahuetes extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo()) return;
      if (!fondo) fondo = creaFondo();
      const p = pose(t);
      const luz = tramo(t, NEGRO_INICIO, 0.75, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = temblor(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -40, -60);
      g.save(); g.fillStyle = "rgba(0,0,0,0.38)"; g.beginPath(); g.ellipse(p.x + 6, SUELO + 1, 105 * (1 - 0.25 * campana(t, T.salto0, T.salto1)), 9, 0, 0, Math.PI * 2); g.fill(); g.restore();
      const c1 = cacahuete(1, t), c2 = cacahuete(2, t), c3 = cacahuete(3, t);
      sombraCacahuete(g, c1); sombraCacahuete(g, c2); sombraCacahuete(g, c3);
      // el segundo, ya en lo alto, pasa por detrás de Guillermo y cae a su espalda
      const detras = t > T.lanza2 + 0.4;
      if (c2 && detras) dibCacahuete(g, c2.x, c2.y, c2.rot);
      G.dibujar(g, p, t);
      for (const q of [c1, detras ? null : c2, t<T.caza?c3:null]) if (q) { estelas(g, q); dibCacahuete(g, q.x, q.y, q.rot); }
      toc(g, t, T.golpe1, TR[1].b.x + 10, TR[1].b.y - 2, 13);
      crunch(g, t, p);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00008.2", nombre: "Guillermo y los cacahuetes", crear: () => new GuillermoCacahuetes() });
  window.__A2D_00008_2 = { pose, T, DUR, camara, temblor, enMano, deRetrato, dentroBoca, NARIZ, apoyoCacahuete, dibCacahuete, SUELO, trayectorias:()=> (TR||preparaTrayectorias(),TR), cacahuete: (i, t) => (TR || preparaTrayectorias(), cacahuete(i, t)) };
})();
