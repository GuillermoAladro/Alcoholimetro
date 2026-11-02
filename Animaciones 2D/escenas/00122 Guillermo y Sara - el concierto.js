"use strict";
/* 00122 · Guillermo y Sara · El concierto
 *
 * Negro → un concierto de rock de noche, entre el público: a la derecha, el escenario con su truss de
 * focos, la pantalla que late, torres de amplificadores y batería en silueta; haces de colores que
 * barren despacio por encima de las cabezas, humo y siluetas del público que botan al compás (algunas
 * con los cuernos en alto). Sara cabecea a la perfección a 120 pulsaciones: su melena negra vuela en
 * grandes arcos (con estela) y la cruz del collar se columpia. Guillermo, detrás, alucina; se decide y
 * lo intenta: cabeza abajo y arriba… y sus pinchos no se mueven ni un pelo. Se mira el pelo, se pica y
 * lo intenta al doble de velocidad: se marea (ojos en espiral y estrellitas) y ¡crac!, le cruje el
 * cuello. Con la mano en el cuello da un paso para asomarse y Sara carga un cabezazo enorme: la melena
 * sale por encima y le cruza la cara — ¡zas! —; él sale despedido un paso atrás, con mechones pegados
 * y tres verdugones rojos que se le quedan. Sara para y le enseña los cuernos (índice y meñique).
 * Guillermo, encantado, los hace… con tres dedos. Sara, sin cambiar la cara, le apoya el índice en el
 * dedo corazón y se lo dobla. Él mira su mano corregida, se ilumina, y los dos levantan los cuernos
 * hacia el escenario botando al compás; miran a cámara y Sara guiña un ojo → negro.
 *
 * La melena de Sara la dibuja la escena (las dos tiras del rig con ángulos propios, entre Guillermo y
 * ella): así el latigazo pasa por encima de la cara de él. Sin textos. Todo depende del tiempo `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, S = SaraSaez;
  const DUR = 14.6, TINTA = "#0b0a0e", TAU = Math.PI * 2;
  const BPM = 120, B = 60 / BPM, B0 = 1.0;
  const beat = k => B0 + k * B;
  // fase dentro del pulso: 0 justo en el golpe
  const fasePulso = (t, sub = 1) => { const u = (t - B0) / (B / sub); return u - Math.floor(u); };
  // pulso suave: 1 en el golpe, 0 a contratiempo (sin saltos al pasar de un pulso al siguiente)
  const pulso = (t, sub = 1, n = 3) => Math.pow(0.5 + 0.5 * Math.cos(TAU * fasePulso(t, sub)), n);

  const T = {
    // Sara
    sBang0: 0.75, sBang1: 8.1, carga0: 8.15, carga1: 8.62, latigo: 8.86, hit: 8.98, sPara: 9.35,
    sMira: 9.75, sCuernos0: 10.25, sCuernos1: 10.6, sAlarga0: 11.3, sToca: 11.62, sBaja: 11.92, sSuelta: 12.12,
    // Guillermo
    gMira: 1.15, gFlipa: 1.4, gDecide: 2.55, gBang0: beat(4), gBang1: beat(7), gMiraPelo: 4.62, gPica: 5.2,
    gFuerte0: beat(9.5), gFuerte1: beat(12), gMareo: 7.05, gCrack: 7.55, gCuello: 7.62, gAsoma: 8.05,
    gEmpuja1: 9.4, gFrota0: 9.55, gFrota1: 10.4, gCuernos0: 10.75, gCuernos1: 11.05, gMiraMano: 12.0, gIlumina: 12.25,
    // los dos
    arriba: 12.5, camara: 13.15, guinoS: 13.45, fin: 13.95
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
  const CUERNOS = D5(0, 1, 0, 0, 1);                       // índice y meñique
  const CUERNOS_MAL = D5(0, 1, 1, 0, 1);                   // con el corazón también (mal)
  const SENALA = D5(0, 1, 0, 0, 0);
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });

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

  // bolsillos de Guillermo (muñecas del avatar → centro del puño), como en 00070 / 00101
  const R_M = G.MUNECA_R * G.JK;
  const manoDesde = (m, mu) => P(m.x - Math.cos(mu) * R_M, m.y - Math.sin(mu) * R_M);
  const BOLS_GC = manoDesde(P(131, 652), -1.75), BOLS_GL = manoDesde(P(372, 648), -1.75);

  /* ---------- manos ----------
   * { h: [x, y] } punto del tronco (hoja, sin inclinar) con mu relativo al tronco,
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
      return { x: q.x, y: q.y, mu: o.mu + p.torso, ang: 0, puno: o.puno ?? 1, dedos: o.dedos, dobla: o.dobla ?? (lado === "cerca" ? -1 : 1), doblaYa: o.doblaYa };
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
  // doblaYa: el codo cambia de lado al empezar el tramo (se usa saliendo de una pose con el brazo estirado del todo)
  const mezMano = (a, d, k) => ({ x: lerp(a.x, d.x, k), y: lerp(a.y, d.y, k), mu: lerp(a.mu, d.mu, k), ang: 0, puno: lerp(a.puno, d.puno, k),
    dedos: DD(a.dedos, d.dedos, k), dobla: (d.doblaYa ? k > 0 : k >= 0.5) ? d.dobla : a.dobla });
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
    const a = 0.26 * Math.sin(Math.PI * u) - 0.08 * Math.sin(TAU * u);
    return { x, h, a };
  }
  function aPierna(R, p, w, lado) {
    const tob = R.SUELO - R.TOBILLO_ALTO;
    return { tob: P(R.aHoja(p, P(w.x, 0)).x, tob - (lado === "lejos" ? 12 : 0) - w.h / (p.s * (R.K || 1))), ang: w.a };
  }

  /* Curva por claves [t, v1, v2, …] (Hermite con tangentes de Catmull-Rom; quieta en los extremos). */
  function curva(claves, t) {
    const n = claves.length;
    if (t <= claves[0][0]) return claves[0].slice(1);
    if (t >= claves[n - 1][0]) return claves[n - 1].slice(1);
    let i = 0; while (claves[i + 1][0] < t) i++;
    const k0 = claves[Math.max(0, i - 1)], k1 = claves[i], k2 = claves[i + 1], k3 = claves[Math.min(n - 1, i + 2)];
    const h = k2[0] - k1[0], u = (t - k1[0]) / h, u2 = u * u, u3 = u2 * u, out = [];
    for (let j = 1; j < k1.length; j++) {
      const m1 = i > 0 ? (k2[j] - k0[j]) / (k2[0] - k0[0]) * h : 0, m2 = i + 2 < n ? (k3[j] - k1[j]) / (k3[0] - k1[0]) * h : 0;
      out.push((2 * u3 - 3 * u2 + 1) * k1[j] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * k2[j] + (u3 - u2) * m2);
    }
    return out;
  }

  const MEMO = new Map();
  const memo = (c, f) => { if (MEMO.has(c)) return MEMO.get(c); if (MEMO.size > 80) MEMO.clear(); const v = f(); MEMO.set(c, v); return v; };

  /* =====================================================================================
   * SARA (delante, a la derecha; mira al escenario, a la derecha)
   * ===================================================================================== */
  const XS = 540, SUELO_S = 506, ESC_S = 0.315;

  // cabeceo de Sara: abajo en el golpe, arriba a contratiempo (coseno: sin saltos)
  function cabeceoS(t) {
    const k = tramo(t, T.sBang0, T.sBang0 + 0.5) * (1 - tramo(t, T.carga0 - 0.1, T.carga0 + 0.1));
    const φ = fasePulso(t);
    const onda = Math.cos(TAU * φ);                 // +1 en el golpe (abajo), −1 a contratiempo (arriba)
    return { k, φ, ang: k * (0.2 + 0.36 * Math.pow((onda + 1) / 2, 1.3) - 0.12), onda };
  }
  // el cabezazo grande (ángulo de la cabeza): baja del todo, aguanta y latigazo hacia atrás (poco: lo
  // que vuela es la melena; así su cabeza no choca con la de Guillermo)
  const CLAVES_CAB = [[8.0, 0.44], [8.18, 0.22], [8.62, 0.8], [8.72, 0.82], [8.86, -0.12], [9.02, -0.18], [9.28, -0.08], [9.65, 0]];
  const envCabezazo = t => tramo(t, 8.0, 8.12) * (1 - tramo(t, 9.5, 9.7));

  const CS0 = { pel: 0, torso: 0, cab: 0, cdy: 0 };
  const CSo = o => Object.assign({}, CS0, o);
  const CUERPOS_S = {
    quieto: CSo({ pel: 6, torso: 0.02, cab: 0.02 }),
    bang: CSo({ pel: 26, torso: 0.1, cab: 0 }),
    carga: CSo({ pel: 52, torso: 0.3, cab: 0 }),
    latigo: CSo({ pel: 20, torso: -0.05, cab: 0 }),
    para: CSo({ pel: 8, torso: -0.02, cab: -0.04 }),
    mira: CSo({ pel: 8, torso: -0.06, cab: -0.1 }),
    cuernos: CSo({ pel: 10, torso: -0.08, cab: -0.08 }),
    alarga: CSo({ pel: 14, torso: -0.16, cab: -0.1 }),
    arriba: CSo({ pel: 18, torso: -0.04, cab: -0.08 }),
    camara: CSo({ pel: 14, torso: -0.04, cab: -0.04 })
  };
  const GUION_CUERPO_S = [
    [T.sBang0, T.sBang0 + 0.4, "bang"], [T.carga0, T.carga1, "carga"], [T.carga1 + 0.08, T.latigo, "latigo"],
    [T.hit + 0.05, T.sPara + 0.3, "para"], [T.sMira, T.sMira + 0.35, "mira"], [T.sCuernos0, T.sCuernos1, "cuernos"],
    [T.sAlarga0, T.sToca, "alarga"], [T.sSuelta, T.sSuelta + 0.3, "cuernos"], [T.arriba - 0.1, T.arriba + 0.2, "arriba"], [T.camara, T.camara + 0.3, "camara"]
  ];
  const CARAS_S = {
    neutra: E({ mx: 0.6, my: 0.1, c: 0.3, sd: 0, si: 0, abre: 0, ancho: 0.8, sonr: 0.05 }),
    rock: E({ c: 1, sd: 8, si: 8, abre: 12, ancho: 0.8, sonr: 0.35 }),
    carga: E({ c: 1, z: 0.5, sd: 14, si: 14, abre: 22, ancho: 0.85, sonr: 0.2 }),
    latigo: E({ c: 1, z: 0.3, sd: 16, si: 16, abre: 30, ancho: 0.9, sonr: 0.3 }),
    para: E({ mx: 0.2, my: 0.1, c: 0.25, sd: 4, si: 4, abre: 0, ancho: 0.8, sonr: 0.1 }),
    reojo: E({ mx: -1, my: 0.15, c: 0.42, sd: -2, gd: 0.04, si: 6, gi: -0.04, abre: 0, ancho: 0.7, sonr: 0 }),
    cuernos: E({ mx: -1, my: 0.05, c: 0.38, sd: 2, si: 10, gi: -0.06, abre: 0, ancho: 0.75, sonr: 0.2 }),
    corrige: E({ mx: -0.9, my: 0.35, c: 0.45, sd: 0, si: 4, abre: 0, ancho: 0.7, sonr: 0.05 }),
    arriba: E({ mx: 0.7, my: -0.3, c: 0.15, sd: 10, si: 10, abre: 20, ancho: 0.85, sonr: 0.55 }),
    camara: E({ mx: -0.25, my: 0.05, c: 0.32, sd: 2, si: 9, gi: -0.05, abre: 0, ancho: 0.8, sonr: 0.45 })
  };
  const GUION_CARA_S = [
    [T.sBang0 + 0.1, T.sBang0 + 0.35, "rock"], [T.carga0, T.carga0 + 0.2, "carga"], [T.carga1 + 0.1, T.latigo, "latigo"],
    [T.hit + 0.2, T.sPara + 0.2, "para"], [T.sMira, T.sMira + 0.25, "reojo"], [T.sCuernos0, T.sCuernos0 + 0.3, "cuernos"],
    [T.sAlarga0, T.sAlarga0 + 0.3, "corrige"], [T.sSuelta, T.sSuelta + 0.25, "cuernos"], [T.arriba - 0.1, T.arriba + 0.2, "arriba"], [T.camara, T.camara + 0.3, "camara"]
  ];
  const PARP_S = [0.45, 9.55, 10.95, 12.85];

  // cuerpo de Sara (sin cara ni manos): lo usan la pose, la melena y su estela
  function cuerpoS(t) { return memo("c" + t, () => cuerpoS0(t)); }
  function cuerpoS0(t) {
    const b = guion(GUION_CUERPO_S, CUERPOS_S, "quieto", t);
    const respira = Math.sin(t * 2.0 + 0.4);
    const cb = cabeceoS(t), kz = envCabezazo(t);
    const o = (cb.onda + 1) / 2;
    // rodillas al compás (más al cabecear; luego bota con los cuernos)
    const bote = cb.k * 14 * o + tramo(t, T.arriba, T.arriba + 0.2) * 12 * pulso(t);
    const p = {
      x: XS, suelo: SUELO_S, s: ESC_S, espejo: false, tirasLimpias: true,
      pelvis: { x: S.PELVIS.x - 6 * cb.k * o, y: S.PELVIS.y + b.pel + respira * 1.2 + bote },
      torso: b.torso + 0.12 * cb.k * o + 0.01 * Math.sin(t * 1.3), torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + lerp(cb.ang, kz > 0 ? curva(CLAVES_CAB, t)[0] : 0, kz), dx: 0, dy: b.cdy + 6 * cb.k * o, esc: { x: 1, y: 1 } }
    };
    // pies: plantados, abiertos
    p.piernas.cerca = aPierna(S, p, { x: XS - 30, h: 0, a: 0 }, "cerca");
    p.piernas.lejos = aPierna(S, p, { x: XS + 34, h: 0, a: 0 }, "lejos");
    p.cb = cb;
    return p;
  }
  function poseS(t) { return memo("s" + t, () => poseS0(t)); }
  function poseS0(t) {
    const p = Object.assign({}, cuerpoS(t)), cb = p.cb;
    // cara
    const e = guion(GUION_CARA_S, CARAS_S, "neutra", t);
    if (cb.k > 0.02) e.abre += 6 * cb.k * Math.max(0, cb.onda);
    p.cara = cara(e, parpadeo(t, PARP_S));
    if (t > T.guinoS) { const k = campana(t, T.guinoS, T.guinoS + 0.55); p.cara.ojos.i = Math.max(p.cara.ojos.i, k); }
    // la cruz del collar se columpia con la melena (personaje.js: giro −inercia·0,25)
    const [a1] = anguloMelena(t, p);
    p.pelo = { viento: 0, inercia: clamp(-(a1 - 0.45 * p.cabeza.ang) * 1.3 + 0.6 * cb.k * Math.sin(TAU * (cb.φ - 0.1)), -3.2, 3.2) };
    manosS(p, t, cb);
    return p;
  }

  /* ---------- la melena de Sara: la dibuja la escena ----------
   * Las dos tiras del rig (melena_atras, espejada, detrás de la cabeza; melena, junto a la cara) con
   * ángulos de pantalla propios: 0 = colgando, + hacia atrás (izquierda), − hacia delante. Al cabecear
   * vuela en grandes arcos (la punta va más retrasada que la raíz); en el cabezazo sale por encima de
   * la cabeza y cae justo sobre la cara de Guillermo. */
  const MEL_S = [
    { pieza: "melena_atras", raiz: P(565, 615), sg: -1, esc: 0.98, abre: 0.07 },
    { pieza: "melena", raiz: P(990, 615), sg: 1, esc: 1, abre: -0.07 }
  ];
  const LARGO_MEL = 488.18;
  // punto de la curva de la tira (unidades del retrato, ángulos de pantalla) a la fracción f
  function puntoTira(b1, b2, est, f) {
    const L = LARGO_MEL, sj = L * 0.45, r = L * 0.4, n = 24, m = Math.max(1, Math.round(n * f));
    let x = 0, y = 0;
    for (let i = 0; i < m; i++) { const s = L * (i + 0.5) / n, a = b1 + (b2 - b1) * suave((s - (sj - r)) / (2 * r)); x += -Math.sin(a) * L / n * est; y += Math.cos(a) * L / n * est; }
    return P(x, y);
  }
  // claves del latigazo: la punta cae sobre la cara de Guillermo (se calcula una vez con las dos poses)
  let CLAVES_PELO = null;
  function clavesPelo() {
    if (CLAVES_PELO) return CLAVES_PELO;
    const cs = cuerpoS(T.hit), H = S.cabeza(cs), m = MEL_S[0];
    const raiz = S.aPantalla(cs, H.a(m.raiz));
    const pg = poseG(T.hit), cara = G.aPantalla(pg, G.cabeza(pg).a(CARA_G));
    const d = Math.hypot(cara.x - raiz.x, cara.y - raiz.y), esc = H.kx * m.esc * cs.s * S.K;
    // con la curva (raíz más vertical que la punta) busca el punto que queda a la distancia d y gira
    const dob = 0.22, est = 1.15;
    let f = 1; for (let k = 4; k <= 24; k++) { const q = puntoTira(-dob, 0, est, k / 24); if (Math.hypot(q.x, q.y) * esc >= d) { f = k / 24; break; } }
    const q = puntoTira(-dob, 0, est, f);
    const θ = Math.atan2(-(cara.x - raiz.x), cara.y - raiz.y) - Math.atan2(-q.x, q.y) - m.abre;
    CLAVES_PELO = [
      [8.10, -0.25, -0.8, 1], [8.36, 0.2, 0.15, 1], [8.62, -0.08, -0.45, 1], [8.74, -0.02, -0.3, 1],
      [8.86, 1.35, 0.6, 1.06], [8.93, θ - dob + 0.05, θ + 0.4, 1.18], [T.hit, θ - dob, θ, est],
      [T.hit + 0.08, θ - dob - 0.12, θ - 0.08, 1.1], [T.hit + 0.2, 1.05, 0.85, 1.03], [T.hit + 0.36, 0.12, -0.12, 1],
      [T.hit + 0.55, -0.16, -0.42, 1], [T.hit + 0.8, 0.14, 0.2, 1], [T.hit + 1.05, 0.0, -0.06, 1], [T.hit + 1.3, 0, 0.01, 1]
    ];
    CLAVES_PELO.info = { d, largo: LARGO_MEL * esc * est, f, θ };
    return CLAVES_PELO;
  }
  function anguloMelena(t, cs) {
    const cb = cs.cb, φ = cb.φ, kb = cb.k, Ha = cs.cabeza.ang;
    const bal = 0.03 * Math.sin(t * 1.3) + 0.018 * Math.sin(t * 2.9 + 1);
    const kA = tramo(t, T.arriba, T.arriba + 0.3);
    let a1 = 0.45 * Ha + bal * 0.5 + kb * (0.25 - 0.75 * Math.cos(TAU * (φ - 0.12))) - kA * 0.12 * Math.cos(TAU * (φ - 0.15));
    let a2 = 0.15 * Ha + bal * 1.5 + kb * (0.35 - 1.3 * Math.cos(TAU * (φ - 0.22))) - kA * 0.3 * Math.cos(TAU * (φ - 0.25));
    let est = 1 + kb * 0.05 * (0.5 - 0.5 * Math.cos(TAU * (φ - 0.22)));
    // al girarse hacia Guillermo la melena le cae por detrás del hombro (deja libre la mano de él)
    const kT = tramo(t, T.sMira - 0.25, T.sMira + 0.35);
    a1 -= 0.4 * kT; a2 -= 0.46 * kT;
    const kz = tramo(t, 8.0, 8.14) * (1 - tramo(t, T.hit + 1.05, T.hit + 1.4));
    if (kz > 0) { const [z1, z2, ze] = curva(clavesPelo(), t); a1 = lerp(a1, z1, kz); a2 = lerp(a2, z2, kz); est = lerp(est, ze, kz); }
    return [a1, a2, est];
  }
  // punta (o un punto, fracción f) de la tira de atrás en pantalla
  function puntaMelena(t, f = 1) {
    const cs = cuerpoS(t), H = S.cabeza(cs), [a1, a2, est] = anguloMelena(t, cs), m = MEL_S[0];
    const q = puntoTira(a1 + m.abre, a2 + m.abre * 1.5, est, f), r = H.a(m.raiz), e = H.kx * m.esc;
    return S.aPantalla(cs, P(r.x + q.x * e, r.y + q.y * e));
  }
  const TIRA = Recortes.tira, SIN_MELENA = new Set(["melena", "melena_atras"]);
  function dibMelenaS(g, ps, t) {
    const H = S.cabeza(ps), A = S.A, k = ps.s * S.K, [a1, a2, est] = anguloMelena(t, ps);
    g.save(); g.translate(ps.x, ps.suelo); g.scale(k, k); g.translate(-S.PELVIS.x, -S.SUELO);
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
    for (const m of MEL_S) {
      const r = H.a(m.raiz), L = LARGO_MEL;
      const c = { raiz: P(0, 0), a1: m.sg * (a1 + m.abre), a2: m.sg * (a2 + m.abre * 1.5), L, sj: L * 0.45, r: L * 0.4, estira: est, cuna: true, cunaAjustada: true };
      g.save(); g.translate(r.x, r.y); g.scale(m.sg * H.kx * m.esc, H.ky * m.esc);
      TIRA(g, A, m.pieza, c, 14);
      g.restore();
    }
    g.restore();
  }
  // Sara: su melena primero (por encima de Guillermo, por debajo de ella) y el muñeco sin la del rig
  function dibujaSara(g, ps, t) {
    dibMelenaS(g, ps, t);
    Recortes.tira = function (gg, AA, n) { return AA === S.A && SIN_MELENA.has(n) ? [] : TIRA.apply(this, arguments); };
    try { S.dibujar(g, ps, t); } finally { Recortes.tira = TIRA; }
  }

  function manosS(p, t, cb) {
    const rC = resolutor(S, p, "cerca"), rL = resolutor(S, p, "lejos");
    const bols = { c: { bols: true }, l: { bols: true } };
    const punos = { c: HM(150, 600, -2.1, PUNO, -1), l: HM(390, 590, -2.4, PUNO, 1) };
    const para = { c: { bols: true }, l: { bols: true } };
    // cuernos para enseñárselos a Guillermo (la mano cercana, junto a su cabeza, por encima de la de él)
    const cuernos = { c: HM(15, 125, 1.8, CUERNOS, -1) };
    // corrige: el índice de Sara baja el dedo corazón de Guillermo (pantalla, se calcula con su mano)
    const alarga = { scr: () => puntaCorrige(t, 0), mu: -0.55, dedos: SENALA, dobla: -1 };
    const toca = { scr: () => puntaCorrige(t, 1), mu: -0.55, dedos: SENALA, dobla: -1 };
    const arribaC = HM(70, 70, 1.9, CUERNOS, -1);
    const arribaL = HM(560, 50, 2.0, CUERNOS, 1);
    const pistaC = [[0, 0, bols.c], [T.sBang0 + 0.1, T.sBang0 + 0.5, punos.c], [T.hit + 0.2, T.sPara + 0.3, para.c],
      [T.sCuernos0, T.sCuernos1, cuernos.c, salida], [T.sAlarga0, T.sAlarga0 + 0.22, alarga], [T.sAlarga0 + 0.22, T.sToca, toca],
      [T.sSuelta, T.sSuelta + 0.3, cuernos.c], [T.arriba - 0.12, T.arriba + 0.15, arribaC, salida]];
    const pistaL = [[0, 0, bols.l], [T.sBang0 + 0.15, T.sBang0 + 0.55, punos.l], [T.hit + 0.2, T.sPara + 0.3, para.l],
      [T.arriba - 0.1, T.arriba + 0.18, arribaL, salida]];
    let C = pista(pistaC, t, rC), L = pista(pistaL, t, rL);
    // puños al compás mientras cabecea
    if (cb.k > 0.01 && t < T.carga1) { const o = (cb.onda + 1) / 2; C = conMano(C, 8 * o * cb.k, 10 * o * cb.k); L = conMano(L, 6 * o * cb.k, 12 * o * cb.k); }
    // cuernos arriba: botan con el compás
    const kA = tramo(t, T.arriba, T.arriba + 0.2);
    if (kA > 0) { const o = pulso(t); C = conMano(C, 0, -14 * o * kA); L = conMano(L, 0, -14 * o * kA); }
    p.manoCerca = C; p.manoLejos = L;
  }

  /* =====================================================================================
   * GUILLERMO (detrás, a la izquierda; mira al escenario, a la derecha)
   * ===================================================================================== */
  const XG = 320, SUELO_G = 488, ESC_G = 0.3;
  const CARA_G = P(830, 640);                 // centro de su cara en el retrato (entre ojos, nariz y boca)

  // su cabeceo: rígido, al compás; luego al doble y más fuerte
  function cabeceoG(t) {
    const k1 = tramo(t, T.gBang0 - 0.25, T.gBang0) * (1 - tramo(t, T.gBang1 - 0.1, T.gBang1 + 0.15));
    const k2 = tramo(t, T.gFuerte0 - 0.15, T.gFuerte0) * (1 - tramo(t, T.gFuerte1 - 0.1, T.gFuerte1 + 0.2));
    const φ1 = fasePulso(t), φ2 = fasePulso(t, 2);
    const o1 = Math.cos(TAU * φ1), o2 = Math.cos(TAU * φ2);
    return { k1, k2, ang: k1 * (0.12 + 0.2 * o1) + k2 * (0.18 + 0.36 * o2), onda: k1 * o1 + k2 * o2, kk: Math.max(k1, k2) };
  }

  const CG0 = { pel: 0, torso: 0.02, cab: 0.04, cdy: 0, dx: 0 };
  const CGc = o => Object.assign({}, CG0, o);
  const CUERPOS_G = {
    quieto: CGc({ pel: 6, torso: 0.02, cab: 0.02 }),
    flipa: CGc({ pel: 4, torso: -0.06, cab: -0.08 }),
    decide: CGc({ pel: 12, torso: 0.06, cab: 0.04 }),
    bang: CGc({ pel: 18, torso: 0.08, cab: 0 }),
    miraPelo: CGc({ pel: 8, torso: -0.04, cab: -0.12 }),
    pica: CGc({ pel: 16, torso: 0.1, cab: 0.06 }),
    fuerte: CGc({ pel: 30, torso: 0.16, cab: 0 }),
    mareo: CGc({ pel: 22, torso: 0.04, cab: 0.04 }),
    crack: CGc({ pel: 26, torso: 0.08, cab: 0.3 }),
    asoma: CGc({ pel: 22, torso: 0.2, cab: 0.18, dx: 18 }),
    golpe: CGc({ pel: 30, torso: -0.3, cab: -0.42, dx: -10 }),
    aturdido: CGc({ pel: 14, torso: -0.12, cab: -0.14 }),
    frota: CGc({ pel: 10, torso: -0.04, cab: -0.04 }),
    cuernos: CGc({ pel: 10, torso: 0.06, cab: 0.02 }),
    miraMano: CGc({ pel: 12, torso: 0.04, cab: 0.1 }),
    arriba: CGc({ pel: 14, torso: -0.04, cab: -0.08 }),
    camara: CGc({ pel: 12, torso: 0, cab: -0.02 })
  };
  const GUION_CUERPO_G = [
    [T.gFlipa, T.gFlipa + 0.3, "flipa"], [T.gDecide, T.gDecide + 0.25, "decide"], [T.gBang0 - 0.2, T.gBang0, "bang"],
    [T.gMiraPelo, T.gMiraPelo + 0.25, "miraPelo"], [T.gPica, T.gPica + 0.2, "pica"], [T.gFuerte0 - 0.15, T.gFuerte0, "fuerte"],
    [T.gMareo, T.gMareo + 0.35, "mareo"], [T.gCrack, T.gCrack + 0.06, "crack", salida], [T.gAsoma, T.carga1 + 0.2, "asoma"],
    [T.hit, T.hit + 0.08, "golpe", salida], [T.hit + 0.35, T.gEmpuja1 + 0.2, "aturdido"], [T.gFrota0, T.gFrota0 + 0.3, "frota"],
    [T.gCuernos0, T.gCuernos1, "cuernos"], [T.gMiraMano, T.gMiraMano + 0.25, "miraMano"], [T.arriba - 0.1, T.arriba + 0.2, "arriba"],
    [T.camara, T.camara + 0.3, "camara"]
  ];
  const CARAS_G = {
    quieto: E({ mx: 0.9, my: 0.05, c: 0.12, sd: 4, si: 4, abre: 0, ancho: 0.6, sonr: 0.25 }),
    flipa: E({ mx: 0.95, my: 0.15, iris: 0.9, sd: 26, si: 26, abre: 26, ancho: 0.6, sonr: 0.35 }),
    decide: E({ mx: 0.6, my: 0.05, c: 0.25, sd: -8, gd: -0.18, si: -6, gi: -0.16, abre: 4, ancho: 0.95, sonr: 0.75 }),
    bang: E({ c: 1, z: 0.3, sd: 10, si: 10, abre: 16, ancho: 0.8, sonr: 0.35 }),
    miraPelo: E({ mx: 0.1, my: -1, iris: 0.85, sd: 22, gd: 0.1, si: 22, gi: 0.1, abre: 6, ancho: 0.55, sonr: -0.2 }),
    pica: E({ mx: 0.8, my: 0.1, c: 0.3, sd: -12, gd: -0.22, si: -10, gi: -0.2, abre: 0, ancho: 0.7, sonr: -0.2 }),
    fuerte: E({ c: 1, z: 1, sd: 22, gd: -0.1, si: 22, gi: -0.1, abre: 34, ancho: 0.95, sonr: 0.3, lengua: 1 }),
    mareo: E({ esp: 1, sd: 10, gd: 0.18, si: 10, gi: 0.18, abre: 16, ancho: 0.8, sonr: 0.3, lengua: 1 }),
    crack: E({ c: 1, z: 1, sd: 24, gd: 0.15, si: 24, gi: 0.15, abre: 26, ancho: 0.9, sonr: -0.5 }),
    asoma: E({ mx: 0.95, my: 0.2, c: 0.2, z: 0.3, sd: 16, gd: 0.12, si: 16, gi: 0.12, abre: 10, ancho: 0.6, sonr: -0.25 }),
    golpe: E({ c: 1, z: 1, sd: 18, si: 18, abre: 30, ancho: 0.9, sonr: -0.5 }),
    aturdido: E({ esp: 0.8, sd: 12, gd: 0.15, si: 12, gi: 0.15, abre: 12, ancho: 0.7, sonr: -0.1 }),
    frota: E({ mx: 0.9, my: 0.05, c: 0.35, sd: 14, gd: 0.15, si: 14, gi: 0.15, abre: 6, ancho: 0.6, sonr: -0.35 }),
    cuernos: E({ mx: 0.9, my: -0.1, c: 0.1, sd: 18, si: 18, abre: 24, ancho: 0.95, sonr: 0.9 }),
    miraMano: E({ mx: 0.9, my: 0.45, iris: 0.9, sd: 22, si: 22, abre: 14, ancho: 0.7, sonr: 0.45 }),
    ilumina: E({ mx: 0.85, my: 0.3,  c: 0.2, h: 0.6, sd: 20, si: 20, abre: 26, ancho: 1, sonr: 1 }),
    arriba: E({ mx: 0.9, my: -0.4, c: 0.15, sd: 16, si: 16, abre: 34, ancho: 1, sonr: 0.8 }),
    camara: E({ mx: -0.35, my: 0.08, c: 0.2, h: 0.4, sd: 14, si: 10, abre: 22, ancho: 0.95, sonr: 0.95 })
  };
  const GUION_CARA_G = [
    [T.gFlipa, T.gFlipa + 0.15, "flipa"], [T.gDecide, T.gDecide + 0.2, "decide"], [T.gBang0 - 0.1, T.gBang0 + 0.05, "bang"],
    [T.gMiraPelo, T.gMiraPelo + 0.2, "miraPelo"], [T.gPica, T.gPica + 0.2, "pica"], [T.gFuerte0 - 0.1, T.gFuerte0 + 0.05, "fuerte"],
    [T.gMareo, T.gMareo + 0.25, "mareo"], [T.gCrack, T.gCrack + 0.04, "crack", salida], [T.gAsoma, T.gAsoma + 0.3, "asoma"],
    [T.hit, T.hit + 0.04, "golpe", salida], [T.hit + 0.3, T.hit + 0.5, "aturdido"], [T.gFrota0 + 0.2, T.gFrota0 + 0.5, "frota"],
    [T.gCuernos0, T.gCuernos0 + 0.25, "cuernos"], [T.gMiraMano, T.gMiraMano + 0.2, "miraMano"], [T.gIlumina, T.gIlumina + 0.2, "ilumina"],
    [T.arriba - 0.05, T.arriba + 0.2, "arriba"], [T.camara, T.camara + 0.3, "camara"]
  ];
  const PARP_G = [0.6, 2.2, 10.3, 12.95];

  const PASOS_G = {
    cerca: [[-9, XG - 26, T.gAsoma + 9.12], [T.gAsoma + 0.42, XG + 4, T.hit - T.gAsoma - 0.42], [T.hit + 0.14, XG - 26, T.gFrota1 - T.hit - 0.04],
      [T.gFrota1 + 0.35, XG + 12]],
    lejos: [[-9, XG + 26, T.gAsoma + 9], [T.gAsoma + 0.3, XG + 56, T.hit + 0.1 - T.gAsoma - 0.3], [T.hit + 0.3, XG + 30, T.gFrota1 - T.hit - 0.3],
      [T.gFrota1 + 0.25, XG + 64]]
  };
  function poseG(t) { return memo("g" + t, () => poseG0(t)); }
  function poseG0(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "quieto", t);
    const respira = Math.sin(t * 2.1);
    const cb = cabeceoG(t), φ = fasePulso(t);
    const mareo = tramo(t, T.gMareo - 0.1, T.gMareo + 0.25) * (1 - tramo(t, T.gCrack - 0.05, T.gCrack + 0.15));
    const wob = mareo * Math.sin((t - T.gMareo) * 7.5);
    const crack = campana(t, T.gCrack - 0.02, T.gCrack + 0.12);
    const golpe = campana(t, T.hit - 0.01, T.hit + 0.35);
    const atur = tramo(t, T.hit + 0.2, T.hit + 0.4) * (1 - tramo(t, T.gFrota0, T.gFrota0 + 0.4));
    const bote = 10 * (cb.k1 * (Math.cos(TAU * φ) + 1) / 2 + cb.k2 * (Math.cos(TAU * fasePulso(t, 2)) + 1) / 2) + tramo(t, T.arriba, T.arriba + 0.2) * 14 * pulso(t)
      + tramo(t, 0.5, 1.0) * (1 - tramo(t, T.gFlipa, T.gFlipa + 0.3)) * 4 * pulso(t);
    const p = {
      x: XG, suelo: SUELO_G, s: ESC_G, espejo: false, tirasLimpias: true, ikContinuo: false,
      hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x + b.dx + 14 * wob, y: G.PELVIS.y + b.pel + respira * 1.2 + bote },
      torso: b.torso + 0.1 * cb.k2 * (cb.onda + 1) / 2 + 0.06 * wob + 0.08 * golpe * 0, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + cb.ang + 0.16 * wob + 0.12 * crack + 0.05 * atur * Math.sin(t * 6), dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } }
    };
    // pies: un paso hacia Sara para asomarse, otro atrás con el latigazo y otro adelante con los cuernos
    const pasos = PASOS_G;
    let wC = pieDe(pasos.cerca, t, { alto: 22, apoyo: 0.02 }), wL = pieDe(pasos.lejos, t, { alto: 22, apoyo: 0.02 });
    if (mareo > 0) { wC = Object.assign({}, wC, { x: wC.x + 6 * wob }); wL = Object.assign({}, wL, { x: wL.x - 4 * wob }); }
    p.piernas.cerca = aPierna(G, p, wC, "cerca"); p.piernas.lejos = aPierna(G, p, wL, "lejos");
    // el cuerpo va con los pies
    p.x = XG + 30 * tramo(t, T.gAsoma, T.gAsoma + 0.42) - 26 * tramo(t, T.hit, T.hit + 0.3) + 34 * tramo(t, T.gFrota1, T.gFrota1 + 0.35);
    // cara
    const e = guion(GUION_CARA_G, CARAS_G, "quieto", t);
    if (cb.kk > 0.05) e.abre += 6 * Math.max(0, cb.onda);
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.sudor = 0.8 * tramo(t, T.gFuerte0 + 0.4, T.gFuerte0 + 0.8) * (1 - tramo(t, T.gCuello, T.gAsoma + 0.3));
    p.enfado = tramo(t, T.gPica, T.gPica + 0.15) * (1 - tramo(t, T.gFuerte0 + 0.3, T.gFuerte0 + 0.6));
    p.rojo = 0.35 * tramo(t, T.gPica, T.gPica + 0.2) * (1 - tramo(t, T.gFuerte0 + 0.3, T.gFuerte0 + 0.6));
    manosG(p, t, cb);
    p.capaCabeza = (g, tt) => capaG(g, tt, p);
    p.cb = cb; p.golpe = golpe;
    return p;
  }

  function manosG(p, t, cb) {
    const rC = resolutor(G, p, "cerca"), rL = resolutor(G, p, "lejos");
    const bols = { c: { bols: true }, l: { bols: true } };
    const punos = { c: HM(150, 610, -2.05, PUNO, -1), l: HM(380, 600, -2.35, PUNO, 1) };
    const cuello = { c: HM(210, 300, -0.4, D5(0.6, 0.8, 0.8, 0.8, 0.8), -1) };
    const mejilla = { c: HM(250, 150, -0.6, D5(0.6, 0.9, 0.9, 0.9, 0.9), -1) };
    // cuernos mal, con la mano lejana delante del pecho (antebrazo de pie, codo abajo: nada le cruza la cara).
    // La mano sale del bolsillo con el brazo estirado hacia delante y abajo (ahí el codo cambia de lado sin
    // salto) y sube. Los mu van con una vuelta menos (−2π) para girar la muñeca por el camino corto.
    const estira = { l: HM(529, 647, -2.09, TODOS(0.45), 1) };
    const cuernosMal = { l: Object.assign(HM(490, 368, 2.0 - TAU, CUERNOS_MAL, -1), { doblaYa: true }) };
    const miraMano = { l: HM(522, 330, 2.1 - TAU, CUERNOS, -1) };
    const arribaL = HM(555, 160, 2.1 - TAU, CUERNOS, -1);
    const pistaC = [[0, 0, bols.c], [T.gDecide, T.gDecide + 0.25, punos.c], [T.gCuello - 0.05, T.gCuello + 0.15, cuello.c, salida],
      [T.hit + 0.05, T.hit + 0.2, punos.c], [T.gFrota0, T.gFrota0 + 0.25, mejilla.c], [T.gFrota1, T.gFrota1 + 0.3, bols.c]];
    const pistaL = [[0, 0, bols.l], [T.gDecide + 0.05, T.gDecide + 0.3, punos.l], [T.hit + 0.1, T.hit + 0.3, bols.l],
      [T.gCuernos0 - 0.2, T.gCuernos0 + 0.02, estira.l], [T.gCuernos0 + 0.02, T.gCuernos1 + 0.05, cuernosMal.l, salida],
      [T.gMiraMano, T.gMiraMano + 0.3, miraMano.l], [T.arriba - 0.12, T.arriba + 0.15, arribaL, salida]];
    let C = pista(pistaC, t, rC), L = pista(pistaL, t, rL);
    // puños al compás
    if (cb.kk > 0.01) { const o = (cb.onda / Math.max(0.01, cb.kk) + 1) / 2; C = conMano(C, 6 * o * cb.kk, 10 * o * cb.kk); L = conMano(L, 6 * o * cb.kk, 10 * o * cb.kk); }
    // se frota la mejilla
    if (t > T.gFrota0 + 0.2 && t < T.gFrota1) C = conMano(C, 10 * Math.sin((t - T.gFrota0) * 14), 4 * Math.cos((t - T.gFrota0) * 14));
    // el dedo corazón se dobla cuando Sara lo empuja
    // (Sara lo empuja hasta la mitad y el resto cae solo: así su mano no tapa el meñique)
    const empuja = tramo(t, T.sToca, T.sToca + 0.18), cae = tramo(t, T.sToca + 0.15, T.sBaja);
    if (t > T.gCuernos0 && t < T.gMiraMano + 0.3) {
      L = Object.assign({}, L, { dedos: Object.assign({}, L.dedos, { medio: L.dedos.medio * (1 - 0.55 * empuja - 0.45 * cae) }) });
      L = conMano(L, 0, 6 * empuja - 6 * tramo(t, T.sBaja, T.sSuelta));
    }
    const kA = tramo(t, T.arriba, T.arriba + 0.2);
    if (kA > 0) { const o = pulso(t); L = conMano(L, 0, -14 * o * kA); }
    p.manoCerca = C; p.manoLejos = L;
  }

  // puntas de los dedos (mano de Personaje2D.mano: base y largo de cada dedo, se acortan al doblarse)
  const DEDOS_P2D = { indice: [6.9, 14.5, 0.17], medio: [2.3, 16, 0.05], anular: [-2.3, 15, -0.07], menique: [-6.7, 12, -0.2] };
  const BORDE_DEDO = 5.3 / 2 + 1.9 - 0.6;          // de la línea del dedo al borde de la tinta (menos un poco: contacto)
  function puntaDedo(m, n) {
    const d = m.dedos, e = k => clamp(d[k] ?? 0), abre = (e("indice") + e("medio") + e("anular") + e("menique")) / 4;
    const [x, L, ab] = DEDOS_P2D[n], ang = ab * (0.4 + 0.9 * abre), largo = 3.2 + (L - 3.2) * Math.pow(e(n), 0.85) + BORDE_DEDO;
    return M2.rot(P(x + Math.sin(ang) * largo, 4.5 + Math.cos(ang) * largo), m.mu + Math.PI / 2);
  }
  // punta del dedo corazón de Guillermo (pantalla): ahí apoya Sara el índice, y lo sigue mientras se dobla
  function puntaCorazon(t, minimo = 0) {
    const pg = poseG(t), m0 = pg.manoLejos;
    const m = Object.assign({}, m0, { dedos: Object.assign({}, m0.dedos, { medio: Math.max(m0.dedos.medio, minimo) }) }), q = puntaDedo(m, "medio");
    return G.aPantalla(pg, P(m.x + q.x * G.JK, m.y + q.y * G.JK));
  }
  // centro de la mano de Sara para que la punta de su índice quede justo sobre ese dedo
  function puntaCorrige(t, k) {
    const c = puntaCorazon(t, 0.45), q = puntaDedo({ mu: -0.55, dedos: SENALA }, "indice"), kk = S.JK * 0.86 * ESC_S * S.K;
    const sobre = lerp(16, 0, k);                           // antes de tocar, un poco más arriba
    return P(c.x - q.x * kk + sobre * 0.5, c.y - q.y * kk - sobre);
  }

  /* ---------- capa de la cabeza de Guillermo: marca roja y mechones tras el latigazo ----------
   * En coordenadas del retrato (×0,18 en pantalla). La melena le cruzó la cara: tres verdugones por
   * debajo de los ojos (se quedan) y unos mechones negros de Sara pegados que resbalan y se van. */
  function capaG(g, t, p) {
    if (t < T.hit - 0.005) return;
    const km = salida(fase(t, T.hit, T.hit + 0.12));
    g.save(); g.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const dy = i * 22;
      g.globalAlpha = 0.5 * km; g.strokeStyle = "#e23a37"; g.lineWidth = 16 - i * 2;
      g.beginPath(); g.moveTo(918, 672 + dy); g.quadraticCurveTo(820, 630 + dy, 716, 608 + dy); g.stroke();
      g.globalAlpha = 0.4 * km; g.strokeStyle = "#ff9a88"; g.lineWidth = 4;
      g.beginPath(); g.moveTo(904, 664 + dy); g.quadraticCurveTo(820, 626 + dy, 728, 606 + dy); g.stroke();
    }
    g.restore();
    // mechones de Sara pegados a la cara: resbalan hacia abajo y se desvanecen
    const kp = 1 - tramo(t, T.hit + 0.3, T.hit + 0.7);
    if (kp > 0.01) {
      const cae = 90 * tramo(t, T.hit + 0.1, T.hit + 0.7, entrada);
      g.save(); g.globalAlpha = kp;
      for (let i = 0; i < 4; i++) {
        const y0 = 520 + i * 48 + cae * (0.7 + 0.3 * hash(i + 3)), w = 16 - i * 2, x1 = 650 + 30 * hash(i + 7);
        const borde = (k) => { g.moveTo(1040, y0 + 90 - k); g.bezierCurveTo(940, y0 + 40 - k, 840, y0 + 10 + 14 * Math.sin(i * 1.9) - k, x1, y0 + 40 + 20 * hash(i)); };
        g.beginPath(); borde(w); g.bezierCurveTo(840, y0 + 10 + 14 * Math.sin(i * 1.9) + w * 0.4, 940, y0 + 40 + w * 0.6, 1040, y0 + 90 + w); g.closePath();
        g.fillStyle = "#18141a"; g.fill();
        g.strokeStyle = "rgba(120,110,130,0.5)"; g.lineWidth = 3; g.beginPath(); borde(w * 0.6); g.stroke();
      }
      g.restore();
    }
  }

  function pose(t) { return { g: poseG(t), s: poseS(t) }; }

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  let fondo = null, humoSpr = null;
  const ESCENARIO = { x0: 640, x1: 1004, suelo: 300 };
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    // cielo de noche con neblina
    const cg = g.createLinearGradient(0, 0, 0, H); cg.addColorStop(0, "#0a0716"); cg.addColorStop(0.45, "#1c102e"); cg.addColorStop(1, "#120c1a");
    g.fillStyle = cg; g.fillRect(0, 0, W, H);
    // resplandor del escenario
    const rg = g.createRadialGradient(830, 210, 30, 820, 230, 600); rg.addColorStop(0, "rgba(255,120,220,0.38)"); rg.addColorStop(0.4, "rgba(120,80,255,0.16)"); rg.addColorStop(1, "rgba(40,20,80,0)");
    g.fillStyle = rg; g.fillRect(0, 0, W, H);
    escenario(g);
    // suelo del público
    const sg = g.createLinearGradient(0, 330, 0, H); sg.addColorStop(0, "#1a1222"); sg.addColorStop(1, "#0d0910");
    g.fillStyle = sg; g.fillRect(0, 330, W, H - 330);
    // contraluz violeta detrás de los dos (la ropa y el pelo negros se recortan contra él)
    const cl = g.createRadialGradient(440, 250, 20, 440, 270, 330); cl.addColorStop(0, "rgba(176,96,236,0.42)"); cl.addColorStop(0.5, "rgba(120,60,200,0.18)"); cl.addColorStop(1, "rgba(60,30,120,0)");
    g.fillStyle = cl; g.fillRect(0, 0, W, H);
    // viñeta
    const v = g.createRadialGradient(520, 280, 240, 520, 300, 760); v.addColorStop(0, "rgba(6,2,10,0)"); v.addColorStop(1, "rgba(6,2,10,0.6)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    return c;
  }
  function escenario(g) {
    const { x0, x1, suelo } = ESCENARIO;
    g.save(); g.lineJoin = "round";
    // pantalla de fondo (sin imagen, solo luz)
    const pg = g.createLinearGradient(x0 + 60, 120, x0 + 60, 260); pg.addColorStop(0, "#3b1d6e"); pg.addColorStop(1, "#7a2a8a");
    g.fillStyle = pg; g.fillRect(x0 + 70, 132, 224, 120);
    g.strokeStyle = "#08060c"; g.lineWidth = 3; g.strokeRect(x0 + 70, 132, 224, 120);
    // tarima
    g.fillStyle = "#0e0a12"; g.fillRect(x0 - 20, suelo - 6, x1 - x0 + 40, 40);
    g.fillStyle = "#1d1626"; g.fillRect(x0 - 20, suelo - 10, x1 - x0 + 40, 6);
    // torres de amplificadores a los lados
    for (const ax of [x0, x1 - 62]) {
      for (let i = 0; i < 3; i++) {
        const y = suelo - 40 - i * 36;
        g.fillStyle = "#121016"; g.fillRect(ax, y, 62, 34); g.strokeStyle = "#05040a"; g.lineWidth = 2; g.strokeRect(ax, y, 62, 34);
        g.fillStyle = "#24202c"; g.fillRect(ax + 5, y + 5, 52, 24);
        g.fillStyle = "rgba(255,255,255,0.05)"; for (let k = 0; k < 6; k++) g.fillRect(ax + 7 + k * 8, y + 7, 3, 20);
      }
    }
    // micro y batería (siluetas) en el centro del escenario
    g.fillStyle = "#0b0810";
    g.beginPath(); g.ellipse(x0 + 182, suelo - 40, 46, 26, 0, 0, TAU); g.fill();
    g.fillRect(x0 + 120, suelo - 36, 124, 30);
    g.beginPath(); g.ellipse(x0 + 136, suelo - 70, 18, 4, 0, 0, TAU); g.ellipse(x0 + 232, suelo - 74, 20, 4, 0, 0, TAU); g.fill();
    g.strokeStyle = "#0b0810"; g.lineWidth = 3; g.beginPath(); g.moveTo(x0 + 136, suelo - 70); g.lineTo(x0 + 136, suelo - 36); g.moveTo(x0 + 232, suelo - 74); g.lineTo(x0 + 232, suelo - 36);
    g.moveTo(x0 + 100, suelo - 6); g.lineTo(x0 + 100, suelo - 92); g.lineTo(x0 + 92, suelo - 98); g.stroke();
    // truss: dos postes y una barra con focos
    g.strokeStyle = "#2a2434"; g.lineWidth = 6;
    g.beginPath(); g.moveTo(x0 + 20, suelo - 10); g.lineTo(x0 + 20, 92); g.lineTo(x1 - 14, 92); g.lineTo(x1 - 14, suelo - 10); g.stroke();
    g.strokeStyle = "#3a3346"; g.lineWidth = 1.5;
    for (let x = x0 + 20; x < x1 - 14; x += 14) { g.beginPath(); g.moveTo(x, 86); g.lineTo(x + 14, 98); g.moveTo(x, 98); g.lineTo(x + 14, 86); g.stroke(); }
    g.restore();
  }
  // focos del truss que barren por encima del público: [x, y, color, fase, ángulo medio, amplitud]
  // (ángulo de pantalla: dirección (cos a, sin a); ~2,4 abajo-izquierda, ~4,3 arriba)
  const FOCOS = [
    [690, 100, "255,90,200", 0.0, 2.45, 0.42], [760, 100, "90,200,255", 1.7, 2.6, 0.38], [830, 100, "255,200,90", 3.1, 2.35, 0.45],
    [900, 100, "160,110,255", 4.4, 2.55, 0.4], [970, 100, "90,255,190", 5.6, 2.4, 0.42],
    [672, 286, "255,120,220", 0.9, 4.25, 0.3], [990, 286, "120,170,255", 2.6, 4.95, 0.3]
  ];
  function haces(g, t) {
    g.save(); g.globalCompositeOperation = "lighter";
    for (const [fx, fy, col, ph, a0, amp] of FOCOS) {
      const a = a0 + amp * Math.sin(t * 0.85 + ph) + 0.1 * Math.sin(t * 0.37 + ph * 2);
      const L = 1150, w = 78;
      const ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
      const ex = fx + ux * L, ey = fy + uy * L;
      const gr = g.createLinearGradient(fx, fy, ex, ey);
      gr.addColorStop(0, `rgba(${col},0.3)`); gr.addColorStop(0.55, `rgba(${col},0.1)`); gr.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = gr; g.beginPath(); g.moveTo(fx - nx * 4, fy - ny * 4); g.lineTo(fx + nx * 4, fy + ny * 4); g.lineTo(ex + nx * w, ey + ny * w); g.lineTo(ex - nx * w, ey - ny * w); g.closePath(); g.fill();
      g.fillStyle = `rgba(${col},0.9)`; g.beginPath(); g.arc(fx, fy, 5, 0, TAU); g.fill();
      g.fillStyle = `rgba(${col},0.25)`; g.beginPath(); g.arc(fx, fy, 14, 0, TAU); g.fill();
    }
    // la pantalla del escenario late con el compás (suave)
    g.fillStyle = `rgba(255,120,230,${0.06 + 0.12 * pulso(t, 1, 2)})`; g.fillRect(ESCENARIO.x0 + 70, 132, 224, 120);
    g.restore();
  }
  // humo: manchas suaves que derivan despacio
  function creaHumo() {
    const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
    const r = g.createRadialGradient(128, 128, 10, 128, 128, 128); r.addColorStop(0, "rgba(200,180,230,0.5)"); r.addColorStop(1, "rgba(200,180,230,0)");
    g.fillStyle = r; g.fillRect(0, 0, 256, 256); return c;
  }
  function humo(g, t, capa) {
    if (!humoSpr) humoSpr = creaHumo();
    g.save();
    for (let i = 0; i < 7; i++) {
      if ((i % 2) !== capa) continue;
      const x = ((80 + i * 170 + t * (8 + 4 * hash(i + 1))) % 1300) - 140, y = 250 + 60 * hash(i + 4) + 10 * Math.sin(t * 0.5 + i);
      const s = 1.6 + 0.8 * hash(i + 9);
      // entra y sale por los bordes con un fundido (sin saltos al dar la vuelta)
      const borde = clamp((x + 140) / 160) * clamp((1160 - x) / 160);
      g.globalAlpha = (0.16 + 0.1 * hash(i + 2)) * borde * (capa ? 0.7 : 1);
      g.drawImage(humoSpr, x - 128 * s, y - 128 * s, 256 * s, 256 * s);
    }
    g.restore();
  }
  // público: siluetas (cabeza y hombros) que botan al compás; algunas con los cuernos en alto
  const PUBLICO_FONDO = (() => { const L = []; for (let i = 0; i < 26; i++) L.push({ x: -20 + i * 42 + 16 * hash(i * 3.1), y: 352 + 18 * hash(i * 5.3), s: 0.75 + 0.2 * hash(i * 7.7), ph: hash(i * 2.2), brazo: hash(i * 9.1) > 0.68 }); return L; })();
  const PUBLICO_DELANTE = [{ x: 70, y: 600, s: 1.9, ph: 0.3, brazo: true }, { x: 190, y: 620, s: 2.1, ph: 0.7, brazo: false }, { x: 950, y: 610, s: 2.0, ph: 0.1, brazo: true }];
  const caja = (g, x, y, w, h, r) => { if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); };
  function silueta(g, q, t, color) {
    const bote = 6 * q.s * Math.pow(0.5 + 0.5 * Math.cos(TAU * (fasePulso(t) - q.ph * 0.15)), 3);
    const x = q.x, y = q.y - bote;
    g.fillStyle = color;
    g.beginPath(); g.ellipse(x, y - 52 * q.s, 15 * q.s, 18 * q.s, 0, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(x - 30 * q.s, y + 40 * q.s); g.quadraticCurveTo(x - 30 * q.s, y - 30 * q.s, x, y - 32 * q.s); g.quadraticCurveTo(x + 30 * q.s, y - 30 * q.s, x + 30 * q.s, y + 40 * q.s); g.closePath(); g.fill();
    if (q.brazo) {
      const a = -0.25 + 0.12 * Math.sin(TAU * (fasePulso(t) + q.ph));
      g.save(); g.translate(x + 20 * q.s, y - 22 * q.s); g.rotate(a);
      g.beginPath(); caja(g, -5 * q.s, -62 * q.s, 10 * q.s, 64 * q.s, 5 * q.s); g.fill();
      g.beginPath(); g.ellipse(0, -66 * q.s, 7.5 * q.s, 7 * q.s, 0, 0, TAU); g.fill();
      // cuernos: índice y meñique
      g.beginPath(); caja(g, 2 * q.s, -86 * q.s, 3.6 * q.s, 18 * q.s, 1.8 * q.s); caja(g, -5.6 * q.s, -83 * q.s, 3.4 * q.s, 15 * q.s, 1.7 * q.s); g.fill();
      g.restore();
    }
  }
  function publicoFondo(g, t) { for (const q of PUBLICO_FONDO) silueta(g, q, t, "#140d1c"); }
  function publicoDelante(g, t) { for (const q of PUBLICO_DELANTE) silueta(g, q, t, "#07050a"); }

  /* ---------- efectos ---------- */
  function estrella(g, x, y, r, n, giro, hueco = 0.45) {
    g.beginPath();
    for (let i = 0; i < n * 2; i++) { const a = giro + i * Math.PI / n, rr = i % 2 ? r * hueco : r; const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; if (i) g.lineTo(px, py); else g.moveTo(px, py); }
    g.closePath();
  }
  // estela de la melena al cabecear: el arco que traza la punta (y un poco más dentro) en los últimos instantes
  function estela(g, t) {
    const k = cuerpoS(t).cb.k * 0.7; if (k < 0.05) return;     // solo al cabecear (el latigazo ya se ve solo)
    const pasos = 6, dt = 0.022;
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    for (const [f, ancho] of [[1, 3], [0.82, 2.2]]) {
      const pts = []; for (let i = 0; i <= pasos; i++) pts.push(puntaMelena(t - i * dt, f));
      let largo = 0; for (let i = 1; i < pts.length; i++) largo += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      const a = k * clamp((largo - 25) / 60); if (a < 0.02) continue;
      // cada tramo según su rapidez: donde la punta frena (al dar la vuelta) la estela desaparece
      for (let i = 1; i < pts.length; i++) {
        const v = clamp((Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y) - 5) / 12);
        if (v < 0.03) continue;
        g.strokeStyle = `rgba(255,236,252,${0.55 * a * v * (1 - i / (pasos + 1))})`; g.lineWidth = ancho * (1 - i / (pasos + 2));
        g.beginPath(); g.moveTo(pts[i - 1].x, pts[i - 1].y); g.lineTo(pts[i].x, pts[i].y); g.stroke();
      }
    }
    g.restore();
  }
  // ¡crac! en el cuello
  function crack(g, t, pg) {
    const k = campana(t, T.gCrack - 0.02, T.gCrack + 0.4); if (k < 0.01) return;
    const n = G.aPantalla(pg, G.tronco(pg)(G.CUELLO));
    g.save(); g.strokeStyle = `rgba(255,250,230,${k})`; g.lineWidth = 3; g.lineJoin = "round"; g.lineCap = "round";
    for (const ang of [-2.6, -0.4, 0.3]) {
      const r0 = 26, L = 26 * (0.6 + 0.4 * k);
      const x0 = n.x + Math.cos(ang) * r0, y0 = n.y + Math.sin(ang) * r0;
      g.beginPath(); g.moveTo(x0, y0);
      for (let i = 1; i <= 4; i++) { const u = i / 4, px = x0 + Math.cos(ang) * L * u + Math.cos(ang + Math.PI / 2) * (i % 2 ? 5 : -5), py = y0 + Math.sin(ang) * L * u + Math.sin(ang + Math.PI / 2) * (i % 2 ? 5 : -5); g.lineTo(px, py); }
      g.stroke();
    }
    g.restore();
  }
  // estrellitas de mareo
  function mareo(g, t, pg) {
    const ks = tramo(t, T.gMareo, T.gMareo + 0.25) * (1 - tramo(t, T.gCrack, T.gCrack + 0.3)) + tramo(t, T.hit + 0.1, T.hit + 0.3) * (1 - tramo(t, T.gFrota0, T.gFrota0 + 0.4));
    if (ks < 0.01) return;
    const cc = G.aPantalla(pg, G.cabeza(pg).a(P(760, 250)));
    g.save(); g.globalAlpha = ks;
    for (let i = 0; i < 4; i++) { const a = t * 6 + i * TAU / 4; estrella(g, cc.x + Math.cos(a) * 34, cc.y + Math.sin(a) * 9 - 6, 7, 5, t * 4 + i); g.fillStyle = "#ffe066"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke(); }
    g.restore();
  }
  // ¡zas!: el latigazo de la melena en la cara
  function zas(g, t, pg) {
    const k = campana(t, T.hit - 0.02, T.hit + 0.26); if (k < 0.01) return;
    const c = G.aPantalla(pg, G.cabeza(pg).a(P(900, 600)));
    g.save(); g.globalAlpha = k;
    estrella(g, c.x + 8, c.y - 4, 20 * k + 10, 8, 0.3, 0.42); g.fillStyle = "#fff4b8"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.strokeStyle = "rgba(255,250,230,0.95)"; g.lineWidth = 2.6; g.lineCap = "round";
    for (let i = 0; i < 5; i++) { const a = -1.2 + i * 0.5, r0 = 28 + 16 * (1 - k); g.beginPath(); g.moveTo(c.x + 8 + Math.cos(a) * r0, c.y - 4 + Math.sin(a) * r0); g.lineTo(c.x + 8 + Math.cos(a) * (r0 + 13), c.y - 4 + Math.sin(a) * (r0 + 13)); g.stroke(); }
    g.restore();
  }
  // destello al quedar bien los cuernos
  function destello(g, t, pg) {
    const k = campana(t, T.gIlumina - 0.05, T.gIlumina + 0.45); if (k < 0.01) return;
    const m = pg.manoLejos, c = G.aPantalla(pg, P(m.x, m.y - 40));
    g.save(); g.globalAlpha = k;
    for (let i = 0; i < 3; i++) { estrella(g, c.x + [-22, 24, 4][i], c.y + [-18, -26, -46][i], (6 + 3 * i) * k, 4, t * 2 + i, 0.3); g.fillStyle = "#fff6c8"; g.fill(); }
    g.restore();
  }
  function guino(g, t, R, p, t0, punto) {
    const k = campana(t, t0 + 0.02, t0 + 0.5); if (k <= 0) return;
    const q = R.aPantalla(p, R.cabeza(p).a(punto));
    g.save(); g.globalAlpha = k; estrella(g, q.x + 14, q.y - 6, 9 * k + 3, 4, t * 2, 0.3); g.fillStyle = "#fff6c8"; g.fill(); g.restore();
  }
  function sombra(g, p, ancho) { g.beginPath(); g.ellipse(p.x, p.suelo + 2, ancho, 7, 0, 0, TAU); g.fill(); }

  /* ---------- cámara: acercamientos suaves (parada en cada clave) ---------- */
  const CAM = [[0, 1, 512, 300], [5.3, 1, 512, 300], [6.9, 1.16, 450, 262], [9.75, 1.16, 450, 262],
    [10.45, 1.5, 440, 200], [12.3, 1.5, 440, 200], [12.95, 1.12, 470, 268]];
  function camara(t) {
    let i = 0; while (i < CAM.length - 1 && CAM[i + 1][0] <= t) i++;
    const a = CAM[i], b = CAM[Math.min(CAM.length - 1, i + 1)], u = b === a ? 0 : suave(fase(t, a[0], b[0]));
    const k = 1 / lerp(1 / a[1], 1 / b[1], u);
    let f = P(lerp(a[2], b[2], u), lerp(a[3], b[3], u));
    const hx = 512 / k, hy = 300 / k;
    f = P(clamp(f.x, hx, W - hx), clamp(f.y, hy, H - hy));
    return { k, f };
  }

  class GuillermoSaraConcierto extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !S.listo()) return;
      if (!fondo) fondo = creaFondo();
      const luz = tramo(t, NEGRO_INICIO, 0.8) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02));
      const pg = poseG(t), ps = poseS(t);
      g.save();
      const cam = camara(t);
      g.translate(512, 300); g.scale(cam.k, cam.k); g.translate(-cam.f.x, -cam.f.y);
      g.drawImage(fondo, 0, 0);
      haces(g, t);
      humo(g, t, 0);
      publicoFondo(g, t);
      g.fillStyle = "rgba(0,0,0,0.35)";
      sombra(g, pg, 62); sombra(g, ps, 58);
      G.dibujar(g, pg, t);
      mareo(g, t, pg);
      crack(g, t, pg);
      estela(g, t);
      dibujaSara(g, ps, t);
      zas(g, t, pg);
      destello(g, t, pg);
      humo(g, t, 1);
      publicoDelante(g, t);
      guino(g, t, S, ps, T.guinoS, P(930, 420));
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00122", nombre: "Guillermo y Sara · El concierto", crear: () => new GuillermoSaraConcierto() });
  window.__A2D_00122 = { pose, T, DUR, puntaCorazon, puntaCorrige, clavesPelo, puntaMelena };
})();
