"use strict";
/* 00063 · Guillermo y Deivi · El balón
 *
 * Negro → a la puerta del bar, al caer la tarde: fachada ocre con zócalo de azulejos, ventana
 * iluminada con toldo de rayas, puerta verde, un farol colgado de un brazo de hierro y, a la
 * izquierda, la esquina de piedra del edificio de al lado. Hay un balón en la acera.
 * Deivi (derecha, mirando a Guillermo, con las manos en los bolsillos) lo levanta de puntera y hace
 * toques: empeine, empeine, rodilla, cabeza, hombro… y lo caza en la nuca, doblado, mirando a
 * Guillermo de reojo → Guillermo se queda boquiabierto, pone cara de «bah, eso lo hago yo», se
 * recoloca los hombros y le pide el balón con la mano → Deivi, con un golpe de riñones, hace saltar
 * el balón de la nuca, se endereza y se lo pasa de cabeza → Guillermo, con la lengua fuera, lo recibe con el empeine… y el balón
 * le sale disparado a la cara (¡pum!, se le queda la marca roja) → aturdido, levanta la rodilla:
 * el balón sube al farol (se balancea y se le raja el cristal), le pasa rozando el pelo, rebota en
 * la esquina de piedra (deja la marca y caen migas) y vuelve para darle un coscorrón en la cabeza →
 * tres botecitos sobre el pelo de punta… y se queda allí, en equilibrio → Guillermo se congela con
 * los ojos arriba y los brazos abiertos; Deivi alucina y aplaude despacio → Guillermo mira a cámara
 * orgulloso, el balón se le va un pelo, lo recupera con la cabeza y vuelve a mirar a cámara con un
 * guiño; Deivi también mira a cámara → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto. El balón va por tramos de parábola (gravedad
 * constante) entre puntos de contacto fijos en el tiempo, sacados de las posturas en ese mismo
 * instante: empeine, rodilla, cabeza, hombro y nuca de Deivi; empeine, cara, rodilla y pelo de
 * Guillermo; el farol y la pared. Mientras descansa en la nuca o en el pelo, se calcula con la
 * postura de cada fotograma, así que nunca se despega.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, DV = Deivi;
  const S = 0.29, SUELO = 560, XG = 330, XD = 780;
  const DUR = 14.3;
  const GRAV = 1700, RB = 20;                      // gravedad (px/s²) y radio del balón (px)
  const TINTA = "#0b0a0e";
  const T = {
    dVa: 0.55, flick: 1.15, dPie1: 1.75, dPie2: 2.25, dRod: 2.8, dCab: 3.5, dHom: 4.22, dNuca: 4.78,
    dPop: 5.45, dPase: 6.25,
    gChulo: 5.05, gLlama0: 5.45, gLlama: [5.85, 6.1], gListo: 6.35,
    gPie: 7.0, gCara: 7.22, gRod: 7.6, lampara: 8.08, pared: 8.52, gCoco: 9.05, botes: [9.37, 9.57], quieto: 9.7,
    dManos: 10.0, aplausos: [10.55, 11.05, 11.55, 12.05, 12.55], dCamara: 12.9,
    gCamara: 11.3,
    fin: 13.45
  };

  /* ---------- utilidades ---------- */
  const P = (x, y) => ({ x, y });
  const rotP = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  // tramos de parábola: lista de [t, punto]; entre cada par el balón va en caída libre y llega justo
  function vuelo(lista, t) {
    for (let i = 0; i < lista.length - 1; i++) {
      const [t0, a] = lista[i], [t1, b] = lista[i + 1];
      if (t <= t1 || i === lista.length - 2) {
        const d = t1 - t0, u = clamp(t - t0, 0, d), vx = (b.x - a.x) / d, vy0 = (b.y - a.y) / d - 0.5 * GRAV * d;
        return { x: a.x + vx * u, y: a.y + vy0 * u + 0.5 * GRAV * u * u };
      }
    }
    return null;
  }

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.12, lengua: 0, esp: 0, mof: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  function parpadeo(t, lista) {
    let o = 0;
    for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); }
    return o;
  }
  const CARAS_G = {
    inicio: E({ mx: 0.85, my: 0.3, sd: 4, sonr: 0.3 }),
    sigue: E({ sd: 12, si: 10, abre: 6, ancho: 0.62, sonr: 0.12 }),
    asombro: E({ iris: 0.9, sd: 20, gd: 0.06, si: 18, abre: 28, ancho: 0.75, sonr: -0.05 }),
    chulo: E({ mx: -0.85, my: -0.15, c: 0.3, sd: 14, gd: 0.14, si: -2, gi: -0.05, sonr: 0.65 }),
    llama: E({ mx: 0.85, my: 0, c: 0.2, sd: 10, gd: 0.1, si: -2, sonr: 0.55 }),
    concentra: E({ c: 0.25, sd: -8, gd: -0.18, si: -6, gi: -0.15, abre: 7, ancho: 0.7, sonr: 0.1, lengua: 0.9 }),
    golpe: E({ c: 1, z: 1, sd: -10, gd: -0.2, si: -10, gi: -0.2, abre: 18, ancho: 0.62, sonr: -0.6 }),
    mareo: E({ esp: 0.85, sd: 8, si: 4, abre: 16, ancho: 0.8, sonr: -0.25 }),
    sigueAlto: E({ iris: 0.9, sd: 18, si: 18, abre: 24, ancho: 0.72, sonr: -0.05 }),
    coco: E({ c: 1, z: 0.9, sd: -6, si: -6, abre: 12, ancho: 1, sonr: -0.55 }),
    arriba: E({ mx: 0.05, my: -1, iris: 0.82, sd: 24, gd: 0.04, si: 24, gi: 0.04, abre: 9, ancho: 0.5, sonr: -0.1 }),
    orgullo: E({ mx: -0.8, my: -0.5, iris: 0.92, sd: 22, gd: 0.1, si: 12, abre: 3, ancho: 0.8, sonr: 0.5 }),
    guino: E({ mx: -0.8, my: -0.45, ci: 1, sd: 22, gd: 0.12, si: 4, abre: 4, ancho: 0.9, sonr: 0.7 })
  };
  const GUION_CARA_G = [
    [0.9, 1.25, "sigue"], [T.dNuca, T.dNuca + 0.15, "asombro"], [T.gChulo, T.gChulo + 0.25, "chulo"],
    [T.gLlama0, T.gLlama0 + 0.25, "llama"], [T.gListo, T.gListo + 0.3, "concentra"], [T.gCara - 0.01, T.gCara + 0.04, "golpe"],
    [T.gCara + 0.2, T.gCara + 0.35, "mareo"], [T.gRod + 0.06, T.gRod + 0.22, "sigueAlto"], [T.gCoco - 0.01, T.gCoco + 0.05, "coco"],
    [T.gCoco + 0.3, T.gCoco + 0.5, "arriba"], [T.gCamara, T.gCamara + 0.4, "orgullo"],
    [T.gCamara + 0.85, T.gCamara + 0.97, "arriba"], [T.gCamara + 1.55, T.gCamara + 1.85, "orgullo"], [T.gCamara + 1.9, T.gCamara + 2.02, "guino"]
  ];
  const CARAS_D = {
    inicio: E({ mx: 0.5, my: 0.6, c: 0.15, sd: 2, si: 6, gi: 0.05, sonr: 0.45, ancho: 0.9 }),
    juega: E({ c: 0.1, sd: 4, si: 6, sonr: 0.55, ancho: 0.95 }),
    cabeza: E({ c: 0.35, sd: 2, si: 4, abre: 4, sonr: 0.4, ancho: 0.95 }),
    chulo: E({ mx: 0.85, my: 0.25, c: 0.25, sd: -2, si: 14, gi: 0.1, sonr: 0.75, ancho: 1 }),
    pase: E({ c: 0.2, sd: 6, si: 6, sonr: 0.5 }),
    mira: E({ c: 0.1, sd: 4, si: 6, sonr: 0.35 }),
    ay: E({ c: 0.9, z: 1, sd: -6, gd: -0.14, si: -6, gi: -0.14, abre: 20, ancho: 1.1, sonr: -0.6 }),
    sigue: E({ sd: 12, si: 12, abre: 8, ancho: 0.7, sonr: 0.05 }),
    pasmo: E({ iris: 0.8, sd: 24, gd: 0.05, si: 24, gi: 0.05, abre: 42, ancho: 0.85, sonr: 0 }),
    feliz: E({ c: 0.2, h: 0.9, sd: 14, si: 16, abre: 26, ancho: 1.1, sonr: 1 }),
    aplaude: E({ c: 0.25, h: 0.6, sd: 10, si: 12, abre: 14, ancho: 1.05, sonr: 0.85 }),
    camara: E({ mx: -0.85, my: -0.1, c: 0.2, h: 0.5, sd: 6, si: 18, gi: 0.1, abre: 8, sonr: 0.9 })
  };
  const GUION_CARA_D = [
    [1.0, 1.2, "juega"], [T.dCab - 0.12, T.dCab + 0.04, "cabeza"], [T.dCab + 0.15, T.dCab + 0.35, "juega"],
    [T.dNuca + 0.1, T.dNuca + 0.4, "chulo"], [T.dPop - 0.1, T.dPop + 0.1, "pase"], [T.dPase + 0.3, T.dPase + 0.6, "mira"],
    [T.gCara - 0.02, T.gCara + 0.08, "ay"], [T.gCara + 0.3, T.gCara + 0.55, "sigue"], [T.gCoco - 0.02, T.gCoco + 0.08, "ay"],
    [T.gCoco + 0.25, T.gCoco + 0.5, "pasmo"], [T.quieto + 0.2, T.quieto + 0.45, "feliz"], [T.dManos + 0.3, T.dManos + 0.6, "aplaude"],
    [T.dCamara, T.dCamara + 0.3, "camara"]
  ];
  // la mirada sigue a un punto de la pantalla (para Deivi, que mira a la izquierda, se invierte la x)
  function miraA(R, p, q, ojo, w) {
    if (!q || w <= 0) return;
    const o = R.aPantalla(p, R.cabeza(p).a(ojo)), dx = (q.x - o.x) * (p.espejo ? -1 : 1), dy = q.y - o.y, d = Math.hypot(dx, dy) || 1;
    p.cara.mirada = mezcla(p.cara.mirada, P(clamp(dx / d * 1.1, -1, 1), clamp(dy / d * 1.1, -1, 1)), w);
  }
  const OJO_G = P(835, 585), OJO_D = P(860, 495);

  /* ---------- manos ---------- */
  const CERO = { pulgar: 0, indice: 0, medio: 0, anular: 0, menique: 0 };
  const todos = k => ({ pulgar: k, indice: k, medio: k, anular: k, menique: k });
  const M = (x, y, mu, ang, puno, dedos, dobla) => ({ x, y, mu, ang, puno, dedos, dobla });
  function mezM(a, b, k) {
    const d = {}; for (const n in a.dedos) d[n] = lerp(a.dedos[n], b.dedos[n], k);
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), mu: lerp(a.mu, b.mu, k), ang: lerp(a.ang, b.ang, k), puno: lerp(a.puno, b.puno, k), dedos: d, dobla: lerp(a.dobla, b.dobla, k) };
  }
  function ruta(t, lista, ini) {
    let e = ini;
    for (const [t0, t1, d, f] of lista) { if (t <= t0) break; e = mezM(e, d, (f || suave)(fase(t, t0, t1))); }
    return e;
  }
  const comoMano = m => ({ x: m.x, y: m.y, ang: m.ang, mu: m.mu, dobla: m.dobla, puno: m.puno, dedos: m.dedos });
  const R_MG = G.MUNECA_R * G.JK;
  const desdeMuneca = (w, ang, mu) => { const o = rotP({ x: Math.cos(mu) * R_MG, y: Math.sin(mu) * R_MG }, ang); return { x: w.x - o.x, y: w.y - o.y }; };

  /* ---------- piernas: de pie (absolutas, en la hoja) o levantadas (relativas a la cadera) ---------- */
  function evalPie(R, p, lado, d) {
    if (d.a) return d.a;
    const h = R.tronco(p)(R.CADERA[lado]);
    return { x: h.x + d.r.x, y: h.y + d.r.y, ang: d.r.ang };
  }
  function guionPie(R, p, lado, dic, lista, t) {
    let c = evalPie(R, p, lado, dic.de);
    for (const [t0, t1, nom, f] of lista) {
      if (t <= t0) break;
      const o = evalPie(R, p, lado, dic[nom]), k = (f || suave)(fase(t, t0, t1));
      c = { x: lerp(c.x, o.x, k), y: lerp(c.y, o.y, k), ang: lerp(c.ang, o.ang, k) };
    }
    return c;
  }

  /* ---------- puntos de contacto del balón (centro del balón en pantalla y normal hacia fuera) ---------- */
  function apoyo(R, p, qH, nH, hund = 0) {
    const c = R.aPantalla(p, qH), sx = p.espejo ? -1 : 1, d = Math.hypot(nH.x, nH.y) || 1, n = P(nH.x * sx / d, nH.y / d);
    return { x: c.x + n.x * (RB - hund), y: c.y + n.y * (RB - hund), n };
  }
  const LAZO = { g: P(96, 16), d: P(86, 6) };          // empeine, respecto al tobillo (hoja)
  function enPie(R, p, lado, lazo) {
    const q = p.piernas[lado], o = rotP(lazo, q.ang);
    return apoyo(R, p, P(q.tob.x + o.x, q.tob.y + o.y), rotP(P(0, -1), q.ang), 2);
  }
  function enRodilla(R, p, lado, grosor) {
    const cad = R.tronco(p)(R.CADERA[lado]), L = R.A.datos.piezas["pierna_" + lado].largo;
    const m = Recortes.muestras(Recortes.ik(cad, p.piernas[lado].tob, L, L * 0.5, 80, 1, 1.03), 10);
    const a = m[3], b = m[5], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
    let n = P(dy / d, -dx / d); if (n.y > 0) n = P(-n.x, -n.y);
    return apoyo(R, p, P(m[4].x + n.x * grosor, m[4].y + n.y * grosor), n, 2);
  }
  function enCabeza(R, p, pt, hund = 0) { const h = R.cabeza(p); return apoyo(R, p, h.a(pt), P(Math.sin(h.ang), -Math.cos(h.ang)), hund); }
  function enHombro(R, p, pt) { return apoyo(R, p, R.tronco(p)(pt), P(Math.sin(p.torso), -Math.cos(p.torso)), 1); }
  const CAB_D = P(850, 182), HOMBRO_D = P(72, 314), PELO_G = P(838, 196), NARIZ_G = P(892, 712);
  const NUCA_CAB = P(600, 690), NUCA_TR = P(150, 285);
  function enNuca(p) { const a = DV.cabeza(p).a(NUCA_CAB), b = DV.tronco(p)(NUCA_TR); return apoyo(DV, p, mezcla(a, b, 0.5), P(0, -1), 3); }
  function enCara(p) { const h = G.cabeza(p); return apoyo(G, p, h.a(NARIZ_G), P(Math.cos(h.ang + 0.35), Math.sin(h.ang + 0.35)), 3); }

  /* ---------- farol y pared ---------- */
  const LP = P(462, 12), CADENA = 24;                  // punto del brazo de hierro del que cuelga el farol
  function angFarol(t) {
    const brisa = 0.022 * Math.sin(t * 1.3);
    if (t < T.lampara) return brisa;
    const u = t - T.lampara;
    return brisa - (0.05 + 0.27 * Math.exp(-0.75 * u)) * Math.sin(4.6 * u);
  }
  const enFarol = (q, a) => { const r = rotP(q, a); return P(LP.x + r.x, LP.y + r.y); };   // local (cadena hacia abajo) → pantalla
  const PARED_X = 74;
  const PARED_TOQUE = { x: PARED_X + RB, y: 206, n: P(1, 0) };

  /* ---------- geometría del balón (una vez, con las posturas de los instantes de contacto) ---------- */
  let GEO = null;
  function preparaGeo() {
    const d = t => poseD(t, true), gq = t => poseG(t, true);
    // en reposo en la acera, con la puntera de Deivi justo debajo cuando la mete
    const pF = d(T.flick), qF = pF.piernas.cerca, oF = rotP(DV.PUNTA, qF.ang), punta = DV.aPantalla(pF, P(qF.tob.x + oF.x, qF.tob.y + oF.y));
    const reposo = { x: punta.x - 0.42 * RB, y: SUELO - RB, n: P(0, -1) };
    const aF = angFarol(T.lampara), farol = enFarol(P(-11, CADENA + 70 + RB - 3), aF);
    const V1 = [[T.flick, reposo], [T.dPie1, enPie(DV, d(T.dPie1), "cerca", LAZO.d)], [T.dPie2, enPie(DV, d(T.dPie2), "cerca", LAZO.d)],
      [T.dRod, enRodilla(DV, d(T.dRod), "cerca", 50)], [T.dCab, enCabeza(DV, d(T.dCab), CAB_D, 3)], [T.dHom, enHombro(DV, d(T.dHom), HOMBRO_D)],
      [T.dNuca, enNuca(d(T.dNuca))]];
    const V2 = [[T.dPop, enNuca(d(T.dPop))], [T.dPase, enCabeza(DV, d(T.dPase), CAB_D, 3)], [T.gPie, enPie(G, gq(T.gPie), "cerca", LAZO.g)],
      [T.gCara, enCara(gq(T.gCara))], [T.gRod, enRodilla(G, gq(T.gRod), "cerca", 52)], [T.lampara, { x: farol.x, y: farol.y, n: P(0, 1) }],
      [T.pared, PARED_TOQUE], [T.gCoco, enCabeza(G, gq(T.gCoco), PELO_G, 5)],
      ...T.botes.map(tb => [tb, enCabeza(G, gq(tb), PELO_G, 5)]), [T.quieto, enCabeza(G, gq(T.quieto), PELO_G, 5)]];
    // giro del balón: velocidad angular constante en cada tramo (como si rodara con lo que lleva de velocidad)
    const giros = [];
    for (const L of [V1, V2]) for (let i = 0; i < L.length - 1; i++) {
      const [t0, a] = L[i], [t1, b] = L[i + 1];
      giros.push([t0, t1, 0.85 * (b.x - a.x) / (t1 - t0) / RB]);
    }
    GEO = { reposo, V1, V2, giros, toques: [...V1.slice(1, -1), ...V2.slice(0, 2)], nuca: V1[V1.length - 1] };
  }
  // el balón rueda un poco sobre el pelo (y Guillermo lo compensa con la cabeza)
  function rueda(t) {
    const k = tramo(t, T.quieto, T.quieto + 0.6);
    const vaiven = 4.5 * Math.sin(2.3 * (t - T.quieto)) * k * (1 - 0.65 * tramo(t, T.quieto + 1.2, T.quieto + 2.6));
    const susto = 10 * campana(t, T.gCamara + 0.55, T.gCamara + 1.55);
    return vaiven + susto;
  }
  function giro(t) {
    let a = 0.4;
    for (const [t0, t1, w] of GEO.giros) { if (t <= t0) break; a += w * (Math.min(t, t1) - t0); }
    return a + rueda(t) / RB;
  }
  // dónde está el balón (pd/pg: posturas de este instante)
  function balon(t, pd, pg) {
    if (t < T.flick) return GEO.reposo;
    if (t < T.dNuca) return vuelo(GEO.V1, t);
    if (t < T.dPop) return enNuca(pd);
    if (t < T.quieto) return vuelo(GEO.V2, t);
    const c = enCabeza(G, pg, PELO_G, 5), u = rueda(t);
    return P(c.x - c.n.y * u, c.y + c.n.x * u);
  }
  // lo mismo, calculando la postura solo cuando hace falta (en la nuca o en el pelo)
  function balonEn(t) {
    if (t < T.flick) return GEO.reposo;
    if (t < T.dNuca) return vuelo(GEO.V1, t);
    if (t < T.dPop) return enNuca(poseD(t, true));
    if (t < T.quieto) return vuelo(GEO.V2, t);
    return balon(t, null, poseG(t, true));
  }

  /* ---------- Deivi ---------- */
  const TOBY_D = DV.SUELO - DV.TOBILLO_ALTO;
  const PIES_D = {
    de: { a: { x: DV.PELVIS.x - 35, y: TOBY_D, ang: 0 } },
    flick: { a: { x: DV.PELVIS.x + 92, y: TOBY_D + 8, ang: -0.18 } },
    pie: { r: { x: 150, y: 400, ang: 0.22 } },
    medio: { r: { x: 105, y: 470, ang: 0.1 } },
    rodilla: { r: { x: 250, y: 345, ang: 0.42 } }
  };
  const GUION_PIE_D = [
    [T.dVa, T.flick, "flick"], [T.flick + 0.03, T.dPie1, "pie"], [T.dPie1 + 0.03, T.dPie1 + 0.25, "medio"], [T.dPie1 + 0.27, T.dPie2, "pie"],
    [T.dPie2 + 0.03, T.dRod, "rodilla"], [T.dRod + 0.03, T.dRod + 0.4, "de"]
  ];
  const CD0 = { dx: 0, pel: 0, torso: 0.02, cab: 0.06, hom: 0 };
  const CD = o => Object.assign({}, CD0, o);
  const CUERPOS_D = {
    base: CD({ cab: 0.14 }), mira: CD({ torso: 0.05, cab: 0.18 }), flick: CD({ pel: 22, torso: 0.06, cab: 0.2 }),
    pie: CD({ pel: 10, torso: -0.04, cab: 0.14 }), rodilla: CD({ pel: 8, torso: -0.06, cab: 0.06 }),
    agacha: CD({ pel: 28, torso: 0.02, cab: -0.08 }), cabeza: CD({ pel: -4, torso: -0.08, cab: -0.32 }),
    hombro: CD({ pel: 6, torso: 0.12, cab: 0.32, hom: 1 }), nuca: CD({ dx: -40, pel: 36, torso: 0.75, cab: 1.08 }),
    impulso: CD({ dx: -42, pel: 52, torso: 0.8, cab: 1.12 }), nuca2: CD({ dx: -38, pel: 24, torso: 0.7, cab: 1.02 }),
    erguido: CD({ pel: 2, torso: -0.06, cab: -0.16 }), cabezazo: CD({ pel: -6, torso: -0.1, cab: -0.3 }), remate: CD({ torso: 0.05, cab: 0.12 }),
    erguido2: CD({ torso: 0.0, cab: 0.04 }), ay: CD({ torso: -0.07, cab: -0.14, hom: 0.8 }), pasmo: CD({ torso: -0.05, cab: -0.1 }),
    aplaude: CD({ torso: 0.03, cab: 0.03 })
  };
  const GUION_CUERPO_D = [
    [0.5, 0.95, "mira"], [0.85, T.flick, "flick"], [T.flick + 0.05, T.dPie1, "pie"], [T.dPie2 + 0.05, T.dRod, "rodilla"],
    [T.dRod + 0.08, T.dCab - 0.14, "agacha"], [T.dCab - 0.14, T.dCab, "cabeza", salida], [T.dCab + 0.12, T.dHom, "hombro"],
    [T.dHom + 0.05, T.dNuca, "nuca"], [T.dPop - 0.24, T.dPop - 0.06, "impulso"], [T.dPop - 0.06, T.dPop + 0.04, "nuca2", salida],
    [T.dPop + 0.07, T.dPop + 0.45, "erguido"], [T.dPase - 0.35, T.dPase, "cabezazo"],
    [T.dPase + 0.02, T.dPase + 0.35, "remate"], [T.dPase + 0.4, T.dPase + 0.9, "erguido2"], [T.gCara - 0.02, T.gCara + 0.12, "ay"],
    [T.gCara + 0.35, T.gCara + 0.7, "erguido2"], [T.gCoco - 0.02, T.gCoco + 0.12, "ay"], [T.gCoco + 0.25, T.gCoco + 0.6, "pasmo"],
    [T.dManos, T.dManos + 0.4, "aplaude"]
  ];
  function poseD(t, geo = false) {
    const b = guion(GUION_CUERPO_D, CUERPOS_D, "base", t);
    const respira = Math.sin(t * 2.0 + 1.1);
    // en la nuca: se balancea un poco para mantenerlo
    const sujeta = tramo(t, T.dNuca, T.dNuca + 0.2) * (1 - tramo(t, T.dPop - 0.2, T.dPop));
    const vaiven = sujeta * Math.sin((t - T.dNuca) * 3.1);
    // pequeño cabeceo a cada toque y asentimiento al aplaudir
    let toque = 0; for (const tc of [T.dPie1, T.dPie2, T.dRod, T.dHom]) toque += campana(t, tc - 0.05, tc + 0.25);
    const asiente = tramo(t, T.dManos + 0.4, T.dManos + 0.7) * Math.sin((t - T.dManos) * 6.3) * 0.04;
    const p = { x: XD, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: DV.PELVIS.x + b.dx, y: DV.PELVIS.y + b.pel + respira * 1.1 + 3 * toque },
      torso: b.torso + 0.02 * vaiven, torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.02 * b.hom },
      piernas: {}, cabeza: { ang: b.cab + 0.04 * toque + 0.025 * vaiven + asiente, dx: 0, dy: -8 * b.hom, esc: { x: 1, y: 1 } } };
    const pie = guionPie(DV, p, "cerca", PIES_D, GUION_PIE_D, t);
    p.piernas.cerca = { tob: P(pie.x, pie.y), ang: pie.ang };
    p.piernas.lejos = { tob: P(DV.PELVIS.x + 75, TOBY_D - 10), ang: 0 };
    const e = guion(GUION_CARA_D, CARAS_D, "inicio", t);
    p.cara = cara(e, parpadeo(t, [0.4, 3.0, 5.25, 6.75, 8.3, 9.85, 11.3, 12.95]));
    // manos: en los bolsillos hasta aplaudir
    const Tr = DV.tronco(p), bL = Tr(DV.BOLSILLO_L), bC = Tr(DV.BOLSILLO_C);
    const enBL = M(bL.x, bL.y, -1.75, 0, 0, CERO, 1), enBC = M(bC.x, bC.y, -1.75, 0, 0, CERO, -1);
    const palL = Tr(P(372, 438)), palC = Tr(P(212, 448)), junta = Tr(P(294, 436));
    const L = ruta(t, [[T.dManos, T.dManos + 0.4, M(palL.x, palL.y, 1.45, 0, 1, todos(1), 1)]], enBL);
    const C = ruta(t, [[T.dManos + 0.05, T.dManos + 0.45, M(palC.x, palC.y, 1.65, 0, 1, todos(1), -1)]], enBC);
    for (const tc of T.aplausos) {
      const k = campana(t, tc - 0.22, tc + 0.22), kk = Math.pow(k, 0.7);
      L.x = lerp(L.x, junta.x + 17, kk); L.y = lerp(L.y, junta.y, kk);
      C.x = lerp(C.x, junta.x - 17, kk); C.y = lerp(C.y, junta.y + 2, kk);
    }
    p.manoLejos = comoMano(L); p.manoCerca = comoMano(C);
    if (!geo && GEO) {
      const q = balonEn(t);
      const w = tramo(t, 0.45, 0.8) * (1 - tramo(t, T.dNuca + 0.05, T.dNuca + 0.3)) + tramo(t, T.dPop - 0.1, T.dPop + 0.05) * (1 - tramo(t, T.dManos + 0.3, T.dManos + 0.6))
        + 0.6 * tramo(t, T.dManos + 0.6, T.dManos + 0.9) * (1 - tramo(t, T.dCamara - 0.05, T.dCamara + 0.25));
      miraA(DV, p, q, OJO_D, clamp(w));
    }
    return p;
  }

  /* ---------- Guillermo ---------- */
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const PIES_G = {
    de: { a: { x: G.PELVIS.x - 65, y: TOB_G, ang: 0 } },
    pie: { r: { x: 195, y: 345, ang: 0.28 } },
    rodilla: { r: { x: 262, y: 312, ang: 0.5 } }
  };
  const GUION_PIE_G = [[T.gPie - 0.3, T.gPie, "pie"], [T.gCara + 0.05, T.gRod, "rodilla"], [T.gRod + 0.06, T.gRod + 0.42, "de"]];
  const BOLS_G_C = desdeMuneca(P(131, 652), 0, -1.75), BOLS_G_L = desdeMuneca(P(372, 648), 0, -1.75);
  const CG0 = { dx: 0, pel: 0, torso: 0.03, cab: 0, hom: 0 };
  const CG = o => Object.assign({}, CG0, o);
  const CUERPOS_G = {
    base: CG({}), mira: CG({ torso: 0.02, cab: 0.02 }), asombro: CG({ torso: -0.04, cab: -0.06, pel: -4 }),
    chulo: CG({ torso: -0.06, cab: -0.1, hom: 0.6 }), llama: CG({ torso: 0.04, cab: 0.0 }), listo: CG({ pel: 14, torso: 0.1, cab: 0.1 }),
    patada: CG({ pel: 6, torso: -0.06, cab: 0.14 }), cara: CG({ dx: -6, pel: 8, torso: -0.2, cab: -0.42 }), rodilla: CG({ pel: 4, torso: -0.05, cab: 0.04 }),
    sigue: CG({ pel: 4, torso: -0.06, cab: -0.16 }), agacha: CG({ pel: 22, torso: 0.02, cab: -0.06, hom: 0.4 }), coco: CG({ pel: 26, torso: 0.06, cab: 0.1, hom: 0.8 }),
    quieto: CG({ pel: 16, torso: 0.0, cab: -0.03, hom: 0.2 })
  };
  const GUION_CUERPO_G = [
    [0.9, 1.3, "mira"], [T.dNuca, T.dNuca + 0.2, "asombro"], [T.gChulo, T.gChulo + 0.3, "chulo"], [T.gLlama0, T.gLlama0 + 0.3, "llama"],
    [T.gListo, T.gListo + 0.4, "listo"], [T.gPie - 0.3, T.gPie, "patada"], [T.gCara, T.gCara + 0.07, "cara", salida],
    [T.gCara + 0.18, T.gRod, "rodilla"], [T.gRod + 0.05, T.lampara - 0.05, "sigue"], [T.lampara + 0.02, T.lampara + 0.22, "agacha"],
    [T.pared - 0.05, T.gCoco - 0.12, "sigue"], [T.gCoco, T.gCoco + 0.06, "coco", salida], [T.gCoco + 0.2, T.quieto, "quieto"]
  ];
  function poseG(t, geo = false) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "base", t);
    const respira = Math.sin(t * 2.2);
    const congela = tramo(t, T.quieto - 0.1, T.quieto + 0.2);
    const tiembla = congela * ruido(t * 22) * 1.2;
    // los hombros se recolocan: dos subidas
    const hombros = campana(t, T.gChulo + 0.05, T.gChulo + 0.3) + campana(t, T.gChulo + 0.25, T.gChulo + 0.5);
    // cada bote en la cabeza le hunde un poco
    let bote = 0; for (const tb of [T.gCoco, ...T.botes]) { const u = t - tb; if (u > 0) bote += (tb === T.gCoco ? 1 : 0.35) * Math.exp(-u * 9) * Math.sin(Math.min(u * 22, Math.PI)); }
    const comp = 0.006 * rueda(t - 0.12);
    const p = {
      x: XG + b.dx, suelo: SUELO, s: S, tirasLimpias: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 * (1 - congela) + 6 * bote }, torso: b.torso + 0.004 * tiembla,
      torsoEsc: { x: 1, y: 1 + respira * 0.004 * (1 - congela) + 0.02 * b.hom + 0.02 * hombros },
      piernas: {}, cabeza: { ang: b.cab + 0.006 * tiembla + comp, dx: 0, dy: -10 * b.hom - 8 * hombros + 5 * bote, esc: { x: 1 + 0.03 * bote, y: 1 - 0.04 * bote } },
      cara: null
    };
    const pie = guionPie(G, p, "cerca", PIES_G, GUION_PIE_G, t);
    p.piernas.cerca = { tob: P(pie.x, pie.y), ang: pie.ang };
    p.piernas.lejos = { tob: P(G.PELVIS.x + 62, TOB_G - 12), ang: 0 };
    const e = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    p.cara = cara(e, congela > 0.5 ? 0 : parpadeo(t, [0.7, 2.6, 4.4, 6.6, 8.75]));
    p.sudor = 0.8 * tramo(t, T.quieto + 0.6, T.quieto + 1.4);
    // la marca roja del balonazo en la cara (se queda)
    const marca = tramo(t, T.gCara, T.gCara + 0.12, salida) * (1 - 0.3 * tramo(t, T.gCara + 0.5, T.gCara + 2.5));
    if (marca > 0.01) p.capaCabeza = g => huella(g, marca);
    // manos
    const Tr = G.tronco(p), bC = Tr(BOLS_G_C), bL = Tr(BOLS_G_L);
    const enBL = M(bL.x, bL.y, -1.75, 0, 0, CERO, -1), enBC = M(bC.x, bC.y, -1.75, 0, 0, CERO, -1);
    const llama = Tr(P(560, 540)), listoL = Tr(P(500, 585)), listoC = Tr(P(-10, 600));
    const sustoL = Tr(P(600, 470)), sustoC = Tr(P(-110, 470)), medioL = Tr(P(530, 570)), medioC = Tr(P(-50, 560));
    const brazoL = Tr(P(640, 430)), brazoC = Tr(P(-190, 425));
    const L = ruta(t, [
      [T.gLlama0, T.gLlama0 + 0.3, M(llama.x, llama.y, Math.PI - 0.15, 0, 1, todos(1), -1)],
      [T.gListo, T.gListo + 0.35, M(listoL.x, listoL.y, 2.4, 0, 1, todos(0.6), -1)],
      [T.gCara, T.gCara + 0.1, M(sustoL.x, sustoL.y, 2.7, 0, 1, todos(1), -1), salida],
      [T.gCara + 0.3, T.gCara + 0.65, M(medioL.x, medioL.y, 2.5, 0, 1, todos(0.7), -1)],
      [T.gCoco, T.gCoco + 0.1, M(sustoL.x, sustoL.y, 2.7, 0, 1, todos(1), -1), salida],
      [T.gCoco + 0.2, T.quieto, M(brazoL.x, brazoL.y, 2.95, 0, 1, todos(1), -1)]
    ], enBL);
    const C = ruta(t, [
      [T.gListo + 0.05, T.gListo + 0.4, M(listoC.x, listoC.y, 0.8, 0, 1, todos(0.6), -1)],
      [T.gCara, T.gCara + 0.1, M(sustoC.x, sustoC.y, 0.5, 0, 1, todos(1), -1), salida],
      [T.gCara + 0.3, T.gCara + 0.65, M(medioC.x, medioC.y, 0.7, 0, 1, todos(0.7), -1)],
      [T.gCoco, T.gCoco + 0.1, M(sustoC.x, sustoC.y, 0.5, 0, 1, todos(1), -1), salida],
      [T.gCoco + 0.2, T.quieto, M(brazoC.x, brazoC.y, 0.2, 0, 1, todos(1), -1)]
    ], enBC);
    // «pásamela»: los dedos se doblan dos veces
    for (const tb of T.gLlama) { const k = campana(t, tb - 0.12, tb + 0.12); for (const n in L.dedos) L.dedos[n] = lerp(L.dedos[n], 0.2, k); L.mu += 0.25 * k; }
    // brazos abiertos: tiemblan y compensan el vaivén del balón
    if (congela > 0) { const r = rueda(t - 0.08); L.y += 1.2 * tiembla - 0.5 * r; C.y -= 1.2 * tiembla - 0.5 * r; L.x += 0.6 * tiembla; }
    p.manoLejos = comoMano(L); p.manoCerca = comoMano(C);
    p.ikContinuo = false;
    if (!geo && GEO) {
      const q = balonEn(t);
      const w = tramo(t, 0.8, 1.1) * (1 - tramo(t, T.dNuca + 0.1, T.dNuca + 0.3)) + tramo(t, T.dPop - 0.1, T.dPop + 0.05) * (1 - tramo(t, T.gCara - 0.04, T.gCara))
        + tramo(t, T.gRod - 0.06, T.gRod + 0.04) * (1 - tramo(t, T.gCamara - 0.05, T.gCamara + 0.2))
        + tramo(t, T.gCamara + 0.85, T.gCamara + 0.95) * (1 - tramo(t, T.gCamara + 1.55, T.gCamara + 1.8));
      miraA(G, p, q, OJO_G, clamp(w));
    }
    return p;
  }
  // huella del balón en la cara de Guillermo (coordenadas del retrato)
  function huella(g, k) {
    g.save(); g.globalAlpha = k;
    g.fillStyle = "rgba(232,62,52,0.42)"; g.beginPath(); g.arc(852, 702, 74, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(180,30,30,0.45)"; g.lineWidth = 5; g.lineJoin = "round";
    g.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 1.2566; g.lineTo(852 + Math.cos(a) * 24, 702 + Math.sin(a) * 24); } g.closePath(); g.stroke();
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 1.2566; g.beginPath(); g.moveTo(852 + Math.cos(a) * 24, 702 + Math.sin(a) * 24); g.lineTo(852 + Math.cos(a) * 52, 702 + Math.sin(a) * 52); g.stroke(); }
    g.restore();
  }

  /* ---------- el balón ---------- */
  let SPR = null;
  function creaBalon() {
    const K = 3, r = RB * K, n = Math.ceil(r * 2 + 10);
    const mk = () => { const c = document.createElement("canvas"); c.width = c.height = n; const g = c.getContext("2d"); g.translate(n / 2, n / 2); return [c, g]; };
    const [c1, g] = mk();
    g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fillStyle = "#fbfaf3"; g.fill();
    g.save(); g.clip();
    const pent = (cx, cy, rr, rot) => { g.beginPath(); for (let i = 0; i < 5; i++) { const a = rot + i * 2 * Math.PI / 5; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.closePath(); };
    g.lineCap = "round"; g.strokeStyle = "#4b4652"; g.lineWidth = 1.3 * K; g.fillStyle = "#17151b";
    pent(0, 0, r * 0.33, -Math.PI / 2); g.fill();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + i * 2 * Math.PI / 5, b = a + Math.PI / 5;
      const v = P(Math.cos(a) * r * 0.33, Math.sin(a) * r * 0.33), m = P(Math.cos(a) * r * 0.64, Math.sin(a) * r * 0.64);
      g.beginPath(); g.moveTo(v.x, v.y); g.lineTo(m.x, m.y);
      for (const s of [-1, 1]) { const c = a + s * 0.36; g.moveTo(m.x, m.y); g.lineTo(Math.cos(c) * r * 0.86, Math.sin(c) * r * 0.86); }
      g.stroke();
      pent(Math.cos(b) * r * 1.02, Math.sin(b) * r * 1.02, r * 0.33, b + Math.PI); g.fill();
    }
    g.restore();
    // sombra y brillo (no giran con el balón)
    const [c2, h] = mk();
    const sm = h.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, -r * 0.1, -r * 0.1, r * 1.15);
    sm.addColorStop(0, "rgba(255,250,235,0.35)"); sm.addColorStop(0.45, "rgba(255,240,220,0)"); sm.addColorStop(0.8, "rgba(60,40,70,0.22)"); sm.addColorStop(1, "rgba(40,25,50,0.5)");
    h.fillStyle = sm; h.beginPath(); h.arc(0, 0, r, 0, Math.PI * 2); h.fill();
    h.fillStyle = "rgba(255,255,255,0.85)"; h.beginPath(); h.ellipse(-r * 0.42, -r * 0.45, r * 0.18, r * 0.11, -0.7, 0, Math.PI * 2); h.fill();
    h.lineWidth = 2 * K; h.strokeStyle = TINTA; h.beginPath(); h.arc(0, 0, r - K, 0, Math.PI * 2); h.stroke();
    SPR = { c1, c2, n, K };
  }
  // aplastamiento suave en cada contacto (campana de Gauss alrededor del instante del toque)
  function aplasta(t) {
    let best = 0, n = P(0, -1);
    const lista = [...GEO.V1.slice(1), ...GEO.V2];
    for (const [tc, c] of lista) { const k = Math.exp(-(((t - tc) / 0.04) ** 2)); if (k > best) { best = k; n = c.n; } }
    return { k: 0.16 * best, n };
  }
  function dibujaBalon(g, t, q) {
    const { c1, c2, n, K } = SPR, a = aplasta(t), an = Math.atan2(a.n.y, a.n.x);
    g.save(); g.translate(q.x, q.y);
    g.rotate(an); g.scale(1 - a.k, 1 + 0.6 * a.k); g.rotate(-an);
    g.save(); g.rotate(giro(t)); g.drawImage(c1, -n / 2 / K, -n / 2 / K, n / K, n / K); g.restore();
    g.drawImage(c2, -n / 2 / K, -n / 2 / K, n / K, n / K);
    g.restore();
  }
  function sombraBalon(g, q) {
    const h = clamp((SUELO - RB - q.y) / 420);
    g.save(); g.fillStyle = `rgba(30,18,10,${0.32 * (1 - 0.75 * h)})`;
    g.beginPath(); g.ellipse(q.x + 4, SUELO + 2, RB * (1.15 - 0.4 * h), 3.2 * (1 - 0.4 * h), 0, 0, Math.PI * 2); g.fill(); g.restore();
  }

  /* ---------- farol ---------- */
  function farol(g, t) {
    const a = angFarol(t), u = t - T.lampara;
    const parpa = u > 0 ? clamp(1 - 0.55 * Math.exp(-u * 3.5) * (0.5 + 0.5 * ruido(u * 16))) : 1;
    const c = enFarol(P(0, CADENA), a);
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    // halo de luz
    const ctr = enFarol(P(0, CADENA + 36), a);
    const halo = g.createRadialGradient(ctr.x, ctr.y, 4, ctr.x, ctr.y, 95);
    halo.addColorStop(0, `rgba(255,214,130,${0.42 * parpa})`); halo.addColorStop(1, "rgba(255,214,130,0)");
    g.fillStyle = halo; g.beginPath(); g.arc(ctr.x, ctr.y, 95, 0, Math.PI * 2); g.fill();
    // cadena
    g.strokeStyle = "#1c1814"; g.lineWidth = 1.6;
    for (let i = 0; i < 4; i++) { const q0 = enFarol(P(0, i * 6 + 1), a); g.beginPath(); g.ellipse(q0.x, q0.y + 2.5, 1.8, 3.2, a, 0, Math.PI * 2); g.stroke(); }
    g.translate(c.x, c.y); g.rotate(a);
    // sombrerete
    g.fillStyle = "#24201c"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.arc(0, -2, 4, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-6, 3); g.lineTo(6, 3); g.lineTo(22, 15); g.lineTo(-22, 15); g.closePath(); g.fill(); g.stroke();
    g.fillRect(-19, 15, 38, 4); g.strokeRect(-19, 15, 38, 4);
    // cristales con la llama
    const gl = g.createLinearGradient(0, 19, 0, 64);
    gl.addColorStop(0, `rgba(255,236,170,${0.75 + 0.25 * parpa})`); gl.addColorStop(1, `rgba(255,178,80,${0.7 + 0.3 * parpa})`);
    g.fillStyle = gl; g.beginPath(); g.moveTo(-17, 19); g.lineTo(17, 19); g.lineTo(12, 62); g.lineTo(-12, 62); g.closePath(); g.fill();
    g.fillStyle = `rgba(255,255,240,${0.8 * parpa})`; g.beginPath(); g.ellipse(0, 40, 4.5, 8, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(-17, 19); g.lineTo(17, 19); g.lineTo(12, 62); g.lineTo(-12, 62); g.closePath(); g.stroke();
    g.lineWidth = 1.6; g.beginPath(); g.moveTo(-5.5, 19); g.lineTo(-4, 62); g.moveTo(5.5, 19); g.lineTo(4, 62); g.stroke();
    // grieta en el cristal tras el balonazo (se queda)
    const gr = tramo(t, T.lampara, T.lampara + 0.1);
    if (gr > 0) {
      g.strokeStyle = `rgba(255,255,255,${0.9 * gr})`; g.lineWidth = 1.3;
      g.beginPath(); g.moveTo(-11, 58); g.lineTo(-7, 49); g.lineTo(-11, 42); g.moveTo(-7, 49); g.lineTo(-1, 45); g.lineTo(2, 38); g.moveTo(-1, 45); g.lineTo(3, 52); g.stroke();
    }
    // base
    g.fillStyle = "#24201c"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.moveTo(-14, 62); g.lineTo(14, 62); g.lineTo(8, 69); g.lineTo(-8, 69); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.arc(0, 72, 3, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrella(g, x, y, r, puntas, rot, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function impacto(g, t, t0, q, tam) {
    const k = fase(t, t0, t0 + 0.3); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    estrella(g, q.x, q.y, tam * (0.5 + 0.9 * salida(k)), 10, 0.3, 0.42); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    estrella(g, q.x, q.y, tam * (0.3 + 0.55 * salida(k)), 10, 0.55, 0.5); g.fillStyle = "#ffffff"; g.fill();
    g.strokeStyle = "#ffffff"; g.lineWidth = 2.5; g.lineCap = "round";
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2, r0 = tam * (0.9 + 0.9 * k), r1 = r0 + tam * 0.45; g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * r1, q.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // toques limpios de Deivi: dos arquitos blancos a los lados del balón
  function toque(g, t, t0, c) {
    const k = fase(t, t0, t0 + 0.26); if (k <= 0 || k >= 1) return;
    const an = Math.atan2(c.n.y, c.n.x) + Math.PI, r = RB + 5 + 9 * salida(k);
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.9 * (1 - k)})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (const s of [-1, 1]) { g.beginPath(); g.arc(c.x, c.y, r, an + s * 0.55 - 0.32, an + s * 0.55 + 0.32); g.stroke(); }
    g.restore();
  }
  // polvo y migas de piedra al dar en la pared (la marca se queda)
  function marcaPared(g, t) {
    const k = tramo(t, T.pared, T.pared + 0.08, salida); if (k <= 0) return;
    const y = PARED_TOQUE.y;
    g.save(); g.fillStyle = `rgba(70,52,40,${0.55 * k})`; g.beginPath(); g.ellipse(PARED_X - 6, y, 7, RB * 0.95, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = `rgba(40,28,22,${0.6 * k})`; g.lineWidth = 1.2; g.beginPath(); g.moveTo(PARED_X - 6, y - 10); g.lineTo(PARED_X - 9, y - 22); g.lineTo(PARED_X - 6, y - 30); g.moveTo(PARED_X - 5, y + 9); g.lineTo(PARED_X - 10, y + 19); g.stroke();
    g.restore();
  }
  function polvoPared(g, t) {
    const u = t - T.pared; if (u <= 0 || u > 1.1) return;
    g.save();
    for (let i = 0; i < 7; i++) {
      const k = clamp(u / (0.5 + 0.3 * hash(i))); if (k >= 1) continue;
      const a = (hash(i + 7) - 0.5) * 2.2, d = 8 + 26 * salida(k) * (0.6 + 0.6 * hash(i + 3));
      g.fillStyle = `rgba(214,196,170,${0.55 * (1 - k)})`; g.beginPath(); g.arc(PARED_X + 4 + Math.cos(a) * d, PARED_TOQUE.y + Math.sin(a) * d, 4 + 7 * k, 0, Math.PI * 2); g.fill();
    }
    for (let i = 0; i < 6; i++) {
      const vx = 20 + 50 * hash(i + 20), vy = -40 + 60 * hash(i + 30), yy = PARED_TOQUE.y + vy * u + 0.5 * 1200 * u * u;
      if (yy > SUELO - 2) continue;
      g.fillStyle = "#8f7b66"; g.strokeStyle = TINTA; g.lineWidth = 0.8;
      g.beginPath(); g.rect(PARED_X + 2 + vx * u, yy, 3 + 2 * hash(i), 3); g.fill(); g.stroke();
    }
    g.restore();
  }
  // destellos del cristal del farol
  function chispas(g, t, q) {
    const u = t - T.lampara; if (u <= 0 || u > 0.5) return;
    g.save();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (hash(i + 40) - 0.5) * 2.6, v = 90 + 70 * hash(i + 50);
      const x = q.x + Math.cos(a) * v * u, y = q.y - RB + Math.sin(a) * v * u + 0.5 * 900 * u * u, k = u / 0.5;
      g.fillStyle = `rgba(255,252,220,${1 - k})`; estrella(g, x, y, 4 * (1 - k) + 1, 4, 0.4, 0.35); g.fill();
    }
    g.restore();
  }
  // estrellitas girando alrededor de la cabeza de Guillermo después del coscorrón
  function estrellitas(g, t, pg) {
    const k = campana(t, T.gCoco + 0.05, T.gCoco + 1.1); if (k <= 0) return;
    const c = G.aPantalla(pg, G.cabeza(pg).a(P(800, 420)));
    g.save();
    for (let i = 0; i < 3; i++) {
      const a = t * 7 + i * 2.094, x = c.x + Math.cos(a) * 46, y = c.y + Math.sin(a) * 11;
      g.globalAlpha = k; g.fillStyle = "#ffe14d"; g.strokeStyle = TINTA; g.lineWidth = 1.4;
      estrella(g, x, y, 6.5, 5, a, 0.45); g.fill(); g.stroke();
    }
    g.restore();
  }
  function lineasPalmas(g, t, pd) {
    for (const tc of T.aplausos) {
      const k = fase(t, tc - 0.02, tc + 0.24); if (k <= 0 || k >= 1) continue;
      const q = DV.aPantalla(pd, DV.tronco(pd)(P(300, 410)));
      g.save(); g.strokeStyle = `rgba(255,255,255,${1 - k})`; g.lineWidth = 2; g.lineCap = "round";
      for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * 0.6, r0 = 9 + 8 * k; g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * (r0 + 7), q.y + Math.sin(a) * (r0 + 7)); g.stroke(); }
      g.restore();
    }
  }
  // rayitas de velocidad detrás del balón cuando va rápido
  function estela(g, t) {
    if (t < T.flick || (t > T.dNuca && t < T.dPop) || t > T.quieto) return;
    const qs = [0, 1, 2, 3, 4].map(i => balonEn(t - i * 0.022));
    for (let i = 4; i >= 1; i--) {
      const q = qs[i], q2 = qs[i - 1], v = Math.hypot(q2.x - q.x, q2.y - q.y) / 0.022;
      const a = clamp((v - 600) / 500); if (a <= 0) continue;
      g.save(); g.globalAlpha = 0.08 * (5 - i) * a; g.fillStyle = "#ffffff"; g.beginPath(); g.arc(q.x, q.y, RB * (1 - i * 0.12), 0, Math.PI * 2); g.fill(); g.restore();
    }
  }

  /* ---------- decorado: a la puerta del bar, al atardecer ---------- */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 100; const g = c.getContext("2d");
    g.translate(40, 50);
    // fachada ocre con luz de tarde
    const fa = g.createLinearGradient(0, -50, W, 430);
    fa.addColorStop(0, "#c9813f"); fa.addColorStop(0.55, "#e2a35a"); fa.addColorStop(1, "#efb96a");
    g.fillStyle = fa; g.fillRect(-40, -50, W + 80, 480);
    // manchas del enlucido
    for (let i = 0; i < 70; i++) {
      const x = hash(i) * (W + 60) - 30, y = hash(i + 100) * 420 - 40, r = 10 + 34 * hash(i + 200);
      g.fillStyle = i % 3 ? "rgba(255,226,170,0.09)" : "rgba(140,70,30,0.08)"; g.beginPath(); g.ellipse(x, y, r * 1.6, r, hash(i + 300) * 3, 0, Math.PI * 2); g.fill();
    }
    // rayos de sol oblicuos
    g.save(); g.globalAlpha = 0.13; g.fillStyle = "#fff1c4";
    for (const [x0, an] of [[300, 90], [560, 60], [760, 120]]) { g.beginPath(); g.moveTo(x0, -50); g.lineTo(x0 + an, -50); g.lineTo(x0 + an - 260, 430); g.lineTo(x0 - 260, 430); g.closePath(); g.fill(); }
    g.restore();
    // cornisa arriba
    g.fillStyle = "#b8763a"; g.fillRect(-40, -50, W + 80, 26); g.fillStyle = "#f3cf8e"; g.fillRect(-40, -24, W + 80, 5);
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(-40, -19); g.lineTo(W + 40, -19); g.stroke();
    // zócalo de azulejos
    const ZY = 430;
    g.fillStyle = "#f4efe2"; g.fillRect(-40, ZY, W + 80, SUELO - ZY);
    const TZ = 26;
    for (let y = ZY + 4, fil = 0; y < SUELO - 4; y += TZ, fil++) for (let x = -40, col = 0; x < W + 40; x += TZ, col++) {
      const cx = x + TZ / 2, cy = y + TZ / 2;
      g.fillStyle = (fil + col) % 2 ? "#2f5fa8" : "#1f8a8a";
      g.beginPath(); g.moveTo(cx, cy - 9); g.lineTo(cx + 9, cy); g.lineTo(cx, cy + 9); g.lineTo(cx - 9, cy); g.closePath(); g.fill();
      g.fillStyle = "#f2c14e"; g.beginPath(); g.arc(cx, cy, 2.6, 0, Math.PI * 2); g.fill();
      g.fillStyle = "rgba(47,95,168,0.55)"; for (const [dx, dy] of [[0, 0], [TZ, 0], [0, TZ], [TZ, TZ]]) { g.beginPath(); g.arc(x + dx, y + dy, 3.4, 0, Math.PI * 2); g.fill(); }
    }
    g.strokeStyle = "rgba(60,70,90,0.25)"; g.lineWidth = 1;
    for (let y = ZY + 4; y < SUELO; y += TZ) { g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); }
    for (let x = -40; x < W + 40; x += TZ) { g.beginPath(); g.moveTo(x, ZY + 4); g.lineTo(x, SUELO); g.stroke(); }
    g.fillStyle = "#7a4a2a"; g.fillRect(-40, ZY - 6, W + 80, 10); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(-40, ZY - 6, W + 80, 10);
    // ventana del bar, iluminada por dentro, con toldo de rayas
    const VX0 = 505, VX1 = 655, VY0 = 238, VY1 = 410;
    const dentro = g.createLinearGradient(0, VY0, 0, VY1); dentro.addColorStop(0, "#ffd27a"); dentro.addColorStop(1, "#e3892f");
    g.fillStyle = dentro; g.fillRect(VX0, VY0, VX1 - VX0, VY1 - VY0);
    g.fillStyle = "rgba(90,40,10,0.55)";                                         // estantes y botellas a contraluz
    for (const ys of [300, 360]) { g.fillRect(VX0, ys, VX1 - VX0, 4);
      for (let x = VX0 + 10, i = 0; x < VX1 - 8; x += 13, i++) { const h2 = 24 + 10 * hash(i + ys); g.beginPath(); g.rect(x, ys - h2 + 8, 8, h2 - 8); g.rect(x + 2.5, ys - h2, 3, 9); g.fill(); } }
    g.fillStyle = "rgba(255,250,220,0.35)"; g.beginPath(); g.moveTo(VX0 + 12, VY0); g.lineTo(VX0 + 40, VY0); g.lineTo(VX0 + 10, VY1); g.lineTo(VX0 - 18 + 12, VY1); g.closePath(); g.fill();
    g.strokeStyle = "#1f4a35"; g.lineWidth = 7; g.strokeRect(VX0, VY0, VX1 - VX0, VY1 - VY0);
    g.lineWidth = 4; g.beginPath(); g.moveTo((VX0 + VX1) / 2, VY0); g.lineTo((VX0 + VX1) / 2, VY1); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 1.6; g.strokeRect(VX0 - 3.5, VY0 - 3.5, VX1 - VX0 + 7, VY1 - VY0 + 7);
    g.fillStyle = "#d9c3a0"; g.fillRect(VX0 - 12, VY1 + 3, VX1 - VX0 + 24, 8); g.strokeRect(VX0 - 12, VY1 + 3, VX1 - VX0 + 24, 8);
    // geranios en el alféizar
    for (let i = 0; i < 3; i++) {
      const mx = VX0 + 22 + i * 52;
      g.fillStyle = "#b5532f"; g.beginPath(); g.moveTo(mx - 14, VY1 + 3); g.lineTo(mx + 14, VY1 + 3); g.lineTo(mx + 11, VY1 - 15); g.lineTo(mx - 11, VY1 - 15); g.closePath(); g.fill(); g.stroke();
      for (let j = 0; j < 7; j++) { const lx = mx + (hash(i * 9 + j) - 0.5) * 30, ly = VY1 - 20 - hash(i * 7 + j + 1) * 16;
        g.fillStyle = j % 3 ? "#3f8f3a" : "#e2283b"; g.beginPath(); g.arc(lx, ly, j % 3 ? 6 : 4.5, 0, Math.PI * 2); g.fill(); g.lineWidth = 1; g.stroke(); }
    }
    // toldo
    const AX0 = VX0 - 22, AX1 = VX1 + 22, AY0 = 190, AY1 = 226;
    for (let i = 0; i < 9; i++) {
      const x0 = AX0 + (AX1 - AX0) * i / 9, x1 = AX0 + (AX1 - AX0) * (i + 1) / 9;
      g.fillStyle = i % 2 ? "#f6efe0" : "#c8323c";
      g.beginPath(); g.moveTo(x0 + 6, AY0); g.lineTo(x1 + 6, AY0); g.lineTo(x1, AY1); g.quadraticCurveTo((x0 + x1) / 2, AY1 + 10, x0, AY1); g.closePath(); g.fill();
    }
    g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.moveTo(AX0 + 6, AY0); g.lineTo(AX1 + 6, AY0); g.lineTo(AX1, AY1);
    for (let i = 9; i > 0; i--) { const x0 = AX0 + (AX1 - AX0) * (i - 1) / 9, x1 = AX0 + (AX1 - AX0) * i / 9; g.quadraticCurveTo((x0 + x1) / 2, AY1 + 10, x0, AY1); }
    g.closePath(); g.stroke();
    g.fillStyle = "rgba(90,30,10,0.18)"; g.fillRect(VX0 - 12, AY1 + 6, VX1 - VX0 + 24, 14);
    // puerta verde (derecha)
    const PX0 = 880, PX1 = 1005, PY0 = 182;
    g.fillStyle = "#6f3f22"; g.fillRect(PX0 - 10, PY0 - 10, PX1 - PX0 + 20, SUELO - PY0 + 10); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(PX0 - 10, PY0 - 10, PX1 - PX0 + 20, SUELO - PY0 + 10);
    g.fillStyle = "#2b6a4b"; g.fillRect(PX0, PY0, PX1 - PX0, SUELO - PY0); g.strokeRect(PX0, PY0, PX1 - PX0, SUELO - PY0);
    const hojaP = (x0, x1) => {
      g.fillStyle = "#ffcf78"; g.fillRect(x0 + 9, PY0 + 12, x1 - x0 - 18, 120); g.strokeRect(x0 + 9, PY0 + 12, x1 - x0 - 18, 120);
      g.strokeStyle = "rgba(43,106,75,0.9)"; g.lineWidth = 3; g.beginPath(); g.moveTo((x0 + x1) / 2, PY0 + 12); g.lineTo((x0 + x1) / 2, PY0 + 132); g.moveTo(x0 + 9, PY0 + 72); g.lineTo(x1 - 9, PY0 + 72); g.stroke();
      g.strokeStyle = TINTA; g.lineWidth = 1.6; g.strokeRect(x0 + 12, PY0 + 150, x1 - x0 - 24, 90); g.strokeRect(x0 + 12, PY0 + 255, x1 - x0 - 24, SUELO - PY0 - 275);
    };
    hojaP(PX0, (PX0 + PX1) / 2); hojaP((PX0 + PX1) / 2, PX1);
    g.fillStyle = "#e0b64a"; g.beginPath(); g.arc((PX0 + PX1) / 2 - 8, PY0 + 200, 3.5, 0, Math.PI * 2); g.arc((PX0 + PX1) / 2 + 8, PY0 + 200, 3.5, 0, Math.PI * 2); g.fill();
    // bajante de la lluvia
    g.fillStyle = "#6c6a66"; g.fillRect(842, -50, 9, SUELO + 50); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.strokeRect(842, -50, 9, SUELO + 50);
    for (const y of [60, 230, 400]) { g.fillStyle = "#4e4c48"; g.fillRect(839, y, 15, 6); g.strokeRect(839, y, 15, 6); }
    // brazo de hierro del farol, clavado en la fachada
    g.save(); g.strokeStyle = "#1c1814"; g.lineCap = "round"; g.lineJoin = "round";
    g.fillStyle = "#2a2520"; g.fillRect(392, -8, 14, 40); g.lineWidth = 1.6; g.strokeRect(392, -8, 14, 40);
    g.lineWidth = 4; g.beginPath(); g.moveTo(404, 2); g.lineTo(LP.x + 6, 2); g.stroke();
    g.lineWidth = 2.6; g.beginPath(); g.moveTo(404, 26); g.quadraticCurveTo(425, 4, 448, 3); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.arc(420, 12, 6, 0, Math.PI * 1.6); g.stroke(); g.beginPath(); g.arc(LP.x + 8, 7, 5, -Math.PI / 2, Math.PI * 0.9); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.moveTo(LP.x, 2); g.lineTo(LP.x, LP.y); g.stroke();
    g.restore();
    // esquina de piedra del edificio de al lado (la pared del rebote)
    g.fillStyle = "#b9a58f"; g.fillRect(-40, -50, PARED_X - 16 + 40, SUELO + 50);
    g.fillStyle = "#8f7b66"; g.beginPath(); g.moveTo(PARED_X - 16, -50); g.lineTo(PARED_X, -50); g.lineTo(PARED_X, SUELO); g.lineTo(PARED_X - 16, SUELO); g.closePath(); g.fill();
    g.strokeStyle = "rgba(60,45,35,0.55)"; g.lineWidth = 1.5;
    for (let y = -40, i = 0; y < SUELO; y += 34, i++) {
      g.beginPath(); g.moveTo(-40, y); g.lineTo(PARED_X - 16, y); g.stroke();
      const xs = i % 2 ? [8] : [-14, 30]; for (const x of xs) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 34); g.stroke(); }
      g.beginPath(); g.moveTo(PARED_X - 16, y); g.lineTo(PARED_X, y + 3); g.stroke();
    }
    g.fillStyle = "rgba(255,240,210,0.35)"; g.fillRect(PARED_X - 18, -50, 3, SUELO + 50);
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.moveTo(PARED_X, -50); g.lineTo(PARED_X, SUELO); g.moveTo(PARED_X - 16, -50); g.lineTo(PARED_X - 16, SUELO); g.stroke();
    // sombra de la esquina sobre la fachada
    const so = g.createLinearGradient(PARED_X, 0, PARED_X + 70, 0); so.addColorStop(0, "rgba(80,30,10,0.35)"); so.addColorStop(1, "rgba(80,30,10,0)");
    g.fillStyle = so; g.fillRect(PARED_X, -50, 70, SUELO + 50);
    // cajas de cerveza apiladas junto a la pared
    for (const [bx, by] of [[118, SUELO - 40], [124, SUELO - 80]]) {
      g.fillStyle = "#c2372b"; g.fillRect(bx, by, 74, 40); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(bx, by, 74, 40);
      g.fillStyle = "#8f2219"; g.fillRect(bx + 26, by + 8, 22, 8);
      g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(bx + 3, by + 3, 68, 4);
    }
    for (let i = 0; i < 5; i++) { const x = 132 + i * 13; g.fillStyle = "#4a7a2e"; g.fillRect(x, SUELO - 98, 7, 18); g.fillRect(x + 2, SUELO - 106, 3, 9); g.lineWidth = 1; g.strokeRect(x, SUELO - 98, 7, 18); }
    // acera de baldosas
    const ac = g.createLinearGradient(0, SUELO, 0, H + 50); ac.addColorStop(0, "#c9b9a2"); ac.addColorStop(1, "#8f7f6b");
    g.fillStyle = ac; g.fillRect(-40, SUELO, W + 80, H + 50 - SUELO);
    g.strokeStyle = "rgba(70,55,40,0.4)"; g.lineWidth = 1.3;
    for (const y of [SUELO + 12, SUELO + 30]) { g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); }
    for (let x = -40; x < W + 60; x += 58) { g.beginPath(); g.moveTo(x, SUELO); g.lineTo(x - 8, SUELO + 12); g.lineTo(x - 22, SUELO + 30); g.lineTo(x - 44, H + 50); g.stroke(); }
    g.fillStyle = "rgba(255,230,190,0.25)"; g.fillRect(-40, SUELO, W + 80, 2);
    g.fillStyle = "#9b8a74"; g.fillRect(-40, SUELO + 34, W + 80, 5); g.fillStyle = "#5d5244"; g.fillRect(-40, SUELO + 39, W + 80, H + 11 - SUELO);
    // viñeta cálida
    const v = g.createRadialGradient(512, 300, 330, 512, 300, 760); v.addColorStop(0, "rgba(40,10,0,0)"); v.addColorStop(1, "rgba(40,10,0,0.42)");
    g.fillStyle = v; g.fillRect(-40, -50, W + 80, H + 100);
    return c;
  }

  /* ---------- cámara: se acerca a Guillermo cuando se queda con el balón en la cabeza ---------- */
  function camara(t) { const k = tramo(t, T.quieto + 0.1, T.quieto + 1.6); return { k: 1 + 0.1 * k, x: lerp(512, 480, k), y: lerp(300, 318, k) }; }

  function pose(t) { return { g: poseG(t), d: poseD(t) }; }

  class GuillermoDeiviBalon extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !DV.listo()) return;
      if (!fondo) fondo = creaFondo();
      if (!SPR) creaBalon();
      if (!GEO) preparaGeo();
      const pg = poseG(t), pd = poseD(t), q = balon(t, pd, pg);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      let tb = 0;
      for (const [t0, f] of [[T.gCara, 1.4], [T.gCoco, 1.1]]) if (t >= t0) tb += f * Math.exp(-(t - t0) * 9) * suave(fase(t, t0, t0 + 0.03));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 24) * tb, ruido(t * 24 + 13) * tb * 0.7);
      g.drawImage(fondo, -40, -50);
      marcaPared(g, t);
      farol(g, t);
      // sombras en el suelo
      g.save(); g.fillStyle = "rgba(40,20,8,0.3)";
      g.beginPath(); g.ellipse(pg.x + 2, SUELO + 2, 78, 7, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pd.x - 6, SUELO + 2, 80, 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
      sombraBalon(g, q);
      G.dibujar(g, pg, t);
      DV.dibujar(g, pd, t);
      estela(g, t);
      dibujaBalon(g, t, q);
      for (const [tc, c] of GEO.toques) toque(g, t, tc, c);
      const V2 = GEO.V2, sup = c => P(c.x - c.n.x * RB * 0.9, c.y - c.n.y * RB * 0.9);     // punto de la superficie golpeada
      impacto(g, t, T.gCara, sup(V2[3][1]), 15); impacto(g, t, T.lampara, sup(V2[5][1]), 12); impacto(g, t, T.pared, sup(PARED_TOQUE), 13); impacto(g, t, T.gCoco, sup(V2[7][1]), 13);
      chispas(g, t, V2[5][1]);
      polvoPared(g, t);
      estrellitas(g, t, pg);
      lineasPalmas(g, t, pd);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00063", nombre: "Guillermo y Deivi · El balón", crear: () => new GuillermoDeiviBalon() });
  window.__A2D_00063 = { pose, T, DUR, geo: () => GEO, balon: t => { if (!GEO) preparaGeo(); return balonEn(t); } };
})();
