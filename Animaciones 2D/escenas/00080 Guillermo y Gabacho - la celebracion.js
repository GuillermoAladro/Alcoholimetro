"use strict";
/* 00080 · Guillermo y Gabacho · La celebración
 *
 * Negro → un salón-bar de noche con un suelo de tarima larguísimo y recién encerado: pared granate con
 * zócalo crema, guirnalda de banderines azul, blanco y rojo, una bufanda de rayas colgada, un cuadro con
 * un balón, la tele sobre un mueble bajo, el sofá de terciopelo verde empujado contra la pared, una
 * lámpara de pie y la ventana con la ciudad. Guillermo y Gabacho, de pie y en tensión, miran el partido.
 * ¡GOL! (la tele estalla en luces y confeti) → saltan los dos con los brazos arriba → Gabacho coge
 * carrerilla y se tira de rodillas: se desliza por la tarima, echado hacia atrás, con los brazos abiertos,
 * y se para justo delante de la cámara rugiendo (la cámara se acerca) → Guillermo, impresionado, se frota
 * las manos, da dos pasitos y se tira… y se para a los dos palmos; mira a cámara muerto de vergüenza
 * mientras Gabacho se parte de risa → se levanta, picado, se va corriendo de cuadro para coger carrerilla
 * y vuelve a toda mecha: se tira, pasa por delante de Gabacho (que da un saltito), sigue y sigue… y sale
 * de cuadro por la izquierda: ¡crac! (polvareda, el cuadro de la pared se cae, rueda un balón y la tele
 * se queda torcida) → Guillermo vuelve a entrar con la camiseta subida por la cabeza, como los futbolistas,
 * los brazos abiertos y andando a ciegas, y se da de morros con Gabacho (¡bonk!) → se abrazan y saltan
 * juntos; Guillermo saca la cabeza de la camiseta, con el pelo de punta otra vez, y sonríe a cámara;
 * Gabacho le guiña un ojo a la cámara → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`. Los pies que apoyan están quietos en el mundo
 * (pantalla) y se pasan a la hoja con aHoja; de rodillas, las piernas se calculan en la hoja. La
 * camiseta por la cabeza es una capa propia (capaCabeza) y la tripa al aire otra (capaTronco).
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, GB = Gabacho;
  const DUR = 14.9, TINTA = "#0b0a0e", TAU = Math.PI * 2;
  // carriles de profundidad (línea del suelo y escala)
  const FONDO = { suelo: 486, s: 0.27 }, MEDIO = { suelo: 528, s: 0.285 }, FRENTE = { suelo: 574, s: 0.3 };
  const PARED = 402;                                   // donde la pared se junta con la tarima

  const T = {
    gol: 1.2,
    // Gabacho: salto, carrera, rodillas y deslizamiento
    agachaB: 1.06, saltaB: 1.22, caeB: 1.56,
    corre0: 1.72, corre1: 2.02, deja0: 2.16, rodilla: 2.3, para: 3.22,
    ruge0: 3.0, ruge1: 4.0, puno0: 4.02, puno1: 4.45,
    levanta0: 4.5, levanta1: 4.92, giraB0: 4.94, giraB1: 5.14,
    ri0: 5.3, ri1: 6.15, jarras: 6.35, veB: 7.15,
    brinco0: 7.74, brinco1: 8.12, giraB2: 8.22, giraB3: 8.4,
    crash: 8.85, encoge1: 9.25, andaB0: 9.3, andaB1: 9.82,
    veCamiseta: 9.95, risa0: 10.15, risa1: 11.2, retro0: 10.5, retro1: 11.0,
    bonk: 11.42, agarra0: 11.6, agarra1: 11.86,
    saltos: [11.9, 12.34, 12.78], durSalto: 0.4,
    sale0: 13.18, sale1: 13.52, guino: 13.66,
    fin: 14.05,
    // Guillermo
    agachaG: 1.1, saltaG: 1.26, caeG: 1.6, acerca0: 2.5, acerca1: 2.95,
    animo0: 1.65, animo1: 2.4, mira0: 2.45,
    frota0: 3.92, frota1: 4.42,
    trota0: 4.48, trota1: 4.84, rodillaG: 4.95, paraG: 5.06,
    camaraG0: 5.36, camaraG1: 5.95, sube0: 5.95, sube1: 6.25,
    giraG0: 6.25, giraG1: 6.38, huye0: 6.38, huye1: 6.8,
    vuelve0: 7.02, deja2: 7.46, rodilla2: 7.6, cae2: 8.12, panico: 8.18,
    entra0: 9.55, bonkG: 11.42
  };

  /* ---------- utilidades ---------- */
  const P = (x, y) => ({ x, y });
  const rotP = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
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
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  // carril de profundidad a mitad de camino
  const carril = (a, b, k) => ({ suelo: lerp(a.suelo, b.suelo, k), s: lerp(a.s, b.s, k) });

  /* ---------- caras ---------- */
  const BASE = { mx: -0.6, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, rub: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* ---------- manos ----------
   * Clave de una mano: { h: [x, y] } punto del tronco (hoja, sin inclinar) con mu relativo al tronco,
   * { scr: () => punto de pantalla, ref } con mu absoluto, o { bols: true } (en el bolsillo). */
  function resolutor(R, p, lado) {
    const Tr = R.tronco(p);
    return o => {
      if (o.bols) { const m = R.manoReposo(p, lado); return { x: m.x, y: m.y, mu: m.mu, ang: 0, puno: 0, dedos: TODOS(0.4), dobla: lado === "cerca" ? -1 : 1 }; }
      if (o.scr) {
        const sc = o.scr(), h = R.aHoja(p, sc), mu = o.mu, r = R.MUNECA_R * R.JK * (o.dist ?? 0.55);
        // el centro de la mano queda un poco hacia los dedos del punto de contacto
        return { x: h.x + Math.cos(mu) * r, y: h.y + Math.sin(mu) * r, mu, ang: 0, puno: 1, dedos: o.dedos, dobla: o.dobla ?? (lado === "cerca" ? -1 : 1) };
      }
      const q = Tr(P(o.h[0], o.h[1]));
      return { x: q.x, y: q.y, mu: o.mu + p.torso, ang: 0, puno: o.puno ?? 1, dedos: o.dedos, dobla: o.dobla ?? (lado === "cerca" ? -1 : 1) };
    };
  }
  // pista de una mano: [t0, t1, clave, curva]
  function pista(lista, t, res) {
    let c = res(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)), d = res(obj);
      c = { x: lerp(c.x, d.x, k), y: lerp(c.y, d.y, k), mu: lerp(c.mu, d.mu, k), ang: 0, puno: lerp(c.puno, d.puno, k),
        dedos: DD(c.dedos, d.dedos, k), dobla: k < 0.5 ? c.dobla : d.dobla };
    }
    return c;
  }
  const HM = (x, y, mu, dedos, dobla) => ({ h: [x, y], mu, dedos, dobla });
  const conMano = (m, dx, dy, dmu = 0) => Object.assign({}, m, { x: m.x + dx, y: m.y + dy, mu: m.mu + dmu });

  /* ---------- pies ----------
   * apoyos: [[t, x, dur?]]: el pie está quieto en x desde t hasta t + dur y luego vuela al siguiente. */
  function pieDe(apoyos, t, o) {
    let i = 0; for (let k = 0; k < apoyos.length; k++) if (apoyos[k][0] <= t) i = k;
    const [tf, xf, d0] = apoyos[i], dur = d0 ?? o.apoyo;
    if (t <= tf || i === apoyos.length - 1 || t <= tf + dur) {
      const u = clamp((t - tf) / Math.max(1e-3, dur));
      return { x: xf, h: 0, a: o.corre && i > 0 ? lerp(-0.12, 0.36, u) : 0 };
    }
    const [tn, xn] = apoyos[i + 1], toff = tf + dur, u = clamp((t - toff) / (tn - toff));
    const x = lerp(xf, xn, suave(clamp((u - 0.05) / 0.95)));
    const h = o.alto * Math.sin(Math.PI * Math.pow(u, o.corre ? 0.72 : 1));
    let a;
    if (o.corre) a = u < 0.3 ? lerp(0.36, 1.0, suave(u / 0.3)) : u < 0.75 ? lerp(1.0, 0.12, suave((u - 0.3) / 0.45)) : lerp(0.12, -0.12, suave((u - 0.75) / 0.25));
    else a = 0.26 * Math.sin(Math.PI * u) - 0.08 * Math.sin(TAU * u);
    return { x, h, a };
  }
  // zancadas a partir de la x del cuerpo: los apoyos caen un poco por delante del cuerpo
  function zancadas(xc, t0, n, per, lead, dir, primero, ini) {
    const L = { cerca: [[-9, ini.cerca, 0]], lejos: [[-9, ini.lejos, 0]] };
    let lado = primero;
    // el primer pie despega en t0 (hasta entonces, quieto donde estaba)
    L.cerca[0] = [-9, ini.cerca, t0 + (lado === "cerca" ? 0 : per / 2) + 9 - 0.02];
    L.lejos[0] = [-9, ini.lejos, t0 + (lado === "lejos" ? 0 : per / 2) + 9 - 0.02];
    for (let k = 0; k < n; k++) {
      const tc = t0 + per * 0.62 + k * per / 2;
      L[lado].push([tc, xc(tc) + dir * lead]);
      lado = lado === "cerca" ? "lejos" : "cerca";
    }
    return L;
  }
  // pie del mundo → pierna en la hoja
  function aPierna(R, p, w, lado) {
    const tob = R.SUELO - R.TOBILLO_ALTO;
    return { tob: P(R.aHoja(p, P(w.x, 0)).x, tob - (lado === "lejos" ? 12 : 0) - w.h / p.s), ang: w.a };
  }
  // pies de pie, bajo las caderas (en el mundo)
  const pieQuieto = (R, p, lado, abre = 0) => R.aPantalla(p, P(R.CADERA[lado].x + (lado === "lejos" ? abre : -abre), R.SUELO)).x;
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
  // dónde queda la rodilla (hoja), con la misma IK que dibuja el personaje
  function rodillaDe(R, p, lado) {
    const cad = R.tronco(p)(R.CADERA[lado]), L = R.A.datos.piezas["pierna_" + lado].largo;
    const c = Recortes.ik(cad, p.piernas[lado].tob, L, L * 0.5, 80, 1, 1.03), l1 = c.sj * (c.estira || 1);
    return P(cad.x - Math.sin(c.a1) * l1, cad.y + Math.cos(c.a1) * l1);
  }

  /* =====================================================================================
   * GABACHO
   * ===================================================================================== */
  const XB0 = 822, VB = 330;
  // x del cuerpo: quieto, arranca, corre, se tira y se desliza hasta parar
  function xB(t) {
    const ta = T.corre0, tb = T.corre1, td = T.rodilla, tp = T.para;
    if (t <= ta) return XB0;
    if (t <= tb) { const u = t - ta; return XB0 - 0.5 * (VB / (tb - ta)) * u * u; }
    const x1 = XB0 - 0.5 * VB * (tb - ta);
    if (t <= td) return x1 - VB * (t - tb);
    const x2 = x1 - VB * (td - tb), d = tp - td, u = Math.min(t, tp) - td;
    return x2 - (VB * u - 0.5 * (VB / d) * u * u);
  }
  const X_PARA_B = xB(T.para);
  // Guillermo pasa deslizándose por delante de Gabacho: el brinco de Gabacho va con ese instante
  const VG2 = 880, FRENO2 = 170, X_ENTRA2 = 1190, X_DEJA2 = X_ENTRA2 - VG2 * (T.deja2 - T.vuelve0);
  { const d = X_DEJA2 - X_PARA_B, u = (VG2 - Math.sqrt(VG2 * VG2 - 2 * FRENO2 * d)) / FRENO2; T.pasa = T.deja2 + u; T.brinco0 = T.pasa - 0.27; T.brinco1 = T.pasa + 0.12; T.giraB2 = T.brinco1 + 0.06; T.giraB3 = T.brinco1 + 0.24; }
  const X_ANDA_B = X_PARA_B - 14, X_RETRO_B = X_PARA_B + 30;   // se asoma un pasito; luego recula riéndose
  function xBtot(t) {
    if (t <= T.para) return xB(t);
    return X_PARA_B - 14 * tramo(t, T.andaB0, T.andaB1) + 44 * tramo(t, T.retro0, T.retro1);
  }
  const carrilB = t => carril(FONDO, MEDIO, suave(fase(xB(t), xB(T.rodilla), X_PARA_B)));

  const CB0 = { pel: 0, torso: 0.02, cab: 0.04, cdy: 0, hom: 0 };
  const CB = o => Object.assign({}, CB0, o);
  const CUERPOS_B = {
    tenso: CB({ pel: 18, torso: 0.16, cab: 0.1 }),
    agacha: CB({ pel: 80, torso: 0.22, cab: 0.08 }),
    salta: CB({ pel: -10, torso: -0.12, cab: -0.22 }),
    cae: CB({ pel: 60, torso: 0.18, cab: 0.04 }),
    corre: CB({ pel: 40, torso: 0.3, cab: -0.1 }),
    tira: CB({ pel: 0, torso: -0.34, cab: -0.3 }),
    ruge: CB({ pel: 0, torso: -0.4, cab: -0.42 }),
    vamos: CB({ pel: 0, torso: 0.08, cab: 0.06 }),
    dePie: CB({ pel: 6, torso: 0.02, cab: 0.04 }),
    rie: CB({ pel: 24, torso: 0.3, cab: 0.22 }),
    jarras: CB({ pel: 4, torso: -0.04, cab: 0.08 }),
    brinco: CB({ pel: 10, torso: -0.16, cab: -0.1, hom: 0.6 }),
    encoge: CB({ pel: 20, torso: 0.08, cab: 0.12, cdy: 18, hom: 1.0 }),
    asoma: CB({ pel: 10, torso: 0.14, cab: 0.06 }),
    carcajada: CB({ pel: 30, torso: 0.36, cab: 0.18 }),
    bonk: CB({ pel: 14, torso: -0.14, cab: -0.2 }),
    abrazo: CB({ pel: 14, torso: 0.1, cab: 0.04 }),
    final: CB({ pel: 6, torso: 0.0, cab: -0.04 })
  };
  const GUION_CUERPO_B = [
    [0.2, 0.8, "tenso"], [T.agachaB, T.saltaB, "agacha"], [T.saltaB, T.saltaB + 0.2, "salta", salida], [T.caeB - 0.04, T.caeB + 0.08, "cae"],
    [T.corre0, T.corre0 + 0.18, "corre"], [T.deja0, T.rodilla, "tira"], [T.para - 0.25, T.para + 0.1, "ruge"],
    [T.puno0, T.puno0 + 0.15, "vamos"], [T.levanta0, T.levanta1, "dePie"], [T.ri0, T.ri0 + 0.2, "rie"], [T.jarras - 0.1, T.jarras + 0.2, "jarras"],
    [T.brinco0, T.brinco0 + 0.1, "brinco"], [T.brinco1, T.brinco1 + 0.15, "jarras"], [T.crash, T.crash + 0.1, "encoge"],
    [T.encoge1, T.andaB0 + 0.2, "asoma"], [T.risa0, T.risa0 + 0.25, "carcajada"], [T.bonk - 0.02, T.bonk + 0.08, "bonk", salida],
    [T.agarra0, T.agarra1, "abrazo"], [T.sale0, T.sale0 + 0.3, "final"]
  ];
  const CARAS_B = {
    tenso: E({ mx: -0.95, my: -0.25, c: 0.1, sd: 14, gd: 0.18, si: 12, gi: 0.18, abre: 0, ancho: 0.6, sonr: -0.25 }),
    grita: E({ mx: -0.7, my: -0.4, c: 0.75, h: 0.6, sd: 22, si: 22, abre: 52, ancho: 1.05, sonr: 0.55 }),
    corre: E({ mx: -0.9, my: 0.05, c: 0.2, sd: 6, si: 6, abre: 26, ancho: 0.9, sonr: 0.6 }),
    ruge: E({ c: 1, z: 1, sd: 26, gd: -0.15, si: 26, gi: -0.15, abre: 62, ancho: 1.1, sonr: 0.35 }),
    vamos: E({ mx: -0.3, my: 0.1, c: 0.35, h: 0.8, sd: 10, si: 10, abre: 30, ancho: 1, sonr: 0.8 }),
    mira: E({ mx: -0.9, my: 0.05, c: 0.15, sd: 8, si: 8, abre: 4, ancho: 0.7, sonr: 0.5 }),
    rie: E({ c: 0.9, h: 1, sd: 16, si: 16, abre: 40, ancho: 1, sonr: 0.8 }),
    ceja: E({ mx: -0.9, my: 0, c: 0.2, sd: -4, gd: -0.12, si: 22, gi: 0.12, abre: 0, ancho: 0.6, sonr: 0.3 }),
    susto: E({ mx: -0.9, my: 0.5, iris: 0.7, sd: 28, si: 28, abre: 34, ancho: 0.75, sonr: -0.2 }),
    sigue: E({ mx: -0.95, my: 0.1, iris: 0.8, sd: 24, si: 24, abre: 22, ancho: 0.6, sonr: -0.1 }),
    encoge: E({ c: 1, z: 1, sd: 16, gd: 0.22, si: 16, gi: 0.22, abre: 18, ancho: 1.05, sonr: -0.6 }),
    asoma: E({ mx: -1, my: 0.1, c: 0.25, sd: 18, gd: 0.12, si: 18, gi: 0.12, abre: 6, ancho: 0.55, sonr: -0.2 }),
    flipa: E({ mx: -0.95, my: -0.05, iris: 0.85, sd: 26, si: 26, abre: 20, ancho: 0.7, sonr: 0.3 }),
    carcajada: E({ c: 0.95, h: 1, sd: 20, si: 20, abre: 54, ancho: 1.05, sonr: 0.9 }),
    bonk: E({ c: 1, z: 0.8, sd: 20, si: 20, abre: 26, ancho: 0.8, sonr: 0.2 }),
    abrazo: E({ c: 0.85, h: 1, sd: 16, si: 16, abre: 46, ancho: 1, sonr: 0.9 }),
    camara: E({ mx: -0.35, my: 0.08, c: 0.25, h: 0.5, sd: 12, si: 6, abre: 8, ancho: 0.85, sonr: 0.85 })
  };
  const GUION_CARA_B = [
    [T.gol, T.gol + 0.08, "grita", salida], [T.corre0, T.corre0 + 0.15, "corre"], [T.para - 0.3, T.para - 0.1, "ruge"],
    [T.puno0, T.puno0 + 0.12, "vamos"], [T.levanta0 + 0.2, T.levanta1, "mira"], [T.ri0, T.ri0 + 0.12, "rie", salida],
    [T.ri1, T.ri1 + 0.2, "ceja"], [T.veB, T.veB + 0.12, "susto"], [T.brinco1, T.brinco1 + 0.1, "sigue"], [T.crash, T.crash + 0.06, "encoge", salida],
    [T.encoge1, T.encoge1 + 0.2, "asoma"], [T.veCamiseta, T.veCamiseta + 0.15, "flipa"], [T.risa0, T.risa0 + 0.15, "carcajada"],
    [T.bonk, T.bonk + 0.05, "bonk", salida], [T.agarra0, T.agarra0 + 0.15, "abrazo"], [T.sale0 + 0.15, T.sale0 + 0.35, "camara"]
  ];
  const PARP_B = [0.55, 2.0, 4.7, 6.9, 9.6, 13.0];

  // Gabacho mira a la izquierda (espejo) salvo entre los dos giros
  function sxB(t) {
    const g1 = fase(t, T.giraB0, T.giraB1), g2 = fase(t, T.giraB2, T.giraB3);
    let sx = Math.cos(Math.PI * suave(g1)) ;            // 1 → −1: se da la vuelta (mira a la derecha)
    if (g2 > 0) sx = -Math.cos(Math.PI * suave(g2));    // −1 → 1: vuelve a mirar a la izquierda
    if (Math.abs(sx) < 0.05) sx = sx < 0 ? -0.05 : 0.05;
    return sx;
  }
  // saltos juntos al final: altura (px) en t
  function saltoAbrazo(t) {
    for (const t0 of T.saltos) { const u = fase(t, t0, t0 + T.durSalto); if (u > 0 && u < 1) return Math.sin(Math.PI * u); }
    return 0;
  }
  function aterrizaAbrazo(t) {
    let k = 0; for (const t0 of T.saltos) { const u = t - (t0 + T.durSalto); if (u > 0 && u < 0.14) k = Math.max(k, Math.sin(Math.PI * u / 0.14)); }
    return k;
  }

  const MEMO = new Map();
  const memo = (c, f) => { if (MEMO.has(c)) return MEMO.get(c); if (MEMO.size > 16) MEMO.clear(); const v = f(); MEMO.set(c, v); return v; };

  function poseB(t, geo = false) { return memo("b" + geo + t, () => poseB0(t, geo)); }
  function poseB0(t, geo) {
    const b = guion(GUION_CUERPO_B, CUERPOS_B, "tenso", t);
    const respira = Math.sin(t * 2.3 + 1);
    const cr = carrilB(t), x = xBtot(t);
    // altura del salto del gol, del brinco y de los saltos del abrazo (px de pantalla)
    const salto = campana(t, T.saltaB, T.caeB) * 64 + campana(t, T.brinco0, T.brinco1) * 62 + saltoAbrazo(t) * 40;
    const aterriza = 26 * aterrizaAbrazo(t);
    const rodillas = tramo(t, T.deja0, T.rodilla) * (1 - tramo(t, T.levanta0, T.levanta1));
    // traqueteo de las rodillas por la tarima mientras se desliza
    const traq = (t > T.rodilla && t < T.para) ? 1.6 * ruido(t * 40) * (1 - fase(t, T.rodilla, T.para)) : 0;
    const rugido = (t > T.ruge0 && t < T.ruge1) ? 0.02 * Math.sin(t * 31) * campana(t, T.ruge0, T.ruge1) : 0;
    const puno = (t > T.puno0 && t < T.puno1) ? Math.abs(Math.sin((t - T.puno0) * Math.PI / 0.21)) : 0;
    const risa = (t > T.ri0 && t < T.ri1) ? Math.abs(Math.sin(t * 17)) * campana(t, T.ri0, T.ri1) : 0;
    const risa2 = (t > T.risa0 && t < T.risa1) ? Math.abs(Math.sin(t * 16)) * campana(t, T.risa0, T.risa1) : 0;
    const p = {
      x, suelo: cr.suelo, s: cr.s, espejo: true, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: GB.PELVIS.x, y: GB.PELVIS.y + b.pel + respira * 1.2 - salto / cr.s + aterriza + 330 * suave(rodillas) + traq / cr.s + 14 * puno + 10 * risa + 12 * risa2 },
      torso: b.torso + rugido + 0.03 * puno + 0.04 * risa + 0.05 * risa2, torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.02 * b.hom },
      piernas: {}, cabeza: { ang: b.cab + 0.6 * rugido + 0.05 * risa + 0.06 * risa2, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } }
    };
    // pies
    const ini = { cerca: XB0 + 19, lejos: XB0 - 18 };
    const Z = memo("zB", () => zancadas(xB, T.corre0, 3, 0.26, 26, -1, "cerca", ini));
    const andar = memo("aB", () => ({
      cerca: [[-9, X_PARA_B + 19, T.andaB0 + 9.14], [T.andaB0 + 0.36, X_ANDA_B + 19, T.retro0 + 0.24 - T.andaB0 - 0.36], [T.retro0 + 0.48, X_RETRO_B + 19]],
      lejos: [[-9, X_PARA_B - 18, T.andaB0 + 9], [T.andaB0 + 0.22, X_ANDA_B - 22, T.retro0 - T.andaB0 - 0.22], [T.retro0 + 0.24, X_PARA_B + 4, 0.26], [T.retro0 + 0.72, X_RETRO_B - 18]] }));
    let wC, wL;
    if (t < T.levanta0) { wC = pieDe(Z.cerca, t, { corre: true, alto: 46, apoyo: 0.07 }); wL = pieDe(Z.lejos, t, { corre: true, alto: 46, apoyo: 0.07 }); }
    else { wC = pieDe(andar.cerca, t, { alto: 16, apoyo: 0.1 }); wL = pieDe(andar.lejos, t, { alto: 16, apoyo: 0.1 }); }
    // brinco y saltos: los pies se recogen
    const recoge = campana(t, T.brinco0, T.brinco1) * 44 + saltoAbrazo(t) * 18 + campana(t, T.saltaB, T.caeB) * 22;
    p.piernas.cerca = aPierna(GB, p, wC, "cerca"); p.piernas.lejos = aPierna(GB, p, wL, "lejos");
    p.piernas.cerca.tob.y -= recoge / cr.s; p.piernas.lejos.tob.y -= recoge * 0.8 / cr.s;
    p.piernas.cerca.tob.x -= recoge * 0.5 / cr.s;
    // de rodillas
    if (rodillas > 0) {
      const R = deRodillas(GB, p, 10 * fase(t, T.rodilla, T.para));
      for (const lado of ["lejos", "cerca"]) p.piernas[lado] = mezPierna(p.piernas[lado], R[lado], suave(rodillas));
    }
    // cara
    const e = guion(GUION_CARA_B, CARAS_B, "tenso", t);
    if (t > T.ruge0 && t < T.ruge1) e.abre += 8 * Math.sin(t * 23);
    if (t > T.ri0 && t < T.ri1) e.abre += 10 * Math.sin(t * 17);
    if (t > T.risa0 && t < T.risa1) e.abre += 10 * Math.sin(t * 16);
    p.cara = cara(e, parpadeo(t, PARP_B));
    if (t > T.guino) { const k = campana(t, T.guino, T.guino + 0.5); p.cara.ojos.d = Math.max(p.cara.ojos.d, k); }
    // manos
    manosB(p, t, geo);
    p.sx = sxB(t);
    return p;
  }

  function manosB(p, t, geo) {
    const rC = resolutor(GB, p, "cerca"), rL = resolutor(GB, p, "lejos");
    // contacto: mano lejana en el hombro lejano de Guillermo
    const hombroG = () => { const pg = poseG(t, true); return G.aPantalla(pg, G.tronco(pg)(P(G.HOMBRO.x - 10, G.HOMBRO.y + 10))); };
    const reza = { c: HM(190, 450, 1.0, D5(0.3, 0.55, 0.55, 0.55, 0.55), 1), l: HM(320, 440, 2.1, D5(0.3, 0.55, 0.55, 0.55, 0.55), -1) };
    const arriba = { c: HM(30, -90, 1.85, PUNO, 1), l: HM(430, -100, 1.35, PUNO, -1) };
    const corre = { c: HM(40, 470, 1.2, PUNO, -1), l: HM(470, 460, 1.9, PUNO, 1) };
    const abre = { c: HM(-170, 150, 0.75, PALMA, 1), l: HM(640, 120, 2.45, PALMA, -1) };
    const ruge = { c: HM(-160, 70, 0.65, PUNO, 1), l: HM(620, 40, 2.5, PUNO, -1) };
    const vamos = { c: HM(60, 470, 1.25, PUNO, -1), l: HM(440, 450, 1.95, PUNO, 1) };
    const lado = { c: HM(60, 560, -1.6, TODOS(0.4), -1), l: HM(440, 560, -1.55, TODOS(0.4), 1) };
    const boca = { c: HM(30, 560, -1.6, TODOS(0.5), -1), l: HM(470, 190, 2.0, D5(0.5, 0.9, 0.85, 0.8, 0.75), -1) };
    const tripa = { c: HM(150, 500, 0.6, D5(0.4, 0.8, 0.8, 0.8, 0.8), 1), l: HM(330, 470, 2.4, D5(0.4, 0.8, 0.8, 0.8, 0.8), -1) };
    const jarras = { c: HM(120, 640, -2.2, TODOS(0.3), -1), l: HM(390, 640, -0.9, TODOS(0.3), 1) };
    const brinco = { c: HM(-90, 150, 1.0, PALMA, 1), l: HM(560, 160, 2.2, PALMA, -1) };
    const encoge = { c: HM(110, 330, 1.2, PUNO, 1), l: HM(380, 330, 1.9, PUNO, -1) };
    const visera = { c: HM(60, 560, -1.6, TODOS(0.4), -1), l: HM(520, 160, 2.6, D5(0.7, 1, 1, 1, 1), -1) };
    const senala = { c: HM(150, 500, 0.6, D5(0.4, 0.8, 0.8, 0.8, 0.8), 1), l: HM(600, 300, 2.9, D5(0.1, 1, 0, 0, 0), -1) };
    const abrazo = { c: HM(-60, -30, 1.85, PUNO, 1), l: geo ? HM(560, 300, 2.6, PUNO, -1) : { scr: hombroG, mu: 2.6, dedos: D5(0.6, 0.7, 0.7, 0.7, 0.7), dobla: -1 } };
    const pistaC = [
      [0, 0, reza.c], [T.agachaB, T.saltaB, arriba.c, salida], [T.caeB, T.corre0 + 0.1, corre.c], [T.deja0, T.rodilla + 0.05, abre.c],
      [T.para - 0.3, T.para, ruge.c], [T.puno0, T.puno0 + 0.12, vamos.c], [T.levanta0 + 0.1, T.levanta1, lado.c],
      [T.ri0, T.ri0 + 0.2, tripa.c], [T.jarras - 0.15, T.jarras + 0.2, jarras.c], [T.brinco0, T.brinco0 + 0.1, brinco.c, salida],
      [T.brinco1, T.brinco1 + 0.2, jarras.c], [T.crash, T.crash + 0.08, encoge.c, salida], [T.encoge1, T.encoge1 + 0.2, visera.c],
      [T.risa0, T.risa0 + 0.2, tripa.c], [T.agarra0 - 0.1, T.agarra1, abrazo.c]
    ];
    const pistaL = [
      [0, 0, reza.l], [T.agachaB, T.saltaB, arriba.l, salida], [T.caeB, T.corre0 + 0.1, corre.l], [T.deja0, T.rodilla + 0.05, abre.l],
      [T.para - 0.3, T.para, ruge.l], [T.puno0, T.puno0 + 0.12, vamos.l], [T.levanta0 + 0.1, T.levanta1, lado.l],
      [T.ri0, T.ri0 + 0.2, boca.l], [T.jarras - 0.15, T.jarras + 0.2, jarras.l], [T.brinco0, T.brinco0 + 0.1, brinco.l, salida],
      [T.brinco1, T.brinco1 + 0.2, jarras.l], [T.crash, T.crash + 0.08, encoge.l, salida], [T.encoge1, T.encoge1 + 0.2, visera.l],
      [T.veCamiseta + 0.05, T.veCamiseta + 0.3, senala.l], [T.risa0 + 0.25, T.risa0 + 0.5, tripa.l], [T.agarra0, T.agarra1, abrazo.l]
    ];
    let C = pista(pistaC, t, rC), L = pista(pistaL, t, rL);
    // carrera: brazos contrarios a las piernas
    const kCo = tramo(t, T.corre0, T.corre0 + 0.12) * (1 - tramo(t, T.deja0 - 0.04, T.deja0 + 0.08));
    if (kCo > 0) {
      const ph = Math.sin(TAU * (t - T.corre0) / 0.52);
      const Tr = GB.tronco(p), lD = Tr(P(440 + 120 * ph, 470 - 80 * ph)), cD = Tr(P(80 - 140 * ph, 480 + 80 * ph));
      C = pistaMez(C, { x: cD.x, y: cD.y, mu: 1.3 - 0.8 * ph + p.torso, dedos: PUNO, puno: 1, dobla: -1 }, kCo);
      L = pistaMez(L, { x: lD.x, y: lD.y, mu: 1.9 + 0.8 * ph + p.torso, dedos: PUNO, puno: 1, dobla: 1 }, kCo);
    }
    // puños: arriba y abajo («¡vamos, vamos!»)
    if (t > T.puno0 && t < T.puno1 + 0.1) {
      const k = Math.abs(Math.sin((t - T.puno0) * Math.PI / 0.21)) * campana(t, T.puno0, T.puno1 + 0.1);
      C = conMano(C, 0, 60 * k); L = conMano(L, 0, 60 * k);
    }
    // al rugir, los puños tiemblan de rabia contenida
    if (t > T.para - 0.1 && t < T.ruge1) { const k = 5 * campana(t, T.para - 0.1, T.ruge1); C = conMano(C, k * ruido(t * 29), k * ruido(t * 31 + 3)); L = conMano(L, k * ruido(t * 27 + 5), k * ruido(t * 33 + 1)); }
    // abrazo: el puño cercano arriba sube y baja con los saltos
    if (t > T.agarra1) { const k = saltoAbrazo(t); C = conMano(C, 0, -40 * k); }
    p.manoCerca = C; p.manoLejos = L;
  }
  function pistaMez(a, d, k) {
    return { x: lerp(a.x, d.x, k), y: lerp(a.y, d.y, k), mu: lerp(a.mu, d.mu, k), ang: 0, puno: lerp(a.puno, d.puno, k), dedos: DD(a.dedos, d.dedos, k), dobla: k < 0.5 ? a.dobla : d.dobla };
  }

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  const XG0 = 975, XG1 = 905;
  const X_PARA_G = XG1 - 30 - 12;                      // primer intento: dos pasitos y se para a los dos palmos
  function xG1(t) {                                    // se acerca a mirar y luego el primer intento (carril del fondo)
    if (t <= T.trota0) return lerp(XG0, XG1, suave(fase(t, T.acerca0, T.acerca1)));
    if (t <= T.rodillaG) return lerp(XG1, XG1 - 30, suave(fase(t, T.trota0, T.rodillaG)));
    return lerp(XG1 - 30, X_PARA_G, salida(fase(t, T.rodillaG, T.paraG)));
  }
  function xHuye(t) { const u = fase(t, T.huye0, T.huye1); return X_PARA_G + 330 * Math.pow(u, 1.6); }
  // vuelve a toda mecha por el carril de delante y se desliza muchísimo
  function xG2(t) {
    if (t <= T.deja2) return X_ENTRA2 - VG2 * (t - T.vuelve0);
    const u = t - T.deja2;
    return X_DEJA2 - (VG2 * u - 0.5 * FRENO2 * u * u);    // apenas frena: se sale de cuadro
  }
  // vuelve con la camiseta por la cabeza (carril del medio, mirando a la derecha)
  const X_BONK_G = X_RETRO_B - 154;
  function xG3(t) {
    if (t <= T.entra0) return -110;
    const u = fase(t, T.entra0, T.bonkG);
    return lerp(-110, X_BONK_G, u) + 6 * Math.sin(u * Math.PI * 4.2) * (1 - u);
  }
  function xGtot(t) {
    if (t < T.huye0) return xG1(t);
    if (t < T.vuelve0 - 0.05) return xHuye(t);
    if (t < T.entra0 - 0.05) return xG2(t);
    let x = xG3(t);
    // ¡bonk!: rebota un poco hacia atrás
    x -= 12 * tramo(t, T.bonkG, T.bonkG + 0.12, salida) * (1 - tramo(t, T.agarra0, T.agarra1));
    return x;
  }
  function carrilG(t) {
    if (t < T.vuelve0 - 0.05) return FONDO;
    if (t < T.entra0 - 0.05) return FRENTE;
    return MEDIO;
  }

  const CG0 = { pel: 0, torso: 0.02, cab: 0.04, cdy: 0, hom: 0 };
  const CGc = o => Object.assign({}, CG0, o);
  const CUERPOS_G = {
    tenso: CGc({ pel: 22, torso: 0.18, cab: 0.12 }),
    agacha: CGc({ pel: 84, torso: 0.24, cab: 0.1 }),
    salta: CGc({ pel: -10, torso: -0.1, cab: -0.24 }),
    cae: CGc({ pel: 60, torso: 0.16, cab: 0.04 }),
    animo: CGc({ pel: 14, torso: 0.0, cab: -0.08 }),
    mira: CGc({ pel: 10, torso: 0.12, cab: 0.08 }),
    frota: CGc({ pel: 16, torso: 0.1, cab: 0.02 }),
    trota: CGc({ pel: 30, torso: 0.2, cab: -0.04 }),
    tira: CGc({ pel: 0, torso: -0.3, cab: -0.26 }),
    para: CGc({ pel: 0, torso: 0.12, cab: 0.06 }),
    corta: CGc({ pel: 0, torso: 0.02, cab: 0.1 }),
    picado: CGc({ pel: 20, torso: 0.1, cab: -0.04 }),
    corre: CGc({ pel: 36, torso: 0.32, cab: -0.12 }),
    desliza: CGc({ pel: 0, torso: -0.36, cab: -0.32 }),
    panico: CGc({ pel: 0, torso: 0.05, cab: 0.12 }),
    ciego: CGc({ pel: 10, torso: -0.04, cab: -0.04 }),
    bonk: CGc({ pel: 16, torso: -0.18, cab: -0.16 }),
    abrazo: CGc({ pel: 14, torso: 0.1, cab: 0.04 }),
    final: CGc({ pel: 6, torso: 0.0, cab: -0.02 })
  };
  const GUION_CUERPO_G = [
    [0.2, 0.8, "tenso"], [T.agachaG, T.saltaG, "agacha"], [T.saltaG, T.saltaG + 0.2, "salta", salida], [T.caeG - 0.04, T.caeG + 0.08, "cae"],
    [T.animo0, T.animo0 + 0.15, "animo"], [T.mira0, T.mira0 + 0.3, "mira"], [T.frota0, T.frota0 + 0.2, "frota"], [T.trota0, T.trota0 + 0.1, "trota"],
    [T.trota1 - 0.04, T.rodillaG, "tira"], [T.rodillaG, T.paraG, "para", salida], [T.paraG + 0.05, T.paraG + 0.25, "corta"],
    [T.sube0, T.sube1, "picado"], [T.huye0, T.huye0 + 0.1, "corre"], [T.deja2 - 0.04, T.rodilla2, "desliza"], [T.panico, T.panico + 0.15, "panico"],
    [T.entra0 - 0.05, T.entra0, "ciego"], [T.bonkG - 0.02, T.bonkG + 0.08, "bonk", salida], [T.agarra0, T.agarra1, "abrazo"], [T.sale0, T.sale0 + 0.3, "final"]
  ];
  const CARAS_G = {
    tenso: E({ mx: -0.9, my: -0.3, c: 0.12, sd: 10, gd: 0.16, si: 10, gi: 0.14, abre: 4, ancho: 0.55, sonr: -0.3 }),
    grita: E({ mx: -0.6, my: -0.4, c: 0.8, h: 0.6, sd: 22, si: 22, abre: 50, ancho: 1.05, sonr: 0.55 }),
    animo: E({ c: 0.9, h: 1, sd: 18, si: 18, abre: 44, ancho: 1, sonr: 0.8 }),
    flipa: E({ mx: -0.95, my: 0.15, iris: 0.85, sd: 26, si: 26, abre: 26, ancho: 0.65, sonr: 0.25 }),
    listo: E({ mx: -0.45, my: 0.05, c: 0.3, sd: -6, gd: -0.14, si: 14, gi: 0.1, abre: 6, ancho: 0.85, sonr: 0.75 }),
    trota: E({ mx: -0.9, my: 0.1, c: 0.25, sd: 6, si: 6, abre: 18, ancho: 0.8, sonr: 0.6 }),
    tira: E({ c: 1, z: 0.6, sd: 22, si: 22, abre: 44, ancho: 1.05, sonr: 0.5 }),
    corta: E({ mx: -0.6, my: 0.2, iris: 0.85, sd: 20, si: 20, abre: 6, ancho: 0.5, sonr: 0.05 }),
    verguenza: E({ mx: -0.55, my: 0.1, c: 0.25, sd: 18, gd: 0.25, si: 18, gi: 0.25, abre: 4, ancho: 0.75, sonr: 0.4, rub: 1 }),
    picado: E({ mx: -0.4, my: 0, c: 0.3, sd: -10, gd: -0.22, si: -8, gi: -0.2, abre: 10, ancho: 0.9, sonr: 0.3 }),
    corre: E({ mx: -0.9, my: 0.05, c: 0.25, sd: -6, gd: -0.14, si: -6, gi: -0.12, abre: 24, ancho: 0.9, sonr: 0.55 }),
    gloria: E({ c: 1, h: 1, sd: 22, si: 22, abre: 52, ancho: 1.05, sonr: 0.7 }),
    panico: E({ mx: -0.55, my: 0.05, iris: 0.7, sd: 30, gd: 0.2, si: 30, gi: 0.2, abre: 22, ancho: 0.5, sonr: -0.5 }),
    alegre: E({ c: 0.9, h: 1, sd: 18, si: 18, abre: 46, ancho: 1, sonr: 0.9 }),
    camara: E({ mx: -0.5, my: 0.05, c: 0.2, h: 0.4, sd: 14, si: 10, abre: 26, ancho: 0.95, sonr: 0.95 })
  };
  const GUION_CARA_G = [
    [T.gol + 0.02, T.gol + 0.1, "grita", salida], [T.animo0, T.animo0 + 0.15, "animo"], [T.mira0, T.mira0 + 0.2, "flipa"], [T.frota0, T.frota0 + 0.2, "listo"],
    [T.trota0, T.trota0 + 0.15, "trota"], [T.trota1, T.rodillaG, "tira"], [T.paraG, T.paraG + 0.08, "corta", salida], [T.camaraG0, T.camaraG0 + 0.25, "verguenza"],
    [T.sube0, T.sube0 + 0.15, "picado"], [T.huye0, T.huye0 + 0.1, "corre"], [T.vuelve0, T.vuelve0 + 0.05, "corre"], [T.deja2, T.rodilla2, "gloria"],
    [T.panico, T.panico + 0.1, "panico", salida], [T.agarra0, T.agarra0 + 0.15, "alegre"], [T.sale1 - 0.1, T.sale1 + 0.15, "camara"]
  ];
  const PARP_G = [0.4, 2.9, 5.5, 13.95];

  function sxG(t) {
    const g = fase(t, T.giraG0, T.giraG1);
    if (t < T.giraG0 || t >= T.vuelve0 - 0.05) return 1;
    let sx = Math.cos(Math.PI * suave(g)); if (Math.abs(sx) < 0.05) sx = sx < 0 ? -0.05 : 0.05;
    return sx;
  }
  // camiseta por la cabeza: 1 = tapada; baja al final («sale» la cabeza)
  const camiseta = t => (t > T.entra0 - 0.1 ? 1 : 0) * (1 - tramo(t, T.sale0, T.sale1, entrada));

  function poseG(t, geo = false) { return memo("g" + geo + t, () => poseG0(t, geo)); }
  function poseG0(t, geo) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "tenso", t);
    const respira = Math.sin(t * 2.1);
    const cr = carrilG(t), x = xGtot(t);
    const espejo = t < T.entra0 - 0.05;               // mira a la izquierda hasta que vuelve con la camiseta por la cabeza
    const salto = campana(t, T.saltaG, T.caeG) * 60 + saltoAbrazo(t) * 40;
    const aterriza = 26 * aterrizaAbrazo(t);
    const brinquito = (t > T.animo0 && t < T.animo1) ? 14 * Math.abs(Math.sin((t - T.animo0) * Math.PI / 0.25)) * campana(t, T.animo0, T.animo1) : 0;
    const rod1 = tramo(t, T.trota1 - 0.02, T.rodillaG) * (1 - tramo(t, T.sube0, T.sube1));
    const rod2 = t < T.entra0 - 0.05 ? tramo(t, T.deja2, T.rodilla2) : 0;
    const rodillas = Math.max(rod1, rod2);
    const traq = (t > T.rodilla2 && t < T.entra0) ? 1.4 * ruido(t * 44) : 0;
    const frena = campana(t, T.paraG, T.paraG + 0.22);            // el frenazo del primer intento: se va hacia delante
    const ciego = t > T.entra0 - 0.1 && t < T.agarra0;
    const p = {
      x, suelo: cr.suelo, s: cr.s, espejo, tirasLimpias: true, ikContinuo: false,
      hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 - (salto + brinquito) / cr.s + aterriza + 338 * suave(rodillas) + traq / cr.s },
      torso: b.torso + 0.22 * frena + (ciego ? 0.05 * Math.sin(t * 7.3) : 0), torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.02 * b.hom },
      piernas: {}, cabeza: { ang: b.cab + 0.1 * frena + (ciego ? 0.06 * Math.sin(t * 5.1 + 1) : 0), dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } }
    };
    // pies
    const ini = { cerca: XG0 + 21, lejos: XG0 - 21 };
    let wC, wL;
    if (t < T.sube0) {
      const pasos = { cerca: [[-9, XG0 + 21, 9 + T.acerca0 + 0.22], [T.acerca0 + 0.42, XG1 + 21, T.trota0 - T.acerca0 - 0.42], [T.trota0 + 0.17, XG1 - 2]],
        lejos: [[-9, XG0 - 21, 9 + T.acerca0], [T.acerca0 + 0.2, XG1 - 27, T.trota0 + 0.16 - T.acerca0 - 0.2], [T.trota0 + 0.33, XG1 - 46]] };
      wC = pieDe(pasos.cerca, t, { alto: 22, apoyo: 0.08 }); wL = pieDe(pasos.lejos, t, { alto: 22, apoyo: 0.08 });
    } else if (t < T.vuelve0 - 0.05) {
      // se levanta, se da la vuelta y se va corriendo hacia la derecha (por eso los apoyos van al revés)
      const Z = memo("zG1", () => zancadas(xHuye, T.huye0 - 0.05, 4, 0.24, 22, 1, "lejos", { cerca: X_PARA_G + 21, lejos: X_PARA_G - 21 }));
      wC = pieDe(Z.cerca, t, { corre: true, alto: 48, apoyo: 0.06 }); wL = pieDe(Z.lejos, t, { corre: true, alto: 48, apoyo: 0.06 });
    } else if (t < T.entra0 - 0.05) {
      const Z = memo("zG2", () => zancadas(xG2, T.vuelve0 - 0.3, 6, 0.26, 26, -1, "cerca", { cerca: X_ENTRA2 + 400, lejos: X_ENTRA2 + 360 }));
      wC = pieDe(Z.cerca, t, { corre: true, alto: 52, apoyo: 0.06 }); wL = pieDe(Z.lejos, t, { corre: true, alto: 52, apoyo: 0.06 });
    } else {
      const W = memo("wG", () => pasosCiego());
      wC = pieDe(W.cerca, t, { alto: 18, apoyo: 0.12 }); wL = pieDe(W.lejos, t, { alto: 18, apoyo: 0.12 });
    }
    p.piernas.cerca = aPierna(G, p, wC, "cerca"); p.piernas.lejos = aPierna(G, p, wL, "lejos");
    const recoge = campana(t, T.saltaG, T.caeG) * 22 + saltoAbrazo(t) * 18;
    p.piernas.cerca.tob.y -= recoge / cr.s; p.piernas.lejos.tob.y -= recoge * 0.8 / cr.s; p.piernas.cerca.tob.x -= recoge * 0.5 / cr.s;
    if (rodillas > 0) {
      const R = deRodillas(G, p, 0);
      for (const lado of ["lejos", "cerca"]) p.piernas[lado] = mezPierna(p.piernas[lado], R[lado], suave(rodillas));
    }
    // cara
    const e = guion(GUION_CARA_G, CARAS_G, "tenso", t);
    if (t > T.animo0 && t < T.animo1) e.abre += 10 * Math.sin(t * 15);
    if (t > T.deja2 && t < T.panico) e.abre += 8 * Math.sin(t * 21);
    if (t > T.agarra1) e.abre += 10 * Math.sin(t * 14);
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.sudor = 0.8 * tramo(t, T.camaraG0, T.camaraG0 + 0.3) * (1 - tramo(t, T.sube0, T.sube0 + 0.3)) + 0.6 * campana(t, T.panico, T.panico + 0.6);
    p.enfado = 0.85 * campana(t, T.sube0 - 0.05, T.huye1);
    // camiseta por la cabeza
    const cam = camiseta(t);
    if (cam > 0.001 || t > T.sale0) {
      const sale = tramo(t, T.sale0, T.sale1, entrada);
      const muelle = t > T.sale1 ? 0.07 * Math.sin((t - T.sale1) * 24) * Math.exp(-(t - T.sale1) * 6) : 0;
      p.cabeza.esc = { x: lerp(0.96, 1, sale) - muelle * 0.5, y: lerp(0.9, 1, sale) + muelle };
      p.capaCabeza = (g, tt) => bolsaCamiseta(g, tt, cam);
      p.capaTronco = (g) => tripa(g, cam);
    }
    manosG(p, t, geo);
    p.sx = sxG(t);
    return p;
  }

  // andar a ciegas: pasos cortos y algo torcidos
  function pasosCiego() {
    const L = { cerca: [[-9, -110 - 22, T.entra0 + 9]], lejos: [[-9, -110 + 22, T.entra0 + 9.18]] };
    let lado = "lejos";
    for (let tc = T.entra0 + 0.3; tc < T.bonkG + 0.05; tc += 0.2) {
      L[lado].push([tc, xG3(tc + 0.08) + (lado === "lejos" ? 34 : -6)]);
      lado = lado === "cerca" ? "lejos" : "cerca";
    }
    const xf = X_BONK_G - 12;
    L.cerca.push([T.agarra0, xf - 22]); L.lejos.push([T.agarra0 + 0.05, xf + 22]);
    return L;
  }

  function manosG(p, t, geo) {
    const rC = resolutor(G, p, "cerca"), rL = resolutor(G, p, "lejos");
    const tenso = { c: HM(150, 420, 1.3, PUNO, 1), l: HM(330, 410, 1.9, PUNO, -1) };
    const arriba = { c: HM(20, -90, 1.85, PUNO, 1), l: HM(430, -100, 1.35, PUNO, -1) };
    const animo = { c: HM(-20, 80, 1.9, PUNO, 1), l: HM(480, 40, 1.4, PUNO, -1) };
    const mira = { c: HM(140, 470, 1.0, D5(0.5, 0.7, 0.7, 0.7, 0.7), 1), l: HM(380, 250, 1.9, D5(0.5, 0.9, 0.85, 0.8, 0.75), -1) };
    const frota = { c: HM(240, 440, 0.9, D5(0.4, 0.8, 0.8, 0.8, 0.8), 1), l: HM(320, 430, 2.2, D5(0.4, 0.8, 0.8, 0.8, 0.8), -1) };
    const trota = { c: HM(80, 470, 1.2, PUNO, -1), l: HM(460, 460, 1.9, PUNO, 1) };
    const abre = { c: HM(-170, 150, 0.75, PALMA, 1), l: HM(640, 120, 2.45, PALMA, -1) };
    const caida = { c: HM(-60, 420, 0.4, PALMA, 1), l: HM(560, 400, 2.7, PALMA, -1) };
    const puno = { c: HM(110, 470, 1.1, PUNO, -1), l: HM(430, 440, 1.9, PUNO, 1) };
    const panico = { c: HM(-120, 40, 0.9, PALMA, 1), l: HM(560, 0, 2.2, PALMA, -1) };
    const ciego = { c: HM(-150, 260, 0.2, PALMA, 1), l: HM(660, 220, 2.9, PALMA, -1) };
    const hombroB = () => { const pb = poseB(t, true); return GB.aPantalla(pb, GB.tronco(pb)(P(GB.HOMBRO.x - 20, GB.HOMBRO.y + 12))); };
    const abrazo = { c: HM(-60, -30, 1.85, PUNO, 1), l: geo ? HM(560, 300, 2.4, PUNO, -1) : { scr: hombroB, mu: 2.4, dedos: D5(0.6, 0.7, 0.7, 0.7, 0.7), dobla: -1 } };
    const pistaC = [
      [0, 0, tenso.c], [T.agachaG, T.saltaG, arriba.c, salida], [T.animo0, T.animo0 + 0.1, animo.c], [T.mira0, T.mira0 + 0.25, mira.c],
      [T.frota0, T.frota0 + 0.15, frota.c], [T.trota0, T.trota0 + 0.12, trota.c], [T.trota1, T.rodillaG, abre.c],
      [T.camaraG0 + 0.2, T.camaraG1, caida.c], [T.sube0, T.sube0 + 0.15, puno.c], [T.deja2 - 0.1, T.rodilla2, abre.c],
      [T.panico, T.panico + 0.1, panico.c, salida], [T.entra0 - 0.1, T.entra0, ciego.c], [T.agarra0 - 0.1, T.agarra1, abrazo.c]
    ];
    const pistaL = [
      [0, 0, tenso.l], [T.agachaG, T.saltaG, arriba.l, salida], [T.animo0, T.animo0 + 0.1, animo.l], [T.mira0, T.mira0 + 0.25, mira.l],
      [T.frota0, T.frota0 + 0.15, frota.l], [T.trota0, T.trota0 + 0.12, trota.l], [T.trota1, T.rodillaG, abre.l],
      [T.camaraG0 + 0.2, T.camaraG1, caida.l], [T.sube0, T.sube0 + 0.15, puno.l], [T.deja2 - 0.1, T.rodilla2, abre.l],
      [T.panico, T.panico + 0.1, panico.l, salida], [T.entra0 - 0.1, T.entra0, ciego.l], [T.agarra0, T.agarra1, abrazo.l]
    ];
    let C = pista(pistaC, t, rC), L = pista(pistaL, t, rL);
    // ánimo: puños arriba y abajo, alternando
    if (t > T.animo0 && t < T.animo1 + 0.1) {
      const k = campana(t, T.animo0, T.animo1 + 0.1), ph = (t - T.animo0) * TAU / 0.5;
      C = conMano(C, 0, 70 * k * Math.max(0, Math.sin(ph))); L = conMano(L, 0, 70 * k * Math.max(0, -Math.sin(ph)));
    }
    // se frota las manos
    if (t > T.frota0 && t < T.frota1 + 0.05) { const k = campana(t, T.frota0, T.frota1 + 0.05), ph = Math.sin((t - T.frota0) * 30); C = conMano(C, 22 * k * ph, -4 * k * ph); L = conMano(L, -22 * k * ph, 4 * k * ph); }
    // carreras: brazos contrarios a las piernas
    const kCo = tramo(t, T.huye0 - 0.1, T.huye0) * (1 - tramo(t, T.deja2 - 0.06, T.deja2 + 0.04));
    if (kCo > 0 && t < T.entra0) {
      const per = t < T.vuelve0 - 0.05 ? 0.48 : 0.52, ph = Math.sin(TAU * (t - T.huye0) / per);
      const Tr = G.tronco(p), lD = Tr(P(450 + 120 * ph, 470 - 80 * ph)), cD = Tr(P(80 - 140 * ph, 480 + 80 * ph));
      C = pistaMez(C, { x: cD.x, y: cD.y, mu: 1.3 - 0.8 * ph + p.torso, dedos: PUNO, puno: 1, dobla: -1 }, kCo);
      L = pistaMez(L, { x: lD.x, y: lD.y, mu: 1.9 + 0.8 * ph + p.torso, dedos: PUNO, puno: 1, dobla: 1 }, kCo);
    }
    // pánico: brazos que se agitan
    if (t > T.panico && t < T.entra0) { const k = 26 * tramo(t, T.panico, T.panico + 0.1); C = conMano(C, k * Math.sin(t * 31), k * Math.cos(t * 29)); L = conMano(L, k * Math.sin(t * 27 + 2), k * Math.cos(t * 33 + 1)); }
    // a ciegas: tantea el aire
    if (t > T.entra0 - 0.1 && t < T.agarra0) { const k = 1 - tramo(t, T.bonkG, T.agarra0); C = conMano(C, 18 * k * Math.sin(t * 6.3), 26 * k * Math.sin(t * 5.1 + 1)); L = conMano(L, 18 * k * Math.sin(t * 5.7 + 2), 26 * k * Math.sin(t * 6.1)); }
    if (t > T.agarra1) { const k = saltoAbrazo(t); C = conMano(C, 0, -40 * k); }
    p.manoCerca = C; p.manoLejos = L;
  }

  /* ---------- camiseta subida por la cabeza (retrato de Guillermo) ----------
   * Como los futbolistas: la camiseta le tapa la cara y las orejas; por el cuello de la camiseta,
   * dado de sí, le asoman los pelos de punta. */
  const TELA = "#24242b", TELA_LUZ = "rgba(150,150,172,0.42)", TELA_PLIEGUE = "rgba(0,0,0,0.6)";
  const BOLSA = [[528, 452], [520, 560], [540, 680], [590, 790], [636, 880], [640, 960], [800, 968], [846, 880], [918, 790], [968, 690],
    [1004, 590], [1022, 490], [1030, 452]];
  const BOLSA_P = BOLSA.map(([x, y]) => P(x, y));
  // borde del cuello de la camiseta (dado de sí) a la altura y0: un arco suave
  const cuelloEn = (x, y0) => y0 + 22 * Math.sin(Math.PI * clamp((x - 520) / 510));
  function bolsaCamiseta(g, t, cam) {
    if (cam <= 0.001) return;
    const y0 = lerp(990, 452, cam);                    // al sacar la cabeza, el cuello de la camiseta baja hasta el cuello
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const forma = () => { g.beginPath(); M2.curva(g, BOLSA_P, true, 0.4); };
    const debajo = () => { g.beginPath(); g.moveTo(480, cuelloEn(480, y0)); for (let x = 500; x <= 1080; x += 20) g.lineTo(x, cuelloEn(x, y0)); g.lineTo(1080, 1100); g.lineTo(480, 1100); g.closePath(); };
    g.save(); debajo(); g.clip();
    forma(); g.fillStyle = TELA; g.fill();
    g.save(); forma(); g.clip();
    const luz = g.createRadialGradient(880, 560, 10, 820, 620, 300); luz.addColorStop(0, TELA_LUZ); luz.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = luz; g.fillRect(500, 440, 560, 540);
    // pliegues que bajan del cuello estirado y se tensan sobre la nariz y la barbilla
    g.strokeStyle = TELA_PLIEGUE; g.lineWidth = 10;
    for (const [x0, y0p, cx, cy, x1, y1] of [[600, 500, 640, 640, 700, 820], [700, 500, 760, 600, 790, 700], [900, 500, 880, 600, 860, 700],
      [990, 520, 960, 640, 900, 760], [620, 800, 720, 880, 800, 900]]) { g.beginPath(); g.moveTo(x0, y0p); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke(); }
    g.strokeStyle = "rgba(170,170,196,0.3)"; g.lineWidth = 6;
    for (const [x0, y0p, cx, cy, x1, y1] of [[650, 520, 700, 640, 740, 780], [950, 520, 930, 620, 880, 740]]) { g.beginPath(); g.moveTo(x0, y0p); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke(); }
    // se le marcan la nariz y la barbilla
    g.fillStyle = "rgba(175,175,200,0.3)"; g.beginPath(); g.ellipse(850, 676, 24, 32, 0.3, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(800, 840, 46, 20, 0.2, 0, TAU); g.fill();
    g.restore();
    forma(); g.strokeStyle = TINTA; g.lineWidth = 9; g.stroke();
    g.restore();
    // cuello de la camiseta: un ribete de canalé por el que salen los pelos
    g.save(); forma(); g.clip();
    const arco = () => { g.beginPath(); for (let x = 500; x <= 1060; x += 20) { const y = cuelloEn(x, y0); if (x === 500) g.moveTo(x, y); else g.lineTo(x, y); } };
    g.lineWidth = 46; g.strokeStyle = TINTA; arco(); g.stroke();
    g.lineWidth = 34; g.strokeStyle = "#3a3a46"; arco(); g.stroke();
    g.lineWidth = 3; g.strokeStyle = "rgba(0,0,0,0.65)";
    for (let x = 530; x <= 1030; x += 16) { const y = cuelloEn(x, y0); g.beginPath(); g.moveTo(x, y - 14); g.lineTo(x + 2, y + 14); g.stroke(); }
    g.restore();
    g.restore();
  }
  // pecho y tripa al aire (hoja del tronco de Guillermo, bajo los brazos)
  const IZQ = [[121, 445], [123, 490], [132, 510], [140, 530], [136, 550], [138, 570], [136, 590], [140, 615], [147, 638], [146, 656]];
  const DER = [[343, 420], [341, 470], [338, 515], [336, 560], [339, 610], [345, 645], [340, 656]];
  const bordeEn = (L, y) => { for (let i = 0; i < L.length - 1; i++) { const a = L[i], b = L[i + 1]; if (y >= a[1] && y <= b[1]) return lerp(a[0], b[0], (y - a[1]) / (b[1] - a[1])); } return y < L[0][1] ? L[0][0] : L[L.length - 1][0]; };
  function tripa(g, cam) {
    if (cam <= 0.001) return;
    const y0 = lerp(654, 440, cam), y1 = 656;
    const izq = [P(bordeEn(IZQ, y0) + 4, y0)], der = [P(bordeEn(DER, y0) - 4, y0)];
    for (const [x, y] of IZQ) if (y > y0) izq.push(P(x + 4, y));
    for (const [x, y] of DER) if (y > y0) der.push(P(x - 4, y));
    const pol = [...izq, ...der.reverse()];
    g.save(); g.lineJoin = "round";
    const forma = () => { g.beginPath(); M2.poligono(g, pol); };
    forma(); g.fillStyle = "rgb(254,181,116)"; g.fill();
    g.save(); forma(); g.clip();
    const sh = g.createLinearGradient(120, 0, 350, 0); sh.addColorStop(0, "rgba(198,114,66,0.85)"); sh.addColorStop(0.22, "rgba(198,114,66,0)"); sh.addColorStop(0.8, "rgba(198,114,66,0)"); sh.addColorStop(1, "rgba(198,114,66,0.8)");
    g.fillStyle = sh; g.fillRect(110, y0, 250, 230);
    g.fillStyle = "rgba(255,226,180,0.22)"; g.beginPath(); g.ellipse(232, 540, 50, 64, 0, 0, TAU); g.fill();
    g.strokeStyle = "rgba(150,70,30,0.55)"; g.lineWidth = 4;
    g.beginPath(); g.moveTo(160, 470); g.quadraticCurveTo(200, 505, 240, 492); g.moveTo(330, 472); g.quadraticCurveTo(292, 506, 252, 493); g.stroke();
    g.strokeStyle = "#7a3a14"; g.lineWidth = 4; g.beginPath(); g.arc(246, 612, 6, 0.3, Math.PI - 0.3); g.stroke();
    g.restore();
    forma(); g.strokeStyle = TINTA; g.lineWidth = 5; g.stroke();
    // la camiseta, estirada hacia arriba: un borde enrollado sobre el pecho
    const xa = bordeEn(IZQ, y0) - 4, xb = bordeEn(DER, y0) + 4;
    g.fillStyle = "#2a2a32"; g.beginPath(); g.moveTo(xa, y0 - 12); g.quadraticCurveTo(240, y0 - 26, xb, y0 - 12); g.lineTo(xb, y0 + 10); g.quadraticCurveTo(240, y0 + 2, xa, y0 + 12); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 5; g.stroke();
    g.strokeStyle = "#4a4a58"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(xa + 20, y0 - 3); g.quadraticCurveTo(240, y0 - 13, xb - 20, y0 - 3); g.stroke();
    g.restore();
  }

  function pose(t) { return { g: poseG(t), b: poseB(t) }; }

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  const TV = { x0: 104, y0: 172, x1: 346, y1: 312 };   // pantalla de la tele
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    // pared granate con papel de rombos muy sutil
    const pg = g.createLinearGradient(0, 0, 0, PARED); pg.addColorStop(0, "#5a1f2a"); pg.addColorStop(1, "#7a2c33");
    g.fillStyle = pg; g.fillRect(0, 0, W, PARED);
    g.strokeStyle = "rgba(255,200,170,0.05)"; g.lineWidth = 2;
    for (let k = -20; k < 40; k++) { g.beginPath(); g.moveTo(k * 46, 0); g.lineTo(k * 46 + 300, 300); g.stroke(); g.beginPath(); g.moveTo(k * 46, 0); g.lineTo(k * 46 - 300, 300); g.stroke(); }
    // zócalo crema con molduras
    const ZY = 296;
    g.fillStyle = "#e9d9bb"; g.fillRect(0, ZY, W, PARED - ZY);
    g.fillStyle = "#cbb894"; g.fillRect(0, ZY, W, 8); g.fillStyle = "#f6ead2"; g.fillRect(0, ZY + 8, W, 3);
    for (let x = 10; x < W; x += 110) { g.strokeStyle = "rgba(120,96,60,0.45)"; g.lineWidth = 2; g.strokeRect(x, ZY + 22, 92, PARED - ZY - 34);
      g.strokeStyle = "rgba(255,255,255,0.5)"; g.lineWidth = 1.2; g.strokeRect(x + 3, ZY + 25, 86, PARED - ZY - 40); }
    g.fillStyle = "#b39d75"; g.fillRect(0, PARED - 10, W, 10); g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(0, PARED); g.lineTo(W, PARED); g.stroke();
    // ventana con la ciudad de noche (derecha)
    const VX = 850, VY = 64, VW = 130, VH = 150;
    g.fillStyle = "#3b2418"; g.fillRect(VX - 10, VY - 10, VW + 20, VH + 20);
    const cielo = g.createLinearGradient(0, VY, 0, VY + VH); cielo.addColorStop(0, "#141a3a"); cielo.addColorStop(1, "#3a2b5a"); g.fillStyle = cielo; g.fillRect(VX, VY, VW, VH);
    for (let i = 0; i < 9; i++) { const bx = VX + i * 16, bh = 40 + hash(i + 3) * 70; g.fillStyle = "#1a1530"; g.fillRect(bx, VY + VH - bh, 15, bh);
      for (let j = 0; j < 6; j++) if (hash(i * 7 + j) > 0.45) { g.fillStyle = "rgba(255,214,120,0.85)"; g.fillRect(bx + 3 + (j % 2) * 6, VY + VH - bh + 8 + Math.floor(j / 2) * 14, 3, 5); } }
    g.fillStyle = "#f4eed6"; g.beginPath(); g.arc(VX + 104, VY + 30, 12, 0, TAU); g.fill();
    g.strokeStyle = "#3b2418"; g.lineWidth = 7; g.beginPath(); g.moveTo(VX + VW / 2, VY); g.lineTo(VX + VW / 2, VY + VH); g.moveTo(VX, VY + VH * 0.45); g.lineTo(VX + VW, VY + VH * 0.45); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(VX - 10, VY - 10, VW + 20, VH + 20);
    g.fillStyle = "#c9b48a"; g.fillRect(VX - 18, VY + VH + 8, VW + 36, 9); g.strokeRect(VX - 18, VY + VH + 8, VW + 36, 9);
    // cortina
    g.fillStyle = "#b8862e"; g.beginPath(); g.moveTo(VX - 26, VY - 18); g.lineTo(VX + 22, VY - 18); g.quadraticCurveTo(VX + 6, VY + 120, VX + 14, VY + VH + 40); g.lineTo(VX - 30, VY + VH + 40); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "rgba(90,60,10,0.4)"; g.lineWidth = 3; for (const dx of [-14, -2]) { g.beginPath(); g.moveTo(VX + dx, VY - 12); g.quadraticCurveTo(VX + dx - 6, VY + 120, VX + dx + 4, VY + VH + 36); g.stroke(); }
    // bufanda de rayas colgada de un gancho (sin letras)
    const BX = 520, BY = 120;
    g.fillStyle = "#3a2a1a"; g.beginPath(); g.arc(BX, BY, 5, 0, TAU); g.fill();
    for (let i = 0; i < 2; i++) {
      const x0 = BX - 34 + i * 40, L = 150 + i * 16;
      g.save(); g.translate(x0, BY + 6); g.rotate(i ? -0.08 : 0.1);
      for (let k = 0; k < 8; k++) { g.fillStyle = ["#1f2d5a", "#f3f0e6", "#c8202e"][k % 3]; g.fillRect(0, k * L / 8, 28, L / 8 + 0.5); }
      g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(0, 0, 28, L);
      g.strokeStyle = "#f3f0e6"; g.lineWidth = 2; for (let f = 0; f < 6; f++) { g.beginPath(); g.moveTo(3 + f * 4.5, L); g.lineTo(3 + f * 4.5, L + 12); g.stroke(); }
      g.restore();
    }
    // lámpara de pie (latón) a la derecha del sofá
    const LX = 980;
    g.strokeStyle = "#6d5214"; g.lineWidth = 5; g.beginPath(); g.moveTo(LX, 160); g.lineTo(LX, 420); g.stroke();
    g.fillStyle = "#6d5214"; g.beginPath(); g.ellipse(LX, 422, 22, 6, 0, 0, TAU); g.fill();
    const halo = g.createRadialGradient(LX, 150, 10, LX, 170, 230); halo.addColorStop(0, "rgba(255,214,140,0.55)"); halo.addColorStop(1, "rgba(255,214,140,0)");
    g.fillStyle = halo; g.fillRect(LX - 240, 0, 480, 420);
    g.fillStyle = "#f6d896"; g.beginPath(); g.moveTo(LX - 34, 168); g.lineTo(LX + 34, 168); g.lineTo(LX + 22, 116); g.lineTo(LX - 22, 116); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    // sofá de terciopelo verde empujado contra la pared
    sofa(g, 572, 912);
    // mueble bajo de la tele
    const MX0 = 84, MX1 = 418, MY0 = 324, MY1 = 398;
    g.fillStyle = "#7a4f2c"; g.fillRect(MX0, MY0, MX1 - MX0, MY1 - MY0); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(MX0, MY0, MX1 - MX0, MY1 - MY0);
    g.fillStyle = "#93633a"; g.fillRect(MX0 - 6, MY0, MX1 - MX0 + 12, 10); g.strokeRect(MX0 - 6, MY0, MX1 - MX0 + 12, 10);
    for (let i = 0; i < 3; i++) { const x = MX0 + 10 + i * (MX1 - MX0 - 20) / 3, w = (MX1 - MX0 - 20) / 3 - 6; g.fillStyle = "#6a4325"; g.fillRect(x, MY0 + 18, w, 48); g.strokeRect(x, MY0 + 18, w, 48);
      g.fillStyle = "#e3c58a"; g.beginPath(); g.arc(x + w / 2, MY0 + 42, 3.5, 0, TAU); g.fill(); g.stroke(); }
    g.fillStyle = "#4a2c16"; for (const x of [MX0 + 6, MX1 - 14]) g.fillRect(x, MY1, 8, 8);
    // planta en el mueble
    g.fillStyle = "#c46a3c"; g.beginPath(); g.moveTo(374, MY0); g.lineTo(406, MY0); g.lineTo(403, MY0 - 22); g.lineTo(377, MY0 - 22); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke();
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#2f7a3e" : "#46a052"; g.beginPath(); g.ellipse(390 + (hash(i + 40) - 0.5) * 34, MY0 - 30 - hash(i + 49) * 16, 5.5, 12, (hash(i + 43) - 0.5) * 1.8, 0, TAU); g.fill(); g.lineWidth = 1; g.stroke(); }
    // tarima encerada: tablas largas en perspectiva
    tarima(g);
    // banderines (azul, blanco, rojo) de lado a lado
    const ban = []; for (let i = 0; i <= 24; i++) { const u = i / 24; ban.push(P(-10 + u * (W + 20), 26 + 40 * Math.sin(Math.PI * u) + 8 * Math.sin(u * 9))); }
    g.strokeStyle = "#2a1a14"; g.lineWidth = 1.6; g.beginPath(); M2.curva(g, ban, false, 0.5); g.stroke();
    for (let i = 0; i < 24; i++) {
      const a = ban[i], b = ban[i + 1], m = P((a.x + b.x) / 2, (a.y + b.y) / 2 + 26);
      g.fillStyle = ["#1f2d5a", "#f3f0e6", "#c8202e"][i % 3]; g.beginPath(); g.moveTo(a.x + 2, a.y); g.lineTo(b.x - 2, b.y); g.lineTo(m.x, m.y); g.closePath(); g.fill();
      g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
    }
    // viñeta suave
    const v = g.createRadialGradient(512, 320, 300, 512, 320, 760); v.addColorStop(0, "rgba(20,5,10,0)"); v.addColorStop(1, "rgba(20,5,10,0.42)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    return c;
  }
  function sofa(g, x0, x1) {
    const yA = 246, yS = 336, yB = 410;
    g.save(); g.lineJoin = "round"; g.strokeStyle = TINTA; g.lineWidth = 2.2;
    // respaldo
    const vel = g.createLinearGradient(0, yA, 0, yB); vel.addColorStop(0, "#2f6b4f"); vel.addColorStop(1, "#1d4a36");
    g.fillStyle = vel; g.beginPath(); g.moveTo(x0 + 30, yS); g.lineTo(x0 + 30, yA + 20); g.quadraticCurveTo(x0 + 30, yA, x0 + 54, yA); g.lineTo(x1 - 54, yA); g.quadraticCurveTo(x1 - 30, yA, x1 - 30, yA + 20); g.lineTo(x1 - 30, yS); g.closePath(); g.fill(); g.stroke();
    // botones capitoné
    g.fillStyle = "#173b2b"; for (let i = 0; i < 8; i++) for (let j = 0; j < 3; j++) { if (j % 2 && i === 7) continue; g.beginPath(); g.arc(x0 + 66 + i * (x1 - x0 - 132) / 7 + (j % 2) * (x1 - x0 - 132) / 14, yA + 20 + j * 20, 2.8, 0, TAU); g.fill(); }
    // asiento y cojines
    g.fillStyle = "#2b6247"; g.fillRect(x0 + 24, yS - 6, x1 - x0 - 48, 30); g.strokeRect(x0 + 24, yS - 6, x1 - x0 - 48, 30);
    for (let i = 0; i < 2; i++) { const cx = x0 + 34 + i * (x1 - x0 - 68) / 2, w = (x1 - x0 - 68) / 2 - 4;
      g.fillStyle = "#357555"; g.beginPath(); g.moveTo(cx, yS - 4); g.quadraticCurveTo(cx + w / 2, yS - 16, cx + w, yS - 4); g.lineTo(cx + w, yS + 14); g.lineTo(cx, yS + 14); g.closePath(); g.fill(); g.stroke(); }
    g.fillStyle = "#1d4a36"; g.fillRect(x0 + 24, yS + 24, x1 - x0 - 48, yB - yS - 30); g.strokeRect(x0 + 24, yS + 24, x1 - x0 - 48, yB - yS - 30);
    // brazos
    for (const [xa, sg] of [[x0, 1], [x1, -1]]) {
      g.fillStyle = "#2b6247"; g.beginPath(); g.moveTo(xa, yB - 6); g.lineTo(xa, yS - 30); g.quadraticCurveTo(xa, yS - 46, xa + sg * 22, yS - 46); g.quadraticCurveTo(xa + sg * 44, yS - 46, xa + sg * 44, yS - 30); g.lineTo(xa + sg * 44, yB - 6); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.12)"; g.beginPath(); g.ellipse(xa + sg * 22, yS - 36, 16, 6, 0, 0, TAU); g.fill();
    }
    // cojines sueltos (azul y rojo, sin letras)
    for (const [cx, col, a] of [[x0 + 90, "#c8202e", -0.18], [x1 - 100, "#f3f0e6", 0.16]]) {
      g.save(); g.translate(cx, yS - 26); g.rotate(a); g.fillStyle = col; g.beginPath(); g.moveTo(-30, -26); g.quadraticCurveTo(0, -34, 30, -26); g.quadraticCurveTo(38, 0, 30, 26); g.quadraticCurveTo(0, 32, -30, 26); g.quadraticCurveTo(-38, 0, -30, -26); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 2; g.beginPath(); g.moveTo(-20, -10); g.lineTo(18, 12); g.stroke(); g.restore();
    }
    g.fillStyle = "#3b2418"; for (const x of [x0 + 10, x1 - 18]) g.fillRect(x, yB - 6, 8, 10);
    g.restore();
  }
  function tarima(g) {
    const Y0 = PARED, Y1 = H;
    const base = g.createLinearGradient(0, Y0, 0, Y1); base.addColorStop(0, "#9a6232"); base.addColorStop(1, "#c88a4e");
    g.fillStyle = base; g.fillRect(0, Y0, W, Y1 - Y0);
    // tablas horizontales: más estrechas al fondo
    let y = Y0, k = 0;
    while (y < Y1) {
      const h = 7 + (y - Y0) * 0.085, off = (k * 173) % 260;
      for (let x = -off; x < W; x += 260) {
        const tono = hash(k * 31 + Math.floor(x)) * 0.14;
        g.fillStyle = `rgba(${tono > 0.07 ? "255,220,170" : "70,30,10"},${Math.abs(tono - 0.07) * 1.4})`; g.fillRect(x, y, 260, h);
        g.fillStyle = "rgba(60,25,8,0.55)"; g.fillRect(x, y, 1.6, h);
      }
      g.fillStyle = "rgba(60,25,8,0.5)"; g.fillRect(0, y, W, 1.2);
      y += h; k++;
    }
    // vetas
    g.strokeStyle = "rgba(90,40,12,0.18)"; g.lineWidth = 1;
    for (let i = 0; i < 70; i++) { const yy = Y0 + 6 + hash(i + 3) * (Y1 - Y0 - 8), xx = hash(i + 9) * W; g.beginPath(); g.moveTo(xx, yy); g.quadraticCurveTo(xx + 40, yy - 2, xx + 90, yy + 1); g.stroke(); }
    // brillo de cera: reflejos de la lámpara, de la ventana y de la tele
    const r1 = g.createRadialGradient(980, 470, 4, 980, 470, 150); r1.addColorStop(0, "rgba(255,230,180,0.5)"); r1.addColorStop(1, "rgba(255,230,180,0)");
    g.fillStyle = r1; g.save(); g.translate(0, 0); g.scale(1, 0.45); g.beginPath(); g.ellipse(980, 470 / 0.45, 150, 150, 0, 0, TAU); g.restore();
    g.save(); g.scale(1, 0.4); g.fillStyle = r1; g.fillRect(820, 1000, 330, 300); g.restore();
    g.fillStyle = "rgba(255,240,220,0.08)"; g.beginPath(); g.moveTo(850, Y0); g.lineTo(1000, Y0); g.lineTo(1080, Y1); g.lineTo(780, Y1); g.closePath(); g.fill();
    const r2 = g.createLinearGradient(0, Y0, 0, Y0 + 80); r2.addColorStop(0, "rgba(160,200,255,0.18)"); r2.addColorStop(1, "rgba(160,200,255,0)");
    g.fillStyle = r2; g.beginPath(); g.moveTo(100, Y0); g.lineTo(350, Y0); g.lineTo(390, Y0 + 80); g.lineTo(62, Y0 + 80); g.closePath(); g.fill();
    // zócalo en sombra sobre la tarima
    const s = g.createLinearGradient(0, Y0, 0, Y0 + 14); s.addColorStop(0, "rgba(30,10,4,0.45)"); s.addColorStop(1, "rgba(30,10,4,0)");
    g.fillStyle = s; g.fillRect(0, Y0, W, 14);
  }

  /* ---------- la tele: partido, gol y fiesta ---------- */
  // destello del gol: sube en `sube` segundos y se apaga poco a poco
  const destello = (t, sube, apaga) => t <= T.gol ? 0 : t < T.gol + sube ? suave((t - T.gol) / sube) : Math.exp(-(t - T.gol - sube) * apaga);
  function tele(g, t) {
    const { x0, y0, x1, y1 } = TV, w = x1 - x0, h = y1 - y0;
    const tuerce = 0.035 * tramo(t, T.crash, T.crash + 0.25, salida) + (t > T.crash ? 0.02 * Math.sin((t - T.crash) * 30) * Math.exp(-(t - T.crash) * 5) : 0);
    g.save(); g.translate((x0 + x1) / 2, y1 + 10); g.rotate(tuerce); g.translate(-(x0 + x1) / 2, -(y1 + 10));
    // pie y marco
    g.fillStyle = "#1a1a1e"; g.fillRect((x0 + x1) / 2 - 30, y1 + 2, 60, 8); g.fillRect((x0 + x1) / 2 - 8, y1 - 4, 16, 10);
    g.fillStyle = "#121216"; g.fillRect(x0 - 8, y0 - 8, w + 16, h + 16); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x0 - 8, y0 - 8, w + 16, h + 16);
    g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
    // el campo
    g.fillStyle = "#2d8a3a"; g.fillRect(x0, y0, w, h);
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"; g.fillRect(x0 + i * w / 8, y0, w / 8, h); }
    g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 1.5;
    g.strokeRect(x0 + 8, y0 + 8, w - 16, h - 16); g.beginPath(); g.moveTo(x0 + w / 2, y0 + 8); g.lineTo(x0 + w / 2, y1 - 8); g.stroke();
    g.beginPath(); g.arc(x0 + w / 2, y0 + h / 2, 16, 0, TAU); g.stroke();
    g.strokeRect(x0 + 8, y0 + h / 2 - 26, 26, 52); g.strokeRect(x1 - 34, y0 + h / 2 - 26, 26, 52);
    // red de la portería (izquierda) que se abomba con el gol
    const abomba = campana(t, T.gol - 0.02, T.gol + 0.5);
    g.fillStyle = "rgba(255,255,255,0.5)"; g.fillRect(x0 + 2 - 4 * abomba, y0 + h / 2 - 12, 6 + 4 * abomba, 24);
    // jugadores: ataque hacia la izquierda; después del gol, piña en el córner
    const fiesta = tramo(t, T.gol + 0.2, T.gol + 1.2) * (1 - tramo(t, 6.0, 7.2));     // piña en el córner y vuelta al centro
    const azules = [[0.62, 0.3], [0.48, 0.62], [0.36, 0.42], [0.55, 0.78], [0.3, 0.7]], rojos = [[0.2, 0.36], [0.24, 0.6], [0.16, 0.5], [0.4, 0.22], [0.08, 0.5]];
    const avanza = clamp((t - 0.2) / (T.gol - 0.2));
    for (let i = 0; i < azules.length; i++) {
      const [ax, ay] = azules[i];
      let px = ax - 0.18 * avanza + 0.015 * Math.sin(t * 3 + i), py = ay + 0.03 * Math.sin(t * 2.3 + i * 1.7);
      px = lerp(px, 0.8 + 0.07 * Math.cos(i * 1.3 + t * 3), fiesta); py = lerp(py, 0.2 + 0.06 * Math.sin(i * 2.1 + t * 4) - 0.03 * Math.abs(Math.sin(t * 8 + i)), fiesta);
      if (t > 6.0) { const k = tramo(t, 6.0, 7.2); px = lerp(px, ax + 0.12, k * (1 - fiesta)); }
      g.fillStyle = "#1f2d5a"; g.beginPath(); g.arc(x0 + px * w, y0 + py * h, 4.2, 0, TAU); g.fill(); g.strokeStyle = "#ffffff"; g.lineWidth = 1; g.stroke();
    }
    for (let i = 0; i < rojos.length; i++) {
      const [rx, ry] = rojos[i];
      const px = rx + 0.02 * Math.sin(t * 2.7 + i) - 0.04 * avanza * (i % 2), py = ry + 0.03 * Math.sin(t * 2 + i);
      g.fillStyle = "#c8202e"; g.beginPath(); g.arc(x0 + px * w, y0 + py * h, 4.2, 0, TAU); g.fill(); g.strokeStyle = "#ffffff"; g.lineWidth = 1; g.stroke();
    }
    // balón: pase, pase y disparo a la red
    if (t < T.gol + 0.3) {
      const keys = [[0, 0.62, 0.3], [0.5, 0.48, 0.6], [0.85, 0.34, 0.44], [T.gol, 0.03, 0.5]];
      let bx = keys[0][1], by = keys[0][2];
      for (let i = 0; i < keys.length - 1; i++) { if (t >= keys[i][0]) { const u = clamp((t - keys[i][0]) / (keys[i + 1][0] - keys[i][0])); bx = lerp(keys[i][1], keys[i + 1][1], u); by = lerp(keys[i][2], keys[i + 1][2], u); } }
      g.fillStyle = "#ffffff"; g.beginPath(); g.arc(x0 + bx * w, y0 + by * h, 2.6, 0, TAU); g.fill();
    }
    // saque de centro: el balón vuelve a rodar por el medio
    const saque = tramo(t, 7.0, 7.4);
    if (saque > 0) { g.globalAlpha = saque; g.fillStyle = "#ffffff"; g.beginPath(); g.arc(x0 + w * (0.5 - 0.12 * clamp((t - 7.6) / 4)) + 4 * Math.sin(t * 2), y0 + h * (0.5 + 0.08 * Math.sin(t * 0.9)), 2.6, 0, TAU); g.fill(); g.globalAlpha = 1; }
    // ¡gol!: destello y fiesta de luces y confeti
    const flash = destello(t, 0.08, 5);
    const luces = tramo(t, T.gol, T.gol + 0.25) * (1 - tramo(t, T.gol + 3.4, T.gol + 4.2));
    if (luces > 0.01) {
      // focos del estadio que barren la pantalla
      g.globalAlpha = 0.32 * luces;
      for (let i = 0; i < 4; i++) {
        const ox = i < 2 ? x0 + 10 : x1 - 10, a = (i < 2 ? 0.55 : Math.PI - 0.55) + (i % 2 ? 0.35 : -0.1) + 0.45 * Math.sin(t * 2.2 + i * 1.3) * (i < 2 ? 1 : -1);
        g.fillStyle = ["#fff3b0", "#ffffff", "#bfeaff", "#fff3b0"][i]; g.beginPath(); g.moveTo(ox, y0);
        g.lineTo(ox + Math.cos(a - 0.12) * 260, y0 + Math.sin(a - 0.12) * 260); g.lineTo(ox + Math.cos(a + 0.12) * 260, y0 + Math.sin(a + 0.12) * 260); g.closePath(); g.fill();
      }
      g.globalAlpha = luces;
      for (let i = 0; i < 40; i++) {
        const ph = (t * (0.35 + hash(i) * 0.3) + hash(i + 40)) % 1;
        const cx = x0 + hash(i + 7) * w + 6 * Math.sin(t * 4 + i), cy = y0 + ph * (h + 10) - 5;
        g.save(); g.translate(cx, cy); g.rotate(t * 5 + i); g.fillStyle = ["#ffe066", "#ff5d73", "#5ee0ff", "#ffffff", "#7dff9a"][i % 5]; g.fillRect(-2.5, -1.2, 5, 2.4); g.restore();
      }
      g.globalAlpha = 1;
    }
    if (flash > 0.01) { g.fillStyle = `rgba(255,255,255,${0.9 * flash})`; g.fillRect(x0, y0, w, h); }
    // interferencia con el golpe
    const glitch = t > T.crash ? Math.exp(-(t - T.crash) * 6) * (t < T.crash + 0.6 ? 1 : 0) : 0;
    if (glitch > 0.02) { for (let i = 0; i < 7; i++) { g.fillStyle = `rgba(255,255,255,${0.35 * glitch})`; g.fillRect(x0, y0 + hash(i + Math.floor(t * 30)) * h, w, 3 + 4 * hash(i + 3)); } }
    // reflejo del cristal
    g.fillStyle = "rgba(255,255,255,0.07)"; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + w * 0.45, y0); g.lineTo(x0 + w * 0.2, y1); g.lineTo(x0, y1); g.closePath(); g.fill();
    g.restore();
    g.restore();
  }
  // el salón se ilumina con la tele
  function luzTele(g, t) {
    const flash = destello(t, 0.18, 3.5);
    const fiesta = tramo(t, T.gol, T.gol + 0.3) * (1 - tramo(t, T.gol + 3.4, T.gol + 4.2));
    if (flash > 0.01) { g.fillStyle = `rgba(255,250,235,${0.1 * flash})`; g.fillRect(0, 0, W, H); }
    if (fiesta > 0.01) {
      const PAL = [[255, 224, 102], [255, 93, 115], [94, 224, 255], [176, 125, 255]], u = t * 1.6, i0 = Math.floor(u) % 4, fr = suave(u - Math.floor(u));
      const col = PAL[i0].map((v, j) => Math.round(lerp(v, PAL[(i0 + 1) % 4][j], fr))).join(",");
      const gr = g.createRadialGradient(225, 250, 20, 225, 280, 440); gr.addColorStop(0, `rgba(${col},${0.22 * fiesta})`); gr.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = gr; g.fillRect(0, 0, 700, H);
    }
  }

  /* ---------- efectos ---------- */
  // estela en la tarima de las rodillas al deslizar (se queda un rato)
  function huellas(g, t) {
    g.save(); g.lineCap = "round";
    const tramos = [[T.rodilla, T.para, xB, carrilB], [T.rodillaG, T.paraG, xG1, () => FONDO], [T.rodilla2, T.entra0 - 0.2, xG2, () => FRENTE]];
    for (const [t0, t1, xf, cf] of tramos) {
      if (t < t0) continue;
      const te = Math.min(t, t1), vida = clamp(1 - (t - t1) / 2.4);
      if (vida <= 0) continue;
      for (const dy of [0, -4]) {
        g.strokeStyle = `rgba(255,236,200,${0.45 * vida})`; g.lineWidth = 2.2; g.beginPath();
        const n = 14;
        for (let i = 0; i <= n; i++) { const tt = lerp(t0, te, i / n), c = cf(tt); const x = xf(tt), y = c.suelo - 2 + dy; if (i) g.lineTo(x, y); else g.moveTo(x, y); }
        g.stroke();
      }
    }
    g.restore();
  }
  // brillo de la cera bajo las rodillas mientras se desliza
  function brilloRodillas(g, t) {
    for (const [t0, t1, xf, cf] of [[T.rodilla, T.para, xB, carrilB], [T.rodilla2, T.entra0 - 0.3, xG2, () => FRENTE]]) {
      const k = tramo(t, t0, t0 + 0.08) * (1 - tramo(t, t1 - 0.25, t1)); if (k <= 0.01) continue;
      const x = xf(t), y = cf(t).suelo - 1;
      const gr = g.createRadialGradient(x, y, 2, x, y, 70); gr.addColorStop(0, `rgba(255,246,225,${0.5 * k})`); gr.addColorStop(1, "rgba(255,246,225,0)");
      g.save(); g.translate(x, y); g.scale(1, 0.18); g.translate(-x, -y); g.fillStyle = gr; g.beginPath(); g.arc(x, y, 70, 0, TAU); g.fill(); g.restore();
    }
  }
  // polvillo y chispas al caer de rodillas y al deslizar
  function polvo(g, t, x, y, t0, dur, dir, fuerza = 1) {
    const u = (t - t0) / dur; if (u < 0 || u > 1) return;
    g.save();
    for (let i = 0; i < 9; i++) {
      const a = Math.PI + dir * (0.2 + hash(i) * 0.9) * (dir > 0 ? -1 : 1), v = (40 + 60 * hash(i + 4)) * fuerza;
      const px = x + Math.cos(a) * v * u * dir * -1, py = y - Math.abs(Math.sin(a)) * v * u * 0.5 - 6 * u;
      g.globalAlpha = 0.45 * (1 - u); g.fillStyle = "#f2e2c4";
      g.beginPath(); g.arc(px, py, (5 + 7 * hash(i + 9)) * (0.6 + u), 0, TAU); g.fill();
    }
    g.restore();
  }
  function rayasVelocidad(g, t, p, R, desde, hasta, dir) {
    const k = campana(t, desde, hasta); if (k < 0.02) return;
    const top = R.aPantalla(p, R.tronco(p)(R.CUELLO)), base = P(p.x, p.suelo);
    g.save(); g.strokeStyle = `rgba(255,248,230,${0.6 * k})`; g.lineCap = "round"; g.lineWidth = 2.4;
    for (let i = 0; i < 6; i++) {
      const y = lerp(top.y + 20, base.y - 16, i / 5) + 4 * Math.sin(i * 3 + t * 20), L = 50 + 40 * hash(i + Math.floor(t * 18));
      const x = p.x + dir * (50 + 20 * hash(i + 2));
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + dir * L, y); g.stroke();
    }
    g.restore();
  }
  // gritos: rayitas que salen de la boca
  function grito(g, t, R, p, k) {
    if (k < 0.02) return;
    const b = R.aPantalla(p, R.boca(p)), dir = (p.espejo ? -1 : 1) * Math.sign(p.sx || 1), phi = p.cabeza.ang + p.torso;
    g.save(); g.strokeStyle = `rgba(255,250,235,${0.85 * k})`; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < 4; i++) {
      const a = phi - 0.5 + i * 0.33 + 0.05 * Math.sin(t * 20 + i), r0 = 40 + 6 * Math.sin(t * 25 + i), r1 = r0 + 16;
      g.beginPath(); g.moveTo(b.x + dir * Math.cos(a) * r0, b.y + Math.sin(a) * r0 - 6); g.lineTo(b.x + dir * Math.cos(a) * r1, b.y + Math.sin(a) * r1 - 6); g.stroke();
    }
    g.restore();
  }
  function estrella(g, x, y, r, n, giro, hueco = 0.45) {
    g.beginPath();
    for (let i = 0; i < n * 2; i++) { const a = giro + i * Math.PI / n, rr = i % 2 ? r * hueco : r; const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; if (i) g.lineTo(px, py); else g.moveTo(px, py); }
    g.closePath();
  }
  // el golpe fuera de cuadro: estallido en el borde, polvareda que entra y temblor
  function golpeFuera(g, t) {
    const u = t - T.crash; if (u < 0 || u > 1.6) return;
    const k = campana(t, T.crash, T.crash + 0.35);
    if (k > 0.01) { g.save(); g.globalAlpha = k; estrella(g, 6, 470, 70 * k + 20, 9, 0.2, 0.5); g.fillStyle = "#fff2b0"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 3; g.stroke(); g.restore(); }
    g.save();
    for (let i = 0; i < 12; i++) {
      const a = (hash(i + 3) - 0.5) * 1.6, v = 60 + 90 * hash(i + 6), uu = clamp(u / 1.6);
      const px = -10 + Math.cos(a) * v * Math.sqrt(uu) * 1.2, py = 470 + Math.sin(a) * v * Math.sqrt(uu) * 0.6 - 30 * uu;
      g.globalAlpha = 0.6 * (1 - uu); g.fillStyle = "#e9dcc4"; g.beginPath(); g.arc(px, py, (14 + 16 * hash(i + 9)) * (0.5 + uu), 0, TAU); g.fill();
    }
    g.restore();
  }
  const temblor = t => { const u = t - T.crash; if (u <= 0 || u > 0.7) return P(0, 0); const k = Math.exp(-u * 6); return P(5 * k * Math.sin(u * 61), 3.5 * k * Math.sin(u * 53 + 1)); };
  // el cuadro de la pared izquierda se descuelga y se queda torcido en el suelo
  function cuadro(g, t) {
    const u = fase(t, T.crash + 0.05, T.crash + 0.5);
    const y = lerp(170, 352, entrada(u)) - (u >= 1 ? 6 * Math.abs(Math.sin((t - T.crash - 0.5) * 12)) * Math.exp(-(t - T.crash - 0.5) * 6) : 0);
    const a = lerp(0.02, 0.24, salida(u)) + (u > 0 && u < 1 ? 0.15 * Math.sin(u * 9) : 0);
    g.save(); g.translate(46, y + 40); g.rotate(a);
    g.fillStyle = "#c9a35a"; g.fillRect(-36, -40, 72, 80); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(-36, -40, 72, 80);
    g.fillStyle = "#2d8a3a"; g.fillRect(-28, -32, 56, 64); g.fillStyle = "#9fd2ff"; g.fillRect(-28, -32, 56, 30);
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(0, -2, 13, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = "#18161c"; estrella(g, 0, -2, 5, 5, -Math.PI / 2, 1); g.fill();
    g.restore();
  }
  // el balón que sale rodando del golpe
  function balonRueda(g, t) {
    const u = fase(t, T.crash + 0.15, T.crash + 1.4); if (u <= 0) return;
    const x = lerp(-20, 156, salida(u)), r = 13, y = FONDO.suelo - 8 - r;
    g.save(); g.fillStyle = "rgba(40,15,5,0.3)"; g.beginPath(); g.ellipse(x, y + r + 2, r, 3, 0, 0, TAU); g.fill();
    g.translate(x, y); g.rotate((x + 20) / r);
    g.fillStyle = "#fbfaf4"; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
    g.fillStyle = "#18161c"; estrella(g, 0, 0, 5, 5, 0, 1); g.fill();
    for (let i = 0; i < 5; i++) { const a = i * TAU / 5; estrella(g, Math.cos(a) * 11, Math.sin(a) * 11, 3.4, 5, a, 1); g.fill(); }
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke();
    g.restore();
  }
  // estrellitas alrededor de la camiseta tras el ¡bonk!
  function bonkEfecto(g, t, pg, pb) {
    const k = campana(t, T.bonkG - 0.01, T.bonkG + 0.25);
    const c = G.aPantalla(pg, G.cabeza(pg).a(P(1040, 560)));
    if (k > 0.01) { g.save(); g.globalAlpha = k; estrella(g, c.x + 12, c.y - 10, 26 * k + 8, 8, 0.3, 0.45); g.fillStyle = "#fff6c8"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke(); g.restore(); }
    const ks = campana(t, T.bonkG + 0.05, T.agarra1 + 0.2);
    if (ks > 0.01) {
      const cc = G.aPantalla(pg, G.cabeza(pg).a(P(780, 230)));
      g.save(); g.globalAlpha = ks;
      for (let i = 0; i < 4; i++) { const a = t * 7 + i * TAU / 4; estrella(g, cc.x + Math.cos(a) * 34, cc.y + Math.sin(a) * 9 - 6, 7, 5, t * 4 + i); g.fillStyle = "#ffe066"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke(); }
      g.restore();
    }
  }
  function destelloGuino(g, t, pb) {
    const k = campana(t, T.guino + 0.02, T.guino + 0.5); if (k <= 0) return;
    const q = GB.aPantalla(pb, GB.cabeza(pb).a(P(760, 490)));
    g.save(); g.globalAlpha = k; estrella(g, q.x - 14, q.y - 6, 9 * k + 3, 4, t * 2, 0.3); g.fillStyle = "#fff6c8"; g.fill(); g.restore();
  }

  // dibuja un personaje con su giro aplastado (sx) alrededor de su x
  function dibuja(R, g, p, t) {
    const sx = p.sx ?? 1;
    if (Math.abs(sx - 1) < 1e-4) { R.dibujar(g, p, t); return; }
    g.save(); g.translate(p.x, 0); g.scale(sx, 1); g.translate(-p.x, 0); R.dibujar(g, p, t); g.restore();
  }
  function sombra(g, p, ancho, alto) {
    const lev = clamp((GB.PELVIS.y - p.pelvis.y) * p.s / 80);
    g.beginPath(); g.ellipse(p.x, p.suelo + 2, ancho * (1 - 0.35 * lev), 7, 0, 0, TAU); g.fill();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const acerca = tramo(t, 2.6, 3.4, suave) * (1 - tramo(t, 4.15, 4.75, suave));
    const final = tramo(t, 12.0, 13.4, suave);
    const k = 1 + 0.14 * acerca + 0.05 * final * (1 - acerca);
    const sujeto = P(550, 336);
    let f = mezcla(mezcla(P(512, 300), sujeto, acerca), P(480, 320), final * (1 - acerca));
    // sin salirse del decorado
    const hx = 512 / k, hy = 300 / k;
    f = P(clamp(f.x, hx, W - hx), clamp(f.y, hy, H - hy));
    return { k, f };
  }

  class GuillermoGabachoCelebracion extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !GB.listo()) return;
      if (!fondo) fondo = creaFondo();
      const luz = tramo(t, NEGRO_INICIO, 0.75) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02));
      const pg = poseG(t), pb = poseB(t);
      g.save();
      const cam = camara(t), tb = temblor(t);
      g.translate(512 + tb.x, 300 + tb.y); g.scale(cam.k, cam.k); g.translate(-cam.f.x, -cam.f.y);
      g.drawImage(fondo, 0, 0);
      tele(g, t);
      cuadro(g, t);
      luzTele(g, t);
      huellas(g, t);
      brilloRodillas(g, t);
      balonRueda(g, t);
      // sombras
      g.fillStyle = "rgba(40,15,5,0.32)";
      if (pg.x > -200 && pg.x < W + 200) sombra(g, pg, 64);
      sombra(g, pb, 64);
      // polvillo de las rodillas
      polvo(g, t, xB(T.rodilla), MEDIO.suelo - 30, T.rodilla - 0.02, 0.5, -1);
      polvo(g, t, X_PARA_G, FONDO.suelo, T.paraG - 0.05, 0.4, -1, 0.5);
      polvo(g, t, xG2(T.rodilla2), FRENTE.suelo, T.rodilla2 - 0.02, 0.6, -1, 1.3);
      // orden: Guillermo detrás salvo cuando pasa por delante deslizándose
      const delante = t > T.vuelve0 - 0.05 && t < T.entra0 - 0.05;
      rayasVelocidad(g, t, pg, G, T.huye0, T.huye1, -1);
      if (!delante) { dibuja(G, g, pg, t); }
      rayasVelocidad(g, t, pb, GB, T.rodilla, T.para, 1);
      dibuja(GB, g, pb, t);
      if (delante) {
        rayasVelocidad(g, t, pg, G, T.vuelve0, T.entra0 - 0.6, 1);
        dibuja(G, g, pg, t);
      }
      grito(g, t, GB, pb, campana(t, T.gol, T.gol + 0.9) + campana(t, T.ruge0, T.ruge1));
      grito(g, t, G, pg, campana(t, T.gol + 0.05, T.gol + 0.95));
      bonkEfecto(g, t, pg, pb);
      destelloGuino(g, t, pb);
      golpeFuera(g, t);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00080", nombre: "Guillermo y Gabacho · La celebración", crear: () => new GuillermoGabachoCelebracion() });
  window.__A2D_00080 = { pose, T, DUR };
})();
