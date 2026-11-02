"use strict";
/* 00099 · Guillermo y Marta · El muñeco de nieve
 *
 * Negro → un parque nevado a media mañana, sobre una loma: pinos con nieve, una farola, un banco, montañas
 * al fondo y, a la derecha, el borde de la loma que baja a una vaguada; al otro lado se ve la ladera de
 * la colina de enfrente. Marta, con su bufanda, palmea la cabeza de su muñeco (los rastros de las bolas que
 * ha rodado siguen en la nieve) mientras Guillermo la mira → Marta le pone la cabeza, saca del bolsillo
 * una zanahoria y se la clava de nariz, dos ramitas de brazos, se quita su bufanda y se la anuda al muñeco y
 * le pone un gorro rojo con pompón; da un paso atrás, satisfecha (¡ting!) → Guillermo se pica, se frota las
 * manos, se da la vuelta, rasca la nieve con la puntera y empieza su propia bola empujándola con el pie: la
 * bola crece a cada empujón y deja su rastro → mira a cámara orgulloso, coge carrerilla y le da un buen
 * puntapié… y la bola se le escapa: rueda sola hasta el borde y se va cuesta abajo. Guillermo corre detrás y
 * se queda en el borde haciendo el molinillo con los brazos → en la colina de enfrente asoma su bola,
 * más gorda, subiendo la ladera; se para arriba; Guillermo suspira, se encoge de hombros a cámara y vuelve
 * silbando… mientras la bola, a su espalda, rueda otra vez hacia la vaguada → retumba el suelo, cae nieve
 * del pino; Guillermo se congela, mira atrás y se da la vuelta: por el borde sube una bola GIGANTE que se le
 * viene encima → ¡pum!, una nube de nieve: la bola se lo traga y frena derrapando a un palmo del muñeco de
 * Marta (que se tapa la boca con los ojos apretados) → Guillermo queda metido en la bola: solo le asoman la
 * cabeza, los brazos en alto y las zapatillas, como un muñeco de nieve más → Marta se ríe, saca otra zanahoria
 * del bolsillo y se la lanza: se le clava en la nariz; luego coge el gorro de su muñeco y se lo lanza a la
 * cabeza → a Guillermo le pica la nariz… ah… ah… ¡achís!: el gorro sale volando y vuelve a caer en la cabeza
 * del muñeco de Marta. Marta aplaude y le guiña un ojo a la cámara → negro.
 *
 * Bolas: contorno con bultitos que giran con la bola y motas que giran con ella (la silueta es un círculo).
 * Dentro de la bola gigante Guillermo se dibuja recortado fuera del círculo (clip «evenodd»), así solo asoma
 * lo que sale de la nieve. Ningún personaje da vueltas enteras (los giros son aplastados en 2D). Sin textos.
 * Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, hash, ruido } = M2;
  const G = Guillermo, M = Marta;
  const S = 0.30, SUELO = 520, DUR = 15.0, TAU = Math.PI * 2;

  const T = {
    entra: 0.8,
    // Marta termina su muñeco
    cab0: 0.62, cabPon: 1.12, cab1: 1.3,
    zan0: 1.3, zanSale: 1.48, zanPon: 1.78, zan1: 1.95,
    ram0: 1.95, ramSale: 2.12, ramD: 2.36, ramPasa: 2.5, ramI: 2.76, ram1: 2.92,
    buf0: 2.92, bufSuelta: 3.16, bufPon: 3.42, buf1: 3.56,
    gor0: 3.56, gorSale: 3.72, gorPon: 3.98, gor1: 4.12,
    atras0: 4.12, atras1: 4.45, brillo: 4.36,
    // Guillermo hace su bola
    frota0: 2.42, frota1: 2.86, vuelta0: 2.86, vuelta1: 3.04,
    rasca0: 3.06, rasca1: 3.4,
    jarras0: 5.12, jarras1: 5.5, mira0: 5.2,
    arma0: 5.52, patada: 5.86,
    persigue0: 5.96, persigue1: 6.36, molino1: 6.86,
    // la bola en la colina de enfrente
    lejos0: 6.95, lejosCima: 7.6, lejosVuelve: 8.02, lejosFin: 8.45,
    alivio: 7.66, hombros0: 7.78, hombros1: 8.08,
    vuelta2_0: 8.08, vuelta2_1: 8.26, anda0: 8.26, anda1: 8.84,
    temblor0: 8.84, temblor1: 9.5, congela: 8.86, ojos: 9.0,
    vuelta3_0: 9.04, vuelta3_1: 9.2,
    gigante0: 8.95, golpe: 9.45, traga: 9.53, para: 10.35,
    nube0: 9.39, nubeMax: 9.45, nube1: 10.4,
    // dentro de la bola
    miraAbajo: 10.32, brazos0: 10.44, brazos1: 10.82, camara: 10.86,
    // Marta reacciona
    oh: 5.9, ve: 9.06, tapa0: 9.5, tapa1: 10.3, risa0: 10.5, risa1: 11.02,
    // zanahoria y gorro para Guillermo
    zan2_0: 11.04, zan2Sale: 11.2, zan2Arma: 11.33, lanzaZ: 11.48, zanLlega: 11.75,
    gorQ0: 11.8, gorQ: 12.0, gorArma: 12.13, lanzaG: 12.24, gorLlega: 12.56,
    aplaude0: 12.6, aplaude1: 12.94,
    // estornudo
    picor: 12.8, ah1: 13.0, ah2: 13.2, achis: 13.4, gorAterriza: 13.98,
    guino: 14.2, fin: 14.26
  };

  /* ---------- utilidades ---------- */
  const P = (x, y) => ({ x, y });
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function guion(lista, dic, base, t) {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const recorrido = (lista, t, f = suave) => {
    if (t <= lista[0][0]) return lista[0][1];
    for (let i = 1; i < lista.length; i++) if (t < lista[i][0]) return lerp(lista[i - 1][1], lista[i][1], f(fase(t, lista[i - 1][0], lista[i][0])));
    return lista[lista.length - 1][1];
  };
  const parpadeo = (t, lista, d = 0.15) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const D = (pu, ix, md, re) => ({ pulgar: pu, indice: ix, medio: md, anular: re, menique: re });
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const AGARRA = D(0.3, 0.3, 0.3, 0.3), PUNO = D(0, 0, 0, 0), ABIERTA = D(0.85, 1, 1, 1), FLOJA = D(0.5, 0.6, 0.55, 0.5);
  // pie: [t0, t1, x, alza] (x en pantalla del tobillo); entre plantas el pie se levanta en arco
  function pie(lista, t) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x, alza = 10] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    return { x: lerp(xa, x, suave5(u)), alza: alza * Math.sin(Math.PI * u), u };
  }

  /* ---------- terreno ---------- */
  const BORDE = 770;                                   // donde la loma empieza a caer
  const suelo = x => x <= BORDE ? SUELO : SUELO + 0.006 * (x - BORDE) * (x - BORDE);
  const pend = x => x <= BORDE ? 0 : 0.012 * (x - BORDE);
  const yLoma = x => x < 700 ? 432 : Math.min(432 + 0.006 * (x - 700) * (x - 700), suelo(x));   // borde de atrás de la loma
  const yEnfrente = x => 432 + 0.0034 * (x - 990) * (x - 990);                // colina de enfrente (cima en x = 990)
  // centro de una bola de radio r apoyada en el suelo en x (contacto)
  function centroSobre(x, r) {
    const d = pend(x), L = Math.hypot(1, d);
    return P(x + d * r / L, suelo(x) - r / L);
  }

  /* ---------- manos ---------- */
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { cerca: punoDesde(P(131, 652), -1.75), lejos: punoDesde(P(372, 648), -1.75) };
  function bolsillo(Pj, p, lado) {
    if (Pj === G) { const b = G.tronco(p)(BOLS_G[lado]); return { x: b.x, y: b.y, ang: 0, mu: -1.75, puno: 0, dobla: lado === "cerca" ? -1 : 1, dedos: D(0.4, 0.4, 0.4, 0.4) }; }
    const m = Pj.manoReposo(p, lado); return Object.assign({ dedos: D(0.4, 0.4, 0.4, 0.4) }, m);
  }
  // mano en `scr` (pantalla); si el brazo no llega, se queda donde llega
  function manoEn(Pj, p, lado, scr, o = {}) {
    const h = Pj.tronco(p)(lado === "cerca" ? Pj.HOMBRO_C : Pj.HOMBRO);
    let q = Pj.aHoja(p, scr);
    const L = (lado === "cerca" ? Pj.BRAZO_C_L : Pj.BRAZO_L) * 1.03;
    const mu = o.mu ?? (Math.atan2(h.y - q.y, h.x - q.x) + (o.dmu || 0));
    let w = { x: q.x + Math.cos(mu) * R_M, y: q.y + Math.sin(mu) * R_M };
    const d = Math.hypot(w.x - h.x, w.y - h.y);
    if (d > L) { const k = L / d; w = { x: h.x + (w.x - h.x) * k, y: h.y + (w.y - h.y) * k }; q = { x: w.x - Math.cos(mu) * R_M, y: w.y - Math.sin(mu) * R_M }; }
    return { x: q.x, y: q.y, ang: 0, mu, dobla: o.dobla ?? (lado === "cerca" ? -1 : 1), puno: o.puno ?? 1, dedos: o.dedos || AGARRA };
  }
  function mezclaMano(a, b, k) {
    if (k <= 0) return a; if (k >= 1) return b;
    let dm = b.mu - a.mu; while (dm > Math.PI) dm -= TAU; while (dm < -Math.PI) dm += TAU;
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), ang: 0, mu: a.mu + dm * k, dobla: k < 0.5 ? a.dobla : b.dobla,
      puno: lerp(a.puno ?? 1, b.puno ?? 1, k), dedos: DD(a.dedos || AGARRA, b.dedos || AGARRA, k) };
  }
  function pista(lista, t, p) {
    let c = lista[0][2](p);
    for (let i = 1; i < lista.length; i++) { const [t0, t1, f, e] = lista[i]; if (t <= t0) break; c = mezclaMano(c, f(p), (e || suave)(fase(t, t0, t1))); }
    return c;
  }
  const centroMano = (Pj, p, m) => Pj.aPantalla(p, { x: m.x, y: m.y });
  const aPant = (Pj, p, q) => Pj.aPantalla(p, Pj.tronco(p)(q));      // hoja del torso → pantalla

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
   * LAS BOLAS
   * ===================================================================================== */
  // bola de Guillermo: empujones con el pie (x de contacto)
  const XB0 = 566, R0 = 9, KR = 0.32;
  const EMP = [[3.42, 566, 598], [3.84, 598, 632], [4.26, 632, 666], [4.68, 666, 700]];
  const radioPie = x => R0 + KR * Math.max(0, x - XB0);
  const R700 = radioPie(700);
  const rodado = x => x <= 700 ? Math.log(radioPie(x) / R0) / KR : Math.log(R700 / R0) / KR + (x - 700) / (R700 + 0.05 * (x - 700));
  function xBolaG(t) {
    if (t < T.patada) { let x = XB0; for (const [tp, a, b] of EMP) x = lerp(x, b, suave(fase(t, tp + 0.12, tp + 0.34))) + 0 * a; return x; }
    const tau = t - T.patada; return 700 + 250 * tau + 330 * tau * tau;
  }
  function bolaG(t) {
    if (t < T.rasca1 - 0.06) return null;
    const x = xBolaG(t), r = x <= 700 ? radioPie(x) : R700 + 0.1 * (x - 700);
    const c = centroSobre(x, r);
    if (c.y - r > H + 40) return null;
    return { x, r, cx: c.x, cy: c.y, rot: rodado(x) };
  }
  // bola en la colina de enfrente
  function bolaLejos(t) {
    if (t < T.lejos0 || t > T.lejosFin) return null;
    let x, r;
    if (t < T.lejosCima) { const u = salida(fase(t, T.lejos0, T.lejosCima)); x = lerp(800, 962, u); r = lerp(15, 18, u); }
    else if (t < T.lejosVuelve) { const k = t - T.lejosCima; x = 962 + 2.4 * Math.sin(k * 13) * Math.exp(-k * 5); r = 18; }
    else { const u = entrada(fase(t, T.lejosVuelve, T.lejosFin)); x = lerp(962, 784, u); r = lerp(18, 23, u); }
    return { x, r, cx: x, cy: yEnfrente(x) - r * 0.95, rot: -(x - 800) / 16 };
  }
  // bola gigante: sube por la ladera, se traga a Guillermo y frena derrapando
  const RG = 132, XG_PARA = 486, XG_GOLPE = 708;
  function xGigante(t) {
    if (t < T.golpe) { const u = fase(t, T.gigante0, T.golpe); return lerp(958, XG_GOLPE, u * (1.12 - 0.12 * u)); }
    const u = fase(t, T.golpe, T.para); return XG_GOLPE - (XG_GOLPE - XG_PARA) * (1 - (1 - u) * (1 - u));
  }
  function bolaGig(t) {
    if (t < T.gigante0) return null;
    const x = xGigante(t), con = t >= T.golpe;
    const c = con ? P(x, SUELO - RG) : centroSobre(x, RG);
    const rot = con ? -(958 - XG_GOLPE) / RG * 1.6 : -(958 - Math.min(x, 958)) / RG * 1.6;
    return { x, r: RG, cx: c.x, cy: c.y, rot, con };
  }
  // vaivén de la bola gigante con Guillermo dentro (alrededor del punto de apoyo)
  function vaiven(t) {
    if (t < T.golpe) return 0;
    let a = 0.11 * Math.sin(Math.PI * fase(t, T.golpe, T.para));
    if (t > T.para) { const k = t - T.para; a += -0.085 * Math.exp(-k * 3.2) * Math.sin(k * 10); }
    a += 0.025 * Math.sin((t - T.brazos0) * 15) * campana(t, T.brazos0, T.brazos1);
    if (t > T.achis) { const k = t - T.achis; a += -0.07 * Math.exp(-k * 4) * Math.sin(k * 13 + 0.4); }
    return a;
  }

  /* =====================================================================================
   * EL MUÑECO DE MARTA
   * ===================================================================================== */
  const XS = 280;
  const MU = { abajo: P(XS, SUELO - 58), rA: 62, medio: P(XS, 376), rM: 46, cab: P(XS, 310), rC: 32 };
  const NARIZ_S = P(XS - 9, 313), CUELLO_S = P(XS, 340), COPA_S = P(XS, 279);
  const RAMA_D = { base: P(XS + 26, 350), ang: -0.72 }, RAMA_I = { base: P(XS - 26, 350), ang: Math.PI + 1.0 }, RAMA_L = 52;
  const enRama = (r, d) => P(r.base.x + Math.cos(r.ang) * d, r.base.y + Math.sin(r.ang) * d);
  const ZAN_L = 26, ZAN_A = Math.PI - 0.12;      // la nariz mira hacia Marta
  // cabeza que sostiene Marta antes de ponerla
  function cabezaSuelta(t) {
    if (t >= T.cabPon) return null;
    const pal = 3 * Math.abs(Math.sin(t * 9)) * (1 - tramo(t, T.cab0 - 0.1, T.cab0));
    const B0 = P(233, 287 + pal * 0.4), A = P(262, 264), B1 = MU.cab;
    const u = fase(t, T.cab0, T.cabPon);
    if (u <= 0) return B0;
    const a = suave(u), q1 = mezcla(B0, A, a), q2 = mezcla(A, B1, a);
    return mezcla(q1, q2, a);
  }
  const balanceoMuneco = t => 0.055 * Math.exp(-Math.max(0, t - T.para + 0.05) * 3) * Math.sin(Math.max(0, t - T.para + 0.05) * 11) * tramo(t, T.para - 0.07, T.para - 0.01)
    + 0.03 * Math.exp(-Math.max(0, t - T.gorAterriza) * 4) * Math.sin(Math.max(0, t - T.gorAterriza) * 12) * tramo(t, T.gorAterriza - 0.01, T.gorAterriza + 0.03);

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  const CG = {
    mira: E({ mx: 0.85, my: 0.3, sd: 12, si: 12, abre: 3, ancho: 0.8, sonr: 0.3 }),
    asombro: E({ mx: 0.88, my: 0.3, iris: 1.12, sd: 22, si: 22, abre: 14, ancho: 0.65, sonr: 0.2 }),
    pique: E({ mx: -0.85, my: 0, c: 0.35, sd: -4, gd: -0.15, si: 14, gi: 0.12, sonr: 0.85, ancho: 1.05 }),
    concentra: E({ mx: 0.6, my: 0.95, c: 0.22, sd: -6, gd: -0.1, si: -6, gi: -0.1, sonr: 0.2, abre: 6, ancho: 0.8, lengua: 1 }),
    orgullo: E({ mx: -0.85, my: 0, c: 0.32, h: 0.4, sd: 12, si: 12, sonr: 1, abre: 6, ancho: 1.05 }),
    esfuerzo: E({ mx: 0.7, my: 0.6, c: 0.6, z: 0.6, sd: -8, si: -8, sonr: 0.4, abre: 10 }),
    oh: E({ mx: 0.9, my: 0.4, iris: 0.8, sd: 26, si: 26, abre: 22, ancho: 0.6, sonr: -0.1 }),
    panico: E({ mx: 0.6, my: 0.8, iris: 0.7, sd: 28, gd: 0.2, si: 28, gi: 0.2, abre: 26, ancho: 0.75, sonr: -0.4 }),
    miraLejos: E({ mx: 0.88, my: 0.55, c: 0.35, sd: 6, si: 6, sonr: 0, abre: 2 }),
    alivio: E({ mx: 0.85, my: 0.4, c: 1, h: 0.3, sd: 10, si: 10, sonr: 0.5, abre: 8 }),
    encoge: E({ mx: -0.85, my: 0, c: 0.3, sd: 20, gd: 0.15, si: 20, gi: 0.15, sonr: 0.6, ancho: 0.9 }),
    silba: E({ mx: 0.5, my: -0.55, c: 0.3, sd: 14, si: 14, sonr: 0.1, abre: 7, ancho: 0.32 }),
    congela: E({ mx: 0.9, my: 0, iris: 0.7, sd: 24, si: 24, abre: 3, ancho: 0.55, sonr: -0.2 }),
    atras: E({ mx: -0.95, my: 0, iris: 0.62, sd: 26, si: 26, abre: 3, ancho: 0.55, sonr: -0.2 }),
    terror: E({ mx: 0.92, my: -0.2, iris: 0.55, sd: 30, gd: 0.25, si: 30, gi: 0.25, abre: 34, ancho: 0.8, sonr: -0.5 }),
    aturdido: E({ mx: 0.3, my: 0.1, iris: 0.85, c: 0.3, sd: 6, si: 6, abre: 10, ancho: 0.7, sonr: -0.2 }),
    abajo: E({ mx: 0.15, my: 1, iris: 0.85, sd: 18, si: 18, abre: 6, ancho: 0.6, sonr: -0.1 }),
    resignado: E({ mx: -0.85, my: 0.05, c: 0.45, sd: 4, gd: -0.12, si: 4, gi: -0.12, sonr: -0.3, abre: 0 }),
    zanahoria: E({ mx: 0.4, my: 1, iris: 0.72, sd: 20, si: 20, abre: 8, ancho: 0.6, sonr: -0.2 }),
    arriba: E({ mx: 0.4, my: -1, iris: 0.8, sd: 24, si: 24, abre: 4, sonr: -0.1 }),
    picor: E({ mx: 0.35, my: 0.95, c: 0.5, sd: 10, gd: 0.1, si: 10, gi: 0.1, abre: 6, ancho: 0.7, sonr: -0.1 }),
    ah: E({ c: 0.8, z: 0.3, sd: 22, si: 22, abre: 20, ancho: 0.8, sonr: -0.1 }),
    achis: E({ c: 1, z: 1, sd: -6, si: -6, abre: 28, ancho: 1, sonr: 0.1 }),
    final: E({ mx: -0.85, my: 0.05, c: 0.35, sd: 10, gd: 0.08, si: 10, gi: 0.08, abre: 3, sonr: 0.15, rub: 0.6 })
  };
  const GUION_CG = [
    [0.9, 1.1, "asombro"], [2.0, 2.2, "mira"], [T.frota0 + 0.08, T.frota0 + 0.22, "pique"], [T.vuelta0 + 0.05, T.vuelta1, "concentra"],
    [T.mira0, T.mira0 + 0.12, "orgullo"], [T.arma0, T.arma0 + 0.15, "esfuerzo"], [T.patada + 0.05, T.patada + 0.15, "oh"],
    [T.persigue1 - 0.05, T.persigue1 + 0.05, "panico"], [T.molino1, T.molino1 + 0.15, "miraLejos"], [T.alivio, T.alivio + 0.15, "alivio"],
    [T.hombros0, T.hombros0 + 0.12, "encoge"], [T.anda0, T.anda0 + 0.12, "silba"], [T.congela, T.congela + 0.06, "congela"],
    [T.ojos, T.ojos + 0.08, "atras"], [T.vuelta3_1 - 0.04, T.vuelta3_1 + 0.06, "terror"], [T.nubeMax, T.nubeMax + 0.1, "aturdido"],
    [T.miraAbajo, T.miraAbajo + 0.12, "abajo"], [T.camara, T.camara + 0.14, "resignado"], [T.zanLlega, T.zanLlega + 0.1, "zanahoria"],
    [T.gorLlega, T.gorLlega + 0.12, "arriba"], [T.picor, T.picor + 0.12, "picor"], [T.ah1, T.ah1 + 0.1, "ah"],
    [T.achis - 0.03, T.achis, "achis", x => x], [T.achis + 0.22, T.achis + 0.4, "zanahoria"], [14.06, 14.2, "final"]
  ];
  const PARP_G = [1.7, 3.3, 4.5, 6.98, 7.95, 10.62, 11.35, 12.4, 14.1, 14.55];
  const CUER_G = {
    base: CU({}),
    mira: CU({ torso: -0.03, cab: 0.08, cdy: 4 }),
    frota: CU({ pel: 8, torso: 0.06, cab: 0.04 }),
    agacha: CU({ pel: 30, torso: 0.22, cab: 0.18, cdy: 6 }),
    jarras: CU({ pel: -4, torso: -0.06, cab: -0.06 }),
    arma: CU({ pel: 20, torso: -0.18, cab: -0.08 }),
    patada: CU({ pel: 6, torso: 0.12, cab: 0.05 }),
    corre: CU({ pel: 12, torso: 0.2, cab: 0.04 }),
    borde: CU({ pel: 14, torso: 0.34, cab: 0.2, cdy: 6 }),
    mirar: CU({ pel: 6, torso: 0.1, cab: 0.16, cdy: 4 }),
    encoge: CU({ pel: -6, torso: -0.04, cab: -0.06, cdy: -6 }),
    anda: CU({ pel: 4, torso: 0.04, cab: -0.04 }),
    congela: CU({ pel: 10, torso: 0.0, cab: 0.0 }),
    terror: CU({ pel: 26, torso: -0.2, cab: -0.12 })
  };
  const GUION_CUG = [
    [0.4, 0.8, "mira"], [T.frota0, T.frota0 + 0.2, "frota"], [T.rasca0, T.rasca0 + 0.15, "agacha"], [T.jarras0, T.jarras0 + 0.2, "jarras"],
    [T.arma0, T.patada - 0.05, "arma"], [T.patada - 0.05, T.patada + 0.08, "patada"], [T.persigue0, T.persigue0 + 0.12, "corre"],
    [T.persigue1, T.persigue1 + 0.1, "borde"], [T.molino1, T.molino1 + 0.25, "mirar"], [T.hombros0, T.hombros0 + 0.12, "encoge"],
    [T.anda0, T.anda0 + 0.15, "anda"], [T.congela, T.congela + 0.06, "congela"], [T.vuelta3_1 - 0.05, T.vuelta3_1 + 0.08, "terror"]
  ];
  // vueltas de Guillermo: empieza mirando a la izquierda (a Marta)
  const GIROS_G = [[T.vuelta0, T.vuelta1], [T.vuelta2_0, T.vuelta2_1], [T.vuelta3_0, T.vuelta3_1]];
  function frenteG(t) {           // −1 mira a la izquierda, +1 a la derecha (cos del giro aplastado)
    let sg = -1;
    for (const [a, b] of GIROS_G) {
      if (t <= a) return sg;
      if (t < b) return sg * Math.cos(Math.PI * suave(fase(t, a, b)));
      sg = -sg;
    }
    return sg;
  }
  // x de la pelvis, pies y botes
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  function piernaG(p, lado, sx, alza, ang = 0) {
    p.piernas[lado] = { tob: P(G.PELVIS.x + (sx - p.x) / S * (p.espejo ? -1 : 1), TOB_G - (lado === "lejos" ? 12 : 0) - alza / S), ang };
  }
  // pie de delante en los empujones (contacto con la parte de atrás de la bola)
  const PUNTA_G = P(G.PUNTA.x * S, G.PUNTA.y * S);
  function contactoBola(x) { const r = radioPie(x); return P(x - 0.9 * r, SUELO - r + 0.42 * r); }
  function pieEmpuje(t) {
    // devuelve {x, alza, ang} del tobillo del pie de delante (lejos), o null si no está empujando
    for (let i = 0; i < EMP.length; i++) {
      const [tp, a, b] = EMP[i];
      if (t < tp || t > tp + 0.48) continue;
      const ang = -0.22, toe = P(PUNTA_G.x * Math.cos(ang) - PUNTA_G.y * Math.sin(ang), PUNTA_G.x * Math.sin(ang) + PUNTA_G.y * Math.cos(ang));
      const ca = contactoBola(a), cb = contactoBola(b);
      const enA = P(ca.x - toe.x, ca.y - toe.y), enB = P(cb.x - toe.x, cb.y - toe.y);
      const ini = P(i === 0 ? 506 : contactoBola(a).x - toe.x - 14, SUELO - G.TOBILLO_ALTO * S);
      const fin = P(cb.x - toe.x - 10, SUELO - G.TOBILLO_ALTO * S);
      const y0 = SUELO - G.TOBILLO_ALTO * S;
      if (t < tp + 0.12) { const u = suave(fase(t, tp, tp + 0.12)); const q = mezcla(ini, enA, u); return { x: q.x, alza: y0 - q.y + 8 * Math.sin(Math.PI * u), ang: ang * u }; }
      if (t < tp + 0.34) { const u = suave(fase(t, tp + 0.12, tp + 0.34)); const q = mezcla(enA, enB, u); return { x: q.x, alza: y0 - q.y, ang }; }
      const u = suave(fase(t, tp + 0.34, tp + 0.48)); const q = mezcla(enB, fin, u); return { x: q.x, alza: (y0 - q.y) * (1 - u) + 6 * Math.sin(Math.PI * u), ang: ang * (1 - u) };
    }
    return null;
  }
  // plantas de los pies (x del tobillo en pantalla)
  const PIES_G = {
    // lejos = pie de delante mirando a la derecha
    lejos: [[-9, -8, 448], [T.vuelta0, T.vuelta1, 494, 6],
      [T.rasca0, T.rasca0 + 0.1, 514, 4], [T.rasca0 + 0.1, T.rasca0 + 0.2, 500, 3], [T.rasca0 + 0.2, T.rasca0 + 0.3, 518, 4], [T.rasca1 - 0.06, T.rasca1, 504, 3]],
    cerca: [[-9, -8, 492], [T.vuelta0, T.vuelta1, 452, 6],
      [EMP[0][0] + 0.3, EMP[0][0] + 0.46, 486, 9], [EMP[1][0] + 0.3, EMP[1][0] + 0.46, 520, 9], [EMP[2][0] + 0.3, EMP[2][0] + 0.46, 556, 9],
      [EMP[3][0] + 0.3, EMP[3][0] + 0.46, 590, 9]]
  };
  const PIE_BASE_L = 616;                    // donde queda el pie de delante tras el último empujón
  // carrera, borde, vuelta atrás: posiciones a mano
  function piesG(t, p) {
    const y0 = 0;
    let L = null, C = null;
    if (t < T.rasca0) { L = pie(PIES_G.lejos.slice(0, 2), t); C = pie(PIES_G.cerca.slice(0, 2), t); }
    else if (t < EMP[0][0]) { L = pie(PIES_G.lejos.slice(0, 6), t); C = { x: 452, alza: 0, u: 0 }; }
    else if (t < T.arma0) {
      const e = pieEmpuje(t);
      // entre empujones el pie de delante descansa donde aterrizó
      let base = 504;
      for (const [tp, , b] of EMP) if (t > tp + 0.48) base = contactoBola(b).x - (PUNTA_G.x) - 10;
      L = e ? { x: e.x, alza: e.alza, ang: e.ang } : { x: base, alza: 0 };
      C = pie(PIES_G.cerca.slice(1), t);
    }
    else if (t < T.persigue0) {
      // carga: el pie de delante va atrás y arriba; puntapié en T.patada
      const base = contactoBola(700).x - PUNTA_G.x - 10;            // ≈ 610
      const c = contactoBola(700), ang = -0.3;
      const golpe = P(c.x - (PUNTA_G.x * Math.cos(ang) - PUNTA_G.y * Math.sin(ang)), c.y - (PUNTA_G.x * Math.sin(ang) + PUNTA_G.y * Math.cos(ang)));
      const y0b = SUELO - G.TOBILLO_ALTO * S;
      if (t < T.arma0 + 0.22) { const u = suave(fase(t, T.arma0, T.arma0 + 0.22)); L = { x: lerp(base, base - 70, u), alza: 46 * u, ang: 0.5 * u }; }
      else if (t < T.patada) { const u = entrada(fase(t, T.arma0 + 0.26, T.patada)); L = { x: lerp(base - 70, golpe.x, u), alza: lerp(46, y0b - golpe.y, u), ang: lerp(0.5, ang, u) }; }
      else { const u = salida(fase(t, T.patada, T.persigue0)); L = { x: lerp(golpe.x, golpe.x + 34, u), alza: lerp(y0b - golpe.y, 30, u), ang: lerp(ang, -0.4, u) }; }
      C = { x: 590 - 6 * tramo(t, T.arma0, T.arma0 + 0.2) + 6 * tramo(t, T.patada - 0.05, T.patada + 0.1), alza: 0 };
    }
    else if (t < T.persigue1) {
      // tres zancadas hasta el borde
      const pasos = [[T.persigue0, T.persigue0 + 0.14, 0], [T.persigue0 + 0.14, T.persigue0 + 0.27, 1], [T.persigue0 + 0.27, T.persigue1, 0]];
      const xs = { lejos: [650, 692, 692, 740], cerca: [590, 590, 666, 666] };
      // pie de delante: 650 → 692 (paso 0) → 740 (paso 2); de atrás: 590 → 666 (paso 1)
      const pl = t < pasos[0][1] ? { x: lerp(650, 700, suave(fase(t, pasos[0][0], pasos[0][1]))), alza: 22 * campana(t, pasos[0][0], pasos[0][1]) }
        : t < pasos[2][0] ? { x: 700, alza: 0 } : { x: lerp(700, 742, suave(fase(t, pasos[2][0], pasos[2][1]))), alza: 18 * campana(t, pasos[2][0], pasos[2][1]) };
      const pc = t < pasos[1][0] ? { x: 590, alza: 8 * tramo(t, pasos[0][0], pasos[0][1]) } : t < pasos[1][1] ? { x: lerp(590, 676, suave(fase(t, pasos[1][0], pasos[1][1]))), alza: 24 * campana(t, pasos[1][0], pasos[1][1]) } : { x: 676, alza: 0 };
      L = pl; C = pc; void xs;
    }
    else if (t < T.vuelta2_0) {
      // molinillo: a la pata coja en el borde (el de atrás levantado), y luego de pie mirando
      const mol = 1 - tramo(t, T.molino1 - 0.12, T.molino1 + 0.08);
      L = { x: 742, alza: 0 };
      C = { x: lerp(676, 700, 1 - mol) - 22 * mol, alza: 34 * mol * (0.8 + 0.2 * Math.sin(t * 17)) , ang: 0.3 * mol };
    }
    else if (t < T.anda0) { L = { x: 742, alza: 0 }; C = { x: 700, alza: 0 }; }
    else {
      // vuelve hacia la izquierda: mirando a la izquierda el pie de delante es el «lejos»
      const lis = { lejos: [[-9, -8, 742], [T.anda0, T.anda0 + 0.2, 672, 16], [T.anda0 + 0.4, T.anda0 + 0.58, 610, 16], [T.vuelta3_0 + 0.02, T.vuelta3_1, 636, 6]],
        cerca: [[-9, -8, 700], [T.anda0 + 0.2, T.anda0 + 0.4, 640, 16], [T.congela - 0.04, T.congela + 0.06, 632, 22], [T.vuelta3_0, T.vuelta3_1 - 0.02, 584, 8]] };
      L = pie(lis.lejos, t); C = pie(lis.cerca, t);
      // congelado a media zancada: el de atrás se queda en el aire
      if (t > T.congela && t < T.vuelta3_0) C = { x: 626, alza: 20 + 1.5 * Math.sin(t * 40), u: 0.5 };
    }
    return { L, C };
  }
  const XG = [[0, 470], [T.vuelta0, 470], [T.vuelta1, 472]];
  function xPelvisG(t, pies) {
    if (t < T.rasca0) return recorrido(XG, t);
    if (t < T.persigue0) return lerp(pies.C.x, pies.L.x, 0.55) - 8;
    if (t < T.persigue1) return lerp(pies.C.x, pies.L.x, 0.6) - 6;
    if (t < T.anda0) return lerp(pies.C.x, pies.L.x, 0.5) - 4 + (t < T.molino1 ? 10 * Math.sin((t - T.persigue1) * 9) * (1 - tramo(t, T.molino1 - 0.2, T.molino1)) : 0);
    return lerp(pies.C.x, pies.L.x, 0.5);
  }

  function poseG(t) {
    const b = guion(GUION_CUG, CUER_G, "base", t);
    const respira = Math.sin(t * 2.3);
    const fG = frenteG(t), esp = fG < 0;
    const p = { x: 470, suelo: SUELO, s: S, tirasLimpias: true, ikContinuo: false, hombrosContinuos: true, hombrosRecortados: true,
      espejo: esp, giroX: Math.max(0.06, Math.abs(fG)),
      pelvis: P(G.PELVIS.x, G.PELVIS.y + b.pel + respira * 1.2), torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } } };
    p.dentro = t >= T.traga;
    if (p.dentro) return poseDentro(t, p);
    const pies = piesG(t, p);
    p.x = xPelvisG(t, pies);
    // botes al correr y al empujar
    if (t > T.persigue0 && t < T.persigue1) p.pelvis.y -= 22 * Math.abs(Math.sin(Math.PI * (t - T.persigue0) / 0.135));
    // molinillo: el cuerpo se balancea sobre el borde
    const mol = campana(t, T.persigue1 - 0.05, T.molino1 + 0.1);
    p.torso += 0.16 * Math.sin((t - T.persigue1) * 11) * mol;
    // al andar
    if (t > T.anda0 && t < T.congela) p.pelvis.y -= 8 * Math.abs(Math.sin(Math.PI * (t - T.anda0) / 0.2));
    // congelado: tiembla un poco
    const tiemb = tramo(t, T.congela, T.congela + 0.05) * (1 - tramo(t, T.vuelta3_0, T.vuelta3_0 + 0.05));
    p.torso += 0.01 * Math.sin(t * 47) * tiemb;
    // terror: tiembla y se echa atrás
    const ter = tramo(t, T.vuelta3_1 - 0.05, T.vuelta3_1 + 0.05);
    p.torso += 0.02 * Math.sin(t * 53) * ter;
    // la cabeza sigue a la bola lejana / a Marta
    if (t < T.frota0) p.cabeza.ang += 0.05 * Math.sin(t * 1.6);
    p.cabeza.ang += 0.12 * Math.sin((t - T.alivio) * 9) * campana(t, T.alivio, T.alivio + 0.35) * 0.4;
    // pies
    piernaG(p, "lejos", pies.L.x, pies.L.alza, pies.L.ang || 0);
    piernaG(p, "cerca", pies.C.x, pies.C.alza, pies.C.ang || 0);
    // cara
    const e = guion(GUION_CG, CG, "mira", t);
    // mira la bola lejana: los ojos la siguen
    const bl = bolaLejos(t);
    if (bl && t > T.molino1 && t < T.hombros0) { e.my = lerp(0.55, 0.25, clamp((600 - bl.cy) / 120)); }
    if (t > 1.3 && t < T.frota0) e.my = 0.3 + 0.15 * Math.sin(t * 2);
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.sudor = 0.7 * campana(t, T.congela, T.golpe + 0.05) + 0.4 * campana(t, T.persigue1, T.molino1 + 0.1);
    p.rojo = 0.25 * campana(t, T.arma0, T.patada + 0.15);
    manosG(t, p);
    return p;
  }
  // manos de Guillermo de pie
  function manosG(t, p) {
    const Tr = G.tronco(p);
    const bc = q => bolsillo(G, q, "cerca"), bl = q => bolsillo(G, q, "lejos");
    const pecho = q => aPant(G, q, P(262, 470));
    const dir = p.espejo ? -1 : 1;
    const frotaC = q => { const c = pecho(q), k = Math.sin((t - T.frota0) * 26); return manoEn(G, q, "cerca", P(c.x - 4 * dir, c.y + 6 + 5 * k), { dedos: D(0.6, 0.85, 0.85, 0.8) }); };
    const frotaL = q => { const c = pecho(q), k = Math.sin((t - T.frota0) * 26); return manoEn(G, q, "lejos", P(c.x + 8 * dir, c.y - 2 - 5 * k), { dedos: D(0.6, 0.85, 0.85, 0.8) }); };
    const caderaC = q => manoEn(G, q, "cerca", aPant(G, q, P(118, 628)), { dedos: PUNO, dobla: 1 });
    const caderaL = q => manoEn(G, q, "lejos", aPant(G, q, P(392, 626)), { dedos: PUNO, dobla: 1 });
    // equilibrio al cargar el puntapié y al correr
    const sh = (q, lado) => aPant(G, q, lado === "cerca" ? G.HOMBRO_C : G.HOMBRO);
    const bal = (q, lado, ang, R = 80) => { const h = sh(q, lado); return manoEn(G, q, lado, P(h.x + Math.cos(ang) * R * dir, h.y + Math.sin(ang) * R), { dedos: FLOJA, dobla: lado === "cerca" ? -1 : 1 }); };
    const cargaC = q => bal(q, "cerca", 2.6, 76), cargaL = q => bal(q, "lejos", -0.5, 70);
    const corrC = q => bal(q, "cerca", 1.57 + 0.9 * Math.sin((t - T.persigue0) * 23), 78), corrL = q => bal(q, "lejos", 1.57 - 0.9 * Math.sin((t - T.persigue0) * 23), 70);
    const w = (t - T.persigue1) * 13;
    const molC = q => bal(q, "cerca", -w, 74), molL = q => bal(q, "lejos", -w + Math.PI, 66);
    const encC = q => manoEn(G, q, "cerca", aPant(G, q, P(-10, 560)), { dedos: ABIERTA, dobla: 1, mu: -0.15 });
    const encL = q => manoEn(G, q, "lejos", aPant(G, q, P(530, 556)), { dedos: ABIERTA, dobla: 1, mu: Math.PI + 0.15 });
    const H = q => G.centroCabeza(q), cab = q => G.aPantalla(q, H(q));
    const terC = q => { const c = cab(q); return manoEn(G, q, "cerca", P(c.x - 62 * dir, c.y + 30 + 4 * Math.sin(t * 50)), { dedos: ABIERTA, dobla: 1 }); };
    const terL = q => { const c = cab(q); return manoEn(G, q, "lejos", P(c.x + 58 * dir, c.y + 34 + 4 * Math.sin(t * 47)), { dedos: ABIERTA, dobla: -1 }); };
    p.manoCerca = pista([
      [0, 0, bc], [T.frota0, T.frota0 + 0.16, frotaC], [T.frota1 - 0.06, T.vuelta1, bc],
      [T.jarras0, T.jarras0 + 0.18, caderaC], [T.arma0, T.arma0 + 0.18, cargaC], [T.persigue0, T.persigue0 + 0.08, corrC],
      [T.persigue1 - 0.04, T.persigue1 + 0.06, molC], [T.molino1, T.molino1 + 0.2, caderaC], [T.hombros0, T.hombros0 + 0.14, encC],
      [T.hombros1, T.anda0, bc], [T.vuelta3_0 + 0.05, T.vuelta3_1 + 0.05, terC]
    ], t, p);
    p.manoLejos = pista([
      [0, 0, bl], [T.frota0, T.frota0 + 0.16, frotaL], [T.frota1 - 0.06, T.vuelta1, bl],
      [T.jarras0, T.jarras0 + 0.18, caderaL], [T.arma0, T.arma0 + 0.18, cargaL], [T.persigue0, T.persigue0 + 0.08, corrL],
      [T.persigue1 - 0.04, T.persigue1 + 0.06, molL], [T.molino1, T.molino1 + 0.2, caderaL], [T.hombros0, T.hombros0 + 0.14, encL],
      [T.hombros1, T.anda0, bl], [T.vuelta3_0 + 0.05, T.vuelta3_1 + 0.05, terL]
    ], t, p);
  }
  // Guillermo metido en la bola: sentado, brazos en alto, zapatillas fuera
  const PIEL_DENTRO = 0;
  function poseDentro(t, p) {
    const bg = bolaGig(t);
    p.espejo = false; p.giroX = 1;
    p.x = bg.cx;
    // pelvis en el centro de la bola
    p.pelvis = P(G.PELVIS.x, G.PELVIS.y + (bg.cy + 10 - (SUELO - (G.SUELO - G.PELVIS.y) * S)) / S);
    const respira = Math.sin(t * 2.3);
    p.torso = -0.04 + 0.02 * respira;
    p.cabeza.ang = 0; p.cabeza.dy = 0;
    // cabeza: se mira, mira a cámara, estornuda
    p.cabeza.ang += 0.12 * tramo(t, T.miraAbajo, T.miraAbajo + 0.15) * (1 - tramo(t, T.camara, T.camara + 0.15));
    p.cabeza.ang += -0.1 * tramo(t, T.gorLlega, T.gorLlega + 0.1) * (1 - tramo(t, T.picor, T.picor + 0.15));
    p.cabeza.ang += -0.1 * tramo(t, T.ah1, T.ah1 + 0.1) - 0.08 * tramo(t, T.ah2, T.ah2 + 0.12);
    p.cabeza.ang += (0.18 + 0.12) * tramo(t, T.achis - 0.03, T.achis + 0.02, x => x) * (1 - tramo(t, T.achis + 0.1, T.achis + 0.45));
    p.cabeza.ang = clamp(p.cabeza.ang, -0.3, 0.3);
    // piernas: sentado dentro, las zapatillas asoman por delante y abajo, pataleando un poco
    const pat = 0.6 + 0.4 * tramo(t, T.brazos0, T.brazos0 + 0.1) * (1 - tramo(t, T.brazos1, T.brazos1 + 0.1));
    const sx = bg.cx;
    piernaG(p, "cerca", sx + 102 + 4 * Math.sin(t * 9) * pat, 26 + 6 * Math.sin(t * 9) * pat, -0.25);
    piernaG(p, "lejos", sx + 120 + 4 * Math.sin(t * 9 + 2) * pat, 34 + 6 * Math.sin(t * 9 + 2) * pat, -0.3);
    // cara
    const e = guion(GUION_CG, CG, "mira", t);
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.sudor = 0.0;
    p.rojo = 0.15 * campana(t, T.ah1, T.achis + 0.1);
    // brazos en alto (en Y), los menea
    const dir = 1, men = 1 * campana(t, T.brazos0, T.brazos1);
    const hC = aPant(G, p, G.HOMBRO_C), hL = aPant(G, p, G.HOMBRO);
    const aC = -2.35 + 0.25 * Math.sin((t - T.brazos0) * 22) * men + 0.04 * Math.sin(t * 2.1);
    const aL = -0.78 + 0.25 * Math.sin((t - T.brazos0) * 22 + 1.5) * men + 0.04 * Math.sin(t * 2.3 + 1);
    p.manoCerca = manoEn(G, p, "cerca", P(hC.x + Math.cos(aC) * 92 * dir, hC.y + Math.sin(aC) * 92), { dedos: ABIERTA, dobla: 1 });
    p.manoLejos = manoEn(G, p, "lejos", P(hL.x + Math.cos(aL) * 80, hL.y + Math.sin(aL) * 80), { dedos: ABIERTA, dobla: -1 });
    void PIEL_DENTRO;
    return p;
  }

  /* =====================================================================================
   * MARTA (mira a la derecha toda la escena)
   * ===================================================================================== */
  const CM = {
    palmea: E({ mx: 0.6, my: 0.6, c: 0.3, sd: 6, si: 6, sonr: 0.6 }),
    coloca: E({ mx: 0.85, my: 0.6, c: 0.25, sd: 8, si: 8, sonr: 0.75, abre: 4 }),
    lengua: E({ mx: 0.85, my: 0.65, c: 0.35, sd: 2, si: 2, sonr: 0.5, abre: 7, ancho: 0.7, lengua: 1 }),
    satisfecha: E({ c: 1, h: 1, sd: 12, si: 12, sonr: 1, abre: 6, rub: 0.35 }),
    miraG: E({ mx: 0.85, my: 0.25, c: 0.2, sd: 10, si: 10, sonr: 0.6 }),
    divertida: E({ mx: 0.85, my: 0.3, c: 0.3, h: 0.3, sd: 14, si: -2, gi: -0.06, sonr: 0.85 }),
    oh: E({ mx: 0.9, my: 0.25, iris: 0.85, sd: 26, si: 26, abre: 22, ancho: 0.6, sonr: -0.05 }),
    lejos: E({ mx: 0.9, my: 0.2, c: 0.25, sd: 10, si: 10, sonr: 0.4, abre: 2 }),
    alarma: E({ mx: 0.95, my: 0.05, iris: 0.7, sd: 30, si: 30, abre: 16, ancho: 0.6, sonr: -0.2 }),
    aprieta: E({ c: 1, z: 1, sd: 16, si: 16, abre: 0, sonr: -0.2 }),
    alivio: E({ mx: 0.9, my: 0.15, c: 0.15, sd: 20, si: 20, abre: 8, sonr: 0.4 }),
    risa: E({ mx: 0.6, my: 0.2, c: 1, h: 1, sd: 14, si: 14, sonr: 1, abre: 18, ancho: 1.05, rub: 0.5 }),
    idea: E({ mx: 0.85, my: 0, c: 0.3, sd: 18, gd: 0.1, si: -4, gi: -0.06, sonr: 0.9, ancho: 1.05 }),
    apunta: E({ mx: 0.9, my: -0.15, c: 0.45, z: 0.2, sd: 4, si: 4, sonr: 0.6, abre: 6, lengua: 0.8 }),
    encantada: E({ c: 0.6, h: 1, sd: 16, si: 16, sonr: 1, abre: 14, ancho: 1.05, rub: 0.5 }),
    sorpresa: E({ mx: 0.85, my: -0.4, iris: 0.8, sd: 24, si: 24, abre: 20, ancho: 0.7 }),
    guino: E({ mx: -0.85, my: -0.05, h: 1, cd: 1, sd: 6, si: 16, gi: 0.12, sonr: 1, abre: 8, ancho: 1.05, rub: 0.3 })
  };
  const GUION_CM = [
    [T.cab0, T.cab0 + 0.12, "coloca"], [T.ram0 + 0.1, T.ram0 + 0.2, "lengua"], [T.buf0, T.buf0 + 0.15, "coloca"],
    [T.atras0 + 0.1, T.atras0 + 0.25, "satisfecha"], [4.7, 4.85, "miraG"], [5.25, 5.4, "divertida"], [T.oh, T.oh + 0.08, "oh"],
    [6.9, 7.1, "lejos"], [T.alivio + 0.1, T.alivio + 0.25, "divertida"], [T.temblor0 + 0.05, T.temblor0 + 0.2, "alarma"],
    [T.tapa0, T.tapa0 + 0.08, "aprieta"], [T.tapa1, T.tapa1 + 0.1, "alivio"], [T.risa0, T.risa0 + 0.1, "risa"],
    [T.risa1, T.risa1 + 0.12, "idea"], [T.zan2Arma, T.zan2Arma + 0.1, "apunta"], [T.zanLlega + 0.02, T.zanLlega + 0.15, "risa"],
    [T.gorArma - 0.08, T.gorArma, "apunta"], [T.gorLlega, T.gorLlega + 0.12, "encantada"], [T.achis, T.achis + 0.06, "sorpresa"],
    [T.gorAterriza, T.gorAterriza + 0.12, "encantada"], [T.guino - 0.08, T.guino + 0.06, "guino"]
  ];
  const PARP_M = [1.9, 3.0, 5.0, 6.6, 7.9, 10.9, 12.35, 13.3];
  const CUER_M = {
    base: CU({ torso: 0.02, cab: 0.06 }),
    coloca: CU({ pel: 8, torso: 0.2, cab: 0.12, cdy: 3 }),
    zan: CU({ pel: 8, torso: 0.22, cab: 0.1, cdy: 2 }),
    ramas: CU({ pel: 16, torso: 0.38, cab: 0.14, cdy: 4 }),
    bufanda: CU({ pel: 12, torso: 0.3, cab: 0.1 }),
    gorro: CU({ pel: 0, torso: 0.08, cab: 0.0 }),
    orgullo: CU({ pel: -4, torso: -0.04, cab: -0.04 }),
    mira: CU({ pel: 2, torso: 0.02, cab: 0.05 }),
    alarma: CU({ pel: 6, torso: -0.06, cab: -0.04 }),
    aprieta: CU({ pel: 14, torso: 0.08, cab: 0.1, cdy: 6 }),
    risa: CU({ pel: 6, torso: 0.1, cab: 0.1 }),
    lanza: CU({ pel: 4, torso: -0.12, cab: -0.06 }),
    tira: CU({ pel: 2, torso: 0.18, cab: 0.04 }),
    final: CU({ torso: 0.0, cab: -0.02 })
  };
  const GUION_CUM = [
    [T.cab0, T.cab0 + 0.25, "coloca"], [T.cab1, T.zanPon - 0.2, "zan"], [T.ram0 + 0.05, T.ramD - 0.08, "ramas"], [T.ramI + 0.05, T.buf0 + 0.12, "base"],
    [T.bufSuelta, T.bufPon - 0.06, "bufanda"],
    [T.gor0, T.gor0 + 0.2, "gorro"], [T.atras0, T.atras1, "orgullo"], [4.7, 5.0, "mira"], [T.temblor0, T.temblor0 + 0.2, "alarma"],
    [T.tapa0, T.tapa0 + 0.1, "aprieta"], [T.tapa1, T.tapa1 + 0.15, "mira"], [T.risa0, T.risa0 + 0.15, "risa"], [T.risa1, T.risa1 + 0.12, "mira"],
    [T.zan2Arma - 0.05, T.lanzaZ - 0.02, "lanza"], [T.lanzaZ - 0.02, T.lanzaZ + 0.1, "tira", salida], [T.lanzaZ + 0.2, T.gorQ0 + 0.1, "coloca"],
    [T.gorArma - 0.05, T.lanzaG - 0.02, "lanza"], [T.lanzaG - 0.02, T.lanzaG + 0.1, "tira", salida], [T.lanzaG + 0.2, T.lanzaG + 0.4, "mira"],
    [T.achis, T.achis + 0.1, "alarma"], [T.gorAterriza, T.gorAterriza + 0.2, "final"]
  ];
  const XM = [[0, 196], [T.cab0, 196], [T.cab0 + 0.3, 210], [T.cabPon + 0.08, 210], [T.cab1 + 0.15, 199], [T.atras0, 199], [T.atras1, 172], [DUR, 172]];
  const PASOS_M = {
    lejos: [[-9, -8, 212], [T.cab0, T.cab0 + 0.18, 228, 9], [T.cab1 - 0.05, T.cab1 + 0.12, 215, 7], [T.atras0, T.atras0 + 0.18, 188, 10]],
    cerca: [[-9, -8, 182], [T.cab0 + 0.1, T.cab0 + 0.28, 194, 6], [T.cab1 + 0.05, T.cab1 + 0.2, 184, 6], [T.atras0 + 0.14, T.atras1, 156, 10]]
  };
  function poseM(t) {
    const b = guion(GUION_CUM, CUER_M, "base", t), x = recorrido(XM, t), respira = Math.sin(t * 2.1 + 0.8);
    const p = { x, suelo: SUELO, s: S, espejo: false, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: M.PELVIS.x, y: M.PELVIS.y + b.pel + respira * 1.1 }, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } }, pelo: { viento: 0.12 * Math.sin(t * 0.7), inercia: 0 } };
    // risa: hombros
    const ri = campana(t, T.risa0, T.risa1) + 0.6 * campana(t, T.zanLlega, T.zanLlega + 0.6);
    p.pelvis.y += 3 * Math.abs(Math.sin(t * 16)) * ri; p.cabeza.ang += 0.03 * Math.sin(t * 16) * ri;
    // aplauso: saltito
    p.pelvis.y -= 8 * campana(t, T.aplaude0, T.aplaude1);
    // pelo: inercia al lanzar y con el viento de la bola gigante
    p.pelo.inercia = -0.5 * campana(t, T.lanzaZ - 0.1, T.lanzaZ + 0.35) - 0.5 * campana(t, T.lanzaG - 0.1, T.lanzaG + 0.35) - 0.9 * campana(t, T.golpe, T.para + 0.4);
    const ty = M.SUELO - M.TOBILLO_ALTO;
    for (const lado of ["cerca", "lejos"]) {
      const f = pie(PASOS_M[lado], t);
      p.piernas[lado] = { tob: P(M.PELVIS.x + (f.x - x) / (S * M.K), (lado === "lejos" ? ty - 10 : ty) - f.alza / (S * M.K)), ang: f.alza > 1 ? -0.14 * Math.sin(Math.PI * f.u) : 0 };
    }
    const e = guion(GUION_CM, CM, "palmea", t);
    // sigue con la mirada a Guillermo y sus bolas
    if (t > 4.7 && t < T.temblor0) e.my = 0.25;
    p.cara = cara(e, parpadeo(t, PARP_M));
    manosM(t, p);
    return p;
  }
  // manos de Marta (la de lejos trabaja; la de cerca, al bolsillo)
  function manosM(t, p) {
    const x = p.x;
    const bc = q => bolsillo(M, q, "cerca"), bl = q => bolsillo(M, q, "lejos");
    // sostiene la cabeza del muñeco (palmea por arriba con la mano de lejos)
    const cs = () => cabezaSuelta(t) || MU.cab;
    const sostC = q => { const c = cs(); return manoEn(M, q, "cerca", P(c.x - 30, c.y + 6), { dedos: D(0.7, 0.9, 0.9, 0.85), dobla: -1 }); };
    const palm = Math.max(0, Math.sin(t * 9)) * (1 - tramo(t, T.cab0 - 0.15, T.cab0));
    const sostL = q => { const c = cs(); return manoEn(M, q, "lejos", P(c.x + 18, c.y - 26 - 10 * palm), { dedos: D(0.7, 0.95, 0.95, 0.9), dobla: 1 }); };
    const sostL2 = q => { const c = cs(); return manoEn(M, q, "lejos", P(c.x + 30, c.y - 4), { dedos: D(0.7, 0.9, 0.9, 0.85), dobla: 1 }); };
    // bolsillo de lejos (de donde saca las cosas)
    const aBolsillo = q => Object.assign({}, bl(q), { puno: 0.35 });
    const conCosa = q => { const b = M.aPantalla(q, bl(q)); return manoEn(M, q, "lejos", P(b.x + 4, b.y - 22), { dedos: AGARRA }); };
    // zanahoria: la mano la coge por la punta y mete la base en la cara
    const nariz = q => manoEn(M, q, "lejos", P(NARIZ_S.x + Math.cos(ZAN_A) * (ZAN_L + 4), NARIZ_S.y + Math.sin(ZAN_A) * (ZAN_L + 4)), { dedos: AGARRA });
    const ramaD = q => manoEn(M, q, "lejos", enRama(RAMA_D, 24), { dedos: AGARRA });
    const ramaI = q => manoEn(M, q, "lejos", enRama(RAMA_I, 24), { dedos: AGARRA });
    const cuelloPropio = q => manoEn(M, q, "lejos", aPant(M, q, P(262, 330)), { dedos: AGARRA });
    const tiraBuf = q => manoEn(M, q, "lejos", P(x + 66, 292), { dedos: AGARRA });
    const bufL = q => manoEn(M, q, "lejos", P(CUELLO_S.x + 30, CUELLO_S.y - 8), { dedos: AGARRA });
    const copa = q => manoEn(M, q, "lejos", P(COPA_S.x + 4, COPA_S.y - 6), { dedos: AGARRA });
    const junta = q => manoEn(M, q, "cerca", P(x + 18, 316), { dedos: D(0.7, 1, 1, 1), dobla: -1 });
    const juntaL = q => manoEn(M, q, "lejos", P(x + 30, 312), { dedos: D(0.7, 1, 1, 1), dobla: 1 });
    const bocaL = q => { const b = M.aPantalla(q, M.boca(q)); return manoEn(M, q, "lejos", P(b.x + 6, b.y + 10), { dedos: D(0.7, 1, 1, 1) }); };
    const bocaC = q => { const b = M.aPantalla(q, M.boca(q)); return manoEn(M, q, "cerca", P(b.x - 8, b.y + 16), { dedos: D(0.7, 1, 1, 1) }); };
    // lanzar: atrás junto al hombro y adelante arriba
    const hL = q => aPant(M, q, M.HOMBRO);
    const armaL = q => { const h = hL(q); return manoEn(M, q, "lejos", P(h.x - 22, h.y - 14), { dedos: AGARRA, dobla: 1 }); };
    const armaG = q => { const h = hL(q); return manoEn(M, q, "lejos", P(h.x - 6, h.y + 42), { dedos: AGARRA, dobla: 1 }); };
    const tiraL = q => { const h = hL(q); return manoEn(M, q, "lejos", P(h.x + 74, h.y - 30), { dedos: D(0.8, 1, 1, 1), dobla: 1 }); };
    const aplC = q => manoEn(M, q, "cerca", P(x + 22 - 8 * Math.abs(Math.sin((t - T.aplaude0) * 24)), 296), { dedos: D(0.8, 1, 1, 1), dobla: -1 });
    const aplL = q => manoEn(M, q, "lejos", P(x + 36 + 8 * Math.abs(Math.sin((t - T.aplaude0) * 24)), 292), { dedos: D(0.8, 1, 1, 1), dobla: 1 });
    p.manoCerca = pista([
      [0, 0, sostC], [T.cabPon + 0.02, T.cab1 + 0.12, bc],
      [T.atras0 + 0.05, T.atras0 + 0.25, junta], [4.65, 4.9, bc], [T.oh, T.oh + 0.1, bocaC], [6.4, 6.7, bc],
      [T.tapa0 - 0.08, T.tapa0 + 0.06, bocaC], [T.tapa1 + 0.05, T.tapa1 + 0.25, bc], [T.risa0 + 0.05, T.risa0 + 0.15, bocaC], [T.risa1 - 0.1, T.risa1 + 0.1, bc],
      [T.aplaude0, T.aplaude0 + 0.06, aplC], [T.aplaude1, T.aplaude1 + 0.15, bc]
    ], t, p);
    p.manoLejos = pista([
      [0, 0, sostL], [T.cab0 - 0.12, T.cab0, sostL2], [T.cabPon + 0.04, T.zan0 + 0.06, aBolsillo], [T.zanSale - 0.06, T.zanSale + 0.05, conCosa],
      [T.zanSale + 0.06, T.zanPon, nariz], [T.zan1 - 0.12, T.ram0 + 0.06, aBolsillo], [T.ramSale - 0.05, T.ramSale + 0.05, conCosa],
      [T.ramSale + 0.06, T.ramD, ramaD], [T.ramD + 0.06, T.ramI, ramaI], [T.ramI + 0.04, T.buf0, bl],
      [T.buf0, T.buf0 + 0.12, cuelloPropio], [T.buf0 + 0.12, T.bufSuelta, tiraBuf], [T.bufSuelta + 0.04, T.bufPon, bufL],
      [T.buf1 - 0.02, T.gor0 + 0.08, aBolsillo], [T.gorSale - 0.06, T.gorSale + 0.04, conCosa], [T.gorSale + 0.06, T.gorPon, copa],
      [T.gor1, T.atras0 + 0.25, juntaL], [4.65, 4.9, bl], [T.oh, T.oh + 0.1, bocaL], [6.4, 6.7, bl],
      [T.tapa0 - 0.08, T.tapa0 + 0.06, bocaL], [T.tapa1 + 0.05, T.tapa1 + 0.25, bl], [T.risa0 + 0.05, T.risa0 + 0.15, bocaL], [T.risa1 - 0.1, T.zan2_0, bl],
      [T.zan2_0, T.zan2_0 + 0.12, aBolsillo], [T.zan2Sale - 0.05, T.zan2Sale + 0.05, conCosa], [T.zan2Sale + 0.06, T.zan2Arma, armaL],
      [T.lanzaZ - 0.08, T.lanzaZ, tiraL, entrada], [T.lanzaZ + 0.12, T.gorQ0, bl], [T.gorQ0 + 0.02, T.gorQ, copa], [T.gorQ + 0.02, T.gorArma, armaG],
      [T.lanzaG - 0.08, T.lanzaG, tiraL, entrada], [T.lanzaG + 0.12, T.aplaude0, bl], [T.aplaude0, T.aplaude0 + 0.06, aplL],
      [T.aplaude1, T.aplaude1 + 0.15, bl]
    ], t, p);
  }

  function pose(t) { return { g: poseG(t), m: poseM(t) }; }

  /* =====================================================================================
   * DIBUJO DE LAS BOLAS DE NIEVE
   * ===================================================================================== */
  const NIEVE = { luz: "#ffffff", media: "#eaf2fb", sombra: "#b8cbe4", tinta: "#33405f", hondo: "#9fb6d6" };
  const MOTAS = [];
  for (let i = 0; i < 26; i++) MOTAS.push({ a: hash(i * 3.7 + 1) * TAU, f: 0.25 + 0.68 * Math.sqrt(hash(i * 5.3 + 2)), s: 0.05 + 0.07 * hash(i * 1.9 + 3), tipo: hash(i * 7.1) < 0.55 ? 0 : 1 });
  function bola(g, cx, cy, r, rot, o = {}) {
    const N = 56, bul = o.bultos ?? 1, sem = o.semilla || 0;
    const rr = a => r * (1 + bul * (0.026 * Math.sin(5 * (a - rot) + sem) + 0.016 * Math.sin(9 * (a - rot) + 1.3 + sem) + 0.01 * Math.sin(14 * (a - rot) + 2.2)));
    const forma = () => { g.beginPath(); for (let i = 0; i <= N; i++) { const a = i / N * TAU, q = rr(a); if (i) g.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); else g.moveTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } g.closePath(); };
    g.save(); g.lineJoin = "round";
    forma();
    const gr = g.createRadialGradient(cx - r * 0.38, cy - r * 0.42, r * 0.08, cx - r * 0.1, cy - r * 0.1, r * 1.12);
    gr.addColorStop(0, NIEVE.luz); gr.addColorStop(0.5, NIEVE.media); gr.addColorStop(1, NIEVE.sombra);
    g.fillStyle = gr; g.fill();
    g.save(); forma(); g.clip();
    // motas y abolladuras que giran con la bola
    if (r > 6) {
      for (const m of MOTAS) {
        if (o.pocas && m.tipo === 1 && m.f > 0.7) continue;
        const a = m.a + rot, d = m.f * r, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, s = Math.max(1.1, m.s * r);
        // las de la cara de atrás no se ven: solo dentro del disco visible, achatadas hacia el borde
        const k = 1 - 0.55 * m.f;
        if (m.tipo === 0) { g.fillStyle = "rgba(150,175,210,0.45)"; g.beginPath(); g.ellipse(x, y, s, s * k, a, 0, TAU); g.fill(); }
        else { g.fillStyle = "rgba(255,255,255,0.85)"; g.beginPath(); g.ellipse(x, y, s * 1.1, s * 0.7 * k, a, 0, TAU); g.fill();
          g.strokeStyle = "rgba(140,165,200,0.5)"; g.lineWidth = Math.max(0.8, s * 0.25); g.beginPath(); g.ellipse(x, y + s * 0.3, s * 1.1, s * 0.7 * k, a, 0.2, Math.PI - 0.2); g.stroke(); }
      }
    }
    // sombra propia abajo a la derecha y luz de borde
    const gs = g.createRadialGradient(cx + r * 0.35, cy + r * 0.45, r * 0.2, cx + r * 0.3, cy + r * 0.4, r * 1.0);
    gs.addColorStop(0, "rgba(120,150,195,0.32)"); gs.addColorStop(1, "rgba(120,150,195,0)");
    g.fillStyle = gs; g.fillRect(cx - r * 1.2, cy - r * 1.2, r * 2.4, r * 2.4);
    g.restore();
    g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = Math.max(1.2, r * 0.05); g.lineCap = "round";
    g.beginPath(); g.arc(cx, cy, r * 0.86, Math.PI * 1.08, Math.PI * 1.42); g.stroke();
    forma(); g.lineWidth = o.tinta ?? Math.max(1.6, Math.min(3, r * 0.04)); g.strokeStyle = NIEVE.tinta; g.stroke();
    g.restore();
  }
  // bola ya dibujada en un lienzo aparte (para las que no giran: el muñeco y la bola gigante parada)
  const CACHE_B = {};
  function bolaFija(g, clave, cx, cy, r, rot, o = {}) {
    let c = CACHE_B[clave];
    if (!c) {
      const m = Math.ceil(r * 1.12 + 6);
      c = document.createElement("canvas"); c.width = c.height = 2 * m; c.m = m;
      bola(c.getContext("2d"), m, m, r, rot, o);
      CACHE_B[clave] = c;
    }
    g.drawImage(c, cx - c.m, cy - c.m);
  }
  // sombra en el suelo
  function sombra(g, x, r, alfa = 0.25, y = SUELO) {
    g.save(); g.fillStyle = `rgba(90,120,170,${alfa})`; g.beginPath(); g.ellipse(x, y + 2, r * 0.95, Math.max(3, r * 0.12), 0, 0, TAU); g.fill(); g.restore();
  }

  /* =====================================================================================
   * ATREZO
   * ===================================================================================== */
  const TINTA = "#1b1420";
  // zanahoria: (x, y) = base gruesa; ang = hacia la punta; L = largo
  function zanahoria(g, x, y, ang, L, hojas = 0) {
    g.save(); g.translate(x, y); g.rotate(ang); g.lineJoin = "round"; g.lineCap = "round";
    const w = L * 0.2;
    if (hojas > 0.01) {
      g.strokeStyle = "#3f8f3a"; g.lineWidth = Math.max(1.4, L * 0.07) * hojas;
      for (const [a, l] of [[2.7, 0.55], [3.0, 0.7], [3.35, 0.5]]) { g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(Math.cos(a) * L * l * 0.6, Math.sin(a) * L * l * 0.5 - L * 0.08, Math.cos(a) * L * l, Math.sin(a) * L * l); g.stroke(); }
    }
    g.beginPath(); g.moveTo(0, -w); g.quadraticCurveTo(L * 0.45, -w * 0.8, L, 0); g.quadraticCurveTo(L * 0.45, w * 0.85, 0, w); g.quadraticCurveTo(-w * 0.4, 0, 0, -w); g.closePath();
    g.fillStyle = "#f08a2a"; g.fill();
    g.save(); g.clip(); g.fillStyle = "#c9631a"; g.beginPath(); g.moveTo(0, w * 0.2); g.quadraticCurveTo(L * 0.5, w * 0.5, L, 0); g.lineTo(L, w); g.lineTo(0, w); g.closePath(); g.fill(); g.restore();
    g.strokeStyle = "#a4501a"; g.lineWidth = Math.max(0.8, L * 0.03);
    for (const k of [0.25, 0.45, 0.65]) { g.beginPath(); g.moveTo(L * k, -w * (1 - k) * 0.85); g.lineTo(L * k + L * 0.05, -w * (1 - k) * 0.3); g.stroke(); }
    g.beginPath(); g.moveTo(0, -w); g.quadraticCurveTo(L * 0.45, -w * 0.8, L, 0); g.quadraticCurveTo(L * 0.45, w * 0.85, 0, w); g.quadraticCurveTo(-w * 0.4, 0, 0, -w); g.closePath();
    g.strokeStyle = TINTA; g.lineWidth = Math.max(1.2, L * 0.045); g.stroke();
    g.restore();
  }
  // ramita: de (x, y) hacia ang, con dos deditos
  function ramita(g, x, y, ang, L, sem = 0) {
    g.save(); g.translate(x, y); g.rotate(ang); g.lineCap = "round"; g.lineJoin = "round";
    const tr = (w, c) => {
      g.strokeStyle = c; g.lineWidth = w;
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(L * 0.5, -L * 0.06, L, L * 0.02); g.stroke();
      g.lineWidth = w * 0.75; g.beginPath(); g.moveTo(L * 0.62, -L * 0.02); g.lineTo(L * 0.86, -L * 0.2); g.stroke();
      g.beginPath(); g.moveTo(L * 0.78, L * 0.0); g.lineTo(L * 1.02, L * 0.12); g.stroke();
      g.lineWidth = w * 0.6; g.beginPath(); g.moveTo(L * 0.35, -L * 0.04); g.lineTo(L * 0.44, -L * 0.17); g.stroke();
    };
    tr(5.2, TINTA); tr(2.8, "#7a4a28");
    g.restore();
  }
  // gorro de lana rojo con pompón: (x, y) = centro del borde de abajo, w = ancho
  function gorro(g, x, y, ang, w, o = {}) {
    const sq = o.aplasta || 0, gi = o.giro ?? 1;        // gi: aplastado horizontal (gira en el aire)
    g.save(); g.translate(x, y); g.rotate(ang); g.scale(gi, 1 - 0.25 * sq); g.lineJoin = "round"; g.lineCap = "round";
    const h = w * 0.62;
    // cuerpo
    g.beginPath(); g.moveTo(-w * 0.48, -w * 0.12); g.bezierCurveTo(-w * 0.5, -h * 1.05, w * 0.5, -h * 1.05, w * 0.48, -w * 0.12); g.closePath();
    g.fillStyle = "#d7383f"; g.fill();
    g.save(); g.clip(); g.strokeStyle = "rgba(120,20,30,0.35)"; g.lineWidth = Math.max(1, w * 0.035);
    for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * w * 0.13, -w * 0.1); g.quadraticCurveTo(i * w * 0.1, -h * 0.6, i * w * 0.04, -h * 1.05); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,0.18)"; g.beginPath(); g.ellipse(-w * 0.18, -h * 0.6, w * 0.12, h * 0.25, -0.4, 0, TAU); g.fill();
    g.restore();
    g.beginPath(); g.moveTo(-w * 0.48, -w * 0.12); g.bezierCurveTo(-w * 0.5, -h * 1.05, w * 0.5, -h * 1.05, w * 0.48, -w * 0.12);
    g.lineWidth = Math.max(1.4, w * 0.04); g.strokeStyle = TINTA; g.stroke();
    // vuelta del borde
    g.beginPath(); g.moveTo(-w * 0.53, -w * 0.17); g.quadraticCurveTo(0, -w * 0.25, w * 0.53, -w * 0.17); g.lineTo(w * 0.52, w * 0.04); g.quadraticCurveTo(0, w * 0.1, -w * 0.52, w * 0.04); g.closePath();
    g.fillStyle = "#f3ece2"; g.fill(); g.stroke();
    g.strokeStyle = "rgba(150,120,110,0.5)"; g.lineWidth = Math.max(0.8, w * 0.025);
    for (let i = -4; i <= 4; i++) { g.beginPath(); g.moveTo(i * w * 0.115, -w * 0.18); g.lineTo(i * w * 0.115, w * 0.05); g.stroke(); }
    // pompón
    const pb = o.pompon || 0;
    const pr = w * 0.17, px = w * 0.02 + pb * w * 0.04, py = -h * 1.0 - pr * 0.6 + pb * w * 0.05;
    g.fillStyle = "#fbf7f1"; g.beginPath();
    for (let i = 0; i <= 14; i++) { const a = i / 14 * TAU, q = pr * (1 + 0.12 * Math.sin(i * 2.7)); i ? g.lineTo(px + Math.cos(a) * q, py + Math.sin(a) * q) : g.moveTo(px + Math.cos(a) * q, py + Math.sin(a) * q); }
    g.closePath(); g.fill(); g.lineWidth = Math.max(1.2, w * 0.035); g.strokeStyle = TINTA; g.stroke();
    g.restore();
  }
  // bufanda pequeña del muñeco (rayas rojas y crema)
  const BUF = { rojo: "#c9343e", crema: "#f5ead6", tinta: "#2b1318" };
  function bufandaMuneco(g, cx, cy, k, t) {
    if (k <= 0.01) return;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // vuelta al cuello: banda que crece de derecha a izquierda (pasa por detrás y vuelve por delante)
    const w0 = 40, h0 = 13, ext = clamp(k * 1.2);
    const x0 = cx + w0 * 0.98, x1 = lerp(x0, cx - w0 * 0.98, ext);
    g.beginPath(); g.moveTo(x0, cy - h0 * 0.5); g.quadraticCurveTo((x0 + x1) / 2, cy + 6 * ext - h0 * 0.5 + 3, x1, cy - h0 * 0.5);
    g.lineTo(x1, cy + h0 * 0.6); g.quadraticCurveTo((x0 + x1) / 2, cy + 6 * ext + h0 * 0.6 + 3, x0, cy + h0 * 0.6); g.closePath();
    g.fillStyle = BUF.crema; g.fill();
    g.save(); g.clip(); g.fillStyle = BUF.rojo;
    for (let x = x1 - 20; x < x0 + 10; x += 14) g.fillRect(x, cy - 20, 7, 40);
    g.restore();
    g.lineWidth = 1.8; g.strokeStyle = BUF.tinta; g.stroke();
    // nudo y cola
    const kc = tramo(k, 0.75, 1);
    if (kc > 0.01) {
      const sw = 3 * Math.sin(t * 2.6) + 10 * Math.exp(-Math.max(0, t - T.bufPon - 0.1) * 4) * Math.sin((t - T.bufPon) * 12) * (t > T.bufPon ? 1 : 0)
        + 6 * campana(t, T.golpe, T.para + 0.5) * Math.sin(t * 20);
      const a = P(cx + 22, cy + 4), L = 34 * kc;
      g.beginPath(); g.moveTo(a.x - 5, a.y); g.quadraticCurveTo(a.x - 2 + sw * 0.3, a.y + L * 0.5, a.x + 2 + sw, a.y + L);
      g.lineTo(a.x + 12 + sw, a.y + L - 2); g.quadraticCurveTo(a.x + 9 + sw * 0.3, a.y + L * 0.5, a.x + 6, a.y); g.closePath();
      g.fillStyle = BUF.rojo; g.fill(); g.lineWidth = 1.6; g.strokeStyle = BUF.tinta; g.stroke();
      g.fillStyle = BUF.crema; g.fillRect(a.x - 1 + sw * 0.55, a.y + L * 0.55, 10, 5);
      g.beginPath(); g.ellipse(a.x + 1, a.y, 7, 6, 0, 0, TAU); g.fillStyle = BUF.rojo; g.fill(); g.stroke();
      // flecos
      g.strokeStyle = BUF.tinta; g.lineWidth = 1.2;
      for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(a.x + 3 + sw + i * 2.5, a.y + L - 1); g.lineTo(a.x + 3 + sw * 1.1 + i * 2.5, a.y + L + 5); g.stroke(); }
    }
    g.restore();
  }
  // el muñeco de Marta
  function muneco(g, t) {
    const ang = balanceoMuneco(t), base = P(XS, SUELO);
    g.save(); g.translate(base.x, base.y); g.rotate(ang); g.translate(-base.x, -base.y);
    sombra(g, XS, 60, 0.22);
    // ramitas (detrás de la bola del medio salen de los lados)
    if (t >= T.ramD) ramita(g, RAMA_D.base.x, RAMA_D.base.y, RAMA_D.ang, RAMA_L, 1);
    if (t >= T.ramI) ramita(g, RAMA_I.base.x, RAMA_I.base.y, RAMA_I.ang, RAMA_L, 2);
    bolaFija(g, "abajo", MU.abajo.x, MU.abajo.y, MU.rA, 0.4, { bultos: 0.5, semilla: 1, pocas: true });
    bolaFija(g, "medio", MU.medio.x, MU.medio.y, MU.rM, 1.3, { bultos: 0.45, semilla: 2, pocas: true });
    // botones de carbón
    g.fillStyle = "#2c2a33";
    for (const [dx, dy] of [[1, -22], [2, -4], [2, 15]]) { g.beginPath(); g.ellipse(MU.medio.x + dx, MU.medio.y + dy, 4.2, 3.8, 0.3, 0, TAU); g.fill(); }
    for (const [dx, dy] of [[2, 3], [3, 26]]) { g.beginPath(); g.ellipse(MU.abajo.x + dx, MU.abajo.y + dy - 20, 4.4, 4, 0.3, 0, TAU); g.fill(); }
    // la cabeza, una vez puesta, con su nariz, bufanda y gorro
    if (t >= T.cabPon) {
      const sq = campana(t, T.cabPon, T.cab1);
      g.save(); g.translate(MU.cab.x, MU.cab.y + MU.rC); g.scale(1 + 0.08 * sq, 1 - 0.09 * sq); g.translate(-MU.cab.x, -(MU.cab.y + MU.rC));
      cabezaMuneco(g, MU.cab.x, MU.cab.y, t);
      g.restore();
    }
    if (t >= T.zanPon) { const metida = tramo(t, T.zanPon, T.zanPon + 0.1); zanahoria(g, NARIZ_S.x - 6 * (1 - metida), NARIZ_S.y, ZAN_A, ZAN_L); }
    bufandaMuneco(g, CUELLO_S.x, CUELLO_S.y, tramo(t, T.bufPon - 0.06, T.bufPon + 0.14), t);
    if (t >= T.gorPon && t < T.gorQ) { const k = t - T.gorPon; gorro(g, COPA_S.x + 2, COPA_S.y + 4, -0.08, 46, { aplasta: Math.exp(-k * 9) * Math.max(0, Math.sin(k * 30)), pompon: Math.exp(-k * 5) * Math.sin(k * 18) }); }
    if (t >= T.gorAterriza) { const k = t - T.gorAterriza; gorro(g, COPA_S.x + 2, COPA_S.y + 4, -0.08 + 0.1 * Math.exp(-k * 6) * Math.sin(k * 16), 46, { aplasta: Math.exp(-k * 8) * Math.max(0, Math.sin(k * 26)), pompon: Math.exp(-k * 4) * Math.sin(k * 16) }); }
    g.restore();
  }
  function cabezaMuneco(g, x, y, t) {
    bolaFija(g, "cabeza", x, y, MU.rC, 2.1, { bultos: 0.4, semilla: 3, pocas: true });
    // ojos y sonrisa de carbón
    g.fillStyle = "#26242c";
    g.beginPath(); g.ellipse(x - 16, y - 7, 3.2, 4.2, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(x + 4, y - 7, 3.6, 4.2, 0, 0, TAU); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(x - 17, y - 8.5, 1, 0, TAU); g.arc(x + 3, y - 8.5, 1.1, 0, TAU); g.fill();
    g.fillStyle = "#26242c";
    for (let i = 0; i < 5; i++) { const a = 0.45 + i * 0.5; g.beginPath(); g.arc(x - 6 + Math.cos(a) * 15, y + 6 + Math.sin(a) * 9, 1.9, 0, TAU); g.fill(); }
  }
  // nubecilla de nieve: bolas que se abren y se desvanecen
  function nube(g, cx, cy, R, k, alfa, sem = 0) {
    if (alfa <= 0.01) return;
    g.save(); g.globalAlpha *= alfa;
    for (let i = 0; i < 16; i++) {
      const a = hash(i * 1.7 + sem) * TAU, d = R * (0.2 + 0.75 * hash(i * 2.3 + sem + 5)) * (0.4 + 0.6 * k), rr = R * (0.18 + 0.2 * hash(i * 3.1 + sem)) * (0.5 + 0.7 * k);
      const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.75;
      g.fillStyle = i % 3 === 0 ? "#dde8f6" : "#ffffff";
      g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill();
    }
    g.restore();
  }
  // copos sueltos que saltan (trayectorias fijas)
  function salpica(g, x, y, t0, t, n, v, sem, esc = 1, dir = 0) {
    const k = t - t0; if (k < 0 || k > 0.9) return;
    g.save(); g.fillStyle = "#ffffff"; g.strokeStyle = "rgba(90,115,160,0.6)"; g.lineWidth = 1;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + dir + (hash(i * 2.1 + sem) - 0.5) * 2.2, vv = v * (0.5 + 0.6 * hash(i * 3.3 + sem));
      const px = x + Math.cos(a) * vv * k, py = y + Math.sin(a) * vv * k + 600 * k * k, r = esc * (2 + 3 * hash(i + sem)) * (1 - k);
      if (r < 0.3) continue;
      g.beginPath(); g.arc(px, py, r, 0, TAU); g.fill(); g.stroke();
    }
    g.restore();
  }
  function estrella(g, x, y, r, a) {
    g.save(); g.globalAlpha *= a; g.translate(x, y); g.fillStyle = "#fff6c2"; g.strokeStyle = "#d4a017"; g.lineWidth = 1.4;
    g.beginPath(); for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4, q = i % 2 ? r * 0.35 : r; g.lineTo(Math.cos(an) * q, Math.sin(an) * q); } g.closePath(); g.fill(); g.stroke(); g.restore();
  }
  function nota(g, x, y, s, a) {
    g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s); g.fillStyle = "#3b4b78"; g.strokeStyle = "#3b4b78"; g.lineWidth = 2;
    g.beginPath(); g.ellipse(0, 0, 5, 3.6, -0.4, 0, TAU); g.fill(); g.beginPath(); g.moveTo(4.2, -1.5); g.lineTo(4.2, -17); g.quadraticCurveTo(9, -14, 10, -9); g.stroke(); g.restore();
  }

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  let fondoLejos = null, fondoCerca = null, fondoTodo = null;
  const FX = -60, FY = -50;
  function pino(g, x, y, h, col, colN, sem = 0) {
    const w = h * 0.42;
    g.fillStyle = "#5a3d2b"; g.fillRect(x - h * 0.03, y - h * 0.08, h * 0.06, h * 0.1);
    for (let i = 0; i < 4; i++) {
      const y0 = y - h * 0.08 - i * h * 0.22, ww = w * (1 - i * 0.2), hh = h * 0.36;
      g.fillStyle = col; g.beginPath(); g.moveTo(x - ww, y0); g.lineTo(x, y0 - hh); g.lineTo(x + ww, y0); g.closePath(); g.fill();
      g.fillStyle = colN; g.beginPath(); g.moveTo(x - ww * 0.92, y0 - 2);
      for (let k = 0; k <= 6; k++) { const xx = lerp(x - ww * 0.92, x + ww * 0.92, k / 6); g.lineTo(xx, y0 - hh * 0.18 - (k % 2) * hh * 0.08 * hash(k + sem + i)); }
      g.lineTo(x, y0 - hh * 0.92); g.closePath(); g.globalAlpha = 0.95; g.fill(); g.globalAlpha = 1;
    }
  }
  function creaFondos() {
    const c1 = document.createElement("canvas"); c1.width = W + 120; c1.height = H + 100;
    const g = c1.getContext("2d"); g.translate(-FX, -FY); g.lineJoin = "round"; g.lineCap = "round";
    // cielo de mañana
    let gr = g.createLinearGradient(0, -50, 0, 440);
    gr.addColorStop(0, "#79b0e4"); gr.addColorStop(0.45, "#a9cdee"); gr.addColorStop(1, "#e7f2fb");
    g.fillStyle = gr; g.fillRect(-60, -50, W + 120, H + 100);
    // sol suave
    gr = g.createRadialGradient(150, 60, 10, 150, 60, 230); gr.addColorStop(0, "rgba(255,250,225,0.95)"); gr.addColorStop(0.2, "rgba(255,246,210,0.45)"); gr.addColorStop(1, "rgba(255,246,210,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(150, 60, 230, 0, TAU); g.fill();
    g.fillStyle = "#fffbe8"; g.beginPath(); g.arc(150, 60, 26, 0, TAU); g.fill();
    // nubes
    g.fillStyle = "rgba(255,255,255,0.85)";
    for (const [x, y, s] of [[420, 70, 1], [700, 40, 0.8], [880, 110, 1.1], [-20, 150, 0.7]]) {
      for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(x + (i - 2.5) * 26 * s, y - Math.sin(i * 1.1) * 8 * s, 30 * s, 18 * s, 0, 0, TAU); g.fill(); }
    }
    // montañas lejanas
    g.fillStyle = "#c2d1ea";
    g.beginPath(); g.moveTo(-60, 400); for (const [x, y] of [[-20, 300], [90, 230], [190, 300], [300, 250], [420, 330], [540, 240], [660, 300], [760, 220], [900, 300], [1000, 250], [1090, 320]]) g.lineTo(x, y); g.lineTo(1090, 420); g.lineTo(-60, 420); g.closePath(); g.fill();
    g.fillStyle = "#f6f9fe";
    for (const [x, y, w] of [[90, 230, 40], [300, 250, 34], [540, 240, 40], [760, 220, 46], [1000, 250, 36]]) { g.beginPath(); g.moveTo(x - w, y + w * 0.9); g.lineTo(x, y); g.lineTo(x + w, y + w * 0.9); g.lineTo(x + w * 0.5, y + w * 0.7); g.lineTo(x + w * 0.1, y + w * 0.95); g.lineTo(x - w * 0.4, y + w * 0.7); g.closePath(); g.fill(); }
    g.fillStyle = "#adc0e0";
    g.beginPath(); g.moveTo(-60, 420); for (const [x, y] of [[0, 350], [120, 320], [250, 360], [380, 330], [520, 370], [640, 340], [780, 365], [900, 335], [1090, 370]]) g.lineTo(x, y); g.lineTo(1090, 440); g.lineTo(-60, 440); g.closePath(); g.fill();
    // bosque lejano detrás de la loma
    for (let i = 0; i < 70; i++) { const x = -50 + i * 17 + 6 * hash(i), h = 30 + 22 * hash(i + 9); pino(g, x, 440 + 4 * hash(i + 3), h, "#7f9bc0", "#e9f0fa", i); }
    // colina de enfrente (a la derecha, detrás de la vaguada)
    // la vaguada (sombra azul) y la colina de enfrente
    g.fillStyle = "#aebfdc"; g.fillRect(700, 480, 400, 260);
    const colina = () => { g.beginPath(); g.moveTo(740, 700); for (let x = 740; x <= 1090; x += 5) g.lineTo(x, yEnfrente(x)); g.lineTo(1090, 700); g.closePath(); };
    colina();
    gr = g.createLinearGradient(0, 430, 0, 600); gr.addColorStop(0, "#e6eef9"); gr.addColorStop(0.45, "#cddbef"); gr.addColorStop(1, "#a9bcdb");
    g.fillStyle = gr; g.fill();
    g.save(); colina(); g.clip();
    g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.ellipse(1010, 450, 120, 26, -0.05, 0, TAU); g.fill();
    g.fillStyle = "rgba(120,145,190,0.22)"; for (const [x, y, rx] of [[900, 500, 70], [960, 540, 90], [1040, 520, 60]]) { g.beginPath(); g.ellipse(x, y, rx, 9, -0.15, 0, TAU); g.fill(); }
    g.restore();
    g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.beginPath(); for (let x = 800; x <= 1090; x += 5) { const y = yEnfrente(x) + 1.5; x === 800 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
    g.strokeStyle = "#8ea5cb"; g.lineWidth = 1.6; g.beginPath(); for (let x = 800; x <= 1090; x += 5) { const y = yEnfrente(x) - 0.5; x === 800 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
    for (const [x, h] of [[1036, 58], [1062, 46], [1088, 64], [1012, 36], [918, 26], [934, 20]]) pino(g, x, yEnfrente(x) + 6, h, "#5c7eab", "#eef3fb", x);
    // cerca de madera en la colina
    g.strokeStyle = "#7d6a5a"; g.lineWidth = 2;
    for (let x = 950; x < 1090; x += 13) { const y = yEnfrente(x) + 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 11); g.stroke(); }
    g.beginPath(); for (let x = 950; x < 1090; x += 13) { const y = yEnfrente(x) - 4; x === 950 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
    // pinos grandes del parque (detrás de la loma)
    pino(g, 60, 452, 300, "#2f5d4f", "#f2f7fd", 11);
    pino(g, 128, 448, 200, "#356a58", "#f2f7fd", 12);
    pino(g, 700, 446, 270, "#2f5d4f", "#f2f7fd", 13);
    // farola del parque
    g.save(); g.translate(84, 0);
    g.strokeStyle = "#2c3346"; g.lineWidth = 6; g.beginPath(); g.moveTo(560, 446); g.lineTo(560, 236); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.moveTo(552, 300); g.lineTo(568, 300); g.stroke();
    g.fillStyle = "#2c3346"; g.beginPath(); g.moveTo(544, 236); g.lineTo(576, 236); g.lineTo(570, 206); g.lineTo(550, 206); g.closePath(); g.fill();
    g.fillStyle = "#fff4cf"; g.fillRect(553, 211, 14, 21);
    g.fillStyle = "#f6f9fe"; g.beginPath(); g.ellipse(560, 204, 18, 6, 0, Math.PI, 0); g.fill();
    g.fillStyle = "#2c3346"; g.beginPath(); g.moveTo(556, 204); g.lineTo(560, 194); g.lineTo(564, 204); g.fill();
    g.restore();
    // banco con nieve
    g.fillStyle = "#6b4a33"; g.fillRect(372, 418, 96, 8); g.fillRect(372, 398, 96, 7); g.fillRect(372, 386, 96, 6);
    g.fillStyle = "#2c3346"; g.fillRect(378, 426, 5, 22); g.fillRect(458, 426, 5, 22); g.fillRect(376, 384, 4, 42); g.fillRect(460, 384, 4, 42);
    g.fillStyle = "#f6f9fe"; g.beginPath(); g.ellipse(420, 417, 50, 5, 0, Math.PI, 0); g.fill(); g.beginPath(); g.ellipse(420, 385, 50, 4, 0, Math.PI, 0); g.fill();
    fondoLejos = c1;

    // ---- la loma (lo que tapa la bola lejana) ----
    const c2 = document.createElement("canvas"); c2.width = W + 120; c2.height = H + 100;
    const h = c2.getContext("2d"); h.translate(-FX, -FY); h.lineJoin = "round"; h.lineCap = "round";
    const loma = () => { h.beginPath(); h.moveTo(-60, yLoma(-60)); for (let x = -60; x <= 1090; x += 5) h.lineTo(x, yLoma(x)); h.lineTo(1090, 700); h.lineTo(-60, 700); h.closePath(); };
    loma();
    gr = h.createLinearGradient(0, 430, 0, 650); gr.addColorStop(0, "#dbe6f4"); gr.addColorStop(0.35, "#eef4fb"); gr.addColorStop(1, "#f8fbff");
    h.fillStyle = gr; h.fill();
    h.save(); loma(); h.clip();
    // sombras suaves de la nieve
    h.fillStyle = "rgba(160,185,220,0.22)";
    for (const [x, y, rx, ry] of [[80, 470, 120, 10], [330, 462, 140, 9], [600, 470, 110, 8], [200, 575, 180, 12], [540, 590, 160, 10]]) { h.beginPath(); h.ellipse(x, y, rx, ry, 0, 0, TAU); h.fill(); }
    // la ladera que baja a la vaguada: más azul cuanto más abajo y a la derecha
    const ladera = () => { h.beginPath(); h.moveTo(720, 700); h.lineTo(720, SUELO); for (let x = 720; x <= 1090; x += 5) h.lineTo(x, suelo(x)); h.lineTo(1090, 700); h.closePath(); };
    ladera();
    gr = h.createLinearGradient(760, 520, 900, 660); gr.addColorStop(0, "rgba(150,175,215,0)"); gr.addColorStop(0.4, "rgba(150,175,215,0.35)"); gr.addColorStop(1, "rgba(120,148,195,0.6)");
    h.fillStyle = gr; h.fill();
    // lomo de la loma entre el borde de atrás y el labio
    h.fillStyle = "rgba(150,175,215,0.25)"; h.beginPath(); h.moveTo(700, 432); for (let x = 700; x <= 900; x += 5) h.lineTo(x, yLoma(x)); for (let x = 900; x >= 700; x -= 5) h.lineTo(x, Math.min(suelo(x), yLoma(x) + 26)); h.closePath(); h.fill();
    // labio del borde (por donde cae la loma)
    h.strokeStyle = "#ffffff"; h.lineWidth = 3.5; h.beginPath(); for (let x = 700; x <= 1090; x += 5) { const y = suelo(x) - 1.5; x === 700 ? h.moveTo(x, y) : h.lineTo(x, y); } h.stroke();
    h.strokeStyle = "rgba(110,135,180,0.75)"; h.lineWidth = 1.8; h.beginPath(); for (let x = 752; x <= 1090; x += 5) { const y = suelo(x) + 2; x === 752 ? h.moveTo(x, y) : h.lineTo(x, y); } h.stroke();
    h.strokeStyle = "rgba(110,135,180,0.6)"; h.lineWidth = 1.5; h.beginPath(); for (let x = 700; x <= 1090; x += 5) { const y = yLoma(x); x === 700 ? h.moveTo(x, y) : h.lineTo(x, y); } h.stroke();
    // rastros de las bolas que rodó Marta (llegan al muñeco)
    const rastro = (pts, w) => {
      h.strokeStyle = "rgba(150,175,212,0.42)"; h.lineWidth = w; h.beginPath(); M2.curva(h, pts, false, 0.5); h.stroke();
      h.strokeStyle = "rgba(255,255,255,0.75)"; h.lineWidth = 1.6; h.beginPath(); M2.curva(h, pts.map(q => P(q.x, q.y - w / 2)), false, 0.5); h.stroke();
    };
    rastro([P(-60, 590), P(40, 560), P(150, 548), P(232, 540)], 12);
    rastro([P(-60, 498), P(60, 486), P(160, 500), P(230, 516)], 9);
    // huellas
    h.fillStyle = "rgba(140,165,205,0.35)";
    for (let i = 0; i < 9; i++) { const x = 20 + i * 22, y = 532 + (i % 2) * 8; h.beginPath(); h.ellipse(x, y, 6, 2.6, 0, 0, TAU); h.fill(); }
    for (let i = 0; i < 7; i++) { const x = 330 + i * 21, y = 548 + (i % 2) * 7; h.beginPath(); h.ellipse(x, y, 6, 2.6, 0, 0, TAU); h.fill(); }
    // matojos y piedras
    h.strokeStyle = "#8a7a5a"; h.lineWidth = 1.6;
    for (const [x, y] of [[20, 470], [300, 452], [640, 458], [760, 524], [120, 580], [470, 588]]) for (let k = -2; k <= 2; k++) { h.beginPath(); h.moveTo(x + k * 3, y); h.lineTo(x + k * 5, y - 10 - 3 * hash(x + k)); h.stroke(); }
    h.fillStyle = "#8d97a8";
    for (const [x, y, r] of [[790, 530, 7], [830, 548, 5], [808, 541, 4]]) { h.beginPath(); h.ellipse(x, y, r * 1.4, r, 0, Math.PI, 0); h.fill(); h.fillStyle = "#f6f9fe"; h.beginPath(); h.ellipse(x, y - r * 0.8, r * 1.2, r * 0.4, 0, Math.PI, 0); h.fill(); h.fillStyle = "#8d97a8"; }
    // brillitos de la nieve
    h.fillStyle = "rgba(255,255,255,0.95)";
    for (let i = 0; i < 40; i++) { const x = hash(i * 4.1) * 1090 - 30, y = 450 + hash(i * 6.7) * 180; if (y < yLoma(x) + 4) continue; h.beginPath(); h.arc(x, y, 1 + hash(i), 0, TAU); h.fill(); }
    h.restore();
    fondoCerca = c2;
    // los dos juntos, para cuando no hay nada entre ellos
    const c3 = document.createElement("canvas"); c3.width = W + 120; c3.height = H + 100;
    const k = c3.getContext("2d"); k.drawImage(c1, 0, 0); k.drawImage(c2, 0, 0);
    fondoTodo = c3;
  }
  // rastro de la bola de Guillermo
  function rastroG(g, t) {
    if (t < T.rasca1) return;
    const b = bolaG(t), x1 = Math.min(BORDE + 8, b ? b.x : BORDE + 8);
    if (x1 <= XB0 + 2) return;
    g.save();
    g.fillStyle = "rgba(150,175,212,0.4)";
    g.beginPath(); g.moveTo(XB0, SUELO + 1);
    for (let x = XB0; x <= x1; x += 6) { const w = 2 + radioPie(Math.min(x, 700)) * 0.12; g.lineTo(x, SUELO + 1 - w * 0.4); }
    for (let x = x1; x >= XB0; x -= 6) { const w = 2 + radioPie(Math.min(x, 700)) * 0.12; g.lineTo(x, SUELO + 1 + w); }
    g.closePath(); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(XB0, SUELO);
    for (let x = XB0; x <= x1; x += 6) { const w = 2 + radioPie(Math.min(x, 700)) * 0.12; g.lineTo(x, SUELO - w * 0.4); } g.stroke();
    g.restore();
  }
  // rastro de la bola gigante al frenar (surco ancho con montón delante)
  function surcoGig(g, t) {
    if (t < T.golpe) return;
    const b = bolaGig(t), x0 = Math.max(b.x, XG_PARA), x1 = XG_GOLPE + 30;
    g.save(); g.fillStyle = "rgba(140,165,205,0.38)";
    g.beginPath(); g.moveTo(x0, SUELO - 3); g.lineTo(x1, SUELO - 3); g.lineTo(x1, SUELO + 9); g.lineTo(x0, SUELO + 9); g.closePath(); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, SUELO - 3); g.lineTo(x1, SUELO - 3); g.stroke();
    g.restore();
  }
  // copos que caen (flojos, de día)
  const COPOS = { lejos: [], cerca: [] };
  for (let i = 0; i < 46; i++) COPOS.lejos.push({ x: hash(i * 3.1) * (W + 80) - 40, y: hash(i * 5.7 + 1) * 700, v: 18 + 16 * hash(i + 11), r: 1 + 1.1 * hash(i + 21), a: hash(i + 31) * TAU, f: 0.6 + hash(i + 41) });
  for (let i = 0; i < 12; i++) COPOS.cerca.push({ x: hash(i * 7.3 + 5) * (W + 80) - 40, y: hash(i * 2.9 + 3) * 700, v: 40 + 26 * hash(i + 51), r: 2.2 + 1.4 * hash(i + 61), a: hash(i + 71) * TAU, f: 0.5 + hash(i + 81) });
  function copos(g, t, capa) {
    const L = COPOS[capa];
    g.save(); g.fillStyle = capa === "cerca" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.75)";
    g.beginPath();
    for (const c of L) {
      const y = ((c.y + c.v * t) % 680) - 40, x = c.x + 12 * Math.sin(t * c.f + c.a) + 6 * t;
      const xx = ((x + 40) % (W + 80) + (W + 80)) % (W + 80) - 40;
      g.moveTo(xx + c.r, y); g.arc(xx, y, c.r, 0, TAU);
    }
    g.fill(); g.restore();
  }
  // nieve que cae del pino al retumbar
  function nievePino(g, t) {
    const k = t - T.temblor0; if (k < 0 || k > 1.4) return;
    for (let i = 0; i < 5; i++) {
      const t0 = 0.05 + i * 0.1, kk = k - t0; if (kk < 0) continue;
      const x = 650 + i * 22 + 6 * Math.sin(kk * 4 + i), y = 250 + i * 30 + 360 * kk * kk + 40 * kk;
      if (y > 446) continue;
      g.fillStyle = "rgba(255,255,255,0.95)"; g.beginPath(); g.ellipse(x, y, 7 - i * 0.6, 5, 0, 0, TAU); g.fill();
      g.strokeStyle = "rgba(120,145,190,0.6)"; g.lineWidth = 1; g.stroke();
    }
  }

  /* =====================================================================================
   * CAPAS SOBRE LOS PERSONAJES
   * ===================================================================================== */
  // cosas en el bolsillo de Marta (zanahorias, ramitas, gorro) y su bufanda al cuello (hoja del torso)
  function capaTroncoM(g, t) {
    const nz = (t < T.zanSale ? 2 : 1) - (t >= T.zan2Sale ? 1 : 0);
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    // ramitas asomando del bolsillo
    if (t < T.ramSale) for (const [x, a] of [[318, -1.45], [338, -1.25]]) {
      g.strokeStyle = TINTA; g.lineWidth = 16; g.beginPath(); g.moveTo(x, 590); g.lineTo(x + Math.cos(a) * 120, 590 + Math.sin(a) * 120); g.stroke();
      g.strokeStyle = "#7a4a28"; g.lineWidth = 9; g.stroke();
    }
    // pompón del gorro
    if (t < T.gorSale) { g.fillStyle = "#d7383f"; g.beginPath(); g.ellipse(352, 586, 24, 14, 0.2, Math.PI, 0); g.fill(); g.lineWidth = 4; g.strokeStyle = TINTA; g.stroke();
      g.fillStyle = "#fbf7f1"; g.beginPath(); g.arc(356, 560, 15, 0, TAU); g.fill(); g.stroke(); }
    // hojas de las zanahorias
    for (let i = 0; i < nz; i++) { const x = 300 + i * 18; g.strokeStyle = "#3f8f3a"; g.lineWidth = 7;
      for (const a of [-1.9, -1.6, -1.3]) { g.beginPath(); g.moveTo(x, 594); g.quadraticCurveTo(x + Math.cos(a) * 30, 594 + Math.sin(a) * 40, x + Math.cos(a) * 46, 594 + Math.sin(a) * 58); g.stroke(); } }
    g.restore();
    // bufanda al cuello (hasta que se la quita)
    const kb = 1 - tramo(t, T.buf0 + 0.06, T.bufSuelta - 0.02);
    if (kb > 0.01) {
      g.save(); g.globalAlpha *= clamp(kb * 1.6);
      const sw = 6 * Math.sin(t * 2.2);
      // vuelta
      g.beginPath(); g.moveTo(120, 262); g.quadraticCurveTo(210, 300, 300, 258); g.lineTo(306, 300); g.quadraticCurveTo(210, 346, 112, 302); g.closePath();
      g.fillStyle = BUF.crema; g.fill();
      g.save(); g.clip(); g.fillStyle = BUF.rojo; for (let x = 100; x < 320; x += 40) g.fillRect(x, 240, 20, 120); g.restore();
      g.lineWidth = 5; g.strokeStyle = BUF.tinta; g.stroke();
      // cola que cuelga por delante (se acorta al tirar)
      const L = 170 * kb;
      g.beginPath(); g.moveTo(236, 300); g.quadraticCurveTo(250 + sw, 300 + L * 0.5, 246 + sw, 300 + L); g.lineTo(286 + sw, 300 + L - 4); g.quadraticCurveTo(286 + sw * 0.5, 300 + L * 0.5, 276, 296); g.closePath();
      g.fillStyle = BUF.rojo; g.fill(); g.stroke();
      g.fillStyle = BUF.crema; g.fillRect(250 + sw * 0.8, 300 + L * 0.6, 34, 16);
      g.restore();
    }
  }
  // bufanda colgando de la mano de Marta (de su cuello al del muñeco)
  function bufandaEnManos(g, t, pm) {
    if (t < T.buf0 + 0.08 || t >= T.bufPon + 0.06) return;
    const lM = centroMano(M, pm, pm.manoLejos);
    const k = tramo(t, T.buf0 + 0.08, T.bufSuelta) * (1 - tramo(t, T.bufPon - 0.04, T.bufPon + 0.06));
    if (k <= 0.01) return;
    g.save(); g.lineCap = "round"; g.lineJoin = "round"; g.globalAlpha *= clamp(k * 1.5);
    const sw = 7 * Math.sin(t * 8), L1 = 60 * k, L2 = 44 * k;
    for (const [L, dx, ph] of [[L1, -6, 0], [L2, 7, 1.3]]) {
      const a = P(lM.x + dx * 0.3, lM.y + 4), e = P(lM.x + dx + sw * Math.sin(ph + t * 3), lM.y + L);
      g.strokeStyle = BUF.tinta; g.lineWidth = 13; g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo(a.x + dx, a.y + L * 0.5, e.x, e.y); g.stroke();
      g.strokeStyle = BUF.rojo; g.lineWidth = 9.5; g.stroke();
      g.setLineDash([8, 9]); g.strokeStyle = BUF.crema; g.stroke(); g.setLineDash([]);
      g.strokeStyle = BUF.tinta; g.lineWidth = 1.2;
      for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(e.x - 4 + i * 2.6, e.y + 3); g.lineTo(e.x - 4 + i * 2.8, e.y + 8); g.stroke(); }
    }
    g.restore();
  }
  // puños otra vez encima de lo que agarran
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
  // lo que Marta lleva en la mano de lejos
  function cosasEnMano(g, t, pm) {
    const lM = centroMano(M, pm, pm.manoLejos);
    const sale = (t0, t1) => tramo(t, t0, t1);
    let dibujo = false;
    // zanahoria cogida por la punta: la base va hacia la cara
    const zanEnMano = (a) => { const b = P(lM.x - Math.cos(a) * (ZAN_L + 4), lM.y - Math.sin(a) * (ZAN_L + 4)); zanahoria(g, b.x, b.y, a, ZAN_L, 1); };
    if (t >= T.zanSale - 0.04 && t < T.zanPon) { zanEnMano(lerp(-1.4, ZAN_A, sale(T.zanSale, T.zanPon - 0.08))); dibujo = true; }
    const ramaEnMano = (a) => { const b = P(lM.x - Math.cos(a) * 24, lM.y - Math.sin(a) * 24); ramita(g, b.x, b.y, a, RAMA_L); };
    if (t >= T.ramSale - 0.04 && t < T.ramD) { const u = sale(T.ramSale, T.ramD - 0.06); ramaEnMano(lerp(-1.5, RAMA_D.ang, u)); ramaEnMano(lerp(-1.75, -1.2, u)); dibujo = true; }
    if (t >= T.ramD && t < T.ramI) { ramaEnMano(lerp(-1.2, RAMA_I.ang - TAU, sale(T.ramD + 0.06, T.ramI - 0.06))); dibujo = true; }
    if (t >= T.gorSale - 0.04 && t < T.gorPon) { gorro(g, lM.x + 2, lM.y + 14, lerp(-0.6, -0.08, sale(T.gorSale, T.gorPon - 0.05)), lerp(40, 46, sale(T.gorSale, T.gorPon)), { pompon: Math.sin(t * 12) * 0.5 }); dibujo = true; }
    if (t >= T.zan2Sale - 0.04 && t < T.lanzaZ) { zanEnMano(lerp(-1.4, -0.4, sale(T.zan2Sale, T.zan2Arma))); dibujo = true; }
    if (t >= T.gorQ && t < T.lanzaG) { gorro(g, lM.x + 2, lM.y + 12, lerp(-0.08, 0.35, sale(T.gorQ, T.gorArma)), 46, { pompon: Math.sin(t * 12) * 0.5 }); dibujo = true; }
    if (dibujo) punosEncima(g, M, pm, ["lejos"]);
  }
  // parábola de un objeto lanzado
  // de dónde salen la zanahoria y el gorro al lanzarlos (la mano de Marta en ese instante)
  let SAL = null;
  function salidas() {
    if (!SAL) {
      const pz = poseM(T.lanzaZ), pq = poseM(T.lanzaG), hz = centroMano(M, pz, pz.manoLejos), hg = centroMano(M, pq, pq.manoLejos);
      SAL = { z: P(hz.x - Math.cos(-0.4) * (ZAN_L + 4), hz.y - Math.sin(-0.4) * (ZAN_L + 4)), g: P(hg.x + 2, hg.y + 12) };
    }
    return SAL;
  }
  const vuelo = (a, b, u, alto) => P(lerp(a.x, b.x, u), lerp(a.y, b.y, u) - alto * 4 * u * (1 - u));

  /* =====================================================================================
   * GUILLERMO DENTRO DE LA BOLA
   * ===================================================================================== */
  const NARIZ_G = P(846, 688), COPA_G = P(770, 248);
  function enBola(pg, q) { const a = vaiven(pg._t), c = P(pg.x, SUELO); const dx = q.x - c.x, dy = q.y - c.y; return P(c.x + dx * Math.cos(a) - dy * Math.sin(a), c.y + dx * Math.sin(a) + dy * Math.cos(a)); }
  const narizG = pg => enBola(pg, G.aPantalla(pg, G.cabeza(pg).a(NARIZ_G)));
  const copaG = pg => enBola(pg, G.aPantalla(pg, G.cabeza(pg).a(COPA_G)));
  const angCabG = pg => pg.cabeza.ang + vaiven(pg._t);
  // collar de nieve donde asoman la cabeza, las muñecas y las piernas
  function collares(g, pg, b) {
    const pts = [];
    const cuello = G.aPantalla(pg, G.tronco(pg)(G.CUELLO));
    pts.push([cuello, 22]);
    for (const lado of ["cerca", "lejos"]) {
      const m = lado === "cerca" ? pg.manoCerca : pg.manoLejos, h = aPant(G, pg, lado === "cerca" ? G.HOMBRO_C : G.HOMBRO), mm = centroMano(G, pg, m);
      // punto donde el brazo cruza el borde
      const dx = mm.x - h.x, dy = mm.y - h.y; let s0 = 0, s1 = 1;
      for (let i = 0; i < 18; i++) { const s = (s0 + s1) / 2, x = h.x + dx * s, y = h.y + dy * s; if (Math.hypot(x - b.cx, y - b.cy) < b.r - 4) s0 = s; else s1 = s; }
      pts.push([P(h.x + dx * s1, h.y + dy * s1), 13]);
    }
    for (const lado of ["cerca", "lejos"]) {
      const q = pg.piernas[lado], tob = G.aPantalla(pg, q.tob), cad = aPant(G, pg, G.CADERA[lado]);
      const dx = tob.x - cad.x, dy = tob.y - cad.y; let s0 = 0, s1 = 1;
      for (let i = 0; i < 18; i++) { const s = (s0 + s1) / 2, x = cad.x + dx * s, y = cad.y + dy * s; if (Math.hypot(x - b.cx, y - b.cy) < b.r - 4) s0 = s; else s1 = s; }
      pts.push([P(cad.x + dx * s1, cad.y + dy * s1), 15]);
    }
    g.save();
    for (const [q, r] of pts) {
      for (let i = 0; i < 5; i++) {
        const a = i / 5 * TAU + 0.4, x = q.x + Math.cos(a) * r * 0.55, y = q.y + Math.sin(a) * r * 0.35, rr = r * (0.42 + 0.12 * hash(i + r));
        g.fillStyle = "#ffffff"; g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill();
        g.strokeStyle = "rgba(90,115,165,0.55)"; g.lineWidth = 1.2; g.beginPath(); g.arc(x, y, rr, 0.1 * Math.PI, 0.9 * Math.PI); g.stroke();
      }
    }
    g.restore();
  }

  /* =====================================================================================
   * CÁMARA Y ESCENA
   * ===================================================================================== */
  function camara(t) {
    const z = tramo(t, 10.45, 11.15) * (1 - tramo(t, 14.15, 14.85));
    let sx = 0, sy = 0;
    const tb = campana(t, T.temblor0, T.temblor1) * 2.2 + Math.exp(-Math.max(0, t - T.golpe) * 5) * 3.5 * (t > T.golpe ? 1 : 0) + campana(t, T.achis, T.achis + 0.3) * 1.2;
    if (tb > 0.01) { sx = ruido(t * 14) * tb; sy = ruido(t * 14 + 7.3) * tb; }
    return { k: 1 + 0.06 * z, x: lerp(W / 2, 446, z) + sx, y: lerp(H / 2, 314, z) + sy };
  }

  class Muneco extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !M.listo()) return;
      if (!fondoLejos) creaFondos();
      const pg = poseG(t), pm = poseM(t);
      pg._t = t;
      const luz = tramo(t, NEGRO_INICIO, T.entra, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      const bl = bolaLejos(t), entre = !!bl || (t > T.temblor0 && t < T.temblor0 + 1.4);
      g.drawImage(entre ? fondoLejos : fondoTodo, FX, FY);
      // bola en la colina de enfrente (con su rastro)
      if (bl) {
        g.save(); g.strokeStyle = "rgba(150,175,212,0.5)"; g.lineWidth = 3; g.beginPath();
        const xr = t < T.lejosVuelve ? bl.x : 1000;
        for (let x = 900; x <= xr; x += 4) { const y = yEnfrente(x) - 1; x === 900 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); g.restore();
        bola(g, bl.cx, bl.cy, bl.r, bl.rot, { bultos: 0.6, tinta: 1.3 });
      }
      if (entre) { nievePino(g, t); g.drawImage(fondoCerca, FX, FY); }
      copos(g, t, "lejos");
      // rastros y sombras
      rastroG(g, t); surcoGig(g, t);
      // muñeco de Marta
      muneco(g, t);
      // bola de Guillermo (detrás de él)
      const b = bolaG(t);
      if (t > T.rasca0 + 0.05 && t < T.rasca1) {
        // la nieve se amontona con la puntera
        const k = tramo(t, T.rasca0 + 0.05, T.rasca1);
        g.save(); g.fillStyle = "#ffffff"; g.strokeStyle = NIEVE.tinta; g.lineWidth = 1.5;
        g.beginPath(); g.ellipse(XB0, SUELO - 4 * k, 6 + 6 * k, 3 + 6 * k, 0, Math.PI, 0); g.closePath(); g.fill(); g.stroke(); g.restore();
      }
      if (b) { sombra(g, b.x, b.r * 0.9, 0.22, suelo(b.x)); bola(g, b.cx, b.cy, b.r, b.rot, { semilla: 4 }); }
      if (b && t > T.patada && b.x > BORDE - 10) salpica(g, b.cx - b.r * 0.6, suelo(b.x), T.patada + (BORDE - 700) / 330, t, 10, 220, 3, 1, -0.6);
      // Marta
      pm.capaTronco = gg => capaTroncoM(gg, t);
      M.dibujar(g, pm, t);
      // cabeza suelta en sus manos (antes de ponerla)
      const cs = cabezaSuelta(t);
      if (cs) { cabezaMuneco(g, cs.x, cs.y, t); punosEncima(g, M, pm, ["cerca", "lejos"]); }
      bufandaEnManos(g, t, pm);
      cosasEnMano(g, t, pm);
      // destello del muñeco terminado
      const bri = campana(t, T.brillo, T.brillo + 0.4);
      if (bri > 0) { estrella(g, XS + 30, 280, 10 * bri, bri); estrella(g, XS - 26, 330, 7 * bri, bri * 0.8); }
      // Guillermo
      const bg = bolaGig(t);
      if (!pg.dentro) {
        g.save();
        if (pg.giroX < 0.999) { g.translate(pg.x, 0); g.scale(pg.giroX, 1); g.translate(-pg.x, 0); }
        // el golpe: se va hacia atrás
        const caida = tramo(t, T.golpe - 0.08, T.golpe), sigue = tramo(t, T.golpe, T.traga, x => x);
        if (caida > 0) {
          const emp = t > T.golpe ? bolaGig(t).cx - bolaGig(T.golpe).cx : 0;
          g.translate(emp, -8 * sigue); g.translate(pg.x, SUELO); g.rotate(-0.16 * caida - 0.08 * sigue); g.translate(-pg.x - 10 * caida, -SUELO - 8 * caida);
        }
        G.dibujar(g, pg, t);
        g.restore();
        // notas del silbido
        for (let i = 0; i < 3; i++) { const t0 = T.anda0 + 0.08 + i * 0.17, k = fase(t, t0, t0 + 0.6); if (k <= 0 || k >= 1 || t > T.congela + 0.05) continue;
          const bo = G.aPantalla(pg, G.boca(pg)); nota(g, bo.x - 14 - 30 * k, bo.y - 10 - 34 * k + 5 * Math.sin(k * 9), 0.9, Math.sin(Math.PI * k)); }
        if (bg) { sombra(g, bg.x, bg.r * 0.95, 0.25, suelo(bg.x)); bola(g, bg.cx, bg.cy, bg.r, bg.rot, { semilla: 7 }); salpica(g, bg.cx + bg.r * 0.6, suelo(bg.x) - 6, T.gigante0 + 0.15, t, 14, 300, 9, 1.4, 0.7); }
      } else {
        // dentro de la bola gigante (con su vaivén)
        const a = vaiven(t), c = P(bg.cx, SUELO);
        sombra(g, bg.cx, bg.r * 0.95, 0.25);
        g.save(); g.translate(c.x, c.y); g.rotate(a); g.translate(-c.x, -c.y);
        bolaFija(g, "gigante", bg.cx, bg.cy, bg.r, bg.rot, { semilla: 7 });
        g.save(); g.beginPath(); g.rect(-200, -200, W + 400, H + 400); g.arc(bg.cx, bg.cy, bg.r - 5, 0, TAU); g.clip("evenodd");
        G.dibujar(g, pg, t);
        g.restore();
        collares(g, pg, bg);
        g.restore();
        // zanahoria en la nariz
        if (t >= T.zanLlega) {
          const n = narizG(pg), k = t - T.zanLlega, tiembla = 0.12 * Math.exp(-k * 7) * Math.sin(k * 30) + 0.08 * Math.exp(-Math.max(0, t - T.achis) * 6) * Math.sin((t - T.achis) * 26) * (t > T.achis ? 1 : 0)
            + 0.05 * Math.sin(t * 34) * campana(t, T.picor, T.ah1 + 0.1);
          zanahoria(g, n.x - 2, n.y + 1, angCabG(pg) + 0.15 + tiembla, 28);
        }
        // gorro en la cabeza
        if (t >= T.gorLlega && t < T.achis) {
          const q = copaG(pg), k = t - T.gorLlega;
          gorro(g, q.x, q.y, angCabG(pg) - 0.15 + 0.1 * Math.exp(-k * 6) * Math.sin(k * 16), 54, { aplasta: Math.exp(-k * 8) * Math.max(0, Math.sin(k * 26)), pompon: Math.exp(-k * 4) * Math.sin(k * 16) });
        }
      }
      // nube del golpe (sigue a la bola un poco por detrás)
      const nb = tramo(t, T.nube0, T.nubeMax, salida) * (1 - tramo(t, T.nubeMax + 0.12, T.nube1));
      if (nb > 0.01 && bg) {
        const cxN = bg.cx - lerp(130, -10, tramo(t, T.traga + 0.05, T.para)), k = tramo(t, T.nube0, T.nube1);
        nube(g, cxN, 400, 200, 0.9 + 0.3 * k, nb, 3);
        nube(g, cxN + 10, 270, 160, 0.85 + 0.4 * k, nb, 8);
        nube(g, cxN - 70, 330, 130, 0.85 + 0.4 * k, nb * 0.95, 13);
        nube(g, cxN + 90, 330, 130, 0.85 + 0.4 * k, nb * 0.95, 17);
        nube(g, cxN + 5, 170, 110, 0.8 + 0.4 * k, nb * 0.95, 21);
        nube(g, cxN - 110, 230, 110, 0.85 + 0.4 * k, nb * 0.95, 25);
        nube(g, cxN + 170, 260, 100, 0.8 + 0.4 * k, nb * 0.9, 29);
      }
      if (t > T.golpe) salpica(g, 640, 380, T.golpe, t, 18, 380, 11, 1.6);
      // la bola frena: montoncito de nieve delante y salpicón junto al muñeco
      if (t > T.para - 0.1) salpica(g, XG_PARA - RG + 4, SUELO - 10, T.para - 0.08, t, 10, 160, 21, 1.1, -0.5);
      // vuelos: zanahoria y gorro
      if (t >= T.lanzaZ && t < T.zanLlega) {
        const u = fase(t, T.lanzaZ, T.zanLlega), a0 = salidas().z, n = narizG(pg), q = vuelo(a0, P(n.x, n.y), u, 70);
        zanahoria(g, q.x, q.y, lerp(-0.4, angCabG(pg) + 0.15 + TAU * 2, suave(u)), lerp(ZAN_L, 28, u), 0);
      }
      if (t >= T.lanzaG && t < T.gorLlega) {
        const u = fase(t, T.lanzaG, T.gorLlega), a0 = salidas().g, q0 = copaG(pg), q = vuelo(a0, q0, u, 60);
        gorro(g, q.x, q.y, lerp(0.35, angCabG(pg) - 0.15, suave(u)), lerp(44, 54, u), { giro: Math.cos(u * TAU * 1.5), pompon: Math.sin(u * 20) * 0.6 });
      }
      if (t >= T.achis && t < T.gorAterriza) {
        const u = fase(t, T.achis, T.gorAterriza), q0 = copaG(pg), q = vuelo(q0, P(COPA_S.x + 2, COPA_S.y + 4), u, 150);
        gorro(g, q.x, q.y, lerp(angCabG(pg) - 0.15, -0.08 - TAU, suave(u)), lerp(54, 46, u), { pompon: Math.sin(u * 18) * 0.7 });
      }
      // estornudo: nube de la nariz
      if (t > T.achis - 0.02 && t < T.achis + 0.8 && pg.dentro) {
        const n = narizG(pg), k = tramo(t, T.achis - 0.02, T.achis + 0.8, salida);
        nube(g, n.x + 30 + 50 * k, n.y + 6 - 6 * k, 30 + 26 * k, k, 1 - k, 5);
        salpica(g, n.x + 20, n.y, T.achis, t, 8, 200, 31, 0.9, 1.3);
      }
      // estrellitas al quedar atrapado
      if (pg.dentro) {
        const k = campana(t, T.nubeMax, T.miraAbajo + 0.2);
        if (k > 0) { const c = G.aPantalla(pg, G.centroCabeza(pg)); for (let i = 0; i < 3; i++) { const a = t * 6 + i * TAU / 3; estrella(g, c.x + Math.cos(a) * 46, c.y - 70 + Math.sin(a) * 12, 8, k); } }
      }
      // retumbo: rayitas en la nieve
      const rt = campana(t, T.temblor0, T.temblor1);
      if (rt > 0.05) { g.save(); g.strokeStyle = `rgba(110,135,180,${0.6 * rt})`; g.lineWidth = 2;
        for (let i = 0; i < 6; i++) { const x = 560 + i * 40, y = SUELO + 18 + (i % 2) * 14, o = 3 * Math.sin(t * 50 + i); g.beginPath(); g.moveTo(x - 10, y + o); g.lineTo(x - 3, y - 3 - o); g.lineTo(x + 4, y + 3 + o); g.lineTo(x + 11, y - o); g.stroke(); }
        g.restore(); }
      copos(g, t, "cerca");
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }

  registrar({ id: "00099", nombre: "Guillermo y Marta · El muñeco de nieve", crear: () => new Muneco() });
  window.__A2D_00099 = { pose, T, DUR, bolaG, bolaGig, bolaLejos };
})();
