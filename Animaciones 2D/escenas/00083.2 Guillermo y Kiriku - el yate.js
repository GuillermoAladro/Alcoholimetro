"use strict";
/* 00083.2 · Guillermo y Kiriku · El yate
 *
 * Negro → cubierta de un barquito en alta mar a pleno sol: cielo azul con nubes, el sol arriba a la
 * izquierda con su estela en el agua, una isla lejana y un velero en el horizonte, gaviotas que planean.
 * Cubierta de teca, borda blanca con barandilla de acero y, a la derecha, la cabina blanca con su ojo de
 * buey, un salvavidas y un mástil con banderín. El barco se mece con la mar de fondo: el barco y los dos
 * personajes giran y suben y bajan juntos; el horizonte se queda quieto.
 * Kiriku, impecable, sorbe su cóctel con pajita (vaso con sombrillita de papel y rodaja de naranja):
 * compensa el balanceo con el cuerpo y el vaso no se mueve ni un milímetro. Guillermo disfruta del aire
 * del mar… hasta que se marea: se balancea a destiempo, se pone verde poco a poco, abre los brazos como
 * un surfista, ojos en espiral, se le hinchan los carrillos y se tapa la boca; se tambalea hasta la
 * barandilla y se agarra. Traga, alivio… y a su espalda se levanta una ola enorme (Kiriku la ve, da un
 * pasito a un lado y pone el vaso a salvo): ¡chof!, le cae entera encima, solo a él. Empapado: el pelo
 * aplastado y chorreando, gotas por todas partes y un charco a sus pies; de entre los mechones se escapa
 * un pececillo que salta de vuelta al mar.
 * Una gaviota baja del cielo y se le posa en la cabeza. Kiriku, seco y tan tranquilo, se acerca de
 * puntillas, saca la sombrillita del cóctel y se la ofrece con una reverencia; Guillermo la coge y la
 * sostiene sobre la cabeza… y a cubierto se queda la gaviota. Mirada a cámara; Kiriku sorbe y guiña → negro.
 *
 * Sin textos. Todo depende solo de `t`. Desde el chapuzón Guillermo se pinta en un lienzo aparte (del
 * tamaño del lienzo de salida): así se le pueden borrar las púas del pelo («destination-out») y mojarle
 * la ropa («source-atop») sin tocar el fondo, que se mueve con el barco.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, entrada, salida, tramo, campana, mezcla, hash } = M2;
  const G = Guillermo, K = Kiriku, R = Recortes;
  const S = 0.30, DUR = 14.8, TAU = Math.PI * 2;
  const KK = K.K, SK = S * KK;
  const SUELO = 548;                                   // cubierta bajo los pies (marco del barco)
  const TINTA = "#0b0a0e";
  const HORIZ = 250;                                   // horizonte (marco de la cámara)
  const RAIL = 350, RAIL2 = 402, RAIL3 = 430, BORDA = 452, CUB = 478;   // barandilla y borda (marco del barco)
  const CAB_X = 852;                                   // pared izquierda de la cabina
  const PIV = { x: 512, y: 548 };                      // eje del balanceo
  const T = {
    gMira: 0.55, respira0: 0.95, respira1: 1.6,
    k1a: 0.62, k1b: 1.02, k1c: 2.0, k1d: 2.42,
    mareo0: 1.75, mareo1: 3.4, verde0: 2.45, verde1: 5.0,
    kMira: 2.85, k2a: 3.5, k2b: 3.82, k2c: 4.4, k2d: 4.78,
    brazos0: 3.0, espiral0: 3.55, espiral1: 4.3, mof: 4.32, boca: 4.44,
    tamb0: 4.95, agarra: 5.86, traga: 6.2, alivio: 6.45,
    ola0: 6.55, kVe: 6.92, kPaso0: 7.12, kPaso1: 7.5, olaTop: 7.55, cae: 7.8, cubre: 7.95, cambio: 8.02, destapa: 8.24,
    moja: 8.3, pez0: 8.84, pez1: 9.75, harto: 9.85,
    gav0: 9.25, gavFrena: 9.92, gavPosa: 10.3, ojosArriba: 10.42,
    kAnda0: 10.72, kAnda1: 11.7, quita0: 11.76, quita: 11.98, ofrece0: 12.04, ofrece1: 12.38, toma: 12.5,
    alza0: 12.8, alza1: 13.2, final: 13.26, k3a: 13.28, k3b: 13.55, guino: 13.86, fin: 14.2
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const rot = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const suma = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
  const difAng = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const Dd = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? m ?? i, menique: me ?? a ?? m ?? i });
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n], b[n], k); return o; };
  const RELAJ = Dd(0.55, 0.6, 0.55, 0.5, 0.45), ABIERTA = Dd(1, 1), PALMA = Dd(0.8, 0.95, 0.95, 0.92, 0.88),
    AGARRA = Dd(0.5, 0.36, 0.32, 0.3, 0.28), VASO = Dd(0.45, 0.42, 0.38, 0.36, 0.34), PINZA = Dd(0.8, 0.55, 0.12, 0.1, 0.1),
    PINZA_A = Dd(1, 0.85, 0.2, 0.16, 0.14), LACIA = Dd(0.6, 0.72, 0.68, 0.64, 0.6), ESCURRE = Dd(0.9, 0.95, 0.92, 0.88, 0.85);
  // pie: lista de pasos [t0, t1, x, alza]
  function pie(lista, t) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x, alza = 24] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    return { x: lerp(xa, x, suave5(u)), alza: alza * Math.sin(Math.PI * u), u };
  }
  const lienzo = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };

  /* ---------- el barco se mece (marco del barco → marco de la cámara) ---------- */
  const W1 = TAU / 3.4, W2 = TAU / 2.15;
  function angB(t) {
    let a = 0.028 * Math.sin(W1 * t + 0.5) + 0.008 * Math.sin(W2 * t + 1.7);
    const v = t - T.cubre;
    if (v < 0) a += 0.024 * tramo(t, T.ola0 + 0.4, T.cubre);               // la ola levanta la banda izquierda
    else a += Math.exp(-v * 2.1) * (0.024 * Math.cos(v * 5.4) + 0.03 * Math.sin(v * 5.4));   // bandazo amortiguado
    return a;
  }
  function bobB(t) {
    let y = 4.5 * Math.sin(W1 * t + 1.9) + 2.2 * Math.sin(W2 * t + 0.3);
    const v = t - T.cubre; if (v > 0) y += 8 * Math.exp(-v * 3) * Math.sin(v * 7);
    return y;
  }
  const aCamara = (q, t) => { const a = angB(t), d = rot({ x: q.x - PIV.x, y: q.y - PIV.y }, a); return { x: PIV.x + d.x, y: PIV.y + bobB(t) + d.y }; };
  function aplicaBarco(g, t) { g.translate(PIV.x, PIV.y + bobB(t)); g.rotate(angB(t)); g.translate(-PIV.x, -PIV.y); }

  /* ---------- manos por pistas (como en las escenas anteriores) ---------- */
  const SJ = new Map([[G, { l: G.BRAZO_L * 0.5, c: G.A.datos.piezas.brazo_cerca.codo }],
                      [K, { l: K.A.datos.piezas.brazo.codo, c: K.A.datos.piezas.brazo_cerca.codo }]]);
  const MU_BOLS = -1.75;
  function pista(lista, p, t) {
    const res = o => ({ q: o.en(p, t), mx: o.mx ?? 0, puno: o.puno ?? 1, fm: o.bolsillo ? 1 : 0,
      dedos: typeof o.dedos === "function" ? o.dedos(t) : (o.dedos || RELAJ) });
    let base = lista.length - 1;
    while (base > 0 && (t <= lista[base][0] || t < lista[base][1])) base--;
    let c = res(lista[base][2]);
    for (let i = base + 1; i < lista.length; i++) {
      const [t0, t1, o, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)); if (k <= 0) continue;
      const d = res(o);
      c = { q: mezcla(c.q, d.q, k), mx: lerp(c.mx, d.mx, k), puno: lerp(c.puno, d.puno, k), fm: lerp(c.fm, d.fm, k), dedos: mezclaD(c.dedos, d.dedos, k) };
    }
    return c;
  }
  function manoDe(rig, p, lado, h, dobla) {
    const Tr = rig.tronco(p), cerca = lado === "c";
    const hom = Tr(cerca ? rig.HOMBRO_C : rig.HOMBRO);
    const L = cerca ? rig.BRAZO_C_L : rig.BRAZO_L, sj = SJ.get(rig)[lado];
    const c = R.ik(hom, h.q, L, sj, 42, dobla, 1.08), d = R.dir(c.a1);
    const e = { x: hom.x + d.x * sj * c.estira, y: hom.y + d.y * sj * c.estira };
    let mu = Math.atan2(e.y - h.q.y, e.x - h.q.x) + h.mx;
    if (h.fm > 0) mu += difAng(mu, MU_BOLS) * h.fm;
    return { x: h.q.x, y: h.q.y, ang: 0, mu, dobla, puno: h.puno, dedos: h.dedos };
  }
  // punto de la pinza (entre las yemas del índice y del pulgar) respecto al centro de la mano, en unidades de mano
  const PINZA_PT = { x: 12, y: 10.5 };
  const pinzaHoja = (rig, m) => { const q = rot({ x: PINZA_PT.x * rig.JK, y: PINZA_PT.y * rig.JK }, m.mu + Math.PI / 2); return { x: m.x + q.x, y: m.y + q.y }; };
  const pinzaPant = (rig, p, m) => rig.aPantalla(p, pinzaHoja(rig, m));
  // centro de la mano para que la pinza caiga en q (pantalla, marco del barco)
  const pinzaEn = (rig, lado, dobla, qf, mx = 0) => (p, t) => {
    const qq = rig.aHoja(p, qf(p, t));
    let centro = { x: qq.x, y: qq.y };
    // La inclinación de la muñeca también varía al corregir el centro de la mano.
    for (let i = 0; i < 8; i++) {
      const mano = manoDe(rig, p, lado, { q: centro, mx, puno: 1, fm: 0, dedos: PINZA }, dobla);
      const pinza = pinzaHoja(rig, mano);
      const dx = qq.x - pinza.x, dy = qq.y - pinza.y;
      if (Math.hypot(dx, dy) < 0.03) break;
      centro = { x: centro.x + dx, y: centro.y + dy };
    }
    return centro;
  };

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, rub: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* =====================================================================================
   * LA SOMBRILLITA Y EL VASO
   * ===================================================================================== */
  const SOMB = { L: 68, R: 24 };
  const U_K = 0.62, U_G = 0.06;                   // por dónde agarra el palito cada uno (0 = pie, 1 = punta)
  const TH_VASO = -0.75, TH_OFRECE = Math.PI / 2, TH_ALTO = 0.6;
  const BASE_VASO = { x: -4, y: -6 };             // pie del palito dentro del vaso (marco del vaso)
  const PAJITA = { x: 11, y: -44 };                // punta de la pajita (marco del vaso)
  const dirTh = th => ({ x: Math.sin(th), y: -Math.cos(th) });
  const vasoEn = pk => K.aPantalla(pk, { x: pk.manoCerca.x, y: pk.manoCerca.y });
  function sombrillaEnVaso(pk, t, u) {
    const o = vasoEn(pk), d = dirTh(TH_VASO);
    const r = rot({ x: BASE_VASO.x + d.x * SOMB.L * u, y: BASE_VASO.y + d.y * SOMB.L * u }, -angB(t));
    return { x: o.x + r.x, y: o.y + r.y };
  }
  const desdeAgarre = (q, th, u) => { const d = dirTh(th); return { base: { x: q.x - d.x * SOMB.L * u, y: q.y - d.y * SOMB.L * u }, th }; };
  const puntoDe = (s, u) => { const d = dirTh(s.th); return { x: s.base.x + d.x * SOMB.L * u, y: s.base.y + d.y * SOMB.L * u }; };
  const thKiriku = t => lerp(TH_VASO - angB(T.quita), TH_OFRECE, suave(fase(t, T.quita + 0.04, T.ofrece1)));
  function sombrilla(t, pg, pk) {
    if (t < T.quita) return { base: sombrillaEnVaso(pk, t, 0), th: TH_VASO - angB(t), vaso: true };
    if (t < T.toma) return desdeAgarre(pinzaPant(K, pk, pk.manoLejos), thKiriku(t), U_K);
    const th = TH_OFRECE - 0.32 * suave(fase(t, T.toma + 0.02, T.toma + 0.28)) - (TH_OFRECE - 0.32 + 0.15) * suave(fase(t, T.toma + 0.2, T.alza0 + 0.12))
      + (TH_ALTO + 0.15) * suave(fase(t, T.alza0 + 0.2, T.alza1 + 0.06));
    return desdeAgarre(pinzaPant(G, pg, pg.manoCerca), th, U_G);
  }

  /* =====================================================================================
   * KIRIKU (mira a la izquierda; siempre vertical respecto al mar)
   * ===================================================================================== */
  const TOB_K = K.SUELO - K.TOBILLO_ALTO;
  const HH_K = (K.SUELO - K.PELVIS.y) * SK;
  const PASOS_K = {
    lejos: [[-9, -8, 668], [T.kPaso0, T.kPaso0 + 0.2, 698, 14], [10.72, 10.98, 588, 24], [11.22, 11.48, 477, 30]],
    cerca: [[-9, -8, 712], [T.kPaso0 + 0.17, T.kPaso0 + 0.37, 742, 12], [10.96, 11.22, 633, 26], [11.44, 11.7, 523, 22]]
  };
  const CARAS_K = {
    base: E({ mx: 0.85, my: 0.1, c: 0.28, sd: 4, si: 8, gi: 0.04, sonr: 0.45 }),
    sorbe: E({ mx: 0.6, my: 0.6, c: 1, h: 0.35, sd: 10, si: 12, abre: 0, ancho: 0.42, sonr: 0.12 }),
    rico: E({ mx: 0.6, my: 0.2, c: 1, h: 1, sd: 14, si: 16, abre: 0, ancho: 0.8, sonr: 0.7, rub: 0.15 }),
    miraG: E({ mx: 0.95, my: 0.15, c: 0.3, sd: 2, gd: -0.06, si: 22, gi: 0.14, sonr: 0.3 }),
    veOla: E({ mx: 0.95, my: -0.5, iris: 0.8, c: 0.05, sd: 16, si: 22, gi: 0.08, abre: 5, ancho: 0.5, sonr: 0.05 }),
    tranquilo: E({ mx: 0.9, my: 0.2, c: 0.38, sd: 6, si: 14, gi: 0.06, sonr: 0.6 }),
    gracia: E({ mx: 0.95, my: -0.3, c: 0.3, sd: 4, gd: -0.04, si: 24, gi: 0.16, abre: 0, sonr: 0.75 }),
    ofrece: E({ mx: 0.95, my: 0.2, c: 0.3, h: 0.3, sd: 12, si: 16, abre: 4, ancho: 0.9, sonr: 0.85 }),
    camara: E({ mx: -0.85, my: 0, c: 0.25, sd: 4, si: 16, gi: 0.1, sonr: 0.55 }),
    guino: E({ mx: -0.85, my: 0, c: 0.06, wd: 0.94, sd: -2, gd: -0.06, si: 20, gi: 0.12, abre: 4, ancho: 1.02, sonr: 0.95 })
  };
  const GUION_CARA_K = [
    [T.k1a + 0.15, T.k1b, "sorbe"], [T.k1c, T.k1c + 0.15, "rico"], [T.k1d, T.k1d + 0.2, "base"], [T.kMira, T.kMira + 0.15, "miraG"],
    [T.k2a + 0.1, T.k2b, "sorbe"], [T.k2c, T.k2c + 0.15, "rico"], [T.k2d, T.k2d + 0.2, "miraG"], [T.agarra + 0.4, T.agarra + 0.6, "base"],
    [T.kVe, T.kVe + 0.12, "veOla"], [T.moja + 0.2, T.moja + 0.4, "tranquilo"], [T.pez0 + 0.1, T.pez0 + 0.25, "miraG"],
    [T.gavPosa - 0.2, T.gavPosa, "gracia"], [T.kAnda0, T.kAnda0 + 0.3, "tranquilo"], [T.ofrece0, T.ofrece0 + 0.2, "ofrece"],
    [T.toma + 0.3, T.toma + 0.5, "tranquilo"], [T.k3a + 0.1, T.k3b, "sorbe"], [T.guino - 0.25, T.guino - 0.05, "camara"],
    [T.guino, T.guino + 0.1, "guino"]
  ];
  const PARP_K = [1.0, 2.6, 5.2, 6.4, 9.05, 10.1, 11.9, 12.95];
  const CUERPOS_K = {
    base: { torso: 0, cab: 0, pel: 0, px: 0, lean: 0, cdy: 0 },
    sorbe: { torso: 0.02, cab: 0.07, pel: 0, px: 0, lean: 0, cdy: 2 },
    miraG: { torso: 0.0, cab: -0.04, pel: 0, px: 0, lean: 0, cdy: 0 },
    veOla: { torso: -0.07, cab: -0.12, pel: 6, px: 0, lean: 0.03, cdy: 0 },
    protege: { torso: -0.05, cab: -0.04, pel: 10, px: 0, lean: 0.02, cdy: 0 },
    anda: { torso: 0.05, cab: 0.02, pel: 0, px: 0, lean: 0, cdy: 0 },
    quita: { torso: 0.07, cab: 0.1, pel: 4, px: 0, lean: 0, cdy: 0 },
    ofrece: { torso: 0.15, cab: 0.14, pel: 10, px: 0, lean: 0, cdy: 0 },
    final: { torso: 0, cab: 0.02, pel: 0, px: 0, lean: 0, cdy: 0 }
  };
  const GUION_K = [
    [T.k1a, T.k1b, "sorbe"], [T.k1c, T.k1d, "base"], [T.k2a, T.k2b, "sorbe"], [T.k2c, T.k2d, "miraG"],
    [T.kVe, T.kVe + 0.2, "veOla"], [T.kPaso0 + 0.2, T.kPaso1, "protege"], [T.moja + 0.3, T.moja + 0.7, "base"],
    [T.kAnda0, T.kAnda0 + 0.25, "anda"], [T.quita0 - 0.1, T.quita0 + 0.1, "quita"], [T.ofrece0, T.ofrece1, "ofrece"],
    [T.toma + 0.25, T.toma + 0.6, "final"], [T.k3a, T.k3b, "sorbe"], [T.guino - 0.3, T.guino, "final"]
  ];
  const nivelVaso = t => 1 - 0.16 * tramo(t, T.k1b, T.k1c) - 0.12 * tramo(t, T.k2b, T.k2c) - 0.1 * tramo(t, T.k3b, T.k3b + 0.8);
  const sorbiendo = t => Math.max(dentro(t, T.k1b - 0.05, T.k1b + 0.05, T.k1c - 0.05, T.k1c + 0.05),
    dentro(t, T.k2b - 0.05, T.k2b + 0.05, T.k2c - 0.05, T.k2c + 0.05), tramo(t, T.k3b - 0.05, T.k3b + 0.05) * (1 - tramo(t, T.guino - 0.4, T.guino - 0.25)));

  function poseK(t) {
    const b = guion(GUION_K, CUERPOS_K, "base", t);
    const fl = pie(PASOS_K.lejos, t), fc = pie(PASOS_K.cerca, t);
    const respira = Math.sin(t * 2.0 + 0.6);
    const beta = -angB(t) + b.lean;                       // en vertical respecto al mar
    const xF = (fl.x + fc.x) / 2;
    const px = xF + HH_K * Math.sin(beta) + b.px;
    const alza = Math.max(fl.alza, fc.alza);
    // rodillas que amortiguan la mar, elegantes
    const flex = 5 * (0.5 + 0.5 * Math.sin(W1 * t * 2 + 0.4)) + 10 * dentro(t, T.cubre - 0.05, T.cubre + 0.1, T.cubre + 0.4, T.cubre + 0.9);
    const p = { x: px, xF, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, ikContinuo: true, piernas: {},
      pelvis: { x: K.PELVIS.x, y: K.PELVIS.y - 0.22 * alza / SK + b.pel + flex + respira * 2 },
      torso: -beta + b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      cabeza: { ang: -beta + b.cab, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } } };
    // pasos: de puntillas al cruzar lo mojado
    const puntillas = dentro(t, 11.15, 11.25, 11.55, 11.7);
    for (const [lado, f] of [["lejos", fl], ["cerca", fc]]) {
      p.piernas[lado] = { tob: { x: K.PELVIS.x - (f.x - px) / SK, y: TOB_K - (lado === "lejos" ? 10 : 0) - f.alza / SK - 20 * puntillas },
        ang: -0.2 * Math.sin(Math.PI * f.u) * (f.alza > 0.5 ? 1 : 0) + 0.38 * puntillas };
    }
    // el agua llega a sus pies: levanta la puntera
    p.piernas.lejos.ang -= 0.42 * dentro(t, 8.18, 8.32, 8.6, 8.8);
    // asiente con la reverencia
    p.cabeza.ang += 0.08 * campana(t, T.ofrece1 - 0.2, T.ofrece1 + 0.25);
    const e = guion(GUION_CARA_K, CARAS_K, "base", t);
    p.cara = cara(e, parpadeo(t, PARP_K));
    p.nivel = nivelVaso(t); p.sorbe = sorbiendo(t);
    manosK(p, t);
    return p;
  }

  /* ---------- manos de Kiriku: la cercana lleva el vaso; la lejana, la sombrillita ---------- */
  const trK = q => p => K.tronco(p)(q);
  const deHombroK = (lado, d) => p => { const h = K.tronco(p)(lado === "c" ? K.HOMBRO_C : K.HOMBRO); return { x: h.x + d.x, y: h.y + d.y }; };
  const VASO_REPOSO = { x: 322, y: 505 }, VASO_ATRAS = { x: 205, y: 560 }, VASO_DELANTE = { x: 430, y: 540 };
  const sorbo = (p, t) => {
    const bo = K.aPantalla(p, K.boca(p)), off = rot(PAJITA, -angB(t));
    return K.aHoja(p, { x: bo.x - off.x, y: bo.y - off.y });
  };
  const DOB_KC = -1, DOB_KL = -1;
  const OFRECE = { x: 384, y: 262 };
  const PISTA_KC = [
    [0, 0, { en: trK(VASO_REPOSO), dedos: VASO }],
    [T.k1a, T.k1b, { en: sorbo, dedos: VASO }],
    [T.k1c, T.k1d, { en: trK(VASO_REPOSO), dedos: VASO }],
    [T.k2a, T.k2b, { en: sorbo, dedos: VASO }],
    [T.k2c, T.k2d, { en: trK(VASO_REPOSO), dedos: VASO }],
    [T.kVe + 0.2, T.kPaso1 + 0.1, { en: trK(VASO_ATRAS), dedos: VASO }],
    [T.moja + 0.3, T.moja + 0.75, { en: trK(VASO_REPOSO), dedos: VASO }],
    [T.quita0 - 0.3, T.quita0, { en: trK(VASO_DELANTE), dedos: VASO }],
    [T.ofrece1, T.ofrece1 + 0.35, { en: trK(VASO_REPOSO), dedos: VASO }],
    [T.k3a, T.k3b, { en: sorbo, dedos: VASO }]
  ];
  const PISTA_KL = [
    [0, 0, { en: trK(K.BOLSILLO_L), puno: 0, bolsillo: 1 }],
    [T.cubre - 0.18, T.cubre + 0.08, { en: deHombroK("l", { x: 150, y: 175 }), dedos: ABIERTA }],
    [T.moja + 0.45, T.moja + 0.85, { en: trK(K.BOLSILLO_L), puno: 0, bolsillo: 1 }],
    [T.quita0, T.quita0 + 0.16, { en: pinzaEn(K, "l", DOB_KL, (p, t) => sombrillaEnVaso(p, t, U_K)), dedos: PINZA_A }],
    [T.quita0 + 0.16, T.quita, { en: pinzaEn(K, "l", DOB_KL, (p, t) => sombrillaEnVaso(p, t, U_K)), dedos: PINZA }],
    [T.quita + 0.01, T.ofrece0 + 0.06, { en: pinzaEn(K, "l", DOB_KL, (p, t) => { const q = sombrillaEnVaso(p, t, U_K); return { x: q.x - 16, y: q.y - 14 }; }), dedos: PINZA }],
    [T.ofrece0 + 0.06, T.ofrece1, { en: pinzaEn(K, "l", DOB_KL, () => OFRECE), dedos: PINZA }],
    [T.toma + 0.03, T.toma + 0.12, { en: pinzaEn(K, "l", DOB_KL, () => OFRECE), dedos: PINZA_A }],
    [T.toma + 0.22, T.toma + 0.62, { en: trK(K.BOLSILLO_L), puno: 0, bolsillo: 1 }]
  ];
  // vaso en la mano: se dibuja en píxeles de pantalla, siempre derecho respecto al mar
  const KV = 1 / (K.JK * SK);
  function manosK(p, t) {
    p.manoCerca = manoDe(K, p, "c", pista(PISTA_KC, p, t), DOB_KC);
    p.manoLejos = manoDe(K, p, "l", pista(PISTA_KL, p, t), DOB_KL);
    const conSomb = t < T.quita, nivel = p.nivel, sorbe = p.sorbe;
    p.manoCerca.objeto = g => { g.save(); g.scale(-KV, KV); g.rotate(-angB(t)); dibVaso(g, nivel, sorbe, conSomb); g.restore(); };
  }

  /* =====================================================================================
   * GUILLERMO (mira a la derecha; se marea, se moja)
   * ===================================================================================== */
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const HH_G = (G.SUELO - G.PELVIS.y) * S;
  const XG0 = 330;
  const PASOS_G = {
    cerca: [[-9, -8, XG0 - 20], [3.0, 3.22, 296, 16], [4.98, 5.2, 276, 20], [5.34, 5.56, 262, 22], [5.66, 5.84, 268, 8]],
    lejos: [[-9, -8, XG0 + 22], [3.1, 3.32, 378, 16], [5.1, 5.32, 332, 22], [5.48, 5.7, 314, 18]]
  };
  const CARAS_G = {
    mira: E({ mx: 0.9, my: 0.05, c: 0.12, sd: 4, si: 6, sonr: 0.3, ancho: 0.95 }),
    disfruta: E({ mx: 0.5, my: -0.5, c: 1, h: 1, sd: 14, si: 14, abre: 0, ancho: 0.85, sonr: 0.7 }),
    duda: E({ mx: 0.2, my: 0.35, c: 0.3, sd: 10, gd: 0.1, si: 12, gi: 0.1, abre: 0, ancho: 0.7, sonr: -0.05 }),
    mareado: E({ mx: 0.1, my: 0.15, iris: 0.8, c: 0.5, sd: 2, gd: 0.16, si: 2, gi: 0.16, abre: 6, ancho: 0.62, sonr: -0.35 }),
    espiral: E({ mx: 0, my: 0, c: 0.15, esp: 1, sd: 8, gd: 0.1, si: 8, gi: 0.1, abre: 10, ancho: 0.66, sonr: -0.4 }),
    nausea: E({ mx: 0.3, my: 0.1, c: 0.62, z: 0.5, sd: 8, gd: -0.2, si: 8, gi: -0.2, abre: 0, ancho: 0.55, sonr: -0.5, mof: 1 }),
    aguanta: E({ mx: 0.6, my: 0.3, iris: 0.6, c: 0.05, sd: 26, gd: 0.12, si: 26, gi: 0.12, abre: 0, ancho: 0.5, sonr: -0.45, mof: 1 }),
    traga: E({ mx: 0.2, my: 0.3, c: 1, z: 0.6, sd: 10, gd: -0.12, si: 10, gi: -0.12, abre: 0, ancho: 0.5, sonr: -0.3, mof: 0 }),
    alivio: E({ mx: 0.3, my: -0.6, c: 1, h: 0.7, sd: 12, gd: 0.06, si: 12, gi: 0.06, abre: 6, ancho: 0.8, sonr: 0.35 }),
    empapado: E({ mx: 0.4, my: 0.1, iris: 0.42, sd: 30, gd: 0.1, si: 32, gi: 0.12, abre: 0, ancho: 0.45, sonr: -0.3, mof: 0.9 }),
    pez: E({ mx: -0.3, my: -0.9, iris: 0.75, c: 0.1, sd: 18, gd: 0.04, si: 24, gi: 0.1, abre: 6, ancho: 0.5, sonr: -0.2, mof: 0 }),
    pezCae: E({ mx: -0.85, my: 0.2, c: 0.3, sd: 10, si: 16, gi: 0.06, abre: 2, ancho: 0.55, sonr: -0.2 }),
    harto: E({ mx: -0.65, my: 0.05, c: 0.5, sd: 2, gd: -0.06, si: 4, gi: -0.04, abre: 0, ancho: 0.72, sonr: -0.22 }),
    arriba: E({ mx: -0.2, my: -0.95, c: 0.35, sd: 8, si: 16, gi: 0.08, abre: 0, ancho: 0.7, sonr: -0.25 }),
    miraK: E({ mx: 0.9, my: 0.1, c: 0.4, sd: 8, si: 14, gi: 0.06, abre: 0, ancho: 0.72, sonr: -0.15 }),
    recibe: E({ mx: 0.9, my: 0.35, c: 0.2, sd: 14, gd: 0.04, si: 22, gi: 0.12, abre: 4, ancho: 0.6, sonr: 0.05 }),
    final: E({ mx: -0.7, my: 0.05, c: 0.48, sd: 6, gd: -0.05, si: 12, gi: 0.08, abre: 0, ancho: 0.74, sonr: -0.18 })
  };
  const GUION_CARA_G = [
    [T.gMira, T.gMira + 0.2, "mira"], [T.respira0, T.respira0 + 0.2, "disfruta"], [T.respira1 + 0.15, T.respira1 + 0.4, "duda"],
    [2.75, 3.1, "mareado"], [T.espiral0, T.espiral0 + 0.15, "espiral"], [T.espiral1, T.espiral1 + 0.1, "nausea"],
    [T.boca - 0.02, T.boca + 0.12, "aguanta"], [T.traga - 0.05, T.traga + 0.1, "traga"], [T.alivio, T.alivio + 0.3, "alivio"],
    [T.cambio, T.cambio + 0.05, "empapado"], [T.pez0 + 0.02, T.pez0 + 0.14, "pez"], [T.pez0 + 0.55, T.pez0 + 0.8, "pezCae"], [T.harto - 0.1, T.harto + 0.15, "harto"],
    [T.ojosArriba, T.ojosArriba + 0.2, "arriba"], [11.35, 11.6, "miraK"], [T.ofrece0 + 0.1, T.ofrece0 + 0.3, "recibe"],
    [T.alza1 - 0.2, T.final, "final"]
  ];
  const PARP_G = [0.4, 2.3, 6.9, 8.62, 9.7, 11.0, 12.2, 13.6];
  const CUERPOS_G = {
    base: { torso: 0, cab: 0, pel: 0, px: 0, lean: 0, pecho: 0, cdy: 0 },
    disfruta: { torso: -0.05, cab: -0.14, pel: 0, px: 0, lean: 0, pecho: 0.03, cdy: -5 },
    mareo: { torso: 0.04, cab: 0.08, pel: 10, px: 0, lean: 0, pecho: 0, cdy: 0 },
    surf: { torso: 0, cab: 0.02, pel: 34, px: 0, lean: 0, pecho: 0, cdy: 0 },
    nausea: { torso: 0.14, cab: 0.14, pel: 20, px: 0, lean: 0.02, pecho: -0.01, cdy: 0 },
    tambalea: { torso: -0.04, cab: -0.1, pel: 16, px: 0, lean: -0.04, pecho: 0, cdy: 0 },
    apoyado: { torso: -0.14, cab: -0.16, pel: 26, px: -4, lean: 0, pecho: 0, cdy: 0 },
    alivio: { torso: -0.2, cab: -0.34, pel: 28, px: -6, lean: 0, pecho: 0.02, cdy: 0 },
    empapado: { torso: 0.03, cab: 0.06, pel: 8, px: 0, lean: 0, pecho: 0, cdy: 0 },
    pez: { torso: -0.04, cab: -0.12, pel: 10, px: 0, lean: 0, pecho: 0, cdy: 0 },
    harto: { torso: 0.0, cab: 0.04, pel: 10, px: 0, lean: 0, pecho: 0, cdy: 2 },
    recibe: { torso: 0.07, cab: 0.04, pel: 8, px: 0, lean: 0, pecho: 0, cdy: 0 },
    alza: { torso: -0.04, cab: -0.04, pel: 6, px: 0, lean: 0, pecho: 0, cdy: 0 }
  };
  const GUION_G = [
    [T.respira0, T.respira0 + 0.35, "disfruta"], [T.respira1, T.respira1 + 0.3, "base"], [2.6, 3.0, "mareo"],
    [T.brazos0, T.brazos0 + 0.3, "surf"], [T.espiral1, T.mof + 0.2, "nausea"], [T.tamb0, T.tamb0 + 0.2, "tambalea"],
    [T.agarra - 0.1, T.agarra + 0.15, "apoyado"], [T.alivio, T.alivio + 0.4, "alivio"], [T.cubre + 0.02, T.destapa - 0.02, "empapado"],
    [T.pez0 + 0.02, T.pez0 + 0.3, "pez"], [T.pez1 - 0.15, T.harto + 0.1, "harto"], [T.ofrece0 + 0.05, T.toma, "recibe"],
    [T.alza0, T.alza1, "alza"]
  ];
  const mareo = t => tramo(t, T.mareo0, T.mareo1) * (1 - 0.7 * tramo(t, T.cubre, T.moja + 0.4));
  const agarrado = t => dentro(t, T.agarra - 0.2, T.agarra + 0.15, T.cubre, T.cubre + 0.1);
  function inclinaG(t) {
    const k = mareo(t), a = angB(t);
    const vaiven = k * (0.11 * Math.sin(W1 * t - 2.3) + 0.04 * Math.sin(2.35 * t + 0.6) + 0.015 * Math.sin(5.1 * t)) * (1 - 0.7 * agarrado(t));
    return -a * (1 - 0.75 * k) + vaiven;
  }
  const verdeG = t => tramo(t, T.verde0, T.verde1) * (1 - 0.3 * tramo(t, T.moja, T.moja + 1.2));

  let PK = null;   // pose de Kiriku de este instante (para el relevo de la sombrillita)
  function poseG(t) {
    const b = guion(GUION_G, CUERPOS_G, "base", t);
    const fc = pie(PASOS_G.cerca, t), fl = pie(PASOS_G.lejos, t);
    const respira = Math.sin(t * 2.25);
    const tamb = dentro(t, T.tamb0, T.tamb0 + 0.1, T.agarra - 0.15, T.agarra + 0.05);
    const beta = inclinaG(t) + b.lean + 0.1 * tamb * Math.sin((t - T.tamb0) * 8.5);
    const xF = (fc.x + fl.x) / 2;
    const px = xF + HH_G * Math.sin(beta) + b.px;
    const alza = Math.max(fc.alza, fl.alza);
    const km = mareo(t);
    const p = { x: px, xF, suelo: SUELO, s: S, tirasLimpias: true, ikContinuo: true, hombrosContinuos: true, hombrosRecortados: true, piernas: {},
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y - 0.25 * alza / S + b.pel + respira * 2.5 + 14 * km * (0.5 + 0.5 * Math.sin(W1 * t * 2 + 1)) },
      torso: beta * 1.2 + b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 + b.pecho },
      cabeza: { ang: beta * 1.5 + b.cab + 0.09 * km * Math.sin(W1 * t - 3.3) * (1 - 0.6 * agarrado(t)), dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } } };
    // traga: el cuello se encoge un momento
    p.cabeza.dy += 8 * campana(t, T.traga, T.traga + 0.3);
    // el pez sale del cuello: respingo
    p.cabeza.ang -= 0.06 * campana(t, T.pez0 - 0.02, T.pez0 + 0.2); p.cabeza.dy -= 6 * campana(t, T.pez0 - 0.02, T.pez0 + 0.2);
    // tiritona al quedar empapado
    const tir = dentro(t, T.destapa, T.destapa + 0.1, T.pez0 - 0.2, T.pez0);
    p.torso += 0.012 * tir * Math.sin(t * 52); p.cabeza.ang += 0.015 * tir * Math.sin(t * 47 + 1);
    const pieG = (f, lado) => ({ tob: { x: G.PELVIS.x + (f.x - px) / S, y: TOB_G - (lado === "lejos" ? 12 : 0) - f.alza / S }, ang: -0.22 * Math.sin(Math.PI * f.u) * (f.alza > 0.5 ? 1 : 0) });
    p.piernas.cerca = pieG(fc, "cerca"); p.piernas.lejos = pieG(fl, "lejos");
    const e = guion(GUION_CARA_G, CARAS_G, "mira", t);
    p.cara = cara(e, parpadeo(t, PARP_G));
    const est = {
      verde: verdeG(t), mof: e.mof, moja: t >= T.cambio ? 1 : 0,
      sudor: dentro(t, 2.8, 3.2, T.cubre - 0.1, T.cubre),
      abajo: Math.PI / 2 - p.cabeza.ang - angB(t),
      oscila: t >= T.cambio ? 0.18 * Math.exp(-(t - T.destapa) * 3) : 0,
      w: t >= T.cambio ? 1 : 0, cd: p.cara.ojos.d, ci: p.cara.ojos.i
    };
    p.est = est;
    p.capaCabeza = (g, tt) => capaG(g, tt, est);
    p.capaTronco = g => troncoG(g, est);
    manosG(p, t);
    return p;
  }

  /* ---------- manos de Guillermo ---------- */
  const R_MG = G.MUNECA_R * G.JK;
  const manoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_MG, y: m.y - Math.sin(mu) * R_MG });
  const BOLS_GC = manoDesde({ x: 131, y: 652 }, MU_BOLS), BOLS_GL = manoDesde({ x: 372, y: 648 }, MU_BOLS);
  const trG = q => p => G.tronco(p)(q);
  const deHombroG = (lado, d) => p => { const h = G.tronco(p)(lado === "c" ? G.HOMBRO_C : G.HOMBRO); return { x: h.x + d.x, y: h.y + d.y }; };
  const agita = (f, ax, ay, ph = 0) => (p, t) => ({ x: ax * Math.sin(TAU * f * t + ph), y: ay * Math.cos(TAU * f * t * 1.3 + ph) });
  const con = (base, extra) => (p, t) => suma(base(p, t), extra(p, t));
  const bocaG = d => p => { const q = G.boca(p); return { x: q.x + d.x, y: q.y + d.y }; };
  const enBaranda = dx => p => G.aHoja(p, { x: p.xF + dx, y: RAIL + 2 });
  const DOB_GL = 1, DOB_GC = -1;
  const PISTA_GL = [            // mano lejana (la de delante)
    [0, 0, { en: trG(BOLS_GL), puno: 0, bolsillo: 1 }],
    [T.brazos0, T.brazos0 + 0.32, { en: con(deHombroG("l", { x: 250, y: 30 }), agita(1.3, 24, 34)), dedos: ABIERTA }, salida],
    [T.mof - 0.05, T.mof + 0.25, { en: deHombroG("l", { x: 120, y: 230 }), dedos: RELAJ }],
    [T.tamb0, T.tamb0 + 0.22, { en: con(deHombroG("l", { x: 230, y: 70 }), agita(2.0, 30, 40, 1)), dedos: ABIERTA }],
    [T.agarra - 0.3, T.agarra, { en: enBaranda(17), dedos: AGARRA }],
    [T.cubre + 0.04, T.cubre + 0.2, { en: deHombroG("l", { x: 150, y: 225 }), dedos: ESCURRE }],
    [T.harto, T.harto + 0.45, { en: deHombroG("l", { x: 66, y: 262 }), dedos: LACIA }]
  ];
  const PISTA_GC = [            // mano cercana
    [0, 0, { en: trG(BOLS_GC), puno: 0, bolsillo: 1 }],
    [T.brazos0 + 0.08, T.brazos0 + 0.4, { en: con(deHombroG("c", { x: -275, y: 40 }), agita(1.3, -24, -34, 0.8)), dedos: ABIERTA }, salida],
    [T.boca - 0.1, T.boca + 0.12, { en: bocaG({ x: 6, y: 24 }), dedos: PALMA, mx: 0.55 }],
    [T.agarra - 0.34, T.agarra - 0.02, { en: enBaranda(-60), dedos: AGARRA }],
    [T.cubre + 0.04, T.cubre + 0.2, { en: deHombroG("c", { x: -150, y: 230 }), dedos: ESCURRE }],
    [T.harto, T.harto + 0.45, { en: deHombroG("c", { x: -40, y: 270 }), dedos: LACIA }],
    [T.toma - 0.3, T.toma - 0.05, { en: pinzaEn(G, "c", DOB_GC, () => puntoDe(desdeAgarre(pinzaPant(K, PK, PK.manoLejos), thKiriku(T.toma), U_K), U_G)), dedos: PINZA_A }],
    [T.toma - 0.05, T.toma, { en: pinzaEn(G, "c", DOB_GC, () => puntoDe(desdeAgarre(pinzaPant(K, PK, PK.manoLejos), thKiriku(T.toma), U_K), U_G)), dedos: PINZA }],
    [T.toma + 0.02, T.toma + 0.3, { en: pinzaEn(G, "c", DOB_GC, p => ({ x: p.xF - 58, y: 292 })), dedos: PINZA }],
    [T.alza0 + 0.02, T.alza1, { en: pinzaEn(G, "c", DOB_GC, p => { const c = G.aPantalla(p, G.centroCabeza(p)); return { x: c.x - 52, y: c.y - 46 }; }), dedos: PINZA }]
  ];
  function manosG(p, t) {
    p.manoLejos = manoDe(G, p, "l", pista(PISTA_GL, p, t), DOB_GL);
    const cercana = pista(PISTA_GC, p, t);
    cercana.q = { x: cercana.q.x, y: cercana.q.y - 115 * campana(t, T.boca - 0.1, T.boca + 0.12) };
    const m = manoDe(G, p, "c", cercana, DOB_GC);
    // Al levantar la sombrilla, el antebrazo pasa por fuera del hombro.
    const h = G.tronco(p)(G.HOMBRO_C);
    const dx = m.x + R_MG * Math.cos(m.mu) - h.x, dy = m.y + R_MG * Math.sin(m.mu) - h.y;
    const distancia = Math.hypot(dx, dy);
    const minimo = Math.abs(2 * SJ.get(G).c - G.BRAZO_C_L) + 16;
    if (distancia > 0 && distancia < minimo) {
      const ajuste = (minimo - distancia) / distancia;
      m.x += dx * ajuste; m.y += dy * ajuste;
    }
    p.manoCerca = m;
  }

  function pose(t) {
    const pk = poseK(t); PK = pk;
    const pg = poseG(t);
    return { g: pg, k: pk };
  }

  /* =====================================================================================
   * CAPA DE LA CABEZA DE GUILLERMO: verde, carrillos, sudor y pelo mojado (retrato)
   * ===================================================================================== */
  const PZC = G.A.datos.piezas.cabeza, OJO_D = PZC.ojos.derecho, OJO_I = PZC.ojos.izquierdo;
  const PIEL_CAB = [[806,850],[802,846],[766,842],[754,834],[746,834],[742,838],[734,826],[726,826],[718,814],[710,814],[704,808],[708,804],[702,798],[698,802],[690,798],[684,792],[682,782],[674,782],[662,774],[656,768],[660,764],[654,758],[650,762],[634,746],[630,746],[624,740],[624,732],[604,716],[608,712],[604,708],[604,692],[596,684],[596,668],[582,670],[570,654],[566,658],[556,648],[560,640],[558,638],[554,642],[544,632],[548,624],[532,604],[532,596],[528,592],[528,572],[532,568],[528,564],[532,560],[528,552],[540,536],[540,528],[548,516],[562,503],[570,499],[590,499],[624,532],[624,540],[630,550],[636,536],[632,532],[640,524],[640,516],[648,501],[676,477],[676,469],[684,461],[680,457],[690,447],[718,435],[734,423],[744,429],[728,461],[730,467],[762,451],[798,427],[806,431],[823,431],[839,443],[843,439],[851,439],[867,455],[875,455],[881,461],[869,481],[841,509],[843,511],[879,503],[903,487],[911,487],[917,493],[901,524],[893,532],[895,534],[931,514],[947,499],[955,503],[969,520],[965,596],[949,620],[953,624],[937,644],[937,652],[925,676],[909,732],[899,738],[877,764],[885,772],[875,782],[867,778],[861,788],[849,796],[825,832],[829,836],[819,846],[815,842]];
  const PIEL_CUELLO = [[269,321],[254,318],[252,316],[250,318],[216,304],[212,299],[197,292],[175,270],[178,264],[188,259],[196,251],[196,246],[203,234],[203,229],[209,223],[219,233],[228,237],[243,249],[257,254],[266,266],[283,264],[287,267],[282,286],[291,296],[291,308],[294,310],[281,318],[271,318]];
  const camino = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
  const VERDE = "#6fae2e", VERDE_MUL = "rgb(196,228,150)";
  function tinte(g, alfa, color, modo) { g.globalAlpha = alfa; g.globalCompositeOperation = modo; g.fillStyle = color; }
  function enverdece(g, k, relleno) { tinte(g, k, VERDE, "color"); relleno(); tinte(g, k * 0.9, VERDE_MUL, "multiply"); relleno(); }
  function caminoMoflete(g, k) { g.moveTo(912, 676); g.bezierCurveTo(912 + 40 * k, 690, 900 + 46 * k, 760, 858, 792); g.lineTo(840, 760); g.lineTo(890, 690); g.closePath(); }
  function carrillos(g, k) {          // carrillo cercano hinchado: brillo y pliegue junto a la comisura
    if (k <= 0.01) return;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const a = clamp(k);
    g.globalAlpha = 0.5 * a; g.fillStyle = "#fff1dc";
    g.beginPath(); g.ellipse(706, 664, 20 + 12 * k, 13 + 7 * k, -0.35, 0, TAU); g.fill();
    g.globalAlpha = a; g.strokeStyle = TINTA; g.lineWidth = 4.5;
    g.beginPath(); g.moveTo(744, 694 - 4 * k); g.quadraticCurveTo(756 - 4 * k, 716, 748, 742 + 3 * k); g.stroke();
    g.restore();
  }
  function gotaDib(g, x, y, s, a = 1, ang = 0) {      // gota con brillo (s = radio)
    if (a <= 0.01 || s <= 0.2) return;
    g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(ang);
    g.beginPath(); g.moveTo(0, -s * 1.7); g.quadraticCurveTo(s, 0, 0, s); g.quadraticCurveTo(-s, 0, 0, -s * 1.7);
    g.fillStyle = "#bfe8ff"; g.fill(); g.lineWidth = Math.max(0.8, s * 0.32); g.strokeStyle = "#1d3b52"; g.stroke();
    g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(-s * 0.3, -s * 0.15, s * 0.22, s * 0.35, 0, 0, TAU); g.fill();
    g.restore();
  }
  function sudorG(g, k, t) {
    if (k <= 0.01) return;
    [[640, 470, 0], [915, 520, 0.37], [700, 430, 0.71]].forEach(([x, y, d], i) => {
      const ph = ((t * 0.9 + d) % 1), aparece = clamp(k * 3 - i); if (aparece <= 0) return;
      gotaDib(g, x, y + ph * 70, 13 * aparece * (1 - 0.3 * ph), Math.sin(Math.PI * ph) * aparece);
    });
  }

  /* ---------- pelo mojado: se borran las púas del retrato y se pintan aplastadas y chorreando ---------- */
  const PELO = (() => {
    const CUP = [[536,610],[522,540],[524,470],[542,410],[574,360],[625,316],[694,286],[775,270],[860,272],[940,294],[1006,332],[1050,382],[1068,440],[1062,500]];
    const FLEQUILLO = [[1062,500],[1042,552],[1028,522],[1004,570],[984,526],[954,566],[934,522],[902,556],[882,515],[848,540],[826,498],[792,515],[770,478],[728,486],[690,466],[656,488],[642,530],[632,575],[618,528],[598,505],[574,502],[556,520],[546,560]];
    const FRENTE = [[640,482],[720,452],[830,452],[930,470],[985,500],[1000,570],[960,615],[640,600]];
    const CAJA = [[300,40],[1320,40],[1320,700],[300,700]];
    // púas: raíz, punta (de pie), ancho en la raíz, lado al que caen, largo lacio (×), cuánto se dobla en la raíz
    const PUAS = [
      [[548, 470], [497, 343], 72, -1, 2.0, 0.8], [[572, 400], [528, 312], 80, -1, 1.8, 0.7], [[618, 342], [592, 250], 78, -1, 1.5, 0.55],
      [[664, 308], [640, 222], 78, -1, 1.35, 0.5], [[722, 290], [800, 172], 96, 1, 1.45, 0.5], [[800, 276], [912, 184], 96, 1, 1.4, 0.5],
      [[872, 284], [976, 206], 92, 1, 1.35, 0.5], [[942, 302], [1070, 228], 90, 1, 1.4, 0.55], [[1002, 336], [1122, 290], 84, 1, 1.6, 0.65],
      [[1044, 384], [1128, 404], 74, 1, 1.8, 0.75], [[1062, 440], [1110, 512], 64, 1, 1.9, 0.8], [[1050, 500], [1082, 562], 52, 1, 1.6, 0.8],
      [[1012, 540], [1022, 612], 42, 1, 1.2, 0.8]
    ];
    const COL = { medio: "#5a2a10", oscuro: "#26120a", claro: "#a8673a", brillo: "rgba(255,240,220,0.75)", tinta: "#160a05" };
    const cubica = (a, b, c, d, u) => { const v = 1 - u; return { x: v*v*v*a.x + 3*v*v*u*b.x + 3*v*u*u*c.x + u*u*u*d.x, y: v*v*v*a.y + 3*v*v*u*b.y + 3*v*u*u*c.y + u*u*u*d.y }; };
    const dir = a => ({ x: Math.cos(a), y: Math.sin(a) });
    function curvaPua(P, w, abajo, t, i, oscila) {
      const [r, tip, , lado, lm, cb] = P;
      const Rq = { x: r[0], y: r[1] }, a0 = Math.atan2(tip[1] - r[1], tip[0] - r[0]), L = Math.hypot(tip[0] - r[0], tip[1] - r[1]);
      const d = difAng(a0, abajo - lado * 0.32);
      const sw = oscila * Math.sin(t * 5.3 + i * 1.7);
      const wa = 1 - Math.pow(1 - Math.min(w, 1), 1.5), wl = clamp(w) * clamp(w);
      const aBase = a0 + d * cb * wa, aMed = a0 + d * lerp(cb, 1, 0.6) * wa + sw * 0.5 * wa, aTip = a0 + d * wa + sw * wa;
      const Lw = L * lerp(1, lm, wl) * 0.86;
      const P1 = { x: Rq.x + dir(aBase).x * Lw * 0.36, y: Rq.y + dir(aBase).y * Lw * 0.36 };
      const P2 = { x: P1.x + dir(aMed).x * Lw * 0.34, y: P1.y + dir(aMed).y * Lw * 0.34 };
      const P3 = { x: P2.x + dir(aTip).x * Lw * 0.36, y: P2.y + dir(aTip).y * Lw * 0.36 };
      return [Rq, P1, P2, P3];
    }
    function pua(g, P, w, abajo, t, i, oscila) {
      const ancho = P[2];
      const [Rq, P1, P2, P3] = curvaPua(P, w, abajo, t, i, oscila);
      const N = 12, izq = [], der = [], cen = [];
      for (let k = 0; k <= N; k++) {
        const u = k / N, q = cubica(Rq, P1, P2, P3, u), q2 = cubica(Rq, P1, P2, P3, Math.min(1, u + 0.02)), q1 = cubica(Rq, P1, P2, P3, Math.max(0, u - 0.02));
        const tx = q2.x - q1.x, ty = q2.y - q1.y, tl = Math.hypot(tx, ty) || 1, nx = -ty / tl, ny = tx / tl;
        const wv = ancho * 0.5 * Math.pow(1 - u, 0.9) * (1 + 0.15 * Math.sin(u * 3.1)) * 0.72;   // mechones finos, apelmazados
        izq.push({ x: q.x + nx * wv, y: q.y + ny * wv }); der.push({ x: q.x - nx * wv, y: q.y - ny * wv }); cen.push({ x: q.x + nx * wv * 0.25, y: q.y + ny * wv * 0.25 });
      }
      const forma = () => { g.beginPath(); g.moveTo(izq[0].x, izq[0].y); for (const q of izq) g.lineTo(q.x, q.y); for (let k = der.length - 1; k >= 0; k--) g.lineTo(der[k].x, der[k].y); g.closePath(); };
      forma(); g.fillStyle = COL.medio; g.fill();
      g.save(); forma(); g.clip();
      g.beginPath(); g.moveTo(cen[0].x, cen[0].y); for (const q of cen) g.lineTo(q.x, q.y); for (let k = der.length - 1; k >= 0; k--) g.lineTo(der[k].x, der[k].y); g.closePath();
      g.fillStyle = COL.oscuro; g.globalAlpha *= 0.85; g.fill(); g.globalAlpha /= 0.85;
      // brillo mojado: una raya clara y una blanca más fina
      g.beginPath(); for (let k = 1; k < N * 0.75; k++) { const q = izq[k], c = cen[k]; const m = { x: lerp(q.x, c.x, 0.45), y: lerp(q.y, c.y, 0.45) }; if (k === 1) g.moveTo(m.x, m.y); else g.lineTo(m.x, m.y); }
      g.lineWidth = 9; g.strokeStyle = COL.claro; g.globalAlpha *= 0.8; g.stroke(); g.globalAlpha /= 0.8;
      g.lineWidth = 3.5; g.strokeStyle = COL.brillo; g.stroke();
      g.restore();
      g.beginPath(); g.moveTo(izq[0].x, izq[0].y); for (const q of izq) g.lineTo(q.x, q.y); for (let k = der.length - 1; k >= 0; k--) g.lineTo(der[k].x, der[k].y);
      g.lineWidth = 5.5; g.lineJoin = "round"; g.strokeStyle = COL.tinta; g.stroke();
    }
    const ruta = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
    const casquete = CUP.concat(FLEQUILLO).map(([x, y]) => ({ x, y }));
    function borra(g) {
      g.save();
      g.beginPath(); ruta(g, CAJA); M2.curva(g, casquete, true, 0.35); g.clip("evenodd");
      g.beginPath(); ruta(g, CAJA); camino(g, PIEL_CAB); g.clip("evenodd");
      g.beginPath(); ruta(g, CAJA); ruta(g, FRENTE); g.clip("evenodd");
      g.globalCompositeOperation = "destination-out"; g.fillStyle = "#000"; g.fillRect(300, 40, 1020, 660);
      g.restore();
    }
    const ORDEN = [0, 1, 2, 3, 12, 11, 10, 9, 8, 7, 6, 5, 4];
    const wDe = (w, i) => w * (0.85 + 0.3 * hash(i + 3));
    function puas(g, w, abajo, t, oscila) {
      g.save(); g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); M2.curva(g, CUP.map(([x, y]) => ({ x, y })), false, 0.35);
      g.lineWidth = 16; g.strokeStyle = COL.oscuro; g.stroke(); g.lineWidth = 5; g.strokeStyle = COL.tinta; g.stroke();
      // casquete mojado: brillo largo sobre la coronilla
      g.beginPath(); M2.curva(g, CUP.slice(3, 11).map(([x, y]) => ({ x: x + (800 - x) * 0.08, y: y + 26 })), false, 0.35);
      g.lineWidth = 7; g.strokeStyle = "rgba(255,236,210,0.5)"; g.stroke();
      for (const i of ORDEN) pua(g, PUAS[i], wDe(w, i), abajo, t, i, oscila);
      g.restore();
    }
    // puntas de los mechones (para el goteo)
    const puntas = (w, abajo, t, oscila) => PUAS.map((P, i) => curvaPua(P, wDe(w, i), abajo, t, i, oscila)[3]);
    return { borra, puas, puntas };
  })();

  function capaG(g, t, est) {
    carrillos(g, est.mof);
    // verde (piel del retrato, sin los ojos; dentro de los ojos según lo cerrados que estén)
    if (est.verde > 0.004) {
      g.save();
      g.beginPath(); camino(g, PIEL_CAB); if (est.mof > 0.01) caminoMoflete(g, est.mof); g.clip();
      g.beginPath(); g.rect(380, 100, 900, 900); camino(g, OJO_D); camino(g, OJO_I);
      enverdece(g, est.verde, () => g.fill("evenodd"));
      g.restore();
      for (const [ojo, c] of [[OJO_D, est.cd], [OJO_I, est.ci]]) {
        const cc = Math.pow(clamp((c - 0.4) / 0.6), 1.5) * est.verde; if (cc < 0.004) continue;
        g.save(); g.beginPath(); camino(g, ojo); g.clip(); enverdece(g, cc, () => g.fillRect(700, 520, 260, 140)); g.restore();
      }
    }
    // mojado (solo en el lienzo aparte): pelo aplastado y chorreando, brillos de agua en la cara
    if (est.moja) {
      PELO.borra(g);
      PELO.puas(g, est.w, est.abajo, t, est.oscila);
      g.save(); g.lineCap = "round";
      g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 5;
      for (const [x0, y0, x1, y1] of [[650, 560, 662, 640], [930, 600, 936, 660], [700, 720, 712, 770]]) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
      // gotitas pegadas a la cara
      for (const [x, y, s] of [[620, 640, 8], [960, 560, 7], [840, 800, 7], [700, 610, 6]]) gotaDib(g, x, y + 4 * Math.sin(t * 3 + x), s, 0.95);
      g.restore();
    }
    sudorG(g, est.sudor, t);
  }
  function troncoG(g, est) {
    if (est.verde > 0.004) { g.save(); g.beginPath(); camino(g, PIEL_CUELLO); g.clip(); enverdece(g, est.verde, () => g.fillRect(160, 210, 150, 120)); g.restore(); }
    if (est.moja) {      // camiseta empapada: brillos de agua y pliegues pegados
      g.save(); g.lineCap = "round";
      g.strokeStyle = "rgba(160,200,235,0.45)"; g.lineWidth = 9;
      for (const [x0, y0, x1, y1] of [[150, 360, 170, 520], [250, 330, 262, 560], [330, 380, 318, 600], [190, 610, 230, 700]]) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + 12, (y0 + y1) / 2, x1, y1); g.stroke(); }
      g.strokeStyle = "rgba(255,255,255,0.55)"; g.lineWidth = 3.5;
      for (const [x0, y0, x1, y1] of [[158, 380, 172, 470], [256, 360, 262, 470], [326, 420, 318, 520]]) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
      g.restore();
    }
  }

  /* ---------- Guillermo en su lienzo aparte (desde el chapuzón) ---------- */
  let CAPA = null;
  function dibujaGCapa(g, pg, t) {
    const c = g.canvas;
    if (!CAPA || CAPA.width !== c.width || CAPA.height !== c.height) CAPA = lienzo(c.width, c.height);
    const o = CAPA.getContext("2d"), M = g.getTransform();
    // caja (marco del barco) → píxeles del lienzo
    const caja = [{ x: pg.x - 190, y: 20 }, { x: pg.x + 190, y: 20 }, { x: pg.x + 190, y: 612 }, { x: pg.x - 190, y: 612 }].map(q => ({ x: M.a * q.x + M.c * q.y + M.e, y: M.b * q.x + M.d * q.y + M.f }));
    const x0 = Math.max(0, Math.floor(Math.min(...caja.map(q => q.x))) - 2), y0 = Math.max(0, Math.floor(Math.min(...caja.map(q => q.y))) - 2);
    const x1 = Math.min(c.width, Math.ceil(Math.max(...caja.map(q => q.x))) + 2), y1 = Math.min(c.height, Math.ceil(Math.max(...caja.map(q => q.y))) + 2);
    if (x1 <= x0 || y1 <= y0) return;
    o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1; o.globalCompositeOperation = "source-over";
    o.clearRect(x0, y0, x1 - x0, y1 - y0);
    o.setTransform(M);
    G.dibujar(o, pg, t);
    // ropa y piel empapadas: más oscuras y azuladas (solo sobre Guillermo)
    o.save(); o.globalCompositeOperation = "source-atop";
    o.fillStyle = "rgba(18,52,96,0.16)"; o.fillRect(pg.x - 200, 0, 400, 640);
    const yc = G.aPantalla(pg, G.PELVIS).y - 18;
    const vq = o.createLinearGradient(0, yc, 0, yc + 30); vq.addColorStop(0, "rgba(10,30,80,0)"); vq.addColorStop(1, "rgba(10,30,80,0.3)");
    o.fillStyle = vq; o.fillRect(pg.x - 200, yc, 400, 620 - yc);
    o.restore();
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(CAPA, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0); g.restore();
  }

  /* =====================================================================================
   * OBJETOS: vaso de cóctel, sombrillita y gaviota
   * ===================================================================================== */
  // vaso (marco del vaso: origen en el centro de la mano, y hacia abajo, derecho respecto al mar)
  function dibVaso(g, nivel, sorbe, conSomb) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const copa = () => { g.beginPath(); g.moveTo(-5, 20); g.bezierCurveTo(-12, 14, -13, 2, -10, -6); g.bezierCurveTo(-8, -14, -8, -22, -12, -30);
      g.lineTo(12, -30); g.bezierCurveTo(8, -22, 8, -14, 10, -6); g.bezierCurveTo(13, 2, 12, 14, 5, 20); g.closePath(); };
    // pie y tallo
    g.fillStyle = "rgba(225,240,250,0.85)"; g.strokeStyle = "#2b3a46"; g.lineWidth = 1.3;
    g.beginPath(); g.ellipse(0, 31, 11, 3.2, 0, 0, TAU); g.fill(); g.stroke();
    g.beginPath(); g.rect(-1.8, 19, 3.6, 12); g.fill(); g.stroke();
    // bebida
    const yN = lerp(16, -25, nivel);
    g.save(); copa(); g.clip();
    const bg = g.createLinearGradient(0, yN, 0, 20); bg.addColorStop(0, "#ffb01f"); bg.addColorStop(0.55, "#ff7a2e"); bg.addColorStop(1, "#e8364f");
    g.fillStyle = bg; g.fillRect(-16, yN, 32, 40);
    g.fillStyle = "rgba(255,240,180,0.6)"; g.fillRect(-16, yN, 32, 2.2);
    // hielos
    g.fillStyle = "rgba(255,255,255,0.55)"; g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 1;
    for (const [x, y, a] of [[-4, 0, 0.3], [4, 6, -0.2]]) { g.save(); g.translate(x, Math.max(y, yN + 4)); g.rotate(a); g.beginPath(); g.rect(-4, -4, 8, 8); g.fill(); g.stroke(); g.restore(); }
    // palito de la sombrilla y pajita por dentro (se ven a través)
    g.globalAlpha = 0.55;
    if (conSomb) { const d = dirTh(TH_VASO); g.strokeStyle = "#c8a06a"; g.lineWidth = 1.8; g.beginPath(); g.moveTo(BASE_VASO.x, BASE_VASO.y); g.lineTo(BASE_VASO.x + d.x * 26, BASE_VASO.y + d.y * 26); g.stroke(); }
    g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.beginPath(); g.moveTo(-1, 12); g.lineTo(lerp(-1, PAJITA.x, 0.42), lerp(12, PAJITA.y, 0.42)); g.stroke();
    g.restore();
    // cristal
    copa(); g.fillStyle = "rgba(210,236,250,0.18)"; g.fill();
    g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(-9, -24); g.bezierCurveTo(-6, -16, -7, -8, -9, -2); g.stroke();
    g.beginPath(); g.moveTo(8, 4); g.bezierCurveTo(9, 8, 8, 12, 5, 16); g.stroke();
    copa(); g.strokeStyle = "#2b3a46"; g.lineWidth = 1.4; g.stroke();
    g.beginPath(); g.ellipse(0, -30, 12, 2.4, 0, 0, TAU); g.strokeStyle = "#2b3a46"; g.lineWidth = 1.1; g.stroke();
    // pajita por fuera (rayas blancas y rojas) con la bebida subiendo si sorbe
    const p0 = { x: lerp(-1, PAJITA.x, 0.4), y: lerp(12, PAJITA.y, 0.4) };
    g.strokeStyle = "#2b3a46"; g.lineWidth = 4.4; g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(PAJITA.x, PAJITA.y); g.stroke();
    g.strokeStyle = "#ffffff"; g.lineWidth = 2.8; g.stroke();
    g.setLineDash([3, 3]); g.strokeStyle = "#e23a4a"; g.stroke(); g.setLineDash([]);
    if (sorbe > 0.02) { g.globalAlpha = sorbe; g.strokeStyle = "#ff8a26"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(lerp(p0.x, PAJITA.x, sorbe), lerp(p0.y, PAJITA.y, sorbe)); g.stroke(); g.globalAlpha = 1; }
    // rodaja de naranja en el borde
    g.save(); g.translate(11, -30); g.rotate(0.5);
    g.beginPath(); g.arc(0, 0, 7, Math.PI, 0); g.closePath(); g.fillStyle = "#ffb52e"; g.fill(); g.strokeStyle = "#c46a10"; g.lineWidth = 1.2; g.stroke();
    g.beginPath(); g.arc(0, 0, 5, Math.PI, 0); g.closePath(); g.fillStyle = "#ffd77a"; g.fill();
    g.strokeStyle = "#f29a1d"; g.lineWidth = 0.8; for (let i = 1; i < 4; i++) { const a = Math.PI + i * Math.PI / 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 5, Math.sin(a) * 5); g.stroke(); }
    g.restore();
    g.restore();
  }
  // sombrillita de papel: base = pie del palito; th = ángulo del palito (0 = hacia arriba); u0 = desde dónde se ve el palito
  const PANEL = ["#ff5fa2", "#36c6c0", "#ffd23f", "#ff8a3d", "#a873ff", "#ff5fa2"];
  function dibSombrilla(g, s, u0 = 0) {
    const d = dirTh(s.th), L = SOMB.L, Rr = SOMB.R, ap = { x: s.base.x + d.x * L, y: s.base.y + d.y * L };
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    const b0 = { x: s.base.x + d.x * L * u0, y: s.base.y + d.y * L * u0 };
    g.strokeStyle = TINTA; g.lineWidth = 3.6; g.beginPath(); g.moveTo(b0.x, b0.y); g.lineTo(ap.x, ap.y); g.stroke();
    g.strokeStyle = "#ead3a0"; g.lineWidth = 1.9; g.stroke();
    g.translate(ap.x, ap.y); g.rotate(s.th);
    const rimY = Rr * 0.5, n = 6;
    const borde = i => ({ x: -Rr + i * 2 * Rr / n, y: rimY });
    const cupula = () => {
      g.beginPath(); g.moveTo(-Rr, rimY);
      g.bezierCurveTo(-Rr * 0.92, rimY - Rr * 0.6, -Rr * 0.4, -Rr * 0.14, 0, -Rr * 0.1);
      g.bezierCurveTo(Rr * 0.4, -Rr * 0.14, Rr * 0.92, rimY - Rr * 0.6, Rr, rimY);
      for (let i = n - 1; i >= 0; i--) { const a = borde(i + 1), b = borde(i); g.quadraticCurveTo((a.x + b.x) / 2, rimY - 3.2, b.x, b.y); }
      g.closePath();
    };
    cupula(); g.fillStyle = PANEL[0]; g.fill();
    g.save(); cupula(); g.clip();
    for (let i = 0; i < n; i++) { const a = borde(i), b = borde(i + 1); g.beginPath(); g.moveTo(0, -Rr * 0.1); g.lineTo(a.x * 1.3, a.y + 4); g.lineTo(b.x * 1.3, b.y + 4); g.closePath(); g.fillStyle = PANEL[i]; g.fill(); }
    g.fillStyle = "rgba(255,255,255,0.28)"; g.beginPath(); g.ellipse(-Rr * 0.35, rimY * 0.15, Rr * 0.35, Rr * 0.22, -0.3, 0, TAU); g.fill();
    g.strokeStyle = "rgba(90,20,50,0.55)"; g.lineWidth = 0.9;
    for (let i = 1; i < n; i++) { const a = borde(i); g.beginPath(); g.moveTo(0, -Rr * 0.1); g.lineTo(a.x, a.y); g.stroke(); }
    g.restore();
    cupula(); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = "#ead3a0"; g.beginPath(); g.arc(0, -Rr * 0.1 - 2, 2.2, 0, TAU); g.fill(); g.lineWidth = 1; g.stroke();
    g.restore();
  }

  // gaviota (origen en los pies; mira a la derecha con dir = 1)
  function ala(g, raiz, phi, doble, esc, oscura) {
    g.save(); g.translate(raiz.x, raiz.y); g.rotate(phi); g.scale(esc, esc);
    const L1 = 20, L2 = 26, codo = { x: -L1, y: -1 }, a2 = doble, pun = { x: codo.x - Math.cos(a2) * L2, y: codo.y - Math.sin(a2) * L2 };
    const nx = -Math.sin(a2), ny = Math.cos(a2);
    g.beginPath(); g.moveTo(2, -3); g.lineTo(codo.x, codo.y - 3.5); g.lineTo(pun.x, pun.y);
    g.lineTo(pun.x + nx * 5 + Math.cos(a2) * 6, pun.y + ny * 5 + Math.sin(a2) * 6);
    g.lineTo(codo.x + nx * 8, codo.y + 8); g.lineTo(-8, 8); g.lineTo(3, 5); g.closePath();
    g.fillStyle = oscura ? "#8a96a3" : "#aab6c2"; g.fill();
    // punta negra con lunar blanco
    g.save(); g.clip(); const pm = { x: lerp(codo.x, pun.x, 0.55), y: lerp(codo.y, pun.y, 0.55) };
    g.fillStyle = "#1c1c22"; g.beginPath(); g.moveTo(pm.x + nx * 12, pm.y + ny * 12); g.lineTo(pm.x - nx * 12, pm.y - ny * 12); g.lineTo(pun.x - Math.cos(a2) * 10 - nx * 12, pun.y - Math.sin(a2) * 10 - ny * 12); g.lineTo(pun.x - Math.cos(a2) * 10 + nx * 12, pun.y - Math.sin(a2) * 10 + ny * 12); g.closePath(); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(lerp(pm.x, pun.x, 0.6) + nx * 2, lerp(pm.y, pun.y, 0.6) + ny * 2, 2, 0, TAU); g.fill();
    g.fillStyle = "rgba(255,255,255,0.8)"; g.fillRect(-60, 5, 70, 4);
    g.restore();
    g.strokeStyle = TINTA; g.lineWidth = 1.5 / esc; g.stroke();
    g.restore();
  }
  function gaviota(g, x, y, ang, esc, dir, e) {
    g.save(); g.translate(x, y); g.rotate(ang); g.scale(esc * dir, esc);
    g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = TINTA; g.lineWidth = 1.5;
    const ab = clamp(e.alas), mu = 1 + 0.12 * (e.mullido || 0), cy = -15 - 3 * (e.patas || 0);
    const raiz = { x: -1, y: cy - 6 };
    // ala lejana (abierta)
    if (ab > 0.02) ala(g, raiz, -0.25 + e.aleteo * 0.9 - 0.15, 0.25 + 0.35 * Math.sin(e.aleteo * 2 + 1), lerp(0.4, 0.8, ab), true);
    // patas
    const pt = e.patas ?? 1;
    if (pt > 0.05) {
      g.strokeStyle = "#e4893c"; g.lineWidth = 2.4;
      for (const [x0, x1] of [[-4, -5], [3, 4]]) { g.beginPath(); g.moveTo(x0, cy + 6); g.lineTo(lerp(x0, x1, pt), lerp(cy + 6, 0, pt)); g.stroke(); }
      if (pt > 0.6) { g.fillStyle = "#f09a52"; g.strokeStyle = TINTA; g.lineWidth = 1;
        for (const xx of [-5, 4]) { g.beginPath(); g.moveTo(xx - 1, 0); g.lineTo(xx + 6, 0.5); g.lineTo(xx + 4, -2.5); g.closePath(); g.fill(); g.stroke(); } }
      g.strokeStyle = TINTA;
    }
    // cola
    g.fillStyle = "#ffffff"; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(-16, cy - 3); g.lineTo(-31, cy - 8); g.lineTo(-30, cy - 1); g.lineTo(-16, cy + 3); g.closePath(); g.fill(); g.stroke();
    // cuerpo
    g.beginPath(); g.ellipse(-3, cy, 19, 10.5 * mu, -0.08, 0, TAU); g.fillStyle = "#ffffff"; g.fill(); g.stroke();
    g.fillStyle = "rgba(170,190,210,0.35)"; g.beginPath(); g.ellipse(-3, cy + 5 * mu, 16, 4.5, -0.08, 0, Math.PI); g.fill();
    // ala plegada
    const pl = 1 - ab;
    if (pl > 0.02) {
      g.save(); g.globalAlpha *= clamp(pl * 1.6);
      g.beginPath(); g.moveTo(8, cy - 8 * mu); g.quadraticCurveTo(-6, cy - 12 * mu, -22, cy - 7); g.lineTo(-36, cy - 9); g.lineTo(-26, cy - 3); g.quadraticCurveTo(-8, cy + 3, 6, cy - 2); g.closePath();
      g.fillStyle = "#a5b1be"; g.fill(); g.stroke();
      g.fillStyle = "#1c1c22"; g.beginPath(); g.moveTo(-22, cy - 7); g.lineTo(-36, cy - 9); g.lineTo(-26, cy - 3); g.closePath(); g.fill();
      g.fillStyle = "#fff"; g.beginPath(); g.arc(-31, cy - 7, 1.3, 0, TAU); g.fill();
      g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(4, cy - 3); g.quadraticCurveTo(-8, cy + 1, -20, cy - 3); g.stroke();
      g.restore();
    }
    // cabeza (cuello: −1 mira hacia atrás … 1 hacia delante)
    const cu = e.cuello ?? 1, sx = cu >= 0 ? 1 : -1, hx = 11 * sx * Math.max(0.45, Math.abs(cu)), hy = cy - 12 - 2 * (e.alza || 0);
    g.save(); g.translate(hx, hy); g.rotate(e.inclina || 0); g.scale(sx, 1);
    g.beginPath(); g.arc(0, 0, 8.5, 0, TAU); g.fillStyle = "#ffffff"; g.fill(); g.stroke();
    const pa = clamp(e.pico || 0) * 0.45;
    g.fillStyle = "#f5c518";
    g.beginPath(); g.moveTo(6.5, -1.5); g.lineTo(17.5, 0.5); g.quadraticCurveTo(15, 2.5, 6.8, 2.2); g.closePath(); g.fill(); g.stroke();
    g.save(); g.translate(6.8, 2.2); g.rotate(pa); g.beginPath(); g.moveTo(0, 0); g.lineTo(9.5, -0.4); g.quadraticCurveTo(6, 3.2, 0, 2.6); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#d8322e"; g.beginPath(); g.arc(7, 0.8, 1.3, 0, TAU); g.fill(); g.restore();
    // ojo con párpado (cara de «a mí qué me cuentas»)
    const oc = clamp(e.ojo || 0);
    g.fillStyle = "#fff6c8"; g.beginPath(); g.arc(2.5, -2.2, 2.6, 0, TAU); g.fill();
    g.fillStyle = "#121216"; g.beginPath(); g.arc(3, -2.2, 1.6, 0, TAU); g.fill();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(3.5, -2.8, 0.6, 0, TAU); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.rect(-1, -6, 7, 3.8 * (0.45 + 0.55 * oc)); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-0.5, -6 + 3.8 * (0.45 + 0.55 * oc)); g.lineTo(6, -5.6 + 3.8 * (0.45 + 0.55 * oc)); g.stroke();
    g.restore();
    // ala cercana (abierta)
    if (ab > 0.02) ala(g, raiz, -0.25 + e.aleteo, 0.25 + 0.35 * Math.sin(e.aleteo * 2), lerp(0.4, 1, ab), false);
    g.restore();
  }
  // gaviotas lejanas: lazos en el cielo (marco de la cámara)
  const LAZOS = [{ c: { x: 610, y: 96 }, rx: 90, ry: 24, w: 0.85, f: 0.3 }, { c: { x: 790, y: 64 }, rx: 60, ry: 16, w: -0.7, f: 2.1 }];
  const lazo = (L, t) => ({ x: L.c.x + L.rx * Math.cos(L.w * t + L.f), y: L.c.y + L.ry * Math.sin(L.w * t + L.f) });
  const PIE_GAV = { x: 700, y: 284 }, ESC_GAV = 0.9;     // dónde se posa: coronilla (retrato de Guillermo)
  function gaviotaHeroe(t, pg) {
    const pieCam = () => aCamara(G.aPantalla(pg, G.cabeza(pg).a(PIE_GAV)), t);
    const angCab = pg.cabeza.ang + angB(t);
    if (t < T.gav0) {
      const q = lazo(LAZOS[0], t), q2 = lazo(LAZOS[0], t + 0.02);
      return { x: q.x, y: q.y, ang: 0.15 * Math.sin(t * 1.3), esc: 0.38, dir: q2.x >= q.x ? 1 : -1, e: { alas: 1, aleteo: 0.25 * Math.sin(t * 3.2) - 0.1, patas: 0 } };
    }
    if (t < T.gavPosa) {
      const u = fase(t, T.gav0, T.gavPosa), P0 = lazo(LAZOS[0], T.gav0), P3 = pieCam();
      const P1 = { x: P0.x + 130, y: P0.y + 40 }, P2 = { x: P3.x + 150, y: P3.y - 120 };
      const us = suave(u), v = 1 - us;
      const bz = s => ({ x: v*v*v*P0.x + 3*v*v*s*P1.x + 3*v*s*s*P2.x + s*s*s*P3.x, y: v*v*v*P0.y + 3*v*v*s*P1.y + 3*v*s*s*P2.y + s*s*s*P3.y });
      const q = bz(us);
      const frena = tramo(t, T.gavFrena, T.gavFrena + 0.15);
      const fl = (t - T.gav0) * lerp(4, 17, frena);
      const al = lerp(0.25 * Math.sin(fl) - 0.1, -0.7 + 0.9 * Math.sin(fl), frena);
      return { x: q.x, y: q.y, ang: lerp(-0.15 + 0.1 * Math.sin(t * 4), -0.35, frena) * (1 - tramo(t, T.gavPosa - 0.12, T.gavPosa)) + angCab * tramo(t, T.gavPosa - 0.12, T.gavPosa),
        esc: lerp(0.38, ESC_GAV, suave(u)), dir: -1, e: { alas: 1, aleteo: al, patas: tramo(t, T.gavFrena, T.gavPosa - 0.05) } };
    }
    // posada en la cabeza
    const v = t - T.gavPosa, P = pieCam();
    const pliega = tramo(t, T.gavPosa, T.gavPosa + 0.32);
    const bote = 3.5 * Math.exp(-v * 7) * Math.sin(v * 22);
    const mullido = campana(t, 10.82, 11.12);
    // mira a un lado y a otro; luego a Kiriku; luego arriba (sombrilla); feliz al final
    let cu = -1;
    if (t > 10.95) cu = lerp(-1, 1, tramo(t, 10.95, 11.05));
    if (t > 11.4) cu = lerp(1, -1, tramo(t, 11.4, 11.5));
    if (t > 11.85) cu = lerp(-1, 1, tramo(t, 11.85, 11.95));
    const arriba = tramo(t, T.alza1 - 0.25, T.alza1 + 0.05);
    return { x: P.x, y: P.y + bote, ang: angCab, esc: ESC_GAV, dir: -1,
      e: { alas: 1 - pliega, aleteo: lerp(-0.7, 0.2, pliega) + 0.5 * Math.sin(v * 17) * (1 - pliega), patas: 1, mullido, cuello: cu,
        inclina: -0.45 * arriba * (cu > 0 ? 1 : -1), alza: arriba, pico: campana(t, 11.15, 11.35) + campana(t, 13.5, 13.75),
        ojo: lerp(0.35, 1, tramo(t, T.final + 0.1, T.final + 0.3)) } };
  }

  /* =====================================================================================
   * AGUA: la ola, la cortina que cae sobre Guillermo, salpicaduras, charco, goteo y el pececillo
   * ===================================================================================== */
  const OLA_X = 292;
  function olaDetras(g, t) {          // marco de la cámara, antes del barco
    if (t < T.ola0 || t > T.cubre + 0.2) return;
    const sube = salida(fase(t, T.ola0, T.olaTop)), baja = entrada(fase(t, T.cae, T.cubre + 0.18));
    const vive = sube * (1 - baja);
    const h = 450 * vive + 6 * Math.sin(t * 7) * vive;
    if (h < 2) return;
    const top = 488 - h, xc = OLA_X + 8, an = 0.7 + 0.3 * sube;
    const cresta = [];
    for (let i = 0; i <= 18; i++) { const u = i / 18, x = xc + (u - 0.5) * 310 * an;
      cresta.push({ x, y: top + 64 * Math.pow(2 * u - 1, 2) * an + 6 * Math.sin(u * 10 + t * 6) - 10 * Math.sin(u * Math.PI) }); }
    const izq = cresta[0], der = cresta[18];
    const forma = () => {
      g.beginPath(); g.moveTo(xc - 360 * an, 504);
      g.bezierCurveTo(xc - 210 * an, 500, xc - 168 * an, top + 70, izq.x, izq.y);
      for (const q of cresta) g.lineTo(q.x, q.y);
      g.bezierCurveTo(xc + 172 * an, top + 70, xc + 220 * an, 500, xc + 370 * an, 504); g.closePath();
    };
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const gr = g.createLinearGradient(0, top, 0, 504);
    gr.addColorStop(0, "#b2f0f5"); gr.addColorStop(0.16, "#4cc0d8"); gr.addColorStop(0.45, "#1d88b2"); gr.addColorStop(0.8, "#0e5888"); gr.addColorStop(1, "#0a426d");
    forma(); g.fillStyle = gr; g.fill();
    g.save(); forma(); g.clip();
    // franja iluminada bajo la cresta
    g.beginPath(); g.moveTo(izq.x, izq.y); for (const q of cresta) g.lineTo(q.x, q.y); for (let i = 18; i >= 0; i--) g.lineTo(cresta[i].x, cresta[i].y + 46 + 10 * Math.sin(i + t * 4)); g.closePath();
    g.fillStyle = "rgba(210,252,255,0.35)"; g.fill();
    // líneas de agua que trepan por la pared de la ola
    g.strokeStyle = "rgba(225,252,255,0.3)"; g.lineWidth = 3;
    for (let j = 0; j < 10; j++) {
      const y = top + 70 + ((j * 44 - t * 150) % 440 + 440) % 440; if (y > 500) continue;
      const w = 150 * an + (y - top) * 0.35;
      g.beginPath(); g.moveTo(xc - w, y + 10); g.quadraticCurveTo(xc - w * 0.3, y - 8, xc + 6 * Math.sin(j + t * 3), y - 4); g.quadraticCurveTo(xc + w * 0.4, y, xc + w, y + 14); g.stroke();
    }
    // barbas de espuma que cuelgan de la cresta; con el labio, la espuma se viene encima
    const labio = tramo(t, T.olaTop - 0.08, T.cae + 0.1);
    g.fillStyle = "rgba(255,255,255,0.9)";
    for (let i = 1; i < 18; i += 1) {         // regueros de espuma cortos bajo la cresta
      const q = cresta[i], L = (8 + 20 * hash(i + 31)) * (0.6 + 0.4 * sube);
      g.beginPath(); g.ellipse(q.x + 3, q.y + 10 + L / 2, 4 + 3 * hash(i + 8), L / 2 + 4, 0, 0, TAU); g.fill();
    }
    if (labio > 0.01) {                        // el labio se viene encima: una banda de espuma que baja por la cara
      for (let i = 0; i <= 18; i++) { const q = cresta[i], y = q.y + 20 + 120 * labio * (0.75 + 0.25 * Math.sin(i * 1.7 + t * 6));
        g.beginPath(); g.arc(q.x, y, 14 + 6 * hash(i + 2), 0, TAU); g.fill();
        g.beginPath(); g.ellipse(q.x, (q.y + y) / 2 + 8, 10, (y - q.y) / 2, 0, 0, TAU); g.fill(); }
    }
    g.restore();
    forma(); g.strokeStyle = "rgba(8,46,76,0.85)"; g.lineWidth = 2.4; g.stroke();
    // casquete de espuma y rociones
    g.fillStyle = "#ffffff"; g.strokeStyle = "rgba(70,130,160,0.75)"; g.lineWidth = 1.4;
    for (let i = 0; i <= 18; i++) { const q = cresta[i], r = (11 + 7 * hash(i + 4) + 3 * Math.sin(t * 8 + i)) * (0.6 + 0.4 * an);
      g.beginPath(); g.arc(q.x, q.y + 2, r, 0, TAU); g.fill(); g.stroke(); }
    g.fillStyle = "#ffffff"; for (let i = 0; i <= 18; i++) { const q = cresta[i]; g.beginPath(); g.arc(q.x, q.y + 4, 10 * (0.6 + 0.4 * an), 0, TAU); g.fill(); }
    for (let i = 0; i < 22; i++) { const ph = (t * 1.5 + hash(i)) % 1, q = cresta[Math.floor(hash(i + 9) * 18)];
      gotaDib(g, q.x + 70 * ph * (hash(i + 5) - 0.3), q.y - 12 - 80 * ph + 60 * ph * ph, 2.6 + 2.4 * hash(i + 2), (1 - ph) * vive, 0.5); }
    g.restore();
  }
  function sombraOla(g, t) {          // la sombra de la ola sobre la cubierta (marco del barco)
    const s = tramo(t, T.ola0 + 0.35, T.olaTop) * (1 - tramo(t, T.cubre, T.cubre + 0.12));
    if (s < 0.01) return;
    g.save();
    const gr = g.createRadialGradient(OLA_X, 560, 20, OLA_X, 560, 260);
    gr.addColorStop(0, `rgba(10,40,80,${0.32 * s})`); gr.addColorStop(1, "rgba(10,40,80,0)");
    g.fillStyle = gr; g.beginPath(); g.rect(OLA_X - 280, CUB, 560, 140); g.fill();
    g.restore();
  }
  function cortina(g, t) {            // el agua que cae entera sobre Guillermo (marco del barco, delante de todo)
    if (t < T.cae || t > T.destapa + 0.4) return;
    const cae = entrada(fase(t, T.cae, T.cubre));
    const yB = lerp(-20, 560, cae);                                // el frente cae desde la cresta (arriba, fuera de cuadro)
    const yT = lerp(-70, 620, entrada(fase(t, T.cubre, T.destapa + 0.2)));   // y luego pasa la cola del agua
    const arco = 0;
    const xc = OLA_X + 4;
    const choque = salida(fase(t, T.cubre, T.cubre + 0.18));
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    if (yB - yT > 4) {
      const ancho = y => lerp(152, 132, clamp((y - yT) / Math.max(1, yB - yT))) + 12 * Math.sin(y * 0.025 + t * 9) + 7 * Math.sin(y * 0.06 - t * 13)
        + 70 * choque * clamp((y - yB + 150) / 150);
      const arriba = u => yT + 58 * arco * Math.pow(2 * u - 1, 2) - 6 * Math.sin(u * 11 + t * 16);
      const lado = s => { const pts = []; const y0 = arriba(s < 0 ? 0 : 1); for (let y = y0; y <= yB; y += 14) pts.push({ x: xc + s * ancho(y), y }); pts.push({ x: xc + s * ancho(yB), y: yB }); return pts; };
      const L = lado(-1), D = lado(1);
      const forma = () => {
        g.beginPath(); g.moveTo(L[0].x, L[0].y);
        for (const q of L) g.lineTo(q.x, q.y);
        if (choque <= 0) { const w = ancho(yB); g.bezierCurveTo(xc - w, yB + 44, xc + w, yB + 44, xc + w, yB); }   // lengua redondeada que cae
        else for (let i = 0; i <= 10; i++) { const u = i / 10; g.lineTo(lerp(L[L.length - 1].x, D[D.length - 1].x, u), yB + 6 * Math.sin(u * 13 + t * 20)); }
        for (let i = D.length - 1; i >= 0; i--) g.lineTo(D[i].x, D[i].y);
        for (let i = 12; i >= 0; i--) { const u = i / 12; g.lineTo(lerp(L[0].x, D[0].x, u), arriba(u)); }
        g.closePath();
      };
      const gr = g.createLinearGradient(xc - 160, 0, xc + 160, 0);
      gr.addColorStop(0, "#1f7fac"); gr.addColorStop(0.25, "#45b6d4"); gr.addColorStop(0.5, "#86dcec"); gr.addColorStop(0.75, "#3eaccf"); gr.addColorStop(1, "#18709c");
      forma(); g.fillStyle = gr; g.globalAlpha = 0.97; g.fill(); g.globalAlpha = 1;
      g.save(); forma(); g.clip();
      g.strokeStyle = "rgba(255,255,255,0.5)";
      for (let i = 0; i < 16; i++) { const x = xc - 130 + i * 17 + 6 * Math.sin(i * 1.7), y0 = ((t * 1100 + i * 67) % 700) - 80; g.lineWidth = 1.5 + 2.5 * hash(i);
        g.beginPath(); g.moveTo(x, y0); g.quadraticCurveTo(x + 6 * Math.sin(i), y0 + 50, x + 2, y0 + 90 + 50 * hash(i + 3)); g.stroke(); }
      g.strokeStyle = "rgba(10,60,95,0.25)"; g.lineWidth = 10;
      for (const s of [-1, 1]) { g.beginPath(); g.moveTo(xc + s * 120, yT); g.lineTo(xc + s * 112, yB); g.stroke(); }
      g.restore();
      forma(); g.strokeStyle = "rgba(14,70,104,0.9)"; g.lineWidth = 2.4; g.stroke();
      // espuma: el casquete de la cresta arriba y el borde que cae abajo
      g.fillStyle = "#ffffff"; g.strokeStyle = "rgba(70,130,160,0.7)"; g.lineWidth = 1.3;
      if (yT > -40) for (let i = 0; i <= 12; i++) { const u = i / 12, x = lerp(L[0].x, D[0].x, u), r = 11 + 6 * hash(i + 4);
        g.beginPath(); g.arc(x, arriba(u) + 3, r, 0, TAU); g.fill(); g.stroke(); }
      for (let i = 0; i <= 9; i++) { const u = i / 9, x = lerp(xc - 125, xc + 125, u), y = yB - 8 + (choque <= 0 ? 30 * Math.sin(u * Math.PI) : 0);
        g.beginPath(); g.arc(x, y, 12 + 6 * hash(i + 7), 0, TAU); g.fill(); g.stroke(); }
    }
    // corona de agua al chocar contra la cubierta: dos láminas que se abren y caen
    const k = fase(t, T.cubre - 0.02, T.cubre + 0.5);
    if (k > 0 && k < 1) {
      for (const s of [-1, 1]) {
        const x0 = xc + s * 96, x1 = xc + s * (130 + 150 * salida(k)), yAlto = 552 - 130 * Math.sin(Math.PI * Math.min(1, k * 1.1)) * (1 - 0.2 * k);
        const xm = lerp(x0, x1, 0.55);
        g.globalAlpha = 1 - tramo(k, 0.7, 1);
        g.beginPath(); g.moveTo(x0 - s * 8, 556); g.quadraticCurveTo(xm - s * 10, yAlto - 10, x1, yAlto + 18); g.lineTo(x1 + s * 6, yAlto + 34);
        g.quadraticCurveTo(xm + s * 6, yAlto + 40, x0 + s * 26, 556); g.closePath();
        g.fillStyle = "rgba(110,205,230,0.85)"; g.fill(); g.strokeStyle = "rgba(14,70,104,0.8)"; g.lineWidth = 1.8; g.stroke();
        g.fillStyle = "#ffffff"; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(x1 - s * i * 9, yAlto + 18 + i * 6, 8 - i, 0, TAU); g.fill(); }
        g.globalAlpha = 1;
      }
      // espuma a ras de cubierta
      g.fillStyle = "#ffffff"; g.strokeStyle = "rgba(60,120,150,0.75)"; g.lineWidth = 1.3;
      for (let i = 0; i < 12; i++) { const u = i / 11, x = lerp(xc - 160, xc + 160, u) + 30 * k * (u - 0.5) * 2, r = (13 + 7 * hash(i + 11)) * (1 - 0.7 * k);
        g.beginPath(); g.arc(x, 552 - 8 * Math.sin(u * Math.PI) * (1 - k), r, 0, TAU); g.fill(); g.stroke(); }
    }
    g.restore();
  }
  // salpicaduras: gotas lanzadas desde la cabeza y desde la cubierta
  const SALP = Array.from({ length: 44 }, (_, i) => {
    const deCabeza = i < 14, a = deCabeza ? -Math.PI / 2 + (hash(i + 1) - 0.5) * 2.6 : -Math.PI / 2 + (hash(i + 1) - 0.5) * 2.9;
    const v = deCabeza ? 160 + 140 * hash(i + 7) : 220 + 260 * hash(i + 7);
    return { t0: deCabeza ? 7.88 + 0.03 * hash(i + 3) : T.cubre + 0.06 * hash(i + 3), o: deCabeza ? { x: OLA_X + 10, y: 116 } : { x: OLA_X + (hash(i + 13) - 0.5) * 240, y: 548 },
      vx: Math.cos(a) * v, vy: Math.sin(a) * v, s: 3 + 3.5 * hash(i + 21) };
  });
  function salpicaduras(g, t) {
    for (const d of SALP) {
      const v = t - d.t0; if (v <= 0 || v > 1.4) continue;
      const x = d.o.x + d.vx * v, y = d.o.y + d.vy * v + 0.5 * 1500 * v * v;
      if (y > 556) continue;
      gotaDib(g, x, y, d.s, 1, Math.atan2(d.vy + 1500 * v, d.vx) - Math.PI / 2 + Math.PI);
    }
  }
  // agua por la cubierta: llega casi hasta Kiriku y vuelve; queda un charco y la madera mojada
  function aguaCubierta(g, t, pg) {
    if (t < T.cubre - 0.02) return;
    const v = t - T.cubre;
    // madera mojada
    const mo = clamp(v * 6) * (1 - 0.6 * tramo(t, 9.5, 12.5));
    const xr = OLA_X + 120 + 240 * salida(fase(t, T.cubre, 8.38)) - 230 * suave(fase(t, 8.45, 9.3));
    const xl = OLA_X - 120 - 200 * salida(fase(t, T.cubre, 8.4));
    const xMax = OLA_X + 360;
    g.save();
    g.fillStyle = `rgba(70,35,12,${0.28 * mo})`;
    g.beginPath(); g.ellipse((xl + xMax) / 2 - 20, 556, (xMax - xl) / 2 + 30, 26, 0, 0, TAU); g.fill();
    // lámina de agua que corre
    const lam = 1 - tramo(t, 9.0, 9.5);
    if (lam > 0.01) {
      g.globalAlpha = 0.6 * lam;
      g.beginPath(); g.moveTo(xl, 548);
      for (let i = 0; i <= 14; i++) { const u = i / 14, x = lerp(xl, xr, u); g.lineTo(x, 540 - 3 * Math.sin(u * 20 + t * 14)); }
      for (let i = 14; i >= 0; i--) { const u = i / 14, x = lerp(xl, xr, u); g.lineTo(x, 568 + 3 * Math.sin(u * 17 - t * 12)); }
      g.closePath(); g.fillStyle = "#7fd0ea"; g.fill();
      g.globalAlpha = 0.9 * lam; g.fillStyle = "#ffffff";
      for (let i = 0; i < 6; i++) { const y = 541 + i * 5; g.beginPath(); g.ellipse(xr - 4 + 3 * Math.sin(i * 2 + t * 9), y, 7 + 3 * hash(i), 3.5, 0, 0, TAU); g.fill(); }
      g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) { const x = lerp(xl + 20, xr - 20, (i + 0.5) / 5) + 10 * Math.sin(t * 6 + i); g.beginPath(); g.moveTo(x - 12, 550 + i % 3 * 5); g.lineTo(x + 12, 550 + i % 3 * 5); g.stroke(); }
      g.globalAlpha = 1;
    }
    // charco a los pies de Guillermo
    const ch = tramo(t, T.destapa - 0.1, T.moja + 0.3);
    if (ch > 0.01) {
      const cx = pg.xF + 4, rx = (62 + 14 * tramo(t, T.moja, 11)) * ch, ry = 9 * ch;
      g.fillStyle = "rgba(120,200,235,0.55)"; g.beginPath(); g.ellipse(cx, 556, rx, ry, 0, 0, TAU); g.fill();
      g.strokeStyle = "rgba(30,90,130,0.5)"; g.lineWidth = 1.2; g.stroke();
      g.save(); g.beginPath(); g.ellipse(cx, 556, rx, ry, 0, 0, TAU); g.clip();
      g.fillStyle = "rgba(255,255,255,0.5)"; g.fillRect(cx - rx, 553, rx * 2, 2);
      g.fillStyle = "rgba(190,235,255,0.6)"; g.beginPath(); g.ellipse(cx - rx * 0.4, 557, rx * 0.3, 2, 0, 0, TAU); g.fill();
      g.restore();
    }
    g.restore();
  }
  // goteo: del pelo, la barbilla, las manos y los bajos del pantalón
  const FUENTES_CARA = [{ x: 812, y: 848 }, { x: 872, y: 712 }];
  const MECHONES_GOTEAN = [0, 2, 5, 8, 10, 12];
  function goteo(g, t, pg) {
    if (t < T.destapa) return;
    const H = G.cabeza(pg), est = pg.est;
    const puntas = PELO.puntas(est.w, est.abajo, t, est.oscila);
    const src = [];
    for (const i of MECHONES_GOTEAN) src.push(G.aPantalla(pg, H.a(puntas[i])));
    for (const q of FUENTES_CARA) src.push(G.aPantalla(pg, H.a(q)));
    for (const m of [pg.manoLejos, pg.manoCerca]) { const q = G.aPantalla(pg, { x: m.x, y: m.y }); src.push({ x: q.x, y: q.y + 8 }); }
    for (const l of ["cerca", "lejos"]) { const q = G.aPantalla(pg, pg.piernas[l].tob); src.push({ x: q.x - 4, y: q.y - 10 }); }
    const deja = 1 - tramo(t, 12.6, 14);    // al final gotea menos
    src.forEach((q, i) => {
      if (i >= src.length - 4 && i < src.length - 2 && t > T.toma - 0.3 && i === src.length - 3) return;   // la mano de la sombrilla no gotea al subir
      const P = 0.5 + 0.4 * hash(i + 3) + 0.6 * (1 - deja), ph = hash(i + 17) * P;
      const a = ((t - T.destapa - ph) % P + P) % P, t0 = t - a;
      if (t0 < T.destapa) return;
      const crece = Math.min(1, a / (0.3 * P));
      if (a < 0.3 * P) { gotaDib(g, q.x, q.y + 2 * crece, 3.2 * crece, 0.95); return; }
      const v = a - 0.3 * P, y = q.y + 3 + 0.5 * 1300 * v * v;
      if (y < 552) gotaDib(g, q.x, y, 3.2, 0.95);
      else {   // ondita en el charco
        const vs = v - Math.sqrt(2 * (552 - q.y - 3) / 1300); if (vs > 0.35) return;
        g.save(); g.strokeStyle = `rgba(255,255,255,${0.8 * (1 - vs / 0.35)})`; g.lineWidth = 1.2;
        g.beginPath(); g.ellipse(q.x, 556, 3 + 30 * vs, 1 + 6 * vs, 0, 0, TAU); g.stroke(); g.restore();
      }
    });
  }
  // un pececillo sale del cuello de la camiseta, da volteretas y vuelve al mar por encima de la barandilla
  function pezDib(g, x, y, ang, s, flop) {
    g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
    g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = TINTA; g.lineWidth = 1.5;
    g.save(); g.translate(-11, 0); g.rotate(0.45 * flop);
    g.beginPath(); g.moveTo(1, 0); g.lineTo(-10, -8); g.quadraticCurveTo(-6, 0, -10, 8); g.closePath(); g.fillStyle = "#ff9a3c"; g.fill(); g.stroke(); g.restore();
    g.beginPath(); g.moveTo(-2, -6); g.quadraticCurveTo(2, -13, 7, -6); g.closePath(); g.fillStyle = "#ff9a3c"; g.fill(); g.stroke();
    const cuerpo = () => { g.beginPath(); g.moveTo(-12, 0); g.bezierCurveTo(-7, -8 + 2 * flop, 9, -9, 14, 0); g.bezierCurveTo(9, 8, -7, 8 + 2 * flop, -12, 0); g.closePath(); };
    const cg = g.createLinearGradient(0, -8, 0, 8); cg.addColorStop(0, "#5f8fb8"); cg.addColorStop(0.5, "#cfe3f0"); cg.addColorStop(1, "#f4f8fb");
    cuerpo(); g.fillStyle = cg; g.fill(); g.stroke();
    g.strokeStyle = "rgba(40,70,100,0.6)"; g.lineWidth = 1; g.beginPath(); g.arc(6, 0, 6, -1.1, 1.1); g.stroke();
    g.fillStyle = "#ff9a3c"; g.strokeStyle = TINTA; g.beginPath(); g.moveTo(1, 2); g.lineTo(-4, 7); g.lineTo(3, 5); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(9, -1.5, 2.6, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = "#111"; g.beginPath(); g.arc(9.6, -1.5, 1.3, 0, TAU); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.2; g.beginPath(); g.arc(13, 2, 1.8, 0.2, 2.6); g.stroke();
    g.restore();
  }
  // el pececillo se había quedado enredado en el pelo: se revuelve, salta y vuelve al mar
  const PEZ_PELO = { x: 790, y: 262 };      // coronilla (retrato)
  const SALTO = 0.3;
  let PEZ0 = null;
  function pez(g, t, pg) {
    if (t < T.pez0 || t > T.pez0 + SALTO + 1.3) return;
    const u = t - T.pez0;
    if (u < SALTO) {          // asoma entre los mechones mojados y se revuelve
      const H = G.cabeza(pg), q = G.aPantalla(pg, H.a(PEZ_PELO)), k = salida(clamp(u / 0.12));
      pezDib(g, q.x + 4 * Math.sin(t * 34), q.y - 6 * k, pg.cabeza.ang - 0.25 + 0.35 * Math.sin(t * 28), 1.2 * (0.6 + 0.4 * k), Math.sin(t * 36));
      for (let i = 0; i < 3; i++) gotaDib(g, q.x - 14 + 14 * i, q.y - 12 - 18 * fase(u, 0.03 * i, 0.2 + 0.03 * i), 2.2, 1 - fase(u, 0.1, 0.25));
      return;
    }
    if (!PEZ0) { const P = pose(T.pez0 + SALTO); PEZ0 = G.aPantalla(P.g, G.cabeza(P.g).a(PEZ_PELO)); PEZ0.y -= 6; }
    const v = u - SALTO, x = PEZ0.x - 145 * v, y = PEZ0.y - 390 * v + 0.5 * 1300 * v * v;
    const YM = RAIL + 26;   // detrás de la barandilla ya es mar
    if (y > YM) {     // ¡plic!: cae al mar
      const vs = v - (390 + Math.sqrt(390 * 390 + 2600 * (YM - PEZ0.y))) / 1300, w = vs / 0.35; if (w > 1) return;
      const xs = PEZ0.x - 145 * (v - vs);
      g.save(); g.strokeStyle = `rgba(255,255,255,${0.9 * (1 - w)})`; g.lineWidth = 2; g.beginPath(); g.ellipse(xs, YM, 8 + 26 * w, 3 + 4 * w, 0, Math.PI, TAU); g.stroke();
      for (let i = 0; i < 4; i++) gotaDib(g, xs + (i - 1.5) * 9 * (1 + w), YM - 2 - 70 * w * (1 - w) * (0.6 + 0.4 * hash(i)), 2.4, 1 - w);
      g.restore(); return;
    }
    g.save(); g.beginPath(); g.rect(-200, -200, W + 400, YM + 200); g.clip();
    for (let i = 1; i <= 3; i++) { const vv = Math.max(0, v - i * 0.035); gotaDib(g, PEZ0.x - 145 * vv, PEZ0.y - 390 * vv + 650 * vv * vv, 2, 0.7 - 0.18 * i); }
    pezDib(g, x, y, -0.4 - 10 * v, 1.2, Math.sin(t * 26));
    g.restore();
  }

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  let cielo = null, nubes = null, barco = null;
  function creaCielo() {
    const c = lienzo(W + 160, H + 160), g = c.getContext("2d"); g.translate(80, 80);
    g.lineJoin = "round"; g.lineCap = "round";
    const cg = g.createLinearGradient(0, -80, 0, HORIZ);
    cg.addColorStop(0, "#2a86da"); cg.addColorStop(0.55, "#5fb2ec"); cg.addColorStop(1, "#c6e9f7");
    g.fillStyle = cg; g.fillRect(-80, -80, W + 160, HORIZ + 80);
    // sol con su halo
    const SOL = { x: 150, y: 68 };
    const hg = g.createRadialGradient(SOL.x, SOL.y, 8, SOL.x, SOL.y, 300); hg.addColorStop(0, "rgba(255,252,225,0.95)"); hg.addColorStop(0.12, "rgba(255,246,205,0.6)"); hg.addColorStop(1, "rgba(255,246,205,0)");
    g.fillStyle = hg; g.fillRect(-80, -80, W + 160, HORIZ + 80);
    g.fillStyle = "#fffbea"; g.beginPath(); g.arc(SOL.x, SOL.y, 30, 0, TAU); g.fill();
    g.strokeStyle = "rgba(255,250,215,0.55)"; g.lineWidth = 4;
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.beginPath(); g.moveTo(SOL.x + Math.cos(a) * 40, SOL.y + Math.sin(a) * 40); g.lineTo(SOL.x + Math.cos(a) * (54 + 8 * (i % 2)), SOL.y + Math.sin(a) * (54 + 8 * (i % 2))); g.stroke(); }
    // isla lejana a la izquierda y otra más pequeña
    g.fillStyle = "#86aecb";
    g.beginPath(); g.moveTo(-80, HORIZ); g.lineTo(-80, HORIZ - 18); g.quadraticCurveTo(10, HORIZ - 44, 70, HORIZ - 30); g.quadraticCurveTo(120, HORIZ - 22, 170, HORIZ - 6); g.lineTo(200, HORIZ); g.closePath(); g.fill();
    g.fillStyle = "#9cbcd4"; g.beginPath(); g.moveTo(880, HORIZ); g.quadraticCurveTo(920, HORIZ - 16, 970, HORIZ - 10); g.quadraticCurveTo(1010, HORIZ - 6, 1040, HORIZ); g.closePath(); g.fill();
    // mar
    const mg = g.createLinearGradient(0, HORIZ, 0, H + 80); mg.addColorStop(0, "#2d7dbb"); mg.addColorStop(0.3, "#2470ac"); mg.addColorStop(1, "#14527f");
    g.fillStyle = mg; g.fillRect(-80, HORIZ, W + 160, H + 80 - HORIZ);
    g.fillStyle = "rgba(220,240,250,0.35)"; g.fillRect(-80, HORIZ, W + 160, 3);
    // olas pintadas (más finas y juntas hacia el horizonte)
    for (let r = 0; r < 26; r++) {
      const y = HORIZ + 6 + Math.pow(r, 1.55) * 3.2; if (y > H + 70) break;
      const k = (y - HORIZ) / (H - HORIZ), n = 22 - Math.floor(10 * k);
      for (let i = 0; i < n; i++) {
        const x = -80 + (i + hash(r * 31 + i)) * ((W + 160) / n), L = 14 + 40 * k * (0.6 + 0.6 * hash(i + r * 7));
        g.strokeStyle = `rgba(170,225,245,${0.25 + 0.3 * hash(i * 3 + r)})`; g.lineWidth = 1 + 2.2 * k;
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + L / 2, y - 2 - 4 * k, x + L, y); g.stroke();
        g.strokeStyle = `rgba(10,50,90,${0.15 + 0.15 * hash(i + r)})`; g.beginPath(); g.moveTo(x + 4, y + 2 + 3 * k); g.quadraticCurveTo(x + L / 2, y + 4 + 4 * k, x + L - 4, y + 2 + 3 * k); g.stroke();
      }
    }
    // estela del sol en el agua: rayitas de brillo, más anchas cerca
    for (let i = 0; i < 70; i++) {
      const y = HORIZ + 3 + Math.pow(hash(i + 3), 1.3) * 300, k = (y - HORIZ) / 300, x = SOL.x + (hash(i + 8) - 0.5) * (24 + 150 * k);
      g.strokeStyle = `rgba(255,250,225,${0.35 + 0.4 * hash(i + 1)})`; g.lineWidth = 1 + 2 * k;
      g.beginPath(); g.moveTo(x - 4 - 14 * k, y); g.lineTo(x + 4 + 14 * k, y); g.stroke();
    }
    return c;
  }
  function creaNubes() {
    const c = lienzo(W + 420, 240), g = c.getContext("2d");
    const nube = (x, y, s) => {
      const bolas = [[0, 0, 34], [36, -14, 40], [76, -4, 34], [108, 8, 26], [-30, 10, 24], [44, 16, 34], [86, 18, 26]];
      g.save(); g.translate(x, y); g.scale(s, s);
      g.fillStyle = "rgba(160,190,215,0.55)"; for (const [bx, by, r] of bolas) { g.beginPath(); g.arc(bx + 4, by + 8, r, 0, TAU); g.fill(); }
      g.fillStyle = "#ffffff"; for (const [bx, by, r] of bolas) { g.beginPath(); g.arc(bx, by, r, 0, TAU); g.fill(); }
      g.fillStyle = "rgba(214,232,246,0.9)"; g.beginPath(); g.ellipse(40, 30, 76, 12, 0, 0, TAU); g.fill();
      g.restore();
    };
    nube(380, 90, 0.85); nube(720, 60, 0.6); nube(1040, 120, 0.7); nube(1270, 70, 0.55);
    return c;
  }
  function creaBarco() {
    const c = lienzo(W + 320, H + 300), g = c.getContext("2d"); g.translate(160, 140);
    g.lineJoin = "round"; g.lineCap = "round";
    // cabina (derecha)
    g.fillStyle = "#c9cfd6"; g.fillRect(CAB_X - 18, 146, 20, CUB - 146);           // costado en sombra
    g.fillStyle = "#f6f7f5"; g.fillRect(CAB_X, 150, W + 160 - CAB_X, CUB - 150);
    const sh = g.createLinearGradient(CAB_X, 0, CAB_X + 60, 0); sh.addColorStop(0, "rgba(120,140,160,0.25)"); sh.addColorStop(1, "rgba(120,140,160,0)");
    g.fillStyle = sh; g.fillRect(CAB_X, 150, 60, CUB - 150);
    g.fillStyle = "#1f3e6e"; g.fillRect(CAB_X - 18, 404, W + 178 - CAB_X, 16);
    g.fillStyle = "#c13a3a"; g.fillRect(CAB_X - 18, 422, W + 178 - CAB_X, 4);
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(CAB_X - 18, 146, W + 178 - CAB_X, CUB - 146);
    g.beginPath(); g.moveTo(CAB_X, 150); g.lineTo(CAB_X, CUB); g.stroke();
    // techo con remate de teca, barandilla del techo, bocina y antena
    g.fillStyle = "#b07a45"; g.fillRect(CAB_X - 30, 134, W + 200 - CAB_X, 16); g.strokeRect(CAB_X - 30, 134, W + 200 - CAB_X, 16);
    g.fillStyle = "rgba(255,230,190,0.5)"; g.fillRect(CAB_X - 30, 136, W + 200 - CAB_X, 3);
    g.strokeStyle = "#e8edf2"; g.lineWidth = 4; g.beginPath(); g.moveTo(CAB_X - 10, 134); g.lineTo(CAB_X - 10, 112); g.lineTo(W + 160, 112); g.stroke();
    for (let x = CAB_X - 10; x < W + 160; x += 70) { g.beginPath(); g.moveTo(x, 134); g.lineTo(x, 112); g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = 1; g.beginPath(); g.moveTo(CAB_X - 12, 112); g.lineTo(W + 160, 112); g.stroke();
    // mástil
    g.fillStyle = "#e9edf1"; g.fillRect(978, 30, 7, 104); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.strokeRect(978, 30, 7, 104);
    g.fillStyle = "#d33"; g.beginPath(); g.arc(981.5, 28, 5, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = "#e9edf1"; g.fillRect(960, 70, 44, 5); g.strokeRect(960, 70, 44, 5);
    // ojo de buey con aro de latón y reflejo de cielo
    const ob = { x: 936, y: 290, r: 30 };
    g.fillStyle = "#c9962e"; g.beginPath(); g.arc(ob.x, ob.y, ob.r + 7, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    const vg = g.createLinearGradient(ob.x - ob.r, ob.y - ob.r, ob.x + ob.r, ob.y + ob.r); vg.addColorStop(0, "#bfe6f7"); vg.addColorStop(0.5, "#5fa9d6"); vg.addColorStop(1, "#24557f");
    g.fillStyle = vg; g.beginPath(); g.arc(ob.x, ob.y, ob.r, 0, TAU); g.fill(); g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 5; g.beginPath(); g.arc(ob.x, ob.y, ob.r - 9, Math.PI * 1.1, Math.PI * 1.45); g.stroke();
    g.fillStyle = "#8a6420"; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; g.beginPath(); g.arc(ob.x + Math.cos(a) * (ob.r + 3.5), ob.y + Math.sin(a) * (ob.r + 3.5), 1.6, 0, TAU); g.fill(); }
    // salvavidas colgado
    const sv = { x: 1090, y: 262, r: 40 };
    g.save(); g.translate(sv.x, sv.y);
    g.lineWidth = 22; g.strokeStyle = "#f05a28"; g.beginPath(); g.arc(0, 0, sv.r - 11, 0, TAU); g.stroke();
    g.strokeStyle = "#ffffff"; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(0, 0, sv.r - 11, i * Math.PI / 2 + 0.55, i * Math.PI / 2 + 1.0); g.stroke(); }
    g.lineWidth = 2; g.strokeStyle = TINTA; g.beginPath(); g.arc(0, 0, sv.r, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, 0, sv.r - 22, 0, TAU); g.stroke();
    g.strokeStyle = "#e9dcc0"; g.lineWidth = 2.5; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(0, 0, sv.r + 1, i * Math.PI / 2 + 0.1, i * Math.PI / 2 + 0.45); g.stroke(); }
    g.restore();
    // borda blanca y regala de teca (a lo largo, hasta la cabina)
    g.fillStyle = "#f2f4f3"; g.fillRect(-160, BORDA, CAB_X - 18 + 160, CUB - BORDA);
    g.fillStyle = "rgba(150,165,180,0.35)"; g.fillRect(-160, CUB - 8, CAB_X - 18 + 160, 8);
    g.fillStyle = "#a9733f"; g.fillRect(-160, BORDA - 7, CAB_X - 18 + 160 + 6, 9);
    g.fillStyle = "rgba(255,225,180,0.5)"; g.fillRect(-160, BORDA - 6, CAB_X - 18 + 160 + 6, 2);
    g.strokeStyle = TINTA; g.lineWidth = 1.8; g.strokeRect(-160, BORDA - 7, CAB_X - 18 + 160 + 6, 9);
    g.beginPath(); g.moveTo(-160, CUB); g.lineTo(CAB_X - 18, CUB); g.stroke();
    // imbornales
    g.fillStyle = "#4b5966"; for (let x = -100; x < CAB_X - 40; x += 210) { g.beginPath(); g.ellipse(x, CUB - 6, 12, 3, 0, 0, TAU); g.fill(); }
    // barandilla de acero blanco
    const tubo = (x0, y0, x1, y1, w) => {
      g.strokeStyle = TINTA; g.lineWidth = w + 2.4; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      g.strokeStyle = "#dfe5ea"; g.lineWidth = w; g.stroke();
      g.strokeStyle = "#ffffff"; g.lineWidth = Math.max(1, w * 0.35); g.beginPath(); g.moveTo(x0, y0 - w * 0.2); g.lineTo(x1, y1 - w * 0.2); g.stroke();
    };
    tubo(-160, RAIL3, CAB_X - 20, RAIL3, 2.2);
    tubo(-160, RAIL2, CAB_X - 20, RAIL2, 4);
    for (let x = -110; x < CAB_X - 30; x += 128) {
      tubo(x, BORDA - 6, x, RAIL, 5.5);
      g.fillStyle = "#c9d1d8"; g.beginPath(); g.ellipse(x, BORDA - 6, 7, 2.5, 0, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
    }
    tubo(-160, RAIL, CAB_X - 16, RAIL, 6.5);
    g.fillStyle = "#dfe5ea"; g.beginPath(); g.ellipse(CAB_X - 16, RAIL, 4, 6, 0, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke();
    // cubierta de teca (tablas en perspectiva)
    g.fillStyle = "#c48a52"; g.fillRect(-160, CUB, W + 320, H + 160 - CUB);
    const VP = { x: 512, y: -260 };
    const xEn = (X, y) => VP.x + (X - VP.x) * (y - VP.y) / (CUB - VP.y);
    let y = CUB, i = 0;
    while (y < H + 160) {
      const h = 7 + i * 2.6, y2 = y + h;
      g.fillStyle = `rgb(${196 + Math.round(18 * (hash(i + 3) - 0.5))},${138 + Math.round(14 * (hash(i + 5) - 0.5))},${82 + Math.round(10 * (hash(i + 7) - 0.5))})`;
      g.fillRect(-160, y, W + 320, h);
      // juntas a tope, escalonadas
      g.strokeStyle = "rgba(60,36,18,0.6)"; g.lineWidth = 1 + i * 0.12;
      for (let k = -10; k < 14; k++) { const X = 512 + (k + (i % 3) * 0.33) * 260; const xa = xEn(X, y), xb = xEn(X, y2); g.beginPath(); g.moveTo(xa, y); g.lineTo(xb, y2); g.stroke(); }
      g.strokeStyle = "#3a2416"; g.lineWidth = 1.2 + i * 0.18; g.beginPath(); g.moveTo(-160, y2); g.lineTo(W + 160, y2); g.stroke();
      g.strokeStyle = "rgba(255,225,180,0.25)"; g.lineWidth = 1; g.beginPath(); g.moveTo(-160, y + 1.5); g.lineTo(W + 160, y + 1.5); g.stroke();
      y = y2; i++;
    }
    g.fillStyle = "rgba(40,20,5,0.22)"; g.fillRect(-160, CUB, W + 320, 10);
    // luz de sol sobre la cubierta (de la izquierda)
    const lg = g.createLinearGradient(-160, 0, W + 160, 0); lg.addColorStop(0, "rgba(255,240,200,0.18)"); lg.addColorStop(0.6, "rgba(255,240,200,0)"); lg.addColorStop(1, "rgba(60,30,10,0.1)");
    g.fillStyle = lg; g.fillRect(-160, CUB, W + 320, H + 160 - CUB);
    // cornamusa y cabo enrollado (delante a la izquierda)
    g.fillStyle = "#d4dbe1"; g.strokeStyle = TINTA; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(108, 500); g.lineTo(152, 500); g.quadraticCurveTo(156, 494, 150, 493); g.lineTo(110, 493); g.quadraticCurveTo(104, 494, 108, 500); g.closePath(); g.fill(); g.stroke();
    g.fillRect(124, 500, 10, 4); g.strokeRect(124, 500, 10, 4);
    for (let k = 0; k < 4; k++) { g.strokeStyle = TINTA; g.lineWidth = 7; g.beginPath(); g.ellipse(60, 590 - k * 5, 54 - k * 9, 15 - k * 2.4, 0, 0, TAU); g.stroke();
      g.strokeStyle = "#efe2c2"; g.lineWidth = 4.5; g.stroke();
      g.strokeStyle = "rgba(160,130,80,0.7)"; g.lineWidth = 1; g.setLineDash([3, 4]); g.stroke(); g.setLineDash([]); }
    // ancla pequeña de adorno en la cabina
    g.save(); g.translate(1010, 360); g.strokeStyle = "#1f3e6e"; g.lineWidth = 3.5;
    g.beginPath(); g.moveTo(0, -18); g.lineTo(0, 16); g.moveTo(-9, -10); g.lineTo(9, -10); g.moveTo(-14, 6); g.quadraticCurveTo(0, 24, 14, 6); g.stroke();
    g.beginPath(); g.arc(0, -22, 4, 0, TAU); g.stroke(); g.restore();
    return c;
  }
  // el barco se pinta en dos trozos (cubierta con barandilla y cabina) para no mover píxeles vacíos
  function recortaBarco(c) {
    const trozo = (x0, y0, x1, y1) => { const k = lienzo(x1 - x0, y1 - y0); k.getContext("2d").drawImage(c, -(x0 + 160), -(y0 + 140)); return k; };
    return { cubierta: trozo(-160, RAIL - 12, W + 160, H + 160), xc: -160, yc: RAIL - 12,
             cabina: trozo(CAB_X - 40, 18, W + 160, RAIL - 12), xk: CAB_X - 40, yk: 18 };
  }
  function banderin(g, t) {           // en el mástil (marco del barco)
    g.save(); g.translate(985, 36);
    g.beginPath(); g.moveTo(0, 0);
    for (let i = 1; i <= 8; i++) { const u = i / 8; g.lineTo(46 * u, -2 * u + 4 * u * Math.sin(t * 9 - u * 5)); }
    for (let i = 8; i >= 0; i--) { const u = i / 8; g.lineTo(46 * u, 20 * (1 - u) * 0.9 + 2 + 4 * u * Math.sin(t * 9 - u * 5)); }
    g.closePath(); g.fillStyle = "#1f3e6e"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
    g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.beginPath(); g.moveTo(4, 9); for (let i = 1; i <= 6; i++) { const u = i / 8; g.lineTo(46 * u, 9 * (1 - u) + 1 + 4 * u * Math.sin(t * 9 - u * 5)); } g.stroke();
    g.restore();
  }
  function destellos(g, t) {          // brillos en el agua (sobre todo en la estela del sol)
    g.save(); g.fillStyle = "#ffffff";
    for (let i = 0; i < 34; i++) {
      const enEstela = i < 20, y = HORIZ + 8 + (enEstela ? 330 * hash(i + 2) : 300 * hash(i + 40));
      const x = enEstela ? 150 + (hash(i + 7) - 0.5) * (30 + (y - HORIZ) * 0.5) : 260 + 760 * hash(i + 11);
      const k = Math.max(0, Math.sin(t * (3 + 2 * hash(i)) + i * 1.9)); if (k < 0.35) continue;
      const s = (1.5 + 3 * (y - HORIZ) / 300) * (k - 0.35) * 1.6;
      g.globalAlpha = enEstela ? 0.95 : 0.6;
      g.beginPath(); g.moveTo(x - s * 2.2, y); g.lineTo(x, y - s * 0.7); g.lineTo(x + s * 2.2, y); g.lineTo(x, y + s * 0.7); g.closePath(); g.fill();
    }
    g.restore();
  }
  function velero(g, t) {             // velero lejano en el horizonte
    g.save(); g.translate(650 + 6 * t, HORIZ + 1); g.rotate(0.04 * Math.sin(t * 1.7));
    g.fillStyle = "#2d3a48"; g.beginPath(); g.moveTo(-10, -2); g.lineTo(10, -2); g.lineTo(7, 2); g.lineTo(-8, 2); g.closePath(); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(0, -24); g.lineTo(0, -3); g.lineTo(-9, -3); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(1.5, -22); g.lineTo(1.5, -3); g.lineTo(9, -3); g.closePath(); g.fill();
    g.restore();
  }
  function luces(g) {
    g.save();
    g.globalCompositeOperation = "lighter";
    const la = g.createRadialGradient(150, 60, 10, 150, 60, 520); la.addColorStop(0, "rgba(255,236,190,0.16)"); la.addColorStop(1, "rgba(255,236,190,0)");
    g.fillStyle = la; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = "multiply";
    const v = g.createRadialGradient(512, 300, 380, 512, 300, 760); v.addColorStop(0, "rgb(255,255,255)"); v.addColorStop(1, "rgb(170,185,205)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    g.restore();
  }
  function camara(t) {
    const z = tramo(t, T.ofrece0 - 0.6, T.final + 0.2);
    const v = t - T.cubre, sh = v > 0 ? 2.4 * Math.exp(-v * 7) * Math.sin(v * 34) : 0;
    return { k: 1 + 0.12 * z, x: 512 + (408 - 512) * z + sh, y: 300 - 22 * z + sh * 0.5 };
  }
  function sombras(g, pg, pk) {
    g.save(); g.fillStyle = "rgba(60,30,10,0.26)";
    g.beginPath(); g.ellipse(pg.xF + 4, SUELO + 6, 64, 8, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(pk.xF - 4, SUELO + 6, 66, 8, 0, 0, TAU); g.fill();
    g.restore();
  }

  class Yate extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !K.listo()) return;
      if (!cielo) { cielo = creaCielo(); nubes = creaNubes(); barco = recortaBarco(creaBarco()); }
      const P = pose(t), pg = P.g, pk = P.k;
      const luz = tramo(t, NEGRO_INICIO, 0.8) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      // cielo, nubes, mar y lo que hay lejos
      g.drawImage(cielo, -80, -80);
      g.drawImage(nubes, -140 - 7 * t, -10);
      velero(g, t);
      destellos(g, t);
      for (let i = 1; i < LAZOS.length; i++) { const q = lazo(LAZOS[i], t), q2 = lazo(LAZOS[i], t + 0.02); gaviota(g, q.x, q.y, 0.1 * Math.sin(t * 1.1 + i), 0.3, q2.x >= q.x ? 1 : -1, { alas: 1, aleteo: 0.3 * Math.sin(t * 3.4 + i) - 0.1, patas: 0 }); }
      const gv = gaviotaHeroe(t, pg);
      if (t < T.gav0 + 0.3) gaviota(g, gv.x, gv.y, gv.ang, gv.esc, gv.dir, gv.e);
      olaDetras(g, t);
      // el barco y los dos
      g.save(); aplicaBarco(g, t);
      g.drawImage(barco.cubierta, barco.xc, barco.yc); g.drawImage(barco.cabina, barco.xk, barco.yk);
      banderin(g, t);
      aguaCubierta(g, t, pg);
      sombras(g, pg, pk);
      if (t >= T.cambio) dibujaGCapa(g, pg, t); else G.dibujar(g, pg, t);
      K.dibujar(g, pk, t);
      sombraOla(g, t);
      goteo(g, t, pg);
      pez(g, t, pg);
      cortina(g, t);
      salpicaduras(g, t);
      g.restore();
      // la gaviota que baja y se posa (marco de la cámara) y, encima, la sombrillita
      if (t >= T.gav0 + 0.3) gaviota(g, gv.x, gv.y, gv.ang, gv.esc, gv.dir, gv.e);
      g.save(); aplicaBarco(g, t);
      const so = sombrilla(t, pg, pk);
      dibSombrilla(g, so, so.vaso ? 0.4 : 0);
      g.restore();
      g.restore();
      luces(g);
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00083.2", nombre: "Guillermo y Kiriku · El yate", crear: () => new Yate() });
  window.__A2D_00083_2 = { pose, T, DUR, sombrilla, gaviotaHeroe, vasoEn, aCamara, angB, PAJITA, rot, PIE_GAV };
})();
