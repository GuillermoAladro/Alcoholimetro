"use strict";
/* 00137 · Guillermo y Yorgi · La sorpresa
 *
 * El bar a oscuras: solo la raya de luz de la puerta y, por encima de la barra, dos ojitos que parpadean y se
 * esconden. Se abre la puerta (la luz de la calle entra en abanico por el suelo) y la silueta de Guillermo entra
 * a tientas, con la lengua fuera de concentración, palpando la pared… ¡clic! Las luces suben en una rampa suave
 * y Yorgi salta de detrás de la barra soplando un matasuegras (se desenrolla) entre una lluvia de confeti.
 * Banderines con estrellas, globos, guirnalda de bombillas y, en la mesita, una tarta con cinco velas encendidas.
 * Guillermo, del susto al asombro, avanza mirándolo todo; Yorgi sale a recibirle con los brazos abiertos (otro
 * soplido). A Guillermo le tiembla el labio… y rompe a llorar a chorros: dos ríos de lágrimas en arco. A Yorgi se
 * le cae el matasuegras de la boca y abre los brazos: Guillermo se le lanza llorando, Yorgi le recoge en un abrazo
 * de oso por las piernas y le iza en el aire (los pies le cuelgan, la cara de Yorgi contra su barriga). Desde ahí arriba, el chorro de lágrimas llega a la tarta y apaga
 * las velas una a una (pssst, vapor y humito). Se miran la tarta, se miran ellos… y se parten de risa. Remate:
 * los dos miran a cámara, Guillermo todavía en volandas. Las consecuencias se quedan: velas apagadas, tarta
 * mojada, charcos y confeti por el suelo, el matasuegras tirado.
 *
 * Orden de dibujo: fondo (caché) → puerta → globos → suelo (charcos, confeti posado, sombras, matasuegras caído) →
 * Guillermo → mesa y tarta (caché) → chorro derecho (va por detrás de Yorgi) → Yorgi → matasuegras en la boca →
 * barra (caché; tapa a Yorgi escondido) → mano de Guillermo sobre el pelo de Yorgi → chorro izquierdo, vapor, humo,
 * confeti en el aire → oscuridad (pantalla) → ojos en la oscuridad → negro.
 * Sin textos. Fondo propio en caché (presupuesto Pi 3B+).
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, hash } = M2;
  const G = Guillermo, Y = Yorgi, R = Recortes;
  const S = 0.285, SUELO = 582, DUR = 14.6, TAU = Math.PI * 2;
  const T = {
    ojos0: 0.22, parpY: [0.5, 0.72], agacha0: 0.84, agacha1: 1.0,
    puerta0: 1.0, puerta1: 1.45,
    entra0: 1.12, cruza: 1.56, entra1: 2.1,
    tantea0: 2.12, toques: [2.42, 2.72, 3.0], click: 3.3,
    luz0: 3.32, luz1: 3.66,
    pop0: 3.38, pop1: 3.66, confeti: 3.62,
    toot1: 3.56, toot1b: 4.1, susto0: 3.4, susto1: 3.8,
    anda0: 4.05, tarta: 4.42, anda1: 5.3,
    sale0: 4.5, sale1: 5.55, tada0: 5.55, tada1: 5.82, toot2: 5.66, toot2b: 6.08,
    conmueve: 5.9, quiebra: 6.22, llora: 6.42,
    aww: 6.52, cuerno: 6.6,
    abre0: 6.68, impulso: 6.86, alza0: 6.98, alza1: 7.24, acerca0: 7.1, acerca1: 7.34, abraza: 7.3, iza0: 7.42, iza1: 7.78,
    velas: [7.96, 8.26, 8.56, 8.86, 9.14],
    seca: 9.3,
    miranTarta: 9.52, seMiran: 10.26, risa0: 10.52,
    camara: 12.6, guino: 13.32, fin: 14.12
  };

  /* ---------- utilidades ---------- */
  const P = (x, y) => ({ x, y });
  const TINTA = "#141218";
  const difAng = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const lienzo = (w, h) => { const c = document.createElement("canvas"); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; };
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
  const recorrido2 = (lista, t, f = suave) => {
    if (t <= lista[0][0]) return lista[0][1];
    for (let i = 1; i < lista.length; i++) if (t < lista[i][0]) { const k = f(fase(t, lista[i - 1][0], lista[i][0])), a = lista[i - 1][1], b = lista[i][1]; return P(lerp(a.x, b.x, k), lerp(a.y, b.y, k)); }
    return lista[lista.length - 1][1];
  };
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const D5 = (pu, ix, md, an, me) => ({ pulgar: pu, indice: ix, medio: md, anular: an, menique: me });
  const D = (pu, ix, md, re) => D5(pu, ix, md, re, re);
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const rota = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const vib = (t, a, s = 0) => a * (0.6 * Math.sin(t * 71 + s) + 0.4 * Math.sin(t * 113 + 1.7 + s));
  let MATRIZ = null;

  /* ---------- perspectiva: el suelo va de la pared del fondo (MURO) a primer plano (SUELO) ---------- */
  const MURO = 486;
  const escala = y => lerp(0.7, 1, clamp((y - MURO) / (SUELO - MURO)));
  const RUTA_G = [[249, 488], [258, 496], [274, 506], [318, SUELO], [400, SUELO]];
  const RUTA_Y = [[380, SUELO], [560, SUELO], [646, 562], [800, 560]];
  const ySobre = (ruta, x) => {
    if (x <= ruta[0][0]) return ruta[0][1];
    for (let i = 1; i < ruta.length; i++) if (x <= ruta[i][0]) return lerp(ruta[i - 1][1], ruta[i][1], (x - ruta[i - 1][0]) / (ruta[i][0] - ruta[i - 1][0]));
    return ruta[ruta.length - 1][1];
  };

  /* ---------- andar: apoyos de cada pie ---------- */
  const PIE_G = { cerca: -30, lejos: 33 };            // pantalla, respecto a la pelvis (Guillermo mira a la derecha)
  const PIE_Y = { cerca: 30, lejos: -33 };            // Yorgi mira a la izquierda
  function marcha(xIni, tramos, pie, xPel, esc) {
    const ap = { cerca: [[-9, xIni + pie.cerca * esc(xIni), 0]], lejos: [[-9, xIni + pie.lejos * esc(xIni), 0]] };
    for (const [t0, t1, x1, n, primero] of tramos) {
      const d = (t1 - t0) / n; let lado = primero;
      for (let i = 0; i < n; i++) {
        const ts = t0 + i * d, te = ts + d, L = ap[lado], ult = L[L.length - 1];
        ult[2] = Math.max(0, ts - ult[0]);
        const xp = i >= n - 2 ? x1 : xPel(te) + 0.3 * (xPel(te) - xPel(ts));
        L.push([te, xp + pie[lado] * esc(xp), 0]);
        lado = lado === "cerca" ? "lejos" : "cerca";
      }
    }
    for (const l of ["cerca", "lejos"]) { const L = ap[l]; L[L.length - 1][2] = 99; }
    return ap;
  }
  function pieDe(apoyos, t, alto) {
    let i = 0; for (let k = 0; k < apoyos.length; k++) if (apoyos[k][0] <= t) i = k;
    const [tf, xf, dur] = apoyos[i];
    if (i === apoyos.length - 1 || t <= tf + dur) return { x: xf, h: 0, a: 0 };
    const [tn, xn] = apoyos[i + 1], toff = tf + dur, u = clamp((t - toff) / (tn - toff));
    const x = lerp(xf, xn, suave(clamp((u - 0.05) / 0.95)));
    const h = alto * Math.sin(Math.PI * Math.pow(u, 0.72));
    const a = u < 0.3 ? lerp(0, 0.5, suave(u / 0.3)) : u < 0.75 ? lerp(0.5, 0.06, suave((u - 0.3) / 0.45)) : lerp(0.06, 0, suave((u - 0.75) / 0.25));
    return { x, h, a };
  }

  /* =====================================================================================
   * MANOS (objetivo en pantalla → mano en la hoja; el codo lo pone el IK)
   * ===================================================================================== */
  const CODO = new Map([[G, { l: G.BRAZO_L * 0.5, c: G.A.datos.piezas.brazo_cerca.codo }],
                        [Y, { l: (Y.A.datos.piezas.brazo || {}).codo ?? Y.BRAZO_L * 0.5, c: (Y.A.datos.piezas.brazo_cerca || {}).codo ?? Y.BRAZO_C_L * 0.5 }]]);
  const AGARRA = D(0.3, 0.3, 0.3, 0.3), PUNO = D(0.12, 0.08, 0.08, 0.08), ABIERTA = D(1, 1, 1, 1), RELAJ = D(0.5, 0.55, 0.5, 0.45);
  const INDICE = D5(0.15, 1, 0.06, 0.05, 0.05), ABANICO = D(1, 1, 1, 1), ABRAZA = D(0.75, 0.85, 0.84, 0.8), PALMA = D(0.85, 0.95, 0.95, 0.92);
  const hombro = (Pj, p, lado) => Pj.aPantalla(p, Pj.tronco(p)(lado === "cerca" ? Pj.HOMBRO_C : Pj.HOMBRO));
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
  function pista(lista, t, p) {
    let c = lista[0][2](p);
    for (let i = 1; i < lista.length; i++) { const [t0, t1, f, e] = lista[i]; if (t <= t0) break; c = mezclaMano(c, f(p), (e || suave)(fase(t, t0, t1))); }
    return c;
  }
  // las manos solas, por encima de otro personaje (la de Guillermo sobre el pelo de Yorgi)
  function manosEncima(g, Pj, p, lados) {
    const k = p.s * Pj.K, col = { piel: Pj.C.piel, sombra: Pj.C.pielSombra, tinta: Pj.C.tinta };
    g.save(); g.translate(p.x, p.suelo); g.scale(p.espejo ? -k : k, k); g.translate(-Pj.PELVIS.x, -Pj.SUELO);
    for (const lado of lados) {
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m || (m.puno ?? 1) < 0.5) continue;
      g.save(); g.translate(m.x, m.y); g.rotate(m.ang || 0); g.scale(Pj.JK * (m.espejo ? -1 : 1), Pj.JK); g.scale((Pj === G ? 1 : 0.86) * m.puno, (Pj === G ? 1 : 0.86) * m.puno);
      if (m.dedos) Personaje2D.mano(g, m, col); else Personaje2D.puno(g, m.pulgar, col);
      g.restore();
    }
    g.restore();
  }

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, rub: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }
  const B0 = { pel: 0, px: 0, torso: 0.02, cab: 0.03, pcx: 0, pcy: 0, pca: 0, plx: 0, ply: 0, pla: 0 };
  const B = o => Object.assign({}, B0, o);

  /* =====================================================================================
   * GUILLERMO (entra por la puerta del fondo, mira a la derecha)
   * ===================================================================================== */
  const CG = {
    oscuro: E({ mx: 0.85, my: 0.05, iris: 1.2, sd: 12, si: 14, abre: 3, ancho: 0.55, sonr: -0.05 }),
    tantea: E({ mx: 0.95, my: -0.25, c: 0.3, sd: 2, si: 12, gi: 0.08, abre: 4, ancho: 0.55, sonr: -0.1, lengua: 0.5 }),
    susto: E({ mx: 0.7, my: -0.15, iris: 0.72, sd: 32, si: 32, abre: 24, ancho: 0.7, sonr: -0.3 }),
    asombro: E({ mx: 0.55, my: -0.55, iris: 1.15, sd: 24, si: 24, abre: 15, ancho: 0.62, sonr: 0.3 }),
    veTarta: E({ mx: -0.55, my: 0.5, iris: 1.2, sd: 26, si: 26, abre: 12, ancho: 0.7, sonr: 0.55 }),
    miraY: E({ mx: 0.92, my: 0, iris: 1.15, sd: 22, si: 22, abre: 5, ancho: 0.7, sonr: 0.45 }),
    conmovido: E({ mx: 0.9, my: 0.05, iris: 1.35, sd: 26, gd: 0.2, si: 26, gi: 0.2, abre: 3, ancho: 0.5, sonr: -0.5, mof: 0.2, rub: 0.45 }),
    llora: E({ c: 1, z: 1, sd: 22, gd: 0.2, si: 22, gi: 0.2, abre: 34, ancho: 1.0, sonr: -0.75, rub: 0.6 }),
    lloraFeliz: E({ c: 1, z: 0.35, h: 0.7, sd: 22, si: 22, abre: 28, ancho: 1.0, sonr: 0.35, rub: 0.6 }),
    sorbe: E({ mx: 0.3, my: 0.5, c: 0.25, sd: 10, si: 10, abre: 0, ancho: 0.45, sonr: 0.05, mof: 0.15, rub: 0.5 }),
    miraTarta: E({ mx: -0.65, my: 0.75, sd: 14, si: 14, abre: 6, ancho: 0.6, sonr: 0.1, rub: 0.4 }),
    miraAbajoY: E({ mx: 0.75, my: 0.7, sd: 18, si: 18, abre: 4, ancho: 0.7, sonr: 0.5, rub: 0.35 }),
    risa: E({ c: 1, h: 1, sd: 16, si: 16, abre: 24, ancho: 1.05, sonr: 1, rub: 0.45 }),
    final: E({ mx: -0.45, my: -0.05, sd: 12, si: 16, gi: 0.06, sonr: 0.85, ancho: 1.0, rub: 0.35 })
  };
  const GUION_CG = [
    [T.tantea0, T.tantea0 + 0.2, "tantea"], [T.susto0, T.susto0 + 0.06, "susto", salida], [T.anda0 - 0.1, T.anda0 + 0.2, "asombro"],
    [T.tarta - 0.1, T.tarta + 0.15, "veTarta"], [T.anda1 - 0.25, T.anda1, "miraY"], [T.conmueve, T.conmueve + 0.3, "conmovido"],
    [T.llora - 0.04, T.llora + 0.06, "llora", salida], [T.alza0 + 0.15, T.alza1 + 0.1, "lloraFeliz"], [T.seca, T.seca + 0.15, "sorbe"],
    [T.miranTarta, T.miranTarta + 0.2, "miraTarta"], [T.seMiran, T.seMiran + 0.18, "miraAbajoY"], [T.risa0, T.risa0 + 0.1, "risa", salida],
    [T.camara, T.camara + 0.3, "final"]
  ];
  const PARP_G = [1.9, 4.9, 5.4, 9.95, 12.95, 13.62];
  const CUER_G = {
    anda: B({ pel: 6, torso: 0.05, cab: 0.02 }),
    tantea: B({ pel: 14, torso: 0.13, cab: 0.1 }),
    susto: B({ pel: -10, torso: -0.2, cab: -0.16 }),
    asombro: B({ pel: 2, torso: -0.04, cab: -0.1 }),
    veTarta: B({ pel: 4, torso: 0.0, cab: 0.08 }),
    pie: B({}),
    conmovido: B({ pel: 8, torso: 0.06, cab: 0.1 }),
    llora: B({ pel: 14, torso: -0.03, cab: -0.24 }),
    impulso: B({ pel: 50, torso: 0.16, cab: -0.08 }),
    alzado: B({ pel: 0, torso: 0.06, cab: -0.16 }),
    sorbe: B({ torso: 0.08, cab: 0.0 }),
    miraTarta: B({ torso: 0.04, cab: 0.14 }),
    miraY: B({ torso: 0.1, cab: 0.1 }),
    risa: B({ torso: 0.0, cab: -0.2 }),
    final: B({ torso: 0.03, cab: -0.04 })
  };
  const GUION_G = [
    [T.tantea0, T.tantea0 + 0.25, "tantea"], [T.susto0, T.susto0 + 0.1, "susto", salida], [T.susto1, T.anda0 + 0.1, "asombro"],
    [T.tarta - 0.1, T.tarta + 0.2, "veTarta"], [T.anda1 - 0.25, T.anda1 + 0.05, "pie"], [T.conmueve, T.conmueve + 0.3, "conmovido"],
    [T.llora - 0.03, T.llora + 0.1, "llora", salida], [T.impulso, T.alza0, "impulso"], [T.alza0, T.alza1, "alzado", salida], [T.seca, T.seca + 0.2, "sorbe"],
    [T.miranTarta, T.miranTarta + 0.25, "miraTarta"], [T.seMiran, T.seMiran + 0.2, "miraY"], [T.risa0, T.risa0 + 0.15, "risa"],
    [T.camara, T.camara + 0.3, "final"]
  ];
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const XG_LISTA = [[0, 249], [T.entra0, 249], [T.cruza, 258], [T.entra1, 274], [T.anda0, 274], [T.anda1, 318], [T.alza0, 318], [T.alza1, 326], [DUR, 326]];
  const xG = t => recorrido(XG_LISTA, t);
  const escG = x => escala(ySobre(RUTA_G, x));
  const APOYOS_G = marcha(249, [[T.entra0, T.cruza, 258, 1, "lejos"], [T.cruza, T.entra1, 274, 2, "cerca"], [T.anda0, T.anda1, 318, 3, "lejos"]], PIE_G, xG, escG);
  // en volandas: altura (pantalla)
  const ALTO = 150;
  function alzaG(t) {
    if (t < T.alza0) return 0;
    let L = (ALTO - 16) * salida(fase(t, T.alza0, T.alza1)) - 11 * campana(t, T.abraza - 0.02, T.abraza + 0.36) + 16 * suave(fase(t, T.iza0, T.iza1));
    // la risa le zarandea arriba y abajo
    L += 8 * Math.pow(Math.abs(Math.sin((t - T.risa0) * 8.6)), 1.3) * dentro(t, T.risa0 + 0.1, T.risa0 + 0.3, T.camara - 0.4, T.camara);
    return L;
  }
  const meceG = t => dentro(t, T.alza1, T.alza1 + 0.4, T.miranTarta - 0.2, T.miranTarta + 0.2);
  // brinco del susto (pantalla)
  const brincoG = t => 30 * Math.sin(Math.PI * clamp(fase(t, T.susto0, T.susto1)));

  function poseG(t) {
    const b = guion(GUION_G, CUER_G, "anda", t);
    const L = alzaG(t), mece = meceG(t);
    const x = xG(t) + 5 * Math.sin((t - T.alza1) * 3.1) * mece;
    const yS = ySobre(RUTA_G, x), s = S * escala(yS);
    const respira = Math.sin(t * 2.1 + 0.4);
    // sollozos: el pecho da tirones mientras llora
    const solloza = dentro(t, T.llora, T.llora + 0.2, T.seca, T.seca + 0.2);
    const tiron = Math.pow(Math.abs(Math.sin(t * 7.3)), 3) * solloza;
    const p = { x, suelo: yS - brincoG(t) - L, s, tirasLimpias: true, ikContinuo: false, hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x + b.px, y: G.PELVIS.y + b.pel + respira * 1.2 - 6 * tiron },
      torso: b.torso + 0.025 * tiron + 0.03 * Math.sin((t - T.alza1) * 3.1) * mece, torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.012 * tiron },
      piernas: {}, cabeza: { ang: b.cab - 0.04 * tiron, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    // la barbilla tiembla justo antes de romper a llorar
    const tiembla = dentro(t, T.quiebra - 0.1, T.quiebra, T.llora, T.llora + 0.05);
    p.cabeza.ang += vib(t, 0.012 * tiembla, 0.4);
    // pies: andando en el suelo (con la perspectiva) o colgando en volandas
    const wC = pieDe(APOYOS_G.cerca, t, 16), wL = pieDe(APOYOS_G.lejos, t, 16);
    const hojaX = wx => G.PELVIS.x + (wx - x) / s;
    const hojaY = (wx, h, lado) => TOB_G + (ySobre(RUTA_G, wx - PIE_G[lado] * escG(wx)) - yS + L) / s - h / s;
    const cuelga = salida(fase(t, T.alza0 + 0.02, T.alza0 + 0.24));
    const vaiven = Math.sin(t * 4.3) * 26 * cuelga, vaiven2 = Math.sin(t * 4.3 + 1.3) * 26 * cuelga;
    const pieC = { tob: { x: hojaX(wC.x) + b.pcx, y: hojaY(wC.x, wC.h, "cerca") + b.pcy }, ang: wC.a + b.pca };
    const pieL = { tob: { x: hojaX(wL.x) + b.plx, y: hojaY(wL.x, wL.h, "lejos") - 10 + b.ply }, ang: wL.a + b.pla };
    const cuelC = { tob: { x: G.PELVIS.x - 70 + vaiven, y: TOB_G - 46 }, ang: 0.62 + 0.004 * vaiven };
    const cuelL = { tob: { x: G.PELVIS.x + 60 + vaiven2, y: TOB_G - 70 }, ang: 0.5 + 0.004 * vaiven2 };
    const mezP = (a, c) => ({ tob: { x: lerp(a.tob.x, c.tob.x, cuelga), y: lerp(a.tob.y, c.tob.y, cuelga) }, ang: lerp(a.ang, c.ang, cuelga) });
    p.piernas.cerca = mezP(pieC, cuelC);
    p.piernas.lejos = mezP(pieL, cuelL);
    // cara
    const e = guion(GUION_CG, CG, "oscuro", t);
    // el labio tiembla (conmovido)
    const labio = dentro(t, T.conmueve + 0.1, T.conmueve + 0.3, T.llora - 0.02, T.llora + 0.02);
    e.sonr += 0.14 * Math.sin(t * 41) * labio; e.abre += 2.2 * (0.5 + 0.5 * Math.sin(t * 33)) * labio;
    e.abre += 6 * tiron;
    const sorbe = campana(t, T.seca + 0.06, T.seca + 0.3);
    e.mof += 0.3 * sorbe;
    const cerrado = e.c > 0.8 || e.z > 0.6;
    p.cara = cara(e, cerrado ? 0 : parpadeo(t, PARP_G));
    p.rojo = 0.35 * dentro(t, T.conmueve, T.llora, T.risa0 + 1.5, T.camara + 0.4);
    manosG(t, p);
    return p;
  }
  let CACHE_G = { t: -1, p: null };
  function poseGcache(t) { if (CACHE_G.t !== t) CACHE_G = { t, p: poseG(t) }; return CACHE_G.p; }

  // el interruptor y los sitios de la pared que va palpando (pantalla)
  const INTERR = { x: 342, y: 330 };
  const TOQ = [P(350, 282), P(356, 306), P(344, 320)];
  function manosG(t, p) {
    const k = q => q.s / S;
    const lado1 = l => l === "cerca" ? -1 : 1;
    // a tientas: manos por delante, abiertas, tanteando el aire
    const tienta = lado => q => {
      const h = hombro(G, q, lado), kk = k(q), cerca = lado === "cerca", meta = tramo(t, T.cruza - 0.1, T.cruza + 0.35);
      if (cerca) return manoEn(G, q, lado, P(h.x - (6 + 14 * meta) * kk + 3 * Math.sin(t * 4.6) * kk, h.y + (44 - 8 * meta) * kk), { dedos: D(0.9, 1, 1, 0.92), dobla: -1 });
      return manoEn(G, q, lado, P(h.x + (14 + 40 * meta) * kk + 4 * Math.sin(t * 5.2 + 2) * kk, h.y + 30 * kk - 14 * meta * kk), { dedos: D(0.9, 1, 1, 0.92), dobla: 1 });
    };
    const toque = i => q => {
      const kk = k(q), pat = campana(t, T.toques[i] - 0.07, T.toques[i] + 0.07);
      return manoEn(G, q, "lejos", P(TOQ[i].x + 3 * pat * kk, TOQ[i].y - 2 * pat * kk), { dedos: D(0.95, 1, 1, 0.95), dobla: 1 });
    };
    const pulsa = q => {
      const kk = k(q), ap = campana(t, T.click - 0.06, T.click + 0.08);
      return manoEn(G, q, "lejos", P(INTERR.x - 12 * kk + 2 * ap, INTERR.y - 4 * kk + 4 * ap), { dedos: INDICE, dobla: 1 });
    };
    // ¡susto!: manos arriba, abiertas
    const arriba = lado => q => { const h = hombro(G, q, lado), kk = k(q); return manoEn(G, q, lado, P(h.x + (lado === "cerca" ? -36 : 46) * kk, h.y - (lado === "cerca" ? 8 : 22) * kk), { dedos: ABANICO, dobla: lado1(lado) }); };
    // andando: brazos sueltos que bracean un poco
    const suelto = lado => q => {
      const h = hombro(G, q, lado), kk = k(q), cerca = lado === "cerca";
      const sw = Math.sin((t - T.anda0) / ((T.anda1 - T.anda0) / 4) * Math.PI + (cerca ? 0 : Math.PI)) * dentro(t, T.anda0, T.anda0 + 0.2, T.anda1 - 0.25, T.anda1);
      return manoEn(G, q, lado, P(h.x + (cerca ? -4 : 7) * kk + 12 * sw * kk, h.y + (cerca ? 86 : 74) * kk), { dedos: RELAJ, dobla: lado1(lado) });
    };
    // conmovido: manos juntas en el pecho
    const pecho = lado => q => {
      const hL = hombro(G, q, "lejos"), cerca = lado === "cerca";
      return manoEn(G, q, lado, P(hL.x - (cerca ? 14 : 2), hL.y + (cerca ? 46 : 38)), { dedos: cerca ? D(0.5, 0.75, 0.75, 0.7) : D(0.4, 0.6, 0.6, 0.55), dobla: lado1(lado) });
    };
    // llorando: brazos caídos y separados, manos abiertas que tiemblan
    const abiertas = lado => q => {
      const h = hombro(G, q, lado), cerca = lado === "cerca";
      return manoEn(G, q, lado, P(h.x + (cerca ? -22 : 26) + vib(t, 1.6, cerca ? 0 : 1), h.y + 64 + vib(t, 1.4, 2)), { dedos: ABANICO, dobla: lado1(lado) });
    };
    // en volandas: la mano lejana en el pelo de Yorgi (le abraza la cabeza); la cercana cuelga
    const cabezaY = q => {
      const pY = cuerpoYcache(t), H = Y.cabeza(pY), c = Y.aPantalla(pY, H.a({ x: 690, y: 360 }));
      const frota = 3 * Math.sin(t * 9) * dentro(t, T.risa0, T.risa0 + 0.3, T.camara - 0.3, T.camara);
      return manoEn(G, q, "lejos", P(c.x + frota, c.y + 4), { dedos: D(0.85, 0.95, 0.95, 0.9), dobla: 1 });
    };
    const cuelga = q => {
      const h = hombro(G, q, "cerca"), sw = Math.sin(t * 4.3 + 0.7);
      return manoEn(G, q, "cerca", P(h.x - 26 + 6 * sw, h.y + 70), { dedos: D(0.65, 0.8, 0.75, 0.7), dobla: -1 });
    };
    p.manoLejos = pista([
      [0, 0, tienta("lejos")], [T.tantea0 - 0.08, T.toques[0] - 0.04, toque(0)], [T.toques[0] + 0.08, T.toques[1] - 0.04, toque(1)],
      [T.toques[1] + 0.08, T.toques[2] - 0.04, toque(2)], [T.toques[2] + 0.1, T.click - 0.06, pulsa],
      [T.susto0 + 0.02, T.susto0 + 0.14, arriba("lejos"), salida], [T.anda0, T.anda0 + 0.35, suelto("lejos")],
      [T.conmueve, T.conmueve + 0.3, pecho("lejos")], [T.llora, T.llora + 0.14, abiertas("lejos"), salida],
      [T.alza0 + 0.04, T.abraza + 0.02, cabezaY]
    ], t, p);
    p.manoCerca = pista([
      [0, 0, tienta("cerca")], [T.susto0 + 0.02, T.susto0 + 0.14, arriba("cerca"), salida], [T.anda0, T.anda0 + 0.35, suelto("cerca")],
      [T.conmueve + 0.06, T.conmueve + 0.36, pecho("cerca")], [T.llora, T.llora + 0.14, abiertas("cerca"), salida],
      [T.alza0, T.alza1, cuelga]
    ], t, p);
  }

  /* =====================================================================================
   * YORGI (detrás de la barra; luego sale; mira a la izquierda: espejo)
   * ===================================================================================== */
  const CY = {
    asoma: E({ mx: 0.9, my: 0.05, iris: 1.1, sd: 14, si: 14, abre: 0, ancho: 0.6, sonr: 0.25 }),
    sopla: E({ mx: 0.7, my: 0, c: 0.55, h: 0.6, sd: 22, si: 22, abre: 2, ancho: 0.35, sonr: 0.1, mof: 1 }),
    sonrisa: E({ mx: 0.9, my: 0, sd: 18, si: 18, abre: 0, ancho: 0.7, sonr: 0.9, rub: 0.15 }),
    aww: E({ mx: 0.9, my: 0.05, iris: 1.2, sd: 26, gd: 0.15, si: 26, gi: 0.15, abre: 26, ancho: 0.75, sonr: 0.35, rub: 0.4 }),
    abrazo: E({ c: 1, h: 1, sd: 16, si: 16, abre: 8, ancho: 0.9, sonr: 0.9, rub: 0.35 }),
    miraTarta: E({ mx: 0.75, my: 0.55, sd: 12, si: 12, abre: 4, ancho: 0.65, sonr: 0.2 }),
    miraG: E({ mx: 0.55, my: -0.8, sd: 18, si: 18, abre: 4, ancho: 0.7, sonr: 0.5 }),
    risa: E({ c: 1, h: 1, sd: 16, si: 16, abre: 22, ancho: 1.05, sonr: 1, rub: 0.35 }),
    final: E({ mx: -0.45, my: -0.1, sd: 12, si: 14, sonr: 0.9, ancho: 1.0, rub: 0.2 })
  };
  const GUION_CY = [
    [T.toot1 - 0.06, T.toot1 + 0.02, "sopla"], [T.toot1b - 0.06, T.toot1b + 0.1, "sonrisa"], [T.toot2 - 0.08, T.toot2, "sopla"],
    [T.toot2b - 0.04, T.toot2b + 0.1, "sonrisa"], [T.aww - 0.05, T.aww + 0.08, "aww", salida], [T.abraza - 0.12, T.abraza + 0.08, "abrazo"],
    [T.miranTarta + 0.06, T.miranTarta + 0.26, "miraTarta"], [T.seMiran, T.seMiran + 0.18, "miraG"], [T.risa0 + 0.05, T.risa0 + 0.15, "risa", salida],
    [T.camara + 0.1, T.camara + 0.4, "final"]
  ];
  const PARP_Y = [...T.parpY, 4.7, 5.25, 9.85, 12.2, 13.95];
  const CUER_Y = {
    escondido: B({ pel: 480, torso: 0.44, cab: 0.16, pcx: 40, plx: 30 }),
    asoma: B({ pel: 165, torso: 0.12, cab: 0.0, pcx: 20, plx: 14 }),
    salta: B({ pel: -20, torso: -0.1, cab: -0.08 }),
    pie: B({}),
    anda: B({ pel: 6, torso: 0.06 }),
    tada: B({ pel: 12, torso: -0.05, cab: -0.06 }),
    aww: B({ pel: 4, torso: 0.03, cab: 0.1 }),
    abre: B({ pel: 16, torso: 0.08, cab: 0.02 }),
    recibe: B({ pel: 86, torso: 0.02, cab: 0.06 }),
    alza: B({ pel: 8, torso: -0.08, cab: -0.04 }),
    miraTarta: B({ pel: 8, torso: -0.06, cab: 0.06 }),
    miraG: B({ pel: 8, torso: -0.1, cab: -0.12 }),
    risa: B({ pel: 14, torso: -0.12, cab: -0.14 }),
    final: B({ pel: 6, torso: -0.06, cab: -0.04 })
  };
  const GUION_Y = [
    [T.ojos0, T.ojos0 + 0.32, "asoma"], [T.agacha0, T.agacha1, "escondido"], [T.pop0, T.pop1, "salta", salida], [T.pop1 + 0.15, T.pop1 + 0.45, "pie"],
    [T.sale0, T.sale0 + 0.15, "anda"], [T.tada0, T.tada1, "tada"], [T.aww - 0.05, T.aww + 0.15, "aww"], [T.abre0, T.abre0 + 0.22, "abre"],
    [T.abraza - 0.02, T.abraza + 0.12, "recibe", salida], [T.abraza + 0.14, T.iza1, "alza"], [T.miranTarta, T.miranTarta + 0.25, "miraTarta"], [T.seMiran, T.seMiran + 0.2, "miraG"],
    [T.risa0, T.risa0 + 0.15, "risa"], [T.camara, T.camara + 0.3, "final"]
  ];
  const TOB_Y = Y.SUELO - Y.TOBILLO_ALTO;
  const XY_LISTA = [[0, 742], [T.sale0, 742], [T.sale1, 500], [T.acerca0, 500], [T.acerca1, 408], [DUR, 408]];
  const xY = t => recorrido(XY_LISTA, t);
  const escY = x => escala(ySobre(RUTA_Y, x));
  const APOYOS_Y = marcha(742, [[T.sale0, T.sale1, 500, 4, "lejos"], [T.acerca0, T.acerca1, 408, 2, "lejos"]], PIE_Y, xY, escY);
  const saltoY = t => 40 * Math.sin(Math.PI * clamp(fase(t, T.pop0 + 0.06, T.pop0 + 0.52)));

  function cuerpoY(t) {
    const b = guion(GUION_Y, CUER_Y, "escondido", t);
    const x = xY(t), yS = ySobre(RUTA_Y, x), s = S * escala(yS);
    const respira = Math.sin(t * 1.9 + 1.1);
    const risa = dentro(t, T.risa0 + 0.05, T.risa0 + 0.25, T.camara - 0.3, T.camara);
    const p = { x, suelo: yS - saltoY(t), s, espejo: true, tirasLimpias: true,
      pelvis: { x: Y.PELVIS.x + b.px, y: Y.PELVIS.y + b.pel + respira * 1.2 + 10 * Math.abs(Math.sin((t - T.risa0) * 8.6)) * risa },
      torso: b.torso - 0.02 * Math.sin((t - T.alza1) * 3.1) * meceG(t) + 0.03 * Math.sin((t - T.risa0) * 8.6) * risa,
      torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {}, cabeza: { ang: b.cab + 0.04 * Math.sin((t - T.risa0) * 8.6 + 0.5) * risa, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    const wC = pieDe(APOYOS_Y.cerca, t, 34), wL = pieDe(APOYOS_Y.lejos, t, 34);
    const hojaX = wx => Y.PELVIS.x - (wx - x) / s;
    const hojaY = (wx, h, lado) => TOB_Y + (ySobre(RUTA_Y, wx - PIE_Y[lado] * escY(wx)) - yS + saltoY(t)) / s - h / s;
    p.piernas.cerca = { tob: { x: hojaX(wC.x) + b.pcx, y: hojaY(wC.x, wC.h, "cerca") + b.pcy }, ang: wC.a + b.pca };
    p.piernas.lejos = { tob: { x: hojaX(wL.x) + b.plx, y: hojaY(wL.x, wL.h, "lejos") - 10 + b.ply }, ang: wL.a + b.pla };
    return p;
  }
  let CACHE_YC = { t: -1, p: null };
  function cuerpoYcache(t) { if (CACHE_YC.t !== t) CACHE_YC = { t, p: cuerpoY(t) }; return CACHE_YC.p; }

  function poseY(t) {
    const p = Object.assign({}, cuerpoYcache(t));
    const e = guion(GUION_CY, CY, "asoma", t);
    const cerrado = e.c > 0.8;
    p.cara = cara(e, cerrado ? 0 : parpadeo(t, PARP_Y));
    // remate: guiño a cámara
    p.cara.ojos.i = Math.max(p.cara.ojos.i, campana(t, T.guino, T.guino + 0.42));
    p.rojo = 0.25 * dentro(t, T.risa0, T.risa0 + 0.5, T.camara, T.camara + 0.5);
    manosY(t, p);
    return p;
  }
  function manosY(t, p) {
    const lado1 = l => l === "cerca" ? -1 : 1;
    // escondido: puños con confeti delante del pecho
    const puños = lado => q => { const h = hombro(Y, q, lado), cerca = lado === "cerca"; return manoEn(Y, q, lado, P(h.x - (cerca ? 46 : 30), h.y + (cerca ? 52 : 46)), { dedos: PUNO, dobla: lado1(lado) }); };
    // ¡sorpresa!: brazos arriba; los puños se abren y sueltan el confeti
    const arriba = lado => q => {
      const h = hombro(Y, q, lado), cerca = lado === "cerca", suelta = tramo(t, T.confeti - 0.02, T.confeti + 0.08);
      return manoEn(Y, q, lado, P(h.x + (cerca ? 28 : -36), h.y - (cerca ? 92 : 96)), { dedos: DD(PUNO, ABANICO, suelta), dobla: lado1(lado) });
    };
    // manos de jazz (temblando) y luego sueltas al andar
    const jazz = lado => q => { const h = hombro(Y, q, lado), cerca = lado === "cerca"; return manoEn(Y, q, lado, P(h.x + (cerca ? 46 : -58) + vib(t, 2.5, cerca ? 0 : 2), h.y - 12 + vib(t, 2, 1)), { dedos: ABANICO, dobla: lado1(lado) }); };
    const suelto = lado => q => {
      const h = hombro(Y, q, lado), cerca = lado === "cerca";
      const sw = Math.sin((t - T.sale0) / ((T.sale1 - T.sale0) / 4) * Math.PI + (cerca ? 0 : Math.PI)) * dentro(t, T.sale0, T.sale0 + 0.2, T.sale1 - 0.25, T.sale1);
      return manoEn(Y, q, lado, P(h.x + (cerca ? 6 : -8) - 14 * sw, h.y + (cerca ? 98 : 88)), { dedos: RELAJ, dobla: lado1(lado) });
    };
    // ¡tachán!: brazos abiertos, palmas arriba
    const tada = lado => q => { const h = hombro(Y, q, lado), cerca = lado === "cerca"; return manoEn(Y, q, lado, P(h.x + (cerca ? 58 : -48), h.y + (cerca ? 48 : 52)), { dedos: PALMA, dobla: lado1(lado) }); };
    // ¡oooh!: manos juntas en el pecho
    const pecho = lado => q => { const h = hombro(Y, q, "lejos"), cerca = lado === "cerca"; return manoEn(Y, q, lado, P(h.x + (cerca ? 6 : -4), h.y + (cerca ? 46 : 38)), { dedos: D(0.5, 0.7, 0.7, 0.65), dobla: lado1(lado) }); };
    // ¡ven aquí!: brazos abiertos hacia Guillermo, listos para recogerle
    const listos = lado => q => { const h = hombro(Y, q, lado), cerca = lado === "cerca"; return manoEn(Y, q, lado, P(h.x - (cerca ? 70 : 76), h.y + (cerca ? 14 : 4)), { dedos: ABIERTA, dobla: lado1(lado) }); };
    // le abraza por las piernas: la mano lejana por detrás (en el culo), la cercana delante del muslo
    const culo = q => { const pG = poseGcache(t); return manoEn(Y, q, "lejos", G.aPantalla(pG, G.tronco(pG)(P(150, 742))), { dedos: ABRAZA, dobla: 1 }); };
    const muslo = q => { const pG = poseGcache(t); return manoEn(Y, q, "cerca", G.aPantalla(pG, G.tronco(pG)(P(320, 800))), { dedos: D(0.75, 0.88, 0.86, 0.82), dobla: -1 }); };
    p.manoLejos = pista([
      [0, 0, puños("lejos")], [T.pop0, T.pop0 + 0.2, arriba("lejos"), salida], [T.confeti + 0.24, T.confeti + 0.5, jazz("lejos")],
      [T.sale0 - 0.05, T.sale0 + 0.3, suelto("lejos")], [T.tada0 - 0.05, T.tada1, tada("lejos"), salida], [T.aww, T.aww + 0.2, pecho("lejos")],
      [T.abre0, T.abre0 + 0.22, listos("lejos")], [T.abraza - 0.1, T.abraza + 0.03, culo]
    ], t, p);
    p.manoCerca = pista([
      [0, 0, puños("cerca")], [T.pop0 + 0.02, T.pop0 + 0.22, arriba("cerca"), salida], [T.confeti + 0.26, T.confeti + 0.52, jazz("cerca")],
      [T.sale0, T.sale0 + 0.3, suelto("cerca")], [T.tada0, T.tada1 + 0.04, tada("cerca"), salida], [T.aww + 0.03, T.aww + 0.23, pecho("cerca")],
      [T.abre0 + 0.03, T.abre0 + 0.25, listos("cerca")], [T.abraza - 0.08, T.abraza + 0.05, muslo]
    ], t, p);
  }

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  const OX = 110, OY = 80;
  const PUERTA = { x0: 200, x1: 298, y0: 166, y1: 488 };
  const BARRA = { x0: 640, x1: W + OX, top: 292, base: 594 };
  const MESA = { x: 118, y: 392, rx: 66, ry: 13, base: 586 };
  const TARTA = { x: 118, base: 388, rx: 44, h: 42, ry: 9 };
  const VELAS = [28, 14, 0, -14, -28].map((dx, i) => ({ x: TARTA.x + dx, y: TARTA.base - TARTA.h + (i % 2 ? -2 : 2), alto: 24, col: i % 2 ? "#6fc3ff" : "#ffd23f" }));
  const LAMPARAS = [{ x: 470, y: 64 }, { x: 772, y: 92 }, { x: 952, y: 92 }];
  const GLOBOS = [
    { x: 74, y: 94, c: "#e8413c", nudo: P(96, 160) }, { x: 108, y: 70, c: "#f6c234", nudo: P(96, 160) }, { x: 132, y: 108, c: "#2bb3a6", nudo: P(96, 160) },
    { x: 930, y: 70, c: "#8b5cf6", nudo: P(966, 206) }, { x: 968, y: 50, c: "#ff8a3d", nudo: P(966, 206) }, { x: 1000, y: 90, c: "#ff6fa8", nudo: P(966, 206) }
  ];
  const COLORES = ["#e8413c", "#f6c234", "#2bb3a6", "#8b5cf6", "#ff8a3d", "#ff6fa8", "#4fb3ff"];
  let capas = null;
  function crea() {
    const fondo = lienzo(W + 2 * OX, H + 2 * OY), g = fondo.getContext("2d");
    g.translate(OX, OY); g.lineJoin = "round"; g.lineCap = "round";
    pared(g); suelo(g); marcoPuerta(g); placaInterruptor(g); estanteria(g); viga(g); cuerdasLamparas(g); banderines(g);
    // barra (delante de Yorgi escondido)
    const barra = lienzo(BARRA.x1 - BARRA.x0 + 30, BARRA.base - BARRA.top + 120), b = barra.getContext("2d");
    b.translate(-BARRA.x0 + 20, -BARRA.top + 100); b.lineJoin = "round"; b.lineCap = "round"; dibBarra(b);
    // mesita con la tarta (las llamas van aparte)
    const mesa = lienzo(180, 270), m = mesa.getContext("2d");
    m.translate(-MESA.x + 90, -MESA.y + 74); m.lineJoin = "round"; m.lineCap = "round"; dibMesa(m); dibTarta(m);
    const globos = GLOBOS.map(o => globo(o.c));
    // resplandor (sprite) para lámparas, bombillas y llamas
    const halo = lienzo(128, 128), hg = halo.getContext("2d"), rg = hg.createRadialGradient(64, 64, 0, 64, 64, 64);
    rg.addColorStop(0, "rgba(255,226,160,0.9)"); rg.addColorStop(0.35, "rgba(255,196,110,0.35)"); rg.addColorStop(1, "rgba(255,180,90,0)");
    hg.fillStyle = rg; hg.fillRect(0, 0, 128, 128);
    return { fondo, barra, mesa, globos, halo };
  }
  function pared(g) {
    const top = -OY - 10;
    const gr = g.createLinearGradient(0, top, 0, 330); gr.addColorStop(0, "#1f3d34"); gr.addColorStop(1, "#2c5446");
    g.fillStyle = gr; g.fillRect(-OX, top, W + 2 * OX, 336 - top);
    // papel pintado: rombos dorados muy suaves
    g.fillStyle = "rgba(230,200,120,0.08)";
    for (let y = top + 8, f = 0; y < 326; y += 30, f++) for (let x = -OX + (f % 2 ? 15 : 0); x < W + OX; x += 30) {
      g.beginPath(); g.moveTo(x, y - 7); g.lineTo(x + 5, y); g.lineTo(x, y + 7); g.lineTo(x - 5, y); g.closePath(); g.fill();
    }
    // friso de madera
    const fr = g.createLinearGradient(0, 330, 0, MURO); fr.addColorStop(0, "#6a4126"); fr.addColorStop(1, "#4e2f1b");
    g.fillStyle = fr; g.fillRect(-OX, 330, W + 2 * OX, MURO - 330);
    for (let x = -OX + 12; x < W + OX; x += 96) {
      g.fillStyle = "rgba(0,0,0,0.16)"; g.fillRect(x, 350, 80, MURO - 372);
      g.fillStyle = "rgba(255,220,170,0.08)"; g.fillRect(x + 3, 353, 74, 3); g.fillRect(x + 3, 353, 3, MURO - 378);
    }
    g.fillStyle = "#7d4f2e"; g.fillRect(-OX, 326, W + 2 * OX, 10);
    g.fillStyle = "rgba(255,230,190,0.25)"; g.fillRect(-OX, 326, W + 2 * OX, 2);
    g.fillStyle = "#3a2314"; g.fillRect(-OX, MURO - 14, W + 2 * OX, 14);
  }
  function viga(g) {
    // techo de madera (se ve al abrir el plano)
    g.fillStyle = "#3a2616"; g.fillRect(-OX, -OY - 10, W + 2 * OX, OY + 2);
    g.fillStyle = "#4d331e"; for (let x = -OX; x < W + OX; x += 140) g.fillRect(x, -OY - 10, 70, OY + 2);
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(-OX, -10, W + 2 * OX, 6);
  }
  function suelo(g) {
    const bajo = H + OY;
    const gr = g.createLinearGradient(0, MURO, 0, bajo); gr.addColorStop(0, "#6e4426"); gr.addColorStop(0.5, "#8a5a32"); gr.addColorStop(1, "#9c6a3c");
    g.fillStyle = gr; g.fillRect(-OX, MURO, W + 2 * OX, bajo - MURO);
    const fx = 512, fy = MURO - 760;
    g.strokeStyle = "rgba(50,28,12,0.4)"; g.lineWidth = 1.4;
    const xEn = (xb, y) => lerp(fx, xb, (y - fy) / (bajo - fy));
    for (let i = -18; i <= 18; i++) { const xb = 512 + i * 74; g.beginPath(); g.moveTo(xEn(xb, MURO), MURO); g.lineTo(xb, bajo); g.stroke(); }
    // juntas de las tablas (al tresbolillo)
    g.strokeStyle = "rgba(50,28,12,0.28)";
    const filas = [MURO + 14, MURO + 34, MURO + 60, MURO + 92, MURO + 132, MURO + 180];
    for (let f = 0; f < filas.length; f++) for (let i = -18 + (f % 2); i <= 17; i += 2) {
      const y = filas[f], x = xEn(512 + i * 74, y), x2 = xEn(512 + (i + 1) * 74, y);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y); g.stroke();
    }
    // brillo del suelo encerado
    g.fillStyle = "rgba(255,220,170,0.06)";
    for (const [x, w] of [[300, 180], [700, 220]]) { g.beginPath(); g.ellipse(x, MURO + 50, w, 20, 0, 0, TAU); g.fill(); }
  }
  function marcoPuerta(g) {
    const { x0, x1, y0, y1 } = PUERTA;
    g.fillStyle = "#3d2414"; g.fillRect(x0 - 12, y0 - 14, x1 - x0 + 24, y1 - y0 + 14);
    g.fillStyle = "#5b3820"; g.fillRect(x0 - 9, y0 - 11, x1 - x0 + 18, 8); g.fillRect(x0 - 9, y0 - 11, 7, y1 - y0 + 11); g.fillRect(x1 + 2, y0 - 11, 7, y1 - y0 + 11);
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x0 - 12, y0 - 14, x1 - x0 + 24, y1 - y0 + 14);
  }
  function placaInterruptor(g) {
    g.fillStyle = "#efe6d2"; g.beginPath(); g.roundRect(INTERR.x - 7, INTERR.y - 11, 14, 22, 3); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke();
  }
  function estanteria(g) {
    // espejo con marco dorado (sin nada escrito) y baldas con botellas detrás de la barra
    const x0 = BARRA.x0 + 40, x1 = W + OX - 30;
    g.fillStyle = "#b0873e"; g.fillRect(x0 + 30, 6, 340, 118);
    const es = g.createLinearGradient(x0 + 36, 12, x0 + 360, 118); es.addColorStop(0, "#6f8f96"); es.addColorStop(0.5, "#9fb9bc"); es.addColorStop(1, "#5f7a80");
    g.fillStyle = es; g.fillRect(x0 + 38, 14, 324, 102);
    g.fillStyle = "rgba(255,255,255,0.22)"; g.beginPath(); g.moveTo(x0 + 70, 116); g.lineTo(x0 + 110, 116); g.lineTo(x0 + 170, 14); g.lineTo(x0 + 130, 14); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x0 + 30, 6, 340, 118);
    for (const ly of [176, 236]) {
      g.fillStyle = "#5a361e"; g.fillRect(x0 - 10, ly, x1 - x0 + 20, 7);
      g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(x0 - 10, ly + 7, x1 - x0 + 20, 4);
      for (let x = x0; x < x1 - 6; x += 15) {
        const h = 22 + 14 * hash(x * 1.3 + ly), col = ["#2f6b3a", "#7a2a1e", "#c99a3a", "#3b4f7a", "#5c2a4a"][Math.floor(hash(x * 3 + ly) * 5)];
        g.fillStyle = col; g.fillRect(x, ly - h, 9, h); g.fillRect(x + 3, ly - h - 8, 3, 8);
        g.fillStyle = "rgba(255,255,255,0.32)"; g.fillRect(x + 1.5, ly - h + 3, 1.6, h - 6);
        g.fillStyle = "rgba(240,230,200,0.7)"; g.fillRect(x + 1, ly - h * 0.55, 7, 6);
      }
    }
  }
  function cuerdasLamparas(g) {
    for (const L of LAMPARAS) {
      g.strokeStyle = "#1a120c"; g.lineWidth = 2; g.beginPath(); g.moveTo(L.x, -OY - 10); g.lineTo(L.x, L.y - 20); g.stroke();
      g.fillStyle = "#2f5d45"; g.beginPath(); g.moveTo(L.x - 8, L.y - 22); g.lineTo(L.x + 8, L.y - 22); g.lineTo(L.x + 30, L.y + 6); g.lineTo(L.x - 30, L.y + 6); g.closePath(); g.fill();
      g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
      g.fillStyle = "#c9a64a"; g.fillRect(L.x - 30, L.y + 4, 60, 4);
      g.fillStyle = "#f3e2b6"; g.beginPath(); g.ellipse(L.x, L.y + 8, 12, 5, 0, 0, Math.PI); g.fill();
    }
  }
  // banderines con estrellas (la pancarta de cumpleaños, sin letras), estrellas de papel y guirnaldas
  const CURVA_B = [[-OX, 30, 500, 30, 62], [500, 30, W + OX, 24, 56]];
  const enCurva = (c, u) => { const [x0, y0, x1, y1, sag] = c; return P(lerp(x0, x1, u), lerp(y0, y1, u) + sag * 4 * u * (1 - u)); };
  function estrella(g, x, y, r, rot) {
    g.beginPath();
    for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    g.closePath();
  }
  function banderines(g) {
    // guirnaldas de papel pinocho (ondas) colgando de las esquinas
    for (const [x0, x1, y, col] of [[-OX, 300, 6, "#ff6fa8"], [700, W + OX, 2, "#4fb3ff"]]) {
      g.strokeStyle = col; g.lineWidth = 7; g.beginPath();
      for (let i = 0; i <= 40; i++) { const u = i / 40, x = lerp(x0, x1, u), yy = y + 46 * Math.sin(Math.PI * u) + 4 * Math.sin(u * 60); if (i) g.lineTo(x, yy); else g.moveTo(x, yy); }
      g.stroke();
    }
    let n = 0;
    for (const c of CURVA_B) {
      g.strokeStyle = "#2a1c12"; g.lineWidth = 1.6; g.beginPath();
      for (let i = 0; i <= 30; i++) { const q = enCurva(c, i / 30); if (i) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); }
      g.stroke();
      const largo = c[2] - c[0], k = Math.floor(largo / 40);
      for (let i = 0; i < k; i++) {
        const a = enCurva(c, (i + 0.1) / k), b = enCurva(c, (i + 0.9) / k), m = enCurva(c, (i + 0.5) / k);
        const col = COLORES[n++ % COLORES.length];
        g.fillStyle = col; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(m.x, m.y + 34); g.closePath(); g.fill();
        g.strokeStyle = "rgba(20,18,24,0.7)"; g.lineWidth = 1.2; g.stroke();
        g.fillStyle = "rgba(255,255,255,0.9)"; estrella(g, m.x, m.y + 11, 5.2, 0); g.fill();
      }
    }
    // cordón de estrellas de papel colgando de la viga
    for (const [x, y, r, col] of [[230, 120, 13, "#f6c234"], [410, 142, 10, "#ffffff"], [560, 118, 14, "#ff8a3d"], [652, 150, 9, "#f6c234"], [860, 140, 12, "#ffffff"]]) {
      g.strokeStyle = "rgba(30,20,12,0.8)"; g.lineWidth = 1; g.beginPath(); g.moveTo(x, -OY); g.lineTo(x, y - r); g.stroke();
      g.fillStyle = col; estrella(g, x, y, r, 0.2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke();
    }
  }
  function globo(col) {
    const c = lienzo(64, 80), g = c.getContext("2d");
    g.translate(32, 36);
    g.fillStyle = col; g.beginPath(); g.ellipse(0, 0, 24, 30, 0, 0, TAU); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.beginPath(); g.moveTo(-4, 31); g.lineTo(4, 31); g.lineTo(0, 27); g.closePath(); g.fillStyle = col; g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.ellipse(-9, -12, 5, 9, -0.4, 0, TAU); g.fill();
    g.fillStyle = "rgba(0,0,0,0.12)"; g.beginPath(); g.ellipse(8, 10, 12, 16, -0.4, 0, TAU); g.fill();
    return c;
  }
  function dibBarra(g) {
    const { x0, x1, top, base } = BARRA;
    // frente de madera con cuarterones
    const fr = g.createLinearGradient(0, top, 0, base); fr.addColorStop(0, "#5a331b"); fr.addColorStop(1, "#3e2212");
    g.fillStyle = fr; g.fillRect(x0, top + 10, x1 - x0, base - top - 10);
    for (let x = x0 + 22; x < x1 - 40; x += 92) {
      g.fillStyle = "rgba(0,0,0,0.2)"; g.fillRect(x, top + 34, 70, base - top - 92);
      g.fillStyle = "rgba(255,210,160,0.1)"; g.fillRect(x + 4, top + 38, 62, 3); g.fillRect(x + 4, top + 38, 3, base - top - 100);
    }
    // canto (la esquina de la barra)
    g.fillStyle = "#6b3e22"; g.fillRect(x0, top + 10, 16, base - top - 10);
    g.strokeStyle = TINTA; g.lineWidth = 2.4; g.strokeRect(x0, top + 10, x1 - x0, base - top - 10);
    // barra de latón para los pies
    g.fillStyle = "#c9a64a"; g.fillRect(x0 - 6, base - 46, x1 - x0, 7);
    g.fillStyle = "rgba(255,255,255,0.45)"; g.fillRect(x0 - 6, base - 46, x1 - x0, 2);
    g.strokeStyle = TINTA; g.lineWidth = 1.4; g.strokeRect(x0 - 6, base - 46, x1 - x0, 7);
    for (let x = x0 + 30; x < x1; x += 160) { g.fillStyle = "#9b7b31"; g.fillRect(x, base - 40, 6, 18); }
    // tablero
    g.fillStyle = "#7a4626"; g.beginPath(); g.moveTo(x0 - 14, top + 12); g.lineTo(x0 - 4, top - 4); g.lineTo(x1, top - 4); g.lineTo(x1, top + 12); g.closePath(); g.fill();
    g.fillStyle = "#93582f"; g.fillRect(x0 - 14, top + 6, x1 - x0 + 14, 9);
    g.fillStyle = "rgba(255,230,190,0.35)"; g.fillRect(x0 - 10, top - 2, x1 - x0, 2);
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 - 14, top + 15); g.lineTo(x0 - 14, top + 6); g.lineTo(x0 - 4, top - 4); g.lineTo(x1, top - 4); g.moveTo(x0 - 14, top + 15); g.lineTo(x1, top + 15); g.stroke();
    // grifos de cerveza (sin marcas)
    for (const [x, col] of [[918, "#c0392b"], [956, "#2e86c1"]]) {
      g.fillStyle = "#c9cdd3"; g.fillRect(x - 4, top - 30, 8, 28); g.fillRect(x - 10, top - 34, 20, 6);
      g.fillStyle = col; g.beginPath(); g.roundRect(x - 5, top - 74, 10, 40, 4); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke();
    }
  }
  function dibMesa(g) {
    const { x, y, rx, ry, base } = MESA;
    // pie y base
    g.fillStyle = "#2b1d14"; g.fillRect(x - 6, y + 10, 12, base - y - 18);
    g.beginPath(); g.ellipse(x, base - 4, 38, 8, 0, 0, TAU); g.fill();
    g.fillStyle = "rgba(255,255,255,0.15)"; g.fillRect(x - 3, y + 14, 2, base - y - 26);
    // mantel con picos
    g.fillStyle = "#fbf5ea"; g.beginPath(); g.moveTo(x - rx, y);
    for (let i = 0; i <= 10; i++) { const u = i / 10, xx = lerp(x - rx - 4, x + rx + 4, u); g.lineTo(xx, y + 26 + (i % 2 ? 10 : 0) - 6 * Math.sin(Math.PI * u)); }
    g.lineTo(x + rx, y); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.8; g.stroke();
    g.fillStyle = "#ff6fa8"; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(x - rx + 14 + i * 22, y + 14, 3, 0, TAU); g.fill(); }
    g.fillStyle = "#fffdf7"; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); g.stroke();
  }
  function dibTarta(g) {
    const { x, base, rx, h, ry } = TARTA, top = base - h;
    // plato
    g.fillStyle = "#e8eef4"; g.beginPath(); g.ellipse(x, base + 2, rx + 12, ry + 3, 0, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.stroke();
    // bizcocho con nata rosa
    g.fillStyle = "#f7a8c4"; g.beginPath(); g.moveTo(x - rx, top); g.lineTo(x - rx, base); g.ellipse(x, base, rx, ry, 0, Math.PI, 0, true); g.lineTo(x + rx, top); g.closePath(); g.fill();
    g.fillStyle = "rgba(0,0,0,0.08)"; g.fillRect(x + rx * 0.4, top, rx * 0.6, h + 6);
    g.fillStyle = "#fde3ec"; g.fillRect(x - rx, top + h * 0.48, rx * 2, 7);
    // chorretones de nata blanca
    g.fillStyle = "#fffaf4"; g.beginPath(); g.moveTo(x - rx, top);
    for (let i = 0; i <= 12; i++) { const u = i / 12, xx = lerp(x - rx, x + rx, u); g.lineTo(xx, top + 6 + (i % 2 ? 4 + 9 * hash(i + 2) : 2)); }
    g.lineTo(x + rx, top); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(x - rx, top); g.lineTo(x - rx, base); g.ellipse(x, base, rx, ry, 0, Math.PI, 0, true); g.lineTo(x + rx, top); g.stroke();
    g.fillStyle = "#fffaf4"; g.beginPath(); g.ellipse(x, top, rx, ry, 0, 0, TAU); g.fill(); g.stroke();
    // cerezas y fideos de colores
    for (let i = 0; i < 14; i++) { const a = hash(i * 3.1) * TAU, r = 0.85 * hash(i * 7.7); g.fillStyle = COLORES[i % COLORES.length]; g.fillRect(x + Math.cos(a) * rx * r - 2, top + Math.sin(a) * ry * r - 1, 4, 2); }
    for (const dx of [-36, 36]) { g.fillStyle = "#c0182b"; g.beginPath(); g.arc(x + dx, top + 1, 4, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1; g.stroke(); }
    // velas (palitos con rayas)
    for (const v of VELAS.slice().sort((a, b) => a.y - b.y)) {
      g.fillStyle = "#ffffff"; g.fillRect(v.x - 2.5, v.y - v.alto, 5, v.alto);
      g.save(); g.beginPath(); g.rect(v.x - 2.5, v.y - v.alto, 5, v.alto); g.clip();
      g.strokeStyle = v.col; g.lineWidth = 2.2; for (let k = -2; k < 8; k++) { g.beginPath(); g.moveTo(v.x - 4, v.y - v.alto + k * 5); g.lineTo(v.x + 4, v.y - v.alto + k * 5 + 4); g.stroke(); }
      g.restore();
      g.strokeStyle = TINTA; g.lineWidth = 1.2; g.strokeRect(v.x - 2.5, v.y - v.alto, 5, v.alto);
      g.strokeStyle = "#222"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(v.x, v.y - v.alto); g.lineTo(v.x, v.y - v.alto - 4); g.stroke();
    }
  }

  /* =====================================================================================
   * LUZ: oscuridad con la puerta, la rampa al encender, lámparas y bombillas
   * ===================================================================================== */
  const abrePuerta = t => salida(fase(t, T.puerta0, T.puerta1));
  const apagado = t => 1 - suave(fase(t, T.luz0, T.luz1));
  function calle(g, t) {
    const { x0, x1, y0, y1 } = PUERTA, a = abrePuerta(t);
    // la calle de noche al otro lado (farol cálido)
    if (a > 0.001) {
      const cg = g.createLinearGradient(x0, y0, x1, y1); cg.addColorStop(0, "#1c2c5a"); cg.addColorStop(0.6, "#36447a"); cg.addColorStop(1, "#d9a35c");
      g.fillStyle = cg; g.fillRect(x0, y0, x1 - x0, y1 - y0);
      const fl = g.createRadialGradient(x0 + 20, y1 - 120, 4, x0 + 20, y1 - 120, 120); fl.addColorStop(0, "rgba(255,214,140,0.95)"); fl.addColorStop(1, "rgba(255,190,110,0)");
      g.fillStyle = fl; g.fillRect(x0, y0, x1 - x0, y1 - y0);
      g.fillStyle = "#151a2e"; g.fillRect(x0 + 70, y0 + 60, 6, y1 - y0 - 60); g.fillRect(x0 + 62, y0 + 54, 22, 10);
      g.fillStyle = "#3a3f52"; g.fillRect(x0, y1 - 24, x1 - x0, 24);
    }
  }
  function hoja(g, t) {
    const { x0, x1, y0, y1 } = PUERTA, a = abrePuerta(t);
    // la hoja de la puerta (bisagra a la izquierda; se abre hacia dentro de la sala)
    const xf = lerp(x1, x0 - 44, a), yt = lerp(y0, y0 - 24, a), yb = lerp(y1, y1 + 28, a);
    g.fillStyle = mezclaColor("#6b3f22", "#4e2c16", a);
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(xf, yt); g.lineTo(xf, yb); g.lineTo(x0, y1); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    // cuarterones y pomo
    const q = (u, v) => P(lerp(x0, xf, u), lerp(lerp(y0, yt, u), lerp(y1, yb, u), v));
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 2;
    for (const [v0, v1] of [[0.08, 0.45], [0.55, 0.92]]) { const a0 = q(0.18, v0), a1 = q(0.82, v0), a2 = q(0.82, v1), a3 = q(0.18, v1); g.beginPath(); g.moveTo(a0.x, a0.y); g.lineTo(a1.x, a1.y); g.lineTo(a2.x, a2.y); g.lineTo(a3.x, a3.y); g.closePath(); g.stroke(); }
    const pm = q(0.86, 0.52); g.fillStyle = "#d8b354"; g.beginPath(); g.arc(pm.x, pm.y, 3.5, 0, TAU); g.fill();
  }
  const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mezclaColor = (a, b, k) => { const x = hexRgb(a), y = hexRgb(b); return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], k))).join(",")})`; };
  let MASCARA = null;
  function oscuridad(g, t, k) {
    if (k < 0.003) return;
    if (!MASCARA) MASCARA = lienzo(W / 2, H / 2);
    const m = MASCARA.getContext("2d"), a = abrePuerta(t), { x0, x1, y0, y1 } = PUERTA;
    m.setTransform(1, 0, 0, 1, 0, 0); m.globalCompositeOperation = "source-over"; m.clearRect(0, 0, W / 2, H / 2);
    m.fillStyle = "rgb(6,8,22)"; m.fillRect(0, 0, W / 2, H / 2);
    m.scale(0.5, 0.5); m.globalCompositeOperation = "destination-out";
    if (a > 0.001) {
      // el hueco de la puerta y el abanico de luz por el suelo y la pared
      m.fillStyle = `rgba(0,0,0,${0.5 * a})`; m.fillRect(x0 - 50, y0 - 20, x1 - x0 + 60, y1 - y0 + 20);
      const ab = m.createLinearGradient(0, y1, 0, H); ab.addColorStop(0, `rgba(0,0,0,${0.62 * a})`); ab.addColorStop(1, `rgba(0,0,0,${0.3 * a})`);
      m.fillStyle = ab; m.beginPath(); m.moveTo(x0 - 30, y1); m.lineTo(x1, y1); m.lineTo(640, H); m.lineTo(80, H); m.closePath(); m.fill();
      const ha = m.createRadialGradient(250, 430, 20, 250, 430, 300); ha.addColorStop(0, `rgba(0,0,0,${0.42 * a})`); ha.addColorStop(1, "rgba(0,0,0,0)");
      m.fillStyle = ha; m.fillRect(0, 0, W, H);
    }
    g.save(); g.globalAlpha = 0.93 * k; g.drawImage(MASCARA, 0, 0, W, H); g.restore();
  }
  // rendija de luz alrededor de la puerta cerrada
  function rendija(g, t, k) {
    const a = abrePuerta(t), v = k * (1 - a);
    if (v < 0.01) return;
    const { x0, x1, y0, y1 } = PUERTA;
    g.save(); g.globalAlpha = v; g.globalCompositeOperation = "lighter";
    const gr = g.createLinearGradient(0, y1 + 16, 0, y1 - 4); gr.addColorStop(0, "rgba(255,190,110,0)"); gr.addColorStop(1, "rgba(255,200,120,0.75)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(x0 - 10, y1 + 16); g.lineTo(x1 + 10, y1 + 16); g.lineTo(x1, y1); g.lineTo(x0, y1); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,214,150,0.95)"; g.fillRect(x0, y1 - 2, x1 - x0, 2); g.fillRect(x1 - 2, y0 + 4, 2, y1 - y0 - 4);
    g.fillStyle = "rgba(255,214,150,0.45)"; g.fillRect(x0, y0, x1 - x0, 1.5);
    g.restore();
  }
  const BOMBILLAS = (() => { const o = []; let n = 0; for (const c of CURVA_B) for (let i = 1; i < 13; i++) { const q = enCurva(c, i / 13); o.push({ x: q.x, y: q.y + 6, c: ["#ffe08a", "#ff9fb8", "#9fd8ff", "#b9ffa8"][n % 4], f: n++ }); } return o; })();
  function luces(g, t, encendida) {
    if (encendida < 0.003) return;
    g.save(); g.globalCompositeOperation = "lighter";
    for (const L of LAMPARAS) { g.globalAlpha = 0.85 * encendida; g.drawImage(capas.halo, L.x - 90, L.y - 70, 180, 180); }
    g.restore();
    // bulbos de las lámparas y bombillas de la guirnalda (parpadeo lento)
    g.save();
    for (const L of LAMPARAS) { g.globalAlpha = encendida; g.fillStyle = "#fff6d8"; g.beginPath(); g.ellipse(L.x, L.y + 8, 12, 5, 0, 0, Math.PI); g.fill(); }
    for (const b of BOMBILLAS) {
      const tw = 0.65 + 0.35 * Math.sin(t * 1.7 + b.f * 1.9);
      g.globalAlpha = encendida; g.fillStyle = "#3a2a1a"; g.fillRect(b.x - 1.5, b.y - 6, 3, 4);
      g.fillStyle = mezclaColor("#6a5a4a", b.c, tw); g.beginPath(); g.ellipse(b.x, b.y, 3.6, 4.6, 0, 0, TAU); g.fill();
    }
    g.globalCompositeOperation = "lighter";
    for (const b of BOMBILLAS) { const tw = 0.65 + 0.35 * Math.sin(t * 1.7 + b.f * 1.9); g.globalAlpha = 0.5 * encendida * tw; g.drawImage(capas.halo, b.x - 14, b.y - 14, 28, 28); }
    g.restore();
  }
  function interruptor(g, t) {
    const on = suave(fase(t, T.click - 0.03, T.click + 0.03));
    g.fillStyle = "#cfc4ad"; g.beginPath(); g.roundRect(INTERR.x - 3, INTERR.y - 7, 6, 14, 2); g.fill();
    g.fillStyle = "#fffaf0"; g.fillRect(INTERR.x - 2.5, lerp(INTERR.y + 1, INTERR.y - 6, on), 5, 5);
    g.strokeStyle = TINTA; g.lineWidth = 1; g.strokeRect(INTERR.x - 2.5, lerp(INTERR.y + 1, INTERR.y - 6, on), 5, 5);
  }
  function globos(g, t) {
    for (let i = 0; i < GLOBOS.length; i++) {
      const o = GLOBOS[i], x = o.x + 2.5 * Math.sin(t * 0.9 + i * 1.7), y = o.y + 3 * Math.sin(t * 1.3 + i * 2.3);
      g.strokeStyle = "rgba(240,240,240,0.8)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y + 32); g.quadraticCurveTo(lerp(x, o.nudo.x, 0.5) + 8, lerp(y, o.nudo.y, 0.6), o.nudo.x, o.nudo.y); g.stroke();
      g.drawImage(capas.globos[i], x - 32, y - 36);
    }
  }

  /* =====================================================================================
   * EL MATASUEGRAS (en la boca de Yorgi; se desenrolla al soplar; luego se le cae)
   * ===================================================================================== */
  const sopla = t => { let u = 0; for (const [a, b] of [[T.toot1, T.toot1b], [T.toot2, T.toot2b]]) u = Math.max(u, salida(fase(t, a, a + 0.1)) * (1 - suave(fase(t, b - 0.14, b)))); return u; };
  function matasuegras(g, M, ang, u, t, k) {
    const N = 20, Lt = 58 * k, l = Lt / N, dir = P(Math.cos(ang), Math.sin(ang));
    // boquilla
    const b0 = P(M.x - dir.x * 2 * k, M.y - dir.y * 2 * k), b1 = P(M.x + dir.x * 9 * k, M.y + dir.y * 9 * k);
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    g.strokeStyle = TINTA; g.lineWidth = 6.5 * k; g.beginPath(); g.moveTo(b0.x, b0.y); g.lineTo(b1.x, b1.y); g.stroke();
    g.strokeStyle = "#f6c234"; g.lineWidth = 4.2 * k; g.beginPath(); g.moveTo(b0.x, b0.y); g.lineTo(b1.x, b1.y); g.stroke();
    // el tubo de papel: enrollado (espiral hacia abajo) o estirado y temblando
    const pts = [b1]; let th = ang, q = b1;
    for (let i = 1; i <= N; i++) {
      const s = i / N;
      th = ang - (1 - u) * 11.5 * Math.pow(s, 1.7) + u * 0.06 * Math.sin(t * 38 + i * 0.9) * s;
      q = P(q.x + Math.cos(th) * l, q.y + Math.sin(th) * l); pts.push(q);
    }
    const ruta = () => { g.beginPath(); g.moveTo(pts[0].x, pts[0].y); for (const p of pts) g.lineTo(p.x, p.y); };
    ruta(); g.strokeStyle = TINTA; g.lineWidth = 8.4 * k; g.stroke();
    ruta(); g.strokeStyle = "#e8413c"; g.lineWidth = 6 * k; g.stroke();
    g.setLineDash([3.5 * k, 4.5 * k]); ruta(); g.strokeStyle = "#ffffff"; g.lineWidth = 6 * k; g.stroke(); g.setLineDash([]);
    // la borla del extremo
    if (u > 0.05) {
      const e = pts[N], a = th;
      g.strokeStyle = "#f6c234"; g.lineWidth = 1.6 * k; g.globalAlpha = clamp(u * 2);
      for (let j = -2; j <= 2; j++) { const aa = a + j * 0.35; g.beginPath(); g.moveTo(e.x, e.y); g.lineTo(e.x + Math.cos(aa) * 9 * k, e.y + Math.sin(aa) * 9 * k); g.stroke(); }
    }
    g.restore();
    return pts[N];
  }
  function rayitas(g, x, y, k, ang, n = 3, col = "#ffffff", r0 = 14, l = 12, w = 2.6) {
    if (k <= 0.01) return;
    g.save(); g.globalAlpha = clamp(k); g.strokeStyle = col; g.lineCap = "round"; g.lineWidth = w;
    for (let i = 0; i < n; i++) {
      const a = ang + (i - (n - 1) / 2) * 0.42, r = r0 + 4 * (1 - k);
      g.beginPath(); g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.lineTo(x + Math.cos(a) * (r + l), y + Math.sin(a) * (r + l)); g.stroke();
    }
    g.restore();
  }
  // el matasuegras cae de la boca (se calcula una vez la boca en ese instante)
  let CAIDA = null;
  function caidaCuerno(t) {
    if (!CAIDA) { const pY = poseY(T.cuerno), M = Y.aPantalla(pY, Y.boca(pY)); CAIDA = { M, k: pY.s / S }; }
    const v = t - T.cuerno, { M } = CAIDA, suelo = 588, tc = 0.4;
    if (v < tc) { const u = v / tc; return { x: M.x + 14 * u, y: lerp(M.y, suelo, u * u), a: Math.PI + 0.25 - 2.6 * u, u: 0 }; }
    const w = v - tc, bote = 9 * Math.abs(Math.sin(w * 11)) * Math.exp(-w * 7);
    return { x: M.x + 14 + 20 * salida(clamp(w / 0.7)), y: suelo - bote, a: Math.PI + 0.25 - 2.6 - 1.2 * salida(clamp(w / 0.7)), u: 0 };
  }

  /* =====================================================================================
   * CONFETI (partículas deterministas: rozamiento + vaivén; se quedan en el suelo y en la barra)
   * ===================================================================================== */
  const NCONF = 90, KR = 2.6, GR = 270;
  let CONF = null;
  function confPos(c, tau) {
    const e = 1 - Math.exp(-KR * tau);
    const x = c.x0 + c.vx * e / KR + c.sw * Math.sin(c.om * tau + c.fa) * (1 - Math.exp(-1.6 * tau));
    const y = c.y0 + (GR / KR) * tau + (c.vy - GR / KR) * e / KR;
    return P(x, y);
  }
  const caeEn = (c, x) => x > BARRA.x0 - 6 ? BARRA.top - 2 + 7 * c.h3 : 566 + 26 * c.h3;
  function preparaConfeti() {
    const pY = poseY(T.confeti + 0.04);
    const mL = Y.aPantalla(pY, pY.manoLejos), mC = Y.aPantalla(pY, pY.manoCerca);
    CONF = [];
    for (let i = 0; i < NCONF; i++) {
      const h1 = hash(i * 7.13 + 1), h2 = hash(i * 3.71 + 2), h3 = hash(i * 9.17 + 3), h4 = hash(i * 1.93 + 4), h5 = hash(i * 5.3 + 5);
      const de = i % 2 ? mL : mC, lado = i % 2 ? -1 : 1;
      const ang = -Math.PI / 2 + lado * (0.08 + 0.95 * h1), v = 380 + 420 * h2;
      const c = { x0: de.x + (h3 - 0.5) * 12, y0: de.y + (h4 - 0.5) * 10, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, t0: T.confeti + 0.1 * h5,
        col: COLORES[i % COLORES.length], w: 5 + 3 * h3, h: 3 + 1.6 * h4, giro: 5 + 9 * h1, fa: TAU * h2, sw: 8 + 16 * h4, om: 2.2 + 2.2 * h5, h3, tl: 99 };
      // cuándo y dónde se posa
      let prev = confPos(c, 0);
      for (let tau = 0.02; tau < 14; tau += 0.02) {
        const q = confPos(c, tau);
        if (q.y > prev.y && q.y >= caeEn(c, q.x)) { c.tl = tau; c.xl = q.x; c.yl = caeEn(c, q.x); break; }
        prev = q;
      }
      CONF.push(c);
    }
  }
  function confeti(g, t, posado, enBarra) {
    if (t < T.confeti) return;
    if (!CONF) preparaConfeti();
    g.save();
    for (const c of CONF) {
      const tau = t - c.t0; if (tau <= 0) continue;
      const quieto = tau >= c.tl;
      if (quieto !== posado) continue;
      if (posado && (c.yl < 400) !== enBarra) continue;
      let x, y, rot, fl;
      if (quieto) { x = c.xl; y = c.yl; rot = c.fa; fl = 0.45; }
      else { const q = confPos(c, tau); x = q.x; y = q.y; rot = c.fa + c.giro * tau; fl = Math.cos(rot * 0.7 + c.om * tau); }
      const kin = clamp(tau / 0.1);
      g.fillStyle = c.col;
      g.save(); g.translate(x, y); g.rotate(rot);
      const w = c.w * kin, h = c.h * kin * (quieto ? 0.55 : Math.max(0.15, Math.abs(fl)));
      g.fillRect(-w / 2, -h / 2, w, h);
      g.restore();
    }
    g.restore();
  }

  /* =====================================================================================
   * LÁGRIMAS: dos chorros en arco, salpicaduras, charcos; vapor y humo en las velas
   * ===================================================================================== */
  const flujo = t => clamp(fase(t, T.llora, T.llora + 0.26));
  const corte = t => entrada(clamp(fase(t, T.seca, T.seca + 0.34)));
  function ojosG(pG) {
    const H = G.cabeza(pG);
    return { d: G.aPantalla(pG, H.a({ x: 736, y: 560 })), i: G.aPantalla(pG, H.a({ x: 920, y: 618 })) };
  }
  // dónde cae cada chorro
  const CAE_IZQ = (() => {
    const L = [[T.llora, P(212, 584)], [T.alza0 + 0.04, P(210, 584)], [T.alza1 + 0.02, P(180, 394)], [T.velas[0] - 0.04, P(VELAS[0].x + 2, VELAS[0].y - VELAS[0].alto - 4)]];
    for (let i = 0; i < 5; i++) {
      const v = VELAS[i], q = P(v.x + 2, v.y - v.alto - 4);
      L.push([T.velas[i] + 0.1, q]);
      if (i < 4) { const w = VELAS[i + 1]; L.push([T.velas[i + 1] - 0.04, P(w.x + 2, w.y - w.alto - 4)]); }
    }
    L.push([T.seca, P(VELAS[4].x + 8, TARTA.base - TARTA.h + 2)]);
    return L;
  })();
  const CAE_DER = [[T.llora, P(412, 582)], [T.alza0 + 0.02, P(412, 582)], [T.alza1 + 0.06, P(612, 566)], [DUR, P(612, 566)]];
  function chorro(g, E, Lp, arco, t, u0, u1, a0, a1, sem, fuera = 0) {
    if (u1 - u0 < 0.005) return;
    const C = P(lerp(E.x, Lp.x, 0.3) + fuera, Math.min(E.y, Lp.y) - arco);
    const N = 24, izq = [], der = [], cen = [];
    for (let i = 0; i <= N; i++) {
      const u = lerp(u0, u1, i / N), a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u;
      const x = a * E.x + b * C.x + c * Lp.x, y = a * E.y + b * C.y + c * Lp.y;
      const dx = 2 * (1 - u) * (C.x - E.x) + 2 * u * (Lp.x - C.x), dy = 2 * (1 - u) * (C.y - E.y) + 2 * u * (Lp.y - C.y), d = Math.hypot(dx, dy) || 1;
      const w = Math.max(0.6, (lerp(a0, a1, u) + 0.9 * Math.sin(u * 15 - t * 24 + sem)) / 2);
      izq.push(P(x - dy / d * w, y + dx / d * w)); der.push(P(x + dy / d * w, y - dx / d * w)); cen.push(P(x - dy / d * w * 0.35, y + dx / d * w * 0.35));
    }
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.beginPath(); g.moveTo(izq[0].x, izq[0].y); for (const q of izq) g.lineTo(q.x, q.y); for (let i = der.length - 1; i >= 0; i--) g.lineTo(der[i].x, der[i].y); g.closePath();
    g.fillStyle = "#a6dcff"; g.fill(); g.strokeStyle = "#2a6c96"; g.lineWidth = 1.5; g.stroke();
    // corriente: rayitas blancas que viajan por el chorro
    g.beginPath(); g.moveTo(cen[0].x, cen[0].y); for (const q of cen) g.lineTo(q.x, q.y);
    g.setLineDash([7, 10]); g.lineDashOffset = -t * 150 + sem * 7; g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 1.6; g.stroke(); g.setLineDash([]);
    g.restore();
  }
  function gota(g, x, y, r, ang) {
    g.save(); g.translate(x, y); g.rotate(ang - Math.PI / 2);
    g.beginPath(); g.moveTo(0, -r * 2.1); g.quadraticCurveTo(r * 1.1, -r * 0.2, 0, r); g.quadraticCurveTo(-r * 1.1, -r * 0.2, 0, -r * 2.1);
    g.fillStyle = "#a6dcff"; g.fill(); g.strokeStyle = "#2a6c96"; g.lineWidth = 1.1; g.stroke();
    g.restore();
  }
  function salpica(g, Lp, t, k, sem, ancho = 1) {
    if (k < 0.02) return;
    g.save(); g.globalAlpha = clamp(k);
    for (let j = 0; j < 6; j++) {
      const ph = (t * 3.1 + j / 6 + sem) % 1, vx = (j % 2 ? 1 : -1) * (20 + 26 * hash(j + sem * 9)) * ancho, vy = 60 + 40 * hash(j * 3 + sem);
      const x = Lp.x + vx * ph, y = Lp.y - vy * ph + 160 * ph * ph;
      gota(g, x, y, 2.4 * (1 - 0.5 * ph), Math.atan2(-vy + 320 * ph, vx));
    }
    g.restore();
  }
  function charco(g, x, y, rx, ry) {
    if (rx < 1) return;
    g.save();
    g.fillStyle = "rgba(150,210,245,0.55)"; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill();
    g.strokeStyle = "rgba(42,108,150,0.55)"; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.5)"; g.beginPath(); g.ellipse(x - rx * 0.3, y - ry * 0.25, rx * 0.35, ry * 0.25, 0, 0, TAU); g.fill();
    g.restore();
  }
  function charcos(g, t) {
    if (t < T.llora) return;
    // charco izquierdo (mientras llora de pie) y derecho (todo el rato)
    const kI = salida(clamp(fase(t, T.llora + 0.15, T.alza1)));
    charco(g, 212, 585, 30 * kI, 7 * kI);
    const kD0 = salida(clamp(fase(t, T.llora + 0.2, T.alza0 + 0.1)));
    charco(g, 414, 584, 26 * kD0, 6 * kD0);
    const kD = salida(clamp(fase(t, T.alza1, T.seca + 0.3)));
    charco(g, 608, 568, 40 * kD, 8 * kD);
  }
  // vapor (¡psss!) y humo al apagarse cada vela
  function vapor(g, x, y, t, t0) {
    const v = t - t0; if (v < 0 || v > 1.0) return;
    g.save();
    for (let k = 0; k < 5; k++) {
      const w = v - k * 0.04; if (w < 0) continue;
      const u = clamp(w / 0.9);
      g.globalAlpha = 0.75 * (1 - u) * clamp(w / 0.05);
      g.fillStyle = "#ffffff"; g.beginPath(); g.arc(x + (k - 2) * 4 * (0.4 + u), y - 6 - 34 * salida(u) - k * 2, 3 + 9 * u, 0, TAU); g.fill();
    }
    // las tres rayitas onduladas del siseo
    const s = clamp(v / 0.45); if (s < 1) {
      g.globalAlpha = Math.sin(Math.PI * s); g.strokeStyle = "#ffffff"; g.lineWidth = 1.8; g.lineCap = "round";
      for (const a of [-2.3, -1.57, -0.84]) {
        g.beginPath();
        for (let j = 0; j <= 6; j++) { const r = 8 + 12 * s + j * 2.4, o = (j % 2 ? 2.2 : -2.2); g.lineTo(x + Math.cos(a) * r - Math.sin(a) * o, y - 6 + Math.sin(a) * r + Math.cos(a) * o); }
        g.stroke();
      }
    }
    g.restore();
  }
  function humo(g, x, y, t, t0, i) {
    const v = t - t0; if (v < 0) return;
    const crece = salida(clamp(v / 0.7)), a = 0.55 * (1 - 0.75 * clamp((v - 0.8) / 3)) * clamp(v / 0.1);
    g.save(); g.lineCap = "round";
    const n = 12;
    for (let j = 0; j < n; j++) {
      const s0 = j / n, s1 = (j + 1) / n;
      const p0 = P(x + 5 * Math.sin(s0 * 5 - v * 2.4 + i) * s0, y - s0 * 62 * crece), p1 = P(x + 5 * Math.sin(s1 * 5 - v * 2.4 + i) * s1, y - s1 * 62 * crece);
      g.globalAlpha = a * (1 - s0); g.strokeStyle = "#cfd3da"; g.lineWidth = 2.4 - 1.2 * s0;
      g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.stroke();
    }
    g.restore();
  }
  function llamas(g, t) {
    for (let i = 0; i < VELAS.length; i++) {
      const v = VELAS[i], apaga = T.velas[i], k = 1 - clamp(fase(t, apaga - 0.02, apaga + 0.06));
      if (k <= 0) continue;
      const fx = v.x + 1.2 * Math.sin(t * 9 + i * 2.1), fy = v.y - v.alto - 4, h = (9 + 1.4 * Math.sin(t * 23 + i) + 0.9 * Math.sin(t * 37 + i * 2)) * k;
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.55 * k; g.drawImage(capas.halo, fx - 16, fy - 18, 32, 32); g.restore();
      g.fillStyle = "#ff9a2e"; g.beginPath(); g.moveTo(fx, fy - h); g.quadraticCurveTo(fx + 4.4 * k, fy - h * 0.2, fx, fy + 2.5 * k); g.quadraticCurveTo(fx - 4.4 * k, fy - h * 0.2, fx, fy - h); g.fill();
      g.fillStyle = "#fff2a8"; g.beginPath(); g.moveTo(fx, fy - h * 0.6); g.quadraticCurveTo(fx + 2.2 * k, fy - h * 0.05, fx, fy + 1.6 * k); g.quadraticCurveTo(fx - 2.2 * k, fy - h * 0.05, fx, fy - h * 0.6); g.fill();
    }
  }
  // la tarta mojada: brillo azulado y gotas que resbalan
  function tartaMojada(g, t) {
    let n = 0; for (const tv of T.velas) n += clamp(fase(t, tv, tv + 0.4));
    if (n < 0.01) return;
    const k = n / 5, { x, base, rx, h, ry } = TARTA, top = base - h;
    g.save();
    g.fillStyle = `rgba(150,210,250,${0.4 * k})`; g.beginPath(); g.ellipse(x - 6, top, rx * 0.8, ry * 0.7, 0, 0, TAU); g.fill();
    g.fillStyle = `rgba(255,255,255,${0.6 * k})`; g.beginPath(); g.ellipse(x - 16, top - 2, 10, 2.5, 0, 0, TAU); g.fill();
    for (let j = 0; j < 4; j++) {
      const dx = [-30, -8, 18, 34][j], lv = clamp(n - j - 0.5);
      if (lv <= 0) continue;
      const ly = top + 6 + (h - 4) * salida(lv);
      g.strokeStyle = "rgba(120,190,240,0.7)"; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x + dx, top + 6); g.lineTo(x + dx, ly); g.stroke();
      g.fillStyle = "rgba(120,190,240,0.85)"; g.beginPath(); g.arc(x + dx, ly, 2, 0, TAU); g.fill();
    }
    g.restore();
  }
  // lagrimones asomando antes de romper a llorar
  function lagrimones(g, pG, t) {
    const k = dentro(t, T.conmueve + 0.1, T.quiebra + 0.1, T.llora, T.llora + 0.05);
    if (k < 0.02) return;
    const o = ojosG(pG), kk = pG.s / S;
    g.save(); g.globalAlpha = k;
    for (const q of [o.d, o.i]) { g.fillStyle = "rgba(170,220,255,0.85)"; g.beginPath(); g.ellipse(q.x + (q === o.d ? 10 : -8) * kk, q.y + 4 * kk, 9 * kk, 3.2 * kk, 0, 0, TAU); g.fill(); }
    g.restore();
  }

  /* ---------- sombras en el suelo ---------- */
  function sombra(g, x, y, w, a) { if (a < 0.01) return; g.fillStyle = `rgba(20,10,4,${a})`; g.beginPath(); g.ellipse(x, y, w, w * 0.16, 0, 0, TAU); g.fill(); }

  /* ---------- cámara (quieta mientras está oscuro; se abre al levantarle en volandas) ---------- */
  const PLANOS = [[0, 1, 512, 300], [T.aww, 1, 512, 300], [T.alza0 + 0.1, 0.92, 490, 288], [T.alza1 + 0.4, 0.88, 482, 284],
    [T.risa0, 0.885, 474, 284], [T.camara, 0.9, 470, 286], [DUR, 0.905, 470, 286]];
  function camara(t) {
    let i = 0; while (i < PLANOS.length - 2 && t > PLANOS[i + 1][0]) i++;
    const a = PLANOS[i], b = PLANOS[i + 1], k = suave(fase(t, a[0], b[0]));
    return { k: lerp(a[1], b[1], k), x: lerp(a[2], b[2], k), y: lerp(a[3], b[3], k) };
  }

  const pose = t => ({ g: poseGcache(t), y: poseY(t) });
  class GuillermoYorgiSorpresa extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Y.listo()) return;
      if (!capas) capas = crea();
      const pG = poseGcache(t), pY = poseY(t);
      const luz = tramo(t, NEGRO_INICIO, 0.55, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const osc = apagado(t), enc = 1 - osc;
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      MATRIZ = g.getTransform();
      g.drawImage(capas.fondo, -OX, -OY);
      luces(g, t, enc);
      calle(g, t);
      const verG = t >= T.cruza;
      if (verG || t < T.puerta0) hoja(g, t);
      interruptor(g, t);
      globos(g, t);
      // suelo: charcos, confeti posado, sombras, matasuegras caído
      charcos(g, t);
      confeti(g, t, true, false);
      if (verG) sombra(g, pG.x + 4, ySobre(RUTA_G, pG.x) + 2, 46 * pG.s / S * (1 - 0.4 * clamp(alzaG(t) / ALTO)), 0.3 * (1 - 0.5 * clamp(alzaG(t) / ALTO)));
      if (pY.x < BARRA.x0 + 40) sombra(g, pY.x - 4, ySobre(RUTA_Y, pY.x) + 2, 50 * pY.s / S, 0.3);
      const cae = t >= T.cuerno ? caidaCuerno(t) : null;
      if (cae && t > T.cuerno + 0.4) matasuegras(g, cae, cae.a, 0, t, 0.95);
      // Guillermo (en la puerta va recortado por el hueco y la hoja le tapa)
      if (!verG && t >= T.puerta0) {
        g.save(); g.beginPath(); g.rect(PUERTA.x0, PUERTA.y0, PUERTA.x1 - PUERTA.x0, PUERTA.y1 - PUERTA.y0 + 8); g.clip();
        G.dibujar(g, pG, t); g.restore();
        hoja(g, t);
      }
      if (verG) G.dibujar(g, pG, t);
      lagrimones(g, pG, t);
      // la mesa con la tarta (Guillermo pasa por detrás)
      g.drawImage(capas.mesa, MESA.x - 90, MESA.y - 74);
      tartaMojada(g, t);
      llamas(g, t);
      // lágrimas: el chorro derecho se va por detrás de Yorgi
      const fl = flujo(t), co = corte(t);
      const ojo = ojosG(pG);
      if (fl > 0 && co < 1) {
        const LpD = recorrido2(CAE_DER, t);
        chorro(g, P(ojo.i.x + 3, ojo.i.y - 2), LpD, lerp(150, 100, clamp(alzaG(t) / ALTO)), t, co, fl, 5, 9, 1.3, 30);
        salpica(g, LpD, t, fl * (1 - co), 0.3);
      }
      Y.dibujar(g, pY, t);
      // matasuegras en la boca (o cayendo)
      if (t < T.cuerno) { const M = Y.aPantalla(pY, Y.boca(pY)), k = pY.s / S; const an = Math.PI + (t < T.sale0 ? 0.3 : 0.58), fin = matasuegras(g, M, an, sopla(t), t, k);
        const tu = Math.max(campana(t, T.toot1 + 0.04, T.toot1 + 0.4), campana(t, T.toot2 + 0.04, T.toot2 + 0.36)); rayitas(g, fin.x, fin.y, tu, an, 3, "#ffffff", 6, 8, 2.2); }
      else if (t <= T.cuerno + 0.4) matasuegras(g, cae, cae.a, 0, t, 0.95);
      // la barra tapa a Yorgi mientras está detrás
      g.drawImage(capas.barra, BARRA.x0 - 20, BARRA.top - 100);
      confeti(g, t, true, true);
      // la mano de Guillermo encima del pelo de Yorgi
      if (t > T.abraza - 0.06) { g.save(); g.globalAlpha = tramo(t, T.abraza - 0.06, T.abraza + 0.04); manosEncima(g, G, pG, ["lejos"]); g.restore(); }
      // el chorro izquierdo, hacia la tarta (por delante)
      if (fl > 0 && co < 1) {
        const LpI = recorrido2(CAE_IZQ, t), alt = clamp(alzaG(t) / ALTO);
        chorro(g, P(ojo.d.x - 3, ojo.d.y - 2), LpI, lerp(84, 64, alt), t, co, fl, 5, 8.5, 0, -lerp(46, 10, alt));
        salpica(g, LpI, t, fl * (1 - co), 0.7, lerp(1, 0.7, alt));
      }
      for (let i = 0; i < VELAS.length; i++) { const v = VELAS[i]; vapor(g, v.x, v.y - v.alto - 2, t, T.velas[i]); humo(g, v.x, v.y - v.alto - 4, t, T.velas[i] + 0.12, i); }
      confeti(g, t, false, false);
      g.restore();
      // la oscuridad (antes de encender) y lo que se ve en ella
      oscuridad(g, t, osc);
      rendija(g, t, osc);
      ojosOscuridad(g, t, pY, osc);
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  // los ojos de Yorgi brillando por encima de la barra
  function ojosOscuridad(g, t, pY, osc) {
    const k = osc * dentro(t, T.ojos0 + 0.1, T.ojos0 + 0.3, T.agacha0 + 0.04, T.agacha1);
    if (k < 0.01) return;
    const H = Y.cabeza(pY), parp = parpadeo(t, T.parpY);
    g.save(); g.globalAlpha = k;
    for (const [q, r] of [[{ x: 790, y: 496 }, 1], [{ x: 944, y: 551 }, 0.9]]) {
      const c = Y.aPantalla(pY, H.a(q));
      if (c.y > BARRA.top - 1) continue;
      const ry = 5.2 * r * (1 - parp);
      g.save(); g.beginPath(); g.rect(c.x - 10, c.y - 10, 20, BARRA.top - c.y + 10); g.clip();
      g.fillStyle = "#f4f1e8"; g.beginPath(); g.ellipse(c.x, c.y, 6.2 * r, Math.max(0.4, ry), 0, 0, TAU); g.fill();
      if (ry > 1.5) { g.fillStyle = "#120a06"; g.beginPath(); g.arc(c.x - 2, c.y + 0.6, Math.min(2.6, ry * 0.6), 0, TAU); g.fill(); }
      g.restore();
    }
    g.restore();
  }
  registrar({ id: "00137", nombre: "Guillermo y Yorgi · La sorpresa", crear: () => new GuillermoYorgiSorpresa() });
  window.__A2D_00137 = { pose, T, DUR };
})();
