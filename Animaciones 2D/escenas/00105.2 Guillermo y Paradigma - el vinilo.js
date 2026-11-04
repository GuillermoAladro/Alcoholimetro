"use strict";
/* 00105.2 · Guillermo y Paradigma · El vinilo
 *
 * Negro → un rincón de discos en el bar, de noche: estantería llena de vinilos (lomos de colores,
 * sin letras), dos altavoces de pie, un aparador de nogal con un tocadiscos antiguo visto de tres
 * cuartos, una lámpara colgante, dos láminas sin texto y una ventana con la ciudad. Paradigma saca
 * un disco de su funda con la yema de los dedos, le sopla el polvo, deja la funda en el aparador,
 * lo posa en el plato y baja la aguja: salen notas redondas de los altavoces y se mece con los ojos
 * cerrados. Guillermo, que mira cabeceando, tiene una idea: se cruje los nudillos, se planta en el
 * tocadiscos, se lleva la mano a unos cascos invisibles y rasca el disco adelante y atrás como un DJ:
 * las notas salen rotas, en zigzag. Paradigma abre los ojos, se tapa la oreja y le hace «¡para!».
 * Último rascado… y el disco sale volando como un frisbi: rebota en la estantería, en una lámina
 * (que se queda torcida), en la lámpara (que se queda columpiándose) y en el altavoz, y vuelve.
 * Paradigma, sin inmutarse, levanta un dedo y lo caza por el agujero; el disco gira en su dedo hasta
 * pararse. Lo vuelve a poner en el plato y baja la aguja: las notas vuelven a ser redondas.
 * Guillermo, cortado, se mece con él; los dos miran a cámara y Paradigma guiña un ojo → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`. El disco, la funda y el brazo del tocadiscos
 * se dibujan en coordenadas de pantalla; cuando el disco va en una mano se pinta como su objeto
 * (con la matriz de la cámara), así queda por encima del brazo y por debajo de los dedos.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, PD = Paradigma;
  const DUR = 14.6, TINTA = "#0b0a0e", TAU = Math.PI * 2;
  const SUELO = 548, S = 0.3;

  const T = {
    // Paradigma: saca el disco, sopla, deja la funda, lo pone, baja la aguja
    saca0: 0.5, saca1: 1.35, sopla0: 1.42, sopla1: 1.78, funda0: 1.62, funda1: 2.2, suelta: 2.22,
    pone0: 1.9, pone1: 2.66, plato: 2.72, brazo0: 2.86, brazo1: 3.2, gira0: 3.24, gira1: 3.58, aguja: 3.7, musica: 3.78,
    atras0: 3.95, atras1: 4.55,
    // Guillermo
    cabecea: 3.95, idea: 4.75, cruje0: 5.0, cruje1: 5.45, anda0: 5.5, anda1: 6.22, mano: 6.42, oreja: 6.3,
    rasca0: 6.55, rasca1: 8.3, carga: 8.3, sale: 8.6,
    // Paradigma reacciona
    abre: 6.72, tapa0: 6.82, tapa1: 7.05, para0: 7.15, para1: 7.4, suelta2: 8.5,
    // vuelo del disco (rebotes)
    b1: 8.9, b2: 9.26, b3: 9.6, b4: 10.04, coge: 10.48, dedo0: 9.95, dedo1: 10.35,
    baja0: 10.7, baja1: 11.2, toma: 11.32, entra0: 11.5, entra1: 11.95, pone2: 12.12,
    brazo2: 12.2, aguja2: 12.58, musica2: 12.66,
    // Guillermo después
    encoge: 8.62, atrasG0: 11.0, atrasG1: 11.62, corta: 11.7, mece: 12.75,
    camara: 13.3, guinoP: 13.62, guinoG: 13.75, fin: 14.02
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
  const PUNO = TODOS(0), PALMA = D5(0.8, 1, 1, 1, 1);
  const PINZA = D5(0.55, 0.7, 0.45, 0.35, 0.3);           // yemas en el canto del disco
  const DEDO = D5(0, 1, 0, 0, 0);                          // solo el índice estirado
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const mezMano = (a, d, k) => ({ x: lerp(a.x, d.x, k), y: lerp(a.y, d.y, k), mu: lerp(a.mu, d.mu, k), ang: 0, puno: lerp(a.puno, d.puno, k),
    dedos: DD(a.dedos, d.dedos, k), dobla: k < 0.5 ? a.dobla : d.dobla });
  // como mezMano, pero el codo cambia de lado en kc (cerca del brazo estirado, para que no se note)
  const mezManoD = (a, d, k, kc) => Object.assign(mezMano(a, d, k), { dobla: k < kc ? a.dobla : d.dobla });
  const conMano = (m, dx, dy, dmu = 0) => Object.assign({}, m, { x: m.x + dx, y: m.y + dy, mu: m.mu + dmu });
  // fase del compás de la música (90 pulsaciones)
  const BPM = 90, B = 60 / BPM;
  const fasePulso = (t, sub = 1) => { const u = (t - T.musica) / (B / sub); return u - Math.floor(u); };

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

  /* ---------- pies ---------- */
  function pieDe(apoyos, t, o) {
    let i = 0; for (let k = 0; k < apoyos.length; k++) if (apoyos[k][0] <= t) i = k;
    const [tf, xf, d0] = apoyos[i], dur = d0 ?? o.apoyo;
    if (t <= tf || i === apoyos.length - 1 || t <= tf + dur) return { x: xf, h: 0, a: 0 };
    const [tn, xn] = apoyos[i + 1], toff = tf + dur, u = clamp((t - toff) / (tn - toff));
    const x = lerp(xf, xn, suave(clamp((u - 0.05) / 0.95)));
    const h = o.alto * Math.sin(Math.PI * u);
    const a = (o.atras ? -1 : 1) * (0.26 * Math.sin(Math.PI * u) - 0.08 * Math.sin(TAU * u));
    return { x, h, a };
  }
  function aPierna(R, p, w, lado) {
    const tob = R.SUELO - R.TOBILLO_ALTO;
    return { tob: P(R.aHoja(p, P(w.x, 0)).x, tob - (lado === "lejos" ? 12 : 0) - w.h / (p.s * R.K)), ang: (p.espejo ? -1 : 1) * 0 + w.a };
  }

  const MEMO = new Map();
  const memo = (c, f) => { if (MEMO.has(c)) return MEMO.get(c); if (MEMO.size > 40) MEMO.clear(); const v = f(); MEMO.set(c, v); return v; };

  /* =====================================================================================
   * EL TOCADISCOS (plano del plato: u a lo ancho, v en profundidad; pantalla = centro + (u, v·K))
   * ===================================================================================== */
  const PL = { x: 520, y: 290, k: 0.36 };                  // centro del plato y achatamiento de la vista
  const enPlano = (u, v, alto = 0) => P(PL.x + u, PL.y + v * PL.k - alto);
  const R_DISCO = 40, R_PLATO = 44;
  const ZOC = { u0: -62, u1: 82, v0: -46, v1: 44, alto: 10 };                 // caja del tocadiscos
  const MUE = { u0: -120, u1: 150, v0: -60, v1: 70, base: 505 };              // aparador (encima, 10 px más abajo)
  const BRZ = { u: 66, v: -40, L: 60, aReposo: 1.57, aDisco: 2.14 };          // brazo: pivote y largo (en el plano)

  // giro del plato (rad): arranca al posar el disco y ya no para
  const W_PLATO = 3.5;
  function angPlato(t) {
    if (t < T.plato) return 0;
    const u = t - T.plato, ac = 0.5;                       // medio segundo para coger velocidad
    return u < ac ? W_PLATO * u * u / (2 * ac) : W_PLATO * (u - ac / 2);
  }

  // rascado: desplazamiento angular del disco bajo la mano de Guillermo (rad)
  function rascado(t) {
    if (t < T.mano) return 0;
    const u = t - T.rasca0;
    if (t < T.rasca0) return -0.05 * campana(t, T.mano, T.rasca0);
    if (t < T.carga) {
      const f = lerp(2.2, 4.2, fase(t, T.rasca0, T.carga)), A = lerp(0.32, 0.55, fase(t, T.rasca0, T.carga));
      const ph = u * f + 0.18 * Math.sin(u * 5.1);         // ritmo un poco irregular
      const s = Math.sin(TAU * ph), forma = Math.tanh(2.4 * s) / Math.tanh(2.4);
      return A * forma * tramo(t, T.rasca0, T.rasca0 + 0.15);
    }
    // carga hacia atrás… y empujón hacia delante que lo suelta
    const fin = (() => { const u0 = T.carga - T.rasca0, f = 4.2, ph = u0 * f + 0.18 * Math.sin(u0 * 5.1), s = Math.sin(TAU * ph); return 0.55 * Math.tanh(2.4 * s) / Math.tanh(2.4); })();
    if (t < T.sale - 0.12) return lerp(fin, -0.62, salida(fase(t, T.carga, T.sale - 0.12)));
    return lerp(-0.62, 1.4, entrada(fase(t, T.sale - 0.12, T.sale)));
  }
  const PHI_G = 2.45;                                       // punto del disco donde apoya Guillermo
  let THETA_MANO = 0;                                       // ángulo del disco al ponerle la mano (se calcula una vez)

  /* =====================================================================================
   * EL DISCO: dónde está, cómo se ve y en qué capa se pinta
   *   capa: "funda" (en la mano lejana de Paradigma) · "mano" (lejana) · "plato" · "aire" · "dedo"
   * ===================================================================================== */
  // trayectoria del vuelo: tramos de Bézier cuadráticos entre rebotes
  // Los puntos de choque están en los bordes visibles del decorado. En cada rebote
  // se resta el radio proyectado del vinilo para obtener la trayectoria de su centro.
  const ESTANTE = { x0: 26, x1: 186, filas: [140, 224, 308, 392, 476] };
  const LAMINA = { x: 230, y: 112, w: 78, h: 96 };
  const LMP = { x: 520, y0: -10, L: 86 };
  const ALT_D = { x: 826, y: 300, w: 66, h: 205 };
  function rebote(t, blanco, golpe, normal, k, control) {
    return { t, blanco, golpe, normal, k, c: control,
      p: P(golpe.x - normal.x * R_DISCO, golpe.y - normal.y * R_DISCO * k) };
  }
  function bordeLampara(t) {
    const a = angLampara(t);
    return P(LMP.x + LMP.L * Math.sin(a) + 12 * Math.cos(a) + 20 * Math.sin(a),
      LMP.y0 + LMP.L * Math.cos(a) - 12 * Math.sin(a) + 20 * Math.cos(a));
  }
  const REB = [
    { t: T.sale, p: P(PL.x,PL.y), k: PL.k },
    rebote(T.b1, "estantería", P(ESTANTE.x1 + 6,ESTANTE.filas[0] + 3), P(-1,0), 0.34, P(378,196)),
    rebote(T.b2, "lámina", P(LAMINA.x + 60,LAMINA.y + LAMINA.h + 5), P(0,-1), 0.32, P(245,306)),
    rebote(T.b3, "lámpara", bordeLampara(T.b3), P(0,-1), 0.28, P(438,273)),
    rebote(T.b4, "altavoz", P(ALT_D.x,ALT_D.y + 34), P(1,0), 0.32, P(721,229)),
    { t: T.coge, p: null, k: 0.22, c: P(739,198) }
  ];
  function bez(a, c, b, u) { const v = 1 - u; return P(v * v * a.x + 2 * u * v * c.x + u * u * b.x, v * v * a.y + 2 * u * v * c.y + u * u * b.y); }

  // agarre en el canto del disco (ángulo en el plano del disco: por delante y un poco arriba)
  const PSI = 3.5;
  const canto = (c, k) => P(c.x + (R_DISCO + 1) * Math.cos(PSI), c.y + (R_DISCO + 1) * k * Math.sin(PSI));
  const desdeCanto = (q, k) => P(q.x - (R_DISCO + 1) * Math.cos(PSI), q.y - (R_DISCO + 1) * k * Math.sin(PSI));

  let DEDO_COGE = P(760, 220);                              // centro del disco al cazarlo (se calcula de la pose)
  let C0 = null, CT = null;                                 // disco al empezar a posarlo y al cogerlo del dedo
  const enFunda = (t, p) => { const f = funda(t, p), sale = suave(fase(t, T.saca0, T.saca1)), sopla = campana(t, T.sopla0, T.sopla1);
    return P(f.c.x - lerp(14, 90, sale), f.c.y + 1 - 3 * sale - 4 * sopla); };
  const c0 = () => C0 || (C0 = enFunda(T.pone0, cuerpoP(T.pone0)));
  const enDedo = p => dedoParadigma(p);
  const ct = () => CT || (CT = enDedo(cuerpoP(T.toma)));
  const K_DEDO = 0.22;
  // la mano lejana lleva el disco al plato (agarrado por el canto): de dónde a dónde
  function llevaPlato(t, desde, k0, t0, t1) {
    const u = suave(fase(t, t0, t1)), a = canto(desde, k0), b = canto(P(PL.x, PL.y), PL.k);
    return { mano: P(lerp(a.x, b.x, u), lerp(a.y, b.y, u) - 18 * Math.sin(Math.PI * u)), k: lerp(k0, PL.k, suave(fase(t, t0 + 0.1, t1))) };
  }
  function giroDedo0(t) {
    const dur = T.toma - T.coge, u = fase(t, T.coge, T.toma);
    return THETA_MANO + 1.4 + 22 * (T.coge - T.sale) + 22 * dur * (1 - Math.pow(1 - u, 3)) / 3;
  }

  function disco(t, pp, pg) {
    // 1 · en la funda y saliendo (de cara a cámara, en la mano lejana de Paradigma)
    if (t < T.pone0) return { c: enFunda(t, pp), k: 1, rot: 0, spin: 0.3, capa: "funda" };
    // 2 · lo posa en el plato
    if (t < T.plato) { const l = llevaPlato(t, c0(), 1, T.pone0, T.pone1); return { c: desdeCanto(l.mano, l.k), k: l.k, rot: 0, spin: 0.3, capa: "mano" }; }
    // 3 · girando en el plato / bajo la mano de Guillermo
    if (t < T.sale) {
      const th = t < T.mano ? angPlato(t) + 0.3 : THETA_MANO + rascado(t);
      const bote = 1.5 * campana(t, T.plato, T.plato + 0.12);
      return { c: P(PL.x, PL.y - bote), k: PL.k, rot: 0, spin: th, capa: "plato" };
    }
    // 4 · vuela como un frisbi y rebota
    if (t < T.coge) {
      let i = 0; while (i < REB.length - 2 && t >= REB[i + 1].t) i++;
      const a = REB[i], b = REB[i + 1], u = fase(t, a.t, b.t);
      const c = bez(a.p, b.c, b.p || DEDO_COGE, u);
      const arco = Math.sin(Math.PI * u);
      const k = lerp(a.k, b.k, suave(u)) + 0.10 * arco * Math.sin((i + u) * 4);
      const rot = 0.36 * arco * Math.sin(0.4 + 2.5 * u + i);
      return { c, k, rot, spin: THETA_MANO + 1.4 + 22 * (t - T.sale), capa: "aire" };
    }
    // 5 · girando en el dedo (se va frenando) mientras lo baja
    if (t < T.toma) {
      const bamb = Math.exp(-(t - T.coge) * 2.2) * (1 - tramo(t, T.toma - 0.2, T.toma));
      return { c: enDedo(pp), k: K_DEDO + 0.02 * Math.sin((t - T.coge) * 9) * bamb, rot: 0.07 * bamb * Math.sin((t - T.coge) * 17), spin: giroDedo0(t),
        capa: "dedo", w: 22 * Math.pow(1 - fase(t, T.coge, T.toma), 2) };
    }
    // 6 · la mano lejana lo coge por el canto y lo lleva al plato
    if (t < T.pone2) { const l = llevaPlato(t, ct(), K_DEDO, T.toma, T.pone2); return { c: desdeCanto(l.mano, l.k), k: l.k, rot: 0, spin: giroDedo0(T.toma), capa: "mano" }; }
    // 7 · otra vez en el plato (empieza a girar al bajar la aguja)
    const th = giroDedo0(T.toma) + (t > T.aguja2 - 0.3 ? angPlato(t) - angPlato(T.aguja2 - 0.3) : 0);
    const bote = 1.5 * campana(t, T.pone2, T.pone2 + 0.12);
    return { c: P(PL.x, PL.y - bote), k: PL.k, rot: 0, spin: th, capa: "plato" };
  }

  // la funda (en la mano cercana de Paradigma, luego en el aparador)
  const FUNDA_L = 84;
  const FUNDA_MESA = enPlano(118, 30, -10);                // tumbada en la esquina del aparador
  function funda(t, p) {
    const m = t < T.suelta ? PD.aPantalla(p, p.manoCerca) : null;
    if (t < T.funda0) return { c: P(m.x - FUNDA_L / 2 + 8, m.y - 2), k: 1, capa: "mano" };
    if (t < T.suelta) {
      const u = suave(fase(t, T.funda0, T.suelta));
      return { c: P(m.x - lerp(FUNDA_L / 2 - 8, 34, u), m.y + lerp(-2, 8, u)), k: lerp(1, PL.k, u), capa: "mano" };
    }
    const u = salida(fase(t, T.suelta, T.suelta + 0.14));
    const desde = (() => { const p0 = cuerpoP(T.suelta), q = PD.aPantalla(p0, p0.manoCerca); return P(q.x - 34, q.y + 8); })();
    return { c: mezcla(desde, FUNDA_MESA, u), k: PL.k, capa: "mesa", bote: campana(t, T.suelta + 0.1, T.suelta + 0.24) };
  }

  /* =====================================================================================
   * PARADIGMA (a la derecha, mira a la izquierda: espejo)
   * ===================================================================================== */
  // posiciones de Paradigma: junto al plato → medio paso atrás (brazo) → atrás (se mece) → al plato → medio paso atrás (brazo)
  const XP0 = 606, XPB = 642, XP1 = 684;
  const TRAMOS_P = [[2.74, 3.0, XP0, XPB], [3.95, 4.55, XPB, XP1], [11.45, 11.95, XP1, XP0], [12.14, 12.36, XP0, XPB]];
  function xP(t) {
    let x = XP0;
    for (const [a, b, x0, x1] of TRAMOS_P) { if (t < a) break; x = lerp(x0, x1, suave(fase(t, a, b))); }
    return x;
  }
  const CP0 = { pel: 0, torso: 0, cab: 0, cdy: 0 };
  const CP = o => Object.assign({}, CP0, o);
  const CUERPOS_P = {
    saca: CP({ pel: 6, torso: 0.06, cab: 0.16 }),
    sopla: CP({ pel: 4, torso: 0.02, cab: 0.1 }),
    pone: CP({ pel: 18, torso: 0.24, cab: 0.2 }),
    aguja: CP({ pel: 12, torso: 0.16, cab: 0.2 }),
    mece: CP({ pel: 8, torso: -0.04, cab: -0.06 }),
    susto: CP({ pel: 0, torso: -0.14, cab: -0.16 }),
    tapa: CP({ pel: 6, torso: -0.1, cab: 0.08 }),
    mira: CP({ pel: 4, torso: -0.06, cab: -0.14 }),
    dedo: CP({ pel: 6, torso: -0.1, cab: -0.04 }),
    baja: CP({ pel: 6, torso: 0.04, cab: 0.1 }),
    lleva: CP({ pel: 18, torso: 0.24, cab: 0.2 }),
    final: CP({ pel: 6, torso: -0.04, cab: -0.04 }),
    camara: CP({ pel: 4, torso: -0.06, cab: -0.08 })
  };
  const GUION_CUERPO_P = [
    [T.sopla0 - 0.1, T.sopla0 + 0.1, "sopla"], [T.pone0, T.pone0 + 0.45, "pone"], [T.brazo0, T.brazo0 + 0.3, "aguja"],
    [T.atras0, T.atras0 + 0.4, "mece"], [T.abre - 0.04, T.abre + 0.08, "susto", salida], [T.tapa0, T.tapa1, "tapa"],
    [T.sale + 0.05, T.sale + 0.3, "mira"], [T.dedo0, T.dedo1, "dedo"], [T.baja0, T.baja1, "baja"], [T.toma, T.toma + 0.45, "lleva"],
    [T.brazo2, T.brazo2 + 0.2, "aguja"], [T.aguja2 + 0.1, T.musica2 + 0.4, "final"], [T.camara, T.camara + 0.3, "camara"]
  ];
  const CARAS_P = {
    mira: E({ mx: 0.6, my: 0.65, c: 0.2, sd: 4, si: 4, abre: 0, ancho: 0.7, sonr: 0.35 }),
    sopla: E({ mx: 0.6, my: 0.5, c: 0.5, sd: 6, si: 6, abre: 6, ancho: 0.35, sonr: -0.1 }),
    pone: E({ mx: 0.5, my: 0.85, c: 0.25, sd: 2, si: 2, abre: 0, ancho: 0.7, sonr: 0.3 }),
    goza: E({ c: 1, h: 0.4, sd: 8, si: 8, abre: 0, ancho: 0.8, sonr: 0.6 }),
    susto: E({ mx: 0.8, my: 0.3, iris: 0.8, sd: 26, si: 26, abre: 18, ancho: 0.6, sonr: -0.3 }),
    tapa: E({ mx: 0.8, my: 0.3, z: 0.4, cd: 0.3, sd: 20, gd: 0.15, si: 22, gi: 0.15, abre: 22, ancho: 0.95, sonr: -0.55 }),
    sigue: E({ mx: 0.6, my: -0.5, c: 0.35, sd: 6, si: 10, abre: 0, ancho: 0.7, sonr: 0.25 }),
    sigue2: E({ mx: 0.95, my: -0.2, c: 0.35, sd: 6, si: 10, abre: 0, ancho: 0.7, sonr: 0.25 }),
    caza: E({ mx: -1, my: -0.2, c: 0.45, sd: 4, si: 12, gi: 0.1, abre: 0, ancho: 0.7, sonr: 0.55 }),
    mirad: E({ mx: -0.5, my: 0.4, c: 0.3, sd: 4, si: 14, gi: 0.12, abre: 0, ancho: 0.7, sonr: 0.6 }),
    pone2: E({ mx: 0.5, my: 0.8, c: 0.25, sd: 2, si: 2, abre: 0, ancho: 0.7, sonr: 0.45 }),
    camara: E({ mx: -0.2, my: 0.05, c: 0.25, sd: 8, si: 12, gi: 0.1, abre: 0, ancho: 0.8, sonr: 0.75 })
  };
  const GUION_CARA_P = [
    [T.sopla0 - 0.06, T.sopla0 + 0.06, "sopla"], [T.sopla1, T.sopla1 + 0.1, "mira"], [T.pone0 + 0.1, T.pone0 + 0.3, "pone"],
    [T.atras0, T.atras0 + 0.3, "goza"], [T.abre, T.abre + 0.06, "susto", salida], [T.tapa0, T.tapa1, "tapa"],
    [T.sale + 0.05, T.sale + 0.2, "sigue"], [T.b2 - 0.1, T.b3, "sigue2"], [T.b3 + 0.2, T.b3 + 0.45, "caza"],
    [T.coge + 0.2, T.coge + 0.5, "mirad"], [T.toma - 0.1, T.toma + 0.2, "pone2"], [T.musica2, T.musica2 + 0.3, "goza"],
    [T.camara, T.camara + 0.3, "camara"]
  ];
  const PARP_P = [0.3, 2.35, 10.9];

  // mecerse al compás
  const meceP = t => (tramo(t, T.atras0, T.atras0 + 0.5) * (1 - tramo(t, T.abre - 0.1, T.abre)) + tramo(t, T.musica2, T.musica2 + 0.5)) * Math.sin(TAU * (t - T.musica) / (2 * B));

  // oreja (retrato) para taparla / los cascos
  const OREJA_P = P(612, 600), OREJA_G = P(562, 586);
  // punta del índice de la mano cercana de Paradigma (pantalla)
  function dedoParadigma(p) {
    const m = PD.aPantalla(p, p.manoCerca), mu = p.manoCerca.mu, e = PD.JK * p.s * PD.K;
    const a = mu + Math.PI / 2, apertura = 0.17 * (0.4 + 0.9 / 4);
    const lx = 6.9 + 14.5 * Math.sin(apertura), ly = 4.5 + 14.5 * Math.cos(apertura);
    const dx = (lx * Math.cos(a) - ly * Math.sin(a)) * e, dy = (lx * Math.sin(a) + ly * Math.cos(a)) * e;
    return P(m.x + dx * (p.espejo ? -1 : 1), m.y + dy);
  }

  function cuerpoP(t) { return memo("pc" + t, () => cuerpoP0(t)); }
  function poseP(t) { return memo("p" + t, () => { const p = Object.assign({}, cuerpoP(t)); p.manoLejos = manoLejosP(p, t); return p; }); }
  function cuerpoP0(t) {
    const b = guion(GUION_CUERPO_P, CUERPOS_P, "saca", t);
    const respira = Math.sin(t * 2.0 + 0.4), mc = meceP(t);
    const tiembla = t > T.tapa0 && t < T.suelta2 ? 0.03 * Math.sin(t * 31) * campana(t, T.tapa0, T.suelta2) : 0;
    const p = {
      x: xP(t), suelo: SUELO, s: S, espejo: true, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: PD.PELVIS.x + 10 * mc, y: PD.PELVIS.y + b.pel + respira * 1.2 + 5 * Math.abs(mc) },
      torso: b.torso + 0.05 * mc, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.1 * mc + tiembla, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } }
    };
    // pies: cada tramo es un paso (primero el pie que va delante en la dirección del paso)
    const pasos = memo("pasosP", () => {
      const c = [[-9, XP0 + 22]], l = [[-9, XP0 - 26]];
      for (const [a, b, x0, x1] of TRAMOS_P) {
        const atras = x1 > x0, d = b - a;
        const [prim, seg, dp, ds] = atras ? [c, l, 22, -26] : [l, c, -26, 22];
        prim[prim.length - 1][2] = a - prim[prim.length - 1][0]; prim.push([a + d * 0.55, x1 + dp]);
        seg[seg.length - 1][2] = a + d * 0.3 - seg[seg.length - 1][0]; seg.push([b, x1 + ds]);
      }
      return { cerca: c, lejos: l };
    });
    const wC = pieDe(pasos.cerca, t, { alto: 16, apoyo: 0.05 }), wL = pieDe(pasos.lejos, t, { alto: 16, apoyo: 0.05 });
    p.piernas.cerca = aPierna(PD, p, wC, "cerca"); p.piernas.lejos = aPierna(PD, p, wL, "lejos");
    // cara
    const e = guion(GUION_CARA_P, CARAS_P, "mira", t);
    p.cara = cara(e, parpadeo(t, PARP_P));
    if (t > T.sopla0 && t < T.sopla1) p.cara.mofletes = 0.8 * campana(t, T.sopla0, T.sopla1);
    if (t > T.guinoP) { const k = campana(t, T.guinoP, T.guinoP + 0.5); p.cara.ojos.d = Math.max(p.cara.ojos.d, k); }
    p.manoCerca = manoCercaP(p, t);
    return p;
  }

  // --- mano cercana: la funda; tapa la oreja; el dedo que caza el disco ---
  function manoCercaP(p, t) {
    const bC = bolsillo(PD, p, "cerca");
    const sale = suave(fase(t, T.saca0, T.saca1));
    let C = enTronco(PD, p, lerp(236, 150, sale), 470, lerp(-2.5, -2.1, sale), D5(0.4, 0.55, 0.5, 0.45, 0.4), -1);   // la funda, por el canto de atrás
    const mesa = enPant(PD, p, P(FUNDA_MESA.x + 34, FUNDA_MESA.y - 8), -1.9, D5(0.6, 0.8, 0.75, 0.7, 0.6), -1);
    C = mezMano(C, mesa, suave(fase(t, T.funda0, T.suelta)));
    C = mezMano(C, bC, suave(fase(t, T.suelta + 0.05, T.suelta + 0.45)));
    // se tapa la oreja (la de atrás, la que se ve)
    const kT = suave(fase(t, T.tapa0 - 0.15, T.tapa1 - 0.1)) * (1 - suave(fase(t, T.suelta2, T.suelta2 + 0.3)));
    if (kT > 0) {
      const o = PD.cabeza(p).a(OREJA_P);
      C = mezManoD(C, { x: o.x - 34, y: o.y + 6, mu: 2.25, ang: 0, puno: 1, dedos: D5(0.6, 0.95, 0.95, 0.9, 0.85), dobla: 1 }, kT, t < T.tapa1 ? 0.15 : 0.85);
    }
    // levanta el dedo a un lado (por fuera, lejos de la cara) y caza el disco; luego lo baja delante del pecho
    C = mezMano(C, enTronco(PD, p, -70, 320, 1.5, DEDO, -1), suave(fase(t, T.dedo0, T.dedo1)));
    C = mezMano(C, enTronco(PD, p, 300, 560, 1.7, DEDO, -1), suave(fase(t, T.baja0, T.baja1)));
    C = mezMano(C, bC, suave(fase(t, T.toma + 0.08, T.toma + 0.5)));
    if (t > T.toma && t < T.toma + 0.5) C.dedos = DD(DEDO, TODOS(0.4), suave(fase(t, T.toma, T.toma + 0.14)));
    if (t > T.coge && t < T.toma) { const k = Math.exp(-(t - T.coge) * 5); C = conMano(C, 0, 14 * k * Math.sin((t - T.coge) * 14) * (1 - tramo(t, T.toma - 0.15, T.toma))); }
    return C;
  }

  // --- mano lejana: el disco, el brazo del tocadiscos, ¡para!, el disco otra vez ---
  const DOBLA_L = -1;                                      // codo lejano hacia abajo: el brazo no se arruga sobre el plato
  function manoLejosP(p, t) {
    const bL = bolsillo(PD, p, "lejos");
    const pinza = q => enPant(PD, p, P(q.x - 3, q.y - 4), DOBLA_L > 0 ? -2.3 : 2.5, PINZA, DOBLA_L);
    const aguja = q => enPant(PD, p, P(q.x + 3, q.y - 9), DOBLA_L > 0 ? -1.95 : 2.2, D5(0.55, 0.6, 0.4, 0.4, 0.95), DOBLA_L);
    const suelta = enPant(PD, p, P(PL.x - 24, PL.y - 22), DOBLA_L > 0 ? -2.2 : 2.5, D5(0.6, 0.8, 0.75, 0.7, 0.6), DOBLA_L);
    if (t < T.pone0) return pinza(canto(enFunda(t, p), 1));
    if (t < T.plato) return pinza(llevaPlato(t, c0(), 1, T.pone0, T.pone1).mano);
    if (t < T.atras0 + 0.1) {
      let L = pinza(llevaPlato(T.plato, c0(), 1, T.pone0, T.pone1).mano);
      L = mezMano(L, suelta, suave(fase(t, T.plato, T.brazo0)));
      L = mezMano(L, aguja(brazoTocadiscos(t).cabeza), suave(fase(t, T.brazo0, T.brazo1)));
      return mezManoD(L, bL, suave(fase(t, T.aguja + 0.05, T.atras0 + 0.1)), 0.85);
    }
    let L = bL;
    // ¡para!: la palma hacia Guillermo
    const kPa = suave(fase(t, T.para0, T.para1)) * (1 - suave(fase(t, T.suelta2, T.suelta2 + 0.3)));
    if (kPa > 0) L = mezMano(L, conMano(enTronco(PD, p, 560, 430, 1.62, PALMA, 1), 0, 6 * Math.sin(t * 9) * kPa), kPa);
    // coge el disco del dedo por el canto, lo lleva al plato y baja la aguja
    if (t > T.toma - 0.3) {
      L = mezManoD(L, pinza(canto(enDedo(p), K_DEDO)), suave(fase(t, T.toma - 0.3, T.toma)), 0.15);
      if (t > T.toma) L = pinza(llevaPlato(t, ct(), K_DEDO, T.toma, T.pone2).mano);
      if (t > T.pone2) {
        L = mezMano(L, suelta, suave(fase(t, T.pone2, T.pone2 + 0.12)));
        L = mezMano(L, aguja(brazoTocadiscos(t).cabeza), suave(fase(t, T.pone2 + 0.06, T.brazo2 + 0.04)));
        L = mezManoD(L, bL, suave(fase(t, T.aguja2 + 0.05, T.aguja2 + 0.5)), 0.85);
      }
    }
    return L;
  }

  /* =====================================================================================
   * EL BRAZO DEL TOCADISCOS
   * ===================================================================================== */
  function brazoTocadiscos(t) {
    let a = BRZ.aReposo, alza = 0;
    if (t > T.brazo1 - 0.17) alza = tramo(t, T.brazo1 - 0.17, T.gira0);                       // lo levanta para moverlo
    if (t > T.gira0) a = lerp(BRZ.aReposo, BRZ.aDisco, suave(fase(t, T.gira0, T.gira1)));
    if (t > T.gira1) alza = 1 - suave(fase(t, T.gira1 + 0.02, T.aguja));
    // al salir volando el disco, la aguja patina hacia fuera y se queda al borde
    if (t > T.sale - 0.04) { a = lerp(BRZ.aDisco, 1.86, salida(fase(t, T.sale - 0.04, T.sale + 0.2))); alza = 0.4 * campana(t, T.sale - 0.04, T.sale + 0.3); }
    // Paradigma lo vuelve a poner
    if (t > T.pone2 + 0.035) {
      alza = tramo(t, T.pone2 + 0.035, T.brazo2 + 0.12) * (1 - tramo(t, T.aguja2 - 0.14, T.aguja2));
      a = lerp(1.86, BRZ.aDisco, tramo(t, T.brazo2 + 0.10, T.aguja2 - 0.13));
    }
    const piv = enPlano(BRZ.u, BRZ.v, 0), u = BRZ.u + Math.cos(a) * BRZ.L, v = BRZ.v + Math.sin(a) * BRZ.L;
    const cab = enPlano(u, v, 4 + 7 * alza);
    return { piv, cabeza: cab, a, alza };
  }

  /* =====================================================================================
   * GUILLERMO (a la izquierda, mira a la derecha)
   * ===================================================================================== */
  const XG0 = 318, XG1 = 410;
  function xG(t) {
    if (t < T.anda0) return XG0;
    if (t < T.atrasG0) return lerp(XG0, XG1, suave(fase(t, T.anda0, T.anda1)));
    return lerp(XG1, XG0 + 10, suave(fase(t, T.atrasG0, T.atrasG1)));
  }
  const CG0 = { pel: 0, torso: 0.02, cab: 0.04, cdy: 0 };
  const CGc = o => Object.assign({}, CG0, o);
  const CUERPOS_G = {
    mira: CGc({ pel: 4, torso: 0.02, cab: 0.06 }),
    cabecea: CGc({ pel: 8, torso: 0.04, cab: 0.04 }),
    idea: CGc({ pel: 4, torso: -0.04, cab: -0.08 }),
    cruje: CGc({ pel: 10, torso: 0.06, cab: 0.02 }),
    anda: CGc({ pel: 8, torso: 0.1, cab: 0.02 }),
    dj: CGc({ pel: 22, torso: 0.2, cab: 0.16 }),
    carga: CGc({ pel: 16, torso: 0.08, cab: 0.04 }),
    tirón: CGc({ pel: 26, torso: 0.28, cab: 0.2 }),
    encoge: CGc({ pel: 30, torso: -0.02, cab: -0.06 }),
    agacha: CGc({ pel: 44, torso: 0.06, cab: 0.08 }),
    mira2: CGc({ pel: 14, torso: -0.06, cab: -0.04 }),
    atras: CGc({ pel: 10, torso: -0.08, cab: -0.02 }),
    corta: CGc({ pel: 12, torso: 0.02, cab: 0.12 }),
    camara: CGc({ pel: 8, torso: 0, cab: 0.02 })
  };
  const GUION_CUERPO_G = [
    [T.cabecea, T.cabecea + 0.3, "cabecea"], [T.idea, T.idea + 0.15, "idea"], [T.cruje0, T.cruje0 + 0.15, "cruje"],
    [T.anda0, T.anda0 + 0.2, "anda"], [T.anda1 - 0.1, T.mano, "dj"], [T.carga, T.sale - 0.12, "carga"], [T.sale - 0.12, T.sale, "tirón", entrada],
    [T.encoge, T.encoge + 0.2, "encoge"], [T.b1 + 0.02, T.b1 + 0.16, "agacha", salida], [T.b2 + 0.12, T.b2 + 0.4, "encoge"], [T.coge, T.coge + 0.3, "mira2"],
    [T.corta, T.corta + 0.3, "corta"], [T.camara, T.camara + 0.3, "camara"]
  ];
  const CARAS_G = {
    mira: E({ mx: 0.9, my: 0.25, c: 0.12, sd: 8, si: 8, abre: 0, ancho: 0.7, sonr: 0.35 }),
    goza: E({ mx: 0.7, my: 0.1, c: 0.7, h: 0.3, sd: 6, si: 6, abre: 0, ancho: 0.8, sonr: 0.55 }),
    idea: E({ mx: 0.2, my: 0.05, c: 0.2, sd: -6, gd: -0.14, si: 20, gi: 0.12, abre: 4, ancho: 0.9, sonr: 0.85 }),
    cruje: E({ mx: 0.9, my: 0.2, c: 0.3, sd: -8, gd: -0.18, si: -6, gi: -0.16, abre: 6, ancho: 0.95, sonr: 0.75 }),
    dj: E({ mx: 0.4, my: 0.7, c: 0.55, sd: 18, gd: -0.1, si: 22, gi: -0.1, abre: 16, ancho: 0.6, sonr: 0.3, lengua: 1 }),
    dj2: E({ mx: -0.3, my: 0.1, c: 0.8, z: 0.4, sd: 24, gd: -0.14, si: 24, gi: -0.14, abre: 22, ancho: 0.7, sonr: 0.45, lengua: 1 }),
    tiron: E({ c: 1, z: 1, sd: 22, si: 22, abre: 30, ancho: 1.0, sonr: 0.4 }),
    susto: E({ mx: -0.6, my: -0.6, iris: 0.75, sd: 30, gd: 0.2, si: 30, gi: 0.2, abre: 22, ancho: 0.55, sonr: -0.5 }),
    susto2: E({ mx: 0.6, my: -0.7, iris: 0.75, sd: 30, gd: 0.2, si: 30, gi: 0.2, abre: 16, ancho: 0.5, sonr: -0.55 }),
    agacha: E({ c: 1, z: 1, sd: 18, si: 18, abre: 8, ancho: 0.8, sonr: -0.6 }),
    pasma: E({ mx: 0.95, my: -0.2, iris: 0.8, sd: 28, si: 28, abre: 30, ancho: 0.6, sonr: -0.1 }),
    corta: E({ mx: 0.9, my: 0.4, c: 0.3, sd: 10, gd: 0.18, si: 10, gi: 0.18, abre: 0, ancho: 0.8, sonr: 0.45, rub: 0.8 }),
    mece: E({ mx: 0.85, my: 0.2, c: 0.5, sd: 10, gd: 0.12, si: 10, gi: 0.12, abre: 0, ancho: 0.85, sonr: 0.55, rub: 0.7 }),
    camara: E({ mx: -0.35, my: 0.08, c: 0.2, sd: 14, gd: 0.16, si: 10, gi: 0.16, abre: 4, ancho: 0.95, sonr: 0.7, rub: 0.8 })
  };
  const GUION_CARA_G = [
    [T.cabecea, T.cabecea + 0.3, "goza"], [T.idea, T.idea + 0.15, "idea"], [T.cruje0, T.cruje0 + 0.15, "cruje"], [T.anda1 - 0.2, T.mano, "dj"],
    [T.rasca0 + 0.4, T.rasca0 + 0.6, "dj2"], [T.carga, T.carga + 0.1, "tiron"], [T.sale + 0.02, T.sale + 0.12, "susto", salida],
    [T.b1 - 0.1, T.b1 + 0.05, "susto2"], [T.b1 + 0.05, T.b1 + 0.15, "agacha"], [T.b2 + 0.12, T.b2 + 0.3, "susto"], [T.coge - 0.05, T.coge + 0.15, "pasma"],
    [T.corta, T.corta + 0.3, "corta"], [T.mece, T.mece + 0.3, "mece"], [T.camara, T.camara + 0.3, "camara"]
  ];
  const PARP_G = [0.9, 3.2, 5.3, 10.9, 12.4];

  function poseG(t) { return memo("g" + t, () => poseG0(t)); }
  function poseG0(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "mira", t);
    const respira = Math.sin(t * 2.1);
    // cabeceo con la música (antes de la idea) y meneo al final
    const kCab = tramo(t, T.cabecea, T.cabecea + 0.3) * (1 - tramo(t, T.idea - 0.1, T.idea));
    const φ = fasePulso(t), golpe = Math.exp(-φ * 5) - 0.2;
    const meneo = tramo(t, T.mece, T.mece + 0.5) * Math.sin(TAU * (t - T.musica) / (2 * B) + 0.4);
    // DJ: el cuerpo acompaña al rascado
    const kDj = tramo(t, T.rasca0, T.rasca0 + 0.2) * (1 - tramo(t, T.carga - 0.05, T.carga));
    const sr = kDj ? rascado(t) : 0;
    const p = {
      x: xG(t), suelo: SUELO, s: S, espejo: false, tirasLimpias: true, ikContinuo: false, hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x - 10 * meneo, y: G.PELVIS.y + b.pel + respira * 1.2 + 8 * kCab * Math.max(0, golpe) + 10 * kDj * Math.abs(Math.sin(t * 13)) + 4 * Math.abs(meneo) },
      torso: b.torso + 0.04 * kDj * sr - 0.05 * meneo, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.12 * kCab * golpe + 0.08 * kDj * Math.sin(t * 13) + 0.09 * meneo, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } }
    };
    const pasos = memo("pasosG", () => ({
      cerca: [[-9, XG0 - 22, 9 + T.anda0], [T.anda0 + 0.32, XG1 - 22, T.atrasG0 - T.anda0 - 0.32], [T.atrasG0 + 0.3, XG0 - 12]],
      lejos: [[-9, XG0 + 26, 9 + T.anda0 + 0.2], [T.anda0 + 0.62, XG1 + 26, T.atrasG0 + 0.14 - T.anda0 - 0.62], [T.atrasG0 + 0.5, XG0 + 36]]
    }));
    const wC = pieDe(pasos.cerca, t, { alto: 18, apoyo: 0.04, atras: t > T.atrasG0 }), wL = pieDe(pasos.lejos, t, { alto: 18, apoyo: 0.04, atras: t > T.atrasG0 });
    p.piernas.cerca = aPierna(G, p, wC, "cerca"); p.piernas.lejos = aPierna(G, p, wL, "lejos");
    // cara
    const e = guion(GUION_CARA_G, CARAS_G, "mira", t);
    if (kDj > 0) e.abre += 8 * Math.abs(Math.sin(t * 11));
    p.cara = cara(e, parpadeo(t, PARP_G));
    if (t > T.guinoG) { const k = campana(t, T.guinoG, T.guinoG + 0.55); p.cara.ojos.d = Math.max(p.cara.ojos.d, k); }
    p.sudor = 0.9 * tramo(t, T.coge + 0.2, T.coge + 0.5) * (1 - tramo(t, T.corta + 0.5, T.mece));
    manosG(p, t);
    return p;
  }

  const DOBLA_GD = -1;                                     // codo lejano hacia abajo al rascar el disco
  function manosG(p, t) {
    const bC = bolsillo(G, p, "cerca"), bL = bolsillo(G, p, "lejos");
    let C = bC, L = bL;
    // crujirse los nudillos: las dos manos juntas delante, empujando hacia fuera
    const kCr = suave(fase(t, T.cruje0, T.cruje0 + 0.15)) * (1 - suave(fase(t, T.cruje1, T.cruje1 + 0.15)));
    if (kCr > 0) {
      const emp = 10 * campana(t, T.cruje0 + 0.12, T.cruje1);
      C = mezMano(C, enTronco(G, p, 352 + emp, 470, Math.PI + 0.2, D5(0.5, 0.35, 0.35, 0.35, 0.35), -1), kCr);
      L = mezManoD(L, enTronco(G, p, 385 + emp, 470, 2.2, D5(0.5, 0.35, 0.35, 0.35, 0.35), -1), kCr, t < T.cruje1 ? 0.15 : 0.85);
    }
    // la mano en el disco y la otra en la oreja (cascos invisibles, por detrás: el codo hacia fuera)
    const H = G.cabeza(p), o = H.a(OREJA_G);
    const kO = suave(fase(t, T.oreja, T.oreja + 0.3));
    if (kO > 0) C = mezManoD(C, { x: o.x - 34, y: o.y + 6, mu: 2.25, ang: 0, puno: 1, dedos: D5(0.4, 0.5, 0.45, 0.45, 0.4), dobla: 1 }, kO, 0.15);
    if (t > T.mano - 0.35) {
      const q = puntoRascado(Math.min(t, T.sale));
      const m = enPant(G, p, P(q.x - 4, q.y - 9), 0, D5(0.7, 0.85, 0.8, 0.75, 0.7), DOBLA_GD), sh = G.tronco(p)(G.HOMBRO);
      m.mu = Math.atan2(sh.y - m.y, sh.x - m.x) + 0.45 * DOBLA_GD;   // la muñeca mira hacia el codo (palma sobre el disco)
      L = mezManoD(L, m, suave(fase(t, T.mano - 0.35, T.mano)), 0.15);
      // al salir el disco: la mano al pecho (se encoge); luego al bolsillo
      if (t > T.sale) {
        L = mezMano(L, enTronco(G, p, 300, 500, 2.0, D5(0.5, 0.7, 0.65, 0.6, 0.55), -1), suave(fase(t, T.sale + 0.05, T.sale + 0.35)));
        L = mezManoD(L, bL, suave(fase(t, T.coge + 0.3, T.coge + 0.8)), 0.85);
      }
    }
    // cortado: de los cascos a rascarse la nuca; al mecerse, la mano baja estirada y vuelve al bolsillo
    const kN = suave(fase(t, T.corta, T.corta + 0.3));
    if (kN > 0) { const n = H.a(P(540, 470)); C = mezMano(C, { x: n.x - 20, y: n.y + 6 * Math.sin(t * 22) * (1 - fase(t, T.mece - 0.3, T.mece)), mu: 2.25, ang: 0, puno: 1, dedos: D5(0.5, 0.6, 0.6, 0.55, 0.5), dobla: 1 }, kN); }
    const kH = suave(fase(t, T.mece - 0.1, T.mece + 0.25)), kP = suave(fase(t, T.mece + 0.2, T.mece + 0.5));
    if (kH > 0) C = mezMano(C, enTronco(G, p, 88, 725, -1.65, TODOS(0.4), 1), kH);
    if (kP > 0) C = mezManoD(C, bC, kP, 0.2);
    p.manoCerca = C; p.manoLejos = L;
  }
  function puntoRascado(t) {
    const φ = PHI_G + (t > T.mano ? rascado(t) : 0);
    return P(PL.x + Math.cos(φ) * (R_DISCO - 6), PL.y + Math.sin(φ) * (R_DISCO - 6) * PL.k);
  }

  function pose(t) { return { g: poseG(t), p: poseP(t) }; }

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  const PARED = 505;                                        // línea pared-suelo
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    // pared azul petróleo con papel de rayas finas
    const pg = g.createLinearGradient(0, 0, 0, PARED); pg.addColorStop(0, "#1a2f36"); pg.addColorStop(1, "#24414a");
    g.fillStyle = pg; g.fillRect(0, 0, W, PARED);
    g.fillStyle = "rgba(255,255,255,0.025)"; for (let x = 0; x < W; x += 22) g.fillRect(x, 0, 9, PARED);
    // zócalo
    g.fillStyle = "#3b2418"; g.fillRect(0, PARED - 26, W, 26); g.fillStyle = "rgba(255,220,170,0.12)"; g.fillRect(0, PARED - 26, W, 3);
    // suelo de madera
    const sg = g.createLinearGradient(0, PARED, 0, H); sg.addColorStop(0, "#4a2c1c"); sg.addColorStop(1, "#6b4029");
    g.fillStyle = sg; g.fillRect(0, PARED, W, H - PARED);
    for (let y = PARED, k = 0; y < H; k++) { const h = 7 + (y - PARED) * 0.09; g.fillStyle = "rgba(20,8,4,0.5)"; g.fillRect(0, y, W, 1.3);
      for (let x = -(k * 137) % 260; x < W; x += 260) g.fillRect(x, y, 1.3, h); y += h; }
    // alfombra
    g.save(); g.translate(512, 560); g.scale(1, 0.2);
    g.fillStyle = "#6e2730"; g.beginPath(); g.arc(0, 0, 330, 0, TAU); g.fill();
    g.strokeStyle = "#d9a24a"; g.lineWidth = 14; g.beginPath(); g.arc(0, 0, 300, 0, TAU); g.stroke();
    g.strokeStyle = "rgba(240,210,150,0.35)"; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 250, 0, TAU); g.stroke();
    g.restore();
    // ventana con la ciudad de noche (derecha)
    ventana(g, 820, 70, 170, 196);
    // estantería de discos (izquierda)
    estanteria(g);
    // lámina de la derecha (fija)
    lamina(g, 690, 112, 84, 104, 1);
    // altavoces de pie
    altavoz(g, 196, 300, 66, 205);
    // aparador y caja del tocadiscos (lo fijo)
    aparador(g);
    // viñeta
    const v = g.createRadialGradient(512, 300, 260, 512, 320, 760); v.addColorStop(0, "rgba(6,8,12,0)"); v.addColorStop(1, "rgba(6,8,12,0.55)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    return c;
  }
  function ventana(g, x, y, w, h) {
    g.save();
    const cg = g.createLinearGradient(0, y, 0, y + h); cg.addColorStop(0, "#0f1830"); cg.addColorStop(1, "#2a2d4e");
    g.fillStyle = cg; g.fillRect(x, y, w, h);
    g.fillStyle = "#f4ecc8"; g.beginPath(); g.arc(x + w - 42, y + 38, 15, 0, TAU); g.fill();
    g.fillStyle = cg; g.beginPath(); g.arc(x + w - 35, y + 33, 13, 0, TAU); g.fill();
    for (let i = 0; i < 9; i++) { const bx = x + i * 20 - 4, bh = 40 + 70 * hash(i * 3.1); g.fillStyle = "#121423"; g.fillRect(bx, y + h - bh, 19, bh);
      for (let j = 0; j < 6; j++) if (hash(i * 7 + j) > 0.5) { g.fillStyle = "rgba(255,214,120,0.8)"; g.fillRect(bx + 4 + (j % 2) * 7, y + h - bh + 8 + Math.floor(j / 2) * 12, 4, 5); } }
    g.strokeStyle = "#2c1a12"; g.lineWidth = 10; g.strokeRect(x, y, w, h);
    g.lineWidth = 5; g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + h); g.moveTo(x, y + h / 2); g.lineTo(x + w, y + h / 2); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x - 5, y - 5, w + 10, h + 10);
    g.fillStyle = "#3a2418"; g.fillRect(x - 12, y + h + 4, w + 24, 10); g.strokeRect(x - 12, y + h + 4, w + 24, 10);
    // cortinas
    for (const cx of [x - 26, x + w + 4]) { g.fillStyle = "#7a3a2a"; g.fillRect(cx, y - 18, 24, h + 40);
      g.fillStyle = "rgba(0,0,0,0.25)"; for (let k = 4; k < 24; k += 8) g.fillRect(cx + k, y - 18, 3, h + 40); g.strokeStyle = TINTA; g.strokeRect(cx, y - 18, 24, h + 40); }
    g.fillStyle = "#c79a4a"; g.fillRect(x - 34, y - 22, w + 68, 6);
    g.restore();
  }
  // lomos de discos (sin letras): rayas de colores
  const COL_LOMOS = ["#c0392b", "#e67e22", "#f1c40f", "#27ae60", "#2980b9", "#8e44ad", "#ecf0f1", "#16a085", "#d35400", "#7f8c8d", "#e84393", "#fdcb6e"];
  function estanteria(g) {
    const { x0, x1, filas } = ESTANTE;
    g.save();
    g.fillStyle = "#3d2516"; g.fillRect(x0 - 10, filas[0] - 96, x1 - x0 + 20, filas[4] - filas[0] + 110);
    g.fillStyle = "#1c110a"; g.fillRect(x0, filas[0] - 86, x1 - x0, filas[4] - filas[0] + 86);
    for (let f = 0; f < filas.length; f++) {
      const yb = filas[f];
      for (let x = x0 + 2, i = 0; x < x1 - 4; i++) {
        const w = 4 + Math.floor(5 * hash(f * 50 + i)), h = 62 + 14 * hash(f * 31 + i * 1.7);
        if (f === 0 && x > x0 + 98 && x < x0 + 132) { x += 7; continue; }        // hueco (donde caerá un disco)
        const inc = hash(f * 9 + i * 3.3) > 0.93 ? 0.12 : 0;
        g.save(); g.translate(x, yb); g.rotate(inc);
        g.fillStyle = COL_LOMOS[Math.floor(hash(f * 13 + i * 2.1) * COL_LOMOS.length)]; g.fillRect(0, -h, w, h);
        g.fillStyle = "rgba(0,0,0,0.3)"; g.fillRect(w - 1.2, -h, 1.2, h); g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(0, -h, 1, h);
        g.restore();
        x += w + 0.6;
      }
      g.fillStyle = "#5a3820"; g.fillRect(x0 - 6, yb, x1 - x0 + 12, 8); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.strokeRect(x0 - 6, yb, x1 - x0 + 12, 8);
    }
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(x0 - 10, filas[0] - 96, x1 - x0 + 20, filas[4] - filas[0] + 110);
    // una plantita encima
    g.fillStyle = "#b5652f"; g.fillRect(x0 + 20, filas[0] - 112, 26, 18); g.strokeRect(x0 + 20, filas[0] - 112, 26, 18);
    for (let i = 0; i < 6; i++) { const a = -2.6 + i * 0.4; g.fillStyle = "#3d8b4a"; g.beginPath(); g.ellipse(x0 + 33 + Math.cos(a) * 14, filas[0] - 116 + Math.sin(a) * 12, 9, 4, a, 0, TAU); g.fill(); g.stroke(); }
    g.restore();
  }
  function lamina(g, x, y, w, h, tipo) {
    g.save(); g.lineJoin = "round";
    g.fillStyle = "#c9a35a"; g.fillRect(x - 5, y - 5, w + 10, h + 10); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x - 5, y - 5, w + 10, h + 10);
    if (tipo === 0) {        // sol de rayas sobre olas
      g.fillStyle = "#f4e3c1"; g.fillRect(x, y, w, h);
      g.fillStyle = "#e9573f"; g.beginPath(); g.arc(x + w / 2, y + h * 0.48, w * 0.3, Math.PI, 0); g.fill();
      g.fillStyle = "#f4e3c1"; for (let k = 0; k < 3; k++) g.fillRect(x + w * 0.18, y + h * (0.32 + k * 0.05), w * 0.64, 2.5);
      for (let k = 0; k < 3; k++) { g.strokeStyle = ["#2a7f8f", "#3f9fae", "#7cc6cf"][k]; g.lineWidth = 5; g.beginPath();
        for (let xx = 0; xx <= w; xx += 4) g.lineTo(x + xx, y + h * (0.58 + k * 0.12) + 4 * Math.sin(xx * 0.18 + k)); g.stroke(); }
    } else {                 // un disco y una guitarra en siluetas
      g.fillStyle = "#2a2a3a"; g.fillRect(x, y, w, h);
      g.fillStyle = "#e7c35a"; g.beginPath(); g.arc(x + w * 0.42, y + h * 0.42, w * 0.3, 0, TAU); g.fill();
      g.fillStyle = "#14141c"; g.beginPath(); g.arc(x + w * 0.42, y + h * 0.42, w * 0.24, 0, TAU); g.fill();
      g.fillStyle = "#e05a4a"; g.beginPath(); g.arc(x + w * 0.42, y + h * 0.42, w * 0.08, 0, TAU); g.fill();
      g.fillStyle = "#f2efe6"; g.beginPath(); g.ellipse(x + w * 0.7, y + h * 0.78, 12, 15, -0.5, 0, TAU); g.fill();
      g.strokeStyle = "#f2efe6"; g.lineWidth = 4; g.beginPath(); g.moveTo(x + w * 0.66, y + h * 0.72); g.lineTo(x + w * 0.3, y + h * 0.18); g.stroke();
    }
    g.restore();
  }
  function altavoz(g, x, y, w, h) {
    g.save(); g.lineJoin = "round";
    g.fillStyle = "#2c1b12"; g.fillRect(x, y, w, h); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(x, y, w, h);
    g.fillStyle = "#171214"; g.fillRect(x + 6, y + 8, w - 12, h - 20); g.strokeRect(x + 6, y + 8, w - 12, h - 20);
    for (const [cy, r] of [[y + 34, 13], [y + 92, 24], [y + 150, 24]]) {
      g.fillStyle = "#3a3236"; g.beginPath(); g.arc(x + w / 2, cy, r, 0, TAU); g.fill(); g.stroke();
      g.fillStyle = "#0e0b0c"; g.beginPath(); g.arc(x + w / 2, cy, r * 0.42, 0, TAU); g.fill();
    }
    g.fillStyle = "#0c0908"; g.fillRect(x + 4, y + h, 8, 5); g.fillRect(x + w - 12, y + h, 8, 5);
    g.restore();
  }
  function aparador(g) {
    g.save(); g.lineJoin = "round";
    const yT = v => PL.y + 10 + v * PL.k;                   // encima del aparador
    const xL = MUE.u0 + PL.x, xR = MUE.u1 + PL.x;
    // tapa
    g.fillStyle = "#6b3f22"; g.beginPath(); g.moveTo(xL, yT(MUE.v0)); g.lineTo(xR, yT(MUE.v0)); g.lineTo(xR, yT(MUE.v1)); g.lineTo(xL, yT(MUE.v1)); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    // frente con cajones y puertas
    const y0 = yT(MUE.v1), y1 = MUE.base;
    const fg = g.createLinearGradient(0, y0, 0, y1); fg.addColorStop(0, "#5a321b"); fg.addColorStop(1, "#3c2113");
    g.fillStyle = fg; g.fillRect(xL, y0, xR - xL, y1 - y0); g.strokeRect(xL, y0, xR - xL, y1 - y0);
    g.fillStyle = "rgba(255,210,160,0.12)"; g.fillRect(xL, y0, xR - xL, 3);
    const n = 3, wC = (xR - xL - 16) / n;
    for (let i = 0; i < n; i++) {
      const x = xL + 8 + i * wC;
      g.strokeStyle = "rgba(0,0,0,0.55)"; g.lineWidth = 2; g.strokeRect(x + 3, y0 + 12, wC - 6, 34);
      g.strokeRect(x + 3, y0 + 54, wC - 6, y1 - y0 - 74);
      g.fillStyle = "#d4a64a"; g.beginPath(); g.arc(x + wC / 2, y0 + 29, 3, 0, TAU); g.fill();
      g.fillRect(x + wC / 2 - 2, y0 + 70, 4, 18);
    }
    // patas
    g.fillStyle = "#2a170d"; g.fillRect(xL + 6, y1, 10, 12); g.fillRect(xR - 16, y1, 10, 12);
    // caja del tocadiscos
    const zx0 = PL.x + ZOC.u0, zx1 = PL.x + ZOC.u1, zy0 = PL.y + ZOC.v0 * PL.k, zy1 = PL.y + ZOC.v1 * PL.k;
    g.fillStyle = "#3d2a1d"; g.fillRect(zx0, zy1, zx1 - zx0, ZOC.alto); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(zx0, zy1, zx1 - zx0, ZOC.alto);
    const tg = g.createLinearGradient(0, zy0, 0, zy1); tg.addColorStop(0, "#8a5a32"); tg.addColorStop(1, "#a06a3c");
    g.fillStyle = tg; g.fillRect(zx0, zy0, zx1 - zx0, zy1 - zy0); g.strokeRect(zx0, zy0, zx1 - zx0, zy1 - zy0);
    // botones y pilotito en el frente
    g.fillStyle = "#cfc6b4"; g.beginPath(); g.ellipse(zx1 - 18, zy1 - 6, 6, 2.6, 0, 0, TAU); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(zx0 + 16, zy1 - 6, 6, 2.6, 0, 0, TAU); g.fill(); g.stroke();
    // base del brazo
    const pv = enPlano(BRZ.u, BRZ.v, 0);
    g.fillStyle = "#b9b4aa"; g.beginPath(); g.ellipse(pv.x, pv.y + 1, 9, 4, 0, 0, TAU); g.fill(); g.stroke();
    // reposabrazos
    const rp = enPlano(BRZ.u + 2, BRZ.v + BRZ.L - 4, 0);
    g.fillStyle = "#77736c"; g.fillRect(rp.x - 2, rp.y - 6, 4, 6); g.strokeRect(rp.x - 2, rp.y - 6, 4, 6);
    g.restore();
  }

  /* ---------- el plato, el disco, el brazo, la funda ---------- */
  function dibPlato(g, t) {
    const a = angPlato(t);
    g.save(); g.lineJoin = "round";
    // canto del plato
    g.fillStyle = "#5c5a58"; g.beginPath(); g.ellipse(PL.x, PL.y + 3, R_PLATO, R_PLATO * PL.k, 0, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#9c9890"; g.beginPath(); g.ellipse(PL.x, PL.y, R_PLATO, R_PLATO * PL.k, 0, 0, TAU); g.fill(); g.stroke();
    // puntos estroboscópicos del borde (se ven girar)
    for (let i = 0; i < 24; i++) { const b = a + i * TAU / 24, sx = Math.cos(b), sy = Math.sin(b); if (sy < -0.2) continue;
      g.fillStyle = "rgba(30,30,30,0.7)"; g.beginPath(); g.ellipse(PL.x + sx * (R_PLATO - 0.5), PL.y + 3 + sy * (R_PLATO * PL.k + 0.6), 1.4, 1.2, 0, 0, TAU); g.fill(); }
    // alfombrilla
    g.fillStyle = "#2a2826"; g.beginPath(); g.ellipse(PL.x, PL.y - 0.5, R_PLATO - 3, (R_PLATO - 3) * PL.k, 0, 0, TAU); g.fill();
    // eje
    g.fillStyle = "#d8d4ca"; g.beginPath(); g.ellipse(PL.x, PL.y - 2, 2.2, 1.4, 0, 0, TAU); g.fill();
    // marca de la alfombrilla (para ver que gira sin disco)
    const m = P(PL.x + Math.cos(a) * 24, PL.y - 0.5 + Math.sin(a) * 24 * PL.k);
    g.strokeStyle = "rgba(200,190,170,0.35)"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(PL.x + Math.cos(a) * 12, PL.y + Math.sin(a) * 12 * PL.k); g.lineTo(m.x, m.y); g.stroke();
    g.restore();
  }
  // disco: c centro (pantalla), k achatamiento, rot inclinación, spin giro de la etiqueta
  function dibDisco(g, d, t) {
    const R = R_DISCO, k = d.k, ry = R * k;
    g.save(); g.translate(d.c.x, d.c.y); g.rotate(d.rot || 0); g.lineJoin = "round";
    // El agujero deja ver el plato, el fondo o el dedo que pasa por él.
    g.beginPath(); g.rect(-R-5,-R-5,2*R+10,2*R+10);
    g.ellipse(0,0,2.2,2.2*Math.max(0.5,k),0,0,TAU); g.clip("evenodd");
    // grosor (canto) por debajo cuando está tumbado
    if (k < 0.95) { g.fillStyle = "#050506"; g.beginPath(); g.ellipse(0, 2.2 * (1 - k), R, ry, 0, 0, TAU); g.fill(); }
    g.fillStyle = "#121216"; g.beginPath(); g.ellipse(0, 0, R, ry, 0, 0, TAU); g.fill();
    // surcos
    g.strokeStyle = "rgba(255,255,255,0.07)"; g.lineWidth = 1;
    for (let r = R - 3; r > R * 0.42; r -= 3.2) { g.beginPath(); g.ellipse(0, 0, r, r * k, 0, 0, TAU); g.stroke(); }
    // brillos (fijos: la luz no gira)
    g.save(); g.beginPath(); g.ellipse(0, 0, R, ry, 0, 0, TAU); g.clip();
    g.fillStyle = "rgba(255,255,255,0.13)";
    for (const a0 of [-2.4, 0.74]) { g.beginPath(); g.moveTo(0, 0); g.ellipse(0, 0, R, ry, 0, a0, a0 + 0.35); g.closePath(); g.fill(); }
    g.restore();
    // etiqueta (gira)
    const rl = R * 0.36;
    g.fillStyle = "#e5603c"; g.beginPath(); g.ellipse(0, 0, rl, rl * k, 0, 0, TAU); g.fill();
    g.fillStyle = "#f3c74a"; g.beginPath();
    const s = d.spin;
    g.moveTo(0, 0); g.ellipse(0, 0, rl, rl * k, 0, s, s + 1.2); g.closePath(); g.fill();
    g.fillStyle = "#fff2d8"; const mk = P(Math.cos(s + 2.6) * rl * 0.62, Math.sin(s + 2.6) * rl * 0.62 * k);
    g.beginPath(); g.ellipse(mk.x, mk.y, 2.4, 2.4 * Math.max(0.45, k), 0, 0, TAU); g.fill();
    g.strokeStyle = "#0a0a0c"; g.lineWidth = 0.8; g.beginPath(); g.ellipse(0, 0, 2.5, 2.5 * Math.max(0.5, k), 0, 0, TAU); g.stroke();
    // contorno
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 0, R, ry, 0, 0, TAU); g.stroke();
    g.restore();
  }
  function dibBrazo(g, t) {
    const b = brazoTocadiscos(t), pv = b.piv, cb = b.cabeza;
    const dx = cb.x - pv.x, dy = cb.y - pv.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    // contrapeso detrás del pivote
    const cw = P(pv.x - ux * 12, pv.y - uy * 12 - 3);
    g.fillStyle = "#3a3a40"; g.beginPath(); g.ellipse(cw.x, cw.y, 5, 4, 0, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.stroke();
    // tubo
    g.strokeStyle = TINTA; g.lineWidth = 4.5; g.beginPath(); g.moveTo(pv.x, pv.y - 3); g.lineTo(cb.x, cb.y); g.stroke();
    g.strokeStyle = "#d9d5cc"; g.lineWidth = 2.4; g.beginPath(); g.moveTo(pv.x, pv.y - 3); g.lineTo(cb.x, cb.y); g.stroke();
    // cápsula
    g.translate(cb.x, cb.y); g.rotate(Math.atan2(uy, ux));
    g.fillStyle = "#2c2c31"; g.fillRect(-2, -3.5, 10, 7); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.strokeRect(-2, -3.5, 10, 7);
    g.fillStyle = "#e05a3c"; g.fillRect(5, -1.5, 3, 3);
    g.restore();
    // pivote encima
    g.save(); g.fillStyle = "#cfc9be"; g.beginPath(); g.arc(pv.x, pv.y - 3, 4, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke(); g.restore();
  }
  function dibFunda(g, f) {
    const L = FUNDA_L;
    g.save(); g.translate(f.c.x, f.c.y - (f.bote || 0) * 2); g.lineJoin = "round";
    g.scale(1, f.k);
    g.fillStyle = "#f1e4c8"; g.fillRect(-L / 2, -L / 2, L, L);
    // portada: sol y olas (sin letras)
    g.fillStyle = "#2f6f86"; g.fillRect(-L / 2, -L / 2, L, L);
    g.fillStyle = "#f2b440"; g.beginPath(); g.arc(-6, -6, 22, 0, TAU); g.fill();
    g.fillStyle = "#e5603c"; g.beginPath(); g.arc(-6, -6, 14, 0, TAU); g.fill();
    for (let k = 0; k < 3; k++) { g.strokeStyle = ["#f1e4c8", "#9fd3d6", "#5fb3c1"][k]; g.lineWidth = 5; g.beginPath();
      for (let x = -L / 2; x <= L / 2; x += 4) g.lineTo(x, 14 + k * 10 + 3 * Math.sin(x * 0.2 + k * 1.3)); g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = 2 / Math.max(0.4, f.k); g.strokeRect(-L / 2, -L / 2, L, L);
    g.restore();
  }

  /* ---------- la lámpara colgante ---------- */
  function angLampara(t) {
    const reposo = 0.012 * Math.sin(t * 1.9), u = t - T.b3;
    return u <= 0 ? reposo : reposo - 0.42 * Math.exp(-u * 0.75) * Math.sin(u * 4.4);
  }
  function dibLampara(g, t) {
    const th = angLampara(t), c = P(LMP.x + Math.sin(th) * LMP.L, LMP.y0 + Math.cos(th) * LMP.L);
    g.save(); g.lineCap = "round";
    g.strokeStyle = "#0d0c12"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(LMP.x, LMP.y0); g.lineTo(c.x, c.y); g.stroke();
    g.translate(c.x, c.y); g.rotate(-th);
    const hl = g.createRadialGradient(0, 22, 4, 0, 22, 70); hl.addColorStop(0, "rgba(255,226,160,0.45)"); hl.addColorStop(1, "rgba(255,226,160,0)");
    g.fillStyle = hl; g.beginPath(); g.arc(0, 22, 70, 0, TAU); g.fill();
    g.fillStyle = "#fff3cc"; g.beginPath(); g.arc(0, 16, 8, 0, TAU); g.fill();
    const forma = () => { g.beginPath(); g.moveTo(-7, -4); g.lineTo(7, -4); g.bezierCurveTo(12, 4, 26, 10, 28, 18); g.lineTo(-28, 18); g.bezierCurveTo(-26, 10, -12, 4, -7, -4); g.closePath(); };
    const gm = g.createLinearGradient(-28, 0, 28, 0); gm.addColorStop(0, "#2a5a46"); gm.addColorStop(0.4, "#4c9a77"); gm.addColorStop(1, "#1d3f31");
    forma(); g.fillStyle = gm; g.fill(); g.lineWidth = 2.4; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "#ffe9b0"; g.beginPath(); g.ellipse(0, 18, 27, 4, 0, 0, Math.PI); g.fill(); g.lineWidth = 1.6; g.stroke();
    if (t > T.b3) { g.strokeStyle = "rgba(10,20,15,0.8)"; g.lineWidth = 1.8; g.beginPath(); g.moveTo(18, 10); g.quadraticCurveTo(14, 5, 16, 1); g.stroke(); }   // abolladura
    g.restore();
  }
  function luzLampara(g, t) {
    const th = angLampara(t), c = P(LMP.x + Math.sin(th) * LMP.L, LMP.y0 + Math.cos(th) * LMP.L);
    const dx = Math.sin(th), dy = Math.cos(th);
    g.save(); g.globalCompositeOperation = "lighter";
    const bx = c.x + dx * 18, by = c.y + dy * 18, Ld = (PARED - by) / Math.max(0.4, dy), fx = bx + dx * Ld;
    const cono = g.createLinearGradient(bx, by, fx, PARED);
    cono.addColorStop(0, "rgba(255,214,140,0.16)"); cono.addColorStop(1, "rgba(255,214,140,0.02)");
    g.fillStyle = cono; g.beginPath(); g.moveTo(bx - 24, by); g.lineTo(bx + 24, by); g.lineTo(fx + 170, PARED); g.lineTo(fx - 170, PARED); g.closePath(); g.fill();
    g.restore();
  }

  /* ---------- la lámina que se tuerce ---------- */
  function angLamina(t) {
    if (t < T.b2) return 0;
    const u = t - T.b2;
    return 0.2 * salida(fase(t, T.b2, T.b2 + 0.16)) + 0.16 * Math.exp(-u * 3.2) * Math.sin(u * 13);
  }
  function dibLamina(g, t) {
    const a = angLamina(t);
    g.save(); g.translate(LAMINA.x + LAMINA.w / 2, LAMINA.y - 10); g.rotate(a); g.translate(-(LAMINA.x + LAMINA.w / 2), -(LAMINA.y - 10));
    g.strokeStyle = "#0d0c12"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(LAMINA.x + 8, LAMINA.y - 5); g.lineTo(LAMINA.x + LAMINA.w / 2, LAMINA.y - 22); g.lineTo(LAMINA.x + LAMINA.w - 8, LAMINA.y - 5); g.stroke();
    lamina(g, LAMINA.x, LAMINA.y, LAMINA.w, LAMINA.h, 0);
    g.restore();
    g.fillStyle = "#c9b98a"; g.beginPath(); g.arc(LAMINA.x + LAMINA.w / 2, LAMINA.y - 22, 2.4, 0, TAU); g.fill();
  }
  // el disco de la estantería que se vuelca con el golpe (y se queda inclinado)
  function dibLomoCaido(g, t) {
    const x = ESTANTE.x0 + 104, yb = ESTANTE.filas[0];
    const u = Math.max(0, t - T.b1 - 0.18);
    const a = 0.5 * salida(fase(t, T.b1, T.b1 + 0.18)) + 0.06 * Math.exp(-u * 6) * Math.sin(u * 30);
    g.save(); g.translate(x + 26, yb); g.rotate(-a);
    g.fillStyle = "#2f8f6f"; g.fillRect(-26, -64, 7, 64); g.fillStyle = "#ecf0f1"; g.fillRect(-19, -60, 5, 60);
    g.strokeStyle = TINTA; g.lineWidth = 1; g.strokeRect(-26, -64, 12, 64);
    g.restore();
  }
  // El altavoz pivota sobre su pie al recibir el cuarto rebote.
  function angAltavoz(t) {
    const u = Math.max(0, t - T.b4);
    return 0.045 * Math.exp(-u * 7) * Math.sin(u * 26);
  }
  function dibAltavozDerecho(g, t) {
    const {x,y,w,h} = ALT_D;
    g.save(); g.translate(x + w / 2,y + h); g.rotate(angAltavoz(t)); g.translate(-x - w / 2,-y - h);
    altavoz(g,x,y,w,h); g.restore();
  }


  /* ---------- notas ---------- */
  const ALTAVOCES = [P(229, 392), P(859, 392)];
  const COLN = ["#ffd166", "#ff8fab", "#9be7ff", "#c3a6ff", "#a8f0a0"];
  // notas redondas: salen de los altavoces al compás mientras suena la música
  const NOTAS = (() => {
    const L = [];
    const tramos = [[T.musica, T.mano], [T.musica2, DUR]];
    let i = 0;
    for (const [a, b] of tramos) for (let t = a; t < b - 0.1; t += B / 2, i++) L.push({ t0: t, vida: 2.2 + 0.6 * hash(i * 1.3), lado: i % 2, i, rota: false });
    for (let t = T.rasca0, j = 0; t < T.sale; t += 0.11, j++) L.push({ t0: t, vida: 1.1 + 0.4 * hash(j * 2.7), lado: j % 2, i: 100 + j, rota: true });
    return L;
  })();
  function notaRedonda(g, s, gir, col) {
    g.save(); g.scale(s, s); g.rotate(gir); g.lineJoin = "round"; g.lineCap = "round";
    const forma = () => { g.beginPath(); g.ellipse(-8, 10, 9.5, 7.2, -0.4, 0, TAU); g.moveTo(0.5, 8); g.lineTo(0.5, -22); g.quadraticCurveTo(10, -17, 12, -6); };
    g.strokeStyle = TINTA; g.lineWidth = 6; forma(); g.stroke();
    g.fillStyle = col; g.beginPath(); g.ellipse(-8, 10, 9.5, 7.2, -0.4, 0, TAU); g.fill();
    g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.moveTo(0.5, 8); g.lineTo(0.5, -22); g.quadraticCurveTo(10, -17, 12, -6); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(-11, 7, 3.2, 2, -0.4, 0, TAU); g.fill();
    g.restore();
  }
  // nota rota: cabeza de pinchos y plica en zigzag
  function notaRota(g, s, gir, col, i) {
    g.save(); g.scale(s, s); g.rotate(gir); g.lineJoin = "miter"; g.lineCap = "butt";
    const cabeza = () => { g.beginPath(); for (let k = 0; k < 14; k++) { const a = k * TAU / 14, r = k % 2 ? 6 : 11; const x = -8 + Math.cos(a) * r * 1.1, y = 10 + Math.sin(a) * r * 0.85; if (k) g.lineTo(x, y); else g.moveTo(x, y); } g.closePath(); };
    const plica = () => { g.beginPath(); g.moveTo(1, 8); g.lineTo(-3, 0); g.lineTo(4, -7); g.lineTo(-2, -14); g.lineTo(5, -22); g.lineTo(13, -14); };
    g.strokeStyle = TINTA; g.lineWidth = 6; plica(); g.stroke(); cabeza(); g.lineWidth = 4; g.stroke();
    g.fillStyle = col; cabeza(); g.fill();
    g.strokeStyle = col; g.lineWidth = 2.6; plica(); g.stroke();
    g.restore();
  }
  function notas(g, t) {
    for (const n of NOTAS) {
      const u = (t - n.t0) / n.vida; if (u <= 0 || u >= 1) continue;
      // las redondas se cortan en seco cuando Guillermo pone la mano
      if (!n.rota && n.t0 < T.mano && t > T.mano) { if (t > T.mano + 0.18) continue; }
      const o = ALTAVOCES[n.lado], sg = n.lado ? -1 : 1, ph = 6.3 * hash(n.i * 0.77);
      let x, y, gir, s;
      if (!n.rota) {
        const hx = 60 + 80 * hash(n.i * 1.93), hy = 150 + 80 * hash(n.i * 2.71);
        x = o.x + sg * (hx * u) + 12 * Math.sin(u * 5 + ph); y = o.y - 30 - hy * u + 8 * Math.sin(u * 7 + ph * 2);
        gir = 0.3 * Math.sin(u * 4 + n.i); s = 0.85 * salida(clamp(u / 0.2));
      } else {
        const hx = 90 + 120 * hash(n.i * 1.93), hy = 60 + 160 * hash(n.i * 2.71);
        const tir = (hash(n.i * 5.1) - 0.5) * 2;
        x = o.x + sg * hx * u + 18 * Math.sin(u * 21 + ph); y = o.y - 30 - hy * u - 40 * tir * u * u + 10 * Math.sin(u * 17);
        gir = ph + 4 * u * tir; s = 0.8 * salida(clamp(u / 0.15)) * (1 + 0.15 * Math.sin(u * 30));
      }
      g.save(); g.translate(x, y); g.globalAlpha = clamp(u / 0.06) * (1 - tramo(u, 0.65, 1));
      if (n.rota) notaRota(g, s, gir, COLN[n.i % 5], n.i); else notaRedonda(g, s, gir, COLN[n.i % 5]);
      g.restore();
    }
  }
  // zigzags del rascado junto al disco
  function rayasRascado(g, t) {
    if (t < T.rasca0 || t > T.sale + 0.1) return;
    const v = Math.abs(rascado(t + 0.01) - rascado(t - 0.01)) / 0.02;
    const k = clamp(v / 6) * tramo(t, T.rasca0, T.rasca0 + 0.1);
    if (k < 0.05) return;
    g.save(); g.strokeStyle = `rgba(255,240,200,${0.85 * k})`; g.lineWidth = 2.2; g.lineJoin = "miter";
    for (const [cx, cy, sg] of [[PL.x - 30, PL.y - 34, -1], [PL.x + 18, PL.y - 40, 1]]) {
      g.beginPath();
      for (let i = 0; i <= 5; i++) { const x = cx + sg * i * 6, y = cy - i * 4 + (i % 2 ? -5 : 5) * (0.6 + 0.4 * Math.sin(t * 40)); if (i) g.lineTo(x, y); else g.moveTo(x, y); }
      g.stroke();
    }
    g.restore();
  }
  // ondas del altavoz (al compás) y «rrriii» de la aguja al parar
  function ondas(g, t) {
    const sonando = (t > T.musica && t < T.mano) || t > T.musica2 || (t > T.rasca0 && t < T.sale);
    if (!sonando) return;
    const φ = fasePulso(t), rota = t > T.rasca0 && t < T.sale;
    g.save(); g.lineCap = "round";
    ALTAVOCES.forEach((o, j) => {
      const sg = j ? -1 : 1;
      for (let i = 0; i < 2; i++) {
        const u = rota ? ((t * 5 + i * 0.5 + j * 0.3) % 1) : ((φ + i * 0.5) % 1), r = 18 + 30 * u;
        g.strokeStyle = `rgba(255,236,200,${0.45 * (1 - u)})`; g.lineWidth = 2.4;
        g.beginPath();
        if (rota) { for (let k = 0; k <= 6; k++) { const a = -0.7 + k * 0.23, rr = r + (k % 2 ? 4 : -4); const x = o.x + sg * Math.cos(a) * rr, y = o.y + Math.sin(a) * rr; if (k) g.lineTo(x, y); else g.moveTo(x, y); } }
        else g.arc(o.x, o.y, r, sg > 0 ? -0.7 : Math.PI - 0.7, sg > 0 ? 0.7 : Math.PI + 0.7);
        g.stroke();
      }
    });
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrella(g, x, y, r, n, giro, hueco = 0.45) {
    g.beginPath();
    for (let i = 0; i < n * 2; i++) { const a = giro + i * Math.PI / n, rr = i % 2 ? r * hueco : r; const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; if (i) g.lineTo(px, py); else g.moveTo(px, py); }
    g.closePath();
  }
  function impactos(g, t) {
    for (const { t: tb, golpe: q } of REB) {
      if (!q) continue;
      const k = campana(t, tb, tb + 0.22); if (k < 0.01) continue;
      g.save(); g.globalAlpha = k; estrella(g, q.x, q.y, 20 * k + 8, 8, tb * 3, 0.45); g.fillStyle = "#fff2a8"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
      g.strokeStyle = "rgba(255,250,220,0.9)"; g.lineWidth = 2.2; g.lineCap = "round";
      for (let i = 0; i < 5; i++) { const a = tb * 5 + i * TAU / 5, r0 = 26 + 16 * (1 - k); g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * (r0 + 10), q.y + Math.sin(a) * (r0 + 10)); g.stroke(); }
      g.restore();
    }
    // polvo de la estantería
    const u = t - T.b1, polvo = REB[1].golpe;
    if (u > 0 && u < 0.9) { g.save(); for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (hash(i + 1) - 0.5) * 2.4, v = 30 + 40 * hash(i + 4);
      g.globalAlpha = 0.45 * (1 - u / 0.9); g.fillStyle = "#c8b9a2"; g.beginPath(); g.arc(polvo.x + Math.cos(a) * v * Math.sqrt(u), polvo.y + Math.sin(a) * v * Math.sqrt(u) + 30 * u * u, 5 + 6 * hash(i + 9), 0, TAU); g.fill(); } g.restore(); }
  }
  // estela del disco en el aire
  function estelaDisco(g, t, pp, pg) {
    if (!(t > T.sale && t < T.coge)) return;
    g.save(); g.lineCap = "round";
    for (let k = 1; k <= 4; k++) {
      const tt = t - k * 0.022; if (tt < T.sale) break;
      const d = disco(tt, pp, pg);
      g.globalAlpha = 0.22 * (1 - k / 5); g.fillStyle = "#2a2a34"; g.beginPath(); g.ellipse(d.c.x, d.c.y, R_DISCO, R_DISCO * d.k, d.rot, 0, TAU); g.fill();
    }
    g.restore();
    // rayas de giro
    const d = disco(t, pp, pg);
    g.save(); g.strokeStyle = "rgba(255,255,255,0.5)"; g.lineWidth = 2; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const a0 = t * 18 + i * TAU / 3; g.beginPath(); g.ellipse(d.c.x, d.c.y, R_DISCO + 7, (R_DISCO + 7) * d.k, d.rot, a0, a0 + 0.9); g.stroke(); }
    g.restore();
  }
  // giro en el dedo: arcos alrededor del disco que se van apagando
  function giroDedo(g, t, d) {
    const k = clamp(d.w / 22); if (k < 0.05) return;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.6 * k})`; g.lineWidth = 2; g.lineCap = "round";
    for (let i = 0; i < 2; i++) { const a0 = d.spin + i * Math.PI; g.beginPath(); g.ellipse(d.c.x, d.c.y, R_DISCO + 6, (R_DISCO + 6) * d.k, d.rot, a0, a0 + 0.8 * k + 0.2); g.stroke(); }
    g.restore();
  }
  // polvo que sopla del disco
  function soplido(g, t, d) {
    const u = fase(t, T.sopla0 + 0.08, T.sopla1 + 0.4); if (u <= 0 || u >= 1) return;
    g.save();
    for (let i = 0; i < 7; i++) { const a = Math.PI + (hash(i + 3) - 0.5) * 1.2, v = 30 + 30 * hash(i + 7);
      g.globalAlpha = 0.6 * (1 - u); g.fillStyle = "#e8dcc8"; g.beginPath(); g.arc(d.c.x - 10 + Math.cos(a) * v * u, d.c.y - 10 + Math.sin(a) * v * u - 10 * u, 2 + 2.5 * hash(i), 0, TAU); g.fill(); }
    g.restore();
  }
  // bombilla de la idea
  function bombillaIdea(g, t, pg) {
    const k = tramo(t, T.idea, T.idea + 0.12, salida) * (1 - tramo(t, T.cruje0 + 0.1, T.cruje0 + 0.35));
    if (k < 0.01) return;
    const c = G.aPantalla(pg, G.cabeza(pg).a(P(760, 150)));
    const s = k * (1 + 0.12 * campana(t, T.idea, T.idea + 0.25));
    g.save(); g.translate(c.x, c.y - 26); g.scale(s, s);
    const halo = g.createRadialGradient(0, 0, 2, 0, 0, 30); halo.addColorStop(0, "rgba(255,240,160,0.8)"); halo.addColorStop(1, "rgba(255,240,160,0)");
    g.fillStyle = halo; g.beginPath(); g.arc(0, 0, 30, 0, TAU); g.fill();
    g.fillStyle = "#fff3a0"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.arc(0, -2, 10, Math.PI * 0.8, Math.PI * 2.2); g.lineTo(4, 10); g.lineTo(-4, 10); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#9a9aa6"; g.fillRect(-4.5, 10, 9, 6); g.strokeRect(-4.5, 10, 9, 6);
    g.strokeStyle = "rgba(255,240,170,0.95)"; g.lineWidth = 2; g.lineCap = "round";
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.55; g.beginPath(); g.moveTo(Math.cos(a) * 15, -2 + Math.sin(a) * 15); g.lineTo(Math.cos(a) * 21, -2 + Math.sin(a) * 21); g.stroke(); }
    g.restore();
  }
  // crujido de nudillos: chispitas delante de las manos
  function crujido(g, t, pg) {
    for (const tc of [T.cruje0 + 0.22, T.cruje0 + 0.36]) {
      const k = campana(t, tc, tc + 0.16); if (k < 0.02) continue;
      const m = G.aPantalla(pg, pg.manoLejos);
      g.save(); g.globalAlpha = k; g.strokeStyle = "#fff6c8"; g.lineWidth = 2; g.lineCap = "round";
      for (let i = 0; i < 4; i++) { const a = -1.2 + i * 0.5, r0 = 14 + 8 * (1 - k); g.beginPath(); g.moveTo(m.x + Math.cos(a) * r0, m.y - 6 + Math.sin(a) * r0); g.lineTo(m.x + Math.cos(a) * (r0 + 7), m.y - 6 + Math.sin(a) * (r0 + 7)); g.stroke(); }
      g.restore();
    }
  }
  // rayitas de susto alrededor de la cabeza de Paradigma
  function sustoP(g, t, pp) {
    const k = campana(t, T.abre - 0.02, T.abre + 0.3); if (k < 0.02) return;
    const c = PD.aPantalla(pp, PD.cabeza(pp).a(P(800, 380)));
    g.save(); g.globalAlpha = k; g.strokeStyle = "#fff6d8"; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.42, r0 = 62 + 10 * (1 - k); g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0); g.lineTo(c.x + Math.cos(a) * (r0 + 12), c.y + Math.sin(a) * (r0 + 12)); g.stroke(); }
    g.restore();
  }
  function guino(g, t, R, p, t0, punto) {
    const k = campana(t, t0 + 0.02, t0 + 0.5); if (k <= 0) return;
    const q = R.aPantalla(p, R.cabeza(p).a(punto));
    g.save(); g.globalAlpha = k; estrella(g, q.x + 14, q.y - 6, 9 * k + 3, 4, t * 2, 0.3); g.fillStyle = "#fff6c8"; g.fill(); g.restore();
  }
  function sombra(g, p, ancho) { g.beginPath(); g.ellipse(p.x, p.suelo + 2, ancho, 6, 0, 0, TAU); g.fill(); }

  /* ---------- cámara ---------- */
  function camara(t) {
    const kd = tramo(t, T.rasca0, T.rasca0 + 0.8) * (1 - tramo(t, T.sale - 0.1, T.sale + 0.3));
    const kf = tramo(t, 12.9, 13.7);
    const k = 1 + 0.06 * kd + 0.05 * kf;
    let f = P(512 + 0 * kd, 300 + 10 * kd + 18 * kf);
    const hx = 512 / k, hy = 300 / k;
    f = P(clamp(f.x, hx, W - hx), clamp(f.y, hy, H - hy));
    return { k, f };
  }

  // ajustes que dependen de las poses (una vez)
  let ajustado = false;
  function ajusta() {
    if (ajustado) return; ajustado = true;
    THETA_MANO = angPlato(T.mano) + 0.3;
    DEDO_COGE = enDedo(cuerpoP(T.coge));
    MEMO.clear();
  }

  class GuillermoParadigmaVinilo extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !PD.listo()) return;
      if (!fondo) fondo = creaFondo();
      ajusta();
      const luz = tramo(t, NEGRO_INICIO, 0.8) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02));
      const pg = poseG(t), pp = Object.assign({}, poseP(t));
      g.save();
      const cam = camara(t);
      g.translate(512, 300); g.scale(cam.k, cam.k); g.translate(-cam.f.x, -cam.f.y);
      const M0 = g.getTransform();
      g.drawImage(fondo, 0, 0);
      luzLampara(g, t);
      dibLamina(g, t);
      dibLomoCaido(g, t);
      dibAltavozDerecho(g, t);
      ondas(g, t);
      // tocadiscos
      dibPlato(g, t);
      const d = disco(t, pp, pg), f = funda(t, pp);
      if (f.capa === "mesa") dibFunda(g, f);
      if (d.capa === "plato") dibDisco(g, d, t);
      dibBrazo(g, t);
      // sombras
      g.fillStyle = "rgba(10,6,4,0.35)"; sombra(g, pg, 58); sombra(g, pp, 60);
      // personajes (el disco y la funda en la mano se pintan como objetos de la mano)
      G.dibujar(g, pg, t);
      if (d.capa === "funda" || d.capa === "mano") pp.manoLejos = Object.assign({}, pp.manoLejos, { objeto: gg => { gg.save(); gg.setTransform(M0); dibDisco(gg, d, t); gg.restore(); } });
      if (d.capa === "dedo") pp.manoCerca = Object.assign({}, pp.manoCerca, { objeto: gg => { gg.save(); gg.setTransform(M0); dibDisco(gg, d, t); giroDedo(gg, t, d); gg.restore(); } });
      if (f.capa === "mano") pp.manoCerca = Object.assign({}, pp.manoCerca, { objeto: gg => { gg.save(); gg.setTransform(M0); dibFunda(gg, f); gg.restore(); } });
      PD.dibujar(g, pp, t);
      if (d.capa === "funda") soplido(g, t, d);
      rayasRascado(g, t);
      notas(g, t);
      if (d.capa === "aire") { estelaDisco(g, t, pp, pg); dibDisco(g, d, t); }
      dibLampara(g, t);
      impactos(g, t);
      bombillaIdea(g, t, pg);
      crujido(g, t, pg);
      sustoP(g, t, pp);
      guino(g, t, PD, pp, T.guinoP, P(780, 470));
      guino(g, t, G, pg, T.guinoG, P(770, 560));
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00105.2", nombre: "Guillermo y Paradigma · El vinilo", crear: () => new GuillermoParadigmaVinilo() });
  window.__A2D_00105_2 = { pose, T, DUR, ajusta, disco, brazoTocadiscos, dedoParadigma, puntoRascado, REB, camara, PL, R_DISCO, ESTANTE, LMP, LAMINA, angLamina, angLampara, NOTAS, bordeLampara, angAltavoz, ALT_D };
})();
