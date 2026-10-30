"use strict";
/* 00015 · Guillermo y Laura · La tarta
 *
 * Negro → fiesta de cumpleaños con la luz apagada. Guillermo, con gorro de fiesta, espera con las
 * manos en los bolsillos. Laura entra por la derecha con una tarta con las velas encendidas (su luz
 * cálida ilumina a los dos) y la deja en la mesa alta → Guillermo coge aire y sopla: se apagan…
 * y se vuelven a encender solas (velas trucadas, chispitas). Sopla más fuerte, apoyado en la mesa,
 * rojo del esfuerzo: se apagan… y vuelven a encenderse. Laura se tapa la boca para no reírse →
 * Guillermo, enfadado, coge muchísimo aire, se inclina demasiado, pierde el equilibrio y planta la
 * cara en la tarta (salpica la nata) → saca la cara cubierta de nata, con una vela clavada en la
 * nariz que se vuelve a encender; parpadea entre la nata → Laura se parte de risa, le quita un poco
 * de nata de la mejilla con el dedo y la prueba → Guillermo sopla hacia arriba la vela de la nariz,
 * se apaga… y se vuelve a encender. Él se rinde; ella le guiña un ojo a cámara → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto t.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, L = Laura;
  const S = 0.3, SUELO = 548, DUR = 14.25;
  const XG = 360;                                  // pelvis de Guillermo (pantalla)
  const XL0 = 1215, XL1 = 628, XL2 = 690, XL3 = 616; // Laura: entra, deja la tarta, se aparta, se acerca a limpiarle
  const MESA = { x: 512, y: 300, rx: 76, ry: 12 }; // tablero de la mesa alta
  const TAR = { r: 38, h: 34, ry: 8, plato: 50 };  // tarta (pantalla)
  const T = {
    entra0: 0.55, llega: 2.45, deja0: 2.5, deja1: 3.08, aparta0: 3.32, aparta1: 3.8,
    ve: 1.0, aplaude0: 1.35, aplaude1: 2.45,
    inclina1: 3.65, sopla1: 3.98, fin1: 4.45, orgullo: 4.6, enciende1: 5.25,
    inclina2: 5.75, sopla2: 6.2, fin2: 6.95, frente: 7.05, enciende2: 7.55,
    inspira0: 8.0, inspira1: 8.55, inclina3: 8.62, plaf: 9.1, saca0: 9.8, saca1: 10.3,
    risa0: 10.2, risa1: 11.05, nariz: 10.45, parp1: 10.6, parp2: 10.85,
    acerca0: 11.0, acerca1: 11.4, toca: 11.6, limpia1: 11.9, boca0: 11.95, prueba: 12.3, prueba1: 12.6,
    mira: 12.62, soplaN: 12.85, soplaN1: 13.05, enciendeN: 13.22, rinde: 13.3,
    fin: 13.55
  };

  /* ---------- utilidades de postura ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function linea(guion, tabla, inicio, t) {
    let c = tabla[inicio];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, tabla[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const BASE_CARA = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, esp: 0, mof: 0, rub: 0 };
  const E = o => Object.assign({}, BASE_CARA, o);
  function cara(e) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp, ojos: { d: e.c, i: e.c, feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_GC = punoDesde({ x: 131, y: 652 }, -1.75), BOLS_GL = punoDesde({ x: 372, y: 648 }, -1.75);
  const D = k => ({ pulgar: k, indice: k, medio: k, anular: k, menique: k });

  /* ---------- caminata de Laura (de derecha a izquierda, mirando a la izquierda) ---------- */
  // Pasos: [t0, t1, x de pantalla del tobillo]. Cada pie se queda quieto mientras el otro avanza.
  const PIE_L = { cerca: 14, lejos: -16 };        // tobillos en reposo respecto a la pelvis (pantalla, mirando a la izquierda)
  function pasos(x0, x1, t0, t1, n) {
    const P = { cerca: [[-10, -9, x0 + PIE_L.cerca]], lejos: [[-10, -9, x0 + PIE_L.lejos]] };
    const dt = (t1 - t0) / n;
    for (let k = 0; k < n; k++) {
      const lado = k % 2 ? "cerca" : "lejos", ta = t0 + k * dt, tb = ta + dt * 1.05;
      const u = fase(tb, t0, t1), xp = lerp(x0, x1, suave(u) * 0.35 + u * 0.65);
      const avance = k >= n - 2 ? 0 : -(x0 - x1) / n * 0.55;      // el pie aterriza por delante de la pelvis
      P[lado].push([ta, tb, xp + PIE_L[lado] + avance]);
    }
    return P;
  }
  const PASOS_L = pasos(XL0, XL1, T.entra0, T.llega, 8);
  // pasos extra: atrás tras dejar la tarta y adelante para limpiarle la mejilla
  PASOS_L.lejos.push([T.aparta0, T.aparta0 + 0.24, XL2 + PIE_L.lejos], [T.acerca0, T.acerca0 + 0.24, XL3 + PIE_L.lejos - 6]);
  PASOS_L.cerca.push([T.aparta0 + 0.2, T.aparta0 + 0.44, XL2 + PIE_L.cerca], [T.acerca0 + 0.2, T.acerca0 + 0.44, XL3 + PIE_L.cerca + 4]);
  function xLaura(t) {
    if (t < T.llega + 0.05) { const u = fase(t, T.entra0, T.llega); return lerp(XL0, XL1, suave(u) * 0.35 + u * 0.65 - 0.02 * Math.sin(Math.PI * u)); }
    let x = XL1;
    x = lerp(x, XL2, suave(fase(t, T.aparta0 + 0.05, T.aparta0 + 0.45)));
    x = lerp(x, XL3, suave(fase(t, T.acerca0 + 0.05, T.acerca0 + 0.45)));
    return x;
  }
  function pieDe(lista, t) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    return { x: lerp(xa, x, suave5(u)), lev: Math.sin(Math.PI * u) * (Math.abs(x - xa) > 4 ? 1 : 0), u };
  }

  /* ---------- cuerpo de Guillermo ---------- */
  // dx: pelvis (px), pel: pelvis (hoja, + abajo), manos respecto a su hombro (hoja); cd/ld: dedos (0 puño … 1 abierta)
  const GP0 = { dx: 0, pel: 0, torso: 0, cab: 0, esc: 1, cx: 49, cy: 340, ca: 0, cmu: -1.75, cp: 0, cd: 0, lx: 0, ly: 300, la: 0, lmu: -1.75, lp: 0, ld: 0, cuelga: 0 };
  const GC = o => Object.assign({}, GP0, o);
  // Brazos siempre poco doblados (el codo del recortable se ve limpio sin rodajas en cuña).
  const ATRAS = { cx: -180, cy: 230, ca: 0.5, cmu: -1.2, cp: 1, lx: -190, ly: 200, la: 0.5, lmu: -1.0, lp: 1 };
  const CUERPO_G = {
    bolsillos: GC({}),
    frota: GC({ pel: 6, cx: 245, cy: 253, ca: -0.2, cmu: -2.3, cp: 1, cd: 1, lx: -25, ly: 218, la: 0.2, lmu: -1.0, lp: 1, ld: 1 }),
    sopla1: GC({ torso: 0.33, cab: 0.12, pel: 10 }),
    orgullo: GC({ torso: -0.06, cab: -0.06, pel: -4 }),
    sopla2: GC(Object.assign({ torso: 0.42, cab: 0.1, pel: 18 }, ATRAS)),
    frente: GC({ torso: 0.06, cab: -0.05 }),
    enfado: GC({ torso: 0.05, cab: 0.05, cx: 40, cy: 300, cp: 1, lx: 20, ly: 262, lp: 1 }),
    inspira: GC(Object.assign({ dx: -6, pel: -38, torso: -0.16, cab: -0.14, esc: 1.1, cd: 0.6, ld: 0.6 }, ATRAS, { cy: 250, ly: 215 })),
    inclina: GC({ dx: 14, pel: -20, torso: 0.52, cab: 0.16, esc: 1.04, cp: 1, cd: 1, lp: 1, ld: 1, cmu: -1.2, lmu: -1.2 }),
    plaf: GC({ dx: 18, pel: 22, torso: 0.8, cab: 1.25, esc: 1, cp: 1, cd: 0.75, lp: 1, ld: 0.75, cuelga: 1 }),
    saca: GC({ dx: 18, pel: 4, torso: 0.7, cab: 0.26, cp: 1, cd: 0.75, lp: 1, ld: 0.75, cuelga: 1 }),
    rinde: GC({ dx: 14, pel: 10, torso: 0.64, cab: 0.36, cp: 1, cd: 0.75, lp: 1, ld: 0.75, cuelga: 1 })
  };
  const GUION_G = [
    [T.aplaude0 - 0.25, T.aplaude0, "frota"], [T.aplaude1, T.aplaude1 + 0.4, "bolsillos"],
    [T.inclina1, T.sopla1, "sopla1"], [T.orgullo, T.orgullo + 0.35, "orgullo"],
    [T.enciende1 + 0.05, T.enciende1 + 0.3, "bolsillos"], [T.inclina2, T.sopla2, "sopla2"], [T.frente, T.frente + 0.3, "frente"],
    [T.enciende2 + 0.05, T.enciende2 + 0.3, "enfado"], [T.inspira0, T.inspira1, "inspira"], [T.inclina3, T.plaf - 0.12, "inclina"],
    [T.plaf - 0.12, T.plaf, "plaf", entrada], [T.saca0, T.saca1, "saca"], [T.rinde, T.rinde + 0.5, "rinde"]
  ];
  const CARAS_G = {
    espera: E({ mx: 0.9, my: 0, sonr: 0.3, orig: 0 }),
    ve: E({ mx: 0.95, my: 0.1, iris: 1.1, sd: 20, gd: 0.15, si: 20, gi: 0.15, orig: 0, abre: 26, ancho: 0.7, sonr: 0.5 }),
    ilusion: E({ mx: 0.95, my: 0.2, c: 0.55, h: 1, sd: 14, gd: 0.12, si: 14, gi: 0.12, orig: 0, abre: 30, ancho: 1.15, sonr: 1 }),
    mira: E({ mx: 0.9, my: 0.45, sd: 6, si: 6, orig: 0, sonr: 0.55 }),
    inspira1: E({ mx: 0.9, my: 0.5, sd: 8, si: 8, orig: 0, mof: 1, abre: 0, ancho: 0.6, sonr: -0.1 }),
    sopla1: E({ mx: 0.9, my: 0.5, c: 0.3, sd: 4, si: 4, orig: 0, abre: 14, ancho: 0.32, sonr: -0.2, lengua: 0 }),
    orgullo: E({ mx: -0.85, my: -0.25, c: 0.25, sd: 14, gd: 0.15, si: 2, gi: -0.05, orig: 0, sonr: 0.85, ancho: 1.05 }),
    sorpresa: E({ mx: 0.9, my: 0.45, iris: 1.12, sd: 24, gd: 0.18, si: 24, gi: 0.18, orig: 0, abre: 30, ancho: 0.62, sonr: 0 }),
    inspira2: E({ mx: 0.9, my: 0.5, c: 0.45, z: 0.4, sd: -6, gd: -0.15, si: -6, gi: -0.15, orig: 0, mof: 1, rub: 0.6, ancho: 0.6, sonr: -0.2 }),
    sopla2: E({ mx: 0.9, my: 0.5, c: 0.8, z: 0.8, sd: -10, gd: -0.2, si: -10, gi: -0.2, orig: 0, abre: 18, ancho: 0.36, sonr: -0.3, rub: 1 }),
    frente: E({ mx: -0.8, my: -0.2, c: 0.4, h: 0.6, sd: 10, si: 10, orig: 0, sonr: 0.7, abre: 4 }),
    enfado: E({ mx: 0.9, my: 0.4, c: 0.32, sd: -14, gd: -0.28, si: -14, gi: -0.28, orig: 0, abre: 10, ancho: 1.1, sonr: -0.75 }),
    inspira3: E({ mx: 0.9, my: 0.3, c: 0.5, z: 0.5, sd: -10, gd: -0.25, si: -10, gi: -0.25, orig: 0, mof: 1, rub: 0.8, ancho: 0.55, sonr: -0.3 }),
    panico: E({ mx: 0.9, my: 0.6, iris: 0.82, sd: 26, gd: 0.2, si: 26, gi: 0.2, orig: 0, abre: 40, ancho: 0.75, sonr: -0.3, lengua: 0.4 }),
    plaf: E({ mx: 0, my: 0, c: 1, z: 1, sd: 10, si: 10, orig: 0, abre: 20, ancho: 0.8, sonr: -0.2 }),
    nata: E({ mx: 0, my: 0, c: 1, sd: 4, si: 4, orig: 0, abre: 0, ancho: 0.9, sonr: -0.1 }),
    aturdido: E({ mx: 0.6, my: 0.75, iris: 0.95, sd: 16, gd: 0.1, si: 16, gi: 0.1, orig: 0, abre: 6, ancho: 0.8, sonr: -0.1 }),
    aLaura: E({ mx: 1, my: 0.1, sd: 12, si: 12, orig: 0, abre: 4, ancho: 0.8, sonr: 0.2 }),
    relame: E({ mx: 0.95, my: 0, c: 0.35, h: 0.6, sd: 10, si: 10, orig: 0, abre: 18, ancho: 0.95, sonr: 0.8, lengua: 1 }),
    vela: E({ mx: 0.65, my: 0.85, sd: 18, gd: 0.1, si: 18, gi: 0.1, orig: 0, abre: 0, ancho: 0.7, sonr: -0.1 }),
    soplaN: E({ mx: 0.65, my: 0.9, c: 0.25, sd: 18, si: 18, orig: 0, abre: 20, ancho: 0.45, sonr: -0.4 }),
    rinde: E({ mx: -0.9, my: -0.1, c: 0.55, sd: -4, gd: 0.25, si: -4, gi: 0.25, orig: 0, abre: 0, ancho: 0.9, sonr: -0.45 })
  };
  const GUION_CARA_G = [
    [T.ve, T.ve + 0.18, "ve"], [T.aplaude0, T.aplaude0 + 0.3, "ilusion"], [T.aplaude1 + 0.1, T.aplaude1 + 0.4, "mira"],
    [T.inclina1 + 0.12, T.sopla1, "inspira1"], [T.sopla1, T.sopla1 + 0.1, "sopla1"], [T.orgullo, T.orgullo + 0.3, "orgullo"],
    [T.enciende1 + 0.05, T.enciende1 + 0.18, "sorpresa"], [T.inclina2 + 0.15, T.sopla2, "inspira2"], [T.sopla2, T.sopla2 + 0.12, "sopla2"],
    [T.frente, T.frente + 0.3, "frente"], [T.enciende2 + 0.08, T.enciende2 + 0.25, "enfado"], [T.inspira0 + 0.1, T.inspira1, "inspira3"],
    [T.inclina3 + 0.15, T.inclina3 + 0.3, "panico"], [T.plaf - 0.04, T.plaf, "plaf"], [T.plaf + 0.3, T.plaf + 0.6, "nata"],
    [T.parp1 - 0.02, T.parp1 + 0.2, "aturdido"], [T.toca - 0.1, T.toca + 0.15, "aLaura"], [T.boca0 + 0.15, T.boca0 + 0.4, "relame"],
    [T.mira - 0.05, T.mira + 0.2, "vela"], [T.soplaN, T.soplaN + 0.06, "soplaN"], [T.soplaN1, T.soplaN1 + 0.15, "vela"], [T.rinde, T.rinde + 0.35, "rinde"]
  ];
  const PARP_G = [0.55, 2.9, 4.95, 9.98, T.parp1 - 0.1, T.parp2, 12.0];

  // Pies de Guillermo: casi quieto; en el gran soplido se pone de puntillas y el pie lejano se levanta por detrás.
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  function piesG(t, p) {
    const punt = tramo(t, T.inspira0, T.inspira1) * (1 - tramo(t, T.inclina3, T.inclina3 + 0.2)) + 0.6 * tramo(t, T.inclina3 + 0.2, T.plaf) * (1 - tramo(t, T.saca0, T.saca1));
    const pata = tramo(t, T.inclina3 + 0.25, T.plaf + 0.05, salida) * (1 - tramo(t, T.saca0 + 0.1, T.saca1, suave));
    const pataleo = Math.sin((t - T.plaf) * 15) * campana(t, T.plaf + 0.15, T.saca0);
    const hojaX = x => G.PELVIS.x + (x - p.x) / S;
    const cerca = { tob: { x: hojaX(XG - 19), y: TOB_G - 46 * punt }, ang: -0.5 * punt };
    const lejos = { tob: { x: hojaX(XG + 18) - 230 * pata + 20 * pataleo, y: TOB_G - 12 - 46 * punt * (1 - pata) - 190 * pata + 25 * pataleo }, ang: -0.5 * punt * (1 - pata) + 0.9 * pata };
    return { cerca, lejos };
  }

  let MAQ = null;                                   // geometría que depende de las posturas (se calcula una vez)

  function poseG(t) {
    const b = linea(GUION_G, CUERPO_G, "bolsillos", t);
    const respira = Math.sin(t * 2.2);
    // saltitos de ilusión mientras aplaude
    const salta = tramo(t, T.aplaude0, T.aplaude0 + 0.15) * (1 - tramo(t, T.aplaude1 - 0.1, T.aplaude1 + 0.1));
    const bote = Math.abs(Math.sin((t - T.aplaude0) * Math.PI * 3.6)) * salta;
    // golpe en la tarta: aplastamiento y rebote
    const golpe = t >= T.plaf ? Math.exp(-(t - T.plaf) * 7) * suave(fase(t, T.plaf, T.plaf + 0.03)) : 0;
    const p = {
      x: XG + b.dx, suelo: SUELO, s: S, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 - 18 * bote + 10 * golpe },
      torso: b.torso + 0.04 * golpe, torsoEsc: { x: 1 + (b.esc - 1) * 0.6, y: b.esc + respira * 0.004 },
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }, cara: null, piernas: null
    };
    // soplidos: la cabeza empuja un poco hacia delante; enfado: tiembla
    p.cabeza.ang += 0.05 * campana(t, T.sopla1, T.fin1) + 0.08 * campana(t, T.sopla2, T.fin2);
    const tiembla = campana(t, T.sopla2 - 0.1, T.fin2) * 0.7 + campana(t, T.enciende2 + 0.1, T.inspira0 + 0.2) * 0.5;
    p.cabeza.ang += 0.02 * ruido(t * 30) * tiembla; p.torso += 0.01 * ruido(t * 26 + 4) * tiembla;
    // brazos como aspas al perder el equilibrio
    const aspas = campana(t, T.inclina3 + 0.1, T.plaf);
    p.piernas = piesG(t, p);
    // cara
    const e = linea(GUION_CARA_G, CARAS_G, "espera", t);
    e.c = Math.max(e.c, parpadeo(t, PARP_G));
    p.cara = cara(e);
    p.rojo = 0.45 * tramo(t, T.inclina2 + 0.2, T.sopla2 + 0.2) * (1 - tramo(t, T.frente, T.frente + 0.4)) + 0.5 * tramo(t, T.enciende2 + 0.1, T.enciende2 + 0.35) * (1 - tramo(t, T.plaf - 0.2, T.plaf));
    p.sudor = 0.8 * tramo(t, T.sopla2, T.sopla2 + 0.3) * (1 - tramo(t, T.inspira0 + 0.3, T.plaf));
    p.enfado = tramo(t, T.enciende2 + 0.12, T.enciende2 + 0.32) * (1 - tramo(t, T.inspira1, T.inclina3 + 0.1));
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    let c = { x: hc.x + b.cx, y: hc.y + b.cy }, l = { x: hl.x + b.lx, y: hl.y + b.ly };
    const enBolsC = 1 - clamp(b.cp * 1.5), enBolsL = 1 - clamp(b.lp * 1.5);
    c = mezcla(c, Tr(BOLS_GC), enBolsC * (1 - b.cp)); l = mezcla(l, Tr(BOLS_GL), enBolsL * (1 - b.lp));
    // aplausos: las manos se juntan y se separan
    const ap = tramo(t, T.aplaude0, T.aplaude0 + 0.15) * (1 - tramo(t, T.aplaude1 - 0.1, T.aplaude1 + 0.1));
    if (ap > 0) { const fr = Math.sin((t - T.aplaude0) * Math.PI * 6) * ap; c.x += 16 * fr; l.x -= 16 * fr; c.y -= 4 * fr; l.y += 4 * fr; }
    // aspas
    if (aspas > 0) {
      const a = (t - T.inclina3) * 16;
      c = mezcla(c, { x: hc.x + Math.cos(a) * 300, y: hc.y + Math.sin(a) * 300 }, aspas * 0.9);
      l = mezcla(l, { x: hl.x + Math.cos(a + 2.2) * 262, y: hl.y + Math.sin(a + 2.2) * 262 }, aspas * 0.9);
    }
    // con la cara en la tarta los brazos cuelgan, flojos, por delante del mantel (en vertical en pantalla)
    if (b.cuelga > 0.001) {
      const bal = 0.12 * Math.sin((t - T.plaf) * 3.1) * Math.exp(-Math.max(0, t - T.plaf) * 0.8);
      const cc = G.aHoja(p, G.aPantalla(p, hc)), cl = G.aHoja(p, G.aPantalla(p, hl));
      c = mezcla(c, { x: cc.x + 300 * Math.sin(bal) - 10, y: cc.y + 300 * Math.cos(bal) }, b.cuelga);
      l = mezcla(l, { x: cl.x + 255 * Math.sin(-bal) + 8, y: cl.y + 255 * Math.cos(bal) }, b.cuelga);
    }
    const cuelgaMu = -1.6;
    p.manoCerca = { x: c.x, y: c.y, ang: b.ca, mu: lerp(b.cmu, cuelgaMu, b.cuelga), dobla: -1, puno: b.cp, dedos: D(b.cd) };
    p.manoLejos = { x: l.x, y: l.y, ang: b.la, mu: lerp(b.lmu, cuelgaMu, b.cuelga), dobla: -1, puno: b.lp, dedos: D(b.ld) };
    p.capaCabeza = (g, tt) => capaCabezaG(g, tt, p);
    p.capaTronco = (g) => sobaco(g, p);
    return p;
  }
  // Al inclinarse mucho, entre el costado del torso y el brazo lejano (que cuelga hacia delante) queda una
  // rendija: se rellena con el color de la camiseta en el hueco del sobaco (coordenadas del torso).
  const CAMISETA = (() => { const c = G.A.datos.paleta.camiseta; return `rgb(${c[0]},${c[1]},${c[2]})`; })();
  function sobaco(g, p) {
    const m = p.manoLejos; if (!m) return;
    const dx = m.x - p.pelvis.x, dy = m.y - p.pelvis.y, c = Math.cos(-p.torso), s = Math.sin(-p.torso);
    const loc = { x: G.PELVIS.x + (dx * c - dy * s) / p.torsoEsc.x, y: G.PELVIS.y + (dx * s + dy * c) / p.torsoEsc.y };
    const h = { x: 364, y: 386 }, L = Math.hypot(loc.x - h.x, loc.y - h.y) || 1, d = { x: (loc.x - h.x) / L, y: (loc.y - h.y) / L };
    if (d.x < 0.05) return;                                   // brazo pegado o hacia atrás: no hay rendija
    const p3 = { x: h.x + d.x * 150, y: h.y + d.y * 150 };
    const yB = clamp(p3.y + 30, 430, 600);
    g.save(); g.fillStyle = CAMISETA; g.beginPath();
    g.moveTo(336, 336); g.lineTo(h.x, h.y - 6); g.lineTo(h.x + d.x * 40, h.y + d.y * 40); g.lineTo(p3.x, p3.y); g.lineTo(338, yB); g.closePath(); g.fill();
    // contorno de la tela entre el brazo y el costado
    g.lineCap = "round"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 6; g.beginPath(); g.moveTo(p3.x - d.y * 4, p3.y + d.x * 4); g.quadraticCurveTo((p3.x + 338) / 2 - 6, (p3.y + yB) / 2 + 10, 338, yB); g.stroke();
    g.restore();
  }

  /* ---------- cuerpo de Laura (mira a la izquierda; +x de su hoja = hacia Guillermo) ---------- */
  const LP0 = { pel: 0, torso: 0, cab: 0, cx: 0, cy: 0, cmu: -1.75, cd: 0, cb: 0, lx: 0, ly: 0, lmu: -1.75, ld: 0, lin: 0, tarta: 0, panza: 0, boca: 0, dedo: 0 };
  const LC = o => Object.assign({}, LP0, o);
  const CUERPO_L = {
    lleva: LC({ tarta: 1, cd: 0.4, ld: 0.4 }),
    deja: LC({ torso: 0.24, cab: 0.08, pel: 12, tarta: 1, cd: 0.4, ld: 0.4 }),
    junta: LC({ cx: 175, cy: 222, cmu: -2.6, cd: 0.35, lx: -60, ly: 225, lmu: -1.2, ld: 0.35, cab: 0.02 }),
    aplaude: LC({ cx: 168, cy: 205, cmu: -2.7, cd: 1, lx: -45, ly: 200, lmu: -1.1, ld: 1, cab: 0.02 }),
    tapa: LC({ cx: 175, cy: 222, cmu: -2.6, cd: 0.35, ld: 1, boca: 1, cab: -0.04, torso: -0.04 }),
    susto: LC({ torso: -0.08, cab: -0.08, pel: -6, cx: 150, cy: -10, cmu: -2.2, cd: 1, lx: 60, ly: -60, lmu: -2.4, ld: 1 }),
    risa: LC({ torso: -0.14, cab: -0.16, pel: 10, cd: 0.8, ld: 0.8, panza: 1 }),
    acerca: LC({ torso: 0.3, cab: 0.06, pel: 16, cb: 1, ld: 0, lin: 1 }),
    limpia: LC({ torso: 0.32, cab: 0.08, pel: 16, cb: 1, dedo: 1 }),
    prueba: LC({ torso: 0.06, cab: -0.04, pel: 4, cb: 1, dedo: 1, boca: 1 }),
    guino: LC({ torso: 0, cab: -0.06, pel: 2, cb: 1, dedo: 1 })
  };
  const GUION_L = [
    [T.deja0, T.deja0 + 0.35, "deja"], [T.deja1 + 0.02, T.deja1 + 0.4, "junta"], [T.orgullo, T.orgullo + 0.2, "aplaude"],
    [T.enciende1 + 0.15, T.enciende1 + 0.45, "tapa"], [T.inclina2, T.inclina2 + 0.4, "junta"], [T.enciende2 + 0.12, T.enciende2 + 0.4, "tapa"],
    [T.plaf - 0.02, T.plaf + 0.14, "susto"], [T.risa0, T.risa0 + 0.35, "risa"], [T.acerca0, T.acerca1, "acerca"],
    [T.toca - 0.2, T.toca, "limpia"], [T.boca0, T.prueba, "prueba"], [T.rinde - 0.1, T.rinde + 0.3, "guino"]
  ];
  const CARAS_L = {
    lleva: E({ mx: 0.9, my: 0.15, orig: 0, sonr: 0.85, ancho: 0.95, abre: 6, c: 0.2, h: 0.4, sd: 8, si: 8 }),
    mira: E({ mx: 0.85, my: 0.25, orig: 0, sonr: 0.6, sd: 6, si: 6 }),
    camara: E({ mx: -0.6, my: -0.1, orig: 0, sonr: 0.75, sd: 10, si: 10 }),
    aplaude: E({ mx: 0.85, my: 0.1, c: 0.55, h: 1, orig: 0, sonr: 1, abre: 14, sd: 12, si: 12 }),
    risita: E({ mx: 0.85, my: 0.3, c: 0.6, h: 1, orig: 0, sonr: 0.8, abre: 4, sd: 14, si: 14, mof: 0.6, rub: 0.5 }),
    ceja: E({ mx: 0.85, my: 0.25, orig: 0, sonr: 0.45, sd: 20, gd: 0.1, si: 4, gi: -0.05 }),
    susto: E({ mx: 0.85, my: 0.35, iris: 1.1, orig: 0, abre: 30, ancho: 0.6, sonr: 0, sd: 24, gd: 0.15, si: 24, gi: 0.15 }),
    risa: E({ mx: 0.6, my: 0, c: 0.95, h: 1, orig: 0, sonr: 1, abre: 38, ancho: 1.15, sd: 16, si: 16, rub: 0.8 }),
    tierna: E({ mx: 0.95, my: 0.2, c: 0.25, h: 0.6, orig: 0, sonr: 0.75, abre: 4, sd: 10, si: 10, rub: 0.4 }),
    prueba: E({ mx: 0.4, my: -0.2, c: 0.95, h: 1, orig: 0, sonr: 0.5, abre: 6, ancho: 0.7, sd: 14, si: 14, rub: 0.6 }),
    guino: E({ mx: -0.75, my: -0.1, orig: 0, sonr: 0.95, abre: 10, sd: 12, si: 4, rub: 0.4 })
  };
  const GUION_CARA_L = [
    [T.llega - 0.2, T.llega + 0.2, "mira"], [T.deja1 + 0.3, T.deja1 + 0.6, "camara"], [T.inclina1, T.inclina1 + 0.3, "mira"],
    [T.orgullo, T.orgullo + 0.2, "aplaude"], [T.enciende1 + 0.15, T.enciende1 + 0.4, "risita"], [T.inclina2, T.inclina2 + 0.3, "ceja"],
    [T.enciende2 + 0.12, T.enciende2 + 0.35, "risita"], [T.inspira0 + 0.2, T.inspira1, "ceja"], [T.plaf - 0.02, T.plaf + 0.1, "susto"],
    [T.risa0, T.risa0 + 0.25, "risa"], [T.acerca0, T.acerca0 + 0.35, "tierna"], [T.boca0 + 0.2, T.prueba, "prueba"],
    [T.rinde - 0.1, T.rinde + 0.25, "guino"]
  ];
  const PARP_L = [1.6, 3.9, 5.05, 6.6, 8.3, 11.25];

  // Recorrido de la tarta: en manos de Laura hasta que la deja en la mesa.
  const PLATO_MESA = { x: MESA.x, y: MESA.y - 2 };
  function platoLlevado(t, px, bote) { return { x: px - 72, y: 312 - bote * 3 + 1.5 * Math.sin(t * 5.2) }; }
  function posTarta(t) {
    const px = xLaura(Math.min(t, T.deja0));
    const lleva = platoLlevado(Math.min(t, T.deja0), px, 0);
    const k = suave(fase(t, T.deja0, T.deja1 - 0.05));
    const x = lerp(lleva.x, PLATO_MESA.x, k), y = lerp(lleva.y, PLATO_MESA.y, k) - 14 * Math.sin(Math.PI * k);
    return { x, y };
  }

  function poseL(t) {
    const b = linea(GUION_L, CUERPO_L, "lleva", t);
    const x = xLaura(t);
    const camina = tramo(t, T.entra0, T.entra0 + 0.15) * (1 - tramo(t, T.llega - 0.15, T.llega + 0.05));
    const vaiven = Math.sin((t - T.entra0) / (T.llega - T.entra0) * 7 * Math.PI);
    const risa = tramo(t, T.risa0, T.risa0 + 0.2) * (1 - tramo(t, T.risa1 - 0.1, T.risa1 + 0.25));
    const tiembla = Math.sin(t * 34) * risa + 0.6 * Math.sin(t * 30) * (campana(t, T.enciende1 + 0.2, T.inclina2 + 0.2) + campana(t, T.enciende2 + 0.15, T.inspira1));
    const p = {
      x, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: L.PELVIS.x, y: L.PELVIS.y + b.pel + 1.2 * Math.sin(t * 2.0 + 1) - 7 * Math.abs(vaiven) * camina + 3 * tiembla },
      torso: b.torso + 0.025 * vaiven * camina, torsoEsc: { x: 1, y: 1 + 0.004 * Math.sin(t * 2 + 1) + 0.01 * tiembla },
      cabeza: { ang: b.cab + 0.03 * vaiven * camina + 0.04 * tiembla, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      pelo: { inercia: -0.45 * camina + 0.25 * tramo(t, T.llega - 0.1, T.llega + 0.2) * (1 - tramo(t, T.llega + 0.3, T.deja1)) + 0.25 * campana(t, T.plaf, T.plaf + 0.5) },
      piernas: {}, cara: null
    };
    // pies
    for (const lado of ["cerca", "lejos"]) {
      const f = pieDe(PASOS_L[lado], t);
      const q = L.aHoja(p, { x: f.x, y: 0 });
      p.piernas[lado] = { tob: { x: q.x, y: L.SUELO - L.TOBILLO_ALTO - (lado === "lejos" ? 10 : 0) - 58 * f.lev }, ang: -0.25 * f.lev };
    }
    // cara
    const e = linea(GUION_CARA_L, CARAS_L, "lleva", t);
    e.c = Math.max(e.c, parpadeo(t, PARP_L));
    p.cara = cara(e);
    // manos
    const Tr = L.tronco(p), hc = Tr(L.HOMBRO_C), hl = Tr(L.HOMBRO);
    let c = { x: hc.x + b.cx, y: hc.y + b.cy }, l = { x: hl.x + b.lx, y: hl.y + b.ly };
    let cmu = b.cmu, lmu = b.lmu, cang = 0, lang = 0;
    // sujetando el plato: la lejana por debajo y la cercana en el borde trasero
    if (b.tarta > 0.001) {
      const pl = posTarta(t);
      const bajo = L.aHoja(p, { x: pl.x + 2, y: pl.y + 11 }), borde = L.aHoja(p, { x: pl.x + 40, y: pl.y + 5 });
      l = mezcla(l, bajo, b.tarta); c = mezcla(c, borde, b.tarta);
      lmu = lerp(lmu, -2.6, b.tarta); cmu = lerp(cmu, -2.75, b.tarta);
    }
    // carcajada: manos a la tripa
    if (b.panza > 0.001) {
      const tripa = Tr({ x: 300, y: 545 }), tripa2 = Tr({ x: 245, y: 560 });
      l = mezcla(l, { x: tripa.x + 6 * Math.sin(t * 34), y: tripa.y }, b.panza); c = mezcla(c, tripa2, b.panza);
      lmu = lerp(lmu, -2.4, b.panza); cmu = lerp(cmu, -2.6, b.panza);
    }
    // mano a la boca (risita / probar la nata): la punta de los dedos llega a los labios
    const bo = L.boca(p);
    if (b.boca > 0.001) { const obj = { x: bo.x + 14, y: bo.y + 22 }; l = mezcla(l, obj, b.boca); lmu = lerp(lmu, 1.9, b.boca); }
    // dedo que limpia la mejilla de Guillermo (la punta del índice va justo al punto de su cara)
    if (b.dedo > 0.001 || b.lin > 0.001) {
      const pg = poseG(t);
      const k = fase(t, T.toca, T.limpia1);
      const sobre = lerp(MEJILLA[0].y, MEJILLA[1].y, suave(k)), sobreX = lerp(MEJILLA[0].x, MEJILLA[1].x, suave(k));
      const punto = G.aPantalla(pg, G.cabeza(pg).a({ x: sobreX, y: sobre }));
      const tocar = b.dedo * (1 - tramo(t, T.boca0, T.boca0 + 0.3));
      const destino = puntaDedo(L.aHoja(p, punto), -2.45, -0.15);
      l = mezcla(l, destino, tocar); lmu = lerp(lmu, -2.45, tocar); lang = lerp(lang, -0.15, tocar);
      if (b.lin > 0.001 && b.dedo < 0.999) l = mezcla(l, { x: hl.x + 130, y: hl.y - 20 }, b.lin * (1 - b.dedo));
    }
    // el dedo con nata en la boca
    const dBoca = tramo(t, T.boca0 + 0.15, T.prueba);
    if (dBoca > 0) {     // con el dedo en la boca; al guiñar lo deja apoyado en el labio de abajo
      const baja = tramo(t, T.rinde - 0.1, T.rinde + 0.3);
      const obj = puntaDedo({ x: bo.x + 2 + 8 * baja, y: bo.y - 2 + 10 * baja }, 0.35, 0); l = mezcla(l, obj, dBoca); lmu = lerp(lmu, 0.35, dBoca); lang = lerp(lang, 0, dBoca); }
    const indice = Math.max(b.dedo, dBoca);
    // mano cercana al bolsillo cuando no hace nada
    if (b.cb > 0.001) { const bc = Tr(L.BOLSILLO_C); c = mezcla(c, bc, b.cb); cmu = lerp(cmu, -1.75, b.cb); }
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: -1, dedos: D(b.cd), puno: 1 - clamp(b.cb * 1.6 - 0.6) };
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: 1, dedos: indice > 0.01 ? { pulgar: lerp(b.ld, 0, indice), indice: lerp(b.ld, 1, indice), medio: lerp(b.ld, 0, indice), anular: lerp(b.ld, 0, indice), menique: lerp(b.ld, 0, indice) } : D(b.ld) };
    if (indice > 0.01 && t > T.limpia1 - 0.05 && t < T.prueba + 0.1) { const mu = lmu; p.manoLejos.objeto = (g) => natilla(g, clamp(fase(t, T.toca + 0.1, T.limpia1)) * (1 - tramo(t, T.prueba - 0.05, T.prueba + 0.1)), mu); }
    return p;
  }
  // punta del índice estirado de Laura: desde el centro de la mano (hoja) para que la punta caiga en q
  const ESC_MANO_L = 0.88;
  function offsetIndice(mu, ang) {
    const abre = 0.25, an = 0.17 * (0.4 + 0.9 * abre), largo = 14.5;
    const f = { x: 6.9 + Math.sin(an) * largo, y: 4.5 + Math.cos(an) * largo };
    const r = G.rotP(f, mu + Math.PI / 2), k = G.JK * ESC_MANO_L;
    return G.rotP({ x: r.x * k, y: r.y * k }, ang);
  }
  const puntaDedo = (q, mu, ang) => { const o = offsetIndice(mu, ang); return { x: q.x - o.x, y: q.y - o.y }; };
  // pegote de nata en la punta del dedo (unidades de la mano)
  function natilla(g, k, mu) {
    if (k <= 0.01) return;
    const o = G.rotP({ x: 8.4, y: 18.9 }, mu + Math.PI / 2);
    g.save(); g.scale(ESC_MANO_L, ESC_MANO_L); g.translate(o.x, o.y);
    g.fillStyle = "#fffaf0"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.2;
    g.beginPath(); g.ellipse(0, 0, 4.5 * k, 3.4 * k, 0.4, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore();
  }
  // Mejilla de Guillermo (retrato) por donde pasa el dedo de Laura: de arriba abajo.
  const MEJILLA = [{ x: 893, y: 700 }, { x: 872, y: 752 }];

  /* ---------- gorro de fiesta, nata y vela en la nariz (capa de la cabeza de Guillermo) ---------- */
  const NARIZ = { x: 879, y: 672 };
  const VELA_NARIZ = { base: { x: 886, y: 672 }, ang: 0.55, largo: 78 };
  const NATA_CARA = [[640, 520], [700, 492], [760, 478], [820, 488], [872, 512], [915, 548], [930, 600], [925, 650], [915, 700], [902, 745], [880, 790],
    [845, 828], [800, 852], [748, 846], [700, 822], [660, 790], [630, 745], [612, 690], [606, 630], [614, 570]];
  const BULTOS = NATA_CARA.map((q, i) => 1 + 0.06 * Math.sin(i * 2.7) + 0.035 * Math.sin(i * 1.3 + 1));
  const CHISPAS_NATA = Array.from({ length: 14 }, (_, i) => ({ x: 650 + hash(i + 70) * 250, y: 520 + hash(i + 71) * 300, a: hash(i + 72) * 3, c: ["#ff5c8a", "#4fc3f7", "#ffd54f", "#81c784", "#ba68c8"][i % 5] }));
  function gorro(g, t) {
    g.save(); g.translate(800, 250); g.rotate(0.18); g.lineJoin = "round"; g.lineCap = "round";
    const H = 250, B = 82;
    const cono = () => { g.beginPath(); g.moveTo(-B, 0); g.quadraticCurveTo(-B * 0.2, -H * 0.55, 0, -H); g.quadraticCurveTo(B * 0.2, -H * 0.55, B, 0); g.quadraticCurveTo(0, 22, -B, 0); g.closePath(); };
    cono(); g.fillStyle = "#3aa7e0"; g.fill();
    g.save(); cono(); g.clip();
    g.fillStyle = "#ffd23f"; for (let k = 0; k < 4; k++) { const y = -40 - k * 52; g.beginPath(); g.moveTo(-B, y + 18); g.lineTo(B, y - 26); g.lineTo(B, y - 4); g.lineTo(-B, y + 40); g.closePath(); g.fill(); }
    g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.ellipse(-30, -110, 12, 70, 0.15, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(0,0,40,0.18)"; g.beginPath(); g.moveTo(20, 0); g.quadraticCurveTo(35, -H * 0.5, 0, -H); g.lineTo(B, 0); g.closePath(); g.fill();
    g.restore();
    cono(); g.lineWidth = 7; g.strokeStyle = "#0b0a0e"; g.stroke();
    // borla
    const bx = 3 * Math.sin(t * 3), by = -H - 6;
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; g.fillStyle = i % 2 ? "#ff5c8a" : "#ff86a8"; g.beginPath(); g.ellipse(bx + Math.cos(a) * 18, by + Math.sin(a) * 18, 16, 11, a, 0, Math.PI * 2); g.fill(); }
    g.lineWidth = 5; g.strokeStyle = "#0b0a0e"; g.beginPath(); g.arc(bx, by, 30, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#ff86a8"; g.beginPath(); g.arc(bx, by, 27, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.arc(bx - 8, by - 9, 8, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function nataCara(g, k, t, p) {
    if (k <= 0.005) return;
    const pts = NATA_CARA.map(([x, y], i) => { const cx = 770, cy = 660, f = lerp(0.55, 1, k) * BULTOS[i]; return { x: cx + (x - cx) * f, y: cy + (y - cy) * f }; });
    const ab = p.cara.boca.abre, ojos = [[771, 563, 44, 26], [894, 617, 33, 22]];
    const forma = () => { g.beginPath(); M2.curva(g, pts, true, 0.6); for (const [x, y, rx, ry] of ojos) { g.moveTo(x + rx, y); g.ellipse(x, y, rx, ry, 0.33, 0, Math.PI * 2, true); }
      if (ab > 3) { const r = clamp(ab / 22); g.moveTo(BOCA_G.x + 40 * r, BOCA_G.y); g.ellipse(BOCA_G.x, BOCA_G.y + 6, 40 * r + 8, 14 * r + 10, 0.26, 0, Math.PI * 2, true); } };
    g.save(); g.globalAlpha = clamp(k * 3);
    forma(); g.fillStyle = "#fffaf0"; g.fill("evenodd");
    g.save(); forma(); g.clip("evenodd");
    // sombras y chorretones de nata rosa del glaseado
    g.fillStyle = "#f3d9c8"; g.beginPath(); g.ellipse(700, 760, 110, 60, 0.4, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#f7a8c4"; g.beginPath(); g.ellipse(840, 545, 70, 30, 0.3, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(670, 650, 45, 24, -0.4, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,0.9)"; g.beginPath(); g.ellipse(745, 520, 60, 18, -0.2, 0, Math.PI * 2); g.fill();
    for (const c of CHISPAS_NATA) { g.save(); g.translate(c.x, c.y); g.rotate(c.a); g.fillStyle = c.c; g.fillRect(-9, -3, 18, 6); g.restore(); }
    // el dedo de Laura deja una raya de piel
    const lim = fase(t, T.toca, T.limpia1);
    if (lim > 0) {
      const a = MEJILLA[0], b = MEJILLA[1], e = { x: lerp(a.x, b.x, lim), y: lerp(a.y, b.y, lim) };
      g.lineCap = "round"; g.strokeStyle = G.C.piel; g.lineWidth = 24; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(e.x, e.y); g.stroke();
      g.strokeStyle = "rgba(200,110,60,0.35)"; g.lineWidth = 8; g.beginPath(); g.moveTo(a.x + 6, a.y); g.lineTo(e.x + 6, e.y); g.stroke();
    }
    g.restore();
    forma(); g.lineWidth = 6; g.strokeStyle = "#0b0a0e"; g.stroke();
    // gotas que cuelgan de la barbilla
    for (const [x, y, l0, f] of [[770, 850, 34, 0], [828, 830, 22, 1.7], [700, 826, 26, 3.1]]) {
      const l = l0 * (0.8 + 0.2 * Math.sin(t * 2 + f)) * k;
      g.beginPath(); g.moveTo(x - 12, y - 6); g.quadraticCurveTo(x - 13, y + l, x, y + l + 9); g.quadraticCurveTo(x + 13, y + l, x + 12, y - 6); g.closePath();
      g.fillStyle = "#fffaf0"; g.fill(); g.lineWidth = 5; g.stroke();
    }
    g.restore();
  }
  const BOCA_G = { x: 803, y: 730 };
  function velaNariz(g, k) {
    if (k <= 0.01) return;
    g.save(); g.translate(VELA_NARIZ.base.x, VELA_NARIZ.base.y); g.rotate(VELA_NARIZ.ang);
    const w = 26, h = VELA_NARIZ.largo;
    g.fillStyle = "#fff6f0"; g.beginPath(); g.rect(-w / 2, -h, w, h); g.fill();
    g.save(); g.beginPath(); g.rect(-w / 2, -h, w, h); g.clip(); g.fillStyle = "#ff5c8a";
    for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-w, -i * 22 + 8); g.lineTo(w, -i * 22 - 12); g.lineTo(w, -i * 22 - 2); g.lineTo(-w, -i * 22 + 18); g.closePath(); g.fill(); }
    g.restore();
    g.lineWidth = 5; g.strokeStyle = "#0b0a0e"; g.strokeRect(-w / 2, -h, w, h);
    g.lineWidth = 4; g.beginPath(); g.moveTo(0, -h); g.lineTo(0, -h - 14); g.stroke();
    // pegote de nata donde se clava
    g.fillStyle = "#fffaf0"; g.beginPath(); g.ellipse(0, 4, 26, 13, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 4; g.stroke();
    g.restore();
  }
  function capaCabezaG(g, t, p) {
    gorro(g, t);
    const nata = t >= T.plaf ? clamp((t - T.plaf) / 0.06) : 0;
    nataCara(g, nata, t, p);
    if (t >= T.plaf) velaNariz(g, 1);
  }
  // punta de la mecha de la vela de la nariz (pantalla)
  function mechaNariz(p) {
    const a = VELA_NARIZ.ang, h = VELA_NARIZ.largo + 14;
    const q = { x: VELA_NARIZ.base.x + Math.sin(a) * h, y: VELA_NARIZ.base.y - Math.cos(a) * h };
    return G.aPantalla(p, G.cabeza(p).a(q));
  }

  /* ---------- velas: encendidas, apagadas, reencendidas ---------- */
  const VELAS = [-23, -11.5, 0, 11.5, 23].map((dx, i) => ({ dx, dy: [2, -3, 3, -2, 1][i], col: ["#ff5c8a", "#4fc3f7", "#ffd54f", "#81c784", "#ba68c8"][i] }));
  // instantes (por vela) en que se apaga y se vuelve a encender; se apagan primero las más cercanas a Guillermo
  const AP1 = i => T.sopla1 + 0.14 + i * 0.045, EN1 = i => T.enciende1 + i * 0.06;
  const AP2 = i => T.sopla2 + 0.12 + i * 0.03, EN2 = i => T.enciende2 + [0.1, 0, 0.16, 0.05, 0.12][i];
  function llamaVela(i, t) {
    if (t >= T.plaf) return (t < EN2(i) ? 0 : 1) * (1 - suave(fase(t, T.plaf, T.plaf + 0.12)));
    if (t < EN1(i)) return 1 - suave(fase(t, AP1(i) - 0.07, AP1(i)));
    if (t < AP2(i) - 0.07) return clamp(rebote(fase(t, EN1(i), EN1(i) + 0.24)), 0, 1.25);
    if (t < EN2(i)) return 1 - suave(fase(t, AP2(i) - 0.07, AP2(i)));
    return clamp(rebote(fase(t, EN2(i), EN2(i) + 0.24)), 0, 1.25);
  }
  function rebote(k) { return k <= 0 ? 0 : M2.rebote(k, 2.2); }
  // Luz que da cada vela a la sala: igual que la llama pero con rampas lentas (la sala no parpadea de golpe).
  function luzVela(i, t) {
    let k = 1 - 0.85 * suave(fase(t, AP1(i) - 0.07, AP1(i) + 0.35));
    k = lerp(k, 1, suave(fase(t, EN1(i), EN1(i) + 0.35)));
    k = lerp(k, 0.15, suave(fase(t, AP2(i) - 0.07, AP2(i) + 0.35)));
    k = lerp(k, 1, suave(fase(t, EN2(i), EN2(i) + 0.35)));
    return k * (1 - suave(fase(t, T.plaf - 0.02, T.plaf + 0.4)));
  }
  function luzNariz(t) {
    let k = suave(fase(t, T.nariz, T.nariz + 0.4));
    k = lerp(k, 0.15, suave(fase(t, T.soplaN + 0.06, T.soplaN + 0.45)));
    return lerp(k, 1, suave(fase(t, T.enciendeN, T.enciendeN + 0.4)));
  }
  function viento(t) {        // empuje del soplido sobre las llamas (hacia la derecha)
    return 0.9 * tramo(t, T.sopla1, T.sopla1 + 0.12) * (1 - tramo(t, T.fin1 - 0.1, T.fin1 + 0.1)) + 1.4 * tramo(t, T.sopla2, T.sopla2 + 0.1) * (1 - tramo(t, T.fin2 - 0.1, T.fin2 + 0.15));
  }
  function llamaNariz(t) {
    if (t < T.nariz) return 0;
    let k = rebote(fase(t, T.nariz, T.nariz + 0.25));
    k *= 1 - suave(fase(t, T.soplaN + 0.06, T.soplaN + 0.14));
    if (t >= T.enciendeN) k = rebote(fase(t, T.enciendeN, T.enciendeN + 0.25));
    return clamp(k, 0, 1.25);
  }
  // encendidos (para chispas) y apagados (para humo): [t, x, y relativos] — se calculan con la tarta en su sitio
  const ENCENDIDOS = [], APAGADOS = [];
  VELAS.forEach((v, i) => { ENCENDIDOS.push([EN1(i), i, 1], [EN2(i), i, 1.5]); APAGADOS.push([AP1(i), i], [AP2(i), i]); });

  function dibLlama(g, x, y, k, lean, t, sem) {
    if (k <= 0.01) return;
    const fl = 1 + 0.14 * ruido(t * 13 + sem * 7) + 0.06 * Math.sin(t * 31 + sem);
    const h = 15 * k * fl, w = 5.2 * Math.min(1, k), lx = (lean + 0.12 * ruido(t * 9 + sem * 3)) * h * 0.9;
    g.save();
    const halo = g.createRadialGradient(x, y - h * 0.4, 1, x, y - h * 0.4, 22 * Math.min(1.2, k));
    halo.addColorStop(0, "rgba(255,200,90,0.55)"); halo.addColorStop(1, "rgba(255,150,40,0)");
    g.globalCompositeOperation = "lighter"; g.fillStyle = halo; g.beginPath(); g.arc(x, y - h * 0.4, 22 * Math.min(1.2, k), 0, Math.PI * 2); g.fill();
    g.globalCompositeOperation = "source-over";
    const gota = (ww, hh) => { g.beginPath(); g.moveTo(x, y + ww * 0.4); g.bezierCurveTo(x - ww * 1.3, y - hh * 0.1, x - ww * 0.3 + lx * 0.5, y - hh * 0.65, x + lx, y - hh);
      g.bezierCurveTo(x + ww * 0.3 + lx * 0.5, y - hh * 0.65, x + ww * 1.3, y - hh * 0.1, x, y + ww * 0.4); g.closePath(); };
    gota(w, h); g.fillStyle = "#ff8a1c"; g.fill(); g.lineWidth = 1.2; g.strokeStyle = "rgba(120,40,0,0.7)"; g.stroke();
    gota(w * 0.62, h * 0.72); g.fillStyle = "#ffe56b"; g.fill();
    gota(w * 0.3, h * 0.32); g.fillStyle = "#fffbe6"; g.fill();
    g.restore();
  }
  function chispas(g, t, t0, x, y, fuerza) {
    const k = fase(t, t0, t0 + 0.32); if (k <= 0 || k >= 1) return;
    g.save(); g.lineCap = "round";
    const n = Math.round(7 * fuerza);
    for (let j = 0; j < n; j++) {
      const a = -Math.PI / 2 + (hash(t0 * 13 + j) - 0.5) * 2.6, v = (22 + 26 * hash(t0 * 7 + j + 3)) * fuerza;
      const d = v * salida(k), px = x + Math.cos(a) * d, py = y + Math.sin(a) * d + 30 * k * k;
      g.strokeStyle = j % 2 ? "#fff6c0" : "#ffcf3a"; g.globalAlpha = 1 - k; g.lineWidth = 1.8;
      g.beginPath(); g.moveTo(px, py); g.lineTo(px - Math.cos(a) * 5, py - Math.sin(a) * 5); g.stroke();
    }
    // destellito en forma de estrella
    const s = (1 - k) * 7 * fuerza;
    g.globalAlpha = 1 - k; g.fillStyle = "#fffbe0"; g.beginPath();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? s * 0.3 : s; g.lineTo(x + Math.cos(a) * r, y - 2 + Math.sin(a) * r); }
    g.closePath(); g.fill();
    g.restore();
  }
  function humo(g, t, t0, x, y, sem) {
    const k = fase(t, t0, t0 + 1.4); if (k <= 0 || k >= 1) return;
    g.save(); g.lineCap = "round"; g.strokeStyle = "rgba(205,205,215,1)";
    for (let j = 0; j < 2; j++) {
      const kk = clamp(k * 1.1 - j * 0.12); if (kk <= 0) continue;
      g.globalAlpha = 0.55 * Math.sin(Math.PI * kk); g.lineWidth = 2.6 + 3 * kk; g.beginPath();
      for (let s = 0; s <= 8; s++) { const u = s / 8 * kk, yy = y - u * 70, xx = x + Math.sin(u * 9 + sem + j * 2 + t * 2) * (4 + 10 * u) + u * 14;
        if (s) g.lineTo(xx, yy); else g.moveTo(xx, yy); }
      g.stroke();
    }
    g.restore();
  }

  /* ---------- la tarta ---------- */
  // Aplastada por la cara: cráter a la izquierda, velas hundidas o tumbadas.
  function tarta(g, t, x, y, aplasta) {
    const r = TAR.r, h = TAR.h, ry = TAR.ry, top = y - 3 - h;
    g.save(); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = "#0b0a0e";
    // plato
    g.fillStyle = "#e8eef4"; g.beginPath(); g.ellipse(x, y, TAR.plato, 9, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 2.4; g.stroke();
    g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x, y - 1.5, TAR.plato - 9, 5.5, 0, 0, Math.PI * 2); g.fill();
    // bizcocho con glaseado rosa (se ensancha un poco al aplastarse)
    const k = clamp(aplasta), ab = 1 + 0.06 * k, rr = r * ab, hh = h - 6 * k, y0 = y - 3 - hh;
    // Hoyo con la forma de la cara en la mitad izquierda: perfil del labio delantero del hoyo.
    const FONDO = k > 0.01 ? [{ x: x - rr - 6, y: y0 + hh * 0.5 * k }, { x: x - rr * 0.8, y: y0 + hh * 0.68 * k }, { x: x - rr * 0.45, y: y0 + hh * 0.62 * k },
      { x: x - rr * 0.14, y: y0 + hh * 0.34 * k }, { x: x + rr * 0.12, y: y0 - 1 }] : null;
    const BORDE_ATRAS = []; for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * (Math.PI * 0.5 + 0.12); BORDE_ATRAS.push({ x: x + Math.cos(a) * (rr + 1.5), y: y0 + Math.sin(a) * ry }); }
    g.save();
    if (FONDO) {        // todo lo que queda dentro del hoyo no se pinta
      g.beginPath(); g.rect(x - 300, y0 - 300, 600, 600);
      M2.curva(g, FONDO, false, 0.5); g.lineTo(x + rr * 0.12, y0 - 60); g.lineTo(x - rr - 60, y0 - 60); g.lineTo(x - rr - 60, FONDO[0].y); g.closePath();
      g.clip("evenodd");
    }
    const cuerpo = () => { g.beginPath(); g.moveTo(x - rr, y0); g.lineTo(x - rr, y - 5); g.ellipse(x, y - 5, rr, ry * 0.8, 0, Math.PI, 0, true); g.lineTo(x + rr, y0); g.closePath(); };
    cuerpo(); g.fillStyle = "#f7a8c4"; g.fill();
    g.save(); cuerpo(); g.clip();
    g.fillStyle = "#e07ea3"; g.fillRect(x + rr * 0.35, top - 20, rr, h + 30);
    g.fillStyle = "#fbd0df"; g.fillRect(x - rr * 0.75, top - 20, rr * 0.22, h + 30);
    // ribete de nata a media altura y lunares de colores
    g.fillStyle = "#fffaf0"; for (let i = -3; i <= 3; i++) { g.beginPath(); g.arc(x + i * rr / 3.4, y - 5 - hh * 0.42 + Math.abs(i) * 0.6, 4.2, 0, Math.PI * 2); g.fill(); }
    const lunares = ["#4fc3f7", "#ffd54f", "#81c784", "#ba68c8", "#ff7043"];
    for (let i = 0; i < 6; i++) { g.fillStyle = lunares[i % 5]; g.beginPath(); g.arc(x - rr + 7 + i * rr * 0.36, y - 12 - (i % 2) * 6, 2.2, 0, Math.PI * 2); g.fill(); }
    g.restore();
    cuerpo(); g.lineWidth = 2.6; g.stroke();
    // cobertura de nata blanca con chorretes por el borde
    const tapa = () => { g.beginPath(); g.ellipse(x, y0, rr + 1.5, ry, 0, 0, Math.PI * 2); };
    g.fillStyle = "#fffaf0";
    g.beginPath(); g.moveTo(x - rr - 1.5, y0);
    for (let i = 0; i <= 12; i++) { const a = Math.PI - i / 12 * Math.PI, xx = x + Math.cos(a) * (rr + 1.5), yy = y0 + Math.sin(a) * ry;
      const gota = i % 2 ? 5 + 4 * hash(i + 3) : 2; g.lineTo(xx, yy + gota); }
    g.lineTo(x + rr + 1.5, y0); g.closePath(); g.fill(); g.lineWidth = 2; g.stroke();
    tapa(); g.fill(); g.lineWidth = 2.2; g.stroke();
    // rosetones de nata y fresas en el borde
    for (let i = 0; i < 7; i++) { const a = Math.PI * (0.08 + 0.84 * i / 6), xx = x - Math.cos(a) * rr * 0.86, yy = y0 + Math.sin(a) * ry * 0.72;
      g.fillStyle = "#fffaf0"; g.beginPath(); g.arc(xx, yy - 3, 4.4, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.3; g.stroke();
      if (i % 2 === 0) { g.fillStyle = "#e53935"; g.beginPath(); g.moveTo(xx - 3.2, yy - 6); g.quadraticCurveTo(xx, yy - 13, xx + 3.2, yy - 6); g.quadraticCurveTo(xx, yy - 2, xx - 3.2, yy - 6); g.fill(); g.stroke();
        g.fillStyle = "#43a047"; g.fillRect(xx - 2, yy - 13, 4, 2); } }
    // velas que siguen en pie (o tumbadas a la derecha del hoyo)
    VELAS.forEach((v, i) => { if (!FONDO || i > 2) vela(g, v, x + v.dx * ab, y0 + v.dy * 0.8, FONDO ? (i === 3 ? 0.9 : 1.2) * k : 0, FONDO ? 0.15 * k : 0); });
    g.restore();
    if (FONDO) hoyo(g, x, y0, rr, hh, ry, k, FONDO, BORDE_ATRAS, ab);
    g.restore();
  }
  function vela(g, v, bx, by, ang, hun) {
    g.save(); g.translate(bx, by); g.rotate(ang);
    const hv = 17 * (1 - hun);
    g.fillStyle = "#fff6f0"; g.fillRect(-2.4, -hv, 4.8, hv);
    g.save(); g.beginPath(); g.rect(-2.4, -hv, 4.8, hv); g.clip(); g.fillStyle = v.col;
    for (let s = 0; s < 4; s++) { g.beginPath(); g.moveTo(-3, -s * 5 + 1); g.lineTo(3, -s * 5 - 2); g.lineTo(3, -s * 5); g.lineTo(-3, -s * 5 + 3); g.closePath(); g.fill(); }
    g.restore();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.4; g.strokeRect(-2.4, -hv, 4.8, hv);
    g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, -hv); g.lineTo(0, -hv - 3); g.stroke();
    g.restore();
  }
  // El hoyo de la cara: pared del fondo con la huella (frente, ojos, nariz), labio delantero con la nata
  // empujada hacia arriba, pegotes alrededor y dos velas hundidas.
  function hoyo(g, x, y0, rr, hh, ry, k, FONDO, BORDE_ATRAS, ab) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = "#0b0a0e";
    const pared = () => { g.beginPath(); M2.curva(g, FONDO, false, 0.5); for (let i = BORDE_ATRAS.length - 1; i >= 0; i--) g.lineTo(BORDE_ATRAS[i].x, BORDE_ATRAS[i].y); g.closePath(); };
    pared(); const gr = g.createLinearGradient(0, y0 - ry, 0, y0 + hh * 0.7 * k);
    gr.addColorStop(0, "#fff3e6"); gr.addColorStop(0.55, "#f6cdb6"); gr.addColorStop(1, "#d9967e"); g.fillStyle = gr; g.fill();
    g.save(); pared(); g.clip();
    // huella de la cara: cuencas de los ojos, la nariz y la boca
    const cx = x - rr * 0.47, cy = y0 + hh * 0.18 * k;
    g.globalAlpha = k; g.fillStyle = "rgba(170,90,70,0.55)";
    g.beginPath(); g.ellipse(cx - 9, cy - 2, 5, 2.6, -0.2, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(cx + 6, cy, 4, 2.2, -0.2, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(cx + 1, cy + 6, 2.4, 3.4, 0.3, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(cx - 2, cy + 12, 6, 1.6, 0, 0, Math.PI * 2); g.fill();
    // virutas de glaseado rosa y fideos de colores sueltos
    g.fillStyle = "#f7a8c4"; g.beginPath(); g.ellipse(cx + 14, cy + 9, 7, 3, 0.4, 0, Math.PI * 2); g.fill();
    ["#4fc3f7", "#ffd54f", "#81c784", "#ba68c8"].forEach((c, i) => { g.save(); g.translate(cx - 14 + i * 9, cy + 5 + (i % 2) * 6); g.rotate(i * 1.1); g.fillStyle = c; g.fillRect(-2.5, -0.9, 5, 1.8); g.restore(); });
    g.restore();
    g.lineWidth = 1.8; g.beginPath(); for (const [i, q] of BORDE_ATRAS.entries()) { if (i) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); } g.stroke();
    // nata empujada: cordón grueso a lo largo del labio delantero y pegotes encima
    g.fillStyle = "#fffaf0";
    g.lineWidth = 6.5; g.strokeStyle = "#0b0a0e"; g.beginPath(); M2.curva(g, FONDO, false, 0.5); g.stroke();
    g.lineWidth = 4; g.strokeStyle = "#fffaf0"; g.beginPath(); M2.curva(g, FONDO, false, 0.5); g.stroke();
    g.strokeStyle = "#0b0a0e";
    const pegotes = [[0, -2, 5.5], [0.2, -1, 4.5], [0.45, -2, 5], [0.7, -2, 6], [0.92, -3, 7]];
    for (const [u, dy, rad] of pegotes) {
      const i = Math.min(FONDO.length - 2, Math.floor(u * (FONDO.length - 1))), f = u * (FONDO.length - 1) - i;
      const q = { x: lerp(FONDO[i].x, FONDO[i + 1].x, f), y: lerp(FONDO[i].y, FONDO[i + 1].y, f) + dy };
      g.beginPath(); g.arc(q.x, q.y, rad * k, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.5; g.stroke();
      g.fillStyle = "rgba(255,255,255,0.9)"; g.beginPath(); g.arc(q.x - rad * 0.3, q.y - rad * 0.35, rad * 0.3 * k, 0, Math.PI * 2); g.fill(); g.fillStyle = "#fffaf0";
    }
    // montoncito de nata a la derecha del hoyo y en el borde de atrás
    for (const [dx, dy, rad] of [[rr * 0.18, -7, 6.5], [rr * 0.3, -3, 5], [-rr * 0.6, -ry - 3, 4.5], [-rr * 0.25, -ry - 2, 4]]) {
      g.beginPath(); g.arc(x + dx, y0 + dy, rad * k, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.5; g.stroke(); }
    // chorretón de nata que cae por el costado desde el hoyo
    const q0 = FONDO[0];
    g.beginPath(); g.moveTo(q0.x + 2, q0.y - 2); g.quadraticCurveTo(q0.x - 5, q0.y + 6, q0.x - 2, q0.y + 12 * k); g.quadraticCurveTo(q0.x + 4, q0.y + 15 * k, q0.x + 7, q0.y + 3); g.closePath();
    g.fill(); g.lineWidth = 1.6; g.stroke();
    // velas hundidas en el hoyo (apagadas)
    vela(g, VELAS[0], x - rr * 0.72, FONDO[1].y - 1, -0.55 * k, 0.45 * k);
    vela(g, VELAS[1], x - rr * 0.3, FONDO[2].y - 4, 0.75 * k, 0.4 * k);
    g.restore();
  }
  const mecha = (x, y, i) => ({ x: x + VELAS[i].dx, y: y - 3 - TAR.h + VELAS[i].dy * 0.8 - 20 });

  /* ---------- salpicadura de nata ---------- */
  const GOTAS = Array.from({ length: 22 }, (_, i) => {
    const a = -Math.PI / 2 + (hash(i + 300) - 0.5) * 2.9, v = 180 + 300 * hash(i + 301);
    return { vx: Math.cos(a) * v * (a < -Math.PI / 2 ? 0.9 : 1.1), vy: Math.sin(a) * v - 60, r: 3 + 5 * hash(i + 302), rosa: hash(i + 303) < 0.3 };
  });
  function salpica(g, t, cx, cy) {
    const v = t - T.plaf; if (v <= 0) return;
    g.save(); g.lineJoin = "round";
    const grav = 1500;
    for (const d of GOTAS) {
      // al caer se queda pegada en la mesa (si cae sobre ella) o en el suelo
      const yMesa = MESA.y - 2, suelo = SUELO - 3;
      const xIn = x => Math.abs(x - MESA.x) < MESA.rx - 4;
      const tc = (y0, vy, yf) => (-vy + Math.sqrt(Math.max(0, vy * vy + 2 * grav * (yf - y0)))) / grav;
      let tt = tc(cy, d.vy, yMesa), x = cx + d.vx * tt, plano = yMesa;
      if (!xIn(x)) { tt = tc(cy, d.vy, suelo); x = cx + d.vx * tt; plano = suelo; }
      const vv = Math.min(v, tt), px = cx + d.vx * vv, py = cy + d.vy * vv + 0.5 * grav * vv * vv;
      const caida = v >= tt, aplast = caida ? 1 : 0;
      g.fillStyle = d.rosa ? "#f7a8c4" : "#fffaf0"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.5;
      g.beginPath();
      if (aplast) g.ellipse(px, plano + 1, d.r * 1.7, d.r * 0.55, 0, 0, Math.PI * 2);
      else { const ang = Math.atan2(d.vy + grav * vv, d.vx); g.ellipse(px, py, d.r * 1.25, d.r * 0.85, ang, 0, Math.PI * 2); }
      g.fill(); g.stroke();
    }
    // nube de nata en el impacto
    const k = fase(t, T.plaf, T.plaf + 0.35);
    if (k > 0 && k < 1) {
      g.globalAlpha = 1 - k; g.fillStyle = "#fffaf0";
      for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.1 + 0.8 * i / 6), d = 18 + 30 * salida(k); g.beginPath(); g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.6, 9 * (1 - k * 0.6), 0, Math.PI * 2); g.fill(); }
    }
    g.restore();
  }

  /* ---------- soplidos (rayitas de aire) ---------- */
  function aire(g, t, desde, t0, t1, fuerza, hacia) {
    const k = campana(t, t0, t1); if (k <= 0.01) return;
    g.save(); g.lineCap = "round"; g.strokeStyle = "rgba(235,245,255,0.85)";
    for (let i = 0; i < 4; i++) {
      const ph = ((t - t0) * 2.6 + i / 4) % 1, d = 14 + ph * 95 * fuerza;
      const x0 = desde.x + hacia.x * d, y0 = desde.y + hacia.y * d + (i - 1.5) * 6 * (0.5 + ph);
      g.globalAlpha = k * Math.sin(Math.PI * ph); g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(x0 - hacia.x * 16, y0 - hacia.y * 16); g.quadraticCurveTo(x0, y0 + 4 * Math.sin(t * 20 + i), x0 + hacia.x * 16, y0 + hacia.y * 16); g.stroke();
    }
    g.restore();
  }

  /* ---------- decorado: salón de fiesta con la luz apagada ---------- */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60);
    // pared de papel pintado verde azulado con flores pequeñas
    const pared = g.createLinearGradient(0, -60, 0, 440); pared.addColorStop(0, "#1f3b4a"); pared.addColorStop(1, "#2d5560");
    g.fillStyle = pared; g.fillRect(-40, -60, W + 80, 520);
    g.fillStyle = "rgba(255,240,200,0.07)";
    for (let y = -40; y < 440; y += 36) for (let x = -40 + ((y / 36) % 2 ? 18 : 0); x < W + 40; x += 36) {
      g.beginPath(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; g.ellipse(x + Math.cos(a) * 4, y + Math.sin(a) * 4, 3.4, 2, a, 0, Math.PI * 2); } g.fill(); }
    // ventana de noche con luna (izquierda)
    g.fillStyle = "#0b1730"; g.fillRect(60, 60, 150, 190);
    const cielo = g.createLinearGradient(0, 60, 0, 250); cielo.addColorStop(0, "#132b55"); cielo.addColorStop(1, "#1c3d6a"); g.fillStyle = cielo; g.fillRect(66, 66, 138, 178);
    g.fillStyle = "#fff6d0"; g.beginPath(); g.arc(160, 108, 18, 0, Math.PI * 2); g.fill(); g.fillStyle = "#132b55"; g.beginPath(); g.arc(168, 103, 16, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fff8e0"; for (let i = 0; i < 14; i++) { g.globalAlpha = 0.5 + 0.5 * hash(i + 90); g.fillRect(72 + hash(i + 91) * 126, 72 + hash(i + 92) * 160, 2, 2); } g.globalAlpha = 1;
    g.strokeStyle = "#5a3a22"; g.lineWidth = 8; g.strokeRect(60, 60, 150, 190); g.lineWidth = 5; g.beginPath(); g.moveTo(135, 60); g.lineTo(135, 250); g.moveTo(60, 155); g.lineTo(210, 155); g.stroke();
    g.fillStyle = "#6b4528"; g.fillRect(50, 248, 170, 10);
    // cortinas
    for (const [x0, s] of [[34, 1], [236, -1]]) { g.fillStyle = "#7a2f3d"; g.beginPath(); g.moveTo(x0, 40); g.quadraticCurveTo(x0 + s * 30, 150, x0 + s * 8, 300); g.lineTo(x0 + s * 34, 300); g.quadraticCurveTo(x0 + s * 48, 150, x0 + s * 40, 40); g.closePath(); g.fill();
      g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 + s * 18, 50); g.quadraticCurveTo(x0 + s * 34, 160, x0 + s * 20, 296); g.stroke(); }
    g.fillStyle = "#3a2516"; g.fillRect(20, 34, 240, 8);
    // cuadros en la pared
    for (const [x, y, w, h, c1, c2] of [[720, 70, 70, 90, "#c97b3a", "#f1c27d"], [810, 92, 92, 64, "#4a7a9a", "#9ccbe0"], [930, 60, 56, 72, "#8a5a9a", "#d9a7e6"]]) {
      g.fillStyle = "#c9a35a"; g.fillRect(x - 6, y - 6, w + 12, h + 12); g.fillStyle = c1; g.fillRect(x, y, w, h);
      g.fillStyle = c2; g.beginPath(); g.arc(x + w * 0.35, y + h * 0.4, Math.min(w, h) * 0.22, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.moveTo(x, y + h); g.lineTo(x + w * 0.45, y + h * 0.55); g.lineTo(x + w, y + h); g.closePath(); g.fill();
      g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.strokeRect(x - 6, y - 6, w + 12, h + 12); }
    // guirnalda de bolas de papel de colores
    g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-40, 8); g.quadraticCurveTo(W / 2, 70, W + 40, 8); g.stroke();
    const cols = ["#ff5c8a", "#ffd23f", "#3aa7e0", "#7ed957", "#b56ce0"];
    for (let i = 0; i < 13; i++) { const u = i / 12, x = -40 + u * (W + 80), y = 8 + 4 * 62 * u * (1 - u) * 1.0 + 12;
      g.strokeStyle = "rgba(255,255,255,0.3)"; g.beginPath(); g.moveTo(x, y - 12); g.lineTo(x, y); g.stroke();
      g.fillStyle = cols[i % 5]; g.beginPath(); g.arc(x, y + 10, 11, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 1; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(x - 11, y + 10 + k * 4); g.lineTo(x + 11, y + 10 + k * 4); g.stroke(); }
      g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.6; g.beginPath(); g.arc(x, y + 10, 11, 0, Math.PI * 2); g.stroke(); }
    // aparador con regalos y dos globos (derecha)
    g.fillStyle = "#4a2e1c"; g.fillRect(800, 300, 190, 140); g.fillStyle = "#5e3b24"; g.fillRect(794, 292, 202, 12);
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.strokeRect(800, 300, 190, 140); g.beginPath(); g.moveTo(895, 304); g.lineTo(895, 440); g.stroke();
    g.fillStyle = "#c9a35a"; g.fillRect(880, 360, 6, 18); g.fillRect(904, 360, 6, 18);
    for (const [x, w, h, c, lazo] of [[812, 52, 40, "#3aa7e0", "#ffd23f"], [870, 40, 56, "#ff5c8a", "#ffffff"], [918, 58, 34, "#7ed957", "#ff5c8a"]]) {
      g.fillStyle = c; g.fillRect(x, 292 - h, w, h); g.fillStyle = lazo; g.fillRect(x + w / 2 - 4, 292 - h, 8, h); g.fillRect(x, 292 - h / 2 - 4, w, 8);
      g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.strokeRect(x, 292 - h, w, h);
      g.fillStyle = lazo; g.beginPath(); g.ellipse(x + w / 2 - 8, 288 - h, 9, 6, -0.4, 0, Math.PI * 2); g.ellipse(x + w / 2 + 8, 288 - h, 9, 6, 0.4, 0, Math.PI * 2); g.fill(); g.stroke(); }
    for (const [x, y, c] of [[835, 150, "#ffd23f"], [880, 128, "#b56ce0"]]) {
      g.strokeStyle = "rgba(255,255,255,0.5)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y + 34); g.quadraticCurveTo(x + 10, y + 90, 852, 252); g.stroke();
      g.fillStyle = c; g.beginPath(); g.ellipse(x, y, 26, 32, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.stroke();
      g.fillStyle = "rgba(255,255,255,0.5)"; g.beginPath(); g.ellipse(x - 9, y - 12, 6, 10, -0.4, 0, Math.PI * 2); g.fill(); }
    // zócalo y suelo de tarima
    g.fillStyle = "#3d2a1d"; g.fillRect(-40, 432, W + 80, 16); g.fillStyle = "#5a3e2a"; g.fillRect(-40, 432, W + 80, 3);
    const su = g.createLinearGradient(0, 448, 0, H + 60); su.addColorStop(0, "#6a4630"); su.addColorStop(1, "#3a2416");
    g.fillStyle = su; g.fillRect(-40, 448, W + 80, H + 60 - 448);
    g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 2;
    for (let y = 470; y < H + 60; y += 26 + (y - 448) * 0.25) { g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); }
    for (let i = 0; i < 30; i++) { const x = -40 + hash(i + 40) * (W + 80), y = 452 + hash(i + 41) * 140; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 22); g.stroke(); }
    const v = g.createRadialGradient(512, 300, 280, 512, 300, 700); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.55)");
    g.fillStyle = v; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }
  // Mesa alta redonda con mantel (pantalla).
  function mesa(g) {
    const { x, y, rx, ry } = MESA;
    g.save(); g.lineJoin = "round"; g.strokeStyle = "#0b0a0e";
    // pie y base
    g.fillStyle = "#2a2a30"; g.fillRect(x - 6, y + 40, 12, SUELO - y - 46); g.lineWidth = 2; g.strokeRect(x - 6, y + 40, 12, SUELO - y - 46);
    g.fillStyle = "#1e1e24"; g.beginPath(); g.ellipse(x, SUELO - 3, 46, 8, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    // mantel con ondas
    g.fillStyle = "#fbf6ee"; g.beginPath(); g.moveTo(x - rx, y);
    g.lineTo(x - rx - 6, y + 46);
    for (let i = 0; i <= 10; i++) { const xx = x - rx - 6 + (2 * rx + 12) * i / 10; g.quadraticCurveTo(xx - (rx + 6) / 10, y + 56, xx, y + 46); }
    g.lineTo(x + rx, y); g.closePath(); g.fill(); g.lineWidth = 2.4; g.stroke();
    g.save(); g.clip(); g.fillStyle = "rgba(120,110,140,0.25)"; g.fillRect(x + rx * 0.35, y, rx, 70);
    g.strokeStyle = "rgba(150,140,170,0.5)"; g.lineWidth = 2; for (const dx of [-40, -10, 22, 50]) { g.beginPath(); g.moveTo(x + dx, y + 6); g.quadraticCurveTo(x + dx + 4, y + 30, x + dx * 1.1, y + 52); g.stroke(); }
    g.restore();
    g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 2.4; g.stroke();
    g.restore();
  }

  // Mientras lleva la tarta, sus manos se vuelven a dibujar encima del plato (lo agarran por el borde).
  function manosEncima(g, p) {
    const k = p.s * L.K, col = { piel: L.C.piel, sombra: L.C.pielSombra, tinta: L.C.tinta };
    g.save(); g.translate(p.x, p.suelo); g.scale(-k, k); g.translate(-L.PELVIS.x, -L.SUELO);
    for (const m of [p.manoCerca, p.manoLejos]) {
      g.save(); g.translate(m.x, m.y); g.rotate(m.ang || 0); g.scale(L.JK * ESC_MANO_L, L.JK * ESC_MANO_L);
      Personaje2D.mano(g, m, col); g.restore();
    }
    g.restore();
  }

  /* ---------- cámara y luz ---------- */
  function camara(t) {
    const mesa = tramo(t, T.inclina1 - 0.3, T.sopla1, suave), cerca = tramo(t, T.plaf - 0.1, T.saca1 + 0.4, suave);
    return { k: 1.04 + 0.05 * mesa + 0.13 * cerca, x: 515 - 2 * mesa + 12 * cerca, y: 318 + 4 * mesa + 10 * cerca };
  }
  const LUZ_CUARTO = 0.36;                    // oscuridad de la sala

  class LauraTarta extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !L.listo()) return;
      if (!fondo) fondo = creaFondo();
      const pG = poseG(t), pL = poseL(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = (t >= T.plaf ? 7 * Math.exp(-(t - T.plaf) * 6) : 0) * suave(fase(t, T.plaf, T.plaf + 0.03));
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -40, -60);
      // sombras
      g.save(); g.fillStyle = "rgba(0,0,0,0.35)";
      g.beginPath(); g.ellipse(pG.x + 6, SUELO + 1, 78, 8, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pL.x - 4, SUELO + 1, 64, 7, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(MESA.x, SUELO + 1, 58, 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
      mesa(g);
      const tp = posTarta(t), enMesa = t >= T.deja1;
      const aplasta = t >= T.plaf ? clamp(salida(fase(t, T.plaf, T.plaf + 0.08))) : 0;
      // orden: Guillermo, (tarta en la mesa), Laura, (tarta en sus manos)
      G.dibujar(g, pG, t);
      const llevada = t < T.deja1 + 0.3;
      if (!llevada) tarta(g, t, tp.x, tp.y, aplasta);
      L.dibujar(g, pL, t);
      if (llevada) { tarta(g, t, tp.x, tp.y, aplasta); manosEncima(g, pL); }
      // humo de las velas que se apagan
      APAGADOS.forEach(([ta, i]) => { if (t > ta) { const m = mecha(tp.x, tp.y, i); humo(g, t, ta, m.x, m.y, i); } });
      if (t > T.soplaN + 0.12 && t < T.enciendeN + 1.3) { const m = mechaNariz(pG); humo(g, t, T.soplaN + 0.12, m.x, m.y, 9); }
      // salpicadura de nata y aire de los soplidos
      const choque = { x: tp.x - TAR.r * 0.4, y: tp.y - 3 - TAR.h };
      salpica(g, t, choque.x, choque.y);
      const bocaG = G.aPantalla(pG, G.boca(pG));
      aire(g, t, bocaG, T.sopla1, T.fin1, 0.9, { x: 0.93, y: 0.36 });
      aire(g, t, bocaG, T.sopla2, T.fin2, 1.3, { x: 0.92, y: 0.4 });
      aire(g, t, bocaG, T.soplaN, T.soplaN1, 0.5, { x: 0.45, y: -0.89 });
      // la sala a oscuras; solo alumbran las velas
      const flamas = VELAS.map((v, i) => llamaVela(i, t)), fn = llamaNariz(t);
      const intensidad = Math.min(1, VELAS.reduce((a, v, i) => a + luzVela(i, t), 0) / 5 + 0.35 * luzNariz(t));
      g.fillStyle = `rgba(6,10,28,${LUZ_CUARTO + 0.16 * (1 - intensidad)})`; g.fillRect(-60, -80, W + 120, H + 160);
      if (intensidad > 0.01) {
        const mn = mechaNariz(pG), kn = suave(fase(t, T.plaf, T.nariz + 0.2));
        const ccx = lerp(tp.x, mn.x, kn), cy = lerp(tp.y - 50, mn.y, kn);
        const parpa = 1 + 0.05 * ruido(t * 11);
        const gr = g.createRadialGradient(ccx, cy, 8, ccx, cy, 330 * parpa);
        gr.addColorStop(0, `rgba(255,190,110,${0.42 * intensidad})`); gr.addColorStop(0.4, `rgba(255,150,70,${0.2 * intensidad})`); gr.addColorStop(1, "rgba(255,120,40,0)");
        g.save(); g.globalCompositeOperation = "lighter"; g.fillStyle = gr; g.beginPath(); g.arc(ccx, cy, 330 * parpa, 0, Math.PI * 2); g.fill(); g.restore();
      }
      // llamas y chispas (brillan por encima de la oscuridad)
      const vi = viento(t);
      VELAS.forEach((v, i) => { const m = mecha(tp.x, tp.y, i); dibLlama(g, m.x, m.y, flamas[i], 0.15 + vi * (1.1 - i * 0.08), t, i); });
      ENCENDIDOS.forEach(([te, i, f]) => { const m = mecha(tp.x, tp.y, i); chispas(g, t, te, m.x, m.y, f); });
      if (t >= T.plaf) {
        const m = mechaNariz(pG), ang = pG.torso * 0.4 + pG.cabeza.ang * 0.4;
        dibLlama(g, m.x, m.y, fn, 0.1 - ang - 1.2 * campana(t, T.soplaN, T.soplaN1), t, 7);
        chispas(g, t, T.nariz, m.x, m.y, 1.2); chispas(g, t, T.enciendeN, m.x, m.y, 1.3);
      }
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00015", nombre: "Guillermo y Laura · La tarta", crear: () => new LauraTarta() });
  window.__A2D_00015 = { pose: t => ({ g: poseG(t), l: poseL(t) }), T, DUR };
})();
