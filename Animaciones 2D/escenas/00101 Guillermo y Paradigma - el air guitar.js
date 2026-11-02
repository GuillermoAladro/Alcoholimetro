"use strict";
/* 00101 · Guillermo y Paradigma · La guitarra invisible
 *
 * Negro → el escenario pequeño de un bar, de noche: pared de ladrillo oscuro, guirnaldas de
 * bombillas, dos focos en la pared, una tarima de madera con cinta en el suelo y un cable, un
 * amplificador grande y otro pequeño, una tarima para la batería (vacía) y, colgando sobre el
 * escenario, una lámpara de pantalla metálica. A la izquierda, más abajo, la pista de baile vacía
 * con sus taburetes. Paradigma, con los ojos cerrados, toca una guitarra invisible a 128 pulsaciones:
 * rasguea, los dedos corren por un mástil que no existe, cabecea y salen notas redondas.
 * Guillermo, detrás, flipa; se le ocurre algo: saca dos baquetas invisibles, las hace girar, cuenta
 * «un, dos, tres» chocándolas… y se lanza a la batería invisible: frenético, la lengua fuera, cada
 * golpe con su destello en el parche que no está. Paradigma se viene arriba y hace un solo.
 * Redoble y… ¡el platillo!: el platillo es la lámpara, que sale disparada, vuelve y le da a
 * Guillermo un coscorrón en toda la cabeza. Mareado (ojos en espiral y estrellitas), sigue tocando a
 * destiempo. Paradigma abre un ojo, sonríe y va a por el final: dos zancadas y se tira de rodillas;
 * se desliza por la tarima y se para justo en el borde con el último acorde. Guillermo, impresionado,
 * lo intenta: dos pasitos, se tira… y se pasa del borde y se cae del escenario. ¡Pum! Asoma por el
 * borde, mareado, con el chichón, y levanta el pulgar; Paradigma le guiña un ojo a la cámara → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`. Los pies que apoyan están quietos en el mundo
 * (pantalla) y se pasan a la hoja con aHoja; de rodillas, las piernas se calculan en la hoja.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, PD = Paradigma;
  const DUR = 14.9, TINTA = "#0b0a0e", TAU = Math.PI * 2;
  const BPM = 128, B = 60 / BPM, B0 = 1.0;
  const beat = k => B0 + k * B;

  // escenario: línea del fondo, borde delantero y lado izquierdo
  const ESC = { fondo: 414, borde: 506, izqF: 152, izqD: 118 };
  const FONDO = { suelo: 458, s: 0.28 }, FRENTE = { suelo: 492, s: 0.3 };
  const escDe = suelo => lerp(0.28, 0.3, (suelo - 458) / 34);

  const T = {
    // Guillermo: mira, idea, baquetas, cuenta y toca
    flipa: 0.9, idea: 1.62, saca0: 1.8, saca1: 2.1, gira0: 2.1, gira1: 2.42,
    cuenta: [beat(3), beat(4), beat(5)], toca: beat(6), frenesi: beat(9), redoble: beat(10.5),
    carga: beat(11.55), choque: beat(12), bonk: beat(14),
    mareo1: 9.7, ve: 10.05, decide: 10.95, pasoG0: 11.02, rodillaG: 11.4, bordeG: 11.72, cuelga: 11.82, cae: 12.12,
    pum: 12.34, asoma0: 12.72, asoma1: 13.2, pulgar: 13.3, guinoG: 13.68,
    // Paradigma
    cabecea: beat(7), solo0: beat(9), solo1: beat(12), ojo0: 8.32, ojo1: 8.95,
    trem0: 9.08, corre0: 9.46, deja: 9.86, rodillaP: 9.94, para: 10.56, acorde: beat(20), ruge0: 10.4, ruge1: 11.15,
    vePum: 12.4, mira0: 12.9, camP: 13.45, guinoP: 13.85,
    fin: 14.24
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
  const BAQUETA = D5(0.35, 0.25, 0, 0, 0);               // puño cerrado con la baqueta (invisible) entre pulgar e índice
  const PUA = D5(0.3, 0.25, 0.05, 0.05, 0.05);
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  // fase del compás: φ en [0, 1) dentro de cada pulso, 0 justo en el golpe
  const fasePulso = (t, sub = 1) => { const u = (t - B0) / (B / sub); return u - Math.floor(u); };

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

  /* ---------- manos ----------
   * Clave: { h: [x, y] } punto del tronco (hoja, sin inclinar) con mu relativo al tronco,
   * { scr: () => punto de pantalla } con mu absoluto, o { bols: true } (en el bolsillo). */
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
  function pista(lista, t, res) {
    let c = res(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)), d = res(obj);
      c = mezMano(c, d, k);
    }
    return c;
  }
  const mezMano = (a, d, k) => ({ x: lerp(a.x, d.x, k), y: lerp(a.y, d.y, k), mu: lerp(a.mu, d.mu, k), ang: 0, puno: lerp(a.puno, d.puno, k),
    dedos: DD(a.dedos, d.dedos, k), dobla: k < 0.5 ? a.dobla : d.dobla });
  const HM = (x, y, mu, dedos, dobla) => ({ h: [x, y], mu, dedos, dobla });
  const conMano = (m, dx, dy, dmu = 0) => Object.assign({}, m, { x: m.x + dx, y: m.y + dy, mu: m.mu + dmu });

  /* ---------- pies ---------- */
  function pieDe(apoyos, t, o) {
    let i = 0; for (let k = 0; k < apoyos.length; k++) if (apoyos[k][0] <= t) i = k;
    const [tf, xf, d0] = apoyos[i], dur = d0 ?? o.apoyo;
    if (t <= tf || i === apoyos.length - 1 || t <= tf + dur) return { x: xf, h: 0, a: 0 };
    const [tn, xn] = apoyos[i + 1], toff = tf + dur, u = clamp((t - toff) / (tn - toff));
    const x = lerp(xf, xn, suave(clamp((u - 0.05) / 0.95)));
    const h = o.alto * Math.sin(Math.PI * Math.pow(u, o.corre ? 0.72 : 1));
    let a;
    if (o.corre) a = u < 0.3 ? lerp(0.36, 1.0, suave(u / 0.3)) : u < 0.75 ? lerp(1.0, 0.12, suave((u - 0.3) / 0.45)) : lerp(0.12, 0, suave((u - 0.75) / 0.25));
    else a = 0.26 * Math.sin(Math.PI * u) - 0.08 * Math.sin(TAU * u);
    return { x, h, a };
  }
  function aPierna(R, p, w, lado) {
    const tob = R.SUELO - R.TOBILLO_ALTO;
    return { tob: P(R.aHoja(p, P(w.x, 0)).x, tob - (lado === "lejos" ? 12 : 0) - w.h / p.s), ang: w.a };
  }
  // de rodillas: rodillas en el suelo por delante de las caderas, espinillas planas hacia atrás, suelas arriba
  function deRodillas(R, p, adelanta = 0) {
    const Tr = R.tronco(p), out = {};
    for (const lado of ["lejos", "cerca"]) {
      const cad = Tr(R.CADERA[lado]), L = R.A.datos.piezas["pierna_" + lado].largo, Lt = L * 0.5;
      const sube = lado === "lejos" ? 14 : 0;
      const ky = R.SUELO - 44 - sube, dy = ky - cad.y;
      const dx = Math.sqrt(Math.max(0, Lt * Lt - dy * dy)) * 0.985 + adelanta;
      const rod = P(cad.x + dx, ky);
      const ay = R.SUELO - 34 - sube, ady = ay - ky, adx = Math.sqrt(Math.max(0, Lt * Lt - ady * ady)) * 0.99;
      out[lado] = { tob: P(rod.x - adx, ay), ang: 2.92, rod };
    }
    return out;
  }
  const mezPierna = (a, b, k) => ({ tob: mezcla(a.tob, b.tob, k), ang: lerp(a.ang, b.ang, k) });

  const MEMO = new Map();
  const memo = (c, f) => { if (MEMO.has(c)) return MEMO.get(c); if (MEMO.size > 24) MEMO.clear(); const v = f(); MEMO.set(c, v); return v; };

  /* =====================================================================================
   * LA LÁMPARA (péndulo)
   * ===================================================================================== */
  const LX = 372, LPY = -232, LC = 316;                   // anclaje en el techo y largo del cable (hasta el centro de la pantalla)
  const AMP = 0.44;
  let TH_BONK = -0.2;                                     // ángulo del coscorrón (se ajusta con la cabeza de Guillermo)
  function anguloLampara(t) {
    if (t < T.choque) return 0.014 * Math.sin(t * 2.3) + 0.01 * Math.sin(t * 3.7 + 1);
    const om = (Math.PI + Math.asin(Math.min(1, -TH_BONK / AMP))) / (T.bonk - T.choque);
    if (t < T.bonk) return AMP * Math.sin(om * (t - T.choque));
    const u = t - T.bonk, gam = 1.1, om2 = 4.6, a = TH_BONK, v0 = 0.5 * AMP * om;   // rebota hacia la derecha y se va calmando
    return Math.exp(-gam * u) * (a * Math.cos(om2 * u) + (v0 + gam * a) / om2 * Math.sin(om2 * u));
  }
  const centroLampara = th => P(LX + LC * Math.sin(th), LPY + LC * Math.cos(th));
  // borde inferior izquierdo de la pantalla (el que choca)
  const bordeLampara = th => { const c = centroLampara(th), q = M2.rot(P(-34, 20), -th); return P(c.x + q.x, c.y + q.y); };

  /* =====================================================================================
   * PARADIGMA (delante, a la derecha; mira a la derecha, al público)
   * ===================================================================================== */
  const XP0 = 640, XP_DEJA = 744, XP_PARA = 856;
  function xP(t) {
    if (t <= T.corre0) return XP0;
    if (t <= T.deja) return lerp(XP0, XP_DEJA, entrada(fase(t, T.corre0, T.deja)) * 0.6 + 0.4 * fase(t, T.corre0, T.deja));
    const v0 = (XP_DEJA - XP0) / (T.deja - T.corre0) * 1.3, d = XP_PARA - XP_DEJA, dur = T.para - T.deja;
    // deceleración que llega justo a XP_PARA en T.para
    const u = clamp((t - T.deja) / dur);
    return XP_DEJA + d * (1 - Math.pow(1 - u, 2.2));
  }
  const sueloP = t => lerp(FRENTE.suelo, ESC.borde, suave(fase(t, T.deja, T.para)));

  const CP0 = { pel: 0, torso: 0, cab: 0, cdy: 0 };
  const CP = o => Object.assign({}, CP0, o);
  const CUERPOS_P = {
    listo: CP({ pel: 30, torso: -0.08, cab: -0.04 }),
    toca: CP({ pel: 40, torso: -0.12, cab: 0.02 }),
    solo: CP({ pel: 56, torso: -0.2, cab: -0.12 }),
    mira: CP({ pel: 40, torso: -0.08, cab: 0.04 }),
    trem: CP({ pel: 52, torso: -0.16, cab: -0.1 }),
    corre: CP({ pel: 34, torso: 0.2, cab: 0.06 }),
    tira: CP({ pel: 0, torso: -0.36, cab: -0.34 }),
    ruge: CP({ pel: 0, torso: -0.44, cab: -0.42 }),
    final: CP({ pel: 0, torso: -0.3, cab: -0.2 }),
    mirG: CP({ pel: 0, torso: -0.2, cab: -0.06 }),
    camara: CP({ pel: 0, torso: -0.22, cab: -0.1 })
  };
  const GUION_CUERPO_P = [
    [0.3, 0.9, "toca"], [T.solo0 - 0.2, T.solo0 + 0.3, "solo"], [T.ojo0 - 0.3, T.ojo0, "mira"], [T.trem0, T.trem0 + 0.3, "trem"],
    [T.corre0, T.corre0 + 0.15, "corre"], [T.deja - 0.06, T.rodillaP + 0.05, "tira"], [T.ruge0 - 0.1, T.ruge0 + 0.12, "ruge"],
    [T.ruge1, T.ruge1 + 0.4, "final"], [T.vePum, T.vePum + 0.3, "mirG"], [T.camP, T.camP + 0.3, "camara"]
  ];
  const CARAS_P = {
    rock: E({ c: 1, sd: 6, si: 6, abre: 0, ancho: 0.7, sonr: 0.45 }),
    canta: E({ c: 1, sd: 10, si: 10, abre: 14, ancho: 0.8, sonr: 0.5 }),
    solo: E({ c: 1, z: 0.35, sd: 16, gd: -0.08, si: 16, gi: -0.08, abre: 22, ancho: 0.85, sonr: 0.2 }),
    ojo: E({ mx: -1, my: 0.1, c: 0.35, cd: 1, sd: -4, gd: -0.1, si: 18, gi: 0.12, abre: 0, ancho: 0.65, sonr: 0.65 }),
    trem: E({ c: 1, z: 0.6, sd: 20, si: 20, abre: 26, ancho: 0.9, sonr: 0.1 }),
    corre: E({ mx: 0.9, c: 0.2, sd: 8, si: 8, abre: 18, ancho: 0.8, sonr: 0.5 }),
    ruge: E({ c: 1, z: 1, sd: 26, gd: -0.12, si: 26, gi: -0.12, abre: 58, ancho: 1.05, sonr: 0.3 }),
    final: E({ c: 1, h: 0.6, sd: 12, si: 12, abre: 6, ancho: 0.8, sonr: 0.7 }),
    pum: E({ mx: -1, my: 0.25, c: 0.4, cd: 1, sd: -2, si: 20, gi: 0.14, abre: 0, ancho: 0.6, sonr: 0.3 }),
    mirG: E({ mx: -1, my: 0.3, c: 0.2, sd: 12, si: 16, abre: 4, ancho: 0.8, sonr: 0.75 }),
    camara: E({ mx: -0.15, my: 0.05, c: 0.2, sd: 10, si: 8, abre: 0, ancho: 0.8, sonr: 0.8 })
  };
  const GUION_CARA_P = [
    [1.0, 1.2, "canta"], [beat(4), beat(4.5), "rock"], [T.solo0, T.solo0 + 0.25, "solo"], [T.ojo0, T.ojo0 + 0.15, "ojo"], [T.ojo1, T.ojo1 + 0.2, "rock"],
    [T.trem0, T.trem0 + 0.2, "trem"], [T.corre0, T.corre0 + 0.12, "corre"], [T.ruge0, T.ruge0 + 0.08, "ruge", salida], [T.ruge1, T.ruge1 + 0.3, "final"],
    [T.vePum, T.vePum + 0.1, "pum"], [T.mira0, T.mira0 + 0.3, "mirG"], [T.camP, T.camP + 0.3, "camara"]
  ];
  const PARP_P = [12.4, 13.0];

  // cabeceo: la cabeza baja de golpe en cada pulso y sube despacio
  function cabeceo(t) {
    const k = tramo(t, T.cabecea - 0.3, T.cabecea) * (1 - tramo(t, T.ojo0 - 0.25, T.ojo0)) + tramo(t, T.ojo1, T.ojo1 + 0.3) * (1 - tramo(t, T.corre0 - 0.1, T.corre0));
    const φ = fasePulso(t), golpe = Math.exp(-φ * 7) - 0.12;            // pico justo en el pulso
    const leve = 0.3 * (Math.exp(-φ * 6) - 0.15);                       // asiente un poco desde el principio
    return { ang: 0.32 * k * golpe + 0.09 * leve * (1 - k) * tramo(t, 0.3, 0.9), dy: 22 * k * golpe };
  }
  // rasgueo: la mano baja al pasar por las cuerdas en el pulso y sube a contratiempo
  function rasgueo(t) {
    if (t < 0.85 || t > T.corre0 + 0.05) return 0;
    const sub = t > T.trem0 ? 4 : t > T.solo0 ? 2 : 1;                  // trémolo al final
    const φ = fasePulso(t, sub), s = Math.sin(TAU * φ);
    const amp = sub === 4 ? 0.45 : sub === 2 ? 0.8 : 1;
    return amp * Math.tanh(2.6 * s) / Math.tanh(2.6) * tramo(t, 0.85, 1.0);
  }

  function poseP(t, geo = false) { return memo("p" + t, () => poseP0(t)); }
  function poseP0(t) {
    const b = guion(GUION_CUERPO_P, CUERPOS_P, "listo", t);
    const respira = Math.sin(t * 2.2 + 0.4);
    const sl = escDe(sueloP(t));
    const cb = cabeceo(t);
    const φ = fasePulso(t), rebote = t > 0.9 && t < T.corre0 ? (Math.exp(-φ * 6)) * (t > T.cabecea ? 16 : 7) : 0;   // rodillas al compás
    const rodillas = tramo(t, T.deja - 0.04, T.rodillaP);
    const traq = (t > T.rodillaP && t < T.para) ? 1.4 * ruido(t * 42) * (1 - fase(t, T.rodillaP, T.para)) : 0;
    const ruge = (t > T.ruge0 && t < T.ruge1) ? 0.025 * Math.sin(t * 29) * campana(t, T.ruge0, T.ruge1) : 0;
    const p = {
      x: xP(t), suelo: sueloP(t), s: sl, espejo: false, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: PD.PELVIS.x, y: PD.PELVIS.y + b.pel + respira * 1.2 + rebote + 330 * suave(rodillas) + traq / sl },
      torso: b.torso + ruge + 0.012 * Math.sin(t * 1.3), torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + cb.ang + 0.6 * ruge, dx: 0, dy: b.cdy + cb.dy, esc: { x: 1, y: 1 } }
    };
    // pies: abiertos, la izquierda (lejana) adelantada; luego dos zancadas y de rodillas
    const pasos = memo("pasosP", () => ({
      cerca: [[-9, XP0 - 34, 9 + T.corre0], [T.corre0 + 0.2, XP0 + 62]],
      lejos: [[-9, XP0 + 30, 9 + T.corre0 + 0.1], [T.corre0 + 0.36, XP0 + 128]]
    }));
    const wC = pieDe(pasos.cerca, t, { corre: true, alto: 34, apoyo: 0.05 }), wL = pieDe(pasos.lejos, t, { corre: true, alto: 34, apoyo: 0.05 });
    p.piernas.cerca = aPierna(PD, p, wC, "cerca"); p.piernas.lejos = aPierna(PD, p, wL, "lejos");
    if (rodillas > 0) {
      const R = deRodillas(PD, p, 8 * fase(t, T.rodillaP, T.para));
      for (const lado of ["lejos", "cerca"]) p.piernas[lado] = mezPierna(p.piernas[lado], R[lado], suave(rodillas));
    }
    // cara
    const e = guion(GUION_CARA_P, CARAS_P, "rock", t);
    if (t > 1.0 && t < T.corre0) e.abre += 4 * Math.max(0, Math.sin(TAU * φ));                    // canturrea
    if (t > T.ruge0 && t < T.ruge1) e.abre += 8 * Math.sin(t * 23);
    p.cara = cara(e, parpadeo(t, PARP_P));
    if (t > T.guinoP) { const k = campana(t, T.guinoP, T.guinoP + 0.5); p.cara.ojos.d = Math.max(p.cara.ojos.d, k); }
    manosP(p, t);
    p.cb = cb;
    return p;
  }

  // cabeceo: arcos de movimiento detrás de la melena en cada golpe de cabeza
  function arcosCabeceo(g, t, pp) {
    const k = tramo(t, T.cabecea - 0.3, T.cabecea) * (1 - tramo(t, T.ojo0 - 0.25, T.ojo0)) + tramo(t, T.ojo1, T.ojo1 + 0.3) * (1 - tramo(t, T.corre0 - 0.1, T.corre0));
    if (k < 0.02) return;
    const φ = fasePulso(t), a = k * Math.exp(-φ * 6) * clamp(φ / 0.04);
    if (a < 0.03) return;
    const H = PD.cabeza(pp), c = PD.aPantalla(pp, H.a(P(780, 470))), r = 62 * pp.s / 0.3;
    g.save(); g.lineCap = "round"; g.strokeStyle = `rgba(255,240,220,${0.85 * a})`;
    for (let i = 0; i < 3; i++) {
      const rr = r + i * 9, a0 = -2.95 + i * 0.1, a1 = -1.75 - i * 0.12;
      g.lineWidth = 3.2 - i * 0.7; g.beginPath(); g.arc(c.x, c.y, rr, a0, a1); g.stroke();
    }
    g.restore();
  }

  // mástil invisible: de la pala (lejos, adelante y arriba) al cuerpo (cadera)
  function manosP(p, t) {
    const rC = resolutor(PD, p, "cerca"), rL = resolutor(PD, p, "lejos");
    const lis = { c: HM(300, 590, -2.2, PUA, -1), l: HM(624, 430, -2.8, D5(0.5, 0.75, 0.6, 0.5, 0.45), 1) };
    const agudo = { c: HM(300, 596, -2.2, PUA, -1), l: HM(520, 486, -2.6, D5(0.5, 0.8, 0.7, 0.55, 0.45), 1) };
    const corre = { c: HM(200, 520, -2.0, PUNO, -1), l: HM(560, 500, -2.5, PUNO, 1) };
    const abre = { c: HM(-120, 160, 0.6, PALMA, 1), l: HM(640, 400, -2.85, D5(0.5, 0.8, 0.7, 0.55, 0.45), 1) };
    const acorde = { c: HM(330, 610, -2.15, PUA, -1), l: HM(640, 420, -2.85, D5(0.5, 0.95, 0.9, 0.8, 0.6), 1) };
    const alto = { c: HM(150, 20, 1.75, D5(0.6, 0.5, 0.2, 0.2, 0.2), 1), l: HM(640, 420, -2.85, D5(0.5, 0.95, 0.9, 0.8, 0.6), 1) };
    const pistaC = [[0, 0, lis.c], [T.solo0 - 0.1, T.solo0 + 0.2, agudo.c], [T.ojo1, T.ojo1 + 0.3, lis.c], [T.corre0 - 0.05, T.corre0 + 0.12, corre.c],
      [T.deja - 0.05, T.rodillaP + 0.05, acorde.c], [T.acorde - 0.02, T.acorde + 0.22, alto.c, salida]];
    const pistaL = [[0, 0, lis.l], [T.solo0 - 0.1, T.solo0 + 0.25, agudo.l], [T.ojo1, T.ojo1 + 0.3, lis.l], [T.corre0 - 0.05, T.corre0 + 0.12, corre.l],
      [T.deja - 0.05, T.rodillaP + 0.05, acorde.l]];
    let C = pista(pistaC, t, rC), L = pista(pistaL, t, rL);
    // rasgueo: la púa sube y baja por las cuerdas (siguiendo la inclinación del tronco)
    const r = rasgueo(t), ampR = 70;
    const dir = M2.rot(P(-0.25, 1), p.torso);
    C = conMano(C, dir.x * ampR * r, dir.y * ampR * r, -0.45 * r);
    // los dedos corren por el mástil: la mano sube y baja de traste y los dedos pisan por turnos
    if (t > 0.9 && t < T.corre0) {
      const k = t > T.solo0 && t < T.solo1 ? 1 : 0.6;
      const tr = 10 * Math.sin(t * 2.1) + 8 * Math.sin(t * 3.3 + 1) * k;            // cambios de traste
      const vib = (t > T.solo0 + 0.6 && t < T.solo1) ? 3.5 * Math.sin(t * 46) * campana(t, T.solo0 + 0.6, T.solo1) : 0;   // vibrato
      const ax = M2.rot(P(1, -0.38), p.torso);
      L = conMano(L, ax.x * (tr + vib), ax.y * (tr + vib));
      const d = L.dedos, f = n => 0.5 + 0.5 * Math.sin(t * TAU * 2.13 * (1 + 0.5 * k) + n);
      L.dedos = { pulgar: d.pulgar, indice: clamp(d.indice - 0.45 * f(0)), medio: clamp(d.medio - 0.5 * f(1.9)), anular: clamp(d.anular - 0.45 * f(3.7)), menique: clamp(d.menique - 0.4 * f(5.1)) };
    }
    // trémolo: la mano del rasgueo tiembla
    if (t > T.trem0 && t < T.corre0) C = conMano(C, 0, 3 * Math.sin(t * 60));
    // carrera: brazos al compás de las zancadas
    const kCo = tramo(t, T.corre0, T.corre0 + 0.1) * (1 - tramo(t, T.deja - 0.06, T.deja + 0.06));
    if (kCo > 0) { const ph = Math.sin(TAU * (t - T.corre0) / 0.4); C = conMano(C, -40 * ph * kCo, 20 * ph * kCo); L = conMano(L, 40 * ph * kCo, -20 * ph * kCo); }
    // tras el último acorde, el brazo de la púa queda arriba y se mece
    if (t > T.acorde + 0.22) C = conMano(C, 6 * Math.sin(t * 2.4), 4 * Math.sin(t * 3.1));
    p.manoCerca = C; p.manoLejos = L;
  }
  // punto donde rasguea (pantalla), para las notas
  const PUNTO_RASGUEO = P(300, 600);
  function cuerdas(p) { return PD.aPantalla(p, PD.tronco(p)(PUNTO_RASGUEO)); }

  /* =====================================================================================
   * GUILLERMO (detrás, a la izquierda; mira a la derecha)
   * ===================================================================================== */
  const XG0 = 268;
  const XG_DEJA = 346, XG_BORDE = 432, XG_CAE = 454;
  function xG(t) {
    if (t <= T.pasoG0) return XG0;
    if (t <= T.rodillaG) return lerp(XG0, XG_DEJA, fase(t, T.pasoG0, T.rodillaG));
    if (t <= T.bordeG) return lerp(XG_DEJA, XG_BORDE, fase(t, T.rodillaG, T.bordeG));
    if (t <= T.cae) return lerp(XG_BORDE, XG_CAE, salida(fase(t, T.bordeG, T.cuelga + 0.1)));
    if (t <= T.asoma0) return XG_CAE + 6 * fase(t, T.cae, T.pum);
    return XG_CAE;
  }
  // altura del suelo de Guillermo: fondo → borde (deslizando hacia delante) → en el aire → cae → asoma
  const Y_ABAJO = 812;                                    // pista de baile, por debajo del cuadro
  function sueloG(t) {
    if (t <= T.rodillaG) return FONDO.suelo;
    if (t <= T.bordeG) return lerp(FONDO.suelo, ESC.borde, suave(fase(t, T.rodillaG, T.bordeG)));
    const Y_AIRE = ESC.borde + 24;                       // ya por delante del borde, sobre el vacío
    if (t <= T.cae) return lerp(ESC.borde, Y_AIRE, salida(fase(t, T.bordeG, T.cuelga))) - 3 * campana(t, T.cuelga, T.cae);   // se queda en el aire, como en los dibujos
    if (t <= T.asoma0) { const u = t - T.cae; return Y_AIRE + 9000 * u * u; }
    const u = fase(t, T.asoma0, T.asoma1), rebote = t > T.asoma1 ? 10 * Math.sin((t - T.asoma1) * 9) * Math.exp(-(t - T.asoma1) * 5) : 0;
    return lerp(Y_ABAJO + 260, Y_ABAJO, salida(u)) + rebote;
  }
  const escG = t => t <= T.pum ? escDe(Math.min(sueloG(t), ESC.borde + 24)) : 0.31;

  const CG0 = { pel: 0, torso: 0.02, cab: 0.04, cdy: 0 };
  const CGc = o => Object.assign({}, CG0, o);
  const CUERPOS_G = {
    quieto: CGc({ pel: 6, torso: 0.02, cab: 0.02 }),
    flipa: CGc({ pel: 8, torso: -0.06, cab: -0.06 }),
    idea: CGc({ pel: 10, torso: 0.06, cab: 0.04 }),
    gira: CGc({ pel: 20, torso: 0.1, cab: 0.04 }),
    toca: CGc({ pel: 46, torso: 0.16, cab: 0.08 }),
    frenesi: CGc({ pel: 58, torso: 0.22, cab: 0.1 }),
    carga: CGc({ pel: 40, torso: -0.14, cab: -0.16 }),
    golpe: CGc({ pel: 30, torso: -0.24, cab: -0.24 }),
    bonk: CGc({ pel: 70, torso: 0.2, cab: 0.3, cdy: 18 }),
    mareo: CGc({ pel: 44, torso: 0.1, cab: 0.06 }),
    ve: CGc({ pel: 12, torso: -0.04, cab: -0.04 }),
    decide: CGc({ pel: 22, torso: 0.12, cab: 0.04 }),
    corre: CGc({ pel: 34, torso: 0.24, cab: -0.06 }),
    tira: CGc({ pel: 0, torso: -0.3, cab: -0.26 }),
    cuelga: CGc({ pel: 0, torso: -0.05, cab: 0.06 }),
    cae: CGc({ pel: 0, torso: 0.22, cab: -0.2 }),
    asoma: CGc({ pel: 0, torso: 0.12, cab: 0.04 }),
    pulgar: CGc({ pel: 0, torso: 0.08, cab: -0.06 })
  };
  const GUION_CUERPO_G = [
    [T.flipa, T.flipa + 0.3, "flipa"], [T.idea, T.idea + 0.2, "idea"], [T.gira0, T.gira0 + 0.2, "gira"], [T.toca - 0.15, T.toca + 0.1, "toca"],
    [T.frenesi, T.frenesi + 0.3, "frenesi"], [T.carga - 0.05, T.carga + 0.15, "carga"], [T.choque - 0.06, T.choque + 0.04, "golpe", salida],
    [T.choque + 0.12, T.choque + 0.35, "frenesi"], [T.bonk - 0.01, T.bonk + 0.08, "bonk", salida], [T.bonk + 0.3, T.bonk + 0.7, "mareo"],
    [T.ve, T.ve + 0.3, "ve"], [T.decide, T.decide + 0.15, "decide"], [T.pasoG0, T.pasoG0 + 0.12, "corre"], [T.rodillaG - 0.06, T.rodillaG + 0.04, "tira"],
    [T.bordeG, T.cuelga, "cuelga"], [T.cae, T.cae + 0.15, "cae", entrada], [T.asoma0, T.asoma0 + 0.1, "asoma"], [T.pulgar - 0.1, T.pulgar + 0.2, "pulgar"]
  ];
  const CARAS_G = {
    quieto: E({ mx: 0.9, my: 0.05, c: 0.12, sd: 4, si: 4, abre: 0, ancho: 0.6, sonr: 0.2 }),
    flipa: E({ mx: 0.95, my: 0.1, iris: 0.9, sd: 24, si: 24, abre: 22, ancho: 0.6, sonr: 0.3 }),
    idea: E({ mx: 0.2, my: 0.05, c: 0.2, sd: -6, gd: -0.14, si: 20, gi: 0.12, abre: 4, ancho: 0.9, sonr: 0.85 }),
    gira: E({ mx: 0.3, my: 0.25, c: 0.15, sd: 12, si: 12, abre: 6, ancho: 0.8, sonr: 0.7 }),
    toca: E({ c: 0.9, z: 0.4, sd: 14, si: 14, abre: 24, ancho: 0.8, sonr: 0.4, lengua: 1 }),
    frenesi: E({ c: 1, z: 1, sd: 22, gd: -0.1, si: 22, gi: -0.1, abre: 30, ancho: 0.9, sonr: 0.45, lengua: 1 }),
    golpe: E({ mx: 0.6, my: -0.6, c: 0.15, sd: 26, si: 26, abre: 48, ancho: 1.05, sonr: 0.6 }),
    bonk: E({ c: 1, z: 1, sd: 18, si: 18, abre: 30, ancho: 0.9, sonr: -0.4 }),
    mareo: E({ esp: 1, sd: 10, gd: 0.18, si: 10, gi: 0.18, abre: 16, ancho: 0.8, sonr: 0.35, lengua: 1 }),
    ve: E({ mx: 0.95, my: 0.1, iris: 0.9, sd: 22, si: 22, abre: 26, ancho: 0.65, sonr: 0.25 }),
    decide: E({ mx: 0.8, my: 0.05, c: 0.25, sd: -8, gd: -0.18, si: -6, gi: -0.16, abre: 6, ancho: 0.95, sonr: 0.8 }),
    corre: E({ mx: 0.9, c: 0.25, sd: -6, si: -6, abre: 20, ancho: 0.9, sonr: 0.6 }),
    tira: E({ c: 1, z: 0.5, sd: 20, si: 20, abre: 42, ancho: 1.05, sonr: 0.55 }),
    baja: E({ mx: 0.7, my: 0.9, iris: 0.75, sd: 26, gd: 0.15, si: 26, gi: 0.15, abre: 10, ancho: 0.5, sonr: -0.3 }),
    panico: E({ mx: -0.4, my: 0.1, iris: 0.65, sd: 30, gd: 0.22, si: 30, gi: 0.22, abre: 14, ancho: 0.5, sonr: -0.55 }),
    grito: E({ c: 0.6, sd: 30, gd: 0.2, si: 30, gi: 0.2, abre: 46, ancho: 0.8, sonr: -0.4 }),
    asoma: E({ esp: 1, sd: 12, gd: 0.15, si: 12, gi: 0.15, abre: 10, ancho: 0.8, sonr: 0.4 }),
    camara: E({ mx: -0.35, my: 0.08, c: 0.2, h: 0.4, sd: 14, si: 10, abre: 22, ancho: 0.95, sonr: 0.95 })
  };
  const GUION_CARA_G = [
    [T.flipa, T.flipa + 0.15, "flipa"], [T.idea, T.idea + 0.15, "idea"], [T.gira0, T.gira0 + 0.15, "gira"], [T.toca - 0.08, T.toca + 0.05, "toca"],
    [T.frenesi, T.frenesi + 0.2, "frenesi"], [T.carga, T.carga + 0.1, "golpe"], [T.choque + 0.1, T.choque + 0.25, "frenesi"],
    [T.bonk, T.bonk + 0.04, "bonk", salida], [T.bonk + 0.25, T.bonk + 0.45, "mareo"], [T.ve, T.ve + 0.35, "ve"], [T.decide, T.decide + 0.15, "decide"],
    [T.pasoG0, T.pasoG0 + 0.1, "corre"], [T.rodillaG - 0.05, T.rodillaG + 0.05, "tira"], [T.bordeG, T.bordeG + 0.06, "baja", salida], [T.cuelga, T.cuelga + 0.08, "panico", salida], [T.cae, T.cae + 0.05, "grito"],
    [T.asoma0, T.asoma0 + 0.1, "asoma"], [T.pulgar - 0.15, T.pulgar + 0.2, "camara"]
  ];
  const PARP_G = [0.5, 2.6, 10.6, 12.95];

  // golpes de la batería: [t, mano, tambor] — tambor: 0 caja, 1 tom, 2 charles
  const TAMBORES = {
    cerca: [P(282, 600), P(250, 640)],                     // caja y tom base (mano cercana)
    lejos: [P(452, 586), P(470, 520), P(430, 470)]          // caja, tom aéreo y charles (mano lejana)
  };
  const GOLPES = (() => {
    const L = [];
    // corcheas alternas, luego semicorcheas; redoble por los toms
    for (let t = T.toca; t < T.carga - 0.02; ) {
      const frenesi = t >= T.frenesi, paso = frenesi ? B / 4 : B / 2;
      const k = Math.round((t - T.toca) / paso);
      const redoble = t >= T.redoble;
      const lado = k % 2 ? "lejos" : "cerca";
      const tambor = redoble ? (lado === "cerca" ? (Math.floor(k / 2) % 2) : 1) : (lado === "lejos" && k % 4 === 3 ? 2 : 0);
      L.push([t, lado, tambor]);
      t += paso;
    }
    // mareado: a destiempo y fallando
    let tt = T.bonk + 0.35, i = 0;
    while (tt < T.ve - 0.2) { L.push([tt, i % 2 ? "lejos" : "cerca", -1]); tt += 0.28 + 0.2 * hash(i * 3.3 + 1); i++; }
    return L.sort((a, b) => a[0] - b[0]);
  })();
  const GOLPES_DE = { cerca: GOLPES.filter(g => g[1] === "cerca"), lejos: GOLPES.filter(g => g[1] === "lejos") };
  // estado de una baqueta: posición del tambor objetivo y altura (0 = en el parche)
  function baqueta(lado, t) {
    const L = GOLPES_DE[lado];
    let i = -1; for (let k = 0; k < L.length; k++) if (L[k][0] <= t) i = k;
    const prev = i >= 0 ? L[i] : null, next = L[i + 1] || null;
    if (!prev && !next) return null;
    if (!next) return { tam: prev[2], u: 1, dt: 1, t0: prev[0] };
    const dt = next[0] - (prev ? prev[0] : next[0] - 0.4);
    const u = clamp((t - (prev ? prev[0] : next[0] - 0.4)) / dt);
    return { tam: next[2], tamPrev: prev ? prev[2] : next[2], u, dt, t0: prev ? prev[0] : -9 };
  }

  function poseG(t, geo = false) { return memo("g" + t, () => poseG0(t)); }
  function poseG0(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "quieto", t);
    const respira = Math.sin(t * 2.1);
    const suelo = sueloG(t), s = escG(t), x = xG(t);
    const tocando = t > T.toca - 0.1 && t < T.ve;
    const φ = fasePulso(t, t > T.frenesi && t < T.carga ? 2 : 1), bote = tocando && t < T.bonk ? 8 * Math.exp(-φ * 5) : 0;
    const asiente = t > 1.3 && t < T.toca ? 0.06 * (Math.exp(-fasePulso(t) * 6) - 0.15) * tramo(t, 1.3, 1.6) : 0;
    const mareo = tramo(t, T.bonk + 0.2, T.bonk + 0.6) * (1 - tramo(t, T.ve + 0.4, T.decide));
    const balanceo = mareo * Math.sin((t - T.bonk) * 3.4);
    const rodillas = tramo(t, T.rodillaG - 0.05, T.rodillaG + 0.02) * (t < T.asoma0 ? 1 : 0);
    const traq = (t > T.rodillaG && t < T.bordeG) ? 1.3 * ruido(t * 44) : 0;
    const bonkK = campana(t, T.bonk - 0.01, T.bonk + 0.22);
    const p = {
      x, suelo, s, espejo: false, tirasLimpias: true, ikContinuo: false,
      hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x + 0 * balanceo, y: G.PELVIS.y + b.pel + respira * 1.2 + bote + 338 * suave(rodillas) + traq / s + 20 * bonkK },
      torso: b.torso + 0.08 * balanceo, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + asiente + 0.12 * balanceo + 0.05 * mareo * Math.sin(t * 5.3), dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } }
    };
    // pies
    const pasos = memo("pasosG", () => ({
      cerca: [[-9, XG0 - 22, 9 + T.pasoG0], [T.pasoG0 + 0.2, XG0 + 14, 0.02], [T.rodillaG - 0.04, XG_DEJA - 10]],
      lejos: [[-9, XG0 + 24, 9 + T.pasoG0 + 0.1], [T.pasoG0 + 0.3, XG0 + 62, 0.02], [T.rodillaG, XG_DEJA + 20]]
    }));
    let wC = pieDe(pasos.cerca, t, { corre: true, alto: 30, apoyo: 0.05 }), wL = pieDe(pasos.lejos, t, { corre: true, alto: 30, apoyo: 0.05 });
    // mareado: los pies se recolocan tambaleándose
    if (mareo > 0) { wC = Object.assign({}, wC, { x: wC.x + 8 * mareo * Math.sin((t - T.bonk) * 3.4 - 0.6) }); wL = Object.assign({}, wL, { x: wL.x + 6 * mareo * Math.sin((t - T.bonk) * 3.4 + 0.4) }); }
    p.piernas.cerca = aPierna(G, p, wC, "cerca"); p.piernas.lejos = aPierna(G, p, wL, "lejos");
    if (rodillas > 0) {
      const R = deRodillas(G, p, 0);
      for (const lado of ["lejos", "cerca"]) p.piernas[lado] = mezPierna(p.piernas[lado], R[lado], suave(rodillas));
    }
    // cayendo / asomando: piernas colgando y algo dobladas
    if (t > T.asoma0) {
      const tob = G.SUELO - G.TOBILLO_ALTO;
      p.piernas.cerca = { tob: P(G.PELVIS.x - 40, tob), ang: 0 }; p.piernas.lejos = { tob: P(G.PELVIS.x + 50, tob - 12), ang: 0 };
    }
    // cara
    const e = guion(GUION_CARA_G, CARAS_G, "quieto", t);
    if (tocando && t < T.bonk) e.abre += 8 * Math.sin(t * 19);
    p.cara = cara(e, parpadeo(t, PARP_G));
    if (t > T.guinoG) { const k = campana(t, T.guinoG, T.guinoG + 0.55); p.cara.ojos.d = Math.max(p.cara.ojos.d, k); }
    p.sudor = 0.9 * tramo(t, T.frenesi + 0.4, T.frenesi + 0.8) * (1 - tramo(t, T.bonk, T.bonk + 0.2));
    p.chichon = salida(fase(t, T.bonk, T.bonk + 0.18)) * (1 + 0.15 * campana(t, T.bonk + 0.1, T.bonk + 0.35));
    p.chichonEn = P(800, 300);
    manosG(p, t);
    // giro de todo el cuerpo al caer por el borde (alrededor de las rodillas)
    if (t > T.cae && t < T.asoma0) {
      const u = fase(t, T.cae, T.pum);
      p.giro = { ang: 0.3 * salida(u), piv: P(x + 30, suelo - 60) };
    }
    return p;
  }

  function manosG(p, t) {
    const rC = resolutor(G, p, "cerca"), rL = resolutor(G, p, "lejos");
    const bols = { c: { bols: true }, l: { bols: true } };
    const listo = { c: HM(230, 560, -2.2, BAQUETA, -1), l: HM(430, 540, -2.4, BAQUETA, 1) };
    const cuenta = { c: HM(300, 420, -2.4, BAQUETA, -1), l: HM(420, 400, -2.6, BAQUETA, -1) };
    const carga = { c: HM(250, 600, -2.1, BAQUETA, -1), l: HM(260, 260, 1.0, BAQUETA, -1) };
    const choque = { c: HM(282, 600, -2.1, BAQUETA, -1), l: HM(500, 150, 2.4, BAQUETA, -1) };
    const ve = { c: HM(220, 570, -2.0, D5(0.4, 0.6, 0.6, 0.6, 0.6), -1), l: HM(400, 560, -2.3, D5(0.4, 0.6, 0.6, 0.6, 0.6), 1) };
    const decide = { c: HM(250, 470, -2.3, PUNO, -1), l: HM(420, 450, -2.5, PUNO, 1) };
    const abre = { c: HM(-170, 150, 0.75, PALMA, 1), l: HM(640, 120, 2.45, PALMA, -1) };
    const cuelga = { c: HM(-150, 200, 0.5, PALMA, 1), l: HM(620, 180, 2.6, PALMA, -1) };
    const cae = { c: HM(-60, -10, 1.4, PALMA, 1), l: HM(520, -20, 1.9, PALMA, -1) };
    // asomado: antebrazos sobre el borde del escenario; la cercana con el pulgar arriba
    const yB = ESC.borde - 4;
    const apoyoC = { scr: () => P(p.x + 34, yB + 2), mu: Math.PI - 0.15, dedos: PUNO, dobla: -1 };
    const apoyoL = { scr: () => P(p.x + 100, yB), mu: Math.PI, dedos: D5(0.2, 0.15, 0, 0, 0), dobla: 1 };
    const pulgarL = { scr: () => P(p.x + 104, yB - 8), mu: Math.PI, dedos: D5(1, 0, 0, 0, 0), dobla: 1 };
    const pistaC = [
      [0, 0, bols.c], [T.saca0, T.saca1, listo.c], [T.cuenta[0] - 0.25, T.cuenta[0] - 0.05, cuenta.c], [T.toca - 0.2, T.toca - 0.02, listo.c],
      [T.carga - 0.05, T.carga + 0.08, carga.c], [T.choque - 0.08, T.choque, choque.c], [T.choque + 0.12, T.choque + 0.25, listo.c],
      [T.ve, T.ve + 0.3, ve.c], [T.decide, T.decide + 0.15, decide.c], [T.rodillaG - 0.06, T.rodillaG + 0.05, abre.c], [T.cuelga - 0.05, T.cuelga + 0.08, cuelga.c, salida], [T.cae, T.cae + 0.1, cae.c, salida],
      [T.asoma0, T.asoma0 + 0.3, apoyoC, salida]
    ];
    const pistaL = [
      [0, 0, bols.l], [T.saca0 + 0.05, T.saca1 + 0.05, listo.l],
      [T.cuenta[0] - 0.25, T.cuenta[0] - 0.05, cuenta.l], [T.toca - 0.2, T.toca - 0.02, listo.l],
      [T.carga - 0.05, T.carga + 0.1, carga.l], [T.choque - 0.1, T.choque, choque.l, entrada], [T.choque + 0.12, T.choque + 0.28, listo.l],
      [T.ve, T.ve + 0.3, ve.l], [T.decide, T.decide + 0.15, decide.l], [T.rodillaG - 0.06, T.rodillaG + 0.05, abre.l], [T.cuelga - 0.05, T.cuelga + 0.08, cuelga.l, salida], [T.cae, T.cae + 0.1, cae.l, salida],
      [T.asoma0, T.asoma0 + 0.3, apoyoL, salida], [T.pulgar - 0.15, T.pulgar, pulgarL, salida]
    ];
    let C = pista(pistaC, t, rC), L = pista(pistaL, t, rL);
    // gira las baquetas
    if (t > T.gira0 && t < T.gira1 + 0.1) { const k = campana(t, T.gira0 - 0.05, T.gira1 + 0.1); C = conMano(C, 0, 0, 4 * k * Math.sin((t - T.gira0) * 30)); L = conMano(L, 0, 0, 4 * k * Math.sin((t - T.gira0) * 30 + 1)); }
    // «un, dos, tres»: choca las baquetas
    for (const tc of T.cuenta) { const k = Math.exp(-Math.pow((t - tc) / 0.06, 2)); C = conMano(C, 14 * k, -8 * k); L = conMano(L, -14 * k, -8 * k); }
    // la batería
    const kT = tramo(t, T.toca - 0.08, T.toca) * (1 - tramo(t, T.carga - 0.06, T.carga)) + tramo(t, T.choque + 0.1, T.choque + 0.22) * (1 - tramo(t, T.ve - 0.1, T.ve + 0.15));
    if (kT > 0) { C = mezMano(C, golpeMano(p, t, "cerca", rC), kT); L = mezMano(L, golpeMano(p, t, "lejos", rL), kT); }
    // cayendo: braceo de pánico
    if (t > T.cuelga && t < T.pum) { const k = (t < T.cae ? 34 : 18) * tramo(t, T.cuelga, T.cuelga + 0.06); C = conMano(C, k * Math.sin(t * 33), k * Math.cos(t * 29)); L = conMano(L, k * Math.sin(t * 27 + 2), k * Math.cos(t * 31 + 1)); }
    // pulgar: un pequeño meneo
    if (t > T.pulgar) { const k = Math.exp(-(t - T.pulgar) * 3); L = conMano(L, 0, -6 * Math.sin((t - T.pulgar) * 16) * k); }
    p.manoCerca = C; p.manoLejos = L;
  }
  // mano de la batería: sube entre golpe y golpe y baja de golpe al parche
  function golpeMano(p, t, lado, res) {
    const st = baqueta(lado, t), Ls = TAMBORES[lado];
    const muBase = lado === "cerca" ? -2.15 : -2.45;
    if (!st) return res(HM(Ls[0].x, Ls[0].y, muBase, BAQUETA, lado === "cerca" ? -1 : 1));
    const mareado = st.tam < 0;
    const tamA = Ls[Math.max(0, st.tamPrev ?? st.tam)] || Ls[0], tamB = Ls[Math.max(0, st.tam)] || Ls[0];
    const u = st.u, sube = Math.min(110, 30 + st.dt * 170);
    // perfil: rebote rápido tras el golpe, arriba, y caída rápida al siguiente
    const h = u < 0.35 ? salida(u / 0.35) : u < 0.7 ? 1 : 1 - entrada((u - 0.7) / 0.3);
    const base = mezcla(tamA, tamB, suave(clamp((u - 0.2) / 0.6)));
    let x = base.x - 18 * h, y = base.y - sube * h;
    let mu = muBase - 0.55 * h;                                    // la muñeca se echa atrás al subir
    if (mareado) { x += 34 * Math.sin(t * 4.1 + (lado === "cerca" ? 0 : 2)); y += 26 * Math.sin(t * 3.3 + (lado === "cerca" ? 1 : 0)) - 20; }
    return res(HM(x, y, mu, BAQUETA, lado === "cerca" ? -1 : 1));
  }

  function pose(t) { return { g: poseG(t), p: poseP(t) }; }

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  let fondo = null, frente = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    // pared de ladrillo oscuro
    const pg = g.createLinearGradient(0, 0, 0, ESC.fondo); pg.addColorStop(0, "#1c1220"); pg.addColorStop(1, "#3a2128");
    g.fillStyle = pg; g.fillRect(0, 0, W, H);
    for (let fila = 0, y = 0; y < 480; fila++, y += 17) {
      const off = (fila % 2) * 23;
      for (let x = -off; x < W; x += 46) {
        const k = hash(fila * 31 + x * 0.7);
        g.fillStyle = `rgba(${120 + 40 * k | 0},${54 + 20 * k | 0},${50 + 10 * k | 0},${0.22 + 0.12 * k})`;
        g.fillRect(x + 1.5, y + 1.5, 43, 14);
      }
    }
    // luz cálida del escenario sobre la pared
    const lw = g.createRadialGradient(560, 300, 40, 560, 330, 520); lw.addColorStop(0, "rgba(255,170,90,0.28)"); lw.addColorStop(1, "rgba(255,170,90,0)");
    g.fillStyle = lw; g.fillRect(0, 0, W, ESC.fondo);
    const lm = g.createRadialGradient(880, 160, 20, 880, 200, 360); lm.addColorStop(0, "rgba(220,80,200,0.22)"); lm.addColorStop(1, "rgba(220,80,200,0)");
    g.fillStyle = lm; g.fillRect(400, 0, W - 400, ESC.fondo);
    // focos de pared (latas negras con luz)
    for (const [fx, fy, a] of [[188, 54, 0.5], [960, 60, 2.5]]) {
      g.save(); g.translate(fx, fy); g.rotate(a);
      g.fillStyle = "#121118"; g.fillRect(-14, -12, 34, 24); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(-14, -12, 34, 24);
      g.fillStyle = "#fff1c8"; g.beginPath(); g.ellipse(20, 0, 4, 10, 0, 0, TAU); g.fill();
      g.restore();
      g.fillStyle = "#121118"; g.fillRect(fx - 3, 0, 6, fy - 8);
    }
    // tarima de la batería (vacía), al fondo a la izquierda
    g.fillStyle = "#1b1418"; g.fillRect(170, 372, 250, 44); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(170, 372, 250, 44);
    g.fillStyle = "#5a2630"; g.fillRect(176, 366, 238, 8); g.strokeRect(176, 366, 238, 8);
    g.fillStyle = "rgba(255,255,255,0.05)"; for (let x = 182; x < 410; x += 18) g.fillRect(x, 380, 2, 32);
    // amplificador grande (derecha) y uno pequeño
    amplificador(g, 880, 262, 120, 152, true);
    amplificador(g, 560, 352, 70, 62, false);
    // la pista de baile (más abajo, a la izquierda del escenario)
    pista2(g);
    // el escenario: tarima
    tarima(g);
    // viñeta
    const v = g.createRadialGradient(540, 300, 260, 540, 320, 760); v.addColorStop(0, "rgba(10,4,10,0)"); v.addColorStop(1, "rgba(10,4,10,0.55)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    return c;
  }
  function amplificador(g, x, y, w, h, grande) {
    g.save(); g.lineJoin = "round";
    g.fillStyle = "#17151b"; g.fillRect(x, y, w, h); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(x, y, w, h);
    // panel de mandos
    g.fillStyle = "#2a2730"; g.fillRect(x + 6, y + 6, w - 12, 16); g.strokeRect(x + 6, y + 6, w - 12, 16);
    g.fillStyle = "#d9c79a"; for (let i = 0; i < (grande ? 7 : 4); i++) { g.beginPath(); g.arc(x + 16 + i * (w - 32) / (grande ? 6 : 3), y + 14, 3, 0, TAU); g.fill(); }
    g.fillStyle = "#ff5a3c"; g.beginPath(); g.arc(x + w - 12, y + 14, 2.4, 0, TAU); g.fill();
    // rejilla
    const gx = x + 8, gy = y + 28, gw = w - 16, gh = h - 36;
    g.fillStyle = "#3a3540"; g.fillRect(gx, gy, gw, gh); g.strokeRect(gx, gy, gw, gh);
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 1;
    for (let i = gx + 3; i < gx + gw; i += 4) { g.beginPath(); g.moveTo(i, gy); g.lineTo(i - 6, gy + gh); g.stroke(); }
    if (grande) { g.strokeStyle = "rgba(0,0,0,0.5)"; g.lineWidth = 2; g.beginPath(); g.moveTo(gx, gy + gh / 2); g.lineTo(gx + gw, gy + gh / 2); g.stroke(); }
    g.fillStyle = "#0e0d12"; g.fillRect(x + 4, y + h, 10, 4); g.fillRect(x + w - 14, y + h, 10, 4);
    g.restore();
  }
  // pista de baile vacía a la izquierda, más abajo que el escenario
  function pista2(g) {
    const yP = 452;
    g.save();
    g.beginPath(); g.rect(0, yP, ESC.izqF + 4, H - yP); g.clip();
    g.fillStyle = "#1a1418"; g.fillRect(0, yP, W, H - yP);
    // baldosas a cuadros en perspectiva
    for (let fila = 0; fila < 10; fila++) {
      const y0 = yP + Math.pow(fila / 10, 1.6) * (H - yP + 40), y1 = yP + Math.pow((fila + 1) / 10, 1.6) * (H - yP + 40);
      for (let col = -4; col < 8; col++) {
        const w0 = 34 + fila * 6, x0 = col * w0 + (fila % 2) * 0;
        if ((col + fila) % 2) continue;
        g.fillStyle = "rgba(220,200,180,0.16)"; g.fillRect(x0, y0, w0, y1 - y0);
      }
    }
    // taburetes vacíos (siluetas)
    for (const [tx, ty, sc] of [[44, 520, 1], [102, 548, 1.1]]) {
      g.save(); g.translate(tx, ty); g.scale(sc, sc);
      g.fillStyle = "#0e0b10"; g.beginPath(); g.ellipse(0, -62, 18, 5, 0, 0, TAU); g.fill();
      g.strokeStyle = "#0e0b10"; g.lineWidth = 4; g.beginPath(); g.moveTo(-12, -60); g.lineTo(-16, 0); g.moveTo(12, -60); g.lineTo(16, 0); g.moveTo(-14, -26); g.lineTo(14, -26); g.stroke();
      g.restore();
    }
    g.restore();
    // pared del fondo más baja en la zona de la pista
    g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(0, yP - 6, ESC.izqF, 6);
  }
  function tarima(g) {
    const Y0 = ESC.fondo, Y1 = ESC.borde;
    const xl = y => lerp(ESC.izqF, ESC.izqD, (y - Y0) / (Y1 - Y0));
    g.save();
    // superficie de tablas
    g.beginPath(); g.moveTo(ESC.izqF, Y0); g.lineTo(W + 10, Y0); g.lineTo(W + 10, Y1); g.lineTo(ESC.izqD, Y1); g.closePath();
    const base = g.createLinearGradient(0, Y0, 0, Y1); base.addColorStop(0, "#4a2f22"); base.addColorStop(1, "#7a5036");
    g.fillStyle = base; g.fill();
    g.save(); g.clip();
    let y = Y0, k = 0;
    while (y < Y1) {
      const h = 6 + (y - Y0) * 0.11, off = (k * 191) % 300;
      for (let x = xl(y) - off; x < W; x += 300) {
        const tono = hash(k * 17 + Math.floor(x)) * 0.16;
        g.fillStyle = `rgba(${tono > 0.08 ? "255,210,160" : "40,20,10"},${Math.abs(tono - 0.08) * 1.3})`; g.fillRect(x, y, 300, h);
        g.fillStyle = "rgba(20,8,4,0.55)"; g.fillRect(x, y, 1.5, h);
      }
      g.fillStyle = "rgba(20,8,4,0.55)"; g.fillRect(0, y, W, 1.2);
      y += h; k++;
    }
    // cinta de carrocero en el suelo (marcas en cruz) y un cable que serpentea
    g.strokeStyle = "rgba(240,230,200,0.55)"; g.lineWidth = 3;
    for (const [cx, cy] of [[650, 488], [300, 452], [880, 470]]) { g.beginPath(); g.moveTo(cx - 9, cy - 3); g.lineTo(cx + 9, cy + 3); g.moveTo(cx - 9, cy + 3); g.lineTo(cx + 9, cy - 3); g.stroke(); }
    g.strokeStyle = "#0d0c10"; g.lineWidth = 3; g.beginPath(); g.moveTo(880, 418); g.bezierCurveTo(820, 440, 760, 430, 700, 452); g.bezierCurveTo(640, 474, 560, 460, 520, 476); g.stroke();
    g.restore();
    // canto delantero con su fila de bombillitas
    g.fillStyle = "#2b1a14"; g.fillRect(ESC.izqD, Y1, W - ESC.izqD + 10, 8); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(ESC.izqD, Y1, W - ESC.izqD + 10, 8);
    // frontal: faldón de tela negra con pliegues
    const fg = g.createLinearGradient(0, Y1 + 8, 0, H); fg.addColorStop(0, "#1a1218"); fg.addColorStop(1, "#0c080c");
    g.fillStyle = fg; g.fillRect(ESC.izqD, Y1 + 8, W - ESC.izqD + 10, H - Y1);
    for (let x = ESC.izqD + 10; x < W; x += 26) { g.fillStyle = "rgba(255,255,255,0.035)"; g.fillRect(x, Y1 + 8, 9, H - Y1); g.fillStyle = "rgba(0,0,0,0.3)"; g.fillRect(x + 18, Y1 + 8, 4, H - Y1); }
    // lateral izquierdo del escenario (se ve un poco)
    g.fillStyle = "#24161a"; g.beginPath(); g.moveTo(ESC.izqF, Y0); g.lineTo(ESC.izqD, Y1 + 8); g.lineTo(ESC.izqD, H); g.lineTo(ESC.izqF - 6, H); g.lineTo(ESC.izqF - 6, Y0); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(ESC.izqF, Y0); g.lineTo(ESC.izqD, Y1); g.lineTo(ESC.izqD, H); g.stroke();
    g.beginPath(); g.moveTo(ESC.izqD, Y1); g.lineTo(W + 10, Y1); g.stroke();
    g.restore();
  }
  // bombillitas del canto (brillan un poco con el compás)
  function bombillasBorde(g, t) {
    const pulso = t > 0.9 ? Math.exp(-fasePulso(t) * 5) : 0;
    g.save();
    for (let x = ESC.izqD + 18, i = 0; x < W; x += 36, i++) {
      const y = ESC.borde + 4, k = 0.6 + 0.4 * pulso * (i % 2 ? 1 : 0.6);
      g.fillStyle = `rgba(255,200,110,${0.25 * k})`; g.beginPath(); g.arc(x, y, 9, 0, TAU); g.fill();
      g.fillStyle = `rgba(255,236,190,${0.9 * k})`; g.beginPath(); g.arc(x, y, 2.6, 0, TAU); g.fill();
    }
    g.restore();
  }
  // guirnaldas de bombillas de lado a lado (por delante de la pared)
  const GUIRNALDAS = [[[-20, 22], [300, 70], [620, 26]], [[560, 30], [820, 82], [1050, 34]]];
  function guirnaldas(g, t) {
    g.save(); g.lineCap = "round";
    GUIRNALDAS.forEach((cad, j) => {
      const [a, m, b] = cad, n = 13;
      g.strokeStyle = "#0d0b10"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(2 * m[0] - (a[0] + b[0]) / 2, 2 * m[1] - (a[1] + b[1]) / 2, b[0], b[1]); g.stroke();
      for (let i = 1; i < n; i++) {
        const u = i / n, x = (1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * (2 * m[0] - (a[0] + b[0]) / 2) + u * u * b[0];
        const y = (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * (2 * m[1] - (a[1] + b[1]) / 2) + u * u * b[1] + 6;
        const brilla = 0.75 + 0.25 * Math.sin(t * 1.7 + i * 2.1 + j);
        const col = ["255,210,120", "255,150,190", "150,220,255", "255,240,180"][(i + j) % 4];
        g.fillStyle = `rgba(${col},${0.18 * brilla})`; g.beginPath(); g.arc(x, y, 10, 0, TAU); g.fill();
        g.fillStyle = `rgba(${col},${0.95 * brilla})`; g.beginPath(); g.ellipse(x, y, 3, 4, 0, 0, TAU); g.fill();
      }
    });
    g.restore();
  }

  /* ---------- la lámpara ---------- */
  function luzLampara(g, t) {
    const th = anguloLampara(t), c = centroLampara(th);
    const dx = Math.sin(th), dy = Math.cos(th);
    g.save(); g.globalCompositeOperation = "lighter";
    const bx = c.x + dx * 20, by = c.y + dy * 20, L = (ESC.borde - by) / Math.max(0.3, dy), fx = bx + dx * L;
    const cono = g.createLinearGradient(bx, by, fx, ESC.borde);
    cono.addColorStop(0, "rgba(255,214,140,0.22)"); cono.addColorStop(1, "rgba(255,214,140,0.03)");
    g.fillStyle = cono; g.beginPath(); g.moveTo(bx - 30, by); g.lineTo(bx + 30, by); g.lineTo(fx + 120, ESC.borde - 4); g.lineTo(fx - 120, ESC.borde - 4); g.closePath(); g.fill();
    const charco = g.createRadialGradient(fx, ESC.borde - 26, 4, fx, ESC.borde - 26, 140);
    charco.addColorStop(0, "rgba(255,210,140,0.2)"); charco.addColorStop(1, "rgba(255,210,140,0)");
    g.save(); g.translate(fx, ESC.borde - 26); g.scale(1, 0.28); g.fillStyle = charco; g.beginPath(); g.arc(0, 0, 140, 0, TAU); g.fill(); g.restore();
    g.restore();
  }
  function dibLampara(g, t) {
    const th = anguloLampara(t), c = centroLampara(th);
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    g.strokeStyle = "#0d0c12"; g.lineWidth = 2.6; g.beginPath(); g.moveTo(LX, LPY); g.lineTo(c.x - Math.sin(th) * 28, c.y - Math.cos(th) * 28); g.stroke();
    g.translate(c.x, c.y); g.rotate(-th);
    // halo
    const hl = g.createRadialGradient(0, 22, 4, 0, 22, 60); hl.addColorStop(0, "rgba(255,226,160,0.5)"); hl.addColorStop(1, "rgba(255,226,160,0)");
    g.fillStyle = hl; g.beginPath(); g.arc(0, 22, 60, 0, TAU); g.fill();
    // bombilla
    const gb = g.createRadialGradient(0, 20, 2, 0, 20, 14); gb.addColorStop(0, "#fffbe8"); gb.addColorStop(1, "#ffd27a");
    g.fillStyle = gb; g.beginPath(); g.arc(0, 21, 10, 0, TAU); g.fill(); g.lineWidth = 1.6; g.strokeStyle = "#a07a3a"; g.stroke();
    // pantalla metálica cónica
    const forma = () => { g.beginPath(); g.moveTo(-9, -26); g.lineTo(9, -26); g.bezierCurveTo(14, -12, 30, 6, 34, 20); g.lineTo(-34, 20); g.bezierCurveTo(-30, 6, -14, -12, -9, -26); g.closePath(); };
    const gm = g.createLinearGradient(-34, 0, 34, 0); gm.addColorStop(0, "#8a2b22"); gm.addColorStop(0.38, "#d0533e"); gm.addColorStop(1, "#5c1a16");
    forma(); g.fillStyle = gm; g.fill(); g.lineWidth = 2.8; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "#ffe9b0"; g.beginPath(); g.ellipse(0, 20, 33, 5, 0, 0, Math.PI); g.fill(); g.lineWidth = 2; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.moveTo(-6, -22); g.bezierCurveTo(-12, -8, -22, 4, -24, 14); g.lineTo(-18, 14); g.bezierCurveTo(-14, 4, -8, -10, -3, -22); g.closePath(); g.fill();
    // abolladura del golpe (se queda)
    if (t > T.choque) { g.strokeStyle = "rgba(40,8,6,0.75)"; g.lineWidth = 2; g.beginPath(); g.moveTo(-28, 14); g.quadraticCurveTo(-22, 8, -24, 2); g.stroke(); }
    g.fillStyle = "#2b2b33"; g.fillRect(-9, -32, 18, 8); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(-9, -32, 18, 8);
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrella(g, x, y, r, n, giro, hueco = 0.45) {
    g.beginPath();
    for (let i = 0; i < n * 2; i++) { const a = giro + i * Math.PI / n, rr = i % 2 ? r * hueco : r; const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; if (i) g.lineTo(px, py); else g.moveTo(px, py); }
    g.closePath();
  }
  // destellos en los parches invisibles de la batería
  function parches(g, t, pg) {
    g.save(); g.lineCap = "round";
    for (const [tg, lado, tam] of GOLPES) {
      const u = (t - tg) / 0.16; if (u < 0 || u > 1 || tam < 0) continue;
      const pgg = poseG(tg), q0 = TAMBORES[lado][tam];
      const c = G.aPantalla(pgg, G.tronco(pgg)(P(q0.x + 40, q0.y + 34)));
      const rx = tam === 2 ? 15 : 22, k = 1 - u;
      g.strokeStyle = `rgba(255,246,220,${0.55 * k})`; g.lineWidth = 2;
      g.beginPath(); g.ellipse(c.x, c.y, rx * (0.8 + 0.5 * u), 5 * (0.8 + 0.5 * u), 0, 0, TAU); g.stroke();
      g.strokeStyle = `rgba(255,250,235,${0.8 * k})`; g.lineWidth = 2.2;
      for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 + (i - 1.5) * 0.5, r0 = 10 + 8 * u, r1 = r0 + 7;
        g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y - 4 + Math.sin(a) * r0); g.lineTo(c.x + Math.cos(a) * r1, c.y - 4 + Math.sin(a) * r1); g.stroke(); }
    }
    g.restore();
  }
  // estelas de las baquetas invisibles (arcos tenues)
  function estelas(g, t, pg) {
    if (!(t > T.toca && t < T.ve)) return;
    g.save(); g.lineCap = "round";
    for (const lado of ["cerca", "lejos"]) {
      const pts = [];
      for (let k = 0; k <= 4; k++) { const tt = t - k * 0.018, pp = poseG(tt), m = lado === "cerca" ? pp.manoCerca : pp.manoLejos; pts.push(G.aPantalla(pp, P(m.x + 40, m.y - 30))); }
      const v = Math.hypot(pts[0].x - pts[4].x, pts[0].y - pts[4].y); if (v < 10) continue;
      g.strokeStyle = `rgba(255,255,255,${Math.min(0.35, v / 160)})`; g.lineWidth = 3;
      g.beginPath(); g.moveTo(pts[0].x, pts[0].y); for (let k = 1; k <= 4; k++) g.lineTo(pts[k].x, pts[k].y); g.stroke();
    }
    g.restore();
  }
  // notas redondas que salen de la guitarra invisible
  const NOTAS = (() => {
    const L = [];
    for (let k = 0; k < 19; k++) {
      const t0 = beat(k);
      if (t0 > T.corre0) break;
      if (k % 2 === 0 || t0 > T.solo0) L.push({ t0, vida: 1.7 + 0.5 * hash(k * 1.7), i: k });
    }
    L.push({ t0: T.acorde, vida: 2.2, i: 40 }, { t0: T.acorde + 0.05, vida: 2.0, i: 41 }, { t0: T.acorde + 0.1, vida: 2.4, i: 42 });
    return L;
  })();
  const COLN = ["#ffd166", "#ff8fab", "#9be7ff", "#c3a6ff", "#a8f0a0"];
  const ORIGEN = new Map();
  function origenNota(n) { if (!ORIGEN.has(n)) ORIGEN.set(n, cuerdas(poseP(n.t0))); return ORIGEN.get(n); }
  function notaRedonda(g, s, gir, col) {
    g.save(); g.scale(s, s); g.rotate(gir); g.lineJoin = "round"; g.lineCap = "round";
    const forma = () => { g.beginPath(); g.ellipse(-8, 10, 9.5, 7.2, -0.4, 0, TAU); g.moveTo(0.5, 8); g.lineTo(0.5, -22); g.quadraticCurveTo(10, -17, 12, -6); };
    g.strokeStyle = TINTA; g.lineWidth = 6; forma(); g.stroke();
    g.fillStyle = col; g.beginPath(); g.ellipse(-8, 10, 9.5, 7.2, -0.4, 0, TAU); g.fill();
    g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.moveTo(0.5, 8); g.lineTo(0.5, -22); g.quadraticCurveTo(10, -17, 12, -6); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(-11, 7, 3.2, 2, -0.4, 0, TAU); g.fill();
    g.restore();
  }
  function notas(g, t) {
    for (const n of NOTAS) {
      const u = (t - n.t0) / n.vida; if (u <= 0 || u >= 1) continue;
      const o = origenNota(n), ph = 6.3 * hash(n.i * 0.77);
      const hx = 50 + 90 * hash(n.i * 1.93), hy = 120 + 70 * hash(n.i * 2.71);
      const x = o.x + 14 + hx * u + 12 * Math.sin(u * 5 + ph), y = o.y - 10 - hy * u - 30 * u * u + 7 * Math.sin(u * 7 + ph * 2);
      g.save(); g.translate(x, y); g.globalAlpha = clamp(u / 0.06) * (1 - tramo(u, 0.6, 1));
      notaRedonda(g, (n.i >= 40 ? 1.2 : 0.9) * salida(clamp(u / 0.2)), 0.3 * Math.sin(u * 4 + n.i), COLN[n.i % 5]);
      g.restore();
    }
  }
  // ¡clang! en la lámpara y ¡bonk! en la cabeza
  function impactos(g, t, pg) {
    const k1 = campana(t, T.choque - 0.01, T.choque + 0.2);
    if (k1 > 0.01) {
      const q = bordeLampara(anguloLampara(T.choque));
      g.save(); g.globalAlpha = k1; estrella(g, q.x - 4, q.y + 2, 24 * k1 + 10, 9, 0.4, 0.42); g.fillStyle = "#fff2a8"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
      g.strokeStyle = "rgba(255,250,220,0.9)"; g.lineWidth = 2.4; g.lineCap = "round";
      for (let i = 0; i < 5; i++) { const a = -2.6 + i * 0.5, r0 = 30 + 20 * (1 - k1); g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * (r0 + 12), q.y + Math.sin(a) * (r0 + 12)); g.stroke(); }
      g.restore();
    }
    const k2 = campana(t, T.bonk - 0.01, T.bonk + 0.24);
    if (k2 > 0.01) {
      const q = bordeLampara(anguloLampara(T.bonk));
      g.save(); g.globalAlpha = k2; estrella(g, q.x + 2, q.y + 6, 26 * k2 + 8, 8, 0.2, 0.45); g.fillStyle = "#fff6c8"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke(); g.restore();
    }
    // estrellitas dando vueltas alrededor de la cabeza
    const ks = tramo(t, T.bonk + 0.05, T.bonk + 0.3) * (1 - tramo(t, T.ve + 0.2, T.decide)) + tramo(t, T.asoma1 - 0.2, T.asoma1) * (1 - tramo(t, T.pulgar + 0.3, T.guinoG + 0.3));
    if (ks > 0.01 && (t < T.bordeG || t > T.asoma0)) {
      const cc = G.aPantalla(pg, G.cabeza(pg).a(P(760, 250)));
      g.save(); g.globalAlpha = ks;
      for (let i = 0; i < 4; i++) { const a = t * 6 + i * TAU / 4; estrella(g, cc.x + Math.cos(a) * 34, cc.y + Math.sin(a) * 9 - 6, 7, 5, t * 4 + i); g.fillStyle = "#ffe066"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke(); }
      g.restore();
    }
  }
  // la bombilla de la idea encima de la cabeza
  function bombillaIdea(g, t, pg) {
    const k = tramo(t, T.idea, T.idea + 0.12, salida) * (1 - tramo(t, T.saca0 + 0.1, T.saca1 + 0.1));
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
  // ¡pum!: polvareda que sube por delante del escenario
  function pum(g, t) {
    const u = t - T.pum; if (u < 0 || u > 1.0) return;
    const k = campana(t, T.pum, T.pum + 0.3);
    if (k > 0.01) { g.save(); g.globalAlpha = k; estrella(g, XG_CAE + 40, H - 8, 40 * k + 18, 9, 0.2, 0.5); g.fillStyle = "#fff2b0"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 3; g.stroke(); g.restore(); }
    g.save();
    for (let i = 0; i < 12; i++) {
      const a = -Math.PI / 2 + (hash(i + 3) - 0.5) * 2.2, v = 70 + 90 * hash(i + 6), uu = clamp(u / 1.0);
      const px = XG_CAE + 40 + Math.cos(a) * v * Math.sqrt(uu) * 1.3, py = H + 10 + Math.sin(a) * v * Math.sqrt(uu) * 0.9;
      g.globalAlpha = 0.5 * (1 - uu); g.fillStyle = "#c9b8a8"; g.beginPath(); g.arc(px, py, (14 + 14 * hash(i + 9)) * (0.6 + uu), 0, TAU); g.fill();
    }
    g.restore();
  }
  const temblor = t => { const u = t - T.pum; if (u <= 0 || u > 0.6) return P(0, 0); const k = Math.exp(-u * 7); return P(4 * k * Math.sin(u * 61), 3 * k * Math.sin(u * 53 + 1)); };
  // rayitas al deslizarse de rodillas
  function estelaRodillas(g, t, p, R, t0, t1) {
    const k = campana(t, t0, t1); if (k < 0.02) return;
    g.save(); g.strokeStyle = `rgba(255,236,200,${0.55 * k})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = 0; i < 4; i++) { const y = p.suelo - 6 - i * 16, L = 40 + 24 * hash(i + Math.floor(t * 20)); g.beginPath(); g.moveTo(p.x - 60 - i * 8, y); g.lineTo(p.x - 60 - i * 8 - L, y); g.stroke(); }
    g.restore();
  }
  function guino(g, t, R, p, t0, punto) {
    const k = campana(t, t0 + 0.02, t0 + 0.5); if (k <= 0) return;
    const q = R.aPantalla(p, R.cabeza(p).a(punto));
    g.save(); g.globalAlpha = k; estrella(g, q.x + 14, q.y - 6, 9 * k + 3, 4, t * 2, 0.3); g.fillStyle = "#fff6c8"; g.fill(); g.restore();
  }

  // dibuja un personaje (con el giro de todo el cuerpo si lo hay)
  function dibuja(R, g, p, t) {
    if (p.giro && Math.abs(p.giro.ang) > 1e-4) { const o = p.giro.piv; g.save(); g.translate(o.x, o.y); g.rotate(p.giro.ang); g.translate(-o.x, -o.y); R.dibujar(g, p, t); g.restore(); return; }
    R.dibujar(g, p, t);
  }
  function sombra(g, p, ancho) { g.beginPath(); g.ellipse(p.x, p.suelo + 2, ancho, 6, 0, 0, TAU); g.fill(); }

  /* ---------- cámara ---------- */
  function camara(t) {
    const final = tramo(t, 12.3, 13.3, suave);
    const k = 1 + 0.07 * final;
    let f = mezcla(P(512, 300), P(600, 330), final);
    const hx = 512 / k, hy = 300 / k;
    f = P(clamp(f.x, hx, W - hx), clamp(f.y, hy, H - hy));
    return { k, f };
  }

  // ajusta el ángulo del coscorrón para que el borde de la lámpara llegue a lo alto de la cabeza
  let ajustado = false;
  function ajusta() {
    if (ajustado) return; ajustado = true;
    const pg = poseG(T.bonk - 0.02), cab = G.aPantalla(pg, G.cabeza(pg).a(P(790, 250)));
    let mejor = -0.2, err = 1e9;
    for (let th = -0.05; th > -0.43; th -= 0.002) { const q = bordeLampara(th), e = Math.hypot(q.x - cab.x, (q.y - cab.y) * 0.4); if (e < err) { err = e; mejor = th; } }
    TH_BONK = mejor; MEMO.clear();
  }

  class GuillermoParadigmaGuitarra extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !PD.listo()) return;
      if (!fondo) fondo = creaFondo();
      ajusta();
      const luz = tramo(t, NEGRO_INICIO, 0.8) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02));
      const pg = poseG(t), pp = poseP(t);
      g.save();
      const cam = camara(t), tb = temblor(t);
      g.translate(512 + tb.x, 300 + tb.y); g.scale(cam.k, cam.k); g.translate(-cam.f.x, -cam.f.y);
      g.drawImage(fondo, 0, 0);
      guirnaldas(g, t);
      bombillasBorde(g, t);
      luzLampara(g, t);
      // sombras
      g.fillStyle = "rgba(20,8,6,0.4)";
      if (t < T.bordeG) sombra(g, pg, 60 * pg.s / 0.28);
      sombra(g, pp, 66);
      const delante = t > T.bordeG - 0.05;
      if (!delante) { dibuja(G, g, pg, t); estelas(g, t, pg); parches(g, t, pg); bombillaIdea(g, t, pg); }
      estelaRodillas(g, t, pp, PD, T.rodillaP, T.para);
      dibuja(PD, g, pp, t);
      arcosCabeceo(g, t, pp);
      notas(g, t);
      estelaRodillas(g, t, pg, G, T.rodillaG, T.bordeG + 0.05);
      pum(g, t);
      if (delante) dibuja(G, g, pg, t);
      dibLampara(g, t);
      impactos(g, t, pg);
      guino(g, t, PD, pp, T.guinoP, P(780, 470));
      guino(g, t, G, pg, T.guinoG, P(770, 560));
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00101", nombre: "Guillermo y Paradigma · La guitarra invisible", crear: () => new GuillermoParadigmaGuitarra() });
  window.__A2D_00101 = { pose, T, DUR };
})();
