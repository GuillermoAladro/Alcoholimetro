"use strict";
/* 00037 · Guillermo y Ander · El abrazo de oso
 *
 * Negro → sidrería de piedra con barricas gigantes y faroles. Guillermo espera aburrido dando
 * golpecitos con el pie → entra Ander por la derecha con las manos en los bolsillos → se reconocen:
 * se señalan con el dedo, se les ilumina la cara y abren los brazos → corren a abrazarse → Ander le da
 * un abrazo de oso: se agacha, lo rodea y lo levanta del suelo → lo mece feliz con los ojos cerrados
 * mientras Guillermo, con los ojos fuera de las órbitas, los mofletes hinchados y cada vez más rojo,
 * patalea en el aire; a cada apretón le crujen las costillas (rayitas y estrellas en la espalda) →
 * Ander lo deja en el suelo y se aparta tan contento → Guillermo se queda estrujado, estrecho como un
 * tubo de pasta de dientes, con los brazos pegados al cuerpo… parpadea → ¡boing!, recupera la forma
 * de golpe con un rebote → se tambalea con estrellitas → levanta el pulgar a cámara, tembloroso; Ander
 * se ríe… y vuelve a abrir los brazos para otro abrazo → Guillermo se echa atrás con las palmas en
 * alto → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto. Mientras lo abraza, las manos de Ander se calculan en
 * cada fotograma sobre la espalda de Guillermo (ya estrujado y mecido): nunca resbalan. El brazo
 * lejano de Ander pasa por detrás de Guillermo (se dibuja antes que él); el cercano, por delante.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, AN = Ander, R = Recortes;
  const S = 0.28, SUELO = 582;
  const DUR = 13.8;
  const T = {
    mira: 0.45, tap0: 0.5, tap1: 1.45,
    llega0: 0.25, llega1: 2.05,
    ve: 1.45, reconoce: 1.72, veA: 2.02,
    senala0: 2.2, senala1: 2.42, chispa: 2.45, senalaFin: 2.85,
    abre0: 2.88, abre1: 3.2,
    corre0: 3.3, corre1: 4.22,
    abraza0: 4.12, abraza1: 4.36, alza0: 4.28, alza1: 4.7, aprieta: 4.8,
    mece0: 5.05, mece1: 7.6, camaraG: 6.2,
    baja0: 7.6, baja1: 8.05,
    suelta0: 8.02, suelta1: 8.32, atras0: 8.15, atras1: 8.62,
    flaco: 8.1, extrana: 8.75, parp1: 8.95, parp2: 9.25,
    pop: 9.6,
    tamb0: 10.12, tamb1: 11.0,
    pulgar0: 11.05, pulgar1: 11.35, risa0: 11.25,
    otro0: 12.0, otro1: 12.4, no0: 12.2, no1: 12.52,
    fin: 13.05
  };
  const PERIODO = 1.2;                                        // mecida de Ander
  const PULSOS = [T.aprieta, T.mece0 + 0.3, T.mece0 + 0.9, T.mece0 + 1.5, T.mece0 + 2.1];   // apretones (picos de la mecida)
  const PESO_PULSO = [0.26, 0.2, 0.2, 0.18, 0.16];
  const ESTRECHO = 0.38;                                      // cuánto se estrecha Guillermo (0,62 de ancho)
  const XG0 = 300, XG_H = 452;                                // Guillermo: esperando y abrazado
  let DX_H = 62, ALZA = 100;                                  // Ander respecto a Guillermo en el abrazo; altura a la que lo levanta (px)

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const mezclaD = (a, b, k) => { const o = {}; for (const n of ["pulgar", "indice", "medio", "anular", "menique"]) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const ABIERTA = D(1, 1), PUNO = D(0, 0), SENALA = D(0.25, 1, 0, 0, 0), PULGAR = D(1, 0), RELAJADA = D(0.55, 0.6, 0.55, 0.5, 0.45);

  /* ---------- caras (los dos usan los mismos campos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.15, dientes: 1, lengua: 0, esp: 0, mof: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: Math.max(e.c, parp), i: Math.max(e.c, parp), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* ---------- pasos (x de pantalla de cada tobillo) ---------- */
  function pie(lista, t, alto = 34) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    const arco = Math.sin(Math.PI * u);
    return { x: lerp(xa, x, suave5(u)), alza: alto * arco, ang: -0.15 * arco, u };
  }

  /* =====================================================================================
   * GUILLERMO (a la izquierda, mira a la derecha)
   * ===================================================================================== */
  const PASOS_G = {
    lejos: [[-10, -9, XG0 + 18], [T.corre0, T.corre0 + 0.22, XG0 + 95], [T.corre0 + 0.32, T.corre0 + 0.54, XG_H + 18],
            [T.tamb0 + 0.12, T.tamb0 + 0.3, XG_H - 2], [T.tamb0 + 0.55, T.tamb0 + 0.73, XG_H + 26], [T.tamb1 - 0.12, T.tamb1 + 0.04, XG_H + 16]],
    cerca: [[-10, -9, XG0 - 18], [T.corre0 + 0.16, T.corre0 + 0.38, XG0 + 62], [T.corre0 + 0.48, T.corre0 + 0.7, XG_H - 18],
            [T.tamb0, T.tamb0 + 0.18, XG_H - 46], [T.tamb0 + 0.38, T.tamb0 + 0.56, XG_H - 16], [T.tamb0 + 0.75, T.tamb0 + 0.93, XG_H - 22],
            [T.no0, T.no0 + 0.24, XG_H - 66]]
  };
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const CARAS_G = {
    inicio: E({ mx: 0.4, my: -0.3, c: 0.3, sd: -2, gd: -0.04, si: 2, gi: 0.02, sonr: -0.05, ancho: 0.85 }),
    aburre: E({ mx: -0.85, my: 0.05, c: 0.45, sd: -4, gd: -0.06, si: 6, gi: 0.08, sonr: -0.2, ancho: 0.8 }),
    mira: E({ mx: 0.9, my: 0, c: 0.2, sd: 2, gd: 0.02, si: 2, gi: 0.02, sonr: 0, ancho: 0.85 }),
    reconoce: E({ mx: 0.9, my: -0.1, iris: 0.85, sd: 26, gd: 0.15, si: 26, gi: 0.15, abre: 36, ancho: 0.8, sonr: 0.2, lengua: 0.2 }),
    alegre: E({ mx: 0.9, my: -0.1, c: 0.35, h: 1, sd: 20, gd: 0.15, si: 20, gi: 0.15, abre: 34, ancho: 1.2, sonr: 1, lengua: 0.3 }),
    corre: E({ mx: 0.9, my: 0, c: 0.15, h: 0.5, sd: 18, gd: 0.12, si: 18, gi: 0.12, abre: 26, ancho: 1.15, sonr: 0.95 }),
    abrazo: E({ mx: 0.9, my: 0, c: 0.85, h: 1, sd: 12, gd: 0.1, si: 12, gi: 0.1, abre: 12, ancho: 1.1, sonr: 0.9 }),
    aprieta: E({ mx: 0.3, my: 0, iris: 0.5, sd: 30, gd: 0.18, si: 30, gi: 0.18, abre: 0, ancho: 0.55, sonr: -0.45, mof: 1 }),
    camara: E({ mx: -0.85, my: -0.1, iris: 0.5, sd: 34, gd: 0.25, si: 30, gi: 0.2, abre: 0, ancho: 0.5, sonr: -0.6, mof: 1 }),
    flaco: E({ mx: 0, my: 0, iris: 0.7, sd: 18, gd: 0.05, si: 18, gi: 0.05, abre: 10, ancho: 0.45, sonr: -0.2, lengua: 0 }),
    pop: E({ mx: 0, my: 0, iris: 0.8, sd: 28, gd: 0.15, si: 28, gi: 0.15, abre: 40, ancho: 0.8, sonr: -0.1, lengua: 0.4 }),
    mareo: E({ mx: 0, my: 0, esp: 1, sd: 12, gd: 0.2, si: -6, gi: -0.1, abre: 16, ancho: 0.85, sonr: -0.1, lengua: 0.8 }),
    pulgar: E({ mx: -0.85, my: -0.05, c: 0.25, esp: 0.15, sd: 10, gd: 0.15, si: 2, gi: 0, abre: 8, ancho: 1.2, sonr: 0.75, lengua: 0 }),
    horror: E({ mx: 0.9, my: -0.05, iris: 0.6, sd: 30, gd: 0.2, si: 30, gi: 0.2, abre: 34, ancho: 0.85, sonr: -0.7, lengua: 0 })
  };
  const GUION_CARA_G = [
    [T.mira, T.mira + 0.25, "aburre"], [T.tap1 - 0.2, T.ve, "mira"], [T.reconoce, T.reconoce + 0.1, "reconoce"],
    [T.senala0, T.senala0 + 0.2, "alegre"], [T.corre0, T.corre0 + 0.2, "corre"], [T.abraza0, T.abraza0 + 0.2, "abrazo"],
    [T.aprieta - 0.02, T.aprieta + 0.08, "aprieta"], [T.camaraG, T.camaraG + 0.25, "camara"], [T.camaraG + 0.9, T.camaraG + 1.1, "aprieta"],
    [T.flaco, T.flaco + 0.2, "flaco"], [T.pop, T.pop + 0.08, "pop"], [T.tamb0, T.tamb0 + 0.25, "mareo"],
    [T.pulgar0, T.pulgar0 + 0.3, "pulgar"], [T.no0 - 0.08, T.no0 + 0.08, "horror"]
  ];
  // cuerpo: pel (hoja, + abajo), torso (+ = hacia delante), cab
  const CUERPOS_G = {
    inicio: { pel: 0, torso: -0.02, cab: 0 },
    mira: { pel: 0, torso: 0.02, cab: 0.03 },
    alegre: { pel: -10, torso: -0.05, cab: -0.06 },
    corre: { pel: 10, torso: 0.1, cab: -0.02 },
    abrazo: { pel: -20, torso: 0.06, cab: -0.08 },
    alzado: { pel: 0, torso: 0.04, cab: -0.1 },
    flaco: { pel: -10, torso: 0, cab: 0 },
    tamb: { pel: 12, torso: 0, cab: 0 },
    pulgar: { pel: 0, torso: -0.03, cab: -0.04 },
    no: { pel: 8, torso: -0.16, cab: -0.1 }
  };
  const GUION_CUERPO_G = [
    [T.ve - 0.1, T.ve + 0.2, "mira"], [T.reconoce, T.reconoce + 0.18, "alegre"], [T.corre0 - 0.05, T.corre0 + 0.2, "corre"],
    [T.abraza0, T.abraza1, "abrazo"], [T.alza0, T.alza1, "alzado"], [T.baja1 - 0.1, T.baja1 + 0.1, "flaco"],
    [T.tamb0, T.tamb0 + 0.2, "tamb"], [T.pulgar0, T.pulgar0 + 0.3, "pulgar"], [T.no0, T.no0 + 0.25, "no"]
  ];
  const R_M = G.MUNECA_R * G.JK;
  const manoDesde = (m, a, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, a); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_C = manoDesde({ x: 131, y: 652 }, 0, -1.75), BOLS_L = manoDesde({ x: 372, y: 648 }, 0, -1.75);

  /* ---------- estrujado: ancho de Guillermo (1 normal) ---------- */
  function acumulado(t) { let a = 0; PULSOS.forEach((p, i) => { a += PESO_PULSO[i] * suave(fase(t, p, p + 0.14)); }); return a; }
  function anchoG(t) {
    if (t < T.pop) {
      const a = acumulado(t);
      return 1 - ESTRECHO * a + 0.006 * Math.sin(t * 7) * tramo(t, T.flaco, T.flaco + 0.3);
    }
    // ¡boing! muelle amortiguado que sale con velocidad 0 (sin salto)
    const u = t - T.pop, z = 3.4, w = 16;
    return 1 - ESTRECHO * Math.exp(-z * u) * (Math.cos(w * u) + (z / w) * Math.sin(w * u));
  }
  const pulso = t => { let s = 0; for (const p of PULSOS) if (t >= p) s += Math.exp(-(t - p) * 7) * suave(fase(t, p, p + 0.05)); return s; };

  /* ---------- mecida de Ander (ángulo del torso en su hoja) ---------- */
  const envMece = t => dentro(t, T.mece0 - 0.1, T.mece0 + 0.3, T.mece1 - 0.3, T.mece1);
  const mecida = t => 0.075 * Math.sin(2 * Math.PI * (t - T.mece0) / PERIODO) * envMece(t);

  /* =====================================================================================
   * ANDER (a la derecha, en espejo: mira a la izquierda)
   * ===================================================================================== */
  const TOB_A = AN.SUELO - AN.TOBILLO_ALTO;
  const XA_IN = 1140, XA_STOP = 760;
  let PASOS_A = null;
  function pasosA() {
    const XH = XG_H + DX_H, XAT = XH + 104, XOT = XAT - 22;
    const l = [], c = [];
    // entra andando desde fuera de plano (6 pasos)
    const n = 6, dt = (T.llega1 - T.llega0) / n;
    l.push([-10, -9, XA_IN - 20]); c.push([-10, -9, XA_IN + 20]);
    for (let i = 0; i < n; i++) {
      const t0 = T.llega0 + i * dt, x = lerp(XA_IN, XA_STOP, (i + 1) / n);
      (i % 2 ? c : l).push([t0, t0 + dt * 0.92, x + (i % 2 ? 20 : -20) + (i === n - 1 || i === n - 2 ? 0 : (i % 2 ? -26 : -26))]);
    }
    // corre al abrazo (4 pasos)
    const m = 4, dm = (T.corre1 - T.corre0) / m;
    for (let i = 0; i < m; i++) {
      const t0 = T.corre0 + i * dm, x = lerp(XA_STOP, XH, (i + 1) / m);
      (i % 2 ? c : l).push([t0, t0 + dm * 0.95, x + (i % 2 ? 22 : -22)]);
    }
    // se aparta (2 pasos atrás) y vuelve con los brazos abiertos (1 paso)
    c.push([T.atras0, T.atras0 + 0.24, XAT + 22]); l.push([T.atras0 + 0.18, T.atras1, XAT - 22]);
    l.push([T.otro0, T.otro0 + 0.24, XOT - 22]); c.push([T.otro0 + 0.12, T.otro0 + 0.36, XOT + 22]);
    PASOS_A = { lejos: l, cerca: c, XH, XAT };
  }
  const CARAS_A = {
    inicio: E({ mx: 0.85, my: 0.05, c: 0.25, sd: 2, gd: 0.02, si: 4, gi: 0.04, sonr: 0.25, ancho: 0.9 }),
    ve: E({ mx: 0.9, my: 0, iris: 0.9, sd: 24, gd: 0.14, si: 24, gi: 0.14, abre: 22, ancho: 0.85, sonr: 0.45 }),
    alegre: E({ mx: 0.9, my: -0.1, c: 0.4, h: 1, sd: 18, gd: 0.12, si: 18, gi: 0.12, abre: 30, ancho: 1.2, sonr: 1, lengua: 0.2 }),
    corre: E({ mx: 0.9, my: 0, c: 0.2, h: 0.6, sd: 16, gd: 0.1, si: 16, gi: 0.1, abre: 22, ancho: 1.15, sonr: 1 }),
    feliz: E({ mx: 0.6, my: -0.2, c: 1, h: 1, sd: 14, gd: 0.12, si: 14, gi: 0.12, abre: 18, ancho: 1.25, sonr: 1, lengua: 0.1 }),
    satisfecho: E({ mx: 0.9, my: 0, c: 0.75, h: 1, sd: 10, gd: 0.08, si: 10, gi: 0.08, abre: 6, ancho: 1.1, sonr: 0.9 }),
    extrana: E({ mx: 0.9, my: 0.05, c: 0.1, sd: -4, gd: -0.08, si: 22, gi: 0.12, abre: 6, ancho: 0.7, sonr: 0, lengua: 0 }),
    sorpresa: E({ mx: 0.9, my: 0, iris: 0.85, sd: 24, gd: 0.12, si: 24, gi: 0.12, abre: 26, ancho: 0.8, sonr: 0.2 }),
    risa: E({ mx: 0.4, my: -0.3, c: 1, h: 1, sd: 16, gd: 0.12, si: 16, gi: 0.12, abre: 40, ancho: 1.2, sonr: 1, lengua: 0.4 }),
    otro: E({ mx: 0.9, my: -0.05, c: 0.3, h: 0.8, sd: 24, gd: 0.15, si: 24, gi: 0.15, abre: 30, ancho: 1.25, sonr: 1, lengua: 0.2 })
  };
  const GUION_CARA_A = [
    [T.veA - 0.05, T.veA + 0.1, "ve"], [T.senala0, T.senala0 + 0.2, "alegre"], [T.corre0, T.corre0 + 0.2, "corre"],
    [T.abraza0 + 0.05, T.abraza1, "feliz"], [T.suelta0, T.suelta1, "satisfecho"], [T.extrana, T.extrana + 0.25, "extrana"],
    [T.pop, T.pop + 0.08, "sorpresa"], [T.risa0, T.risa0 + 0.2, "risa"], [T.otro0, T.otro0 + 0.25, "otro"]
  ];
  const CUERPOS_A = {
    inicio: { pel: 0, torso: 0.02, cab: 0.02 },
    alegre: { pel: -10, torso: -0.05, cab: -0.06 },
    corre: { pel: 10, torso: 0.1, cab: 0 },
    agacha: { pel: 85, torso: 0.24, cab: 0.2 },
    alza: { pel: 40, torso: -0.02, cab: 0.24 },
    deja: { pel: 60, torso: 0.12, cab: 0.08 },
    recto: { pel: 0, torso: 0, cab: 0 },
    extrana: { pel: 0, torso: 0, cab: 0.14 },
    risa: { pel: 8, torso: -0.06, cab: -0.08 },
    otro: { pel: -6, torso: 0.06, cab: -0.04 }
  };
  const GUION_CUERPO_A = [
    [T.veA, T.veA + 0.2, "recto"], [T.senala0, T.senala0 + 0.2, "alegre"], [T.corre0, T.corre0 + 0.2, "corre"],
    [T.abraza0 - 0.12, T.abraza1, "agacha"], [T.alza0, T.alza1, "alza"], [T.baja0, T.baja1, "deja"],
    [T.suelta0, T.atras1, "recto"], [T.extrana, T.extrana + 0.25, "extrana"], [T.pop + 0.1, T.pop + 0.3, "recto"],
    [T.risa0, T.risa0 + 0.2, "risa"], [T.otro0, T.otro0 + 0.3, "otro"]
  ];

  // cuerpo de Ander (sin manos): no depende de Guillermo
  function cuerpoA(t) {
    if (!PASOS_A) pasosA();
    const b = guion(GUION_CUERPO_A, CUERPOS_A, "inicio", t);
    const respira = Math.sin(t * 2.1 + 1);
    const fc = pie(PASOS_A.cerca, t, 30), fl = pie(PASOS_A.lejos, t, 30);
    const X = (fc.x + fl.x) / 2;
    const bob = -10 * (Math.max(Math.sin(Math.PI * fc.u), Math.sin(Math.PI * fl.u)) || 0);
    // risa: se le mueven los hombros
    const rie = dentro(t, T.risa0 + 0.1, T.risa0 + 0.3, T.otro0, T.otro0 + 0.2);
    const p = {
      x: X, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: AN.PELVIS.x, y: AN.PELVIS.y + b.pel + respira * 1.2 + bob + 6 * Math.abs(Math.sin(t * 16)) * rie },
      torso: b.torso + mecida(t) + 0.03 * Math.sin(t * 16) * rie, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.04 * Math.sin(t * 16 + 1) * rie, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // la cabeza sigue la mecida (feliz, de lado a lado)
    p.cabeza.ang += 0.6 * mecida(t);
    for (const [lado, f] of [["cerca", fc], ["lejos", fl]]) {
      const hx = AN.aHoja(p, { x: f.x, y: 0 }).x;
      p.piernas[lado] = { tob: { x: hx, y: TOB_A - (lado === "lejos" ? 8 : 0) - f.alza / (S * AN.K) }, ang: f.ang };
    }
    const ex = guion(GUION_CARA_A, CARAS_A, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [0.9, 2.95, 9.4, 10.9]));
    return p;
  }

  /* =====================================================================================
   * GEOMETRÍA DEL ABRAZO
   * ===================================================================================== */
  // Puntos de la espalda de Guillermo (hoja, en su torso) donde van las manos de Ander
  const ESPALDA_ALTA = { x: 132, y: 470 }, ESPALDA_BAJA = { x: 136, y: 640 };
  const PECHO_A = { x: 420, y: 470 };                // punto del torso de Ander al que va «pegado» Guillermo
  let GEO = null;
  function preparaGeo() {
    if (!PASOS_A) pasosA();
    // pecho de Ander sin mecida en el abrazo (para que Guillermo se mueva con él)
    GEO = { ok: true };
  }
  // posición en pantalla de un punto de la hoja de Guillermo con su estrujado y su giro
  function trG(pG, q) {
    const P = G.aPantalla(pG, q), tf = pG.tf;
    if (!tf) return P;
    let x = tf.cx + (P.x - tf.cx) * tf.sx, y = tf.cy + (P.y - tf.cy) * tf.sy;
    if (tf.giro) { const c = Math.cos(tf.giro), s = Math.sin(tf.giro), dx = x - tf.px, dy = y - tf.py; x = tf.px + dx * c - dy * s; y = tf.py + dx * s + dy * c; }
    return { x, y };
  }

  /* =====================================================================================
   * POSE DE GUILLERMO
   * ===================================================================================== */
  const alzado = t => dentro(t, T.alza0, T.alza1, T.baja0, T.baja1);
  function poseG(t, pA) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const respira = Math.sin(t * 2.4);
    const fc = pie(PASOS_G.cerca, t, 28), fl = pie(PASOS_G.lejos, t, 28);
    const X = (fc.x + fl.x) / 2;
    const bote = -8 * Math.max(Math.sin(Math.PI * fc.u), Math.sin(Math.PI * fl.u));
    // saltitos de emoción con los brazos abiertos
    const salta = dentro(t, T.abre0, T.abre0 + 0.1, T.corre0, T.corre0 + 0.1) * Math.abs(Math.sin((t - T.abre0) * 14)) * 22;
    // tambaleo
    const tamb = dentro(t, T.tamb0, T.tamb0 + 0.15, T.tamb1, T.tamb1 + 0.3), fT = Math.sin((t - T.tamb0) * 6.5);
    const p = {
      x: X, suelo: SUELO, s: S, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.3 + bote - salta },
      torso: b.torso + 0.12 * fT * tamb, torsoEsc: { x: 1 - 0.07 * pulso(t) * alzado(t), y: 1 + respira * 0.005 },
      piernas: {}, cabeza: { ang: b.cab + 0.16 * Math.sin((t - T.tamb0) * 6.5 + 0.9) * tamb, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // golpecitos con el pie mientras espera
    const tap = dentro(t, T.tap0, T.tap0 + 0.1, T.tap1 - 0.1, T.tap1);
    for (const [lado, f] of [["cerca", fc], ["lejos", fl]]) {
      const hx = G.aHoja(p, { x: f.x, y: 0 }).x;
      let ang = f.ang;
      if (lado === "lejos") ang += -0.22 * Math.max(0, Math.sin((t - T.tap0) * 15)) * tap;
      p.piernas[lado] = { tob: { x: hx, y: TOB_G[lado] - (f.alza + (lado === "lejos" ? salta * 0.3 : salta)) / S }, ang };
    }
    // ---- levantado: las piernas cuelgan y patalean ----
    const al = alzado(t);
    if (al > 0) {
      for (const lado of ["cerca", "lejos"]) {
        const sg = lado === "cerca" ? -1 : 1, ph = (t - T.alza0) * 13 + (lado === "cerca" ? 0 : Math.PI);
        const pat = dentro(t, T.alza1 - 0.1, T.alza1 + 0.2, T.baja0 - 0.2, T.baja0) * (0.5 + 0.5 * Math.sin(ph));
        const cuelga = { x: G.PELVIS.x + sg * 30 - 50 - 55 * pat, y: G.PELVIS.y + 530 - 120 * pat };
        const q = p.piernas[lado]; q.tob = mezcla(q.tob, cuelga, al); q.ang = lerp(q.ang, 0.8 - 0.45 * pat, al);
      }
    }
    // ---- manos ----
    const Tr = G.tronco(p);
    let c = { x: BOLS_C.x, y: BOLS_C.y }, l = { x: BOLS_L.x, y: BOLS_L.y };
    let cpu = 0, lpu = 0, cang = 0, lang = 0, cmu = -1.75, lmu = -1.75, cd = RELAJADA, ld = RELAJADA;
    const pone = (w, cc, ll) => {
      if (w <= 0) return;
      if (cc) { c = mezcla(c, cc.q, w); cpu = lerp(cpu, 1, w); cang = lerp(cang, cc.ang || 0, w); cmu = lerp(cmu, cc.mu, w); cd = mezclaD(cd, cc.d, w); }
      if (ll) { l = mezcla(l, ll.q, w); lpu = lerp(lpu, 1, w); lang = lerp(lang, ll.ang || 0, w); lmu = lerp(lmu, ll.mu, w); ld = mezclaD(ld, ll.d, w); }
    };
    // señala a Ander con el índice (la mano lejana)
    pone(dentro(t, T.senala0 - 0.12, T.senala1, T.senalaFin, T.abre1), null, { q: Tr({ x: 600, y: 420 }), mu: -3.05, d: SENALA });
    // brazos abiertos de par en par (y mientras corre)
    const abre = dentro(t, T.senalaFin - 0.05, T.abre1, T.abraza0 + 0.05, T.alza0);
    const ag = Math.sin((t - T.abre0) * 14) * 12 * dentro(t, T.abre0, T.abre0 + 0.1, T.corre0, T.corre0 + 0.1);
    const alto = tramo(t, T.corre0, T.corre1 - 0.2);
    pone(abre, { q: Tr({ x: -40, y: 250 + ag - 60 * alto }), mu: 0.55, d: ABIERTA }, { q: Tr({ x: lerp(600, 520, alto), y: lerp(240, 140, alto) - ag }), mu: lerp(2.6, 2.2, alto), d: ABIERTA });
    // levantado: los brazos se agitan por encima de Ander
    const agita = dentro(t, T.abraza1, T.alza1, T.baja0, T.baja1 - 0.05);
    if (agita > 0) {
      const f1 = Math.sin((t - T.alza0) * 15), f2 = Math.sin((t - T.alza0) * 17 + 1.3);
      pone(agita, { q: Tr({ x: -30 + 26 * f1, y: 170 + 22 * f2 }), mu: 0.9, d: ABIERTA }, { q: Tr({ x: 470 + 24 * f2, y: 150 + 24 * f1 }), mu: 2.2, d: ABIERTA });
    }
    // estrujado: brazos pegados al cuerpo
    const pegado = dentro(t, T.baja1 - 0.15, T.baja1 + 0.1, T.pop, T.pop + 0.12);
    pone(pegado, { q: Tr({ x: 122, y: 700 }), mu: -1.6, d: D(0.6, 0.85) }, { q: Tr({ x: 352, y: 700 }), mu: -1.6, d: D(0.6, 0.85) });
    // tambaleo: brazos abiertos para no caerse
    const bal = dentro(t, T.pop + 0.05, T.pop + 0.25, T.pulgar0, T.pulgar1);
    if (bal > 0) { const ba = 34 * fT;
      pone(bal, { q: Tr({ x: -70, y: 470 + ba }), mu: 0.2, d: ABIERTA }, { q: Tr({ x: 570, y: 470 - ba }), mu: 2.9, d: ABIERTA }); }
    // pulgar arriba tembloroso (mano lejana; antebrazo horizontal) y la otra al bolsillo
    const pul = dentro(t, T.pulgar0, T.pulgar1, T.no0 - 0.05, T.no0 + 0.12);
    if (pul > 0) {
      const tiembla = 6 * ruido(t * 22) * tramo(t, T.pulgar1 - 0.1, T.pulgar1 + 0.1);
      pone(pul, null, { q: Tr({ x: 630, y: 430 + tiembla }), mu: -3.1, ang: 0.04 * ruido(t * 19 + 4), d: PULGAR });
      const vuelve = tramo(t, T.pulgar0, T.pulgar1);
      c = mezcla(c, BOLS_C, vuelve); cpu = lerp(cpu, 0, vuelve); cang = lerp(cang, 0, vuelve); cmu = lerp(cmu, -1.75, vuelve);
    }
    // ¡otro no! las dos palmas en alto
    pone(tramo(t, T.no0, T.no1), { q: Tr({ x: 300, y: 360 }), mu: 1.45, d: ABIERTA }, { q: Tr({ x: 520, y: 340 }), mu: 1.85, d: ABIERTA });
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: -1, puno: cpu, dedos: cd };
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: -1, puno: lpu, dedos: ld };
    // el pulgar arriba se ve mejor algo más grande: la mano la dibuja la escena (el montaje no escala por encima de 1)
    const pulG = dentro(t, T.pulgar0, T.pulgar1, T.no0 - 0.05, T.no0 + 0.12);
    if (pulG > 0) { p.manoGrande = Object.assign({}, p.manoLejos, { esc: lpu * lerp(1, 1.4, pulG) }); p.manoLejos.puno = 0; }
    // ---- cara ----
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [0.3, 1.25, 2.9, T.parp1, T.parp2, 11.1]));
    const apr = dentro(t, T.aprieta - 0.02, T.aprieta + 0.15, T.baja1, T.baja1 + 0.3);
    p.rojo = clamp(0.25 * apr + 0.75 * clamp(acumulado(t)) * dentro(t, T.aprieta, T.aprieta + 0.2, T.baja1 + 0.4, T.pop)) + 0.25 * tramo(t, T.no0, T.no1);
    p.cara.rubor = Math.max(p.rojo, 0.5 * dentro(t, T.reconoce, T.reconoce + 0.3, T.corre1, T.abraza1));
    p.sudor = dentro(t, T.alza1, T.mece0 + 0.6, T.baja1, T.pop) + 0.6 * dentro(t, T.no0, T.no1, T.fin + 1, T.fin + 2);
    p.ojosFuera = dentro(t, T.aprieta - 0.02, T.aprieta + 0.08, T.baja1 - 0.05, T.flaco + 0.2) * (1 + 0.18 * pulso(t)) + 0.6 * dentro(t, T.pop, T.pop + 0.06, T.pop + 0.3, T.pop + 0.5)
      + 0.75 * dentro(t, T.no0 - 0.05, T.no0 + 0.08, T.fin + 1, T.fin + 2);
    p.capaCabeza = (g, tt) => ojosFuera(g, p.ojosFuera, tt);

    // ---- colocación: se mueve con el pecho de Ander mientras lo abraza; estrujado ----
    const sx = anchoG(t), sy = 1 + (1 - sx) * 0.45 * (t < T.pop ? tramo(t, T.baja1 - 0.15, T.baja1 + 0.25) : 1);
    p.tf = { cx: X, cy: SUELO, sx, sy, giro: 0, px: 0, py: 0 };
    if (al > 0 && pA) {
      // lo levanta: sube ALZA px y sigue el pecho de Ander (con la mecida)
      const sinM = Object.assign({}, pA, { torso: pA.torso - mecida(t) });
      const pe = AN.aPantalla(pA, AN.tronco(pA)(PECHO_A)), pe0 = AN.aPantalla(sinM, AN.tronco(sinM)(PECHO_A));
      const dx = (pe.x - pe0.x) * al, dy = (pe.y - pe0.y) * al;
      const sube = ALZA * suave(fase(t, T.alza0, T.alza1)) * (1 - suave(fase(t, T.baja0, T.baja1)));
      p.x += dx; p.suelo += dy - sube; p.tf.cx = p.x; p.tf.cy = p.suelo;
      const P = G.aPantalla(p, p.pelvis);
      p.tf.giro = -mecida(t) * al; p.tf.px = P.x; p.tf.py = P.y;
    }
    return p;
  }

  // mano de Guillermo con la misma transformación que su montaje, a la escala que se pida
  const COL_G = { piel: G.C.piel, sombra: G.C.pielSombra, tinta: G.C.tinta };
  function manoG(g, p, m) {
    g.save();
    g.translate(p.x, p.suelo); g.scale(p.s, p.s); g.translate(-G.PELVIS.x, -G.SUELO);
    g.translate(m.x, m.y); g.rotate(m.ang || 0); g.scale(G.JK * m.esc, G.JK * m.esc);
    Personaje2D.mano(g, m, COL_G);
    g.restore();
  }

  /* ---------- ojos fuera de las órbitas (encima de la cara de Guillermo, en el retrato) ---------- */
  const OJO_G = [{ c: { x: 771, y: 563 }, r: 17.5, rx: 25 }, { c: { x: 894, y: 617 }, r: 15, rx: 19 }];
  function ojosFuera(g, k, t) {
    if (k <= 0.01) return;
    g.save(); g.lineJoin = "round";
    OJO_G.forEach((o, i) => {
      const R0 = (o.rx + 8) * (0.85 + 0.85 * clamp(k)) * Math.max(0.8, k) * (1 + 0.04 * Math.sin(t * 30 + i));
      const cx = o.c.x + 10 * k + (i ? 14 : -4) * k, cy = o.c.y - 14 * k;
      g.globalAlpha = clamp(k * 3);
      g.beginPath(); g.ellipse(cx, cy, R0 * 0.92, R0, 0, 0, Math.PI * 2);
      g.fillStyle = "#fbf8f5"; g.fill(); g.lineWidth = 5.5; g.strokeStyle = "#0b0a0e"; g.stroke();
      // venitas
      g.strokeStyle = "rgba(220,60,60,0.7)"; g.lineWidth = 2;
      for (let v = 0; v < 3; v++) { const a = 2.4 + v * 0.7 + i; g.beginPath(); g.moveTo(cx + Math.cos(a) * R0 * 0.95, cy + Math.sin(a) * R0 * 0.95);
        g.quadraticCurveTo(cx + Math.cos(a + 0.2) * R0 * 0.7, cy + Math.sin(a + 0.2) * R0 * 0.7, cx + Math.cos(a - 0.1) * R0 * 0.55, cy + Math.sin(a - 0.1) * R0 * 0.55); g.stroke(); }
      // pupila diminuta temblando
      const px = cx + 3 + 1.5 * Math.sin(t * 41 + i * 2), py = cy + 1.5 * Math.cos(t * 37 + i);
      g.fillStyle = "#120806"; g.beginPath(); g.arc(px, py, 6 + 2 * (1 - clamp(k)), 0, Math.PI * 2); g.fill();
      g.fillStyle = "#ffffff"; g.beginPath(); g.arc(px - 2, py - 2, 2, 0, Math.PI * 2); g.fill();
    });
    g.restore();
  }

  /* =====================================================================================
   * MANOS DE ANDER (dependen de dónde está Guillermo)
   * ===================================================================================== */
  const rodea = t => dentro(t, T.abraza0, T.abraza1, T.suelta0, T.suelta1);
  // el brazo lejano de Ander pasa por detrás de Guillermo mientras lo abraza
  const lejanoDetras = t => t >= T.abre1 && t < T.atras1;
  function manosA(p, pG, t) {
    const Tr = AN.tronco(p);
    let c = { x: AN.BOLSILLO_C.x, y: AN.BOLSILLO_C.y }, l = { x: AN.BOLSILLO_L.x, y: AN.BOLSILLO_L.y };
    let cpu = 0, lpu = 0, cang = 0, lang = 0, cmu = -1.75, lmu = -1.75, cd = RELAJADA, ld = RELAJADA, cdob = -1, ldob = 1;
    const pone = (w, cc, ll) => {
      if (w <= 0) return;
      if (cc) { c = mezcla(c, cc.q, w); cpu = lerp(cpu, 1, w); cang = lerp(cang, cc.ang || 0, w); cmu = lerp(cmu, cc.mu, w); cd = mezclaD(cd, cc.d, w); }
      if (ll) { l = mezcla(l, ll.q, w); lpu = lerp(lpu, 1, w); lang = lerp(lang, ll.ang || 0, w); lmu = lerp(lmu, ll.mu, w); ld = mezclaD(ld, ll.d, w); }
    };
    // señala a Guillermo
    pone(dentro(t, T.senala0 - 0.1, T.senala1 + 0.02, T.senalaFin, T.abre1), null, { q: Tr({ x: 640, y: 400 }), mu: -3.05, d: SENALA });
    // brazos abiertos
    const abre = dentro(t, T.senalaFin - 0.05, T.abre1, T.abraza0, T.abraza1);
    const bajo = tramo(t, T.corre0 + 0.1, T.corre1 - 0.15);
    pone(abre, { q: Tr({ x: -40, y: 230 + 120 * bajo }), mu: 0.55, d: ABIERTA }, { q: Tr({ x: lerp(620, 600, bajo), y: lerp(230, 470, bajo) }), mu: lerp(2.6, 3.0, bajo), d: ABIERTA });
    // lo rodea: la cercana por delante sobre los riñones, la lejana por detrás, asomando por su espalda
    const ro = rodea(t);
    if (ro > 0 && pG) {
      const ap = 1 + 0.0 * pulso(t);
      const qb = AN.aHoja(p, trG(pG, G.tronco(pG)(ESPALDA_BAJA))), qa = AN.aHoja(p, trG(pG, G.tronco(pG)(ESPALDA_ALTA)));
      const hombroC = Tr(AN.HOMBRO_C), hombroL = Tr(AN.HOMBRO);
      // la muñeca mira hacia el hombro (las manos abrazan la espalda con los dedos hacia delante)
      const muC = Math.atan2(hombroC.y - qb.y, hombroC.x - qb.x), muL = Math.atan2(hombroL.y - qa.y, hombroL.x - qa.x);
      pone(ro, { q: { x: qb.x - 6 * ap, y: qb.y + 10 }, mu: muC, d: D(0.9, 1, 1, 1, 0.95) }, { q: { x: qa.x + 14, y: qa.y }, mu: muL, d: D(0.9, 1, 1, 1, 0.95) });
    }
    // lo suelta y se aparta: manos a la cintura
    const jarras = dentro(t, T.suelta0 + 0.1, T.atras1, T.risa0, T.risa0 + 0.2);
    pone(jarras, { q: Tr({ x: 118, y: 640 }), mu: -0.6, ang: 0, d: D(0.4, 0.75) }, { q: Tr({ x: 418, y: 636 }), mu: -2.5, ang: 0, d: D(0.4, 0.75) });
    if (jarras > 0) ldob = lerp(1, -1, 0);
    // risa: manos a la tripa
    const rie = dentro(t, T.risa0, T.risa0 + 0.2, T.otro0, T.otro0 + 0.2);
    pone(rie, { q: Tr({ x: 300, y: 560 + 6 * Math.sin(t * 16) }), mu: -2.6, d: D(0.6, 0.85) }, { q: Tr({ x: 360, y: 580 + 6 * Math.sin(t * 16 + 1) }), mu: -2.2, d: D(0.6, 0.85) });
    // ¿otro? brazos abiertos otra vez
    pone(tramo(t, T.otro0, T.otro1), { q: Tr({ x: -30, y: 150 }), mu: 0.9, d: ABIERTA }, { q: Tr({ x: 560, y: 150 }), mu: 2.3, d: ABIERTA });
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: cdob, puno: cpu, dedos: cd };
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: ldob, puno: lpu, dedos: ld };
    if (lejanoDetras(t)) {
      // los dos brazos los dibuja la escena: el lejano por detrás de Guillermo (y, delante de él, solo lo que
      // queda a la derecha del pecho de Guillermo, como haría el montaje) y después el cercano por delante
      p.brazosAparte = { lejos: p.manoLejos, cerca: p.manoCerca };
      p.manoLejos = Object.assign({}, p.manoLejos, { grosor: 1e-4, puno: 0 });
      p.manoCerca = Object.assign({}, p.manoCerca, { grosor: 1e-4, puno: 0 });
    }
    return p;
  }

  // brazo de Ander dibujado por la escena, exactamente como lo dibuja su montaje (tira + mano)
  const PZA = AN.A.datos.piezas, COL_A = { piel: AN.C.piel, sombra: AN.C.pielSombra, tinta: AN.C.tinta };
  const BR = { lejos: { pieza: "brazo", h: AN.HOMBRO, L: PZA.brazo.fin[1] - PZA.brazo.raiz[1], codo: PZA.brazo.codo },
               cerca: { pieza: "brazo_cerca", h: AN.HOMBRO_C, L: PZA.brazo_cerca.fin[1] - PZA.brazo_cerca.raiz[1], codo: PZA.brazo_cerca.codo } };
  function brazoA(g, p, lado, t) {
    const m = p.brazosAparte && p.brazosAparte[lado]; if (!m) return;
    const b = BR[lado], k = p.s * AN.K;
    g.save();
    g.translate(p.x, p.suelo); g.scale(-k, k); g.translate(-AN.PELVIS.x, -AN.SUELO);
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
    const h = AN.tronco(p)(b.h), mu = m.mu ?? -1.75;
    const o = AN.rotP({ x: Math.cos(mu) * AN.MUNECA_R * AN.JK, y: Math.sin(mu) * AN.MUNECA_R * AN.JK }, m.ang || 0);
    const c = R.ik(h, { x: m.x + o.x, y: m.y + o.y }, b.L, b.codo, 42, m.dobla ?? -1, 1.08);
    c.grosor = 1; c.capFija = true; c.caminoCorto = true; c.capAng = p.torso; c.cuna = true; c.cunaAjustada = true;
    R.tira(g, AN.A, b.pieza, c, 16);
    g.translate(m.x, m.y); g.rotate(m.ang || 0); g.scale(AN.JK, AN.JK);
    const kp = m.puno ?? 1; if (kp > 0.01) { g.scale(kp, kp); Personaje2D.mano(g, m, COL_A); }
    g.restore();
  }

  /* =====================================================================================
   * DECORADO: sidrería de piedra con barricas
   * ===================================================================================== */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 160; c.height = H + 120; const g = c.getContext("2d");
    g.translate(80, 60);
    // pared de piedra
    g.fillStyle = "#6f6455"; g.fillRect(-80, -60, W + 160, 560);
    for (let fila = 0; fila < 16; fila++) {
      const y0 = -60 + fila * 34, off = (fila % 2) * 36;
      for (let x = -120 + off; x < W + 120; x += 0) {
        const w = 52 + hash(fila * 31 + x * 0.7) * 46, h = 30 + hash(fila * 7 + x) * 6;
        const tono = 104 + hash(fila * 13 + x * 1.3) * 38, r = tono + 10, gg = tono + 2, b = tono - 12;
        g.fillStyle = `rgb(${r | 0},${gg | 0},${b | 0})`;
        g.beginPath(); g.roundRect ? g.roundRect(x + 2, y0 + 2, w - 4, h - 3, 9) : g.rect(x + 2, y0 + 2, w - 4, h - 3); g.fill();
        g.fillStyle = "rgba(255,240,210,0.12)"; g.beginPath(); g.ellipse(x + w * 0.35, y0 + 9, w * 0.25, 4, 0, 0, Math.PI * 2); g.fill();
        g.strokeStyle = "rgba(40,30,20,0.35)"; g.lineWidth = 1.5; g.beginPath(); g.roundRect ? g.roundRect(x + 2, y0 + 2, w - 4, h - 3, 9) : g.rect(x + 2, y0 + 2, w - 4, h - 3); g.stroke();
        x += w;
      }
    }
    // vigas de madera del techo
    g.fillStyle = "#3a2516"; g.fillRect(-80, -60, W + 160, 46);
    g.fillStyle = "#5a3a22"; g.fillRect(-80, -20, W + 160, 8);
    for (const vx of [70, 520, 960]) { g.fillStyle = "#4a2f1c"; g.fillRect(vx - 14, -60, 28, 560); g.fillStyle = "rgba(255,220,170,0.12)"; g.fillRect(vx - 14, -60, 6, 560);
      g.strokeStyle = "#1e130b"; g.lineWidth = 3; g.strokeRect(vx - 14, -60, 28, 560); }
    // barricas gigantes (tapa redonda con duelas, aros y espita)
    const barrica = (cx, cy, r) => {
      g.save(); g.translate(cx, cy);
      g.fillStyle = "#2a1a10"; g.beginPath(); g.ellipse(4, 6, r + 6, r + 4, 0, 0, Math.PI * 2); g.fill();
      const gr = g.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r); gr.addColorStop(0, "#b87a45"); gr.addColorStop(1, "#7a4a26");
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
      g.save(); g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.clip();
      g.strokeStyle = "rgba(60,35,18,0.55)"; g.lineWidth = 2;
      for (let i = -6; i <= 6; i++) { const x = i * r / 6.5; g.beginPath(); g.moveTo(x, -r); g.lineTo(x, r); g.stroke(); }
      g.restore();
      g.strokeStyle = "#2b2b30"; g.lineWidth = 9; g.beginPath(); g.arc(0, 0, r - 5, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = "#6c6c75"; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, r - 7, Math.PI * 1.05, Math.PI * 1.5); g.stroke();
      g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke();
      // espita
      g.fillStyle = "#c9a24a"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5;
      g.beginPath(); g.roundRect ? g.roundRect(-8, r * 0.55, 16, 22, 4) : g.rect(-8, r * 0.55, 16, 22); g.fill(); g.stroke();
      g.beginPath(); g.roundRect ? g.roundRect(-14, r * 0.55 - 6, 28, 8, 3) : g.rect(-14, r * 0.55 - 6, 28, 8); g.fill(); g.stroke();
      g.restore();
    };
    barrica(150, 250, 132);
    barrica(860, 238, 118);
    // estante con botellas de sidra y vasos anchos
    g.fillStyle = "#4a2f1c"; g.fillRect(380, 150, 270, 14); g.strokeStyle = "#1e130b"; g.lineWidth = 3; g.strokeRect(380, 150, 270, 14);
    for (let i = 0; i < 7; i++) { const x = 400 + i * 36, h = 52 + (i % 2) * 6;
      g.fillStyle = i % 3 === 1 ? "#3d6b33" : "#5a7f2e"; g.beginPath(); g.moveTo(x - 9, 150); g.lineTo(x - 9, 150 - h + 18); g.quadraticCurveTo(x - 9, 150 - h + 8, x - 3, 150 - h + 4);
      g.lineTo(x - 3, 150 - h - 6); g.lineTo(x + 3, 150 - h - 6); g.lineTo(x + 3, 150 - h + 4); g.quadraticCurveTo(x + 9, 150 - h + 8, x + 9, 150 - h + 18); g.lineTo(x + 9, 150); g.closePath();
      g.fill(); g.lineWidth = 2; g.strokeStyle = "#0b0a0e"; g.stroke();
      g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(x - 6, 150 - h + 20, 3, h - 26);
      g.fillStyle = "#e9dcc0"; g.fillRect(x - 7, 150 - h * 0.55, 14, 12); }
    // zócalo de madera y suelo de tablones
    g.fillStyle = "#4b301d"; g.fillRect(-80, 430, W + 160, 72);
    g.fillStyle = "#6a4428"; g.fillRect(-80, 430, W + 160, 6);
    g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = 2;
    for (let x = -60; x < W + 80; x += 90) { g.beginPath(); g.moveTo(x, 436); g.lineTo(x, 502); g.stroke(); }
    const su = g.createLinearGradient(0, 502, 0, H + 60); su.addColorStop(0, "#7a4f2c"); su.addColorStop(1, "#4a2d18");
    g.fillStyle = su; g.fillRect(-80, 502, W + 160, H + 60 - 502);
    g.strokeStyle = "rgba(40,22,10,0.45)"; g.lineWidth = 2;
    for (let y = 520; y < H + 60; y += 22) { g.beginPath(); g.moveTo(-80, y); g.lineTo(W + 80, y); g.stroke(); }
    for (let i = 0; i < 40; i++) { const y = 520 + Math.floor(hash(i * 3.3) * 4) * 22, x = -80 + hash(i * 5.1) * (W + 160);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 22); g.stroke(); }
    g.fillStyle = "rgba(255,210,150,0.12)"; g.fillRect(-80, 502, W + 160, 3);
    // puerta de madera a la derecha (por donde entra Ander) con luz de la calle
    g.save(); g.translate(1010, 0);
    g.fillStyle = "#2a1a10"; g.beginPath(); g.moveTo(-70, 502); g.lineTo(-70, 120); g.quadraticCurveTo(0, 60, 70, 120); g.lineTo(70, 502); g.closePath(); g.fill();
    const luzP = g.createLinearGradient(-60, 0, 60, 0); luzP.addColorStop(0, "#3b4a6b"); luzP.addColorStop(1, "#1c2438");
    g.fillStyle = luzP; g.beginPath(); g.moveTo(-58, 502); g.lineTo(-58, 126); g.quadraticCurveTo(0, 76, 58, 126); g.lineTo(58, 502); g.closePath(); g.fill();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.stroke();
    g.restore();
    // farolillos de hierro colgando (el resplandor se pinta encima en cada fotograma)
    for (const lx of [330, 700]) {
      g.strokeStyle = "#151116"; g.lineWidth = 3; g.beginPath(); g.moveTo(lx, -14); g.lineTo(lx, 40); g.stroke();
      g.fillStyle = "#1e1a1f"; g.beginPath(); g.moveTo(lx - 18, 44); g.lineTo(lx + 18, 44); g.lineTo(lx + 12, 36); g.lineTo(lx - 12, 36); g.closePath(); g.fill();
      g.fillStyle = "#ffd98a"; g.fillRect(lx - 12, 44, 24, 30); g.strokeStyle = "#151116"; g.lineWidth = 3; g.strokeRect(lx - 12, 44, 24, 30);
      g.beginPath(); g.moveTo(lx, 44); g.lineTo(lx, 74); g.stroke();
      g.fillStyle = "#1e1a1f"; g.beginPath(); g.moveTo(lx - 16, 74); g.lineTo(lx + 16, 74); g.lineTo(lx + 6, 84); g.lineTo(lx - 6, 84); g.closePath(); g.fill();
    }
    // viñeta cálida
    const v = g.createRadialGradient(512, 300, 260, 512, 300, 690); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(20,8,0,0.55)");
    g.fillStyle = v; g.fillRect(-80, -60, W + 160, H + 120);
    return c;
  }
  function resplandor(g, t) {
    g.save(); g.globalCompositeOperation = "lighter";
    for (const [lx, f] of [[330, 0], [700, 2]]) {
      const k = 0.9 + 0.06 * Math.sin(t * 5 + f) + 0.04 * ruido(t * 3 + f);
      const gr = g.createRadialGradient(lx, 60, 6, lx, 60, 170); gr.addColorStop(0, `rgba(255,190,90,${0.32 * k})`); gr.addColorStop(1, "rgba(255,160,60,0)");
      g.fillStyle = gr; g.fillRect(lx - 170, -110, 340, 340);
    }
    g.restore();
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  function estrellaPuntas(g, x, y, r, puntas, rot, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  // chispa de «¡eres tú!» entre los dos dedos
  function chispa(g, t, pG, pA) {
    const k = fase(t, T.chispa, T.chispa + 0.45); if (k <= 0 || k >= 1) return;
    const a = trG(pG, pG.manoLejos), b = AN.aPantalla(pA, pA.manoLejos.puno > 0 ? pA.manoLejos : pA.manoLejos);
    const x = (a.x + b.x) / 2, y = Math.min(a.y, b.y) - 50;
    g.save(); g.globalAlpha = 1 - k;
    estrellaPuntas(g, x, y, 20 + 30 * salida(k), 8, 0.2, 0.4); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 3; g.strokeStyle = "#0b0a0e"; g.stroke();
    estrellaPuntas(g, x, y, 10 + 15 * salida(k), 8, 0.6, 0.5); g.fillStyle = "#ffffff"; g.fill();
    g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2, r0 = 40 + 30 * k, r1 = r0 + 14; g.beginPath(); g.moveTo(x + Math.cos(an) * r0, y + Math.sin(an) * r0); g.lineTo(x + Math.cos(an) * r1, y + Math.sin(an) * r1); g.stroke(); }
    g.restore();
  }
  // crujidos: rayitas y estrellas en la espalda de Guillermo a cada apretón
  function crujidos(g, t, pG) {
    PULSOS.forEach((p0, i) => {
      const k = fase(t, p0, p0 + 0.5); if (k <= 0 || k >= 1) return;
      const e = trG(pG, G.tronco(pG)({ x: 128, y: 520 + (i % 2) * 60 }));
      g.save(); g.globalAlpha = 1 - k; g.lineCap = "round"; g.lineJoin = "round";
      // rayitas en zigzag
      g.strokeStyle = "#ffffff"; g.lineWidth = 3;
      for (let j = 0; j < 3; j++) {
        const a = Math.PI + (j - 1) * 0.55 + (hash(i * 7 + j) - 0.5) * 0.3, r0 = 14 + 14 * salida(k), r1 = r0 + 18;
        const x0 = e.x + Math.cos(a) * r0, y0 = e.y + Math.sin(a) * r0, x1 = e.x + Math.cos(a) * r1, y1 = e.y + Math.sin(a) * r1;
        const nx = -Math.sin(a) * 4, ny = Math.cos(a) * 4;
        g.beginPath(); g.moveTo(x0, y0); g.lineTo((x0 * 2 + x1) / 3 + nx, (y0 * 2 + y1) / 3 + ny); g.lineTo((x0 + x1 * 2) / 3 - nx, (y0 + y1 * 2) / 3 - ny); g.lineTo(x1, y1); g.stroke();
      }
      // estrellitas que saltan
      for (let j = 0; j < 3; j++) {
        const a = Math.PI * (0.75 + 0.25 * j) + (hash(i * 3 + j + 50) - 0.5) * 0.4, d = 20 + 40 * salida(k);
        const x = e.x + Math.cos(a) * d, y = e.y + Math.sin(a) * d - 16 * k;
        estrellaPuntas(g, x, y, 7 * (1 - 0.4 * k), 5, t * 4 + j, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 1.8; g.strokeStyle = "#0b0a0e"; g.stroke();
      }
      g.restore();
    });
  }
  // líneas de presión alrededor de la cintura mientras lo aprieta
  function presion(g, t, pG) {
    const k = dentro(t, T.aprieta, T.aprieta + 0.15, T.baja0, T.baja0 + 0.2) * (0.55 + 0.45 * Math.min(1, pulso(t)));
    if (k <= 0.02) return;
    const e = trG(pG, G.tronco(pG)({ x: 128, y: 470 }));
    g.save(); g.strokeStyle = "#ffffff"; g.lineCap = "round"; g.lineWidth = 2.6; g.globalAlpha = 0.85 * k;
    for (let j = 0; j < 3; j++) { const y = e.y - 24 + j * 24, x = e.x - 18 - 4 * Math.sin(t * 20 + j);
      g.beginPath(); g.moveTo(x, y - 8); g.quadraticCurveTo(x - 8, y, x, y + 8); g.stroke(); }
    g.restore();
  }
  // corazoncitos de alegría que suben de Ander mientras lo mece
  function corazones(g, t, pA) {
    const env = dentro(t, T.alza1, T.mece0 + 0.3, T.baja0, T.baja1); if (env <= 0.01) return;
    const c = AN.aPantalla(pA, AN.cabeza(pA).a({ x: 980, y: 380 }));
    g.save();
    for (let i = 0; i < 4; i++) {
      const ph = ((t - T.alza1) * 0.7 + i / 4) % 1;
      const x = c.x + 20 + 14 * Math.sin(t * 3 + i * 2) + 16 * i - 20, y = c.y - 60 * ph;
      const r = 7 + 2 * hash(i + 3); g.globalAlpha = env * Math.sin(Math.PI * ph);
      g.save(); g.translate(x, y); g.scale(r / 10, r / 10);
      g.beginPath(); g.moveTo(0, 8); g.bezierCurveTo(-14, -2, -8, -14, 0, -6); g.bezierCurveTo(8, -14, 14, -2, 0, 8); g.closePath();
      g.fillStyle = i % 2 ? "#ff6f91" : "#ff3d6a"; g.fill(); g.lineWidth = 2.4; g.strokeStyle = "#0b0a0e"; g.stroke();
      g.restore();
    }
    g.restore();
  }
  // ¡boing!: muelle y líneas al recuperar la forma
  function boing(g, t, pG) {
    const k = fase(t, T.pop, T.pop + 0.6); if (k <= 0 || k >= 1) return;
    const c = trG(pG, G.tronco(pG)({ x: 250, y: 480 }));
    g.save(); g.strokeStyle = "#ffffff"; g.lineCap = "round"; g.globalAlpha = 1 - k;
    for (const sg of [-1, 1]) for (let j = 0; j < 3; j++) {
      const x = c.x + sg * (74 + 26 * salida(k) + j * 3), y = c.y - 40 + j * 40;
      g.lineWidth = 3; g.beginPath(); g.moveTo(x, y - 12); g.quadraticCurveTo(x + sg * 9, y, x, y + 12); g.stroke();
    }
    g.restore();
  }
  function estrellitas(g, t, pG, k) {
    if (k <= 0.01) return;
    const c = trG(pG, G.cabeza(pG).a({ x: 790, y: 330 }));
    const pts = [];
    for (let i = 0; i < 5; i++) { const a = t * 4.2 + i * Math.PI * 2 / 5; pts.push({ a, x: c.x + Math.cos(a) * 50, y: c.y - 24 + Math.sin(a) * 13, z: Math.sin(a) }); }
    pts.sort((u, v) => u.z - v.z);
    g.save();
    for (const q of pts) { const r = (8 + 2.5 * q.z) * k; estrellaPuntas(g, q.x, q.y, r, 5, t * 3 + q.a, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2; g.strokeStyle = "#0b0a0e"; g.stroke(); }
    g.restore();
  }
  // rayitas de temblor en el pulgar
  function tiemblaPulgar(g, t, pG) {
    const k = dentro(t, T.pulgar1 - 0.1, T.pulgar1 + 0.1, T.no0 - 0.1, T.no0); if (k <= 0.01) return;
    const m = trG(pG, pG.manoLejos);
    g.save(); g.strokeStyle = "#ffffff"; g.lineWidth = 2.2; g.lineCap = "round"; g.globalAlpha = 0.85 * k;
    for (const sg of [-1, 1]) { const x = m.x + sg * 20, y = m.y - 22;
      g.beginPath(); g.moveTo(x, y - 7); g.quadraticCurveTo(x + sg * 5, y, x, y + 7); g.stroke(); }
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const ab = dentro(t, T.abraza0, T.alza1, T.baja1, T.pop);
    return { k: 1 + 0.03 * ab, x: 512 - 20 * ab, y: 300 - 4 * ab };
  }

  function poses(t) {
    const pA = cuerpoA(t);
    const pG = poseG(t, pA);
    manosA(pA, pG, t);
    return { g: pG, a: pA };
  }

  class GuillermoAbrazo extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !AN.listo()) return;
      if (!fondo) fondo = creaFondo();
      if (!GEO) preparaGeo();
      const { g: pG, a: pA } = poses(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = (t >= T.aprieta ? 2.2 * Math.exp(-(t - T.aprieta) * 8) * suave(fase(t, T.aprieta, T.aprieta + 0.05)) : 0)
        + (t >= T.baja1 ? 2.5 * Math.exp(-(t - T.baja1) * 9) * suave(fase(t, T.baja1, T.baja1 + 0.05)) : 0);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -80, -60);
      resplandor(g, t);
      // sombras en el suelo
      g.save(); g.fillStyle = "rgba(20,10,0,0.36)";
      const al = alzado(t);
      g.beginPath(); g.ellipse(pG.x - 2, SUELO + 2, (58 - 22 * al) * pG.tf.sx, 7 - 2 * al, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pA.x + 2, SUELO + 2, 60, 7, 0, 0, Math.PI * 2); g.fill();
      g.restore();
      // brazo lejano de Ander por detrás de Guillermo
      brazoA(g, pA, "lejos", t);
      // Guillermo (estrujado y mecido)
      const tf = pG.tf;
      g.save();
      if (tf.giro) { g.translate(tf.px, tf.py); g.rotate(tf.giro); g.translate(-tf.px, -tf.py); }
      g.translate(tf.cx, tf.cy); g.scale(tf.sx, tf.sy); g.translate(-tf.cx, -tf.cy);
      G.dibujar(g, pG, t);
      if (pG.manoGrande) manoG(g, pG, pG.manoGrande);
      g.restore();
      AN.dibujar(g, pA, t);
      if (pA.brazosAparte) {
        // por delante de Guillermo solo asoma lo que queda a la derecha de su pecho; luego el brazo cercano
        const corte = trG(pG, G.tronco(pG)({ x: 345, y: 450 })).x;
        g.save(); g.beginPath(); g.rect(corte, -400, 2000, 1600); g.clip(); brazoA(g, pA, "lejos", t); g.restore();
        brazoA(g, pA, "cerca", t);
      }
      chispa(g, t, pG, pA);
      presion(g, t, pG);
      crujidos(g, t, pG);
      corazones(g, t, pA);
      boing(g, t, pG);
      estrellitas(g, t, pG, dentro(t, T.tamb0, T.tamb0 + 0.3, T.pulgar0, T.pulgar1));
      tiemblaPulgar(g, t, pG);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00037", nombre: "Guillermo y Ander · El abrazo de oso", crear: () => new GuillermoAbrazo() });
  window.__A2D_00037 = { pose: poses, T, DUR, ajuste: (dx, alza) => { DX_H = dx; ALZA = alza; PASOS_A = null; GEO = null; } };
})();
