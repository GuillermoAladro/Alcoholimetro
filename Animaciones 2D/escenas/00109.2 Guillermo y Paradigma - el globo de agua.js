"use strict";
/* 00109.2 · Guillermo y Paradigma · Los globos de agua
 *
 * Negro → un patio trasero en pleno verano: cielo limpio con un sol que deslumbra, tapia encalada
 * con tejas, una buganvilla, un tendedero con ropa, una piscinita hinchable con su patito, el césped
 * y, a la derecha, un pilar de ladrillo con la manguera enrollada. Paradigma, de espaldas a Guillermo,
 * toma el sol con los ojos cerrados y una limonada en la mano; delante tiene un girasol en su maceta.
 * Guillermo saca un globo de agua de un cubo, mira a cámara con picardía y se acerca de puntillas.
 * Carga como un lanzador de béisbol (rodilla arriba) y lo lanza… justo cuando Paradigma, sin abrir
 * los ojos, se inclina a oler el girasol: el globo le pasa rozando, revienta contra el pilar (se
 * queda la mancha) y el agua da la vuelta por el aire y le cae entera a Guillermo. Empapado (pelo
 * aplastado, camiseta chorreando, charco), escupe un chorrito, mira a cámara y se enfada. Vuelve al
 * cubo, saca un globo enorme que se bambolea y lo lanza a dos manos por todo lo alto… Paradigma, con
 * los ojos cerrados, saca la mano del bolsillo y lo caza con la palma sin que reviente. Abre los
 * ojos, lo gira, lo aprieta, levanta una ceja, se da la vuelta y, con el globo en alto, va hacia Guillermo, que se encoge
 * esperando el golpe; se lo deja con cuidado encima de la cabeza y se aparta un paso. Guillermo abre
 * un ojo, mira arriba, se incorpora despacio en equilibrio, sonríe aliviado… y ¡plof!: revienta.
 * Chorreando, mira a cámara mientras Paradigma, al sol, da un sorbo de limonada → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`. Los globos se calculan a partir de las manos (o
 * las manos a partir del globo cuando hay que agarrarlo justo); el agua que vuelve, las gotas y los
 * charcos van en pantalla. Guillermo, desde que se moja, se pinta en un lienzo aparte (pelo
 * aplastado y camiseta empapada, como en 00083 y 00097).
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, hash } = M2;
  const G = Guillermo, PD = Paradigma;
  const DUR = 15.0, TINTA = "#0b0a0e", TAU = Math.PI * 2;
  const SUELO = 548, S = 0.3;

  const T = {
    // Guillermo saca un globo del cubo y se da la vuelta
    saca0: 0.25, saca1: 0.62, gira0a: 0.66, gira0b: 0.9,
    pasa0: 1.0, pasa1: 1.16, picaro0: 1.02, picaro1: 1.42,
    // de puntillas
    p1a: 1.46, p1b: 1.86, p2a: 1.92, p2b: 2.32, p3a: 2.38, p3b: 2.74,
    // lanzamiento 1 (con la pierna arriba)
    carga0: 2.8, patada: 3.16, planta: 3.38, lanza: 3.46, sigue1: 3.72, arrastra0: 3.56, arrastra1: 3.86,
    // Paradigma: sorbo y girasol
    sorbo0: 0.42, sorbo1: 1.3,
    baja0: 2.72, baja1: 3.16, huele0: 3.2, huele1: 3.95, sube0: 4.5, sube1: 4.96,
    choca: 3.74, revienta1: 3.8, vuelve0: 3.84, moja: 4.34,
    // Guillermo empapado
    salta0: 3.76, salta1: 3.98, horror: 4.02,
    seco: 4.72, escupe0: 4.98, escupe1: 5.36, mira: 5.46, vena: 6.0,
    gira1a: 6.22, gira1b: 6.46,
    q1a: 6.46, q1b: 6.74, q2a: 6.78, q2b: 7.08, q3a: 7.12, q3b: 7.32,
    coge: 7.46, saca2: 7.8, abraza: 8.02,
    gira2a: 8.14, gira2b: 8.38,
    r1a: 8.38, r1b: 8.6, r2a: 8.56, r2b: 8.74,
    agacha0: 8.72, agacha1: 8.94, suelta: 9.08, sigue2: 9.32,
    // Paradigma lo caza
    manoP0: 9.22, manoP1: 9.56, caza: 9.88, pasma: 9.92,
    abreP: 10.12, aprieta: 10.32, ceja: 10.5, miraG: 10.66,
    giraP1a: 10.82, giraP1b: 11.06,
    s1a: 11.06, s1b: 11.3, s2a: 11.32, s2b: 11.56, s3a: 11.58, s3b: 11.72,
    encoge0: 11.08, encoge1: 11.4,
    pone0: 11.74, pone1: 12.06, suelta2: 12.14,
    s4a: 12.2, s4b: 12.38, s5a: 12.36, s5b: 12.56,
    ojo: 12.3, arriba: 12.46, levanta0: 12.52, levanta1: 13.0, alivio: 13.02,
    giraP2a: 12.62, giraP2b: 12.86,
    pop: 13.18, seco2: 13.48, camaraG: 13.62, gotaNariz: 13.95,
    sorbo2a: 13.56, sorbo2b: 14.22,
    fin: 14.42
  };

  /* ---------- utilidades ---------- */
  const P = (x, y) => ({ x, y });
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function guion(lista, dic, base, t) {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const D5 = (pu, ix, md, an, me) => ({ pulgar: pu, indice: ix, medio: md, anular: an, menique: me });
  const TODOS = k => D5(k, k, k, k, k);
  const PUNO = TODOS(0), PALMA = D5(0.8, 1, 1, 1, 1), ABIERTA = D5(1, 1, 1, 1, 1);
  const COGE = D5(0.5, 0.55, 0.5, 0.45, 0.4);              // la mano rodea el globo
  const PATA = D5(0.3, 0.45, 0.4, 0.35, 0.3);               // de puntillas: manos de gato
  const VASO = D5(0.45, 0.4, 0.38, 0.36, 0.34);
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const difAng = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const mezMano = (a, d, k) => ({ x: lerp(a.x, d.x, k), y: lerp(a.y, d.y, k), mu: a.mu + difAng(a.mu, d.mu) * k, ang: 0, puno: lerp(a.puno ?? 1, d.puno ?? 1, k),
    dedos: DD(a.dedos, d.dedos, k), dobla: k < 0.5 ? a.dobla : d.dobla });
  const mezManoD = (a, d, k, kc) => Object.assign(mezMano(a, d, k), { dobla: k < kc ? a.dobla : d.dobla });
  const conMano = (m, dx, dy, dmu = 0) => Object.assign({}, m, { x: m.x + dx, y: m.y + dy, mu: m.mu + dmu });
  const K = (t, a, b) => suave(fase(t, a, b));

  /* ---------- caras ---------- */
  const BASE = { mx: 0.5, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, rub: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  // bolsillos de Guillermo (muñecas del avatar → centro del puño), como en 00070
  const R_M = G.MUNECA_R * G.JK;
  const manoDesde = (m, mu) => P(m.x - Math.cos(mu) * R_M, m.y - Math.sin(mu) * R_M);
  const BOLS_GC = manoDesde(P(131, 652), -1.75), BOLS_GL = manoDesde(P(372, 648), -1.75);
  function bolsillo(R, p, lado) {
    if (R.manoReposo) { const m = R.manoReposo(p, lado); return { x: m.x, y: m.y, mu: m.mu, ang: 0, puno: 0, dedos: TODOS(0.4), dobla: lado === "cerca" ? -1 : 1 }; }
    const m = R.tronco(p)(lado === "cerca" ? BOLS_GC : BOLS_GL);
    return { x: m.x, y: m.y, mu: -1.75 + p.torso, ang: 0, puno: 0, dedos: TODOS(0.4), dobla: lado === "cerca" ? -1 : 1 };
  }
  // mano a un punto de pantalla (mu en coordenadas de hoja: hacia el codo; +x = hacia donde mira)
  const enPant = (R, p, q, mu, dedos, dobla) => { const h = R.aHoja(p, q); return { x: h.x, y: h.y, mu, ang: 0, puno: 1, dedos, dobla }; };
  // mano en un punto del tronco (hoja sin inclinar)
  const enTronco = (R, p, x, y, mu, dedos, dobla) => { const q = R.tronco(p)(P(x, y)); return { x: q.x, y: q.y, mu: mu + p.torso, ang: 0, puno: 1, dedos, dobla }; };

  // giro aplastado (como en 00104): el espejo cambia a mitad del giro; sx = |cos|
  function giro(t, t0, t1, de, a) {
    const u = fase(t, t0, t1);
    if (u <= 0) return { espejo: de, sx: 1 };
    if (u >= 1) return { espejo: a, sx: 1 };
    return { espejo: u < 0.5 ? de : a, sx: Math.abs(Math.cos(Math.PI * suave(u))) };
  }
  // hoja → pantalla teniendo en cuenta el aplastado (sx) alrededor de p.x
  function aPant(R, p, q) { const s = R.aPantalla(p, q), sx = p.sx ?? 1; return P(p.x + (s.x - p.x) * sx, s.y); }
  const enCab = (R, p, q) => aPant(R, p, R.cabeza(p).a(q));
  // dirección «arriba» de la cabeza en pantalla
  function arribaCab(R, p) { const a = enCab(R, p, P(800, 520)), b = enCab(R, p, P(800, 300)), d = Math.hypot(b.x - a.x, b.y - a.y) || 1; return P((b.x - a.x) / d, (b.y - a.y) / d); }
  // posición en pantalla de una mano (centro) y de la dirección de sus dedos
  function manoPant(R, p, m) {
    const c = aPant(R, p, m), fx = (p.espejo ? -1 : 1) * (p.sx ?? 1);
    const dx = -Math.cos(m.mu) * fx, dy = -Math.sin(m.mu), d = Math.hypot(dx, dy) || 1;
    return { c, dir: P(dx / d, dy / d), k: R.JK * p.s * (R.K || 1) };
  }

  /* ---------- pies (en pantalla) ---------- */
  // pista de un pie: [t0, t1, x destino, alto, tipo]; devuelve x, alto y giro del pie (hacia delante +)
  function pista(x0, pasos, t) {
    let x = x0;
    for (const s of pasos) {
      const [t0, t1, x1, alto = 18, tipo] = s;
      if (t <= t0) return { x, h: 0, a: 0, dx: 0 };
      if (t >= t1) { x = x1; continue; }
      const u = (t - t0) / (t1 - t0);
      if (tipo === "patada") {         // rodilla arriba, se queda un momento… y planta adelante
        const sube = u < 0.68 ? salida(u / 0.68) : 1 - entrada((u - 0.68) / 0.32);
        const ux = u < 0.68 ? 0.12 * u / 0.68 : 0.12 + 0.88 * suave((u - 0.68) / 0.32);
        return { x: lerp(x, x1, ux), h: alto * sube, a: -0.35 * sube, dx: x1 - x, patada: sube };
      }
      return { x: lerp(x, x1, suave(clamp((u - 0.04) / 0.92))), h: alto * Math.sin(Math.PI * u), a: 0.26 * Math.sin(Math.PI * u) - 0.08 * Math.sin(TAU * u), dx: x1 - x };
    }
    return { x, h: 0, a: 0, dx: 0 };
  }
  // pie (pantalla) → pierna (hoja); punta: de puntillas (talón arriba, tobillo alzado)
  function aPierna(R, p, w, lado, punta = 0) {
    const tob = R.SUELO - R.TOBILLO_ALTO, mirando = p.espejo ? -1 : 1;
    const adelante = w.dx === 0 ? 1 : (Math.sign(w.dx) === mirando ? 1 : -1);
    const a = (w.patada ? w.a : adelante * w.a) + 0.42 * punta, alza = 7 * punta;
    return { tob: P(R.aHoja(p, P(w.x, 0)).x, tob - (lado === "lejos" ? 12 : 0) - (w.h + alza) / (p.s * (R.K || 1))), ang: a };
  }

  const MEMO = new Map();
  const memo = (c, f) => { if (MEMO.has(c)) return MEMO.get(c); if (MEMO.size > 60) MEMO.clear(); const v = f(); MEMO.set(c, v); return v; };

  /* =====================================================================================
   * DECORADO: medidas que usan los personajes
   * ===================================================================================== */
  const PARED = 505;                                         // línea tapia-césped
  const PILAR = { x0: 870, x1: 992, lado: 852, arriba: 96 };  // pilar de ladrillo (cara lateral de 852 a 870)
  const IMPACTO = P(862, 194);                               // donde revienta el globo pequeño
  const MESA = { x: 165, y: 400, r: 52 };                    // mesita del cubo (tablero)
  const CUBO = { x: 165, y: 346, r0: 34, r1: 26, alto: 54 }; // cubo: boca (y) y fondo (y + alto)
  const R1 = 14, R2 = 29;                                    // radios de los globos (pantalla)
  const globo1Cubo = () => P(CUBO.x + 8, CUBO.y - 2);
  const COL1 = "#ff4f9a", COL2 = "#ff8a1e";

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  // pies físicos A (el de la izquierda al empezar) y B; mirando a la derecha: A = cerca, B = lejos
  const PIES_G = {
    A: [229, [[T.p1a, T.p1b, 330, 26], [T.p3a, T.p3b, 378, 22], [T.arrastra0, T.arrastra1, 420, 8], [T.q2a, T.q2b, 229, 24], [T.r2a, T.r2b, 298, 18]]],
    B: [277, [[T.p2a, T.p2b, 426, 26], [T.carga0, T.planta, 470, 78, "patada"], [T.q1a, T.q1b, 340, 24], [T.q3a, T.q3b, 277, 16], [T.r1a, T.r1b, 346, 18]]]
  };
  const giroG = t => t < T.gira1a ? giro(t, T.gira0a, T.gira0b, true, false) : t < T.gira2a ? giro(t, T.gira1a, T.gira1b, false, true) : giro(t, T.gira2a, T.gira2b, true, false);
  const puntillasG = t => tramo(t, T.p1a - 0.14, T.p1a) * (1 - tramo(t, T.p3b, T.carga0)) + 0.8 * campana(t, T.suelta - 0.1, T.sigue2 + 0.25);
  // saltitos (los dos pies en el aire)
  const saltoG = t => 34 * campana(t, T.salta0, T.salta1) + 10 * campana(t, T.pop, T.pop + 0.16);

  const CG0 = { pel: 0, pelx: 0, torso: 0.02, cab: 0.04 };
  const CG = o => Object.assign({}, CG0, o);
  const CUERPOS_G = {
    saca: CG({ pel: 30, torso: 0.42, cab: 0.3 }),
    base: CG({ pel: 2, torso: 0.02, cab: 0.04 }),
    picaro: CG({ pel: 6, torso: -0.05, cab: -0.06 }),
    sigilo: CG({ pel: 74, pelx: 10, torso: 0.3, cab: 0.14 }),
    carga: CG({ pel: 14, pelx: -20, torso: -0.2, cab: -0.04 }),
    lanza: CG({ pel: 30, pelx: 24, torso: 0.34, cab: 0.2 }),
    sigue: CG({ pel: 26, pelx: 18, torso: 0.24, cab: 0.1 }),
    mira: CG({ pel: 8, torso: 0.02, cab: -0.08 }),
    horror: CG({ pel: 6, pelx: -12, torso: -0.12, cab: -0.14 }),
    chof: CG({ pel: 26, torso: 0.1, cab: 0.16 }),
    seco: CG({ pel: 16, torso: 0.04, cab: 0.06 }),
    escupe: CG({ pel: 14, torso: -0.04, cab: -0.12 }),
    camara: CG({ pel: 16, torso: 0.02, cab: 0.02 }),
    enfado: CG({ pel: 8, torso: 0.08, cab: 0.04 }),
    anda: CG({ pel: 10, torso: 0.14, cab: 0.06 }),
    coge: CG({ pel: 26, torso: 0.38, cab: 0.28 }),
    levanta: CG({ pel: 26, pelx: -10, torso: -0.1, cab: 0.04 }),
    abraza: CG({ pel: 12, torso: -0.04, cab: -0.02 }),
    agacha: CG({ pel: 80, pelx: -16, torso: 0.3, cab: 0.16 }),
    heave: CG({ pel: -10, pelx: 18, torso: -0.16, cab: -0.2 }),
    pasma: CG({ pel: 8, torso: -0.06, cab: -0.1 }),
    encoge: CG({ pel: 420, pelx: -70, torso: 0.3, cab: 0.32 }),
    unojo: CG({ pel: 418, pelx: -70, torso: 0.26, cab: 0.2 }),
    erguido: CG({ pel: 6, torso: -0.02, cab: -0.04 }),
    chof2: CG({ pel: 30, torso: 0.08, cab: 0.14 }),
    final: CG({ pel: 18, torso: 0.03, cab: 0.03 })
  };
  const GUION_CUERPO_G = [
    [T.saca1 - 0.1, T.gira0a, "base"], [T.picaro0, T.picaro0 + 0.2, "picaro"], [T.p1a - 0.16, T.p1a + 0.1, "sigilo"],
    [T.carga0, T.patada - 0.06, "carga"], [T.planta - 0.04, T.lanza + 0.04, "lanza", entrada], [T.lanza + 0.06, T.sigue1, "sigue"],
    [T.salta0 - 0.04, T.salta0 + 0.1, "mira"], [T.horror - 0.03, T.horror + 0.12, "horror", salida], [T.moja, T.moja + 0.1, "chof", salida],
    [T.seco, T.seco + 0.25, "seco"], [T.escupe0, T.escupe0 + 0.15, "escupe"], [T.mira - 0.05, T.mira + 0.2, "camara"],
    [T.vena, T.vena + 0.12, "enfado"], [T.gira1a, T.gira1b, "anda"], [T.q3b - 0.1, T.coge, "coge"], [T.coge + 0.06, T.saca2, "levanta"],
    [T.saca2, T.abraza + 0.05, "abraza"], [T.agacha0, T.agacha1, "agacha"], [T.agacha1 + 0.02, T.suelta, "heave", entrada],
    [T.sigue2, T.pasma + 0.15, "pasma"], [T.encoge0, T.encoge1, "encoge", salida], [T.ojo, T.ojo + 0.2, "unojo"],
    [T.levanta0, T.levanta1, "erguido"], [T.pop, T.pop + 0.1, "chof2", salida], [T.seco2, T.camaraG + 0.2, "final"]
  ];
  const CARAS_G = {
    saca: E({ mx: 0.7, my: 0.7, c: 0.12, sd: 8, si: 8, abre: 0, ancho: 0.75, sonr: 0.45 }),
    picaro: E({ mx: -0.45, my: 0.05, c: 0.35, sd: 16, gd: -0.1, si: -4, gi: 0.12, abre: 4, ancho: 1.0, sonr: 0.95 }),
    sigilo: E({ mx: 0.95, my: 0.1, c: 0.45, sd: 8, gd: -0.16, si: 8, gi: -0.16, abre: 3, ancho: 1.0, sonr: 0.8 }),
    apunta: E({ mx: 0.95, my: -0.1, c: 0.35, cd: 0.9, sd: -4, gd: -0.15, si: 14, abre: 12, ancho: 0.6, sonr: 0.3, lengua: 1 }),
    lanza: E({ c: 1, z: 1, sd: 22, si: 22, abre: 28, ancho: 1.0, sonr: 0.3 }),
    rie: E({ mx: 0.9, my: -0.25, c: 0.6, h: 0.6, sd: 16, si: 16, abre: 30, ancho: 1.0, sonr: 0.85 }),
    horror: E({ mx: 0.95, my: -0.65, iris: 0.7, sd: 30, gd: 0.2, si: 30, gi: 0.2, abre: 28, ancho: 0.55, sonr: -0.5 }),
    chof: E({ c: 1, z: 1, sd: 16, si: 16, abre: 6, ancho: 0.7, sonr: -0.45 }),
    seco: E({ mx: 0.5, my: 0.1, c: 0.55, sd: -2, si: -2, abre: 0, ancho: 0.7, sonr: -0.2 }),
    escupe: E({ mx: 0.7, my: -0.2, c: 0.55, sd: 2, si: 2, abre: 12, ancho: 0.32, sonr: -0.1 }),
    camara: E({ mx: -0.38, my: 0.05, c: 0.5, sd: -4, si: -4, abre: 0, ancho: 0.75, sonr: -0.28 }),
    enfado: E({ mx: 0.9, my: 0, c: 0.35, sd: -10, gd: -0.26, si: -10, gi: -0.26, abre: 6, ancho: 0.95, sonr: -0.55 }),
    coge: E({ mx: 0.8, my: 0.7, c: 0.25, sd: -6, gd: -0.2, si: -6, gi: -0.2, abre: 2, ancho: 0.9, sonr: 0.3 }),
    malvado: E({ mx: -0.42, my: 0, c: 0.42, sd: -6, gd: -0.22, si: -6, gi: -0.22, abre: 8, ancho: 1.05, sonr: 0.95 }),
    esfuerzo: E({ c: 1, z: 1, sd: 18, si: 18, abre: 30, ancho: 1.0, sonr: 0.25 }),
    vuela: E({ mx: 0.85, my: -0.9, c: 0.15, sd: 20, si: 20, abre: 16, ancho: 0.8, sonr: 0.6 }),
    pasma: E({ mx: 0.95, my: -0.15, iris: 0.8, sd: 28, si: 28, abre: 34, ancho: 0.6, sonr: -0.1 }),
    miedo: E({ c: 1, z: 1, sd: 18, si: 18, abre: 8, ancho: 0.95, sonr: -0.6 }),
    unojo: E({ mx: 0.7, my: -0.4, c: 0.25, cd: 1, z: 0.4, sd: 6, si: 22, gi: 0.1, abre: 2, ancho: 0.7, sonr: -0.35 }),
    arriba: E({ mx: 0.12, my: -1, iris: 0.9, sd: 26, si: 26, abre: 4, ancho: 0.6, sonr: -0.2 }),
    alivio: E({ mx: 0.15, my: -0.85, c: 0.45, h: 0.5, sd: 14, si: 14, abre: 2, ancho: 0.85, sonr: 0.62 }),
    final: E({ mx: -0.38, my: 0.05, c: 0.55, sd: -6, si: -6, abre: 0, ancho: 0.7, sonr: -0.35 })
  };
  const GUION_CARA_G = [
    [T.saca1, T.gira0a, "sigilo"], [T.picaro0, T.picaro0 + 0.12, "picaro"], [T.picaro1 - 0.05, T.p1a + 0.1, "sigilo"],
    [T.carga0, T.carga0 + 0.15, "apunta"], [T.planta - 0.06, T.lanza, "lanza"], [T.lanza + 0.08, T.lanza + 0.2, "rie"],
    [T.horror - 0.04, T.horror + 0.06, "horror", salida], [T.moja - 0.02, T.moja + 0.05, "chof"], [T.seco, T.seco + 0.2, "seco"],
    [T.escupe0, T.escupe0 + 0.1, "escupe"], [T.escupe1, T.mira, "seco"], [T.mira, T.mira + 0.15, "camara"],
    [T.vena, T.vena + 0.1, "enfado"], [T.q3b, T.coge, "coge"], [T.saca2 + 0.05, T.abraza + 0.05, "malvado"],
    [T.gira2b, T.r1b, "enfado"], [T.agacha0, T.agacha0 + 0.1, "esfuerzo"], [T.suelta + 0.06, T.suelta + 0.2, "vuela"],
    [T.pasma - 0.04, T.pasma + 0.08, "pasma", salida], [T.encoge0, T.encoge0 + 0.12, "miedo"], [T.ojo, T.ojo + 0.12, "unojo"],
    [T.arriba, T.arriba + 0.12, "arriba"], [T.alivio - 0.1, T.alivio + 0.12, "alivio"], [T.pop - 0.01, T.pop + 0.05, "chof"],
    [T.seco2, T.seco2 + 0.15, "seco"], [T.camaraG, T.camaraG + 0.18, "final"]
  ];
  const PARP_G = [0.5, 2.06, 5.0, 7.0, 9.6, 13.82];

  function poseG(t) { return memo("g" + t, () => poseG0(t)); }
  function poseG0(t) {
    const gr = giroG(t), b = guion(GUION_CUERPO_G, CUERPOS_G, "saca", t);
    const fa = pista(PIES_G.A[0], PIES_G.A[1], t), fb = pista(PIES_G.B[0], PIES_G.B[1], t);
    const der = !gr.espejo, mid = (fa.x + fb.x) / 2, x = mid - 2 * (der ? 1 : -1) * gr.sx;
    const respira = Math.sin(t * 2.1), tip = puntillasG(t), sal = saltoG(t);
    // empapado: tiritona; encogido: tembleque; enfado: se sacude
    const tirita = 1.6 * campana(t, T.moja + 0.1, T.mira) * Math.sin(t * 34);
    const tiembla = (1.4 * campana(t, T.encoge1 - 0.1, T.ojo + 0.1) + 1.2 * campana(t, T.vena, T.gira1a)) * Math.sin(t * 41);
    const bote = -3 * Math.sin(TAU * fase(t, T.pasa0 - 0.2, T.picaro1)) * campana(t, T.pasa0 - 0.2, T.picaro1);
    const p = {
      x, suelo: SUELO - sal, s: S, espejo: gr.espejo, sx: gr.sx, tirasLimpias: true, ikContinuo: false, hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x + b.pelx + tiembla, y: G.PELVIS.y + b.pel + respira * 1.3 - tip * 20 - 0.12 * (fa.h + fb.h) / S + bote / S },
      torso: b.torso + 0.012 * tirita, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.02 * tirita + 0.006 * tiembla, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    const cerca = der ? fa : fb, lejos = der ? fb : fa;
    p.piernas.cerca = aPierna(G, p, Object.assign({}, cerca, { h: cerca.h - 0 }), "cerca", tip);
    p.piernas.lejos = aPierna(G, p, lejos, "lejos", lejos.patada ? 0 : tip);
    // cara
    const e = guion(GUION_CARA_G, CARAS_G, "saca", t);
    // cejas pícaras (sube y baja)
    if (t > T.picaro0 && t < T.picaro1) e.sd += 10 * Math.max(0, Math.sin((t - T.picaro0) * 22)) * campana(t, T.picaro0, T.picaro1);
    if (t > T.escupe0 && t < T.escupe1) { const k = campana(t, T.escupe0, T.escupe0 + 0.2); e.mof = Math.max(e.mof, k); e.abre = lerp(e.abre, 0, k); }
    p.cara = cara(e, parpadeo(t, PARP_G));
    if (t > T.escupe0 && t < T.escupe0 + 0.2) p.cara.mofletes = campana(t, T.escupe0 - 0.02, T.escupe0 + 0.22);
    p.enfado = tramo(t, T.vena, T.vena + 0.15) * (1 - tramo(t, T.coge, T.coge + 0.3)) + 0.7 * campana(t, T.gira2b - 0.1, T.suelta + 0.1);
    p.rojo = 0.6 * tramo(t, T.vena, T.vena + 0.2) * (1 - tramo(t, T.coge, T.coge + 0.4)) + 0.5 * campana(t, T.agacha0, T.suelta + 0.15);
    p.sudor = 0.8 * campana(t, T.encoge0, T.levanta1 + 0.2);
    // agua
    p.moja = tramo(t, T.moja, T.moja + 0.16);
    manosG(p, t);
    return p;
  }

  /* --- manos de Guillermo --- */
  // globo grande en brazos (centro en la hoja del tronco) según el momento
  function abrazoHoja(t) {
    let q = P(330, 560);
    q = P(lerp(q.x, 330, K(t, T.agacha0, T.agacha1)), lerp(q.y, 600, K(t, T.agacha0, T.agacha1)));
    q = P(lerp(q.x, 450, K(t, T.agacha1 + 0.02, T.suelta)), lerp(q.y, 450, entrada(fase(t, T.agacha1 + 0.02, T.suelta))));
    return q;
  }
  function manosG(p, t) {
    const bC = bolsillo(G, p, "cerca"), bL = bolsillo(G, p, "lejos");
    const T_ = (x, y, mu, d, db) => enTronco(G, p, x, y, mu, d, db);
    const cuelga = (lado) => lado === "cerca" ? T_(60, 690, -1.4, TODOS(0.7), -1) : T_(430, 670, -1.75, TODOS(0.7), 1);
    let C = bC, L = bL;
    // 1 · mete la mano en el cubo y saca el globo rosa (mirando a la izquierda)
    {
      const c = globo1Cubo(), mu = -1.5, dist = R1 * 0.55 + 4;
      const tanteo = 3 * Math.sin(t * 19) * (1 - K(t, T.saca0 - 0.05, T.saca0));
      const enCubo = enPant(G, p, P(c.x + (p.espejo ? -1 : 1) * Math.cos(mu) * dist, c.y + Math.sin(mu) * dist + 3 + tanteo), mu, COGE, 1);
      L = enCubo;
      L = mezMano(L, T_(420, 470, 2.6, COGE, 1), K(t, T.saca0, T.saca1));
    }
    // 2 · se lo pasa a la otra mano con un tirito; la lejana se queda como una pata de gato
    const sujeta = T_(320, 470, 2.55, COGE, -1);
    const pata = T_(440, 500, -1.35, PATA, 1);
    if (t > T.pasa0 - 0.2) {
      C = mezMano(C, sujeta, K(t, T.pasa0 - 0.2, T.pasa1));
      L = mezMano(L, pata, K(t, T.pasa0 + 0.02, T.pasa1 + 0.15));
    }
    // de puntillas: las manos rebotan un poco con los pasos
    if (t > T.p1a - 0.1 && t < T.carga0 + 0.1) { const b = 6 * Math.sin(t * 12); C = conMano(C, 0, b * 0.5); L = conMano(L, 0, b); }
    // 3 · lanzamiento: atrás… barrido… suelta y sigue
    if (t > T.carga0) {
      C = mezMano(C, T_(-140, 380, 0.25, COGE, -1), K(t, T.carga0, T.patada));
      C = mezManoD(C, T_(470, 400, Math.PI + 0.1, COGE, -1), entrada(fase(t, T.planta - 0.08, T.lanza)), 0.5);
      C = mezMano(C, T_(270, 590, -2.2, ABIERTA, -1), K(t, T.lanza, T.sigue1));
      L = mezMano(L, T_(560, 370, Math.PI, PALMA, 1), K(t, T.carga0, T.carga0 + 0.25));
      L = mezMano(L, T_(320, 560, -2.0, PUNO, 1), K(t, T.planta - 0.06, T.lanza + 0.06));
    }
    // 4 · ¡sí! (puños) · horror (palmas) · ¡chof! (brazos abiertos chorreando) · cuelgan
    if (t > T.salta0 - 0.08) {
      const k1 = K(t, T.salta0 - 0.08, T.salta0 + 0.04);
      C = mezMano(C, T_(330, 400, 2.0, PUNO, -1), k1); L = mezMano(L, T_(470, 390, 2.2, PUNO, 1), k1);
      const k2 = K(t, T.horror, T.horror + 0.12);
      C = mezMano(C, T_(380, 450, 2.6, PALMA, -1), k2); L = mezMano(L, T_(530, 440, 2.9, PALMA, 1), k2);
      const k3 = K(t, T.moja - 0.02, T.moja + 0.1);
      C = mezMano(C, T_(-60, 560, -0.4, ABIERTA, -1), k3); L = mezMano(L, T_(560, 560, Math.PI + 0.4, ABIERTA, 1), k3);
      const k4 = K(t, T.seco, T.seco + 0.4);
      C = mezMano(C, cuelga("cerca"), k4); L = mezMano(L, cuelga("lejos"), k4);
    }
    // 5 · enfadado: puños apretados; se da la vuelta y anda hacia el cubo balanceando los brazos
    if (t > T.vena - 0.1) {
      const k = K(t, T.vena - 0.1, T.vena + 0.1);
      C = mezMano(C, T_(95, 690, -1.6, PUNO, -1), k); L = mezMano(L, T_(395, 665, -1.6, PUNO, 1), k);
      const ka = campana(t, T.q1a - 0.05, T.q3b + 0.05), sw = Math.sin(TAU * (t - T.q1a) / 0.62);
      if (ka > 0) { C = conMano(C, -40 * sw * ka, -6 * Math.abs(sw) * ka); L = conMano(L, 40 * sw * ka, -6 * Math.abs(sw) * ka); }
    }
    // 6 · el globo gigante: lo agarra del nudo, lo saca colgando… y lo abraza con las dos manos
    if (t > T.q3b - 0.15) {
      const g2 = globo2Cubo();
      const nudo = enPant(G, p, P(g2.x, g2.y - 1.24 * R2), -1.2, COGE, 1);
      L = mezMano(L, nudo, K(t, T.q3b - 0.15, T.coge));
      if (t > T.coge) L = mezMano(L, T_(440, 380, 2.3, COGE, 1), K(t, T.coge + 0.05, T.saca2));
      C = mezMano(C, cuelga("cerca"), K(t, T.q3b - 0.1, T.coge));
      if (t > T.saca2 - 0.1) {
        const q = abrazoHoja(t), rh = (R2 + 2) / S, k = K(t, T.saca2 - 0.1, T.abraza);
        C = mezManoD(C, T_(q.x - rh * 0.92, q.y + 18, -0.2, COGE, -1), k, 0.3);
        L = mezManoD(L, T_(q.x + rh * 0.92, q.y + 10, Math.PI + 0.2, COGE, 1), k, 0.7);
      }
      // ¡arriba! se le van las manos hacia delante, abiertas
      if (t > T.suelta - 0.02) {
        const k = K(t, T.suelta - 0.02, T.sigue2);
        C = mezMano(C, T_(430, 360, Math.PI - 0.5, ABIERTA, -1), k); L = mezMano(L, T_(560, 350, Math.PI - 0.3, ABIERTA, 1), k);
      }
    }
    // 7 · pasmado (manos abiertas a los lados) · se encoge (puños en el pecho) · equilibrio · ¡plof! · cuelgan chorreando
    if (t > T.pasma - 0.05) {
      const k = K(t, T.pasma - 0.05, T.pasma + 0.15);
      C = mezMano(C, T_(70, 650, -1.0, ABIERTA, -1), k); L = mezMano(L, T_(470, 640, -2.1, ABIERTA, 1), k);
      const ke = K(t, T.encoge0, T.encoge0 + 0.22);
      const tb = 3 * Math.sin(t * 43) * campana(t, T.encoge0, T.ojo + 0.2);
      C = mezMano(C, conMano(T_(300, 440, 2.4, PUNO, -1), tb, 0), ke); L = mezMano(L, conMano(T_(400, 450, 2.2, PUNO, 1), -tb, 0), ke);
      const kb = K(t, T.levanta0, T.levanta0 + 0.3), bal = 8 * Math.sin((t - T.levanta0) * 9) * campana(t, T.levanta0, T.pop);
      C = mezMano(C, conMano(T_(-60, 470, -0.05, PALMA, -1), 0, bal), kb); L = mezMano(L, conMano(T_(580, 470, Math.PI + 0.05, PALMA, 1), 0, -bal), kb);
      const kp = K(t, T.pop - 0.02, T.pop + 0.08);
      C = mezMano(C, T_(20, 420, -0.6, ABIERTA, -1), kp); L = mezMano(L, T_(540, 410, Math.PI + 0.6, ABIERTA, 1), kp);
      const kc = K(t, T.seco2 - 0.1, T.seco2 + 0.3);
      C = mezMano(C, cuelga("cerca"), kc); L = mezMano(L, cuelga("lejos"), kc);
    }
    p.manoCerca = C; p.manoLejos = L;
  }

  /* =====================================================================================
   * PARADIGMA (a la derecha; mira al sol, a la derecha)
   * ===================================================================================== */
  const PIES_P = {
    A: [588, [[T.s2a, T.s2b, 528, 20], [T.s5a, T.s5b, 552, 12]]],
    B: [636, [[T.s1a, T.s1b, 586, 20], [T.s3a, T.s3b, 576, 10], [T.s4a, T.s4b, 600, 12]]]
  };
  const giroP = t => t < T.giraP2a ? giro(t, T.giraP1a, T.giraP1b, false, true) : giro(t, T.giraP2a, T.giraP2b, true, false);
  const CP0 = { pel: 0, pelx: 0, torso: 0, cab: 0 };
  const CP = o => Object.assign({}, CP0, o);
  const CUERPOS_P = {
    sol: CP({ pel: 2, torso: -0.08, cab: -0.24 }),
    sorbo: CP({ pel: 4, torso: 0.0, cab: 0.1 }),
    huele: CP({ pel: 104, pelx: -46, torso: 0.82, cab: 0.92 }),
    aah: CP({ pel: 0, torso: -0.12, cab: -0.32 }),
    caza: CP({ pel: 6, torso: -0.04, cab: -0.2 }),
    mira: CP({ pel: 6, torso: 0.04, cab: 0.2 }),
    miraG: CP({ pel: 4, torso: -0.04, cab: -0.06 }),
    anda: CP({ pel: 6, torso: 0.05, cab: 0.04 }),
    pone: CP({ pel: 22, torso: 0.06, cab: 0.2 }),
    atras: CP({ pel: 6, torso: 0.0, cab: 0.02 }),
    sol2: CP({ pel: 2, torso: -0.08, cab: -0.26 })
  };
  const GUION_CUERPO_P = [
    [T.sorbo0, T.sorbo0 + 0.3, "sorbo"], [T.sorbo1 - 0.25, T.sorbo1 + 0.1, "sol"],
    [T.baja0, T.baja1, "huele"], [T.sube0, T.sube1, "aah"], [T.sube1 + 0.1, T.sube1 + 0.5, "sol"],
    [T.manoP0, T.caza, "caza"], [T.abreP - 0.05, T.abreP + 0.2, "mira"], [T.miraG - 0.05, T.miraG + 0.15, "miraG"],
    [T.giraP1a, T.s1a + 0.1, "anda"], [T.pone0 - 0.1, T.pone0 + 0.15, "pone"], [T.suelta2, T.s5b, "atras"],
    [T.giraP2a, T.giraP2b + 0.2, "sol2"], [T.sorbo2a, T.sorbo2a + 0.3, "sorbo"], [T.sorbo2b - 0.2, T.sorbo2b + 0.1, "sol2"]
  ];
  const CARAS_P = {
    sol: E({ mx: 0.3, my: -0.5, c: 1, h: 0.35, sd: 8, si: 8, abre: 0, ancho: 0.85, sonr: 0.55 }),
    sorbo: E({ mx: 0.4, my: 0.6, c: 1, h: 0.2, sd: 6, si: 6, abre: 4, ancho: 0.4, sonr: 0.0 }),
    huele: E({ c: 1, h: 0.25, sd: 14, si: 14, abre: 0, ancho: 0.6, sonr: 0.35 }),
    aah: E({ c: 1, h: 0.5, sd: 12, si: 12, abre: 14, ancho: 0.75, sonr: 0.6 }),
    abre: E({ mx: 0.65, my: 0.75, c: 0.15, sd: 4, si: 4, abre: 0, ancho: 0.7, sonr: 0.2 }),
    ceja: E({ mx: 0.6, my: 0.65, c: 0.22, sd: 0, gd: -0.06, si: 24, gi: 0.16, abre: 0, ancho: 0.6, sonr: 0.12 }),
    miraG: E({ mx: -1, my: 0.1, c: 0.25, sd: 4, si: 18, gi: 0.1, abre: 0, ancho: 0.7, sonr: 0.35 }),
    calma: E({ mx: 0.7, my: 0.35, c: 0.3, sd: 6, si: 8, abre: 0, ancho: 0.75, sonr: 0.45 }),
    pone: E({ mx: 0.5, my: -0.2, c: 0.35, sd: 8, si: 8, abre: 0, ancho: 0.7, sonr: 0.55 }),
    vuelve: E({ mx: 0.3, my: -0.4, c: 0.7, h: 0.3, sd: 8, si: 8, abre: 0, ancho: 0.8, sonr: 0.6 })
  };
  const GUION_CARA_P = [
    [T.sorbo0, T.sorbo0 + 0.15, "sorbo"], [T.sorbo1 - 0.15, T.sorbo1, "sol"], [T.baja0 + 0.2, T.baja1, "huele"],
    [T.sube0, T.sube0 + 0.2, "aah"], [T.sube1, T.sube1 + 0.4, "sol"], [T.abreP, T.abreP + 0.12, "abre"], [T.ceja, T.ceja + 0.12, "ceja"],
    [T.miraG, T.miraG + 0.12, "miraG"], [T.giraP1b - 0.1, T.s1b, "calma"], [T.pone0, T.pone0 + 0.15, "pone"],
    [T.suelta2 + 0.1, T.giraP2a, "vuelve"], [T.giraP2b, T.giraP2b + 0.2, "sol"], [T.sorbo2a, T.sorbo2a + 0.15, "sorbo"],
    [T.sorbo2b - 0.15, T.sorbo2b, "sol"]
  ];
  const PARP_P = [10.95, 11.9];

  function cuerpoP(t) { return memo("pc" + t, () => cuerpoP0(t)); }
  function poseP(t) { return memo("p" + t, () => { const p = Object.assign({}, cuerpoP(t)); p.manoLejos = manoLejosP(p, t, poseG(t)); return p; }); }
  function cuerpoP0(t) {
    const gr = giroP(t), b = guion(GUION_CUERPO_P, CUERPOS_P, "sol", t);
    const fa = pista(PIES_P.A[0], PIES_P.A[1], t), fb = pista(PIES_P.B[0], PIES_P.B[1], t);
    const der = !gr.espejo, mid = (fa.x + fb.x) / 2, x = mid - 2 * (der ? 1 : -1) * gr.sx;
    const respira = Math.sin(t * 1.8 + 0.4);
    // al sol se mece despacito
    const mece = Math.sin(t * 1.6) * (1 - campana(t, T.baja0 - 0.2, T.sube1 + 0.3)) * (1 - campana(t, T.manoP0 - 0.3, T.giraP2b + 0.3));
    const huele = campana(t, T.huele0, T.huele1) * Math.sin((t - T.huele0) * 9);
    const p = {
      x, suelo: SUELO, s: S, espejo: gr.espejo, sx: gr.sx, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: PD.PELVIS.x + b.pelx + 6 * mece, y: PD.PELVIS.y + b.pel + respira * 1.4 - 0.12 * (fa.h + fb.h) / S },
      torso: b.torso + 0.02 * mece, torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.012 * Math.max(0, huele) },
      piernas: {}, cabeza: { ang: b.cab + 0.03 * mece, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    const cerca = der ? fa : fb, lejos = der ? fb : fa;
    p.piernas.cerca = aPierna(PD, p, cerca, "cerca"); p.piernas.lejos = aPierna(PD, p, lejos, "lejos");
    const e = guion(GUION_CARA_P, CARAS_P, "sol", t);
    p.cara = cara(e, parpadeo(t, PARP_P));
    if (t > T.huele0 && t < T.huele1) p.cara.mofletes = 0.25 * Math.max(0, huele);
    p.manoCerca = manoCercaP(p, t);
    return p;
  }
  // La pajita conserva su longitud. Para sorber, Paradigma acerca el vaso hasta llevar la punta al labio.
  const sorbo = t => K(t, T.sorbo0, T.sorbo0 + 0.3) * (1 - K(t, T.sorbo1 - 0.3, T.sorbo1)) + K(t, T.sorbo2a, T.sorbo2a + 0.3) * (1 - K(t, T.sorbo2b - 0.3, T.sorbo2b));
  const puntaPajita = (c, pp) => P(c.x + 10 * (pp.espejo ? -1 : 1) * pp.sx, c.y - 35);
  function manoCercaP(p, t) {
    const T_ = (x, y, mu, d) => enTronco(PD, p, x, y, mu, d, -1);
    let C = T_(325, 545, 2.35, VASO);
    const ks = sorbo(t);
    if (ks > 0) {
      const labio = aPant(PD, p, PD.boca(p)), d = puntaPajita(P(0,0),p);
      C = mezMano(C, enPant(PD,p,P(labio.x-d.x,labio.y-d.y),2.75,VASO,-1), ks);
    }
    return C;
  }
  // mano lejana: bolsillo · la palma para cazar · lo mira y lo aprieta · lo lleva · se lo pone en la cabeza · bolsillo
  const PALMA_ARRIBA = D5(0.9, 1, 1, 1, 0.95);
  function manoLejosP(p, t, pg) {
    const bL = bolsillo(PD, p, "lejos");
    const T_ = (x, y, mu, d) => enTronco(PD, p, x, y, mu, d, 1);
    let L = bL;
    if (t > T.manoP0) {
      const palma = T_(598, 522, Math.PI - 0.3, PALMA_ARRIBA);
      L = mezManoD(L, palma, K(t, T.manoP0, T.manoP1), 0.3);
      // el golpe del globo: la mano cede y rebota
      if (t > T.caza) { const u = t - T.caza; L = conMano(L, 0, 26 * Math.exp(-u * 7) * Math.sin(u * 15)); }
      // lo sube un poco para mirarlo y lo aprieta
      const mira = T_(522, 522, Math.PI - 0.38, COGE);
      L = mezMano(L, mira, K(t, T.abreP - 0.1, T.abreP + 0.25));
      if (t > T.aprieta && t < T.ceja + 0.1) L.dedos = DD(L.dedos, D5(0.3, 0.3, 0.3, 0.3, 0.3), campana(t, T.aprieta, T.ceja + 0.1));
      // se da la vuelta y lo lleva en alto, como un camarero (así no le pasa por la cara a Guillermo)
      L = mezMano(L, T_(545, 300, Math.PI - 0.25, COGE), K(t, T.giraP1a - 0.05, T.s2b - 0.1));
      // lo lleva hacia Guillermo y se lo pone en la cabeza
      if (t > T.pone0 - 0.25) {
        const c = globoEnCabeza(pg, t), rx = R2 + 7;
        const pon = enPant(PD, p, P(c.x + rx, c.y + 6), Math.PI - 0.1, COGE, 1);
        const encima = enPant(PD, p, P(c.x + rx + 12, c.y - 26), Math.PI - 0.1, COGE, 1);   // primero por encima de la cabeza…
        L = mezMano(L, encima, K(t, T.pone0 - 0.25, T.pone0 + 0.1));
        L = mezMano(L, pon, K(t, T.pone0 + 0.1, T.pone1));                                   // …y luego baja despacito
        if (t > T.suelta2 - 0.08) { L.dedos = DD(L.dedos, PALMA, K(t, T.suelta2 - 0.08, T.suelta2 + 0.05)); L = conMano(L, 30 * K(t, T.suelta2, T.suelta2 + 0.12), -10 * K(t, T.suelta2, T.suelta2 + 0.12)); }
        L = mezManoD(L, bL, K(t, T.suelta2 + 0.05, T.s5b), 0.8);
      }
    }
    return L;
  }

  function pose(t) { return { g: poseG(t), p: poseP(t) }; }

  /* =====================================================================================
   * LOS GLOBOS
   * ===================================================================================== */
  // globo pequeño (rosa) en una mano: se apoya en los dedos
  function enMano(R, p, m, r) { const h = manoPant(R, p, m); return P(h.c.x + h.dir.x * (r * 0.55 + 4), h.c.y + h.dir.y * (r * 0.55 + 4) - 3); }
  // globo grande dentro del cubo (se asoma por la boca)
  const globo2Cubo = () => P(CUBO.x + 4, CUBO.y - 12);
  // globo grande en el abrazo (pantalla)
  function globo2Abrazo(pg, t) { return aPant(G, pg, G.tronco(pg)(abrazoHoja(t))); }
  // corona de la cabeza de Guillermo (con el pelo mojado y aplastado)
  function coronaG(pg) { return enCab(G, pg, P(785, 270)); }
  function formaCabeza(t) {
    const k = fase(t, T.pop - 0.2, T.pop);
    return { sx: 1.05 * (1 + 0.06 * k), sy: 0.92 * (1 + 0.05 * k), j: jiggle2(t) + 0.03 * Math.sin(t * 70) * k };
  }
  function globoEnCabeza(pg, t) {
    const c = coronaG(pg), f = formaCabeza(t);
    return P(c.x, c.y - 1.06 * R2 * f.sy * (1 - f.j));
  }
  // en la palma de Paradigma (encima de la mano)
  const giroEnPalma = t => 0.42 * campana(t, T.abreP - 0.05, T.miraG) * Math.sin(TAU * (t - T.abreP) / 0.55);
  function enPalma(pp, t) {
    const m = manoPant(PD, pp, pp.manoLejos), a = giroEnPalma(t), r = 1.06 * R2 * 0.92 * (1-jiggle2(t));
    return P(m.c.x + 4 * (pp.espejo ? -1 : 1) * pp.sx + Math.sin(a) * r, m.c.y - Math.cos(a) * r);
  }
  // al llevarlo con la mano por el lado
  function enLado(pp) { const m = manoPant(PD, pp, pp.manoLejos); return P(m.c.x - (R2 + 7) * (pp.espejo ? 1 : -1), m.c.y - 6); }

  // bamboleo (aplastado que se amortigua) de cada globo
  function rebotes(t, lista) { let q = 0; for (const [t0, a, w, d] of lista) if (t > t0) { const u = t - t0; q += a * Math.exp(-u * d) * Math.sin(u * w); } return q; }
  const jiggle1 = t => rebotes(t, [[T.saca1 - 0.1, 0.12, 22, 6], [T.pasa1, 0.18, 24, 7], [T.p1b, 0.06, 22, 8], [T.p2b, 0.06, 22, 8], [T.p3b, 0.06, 22, 8], [T.patada, 0.12, 24, 7]]);
  const jiggle2 = t => rebotes(t, [[T.coge + 0.05, 0.2, 18, 4], [T.saca2, 0.12, 18, 5], [T.abraza, 0.16, 20, 5], [T.r1b, 0.07, 20, 6], [T.r2b, 0.07, 20, 6],
    [T.agacha1, 0.1, 20, 6], [T.caza, 0.3, 20, 5], [T.aprieta, -0.2, 16, 4], [T.suelta2 - 0.02, 0.22, 20, 4.5], [T.levanta0 + 0.15, 0.08, 16, 5], [T.alivio, 0.1, 18, 4]]);

  let REL1 = null, REL2 = null, CAZA2 = null;
  // trayectoria del globo pequeño: de la mano al pilar, pasando por encima de la cabeza de Paradigma
  function vuelo1(t) {
    const a = REL1, b = P(IMPACTO.x - R1 * 1.06, IMPACTO.y), u = fase(t, T.lanza, T.choca);
    const alto = 34, x = lerp(a.x,b.x,u), y = lerp(a.y,b.y,u) - alto * 4 * u * (1-u);
    const ang = Math.atan2(b.y-a.y-4*alto*(1-2*u), b.x-a.x);
    return { c: P(x,y), u, ang };
  }
  // trayectoria del globo grande: bombeado a dos manos hasta la palma de Paradigma
  function vuelo2(t) {
    const a = REL2, b = CAZA2, u = fase(t, T.suelta, T.caza);
    const ctrl = P(b.x + 12, -146);
    const v = 1 - u;
    return { c: P(v * v * a.x + 2 * u * v * ctrl.x + u * u * b.x, v * v * a.y + 2 * u * v * ctrl.y + u * u * b.y), u,
      vel: P(2 * v * (ctrl.x - a.x) + 2 * u * (b.x - ctrl.x), 2 * v * (ctrl.y - a.y) + 2 * u * (b.y - ctrl.y)) };
  }

  // estado del globo pequeño: { c, capa: "cubo" | "manoL" | "manoC" | "aire" | "aplasta" | null, ... }
  function globo1(t, pg) {
    if (t < T.saca0) return { capa: "cubo" };
    if (t < T.pasa0 + 0.04) return { capa: "manoL", c: enMano(G, pg, pg.manoLejos, R1) };
    if (t < T.pasa1) {
      const a = enMano(G, poseG(T.pasa0 + 0.04), poseG(T.pasa0 + 0.04).manoLejos, R1), b = enMano(G, poseG(T.pasa1), poseG(T.pasa1).manoCerca, R1);
      const u = fase(t, T.pasa0 + 0.04, T.pasa1);
      return { capa: "aire", c: P(lerp(a.x, b.x, u), lerp(a.y, b.y, u) - 34 * 4 * u * (1 - u)), giro: u * TAU };
    }
    if (t < T.lanza) return { capa: "manoC", c: enMano(G, pg, pg.manoCerca, R1) };
    if (t < T.choca) {
      const v = vuelo1(t), entra = K(v.u,0,0.12), sale = K(v.u,0.8,1);
      return { capa: "aire", c: v.c, estira: 0.3 * entra * (1-sale), ang: lerp(Math.PI / 2,lerp(v.ang,0,sale),entra) };
    }
    if (t < T.revienta1) { const k = fase(t,T.choca,T.revienta1); return { capa: "aplasta", c: P(IMPACTO.x - 1.06 * R1 * (1 - 0.55 * k), IMPACTO.y), k }; }
    return { capa: null };
  }
  // estado del globo grande
  function globo2(t, pg, pp) {
    if (t < T.coge) return { capa: "cubo" };
    // colgando del nudo: se balancea y se estira con el peso (todo se apaga al llegar al abrazo)
    const colgado = (tt, gp) => {
      const m = manoPant(G, gp, gp.manoLejos), apaga = 1 - K(tt, T.saca2 - 0.32, T.saca2 - 0.1);
      const sw = 0.25 * Math.sin((tt - T.coge) * 7) * Math.exp(-(tt - T.coge) * 1.5) * apaga;
      const estira = 0.16 * campana(tt, T.coge, T.saca2 - 0.1);
      const lar = 1.24 * R2 * (1+estira) * (1-jiggle2(tt));
      return { c: P(m.c.x + Math.sin(sw) * lar, m.c.y + Math.cos(sw) * lar), estira, ang: -Math.PI / 2 - sw };
    };
    if (t < T.saca2 - 0.1) return Object.assign({ capa: "cuelga" }, colgado(t, pg));
    if (t < T.suelta) {
      const ab = globo2Abrazo(pg, t);
      if (t < T.abraza) {
        const c0 = colgado(T.saca2 - 0.1, poseG(T.saca2 - 0.1)).c;
        return { capa: "abrazo", c: P(lerp(c0.x, ab.x, K(t, T.saca2 - 0.1, T.abraza)), lerp(c0.y, ab.y, K(t, T.saca2 - 0.1, T.abraza))) };
      }
      return { capa: "abrazo", c: ab };
    }
    if (t < T.caza) { const v = vuelo2(t); return { capa: "aire", c: v.c, estira: 0.22 * Math.min(1, Math.hypot(v.vel.x, v.vel.y) / 900), ang: Math.atan2(v.vel.y, v.vel.x) }; }
    if (t < T.pone0 - 0.3) return { capa: "palma", c: enPalma(pp, t) };
    if (t < T.suelta2) {   // de encima de la palma pasa a cogerlo por un lado
      const a = enPalma(pp, t), b = enLado(pp), k = K(t, T.pone0 - 0.3, T.pone0 - 0.05);
      return { capa: "lleva", c: P(lerp(a.x, b.x, k), lerp(a.y, b.y, k)) };
    }
    if (t < T.pop) return { capa: "cabeza", c: globoEnCabeza(pg, t) };
    return { capa: null };
  }

  function dibGlobo(g, c, r, col, def) {
    const j = def.j || 0, est = def.estira || 0;
    g.save(); g.translate(c.x, c.y);
    // aplastado / estirado (en la dirección ang)
    const ang = def.ang ?? -Math.PI / 2;
    g.rotate(ang + Math.PI / 2);
    const sy = (1 + est) * (1 - j) * (def.sy || 1), sx = (1 / (1 + est * 0.6)) * (1 + j * 0.8) * (def.sx || 1);
    g.scale(sx, sy);
    // nudo (hacia arriba en este marco, «detrás» del globo)
    g.lineJoin = "round"; g.lineCap = "round";
    g.beginPath(); g.moveTo(-r * 0.16, -r * 0.98); g.lineTo(r * 0.16, -r * 0.98); g.lineTo(r * 0.24, -r * 1.24); g.lineTo(-r * 0.24, -r * 1.24); g.closePath();
    g.fillStyle = col; g.fill(); g.lineWidth = 1.6; g.strokeStyle = TINTA; g.stroke();
    // cuerpo
    const cuerpo = () => { g.beginPath(); g.moveTo(0, -r * 1.0); g.bezierCurveTo(r * 0.62, -r * 1.02, r * 1.02, -r * 0.42, r * 1.0, r * 0.12);
      g.bezierCurveTo(r * 0.98, r * 0.72, r * 0.52, r * 1.06, 0, r * 1.06); g.bezierCurveTo(-r * 0.52, r * 1.06, -r * 0.98, r * 0.72, -r * 1.0, r * 0.12);
      g.bezierCurveTo(-r * 1.02, -r * 0.42, -r * 0.62, -r * 1.02, 0, -r * 1.0); g.closePath(); };
    const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.15);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.25, col); gr.addColorStop(1, def.oscuro || "#8a1d4a");
    cuerpo(); g.fillStyle = gr; g.fill();
    // agua dentro: la mitad de abajo algo más oscura, con la línea que se mece
    g.save(); cuerpo(); g.clip();
    const ola = 0.12 * Math.sin((def.t || 0) * 9) * r;
    g.beginPath(); g.moveTo(-r * 1.2, r * 0.1 + ola); g.quadraticCurveTo(0, r * 0.1 - ola * 1.5, r * 1.2, r * 0.1 - ola); g.lineTo(r * 1.2, r * 1.3); g.lineTo(-r * 1.2, r * 1.3); g.closePath();
    g.fillStyle = "rgba(40,20,90,0.22)"; g.fill();
    g.strokeStyle = "rgba(255,255,255,0.5)"; g.lineWidth = Math.max(1, r * 0.08); g.beginPath(); g.moveTo(-r * 0.8, r * 0.1 + ola); g.quadraticCurveTo(0, r * 0.1 - ola * 1.5, r * 0.8, r * 0.1 - ola); g.stroke();
    g.restore();
    cuerpo(); g.lineWidth = Math.max(1.8, r * 0.1); g.strokeStyle = TINTA; g.stroke();
    // brillos
    g.fillStyle = "rgba(255,255,255,0.85)"; g.beginPath(); g.ellipse(-r * 0.42, -r * 0.45, r * 0.2, r * 0.12, -0.7, 0, TAU); g.fill();
    g.beginPath(); g.arc(-r * 0.16, -r * 0.68, r * 0.06, 0, TAU); g.fill();
    g.restore();
  }
  function pintaGlobo1(g, s, t) {
    if (!s.c) return;
    const j = jiggle1(t);
    if (s.capa === "aplasta") { dibGlobo(g, s.c, R1, COL1, { ang: Math.PI, sx: 1 + 0.9 * s.k, sy: 1 - 0.55 * s.k, oscuro: "#8a1d4a", t }); return; }
    dibGlobo(g, s.c, R1, COL1, { j: s.capa === "aire" ? 0 : j, estira: s.estira || 0, ang: s.capa === "aire" && s.ang !== undefined ? s.ang + Math.PI : -Math.PI / 2 + (s.giro || 0), oscuro: "#8a1d4a", t });
  }
  function pintaGlobo2(g, s, t) {
    if (!s.c) return;
    const j = jiggle2(t);
    const def = { j: s.capa === "aire" ? 0 : j, estira: s.estira || 0, ang: s.ang !== undefined ? (s.capa === "aire" ? s.ang + Math.PI : s.ang) : -Math.PI / 2, oscuro: "#9a3a06", t };
    if (s.capa === "palma" || s.capa === "lleva" || s.capa === "cabeza") def.sy = 0.92, def.sx = 1.05;
    // Paradigma lo gira en la palma para mirarlo
    if (s.capa === "palma") def.ang += giroEnPalma(t);
    // tiembla antes de reventar
    if (s.capa === "cabeza") Object.assign(def, formaCabeza(t));
    dibGlobo(g, s.c, R2, COL2, def);
  }

  /* =====================================================================================
   * AGUA: vuelta del agua desde el pilar, salpicones, gotas, charcos
   * ===================================================================================== */
  let CABEZA_MOJA = null;                                    // cabeza de Guillermo cuando le cae el agua
  function vueltaAgua(u) {                                   // curva del pilar a la cabeza de Guillermo
    const a = IMPACTO, b = CABEZA_MOJA, c = P((a.x + b.x) / 2 + 30, -20);
    const v = 1 - u; return P(v * v * a.x + 2 * u * v * c.x + u * u * b.x, v * v * a.y + 2 * u * v * c.y + u * u * b.y);
  }
  const AZUL = "#bfe6ff", AZUL2 = "#7cc4f2", TINTA_AGUA = "#1d3b52";
  function gota(g, x, y, s, a = 1, ang = 0) {
    if (a <= 0.01 || s <= 0.3) return;
    g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(ang);
    g.beginPath(); g.moveTo(0, -s * 1.7); g.quadraticCurveTo(s, 0, 0, s); g.quadraticCurveTo(-s, 0, 0, -s * 1.7);
    g.fillStyle = AZUL; g.fill(); g.lineWidth = Math.max(0.8, s * 0.32); g.strokeStyle = TINTA_AGUA; g.stroke();
    g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(-s * 0.3, -s * 0.15, s * 0.22, s * 0.35, 0, 0, TAU); g.fill();
    g.restore();
  }
  // tubo de agua de dibujos: cadena de círculos (contorno, relleno y brillo)
  function tubo(g, pts, rad) {
    g.fillStyle = TINTA_AGUA;
    for (let i = 0; i < pts.length; i++) { g.beginPath(); g.arc(pts[i].x, pts[i].y, rad[i] + 2.2, 0, TAU); g.fill(); }
    g.fillStyle = AZUL;
    for (let i = 0; i < pts.length; i++) { g.beginPath(); g.arc(pts[i].x, pts[i].y, rad[i], 0, TAU); g.fill(); }
    g.fillStyle = "rgba(255,255,255,0.9)";
    for (let i = 0; i < pts.length; i += 2) if (rad[i] > 4) { g.beginPath(); g.arc(pts[i].x - rad[i] * 0.35, pts[i].y - rad[i] * 0.4, rad[i] * 0.22, 0, TAU); g.fill(); }
  }
  // chorro que vuelve por el aire (cabeza gorda y cola que se afina)
  function dibVuelta(g, t) {
    if (t < T.vuelve0 || t > T.moja + 0.04) return;
    const u = entrada(fase(t, T.vuelve0, T.moja)) * 0.7 + 0.3 * fase(t, T.vuelve0, T.moja);
    const N = 44, pts = [], rad = [];
    for (let i = 0; i <= N; i++) {
      const k = i / N, uu = Math.max(0, u - 0.36 * (1 - k)); pts.push(vueltaAgua(uu));
      rad.push((2 + 19 * Math.pow(k, 1.6)) * (1 + 0.14 * Math.sin(t * 38 + i * 0.7)) * Math.min(1, u * 6));
    }
    g.save(); g.globalAlpha = 1 - fase(t, T.moja, T.moja + 0.04);
    tubo(g, pts, rad);
    // gotas que se le escapan
    for (let k = 0; k < 14; k++) {
      const ub = 0.1 + 0.85 * hash(k * 3.3 + 1); if (u < ub) continue;
      const dt = (u - ub) * 0.5, q = vueltaAgua(ub), x = q.x + (hash(k * 5.1) - 0.5) * 30 * dt * 4, y = q.y + 900 * dt * dt + (hash(k * 7.7) - 0.6) * 20;
      if (y < SUELO) gota(g, x, y, 2.5 + 2.5 * hash(k * 1.7), 1, 0);
    }
    g.restore();
  }
  // estallido de gotas desde un punto (salpicón): n gotas con gravedad
  function salpicon(g, t, t0, c, n, vel, semilla, dirx = 0, arriba = 1) {
    const u = t - t0; if (u < 0 || u > 0.9) return;
    for (let k = 0; k < n; k++) {
      const a = -Math.PI / 2 + (hash(k * 2.3 + semilla) - 0.5) * 3.1 * arriba + dirx * 0.9;
      const v = vel * (0.45 + 0.7 * hash(k * 4.1 + semilla));
      const x = c.x + Math.cos(a) * v * u, y = c.y + Math.sin(a) * v * u + 980 * u * u;
      if (y > SUELO + 4) continue;
      const vy = Math.sin(a) * v + 1960 * u, vx = Math.cos(a) * v;
      gota(g, x, y, 2.4 + 3.2 * hash(k * 6.7 + semilla), 1 - fase(u, 0.5, 0.9), Math.atan2(vy, vx) - Math.PI / 2);
    }
  }
  // el agua que le cae encima: varios chorros que bajan de la cabeza (hc) a los pies (px)
  function cascada(g, t, t0, hc, px, ancho, semilla) {
    const u0 = t - t0; if (u0 <= 0 || u0 > 0.7) return;
    const y0 = hc.y - 40;
    const cx = y => lerp(hc.x, px, clamp((y - hc.y) / 260));
    const an = y => ancho * (0.45 + 0.55 * clamp((y - hc.y) / 260));
    g.save(); g.globalAlpha = 1 - fase(u0, 0.5, 0.7);
    for (let k = 0; k < 7; k++) {
      const u = u0 - 0.06 * hash(k * 3.1 + semilla); if (u <= 0) continue;
      const f = -1 + 2 * (k + 0.2 + 0.6 * hash(k * 7.3 + semilla)) / 7, v = 1500 + 400 * hash(k * 1.9 + semilla);
      const top = y0 + 1200 * u * u, bot = Math.min(SUELO - 2, y0 + 10 + v * u + 500 * u * u);
      if (bot - top < 3) continue;
      const M = Math.max(2, Math.ceil((bot - top) / 4)), pts = [], rad = [];
      const r0 = 7.5 + 4 * hash(k * 5.7 + semilla);
      for (let i = 0; i <= M; i++) {
        const y = lerp(top, bot, i / M), x = cx(y) + f * an(y) + 3 * Math.sin(y * 0.06 + k + t * 20);
        pts.push(P(x, y)); rad.push(r0 * (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, i / M * 1.1))) * (i === M ? 1.35 : 1));
      }
      tubo(g, pts, rad);
    }
    g.restore();
    // al llegar al suelo, salpica a los lados
    const tg = t0 + (Math.sqrt(1700 * 1700 + 4 * 500 * (SUELO - 2 - y0 - 10)) - 1700) / (2 * 500);
    salpicon(g, t, tg, P(px, SUELO - 2), 14, 210, semilla + 31, 0, 1.4);
  }
  // corona de agua (anillo de puntas) que se abre y se desvanece
  function corona(g, t, t0, c, r0, semilla, ang0 = -Math.PI / 2, abertura = Math.PI * 1.2) {
    const u = fase(t, t0, t0 + 0.32); if (u <= 0 || u >= 1) return;
    const r = r0 * (0.5 + 1.2 * salida(u)), a = (1 - u) * Math.min(1, u * 8);
    g.save(); g.globalAlpha = a; g.lineJoin = "round";
    g.beginPath();
    const n = 9;
    for (let i = 0; i <= n * 2; i++) {
      const aa = ang0 - abertura / 2 + abertura * i / (n * 2), rr = i % 2 ? r * 0.55 : r * (1 + 0.25 * hash(i + semilla));
      const x = c.x + Math.cos(aa) * rr, y = c.y + Math.sin(aa) * rr;
      if (i) g.lineTo(x, y); else g.moveTo(x, y);
    }
    g.lineTo(c.x, c.y); g.closePath();
    g.fillStyle = AZUL; g.fill(); g.lineWidth = 2.2; g.strokeStyle = TINTA_AGUA; g.stroke();
    g.restore();
  }
  // trocitos de goma al reventar
  function gomas(g, t, t0, c, col, n, semilla) {
    const u0 = t - t0; if (u0 < 0) return;
    for (let k = 0; k < n; k++) {
      const a = -Math.PI / 2 + (hash(k * 3.7 + semilla) - 0.5) * 2.8, v = 160 + 160 * hash(k * 1.9 + semilla);
      // se quedan en el suelo donde caen
      const sv = Math.sin(a) * v, uL = (-sv + Math.sqrt(sv * sv + 2800 * (SUELO + 2 - c.y))) / 1400, u = Math.min(u0, uL);
      const x = c.x + Math.cos(a) * v * u, y = Math.min(SUELO + 2, c.y + sv * u + 700 * u * u);
      g.save(); g.translate(x, y); g.rotate(u * (6 + 8 * hash(k)) * (k % 2 ? 1 : -1)); g.scale(1, 0.7 + 0.3 * Math.sin(u * 20 + k));
      const s = 3.5 + 3 * hash(k * 9.1 + semilla);
      g.beginPath(); g.moveTo(-s, -s * 0.4); g.lineTo(-s * 0.2, -s); g.lineTo(s, -s * 0.2); g.lineTo(s * 0.4, s * 0.8); g.lineTo(-s * 0.7, s * 0.5); g.closePath();
      g.fillStyle = col; g.fill(); g.lineWidth = 1.2; g.strokeStyle = TINTA; g.stroke();
      g.restore();
    }
  }

  /* --- gotas que caen de Guillermo cuando está mojado --- */
  const FUENTES = [   // [lado/parte, periodo, fase]
    ["barbilla", 0.46, 0.1], ["nariz", 0.71, 0.4], ["manoC", 0.52, 0.2], ["manoL", 0.57, 0.65], ["bajoC", 0.63, 0.3], ["bajoL", 0.59, 0.8], ["pelo", 0.66, 0.5], ["pelo2", 0.77, 0.15]
  ];
  const CACHE_F = new Map();
  function fuentes(te) {
    const k = Math.round(te * 60);
    if (CACHE_F.has(k)) return CACHE_F.get(k);
    if (CACHE_F.size > 2000) CACHE_F.clear();
    const p = poseG(k / 60), r = {};
    r.barbilla = enCab(G, p, P(810, 852)); r.nariz = enCab(G, p, P(958, 640));
    r.pelo = enCab(G, p, P(560, 600)); r.pelo2 = enCab(G, p, P(1040, 560));
    const mc = manoPant(G, p, p.manoCerca), ml = manoPant(G, p, p.manoLejos);
    r.manoC = P(mc.c.x + mc.dir.x * 14, mc.c.y + mc.dir.y * 14 + 4); r.manoL = P(ml.c.x + ml.dir.x * 14, ml.c.y + ml.dir.y * 14 + 4);
    const T_ = G.tronco(p); r.bajoC = aPant(G, p, T_(P(150, 790))); r.bajoL = aPant(G, p, T_(P(350, 800)));
    CACHE_F.set(k, r);
    return r;
  }
  function goteo(g, t) {
    if (t < T.moja + 0.3) return;
    const intensidad = t < T.pop ? 1 - 0.45 * fase(t, T.moja + 1.5, T.moja + 4) : 1.4;
    for (const [nom, per0, ph] of FUENTES) {
      const per = per0 / intensidad;
      const n0 = Math.floor((t - T.moja - 0.3 - 0.75) / per) - 1;
      for (let n = Math.max(0, n0); ; n++) {
        const te = T.moja + 0.3 + (n + ph) * per; if (te > t) break;
        const u = t - te, q = fuentes(te)[nom];
        const y = q.y + 0.5 * 1800 * u * u + 3 * Math.min(1, u * 20);
        if (y > SUELO + 2) { // anillito al caer
          const uf = u - Math.sqrt(2 * Math.max(0, SUELO - q.y) / 1800); if (uf > 0.22) continue;
          g.save(); g.globalAlpha = 1 - uf / 0.22; g.strokeStyle = "rgba(220,240,255,0.9)"; g.lineWidth = 1.5;
          g.beginPath(); g.ellipse(q.x, SUELO + 2, 3 + 30 * uf, 1 + 7 * uf, 0, 0, TAU); g.stroke(); g.restore();
          continue;
        }
        const s = (nom === "nariz" ? 3.6 : 2.8) * Math.min(1, u * 12 + 0.3);
        gota(g, q.x, y, s, 1, 0);
      }
    }
  }
  // charcos (crecen y se quedan)
  function charco(g, x, y, rx, k) {
    if (k <= 0.01) return;
    g.save(); g.globalAlpha = 0.85 * Math.min(1, k * 2);
    g.fillStyle = "rgba(120,190,230,0.55)"; g.beginPath(); g.ellipse(x, y, rx * k, rx * 0.16 * k, 0, 0, TAU); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 2; g.beginPath(); g.ellipse(x - rx * 0.2 * k, y - 1, rx * 0.4 * k, rx * 0.05 * k, 0, Math.PI * 1.1, Math.PI * 1.8); g.stroke();
    g.restore();
  }
  function charcos(g, t) {
    charco(g, 445, SUELO + 6, 62, salida(fase(t, T.moja, T.moja + 1.2)) * 0.9 + 0.1 * fase(t, T.moja + 1.2, T.gira1a));
    charco(g, 248, SUELO + 6, 34, salida(fase(t, T.q3b, T.gira2a + 0.6)));
    charco(g, 322, SUELO + 6, 70, 0.4 * salida(fase(t, T.r2b, T.pop)) + 0.6 * salida(fase(t, T.pop, T.pop + 1.2)));
    charco(g, 846, SUELO + 6, 36, salida(fase(t, T.choca + 0.1, T.choca + 1.6)));
  }

  /* =====================================================================================
   * GUILLERMO MOJADO: pelo aplastado (retrato) y camiseta empapada (hoja), como en 00097
   * ===================================================================================== */
  const PIEL_CAB = [[806,850],[802,846],[766,842],[754,834],[746,834],[742,838],[734,826],[726,826],[718,814],[710,814],[704,808],[708,804],[702,798],[698,802],[690,798],[684,792],[682,782],[674,782],[662,774],[656,768],[660,764],[654,758],[650,762],[634,746],[630,746],[624,740],[624,732],[604,716],[608,712],[604,708],[604,692],[596,684],[596,668],[582,670],[570,654],[566,658],[556,648],[560,640],[558,638],[554,642],[544,632],[548,624],[532,604],[532,596],[528,592],[528,572],[532,568],[528,564],[532,560],[528,552],[540,536],[540,528],[548,516],[562,503],[570,499],[590,499],[624,532],[624,540],[630,550],[636,536],[632,532],[640,524],[640,516],[648,501],[676,477],[676,469],[684,461],[680,457],[690,447],[718,435],[734,423],[744,429],[728,461],[730,467],[762,451],[798,427],[806,431],[823,431],[839,443],[843,439],[851,439],[867,455],[875,455],[881,461],[869,481],[841,509],[843,511],[879,503],[903,487],[911,487],[917,493],[901,524],[893,532],[895,534],[931,514],[947,499],[955,503],[969,520],[965,596],[949,620],[953,624],[937,644],[937,652],[925,676],[909,732],[899,738],[877,764],[885,772],[875,782],[867,778],[861,788],[849,796],[825,832],[829,836],[819,846],[815,842]];
  const camino = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
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
    return { borra, puas };
  })();
  function capaCabG(g, t, est) {
    PELO.borra(g);
    PELO.puas(g, est.w, est.abajo, t, est.oscila);
    g.save(); g.lineCap = "round";
    g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 5;
    for (const [x0, y0, x1, y1] of [[650, 560, 662, 640], [930, 600, 936, 660], [700, 720, 712, 770]]) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
    for (const [x, y, s] of [[620, 640, 8], [960, 560, 7], [840, 800, 7], [700, 610, 6]]) gota(g, x, y + 4 * Math.sin(t * 3 + x), s, 0.95);
    g.restore();
  }
  function capaTroncoG(g) {
    g.save(); g.lineCap = "round";
    g.strokeStyle = "rgba(160,200,235,0.45)"; g.lineWidth = 9;
    for (const [x0, y0, x1, y1] of [[150, 360, 170, 520], [250, 330, 262, 560], [330, 380, 318, 600], [190, 610, 230, 700]]) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + 12, (y0 + y1) / 2, x1, y1); g.stroke(); }
    g.strokeStyle = "rgba(255,255,255,0.55)"; g.lineWidth = 3.5;
    for (const [x0, y0, x1, y1] of [[158, 380, 172, 470], [256, 360, 262, 470], [326, 420, 318, 520]]) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
    g.restore();
  }
  const lienzo = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  let CAPA = null;
  // dibuja a un personaje con su giro aplastado (sx) alrededor de sus pies
  function dibuja(R, g, p, t) {
    const sx = p.sx ?? 1;
    if (Math.abs(sx - 1) < 1e-4) { R.dibujar(g, p, t); return; }
    g.save(); g.translate(p.x, p.suelo); g.scale(sx, 1); g.translate(-p.x, -p.suelo); R.dibujar(g, p, t); g.restore();
  }
  function dibujaMojado(g, p, t, tinte, sinTinte = []) {
    const c = g.canvas;
    if (!CAPA || CAPA.width !== c.width || CAPA.height !== c.height) CAPA = lienzo(c.width, c.height);
    const o = CAPA.getContext("2d"), Mt = g.getTransform();
    const caja = [P(p.x - 190, 60), P(p.x + 190, 60), P(p.x + 190, SUELO + 30), P(p.x - 190, SUELO + 30)].map(q => Mt.transformPoint(new DOMPoint(q.x, q.y)));
    const x0 = Math.max(0, Math.floor(Math.min(...caja.map(q => q.x))) - 2), y0 = Math.max(0, Math.floor(Math.min(...caja.map(q => q.y))) - 2);
    const x1 = Math.min(c.width, Math.ceil(Math.max(...caja.map(q => q.x))) + 2), y1 = Math.min(c.height, Math.ceil(Math.max(...caja.map(q => q.y))) + 2);
    if (x1 <= x0 || y1 <= y0) return;
    o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1; o.globalCompositeOperation = "source-over";
    o.clearRect(x0, y0, x1 - x0, y1 - y0);
    o.setTransform(Mt);
    dibuja(G, o, p, t);
    if (tinte > 0.004) {
      o.save(); o.globalCompositeOperation = "source-atop";
      // lo que lleva en las manos (el globo) no se moja: se queda fuera del tinte
      if (sinTinte.length) { o.beginPath(); o.rect(p.x - 230, -10, 460, 720); for (const q of sinTinte) { o.moveTo(q.x + q.r, q.y); o.arc(q.x, q.y, q.r, 0, TAU); } o.clip("evenodd"); }
      o.fillStyle = `rgba(18,52,96,${0.16 * tinte})`; o.fillRect(p.x - 220, 0, 440, 700);
      const yc = aPant(G, p, G.tronco(p)(G.PELVIS)).y - 18;
      const vq = o.createLinearGradient(0, yc, 0, yc + 30); vq.addColorStop(0, "rgba(10,30,80,0)"); vq.addColorStop(1, `rgba(10,30,80,${0.3 * tinte})`);
      o.fillStyle = vq; o.fillRect(p.x - 220, yc, 440, 700 - yc);
      o.restore();
    }
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(CAPA, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0); g.restore();
  }

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  let fondo = null;
  function creaFondo() {
    const c = lienzo(W, H), g = c.getContext("2d");
    // cielo de verano
    const cg = g.createLinearGradient(0, 0, 0, PARED); cg.addColorStop(0, "#5fb8f2"); cg.addColorStop(0.7, "#a9ddfa"); cg.addColorStop(1, "#d8f2ff");
    g.fillStyle = cg; g.fillRect(0, 0, W, PARED);
    // sol arriba a la derecha (al que mira Paradigma)
    const sg = g.createRadialGradient(930, 46, 10, 930, 46, 260); sg.addColorStop(0, "rgba(255,255,235,1)"); sg.addColorStop(0.12, "rgba(255,250,200,0.95)"); sg.addColorStop(0.35, "rgba(255,240,170,0.35)"); sg.addColorStop(1, "rgba(255,240,170,0)");
    g.fillStyle = sg; g.fillRect(0, 0, W, PARED);
    g.fillStyle = "#fffbe0"; g.beginPath(); g.arc(930, 46, 30, 0, TAU); g.fill();
    // nubes
    for (const [x, y, s] of [[140, 70, 1], [420, 44, 0.8], [640, 92, 0.65]]) nube(g, x, y, s);
    // copas de árboles detrás de la tapia
    for (let i = 0; i < 9; i++) { const x = 30 + i * 105 + 20 * hash(i), y = 250 + 18 * hash(i + 4), r = 46 + 20 * hash(i + 9);
      g.fillStyle = i % 2 ? "#5d9e4a" : "#6aad55"; g.beginPath(); g.arc(x, y, r, 0, TAU); g.arc(x + r * 0.7, y + 12, r * 0.75, 0, TAU); g.arc(x - r * 0.7, y + 14, r * 0.7, 0, TAU); g.fill(); }
    // tapia encalada con tejas
    const TOP = 300;
    g.fillStyle = "#f2e6d2"; g.fillRect(0, TOP, PILAR.lado, PARED - TOP);
    g.fillStyle = "rgba(160,120,80,0.08)"; for (let i = 0; i < 60; i++) { g.beginPath(); g.ellipse(hash(i) * 850, TOP + 20 + hash(i + 50) * 180, 20 + 30 * hash(i + 7), 6 + 8 * hash(i + 3), 0, 0, TAU); g.fill(); }
    g.fillStyle = "rgba(120,80,40,0.18)"; g.fillRect(0, PARED - 18, PILAR.lado, 18);
    for (let x = -10; x < PILAR.lado; x += 26) { g.fillStyle = "#b9542f"; g.beginPath(); g.moveTo(x, TOP); g.quadraticCurveTo(x + 13, TOP - 16, x + 26, TOP); g.lineTo(x + 26, TOP + 8); g.lineTo(x, TOP + 8); g.closePath(); g.fill();
      g.strokeStyle = "#7a3018"; g.lineWidth = 1.5; g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(0, TOP + 8); g.lineTo(PILAR.lado, TOP + 8); g.stroke();
    // buganvilla por la tapia (izquierda)
    for (let i = 0; i < 70; i++) { const x = 10 + hash(i * 3.1) * 250, y = TOP - 30 + hash(i * 5.7) * 120 + x * 0.1;
      g.fillStyle = ["#d63a8f", "#e8509f", "#b82577", "#5f9b3f"][i % 4]; g.beginPath(); g.arc(x, y, 7 + 6 * hash(i), 0, TAU); g.fill(); }
    // tendedero con ropa (entre la buganvilla y el pilar, alto)
    tendedero(g);
    // piscinita hinchable con su patito
    piscina(g, 470, 494);
    // macetas junto a la tapia
    maceta(g, 330, 505, "#c9663b", "#6e3fa8"); maceta(g, 720, 505, "#c9663b", "#e04a3a");
    // césped
    const hg = g.createLinearGradient(0, PARED, 0, H); hg.addColorStop(0, "#7cc35a"); hg.addColorStop(1, "#58a33c");
    g.fillStyle = hg; g.fillRect(0, PARED, W, H - PARED);
    g.fillStyle = "rgba(255,255,255,0.06)"; for (let x = -60; x < W; x += 120) { g.beginPath(); g.moveTo(x, PARED); g.lineTo(x + 60, PARED); g.lineTo(x + 140, H); g.lineTo(x + 40, H); g.closePath(); g.fill(); }
    g.strokeStyle = "rgba(40,90,30,0.5)"; g.lineWidth = 1.4;
    for (let i = 0; i < 220; i++) { const x = hash(i * 1.3) * W, y = PARED + 6 + hash(i * 2.9) * (H - PARED - 6); g.beginPath(); g.moveTo(x, y); g.lineTo(x - 2, y - 6); g.moveTo(x + 2, y); g.lineTo(x + 4, y - 5); g.stroke(); }
    // pilar de ladrillo con su remate y la manguera
    pilar(g);
    // mesita con el cubo
    mesa(g);
    // viñeta suave
    const v = g.createRadialGradient(512, 300, 300, 512, 320, 800); v.addColorStop(0, "rgba(20,30,10,0)"); v.addColorStop(1, "rgba(20,30,10,0.32)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    return c;
  }
  function nube(g, x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = "rgba(255,255,255,0.92)";
    g.beginPath(); g.arc(0, 0, 26, 0, TAU); g.arc(30, -10, 32, 0, TAU); g.arc(64, 0, 26, 0, TAU); g.arc(34, 10, 28, 0, TAU); g.fill();
    g.fillStyle = "rgba(200,225,245,0.6)"; g.beginPath(); g.ellipse(32, 18, 50, 9, 0, 0, TAU); g.fill(); g.restore();
  }
  function tendedero(g) {
    const x0 = 300, x1 = 640, y0 = 196;
    g.strokeStyle = "#7d6a58"; g.lineWidth = 6; g.lineCap = "round";
    for (const x of [x0, x1]) { g.beginPath(); g.moveTo(x, PARED - 4); g.lineTo(x, y0 - 14); g.stroke(); g.beginPath(); g.moveTo(x - 14, y0 - 12); g.lineTo(x + 14, y0 - 12); g.stroke(); }
    g.strokeStyle = "#e8e8e8"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x0, y0 - 10); g.quadraticCurveTo((x0 + x1) / 2, y0 + 14, x1, y0 - 10); g.stroke();
    const enCuerda = x => { const u = (x - x0) / (x1 - x0); return (1 - u) * (1 - u) * (y0 - 10) + 2 * u * (1 - u) * (y0 + 14) + u * u * (y0 - 10); };
    const prenda = (x, w, h, col, tipo) => {
      const y = enCuerda(x);
      g.save(); g.translate(x, y); g.fillStyle = col; g.strokeStyle = TINTA; g.lineWidth = 1.6;
      g.beginPath();
      if (tipo === "camiseta") { g.moveTo(-w / 2, 0); g.lineTo(-w / 2 - 10, 10); g.lineTo(-w / 2 - 4, 18); g.lineTo(-w / 2 + 2, 14); g.lineTo(-w / 2 + 2, h); g.lineTo(w / 2 - 2, h); g.lineTo(w / 2 - 2, 14); g.lineTo(w / 2 + 4, 18); g.lineTo(w / 2 + 10, 10); g.lineTo(w / 2, 0); g.quadraticCurveTo(0, 8, -w / 2, 0); }
      else if (tipo === "toalla") { g.rect(-w / 2, 0, w, h); }
      else { g.moveTo(-w / 2, 0); g.lineTo(w / 2, 0); g.lineTo(w / 2, h); g.lineTo(w * 0.1, h); g.lineTo(0, h * 0.4); g.lineTo(-w * 0.1, h); g.lineTo(-w / 2, h); }
      g.closePath(); g.fill(); g.stroke();
      if (tipo === "toalla") { g.fillStyle = "rgba(255,255,255,0.75)"; for (let k = 0; k < 3; k++) g.fillRect(-w / 2, 8 + k * 14, w, 5); }
      g.fillStyle = "#f6d34a"; g.fillRect(-w / 2 + 3, -4, 4, 8); g.fillRect(w / 2 - 7, -4, 4, 8);
      g.restore();
    };
    prenda(352, 44, 52, "#3a7bd5", "camiseta"); prenda(418, 36, 60, "#e8743b", "toalla"); prenda(486, 38, 40, "#f1c40f", "corto"); prenda(560, 34, 48, "#2bb39a", "toalla");
  }
  function piscina(g, x, y) {
    g.save(); g.translate(x, y);
    g.fillStyle = "#2f8fd8"; g.beginPath(); g.ellipse(0, 0, 92, 18, 0, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#8fdcff"; g.beginPath(); g.ellipse(0, -2, 76, 11, 0, 0, TAU); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 2; g.beginPath(); g.ellipse(-20, -3, 22, 3, 0, 0, Math.PI); g.stroke();
    g.fillStyle = "#ffd23a"; g.beginPath(); g.ellipse(30, -6, 10, 7, 0, 0, TAU); g.arc(36, -14, 6, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = "#ff8a1e"; g.beginPath(); g.moveTo(41, -14); g.lineTo(47, -13); g.lineTo(41, -11); g.fill();
    g.restore();
  }
  function maceta(g, x, y, col, flor) {
    g.save(); g.translate(x, y);
    g.fillStyle = "#4f8a35"; for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(-16 + i * 4, -44 + 8 * Math.sin(i * 1.7), 6, 16, -0.5 + i * 0.12, 0, TAU); g.fill(); }
    g.fillStyle = flor; for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(-18 + 36 * hash(i * 3 + x), -60 + 22 * hash(i * 5 + x), 5, 0, TAU); g.fill(); }
    g.fillStyle = col; g.beginPath(); g.moveTo(-24, -26); g.lineTo(24, -26); g.lineTo(18, 0); g.lineTo(-18, 0); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.fillStyle = "rgba(0,0,0,0.15)"; g.fillRect(-24, -26, 48, 5);
    g.restore();
  }
  function pilar(g) {
    const { x0, x1, lado, arriba } = PILAR;
    // cara lateral (a la sombra) y cara de delante
    g.fillStyle = "#8c3f26"; g.beginPath(); g.moveTo(lado, arriba + 14); g.lineTo(x0, arriba + 10); g.lineTo(x0, SUELO + 6); g.lineTo(lado, SUELO + 2); g.closePath(); g.fill();
    g.fillStyle = "#b5563a"; g.fillRect(x0, arriba + 10, x1 - x0, SUELO + 6 - arriba - 10);
    // ladrillos
    g.strokeStyle = "rgba(240,210,180,0.55)"; g.lineWidth = 2;
    for (let y = arriba + 10, k = 0; y < SUELO; y += 17, k++) {
      g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
      for (let x = x0 + (k % 2 ? 0 : 22); x < x1; x += 44) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 17); g.stroke(); }
      g.beginPath(); g.moveTo(lado, y + 3); g.lineTo(x0, y); g.stroke();
    }
    g.fillStyle = "rgba(0,0,0,0.08)"; for (let i = 0; i < 40; i++) g.fillRect(x0 + hash(i) * (x1 - x0 - 30), arriba + 20 + hash(i + 9) * 400, 30, 12);
    // remate de piedra
    g.fillStyle = "#e8dcc6"; g.beginPath(); g.moveTo(lado - 10, arriba + 14); g.lineTo(x0 - 6, arriba); g.lineTo(x1 + 8, arriba); g.lineTo(x1 + 8, arriba + 14); g.lineTo(x0 - 6, arriba + 18); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2.2; g.stroke();
    g.beginPath(); g.moveTo(x0 + 6, arriba); g.lineTo(x0 + 22, arriba - 18); g.lineTo(x1 - 6, arriba - 18); g.lineTo(x1 + 8, arriba); g.closePath(); g.fillStyle = "#d8cbb2"; g.fill(); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x0, arriba + 14); g.lineTo(x0, SUELO + 6); g.moveTo(lado, arriba + 16); g.lineTo(lado, SUELO + 2); g.moveTo(x1, arriba + 14); g.lineTo(x1, SUELO + 6); g.stroke();
    // la tapia sigue a la derecha del pilar (más baja)
    g.fillStyle = "#f2e6d2"; g.fillRect(x1, 300, W - x1, PARED - 300);
    // manguera enrollada en su soporte
    g.save(); g.translate(930, 420);
    g.fillStyle = "#555"; g.fillRect(-6, -40, 12, 14);
    for (let i = 0; i < 6; i++) { g.strokeStyle = TINTA; g.lineWidth = 9; g.beginPath(); g.ellipse(0, -6 + i * 2, 34 - i * 2, 26 - i * 1.5, 0, 0, TAU); g.stroke();
      g.strokeStyle = i % 2 ? "#2e9c48" : "#3bb85a"; g.lineWidth = 6; g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = 9; g.beginPath(); g.moveTo(-20, 18); g.bezierCurveTo(-30, 80, -80, 110, -60, 128); g.stroke();
    g.strokeStyle = "#3bb85a"; g.lineWidth = 6; g.stroke();
    g.fillStyle = "#f6c23a"; g.beginPath(); g.ellipse(-58, 128, 9, 5, 0.3, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke();
    g.restore();
  }
  function mesa(g) {
    const { x, y, r } = MESA;
    g.strokeStyle = "#2b2b2b"; g.lineWidth = 4;
    g.beginPath(); g.moveTo(x - r * 0.6, SUELO + 4); g.quadraticCurveTo(x, y + 30, x, y + 6); g.quadraticCurveTo(x, y + 30, x + r * 0.6, SUELO + 4); g.stroke();
    g.beginPath(); g.moveTo(x, y + 6); g.lineTo(x, SUELO); g.stroke();
    g.fillStyle = "#f4f1ea"; g.beginPath(); g.ellipse(x, y, r, 11, 0, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#d9d4c8"; g.fillRect(x - r, y, r * 2, 5); g.strokeRect(x - r, y, r * 2, 5);
  }
  // el cubo (cuerpo detrás y delante) con los globos asomando
  function cuboAtras(g, t) {
    const { x, y, r0, r1, alto } = CUBO;
    g.fillStyle = "#8f9aa3"; g.beginPath(); g.ellipse(x, y, r0, 8, 0, Math.PI, TAU); g.fill();
    // globos que asoman (los de colores); el rosa sale al empezar
    const glob = [[-18, 4, "#3aa0ff", 11], [16, 2, "#5ccf5c", 11], [-2, 8, "#ffd23a", 10]];
    for (const [dx, dy, col, r] of glob) dibGlobo(g, P(x + dx, y + dy - r * 0.4), r, col, { j: 0, ang: -Math.PI / 2 + dx * 0.02, oscuro: "#244a7a", t });
    if (t < T.saca0) dibGlobo(g, globo1Cubo(), R1, COL1, { ang: -Math.PI / 2 - 0.2 * (1-K(t,T.saca0-0.1,T.saca0)), oscuro: "#8a1d4a", t });
    if (t < T.coge) dibGlobo(g, globo2Cubo(), R2, COL2, { ang: -Math.PI / 2 + 0.08 * (1-K(t,T.coge-0.16,T.coge)), oscuro: "#9a3a06", t, j: 0.02 * Math.sin(t * 3) * (1-K(t,T.coge-0.16,T.coge)) });
  }
  function cuboDelante(g) {
    const { x, y, r0, r1, alto } = CUBO;
    g.save(); g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r0, y); g.lineTo(x - r1, y + alto); g.quadraticCurveTo(x, y + alto + 8, x + r1, y + alto); g.lineTo(x + r0, y); g.quadraticCurveTo(x, y + 8, x - r0, y); g.closePath();
    const gg = g.createLinearGradient(x - r0, 0, x + r0, 0); gg.addColorStop(0, "#9aa6ae"); gg.addColorStop(0.35, "#e3e9ec"); gg.addColorStop(1, "#7b868e");
    g.fillStyle = gg; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2.2; g.stroke();
    g.strokeStyle = "rgba(60,70,80,0.5)"; g.lineWidth = 2; for (const k of [0.33, 0.66]) { g.beginPath(); g.moveTo(x - lerp(r0, r1, k), y + alto * k); g.quadraticCurveTo(x, y + alto * k + 7, x + lerp(r0, r1, k), y + alto * k); g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = 2.2; g.beginPath(); g.ellipse(x, y, r0, 8, 0, 0, Math.PI); g.stroke();
    g.strokeStyle = "#555"; g.lineWidth = 2; g.beginPath(); g.moveTo(x - r0, y + 4); g.quadraticCurveTo(x, y + 40, x + r0, y + 4); g.stroke();
    g.restore();
  }
  // mancha de agua en el pilar (se queda) con chorretones
  function manchaPilar(g, t) {
    const k = fase(t, T.revienta1, T.revienta1 + 0.12); if (k <= 0) return;
    g.save();
    g.beginPath(); g.moveTo(PILAR.lado, PILAR.arriba + 14); g.lineTo(PILAR.x1, PILAR.arriba + 10); g.lineTo(PILAR.x1, SUELO + 6); g.lineTo(PILAR.lado, SUELO + 2); g.closePath(); g.clip();
    g.fillStyle = "rgba(70,20,10,0.42)";
    g.beginPath(); for (let i = 0; i <= 16; i++) { const a = i / 16 * TAU, rr = (26 + 12 * hash(i * 2.2)) * salida(k);
      const x = IMPACTO.x + 12 + Math.cos(a) * rr * 1.2, y = IMPACTO.y + 4 + Math.sin(a) * rr; if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.closePath(); g.fill();
    // chorretones que bajan
    for (let i = 0; i < 5; i++) {
      const x = IMPACTO.x - 4 + i * 11, l = (60 + 120 * hash(i * 4.4)) * salida(fase(t, T.revienta1 + 0.05, T.revienta1 + 2.4 + hash(i)));
      g.strokeStyle = "rgba(70,20,10,0.38)"; g.lineWidth = 5 - i * 0.5; g.lineCap = "round";
      g.beginPath(); g.moveTo(x, IMPACTO.y + 20); g.lineTo(x + 2, IMPACTO.y + 20 + l); g.stroke();
      if (l > 20) gota(g, x + 2, IMPACTO.y + 22 + l, 2.6, 0.9);
    }
    // trocitos de goma rosa pegados
    g.fillStyle = COL1; g.strokeStyle = TINTA; g.lineWidth = 1;
    for (const [dx, dy] of [[4, -8], [14, 10], [-2, 16]]) { g.beginPath(); g.moveTo(IMPACTO.x + dx, IMPACTO.y + dy); g.lineTo(IMPACTO.x + dx + 6, IMPACTO.y + dy - 3); g.lineTo(IMPACTO.x + dx + 4, IMPACTO.y + dy + 4); g.closePath(); g.fill(); g.stroke(); }
    g.restore();
  }

  /* --- el girasol (Paradigma lo huele) --- */
  let FLOR = P(760, 300);
  const MACETA_F = P(770, SUELO);
  function girasol(g, t) {
    const sway = 0.04 * Math.sin(t * 1.3) + 0.06 * campana(t, T.huele0, T.huele1 + 0.3) * Math.sin(t * 6);
    const base = P(MACETA_F.x, MACETA_F.y - 52), cab = P(FLOR.x + sway * 40, FLOR.y + Math.abs(sway) * 6);
    // tallo y hojas
    g.save(); g.lineCap = "round";
    g.strokeStyle = TINTA; g.lineWidth = 9; g.beginPath(); g.moveTo(base.x, base.y); g.quadraticCurveTo(base.x + 18, (base.y + cab.y) / 2, cab.x + 6, cab.y + 14); g.stroke();
    g.strokeStyle = "#4f9a35"; g.lineWidth = 6; g.stroke();
    for (const [u, s] of [[0.35, 1], [0.6, -1]]) { const x = lerp(base.x, cab.x, u) + 10, y = lerp(base.y, cab.y, u);
      g.fillStyle = "#5aac3c"; g.beginPath(); g.ellipse(x + s * 18, y, 20, 8, s * 0.5, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.stroke(); }
    // flor (mira hacia la nariz de Paradigma, un poco de lado)
    g.translate(cab.x, cab.y); g.rotate(-0.5 + sway);
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; g.save(); g.rotate(a); g.scale(1, 0.62);
      g.beginPath(); g.ellipse(26, 0, 14, 6, 0, 0, TAU); g.fillStyle = i % 2 ? "#ffcc1f" : "#ffb703"; g.fill(); g.strokeStyle = "#7a4a00"; g.lineWidth = 1.2; g.stroke(); g.restore(); }
    g.beginPath(); g.ellipse(0, 0, 15, 10, 0, 0, TAU); g.fillStyle = "#5b3410"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.8; g.stroke();
    g.fillStyle = "rgba(255,210,120,0.5)"; for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(-8 + 16 * hash(i), -6 + 12 * hash(i + 3), 1.4, 0, TAU); g.fill(); }
    g.restore();
    // maceta
    g.save(); g.translate(MACETA_F.x, MACETA_F.y);
    g.fillStyle = "#c9663b"; g.beginPath(); g.moveTo(-28, -52); g.lineTo(28, -52); g.lineTo(21, 0); g.lineTo(-21, 0); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#b45530"; g.fillRect(-30, -56, 60, 10); g.strokeRect(-30, -56, 60, 10);
    g.restore();
    // polen al olerla
    const kp = campana(t, T.huele0 + 0.1, T.huele1 + 0.2);
    if (kp > 0.02) { g.save(); g.globalAlpha = kp; g.fillStyle = "#ffe066";
      for (let i = 0; i < 7; i++) { const u = ((t - T.huele0) * 0.8 + hash(i)) % 1; g.beginPath(); g.arc(cab.x - 10 - 30 * u + 6 * Math.sin(u * 9 + i), cab.y - 6 - 18 * u, 2, 0, TAU); g.fill(); }
      g.restore(); }
  }

  /* --- la limonada de Paradigma (en su mano cercana) --- */
  function vaso(g, c, t, pp) {
    g.save(); g.translate(c.x, c.y);
    const w = 9, h = 26;
    g.lineJoin = "round";
    g.beginPath(); g.moveTo(-w, -h * 0.55); g.lineTo(w, -h * 0.55); g.lineTo(w * 0.8, h * 0.45); g.lineTo(-w * 0.8, h * 0.45); g.closePath();
    g.fillStyle = "rgba(230,245,255,0.55)"; g.fill();
    g.save(); g.clip(); g.fillStyle = "#ffe46b"; g.fillRect(-w, -h * 0.3, w * 2, h); g.fillStyle = "rgba(255,255,255,0.5)"; g.fillRect(-w * 0.6, -h * 0.3, 2.5, h); g.restore();
    g.lineWidth = 1.8; g.strokeStyle = TINTA; g.stroke();
    // rodaja de limón
    g.fillStyle = "#f4f770"; g.beginPath(); g.arc(w * 0.7, -h * 0.55, 6, Math.PI, TAU); g.fill(); g.strokeStyle = "#8a8a10"; g.lineWidth = 1.2; g.stroke();
    g.restore();
    const b0 = P(c.x + 2 * (pp.espejo ? -1 : 1) * pp.sx, c.y - 6), tip = puntaPajita(c,pp);
    g.save(); g.lineCap = "round"; g.strokeStyle = TINTA; g.lineWidth = 4; g.beginPath(); g.moveTo(b0.x, b0.y); g.lineTo(tip.x, tip.y); g.stroke();
    g.strokeStyle = "#ff5a7a"; g.lineWidth = 2.2; g.stroke(); g.restore();
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  function estrella(g, x, y, r, n, giro, hueco = 0.45) {
    g.beginPath();
    for (let i = 0; i < n * 2; i++) { const a = giro + i * Math.PI / n, rr = i % 2 ? r * hueco : r; const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; if (i) g.lineTo(px, py); else g.moveTo(px, py); }
    g.closePath();
  }
  // rayas de velocidad detrás de un globo
  function estela(g, t, t0, t1, f, n, col) {
    if (t < t0 || t > t1) return;
    const a = f(Math.max(t0, t - 0.05)), b = f(t), d = Math.hypot(b.x - a.x, b.y - a.y); if (d < 2) return;
    const ux = (b.x - a.x) / d, uy = (b.y - a.y) / d;
    g.save(); g.strokeStyle = col; g.lineCap = "round";
    for (let i = -1; i <= 1; i++) { g.lineWidth = 2.2 - Math.abs(i) * 0.6; g.beginPath(); g.moveTo(b.x - ux * 18 - uy * i * 7, b.y - uy * 18 + ux * i * 7); g.lineTo(b.x - ux * (18 + n) - uy * i * 7, b.y - uy * (18 + n) + ux * i * 7); g.stroke(); }
    g.restore();
  }
  // arco de barrido del brazo al lanzar
  function barrido(g, t, pg) {
    const k = campana(t, T.planta - 0.08, T.lanza + 0.14); if (k < 0.02) return;
    const sh = aPant(G, pg, G.tronco(pg)(G.HOMBRO_C));
    g.save(); g.globalAlpha = 0.7 * k; g.strokeStyle = "#ffffff"; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { g.lineWidth = 3 - i * 0.7; g.beginPath(); g.arc(sh.x, sh.y + 10, 76 + i * 9, -0.4 - 0.2 * i, 0.9 - 0.15 * i); g.stroke(); }
    g.restore();
  }
  // chorrito que escupe Guillermo
  function escupitajo(g, t, pg) {
    const u = fase(t, T.escupe0 + 0.18, T.escupe1); if (u <= 0 || u >= 1) return;
    const b = aPant(G, pg, G.boca(pg)), dir = pg.espejo ? -1 : 1;
    g.save(); g.lineCap = "round";
    const pts = []; for (let i = 0; i <= 10; i++) { const s = i / 10 * Math.min(1, u * 2.2); pts.push(P(b.x + dir * 110 * s, b.y - 70 * s + 140 * s * s)); }
    g.globalAlpha = 1 - fase(u, 0.6, 1);
    g.strokeStyle = TINTA_AGUA; g.lineWidth = 6; g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); g.stroke();
    g.strokeStyle = AZUL; g.lineWidth = 3.5; g.stroke();
    g.restore();
  }
  // líneas de alegría / susto
  function rayitas(g, c, r, k, n = 6, a0 = -Math.PI * 0.9, a1 = -Math.PI * 0.1) {
    if (k < 0.02) return;
    g.save(); g.globalAlpha = k; g.strokeStyle = TINTA; g.lineWidth = 2.6; g.lineCap = "round";
    for (let i = 0; i < n; i++) { const a = lerp(a0, a1, i / (n - 1)); g.beginPath(); g.moveTo(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r); g.lineTo(c.x + Math.cos(a) * (r + 12), c.y + Math.sin(a) * (r + 12)); g.stroke(); }
    g.restore();
  }
  function sombra(g, p, ancho) {
    const sx = p.sx ?? 1;
    g.save(); g.fillStyle = "rgba(30,60,20,0.28)"; g.beginPath(); g.ellipse(p.x, SUELO + 3, ancho * (0.55 + 0.45 * sx), 7, 0, 0, TAU); g.fill(); g.restore();
  }
  // brillo en el globo cuando Paradigma lo mira / cuando lo caza
  function brillo(g, c, r, k, giro) {
    if (k < 0.02) return;
    g.save(); g.globalAlpha = k; estrella(g, c.x + r * 0.8, c.y - r * 0.8, 8 * k + 3, 4, giro, 0.3); g.fillStyle = "#fffbe0"; g.fill(); g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const kc = tramo(t, T.pone0 - 0.4, T.pone0 + 0.2) * (1 - tramo(t, T.pop + 0.4, T.pop + 1.0));
    const kf = tramo(t, T.camaraG - 0.2, T.camaraG + 0.5);
    const k = 1 + 0.07 * kc + 0.05 * kf;
    let f = P(lerp(512, 420, Math.max(kc, kf)), lerp(300, 318, Math.max(kc, kf)));
    const hx = 512 / k, hy = 300 / k;
    f = P(clamp(f.x, hx, W - hx), clamp(f.y, hy, H - hy));
    return { k, f };
  }

  // ajustes que dependen de las poses (una vez)
  let ajustado = false;
  function ajusta() {
    if (ajustado) return; ajustado = true;
    // el girasol, justo bajo la nariz de Paradigma cuando se inclina
    const ph = cuerpoP(T.huele0 + 0.2), nariz = enCab(PD, ph, P(887, 600));
    FLOR = P(nariz.x + 10, nariz.y + 20);
    MEMO.clear();
    const g1 = poseG(T.lanza); REL1 = enMano(G, g1, g1.manoCerca, R1);
    CABEZA_MOJA = coronaG(poseG(T.moja));
    const g2 = poseG(T.suelta); REL2 = globo2Abrazo(g2, T.suelta);
    const pc = poseP(T.caza); CAZA2 = enPalma(pc, T.caza);
    MEMO.clear();
  }

  // diagnóstico: alcance de cada brazo (1 = estirado; el rig deja hasta 1,08)
  function diag(t) {
    ajusta();
    const o = {};
    for (const [n, R, p] of [["G", G, poseG(t)], ["P", PD, poseP(t)]]) for (const lado of ["cerca", "lejos"]) {
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m) continue;
      const h = R.tronco(p)(lado === "cerca" ? R.HOMBRO_C : R.HOMBRO), mu = m.mu ?? -1.75;
      const w = P(m.x + Math.cos(mu) * R.MUNECA_R * R.JK, m.y + Math.sin(mu) * R.MUNECA_R * R.JK);
      o[n + lado] = +(Math.hypot(w.x - h.x, w.y - h.y) / (lado === "cerca" ? R.BRAZO_C_L : R.BRAZO_L)).toFixed(3);
    }
    return o;
  }

  class GuillermoParadigmaGlobos extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !PD.listo()) return;
      if (!fondo) fondo = creaFondo();
      ajusta();
      const luz = tramo(t, NEGRO_INICIO, 0.8) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02));
      const pg = Object.assign({}, poseG(t)), pp = Object.assign({}, poseP(t));
      g.save();
      const cam = camara(t);
      g.translate(512, 300); g.scale(cam.k, cam.k); g.translate(-cam.f.x, -cam.f.y);
      const M0 = g.getTransform();
      g.drawImage(fondo, 0, 0);
      manchaPilar(g, t);
      charcos(g, t);
      cuboAtras(g, t);
      cuboDelante(g);
      girasol(g, t);
      sombra(g, pg, 52); sombra(g, pp, 54);
      // globos en las manos: se pintan como objetos de la mano (debajo de los dedos)
      const s1 = globo1(t, pg), s2 = globo2(t, pg, pp);
      const obj = (f) => gg => { gg.save(); gg.setTransform(M0); f(gg); gg.restore(); };
      if (s1.capa === "manoL") pg.manoLejos = Object.assign({}, pg.manoLejos, { objeto: obj(gg => pintaGlobo1(gg, s1, t)) });
      if (s1.capa === "manoC") pg.manoCerca = Object.assign({}, pg.manoCerca, { objeto: obj(gg => pintaGlobo1(gg, s1, t)) });
      if (s2.capa === "cuelga" || s2.capa === "abrazo") pg.manoLejos = Object.assign({}, pg.manoLejos, { objeto: obj(gg => pintaGlobo2(gg, s2, t)) });
      if (s2.capa === "palma" || s2.capa === "lleva") pp.manoLejos = Object.assign({}, pp.manoLejos, { objeto: obj(gg => pintaGlobo2(gg, s2, t)) });
      pp.manoCerca = Object.assign({}, pp.manoCerca, { objeto: obj(gg => vaso(gg, manoPant(PD, pp, pp.manoCerca).c, t, pp)) });
      // Guillermo (mojado: en su lienzo aparte, con el pelo aplastado y la ropa oscura)
      if (pg.moja > 0.001) {
        const est = { w: pg.moja, abajo: Math.PI / 2 - pg.cabeza.ang, oscila: 0.12 * campana(t, T.moja, T.moja + 1.0) + 0.1 * campana(t, T.pop, T.pop + 1.0) };
        pg.capaCabeza = (gg, tt) => capaCabG(gg, tt, est);
        pg.capaTronco = gg => capaTroncoG(gg);
        const fuera = (s2.capa === "cuelga" || s2.capa === "abrazo") ? [{ x: s2.c.x, y: s2.c.y, r: R2 * 1.22 }] : [];
        dibujaMojado(g, pg, t, pg.moja, fuera);
      } else dibuja(G, g, pg, t);
      // mientras rebusca dentro del cubo, la pared del cubo le tapa la mano
      if (t < T.saca0 || (s1.capa === "manoL" && s1.c.y + R1 > CUBO.y - 6) ||
          (s2.capa === "cuelga" && s2.c.y + R2 * 1.06 > CUBO.y - 6 && Math.abs(s2.c.x-CUBO.x) < CUBO.r0+R2)) cuboDelante(g);
      if (s2.capa === "cabeza") pintaGlobo2(g, s2, t);
      dibuja(PD, g, pp, t);
      // globos en el aire
      if (s1.capa === "aire" || s1.capa === "aplasta") pintaGlobo1(g, s1, t);
      if (s2.capa === "aire") pintaGlobo2(g, s2, t);
      estela(g, t, T.lanza + 0.02, T.choca, tt => vuelo1(tt).c, 26, "rgba(255,255,255,0.8)");
      estela(g, t, T.suelta + 0.02, T.caza - 0.05, tt => vuelo2(tt).c, 30, "rgba(255,255,255,0.8)");
      barrido(g, t, pg);
      // agua
      corona(g, t, T.revienta1, IMPACTO, 34, 3, Math.PI, Math.PI * 1.3);
      salpicon(g, t, T.revienta1, IMPACTO, 16, 260, 5, -1.2, 0.7);
      gomas(g, t, T.revienta1, IMPACTO, COL1, 6, 2);
      dibVuelta(g, t);
      if (CABEZA_MOJA) {
        const hc = coronaG(pg);
        corona(g, t, T.moja, hc, 44, 7);
        salpicon(g, t, T.moja, hc, 26, 380, 11);
        // cortina de agua que le cae de la cabeza a los pies (y tapa el cambio de pelo)
        cascada(g, t, T.moja, hc, pg.x, 62, 3);
      }
      // ¡plof! en la cabeza
      if (t > T.pop - 0.01) {
        const c = globoEnCabeza(poseG(T.pop), T.pop);
        corona(g, t, T.pop, c, 46, 13);
        salpicon(g, t, T.pop, c, 26, 330, 17);
        gomas(g, t, T.pop, c, COL2, 9, 4);
        cascada(g, t, T.pop, coronaG(pg), pg.x, 58, 9);
      }
      goteo(g, t);
      escupitajo(g, t, pg);
      // rayitas: alegría al reventar el globo, susto al ver volver el agua, pasmo
      const hcG = enCab(G, pg, P(790, 470));
      rayitas(g, hcG, 70, campana(t, T.salta0, T.salta1 + 0.1));
      rayitas(g, hcG, 70, campana(t, T.horror, T.horror + 0.3), 5, -Math.PI * 0.8, -Math.PI * 0.2);
      rayitas(g, hcG, 70, campana(t, T.pasma, T.pasma + 0.4), 5, -Math.PI * 0.8, -Math.PI * 0.2);
      if (s2.c && t > T.caza - 0.02 && t < T.caza + 0.4) brillo(g, s2.c, R2, campana(t, T.caza - 0.02, T.caza + 0.4), t * 3);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00109.2", nombre: "Guillermo y Paradigma · Los globos de agua", crear: () => new GuillermoParadigmaGlobos() });
  window.__A2D_00109_2 = { pose, T, DUR, diag, poseG, poseP, ajusta, vuelo1, vuelo2, globo1, globo2, globo2Cubo, globo2Abrazo, globoEnCabeza, coronaG, enMano, manoPant, enPalma, enLado, enCab, aPant, vueltaAgua, jiggle2, IMPACTO, PILAR, CUBO, R1, R2, camara, dibuja, pintaGlobo1, formaCabeza, sorbo, puntaPajita, globo1Cubo, giroEnPalma };
})();
