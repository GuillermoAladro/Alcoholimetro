"use strict";
/* 00012.2 · Guillermo y Laura · El alcoholímetro
 *
 * Negro → en un rincón del bar hay un alcoholímetro de monedas entre los dos, cara a cara:
 * Guillermo a la izquierda y Laura a la derecha → Laura se acerca, le enseña una moneda con un
 * guiño, la mete, coge la boquilla y sopla tranquila: la aguja ni se mueve, 0.00, luz verde y
 * lucecitas de alegría → deja la boquilla y le cede el turno con la mano abierta → Guillermo,
 * chulito, se acerca, lanza la moneda con el pulgar directa a la ranura, coge aire hasta hincharse
 * y sopla con todas sus fuerzas, rojo como un tomate: la aguja se clava al final, los números se
 * disparan, sale la sirena roja, la máquina tiembla y echa humo → suelta la boquilla (vuelve sola
 * a su sitio con el cable) y levanta el pulgar a cámara, orgulloso → Laura arquea una ceja, se
 * acerca, le quita las llaves del coche que él ha sacado del bolsillo, las hace girar en el dedo,
 * guiña a cámara y se va → Guillermo se queda haciendo pucheros → negro.
 *
 * Los únicos números son los de la pantalla de la máquina. Todo depende del tiempo absoluto.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, L = Laura;
  const S = 0.32, SUELO = 560, DUR = 14.0;
  const MX = 560;                                   // centro de la máquina (px de pantalla)
  const ESC_MANO_L = 0.88;                          // personajes/laura/laura.js · manos.escala
  const T = {
    lMira: 0.35, gMira: 0.55,
    lPaso0: 0.8, lPaso1: 1.45,
    lMoneda0: 1.3, lMoneda1: 1.75, lMete0: 1.92, lMete: 2.28,
    enciende: 2.3, listo: 2.75,
    lBoq0: 2.42, lBoqCoge: 2.72, lBoca: 3.12,
    lSopla0: 3.15, lSopla1: 4.05, lRes: 4.1,
    lDeja0: 4.4, lDeja: 4.82,
    lAtras0: 4.9, lAtras1: 5.5,
    lTurno0: 5.15, lTurno1: 6.25,
    gPaso0: 5.65, gPaso1: 6.4,
    gMoneda0: 6.3, gLanza: 6.78, gEncaja: 7.12,
    gBoq0: 7.1, gBoqCoge: 7.36, gBoca0: 7.4,
    gInspira0: 7.45, gInspira1: 7.92, gSopla0: 7.98, gSopla1: 9.25,
    alarma: 8.55, rebosa: 8.88,
    gSuelta: 9.3, gVuelve: 9.62,
    gPulgar0: 9.42, gPulgar1: 9.78,
    gSaca0: 10.02, gSaca1: 10.4, gTintinea: 10.45,
    lCeja: 9.55,
    lCamina0: 10.0, lCamina1: 10.72,
    lCoge0: 10.68, lCoge: 11.02, lSube: 11.28,
    gVacia: 11.08, gBaja: 11.5,
    lGira0: 11.32, lGuina: 11.55,
    lSale0: 11.62, lSale1: 13.3,
    gPuchero0: 12.05,
    fin: 13.45
  };

  /* ---------- quién está dónde: coordenada «hacia delante» u (x = x0 + dir·u) ---------- */
  const PJ = {
    g: { P: G, dir: 1, x0: 300, k: S * G.K, off: { cerca: -19, lejos: 18 }, alto: 55,
         tobY: { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 } },
    l: { P: L, dir: -1, x0: 830, k: S * L.K, off: { cerca: -15, lejos: 17 }, alto: 60,
         tobY: { cerca: L.SUELO - L.TOBILLO_ALTO, lejos: L.SUELO - L.TOBILLO_ALTO - 10 } }
  };
  const XG = 452, XL = 655, XL_ATRAS = 760, XL_COGE = 668, XL_FUERA = -135;
  // movimientos de la pelvis: [t0, t1, u destino, pasos, perfil]
  const MOV = {
    g: [[T.gPaso0, T.gPaso1, XG - PJ.g.x0, 2, "suave"]],
    l: [[T.lPaso0, T.lPaso1, PJ.l.x0 - XL, 2, "suave"], [T.lAtras0, T.lAtras1, PJ.l.x0 - XL_ATRAS, 2, "suave"],
        [T.lCamina0, T.lCamina1, PJ.l.x0 - XL_COGE, 2, "suave"], [T.lSale0, T.lSale1, PJ.l.x0 - XL_FUERA, 7, "rampa"]]
  };
  // perfil «rampa»: arranca suave y sigue a velocidad constante (sale de plano andando)
  const rampa = (k, a = 0.22) => { k = clamp(k); const v = 1 / (1 - a / 2); return k < a ? v * k * k / (2 * a) : v * (a / 2 + k - a); };
  const perfil = (nom, k) => nom === "rampa" ? rampa(k) : suave(k);
  function uPelvis(id, t) {
    let u = 0;
    for (const [t0, t1, u1, , pf] of MOV[id]) { if (t <= t0) break; u = lerp(u, u1, perfil(pf, fase(t, t0, t1))); }
    return u;
  }
  // pisadas: [despega, apoya, u del tobillo]; el pie apoyado no resbala nunca
  function planPasos(id) {
    const c = PJ[id], pas = { cerca: [[-11, -10, c.off.cerca]], lejos: [[-11, -10, c.off.lejos]] };
    let u = 0;
    for (const [t0, t1, u1, n, pf] of MOV[id]) {
      const dt = (t1 - t0) / n, du = (u1 - u) / n, vuelo = Math.min(0.34, dt * 0.95);
      let pie = du >= 0 ? "lejos" : "cerca";            // hacia delante sale el pie de delante; hacia atrás, el de atrás
      for (let i = 0; i < n; i++) {
        const ti = t0 + (i + 1) * dt - (i === n - 1 ? 0 : dt * 0.08), ultimo = i === n - 1;
        const destino = ultimo ? u1 : uPelvis(id, ti) + du * 0.42;
        pas[pie].push([ti - vuelo, ti, destino + c.off[pie]]);
        pie = pie === "cerca" ? "lejos" : "cerca";
      }
      pas[pie].push([t1 - 0.04, t1 - 0.04 + vuelo * 0.8, u1 + c.off[pie]]);   // el otro pie se recoge
      u = u1;
    }
    return pas;
  }
  const PASOS = { g: planPasos("g"), l: planPasos("l") };
  {
    const u = XG - PJ.g.x0 + PJ.g.off.cerca;
    PASOS.g.cerca.push([T.gPuchero0 + 0.55, T.gPuchero0 + 0.78, u + 14], [T.gPuchero0 + 0.82, T.gPuchero0 + 1.02, u]);
  }
  function pie(id, lado, t) {
    const Ls = PASOS[id][lado]; let i = 0; while (i + 1 < Ls.length && t >= Ls[i + 1][0]) i++;
    const [t0, t1, x] = Ls[i], xa = i > 0 ? Ls[i - 1][2] : x, k = fase(t, t0, t1);
    const arco = Math.sin(Math.PI * k) * clamp(Math.abs(x - xa) / 40, 0.35, 1);
    return { u: lerp(xa, x, suave5(k)), alto: arco, ang: (x >= xa ? 1 : -0.5) * (0.3 * Math.sin(Math.PI * clamp(k * 1.3)) - 0.24 * campana(k, 0.55, 1)) };
  }

  /* ---------- posturas (se mezclan): manos respecto a su hombro, en la hoja de cada uno ---------- */
  // c*/l*: mano cercana / lejana · x, y, a (giro), mu (muñeca), p (fuera del bolsillo 0..1), d0..d4 (dedos, Laura)
  const P0 = { pel: 0, torso: 0, cab: 0, pecho: 0, cx: 40, cy: 300, ca: 0, cmu: -1.75, cp: 0, lx: 0, ly: 280, la: 0, lmu: -1.75, lp: 0, lpu: 0, cpu: 0,
    c0: 0, c1: 0, c2: 0, c3: 0, c4: 0, l0: 0, l1: 0, l2: 0, l3: 0, l4: 0 };
  const C_ = o => Object.assign({}, P0, o);
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function guion(lista, tabla, t, base) {
    let c = tabla[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, tabla[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const PINZA = { l0: 0.5, l1: 0.42, l2: 0.12, l3: 0.05, l4: 0.05 };
  const CUERPOS_L = {
    bolsillos: C_({}),
    moneda: C_(Object.assign({ lx: 95, ly: 40, la: 0, lmu: 1.45, lp: 1, cab: -0.05 }, PINZA)),
    ranura: C_(Object.assign({ torso: 0.08, lx: 150, ly: 85, lmu: 4.0, lp: 1 }, PINZA)),
    boquilla: C_({ torso: 0.06, lx: 140, ly: 60, lmu: 2.2, lp: 1, l0: 0.3, l1: 0.25, l2: 0.25, l3: 0.25, l4: 0.25 }),
    sopla: C_({ torso: 0.02, cab: 0.02, pecho: 0.01, lx: 120, ly: -10, lmu: 2.0, lp: 1, l0: 0.3, l1: 0.25, l2: 0.25, l3: 0.25, l4: 0.25 }),
    turno: C_({ torso: -0.03, cab: -0.05, lx: 205, ly: 105, la: 0, lmu: Math.PI - 0.35, lp: 1, l0: 0.85, l1: 1, l2: 1, l3: 1, l4: 1 }),
    jarras: C_({ torso: -0.03, cab: -0.05, cx: -70, cy: 300, cmu: -1.2, cp: 1 }),
    ceja: C_({ torso: -0.05, cab: -0.08, cx: -70, cy: 300, cmu: -1.2, cp: 1 }),
    coge: C_(Object.assign({ torso: 0.05, cab: 0.02, cx: -70, cy: 300, cmu: -1.2, cp: 1, lx: 200, ly: -30, lmu: -2.4, lp: 1 }, PINZA)),
    gira: C_({ torso: -0.04, cab: -0.06, cx: -70, cy: 300, cmu: -1.2, cp: 1, lx: 70, ly: -55, la: 0, lmu: 1.6 - 2 * Math.PI, lp: 1, l0: 0.1, l1: 1, l2: 0, l3: 0, l4: 0 }),
    sale: C_({ torso: 0.03, cab: -0.03, cx: -70, cy: 300, cmu: -1.2, cp: 1, lx: 70, ly: -55, la: 0, lmu: 1.6 - 2 * Math.PI, lp: 1, l0: 0.1, l1: 1, l2: 0, l3: 0, l4: 0 })
  };
  const GUION_L = [
    [T.lMoneda0, T.lMoneda1, "moneda"], [T.lMete0, T.lMete - 0.05, "ranura"], [T.lMete + 0.02, T.lBoqCoge, "boquilla"],
    [T.lBoqCoge + 0.05, T.lBoca, "sopla"], [T.lDeja0, T.lDeja, "boquilla"], [T.lTurno0, T.lTurno0 + 0.42, "turno"],
    [T.lTurno1 - 0.1, T.lTurno1 + 0.35, "bolsillos"], [T.lCeja - 0.05, T.lCeja + 0.4, "jarras"], [T.lCamina0, T.lCamina0 + 0.4, "ceja"],
    [T.lCoge0 - 0.25, T.lCoge, "coge"], [T.lCoge + 0.05, T.lGira0 + 0.15, "gira"], [T.lSale0, T.lSale0 + 0.4, "sale"]
  ];
  const CUERPOS_G = {
    bolsillos: C_({}),
    chulo: C_({ torso: -0.04, cab: -0.04 }),
    moneda: C_({ torso: -0.02, lx: 120, ly: 50, la: -0.4, lmu: -3.4, lp: 1 }),
    lanza: C_({ torso: -0.04, lx: 135, ly: 30, la: -0.6, lmu: -3.5, lp: 1 }),
    boquilla: C_({ torso: 0.1, lx: 150, ly: 30, lmu: -2.6, lp: 1 }),
    inspira: C_({ torso: -0.1, cab: -0.12, pecho: 0.05, pel: -6, lx: 150, ly: -40, lmu: 2.3, lp: 1 }),
    sopla: C_({ torso: 0.06, cab: 0.04, pecho: -0.02, pel: 8, lx: 130, ly: -40, lmu: 2.3, lp: 1 }),
    pulgar: C_({ torso: -0.06, cab: -0.06, cx: 300, cy: 45, ca: 0, cmu: -Math.PI, cp: 1, cpu: 0.8, lx: 30, ly: 270, lp: 0 }),
    llaves: C_({ torso: -0.02, cab: -0.05, lx: 188, ly: -22, la: 0, lmu: -3.25, lp: 1 }),
    vacia: C_({ torso: 0.03, cab: 0.04, lx: 180, ly: -14, la: 0, lmu: -3.25, lp: 1 }),
    baja: C_({ torso: 0.03, cab: 0.06, lx: 40, ly: 240, la: 0, lmu: -1.75, lp: 0 }),
    puchero: C_({ torso: 0.07, cab: 0.1, pel: 10 })
  };
  const GUION_G = [
    [T.gMira, T.gMira + 0.4, "chulo"], [T.gMoneda0, T.gMoneda0 + 0.32, "moneda"], [T.gLanza - 0.12, T.gLanza + 0.02, "lanza", salida],
    [T.gLanza + 0.06, T.gBoqCoge - 0.02, "boquilla"], [T.gInspira0, T.gInspira1, "inspira"], [T.gSopla0 - 0.04, T.gSopla0 + 0.12, "sopla"],
    [T.gSuelta + 0.04, T.gPulgar1, "pulgar"], [T.gSaca0, T.gSaca1, "llaves"], [T.gVacia, T.gVacia + 0.3, "vacia"],
    [T.gBaja, T.gBaja + 0.5, "baja"], [T.gPuchero0 - 0.1, T.gPuchero0 + 0.45, "puchero"]
  ];

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, mof: 0 };
  const E = o => Object.assign({}, BASE, o);
  const CARAS_G = {
    inicio: E({}),
    chulo: E({ mx: 0.9, my: 0.05, sd: 12, gd: 0.12, si: -2, gi: -0.05, orig: 0, sonr: 0.45, ancho: 0.9 }),
    aburre: E({ mx: 0.95, my: 0.15, c: 0.42, sd: 4, gd: 0.05, si: 4, gi: 0.05, orig: 0, sonr: 0.25, ancho: 0.85 }),
    vaya: E({ mx: 0.9, my: 0.05, sd: 16, gd: 0.12, si: 14, gi: 0.1, orig: 0, sonr: 0.05, abre: 6, ancho: 0.7 }),
    creido: E({ mx: 0.85, my: 0.25, c: 0.25, sd: 14, gd: 0.15, si: 10, gi: 0.1, orig: 0, sonr: 0.75, ancho: 1 }),
    inspira: E({ mx: 0.9, my: -0.1, iris: 0.92, sd: 20, gd: 0.15, si: 20, gi: 0.15, orig: 0, abre: 34, ancho: 0.62, sonr: -0.1, lengua: 0.2 }),
    sopla: E({ mx: 0.9, c: 1, z: 1, sd: -6, gd: -0.2, si: -6, gi: -0.2, orig: 0, abre: 0, ancho: 0.45, sonr: -0.25, mof: 1 }),
    orgullo: E({ mx: -0.85, my: -0.2, c: 0.3, h: 0.7, sd: 18, gd: 0.18, si: 18, gi: 0.18, orig: 0, abre: 20, ancho: 1.15, sonr: 1 }),
    llaves: E({ mx: -0.75, my: -0.1, c: 0.2, sd: 20, gd: 0.18, si: 8, gi: 0.05, orig: 0, abre: 6, ancho: 1.05, sonr: 0.85 }),
    extrana: E({ mx: 0.7, my: -0.35, iris: 1.08, sd: 22, gd: 0.15, si: 10, gi: 0.05, orig: 0, abre: 16, ancho: 0.55, sonr: -0.1, lengua: 0.2 }),
    sigue: E({ mx: -0.6, my: 0.2, iris: 1.05, sd: 18, gd: 0.25, si: 18, gi: 0.25, orig: 0, abre: 10, ancho: 0.6, sonr: -0.3 }),
    puchero: E({ mx: -0.85, my: 0.15, c: 0.2, iris: 1.12, sd: 10, gd: 0.32, si: 10, gi: 0.32, orig: 0, abre: 0, ancho: 0.72, sonr: -0.75 })
  };
  const GUION_CARA_G = [
    [T.gMira, T.gMira + 0.35, "chulo"], [T.lBoca + 0.1, T.lBoca + 0.5, "aburre"], [T.lRes, T.lRes + 0.25, "vaya"],
    [T.lTurno0 + 0.2, T.lTurno0 + 0.5, "creido"], [T.gInspira0, T.gInspira0 + 0.2, "inspira"], [T.gSopla0 - 0.03, T.gSopla0 + 0.08, "sopla"],
    [T.gSuelta - 0.02, T.gSuelta + 0.2, "orgullo"], [T.gSaca0 + 0.15, T.gSaca1 + 0.1, "llaves"], [T.gVacia, T.gVacia + 0.18, "extrana"], [T.lSale0 + 0.15, T.lSale0 + 0.5, "sigue"],
    [T.gPuchero0, T.gPuchero0 + 0.45, "puchero"]
  ];
  const CARAS_L = {
    inicio: E({ mx: 0.6, my: 0.2 }),
    maquina: E({ mx: 0.75, my: 0.45, orig: 0, sonr: 0.3, ancho: 0.9 }),
    guino: E({ mx: 0.92, my: 0.05, ci: 1, h: 1, sd: 14, gd: 0.1, si: 4, gi: 0.05, orig: 0, sonr: 0.7, ancho: 0.95 }),
    mete: E({ mx: 0.8, my: 0.55, sd: 6, si: 6, orig: 0, sonr: 0.35, ancho: 0.9 }),
    sopla: E({ mx: 0.6, my: 0.2, c: 1, h: 0.45, sd: 8, si: 8, orig: 0, abre: 8, ancho: 0.4, sonr: 0, mof: 0.35, dientes: 0 }),
    contenta: E({ mx: 0.85, my: 0.3, c: 0.5, h: 1, sd: 14, gd: 0.1, si: 14, gi: 0.1, orig: 0, abre: 16, ancho: 1.05, sonr: 0.95 }),
    turno: E({ mx: 0.95, my: 0, sd: 10, gd: 0.08, si: 10, gi: 0.08, orig: 0, abre: 6, ancho: 1, sonr: 0.7 }),
    mira: E({ mx: 0.9, my: 0.1, sd: 6, si: 6, orig: 0, sonr: 0.35, ancho: 0.95 }),
    asombro: E({ mx: 0.8, my: 0.35, iris: 1.08, sd: 22, gd: 0.12, si: 22, gi: 0.12, orig: 0, abre: 18, ancho: 0.65, sonr: -0.1 }),
    ceja: E({ mx: 0.92, my: 0.05, c: 0.4, sd: 28, gd: 0.18, si: -6, gi: -0.12, orig: 0, sonr: -0.12, ancho: 0.82 }),
    coge: E({ mx: 0.8, my: -0.05, c: 0.15, sd: 18, gd: 0.12, si: 0, gi: 0, orig: 0, sonr: 0.45, ancho: 0.9 }),
    picara: E({ mx: -0.8, my: -0.1, ci: 1, h: 1, sd: 18, gd: 0.12, si: 4, gi: 0, orig: 0, sonr: 0.8, ancho: 1, abre: 4 }),
    sale: E({ mx: 0.95, my: 0, sd: 10, gd: 0.08, si: 6, gi: 0.05, orig: 0, sonr: 0.65, ancho: 0.95 })
  };
  const GUION_CARA_L = [
    [T.lMira, T.lMira + 0.35, "maquina"], [T.lMoneda0 + 0.15, T.lMoneda1, "guino"], [T.lMete0, T.lMete0 + 0.25, "mete"],
    [T.lSopla0 - 0.05, T.lSopla0 + 0.25, "sopla"], [T.lRes, T.lRes + 0.3, "contenta"], [T.lTurno0 + 0.1, T.lTurno0 + 0.4, "turno"],
    [T.lTurno1, T.lTurno1 + 0.3, "mira"], [T.alarma - 0.05, T.alarma + 0.15, "asombro"], [T.lCeja, T.lCeja + 0.3, "ceja"],
    [T.lCoge0 - 0.2, T.lCoge0 + 0.15, "coge"], [T.lGuina - 0.05, T.lGuina + 0.25, "picara"], [T.lSale0 + 0.25, T.lSale0 + 0.6, "sale"]
  ];
  function parpadeos(lista, t) {
    let o = 0;
    for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); }
    return o;
  }
  const PARP_G = [1.4, 3.6, 5.3, 6.95, 10.45, 12.8], PARP_L = [0.95, 2.05, 4.65, 6.6, 8.2, 10.35, 12.6];
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: 0,
      ojos: { d: Math.max(e.c, e.cd, parp), i: Math.max(e.c, e.ci, parp), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }

  /* ---------- utilidades de manos ---------- */
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, 0, -1.75), l: punoDesde({ x: 372, y: 648 }, 0, -1.75) };
  const BOLS_L = { c: L.BOLSILLO_C, l: L.BOLSILLO_L };
  // dentro de mano.objeto: pasa a dibujar en píxeles de pantalla con origen en el centro del puño
  const enPantalla = (g, id, ang) => { const c = PJ[id]; g.scale(1 / G.JK, 1 / G.JK); g.rotate(-(ang || 0)); g.scale(c.dir / c.k, 1 / c.k); };
  // dirección (pantalla) de los dedos de una mano: la muñeca está en el ángulo mu (+giro) del puño
  function dirDedos(id, m) { const a = (m.mu ?? -1.75) + (m.ang || 0) + Math.PI; return { x: Math.cos(a) * PJ[id].dir, y: Math.sin(a) }; }
  // punta del índice (pantalla, respecto al centro del puño) para la mano de Laura
  function puntaIndice(m) {
    const mu = m.mu ?? -1.75, q = G.rotP({ x: 8.4 * ESC_MANO_L, y: 18.9 * ESC_MANO_L }, mu + Math.PI / 2);
    const s = G.rotP(q, m.ang || 0), k = PJ.l.k * G.JK;
    return { x: s.x * k * PJ.l.dir, y: s.y * k };
  }

  /* ---------- objetos ---------- */
  function moneda(g, x, y, ancho, a) {
    g.save(); g.translate(x, y); g.rotate(a || 0);
    g.fillStyle = "#f7c63a"; g.strokeStyle = "#5a3b00"; g.lineWidth = 1.4;
    g.beginPath(); g.ellipse(0, 0, Math.max(1.2, 6.5 * ancho), 6.5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#fff3b0"; g.beginPath(); g.ellipse(-2 * ancho, -1.8, 2.2 * ancho, 1.6, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // boquilla: base (agarre) en el origen, apunta hacia el ángulo a; largo hasta la punta = BOQ
  const BOQ = 21;
  function boquilla(g, x, y, a) {
    g.save(); g.translate(x, y); g.rotate(a); g.lineJoin = "round"; g.lineCap = "round";
    g.fillStyle = "#f4f6f8"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.8;
    g.beginPath(); g.moveTo(-9, -4.2); g.lineTo(BOQ - 3, -3.2); g.quadraticCurveTo(BOQ, -3, BOQ, 0); g.quadraticCurveTo(BOQ, 3, BOQ - 3, 3.2); g.lineTo(-9, 4.2); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#2f7fe0"; g.fillRect(-9, -4.2, 5, 8.4); g.strokeRect(-9, -4.2, 5, 8.4);
    g.fillStyle = "rgba(160,180,200,0.6)"; g.fillRect(0, 1, BOQ - 4, 1.6);
    g.restore();
  }
  const finBoquilla = (x, y, a) => ({ x: x - Math.cos(a) * 9, y: y - Math.sin(a) * 9 });     // donde entra el cable
  // llavero: anilla, dos llaves y el mando del coche (px de pantalla; origen en la anilla, cuelga hacia +y)
  function llaves(g, giro, brillo) {
    g.save(); g.rotate(giro); g.lineJoin = "round"; g.lineCap = "round";
    const tinta = "#0b0a0e";
    // llave dorada
    g.save(); g.translate(-2, 5); g.rotate(0.35);
    g.fillStyle = "#e6b84a"; g.strokeStyle = tinta; g.lineWidth = 1.3;
    g.beginPath(); g.arc(0, 4, 4, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-1.6, 7.5); g.lineTo(-1.6, 18); g.lineTo(0.6, 19.5); g.lineTo(1.6, 17); g.lineTo(3, 16); g.lineTo(1.6, 14); g.lineTo(1.6, 7.5); g.closePath(); g.fill(); g.stroke();
    g.restore();
    // llave plateada
    g.save(); g.translate(1, 5); g.rotate(-0.25);
    g.fillStyle = "#cfd6de"; g.strokeStyle = tinta; g.lineWidth = 1.3;
    g.beginPath(); g.arc(0, 4.2, 4.2, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-1.6, 8); g.lineTo(-1.6, 20); g.lineTo(1.6, 20); g.lineTo(2.6, 18.5); g.lineTo(1.6, 17); g.lineTo(2.6, 15.5); g.lineTo(1.6, 14); g.lineTo(1.6, 8); g.closePath(); g.fill(); g.stroke();
    g.restore();
    // mando del coche
    g.save(); g.translate(6, 6); g.rotate(-0.55);
    g.fillStyle = "#1c1b22"; g.strokeStyle = tinta; g.lineWidth = 1.3;
    g.beginPath(); g.roundRect ? g.roundRect(-4.5, 1, 9, 15, 4) : g.rect(-4.5, 1, 9, 15); g.fill(); g.stroke();
    g.fillStyle = "#e23b3b"; g.beginPath(); g.arc(0, 6, 1.9, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#8f96a3"; g.beginPath(); g.arc(0, 11, 1.6, 0, Math.PI * 2); g.fill();
    g.restore();
    // anilla
    g.strokeStyle = tinta; g.lineWidth = 3.6; g.beginPath(); g.arc(0, 2.5, 4.6, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "#dfe5ec"; g.lineWidth = 1.8; g.beginPath(); g.arc(0, 2.5, 4.6, 0, Math.PI * 2); g.stroke();
    if (brillo > 0.01) { g.globalAlpha = brillo; g.strokeStyle = "#ffffff"; g.lineWidth = 1.6;
      for (const [x, y] of [[-9, 6], [10, 14], [-6, 20]]) { g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x + 3, y); g.moveTo(x, y - 3); g.lineTo(x, y + 3); g.stroke(); } }
    g.restore();
  }
  // las llaves cuelgan del bolsillo lejano de Guillermo hasta que Laura se las quita
  const LLAVE_G = { x: 393, y: 664 };
  const balanceoLlaves = t => 0.1 * Math.sin(t * 2.4 + 0.4) + 0.22 * Math.sin(t * 9.5) * Math.exp(-3 * Math.max(0, t - T.gPaso1)) * (t > T.gPaso0 ? 1 : 0)
    + 0.18 * Math.sin((t - T.gSopla0) * 26) * tramo(t, T.gSopla0, T.gSopla0 + 0.2) * (1 - tramo(t, T.gSopla1 - 0.1, T.gSopla1 + 0.1));

  /* ---------- la máquina ---------- */
  // Caja con la esfera de la aguja y la pantalla a la altura del pecho; ranura y boquilla arriba en el centro.
  const MQ = { x0: MX - 66, x1: MX + 66, y0: 262, y1: 452, ranura: { x: MX, y: 284 }, boqBase: { x: MX + 10, y: 250 }, ancla: { x: MX + 10, y: 242 }, sir: MX + 42,
    esfera: { x: MX, y: 346, r: 37 }, pant: { x: MX - 50, y: 404, w: 100, h: 36 } };
  const A_DOCK = -Math.PI / 2;
  function valor(t) {               // lo que marca (g/l); null = apagada; "888" = autotest o desbordada
    if (t < T.enciende + 0.04) return null;
    if (t < T.listo) return "888";
    if (t < T.gSopla0 + 0.1) return 0;
    const u = fase(t, T.gSopla0 + 0.1, T.rebosa);
    if (u < 1) return Math.min(9.99, 9.99 * Math.pow(u, 1.7) + (u > 0.05 ? hash(Math.floor(t * 24)) * 0.12 : 0));
    return "888";
  }
  function aguja(t) {               // 0..1 de la esfera
    let a = 0;
    if (t > T.lSopla0 && t < T.lRes + 0.3) a = 0.025 * campana(t, T.lSopla0, T.lRes + 0.3) * (0.6 + 0.4 * Math.sin(t * 23));
    if (t > T.gSopla0) {
      const u = fase(t, T.gSopla0 + 0.08, T.gSopla0 + 0.55);
      a = Math.min(1.02, salida(u) * 1.04) + 0.018 * Math.sin(t * 47) * tramo(t, T.gSopla0 + 0.45, T.gSopla0 + 0.6) * (1 - 0.6 * tramo(t, T.gSuelta, T.gSuelta + 1.5));
    }
    return a;
  }
  function estado(t) {
    const enc = t >= T.enciende;
    let luz = "apagada";
    if (enc && t < T.listo) luz = "test"; else if (t < T.lSopla0) luz = "listo"; else if (t < T.lRes) luz = "mide"; else if (t < T.gEncaja) luz = "bien";
    else if (t < T.gSopla0) luz = "listo"; else if (t < T.alarma - 0.15) luz = "mide"; else luz = "alarma";
    if (!enc) luz = "apagada";
    return luz;
  }
  const SEG = { 0: "abcdef", 1: "bc", 2: "abged", 3: "abgcd", 4: "fgbc", 5: "afgcd", 6: "afgedc", 7: "abc", 8: "abcdefg", 9: "abcdfg" };
  function digito(g, x, y, w, h, n, color, apagado, punto) {
    const e = w * 0.17, segs = {
      a: [x + e, y, w - 2 * e, e], d: [x + e, y + h - e, w - 2 * e, e], g: [x + e, y + h / 2 - e / 2, w - 2 * e, e],
      f: [x, y + e, e, h / 2 - e], b: [x + w - e, y + e, e, h / 2 - e], e: [x, y + h / 2, e, h / 2 - e], c: [x + w - e, y + h / 2, e, h / 2 - e] };
    for (const k in segs) {
      const on = n !== null && SEG[n].includes(k), [sx, sy, sw, sh] = segs[k];
      g.fillStyle = on ? color : apagado; g.beginPath(); g.roundRect ? g.roundRect(sx, sy, sw, sh, e * 0.4) : g.rect(sx, sy, sw, sh); g.fill();
    }
    if (punto !== undefined) { g.fillStyle = punto ? color : apagado; g.beginPath(); g.arc(x + w + w * 0.14, y + h - e / 2, e * 0.62, 0, Math.PI * 2); g.fill(); }
  }
  function temblorMaquina(t) {
    const a = 2.4 * tramo(t, T.gSopla0 + 0.3, T.alarma) * (1 - 0.65 * tramo(t, T.gSuelta, T.gSuelta + 1.2)) + 3 * campana(t, T.rebosa - 0.02, T.rebosa + 0.35);
    return { x: ruido(t * 38) * a, y: ruido(t * 38 + 7) * a * 0.5 };
  }
  function sirena(t) { return t < T.alarma ? 0 : M2.rebote(fase(t, T.alarma, T.alarma + 0.38), 2.2); }
  function giroSirena(t) {          // la luz gira y se va frenando un poco al final
    const v = 8.5, u = Math.max(0, t - T.alarma), fr = Math.max(0, t - 12.2);
    return u * v - fr * fr * 1.6;
  }
  function maquina(g, t, mov) {
    const sh = temblorMaquina(t), luz = estado(t);
    g.save(); g.translate(sh.x, sh.y); g.lineJoin = "round"; g.lineCap = "round";
    const tinta = "#0b0a0e";
    // pie: columna cromada y base
    g.fillStyle = "#1a1c24"; g.beginPath(); g.ellipse(MX, SUELO - 6, 62, 10, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(MX - 56, SUELO - 6); g.lineTo(MX - 50, SUELO - 22); g.lineTo(MX + 50, SUELO - 22); g.lineTo(MX + 56, SUELO - 6); g.closePath(); g.fill();
    g.lineWidth = 3; g.strokeStyle = tinta; g.stroke();
    const col = g.createLinearGradient(MX - 16, 0, MX + 16, 0); col.addColorStop(0, "#8a929e"); col.addColorStop(0.35, "#f1f4f8"); col.addColorStop(0.6, "#b7bec8"); col.addColorStop(1, "#5d6470");
    g.fillStyle = col; g.fillRect(MX - 15, MQ.y1 - 2, 30, SUELO - 22 - MQ.y1 + 2); g.strokeRect(MX - 15, MQ.y1 - 2, 30, SUELO - 22 - MQ.y1 + 2);
    // placa con el dibujo de «si bebes, no conduzcas» (solo iconos)
    g.fillStyle = "#f4f1e8"; g.beginPath(); g.roundRect ? g.roundRect(MX - 13, 472, 26, 26, 5) : g.rect(MX - 13, 472, 26, 26); g.fill(); g.lineWidth = 1.8; g.stroke();
    g.fillStyle = "#1f2430"; g.beginPath(); g.moveTo(MX - 8, 490); g.lineTo(MX - 6, 483); g.lineTo(MX + 5, 483); g.lineTo(MX + 8, 490); g.closePath(); g.fill();
    g.beginPath(); g.arc(MX - 4.5, 491, 2.2, 0, Math.PI * 2); g.arc(MX + 4.5, 491, 2.2, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#d8262f"; g.lineWidth = 2.4; g.beginPath(); g.arc(MX, 485, 10, 0, Math.PI * 2); g.moveTo(MX - 7, 492); g.lineTo(MX + 7, 478); g.stroke();
    // sirena (sale del techo al dispararse)
    const sir = sirena(t);
    if (sir > 0.001) {
      const yb = MQ.y0 - 4 - 30 * sir, sx = MQ.sir;
      g.fillStyle = "#c9ced6"; g.strokeStyle = tinta; g.lineWidth = 2.2;
      g.fillRect(sx - 3, yb + 10, 6, MQ.y0 - yb - 10); g.strokeRect(sx - 3, yb + 10, 6, MQ.y0 - yb - 10);
      const encend = 0.75 + 0.25 * Math.sin(giroSirena(t) * 2);
      const gr = g.createRadialGradient(sx - 3, yb - 2, 1, sx, yb, 14);
      gr.addColorStop(0, `rgba(255,${Math.round(190 * encend)},${Math.round(160 * encend)},1)`); gr.addColorStop(0.6, "#ff2a2a"); gr.addColorStop(1, "#9c0c0c");
      g.fillStyle = gr; g.beginPath(); g.moveTo(sx - 14, yb + 11); g.quadraticCurveTo(sx - 14, yb - 12, sx, yb - 12); g.quadraticCurveTo(sx + 14, yb - 12, sx + 14, yb + 11); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(sx - 5, yb - 4, 3, 5, -0.4, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#2a2d36"; g.fillRect(sx - 16, yb + 9, 32, 6); g.strokeRect(sx - 16, yb + 9, 32, 6);
    }
    // caja
    const cx0 = MQ.x0, cx1 = MQ.x1, cy0 = MQ.y0, cy1 = MQ.y1;
    g.fillStyle = "#0f2a66"; g.beginPath(); g.moveTo(cx1, cy0 + 8); g.lineTo(cx1 + 16, cy0); g.lineTo(cx1 + 16, cy1 - 10); g.lineTo(cx1, cy1); g.closePath(); g.fill(); g.lineWidth = 3; g.strokeStyle = tinta; g.stroke();
    const caja = g.createLinearGradient(cx0, cy0, cx1, cy1); caja.addColorStop(0, "#2f6ae0"); caja.addColorStop(1, "#1a3f99");
    g.fillStyle = caja; g.beginPath(); g.roundRect ? g.roundRect(cx0, cy0, cx1 - cx0, cy1 - cy0, 14) : g.rect(cx0, cy0, cx1 - cx0, cy1 - cy0); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.16)"; g.beginPath(); g.roundRect ? g.roundRect(cx0 + 6, cy0 + 5, 20, cy1 - cy0 - 10, 8) : g.rect(cx0 + 6, cy0 + 5, 20, cy1 - cy0 - 10); g.fill();
    // tapa superior cromada
    g.fillStyle = "#c9ced6"; g.beginPath(); g.roundRect ? g.roundRect(cx0 - 4, cy0 - 7, cx1 - cx0 + 8, 12, 6) : g.rect(cx0 - 4, cy0 - 7, cx1 - cx0 + 8, 12); g.fill(); g.lineWidth = 2.5; g.stroke();
    // ranura de la moneda (arriba en el centro)
    const rn = MQ.ranura;
    g.fillStyle = "#d9dee5"; g.beginPath(); g.roundRect ? g.roundRect(rn.x - 13, rn.y - 12, 26, 24, 5) : g.rect(rn.x - 13, rn.y - 12, 26, 24); g.fill(); g.lineWidth = 2; g.stroke();
    g.fillStyle = "#16181e"; g.fillRect(rn.x - 2, rn.y - 8, 4, 16);
    const verde = luz === "apagada" ? 0 : (luz === "listo" ? 0.6 + 0.4 * Math.sin(t * 7) : 0.5);
    g.fillStyle = `rgba(60,255,110,${verde})`; g.beginPath(); g.arc(rn.x + 8, rn.y - 6, 2.6, 0, Math.PI * 2); g.fill();
    // portaboquillas
    // esfera con aguja
    const ef = MQ.esfera;
    g.fillStyle = "#c9ced6"; g.beginPath(); g.arc(ef.x, ef.y, ef.r + 5, 0, Math.PI * 2); g.fill(); g.lineWidth = 2.5; g.stroke();
    g.fillStyle = "#fbfaf5"; g.beginPath(); g.arc(ef.x, ef.y, ef.r, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.5; g.stroke();
    const A0 = Math.PI * 0.8, A1 = Math.PI * 2.2;
    for (const [k0, k1, c] of [[0, 0.22, "#2fbf57"], [0.22, 0.5, "#f2c230"], [0.5, 1, "#e33a2f"]]) {
      g.strokeStyle = c; g.lineWidth = 6; g.lineCap = "butt"; g.beginPath(); g.arc(ef.x, ef.y, ef.r - 7, lerp(A0, A1, k0), lerp(A0, A1, k1)); g.stroke();
    }
    g.lineCap = "round"; g.strokeStyle = tinta; g.lineWidth = 1.4;
    for (let i = 0; i <= 10; i++) { const a = lerp(A0, A1, i / 10), r0 = ef.r - (i % 5 ? 13 : 16); g.beginPath(); g.moveTo(ef.x + Math.cos(a) * r0, ef.y + Math.sin(a) * r0); g.lineTo(ef.x + Math.cos(a) * (ef.r - 11), ef.y + Math.sin(a) * (ef.r - 11)); g.stroke(); }
    const an = lerp(A0, A1, aguja(t));
    g.strokeStyle = "#c01818"; g.lineWidth = 2.6; g.beginPath(); g.moveTo(ef.x - Math.cos(an) * 6, ef.y - Math.sin(an) * 6); g.lineTo(ef.x + Math.cos(an) * (ef.r - 5), ef.y + Math.sin(an) * (ef.r - 5)); g.stroke();
    g.fillStyle = tinta; g.beginPath(); g.arc(ef.x, ef.y, 4, 0, Math.PI * 2); g.fill();
    // corona de lucecitas alrededor de la esfera
    for (let i = 0; i < 12; i++) {
      const a = -Math.PI / 2 + i / 12 * Math.PI * 2, lx = ef.x + Math.cos(a) * (ef.r + 11), ly = ef.y + Math.sin(a) * (ef.r + 11);
      let c = "rgba(40,48,70,1)", k = 0;
      if (luz === "test") { c = "#ffe6a0"; k = 0.5 + 0.5 * Math.sin(t * 20 + i); }
      else if (luz === "listo") { c = "#ffb83a"; k = Math.pow(0.5 + 0.5 * Math.cos(t * 8 - i * 0.7), 3); }
      else if (luz === "mide") { c = "#7fd0ff"; k = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.cos(t * 14 - i * 1.1), 2); }
      else if (luz === "bien") { c = "#4dff7a"; k = Math.pow(0.5 + 0.5 * Math.cos(t * 10 - i * 0.6), 2) * (0.5 + 0.5 * tramo(t, T.lRes, T.lRes + 0.1)); }
      else if (luz === "alarma") { c = "#ff3a2a"; k = 0.5 + 0.5 * Math.sin(t * 18 + (i % 2) * Math.PI); }
      g.fillStyle = "rgba(40,48,70,1)"; g.beginPath(); g.arc(lx, ly, 3.4, 0, Math.PI * 2); g.fill();
      if (k > 0.01) { g.globalAlpha = k; g.fillStyle = c; g.beginPath(); g.arc(lx, ly, 3.4, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
      g.lineWidth = 1; g.strokeStyle = tinta; g.beginPath(); g.arc(lx, ly, 3.4, 0, Math.PI * 2); g.stroke();
    }
    // pantalla de 7 segmentos: x.xx
    const pt = MQ.pant;
    g.fillStyle = "#c9ced6"; g.beginPath(); g.roundRect ? g.roundRect(pt.x - 5, pt.y - 5, pt.w + 10, pt.h + 10, 5) : g.rect(pt.x - 5, pt.y - 5, pt.w + 10, pt.h + 10); g.fill(); g.lineWidth = 2; g.strokeStyle = tinta; g.stroke();
    g.fillStyle = "#07080b"; g.fillRect(pt.x, pt.y, pt.w, pt.h);
    const v = valor(t);
    let txt = null;
    if (v === "888") txt = "888"; else if (v !== null) txt = String(Math.round(v * 100)).padStart(3, "0");
    const desborda = t >= T.rebosa, parpadea = (v === "888" && luz === "test" && Math.sin(t * 30) < -0.3) || (desborda && Math.sin(t * 16) < -0.25);
    const colorD = luz === "bien" || (t >= T.lRes && t < T.gEncaja) ? "#4dff7a" : (t >= T.gSopla0 + 0.1 ? "#ff3a2a" : "#ffb02e");
    const dw = 25, dh = pt.h - 8, x0 = pt.x + (pt.w - (3 * dw + 2 * 6)) / 2;
    for (let i = 0; i < 3; i++) digito(g, x0 + i * (dw + 6), pt.y + 4, dw, dh, txt && !parpadea ? +txt[i] : null, colorD, "#1b0f0d", i === 0 ? !!txt && !parpadea : undefined);
    if (txt && !parpadea) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.14; g.fillStyle = colorD; g.fillRect(pt.x - 3, pt.y - 3, pt.w + 6, pt.h + 6); g.restore(); }
    // tornillos
    g.fillStyle = "#c9ced6"; for (const [x, y] of [[cx0 + 9, cy1 - 9], [cx1 - 9, cy1 - 9]]) { g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.2; g.stroke(); }
    // boquilla en su sitio (o volviendo sola con el cable)
    if (mov.boqLibre) boquilla(g, mov.boqLibre.x - sh.x, mov.boqLibre.y - sh.y, mov.boqLibre.a);
    const pb = MQ.boqBase;
    g.fillStyle = "#c9ced6"; g.strokeStyle = tinta; g.lineWidth = 2;
    g.beginPath(); g.moveTo(pb.x - 9, cy0 - 5); g.lineTo(pb.x - 7, pb.y - 7); g.lineTo(pb.x + 7, pb.y - 7); g.lineTo(pb.x + 9, cy0 - 5); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#16181e"; g.beginPath(); g.ellipse(pb.x, pb.y - 7, 7, 2.2, 0, 0, Math.PI * 2); g.fill();
    g.restore();
    return sh;
  }
  // cable en espiral desde el anclaje hasta la boquilla
  function cable(g, a, b, t) {
    const d = Math.hypot(b.x - a.x, b.y - a.y); if (d < 3) return;
    const cuelga = 5 + d * 0.08;          // cable en espiral: casi recto, se encoge solo
    const c = { x: (a.x + b.x) / 2, y: Math.max(a.y, b.y) + cuelga };
    const n = Math.max(10, Math.round(14 + 12 * clamp(1 - d / 160)));
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const k = i / 60, x = (1 - k) * (1 - k) * a.x + 2 * k * (1 - k) * c.x + k * k * b.x, y = (1 - k) * (1 - k) * a.y + 2 * k * (1 - k) * c.y + k * k * b.y;
      const tx = 2 * (1 - k) * (c.x - a.x) + 2 * k * (b.x - c.x), ty = 2 * (1 - k) * (c.y - a.y) + 2 * k * (b.y - c.y), tl = Math.hypot(tx, ty) || 1;
      const amp = 3.2 * Math.sin(Math.PI * k) + 0.8;
      const w = Math.sin(k * n * Math.PI * 2) * amp;
      pts.push({ x: x - ty / tl * w, y: y + tx / tl * w });
    }
    g.beginPath(); g.moveTo(pts[0].x, pts[0].y); for (const q of pts) g.lineTo(q.x, q.y);
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3.4; g.stroke(); g.strokeStyle = "#3a3d48"; g.lineWidth = 1.6; g.stroke();
    g.restore();
  }

  /* ---------- poses ---------- */
  // Brazos y piernas: rodajas en cuña (sin dientes de sierra) en los dos; Guillermo además con la IK
  // continua en los brazos (se lleva la boquilla a la boca y el codo se dobla mucho).
  const OPC = { g: { limpias: true, continuo: true }, l: { limpias: true, continuo: true } };
  function base(id, t, b, e, parp) {
    const c = PJ[id], P = c.P, uP = uPelvis(id, t);
    const respira = Math.sin(t * (id === "g" ? 2.2 : 2.5) + (id === "g" ? 0 : 1.3));
    const fC = pie(id, "cerca", t), fL = pie(id, "lejos", t);
    const bote = 13 * Math.max(fC.alto, fL.alto);
    const p = {
      x: c.x0 + c.dir * uP, suelo: SUELO, s: S, espejo: c.dir < 0,
      pelvis: { x: P.PELVIS.x, y: P.PELVIS.y + b.pel + respira * 1.3 - bote },
      torso: b.torso, torsoEsc: { x: 1 + b.pecho * 0.7, y: 1 + respira * 0.004 + b.pecho },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      hombrosContinuos: id === "g", hombrosRecortados: id === "g",
      cara: cara(e, parp), tirasLimpias: OPC[id].limpias, ikContinuo: OPC[id].continuo
    };
    for (const [lado, f] of [["cerca", fC], ["lejos", fL]]) p.piernas[lado] = { tob: { x: P.PELVIS.x + (f.u - uP) / c.k, y: c.tobY[lado] - c.alto * f.alto }, ang: f.ang };
    return p;
  }
  function manosBase(P, p, b, bols) {
    const Tr = P.tronco(p), hc = Tr(P.HOMBRO_C), hl = Tr(P.HOMBRO);
    let c = { x: hc.x + b.cx, y: hc.y + b.cy }, l = { x: hl.x + b.lx, y: hl.y + b.ly };
    const bc = Tr(bols.c), bl = Tr(bols.l);
    c = mezcla(c, bc, (1 - clamp(b.cp * 1.5)) * (1 - b.cp)); l = mezcla(l, bl, (1 - clamp(b.lp * 1.5)) * (1 - b.lp));
    return { c, l, Tr };
  }
  const hacia = (P, p, q) => P.aHoja(p, q);                     // punto de pantalla → hoja del personaje

  // boquilla: quién la tiene y dónde está su punta (pantalla)
  const DIR_SOPLA = { g: Math.atan2(-0.78, -0.62), l: Math.atan2(-0.78, 0.62) };   // del puño a la boca
  function bocaPantalla(id, p) { const P = PJ[id].P; return P.aPantalla(p, P.boca(p)); }

  function poseLaura(t, pg) {
    const b = guion(GUION_L, CUERPOS_L, t, "bolsillos"), e = guion(GUION_CARA_L, CARAS_L, t, "inicio");
    const p = base("l", t, b, e, parpadeos(PARP_L, t));
    // pelo: se balancea al andar y al girar la cabeza; al soplar, quieto
    const vel = (uPelvis("l", t + 0.05) - uPelvis("l", t - 0.05)) / 0.1;
    p.pelo = { inercia: -clamp(vel / 500, -0.5, 0.6) + 0.25 * campana(t, T.lRes, T.lRes + 0.7) - 0.2 * campana(t, T.lGuina - 0.1, T.lGuina + 0.6), viento: 0 };
    p.rojo = 0.12 * tramo(t, T.lSopla0, T.lSopla0 + 0.4) * (1 - tramo(t, T.lRes, T.lRes + 0.4));
    p.cara.rubor = 0.25 * campana(t, T.lRes, T.lRes + 1.4);
    const { c, l } = manosBase(L, p, b, BOLS_L);
    let lm = l;
    // moneda a la ranura (la mete justo en T.lMete)
    const dm = dirDedos("l", { mu: b.lmu, ang: b.la });      // la moneda va en la pinza de los dedos
    const sobre = hacia(L, p, { x: MQ.ranura.x - dm.x * PZ_R + 4, y: MQ.ranura.y - 12 - dm.y * PZ_R });
    const dentro = hacia(L, p, { x: MQ.ranura.x - dm.x * PZ_R, y: MQ.ranura.y + 2 - dm.y * PZ_R });
    lm = mezcla(lm, sobre, tramo(t, T.lMete0, T.lMete - 0.12) * (1 - tramo(t, T.lMete + 0.05, T.lBoqCoge - 0.1)));
    lm = mezcla(lm, dentro, tramo(t, T.lMete - 0.14, T.lMete) * (1 - tramo(t, T.lMete + 0.02, T.lMete + 0.2)));
    // boquilla: la coge de su sitio, se la lleva a la boca y la vuelve a dejar
    const dock = hacia(L, p, MQ.boqBase), boca = bocaPantalla("l", p);
    const enBoca = hacia(L, p, { x: boca.x - Math.cos(DIR_SOPLA.l) * BOQ, y: boca.y - Math.sin(DIR_SOPLA.l) * BOQ });
    const wDock = tramo(t, T.lBoq0, T.lBoqCoge) * (1 - tramo(t, T.lBoqCoge + 0.02, T.lBoca)) + tramo(t, T.lDeja0, T.lDeja) * (1 - tramo(t, T.lDeja + 0.05, T.lDeja + 0.4));
    const wBoca = tramo(t, T.lBoqCoge + 0.02, T.lBoca) * (1 - tramo(t, T.lDeja0, T.lDeja));
    lm = mezcla(lm, dock, wDock); lm = mezcla(lm, enBoca, wBoca);
    // La boquilla describe un arco alto para evitar plegar el antebrazo por debajo de su radio mínimo.
    lm.y -= 80 * (Math.sin(Math.PI * fase(t, T.lBoqCoge + 0.02, T.lBoca)) + Math.sin(Math.PI * fase(t, T.lDeja0, T.lDeja)));
    // llaves: la mano va justo a la anilla que cuelga del bolsillo de Guillermo
    if (pg) {
      const anilla = pinzaG(pg), dk = dirDedos("l", { mu: b.lmu, ang: b.la });
      const obj = hacia(L, p, { x: anilla.x - dk.x * PZ_R, y: anilla.y - dk.y * PZ_R });
      const k = tramo(t, T.lCoge0, T.lCoge) * (1 - tramo(t, T.lCoge + 0.02, T.lSube));
      lm = mezcla(lm, obj, k);
    }
    p.manoCerca = { x: c.x, y: c.y, ang: b.ca, mu: b.cmu, dobla: -1, puno: b.cp, dedos: { pulgar: b.c0, indice: b.c1, medio: b.c2, anular: b.c3, menique: b.c4 } };
    p.manoLejos = { x: lm.x, y: lm.y, ang: b.la, mu: b.lmu, dobla: -1, puno: b.lp, dedos: { pulgar: b.l0, indice: b.l1, medio: b.l2, anular: b.l3, menique: b.l4 } };
    const m = p.manoLejos;
    // lo que lleva en la mano lejana
    if (t > T.lMoneda0 + 0.1 && t < T.lMete) {
      const d = dirDedos("l", m), fin = fase(t, T.lMete - 0.1, T.lMete);
      const sale = tramo(t, T.lMoneda0 + 0.12, T.lMoneda0 + 0.32);
      m.objeto = g => { g.save(); enPantalla(g, "l", m.ang); const r = 10.5; g.translate(d.x * r, d.y * r); g.scale(sale, sale);
        moneda(g, 0, 0, lerp(0.35, 1, tramo(t, T.lMoneda0, T.lMoneda1)) * (1 - fin * 0.85), Math.atan2(d.y, d.x) + Math.PI / 2); g.restore(); };
    } else if (t >= T.lBoqCoge && t < T.lDeja) {
      const a = boquillaAng("l", t);
      m.objeto = g => { g.save(); enPantalla(g, "l", m.ang); boquilla(g, 0, 0, a); g.restore(); };
    }
    return p;
  }
  function boquillaAng(id, t) {
    if (id === "l") return lerp(A_DOCK, DIR_SOPLA.l, tramo(t, T.lBoqCoge + 0.02, T.lBoca - 0.05)) + (lerp(DIR_SOPLA.l, A_DOCK, tramo(t, T.lDeja0 + 0.1, T.lDeja)) - DIR_SOPLA.l);
    return lerp(A_DOCK, DIR_SOPLA.g, tramo(t, T.gBoqCoge + 0.02, T.gBoca0 + 0.3));
  }
  const PZ_R = 10.5;                // del centro del puño de Laura a la pinza de sus dedos (px)
  // pinza de Guillermo: delante del puño, donde agarra la anilla
  function pinzaG(pg) { const m = pg.manoLejos, q = G.aPantalla(pg, { x: m.x, y: m.y }); return { x: q.x + 6, y: q.y - 9 }; }
  // Las llaves se dibujan en pantalla por encima de los dos: cuelgan del bolsillo, pasan a la mano de
  // Guillermo, Laura se las quita justo de su pinza y las hace girar en el índice.
  function llavesEn(t, pg, pl) {
    const bols = G.aPantalla(pg, G.tronco(pg)(LLAVE_G));
    if (t < T.lCoge) {
      const k = tramo(t, T.gSaca0 + 0.06, T.gSaca0 + 0.26);
      const q = k > 0 ? mezcla(bols, pinzaG(pg), k) : bols;
      const tint = tramo(t, T.gTintinea, T.gTintinea + 0.1) * (1 - tramo(t, T.lCoge0, T.lCoge0 + 0.15));
      return { x: q.x, y: q.y, giro: lerp(balanceoLlaves(t), 0.35 * Math.sin((t - T.gTintinea) * 15), tint), brillo: 0.7 * campana(t, T.gTintinea, T.gTintinea + 0.5) };
    }
    const m = pl.manoLejos, f = L.aPantalla(pl, { x: m.x, y: m.y }), d = dirDedos("l", m), pi = puntaIndice(m);
    const pinza = { x: f.x + d.x * PZ_R, y: f.y + d.y * PZ_R }, punta = { x: f.x + pi.x, y: f.y + pi.y };
    const gira = tramo(t, T.lGira0, T.lGira0 + 0.3);
    if (gira <= 0.001) return { x: pinza.x, y: pinza.y, giro: balanceoLlaves(T.lCoge) * (1 - tramo(t, T.lCoge, T.lGira0)) + 0.2 * Math.sin((t - T.lCoge) * 9) * Math.exp(-(t - T.lCoge) * 4), brillo: 0.8 * campana(t, T.lCoge, T.lCoge + 0.4) };
    // la anilla da vueltas alrededor de la punta del dedo y las llaves salen hacia fuera
    const w = (t - T.lGira0) * 12.5, a = Math.PI / 2 - w * gira;
    const c = mezcla(pinza, punta, gira);
    return { x: c.x + Math.cos(a) * 5 * gira, y: c.y + Math.sin(a) * 3 * gira, giro: a - Math.PI / 2, brillo: 0.6 * campana(t, T.lGuina, T.lGuina + 0.5) };
  }

  function poseGuillermo(t) {
    const b = guion(GUION_G, CUERPOS_G, t, "bolsillos"), e = guion(GUION_CARA_G, CARAS_G, t, "inicio");
    const p = base("g", t, b, e, parpadeos(PARP_G, t));
    // soplando: tiembla del esfuerzo y se pone rojo
    const esf = tramo(t, T.gSopla0, T.gSopla0 + 0.3) * (1 - tramo(t, T.gSopla1 - 0.15, T.gSopla1 + 0.1));
    p.torso += 0.012 * ruido(t * 30) * esf; p.cabeza.ang += 0.02 * ruido(t * 34 + 5) * esf;
    p.rojo = 0.75 * tramo(t, T.gSopla0 + 0.1, T.gSopla0 + 0.9) * (1 - tramo(t, T.gSopla1, T.gSopla1 + 0.7));
    p.cara.rubor = p.rojo * 0.8;
    p.sudor = tramo(t, T.gSopla0 + 0.4, T.gSopla0 + 0.8) * (1 - tramo(t, T.gSopla1 + 0.2, T.gSopla1 + 0.8));
    // rueda los hombros al acercarse, chulito
    p.torso += 0.05 * Math.sin((t - T.gPaso0) * 9) * campana(t, T.gPaso0, T.gPaso1 + 0.1);
    // puchero: patadita al suelo y cabeza gacha
    p.cabeza.ang += 0.05 * campana(t, T.gPuchero0 + 0.5, T.gPuchero0 + 1.1);
    const { c, l } = manosBase(G, p, b, BOLS_G);
    let lm = l;
    const dock = hacia(G, p, MQ.boqBase), boca = bocaPantalla("g", p);
    const lejos = { x: boca.x - Math.cos(DIR_SOPLA.g) * (BOQ + 26), y: boca.y - Math.sin(DIR_SOPLA.g) * (BOQ + 26) };
    const pegada = { x: boca.x - Math.cos(DIR_SOPLA.g) * BOQ, y: boca.y - Math.sin(DIR_SOPLA.g) * BOQ };
    const objBoca = hacia(G, p, mezcla(lejos, pegada, tramo(t, T.gInspira1 - 0.02, T.gSopla0)));
    lm = mezcla(lm, dock, tramo(t, T.gBoq0, T.gBoqCoge) * (1 - tramo(t, T.gBoqCoge + 0.02, T.gBoca0 + 0.3)));
    lm = mezcla(lm, objBoca, tramo(t, T.gBoqCoge + 0.02, T.gBoca0 + 0.3) * (1 - tramo(t, T.gSuelta + 0.02, T.gSuelta + 0.3)));
    // tintineo de las llaves: la mano se queda quieta justo cuando Laura las pinza
    const tin = tramo(t, T.gTintinea, T.gTintinea + 0.1) * (1 - tramo(t, T.lCoge0 - 0.05, T.lCoge0 + 0.1));
    lm = { x: lm.x + 5 * Math.sin((t - T.gTintinea) * 15) * tin, y: lm.y - 6 * Math.abs(Math.sin((t - T.gTintinea) * 15)) * tin };
    p.manoCerca = { x: c.x, y: c.y, ang: b.ca, mu: b.cmu, dobla: -1, puno: b.cp, pulgar: b.cpu };
    p.manoLejos = { x: lm.x, y: lm.y, ang: b.la, mu: b.lmu, dobla: -1, puno: b.lp, pulgar: b.lpu };
    const m = p.manoLejos;
    if (t > T.gMoneda0 + 0.1 && t < T.gLanza) { const sale = tramo(t, T.gMoneda0 + 0.1, T.gMoneda0 + 0.3);
      m.objeto = g => { g.save(); enPantalla(g, "g", m.ang); g.translate(-3, -11); g.scale(sale, sale); moneda(g, 0, 0, 1, 0.2); g.restore(); }; }
    else if (t >= T.gBoqCoge && t < T.gSuelta) { const a = boquillaAng("g", t); m.objeto = g => { g.save(); enPantalla(g, "g", m.ang); boquilla(g, 0, 0, a); g.restore(); }; }
    // puchero: labio de abajo para fuera
    const pu = tramo(t, T.gPuchero0 + 0.1, T.gPuchero0 + 0.5);
    if (pu > 0.01) p.capaCabeza = g => {
      const tiembla = 1.5 * Math.sin(t * 31) * pu;
      g.save(); g.translate(808, 758 + tiembla); g.rotate(0.26); g.scale(pu, pu);
      g.fillStyle = "#e07d6c"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 6;
      g.beginPath(); g.moveTo(-34, -6); g.bezierCurveTo(-24, 30, 26, 30, 36, -8); g.quadraticCurveTo(2, 6, -34, -6); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.ellipse(6, 10, 11, 3.5, 0, 0, Math.PI * 2); g.fill();
      g.restore();
    };
    return p;
  }

  function pose(t) { const g = poseGuillermo(t); return { g, l: poseLaura(t, g) }; }

  /* ---------- efectos ---------- */
  function tintineo(g, t, t0, q) {
    const k = fase(t, t0, t0 + 0.32); if (k <= 0 || k >= 1) return;
    g.save(); g.strokeStyle = `rgba(255,250,200,${1 - k})`; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.45, r0 = 12 + 16 * k; g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * (r0 + 8), q.y + Math.sin(a) * (r0 + 8)); g.stroke(); }
    g.restore();
  }
  function estrellaPuntas(g, x, y, r, puntas, rot, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function destellos(g, t) {          // estrellitas verdes de «bien» alrededor de la esfera
    const k = fase(t, T.lRes, T.lRes + 0.9); if (k <= 0 || k >= 1) return;
    const ef = MQ.esfera; g.save();
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (i - 2.5) * 0.5, r = ef.r + 22 + 30 * salida(k), s = 6 * Math.sin(Math.PI * k) * (0.7 + 0.3 * hash(i + 3));
      estrellaPuntas(g, ef.x + Math.cos(a) * r, ef.y + Math.sin(a) * r * 0.9 - 30 * k, s, 4, t * 3 + i, 0.4);
      g.fillStyle = i % 2 ? "#b8ffcc" : "#fff6b0"; g.fill(); g.lineWidth = 1.2; g.strokeStyle = "#0b0a0e"; g.stroke();
    }
    g.restore();
  }
  function aliento(g, t, q, dir, fuerza, t0, t1) {     // rayitas de aire que salen de la boquilla
    const k = tramo(t, t0, t0 + 0.15) * (1 - tramo(t, t1 - 0.15, t1)); if (k <= 0.01) return;
    g.save(); g.lineCap = "round"; g.strokeStyle = "rgba(230,245,255,0.9)";
    for (let i = 0; i < 3; i++) {
      const ph = ((t - t0) * 2.6 * fuerza + i / 3) % 1, r0 = 8 + ph * 40 * fuerza, ab = (i - 1) * 0.35;
      const a = dir + ab; g.globalAlpha = k * Math.sin(Math.PI * ph); g.lineWidth = 2;
      g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * (r0 + 10 * fuerza), q.y + Math.sin(a) * (r0 + 10 * fuerza)); g.stroke();
    }
    g.restore();
  }
  function humo(g, t) {
    if (t < T.rebosa - 0.1) return;
    const fuerza = tramo(t, T.rebosa - 0.1, T.rebosa + 0.3) * (1 - 0.55 * tramo(t, T.gSuelta + 0.5, T.gSuelta + 2.5));
    g.save();
    for (let i = 0; i < 9; i++) {
      const ph = ((t - T.rebosa) * 0.5 + i / 9) % 1, lado = i % 2 ? 1 : -1;
      const x = MX + lado * (40 + hash(i + 70) * 20) + Math.sin(t * 1.4 + i) * 8 + lado * ph * 20, y = MQ.y0 - 8 - ph * 150;
      g.globalAlpha = Math.sin(Math.PI * ph) * 0.42 * fuerza; g.fillStyle = i % 3 ? "#b9b4ae" : "#8f8a86";
      g.beginPath(); g.arc(x, y, 9 + 22 * ph, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  function hacesSirena(g, t) {        // luz roja que barre la pared (detrás de todo, encima del fondo)
    const s = sirena(t); if (s <= 0.01) return;
    const a = giroSirena(t), yb = MQ.y0 - 4 - 30 * s, x = MQ.sir;
    g.save(); g.globalCompositeOperation = "lighter";
    for (const desfase of [0, Math.PI]) {
      const ang = a + desfase, frente = Math.cos(ang);             // hacia los lados según gira
      const dirx = Math.sin(ang), larga = 460 * Math.abs(dirx), alfa = 0.13 * clamp(s) * Math.abs(dirx);
      if (larga < 5) continue;
      const gr = g.createLinearGradient(x, yb, x + dirx * larga, yb); gr.addColorStop(0, `rgba(255,40,30,${alfa})`); gr.addColorStop(1, "rgba(255,40,30,0)");
      g.fillStyle = gr; g.beginPath(); g.moveTo(x, yb - 4); g.lineTo(x + dirx * larga, yb - 46 - 10 * frente); g.lineTo(x + dirx * larga, yb + 46 + 10 * frente); g.lineTo(x, yb + 4); g.closePath(); g.fill();
    }
    const brillo = 0.12 * clamp(s) * (0.6 + 0.4 * Math.sin(a * 2));
    const halo = g.createRadialGradient(x, yb, 4, x, yb, 260); halo.addColorStop(0, `rgba(255,50,40,${brillo})`); halo.addColorStop(1, "rgba(255,50,40,0)");
    g.fillStyle = halo; g.fillRect(x - 260, yb - 260, 520, 520);
    g.restore();
  }
  function monedaEn(t) {
    if (t < T.gLanza || t >= T.gEncaja) return null;
    const p = poseGuillermo(T.gLanza), m = G.aPantalla(p, p.manoLejos);
    const k = fase(t, T.gLanza, T.gEncaja), giro = (t - T.gLanza) * 28;
    return { x: lerp(m.x - 3, MQ.ranura.x, k), y: lerp(m.y - 11, MQ.ranura.y - 4, k) - 95 * Math.sin(Math.PI * k),
      ancho: (0.15 + 0.85 * Math.abs(Math.cos(giro))) * (1 - 0.8 * tramo(t, T.gEncaja - 0.06, T.gEncaja)), a: 0.2 * (1 - k) };
  }
  function boquillaEn(t, poses = pose(t)) {
    let id = null;
    if (t >= T.lBoqCoge && t < T.lDeja) id = "l";
    else if (t >= T.gBoqCoge && t < T.gSuelta) id = "g";
    if (id) { const p = poses[id], q = PJ[id].P.aPantalla(p, p.manoLejos); return { ...q, a: boquillaAng(id, t), id }; }
    const sh = temblorMaquina(t), dock = { x: MQ.boqBase.x + sh.x, y: MQ.boqBase.y + sh.y, a: A_DOCK, dock: true };
    if (t >= T.gSuelta && t < T.gVuelve) {
      const p = poseGuillermo(T.gSuelta), q = G.aPantalla(p, p.manoLejos), k = M2.rebote(fase(t, T.gSuelta, T.gVuelve), 1.2);
      return { x: lerp(q.x, dock.x, k), y: lerp(q.y, dock.y, k) - 30 * Math.sin(Math.PI * clamp(k)), a: lerp(boquillaAng("g", T.gSuelta), A_DOCK, clamp(k)) };
    }
    return dock;
  }

  /* ---------- decorado: rincón de bar con boiserie, perchero, reloj y lámparas ---------- */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60);
    const pared = g.createLinearGradient(0, -60, 0, 400); pared.addColorStop(0, "#3d3216"); pared.addColorStop(1, "#7a6327");
    g.fillStyle = pared; g.fillRect(-40, -60, W + 80, 470);
    // papel pintado: rombos suaves
    g.strokeStyle = "rgba(255,226,150,0.06)"; g.lineWidth = 1.2;
    for (let x = -60; x < W + 60; x += 46) { g.beginPath(); g.moveTo(x, -60); g.lineTo(x + 230, 400); g.stroke(); g.beginPath(); g.moveTo(x + 230, -60); g.lineTo(x, 400); g.stroke(); }
    g.fillStyle = "rgba(255,226,150,0.07)";
    for (let y = -40; y < 400; y += 46) for (let x = -40 + ((y / 46) % 2 ? 23 : 0); x < W + 40; x += 46) { g.beginPath(); g.arc(x, y, 2.2, 0, Math.PI * 2); g.fill(); }
    // luz cálida de las lámparas sobre la pared
    for (const lx of [250, 830]) {
      const h = g.createRadialGradient(lx, 120, 10, lx, 140, 330); h.addColorStop(0, "rgba(255,214,140,0.42)"); h.addColorStop(1, "rgba(255,200,120,0)");
      g.fillStyle = h; g.fillRect(lx - 340, -60, 680, 470);
    }
    // reloj de pared (solo rayitas, sin números)
    g.save(); g.translate(92, 92);
    g.fillStyle = "#2a1c0c"; g.beginPath(); g.arc(0, 0, 40, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#f6efdc"; g.beginPath(); g.arc(0, 0, 33, 0, Math.PI * 2); g.fill(); g.lineWidth = 3; g.strokeStyle = "#0b0a0e"; g.stroke();
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.lineWidth = i % 3 ? 1.5 : 3; g.beginPath(); g.moveTo(Math.cos(a) * 24, Math.sin(a) * 24); g.lineTo(Math.cos(a) * 30, Math.sin(a) * 30); g.stroke(); }
    g.lineCap = "round"; g.lineWidth = 3.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(-2.2) * 16, Math.sin(-2.2) * 16); g.stroke();
    g.lineWidth = 2.2; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(-0.5) * 25, Math.sin(-0.5) * 25); g.stroke();
    g.restore();
    // cuadros: una copa y un paisaje (sin letras)
    const cuadro = (x, y, w, h, dib) => { g.save(); g.fillStyle = "#2d1a0b"; g.fillRect(x - 7, y - 7, w + 14, h + 14); g.lineWidth = 2.5; g.strokeStyle = "#0b0a0e"; g.strokeRect(x - 7, y - 7, w + 14, h + 14);
      g.fillStyle = "#e9dcc0"; g.fillRect(x, y, w, h); g.strokeRect(x, y, w, h); g.beginPath(); g.rect(x, y, w, h); g.clip(); dib(x, y, w, h); g.restore(); };
    cuadro(885, 40, 70, 92, (x, y, w, h) => {
      g.fillStyle = "#c94a3a"; g.fillRect(x, y, w, h);
      g.fillStyle = "#f4e6c8"; g.beginPath(); g.moveTo(x + 17, y + 22); g.lineTo(x + 53, y + 22); g.lineTo(x + 35, y + 48); g.closePath(); g.fill();
      g.fillRect(x + 33.5, y + 48, 3, 22); g.fillRect(x + 24, y + 70, 22, 3);
      g.fillStyle = "#86c34a"; g.beginPath(); g.arc(x + 43, y + 24, 5, 0, Math.PI * 2); g.fill();
    });
    cuadro(700, 66, 92, 62, (x, y, w, h) => {
      g.fillStyle = "#9ad0e6"; g.fillRect(x, y, w, h);
      g.fillStyle = "#4f7f45"; g.beginPath(); g.moveTo(x, y + h); g.lineTo(x + 30, y + 26); g.lineTo(x + 52, y + 44); g.lineTo(x + 70, y + 20); g.lineTo(x + w, y + 40); g.lineTo(x + w, y + h); g.closePath(); g.fill();
      g.fillStyle = "#fff4c2"; g.beginPath(); g.arc(x + 74, y + 13, 7, 0, Math.PI * 2); g.fill();
    });
    // boiserie de madera oscura
    const mad = g.createLinearGradient(0, 380, 0, SUELO); mad.addColorStop(0, "#3b2412"); mad.addColorStop(1, "#24150a");
    g.fillStyle = mad; g.fillRect(-40, 380, W + 80, SUELO - 380);
    g.fillStyle = "#5b3a1c"; g.fillRect(-40, 372, W + 80, 12); g.fillStyle = "#7b5229"; g.fillRect(-40, 372, W + 80, 3);
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(-40, 384, W + 80, 5);
    for (let x = -10; x < W + 40; x += 118) {
      g.strokeStyle = "rgba(0,0,0,0.45)"; g.lineWidth = 2.5; g.strokeRect(x + 10, 402, 96, SUELO - 420);
      g.strokeStyle = "rgba(255,200,140,0.1)"; g.lineWidth = 1.5; g.strokeRect(x + 14, 406, 88, SUELO - 428);
    }
    // perchero con chaqueta y bufanda (izquierda)
    g.save(); g.translate(150, 0); g.lineCap = "round"; g.lineJoin = "round";
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 11; g.beginPath(); g.moveTo(0, 150); g.lineTo(0, SUELO - 4); g.stroke();
    g.strokeStyle = "#5d3a1d"; g.lineWidth = 6; g.stroke();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 7; g.beginPath(); g.moveTo(-30, SUELO - 2); g.lineTo(0, SUELO - 22); g.lineTo(30, SUELO - 2); g.stroke();
    g.strokeStyle = "#5d3a1d"; g.lineWidth = 3.5; g.stroke();
    g.fillStyle = "#2f4f7a"; g.beginPath(); g.moveTo(-6, 160); g.quadraticCurveTo(-46, 190, -42, 300); g.lineTo(-10, 312); g.quadraticCurveTo(0, 230, 8, 168); g.closePath(); g.fill(); g.lineWidth = 3; g.strokeStyle = "#0b0a0e"; g.stroke();
    g.fillStyle = "#c2412f"; g.beginPath(); g.moveTo(4, 158); g.quadraticCurveTo(26, 200, 18, 262); g.lineTo(30, 262); g.quadraticCurveTo(38, 200, 14, 156); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#0b0a0e"; g.beginPath(); g.arc(0, 146, 7, 0, Math.PI * 2); g.fill();
    g.restore();
    // suelo de tablas
    const su = g.createLinearGradient(0, SUELO, 0, H + 60); su.addColorStop(0, "#5e3a1e"); su.addColorStop(1, "#2a170b");
    g.fillStyle = su; g.fillRect(-40, SUELO, W + 80, H + 60 - SUELO);
    g.strokeStyle = "rgba(0,0,0,0.28)"; g.lineWidth = 2;
    for (let i = 0; i < 4; i++) { const y = SUELO + 9 + i * i * 8 + i * 6; g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); }
    for (let x = -60; x < W + 80; x += 90) { g.beginPath(); g.moveTo(x, SUELO); g.lineTo(x + (x - 512) * 0.35, H + 60); g.stroke(); }
    g.fillStyle = "rgba(255,210,150,0.16)"; g.fillRect(-40, SUELO, W + 80, 2);
    // lámparas colgantes
    for (const lx of [250, 830]) {
      g.strokeStyle = "#0a0a0c"; g.lineWidth = 3; g.beginPath(); g.moveTo(lx, -60); g.lineTo(lx, 22); g.stroke();
      g.fillStyle = "#1d3a2a"; g.beginPath(); g.moveTo(lx - 30, 50); g.quadraticCurveTo(lx, 10, lx + 30, 50); g.closePath(); g.fill(); g.lineWidth = 2.5; g.strokeStyle = "#0b0a0e"; g.stroke();
      g.fillStyle = "#ffe6ad"; g.beginPath(); g.ellipse(lx, 50, 24, 6, 0, 0, Math.PI * 2); g.fill();
    }
    const v = g.createRadialGradient(512, 300, 320, 512, 300, 700); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.5)");
    g.fillStyle = v; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const tension = tramo(t, T.gInspira0, T.gSopla0 + 0.4) * (1 - tramo(t, T.gSuelta + 0.2, T.lCamina0 + 0.3));
    const fin = tramo(t, T.gPuchero0, T.fin, suave);
    return { k: 1 + 0.06 * tension + 0.05 * fin, x: 512 + 10 * tension - 40 * fin, y: 300 - 6 * tension + 12 * fin };
  }

  class GuillermoLauraAlcoholimetro extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !L.listo()) return;
      if (!fondo) fondo = creaFondo();
      const { g: pg, l: pl } = pose(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = (t >= T.rebosa ? 3.5 * Math.exp(-(t - T.rebosa) * 5) * tramo(t, T.rebosa, T.rebosa + 0.035) : 0) + 1.2 * tramo(t, T.alarma, T.alarma + 0.2) * (1 - tramo(t, T.gSuelta, T.gSuelta + 0.6));
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 40) * tb, ruido(t * 40 + 11) * tb * 0.6);
      g.drawImage(fondo, -40, -60);
      hacesSirena(g, t);
      // sombras
      g.save(); g.fillStyle = "rgba(0,0,0,0.36)";
      g.beginPath(); g.ellipse(pg.x + 8, SUELO + 2, 100, 9, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pl.x - 6, SUELO + 2, 86, 8, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(MX + 6, SUELO + 2, 80, 9, 0, 0, Math.PI * 2); g.fill(); g.restore();
      // boquilla: en la mano de alguien, en su sitio o volviendo sola
      const bo = boquillaEn(t, { g: pg, l: pl });
      const sh = maquina(g, t, { boqLibre: bo.id ? null : bo });
      cable(g, { x: MQ.ancla.x + sh.x, y: MQ.ancla.y + sh.y }, finBoquilla(bo.x, bo.y, bo.a), t);
      humo(g, t);
      destellos(g, t);
      G.dibujar(g, pg, t);
      const mon = monedaEn(t); if (mon) moneda(g, mon.x, mon.y, mon.ancho, mon.a);
      L.dibujar(g, pl, t);
      const ll = llavesEn(t, pg, pl);
      g.save(); g.translate(ll.x, ll.y); llaves(g, ll.giro, ll.brillo); g.restore();
      tintineo(g, t, T.lMete, MQ.ranura); tintineo(g, t, T.gEncaja, MQ.ranura);
      // aire al soplar
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00012.2", nombre: "Guillermo y Laura · El alcoholímetro", crear: () => new GuillermoLauraAlcoholimetro() });
  window.__A2D_00012_2 = { pose, T, DUR, PASOS, MQ, SUELO, camara, boquillaEn, finBoquilla, BOQ, bocaPantalla, monedaEn, llavesEn, pinzaG, puntaIndice, valor, estado, aguja, pie, PJ };
})();
