"use strict";
/* 00038 · Guillermo y Ander · El beer pong
 *
 * Negro → sótano de fiesta: pared índigo con franjas de colores pintadas, guirnalda de bombillas,
 * un neón con un vaso y una bola, un cuadro con un trofeo y una lámpara colgada sobre la mesa de
 * beer pong, con un triángulo de vasos rojos en cada punta y una botella en medio. Guillermo
 * (izquierda) y Ander (derecha, mirándole) en cada extremo → Ander, sin despeinarse, mete la
 * bola en un vaso de Guillermo con un golpe de muñeca (¡plop!), saca otra bola del bolsillo y la
 * mete sin mirar, mirando a cámara → le cede el turno con la mano abierta y se pone a hacer
 * malabares con otra bola → Guillermo pesca la bola del vaso, la sacude, le sopla, mira a cámara
 * muy chulo, apunta con la lengua fuera, hace dos amagos, carga y lanza con todas sus fuerzas →
 * la bola da en la lámpara (se balancea), en la botella (se cae), en la cabeza de Ander (que ni se
 * inmuta y sigue con sus malabares), en el cuadro de la pared (se queda torcido)… → Guillermo,
 * desesperado, abre los brazos y grita al cielo… y la bola le cae justo en la boca → se queda
 * congelado con la bola en la boca; Ander guarda su bola y aplaude despacio → Guillermo hincha los
 * carrillos y escupe la bola, que cruza la mesa y cae en un vaso de Ander → Guillermo lo celebra con
 * los puños en alto y guiña a cámara; Ander se queda con las manos a medio aplauso y levanta una ceja
 * → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto. Las trayectorias de la bola son tramos de parábola
 * (gravedad constante) entre puntos de contacto fijos en el tiempo: la mano al soltarla, la
 * lámpara, la botella, la coronilla de Ander, el cuadro y la boca de Guillermo, sacados de las
 * posturas en ese mismo instante. Así cada bote cae exactamente donde tiene que caer.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, AN = Ander;
  const S = 0.29, SUELO = 572, XG = 168, XA = 858;
  const JK = G.JK;
  const DUR = 14.2;
  const GRAV = 1500, RB = 6;                     // gravedad (px/s²) y radio de la bola (px)
  const TINTA = "#0b0a0e";
  const T = {
    a1Prep: 0.62, a1Suelta: 1.0, a1Plop: 1.85,
    a2Bols: 1.3, a2Saca: 1.72, a2Prep: 2.55, a2Suelta: 2.95, a2Plop: 3.8,
    turno0: 3.95, turno1: 4.3,
    a3Bols: 4.42, a3Saca: 4.82, malab0: 5.15, malab1: 8.8, a3Guarda: 9.12,
    gPesca0: 3.92, gPesca: 4.3, gSube: 4.55, gSacude1: 4.85, gSopla0: 4.9, gSopla: 5.08, gSopla1: 5.3, gChulo: 5.35,
    gApunta0: 5.6, gBombeo1: 5.85, gBombeo2: 6.05, gCarga0: 6.15, gLanza0: 6.4, gSuelta: 6.5,
    lampara: 6.78, botella: 7.12, cabeza: 7.57, pared: 7.95, boca: 8.67,
    grita0: 7.95,
    aplauso0: 9.2, aplausos: [9.6, 10.2, 10.8], escupe0: 11.2, escupe: 11.5, plopFin: 12.25,
    victoria: 12.35, guino: 12.7, ceja: 12.4, manosBaja: 12.95,
    fin: 13.35
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
  // tramos de parábola: lista de [t, punto]; entre cada par la bola va en caída libre y llega justa
  function vuelo(lista, t) {
    for (let i = 0; i < lista.length - 1; i++) {
      const [t0, a] = lista[i], [t1, b] = lista[i + 1];
      if (t <= t1 || i === lista.length - 2) {
        const d = t1 - t0, u = clamp(t - t0, 0, d), vx = (b.x - a.x) / d, vy0 = (b.y - a.y) / d - 0.5 * GRAV * d;
        return { x: a.x + vx * u, y: a.y + vy0 * u + 0.5 * GRAV * u * u, vx, vy: vy0 + GRAV * u };
      }
    }
    return null;
  }

  /* ---------- mesa, vasos, botella, lámpara y cuadro ---------- */
  const MESA = { x0: 236, x1: 790, y: 374, fondo: 30 };            // borde delantero del tablero y profundidad
  const baseVaso = (x, d) => P(x, MESA.y - 4 - d * (MESA.fondo - 8));
  const VASO_H = 30, VASO_RT = 11, VASO_RB = 7.5;
  const VASOS = [                                                   // de atrás adelante (orden de dibujo)
    [252, 0.83], [276, 0.67], [252, 0.5], [300, 0.5], [276, 0.33], [252, 0.17],
    [774, 0.83], [750, 0.67], [774, 0.5], [726, 0.5], [750, 0.33], [774, 0.17]
  ].map(([x, d]) => baseVaso(x, d));
  const V_G1 = baseVaso(300, 0.5), V_G2 = baseVaso(252, 0.17), V_A = baseVaso(726, 0.5);   // vasos con bola
  const bocaVaso = b => P(b.x, b.y - VASO_H);
  const flotaEn = (b, t, t0) => P(b.x, b.y - VASO_H + 2.2 + (t0 !== undefined ? 1.4 * Math.sin((t - t0) * 6) * Math.exp(-(t - t0) * 2) : 0));

  const LX = 505, LTECHO = -70, LLARGO = 188;                       // lámpara: cuelga del techo
  const L_TOQUE = P(LX - 30, LTECHO + LLARGO + 30);                // borde bajo izquierdo de la pantalla
  const angLampara = t => t < T.lampara ? 0 : 0.16 * Math.exp(-0.55 * (t - T.lampara)) * Math.sin(4.0 * (t - T.lampara));

  const BOT = { x: 604, yb: MESA.y - 4 - 0.45 * (MESA.fondo - 8), h: 58 };
  const B_TOQUE = P(BOT.x, BOT.yb - BOT.h + 2);
  function angBotella(t) {                                          // se cae hacia la derecha y rebota un poco
    if (t < T.botella) return 0;
    const u = t - T.botella;
    if (u < 0.42) return Math.PI / 2 * entrada(u / 0.42);
    const v = u - 0.42;
    return Math.PI / 2 - 0.16 * Math.exp(-7 * v) * Math.abs(Math.sin(13 * v));
  }

  const CUADRO = { x: 648, y: 58, w: 72, h: 56 };                   // clavo arriba en el centro
  const C_TOQUE = P(CUADRO.x + 14, CUADRO.y + 10 + CUADRO.h / 2);
  const angCuadro = t => t < T.pared ? 0 : -0.21 * (1 - Math.exp(-2.4 * (t - T.pared)) * Math.cos(9 * (t - T.pared)));

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, lengua: 0, esp: 0, mof: 0 };
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
    inicio: E({ mx: 0.85, my: 0.1, orig: 0, sonr: 0.45, sd: 6, gd: 0.05 }),
    sigue: E({ mx: 0.85, my: 0, sd: 10, si: 8, orig: 0, sonr: 0.2 }),
    pasmo: E({ mx: -0.2, my: 0.6, iris: 0.85, sd: 18, gd: 0.08, si: 16, orig: 0, abre: 26, ancho: 0.8, sonr: -0.1 }),
    mosqueo: E({ mx: 0.85, my: 0, c: 0.3, sd: -10, gd: -0.22, si: -8, gi: -0.2, orig: 0, abre: 0, ancho: 0.9, sonr: -0.45 }),
    pesca: E({ mx: 0.4, my: 0.9, c: 0.2, sd: 2, orig: 0, sonr: 0.1, ancho: 0.85 }),
    asco: E({ mx: 0.7, my: 0.4, c: 0.35, sd: 8, gd: -0.1, si: 4, orig: 0, abre: 6, ancho: 0.7, sonr: -0.3, lengua: 0.4 }),
    sopla: E({ mx: 0.7, my: 0.3, c: 0.5, sd: 6, orig: 0, abre: 8, ancho: 0.38, sonr: -0.1, mof: 0.55 }),
    chulo: E({ mx: -0.85, my: -0.2, sd: 14, gd: 0.14, si: -2, gi: -0.05, orig: 0, sonr: 0.7, ancho: 1 }),
    apunta: E({ mx: 0.9, my: -0.05, ci: 0.9, sd: -6, gd: -0.15, si: 8, orig: 0, abre: 9, ancho: 0.7, sonr: 0.15, lengua: 1 }),
    carga: E({ mx: 0.9, my: -0.25, c: 0.45, z: 0.6, sd: -12, gd: -0.25, si: -12, gi: -0.25, orig: 0, abre: 10, ancho: 1.1, sonr: -0.55 }),
    lanza: E({ mx: 0.85, my: -0.6, sd: 16, gd: 0.05, si: 16, orig: 0, abre: 46, ancho: 1.15, sonr: 0.15, lengua: 0.3 }),
    mira: E({ mx: 0.85, my: -0.6, iris: 0.9, sd: 18, gd: 0.06, si: 18, orig: 0, abre: 18, ancho: 0.75, sonr: 0.05 }),
    eek: E({ mx: 0.85, my: -0.3, c: 0.35, z: 0.5, sd: 20, gd: -0.1, si: 20, gi: -0.1, orig: 0, abre: 9, ancho: 1.1, sonr: -0.55 }),
    grita: E({ mx: 0.4, my: -0.9, c: 0.35, sd: 22, gd: -0.1, si: 22, gi: -0.1, orig: 0, abre: 70, ancho: 1.15, sonr: -0.2, lengua: 0.5 }),
    bola: E({ mx: 0.2, my: 0.8, iris: 0.6, sd: 26, gd: 0.04, si: 26, gi: 0.04, orig: 0, abre: 34, ancho: 0.6, sonr: -0.15, lengua: 0 }),
    carrillos: E({ mx: 0.85, my: 0.1, iris: 0.8, sd: 10, gd: -0.05, si: 8, orig: 0, abre: 22, ancho: 0.5, sonr: -0.1, mof: 0.9 }),
    ptui: E({ mx: 0.85, my: 0.15, c: 0.55, z: 0.6, sd: 4, gd: -0.1, si: 4, orig: 0, abre: 16, ancho: 0.42, sonr: -0.1 }),
    sigueFin: E({ mx: 0.85, my: 0.25, sd: 16, si: 14, orig: 0, abre: 12, ancho: 0.7, sonr: 0.2 }),
    victoria: E({ mx: 0.6, my: -0.3, c: 0.6, h: 1, sd: 20, gd: 0.15, si: 20, gi: 0.15, orig: 0, abre: 40, ancho: 1.15, sonr: 1 }),
    guino: E({ mx: -0.85, my: -0.15, ci: 1, sd: 16, gd: 0.15, si: 2, orig: 0, abre: 6, ancho: 1.05, sonr: 0.9 })
  };
  const GUION_CARA_G = [
    [T.a1Suelta, T.a1Suelta + 0.2, "sigue"], [T.a1Plop - 0.03, T.a1Plop + 0.12, "pasmo"], [T.a2Suelta, T.a2Suelta + 0.2, "sigue"],
    [T.a2Plop - 0.03, T.a2Plop + 0.15, "mosqueo"], [T.gPesca0, T.gPesca0 + 0.2, "pesca"], [T.gPesca + 0.05, T.gPesca + 0.25, "asco"],
    [T.gSopla0, T.gSopla0 + 0.12, "sopla"], [T.gChulo - 0.05, T.gChulo + 0.15, "chulo"], [T.gApunta0, T.gApunta0 + 0.18, "apunta"],
    [T.gCarga0, T.gCarga0 + 0.15, "carga"], [T.gLanza0 + 0.04, T.gSuelta + 0.04, "lanza"], [T.gSuelta + 0.2, T.gSuelta + 0.45, "mira"],
    [T.cabeza - 0.02, T.cabeza + 0.12, "eek"], [T.grita0, T.grita0 + 0.3, "grita"], [T.boca - 0.02, T.boca + 0.1, "bola"],
    [T.escupe0, T.escupe0 + 0.2, "carrillos"], [T.escupe - 0.06, T.escupe + 0.03, "ptui"], [T.escupe + 0.12, T.escupe + 0.3, "sigueFin"],
    [T.victoria - 0.05, T.victoria + 0.15, "victoria"], [T.guino, T.guino + 0.2, "guino"]
  ];
  const CARAS_A = {
    inicio: E({ mx: 0.85, my: 0.05, c: 0.3, orig: 0, sonr: 0.25, ancho: 0.9 }),
    lanza: E({ mx: 0.85, my: 0.2, c: 0.35, orig: 0, sonr: 0.3, ancho: 0.9 }),
    camara: E({ mx: -0.85, my: -0.1, c: 0.4, si: 8, gi: 0.05, orig: 0, sonr: 0.4, ancho: 0.95 }),
    tuyo: E({ mx: 0.85, my: 0, c: 0.3, si: 12, gi: 0.08, orig: 0, sonr: 0.35, ancho: 0.95 }),
    aburre: E({ mx: 0.4, my: -0.4, c: 0.5, orig: 0, sonr: 0.1, ancho: 0.85 }),
    mira: E({ mx: 0.85, my: 0, c: 0.38, orig: 0, sonr: 0.15, ancho: 0.85 }),
    sorpresa: E({ mx: 0.85, my: 0, c: 0.15, sd: 6, si: 16, gi: 0.08, orig: 0, abre: 6, ancho: 0.7, sonr: 0.05 }),
    aplaude: E({ mx: 0.85, my: 0.05, c: 0.55, sd: 4, si: 10, gi: 0.06, orig: 0, sonr: 0.3, ancho: 0.95 }),
    ceja: E({ mx: 0.6, my: 0.5, c: 0.25, sd: -2, si: 22, gi: 0.12, orig: 0, abre: 3, ancho: 0.7, sonr: -0.25 }),
    final: E({ mx: -0.85, my: -0.1, c: 0.4, sd: -2, si: 20, gi: 0.12, orig: 0, sonr: -0.15, ancho: 0.8 })
  };
  const GUION_CARA_A = [
    [T.a1Prep, T.a1Prep + 0.2, "lanza"], [T.a1Plop - 0.1, T.a1Plop + 0.15, "inicio"], [T.a2Prep - 0.25, T.a2Prep, "camara"],
    [T.a2Plop + 0.05, T.a2Plop + 0.25, "tuyo"], [T.malab0, T.malab0 + 0.4, "aburre"], [T.gCarga0, T.gCarga0 + 0.3, "mira"],
    [T.grita0 + 0.15, T.grita0 + 0.35, "mira"], [T.boca + 0.02, T.boca + 0.2, "sorpresa"], [T.aplauso0, T.aplauso0 + 0.3, "aplaude"],
    [T.escupe, T.escupe + 0.2, "mira"], [T.ceja, T.ceja + 0.25, "ceja"], [T.ceja + 0.55, T.ceja + 0.8, "final"]
  ];

  /* ---------- manos ---------- */
  const R_M = G.MUNECA_R * JK;
  const desdeMuneca = (w, ang, mu) => { const o = rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: w.x - o.x, y: w.y - o.y }; };
  const CERO = { pulgar: 0, indice: 0, medio: 0, anular: 0, menique: 0 };
  const todos = k => ({ pulgar: k, indice: k, medio: k, anular: k, menique: k });
  const PINZA = { pulgar: 0.45, indice: 0.5, medio: 0.25, anular: 0.15, menique: 0.15 };
  const CUENCO = { pulgar: 0.75, indice: 0.7, medio: 0.7, anular: 0.65, menique: 0.6 };
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
  // bola cogida con la punta de los dedos: del centro de la mano, unas unidades hacia los dedos
  const OFF_BOLA = 9.5;
  const offBola = (mu, ang) => rotP({ x: Math.cos(mu + Math.PI) * OFF_BOLA * JK, y: Math.sin(mu + Math.PI) * OFF_BOLA * JK }, ang || 0);
  function bolaEnMano(Rig, p, m) { const o = offBola(m.mu, m.ang); return Rig.aPantalla(p, P(m.x + o.x, m.y + o.y)); }
  function manoParaBola(Rig, p, q, mu, ang) { const h = Rig.aHoja(p, q), o = offBola(mu, ang); return P(h.x - o.x, h.y - o.y); }
  const comoMano = m => ({ x: m.x, y: m.y, ang: m.ang, mu: m.mu, dobla: m.dobla, puno: m.puno, dedos: m.dedos });

  /* ---------- geometría de los vuelos (se calcula una vez, con las posturas de esos instantes) ---------- */
  let GEO = null;
  const BOCA_C = P(803, 730), BOCA_ANG = 0.26;
  // centro de la boca abierta de Guillermo en su retrato (depende de lo abierta que esté)
  const centroBoca = (abre, sonr) => { const d = 12 * sonr + 2 + 0.45 * abre; return P(BOCA_C.x - d * Math.sin(BOCA_ANG), BOCA_C.y + d * Math.cos(BOCA_ANG)); };
  const CORONILLA_A = P(818, 258);                                  // punto alto del pelo de Ander (retrato)
  function bocaG(p) { const b = p.cara.boca; return G.aPantalla(p, G.cabeza(p).a(centroBoca(b.abre, b.sonrisa))); }
  function preparaGeo() {
    const a1 = poseA(T.a1Suelta, true), a2 = poseA(T.a2Suelta, true), gS = poseG(T.gSuelta, true);
    const aC = poseA(T.cabeza, true), gB = poseG(T.boca, true), gE = poseG(T.escupe, true);
    const coco = AN.aPantalla(aC, AN.cabeza(aC).a(CORONILLA_A));
    GEO = {
      A1: [[T.a1Suelta, bolaEnMano(AN, a1, a1.manoLejos)], [T.a1Plop, flotaEn(V_G1)]],
      A2: [[T.a2Suelta, bolaEnMano(AN, a2, a2.manoLejos)], [T.a2Plop, flotaEn(V_G2)]],
      G: [[T.gSuelta, bolaEnMano(G, gS, gS.manoLejos)], [T.lampara, L_TOQUE], [T.botella, B_TOQUE], [T.cabeza, P(coco.x, coco.y - RB)],
          [T.pared, C_TOQUE], [T.boca, bocaG(gB)]],
      E: [[T.escupe, bocaG(gE)], [T.plopFin, flotaEn(V_A)]],
      coco
    };
  }

  /* ---------- bolas: dónde está cada una en cada instante ---------- */
  // la bola de la mano solo se ve cuando la mano asoma del bolsillo
  const fueraBolsillo = m => clamp((m.puno - 0.55) / 0.3);
  // Bola 1: de la mano de Ander a un vaso de Guillermo.
  function bola1(t, pa) {
    if (t < T.a1Suelta) return { q: bolaEnMano(AN, pa, pa.manoLejos), en: "mano" };
    if (t < T.a1Plop) return { q: vuelo(GEO.A1, t), en: "aire", vel: true };
    return { q: flotaEn(V_G1, t, T.a1Plop), en: "vaso", vaso: V_G1 };
  }
  // Bola 2: del bolsillo de Ander a un vaso de Guillermo; Guillermo la pesca, la tira, la caza con la
  // boca, la escupe y acaba en un vaso de Ander.
  function bola2(t, pa, pg) {
    if (t < T.a2Saca) return null;
    if (t < T.a2Suelta) return { q: bolaEnMano(AN, pa, pa.manoLejos), en: "mano", alfa: fueraBolsillo(pa.manoLejos) };
    if (t < T.a2Plop) return { q: vuelo(GEO.A2, t), en: "aire", vel: true };
    if (t < T.gPesca) return { q: flotaEn(V_G2, t, T.a2Plop), en: "vaso", vaso: V_G2 };
    if (t < T.gSuelta) return { q: bolaEnMano(G, pg, pg.manoLejos), en: "mano" };
    if (t < T.boca) return { q: vuelo(GEO.G, t), en: "aire", vel: true };
    if (t < T.escupe) return { q: bocaG(pg), en: "boca" };
    if (t < T.plopFin) return { q: vuelo(GEO.E, t), en: "aire", vel: true };
    return { q: flotaEn(V_A, t, T.plopFin), en: "vaso", vaso: V_A };
  }
  // Bola 3: los malabares de Ander mientras Guillermo se prepara.
  const PER_MAL = (T.malab1 - T.malab0) / 5;
  function alturaMalabar(t) {
    if (t < T.malab0 || t > T.malab1) return 0;
    const u = ((t - T.malab0) % PER_MAL) / PER_MAL;
    return 4 * 42 * u * (1 - u);
  }
  function bola3(t, pa) {
    if (t < T.a3Saca || t > T.a3Guarda) return null;
    const q = bolaEnMano(AN, pa, pa.manoLejos);
    return { q: P(q.x, q.y - alturaMalabar(t)), en: alturaMalabar(t) > 1 ? "aire" : "mano", alfa: fueraBolsillo(pa.manoLejos) };
  }
  const posBola2 = (t, pa, pg) => { const b = bola2(t, pa, pg); return b ? b.q : null; };

  /* ---------- Guillermo ---------- */
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const BOLS_G_C = desdeMuneca(P(131, 652), 0, -1.75), BOLS_G_L = desdeMuneca(P(372, 648), 0, -1.75);
  const CG0 = { dx: 0, pel: 0, torso: 0.03, cab: 0, hom: 0 };
  const CG = o => Object.assign({}, CG0, o);
  const CUERPOS_G = {
    base: CG({}), pasmo: CG({ torso: -0.02, cab: 0.04 }), mosqueo: CG({ torso: 0.05, cab: 0.03, hom: 0.3 }),
    pesca: CG({ dx: 8, pel: 22, torso: 0.3, cab: 0.08 }), sube: CG({ torso: 0.02, cab: -0.02 }), sopla: CG({ torso: 0.0, cab: 0.03 }),
    chulo: CG({ torso: -0.04, cab: -0.07 }), apunta: CG({ dx: 6, pel: 10, torso: 0.1, cab: 0.03 }),
    carga: CG({ dx: -10, pel: 46, torso: -0.1, cab: 0.04 }), lanza: CG({ dx: 26, pel: 16, torso: 0.22, cab: -0.14 }),
    mira: CG({ dx: 18, pel: 8, torso: 0.06, cab: -0.2 }), eek: CG({ dx: 14, pel: 10, torso: 0.02, cab: -0.04, hom: 0.9 }),
    grita: CG({ dx: 12, pel: 18, torso: -0.2, cab: -0.5 }), escupe: CG({ dx: 18, pel: 10, torso: 0.14, cab: 0.1 }),
    victoria: CG({ dx: 14, pel: 2, torso: -0.06, cab: -0.08 })
  };
  const GUION_CUERPO_G = [
    [T.a1Plop - 0.03, T.a1Plop + 0.2, "pasmo"], [T.a2Plop - 0.03, T.a2Plop + 0.2, "mosqueo"], [T.gPesca0, T.gPesca, "pesca"],
    [T.gPesca + 0.04, T.gSube, "sube"], [T.gSopla0, T.gSopla, "sopla"], [T.gChulo - 0.05, T.gChulo + 0.2, "chulo"],
    [T.gApunta0, T.gApunta0 + 0.2, "apunta"], [T.gCarga0, T.gLanza0, "carga"], [T.gLanza0, T.gSuelta, "lanza", salida],
    [T.gSuelta + 0.2, T.gSuelta + 0.6, "mira"], [T.cabeza - 0.02, T.cabeza + 0.15, "eek"], [T.grita0, T.grita0 + 0.35, "grita"],
    [T.escupe0 + 0.1, T.escupe, "escupe", salida], [T.escupe + 0.15, T.victoria, "mira"], [T.victoria - 0.05, T.victoria + 0.2, "victoria"]
  ];
  // pasos: el pie de delante avanza en la estocada del lanzamiento
  function pieG(lado, t) {
    if (lado === "cerca") return { x: XG - 19, y: TOB_G.cerca, ang: 0 };
    const k = fase(t, T.gLanza0 - 0.08, T.gSuelta + 0.05), arco = Math.sin(Math.PI * k);
    return { x: lerp(XG + 18, XG + 52, suave5(k)), y: TOB_G.lejos - 26 * arco, ang: -0.15 * arco };
  }
  function poseG(t, geo = false) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "base", t);
    const respira = Math.sin(t * 2.2);
    const congela = tramo(t, T.boca, T.boca + 0.05) * (1 - tramo(t, T.escupe0, T.escupe0 + 0.1));
    const tiembla = congela * ruido(t * 30) * 1.5;
    const ptui = campana(t, T.escupe - 0.05, T.escupe + 0.2);
    const salto = campana(t, T.victoria - 0.05, T.victoria + 0.35);
    const p = {
      x: XG + b.dx + tiembla * 0.5, suelo: SUELO, s: S, tirasLimpias: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 * (1 - congela) - 60 * salto }, torso: b.torso + 0.005 * tiembla,
      torsoEsc: { x: 1, y: 1 + respira * 0.004 * (1 - congela) + 0.02 * b.hom },
      piernas: {}, cabeza: { ang: b.cab + 0.012 * tiembla + 0.08 * ptui, dx: 0, dy: -10 * b.hom, esc: { x: 1, y: 1 } }, cara: null
    };
    for (const lado of ["cerca", "lejos"]) {
      const f = pieG(lado, t);
      p.piernas[lado] = { tob: { x: G.PELVIS.x + (f.x - p.x) / S, y: f.y - 60 * salto }, ang: f.ang + 0.15 * salto };
    }
    // cara
    const e = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    e.ci = Math.max(e.ci, campana(t, T.guino, T.guino + 0.5));
    // amagos: la boca se tensa un poco con cada uno
    p.enfado = 0.8 * tramo(t, T.a2Plop, T.a2Plop + 0.2) * (1 - tramo(t, T.gPesca0, T.gPesca0 + 0.3));
    p.cara = cara(e, congela > 0.5 ? 0 : parpadeo(t, [0.55, 3.25, 5.5, 7.35, 12.05]));
    // manos
    const Tr = G.tronco(p), bolsC = Tr(BOLS_G_C), bolsL = Tr(BOLS_G_L);
    const enBolsL = M(bolsL.x, bolsL.y, -1.75, 0, 0, CERO, -1), enBolsC = M(bolsC.x, bolsC.y, -1.75, 0, 0, CERO, -1);
    const pesca = manoParaBola(G, p, flotaEn(V_G2, Math.min(t, T.gPesca), T.a2Plop), -1.57, 0);
    const pecho = Tr(P(505, 470));
    const bocaQ = G.aPantalla(p, G.cabeza(p).a(P(842, 742)));
    const sopla = manoParaBola(G, p, P(bocaQ.x + 36, bocaQ.y + 14), 2.5, 0);
    const lado = Tr(P(545, 330));
    const apunta = Tr(P(640, 335));
    const carga = Tr(P(255, 690));
    const suelta = Tr(P(585, 250)), sigue = Tr(P(640, 215));
    const baja = Tr(P(430, 465));
    const brazosL = Tr(P(650, 340)), brazosC = Tr(P(-50, 330));
    const punosL = Tr(P(600, 245)), punosC = Tr(P(-20, 255));
    let L = ruta(t, [
      [T.gPesca0, T.gPesca, M(pesca.x, pesca.y, -1.57, 0, 1, PINZA, -1)],
      [T.gPesca + 0.03, T.gSube, M(pecho.x, pecho.y, 2.5, 0, 1, PINZA, -1)],
      [T.gSopla0, T.gSopla, M(sopla.x, sopla.y, 2.5, 0, 1, PINZA, -1)],
      [T.gSopla1 - 0.02, T.gChulo + 0.1, M(lado.x, lado.y, 2.2, 0, 1, PINZA, -1)],
      [T.gApunta0, T.gApunta0 + 0.2, M(apunta.x, apunta.y, Math.PI, 0, 1, PINZA, -1)],
      [T.gCarga0, T.gLanza0, M(carga.x, carga.y, -1.3, 0, 1, PINZA, -1)],
      [T.gLanza0, T.gSuelta, M(suelta.x, suelta.y, 2.25, 0, 1, PINZA, -1), k => k],
      [T.gSuelta, T.gSuelta + 0.25, M(sigue.x, sigue.y, 2.0, 0, 1, todos(0.9), -1), salida],
      [T.gSuelta + 0.45, T.gSuelta + 0.85, M(baja.x, baja.y, -2.0, 0, 1, todos(0.2), -1)],
      [T.grita0, T.grita0 + 0.3, M(brazosL.x, brazosL.y, 2.3, 0, 1, todos(1), -1)],
      [T.escupe0, T.escupe0 + 0.3, M(brazosL.x - 15, brazosL.y + 30, 2.3, 0, 1, todos(0.8), -1)],
      [T.victoria - 0.05, T.victoria + 0.15, M(punosL.x, punosL.y, 1.75, 0, 1, CERO, -1)]
    ], enBolsL);
    // mientras pesca, sopla o tira, la mano va exactamente donde está la bola (la mezcla ya ha llegado)
    if (t >= T.gPesca && t < T.gPesca + 0.03) L = M(pesca.x, pesca.y, -1.57, 0, 1, PINZA, -1);
    if (t >= T.gSopla && t < T.gSopla1 - 0.02) L = M(sopla.x, sopla.y, 2.5, 0, 1, PINZA, -1);
    // sacude la bola (se le quedan gotas) y amaga dos veces antes de cargar
    const sac = tramo(t, T.gSube - 0.05, T.gSube + 0.05) * (1 - tramo(t, T.gSacude1 - 0.05, T.gSacude1 + 0.03));
    L.x += 16 * Math.sin((t - T.gSube) * 38) * sac;
    for (const tb of [T.gBombeo1, T.gBombeo2]) { const k = campana(t, tb - 0.1, tb + 0.1); L.x += 34 * k; L.y += 10 * k; }
    // brazos abiertos: tiemblan con él
    if (congela > 0) { L.x += 2 * tiembla; L.y += 1.5 * ruido(t * 27 + 3) * congela; }
    // victoria: los puños bombean
    const bombea = tramo(t, T.victoria + 0.1, T.victoria + 0.2) * Math.abs(Math.sin((t - T.victoria) * 9)) * (1 - tramo(t, T.guino, T.guino + 0.2));
    L.y -= 18 * bombea;
    p.manoLejos = comoMano(L);
    let C = ruta(t, [
      [T.grita0 + 0.04, T.grita0 + 0.34, M(brazosC.x, brazosC.y, 1.2, 0, 1, todos(1), -1)],
      [T.escupe0, T.escupe0 + 0.3, M(brazosC.x + 15, brazosC.y + 30, 1.2, 0, 1, todos(0.8), -1)],
      [T.victoria - 0.05, T.victoria + 0.15, M(punosC.x, punosC.y, 1.4, 0, 1, CERO, -1)]
    ], enBolsC);
    if (congela > 0) { C.x -= 2 * tiembla; }
    C.y -= 18 * bombea;
    p.manoCerca = comoMano(C);
    p.ikContinuo = false;
    // mirada: sigue a la bola en vuelo
    if (!geo && GEO) {
      let q = null, w = 0;
      if (t >= T.a1Suelta - 0.1 && t < T.a1Plop + 0.25) { q = bola1(t, poseA(t, true)).q; w = tramo(t, T.a1Suelta - 0.1, T.a1Suelta + 0.1); }
      else if (t >= T.a2Suelta - 0.1 && t < T.a2Plop + 0.3) { q = posBola2(t, poseA(t, true), p); w = tramo(t, T.a2Suelta - 0.1, T.a2Suelta + 0.1) * (1 - tramo(t, T.a2Plop + 0.1, T.a2Plop + 0.3)); }
      else if (t >= T.gSuelta && t < T.grita0 + 0.2) { q = posBola2(t, poseA(t, true), p); w = tramo(t, T.gSuelta, T.gSuelta + 0.08) * (1 - tramo(t, T.grita0, T.grita0 + 0.2)); }
      else if (t >= T.escupe && t < T.victoria) { q = posBola2(t, poseA(t, true), p); w = tramo(t, T.escupe, T.escupe + 0.1) * (1 - tramo(t, T.victoria - 0.1, T.victoria)); }
      if (q && w > 0) {
        const o = G.aPantalla(p, G.cabeza(p).a(P(835, 585))), dx = q.x - o.x, dy = q.y - o.y, d = Math.hypot(dx, dy) || 1;
        p.cara.mirada = mezcla(p.cara.mirada, P(clamp(dx / d * 1.1, -1, 1), clamp(dy / d * 1.1, -1, 1)), w);
      }
    }
    return p;
  }

  /* ---------- Ander ---------- */
  const TOB_A = { cerca: AN.SUELO - AN.TOBILLO_ALTO, lejos: AN.SUELO - AN.TOBILLO_ALTO - 10 };
  const CA0 = { pel: 0, torso: 0, cab: 0 };
  const CA = o => Object.assign({}, CA0, o);
  const CUERPOS_A = {
    base: CA({}), lanza: CA({ pel: 4, torso: 0.05, cab: 0.02 }), tuyo: CA({ pel: 4, torso: 0.06, cab: 0.03 }),
    malab: CA({ torso: -0.03, cab: -0.04 }), aplaude: CA({ pel: 2, torso: 0.02, cab: 0.02 }), ceja: CA({ torso: 0.03, cab: 0.05 })
  };
  const GUION_CUERPO_A = [
    [T.a1Prep, T.a1Suelta, "lanza"], [T.a1Suelta + 0.2, T.a1Suelta + 0.6, "base"], [T.a2Prep, T.a2Suelta, "lanza"], [T.a2Suelta + 0.2, T.a2Suelta + 0.6, "base"],
    [T.turno0, T.turno1, "tuyo"], [T.a3Bols, T.a3Saca, "base"], [T.malab0, T.malab0 + 0.4, "malab"], [T.aplauso0, T.aplauso0 + 0.4, "aplaude"],
    [T.ceja, T.ceja + 0.3, "ceja"]
  ];
  function poseA(t, geo = false) {
    const b = guion(GUION_CUERPO_A, CUERPOS_A, "base", t);
    const respira = Math.sin(t * 1.9 + 1.3);
    // el coscorrón: ni se inmuta (solo un hundimiento mínimo y un parpadeo)
    const coco = t >= T.cabeza ? Math.exp(-(t - T.cabeza) * 14) * suave(fase(t, T.cabeza, T.cabeza + 0.03)) : 0;
    const p = {
      x: XA, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: AN.PELVIS.x, y: AN.PELVIS.y + b.pel + respira * 1.1 }, torso: b.torso,
      torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab + 0.015 * Math.sin(t * 1.1), dx: 0, dy: 6 * coco, esc: { x: 1 + 0.03 * coco, y: 1 - 0.04 * coco } }
    };
    for (const lado of ["cerca", "lejos"]) p.piernas[lado] = { tob: { x: AN.PELVIS.x + (lado === "cerca" ? -58 : 62), y: TOB_A[lado] }, ang: 0 };
    const e = guion(GUION_CARA_A, CARAS_A, "inicio", t);
    p.cara = cara(e, parpadeo(t, [1.45, 3.4, 5.9, T.cabeza + 0.02, 9.35, 11.0]));
    // manos
    const Tr = AN.tronco(p), bolsL = Tr(AN.BOLSILLO_L), bolsC = Tr(AN.BOLSILLO_C);
    const enBolsL = M(bolsL.x, bolsL.y, -1.75, 0, 0, CERO, 1), enBolsC = M(bolsC.x, bolsC.y, -1.75, 0, 0, CERO, -1);
    const sujeta = Tr(P(520, 430)), arma = Tr(P(498, 452)), tira = Tr(P(552, 398)), suelta = Tr(P(570, 388));
    const tuyo = Tr(P(592, 410)), malab = Tr(P(480, 500));
    const palmaL = Tr(P(382, 405)), palmaC = Tr(P(228, 412)), juntas = Tr(P(306, 405));
    const SUJ = M(sujeta.x, sujeta.y, 2.4, 0, 1, PINZA, 1);
    const lanzamiento = (tp, ts) => [
      [tp, ts - 0.07, M(arma.x, arma.y, 2.0, 0.45, 1, PINZA, 1)],
      [ts - 0.07, ts, M(tira.x, tira.y, 2.75, -0.25, 1, PINZA, 1), k => k],
      [ts, ts + 0.2, M(suelta.x, suelta.y, 2.9, -0.35, 1, todos(0.85), 1), salida]
    ];
    let L = ruta(t, [
      ...lanzamiento(T.a1Prep, T.a1Suelta),
      [T.a2Bols, T.a2Bols + 0.35, enBolsL], [T.a2Saca, T.a2Saca + 0.35, SUJ],
      ...lanzamiento(T.a2Prep, T.a2Suelta),
      [T.turno0, T.turno1, M(tuyo.x, tuyo.y, Math.PI - 0.15, 0, 1, todos(1), 1)],
      [T.a3Bols, T.a3Bols + 0.35, enBolsL], [T.a3Saca, T.a3Saca + 0.3, M(malab.x, malab.y, 2.55, 0, 1, CUENCO, 1)],
      [T.a3Guarda - 0.3, T.a3Guarda, enBolsL],
      [T.aplauso0, T.aplauso0 + 0.4, M(palmaL.x, palmaL.y, 1.45, 0, 1, todos(1), 1)],
      [T.manosBaja, T.manosBaja + 0.4, enBolsL]
    ], SUJ);
    let C = ruta(t, [
      [T.aplauso0 + 0.05, T.aplauso0 + 0.45, M(palmaC.x, palmaC.y, 1.65, 0, 1, todos(1), -1)],
      [T.manosBaja, T.manosBaja + 0.4, enBolsC]
    ], enBolsC);
    // malabares: la mano baja un poco al recoger la bola
    for (let k = 1; k <= 5; k++) { const d = (t - (T.malab0 + k * PER_MAL)) / 0.05; if (d > 0) L.y += 16 * d * Math.exp(1 - d); }
    // aplausos lentos: las manos se juntan en el centro
    for (const tc of T.aplausos) {
      const k = campana(t, tc - 0.22, tc + 0.22), kk = Math.pow(k, 0.7);
      L.x = lerp(L.x, juntas.x + 18, kk); L.y = lerp(L.y, juntas.y, kk);
      C.x = lerp(C.x, juntas.x - 18, kk); C.y = lerp(C.y, juntas.y + 2, kk);
    }
    // al escupir Guillermo, las manos se quedan a medio aplauso
    p.manoLejos = comoMano(L);
    p.manoCerca = comoMano(C);
    // mirada: sigue la bola cuando viene hacia él y cuando cae en su vaso
    if (!geo && GEO) {
      let q = null, w = 0;
      if (t >= T.a1Suelta && t < T.a1Plop + 0.2) { q = bola1(t, p).q; w = tramo(t, T.a1Suelta, T.a1Suelta + 0.1) * (1 - tramo(t, T.a1Plop, T.a1Plop + 0.2)); }
      else if (t >= T.grita0 && t < T.boca + 0.3) { q = posBola2(t, p, poseG(t, true)); w = tramo(t, T.grita0, T.grita0 + 0.15) * (1 - tramo(t, T.boca + 0.1, T.boca + 0.3)); }
      else if (t >= T.escupe && t < T.ceja + 0.3) { q = posBola2(t, p, poseG(t, true)); w = tramo(t, T.escupe, T.escupe + 0.1) * (1 - tramo(t, T.ceja, T.ceja + 0.3)); }
      if (q && w > 0) {
        const o = AN.aPantalla(p, AN.cabeza(p).a(P(880, 530))), dx = -(q.x - o.x), dy = q.y - o.y, d = Math.hypot(dx, dy) || 1;
        p.cara.mirada = mezcla(p.cara.mirada, P(clamp(dx / d * 1.1, -1, 1), clamp(dy / d * 1.1, -1, 1)), w);
      }
    }
    return p;
  }

  /* ---------- dibujo de objetos ---------- */
  function vasoRojo(g, b) {
    const x = b.x, yb = b.y, yt = yb - VASO_H;
    g.save(); g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - VASO_RT, yt); g.lineTo(x - VASO_RB, yb); g.quadraticCurveTo(x, yb + 2.4, x + VASO_RB, yb); g.lineTo(x + VASO_RT, yt); g.closePath();
    const gr = g.createLinearGradient(x - VASO_RT, 0, x + VASO_RT, 0); gr.addColorStop(0, "#ff6a5c"); gr.addColorStop(0.35, "#e3202b"); gr.addColorStop(1, "#99101a");
    g.fillStyle = gr; g.fill(); g.lineWidth = 1.6; g.strokeStyle = TINTA; g.stroke();
    g.strokeStyle = "rgba(90,0,8,0.55)"; g.lineWidth = 1;
    for (const k of [0.36, 0.6]) { const yy = yt + VASO_H * k, rr = lerp(VASO_RT, VASO_RB, k) - 0.8; g.beginPath(); g.moveTo(x - rr, yy); g.quadraticCurveTo(x, yy + 2, x + rr, yy); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,0.38)"; g.fillRect(x - VASO_RT + 3, yt + 5, 2.2, VASO_H - 10);
    g.fillStyle = "#f4f1ea"; g.beginPath(); g.ellipse(x, yt, VASO_RT + 0.6, 3.7, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.4; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "#bd1722"; g.beginPath(); g.ellipse(x, yt + 0.3, VASO_RT - 1.6, 2.6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#f2b33a"; g.beginPath(); g.ellipse(x, yt + 1.3, VASO_RT - 3.2, 1.7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,248,225,0.8)"; g.beginPath(); g.arc(x - 3, yt + 1.1, 0.9, 0, Math.PI * 2); g.arc(x + 2.5, yt + 1.6, 0.7, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function bola(g, x, y, alfa = 1, r = RB) {
    if (alfa <= 0.01) return;
    g.save(); g.globalAlpha *= alfa; g.lineJoin = "round";
    g.fillStyle = "#fbfbf6"; g.strokeStyle = TINTA; g.lineWidth = 1.4;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    g.save(); g.clip(); g.fillStyle = "rgba(150,160,180,0.5)"; g.beginPath(); g.arc(x + r * 0.45, y + r * 0.45, r * 0.95, 0, Math.PI * 2); g.fill(); g.restore();
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.35, r * 0.3, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // bola dentro de un vaso: se ve la mitad de arriba y el borde delantero del vaso por encima
  function bolaEnVaso(g, b, q) {
    const x = b.x, yt = b.y - VASO_H;
    g.save(); g.beginPath(); g.rect(x - 20, yt - 30, 40, 30); g.ellipse(x, yt + 0.3, VASO_RT - 1.2, 3, 0, 0, Math.PI); g.clip();
    bola(g, q.x, q.y); g.restore();
    g.save(); g.lineWidth = 2.6; g.strokeStyle = "#f4f1ea"; g.beginPath(); g.ellipse(x, yt, VASO_RT - 0.4, 3.1, 0, 0.1, Math.PI - 0.1); g.stroke();
    g.lineWidth = 1.4; g.strokeStyle = TINTA; g.beginPath(); g.ellipse(x, yt, VASO_RT + 0.6, 3.7, 0, 0, Math.PI); g.stroke(); g.restore();
  }
  function botella(g, t) {
    const a = angBotella(t), piv = P(BOT.x + 9, BOT.yb);
    g.save(); g.lineJoin = "round";
    // charquito de cerveza al caerse (se queda)
    const ch = tramo(t, T.botella + 0.4, T.botella + 1.6, salida);
    if (ch > 0.01) { const fin = P(piv.x + BOT.h - 14, BOT.yb - 2); g.fillStyle = "rgba(242,179,58,0.8)"; g.strokeStyle = "rgba(120,70,0,0.6)"; g.lineWidth = 1.2;
      g.beginPath(); g.ellipse(fin.x + 14 * ch, fin.y + 1, 6 + 20 * ch, 1.8 + 2.4 * ch, 0, 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.translate(piv.x, piv.y); g.rotate(a); g.translate(-9, 0);
    const forma = () => { g.beginPath(); g.moveTo(-9, 0); g.lineTo(-9, -32); g.quadraticCurveTo(-9, -40, -3.5, -44); g.lineTo(-3.5, -BOT.h + 3); g.lineTo(-4.2, -BOT.h + 3);
      g.lineTo(-4.2, -BOT.h); g.lineTo(4.2, -BOT.h); g.lineTo(4.2, -BOT.h + 3); g.lineTo(3.5, -BOT.h + 3); g.lineTo(3.5, -44); g.quadraticCurveTo(9, -40, 9, -32); g.lineTo(9, 0); g.closePath(); };
    forma(); const gr = g.createLinearGradient(-9, 0, 9, 0); gr.addColorStop(0, "#5fae5a"); gr.addColorStop(0.4, "#2f7a35"); gr.addColorStop(1, "#174a1e"); g.fillStyle = gr; g.fill();
    g.save(); forma(); g.clip(); g.fillStyle = "#f3e6c4"; g.fillRect(-9, -26, 18, 14); g.fillStyle = "#c0392b"; g.fillRect(-9, -21, 18, 4);
    g.fillStyle = "rgba(255,255,255,0.45)"; g.fillRect(-6.5, -40, 2, 36); g.restore();
    forma(); g.lineWidth = 1.6; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "#d4a72c"; g.fillRect(-4.6, -BOT.h - 1, 9.2, 4); g.strokeRect(-4.6, -BOT.h - 1, 9.2, 4);
    g.restore();
  }
  function lampara(g, t) {
    const a = angLampara(t), c = P(LX + Math.sin(a) * LLARGO, LTECHO + Math.cos(a) * LLARGO);
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    g.strokeStyle = "#151218"; g.lineWidth = 2; g.beginPath(); g.moveTo(LX, LTECHO); g.lineTo(c.x, c.y); g.stroke();
    g.translate(c.x, c.y); g.rotate(-a);
    // cono de luz
    const luz = g.createLinearGradient(0, 30, 0, 250); luz.addColorStop(0, "rgba(255,236,170,0.22)"); luz.addColorStop(1, "rgba(255,236,170,0)");
    g.fillStyle = luz; g.beginPath(); g.moveTo(-28, 30); g.lineTo(28, 30); g.lineTo(120, 245); g.lineTo(-120, 245); g.closePath(); g.fill();
    g.fillStyle = "#1f6b4e"; g.strokeStyle = TINTA; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(-8, 0); g.lineTo(8, 0); g.quadraticCurveTo(12, 8, 18, 12); g.quadraticCurveTo(30, 18, 32, 30); g.lineTo(-32, 30); g.quadraticCurveTo(-30, 18, -18, 12); g.quadraticCurveTo(-12, 8, -8, 0); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.25)"; g.beginPath(); g.ellipse(-14, 18, 6, 9, 0.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fff2c2"; g.beginPath(); g.ellipse(0, 30, 30, 5, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 2; g.stroke();
    g.restore();
  }
  function cuadro(g, t) {
    const a = angCuadro(t), { x, y, w, h } = CUADRO;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.fillStyle = "#2a2027"; g.beginPath(); g.arc(x, y, 2.5, 0, Math.PI * 2); g.fill();
    g.translate(x, y); g.rotate(a);
    g.strokeStyle = "#2a2027"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-w * 0.32, 12); g.lineTo(0, 0); g.lineTo(w * 0.32, 12); g.stroke();
    g.fillStyle = "rgba(0,0,0,0.3)"; g.fillRect(-w / 2 + 4, 14, w, h);
    g.fillStyle = "#b07a3a"; g.strokeStyle = TINTA; g.lineWidth = 2.2; g.fillRect(-w / 2, 10, w, h); g.strokeRect(-w / 2, 10, w, h);
    g.fillStyle = "#1d2b52"; g.fillRect(-w / 2 + 7, 17, w - 14, h - 14); g.lineWidth = 1.4; g.strokeRect(-w / 2 + 7, 17, w - 14, h - 14);
    // trofeo
    g.fillStyle = "#ffcf3a"; g.strokeStyle = TINTA; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(-11, 22); g.lineTo(11, 22); g.quadraticCurveTo(11, 38, 0, 40); g.quadraticCurveTo(-11, 38, -11, 22); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-11, 25); g.quadraticCurveTo(-19, 26, -12, 34); g.moveTo(11, 25); g.quadraticCurveTo(19, 26, 12, 34); g.stroke();
    g.beginPath(); g.rect(-2, 40, 4, 4); g.rect(-8, 44, 16, 4); g.fill(); g.stroke();
    for (const [sx, sy] of [[-20, 22], [19, 40], [-18, 44]]) { g.fillStyle = "#ffe98a"; g.beginPath(); for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4, r = i % 2 ? 1.3 : 3.4; g.lineTo(sx + Math.cos(an) * r, sy + Math.sin(an) * r); } g.closePath(); g.fill(); }
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrella(g, x, y, r, puntas, rot, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function impacto(g, t, t0, q, tam) {
    const k = fase(t, t0, t0 + 0.28); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    estrella(g, q.x, q.y, tam * (0.6 + 0.8 * salida(k)), 10, 0.3, 0.42); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    estrella(g, q.x, q.y, tam * (0.35 + 0.5 * salida(k)), 10, 0.55, 0.5); g.fillStyle = "#ffffff"; g.fill();
    g.strokeStyle = "#ffffff"; g.lineWidth = 2.5; g.lineCap = "round";
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2, r0 = tam * (0.9 + 0.9 * k), r1 = r0 + tam * 0.45; g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * r1, q.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  function salpica(g, t, t0, b) {
    const k = fase(t, t0, t0 + 0.45); if (k <= 0 || k >= 1) return;
    const x = b.x, y = b.y - VASO_H;
    g.save(); g.lineCap = "round";
    // onda en la cerveza
    g.globalAlpha = 1 - k; g.strokeStyle = "#fff4cf"; g.lineWidth = 1.4; g.beginPath(); g.ellipse(x, y + 1.3, 3 + 7 * salida(k), 1 + 1.4 * salida(k), 0, 0, Math.PI * 2); g.stroke();
    // gotas
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (i - 3) * 0.32 + (hash(i + 31) - 0.5) * 0.2, v = 70 + 60 * hash(i + 5), u = k * 0.45;
      const gx = x + Math.cos(a) * v * u, gy = y + Math.sin(a) * v * u + 0.5 * 900 * u * u;
      g.globalAlpha = (1 - k) * 0.95; g.fillStyle = i % 2 ? "#f2b33a" : "#fff4cf"; g.strokeStyle = "rgba(110,60,0,0.6)"; g.lineWidth = 0.8;
      g.beginPath(); g.ellipse(gx, gy, 1.7, 2.2, a + Math.PI / 2, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    g.restore();
  }
  function estela(g, t, f) {      // estela de la bola en vuelo: bolitas fantasma que se desvanecen
    for (let i = 4; i >= 1; i--) {
      const q = f(t - i * 0.022); if (!q) continue;
      g.save(); g.globalAlpha = 0.12 * (5 - i); g.fillStyle = "#ffffff"; g.beginPath(); g.arc(q.x, q.y, RB * (1 - i * 0.12), 0, Math.PI * 2); g.fill(); g.restore();
    }
  }
  function gotasSacude(g, t, pg) {
    const k = fase(t, T.gSube, T.gSacude1 + 0.25); if (k <= 0 || k >= 1) return;
    const b = bolaEnMano(G, poseG(T.gSube + 0.08, true), poseG(T.gSube + 0.08, true).manoLejos);
    g.save();
    for (let i = 0; i < 6; i++) {
      const t0 = T.gSube + i * 0.05, u = t - t0; if (u < 0 || u > 0.35) continue;
      const vx = (hash(i + 3) - 0.5) * 160, vy = -60 - 50 * hash(i + 8);
      g.globalAlpha = 1 - u / 0.35; g.fillStyle = "#f2b33a"; g.strokeStyle = "rgba(110,60,0,0.6)"; g.lineWidth = 0.8;
      g.beginPath(); g.ellipse(b.x + vx * u, b.y + vy * u + 0.5 * 1200 * u * u, 1.6, 2.1, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    g.restore();
  }
  function soplido(g, t, pg) {
    const k = fase(t, T.gSopla, T.gSopla1); if (k <= 0 || k >= 1) return;
    const b = G.aPantalla(pg, G.cabeza(pg).a(P(860, 744)));
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.75 * Math.sin(Math.PI * k)})`; g.lineWidth = 1.5; g.lineCap = "round";
    for (let i = -1; i <= 1; i++) { const x0 = b.x + 4 + 8 * k, y0 = b.y + i * 4; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + 6, y0 + i * 2 - 2, x0 + 12, y0 + i * 3); g.stroke(); }
    g.restore();
  }
  function lineasPalmas(g, t, pa) {
    for (const tc of T.aplausos) {
      const k = fase(t, tc - 0.02, tc + 0.22); if (k <= 0 || k >= 1) continue;
      const q = AN.aPantalla(pa, AN.tronco(pa)(P(300, 430)));
      g.save(); g.strokeStyle = `rgba(255,255,255,${1 - k})`; g.lineWidth = 2; g.lineCap = "round";
      for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * 0.6, r0 = 8 + 8 * k; g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * (r0 + 7), q.y + Math.sin(a) * (r0 + 7)); g.stroke(); }
      g.restore();
    }
  }
  function lineasPtui(g, t, pg) {
    const k = fase(t, T.escupe - 0.02, T.escupe + 0.25); if (k <= 0 || k >= 1) return;
    const q = bocaG(poseG(T.escupe, true));
    g.save(); g.strokeStyle = `rgba(255,255,255,${1 - k})`; g.lineWidth = 2; g.lineCap = "round";
    for (let i = -1; i <= 1; i++) { const a = -0.35 + i * 0.5, r0 = 8 + 10 * k; g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * (r0 + 8), q.y + Math.sin(a) * (r0 + 8)); g.stroke(); }
    // gotitas de saliva
    for (let i = 0; i < 4; i++) { const u = k * 0.25, gx = q.x + (90 + 40 * hash(i)) * u, gy = q.y + (-40 + 50 * hash(i + 4)) * u + 600 * u * u;
      g.fillStyle = `rgba(210,240,255,${1 - k})`; g.beginPath(); g.arc(gx, gy, 1.4, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }

  /* ---------- decorado: sótano de fiesta ---------- */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 100; const g = c.getContext("2d");
    g.translate(40, 50);
    // pared índigo con franjas diagonales pintadas
    const pared = g.createLinearGradient(0, -50, 0, 420); pared.addColorStop(0, "#1c1840"); pared.addColorStop(1, "#33285e");
    g.fillStyle = pared; g.fillRect(-40, -50, W + 80, 480);
    g.save(); g.globalAlpha = 0.55;
    for (const [x0, col, an] of [[-120, "#d6336c", 150], [140, "#f08c00", 90], [410, "#12b886", 120], [690, "#7048e8", 150], [930, "#d6336c", 80]]) {
      g.fillStyle = col; g.beginPath(); g.moveTo(x0, 430); g.lineTo(x0 + an, 430); g.lineTo(x0 + an + 260, -50); g.lineTo(x0 + 260, -50); g.closePath(); g.fill();
    }
    g.restore();
    g.fillStyle = "rgba(10,8,30,0.35)"; g.fillRect(-40, -50, W + 80, 480);
    // textura de bloques
    g.strokeStyle = "rgba(255,255,255,0.05)"; g.lineWidth = 1;
    for (let y = -40; y < 420; y += 32) { g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); const off = (Math.round(y / 32) % 2) ? 0 : 48;
      for (let x = off - 96; x < W + 40; x += 96) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 32); g.stroke(); } }
    // neón: vaso y bola
    g.save(); g.translate(360, 100); g.lineJoin = "round"; g.lineCap = "round";
    const neon = (fn, col, w) => { g.strokeStyle = col; g.lineWidth = w; fn(); g.stroke(); };
    const vasoN = () => { g.beginPath(); g.moveTo(-18, -10); g.lineTo(-12, 26); g.lineTo(12, 26); g.lineTo(18, -10); g.closePath(); g.moveTo(-14, 2); g.lineTo(14, 2); };
    const bolaN = () => { g.beginPath(); g.arc(20, -34, 8, 0, Math.PI * 2); };
    const arcoN = () => { g.beginPath(); g.moveTo(-52, 20); g.quadraticCurveTo(-40, -50, 12, -40); };
    for (const [fn, col] of [[vasoN, "255,70,140"], [bolaN, "255,255,255"], [arcoN, "120,220,255"]]) {
      neon(fn, `rgba(${col},0.18)`, 14); neon(fn, `rgba(${col},0.4)`, 7); neon(fn, `rgba(${col},1)`, 2.6);
    }
    g.restore();
    // estante con torres de vasos y un altavoz (izquierda)
    g.save(); g.translate(40, 230);
    g.fillStyle = "#3b2a22"; g.strokeStyle = TINTA; g.lineWidth = 2.5; g.fillRect(-30, 0, 120, 10); g.strokeRect(-30, 0, 120, 10);
    for (const [x, n] of [[-12, 4], [16, 6], [44, 3]]) for (let i = 0; i < n; i++) {
      const y = -6 - i * 5; g.fillStyle = i === n - 1 ? "#e3202b" : "#c91a25"; g.beginPath(); g.moveTo(x - 9, y - 20); g.lineTo(x - 6.5, y); g.lineTo(x + 6.5, y); g.lineTo(x + 9, y - 20); g.closePath(); g.fill(); g.lineWidth = 1.2; g.stroke();
      g.fillStyle = "#f4f1ea"; g.fillRect(x - 9, y - 21, 18, 2.4); }
    g.fillStyle = "#26232a"; g.fillRect(64, -46, 26, 46); g.strokeRect(64, -46, 26, 46);
    g.fillStyle = "#4a4652"; g.beginPath(); g.arc(77, -15, 9, 0, Math.PI * 2); g.fill(); g.stroke(); g.beginPath(); g.arc(77, -36, 5, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
    // nevera pequeña (derecha)
    g.save(); g.translate(960, 300);
    g.fillStyle = "#d9dde3"; g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.roundRect ? g.roundRect(-38, -10, 76, 140, 8) : g.rect(-38, -10, 76, 140); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-38, 34); g.lineTo(38, 34); g.stroke(); g.fillStyle = "#8d939b"; g.fillRect(24, 4, 5, 22); g.fillRect(24, 44, 5, 34);
    g.fillStyle = "rgba(255,255,255,0.5)"; g.fillRect(-30, 0, 4, 120);
    g.restore();
    // zócalo
    g.fillStyle = "#17142e"; g.fillRect(-40, 420, W + 80, SUELO - 420);
    g.fillStyle = "#4b3f86"; g.fillRect(-40, 416, W + 80, 6);
    // suelo de tarima oscura
    const su = g.createLinearGradient(0, SUELO, 0, H + 50); su.addColorStop(0, "#5b3a2a"); su.addColorStop(1, "#2a1810");
    g.fillStyle = su; g.fillRect(-40, SUELO, W + 80, H + 50 - SUELO);
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 1.6;
    for (const y of [SUELO + 9, SUELO + 22, SUELO + 40]) { g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); }
    for (let i = 0; i < 40; i++) { const y = [SUELO, SUELO + 9, SUELO + 22, SUELO + 40][i % 4], x = (i * 137) % (W + 80) - 40; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + [9, 13, 18, 30][i % 4]); g.stroke(); }
    g.fillStyle = "rgba(255,200,160,0.15)"; g.fillRect(-40, SUELO, W + 80, 2);
    // guirnalda de bombillas
    const bomb = ["#ff6b6b", "#ffd43b", "#69db7c", "#4dabf7", "#da77f2"];
    g.strokeStyle = "#0e0c1c"; g.lineWidth = 1.6; g.beginPath();
    for (let x = -40; x <= W + 40; x += 8) { const y = 18 + 26 * Math.sin(Math.PI * (((x + 40) % 340) / 340)); if (x === -40) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke();
    for (let x = -20, i = 0; x < W + 40; x += 42, i++) { const y = 18 + 26 * Math.sin(Math.PI * (((x + 40) % 340) / 340)) + 6;
      const h2 = g.createRadialGradient(x, y + 4, 1, x, y + 4, 22); h2.addColorStop(0, "rgba(255,240,200,0.35)"); h2.addColorStop(1, "rgba(255,240,200,0)");
      g.fillStyle = h2; g.beginPath(); g.arc(x, y + 4, 22, 0, Math.PI * 2); g.fill();
      g.fillStyle = bomb[i % bomb.length]; g.strokeStyle = TINTA; g.lineWidth = 1.2; g.beginPath(); g.ellipse(x, y + 4, 4.5, 6, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = "#333"; g.fillRect(x - 2.5, y - 3, 5, 4); }
    // mesa de beer pong: tablero azul con líneas blancas y patas plegables
    const { x0, x1, y, fondo: fd } = MESA;
    g.save(); g.lineJoin = "round";
    g.strokeStyle = "#1a1a22"; g.lineWidth = 4; g.lineCap = "round";
    for (const lx of [x0 + 40, x1 - 40]) { g.beginPath(); g.moveTo(lx - 18, y - fd + 12); g.lineTo(lx + 22, SUELO - 6); g.moveTo(lx + 18, y - fd + 12); g.lineTo(lx - 22, SUELO - 6); g.stroke(); }
    g.strokeStyle = "#8d939b"; g.lineWidth = 5;
    for (const lx of [x0 + 26, x1 - 26]) { g.beginPath(); g.moveTo(lx, y + 8); g.lineTo(lx, SUELO); g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = 1.2; for (const lx of [x0 + 26, x1 - 26]) { g.strokeRect(lx - 2.5, y + 8, 5, SUELO - y - 8); }
    g.fillStyle = "#26232a"; g.fillRect(x0, y, x1 - x0, 9); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x0, y, x1 - x0, 9);
    const tab = g.createLinearGradient(0, y - fd, 0, y); tab.addColorStop(0, "#1c3f8f"); tab.addColorStop(1, "#2b5bc7");
    g.fillStyle = tab; g.beginPath(); g.rect(x0, y - fd, x1 - x0, fd); g.fill(); g.lineWidth = 2.2; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 1.6; g.strokeRect(x0 + 6, y - fd + 4, x1 - x0 - 12, fd - 8);
    g.beginPath(); g.moveTo((x0 + x1) / 2, y - fd + 4); g.lineTo((x0 + x1) / 2, y - 4); g.stroke();
    g.beginPath(); g.ellipse((x0 + x1) / 2, y - fd / 2, 26, 8, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "rgba(255,90,90,0.75)"; g.beginPath(); g.moveTo(x0 + 70, y - fd + 5); g.lineTo(x0 + 70, y - 5); g.moveTo(x1 - 70, y - fd + 5); g.lineTo(x1 - 70, y - 5); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(x0 + 8, y - fd + 2, x1 - x0 - 16, 3);
    g.restore();
    for (const b of VASOS) vasoRojo(g, b);
    // viñeta
    const v = g.createRadialGradient(512, 300, 320, 512, 300, 720); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.5)");
    g.fillStyle = v; g.fillRect(-40, -50, W + 80, H + 100);
    return c;
  }

  /* ---------- cámara: se acerca un poco mientras Guillermo se queda con la bola en la boca ---------- */
  function camara(t) { const k = tramo(t, T.boca + 0.05, T.boca + 0.8); return { k: 1 + 0.1 * k, x: 512, y: 300 + 28 * k }; }

  function pose(t) { return { g: poseG(t), a: poseA(t) }; }

  class GuillermoAnderBeerPong extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !AN.listo()) return;
      if (!fondo) fondo = creaFondo();
      if (!GEO) preparaGeo();
      const pg = poseG(t), pa = poseA(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const tb = (t >= T.boca ? 2.5 * Math.exp(-(t - T.boca) * 9) * suave(fase(t, T.boca, T.boca + 0.03)) : 0);
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -40, -50);
      cuadro(g, t);
      lampara(g, t);
      // sombras en el suelo
      g.save(); g.fillStyle = "rgba(0,0,0,0.32)";
      g.beginPath(); g.ellipse(pg.x + 8, SUELO + 1, 80, 7, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pa.x - 4, SUELO + 1, 82, 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
      botella(g, t);
      // bolas dentro de los vasos y salpicones
      const b1 = bola1(t, pa), b2 = bola2(t, pa, pg), b3 = bola3(t, pa);
      for (const b of [b1, b2]) if (b && b.en === "vaso") bolaEnVaso(g, b.vaso, b.q);
      salpica(g, t, T.a1Plop, V_G1); salpica(g, t, T.a2Plop, V_G2); salpica(g, t, T.plopFin, V_A);
      AN.dibujar(g, pa, t);
      G.dibujar(g, pg, t);
      // bolas en la mano, en el aire y en la boca
      const cosas = [[b1, t2 => bola1(t2, poseA(t2, true)).q], [b2, t2 => posBola2(t2, poseA(t2, true), poseG(t2, true))], [b3, null]];
      for (const [b, f] of cosas) {
        if (!b || b.en === "vaso") continue;
        if (b.vel && f) estela(g, t, f);
        bola(g, b.q.x, b.q.y, b.alfa ?? 1);
      }
      gotasSacude(g, t, pg);
      soplido(g, t, pg);
      impacto(g, t, T.lampara, L_TOQUE, 12); impacto(g, t, T.botella, B_TOQUE, 11);
      impacto(g, t, T.cabeza, GEO.coco, 12); impacto(g, t, T.pared, C_TOQUE, 13);
      lineasPalmas(g, t, pa);
      lineasPtui(g, t, pg);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00038", nombre: "Guillermo y Ander · El beer pong", crear: () => new GuillermoAnderBeerPong() });
  window.__A2D_00038 = { pose, T, DUR, geo: () => GEO,
    bolas: t => { if (!GEO) preparaGeo(); const pg = poseG(t), pa = poseA(t); return [bola1(t, pa), bola2(t, pa, pg), bola3(t, pa)].map(b => b && b.q); } };
})();
