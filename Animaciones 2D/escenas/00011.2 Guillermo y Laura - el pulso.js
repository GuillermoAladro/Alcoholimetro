"use strict";
/* 00011.2 · Guillermo y Laura · El pulso
 *
 * Negro → en una mesa alta de bar, Guillermo (a la izquierda) y Laura (a la derecha, mirándole).
 * Él saca bíceps y mira a cámara chulito; ella levanta una ceja → él planta el codo en la mesa y
 * la invita con los dedos; ella se encoge de hombros y le agarra la mano → cuenta atrás con los
 * dedos: 3, 2, 1 → ¡ya! Guillermo aprieta con todo: se pone rojo, suda, le sale la vena, tiembla
 * entero y se agarra al borde de la mesa. Laura, como si nada: coge su copa y sorbe por la pajita,
 * la deja, se mira las uñas, bosteza… y las manos ni se mueven → le mira con lástima, sonríe y
 * con un giro de muñeca ¡zas!: le estampa la mano contra la mesa y Guillermo sale despedido hacia
 * atrás dando una voltereta → cae de espaldas con las piernas en alto, estrellitas y ojos en
 * espiral; levanta una mano temblorosa: se rinde → Laura se sopla las yemas de los dedos, sorbe
 * de su copa mirando a cámara y guiña un ojo → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto. La geometría del pulso (dónde apoyan los codos y
 * dónde se juntan las manos) se calcula una vez a partir de las dos posturas.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, L = Laura;
  const S = 0.3, SUELO = 560;
  const DUR = 13.75;
  const TX = 560, TY = 308;                       // centro de la mesa y altura del tablero (pantalla)
  const T = {
    mira: 0.3, flex0: 0.6, flex1: 1.0, planta0: 1.35, planta1: 1.75, llama0: 1.8, llama1: 2.25,
    encoge: 1.55, mano0: 1.85, agarra: 2.35,
    tres: 2.6, dos: 2.9, uno: 3.2, ya: 3.45,
    vaso0: 3.6, vasoCoge: 3.95, sorbe0: 4.25, sorbe1: 4.95, vasoDeja: 5.35, unas0: 5.6, unas1: 6.45,
    bosteza0: 6.6, bosteza1: 7.35, lastima: 7.5, sonrie: 7.85, carga: 8.05, zas: 8.2,
    sale: 8.62, entra: 9.0, aterriza: 9.3, sopla0: 9.62, sopla1: 10.25, copa0: 10.35, sorbe2: 10.75, sorbe3: 11.25,
    guino: 11.6, rinde0: 11.15, rinde1: 12.05, fin: 12.6
  };

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const R_M = G.MUNECA_R * G.JK;                  // de la muñeca al centro de la mano (hoja)
  // centro de la mano para que la muñeca quede en m (hoja), con la mano girada ang y la muñeca hacia mu
  const manoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };

  /* ---------- caras (los dos usan los mismos campos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, esp: 0, mof: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: Math.max(e.c, parp), i: Math.max(e.c, parp), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* =====================================================================================
   * GUILLERMO (a la izquierda, mira a la derecha)
   * ===================================================================================== */
  const CARAS_G = {
    inicio: E({ orig: 0, sonr: 0.45, sd: 6, gd: 0.08, si: 4, gi: 0.05 }),
    chulo: E({ mx: -0.85, my: -0.2, sd: 18, gd: 0.16, si: -4, gi: -0.08, orig: 0, sonr: 0.8, abre: 4, ancho: 0.95 }),
    reta: E({ mx: 0.9, my: 0.1, sd: -4, gd: -0.12, si: 10, gi: 0.12, orig: 0, sonr: 0.55, ancho: 0.9 }),
    serio: E({ mx: 0.95, my: 0.15, c: 0.25, sd: -12, gd: -0.24, si: -12, gi: -0.24, orig: 0, sonr: -0.2, ancho: 0.85 }),
    aprieta: E({ mx: 0.95, my: 0.1, c: 0.45, z: 0.3, sd: -14, gd: -0.28, si: -14, gi: -0.28, orig: 0, abre: 20, ancho: 1.2, sonr: -0.55, lengua: 0 }),
    desespera: E({ mx: -0.9, my: -0.25, iris: 0.8, sd: 16, gd: 0.25, si: 16, gi: 0.25, orig: 0, abre: 22, ancho: 1.1, sonr: -0.7, lengua: 0 }),
    maximo: E({ mx: 0.6, my: 0, c: 1, z: 1, sd: -10, gd: -0.25, si: -10, gi: -0.25, orig: 0, abre: 2, ancho: 0.8, sonr: -0.3, mof: 0.9 }),
    susto: E({ mx: 0.6, my: -0.5, iris: 0.7, sd: 26, gd: 0.15, si: 26, gi: 0.15, orig: 0, abre: 48, ancho: 0.8, sonr: -0.2, lengua: 0.4 }),
    ko: E({ mx: 0, my: 0, esp: 1, sd: 12, gd: 0.2, si: -6, gi: -0.1, orig: 0, abre: 22, ancho: 0.8, sonr: -0.2, lengua: 0.9 }),
    rinde: E({ mx: 0, my: 0, esp: 1, sd: 18, gd: 0.25, si: 10, gi: 0.15, orig: 0, abre: 8, ancho: 0.9, sonr: -0.45, lengua: 0.5 })
  };
  const GUION_CARA_G = [
    [T.flex0 + 0.15, T.flex0 + 0.4, "chulo"], [T.planta0, T.planta0 + 0.25, "reta"], [T.tres - 0.15, T.tres + 0.1, "serio"],
    [T.ya, T.ya + 0.15, "aprieta"], [6.0, 6.2, "desespera"], [6.55, 6.75, "aprieta"], [7.15, 7.4, "maximo"],
    [T.zas, T.zas + 0.06, "susto"], [T.sale, T.sale + 0.1, "ko"], [T.rinde0, T.rinde0 + 0.3, "rinde"]
  ];
  // postura: dx pelvis (px), pel (hoja, + abajo), torso, cab; mano cercana respecto a su hombro (hoja)
  const P0G = { dx: 0, pel: 0, torso: 0, cab: 0, cx: 49, cy: 340, ca: 0, cmu: -1.75, cp: 0, lx: 0, ly: 300, la: 0, lmu: -1.75, lp: 0 };
  const CG = o => Object.assign({}, P0G, o);
  const CUERPOS_G = {
    bolsillos: CG({}),
    flex: CG({ dx: -6, torso: -0.06, cab: -0.06, lx: 140, ly: -185, la: -0.15, lmu: -4.65, lp: 1 }),
    planta: CG({ dx: 0, pel: 18, torso: 0.15, cab: 0.04, lx: 0, ly: 0, lp: 1 }),
    cuenta: CG({ dx: 0, pel: 18, torso: 0.15, cab: 0.04, cx: -60, cy: -190, ca: -0.25, cmu: -4.5, cp: 1, lp: 1 }),
    empuja: CG({ dx: 6, pel: 34, torso: 0.22, cab: 0.08, cx: 0, cy: 0, cp: 1, lp: 1 }),
    maximo: CG({ dx: 10, pel: 44, torso: 0.27, cab: 0.1, cx: 0, cy: 0, cp: 1, lp: 1 })
  };
  const GUION_CUERPO_G = [
    [T.flex0, T.flex1, "flex"], [T.planta0, T.planta1, "planta"], [T.tres - 0.3, T.tres, "cuenta"],
    [T.ya, T.ya + 0.3, "empuja"], [6.9, 7.6, "maximo"]
  ];
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };

  /* =====================================================================================
   * LAURA (a la derecha, en espejo: mira a la izquierda)
   * ===================================================================================== */
  const CARAS_L = {
    inicio: E({ orig: 1, sonr: 0.2 }),
    ceja: E({ mx: 0.85, my: 0.05, c: 0.32, sd: 2, gd: 0.02, si: 16, gi: 0.12, orig: 0, sonr: 0.3, ancho: 0.85 }),
    encoge: E({ mx: 0.6, my: -0.2, c: 0.2, sd: 12, gd: 0.1, si: 12, gi: 0.1, orig: 0, sonr: 0.45, ancho: 0.9 }),
    calma: E({ mx: 0.85, my: 0.1, c: 0.28, sd: 4, gd: 0.04, si: 6, gi: 0.05, orig: 0, sonr: 0.35, ancho: 0.9 }),
    sorbe: E({ mx: 0.4, my: 0.3, c: 0.55, sd: 8, gd: 0.06, si: 8, gi: 0.06, orig: 0, abre: 3, ancho: 0.45, sonr: 0.05 }),
    unas: E({ mx: 0.1, my: 1, c: 0.4, sd: 4, gd: 0.02, si: 4, gi: 0.02, orig: 0, sonr: 0.2, ancho: 0.85 }),
    bosteza: E({ mx: 0, my: -0.3, c: 1, z: 0.6, sd: 14, gd: 0.12, si: 14, gi: 0.12, orig: 0, abre: 46, ancho: 0.75, sonr: 0, lengua: 0.6 }),
    lastima: E({ mx: 0.85, my: 0.1, c: 0.25, sd: 14, gd: -0.18, si: 14, gi: -0.18, orig: 0, sonr: 0.1, ancho: 0.85 }),
    sonrie: E({ mx: 0.85, my: 0.1, c: 0.15, sd: 6, gd: 0.04, si: 10, gi: 0.1, orig: 0, sonr: 0.75, ancho: 0.95 }),
    zas: E({ mx: 0.9, my: 0.1, c: 0.4, sd: -4, gd: -0.08, si: -4, gi: -0.08, orig: 0, sonr: 0.6, abre: 6, ancho: 1 }),
    sopla: E({ mx: -0.3, my: 0.2, c: 0.45, sd: 6, gd: 0.05, si: 10, gi: 0.08, orig: 0, abre: 6, ancho: 0.4, sonr: 0, dientes: 0 }),
    arriba: E({ mx: 0.5, my: -1, iris: 1.05, sd: 16, gd: 0.1, si: 18, gi: 0.12, orig: 0, sonr: 0.4, abre: 8, ancho: 0.8 }),
    auch: E({ mx: -0.3, my: 0.3, c: 0.85, z: 0.7, sd: 12, gd: -0.15, si: 12, gi: -0.15, orig: 0, sonr: -0.25, abre: 10, ancho: 1.1 }),
    camara: E({ mx: -0.85, my: -0.05, c: 0.2, sd: 8, gd: 0.06, si: 12, gi: 0.1, orig: 0, sonr: 0.7, ancho: 0.95 }),
    sorbeC: E({ mx: -0.85, my: 0, c: 0.35, sd: 10, gd: 0.08, si: 14, gi: 0.1, orig: 0, abre: 3, ancho: 0.45, sonr: 0.05 }),
    guino: E({ mx: -0.85, my: -0.05, c: 0, h: 1, sd: 10, gd: 0.08, si: 16, gi: 0.12, orig: 0, sonr: 0.85, ancho: 1, abre: 4 })
  };
  const GUION_CARA_L = [
    [0.85, 1.1, "ceja"], [T.encoge, T.encoge + 0.2, "encoge"], [T.agarra - 0.1, T.agarra + 0.15, "calma"],
    [T.vasoCoge + 0.1, T.sorbe0, "sorbe"], [T.sorbe1, T.sorbe1 + 0.2, "calma"], [T.unas0, T.unas0 + 0.25, "unas"],
    [T.bosteza0, T.bosteza0 + 0.3, "bosteza"], [T.bosteza1 - 0.1, T.bosteza1 + 0.15, "calma"], [T.lastima, T.lastima + 0.2, "lastima"],
    [T.sonrie, T.sonrie + 0.15, "sonrie"], [T.zas - 0.05, T.zas + 0.02, "zas"], [T.zas + 0.1, T.zas + 0.25, "arriba"],
    [T.sale + 0.12, T.sale + 0.3, "camara"], [T.aterriza - 0.02, T.aterriza + 0.06, "auch"], [T.aterriza + 0.2, T.aterriza + 0.35, "sonrie"],
    [T.sopla0, T.sopla0 + 0.2, "sopla"],
    [T.sopla1, T.sopla1 + 0.2, "camara"], [T.sorbe2 - 0.05, T.sorbe2 + 0.1, "sorbeC"], [T.sorbe3, T.sorbe3 + 0.15, "camara"],
    [T.guino, T.guino + 0.12, "guino"], [T.guino + 0.5, T.guino + 0.65, "camara"]
  ];
  const TOB_L = { cerca: L.SUELO - L.TOBILLO_ALTO, lejos: L.SUELO - L.TOBILLO_ALTO - 10 };

  /* =====================================================================================
   * GEOMETRÍA DEL PULSO
   * Cada uno apoya el codo en el tablero y las dos muñecas se juntan encima. La pelvis de cada uno
   * se coloca para que el codo que sale de su IK caiga justo sobre el tablero.
   * ===================================================================================== */
  const LG1 = G.BRAZO_L * 0.5 * S, LG2 = G.BRAZO_L * 0.5 * S;
  const PL = L.A.datos.piezas.brazo, LL1 = PL.codo * S * L.K, LL2 = (PL.fin[1] - PL.raiz[1] - PL.codo) * S * L.K;
  const CLASP = { x: TX, y: TY - 37 };                     // centro de las manos agarradas
  const MG = { x: -6, y: 9 }, ML = { x: 6, y: 9 };          // muñecas respecto al agarre (pantalla)
  // codo (abajo) de un brazo de dos tramos entre hombro s y muñeca w
  function codo(s, w, l1, l2, abajo = true) {
    const dx = w.x - s.x, dy = w.y - s.y, d = Math.hypot(dx, dy), a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, l1 * l1 - a * a)), mx = s.x + dx * a / d, my = s.y + dy * a / d;
    const c1 = { x: mx + h * dy / d, y: my - h * dx / d }, c2 = { x: mx - h * dy / d, y: my + h * dx / d };
    return (c1.y > c2.y) === abajo ? c1 : c2;
  }
  let GEO = null, SALIDA_G = null;
  const munecaAgarre=(ag,offset)=>{const r=G.rotP(offset,ag.ang);return{x:ag.x+r.x,y:ag.y+r.y};};
  // Conserva el apoyo del codo al inclinarse o temblar. Solo mueve la pelvis;
  // las plantas de los pies permanecen en sus coordenadas de pantalla.
  function alineaCodo(A,p,w,l1,l2,lado,peso){
    const h=A.aPantalla(p,A.tronco(p)(A.HOMBRO)),dx=h.x-p.x,dy=w.y-h.y;
    let lo=2,hi=Math.sqrt(Math.max(4,Math.pow((l1+l2)*.992,2)-dy*dy));
    for(let i=0;i<32;i++){const d=(lo+hi)/2,e=codo({x:w.x+lado*d,y:h.y},w,l1,l2);if(e.y>TY-3)lo=d;else hi=d;}
    p.x=lerp(p.x,w.x+lado*(lo+hi)/2-dx,peso);
  }
  function preparaGeo() {
    // Guillermo: con su postura de empujar, mover la pelvis hasta que el codo quede en el tablero
    const b = CUERPOS_G.empuja, w = { x: CLASP.x + MG.x, y: CLASP.y + MG.y };
    const hombroG = x => { const p = { x, suelo: SUELO, s: S, pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel }, torso: b.torso, torsoEsc: { x: 1, y: 1 } };
      return G.aPantalla(p, G.tronco(p)(G.HOMBRO)); };
    let lo = TX - 260, hi = TX - 60;
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, e = codo(hombroG(m), w, LG1, LG2); if (e.y < TY - 3) lo = m; else hi = m; }
    const xg = (lo + hi) / 2 - b.dx;
    // Laura (en espejo): igual, desde la derecha
    const wl = { x: CLASP.x + ML.x, y: CLASP.y + ML.y };
    const hombroL = x => { const p = { x, suelo: SUELO, s: S, espejo: true, pelvis: { x: L.PELVIS.x, y: L.PELVIS.y + 10 }, torso: 0.1, torsoEsc: { x: 1, y: 1 } };
      return L.aPantalla(p, L.tronco(p)(L.HOMBRO)); };
    lo = TX + 30; hi = TX + 260;
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, e = codo(hombroL(m), wl, LL1, LL2); if (e.y < TY - 3) hi = m; else lo = m; }
    const xl = (lo + hi) / 2;
    GEO = { xg, xl, codoG: codo(hombroG(xg + b.dx), w, LG1, LG2), codoL: codo(hombroL(xl), wl, LL1, LL2) };
  }

  // agarre en el tiempo: tiembla con el esfuerzo, apenas se mueve… y ¡zas! contra la mesa del lado de Guillermo
  const esfuerzo = t => tramo(t, T.ya, T.ya + 0.4) * (0.45 + 0.55 * tramo(t, T.ya + 0.5, 7.6, suave)) * (1 - tramo(t, T.zas - 0.02, T.zas + 0.05));
  const PIN = { x: TX - 34, y: TY - 10 };
  function agarre(t) {
    const e = esfuerzo(t);
    let x = CLASP.x + 1.6 * e * ruido(t * 31) + 3 * Math.sin(t * 1.7) * e * 0.5, y = CLASP.y + 1.2 * e * ruido(t * 27 + 5);
    // Guillermo gana un poquito al principio (se lo deja) y luego vuelve al centro
    x += 4 * campana(t, T.ya + 0.2, 5.4);
    // Laura amaga hacia su lado y lo estampa
    x += 3 * campana(t, T.carga, T.zas);
    const k = salida(fase(t, T.zas, T.zas + 0.09));
    if (k > 0) { x = lerp(x, PIN.x, k); y = lerp(y, PIN.y, k); }
    const ang = -1.2 * k;                    // la mano de Guillermo acaba de canto contra la mesa
    return { x, y, ang, k };
  }

  /* ---------- vuelo de Guillermo: sale disparado hacia arriba fuera de plano… y cae de espaldas ---------- */
  // Transformación de pantalla alrededor de su pelvis. Fuera de plano gira para caer de espaldas, con
  // las piernas en alto; vuelve a entrar ya tumbado y se estampa contra el suelo a la izquierda.
  const DESPEGA = T.zas + 0.06, PELVIS_Y = SUELO + (G.PELVIS.y - G.SUELO) * S, DX_CAE = -105;
  function vuelo(t) {
    if (t < DESPEGA) return { dx: 0, dy: 0, phi: 0, k: 0, suelo: 0, fuera: 0 };
    const k = fase(t, DESPEGA, T.aterriza);
    if (t < T.sale) {
      const u = fase(t, DESPEGA, T.sale), arranque = Math.min(1, fase(t, DESPEGA, DESPEGA + 0.05));
      const sube = salida(u) * (0.4 + 0.6 * arranque);
      return { dx: -40 * sube, dy: -660 * sube, phi: -0.55 * sube, k: Math.max(k, 1e-4), suelo: 0, fuera: 0 };
    }
    if (t < T.entra) {          // fuera de plano: se recoloca encima del sitio donde va a caer
      const u = suave(fase(t, T.sale, T.entra));
      return { dx: lerp(-40, DX_CAE, u), dy: lerp(-660, -700, u), phi: lerp(-0.55, -Math.PI / 2 - 0.25, u), k, suelo: 0, fuera: 1 };
    }
    const u = fase(t, T.entra, T.aterriza), cae = entrada(u);
    const dyFin = (SUELO - 58) - PELVIS_Y;
    let dy = lerp(-700, dyFin, cae), phi = -Math.PI / 2 - 0.25 * (1 - u);
    // rebote y aplastamiento al caer
    const r = t > T.aterriza ? Math.exp(-(t - T.aterriza) * 8) * Math.sin((t - T.aterriza) * 20) : 0;
    dy -= 12 * Math.max(0, r);
    return { dx: DX_CAE, dy, phi, k, suelo: t >= T.aterriza ? 1 : 0, fuera: 0, rebote: r };
  }

  /* ---------- poses ---------- */
  function poseG(t) {
    if (!GEO) preparaGeo();
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "bolsillos", t);
    const XG = GEO.xg, respira = Math.sin(t * 2.3);
    const e = esfuerzo(t), tiembla = e * (1.5 + 2.5 * tramo(t, 6.8, 8.0));
    const v = vuelo(t), enAire = v.k > 0 ? 1 : 0, tumbado = tramo(t, T.sale + 0.05, T.entra - 0.05);
    if(enAire&&!SALIDA_G)SALIDA_G=poseG(DESPEGA-1e-7);
    const p = {
      x: XG + b.dx + ruido(t * 40) * tiembla * 0.6, suelo: SUELO, s: S, ikContinuo: true, hombrosContinuos: true, hombrosRecortados: true, tirasLimpias: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 + ruido(t * 37 + 3) * tiembla },
      torso: b.torso + ruido(t * 29 + 1) * tiembla * 0.006, torsoEsc: { x: 1 + 0.01 * e, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + ruido(t * 33 + 7) * tiembla * 0.01, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    if(enAire)p.x=SALIDA_G.x;
    // pies: plantados; al empujar retrasa el de atrás. En el aire encoge las piernas; tumbado, piernas arriba.
    const atras = tramo(t, T.ya + 0.3, T.ya + 0.6) * 30;
    const pies = {
      cerca: { x: XG - 19 - atras, ang: 0 }, lejos: { x: XG + 22, ang: 0 }
    };
    const pasoAtras = campana(t, T.ya + 0.3, T.ya + 0.6);
    for (const lado of ["cerca", "lejos"]) {
      const f = pies[lado], alza = lado === "cerca" ? 50 * pasoAtras : 0;
      p.piernas[lado] = { tob: { x: G.PELVIS.x + (f.x - p.x) / S, y: TOB_G[lado] - alza }, ang: f.ang };
    }
    if (enAire) {
      // en el cuerpo: rodillas al pecho mientras gira, y luego piernas estiradas hacia delante (arriba al caer de espaldas)
      const enc = tramo(t, DESPEGA, DESPEGA + 0.25) , est = tumbado;
      for (const lado of ["cerca", "lejos"]) {
        const sg = lado === "cerca" ? -1 : 1;
        const recogida = { x: G.PELVIS.x + 80 + sg * 40, y: G.PELVIS.y + 470 };
        const arriba = { x: G.PELVIS.x + 470 + sg * 22 + 18 * Math.sin(t * 5 + sg) * tramo(t, T.aterriza + 0.4, T.aterriza + 0.8), y: G.PELVIS.y - 70 + sg * 12 };
        const q = p.piernas[lado], de = mezcla(q.tob, recogida, Math.min(1, enc * 1.6));
        q.tob = mezcla(de, arriba, est); q.ang = lerp(0.4 * enc, -Math.PI / 2 + 0.25, est);
      }
      p.pelvis.y = G.PELVIS.y + lerp(b.pel, 0, Math.min(1, v.k * 3));
      p.torso = lerp(b.torso, 0, Math.min(1, v.k * 3)); p.cabeza.ang = lerp(b.cab, -0.15, Math.min(1, v.k * 3));
    }
    if(!enAire){const antes=p.x;alineaCodo(G,p,munecaAgarre(agarre(t),MG),LG1,LG2,-1,tramo(t,T.planta0,T.planta1));for(const q of Object.values(p.piernas))q.tob.x-=(p.x-antes)/S;}
    // cara
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    const pa = parpadeo(t, [0.42, 1.95, 4.3, 5.9]);
    p.cara = cara(ex, pa);
    p.rojo = 0.85 * tramo(t, T.ya + 0.2, 7.4) * (1 - tramo(t, T.zas + 0.1, T.zas + 0.6)) + 0.15 * tramo(t, 7.4, 8.0) * (1 - tramo(t, T.zas, T.zas + 0.4));
    p.cara.rubor = p.rojo;
    p.sudor = tramo(t, 4.4, 5.2) * (1 - tramo(t, T.zas + 0.2, T.zas + 0.8));
    p.enfado = tramo(t, 5.0, 5.4) * (1 - tramo(t, T.zas, T.zas + 0.2));
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    const BOLS_C = manoDesde({ x: 131, y: 652 }, 0, -1.75), BOLS_L = manoDesde({ x: 372, y: 648 }, 0, -1.75);
    let c = mezcla({ x: hc.x + b.cx, y: hc.y + b.cy }, BOLS_C, 1 - clamp(b.cp * 1.5));
    let l = mezcla({ x: hl.x + b.lx, y: hl.y + b.ly }, BOLS_L, 1 - clamp(b.lp * 1.5));
    let lmu = b.lmu, lang = b.la, lpu = b.lp, ldedos = null, cdedos = null, cmu = b.cmu, cang = b.ca;
    // flexiona el bíceps un par de veces
    const flexK = tramo(t, T.flex0, T.flex1) * (1 - tramo(t, T.planta0, T.planta0 + 0.25));
    if (flexK > 0) { const bombeo = 0.5 - 0.5 * Math.cos(Math.max(0, t - T.flex1) * 11); l = { x: l.x - 10 * bombeo * flexK, y: l.y + 22 * bombeo * flexK }; lang -= 0.2 * bombeo * flexK; }
    // mano lejana: apoya el codo con la mano abierta, invita con los dedos y agarra a Laura
    const ag = agarre(Math.min(t,DESPEGA)), wG = G.aHoja(p, munecaAgarre(ag,MG));
    const apoyo = tramo(t, T.planta0, T.planta1);
    if (apoyo > 0) {
      const muA = -4.55;                       // muñeca debajo de la mano (antebrazo vertical)
      const objetivo = manoDesde(wG, ag.ang, muA);
      l = mezcla(l, objetivo, apoyo); lmu = lerp(lmu, muA, apoyo); lang = lerp(lang, ag.ang, apoyo);
      const llama = campana(t, T.llama0, T.llama0 + 0.22) + campana(t, T.llama0 + 0.22, T.llama0 + 0.44);
      const abierta = apoyo * (1 - tramo(t, T.agarra - 0.06, T.agarra));
      ldedos = { pulgar: abierta * 0.9, indice: abierta * (1 - 0.8 * llama), medio: abierta * (1 - 0.7 * llama), anular: abierta * (1 - 0.6 * llama), menique: abierta * (1 - 0.5 * llama) };
      lpu = 1 - tramo(t, T.agarra - 0.05, T.agarra + 0.03);    // la mano se oculta bajo el agarre
    }
    // cuenta atrás con la mano cercana (3, 2, 1) y luego se agarra al borde de la mesa
    const cuenta = tramo(t, T.tres - 0.3, T.tres) * (1 - tramo(t, T.ya, T.ya + 0.2));
    if (cuenta > 0) {
      const n = t < T.dos ? 3 : t < T.uno ? 2 : 1, cambio = (tt) => tramo(t, tt - 0.06, tt + 0.04);
      const d3 = 1, d2 = 1 - cambio(T.dos), d1 = 1;
      cdedos = { pulgar: 0, indice: cuenta * d1, medio: cuenta * (1 - cambio(T.uno)), anular: cuenta * d2 * (1 - cambio(T.dos)), menique: 0 };
      void n; void d3;
    }
    const borde = tramo(t, T.ya, T.ya + 0.25);
    if (borde > 0) {
      const B = G.aHoja(p, { x: TX - 74 - 17 * tramo(Math.min(t,DESPEGA),T.carga,DESPEGA), y: TY + 2 });
      c = mezcla(c, manoDesde(B, 0, -4.2), borde); cmu = lerp(cmu, -4.2, borde); cang = lerp(cang, 0.15, borde);
    }
    // en el aire: brazos agitándose; tumbado: brazo cercano por encima de la cabeza y el lejano se levanta (se rinde)
    if (enAire) {
      const a = Math.min(1, v.k * 2.5), ag2 = Math.sin(t * 19);
      c = mezcla(c, { x: hc.x - 150, y: hc.y - 220 + 30 * ag2 }, a); cmu = lerp(cmu, -1.75, a);
      l = mezcla(l, { x: hl.x + 120, y: hl.y - 205 - 30 * ag2 }, a); lmu = lerp(lmu, -1.75, a); lpu = 1;
      const rinde = tramo(t, T.rinde0, T.rinde0 + 0.4) * (1 - tramo(t, T.rinde1, T.rinde1 + 0.3));
      const reposo = tumbado;
      c = mezcla(c, { x: hc.x + 80, y: hc.y - 240 }, reposo);
      l = mezcla(l, { x: hl.x + 60, y: hl.y + 240 }, reposo * (1 - rinde));
      l = mezcla(l, { x: hl.x + 250 + 8 * Math.sin(t * 23), y: hl.y - 40 }, rinde); lmu = lerp(lmu, 3.14, rinde);
      ldedos = { pulgar: rinde, indice: rinde, medio: rinde, anular: rinde, menique: rinde };
    }
    // La muñeca cercana no puede entrar en el radio mínimo de su brazo asimétrico.
    const cw=G.rotP({x:Math.cos(cmu)*R_M,y:Math.sin(cmu)*R_M},cang),cx=c.x+cw.x-hc.x,cy=c.y+cw.y-hc.y,cd=Math.hypot(cx,cy),cd2=(cd+88+Math.sqrt((cd-88)*(cd-88)+4))/2;
    c.x+=cx*(cd2/Math.max(cd,.001)-1);c.y+=cy*(cd2/Math.max(cd,.001)-1);
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: -1, puno: Math.max(b.cp, enAire ? 1 : 0), dedos: cdedos || { pulgar: 0, indice: 0, medio: 0, anular: 0, menique: 0 } };
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: -1, puno: lpu, dedos: ldedos || { pulgar: 0, indice: 0, medio: 0, anular: 0, menique: 0 } };
    p.vuelo = v;
    return p;
  }

  // vaso de Laura (tubo con pajita): en unidades de mano (JK), origen en el puño que lo agarra
  const VASO = { arriba: -30, abajo: 26, ancho: 11 };
  const PAJITA = { x: 9, y: -52 };
  function vaso(g, nivel, t) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const forma = () => { g.beginPath(); g.moveTo(-VASO.ancho, VASO.arriba); g.lineTo(VASO.ancho, VASO.arriba); g.lineTo(VASO.ancho * 0.88, VASO.abajo); g.lineTo(-VASO.ancho * 0.88, VASO.abajo); g.closePath(); };
    // pajita (por detrás del cristal de delante)
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 4.6; g.beginPath(); g.moveTo(-3, VASO.abajo - 8); g.lineTo(PAJITA.x, PAJITA.y); g.stroke();
    g.strokeStyle = "#ff5b7f"; g.lineWidth = 2.6; g.stroke();
    forma(); g.fillStyle = "rgba(214,236,255,0.28)"; g.fill();
    // bebida (rosa) con hielo y limón
    const top = lerp(VASO.abajo - 4, VASO.arriba + 9, nivel);
    g.save(); forma(); g.clip();
    g.fillStyle = "#ff8a5c"; g.fillRect(-VASO.ancho, top, VASO.ancho * 2, VASO.abajo - top);
    g.fillStyle = "#ff6f6f"; g.fillRect(-VASO.ancho, top + (VASO.abajo - top) * 0.55, VASO.ancho * 2, VASO.abajo);
    g.fillStyle = "rgba(255,255,255,0.75)";
    for (const [x, y] of [[-5, 4], [3, -6], [-1, 14]]) if (top < y - 4) { g.beginPath(); g.roundRect ? g.roundRect(x - 4, y - 4, 8, 8, 2) : g.rect(x - 4, y - 4, 8, 8); g.fill(); }
    g.fillStyle = "rgba(255,255,255,0.85)";
    for (let i = 0; i < 4; i++) { const ph = (t * 0.6 + i * 0.27) % 1, y = VASO.abajo - 4 - ph * (VASO.abajo - top - 4); if (y > top + 2) { g.beginPath(); g.arc(-6 + i * 4, y, 0.9, 0, Math.PI * 2); g.fill(); } }
    g.restore();
    // rodaja de limón en el borde
    g.fillStyle = "#f6e04a"; g.strokeStyle = "#6b5a0a"; g.lineWidth = 1.2;
    g.beginPath(); g.arc(-VASO.ancho + 1, VASO.arriba + 2, 7, Math.PI * 0.95, Math.PI * 2.05); g.closePath(); g.fill(); g.stroke();
    // brillo y contorno
    g.save(); forma(); g.clip(); g.fillStyle = "rgba(255,255,255,0.7)"; g.fillRect(-VASO.ancho + 3, VASO.arriba + 4, 2.4, VASO.abajo - VASO.arriba - 10); g.restore();
    forma(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.8; g.stroke();
    g.restore();
  }
  const VASO_MESA = { x: TX + 70, y: TY + 3 };             // base apoyada dentro del tablero, al alcance de Laura
  const nivelVaso = t => lerp(0.85, 0.62, tramo(t, T.sorbe0, T.sorbe1)) - 0.16 * tramo(t, T.sorbe2, T.sorbe3);
  const ESC_VASO = G.JK * S * L.K;                         // unidades de mano → pantalla para Laura

  function poseL(t) {
    if (!GEO) preparaGeo();
    const XL = GEO.xl, respira = Math.sin(t * 2.1 + 1);
    const p = {
      x: XL, suelo: SUELO, s: S, espejo: true, ikContinuo: true, tirasLimpias: true,
      pelvis: { x: L.PELVIS.x, y: L.PELVIS.y + 10 * tramo(t, T.mano0, T.agarra) + respira * 1.1 }, torso: 0.1 * tramo(t, T.mano0, T.agarra),
      torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {}, cabeza: { ang: 0, dx: 0, dy: 0, esc: { x: 1, y: 1 } }, pelo: { viento: 0, inercia: 0 }
    };
    // encoge los hombros (cabeza y hombros arriba un momento)
    const enc = campana(t, T.encoge, T.encoge + 0.45) + campana(t, T.sale + 0.12, T.sale + 0.55);
    p.cabeza.dy = 10 * enc; p.torsoEsc.y += 0.025 * enc; p.cabeza.ang = 0.06 * enc;
    // bostezo: cabeza atrás
    const bos = campana(t, T.bosteza0, T.bosteza1);
    p.cabeza.ang += -0.12 * bos;
    // golpe: se inclina un poco y el pelo se mueve con el impulso
    const zasK = campana(t, T.carga, T.zas + 0.35);
    p.torso += 0.08 * zasK; p.pelo.inercia = 0.5 * campana(t, T.zas, T.zas + 0.6) - 0.25 * campana(t, T.carga, T.zas);
    // la cabeza se ladea al mirar a cámara
    p.cabeza.ang += -0.05 * tramo(t, T.sopla1, T.sopla1 + 0.3) + 0.04 * Math.sin(t * 1.3) * 0.5;
    const pesoApoyo=tramo(t,T.mano0,T.agarra-.04)*(1-tramo(t,T.sopla0-.25,T.sopla0+.1));
    alineaCodo(L,p,munecaAgarre(agarre(t),ML),LL1,LL2,1,pesoApoyo);
    for (const lado of ["cerca", "lejos"]) {
      const fx = lado === "cerca" ? XL + 22 : XL - 20;
      p.piernas[lado] = { tob: { x: L.PELVIS.x + (L.aHoja(p, { x: fx, y: 0 }).x - L.PELVIS.x), y: TOB_L[lado] }, ang: 0 };
    }
    const ex = guion(GUION_CARA_L, CARAS_L, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [1.3, 3.0, 5.3, 8.6, 10.3, 12.1]));
    const guino=tramo(t,T.guino,T.guino+.12)*(1-tramo(t,T.guino+.5,T.guino+.65));
    p.cara.ojos.i=Math.max(p.cara.ojos.i,guino);
    // manos
    const Tr = L.tronco(p), hc = Tr(L.HOMBRO_C), hl = Tr(L.HOMBRO);
    const bolsC = Tr(L.BOLSILLO_C), bolsL = Tr(L.BOLSILLO_L);
    // lejana: del bolsillo al agarre; después del zas se queda un momento apretando la mesa, sube a la boca y sopla
    let l = bolsL, lmu = -1.75, lang = 0, lpu = 0, ldedos = { pulgar: 0, indice: 0, medio: 0, anular: 0, menique: 0 }, ldobla = -1;
    const ag = agarre(t), wL = L.aHoja(p, munecaAgarre(ag,ML));
    const va = tramo(t, T.mano0, T.agarra - 0.04);
    if (va > 0) {
      const muA = -4.75;
      lang=ag.ang*va;
      const objetivo = manoDesde(wL, lang, muA);
      const arco = { x: lerp(bolsL.x, objetivo.x, va), y: lerp(bolsL.y, objetivo.y, va) - 60 * Math.sin(Math.PI * va) };
      l = arco; lmu = lerp(-1.75, muA, va); lpu = Math.min(1, va * 2) * (1 - tramo(t, T.agarra - 0.05, T.agarra + 0.03));
      const ab = campana(t, T.mano0, T.agarra);
      ldedos = { pulgar: ab, indice: ab, medio: ab, anular: ab, menique: ab };
      ldobla = -1;
    }
    // tras el golpe: suelta (la mano aparece, apoyada en el tablero), sube y se sopla las yemas
    const suelta = tramo(t, DESPEGA, DESPEGA + .12);
    if (suelta > 0) {
      const objetivo = manoDesde(wL, -0.6, -4.2);
      l = mezcla(l,objetivo,suelta); lmu = lerp(lmu,-4.2,suelta); lang = lerp(lang,-.6,suelta); lpu = 1; ldobla = -1;
      const boca = L.boca(p), sube = tramo(t, T.sopla0 - 0.25, T.sopla0 + 0.1) * (1 - tramo(t, T.sopla1, T.sopla1 + 0.35));
      const yemas = { x: boca.x + 95, y: boca.y + 22 };
      l = mezcla(l, yemas, sube); lmu = lerp(lmu, -4.0, sube); lang = lerp(lang, 0.5, sube);
      const baja = tramo(t, T.sopla1, T.sopla1 + 0.35);
      l = mezcla(l, manoDesde(Tr(L.BOLSILLO_L), 0, -1.75), baja); lmu = lerp(lmu, -1.75, baja); lang = lerp(lang, 0, baja);
      lpu = lerp(lpu, 0, tramo(t, T.sopla1 + 0.2, T.sopla1 + 0.35));
      const cur = sube * 0.35;
      ldedos = { pulgar: 0.2 + cur, indice: 0.25 + cur, medio: 0.25 + cur, anular: 0.25 + cur, menique: 0.25 + cur };
    }
    // cercana: bolsillo → coge el vaso de la mesa → sorbe → lo deja → uñas → bosteza → … → vaso otra vez
    let c = bolsC, cmu = -1.75, cang = 0, cpu = 0, cdedos = { pulgar: 0, indice: 0, medio: 0, anular: 0, menique: 0 }, cobj = null;
    const mesa = L.aHoja(p, { x: VASO_MESA.x, y: VASO_MESA.y - VASO.abajo * ESC_VASO });    // centro del puño sobre el vaso apoyado
    const boca = L.boca(p);
    const enBoca = { x: boca.x - PAJITA.x * G.JK, y: boca.y - PAJITA.y * G.JK };
    const enPecho = { x: boca.x - 40, y: boca.y + 150 };
    const tramos = [
      // [t0, t1, destino, puño visible, dedos, conVaso]
      [T.vaso0, T.vasoCoge, "mesa", 1, 0.85, 0], [T.vasoCoge, T.vasoCoge + 0.08, "mesa", 1, 0.35, 1],
      [T.vasoCoge + 0.1, T.sorbe0, "boca", 1, 0.35, 1], [T.sorbe1, T.vasoDeja - 0.05, "mesa", 1, 0.35, 1],
      [T.vasoDeja, T.vasoDeja + 0.1, "mesa", 1, 0.9, 0], [T.unas0 - 0.15, T.unas0 + 0.2, "unas", 1, 0.8, 0],
      [T.bosteza0 + 0.05, T.bosteza0 + 0.3, "tapa", 1, 0.95, 0], [T.bosteza1, T.bosteza1 + 0.3, "cadera", 1, 0.2, 0],
      [T.copa0 - 0.3, T.copa0, "mesa", 1, 0.85, 0], [T.copa0, T.copa0 + 0.08, "mesa", 1, 0.35, 1],
      [T.copa0 + 0.1, T.sorbe2, "boca", 1, 0.35, 1], [T.sorbe3, T.sorbe3 + 0.35, "pecho", 1, 0.35, 1]
    ];
    const destinos = {
      bolsillo: () => ({ m: bolsC, mu: -1.75, ang: 0 }),
      mesa: () => ({ m: mesa, mu: -4.4, ang: 0 }),
      boca: () => ({ m: enBoca, mu: -4.4, ang: 0 }),
      pecho: () => ({ m: enPecho, mu: -4.4, ang: 0 }),
      unas: () => ({ m: { x: boca.x - 40, y: boca.y + 120 }, mu: -3.0, ang: 0.15 }),
      tapa: () => ({ m: { x: boca.x + 18, y: boca.y + 6 }, mu: -0.2, ang: 0.3 }),
      cadera: () => ({ m: { x: bolsC.x - 30, y: bolsC.y - 40 }, mu: -1.2, ang: 0.6 })
    };
    let estado = { ...destinos.bolsillo(), pu: 0, de: 0, vaso: 0 };
    for (const [t0, t1, nom, pu, de, conVaso] of tramos) {
      if (t <= t0) break;
      const k = suave(fase(t, t0, t1)), d = destinos[nom]();
      estado = { m: mezcla(estado.m, d.m, k), mu: lerp(estado.mu, d.mu, k), ang: lerp(estado.ang, d.ang, k), pu: lerp(estado.pu, pu, k), de: lerp(estado.de, de, k), vaso: conVaso };
    }
    c = estado.m; cmu = estado.mu; cang = estado.ang; cpu = estado.pu;
    const dd = estado.de;
    cdedos = { pulgar: dd, indice: dd, medio: dd, anular: dd, menique: dd };
    if (estado.vaso) { const nv = nivelVaso(t); cobj = (g, tt) => { g.save(); g.rotate(-cang); vaso(g, nv, tt); g.restore(); }; }
    p.vasoEnMano = !!estado.vaso;
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: -1, puno: cpu, dedos: cdedos, objeto: cobj };
    const lw=L.rotP({x:Math.cos(lmu)*R_M,y:Math.sin(lmu)*R_M},lang),lx=l.x+lw.x-hl.x,ly=l.y+lw.y-hl.y,ld=Math.hypot(lx,ly),ld2=(ld+74+Math.sqrt((ld-74)*(ld-74)+4))/2;
    l.x+=lx*(ld2/Math.max(ld,.001)-1);l.y+=ly*(ld2/Math.max(ld,.001)-1);
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: ldobla, puno: t>=DESPEGA?Math.max(lpu,t<T.sopla1+.2?1:0):lpu, dedos: ldedos };
    return p;
  }
  const pose = t => ({ g: poseG(t), l: poseL(t) });

  /* ---------- manos agarradas (pantalla) ---------- */
  function agarradas(g, t, pg) {
    const ag = agarre(t), v = pg.vuelo;
    const aparece = tramo(t, T.agarra - 0.06, T.agarra + 0.02), suelta = v.k > 0 ? 1 : 0;
    if (aparece <= 0 || suelta) return;
    const k = S * G.JK;
    g.save(); g.translate(ag.x, ag.y); g.rotate(ag.ang); g.scale(k * aparece, k * aparece);
    const colL = { piel: L.C.piel, sombra: L.C.pielSombra, tinta: "#0b0a0e" }, colG = { piel: G.C.piel, sombra: G.C.pielSombra, tinta: "#0b0a0e" };
    // la de Laura por detrás (un poco más pequeña) y la de Guillermo delante
    g.save(); g.translate(3.5, -1.5); g.rotate(0.15); g.scale(-0.9, 0.9); Personaje2D.puno(g, 0, colL); g.restore();
    g.save(); g.translate(-2.5, 1); g.rotate(-0.1); Personaje2D.puno(g, 0, colG); g.restore();
    // dedos de Laura que rodean la mano de Guillermo (asoman por su lado)
    g.lineCap = "round"; g.lineJoin = "round";
    for (let i = 0; i < 3; i++) {
      const y = -6 + i * 6.2;
      g.strokeStyle = "#0b0a0e"; g.lineWidth = 7.4; g.beginPath(); g.moveTo(-10, y); g.quadraticCurveTo(-19, y + 1, -18.5, y + 4.5); g.stroke();
      g.strokeStyle = colL.piel; g.lineWidth = 4.2; g.stroke();
    }
    // pulgares cruzados por encima
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 7.2; g.beginPath(); g.moveTo(-9, -11); g.quadraticCurveTo(0, -18, 9, -12); g.stroke();
    g.strokeStyle = colG.piel; g.lineWidth = 4.4; g.stroke();
    // ¡plas! al agarrarse
    const pl = fase(t, T.agarra - 0.03, T.agarra + 0.22);
    if (pl > 0 && pl < 1) {
      g.strokeStyle = `rgba(255,255,255,${1 - pl})`; g.lineWidth = 2.4; g.lineCap = "round";
      for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (i - 3.5) * 0.42, r0 = 20 + 14 * salida(pl); g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.lineTo(Math.cos(a) * (r0 + 8), Math.sin(a) * (r0 + 8)); g.stroke(); }
    }
    // tensión: venitas de esfuerzo alrededor
    const e = esfuerzo(t);
    if (e > 0.3) {
      g.strokeStyle = `rgba(255,255,255,${0.8 * (e - 0.3)})`; g.lineWidth = 1.6;
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + t * 3, r0 = 22 + 2 * Math.sin(t * 20 + i); g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.lineTo(Math.cos(a) * (r0 + 6), Math.sin(a) * (r0 + 6)); g.stroke(); }
    }
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrellaPuntas(g, x, y, r, puntas, rot, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function impacto(g, t, t0, x, y, tam) {
    const k = fase(t, t0, t0 + 0.32); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    estrellaPuntas(g, x, y, tam * (0.6 + 0.8 * salida(k)), 12, 0.3, 0.42); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 3; g.strokeStyle = "#0b0a0e"; g.stroke();
    estrellaPuntas(g, x, y, tam * (0.35 + 0.5 * salida(k)), 12, 0.55, 0.5); g.fillStyle = "#ffffff"; g.fill();
    g.strokeStyle = "#ffffff"; g.lineWidth = 3.5; g.lineCap = "round";
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + 0.2, r0 = tam * (0.9 + 0.9 * k), r1 = r0 + tam * 0.5; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // punto de pantalla de Guillermo con el vuelo aplicado
  function enVuelo(pg, q) {
    const v = pg.vuelo; if (!v.k) return q;
    const o = G.aPantalla(pg, pg.pelvis), c = Math.cos(v.phi), s = Math.sin(v.phi), dx = q.x - o.x, dy = q.y - o.y;
    return { x: o.x + v.dx + dx * c - dy * s, y: o.y + v.dy + dx * s + dy * c };
  }
  function estrellitas(g, t, pg) {
    const k = tramo(t, T.aterriza + 0.1, T.aterriza + 0.4) * (1 - tramo(t, T.fin - 0.3, T.fin + 0.2)); if (k <= 0.01) return;
    const c = enVuelo(pg, G.aPantalla(pg, G.cabeza(pg).a({ x: 760, y: 470 })));
    const pts = [];
    for (let i = 0; i < 5; i++) { const a = t * 4 + i * Math.PI * 2 / 5; pts.push({ a, x: c.x + 10 + Math.cos(a) * 62, y: c.y - 46 + Math.sin(a) * 15, z: Math.sin(a) }); }
    pts.sort((u, v) => u.z - v.z);
    g.save();
    for (const q of pts) { const r = (8.5 + 3 * q.z) * k; estrellaPuntas(g, q.x, q.y, r, 5, t * 3 + q.a, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2; g.strokeStyle = "#0b0a0e"; g.stroke(); }
    g.restore();
  }
  function lineasEsfuerzo(g, t, pg) {
    const e = esfuerzo(t) * tramo(t, 5.2, 6.0); if (e <= 0.02) return;
    const c = G.aPantalla(pg, G.cabeza(pg).a({ x: 640, y: 420 }));
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.75 * e})`; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const ph = (t * 3 + i / 3) % 1, a = -2.3 + i * 0.35, r0 = 16 + 18 * ph; g.globalAlpha = Math.sin(Math.PI * ph);
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0); g.lineTo(c.x + Math.cos(a) * (r0 + 10), c.y + Math.sin(a) * (r0 + 10)); g.stroke(); }
    g.restore();
  }
  function soplido(g, t, pl) {
    const k = tramo(t, T.sopla0 + 0.05, T.sopla0 + 0.2) * (1 - tramo(t, T.sopla1 - 0.2, T.sopla1)); if (k <= 0.01) return;
    const b = L.aPantalla(pl, L.boca(pl));
    g.save(); g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 2; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const ph = (t * 2.2 + i / 3) % 1; g.globalAlpha = k * Math.sin(Math.PI * ph);
      const x = b.x - 6 - 22 * ph, y = b.y + 2 + (i - 1) * 5 + 4 * ph;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - 5, y - 3, x - 10, y); g.stroke(); }
    g.restore();
  }
  function polvo(g, t, x0) {
    const k = fase(t, T.aterriza - 0.03, T.aterriza + 0.9); if (k <= 0 || k >= 1) return;
    g.save();
    for (let i = 0; i < 10; i++) { const lado = i % 2 ? 1 : -1, d = (30 + 110 * salida(k)) * (0.5 + hash(i + 70) * 0.7);
      g.globalAlpha = 0.42 * (1 - k); g.fillStyle = "#b99a7c";
      g.beginPath(); g.ellipse(x0 + lado * d, SUELO - 8 - 22 * k * hash(i + 71), 14 + 22 * k, 7 + 10 * k, 0, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // estela del despegue: rayas verticales debajo de Guillermo mientras sale disparado
  function estela(g, t, pg) {
    const k = tramo(t, DESPEGA, DESPEGA + 0.06) * (1 - tramo(t, T.sale - 0.05, T.sale + 0.15)); if (k <= 0.01) return;
    const v = pg.vuelo, o = G.aPantalla(pg, pg.pelvis), x0 = o.x + v.dx, y0 = o.y + v.dy + 120;
    g.save(); g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineCap = "round";
    for (let i = 0; i < 7; i++) {
      const x = x0 - 60 + i * 20 + 6 * hash(i + 90), largo = 60 + 90 * hash(i + 91), y = y0 + 20 * hash(i + 92);
      g.globalAlpha = k * (0.4 + 0.5 * hash(i + 93)); g.lineWidth = 2 + 2 * hash(i + 94);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x, Math.min(SUELO, y + largo)); g.stroke();
    }
    g.restore();
  }
  function sacudidaVaso(t) { return t >= T.zas ? Math.exp(-(t - T.zas) * 10) * Math.abs(Math.sin((t - T.zas) * 30)) * 9 : 0; }

  /* ---------- decorado ---------- */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 140; const g = c.getContext("2d");
    g.translate(60, 70);
    // pared azul noche con listones de madera
    const pared = g.createLinearGradient(0, -70, 0, 440); pared.addColorStop(0, "#101a33"); pared.addColorStop(1, "#22355c");
    g.fillStyle = pared; g.fillRect(-60, -70, W + 120, 520);
    for (let x = -60; x < W + 60; x += 34) { g.fillStyle = (x / 34) % 2 ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.06)"; g.fillRect(x, -70, 34, 520);
      g.fillStyle = "rgba(0,0,0,0.22)"; g.fillRect(x, -70, 2, 520); }
    // foco cálido sobre la mesa
    const foco = g.createRadialGradient(TX, 250, 20, TX, 250, 420); foco.addColorStop(0, "rgba(255,206,140,0.42)"); foco.addColorStop(0.55, "rgba(255,170,90,0.12)"); foco.addColorStop(1, "rgba(255,170,90,0)");
    g.fillStyle = foco; g.fillRect(-60, -70, W + 120, 520);
    // neón de un brazo sacando bíceps (sin letras)
    g.save(); g.translate(200, 110); g.lineCap = "round"; g.lineJoin = "round";
    const neon = () => { g.beginPath();            // silueta de un brazo sacando bíceps
      g.moveTo(-70, 34); g.lineTo(8, 34); g.quadraticCurveTo(40, 34, 40, 4); g.lineTo(40, -38);
      g.quadraticCurveTo(42, -62, 22, -62); g.quadraticCurveTo(2, -62, 2, -46); g.quadraticCurveTo(2, -34, 12, -30);
      g.lineTo(14, -6); g.quadraticCurveTo(-4, -46, -36, -22); g.quadraticCurveTo(-52, -10, -70, -10);
      g.moveTo(8, -50); g.lineTo(26, -50); g.moveTo(8, -42); g.lineTo(24, -42); };
    g.strokeStyle = "rgba(255,120,40,0.25)"; g.lineWidth = 18; neon(); g.stroke();
    g.strokeStyle = "rgba(255,150,60,0.55)"; g.lineWidth = 9; neon(); g.stroke();
    g.strokeStyle = "#ffd8a8"; g.lineWidth = 3.5; neon(); g.stroke();
    g.restore();
    // estante con trofeos
    g.fillStyle = "#5a3a22"; g.fillRect(760, 170, 220, 12); g.fillStyle = "#3a2414"; g.fillRect(760, 182, 220, 5);
    for (const [x, h, col] of [[790, 52, "#f2c14e"], [840, 70, "#e3e3e8"], [892, 44, "#d08a3a"], [940, 60, "#f2c14e"]]) {
      g.save(); g.translate(x, 170); g.lineJoin = "round";
      g.fillStyle = "#2a1a10"; g.fillRect(-12, -10, 24, 10);
      g.fillStyle = col; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.2;
      g.beginPath(); g.moveTo(-3, -10); g.lineTo(-3, -h * 0.45); g.lineTo(3, -h * 0.45); g.lineTo(3, -10); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(-14, -h); g.lineTo(14, -h); g.quadraticCurveTo(14, -h * 0.45, 0, -h * 0.42); g.quadraticCurveTo(-14, -h * 0.45, -14, -h); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.ellipse(-16, -h * 0.75, 5, 8, 0, 0, Math.PI * 2); g.ellipse(16, -h * 0.75, 5, 8, 0, 0, Math.PI * 2); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.6)"; g.fillRect(-9, -h + 3, 3, h * 0.35);
      g.restore();
    }
    // cuadros: siluetas de brazos echando un pulso (sin texto)
    for (const [x, y] of [[60, 60], [430, 40]]) {
      g.fillStyle = "#3b2414"; g.fillRect(x - 6, y - 6, 92, 72); g.fillStyle = "#e8d8b8"; g.fillRect(x, y, 80, 60);
      g.strokeStyle = "#6a4a30"; g.lineWidth = 6; g.lineCap = "round";
      g.beginPath(); g.moveTo(x + 14, y + 52); g.lineTo(x + 30, y + 24); g.lineTo(x + 40, y + 20); g.lineTo(x + 50, y + 24); g.lineTo(x + 66, y + 52); g.stroke();
    }
    // zócalo de madera
    const mad = g.createLinearGradient(0, 430, 0, SUELO); mad.addColorStop(0, "#4a2c18"); mad.addColorStop(1, "#2c180c");
    g.fillStyle = mad; g.fillRect(-60, 430, W + 120, SUELO - 430);
    g.fillStyle = "#7a4a28"; g.fillRect(-60, 424, W + 120, 10); g.fillStyle = "#a06a3a"; g.fillRect(-60, 424, W + 120, 3);
    g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = 2; for (let x = -40; x < W + 60; x += 80) { g.beginPath(); g.moveTo(x, 436); g.lineTo(x, SUELO); g.stroke(); }
    // suelo de tablones
    const su = g.createLinearGradient(0, SUELO, 0, H + 70); su.addColorStop(0, "#6a4024"); su.addColorStop(1, "#2a160a");
    g.fillStyle = su; g.fillRect(-60, SUELO, W + 120, H + 70 - SUELO);
    g.strokeStyle = "rgba(0,0,0,0.28)"; g.lineWidth = 2;
    for (let y = SUELO + 10; y < H + 70; y += 14 + (y - SUELO) * 0.25) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    g.fillStyle = "rgba(255,210,150,0.16)"; g.fillRect(-60, SUELO, W + 120, 2);
    // lámpara colgante encima de la mesa
    g.strokeStyle = "#0a0a0c"; g.lineWidth = 3; g.beginPath(); g.moveTo(TX, -70); g.lineTo(TX, 52); g.stroke();
    g.fillStyle = "#1c2a24"; g.beginPath(); g.moveTo(TX - 46, 82); g.quadraticCurveTo(TX, 30, TX + 46, 82); g.closePath(); g.fill();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.stroke();
    g.fillStyle = "#ffe8b0"; g.beginPath(); g.ellipse(TX, 82, 36, 8, 0, 0, Math.PI * 2); g.fill();
    const cono = g.createLinearGradient(0, 82, 0, 330); cono.addColorStop(0, "rgba(255,226,170,0.32)"); cono.addColorStop(1, "rgba(255,226,170,0)");
    g.fillStyle = cono; g.beginPath(); g.moveTo(TX - 36, 82); g.lineTo(TX + 36, 82); g.lineTo(TX + 170, 330); g.lineTo(TX - 170, 330); g.closePath(); g.fill();
    // viñeta
    const v = g.createRadialGradient(512, 300, 300, 512, 300, 720); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.55)");
    g.fillStyle = v; g.fillRect(-60, -70, W + 120, H + 140);
    return c;
  }
  // mesa alta redonda (pantalla); salta con el golpe
  function mesa(g, t) {
    const sal = t >= T.zas ? Math.exp(-(t - T.zas) * 8) * Math.abs(Math.sin((t - T.zas) * 26)) * 7 : 0;
    g.save(); g.translate(0, -sal); g.lineJoin = "round";
    // sombra en el suelo
    g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse(TX, SUELO + 2 + sal, 62, 7, 0, 0, Math.PI * 2); g.fill();
    // pie
    g.fillStyle = "#18161a"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5;
    g.beginPath(); g.ellipse(TX, SUELO - 4 + sal, 48, 8, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#2a282e"; g.fillRect(TX - 6, TY + 6, 12, SUELO - TY - 10 + sal); g.strokeRect(TX - 6, TY + 6, 12, SUELO - TY - 10 + sal);
    g.fillStyle = "rgba(255,255,255,0.2)"; g.fillRect(TX - 3, TY + 8, 2.5, SUELO - TY - 14);
    // tablero: canto y superficie
    g.fillStyle = "#5a3018"; g.beginPath(); g.ellipse(TX, TY + 6, 92, 12, 0, 0, Math.PI); g.lineTo(TX - 92, TY); g.ellipse(TX, TY, 92, 12, 0, Math.PI, 0, true); g.closePath(); g.fill(); g.stroke();
    const tab = g.createLinearGradient(TX - 92, 0, TX + 92, 0); tab.addColorStop(0, "#8a5228"); tab.addColorStop(0.5, "#b2723c"); tab.addColorStop(1, "#7a4420");
    g.fillStyle = tab; g.beginPath(); g.ellipse(TX, TY, 92, 12, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,240,210,0.25)"; g.beginPath(); g.ellipse(TX - 10, TY - 2, 50, 4, 0, 0, Math.PI * 2); g.fill();
    g.restore();
    return sal;
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const tension = tramo(t, 5.0, 8.0, suave) * (1 - tramo(t, T.zas + 0.1, T.zas + 0.8, suave));
    const final = tramo(t, T.zas + 0.2, T.aterriza + 0.4, suave);
    return { k: 1.02 + 0.1 * tension - 0.04 * final, x: 512 + 30 * tension - 50 * final + 10, y: 312 - 18 * tension + 6 * final };
  }

  class Pulso extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !L.listo()) return;
      if (!fondo) fondo = creaFondo();
      const P = pose(t), pg = P.g, pl = P.l;
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = (t >= T.zas ? 7 * Math.exp(-(t - T.zas) * 7) * suave(fase(t, T.zas, T.zas + 0.04)) : 0) + (t >= T.aterriza ? 5 * Math.exp(-(t - T.aterriza) * 8) * suave(fase(t, T.aterriza, T.aterriza + 0.04)) : 0);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -60, -70);
      // sombras de los dos
      const v = pg.vuelo, og = G.aPantalla(pg, pg.pelvis);
      g.save(); g.fillStyle = "rgba(0,0,0,0.36)";
      const ancho = lerp(105, 150, v.suelo), alto = 1 - 0.6 * clamp(-v.dy / 160) * (1 - v.suelo);
      g.beginPath(); g.ellipse(og.x + v.dx - 40 * v.suelo, SUELO + 1, ancho * alto, 9 * alto, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pl.x, SUELO + 1, 85, 8, 0, 0, Math.PI * 2); g.fill(); g.restore();
      const sal = mesa(g, t);
      // Guillermo (con el vuelo aplicado)
      g.save();
      if (v.k > 0) { g.translate(og.x + v.dx, og.y + v.dy); g.rotate(v.phi); g.translate(-og.x, -og.y); }
      if (!v.fuera) G.dibujar(g, pg, t);
      g.restore();
      // Laura
      L.dibujar(g, pl, t);
      // vaso apoyado en el borde delantero de la mesa (delante del brazo de Laura)
      if (!pl.vasoEnMano) {
        g.save(); g.translate(VASO_MESA.x, VASO_MESA.y - VASO.abajo * ESC_VASO - sal - sacudidaVaso(t)); g.scale(-ESC_VASO, ESC_VASO); vaso(g, nivelVaso(t), t); g.restore();
      }
      agarradas(g, t, pg);
      const pin = agarre(T.zas + 0.1);
      impacto(g, t, T.zas + 0.06, pin.x - 6, TY - 6, 34);
      impacto(g, t, T.aterriza, og.x + DX_CAE - 70, SUELO - 22, 40);
      polvo(g, t, og.x + DX_CAE - 60);
      estela(g, t, pg);
      lineasEsfuerzo(g, t, pg);
      soplido(g, t, pl);
      estrellitas(g, t, pg);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00011.2", nombre: "Guillermo y Laura · El pulso", crear: () => new Pulso() });
  window.__A2D_00011_2 = { pose, T, DUR, camara, agarre, munecaAgarre, MG, ML, TY, TX, SUELO, DESPEGA, vuelo, enVuelo, PAJITA, VASO, VASO_MESA, ESC_VASO, nivelVaso, geo: () => (GEO || preparaGeo(), GEO) };
})();
