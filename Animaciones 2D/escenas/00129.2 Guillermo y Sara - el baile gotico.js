"use strict";
/* 00129.2 · Guillermo y Sara · El baile gótico
 *
 * Negro → un club gótico de noche: pared de piedra violeta con tres ventanales ojivales de vidriera que
 * brillan, cortinas de terciopelo, candelabros de hierro con velas que titilan, una bola de espejos que
 * gira despacio y salpica la pared de destellos, y niebla baja que se arrastra por el suelo de baldosas.
 * Sara baila un baile gótico lento y dramático: los brazos ondulan como humo, las muñecas giran, se mece
 * con pasos que flotan, la melena fluye y lleva los ojos entornados. Guillermo la mira, se viene arriba
 * (mirada a cámara) y la imita con unos brazos de fantasma exagerados: estirados, las manos colgando y
 * los dedos retorciéndose, la boca en «uuuh». Prueba el giro de muñecas y se lía: un brazo cruzado sobre
 * la barriga, el otro arriba, las piernas cruzadas; se tambalea, da un saltito atrás y le da con el talón
 * a la máquina de humo. Se enciende el piloto, sisea… él mira atrás y ¡fuuush!: un chorro de niebla le
 * sube desde el suelo y se lo traga entero. Del banco de niebla solo asoman sus pinchos: van a la
 * izquierda, a la derecha como una aleta de tiburón, miran alrededor como un periscopio, dan una vuelta
 * sobre sí mismos y botan. Sara abre un ojo, deja de bailar y, sin cambiar la cara, va hasta la niebla,
 * le pinza el tupé y tira: Guillermo sale de un tirón, la niebla estalla en bocanadas y se deshace, y él
 * se queda tosiendo nubecitas, con los ojos en espiral. Sara vuelve a bailar, él prueba un solo brazo de
 * fantasma, muy serio, y ella le da el visto bueno con un levísimo gesto de cabeza. Los dos miran a
 * cámara → negro.
 *
 * La melena de Sara la dibuja la escena (las dos tiras del rig con ángulos propios). El banco de niebla
 * es un recorte opaco con el borde de bultos: Guillermo se dibuja debajo y solo queda fuera lo que
 * sobresale (sus pinchos); su altura se ajusta al borde de la niebla en cada instante. Sin textos.
 * Todo depende del tiempo `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, ruido, hash } = M2;
  const G = Guillermo, S = SaraSaez;
  const DUR = 14.9, TINTA = "#0b0a0e", TAU = Math.PI * 2;
  const SUELO = 552, ESC = 0.29;
  const CICLO = 2.8, OM = TAU / CICLO;            // el baile: un vaivén completo cada 2,8 s

  const T = {
    // Guillermo
    gMira: 0.95, gAsiente: 1.55, gListo: 2.2, gSpook0: 2.7, gLio0: 4.95, gLio1: 5.55, gAtras0: 5.9, gTope: 6.27,
    gMiraAtras: 6.5, chorro: 6.78, gAgacha0: 6.95, gAgacha1: 7.4, tufo0: 7.8, tufo1: 8.1,
    izq0: 8.1, izq1: 8.55, der0: 8.6, der1: 9.2, peri0: 9.22, peri1: 9.66, gira0: 9.68, gira1: 10.16, bota0: 10.16, bota1: 10.56,
    tiron0: 10.84, tiron1: 11.12, tos1: 11.4, tos2: 11.82, gRecupera: 12.15, gBrazo0: 12.5, gBrazo1: 12.95,
    // Sara
    sOjo: 8.8, sPara0: 9.15, sPara1: 9.55, sAlarga0: 10.38, sPinza: 10.78, sSuelta: 10.98, sBaila: 12.3, sMira: 12.9, sAsiente: 13.12,
    // niebla
    disipa0: 10.98, disipa1: 12.9,
    // los dos
    camara: 13.55, fin: 14.1
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
  const PUNO = TODOS(0);
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  // dedos que se retuercen (fantasma): cada dedo con su fase
  const RETUERCE = (t, k = 1, v = 9) => D5(0.55 + 0.3 * k * Math.sin(t * v * 0.7), 0.6 + 0.4 * k * Math.sin(t * v), 0.6 + 0.4 * k * Math.sin(t * v + 1.1),
    0.6 + 0.4 * k * Math.sin(t * v + 2.2), 0.6 + 0.4 * k * Math.sin(t * v + 3.3));
  // dedos de bailarina: sueltos, con un aleteo lento
  // manos de bailarina: abiertas y blandas, los dedos casi estirados y desiguales (el meñique algo más
  // recogido), el pulgar separado, con un aleteo lento distinto en cada dedo
  const SUELTOS = (t, f) => D5(0.95 + 0.05 * Math.sin(t * 1.7 + f), 0.96 + 0.04 * Math.sin(t * 2.3 + f), 1, 0.9 + 0.05 * Math.sin(t * 2.1 + f + 1),
    0.8 + 0.06 * Math.sin(t * 2.6 + f + 2));
  const PINZA = D5(0.5, 0.45, 0.2, 0.15, 0.12);

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
      if (o.scr) { const h = R.aHoja(p, o.scr()); return { x: h.x, y: h.y, mu: o.mu, ang: 0, puno: 1, dedos: o.dedos, dobla: o.dobla ?? (lado === "cerca" ? -1 : 1), doblaYa: o.doblaYa }; }
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
  // pasos [t0, t1, x]: el pie despega en t0 y apoya en t1 en x
  function pasos(x0, lista) {
    const r = [[-9, x0, (lista.length ? lista[0][0] : 99) + 9]];
    lista.forEach(([a, b, x], i) => r.push([b, x, lista[i + 1] ? lista[i + 1][0] - b : 99]));
    return r;
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
  const memo = (c, f) => { if (MEMO.has(c)) return MEMO.get(c); if (MEMO.size > 120) MEMO.clear(); const v = f(); MEMO.set(c, v); return v; };

  /* =====================================================================================
   * EL BANCO DE NIEBLA (lo suelta la máquina al recibir el taconazo)
   * ===================================================================================== */
  const MAQ = { x0: 752, x1: 838, top: 500, boq: P(758, 507) };       // la máquina y su boquilla (mira arriba a la izquierda)
  const angTubo=.77, dirTubo=P(-Math.cos(angTubo),-Math.sin(angTubo));
  const vibracion=t=>{const k=campana(t,T.gTope,T.gTope+.3);return P(3*k*Math.sin((t-T.gTope)*60),-2*k);};
  function bocaTubo(t){const v=vibracion(t);return P(MAQ.boq.x+30*dirTubo.x+v.x,MAQ.boq.y+30*dirTubo.y+v.y);}
  const BANCO = { cx: 664, ancho: 344 };
  const FONDO_N = SUELO + 26;
  // altura del borde de arriba (pantalla): sube con el chorro, se pasa un poco, se asienta y al final se deshace
  const CLAVES_TOP = [[T.chorro, SUELO + 10], [T.chorro + 0.24, 300], [T.chorro + 0.46, 192], [T.chorro + 0.7, 204], [T.tufo0 - 0.1, 222],
    [T.tufo1, 236], [T.tiron0, 240], [T.sSuelta, 242], [T.sSuelta + 0.6, 196]];
  function banco(t) {
    return memo("b" + t, () => {
      // densidad (rampas, sin saltos): al sacarle de un tirón la niebla se hincha y se deshace de golpe
      const k = tramo(t, T.chorro, T.chorro + 0.35) * (1 - tramo(t, T.sSuelta - 0.02, T.sSuelta + 0.5, salida));
      const top = curva(CLAVES_TOP, t)[0];
      const ancho = lerp(170, BANCO.ancho, tramo(t, T.chorro, T.chorro + 0.6, salida)) + 150 * tramo(t, T.sSuelta, T.sSuelta + 0.6, salida);
      return { k, top, ancho };
    });
  }
  // borde de arriba (pantalla) en la columna x: una loma de lados redondeados con festones que hierven
  function contorno(b, t, x) {
    const half = b.ancho / 2, d = (x - BANCO.cx) / half;
    if (d <= -1 || d >= 1) return FONDO_N + 4;
    const ad = Math.abs(d), alto = FONDO_N - b.top;
    const base = b.top + alto * (1 - Math.sqrt(1 - Math.pow(ad, 4.5)));
    const p = 44, u0 = (x - BANCO.cx + 1012 + 8 * Math.sin(t * 0.55)) / p, i = Math.floor(u0), u = u0 - i;
    const amp = (11 + 3.5 * Math.sin(t * 1.7 + i * 2.3) + 3 * hash(i * 1.7)) * (1 - 0.4 * ad * ad);
    let y = base - amp * Math.sqrt(Math.max(0, 1 - (2 * u - 1) * (2 * u - 1)));
    return y;
  }
  const bordeNiebla = (t, x) => contorno(banco(t), t, x);
  // bultos de los lados (fracción del semiancho, fracción de la altura desde arriba, radio / ancho, fase)
  const BULTOS_LADO = [[-0.8, 0.26, 0.1, 0], [-0.92, 0.52, 0.12, 2], [-0.98, 0.83, 0.12, 3], [0.82, 0.22, 0.095, 4], [0.94, 0.5, 0.125, 1], [1.0, 0.82, 0.11, 5]];

  /* =====================================================================================
   * SARA (a la izquierda, mirando a la derecha)
   * ===================================================================================== */
  const XS0 = 382, XS1 = 532, XS2 = 400;
  const PIES_S = {
    cerca: pasos(XS0 - 30, [[2.0, 2.55, XS0 - 6], [4.6, 5.15, XS0 - 30], [7.25, 7.8, XS0 - 14], [9.68, 10.02, XS1 - 30],
      [11.3, 11.58, XS1 - 70], [11.76, 12.06, XS2 - 30]]),
    lejos: pasos(XS0 + 34, [[1.7, 2.25, XS0 + 58], [4.3, 4.85, XS0 + 34], [6.95, 7.5, XS0 + 50], [9.42, 9.74, XS1 - 22], [9.96, 10.3, XS1 + 34],
      [11.52, 11.82, XS1 - 22], [11.98, 12.28, XS2 + 34]])
  };
  const piesS = t => memo("ps" + t, () => ({ c: pieDe(PIES_S.cerca, t, { alto: 9, apoyo: 0.02 }), l: pieDe(PIES_S.lejos, t, { alto: 9, apoyo: 0.02 }) }));
  const xS = t => { const f = piesS(t); return (f.c.x + f.l.x) / 2 - 2; };

  // cuánto baila (0 mientras para, va, tira y vuelve)
  const kBaile = t => 1 - tramo(t, T.sPara0, T.sPara1 + 0.25) + tramo(t, T.sBaila, T.sBaila + 0.8);

  const CS0 = { pel: 0, torso: 0, cab: 0, dx: 0 };
  const CSo = o => Object.assign({}, CS0, o);
  const CUERPOS_S = {
    baile: CSo({ pel: 14, torso: -0.02, cab: -0.08 }),
    para: CSo({ pel: 6, torso: 0, cab: 0.02 }),
    camina: CSo({ pel: 8, torso: 0.04, cab: 0.02 }),
    alarga: CSo({ pel: 4, torso: 0.1, cab: -0.04, dx: 14 }),
    tira: CSo({ pel: 0, torso: 0.02, cab: -0.06, dx: 0 }),
    suelta: CSo({ pel: 6, torso: -0.02, cab: 0.04 }),
    camara: CSo({ pel: 14, torso: -0.02, cab: -0.04 })
  };
  const GUION_CUERPO_S = [
    [T.sPara0, T.sPara1, "para"], [9.45, 9.8, "camina"], [T.sAlarga0, T.sPinza, "alarga"], [T.tiron0, T.tiron1, "tira", salida],
    [T.sSuelta + 0.05, T.sSuelta + 0.45, "suelta"], [T.sBaila, T.sBaila + 0.6, "baile"], [T.camara, T.camara + 0.4, "camara"]
  ];
  const CARAS_S = {
    baile: E({ mx: 0.4, my: -0.25, c: 0.62, sd: 4, si: 4, abre: 0, ancho: 0.78, sonr: 0.06 }),
    ojo: E({ mx: 1, my: -0.2, c: 0, cd: 0.62, ci: 0.12, sd: 2, si: 6, gi: -0.05, abre: 0, ancho: 0.75, sonr: 0 }),
    seria: E({ mx: 1, my: -0.12, c: 0.36, sd: 0, si: 3, abre: 0, ancho: 0.74, sonr: 0 }),
    apunta: E({ mx: 1, my: -0.2, c: 0.3, sd: -3, gd: -0.05, si: -1, abre: 0, ancho: 0.72, sonr: 0 }),
    tira: E({ mx: 0.9, my: -0.3, c: 0.38, sd: -4, si: -2, abre: 0, ancho: 0.7, sonr: 0.02 }),
    mira: E({ mx: 1, my: 0.0, c: 0.4, sd: 2, si: 10, gi: -0.06, abre: 0, ancho: 0.76, sonr: 0.02 }),
    reojo: E({ mx: 1, my: 0.05, c: 0.5, sd: 4, si: 6, abre: 0, ancho: 0.76, sonr: 0.12 }),
    asiente: E({ mx: 1, my: 0.05, c: 0.46, sd: 6, si: 8, abre: 0, ancho: 0.82, sonr: 0.32 }),
    camara: E({ mx: -0.25, my: 0.05, c: 0.4, sd: 4, si: 10, gi: -0.05, abre: 0, ancho: 0.8, sonr: 0.38 })
  };
  const GUION_CARA_S = [
    [T.sOjo, T.sOjo + 0.18, "ojo"], [T.sPara0 + 0.1, T.sPara0 + 0.4, "seria"], [T.sAlarga0 - 0.1, T.sAlarga0 + 0.2, "apunta"],
    [T.tiron0 - 0.04, T.tiron0 + 0.1, "tira"], [T.sSuelta + 0.15, T.sSuelta + 0.4, "mira"], [T.sBaila - 0.1, T.sBaila + 0.4, "baile"],
    [T.sMira, T.sMira + 0.25, "reojo"], [T.sAsiente, T.sAsiente + 0.2, "asiente"], [T.camara, T.camara + 0.35, "camara"]
  ];
  const PARP_S = [9.35, 10.3, 11.7, 13.3];

  function cuerpoS(t) { return memo("c" + t, () => cuerpoS0(t)); }
  function cuerpoS0(t) {
    const b = guion(GUION_CUERPO_S, CUERPOS_S, "baile", t);
    const kD = kBaile(t), φ = OM * t;
    const respira = Math.sin(t * 1.9 + 0.4);
    const f = piesS(t);
    // el visto bueno: un gesto de cabeza mínimo (abajo y arriba)
    const asiente = 0.12 * campana(t, T.sAsiente, T.sAsiente + 0.42);
    const p = {
      x: xS(t), suelo: SUELO, s: ESC, espejo: false, tirasLimpias: true, ikContinuo: true,
      pelvis: { x: S.PELVIS.x + b.dx + kD * 34 * Math.sin(φ), y: S.PELVIS.y + b.pel + kD * 12 * (0.5 - 0.5 * Math.cos(2 * φ)) + respira * 1.2 - 13*campana(t,T.tiron0-.06,T.sSuelta+.17)/(ESC*S.K) },
      torso: b.torso + kD * 0.06 * Math.sin(φ + 0.7), torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + kD * 0.1 * Math.sin(φ + 1.4) + asiente, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    p.piernas.cerca = aPierna(S, p, f.c, "cerca");
    p.piernas.lejos = aPierna(S, p, f.l, "lejos");
    p.kD = kD; p.φ = φ;
    return p;
  }
  function poseS(t) { return memo("s" + t, () => poseS0(t)); }
  function poseS0(t) {
    const p = Object.assign({}, cuerpoS(t));
    const e = guion(GUION_CARA_S, CARAS_S, "baile", t);
    p.cara = cara(e, parpadeo(t, PARP_S));
    const [a1] = anguloMelena(t, p);
    p.pelo = { viento: 0, inercia: clamp(-(a1 - 0.45 * p.cabeza.ang) * 1.3, -3, 3) };
    manosS(p, t);
    return p;
  }

  /* ---------- la melena de Sara: la dibuja la escena (como en 00122) ----------
   * Ángulos de pantalla: 0 = colgando, + hacia atrás (izquierda), − hacia delante. En el baile ondula
   * despacio y con retraso (la punta va detrás de la raíz); al andar se queda atrás. */
  const MEL_S = [
    { pieza: "melena_atras", raiz: P(565, 615), sg: -1, esc: 0.98, abre: 0.07 },
    { pieza: "melena", raiz: P(990, 615), sg: 1, esc: 1, abre: -0.07 }
  ];
  const LARGO_MEL = 488.18;
  function anguloMelena(t, cs) {
    const kD = cs.kD, φ = cs.φ, Ha = cs.cabeza.ang;
    const v = (xS(t) - xS(t - 0.16)) / 0.16, v2 = (xS(t - 0.12) - xS(t - 0.3)) / 0.18;   // al andar, la melena se queda atrás
    let a1 = 0.45 * Ha + kD * (0.05 + 0.1 * Math.sin(φ - 0.9)) + 0.02 * Math.sin(t * 1.3) + clamp(v * 0.0016, -0.2, 0.25);
    let a2 = 0.15 * Ha + kD * (0.08 + 0.2 * Math.sin(φ - 1.7)) + 0.03 * Math.sin(t * 1.1 + 1) + clamp(v2 * 0.0026, -0.3, 0.4);
    // el tirón: la melena se va un poco hacia delante y vuelve
    const kt = campana(t, T.tiron0, T.tiron1 + 0.5);
    a1 -= 0.1 * kt; a2 -= 0.18 * campana(t, T.tiron0 + 0.06, T.tiron1 + 0.7);
    return [a1, a2, 1];
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
  function dibujaSara(g, ps, t) {
    dibMelenaS(g, ps, t);
    Recortes.tira = function (gg, AA, n) { return AA === S.A && SIN_MELENA.has(n) ? [] : TIRA.apply(this, arguments); };
    try { S.dibujar(g, ps, t); } finally { Recortes.tira = TIRA; }
  }

  // manos del baile: lazos lentos y desfasados, como humo; las muñecas ruedan
  // La muñeca va delante y los dedos detrás, como humo: al subir la mano los dedos se quedan abajo y al
  // bajar se quedan arriba. dd = dirección de los dedos (rad, pantalla); mu = hacia la muñeca = dd ± π.
  function manosBaile(t, φ) {
    const vC = Math.cos(φ - 1.4), vL = -Math.cos(φ - 0.9);                     // velocidad vertical (+ = baja)
    const ddC = -1.95 + 0.55 * vC + 0.15 * Math.sin(2 * φ + 0.4);              // la de atrás: dedos arriba y hacia fuera
    const ddL = -0.5 - 0.55 * vL + 0.15 * Math.sin(2 * φ + 2.1);               // la de delante: dedos hacia delante
    const c = HM(20 + 40 * Math.sin(φ), 90 + 84 * Math.sin(φ - 1.4), ddC + Math.PI, SUELTOS(t, 0), 1);
    const l = HM(540 - 50 * Math.sin(φ + 0.5), 250 - 116 * Math.sin(φ + 0.5 - 1.4), ddL - Math.PI, SUELTOS(t, 2), 1);
    return { c, l };
  }
  // Centro de la almohadilla del índice, en la cadena real de dedos del recortable de Sara.
  function offsetPinza(d,mu){
    const abanico=.17*(.4+.9*(d.indice+d.medio+d.anular+d.menique)/4), largo=3.2+11.3*Math.pow(d.indice,.85);
    return S.rotP(P(6.9+Math.sin(abanico)*largo,4.5+Math.cos(abanico)*largo),mu+Math.PI/2);
  }
  function yemaPinza(p,m){
    const a=offsetPinza(m.dedos,m.mu),k=S.JK*.86*m.puno;return S.aPantalla(p,P(m.x+k*a.x,m.y+k*a.y));
  }
  function manosS(p, t) {
    const rC = resolutor(S, p, "cerca"), rL = resolutor(S, p, "lejos");
    const bai = manosBaile(t, OM * t);
    const reposo = { bols: true };
    // pinza en el tupé de Guillermo (pantalla): la sigue mientras tira; al soltar se queda donde estaba
    const MU_P=2.45, dM=offsetPinza(PINZA,MU_P), esc=p.s*S.K*S.JK*.86;
    const enPinza=q=>P(q.x-dM.x*esc,q.y-dM.y*esc);
    const sigue = { scr: () => enPinza(agarre(t)), mu: MU_P, dedos: PINZA, dobla: -1 };
    const antes = { scr: () => { const q = enPinza(agarre(T.sPinza)); return P(q.x - 20, q.y + 12); }, mu: MU_P + 0.15, dedos: D5(0.9, 0.95, 0.8, 0.7, 0.6), dobla: -1 };
    const suelta = { scr: () => { const q = enPinza(agarre(T.sSuelta)); return P(q.x - 4, q.y + 6); }, mu: MU_P, dedos: D5(0.85, 0.95, 0.8, 0.7, 0.6), dobla: -1 };
    const pistaC = [[0, 0, bai.c], [T.sPara0, T.sPara1 + 0.15, reposo], [T.sBaila, T.sBaila + 0.75, bai.c]];
    const pistaL = [[0, 0, bai.l], [T.sPara0 + 0.05, T.sPara1 + 0.2, reposo], [T.sAlarga0, T.sAlarga0 + 0.26, antes], [T.sAlarga0 + 0.26, T.sPinza, sigue],
      [T.sSuelta, T.sSuelta + 0.08, suelta, salida], [T.sSuelta + 0.08, T.sSuelta + 0.4, reposo], [T.sBaila + 0.1, T.sBaila + 0.85, bai.l]];
    p.manoCerca = pista(pistaC, t, rC); p.manoLejos = pista(pistaL, t, rL);
  }

  /* =====================================================================================
   * GUILLERMO (a la derecha, mirando a la izquierda)
   * ===================================================================================== */
  const XG0 = 662;
  const TUFO = P(798, 181);                 // punta opaca más alta en el retrato
  const AGARRE = P(845, 262);               // donde le pinza Sara (en el mechón, por debajo de las puntas)
  // Borde trasero de la zapatilla, medido en el recorte a la altura del golpe.
  const TALON_GOLPE=P(-63,55);
  const salto=t=>16*campana(t,5.98,6.20);
  function talon(p){const z=p.piernas.cerca,r=G.rotP(TALON_GOLPE,z.ang);return G.aPantalla(p,P(z.tob.x+r.x,z.tob.y+r.y));}
  const origenTos=tt=>{const p=poseG(tt);return G.aPantalla(p,G.boca(p));};
  const PASEO_FIN = -40;
  const PIES_G = {
    // espejo: el pie cercano queda a la derecha. Tras el tirón (con el paseo de la niebla ya sumado) acaba en ~710
    cerca: pasos(XG0 + 26, [[3.05, 3.4, XG0 + 2], [5.05, 5.4, XG0 - 58], [5.92, T.gTope, MAQ.x0+TALON_GOLPE.x*ESC], [T.gTope+.04, T.gTope+.26, XG0+58], [11.0, 11.26, XG0 + 104], [12.0, 12.3, XG0 + 100]]),
    lejos: pasos(XG0 - 26, [[2.85, 3.2, XG0 - 50], [5.98, 6.2, XG0 + 26], [10.96, 11.2, XG0 + 80], [11.9, 12.2, XG0 + 72]])
  };
  // los pinchos se pasean por la niebla: desplazamiento horizontal del cuerpo (se queda en PASEO_FIN)
  const CLAVES_PASEO = [[T.tufo1 - 0.05, 0], [T.izq1, -66], [T.der0, -66], [T.der1, 44], [T.peri0, 44], [T.peri1, 30], [T.gira0, 26], [T.gira1, 20], [T.bota1, PASEO_FIN]];
  const paseo = t => t < T.tufo1 - 0.05 ? 0 : curva(CLAVES_PASEO, t)[0];
  // cuánto asoman los pinchos por encima de la niebla (px de pantalla; negativo = hundido)
  const CLAVES_ASOMA = [[T.gAgacha1 - 0.05, -30], [T.tufo0, -22], [T.tufo1, 29], [T.izq1, 27], [T.der1, 29], [T.peri0, 30], [T.peri0 + 0.2, 36], [T.peri1, 30],
    [T.gira0, 29], [T.gira1, 29], [T.bota0 + 0.1, 36], [T.bota0 + 0.2, 14], [T.bota0 + 0.3, 36], [T.bota1, 21], [T.tiron0, 21], [T.sSuelta, 41]];

  const CG0 = { pel: 0, torso: 0.02, cab: 0.04, dx: 0 };
  const CGc = o => Object.assign({}, CG0, o);
  const CUERPOS_G = {
    quieto: CGc({ pel: 6, torso: 0.02, cab: 0.02 }),
    mira: CGc({ pel: 6, torso: 0.06, cab: 0.08 }),
    listo: CGc({ pel: 4, torso: -0.06, cab: -0.06 }),
    spook: CGc({ pel: 26, torso: 0.1, cab: 0.06 }),
    lio: CGc({ pel: 30, torso: -0.12, cab: 0.18 }),
    atras: CGc({ pel: 20, torso: 0.12, cab: 0.04 }),
    tope: CGc({ pel: 12, torso: -0.04, cab: -0.04 }),
    miraAtras: CGc({ pel: 14, torso: -0.06, cab: 0.16 }),
    susto: CGc({ pel: -14, torso: -0.14, cab: -0.16 }),
    agacha: CGc({ pel: 250, torso: 0.3, cab: 0.06 }),
    tiron: CGc({ pel: -16, torso: -0.1, cab: -0.24, dx: 10 }),
    tos: CGc({ pel: 30, torso: 0.17, cab: 0.12 }),
    recupera: CGc({ pel: 10, torso: 0.02, cab: 0.02 }),
    brazo: CGc({ pel: 16, torso: 0.06, cab: 0.04 }),
    camara: CGc({ pel: 12, torso: 0.02, cab: -0.02 })
  };
  const GUION_CUERPO_G = [
    [T.gMira, T.gMira + 0.35, "mira"], [T.gListo, T.gListo + 0.3, "listo"], [T.gSpook0, T.gSpook0 + 0.4, "spook"], [T.gLio0, T.gLio1, "lio"],
    [T.gAtras0, T.gTope - 0.05, "atras"], [T.gTope, T.gTope + 0.15, "tope", salida], [T.gMiraAtras, T.gMiraAtras + 0.25, "miraAtras"],
    [T.chorro, T.chorro + 0.12, "susto", salida], [T.gAgacha0, T.gAgacha1, "agacha"], [T.tiron0, T.tiron1, "tiron", salida],
    [T.tiron1 + 0.1, T.tos1, "tos"], [T.gRecupera, T.gRecupera + 0.35, "recupera"], [T.gBrazo0, T.gBrazo0 + 0.4, "brazo"], [T.camara, T.camara + 0.35, "camara"]
  ];
  const CARAS_G = {
    quieto: E({ mx: 0.9, my: 0.05, c: 0.12, sd: 4, si: 4, abre: 0, ancho: 0.6, sonr: 0.25 }),
    mira: E({ mx: 0.95, my: 0.1, iris: 0.92, sd: 18, si: 22, gi: 0.06, abre: 8, ancho: 0.55, sonr: 0.3 }),
    listo: E({ mx: -0.35, my: 0.05, c: 0.25, sd: -6, gd: -0.16, si: 16, gi: 0.04, abre: 0, ancho: 0.95, sonr: 0.8 }),
    spook: E({ mx: 0.85, my: 0.0, iris: 0.8, sd: 30, si: 30, abre: 26, ancho: 0.42, sonr: 0 }),
    lio: E({ mx: 0.3, my: 0.4, iris: 0.9, sd: 18, gd: 0.2, si: 8, gi: -0.15, abre: 10, ancho: 0.7, sonr: -0.3 }),
    atras: E({ mx: 0.9, my: 0.2, iris: 0.85, sd: 24, si: 24, abre: 16, ancho: 0.6, sonr: -0.2 }),
    tope: E({ mx: -0.6, my: 0.3, iris: 0.8, sd: 30, si: 30, abre: 12, ancho: 0.45, sonr: 0 }),
    miraAtras: E({ mx: -1, my: 0.55, iris: 0.8, sd: 26, si: 26, abre: 6, ancho: 0.5, sonr: -0.35 }),
    susto: E({ c: 1, z: 1, sd: 26, si: 26, abre: 34, ancho: 0.9, sonr: -0.4 }),
    tiron: E({ c: 1, z: 1, sd: 30, gd: 0.2, si: 30, gi: 0.2, abre: 30, ancho: 0.8, sonr: -0.5 }),
    fuera: E({ esp: 1, sd: 14, gd: 0.18, si: 14, gi: 0.18, abre: 0, ancho: 0.6, sonr: -0.1, mof: 1 }),
    tos: E({ c: 1, z: 0.8, sd: 18, si: 18, abre: 26, ancho: 0.75, sonr: -0.3 }),
    recupera: E({ mx: 0.9, my: 0.1, c: 0.3, sd: 10, gd: 0.12, si: 10, gi: 0.12, abre: 0, ancho: 0.6, sonr: 0.1 }),
    brazo: E({ mx: 0.95, my: 0.05, c: 0.2, sd: 12, si: 18, abre: 0, ancho: 0.62, sonr: 0.12 }),
    contento: E({ mx: 0.95, my: 0.0, c: 0.1, h: 0.5, sd: 18, si: 18, abre: 18, ancho: 0.95, sonr: 0.95 }),
    camara: E({ mx: -0.35, my: 0.06, c: 0.2, h: 0.4, sd: 14, si: 10, abre: 14, ancho: 0.95, sonr: 0.9 })
  };
  const GUION_CARA_G = [
    [T.gMira, T.gMira + 0.2, "mira"], [T.gListo, T.gListo + 0.2, "listo"], [T.gSpook0 + 0.1, T.gSpook0 + 0.35, "spook"], [T.gLio0 + 0.1, T.gLio0 + 0.35, "lio"],
    [T.gAtras0, T.gAtras0 + 0.15, "atras"], [T.gTope, T.gTope + 0.06, "tope", salida], [T.gMiraAtras, T.gMiraAtras + 0.2, "miraAtras"],
    [T.chorro, T.chorro + 0.06, "susto", salida], [T.tiron0, T.tiron0 + 0.06, "tiron", salida], [T.tiron1 + 0.04, T.tiron1 + 0.16, "fuera"],
    [T.tos1 - 0.08, T.tos1, "tos", salida], [T.tos1 + 0.2, T.tos2 - 0.08, "fuera"], [T.tos2 - 0.08, T.tos2, "tos", salida], [T.tos2 + 0.2, T.gRecupera, "fuera"],
    [T.gRecupera, T.gRecupera + 0.3, "recupera"], [T.gBrazo0, T.gBrazo0 + 0.25, "brazo"], [T.sAsiente + 0.1, T.sAsiente + 0.3, "contento"], [T.camara, T.camara + 0.3, "camara"]
  ];
  const PARP_G = [0.6, 1.9, 4.3, 12.35, 13.0, 14.0];

  function poseG(t) { return memo("g" + t, () => poseG0(t)); }
  function poseG0(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "quieto", t);
    const respira = Math.sin(t * 2.1);
    const kSp = tramo(t, T.gSpook0, T.gSpook0 + 0.5) * (1 - tramo(t, T.gLio0, T.gLio0 + 0.3));      // brazos de fantasma
    const lio = tramo(t, T.gLio0, T.gLio0 + 0.3) * (1 - tramo(t, T.gAtras0, T.gAtras0 + 0.2));
    const wob = lio * Math.sin((t - T.gLio0) * 8.5);
    const ola = Math.sin((t - T.gSpook0) * 4.2);
    const asiente = 0.08 * Math.sin((t - T.gAsiente) * 10) * campana(t, T.gAsiente, T.gAsiente + 0.6);
    const tos = 0.14 * (campana(t, T.tos1 - 0.06, T.tos1 + 0.2) + campana(t, T.tos2 - 0.06, T.tos2 + 0.2));
    const mareo = tramo(t, T.tiron1, T.tiron1 + 0.2) * (1 - tramo(t, T.gRecupera, T.gRecupera + 0.4));
    const pwx = paseo(t);
    let wC = pieDe(PIES_G.cerca, t, { alto: 16, apoyo: 0.02 }), wL = pieDe(PIES_G.lejos, t, { alto: 16, apoyo: 0.02 });
    wC = Object.assign({}, wC, { x: wC.x + pwx }); wL = Object.assign({}, wL, { x: wL.x + pwx });
    const p = {
      x: (wC.x + wL.x) / 2, suelo: SUELO, s: ESC, espejo: true, tirasLimpias: true, ikContinuo: true,
      hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x + b.dx + 18 * kSp * Math.sin((t - T.gSpook0) * 2.1) + 16 * wob + 10 * mareo * Math.sin(t * 6),
        y: G.PELVIS.y + b.pel + respira * 1.2 - salto(t)/ESC + 10 * kSp * (0.5 + 0.5 * Math.cos((t - T.gSpook0) * 4.2)) },
      torso: b.torso + 0.05 * kSp * ola + 0.08 * wob + tos * 0.6 + 0.04 * mareo * Math.sin(t * 6 + 1), torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.1 * kSp * Math.sin((t - T.gSpook0) * 2.1 + 1) + 0.1 * wob + asiente + tos + 0.08 * mareo * Math.sin(t * 6 + 2),
        dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // el periscopio: la cabeza mira a un lado y a otro
    const kPeri = campana(t, T.peri0, T.peri1);
    p.cabeza.ang += 0.42 * kPeri * Math.sin((t - T.peri0) / (T.peri1 - T.peri0) * TAU);
    // como una aleta: al deslizarse, los pinchos se inclinan hacia atrás
    p.cabeza.ang += clamp((paseo(t) - paseo(t - 0.1)) / 0.1 * 0.0032, -0.3, 0.3);
    p.piernas.cerca = aPierna(G, p, wC, "cerca"); p.piernas.lejos = aPierna(G, p, wL, "lejos");
    // dentro de la niebla: su altura se ajusta para que los pinchos asomen lo justo
    const kAj = tramo(t, T.gAgacha1 - 0.3, T.gAgacha1) * (1 - tramo(t, T.sSuelta, T.sSuelta + 0.14));
    if (kAj > 0) {
      const q = tufoDe(p), quiere = bordeNiebla(t, q.x) - curva(CLAVES_ASOMA, t)[0];
      p.pelvis = { x: p.pelvis.x, y: p.pelvis.y + kAj * (quiere - q.y) / (p.s * (G.K || 1)) };
    }
    // Mientras hay contacto el mechón sigue el tirón hacia Sara. Al abrir la pinza Guillermo termina
    // de incorporarse con sus piernas y vuelve gradualmente sobre sus apoyos.
    if(t>T.tiron0 && t<T.tiron1+.29){
      const u=suave(fase(t,T.tiron0,T.sSuelta)), peso=1-tramo(t,T.sSuelta,T.tiron1+.29);
      const inicio=agarre(T.tiron0), ahora=G.aPantalla(p,G.cabeza(p).a(AGARRE));
      p.pelvis.x-=(inicio.x-13*u-ahora.x)*peso/p.s;
      p.pelvis.y+=(inicio.y-24*u-ahora.y)*peso/p.s;
    }
    // cara
    const e = guion(GUION_CARA_G, CARAS_G, "quieto", t);
    if (kSp > 0.05) { e.abre += 6 * kSp * ola; e.sd += 6 * kSp * Math.sin((t - T.gSpook0) * 5); e.si += 6 * kSp * Math.sin((t - T.gSpook0) * 5 + 1.5); }
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.sudor = 0.7 * tramo(t, T.gLio0 + 0.2, T.gLio0 + 0.5) * (1 - tramo(t, T.chorro, T.chorro + 0.3));
    manosG(p, t, kSp);
    p.kSp = kSp;
    return p;
  }
  // punta de los pinchos (pantalla)
  const tufoDe = p => G.aPantalla(p, G.cabeza(p).a(TUFO));
  const tufo = t => tufoDe(poseG(t));
  // donde Sara le pinza el tupé (pantalla): algo por debajo de la punta
  function agarre(t) { const pg = poseG(t); return G.aPantalla(pg, G.cabeza(pg).a(AGARRE)); }
  // giro sobre sí mismo dentro de la niebla (escala horizontal del dibujo alrededor de los pinchos)
  const giroG = t => { const k = fase(t, T.gira0, T.gira1); return k <= 0 || k >= 1 ? 1 : Math.cos(TAU * suave(k)); };

  function manosG(p, t, kSp) {
    const rC = resolutor(G, p, "cerca"), rL = resolutor(G, p, "lejos");
    const bols = { bols: true };
    const u = t - T.gSpook0;
    // brazos de fantasma: estirados al frente, las manos colgando y ondulando arriba y abajo
    const spC = HM(470 + 16 * Math.sin(u * 2.1), 410 + 46 * Math.sin(u * 4.2), -1.55 + 0.35 * Math.sin(u * 4.2 - 0.8), RETUERCE(t, 1, 9), -1);
    const spL = HM(640 + 18 * Math.sin(u * 2.1), 396 - 46 * Math.sin(u * 4.2), -1.5 - 0.35 * Math.sin(u * 4.2 - 0.8), RETUERCE(t + 0.4, 1, 10), 1);
    // el lío: una mano cruzada sobre la barriga (la cercana, por delante), la otra arriba al frente; las muñecas ruedan
    const v = t - T.gLio0;
    const lioC = HM(300 + 10 * Math.sin(v * 7), 560 + 8 * Math.sin(v * 9), 2.6 + 0.7 * Math.sin(v * 6), D5(0.5, 0.7, 0.5, 0.4, 0.3), -1);
    const lioL = HM(560 + 14 * Math.sin(v * 5), 170 + 14 * Math.sin(v * 7), 1.0 + 0.9 * Math.sin(v * 5.5), RETUERCE(t, 0.6, 7), 1);
    // equilibrio al saltar atrás
    const atrasC = HM(40, 470, -2.2, TODOS(0.9), -1), atrasL = HM(600, 470, -1.2, TODOS(0.9), 1);
    const topeC = HM(250, 430, -1.3, D5(0.6, 0.6, 0.5, 0.5, 0.5), -1), topeL = HM(470, 560, -1.9, TODOS(0.6), 1);
    // susto: arriba las dos (la lejana al frente para no cruzarse la cara)
    const sustoC = HM(40, 90, 1.5, TODOS(1), -1), sustoL = HM(580, 110, 1.7, TODOS(1), 1);
    const agachaC = HM(330, 620, -1.2, TODOS(0.5), -1), agachaL = HM(520, 620, -1.6, TODOS(0.5), 1);
    // el tirón: los brazos se le quedan colgando, la lejana al frente
    const tironC = HM(70, 520, -1.8, TODOS(0.8), -1), tironL = HM(560, 520, -1.5, TODOS(0.8), 1);
    // la tos: puño cercano delante de la boca (pantalla, con la boca), la lejana colgando al frente
    const boca = { scr: () => { const q = G.aPantalla(p,G.boca(p)); return P(q.x + 4, q.y + 12); }, mu: 2.0, dedos: PUNO, dobla: -1 };
    const tosL = HM(470, 640, -1.7, TODOS(0.6), 1);
    // un solo brazo de fantasma, con cuidado
    const w = t - T.gBrazo0;
    const unoL = HM(630 + 8 * Math.sin(w * 1.8), 400 - 26 * Math.sin(w * 3.0), -1.55 - 0.25 * Math.sin(w * 3.0 - 0.8), RETUERCE(t, 0.8, 7), 1);
    const pistaC = [[0, 0, bols], [T.gSpook0, T.gSpook0 + 0.45, spC], [T.gLio0, T.gLio0 + 0.3, lioC], [T.gAtras0, T.gAtras0 + 0.2, atrasC],
      [T.gTope, T.gTope + 0.2, topeC], [T.chorro, T.chorro + 0.14, sustoC, salida], [T.gAgacha0, T.gAgacha1, agachaC],
      [T.tiron0, T.tiron1, tironC], [T.tos1 - 0.25, T.tos1 - 0.05, boca], [T.gRecupera, T.gRecupera + 0.4, bols]];
    const pistaL = [[0, 0, bols], [T.gSpook0 + 0.08, T.gSpook0 + 0.5, spL], [T.gLio0, T.gLio0 + 0.3, lioL], [T.gAtras0, T.gAtras0 + 0.2, atrasL],
      [T.gTope, T.gTope + 0.2, topeL], [T.chorro, T.chorro + 0.14, sustoL, salida], [T.gAgacha0, T.gAgacha1, agachaL],
      [T.tiron0, T.tiron1, tironL], [T.tiron1 + 0.1, T.tos1, tosL], [T.gRecupera, T.gRecupera + 0.4, bols], [T.gBrazo0, T.gBrazo1, unoL]];
    p.manoCerca = pista(pistaC, t, rC); p.manoLejos = pista(pistaL, t, rL);
  }

  function pose(t) { return { g: poseG(t), s: poseS(t) }; }

  /* =====================================================================================
   * DECORADO: club gótico (se pinta una vez)
   * ===================================================================================== */
  let fondo = null, humoSpr = null, nubeSpr = null, bolaSpr = null;
  const HORIZ = 372;                                   // donde la pared se junta con el suelo
  const VENTANAS = [{ x: 182, w: 112 }, { x: 512, w: 124 }, { x: 842, w: 112 }];
  const CANDELABROS = [{ x: 78, y: SUELO + 4, s: 1 }, { x: 952, y: SUELO + 4, s: 1 }];
  function ojiva(g, x, y0, w, alto, arco) {
    // arco apuntado: dos arcos de radio w que se cortan en la punta
    const l = x - w / 2, r = x + w / 2;
    g.moveTo(l, y0 + alto); g.lineTo(l, y0 + arco);
    g.quadraticCurveTo(l, y0 + arco * 0.25, x, y0); g.quadraticCurveTo(r, y0 + arco * 0.25, r, y0 + arco); g.lineTo(r, y0 + alto); g.closePath();
  }
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    // pared
    const pg = g.createLinearGradient(0, 0, 0, HORIZ); pg.addColorStop(0, "#0e0614"); pg.addColorStop(0.5, "#1e0c2e"); pg.addColorStop(1, "#2a1240");
    g.fillStyle = pg; g.fillRect(0, 0, W, HORIZ);
    // sillares de piedra
    g.save(); g.lineWidth = 1.2;
    for (let fila = 0, y = 14; y < HORIZ; fila++, y += 30) {
      g.strokeStyle = "rgba(0,0,0,0.28)"; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
      g.strokeStyle = "rgba(190,140,255,0.05)"; g.beginPath(); g.moveTo(0, y + 1.5); g.lineTo(W, y + 1.5); g.stroke();
      for (let x = (fila % 2) * 34 - 20; x < W; x += 68 + 10 * hash(fila * 7 + x)) { g.strokeStyle = "rgba(0,0,0,0.24)"; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 30); g.stroke(); }
    }
    g.restore();
    // luz violeta general desde arriba (dos focos) y el centro
    for (const [x, col, r] of [[300, "150,70,230", 360], [720, "200,60,180", 360], [512, "120,80,255", 260]]) {
      const rg = g.createRadialGradient(x, 120, 10, x, 200, r); rg.addColorStop(0, `rgba(${col},0.28)`); rg.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
    }
    for (const v of VENTANAS) ventana(g, v.x, v.w);
    // zócalo
    g.fillStyle = "#12081a"; g.fillRect(0, HORIZ - 16, W, 16);
    g.fillStyle = "rgba(200,150,255,0.08)"; g.fillRect(0, HORIZ - 16, W, 2);
    suelo(g);
    // luz de las vidrieras sobre el suelo
    for (const v of VENTANAS) {
      g.save(); g.globalCompositeOperation = "lighter";
      const lg = g.createLinearGradient(0, HORIZ, 0, H); lg.addColorStop(0, "rgba(170,90,255,0.16)"); lg.addColorStop(1, "rgba(170,90,255,0)");
      g.fillStyle = lg; g.beginPath(); g.moveTo(v.x - v.w * 0.42, HORIZ); g.lineTo(v.x + v.w * 0.42, HORIZ); g.lineTo(v.x + v.w * 0.9, H); g.lineTo(v.x - v.w * 0.9, H); g.closePath(); g.fill();
      g.restore();
    }
    cortinas(g);
    for (const cd of CANDELABROS) candelabro(g, cd);
    // cadena de la bola de espejos
    g.strokeStyle = "#4a4058"; g.lineWidth = 2; g.beginPath(); g.moveTo(512, 0); g.lineTo(512, 18); g.stroke();
    // viñeta
    const v = g.createRadialGradient(512, 300, 250, 512, 300, 720); v.addColorStop(0, "rgba(4,1,8,0)"); v.addColorStop(1, "rgba(4,1,8,0.62)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    return c;
  }
  function ventana(g, x, w) {
    const y0 = 44, alto = 262, arco = 86;
    g.save(); g.lineJoin = "round";
    // marco de piedra
    g.beginPath(); ojiva(g, x, y0 - 12, w + 26, alto + 18, arco + 8); g.fillStyle = "#2c1d3a"; g.fill();
    g.strokeStyle = "rgba(0,0,0,0.5)"; g.lineWidth = 2; g.stroke();
    // cristal: brilla desde fuera (violeta y magenta)
    g.beginPath(); ojiva(g, x, y0, w, alto, arco);
    const cg = g.createLinearGradient(0, y0, 0, y0 + alto); cg.addColorStop(0, "#5a2a9a"); cg.addColorStop(0.45, "#3a1f78"); cg.addColorStop(1, "#22124a");
    g.fillStyle = cg; g.fill();
    g.save(); g.clip();
    const rg = g.createRadialGradient(x, y0 + 110, 6, x, y0 + 130, w * 1.1); rg.addColorStop(0, "rgba(255,140,230,0.45)"); rg.addColorStop(1, "rgba(255,140,230,0)");
    g.fillStyle = rg; g.fillRect(x - w, y0, w * 2, alto);
    // paneles de color de la vidriera
    for (let i = 0; i < 18; i++) {
      const px = x - w / 2 + (i % 3) * w / 3, py = y0 + arco + Math.floor(i / 3) * 30;
      g.fillStyle = ["rgba(200,60,160,0.22)", "rgba(80,60,220,0.2)", "rgba(150,90,255,0.18)", "rgba(230,90,120,0.16)"][Math.floor(hash(i * 3.3 + x) * 4)];
      g.fillRect(px + 2, py + 2, w / 3 - 4, 26);
    }
    // plomos (tracería): parteluz, travesaños y un rosetón en el arco
    g.strokeStyle = "#140a1e"; g.lineWidth = 4;
    g.beginPath(); g.moveTo(x, y0 + arco - 10); g.lineTo(x, y0 + alto); g.stroke();
    g.lineWidth = 2.2;
    for (let k = 1; k < 3; k++) { g.beginPath(); g.moveTo(x - w / 2 + k * w / 3, y0 + arco + 8); g.lineTo(x - w / 2 + k * w / 3, y0 + alto); g.stroke(); }
    for (let y = y0 + arco + 30; y < y0 + alto; y += 30) { g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x + w / 2, y); g.stroke(); }
    const rr = w * 0.22, ry = y0 + arco * 0.62;
    g.lineWidth = 3.5; g.beginPath(); g.arc(x, ry, rr, 0, TAU); g.stroke();
    g.lineWidth = 2; for (let k = 0; k < 6; k++) { const a = k * TAU / 6; g.beginPath(); g.arc(x + Math.cos(a) * rr * 0.5, ry + Math.sin(a) * rr * 0.5, rr * 0.5, 0, TAU); g.stroke(); }
    g.fillStyle = "rgba(255,170,240,0.5)"; g.beginPath(); g.arc(x, ry, rr * 0.24, 0, TAU); g.fill();
    g.restore();
    g.lineWidth = 5; g.strokeStyle = "#140a1e"; g.beginPath(); ojiva(g, x, y0, w, alto, arco); g.stroke();
    // alféizar
    g.fillStyle = "#33233f"; g.fillRect(x - w / 2 - 18, y0 + alto + 4, w + 36, 10); g.fillStyle = "rgba(0,0,0,0.4)"; g.fillRect(x - w / 2 - 18, y0 + alto + 14, w + 36, 4);
    g.restore();
  }
  function suelo(g) {
    // baldosas en rombo con perspectiva (punto de fuga en el centro, arriba)
    const fy = 120, fx = 512;
    g.save();
    g.beginPath(); g.rect(0, HORIZ, W, H - HORIZ); g.clip();
    g.fillStyle = "#0c0612"; g.fillRect(0, HORIZ, W, H - HORIZ);
    const filas = []; for (let i = 0, y = HORIZ; y < H + 60; i++) { filas.push(y); y += 9 + i * 7; }
    const yA = y => (y - fy) / (HORIZ - fy);       // escala de perspectiva en la fila y
    for (let i = 0; i < filas.length - 1; i++) {
      const ya = filas[i], yb = filas[i + 1], sa = yA(ya), sb = yA(yb);
      for (let j = -24; j < 24; j++) {
        if (((i + j) & 1) === 0) continue;
        const xa0 = fx + (j * 64) * sa, xa1 = fx + ((j + 1) * 64) * sa, xb0 = fx + (j * 64) * sb, xb1 = fx + ((j + 1) * 64) * sb;
        g.fillStyle = "#1c0e2a"; g.beginPath(); g.moveTo(xa0, ya); g.lineTo(xa1, ya); g.lineTo(xb1, yb); g.lineTo(xb0, yb); g.closePath(); g.fill();
      }
    }
    // brillo del suelo pulido
    const bg = g.createLinearGradient(0, HORIZ, 0, H); bg.addColorStop(0, "rgba(140,80,220,0.16)"); bg.addColorStop(0.4, "rgba(60,30,100,0.06)"); bg.addColorStop(1, "rgba(0,0,0,0.3)");
    g.fillStyle = bg; g.fillRect(0, HORIZ, W, H - HORIZ);
    g.restore();
  }
  function cortinas(g) {
    for (const lado of [0, 1]) {
      const x0 = lado ? W - 84 : 0, x1 = lado ? W : 84;
      const cg = g.createLinearGradient(x0, 0, x1, 0);
      for (let k = 0; k <= 6; k++) cg.addColorStop(k / 6, k % 2 ? "#3c0f30" : "#1a0614");
      g.fillStyle = cg;
      g.beginPath();
      if (lado) { g.moveTo(x1, 0); g.lineTo(x0 + 26, 0); g.quadraticCurveTo(x0 - 6, 300, x0 + 18, H); g.lineTo(x1, H); }
      else { g.moveTo(x0, 0); g.lineTo(x1 - 26, 0); g.quadraticCurveTo(x1 + 6, 300, x1 - 18, H); g.lineTo(x0, H); }
      g.closePath(); g.fill();
      g.strokeStyle = "rgba(0,0,0,0.5)"; g.lineWidth = 2; g.stroke();
    }
    // bambalina arriba, con ondas
    g.fillStyle = "#2a0a22";
    g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); g.lineTo(W, 22);
    for (let x = W; x > 0; x -= 64) g.quadraticCurveTo(x - 32, 46, x - 64, 22);
    g.closePath(); g.fill();
    g.strokeStyle = "rgba(220,150,255,0.18)"; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(W, 22); for (let x = W; x > 0; x -= 64) g.quadraticCurveTo(x - 32, 46, x - 64, 22); g.stroke();
  }
  // candelabro de hierro de pie con tres velas (las llamas se pintan aparte)
  const VELAS = [];
  function candelabro(g, cd) {
    const { x, y } = cd, alto = 250;
    g.save(); g.strokeStyle = "#0a0610"; g.fillStyle = "#0a0610"; g.lineCap = "round"; g.lineJoin = "round";
    // pie de tres patas
    g.lineWidth = 5; g.beginPath(); g.moveTo(x - 26, y); g.quadraticCurveTo(x - 8, y - 10, x, y - 30); g.quadraticCurveTo(x + 8, y - 10, x + 26, y); g.stroke();
    // fuste con nudos
    g.lineWidth = 5; g.beginPath(); g.moveTo(x, y - 30); g.lineTo(x, y - alto); g.stroke();
    for (const k of [0.3, 0.55, 0.8]) { g.beginPath(); g.ellipse(x, y - alto * k, 6, 4, 0, 0, TAU); g.fill(); }
    // brazos curvos
    g.lineWidth = 4;
    g.beginPath(); g.moveTo(x, y - alto + 20); g.bezierCurveTo(x - 10, y - alto + 40, x - 40, y - alto + 40, x - 40, y - alto + 10); g.stroke();
    g.beginPath(); g.moveTo(x, y - alto + 20); g.bezierCurveTo(x + 10, y - alto + 40, x + 40, y - alto + 40, x + 40, y - alto + 10); g.stroke();
    // platillos y velas
    for (const dx of [-40, 0, 40]) {
      const vy = y - alto + (dx ? 10 : -6), vh = dx ? 30 : 38;
      g.fillStyle = "#0a0610"; g.beginPath(); g.ellipse(x + dx, vy, 10, 3.5, 0, 0, TAU); g.fill();
      const cg = g.createLinearGradient(x + dx - 5, 0, x + dx + 5, 0); cg.addColorStop(0, "#d9cfc0"); cg.addColorStop(0.5, "#f4ecdc"); cg.addColorStop(1, "#b9ab98");
      g.fillStyle = cg; g.fillRect(x + dx - 5, vy - vh, 10, vh);
      // goterones de cera
      g.fillStyle = "#efe6d4"; g.beginPath(); g.ellipse(x + dx - 3, vy - vh + 8, 2, 6, 0, 0, TAU); g.ellipse(x + dx + 3.5, vy - vh + 5, 1.6, 4, 0, 0, TAU); g.fill();
      g.strokeStyle = "#1a1412"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x + dx, vy - vh); g.lineTo(x + dx, vy - vh - 4); g.stroke();
      VELAS.push({ x: x + dx, y: vy - vh - 4, f: hash(x + dx) * 10 });
    }
    g.restore();
  }
  function llamas(g, t) {
    g.save();
    for (const v of VELAS) {
      const fl = ruido(t * 7 + v.f), fl2 = ruido(t * 11 + v.f * 2);
      const h = 13 + 2.5 * fl, lado = 1.5 * fl2;
      g.globalCompositeOperation = "lighter";
      const rg = g.createRadialGradient(v.x, v.y - 6, 1, v.x, v.y - 6, 30); rg.addColorStop(0, `rgba(255,170,90,${0.32 + 0.06 * fl})`); rg.addColorStop(1, "rgba(255,120,60,0)");
      g.fillStyle = rg; g.fillRect(v.x - 30, v.y - 36, 60, 60);
      g.globalCompositeOperation = "source-over";
      g.fillStyle = "#ffcf6a"; g.beginPath(); g.moveTo(v.x - 4, v.y); g.quadraticCurveTo(v.x - 5, v.y - h * 0.5, v.x + lado, v.y - h); g.quadraticCurveTo(v.x + 5, v.y - h * 0.5, v.x + 4, v.y); g.closePath(); g.fill();
      g.fillStyle = "#fff4cc"; g.beginPath(); g.ellipse(v.x + lado * 0.3, v.y - 4, 1.8, 3.6, 0, 0, TAU); g.fill();
    }
    g.restore();
  }
  // bola de espejos: gira despacio; facetas que brillan y manchas de luz que cruzan la pared
  const BOLA = P(512, 40), BOLA_R = 22;
  function creaBola() {
    const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d");
    g.translate(32, 32);
    const rg = g.createRadialGradient(-7, -8, 2, 0, 0, BOLA_R); rg.addColorStop(0, "#efe8ff"); rg.addColorStop(0.5, "#9a8cc0"); rg.addColorStop(1, "#3a3050");
    g.fillStyle = rg; g.beginPath(); g.arc(0, 0, BOLA_R, 0, TAU); g.fill();
    g.save(); g.beginPath(); g.arc(0, 0, BOLA_R, 0, TAU); g.clip();
    g.strokeStyle = "rgba(20,14,30,0.55)"; g.lineWidth = 0.8;
    for (let k = -3; k <= 3; k++) { const y = k * BOLA_R / 3.6; g.beginPath(); g.moveTo(-BOLA_R, y); g.lineTo(BOLA_R, y); g.stroke(); }
    for (let k = -3; k <= 3; k++) { g.beginPath(); g.ellipse(0, 0, Math.abs(k) * BOLA_R / 3.4, BOLA_R, 0, 0, TAU); g.stroke(); }
    g.restore();
    g.strokeStyle = "#140e1c"; g.lineWidth = 1.6; g.beginPath(); g.arc(0, 0, BOLA_R, 0, TAU); g.stroke();
    return c;
  }
  function bolaEspejos(g, t) {
    if (!bolaSpr) bolaSpr = creaBola();
    g.drawImage(bolaSpr, BOLA.x - 32, BOLA.y - 32);
    g.save(); g.globalCompositeOperation = "lighter";
    // manchas de luz en la pared (giran con la bola: se mueven a la derecha y se funden en los bordes)
    for (let i = 0; i < 16; i++) {
      const u = ((hash(i * 1.3) + t * 0.035) % 1), x = 90 + u * 860, y = 70 + 260 * hash(i * 2.9) + 10 * Math.sin(t * 0.4 + i);
      const a = Math.sin(Math.PI * u) * (0.12 + 0.08 * hash(i * 5.1));
      g.fillStyle = `rgba(230,210,255,${a})`; g.beginPath(); g.ellipse(x, y, 4.5, 3, 0.3, 0, TAU); g.fill();
    }
    // facetas que destellan
    for (let i = 0; i < 6; i++) {
      const k = Math.pow(Math.max(0, Math.sin(t * 1.3 + i * 2.1)), 12);
      if (k < 0.02) continue;
      const a = i * 1.7 + t * 0.6, x = BOLA.x + Math.cos(a) * BOLA_R * 0.6, y = BOLA.y + Math.sin(i * 2.3) * BOLA_R * 0.6;
      g.globalAlpha = k; g.fillStyle = "#ffffff";
      estrella(g, x, y, 6, 4, 0.4, 0.22); g.fill();
    }
    g.restore();
  }

  /* ---------- niebla ---------- */
  function creaHumo() {
    const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d");
    const r = g.createRadialGradient(64, 64, 4, 64, 64, 64); r.addColorStop(0, "rgba(196,178,226,0.55)"); r.addColorStop(0.6, "rgba(186,166,220,0.22)"); r.addColorStop(1, "rgba(180,160,220,0)");
    g.fillStyle = r; g.fillRect(0, 0, 128, 128); return c;
  }
  // nube densa: maciza hasta la mitad y con el borde suave
  function creaNube() {
    const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d");
    const r = g.createRadialGradient(64, 64, 2, 64, 64, 64); r.addColorStop(0, "rgba(214,198,238,1)"); r.addColorStop(0.55, "rgba(196,178,228,0.95)"); r.addColorStop(1, "rgba(180,160,220,0)");
    g.fillStyle = r; g.fillRect(0, 0, 128, 128); return c;
  }
  // niebla baja que se arrastra por el suelo (capa 0 detrás, capa 1 delante)
  function nieblaBaja(g, t, capa) {
    g.save();
    for (let i = 0; i < 10; i++) {
      if ((i % 2) !== capa) continue;
      const x = ((60 + i * 120 + t * (10 + 5 * hash(i + 1))) % 1260) - 120, y = SUELO - 6 + 24 * hash(i + 4) + 6 * Math.sin(t * 0.5 + i) + capa * 26;
      const s = 1.6 + 0.7 * hash(i + 9);
      const borde = clamp((x + 120) / 160) * clamp((1140 - x) / 160);
      g.globalAlpha = (0.28 + 0.12 * hash(i + 2)) * borde * (capa ? 0.65 : 1);
      g.drawImage(humoSpr, x - 64 * s * 1.6, y - 64 * s * 0.55, 128 * s * 1.6, 128 * s * 0.55);
    }
    g.restore();
  }
  // la máquina de humo (en el suelo, detrás de Guillermo): se sacude con el taconazo y se le enciende el piloto
  function maquina(g, t) {
    const {x:dx,y:dy}=vibracion(t);
    const luz = tramo(t, T.gTope, T.gTope + 0.05) * (1 - tramo(t, T.disipa1 - 0.6, T.disipa1));
    const { x0, x1, top } = MAQ;
    g.save(); g.translate(dx, dy); g.lineJoin = "round";
    // cable
    g.strokeStyle = "#0a0810"; g.lineWidth = 3; g.beginPath(); g.moveTo(x1 - 6, SUELO - 10); g.bezierCurveTo(x1 + 30, SUELO - 6, x1 + 40, SUELO + 10, x1 + 90, SUELO + 6); g.stroke();
    // cuerpo
    const cg = g.createLinearGradient(0, top, 0, SUELO); cg.addColorStop(0, "#3a3446"); cg.addColorStop(1, "#16121c");
    g.fillStyle = cg; g.beginPath(); g.roundRect ? g.roundRect(x0, top, x1 - x0, SUELO - top - 4, 6) : g.rect(x0, top, x1 - x0, SUELO - top - 4); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.stroke();
    // rejilla
    g.strokeStyle = "rgba(0,0,0,0.6)"; g.lineWidth = 2;
    for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(x0 + 34 + k * 9, top + 14); g.lineTo(x0 + 34 + k * 9, SUELO - 16); g.stroke(); }
    // asa
    g.strokeStyle = "#0e0b14"; g.lineWidth = 4; g.beginPath(); g.moveTo(x0 + 24, top); g.quadraticCurveTo(x0 + 43, top - 18, x1 - 18, top); g.stroke();
    // boquilla (tubo corto hacia arriba a la izquierda)
    g.save(); g.translate(MAQ.boq.x, MAQ.boq.y); g.rotate(angTubo);
    g.fillStyle = "#24202c"; g.fillRect(-26, -7, 30, 14); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(-26, -7, 30, 14);
    g.fillStyle = "#0a080e"; g.fillRect(-30, -8, 6, 16);
    g.restore();
    // patas
    g.fillStyle = "#0a080e"; g.fillRect(x0 + 6, SUELO - 6, 12, 6); g.fillRect(x1 - 18, SUELO - 6, 12, 6);
    // piloto: rojo apagado → verde encendido
    const px = x1 - 16, py = top + 16;
    g.fillStyle = luz > 0.5 ? "#48ff7a" : "#5a1418"; g.beginPath(); g.arc(px, py, 4, 0, TAU); g.fill();
    if (luz > 0.01) { g.globalCompositeOperation = "lighter"; g.globalAlpha = luz * (0.6 + 0.2 * Math.sin(t * 9)); g.fillStyle = "rgba(80,255,130,0.5)"; g.beginPath(); g.arc(px, py, 11, 0, TAU); g.fill(); }
    g.restore();
  }
  // el siseo (antes) y el chorro: sale de la boquilla y además la niebla borbotea desde el suelo alrededor de él
  function chorro(g, t) {
    const kS = campana(t, T.gTope + 0.12, T.chorro + 0.1), kC = campana(t, T.chorro, T.chorro + 1.0);
    if (kS < 0.01 && kC < 0.01) return;
    const b=bocaTubo(t), dir=dirTubo;
    g.save();
    // siseo: bocanadas pequeñas
    for (let i = 0; i < 4 && kS > 0.01; i++) {
      const u = ((t * 2.2 + i * 0.25) % 1), d = 6 + u * 34;
      g.globalAlpha = kS * Math.sin(Math.PI * u) * 0.9; const s = 0.18 + u * 0.3;
      g.drawImage(humoSpr, b.x + dir.x * d - 64 * s, b.y + dir.y * d - 64 * s, 128 * s, 128 * s);
    }
    if (kC > 0.01) {
      // chorro: bolas que salen disparadas de la boquilla y se abren
      for (let i = 0; i < 10; i++) {
        const u = ((t * 2.8 + i / 10) % 1), d = 10 + u * 250;
        const ox = 30 * Math.sin(i * 2.1 + t * 3) * u, s = 0.3 + u * 1.25;
        g.globalAlpha = kC * Math.min(1, u * 6) * (1 - u * 0.55);
        g.drawImage(nubeSpr, b.x + dir.x * d + ox - 64 * s, b.y + dir.y * d - 64 * s, 128 * s, 128 * s);
      }
      // borbotones que suben del suelo alrededor de Guillermo
      const k2 = tramo(t, T.chorro, T.chorro + 0.2) * (1 - tramo(t, T.chorro + 0.55, T.chorro + 1.0));
      for (let i = 0; i < 8; i++) {
        const u = ((t * 1.9 + hash(i * 3.7)) % 1), x = BANCO.cx + 40 + (hash(i * 1.3) - 0.5) * 230 + 16 * Math.sin(t * 2 + i);
        const y = SUELO + 10 - u * 300, s = 0.45 + u * 0.9;
        g.globalAlpha = k2 * Math.sin(Math.PI * u) * 0.95;
        g.drawImage(nubeSpr, x - 64 * s, y - 64 * s, 128 * s, 128 * s);
      }
    }
    g.restore();
  }
  // el banco de niebla: una loma maciza de borde festoneado que hierve (tapa a Guillermo por completo)
  function nieblaCuerpo(g, t, b) {
    if (b.k < 0.005) return;
    const half = b.ancho / 2, x0 = BANCO.cx - half, x1 = BANCO.cx + half, alto = FONDO_N - b.top;
    g.save(); g.globalAlpha = Math.min(1, b.k * 1.15);
    const gr = g.createLinearGradient(0, b.top - 14, 0, FONDO_N);
    gr.addColorStop(0, "#ddd0f2"); gr.addColorStop(0.18, "#bba8dc"); gr.addColorStop(0.6, "#8f78bc"); gr.addColorStop(1, "#5d4a86");
    g.fillStyle = gr; g.beginPath(); g.moveTo(x0, FONDO_N);
    const pts = [];
    for (let x = x0; x <= x1 + 0.1; x += 4) { const y = contorno(b, t, Math.min(x, x1 - 0.01)); pts.push(x, y); g.lineTo(x, y); }
    g.lineTo(x1, FONDO_N); g.closePath();
    for (const [dd, fy, fr, ph] of BULTOS_LADO) {
      const r = fr * b.ancho * (1 + 0.05 * Math.sin(t * 1.3 + ph)), x = BANCO.cx + dd * half, y = b.top + fy * alto;
      g.moveTo(x + r, y); g.arc(x, y, r, 0, TAU);
    }
    g.fill();
    // luces del club sobre la niebla: violeta por la izquierda, magenta por la derecha
    const lg = g.createLinearGradient(x0, 0, x1, 0); lg.addColorStop(0, "rgba(110,90,255,0.22)"); lg.addColorStop(0.5, "rgba(180,120,255,0)"); lg.addColorStop(1, "rgba(255,90,200,0.24)");
    g.fillStyle = lg; g.fill();
    // lóbulos: arcos un poco más oscuros donde se montan las bocanadas
    g.lineCap = "round";
    g.strokeStyle = "rgba(78,58,118,0.32)"; g.lineWidth = 3;
    for (const [dd, fy, fr, ph] of BULTOS_LADO) {
      const r = fr * b.ancho * (1 + 0.05 * Math.sin(t * 1.3 + ph)), x = BANCO.cx + dd * half, y = b.top + fy * alto, sg = dd < 0 ? 1 : -1;
      g.beginPath(); g.arc(x, y, r * 0.96, sg > 0 ? -0.2 : Math.PI - 0.9, sg > 0 ? 0.9 : Math.PI + 0.2); g.stroke();
    }
    for (let i = 0; i < 3; i++) {
      const x = BANCO.cx + (i - 1) * b.ancho * 0.27 + 6 * Math.sin(t * 0.6 + i * 2), y = b.top + alto * (0.42 + 0.16 * hash(i * 4.1)) + 4 * Math.sin(t * 0.9 + i), r = b.ancho * (0.12 + 0.03 * hash(i));
      if (y + r > FONDO_N - 10) continue;
      g.beginPath(); g.arc(x, y, r, Math.PI * 1.15, Math.PI * 1.75); g.stroke();
    }
    // luz de arriba: un ribete claro siguiendo los festones (solo por arriba)
    g.strokeStyle = "rgba(250,244,255,0.62)"; g.lineWidth = 2.2; g.lineJoin = "round"; g.beginPath();
    let pinta = false;
    for (let i = 0; i < pts.length; i += 2) { const y = pts[i + 1] + 2.2; if (y > b.top + 70) { pinta = false; continue; } if (pinta) g.lineTo(pts[i], y); else { g.moveTo(pts[i], y); pinta = true; } }
    g.stroke();
    g.restore();
    // halo suave por los lados
    g.save();
    for (let i = 0; i < BULTOS_LADO.length; i++) {
      const [dd, fy, fr] = BULTOS_LADO[i], x = BANCO.cx + dd * half * 1.08, y = b.top + fy * alto, s = fr * b.ancho / 40;
      g.globalAlpha = b.k * 0.42;
      g.drawImage(humoSpr, x - 64 * s + 5 * Math.sin(t * 0.9 + i), y - 64 * s, 128 * s, 128 * s);
    }
    g.restore();
  }
  // velo de la niebla: hilachas que suben del borde y se deshacen (por encima de todo lo que asoma)
  function nieblaVelo(g, t, b) {
    if (b.k < 0.005) return;
    g.save();
    for (let i = 0; i < 11; i++) {
      const per = 2.2 + 0.6 * hash(i * 5.3), u = ((t / per + hash(i * 3.1)) % 1);
      const x = BANCO.cx + (hash(i * 1.9) - 0.5) * b.ancho * 0.92 + 10 * Math.sin(t * 0.7 + i);
      const y = contorno(b, t, x) + 8 - 30 * u, s = 0.3 + 0.45 * u;
      g.globalAlpha = b.k * 0.4 * Math.sin(Math.PI * u);
      g.drawImage(humoSpr, x - 64 * s * 1.3, y - 64 * s, 128 * s * 1.3, 128 * s);
    }
    g.restore();
  }
  function dibujaG(g, t, pg) {
    const gs = giroG(t);
    if (gs === 1) { G.dibujar(g, pg, t); return; }
    const q = tufoDe(pg); g.save(); g.translate(q.x, 0); g.scale(gs, 1); g.translate(-q.x, 0); G.dibujar(g, pg, t); g.restore();
  }
  // los pinchos dentro de la niebla: estela al deslizarse y rayas de remolino al girar
  function efectosTufo(g, t, pg) {
    if (t < T.tufo1 || t > T.tiron0) return;
    const q = tufoDe(pg), v = (paseo(t) - paseo(t - 0.08)) / 0.08;
    g.save();
    const kv = clamp((Math.abs(v) - 40) / 120);
    if (kv > 0.01) for (let i = 1; i <= 3; i++) {
      const x = q.x - Math.sign(v) * (14 + 16 * i), y = bordeNiebla(t, x) - 2, s = 0.18 + 0.06 * i;
      g.globalAlpha = kv * (0.75 - 0.18 * i);
      g.drawImage(nubeSpr, x - 64 * s * 1.6, y - 64 * s, 128 * s * 1.6, 128 * s);
    }
    const kg = campana(t, T.gira0 - 0.05, T.gira1 + 0.1);
    if (kg > 0.01) {
      g.strokeStyle = `rgba(255,248,255,${0.85 * kg})`; g.lineWidth = 2.2; g.lineCap = "round";
      for (let i = 0; i < 3; i++) {
        const a0 = t * 14 + i * TAU / 3, cy = q.y + 12;
        g.beginPath(); g.ellipse(q.x, cy, 30 + 4 * i, 9 + i, 0, a0, a0 + 1.3); g.stroke();
      }
    }
    g.restore();
  }
  // ¡puf!: la niebla estalla en bocanadas que se van hacia fuera, y quedan jirones por el suelo
  function estallido(g, t) {
    const k = fase(t, T.sSuelta - 0.02, T.sSuelta + 0.95); if (k <= 0 || k >= 1) return;
    g.save();
    for (let i = 0; i < 12; i++) {
      const lado = i % 2 ? 1 : -1, j = Math.floor(i / 2), h = 0.15 + 0.14 * j + 0.04 * hash(i);
      const x = BANCO.cx + lado * (110 + 40 * hash(i * 2.3) + 150 * salida(k)), y = SUELO - h * 330 - 40 * k * hash(i + 1);
      const s = 0.7 + 0.7 * k + 0.3 * hash(i * 3.1);
      g.globalAlpha = Math.min(1, k * 8) * (1 - k) * 0.8;
      g.drawImage(humoSpr, x - 64 * s * 1.2, y - 64 * s, 128 * s * 1.2, 128 * s);
    }
    g.restore();
  }
  function restos(g, t) {
    const k = tramo(t, T.sSuelta - 0.1, T.sSuelta + 0.35) * (1 - tramo(t, T.disipa1 - 0.9, T.disipa1)); if (k < 0.005) return;
    g.save();
    for (let i = 0; i < 7; i++) {
      const x = 470 + i * 62 + 18 * Math.sin(t * 0.5 + i * 1.7) + 10 * (t - T.sSuelta), y = SUELO - 4 + 14 * hash(i * 1.9), s = 1.0 + 0.5 * hash(i);
      g.globalAlpha = k * (0.42 + 0.16 * hash(i * 4.4));
      g.drawImage(humoSpr, x - 64 * s * 1.7, y - 64 * s * 0.6, 128 * s * 1.7, 128 * s * 0.6);
    }
    g.restore();
  }
  // nube que sale con él al tirar, y bocanadas al toser
  function nubesG(g, t, pg) {
    g.save();
    // ¡puf!: al salir, bocanadas que se abren alrededor de los hombros y suben
    const kN = fase(t, T.sSuelta, T.sSuelta + 1.0);
    if (kN > 0 && kN < 1) {
      const c = G.aPantalla(pg, G.tronco(pg)(P(250, 330)));
      for (let i = 0; i < 7; i++) {
        const a = Math.PI + (i - 3) * 0.5, d = 26 + 64 * salida(kN), s = 0.36 + 0.5 * kN;
        g.globalAlpha = Math.min(1, kN * 10) * (1 - kN) * 0.8;
        g.drawImage(humoSpr, c.x + Math.sin(a) * d * 1.3 - 64 * s, c.y + Math.cos(a) * d * 0.7 - 30 * kN - 64 * s, 128 * s, 128 * s);
      }
    }
    for (const tt of [T.tos1, T.tos2]) {
      const k = fase(t, tt, tt + 0.7); if (k <= 0 || k >= 1) continue;
      const q=origenTos(tt);
      for (let i = 0; i < 3; i++) {
        const d = 44 * salida(k) * (1 + 0.3 * i), s = 0.14 + 0.24 * k + 0.05 * i;
        g.globalAlpha = Math.min(1,k*28)*(1-k)*0.85;
        g.drawImage(nubeSpr, q.x - d - 64 * s, q.y - (6 + 12 * i) * k - 64 * s, 128 * s, 128 * s);
      }
    }
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrella(g, x, y, r, n, giro, hueco = 0.45) {
    g.beginPath();
    for (let i = 0; i < n * 2; i++) { const a = giro + i * Math.PI / n, rr = i % 2 ? r * hueco : r; const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; if (i) g.lineTo(px, py); else g.moveTo(px, py); }
    g.closePath();
  }
  // el taconazo contra la máquina
  function golpe(g, t) {
    const k = campana(t, T.gTope, T.gTope + 0.3); if (k < 0.01) return;
    g.save(); g.globalAlpha = k; const q=talon(poseG(T.gTope)); estrella(g, q.x, q.y, 9 + 8 * k, 6, 0.3, 0.42); g.fillStyle = "#fff2b0"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.stroke(); g.restore();
  }
  // estrellitas de mareo al salir
  function mareo(g, t, pg) {
    const ks = tramo(t, T.tiron1, T.tiron1 + 0.2) * (1 - tramo(t, T.gRecupera - 0.2, T.gRecupera + 0.2));
    if (ks < 0.01) return;
    const cc = G.aPantalla(pg, G.cabeza(pg).a(P(760, 250)));
    g.save(); g.globalAlpha = ks;
    for (let i = 0; i < 4; i++) { const a = t * 6 + i * TAU / 4; estrella(g, cc.x + Math.cos(a) * 30, cc.y + Math.sin(a) * 8 - 6, 6, 5, t * 4 + i); g.fillStyle = "#ffe066"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke(); }
    g.restore();
  }
  function sombra(g, x, ancho, k = 1) { g.globalAlpha = k; g.beginPath(); g.ellipse(x, SUELO + 2, ancho, 7, 0, 0, TAU); g.fill(); g.globalAlpha = 1; }

  /* ---------- cámara: acercamientos suaves (parada en cada clave) ---------- */
  const CAM = [[0, 1, 512, 300], [6.4, 1, 512, 300], [7.5, 1.25, 585, 330], [10.2, 1.25, 585, 330], [10.75, 1.3, 572, 334], [11.6, 1.3, 572, 334], [12.6, 1.06, 530, 306]];
  function camara(t) {
    let i = 0; while (i < CAM.length - 1 && CAM[i + 1][0] <= t) i++;
    const a = CAM[i], b = CAM[Math.min(CAM.length - 1, i + 1)], u = b === a ? 0 : suave(fase(t, a[0], b[0]));
    const k = 1 / lerp(1 / a[1], 1 / b[1], u);
    let f = P(lerp(a[2], b[2], u), lerp(a[3], b[3], u));
    const hx = 512 / k, hy = 300 / k;
    f = P(clamp(f.x, hx, W - hx), clamp(f.y, hy, H - hy));
    return { k, f };
  }

  class GuillermoSaraBaileGotico extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !S.listo()) return;
      if (!fondo) { fondo = creaFondo(); humoSpr = creaHumo(); nubeSpr = creaNube(); }
      const luz = tramo(t, NEGRO_INICIO, 0.8) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02));
      const pg = poseG(t), ps = poseS(t);
      g.save();
      const cam = camara(t);
      g.translate(512, 300); g.scale(cam.k, cam.k); g.translate(-cam.f.x, -cam.f.y);
      g.drawImage(fondo, 0, 0);
      bolaEspejos(g, t);
      llamas(g, t);
      nieblaBaja(g, t, 0);
      maquina(g, t);
      g.fillStyle = "rgba(0,0,0,0.4)";
      sombra(g, pg.x, 60 * Math.abs(giroG(t)) + 20, 1 - banco(t).k); sombra(g, ps.x, 56);
      // Guillermo debajo de la niebla (al sacarle se deshace de golpe y le deja a la vista)
      const b = banco(t);
      dibujaG(g, t, pg); chorro(g, t); nieblaCuerpo(g, t, b); nieblaVelo(g, t, b);
      efectosTufo(g, t, pg);
      estallido(g, t);
      restos(g, t);
      dibujaSara(g, ps, t);
      nubesG(g, t, pg);
      golpe(g, t);
      mareo(g, t, pg);
      nieblaBaja(g, t, 1);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00129.2", nombre: "Guillermo y Sara · El baile gótico", crear: () => new GuillermoSaraBaileGotico() });
  window.__A2D_00129_2 = { dibujaG, MAQ, bocaTubo, dirTubo, talon, yemaPinza, salto, origenTos, giroG, camara, pose, T, DUR, tufo, agarre, banco, bordeNiebla };
})();
