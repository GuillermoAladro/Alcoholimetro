"use strict";
/* 00006 · Guillermo y el hipo
 *
 * Negro → en una taberna de azulejos, Guillermo está de pie con las manos en los bolsillos, muy a
 * gusto, junto a una mesa alta con la pinta vacía → ¡hipido! Todo el cuerpo pega un bote, los ojos
 * se le salen, se le hinchan los carrillos y le sale una pompa por la boca que sube y explota →
 * más hipidos a destiempo, cada uno un poco más fuerte; se va mosqueando y mira a cámara harto →
 * decide aguantar la respiración: coge muchísimo aire (se le hincha el pecho), cierra la boca con
 * los carrillos inflados y aprieta los puños → se pone rojo, luego morado; suda, tiembla, echa
 * vapor por la oreja, se le escapan dos hipidos «por dentro» y abre un ojo para espiar a cámara →
 * un hipido GIGANTE lo levanta del suelo: se queda flotando con una pompa enorme y aterriza
 * aplastado (la pinta da un saltito en la mesa) → mira la pompa subir, suspira aliviado y se da
 * dos palmaditas en el pecho → manos a los bolsillos, todo bien… y un último hipido pequeñito →
 * mira a cámara resignado → negro.
 *
 * Sin textos. La cara morada es un tinte sobre la piel del retrato (polígono de la piel sacado de
 * la diferencia entre la cabeza normal y la cabeza roja del atlas). Todo depende del tiempo absoluto.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo;
  const S = 0.33, SUELO = 572, XG = 440;
  const DUR = 13.15;
  const T = {
    contento: 0.3, hic1: 1.55, hic2: 2.55, hic3: 2.93, hic4: 3.8, harto: 4.25, decide: 4.95,
    inhala0: 5.3, inhala1: 5.9, rojo0: 5.95, casi1: 6.5, morado0: 6.9, espia0: 6.95, espia1: 7.42, casi2: 7.6, vapor0: 7.25,
    agacha: 8.12, alarma: 8.2, despega: 8.36, cima: 8.8, caida: 8.98, aterriza: 9.27,
    mira: 9.57, alivio: 10.05, palmada1: 10.32, palmada2: 10.52, bolsillos: 10.75, hicFin: 11.2, resignado: 11.5, fin: 12.55
  };
  // Hipidos: instante, bote (px de pantalla), pompa (radio en px), vida de la pompa, deriva.
  const HIPOS = [
    { t: T.hic1, a: 9, r: 11, vida: 1.05, vx: 26 },
    { t: T.hic2, a: 13, r: 13, vida: 0.7, vx: 36 },
    { t: T.hic3, a: 11, r: 10, vida: 1.15, vx: 16 },
    { t: T.hic4, a: 19, r: 18, vida: 1.35, vx: 30 },
    { t: T.hicFin, a: 9, r: 10, vida: 0.78, vx: 12, fin: true }
  ];
  const CASI = [T.casi1, T.casi2];          // hipidos que se le escapan «por dentro» mientras aguanta

  /* ---------- botes ---------- */
  function pulsoCuerpo(u) {                // sube rápido, baja y se asienta doblando un poco las rodillas
    if (u <= 0) return 0;
    if (u < 0.09) return suave(u / 0.09);
    if (u < 0.3) return 1 - suave((u - 0.09) / 0.21);
    if (u < 0.55) { const s = Math.sin(Math.PI * (u - 0.3) / 0.25); return -0.22 * s * s; }
    return 0;
  }
  function pulsoCara(u) {
    if (u <= 0) return 0;
    if (u < 0.07) return suave(u / 0.07);
    if (u < 0.32) return 1;
    if (u < 0.62) return 1 - suave((u - 0.32) / 0.3);
    return 0;
  }
  // Hipido gigante: se agacha sin querer, sale disparado, flota un instante y cae.
  const H_SALTO = 100, H_AGACHA = 26, TUCK = 52;
  const hermite = (u, s) => s * u + (3 - 2 * s) * u * u + (s - 2) * u * u * u;   // sale con algo de velocidad y llega parado
  const V_CAIDA = 2 * H_SALTO / (T.aterriza - T.caida), TAU = 0.09;
  function saltoGigante(t) {
    let J = 0;
    if (t < T.agacha) J = 0;
    else if (t < T.despega - 0.05) J = -H_AGACHA * suave(fase(t, T.agacha, T.despega - 0.05));
    else if (t < T.despega) J = -H_AGACHA;
    else if (t < T.cima) J = lerp(-H_AGACHA, H_SALTO, hermite(fase(t, T.despega, T.cima), 1.25));
    else if (t < T.caida) { const s = Math.sin(Math.PI * fase(t, T.cima, T.caida)); J = H_SALTO + 5 * s * s; }
    else if (t < T.aterriza) { const u = fase(t, T.caida, T.aterriza); J = H_SALTO * (1 - u * u); }
    else { const v = t - T.aterriza; J = -V_CAIDA * v * Math.exp(-v / TAU); }      // aterriza: las rodillas absorben la caída
    const s = Math.sin(Math.PI * fase(t, T.despega + 0.08, T.aterriza - 0.05));
    return { J, tuck: TUCK * s * s };
  }
  function botes(t) {
    let J = 0, F = 0, cara = 0, casi = 0;
    for (const h of HIPOS) { const k = pulsoCuerpo(t - h.t); J += h.a * k; F += h.a * Math.max(0, k); cara = Math.max(cara, pulsoCara(t - h.t) * (h.fin ? 0.8 : 1)); }
    for (const tc of CASI) casi = Math.max(casi, pulsoCara(t - tc));
    const sg = saltoGigante(t);
    J += sg.J; F += Math.max(0, sg.J + sg.tuck);
    const aterriza = t > T.aterriza ? clamp(-sg.J / (V_CAIDA * TAU / Math.E)) : 0;
    return { J, F, cara, casi, tuck: sg.tuck, aterriza };
  }

  /* ---------- pasos (x de pantalla de cada tobillo) ---------- */
  const PASOS = {
    cerca: [[-10, -9, XG - 19], [T.despega + 0.1, T.aterriza - 0.05, XG - 38], [T.mira + 0.1, T.mira + 0.35, XG - 19]],
    lejos: [[-10, -9, XG + 18], [T.despega + 0.1, T.aterriza - 0.05, XG + 40], [T.mira + 0.3, T.mira + 0.55, XG + 18]]
  };
  const TOB_Y = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  function pie(lado, t) {
    const L = PASOS[lado]; let i = 0; while (i + 1 < L.length && t >= L[i + 1][0]) i++;
    const [t0, t1, x] = L[i], xa = i > 0 ? L[i - 1][2] : x, u = fase(t, t0, t1);
    const enAire = t0 === T.despega + 0.1;                 // en el aire las piernas se abren sin dar un paso
    const arco = enAire ? 0 : Math.sin(Math.PI * u);
    return { x: lerp(xa, x, suave(u)), y: TOB_Y[lado] - 50 * arco, ang: -0.2 * arco };
  }

  /* ---------- posturas del cuerpo (se mezclan) ---------- */
  // dx: pelvis (px de pantalla), pel: pelvis arriba/abajo (hoja), manos respecto a su hombro (hoja),
  // ex/ey: pecho hinchado (escala del torso).
  const P0 = { dx: 0, pel: 0, torso: 0, cab: 0, cx: 49, cy: 340, ca: 0, cmu: -1.75, cp: 0, lx: 0, ly: 300, la: 0, lmu: -1.75, lp: 0, ex: 1, ey: 1 };
  const C_ = o => Object.assign({}, P0, o);
  const CUERPOS = {
    bolsillos: C_({}),
    contento: C_({ torso: -0.03, cab: -0.05 }),
    harto: C_({ torso: 0.01, cab: 0.07, ey: 0.99 }),
    decide: C_({ pel: 16, torso: 0.05, cab: 0.03, cx: 150, cy: -70, ca: -0.25, cmu: -4.5, cp: 1, lx: 66, ly: -96, la: -0.2, lmu: -4.5, lp: 1 }),
    inhala: C_({ pel: -6, torso: -0.07, cab: -0.12, ex: 1.07, ey: 1.05, cx: -40, cy: 255, ca: 0.3, cmu: -1.6, cp: 1, lx: 55, ly: 255, la: -0.3, lmu: -1.75, lp: 1 }),
    aguanta: C_({ pel: 14, torso: 0, cab: 0.03, ex: 1.065, ey: 1.04, cx: -32, cy: 268, ca: 0.25, cmu: -1.6, cp: 1, lx: 48, ly: 268, la: -0.25, lmu: -1.75, lp: 1 }),
    agacha: C_({ pel: 30, torso: 0.06, cab: 0.06, ex: 1.08, ey: 1.0, cx: -46, cy: 250, ca: 0.35, cmu: -1.6, cp: 1, lx: 62, ly: 250, la: -0.35, lmu: -1.75, lp: 1 }),
    vuelo: C_({ torso: -0.1, cab: -0.14, ey: 1.04, cx: -150, cy: -262, ca: -0.45, cmu: -1.75, cp: 1, lx: 168, ly: -200, la: 0.5, lmu: -1.75, lp: 1 }),
    aterriza: C_({ torso: 0.08, cab: 0.1, ex: 1.03, ey: 0.97, cx: -95, cy: 165, ca: 0.9, cmu: -1.6, cp: 1, lx: 135, ly: 150, la: -0.9, lmu: -1.75, lp: 1 }),
    mira: C_({ torso: -0.06, cab: -0.13, cx: -22, cy: 262, ca: 0.2, cmu: -1.6, cp: 1, lx: 42, ly: 268, la: -0.2, lmu: -1.75, lp: 1 }),
    alivio: C_({ torso: 0.02, cab: 0.05, ex: 0.985, ey: 0.985, cx: 140, cy: 150, ca: -1.1, cmu: -1.75, cp: 1, lx: 0, ly: 300, lp: 0 }),
    bolsillos2: C_({ torso: -0.02, cab: -0.03 }),
    resignado: C_({ torso: 0.01, cab: 0.05, ey: 0.99 })
  };
  const GUION_CUERPO = [
    [T.contento, T.contento + 0.7, "contento"], [T.hic2 + 0.2, T.hic2 + 0.5, "bolsillos"], [T.harto, T.harto + 0.35, "harto"],
    [T.decide, T.decide + 0.4, "decide"], [T.inhala0, T.inhala1, "inhala"], [T.inhala1, T.inhala1 + 0.35, "aguanta"],
    [T.agacha, T.despega, "agacha"], [T.despega, T.despega + 0.2, "vuelo"], [T.caida, T.aterriza, "aterriza"],
    [T.mira - 0.1, T.mira + 0.35, "mira"], [T.alivio, T.alivio + 0.35, "alivio"], [T.bolsillos, T.bolsillos + 0.4, "bolsillos2"],
    [T.resignado, T.resignado + 0.45, "resignado"]
  ];
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function postura(t) {
    let c = CUERPOS.bolsillos;
    for (const [t0, t1, nom] of GUION_CUERPO) { if (t <= t0) break; c = mezclaE(c, CUERPOS[nom], (nom === "vuelo" ? salida : suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, mof: 0 };
  const E = o => Object.assign({}, BASE, o);
  const AGUANTA = { mx: 0, my: 0, c: 1, z: 1, sd: -8, gd: -0.22, si: -8, gi: -0.22, orig: 0, abre: 0, ancho: 0.5, sonr: -0.28, mof: 1 };
  const CARAS = {
    inicio: E({}),
    contento: E({ mx: 0.4, my: -0.1, c: 0.62, h: 1, sd: 8, gd: 0.1, si: 8, gi: 0.1, orig: 0, sonr: 0.62, ancho: 1 }),
    hipo: E({ mx: 0.3, my: -0.25, c: 0, iris: 0.72, sd: 26, gd: 0.18, si: 26, gi: 0.18, orig: 0, abre: 15, ancho: 0.42, sonr: 0, mof: 0.55 }),
    sorpresa: E({ mx: 0.55, my: -0.85, c: 0, iris: 0.95, sd: 14, gd: -0.05, si: 22, gi: 0.12, orig: 0, ancho: 0.7, sonr: -0.05 }),
    molesto: E({ mx: 0.9, my: 0.1, c: 0.32, sd: -9, gd: -0.22, si: -9, gi: -0.22, orig: 0, sonr: -0.38, ancho: 0.82 }),
    harto: E({ mx: -0.85, my: -0.25, c: 0.5, sd: -3, gd: 0.16, si: 10, gi: -0.05, orig: 0, sonr: -0.42, ancho: 0.75 }),
    decide: E({ mx: 0.9, my: -0.25, c: 0.12, sd: -13, gd: -0.28, si: -13, gi: -0.28, orig: 0, sonr: -0.05, ancho: 0.62 }),
    inhala: E({ mx: 0.6, my: -0.6, c: 0.15, iris: 0.9, sd: 22, gd: 0.12, si: 22, gi: 0.12, orig: 0, abre: 28, ancho: 0.62, sonr: 0, lengua: 0.2 }),
    aguanta: E(AGUANTA),
    casi: E(Object.assign({}, AGUANTA, { mof: 1.38, sd: 4, gd: -0.05, si: 4, gi: -0.05, sonr: -0.4, ancho: 0.42 })),
    alarma: E({ mx: 0.2, my: -0.2, c: 0, iris: 0.62, sd: 30, gd: 0.22, si: 30, gi: 0.22, orig: 0, ancho: 0.45, sonr: -0.2, mof: 1.3 }),
    gigante: E({ mx: 0.2, my: -0.5, c: 0, iris: 0.6, sd: 36, gd: 0.25, si: 36, gi: 0.25, orig: 0, abre: 44, ancho: 0.78, sonr: 0.05, lengua: 0.4 }),
    cae: E({ mx: 0.1, my: 0.6, c: 0, iris: 0.7, sd: 24, gd: 0.15, si: 24, gi: 0.15, orig: 0, abre: 20, ancho: 0.7, sonr: -0.2, lengua: 0.3 }),
    aterriza: E({ mx: 0, my: 0, c: 0.85, z: 0.6, sd: 6, gd: 0.1, si: 6, gi: 0.1, orig: 0, abre: 14, ancho: 0.9, sonr: -0.3 }),
    mira: E({ mx: 0.6, my: -0.9, c: 0, iris: 1.05, sd: 20, gd: 0.1, si: 20, gi: 0.1, orig: 0, abre: 22, ancho: 0.62, sonr: 0.15, lengua: 0.2 }),
    alivio: E({ mx: 0.3, my: 0, c: 0.7, h: 1, sd: 12, gd: 0.12, si: 12, gi: 0.12, orig: 0, abre: 8, ancho: 1.05, sonr: 0.72 }),
    contento2: E({ mx: 0.5, my: 0, c: 0.55, h: 1, sd: 8, gd: 0.1, si: 8, gi: 0.1, orig: 0, sonr: 0.6, ancho: 1 }),
    resignado: E({ mx: -0.85, my: -0.15, c: 0.55, sd: -4, gd: 0.2, si: -4, gi: 0.2, orig: 0, sonr: -0.3, ancho: 0.62 })
  };
  const GUION_CARA = [
    [T.contento, T.contento + 0.5, "contento"], [T.hic1 + 0.32, T.hic1 + 0.6, "sorpresa"], [T.hic2 + 0.3, T.hic2 + 0.55, "molesto"],
    [T.harto, T.harto + 0.3, "harto"], [T.decide, T.decide + 0.3, "decide"], [T.inhala0, T.inhala0 + 0.3, "inhala"],
    [T.inhala1 - 0.04, T.inhala1 + 0.16, "aguanta"], [T.alarma, T.alarma + 0.08, "alarma"], [T.despega, T.despega + 0.08, "gigante"],
    [T.caida, T.caida + 0.18, "cae"], [T.aterriza - 0.01, T.aterriza + 0.06, "aterriza"], [T.mira, T.mira + 0.3, "mira"],
    [T.alivio, T.alivio + 0.4, "alivio"], [T.bolsillos, T.bolsillos + 0.4, "contento2"], [T.resignado, T.resignado + 0.5, "resignado"]
  ];
  function expresion(t, b) {
    let e = CARAS.inicio;
    for (const [t0, t1, nom] of GUION_CARA) { if (t <= t0) break; e = mezclaE(e, CARAS[nom], suave(fase(t, t0, t1))); }
    if (b.cara > 0.001) e = mezclaE(e, CARAS.hipo, b.cara);
    if (b.casi > 0.001) e = mezclaE(e, CARAS.casi, b.casi);
    return Object.assign({}, e);
  }
  function parpadeos(t) {
    let o = 0;
    for (const tb of [2.2, 4.6, 9.95, 12.2]) { const k = fase(t, tb, tb + 0.14); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); }
    return o;
  }
  // Abre un ojo para espiar a cámara mientras aguanta.
  const espia = t => tramo(t, T.espia0, T.espia0 + 0.12) * (1 - tramo(t, T.espia1 - 0.12, T.espia1));

  /* ---------- piel: rojo, morado, carrillos y sudor (capa de la cara) ---------- */
  const PZC = G.A.datos.piezas.cabeza, OJO_D = PZC.ojos.derecho, OJO_I = PZC.ojos.izquierdo;
  // Contorno de la piel del retrato (cara, orejas y cuello del retrato), en coordenadas del retrato.
  const PIEL_CAB = [[806,850],[802,846],[766,842],[754,834],[746,834],[742,838],[734,826],[726,826],[718,814],[710,814],[704,808],[708,804],[702,798],[698,802],[690,798],[684,792],[682,782],[674,782],[662,774],[656,768],[660,764],[654,758],[650,762],[634,746],[630,746],[624,740],[624,732],[604,716],[608,712],[604,708],[604,692],[596,684],[596,668],[582,670],[570,654],[566,658],[556,648],[560,640],[558,638],[554,642],[544,632],[548,624],[532,604],[532,596],[528,592],[528,572],[532,568],[528,564],[532,560],[528,552],[540,536],[540,528],[548,516],[562,503],[570,499],[590,499],[624,532],[624,540],[630,550],[636,536],[632,532],[640,524],[640,516],[648,501],[676,477],[676,469],[684,461],[680,457],[690,447],[718,435],[734,423],[744,429],[728,461],[730,467],[762,451],[798,427],[806,431],[823,431],[839,443],[843,439],[851,439],[867,455],[875,455],[881,461],[869,481],[841,509],[843,511],[879,503],[903,487],[911,487],[917,493],[901,524],[893,532],[895,534],[931,514],[947,499],[955,503],[969,520],[965,596],[949,620],[953,624],[937,644],[937,652],[925,676],[909,732],[899,738],[877,764],[885,772],[875,782],[867,778],[861,788],[849,796],[825,832],[829,836],[819,846],[815,842]];
  // Cuello del torso (coordenadas de la hoja).
  const PIEL_CUELLO = [[269,321],[254,318],[252,316],[250,318],[216,304],[212,299],[197,292],[175,270],[178,264],[188,259],[196,251],[196,246],[203,234],[203,229],[209,223],[219,233],[228,237],[243,249],[257,254],[266,266],[283,264],[287,267],[282,286],[291,296],[291,308],[294,310],[281,318],[271,318]];
  const OREJA = { x: 562, y: 586 };
  const TINTA = "#0b0a0e";
  const PIEL = [254, 181, 116], PIEL_ROJA = [253, 127, 86];
  const MUL_ROJO = "rgb(255,179,190)";                 // piel × esto = piel roja de la cabeza roja del atlas
  const MORADO = "#7436bd", MORADO_MUL = "rgb(192,170,232)";
  const camino = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
  const colorPiel = k => `rgb(${PIEL.map((v, i) => Math.round(lerp(v, PIEL_ROJA[i], k))).join(",")})`;

  function caminoMoflete(g, k) {
    g.moveTo(912, 676); g.bezierCurveTo(912 + 40 * k, 690, 900 + 46 * k, 760, 858, 792); g.lineTo(840, 760); g.lineTo(890, 690); g.closePath();
  }
  function carrillos(g, k, rojo) {
    if (k <= 0.01) return;
    g.save(); g.lineJoin = "round"; g.lineCap = "round"; g.globalAlpha = clamp(k / 0.3);      // aparece sin saltos
    g.beginPath(); caminoMoflete(g, k); g.fillStyle = colorPiel(rojo); g.fill();
    g.beginPath(); g.moveTo(912, 676); g.bezierCurveTo(912 + 40 * k, 690, 900 + 46 * k, 760, 858, 792); g.lineWidth = 7; g.strokeStyle = TINTA; g.stroke();
    // carrillo cercano: brillo redondo y pliegue junto a la comisura
    const a = clamp(k);
    g.globalAlpha = 0.5 * a; g.fillStyle = "#fff1dc";
    g.beginPath(); g.ellipse(706, 664, 20 + 12 * k, 13 + 7 * k, -0.35, 0, Math.PI * 2); g.fill();
    g.globalAlpha = a; g.strokeStyle = TINTA; g.lineWidth = 4.5;
    g.beginPath(); g.moveTo(744, 694 - 4 * k); g.quadraticCurveTo(756 - 4 * k, 716, 748, 742 + 3 * k); g.stroke();
    g.restore();
  }
  function tinte(g, alfa, color, modo) { g.globalAlpha = alfa; g.globalCompositeOperation = modo; g.fillStyle = color; }
  function morado(g, k, relleno) {        // tono morado conservando sombras y trazo
    tinte(g, k, MORADO, "color"); relleno();
    tinte(g, k, MORADO_MUL, "multiply"); relleno();
  }
  function sudor(g, k, t) {               // gotas que resbalan por la sien y la frente (encima del tinte)
    if (k <= 0.01) return;
    g.save(); g.lineWidth = 4; g.strokeStyle = "#1d3b52";
    [[640, 470, 0], [915, 520, 0.37], [700, 430, 0.71]].forEach(([x, y, d], i) => {
      const ph = ((t * 0.55 + d) % 1), aparece = clamp(k * 3 - i);
      if (aparece <= 0) return;
      const yy = y + ph * 70, s = 13 * aparece * (1 - 0.3 * ph);
      g.globalAlpha = Math.sin(Math.PI * ph) * aparece;
      g.beginPath(); g.moveTo(x, yy - s * 1.6); g.quadraticCurveTo(x + s, yy, x, yy + s); g.quadraticCurveTo(x - s, yy, x, yy - s * 1.6);
      g.fillStyle = "#bfe8ff"; g.fill(); g.stroke();
      g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x - s * 0.3, yy - s * 0.1, s * 0.22, s * 0.35, 0, 0, Math.PI * 2); g.fill();
    });
    g.restore();
  }
  function capaCara(g, t, est) {
    carrillos(g, est.mof, est.rojo);
    const kR = est.rojo, kM = est.morado;
    if (kM > 0.004) {
      g.save();
      g.beginPath(); camino(g, PIEL_CAB); if (est.mof > 0.01) caminoMoflete(g, est.mof); g.clip();
      g.beginPath(); g.rect(380, 100, 900, 900); camino(g, OJO_D); camino(g, OJO_I);
      morado(g, kM, () => g.fill("evenodd"));
      g.restore();
    }
    // Los párpados son del color de piel normal: dentro de los ojos el tinte va según lo cerrados que estén.
    for (const [ojo, c] of [[OJO_D, est.cd], [OJO_I, est.ci]]) {
      const cc = Math.pow(clamp((c - 0.5) / 0.5), 2), a = kR * cc, b = kM * cc;
      if (a < 0.004 && b < 0.004) continue;
      g.save(); g.beginPath(); camino(g, ojo); g.clip();
      const r = () => g.fillRect(700, 520, 260, 140);
      if (a >= 0.004) { tinte(g, a, MUL_ROJO, "multiply"); r(); }
      if (b >= 0.004) morado(g, b, r);
      g.restore();
    }
    sudor(g, est.sudor, t);
  }
  function capaCuello(g, est) {
    const kR = est.rojo, kM = est.morado;
    if (kR < 0.004 && kM < 0.004) return;
    g.save(); g.beginPath(); camino(g, PIEL_CUELLO); g.clip();
    const r = () => g.fillRect(160, 210, 150, 120);
    if (kR >= 0.004) { tinte(g, kR, MUL_ROJO, "multiply"); r(); }
    if (kM >= 0.004) morado(g, kM, r);
    g.restore();
  }

  /* ---------- pose ---------- */
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLSILLO_C = punoDesde({ x: 131, y: 652 }, 0, -1.75), BOLSILLO_L = punoDesde({ x: 372, y: 648 }, 0, -1.75);

  function pose(t) {
    const b = postura(t), h = botes(t);
    const aguanta = tramo(t, T.inhala1, T.inhala1 + 0.3) * (1 - tramo(t, T.despega, T.despega + 0.3));
    const respira = Math.sin(t * 2.3) * (1 - aguanta);
    // temblor de aguantar (cada vez más fuerte) y empujón de los hipidos ahogados
    const tiembla = 2.4 * tramo(t, T.rojo0, T.agacha) * (1 - tramo(t, T.agacha, T.despega));
    const casi = h.casi;
    const p = {
      x: XG + b.dx + ruido(t * 28) * tiembla, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 - h.J / S + ruido(t * 31 + 5) * tiembla * 1.2 },
      torso: b.torso + ruido(t * 26 + 2) * 0.006 * tiembla,
      torsoEsc: { x: b.ex * (1 + 0.02 * casi + 0.03 * h.aterriza), y: b.ey * (1 + respira * 0.004 + 0.028 * h.cara + 0.03 * casi - 0.06 * h.aterriza) },
      piernas: {}, cabeza: { ang: b.cab + ruido(t * 24 + 7) * 0.012 * tiembla, dx: 0, dy: -10 * h.cara - 8 * casi, esc: { x: 1 + 0.03 * casi, y: 1 - 0.02 * casi } }, cara: null,
      ikContinuo: true
    };
    for (const lado of ["cerca", "lejos"]) {
      const f = pie(lado, t);
      p.piernas[lado] = { tob: { x: G.PELVIS.x + (f.x - p.x) / S, y: f.y - h.F / S }, ang: f.ang + 0.12 * clamp(h.F / 12) + 0.35 * clamp(h.tuck / TUCK) };
    }
    // cara
    const e = expresion(t, h);
    const pk = espia(t);
    e.mx = lerp(e.mx, -0.85, pk); e.my = lerp(e.my, -0.2, pk);
    const parp = parpadeos(t);
    const cd = Math.max(lerp(e.c, 0.12, pk * 0.9), parp), ci = Math.max(e.c, parp);
    p.cara = { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: 0, ojos: { d: cd, i: ci, feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd + 10 * pk, giro: e.gd + 0.15 * pk }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: 0, rubor: 0, bigote: 0 };
    const rojo = tramo(t, T.rojo0, T.rojo0 + 1.0) * (1 - tramo(t, T.despega + 0.15, T.aterriza + 0.35));
    const mor = tramo(t, T.morado0, T.morado0 + 1.0) * (1 - tramo(t, T.despega + 0.05, T.despega + 0.45));
    p.rojo = rojo; p.cara.rubor = 0.7 * rojo;
    const est = { mof: e.mof, rojo, morado: mor, cd, ci,
      sudor: tramo(t, T.rojo0 + 0.3, T.morado0 + 0.4) * (1 - tramo(t, T.aterriza + 0.2, T.aterriza + 0.8)) };
    p.capaCabeza = (g, tt) => capaCara(g, tt, est);
    p.capaTronco = g => capaCuello(g, est);
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    const enBolsC = 1 - clamp(b.cp * 1.5), enBolsL = 1 - clamp(b.lp * 1.5);
    let c = { x: hc.x + b.cx, y: hc.y + b.cy }, l = { x: hl.x + b.lx, y: hl.y + b.ly };
    c = mezcla(c, Tr(BOLSILLO_C), enBolsC * (1 - b.cp)); l = mezcla(l, Tr(BOLSILLO_L), enBolsL * (1 - b.lp));
    // puños temblando de aguantar
    c.x += ruido(t * 33 + 1) * tiembla * 2.5; l.x += ruido(t * 35 + 4) * tiembla * 2.5;
    // palmaditas en el pecho
    const pal = campana(t, T.palmada1, T.palmada1 + 0.18) + campana(t, T.palmada2, T.palmada2 + 0.18);
    c.x += 34 * pal; c.y -= 10 * pal;
    p.manoCerca = { x: c.x, y: c.y, ang: b.ca, mu: b.cmu, dobla: -1, puno: b.cp };
    p.manoLejos = { x: l.x, y: l.y, ang: b.la, mu: b.lmu, dobla: -1, puno: b.lp };
    p.__b = h;
    p.tirasLimpias = true;               // rodillas y codos sin dientes de sierra
    return p;
  }

  /* ---------- pompas ---------- */
  const DESPEGA_POMPA = 0.16;
  const bocaPantalla = p => {
    const H = G.cabeza(p), m = G.aPantalla(p, H.a({ x: 806, y: 736 })), a = H.ang - 0.3;
    return { x: m.x, y: m.y, dx: Math.cos(a), dy: Math.sin(a) };
  };
  const cacheBoca = new Map();
  function bocaEn(t) { const k = Math.round(t * 1000); if (!cacheBoca.has(k)) cacheBoca.set(k, bocaPantalla(pose(t))); return cacheBoca.get(k); }
  function dibPompa(g, x, y, r, a, def) {
    if (r < 0.5 || a <= 0.01) return;
    g.save(); g.translate(x, y); g.scale(1 + def, 1 - def); g.globalAlpha = a;
    const gr = g.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    gr.addColorStop(0, "rgba(255,255,255,0.06)"); gr.addColorStop(0.72, "rgba(185,232,255,0.14)"); gr.addColorStop(1, "rgba(214,190,255,0.5)");
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
    g.lineWidth = Math.max(1.6, r * 0.06); g.strokeStyle = "rgba(20,38,62,0.8)"; g.stroke();
    g.lineCap = "round"; g.lineWidth = Math.max(1.2, r * 0.09);
    g.strokeStyle = "rgba(255,140,215,0.6)"; g.beginPath(); g.arc(0, 0, r * 0.8, 0.25, 1.45); g.stroke();
    g.strokeStyle = "rgba(110,228,255,0.65)"; g.beginPath(); g.arc(0, 0, r * 0.8, 1.65, 2.55); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.92)"; g.beginPath(); g.ellipse(-r * 0.38, -r * 0.4, r * 0.25, r * 0.14, -0.7, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(r * 0.42, r * 0.36, r * 0.08, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function estalla(g, x, y, r, k) {        // la pompa revienta: rayitas y gotitas
    if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k; g.lineCap = "round"; g.strokeStyle = "#e9f8ff"; g.lineWidth = 2.2;
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2 + 0.2, r0 = r * (0.9 + 0.7 * salida(k)), r1 = r0 + r * 0.55 * (1 - k) + 3;
      g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke();
    }
    g.fillStyle = "#bfe8ff";
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.6, d = r * (1 + 1.1 * salida(k)); g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d + 14 * k * k, 2, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // Pompa de un hipido: crece pegada a la boca, se suelta, sube haciendo eses y revienta.
  function pompaHipo(g, t, h, i) {
    const u = t - h.t - 0.05; if (u <= 0 || u > h.vida + 0.2) return;
    const crece = salida(fase(u, 0, DESPEGA_POMPA));
    let x, y;
    if (u < DESPEGA_POMPA) { const m = bocaEn(t); x = m.x + m.dx * h.r * crece * 0.95; y = m.y + m.dy * h.r * crece * 0.95; }
    else {
      const m = bocaEn(h.t + 0.05 + DESPEGA_POMPA), x0 = m.x + m.dx * h.r * 0.95, y0 = m.y + m.dy * h.r * 0.95, v = u - DESPEGA_POMPA;
      x = x0 + h.vx * v + 7 * Math.sin(v * 5 + i) * clamp(v * 3); y = y0 - 46 * v - 20 * v * v;
    }
    const def = 0.06 * Math.sin(u * 17 + i) * (1 - fase(u, 0, 0.8) * 0.5);
    if (u < h.vida) dibPompa(g, x, y, h.r * crece * (1 + 0.12 * tramo(u, h.vida - 0.06, h.vida)), 1, def);
    else estalla(g, x, y, h.r, fase(u, h.vida, h.vida + 0.2));
  }
  // La pompa gigante: sale con el último hipido y se va volando hacia arriba hasta salir de escena.
  const POMPA_G = { t: T.despega + 0.03, r: 58, crece: 0.32, dir: -0.05 };
  function pompaGigante(g, t) {
    const u = t - POMPA_G.t; if (u <= 0) return;
    const crece = salida(fase(u, 0, POMPA_G.crece));
    let x, y;
    const sale = m => ({ x: m.x + Math.cos(POMPA_G.dir) * POMPA_G.r * 0.98, y: m.y + Math.sin(POMPA_G.dir) * POMPA_G.r * 0.98 });   // de lado: no tapa la cara
    if (u < POMPA_G.crece) { const m = bocaEn(t), q = sale(m); x = lerp(m.x, q.x, crece); y = lerp(m.y, q.y, crece); }
    else {
      const q = sale(bocaEn(POMPA_G.t + POMPA_G.crece)), v = u - POMPA_G.crece;
      x = q.x + 34 * v - 4 * v * v + 12 * Math.sin(v * 2.4) * clamp(v * 2);
      y = q.y - 46 * v - 14 * v * v;
      if (y < -120) return;
    }
    dibPompa(g, x, y, POMPA_G.r * crece, 1, 0.07 * Math.sin(u * 7) * (0.4 + 0.6 * Math.exp(-u)));
  }

  /* ---------- vapor por la oreja ---------- */
  const cacheOreja = new Map();
  function orejaEn(te, i) { if (!cacheOreja.has(i)) { const q = pose(te); cacheOreja.set(i, G.aPantalla(q, G.cabeza(q).a(OREJA))); } return cacheOreja.get(i); }
  function vapor(g, t) {
    if (t < T.vapor0 || t > T.despega + 0.9) return;
    g.save();
    for (let i = 0; i < 9; i++) {
      const te = T.vapor0 + i * 0.13; if (te > T.despega - 0.02) break;
      const u = (t - te) / 0.72; if (u <= 0 || u >= 1) continue;
      const o = orejaEn(te, i), x = o.x - 26 * u - 10 * hash(i + 70) * u, y = o.y - 34 * u - 12 * u * u, r = 4 + 11 * salida(u);
      g.globalAlpha = 0.85 * Math.sin(Math.PI * Math.min(1, u * 1.6)) * (1 - u);
      g.fillStyle = "#f4f1f6"; g.strokeStyle = "rgba(60,50,80,0.55)"; g.lineWidth = 1.5;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.arc(x - r * 0.8, y + r * 0.3, r * 0.65, 0, Math.PI * 2); g.arc(x + r * 0.6, y + r * 0.4, r * 0.55, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
  }

  /* ---------- decorado: taberna de azulejos ---------- */
  const ZOC0 = 330, ZOC1 = 452, MESA = { x: 790, y: 390 };
  let fondo = null;
  function botella(g, x, base, alto, ancho, color, tapon) {
    const hombro = base - alto * 0.62, cuello = base - alto;
    g.beginPath(); g.moveTo(x - ancho / 2, base); g.lineTo(x - ancho / 2, hombro); g.quadraticCurveTo(x - ancho / 2, hombro - ancho * 0.55, x - ancho * 0.16, hombro - ancho * 0.75);
    g.lineTo(x - ancho * 0.16, cuello); g.lineTo(x + ancho * 0.16, cuello); g.lineTo(x + ancho * 0.16, hombro - ancho * 0.75);
    g.quadraticCurveTo(x + ancho / 2, hombro - ancho * 0.55, x + ancho / 2, hombro); g.lineTo(x + ancho / 2, base); g.closePath();
    g.fillStyle = color; g.fill(); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "rgba(255,248,230,0.82)"; g.fillRect(x - ancho / 2 + 3, base - alto * 0.5, ancho - 6, alto * 0.22); g.strokeRect(x - ancho / 2 + 3, base - alto * 0.5, ancho - 6, alto * 0.22);
    g.fillStyle = "rgba(255,255,255,0.45)"; g.fillRect(x - ancho / 2 + 4, hombro + 4, 3, alto * 0.5);
    g.fillStyle = tapon; g.fillRect(x - ancho * 0.2, cuello - 7, ancho * 0.4, 8); g.strokeRect(x - ancho * 0.2, cuello - 7, ancho * 0.4, 8);
  }
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60); g.lineJoin = "round"; g.lineCap = "round";
    // pared granate con papel pintado
    let gr = g.createLinearGradient(0, -60, 0, ZOC0); gr.addColorStop(0, "#1c0911"); gr.addColorStop(1, "#4f1727");
    g.fillStyle = gr; g.fillRect(-40, -60, W + 80, ZOC0 + 60);
    g.fillStyle = "rgba(255,196,120,0.07)";
    for (let y = -44, f = 0; y < ZOC0 - 8; y += 34, f++) for (let x = -40 + (f % 2) * 22; x < W + 40; x += 44) {
      g.beginPath(); g.moveTo(x, y - 9); g.lineTo(x + 6, y); g.lineTo(x, y + 9); g.lineTo(x - 6, y); g.closePath(); g.fill();
    }
    // luz cálida detrás de Guillermo
    gr = g.createRadialGradient(450, 250, 30, 450, 250, 440); gr.addColorStop(0, "rgba(255,170,110,0.32)"); gr.addColorStop(0.55, "rgba(220,110,90,0.12)"); gr.addColorStop(1, "rgba(200,90,80,0)");
    g.fillStyle = gr; g.fillRect(-40, -60, W + 80, ZOC1 + 60);
    // apliques de pared
    for (const lx of [262, 612]) {
      const h = g.createRadialGradient(lx, 112, 4, lx, 112, 120); h.addColorStop(0, "rgba(255,214,140,0.55)"); h.addColorStop(1, "rgba(255,190,110,0)");
      g.fillStyle = h; g.beginPath(); g.arc(lx, 112, 120, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#8a6a2a"; g.strokeStyle = TINTA; g.lineWidth = 2.5;
      g.beginPath(); g.rect(lx - 7, 128, 14, 22); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(lx - 22, 128); g.lineTo(lx + 22, 128); g.lineTo(lx + 14, 98); g.lineTo(lx - 14, 98); g.closePath();
      g.fillStyle = "#f3d68e"; g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.5)"; g.fillRect(lx - 9, 102, 4, 22);
    }
    // diana con dos dardos
    const dx = 118, dy = 196;
    g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.arc(dx + 5, dy + 6, 60, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#151417"; g.beginPath(); g.arc(dx, dy, 58, 0, Math.PI * 2); g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    for (let i = 0; i < 20; i++) {
      const a0 = (i - 0.5) / 20 * Math.PI * 2 - Math.PI / 2, a1 = (i + 0.5) / 20 * Math.PI * 2 - Math.PI / 2;
      g.fillStyle = i % 2 ? "#efe3c4" : "#1d1b1e"; g.beginPath(); g.moveTo(dx, dy); g.arc(dx, dy, 46, a0, a1); g.closePath(); g.fill();
      for (const [r0, r1] of [[42, 46], [25, 28]]) { g.fillStyle = i % 2 ? "#2f8a45" : "#c8262e"; g.beginPath(); g.arc(dx, dy, r1, a0, a1); g.arc(dx, dy, r0, a1, a0, true); g.closePath(); g.fill(); }
    }
    g.fillStyle = "#2f8a45"; g.beginPath(); g.arc(dx, dy, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = "#c8262e"; g.beginPath(); g.arc(dx, dy, 3.5, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(200,200,200,0.5)"; g.lineWidth = 1; g.beginPath(); g.arc(dx, dy, 46, 0, Math.PI * 2); g.stroke();
    for (const [x, y, a] of [[dx + 12, dy - 8, -0.5], [dx - 20, dy + 16, -0.2]]) {
      g.save(); g.translate(x, y); g.rotate(a); g.strokeStyle = TINTA; g.lineWidth = 2;
      g.fillStyle = "#c9ced6"; g.fillRect(0, -2, 20, 4); g.strokeRect(0, -2, 20, 4);
      g.fillStyle = "#f5aa1d"; g.beginPath(); g.moveTo(20, 0); g.lineTo(32, -8); g.lineTo(36, -8); g.lineTo(30, 0); g.lineTo(36, 8); g.lineTo(32, 8); g.closePath(); g.fill(); g.stroke();
      g.restore();
    }
    // estante con botellas encima de la mesa
    g.fillStyle = "rgba(0,0,0,0.3)"; g.fillRect(628, 212, 340, 8);
    const bot = [[650, 78, 26, "#2f7d3a", "#c8262e"], [690, 92, 24, "#b8641a", "#e8c25a"], [730, 70, 30, "rgba(200,232,242,0.75)", "#3a3a44"],
                 [772, 96, 22, "#6d1020", "#e8c25a"], [812, 74, 28, "#2a5d9c", "#c9ced6"], [852, 88, 24, "#1e5a2e", "#c8262e"], [894, 80, 26, "#d99a2b", "#3a3a44"], [934, 66, 30, "#7a2e66", "#e8c25a"]];
    for (const [x, alto, ancho, col, tap] of bot) botella(g, x, 198, alto, ancho, col, tap);
    g.fillStyle = "#6e4327"; g.strokeStyle = TINTA; g.lineWidth = 3; g.beginPath(); g.rect(624, 198, 346, 12); g.fill(); g.stroke();
    g.fillStyle = "#9a6038"; g.fillRect(626, 199, 342, 3);
    for (const bx of [650, 940]) { g.fillStyle = "#3a2416"; g.beginPath(); g.moveTo(bx - 4, 210); g.lineTo(bx + 4, 210); g.lineTo(bx + 4, 236); g.lineTo(bx - 4, 222); g.closePath(); g.fill(); g.stroke(); }
    // zócalo de azulejos azules
    const TL = 38;
    for (let y = ZOC0 + 6; y < ZOC1; y += TL) for (let x = -40; x < W + 40; x += TL) {
      g.fillStyle = "#e7dfca"; g.fillRect(x, y, TL, TL);
      const cx = x + TL / 2, cy = y + TL / 2;
      g.fillStyle = "#3a6db0"; for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; g.beginPath(); g.ellipse(cx + Math.cos(a) * 9, cy + Math.sin(a) * 9, 6, 3.4, a, 0, Math.PI * 2); g.fill(); }
      g.strokeStyle = "#2a5592"; g.lineWidth = 2.2; g.beginPath(); g.arc(cx, cy, 5, 0, Math.PI * 2); g.stroke();
      g.fillStyle = "#d9a22a"; g.beginPath(); g.arc(cx, cy, 2.2, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#2a5592"; for (const [ux, uy] of [[x, y], [x + TL, y], [x, y + TL], [x + TL, y + TL]]) { g.beginPath(); g.arc(ux, uy, 6, 0, Math.PI * 2); g.fill(); }
      g.strokeStyle = "rgba(60,50,40,0.35)"; g.lineWidth = 1.5; g.strokeRect(x, y, TL, TL);
    }
    gr = g.createLinearGradient(0, ZOC0, 0, ZOC1); gr.addColorStop(0, "rgba(40,12,24,0.38)"); gr.addColorStop(1, "rgba(30,10,18,0.55)");
    g.fillStyle = gr; g.fillRect(-40, ZOC0, W + 80, ZOC1 - ZOC0);
    g.fillStyle = "#1c3a3a"; g.fillRect(-40, ZOC0 - 4, W + 80, 11); g.fillStyle = "#3f7070"; g.fillRect(-40, ZOC0 - 4, W + 80, 3);
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(-40, ZOC0 + 7, W + 80, 4);
    // suelo ajedrezado en perspectiva
    const VY = 250, filas = [ZOC1, 465, 481, 501, 526, 558, 598, 650, 715];
    const colX = (x0, y) => 512 + (x0 - 512) * (y - VY) / (ZOC1 - VY);
    for (let i = 0; i < filas.length - 1; i++) for (let j = -16; j < 34; j++) {
      const xa = j * 56 - 8, xb = xa + 56, y0 = filas[i], y1 = filas[i + 1];
      g.fillStyle = (i + j) % 2 ? "#5d4537" : "#3a2a21";
      g.beginPath(); g.moveTo(colX(xa, y0), y0); g.lineTo(colX(xb, y0), y0); g.lineTo(colX(xb, y1), y1); g.lineTo(colX(xa, y1), y1); g.closePath(); g.fill();
    }
    gr = g.createLinearGradient(0, ZOC1, 0, ZOC1 + 14); gr.addColorStop(0, "rgba(0,0,0,0.5)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(-40, ZOC1, W + 80, 14);
    gr = g.createRadialGradient(450, SUELO, 20, 450, SUELO, 330); gr.addColorStop(0, "rgba(255,190,130,0.28)"); gr.addColorStop(1, "rgba(255,170,110,0)");
    g.fillStyle = gr; g.fillRect(-40, ZOC1, W + 80, H + 60 - ZOC1);
    // mesa alta
    g.fillStyle = "rgba(0,0,0,0.38)"; g.beginPath(); g.ellipse(MESA.x + 6, 551, 66, 10, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#26252b"; g.strokeStyle = TINTA; g.lineWidth = 3;
    g.beginPath(); g.ellipse(MESA.x, 547, 48, 9, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.rect(MESA.x - 7, MESA.y + 8, 14, 547 - MESA.y - 8); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(MESA.x - 4, MESA.y + 12, 3, 547 - MESA.y - 18);
    g.fillStyle = "#3b2416"; g.beginPath(); g.ellipse(MESA.x, MESA.y + 7, 80, 13, 0, 0, Math.PI); g.lineTo(MESA.x - 80, MESA.y); g.ellipse(MESA.x, MESA.y, 80, 13, 0, Math.PI, 0, true); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#7a4a2a"; g.beginPath(); g.ellipse(MESA.x, MESA.y, 80, 13, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,220,170,0.25)"; g.beginPath(); g.ellipse(MESA.x - 22, MESA.y - 3, 34, 5, -0.05, 0, Math.PI * 2); g.fill();
    // viñeta
    gr = g.createRadialGradient(480, 300, 280, 480, 300, 700); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,0.6)");
    g.fillStyle = gr; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }
  // Pinta vacía (con restos de espuma) sobre la mesa: da un saltito cuando Guillermo aterriza.
  function pinta(g, t) {
    const v = t - T.aterriza;
    let dy = 0, rot = 0;
    if (v > 0.02 && v < 0.9) { const k = fase(v, 0.02, 0.3); dy = -15 * Math.sin(Math.PI * k); rot = 0.14 * Math.sin((v - 0.02) * 26) * Math.exp(-(v - 0.02) * 7); }
    const x = MESA.x + 14, y = MESA.y + 2;
    g.save(); g.translate(x, y + dy); g.rotate(rot); g.lineJoin = "round";
    const forma = () => { g.beginPath(); g.moveTo(-17, -74); g.lineTo(17, -74); g.lineTo(13, -4); g.quadraticCurveTo(13, 0, 9, 0); g.lineTo(-9, 0); g.quadraticCurveTo(-13, 0, -13, -4); g.closePath(); };
    forma(); g.fillStyle = "rgba(214,236,255,0.28)"; g.fill();
    g.save(); forma(); g.clip();
    g.fillStyle = "rgba(255,246,225,0.85)";
    for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(-8 + hash(i + 30) * 16, -60 + hash(i + 31) * 44, 5, 2.2, 0.2, 0, Math.PI * 2); g.fill(); }
    g.fillRect(-17, -10, 34, 10);
    g.fillStyle = "rgba(255,255,255,0.7)"; g.fillRect(-11, -66, 3, 56);
    g.restore();
    forma(); g.lineWidth = 2.6; g.strokeStyle = TINTA; g.stroke();
    g.restore();
    // sombra en la mesa
    g.fillStyle = `rgba(0,0,0,${0.3 * (1 + dy / 30)})`; g.beginPath(); g.ellipse(x, MESA.y + 2, 16 + dy * 0.3, 3, 0, 0, Math.PI * 2); g.fill();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const cerca = tramo(t, T.inhala0, T.inhala1 + 0.9) * (1 - tramo(t, T.agacha - 0.04, T.despega + 0.16));
    const vuela = tramo(t, T.despega - 0.05, T.cima) * (1 - tramo(t, T.caida + 0.05, T.aterriza + 0.12));
    return { k: 1 + 0.15 * cerca, x: lerp(512, XG + 12, cerca), y: lerp(300, 315, cerca) - 40 * vuela };
  }

  class GuillermoHipo extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo()) return;
      if (!fondo) fondo = creaFondo();
      const p = pose(t), h = p.__b;
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = t >= T.aterriza ? 7 * Math.exp(-(t - T.aterriza) * 7) : 0;
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb * 0.5, ruido(t * 45 + 13) * tb);
      g.drawImage(fondo, -40, -60);
      pinta(g, t);
      // sombra (se encoge cuando está en el aire)
      const alto = clamp(h.J / H_SALTO);
      g.fillStyle = `rgba(0,0,0,${0.4 - 0.18 * alto})`; g.beginPath(); g.ellipse(p.x + 8, SUELO + 1, 112 * (1 - 0.35 * alto), 10 * (1 - 0.3 * alto), 0, 0, Math.PI * 2); g.fill();
      vapor(g, t);
      G.dibujar(g, p, t);
      HIPOS.forEach((hh, i) => pompaHipo(g, t, hh, i));
      pompaGigante(g, t);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00006", nombre: "Guillermo y el hipo", crear: () => new GuillermoHipo() });
  window.__A2D_00006 = { pose, T, DUR };
})();
