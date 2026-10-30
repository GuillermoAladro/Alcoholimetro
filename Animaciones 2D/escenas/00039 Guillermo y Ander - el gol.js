"use strict";
/* 00039 · Guillermo y Ander · El gol
 *
 * Negro → bar deportivo de noche: pared granate, una tele colgada en lo alto con un partido (sin
 * letras: solo los números del marcador) y una lámpara sobre Guillermo. Guillermo y Ander, cara a
 * cara bajo la tele, miran el partido: Ander con su caña en la mano, Guillermo mordiéndose las uñas →
 * el delantero rojo recibe solo ante el portero: Guillermo se lleva las manos a las mejillas y Ander
 * se queda con la caña a medio camino de la boca → ¡GOL! Guillermo salta tan alto que se da con la
 * lámpara (que se queda balanceándose) y Ander levanta los brazos: la espuma de su caña sale volando
 * y le aterriza a Guillermo en el pelo, que ni se entera → corren el uno hacia el otro, se cogen de
 * la mano y saltan en corro mientras cae confeti de la nada → en la tele, la repetición: rebobina,
 * cámara lenta, pausa… línea de fuera de juego, banderín, y el marcador vuelve al 0 → los dos lo ven y
 * se quedan congelados en el aire… y caen al suelo → bajan los brazos muy despacio, se sueltan y se
 * miran → una gota de espuma le cae a Guillermo en la nariz; Ander da un sorbo resignado; Guillermo
 * se mete las manos en los bolsillos y hace pucheros a cámara, y el último confeti le cae en la cabeza
 * → negro.
 *
 * Sin textos (solo los dígitos del marcador de la tele). Todo depende del tiempo absoluto.
 * Las manos cogidas se calculan en cada fotograma a partir de los dos hombros: nunca resbalan.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, AN = Ander;
  const S = 0.265, SUELO = 578;
  const DUR = 14.0;
  // saltos en corro (gravedad de dibujo animado) y el salto del gol
  const P_SALTO = 0.44, AIRE = 0.32, G_SALTO = 2600, N_SALTOS = 7;
  const H_SALTO = G_SALTO * AIRE * AIRE / 8;
  const G_GOL = 1500, AIRE_GOL = 0.68;
  const T = {
    tele: 0.3, muerde0: 0.75, muerde1: 2.2, mejillas0: 2.25, mejillas1: 2.55,
    copa0: 1.2, copa1: 1.75,
    tiro: 3.62, gol: 3.88,
    agacha: 3.9, salta: 4.08, aterriza: 4.76,
    brazosA0: 3.9, brazosA1: 4.1, espuma: 4.1, espumaLlega: 4.84,
    junta0: 4.98, junta1: 5.3, corro0: 5.38,
    repe0: 7.05, repe1: 7.6, pausa: 7.95, bandera: 8.02, marcador: 8.22,
    nota: 8.42,
    baja0: 9.75, baja1: 11.0, suelta0: 11.05, suelta1: 11.3, bolsL0: 11.35, bolsL1: 11.7,
    miran0: 11.2, miran1: 11.45, gota: 11.55, sorbo0: 12.25, sorbo1: 12.75,
    bolsC0: 12.05, bolsC1: 12.4, camara: 12.45, confeti: 12.6,
    fin: 13.1
  };
  T.coco = T.salta + AIRE_GOL / 2;                                  // la cabeza da en la lámpara en lo más alto
  T.congela = T.corro0 + N_SALTOS * P_SALTO + AIRE / 2;             // se quedan congelados en lo alto de un salto
  T.cae = T.congela + 0.6;
  T.pisa = T.cae + Math.sqrt(2 * H_SALTO / G_SALTO);

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const mezclaD = (a, b, k) => { const o = {}; for (const n of ["pulgar", "indice", "medio", "anular", "menique"]) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const ABIERTA = D(1, 1), PUNO = D(0.05, 0), AGARRA = D(0.4, 0.42), RELAJADA = D(0.55, 0.6, 0.55, 0.5, 0.45), MUERDE = D(0.15, 0.5, 0.2, 0.12, 0.1);
  const muHacia = (q, h) => Math.atan2(h.y - q.y, h.x - q.x);        // la muñeca mira hacia el hombro

  /* ---------- caras (los dos usan los mismos campos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.15, dientes: 1, lengua: 0, esp: 0, mof: 0, guino: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: Math.max(e.c, parp), i: Math.max(e.c, parp, e.guino), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* ---------- pasos (x de pantalla de cada tobillo) ---------- */
  function pie(lista, t, alto = 30) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    const arco = Math.sin(Math.PI * u);
    return { x: lerp(xa, x, suave5(u)), alza: alto * arco, ang: -0.15 * arco };
  }
  const XG0 = 316, XA0 = 708, XC = 512, DC = 166;                  // mirando la tele / en corro
  const XG1 = XC - DC / 2, XA1 = XC + DC / 2;
  const PASOS_G = {
    lejos: [[-10, -9, XG0 + 18], [T.junta0, T.junta0 + 0.17, XG1 + 18]],
    cerca: [[-10, -9, XG0 - 18], [T.junta0 + 0.1, T.junta0 + 0.28, XG1 - 18]]
  };
  const PASOS_A = {
    lejos: [[-10, -9, XA0 - 18], [T.junta0 + 0.02, T.junta0 + 0.19, XA1 - 18]],
    cerca: [[-10, -9, XA0 + 18], [T.junta0 + 0.12, T.junta0 + 0.3, XA1 + 18]]
  };

  /* ---------- el corro: saltos juntos dando la vuelta (centro de la pareja sobre una elipse) ---------- */
  const RX = 30;
  const centroCorro = i => { const th = i * Math.PI / 2; return { dx: RX * Math.sin(th), z: (Math.cos(th) - 1) / 2 }; };   // z: 0 delante, −1 al fondo
  function enSalto(i, u) {
    const a = centroCorro(i), b = centroCorro(i + 1);
    if (u < AIRE) { const v = u / AIRE; return { dx: lerp(a.dx, b.dx, suave(v)), z: lerp(a.z, b.z, suave(v)), h: 0.5 * G_SALTO * u * (AIRE - u), tuck: Math.sin(Math.PI * v), pisa: 0 }; }
    return { dx: b.dx, z: b.z, h: 0, tuck: 0, pisa: Math.sin(Math.PI * (u - AIRE) / (P_SALTO - AIRE)) };
  }
  function corro(t) {
    if (t < T.corro0) return { dx: 0, z: 0, h: 0, tuck: 0, pisa: campana(t, T.corro0 - 0.1, T.corro0) };
    if (t < T.cae) {
      const tt = Math.min(t, T.congela), k = tt - T.corro0, i = Math.floor(k / P_SALTO);
      const c = enSalto(i, k - i * P_SALTO);
      if (t > T.congela) { c.h += 0.8 * ruido(t * 30); c.dx += 0.5 * ruido(t * 27 + 5); }    // congelados, tiritando
      return c;
    }
    // caen a plomo desde lo alto del salto congelado
    const c = enSalto(N_SALTOS, AIRE / 2), u = t - T.cae;
    const h = Math.max(0, H_SALTO - 0.5 * G_SALTO * u * u);
    return { dx: c.dx, z: c.z, h, tuck: c.tuck * clamp(h / H_SALTO), pisa: 1.3 * campana(t, T.pisa, T.pisa + 0.24) };
  }
  // bombeo de los puños, a compás de los saltos (arriba en lo alto de cada salto); congelado arriba
  const bombeo = t => t >= T.congela ? 1 : 0.5 + 0.5 * Math.sin(2 * Math.PI * (t - T.corro0) / P_SALTO - 0.714);
  // salto del gol de Guillermo
  function saltoG(t) { const u = t - T.salta; return u <= 0 || u >= AIRE_GOL ? 0 : 0.5 * G_GOL * u * (AIRE_GOL - u); }
  const aplasta = t => t >= T.coco ? Math.exp(-(t - T.coco) * 12) * suave(fase(t, T.coco, T.coco + 0.03)) : 0;

  /* =====================================================================================
   * GUILLERMO (a la izquierda, mira a la derecha)
   * ===================================================================================== */
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const CARAS_G = {
    inicio: E({ mx: 0.7, my: -0.75, c: 0.1, sd: 4, gd: 0.02, si: 4, gi: 0.02, sonr: 0.1, ancho: 0.85 }),
    nervioso: E({ mx: 0.75, my: -0.85, iris: 0.9, sd: 16, gd: 0.18, si: 16, gi: 0.18, abre: 4, ancho: 0.55, sonr: -0.3 }),
    tension: E({ mx: 0.75, my: -0.9, iris: 0.75, sd: 28, gd: 0.22, si: 28, gi: 0.22, abre: 30, ancho: 0.5, sonr: -0.35 }),
    gol: E({ mx: 0.6, my: -0.7, c: 0.8, h: 1, sd: 24, gd: 0.15, si: 24, gi: 0.15, abre: 64, ancho: 1.25, sonr: 0.85, lengua: 0.4 }),
    coco: E({ mx: 0, my: 0, c: 1, z: 1, sd: 14, gd: 0.1, si: 14, gi: 0.1, abre: 34, ancho: 0.9, sonr: -0.2, lengua: 0.3 }),
    fiesta: E({ mx: 0.9, my: -0.1, c: 0.85, h: 1, sd: 20, gd: 0.15, si: 20, gi: 0.15, abre: 52, ancho: 1.25, sonr: 1, lengua: 0.3 }),
    nota: E({ mx: 0.45, my: -1, iris: 0.8, sd: 26, gd: 0.12, si: 26, gi: 0.12, abre: 40, ancho: 0.95, sonr: 0.4, lengua: 0.2 }),
    congelado: E({ mx: 0.45, my: -1, iris: 0.68, sd: 30, gd: 0.15, si: 30, gi: 0.15, abre: 36, ancho: 0.9, sonr: 0.3, lengua: 0.1 }),
    chafado: E({ mx: 0.5, my: -0.7, c: 0.5, sd: 2, gd: 0.22, si: 2, gi: 0.22, abre: 0, ancho: 0.75, sonr: -0.5 }),
    miraA: E({ mx: 0.9, my: 0, c: 0.4, sd: 6, gd: 0.2, si: 6, gi: 0.2, abre: 0, ancho: 0.7, sonr: -0.4 }),
    gota: E({ mx: 0.35, my: 0.75, iris: 0.85, c: 0.15, sd: 16, gd: 0.12, si: 16, gi: 0.12, abre: 6, ancho: 0.6, sonr: -0.4 }),
    pucheros: E({ mx: -0.85, my: 0.05, c: 0.35, sd: 12, gd: 0.25, si: 12, gi: 0.25, abre: 0, ancho: 0.55, sonr: -0.65 })
  };
  const GUION_CARA_G = [
    [T.tele, T.tele + 0.3, "inicio"], [T.muerde0, T.muerde0 + 0.25, "nervioso"], [T.mejillas0, T.mejillas1, "tension"],
    [T.gol, T.gol + 0.07, "gol"], [T.coco - 0.02, T.coco + 0.03, "coco"], [T.coco + 0.18, T.coco + 0.36, "gol"],
    [T.junta0, T.junta0 + 0.2, "fiesta"], [T.nota, T.nota + 0.1, "nota"], [T.congela, T.congela + 0.05, "congelado"],
    [T.baja0, T.baja1, "chafado"], [T.miran0, T.miran1, "miraA"], [T.gota + 0.3, T.gota + 0.42, "gota"],
    [T.camara - 0.1, T.camara + 0.2, "pucheros"]
  ];
  const CUERPOS_G = {
    inicio: { pel: 0, torso: 0.02, cab: -0.1 },
    inclina: { pel: 12, torso: 0.1, cab: -0.14 },
    tension: { pel: 22, torso: 0.15, cab: -0.1 },
    agacha: { pel: 80, torso: 0.18, cab: -0.04 },
    vuela: { pel: -16, torso: -0.08, cab: -0.24 },
    grita: { pel: 0, torso: -0.07, cab: -0.2 },
    corro: { pel: 0, torso: -0.03, cab: -0.06 },
    mira: { pel: 0, torso: -0.03, cab: -0.2 },
    chafa: { pel: 22, torso: 0.1, cab: 0.1 },
    recto: { pel: 12, torso: 0.05, cab: 0.03 },
    gota: { pel: 12, torso: 0.04, cab: 0.08 },
    pucheros: { pel: 16, torso: 0.07, cab: 0.08 }
  };
  const GUION_CUERPO_G = [
    [0.8, 2.3, "inclina"], [T.mejillas0, T.mejillas1 + 0.3, "tension"],
    [T.agacha, T.salta, "agacha"], [T.salta, T.salta + 0.2, "vuela", salida], [T.aterriza, T.aterriza + 0.2, "grita"],
    [T.junta0, T.junta1, "corro"], [T.nota, T.nota + 0.12, "mira"], [T.baja0, T.baja1, "chafa"],
    [T.miran0, T.miran1, "recto"], [T.gota + 0.3, T.gota + 0.45, "gota"], [T.camara - 0.1, T.camara + 0.25, "pucheros"]
  ];
  const R_MG = G.MUNECA_R * G.JK;
  const manoDesde = (m, a, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_MG, y: Math.sin(mu) * R_MG }, a); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_C = manoDesde({ x: 131, y: 652 }, 0, -1.75), BOLS_L = manoDesde({ x: 372, y: 648 }, 0, -1.75);
  const TOPE_G = { x: 845, y: 262 };                                 // coronilla (retrato): toca la lámpara y recibe la espuma

  function cuerpoG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const respira = t >= T.congela && t < T.cae ? 0 : Math.sin(t * 2.4);
    const fc = pie(PASOS_G.cerca, t, 26), fl = pie(PASOS_G.lejos, t, 26);
    const cr = corro(t), sc = 1 + 0.07 * cr.z, trX = x => XC + cr.dx + (x - XC) * sc;
    const X = trX((fc.x + fl.x) / 2);
    const sg = saltoG(t), tuckG = sg > 0 ? Math.sin(Math.PI * fase(t, T.salta, T.salta + AIRE_GOL)) : 0;
    const ap = aplasta(t);
    // nervios: rodilla que no para quieta
    const nervios = dentro(t, 0.9, 1.2, T.gol - 0.1, T.gol);
    const p = {
      x: X, suelo: SUELO + 16 * cr.z - cr.h - sg, s: S * sc, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.3 + 34 * cr.pisa + 62 * campana(t, T.aterriza, T.aterriza + 0.22) + 4 * Math.abs(Math.sin(t * 13)) * nervios },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.005 },
      piernas: {}, cabeza: { ang: b.cab + 0.1 * ap, dx: 0, dy: 10 * ap, esc: { x: 1 + 0.08 * ap, y: 1 - 0.13 * ap } }
    };
    for (const [lado, f] of [["cerca", fc], ["lejos", fl]]) {
      const hx = G.aHoja(p, { x: trX(f.x), y: 0 }).x;
      let ang = f.ang;
      if (lado === "lejos") ang += -0.2 * Math.max(0, Math.sin(t * 15)) * nervios;
      const recoge = 50 * cr.tuck + 120 * tuckG;
      p.piernas[lado] = { tob: { x: hx - 0.3 * recoge, y: TOB_G[lado] - f.alza / (S * sc) - recoge }, ang: ang + 0.35 * (cr.tuck + tuckG) };
    }
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    const quieto = t >= T.congela && t < T.cae;
    p.cara = cara(ex, quieto ? 0 : parpadeo(t, [1.4, 2.9, 5.95, 9.9, 10.6, T.gota + 0.22]));
    p.rojo = 0.2 * dentro(t, T.mejillas0, T.mejillas1, T.gol, T.gol + 0.3) + 0.25 * dentro(t, T.gol, T.gol + 0.3, T.congela, T.baja0);
    p.cara.rubor = p.rojo + 0.4 * dentro(t, T.camara, T.camara + 0.3, DUR, DUR + 1);
    p.sudor = dentro(t, T.mejillas0, T.mejillas1, T.gol, T.gol + 0.2) + 0.7 * dentro(t, T.congela, T.cae, T.baja1, T.baja1 + 0.4);
    p._cr = cr; p._sc = sc;
    return p;
  }

  /* =====================================================================================
   * ANDER (a la derecha, en espejo: mira a la izquierda)
   * ===================================================================================== */
  const TOB_A = AN.SUELO - AN.TOBILLO_ALTO;
  const CARAS_A = {
    inicio: E({ mx: 0.7, my: -0.75, c: 0.2, sd: 2, gd: 0.02, si: 4, gi: 0.04, sonr: 0.2, ancho: 0.9 }),
    tenso: E({ mx: 0.7, my: -0.85, iris: 0.9, sd: 12, gd: 0.1, si: 16, gi: 0.12, abre: 14, ancho: 0.7, sonr: -0.1 }),
    tension: E({ mx: 0.7, my: -0.9, iris: 0.85, sd: 20, gd: 0.12, si: 24, gi: 0.14, abre: 24, ancho: 0.65, sonr: -0.1 }),
    gol: E({ mx: 0.6, my: -0.6, c: 0.85, h: 1, sd: 22, gd: 0.14, si: 22, gi: 0.14, abre: 60, ancho: 1.25, sonr: 0.9, lengua: 0.3 }),
    fiesta: E({ mx: 0.9, my: -0.1, c: 0.85, h: 1, sd: 18, gd: 0.12, si: 18, gi: 0.12, abre: 46, ancho: 1.25, sonr: 1, lengua: 0.2 }),
    nota: E({ mx: 0.45, my: -1, iris: 0.85, sd: 22, gd: 0.1, si: 22, gi: 0.1, abre: 30, ancho: 0.9, sonr: 0.35 }),
    congelado: E({ mx: 0.45, my: -1, iris: 0.72, sd: 26, gd: 0.12, si: 26, gi: 0.12, abre: 26, ancho: 0.85, sonr: 0.25 }),
    chafado: E({ mx: 0.5, my: -0.7, c: 0.55, sd: 0, gd: 0.1, si: 4, gi: 0.12, abre: 0, ancho: 0.85, sonr: -0.3 }),
    miraG: E({ mx: 0.9, my: 0.05, c: 0.45, sd: 10, gd: 0.08, si: 16, gi: 0.12, abre: 0, ancho: 0.85, sonr: -0.25 }),
    bebe: E({ mx: 0.5, my: 0, c: 0.95, h: 0.4, sd: 6, gd: 0.04, si: 8, gi: 0.06, abre: 8, ancho: 0.6, sonr: 0 }),
    final: E({ mx: -0.85, my: 0, c: 0.35, sd: 14, gd: 0.06, si: 20, gi: 0.12, abre: 0, ancho: 0.9, sonr: 0.2 })
  };
  const GUION_CARA_A = [
    [T.tele, T.tele + 0.3, "inicio"], [T.copa0, T.copa0 + 0.3, "tenso"], [T.mejillas0, T.mejillas1, "tension"],
    [T.gol, T.gol + 0.07, "gol"], [T.junta0, T.junta0 + 0.2, "fiesta"], [T.nota - 0.06, T.nota + 0.06, "nota"],
    [T.congela, T.congela + 0.05, "congelado"], [T.baja0, T.baja1, "chafado"], [T.miran0 + 0.05, T.miran1 + 0.05, "miraG"],
    [T.sorbo0, T.sorbo0 + 0.15, "bebe"], [T.sorbo1, T.sorbo1 + 0.25, "final"]
  ];
  const CUERPOS_A = {
    inicio: { pel: 0, torso: 0.02, cab: -0.1 },
    inclina: { pel: 10, torso: 0.1, cab: -0.14 },
    gol: { pel: -12, torso: -0.08, cab: -0.22 },
    corro: { pel: 0, torso: -0.03, cab: -0.06 },
    mira: { pel: 0, torso: -0.03, cab: -0.22 },
    chafa: { pel: 16, torso: 0.08, cab: 0.08 },
    recto: { pel: 6, torso: 0.03, cab: 0.02 },
    bebe: { pel: 0, torso: -0.06, cab: -0.16 },
    final: { pel: 4, torso: 0.02, cab: 0 }
  };
  const GUION_CUERPO_A = [
    [0.9, 3.2, "inclina"], [T.gol, T.gol + 0.18, "gol"], [T.junta0, T.junta1, "corro"], [T.nota - 0.04, T.nota + 0.1, "mira"],
    [T.baja0, T.baja1, "chafa"], [T.miran0, T.miran1, "recto"], [T.sorbo0, T.sorbo0 + 0.2, "bebe"], [T.sorbo1, T.sorbo1 + 0.3, "final"]
  ];
  function cuerpoA(t) {
    const b = guion(GUION_CUERPO_A, CUERPOS_A, "inicio", t);
    const respira = t >= T.congela && t < T.cae ? 0 : Math.sin(t * 2.1 + 1);
    const fc = pie(PASOS_A.cerca, t, 26), fl = pie(PASOS_A.lejos, t, 26);
    const cr = corro(t), sc = 1 + 0.07 * cr.z, trX = x => XC + cr.dx + (x - XC) * sc;
    const X = trX((fc.x + fl.x) / 2);
    const p = {
      x: X, suelo: SUELO + 16 * cr.z - cr.h, s: S * sc, espejo: true, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: AN.PELVIS.x, y: AN.PELVIS.y + b.pel + respira * 1.2 + 34 * cr.pisa + 22 * campana(t, T.gol, T.gol + 0.25) },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    for (const [lado, f] of [["cerca", fc], ["lejos", fl]]) {
      const hx = AN.aHoja(p, { x: trX(f.x), y: 0 }).x, recoge = 50 * cr.tuck;
      p.piernas[lado] = { tob: { x: hx - 0.3 * recoge, y: TOB_A - (lado === "lejos" ? 8 : 0) - f.alza / (S * AN.K * sc) - recoge }, ang: f.ang + 0.35 * cr.tuck };
    }
    const ex = guion(GUION_CARA_A, CARAS_A, "inicio", t);
    const quieto = t >= T.congela && t < T.cae;
    p.cara = cara(ex, quieto ? 0 : parpadeo(t, [0.95, 2.5, 6.2, 10.2, 11.75, 13.15]));
    p.sudor = 0.55 * dentro(t, T.mejillas0, T.mejillas1, T.gol, T.gol + 0.2);
    p.rojo = 0.15 * dentro(t, T.gol, T.gol + 0.3, T.congela, T.baja0);
    p.cara.rubor = p.rojo;
    p._cr = cr; p._sc = sc;
    return p;
  }

  /* ---------- la caña de Ander (en unidades de mano; el puño la agarra por el medio) ---------- */
  const VASO = { x0: -12, x1: 16, arriba: -38, abajo: 16 };
  const BORDE_VASO = { x: 2, y: VASO.arriba };
  function estadoVaso(t) {
    const espuma = 1 - suave(fase(t, T.espuma - 0.03, T.espuma + 0.06));
    const nivel = lerp(0.84, 0.62, suave(fase(t, T.espuma - 0.02, T.espuma + 0.1))) - 0.14 * suave(fase(t, T.sorbo0 + 0.1, T.sorbo1 - 0.05));
    return { espuma, nivel };
  }
  function vaso(g, t, inclina, chap) {
    const e = estadoVaso(t), { x0, x1, arriba, abajo } = VASO;
    const forma = () => { g.beginPath(); g.moveTo(x0, arriba); g.lineTo(x1, arriba); g.lineTo(x1 - 3, abajo - 3); g.quadraticCurveTo(x1 - 3, abajo, x1 - 6, abajo); g.lineTo(x0 + 6, abajo); g.quadraticCurveTo(x0 + 3, abajo, x0 + 3, abajo - 3); g.closePath(); };
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    forma(); g.fillStyle = "rgba(214,236,255,0.28)"; g.fill();
    g.save(); forma(); g.clip();
    // cerveza: superficie horizontal en el mundo (compensa la inclinación del vaso) y chapoteo
    const yN = lerp(abajo - 2, arriba + 2, e.nivel), a = -inclina + chap;
    const sup = x => yN + Math.tan(a) * (x - 2);
    g.beginPath(); g.moveTo(x0 - 4, sup(x0 - 4)); g.lineTo(x1 + 4, sup(x1 + 4)); g.lineTo(x1 + 4, abajo + 4); g.lineTo(x0 - 4, abajo + 4); g.closePath();
    const gr = g.createLinearGradient(0, arriba, 0, abajo); gr.addColorStop(0, "#ffc23a"); gr.addColorStop(1, "#d98a10");
    g.fillStyle = gr; g.fill();
    g.fillStyle = "rgba(255,240,180,0.85)";
    for (let i = 0; i < 6; i++) { const ph = (t * (0.5 + hash(i) * 0.5) + hash(i + 7)) % 1, bx = x0 + 5 + hash(i + 3) * (x1 - x0 - 10), by = lerp(abajo - 4, yN + 3, ph);
      if (by > sup(bx) + 2) { g.beginPath(); g.arc(bx, by, 1 + hash(i + 5), 0, Math.PI * 2); g.fill(); } }
    // espuma
    if (e.espuma > 0.01) {
      const h = 10 * e.espuma;
      g.beginPath(); g.moveTo(x0 - 4, sup(x0 - 4) - h); g.lineTo(x1 + 4, sup(x1 + 4) - h); g.lineTo(x1 + 4, sup(x1 + 4) + 1); g.lineTo(x0 - 4, sup(x0 - 4) + 1); g.closePath();
      g.fillStyle = "#fff7e6"; g.fill();
    }
    // brillos del cristal
    g.fillStyle = "rgba(255,255,255,0.7)"; g.fillRect(x0 + 5, arriba + 6, 3, abajo - arriba - 14);
    g.restore();
    // corona de espuma que asoma por encima del borde
    if (e.espuma > 0.01) {
      const k = e.espuma; g.beginPath(); g.moveTo(x0, arriba + 1);
      for (let i = 0; i < 4; i++) { const x = x0 + 4 + (x1 - x0 - 8) * i / 3; g.arc(x, arriba - 1 - (i % 2) * 1.5, 5.5 * k + 1.5, Math.PI, 0); }
      g.lineTo(x1, arriba + 1); g.closePath(); g.fillStyle = "#fff7e6"; g.fill(); g.lineWidth = 1.8; g.strokeStyle = "#0b0a0e"; g.stroke();
    }
    forma(); g.lineWidth = 2.1; g.strokeStyle = "#0b0a0e"; g.stroke();
    g.lineWidth = 1.3; g.beginPath(); g.moveTo(x0 + 3, abajo - 8); g.lineTo(x1 - 3, abajo - 8); g.stroke();
    g.restore();
  }

  /* =====================================================================================
   * MANOS (dependen de los dos cuerpos: las manos cogidas van al punto medio de los hombros)
   * ===================================================================================== */
  const junta = t => dentro(t, T.junta0 + 0.06, T.junta1, T.suelta0, T.suelta1);
  function puntoUnion(pG, pA, t) {
    const hg = G.aPantalla(pG, G.tronco(pG)(G.HOMBRO)), ha = AN.aPantalla(pA, AN.tronco(pA)(AN.HOMBRO));
    const sc = pG._sc, baja = suave(fase(t, T.baja0, T.baja1));
    return { x: (hg.x + ha.x) / 2, y: (hg.y + ha.y) / 2 - 22 * sc + 100 * sc * baja, sc };
  }
  function manosG(p, pA, t) {
    const Tr = G.tronco(p), hC = Tr(G.HOMBRO_C), hL = Tr(G.HOMBRO), H = G.cabeza(p);
    let c = { x: BOLS_C.x, y: BOLS_C.y }, l = { x: BOLS_L.x, y: BOLS_L.y };
    let cpu = 0, lpu = 0, cang = 0, lang = 0, cmu = -1.75, lmu = -1.75, cd = RELAJADA, ld = RELAJADA;
    const pone = (w, cc, ll) => {
      if (w <= 0) return;
      if (cc) { c = mezcla(c, cc.q, w); cpu = lerp(cpu, cc.pu ?? 1, w); cang = lerp(cang, cc.ang || 0, w); cmu = lerp(cmu, cc.mu, w); cd = mezclaD(cd, cc.d, w); }
      if (ll) { l = mezcla(l, ll.q, w); lpu = lerp(lpu, ll.pu ?? 1, w); lang = lerp(lang, ll.ang || 0, w); lmu = lerp(lmu, ll.mu, w); ld = mezclaD(ld, ll.d, w); }
    };
    // se muerde las uñas (la mano lejana delante de la boca, el codo hacia abajo)
    const muerde = dentro(t, T.muerde0, T.muerde0 + 0.3, T.muerde1, T.mejillas1);
    if (muerde > 0) {
      const b = G.boca(p), q = { x: b.x + 52 + 3 * Math.sin(t * 21), y: b.y + 18 + 5 * Math.sin(t * 24) };
      pone(muerde, null, { q, mu: muHacia(q, hL), d: MUERDE });
    }
    // manos a las mejillas
    const mej = dentro(t, T.mejillas0, T.mejillas1, T.gol - 0.02, T.gol + 0.1);
    if (mej > 0) { const qc = H.a({ x: 650, y: 760 }), ql = H.a({ x: 960, y: 790 }); pone(mej, { q: qc, mu: muHacia(qc, hC), d: ABIERTA }, { q: ql, mu: muHacia(ql, hL), d: ABIERTA }); }
    // ¡gol! puños arriba, sacudiéndolos
    const sac = 12 * Math.sin(t * 17), sac2 = 12 * Math.sin(t * 19 + 1);
    pone(dentro(t, T.gol, T.gol + 0.12, T.corro0 - 0.2, T.corro0 + 0.1), { q: Tr({ x: -30, y: 80 + sac }), mu: 1.2, d: PUNO }, null);
    pone(dentro(t, T.gol, T.gol + 0.12, T.junta0, T.junta1), null, { q: Tr({ x: 590, y: 280 + sac2 }), mu: muHacia(Tr({ x: 590, y: 280 }), hL), d: PUNO });
    // corro: el puño cercano bombea a compás (y se queda arriba congelado)
    const bo = bombeo(t);
    pone(dentro(t, T.corro0 - 0.2, T.corro0 + 0.1, T.baja0, T.baja1), { q: Tr({ x: -46, y: 190 - 70 * bo }), mu: 0.9, d: PUNO }, null);
    // manos cogidas
    const jw = junta(t);
    if (jw > 0 && pA) {
      const m = puntoUnion(p, pA, t), q = G.aHoja(p, { x: m.x - 2.5 * m.sc, y: m.y + 1.5 * m.sc });
      pone(jw, null, { q, mu: muHacia(q, hL), d: AGARRA });
    }
    // baja los brazos despacio: la cercana se queda colgando junto al muslo
    pone(tramo(t, T.baja0, T.baja1), { q: Tr({ x: 70, y: 660 }), mu: -1.6, d: RELAJADA }, null);
    // se sueltan: la lejana cae al costado y luego al bolsillo; la cercana al bolsillo después
    pone(dentro(t, T.suelta0, T.suelta1, T.bolsL0, T.bolsL1), null, { q: Tr({ x: 392, y: 662 }), mu: -1.65, d: RELAJADA });
    const vL = tramo(t, T.bolsL0, T.bolsL1);
    if (vL > 0) { l = mezcla(l, BOLS_L, vL); lpu = lerp(lpu, 0, vL); lang = lerp(lang, 0, vL); lmu = lerp(lmu, -1.75, vL); }
    const vC = tramo(t, T.bolsC0, T.bolsC1);
    if (vC > 0) { c = mezcla(c, BOLS_C, vC); cpu = lerp(cpu, 0, vC); cang = lerp(cang, 0, vC); cmu = lerp(cmu, -1.75, vC); }
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: -1, puno: cpu, dedos: cd };
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: -1, puno: lpu, dedos: ld };
    p.capaCabeza = (g, tt) => espumaPelo(g, tt);
    return p;
  }

  const R_MA = AN.MUNECA_R * AN.JK;
  function manosA(p, pG, t) {
    const Tr = AN.tronco(p), hC = Tr(AN.HOMBRO_C), hL = Tr(AN.HOMBRO);
    // mano cercana: siempre con la caña (puño de siempre + vaso)
    let c = Tr({ x: 200, y: 545 }), cang = 0;
    const cmuDe = q => muHacia(q, hC);
    // se lleva la caña hacia la boca… y se queda a medias con los nervios
    const copa = dentro(t, T.copa0, T.copa1, T.gol - 0.05, T.gol + 0.08);
    if (copa > 0) { const b = AN.boca(p); c = mezcla(c, { x: b.x + 70, y: b.y + 330 + 2 * Math.sin(t * 20) }, copa); }
    // ¡gol!: brazos arriba (la caña en alto, inclinada hacia atrás al lanzar la espuma)
    const arriba = dentro(t, T.brazosA0, T.brazosA1, T.corro0 - 0.2, T.corro0 + 0.1);
    c = mezcla(c, Tr({ x: -30, y: 70 + 10 * Math.sin(t * 15) }), arriba);
    cang = lerp(cang, -0.35 * campana(t, T.brazosA0, T.espuma + 0.18) + 0.08 * Math.sin(t * 15) * arriba, arriba);
    // corro: la caña en alto, a compás
    const bo = bombeo(t), enCorro = dentro(t, T.corro0 - 0.2, T.corro0 + 0.1, T.baja0, T.baja1);
    c = mezcla(c, Tr({ x: -26, y: 175 - 55 * bo }), enCorro);
    cang = lerp(cang, 0.12 * Math.sin(2 * Math.PI * (Math.min(t, T.congela) - T.corro0) / P_SALTO), enCorro);
    // baja la caña despacio
    c = mezcla(c, Tr({ x: 200, y: 545 }), tramo(t, T.baja0, T.baja1));
    // sorbo resignado: el borde del vaso a los labios, inclinado hacia la cara
    const sorbo = dentro(t, T.sorbo0, T.sorbo0 + 0.25, T.sorbo1 - 0.1, T.sorbo1 + 0.2);
    if (sorbo > 0) {
      const b = AN.boca(p), ai = -0.85, o = AN.rotP({ x: BORDE_VASO.x * AN.JK, y: BORDE_VASO.y * AN.JK }, ai);
      c = mezcla(c, { x: b.x - o.x + 8, y: b.y - o.y + 4 }, sorbo); cang = lerp(cang, ai, sorbo);
    }
    const chap = 0.15 * Math.sin(t * 11) * (arriba + enCorro) * (t >= T.congela && t < T.cae ? 0 : 1);
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmuDe(c), dobla: -1, puno: 1, objeto: (g, tt) => vaso(g, tt, cang, chap) };
    // mano lejana: bolsillo → puño arriba → la mano de Guillermo → bolsillo
    let l = { x: AN.BOLSILLO_L.x, y: AN.BOLSILLO_L.y }, lpu = 0, lang = 0, lmu = -1.75, ld = RELAJADA;
    const pone = (w, ll) => { if (w <= 0) return; l = mezcla(l, ll.q, w); lpu = lerp(lpu, ll.pu ?? 1, w); lang = lerp(lang, ll.ang || 0, w); lmu = lerp(lmu, ll.mu, w); ld = mezclaD(ld, ll.d, w); };
    pone(dentro(t, T.brazosA0, T.brazosA1, T.junta0, T.junta1), { q: Tr({ x: 620, y: 250 + 12 * Math.sin(t * 18 + 2) }), mu: muHacia(Tr({ x: 620, y: 250 }), hL), d: PUNO });
    const jw = junta(t);
    if (jw > 0 && pG) {
      const m = puntoUnion(pG, p, t), q = AN.aHoja(p, { x: m.x + 2.5 * m.sc, y: m.y - 1.5 * m.sc });
      pone(jw, { q, mu: muHacia(q, hL), d: AGARRA });
    }
    pone(dentro(t, T.suelta0, T.suelta1, T.bolsL0, T.bolsL1), { q: Tr({ x: 412, y: 650 }), mu: -1.65, d: RELAJADA });
    const vL = tramo(t, T.bolsL0, T.bolsL1);
    if (vL > 0) { l = mezcla(l, AN.BOLSILLO_L, vL); lpu = lerp(lpu, 0, vL); lang = lerp(lang, 0, vL); lmu = lerp(lmu, -1.75, vL); }
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: 1, puno: lpu, dedos: ld };
    p._chap = chap;
    return p;
  }
  // borde de la caña en pantalla (de donde sale la espuma)
  function bordeVaso(pA) {
    const m = pA.manoCerca, o = AN.rotP({ x: BORDE_VASO.x * AN.JK, y: BORDE_VASO.y * AN.JK }, m.ang || 0);
    return AN.aPantalla(pA, { x: m.x + o.x, y: m.y + o.y });
  }
  const coronilla = pG => G.aPantalla(pG, G.cabeza(pG).a(TOPE_G));

  function poses(t) {
    const pG = cuerpoG(t), pA = cuerpoA(t);
    manosG(pG, pA, t); manosA(pA, pG, t);
    return { g: pG, a: pA };
  }

  /* =====================================================================================
   * ESPUMA: vuela de la caña de Ander al pelo de Guillermo y se queda ahí
   * ===================================================================================== */
  let VUELO = null, LAMPARA = null, CONF_FINAL = null;
  function prepara() {
    const p0 = bordeVaso(poses(T.espuma).a), p1 = coronilla(poses(T.espumaLlega).g);
    const Tf = T.espumaLlega - T.espuma, gv = 1500;
    VUELO = { p0, gv, vx: (p1.x - p0.x) / Tf, vy: (p1.y - 6 - p0.y - 0.5 * gv * Tf * Tf) / Tf };
    const c = coronilla(poses(T.coco).g);
    LAMPARA = { x: c.x - 4, yb: c.y + 2, piv: -30 };
    CONF_FINAL = { x0: c.x + 60, t0: T.confeti - 1.9 };
  }
  const posVuelo = t => { const u = t - T.espuma; return { x: VUELO.p0.x + VUELO.vx * u, y: VUELO.p0.y + VUELO.vy * u + 0.5 * VUELO.gv * u * u }; };
  function espumaVuela(g, t) {
    if (t < T.espuma || t >= T.espumaLlega) return;
    const u = t - T.espuma, q = posVuelo(t), k = suave(fase(u, 0, 0.08)), giro = u * 6;
    g.save(); g.translate(q.x, q.y); g.rotate(giro); g.scale(k, k);
    const bolas = [[-6, 2, 7], [3, -4, 8], [8, 4, 6], [-1, 6, 6]];
    const camino = () => { g.beginPath(); for (const [x, y, r] of bolas) { g.moveTo(x + r, y); g.arc(x, y, r, 0, Math.PI * 2); } };
    camino(); g.lineWidth = 2.4; g.strokeStyle = "#5b4a3a"; g.stroke(); camino(); g.fillStyle = "#fff6e2"; g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(1, -6, 2.5, 0, Math.PI * 2); g.fill();
    g.restore();
    // gotitas que se quedan atrás
    g.save(); g.fillStyle = "#fff3d8"; g.strokeStyle = "#5b4a3a"; g.lineWidth = 1;
    for (let i = 1; i <= 4; i++) { const tt = t - i * 0.05; if (tt < T.espuma) continue; const r = posVuelo(tt);
      g.globalAlpha = 1 - i * 0.2; g.beginPath(); g.arc(r.x + 3 * Math.sin(i * 2.1), r.y, 2.4 - i * 0.35, 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.restore();
  }
  // salpicadura al caer en el pelo
  function salpica(g, t, pG) {
    const k = fase(t, T.espumaLlega, T.espumaLlega + 0.35); if (k <= 0 || k >= 1) return;
    const c = coronilla(pG);
    g.save(); g.fillStyle = "#fff3d8"; g.strokeStyle = "#5b4a3a"; g.lineWidth = 1.1; g.globalAlpha = 1 - k;
    for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.1 + 0.8 * i / 6), d = 10 + 26 * salida(k);
      g.beginPath(); g.arc(c.x + Math.cos(a) * d, c.y - 4 + Math.sin(a) * d + 30 * k * k, 2.6 * (1 - 0.5 * k), 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.restore();
  }
  // espuma pegada en el pelo de Guillermo (retrato), con goterones; una gota le cae en la nariz
  const ESP_C = { x: 812, y: 286 }, NARIZ = { x: 866, y: 668 };
  function espumaPelo(g, t) {
    const k0 = fase(t, T.espumaLlega, T.espumaLlega + 0.12); if (k0 <= 0) return;
    const k = k0 < 1 ? salida(k0) * (1 + 0.2 * Math.sin(Math.PI * k0)) : 1;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.save(); g.translate(ESP_C.x, ESP_C.y); g.scale(k, k);
    const bolas = [[-112, 26, 44], [-62, -14, 56], [0, -30, 62], [62, -16, 54], [112, 18, 42], [-22, 26, 50], [48, 28, 44]];
    const camino = () => { g.beginPath(); for (const [x, y, r] of bolas) { g.moveTo(x + r, y); g.arc(x, y, r, 0, Math.PI * 2); } };
    camino(); g.lineWidth = 13; g.strokeStyle = "#5b4a3a"; g.stroke();
    camino(); g.fillStyle = "#fff6e2"; g.fill();
    g.save(); camino(); g.clip(); g.fillStyle = "#eadcb8"; g.beginPath(); g.ellipse(0, 70, 150, 42, 0, 0, Math.PI * 2); g.fill(); g.restore();
    g.fillStyle = "#ffffff"; for (const [x, y, r] of bolas) { g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.38, r * 0.28, r * 0.2, -0.4, 0, Math.PI * 2); g.fill(); }
    // goterones que cuelgan
    for (const [x, y0, l0, f] of [[-96, 58, 30, 0], [70, 60, 40, 1.7], [10, 70, 26, 3.1]]) {
      const l = l0 * (0.75 + 0.25 * Math.sin(t * 2.2 + f));
      g.beginPath(); g.ellipse(x, y0 + l * 0.5, 13, l * 0.6, 0, 0, Math.PI * 2); g.fillStyle = "#fff6e2"; g.fill(); g.lineWidth = 9; g.strokeStyle = "#5b4a3a"; g.stroke();
      g.beginPath(); g.ellipse(x, y0 + l * 0.2, 11, l * 0.45, 0, 0, Math.PI * 2); g.fillStyle = "#fff6e2"; g.fill();
    }
    g.restore();
    // la gota gorda: se forma, cae por la frente y se queda en la punta de la nariz
    const sale = { x: ESP_C.x + 70, y: ESP_C.y + 96 };
    const forma = fase(t, T.gota - 0.45, T.gota), cae = fase(t, T.gota, T.gota + 0.3);
    if (forma > 0) {
      let q, r = 12 + 10 * forma;
      if (cae <= 0) {
        // el goterón se estira desde la espuma antes de soltarse
        q = { x: sale.x, y: sale.y + 34 * forma * forma };
        g.beginPath(); g.ellipse(sale.x, (sale.y - 30 + q.y) / 2, 9 * (1 - 0.5 * forma), (q.y - sale.y + 30) / 2, 0, 0, Math.PI * 2);
        g.fillStyle = "#fff6e2"; g.fill();
      }
      else if (cae < 1) { const e = cae * cae; q = { x: lerp(sale.x, NARIZ.x, e), y: lerp(sale.y + 22, NARIZ.y - 10, e) }; }
      else { q = { x: NARIZ.x, y: NARIZ.y - 10 }; r = 22 * (1 + 0.25 * Math.exp(-(t - T.gota - 0.3) * 10) * Math.sin((t - T.gota - 0.3) * 30)); }
      g.beginPath(); g.ellipse(q.x, q.y, r, r * (cae > 0 && cae < 1 ? 1.25 : 1), 0, 0, Math.PI * 2);
      g.fillStyle = "#fff6e2"; g.fill(); g.lineWidth = 9; g.strokeStyle = "#5b4a3a"; g.stroke();
      g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(q.x - r * 0.35, q.y - r * 0.35, r * 0.3, r * 0.22, -0.4, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  /* =====================================================================================
   * LA TELE: un partido de dibujos (sin letras; solo el marcador de números)
   * ===================================================================================== */
  const TV = { x: 392, y: 10, w: 240, h: 146 };
  const PANT = { x: 402, y: 20, w: 220, h: 124 };
  const GRADA_H = 25, VW = 270, ESC_TV = PANT.w / VW, MUNDO = 660, META = 600;
  const CAMPO_Y0 = PANT.y + GRADA_H + 8, CAMPO_H = PANT.h - GRADA_H - 14;
  const JUG = [   // equipo, claves [tau, x, fila]
    ["r", [[0, 246, 0.6], [1.0, 281, 0.5], [2.0, 316, 0.64], [3.2, 358, 0.55], [4.2, 400, 0.5], [5.5, 470, 0.4], [7.2, 470, 0.42]]],   // pasador
    ["r", [[0, 395, 0.32], [2.0, 420, 0.36], [3.2, 472, 0.42], [3.42, 474, 0.43], [3.62, 500, 0.46], [4.3, 545, 0.3], [5.5, 505, 0.2], [7.2, 480, 0.24]]],   // delantero
    ["r", [[0, 300, 0.84], [3.0, 380, 0.8], [4.3, 470, 0.45], [5.5, 495, 0.28], [7.2, 470, 0.3]]],
    ["b", [[0, 438, 0.56], [3.2, 452, 0.53], [3.5, 468, 0.5], [3.9, 520, 0.47], [5.5, 545, 0.56], [7.2, 540, 0.6]]],   // último defensa
    ["b", [[0, 410, 0.2], [3.2, 428, 0.26], [4.2, 480, 0.33], [7.2, 500, 0.36]]],
    ["b", [[0, 330, 0.4], [3.0, 352, 0.42], [4.2, 410, 0.52], [7.2, 430, 0.56]]],
    ["k", [[0, 586, 0.5], [3.62, 586, 0.5], [3.8, 590, 0.6], [4.4, 590, 0.62], [5.5, 588, 0.52], [7.2, 588, 0.5]]]    // portero
  ];
  const COL_EQ = { r: ["#e8322e", "#6e0d10"], b: ["#2f66e8", "#0f2068"], k: ["#f4d62e", "#6e5c06"] };
  function kf(lista, tau) {
    if (tau <= lista[0][0]) return { x: lista[0][1], r: lista[0][2] };
    for (let i = 1; i < lista.length; i++) if (tau <= lista[i][0]) {
      const [t0, x0, r0] = lista[i - 1], [t1, x1, r1] = lista[i], k = (tau - t0) / (t1 - t0);
      return { x: lerp(x0, x1, k), r: lerp(r0, r1, k) };
    }
    const u = lista[lista.length - 1]; return { x: u[1], r: u[2] };
  }
  function balon(tau) {
    const r1 = JUG[0][1], r9 = JUG[1][1], osc = (a, b) => 2 * Math.sin(tau * 9) * clamp(Math.min(tau - a, b - tau) / 0.15);
    if (tau < 3.2) { const q = kf(r1, tau); return { x: q.x + 6 + osc(-9, 3.2), r: q.r + 0.01, h: 0 }; }
    if (tau < 3.42) { const a = kf(r1, 3.2), b = kf(r9, 3.42), k = fase(tau, 3.2, 3.42); return { x: lerp(a.x + 6, b.x + 6, k), r: lerp(a.r, b.r, k) + 0.01, h: 0 }; }
    if (tau < 3.62) { const q = kf(r9, tau); return { x: q.x + 6 + osc(3.42, 3.62), r: q.r + 0.01, h: 0 }; }
    if (tau < 3.88) { const a = kf(r9, 3.62), k = fase(tau, 3.62, 3.88); return { x: lerp(a.x + 6, 607, k), r: lerp(a.r + 0.01, 0.5, k), h: 10 * Math.sin(Math.PI * k) }; }
    const u = tau - 3.88; return { x: 607 + 6 * (1 - Math.exp(-u * 6)), r: 0.5 + 0.04 * (1 - Math.exp(-u * 4)), h: 0 };
  }
  // tiempo del partido que se ve en la tele (en directo, rebobinando, a cámara lenta y en pausa)
  function tauTele(t) {
    if (t < T.repe0) return t;
    if (t < T.repe1) return lerp(T.repe0, 3.0, suave(fase(t, T.repe0, T.repe1)));
    if (t < T.pausa) return 3.0 + 0.2 * fase(t, T.repe1, T.pausa);
    return 3.2;
  }
  let GRADA = null;
  function creaGrada() {
    const c = document.createElement("canvas"); c.width = Math.ceil(MUNDO * ESC_TV) + 8; c.height = GRADA_H; const g = c.getContext("2d");
    g.fillStyle = "#16182a"; g.fillRect(0, 0, c.width, c.height);
    const cols = ["#e8322e", "#2f66e8", "#f2f2f2", "#e8322e", "#ffd84a", "#2f66e8"];
    for (let fila = 0; fila < 4; fila++) for (let x = 2 + (fila % 2) * 2; x < c.width; x += 4.2) {
      const y = 4 + fila * 4.6, i = Math.floor(x * 7 + fila * 131);
      g.fillStyle = cols[Math.floor(hash(i) * cols.length)]; g.fillRect(x - 1.4, y + 1, 2.8, 2.4);
      g.fillStyle = hash(i + 3) < 0.5 ? "#f0c49c" : "#c98d62"; g.beginPath(); g.arc(x, y, 1.1, 0, Math.PI * 2); g.fill();
    }
    // vallas publicitarias de colores (sin letras)
    for (let x = 0; x < c.width; x += 26) { g.fillStyle = ["#ff7a1a", "#1ac9ff", "#ffe24a", "#ff3d6a"][Math.floor(x / 26) % 4]; g.fillRect(x, GRADA_H - 4, 24, 4); }
    return c;
  }
  function jugador(g, x, y, eq, fase0, corre, gira) {
    const [col, osc] = COL_EQ[eq];
    g.save(); g.translate(x, y);
    g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse(0, 0.5, 4.2, 1.3, 0, 0, Math.PI * 2); g.fill();
    if (gira) { g.translate(0, -3); g.rotate(gira); g.translate(0, 3); }
    const pz = 2 * Math.sin(fase0) * corre;
    g.strokeStyle = "#1a1410"; g.lineWidth = 1.5; g.lineCap = "round";
    g.beginPath(); g.moveTo(-1, -4); g.lineTo(-1 - pz, 0); g.moveTo(1, -4); g.lineTo(1 + pz, 0); g.stroke();
    g.fillStyle = col; g.strokeStyle = osc; g.lineWidth = 0.9;
    g.beginPath(); g.ellipse(0, -6.8, 3.3, 3.6, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#f0c49c"; g.beginPath(); g.arc(0, -12, 2.3, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#3a2214"; g.stroke();
    g.restore();
  }
  // dígito de 7 segmentos
  const SEG = { 0: "abcdef", 1: "bc", 2: "abged", 3: "abgcd", 4: "fgbc", 5: "afgcd", 6: "afgedc", 7: "abc", 8: "abcdefg", 9: "abcdfg" };
  function digito(g, x, y, w, h, n, color) {
    const e = w * 0.2, segs = {
      a: [x + e, y, w - 2 * e, e], d: [x + e, y + h - e, w - 2 * e, e], g: [x + e, y + h / 2 - e / 2, w - 2 * e, e],
      f: [x, y + e, e, h / 2 - e], b: [x + w - e, y + e, e, h / 2 - e], e: [x, y + h / 2, e, h / 2 - e], c: [x + w - e, y + h / 2, e, h / 2 - e] };
    for (const k in segs) { const [sx, sy, sw, sh] = segs[k]; g.fillStyle = SEG[n].includes(k) ? color : "rgba(255,255,255,0.08)"; g.fillRect(sx, sy, sw, sh); }
  }
  function marcador(g, t) {
    const v = t >= T.gol && t < T.marcador ? 1 : 0;
    const puls = campana(t, T.gol, T.gol + 0.35) + campana(t, T.marcador, T.marcador + 0.35);
    g.save(); g.translate(PANT.x + 26, PANT.y + 11); g.scale(1 + 0.22 * puls, 1 + 0.22 * puls);
    g.fillStyle = "rgba(10,10,16,0.88)"; g.beginPath(); g.roundRect ? g.roundRect(-21, -8, 42, 16, 3) : g.rect(-21, -8, 42, 16); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.5)"; g.lineWidth = 0.8; g.stroke();
    g.fillStyle = COL_EQ.r[0]; g.fillRect(-19, -6, 3, 12); g.fillStyle = COL_EQ.b[0]; g.fillRect(16, -6, 3, 12);
    digito(g, -13, -5.5, 7, 11, v, "#ffffff"); g.fillStyle = "#ffffff"; g.fillRect(-2, -0.7, 4, 1.4); digito(g, 6, -5.5, 7, 11, 0, "#ffffff");
    g.restore();
  }
  function pintaTele(g, t) {
    if (!GRADA) GRADA = creaGrada();
    const tau = tauTele(t), bl = balon(tau);
    const vc0 = 0.5 * balon(Math.max(0, tau - 0.3)).x + 0.5 * bl.x, vc = lerp(vc0, 462, suave(fase(t, T.repe1 - 0.25, T.pausa)));
    const x0 = clamp(vc - VW / 2, 0, MUNDO - VW);
    const X = wx => PANT.x + (wx - x0) * ESC_TV, Y = r => CAMPO_Y0 + r * CAMPO_H;
    g.save();
    g.beginPath(); g.rect(PANT.x, PANT.y, PANT.w, PANT.h); g.clip();
    g.drawImage(GRADA, PANT.x - x0 * ESC_TV, PANT.y);
    // césped a franjas
    g.fillStyle = "#2f8a3a"; g.fillRect(PANT.x, PANT.y + GRADA_H, PANT.w, PANT.h - GRADA_H);
    g.fillStyle = "#3a9c45";
    for (let k = Math.floor(x0 / 40); k * 40 < x0 + VW; k++) if (k % 2 === 0) g.fillRect(X(k * 40), PANT.y + GRADA_H, 40 * ESC_TV, PANT.h);
    // líneas del campo
    g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 1.1;
    g.beginPath(); g.moveTo(PANT.x, Y(0) - 2); g.lineTo(PANT.x + PANT.w, Y(0) - 2); g.moveTo(PANT.x, Y(1) + 2); g.lineTo(PANT.x + PANT.w, Y(1) + 2); g.stroke();
    g.beginPath(); g.moveTo(X(330), Y(0) - 2); g.lineTo(X(330), Y(1) + 2); g.stroke();
    g.beginPath(); g.ellipse(X(330), Y(0.5), 34 * ESC_TV, CAMPO_H * 0.22, 0, 0, Math.PI * 2); g.stroke();
    g.strokeRect(X(520), Y(0.17), (META - 520) * ESC_TV, Y(0.83) - Y(0.17));
    g.strokeRect(X(572), Y(0.35), (META - 572) * ESC_TV, Y(0.65) - Y(0.35));
    g.beginPath(); g.moveTo(X(META), Y(0) - 2); g.lineTo(X(META), Y(1) + 2); g.stroke();
    // portería: red detrás (abombada al marcar) y postes
    const bomba = tau >= 3.88 ? 7 * Math.exp(-(tau - 3.88) * 5) * Math.abs(Math.cos((tau - 3.88) * 12)) : 0;
    const pr = [0.36, 0.64], alto = 15, fondo = META + 16 + bomba;
    g.strokeStyle = "rgba(255,255,255,0.55)"; g.lineWidth = 0.7;
    for (let i = 0; i <= 6; i++) { const y = Y(pr[0]) - alto + i * ((Y(pr[1]) - Y(pr[0]) + alto) / 6); g.beginPath(); g.moveTo(X(META), y); g.lineTo(X(fondo), y + 2); g.stroke(); }
    for (let i = 0; i <= 4; i++) { const x = lerp(X(META), X(fondo), i / 4); g.beginPath(); g.moveTo(x, Y(pr[0]) - alto); g.lineTo(x, Y(pr[1])); g.stroke(); }
    const poste = r => { g.strokeStyle = "#ffffff"; g.lineWidth = 2; g.beginPath(); g.moveTo(X(META), Y(r)); g.lineTo(X(META), Y(r) - alto); g.stroke(); };
    poste(pr[0]);
    // jugadores y balón de atrás adelante
    const cosas = JUG.map(([eq, l], i) => ({ i, eq, q: kf(l, tau) }));
    cosas.push({ i: -1, q: { x: bl.x, r: bl.r } });
    cosas.sort((a, b) => a.q.r - b.q.r);
    for (const c of cosas) {
      if (c.i < 0) {
        const x = X(bl.x), y = Y(bl.r);
        g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse(x, y + 0.5, 2.4, 0.9, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#ffffff"; g.strokeStyle = "#1a1410"; g.lineWidth = 0.8; g.beginPath(); g.arc(x, y - 2.2 - bl.h, 2.2, 0, Math.PI * 2); g.fill(); g.stroke();
        continue;
      }
      const gira = c.eq === "k" ? -1.25 * dentro(tau, 3.66, 3.78, 4.3, 4.6) : 0;
      jugador(g, X(c.q.x), Y(c.q.r), c.eq, tau * 13 + c.i * 1.7, c.eq === "k" ? 0.3 : 1, gira);
    }
    // anillo y línea de fuera de juego en la pausa
    const fj = tramo(t, T.pausa + 0.02, T.pausa + 0.16);
    if (fj > 0) {
      const xl = X(kf(JUG[3][1], 3.2).x - 2);
      g.strokeStyle = "#ffe14d"; g.lineWidth = 1.8; g.beginPath(); g.moveTo(xl, Y(0) - 2); g.lineTo(xl, lerp(Y(0) - 2, Y(1) + 2, fj)); g.stroke();
      const d = kf(JUG[1][1], 3.2); g.lineWidth = 1.3; g.beginPath(); g.ellipse(X(d.x), Y(d.r) - 6, 7 * fj, 9 * fj, 0, 0, Math.PI * 2); g.stroke();
    }
    poste(pr[1]);
    g.strokeStyle = "#ffffff"; g.lineWidth = 2; g.beginPath(); g.moveTo(X(META), Y(pr[0]) - alto); g.lineTo(X(META), Y(pr[1]) - alto); g.stroke();
    // flashes de la grada tras el gol
    const fl = dentro(tau, 3.9, 4.0, 5.5, 6.5);
    if (fl > 0) for (let i = 0; i < 14; i++) { const ph = (tau * 3 + hash(i)) % 1; if (ph > 0.25) continue;
      g.globalAlpha = fl * (1 - ph * 4); g.fillStyle = "#ffffff"; g.beginPath(); g.arc(PANT.x + hash(i + 20) * PANT.w, PANT.y + 3 + hash(i + 40) * (GRADA_H - 8), 1.6, 0, Math.PI * 2); g.fill(); }
    g.globalAlpha = 1;
    // repetición: rebobinado (tinte y rayas), cámara lenta y pausa
    const reb = dentro(t, T.repe0, T.repe0 + 0.08, T.repe1 - 0.05, T.repe1 + 0.03);
    const lenta = dentro(t, T.repe1, T.repe1 + 0.05, T.pausa - 0.03, T.pausa + 0.02);
    const pausa = tramo(t, T.pausa, T.pausa + 0.06);
    if (reb > 0) {
      g.fillStyle = `rgba(110,140,255,${0.2 * reb})`; g.fillRect(PANT.x, PANT.y, PANT.w, PANT.h);
      g.fillStyle = `rgba(255,255,255,${0.3 * reb})`;
      for (let i = 0; i < 3; i++) g.fillRect(PANT.x, PANT.y + ((t * 300 + i * 43) % PANT.h), PANT.w, 2.5);
    }
    if (pausa > 0) { g.fillStyle = `rgba(80,90,120,${0.18 * pausa})`; g.fillRect(PANT.x, PANT.y, PANT.w, PANT.h); }
    // iconos de la repetición (arriba a la derecha): ◀◀, ▶ y ❚❚
    const ix = PANT.x + PANT.w - 22, iy = PANT.y + 10;
    g.fillStyle = "#ffffff";
    if (reb > 0) { g.globalAlpha = reb; for (const dx of [0, 8]) { g.beginPath(); g.moveTo(ix + dx - 4, iy); g.lineTo(ix + dx + 4, iy - 5); g.lineTo(ix + dx + 4, iy + 5); g.closePath(); g.fill(); } }
    if (lenta > 0) { g.globalAlpha = lenta; g.beginPath(); g.moveTo(ix + 1, iy - 5); g.lineTo(ix + 10, iy); g.lineTo(ix + 1, iy + 5); g.closePath(); g.fill(); }
    if (pausa > 0) { g.globalAlpha = pausa; g.fillRect(ix + 1, iy - 5, 3, 10); g.fillRect(ix + 7, iy - 5, 3, 10); }
    g.globalAlpha = 1;
    // banderín de fuera de juego
    const bk = fase(t, T.bandera, T.bandera + 0.2);
    if (bk > 0) {
      const e = bk < 1 ? salida(bk) * (1 + 0.25 * Math.sin(Math.PI * bk)) : 1;
      g.save(); g.translate(PANT.x + PANT.w - 38, PANT.y + 70); g.scale(e, e);
      g.fillStyle = "rgba(10,10,16,0.55)"; g.beginPath(); g.arc(0, -8, 24, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "#e9e3d6"; g.lineWidth = 2.4; g.lineCap = "round"; g.beginPath(); g.moveTo(-10, 12); g.lineTo(-10, -26); g.stroke();
      // tela a cuadros amarillos y rojos que ondea
      const ond = x => 2.5 * Math.sin(t * 9 - x * 0.35);
      const fx = i => -10 + i * 4.5, fy = (i, j) => -26 + j * 5.5 + ond(i * 4.5);
      for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) {
        g.fillStyle = (i + j) % 2 ? "#ffd21f" : "#e8322e";
        g.beginPath(); g.moveTo(fx(i), fy(i, j)); g.lineTo(fx(i + 1), fy(i + 1, j)); g.lineTo(fx(i + 1), fy(i + 1, j + 1)); g.lineTo(fx(i), fy(i, j + 1)); g.closePath(); g.fill();
      }
      g.strokeStyle = "#1a1410"; g.lineWidth = 1.1; g.beginPath(); g.moveTo(fx(0), fy(0, 0));
      for (let i = 1; i <= 5; i++) g.lineTo(fx(i), fy(i, 0)); for (let i = 5; i >= 0; i--) g.lineTo(fx(i), fy(i, 3)); g.closePath(); g.stroke();
      g.restore();
    }
    // fogonazo del gol
    const fg = t >= T.gol ? 0.55 * Math.exp(-(t - T.gol) * 5) * suave(fase(t, T.gol, T.gol + 0.05)) : 0;
    if (fg > 0.005) { g.fillStyle = `rgba(255,255,240,${fg})`; g.fillRect(PANT.x, PANT.y, PANT.w, PANT.h); }
    // brillo del cristal
    const br = g.createLinearGradient(PANT.x, PANT.y, PANT.x + PANT.w, PANT.y + PANT.h);
    br.addColorStop(0, "rgba(255,255,255,0.14)"); br.addColorStop(0.35, "rgba(255,255,255,0)"); br.addColorStop(1, "rgba(255,255,255,0.03)");
    g.fillStyle = br; g.fillRect(PANT.x, PANT.y, PANT.w, PANT.h);
    g.restore();
    marcador(g, t);
  }
  function brilloTele(g, t) {
    const flash = t >= T.gol ? Math.exp(-(t - T.gol) * 4) * suave(fase(t, T.gol, T.gol + 0.05)) : 0;
    const azul = dentro(t, T.repe0, T.repe0 + 0.1, T.repe1, T.repe1 + 0.1);
    const k = 0.15 + 0.015 * Math.sin(t * 7) + 0.35 * flash;
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createRadialGradient(512, 84, 60, 512, 84, 330);
    gr.addColorStop(0, `rgba(${Math.round(lerp(70, 110, azul) + 120 * flash)},${Math.round(lerp(170, 130, azul) + 80 * flash)},${Math.round(lerp(110, 230, azul) + 60 * flash)},${k})`);
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(180, -60, 664, 520);
    g.restore();
  }

  /* =====================================================================================
   * LÁMPARAS (la de Guillermo se balancea tras el coscorrón)
   * ===================================================================================== */
  const balanceo = t => t < T.coco ? 0 : 0.3 * Math.exp(-(t - T.coco) * 0.75) * Math.sin((t - T.coco) * 6.2);
  function lampara(g, t, x, yb, piv, ang) {
    g.save(); g.translate(x, piv); g.rotate(ang);
    const L = yb - piv, hs = 30;
    g.strokeStyle = "#0e0b0c"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, L - hs); g.stroke();
    g.fillStyle = "#1d4a3a"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(-8, L - hs); g.lineTo(8, L - hs); g.quadraticCurveTo(12, L - hs + 4, 13, L - hs + 10); g.lineTo(32, L - 2); g.quadraticCurveTo(0, L + 3, -32, L - 2); g.lineTo(-13, L - hs + 10); g.quadraticCurveTo(-12, L - hs + 4, -8, L - hs); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.28)"; g.beginPath(); g.moveTo(-6, L - hs + 4); g.lineTo(-22, L - 4); g.lineTo(-15, L - 4); g.lineTo(-3, L - hs + 6); g.closePath(); g.fill();
    g.fillStyle = "#fff0b8"; g.beginPath(); g.ellipse(0, L - 1, 22, 4, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function luzLampara(g, x, y, k) {
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createRadialGradient(x, y, 4, x, y, 150); gr.addColorStop(0, `rgba(255,200,110,${0.34 * k})`); gr.addColorStop(1, "rgba(255,170,80,0)");
    g.fillStyle = gr; g.fillRect(x - 150, y - 150, 300, 300); g.restore();
  }

  /* =====================================================================================
   * DECORADO: bar deportivo de noche (pared granate, zócalo de madera, neón de balón, trofeos)
   * ===================================================================================== */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 160; c.height = H + 120; const g = c.getContext("2d");
    g.translate(80, 60);
    const pared = g.createLinearGradient(0, -60, 0, 470); pared.addColorStop(0, "#2a0c14"); pared.addColorStop(1, "#571a26");
    g.fillStyle = pared; g.fillRect(-80, -60, W + 160, 532);
    // paneles verticales con moldura
    for (let x = -50; x < W + 80; x += 128) {
      g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 3; g.strokeRect(x + 10, 30, 108, 300);
      g.strokeStyle = "rgba(255,190,170,0.07)"; g.lineWidth = 2; g.strokeRect(x + 13, 33, 102, 294);
    }
    // neón de balón (izquierda)
    const neon = (cx, cy, r) => {
      g.save();
      const halo = g.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 2.2); halo.addColorStop(0, "rgba(60,230,255,0.35)"); halo.addColorStop(1, "rgba(60,230,255,0)");
      g.fillStyle = halo; g.beginPath(); g.arc(cx, cy, r * 2.2, 0, Math.PI * 2); g.fill();
      g.lineCap = "round"; g.lineJoin = "round";
      const trazo = () => {
        g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2);
        const pent = []; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; pent.push([cx + Math.cos(a) * r * 0.38, cy + Math.sin(a) * r * 0.38]); }
        g.moveTo(pent[0][0], pent[0][1]); for (let i = 1; i <= 5; i++) g.lineTo(pent[i % 5][0], pent[i % 5][1]);
        for (const [px, py] of pent) { const a = Math.atan2(py - cy, px - cx); g.moveTo(px, py); g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
      };
      trazo(); g.strokeStyle = "rgba(60,230,255,0.45)"; g.lineWidth = 9; g.stroke();
      trazo(); g.strokeStyle = "#c8fbff"; g.lineWidth = 3; g.stroke();
      g.restore();
    };
    neon(150, 120, 48);
    // camiseta enmarcada (izquierda, abajo)
    g.fillStyle = "#3a2414"; g.fillRect(48, 214, 120, 104); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(48, 214, 120, 104);
    g.fillStyle = "#e9e1d0"; g.fillRect(58, 224, 100, 84);
    g.save(); g.translate(108, 266);
    g.beginPath(); g.moveTo(-18, -30); g.lineTo(-34, -20); g.lineTo(-26, -6); g.lineTo(-18, -12); g.lineTo(-18, 30); g.lineTo(18, 30); g.lineTo(18, -12); g.lineTo(26, -6); g.lineTo(34, -20); g.lineTo(18, -30); g.quadraticCurveTo(0, -20, -18, -30); g.closePath();
    g.fillStyle = "#d42a2a"; g.fill(); g.save(); g.clip(); g.fillStyle = "#ffffff"; for (let x = -14; x < 20; x += 12) g.fillRect(x, -32, 5, 64); g.restore();
    g.lineWidth = 2; g.strokeStyle = "#0b0a0e"; g.stroke(); g.restore();
    // estante de trofeos (derecha)
    g.fillStyle = "#4a2c18"; g.fillRect(800, 150, 190, 12); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(800, 150, 190, 12);
    for (const [x, h] of [[836, 48], [894, 64], [952, 42]]) {
      g.save(); g.translate(x, 150);
      g.fillStyle = "#3a2a1a"; g.fillRect(-12, -10, 24, 10); g.strokeRect(-12, -10, 24, 10);
      const gr = g.createLinearGradient(-16, 0, 16, 0); gr.addColorStop(0, "#ffe27a"); gr.addColorStop(0.5, "#e2a91f"); gr.addColorStop(1, "#9e6a08");
      g.fillStyle = gr; g.beginPath(); g.moveTo(-3, -10); g.lineTo(-3, -h * 0.45); g.quadraticCurveTo(-16, -h * 0.55, -16, -h); g.lineTo(16, -h); g.quadraticCurveTo(16, -h * 0.55, 3, -h * 0.45); g.lineTo(3, -10); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.arc(-17, -h * 0.82, 6, 0.5 * Math.PI, 1.5 * Math.PI); g.stroke(); g.beginPath(); g.arc(17, -h * 0.82, 6, -0.5 * Math.PI, 0.5 * Math.PI); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.55)"; g.fillRect(-11, -h + 4, 3, h * 0.35);
      g.restore();
    }
    // bufanda colgada (derecha, bajo los trofeos)
    g.save(); g.translate(894, 196);
    g.beginPath(); g.moveTo(-78, 0); g.quadraticCurveTo(0, 46, 78, 0); g.lineTo(78, 16); g.quadraticCurveTo(0, 62, -78, 16); g.closePath();
    g.save(); g.clip(); for (let x = -80; x < 80; x += 16) { g.fillStyle = (x / 16) % 2 ? "#e8322e" : "#ffffff"; g.fillRect(x, -10, 16, 90); } g.restore();
    g.lineWidth = 2.5; g.strokeStyle = "#0b0a0e"; g.stroke();
    for (const sx of [-78, 78]) { g.fillStyle = "#e8322e"; g.fillRect(sx - 7, 14, 14, 54); g.strokeRect(sx - 7, 14, 14, 54); g.fillStyle = "#ffffff"; g.fillRect(sx - 7, 30, 14, 10);
      g.strokeStyle = "#e8322e"; g.lineWidth = 2; for (let i = -5; i <= 5; i += 3) { g.beginPath(); g.moveTo(sx + i, 68); g.lineTo(sx + i, 78); g.stroke(); } g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; }
    g.restore();
    // pizarra de táctica (derecha, abajo): puntos y flechas, sin letras
    g.fillStyle = "#6a4426"; g.fillRect(830, 262, 130, 86); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(830, 262, 130, 86);
    g.fillStyle = "#24392c"; g.fillRect(838, 270, 114, 70);
    g.strokeStyle = "rgba(255,255,255,0.75)"; g.lineWidth = 1.6; g.strokeRect(844, 276, 102, 58); g.beginPath(); g.moveTo(895, 276); g.lineTo(895, 334); g.stroke();
    g.fillStyle = "#ffffff"; for (const [x, y] of [[862, 290], [870, 318], [910, 300], [925, 322]]) { g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill(); }
    g.beginPath(); g.moveTo(870, 312); g.quadraticCurveTo(892, 296, 906, 300); g.stroke(); g.beginPath(); g.moveTo(906, 300); g.lineTo(900, 296); g.moveTo(906, 300); g.lineTo(900, 305); g.stroke();
    // zócalo de madera oscura
    g.fillStyle = "#2a1810"; g.fillRect(-80, 372, W + 160, 100);
    g.fillStyle = "#4e2e1a"; g.fillRect(-80, 372, W + 160, 9); g.fillStyle = "rgba(255,210,170,0.12)"; g.fillRect(-80, 372, W + 160, 2);
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 2;
    for (let x = -60; x < W + 80; x += 96) g.strokeRect(x + 8, 392, 80, 64);
    g.fillStyle = "rgba(0,0,0,0.3)"; g.fillRect(-80, 466, W + 160, 6);
    // suelo de tablones
    const su = g.createLinearGradient(0, 472, 0, H + 60); su.addColorStop(0, "#5a3820"); su.addColorStop(1, "#2a190d");
    g.fillStyle = su; g.fillRect(-80, 472, W + 160, H + 60 - 472);
    g.strokeStyle = "rgba(20,10,4,0.45)"; g.lineWidth = 2;
    for (let y = 490; y < H + 60; y += 24) { g.beginPath(); g.moveTo(-80, y); g.lineTo(W + 80, y); g.stroke(); }
    for (let i = 0; i < 44; i++) { const y = 490 + Math.floor(hash(i * 3.3) * 5) * 24, x = -80 + hash(i * 5.1) * (W + 160); g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 24); g.stroke(); }
    // taburetes de bar a los lados
    for (const sx of [60, 966]) {
      g.save(); g.translate(sx, 0); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3;
      g.fillStyle = "#1c1c22"; for (const lx of [-22, 22]) { g.beginPath(); g.moveTo(lx * 0.5, 470); g.lineTo(lx, 560); g.lineWidth = 6; g.stroke(); }
      g.lineWidth = 3; g.beginPath(); g.moveTo(-17, 524); g.lineTo(17, 524); g.stroke();
      g.fillStyle = "#b8202c"; g.beginPath(); g.ellipse(0, 462, 30, 10, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.25)"; g.beginPath(); g.ellipse(-8, 459, 12, 3, 0, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    // la tele: soporte, cable y marco (la pantalla se pinta en cada fotograma)
    g.fillStyle = "#1a1a1e"; g.fillRect(500, -60, 24, 74); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(500, -60, 24, 74);
    g.strokeStyle = "#0e0e10"; g.lineWidth = 3; g.beginPath(); g.moveTo(TV.x + TV.w - 30, TV.y + TV.h); g.bezierCurveTo(TV.x + TV.w - 30, 240, TV.x + TV.w + 30, 260, TV.x + TV.w + 30, 372); g.stroke();
    g.fillStyle = "#121216"; g.beginPath(); g.roundRect ? g.roundRect(TV.x, TV.y, TV.w, TV.h, 10) : g.rect(TV.x, TV.y, TV.w, TV.h); g.fill();
    g.lineWidth = 3.5; g.strokeStyle = "#0b0a0e"; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 2; g.beginPath(); g.moveTo(TV.x + 10, TV.y + 3); g.lineTo(TV.x + TV.w - 10, TV.y + 3); g.stroke();
    g.fillStyle = "#ff3a2a"; g.beginPath(); g.arc(TV.x + TV.w - 14, TV.y + TV.h - 5, 1.8, 0, Math.PI * 2); g.fill();
    // viñeta
    const v = g.createRadialGradient(512, 300, 280, 512, 300, 700); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(10,0,4,0.55)");
    g.fillStyle = v; g.fillRect(-80, -60, W + 160, H + 120);
    return c;
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  function estrellaPuntas(g, x, y, r, puntas, rot, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function impacto(g, t, t0, x, y, tam) {
    const k = fase(t, t0, t0 + 0.3); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    estrellaPuntas(g, x, y, tam * (0.6 + 0.8 * salida(k)), 10, 0.3, 0.42); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2.5; g.strokeStyle = "#0b0a0e"; g.stroke();
    estrellaPuntas(g, x, y, tam * (0.35 + 0.5 * salida(k)), 10, 0.6, 0.5); g.fillStyle = "#ffffff"; g.fill();
    g.restore();
  }
  function estrellitas(g, t, pG, k) {
    if (k <= 0.01) return;
    const c = coronilla(pG), pts = [];
    for (let i = 0; i < 5; i++) { const a = t * 4.4 + i * Math.PI * 2 / 5; pts.push({ a, x: c.x - 8 + Math.cos(a) * 40, y: c.y + 6 + Math.sin(a) * 10, z: Math.sin(a) }); }
    pts.sort((u, v) => u.z - v.z);
    g.save();
    for (const q of pts) { const r = (7 + 2 * q.z) * k; estrellaPuntas(g, q.x, q.y, r, 5, t * 3 + q.a, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 1.8; g.strokeStyle = "#0b0a0e"; g.stroke(); }
    g.restore();
  }
  function polvo(g, t, x, y) {
    const k = fase(t, T.pisa - 0.02, T.pisa + 0.7); if (k <= 0 || k >= 1) return;
    g.save();
    for (let i = 0; i < 6; i++) { const lado = i % 2 ? 1 : -1, d = (18 + 46 * salida(k)) * (0.6 + hash(i + 70) * 0.6);
      g.globalAlpha = 0.4 * (1 - k); g.fillStyle = "#b08a66";
      g.beginPath(); g.ellipse(x + lado * d, y - 6 - 14 * k * hash(i + 71), 10 + 14 * k, 6 + 7 * k, 0, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // grito de alegría: rayitas alrededor de la boca abierta
  function grito(g, t, p, rig, t0, t1) {
    const k = dentro(t, t0, t0 + 0.1, t1 - 0.15, t1); if (k <= 0.01) return;
    const b = rig.aPantalla(p, rig.boca(p)), dir = p.espejo ? -1 : 1;
    g.save(); g.strokeStyle = "#ffffff"; g.lineCap = "round"; g.lineWidth = 2.6; g.globalAlpha = 0.9 * k;
    for (let i = -1; i <= 1; i++) {
      const a = (dir > 0 ? -0.35 : Math.PI + 0.35) + i * 0.42 * dir, r0 = 22 + 5 * Math.sin(t * 30 + i), r1 = r0 + 12;
      g.beginPath(); g.moveTo(b.x + Math.cos(a) * r0, b.y - 6 + Math.sin(a) * r0); g.lineTo(b.x + Math.cos(a) * r1, b.y - 6 + Math.sin(a) * r1); g.stroke();
    }
    g.restore();
  }
  // confeti que cae de la nada durante la fiesta y se queda en el suelo
  const COL_CONF = ["#ff3d6a", "#ffd21f", "#2fd6ff", "#7cff6a", "#ff8a1f", "#b06aff", "#ffffff"];
  const CONF = [];
  for (let i = 0; i < 52; i++) {
    const ts = lerp(5.3, 8.7, hash(i * 1.37 + 3)), v = 85 + 55 * hash(i + 11), suelo = 584 + 14 * hash(i + 23);
    CONF.push({ ts, v, x0: -10 + hash(i + 5) * 1044, A: 8 + 18 * hash(i + 7), f: 1.6 + 1.8 * hash(i + 9), ph: hash(i + 13) * 6.3, spin: 5 + 7 * hash(i + 17),
      w: 5 + 3 * hash(i + 19), h: 3 + 1.5 * hash(i + 21), col: COL_CONF[i % COL_CONF.length], suelo, tr: ts + (suelo + 20) / v });
  }
  function confeti(g, t) {
    g.save(); g.lineWidth = 0.8; g.strokeStyle = "rgba(0,0,0,0.45)";
    for (const c of CONF) {
      if (t < c.ts) continue;
      const u = Math.min(t, c.tr) - c.ts, x = c.x0 + c.A * Math.sin(c.f * u + c.ph), y = -20 + c.v * u;
      const enSuelo = t >= c.tr, ang = enSuelo ? c.ph : c.ph + u * 1.3, ancho = enSuelo ? 1 : Math.abs(Math.cos(c.spin * u)) * 0.85 + 0.15;
      g.save(); g.translate(x, enSuelo ? c.suelo : y); g.rotate(ang); g.scale(ancho, enSuelo ? 0.6 : 1);
      g.fillStyle = c.col; g.fillRect(-c.w / 2, -c.h / 2, c.w, c.h); g.strokeRect(-c.w / 2, -c.h / 2, c.w, c.h);
      g.restore();
    }
    g.restore();
  }
  // el último confeti: baja despacio y se posa en la espuma de la cabeza de Guillermo
  function confetiFinal(g, t, pG) {
    const t0 = CONF_FINAL.t0; if (t < t0) return;
    const dest = coronilla(t < T.confeti ? poses(T.confeti).g : pG);
    let q, ang;
    if (t < T.confeti) {
      const k = fase(t, t0, T.confeti), am = 26 * (1 - k);
      q = { x: lerp(CONF_FINAL.x0, dest.x, k) + am * Math.sin(t * 2.6), y: lerp(-24, dest.y - 10, k) }; ang = 0.6 * Math.sin(t * 2.6 + 1) * (1 - k);
    } else { q = { x: dest.x, y: dest.y - 10 }; ang = 0; }
    g.save(); g.translate(q.x, q.y); g.rotate(ang + 0.2);
    g.fillStyle = "#ff3d6a"; g.fillRect(-4, -2.5, 8, 5); g.lineWidth = 0.8; g.strokeStyle = "rgba(0,0,0,0.5)"; g.strokeRect(-4, -2.5, 8, 5);
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const ten = dentro(t, 0.9, 3.4, T.gol, T.gol + 0.4);
    const fin = dentro(t, T.miran0, T.camara + 0.3, DUR, DUR + 1);
    return { k: 1 + 0.035 * ten + 0.03 * fin, x: 512, y: 296 + 14 * fin };
  }

  class GuillermoGol extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !AN.listo()) return;
      if (!fondo) fondo = creaFondo();
      if (!VUELO) prepara();
      const { g: pG, a: pA } = poses(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = (t >= T.coco ? 3 * Math.exp(-(t - T.coco) * 8) * suave(fase(t, T.coco, T.coco + 0.04)) : 0)
        + (t >= T.pisa ? 4 * Math.exp(-(t - T.pisa) * 9) * suave(fase(t, T.pisa, T.pisa + 0.04)) : 0);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -80, -60);
      brilloTele(g, t);
      pintaTele(g, t);
      // lámparas (la de Guillermo, calculada para que la coronilla llegue justo; la de Ander, simétrica)
      const xA = 1024 - LAMPARA.x, angG = balanceo(t);
      lampara(g, t, xA, LAMPARA.yb, LAMPARA.piv, 0.01 * Math.sin(t * 1.3));
      lampara(g, t, LAMPARA.x, LAMPARA.yb, LAMPARA.piv, angG);
      const L = LAMPARA.yb - LAMPARA.piv;
      luzLampara(g, LAMPARA.x - Math.sin(angG) * L, LAMPARA.piv + Math.cos(angG) * L, 1);
      luzLampara(g, xA, LAMPARA.yb, 1);
      // sombras en el suelo
      g.save(); g.fillStyle = "rgba(10,0,4,0.36)";
      for (const p of [pG, pA]) { const alto = clamp((SUELO - p.suelo + 16 * p._cr.z) / 90), y = SUELO + 16 * p._cr.z + 1;
        g.beginPath(); g.ellipse(p.x, y, 54 * p._sc * (1 - 0.35 * alto), 6.5 * (1 - 0.3 * alto), 0, 0, Math.PI * 2); g.fill(); }
      g.restore();
      G.dibujar(g, pG, t);
      AN.dibujar(g, pA, t);
      impacto(g, t, T.coco, LAMPARA.x, LAMPARA.yb + 4, 26);
      estrellitas(g, t, pG, dentro(t, T.coco, T.coco + 0.15, T.junta0 - 0.2, T.junta0 + 0.1));
      grito(g, t, pG, G, T.gol, T.junta0);
      grito(g, t, pA, AN, T.gol + 0.02, T.junta0);
      espumaVuela(g, t);
      salpica(g, t, pG);
      polvo(g, t, pG.x, SUELO + 16 * pG._cr.z); polvo(g, t, pA.x, SUELO + 16 * pA._cr.z);
      confeti(g, t);
      confetiFinal(g, t, pG);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00039", nombre: "Guillermo y Ander · El gol", crear: () => new GuillermoGol() });
  window.__A2D_00039 = { pose: poses, T, DUR };
})();
