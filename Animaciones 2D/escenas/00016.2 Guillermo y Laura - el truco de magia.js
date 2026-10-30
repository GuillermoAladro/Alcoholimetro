"use strict";
/* 00016.2 · Guillermo y Laura · El truco de magia
 *
 * Negro → rincón de magia de un bar (papel pintado verde con estrellas doradas, carteles de una
 * chistera y de unas cartas, mesita con chistera y varita). Guillermo, muy chulo, hace de mago para
 * Laura: mueve los dedos, le enseña una moneda, la tapa, sacude las manos… y la moneda desaparece
 * (Laura levanta el pulgar) → le guiña a cámara, se acerca y hace como que se la saca de detrás de la oreja a
 * Laura… pero abre la mano y no hay nada → mira a cámara muerto de vergüenza, vuelve a su sitio y se
 * mira la manga: asoma la punta de un pañuelo. Tira… y sale otro, y otro, y otro: una ristra
 * infinita de pañuelos de colores anudados que se amontona a sus pies. Laura primero se aguanta la
 * risa y luego se parte → él se rinde y suelta la ristra → Laura se le acerca de puntillas, le saca
 * la moneda de detrás de la oreja y, ¡pop!, una paloma blanca le sale del pelo y se va volando →
 * Guillermo se queda boquiabierto mirando a cámara; Laura lanza la moneda al aire con el pulgar, la
 * caza y guiña un ojo → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, L = Laura;
  const S = 0.30, SUELO = 556, XG0 = 372, XL0 = 668;
  const DUR = 14.6;
  const T = {
    mira: 0.45, saca: 0.95, magia0: 1.2, magia1: 1.95, moneda: 1.95, muestra: 2.35,
    cubre0: 2.75, cubre1: 3.0, sacude1: 3.3, abre: 3.4, aplauso: 3.6, guino: 3.85,
    paso0: 4.25, paso1: 4.85, alcanza0: 4.45, alcanza1: 4.95, hurga1: 5.3, saca1: 5.6, abreV: 5.72,
    camara: 6.3, vuelve0: 6.65, vuelve1: 7.15, orden: 7.25, manga0: 7.1, manga1: 7.45, asoma: 7.38, agarra: 7.62,
    tira0: 7.7, aguanta: 7.9, risa: 8.75,
    acerca0: 10.65, acerca1: 11.2, hurgaL0: 11.25, hurgaL1: 11.65, muestraL: 11.92,
    pop: 12.2, flip0: 12.75, flip1: 13.2, guinoL: 13.3, fin: 13.75
  };
  // tirones de la ristra: [tirar, volver a coger] (cada vez más rápidos)
  const TIRONES = [[0.42, 0.24], [0.34, 0.2], [0.28, 0.16], [0.24, 0.14], [0.36, 0]];
  const TIR = [];
  { let t0 = T.tira0; for (const [a, b] of TIRONES) { TIR.push({ t0, t1: t0 + a, t2: t0 + a + b }); t0 += a + b; } }
  const ULT = TIR[TIR.length - 1];
  T.cola = ULT.t0 + 0.25;                       // en el último tirón sale por fin la cola de la ristra
  T.suelta = ULT.t1 + 0.32;                     // la sostiene en alto, mira el montón… y la suelta
  T.rinde = T.suelta + 0.05;

  /* ---------- utilidades de posturas ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const rot = (q, a) => ({ x: q.x * Math.cos(a) - q.y * Math.sin(a), y: q.x * Math.sin(a) + q.y * Math.cos(a) });
  const D = (pu, ix, re) => ({ pulgar: pu, indice: ix, medio: re, anular: re, menique: re });
  const R_MG = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_MG, y: m.y - Math.sin(mu) * R_MG });
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, -1.75), l: punoDesde({ x: 372, y: 648 }, -1.75) };
  const BOLS_L = { c: L.BOLSILLO_C, l: L.BOLSILLO_L };
  // pinza entre el pulgar y el índice (unidades de mano, antes de girar por mu), como en la 00013
  const PINZA = { x: 10.5, y: 14 }, ESC_MANO_L = 0.88;
  const pinzaLocal = (mu, esc) => rot({ x: PINZA.x * esc, y: PINZA.y * esc }, mu + Math.PI / 2);
  const pinzaHoja = (m, esc) => { const q = rot(pinzaLocal(m.mu, esc), m.ang || 0); return { x: m.x + q.x * G.JK, y: m.y + q.y * G.JK }; };
  const manoDesdePinza = (obj, mu, ang, esc) => { const q = rot(pinzaLocal(mu, esc), ang); return { x: obj.x - q.x * G.JK, y: obj.y - q.y * G.JK }; };

  function limitaMinimo(A,p,m,h,minimo) {
    const w=A.rotP({x:Math.cos(m.mu)*A.MUNECA_R*A.JK,y:Math.sin(m.mu)*A.MUNECA_R*A.JK},m.ang||0);
    const dx=m.x+w.x-h.x,dy=m.y+w.y-h.y,d=Math.hypot(dx,dy),dd=(d+minimo+Math.sqrt((d-minimo)**2+4))/2;
    m.x+=dx*(dd/Math.max(d,.001)-1);m.y+=dy*(dd/Math.max(d,.001)-1);
  }
  /* ---------- caras (se mezclan) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, wd: 0, wi: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12,
    dientes: 1, lengua: 0, mof: 0, rub: 0, rojo: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, extraC, esp = 0) {
    const c = clamp(e.c + extraC);
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: esp, ojos: { d: clamp(c + e.wd), i: clamp(c + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* ---------- pasos (x de pantalla de cada tobillo) ---------- */
  function pie(lista, t, y0, alto) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    const arco = Math.sin(Math.PI * u);
    return { x: lerp(xa, x, suave5(u)), y: y0 - alto * arco, ang: -0.18 * arco };
  }

  /* ================= Guillermo ================= */
  const DX_G = 112;                    // paso hacia Laura para sacarle la moneda de la oreja
  const PASOS_G = {
    cerca: [[-10, -9, XG0 - 19], [T.paso0 + 0.27, T.paso1, XG0 - 19 + DX_G], [T.vuelve0, T.vuelve0 + 0.3, XG0 - 19]],
    lejos: [[-10, -9, XG0 + 18], [T.paso0, T.paso0 + 0.32, XG0 + 18 + DX_G], [T.vuelve0 + 0.22, T.vuelve1, XG0 + 18]]
  };
  const CG = {
    inicio: E({ mx: 0.85, orig: 0, sonr: 0.3 }),
    chulo: E({ mx: -0.8, my: -0.05, sd: 14, gd: 0.12, si: -2, gi: -0.05, orig: 0, sonr: 0.62, ancho: 0.95 }),
    magia: E({ mx: 0.75, my: 0.35, c: 0.25, sd: -6, si: 18, gd: -0.12, gi: 0.2, orig: 0, abre: 9, ancho: 0.6, sonr: 0.1 }),
    muestra: E({ mx: 0.9, my: -0.05, sd: 16, si: 16, gd: 0.12, gi: 0.12, orig: 0, sonr: 0.65, ancho: 1 }),
    concentra: E({ mx: 0.6, my: 0.4, c: 0.35, sd: -9, si: -9, gd: -0.2, gi: -0.2, orig: 0, abre: 2, ancho: 0.7, sonr: 0 }),
    tachan: E({ mx: 0.9, my: -0.1, iris: 1.05, sd: 22, si: 22, gd: 0.1, gi: 0.1, orig: 0, abre: 30, ancho: 1.1, sonr: 0.9 }),
    guino: E({ mx: -0.85, my: -0.1, wd: 1, h: 0.85, sd: 6, si: 16, gi: 0.12, orig: 0, abre: 6, sonr: 0.85, ancho: 1 }),
    seguro: E({ mx: 0.85, my: -0.15, c: 0.2, sd: 4, si: 14, gd: -0.05, gi: 0.12, orig: 0, sonr: 0.7, ancho: 0.95 }),
    vacio: E({ mx: 0.55, my: 0.35, iris: 0.72, sd: 24, si: 24, gd: 0.05, gi: 0.05, orig: 0, abre: 10, ancho: 0.55, sonr: -0.2 }),
    verguenza: E({ mx: -0.85, my: 0, c: 0.2, h: 0.3, sd: 12, si: 12, gd: 0.3, gi: 0.3, orig: 0, abre: 4, ancho: 1.05, sonr: 0.55, rub: 0.9, rojo: 0.15 }),
    manga: E({ mx: -0.25, my: 0.45, sd: 8, si: 14, gd: 0.05, gi: 0.12, orig: 0, abre: 0, ancho: 0.85, sonr: 0.05 }),
    aja: E({ mx: -0.2, my: 0.4, iris: 1.08, sd: 20, si: 20, gd: 0.1, gi: 0.1, orig: 0, abre: 14, ancho: 0.9, sonr: 0.75 }),
    tira: E({ mx: 0.5, my: 0.3, c: 0.15, sd: 10, si: 10, gd: 0.05, gi: 0.05, orig: 0, abre: 6, ancho: 0.9, sonr: 0.3 }),
    extrana: E({ mx: 0.6, my: 0.45, iris: 0.85, sd: 20, si: 6, gd: 0.18, gi: -0.08, orig: 0, abre: 8, ancho: 0.65, sonr: -0.25 }),
    esfuerzo: E({ mx: 0.5, my: 0.2, c: 0.85, z: 1, sd: -8, si: -8, gd: -0.22, gi: -0.22, orig: 0, abre: 10, ancho: 1.15, sonr: -0.55, rub: 0.5, rojo: 0.45 }),
    rendido: E({ mx: 0.4, my: 0.6, c: 0.55, sd: -2, si: -2, gd: 0.32, gi: 0.32, orig: 0, abre: 3, ancho: 0.8, sonr: -0.6, rojo: 0.15 }),
    nota: E({ mx: 0.9, my: -0.35, iris: 1.05, sd: 14, si: 14, gd: 0.12, gi: 0.12, orig: 0, abre: 4, ancho: 0.7, sonr: -0.15 }),
    asombro: E({ mx: 0.35, my: -0.85, iris: 0.7, sd: 28, si: 28, gd: 0.06, gi: 0.06, orig: 0, abre: 46, ancho: 0.75, sonr: -0.1, lengua: 0.3 }),
    pasmado: E({ mx: -0.85, my: -0.05, iris: 0.75, sd: 26, si: 26, gd: 0.08, gi: 0.08, orig: 0, abre: 40, ancho: 0.72, sonr: -0.15, lengua: 0.3 })
  };
  const GUION_CG = [
    [T.mira, T.mira + 0.3, "chulo"], [T.magia0 - 0.1, T.magia0 + 0.2, "magia"], [T.moneda, T.moneda + 0.25, "muestra"],
    [T.cubre0 - 0.05, T.cubre0 + 0.15, "concentra"], [T.abre - 0.04, T.abre + 0.12, "tachan"], [T.guino, T.guino + 0.18, "guino"],
    [T.paso0 + 0.15, T.paso0 + 0.45, "seguro"], [T.abreV - 0.05, T.abreV + 0.15, "vacio"], [T.camara, T.camara + 0.3, "verguenza"],
    [T.manga0 + 0.05, T.manga0 + 0.3, "manga"], [T.asoma + 0.02, T.asoma + 0.18, "aja"], [T.tira0 + 0.05, T.tira0 + 0.3, "tira"],
    [TIR[1].t0, TIR[1].t0 + 0.25, "extrana"], [TIR[2].t0, TIR[2].t0 + 0.25, "esfuerzo"], [T.cola, T.cola + 0.12, "vacio"], [T.rinde, T.rinde + 0.35, "rendido"],
    [T.hurgaL0 + 0.05, T.hurgaL0 + 0.35, "nota"], [T.pop - 0.02, T.pop + 0.1, "asombro"], [T.flip0 + 0.1, T.flip0 + 0.45, "pasmado"]
  ];
  const PARP_G = [0.3, 1.55, 4.15, 6.95, 9.95, 11.45];

  // cuerpo: dx (px), pel (hoja, + agacha), torso (+ hacia delante), cab, tex; manos respecto a su hombro (hoja):
  // cercana c*, lejana l*; cp/lp fuera del bolsillo (0..1); dedos: 1 pulgar, 2 índice, 3 el resto
  const P0G = { dx: 0, pel: 0, torso: 0, cab: 0, tex: 1,
    cx: 0, cy: 300, ca: 0, cmu: -1.75, cp: 0, c1: 0.3, c2: 0.3, c3: 0.3,
    lx: 0, ly: 280, la: 0, lmu: -1.75, lp: 0, l1: 0.3, l2: 0.3, l3: 0.3 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    bols: CuG({}),
    chulo: CuG({ torso: -0.03, cab: -0.04 }),
    magia: CuG({ pel: 10, torso: 0.04, cab: 0.06, cx: 155, cy: -10, cmu: 1.75, cp: 1, c1: 0.9, c2: 1, c3: 1, lx: 30, ly: -18, lmu: 1.35, lp: 1, l1: 0.9, l2: 1, l3: 1 }),
    muestra: CuG({ pel: 4, torso: 0.06, cab: 0, cx: 165, cy: 70, cmu: -2.7 + 2 * Math.PI, cp: 1, c1: 1, c2: 1, c3: 1, lx: 100, ly: -55, lmu: 2.15, lp: 1, l1: 0.72, l2: 0.8, l3: 0.12 }),
    cubre: CuG({ pel: 8, torso: 0.08, cab: 0.05, cx: 318, cy: -6, cmu: 2.9, cp: 1, c1: 0.6, c2: 0.65, c3: 0.6, lx: 62, ly: -6, lmu: 2.15, lp: 1, l1: 0.1, l2: 0.15, l3: 0.1 }),
    puños: CuG({ pel: 14, torso: 0.06, cab: 0.06, cx: 300, cy: 4, cmu: 2.6, cp: 1, c1: 0, c2: 0, c3: 0, lx: 52, ly: 4, lmu: 2.2, lp: 1, l1: 0, l2: 0, l3: 0 }),
    tachan: CuG({ pel: 0, torso: -0.04, cab: -0.05, cx: -60, cy: -20, cmu: 1.7, cp: 1, c1: 1, c2: 1, c3: 1, lx: 135, ly: -95, lmu: 2.1, lp: 1, l1: 1, l2: 1, l3: 1 }),
    guino: CuG({ pel: 0, torso: -0.05, cab: -0.06, cx: -50, cy: 30, cmu: 1.7, cp: 1, c1: 1, c2: 1, c3: 1, lx: 120, ly: -40, lmu: 2.1, lp: 1, l1: 1, l2: 1, l3: 1 }),
    alcanza: CuG({ dx: DX_G, pel: 6, torso: 0.1, cab: 0.02, cp: 0, lp: 1, lmu: 2.36, l1: 0.6, l2: 0.9, l3: 0.75 }),
    mira: CuG({ dx: DX_G, pel: 10, torso: 0.08, cab: 0.1, cp: 0, lx: 70, ly: -30, lmu: 3.0, la: 0, lp: 1, l1: 1, l2: 1, l3: 1 }),
    camara: CuG({ dx: DX_G, pel: 6, torso: 0.02, cab: -0.02, cp: 0, lx: 40, ly: 40, lmu: 2.6, lp: 1, l1: 0.8, l2: 0.9, l3: 0.9 }),
    vuelve: CuG({ dx: 0, pel: 0, torso: 0, cab: 0, cp: 0, lp: 0, lmu: -1.75 + 2 * Math.PI }),
    manga: CuG({ pel: 6, torso: -0.02, cab: 0.14, cp: 0, lp: 1, lmu: 2.9, l1: 0.72, l2: 0.8, l3: 0.12 }),
    tira: CuG({ pel: 12, torso: -0.05, cab: 0.08, cp: 0, lp: 1, lmu: 2.9, l1: 0.72, l2: 0.8, l3: 0.12 }),
    rendido: CuG({ dx: 4, pel: 30, torso: 0.2, cab: 0.2, cp: 0, lx: 70, ly: 270, lmu: -1.6 + 2 * Math.PI, lp: 1, l1: 0.5, l2: 0.55, l3: 0.5 }),
    asombro: CuG({ dx: 0, pel: 4, torso: -0.06, cab: -0.14, cx: 170, cy: 20, cmu: 2.0 - 2 * Math.PI, cp: 1, c1: 1, c2: 1, c3: 1, lx: 110, ly: -20, lmu: 2.1, lp: 1, l1: 1, l2: 1, l3: 1 })
  };
  const GUION_G = [
    [T.mira, T.mira + 0.4, "chulo"], [T.saca, T.magia0 + 0.15, "magia"], [T.moneda, T.muestra, "muestra"],
    [T.cubre0, T.cubre1, "cubre"], [T.cubre1, T.cubre1 + 0.12, "puños"], [T.abre - 0.02, T.abre + 0.16, "tachan", salida],
    [T.guino, T.guino + 0.3, "guino"], [T.paso0, T.alcanza1, "alcanza"], [T.saca1 - 0.25, T.abreV, "mira"], [T.camara, T.camara + 0.3, "camara"],
    [T.vuelve0, T.vuelve1, "vuelve"], [T.manga0, T.manga1, "manga"], [T.tira0, T.tira0 + 0.3, "tira"], [T.rinde, T.rinde + 0.45, "rendido"],
    [T.pop - 0.05, T.pop + 0.38, "asombro"]
  ];
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };

  // punto de la manga cercana de donde sale la ristra (hoja)
  const MANGA = { x: 112, y: 398 };
  function cuerpoG(t) {
    const b = linea(GUION_G, CUER_G, "bols", t);
    const respira = Math.sin(t * 2.3 + 0.4);
    // tirones: el cuerpo se echa atrás en cada uno
    let echa = 0;
    for (const r of TIR) echa += campana(t, r.t0, r.t1 + 0.12) * 0.07;
    const sac = (t > T.cubre1 && t < T.sacude1) ? Math.sin((t - T.cubre1) * 40) * campana(t, T.cubre1, T.sacude1) : 0;
    const p = {
      x: XG0 + b.dx, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 },
      torso: b.torso - echa, torsoEsc: { x: b.tex, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.02 * sac, dx: 0, dy: 0, esc: { x: 1, y: 1 } }, tirasLimpias: true, ikContinuo: true, hombrosContinuos: true, hombrosRecortados: true, b, sac
    };
    // la paloma le sale del pelo: sacudida de la cabeza
    const pop = t >= T.pop ? Math.exp(-(t - T.pop) * 7) * suave(fase(t, T.pop, T.pop + 0.05)) : 0;
    p.cabeza.dy -= 10 * pop; p.cabeza.esc = { x: 1 - 0.04 * pop, y: 1 + 0.06 * pop };
    // pies
    for (const lado of ["cerca", "lejos"]) {
      const f = pie(PASOS_G[lado], t, TOB_G[lado], 46);
      p.piernas[lado] = { tob: { x: G.PELVIS.x + (f.x - p.x) / S, y: f.y }, ang: f.ang };
    }
    // cara
    const e = linea(GUION_CG, CG, "inicio", t);
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.rojo = e.rojo; p.sudor = 0.9 * tramo(t, T.camara, T.camara + 0.3) * (1 - tramo(t, T.manga0, T.manga1)) + 0.8 * tramo(t, TIR[1].t0, TIR[2].t0) * (1 - tramo(t, T.rinde + 0.4, T.acerca1));
    return p;
  }

  // trayectoria de la mano que tira de la ristra (pinza, hoja)
  function tiron(t) {
    // A: junto a la manga (la coge); B: lejos (abajo a la derecha, cada vez más)
    for (let i = 0; i < TIR.length; i++) {
      const r = TIR[i], A = { x: MANGA.x + 32, y: MANGA.y + 6 }, B = i === TIR.length - 1 ? { x: 590, y: 330 } : { x: 585 + 6 * i, y: 480 + 10 * i };
      if (t < r.t0) return null;
      if (t <= r.t1) { const k = suave5(fase(t, r.t0, r.t1)); return { q: { x: lerp(A.x, B.x, k), y: lerp(A.y, B.y, k) + 30 * Math.sin(Math.PI * k) }, tirando: true, i }; }
      if (t <= r.t2 || i === TIR.length - 1) {
        const k = suave(fase(t, r.t1, r.t2));
        if (i === TIR.length - 1) return { q: { x: B.x + 6 * Math.sin((t - r.t1) * 9) * campana(t, r.t1, T.suelta), y: B.y }, tirando: false, i };
        return { q: { x: lerp(B.x, A.x, k), y: lerp(B.y, A.y, k) - 26 * Math.sin(Math.PI * k) }, tirando: false, i };
      }
    }
    return null;
  }

  function poseG(t) {
    const p = cuerpoG(t), b = p.b;
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    // mano cercana
    let c = { x: hc.x + b.cx, y: hc.y + b.cy };
    c = mezcla(Tr(BOLS_G.c), c, clamp(b.cp * 1.5));
    c.y += 150*Math.sin(Math.PI*salida(fase(t,T.abre-.02,T.abre+.16)));
    const mov = Math.sin(t * 19), mov2 = Math.sin(t * 23 + 1.3);     // dedos que se mueven («abracadabra»)
    const menea = campana(t, T.magia0, T.magia1 + 0.2);
    p.manoCerca = { x: c.x, y: c.y, ang: b.ca, mu: b.cmu, dobla: -1, puno: b.cp,
      dedos: D(clamp(b.c1 - 0.25 * menea * (0.5 + 0.5 * mov2)), clamp(b.c2 - 0.45 * menea * (0.5 + 0.5 * mov)), clamp(b.c3 - 0.45 * menea * (0.5 - 0.5 * mov))) };
    // mano lejana
    let l = { x: hl.x + b.lx, y: hl.y + b.ly }, lmu = b.lmu, lang = b.la;
    l = mezcla(Tr(BOLS_G.l), l, clamp(b.lp * 1.5));
    // sacude los puños
    if (p.sac) { c.y += 10 * p.sac; l.y += 10 * p.sac; p.manoCerca.y = c.y; }
    // alcanza la oreja de Laura (sien del lado de la cara) y hurga
    const alc = suave5(fase(t, T.alcanza0, T.alcanza1)) * (1 - suave5(fase(t, T.hurga1, T.saca1)));
    if (alc > 0.0005) {
      const pL = cuerpoL(t), H = L.cabeza(pL);
      const sien = L.aPantalla(pL, H.a({ x: 1002, y: 548 }));
      const hurga = campana(t, T.alcanza1 - 0.05, T.hurga1);
      const obj = G.aHoja(p, { x: sien.x - 4 + 3 * Math.sin(t * 30) * hurga, y: sien.y + 6 });
      const m = manoDesdePinza(obj, 2.36, 0, 1);
      l = mezcla(l, m, alc); lmu = lerp(lmu, 2.36, alc);
    }
    // tira de la ristra
    const tr = ristraMano(t);
    if (tr.k > 0.0005) {
      const m = manoDesdePinza(tr.q, 2.9, 0, 1);
      l = mezcla(l, m, tr.k); lmu = lerp(lmu, 2.9, tr.k);
    }
    const ld = D(b.l1, b.l2, b.l3);
    // la mano lejana: pinza al coger la punta del pañuelo; suelta al rendirse
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: -1, puno: b.lp, dedos: ld };
    if (t > T.suelta) { const a = tramo(t, T.suelta, T.suelta + 0.12); p.manoLejos.dedos = D(lerp(ld.pulgar, 0.9, a), lerp(ld.indice, 0.9, a), lerp(ld.medio, 0.7, a)); }
    limitaMinimo(G,p,p.manoCerca,hc,88);
    // moneda en la pinza de la mano lejana (hasta que la tapa)
    return p;
  }

  /* ================= Laura ================= */
  const DX_L1 = 28, DX_L2 = 108, MU_L = 2.36 - 2 * Math.PI;      // MU_L: dedos hacia arriba y hacia delante
  const TOB_L = L.SUELO - L.TOBILLO_ALTO;
  // pies en x de pantalla (mira a la izquierda: el pie lejano es el de delante)
  const PASOS_L = {
    lejos: [[-10, -9, XL0 - 16], [T.moneda + 0.05, T.moneda + 0.35, XL0 - 16 - DX_L1], [T.acerca0, T.acerca0 + 0.3, XL0 - 16 - DX_L2]],
    cerca: [[-10, -9, XL0 + 14], [T.moneda + 0.25, T.moneda + 0.55, XL0 + 14 - DX_L1], [T.acerca0 + 0.26, T.acerca1, XL0 + 14 - DX_L2 + 18]]
  };
  const CL = {
    inicio: E({ mx: 0.85, orig: 1 }),
    ceja: E({ mx: 0.9, my: -0.05, sd: 2, si: 18, gd: -0.06, gi: 0.16, orig: 0, sonr: 0.35, ancho: 0.85 }),
    curiosa: E({ mx: 0.8, my: 0.25, iris: 1.08, sd: 14, si: 14, gd: 0.08, gi: 0.08, orig: 0, abre: 3, ancho: 0.7, sonr: 0.3 }),
    oh: E({ mx: 0.85, my: 0.1, iris: 0.95, sd: 22, si: 22, gd: 0.08, gi: 0.08, orig: 0, abre: 16, ancho: 0.55, sonr: 0.2 }),
    aplaude: E({ mx: 0.9, c: 0.5, h: 1, sd: 14, si: 14, orig: 0, abre: 10, ancho: 1, sonr: 0.85, rub: 0.3 }),
    divertida: E({ mx: 0.9, my: -0.25, c: 0.15, sd: 6, si: 16, gd: 0, gi: 0.12, orig: 0, sonr: 0.62, ancho: 0.9 }),
    aguanta: E({ mx: 0.85, my: 0.1, c: 0.9, h: 1, sd: 12, si: 12, gd: 0.12, gi: 0.12, orig: 0, abre: 0, ancho: 0.7, sonr: 0.5, mof: 0.55, rub: 0.5 }),
    mira: E({ mx: 0.85, my: 0.35, iris: 1.05, sd: 16, si: 16, gd: 0.08, gi: 0.08, orig: 0, abre: 6, ancho: 0.8, sonr: 0.55, rub: 0.2 }),
    risa: E({ mx: 0.5, my: -0.3, c: 1, h: 1, sd: 16, si: 16, gd: 0.16, gi: 0.16, orig: 0, abre: 34, ancho: 1.1, sonr: 0.95, rub: 0.6 }),
    picara: E({ mx: 0.9, my: -0.2, c: 0.25, sd: 4, si: 16, gd: -0.04, gi: 0.14, orig: 0, sonr: 0.6, ancho: 0.9 }),
    muestra: E({ mx: 0.9, my: -0.1, sd: 16, si: 18, gd: 0.06, gi: 0.12, orig: 0, abre: 5, sonr: 0.8, ancho: 1 }),
    sigue: E({ mx: 0.4, my: -0.8, iris: 1.05, sd: 18, si: 18, gd: 0.06, gi: 0.06, orig: 0, abre: 8, ancho: 0.8, sonr: 0.6 }),
    guino: E({ mx: -0.85, my: -0.1, wd: 1, h: 0.85, sd: 6, si: 16, gi: 0.1, orig: 0, sonr: 0.85, ancho: 0.95, rub: 0.2 })
  };
  const GUION_CL = [
    [T.saca, T.saca + 0.3, "ceja"], [T.moneda, T.moneda + 0.3, "curiosa"], [T.abre - 0.02, T.abre + 0.12, "oh"],
    [T.aplauso, T.aplauso + 0.15, "aplaude"], [T.paso0 + 0.2, T.paso0 + 0.5, "divertida"], [T.abreV + 0.1, T.abreV + 0.35, "aguanta"],
    [T.manga0, T.manga0 + 0.3, "mira"], [T.aguanta + 0.6, T.aguanta + 0.9, "aguanta"], [T.risa, T.risa + 0.25, "risa"],
    [T.rinde + 0.25, T.acerca0, "picara"], [T.muestraL - 0.2, T.muestraL + 0.1, "muestra"], [T.pop + 0.05, T.pop + 0.3, "sigue"],
    [T.guinoL, T.guinoL + 0.2, "guino"]
  ];
  const PARP_L = [0.75, 2.8, 4.25, 6.05, 10.2, 11.95, 12.45];

  const P0L = { dx: 0, pel: 0, torso: 0, cab: 0,
    cx: 0, cy: 300, cmu: -1.75, cp: 0, c1: 0.3, c2: 0.3, c3: 0.3,
    lx: 0, ly: 300, lmu: -1.75, lp: 0, l1: 0.3, l2: 0.3, l3: 0.3 };
  const CuL = o => Object.assign({}, P0L, o);
  const CUER_L = {
    bols: CuL({}),
    ceja: CuL({ cab: -0.05, torso: -0.02 }),
    curiosa: CuL({ dx: DX_L1, pel: 8, torso: 0.13, cab: 0.07 }),
    aplaude: CuL({ dx: DX_L1, pel: 4, torso: 0.04, cab: -0.04, lx: 95, ly: 70, lmu: -Math.PI, lp: 1, l1: 1, l2: 0, l3: 0 }),
    divertida: CuL({ dx: DX_L1, pel: 2, torso: -0.05, cab: -0.08 }),
    tapa: CuL({ dx: DX_L1, pel: 10, torso: 0.06, cab: 0.06, lx: -18, ly: -176, lmu: 1.85, lp: 1, l1: 0.85, l2: 1, l3: 1 }),
    mira: CuL({ dx: DX_L1, pel: 4, torso: 0.02, cab: 0.04 }),
    risa: CuL({ dx: DX_L1, pel: 22, torso: -0.1, cab: -0.16, lx: -40, ly: 215, lmu: 0.15, lp: 1, l1: 0.9, l2: 1, l3: 1 }),
    picara: CuL({ dx: DX_L1, pel: 0, torso: 0, cab: -0.04 }),
    acerca: CuL({ dx: DX_L2, pel: -36, torso: 0.16, cab: -0.04, lp: 1, lmu: MU_L, l1: 0.72, l2: 0.8, l3: 0.12 }),
    muestra: CuL({ dx: DX_L2, pel: -6, torso: 0.02, cab: -0.04, lx: 95, ly: -125, lmu: 2.2 - 2 * Math.PI, lp: 1, l1: 0.72, l2: 0.8, l3: 0.12 }),
    lanza: CuL({ dx: DX_L2, pel: 0, torso: -0.02, cab: -0.06, lx: 80, ly: -40, lmu: 2.6 - 2 * Math.PI, lp: 1, l1: 0.4, l2: 0.25, l3: 0.15 })
  };
  const GUION_L = [
    [T.saca, T.saca + 0.4, "ceja"], [T.moneda, T.moneda + 0.55, "curiosa"], [T.aplauso - 0.15, T.aplauso + 0.1, "aplaude"],
    [T.aplauso + 0.6, T.paso0 + 0.4, "divertida"], [T.abreV + 0.05, T.abreV + 0.48, "tapa"], [T.manga0 - 0.1, T.manga0 + 0.3, "mira"],
    [T.aguanta + 0.5, T.aguanta + 0.8, "tapa"], [T.risa, T.risa + 0.3, "risa"], [T.rinde + 0.2, T.rinde + 0.55, "picara"],
    [T.acerca0, T.acerca1, "acerca"], [T.hurgaL1, T.muestraL, "muestra"], [T.flip0 - 0.25, T.flip0, "lanza"]
  ];

  function cuerpoL(t) {
    const b = linea(GUION_L, CUER_L, "bols", t);
    const respira = Math.sin(t * 2.1 + 1.3);
    // risa: el cuerpo da saltitos
    const rie = campana(t, T.risa, T.rinde + 0.4);
    const salto = rie * Math.abs(Math.sin((t - T.risa) * 11)) * 10;
    const p = {
      x: XL0 - b.dx, suelo: SUELO, s: S, espejo: true,
      pelvis: { x: L.PELVIS.x, y: L.PELVIS.y + b.pel + respira * 1.1 - salto * 0.6 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 + salto * 0.0012 },
      piernas: {}, cabeza: { ang: b.cab + 0.04 * Math.sin((t - T.risa) * 11) * rie, dx: 0, dy: 0, esc: { x: 1, y: 1 } }, tirasLimpias: true, ikContinuo: true, b
    };
    // se aparta un poco cuando él le hurga en la oreja
    const aparta = campana(t, T.alcanza1 - 0.15, T.saca1 + 0.1);
    p.cabeza.ang -= 0.06 * aparta; p.torso -= 0.03 * aparta;
    // pies (de puntillas al alcanzarle la cabeza)
    const punt = tramo(t, T.acerca1 - 0.25, T.acerca1 + 0.05) * (1 - tramo(t, T.muestraL, T.muestraL + 0.35));
    for (const lado of ["cerca", "lejos"]) {
      const f = pie(PASOS_L[lado], t, TOB_L - (lado === "lejos" ? 10 : 0), 40);
      const ang = f.ang + 0.42 * punt, a=L.rotP(L.PUNTA,f.ang), z=L.rotP(L.PUNTA,ang);
      p.piernas[lado] = { tob: { x: L.aHoja(p, { x: f.x, y: 0 }).x+a.x-z.x, y: f.y+a.y-z.y }, ang };
    }
    // melena: inercia al inclinarse y al reírse
    const b2 = linea(GUION_L, CUER_L, "bols", t - 0.12);
    p.pelo = { inercia: clamp(-0.6 * (b.torso - b2.torso) / 0.12, -0.8, 0.8) + 0.25 * Math.sin((t - T.risa) * 11) * rie, viento: 0.1 * Math.sin(t * 1.1) };
    // cara
    const e = linea(GUION_CL, CL, "inicio", t);
    p.cara = cara(e, parpadeo(t, PARP_L, 0.13));
    if (rie > 0) p.cara.boca.abre += 6 * Math.sin((t - T.risa) * 22) * rie;
    p.rojo = e.rojo;
    return p;
  }
  function poseL(t) {
    const p = cuerpoL(t), b = p.b;
    const Tr = L.tronco(p), hc = Tr(L.HOMBRO_C), hl = Tr(L.HOMBRO);
    // pulgar arriba de aprobación: un par de meneos
    const apl = campana(t, T.aplauso, T.aplauso + 0.55) * Math.sin((t - T.aplauso) * 22);
    let c = { x: hc.x + b.cx, y: hc.y + b.cy };
    c = mezcla(Tr(BOLS_L.c), c, clamp(b.cp * 1.5));
    p.manoCerca = { x: c.x, y: c.y, ang: 0, mu: b.cmu, dobla: -1, puno: b.cp, dedos: D(b.c1, b.c2, b.c3) };
    let l = { x: hl.x + b.lx, y: hl.y + b.ly - 8 * apl }, lmu = b.lmu;
    l = mezcla(Tr(BOLS_L.l), l, clamp(b.lp * 1.5));
    for(const [a,b] of [[T.abreV+.05,T.abreV+.48],[T.manga0-.1,T.manga0+.3],[T.aguanta+.5,T.aguanta+.8],[T.risa,T.risa+.3]]) l.x+=100*Math.sin(Math.PI*fase(t,a,b));
    // le saca la moneda de la oreja a Guillermo (sien del lado de la cara)
    const alc = suave5(fase(t, T.acerca0 + 0.15, T.hurgaL0)) * (1 - suave5(fase(t, T.hurgaL1, T.muestraL)));
    if (alc > 0.0005) {
      const pG = cuerpoG(t), H = G.cabeza(pG);
      const sien = G.aPantalla(pG, H.a({ x: 985, y: 560 }));
      const hurga = campana(t, T.hurgaL0 - 0.05, T.hurgaL1);
      const obj = L.aHoja(p, { x: sien.x + 3 * Math.sin(t * 30) * hurga, y: sien.y + 4 });
      const m = manoDesdePinza(obj, MU_L, 0, ESC_MANO_L);
      l = mezcla(l, m, alc); lmu = lerp(lmu, MU_L, alc);
    }
    p.manoLejos = { x: l.x, y: l.y, ang: 0, mu: lmu, dobla: 1, puno: b.lp, dedos: D(b.l1, b.l2, b.l3) };
    // lanza la moneda con el pulgar y la caza
    const lanza = campana(t, T.flip0 - 0.05, T.flip0 + 0.12), caza = campana(t, T.flip1 - 0.08, T.flip1 + 0.15);
    if (lanza > 0) p.manoLejos.dedos = D(lerp(b.l1, 1, lanza), lerp(b.l2, 0.2, lanza), b.l3);
    if (caza > 0) p.manoLejos.dedos = D(lerp(b.l1, 0.15, caza), lerp(b.l2, 0.15, caza), lerp(b.l3, 0.1, caza));
    p.manoLejos.y -= 6 * caza;
    limitaMinimo(L,p,p.manoLejos,hl,74);
    return p;
  }
  const pose = t => ({ g: poseG(t), l: poseL(t) });

  /* ---------- moneda ---------- */
  function moneda(g, x, y, rx, ry, brillo) {
    g.save(); g.translate(x, y);
    g.fillStyle = "#b97f12"; g.beginPath(); g.ellipse(0.6, 0.9, rx, ry, 0, 0, Math.PI * 2); g.fill();
    const gr = g.createLinearGradient(-rx, -ry, rx, ry); gr.addColorStop(0, "#fff2a6"); gr.addColorStop(0.5, "#f5c43a"); gr.addColorStop(1, "#c58a14");
    g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.lineWidth = 1.1; g.strokeStyle = "#4a3000"; g.stroke();
    g.strokeStyle = "rgba(120,80,0,0.6)"; g.lineWidth = 0.8; g.beginPath(); g.ellipse(0, 0, rx * 0.66, ry * 0.66, 0, 0, Math.PI * 2); g.stroke();
    if (brillo > 0.05) { g.fillStyle = `rgba(255,255,255,${0.9 * brillo})`; g.beginPath(); g.ellipse(-rx * 0.35, -ry * 0.38, rx * 0.28, ry * 0.18, -0.5, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // en la pinza de la mano (unidades de mano: el marco ya está girado y escalado por la mano)
  function monedaEnPinza(g, t, mu, esc, brillo, crece = 1) {
    if (crece <= 0.01) return;
    const q = pinzaLocal(mu, esc);
    moneda(g, q.x + 1.5, q.y - 1, 6.5 * esc * crece, 5.2 * esc * crece, brillo);
  }
  function destello(g, x, y, k, r, rotacion = 0.3) {
    if (k <= 0.01) return;
    g.save(); g.globalAlpha = clamp(k); g.fillStyle = "#ffffff"; g.translate(x, y); g.rotate(rotacion);
    g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.22 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill();
    g.restore();
  }
  // nubecilla de magia con estrellitas (al desaparecer la moneda y al salir la paloma)
  function puf(g, t, t0, x, y, tam) {
    const k = fase(t, t0, t0 + 0.55); if (k <= 0 || k >= 1) return;
    g.save();
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2 + 0.4, d = tam * (0.35 + 0.9 * salida(k)) * (0.7 + 0.5 * hash(i + 31));
      g.globalAlpha = 0.85 * (1 - k); g.fillStyle = i % 2 ? "#ffffff" : "#e9e3ff";
      g.beginPath(); g.arc(x + Math.cos(a) * d * 0.6, y + Math.sin(a) * d * 0.45 - 10 * k, tam * (0.28 + 0.25 * k), 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * Math.PI * 2 + 1.1, d = tam * (0.5 + 1.3 * salida(k));
      destello(g, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8 - 14 * k, (1 - k) * 1.1, 5 + 3 * hash(i + 7), i);
    }
    g.restore();
  }

  /* ---------- la ristra de pañuelos ---------- */
  // Modelo: la ristra es una cadena de pañuelos anudados («u» desde la punta que salió primero).
  // P = lo que ha salido de la manga, Q = lo que ya descansa en el montón. Entre el montón y la manga
  // la ristra cuelga de la pinza de Guillermo (tramo colgante) y va tensa de la pinza a la manga.
  // P solo crece mientras tira (no resbala por la pinza); al volver a coger, la pinza se desliza por la
  // ristra. En el último tirón sale la cola: el extremo de la manga se va hacia la pinza.
  const SP = 29;                                     // de nudo a nudo (pantalla): cada pañuelo va de pico a pico
  const PL = 13, PW = 11.5;                           // media diagonal a lo largo de la ristra y medio ancho
  const COLORES = ["#e8343f", "#f7c331", "#2f8be0", "#3cc46b", "#a457d8", "#ff8a2a", "#ff5fa2", "#22c3c9"];
  const PILA = { x: XG0 + 100, y: SUELO + 6 };
  const CAP = [6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1, 1];
  function huecoPila(j) {       // dónde queda el pañuelo j del montón (de abajo arriba, revuelto)
    let r = 0, n = j;
    while (n >= (CAP[r] || 1)) { n -= (CAP[r] || 1); r++; }
    const cap = CAP[r] || 1;
    const x = PILA.x + (n - (cap - 1) / 2) * 19 + (hash(j * 3.1 + 2) - 0.5) * 10 + (r % 2 ? 6 : -4);
    const y = PILA.y - r * 10 - 5 * Math.sin(Math.PI * (n + 0.5) / cap) + (hash(j * 1.7) - 0.5) * 4;
    return { x, y, a: (hash(j * 5.3) - 0.5) * 5, e: 0.95 + 0.25 * hash(j * 2.9) };
  }
  // mano que sujeta la ristra (hoja): coge la punta en la manga y sigue los tirones hasta soltarla
  function ristraMano(t) {
    if (t < T.manga0) return { k: 0 };
    const r = tiron(t);
    const coge = suave5(fase(t, T.manga0 + 0.05, T.manga1));
    const A = { x: MANGA.x + 32, y: MANGA.y + 6 };
    return { k: coge * (1 - tramo(t, T.suelta, T.suelta + 0.3)), q: r ? r.q : A };
  }
  let TABLA = null;
  const mangaPantalla = pG => G.aPantalla(pG, G.tronco(pG)(MANGA));
  function puntoMano(t, pG) {        // pantalla: dónde agarra la ristra la pinza (o el extremo suelto)
    if (t < T.agarra) return mezcla(mangaPantalla(pG),G.aPantalla(pG,pinzaHoja(pG.manoLejos,1)),suave(fase(t,T.asoma,T.agarra)));
    if (t <= T.suelta) return G.aPantalla(pG, pinzaHoja(pG.manoLejos, 1));
    // la suelta: el extremo cae al montón
    const k = entrada(fase(t, T.suelta, T.suelta + 0.45));
    const P0 = TABLA.suelta, fin = { x: PILA.x - 18, y: PILA.y - 40 };
    return { x: lerp(P0.x, fin.x, k), y: lerp(P0.y, fin.y, k) };
  }
  // extremo de la ristra del lado de la manga: dentro de la manga hasta que sale la cola
  function origen(t, pG, Hm) {
    const O = mangaPantalla(pG), k = suave(fase(t, T.cola, T.cola + 0.24));
    return k <= 0 ? O : { x: lerp(O.x, Hm.x, k) + 26 * Math.sin(Math.PI * k), y: lerp(O.y, Hm.y, k) - 20 * Math.sin(Math.PI * k) };
  }
  function preparaRistra() {
    const dt = 1 / 240, n = Math.ceil((DUR - T.asoma) / dt) + 2;
    const P = new Float32Array(n), Q = new Float32Array(n);
    const pS = poseG(T.suelta);
    TABLA = { dt, P, Q, suelta: G.aPantalla(pS, pinzaHoja(pS.manoLejos, 1)) };
    let p = 0, q = 0, dPrev = 0;
    for (let i = 0; i < n; i++) {
      const t = T.asoma + i * dt, pG = poseG(t), Hm = puntoMano(t, pG), O = origen(t, pG, Hm);
      const d = Math.hypot(Hm.x - O.x, Hm.y - O.y);
      if (t < T.agarra) p = 13 * suave(fase(t, T.asoma, T.agarra - 0.05));         // asoma la punta
      else if (t < T.cola) { const r = tiron(t); if (r && r.tirando) p += Math.max(0, d - dPrev); p = Math.max(p, d + 2); }
      dPrev = d;
      const top = huecoPila(Math.floor(q / SP));
      const hg = Math.hypot(Hm.x - top.x, Hm.y - top.y);
      q = Math.min(p, Math.max(q, p - d - hg - 6, 0));
      P[i] = p; Q[i] = q;
    }
    TABLA.total = p;
  }
  function leeTabla(arr, t) {
    if (t <= T.asoma) return 0;
    const u = (t - T.asoma) / TABLA.dt, i = Math.min(arr.length - 2, Math.floor(u)), f = u - i;
    return lerp(arr[i], arr[i + 1], f);
  }
  // tensión del tramo manga → mano (al tirar se tensa) y vaivén del tramo que cuelga (se queda atrás al
  // tirar y se balancea al parar)
  function tension(t) { let k = 0; for (const r of TIR) k = Math.max(k, tramo(t, r.t0, r.t0 + 0.08) * (1 - tramo(t, r.t1, r.t1 + 0.14))); return k; }
  function vaiven(t) {
    let v = 0;
    for (const r of TIR) { v -= 16 * campana(t, r.t0, r.t1 + 0.05); if (t > r.t1) v += 20 * Math.exp(-(t - r.t1) * 3.2) * Math.sin((t - r.t1) * 9); }
    if (t > T.suelta) v += 10 * Math.exp(-(t - T.suelta) * 4) * Math.sin((t - T.suelta) * 10);
    return v;
  }
  // un pañuelo de seda cuadrado, cogido por dos picos opuestos (los nudos), con pliegue y ondulación
  function panuelo(g, x, y, a, tam, k, fl, cola, arrugado, esc = 1) {
    const color = cola ? "#fbf6ec" : COLORES[k % COLORES.length];
    const L = PL, Wd = PW * (arrugado ? 0.7 : 1);
    g.save(); g.translate(x, y); g.rotate(a); g.scale(tam * esc, tam * esc * (arrugado ? 0.82 : 1));
    const B = { x: -L, y: 0 }, F = { x: L, y: 0 }, S1 = { x: 0.6 * fl, y: Wd + fl }, S2 = { x: -0.4 * fl, y: -Wd + 0.5 * fl };
    const lado = (P, Q) => { const m = { x: (P.x + Q.x) / 2, y: (P.y + Q.y) / 2 }; g.quadraticCurveTo(m.x * 1.22, m.y * 1.22, Q.x, Q.y); };
    const forma = () => { g.beginPath(); g.moveTo(B.x, B.y); lado(B, S2); lado(S2, F); lado(F, S1); lado(S1, B); g.closePath(); };
    forma(); g.fillStyle = color; g.fill();
    g.save(); forma(); g.clip();
    if (cola || k % 8 === 5) { g.fillStyle = cola ? "#e8343f" : "#fbf6ec"; for (const [px, py] of [[-6, -2], [0, 4], [5, -4], [-1, -6], [7, 2], [-7, 5], [2, -1]]) { g.beginPath(); g.arc(px, py, 1.9, 0, Math.PI * 2); g.fill(); } }
    else if (k % 8 === 2) { g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 1.8; for (const o of [-7, -1, 5]) { g.beginPath(); g.moveTo(-15, o - 7); g.lineTo(15, o + 7); g.stroke(); } }
    g.fillStyle = "rgba(255,255,255,0.32)"; g.beginPath(); g.moveTo(B.x, B.y); g.quadraticCurveTo(0, -2 + fl * 0.3, F.x, F.y); g.lineTo(S2.x, S2.y); g.closePath(); g.fill();
    g.fillStyle = "rgba(0,0,0,0.2)"; g.beginPath(); g.moveTo(B.x, B.y); g.quadraticCurveTo(0, 2 + fl * 0.3, F.x, F.y); g.lineTo(S1.x, S1.y); g.closePath(); g.fill();
    g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = 1; g.beginPath(); g.moveTo(B.x + 2, B.y); g.quadraticCurveTo(0, 2 + fl * 0.3, F.x - 2, F.y); g.stroke();
    if (arrugado) { g.beginPath(); g.moveTo(-4, -5); g.lineTo(2, 4); g.moveTo(3, -6); g.lineTo(6, 1); g.stroke(); }
    g.restore();
    forma(); g.lineWidth = 1.7 / (tam * esc); g.strokeStyle = "#0b0a0e"; g.lineJoin = "round"; g.stroke();
    g.restore();
  }
  function nudo(g, x, y, a, tam, k) {
    g.save(); g.translate(x, y); g.rotate(a); g.scale(tam, tam);
    g.lineWidth = 1.5; g.strokeStyle = "#0b0a0e"; g.fillStyle = COLORES[(k + 1) % COLORES.length];
    g.beginPath(); g.moveTo(0, 0); g.lineTo(-2, 6); g.lineTo(1.5, 5); g.closePath(); g.fill(); g.stroke();      // puntitas del nudo
    g.beginPath(); g.moveTo(0, 0); g.lineTo(3, 6); g.lineTo(5, 3); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = COLORES[k % COLORES.length]; g.beginPath(); g.ellipse(0, 0, 3.4, 2.8, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
  }
  function enlaces(t, pG) {
    const P = leeTabla(TABLA.P, t), Q = Math.min(leeTabla(TABLA.Q, t), P);
    const Hm = puntoMano(t, pG), O = origen(t, pG, Hm);
    const d = Math.hypot(Hm.x - O.x, Hm.y - O.y);
    // tramo colgante: del montón a la mano, en catenaria con la holgura que sobre y con vaivén
    const jt = Q / SP, j0 = Math.floor(jt), f = jt - j0;
    const a0 = huecoPila(j0), a1 = huecoPila(j0 + 1), top = { x: lerp(a0.x, a1.x, f), y: lerp(a0.y, a1.y, f) - 6 };
    const cuerda = Math.max(1, Math.hypot(top.x - Hm.x, top.y - Hm.y));
    const Hfree = Math.max(0, P - Q - d);              // lo que cuelga de la mano
    const Hlen = Math.max(cuerda, Hfree);
    const colgando = Hfree < cuerda;                   // aún no llega al montón: la punta cuelga en el aire
    const dir = { x: (top.x - Hm.x) / cuerda, y: (top.y - Hm.y) / cuerda };
    const sag = Math.sqrt(Math.max(0, 3 * (Hlen - cuerda) * cuerda / 8));
    const nx = (Hm.y - top.y) / cuerda, ny = -(Hm.x - top.x) / cuerda;           // normal a la cuerda
    const sg = nx >= 0 ? 1 : -1;
    const vv = vaiven(t);
    const cp = { x: (Hm.x + top.x) / 2 + 2 * sag * nx * sg + vv, y: (Hm.y + top.y) / 2 + 2 * sag * ny * sg };
    const bez = (A, C, M, u) => ({ x: (1 - u) * (1 - u) * A.x + 2 * u * (1 - u) * M.x + u * u * C.x, y: (1 - u) * (1 - u) * A.y + 2 * u * (1 - u) * M.y + u * u * C.y,
      a: Math.atan2(2 * (1 - u) * (M.y - A.y) + 2 * u * (C.y - M.y), 2 * (1 - u) * (M.x - A.x) + 2 * u * (C.x - M.x)) });
    // tramo manga → mano: casi recto al tirar, con algo de comba al aflojar
    const combaT = 3 + 14 * (1 - tension(t));
    const mT = { x: (Hm.x + O.x) / 2, y: (Hm.y + O.y) / 2 + combaT * 2 };
    const total = TABLA.total, N = Math.ceil(Math.min(P, total) / SP), out = [];
    for (let k = 0; k < N; k++) {
      const u = Math.min(k * SP + SP / 2, total - 2);
      const fuera = clamp((P - (u - SP / 2)) / SP);
      if (fuera <= 0) continue;
      let q;
      if (u < Q) { const h = huecoPila(k); q = { x: h.x, y: h.y, a: h.a, e: h.e, pila: true }; }
      else {
        const s2 = u - Q;
        if (colgando && s2 <= Hfree) { const r = Hfree - s2, bal = (0.1 * Math.sin(t * 4 + k * 0.3) + vv / 160) * r / 60;
          const c = Math.cos(bal), sn = Math.sin(bal);
          q = { x: Hm.x + (dir.x * c - dir.y * sn) * r, y: Hm.y + (dir.x * sn + dir.y * c) * r, a: Math.atan2(dir.y, dir.x) + bal + Math.PI, pila: false }; }
        else if (!colgando && s2 <= Hlen) { const c = bez(top, Hm, cp, clamp(s2 / Hlen)); q = { x: c.x, y: c.y, a: c.a, pila: false }; }
        else { const r = Math.min(d, s2 - (colgando ? Hfree : Hlen)), c = bez(Hm, O, mT, clamp(r / Math.max(1, d)));
          q = { x: c.x, y: c.y, a: c.a + Math.PI, pila: false }; }
      }
      if (fuera < 1) { q.x = lerp(O.x, q.x, fuera); q.y = lerp(O.y, q.y, fuera); }
      q.cola = t >= T.cola && k === N - 1;
      q.tam = (0.35 + 0.65 * fuera) * (q.cola ? 1.08 : 1); q.k = k; out.push(q);
    }
    return out;
  }
  function ristra(g, t, pG, capa) {
    if (t < T.asoma || !TABLA) return;
    const links = enlaces(t, pG);
    if (capa === "pila") { for (const q of links) if (q.pila) panuelo(g, q.x, q.y, q.a, q.tam, q.k, 0, q.cola, true, q.e); return; }
    // pañuelos en el aire (de la punta hacia la manga) y los nudos entre ellos
    for (const q of links) if (!q.pila) panuelo(g, q.x, q.y, q.a, q.tam, q.k, 3 * Math.sin(t * 11 + q.k * 1.3), q.cola, false);
    for (let i = 0; i + 1 < links.length; i++) {
      const q = links[i], r = links[i + 1]; if (q.pila && r.pila) continue;
      nudo(g, (q.x + r.x) / 2, (q.y + r.y) / 2, Math.atan2(r.y - q.y, r.x - q.x), Math.min(q.tam, r.tam), q.k);
    }
  }

  /* ---------- la paloma ---------- */
  let SALIDA_POP = null;
  function origenPaloma(){if(!SALIDA_POP){const q=poseG(T.pop);SALIDA_POP=G.aPantalla(q,G.cabeza(q).a({x:800,y:300}));}return SALIDA_POP;}
  function paloma(g, x, y, esc, aleteo, giro) {
    g.save(); g.translate(x, y); g.rotate(giro); g.scale(esc, esc);
    g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2;
    const ala = (sg, k) => { g.save(); g.translate(-2, -4); g.rotate(sg * (0.3 + 1.1 * k)); g.beginPath(); g.moveTo(0, 0);
      g.quadraticCurveTo(-8, -22, -28, -26); g.quadraticCurveTo(-18, -16, -22, -12); g.quadraticCurveTo(-12, -8, -14, -3); g.quadraticCurveTo(-6, -2, 0, 0); g.closePath();
      g.fillStyle = sg < 0 ? "#dfe6f0" : "#ffffff"; g.fill(); g.stroke();
      g.strokeStyle = "rgba(90,110,140,0.6)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-10, -12); g.lineTo(-19, -17); g.moveTo(-8, -6); g.lineTo(-16, -9); g.stroke(); g.restore(); };
    ala(-1, 0.5 + 0.5 * Math.sin(aleteo + 0.6));                 // ala de atrás
    // cola
    g.beginPath(); g.moveTo(-14, 2); g.lineTo(-30, -4); g.lineTo(-29, 6); g.lineTo(-31, 12); g.lineTo(-14, 8); g.closePath(); g.fillStyle = "#eef2f7"; g.fill(); g.stroke();
    // cuerpo y cabeza
    g.beginPath(); g.ellipse(-2, 3, 17, 10, -0.12, 0, Math.PI * 2); g.fillStyle = "#ffffff"; g.fill(); g.stroke();
    g.beginPath(); g.arc(14, -6, 7.5, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#f29d32"; g.beginPath(); g.moveTo(20.5, -7.5); g.lineTo(27, -5); g.lineTo(20.5, -3); g.closePath(); g.fill(); g.lineWidth = 1.3; g.stroke();
    g.fillStyle = "#0b0a0e"; g.beginPath(); g.arc(16, -7.5, 1.6, 0, Math.PI * 2); g.fill();
    g.lineWidth = 2;
    ala(1, 0.5 + 0.5 * Math.sin(aleteo));                         // ala de delante
    g.restore();
  }
  function vuelo(g, t, pG) {
    if (t < T.pop) return;
    origenPaloma();
    const S0 = SALIDA_POP, u = t - T.pop;
    const nace = salida(fase(t, T.pop, T.pop + 0.16));
    const k = fase(t, T.pop + 0.05, T.pop + 1.45);
    const x = S0.x + 40 * nace + 300 * Math.pow(k, 1.25) + 18 * Math.sin(u * 5);
    const y = S0.y - 30 * nace - 340 * Math.pow(k, 1.05) + 10 * Math.sin(u * 7);
    if (y < -60) return;
    paloma(g, x, y, (0.35 + 0.85 * nace) * (1 + 0.15 * k), u * 26, -0.35 - 0.2 * Math.sin(u * 5));
  }
  function plumas(g, t) {
    if (t < T.pop || !SALIDA_POP) return;
    const u = t - T.pop; if (u > 2.2) return;
    g.save(); g.lineCap = "round";
    for (let i = 0; i < 6; i++) {
      const sx = (hash(i + 70) - 0.5) * 70, vy = 40 + 30 * hash(i + 71);
      const x = SALIDA_POP.x + sx * salida(clamp(u * 3)) + 12 * Math.sin(u * 3 + i * 1.7), y = SALIDA_POP.y - 20 * salida(clamp(u * 4)) + vy * u;
      g.globalAlpha = clamp(1 - u / 2.2) * 0.95;
      g.save(); g.translate(x, y); g.rotate(0.8 * Math.sin(u * 3 + i)); g.fillStyle = "#ffffff"; g.strokeStyle = "#5b6b80"; g.lineWidth = 1;
      g.beginPath(); g.ellipse(0, 0, 6, 2.4, 0, 0, Math.PI * 2); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-7, 0); g.lineTo(6, 0); g.stroke(); g.restore();
    }
    g.restore();
  }
  // moneda en el aire (Laura la lanza con el pulgar y la caza)
  function monedaSujeta(t){const p=poseL(t),q=L.aPantalla(p,pinzaHoja(p.manoLejos,ESC_MANO_L));return{x:q.x-1,y:q.y-2,rx:7,ry:6};}
  function monedaEn(t){
    if(t<T.flip0||t>=T.flip1)return monedaSujeta(t);
    const a=monedaSujeta(T.flip0),b=monedaSujeta(T.flip1),k=fase(t,T.flip0,T.flip1);
    return{x:lerp(a.x,b.x,k),y:lerp(a.y,b.y,k)-92*4*k*(1-k),rx:7*Math.max(.15,Math.abs(Math.cos(4*Math.PI*k))),ry:6};
  }
  function monedaAlAire(g,t){if(t<T.flip0||t>=T.flip1)return;const q=monedaEn(t);moneda(g,q.x,q.y,q.rx,q.ry,1);}

  /* ---------- decorado: rincón de magia ---------- */
  let fondo = null;
  function estrella4(g, x, y, r) { g.beginPath(); g.moveTo(x, y - r); g.quadraticCurveTo(x, y, x + r, y); g.quadraticCurveTo(x, y, x, y + r); g.quadraticCurveTo(x, y, x - r, y); g.quadraticCurveTo(x, y, x, y - r); g.closePath(); }
  function chistera(g, x, y, esc) {
    g.save(); g.translate(x, y); g.scale(esc, esc); g.lineJoin = "round"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 3;
    g.fillStyle = "#18161d"; g.beginPath(); g.moveTo(-26, 0); g.lineTo(-22, -58); g.quadraticCurveTo(0, -64, 22, -58); g.lineTo(26, 0); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#b3142b"; g.fillRect(-25, -14, 50, 10); g.strokeRect(-25, -14, 50, 10);
    g.fillStyle = "#2a2730"; g.beginPath(); g.ellipse(0, 0, 44, 9, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(-17, -54, 6, 38);
    g.restore();
  }
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60);
    // papel pintado verde petróleo con rombos y estrellitas doradas
    const pared = g.createLinearGradient(0, -60, 0, 430); pared.addColorStop(0, "#082a2c"); pared.addColorStop(1, "#14514f");
    g.fillStyle = pared; g.fillRect(-40, -60, W + 80, 500);
    g.strokeStyle = "rgba(230,190,90,0.10)"; g.lineWidth = 1.2;
    for (let x = -40; x < W + 80; x += 46) { g.beginPath(); g.moveTo(x, -60); g.lineTo(x + 230, 440); g.moveTo(x, -60); g.lineTo(x - 230, 440); g.stroke(); }
    g.fillStyle = "rgba(240,200,100,0.22)";
    for (let i = 0; i < 70; i++) { const x = -30 + hash(i + 3) * (W + 60), y = -50 + hash(i + 90) * 470; estrella4(g, x, y, 2.5 + 3 * hash(i + 7)); g.fill(); }
    // foco cálido en la pared detrás de los dos
    const foco = g.createRadialGradient(520, 250, 20, 520, 250, 470);
    foco.addColorStop(0, "rgba(255,214,150,0.42)"); foco.addColorStop(0.5, "rgba(220,170,110,0.16)"); foco.addColorStop(1, "rgba(200,150,90,0)");
    g.fillStyle = foco; g.fillRect(-40, -60, W + 80, 500);
    // cartel de la chistera con conejo y cartel de las cartas (sin letras)
    const marco = (x, y, w, h) => { g.fillStyle = "#3d2410"; g.fillRect(x - 9, y - 9, w + 18, h + 18); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(x - 9, y - 9, w + 18, h + 18);
      g.strokeStyle = "#d8a948"; g.lineWidth = 2; g.strokeRect(x - 4, y - 4, w + 8, h + 8); };
    marco(150, 70, 128, 168);
    let gr = g.createLinearGradient(150, 70, 150, 238); gr.addColorStop(0, "#5a1530"); gr.addColorStop(1, "#2b0b1a"); g.fillStyle = gr; g.fillRect(150, 70, 128, 168);
    g.fillStyle = "rgba(255,230,160,0.8)"; for (let i = 0; i < 9; i++) { estrella4(g, 160 + hash(i + 40) * 108, 80 + hash(i + 50) * 70, 3 + 3 * hash(i + 60)); g.fill(); }
    // orejas de conejo saliendo de la chistera
    g.save(); g.lineWidth = 2.5; g.strokeStyle = "#0b0a0e";
    for (const [dx, a] of [[-10, -0.18], [10, 0.15]]) { g.save(); g.translate(214 + dx, 176); g.rotate(a); g.fillStyle = "#f6f2ee"; g.beginPath(); g.ellipse(0, -26, 8, 26, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = "#f2a7b4"; g.beginPath(); g.ellipse(0, -24, 3.5, 18, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
    g.restore();
    chistera(g, 214, 218, 0.9);
    marco(760, 86, 150, 120);
    gr = g.createLinearGradient(760, 86, 760, 206); gr.addColorStop(0, "#14304f"); gr.addColorStop(1, "#0a1a2e"); g.fillStyle = gr; g.fillRect(760, 86, 150, 120);
    // abanico de cartas con palos (sin números)
    const palos = ["♠", "♥", "♣", "♦"];
    for (let i = 0; i < 4; i++) {
      g.save(); g.translate(835, 196); g.rotate(-0.55 + i * 0.37); g.translate(0, -58);
      g.fillStyle = "#fbf6ec"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.beginPath(); g.roundRect ? g.roundRect(-20, -30, 40, 58, 5) : g.rect(-20, -30, 40, 58); g.fill(); g.stroke();
      g.fillStyle = i % 2 ? "#c81d2e" : "#14121a"; g.font = "bold 26px serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(palos[i], 0, 0);
      g.restore();
    }
    // apliques de pared
    for (const lx of [80, 950]) {
      const halo = g.createRadialGradient(lx, 130, 4, lx, 130, 120); halo.addColorStop(0, "rgba(255,210,140,0.5)"); halo.addColorStop(1, "rgba(255,200,120,0)");
      g.fillStyle = halo; g.beginPath(); g.arc(lx, 130, 120, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#c9993c"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.fillRect(lx - 4, 140, 8, 34); g.strokeRect(lx - 4, 140, 8, 34);
      g.fillStyle = "#ffe3a6"; g.beginPath(); g.moveTo(lx - 18, 142); g.lineTo(lx + 18, 142); g.lineTo(lx + 11, 112); g.lineTo(lx - 11, 112); g.closePath(); g.fill(); g.stroke();
    }
    // zócalo de madera oscura con molduras doradas
    g.fillStyle = "#2a1a10"; g.fillRect(-40, 430, W + 80, 100);
    g.fillStyle = "#c9993c"; g.fillRect(-40, 426, W + 80, 6); g.fillStyle = "rgba(0,0,0,0.4)"; g.fillRect(-40, 432, W + 80, 4);
    g.strokeStyle = "rgba(201,153,60,0.45)"; g.lineWidth = 2;
    for (let x = -10; x < W + 40; x += 118) g.strokeRect(x, 446, 98, 64);
    g.fillStyle = "#1b110a"; g.fillRect(-40, 518, W + 80, 12);
    // suelo de tarima oscura en perspectiva
    const su = g.createLinearGradient(0, 530, 0, H + 60); su.addColorStop(0, "#4a2c18"); su.addColorStop(1, "#24130a");
    g.fillStyle = su; g.fillRect(-40, 530, W + 80, H + 60 - 530);
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 1.6;
    for (let i = -14; i <= 14; i++) { g.beginPath(); g.moveTo(512 + i * 50, 530); g.lineTo(512 + i * 120, H + 60); g.stroke(); }
    g.strokeStyle = "rgba(255,210,150,0.12)"; g.lineWidth = 1;
    for (const y of [548, 571, 600]) { g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); }
    // alfombra redonda morada con cenefa dorada
    g.save(); g.translate(520, 566); g.scale(1, 0.12);
    g.fillStyle = "#3a1a4c"; g.beginPath(); g.arc(0, 0, 300, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#d8a948"; g.lineWidth = 60; g.beginPath(); g.arc(0, 0, 268, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "#5b2a74"; g.lineWidth = 26; g.beginPath(); g.arc(0, 0, 268, 0, Math.PI * 2); g.stroke();
    g.restore();
    // mesita con chistera y varita (a la izquierda)
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3;
    g.fillStyle = "#3d2410"; g.fillRect(84, 452, 8, 104); g.strokeRect(84, 452, 8, 104);
    g.beginPath(); g.ellipse(88, 556, 26, 5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#5a3418"; g.beginPath(); g.ellipse(88, 450, 52, 10, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    chistera(g, 76, 446, 0.62);
    g.save(); g.translate(116, 443); g.rotate(-0.12); g.fillStyle = "#14121a"; g.fillRect(-2, -4, 40, 5); g.strokeRect(-2, -4, 40, 5);
    g.fillStyle = "#fbf6ec"; g.fillRect(30, -4, 8, 5); g.restore();
    // viñeta
    const v = g.createRadialGradient(512, 300, 290, 512, 300, 690); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.55)");
    g.fillStyle = v; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const truco = tramo(t, T.moneda - 0.2, T.moneda + 0.4, suave) * (1 - tramo(t, T.camara + 0.2, T.vuelve1, suave));
    const final = tramo(t, T.acerca0, T.acerca1 + 0.3, suave) * (1 - tramo(t, T.pop + 0.2, T.pop + 1.2, suave));
    const k = 1 + 0.06 * truco + 0.06 * final;
    return { k, x: 512 + 30 * truco + 0 * final, y: 330 - 10 * truco - 6 * final };
  }

  class GuillermoLauraMagia extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !L.listo()) return;
      if (!fondo) fondo = creaFondo();
      if (!TABLA) preparaRistra();
      const pG = poseG(t), pL = poseL(t);
      const luz = tramo(t, NEGRO_INICIO, 0.9, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      g.drawImage(fondo, -40, -60);
      // sombras
      g.save(); g.fillStyle = "rgba(0,0,0,0.35)";
      g.beginPath(); g.ellipse(pG.x + 6, SUELO + 1, 100, 8, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pL.x - 4, SUELO + 1, 92, 8, 0, 0, Math.PI * 2); g.fill(); g.restore();
      // orden: mientras él le hurga la oreja, Guillermo por delante; cuando ella le saca la moneda, Laura
      if (t < T.orden) { L.dibujar(g, pL, t); G.dibujar(g, pG, t); }
      else { G.dibujar(g, pG, t); L.dibujar(g, pL, t); }
      ristra(g, t, pG, "pila");
      ristra(g, t, pG, "aire");
      // la moneda (entre el pulgar y el índice, por delante de los dedos), sus brillos y las nubecillas de magia
      if (t >= T.moneda + 0.1 && t < T.cubre1 + 0.02) { const q = G.aPantalla(pG, pinzaHoja(pG.manoLejos, 1)), c = salida(fase(t, T.moneda + 0.1, T.moneda + 0.28));
        moneda(g, q.x + 1, q.y - 2, 7.5 * c, 6.4 * c, 0.75 + 0.25 * Math.sin(t * 3));
        destello(g, q.x + 7, q.y - 9, campana(t, T.moneda + 0.25, T.moneda + 0.7) + campana(t, T.muestra + 0.1, T.muestra + 0.45), 10, t * 2); }
      if (t >= T.abre && t < T.abre + 0.6) { const q = mezcla(G.aPantalla(pG, pG.manoCerca), G.aPantalla(pG, pG.manoLejos), 0.5); puf(g, t, T.abre, q.x, q.y, 24); }
      if ((t >= T.hurgaL1 - 0.08 && t < T.flip0) || t >= T.flip1) { const q = L.aPantalla(pL, pinzaHoja(pL.manoLejos, ESC_MANO_L));
        moneda(g, q.x - 1, q.y - 2, 7 * salida(fase(t, T.hurgaL1 - 0.08, T.hurgaL1 + 0.08)), 6, 1);
      }
      if (t >= T.hurgaL1 - 0.08 && t < T.flip0) { const q = L.aPantalla(pL, pinzaHoja(pL.manoLejos, ESC_MANO_L));
        destello(g, q.x - 5, q.y - 7, campana(t, T.hurgaL1, T.hurgaL1 + 0.4) + campana(t, T.muestraL, T.muestraL + 0.35), 10, t * 2); }
      monedaAlAire(g, t);
      if (t >= T.pop) {const o=origenPaloma();puf(g, t, T.pop, o.x, o.y, 30);}
      vuelo(g, t, pG);
      plumas(g, t);
      if (t >= T.guinoL) { const oL = L.aPantalla(pL, L.cabeza(pL).a({ x: 812, y: 466 })); destello(g, oL.x + 4, oL.y - 22, campana(t, T.guinoL + 0.08, T.guinoL + 0.45), 15); }
      if (t >= T.guino && t < T.guino + 0.6) { const oG = G.aPantalla(pG, G.cabeza(pG).a({ x: 771, y: 563 })); destello(g, oG.x - 4, oG.y - 24, campana(t, T.guino + 0.08, T.guino + 0.45), 15); }
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00016.2", nombre: "Guillermo y Laura · El truco de magia", crear: () => new GuillermoLauraMagia() });
  window.__A2D_00016_2 = { pose, poseG, poseL, T, DUR, camara, SUELO, S, PASOS_G, PASOS_L, pie, TOB_G, TOB_L, pinzaHoja, ESC_MANO_L, monedaEn, monedaSujeta, origenPaloma, puntoMano, mangaPantalla, origen, enlaces, preparaRistra, tabla:()=>TABLA, TIR, PILA };
})();
