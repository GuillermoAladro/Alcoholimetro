"use strict";
/* 00009.2 · Guillermo y la línea recta
 *
 * Negro → de noche, en la calle, delante del bar: una línea blanca pintada en el asfalto bajo
 * la farola. Guillermo llega andando desde la izquierda con las manos en los bolsillos y se para
 * al empezar la línea → la mira, se pone serio, saca las manos y las sacude, coge aire (se le
 * hinchan los mofletes) y lo suelta con vaho → abre los brazos en cruz como un funambulista y
 * camina por la línea talón con punta, con la lengua fuera: se tambalea, corrige de más y cada
 * vez se balancea más; en un paso se queda con el pie en el aire dudando → se queda a la pata
 * coja, casi se cae de espaldas (brazos como aspas), se recupera y resopla → prueba del dedo en
 * la nariz: cierra los ojos, saca el índice, trae el brazo… y se mete el dedo en el ojo: se lo
 * frota y se le escapa una lágrima → como si hubiera aprobado, hace una reverencia orgullosa y
 * mira a cámara muy chulo → da un paso, resbala en la propia línea, vuela con los pies por
 * delante, cae de culo y sale deslizándose por la derecha con cara de circunstancias → se oye
 * (se ve) el golpe fuera de plano y vuelve botando una zapatilla → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`: mismo instante, mismo fotograma.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo;
  const PZ = G.A.datos.piezas;
  const S = 0.31, SUELO = 548, X0 = -175, XA = 250;
  const DUR = 14.0;
  const T = {
    entra0: 0.12, mira0: 2.0, para: 2.35,
    sacude0: 2.45, sacude1: 3.1, aire0: 3.1, aire1: 3.5, sopla1: 3.85,
    cruz0: 3.75, cruz1: 4.15, linea0: 4.2, duda: 5.75, linea1: 7.15,
    pata0: 7.25, pata1: 7.55, casi: 7.95, recupera: 8.3, pataBaja: 8.6,
    dedo0: 8.7, dedoSale: 8.85, dedo1: 9.05, pincha: 9.5, tapa: 9.62, quita: 10.1,
    rev0: 10.45, rev1: 10.8, levanta: 11.05, camara: 11.2,
    paso: 11.6, resbala: 11.85, aire: 12.06, culo: 12.26,
    choque: 13.0, zapato: 13.03, fin: 13.52
  };

  /* ---------- llegada: trayectoria de la pelvis (px de pantalla) ---------- */
  const FRENO = 0.85;
  const V = (XA - X0) / ((T.para - T.entra0) - FRENO / 2);
  function posX(t) {
    if (t < T.para - FRENO) return X0 + V * (t - T.entra0);
    if (t < T.para) { const u = t - (T.para - FRENO); return X0 + V * (T.para - FRENO - T.entra0) + V * u - V * u * u / (2 * FRENO); }
    return XA;
  }
  function velX(t) { if (t < T.para - FRENO) return V; if (t < T.para) return V * (1 - (t - (T.para - FRENO)) / FRENO); return 0; }
  function tiempoEn(x, t0, t1) { let lo = t0, hi = t1; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (posX(m) < x) lo = m; else hi = m; } return (lo + hi) / 2; }

  /* ---------- pisadas: cada paso es [despega, apoya, x de pantalla del tobillo, altura, tipo] ---------- */
  const PASO = 320 * S, ADELANTO = 150 * S;
  const LAT = { cerca: -44 * S, lejos: 44 * S }, REPOSO = { cerca: -50 * S, lejos: 50 * S };
  const PIE = 58;                                              // talón con punta: un pie de largo
  const PASOS = { cerca: [], lejos: [] };
  (function planifica() {
    const marcas = { cerca: [{ t: -10, x: X0 + REPOSO.cerca + 40 * S }], lejos: [{ t: -10, x: X0 + REPOSO.lejos - 120 * S }] };
    let pie = "lejos", linea = X0 + 60 * S;
    for (let k = 0; k < 60; k++) {
      linea += PASO;
      const x = linea + LAT[pie];
      if (x > XA + REPOSO[pie] - PASO * 0.45) break;
      marcas[pie].push({ t: tiempoEn(linea - ADELANTO, -1, T.para), x });
      pie = pie === "cerca" ? "lejos" : "cerca";
    }
    const ultimo = Math.max(marcas.cerca.at(-1).t, marcas.lejos.at(-1).t), otro = pie === "cerca" ? "lejos" : "cerca";
    const t1 = Math.max(ultimo + 0.38, Math.min(T.para - 0.1, tiempoEn(XA + REPOSO[pie] - ADELANTO * 0.6 - LAT[pie], -1, T.para)));
    marcas[pie].push({ t: t1, x: XA + REPOSO[pie] });
    marcas[otro].push({ t: Math.max(t1 + 0.32, T.para + 0.06), x: XA + REPOSO[otro] });
    for (const lado of ["cerca", "lejos"]) {
      const L = marcas[lado];
      PASOS[lado].push({ t0: -11, t1: -10, x: L[0].x, h: 0, a0: 0, a1: 0 });
      for (let i = 1; i < L.length; i++) {
        const vuelo = clamp((L[i].t - L[i - 1].t) * 0.4, 0.22, 0.36);
        PASOS[lado].push({ t0: L[i].t - vuelo, t1: L[i].t, x: L[i].x, h: 78 * clamp(Math.abs(L[i].x - L[i - 1].x) / PASO, 0.3, 1.1), a0: 0.4, a1: -0.26 });
      }
    }
    // por la línea, talón con punta
    const L1 = (t0, t1, x, extra) => Object.assign({ t0, t1, x, h: 42, a0: 0.22, a1: -0.16 }, extra || {});
    PASOS.cerca.push(L1(4.22, 4.62, XA + 45), L1(5.22, 5.62, XA + 45 + 2 * PIE), L1(6.45, 6.8, XA + 45 + 4 * PIE));
    PASOS.lejos.push(L1(4.72, 5.12, XA + 45 + PIE), L1(T.duda, 6.35, XA + 45 + 3 * PIE, { h: 64, duda: true }), L1(6.86, 7.15, XA + 45 + 5 * PIE));
    // baja el pie de la pata coja junto al otro, y el paso en el que resbala
    PASOS.cerca.push({ t0: T.pataBaja - 0.3, t1: T.pataBaja, x: XA + 300, h: 0, a0: 0, a1: 0 });
    PASOS.cerca.push({ t0: T.paso, t1: T.resbala, x: XA + 392, h: 40, a0: 0.3, a1: -0.26 });
  })();
  const TOB_Y = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  function pie(lado, t) {
    const L = PASOS[lado];
    let i = 0; while (i + 1 < L.length && L[i + 1].t0 <= t) i++;
    const s = L[i], ant = i > 0 ? L[i - 1] : s, sig = L[i + 1];
    let x, y = 0, ang = 0, arco = 0;
    if (t < s.t1 && i > 0) {                      // en el aire
      let u = fase(t, s.t0, s.t1), ux, uy;
      if (s.duda) {                               // se queda con el pie en el aire, dudando
        ux = 0.42 * suave(fase(u, 0, 0.3)) + 0.58 * suave5(fase(u, 0.72, 1));
        uy = suave(fase(u, 0, 0.25)) * (1 - suave(fase(u, 0.78, 1)));
        ux += 0.05 * Math.sin(fase(u, 0.25, 0.75) * Math.PI * 4) * campana(u, 0.25, 0.75);
        arco = uy;
      } else { ux = suave5(u); uy = Math.pow(Math.sin(Math.PI * u), 0.9); arco = Math.sin(Math.PI * u); }
      x = lerp(ant.x, s.x, ux); y = -s.h * uy;
      ang = lerp(s.a0, s.a1, suave(u));
    } else {
      x = s.x;
      const k1 = fase(t, s.t1, s.t1 + 0.12);
      ang = s.a1 * (1 - suave(k1));
      if (sig) ang += sig.a0 * suave(fase(t, sig.t0 - 0.17, sig.t0));
    }
    return { x, y, ang, arco };
  }
  // tobillo en la hoja (relativo a la pelvis de pantalla xp); el pie gira sobre la punta o el talón
  function tobillo(lado, f, xp) {
    let tob = { x: G.PELVIS.x + (f.x - xp) / S, y: TOB_Y[lado] + f.y }, ang = f.ang;
    if (ang > 0) { const pv = { x: tob.x + G.PUNTA.x, y: tob.y + G.PUNTA.y }, r = G.rotP({ x: -G.PUNTA.x, y: -G.PUNTA.y }, ang); tob = { x: pv.x + r.x, y: pv.y + r.y }; }
    else if (ang < 0) { const pv = { x: tob.x + G.TALON.x, y: tob.y + G.TALON.y }, r = G.rotP({ x: -G.TALON.x, y: -G.TALON.y }, ang); tob = { x: pv.x + r.x, y: pv.y + r.y }; }
    return { tob, ang };
  }

  /* ---------- equilibrio ---------- */
  const campana2 = (t, a, b) => { const k = campana(t, a, b); return k * k; };
  // inclinación del cuerpo: crece por la línea; tirones al corregir de más
  function vaiven(t) {
    const kL = tramo(t, T.linea0 - 0.1, T.linea0 + 0.7) * (1 - tramo(t, T.pataBaja - 0.1, T.pataBaja + 0.45));
    const amp = lerp(0.03, 0.085, tramo(t, T.linea0, T.linea1)) + 0.04 * tramo(t, T.pata0, T.pata1) * (1 - tramo(t, T.recupera, T.pataBaja));
    let s = amp * (0.62 * Math.sin(t * 5.4) + 0.38 * Math.sin(t * 9.1 + 1.3)) * kL;
    for (const [tc, a] of [[5.3, 0.085], [5.62, -0.12], [6.5, 0.11], [6.86, -0.14], [7.32, 0.12]]) s += a * campana2(t, tc, tc + 0.4);
    return s;
  }
  // casi se cae de espaldas a la pata coja: se va hacia atrás, rebota hacia delante y se asienta
  const casiCae = t => {
    const va = suave(fase(t, T.casi - 0.18, T.casi + 0.12)), vuelve = suave5(fase(t, T.casi + 0.22, T.recupera + 0.18));
    return va * (1 - vuelve) - 0.22 * campana2(t, T.recupera - 0.05, T.recupera + 0.45);
  };
  // la pata coja: peso del pie levantado
  const pataCoja = t => tramo(t, T.pata0, T.pata1) * (1 - tramo(t, T.pataBaja - 0.3, T.pataBaja));

  /* ---------- posturas del cuerpo (se mezclan en orden) ---------- */
  // Manos respecto a su hombro (hoja). Ángulo de la mano = hacia dónde apuntan los dedos; v: lado
  // del pulgar (1 arriba, −1 abajo: la mano gira sobre su eje); ab: abierta; p: visible (0 en el bolsillo).
  const P0 = { dx: 0, pel: 0, torso: 0, cab: 0, cx: 49, cy: 340, ca: 1.39, cv: 1, cab_: 0, cp: 0, lx: 0, ly: 300, la: 1.39, lv: 1, lab: 0, lp: 0 };
  const C_ = o => Object.assign({}, P0, o);
  const CUELGA = { cx: -22, cy: 296, ca: 1.62, cv: 1, cab_: 0.75, cp: 1, lx: 22, ly: 282, la: 1.5, lv: 1, lab: 0.75, lp: 1 };
  const CUERPOS = {
    bolsillos: C_({}),
    cuelga: C_(CUELGA),
    inspira: C_(Object.assign({}, CUELGA, { pel: -8, torso: -0.04, cab: -0.07, cy: 268, ly: 256 })),
    sopla: C_(Object.assign({}, CUELGA, { pel: 6, torso: 0.03, cab: 0.03, cy: 300, ly: 286 })),
    cruz: C_({ pel: 16, cx: -352, cy: 30, ca: 3.05, cv: -1, cab_: 1, cp: 1, lx: 306, ly: -44, la: -0.12, lv: 1, lab: 1, lp: 1 }),
    pata: C_({ pel: 4, torso: -0.02, cx: -340, cy: -14, ca: 3.15, cv: -1, cab_: 1, cp: 1, lx: 296, ly: -80, la: -0.24, lv: 1, lab: 1, lp: 1 }),
    alivio: C_({ pel: 14, torso: 0.04, cab: 0.06, cx: -300, cy: 120, ca: 2.75, cv: -1, cab_: 0.9, cp: 1, lx: 270, ly: 60, la: 0.25, lv: 1, lab: 0.9, lp: 1 }),
    dedo: C_({ pel: 6, cx: -18, cy: 296, ca: 1.6, cv: 1, cab_: 0.3, cp: 1, lx: 300, ly: -22, la: -0.06, lv: 1, lab: 0, lp: 1 }),
    reverencia: C_({ dx: -12, pel: 34, torso: 0.46, cab: 0.26, cx: 140, cy: 210, ca: 0.15, cv: 1, cab_: 1, cp: 1, lx: 205, ly: 205, la: 0.95, lv: 1, lab: 1, lp: 1 }),
    trasDedo: C_(Object.assign({}, CUELGA, { pel: 6, cab_: 0.3 })),
    orgullo: C_({ pel: -6, torso: -0.05, cab: -0.07, cx: -26, cy: 292, ca: 1.65, cv: 1, cab_: 0.6, cp: 1, lx: 26, ly: 278, la: 1.48, lv: 1, lab: 0.6, lp: 1 }),
    aire: C_({ pel: -110, torso: -1.2, cab: -0.2, cx: -210, cy: -170, ca: -2.4, cv: 1, cab_: 1, cp: 1, lx: 190, ly: -230, la: -1.0, lv: 1, lab: 1, lp: 1 }),
    sentado: C_({ pel: 556, torso: -0.24, cab: 0.08, cx: -70, cy: -300, ca: -1.75, cv: 1, cab_: 1, cp: 1, lx: 70, ly: -310, la: -1.4, lv: 1, lab: 1, lp: 1 })
  };
  const GUION_CUERPO = [
    [T.sacude0 - 0.05, T.sacude0 + 0.25, "cuelga"], [T.aire0, T.aire1, "inspira"], [T.aire1, T.sopla1, "sopla"],
    [T.cruz0, T.cruz1, "cruz", k => suave5(k)], [T.pata0 - 0.1, T.pata1, "pata"], [T.recupera, T.pataBaja + 0.1, "alivio"],
    [T.dedo0 - 0.05, T.dedo0 + 0.3, "dedo"], [T.quita - 0.05, T.quita + 0.35, "trasDedo"], [T.rev0, T.rev1, "reverencia", suave5], [T.levanta, T.levanta + 0.3, "orgullo"],
    [T.resbala, T.aire, "aire", suave], [T.aire, T.culo, "sentado", entrada]
  ];
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function postura(t) {
    let c = CUERPOS.bolsillos;
    for (const [t0, t1, nom, f] of GUION_CUERPO) { if (t <= t0) break; c = mezclaE(c, CUERPOS[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, mof: 0, rub: 0, sud: 0, punta: 0 };
  const E = o => Object.assign({}, BASE, o);
  const CARAS = {
    anda: E({}),
    mira: E({ mx: 0.7, my: 0.85, sd: 6, gd: 0.05, si: 6, gi: 0.05, orig: 0, sonr: 0.05, ancho: 0.8 }),
    serio: E({ mx: 0.8, my: 0.45, sd: -10, gd: -0.22, si: -10, gi: -0.22, orig: 0, sonr: -0.3, ancho: 0.72 }),
    inspira: E({ mx: 0.6, my: -0.3, c: 1, sd: 16, gd: 0.15, si: 16, gi: 0.15, orig: 0, sonr: 0, ancho: 0.5, mof: 1, rub: 0.4 }),
    sopla: E({ mx: 0.7, my: 0.1, c: 0.45, sd: 8, gd: 0.06, si: 8, gi: 0.06, orig: 0, abre: 13, ancho: 0.36, sonr: 0, dientes: 0 }),
    concentra: E({ mx: 0.62, my: 0.95, iris: 0.94, sd: -7, gd: -0.2, si: -5, gi: -0.16, orig: 0, abre: 0, ancho: 0.72, sonr: 0.1, punta: 1 }),
    tambalea: E({ mx: 0.45, my: 0.75, iris: 0.82, sd: 16, gd: 0.2, si: 16, gi: 0.2, orig: 0, abre: 16, ancho: 0.72, sonr: -0.55, sud: 0.55 }),
    pata: E({ mx: 0.8, my: 0.25, iris: 0.9, sd: 8, gd: -0.05, si: 10, gi: 0, orig: 0, abre: 0, ancho: 0.66, sonr: 0.05, punta: 1, sud: 0.6 }),
    casi: E({ mx: -0.15, my: -0.65, iris: 0.6, sd: 32, gd: 0.25, si: 32, gi: 0.25, orig: 0, abre: 50, ancho: 0.75, sonr: -0.3, lengua: 0.4, sud: 1 }),
    alivio: E({ mx: 0.4, my: 0.3, c: 0.88, h: 0.6, sd: 10, gd: 0.15, si: 10, gi: 0.15, orig: 0, abre: 12, ancho: 0.42, sonr: 0.3, dientes: 0, sud: 0.6 }),
    cierra: E({ mx: 0.5, my: 0, c: 1, sd: 20, gd: 0.18, si: 20, gi: 0.18, orig: 0, abre: 0, ancho: 0.78, sonr: 0.4 }),
    pincha: E({ mx: -0.25, my: -0.1, c: 0.02, ci: 1, z: 1, iris: 0.66, sd: 24, gd: 0.28, si: -12, gi: -0.25, orig: 0, abre: 30, ancho: 1.2, sonr: -0.72, dientes: 1 }),
    lagrima: E({ mx: 0.6, my: 0.2, c: 0.08, ci: 0.55, sd: 8, gd: 0.1, si: -2, gi: -0.08, orig: 0, abre: 0, ancho: 0.8, sonr: -0.18 }),
    reverencia: E({ mx: 0.5, my: 0.6, c: 1, h: 1, sd: 16, gd: 0.15, si: 16, gi: 0.15, orig: 0, abre: 0, ancho: 1.05, sonr: 1 }),
    chulo: E({ mx: -0.85, my: -0.22, ci: 0.22, sd: 18, gd: 0.18, si: 2, gi: -0.05, orig: 0, sonr: 0.88, abre: 8, ancho: 1.05 }),
    susto: E({ mx: 0.15, my: -0.5, iris: 0.6, sd: 32, gd: 0.28, si: 32, gi: 0.28, orig: 0, abre: 70, ancho: 0.85, sonr: -0.2, lengua: 0.6, sud: 0.6 }),
    golpe: E({ mx: 0, my: 0, c: 1, z: 1, sd: -6, gd: -0.2, si: -6, gi: -0.2, orig: 0, abre: 26, ancho: 1.3, sonr: -0.6 }),
    apuro: E({ mx: -0.85, my: -0.2, iris: 0.95, sd: 20, gd: 0.22, si: 20, gi: 0.22, orig: 0, abre: 5, ancho: 1.12, sonr: 0.6, sud: 1, rub: 0.75 })
  };
  const GUION_CARA = [
    [T.mira0, T.mira0 + 0.35, "mira"], [T.sacude0, T.sacude0 + 0.25, "serio"], [T.aire0, T.aire0 + 0.25, "inspira"],
    [T.aire1, T.aire1 + 0.12, "sopla"], [T.cruz0, T.cruz0 + 0.3, "serio"], [T.linea0, T.linea0 + 0.3, "concentra"],
    [5.28, 5.45, "tambalea"], [5.85, 6.1, "concentra"], [6.48, 6.62, "tambalea"], [T.pata0, T.pata0 + 0.3, "pata"],
    [T.casi - 0.18, T.casi - 0.02, "casi"], [T.recupera, T.recupera + 0.25, "alivio"], [T.dedo0, T.dedo0 + 0.25, "cierra"],
    [T.pincha, T.pincha + 0.05, "pincha"], [T.quita, T.quita + 0.3, "lagrima"], [T.rev0, T.rev0 + 0.25, "reverencia"],
    [T.camara, T.camara + 0.25, "chulo"], [T.resbala, T.resbala + 0.08, "susto"], [T.culo, T.culo + 0.05, "golpe"],
    [T.culo + 0.22, T.culo + 0.45, "apuro"]
  ];
  function expresion(t) {
    let e = CARAS.anda;
    for (const [t0, t1, nom] of GUION_CARA) { if (t <= t0) break; e = mezclaE(e, CARAS[nom], suave(fase(t, t0, t1))); }
    return Object.assign({}, e);
  }
  function parpadeos(t) {
    let o = 0;
    for (const tb of [1.15, 4.95, 6.2, 10.55, 11.9]) { const k = fase(t, tb, tb + 0.14); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); }
    return o;
  }

  /* ---------- mano: puño, mano abierta o dedo índice (en unidades del puño) ---------- */
  const C = G.C;
  function capsula(g, x0, y, L, w) { g.beginPath(); g.moveTo(x0, y - w / 2); g.lineTo(x0 + L, y - w / 2); g.arc(x0 + L, y, w / 2, -Math.PI / 2, Math.PI / 2); g.lineTo(x0, y + w / 2); g.closePath(); }
  const DEDOS = [[-7.6, 17], [-2.2, 19], [3.2, 17.5], [8.2, 13.5]];
  const INDICE = { x: 9 + 17 + 2.7, y: -7.6 };                // punta del índice estirado
  function mano(g, m) {
    const k = m.k; if (k <= 0.01) return;
    const v = Math.abs(m.v) < 0.12 ? (m.v < 0 ? -0.12 : 0.12) : m.v;
    g.save(); g.scale(k, k * v); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = C.tinta;
    const ab = clamp(m.ab), ind = clamp(m.ind || 0);
    DEDOS.forEach(([y, L], i) => {
      const e = i === 0 ? Math.max(ab, ind) : ab; if (e < 0.03) return;
      g.save(); g.translate(9, y); g.rotate((i - 1.3) * 0.09 * ab);
      capsula(g, -7, 0, 7 + L * e, 5.4); g.fillStyle = C.piel; g.fill(); g.lineWidth = 1.7; g.stroke();
      if (e > 0.6) { g.globalAlpha = (e - 0.6) / 0.4 * 0.6; g.lineWidth = 1; g.beginPath(); g.moveTo(L * e - 1, -1.4); g.lineTo(L * e - 1, 1.4); g.stroke(); }
      g.restore();
    });
    const forma = () => { g.beginPath(); g.moveTo(-14, -6); g.quadraticCurveTo(-14, -12, -7, -12); g.lineTo(7, -12);
      g.quadraticCurveTo(14, -12, 14, -5); g.lineTo(14, 6); g.quadraticCurveTo(14, 13, 6, 13); g.lineTo(-8, 13);
      g.quadraticCurveTo(-15, 13, -15, 5); g.closePath(); };
    forma(); g.fillStyle = C.piel; g.fill();
    g.save(); forma(); g.clip(); g.fillStyle = C.pielSombra; g.beginPath(); g.ellipse(-2, 13, 18, 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
    forma(); g.lineWidth = 2.2; g.stroke();
    const cerr = 1 - ab;
    if (cerr > 0.02) { g.globalAlpha = cerr; g.lineWidth = 1.4; g.beginPath(); for (let i = -1; i <= 1; i++) { g.moveTo(14, i * 5.6 + 1); g.lineTo(7, i * 5.6 + 1.6); } g.stroke(); }
    // pulgar: doblado por encima del puño o estirado al abrir la mano
    const pd = 1 - suave(fase(ab, 0.3, 0.7));
    if (pd > 0.01) { g.globalAlpha = pd; g.beginPath(); g.moveTo(-9, -11); g.quadraticCurveTo(2, -16, 10, -9); g.quadraticCurveTo(4, -5, -6, -6); g.closePath();
      g.fillStyle = C.piel; g.fill(); g.lineWidth = 1.8; g.stroke(); }
    if (pd < 0.99) { g.globalAlpha = 1 - pd; g.save(); g.translate(-5, -10); g.rotate(-0.85); capsula(g, -3, 0, 3 + 12 * ab, 6); g.fillStyle = C.piel; g.fill(); g.lineWidth = 1.8; g.stroke(); g.restore(); }
    g.restore();
  }

  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLSILLO_C = punoDesde({ x: 131, y: 652 }, 0, -1.75), BOLSILLO_L = punoDesde({ x: 372, y: 648 }, 0, -1.75);
  const OJO_I = { x: 893, y: 612 };                         // ojo lejano (retrato): donde acaba el dedo
  const rotar = (q, a) => G.rotP(q, a);

  /* ---------- resbalón y deslizamiento ---------- */
  const V_DESL = 700;
  function desliza(t) {                         // avance de la pelvis desde que resbala (px de pantalla)
    if (t <= T.resbala) return 0;
    const D = T.culo - T.resbala;
    if (t < T.culo) { const k = (t - T.resbala) / D; return V_DESL * D * (k * k * k - k * k * k * k / 2); }
    const u = t - T.culo; return V_DESL * D * 0.5 + V_DESL * u - 40 * u * u;
  }

  function poseBase(t) {
    const b = postura(t);
    const sway = vaiven(t), casi = casiCae(t), coja = pataCoja(t);
    const pc = pie("cerca", t), pl = pie("lejos", t);
    // pelvis: de la llegada pasa a seguir el punto medio de los pies (y sobre el pie de apoyo a la pata coja)
    let xp = posX(t);
    if (t > T.para) {
      const medio = (pc.x + pl.x) / 2, apoyo = lerp(medio, pl.x + 12, coja);
      xp = lerp(XA, apoyo, tramo(t, T.para, T.para + 0.6));
    }
    if (t > T.resbala) xp = (pc.x + pl.x) / 2;                    // al resbalar se congela el apoyo…
    const x = xp + b.dx - sway * 42 + 30 * casi + desliza(t);     // …y el cuerpo sale despedido
    const anda = clamp(velX(t) / V), zanc = Math.max(pc.arco, pl.arco);
    const quieto = t > T.para + 0.3;
    const respira = Math.sin(t * 2.2) * (quieto ? 1 : 0.25);
    const fasePaso = (posX(t) - X0) / PASO * Math.PI;
    const p = {
      x, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + 20 * anda - 17 * zanc * anda - 6 * zanc * (1 - anda) * (t > T.linea0 ? 1 : 0) + respira * 1.3 },
      torso: b.torso + 0.045 * anda + 0.012 * Math.sin(fasePaso) * anda + sway - 0.42 * casi, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.025 * Math.sin(fasePaso + 0.6) * anda - sway * 0.55 + 0.22 * casi, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      cara: null, sombra: 1,
      ikContinuo: true, hombrosContinuos: true, tirasLimpias: true                 // rodajas de piernas y brazos recortadas en cuña (sin dientes de sierra)
    };
    p.torso += 0.05 * campana(t, T.para - 0.5, T.para + 0.5);
    // coger aire: el pecho se hincha
    const hincha = campana2(t, T.aire0 - 0.05, T.sopla1);
    p.torsoEsc = { x: 1 + 0.035 * hincha, y: p.torsoEsc.y + 0.03 * hincha };
    // sacudir las manos: la cabeza también se suelta
    const sac = campana2(t, T.sacude0 + 0.1, T.sacude1);
    p.cabeza.ang += 0.05 * Math.sin(t * 26) * sac;
    // dedo en el ojo: la cabeza da un respingo hacia atrás
    const resp = t > T.pincha ? Math.exp(-(t - T.pincha) * 7) * suave(fase(t, T.pincha, T.pincha + 0.04)) : 0;
    p.cabeza.ang -= 0.2 * resp; p.cabeza.dx -= 10 * resp;
    const frota = campana2(t, T.tapa, T.quita + 0.1);
    p.cabeza.ang += 0.04 * Math.sin(t * 17) * frota;

    // piernas
    const piernas = { cerca: tobillo("cerca", pc, x), lejos: tobillo("lejos", pl, x) };
    // pata coja: la rodilla sube por delante y el pie se balancea
    if (coja > 0.001) {
      const cad = G.tronco(p)(G.CADERA.cerca);
      // como en la prueba de verdad: el pie levantado por delante, casi recto; al irse de espaldas sube más
      const a = 0.5 + 0.06 * Math.sin(t * 6.2) + 0.42 * casi, d = 488 - 10 * Math.sin(t * 4.1);
      const pat = { x: cad.x + Math.sin(a) * d, y: cad.y + Math.cos(a) * d };
      piernas.cerca.tob = mezcla(piernas.cerca.tob, pat, suave(coja));
      piernas.cerca.ang = lerp(piernas.cerca.ang, -0.12 + 0.08 * Math.sin(t * 6.2 + 1) - 0.5 * casi, suave(coja));
    }
    // sentado: rebote al caer de culo
    if (t > T.culo) { const u = t - T.culo; p.pelvis.y -= 26 * Math.exp(-u * 7) * Math.abs(Math.sin(u * 14)); }
    // resbalón (el de la piel de plátano): las piernas, casi rectas, giran juntas desde la cadera
    // hasta quedar por encima, y luego estiradas en el suelo. Se anima el ángulo de cada pierna
    // (no la posición del pie), así la rodilla nunca se dobla más que al andar.
    if (t > T.resbala) {
      const ka = suave(fase(t, T.resbala, T.aire)), ks = suave(fase(t, T.aire, T.culo));
      const Tr0 = G.tronco(p);
      const bote = t > T.culo ? Math.exp(-(t - T.culo) * 9) * Math.abs(Math.sin((t - T.culo) * 30)) : 0;
      for (const lado of ["cerca", "lejos"]) {
        const q = piernas[lado], cad = Tr0(G.CADERA[lado]);
        const v = { x: q.tob.x - cad.x, y: q.tob.y - cad.y };
        const f0 = Math.atan2(v.y, v.x), d0 = Math.hypot(v.x, v.y);
        const dA = 0.95 * 541, dS = 0.95 * 541;
        const fA = lado === "cerca" ? -0.5 : -0.3;
        const ySuelo = TOB_Y[lado] - 4 - 26 * bote;
        const fS = Math.asin(clamp((ySuelo - cad.y) / dS, -0.9, 0.9)) - (lado === "cerca" ? 0.02 : 0);
        const fi = lerp(lerp(f0, fA, ka), fS, ks), d = lerp(lerp(d0, dA, ka), dS, ks);
        q.tob = { x: cad.x + Math.cos(fi) * d, y: cad.y + Math.sin(fi) * d };
        q.ang = lerp(q.ang, fi - Math.PI / 2 - 0.12, Math.max(ka, ks));
      }
    }
    p.piernas = piernas;

    // cara
    const e = expresion(t);
    e.c = Math.max(e.c, parpadeos(t));
    p.cara = { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: 0,
      ojos: { d: e.c, i: Math.max(e.c, e.ci), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
    p.sudor = e.sud;
    p.rojo = 0.25 * e.rub;
    const punta = e.punta, llora = t > T.pincha ? tramo(t, T.pincha + 0.05, T.pincha + 0.3) * (1 - tramo(t, T.rev1, T.levanta + 0.3)) : 0;
    p.capaCabeza = (g, tt) => { lenguaFuera(g, punta, tt); lagrima(g, llora, tt); rojez(g, llora * (1 - tramo(tt, T.quita, T.rev1))); };

    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    // brazos en cruz como un balancín: giran al revés que el cuerpo (y aspas al casi caerse)
    const kCruz = tramo(t, T.cruz0, T.cruz1) * (1 - tramo(t, T.dedo0 - 0.05, T.dedo0 + 0.3));
    const aspas = suave(fase(t, T.casi - 0.2, T.casi)) * (1 - suave(fase(t, T.recupera - 0.1, T.recupera + 0.3)));
    const giro = (-2.1 * vaiven(t - 0.12) + 0.5 * Math.sin(t * 15.5) * aspas - 0.35 * casi) * kCruz;
    const oc = rotar({ x: b.cx, y: b.cy }, giro * kCruz), ol = rotar({ x: b.lx, y: b.ly }, giro * kCruz + 0.4 * Math.sin(t * 15.5 + 1.4) * aspas);
    let c = { x: hc.x + oc.x, y: hc.y + oc.y }, l = { x: hl.x + ol.x, y: hl.y + ol.y };
    let ca = b.ca + giro * kCruz, la = b.la + giro * kCruz;
    // sacudir las manos
    c.x += 9 * Math.sin(t * 44) * sac; c.y += 12 * Math.sin(t * 37 + 1) * sac; ca += 0.4 * Math.sin(t * 44 + 0.6) * sac;
    l.x += 9 * Math.sin(t * 41 + 2) * sac; l.y += 12 * Math.sin(t * 35) * sac; la += 0.4 * Math.sin(t * 41 + 2.4) * sac;
    // bolsillos
    const enBolsC = 1 - clamp(b.cp * 1.5), enBolsL = 1 - clamp(b.lp * 1.5);
    c = mezcla(c, BOLSILLO_C, enBolsC * (1 - b.cp)); l = mezcla(l, BOLSILLO_L, enBolsL * (1 - b.lp));

    // prueba del dedo: el brazo trae el índice en arco… hasta el ojo; luego se lo frota
    let ind = 0;
    if (t > T.dedo0) {
      ind = suave(fase(t, T.dedoSale, T.dedoSale + 0.18)) * (1 - suave(fase(t, T.pincha + 0.08, T.tapa + 0.08)));
      const ojo = G.cabeza(p).a(OJO_I);
      const angP = -2.62;                                            // el índice apunta a la cara
      const tip = rotar({ x: INDICE.x * G.JK, y: INDICE.y * G.JK }, angP);
      const objetivo = { x: ojo.x - tip.x, y: ojo.y - tip.y };
      const ext = { x: hl.x + b.lx, y: hl.y + b.ly };
      const ku = fase(t, T.dedo1, T.pincha), k = ku < 0.55 ? 0.25 * suave(ku / 0.55) : 0.25 + 0.75 * entrada((ku - 0.55) / 0.45);
      // arco: pasa por encima, por fuera del hombro
      const medio = { x: (ext.x + objetivo.x) / 2 + 60, y: Math.min(ext.y, objetivo.y) - 70 };
      const curva = u => mezcla(mezcla(ext, medio, u), mezcla(medio, objetivo, u), u);
      let pD = curva(k), aD = lerp(b.la, angP, suave(k));
      // se frota el ojo con los nudillos
      const fr = suave(fase(t, T.pincha + 0.06, T.tapa + 0.06)), suelta = suave5(fase(t, T.quita - 0.05, T.quita + 0.35));
      const frotaP = { x: ojo.x + 34 + 7 * Math.sin(t * 19), y: ojo.y + 26 + 5 * Math.cos(t * 19) };
      pD = mezcla(pD, frotaP, fr); aD = lerp(aD, -2.0, fr);
      const cuelga = { x: hl.x + CUELGA.lx, y: hl.y + CUELGA.ly };
      pD = mezcla(pD, cuelga, suelta); pD.x += 90 * Math.pow(Math.sin(Math.PI * suelta), 2); aD = lerp(aD, CUELGA.la, suelta);
      const w = tramo(t, T.dedo0, T.dedo0 + 0.3) * (1 - tramo(t, T.quita + 0.3, T.rev0 + 0.05));
      l = mezcla(l, pD, w); la = lerp(la, aD, w);
    }
    // resbalón: los brazos salen disparados hacia arriba girando por fuera (se anima su ángulo y
    // casi no cambia la distancia al hombro: el codo apenas se dobla)
    if (t > T.resbala) {
      const ka = suave(fase(t, T.resbala - 0.03, T.aire)), ks = suave(fase(t, T.aire, T.culo + 0.12));
      const O = CUERPOS.orgullo;
      const brazoArriba = (h, ox, oy, a0, R1, fA, fS) => {
        const f0 = Math.atan2(oy, ox), R0 = Math.hypot(ox, oy);
        const fi = lerp(lerp(f0, fA, ka), fS, ks), R = lerp(R0, R1, ka);
        return { x: h.x + Math.cos(fi) * R, y: h.y + Math.sin(fi) * R, a: lerp(a0, fi, ka) };
      };
      const bc = brazoArriba(hc, O.cx, O.cy, O.ca, 330, 2 * Math.PI - 2.45, 2 * Math.PI - 1.95);
      const bl = brazoArriba(hl, O.lx, O.ly, O.la, 288, -0.8, -0.85);
      c = { x: bc.x, y: bc.y }; ca = bc.a; l = { x: bl.x, y: bl.y }; la = bl.a;
    }
    // en el aire y resbalando, manos agitándose
    const agita = tramo(t, T.resbala, T.resbala + 0.15) * (1 - tramo(t, T.culo + 0.3, T.culo + 0.6));
    c.x += 10 * Math.sin(t * 21) * agita; c.y += 8 * Math.sin(t * 17 + 1) * agita; ca += 0.25 * Math.sin(t * 21 + 0.5) * agita;
    l.x += 10 * Math.sin(t * 19 + 2) * agita; l.y += 8 * Math.sin(t * 23) * agita; la += 0.25 * Math.sin(t * 19 + 2.5) * agita;
    const objC = { k: b.cp, ab: b.cab_, v: b.cv }, objL = { k: b.lp, ab: b.lab, v: b.lv, ind };
    p.manoCerca = { x: c.x, y: c.y, ang: ca, mu: Math.PI, dobla: -1, puno: 0, objeto: g => mano(g, objC) };
    p.manoLejos = { x: l.x, y: l.y, ang: la, mu: Math.PI, dobla: -1, puno: 0, objeto: g => mano(g, objL) };
    p.xPies = [pc.x, pl.x];
    return p;
  }

  // Posturas de instantes fijos (impactos, rastro de polvo): se calculan una vez.
  const MEMO = new Map();
  const poseFija = t => { if (!MEMO.has(t)) MEMO.set(t, poseBase(t)); return MEMO.get(t); };

  // Inercia de la cabeza (se queda un poco atrás en arranques y frenadas).
  function cabezaPantalla(t) { const p = poseBase(t); return G.aPantalla(p, G.centroCabeza(p)); }
  function pose(t) {
    const p = poseBase(t), d = 1 / 30, ojoAntes = G.cabeza(p).a(OJO_I);
    const a = cabezaPantalla(t), b = cabezaPantalla(t - d), c = cabezaPantalla(t - 2 * d);
    const ax = (a.x - 2 * b.x + c.x) / (d * d), ay = (a.y - 2 * b.y + c.y) / (d * d);
    p.cabeza.ang += clamp(-ax * 0.00004, -0.06, 0.06);
    p.cabeza.dy += clamp(-ay * 0.004, -6, 6);
    // Mantener el contacto con el ojo también después de aplicar la inercia de la cabeza.
    const ojoDespues = G.cabeza(p).a(OJO_I);
    const sigueOjo = tramo(t, T.dedo1, T.pincha) * (1 - tramo(t, T.quita - .05, T.quita + .35));
    p.manoLejos.x += (ojoDespues.x - ojoAntes.x) * sigueOjo;
    p.manoLejos.y += (ojoDespues.y - ojoAntes.y) * sigueOjo;
    return p;
  }

  /* ---------- detalles de la cara (coordenadas del retrato) ---------- */
  function lenguaFuera(g, k, t) {          // la punta de la lengua asoma por la comisura (concentración)
    if (k <= 0.01) return;
    g.save(); g.translate(851, 754); g.rotate(0.55 + 0.08 * Math.sin(t * 3)); g.scale(k, k);
    g.beginPath(); g.moveTo(-14, -6); g.quadraticCurveTo(-16, 22, 2, 26); g.quadraticCurveTo(18, 24, 14, -6); g.closePath();
    g.fillStyle = C.lengua; g.fill(); g.lineWidth = 5; g.strokeStyle = C.tinta; g.lineJoin = "round"; g.stroke();
    g.strokeStyle = "rgba(120,20,20,0.55)"; g.lineWidth = 3; g.beginPath(); g.moveTo(1, 2); g.lineTo(2, 16); g.stroke();
    g.restore();
  }
  function lagrima(g, k, t) {               // ojo lloroso y lagrimón que cae por la mejilla
    if (k <= 0.01) return;
    g.save(); g.globalAlpha = k;
    g.strokeStyle = "rgba(150,220,255,0.95)"; g.lineWidth = 9; g.lineCap = "round";
    g.beginPath(); g.moveTo(870, 632); g.quadraticCurveTo(895, 642, 920, 640); g.stroke();
    const u = ((t - T.pincha - 0.2) / 0.9) % 1, y = 650 + Math.max(0, u) * 120, s = 19 * (1 - 0.3 * Math.max(0, u));
    if (t > T.pincha + 0.2) {
      g.globalAlpha = k * Math.sin(Math.PI * clamp(u));
      g.beginPath(); g.moveTo(912, y - s * 1.7); g.quadraticCurveTo(912 + s, y, 912, y + s); g.quadraticCurveTo(912 - s, y, 912, y - s * 1.7);
      g.fillStyle = "#bfe8ff"; g.fill(); g.lineWidth = 4; g.strokeStyle = "#1d3b52"; g.stroke();
      g.fillStyle = "#fff"; g.beginPath(); g.ellipse(912 - s * 0.3, y - s * 0.1, s * 0.22, s * 0.35, 0, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  function rojez(g, k) {                     // el ojo pinchado se pone rojo
    if (k <= 0.01) return;
    g.save(); g.globalAlpha = 0.45 * k; g.fillStyle = "#ff5a5a";
    g.beginPath(); g.ellipse(896, 620, 40, 26, 0.3, 0, Math.PI * 2); g.fill(); g.restore();
  }

  /* ---------- efectos ---------- */
  function estrellaPuntas(g, x, y, r, puntas, rot, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function impacto(g, t, t0, x, y, tam, dur = 0.3) {
    const k = fase(t, t0, t0 + dur); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    estrellaPuntas(g, x, y, tam * (0.6 + 0.8 * salida(k)), 10, 0.3, 0.42); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2.5; g.strokeStyle = "#0b0a0e"; g.stroke();
    estrellaPuntas(g, x, y, tam * (0.35 + 0.5 * salida(k)), 10, 0.55, 0.5); g.fillStyle = "#ffffff"; g.fill();
    g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2, r0 = tam * (0.9 + 0.9 * k), r1 = r0 + tam * 0.5; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  function vaho(g, t, p) {                  // vaho al soltar el aire (noche fría)
    const k0 = T.aire1 - 0.02; if (t < k0 || t > k0 + 1.6) return;
    const m = G.aPantalla(p, G.boca(p));
    g.save(); g.fillStyle = "#e8eefc";
    for (let i = 0; i < 12; i++) {
      const t0 = k0 + i * 0.03, k = fase(t, t0, t0 + 1.0); if (k <= 0 || k >= 1) continue;
      const x = m.x + 6 + 95 * salida(k) * (0.7 + 0.6 * hash(i + 70)) + 5 * Math.sin(t * 3 + i), y = m.y + 2 - 46 * k * (0.4 + 0.9 * hash(i + 71));
      g.globalAlpha = 0.12 * Math.sin(Math.PI * Math.pow(k, 0.6)) * (1 - i / 16);
      g.beginPath(); g.arc(x, y, 4 + 20 * salida(k), 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  function lineasSacude(g, t, p) {           // rayitas de movimiento al sacudir las manos
    const k = campana2(t, T.sacude0 + 0.1, T.sacude1); if (k < 0.05) return;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.7 * k})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (const m of [p.manoCerca, p.manoLejos]) {
      const q = G.aPantalla(p, m);
      for (let i = -1; i <= 1; i += 2) { g.beginPath(); g.arc(q.x, q.y, 16, (i < 0 ? Math.PI : 0) - 0.6, (i < 0 ? Math.PI : 0) + 0.6); g.stroke(); }
    }
    g.restore();
  }
  function gotasEsfuerzo(g, t, p) {          // gotitas que salen disparadas al casi caerse
    const k = fase(t, T.casi - 0.12, T.casi + 0.5); if (k <= 0 || k >= 1) return;
    const c = G.aPantalla(p, G.cabeza(p).a({ x: 760, y: 380 }));
    g.save(); g.strokeStyle = "#1d3b52"; g.lineWidth = 1.8; g.fillStyle = "#bfe8ff";
    for (let i = 0; i < 4; i++) {
      const a = -Math.PI / 2 + (i - 1.5) * 0.55, d = 20 + 50 * salida(k);
      const x = c.x + Math.cos(a) * d, y = c.y + Math.sin(a) * d + 40 * k * k;
      g.globalAlpha = 1 - k; g.beginPath(); g.ellipse(x, y, 3.5, 5, a + Math.PI / 2, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    g.restore();
  }
  function rastro(g, t, p) {                 // polvo y rayas de velocidad mientras resbala de culo
    if (t < T.culo - 0.02 || t > T.choque + 0.6) return;
    g.save();
    for (let i = 0; i < 14; i++) {
      const t0 = T.culo + i * 0.055; if (t < t0) break;
      const k = fase(t, t0, t0 + 0.6); if (k >= 1) continue;
      const pt = poseFija(t0), x = pt.x - 40 + (hash(i + 90) - 0.5) * 20;
      g.globalAlpha = 0.4 * (1 - k); g.fillStyle = i % 2 ? "#8d8aa0" : "#b5b0c4";
      g.beginPath(); g.ellipse(x - 10 * k, SUELO - 6 - 22 * k, 10 + 18 * k, 6 + 9 * k, 0, 0, Math.PI * 2); g.fill();
    }
    const vel = t > T.culo && t < T.choque ? 1 - tramo(t, T.culo + 0.7, T.choque) : 0;
    if (vel > 0.02) {
      g.strokeStyle = "#ffffff"; g.lineCap = "round"; g.lineWidth = 3;
      for (let i = 0; i < 5; i++) {
        const y = SUELO - 30 - i * 34 - hash(i + 40) * 12, L = 50 + hash(i + 41) * 60, x1 = p.x - 70 - hash(i + 42) * 30;
        g.globalAlpha = 0.55 * vel * (0.6 + 0.4 * Math.sin(t * 20 + i));
        g.beginPath(); g.moveTo(x1, y); g.lineTo(x1 - L, y); g.stroke();
      }
    }
    g.restore();
  }
  function choque(g, t) {                    // el golpe fuera de plano, por la derecha
    impacto(g, t, T.choque, W + 6, SUELO - 70, 70, 0.4);
    const k = fase(t, T.choque, T.choque + 0.8); if (k <= 0 || k >= 1) return;
    g.save();
    for (let i = 0; i < 9; i++) {
      const a = Math.PI + (hash(i + 120) - 0.5) * 1.6, d = 30 + 120 * salida(k) * (0.6 + hash(i + 121) * 0.6);
      g.globalAlpha = 0.45 * (1 - k); g.fillStyle = "#a9a4b8";
      g.beginPath(); g.arc(W + 10 + Math.cos(a) * d, SUELO - 40 + Math.sin(a) * d * 0.6 - 30 * k, 14 + 26 * k, 0, Math.PI * 2); g.fill();
    }
    for (let i = 0; i < 3; i++) {
      const u = fase(t, T.choque + i * 0.06, T.choque + 0.7 + i * 0.06); if (u <= 0 || u >= 1) continue;
      const x = W - 20 - 130 * salida(u) * (0.6 + 0.3 * i), y = SUELO - 90 - 150 * Math.sin(Math.PI * u * 0.9) + 60 * u;
      g.globalAlpha = 1 - u * u; estrellaPuntas(g, x, y, 11, 5, t * 6 + i, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2; g.strokeStyle = "#0b0a0e"; g.stroke();
    }
    g.restore();
  }
  // la zapatilla que vuelve botando
  function zapatoVuelve(t) {
    const u = t - T.zapato; if (u <= 0) return null;
    const g0 = 2200, x0 = W + 50, y0 = SUELO - 125, sueloZ = SUELO - G.TOBILLO_ALTO * S, vx = -400, vy = -260;
    const tc = (-vy + Math.sqrt(vy * vy + 2 * g0 * (sueloZ - y0))) / g0;     // primer bote
    if (u < tc) return { x: x0 + vx * u, y: y0 + vy * u + 0.5 * g0 * u * u, rot: -11 * (tc - u) };   // gira y cae plana
    // botecitos cada vez más bajos y se queda quieta
    const v = u - tc, x = x0 + vx * tc - 60 * (1 - Math.exp(-v * 5));
    const h = 30 * Math.exp(-v * 6) * Math.abs(Math.sin(v * 13));
    return { x, y: sueloZ - h, rot: 0.25 * Math.exp(-v * 7) * Math.sin(v * 13) };
  }
  function zapato(g, t) {
    const z = zapatoVuelve(t); if (!z) return;
    g.save(); g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse(z.x + 10, SUELO + 1, 26 * clamp(1 - (SUELO - G.TOBILLO_ALTO * S - z.y) / 200, 0.3, 1), 5, 0, 0, Math.PI * 2); g.fill(); g.restore();
    g.save(); g.translate(z.x, z.y); g.rotate(z.rot); g.scale(S, S); R.pieza(g, G.A, "zapato", PZ.zapato.pivote); g.restore();
  }
  const R = Recortes;

  /* ---------- decorado: calle de noche delante del bar ---------- */
  const FX = 80, FY = 60;
  const FAROLA = { x: 300, y: 84 };
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 2 * FX; c.height = H + 2 * FY; const g = c.getContext("2d");
    g.translate(FX, FY);
    const X0f = -FX, AN = W + 2 * FX;
    // cielo con estrellas y luna
    const cielo = g.createLinearGradient(0, -FY, 0, 40); cielo.addColorStop(0, "#04050d"); cielo.addColorStop(1, "#151b3d");
    g.fillStyle = cielo; g.fillRect(X0f, -FY, AN, 110);
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,255,${0.25 + 0.6 * hash(i + 300)})`; const s = 1 + hash(i + 301) * 1.6; g.fillRect(X0f + hash(i + 302) * AN, -FY + hash(i + 303) * 80, s, s); }
    g.fillStyle = "#fff6d8"; g.beginPath(); g.arc(950, -12, 26, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#151b3d"; g.beginPath(); g.arc(962, -20, 23, 0, Math.PI * 2); g.fill();
    // fachada de ladrillo
    const muro = g.createLinearGradient(0, 30, 0, 440); muro.addColorStop(0, "#24172f"); muro.addColorStop(1, "#3b2340");
    g.fillStyle = muro; g.fillRect(X0f, 30, AN, 412);
    for (let fila = 0, y = 46; y < 440; y += 19, fila++) {
      for (let x = X0f - (fila % 2) * 23; x < W + FX; x += 46) {
        const h = hash(fila * 97 + Math.floor(x));
        g.fillStyle = h < 0.33 ? "rgba(255,255,255,0.035)" : h > 0.8 ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0)"; g.fillRect(x + 1, y + 1, 44, 17);
      }
      g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(X0f, y); g.lineTo(W + FX, y); g.stroke();
      g.beginPath(); for (let x = X0f - (fila % 2) * 23; x < W + FX; x += 46) { g.moveTo(x, y); g.lineTo(x, y + 19); } g.stroke();
    }
    g.fillStyle = "#130c1c"; g.fillRect(X0f, 20, AN, 16); g.fillStyle = "#4a3352"; g.fillRect(X0f, 34, AN, 4);
    // ventana del bar con luz cálida y botellas
    const vx = 10, vy = 150, vw = 230, vh = 200;
    g.fillStyle = "#120b14"; g.fillRect(vx - 12, vy - 12, vw + 24, vh + 24);
    const dentro = g.createLinearGradient(0, vy, 0, vy + vh); dentro.addColorStop(0, "#ffcf7a"); dentro.addColorStop(1, "#c8642a");
    g.fillStyle = dentro; g.fillRect(vx, vy, vw, vh);
    g.fillStyle = "rgba(90,40,20,0.85)"; g.fillRect(vx, vy + 118, vw, 8);
    for (let i = 0; i < 9; i++) {
      const bx = vx + 14 + i * 24, bh = 38 + hash(i + 200) * 22, col = ["#3b6e3a", "#6e2b2b", "#2d4f78", "#7a5a1e"][i % 4];
      g.fillStyle = col; g.beginPath(); g.roundRect ? g.roundRect(bx, vy + 118 - bh, 15, bh, 4) : g.rect(bx, vy + 118 - bh, 15, bh); g.fill();
      g.fillRect(bx + 5, vy + 118 - bh - 12, 5, 14);
      g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(bx + 3, vy + 126 - bh, 3, bh - 16);
    }
    g.fillStyle = "rgba(60,25,15,0.55)"; g.beginPath(); g.ellipse(vx + 70, vy + vh + 6, 50, 60, 0, Math.PI, 0); g.fill();
    g.beginPath(); g.arc(vx + 70, vy + vh - 70, 20, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 10;
    for (const d of [40, 120]) { g.beginPath(); g.moveTo(vx + d, vy + vh); g.lineTo(vx + d + 70, vy); g.stroke(); }
    g.strokeStyle = "#120b14"; g.lineWidth = 7; g.strokeRect(vx, vy, vw, vh); g.beginPath(); g.moveTo(vx + vw / 2, vy); g.lineTo(vx + vw / 2, vy + vh); g.stroke();
    const halo = g.createRadialGradient(vx + vw / 2, vy + vh / 2, 30, vx + vw / 2, vy + vh / 2, 260); halo.addColorStop(0, "rgba(255,180,90,0.22)"); halo.addColorStop(1, "rgba(255,180,90,0)");
    g.fillStyle = halo; g.fillRect(vx - 200, vy - 200, vw + 400, vh + 400);
    // puerta del bar
    const px = 800, py = 168, pw = 112;
    g.fillStyle = "#120b14"; g.fillRect(px - 10, py - 10, pw + 20, 442 - py + 10);
    const mad = g.createLinearGradient(px, 0, px + pw, 0); mad.addColorStop(0, "#5a2f1c"); mad.addColorStop(1, "#3a1d10");
    g.fillStyle = mad; g.fillRect(px, py, pw, 442 - py);
    g.fillStyle = "#ffcf7a"; g.fillRect(px + 22, py + 26, pw - 44, 70); g.strokeStyle = "#2a150c"; g.lineWidth = 5; g.strokeRect(px + 22, py + 26, pw - 44, 70);
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 3; g.strokeRect(px + 16, py + 118, pw - 32, 120); g.strokeRect(px + 16, py + 248, pw - 32, 20);
    g.fillStyle = "#e8c34a"; g.beginPath(); g.arc(px + pw - 18, py + 170, 6, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,200,120,0.5)"; g.fillRect(px + pw - 3, py, 3, 442 - py);
    // farola
    g.strokeStyle = "#0b0a0e"; g.lineCap = "round"; g.lineWidth = 12;
    g.beginPath(); g.moveTo(96, 442); g.lineTo(96, 70); g.quadraticCurveTo(96, 40, 130, 40); g.lineTo(FAROLA.x - 20, 40); g.quadraticCurveTo(FAROLA.x, 40, FAROLA.x, 62); g.stroke();
    g.strokeStyle = "#2c2a3a"; g.lineWidth = 6; g.stroke();
    g.fillStyle = "#1a1822"; g.fillRect(84, 420, 24, 24);
    g.fillStyle = "#1a1822"; g.beginPath(); g.moveTo(FAROLA.x - 30, 82); g.lineTo(FAROLA.x - 14, 60); g.lineTo(FAROLA.x + 14, 60); g.lineTo(FAROLA.x + 30, 82); g.closePath(); g.fill();
    g.lineWidth = 3; g.strokeStyle = "#0b0a0e"; g.stroke();
    // acera y bordillo
    const acera = g.createLinearGradient(0, 442, 0, 480); acera.addColorStop(0, "#3a3748"); acera.addColorStop(1, "#4b4760");
    g.fillStyle = acera; g.fillRect(X0f, 442, AN, 38);
    g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = 2;
    for (let x = X0f; x < W + FX; x += 90) { g.beginPath(); g.moveTo(x, 442); g.lineTo(x - 14, 480); g.stroke(); }
    g.fillStyle = "#6a6680"; g.fillRect(X0f, 478, AN, 6); g.fillStyle = "#2a2838"; g.fillRect(X0f, 484, AN, 9);
    // asfalto
    const asf = g.createLinearGradient(0, 493, 0, H + FY); asf.addColorStop(0, "#1c2030"); asf.addColorStop(1, "#11131d");
    g.fillStyle = asf; g.fillRect(X0f, 493, AN, H + FY - 493);
    for (let i = 0; i < 260; i++) { g.fillStyle = hash(i + 500) > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.18)"; g.fillRect(X0f + hash(i + 501) * AN, 494 + hash(i + 502) * (H + FY - 494), 2, 2); }
    // charco con el reflejo del neón
    g.save(); g.beginPath(); g.ellipse(880, 584, 90, 11, 0, 0, Math.PI * 2); g.clip();
    g.fillStyle = "#0e1424"; g.fillRect(780, 570, 200, 30);
    g.fillStyle = "rgba(255,80,170,0.4)"; g.fillRect(830, 576, 60, 3); g.fillStyle = "rgba(255,190,80,0.35)"; g.fillRect(845, 582, 40, 3);
    g.restore();
    // luz de la farola: cono y charco de luz en el suelo
    g.save(); g.globalCompositeOperation = "lighter";
    const cono = g.createLinearGradient(0, FAROLA.y, 0, SUELO + 30); cono.addColorStop(0, "rgba(255,226,150,0.22)"); cono.addColorStop(1, "rgba(255,226,150,0.05)");
    g.fillStyle = cono; g.beginPath(); g.moveTo(FAROLA.x - 26, FAROLA.y); g.lineTo(FAROLA.x + 26, FAROLA.y); g.lineTo(FAROLA.x + 330, SUELO + 30); g.lineTo(FAROLA.x - 250, SUELO + 30); g.closePath(); g.fill();
    g.save(); g.translate(FAROLA.x + 60, SUELO + 2); g.scale(1, 0.14);
    const pool = g.createRadialGradient(0, 0, 10, 0, 0, 340); pool.addColorStop(0, "rgba(255,220,140,0.35)"); pool.addColorStop(1, "rgba(255,220,140,0)");
    g.fillStyle = pool; g.beginPath(); g.arc(0, 0, 340, 0, Math.PI * 2); g.fill(); g.restore();
    g.restore();
    // la línea blanca pintada en el asfalto (de borde a borde)
    const L0 = SUELO - 12, L1 = SUELO + 1;          // a la altura de las suelas: los pies la pisan
    g.fillStyle = "#e9e6dc"; g.fillRect(X0f, L0, AN, L1 - L0);
    for (let i = 0; i < 70; i++) { g.fillStyle = "rgba(28,32,48,0.55)"; g.fillRect(X0f + hash(i + 700) * AN, L0 + hash(i + 701) * (L1 - L0 - 2), 2 + hash(i + 702) * 5, 2); }
    g.fillStyle = "rgba(255,255,255,0.5)"; g.fillRect(X0f, L0, AN, 2);
    g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(X0f, L1, AN, 2);
    // viñeta
    const v = g.createRadialGradient(512, 300, 280, 512, 300, 700); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.6)");
    g.fillStyle = v; g.fillRect(X0f, -FY, AN, H + 2 * FY);
    return c;
  }
  // rótulo de neón (una jarra), con algún parpadeo, y polillas alrededor de la farola
  function neon(g, t) {
    const fl = ruido(t * 3.1) > 0.82 ? 0.35 : 1, on = fl * (0.88 + 0.12 * Math.sin(t * 9));
    g.save(); g.translate(856, 102); g.lineCap = "round"; g.lineJoin = "round";
    const traza = () => { g.beginPath(); g.moveTo(-28, -22); g.lineTo(-24, 34); g.quadraticCurveTo(-23, 40, -16, 40); g.lineTo(18, 40); g.quadraticCurveTo(25, 40, 25, 34); g.lineTo(28, -22);
      g.moveTo(28, -8); g.quadraticCurveTo(48, -8, 48, 10); g.quadraticCurveTo(48, 26, 27, 26); };
    const espuma = () => { g.beginPath(); g.moveTo(-32, -22); g.arc(-20, -26, 11, Math.PI, 0); g.arc(0, -30, 11, Math.PI, 0); g.arc(20, -26, 11, Math.PI, 0); g.lineTo(32, -22); };
    g.globalCompositeOperation = "lighter";
    g.strokeStyle = `rgba(255,170,40,${0.22 * on})`; g.lineWidth = 16; traza(); g.stroke();
    g.strokeStyle = `rgba(255,80,170,${0.22 * on})`; espuma(); g.stroke();
    g.globalCompositeOperation = "source-over";
    g.strokeStyle = fl < 1 ? "#7a5a30" : "#ffd27a"; g.lineWidth = 4.5; traza(); g.stroke();
    g.strokeStyle = fl < 1 ? "#7a3a60" : "#ffb0dc"; espuma(); g.stroke();
    g.restore();
    g.save(); g.fillStyle = "#fff4c8";
    for (let i = 0; i < 4; i++) {
      const a = t * (2.2 + hash(i) * 1.5) + i * 1.7, r = 24 + 14 * ruido(t * 0.8 + i * 3);
      g.globalAlpha = 0.85; g.beginPath(); g.arc(FAROLA.x + Math.cos(a) * r * 1.4, FAROLA.y + 18 + Math.sin(a * 1.3) * r * 0.6, 1.8, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  function sombra(g, p, t) {
    const [a, b] = p.xPies;
    let x0 = Math.min(a, b, p.x - 30) - 26, x1 = Math.max(a, b, p.x + 30) + 52;
    if (t > T.resbala) { const k = tramo(t, T.resbala, T.culo); x0 = lerp(x0, p.x - 60, k); x1 = lerp(x1, p.x + 190, k); }
    const al = t > T.resbala && t < T.culo ? 0.38 - 0.18 * campana(t, T.resbala, T.culo) : 0.38;
    g.save(); g.fillStyle = `rgba(0,0,0,${al})`; g.beginPath(); g.ellipse((x0 + x1) / 2, SUELO - 3, (x1 - x0) / 2, 8, 0, 0, Math.PI * 2); g.fill(); g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t, p) {
    const sigue = tramo(t, T.linea0, T.linea1, suave) * (1 - tramo(t, T.paso, T.culo + 0.3, suave));
    const zPata = tramo(t, T.pata0 - 0.3, T.pata1 + 0.2) * (1 - tramo(t, T.dedo0 - 0.15, T.dedo0 + 0.35));
    const zDedo = tramo(t, T.dedo0 - 0.15, T.dedo1 + 0.1) * (1 - tramo(t, T.quita + 0.1, T.rev1));
    const zRev = tramo(t, T.rev0, T.camara) * (1 - tramo(t, T.paso, T.resbala + 0.2));
    const k = 1 + 0.06 * sigue * (1 - zDedo) + 0.08 * zPata + 0.18 * zDedo + 0.06 * zRev;
    const x = lerp(512, 560, sigue) + 12 * zDedo + 10 * zRev;
    const y = 300 + 8 * sigue * (1 - zDedo) + 6 * zPata + 24 * zDedo + 4 * zRev;
    return { k, x, y };
  }

  class GuillermoLinea extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo()) return;
      if (!fondo) fondo = creaFondo();
      const p = pose(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t, p);
      const tb = 7 * Math.exp(-Math.max(0, t - T.culo) * 7) * suave(fase(t, T.culo, T.culo + 0.05)) + 7 * Math.exp(-Math.max(0, t - T.choque) * 6) * suave(fase(t, T.choque, T.choque + 0.06));
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -FX, -FY);
      neon(g, t);
      sombra(g, p, t);
      rastro(g, t, p);
      G.dibujar(g, p, t);
      lineasSacude(g, t, p);
      vaho(g, t, p);
      gotasEsfuerzo(g, t, p);
      if (t > T.pincha - 0.01 && t < T.pincha + 0.35) { const q = pose(T.pincha), o = G.aPantalla(q, G.cabeza(q).a(OJO_I)); impacto(g, t, T.pincha, o.x, o.y, 15, 0.28); }
      if (t > T.culo - 0.01 && t < T.culo + 0.4) impacto(g, t, T.culo, poseFija(T.culo).x - 20, SUELO - 14, 30, 0.3);
      zapato(g, t);
      choque(g, t);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00009.2", nombre: "Guillermo y la línea recta", crear: () => new GuillermoLinea() });
  window.__A2D_00009_2 = { pose, poseBase, T, DUR, PASOS, camara, pie, tobillo, TOB_Y, SUELO, INDICE, OJO_I, desliza, zapatoVuelve };
})();
