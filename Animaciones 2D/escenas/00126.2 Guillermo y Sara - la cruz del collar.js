"use strict";
/* 00126.2 · Guillermo y Sara · El collar
 *
 * Negro → un paseo marítimo a media tarde, con mucho sol: cielo azul con el sol arriba a la
 * izquierda, el mar lleno de chispitas de luz, un cabo lejano con casitas blancas y un velero, una
 * barandilla blanca de balaustres, una palmera, una farola, un banco, una maceta grande de barro con
 * geranios y el suelo de baldosas en ondas de colores.
 *
 * Guillermo le cuenta algo a Sara muy animado; Sara escucha sin inmutarse y cambia el peso de pie…
 * la cruz de su collar se balancea, pilla el sol y ¡ting!: un destello directo a los ojos de
 * Guillermo, que se deslumbra y da un paso atrás. Se hace visera con la mano, muy listo: Sara ladea
 * la cabeza y el destello le entra por debajo de la mano. Se agacha del todo, a salvo, y sonríe a
 * cámara: el siguiente destello le pasa por encima… y se dobla como una manguera hasta sus ojos;
 * Guillermo salta, se frota los ojos y frunce el ceño. Saca unas gafas de sol del bolsillo, las
 * abre de un golpe de muñeca y se las pone: pose triunfal, sonrisa a cámara. Sara pone los ojos en
 * blanco y aparta la cabeza con un golpe de melena… y ahora es el aro de la nariz el que lanza un
 * destello enorme a los cristales: Guillermo sale despedido y cae de culo, con las gafas torcidas.
 * Se rinde: hundido en el suelo saca un pañuelo blanco y lo ondea. Sara, que nunca se ríe, se parte
 * de risa de verdad; luego coge la cruz y se la mete por dentro del top (se esconde bajo el escote y
 * ahí se queda) y da una palmadita. Guillermo suspira aliviado y los dos miran a cámara → negro.
 *
 * Todo depende de `t` (determinista). La cruz y el aro salen del muñeco de Sara (la cruz con la
 * misma fórmula de balanceo que su collar), así los destellos nacen siempre en su sitio. Al meterla
 * en el top, la escena repinta el pecho del propio torso de Sara encima del collar del muñeco y
 * dibuja el cordón y la cruz recortados por el escote: la cruz se hunde bajo la tela de verdad.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, mezcla, hash, campana } = M2;
  const G = Guillermo, Sa = SaraSaez, R = Recortes;
  const DUR = 14.6;
  const TINTA = "#0b0a0e", TAU = Math.PI * 2;

  /* ---------- guion (s) ---------- */
  const T = {
    // charla
    habla0: 0.3, habla1: 1.22,
    // destello 1: directo
    s1: 1.05, g1: 1.36, g1Fin: 1.86, mareo: 1.92,
    // visera y destello 2 (por debajo de la mano)
    vis0: 2.2, vis1: 2.48, chulo: 2.52, s2: 2.78, g2: 2.98, g2Fin: 3.42,
    // se agacha; destello 3: pasa por encima… y se dobla
    agacha0: 3.55, agacha1: 3.95, guino: 4.02, s3: 4.28, g3: 4.5, g3Dobla: 4.8, g3Toca: 5.0, g3Fin: 5.42,
    salta: 5.02, frota0: 5.36, frota1: 5.78, ceno: 5.84,
    // las gafas de sol
    bols0: 6.0, saca: 6.26, abre0: 6.56, abre1: 6.68, pone0: 6.76, pone1: 7.12, triunfo: 7.18,
    // el aro de la nariz
    sMira: 7.42, sRoll: 7.78, toss0: 7.98, toss1: 8.26, g4: 8.24, g4Fin: 8.92, cae0: 8.3, cae1: 8.7,
    // se rinde: pañuelo blanco
    hunde0: 9.0, hunde1: 9.36, panSaca0: 9.42, panSaca1: 9.66, onda0: 9.72, onda1: 11.05,
    // Sara se ríe y esconde la cruz
    risa0: 10.3, risa1: 11.1, coge0: 11.06, coge1: 11.36, mete0: 11.42, mete1: 11.78, palma0: 11.84, palma1: 12.02,
    sBols0: 12.08, sBols1: 12.46,
    // final
    gNota: 11.1, suspiro: 12.2, camara: 12.7, cam0: 10.15, cam1: 10.85, cam2: 12.1, cam3: 12.8,
    fin: 13.9
  };

  const impacto = { uno: T.g1 + 0.07, dos: T.g2 + 0.07, tres: T.g3Toca, cuatro: T.g4 + 0.06 };
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const angDif = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const lerpAng = (a, b, k) => a + angDif(a, b) * k;
  const rota = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const DD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const ABIERTA = D(1, 1, 1, 1, 1), HABLA = D(0.85, 0.92, 0.9, 0.86, 0.8), FLOJA = D(0.45, 0.5, 0.48, 0.46, 0.44),
    PINZA_D = D(0.62, 0.55, 0.22, 0.18, 0.16), PUNO = D(0.1, 0.06, 0.06, 0.06, 0.06), RELAJA = D(0.55, 0.62, 0.56, 0.52, 0.48),
    PALMA_D = D(0.8, 0.86, 0.84, 0.82, 0.78), BOLS_D = D(0.4, 0.4, 0.4, 0.4, 0.4);
  const vib = (t, a, ph) => a * (Math.sin(t * 61 + ph * 7) * 0.6 + Math.sin(t * 43 + ph * 3) * 0.4);

  // afines de pantalla { a, b, c, d, e, f } (como setTransform)
  const AF = (a, b, c, d, e, f) => ({ a, b, c, d, e, f });
  const mul = (A, B) => AF(A.a * B.a + A.c * B.b, A.b * B.a + A.d * B.b, A.a * B.c + A.c * B.d, A.b * B.c + A.d * B.d,
    A.a * B.e + A.c * B.f + A.e, A.b * B.e + A.d * B.f + A.f);
  const apl = (A, q) => ({ x: A.a * q.x + A.c * q.y + A.e, y: A.b * q.x + A.d * q.y + A.f });
  const Tm = (x, y) => AF(1, 0, 0, 1, x, y), Rm = r => AF(Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0), Sm = (x, y) => AF(x, 0, 0, y, 0, 0);
  function desc(A) { const sy = Math.hypot(A.c, A.d), th = Math.atan2(-A.c, A.d); return { x: A.e, y: A.f, th, sy }; }
  // retrato → pantalla (Guillermo no va reflejado)
  function afCabeza(Rg, p) {
    const H = Rg.cabeza(p), o = Rg.aPantalla(p, H.a({ x: 0, y: 0 })), ex = Rg.aPantalla(p, H.a({ x: 1, y: 0 })), ey = Rg.aPantalla(p, H.a({ x: 0, y: 1 }));
    return AF(ex.x - o.x, ex.y - o.y, ey.x - o.x, ey.y - o.y, o.x, o.y);
  }
  let BASE_M = null;
  function conCamara(g, f) { g.save(); g.setTransform(BASE_M); f(); g.restore(); }

  /* ---------- caras (mismos campos para los dos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, wi: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista, d = 0.15) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* =====================================================================================
   * DISPOSICIÓN (px de pantalla, antes de la cámara)
   * ===================================================================================== */
  const S = 0.32, SUELO = 548;
  const XG = 360, XS = 668;                       // pelvis de cada uno
  const MACETA = { x: 150, y: 532 }, BANCO = { x: 870, y: 520 }, FAROLA = { x: 958, y: 528 };

  /* =====================================================================================
   * MANOS: pistas [t0, t1, objetivo, curva]; objetivo { bols } | { hoja } | { scr, ref } | { ext }
   * (mu en la hoja: hacia el codo; los dos muñecos se piensan mirando a la derecha)
   * ===================================================================================== */
  const PINZA = { x: 6.2, y: 15.5 }, PALMA = { x: 0, y: 1 }, CENTRO = { x: 0, y: 0 };
  const escMano = Rg => (Rg === Sa ? 0.86 : 1);
  const offMano = (Rg, m, q) => { const e = escMano(Rg) * (m.puno ?? 1), r = rota({ x: q.x * e, y: q.y * e }, m.mu + Math.PI / 2); return rota({ x: r.x * Rg.JK, y: r.y * Rg.JK }, m.ang || 0); };
  const ptMano = (Rg, p, m, q) => { const o = offMano(Rg, m, q); return Rg.aPantalla(p, { x: m.x + o.x, y: m.y + o.y }); };
  const R_M = Rg => Rg.MUNECA_R * Rg.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M(G), y: m.y - Math.sin(mu) * R_M(G) });
  const BOLS_G = { cerca: punoDesde({ x: 131, y: 652 }, -1.75), lejos: punoDesde({ x: 372, y: 648 }, -1.75) };
  const DOBLA = { g: { cerca: -1, lejos: -1 }, s: { cerca: -1, lejos: 1 } };
  function resolutor(Rg, p, lado) {
    const Tr = Rg.tronco(p), dob = DOBLA[Rg === G ? "g" : "s"][lado];
    return o => {
      if (o.bols) {
        const B = Rg === G ? Tr(BOLS_G[lado]) : Rg.manoReposo(p, lado);
        return { x: B.x, y: B.y + (o.hondo || 0), mu: -1.75, ang: 0, puno: o.sale ? 1 : 0, dedos: o.dedos || BOLS_D, dobla: o.dobla ?? dob };
      }
      if (o.ext !== undefined) {
        // brazo estirado del todo hacia o.ext (ángulo de la hoja): aquí el codo puede cambiar de lado sin saltar
        const h = Tr(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO), L = (lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L) * 1.0;
        const w = { x: h.x + Math.cos(o.ext) * L, y: h.y + Math.sin(o.ext) * L };
        return { x: w.x + Math.cos(o.ext) * R_M(Rg), y: w.y + Math.sin(o.ext) * R_M(Rg), mu: o.ext - Math.PI, ang: 0, puno: 1, dedos: o.dedos || FLOJA, dobla: o.dobla ?? dob };
      }
      const m = { mu: o.mu, ang: o.ang || 0 };
      let q;
      if (o.hoja) q = Tr(o.hoja);
      else { const sc = typeof o.scr === "function" ? o.scr() : o.scr, h = Rg.aHoja(p, sc), f = offMano(Rg, m, o.ref || PALMA); q = { x: h.x - f.x, y: h.y - f.y }; }
      return { x: q.x, y: q.y, mu: o.mu, ang: m.ang, puno: o.puno ?? 1, dedos: o.dedos || FLOJA, dobla: o.dobla ?? dob };
    };
  }
  function pista(lista, t, resuelve) {
    let c = resuelve(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)), d = resuelve(obj);
      c = { x: lerp(c.x, d.x, k), y: lerp(c.y, d.y, k), mu: lerpAng(c.mu, d.mu, k), ang: lerp(c.ang, d.ang, k), puno: lerp(c.puno, d.puno, k),
        dedos: DD(c.dedos, d.dedos, k), dobla: k < 0.5 ? c.dobla : d.dobla };
    }
    return c;
  }
  // la mano no puede ir más lejos de lo que da el brazo
  function alcanza(Rg, p, m, lado, k = 1.04) {
    const h = Rg.tronco(p)(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO), L = (lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L) * k;
    const o = rota({ x: Math.cos(m.mu) * R_M(Rg), y: Math.sin(m.mu) * R_M(Rg) }, m.ang || 0);
    const dx = m.x + o.x - h.x, dy = m.y + o.y - h.y, d = Math.hypot(dx, dy);
    if (d > L) { const f = L / d; m.x = h.x + dx * f - o.x; m.y = h.y + dy * f - o.y; }
    return m;
  }
  const manoDe = m => ({ x: m.x, y: m.y, ang: m.ang, mu: m.mu, dobla: m.dobla, puno: m.puno, dedos: m.dedos });

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha)
   * ===================================================================================== */
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const OJOS_G = { x: 832, y: 590 };                       // entre los dos ojos (retrato)
  const VISERA = { x: 970, y: 575 };                       // la palma, sobre las cejas (retrato)
  const CARAS_G = {
    inicio: E({ mx: 0.88, my: 0.05, sd: 10, si: 12, sonr: 0.45, ancho: 0.95 }),
    habla: E({ mx: 0.9, my: 0.0, sd: 18, gd: 0.04, si: 20, gi: 0.04, sonr: 0.55, ancho: 1.0 }),
    deslumbra: E({ mx: 0.9, c: 1, z: 1, sd: -8, gd: -0.06, si: -8, gi: -0.06, abre: 10, ancho: 0.62, sonr: -0.35 }),
    mareo: E({ mx: 0.2, my: 0.1, c: 0.25, esp: 0.85, sd: 14, gd: 0.15, si: 16, gi: 0.15, abre: 6, ancho: 0.7, sonr: -0.2 }),
    chulo: E({ mx: 0.85, my: 0.15, c: 0.38, sd: -2, gd: -0.1, si: 6, gi: -0.04, abre: 0, ancho: 1.05, sonr: 0.75 }),
    agachado: E({ mx: -0.85, my: -0.1, c: 0.3, h: 0.4, sd: 14, gd: 0.04, si: 18, gi: 0.06, abre: 12, ancho: 1.1, sonr: 1.0 }),
    burla: E({ mx: 0.7, my: -0.6, c: 0.28, h: 0.35, sd: 16, si: 20, abre: 10, ancho: 1.08, sonr: 0.95 }),
    ceno: E({ mx: 0.9, my: 0.1, c: 0.32, sd: -12, gd: -0.22, si: -10, gi: -0.2, abre: 0, ancho: 0.7, sonr: -0.35, mof: 0.2 }),
    busca: E({ mx: 0.6, my: 0.7, c: 0.2, sd: -6, gd: -0.12, si: -4, gi: -0.1, abre: 0, ancho: 0.8, sonr: 0.1 }),
    triunfo: E({ mx: -0.85, my: 0, c: 0.2, sd: 20, gd: 0.04, si: 22, gi: 0.04, abre: 16, ancho: 1.15, sonr: 1.0 }),
    golpe: E({ mx: 0.9, c: 1, z: 1, sd: 24, gd: 0.2, si: 24, gi: 0.2, abre: 30, ancho: 0.7, sonr: -0.4 }),
    sentado: E({ mx: 0.3, my: 0.2, c: 0.3, esp: 0.9, sd: 18, gd: 0.2, si: 20, gi: 0.2, abre: 8, ancho: 0.62, sonr: -0.25 }),
    rendido: E({ mx: 0.6, my: 0.75, c: 0.45, sd: 22, gd: 0.26, si: 24, gi: 0.26, abre: 0, ancho: 0.7, sonr: -0.6 }),
    nota: E({ mx: 0.9, my: -0.25, c: 0.1, iris: 1.1, sd: 26, gd: 0.1, si: 28, gi: 0.1, abre: 10, ancho: 0.62, sonr: 0.0 }),
    alivio: E({ mx: 0.9, my: -0.2, c: 0.55, sd: 16, gd: 0.12, si: 18, gi: 0.12, abre: 12, ancho: 0.62, sonr: 0.2 }),
    camara: E({ mx: -0.85, my: 0, c: 0.25, h: 0.25, sd: 18, gd: 0.06, si: 20, gi: 0.06, abre: 14, ancho: 1.1, sonr: 1.0 })
  };
  const GUION_CARA_G = [
    [T.habla0, T.habla0 + 0.15, "habla"], [impacto.uno, impacto.uno + 0.06, "deslumbra", salida], [T.mareo, T.mareo + 0.12, "mareo"],
    [T.vis0, T.vis0 + 0.2, "busca"], [T.chulo, T.chulo + 0.18, "chulo"], [impacto.dos, impacto.dos + 0.06, "deslumbra", salida],
    [T.agacha0, T.agacha0 + 0.25, "busca"], [T.guino, T.guino + 0.2, "agachado"], [T.g3 + 0.08, T.g3 + 0.28, "burla"],
    [T.g3Toca, T.g3Toca + 0.05, "deslumbra", salida], [T.ceno, T.ceno + 0.2, "ceno"], [T.bols0 + 0.1, T.bols0 + 0.3, "busca"],
    [T.pone1 - 0.1, T.pone1 + 0.1, "chulo"], [T.triunfo, T.triunfo + 0.2, "triunfo"],
    [impacto.cuatro, impacto.cuatro + 0.06, "golpe", salida], [T.cae1, T.cae1 + 0.2, "sentado"], [T.hunde0, T.hunde1, "rendido"],
    [T.gNota, T.gNota + 0.15, "nota", salida], [T.mete1, T.mete1 + 0.25, "alivio"], [T.camara, T.camara + 0.25, "camara"]
  ];
  // cuerpo: pel (hoja, + = abajo), torso, cab, px (hoja, desplaza la pelvis)
  const CUERPOS_G = {
    inicio: { pel: 0, torso: 0.03, cab: 0.03, px: 0 },
    habla: { pel: 0, torso: 0.06, cab: 0.05, px: 0 },
    deslumbra: { pel: -6, torso: -0.12, cab: -0.24, px: -10 },
    mareo: { pel: 0, torso: -0.03, cab: 0.02, px: 0 },
    visera: { pel: 0, torso: 0.02, cab: -0.02, px: 0 },
    chulo: { pel: -4, torso: -0.05, cab: -0.07, px: 0 },
    agachado: { pel: 300, torso: 0.3, cab: -0.16, px: -60 },
    salta: { pel: -60, torso: -0.16, cab: -0.26, px: -8 },
    frota: { pel: 6, torso: 0.1, cab: 0.14, px: 0 },
    ceno: { pel: 0, torso: 0.07, cab: 0.06, px: 0 },
    busca: { pel: 8, torso: 0.12, cab: 0.16, px: 0 },
    triunfo: { pel: -8, torso: -0.08, cab: -0.1, px: 0 },
    sentado: { pel: 560, torso: -0.22, cab: -0.08, px: -40 },
    hundido: { pel: 560, torso: 0.22, cab: 0.2, px: -40 },
    onda: { pel: 560, torso: 0.12, cab: 0.06, px: -40 },
    nota: { pel: 560, torso: 0.04, cab: -0.08, px: -40 },
    final: { pel: 560, torso: 0.0, cab: -0.04, px: -40 }
  };
  const GUION_CUERPO_G = [
    [T.habla0, T.habla0 + 0.3, "habla"], [impacto.uno, impacto.uno + 0.12, "deslumbra", salida], [T.mareo, T.mareo + 0.3, "mareo"],
    [T.vis0, T.vis1, "visera"], [T.chulo, T.chulo + 0.2, "chulo"], [impacto.dos, impacto.dos + 0.1, "deslumbra", salida],
    [T.g2Fin - 0.1, T.agacha0, "visera"], [T.agacha0, T.agacha1, "agachado"],
    [T.salta, T.salta + 0.2, "salta", salida], [T.salta + 0.22, T.frota0 + 0.1, "frota"], [T.ceno, T.ceno + 0.2, "ceno"],
    [T.bols0, T.saca, "busca"], [T.pone1 - 0.05, T.triunfo + 0.15, "triunfo"],
    [T.cae0, T.cae1, "sentado", entrada], [T.hunde0, T.hunde1, "hundido"], [T.onda0 - 0.1, T.onda0 + 0.3, "onda"],
    [T.gNota, T.gNota + 0.3, "nota"], [T.suspiro, T.suspiro + 0.4, "final"]
  ];
  // posición del cuerpo (pantalla)
  function xG(t) {
    let x = XG;
    x = lerp(x, 340, tramo(t, T.g1 + 0.05, T.g1 + 0.42));
    x = lerp(x, 322, tramo(t, T.salta + 0.06, T.salta + 0.42));
    x = lerp(x, 346, tramo(t, T.ceno - 0.08, T.ceno + 0.32));
    x = lerp(x, 314, tramo(t, T.cae0, T.cae1));
    return x;
  }
  // pies (pantalla): [t0, t1, x, alto del paso]
  const PIES_G = {
    cerca: [[0, 0, XG - 28, 0], [T.g1 + 0.05, T.g1 + 0.22, 312, 12], [T.salta + 0.06, T.salta + 0.24, 294, 0],
      [T.ceno - 0.08, T.ceno + 0.1, 318, 10], [T.cae0, T.cae0 + 0.3, 410, 46]],
    lejos: [[0, 0, XG + 29, 0], [T.g1 + 0.18, T.g1 + 0.4, 369, 10], [T.salta + 0.2, T.salta + 0.4, 351, 0],
      [T.ceno + 0.08, T.ceno + 0.3, 375, 10], [T.cae0 + 0.02, T.cae0 + 0.32, 424, 54]]
  };
  function pieG(t, lista) {
    let x = lista[0][2], lev = 0;
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, x1, alto] = lista[i]; if (t <= t0) break;
      const k = tramo(t, t0, t1); x = lerp(x, x1, k); lev = Math.max(lev, alto * campana(t, t0, t1));
    }
    return { x, lev };
  }
  // Punto inferior del vaquero en el recorte. El rebote se mide respecto al suelo.
  const asientoG = p => G.aPantalla(p, G.tronco(p)({ x: 250, y: 768 }));
  function reboteG(t) {
    const u = t - T.cae1;
    return u > 0 && u < 0.54 ? 7.5 * Math.exp(-u*7) * Math.abs(Math.sin(u*15)) * (1-tramo(u,0.44,0.54)) : 0;
  }
  function vueloG(t) {
    const k = fase(t,T.salta + 0.035,T.salta + 0.405);
    return 24 * 4*k*(1-k);
  }
  // Extremo inferior de la mano abierta, con la tinta redondeada de los dedos.
  function sueloMano(mu) {
    let punta;
    for (const [x,l,abanico] of [[6.9,14.5,0.17],[2.3,16,0.05],[-2.3,15,-0.07],[-6.7,12,-0.2]]) {
      const a=abanico*1.3, q={x:x+Math.sin(a)*l, y:4.5+Math.cos(a)*l};
      const y=rota(q,mu+Math.PI/2).y;
      if (!punta||y>punta.y) punta={q,y};
    }
    // El borde redondo añade 4,55 unidades en la dirección vertical del plano.
    const margen=rota({x:0,y:4.55},-mu-Math.PI/2);
    return {x:punta.q.x+margen.x, y:punta.q.y+margen.y};
  }
  const sentado = t => tramo(t, T.cae0 + 0.1, T.cae1);

  const cacheG = new Map();
  function poseG(t) {
    const k0 = t;
    if (cacheG.has(k0)) return cacheG.get(k0);
    if (cacheG.size > 12) cacheG.clear();
    const p = poseG0(t); cacheG.set(k0, p); return p;
  }
  function poseG0(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const x = xG(t), si = sentado(t);
    const respira = Math.sin(t * 2.3 + 0.4);
    const p = {
      x, suelo: SUELO, s: S, tirasLimpias: true, ikContinuo: false, hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x + b.px, y: G.PELVIS.y + b.pel + respira * 1.2 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.005 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // hablando: la cabeza acompaña
    const hb = dentro(t, T.habla0, T.habla0 + 0.15, T.habla1, T.habla1 + 0.1);
    p.cabeza.ang += 0.035 * Math.sin(t * 7.3) * hb; p.torso += 0.012 * Math.sin(t * 5.1) * hb;
    // aterriza de culo: rebote
    const u = t - T.cae1;
    if (u > 0 && u < 0.6) { p.cabeza.ang += 0.08 * Math.exp(-u * 6) * Math.sin(u * 17); }
    // el golpe del aro: la cabeza da un latigazo atrás
    p.cabeza.ang -= 0.22 * campana(t, impacto.cuatro, impacto.cuatro + 0.3);
    // se frota los ojos: cabeza que tiembla
    const fr = dentro(t, T.frota0, T.frota0 + 0.08, T.frota1 - 0.08, T.frota1);
    p.cabeza.ang += 0.03 * Math.sin(t * 23) * fr;
    // ondea el pañuelo: el cuerpo acompaña
    const on = dentro(t, T.onda0, T.onda0 + 0.2, T.onda1 - 0.2, T.onda1);
    p.torso += 0.03 * Math.sin((t - T.onda0) * 9) * on;
    // suspiro final: hombros que bajan
    const su = campana(t, T.suspiro, T.suspiro + 0.5);
    p.torsoEsc.y += 0.02 * su; p.pelvis.y += 6 * su;
    if (si > 0) p.pelvis.y += si * (SUELO - reboteG(t) - asientoG(p).y) / S;
    const vuelo = vueloG(t);
    // pies
    const fc = pieG(t, PIES_G.cerca), fl = pieG(t, PIES_G.lejos);
    const hojaX = wx => G.PELVIS.x + (wx - x) / S;
    // de culo: las piernas por delante con las rodillas arriba (el tobillo un poco más alto al caer)
    p.piernas.cerca = { tob: { x: hojaX(fc.x), y: TOB_G - (fc.lev + vuelo) / S }, ang: -0.1 * si };
    p.piernas.lejos = { tob: { x: hojaX(fl.x), y: TOB_G - 8 * si - (fl.lev + vuelo) / S }, ang: -0.14 * si };
    // cara
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    if (hb > 0) { ex.abre += (6 + 9 * Math.abs(Math.sin(t * 13.5))) * hb; ex.ancho += 0.05 * Math.sin(t * 9) * hb; }
    // ¡pfff! al soplar aliviado
    ex.abre += 8 * su; ex.ancho -= 0.25 * su;
    p.cara = cara(ex, parpadeo(t, [0.9, 2.12, 4.24, 6.5, 9.6, 11.6, 13.2]));
    p.sudor = 0.7 * dentro(t, T.ceno, T.ceno + 0.2, T.saca, T.saca + 0.3) + 0.8 * dentro(t, T.hunde0, T.hunde1, T.suspiro, T.suspiro + 0.6);
    p.enfado = 0.85 * dentro(t, T.ceno, T.ceno + 0.15, T.saca, T.saca + 0.2);
    p.rojo = 0.35 * dentro(t, T.ceno, T.ceno + 0.2, T.saca, T.saca + 0.3);
    manosG(p, t);
    p.capaCabeza = (g, tt) => capaCabezaG(g, tt, p);
    return p;
  }

  function manosG(p, t) {
    const res = resolutor(G, p, "cerca"), resL = resolutor(G, p, "lejos");
    const W_ = (dx, dy, fn) => () => { const o = { x: p.x + dx, y: SUELO + dy }; if (fn) { const d = fn(); o.x += d.x; o.y += d.y; } return o; };
    const enCara = q => () => G.aPantalla(p, G.cabeza(p).a(q));
    /* ----- mano lejana: habla, visera, se frota los ojos, en la rodilla ----- */
    const gesto = () => ({ x: 6 * Math.sin(t * 6.1), y: 9 * Math.sin(t * 8.4 + 1) });
    const PL = [
      [0, 0, { bols: true }],
      [T.habla0 - 0.1, T.habla0, { bols: true, sale: true, dedos: HABLA }],
      [T.habla0, T.habla0 + 0.3, { scr: W_(92, -268, gesto), ref: PALMA, mu: 2.5, dedos: HABLA }],
      // susto: la mano salta abierta
      [impacto.uno, impacto.uno + 0.1, { scr: W_(104, -318), ref: PALMA, mu: 2.2, dedos: ABIERTA }, salida],
      [T.mareo, T.vis0, { scr: W_(84, -236), ref: PALMA, mu: 2.6, dedos: FLOJA }],
      // visera
      [T.vis0, T.vis1, { scr: enCara(VISERA), ref: PALMA, mu: 1.75, dedos: ABIERTA }, salida],
      // salta: la mano vuela; luego se frota los ojos
      [T.salta, T.salta + 0.16, { scr: W_(118, -372), ref: PALMA, mu: 2.0, dedos: ABIERTA }, salida],
      [T.frota0 - 0.06, T.frota0 + 0.1, { scr: () => { const q = enCara({ x: 820, y: 600 })(); return { x: q.x + 3 * Math.sin(t * 24), y: q.y + 2 * Math.cos(t * 24) }; }, ref: PALMA, mu: 1.95, dedos: PUNO }],
      [T.frota1, T.ceno + 0.2, { bols: true, sale: true, dedos: PUNO }],
      [T.ceno + 0.2, T.ceno + 0.24, { bols: true }],
      // cae: los brazos al aire, luego la mano en la rodilla
      [T.cae0, T.cae0 + 0.16, { bols: true, sale: true, dedos: ABIERTA }],
      [T.cae0 + 0.12, T.cae0 + 0.3, { scr: W_(70, -350), ref: PALMA, mu: 1.9, dedos: ABIERTA }, salida],
      [T.cae1 - 0.05, T.cae1 + 0.25, { scr: W_(78, -96), ref: PALMA, mu: 2.4, dedos: RELAJA }],
      [T.gNota, T.gNota + 0.2, { scr: W_(84, -98), ref: PALMA, mu: 2.4, dedos: RELAJA }]
    ];
    const L = pista(PL, t, resL);
    // en la visera, la mano tiembla con cada destello
    const sus = campana(t, impacto.dos, impacto.dos + 0.35) + campana(t, impacto.uno, impacto.uno + 0.3);
    L.x += vib(t, 4 * sus, 0.3); L.y += vib(t, 4 * sus, 1.7);
    alcanza(G, p, L, "lejos");
    /* ----- mano cercana: bolsillo, gafas, se cae, pañuelo ----- */
    const gf = gafasG0(t, p);
    const PC = [
      [0, 0, { bols: true }],
      // rebusca en el bolsillo y saca las gafas
      [T.bols0, T.bols0 + 0.24, { bols: true, hondo: 24 }],
      [T.saca - 0.04, T.saca, { bols: true, hondo: 8, sale: true, dedos: PINZA_D }],
      // las saca de un tirón con el brazo estirado hacia delante y las abre de un golpe de muñeca
      // (con el brazo estirado del todo el codo cambia de lado sin saltar)
      [T.saca, T.saca + 0.1, { ext: Math.PI / 2 + 0.12, dedos: PINZA_D, dobla: -1 }],
      [T.saca + 0.1, T.abre0, { ext: 0.5, dedos: PINZA_D, dobla: -1 }, salida],
      [T.abre0, T.abre1, { ext: 0.42, dedos: PINZA_D, dobla: -1 }, salida],
      [T.abre1, T.abre1 + 0.01, { ext: 0.42, dedos: PINZA_D, dobla: 1 }],
      // se las pone (la mano sigue a la patilla)
      [T.pone0, T.pone1, { scr: () => gf.agarre, ref: PINZA, mu: 2.2, dedos: PINZA_D, dobla: 1 }],
      [T.pone1, T.triunfo + 0.1, { scr: () => gf.agarre, ref: PINZA, mu: 2.2, dedos: PINZA_D, dobla: 1 }],
      [T.triunfo + 0.12, T.triunfo + 0.42, { scr: W_(-24, -166), ref: PALMA, mu: -1.9, dedos: RELAJA, dobla: 1 }],
      // ¡zas!: brazos al aire y la mano al suelo, detrás
      [T.cae0, T.cae0 + 0.2, { scr: W_(-119, -366), ref: PALMA, mu: 1.4, dedos: ABIERTA, dobla: 1 }, salida],
      [T.cae1 - 0.12, T.cae1 + 0.08, { scr: W_(-43, 0), ref: sueloMano(-1.4), mu: -1.4, dedos: ABIERTA, dobla: 1 }],
      // pañuelo blanco: del bolsillo, arriba, y lo ondea
      [T.panSaca0, T.panSaca0 + 0.18, { bols: true, hondo: 10, dedos: PINZA_D, dobla: 1 }],
      [T.panSaca1 - 0.04, T.panSaca1, { bols: true, sale: true, dedos: PINZA_D, dobla: 1 }],
      [T.panSaca1, T.onda0 + 0.1, { scr: W_(-62, -264), ref: PINZA, mu: 1.25, dedos: PINZA_D, dobla: 1 }, salida],
      [T.onda0 + 0.1, T.onda1, { scr: () => { const k = Math.sin((t - T.onda0) * 9); return { x: p.x - 62 + 22 * k, y: SUELO - 266 - 6 * Math.abs(k) }; }, ref: PINZA, mu: 1.25, dedos: PINZA_D, dobla: 1 }, x => x],
      [T.onda1, T.onda1 + 0.35, { scr: W_(-72, -246), ref: PINZA, mu: 1.3, dedos: PINZA_D, dobla: 1 }],
      [T.suspiro + 0.1, T.suspiro + 0.6, { scr: W_(-50, -128), ref: PINZA, mu: 1.6, dedos: PINZA_D, dobla: 1 }]
    ];
    const C = pista(PC, t, res);
    const apoyo = dentro(t,T.cae1-.12,T.cae1+.08,T.panSaca0,T.panSaca0+.18);
    alcanza(G, p, C, "cerca", lerp(1.04,1.077,apoyo));
    p.manoCerca = manoDe(C); p.manoLejos = manoDe(L);
    p._gafas = gf;
  }

  /* ---------- capa de la cara de Guillermo (retrato): las gafas puestas ---------- */
  function capaCabezaG(g, t, p) {
    const gf = gafasG(t);
    if (gf && gf.capa === "cara") {
      g.save(); g.translate(CARA_G.B.x, CARA_G.B.y); g.rotate(CARA_G.th);
      const q = caidaGafas(t); g.translate(q.dx, q.dy); g.rotate(q.rot);
      dibGafas(g, NEGRAS, gf.o, destelloLentes(t));
      g.restore();
    }
  }

  /* =====================================================================================
   * GAFAS DE SOL · unidades del retrato; origen en el puente, x a lo largo de los ojos (hacia el
   * ojo lejano), y hacia abajo. persp: 1 de frente … 0,53 en la cara de tres cuartos.
   * ===================================================================================== */
  const NEGRAS = { w: 126, h: 72, gap: 40, cy: -2, patilla: 190,
    cristal: ["#3a2a6e", "#0b1230"], reflejo: "rgba(120,220,255,0.5)", reflejo2: "rgba(255,150,210,0.45)",
    montura: "#e02a38", luz: "rgba(255,214,200,0.9)", sombra: "#8c0e18", grosor: [20, 12], puente: [20, 11] };
  const WAY_PTS = [[-1, -0.92], [1, -1], [0.86, 0.84], [-0.8, 0.98]];
  function geo(E_, o) {
    const pe = o.persp ?? 1, pl = o.plegado ?? 0, ko = o.oreja ? (o.kOreja ?? 1) : 0;
    const w = E_.w, h = E_.h, wf = w * pe;
    const gap = lerp(E_.gap, 22, pl);
    const nc = { x: -(gap / 2 + w / 2), y: E_.cy }, fc = { x: gap / 2 + wf / 2, y: E_.cy };
    const hn = { x: nc.x - w * 0.5 + 5, y: E_.cy - h * 0.3 }, hf = { x: fc.x + wf * 0.5 - 4, y: E_.cy - h * 0.3 };
    const abierta = { x: hn.x - E_.patilla, y: hn.y + 30 }, plegada = { x: hn.x + w * 0.86, y: hn.y + 10 };
    let fin = mezcla(abierta, plegada, pl);
    if (ko > 0) fin = mezcla(fin, o.oreja, ko);
    const enPatilla = mezcla(hn, fin, (o.agarreK ?? 0.14) * (1 - pl) + 0.02);
    const agarre = mezcla(enPatilla, { x: nc.x - w * 0.5 - 2, y: nc.y }, pl);
    return { w, h, wf, nc, fc, hn, hf, fin, agarre, pe, pl, ko };
  }
  function rutaLente(g, c, w, h, sx) {
    g.beginPath();
    const P = WAY_PTS.map(([x, y]) => [c.x + sx * x * w / 2, c.y + y * h / 2]), r = Math.min(w, h) * 0.2;
    for (let i = 0; i < 4; i++) {
      const a = P[(i + 3) % 4], b = P[i], d = P[(i + 1) % 4];
      const ma = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], md = [(b[0] + d[0]) / 2, (b[1] + d[1]) / 2];
      if (i === 0) g.moveTo(ma[0], ma[1]);
      g.arcTo(b[0], b[1], md[0], md[1], r);
    }
    g.closePath();
  }
  function patilla(g, E_, a, b, alfa) {
    if (alfa <= 0.01) return;
    g.save(); g.globalAlpha *= alfa; g.lineCap = "round";
    const c = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - 8 };
    const ruta = () => { g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo(c.x, c.y, b.x, b.y); };
    ruta(); g.lineWidth = 17; g.strokeStyle = TINTA; g.stroke();
    ruta(); g.lineWidth = 9.5; g.strokeStyle = E_.montura; g.stroke();
    ruta(); g.lineWidth = 2.4; g.strokeStyle = "rgba(255,255,255,0.35)"; g.stroke();
    g.restore();
  }
  function lente(g, E_, c, w, h, sx, flash) {
    rutaLente(g, c, w, h, sx);
    const gr = g.createLinearGradient(0, c.y - h / 2, 0, c.y + h / 2);
    gr.addColorStop(0, E_.cristal[0]); gr.addColorStop(1, E_.cristal[1]);
    g.fillStyle = gr; g.fill();
    g.save(); rutaLente(g, c, w, h, sx); g.clip();
    g.fillStyle = E_.reflejo; g.beginPath(); g.ellipse(c.x - sx * w * 0.08, c.y - h * 0.42, w * 0.62, h * 0.3, 0, 0, TAU); g.fill();
    g.fillStyle = E_.reflejo2; g.beginPath(); g.ellipse(c.x + sx * w * 0.12, c.y + h * 0.5, w * 0.6, h * 0.16, 0, 0, TAU); g.fill();
    g.fillStyle = "rgba(255,255,255,0.3)";
    g.beginPath(); g.moveTo(c.x - w * 0.28, c.y - h * 0.6); g.lineTo(c.x - w * 0.06, c.y - h * 0.6); g.lineTo(c.x - w * 0.36, c.y + h * 0.6); g.lineTo(c.x - w * 0.58, c.y + h * 0.6); g.closePath(); g.fill();
    if (flash > 0.01) { g.fillStyle = `rgba(255,253,236,${0.95 * flash})`; g.fillRect(c.x - w, c.y - h, w * 2, h * 2); }
    g.restore();
    rutaLente(g, c, w, h, sx); g.lineWidth = E_.grosor[0]; g.strokeStyle = TINTA; g.stroke();
    rutaLente(g, c, w, h, sx); g.lineWidth = E_.grosor[1]; g.strokeStyle = E_.montura; g.stroke();
    // barra gruesa de arriba (wayfarer) con su brillo
    const bi = { x: c.x + sx * w * 0.5, y: c.y - h * 0.5 }, bo = { x: c.x - sx * w * 0.5, y: c.y - h * 0.46 };
    const ala = { x: c.x - sx * w * 0.66, y: c.y - h * 0.86 };
    const barra = () => { g.beginPath(); g.moveTo(bi.x, bi.y - 13); g.lineTo(bo.x, bo.y - 14);
      g.quadraticCurveTo(bo.x - sx * w * 0.1, bo.y - 16, ala.x, ala.y);
      g.quadraticCurveTo(bo.x - sx * w * 0.06, bo.y + 4, bo.x + sx * 4, bo.y + 14); g.lineTo(bi.x, bi.y + 13); g.closePath(); };
    barra(); g.fillStyle = E_.montura; g.fill(); g.lineWidth = 5; g.strokeStyle = TINTA; g.stroke();
    g.beginPath(); g.moveTo(bi.x - sx * 10, bi.y - 5); g.lineTo(bo.x + sx * 2, bo.y - 6); g.quadraticCurveTo(bo.x - sx * w * 0.08, bo.y - 9, ala.x + sx * 9, ala.y + 8);
    g.lineWidth = 3.5; g.strokeStyle = E_.luz; g.stroke();
  }
  function dibGafas(g, E_, o, flash = 0) {
    const q = geo(E_, o);
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const finL = mezcla({ x: q.hf.x - E_.patilla * 0.5, y: q.hf.y + 16 }, { x: q.hf.x - q.wf * 0.86, y: q.hf.y + 10 }, q.pl);
    patilla(g, E_, q.hf, finL, 1 - q.ko);
    patilla(g, E_, q.hn, q.fin, 1);
    lente(g, E_, q.fc, q.wf, q.h * 0.97, -1, flash);
    lente(g, E_, q.nc, q.w, q.h, 1, flash);
    const a = { x: q.nc.x + q.w * 0.47, y: E_.cy - q.h * 0.22 }, b = { x: q.fc.x - q.wf * 0.47, y: E_.cy - q.h * 0.22 };
    const pr = () => { g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo((a.x + b.x) / 2, a.y - 6, b.x, b.y); };
    pr(); g.lineWidth = E_.puente[0]; g.strokeStyle = TINTA; g.stroke(); pr(); g.lineWidth = E_.puente[1]; g.strokeStyle = E_.montura; g.stroke();
    g.fillStyle = "#9a96a2"; g.strokeStyle = TINTA; g.lineWidth = 2.5;
    for (const hp of [{ x: q.nc.x - q.w * 0.5 + 3, y: E_.cy - q.h * 0.3 }, { x: q.fc.x + q.wf * 0.5 - 3, y: E_.cy - q.h * 0.3 }]) {
      g.beginPath(); g.ellipse(hp.x, hp.y, 6, 6, 0, 0, TAU); g.fill(); g.stroke();
    }
    g.restore();
  }
  // dónde van en la cara de Guillermo: puente (retrato), ángulo de la línea de los ojos y la oreja (local)
  const CARA_G = { B: { x: 850, y: 598 }, th: 0.36, oreja: { x: -262, y: 34 }, persp: 0.53 };
  const caraAF = (p, q) => mul(afCabeza(G, p), mul(mul(Tm(CARA_G.B.x, CARA_G.B.y), Rm(CARA_G.th)), mul(Tm(q.dx || 0, q.dy || 0), Rm(q.rot || 0))));
  function manoAF(c, phi, sc, agarre) { return mul(mul(Tm(c.x, c.y), Rm(phi)), mul(Sm(sc, sc), Tm(-agarre.x, -agarre.y))); }
  // tras el golpe del aro: resbalan nariz abajo y se tuercen (y así se quedan)
  function caidaGafas(t) {
    const k = tramo(t, impacto.cuatro, impacto.cuatro + 0.28, salida), u = t - (impacto.cuatro + 0.28);
    const rb = u > 0 ? Math.exp(-u * 6) * Math.sin(u * 16) : 0;
    return { dx: -10 * k, dy: 62 * k + 6 * rb, rot: -0.3 * k - 0.05 * rb };
  }
  const destelloLentes = t => campana(t, impacto.cuatro, impacto.cuatro + 0.36) + 0.45 * campana(t, T.triunfo + 0.02, T.triunfo + 0.36);
  // las gafas en cada momento: { A (afín de pantalla), o, capa, agarre (pantalla) }
  function gafasG0(t, p) {
    if (t < T.saca) return null;
    const AfC = caraAF(p, {}), dc = desc(AfC), sc0 = dc.sy;
    if (t >= T.pone1) {
      const o = { persp: CARA_G.persp, oreja: CARA_G.oreja, kOreja: 1, agarreK: 0.42 };
      const A = caraAF(p, caidaGafas(t));
      return { A, o, capa: "cara", agarre: apl(A, geo(NEGRAS, o).agarre) };
    }
    const k = tramo(t, T.pone0, T.pone1);
    const o = { persp: lerp(1, CARA_G.persp, k), plegado: 1 - tramo(t, T.abre0, T.abre1, salida), oreja: CARA_G.oreja,
      kOreja: tramo(t, T.pone0 + 0.14, T.pone1), agarreK: lerp(0.14, 0.42, k) };
    const agC = apl(AfC, geo(NEGRAS, o).agarre);
    return { A: null, o, capa: "mano", agarre: agC, k, sc0, dc };
  }
  // con la mano ya colocada (se llama al dibujar)
  function gafasG(t) {
    const p = poseG(t), gf = p._gafas;
    if (!gf || gf.capa === "cara") return gf;
    const c = ptMano(G, p, p.manoCerca, PINZA);
    const sale = tramo(t, T.saca, T.saca + 0.22);
    const phiM = lerp(1.1, -0.25, tramo(t, T.saca + 0.05, T.abre0)) + 0.45 * Math.sin((t - T.abre0) * 34) * campana(t, T.abre0 - 0.02, T.abre1 + 0.04);
    const phi = lerpAng(phiM, gf.dc.th, gf.k), sc = lerp(gf.sc0, gf.dc.sy, gf.k);
    const q = geo(NEGRAS,gf.o), A = manoAF(c, phi, sc, q.agarre);
    return Object.assign({}, gf, { A, agarre: c, sale });
  }
  function pintaGafasMano(g, t) {
    const gf = gafasG(t);
    if (!gf || gf.capa !== "mano") return;
    if (gf.sale <= 0) return;
    conCamara(g, () => {
      g.transform(gf.A.a,gf.A.b,gf.A.c,gf.A.d,gf.A.e,gf.A.f);
      if (gf.sale < 1) {
        const pinza=geo(NEGRAS,gf.o).agarre, x=pinza.x-12;
        g.beginPath(); g.rect(x-50*gf.sale, -120, 420*gf.sale, 240); g.clip();
      }
      dibGafas(g,NEGRAS,gf.o,0);
    });
  }

  /* ---------- el pañuelo blanco (pantalla), cogido por una esquina ---------- */
  const esquinaPanuelo = p => ptMano(G,p,p.manoCerca,PINZA);
  function puntosPanuelo(t, p) {
    const c = esquinaPanuelo(p);
    const sale = tramo(t, T.panSaca1 - 0.04, T.panSaca1 + 0.2);
    const on = dentro(t, T.onda0, T.onda0 + 0.2, T.onda1 - 0.1, T.onda1 + 0.2);
    const vel = Math.cos((t - T.onda0) * 9) * on;            // va y viene con la mano
    // dirección en la que cuelga / ondea: colgando al principio, al viento (arriba-atrás) al ondear
    const w = Math.max(on, 0.5 * dentro(t, T.panSaca1, T.onda0, T.onda1, T.onda1 + 0.3));
    const ang = lerpAng(1.75, lerp(-1.75, -2.2, 0.5 + 0.5 * vel), w);         // vuelve a colgar por fuera (no le tapa la cara)
    const L = 56 * sale, Wd = 48 * sale;
    const u = { x: Math.cos(ang), y: Math.sin(ang) }, n = { x: -u.y, y: u.x };
    const ond = (s, k) => s * sale * 3.2 * Math.sin(t * 15 - s * 5 + k) * (0.5 + 0.7 * on);
    const punto = (s,f) => {
      const v = f*Wd*(0.72+0.28*s) + ond(s,1.4*f), largo=L*s-f*sale*(12-3*s);
      return { x:c.x+u.x*largo+n.x*v, y:c.y+u.y*largo+n.y*v };
    };
    const P=[];
    for (let i=0;i<=8;i++) P.push(punto(i/8,0));
    for (let i=8;i>=0;i--) P.push(punto(i/8,1));
    return { P,punto,sale };
  }
  function panuelo(g,t,p) {
    if (t <= T.panSaca1-0.04) return;
    const {P,punto,sale}=puntosPanuelo(t,p);
    if (sale < 0.003) return;
    g.save(); g.lineJoin="round"; g.beginPath();
    P.forEach((q, i) => (i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y))); g.closePath();
    g.fillStyle = "#fbfaf6"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke();
    // pliegues
    g.strokeStyle = "rgba(150,160,180,0.6)"; g.lineWidth = 1;
    for (const f of [0.35,0.65]) {
      g.beginPath();
      for (let i=1;i<=7;i++) { const q=punto(i/8,f); if(i===1)g.moveTo(q.x,q.y);else g.lineTo(q.x,q.y); }
      g.stroke();
    }
    g.restore();
  }

  /* =====================================================================================
   * SARA (derecha, mira a la izquierda), de pie
   * ===================================================================================== */
  const TOB_S = Sa.SUELO - Sa.TOBILLO_ALTO;
  const ARO = { x: 891, y: 474 };                           // aro de la nariz (retrato)
  const CARAS_S = {
    seria: E({ mx: 0.85, my: 0.05, c: 0.42, sd: 0, gd: 0, si: 2, gi: 0.02, abre: 0, ancho: 0.82, sonr: 0.03 }),
    mira: E({ mx: 0.8, my: 0.1, c: 0.36, sd: 2, gd: 0.02, si: 12, gi: 0.07, abre: 0, ancho: 0.8, sonr: 0.0 }),
    abajo: E({ mx: 0.75, my: 0.7, c: 0.4, sd: 4, gd: 0.02, si: 16, gi: 0.08, abre: 0, ancho: 0.78, sonr: 0.04 }),
    ceja: E({ mx: 0.85, my: 0.15, c: 0.45, sd: -2, gd: -0.03, si: 22, gi: 0.12, abre: 0, ancho: 0.76, sonr: -0.04 }),
    blanco: E({ mx: 0.1, my: -1, c: 0.32, sd: 6, gd: 0.04, si: 14, gi: 0.08, abre: 0, ancho: 0.72, sonr: -0.08 }),
    aparta: E({ mx: -0.6, my: -0.5, c: 0.55, sd: 4, gd: 0, si: 10, gi: 0.05, abre: 0, ancho: 0.8, sonr: 0.06 }),
    pasmo: E({ mx: 0.75, my: 0.55, c: 0.2, sd: 14, gd: 0.06, si: 20, gi: 0.1, abre: 6, ancho: 0.6, sonr: -0.05 }),
    risa: E({ mx: 0.4, my: -0.3, c: 1, h: 1, sd: 20, gd: 0.12, si: 22, gi: 0.12, abre: 40, ancho: 1.2, sonr: 1.0, lengua: 0.5 }),
    mete: E({ mx: 0.55, my: 0.8, c: 0.45, h: 0.3, sd: 8, gd: 0.05, si: 10, gi: 0.05, abre: 0, ancho: 0.92, sonr: 0.5 }),
    camara: E({ mx: -0.85, my: 0, c: 0.38, h: 0.25, sd: 6, gd: 0.04, si: 14, gi: 0.08, abre: 0, ancho: 0.9, sonr: 0.55 })
  };
  const GUION_CARA_S = [
    [T.s1 - 0.1, T.s1 + 0.15, "mira"], [T.g1 + 0.3, T.g1 + 0.6, "ceja"], [T.mareo + 0.4, T.mareo + 0.7, "seria"],
    [T.chulo + 0.1, T.chulo + 0.3, "mira"], [T.g2 + 0.25, T.g2 + 0.45, "seria"], [T.agacha0 + 0.3, T.agacha1 + 0.1, "abajo"],
    [T.salta + 0.1, T.salta + 0.3, "pasmo"], [T.ceno, T.ceno + 0.3, "seria"], [T.sMira, T.sMira + 0.2, "ceja"],
    [T.sRoll, T.sRoll + 0.16, "blanco"], [T.toss0 + 0.05, T.toss1, "aparta"], [T.cae1 - 0.1, T.cae1 + 0.2, "pasmo"],
    [T.hunde1, T.hunde1 + 0.3, "abajo"], [T.risa0, T.risa0 + 0.14, "risa", salida], [T.coge0 + 0.1, T.coge1 + 0.1, "mete"],
    [T.camara + 0.1, T.camara + 0.35, "camara"]
  ];
  // cuerpo: torso, cab, px (pelvis, hoja), pel
  const CUERPOS_S = {
    inicio: { torso: 0.02, cab: 0.04, px: 0, pel: 0 },
    cambia: { torso: -0.09, cab: 0.08, px: 16, pel: 4 },
    vuelve: { torso: 0.03, cab: 0.02, px: 4, pel: 0 },
    ladea: { torso: 0.1, cab: -0.14, px: -6, pel: 0 },
    mira: { torso: 0.03, cab: 0.06, px: 0, pel: 0 },
    asoma: { torso: 0.17, cab: 0.2, px: -10, pel: 6 },
    erguida: { torso: 0.0, cab: 0.03, px: 0, pel: 0 },
    toss: { torso: -0.07, cab: -0.36, px: 6, pel: -4 },
    altiva: { torso: -0.03, cab: -0.16, px: 4, pel: 0 },
    miraSuelo: { torso: 0.06, cab: 0.14, px: 0, pel: 0 },
    risa: { torso: -0.1, cab: -0.26, px: 8, pel: 4 },
    mete: { torso: 0.06, cab: 0.2, px: 0, pel: 0 },
    final: { torso: 0.02, cab: 0.0, px: 0, pel: 0 }
  };
  const GUION_CUERPO_S = [
    [T.s1, T.g1 + 0.02, "cambia"], [T.g1 + 0.5, T.vis0 + 0.4, "vuelve"], [T.s2, T.g2 + 0.04, "ladea"], [T.g2 + 0.4, T.agacha0 + 0.3, "mira"],
    [T.s3, T.g3 + 0.02, "asoma"], [T.salta + 0.1, T.salta + 0.5, "erguida"], [T.toss0, T.toss0 + 0.16, "toss", salida],
    [T.toss0 + 0.16, T.toss1 + 0.3, "altiva"], [T.cae1, T.cae1 + 0.4, "miraSuelo"], [T.risa0, T.risa0 + 0.2, "risa", salida],
    [T.coge0, T.coge1, "mete"], [T.sBols0, T.camara + 0.2, "final"]
  ];
  const risa = t => dentro(t, T.risa0, T.risa0 + 0.1, T.risa1 - 0.1, T.risa1 + 0.15);

  const cacheS = new Map();
  function poseS(t) {
    const k0 = t;
    if (cacheS.has(k0)) return cacheS.get(k0);
    if (cacheS.size > 12) cacheS.clear();
    const p = poseS0(t); cacheS.set(k0, p); return p;
  }
  function cuerpoS(t) {
    const b = guion(GUION_CUERPO_S, CUERPOS_S, "inicio", t);
    // se balancea un poco todo el rato (escucha, espera)
    b.torso += 0.018 * Math.sin(t * 1.7 + 0.4); b.cab += 0.02 * Math.sin(t * 1.3 + 1.1);
    // carcajada: hombros que botan
    const ri = risa(t);
    b.torso += 0.035 * Math.sin(t * 21) * ri; b.cab += 0.04 * Math.sin(t * 21 + 0.6) * ri; b.pel += 5 * Math.abs(Math.sin(t * 21)) * ri;
    return b;
  }
  function poseS0(t) {
    const b = cuerpoS(t), b2 = cuerpoS(t - 0.08);
    const respira = Math.sin(t * 1.9 + 0.7);
    const p = {
      x: XS, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: Sa.PELVIS.x + b.px, y: Sa.PELVIS.y + b.pel + respira * 1.0 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      pelo: { viento: 0.12 + 0.06 * Math.sin(t * 0.9), inercia: 0 }
    };
    // la melena sigue al cuerpo y a la cabeza (y el golpe de melena)
    p.pelo.inercia = clamp((b.torso - b2.torso) * 6 + (b.cab - b2.cab) * 4 - 0.5 * campana(t, T.toss0, T.toss1 + 0.25), -0.9, 0.9);
    // pies quietos; la pelvis se mueve encima
    p.piernas.cerca = { tob: { x: Sa.CADERA.cerca.x - 8, y: TOB_S }, ang: 0 };
    p.piernas.lejos = { tob: { x: Sa.CADERA.lejos.x + 14, y: TOB_S - 10 }, ang: 0 };
    const ex = guion(GUION_CARA_S, CARAS_S, "seria", t);
    const ri = risa(t);
    ex.abre += 8 * Math.sin(t * 21) * ri;
    p.cara = cara(ex, parpadeo(t, [0.7, 2.3, 4.0, 6.2, 7.2, 9.4, 12.9], 0.16));
    p.rojo = 0.25 * dentro(t, T.risa0 + 0.2, T.risa0 + 0.5, T.mete1, T.camara);
    manosS(p, t);
    p.capaTronco = (g, tt) => collarMetido(g, tt, p);
    return p;
  }

  /* ---------- el collar: la misma cuenta que el muñeco ---------- */
  const COLLAR = { a: { x: 211, y: 262 }, b: { x: 278, y: 264 }, centro: 256, baja: 50, cruz: [26, 14] };
  const giroCollar = (p, t) => -(p.torso || 0) * 1.1 - ((p.pelo || {}).inercia || 0) * 0.25 + 0.06 * Math.sin(t * 1.9 + 0.7);
  const ESCONDIDA = { x: 256, y: 382 };                    // la argolla, ya por dentro del top (tronco)
  // argolla (tronco) y giro de la cruz en cada momento
  function argolla(p, t) {
    const giro = giroCollar(p, t);
    const nat = { x: COLLAR.centro + Math.sin(giro) * 14, y: COLLAR.b.y + COLLAR.baja * Math.cos(giro * 0.6) };
    const k = tramo(t, T.mete0, T.mete1, suave);
    return { x: lerp(nat.x, ESCONDIDA.x, k), y: lerp(nat.y, ESCONDIDA.y, k), rot: lerp(giro * 0.8, 0, k), giro };
  }
  // el centro del travesaño de la cruz (tronco → pantalla)
  function puntoCruz(p, t) {
    const a = argolla(p, t), q = rota({ x: 0, y: 12.7 }, a.rot);
    return Sa.aPantalla(p, Sa.tronco(p)({ x: a.x + q.x, y: a.y + 1 + q.y }));
  }
  // el escote: por encima, piel; por debajo, el top (coordenadas del tronco)
  const ESCOTE = [[176, 318], [187, 344.5], [200, 348.5], [215, 352.5], [240, 356.5], [260, 358.5], [285, 360.5], [310, 361.5], [335, 360.5], [343, 355]];
  const rutaPiel = g => { g.beginPath(); g.moveTo(180, 250); g.lineTo(330, 250); g.lineTo(346, 330); ESCOTE.slice().reverse().forEach(([x, y]) => g.lineTo(x, y)); g.closePath(); };
  const rutaRepinta = g => { g.beginPath(); g.moveTo(195, 257); g.lineTo(282, 257); g.lineTo(300, 280); g.lineTo(312, 368); g.lineTo(184, 368); g.lineTo(178, 300); g.closePath(); };
  function collarMetido(g, t, p) {
    if (t < T.mete0 - 0.02) return;
    const a = argolla(p, t);
    // 1 · repinta el pecho del propio torso encima del collar del muñeco
    g.save(); rutaRepinta(g); g.clip(); R.pieza(g, Sa.A, "tronco_libre"); g.restore();
    // 2 · cordón y cruz nuevos, recortados por el escote (lo que baja del escote queda dentro del top)
    g.save(); rutaPiel(g); g.clip(); g.lineCap = "round"; g.lineJoin = "round";
    const { a: A_, b: B_ } = COLLAR, mx = a.x, my = a.y;
    const cordon = () => { g.beginPath(); g.moveTo(A_.x, A_.y); g.quadraticCurveTo(A_.x + (mx - A_.x) * 0.3, my + 2, mx, my);
      g.quadraticCurveTo(B_.x - (B_.x - mx) * 0.3, my + 2, B_.x, B_.y); };
    cordon(); g.strokeStyle = "#141114"; g.lineWidth = 3.2; g.stroke();
    cordon(); g.strokeStyle = "rgba(150,140,146,0.55)"; g.lineWidth = 0.9; g.stroke();
    const [L, Wc] = COLLAR.cruz;
    g.translate(mx, my + 1); g.rotate(a.rot);
    g.beginPath(); g.arc(0, 2, 2.2, 0, TAU); g.strokeStyle = "#141114"; g.lineWidth = 1.6; g.stroke();
    const cruz = () => { g.beginPath(); g.rect(-2.6, 4, 5.2, L); g.rect(-Wc / 2, 4 + L * 0.24, Wc, 5); };
    cruz(); g.fillStyle = "#2c282b"; g.fill();
    g.fillStyle = "#7a7378"; g.fillRect(-1.4, 5.2, 1.4, L - 2.4); g.fillRect(-Wc / 2 + 1.2, 4 + L * 0.24 + 1.1, Wc - 2.4, 1.3);
    g.beginPath(); g.rect(-2.6, 4, 5.2, L); g.strokeStyle = "#0b0a0c"; g.lineWidth = 1.4; g.stroke();
    g.beginPath(); g.rect(-Wc / 2, 4 + L * 0.24, Wc, 5); g.stroke();
    g.fillStyle = "#2c282b"; g.fillRect(-1.9, 4 + L * 0.24 + 0.7, 3.8, 3.6);
    g.restore();
    // 3 · el bultito de la cruz bajo la tela, un momento
    const bu = dentro(t, T.mete1 - 0.1, T.mete1, T.palma1, T.palma1 + 0.3);
    if (bu > 0.01) { g.save(); g.globalAlpha = 0.35 * bu; g.strokeStyle = "#57525a"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(250, 372); g.lineTo(262, 372); g.moveTo(256, 366); g.lineTo(256, 386); g.stroke(); g.restore(); }
  }

  function manosS(p, t) {
    const res = resolutor(Sa, p, "cerca");
    const enTronco = q => () => Sa.aPantalla(p, Sa.tronco(p)(q));
    const PC = [
      [0, 0, { bols: true }],
      // con la risa, la mano al pecho
      [T.risa0 + 0.25, T.risa0 + 0.5, { bols: true, sale: true, dedos: PALMA_D }],
      [T.risa0 + 0.45, T.risa0 + 0.85, { scr: enTronco({ x: 238, y: 392 }), ref: PALMA, mu: 2.3, dedos: PALMA_D }],
      // coge la cruz y la mete por dentro del top
      [T.coge0, T.coge1, { scr: () => puntoCruz(p, t), ref: PINZA, mu: 2.2, dedos: PINZA_D }],
      [T.coge1, T.mete1 + 0.04, { scr: () => puntoCruz(p, t), ref: PINZA, mu: 2.2, dedos: PINZA_D }, x => x],
      // palmadita
      [T.palma0, T.palma0 + 0.08, { scr: enTronco({ x: 246, y: 382 }), ref: PALMA, mu: 2.25, dedos: PALMA_D }, salida],
      [T.palma0 + 0.08, T.palma1, { scr: enTronco({ x: 244, y: 372 }), ref: PALMA, mu: 2.25, dedos: PALMA_D }],
      [T.sBols0, T.sBols1 - 0.05, { bols: true, sale: true, dedos: BOLS_D }],
      [T.sBols1 - 0.05, T.sBols1, { bols: true }]
    ];
    const c = pista(PC, t, res);
    // la palmadita: un toque rápido
    c.y += 6 * campana(t, T.palma0 + 0.06, T.palma0 + 0.16);
    alcanza(Sa, p, c, "cerca");
    p.manoCerca = manoDe(c);
    p.manoLejos = null;                                    // en su bolsillo (reposo del muñeco)
  }

  /* =====================================================================================
   * DESTELLOS
   * ===================================================================================== */
  function estrella4(g, x, y, r, a, rot = 0, col = "#ffffff") {
    if (a <= 0.01 || r <= 0.2) return;
    g.save(); g.globalAlpha = clamp(a); g.translate(x, y); g.rotate(rot); g.fillStyle = col;
    g.beginPath();
    for (let i = 0; i < 8; i++) { const ang = i * Math.PI / 4, rr = i % 2 ? r * 0.18 : r; g.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr); }
    g.closePath(); g.fill(); g.restore();
  }
  function halo(g, x, y, r, a) {
    if (a <= 0.01) return;
    const gl = g.createRadialGradient(x, y, 0, x, y, r);
    gl.addColorStop(0, `rgba(255,252,226,${0.9 * a})`); gl.addColorStop(0.35, `rgba(255,240,170,${0.45 * a})`); gl.addColorStop(1, "rgba(255,236,160,0)");
    g.save(); g.globalCompositeOperation = "lighter"; g.fillStyle = gl; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.restore();
  }
  // chispa en el origen (la cruz o el aro)
  function chispa(g, q, k, t, grande = 1) {
    if (k <= 0.01) return;
    halo(g, q.x, q.y, 22 * k * grande, k);
    estrella4(g, q.x, q.y, 17 * k * grande, k, 0.12 + t * 0.6);
    estrella4(g, q.x, q.y, 9 * k * grande, k, Math.PI / 4 + 0.12 - t * 0.6, "#fff4b8");
  }
  // estallido en los ojos de Guillermo
  function estallido(g, q, k, t, grande = 1) {
    if (k <= 0.01) return;
    halo(g, q.x, q.y, 58 * k * grande, k);
    estrella4(g, q.x, q.y, 38 * k * grande, k, 0.3 + t * 1.2);
    estrella4(g, q.x, q.y, 22 * k * grande, k, Math.PI / 4 + 0.3 - t * 1.2, "#fff2a6");
    g.save(); g.globalAlpha = clamp(k); g.strokeStyle = "#fffbe6"; g.lineCap = "round"; g.lineWidth = 2.4;
    for (let i = 0; i < 8; i++) { const a = i * TAU / 8 + 0.2 + t * 0.8, r0 = (26 + 10 * (1 - k)) * grande, r1 = r0 + 12 * k * grande;
      g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * r1, q.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // rayo (banda que se ensancha) por una curva cuadrática de -> c -> a, hasta la fracción u
  function rayo(g, de, c, a, k, u = 1, ancho = 18) {
    if (k <= 0.01 || u <= 0.01) return;
    const n = 18, P = [];
    for (let i = 0; i <= n; i++) { const s = u * i / n, m = 1 - s;
      P.push({ x: m * m * de.x + 2 * m * s * c.x + s * s * a.x, y: m * m * de.y + 2 * m * s * c.y + s * s * a.y, s }); }
    const izq = [], der = [];
    for (let i = 0; i <= n; i++) {
      const q0 = P[Math.max(0, i - 1)], q1 = P[Math.min(n, i + 1)], dx = q1.x - q0.x, dy = q1.y - q0.y, L = Math.hypot(dx, dy) || 1;
      const w = 1.6 + ancho * P[i].s * 0.5;
      izq.push({ x: P[i].x - dy / L * w, y: P[i].y + dx / L * w }); der.push({ x: P[i].x + dy / L * w, y: P[i].y - dx / L * w });
    }
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createLinearGradient(de.x, de.y, P[n].x, P[n].y);
    gr.addColorStop(0, `rgba(255,250,214,${0.72 * k})`); gr.addColorStop(1, `rgba(255,244,190,${0.28 * k})`);
    g.fillStyle = gr; g.beginPath(); izq.forEach((q, i) => (i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y))); for (let i = n; i >= 0; i--) g.lineTo(der[i].x, der[i].y); g.closePath(); g.fill();
    // alma brillante
    g.strokeStyle = `rgba(255,255,240,${0.8 * k})`; g.lineWidth = 1.6; g.lineCap = "round"; g.beginPath(); P.forEach((q, i) => (i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y))); g.stroke();
    g.restore();
  }
  const ojosG = p => G.aPantalla(p, G.cabeza(p).a(OJOS_G));
  // intensidad de cada destello (rampas suaves de varios fotogramas)
  const brillo = (t, t0, t1) => tramo(t, t0, t0 + 0.08) * (1 - tramo(t, t1 - 0.3, t1));
  function lenteCercana(t) {
    const gf=gafasG(t);
    return apl(gf.A,geo(NEGRAS,gf.o).nc);
  }
  function destellos(g, t, pG, pS) {
    const cruz = puntoCruz(pS, t), ojos = ojosG(pG);
    // aviso: la cruz brilla un instante antes de cada destello
    for (const t0 of [T.g1, T.g2, T.g3]) chispa(g, cruz, 0.55 * campana(t, t0 - 0.2, t0 + 0.02), t, 0.7);
    // 1 · directo
    const k1 = brillo(t, T.g1, T.g1Fin);
    if (k1 > 0.01) { const u = tramo(t, T.g1, T.g1 + 0.07, s => s); rayo(g, cruz, mezcla(cruz, ojos, 0.5), ojos, k1, u); chispa(g, cruz, k1, t); estallido(g, ojos, k1 * tramo(t, impacto.uno, impacto.uno + 0.05), t); }
    // 2 · por debajo de la visera
    const k2 = brillo(t, T.g2, T.g2Fin);
    if (k2 > 0.01) { const u = tramo(t, T.g2, T.g2 + 0.07, s => s), c = { x: lerp(cruz.x, ojos.x, 0.5), y: Math.max(cruz.y, ojos.y) + 16 };
      rayo(g, cruz, c, ojos, k2, u); chispa(g, cruz, k2, t); estallido(g, ojos, k2 * tramo(t, impacto.dos, impacto.dos + 0.05), t); }
    // 3 · pasa por encima (donde tenía los ojos de pie)… y se dobla hasta él
    const k3 = brillo(t, T.g3, T.g3Fin);
    if (k3 > 0.01) {
      const alto = ojosG(poseG(T.agacha0 - 0.02));
      const fallo = { x: alto.x - 150, y: alto.y - 46 };      // sigue de largo por encima de su cabeza
      const dob = tramo(t, T.g3Dobla, T.g3Toca, salida);
      const c = mezcla(mezcla(cruz, fallo, 0.5), { x: alto.x + 6, y: alto.y - 70 }, dob);
      const fin = mezcla(fallo, ojos, dob);
      const u = tramo(t, T.g3, T.g3 + 0.1, s => s);
      // tiembla un poco al doblarse
      const tb = campana(t, T.g3Dobla - 0.05, T.g3Toca + 0.05);
      c.x += 4 * Math.sin(t * 50) * tb; c.y += 3 * Math.cos(t * 44) * tb;
      rayo(g, cruz, c, fin, k3, u); chispa(g, cruz, k3, t);
      estallido(g, ojos, k3 * tramo(t, impacto.tres, impacto.tres + 0.05), t, 1.1);
    }
    // 4 · el aro de la nariz, contra las gafas (enorme)
    const k4 = brillo(t, T.g4, T.g4Fin);
    if (k4 > 0.01) {
      const aro = Sa.aPantalla(pS, Sa.cabeza(pS).a(ARO));
      const u = tramo(t, T.g4, T.g4 + 0.06, s => s);
      const lente=lenteCercana(t);
      rayo(g, aro, mezcla(aro,lente,0.5), lente, k4, u, 30); chispa(g, aro, k4, t, 1.5);
      estallido(g, lente, k4*tramo(t,impacto.cuatro,impacto.cuatro+0.05), t, 1.55);
    }
    // El frente de onda queda en la posición de impacto aunque las gafas caigan con él.
    const ko=fase(t, impacto.cuatro, impacto.cuatro+0.5);
    if (ko>0 && ko<1) {
      const foco=lenteCercana(impacto.cuatro);
      g.save(); g.strokeStyle = `rgba(255,250,220,${0.9 * Math.sin(Math.PI * ko)})`; g.lineWidth = 2.2;
      for (let i = 0; i < 2; i++) { const r = 26 + 70 * ko + i * 16; g.beginPath(); g.arc(foco.x, foco.y, r, 0, TAU); g.stroke(); }
      g.restore();
    }
  }

  /* ---------- efectos menores ---------- */
  function estrellita(g, x, y, r, a, k) {
    if (k <= 0.01) return;
    g.save(); g.translate(x, y); g.rotate(a); g.scale(k, k); g.beginPath();
    for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.42 : r, an = i * Math.PI / 5 - Math.PI / 2; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
    g.closePath(); g.fillStyle = "#fff07a"; g.fill(); g.lineWidth = 1.1; g.strokeStyle = "#c48a00"; g.stroke(); g.restore();
  }
  function rayitas(g, x, y, k, ang, n = 3, r0 = 14, l = 10, col = "#1b1820") {
    if (k <= 0.01) return;
    g.save(); g.globalAlpha = clamp(k); g.strokeStyle = col; g.lineCap = "round"; g.lineWidth = 2.2;
    for (let i = 0; i < n; i++) { const a = ang + (i - (n - 1) / 2) * 0.45, r = r0 + 4 * (1 - k);
      g.beginPath(); g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.lineTo(x + Math.cos(a) * (r + l), y + Math.sin(a) * (r + l)); g.stroke(); }
    g.restore();
  }
  function efectos(g, t, pG, pS) {
    destellos(g, t, pG, pS);
    // estrellitas de mareo alrededor de la cabeza de Guillermo
    const cG = G.aPantalla(pG, G.cabeza(pG).a({ x: 760, y: 300 }));
    const mar = dentro(t, T.mareo - 0.05, T.mareo + 0.1, T.vis0, T.vis0 + 0.15) + dentro(t, T.cae1, T.cae1 + 0.15, T.hunde1, T.hunde1 + 0.3);
    for (let i = 0; i < 4; i++) { const a = t * 4 + i * TAU / 4; estrellita(g, cG.x + Math.cos(a) * 34, cG.y + Math.sin(a) * 9, 5, t * 3 + i, mar * (0.75 + 0.25 * Math.sin(t * 9 + i))); }
    // ¡clic! al abrir las gafas
    const gf = gafasG(t);
    const kc = fase(t, T.abre1, T.abre1 + 0.22);
    if (gf && gf.A && kc > 0 && kc < 1) { const q = apl(gf.A,geo(NEGRAS,gf.o).hn); rayitas(g, q.x, q.y, Math.sin(Math.PI * kc), -0.9, 3, 10, 7, "#2a2630"); }
    // brillito de las gafas en la pose triunfal
    if (gf && gf.capa === "cara") {
      const kb = campana(t, T.triunfo + 0.02, T.triunfo + 0.4);
      if (kb > 0.01) { const q = apl(caraAF(pG, caidaGafas(t)), { x: -112, y: -22 }); estrella4(g, q.x, q.y, 11 * kb, kb, 0.2); estrella4(g, q.x, q.y, 6 * kb, kb, 1.0, "#fff4b8"); }
    }
    // rayitas de susto al saltar y al caer
    const hG = G.aPantalla(pG, G.cabeza(pG).a({ x: 780, y: 260 }));
    rayitas(g, hG.x, hG.y, campana(t, T.salta, T.salta + 0.4), -1.75, 3, 16, 10);
    rayitas(g, hG.x, hG.y, campana(t, T.cae0, T.cae0 + 0.4), -1.6, 3, 16, 12);
    // jajaja de Sara: rayitas de risa junto a la cabeza (sin letras)
    const ri = risa(t);
    if (ri > 0.01) { const q = Sa.aPantalla(pS, Sa.cabeza(pS).a({ x: 980, y: 300 })); rayitas(g, q.x, q.y, ri * (0.7 + 0.3 * Math.sin(t * 21)), -0.7, 3, 14, 9); }
    // polvo al caer de culo
    const kp = fase(t, T.cae1, T.cae1 + 0.5);
    if (kp > 0 && kp < 1) {
      g.save(); g.fillStyle = `rgba(222,200,160,${0.7 * Math.sin(Math.PI * kp)})`;
      for (let i = 0; i < 6; i++) { const sg = i % 2 ? 1 : -1, d = 20 + 50 * kp * (0.6 + 0.4 * hash(i)); g.beginPath(); g.ellipse(asientoG(poseG(T.cae1)).x + sg * d, SUELO - 4 - 10 * kp * hash(i + 3), 9 + 8 * kp, 5 + 4 * kp, 0, 0, TAU); g.fill(); }
      g.restore();
    }
  }

  /* =====================================================================================
   * FONDO (una vez): paseo marítimo
   * ===================================================================================== */
  let fondo = null;
  const HORIZONTE = 262, BAR = { top: 318, base: 384 };
  const SOL = { x: 112, y: 74 };
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 160; c.height = H + 140; const g = c.getContext("2d");
    g.translate(80, 70); g.lineJoin = "round"; g.lineCap = "round";
    // cielo
    const gc = g.createLinearGradient(0, -70, 0, HORIZONTE);
    gc.addColorStop(0, "#3d98e0"); gc.addColorStop(0.6, "#7ec0ee"); gc.addColorStop(1, "#d6eef9");
    g.fillStyle = gc; g.fillRect(-80, -70, W + 160, HORIZONTE + 70);
    // resplandor del sol
    const gs = g.createRadialGradient(SOL.x, SOL.y, 10, SOL.x, SOL.y, 300);
    gs.addColorStop(0, "rgba(255,250,214,0.95)"); gs.addColorStop(0.2, "rgba(255,240,180,0.5)"); gs.addColorStop(1, "rgba(255,240,180,0)");
    g.fillStyle = gs; g.fillRect(-80, -70, 520, 420);
    g.fillStyle = "#fffbe6"; g.beginPath(); g.arc(SOL.x, SOL.y, 34, 0, TAU); g.fill();
    // nubes
    const nube = (x, y, s) => { g.fillStyle = "rgba(255,255,255,0.92)"; for (const [dx, dy, r] of [[0, 0, 22], [24, -10, 26], [52, -2, 20], [74, 4, 14], [-20, 6, 14]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, TAU); g.fill(); }
      g.fillStyle = "rgba(170,200,230,0.35)"; g.beginPath(); g.ellipse(x + 28 * s, y + 14 * s, 54 * s, 6 * s, 0, 0, TAU); g.fill(); };
    nube(430, 70, 1.0); nube(720, 120, 0.8); nube(900, 46, 0.7); nube(270, 170, 0.55);
    // cabo lejano con casitas blancas (derecha)
    g.fillStyle = "#8fa9bf"; g.beginPath(); g.moveTo(640, HORIZONTE); g.quadraticCurveTo(720, 214, 800, 220); g.quadraticCurveTo(880, 196, 960, 206); g.quadraticCurveTo(1040, 214, 1110, 228); g.lineTo(1110, HORIZONTE); g.closePath(); g.fill();
    for (let i = 0; i < 22; i++) { const x = 730 + i * 17 + 6 * hash(i), y = HORIZONTE - 8 - 26 * hash(i * 2.7) * (i > 4 && i < 18 ? 1 : 0.4), w = 7 + 5 * hash(i * 1.9);
      g.fillStyle = hash(i * 4.1) > 0.3 ? "#f2f4f6" : "#d9b8a0"; g.fillRect(x, y, w, HORIZONTE - y); g.fillStyle = "rgba(90,120,150,0.5)"; g.fillRect(x + 1, y + 3, 2, 2); g.fillRect(x + w - 3, y + 3, 2, 2); }
    // mar
    const gm = g.createLinearGradient(0, HORIZONTE, 0, BAR.base);
    gm.addColorStop(0, "#2a6fb4"); gm.addColorStop(1, "#3f97d2");
    g.fillStyle = gm; g.fillRect(-80, HORIZONTE, W + 160, BAR.base - HORIZONTE);
    g.strokeStyle = "rgba(255,255,255,0.28)"; g.lineWidth = 1.5;
    for (let i = 0; i < 40; i++) { const x = -60 + hash(i * 5.3) * (W + 120), y = HORIZONTE + 6 + hash(i * 2.1) * (BAR.top - HORIZONTE + 10), l = 10 + 24 * hash(i);
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 2, x + l, y); g.stroke(); }
    // camino de luz del sol en el agua
    const gl = g.createLinearGradient(SOL.x - 60, 0, SOL.x + 140, 0);
    gl.addColorStop(0, "rgba(255,246,200,0)"); gl.addColorStop(0.5, "rgba(255,246,200,0.5)"); gl.addColorStop(1, "rgba(255,246,200,0)");
    g.fillStyle = gl; g.beginPath(); g.moveTo(SOL.x - 20, HORIZONTE); g.lineTo(SOL.x + 20, HORIZONTE); g.lineTo(SOL.x + 150, BAR.top); g.lineTo(SOL.x - 110, BAR.top); g.closePath(); g.fill();
    // palmera (detrás de la barandilla, a la izquierda)
    g.save(); g.translate(60, BAR.base);
    g.strokeStyle = "#8a6a44"; g.lineWidth = 14; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-14, -150, 18, -300); g.stroke();
    g.strokeStyle = "rgba(60,40,20,0.45)"; g.lineWidth = 2; for (let k = 0; k < 16; k++) { const s = k / 16, x = lerp(0, 18, s * s) - 14 * 2 * s * (1 - s), y = -300 * s; g.beginPath(); g.moveTo(x - 7, y); g.lineTo(x + 7, y - 4); g.stroke(); }
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.42, L = 92 + 18 * hash(i);
      g.strokeStyle = "#2f7d3c"; g.lineWidth = 4; g.beginPath(); g.moveTo(18, -300); const cx = 18 + Math.cos(a) * L * 0.6, cy = -300 + Math.sin(a) * L * 0.6 - 20, ex = 18 + Math.cos(a) * L, ey = -300 + Math.sin(a) * L + 34;
      g.quadraticCurveTo(cx, cy, ex, ey); g.stroke();
      g.fillStyle = i % 2 ? "#3d9a4a" : "#2f8a3e";
      for (let k = 1; k < 9; k++) { const s = k / 9, m = 1 - s, x = m * m * 18 + 2 * m * s * cx + s * s * ex, y = m * m * -300 + 2 * m * s * cy + s * s * ey;
        g.beginPath(); g.ellipse(x, y + 7, 3.4, 10 * (1 - s * 0.5), a + 0.3, 0, TAU); g.fill(); g.beginPath(); g.ellipse(x, y - 6, 3.4, 9 * (1 - s * 0.5), a - 0.3, 0, TAU); g.fill(); } }
    g.fillStyle = "#7a5a34"; g.beginPath(); g.arc(18, -300, 9, 0, TAU); g.fill();
    g.restore();
    // barandilla blanca de balaustres
    g.fillStyle = "#e9e3d6"; g.fillRect(-80, BAR.base - 8, W + 160, 12);
    for (let x = -76; x < W + 80; x += 22) {
      g.fillStyle = "#f4efe4"; g.beginPath(); g.moveTo(x, BAR.top + 8); g.quadraticCurveTo(x - 6, BAR.top + 24, x - 2, BAR.top + 34); g.quadraticCurveTo(x - 8, BAR.top + 50, x - 4, BAR.base - 8);
      g.lineTo(x + 12, BAR.base - 8); g.quadraticCurveTo(x + 16, BAR.top + 50, x + 10, BAR.top + 34); g.quadraticCurveTo(x + 14, BAR.top + 24, x + 8, BAR.top + 8); g.closePath(); g.fill();
      g.fillStyle = "rgba(150,130,110,0.35)"; g.beginPath(); g.moveTo(x + 6, BAR.top + 10); g.quadraticCurveTo(x + 11, BAR.top + 26, x + 8, BAR.top + 34); g.quadraticCurveTo(x + 13, BAR.top + 50, x + 10, BAR.base - 8); g.lineTo(x + 12, BAR.base - 8); g.quadraticCurveTo(x + 16, BAR.top + 50, x + 10, BAR.top + 34); g.quadraticCurveTo(x + 14, BAR.top + 24, x + 8, BAR.top + 8); g.closePath(); g.fill();
    }
    g.fillStyle = "#f7f3ea"; g.fillRect(-80, BAR.top, W + 160, 10); g.fillStyle = "#cfc6b4"; g.fillRect(-80, BAR.top + 10, W + 160, 3);
    for (let x = -60; x < W + 80; x += 154) { g.fillStyle = "#efe9dc"; g.fillRect(x, BAR.top - 4, 22, BAR.base - BAR.top + 4); g.fillStyle = "rgba(150,130,110,0.3)"; g.fillRect(x + 15, BAR.top - 4, 7, BAR.base - BAR.top + 4);
      g.fillStyle = "#f7f3ea"; g.fillRect(x - 3, BAR.top - 8, 28, 6); }
    g.fillStyle = "#bdb4a2"; g.fillRect(-80, BAR.base + 2, W + 160, 4);
    // suelo de baldosas en ondas (perspectiva)
    const Y0 = BAR.base + 6, Y1 = H + 70;
    const cols = ["#c9533a", "#f0e2c4", "#e2a53a", "#f0e2c4", "#2f2b2e", "#f0e2c4"];
    const filas = 26;
    for (let r = 0; r < filas; r++) {
      const s0 = r / filas, s1 = (r + 1) / filas, y0 = Y0 + (Y1 - Y0) * s0 * s0, y1 = Y0 + (Y1 - Y0) * s1 * s1;
      const amp0 = 2 + 10 * s0 * s0, amp1 = 2 + 10 * s1 * s1, fr = 0.018 / (0.25 + 0.75 * s0);
      g.fillStyle = cols[r % cols.length]; g.beginPath();
      for (let x = -80; x <= W + 80; x += 12) { const y = y0 + amp0 * Math.sin(x * fr + r * 0.9); if (x === -80) g.moveTo(x, y); else g.lineTo(x, y); }
      for (let x = W + 80; x >= -80; x -= 12) { const y = y1 + amp1 * Math.sin(x * 0.018 / (0.25 + 0.75 * s1) + (r + 1) * 0.9) + 0.5; g.lineTo(x, y); }
      g.closePath(); g.fill();
    }
    const gsu = g.createLinearGradient(0, Y0, 0, Y0 + 60); gsu.addColorStop(0, "rgba(90,70,50,0.35)"); gsu.addColorStop(1, "rgba(90,70,50,0)"); g.fillStyle = gsu; g.fillRect(-80, Y0, W + 160, 60);
    // farola (derecha)
    g.save(); g.translate(FAROLA.x, FAROLA.y);
    g.fillStyle = "rgba(60,40,30,0.25)"; g.beginPath(); g.ellipse(26, 2, 40, 6, 0, 0, TAU); g.fill();
    g.fillStyle = "#1f2226"; g.strokeStyle = TINTA; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(-14, 0); g.lineTo(14, 0); g.lineTo(9, -20); g.lineTo(-9, -20); g.closePath(); g.fill();
    g.fillRect(-4, -330, 8, 312);
    g.beginPath(); g.moveTo(-6, -200); g.lineTo(6, -200); g.lineTo(4, -186); g.lineTo(-4, -186); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(-18, -362); g.lineTo(18, -362); g.lineTo(12, -330); g.lineTo(-12, -330); g.closePath(); g.fill();
    g.fillStyle = "#f4e7b6"; g.beginPath(); g.moveTo(-14, -358); g.lineTo(14, -358); g.lineTo(10, -334); g.lineTo(-10, -334); g.closePath(); g.fill();
    g.fillStyle = "#1f2226"; g.beginPath(); g.moveTo(-22, -362); g.lineTo(22, -362); g.lineTo(0, -380); g.closePath(); g.fill(); g.fillRect(-2, -388, 4, 8);
    g.restore();
    // banco blanco (derecha, detrás)
    g.save(); g.translate(BANCO.x, BANCO.y);
    g.fillStyle = "rgba(60,40,30,0.22)"; g.beginPath(); g.ellipse(20, 2, 80, 7, 0, 0, TAU); g.fill();
    g.fillStyle = "#3a3d42"; for (const dx of [-56, 56]) { g.fillRect(dx - 4, -40, 8, 40); g.fillRect(dx - 4, -96, 8, 42); }
    for (let i = 0; i < 3; i++) { g.fillStyle = i % 2 ? "#f0ebe2" : "#fbf8f1"; g.fillRect(-70, -48 + i * 7, 140, 6); }
    for (let i = 0; i < 3; i++) { g.fillStyle = i % 2 ? "#f0ebe2" : "#fbf8f1"; g.fillRect(-70, -98 + i * 9, 140, 7); }
    g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 1; g.strokeRect(-70, -48, 140, 20); g.strokeRect(-70, -98, 140, 25);
    g.restore();
    // maceta grande de barro con geranios (izquierda)
    g.save(); g.translate(MACETA.x, MACETA.y);
    g.fillStyle = "rgba(60,40,30,0.25)"; g.beginPath(); g.ellipse(26, 2, 64, 8, 0, 0, TAU); g.fill();
    for (let i = 0; i < 26; i++) { const a = -Math.PI + (i / 25) * Math.PI, r = 50 + 12 * hash(i), x = Math.cos(a) * r * 1.05, y = -112 + Math.sin(a) * r * 0.75;
      g.fillStyle = hash(i * 3) > 0.5 ? "#2f7a36" : "#3c9442"; g.beginPath(); g.ellipse(x, y, 14, 10, a, 0, TAU); g.fill(); g.strokeStyle = "rgba(10,40,10,0.5)"; g.lineWidth = 1; g.stroke(); }
    for (let i = 0; i < 9; i++) { const x = -44 + i * 11 + 4 * hash(i), y = -128 - 30 * hash(i * 2.3) + 8 * Math.abs(i - 4);
      for (let k = 0; k < 6; k++) { const a = k * TAU / 6; g.fillStyle = k % 2 ? "#e2323e" : "#f2434e"; g.beginPath(); g.arc(x + Math.cos(a) * 4, y + Math.sin(a) * 4, 3.8, 0, TAU); g.fill(); }
      g.fillStyle = "#ffd0d2"; g.beginPath(); g.arc(x, y, 1.6, 0, TAU); g.fill(); }
    const gp = g.createLinearGradient(-50, 0, 50, 0); gp.addColorStop(0, "#9c4a2a"); gp.addColorStop(0.45, "#d27a4a"); gp.addColorStop(1, "#8a3f22");
    g.fillStyle = gp; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.moveTo(-56, -104); g.lineTo(56, -104); g.lineTo(44, 0); g.lineTo(-44, 0); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.roundRect(-62, -116, 124, 16, 4); g.fill(); g.stroke();
    g.strokeStyle = "rgba(255,220,180,0.35)"; g.lineWidth = 2; g.beginPath(); g.moveTo(-48, -84); g.lineTo(48, -84); g.moveTo(-46, -64); g.lineTo(46, -64); g.stroke();
    g.restore();
    return c;
  }
  // brillos del agua (dinámicos y baratos) y el velero
  const CHISPAS = Array.from({ length: 16 }, (_, i) => ({ x: SOL.x - 70 + hash(i * 3.3) * 280 + (hash(i * 9.1) > 0.7 ? 400 * hash(i) : 0), y: HORIZONTE + 8 + hash(i * 7.7) * (BAR.top - HORIZONTE - 6), f: 1.5 + 2 * hash(i * 1.7), ph: hash(i * 5.1) * TAU }));
  function mar(g, t) {
    for (const c of CHISPAS) { const k = Math.max(0, Math.sin(t * c.f + c.ph)); if (k > 0.3) estrella4(g, c.x, c.y, 5 * k, (k - 0.3) * 1.4, 0.2); }
    // velero, muy despacio
    const x = 560 + t * 4, y = HORIZONTE - 2 + 0.8 * Math.sin(t * 1.4);
    g.save(); g.translate(x, y); g.fillStyle = "#f7f7f2"; g.beginPath(); g.moveTo(0, -2); g.lineTo(0, -30); g.lineTo(14, -4); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(-2, -4); g.lineTo(-2, -24); g.lineTo(-11, -4); g.closePath(); g.fill();
    g.fillStyle = "#3a3f4a"; g.beginPath(); g.moveTo(-14, -2); g.lineTo(16, -2); g.lineTo(12, 3); g.lineTo(-10, 3); g.closePath(); g.fill(); g.restore();
    // gaviota que cruza
    const gx = 1080 - (t - 1.5) * 95, gy = 110 + 16 * Math.sin(t * 0.8);
    if (gx > -40 && gx < 1080) {
      const al = Math.sin(t * 9) * 6;
      g.save(); g.strokeStyle = "#2a2a30"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(gx - 14, gy - al); g.quadraticCurveTo(gx - 6, gy - 6 - al * 0.3, gx, gy); g.quadraticCurveTo(gx + 6, gy - 6 - al * 0.3, gx + 14, gy - al); g.stroke(); g.restore();
    }
  }
  function solVivo(g, t) {
    const k = 0.85 + 0.15 * Math.sin(t * 1.1);
    g.save(); g.globalCompositeOperation = "lighter";
    const gs = g.createRadialGradient(SOL.x, SOL.y, 30, SOL.x, SOL.y, 120);
    gs.addColorStop(0, `rgba(255,248,210,${0.35 * k})`); gs.addColorStop(1, "rgba(255,248,210,0)");
    g.fillStyle = gs; g.beginPath(); g.arc(SOL.x, SOL.y, 120, 0, TAU); g.fill();
    g.strokeStyle = `rgba(255,246,200,${0.3 * k})`; g.lineWidth = 3;
    for (let i = 0; i < 12; i++) { const a = i * TAU / 12 + t * 0.08, r0 = 44, r1 = 64 + 8 * Math.sin(t * 2 + i); g.beginPath(); g.moveTo(SOL.x + Math.cos(a) * r0, SOL.y + Math.sin(a) * r0); g.lineTo(SOL.x + Math.cos(a) * r1, SOL.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  function sombras(g, pG, pS) {
    g.save(); g.fillStyle = "rgba(70,40,25,0.26)";
    const fx = (p, Rg) => [Rg.aPantalla(p, { x: p.piernas.cerca.tob.x, y: 0 }).x, Rg.aPantalla(p, { x: p.piernas.lejos.tob.x, y: 0 }).x];
    const [a, b] = fx(pG, G), si = (pG.pelvis.y - G.PELVIS.y) / 560;
    const izquierda = lerp(Math.min(a,b)-38, asientoG(pG).x-35, clamp(si)), derecha=Math.max(a,b)+37;
    g.beginPath(); g.ellipse((izquierda+derecha)/2+12, SUELO+2, (derecha-izquierda)/2, 8, 0, 0, TAU); g.fill();
    const [c, d] = fx(pS, Sa);
    g.beginPath(); g.ellipse((c + d) / 2 + 22, SUELO + 2, 54, 7, 0, 0, TAU); g.fill();
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const a = tramo(t, T.cam0, T.cam1) * (1 - tramo(t, T.cam2, T.cam3));
    const k = lerp(1.04, 1.42, a), x = lerp(512, 502, a), y = lerp(318, 292, a);
    // sacudidas con los golpes
    let dx = 0, dy = 0;
    for (const [t0, A] of [[T.g3Toca, 2.2], [impacto.cuatro, 3.4], [T.cae1, 3.0]]) { const u = t - t0; if (u > 0 && u < 0.5) { const e = A * Math.exp(-u * 9) * (1-tramo(u,0.4,0.5)); dx += e * Math.sin(u * 47); dy += e * Math.sin(u * 41); } }
    return { k, x: x + dx, y: y + dy };
  }

  function poses(t) { return { g: poseG(t), s: poseS(t) }; }

  class ElCollar extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Sa.listo()) return;
      if (!fondo) fondo = creaFondo();
      const pG = poseG(t), pS = poseS(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      BASE_M = g.getTransform();
      g.drawImage(fondo, -80, -70);
      solVivo(g, t);
      mar(g, t);
      sombras(g, pG, pS);
      // gafas y pañuelo en la mano cercana de Guillermo (debajo de los dedos)
      pG.manoCerca.objeto = gg => { pintaGafasMano(gg, t); conCamara(gg, () => panuelo(gg, t, pG)); };
      G.dibujar(g, pG, t);
      Sa.dibujar(g, pS, t);
      efectos(g, t, pG, pS);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }

  registrar({ id: "00126.2", nombre: "Guillermo y Sara · El collar", crear: () => new ElCollar() });
  // diagnóstico: distancia hombro → muñeca / largo del brazo (≤ 1,08 o la mano se despega)
  function diag(t) {
    const out = {};
    for (const [n, Rg, p] of [["g", G, poseG(t)], ["s", Sa, poseS(t)]]) for (const lado of ["cerca", "lejos"]) {
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m) continue;
      const Tr = Rg.tronco(p), h = Tr(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO), mu = m.mu ?? -1.75;
      const w = { x: m.x + Math.cos(mu) * Rg.MUNECA_R * Rg.JK, y: m.y + Math.sin(mu) * Rg.MUNECA_R * Rg.JK };
      out[n + lado] = +(Math.hypot(w.x - h.x, w.y - h.y) / (lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L)).toFixed(3);
    }
    return out;
  }
  window.__A2D_00126_2 = { gafasG, geo, NEGRAS, caraAF, caidaGafas, apl, ptMano, PINZA, PALMA, ARO, sueloMano, asientoG, reboteG, vueloG, esquinaPanuelo, puntosPanuelo, lenteCercana, collarMetido, impacto,  pose: poses, poseG, poseS, T, DUR, diag, puntoCruz: t => puntoCruz(poseS(t), t), ojos: t => ojosG(poseG(t)), camara };
})();
