"use strict";
/* 00097 · Guillermo y Marta · Bajo la lluvia
 *
 * Negro → una calle de la ciudad al anochecer, lloviendo: floristería con su toldo de rayas que gotea y
 * cubos de flores, una librería con el escaparate encendido, ventanas encendidas arriba, una farola con
 * su halo, la acera mojada que refleja las luces, charcos con sus anillos y un canalón que chorrea.
 * Marta tiende la palma, mira al cielo y abre de golpe su paraguas pequeñito de gajos mostaza y crema
 * (¡pop!, rebote). Guillermo entra corriendo por la izquierda, empapado (el pelo aplastado y chorreando),
 * haciéndose visera con la mano; frena patinando junto a ella y le pone ojitos con las manos juntas.
 * Marta sonríe y le hace sitio inclinando el paraguas; Guillermo se mete debajo de dos saltitos.
 * Pero el paraguas es pequeño: a cada uno le cae la lluvia en el hombro de fuera. Se miran el hombro,
 * se miran, y se arriman un poco… y otro poco… hasta quedarse mejilla con mejilla, apretujados y
 * colorados, mirando a cámara. Llega una racha de viento: la lluvia se tuerce, a Marta se le vuela la
 * melena, el paraguas cabecea… y se da la vuelta (¡plof!). Les cae la lluvia encima a los dos. Miran
 * arriba, se miran muy serios, empapados… y se parten de risa. Se dan la mano, cogen impulso y saltan
 * juntos al charco de delante: ¡chof!, una corona de agua que les salpica hasta la cabeza. Siguen
 * riéndose y miran a cámara; Marta guiña un ojo → negro.
 *
 * Guillermo se pinta en un lienzo aparte (pelo mojado y ropa empapada sin tocar el fondo); Marta también,
 * desde que el paraguas se da la vuelta. Los giros del paraguas son de su propio dibujo (sin vueltas
 * enteras de nadie). Sin textos. Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, hash, ruido } = M2;
  const G = Guillermo, M = Marta, R = Recortes;
  const S0 = 0.27, SUELO0 = 556, DUR = 14.4, TAU = Math.PI * 2;
  const P = (x, y) => ({ x, y });
  const difAng = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const lienzo = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  const TINTA = "#1b1420";

  const T = {
    entra: 0.8,
    palma0: 0.3, palma1: 1.0,
    abre0: 1.0, pop: 1.32, abre1: 1.8,
    corre0: 1.15, llega: 2.5, frena1: 2.82,
    mira0: 2.9, ruega0: 3.08, ruega1: 3.78,
    invita0: 3.45, invita1: 3.95,
    entraG0: 3.95, entraG1: 4.42,
    hombro1: 4.55, mira1: 4.95,
    paso1: 5.08, paso1f: 5.4,
    hombro2: 5.5, paso2: 5.82, paso2f: 6.14,
    apreta0: 6.16, mejilla: 6.55,
    camara0: 7.2, corazon: 7.55,
    viento0: 8.2, voltea: 8.78,
    separa1: 9.1,
    arriba0: 9.12, seMiran: 9.55,
    risa0: 9.92, risa1: 10.95,
    charco: 11.0, manos0: 11.12, manos1: 11.42,
    agacha0: 11.42, salta: 11.66, cae: 12.04,
    camara1: 12.6, guino: 13.12,
    fin: 13.78
  };

  /* =====================================================================================
   * UTILIDADES
   * ===================================================================================== */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function guion(lista, dic, base, t) {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const recorrido = (lista, t) => {
    if (t <= lista[0][0]) return lista[0][1];
    for (let i = 1; i < lista.length; i++) if (t < lista[i][0]) return lerp(lista[i - 1][1], lista[i][1], suave(fase(t, lista[i - 1][0], lista[i][0])));
    return lista[lista.length - 1][1];
  };
  const parpadeo = (t, lista, d = 0.15) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const D = (pu, ix, md, re) => ({ pulgar: pu, indice: ix, medio: md, anular: re, menique: re });
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const AGARRA = D(0.3, 0.3, 0.3, 0.3), PUNO = D(0, 0, 0, 0), PALMA = D(0.9, 1, 1, 1), RELAJ = D(0.5, 0.55, 0.5, 0.45);
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));

  /* ---------- manos ----------
   * manoEn: mano centrada en `scr` (pantalla). El antebrazo apunta al codo que sale de la IK, así la mano
   * siempre sigue al brazo; si el brazo no llega, la mano se queda donde llega. */
  const CODO = new Map([[G, { l: G.BRAZO_L * 0.5, c: G.A.datos.piezas.brazo_cerca.codo }],
                        [M, { l: (M.A.datos.piezas.brazo || {}).codo ?? M.BRAZO_L * 0.5, c: (M.A.datos.piezas.brazo_cerca || {}).codo ?? M.BRAZO_C_L * 0.5 }]]);
  function manoEn(Pj, p, lado, scr, o = {}) {
    const cerca = lado === "cerca", Tr = Pj.tronco(p), h = Tr(cerca ? Pj.HOMBRO_C : Pj.HOMBRO);
    const L = cerca ? Pj.BRAZO_C_L : Pj.BRAZO_L, sj = CODO.get(Pj)[cerca ? "c" : "l"];
    const dobla = o.dobla ?? (cerca ? -1 : 1);
    let q = Pj.aHoja(p, scr);
    const d = Math.hypot(q.x - h.x, q.y - h.y), Lmax = L * 1.04;
    if (d > Lmax) q = { x: h.x + (q.x - h.x) * Lmax / d, y: h.y + (q.y - h.y) * Lmax / d };
    const c = R.ik(h, q, L, sj, 42, dobla, 1.08), dir = R.dir(c.a1);
    const e = { x: h.x + dir.x * sj * c.estira, y: h.y + dir.y * sj * c.estira };
    const mu = Math.atan2(e.y - q.y, e.x - q.x) + (o.dmu || 0);
    return { x: q.x, y: q.y, ang: 0, mu, dobla, puno: o.puno ?? 1, dedos: o.dedos || AGARRA };
  }
  function mezclaMano(a, b, k) {
    if (k <= 0) return a; if (k >= 1) return b;
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), ang: 0, mu: a.mu + difAng(a.mu, b.mu) * k, dobla: k < 0.5 ? a.dobla : b.dobla,
      puno: lerp(a.puno ?? 1, b.puno ?? 1, k), dedos: DD(a.dedos || AGARRA, b.dedos || AGARRA, k) };
  }
  // pista de una mano: [t0, t1, f(p) → mano, curva]
  function pista(lista, t, p) {
    let c = lista[0][2](p);
    for (let i = 1; i < lista.length; i++) { const [t0, t1, f, e] = lista[i]; if (t <= t0) break; c = mezclaMano(c, f(p), (e || suave)(fase(t, t0, t1))); }
    return c;
  }
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { cerca: punoDesde(P(131, 652), -1.75), lejos: punoDesde(P(372, 648), -1.75) };
  function bolsillo(Pj, p, lado) {
    if (Pj === G) { const b = G.tronco(p)(BOLS_G[lado]); return { x: b.x, y: b.y, ang: 0, mu: -1.75, puno: 0, dobla: lado === "cerca" ? -1 : 1, dedos: D(0.4, 0.4, 0.4, 0.4) }; }
    const m = Pj.manoReposo(p, lado); return Object.assign({ dedos: D(0.4, 0.4, 0.4, 0.4) }, m);
  }
  const centroMano = (Pj, p, m) => Pj.aPantalla(p, { x: m.x, y: m.y });
  const conMano = (Pj, p, m, dx, dy) => { const q = Pj.aHoja(p, P(Pj.aPantalla(p, m).x + dx, Pj.aPantalla(p, m).y + dy)); return Object.assign({}, m, { x: q.x, y: q.y }); };

  /* ---------- pies ----------
   * apoyos: [[t, x, dur?]]: el pie está quieto en x desde t hasta t + dur y luego vuela al siguiente. */
  function pieDe(apoyos, t, o) {
    let i = 0; for (let k = 0; k < apoyos.length; k++) if (apoyos[k][0] <= t) i = k;
    const [tf, xf, d0] = apoyos[i], dur = d0 ?? o.apoyo;
    if (t <= tf || i === apoyos.length - 1 || t <= tf + dur) {
      const u = clamp((t - tf) / Math.max(1e-3, dur));
      return { x: xf, h: 0, a: o.corre && i > 0 ? lerp(-0.12, 0.3, u) : 0 };
    }
    const [tn, xn] = apoyos[i + 1], toff = tf + dur, u = clamp((t - toff) / (tn - toff));
    const x = lerp(xf, xn, suave(clamp((u - 0.05) / 0.95)));
    const h = o.alto * Math.sin(Math.PI * Math.pow(u, o.corre ? 0.72 : 1));
    let a;
    if (o.corre) a = u < 0.3 ? lerp(0.3, 0.9, suave(u / 0.3)) : u < 0.75 ? lerp(0.9, 0.1, suave((u - 0.3) / 0.45)) : lerp(0.1, -0.12, suave((u - 0.75) / 0.25));
    else a = 0.24 * Math.sin(Math.PI * u) - 0.06 * Math.sin(TAU * u);
    return { x, h, a };
  }
  // pie del mundo → pierna en la hoja (con la escala y el suelo de la postura)
  function aPierna(Pj, p, w, lado) {
    const tob = Pj.SUELO - Pj.TOBILLO_ALTO;
    return { tob: P(Pj.aHoja(p, P(w.x, p.suelo)).x, tob - (lado === "lejos" ? 12 : 0) - w.h / (p.s * Pj.K)), ang: w.a };
  }

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, rub: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }
  const CU0 = { pel: 0, torso: 0, cab: 0, cdy: 0 };
  const CU = o => Object.assign({}, CU0, o);

  /* =====================================================================================
   * PROFUNDIDAD: el salto al charco los acerca a cámara (más grandes y más abajo)
   * ===================================================================================== */
  const XF = 520;                                  // punto de fuga horizontal
  const prof = t => {
    const v = t - T.salta, d = T.cae - T.salta;
    return v <= 0 ? 0 : v >= d ? 1 : suave(v / d);
  };
  const escala = t => S0 * (1 + 0.065 * prof(t));
  const sueloEn = t => SUELO0 + 22 * prof(t);
  const xProf = (x, t) => XF + (x - XF) * (1 + 0.065 * prof(t));

  /* =====================================================================================
   * EL PARAGUAS
   * Marco del paraguas: origen en el puño de Marta, el palo hacia arriba (−y) girado `ang`.
   *   abierto 0 (cerrado) … 1;  copa 1 (cúpula) … −1 (dado la vuelta)
   * ===================================================================================== */
  const PAR = { L: 236, R: 84, gajos: ["#e2a93a", "#f6e8c8"], gajosOsc: ["#b98222", "#d9c49c"], dentro: ["#9c6c1d", "#bfa77a"], palo: "#4a3a33", puno: "#8a4f2a" };
  const RIBS = [-90, -54, -18, 18, 54, 90].map(a => a * Math.PI / 180);
  // rueda la copa al abrir: rebote amortiguado
  function abierto(t) {
    if (t < T.pop - 0.06) return 0;
    const v = t - (T.pop - 0.06);
    if (v < 0.12) return suave(v / 0.12) * 1.12;
    return 1 + 0.12 * Math.exp(-(v - 0.12) * 7) * Math.cos((v - 0.12) * 22);
  }
  function copa(t) {
    if (t < T.voltea - 0.05) {
      const g = campana(t, T.viento0, T.voltea);
      return 1 - 0.35 * g * (0.5 + 0.5 * Math.sin((t - T.viento0) * 23));     // la tela se agita con la racha
    }
    const v = t - (T.voltea - 0.05);
    if (v < 0.12) return lerp(1, -1.25, salida(v / 0.12));
    return -1 - 0.25 * Math.exp(-(v - 0.12) * 5) * Math.cos((v - 0.12) * 18) - 0.05 * Math.sin(t * 9.3) * tramo(t, T.voltea, T.voltea + 0.6);
  }
  // inclinación del palo (0 = vertical; + = la punta hacia la derecha): apunta del puño a la cúpula planeada,
  // y encima los meneos (el pop, la racha, el tirón al darse la vuelta)
  function anguloPalo(t, pm, base) {
    const h = pm.hubObjetivo || P(base.x, base.y - PAR.L);
    let a = Math.atan2(h.x - base.x, base.y - h.y);
    const r = campana(t, T.viento0 - 0.05, T.voltea + 0.1);
    a += r * (0.16 * Math.sin((t - T.viento0) * 17) + 0.06 * Math.sin((t - T.viento0) * 29));
    if (t > T.voltea) a += 0.24 * Math.exp(-(t - T.voltea) * 4) * Math.sin((t - T.voltea) * 13);
    a += 0.05 * Math.sin(t * 2.3) * tramo(t, T.voltea + 0.5, T.voltea + 1);
    if (t > T.pop) a += 0.09 * Math.exp(-(t - T.pop) * 6) * Math.sin((t - T.pop) * 20);
    return a;
  }
  // geometría del paraguas en pantalla (para el agua, la máscara y el dibujo)
  function paraguas(t, pm) {
    const base = centroMano(M, pm, pm.manoCerca);
    const ang = anguloPalo(t, pm, base), o = abierto(t), f = copa(t);
    const c = Math.cos(ang), s = Math.sin(ang);
    const aP = q => ({ x: base.x + q.x * c - q.y * s, y: base.y + q.x * s + q.y * c });
    const L = PAR.L, Rr = PAR.R;
    // varillas visibles: punta de cada una en el marco del paraguas
    const caida = 0.52 * Rr * f, elip = 0.2 * Rr * Math.max(-1, Math.min(1, f));
    const punta = (phi, k = 1) => {
      const cs = Math.cos(phi), oo = Math.max(0, o);
      // abierta: perfil de cúpula (plano arriba y cae hacia el borde)
      const kk = Math.min(k, 1);
      const xa = Rr * k * Math.sin(phi), ya = -L + caida * (1 - Math.sqrt(Math.max(0, 1 - kk * kk))) + elip * k * cs;
      // cerrada: la varilla cuelga pegada al palo
      const xc = 7 * Math.sin(phi) * k * (1 - 0.45 * k), yc = -L + 112 * k;
      const e = Math.min(1, oo);
      const ex = oo > 1 ? oo : 1;            // el rebote del pop: un pelín más grande
      return P(lerp(xc, xa * ex, e), lerp(yc, ya, e));
    };
    return { base, ang, o, f, aP, punta, L, R: Rr, cub: P(0, -L) };
  }

  /* =====================================================================================
   * GUILLERMO (a la izquierda, mira a la derecha)
   * ===================================================================================== */
  const CG = {
    corre: E({ mx: 0.9, my: -0.25, c: 0.4, z: 0.6, sd: 10, gd: 0.15, si: 10, gi: 0.15, abre: 12, ancho: 0.8, sonr: -0.35 }),
    frena: E({ mx: 0.9, my: 0.0, iris: 0.8, sd: 22, si: 22, abre: 10, ancho: 0.6, sonr: -0.1 }),
    arribaL: E({ mx: 0.3, my: -0.9, c: 0.3, z: 0.4, sd: 6, gd: 0.2, si: 6, gi: 0.2, abre: 4, ancho: 0.6, sonr: -0.3 }),
    ruega: E({ mx: 0.92, my: -0.1, iris: 1.26, sd: 24, gd: 0.3, si: 24, gi: 0.3, abre: 3, ancho: 0.55, sonr: 0.25 }),
    feliz: E({ mx: 0.92, my: 0.05, c: 0.25, h: 0.6, sd: 14, si: 14, abre: 6, ancho: 1, sonr: 0.95, rub: 0.3 }),
    hombro: E({ mx: -0.8, my: 0.6, iris: 0.9, sd: 4, gd: 0.15, si: 4, gi: 0.15, abre: 3, ancho: 0.6, sonr: -0.35 }),
    miraM: E({ mx: 0.95, my: 0.08, sd: 10, gd: 0.1, si: 10, gi: 0.1, abre: 0, ancho: 0.8, sonr: 0.0 }),
    apretado: E({ mx: 0.95, my: -0.05, c: 0.4, z: 0.25, sd: 12, si: 12, abre: 0, ancho: 0.9, sonr: 0.7, mof: 0.55, rub: 0.85 }),
    camara: E({ mx: -0.88, my: 0.02, c: 0.28, sd: 16, si: 16, abre: 0, ancho: 0.95, sonr: 0.8, mof: 0.55, rub: 0.95 }),
    susto: E({ mx: 0.4, my: -0.6, iris: 0.68, sd: 28, si: 28, abre: 16, ancho: 0.6, sonr: -0.2 }),
    arriba: E({ mx: 0.45, my: -0.95, iris: 0.85, sd: 18, si: 18, abre: 10, ancho: 0.55, sonr: -0.1 }),
    serio: E({ mx: 0.95, my: 0.05, c: 0.4, sd: -2, si: -2, abre: 0, ancho: 0.8, sonr: -0.15 }),
    risa: E({ mx: 0.6, c: 1, h: 1, sd: 16, si: 16, abre: 24, ancho: 1.1, sonr: 1, rub: 0.35 }),
    salto: E({ mx: 0.9, my: 0.25, c: 0.15, h: 0.5, sd: 20, si: 20, abre: 26, ancho: 1, sonr: 1, rub: 0.3 }),
    final: E({ mx: -0.88, my: 0.02, c: 0.3, h: 0.6, sd: 14, si: 14, abre: 16, ancho: 1.05, sonr: 1, rub: 0.45 })
  };
  const GUION_CG = [
    [T.llega - 0.05, T.llega + 0.08, "frena"], [T.mira0, T.mira0 + 0.12, "arribaL"], [T.ruega0, T.ruega0 + 0.15, "ruega"],
    [T.invita1 - 0.1, T.invita1 + 0.08, "feliz"], [T.hombro1, T.hombro1 + 0.12, "hombro"], [T.mira1, T.mira1 + 0.12, "miraM"],
    [T.paso1f, T.paso1f + 0.1, "feliz"], [T.hombro2, T.hombro2 + 0.12, "hombro"], [T.paso2 - 0.12, T.paso2, "miraM"],
    [T.apreta0, T.mejilla, "apretado"], [T.camara0, T.camara0 + 0.15, "camara"], [T.viento0 + 0.05, T.viento0 + 0.2, "susto"],
    [T.arriba0, T.arriba0 + 0.12, "arriba"], [T.seMiran, T.seMiran + 0.12, "serio"], [T.risa0, T.risa0 + 0.1, "risa"],
    [T.agacha0, T.agacha0 + 0.12, "salto"], [T.cae + 0.1, T.cae + 0.3, "risa"], [T.camara1, T.camara1 + 0.15, "final"]
  ];
  const PARP_G = [3.0, 4.75, 6.0, 7.85, 9.35, 12.4, 13.6];
  const CUER_G = {
    corre: CU({ pel: 6, torso: 0.16, cab: 0.12, cdy: 10 }),
    frena: CU({ pel: 4, torso: -0.12, cab: -0.08, cdy: 2 }),
    base: CU({ pel: 2, torso: 0.02, cab: 0.0, cdy: 4 }),
    arriba: CU({ pel: 0, torso: -0.04, cab: -0.16, cdy: 0 }),
    ruega: CU({ pel: 10, torso: 0.1, cab: 0.08, cdy: 10 }),
    agacha: CU({ pel: 22, torso: 0.14, cab: 0.12, cdy: 14 }),
    encogido: CU({ pel: 6, torso: 0.03, cab: 0.04, cdy: 14 }),
    hombro: CU({ pel: 4, torso: -0.02, cab: -0.12, cdy: 8 }),
    apretado: CU({ pel: 20, torso: 0.1, cab: 0.24, cdy: 8 }),
    susto: CU({ pel: 0, torso: -0.08, cab: -0.14, cdy: -4 }),
    arribaV: CU({ pel: 0, torso: -0.05, cab: -0.2, cdy: 0 }),
    serio: CU({ pel: 4, torso: 0.02, cab: 0.06, cdy: 4 }),
    risa: CU({ pel: 8, torso: -0.08, cab: -0.16, cdy: 2 }),
    carga: CU({ pel: 40, torso: 0.07, cab: 0.04, cdy: 6 }),
    aire: CU({ pel: -6, torso: -0.06, cab: -0.1, cdy: -6 }),
    final: CU({ pel: 6, torso: 0.02, cab: -0.02, cdy: 2 })
  };
  const GUION_CUG = [
    [T.llega - 0.15, T.llega + 0.05, "frena"], [T.frena1, T.frena1 + 0.2, "base"], [T.mira0, T.mira0 + 0.15, "arriba"],
    [T.ruega0, T.ruega0 + 0.2, "ruega"], [T.entraG0, T.entraG0 + 0.12, "agacha"], [T.entraG1 - 0.05, T.entraG1 + 0.15, "encogido"],
    [T.hombro1, T.hombro1 + 0.15, "hombro"], [T.mira1, T.mira1 + 0.15, "encogido"], [T.hombro2, T.hombro2 + 0.15, "hombro"],
    [T.paso2 - 0.1, T.paso2, "encogido"], [T.apreta0, T.mejilla, "apretado"], [T.voltea - 0.04, T.voltea + 0.1, "susto"],
    [T.arriba0, T.arriba0 + 0.2, "arribaV"], [T.seMiran, T.seMiran + 0.2, "serio"], [T.risa0, T.risa0 + 0.15, "risa"],
    [T.agacha0, T.salta, "carga"], [T.salta, T.salta + 0.12, "aire", salida], [T.cae - 0.04, T.cae + 0.08, "carga"],
    [T.cae + 0.12, T.cae + 0.45, "risa"], [T.camara1, T.camara1 + 0.3, "final"]
  ];
  // x del cuerpo de Guillermo (mundo, antes de la profundidad)
  const XG_LLEGA = 392;
  const XG = [[T.entraG0, XG_LLEGA + 10], [T.entraG1, 452], [T.paso1, 452], [T.paso1f, 476], [T.paso2, 476], [T.paso2f, 500],
    [T.apreta0, 500], [T.voltea, 500], [T.separa1, 478], [DUR, 478]];
  function xCorre(t) {           // carrera hasta frenar y el patinazo
    const t0 = T.corre0, t1 = T.llega, x0 = -120;
    if (t <= t1) { const u = fase(t, t0, t1); return lerp(x0, XG_LLEGA, 0.88 * u + 0.12 * salida(u)); }
    return XG_LLEGA + 10 * salida(fase(t, t1, T.frena1));
  }
  const xG = t => t < T.entraG0 ? xCorre(t) : recorrido(XG, t);
  // apoyos de la carrera: un pie cada 0,14 s, un poco por delante del cuerpo
  const PER = 0.28;
  const APOYOS_G = (() => {
    const L = { cerca: [], lejos: [] };
    let lado = "lejos";
    for (let k = 0; ; k++) {
      const tc = T.corre0 + 0.06 + k * PER / 2;
      if (tc > T.llega - 0.02) break;
      L[lado].push([tc, xCorre(tc) + 26, 0.1]);
      lado = lado === "cerca" ? "lejos" : "cerca";
    }
    // frena: los dos pies plantados y patinando
    L.cerca.push([T.llega, XG_LLEGA - 26, 0.0]); L.lejos.push([T.llega - 0.04, XG_LLEGA + 18, 0.0]);
    return L;
  })();
  // pasos andando (después de frenar): [t0, t1, x, alza]
  const PASOS_G = {
    cerca: [[T.entraG0 + 0.15, T.entraG0 + 0.36, 430, 12], [T.paso1 + 0.12, T.paso1f, 454, 8], [T.paso2 + 0.12, T.paso2f, 478, 8], [T.voltea + 0.05, T.separa1, 456, 7]],
    lejos: [[T.entraG0, T.entraG0 + 0.18, 446, 14], [T.entraG0 + 0.3, T.entraG1, 472, 12], [T.paso1, T.paso1 + 0.18, 496, 8], [T.paso2, T.paso2 + 0.18, 520, 8], [T.voltea + 0.12, T.separa1 + 0.06, 498, 7]]
  };
  function pieAndando(lista, t, x0) {
    let x = x0, alza = 0, u = 0;
    for (const [t0, t1, xx, a] of lista) {
      if (t <= t0) break;
      const k = fase(t, t0, t1);
      if (k < 1) { x = lerp(x, xx, suave5(k)); alza = a * Math.sin(Math.PI * k); u = k; break; }
      x = xx;
    }
    return { x, h: alza, a: alza > 0.5 ? -0.16 * Math.sin(Math.PI * u) : 0 };
  }
  // el salto: altura del cuerpo sobre el suelo y recogida de piernas
  const vuelo = t => { const v = fase(t, T.salta, T.cae); return v > 0 && v < 1 ? Math.sin(Math.PI * v) : 0; };
  const agachado = t => campana(t, T.agacha0 - 0.05, T.salta + 0.04) + 0.9 * campana(t, T.cae - 0.03, T.cae + 0.3);

  function poseG(t) {
    const b = guion(GUION_CUG, CUER_G, t < T.llega ? "corre" : "base", t);
    const s = escala(t), suelo = sueloEn(t);
    const x0 = xG(t), x = xProf(x0, t), respira = Math.sin(t * 2.3);
    const corriendo = t < T.llega;
    // trote: el cuerpo sube y baja
    const bote = corriendo ? Math.abs(Math.sin((t - T.corre0) * Math.PI / (PER / 2))) * 9 * tramo(t, T.corre0, T.corre0 + 0.1) : 0;
    // tiritona
    const tir = dentro(t, T.entraG1 - 0.1, T.entraG1 + 0.1, T.apreta0, T.mejilla);
    const p = { x: x + 0.7 * Math.sin(t * 47) * tir, suelo, s, tirasLimpias: true, ikContinuo: false, hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 - bote / s - 46 * vuelo(t) / s + 36 * agachado(t) },
      torso: b.torso + 0.01 * Math.sin(t * 43) * tir, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.012 * Math.sin(t * 39) * tir, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } } };
    // ríe: los hombros
    const ri = campana(t, T.risa0, T.risa1 + 0.2) + campana(t, T.cae + 0.1, DUR);
    p.pelvis.y += 3.5 * Math.abs(Math.sin(t * 15)) * ri; p.cabeza.ang += 0.035 * Math.sin(t * 15) * ri;
    // pies
    let wC, wL;
    if (t < T.entraG0) {
      wC = pieDe(APOYOS_G.cerca, t, { corre: true, alto: 40, apoyo: 0.1 });
      wL = pieDe(APOYOS_G.lejos, t, { corre: true, alto: 40, apoyo: 0.1 });
      if (t >= T.llega) {         // patinazo: los pies resbalan con el cuerpo
        const d = xCorre(t) - XG_LLEGA;
        wC = { x: XG_LLEGA - 26 + d, h: 0, a: -0.08 * campana(t, T.llega, T.frena1) }; wL = { x: XG_LLEGA + 18 + d, h: 0, a: -0.2 * campana(t, T.llega, T.frena1) };
      }
    } else {
      wC = pieAndando(PASOS_G.cerca, t, XG_LLEGA - 16); wL = pieAndando(PASOS_G.lejos, t, XG_LLEGA + 28);
    }
    // profundidad y salto
    for (const w of [wC, wL]) { w.x = xProf(w.x, t); w.h += 46 * vuelo(t) + 16 * vuelo(t) * vuelo(t); }
    p.piernas.cerca = aPierna(G, p, wC, "cerca"); p.piernas.lejos = aPierna(G, p, wL, "lejos");
    if (vuelo(t) > 0) { p.piernas.cerca.ang = -0.3 * vuelo(t); p.piernas.lejos.ang = -0.25 * vuelo(t); }
    // cara
    const e = guion(GUION_CG, CG, "corre", t);
    if (corriendo) e.abre += 6 * Math.abs(Math.sin(t * 13));
    p.cara = cara(e, parpadeo(t, PARP_G));
    // mejilla con mejilla: la cabeza se aplasta un poco
    const ap = dentro(t, T.apreta0 + 0.2, T.mejilla, T.voltea - 0.02, T.voltea + 0.12);
    p.cabeza.esc = { x: 1 - 0.035 * ap, y: 1 + 0.015 * ap };
    p.aprieta = ap;
    // estado del agua (pelo mojado y ropa empapada)
    p.est = { w: 1, abajo: Math.PI / 2 - p.cabeza.ang, oscila: 0.12 * campana(t, T.voltea, T.voltea + 1.2) + 0.06 * campana(t, T.cae, T.cae + 1),
      chorrea: 1 - 0.6 * dentro(t, T.entraG1, T.entraG1 + 0.6, T.voltea, T.voltea + 0.2) };
    p.capaCabeza = (g, tt) => capaG(g, tt, p.est);
    p.capaTronco = g => troncoG(g, p.est);
    manosG(t, p);
    return p;
  }
  function manosG(t, p) {
    const Tr = G.tronco(p);
    const cab = () => G.aPantalla(p, G.centroCabeza(p));
    const bc = q => bolsillo(G, q, "cerca"), bl = q => bolsillo(G, q, "lejos");
    // carrera: la mano de delante hace de visera; la otra bracea
    const visera = q => { const c = cab(); return manoEn(G, q, "lejos", P(c.x + 30, c.y - 18), { dedos: D(0.9, 1, 1, 1), dobla: 1, dmu: 0.3 }); };
    const braceaC = q => { const ph = Math.sin(TAU * (t - T.corre0) / PER), h = G.aPantalla(q, Tr(G.HOMBRO_C)); return manoEn(G, q, "cerca", P(h.x - 18 * ph + 8, h.y + 44 + 16 * ph), { dedos: PUNO }); };
    const equilibrioC = q => { const h = G.aPantalla(q, Tr(G.HOMBRO_C)); return manoEn(G, q, "cerca", P(h.x - 62, h.y + 6), { dedos: PALMA }); };
    const equilibrioL = q => { const h = G.aPantalla(q, Tr(G.HOMBRO)); return manoEn(G, q, "lejos", P(h.x + 64, h.y - 4), { dedos: PALMA }); };
    // manos juntas para pedir (a la altura del pecho)
    const pecho = () => G.aPantalla(p, Tr(P(300, 420)));
    const ruegaC = q => { const c = pecho(); return manoEn(G, q, "cerca", P(c.x + 4, c.y + 2 + 2 * Math.sin(t * 9)), { dedos: D(0.6, 0.95, 0.95, 0.9), dobla: -1 }); };
    const ruegaL = q => { const c = pecho(); return manoEn(G, q, "lejos", P(c.x + 12, c.y - 2 + 2 * Math.sin(t * 9)), { dedos: D(0.6, 0.95, 0.95, 0.9), dobla: 1 }); };
    // sorpresa al darse la vuelta el paraguas: manos abiertas
    const abreC = q => { const h = G.aPantalla(q, Tr(G.HOMBRO_C)); return manoEn(G, q, "cerca", P(h.x - 46, h.y + 30), { dedos: PALMA }); };
    const abreL = q => { const h = G.aPantalla(q, Tr(G.HOMBRO)); return manoEn(G, q, "lejos", P(h.x + 40, h.y + 34), { dedos: PALMA }); };
    // risa: mano en la barriga
    const barriga = q => { const c = G.aPantalla(q, Tr(P(280, 560))); return manoEn(G, q, "lejos", P(c.x + 6, c.y), { dedos: D(0.7, 0.9, 0.9, 0.85) }); };
    // de la mano con Marta y el puño arriba
    const deLaMano = q => manoEn(G, q, "lejos", p.manoJunta || P(q.x + 52, 418), { dedos: AGARRA });
    const punoArriba = q => { const h = G.aPantalla(q, Tr(G.HOMBRO_C)); return manoEn(G, q, "cerca", P(h.x - 26, h.y - 66), { dedos: PUNO, dobla: -1 }); };
    const punoMedio = q => { const h = G.aPantalla(q, Tr(G.HOMBRO_C)); return manoEn(G, q, "cerca", P(h.x - 34, h.y + 6), { dedos: PUNO, dobla: -1 }); };
    p.manoCerca = pista([
      [0, 0, braceaC], [T.llega - 0.12, T.llega + 0.05, equilibrioC, salida], [T.mira0, T.ruega0 + 0.05, ruegaC],
      [T.entraG0 + 0.15, T.entraG1, bc], [T.voltea - 0.02, T.voltea + 0.1, abreC, salida], [T.arriba0 + 0.2, T.seMiran, bc],
      [T.manos0, T.manos1, punoMedio], [T.salta - 0.06, T.salta + 0.1, punoArriba, salida], [T.camara1 + 0.2, T.camara1 + 0.5, punoMedio]
    ], t, p);
    p.manoLejos = pista([
      [0, 0, visera], [T.llega - 0.12, T.llega + 0.05, equilibrioL, salida], [T.mira0, T.ruega0 + 0.05, ruegaL],
      [T.entraG0 + 0.15, T.entraG1, bl], [T.voltea - 0.02, T.voltea + 0.1, abreL, salida], [T.arriba0 + 0.2, T.seMiran, bl],
      [T.risa0 + 0.05, T.risa0 + 0.25, barriga], [T.manos0, T.manos1, deLaMano]
    ], t, p);
  }

  /* =====================================================================================
   * MARTA (a la derecha, mira a la izquierda)
   * ===================================================================================== */
  const CM = {
    cielo: E({ mx: 0.45, my: -0.9, c: 0.2, sd: 10, si: 10, abre: 4, ancho: 0.7, sonr: 0.35 }),
    palma: E({ mx: 0.6, my: 0.7, c: 0.25, sd: 6, si: 6, abre: 0, sonr: 0.3 }),
    pop: E({ mx: 0.5, my: -0.7, c: 0.2, h: 0.5, sd: 14, si: 14, abre: 6, ancho: 0.9, sonr: 0.9 }),
    tranquila: E({ mx: -0.4, my: -0.1, c: 0.3, h: 0.3, sd: 6, si: 6, sonr: 0.75 }),
    sorpresa: E({ mx: 0.92, my: 0.0, iris: 0.85, sd: 22, si: 22, abre: 10, ancho: 0.7, sonr: 0.2 }),
    invita: E({ mx: 0.92, my: 0.05, c: 0.25, h: 0.6, sd: 16, gd: 0.1, si: 16, gi: 0.1, abre: 4, ancho: 1, sonr: 0.95, rub: 0.15 }),
    hombro: E({ mx: -0.8, my: 0.55, sd: 6, gd: 0.15, si: 6, gi: 0.15, abre: 2, ancho: 0.6, sonr: -0.25 }),
    miraG: E({ mx: 0.95, my: 0.1, sd: 10, si: 10, abre: 0, ancho: 0.8, sonr: 0.2 }),
    apretada: E({ mx: 0.95, my: 0.05, c: 0.4, z: 0.2, sd: 14, si: 14, abre: 0, ancho: 0.9, sonr: 0.8, mof: 0.55, rub: 0.9 }),
    camara: E({ mx: -0.88, my: 0.02, c: 0.25, sd: 18, si: 18, abre: 0, ancho: 0.95, sonr: 0.85, mof: 0.5, rub: 1 }),
    susto: E({ mx: 0.35, my: -0.7, iris: 0.7, sd: 26, si: 26, abre: 14, ancho: 0.6, sonr: -0.1 }),
    arriba: E({ mx: 0.4, my: -0.95, iris: 0.85, sd: 18, si: 18, abre: 8, ancho: 0.55, sonr: 0 }),
    seria: E({ mx: 0.95, my: 0.05, c: 0.4, sd: 0, si: 0, abre: 0, ancho: 0.8, sonr: -0.05 }),
    risa: E({ mx: 0.6, c: 1, h: 1, sd: 16, si: 16, abre: 20, ancho: 1.05, sonr: 1, rub: 0.4 }),
    salto: E({ mx: 0.92, my: 0.2, c: 0.15, h: 0.5, sd: 20, si: 20, abre: 22, ancho: 1, sonr: 1, rub: 0.35 }),
    final: E({ mx: -0.88, my: 0.02, c: 0.3, h: 0.6, sd: 14, si: 14, abre: 12, ancho: 1, sonr: 1, rub: 0.4 }),
    guino: E({ mx: -0.85, my: -0.05, h: 1, cd: 1, sd: 6, si: 16, gi: 0.12, abre: 8, ancho: 1.05, sonr: 1, rub: 0.45 })
  };
  const GUION_CM = [
    [T.palma0, T.palma0 + 0.15, "palma"], [T.abre0 - 0.05, T.abre0 + 0.1, "cielo"], [T.pop, T.pop + 0.1, "pop"],
    [T.abre1, T.abre1 + 0.3, "tranquila"], [T.corre0 + 0.9, T.llega, "sorpresa"], [T.invita0, T.invita0 + 0.15, "invita"],
    [T.hombro1 + 0.08, T.hombro1 + 0.2, "hombro"], [T.mira1, T.mira1 + 0.12, "miraG"], [T.paso1f, T.paso1f + 0.1, "invita"],
    [T.hombro2 + 0.06, T.hombro2 + 0.18, "hombro"], [T.paso2 - 0.12, T.paso2, "miraG"], [T.apreta0, T.mejilla, "apretada"],
    [T.camara0 + 0.08, T.camara0 + 0.22, "camara"], [T.viento0, T.viento0 + 0.15, "susto"], [T.arriba0, T.arriba0 + 0.12, "arriba"],
    [T.seMiran, T.seMiran + 0.12, "seria"], [T.risa0 + 0.04, T.risa0 + 0.14, "risa"], [T.agacha0, T.agacha0 + 0.12, "salto"],
    [T.cae + 0.1, T.cae + 0.3, "risa"], [T.camara1 + 0.05, T.camara1 + 0.2, "final"], [T.guino - 0.06, T.guino + 0.06, "guino"]
  ];
  const PARP_M = [0.15, 2.2, 4.3, 5.7, 7.95, 9.4, 12.45, 13.9];
  const CUER_M = {
    base: CU({ pel: 2, torso: 0.02, cab: 0.03 }),
    palma: CU({ pel: 4, torso: 0.06, cab: 0.1, cdy: 4 }),
    cielo: CU({ pel: 0, torso: -0.05, cab: -0.2, cdy: 0 }),
    abre: CU({ pel: 6, torso: -0.04, cab: -0.12 }),
    invita: CU({ pel: 4, torso: 0.06, cab: 0.1, cdy: 2 }),
    hombro: CU({ pel: 4, torso: -0.02, cab: -0.14, cdy: 6 }),
    junta: CU({ pel: 6, torso: 0.04, cab: 0.06, cdy: 6 }),
    apretada: CU({ pel: -6, torso: 0.04, cab: 0.06, cdy: 0 }),
    tirada: CU({ pel: -4, torso: -0.14, cab: -0.16, cdy: -4 }),
    arriba: CU({ pel: 0, torso: -0.05, cab: -0.2 }),
    seria: CU({ pel: 4, torso: 0.02, cab: 0.06, cdy: 4 }),
    risa: CU({ pel: 12, torso: 0.16, cab: 0.12, cdy: 6 }),
    carga: CU({ pel: 40, torso: 0.07, cab: 0.04, cdy: 6 }),
    aire: CU({ pel: -6, torso: -0.06, cab: -0.1, cdy: -6 }),
    final: CU({ pel: 6, torso: 0.02, cab: -0.02, cdy: 2 })
  };
  const GUION_CUM = [
    [T.palma0, T.palma0 + 0.25, "palma"], [T.abre0 - 0.1, T.abre0 + 0.1, "cielo"], [T.pop, T.pop + 0.25, "abre"], [T.abre1, T.abre1 + 0.3, "base"],
    [T.invita0, T.invita0 + 0.25, "invita"], [T.invita1 + 0.1, T.entraG1, "base"], [T.hombro1 + 0.08, T.hombro1 + 0.22, "hombro"],
    [T.mira1, T.mira1 + 0.15, "junta"], [T.hombro2 + 0.06, T.hombro2 + 0.2, "hombro"], [T.paso2 - 0.1, T.paso2, "junta"],
    [T.apreta0, T.mejilla, "apretada"], [T.voltea - 0.05, T.voltea + 0.1, "tirada", salida], [T.arriba0, T.arriba0 + 0.2, "arriba"],
    [T.seMiran, T.seMiran + 0.2, "seria"], [T.risa0, T.risa0 + 0.15, "risa"], [T.agacha0, T.salta, "carga"],
    [T.salta, T.salta + 0.12, "aire", salida], [T.cae - 0.04, T.cae + 0.08, "carga"], [T.cae + 0.12, T.cae + 0.45, "risa"],
    [T.camara1, T.camara1 + 0.3, "final"]
  ];
  const XM_LISTA = [[0, 640], [T.paso1, 640], [T.paso1f, 624], [T.paso2, 624], [T.paso2f, 608], [T.voltea, 608], [T.separa1, 630], [DUR, 630]];
  const PASOS_M = {
    lejos: [[T.paso1, T.paso1 + 0.17, 608, 8], [T.paso2, T.paso2 + 0.17, 592, 8], [T.voltea + 0.12, T.separa1 + 0.06, 614, 7]],
    cerca: [[T.paso1 + 0.13, T.paso1f, 640, 8], [T.paso2 + 0.13, T.paso2f, 624, 8], [T.voltea + 0.05, T.separa1, 646, 7]]
  };
  function poseM(t) {
    const b = guion(GUION_CUM, CUER_M, "base", t);
    const s = escala(t), suelo = sueloEn(t), x0 = recorrido(XM_LISTA, t), x = xProf(x0, t), respira = Math.sin(t * 2.1 + 0.8);
    const p = { x, suelo, s, espejo: true, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: M.PELVIS.x, y: M.PELVIS.y + b.pel + respira * 1.1 - 46 * vuelo(t) / (s * M.K) + 36 * agachado(t) / M.K },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } },
      pelo: { viento: 0.12 * Math.sin(t * 0.8), inercia: 0 } };
    // ríe
    const ri = campana(t, T.risa0, T.risa1 + 0.2) + campana(t, T.cae + 0.1, DUR);
    p.pelvis.y += 3 * Math.abs(Math.sin(t * 16)) * ri; p.cabeza.ang += 0.03 * Math.sin(t * 16 + 0.7) * ri;
    // viento: la melena vuela hacia delante (hacia Guillermo, que es hacia donde mira)
    const vi = campana(t, T.viento0 - 0.1, T.voltea + 0.5);
    p.pelo.viento += vi * (1.2 + 0.4 * Math.sin(t * 13));
    p.pelo.inercia = -0.7 * campana(t, T.salta - 0.05, T.salta + 0.3) + 0.8 * campana(t, T.cae - 0.05, T.cae + 0.4);
    // mojada: la melena pesa (menos vuelo)
    const moj = tramo(t, T.voltea + 0.1, T.voltea + 0.8);
    p.pelo.viento *= 1 - 0.6 * moj * (1 - vi);
    // pies
    const ty = M.SUELO - M.TOBILLO_ALTO;
    for (const lado of ["cerca", "lejos"]) {
      const lista = PASOS_M[lado], ini = lado === "lejos" ? 624 : 656;
      const w = pieAndando(lista, t, ini);
      w.x = xProf(w.x, t); w.h += 46 * vuelo(t) + 16 * vuelo(t) * vuelo(t);
      p.piernas[lado] = aPierna(M, p, w, lado);
    }
    if (vuelo(t) > 0) { p.piernas.cerca.ang = -0.3 * vuelo(t); p.piernas.lejos.ang = -0.25 * vuelo(t); }
    const e = guion(GUION_CM, CM, "cielo", t);
    p.cara = cara(e, parpadeo(t, PARP_M));
    const ap = dentro(t, T.apreta0 + 0.2, T.mejilla, T.voltea - 0.02, T.voltea + 0.12);
    p.cabeza.esc = { x: 1 - 0.035 * ap, y: 1 + 0.015 * ap };
    p.moja = moj;
    p.hombroMojado = tramo(t, T.entraG1 - 0.1, T.paso2);
    p.capaTronco = g => troncoM(g, p, t);
    manosM(t, p);
    return p;
  }
  function manosM(t, p) {
    const Tr = M.tronco(p);
    const hC = () => M.aPantalla(p, Tr(M.HOMBRO_C)), hL = () => M.aPantalla(p, Tr(M.HOMBRO));
    // el paraguas: el puño va donde lo planea `planParaguas` (con los tirones de la racha)
    const obj = p.manoParaguas || (() => { const h = hC(); return P(h.x + 16, h.y - 20); })();
    let dx = 0, dy = 0;
    const ra = campana(t, T.viento0 - 0.05, T.voltea + 0.05);
    dx += ra * 7 * Math.sin((t - T.viento0) * 17); dy += ra * (-6 - 7 * Math.cos((t - T.viento0) * 17));
    if (t > T.voltea - 0.02) { const v = t - T.voltea; dy -= 26 * Math.exp(-Math.max(0, v) * 5) * clamp(v / 0.06 + 0.3); }
    p.manoCerca = manoEn(M, p, "cerca", P(obj.x + dx, obj.y + dy), { dedos: AGARRA, dobla: 1 });
    // mano lejana: palma a la lluvia, invita, bolsillo, susto, boca al reír, de la mano con Guillermo
    const palma = q => { const h = hL(); return manoEn(M, q, "lejos", P(h.x - 36, h.y + 46), { dedos: PALMA, dobla: 1, dmu: 0.5 }); };
    const invita = q => { const h = hL(), k = Math.sin((t - T.invita0) * 12); return manoEn(M, q, "lejos", P(h.x - 46 - 6 * k, h.y + 38 - 4 * k), { dedos: D(0.8, 1, 1, 1), dobla: 1, dmu: 0.4 }); };
    const bol = q => bolsillo(M, q, "lejos");
    const susto = q => { const h = hL(); return manoEn(M, q, "lejos", P(h.x - 2, h.y + 46), { dedos: D(0.7, 0.9, 0.9, 0.85), dobla: 1 }); };
    const boca = q => { const b = M.aPantalla(q, M.boca(q)); return manoEn(M, q, "lejos", P(b.x - 2, b.y + 8), { dedos: D(0.7, 1, 1, 1), dobla: 1 }); };
    const deLaMano = q => manoEn(M, q, "lejos", p.manoJunta || P(q.x - 52, 418), { dedos: AGARRA, dobla: 1 });
    p.manoLejos = pista([
      [0, 0, bol], [T.palma0, T.palma0 + 0.25, palma], [T.palma1, T.palma1 + 0.25, bol], [T.invita0, T.invita0 + 0.18, invita],
      [T.invita1, T.entraG1, bol], [T.viento0 + 0.02, T.viento0 + 0.15, susto], [T.arriba0 + 0.3, T.seMiran + 0.2, bol],
      [T.risa0 + 0.04, T.risa0 + 0.2, boca], [T.manos0, T.manos1, deLaMano]
    ], t, p);
  }
  // punto donde se dan la mano (pantalla): entre los dos, a la altura de la cadera
  function manosJuntas(pg, pm, t) {
    const a = G.aPantalla(pg, G.tronco(pg)(G.HOMBRO)), b = M.aPantalla(pm, M.tronco(pm)(M.HOMBRO));
    return P((a.x + b.x) / 2, Math.max(a.y, b.y) + 62 + 8 * Math.sin(t * 15) * campana(t, T.cae + 0.1, DUR));
  }
  /* ---------- mejilla con mejilla: el contacto se calcula de verdad ----------
   * Se miden los dos carrillos en pantalla y se corrige: Marta se inclina hacia él (el torso) y Guillermo
   * dobla las rodillas (la pelvis) hasta que los carrillos se tocan, con un poquito de solape. */
  const MEJ_G = P(962, 640), MEJ_M = P(946, 566), SOLAPE = 0;
  const apretar = t => dentro(t, T.apreta0, T.mejilla, T.voltea - 0.03, T.voltea + 0.12);
  function ajustaMejillas(pg, pm, t) {
    const k = apretar(t); if (k <= 0) return;
    for (let it = 0; it < 4; it++) {
      const a = G.aPantalla(pg, G.cabeza(pg).a(MEJ_G)), b = M.aPantalla(pm, M.cabeza(pm).a(MEJ_M));
      const pv = M.aPantalla(pm, pm.pelvis), rM = Math.max(60, Math.hypot(b.x - pv.x, b.y - pv.y));
      const dx = (a.x - SOLAPE * k) - b.x, dy = b.y - a.y;
      pm.torso += k * (-dx / rM) * (it === 0 ? 1 : 0.9);
      pg.pelvis.y += k * clamp(dy / pg.s, -60, 60);
    }
  }
  /* ---------- dónde va el paraguas ----------
   * La cúpula se planea encima de las cabezas (de Marta sola, o entre los dos al compartirlo) y el puño, al
   * lado de la cabeza de Marta, por fuera; el palo va del puño a la cúpula. */
  function planParaguas(t, pg, pm) {
    const cM = M.aPantalla(pm, M.centroCabeza(pm)), cG = G.aPantalla(pg, G.centroCabeza(pg));
    const topM = M.aPantalla(pm, M.cabeza(pm).a(P(840, 120))).y, topG = G.aPantalla(pg, G.cabeza(pg).a(P(800, 170))).y;
    const comparte = tramo(t, T.invita0, T.invita1 + 0.15) * (1 - tramo(t, T.voltea - 0.05, T.voltea + 0.3));
    const sola = 1 - comparte;
    // la mano: al hombro (cerrado), alzada al abrir, al lado de la cabeza al compartir, arriba del todo tras el tirón
    const hombro = P(cM.x + 54, cM.y + 126), alzada = P(cM.x + 56, cM.y + 84), lado = P(cM.x + 60, cM.y + 74), arriba = P(cM.x + 58, cM.y + 100);
    let mano = mezcla(hombro, alzada, tramo(t, T.abre0, T.pop - 0.04));
    mano = mezcla(mano, lado, tramo(t, T.invita0, T.invita1));
    mano = mezcla(mano, arriba, tramo(t, T.voltea - 0.04, T.voltea + 0.2));
    // la cúpula
    const hubSola = P(cM.x + 8, topM - 36), hubDos = P((cM.x + cG.x) / 2 + 4, Math.min(topM, topG) - 40);
    let hub = mezcla(hubSola, hubDos, comparte);
    // como mucho, unos 40° de inclinación
    const ang = Math.atan2(hub.x - mano.x, mano.y - hub.y), angL = clamp(ang, -0.8, 0.5);
    if (ang !== angL) { const d = Math.hypot(hub.x - mano.x, hub.y - mano.y); hub = P(mano.x + Math.sin(angL) * d, mano.y - Math.cos(angL) * d); }
    const alto = P(mano.x - 8, mano.y - PAR.L);
    hub = mezcla(hub, alto, tramo(t, T.voltea - 0.05, T.voltea + 0.3));
    pm.manoParaguas = mano; pm.hubObjetivo = hub;
  }
  function pose(t) {
    const pm = poseM(t), pg = poseG(t);
    ajustaMejillas(pg, pm, t);
    planParaguas(t, pg, pm);
    if (t > T.manos0 - 0.01) { const j = manosJuntas(pg, pm, t); pg.manoJunta = j; pm.manoJunta = j; }
    manosG(t, pg); manosM(t, pm);
    return { g: pg, m: pm };
  }

  /* =====================================================================================
   * CAPAS DE GUILLERMO: pelo mojado (retrato) y camiseta empapada (hoja del torso)
   * ===================================================================================== */
  const PIEL_CAB = [[806,850],[802,846],[766,842],[754,834],[746,834],[742,838],[734,826],[726,826],[718,814],[710,814],[704,808],[708,804],[702,798],[698,802],[690,798],[684,792],[682,782],[674,782],[662,774],[656,768],[660,764],[654,758],[650,762],[634,746],[630,746],[624,740],[624,732],[604,716],[608,712],[604,708],[604,692],[596,684],[596,668],[582,670],[570,654],[566,658],[556,648],[560,640],[558,638],[554,642],[544,632],[548,624],[532,604],[532,596],[528,592],[528,572],[532,568],[528,564],[532,560],[528,552],[540,536],[540,528],[548,516],[562,503],[570,499],[590,499],[624,532],[624,540],[630,550],[636,536],[632,532],[640,524],[640,516],[648,501],[676,477],[676,469],[684,461],[680,457],[690,447],[718,435],[734,423],[744,429],[728,461],[730,467],[762,451],[798,427],[806,431],[823,431],[839,443],[843,439],[851,439],[867,455],[875,455],[881,461],[869,481],[841,509],[843,511],[879,503],[903,487],[911,487],[917,493],[901,524],[893,532],[895,534],[931,514],[947,499],[955,503],[969,520],[965,596],[949,620],[953,624],[937,644],[937,652],[925,676],[909,732],[899,738],[877,764],[885,772],[875,782],[867,778],[861,788],[849,796],[825,832],[829,836],[819,846],[815,842]];
  const camino = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
  function gotaDib(g, x, y, s, a = 1, ang = 0) {      // gota con brillo (s = radio)
    if (a <= 0.01 || s <= 0.2) return;
    g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(ang);
    g.beginPath(); g.moveTo(0, -s * 1.7); g.quadraticCurveTo(s, 0, 0, s); g.quadraticCurveTo(-s, 0, 0, -s * 1.7);
    g.fillStyle = "#cfe9ff"; g.fill(); g.lineWidth = Math.max(0.8, s * 0.32); g.strokeStyle = "#1d3b52"; g.stroke();
    g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(-s * 0.3, -s * 0.15, s * 0.22, s * 0.35, 0, 0, TAU); g.fill();
    g.restore();
  }
  /* pelo mojado: se borran las púas del retrato y se pintan aplastadas y chorreando (como en 00083) */
  const PELO = (() => {
    const CUP = [[536,610],[522,540],[524,470],[542,410],[574,360],[625,316],[694,286],[775,270],[860,272],[940,294],[1006,332],[1050,382],[1068,440],[1062,500]];
    const FLEQUILLO = [[1062,500],[1042,552],[1028,522],[1004,570],[984,526],[954,566],[934,522],[902,556],[882,515],[848,540],[826,498],[792,515],[770,478],[728,486],[690,466],[656,488],[642,530],[632,575],[618,528],[598,505],[574,502],[556,520],[546,560]];
    const FRENTE = [[640,482],[720,452],[830,452],[930,470],[985,500],[1000,570],[960,615],[640,600]];
    const CAJA = [[300,40],[1320,40],[1320,700],[300,700]];
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
    function curvaPua(Pp, w, abajo, t, i, oscila) {
      const [r, tip, , lado, lm, cb] = Pp;
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
    function pua(g, Pp, w, abajo, t, i, oscila) {
      const ancho = Pp[2];
      const [Rq, P1, P2, P3] = curvaPua(Pp, w, abajo, t, i, oscila);
      const N = 12, izq = [], der = [], cen = [];
      for (let k = 0; k <= N; k++) {
        const u = k / N, q = cubica(Rq, P1, P2, P3, u), q2 = cubica(Rq, P1, P2, P3, Math.min(1, u + 0.02)), q1 = cubica(Rq, P1, P2, P3, Math.max(0, u - 0.02));
        const tx = q2.x - q1.x, ty = q2.y - q1.y, tl = Math.hypot(tx, ty) || 1, nx = -ty / tl, ny = tx / tl;
        const wv = ancho * 0.5 * Math.pow(1 - u, 0.9) * (1 + 0.15 * Math.sin(u * 3.1)) * 0.72;
        izq.push({ x: q.x + nx * wv, y: q.y + ny * wv }); der.push({ x: q.x - nx * wv, y: q.y - ny * wv }); cen.push({ x: q.x + nx * wv * 0.25, y: q.y + ny * wv * 0.25 });
      }
      const forma = () => { g.beginPath(); g.moveTo(izq[0].x, izq[0].y); for (const q of izq) g.lineTo(q.x, q.y); for (let k = der.length - 1; k >= 0; k--) g.lineTo(der[k].x, der[k].y); g.closePath(); };
      forma(); g.fillStyle = COL.medio; g.fill();
      g.save(); forma(); g.clip();
      g.beginPath(); g.moveTo(cen[0].x, cen[0].y); for (const q of cen) g.lineTo(q.x, q.y); for (let k = der.length - 1; k >= 0; k--) g.lineTo(der[k].x, der[k].y); g.closePath();
      g.fillStyle = COL.oscuro; g.globalAlpha *= 0.85; g.fill(); g.globalAlpha /= 0.85;
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
      g.beginPath(); M2.curva(g, CUP.slice(3, 11).map(([x, y]) => ({ x: x + (800 - x) * 0.08, y: y + 26 })), false, 0.35);
      g.lineWidth = 7; g.strokeStyle = "rgba(255,236,210,0.5)"; g.stroke();
      for (const i of ORDEN) pua(g, PUAS[i], wDe(w, i), abajo, t, i, oscila);
      g.restore();
    }
    const puntas = (w, abajo, t, oscila) => PUAS.map((Pp, i) => curvaPua(Pp, wDe(w, i), abajo, t, i, oscila)[3]);
    return { borra, puas, puntas };
  })();
  function capaG(g, t, est) {
    PELO.borra(g);
    PELO.puas(g, est.w, est.abajo, t, est.oscila);
    g.save(); g.lineCap = "round";
    g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 5;
    for (const [x0, y0, x1, y1] of [[650, 560, 662, 640], [930, 600, 936, 660], [700, 720, 712, 770]]) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
    for (const [x, y, s] of [[620, 640, 8], [960, 560, 7], [840, 800, 7], [700, 610, 6]]) gotaDib(g, x, y + 4 * Math.sin(t * 3 + x), s, 0.95);
    g.restore();
  }
  function troncoG(g, est) {
    g.save(); g.lineCap = "round";
    g.strokeStyle = "rgba(160,200,235,0.45)"; g.lineWidth = 9;
    for (const [x0, y0, x1, y1] of [[150, 360, 170, 520], [250, 330, 262, 560], [330, 380, 318, 600], [190, 610, 230, 700]]) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + 12, (y0 + y1) / 2, x1, y1); g.stroke(); }
    g.strokeStyle = "rgba(255,255,255,0.55)"; g.lineWidth = 3.5;
    for (const [x0, y0, x1, y1] of [[158, 380, 172, 470], [256, 360, 262, 470], [326, 420, 318, 520]]) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
    g.restore();
  }
  /* ---------- Marta: hombro de fuera mojado (y luego entera) ---------- */
  function troncoM(g, p, t) {
    const k = p.hombroMojado, m = p.moja;
    if (k < 0.01 && m < 0.01) return;
    g.save(); g.lineCap = "round";
    // mancha oscura en el hombro de fuera (el de la hoja a la izquierda = a la derecha en pantalla)
    if (k > 0.01) {
      g.globalAlpha = 0.5 * k * (1 - 0.5 * m);
      const gr = g.createRadialGradient(118, 330, 6, 118, 340, 90);
      gr.addColorStop(0, "rgba(40,44,60,0.85)"); gr.addColorStop(0.7, "rgba(40,44,60,0.45)"); gr.addColorStop(1, "rgba(40,44,60,0)");
      g.fillStyle = gr; g.beginPath(); g.ellipse(124, 350, 70, 92, 0.2, 0, TAU); g.fill();
      g.globalAlpha = 0.55 * k;
      g.strokeStyle = "rgba(220,235,255,0.8)"; g.lineWidth = 4;
      for (const [x0, y0, l] of [[96, 300, 70], [130, 318, 54], [112, 360, 60]]) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + 4, y0 + l); g.stroke(); }
    }
    // empapada: regueros por la chaqueta
    if (m > 0.01) {
      g.globalAlpha = 0.6 * m; g.strokeStyle = "rgba(210,230,250,0.75)"; g.lineWidth = 4;
      for (const [x0, y0, l] of [[150, 300, 160], [220, 280, 200], [290, 310, 150], [330, 360, 120], [190, 440, 140]]) {
        g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + 8, y0 + l / 2, x0 + 2, y0 + l); g.stroke();
      }
    }
    g.restore();
  }

  /* ---------- lienzos aparte: Guillermo (y Marta) con la ropa empapada ---------- */
  const CAPAS = new Map();
  function dibujaEnCapa(g, Pj, p, t, tinte) {
    const c = g.canvas;
    let C = CAPAS.get(Pj);
    if (!C || C.width !== c.width || C.height !== c.height) { C = lienzo(c.width, c.height); CAPAS.set(Pj, C); }
    const o = C.getContext("2d"), Mt = g.getTransform();
    const alto = 380 * p.s / S0, caja = [P(p.x - 160, p.suelo - alto - 40), P(p.x + 160, p.suelo - alto - 40), P(p.x + 160, p.suelo + 30), P(p.x - 160, p.suelo + 30)]
      .map(q => Mt.transformPoint(new DOMPoint(q.x, q.y)));
    const x0 = Math.max(0, Math.floor(Math.min(...caja.map(q => q.x))) - 2), y0 = Math.max(0, Math.floor(Math.min(...caja.map(q => q.y))) - 2);
    const x1 = Math.min(c.width, Math.ceil(Math.max(...caja.map(q => q.x))) + 2), y1 = Math.min(c.height, Math.ceil(Math.max(...caja.map(q => q.y))) + 2);
    if (x1 <= x0 || y1 <= y0) return;
    o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1; o.globalCompositeOperation = "source-over";
    o.clearRect(x0, y0, x1 - x0, y1 - y0);
    o.setTransform(Mt);
    Pj.dibujar(o, p, t);
    if (tinte > 0.004) {
      o.save(); o.globalCompositeOperation = "source-atop";
      o.fillStyle = `rgba(18,52,96,${0.16 * tinte})`; o.fillRect(p.x - 200, 0, 400, 700);
      const yc = Pj.aPantalla(p, Pj.PELVIS).y - 18;
      const vq = o.createLinearGradient(0, yc, 0, yc + 30); vq.addColorStop(0, "rgba(10,30,80,0)"); vq.addColorStop(1, `rgba(10,30,80,${0.3 * tinte})`);
      o.fillStyle = vq; o.fillRect(p.x - 200, yc, 400, 700 - yc);
      o.restore();
    }
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(C, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0); g.restore();
  }

  /* =====================================================================================
   * DIBUJO DEL PARAGUAS
   * ===================================================================================== */
  function dibParaguas(g, t, U) {
    const { aP, o, f, L } = U;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const base = U.base;
    // puño de madera en J (por debajo de la mano)
    const h0 = aP(P(0, 6)), h1 = aP(P(0, 24)), h2 = aP(P(-13, 30)), h3 = aP(P(-15, 20));
    g.beginPath(); g.moveTo(h0.x, h0.y); g.lineTo(h1.x, h1.y); g.bezierCurveTo(aP(P(0, 34)).x, aP(P(0, 34)).y, h2.x, h2.y, h3.x, h3.y);
    g.lineWidth = 7.5; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 4.5; g.strokeStyle = PAR.puno; g.stroke();
    // palo
    const p0 = aP(P(0, 4)), p1 = aP(P(0, -L - 14));
    g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.lineWidth = 4; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = 2; g.strokeStyle = "#9a8f88"; g.stroke();
    if (o < 0.02) {
      // cerrado: la tela enrollada a lo largo del palo, con su cinta
      const pts = [P(0, -L - 4), P(7, -L + 24), P(9, -L + 70), P(4, -L + 104), P(0, -L + 112), P(-4, -L + 104), P(-9, -L + 70), P(-7, -L + 24)].map(aP);
      g.beginPath(); g.moveTo(pts[0].x, pts[0].y); for (const q of pts) g.lineTo(q.x, q.y); g.closePath();
      g.fillStyle = PAR.gajos[0]; g.fill(); g.lineWidth = 2.2; g.strokeStyle = TINTA; g.stroke();
      const c1 = aP(P(-9, -L + 58)), c2 = aP(P(9, -L + 50));
      g.beginPath(); g.moveTo(c1.x, c1.y); g.lineTo(c2.x, c2.y); g.lineWidth = 3.5; g.strokeStyle = PAR.gajos[1]; g.stroke();
      const q = aP(P(0, -L - 14)); g.beginPath(); g.arc(q.x, q.y, 2.6, 0, TAU); g.fillStyle = "#ccc"; g.fill(); g.lineWidth = 1.2; g.strokeStyle = TINTA; g.stroke();
      g.restore();
      return;
    }
    // copa: gajos entre varillas, primero los de atrás (más oscuros) y luego los de delante
    const N = RIBS.length;
    const curvaVarilla = (phi, n = 8) => { const pts = []; for (let i = 0; i <= n; i++) pts.push(aP(U.punta(phi, i / n))); return pts; };
    const borde = (a, b) => {           // festón entre las puntas de dos varillas (curva hacia dentro)
      const pa = U.punta(a), pb = U.punta(b), m = U.punta((a + b) / 2, 0.88);
      return [aP(pa), aP(m), aP(pb)];
    };
    const gajo = (a, b, col) => {
      const ra = curvaVarilla(a), rb = curvaVarilla(b), [ea, em, eb] = borde(a, b);
      g.beginPath(); g.moveTo(ra[0].x, ra[0].y);
      for (const q of ra) g.lineTo(q.x, q.y);
      g.quadraticCurveTo(em.x, em.y, eb.x, eb.y);
      for (let i = rb.length - 1; i >= 0; i--) g.lineTo(rb[i].x, rb[i].y);
      g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = 1.6; g.strokeStyle = TINTA; g.stroke();
    };
    const ATRAS = [126, 162, 198, 234].map(a => a * Math.PI / 180);
    const dado = f < 0;
    // gajos de atrás (por dentro si está del revés)
    for (let i = 0; i < ATRAS.length - 1; i++) gajo(ATRAS[i], ATRAS[i + 1], dado ? PAR.dentro[i % 2] : PAR.gajosOsc[i % 2]);
    gajo(RIBS[N - 1], ATRAS[0], dado ? PAR.dentro[1] : PAR.gajosOsc[1]); gajo(ATRAS[ATRAS.length - 1], RIBS[0] + TAU, dado ? PAR.dentro[0] : PAR.gajosOsc[0]);
    // gajos de delante
    for (let i = 0; i < N - 1; i++) gajo(RIBS[i], RIBS[i + 1], PAR.gajos[i % 2]);
    // varillas: puntitas que sobresalen (dobladas si se ha dado la vuelta)
    g.lineWidth = 1.8; g.strokeStyle = TINTA; g.fillStyle = "#e8e2da";
    for (let i = 0; i < N; i++) {
      const phi = RIBS[i], q = U.punta(phi), q2 = U.punta(phi, 1.08);
      const a = aP(q), b = aP(q2);
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
      g.beginPath(); g.arc(b.x, b.y, 1.8, 0, TAU); g.fill(); g.stroke();
    }
    // brillo y gotas en la tela
    if (!dado) {
      const top = aP(P(0, -L)), l1 = aP(P(-U.R * 0.55 * o, -L + 0.2 * U.R * f)), l2 = aP(P(-U.R * 0.15 * o, -L + 0.02 * U.R));
      g.beginPath(); g.moveTo(l1.x, l1.y); g.quadraticCurveTo(lerp(l1.x, l2.x, 0.5), lerp(l1.y, l2.y, 0.5) - 6, l2.x, l2.y);
      g.lineWidth = 3; g.strokeStyle = "rgba(255,255,255,0.55)"; g.stroke();
    }
    // contera
    const q = aP(P(0, -L - 14)); g.beginPath(); g.arc(q.x, q.y, 2.8, 0, TAU); g.fillStyle = "#d8d0c8"; g.fill(); g.lineWidth = 1.4; g.strokeStyle = TINTA; g.stroke();
    g.restore();
  }
  // contorno del paraguas abierto (pantalla): para la sombra de lluvia
  function siluetaCopa(U) {
    const pts = [];
    for (let i = 0; i <= 12; i++) { const k = lerp(-1, 1, i / 12); pts.push(U.aP(U.punta(k < 0 ? -Math.PI / 2 : Math.PI / 2, Math.abs(k)))); }
    return pts;
  }
  // puños de Marta otra vez, por encima del puño del paraguas
  function punosEncima(g, Pj, p, lados) {
    const k = p.s * Pj.K, col = { piel: Pj.C.piel, sombra: Pj.C.pielSombra, tinta: Pj.C.tinta };
    g.save(); g.translate(p.x, p.suelo); g.scale(p.espejo ? -k : k, k); g.translate(-Pj.PELVIS.x, -Pj.SUELO);
    for (const lado of lados) {
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m || (m.puno ?? 1) < 0.5) continue;
      g.save(); g.translate(m.x, m.y); g.rotate(m.ang || 0); g.scale(Pj.JK, Pj.JK); g.scale(0.88 * m.puno, 0.88 * m.puno);
      if (m.dedos) Personaje2D.mano(g, m, col); else Personaje2D.puno(g, m.pulgar, col);
      g.restore();
    }
    g.restore();
  }

  /* =====================================================================================
   * DECORADO: calle de la ciudad al anochecer, lloviendo
   * ===================================================================================== */
  let fondo = null;
  const FX = -80, FY = -60;
  const LUCES = [];          // focos de luz para los reflejos
  function creaFondo() {
    const c = lienzo(W + 160, H + 120);
    const g = c.getContext("2d"); g.translate(-FX, -FY); g.lineJoin = "round"; g.lineCap = "round";
    // cielo del anochecer (azul que se apaga hacia un resplandor naranja entre los edificios)
    let gr = g.createLinearGradient(0, -60, 0, 300);
    gr.addColorStop(0, "#1b2346"); gr.addColorStop(0.45, "#3a3f72"); gr.addColorStop(0.8, "#7c5f86"); gr.addColorStop(1, "#c98a6e");
    g.fillStyle = gr; g.fillRect(-80, -60, W + 160, 380);
    // nubes de lluvia
    for (let i = 0; i < 12; i++) {
      g.fillStyle = `rgba(${40 + 20 * hash(i)},${44 + 18 * hash(i + 2)},${80 + 20 * hash(i + 4)},0.55)`;
      g.beginPath(); g.ellipse(-60 + i * 100 + 30 * hash(i + 1), 10 + 50 * hash(i + 5), 120 + 50 * hash(i + 3), 26 + 10 * hash(i + 6), 0, 0, TAU); g.fill();
    }
    // edificios del fondo (siluetas lejanas)
    g.fillStyle = "#2a2d52";
    for (const [x, w, h] of [[-80, 140, 210], [60, 90, 250], [150, 130, 190], [520, 110, 230], [880, 120, 210], [990, 120, 260]]) g.fillRect(x, 300 - h + 120, w, h);
    g.fillStyle = "rgba(255,200,120,0.55)";
    for (let i = 0; i < 40; i++) { const x = -60 + hash(i + 11) * (W + 100), y = 200 + hash(i + 19) * 90; if ((x > 300 && x < 520) || (x > 640 && x < 880)) continue; g.fillRect(x, y, 6, 8); }
    // ---- fachada izquierda: floristería ----
    const yb = 470;           // pie de las fachadas
    g.fillStyle = "#30524a"; g.fillRect(-80, 120, 420, yb - 120);
    g.fillStyle = "rgba(0,0,0,0.12)"; for (let y = 130; y < 300; y += 22) g.fillRect(-80, y, 420, 2);
    // ventanas del primer piso
    for (const [x, on] of [[-30, 1], [80, 0], [190, 1], [280, 0]]) ventana(g, x, 150, 52, 74, on);
    // cornisa
    g.fillStyle = "#e7dcc6"; g.fillRect(-80, 250, 420, 10);
    // escaparate de la floristería
    escaparate(g, -40, 300, 220, 150, ["#ffd890", "#f3b864", "#d4884a"]);
    // plantas dentro (siluetas)
    g.fillStyle = "rgba(60,90,50,0.6)";
    for (let i = 0; i < 6; i++) { const x = -20 + i * 36; g.beginPath(); g.ellipse(x + 10, 420, 16, 26, 0, 0, TAU); g.fill(); }
    // puerta
    g.fillStyle = "#e7dcc6"; g.fillRect(208, 296, 96, yb - 296);
    g.fillStyle = "#3d2a22"; g.fillRect(216, 304, 80, yb - 304);
    gr = g.createLinearGradient(0, 312, 0, 400); gr.addColorStop(0, "#ffe0a0"); gr.addColorStop(1, "#e8a454");
    g.fillStyle = gr; g.fillRect(226, 314, 60, 80);
    g.fillStyle = "#c9a34a"; g.beginPath(); g.arc(288, 420, 3.5, 0, TAU); g.fill();
    // toldo a rayas verde y crema
    toldo(g, -60, 330, 268, 300, ["#2f6b54", "#efe4cc"]);
    // cubos de flores en la acera
    for (const [x, cols] of [[-10, ["#e8424e", "#ff8a6c"]], [40, ["#ffd34a", "#ffb02e"]], [92, ["#b06ad8", "#e9a4ff"]], [144, ["#ff6f91", "#ffffff"]]]) cubo(g, x, yb + 2, cols);
    // ---- fachada central: librería ----
    g.fillStyle = "#6b3a34"; g.fillRect(340, 90, 330, yb - 90);
    // ladrillos
    g.fillStyle = "rgba(0,0,0,0.13)";
    for (let y = 96, f = 0; y < yb; y += 14, f++) { g.fillRect(340, y, 330, 2); for (let x = 340 + (f % 2) * 16; x < 670; x += 32) g.fillRect(x, y, 2, 14); }
    for (const [x, on] of [[372, 1], [470, 1], [570, 0]]) ventana(g, x, 118, 56, 82, on);
    g.fillStyle = "#e7dcc6"; g.fillRect(340, 226, 330, 10);
    // escaparate de la librería con libros
    escaparate(g, 360, 262, 290, 168, ["#ffe7a8", "#f7c06a", "#de9150"]);
    const libros = ["#c0392b", "#2c5d8a", "#e0a43a", "#4f7a3a", "#7d3c98", "#d35400", "#1f6f6f", "#a5683e"];
    for (let r = 0; r < 2; r++) for (let i = 0; i < 15; i++) {
      const x = 370 + i * 18 + 3 * hash(i + r * 9), h = 30 + 12 * hash(i + 3 + r), w = 12 + 4 * hash(i + 7);
      g.fillStyle = libros[(i + r * 3) % libros.length]; g.globalAlpha = 0.75; g.fillRect(x, 330 + r * 54 - h, w, h);
      g.fillStyle = "rgba(255,240,200,0.5)"; g.fillRect(x + 2, 330 + r * 54 - h + 4, w - 4, 2); g.globalAlpha = 1;
    }
    g.fillStyle = "rgba(120,60,30,0.6)"; g.fillRect(360, 330, 290, 4); g.fillRect(360, 384, 290, 4);
    // lámpara redonda colgando dentro
    g.strokeStyle = "rgba(80,40,20,0.6)"; g.lineWidth = 2; g.beginPath(); g.moveTo(505, 262); g.lineTo(505, 282); g.stroke();
    g.fillStyle = "rgba(255,250,220,0.95)"; g.beginPath(); g.arc(505, 290, 10, 0, TAU); g.fill();
    // marquesina lisa (sin letras) con dos apliques
    g.fillStyle = "#2b2230"; g.fillRect(352, 236, 306, 20);
    g.fillStyle = "#c9a34a"; g.fillRect(352, 236, 306, 3); g.fillRect(352, 253, 306, 3);
    // ---- fachada derecha: portal y esquina ----
    g.fillStyle = "#7b6f8e"; g.fillRect(670, 70, 414, yb - 70);
    g.fillStyle = "rgba(255,255,255,0.06)"; for (let x = 690; x < 1084; x += 46) g.fillRect(x, 70, 3, yb - 70);
    for (const [x, on] of [[700, 0], [800, 1], [930, 1], [1030, 0]]) ventana(g, x, 110, 54, 80, on);
    for (const [x, on] of [[700, 1], [930, 0], [1030, 1]]) ventana(g, x, 250, 54, 80, on);
    g.fillStyle = "#e7dcc6"; g.fillRect(670, 214, 414, 8);
    // portal con arco y luz dentro
    g.fillStyle = "#e7dcc6"; g.beginPath(); g.moveTo(784, yb); g.lineTo(784, 300); g.arc(840, 300, 56, Math.PI, 0); g.lineTo(896, yb); g.closePath(); g.fill();
    gr = g.createLinearGradient(0, 260, 0, yb); gr.addColorStop(0, "#ffd890"); gr.addColorStop(1, "#c77a3a");
    g.fillStyle = gr; g.beginPath(); g.moveTo(796, yb); g.lineTo(796, 302); g.arc(840, 302, 44, Math.PI, 0); g.lineTo(884, yb); g.closePath(); g.fill();
    g.fillStyle = "#3a2a2a"; g.fillRect(800, 340, 34, yb - 340); g.fillRect(846, 340, 34, yb - 340);
    g.fillStyle = "rgba(255,226,160,0.8)"; g.fillRect(806, 350, 22, 50); g.fillRect(852, 350, 22, 50);
    // canalón que baja por la esquina (el chorro se pinta cada fotograma)
    g.fillStyle = "#4a4a5a"; g.fillRect(1004, 60, 10, yb - 50); g.fillRect(996, yb - 6, 30, 10);
    // ---- la acera mojada ----
    gr = g.createLinearGradient(0, yb, 0, 600);
    gr.addColorStop(0, "#3a3b5e"); gr.addColorStop(0.5, "#4a4a70"); gr.addColorStop(1, "#5a5880");
    g.fillStyle = gr; g.fillRect(-80, yb, W + 160, 600 - yb + 60);
    // baldosas
    g.strokeStyle = "rgba(20,20,40,0.35)"; g.lineWidth = 1.5;
    for (let y = yb + 14, f = 0; y < 640; y += 18 + f * 4, f++) { g.beginPath(); g.moveTo(-80, y); g.lineTo(W + 80, y); g.stroke(); }
    for (let i = -10; i < 24; i++) { g.beginPath(); g.moveTo(XF + i * 60, yb); g.lineTo(XF + i * 60 * 2.2, 660); g.stroke(); }
    // bordillo y calzada abajo del todo
    g.fillStyle = "#6e6c8c"; g.fillRect(-80, 592, W + 160, 8);
    g.fillStyle = "#24243c"; g.fillRect(-80, 600, W + 160, 80);
    // reflejos de las luces en el suelo mojado
    for (const L of LUCES) {
      const rg = g.createLinearGradient(0, yb, 0, yb + L.l);
      rg.addColorStop(0, L.c.replace("A", String(0.45 * L.a))); rg.addColorStop(1, L.c.replace("A", "0"));
      g.fillStyle = rg;
      for (let k = 0; k < 5; k++) { const w = L.w * (1 - k * 0.15), y = yb + 4 + k * L.l / 5; g.fillRect(L.x - w / 2 + 3 * Math.sin(k * 2.1), y, w, L.l / 6); }
    }
    // farola (el halo se pinta cada fotograma)
    g.fillStyle = "#1c1e2c"; g.fillRect(304, 150, 8, 400); g.fillRect(296, 540, 24, 12);
    g.beginPath(); g.moveTo(290, 118); g.lineTo(326, 118); g.lineTo(320, 150); g.lineTo(296, 150); g.closePath(); g.fill();
    g.fillStyle = "#ffe6aa"; g.beginPath(); g.moveTo(294, 122); g.lineTo(322, 122); g.lineTo(317, 146); g.lineTo(299, 146); g.closePath(); g.fill();
    g.fillStyle = "#1c1e2c"; g.beginPath(); g.moveTo(286, 118); g.lineTo(308, 102); g.lineTo(330, 118); g.closePath(); g.fill();
    // charcos (con el cielo reflejado)
    for (const C of CHARCOS) charcoFijo(g, C);
    return c;
  }
  function ventana(g, x, y, w, h, on) {
    g.fillStyle = "#e7dcc6"; g.fillRect(x - 5, y - 5, w + 10, h + 10);
    if (on) { const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, "#ffe2a0"); gr.addColorStop(1, "#e7a058"); g.fillStyle = gr; LUCES.push({ x: x + w / 2, w: w * 0.8, l: 60, a: 0.5, c: "rgba(255,200,120,A)" }); }
    else g.fillStyle = "#33355a";
    g.fillRect(x, y, w, h);
    g.fillStyle = "#e7dcc6"; g.fillRect(x + w / 2 - 2, y, 4, h); g.fillRect(x, y + h * 0.42, w, 4);
    g.fillStyle = "#cfc3a8"; g.fillRect(x - 8, y + h + 4, w + 16, 6);
  }
  function escaparate(g, x, y, w, h, cols) {
    g.fillStyle = "#e7dcc6"; g.fillRect(x - 8, y - 8, w + 16, h + 16);
    const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, cols[0]); gr.addColorStop(0.6, cols[1]); gr.addColorStop(1, cols[2]);
    g.fillStyle = gr; g.fillRect(x, y, w, h);
    g.fillStyle = "rgba(255,255,255,0.18)"; g.beginPath(); g.moveTo(x + 20, y); g.lineTo(x + 60, y); g.lineTo(x + 20, y + h); g.lineTo(x - 20 < x ? x : x - 20, y + h); g.closePath(); g.fill();
    LUCES.push({ x: x + w / 2, w: w * 0.9, l: 110, a: 0.85, c: "rgba(255,190,110,A)" });
  }
  function toldo(g, x0, x1, y0, y1, cols) {
    const n = 10;
    for (let i = 0; i < n; i++) {
      const xa = lerp(x0, x1, i / n), xb = lerp(x0, x1, (i + 1) / n);
      g.fillStyle = cols[i % 2]; g.beginPath(); g.moveTo(xa + 8, y0); g.lineTo(xb + 8, y0); g.lineTo(xb, y1); g.lineTo(xa, y1); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(xa, y1); g.quadraticCurveTo((xa + xb) / 2, y1 + 14, xb, y1); g.closePath(); g.fill();
    }
    g.strokeStyle = "#16241f"; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x0 + 8, y0); g.lineTo(x1 + 8, y0); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.15)"; g.fillRect(x0 + 8, y0 + 2, x1 - x0, 6);
  }
  function cubo(g, x, y, cols) {
    g.fillStyle = "#8c93a8"; g.beginPath(); g.moveTo(x - 18, y - 34); g.lineTo(x + 18, y - 34); g.lineTo(x + 14, y); g.lineTo(x - 14, y); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(x - 12, y - 30, 4, 26);
    g.strokeStyle = "#2e5a2e"; g.lineWidth = 2;
    for (let i = 0; i < 6; i++) { const a = -1.9 + i * 0.16; g.beginPath(); g.moveTo(x - 6 + i * 2.4, y - 32); g.lineTo(x - 6 + i * 2.4 + Math.cos(a) * 34, y - 32 + Math.sin(a) * 34); g.stroke(); }
    for (let i = 0; i < 6; i++) { const a = -1.9 + i * 0.16, fx = x - 6 + i * 2.4 + Math.cos(a) * 36, fy = y - 32 + Math.sin(a) * 36; g.fillStyle = cols[i % 2]; g.beginPath(); g.arc(fx, fy, 6.5, 0, TAU); g.fill(); g.fillStyle = "rgba(0,0,0,0.15)"; g.beginPath(); g.arc(fx + 1.5, fy + 1.5, 3, 0, TAU); g.fill(); }
  }
  // charcos: [x, y, rx, ry]
  const CHARCOS = [{ x: 120, y: 520, rx: 70, ry: 9 }, { x: 860, y: 512, rx: 60, ry: 7 }, { x: 560, y: 573, rx: 205, ry: 21 }, { x: 960, y: 560, rx: 50, ry: 8 }];
  function charcoFijo(g, C) {
    g.save();
    g.beginPath(); g.ellipse(C.x, C.y, C.rx, C.ry, 0, 0, TAU); g.clip();
    const gr = g.createLinearGradient(0, C.y - C.ry, 0, C.y + C.ry);
    gr.addColorStop(0, "#5a5c8c"); gr.addColorStop(0.5, "#7a6a96"); gr.addColorStop(1, "#4a4c78");
    g.fillStyle = gr; g.fillRect(C.x - C.rx, C.y - C.ry, 2 * C.rx, 2 * C.ry);
    g.fillStyle = "rgba(255,220,160,0.35)"; g.fillRect(C.x - C.rx * 0.3, C.y - C.ry, C.rx * 0.18, 2 * C.ry);
    g.restore();
    g.strokeStyle = "rgba(200,210,255,0.5)"; g.lineWidth = 1.5; g.beginPath(); g.ellipse(C.x, C.y, C.rx, C.ry, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  }

  /* =====================================================================================
   * LLUVIA Y AGUA (cada fotograma)
   * ===================================================================================== */
  // fuerza del viento (inclinación de la lluvia: dx por dy)
  const viento = t => 0.12 + 0.55 * campana(t, T.viento0 - 0.1, T.voltea + 0.6);
  // lluvia: gotas largas que caen en diagonal; `mascara` = zona seca bajo el paraguas
  function lluvia(g, t, capa, mascara) {
    const n = capa === "lejos" ? 150 : 90, v0 = capa === "lejos" ? 760 : 1050, l0 = capa === "lejos" ? 12 : 20;
    const sl = viento(t);
    g.save();
    if (mascara) { g.beginPath(); g.rect(-200, -200, W + 400, H + 400); g.moveTo(mascara[0].x, mascara[0].y); for (const q of mascara) g.lineTo(q.x, q.y); g.closePath(); g.clip("evenodd"); }
    g.strokeStyle = capa === "lejos" ? "rgba(190,205,240,0.32)" : "rgba(215,228,255,0.5)";
    g.lineWidth = capa === "lejos" ? 1.1 : 1.6;
    g.beginPath();
    const Hc = H + 160;
    for (let i = 0; i < n; i++) {
      const sem = i * 7.13 + (capa === "lejos" ? 0 : 500);
      const v = v0 * (0.85 + 0.3 * hash(sem + 1)), y = ((hash(sem + 2) * Hc + v * t) % Hc) - 100;
      const x = -120 + hash(sem + 3) * (W + 260) - sl * (y + 100), l = l0 * (0.8 + 0.5 * hash(sem + 4));
      g.moveTo(x, y); g.lineTo(x - sl * l, y + l);
    }
    g.stroke();
    g.restore();
  }
  // salpicaduras en la acera y anillos en los charcos
  function salpicaduras(g, t) {
    g.save(); g.strokeStyle = "rgba(220,230,255,0.55)"; g.lineWidth = 1.2;
    for (let i = 0; i < 26; i++) {
      const per = 0.5 + 0.4 * hash(i + 40), k = ((t + hash(i + 41) * per) % per) / per;
      const ciclo = Math.floor((t + hash(i + 41) * per) / per);
      const x = -40 + hash(i * 3.1 + ciclo * 0.71) * (W + 80), y = 486 + hash(i * 1.7 + ciclo * 0.37) * 108;
      if (k > 0.35) continue;
      const u = k / 0.35;
      g.globalAlpha = 1 - u;
      g.beginPath(); g.moveTo(x - 4 - 3 * u, y - 2 - 5 * u); g.lineTo(x - 2, y); g.moveTo(x + 4 + 3 * u, y - 2 - 5 * u); g.lineTo(x + 2, y); g.moveTo(x, y - 4 - 7 * u); g.lineTo(x, y - 1); g.stroke();
    }
    g.restore();
    // anillos en los charcos
    g.save(); g.strokeStyle = "rgba(220,230,255,0.5)"; g.lineWidth = 1.1;
    CHARCOS.forEach((C, j) => {
      const n = Math.round(C.rx / 18);
      for (let i = 0; i < n; i++) {
        const per = 0.7 + 0.5 * hash(i + j * 13), sem = (t + hash(i * 2 + j) * per) / per, k = sem % 1, ciclo = Math.floor(sem);
        const x = C.x + (hash(i + ciclo * 0.31 + j) - 0.5) * 1.6 * C.rx * 0.85, y = C.y + (hash(i * 3 + ciclo * 0.17 + j) - 0.5) * 1.6 * C.ry * 0.7;
        g.globalAlpha = 0.9 * (1 - k);
        g.beginPath(); g.ellipse(x, y, 2 + 12 * k, (2 + 12 * k) * C.ry / C.rx * 1.6, 0, 0, TAU); g.stroke();
      }
    });
    g.restore();
  }
  // halo de la farola y de los apliques
  function halos(g, t) {
    const parp = 0.92 + 0.08 * Math.sin(t * 7.1) * Math.sin(t * 3.3);
    const gr = g.createRadialGradient(308, 136, 4, 308, 136, 90);
    gr.addColorStop(0, `rgba(255,226,160,${0.55 * parp})`); gr.addColorStop(1, "rgba(255,226,160,0)");
    g.fillStyle = gr; g.fillRect(208, 36, 200, 200);
  }
  // goteo del toldo y chorro del canalón
  function goteo(g, t) {
    g.save();
    for (let i = 0; i < 12; i++) {
      const per = 0.55 + 0.3 * hash(i + 70), k = ((t + per * hash(i + 71)) % per) / per;
      const x = -50 + i * 32 + 6 * hash(i), y0 = 314, y = y0 + 190 * k * k;
      if (y > 470) continue;
      g.fillStyle = "rgba(220,235,255,0.75)"; g.beginPath(); g.ellipse(x, y, 1.6, 3.4, 0, 0, TAU); g.fill();
    }
    // canalón
    const yb = 470;
    g.strokeStyle = "rgba(210,225,255,0.7)"; g.lineWidth = 6; g.beginPath(); g.moveTo(1018, yb - 4); g.quadraticCurveTo(1034, yb + 2, 1040, yb + 18); g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.6)"; g.lineWidth = 2;
    for (let i = 0; i < 4; i++) { const k = ((t * 3 + i * 0.25) % 1); g.beginPath(); g.moveTo(1020 + 10 * k, yb - 2 + 8 * k * k); g.lineTo(1024 + 12 * k, yb + 2 + 12 * k * k); g.stroke(); }
    g.restore();
  }
  // gotas que caen de las puntas del paraguas (las de los extremos dan en los hombros de fuera)
  function goteoParaguas(g, t, U, pg, pm) {
    if (U.o < 0.5 || U.f < 0.3) return;
    const hG = G.aPantalla(pg, G.tronco(pg)(G.HOMBRO_C)), hM = M.aPantalla(pm, M.tronco(pm)(M.HOMBRO_C));
    g.save();
    RIBS.forEach((phi, i) => {
      const tip = U.aP(U.punta(phi, 1.06));
      for (let j = 0; j < 2; j++) {
        const per = 0.42 + 0.12 * hash(i + j * 5), sem = (t + per * hash(i * 3 + j)) / per, k = sem % 1;
        const vy = 380 * k * per + 0.5 * 1400 * (k * per) ** 2, y = tip.y + vy, x = tip.x - viento(t) * vy * 0.6;
        // ¿da en un hombro?
        let lim = SUELO0 + 6;
        for (const h of [hG, hM]) if (Math.abs(x - h.x) < 30) lim = Math.min(lim, h.y - 6);
        if (y > lim) {
          const u = (y - lim) / 60; if (u > 1) continue;
          g.strokeStyle = `rgba(230,240,255,${0.8 * (1 - u)})`; g.lineWidth = 1.4;
          g.beginPath(); g.moveTo(x - 3 - 6 * u, lim - 2 - 6 * u); g.lineTo(x - 1, lim); g.moveTo(x + 3 + 6 * u, lim - 2 - 6 * u); g.lineTo(x + 1, lim); g.stroke();
          continue;
        }
        g.fillStyle = "rgba(225,238,255,0.85)"; g.beginPath(); g.ellipse(x, y, 1.6, 3.2, 0, 0, TAU); g.fill();
      }
    });
    g.restore();
  }
  // lluvia que rebota en los hombros de fuera (y luego en las cabezas)
  function rebotes(g, t, pg, pm, U) {
    const q = [];
    const dentroT = tramo(t, T.entraG1 - 0.05, T.entraG1 + 0.1) * (1 - tramo(t, T.voltea - 0.05, T.voltea + 0.05));
    if (dentroT > 0.01) {
      q.push([G.aPantalla(pg, G.tronco(pg)(P(G.HOMBRO_C.x + 10, G.HOMBRO_C.y - 26))), dentroT, 0]);
      q.push([M.aPantalla(pm, M.tronco(pm)(P(M.HOMBRO_C.x + 10, M.HOMBRO_C.y - 26))), dentroT, 1]);
    }
    const todo = t < T.entraG0 ? 1 : tramo(t, T.voltea, T.voltea + 0.15);
    if (todo > 0.01) {
      q.push([G.aPantalla(pg, G.cabeza(pg).a(P(800, 300))), todo, 2]);
      q.push([G.aPantalla(pg, G.tronco(pg)(P(G.HOMBRO.x, G.HOMBRO.y - 26))), todo * (t < T.entraG0 ? 1 : 1), 3]);
      if (t > T.voltea) { q.push([M.aPantalla(pm, M.cabeza(pm).a(P(820, 280))), todo, 4]); q.push([M.aPantalla(pm, M.tronco(pm)(P(M.HOMBRO.x, M.HOMBRO.y - 26))), todo, 5]); }
    }
    if (t < T.pop) q.push([M.aPantalla(pm, M.cabeza(pm).a(P(820, 280))), 1, 6]);
    const kpal = campana(t, T.palma0 + 0.15, T.palma1 + 0.1);
    if (kpal > 0.01) { const c = centroMano(M, pm, pm.manoLejos); q.push([P(c.x, c.y - 6), kpal, 7]); }
    g.save(); g.strokeStyle = "rgba(235,242,255,0.85)"; g.lineWidth = 1.3; g.lineCap = "round";
    for (const [c, a, sem] of q) {
      const hom = sem < 2, n = hom ? 7 : 4, f = hom ? 1.45 : 1;
      g.lineWidth = hom ? 1.7 : 1.3;
      for (let i = 0; i < n; i++) {
        const per = 0.16 + 0.08 * hash(i + sem * 7), s2 = (t + per * hash(i * 5 + sem)) / per, k = s2 % 1, cic = Math.floor(s2);
        const x = c.x + (hash(i + cic * 0.37 + sem) - 0.5) * 30, y = c.y + (hash(i * 2 + cic * 0.11 + sem) - 0.5) * 8;
        g.globalAlpha = a * (1 - k);
        g.beginPath(); g.moveTo(x - (2 + 7 * k) * f, y - (3 + 6 * k) * f); g.lineTo(x - 1, y); g.moveTo(x + (2 + 7 * k) * f, y - (3 + 6 * k) * f); g.lineTo(x + 1, y);
        g.moveTo(x, y - (4 + 9 * k) * f); g.lineTo(x, y - 2); g.stroke();
      }
      if (hom) {        // brillo de agua en el hombro
        g.globalAlpha = 0.7 * a; g.lineWidth = 2.2;
        g.beginPath(); g.arc(c.x, c.y + 14, 16, -2.6, -0.5); g.stroke();
      }
    }
    g.restore();
  }
  // chorreo: gotas que caen del pelo y de las manos
  function chorreo(g, t, pg, pm) {
    const fuentes = [];
    const pts = PELO.puntas(pg.est.w, pg.est.abajo, t, pg.est.oscila);
    const kG = pg.est.chorrea;
    for (const i of [0, 2, 4, 7, 10, 12]) fuentes.push([G.aPantalla(pg, G.cabeza(pg).a(pts[i])), kG, i]);
    fuentes.push([G.aPantalla(pg, G.cabeza(pg).a(P(800, 860))), kG, 20]);
    if (pm.moja > 0.05) { for (const [x, y, i] of [[640, 640, 30], [1000, 700, 31], [820, 860, 32]]) fuentes.push([M.aPantalla(pm, M.cabeza(pm).a(P(x, y))), pm.moja, i]); }
    g.save(); g.fillStyle = "rgba(220,236,255,0.85)";
    for (const [c, a, i] of fuentes) {
      const per = 0.5 + 0.3 * hash(i + 90), k = ((t + per * hash(i + 91)) % per) / per;
      if (k < 0.25) { g.globalAlpha = a; g.beginPath(); g.ellipse(c.x, c.y + 3 * k / 0.25, 1.6, 1.6 + 2 * k / 0.25, 0, 0, TAU); g.fill(); continue; }
      const u = (k - 0.25) / 0.75, y = c.y + 3 + 220 * u * u;
      if (y > pg.suelo) continue;
      g.globalAlpha = a * 0.9; g.beginPath(); g.ellipse(c.x, y, 1.5, 3.4, 0, 0, TAU); g.fill();
    }
    g.restore();
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  function estrellaPuntas(g, x, y, r, puntas, rot0, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot0 + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function corazon(g, x, y, r, a) {
    g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(r / 10, r / 10);
    g.beginPath(); g.moveTo(0, 6); g.bezierCurveTo(-12, -2, -8, -12, 0, -6); g.bezierCurveTo(8, -12, 12, -2, 0, 6); g.closePath();
    g.fillStyle = "#ff5a6e"; g.fill(); g.lineWidth = 1.6; g.strokeStyle = TINTA; g.stroke(); g.restore();
  }
  // salpicaduras de los pies al correr y al patinar
  function chapoteo(g, t, pg) {
    const eventos = [];
    for (const lado of ["cerca", "lejos"]) for (const [tc, x] of APOYOS_G[lado]) eventos.push([tc, xProf(x, tc), 0.6]);
    eventos.push([T.llega, xCorre(T.llega) + 4, 1.2]);
    g.save(); g.fillStyle = "rgba(220,235,255,0.8)";
    for (const [t0, x, f] of eventos) {
      const k = fase(t, t0, t0 + 0.4); if (k <= 0 || k >= 1) continue;
      for (let i = 0; i < 6; i++) {
        const a = Math.PI + 0.3 + i / 5 * (Math.PI - 0.6), v = (40 + 30 * hash(i + t0)) * f, d = v * k;
        const xx = x + Math.cos(a) * d * (i < 3 ? 1.3 : 1) - (t0 === T.llega ? 26 * k : 0), yy = SUELO0 + Math.sin(a) * d * 0.9 + 160 * k * k * f * 0.5;
        g.globalAlpha = 1 - k; g.beginPath(); g.arc(xx, yy, 2 * (1 - k) + 1, 0, TAU); g.fill();
      }
    }
    g.restore();
  }
  // el gran ¡chof! del charco: corona de agua alrededor de los pies (la mitad de atrás por detrás de las piernas),
  // gotas que vuelan y anillos que se abren
  function chof(g, t, pg, pm, mitad) {
    const k = fase(t, T.cae - 0.01, T.cae + 1.0); if (k <= 0 || k >= 1) return;
    const y0 = sueloEn(t) + 3;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    for (const [p, sem] of [[pg, 1.3], [pm, 2.7]]) {
      const cx = p.x;
      if (mitad === "atras") {
        g.strokeStyle = "rgba(225,235,255,0.75)"; g.lineWidth = 2;
        for (let r = 0; r < 3; r++) { const kk = clamp(k * 1.25 - r * 0.16); if (kk <= 0 || kk >= 1) continue; g.globalAlpha = 1 - kk;
          g.beginPath(); g.ellipse(cx, y0 + 2, 30 + 110 * kk, 6 + 13 * kk, 0, 0, TAU); g.stroke(); }
        g.globalAlpha = 1;
      }
      // corona
      const kc = fase(t, T.cae - 0.01, T.cae + 0.5);
      if (kc > 0 && kc < 1) {
        const n = 13;
        for (let i = 0; i < n; i++) {
          const a = (i + 0.5) / n * TAU, sa = Math.sin(a);
          if ((mitad === "atras") !== (sa < 0)) continue;
          const rx = 26 + 44 * salida(kc), ry = rx * 0.3;
          const bx = cx + Math.cos(a) * rx, by = y0 + sa * ry;
          const hgt = (40 + 46 * hash(i + sem * 7)) * Math.sin(Math.PI * Math.pow(kc, 0.6));
          if (hgt < 1) continue;
          // columna de agua que se abre hacia fuera y suelta una gota por arriba
          const ox = Math.cos(a) * (10 + 26 * kc), tx = bx + ox, ty = by - hgt;
          const w = 6 * (1 - 0.4 * kc), cx1 = bx + ox * 0.15, cy1 = by - hgt * 0.55;
          g.globalAlpha = 1 - 0.65 * kc;
          g.beginPath(); g.moveTo(bx - w, by); g.quadraticCurveTo(cx1 - w * 0.6, cy1, tx - 1.5, ty + 4); g.lineTo(tx + 1.5, ty + 4); g.quadraticCurveTo(cx1 + w * 0.6, cy1, bx + w, by); g.closePath();
          g.fillStyle = "rgba(196,222,255,0.62)"; g.fill();
          g.lineWidth = 1.4; g.strokeStyle = "rgba(255,255,255,0.85)";
          g.beginPath(); g.moveTo(bx - w * 0.4, by - 2); g.quadraticCurveTo(cx1 - w * 0.3, cy1, tx - 1, ty + 5); g.stroke();
          const gy = ty - 5 - 10 * kc, gr2 = 2.8 * (1 - 0.3 * kc);
          g.beginPath(); g.ellipse(tx + ox * 0.15, gy, gr2, gr2 * 1.25, 0, 0, TAU); g.fillStyle = "rgba(225,240,255,0.95)"; g.fill();
          g.lineWidth = 1; g.strokeStyle = "rgba(40,60,110,0.55)"; g.stroke();
        }
      }
      // gotas que vuelan
      if (mitad === "delante") {
        g.globalAlpha = 1;
        for (let i = 0; i < 30; i++) {
          const a = -Math.PI * (0.1 + 0.8 * hash(i + sem)), v = 240 + 260 * hash(i * 3 + sem), tt = k * 0.9;
          const x = cx + Math.cos(a) * v * tt * 0.8, y = y0 - 8 + Math.sin(a) * v * tt + 0.5 * 980 * tt * tt;
          if (y > y0 + 6) continue;
          g.fillStyle = `rgba(222,238,255,${0.95 * (1 - 0.5 * k)})`; g.strokeStyle = "rgba(40,60,110,0.6)"; g.lineWidth = 1;
          const r = 2.2 + 1.6 * hash(i + 9);
          g.beginPath(); g.ellipse(x, y, r, r * 1.3, a + Math.PI / 2, 0, TAU); g.fill(); g.stroke();
        }
      }
    }
    g.restore();
  }
  // racha de viento: rayas
  function rachas(g, t) {
    const k = campana(t, T.viento0 - 0.1, T.voltea + 0.5); if (k < 0.02) return;
    g.save(); g.strokeStyle = `rgba(230,240,255,${0.55 * k})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = 0; i < 7; i++) {
      const per = 0.45, u = ((t + i * 0.13) % per) / per, x = W + 60 - (W + 200) * u, y = 120 + i * 48 + 10 * Math.sin(i * 1.7);
      g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x - 40, y - 8, x - 80, y + 10, x - 130, y - 4); g.stroke();
    }
    g.restore();
  }
  function efectos(g, t, pg, pm, U) {
    chapoteo(g, t, pg);
    // ¡pop! al abrirse
    const kp = fase(t, T.pop - 0.02, T.pop + 0.3);
    if (kp > 0 && kp < 1) {
      const c = U.aP(P(0, -U.L + 10));
      g.save(); g.strokeStyle = `rgba(255,255,255,${1 - kp})`; g.lineWidth = 2.4; g.lineCap = "round";
      for (let i = 0; i < 8; i++) { const a = -Math.PI * (0.05 + 0.9 * i / 7), r0 = 70 + 30 * kp, r1 = r0 + 12; g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0 * 0.7); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1 * 0.7); g.stroke(); }
      g.restore();
    }
    // ¡plof! al darse la vuelta
    const kv = fase(t, T.voltea - 0.02, T.voltea + 0.35);
    if (kv > 0 && kv < 1) {
      const c = U.aP(P(0, -U.L - 20));
      g.save(); g.globalAlpha = 1 - kv; estrellaPuntas(g, c.x, c.y, 18 + 16 * kv, 8, 0.2, 0.5); g.fillStyle = "#fff4c2"; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke(); g.restore();
    }
    // mejilla con mejilla: un corazoncito
    const kc = fase(t, T.corazon, T.corazon + 0.9);
    if (kc > 0 && kc < 1) {
      const a = G.aPantalla(pg, G.centroCabeza(pg)), b = M.aPantalla(pm, M.centroCabeza(pm));
      corazon(g, (a.x + b.x) / 2 + 4 * Math.sin(t * 6), Math.min(a.y, b.y) - 46 - 22 * kc, 7 + 4 * salida(clamp(kc * 3)), Math.sin(Math.PI * kc));
    }
    rachas(g, t);
    chof(g, t, pg, pm, "delante");
  }

  /* =====================================================================================
   * CÁMARA
   * ===================================================================================== */
  function camara(t) {
    const z = tramo(t, T.apreta0 - 0.3, T.mejilla + 0.2) * (1 - tramo(t, T.voltea - 0.1, T.voltea + 0.5));
    const z2 = tramo(t, T.voltea - 0.1, T.voltea + 0.5) * (1 - tramo(t, T.charco - 0.2, T.agacha0 + 0.2));
    return { k: 1 + 0.32 * z + 0.08 * z2, x: lerp(lerp(W / 2, 540, z2), 552, z), y: lerp(lerp(H / 2, 290, z2), 236, z) };
  }

  class Lluvia extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !M.listo()) return;
      if (!fondo) fondo = creaFondo();
      const { g: pg, m: pm } = pose(t);
      const U = paraguas(t, pm);
      const luz = tramo(t, NEGRO_INICIO, T.entra, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      g.drawImage(fondo, FX, FY);
      halos(g, t);
      salpicaduras(g, t);
      goteo(g, t);
      // zona seca bajo el paraguas (mientras está abierto y del derecho)
      let mascara = null;
      const seco = U.o > 0.3 && U.f > 0.2;
      if (seco) {
        const sil = siluetaCopa(U), sl = viento(t), a = sil[0], b = sil[sil.length - 1], hb = 600;
        mascara = sil.concat([P(b.x - sl * (hb - b.y), hb), P(a.x - sl * (hb - a.y), hb)]);
      }
      lluvia(g, t, "lejos", mascara);
      // sombras
      g.fillStyle = "rgba(20,20,50,0.3)";
      for (const p of [pg, pm]) { const sx = 46 * p.s / S0 * (1 - 0.4 * vuelo(t)); g.beginPath(); g.ellipse(p.x, p.suelo + 3, sx, 7, 0, 0, TAU); g.fill(); }
      chof(g, t, pg, pm, "atras");
      // paraguas por detrás de los dos
      dibParaguas(g, t, U);
      // Guillermo (empapado) y Marta (delante; empapada desde que se da la vuelta el paraguas)
      dibujaEnCapa(g, G, pg, t, 1);
      if (pm.moja > 0.004) dibujaEnCapa(g, M, pm, t, pm.moja); else M.dibujar(g, pm, t);
      punosEncima(g, M, pm, ["cerca"]);
      goteoParaguas(g, t, U, pg, pm);
      rebotes(g, t, pg, pm, U);
      chorreo(g, t, pg, pm);
      efectos(g, t, pg, pm, U);
      lluvia(g, t, "cerca", mascara);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }

  registrar({ id: "00097", nombre: "Guillermo y Marta · Bajo la lluvia", crear: () => new Lluvia() });
  window.__A2D_00097 = { pose, T, DUR, paraguas };
})();
