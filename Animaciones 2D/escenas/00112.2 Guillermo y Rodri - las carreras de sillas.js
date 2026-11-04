"use strict";
/* 00112.2 · Guillermo y Rodri · Las sillas de bar
 *
 * Negro → el bar de noche, con la pista despejada: pared granate con zócalo de madera, una gramola
 * con tubos de colores que suena (notas a 120 pulsaciones), un neón con una copa y una estrella,
 * discos enmarcados, la barra con sus grifos y un foco que cae sobre dos taburetes giratorios de
 * asiento rojo en el centro. Guillermo y Rodri, uno a cada lado, cabecean al ritmo → Rodri mira a
 * cámara con cara de pillo, se agacha, agarra el taburete de su lado por el borde del asiento, lo
 * arrastra hacia sí y de un latigazo lo manda rodando por detrás de él hasta fuera de cuadro; se
 * sacude las manos y guiña un ojo. Guillermo levanta una ceja… y saca los puños: ¡vale! → las
 * sillas musicales: los dos dan una vuelta entera alrededor del único taburete, con pasos de baile
 * sigilosos a compás, vigilándose (uno pasa por delante del taburete y el otro por detrás) → la
 * gramola chirría (rayajo) y se calla: los dos se quedan congelados a media zancada, miran el
 * taburete, se miran… y se lanzan a la vez: en el aire se dan media vuelta y aterrizan de culo, cada
 * uno con media nalga en el asiento, espalda con espalda (¡pum!). Sonrisa de triunfo… y el
 * taburete empieza a girar: despacio, más deprisa, cada vez más, con los dos agarrados al asiento
 * y la cara desencajada → los escupe a cada lado: salen volando dando vueltas y caen sentados en el
 * suelo, mirando al taburete, entre polvo y estrellitas → el taburete sigue girando solo, frena… y
 * se para con su parche de estrella mirando a cámara. Los dos se despejan, miran el taburete vacío,
 * se miran y se parten de risa; Rodri guiña un ojo a cámara → negro.
 *
 * Sin textos. Los taburetes son atrezo de la escena. Los giros de los personajes son un aplastado
 * horizontal (la vuelta del taburete aplasta a los dos jinetes alrededor del eje del taburete; el
 * asiento es redondo y no se aplasta: giran sus costuras, sus botones y el parche). Los pies se
 * plantan en el suelo y se quedan quietos mientras el cuerpo avanza. Todo depende solo de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, mezcla, ruido, hash, campana } = M2;
  const G = Guillermo, RO = Rodri;
  const DUR = 14.45, TINTA = "#0b0a0e", TAU = Math.PI * 2;
  const BEAT = 0.5, BEAT0 = 0.5;

  const T = {
    sonrisa: 0.85, agarra0: 1.22, agarra1: 1.55, atras0: 1.55, atras1: 1.85, latigo: 1.85, suelta: 2.07,
    vuelve0: 2.12, vuelve1: 2.5, palmas0: 2.12, palmas1: 2.5, guinoR: 2.6,
    cejaG: 2.1, picaG: 2.55, punos0: 2.55, punos1: 2.85,
    c0: 3.0, stop: 8.2, mira1: 8.28, mira2: 8.42, baja: 8.5, agacha: 8.58, salta: 8.72, aterriza: 9.1,
    giro0: 9.45, suelta2: 11.0, suelo: 11.42, frena: 12.65,
    sacude0: 12.1, sacude1: 12.4, miraT: 12.5, miraO: 12.95, risa0: 13.12, risa1: 13.75, camG: 13.45, guino: 13.55, fin: 13.88
  };

  /* ---------- utilidades ---------- */
  const P = (x, y) => ({ x, y });
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function guion(lista, dic, base, t) {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const D5 = (pu, ix, md, an, me) => ({ pulgar: pu, indice: ix, medio: md ?? ix, anular: an ?? ix, menique: me ?? ix });
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const mezD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const PUNO = D5(0, 0), PALMA = D5(0.85, 1), JAZZ = D5(1, 1), AGARRA = D5(0.3, 0.12), FLOJA = D5(0.55, 0.6, 0.55, 0.5, 0.45), GARRA = D5(0.35, 0.3);

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0.15, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.2,
    lengua: 0, esp: 0, mof: 0, rub: 0, wd: 0, wi: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: clamp(e.mx, -1, 1), y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* =====================================================================================
   * ESCENARIO: el círculo de las sillas musicales
   * ===================================================================================== */
  const CX = 512, FY = 524, A_E = 182, B_E = 50, S0 = 0.29, DS = 0.02;
  const escDe = y => S0 + DS * (y - FY) / B_E;
  const posE = f => ({ x: CX + A_E * Math.cos(f), y: FY + B_E * Math.sin(f) });
  // avance de la vuelta (0…1) entre c0 y stop: arranca suave y se congela de golpe en stop
  const RAMPA = 0.45, AREA = (T.stop - T.c0) - 0.5 * RAMPA;
  function avance(t) {
    if (t <= T.c0) return 0;
    const tt = Math.min(t, T.stop) - T.c0;
    const a = tt < RAMPA ? RAMPA * (Math.pow(tt / RAMPA, 3) - Math.pow(tt / RAMPA, 4) / 2) : 0.5 * RAMPA + (tt - RAMPA);
    return a / AREA;
  }
  const FI0 = { g: Math.PI, r: 0 };
  const fiDe = (who, t) => FI0[who] + TAU * avance(t);
  // hacia dónde mira mientras da la vuelta (+1 derecha, −1 izquierda), con media vuelta aplastada antes de cada extremo
  const giroE = f => clamp(-Math.sin(f + 0.25) / 0.2, -1, 1);

  /* ---------- pies: plantas [t, x, y, lado, sw, alto] ---------- */
  const SW = 0.34, LEAD = 0.18, ALTO_PASO = 34;
  function pasosVuelta(who) {
    const L = [];
    for (let k = 0; k < 40; k++) {
      const tk = T.c0 + SW + BEAT * k; if (tk > T.stop + 0.8) break;
      const e = posE(fiDe(who, tk + LEAD));
      L.push({ t: tk, x: e.x, y: e.y + (k % 2 ? -3 : 3), lado: k % 2 ? "lejos" : "cerca", sw: SW, alto: ALTO_PASO });
    }
    return L;
  }
  // pies de pie (en reposo) respecto a la pelvis, en la dirección en que mira (px de pantalla con s = 0,29)
  const PIE_REPOSO = { cerca: -8, lejos: 16 };
  const X_G0 = posE(Math.PI).x, X_R0 = posE(0).x;
  const PIES_G = {
    ini: { cerca: P(X_G0 + PIE_REPOSO.cerca, FY + 3), lejos: P(X_G0 + PIE_REPOSO.lejos, FY - 3) },
    lista: pasosVuelta("g")
  };
  // Rodri: paso atrás arrastrando el taburete y vuelta a su sitio (mira a la izquierda: «atrás» es +x)
  const R_ATRAS = 26;
  const PIES_R = {
    ini: { cerca: P(X_R0 - PIE_REPOSO.cerca, FY + 3), lejos: P(X_R0 - PIE_REPOSO.lejos, FY - 3) },
    lista: [
      { t: 1.74, x: X_R0 - PIE_REPOSO.cerca + R_ATRAS + 6, y: FY + 3, lado: "cerca", sw: 0.2, alto: 14 },
      { t: 1.86, x: X_R0 - PIE_REPOSO.lejos + R_ATRAS, y: FY - 3, lado: "lejos", sw: 0.2, alto: 12 },
      { t: 2.3, x: X_R0 - PIE_REPOSO.lejos, y: FY - 3, lado: "lejos", sw: 0.2, alto: 12 },
      { t: 2.42, x: X_R0 - PIE_REPOSO.cerca, y: FY + 3, lado: "cerca", sw: 0.2, alto: 12 }
    ].concat(pasosVuelta("r"))
  };
  const ANG_PASO = u => 0.3 * Math.sin(Math.PI * u) - 0.08 * Math.sin(TAU * u);
  function pieDe(pies, lado, t) {
    let prev = pies.ini[lado];
    for (const e of pies.lista) {
      if (e.lado !== lado) continue;
      if (e.t <= t) { prev = e; continue; }
      const s0 = e.t - e.sw;
      if (t >= s0) { const u = (t - s0) / e.sw;
        return { x: lerp(prev.x, e.x, suave(u)), y: lerp(prev.y, e.y, suave(u)), h: e.alto * Math.sin(Math.PI * u), a: ANG_PASO(u) }; }
      break;
    }
    return { x: prev.x, y: prev.y, h: 0, a: 0 };
  }

  /* =====================================================================================
   * CUERPOS: pose común. Cada personaje se dibuja con p.espejo = false y un factor horizontal
   * fx (con signo) alrededor de su pelvis: −1 mira a la izquierda; |fx| < 1 es media vuelta.
   * ===================================================================================== */
  const R_MG = G.MUNECA_R * G.JK;
  const manoDesde = (m, mu) => P(m.x - Math.cos(mu) * R_MG, m.y - Math.sin(mu) * R_MG);
  const BOLS_GC = manoDesde(P(131, 652), -1.75), BOLS_GL = manoDesde(P(372, 648), -1.75);

  function poseBase(R, x, suelo, s) {
    const p = { x, suelo, s, tirasLimpias: true, pelvis: { x: R.PELVIS.x, y: R.PELVIS.y }, torso: 0, torsoEsc: { x: 1, y: 1 },
      piernas: {}, cabeza: { ang: 0, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    if (R === G) { p.hombrosContinuos = true; p.hombrosRecortados = true; }
    return p;
  }
  const kRig = (R, p) => p.s * R.K;
  // mundo (pantalla) → hoja, con el factor horizontal fx
  const aHojaF = (R, p, fx, q) => P(R.PELVIS.x + (q.x - p.x) / (kRig(R, p) * fx), R.SUELO + (q.y - p.suelo) / kRig(R, p));
  const aPantF = (R, p, fx, q) => P(p.x + (q.x - R.PELVIS.x) * kRig(R, p) * fx, p.suelo + (q.y - R.SUELO) * kRig(R, p));
  const pelvisPant = (R, p) => P(p.x, p.suelo + (p.pelvis.y - R.SUELO) * kRig(R, p));
  // pie del mundo → pierna en la hoja
  function piernaDe(R, p, fx, w, lado) {
    const k = kRig(R, p);
    // en la media vuelta (|fx| pequeño) el pie no se puede sacar del mundo: pisa bajo el cuerpo
    const enGiro = clamp(1 - (Math.abs(fx) - 0.25) / 0.45);
    const dxM = clamp((w.x - p.x) / (k * (Math.abs(fx) < 0.25 ? (fx < 0 ? -0.25 : 0.25) : fx)), -280, 280);
    const dx = lerp(dxM, lado === "cerca" ? -20 : 60, enGiro);
    const tob0 = R.SUELO - R.TOBILLO_ALTO - (lado === "lejos" ? 10 : 0);
    return { tob: P(R.PELVIS.x + dx, tob0 + (w.y - p.suelo) / k - w.h / k), ang: w.a };
  }
  // manos: punto de la hoja del tronco (sin inclinar) con mu relativo al tronco
  function manoT(R, p, q, mu, dedos, o = {}) {
    const m = R.tronco(p)(q);
    return { x: m.x, y: m.y, mu: mu + p.torso, ang: 0, puno: o.puno ?? 1, dedos, dobla: o.dobla, detras: o.detras };
  }
  function bolsillo(R, p, lado) {
    if (R.manoReposo) { const m = R.manoReposo(p, lado); return { x: m.x, y: m.y, mu: m.mu, ang: 0, puno: 0, dedos: FLOJA, dobla: lado === "cerca" ? -1 : 1 }; }
    const m = R.tronco(p)(lado === "cerca" ? BOLS_GC : BOLS_GL);
    return { x: m.x, y: m.y, mu: -1.75 + p.torso, ang: 0, puno: 0, dedos: FLOJA, dobla: lado === "cerca" ? -1 : 1 };
  }
  const mezMano = (a, b, k) => k <= 0 ? a : k >= 1 ? b : ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), mu: a.mu + Math.atan2(Math.sin(b.mu-a.mu), Math.cos(b.mu-a.mu))*k, ang: 0,
    puno: lerp(a.puno, b.puno, k), dedos: mezD(a.dedos, b.dedos, k), dobla: k < 0.5 ? a.dobla : b.dobla, detras: k < 0.5 ? a.detras : b.detras });

  /* ---------- la vuelta: andares de baile sigilosos ---------- */
  function andar(who, t) {
    const te = Math.min(t, T.stop);
    const f = fiDe(who, te), e = posE(f);
    const anda = tramo(t, T.c0, T.c0 + 0.3);
    const ph = (te - T.c0 - SW) / BEAT;
    const sw = Math.cos(Math.PI * ph);                 // ±1 en cada planta (alterna)
    const fr = ((ph % 1) + 1) % 1;
    return { x: e.x, y: e.y, fx: giroE(f), anda: anda * (t >= T.c0 ? 1 : 0), sw, fr };
  }

  /* =====================================================================================
   * EL VUELO: del sitio al asiento, el giro del taburete y el vuelo hasta el suelo
   * ===================================================================================== */
  const ASIENTO = 152;                 // altura del asiento (px, s = 0,29)
  const ALTURA_CADERA = 6, TORSO_SENTADO = 0.79;
  const RIDER = 28;                    // pelvis de cada uno respecto al eje del taburete
  const pelSentado = (R, s, alto) => R.SUELO - R.PELVIS.y - (alto + ALTURA_CADERA) / (s * R.K);
  // giro del taburete
  const P_GIRO = 1.55, VUELTAS = 3;
  const DUR_GIRO = T.suelta2 - T.giro0;
  const W_SUELTA = VUELTAS * TAU * P_GIRO / DUR_GIRO;     // rad/s al soltarlos
  const D_FRENA = T.frena - T.suelta2;
  const TH_SUELTA = VUELTAS * TAU, TH_FIN = TH_SUELTA + W_SUELTA * D_FRENA / 2;
  function thTaburete(t) {
    if (t < T.aterriza) return 0;
    if (t < T.giro0) { const tau = t - T.aterriza; return 0.12 * Math.sin(tau * 18) * Math.exp(-tau * 7) * (1 - tramo(t, T.giro0 - 0.12, T.giro0)); }
    if (t < T.suelta2) return TH_SUELTA * Math.pow(fase(t, T.giro0, T.suelta2), P_GIRO);
    if (t < T.frena) { const u = (t - T.suelta2) / D_FRENA; return TH_SUELTA + W_SUELTA * D_FRENA * (u - u * u / 2); }
    return TH_FIN;
  }
  const velTaburete = t => (thTaburete(t + 0.004) - thTaburete(t - 0.004)) / 0.008;
  // el parche de estrella acaba mirando a cámara (ángulo de la costura: π/2 = delante)
  const PARCHE = Math.PI / 2 - TH_FIN;
  const cedeAsiento = t => {
    const u = fase(t, T.aterriza, T.aterriza + 0.28);
    return Math.sin(Math.PI * u) ** 2 * Math.exp(-u);
  };
  // vuelo de los jinetes: hélice que sigue girando (1,5 vueltas) y aterriza mirando al taburete
  const D_VUELO = T.suelo - T.suelta2, A_H = W_SUELTA * D_VUELO / (3 * Math.PI);
  const helice = u => A_H * u + (3 - 2 * A_H) * u * u + (A_H - 2) * u * u * u;
  const thVuelo = t => TH_SUELTA + 3 * Math.PI * helice(fase(t, T.suelta2, T.suelo));
  // dónde caen
  const CAE = { g: { x: 292, y: 548 }, r: { x: 742, y: 516 } };

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  const CARAS_G = {
    inicio: E({ mx: 0.9, my: 0.05, c: 0.2, sonr: 0.35 }),
    ritmo: E({ mx: 0.9, my: 0.1, c: 0.35, h: 0.2, sonr: 0.45 }),
    ceja: E({ mx: 0.9, my: 0.05, c: 0.1, sd: 4, gd: -0.05, si: 22, gi: 0.14, abre: 0, ancho: 0.8, sonr: -0.05 }),
    pique: E({ mx: 0.9, my: 0, c: 0.5, sd: -6, gd: -0.18, si: -6, gi: -0.18, abre: 4, ancho: 1.05, sonr: 0.55 }),
    baile: E({ mx: 0.9, my: 0, c: 0.38, sd: 6, gd: -0.06, si: 6, gi: -0.06, abre: 2, ancho: 1, sonr: 0.6 }),
    helado: E({ mx: 0.9, my: 0, iris: 0.75, c: 0, sd: 24, gd: 0.12, si: 24, gi: 0.12, abre: 14, ancho: 0.62, sonr: -0.15 }),
    salta: E({ mx: 0.9, my: 0.1, c: 0.35, sd: -8, gd: -0.22, si: -8, gi: -0.22, abre: 30, ancho: 1.08, sonr: 0.2 }),
    triunfo: E({ mx: 0.5, my: 0, c: 1, h: 1, sd: 14, gd: 0.06, si: 14, gi: 0.06, abre: 10, ancho: 1.05, sonr: 0.95 }),
    duda: E({ mx: 0.9, my: 0.25, iris: 0.85, c: 0, sd: 18, gd: 0.1, si: 22, gi: 0.14, abre: 8, ancho: 0.55, sonr: -0.1 }),
    horror: E({ mx: 0, my: 0, iris: 0.7, c: 0, sd: 32, gd: 0.24, si: 32, gi: 0.24, abre: 42, ancho: 0.8, sonr: -0.55, lengua: 0.2 }),
    vuela: E({ mx: 0, my: 0, c: 1, z: 1, sd: 16, gd: 0.22, si: 16, gi: 0.22, abre: 40, ancho: 0.95, sonr: -0.5, lengua: 0.3 }),
    mareo: E({ mx: 0, my: 0, esp: 1, sd: 12, gd: 0.2, si: -6, gi: -0.1, abre: 16, ancho: 0.85, sonr: -0.1, lengua: 0.85 }),
    sacude: E({ mx: 0.4, my: 0, c: 0.85, z: 0.6, sd: 6, gd: 0.06, si: 6, gi: 0.06, abre: 4, ancho: 0.8, sonr: -0.2 }),
    taburete: E({ mx: 0.9, my: -0.35, c: 0.1, sd: 18, gd: 0.08, si: 18, gi: 0.08, abre: 8, ancho: 0.7, sonr: 0.05 }),
    otro: E({ mx: 0.9, my: 0.05, c: 0.15, sd: 14, gd: 0.06, si: 10, gi: 0.04, abre: 6, ancho: 0.85, sonr: 0.45 }),
    risa: E({ mx: 0.6, my: 0, c: 0.95, h: 1, sd: 16, gd: 0.08, si: 16, gi: 0.08, abre: 34, ancho: 1.05, sonr: 0.95 }),
    camara: E({ mx: -0.85, my: 0, c: 0.3, h: 0.4, sd: 12, gd: 0.06, si: 8, gi: 0.04, abre: 10, ancho: 1, sonr: 0.9 })
  };
  const GUION_CARA_G = [
    [0.5, 0.8, "ritmo"], [T.cejaG, T.cejaG + 0.15, "ceja"], [T.picaG, T.picaG + 0.2, "pique"], [T.c0 + 0.1, T.c0 + 0.4, "baile"],
    [T.stop, T.stop + 0.05, "helado"], [T.agacha, T.agacha + 0.1, "salta"], [T.aterriza + 0.02, T.aterriza + 0.12, "triunfo"],
    [T.giro0 + 0.12, T.giro0 + 0.3, "duda"], [T.giro0 + 0.55, T.giro0 + 0.75, "horror"], [T.suelta2, T.suelta2 + 0.06, "vuela"],
    [T.suelo + 0.04, T.suelo + 0.14, "mareo"], [T.sacude0, T.sacude0 + 0.08, "sacude"], [T.sacude1, T.miraT, "taburete"],
    [T.miraO, T.miraO + 0.15, "otro"], [T.risa0, T.risa0 + 0.12, "risa"], [T.camG, T.camG + 0.25, "camara"]
  ];
  const PARP_G = [0.35, 1.7, 3.4, 4.9, 6.3, 7.6, 9.4, 12.62, 13.95];

  /* =====================================================================================
   * RODRI (el flequillo le tapa las cejas: se expresa con ojos, boca y cabeza)
   * ===================================================================================== */
  const CARAS_R = {
    inicio: E({ mx: 0.9, my: 0.05, c: 0.25, sonr: 0.4 }),
    ritmo: E({ mx: 0.9, my: 0.1, c: 0.45, h: 0.25, sonr: 0.5 }),
    pillo: E({ mx: -0.85, my: 0, c: 0.45, h: 0.25, abre: 4, ancho: 1.05, sonr: 0.9 }),
    agarra: E({ mx: 0.6, my: 0.6, c: 0.3, abre: 6, ancho: 0.8, sonr: 0.6, lengua: 0.9 }),
    tira: E({ mx: 0.6, my: 0.5, c: 0.55, z: 0.3, abre: 14, ancho: 1, sonr: 0.7 }),
    camara: E({ mx: -0.85, my: 0, c: 0.3, abre: 6, ancho: 1, sonr: 0.85 }),
    guino: E({ mx: -0.85, my: 0, c: 0.25, wd: 0.75, abre: 6, ancho: 1, sonr: 0.95 }),
    baile: E({ mx: 0.9, my: 0, c: 0.45, h: 0.15, abre: 2, ancho: 1, sonr: 0.65 }),
    helado: E({ mx: 0.9, my: 0, iris: 0.75, c: 0, abre: 16, ancho: 0.6, sonr: -0.15 }),
    salta: E({ mx: 0.9, my: 0.1, c: 0.4, abre: 32, ancho: 1.08, sonr: 0.25 }),
    triunfo: E({ mx: 0.5, my: 0, c: 1, h: 1, abre: 12, ancho: 1.05, sonr: 0.95 }),
    duda: E({ mx: 0.9, my: 0.25, iris: 0.85, c: 0, abre: 8, ancho: 0.55, sonr: -0.1 }),
    horror: E({ mx: 0, my: 0, iris: 0.7, c: 0, abre: 44, ancho: 0.8, sonr: -0.55, lengua: 0.2 }),
    vuela: E({ mx: 0, my: 0, c: 1, z: 1, abre: 40, ancho: 0.95, sonr: -0.5, lengua: 0.3 }),
    mareo: E({ mx: 0, my: 0, esp: 1, abre: 16, ancho: 0.85, sonr: -0.1, lengua: 0.85 }),
    sacude: E({ mx: 0.4, my: 0, c: 0.85, z: 0.6, abre: 4, ancho: 0.8, sonr: -0.2 }),
    taburete: E({ mx: 0.9, my: -0.35, c: 0.1, abre: 8, ancho: 0.7, sonr: 0.05 }),
    otro: E({ mx: 0.9, my: 0.05, c: 0.2, abre: 6, ancho: 0.85, sonr: 0.5 }),
    risa: E({ mx: 0.6, my: 0, c: 0.95, h: 1, abre: 36, ancho: 1.05, sonr: 0.95 }),
    camara2: E({ mx: -0.85, my: 0, c: 0.25, abre: 8, ancho: 1, sonr: 0.95 }),
    guino2: E({ mx: -0.85, my: 0, c: 0.25, wd: 0.75, abre: 8, ancho: 1, sonr: 1 })
  };
  const GUION_CARA_R = [
    [0.5, 0.8, "ritmo"], [T.sonrisa, T.sonrisa + 0.18, "pillo"], [T.agarra0, T.agarra0 + 0.15, "agarra"], [T.atras0, T.atras0 + 0.12, "tira"],
    [T.suelta + 0.05, T.suelta + 0.2, "camara"], [T.guinoR, T.guinoR + 0.1, "guino"], [T.guinoR + 0.3, T.guinoR + 0.42, "camara"],
    [T.c0 + 0.05, T.c0 + 0.35, "baile"], [T.stop, T.stop + 0.05, "helado"], [T.agacha, T.agacha + 0.1, "salta"],
    [T.aterriza + 0.02, T.aterriza + 0.12, "triunfo"], [T.giro0 + 0.12, T.giro0 + 0.3, "duda"], [T.giro0 + 0.55, T.giro0 + 0.75, "horror"],
    [T.suelta2, T.suelta2 + 0.06, "vuela"], [T.suelo + 0.04, T.suelo + 0.14, "mareo"], [T.sacude0 + 0.05, T.sacude0 + 0.13, "sacude"],
    [T.sacude1, T.miraT, "taburete"], [T.miraO, T.miraO + 0.15, "otro"], [T.risa0, T.risa0 + 0.12, "risa"],
    [T.guino - 0.25, T.guino - 0.05, "camara2"], [T.guino, T.guino + 0.12, "guino2"]
  ];
  const PARP_R = [0.6, 2.0, 3.9, 5.5, 7.0, 9.35, 12.7, 13.95];

  /* =====================================================================================
   * POSES
   * ===================================================================================== */
  const DATOS = { g: { R: G, pies: PIES_G, caras: CARAS_G, guionCara: GUION_CARA_G, parp: PARP_G, lado: -1 },
    r: { R: RO, pies: PIES_R, caras: CARAS_R, guionCara: GUION_CARA_R, parp: PARP_R, lado: 1 } };

  // fase del personaje: «pie» (de pie, bailando o dando la vuelta), «salto», «sentado», «vuelo», «suelo»
  function estado(who, t) {
    if (t < T.salta) return "pie";
    if (t < T.aterriza) return "salto";
    if (t < T.suelta2) return "sentado";
    if (t < T.suelo) return "vuelo";
    return "suelo";
  }

  const MEMO = new Map();
  function pose(who, t) {
    const clave = who + t;
    if (MEMO.has(clave)) return MEMO.get(clave);
    if (MEMO.size > 16) MEMO.clear();
    const v = pose0(who, t); MEMO.set(clave, v); return v;
  }

  const limites = new Map();
  function poseLimite(who, t, est) {
    const clave = who + est;
    if (!limites.has(clave)) limites.set(clave, pose0(who, t, est));
    return limites.get(clave);
  }
  function pose0(who, t, est = estado(who, t)) {
    const D = DATOS[who], R = D.R, sg = D.lado;          // sg: −1 Guillermo (izquierda), +1 Rodri (derecha)
    const otro = who === "g" ? "r" : "g";
    let p, fx, rot = 0, giroEje = null;
    const respira = Math.sin(t * 2.2 + (who === "g" ? 0 : 1.3));
    const ex0 = guion(D.guionCara, D.caras, "inicio", t);

    if (est === "pie") {
      const a = andar(who, t);
      p = poseBase(R, a.x, a.y, escDe(a.y));
      fx = t < T.c0 ? (who === "g" ? 1 : -1) : a.fx;
      // pies
      for (const lado of ["cerca", "lejos"]) {
        let w = pieDe(D.pies, lado, Math.min(t, T.stop));
        // tras quedarse congelado, el pie que estaba en el aire baja (y se prepara para saltar)
        if (t > T.stop) { const b = tramo(t, T.baja, T.baja + 0.08); w = { x: w.x, y: w.y, h: w.h * (1 - b), a: w.a * (1 - b) }; }
        p.piernas[lado] = piernaDe(R, p, fx, w, lado);
      }
      // cuerpo: cabeceo a compás antes de empezar; baile sigiloso dando la vuelta
      const preBeat = t < T.c0 ? campana(((t - BEAT0) % BEAT + BEAT) % BEAT, 0, BEAT) : 0;
      const fr = t < T.stop ? a.fr : ((T.stop - T.c0 - SW) / BEAT) % 1;
      const baja = 26 + 18 * Math.cos(TAU * fr);
      p.pelvis.y += (baja * (t >= T.c0 ? tramo(t, T.c0, T.c0 + 0.3) : 0)) + 6 * preBeat;
      p.torso = 0.03 + (0.1 + 0.05 * a.sw) * tramo(t, T.c0, T.c0 + 0.3);
      p.cabeza.ang = -0.04 * preBeat + (0.06 * Math.sin(TAU * fr + 1) - 0.04) * tramo(t, T.c0, T.c0 + 0.3);
      p.cabeza.dy = 6 * preBeat;
      p.torsoEsc.y = 1 + respira * 0.004;
      // Rodri: se agacha a por el taburete y tira de él
      if (who === "r" && t < T.c0) {
        const ag = dentro(t, T.agarra0, T.agarra1, T.suelta + 0.01, T.suelta + 0.25);
        const at = tramo(t, T.atras0, T.atras1);
        p.x += R_ATRAS * at * (1 - tramo(t, T.vuelve0 + 0.15, T.vuelve1));
        const impulso = dentro(t, T.latigo, T.suelta, T.suelta + 0.015, T.vuelve1);
        p.x += 38 * impulso; p.pelvis.y += 27 * impulso; p.torsoEsc.y -= 0.10 * ag;
        p.torso += 0.5 * ag - 0.06 * dentro(t, T.suelta - 0.05, T.suelta + 0.05, T.suelta + 0.25, T.suelta + 0.45);
        p.pelvis.y += 70 * ag + 25 * dentro(t, T.latigo, T.latigo + 0.1, T.suelta, T.suelta + 0.2);
        p.cabeza.ang += -0.25 * ag;
        // sacudida de manos: rebotitos
        p.pelvis.y += 6 * Math.abs(Math.sin((t - T.palmas0) * 2 * Math.PI / 0.19)) * dentro(t, T.palmas0, T.palmas0 + 0.05, T.palmas1 - 0.05, T.palmas1);
        // los pies de reposo siguen a la pelvis
        for (const lado of ["cerca", "lejos"]) p.piernas[lado] = piernaDe(R, p, fx, pieDe(D.pies, lado, t), lado);
      }
      // congelado: aguanta el equilibrio a media zancada, tiembla un pelín; luego se agacha para saltar
      if (t >= T.stop) {
        p.cabeza.ang += 0.03 * Math.sin(t * 40) * dentro(t, T.stop, T.stop + 0.02, T.mira1, T.mira1 + 0.05);
        const agacha = tramo(t, T.agacha, T.salta);
        p.pelvis.y += 50 * agacha; p.torso += 0.22 * agacha; p.cabeza.ang -= 0.12 * agacha;
      }
    } else if (est === "salto") {
      // del sitio al asiento: arco, media vuelta en el aire y aterriza de culo
      const u = fase(t, T.salta, T.aterriza);
      const a0 = andar(who, T.stop);
      const x0 = a0.x, xf = CX + sg * RIDER;
      const x = lerp(x0, xf, suave(u));
      const sueloY = lerp(a0.y, FY, u);
      p = poseBase(R, x, sueloY, escDe(sueloY));
      const despegue = poseLimite(who, T.salta, "pie");
      const yP0 = pelvisPant(R, despegue.p).y;
      const yPf = sueloY - (ASIENTO + ALTURA_CADERA);
      const yP = lerp(yP0, yPf, u) - 95 * Math.sin(Math.PI * u) * (1 - 0.2 * u);
      p.pelvis.y = R.SUELO + (yP - sueloY) / kRig(R, p);
      const giro = suave(fase(t, T.salta + 0.04, T.salta + 0.17));
      const f0 = who === "g" ? 1 : -1;
      fx = f0 * Math.cos(Math.PI * giro);
      p.torso = lerp(despegue.p.torso, 0.3, u) + 0.12 * Math.sin(Math.PI * u);
      p.torsoEsc.y = lerp(despegue.p.torsoEsc.y, TORSO_SENTADO, u);
      p.cabeza.ang = lerp(despegue.p.cabeza.ang, -0.05, u) - 0.1 * Math.sin(Math.PI * u);
      // piernas: recogidas en el aire y, al final, colgando hacia el aro
      const recoge = Math.sin(Math.PI * Math.min(1, u * 1.1));
      const sent = piernasSentado(R, p, sueloY);
      for (const lado of ["cerca", "lejos"]) {
        const sl = sent[lado];
        const air = { tob: P(R.PELVIS.x + (lado === "cerca" ? 120 : 190), p.pelvis.y + 330), ang: -0.3 };
        p.piernas[lado] = { tob: mezcla(mezcla(despegue.p.piernas[lado].tob, air.tob, Math.min(1, recoge * 1.4)), sl.tob, tramo(u, 0.55, 1)),
          ang: lerp(lerp(despegue.p.piernas[lado].ang, air.ang, recoge), sl.ang, tramo(u, 0.55, 1)) };
      }
    } else if (est === "sentado") {
      p = poseBase(R, CX + sg * RIDER, FY, S0);
      fx = who === "g" ? -1 : 1;
      p.pelvis.y = R.PELVIS.y + pelSentado(R, S0, ASIENTO);
      p.torsoEsc.y = TORSO_SENTADO;
      // aterrizaje: el asiento cede y rebotan
      const tau = t - T.aterriza;
      const bote = Math.exp(-tau * 9) * Math.sin(tau * 26) * (tau > 0 ? 1 : 0);
      p.pelvis.y += 3 * cedeAsiento(t) / kRig(R, p);
      const cent = t <= T.giro0 ? 0 : clamp((t - T.giro0) / DUR_GIRO) ** (P_GIRO - 1);
      p.torso = 0.3 + 0.06 * bote + 0.28 * cent;
      p.cabeza.ang = -0.05 + 0.12 * bote + 0.18 * cent + 0.05 * Math.sin(t * 23) * cent;
      // contoneo de triunfo
      const contoneo = dentro(t, T.aterriza + 0.15, T.aterriza + 0.2, T.giro0 - 0.05, T.giro0 + 0.05);
      p.torso += 0.05 * Math.sin((t - T.aterriza) * 18) * contoneo;
      const sent = piernasSentado(R, p, FY);
      for (const lado of ["cerca", "lejos"]) {
        const sl = sent[lado], pat = Math.sin(t * 19 + (lado === "cerca" ? 0 : 1.8)) * cent;
        p.piernas[lado] = { tob: P(sl.tob.x + 90 * cent, sl.tob.y - 170 * cent - 40 * pat), ang: sl.ang - 0.4 * cent };
      }
      giroEje = thTaburete(t);
    } else {
      // vuelo y caída: la pelvis sigue un arco desde el asiento hasta el suelo, girando
      const vu = fase(t, T.suelta2, T.suelo);
      const dest = CAE[who];
      const x0 = CX + sg * RIDER;
      const enVuelo = est === "vuelo";
      const sueloY = enVuelo ? lerp(FY, dest.y, vu) : dest.y;
      const x = enVuelo ? lerp(x0, dest.x, vu) : dest.x;
      p = poseBase(R, x, sueloY, escDe(sueloY));
      // pelvis en pantalla
      const ySeat = FY - (ASIENTO + ALTURA_CADERA), yFloor = dest.y - 15;
      let yP;
      if (enVuelo) yP = lerp(ySeat, yFloor, vu * vu) - 70 * Math.sin(Math.PI * vu) * (1 - 0.3 * vu);
      else { const tau = t - T.suelo; yP = yFloor - 16 * Math.abs(Math.sin(tau * 12)) * Math.exp(-tau * 9); }
      p.pelvis.y = R.SUELO + (yP - sueloY) / kRig(R, p);
      if (enVuelo) {
        const th = thVuelo(t); fx = (who === "g" ? -1 : 1) * Math.cos(th);
        rot = sg * 0.5 * Math.sin(Math.PI * vu);   // en pantalla: la cabeza se va hacia fuera
        const salida = poseLimite(who, T.suelta2, "sentado").p;
        p.torsoEsc.y = lerp(TORSO_SENTADO, 0.80, vu);
        p.torso = lerp(salida.torso, -0.20, vu);
        p.cabeza.ang = lerp(salida.cabeza.ang, 0.10, vu) + 0.2 * Math.sin(Math.PI * vu);
      } else {
        fx = who === "g" ? 1 : -1;            // ya mirando al taburete
        const tau = t - T.suelo;
        const golpe = Math.exp(-tau * 8);
        p.torsoEsc.y = lerp(0.80, 0.84, tramo(t, T.suelo + 0.1, T.miraT));
        const mareo = dentro(t, T.suelo + 0.05, T.suelo + 0.25, T.sacude0, T.sacude0 + 0.1);
        const risa = dentro(t, T.risa0, T.risa0 + 0.1, T.risa1 + 0.2, T.fin + 0.2);
        p.torso = -0.28 + 0.08 * golpe + 0.07 * Math.sin(t * 3.1) * mareo + 0.06 * tramo(t, T.sacude1, T.miraT)
          - 0.08 * risa + 0.04 * Math.sin(t * 26) * risa;
        p.cabeza.ang = 0.1 * golpe + 0.14 * Math.sin(t * 3.1 + 0.9) * mareo - 0.1 * risa + 0.05 * Math.sin(t * 26 + 1) * risa;
        p.cabeza.dx = 8 * Math.cos(t * 3.1) * mareo; p.cabeza.dy = 5 * Math.sin(t * 3.1) * mareo;
        const sac = fase(t, T.sacude0, T.sacude1);
        if (sac > 0 && sac < 1) p.cabeza.ang += 0.22 * Math.sin(sac * Math.PI * 6) * Math.sin(Math.PI * sac);
        p.pelvis.y += 6 * Math.abs(Math.sin(t * 26)) * risa;
      }
      // piernas: en el aire se abren y patalean; en el suelo, estiradas hacia el taburete
      const sueloP = piernasSuelo(R, p, t);
      for (const lado of ["cerca", "lejos"]) {
        const sl = sueloP[lado];
        if (enVuelo) {
          const pat = Math.sin(t * 24 + (lado === "cerca" ? 0 : 2));
          const air = { tob: P(R.PELVIS.x + (lado === "cerca" ? 110 : 160) + 25 * pat, p.pelvis.y + 300 - 50 * pat), ang: -0.3 + 0.3 * pat };
          const k = tramo(vu, 0.7, 1);
          const inicial = poseLimite(who, T.suelta2, "sentado").p.piernas[lado], abre = tramo(vu, 0, 0.26);
          p.piernas[lado] = { tob: mezcla(mezcla(inicial.tob, air.tob, abre), sl.tob, k), ang: lerp(lerp(inicial.ang, air.ang, abre), sl.ang, k) };
        } else p.piernas[lado] = sl;
      }
    }

    // cara
    const ex = Object.assign({}, ex0);
    // mirada: hacia el otro mientras dan la vuelta (y algún vistazo al taburete)
    if (est === "pie" && t >= T.c0 - 0.2 && t < T.stop + 0.05) {
      const po = andar(otro, t), dx = (po.x - p.x) * Math.sign(fx);
      const hacia = clamp(dx / 90, -1, 1) * 0.92;
      const vist = dentro(t, 4.55, 4.7, 5.05, 5.2) + dentro(t, 6.55, 6.7, 7.05, 7.2);
      const k = tramo(t, T.c0 - 0.2, T.c0 + 0.1);
      ex.mx = lerp(ex.mx, lerp(hacia, Math.sign(CX - p.x) * Math.sign(fx) * 0.9, vist), k);
      ex.my = lerp(ex.my, lerp(po.y < p.y - 8 ? -0.2 : po.y > p.y + 8 ? 0.25 : 0, 0.35, vist), k);
    }
    // congelados: ojos al taburete y luego al otro
    if (t >= T.stop && t < T.salta) {
      const aT = dentro(t, T.mira1, T.mira1 + 0.05, T.mira2, T.mira2 + 0.05), aO = tramo(t, T.mira2, T.mira2 + 0.05);
      ex.mx = 0.9; ex.my = lerp(lerp(0, 0.45, aT), 0, aO);
    }
    p.cara = cara(ex, parpadeo(t, D.parp));
    if (est === "suelo" && t < T.sacude0 + 0.1) p.estrellas = dentro(t, T.suelo, T.suelo + 0.15, T.sacude0, T.sacude0 + 0.1);
    p.rojo = 0.3 * dentro(t, T.giro0 + 0.55, T.giro0 + 0.8, T.suelta2, T.suelta2 + 0.2);
    p.sudor = dentro(t, T.stop, T.stop + 0.1, T.salta, T.salta + 0.1) + dentro(t, T.giro0 + 0.4, T.giro0 + 0.6, T.suelta2, T.suelta2 + 0.1);

    manos(who, R, p, t, est, fx);
    return { p, fx, rot, giroEje, est };
  }

  // piernas sentado en el taburete: muslos hacia delante y pies recogidos sobre el aro
  function piernasSentado(R, p, sueloY) {
    const k = kRig(R, p);
    const anillo = R.SUELO - R.TOBILLO_ALTO - (ARO_ALTO + 4) / k;
    return { cerca: { tob: P(R.PELVIS.x + (R_ARO - RIDER) / k, anillo + (sueloY - p.suelo) / k), ang: 0.12 },
      lejos: { tob: P(R.PELVIS.x + (R_ARO - 4 - RIDER) / k, anillo - 10 + (sueloY - p.suelo) / k), ang: 0.18 } };
  }
  // piernas sentado en el suelo: estiradas hacia delante, rodillas un poco arriba
  function piernasSuelo(R, p, t) {
    const tob = R.SUELO - R.TOBILLO_ALTO;
    const risa = dentro(t, T.risa0, T.risa0 + 0.1, T.risa1 + 0.2, T.fin + 0.2);
    const pat = Math.sin(t * 20) * risa;
    return { cerca: { tob: P(R.PELVIS.x + 470, tob - 4 - 40 * Math.max(0, pat)), ang: -0.55 },
      lejos: { tob: P(R.PELVIS.x + 520, tob - 26 - 40 * Math.max(0, -pat)), ang: -0.5 } };
  }

  /* ---------- manos ---------- */
  function manos(who, R, p, t, est, fx) {
    const esG = who === "g";
    const HC = R.HOMBRO_C, HL = R.HOMBRO;
    let c = bolsillo(R, p, "cerca"), l = bolsillo(R, p, "lejos");
    const pon = (w, cc, ll) => { if (w <= 0) return; if (cc) c = mezMano(c, cc, w); if (ll) l = mezMano(l, ll, w); };
    if (est === "pie") {
      if (!esG && t < T.c0) {
        // Rodri: mano lejana al borde del asiento del taburete B, tira y lo suelta de un latigazo
        const B = taburete2(Math.min(t, T.suelta));
        const borde = bordeTaburete(B);
        const ag = dentro(t, T.agarra0 + 0.05, T.agarra1, T.suelta, T.suelta + 0.12);
        if (ag > 0) {
          const q = aHojaF(R, p, -1, borde);
          pon(ag, null, { x: q.x, y: q.y, mu: -1.95, ang: 0, puno: 1, dedos: AGARRA, dobla: 1 });
        }
        // palmas: se sacude las manos
        const pa = dentro(t, T.palmas0, T.palmas0 + 0.08, T.palmas1 - 0.05, T.palmas1 + 0.1);
        if (pa > 0) {
          const ch = Math.abs(Math.sin((t - T.palmas0) * Math.PI / 0.19));
          pon(pa, manoT(R, p, P(HC.x + 240 - 22 * ch, 520), 2.35, PALMA, { dobla: -1 }), manoT(R, p, P(HL.x + 10 + 22 * ch, 520), 2.5, PALMA, { dobla: 1 }));
        }
      }
      if (esG && t < T.c0 + 0.3) {
        // Guillermo saca los puños: ¡vale!
        const pu = tramo(t, T.punos0, T.punos1) * (1 - tramo(t, T.c0, T.c0 + 0.3));
        pon(pu, manoT(R, p, P(HC.x + 200, 470), 2.35, PUNO, { dobla: -1 }), manoT(R, p, P(HL.x + 70, 450), 2.45, PUNO, { dobla: 1 }));
      }
      // la vuelta: brazos doblados que se balancean a compás (puños sueltos)
      if (t >= T.c0 - 0.1) {
        const a = andar(who, t), k = tramo(t, T.c0 - 0.1, T.c0 + 0.3);
        const sw = t < T.stop ? a.sw : andar(who, T.stop).sw;
        const sube = Math.abs(sw);
        pon(k, manoT(R, p, P(HC.x + 190 - 110 * sw, 500 - 50 * sube), 2.3 + 0.25 * sw, GARRA, { dobla: -1 }),
          manoT(R, p, P(HL.x + 70 + 110 * sw, 480 - 50 * sube), 2.4 - 0.25 * sw, GARRA, { dobla: 1 }));
        // congelados: manos arriba abiertas (¡alto!)
        const hel = dentro(t, T.stop, T.stop + 0.06, T.agacha, T.salta);
        pon(hel, manoT(R, p, P(HC.x + 150, 300), 2.0, JAZZ, { dobla: -1 }), manoT(R, p, P(HL.x + 60, 280), 2.1, JAZZ, { dobla: 1 }));
        // agachado para saltar: brazos atrás… (carga)
        const ag = tramo(t, T.agacha, T.salta);
        pon(ag, manoT(R, p, P(HC.x + 60, 600), -2.7, PALMA, { dobla: -1 }), manoT(R, p, P(HL.x - 40, 600), -2.6, PALMA, { dobla: 1 }));
      }
    } else if (est === "salto") {
      const u = fase(t, T.salta, T.aterriza);
      const brazos = { c: manoT(R, p, P(HC.x + 220, 260), 2.6, JAZZ, { dobla: -1 }), l: manoT(R, p, P(HL.x + 120, 240), 2.7, JAZZ, { dobla: 1 }) };
      const rim = manosAsiento(R, p, t), inicio = poseLimite(who, T.salta, "pie").p;
      c = mezMano(mezMano(inicio.manoCerca, brazos.c, tramo(u, 0, 0.3)), rim.c, tramo(u, 0.65, 1));
      l = mezMano(mezMano(inicio.manoLejos, brazos.l, tramo(u, 0, 0.3)), rim.l, tramo(u, 0.65, 1));
    } else if (est === "sentado") {
      const rim = manosAsiento(R, p, t);
      c = rim.c; l = rim.l;
      // triunfo: un puño arriba un momento
      const tri = dentro(t, T.aterriza + 0.1, T.aterriza + 0.22, T.giro0 - 0.05, T.giro0 + 0.12);
      const bombeo = Math.abs(Math.sin((t - T.aterriza) * 16));
      pon(tri, null, manoT(R, p, P(HL.x + 150, 470 - 50 * bombeo), 2.6, PUNO, { dobla: 1 }));
    } else if (est === "vuelo") {
      const f = Math.sin(t * 30), despega = tramo(t, T.suelta2, T.suelta2 + 0.095);
      const base = poseLimite(who, T.suelta2, "sentado").p;
      c = mezMano(base.manoCerca, manoT(R, p, P(HC.x + 160 + 40 * f, 200), 2.8, JAZZ, { dobla: -1 }), despega);
      l = mezMano(base.manoLejos, manoT(R, p, P(HL.x + 140 - 40 * f, 180), 2.9, JAZZ, { dobla: 1 }), despega);
    } else {
      // en el suelo: manos apoyadas al lado de la cadera; risa: a la barriga y palmada en el muslo
      const apoyo = (hombro, cerca) => {
        const h = R.tronco(p)(hombro), k = kRig(R, p);
        const x = h.x + (cerca ? 38 : -18), y = R.SUELO - (cerca ? 17 : 24) / k;
        return { x, y, mu: Math.atan2(h.y-y, h.x-x), ang: 0, puno: 1, dedos: PALMA, dobla: cerca ? -1 : 1 };
      };
      const apo = { c: apoyo(HC, true), l: apoyo(HL, false) };
      c = apo.c; l = apo.l;
      const lu = tramo(t, T.suelo, T.suelo + 0.15);
      const f = Math.sin(T.suelo * 30);
      const vu = { c: manoT(R, p, P(HC.x + 160 + 40*f, 200), 2.8, JAZZ, { dobla: -1 }), l: manoT(R, p, P(HL.x + 140 - 40*f, 180), 2.9, JAZZ, { dobla: 1 }) };
      c = mezMano(vu.c, c, lu); l = mezMano(vu.l, l, lu);
      const ri = dentro(t, T.risa0, T.risa0 + 0.15, T.risa1 + 0.25, T.fin + 0.3);
      const ch = Math.abs(Math.sin((t - T.risa0) * 11));
      pon(ri, manoT(R, p, P(HC.x + 230, 600), 2.5, PALMA, { dobla: -1 }), manoT(R, p, P(HL.x + 120, 640 - 70 * ch), 2.7, PALMA, { dobla: 1 }));
    }
    p.manoCerca = c; p.manoLejos = l;
  }
  // manos agarradas al borde del asiento, a los lados de los muslos
  function manosAsiento(R, p, t) {
    const k = kRig(R, p);
    const palma = (radio, cerca) => {
      const profundidad = (cerca ? 1 : -1) * RY_SEAT * Math.sqrt(1 - (radio / R_SEAT) ** 2);
      const th = thTaburete(t), lado = R === G ? -1 : 1;
      const altura = profundidad * Math.cos(th) + lado * (radio - RIDER) * Math.sin(th) * RY_SEAT / R_SEAT;
      const x = R.PELVIS.x + (radio - RIDER) / k, y = p.pelvis.y + (ALTURA_CADERA + altura + 1) / k;
      const h = R.tronco(p)(cerca ? R.HOMBRO_C : R.HOMBRO);
      return { x, y, mu: Math.atan2(h.y-y, h.x-x), ang: 0, puno: 1, dedos: AGARRA, dobla: cerca ? -1 : 1 };
    };
    return { c: palma(R_SEAT - 4, true), l: palma(R_SEAT - 10, false) };
  }

  /* =====================================================================================
   * TABURETES (atrezo)
   * ===================================================================================== */
  const R_SEAT = 46, BANDA = 18, RY_SEAT = 11, ARO_ALTO = 58, R_ARO = 34, R_BASE = 40;
  const COL_ASIENTO = { base: "#c8322c", sombra: "#8c1d1a", luz: "#ff7a62", vivo: "#f3e6cf" };
  const cromo = (g, x0, x1) => { const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, "#5f656e"); gr.addColorStop(0.32, "#f2f5f8");
    gr.addColorStop(0.55, "#c3c9d1"); gr.addColorStop(1, "#4f555e"); return gr; };
  // taburete B: quieto, arrastrado por Rodri, y lanzado rodando hacia la derecha
  const XB0 = 606;
  function taburete2(t) {
    const B = { x: XB0, y: FY, th: 0, incl: 0, k: 1 };
    if (t < T.atras0) return B;
    if (t < T.latigo) { const u = suave(fase(t, T.atras0, T.atras1)); B.x = XB0 + R_ATRAS * u; B.incl = -0.05 * Math.sin(Math.PI * u); return B; }
    // latigazo: acelera; luego rueda solo y frena poco a poco
    const xL = XB0 + R_ATRAS, DX_L = 58, dL = T.suelta - T.latigo;
    if (t < T.suelta) { const u = fase(t, T.latigo, T.suelta); B.x = xL + DX_L * u * u; B.incl = 0.06 * u; B.th = 2 * u * u; B.vel = 4 * u / dL; return B; }
    const v0 = 2 * DX_L / dL, fr = 90, tau = Math.min(t - T.suelta, v0 / fr);
    B.x = xL + DX_L + v0 * tau - 0.5 * fr * tau * tau;
    B.incl = 0.06 * Math.cos(tau * 9) * Math.exp(-tau * 2);
    B.th = 2 + (4 / dL) * (tau - fr * tau * tau / (2 * v0));
    B.vel = (4 / dL) * (1 - fr * tau / v0);
    return B;
  }

  function bordeTaburete(B) {
    const dx = R_SEAT - 4, dy = -ASIENTO + 4;
    return P(B.x + dx * Math.cos(B.incl) - dy * Math.sin(B.incl), B.y + dx * Math.sin(B.incl) + dy * Math.cos(B.incl));
  }
  function sombraTab(g, x, y, k, a = 0.32) {
    g.save(); g.fillStyle = `rgba(20,8,10,${a})`; g.beginPath(); g.ellipse(x + 4, y + 2, 52 * k, 9 * k, 0, 0, TAU); g.fill(); g.restore();
  }
  // base cromada, columna y aro (no giran). parte: "detras" (base, columna, mitad de atrás del aro) o "delante" (mitad de delante del aro)
  function pieTab(g, x, y, k, parte) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const yA = y - ARO_ALTO * k;
    if (parte === "detras") {
      // base: disco abombado
      g.fillStyle = cromo(g, x - R_BASE * k, x + R_BASE * k); g.strokeStyle = TINTA; g.lineWidth = 2.5;
      g.beginPath(); g.ellipse(x, y - 4 * k, R_BASE * k, 8 * k, 0, 0, TAU); g.fill(); g.stroke();
      g.beginPath(); g.ellipse(x, y - 8 * k, 20 * k, 6 * k, 0, Math.PI, TAU); g.lineTo(x + 20 * k, y - 5 * k); g.ellipse(x, y - 5 * k, 20 * k, 4 * k, 0, 0, Math.PI); g.closePath(); g.fill(); g.stroke();
      // aro: mitad de atrás
      g.strokeStyle = TINTA; g.lineWidth = 6 * k + 2; g.beginPath(); g.ellipse(x, yA, R_ARO * k, 8 * k, 0, Math.PI, TAU); g.stroke();
      g.strokeStyle = "#aeb4bc"; g.lineWidth = 5 * k; g.stroke();
      // radios del aro a la columna
      g.strokeStyle = TINTA; g.lineWidth = 2;
      for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(x + sx * R_ARO * k * 0.92, yA - 2 * k); g.lineTo(x + sx * 5 * k, yA - 10 * k); g.stroke(); }
      // columna
      const top = y - (ASIENTO - BANDA) * k, bot = y - 8 * k;
      g.fillStyle = cromo(g, x - 6 * k, x + 6 * k); g.lineWidth = 2.2;
      g.beginPath(); g.rect(x - 6 * k, top, 12 * k, bot - top); g.fill(); g.stroke();
      // cubo bajo el asiento
      g.fillStyle = "#33363c"; g.beginPath(); g.moveTo(x - 20 * k, top); g.lineTo(x + 20 * k, top); g.lineTo(x + 9 * k, top + 12 * k); g.lineTo(x - 9 * k, top + 12 * k); g.closePath(); g.fill(); g.stroke();
    } else {
      g.strokeStyle = TINTA; g.lineWidth = 6 * k + 2; g.beginPath(); g.ellipse(x, yA, R_ARO * k, 8 * k, 0, 0, Math.PI); g.stroke();
      g.strokeStyle = "#d6dbe1"; g.lineWidth = 5 * k; g.stroke();
      g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 1.6 * k; g.beginPath(); g.ellipse(x, yA - 1.2 * k, R_ARO * k, 8 * k, 0, 0.35 * Math.PI, 0.75 * Math.PI); g.stroke();
    }
    g.restore();
  }
  // asiento redondo: no se aplasta al girar; giran las costuras, los botones y el parche de estrella
  function asiento(g, x, y, k, th, vel, aplasta = 0) {
    const top = y - ASIENTO * k + aplasta * 3 * k, R = R_SEAT * k, ry = RY_SEAT * k, bh = (BANDA - aplasta * 3) * k;
    const c = COL_ASIENTO;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // banda (cilindro)
    g.beginPath(); g.moveTo(x - R, top); g.lineTo(x - R, top + bh); g.ellipse(x, top + bh, R, ry, 0, Math.PI, 0, true); g.lineTo(x + R, top); g.closePath();
    const gb = g.createLinearGradient(x - R, 0, x + R, 0); gb.addColorStop(0, c.sombra); gb.addColorStop(0.38, c.base); gb.addColorStop(0.55, c.luz); gb.addColorStop(0.75, c.base); gb.addColorStop(1, c.sombra);
    g.fillStyle = gb; g.fill();
    g.save(); g.clip();
    // costuras verticales (giran con el asiento)
    g.strokeStyle = "rgba(70,10,10,0.55)"; g.lineWidth = 1.6;
    for (let i = 0; i < 16; i++) {
      const b = i * TAU / 16 + th, s = Math.sin(b); if (s <= 0) continue;
      const xx = x + R * Math.cos(b); g.globalAlpha = s; g.beginPath(); g.moveTo(xx, top + ry * s * 0.9); g.lineTo(xx, top + bh + ry * s); g.stroke();
    }
    g.globalAlpha = 1;
    // parche de estrella (cosido en la banda)
    const bp = PARCHE + th, sp = Math.sin(bp);
    if (sp > 0) {
      const xx = x + R * Math.cos(bp), yy = top + bh * 0.55 + ry * sp;
      g.save(); g.translate(xx, yy); g.scale(sp, 1);
      estrellaPuntas(g, 0, 0, 7.5 * k, 5, -Math.PI / 2, 0.45); g.fillStyle = "#f4c74a"; g.fill(); g.lineWidth = 1.4; g.strokeStyle = TINTA; g.stroke();
      g.setLineDash([1.6, 1.6]); g.strokeStyle = "#7a2c12"; g.lineWidth = 0.9; estrellaPuntas(g, 0, 0, 9.6 * k, 5, -Math.PI / 2, 0.45); g.stroke(); g.setLineDash([]);
      g.restore();
    }
    g.restore();
    g.beginPath(); g.moveTo(x - R, top); g.lineTo(x - R, top + bh); g.ellipse(x, top + bh, R, ry, 0, Math.PI, 0, true); g.lineTo(x + R, top);
    g.lineWidth = 2.6; g.strokeStyle = TINTA; g.stroke();
    // vivo (ribete crema) abajo
    g.strokeStyle = c.vivo; g.lineWidth = 2.2; g.beginPath(); g.ellipse(x, top + bh - 1.5, R - 1, ry, 0, 0.05 * Math.PI, 0.95 * Math.PI); g.stroke();
    // tapa (elipse acolchada)
    g.beginPath(); g.ellipse(x, top, R, ry, 0, 0, TAU);
    const gt = g.createRadialGradient(x - R * 0.25, top - ry * 0.4, 2, x, top, R); gt.addColorStop(0, c.luz); gt.addColorStop(0.6, c.base); gt.addColorStop(1, c.sombra);
    g.fillStyle = gt; g.fill(); g.lineWidth = 2.4; g.strokeStyle = TINTA; g.stroke();
    g.strokeStyle = c.vivo; g.lineWidth = 2; g.beginPath(); g.ellipse(x, top, R - 2.5, ry - 1.2, 0, 0, TAU); g.stroke();
    // botones del capitoné (giran)
    for (let i = 0; i < 5; i++) {
      const b = i * TAU / 5 + th + 0.3, rr = R * 0.5;
      const bx = x + rr * Math.cos(b), by = top + ry * 0.5 * Math.sin(b);
      g.fillStyle = c.sombra; g.beginPath(); g.ellipse(bx, by, 2.6 * k, 1.3 * k, 0, 0, TAU); g.fill();
      g.strokeStyle = "rgba(80,10,10,0.5)"; g.lineWidth = 1; g.beginPath(); g.moveTo(bx, by); g.lineTo(x + (rr + 10) * Math.cos(b), top + ry * 0.75 * Math.sin(b)); g.stroke();
    }
    g.fillStyle = c.sombra; g.beginPath(); g.ellipse(x, top, 2.6 * k, 1.3 * k, 0, 0, TAU); g.fill();
    // brillo
    g.fillStyle = "rgba(255,255,255,0.45)"; g.beginPath(); g.ellipse(x - R * 0.35, top - ry * 0.35, R * 0.3, ry * 0.22, -0.1, 0, TAU); g.fill();
    // remolino de velocidad
    const vk = clamp((Math.abs(vel) - 3) / 10);
    if (vk > 0.01) {
      g.strokeStyle = `rgba(255,255,255,${0.8 * vk})`; g.lineWidth = 2.4; g.lineCap = "round";
      for (let i = 0; i < 3; i++) { const a0 = th * 0.5 + i * TAU / 3; g.beginPath(); g.ellipse(x, top + bh * 0.4, R + 9, ry + 5, 0, a0, a0 + 1.4); g.stroke(); }
    }
    g.restore();
  }
  function taburete(g, B, t) {
    g.save();
    if (B.incl) { g.translate(B.x, B.y); g.rotate(B.incl); g.translate(-B.x, -B.y); }
    pieTab(g, B.x, B.y, B.k, "detras"); pieTab(g, B.x, B.y, B.k, "delante");
    asiento(g, B.x, B.y, B.k, B.th, B.vel || 0, 0);
    g.restore();
  }

  /* =====================================================================================
   * DECORADO: el bar de noche
   * ===================================================================================== */
  const PARED = 430, VP = P(512, 120);
  const GRAMOLA = { x: 136, base: 446, ancho: 150, alto: 268 };
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 100; const g = c.getContext("2d");
    g.translate(60, 50);
    // pared granate con papel de rayas finas
    const gp = g.createLinearGradient(0, -50, 0, PARED); gp.addColorStop(0, "#2a0f18"); gp.addColorStop(0.45, "#5a1d2c"); gp.addColorStop(1, "#4a1724");
    g.fillStyle = gp; g.fillRect(-60, -50, W + 120, PARED + 50);
    g.strokeStyle = "rgba(255,190,150,0.05)"; g.lineWidth = 6; for (let x = -60; x < W + 60; x += 22) { g.beginPath(); g.moveTo(x, -50); g.lineTo(x, PARED); g.stroke(); }
    g.fillStyle = "rgba(255,200,160,0.06)"; for (let x = -49; x < W + 60; x += 22) for (let y = -40; y < 300; y += 26) { g.beginPath(); g.arc(x, y + (x % 44 ? 13 : 0), 1.6, 0, TAU); g.fill(); }
    // zócalo de madera con cuarterones
    const Z = 316;
    g.fillStyle = "#3a1d12"; g.fillRect(-60, Z, W + 120, PARED - Z);
    g.fillStyle = "#24110a"; g.fillRect(-60, Z - 6, W + 120, 10); g.fillStyle = "rgba(255,210,150,0.2)"; g.fillRect(-60, Z - 6, W + 120, 2);
    for (let x = -40; x < W + 60; x += 96) {
      g.fillStyle = "#4a2616"; g.fillRect(x, Z + 16, 78, PARED - Z - 34); g.strokeStyle = "#1c0c06"; g.lineWidth = 2.5; g.strokeRect(x, Z + 16, 78, PARED - Z - 34);
      g.fillStyle = "rgba(255,200,140,0.1)"; g.fillRect(x + 3, Z + 19, 72, 3);
    }
    g.fillStyle = "#1a0b06"; g.fillRect(-60, PARED - 12, W + 120, 14);
    // discos enmarcados (sin letras) y neón de la copa con estrella
    for (const [dx, dy, col] of [[318, 150, "#e94f3d"], [700, 140, "#3fa9c9"]]) {
      g.fillStyle = "#1a0c08"; g.fillRect(dx - 46, dy - 46, 92, 92); g.fillStyle = "#c79a4a"; g.fillRect(dx - 42, dy - 42, 84, 84);
      g.fillStyle = "#14100f"; g.fillRect(dx - 38, dy - 38, 76, 76);
      g.fillStyle = "#0b0a0e"; g.beginPath(); g.arc(dx, dy, 32, 0, TAU); g.fill();
      g.strokeStyle = "rgba(255,255,255,0.12)"; g.lineWidth = 1; for (let r = 12; r < 31; r += 3) { g.beginPath(); g.arc(dx, dy, r, 0, TAU); g.stroke(); }
      g.fillStyle = col; g.beginPath(); g.arc(dx, dy, 10, 0, TAU); g.fill(); g.fillStyle = "#f4ead8"; g.beginPath(); g.arc(dx, dy, 2, 0, TAU); g.fill();
      g.strokeStyle = "rgba(255,255,255,0.25)"; g.lineWidth = 2; g.beginPath(); g.arc(dx, dy, 26, -2.4, -1.7); g.stroke();
    }
    // barra a la derecha: botellero con espejo, botellas sin etiqueta, grifos y mostrador
    const BX = 770;
    g.fillStyle = "#2b140c"; g.fillRect(BX - 10, 40, W + 60 - BX, 290);
    const ge = g.createLinearGradient(BX, 60, BX, 300); ge.addColorStop(0, "#5b4a52"); ge.addColorStop(1, "#2c2026");
    g.fillStyle = ge; g.fillRect(BX + 6, 56, W + 40 - BX, 250);
    g.fillStyle = "rgba(255,255,255,0.08)"; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(BX + 40 + i * 70, 56); g.lineTo(BX + 70 + i * 70, 56); g.lineTo(BX + 10 + i * 70, 306); g.lineTo(BX - 20 + i * 70, 306); g.closePath(); g.fill(); }
    const cols = ["#3e7a3a", "#8a2a1e", "#d6a23a", "#2f5f8c", "#6b3a1c", "#c0d0c8", "#8e5aa0", "#2e6b52"];
    for (const [yb, n] of [[150, 9], [250, 9]]) {
      g.fillStyle = "#3d1f12"; g.fillRect(BX, yb, W + 60 - BX, 10); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(BX, yb, W + 60 - BX, 10);
      for (let i = 0; i < n; i++) {
        const bx = BX + 22 + i * 32, h = 52 + 18 * hash(i + yb), col = cols[(i * 3 + yb) % cols.length];
        g.fillStyle = col; g.strokeStyle = TINTA; g.lineWidth = 1.8;
        g.beginPath(); g.moveTo(bx - 9, yb); g.lineTo(bx - 9, yb - h * 0.62); g.quadraticCurveTo(bx - 9, yb - h * 0.78, bx - 3.5, yb - h * 0.84); g.lineTo(bx - 3.5, yb - h);
        g.lineTo(bx + 3.5, yb - h); g.lineTo(bx + 3.5, yb - h * 0.84); g.quadraticCurveTo(bx + 9, yb - h * 0.78, bx + 9, yb - h * 0.62); g.lineTo(bx + 9, yb); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = "rgba(255,255,255,0.3)"; g.fillRect(bx - 6, yb - h * 0.6, 2.5, h * 0.5);
      }
    }
    // mostrador
    const MY = 330;
    g.fillStyle = "#6b3a1e"; g.fillRect(BX - 30, MY, W + 90 - BX, PARED + 6 - MY);
    g.fillStyle = "#8a4e2a"; for (let x = BX - 20; x < W + 60; x += 64) { g.fillRect(x, MY + 22, 52, PARED - MY - 34); g.strokeStyle = "#3a1a0a"; g.lineWidth = 2; g.strokeRect(x, MY + 22, 52, PARED - MY - 34); }
    g.fillStyle = "#a76a3c"; g.fillRect(BX - 40, MY - 12, W + 100 - BX, 16); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(BX - 40, MY - 12, W + 100 - BX, 16);
    g.fillStyle = "rgba(255,230,190,0.35)"; g.fillRect(BX - 40, MY - 12, W + 100 - BX, 3);
    // barra de latón para los pies
    g.strokeStyle = "#c9993c"; g.lineWidth = 6; g.beginPath(); g.moveTo(BX - 34, PARED - 14); g.lineTo(W + 60, PARED - 14); g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.5)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(BX - 34, PARED - 16); g.lineTo(W + 60, PARED - 16); g.stroke();
    // grifos de cerveza y jarras
    for (const tx of [840, 880, 920]) {
      g.fillStyle = "#c9cfd6"; g.strokeStyle = TINTA; g.lineWidth = 2; g.fillRect(tx - 4, MY - 46, 8, 34); g.strokeRect(tx - 4, MY - 46, 8, 34);
      g.fillStyle = "#2a2a2e"; g.beginPath(); g.ellipse(tx, MY - 58, 5, 13, 0, 0, TAU); g.fill(); g.stroke();
      g.fillStyle = "#8a8f96"; g.fillRect(tx - 3, MY - 18, 12, 4);
    }
    for (const [jx, lleno] of [[972, 0.8], [1004, 0.5]]) {
      g.fillStyle = "rgba(230,240,245,0.55)"; g.strokeStyle = TINTA; g.lineWidth = 2; g.fillRect(jx - 10, MY - 40, 20, 28); g.strokeRect(jx - 10, MY - 40, 20, 28);
      g.fillStyle = "#e3a43a"; g.fillRect(jx - 9, MY - 13 - 26 * lleno, 18, 26 * lleno); g.fillStyle = "#fff6e6"; g.fillRect(jx - 9, MY - 16 - 26 * lleno, 18, 5);
    }
    // gramola (partes fijas)
    const J = GRAMOLA, jx = J.x, jb = J.base, jw = J.ancho, jh = J.alto, jt = jb - jh;
    g.fillStyle = "rgba(0,0,0,0.4)"; g.beginPath(); g.ellipse(jx + 6, jb + 2, jw * 0.6, 10, 0, 0, TAU); g.fill();
    const forma = () => { g.beginPath(); g.moveTo(jx - jw / 2, jb); g.lineTo(jx - jw / 2, jt + jw / 2); g.arc(jx, jt + jw / 2, jw / 2, Math.PI, TAU); g.lineTo(jx + jw / 2, jb); g.closePath(); };
    forma(); const gj = g.createLinearGradient(jx - jw / 2, 0, jx + jw / 2, 0); gj.addColorStop(0, "#5b2a10"); gj.addColorStop(0.5, "#a35a24"); gj.addColorStop(1, "#4a200c");
    g.fillStyle = gj; g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    // ventana de los discos
    g.fillStyle = "#1a1612"; g.beginPath(); g.moveTo(jx - 48, jt + 150); g.lineTo(jx - 48, jt + 92); g.arc(jx, jt + 92, 48, Math.PI, TAU); g.lineTo(jx + 48, jt + 150); g.closePath(); g.fill(); g.stroke();
    for (let i = 0; i < 6; i++) { const y = jt + 92 + i * 9; g.fillStyle = "#0b0a0e"; g.beginPath(); g.ellipse(jx, y, 34, 4, 0, 0, TAU); g.fill(); g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 1; g.stroke(); }
    g.fillStyle = "#c33"; g.beginPath(); g.ellipse(jx, jt + 92 + 5 * 9, 8, 1.6, 0, 0, TAU); g.fill();
    // botonera
    g.fillStyle = "#e9e1cf"; g.fillRect(jx - 46, jt + 158, 92, 16); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(jx - 46, jt + 158, 92, 16);
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#c33" : "#2a2a2e"; g.fillRect(jx - 42 + i * 11, jt + 161, 8, 10); }
    // rejilla del altavoz (fondo)
    g.fillStyle = "#2a1508"; g.fillRect(jx - 52, jt + 184, 104, 64); g.strokeRect(jx - 52, jt + 184, 104, 64);
    // marco cromado
    g.lineWidth = 6; g.strokeStyle = "#c9cfd6"; g.beginPath(); g.moveTo(jx - jw / 2 + 6, jb - 4); g.lineTo(jx - jw / 2 + 6, jt + jw / 2); g.arc(jx, jt + jw / 2, jw / 2 - 6, Math.PI, TAU); g.lineTo(jx + jw / 2 - 6, jb - 4); g.stroke();
    // suelo de tarima en perspectiva
    const gs = g.createLinearGradient(0, PARED, 0, H + 50); gs.addColorStop(0, "#4a2614"); gs.addColorStop(1, "#7a4426");
    g.fillStyle = gs; g.fillRect(-60, PARED, W + 120, H + 50 - PARED);
    for (let i = -22; i <= 22; i++) {
      const xa = VP.x + (i * 46) * (PARED - VP.y) / (H + 50 - VP.y) * 1.0, xb = VP.x + i * 46;
      g.strokeStyle = "rgba(20,8,2,0.45)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(xa, PARED); g.lineTo(xb, H + 50); g.stroke();
      g.fillStyle = `rgba(255,220,170,${0.03 + 0.04 * hash(i + 5)})`; g.beginPath(); g.moveTo(xa, PARED); g.lineTo(xb, H + 50); g.lineTo(xb + 46, H + 50); g.lineTo(xa + 46 * (PARED - VP.y) / (H + 50 - VP.y), PARED); g.closePath(); g.fill();
    }
    for (let j = 1; j < 12; j++) { const y = PARED + (H + 50 - PARED) * Math.pow(j / 12, 1.6); g.strokeStyle = "rgba(20,8,2,0.25)"; g.lineWidth = 1;
      for (let i = -22; i <= 22; i++) { if ((i + j) % 3) continue; const xx = VP.x + i * 46 * (y - VP.y) / (H + 50 - VP.y); g.beginPath(); g.moveTo(xx, y); g.lineTo(xx + 46 * (y - VP.y) / (H + 50 - VP.y), y); g.stroke(); } }
    // foco sobre el centro: cono de luz y charco en el suelo
    const hz = g.createRadialGradient(CX, FY, 10, CX, FY, 230); hz.addColorStop(0, "rgba(255,226,170,0.42)"); hz.addColorStop(1, "rgba(255,226,170,0)");
    g.fillStyle = hz; g.beginPath(); g.ellipse(CX, FY, 260, 54, 0, 0, TAU); g.fill();
    // brillo de la gramola en el suelo
    const hj = g.createRadialGradient(jx, jb + 20, 5, jx, jb + 20, 150); hj.addColorStop(0, "rgba(255,120,200,0.22)"); hj.addColorStop(1, "rgba(255,120,200,0)");
    g.fillStyle = hj; g.beginPath(); g.ellipse(jx, jb + 26, 170, 30, 0, 0, TAU); g.fill();
    // viñeta
    const v = g.createRadialGradient(512, 330, 300, 512, 330, 740); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(20,0,10,0.55)");
    g.fillStyle = v; g.fillRect(-60, -50, W + 120, H + 100);
    return c;
  }

  /* ---------- partes vivas del decorado ---------- */
  const musicaK = t => 1 - tramo(t, T.stop, T.stop + 0.12);
  function gramolaViva(g, t) {
    const J = GRAMOLA, jx = J.x, jb = J.base, jw = J.ancho, jt = jb - J.alto;
    const on = 0.3 + 0.7 * musicaK(t), latido = Math.max(0, Math.cos(TAU * (t - BEAT0) / BEAT)) * musicaK(t);
    g.save(); g.lineCap = "round";
    // tubos de colores del arco (cambian de color)
    for (let i = 0; i < 3; i++) {
      const r = jw / 2 - 14 - i * 9, hue = (t * 70 + i * 60) % 360;
      g.strokeStyle = `hsla(${hue},95%,${45 + 25 * on}%,${0.5 + 0.5 * on})`; g.lineWidth = 6;
      g.beginPath(); g.moveTo(jx - r, jb - 30); g.lineTo(jx - r, jt + jw / 2); g.arc(jx, jt + jw / 2, r, Math.PI, TAU); g.lineTo(jx + r, jb - 30); g.stroke();
      g.strokeStyle = `rgba(255,255,255,${0.35 * on})`; g.lineWidth = 2; g.stroke();
    }
    // rejilla que late
    g.fillStyle = `rgba(255,170,90,${0.25 + 0.45 * latido})`; g.fillRect(jx - 48, jt + 188, 96, 56);
    g.strokeStyle = TINTA; g.lineWidth = 2; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(jx - 48 + i * 12, jt + 188); g.lineTo(jx - 48 + i * 12, jt + 244); g.stroke(); }
    // brillo alrededor
    const hl = g.createRadialGradient(jx, jt + 100, 20, jx, jt + 100, 200); hl.addColorStop(0, `rgba(255,140,210,${0.22 * on})`); hl.addColorStop(1, "rgba(255,140,210,0)");
    g.fillStyle = hl; g.beginPath(); g.arc(jx, jt + 100, 200, 0, TAU); g.fill();
    g.restore();
  }
  // neón de la copa con su estrella (parpadea un pelín)
  function neon(g, t) {
    const x = 512, y = 168, f = 0.85 + 0.15 * (ruido(t * 7) > 0.7 ? 0.3 : 1);
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    for (const [lw, a] of [[12, 0.15], [7, 0.3], [3, 1]]) {
      g.globalAlpha = a * f; g.lineWidth = lw;
      g.strokeStyle = "#ff5fae"; g.beginPath(); g.moveTo(x - 40, y - 30); g.lineTo(x + 40, y - 30); g.lineTo(x, y + 12); g.closePath(); g.moveTo(x, y + 12); g.lineTo(x, y + 44); g.moveTo(x - 20, y + 46); g.lineTo(x + 20, y + 46); g.stroke();
      g.strokeStyle = "#7ff0ff"; g.beginPath(); g.moveTo(x + 18, y - 44); g.lineTo(x - 4, y - 14); g.stroke(); g.beginPath(); g.arc(x - 6, y - 20, 6, 0, TAU); g.stroke();
      g.strokeStyle = "#ffe35f"; estrellaPuntas(g, x + 62, y - 36, 15, 5, -Math.PI / 2, 0.45); g.stroke();
    }
    g.restore();
  }
  // guirnalda de bombillas
  const BOMBILLAS = Array.from({ length: 22 }, (_, i) => { const u = i / 21, x = -20 + u * 1064, y = 26 + 34 * Math.sin(Math.PI * ((u * 3) % 1)); return { x, y, c: ["#ffd25a", "#ff6a5a", "#7fd0ff", "#a6f07a"][i % 4], f: hash(i + 77) }; });
  function guirnalda(g, t) {
    g.save(); g.strokeStyle = "#151012"; g.lineWidth = 2;
    g.beginPath(); for (let i = 0; i <= 60; i++) { const u = i / 60, x = -20 + u * 1064, y = 26 + 34 * Math.sin(Math.PI * ((u * 3) % 1)); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    for (const b of BOMBILLAS) {
      const k = 0.75 + 0.25 * Math.sin(t * 3 + b.f * 9);
      const hl = g.createRadialGradient(b.x, b.y + 8, 1, b.x, b.y + 8, 22); hl.addColorStop(0, b.c); hl.addColorStop(1, "rgba(0,0,0,0)");
      g.globalAlpha = 0.35 * k; g.fillStyle = hl; g.beginPath(); g.arc(b.x, b.y + 8, 22, 0, TAU); g.fill();
      g.globalAlpha = 1; g.fillStyle = b.c; g.beginPath(); g.ellipse(b.x, b.y + 8, 4.5, 6.5, 0, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
    }
    g.restore();
  }
  // lámpara colgante sobre el centro
  function lampara(g) {
    g.save(); g.strokeStyle = "#151012"; g.lineWidth = 2; g.beginPath(); g.moveTo(CX, -50); g.lineTo(CX, 62); g.stroke();
    g.fillStyle = "#2f4a3e"; g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.moveTo(CX - 10, 62); g.lineTo(CX + 10, 62); g.lineTo(CX + 38, 92); g.lineTo(CX - 38, 92); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#fff4c8"; g.beginPath(); g.ellipse(CX, 92, 38, 6, 0, 0, TAU); g.fill(); g.stroke();
    const cono = g.createLinearGradient(0, 92, 0, FY); cono.addColorStop(0, "rgba(255,236,190,0.22)"); cono.addColorStop(1, "rgba(255,236,190,0.03)");
    g.fillStyle = cono; g.beginPath(); g.moveTo(CX - 36, 94); g.lineTo(CX + 36, 94); g.lineTo(CX + 230, FY + 30); g.lineTo(CX - 230, FY + 30); g.closePath(); g.fill();
    g.restore();
  }

  /* ---------- notas que salen de la gramola (y se rompen al parar) ---------- */
  const NOTAS = []; for (let i = 0; i < 40; i++) { const t0 = BEAT0 + i * BEAT * 0.5; if (t0 > T.stop + 0.01) break; NOTAS.push({ t0, h: hash(i + 300), dbl: i % 3 === 1 }); }
  function nota(g, x, y, s, dbl, col, a) {
    g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.strokeStyle = TINTA; g.lineWidth = 1.6;
    const cab = (cx) => { g.beginPath(); g.ellipse(cx, 0, 6, 4.5, -0.4, 0, TAU); g.fill(); g.stroke(); };
    cab(0); g.fillRect(4.5, -20, 2.4, 20); g.strokeRect(4.5, -20, 2.4, 20);
    if (dbl) { cab(16); g.fillRect(20.5, -22, 2.4, 22); g.strokeRect(20.5, -22, 2.4, 22); g.fillRect(4.5, -22, 18.4, 4); g.strokeRect(4.5, -22, 18.4, 4); }
    else { g.beginPath(); g.moveTo(6.9, -20); g.quadraticCurveTo(16, -14, 12, -5); g.quadraticCurveTo(13, -12, 6.9, -13); g.closePath(); g.fill(); g.stroke(); }
    g.restore();
  }
  function notas(g, t) {
    const J = GRAMOLA, ox = J.x + 20, oy = J.base - J.alto + 10;
    const cols = ["#ffe35f", "#ff6aa8", "#7ff0ff", "#a6f07a"];
    for (const [i, n] of NOTAS.entries()) {
      const age = t - n.t0; if (age < 0) continue;
      const vida = 2.4;
      if (t <= T.stop) {
        if (age > vida) continue;
        const u = age / vida;
        const x = ox + 40 * u + 160 * u * (n.h - 0.2) + 12 * Math.sin(age * 4 + n.h * 6), y = oy - 30 - 120 * u;
        nota(g, x, y, 0.8 + 0.3 * n.h, n.dbl, cols[i % 4], Math.sin(Math.PI * Math.min(1, u * 1.2)) * 0.95);
      } else {
        // al parar la música: las notas que había se paran, se agrietan y caen
        const ageS = T.stop - n.t0; if (ageS > vida) continue;
        const u = ageS / vida, x0 = ox + 40 * u + 160 * u * (n.h - 0.2) + 12 * Math.sin(ageS * 4 + n.h * 6), y0 = oy - 30 - 120 * u;
        const tau = t - T.stop, a0 = Math.sin(Math.PI * Math.min(1, u * 1.2)) * 0.95;
        const cae = Math.max(0, tau - 0.1);
        nota(g, x0 + 20 * (n.h - 0.5) * cae, y0 + 380 * cae * cae, 0.8 + 0.3 * n.h, n.dbl, "#8a8790", a0 * (1 - fase(tau, 0.2, 0.75)));
      }
    }
  }
  // rayajo del disco: zigzag rojo y chispas sobre la gramola
  function rayajo(g, t) {
    const k = fase(t, T.stop, T.stop + 0.45); if (k <= 0 || k >= 1) return;
    const J = GRAMOLA, x = J.x, y = J.base - J.alto + 60;
    g.save(); g.globalAlpha = 1 - k * k; g.lineCap = "round"; g.lineJoin = "round";
    g.strokeStyle = TINTA; g.lineWidth = 8; const zig = () => { g.beginPath(); for (let i = 0; i <= 8; i++) { const xx = x - 70 + i * 17.5, yy = y + (i % 2 ? -16 : 16) * (1 + 0.3 * Math.sin(i)); i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); };
    zig(); g.strokeStyle = "#ff3b3b"; g.lineWidth = 4.5; zig();
    for (let i = 0; i < 7; i++) { const a = i * TAU / 7 + 0.3, r0 = 60 + 30 * k, r1 = r0 + 24; g.strokeStyle = "#ffe35f"; g.lineWidth = 3;
      g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0 * 0.7); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1 * 0.7); g.stroke(); }
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrellaPuntas(g, x, y, r, n, rot, ri) {
    g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr = i % 2 ? r * ri : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function nube(g, x, y, r, a) {
    if (a <= 0.01 || r <= 0.5) return;
    g.save(); g.globalAlpha = a; g.fillStyle = "#e9d8c2"; g.strokeStyle = "rgba(110,80,50,0.5)"; g.lineWidth = 1.5;
    g.beginPath(); for (let i = 0; i < 5; i++) { const an = i * TAU / 5; g.moveTo(x + Math.cos(an) * r * 0.5 + r * 0.6, y + Math.sin(an) * r * 0.4); g.arc(x + Math.cos(an) * r * 0.5, y + Math.sin(an) * r * 0.4, r * 0.6, 0, TAU); }
    g.fill(); g.stroke(); g.restore();
  }
  function polvo(g, t, t0, x, y, dir, n = 6, esc = 1) {
    const u = fase(t, t0, t0 + 0.9); if (u <= 0 || u >= 1) return;
    for (let i = 0; i < n; i++) {
      const h = hash(i + t0 * 37), d = (20 + 70 * h) * salida(u) * esc, r = (8 + 10 * hash(i + 9 + t0 * 11)) * (0.5 + u) * esc;
      nube(g, x + dir * d * (0.4 + h) + (i % 2 ? -1 : 1) * d * 0.4, y - 4 - 18 * u * hash(i + 3), r, 0.8 * (1 - u) * (1 - u));
    }
  }
  function impacto(g, t, t0, x, y, r0 = 46) {
    const k = fase(t, t0, t0 + 0.28); if (k <= 0 || k >= 1) return;
    const r = r0 * salida(k);
    g.save(); g.globalAlpha = 1 - k;
    estrellaPuntas(g, x, y, r, 8, 0.3, 0.55); g.fillStyle = "#fff6c8"; g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    g.restore();
  }
  function estrellitas(g, t, R, p, fx, k) {
    if (k <= 0.01) return;
    const c = aPantF(R, p, fx, R.cabeza(p).a(P(R === G ? 790 : 820, R === G ? 330 : 330)));
    const pts = [];
    for (let i = 0; i < 5; i++) { const a = t * 4.2 + i * TAU / 5 + (R === G ? 0 : 1); pts.push({ a, x: c.x + Math.cos(a) * 50, y: c.y - 34 + Math.sin(a) * 12, z: Math.sin(a) }); }
    pts.sort((u, v) => u.z - v.z);
    g.save();
    for (const q of pts) { const r = (8 + 3 * q.z) * k; estrellaPuntas(g, q.x, q.y, r, 5, t * 3 + q.a, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke(); }
    g.restore();
  }
  // rayitas de alarma («¡!» sin letras) alrededor de la cabeza al pararse la música
  function alarma(g, t, R, p, fx) {
    const k = dentro(t, T.stop, T.stop + 0.06, T.mira2 + 0.1, T.agacha); if (k <= 0.01) return;
    const c = aPantF(R, p, fx, R.cabeza(p).a(P(R === G ? 790 : 820, 300)));
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 3; g.lineCap = "round"; g.globalAlpha = k;
    for (let i = -2; i <= 2; i++) { const a = -Math.PI / 2 + i * 0.42, r0 = 82, r1 = 104 + 6 * Math.sin(t * 30 + i);
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // estela de giro alrededor del taburete con los dos encima
  function lineasGiro(g, t) {
    const v = Math.abs(velTaburete(t)), k = clamp((v - 4) / 8) * (1 - 0.3 * tramo(t, T.suelo + 0.1, T.suelo + 0.3));
    if (k <= 0.01) return;
    const th = thTaburete(t), libre = tramo(t, T.suelta2 - 0.02, T.suelta2 + 0.14);
    g.save(); g.strokeStyle = "white"; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const y = FY - lerp(120 + 95 * i, 140, libre);
      const r = lerp(120 - 6 * i, 70, libre), a0 = th * 0.6 + i * 1.9;
      g.globalAlpha = 0.75 * k * (i ? 1-libre : 1);
      if (g.globalAlpha > 0.001) { g.beginPath(); g.ellipse(CX, y, r, 15, 0, a0, a0 + 2); g.stroke(); }
    }
    g.restore();
  }
  // Sombra de contacto bajo cada personaje.
  function sombraPersona(g, x, y, a, rx = 60) {
    g.save(); g.fillStyle = `rgba(20,8,10,${a})`; g.beginPath(); g.ellipse(x, y + 2, rx, 9, 0, 0, TAU); g.fill(); g.restore();
  }

  /* =====================================================================================
   * DIBUJO DE UN PERSONAJE con su factor horizontal, su giro y (si va montado) el eje del taburete
   * ===================================================================================== */
  function proyeccion(R, o) {
    const pp = pelvisPant(R, o.p), th = o.giroEje ?? 0, c = Math.cos(th);
    return { x: CX + (pp.x - CX) * c, y: pp.y + (pp.x - CX) * Math.sin(th) * RY_SEAT / R_SEAT, f: o.fx * c };
  }
  // Al pasar de frente, las dos siluetas se funden con el mismo eje. Los centros siguen
  // recorriendo su órbita y se distingue al que pasa por delante del asiento.
  const PERFIL = 0.26;
  let vistaPerfil = null;
  function dibPersonaje(g, R, o, t) {
    const { p, rot } = o, pp = pelvisPant(R, p), pos = proyeccion(R, o);
    const w = Math.abs(pos.f);
    g.save(); g.translate(pos.x, pos.y); if (rot) g.rotate(rot);
    if (w >= PERFIL) {
      g.scale(pos.f, 1); g.translate(-pp.x, -pp.y); R.dibujar(g, p, t);
    } else {
      if (!vistaPerfil) {
        vistaPerfil = document.createElement("canvas");
        vistaPerfil.width = W; vistaPerfil.height = H;
      }
      const c = vistaPerfil.getContext("2d");
      c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,W,H); R.dibujar(c, p, t);
      const mezcla = suave((pos.f / PERFIL + 1) / 2), alfa = g.globalAlpha;
      g.scale(PERFIL, 1);
      g.globalAlpha = alfa * mezcla; g.drawImage(vistaPerfil, -pp.x, -pp.y);
      g.scale(-1, 1);
      g.globalAlpha = alfa * (1-mezcla); g.drawImage(vistaPerfil, -pp.x, -pp.y);
    }
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const cerca = tramo(t, T.aterriza - 0.2, T.giro0 + 0.8) * (1 - tramo(t, T.suelta2 - 0.3, T.suelo + 0.2));
    return { k: 1 + 0.06 * cerca, x: 512, y: 300 + 50 * cerca };
  }

  function poses(t) { return { g: pose("g", t), r: pose("r", t) }; }

  class SillasDeBar extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !RO.listo()) return;
      if (!fondo) fondo = creaFondo();
      const oG = pose("g", t), oR = pose("r", t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      let tb = 0;
      for (const [t0, a] of [[T.aterriza, 5], [T.suelo, 7]]) if (t >= t0) tb += a * Math.exp(-(t - t0) * 7) * suave(fase(t, t0, t0 + 0.03));
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -60, -50);
      gramolaViva(g, t); neon(g, t); guirnalda(g, t); lampara(g);
      notas(g, t); rayajo(g, t);

      // taburete B (el que se lleva Rodri): detrás de él
      const B = taburete2(t);
      const thA = thTaburete(t), vA = velTaburete(t);
      const A = { x: CX, y: FY, k: 1, th: thA, vel: vA, incl: 0 };
      // sombras
      sombraTab(g, A.x, A.y, 1);
      if (B.x < W + 120) sombraTab(g, B.x, B.y, 1, 0.28);
      for (const [o, R] of [[oG, G], [oR, RO]]) {
        if (o.est === "pie") sombraPersona(g, o.p.x, o.p.suelo, 0.28, 50);
        else if (o.est === "salto") {
          const salto = Math.sin(Math.PI * fase(t, T.salta, T.aterriza));
          sombraPersona(g, o.p.x, o.p.suelo, 0.28 - 0.12 * salto, 50 - 16 * salto);
        }
        else if (o.est === "vuelo") { const u = fase(t, T.suelta2, T.suelo); const d = CAE[R === G ? "g" : "r"]; sombraPersona(g, lerp(CX + (R === G ? -1 : 1) * RIDER, d.x, u) + 50 * (R === G ? 1 : -1) * suave(u), lerp(FY, d.y, u), 0.15 + 0.15 * u, 40 + 40 * u); }
        else if (o.est === "suelo") sombraPersona(g, o.p.x + 50 * o.fx, o.p.suelo, 0.3, 80);
      }

      // orden de dibujo
      const lista = [];
      if (B.x < W + 150) lista.push({ z: B.y - 0.5, f: () => taburete(g, B, t) });
      const montados = oG.est === "sentado" || oG.est === "salto";
      if (!montados) {
        lista.push({ z: FY, f: () => taburete(g, A, t) });
        for (const [o, R] of [[oG, G], [oR, RO]]) lista.push({ z: o.est === "pie" ? o.p.suelo + (R === RO && t < T.c0 ? 0.1 : 0) : o.p.suelo + 40, f: () => dibPersonaje(g, R, o, t) });
        lista.sort((a, b) => a.z - b.z);
        for (const it of lista) it.f();
      } else {
        for (const it of lista) it.f();
        // con los dos encima: pie del taburete, el de atrás, el asiento y el de delante
        const zG = -RIDER * Math.sin(thA), zR = RIDER * Math.sin(thA);
        const orden = [[oG, G, zG], [oR, RO, zR]].sort((a, b) => a[2] - b[2]);
        pieTab(g, A.x, A.y, 1, "detras");
        const atras = orden[0], delante = orden[1];
        const separa = Math.abs(Math.sin(thA)) > 0.35 && oG.est === "sentado";
        if (separa) dibPersonaje(g, atras[1], atras[0], t);
        pieTab(g, A.x, A.y, 1, "delante");
        const aplasta = cedeAsiento(t);
        asiento(g, A.x, A.y, 1, thA, vA, aplasta);
        if (!separa) dibPersonaje(g, atras[1], atras[0], t);
        dibPersonaje(g, delante[1], delante[0], t);
      }
      lineasGiro(g, t);
      // efectos
      impacto(g, t, T.aterriza, CX, FY - ASIENTO, 34);
      polvo(g, t, T.suelo, CAE.g.x + 10, CAE.g.y, -1, 7);
      polvo(g, t, T.suelo, CAE.r.x - 10, CAE.r.y, 1, 7);
      impacto(g, t, T.suelo, CAE.g.x - 10, CAE.g.y - 20, 34); impacto(g, t, T.suelo, CAE.r.x + 10, CAE.r.y - 20, 34);
      polvo(g, t, T.suelta, taburete2(T.suelta).x, FY, 1, 4, 0.7);
      for (const [o, R] of [[oG, G], [oR, RO]]) {
        if (o.p.estrellas) estrellitas(g, t, R, o.p, o.fx, o.p.estrellas);
        if (o.est === "pie") alarma(g, t, R, o.p, o.fx);
      }
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00112.2", nombre: "Guillermo y Rodri · Las sillas de bar", crear: () => new SillasDeBar() });
  window.__A2D_00112_2 = { pose: poses, T, DUR, thTaburete, taburete2, andar, aPantF, pelvisPant, R_SEAT, R_ARO, ASIENTO, CX, FY, RIDER, PARCHE, velTaburete, DATOS, pieDe, kRig, bordeTaburete, cedeAsiento, proyeccion, dibPersonaje, PERFIL, ALTURA_CADERA, thVuelo };
})();
