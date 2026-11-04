"use strict";
/* 00104.2 · Guillermo y Paradigma · El pelo largo
 *
 * Negro → la acera de una tienda de discos a la hora dorada: pared de ladrillo, el escaparate
 * iluminado lleno de discos y una guitarra colgada, el letrero con un vinilo (sin letras), una puerta
 * de cristal oscuro con marco de latón que refleja, una pila de cajas de discos con una caja de
 * cartón encima y hojas secas que cruzan con el viento. Paradigma se echa la melena atrás a cámara
 * lenta, como una estrella del rock: cabeza abajo, latigazo, el mechón de delante vuela y cae
 * perfecto, la nuca ondea, destellos y viento. Guillermo lo intenta con sus pinchos: cabeceo… y no se
 * mueve nada (solo un pincho hace «boing»). Otra vez, con más fuerza: nada. Se le enciende la
 * bombilla, saca de la caja una peluca rubia larguísima, la sacude, la lanza al aire y la caza con la
 * cabeza. Pose. Melenazo a cámara lenta como Paradigma… y la peluca sale volando dando una vuelta
 * por el aire hasta caer encima de la melena de Paradigma: dos melenas, una encima de otra.
 * Paradigma, sin inmutarse, se gira hacia el cristal de la puerta, se mira, ladea la cabeza y da el
 * visto bueno con el pulgar (el reflejo también). Guillermo, otra vez con sus pinchos (boing), mira a
 * cámara; Paradigma guiña un ojo → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t` (las cámaras lentas son una deformación del
 * tiempo, calculada en una tabla al empezar). El pelo de Paradigma se mueve con sus propios píxeles:
 * los mechones de la nuca y el de delante se recortan del retrato una vez (lienzos pequeños) y se
 * dibujan con Recortes.tira doblándose; debajo se repinta el fondo y una capa de pelo oscuro. El
 * pincho de Guillermo se borra igual (repintando el fondo) y se dibuja girado. La peluca la dibuja
 * la escena (mechones con su muelle, tabla precalculada).
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, mezcla, hash } = M2;
  const G = Guillermo, PD = Paradigma, RC = Recortes;
  const DUR = 14.6, TINTA = "#0b0a0e", TAU = Math.PI * 2;
  const SUELO = 552, ESCALA = 0.3;

  const T = {
    // Paradigma: melenazo
    pMira: 0.5, pBaja0: 0.85, pBaja1: 1.5, lento0: 1.5, lento1: 3.1, pAbre: 3.5, pMiraG: 3.95,
    // Guillermo: lo mira y lo intenta
    gFlipa: 1.75, gDecide: 3.6,
    g1Baja: 3.95, g1Tira: 4.2, g1Fin: 4.42, g1Mira: 4.62,
    g2Baja: 5.05, g2Tira: 5.34, g2Fin: 5.54, g2Mira: 5.85, g2Enfado: 6.0,
    idea: 6.3, gira1a: 6.6, gira1b: 6.84, anda1: 7.34,
    mete0: 7.34, mete1: 7.6, saca1: 8.0, sacude1: 8.3, lanza: 8.42, aterriza: 8.76,
    posa0: 8.9, g3Baja0: 9.32, g3Baja1: 9.62, lento2: 9.62, despega: 10.02, llega: 11.25, lento3: 11.25,
    gAbre: 11.5, gira2a: 11.85, gira2b: 12.1,
    pParpa: [11.45, 11.68], pMiraArriba: 11.5, pGira0: 11.92, pGira1: 12.17, pPaso0: 12.1, pPaso1: 12.45,
    pLado1: 12.42, pLado2: 12.72, pPulgar0: 12.86, pPulgar1: 13.1, pCam: 13.38, pGuino: 13.52,
    gCam: 13.12, gBoing: 13.28,
    fin: 13.95
  };

  /* ---------- utilidades ---------- */
  const P = (x, y) => ({ x, y });
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function guion(lista, dic, base, t) {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  // curva por claves [t, v] con tramos suaves
  function claves(t, L) {
    if (t <= L[0][0]) return L[0][1];
    for (let i = 1; i < L.length; i++) if (t <= L[i][0]) return lerp(L[i - 1][1], L[i][1], suave(fase(t, L[i - 1][0], L[i][0])));
    return L[L.length - 1][1];
  }
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const D5 = (pu, ix, md, an, me) => ({ pulgar: pu, indice: ix, medio: md, anular: an, menique: me });
  const TODOS = k => D5(k, k, k, k, k);
  const PUNO = TODOS(0), PALMA = D5(0.8, 1, 1, 1, 1), PINZA = D5(0.45, 0.4, 0.2, 0.2, 0.2), PULGAR = D5(1, 0, 0, 0, 0);
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const rota = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return P(q.x * c - q.y * s, q.x * s + q.y * c); };
  // afines de pantalla { a, b, c, d, e, f } (como setTransform)
  const AF = (a, b, c, d, e, f) => ({ a, b, c, d, e, f });
  const mul = (A, B) => AF(A.a * B.a + A.c * B.b, A.b * B.a + A.d * B.b, A.a * B.c + A.c * B.d, A.b * B.c + A.d * B.d,
    A.a * B.e + A.c * B.f + A.e, A.b * B.e + A.d * B.f + A.f);
  const Tm = (x, y) => AF(1, 0, 0, 1, x, y), Rm = r => AF(Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0), Sm = (x, y) => AF(x, 0, 0, y, 0, 0);
  const aplica = (g, A) => g.transform(A.a, A.b, A.c, A.d, A.e, A.f);
  // descompone un afín en posición, giro, escala horizontal (con signo: espejo) y vertical
  function descompone(A) {
    const sy = Math.hypot(A.c, A.d), th = Math.atan2(-A.c, A.d);
    return { x: A.e, y: A.f, th, sx: A.a * Math.cos(th) + A.b * Math.sin(th), sy };
  }
  const compone = d => mul(Tm(d.x, d.y), mul(Rm(d.th), Sm(d.sx, d.sy)));
  // retrato de la cabeza → pantalla (con el giro aplastado del personaje)
  function afCab(R, p) {
    const H = R.cabeza(p), f = q => aPantallaG(R, p, H.a(q));
    const o = f(P(0, 0)), ex = f(P(100, 0)), ey = f(P(0, 100));
    return AF((ex.x - o.x) / 100, (ex.y - o.y) / 100, (ey.x - o.x) / 100, (ey.y - o.y) / 100, o.x, o.y);
  }
  // hoja → pantalla teniendo en cuenta el giro aplastado (sx) alrededor de p.x
  function aPantallaG(R, p, q) { const s = R.aPantalla(p, q), sx = p.sx ?? 1; return P(p.x + (s.x - p.x) * sx, s.y); }
  const enCab = (R, p, q) => aPantallaG(R, p, R.cabeza(p).a(q));

  /* ---------- tiempo: dos cámaras lentas (tabla) ---------- */
  const lento = t => 0.7 * (tramo(t, T.lento0 - 0.08, T.lento0 + 0.06) * (1 - tramo(t, T.lento1 - 0.06, T.lento1 + 0.06))
    + tramo(t, T.lento2 - 0.08, T.lento2 + 0.06) * (1 - tramo(t, T.lento3 - 0.04, T.lento3 + 0.06)));
  const HZ = 240, NT = Math.ceil(DUR * HZ) + 2;
  const TAUT = (() => { const a = new Float32Array(NT); let s = 0; for (let i = 1; i < NT; i++) { s += (1 - lento((i - 0.5) / HZ)) / HZ; a[i] = s; } return a; })();
  const tabla = (A, t) => { const x = clamp(t * HZ, 0, NT - 1.001), i = Math.floor(x), f = x - i; return A[i] + (A[i + 1] - A[i]) * f; };
  const tau = t => tabla(TAUT, t);              // tiempo «del mundo» (las cosas del fondo van a cámara lenta)

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

  /* ---------- manos ---------- */
  const R_M = G.MUNECA_R * G.JK;
  const manoDesde = (m, mu) => P(m.x - Math.cos(mu) * R_M, m.y - Math.sin(mu) * R_M);
  const BOLS_GC = manoDesde(P(131, 652), -1.75), BOLS_GL = manoDesde(P(372, 648), -1.75);
  // { h: [x, y] } punto del tronco (hoja) con mu relativo al tronco · { scr: () => pantalla } · { bols }
  function resolutor(R, p, lado) {
    const Tr = R.tronco(p);
    return o => {
      if (o.bols) {
        if (R.manoReposo) { const m = R.manoReposo(p, lado); return { x: m.x, y: m.y, mu: m.mu, ang: 0, puno: 0, dedos: TODOS(0.4), dobla: lado === "cerca" ? -1 : 1 }; }
        const m = Tr(lado === "cerca" ? BOLS_GC : BOLS_GL);
        return { x: m.x, y: m.y, mu: -1.75 + p.torso, ang: 0, puno: 0, dedos: TODOS(0.4), dobla: lado === "cerca" ? -1 : 1 };
      }
      if (o.scr) { const h = R.aHoja(p, o.scr()); return { x: h.x, y: h.y, mu: o.mu, ang: 0, puno: 1, dedos: o.dedos, dobla: o.dobla ?? (lado === "cerca" ? -1 : 1) }; }
      const q = Tr(P(o.h[0], o.h[1]));
      return { x: q.x, y: q.y, mu: o.mu + p.torso, ang: 0, puno: o.puno ?? 1, dedos: o.dedos, dobla: o.dobla ?? (lado === "cerca" ? -1 : 1) };
    };
  }
  const mezMano = (a, d, k) => ({ x: lerp(a.x, d.x, k), y: lerp(a.y, d.y, k), mu: lerp(a.mu, d.mu, k), ang: 0, puno: lerp(a.puno, d.puno, k),
    dedos: DD(a.dedos, d.dedos, k), dobla: k < 0.5 ? a.dobla : d.dobla });
  function pista(lista, t, res) {
    let c = res(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i];
      if (t <= t0) break;
      c = mezMano(c, res(obj), (f || suave)(fase(t, t0, t1)));
    }
    return c;
  }
  const HM = (x, y, mu, dedos, dobla) => ({ h: [x, y], mu, dedos, dobla });
  const conMano = (m, dx, dy, dmu = 0) => Object.assign({}, m, { x: m.x + dx, y: m.y + dy, mu: m.mu + dmu });

  /* ---------- pies ---------- */
  function pieDe(apoyos, t, o) {
    let i = 0; for (let k = 0; k < apoyos.length; k++) if (apoyos[k][0] <= t) i = k;
    const [tf, xf, d0] = apoyos[i], dur = d0 ?? o.apoyo;
    if (t <= tf || i === apoyos.length - 1 || t <= tf + dur) return { x: xf, h: 0, a: 0 };
    const [tn, xn] = apoyos[i + 1], toff = tf + dur, u = clamp((t - toff) / (tn - toff));
    const x = lerp(xf, xn, suave(clamp((u - 0.05) / 0.95)));
    const h = o.alto * Math.sin(Math.PI * u);
    return { x, h, a: 0.26 * Math.sin(Math.PI * u) - 0.08 * Math.sin(TAU * u) };
  }
  function aPierna(R, p, w, lado) {
    const tob = R.SUELO - R.TOBILLO_ALTO;
    return { tob: P(R.aHoja(p, P(w.x, 0)).x, tob - (lado === "lejos" ? 12 : 0) - w.h / p.s), ang: w.a };
  }
  // giro aplastado: espejo cambia a mitad del giro; sx = |cos|
  function giro(t, t0, t1, de, a) {
    const u = fase(t, t0, t1);
    if (u <= 0) return { espejo: de, sx: 1 };
    if (u >= 1) return { espejo: a, sx: 1 };
    return { espejo: u < 0.5 ? de : a, sx: Math.max(0.002, Math.abs(Math.cos(Math.PI * suave(u)))), gira: Math.sin(Math.PI * u) };
  }

  const MEMO = new Map();
  const memo = (c, f) => { if (MEMO.has(c)) return MEMO.get(c); if (MEMO.size > 40) MEMO.clear(); const v = f(); MEMO.set(c, v); return v; };

  /* =====================================================================================
   * PARADIGMA (a la derecha; mira a la izquierda hasta que se gira hacia la puerta)
   * ===================================================================================== */
  const XP0 = 650;
  const xP = t => XP0 + 26 * tramo(t, T.pPaso0, T.pPaso1);
  const PASOS_P = {
    izq: [[0, XP0 - 28, T.pGira1 + 0.03], [T.pPaso1, XP0 - 2]],
    der: [[0, XP0 + 30, T.pPaso1 - 0.09], [T.pPaso1 + 0.18, XP0 + 56]]
  };
  // el melenazo: cabeza abajo, latigazo lento hacia atrás y asienta
  const CAB_P = [[0, 0], [T.pBaja0, 0], [T.pBaja1, 0.36], [2.15, -0.06], [2.6, -0.42], [3.05, -0.32], [3.45, -0.1], [3.9, -0.12], [4.6, -0.05]];
  const TORSO_P = [[0, -0.03], [T.pBaja0, -0.03], [T.pBaja1, 0.12], [2.6, -0.16], [3.2, -0.08], [3.9, -0.05]];
  // mechones (ángulos de Recortes.tira: + hacia la nuca, − hacia la cara)
  // el mechón de delante: cuelga sobre la cara con la cabeza abajo y, con el latigazo, pasa por encima de la cabeza hacia la nuca
  const FRENTE_A1 = [[0, 0], [T.pBaja0, 0], [T.pBaja1, -0.22], [2.0, -0.12], [2.55, 0.75], [3.05, 0.42], [3.32, -0.1], [3.62, 0.05], [3.95, -0.02], [4.6, 0]];
  const FRENTE_A2 = [[0, 0], [T.pBaja0, 0], [T.pBaja1, -0.3], [2.0, -0.25], [2.55, 1.85], [3.05, 1.05], [3.32, -0.28], [3.6, 0.14], [3.88, -0.05], [4.2, 0.02], [4.6, 0]];
  const NUCA_A1 = [[0, 0], [T.pBaja0, 0], [T.pBaja1, -0.07], [2.45, 0.13], [3.05, 0.07], [3.4, -0.04], [3.8, 0.01], [4.6, 0]];
  const NUCA_A2 = [[0, 0], [T.pBaja0, 0], [T.pBaja1, -0.3], [2.0, 0.3], [2.45, 1.25], [3.05, 0.7], [3.32, -0.28], [3.62, 0.16], [3.92, -0.05], [4.25, 0.03], [4.6, 0]];
  const peloActivo = t => t > T.pBaja0 + 0.005 && t < 4.59;

  const CP0 = { pel: 0, torso: 0, cab: 0, cdy: 0 };
  const CP = o => Object.assign({}, CP0, o);
  const CUERPOS_P = {
    chulo: CP({ pel: 4, torso: -0.04, cab: -0.04 }),
    risa: CP({ pel: 10, torso: 0.06, cab: 0.08 }),
    plop: CP({ pel: 18, torso: 0.02, cab: 0.12, cdy: 6 }),
    arriba: CP({ pel: 6, torso: -0.04, cab: -0.12 }),
    espejo: CP({ pel: 4, torso: -0.06, cab: -0.04 }),
    pulgar: CP({ pel: 6, torso: -0.04, cab: 0.02 }),
    camara: CP({ pel: 4, torso: -0.05, cab: -0.06 })
  };
  const GUION_CUERPO_P = [
    [4.4, 4.7, "risa"], [6.4, 6.8, "chulo"], [T.llega - 0.02, T.llega + 0.08, "plop", salida], [T.llega + 0.2, T.llega + 0.5, "arriba"],
    [T.pGira0, T.pGira1, "espejo"], [T.pPulgar0 - 0.1, T.pPulgar0 + 0.2, "pulgar"], [T.pCam, T.pCam + 0.3, "camara"]
  ];
  const CARAS_P = {
    mira: E({ mx: 0.85, my: 0.05, c: 0.25, sd: 4, si: 10, gi: 0.08, abre: 0, ancho: 0.8, sonr: 0.35 }),
    camara: E({ mx: -0.4, my: 0.05, c: 0.32, sd: 6, si: 16, gi: 0.12, abre: 0, ancho: 0.75, sonr: 0.55 }),
    baja: E({ mx: 0.6, my: 0.5, c: 0.75, sd: 8, si: 8, abre: 0, ancho: 0.75, sonr: 0.4 }),
    latigo: E({ mx: 0.2, my: -0.3, c: 0.62, sd: 14, si: 14, abre: 8, ancho: 0.8, sonr: 0.5 }),
    chulo: E({ mx: 0.4, my: -0.1, c: 0.5, sd: 8, si: 12, gi: 0.08, abre: 0, ancho: 0.78, sonr: 0.6 }),
    miraG: E({ mx: 0.95, my: 0.12, c: 0.3, sd: 6, si: 12, gi: 0.1, abre: 0, ancho: 0.78, sonr: 0.5 }),
    aguanta: E({ mx: 0.95, my: 0.15, c: 0.45, z: 0.2, sd: 10, si: 10, abre: 0, ancho: 0.6, sonr: 0.3, mof: 1, rub: 0.4 }),
    neutra: E({ mx: 0.9, my: 0.08, c: 0.3, sd: 6, si: 10, abre: 0, ancho: 0.75, sonr: 0.4 }),
    ve: E({ mx: 0.95, my: -0.5, c: 0.15, sd: 12, si: 18, gi: 0.1, abre: 0, ancho: 0.7, sonr: 0.2 }),
    plop: E({ c: 1, z: 0.5, sd: 2, si: 2, abre: 0, ancho: 0.6, sonr: 0 }),
    arriba: E({ mx: 0.3, my: -1, c: 0.1, sd: 16, si: 20, gi: 0.1, abre: 0, ancho: 0.65, sonr: 0.1 }),
    espejo: E({ mx: 0.95, my: -0.05, c: 0.3, sd: 10, si: 18, gi: 0.12, abre: 0, ancho: 0.8, sonr: 0.55 }),
    aprueba: E({ mx: 0.95, my: 0, c: 0.35, sd: 16, si: 22, gi: 0.12, abre: 0, ancho: 0.85, sonr: 0.8 }),
    camaraF: E({ mx: -0.35, my: 0.05, c: 0.25, sd: 10, si: 16, gi: 0.12, abre: 0, ancho: 0.82, sonr: 0.75 })
  };
  const GUION_CARA_P = [
    [T.pMira - 0.1, T.pMira + 0.15, "camara"], [T.pBaja0, T.pBaja0 + 0.3, "baja"], [T.pBaja1, T.pBaja1 + 0.4, "latigo"], [3.05, 3.4, "chulo"],
    [T.pMiraG, T.pMiraG + 0.25, "miraG"], [4.5, 4.7, "aguanta"], [6.2, 6.5, "neutra"], [9.4, 9.6, "ve"], [T.llega - 0.02, T.llega + 0.05, "plop", salida],
    [T.pMiraArriba, T.pMiraArriba + 0.2, "arriba"], [T.pGira0 + 0.05, T.pGira1, "espejo"], [T.pPulgar0, T.pPulgar0 + 0.25, "aprueba"], [T.pCam, T.pCam + 0.2, "camaraF"]
  ];
  const PARP_P = [0.25, 3.7, 5.2, 7.7, 9.0, ...T.pParpa, 12.25, 13.9];

  function poseP(t) { return memo("p" + t, () => poseP0(t)); }
  function poseP0(t) {
    const b = guion(GUION_CUERPO_P, CUERPOS_P, "chulo", t), ta = tau(t);
    const respira = Math.sin(ta * 2.2 + 0.4);
    const ri = campana(t, 4.45, 6.25), risa = ri * Math.sin(t * 26) * 0.5 + ri * 0.5;             // aguanta la risa: hombros
    const plop = Math.exp(-Math.max(0, t - T.llega) * 7) * (t > T.llega ? 1 : 0);
    const gr = giro(t, T.pGira0, T.pGira1, true, false);
    const lado = 0.09 * Math.sin(TAU * fase(t, T.pLado1, T.pPulgar0));                          // ladea la cabeza ante el cristal
    const p = {
      x: xP(t), suelo: SUELO, s: ESCALA, espejo: gr.espejo, sx: gr.sx, gira: gr.gira || 0, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: PD.PELVIS.x, y: PD.PELVIS.y + b.pel + respira * 1.3 + 3 * risa + 14 * plop * Math.sin((t - T.llega) * 18) },
      torso: b.torso + claves(t, TORSO_P) + 0.02 * risa, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + claves(t, CAB_P) + 0.06 * risa + lado + 0.012 * Math.sin(ta * 1.3), dx: 0, dy: b.cdy + 4 * risa, esc: { x: 1, y: 1 } }
    };
    // pies: quietos (al girarse, a mitad del giro aplastado, el pie de delante pasa a ser el de detrás)
    const izqP = pieDe(PASOS_P.izq, t, { alto: 11 });
    const derP = pieDe(PASOS_P.der, t, { alto: 13 });
    const wC = p.espejo ? derP : izqP, wL = p.espejo ? izqP : derP;
    p.piernas.cerca = aPierna(PD, p, wC, "cerca"); p.piernas.lejos = aPierna(PD, p, wL, "lejos");
    const e = guion(GUION_CARA_P, CARAS_P, "mira", t);
    p.cara = cara(e, parpadeo(t, PARP_P));
    if (t > T.pGuino) { const k = campana(t, T.pGuino, T.pGuino + 0.5); p.cara.ojos.d = Math.max(p.cara.ojos.d, k); }
    p.rojo = 0;
    manosP(p, t);
    p.capaCabeza = (g, tt) => capaP(g, tt, p, t);
    return p;
  }
  function manosP(p, t) {
    const rC = resolutor(PD, p, "cerca"), rL = resolutor(PD, p, "lejos");
    const bols = { c: { bols: true }, l: { bols: true } };
    // pulgar arriba hacia el cristal: antebrazo horizontal
    const pulgar = HM(420, 420, Math.PI - 0.05, PULGAR, -1);
    const pistaC = [[0, 0, bols.c], [T.pPulgar0, T.pPulgar0 + 0.24, pulgar, salida], [T.pCam + 0.25, T.pCam + 0.6, bols.c]];
    let C = pista(pistaC, t, rC);
    if (t > T.pPulgar0 + 0.2 && t < T.pCam + 0.3) { const k = Math.exp(-(t - T.pPulgar0 - 0.2) * 4); C = conMano(C, 0, -8 * Math.sin((t - T.pPulgar0) * 15) * k); }
    p.manoCerca = C; p.manoLejos = rL(bols.l);
  }

  /* =====================================================================================
   * GUILLERMO (a la izquierda; mira a Paradigma, luego a la caja y a cámara)
   * ===================================================================================== */
  const XG0 = 300, XG1 = 238;
  const xG = t => lerp(XG0, XG1, suave(fase(t, T.gira1b, T.anda1)));
  const CG0 = { pel: 0, torso: 0.02, cab: 0.03, cdy: 0 };
  const CGc = o => Object.assign({}, CG0, o);
  const CUERPOS_G = {
    quieto: CGc({ pel: 6, torso: 0.02, cab: 0.02 }),
    flipa: CGc({ pel: 10, torso: -0.05, cab: -0.08 }),
    decide: CGc({ pel: 8, torso: 0.04, cab: 0.04 }),
    baja1: CGc({ pel: 12, torso: 0.1, cab: 0.32 }),
    tira1: CGc({ pel: 2, torso: -0.1, cab: -0.36 }),
    espera: CGc({ pel: 4, torso: -0.06, cab: -0.2 }),
    mira: CGc({ pel: 6, torso: 0.0, cab: -0.04 }),
    baja2: CGc({ pel: 26, torso: 0.2, cab: 0.48 }),
    tira2: CGc({ pel: 0, torso: -0.2, cab: -0.55 }),
    espera2: CGc({ pel: 6, torso: -0.12, cab: -0.3 }),
    enfado: CGc({ pel: 10, torso: 0.06, cab: 0.08 }),
    idea: CGc({ pel: 4, torso: -0.04, cab: -0.06 }),
    anda: CGc({ pel: 8, torso: 0.06, cab: 0.02 }),
    mete: CGc({ pel: 20, torso: 0.26, cab: 0.18 }),
    saca: CGc({ pel: 10, torso: 0.04, cab: -0.04 }),
    lanza: CGc({ pel: 0, torso: -0.04, cab: -0.12 }),
    caza: CGc({ pel: 30, torso: 0.1, cab: 0.2 }),
    posa: CGc({ pel: 4, torso: -0.08, cab: -0.1 }),
    baja3: CGc({ pel: 16, torso: 0.16, cab: 0.4 }),
    latigo: CGc({ pel: 0, torso: -0.18, cab: -0.5 }),
    disfruta: CGc({ pel: 4, torso: -0.14, cab: -0.36 }),
    duda: CGc({ pel: 6, torso: -0.02, cab: -0.06 }),
    flipa2: CGc({ pel: 10, torso: -0.06, cab: -0.04 }),
    camara: CGc({ pel: 6, torso: 0.0, cab: 0.0 })
  };
  const GUION_CUERPO_G = [
    [T.gFlipa, T.gFlipa + 0.35, "flipa"], [T.gDecide, T.gDecide + 0.25, "decide"],
    [T.g1Baja, T.g1Tira, "baja1"], [T.g1Tira, T.g1Fin, "tira1", salida], [T.g1Fin, T.g1Fin + 0.2, "espera"], [T.g1Mira, T.g1Mira + 0.25, "mira"],
    [T.g2Baja, T.g2Tira, "baja2"], [T.g2Tira, T.g2Fin, "tira2", salida], [T.g2Fin, T.g2Fin + 0.2, "espera2"], [T.g2Mira, T.g2Mira + 0.25, "enfado"],
    [T.idea, T.idea + 0.2, "idea"], [T.gira1a, T.gira1b, "anda"], [T.mete0, T.mete1, "mete"], [T.mete1 + 0.05, T.saca1, "saca"],
    [T.sacude1, T.lanza, "lanza"], [T.lanza + 0.12, T.aterriza, "caza"], [T.aterriza + 0.02, T.posa0 + 0.15, "posa"],
    [T.g3Baja0, T.g3Baja1, "baja3"], [T.lento2, T.despega + 0.1, "latigo"], [T.despega + 0.1, T.despega + 0.6, "disfruta"],
    [T.gAbre, T.gAbre + 0.3, "duda"], [T.gira2a, T.gira2b, "flipa2"], [T.gCam - 0.1, T.gCam + 0.2, "camara"]
  ];
  const CARAS_G = {
    quieto: E({ mx: 0.95, my: 0.05, c: 0.15, sd: 4, si: 4, abre: 0, ancho: 0.6, sonr: 0.2 }),
    flipa: E({ mx: 0.95, my: 0.05, iris: 1.2, sd: 26, si: 26, abre: 26, ancho: 0.62, sonr: 0.35 }),
    decide: E({ mx: 0.6, my: 0.05, c: 0.2, sd: -6, gd: -0.16, si: -4, gi: -0.14, abre: 2, ancho: 0.9, sonr: 0.7 }),
    baja: E({ c: 1, z: 0.4, sd: 8, si: 8, abre: 0, ancho: 0.7, sonr: 0.4 }),
    tira: E({ c: 0.8, z: 0.3, sd: 16, si: 16, abre: 10, ancho: 0.8, sonr: 0.6 }),
    espera: E({ mx: 0.2, my: -0.6, c: 0.15, sd: 18, si: 18, abre: 0, ancho: 0.7, sonr: 0.4 }),
    arriba: E({ mx: 0.4, my: -1, c: 0.05, sd: 22, si: 22, abre: 6, ancho: 0.55, sonr: -0.1 }),
    baja2: E({ c: 1, z: 1, sd: 12, gd: -0.1, si: 12, gi: -0.1, abre: 0, ancho: 0.75, sonr: 0.2, rub: 0.5 }),
    tira2: E({ c: 1, z: 1, sd: 24, si: 24, abre: 30, ancho: 0.9, sonr: 0.1, rub: 0.8 }),
    arriba2: E({ mx: 0.4, my: -1, c: 0.05, sd: 26, si: 26, abre: 0, ancho: 0.5, sonr: -0.3, rub: 0.4 }),
    enfado: E({ mx: -0.3, my: 0.05, c: 0.3, sd: -10, gd: -0.2, si: -10, gi: -0.2, abre: 0, ancho: 0.7, sonr: -0.3, rub: 0.5 }),
    idea: E({ mx: 0.3, my: -0.3, c: 0.1, sd: -4, gd: -0.14, si: 22, gi: 0.12, abre: 4, ancho: 0.9, sonr: 0.85 }),
    anda: E({ mx: 0.9, my: 0.15, c: 0.15, sd: 6, si: 8, abre: 4, ancho: 0.85, sonr: 0.7 }),
    mete: E({ mx: 0.9, my: 0.6, c: 0.2, sd: 10, si: 12, abre: 6, ancho: 0.7, sonr: 0.5, lengua: 1 }),
    saca: E({ mx: 0.4, my: -0.4, iris: 1.15, sd: 26, si: 26, abre: 24, ancho: 0.9, sonr: 0.85 }),
    lanza: E({ mx: 0.2, my: -1, c: 0.05, sd: 20, si: 20, abre: 10, ancho: 0.85, sonr: 0.8 }),
    caza: E({ c: 1, z: 0.3, sd: 10, si: 10, abre: 6, ancho: 0.8, sonr: 0.6 }),
    posa: E({ mx: -0.35, my: 0.05, c: 0.35, sd: 8, si: 18, gi: 0.12, abre: 0, ancho: 0.85, sonr: 0.75 }),
    baja3: E({ c: 1, z: 0.3, sd: 10, si: 10, abre: 0, ancho: 0.75, sonr: 0.5 }),
    latigo: E({ c: 0.85, sd: 16, si: 16, abre: 10, ancho: 0.85, sonr: 0.7 }),
    disfruta: E({ c: 1, h: 0.8, sd: 16, si: 16, abre: 4, ancho: 0.9, sonr: 0.95 }),
    duda: E({ mx: 0.3, my: -0.8, c: 0.05, sd: 22, gd: 0.1, si: 26, gi: 0.14, abre: 4, ancho: 0.55, sonr: -0.2 }),
    flipa2: E({ mx: 0.95, my: -0.2, iris: 0.9, sd: 28, si: 28, abre: 30, ancho: 0.6, sonr: -0.1 }),
    camara: E({ mx: -0.35, my: 0.05, c: 0.42, sd: -2, si: 4, abre: 0, ancho: 0.6, sonr: -0.25 })
  };
  const GUION_CARA_G = [
    [T.gFlipa, T.gFlipa + 0.2, "flipa"], [T.gDecide, T.gDecide + 0.2, "decide"],
    [T.g1Baja, T.g1Baja + 0.12, "baja"], [T.g1Tira, T.g1Tira + 0.1, "tira"], [T.g1Fin, T.g1Fin + 0.12, "espera"], [T.g1Mira, T.g1Mira + 0.15, "arriba"],
    [T.g2Baja - 0.05, T.g2Baja + 0.1, "baja2"], [T.g2Tira, T.g2Tira + 0.08, "tira2"], [T.g2Fin + 0.05, T.g2Fin + 0.18, "arriba2"], [T.g2Enfado, T.g2Enfado + 0.15, "enfado"],
    [T.idea, T.idea + 0.15, "idea"], [T.gira1a, T.gira1b, "anda"], [T.mete0, T.mete0 + 0.15, "mete"], [T.mete1 + 0.1, T.mete1 + 0.3, "saca"],
    [T.sacude1, T.lanza, "lanza"], [T.aterriza - 0.05, T.aterriza + 0.05, "caza"], [T.posa0, T.posa0 + 0.2, "posa"],
    [T.g3Baja0, T.g3Baja0 + 0.15, "baja3"], [T.lento2, T.lento2 + 0.3, "latigo"], [T.despega + 0.1, T.despega + 0.4, "disfruta"],
    [T.gAbre, T.gAbre + 0.15, "duda"], [T.gira2a + 0.05, T.gira2b, "flipa2"], [T.gCam, T.gCam + 0.15, "camara"]
  ];
  const PARP_G = [0.4, 3.3, 6.95, 9.05, 12.6, 13.75];
  // el pincho que hace «boing»
  const BOINGS = [[T.g1Tira + 0.2, 0.75], [T.g2Tira + 0.18, 0.95], [T.despega + 0.06, 0.6], [T.gBoing, 0.7]];
  function anguloPincho(t) {
    let a = 0;
    for (const [t0, A] of BOINGS) { const d = t - t0; if (d > 0) a += A * Math.exp(-d * 3.6) * Math.sin(d * 19); }
    return a;
  }

  function poseG(t) { return memo("g" + t, () => poseG0(t)); }
  function poseG0(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "quieto", t), ta = tau(t);
    const respira = Math.sin(ta * 2.1);
    const gr1 = giro(t, T.gira1a, T.gira1b, false, true), gr2 = giro(t, T.gira2a, T.gira2b, true, false);
    const gr = t < T.gira2a ? gr1 : gr2;
    const caza = Math.exp(-Math.max(0, t - T.aterriza) * 8) * (t > T.aterriza ? 1 : 0);
    const temblor2 = t > T.g2Tira && t < T.g2Fin + 0.3 ? 0.03 * Math.sin((t - T.g2Tira) * 60) * (1 - fase(t, T.g2Tira, T.g2Fin + 0.3)) : 0;
    const sacude = t > T.saca1 && t < T.sacude1 ? Math.sin((t - T.saca1) * 34) * campana(t, T.saca1, T.sacude1) : 0;
    const p = {
      x: xG(t), suelo: SUELO, s: ESCALA, espejo: gr.espejo, sx: gr.sx, gira: gr.gira || 0, tirasLimpias: true, ikContinuo: false,
      hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 + 26 * caza * Math.sin((t - T.aterriza) * 16) },
      torso: b.torso + temblor2 + 0.02 * sacude, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + temblor2 * 2 + 0.015 * Math.sin(ta * 1.1) + 0.04 * sacude, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } }
    };
    // pies (en pantalla): dos pasos hacia la caja; el de delante/detrás se intercambia a mitad de cada giro
    const pasos = memo("pasosG", () => ({
      izq: [[-9, XG0 - 26, 9 + T.gira1b], [T.gira1b + 0.28, XG1 - 24]],
      der: [[-9, XG0 + 26, 9 + T.gira1b + 0.22], [T.anda1, XG1 + 24]]
    }));
    const wI = pieDe(pasos.izq, t, { alto: 22, apoyo: 0.04 }), wD = pieDe(pasos.der, t, { alto: 22, apoyo: 0.04 });
    const wC = p.espejo ? wD : wI, wL = p.espejo ? wI : wD;
    p.piernas.cerca = aPierna(G, p, wC, "cerca"); p.piernas.lejos = aPierna(G, p, wL, "lejos");
    const e = guion(GUION_CARA_G, CARAS_G, "quieto", t);
    if (t > T.saca1 && t < T.sacude1) e.abre += 6 * Math.abs(sacude);
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.sudor = 0.8 * tramo(t, T.g2Fin + 0.1, T.g2Fin + 0.4) * (1 - tramo(t, T.idea - 0.1, T.idea + 0.2));
    p.enfado = salida(fase(t, T.g2Enfado, T.g2Enfado + 0.15)) * (1 - tramo(t, T.idea - 0.15, T.idea));
    manosG(p, t, sacude);
    p.capaCabeza = (g, tt) => capaG(g, tt, p, t);
    return p;
  }
  // la caja (pantalla): boca de la caja de cartón
  const CAJA = { x0: 94, x1: 194, y0: 290, y1: 374 };
  function manosG(p, t, sacude) {
    const rC = resolutor(G, p, "cerca"), rL = resolutor(G, p, "lejos");
    const bols = { c: { bols: true }, l: { bols: true } };
    const puños2 = { c: HM(118, 618, -1.75, PUNO, -1), l: HM(392, 612, -1.5, PUNO, 1) };
    // dentro de la caja (mano lejana; con espejo, mu en la hoja)
    const dentro = { scr: () => P(156, CAJA.y0 + 26), mu: -2.0, dedos: TODOS(0.3), dobla: 1 };
    const borde = { scr: () => P(158, CAJA.y0 + 6), mu: -1.75, dedos: PINZA, dobla: 1 };
    const enAlto = { scr: () => P(192, 246), mu: 1.95, dedos: PINZA, dobla: 1 };
    const arriba = { scr: () => P(210, 186), mu: 1.75, dedos: TODOS(0.8), dobla: 1 };
    const cadera = HM(96, 690, -2.55, TODOS(0.2), -1);
    const pistaC = [[0, 0, bols.c], [T.g2Baja - 0.05, T.g2Baja + 0.1, puños2.c], [T.g2Mira + 0.2, T.g2Mira + 0.5, bols.c],
      [T.aterriza + 0.05, T.posa0 + 0.15, cadera, salida], [T.gAbre + 0.2, T.gAbre + 0.5, bols.c]];
    const pistaL = [[0, 0, bols.l], [T.g2Baja - 0.05, T.g2Baja + 0.1, puños2.l], [T.g2Mira + 0.2, T.g2Mira + 0.5, bols.l],
      [T.mete0 - 0.12, T.mete0 + 0.1, borde], [T.mete0 + 0.1, T.mete1, dentro], [T.mete1 + 0.05, T.saca1, enAlto, salida],
      [T.sacude1, T.lanza, arriba, entrada], [T.lanza + 0.08, T.aterriza, bols.l]];
    let C = pista(pistaC, t, rC), L = pista(pistaL, t, rL);
    if (sacude) L = conMano(L, 14 * sacude, 4 * Math.abs(sacude));
    // segundo intento: puños apretados que tiemblan
    if (t > T.g2Baja && t < T.g2Mira + 0.3) { const k = 3 * campana(t, T.g2Baja, T.g2Mira + 0.3); C = conMano(C, k * Math.sin(t * 57), 0); L = conMano(L, k * Math.sin(t * 61 + 1), 0); }
    // la peluca en la mano lejana
    if (t >= T.mete1 && t < T.lanza) L.objeto = g => dibujaPelucaEnMano(g, t);
    p.manoCerca = C; p.manoLejos = L;
  }

  function pose(t) { return { g: poseG(t), p: poseP(t) }; }

  /* =====================================================================================
   * PELO DE PARADIGMA: mechones recortados de su retrato que se doblan con Recortes.tira
   * ===================================================================================== */
  // zonas en coordenadas del retrato de Paradigma
  const NUCA = [[652, 232], [612, 230], [574, 260], [540, 298], [512, 338], [490, 384], [477, 434], [479, 482], [487, 532], [494, 580], [504, 624],
    [519, 660], [539, 690], [560, 708], [580, 702], [592, 670], [602, 642], [614, 616], [592, 600], [570, 588], [557, 560], [553, 520], [556, 488],
    [566, 468], [586, 438], [606, 398], [626, 350], [646, 300], [662, 250]];
  const NUCA_DENTRO = [[662, 250], [646, 300], [626, 350], [606, 398], [586, 438], [566, 468], [556, 488], [553, 520], [557, 560], [570, 588], [592, 600],
    [614, 616], [602, 642], [566, 642], [536, 600], [521, 550], [519, 500], [531, 450], [556, 400], [581, 340], [606, 284], [632, 240]];
  const FRENTE = [[978, 238], [1010, 233], [1046, 259], [1076, 309], [1089, 362], [1092, 415], [1078, 466], [1063, 516], [1046, 546], [1026, 569],
    [1004, 602], [987, 595], [989, 546], [994, 490], [996, 430], [994, 370], [986, 300]];
  const FRENTE_DENTRO = [[978, 238], [986, 300], [994, 370], [996, 430], [994, 490], [989, 546], [987, 595], [1004, 594], [1008, 546], [1012, 490],
    [1014, 430], [1012, 370], [1006, 300], [996, 242]];
  const PIEZAS_PELO = {
    nuca: { zona: NUCA, caja: [470, 226, 668, 712], raiz: [646, 230] },
    frente: { zona: FRENTE, caja: [974, 228, 1096, 606], raiz: [992, 232] }
  };
  const COL_PELO_P = "#3b2214";
  let ATLAS_PELO = null;
  const camino = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
  // recorta una zona del retrato a un lienzo pequeño (una vez) y la presenta como pieza de Recortes
  function recortaPieza(R, info, tauP) {
    const pz = R.A.datos.piezas.cabeza, img = R.A.imgs[pz.img || 0];
    const [x0, y0, x1, y1] = info.caja, w = x1 - x0, h = y1 - y0;
    const c = document.createElement("canvas"); c.width = Math.ceil(w * tauP); c.height = Math.ceil(h * tauP);
    const g = c.getContext("2d"); g.scale(tauP, tauP); g.translate(-x0, -y0);
    g.beginPath(); camino(g, info.zona); g.clip();
    g.imageSmoothingQuality = "high";
    g.drawImage(img, pz.marco[0], pz.marco[1], pz.marco[2], pz.marco[3], pz.origen[0], pz.origen[1], pz.tam_hoja[0], pz.tam_hoja[1]);
    return { c, pieza: { marco: [0, 0, c.width, c.height], origen: [x0, y0], tam_hoja: [w, h], raiz: info.raiz, fin: [info.raiz[0], y1], tau: tauP } };
  }
  function atlasPelo() {
    if (ATLAS_PELO) return ATLAS_PELO;
    const imgs = [], piezas = {};
    for (const [nom, info] of Object.entries(PIEZAS_PELO)) { const r = recortaPieza(PD, info, 0.5); r.pieza.img = imgs.length; imgs.push(r.c); piezas[nom] = r.pieza; }
    ATLAS_PELO = { datos: { piezas }, imgs, img: imgs[0], listo: true };
    return ATLAS_PELO;
  }
  function mechon(g, nom, a1, a2, sj, r) {
    const A = atlasPelo(), pz = A.datos.piezas[nom], L = pz.fin[1] - pz.raiz[1];
    const c = { raiz: P(pz.raiz[0], pz.raiz[1]), a1, a2, L, sj: L * sj, r: L * r, estira: 1, cuna: true, cunaAjustada: true, capFija: true };
    RC.tira(g, A, nom, c, 16);
  }
  // borra con el fondo una zona (coordenadas del retrato) y pinta debajo el pelo oscuro
  function borraZona(g, zona, dentro, col) {
    if (!MATRIZ || !fondo) return;
    g.save(); g.beginPath(); camino(g, zona); g.clip();
    g.save(); g.setTransform(MATRIZ); g.drawImage(fondo, 0, 0); g.restore();
    if (dentro) { g.beginPath(); M2.curva(g, dentro.map(([x, y]) => P(x, y)), true, 0.5); g.fillStyle = col; g.fill(); }
    g.restore();
  }
  function capaP(g, t, p, tPose) {
    if (peloActivo(tPose)) {
      const fa1 = claves(tPose, FRENTE_A1), fa2 = claves(tPose, FRENTE_A2), na1 = claves(tPose, NUCA_A1), na2 = claves(tPose, NUCA_A2);
      borraZona(g, NUCA, NUCA_DENTRO, COL_PELO_P);
      borraZona(g, FRENTE, FRENTE_DENTRO, COL_PELO_P);
      mechon(g, "nuca", na1, na2, 0.42, 0.3);
      mechon(g, "frente", fa1, fa2, 0.4, 0.3);
      destellosPelo(g, tPose);
    }
    if (estadoPeluca(tPose).modo === "cabezaP") pelucaEnCabeza(g, tPose, WIG_P, T.llega);
  }
  // destellos que recorren la melena en el latigazo (coordenadas del retrato)
  function destellosPelo(g, t) {
    const k = campana(t, 1.9, 3.3);
    if (k < 0.02) return;
    const pts = [[1060, 300], [1000, 220], [900, 180], [780, 176], [660, 220], [560, 300], [500, 420]];
    g.save();
    for (let i = 0; i < 5; i++) {
      const u = fase(t, 1.95 + i * 0.22, 2.55 + i * 0.22); if (u <= 0 || u >= 1) continue;
      const j = (i * 1.7 + u * 3) % (pts.length - 1), a = Math.floor(j), f = j - a;
      const q = P(lerp(pts[a][0], pts[a + 1][0], f), lerp(pts[a][1], pts[a + 1][1], f));
      estrellaBrillo(g, q.x, q.y - 10, 38 * Math.sin(Math.PI * u) * k, t * 2 + i);
    }
    g.restore();
  }

  /* =====================================================================================
   * EL PELO REBELDE DE GUILLERMO: al cabecear no se le mueve nada… salvo un pelo suelto que sale
   * disparado de la coronilla y hace «boing» (dibujado por la escena, en la capa de la cabeza)
   * ===================================================================================== */
  const RAIZ_PELO = P(800, 214);
  function pelito(g, t) {
    const t0 = BOINGS[0][0] - 0.02; if (t < t0) return;
    const d = t - t0, sale = salida(clamp(d / 0.12)) * (1 + 0.3 * Math.exp(-d * 8) * Math.sin(d * 26));
    const L = 168 * sale, a = anguloPincho(t), N = 12;
    const pts = [RAIZ_PELO]; let x = RAIZ_PELO.x, y = RAIZ_PELO.y;
    for (let k = 0; k < N; k++) {
      const u = (k + 0.5) / N;
      const al = -0.12 + a * Math.pow(u, 1.3) + (u > 0.62 ? 3.1 * (u - 0.62) / 0.38 : 0) * (0.7 + 0.3 * sale);
      x += Math.sin(al) * L / N; y -= Math.cos(al) * L / N; pts.push(P(x, y));
    }
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    for (const [col, w0, w1] of [["#24120a", 19, 7], ["#8d4a1f", 11, 3]]) {
      g.strokeStyle = col;
      for (let k = 0; k < N; k++) { g.lineWidth = lerp(w0, w1, k / N); g.beginPath(); g.moveTo(pts[k].x, pts[k].y); g.lineTo(pts[k + 1].x, pts[k + 1].y); g.stroke(); }
    }
    g.strokeStyle = "rgba(255,190,120,0.7)"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(pts[2].x - 2, pts[2].y); g.lineTo(pts[6].x - 2, pts[6].y); g.stroke();
    // rayitas del «boing» junto a la punta
    const k = clamp(Math.abs(a) * 1.6);
    if (k > 0.08) {
      const q = pts[Math.round(N * 0.6)], dir = Math.sign(a) || 1;
      g.strokeStyle = `rgba(30,16,8,${0.85 * k})`;
      for (const s of [-1, 1]) for (const [dr, w] of [[30, 9], [54, 7]]) {
        g.lineWidth = w; g.beginPath(); g.arc(RAIZ_PELO.x, RAIZ_PELO.y, Math.hypot(q.x - RAIZ_PELO.x, q.y - RAIZ_PELO.y) + dr,
          Math.atan2(q.y - RAIZ_PELO.y, q.x - RAIZ_PELO.x) + s * 0.28, Math.atan2(q.y - RAIZ_PELO.y, q.x - RAIZ_PELO.x) + s * 0.55, s < 0); g.stroke();
      }
    }
    g.restore();
  }
  function capaG(g, t, p, tPose) {
    const est = estadoPeluca(tPose);
    if (est.modo === "cabezaG") pelucaEnCabeza(g, tPose, WIG_G, T.aterriza);
    else pelito(g, tPose);
  }

  /* =====================================================================================
   * LA PELUCA (dibujada por la escena: casquete, flequillo y mechones con muelle)
   * Unidades: las del retrato de Guillermo. Origen: el ancla de la coronilla.
   * ===================================================================================== */
  const WIG_G = P(800, 200), WIG_P = P(836, 34);
  const COLP = { base: "#f4c862", sombra: "#d39a3c", oscuro: "#a86f22", luz: "#fff6c8", linea: "#73460f", dentro: "#5d3b10" };
  // mechones: raíz, ángulo de reposo (0 abajo, + hacia delante), largo, ancho, capa (0 detrás, 1 delante), fase, onda, curva
  const MECHONES = [
    [-292, 50, -0.46, 560, 122, 0, 0.0, 0.17, 0.16],
    [-302, 140, -0.32, 640, 126, 0, 1.1, 0.16, 0.1],
    [-284, 220, -0.2, 700, 120, 0, 2.3, 0.15, 0.05],
    [-256, 270, -0.1, 690, 112, 0, 3.4, 0.16, 0.0],
    [-222, 294, -0.02, 630, 100, 0, 4.6, 0.14, -0.04],
    [-186, 302, 0.04, 550, 84, 0, 5.5, 0.13, -0.06],
    [262, 232, 0.08, 460, 80, 1, 0.9, 0.13, 0.05],
    [282, 178, 0.16, 420, 70, 1, 2.1, 0.12, 0.1],
    [286, 112, 0.26, 340, 58, 1, 3.0, 0.11, 0.14]
  ];
  const CASQUETE = [[-212, 300], [-300, 182], [-296, 40], [-218, -66], [-70, -116], [80, -108], [206, -46], [274, 58], [292, 168], [262, 262]];
  // flequillo: mechoncitos (punta, anchura) de delante hacia atrás
  const FLEQUILLO = [[244, 262, 44, 0.1], [196, 300, 58, 0.2], [134, 318, 64, 0.28], [70, 306, 62, 0.34], [6, 296, 60, 0.36], [-62, 300, 58, 0.34], [-128, 306, 54, 0.3], [-184, 300, 46, 0.24]];
  // estado de la peluca: modo y afín (unidades de la peluca → pantalla)
  function afPelucaCabeza(R, p, ancla, t, t0) {
    return mul(afCab(R, p), localPeluca(t, t0, ancla));
  }
  // en la cabeza: rebote al aterrizar y, en el melenazo de Guillermo, empieza a despegarse
  function localPeluca(t, t0, ancla) {
    const d = t - t0, b = d > 0 ? Math.exp(-d * 9) * Math.sin(d * 28) : 0;
    let L = mul(Tm(ancla.x, ancla.y), Sm(1 + 0.1 * b, 1 - 0.13 * b));
    if (ancla === WIG_G) {
      const k = entrada(fase(t, T.despega - 0.24, T.despega));
      if (k > 0) L = mul(Tm(ancla.x - 40 * k, ancla.y - 70 * k), mul(Rm(-0.32 * k), Sm(1 + 0.1 * b, 1 - 0.13 * b)));
    }
    return L;
  }
  const AGARRE = 104;                                  // la mano la coge por la coronilla
  function afPelucaMano(t) {
    const pg = poseG(t), m = pg.manoLejos, q = aPantallaG(G, pg, P(m.x, m.y));
    const sc = 0.6 * ESCALA, abre = tramo(t, T.mete1, T.saca1 + 0.08);
    const sx = (pg.espejo ? -1 : 1) * sc * (pg.sx ?? 1) * lerp(0.30, 1, abre);
    const sy = sc * 0.92 * lerp(0.16, 1, abre);
    const sac = t > T.saca1 && t < T.sacude1 ? 0.28 * Math.sin((t - T.saca1) * 34 - 0.6) * campana(t, T.saca1, T.sacude1) : 0;
    return mul(Tm(q.x, q.y), mul(Rm(sac), mul(Sm(sx, sy), Tm(0, AGARRE))));
  }
  let VUELO = null;
  function vuelos() {
    if (VUELO) return VUELO;
    const s1 = descompone(afPelucaMano(T.lanza));
    const e1 = descompone(afPelucaCabeza(G, poseG(T.aterriza), WIG_G, T.aterriza, T.aterriza));
    const s2 = descompone(afPelucaCabeza(G, poseG(T.despega), WIG_G, T.despega, T.aterriza));
    const e2 = descompone(afPelucaCabeza(PD, poseP(T.llega), WIG_P, T.llega, T.llega));
    VUELO = { s1, e1, s2, e2 };
    return VUELO;
  }
  function estadoPeluca(t) {
    if (t < T.mete1) return { modo: "caja" };
    if (t < T.lanza) return { modo: "mano" };
    if (t < T.aterriza) return { modo: "vuelo1" };
    if (t < T.despega) return { modo: "cabezaG" };
    if (t < T.llega) return { modo: "vuelo2" };
    return { modo: "cabezaP" };
  }
  function afPeluca(t) {
    const est = estadoPeluca(t);
    switch (est.modo) {
      case "caja": return null;
      case "mano": return afPelucaMano(t);
      case "vuelo1": {
        const V = vuelos(), u = fase(t, T.lanza, T.aterriza);
        const x = lerp(V.s1.x, V.e1.x, u), y = lerp(V.s1.y, V.e1.y, u) - 94 * 4 * u * (1 - u);
        return compone({ x, y, th: lerp(V.s1.th, V.e1.th, u) + 0.35 * Math.sin(Math.PI * u), sx: lerp(V.s1.sx, V.e1.sx, u), sy: lerp(V.s1.sy, V.e1.sy, u) });
      }
      case "cabezaG": return afPelucaCabeza(G, poseG(t), WIG_G, t, T.aterriza);
      case "vuelo2": {
        const V = vuelos(), f = fase(t, T.despega, T.llega), u = 0.25 * f + 0.75 * suave(f);
        // El centro de la melena describe el arco; el casquete da una vuelta alrededor de él.
        const eje = 335;
        const centro = d => P(d.x - Math.sin(d.th) * d.sy * eje, d.y + Math.cos(d.th) * d.sy * eje);
        const ini = centro(V.s2), fin = centro(V.e2);
        const sx = lerp(V.s2.sx, V.e2.sx, u), sy = lerp(V.s2.sy, V.e2.sy, u);
        const diferencia = Math.atan2(Math.sin(V.e2.th - V.s2.th), Math.cos(V.e2.th - V.s2.th));
        const th = V.s2.th + (diferencia - TAU) * suave(u);
        const cx = lerp(ini.x, fin.x, u), cy = lerp(ini.y, fin.y, u) - 14 * 4 * u * (1 - u);
        return mul(compone({ x: cx, y: cy, th, sx, sy }), Tm(0, -eje));
      }
      default: return afPelucaCabeza(PD, poseP(t), WIG_P, t, T.llega);
    }
  }
  // muelle de los mechones: tabla precalculada (respuesta al giro y a la velocidad de la peluca)
  let MUELLE = null;
  function muelles() {
    if (MUELLE) return MUELLE;
    const n = NT, Da = new Float32Array(n), Db = new Float32Array(n), Ab = new Float32Array(n);
    let da = 0, va = 0, db = 0, vb = 0, prev = null;
    for (let i = 0; i < n; i++) {
      const t = i / HZ, A = afPeluca(t);
      if (!A) { prev = null; continue; }
      const d = descompone(A);
      const delta = prev ? d.th - prev.th : 0;
      const velocidadAngular = HZ * Math.atan2(Math.sin(delta), Math.cos(delta));
      const vx = prev ? (d.x - prev.x) * HZ : 0, vy = prev ? (d.y - prev.y) * HZ : 0;
      const sg = d.sx < 0 ? -1 : 1;
      const obj = sg * (Math.sin(d.th) - clamp(velocidadAngular * 0.045, -0.55, 0.55) + clamp(-vx * 0.0011, -0.5, 0.5));
      const dtt = 1 / HZ;
      for (let k = 0; k < 2; k++) {
        const h = dtt / 2;
        va += (81 * (obj - da) - 2 * 0.38 * 9 * va) * h; da += va * h;
        vb += (42 * (obj - db) - 2 * 0.32 * 6.5 * vb) * h; db += vb * h;
      }
      Da[i] = da; Db[i] = db; Ab[i] = clamp(vy * 0.0016, -0.3, 0.7);
      prev = d;
    }
    MUELLE = { Da, Db, Ab };
    return MUELLE;
  }
  const muelle = t => { const M = muelles(); return { a: tabla(M.Da, t), b: tabla(M.Db, t), abre: tabla(M.Ab, t) }; };

  /* La peluca se dibuja por grupos (detrás, casquete con flequillo, delante). En cada grupo primero
   * van todas las siluetas engordadas con el color de la línea, luego todos los rellenos encima (así
   * solo queda contorno por fuera, como una melena de dibujo animado) y al final las mechas y los
   * brillos de cada mechón. */
  function cinta(cen, w0, ph, brillo) {
    const N = cen.length - 1, izq = [], der = [];
    for (let k = 0; k <= N; k++) {
      const u = k / N, q = cen[k], q2 = cen[Math.min(N, k + 1)], q1 = cen[Math.max(0, k - 1)];
      const tx = q2.x - q1.x, ty = q2.y - q1.y, tl = Math.hypot(tx, ty) || 1, nx = -ty / tl, ny = tx / tl;
      const wv = w0 * 0.5 * Math.pow(1 - u, 0.65) * (1 + 0.1 * Math.sin(u * 8 + ph));
      izq.push(P(q.x + nx * wv, q.y + ny * wv)); der.push(P(q.x - nx * wv, q.y - ny * wv));
    }
    const pts = izq.concat(der.slice(0, N).reverse());
    return { cen, izq, der, N, ph, brillo, ruta: g => M2.curva(g, pts, true, 0.45) };
  }
  function detalleCinta(g, c) {
    const { cen, izq, der, N } = c;
    g.save(); g.beginPath(); c.ruta(g); g.clip();
    g.beginPath(); M2.curva(g, cen.concat(der.slice(0, N).reverse()), true, 0.45); g.fillStyle = COLP.sombra; g.globalAlpha = 0.6; g.fill();
    g.strokeStyle = COLP.oscuro; g.lineWidth = 3;
    for (const f of [-0.5, 0.05, 0.55]) {
      g.globalAlpha = 0.45; g.beginPath();
      for (let k = 0; k <= N; k++) { const q = f < 0 ? mezcla(cen[k], izq[k], -f) : mezcla(cen[k], der[k], f); if (k) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); }
      g.stroke();
    }
    if (c.brillo) {
      g.globalAlpha = 0.7; g.strokeStyle = COLP.luz; g.lineWidth = 12;
      g.beginPath(); for (let k = 1; k <= Math.round(N * 0.45); k++) { const q = mezcla(cen[k], izq[k], 0.42); if (k > 1) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); } g.stroke();
    }
    g.restore();
  }
  function dibGrupo(g, formas) {
    g.fillStyle = COLP.linea; g.strokeStyle = COLP.linea; g.lineWidth = 10; g.lineJoin = "round";
    g.beginPath(); for (const f of formas) f.ruta(g); g.fill(); g.stroke();
    g.fillStyle = COLP.base;
    g.beginPath(); for (const f of formas) f.ruta(g); g.fill();
    for (const f of formas) (f.detalle || detalleCinta)(g, f);
  }
  function lineaMechon(rx, ry, a0, L, N, angulo) {
    const cen = [P(rx, ry)]; let x = rx, y = ry; const dl = L / N;
    for (let k = 0; k < N; k++) { const al = angulo((k + 0.5) / N); x += Math.sin(al) * dl; y += Math.cos(al) * dl; cen.push(P(x, y)); }
    return cen;
  }
  // un mechón largo y su mechoncito suelto en la punta
  function cintasMechon(m, est, ta) {
    const [rx, ry, a0, L, w, capa, ph, onda, curva] = m;
    const D = (capa ? est.b : est.a), abre = est.abre * (capa ? 1 : -1) * 0.4, vi = est.viento || 0;
    const ang = u => a0 + curva * u + (0.25 + 0.75 * u) * D + abre * u + onda * Math.sin(u * 6.5 + ph + ta * 1.7) * (0.35 + u) + vi * u * u;
    const N = 12, cen = lineaMechon(rx, ry, a0, L, N, ang);
    const k0 = Math.round(N * 0.6), q0 = cen[k0], sg = (Math.round(ph * 10) % 2) ? 1 : -1;
    const sub = lineaMechon(q0.x, q0.y, 0, L * 0.45, 6, u => ang(0.6 + 0.4 * u) + sg * (0.18 + 0.18 * u));
    return [cinta(cen, w, ph, true), cinta(sub, w * 0.45, ph + 1, false)];
  }
  function dibPeluca(g, t, o = {}) {
    const ta = tau(t), mu = muelle(t);
    const est = { a: mu.a, b: mu.b, abre: mu.abre, viento: o.viento || 0 };
    const hueca = o.hueca || 0;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // detrás: la melena
    dibGrupo(g, MECHONES.filter(m => !m[5]).flatMap(m => cintasMechon(m, est, ta)));
    // hueco de dentro (cuando no lleva cabeza)
    if (hueca > 0.01) {
      g.save(); g.globalAlpha = hueca; g.fillStyle = COLP.dentro;
      g.beginPath(); g.ellipse(-10, 250, 230, 70, 0, 0, TAU); g.fill(); g.restore();
    }
    // casquete con su volumen y el flequillo
    const cas0 = CASQUETE.map(([x, y]) => P(x * (1 - 0.1 * hueca), y * (1 - 0.3 * hueca) + 40 * hueca));
    const cas = [];
    for (let i = 0; i < cas0.length; i++) {
      const a = cas0[i], b = cas0[(i + 1) % cas0.length]; cas.push(a);
      if (i < cas0.length - 1) { const m = mezcla(a, b, 0.5), dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1; cas.push(P(m.x + dy / l * 16, m.y - dx / l * 16)); }
    }
    const casquete = { ruta: g => M2.curva(g, cas, true, 0.45), detalle: g => {
      g.save(); g.beginPath(); M2.curva(g, cas, true, 0.45); g.clip();
      const gr = g.createLinearGradient(-300, 0, 300, 0); gr.addColorStop(0, "rgba(170,100,30,0.55)"); gr.addColorStop(0.5, "rgba(170,100,30,0)"); gr.addColorStop(1, "rgba(170,100,30,0.25)");
      g.fillStyle = gr; g.fillRect(-320, -140, 640, 460);
      g.lineWidth = 3.2; g.strokeStyle = COLP.oscuro;
      for (let i = 0; i < 11; i++) {
        const u = i / 10, ex = lerp(-300, 290, u), ey = 250 + 40 * Math.sin(u * Math.PI);
        g.globalAlpha = 0.4 + 0.2 * hash(i);
        g.beginPath(); g.moveTo(lerp(-40, 30, u), -104); g.bezierCurveTo(lerp(-200, 220, u), -70, ex * 0.95, ey * 0.35, ex, ey); g.stroke();
      }
      g.globalAlpha = 0.85; g.lineWidth = 24; g.strokeStyle = COLP.luz;
      g.beginPath(); g.moveTo(-230, 0); g.quadraticCurveTo(-70, -96, 150, -64); g.stroke();
      g.lineWidth = 7; g.globalAlpha = 0.55;
      g.beginPath(); g.moveTo(-190, 70); g.quadraticCurveTo(-30, -20, 210, 6); g.stroke();
      g.restore();
    } };
    const flequillo = FLEQUILLO.map(([x, y, a, ba], i) => {
      const ph = i * 1.7, yy = y * (1 - 0.15 * hueca) + 10 * hueca, sw = Math.sin(ta * 2 + ph);
      const y0 = 150 * (1 - 0.3 * hueca) + 40 * hueca;
      return cinta(lineaMechon(x + 10, y0, 0, yy - y0 + 26, 6, u => 0.08 + 0.3 * ba * u + 0.04 * sw * u), a * 1.7, ph, false);
    });
    dibGrupo(g, [casquete, ...flequillo]);
    // delante: los mechones del otro lado de la cara
    dibGrupo(g, MECHONES.filter(m => m[5]).flatMap(m => cintasMechon(m, est, ta)));
    g.restore();
  }
  // en la cabeza (capa de la cabeza, coordenadas del retrato)
  function pelucaEnCabeza(g, t, ancla, t0) {
    g.save(); aplica(g, localPeluca(t, t0, ancla)); dibPeluca(g, t, { viento: vientoPeluca(t) }); g.restore();
  }
  // en el latigazo la melena ondea hacia atrás (cámara lenta), y se calma en el vuelo
  const vientoPeluca = t => -1.5 * tramo(t, T.g3Baja1 - 0.05, T.g3Baja1 + 0.25) * (1 - tramo(t, T.despega + 0.1, T.despega + 0.7));
  // en la mano: se dibuja en pantalla (MATRIZ) con su afín
  function dibujaPelucaEnMano(g, t) {
    if (!MATRIZ) return;
    g.save(); g.setTransform(MATRIZ); aplica(g, afPelucaMano(t)); dibPeluca(g, t, { hueca: 1 }); g.restore();
  }
  function dibujaPelucaVolando(g, t) {
    const est = estadoPeluca(t);
    if (est.modo !== "vuelo1" && est.modo !== "vuelo2") return;
    const A = afPeluca(t);
    const hueca = est.modo === "vuelo1" ? 1 - fase(t, T.lanza + 0.15, T.aterriza) : fase(t, T.despega, T.despega + 0.25) * (1 - fase(t, T.llega - 0.25, T.llega));
    g.save(); aplica(g, A); dibPeluca(g, t, { hueca, viento: vientoPeluca(t) }); g.restore();
  }

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  const PUERTA = { x0: 728, x1: 902, y0: 94, y1: 480 };     // cristal de la puerta (refleja)
  const XM = 734;                                            // plano del reflejo
  let fondo = null, MATRIZ = null, REF = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    g.lineJoin = "round"; g.lineCap = "round";
    // cielo del atardecer (franja de arriba)
    const cs = g.createLinearGradient(0, 0, 0, 60); cs.addColorStop(0, "#ffb36b"); cs.addColorStop(1, "#ffd99a");
    g.fillStyle = cs; g.fillRect(0, 0, W, 60);
    const sol = g.createRadialGradient(40, 18, 4, 40, 18, 260); sol.addColorStop(0, "rgba(255,250,220,1)"); sol.addColorStop(0.2, "rgba(255,226,150,0.8)"); sol.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = sol; g.fillRect(0, 0, 400, 60);
    // pared de ladrillo
    g.fillStyle = "#a9472f"; g.fillRect(0, 40, W, 450);
    for (let fila = 0, y = 40; y < 490; fila++, y += 15) {
      const off = (fila % 2) * 21;
      for (let x = -off; x < W; x += 42) {
        const k = hash(fila * 17.3 + x * 0.37);
        g.fillStyle = `rgb(${172 + 34 * k | 0},${74 + 22 * k | 0},${52 + 14 * k | 0})`;
        g.fillRect(x + 1.5, y + 1.5, 39, 12);
      }
    }
    // escaparate y fachada de madera de la tienda
    const F0 = 214, F1 = 944;
    g.fillStyle = "#1f4b4d"; g.fillRect(F0, 40, F1 - F0, 450);
    // cornisa y letrero (un vinilo y notas, sin letras)
    g.fillStyle = "#f1e1bf"; g.fillRect(F0 - 10, 38, F1 - F0 + 20, 14); g.fillStyle = "#d6c09a"; g.fillRect(F0 - 10, 52, F1 - F0 + 20, 5);
    g.fillStyle = "#14363a"; g.fillRect(F0 + 14, 62, F1 - F0 - 28, 24);
    g.strokeStyle = "#c9a14a"; g.lineWidth = 3; g.strokeRect(F0 + 14, 62, F1 - F0 - 28, 24);
    for (let i = 0; i < 9; i++) { const x = F0 + 50 + i * 78; g.fillStyle = i % 2 ? "#e94e3c" : "#f3c64a"; g.beginPath(); g.arc(x, 74, 6, 0, TAU); g.fill(); }
    // escaparate iluminado
    const E0 = 246, E1 = 600, EY0 = 146, EY1 = 430;
    const ei = g.createLinearGradient(0, EY0, 0, EY1); ei.addColorStop(0, "#ffe2a8"); ei.addColorStop(1, "#e79a5a");
    g.fillStyle = ei; g.fillRect(E0, EY0, E1 - E0, EY1 - EY0);
    // baldas con discos de cara (portadas con dibujos sencillos)
    const COLS = ["#2d6a8f", "#e2513e", "#3a3a48", "#f2c14e", "#7a4fa0", "#39a07a", "#e88fb0", "#1f2b3a"];
    for (let fila = 0; fila < 2; fila++) {
      const y = 196 + fila * 108;
      g.fillStyle = "#8a5a32"; g.fillRect(E0 + 4, y + 62, E1 - E0 - 8, 7);
      for (let i = 0; i < 7; i++) {
        const x = E0 + 18 + i * 48 + (fila ? 16 : 0); if (x + 40 > E1 - 8 || (fila === 0 && i === 3)) continue;
        const col = COLS[(i * 3 + fila * 5) % COLS.length];
        g.save(); g.translate(x + 20, y + 40); g.rotate((hash(i + fila * 9) - 0.5) * 0.08);
        g.fillStyle = col; g.fillRect(-20, -22, 40, 42); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(-20, -22, 40, 42);
        g.fillStyle = "rgba(255,255,255,0.8)"; const k = (i + fila) % 4;
        if (k === 0) { g.beginPath(); g.arc(0, -1, 11, 0, TAU); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(0, -1, 3, 0, TAU); g.fill(); }
        else if (k === 1) { for (let j = 0; j < 4; j++) g.fillRect(-16, -16 + j * 9, 32, 4); }
        else if (k === 2) { g.beginPath(); g.moveTo(-14, 14); g.lineTo(0, -14); g.lineTo(14, 14); g.closePath(); g.fill(); }
        else { g.beginPath(); g.moveTo(-14, 6); for (let j = 0; j < 7; j++) g.lineTo(-14 + j * 4.7, 6 + (j % 2 ? -12 : 0)); g.lineWidth = 3; g.strokeStyle = "rgba(255,255,255,0.85)"; g.stroke(); }
        g.restore();
      }
    }
    // guitarra eléctrica colgada en el centro del escaparate
    g.save(); g.translate(E0 + 182, 210); g.rotate(-0.18);
    g.strokeStyle = TINTA; g.lineWidth = 2.5;
    g.fillStyle = "#c8322a"; g.beginPath(); g.ellipse(0, 40, 26, 30, 0, 0, TAU); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(0, 6, 18, 20, 0, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = "#f6efe0"; g.fillRect(-8, 22, 16, 30);
    g.fillStyle = "#6e4426"; g.fillRect(-4, -70, 8, 76); g.strokeRect(-4, -70, 8, 76);
    g.fillStyle = "#2b2b33"; g.fillRect(-7, -86, 14, 18);
    g.restore();
    // guirnalda de bombillitas arriba del escaparate
    g.strokeStyle = "rgba(60,30,10,0.7)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(E0, 158); for (let x = E0; x <= E1; x += 10) g.lineTo(x, 158 + 8 * Math.sin((x - E0) / (E1 - E0) * Math.PI * 3) ** 2); g.stroke();
    for (let x = E0 + 14; x < E1; x += 28) { const y = 160 + 8 * Math.sin((x - E0) / (E1 - E0) * Math.PI * 3) ** 2; const hl = g.createRadialGradient(x, y + 3, 1, x, y + 3, 12); hl.addColorStop(0, "rgba(255,250,210,0.95)"); hl.addColorStop(1, "rgba(255,240,180,0)"); g.fillStyle = hl; g.beginPath(); g.arc(x, y + 3, 12, 0, TAU); g.fill(); }
    // marco del escaparate
    g.strokeStyle = "#163b3d"; g.lineWidth = 12; g.strokeRect(E0, EY0, E1 - E0, EY1 - EY0);
    g.lineWidth = 7; g.beginPath(); g.moveTo((E0 + E1) / 2 + 60, EY0); g.lineTo((E0 + E1) / 2 + 60, EY1); g.stroke();
    g.strokeStyle = "#c9a14a"; g.lineWidth = 2; g.strokeRect(E0 - 7, EY0 - 7, E1 - E0 + 14, EY1 - EY0 + 14);
    // brillos del cristal
    g.fillStyle = "rgba(255,255,255,0.22)";
    for (const [x, w] of [[E0 + 30, 30], [E0 + 74, 12], [E0 + 250, 26], [E0 + 290, 9]]) { g.beginPath(); g.moveTo(x, EY0 + 8); g.lineTo(x + w, EY0 + 8); g.lineTo(x + w - 70, EY1 - 8); g.lineTo(x - 70, EY1 - 8); g.closePath(); g.fill(); }
    // zócalo de madera bajo el escaparate
    g.fillStyle = "#183f41"; g.fillRect(F0, 440, F1 - F0, 46); g.strokeStyle = "#0f2c2e"; g.lineWidth = 3;
    for (let x = F0 + 20; x < F1 - 20; x += 120) g.strokeRect(x, 448, 100, 30);
    // pilar con un cuadrito de un disco
    g.fillStyle = "#1a4446"; g.fillRect(612, 100, 104, 336);
    g.fillStyle = "#f3e7cc"; g.fillRect(630, 190, 68, 68); g.strokeStyle = "#c9a14a"; g.lineWidth = 3; g.strokeRect(630, 190, 68, 68);
    g.fillStyle = "#16161c"; g.beginPath(); g.arc(664, 224, 26, 0, TAU); g.fill(); g.fillStyle = "#e2513e"; g.beginPath(); g.arc(664, 224, 9, 0, TAU); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.25)"; g.lineWidth = 1.2; for (const r of [14, 18, 22]) { g.beginPath(); g.arc(664, 224, r, -1.2, -0.2); g.stroke(); }
    // la puerta de cristal oscuro
    const { x0, x1, y0, y1 } = PUERTA;
    g.fillStyle = "#c9a14a"; g.fillRect(x0 - 10, y0 - 10, x1 - x0 + 20, y1 - y0 + 10);
    g.fillStyle = "#7d6025"; g.fillRect(x0 - 4, y0 - 4, x1 - x0 + 8, y1 - y0 + 4);
    const gc = g.createLinearGradient(x0, y0, x1, y1); gc.addColorStop(0, "#22343e"); gc.addColorStop(0.5, "#16232b"); gc.addColorStop(1, "#253944");
    g.fillStyle = gc; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    // la tienda por dentro, muy tenue
    g.fillStyle = "rgba(255,200,120,0.08)"; g.fillRect(x0 + 20, y0 + 70, 120, 220);
    g.fillStyle = "rgba(255,210,140,0.12)"; g.beginPath(); g.arc(x0 + 90, y0 + 40, 26, 0, TAU); g.fill();
    // tirador de latón
    g.fillStyle = "#e3bd62"; g.fillRect(x1 - 26, 250, 8, 96); g.strokeStyle = "#6d521c"; g.lineWidth = 2; g.strokeRect(x1 - 26, 250, 8, 96);
    // pared a la derecha: aplique
    g.fillStyle = "#2a2a30"; g.fillRect(968, 170, 22, 6); g.fillStyle = "#f6d68a"; g.beginPath(); g.arc(979, 186, 10, 0, TAU); g.fill();
    // cartel de la izquierda (una guitarra en un círculo, sin letras)
    g.fillStyle = "#f0e3c4"; g.fillRect(40, 120, 128, 150); g.strokeStyle = "#5a3020"; g.lineWidth = 4; g.strokeRect(40, 120, 128, 150);
    g.fillStyle = "#2b6c83"; g.beginPath(); g.arc(104, 186, 46, 0, TAU); g.fill();
    g.save(); g.translate(104, 192); g.rotate(0.6); g.fillStyle = "#f6c64e"; g.beginPath(); g.ellipse(0, 14, 15, 18, 0, 0, TAU); g.fill(); g.fillRect(-3, -40, 6, 50); g.restore();
    g.fillStyle = "#e2513e"; for (let i = 0; i < 4; i++) g.fillRect(56 + i * 26, 248, 18, 8);
    // acera
    const ac = g.createLinearGradient(0, 488, 0, H); ac.addColorStop(0, "#d7b28a"); ac.addColorStop(1, "#b88c64");
    g.fillStyle = ac; g.fillRect(0, 486, W, H - 486);
    g.fillStyle = "rgba(90,50,26,0.5)"; g.fillRect(0, 484, W, 5);
    g.strokeStyle = "rgba(110,70,40,0.45)"; g.lineWidth = 2;
    for (const y of [510, 540, 576]) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    for (let fila = 0; fila < 3; fila++) { const ya = [489, 510, 540, 576][fila], yb = [510, 540, 576, 600][fila]; for (let x = (fila % 2) * 60; x < W; x += 120) { g.beginPath(); g.moveTo(x, ya); g.lineTo(x - 8 * (fila + 1), yb); g.stroke(); } }
    g.fillStyle = "#9a6d48"; g.fillRect(0, 588, W, 12);
    // luz dorada en diagonal desde la izquierda
    const lz = g.createLinearGradient(0, 0, W, H); lz.addColorStop(0, "rgba(255,210,120,0.28)"); lz.addColorStop(0.5, "rgba(255,190,110,0.08)"); lz.addColorStop(1, "rgba(80,40,60,0.12)");
    g.fillStyle = lz; g.fillRect(0, 0, W, H);
    // pila de cajas de discos (detrás de la caja de cartón)
    for (const [y, h] of [[463, 89], [374, 89]]) {
      g.fillStyle = "#b07a44"; g.fillRect(74, y, 132, h); g.strokeStyle = "#5b3519"; g.lineWidth = 3; g.strokeRect(74, y, 132, h);
      g.fillStyle = "#8f5f30"; for (let i = 0; i < 3; i++) g.fillRect(78, y + 9 + i * 27, 124, 8);
      g.fillStyle = "#4e2c12"; g.fillRect(118, y + 34, 44, 12);
    }
    return c;
  }
  // caja de cartón: la parte de dentro y las solapas de atrás (detrás de Guillermo)
  function cajaAtras(g, t) {
    const { x0, x1, y0, y1 } = CAJA;
    g.save(); g.lineJoin = "round";
    g.fillStyle = "#b98a52"; g.strokeStyle = "#5e3c18"; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(x0 + 6, y0); g.lineTo(x0 + 20, y0 - 30); g.lineTo(x1 - 22, y0 - 34); g.lineTo(x1 - 6, y0); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#4a2f12"; g.beginPath(); g.ellipse((x0 + x1) / 2, y0 + 2, (x1 - x0) / 2 - 4, 10, 0, 0, TAU); g.fill();
    g.restore();
  }
  // la cara de delante de la caja (tapa la mano que rebusca) y unos pelos rubios que asoman
  function cajaDelante(g, t) {
    const { x0, x1, y0, y1 } = CAJA;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.fillStyle = "#c9995e"; g.strokeStyle = "#5e3c18"; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(x0, y0 + 2); g.lineTo(x1, y0 + 2); g.lineTo(x1, y1); g.lineTo(x0, y1); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(90,50,20,0.25)"; g.fillRect(x0, y1 - 18, x1 - x0, 18);
    g.fillStyle = "#e8d5a8"; g.fillRect(x0 + 40, y0 + 2, 20, y1 - y0 - 2);
    // solapa de delante caída hacia fuera
    g.fillStyle = "#d3a76c"; g.beginPath(); g.moveTo(x0, y0 + 2); g.lineTo(x1, y0 + 2); g.lineTo(x1 - 6, y0 + 22); g.lineTo(x0 + 8, y0 + 24); g.closePath(); g.fill(); g.stroke();
    g.restore();
    // dos mechones rubios que cuelgan por fuera de la caja (hasta que la saca)
    const asoma = 1 - tramo(t, T.mete1 - 0.05, T.mete1 + 0.12);
    if (asoma > 0.01) {
      const ta = tau(t);
      g.save(); g.globalAlpha = asoma; g.lineJoin = "round"; g.lineCap = "round";
      g.translate(x0 + 50, y0 + 2); g.scale(0.11, 0.11);
      dibGrupo(g, [[-90, -0.1, 520, 120, 0.4], [40, 0.12, 600, 130, 2.2], [150, 0.02, 420, 100, 4.1]].map(([dx, a0, L, w, ph]) =>
        cinta(lineaMechon(dx, -40, 0, L, 10, u => a0 + 0.18 * Math.sin(u * 6 + ph + ta * 1.5) * (0.3 + u)), w, ph, true)));
      g.restore();
    }
  }

  /* ---------- reflejo de Paradigma en el cristal ---------- */
  // Mientras se refleja, Paradigma se dibuja una sola vez en su propio lienzo (en píxeles de pantalla):
  // ese lienzo se pinta en su sitio y, reflejado y tenue, en el cristal de la puerta.
  let CAPA_P = null, CAJA_P = null;
  const kReflejo = t => tramo(t, T.pGira0 + 0.05, T.pPaso1);
  function capaParadigma(t, pp) {
    const M = MATRIZ, x0 = pp.x - 190, x1 = pp.x + 190, y0 = SUELO - 660, y1 = SUELO + 14;
    const bx = Math.floor(M.a * x0 + M.e), by = Math.floor(M.d * y0 + M.f);
    const cw = Math.ceil(M.a * (x1 - x0)) + 2, ch = Math.ceil(M.d * (y1 - y0)) + 2;
    if (!CAPA_P || CAPA_P.width !== cw || CAPA_P.height !== ch) { CAPA_P = document.createElement("canvas"); CAPA_P.width = cw; CAPA_P.height = ch; }
    const c = CAPA_P.getContext("2d");
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cw, ch);
    c.setTransform(M.a, M.b, M.c, M.d, M.e - bx, M.f - by);
    dibuja(PD, c, pp, t);
    CAJA_P = { bx, by };
  }
  function reflejo(g, t) {
    const k = kReflejo(t);
    if (k < 0.01 || !CAPA_P) return;
    const ESC_R = 0.5, M = MATRIZ, { x0, x1, y0, y1 } = PUERTA;
    const sx0 = M.a * x0 + M.e, sy0 = M.d * y0 + M.f, cw = Math.ceil((x1 - x0) * M.a * ESC_R), ch = Math.ceil((y1 - y0) * M.d * ESC_R);
    if (!REF || REF.width !== cw || REF.height !== ch) { REF = document.createElement("canvas"); REF.width = cw; REF.height = ch; }
    const r = REF.getContext("2d"), Xm = M.a * XM + M.e;
    r.setTransform(1, 0, 0, 1, 0, 0); r.clearRect(0, 0, cw, ch);
    // espejo vertical en el plano del cristal (pantalla), a media resolución
    r.setTransform(-ESC_R, 0, 0, ESC_R, (2 * Xm - sx0) * ESC_R, -sy0 * ESC_R);
    r.drawImage(CAPA_P, CAJA_P.bx, CAJA_P.by);
    r.setTransform(1, 0, 0, 1, 0, 0); r.globalCompositeOperation = "source-atop"; r.fillStyle = "rgba(40,70,100,0.35)"; r.fillRect(0, 0, cw, ch); r.globalCompositeOperation = "source-over";
    g.save(); g.globalAlpha = 0.58 * k; g.drawImage(REF, x0, y0, x1 - x0, y1 - y0); g.restore();
  }
  function brilloPuerta(g, t) {
    const { x0, x1, y0, y1 } = PUERTA;
    g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
    g.fillStyle = "rgba(255,240,220,0.13)";
    for (const [x, w] of [[x0 + 18, 26], [x0 + 60, 9], [x0 + 128, 18]]) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x + w, y0); g.lineTo(x + w - 90, y1); g.lineTo(x - 90, y1); g.closePath(); g.fill(); }
    g.restore();
  }

  /* ---------- hojas secas que cruzan con el viento ---------- */
  const HOJAS = [0, 1, 2, 3, 4, 5, 6].map(i => ({ off: hash(i * 3.1) * 1200, y: 240 + 300 * hash(i * 5.7), v: 60 + 50 * hash(i * 2.3), col: ["#e0912e", "#c4612a", "#efc24a", "#9c5a26"][i % 4], s: 0.8 + 0.5 * hash(i * 8.1) }));
  function hojas(g, t) {
    const ta = tau(t);
    g.save(); g.lineJoin = "round";
    for (const [i, h] of HOJAS.entries()) {
      const x = -60 + ((ta * h.v + h.off) % (W + 160)), y = h.y + 26 * Math.sin(ta * 1.6 + i) + 0.06 * ((ta * h.v + h.off) % (W + 160));
      g.save(); g.translate(x, Math.min(y, SUELO + 30)); g.rotate(ta * 2.2 + i); g.scale(h.s, h.s * (0.6 + 0.4 * Math.abs(Math.sin(ta * 3 + i))));
      g.fillStyle = h.col; g.strokeStyle = "#4a240c"; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(-9, 0); g.quadraticCurveTo(0, -7, 9, 0); g.quadraticCurveTo(0, 7, -9, 0); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(-9, 0); g.lineTo(9, 0); g.stroke();
      g.restore();
    }
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrella(g, x, y, r, n, giro, hueco = 0.45) {
    g.beginPath();
    for (let i = 0; i < n * 2; i++) { const a = giro + i * Math.PI / n, rr = i % 2 ? r * hueco : r; const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; if (i) g.lineTo(px, py); else g.moveTo(px, py); }
    g.closePath();
  }
  // destello de cuatro puntas (brillo)
  function estrellaBrillo(g, x, y, r, giro) {
    if (r < 0.5) return;
    g.save(); g.translate(x, y); g.rotate(giro * 0.2);
    const hl = g.createRadialGradient(0, 0, 0, 0, 0, r); hl.addColorStop(0, "rgba(255,255,240,0.9)"); hl.addColorStop(1, "rgba(255,240,200,0)");
    g.fillStyle = hl; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
    g.fillStyle = "#fffbe8"; g.beginPath();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.16 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    g.closePath(); g.fill();
    g.restore();
  }
  // viento de la cámara lenta (rayas que pasan junto a la cabeza)
  function viento(g, t, c, dir, k) {
    if (k < 0.02) return;
    const ta = tau(t);
    g.save(); g.lineCap = "round";
    for (let i = 0; i < 7; i++) {
      const ph = (ta * 0.9 + hash(i * 4.1)) % 1, y = c.y - 90 + 180 * hash(i * 7.3) + 10 * Math.sin(ta * 3 + i);
      const x = c.x - dir * 220 + dir * 440 * ph, L = 70 + 60 * hash(i * 2.2);
      g.strokeStyle = `rgba(255,248,230,${0.5 * k * Math.sin(Math.PI * ph)})`; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - dir * L * 0.5, y - 8, x - dir * L, y + 2); g.stroke();
    }
    g.restore();
  }
  function bombillaIdea(g, t, pg) {
    const k = tramo(t, T.idea, T.idea + 0.12, salida) * (1 - tramo(t, T.gira1a, T.gira1a + 0.2));
    if (k < 0.01) return;
    const c = enCab(G, pg, P(760, 120));
    const s = k * (1 + 0.12 * campana(t, T.idea, T.idea + 0.25));
    g.save(); g.translate(c.x, c.y - 22); g.scale(s, s);
    const halo = g.createRadialGradient(0, 0, 2, 0, 0, 30); halo.addColorStop(0, "rgba(255,240,160,0.8)"); halo.addColorStop(1, "rgba(255,240,160,0)");
    g.fillStyle = halo; g.beginPath(); g.arc(0, 0, 30, 0, TAU); g.fill();
    g.fillStyle = "#fff3a0"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.arc(0, -2, 10, Math.PI * 0.8, Math.PI * 2.2); g.lineTo(4, 10); g.lineTo(-4, 10); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#9a9aa6"; g.fillRect(-4.5, 10, 9, 6); g.strokeRect(-4.5, 10, 9, 6);
    g.strokeStyle = "rgba(255,240,170,0.95)"; g.lineWidth = 2; g.lineCap = "round";
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.55; g.beginPath(); g.moveTo(Math.cos(a) * 15, -2 + Math.sin(a) * 15); g.lineTo(Math.cos(a) * 21, -2 + Math.sin(a) * 21); g.stroke(); }
    g.restore();
  }
  // ojos brillantes de Guillermo al ver el melenazo
  function chispasOjos(g, t, pg) {
    const k = tramo(t, T.gFlipa, T.gFlipa + 0.2) * (1 - tramo(t, 3.3, 3.6));
    if (k < 0.02) return;
    for (const [q, i] of [[P(845, 560), 0], [P(965, 600), 1]]) {
      const c = enCab(G, pg, q);
      estrellaBrillo(g, c.x + 3, c.y - 6, (7 + 2 * Math.sin(t * 9 + i * 2)) * k, t + i);
    }
  }
  // ¡plof! de la peluca sobre Paradigma
  function plof(g, t, pp) {
    const u = t - T.llega; if (u < 0 || u > 0.8) return;
    const c = enCab(PD, pp, P(820, 120));
    const k = campana(t, T.llega, T.llega + 0.3);
    if (k > 0.01) { g.save(); g.globalAlpha = k; estrella(g, c.x, c.y - 6, 30 * k + 10, 8, 0.3, 0.5); g.fillStyle = "#fff4c0"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke(); g.restore(); }
    g.save(); g.lineCap = "round";
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (hash(i + 2) - 0.5) * 2.6, v = 60 + 60 * hash(i + 5), uu = u / 0.8;
      const x = c.x + Math.cos(a) * v * uu, y = c.y + Math.sin(a) * v * uu + 120 * uu * uu;
      g.strokeStyle = i % 3 ? COLP.base : "#7a4a2a"; g.globalAlpha = 1 - uu; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 5, y - 6, x + 3, y - 12); g.stroke();
    }
    g.restore();
  }
  // brillo de lente al pasar el sol por la melena
  function destelloLente(g, t, c, k) {
    if (k < 0.02) return;
    g.save(); g.globalCompositeOperation = "lighter";
    estrellaBrillo(g, c.x, c.y, 46 * k, t * 3);
    const sol = P(40, 18), dx = c.x - sol.x, dy = c.y - sol.y;
    for (const [f, r, a] of [[0.55, 14, 0.18], [1.35, 24, 0.12], [1.7, 9, 0.2]]) {
      g.fillStyle = `rgba(255,220,150,${a * k})`; g.beginPath(); g.arc(sol.x + dx * f, sol.y + dy * f, r, 0, TAU); g.fill();
    }
    g.restore();
  }
  function guino(g, t, R, p, t0, punto) {
    const k = campana(t, t0 + 0.02, t0 + 0.5); if (k <= 0) return;
    const q = enCab(R, p, punto);
    g.save(); g.globalAlpha = k; estrella(g, q.x + 14, q.y - 6, 9 * k + 3, 4, t * 2, 0.3); g.fillStyle = "#fff6c8"; g.fill(); g.restore();
  }
  // brillo de aprobación en el cristal (el pulgar y su reflejo)
  function tintineo(g, t) {
    const k = campana(t, T.pPulgar0 + 0.15, T.pPulgar0 + 0.6);
    if (k < 0.02) return;
    estrellaBrillo(g, XM + 2, 300, 22 * k, t * 4);
  }

  // dibuja a un personaje con su giro aplastado (sx) alrededor de sus pies
  function dibuja(R, g, p, t) {
    const sx = p.sx ?? 1;
    if (Math.abs(sx - 1) < 1e-4) { R.dibujar(g, p, t); return; }
    g.save(); g.translate(p.x, p.suelo); g.scale(sx, 1); g.translate(-p.x, -p.suelo); R.dibujar(g, p, t); g.restore();
  }
  // rayas del giro aplastado: arcos alrededor del cuerpo
  function rayasGiro(g, p) {
    const k = p.gira || 0; if (k < 0.05) return;
    g.save(); g.lineCap = "round"; g.strokeStyle = `rgba(255,250,235,${0.8 * k})`;
    for (const [dy, r, w] of [[-330, 60, 3.5], [-250, 74, 3], [-160, 70, 3], [-70, 58, 2.5]]) {
      g.lineWidth = w; g.beginPath(); g.ellipse(p.x, p.suelo + dy, r, 10, 0, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
      g.beginPath(); g.ellipse(p.x, p.suelo + dy, r, 10, 0, 1.15 * Math.PI, 1.6 * Math.PI); g.stroke();
    }
    g.restore();
  }
  // sombra alargada hacia la derecha (el sol bajo, a la izquierda)
  function sombra(g, p, ancho) {
    g.save(); g.translate(p.x, p.suelo + 2); g.transform(1, 0, 1.6, 1, 0, 0);
    const gr = g.createRadialGradient(0, 0, 4, 0, 0, ancho); gr.addColorStop(0, "rgba(70,30,10,0.38)"); gr.addColorStop(1, "rgba(70,30,10,0)");
    g.scale(1, 0.22); g.fillStyle = gr; g.beginPath(); g.arc(18, -8, ancho, 0, TAU); g.fill(); g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t, pg, pp) {
    const kP = tramo(t, 1.25, 2.0) * (1 - tramo(t, 3.0, 3.75));
    const kG = tramo(t, 9.2, 9.85) * (1 - tramo(t, 11.15, 11.95));
    const kF = tramo(t, 12.0, 12.7);
    const kI = tramo(t, 3.75, 4.1) * (1 - tramo(t, 6.0, 6.55));          // los intentos de Guillermo
    let k = 1 + 0.32 * kP + 0.24 * kG + 0.14 * kF + 0.4 * kI;
    let f = P(512, 300);
    f = mezcla(f, P(XP0 - 10, 220), kP);
    f = mezcla(f, P(360, 210), kI);
    // en el melenazo de Guillermo la cámara sigue a la peluca
    const fv = mezcla(P(XG1 + 20, 230), P(XP0 - 20, 220), suave(fase(t, T.despega, T.llega + 0.1)));
    f = mezcla(f, fv, kG);
    f = mezcla(f, P(640, 300), kF);
    const hx = 512 / k, hy = 300 / k;
    return { k, f: P(clamp(f.x, hx, W - hx), clamp(f.y, hy, H - hy)) };
  }

  class GuillermoParadigmaPelo extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !PD.listo()) return;
      if (!fondo) { fondo = creaFondo(); vuelos(); muelles(); atlasPelo(); }
      const luz = tramo(t, NEGRO_INICIO, 0.8) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02));
      const pg = poseG(t), pp = poseP(t);
      g.save();
      const cam = camara(t, pg, pp);
      g.translate(512, 300); g.scale(cam.k, cam.k); g.translate(-cam.f.x, -cam.f.y);
      MATRIZ = g.getTransform();
      const conCapa = kReflejo(t) >= 0.01;
      if (conCapa) capaParadigma(t, pp);
      g.drawImage(fondo, 0, 0);
      if (conCapa) reflejo(g, t);
      brilloPuerta(g, t);
      cajaAtras(g, t);
      sombra(g, pg, 70); sombra(g, pp, 70);
      dibuja(G, g, pg, t);
      if (conCapa) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(CAPA_P, CAJA_P.bx, CAJA_P.by); g.restore(); }
      else dibuja(PD, g, pp, t);
      cajaDelante(g, t);
      rayasGiro(g, pg); rayasGiro(g, pp);
      dibujaPelucaVolando(g, t);
      // efectos
      const kLentoP = tramo(t, T.lento0 - 0.1, T.lento0 + 0.2) * (1 - tramo(t, T.lento1 - 0.1, T.lento1 + 0.2));
      const kLentoG = tramo(t, T.lento2 - 0.1, T.lento2 + 0.2) * (1 - tramo(t, T.lento3 - 0.1, T.lento3 + 0.15));
      viento(g, t, enCab(PD, pp, P(800, 380)), 1, kLentoP);
      viento(g, t, enCab(G, pg, P(800, 380)), -1, kLentoG * (1 - fase(t, T.despega + 0.2, T.llega)));
      destelloLente(g, t, enCab(PD, pp, P(980, 200)), campana(t, 2.25, 2.85));
      const A = estadoPeluca(t).modo === "vuelo2" ? afPeluca(t) : null;
      if (A) destelloLente(g, t, P(A.e, A.f), campana(t, T.despega + 0.05, T.despega + 0.6));
      chispasOjos(g, t, pg);
      bombillaIdea(g, t, pg);
      plof(g, t, pp);
      tintineo(g, t);
      guino(g, t, PD, pp, T.pGuino, P(780, 470));
      hojas(g, t);
      g.restore();
      // cámara lenta: viñeta cálida
      const kv = Math.max(kLentoP, kLentoG);
      if (kv > 0.01) {
        const v = g.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 640); v.addColorStop(0, "rgba(255,200,120,0)"); v.addColorStop(1, `rgba(120,60,20,${0.38 * kv})`);
        g.fillStyle = v; g.fillRect(0, 0, W, H);
      }
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00104.2", nombre: "Guillermo y Paradigma · El pelo largo", crear: () => new GuillermoParadigmaPelo() });
  window.__A2D_00104_2 = { pose, T, DUR, estadoPeluca, afPeluca, afPelucaMano, afPelucaCabeza, localPeluca, WIG_G, WIG_P, AGARRE, aPantallaG, camara, vuelos, descompone, CASQUETE, MECHONES, muelle, cintasMechon, tau, vientoPeluca, PUERTA, XM, CAJA };
})();
