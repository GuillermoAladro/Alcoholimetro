"use strict";
/* 00073 · Guillermo y Gabacho · La chilena
 *
 * Negro → una placita tranquila de tarde, con aire parisino: fachadas de piedra crema con
 * balcones de hierro y tejados de zinc, dos plátanos de corteza moteada, un banco verde, una
 * farola, una mesita de café y, al otro lado de la calle (a la derecha), una papelera verde con
 * tapa basculante. Guillermo espera con un pie encima de su balón y las manos en los bolsillos.
 * Gabacho (derecha, mirando a Guillermo) le guiña una ceja, saca las manos y hace toques con su
 * balón: puntera, empeine, rodilla, empeine… y lo levanta alto → CÁMARA LENTA: se agacha, salta,
 * se tumba en el aire hacia atrás, tijera de piernas y ¡chilena! (rastro de fantasmas, líneas
 * de foco congeladas) → el tiempo vuelve de golpe y el balón cruza la calle en un arco perfecto
 * y entra en la papelera (la tapa bascula, se balancea y se para; sale una nubecilla y una hoja).
 * Gabacho cae de pie, agachado y con los brazos abiertos, se levanta y se queda en pose de «voilà».
 * Guillermo, boquiabierto, mira a cámara, se pica, y Gabacho le cede el turno con la mano.
 * Guillermo hace rodar su balón hacia atrás con la suela, lo levanta de cuchara… y el balón se va
 * al cielo (fuera de cuadro). Mira a cámara muy chulo, salta, se tumba solo a medias y se queda
 * **suspendido en horizontal**, mirando a cámara, buscando el balón… y cae de espaldas (¡pum!).
 * Suspira… ve llegar el balón del cielo: le cae en la barriga (¡boing!), rebota y le cae en la cara,
 * donde se queda un momento antes de rodar al suelo (le deja la marca roja). Ojos en espiral y
 * estrellitas; Guillermo levanta la mano, flojito. Gabacho aplaude despacio y mira a cámara → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto. La cámara lenta es una deformación del tiempo:
 * τ(t) (tiempo de la acción) avanza más despacio entre CL.a1 y CL.b0; personajes, balones y
 * papelera se mueven con τ; los efectos (fundidos, líneas, temblores) con t.
 * Los cuerpos que giran en el aire (la chilena, la caída) se dibujan girando el lienzo alrededor
 * de la pelvis; los contactos del balón se calculan con ese mismo giro.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, GB = Gabacho;
  const S = 0.29, SUELO = 560, XG = 290, XB = 640, DUR = 14.3;
  const GRAV = 1700, RB = 18, TINTA = "#0b0a0e", TAU = Math.PI * 2;
  const P = (x, y) => ({ x, y });
  const rotP = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const muHacia = (m, h, extra = 0) => Math.atan2(h.y - m.y, h.x - m.x) + extra;

  /* ---------- cámara lenta: τ(t) ---------- */
  const CL = { a0: 2.72, a1: 2.88, b0: 4.12, b1: 4.27, r: 0.35 };
  const rampa = u => u * u * u - u * u * u * u / 2;              // ∫ de suave (vale 0,5 en 1)
  function tau(t) {
    const { a0, a1, b0, b1, r } = CL;
    if (t <= a0) return t;
    if (t <= a1) { const u = (t - a0) / (a1 - a0); return a0 + (a1 - a0) * (u - (1 - r) * rampa(u)); }
    const A1 = a0 + (a1 - a0) * (1 - (1 - r) * 0.5);
    if (t <= b0) return A1 + r * (t - a1);
    const B0 = A1 + r * (b0 - a1);
    if (t <= b1) { const u = (t - b0) / (b1 - b0); return B0 + (b1 - b0) * (r * u + (1 - r) * rampa(u)); }
    return B0 + (b1 - b0) * (r + (1 - r) * 0.5) + (t - b1);
  }
  function real(a) { let x = 0, y = DUR + 2; for (let i = 0; i < 48; i++) { const m = (x + y) / 2; if (tau(m) < a) x = m; else y = m; } return (x + y) / 2; }
  const lenta = t => tramo(t, CL.a0, CL.a1 + 0.05) * (1 - tramo(t, CL.b0 - 0.02, CL.b1));

  /* ---------- guion (tiempo real) ---------- */
  const T = {
    mira: 0.4, manos: 0.62, flick: 1.0, t1: 1.38, rod: 1.74, pop: 2.12, kick: 4.09,
    gBoca: 2.9, gSigue: 4.2, gCamara: 5.4, gPique: 5.85, ofrece: 6.0, bolsillos: 6.75,
    rueda0: 6.25, rueda1: 6.5, cuchara: 6.7, gArriba: 6.74, gChulo: 7.05, agacha: 7.38, salta: 7.5, horiz: 7.8,
    busca: 8.12, cae0: 8.5, pum: 8.66, alivio: 8.74, ve: 8.98, barriga: 9.14, cara: 9.82, rueda: 10.6, suelo: 11.02, para: 11.8,
    mano0: 11.5, mano1: 12.35, gFin: 12.6,
    bMueca: 8.62, aplauso0: 10.4, aplausos: [10.95, 11.5, 12.05, 12.6], bCamara: 12.85,
    fin: 13.5
  };
  const U = {}; for (const k in T) U[k] = Array.isArray(T[k]) ? T[k].map(tau) : tau(T[k]);
  // la chilena (en tiempo de la acción, alrededor del contacto)
  const TK = U.kick;
  const KB = { agacha: TK - 0.53, despega: TK - 0.38, contacto: TK, aterriza: TK + 0.47, sube: TK + 0.62, tada: TK + 0.98, papelera: TK + 0.9 };
  const KR = {}; for (const k in KB) KR[k] = real(KB[k]);
  const PHI_B = 1.98;                                   // giro máximo de Gabacho en la chilena (≈ 113°)

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  // claves [t, valores…] con interpolación suave entre cada par
  function claves(lista, t) {
    if (t <= lista[0][0]) return lista[0].slice(1);
    for (let i = 1; i < lista.length; i++) if (t < lista[i][0]) {
      const a = lista[i - 1], b = lista[i], f = b.f || suave, k = f(fase(t, a[0], b[0]));
      return a.slice(1).map((v, j) => lerp(v, b[j + 1], k));
    }
    return lista[lista.length - 1].slice(1);
  }
  const K = (arr, f) => { arr.f = f; return arr; };
  // tramos de parábola entre puntos [t, punto]
  function vuelo(lista, t, grav = GRAV) {
    for (let i = 0; i < lista.length - 1; i++) {
      const [t0, a] = lista[i], [t1, b] = lista[i + 1];
      if (t <= t1 || i === lista.length - 2) {
        const d = t1 - t0, u = clamp(t - t0, 0, d), vx = (b.x - a.x) / d, vy0 = (b.y - a.y) / d - 0.5 * grav * d;
        return { x: a.x + vx * u, y: a.y + vy0 * u + 0.5 * grav * u * u, i };
      }
    }
    return null;
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const CERO = { pulgar: 0, indice: 0, medio: 0, anular: 0, menique: 0 };
  const todos = k => ({ pulgar: k, indice: k, medio: k, anular: k, menique: k });
  const mezD = (a, b, k) => { const d = {}; for (const n in a) d[n] = lerp(a[n], b[n], k); return d; };

  /* ---------- giro de todo el cuerpo alrededor de la pelvis ---------- */
  function ponGiro(R, p, phi, dx, dy) { p.o = R.aPantalla(p, p.pelvis); p.gr = { phi, dx, dy }; }
  function enGiro(p, q) {
    const gr = p.gr, o = p.o; if (!gr) return q;
    const c = Math.cos(gr.phi), s = Math.sin(gr.phi), dx = q.x - o.x, dy = q.y - o.y;
    return { x: o.x + gr.dx + dx * c - dy * s, y: o.y + gr.dy + dx * s + dy * c };
  }
  const pant = (R, p, q) => enGiro(p, R.aPantalla(p, q));
  // dirección de la hoja → pantalla (espejo y giro)
  const dirPant = (p, n) => rotP({ x: n.x * (p.espejo ? -1 : 1), y: n.y }, p.gr ? p.gr.phi : 0);
  function dibuja(R, g, p, t) {
    const gr = p.gr, o = p.o;
    g.save();
    if (gr && (Math.abs(gr.phi) > 1e-5 || Math.abs(gr.dx) > 0.01 || Math.abs(gr.dy) > 0.01)) { g.translate(o.x + gr.dx, o.y + gr.dy); g.rotate(gr.phi); g.translate(-o.x, -o.y); }
    R.dibujar(g, p, t);
    g.restore();
  }
  // pierna en el marco del cuerpo: f = 0 abajo, + hacia delante; k = fracción del largo
  function piernaF(R, p, lado, f, k, punta) {
    const cad = R.tronco(p)(R.CADERA[lado]), L = R.A.datos.piezas["pierna_" + lado].largo * k;
    return { tob: P(cad.x + Math.sin(f) * L, cad.y + Math.cos(f) * L), ang: -f + punta };
  }
  const mezPie = (a, b, k) => ({ tob: mezcla(a.tob, b.tob, k), ang: lerp(a.ang, b.ang, k) });
  // la mirada sigue a un punto de la pantalla (con espejo y giro)
  function miraA(R, p, q, ojo, w) {
    if (!q || w <= 0) return;
    const o = pant(R, p, R.cabeza(p).a(ojo));
    let d = rotP(P(q.x - o.x, q.y - o.y), -(p.gr ? p.gr.phi : 0) - p.cabeza.ang * 0.6);
    if (p.espejo) d.x = -d.x;
    const n = Math.hypot(d.x, d.y) || 1;
    p.cara.mirada = mezcla(p.cara.mirada, P(clamp(d.x / n * 1.1, -1, 1), clamp(d.y / n * 1.1, -1, 1)), w);
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
  const CARAS_B = {
    inicio: E({ mx: 0.6, my: 0.5, c: 0.15, sd: 2, si: 4, sonr: 0.45, ancho: 0.9 }),
    chulo: E({ mx: 0.85, my: 0.1, c: 0.25, sd: -2, si: 18, gi: 0.12, sonr: 0.7 }),
    juega: E({ c: 0.1, sd: 4, si: 6, sonr: 0.5, ancho: 0.95 }),
    concentra: E({ c: 0.1, sd: -4, gd: -0.08, si: -2, abre: 6, ancho: 0.7, sonr: 0.15 }),
    remate: E({ c: 0.15, sd: -8, gd: -0.14, si: -8, gi: -0.12, abre: 16, ancho: 0.8, sonr: -0.1 }),
    aterriza: E({ c: 0.3, sd: 4, si: 6, abre: 4, sonr: 0.45 }),
    tada: E({ c: 1, h: 0.9, sd: 16, si: 18, abre: 22, ancho: 1.05, sonr: 1 }),
    ofrece: E({ c: 0.2, sd: 8, si: 18, gi: 0.1, abre: 6, sonr: 0.75 }),
    mira: E({ c: 0.1, sd: 6, si: 8, sonr: 0.35 }),
    cejas: E({ iris: 0.9, sd: 22, gd: 0.05, si: 24, gi: 0.05, abre: 10, ancho: 0.6, sonr: 0.05 }),
    mueca: E({ c: 0.85, z: 1, sd: -6, gd: -0.14, si: -6, gi: -0.14, abre: 14, ancho: 1.1, sonr: -0.6 }),
    aplaude: E({ c: 0.3, h: 0.6, sd: 10, si: 12, abre: 8, ancho: 1, sonr: 0.75 }),
    camara: E({ mx: -0.85, my: -0.1, c: 0.25, h: 0.4, sd: 4, si: 20, gi: 0.12, abre: 4, sonr: 0.85 })
  };
  const GUION_CARA_B = [
    [0.25, 0.5, "chulo"], [T.manos + 0.1, T.manos + 0.3, "juega"], [U.pop - 0.1, U.pop + 0.05, "concentra"],
    [KB.contacto - 0.2, KB.contacto - 0.05, "remate"], [KB.contacto + 0.2, KB.aterriza, "aterriza"], [KB.tada - 0.15, KB.tada + 0.1, "tada"],
    [U.ofrece - 0.1, U.ofrece + 0.15, "ofrece"], [U.bolsillos, U.bolsillos + 0.3, "mira"], [U.horiz - 0.05, U.horiz + 0.15, "cejas"],
    [U.bMueca, U.bMueca + 0.08, "mueca"], [U.barriga + 0.25, U.barriga + 0.45, "cejas"], [U.cara - 0.02, U.cara + 0.06, "mueca"],
    [U.aplauso0, U.aplauso0 + 0.3, "aplaude"], [U.bCamara, U.bCamara + 0.25, "camara"]
  ];
  const CARAS_G = {
    inicio: E({ mx: 0.85, my: 0.15, c: 0.2, sd: 4, si: -2, gi: -0.05, sonr: 0.45 }),
    sigue: E({ sd: 10, si: 8, abre: 4, ancho: 0.62, sonr: 0.15 }),
    asombro: E({ iris: 0.9, sd: 22, gd: 0.06, si: 20, abre: 34, ancho: 0.75, sonr: -0.05 }),
    pasmo: E({ mx: -0.8, my: -0.1, iris: 0.85, sd: 24, gd: 0.08, si: 24, abre: 40, ancho: 0.8, sonr: -0.1 }),
    pique: E({ mx: 0.85, c: 0.3, sd: -10, gd: -0.22, si: -10, gi: -0.22, abre: 4, ancho: 0.8, sonr: -0.15 }),
    concentra: E({ my: 0.6, c: 0.25, sd: -8, gd: -0.18, si: -6, gi: -0.15, abre: 7, ancho: 0.7, sonr: 0.1, lengua: 0.9 }),
    arriba: E({ mx: 0.1, my: -1, iris: 0.85, sd: 20, si: 20, abre: 10, ancho: 0.6, sonr: 0.2 }),
    chulo: E({ mx: -0.85, my: -0.15, c: 0.3, sd: 14, gd: 0.14, si: -2, gi: -0.05, sonr: 0.65 }),
    esfuerzo: E({ mx: 0.4, my: -0.6, c: 0.5, z: 0.5, sd: -8, gd: -0.15, si: -8, abre: 16, ancho: 0.9, sonr: -0.2 }),
    colgado: E({ mx: -0.85, my: 0, iris: 0.85, sd: 22, gd: 0.12, si: 22, gi: 0.12, abre: 8, ancho: 0.55, sonr: -0.1 }),
    busca: E({ mx: 0.7, my: -0.3, iris: 0.85, sd: 22, si: 22, abre: 8, ancho: 0.55, sonr: -0.1 }),
    pum: E({ c: 1, z: 1, sd: -10, gd: -0.2, si: -10, gi: -0.2, abre: 20, ancho: 0.65, sonr: -0.6 }),
    alivio: E({ mx: 0, my: -0.4, c: 0.9, h: 0.6, sd: 8, gd: 0.05, si: 8, gi: 0.05, abre: 16, ancho: 0.7, sonr: 0.35 }),
    ve: E({ mx: 0.85, my: 0, iris: 0.95, sd: 14, si: 14, abre: 4, ancho: 0.7, sonr: 0 }),
    panico: E({ mx: 0.85, my: 0, iris: 0.7, sd: 28, gd: 0.25, si: 28, gi: 0.25, abre: 30, ancho: 1.05, sonr: -0.75 }),
    boing: E({ mx: 0.85, my: -0.2, iris: 0.6, sd: 30, gd: 0.2, si: 30, gi: 0.2, abre: 8, ancho: 0.6, sonr: -0.3, mof: 1 }),
    golpe: E({ c: 1, z: 1, sd: -10, gd: -0.2, si: -10, gi: -0.2, abre: 18, ancho: 0.62, sonr: -0.6 }),
    mareo: E({ esp: 0.9, sd: 8, si: 4, abre: 16, ancho: 0.8, sonr: -0.25, lengua: 0.6 }),
    debil: E({ mx: -0.6, esp: 0.45, c: 0.35, sd: 6, gd: 0.1, si: 2, abre: 8, ancho: 0.8, sonr: 0.3 }),
    camara: E({ mx: -0.85, my: -0.1, esp: 0.15, c: 0.35, h: 0.3, sd: 10, gd: 0.1, si: 4, abre: 6, ancho: 0.8, sonr: 0.4 })
  };
  const GUION_CARA_G = [
    [0.8, 1.1, "sigue"], [U.gBoca, U.kick, "asombro", suave], [U.gCamara, U.gCamara + 0.2, "pasmo"], [U.gPique, U.gPique + 0.2, "pique"],
    [U.rueda0, U.rueda0 + 0.2, "concentra"], [U.gArriba, U.gArriba + 0.15, "arriba"], [U.gChulo, U.gChulo + 0.18, "chulo"],
    [U.agacha, U.salta, "esfuerzo"], [U.horiz - 0.05, U.horiz + 0.1, "colgado"], [U.busca, U.busca + 0.1, "busca"], [U.busca + 0.3, U.busca + 0.4, "colgado"],
    [U.pum - 0.03, U.pum + 0.02, "pum"], [U.alivio, U.alivio + 0.15, "alivio"], [U.ve, U.ve + 0.08, "ve"], [U.ve + 0.1, U.ve + 0.16, "panico"],
    [U.barriga - 0.01, U.barriga + 0.04, "boing"], [U.barriga + 0.3, U.barriga + 0.4, "panico"], [U.cara - 0.01, U.cara + 0.04, "golpe"],
    [U.rueda + 0.1, U.rueda + 0.35, "mareo"], [U.mano0, U.mano0 + 0.3, "debil"], [U.gFin, U.gFin + 0.3, "camara"]
  ];

  /* =====================================================================================
   * GABACHO
   * ===================================================================================== */
  const TOB_B = GB.SUELO - GB.TOBILLO_ALTO;
  const PIE_B_L = P(GB.PELVIS.x + 95, TOB_B - 6);
  const PIES_B = {
    de: { a: { x: GB.PELVIS.x - 80, y: TOB_B, ang: 0 } },
    flick: { a: { x: GB.PELVIS.x + 92, y: TOB_B + 8, ang: -0.18 } },
    pie: { r: { x: 150, y: 400, ang: 0.22 } },
    medio: { r: { x: 105, y: 470, ang: 0.1 } },
    rodilla: { r: { x: 250, y: 345, ang: 0.42 } },
    alto: { r: { x: 215, y: 330, ang: -0.1 } },
    agacha: { a: { x: GB.PELVIS.x - 55, y: TOB_B, ang: 0 } }
  };
  const GUION_PIE_B = [
    [U.flick - 0.3, U.flick, "flick"], [U.flick + 0.03, U.t1, "pie"], [U.t1 + 0.03, U.t1 + 0.2, "medio"], [U.t1 + 0.22, U.rod, "rodilla"],
    [U.rod + 0.04, U.rod + 0.2, "medio"], [U.rod + 0.21, U.pop, "pie"],
    [U.pop + 0.01, U.pop + 0.08, "alto", salida], [U.pop + 0.12, U.pop + 0.4, "de"], [KB.agacha - 0.06, KB.agacha + 0.04, "agacha"]
  ];
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
  // piernas en el aire: [τ, f, k, punta] (f = 0 abajo, + delante)
  const AIRE_B = {
    cerca: [[KB.despega, 0.1, 0.8, 0.2], [KB.despega + 0.12, 0.3, 0.72, 0.5], [KB.contacto - 0.15, 0.35, 0.74, 0.7],
      K([KB.contacto, 1.78, 1.0, 1.0], k => Math.pow(k, 1.7)), K([KB.contacto + 0.13, 2.15, 1.0, 0.9], salida), [KB.aterriza - 0.05, 0.12, 0.8, 0.2]],
    lejos: [[KB.despega, -0.05, 0.85, 0.2], [KB.despega + 0.14, 0.9, 0.92, 0.6], [KB.contacto - 0.13, 1.6, 0.96, 0.85],
      K([KB.contacto + 0.05, 0.55, 0.9, 0.6], k => Math.pow(k, 1.5)), [KB.aterriza - 0.05, -0.08, 0.82, 0.1]]
  };
  function giroB(a) {
    let phi = 0, dy = 0;
    if (a > KB.despega && a < KB.aterriza) {
      const Ta = KB.aterriza - KB.despega, u = a - KB.despega, gb = 1000, v0 = 0.5 * gb * Ta;
      dy = -(v0 * u - 0.5 * gb * u * u);
      const sube = suave5(fase(a, KB.despega + 0.02, KB.contacto - 0.05)), baja = suave(fase(a, KB.contacto + 0.07, KB.aterriza - 0.02));
      phi = PHI_B * sube * (1 - baja) + 0.05 * campana(a, KB.contacto - 0.06, KB.contacto + 0.1);
    }
    return { phi, dy };
  }
  const CD0 = { dx: 0, pel: 0, torso: 0.02, cab: 0.06, hom: 0 };
  const CD = o => Object.assign({}, CD0, o);
  const CUERPOS_B = {
    base: CD({ cab: 0.12 }), mira: CD({ torso: 0.04, cab: 0.16 }), flick: CD({ pel: 22, torso: 0.06, cab: 0.2 }),
    pie: CD({ pel: 10, torso: -0.04, cab: 0.14 }), rodilla: CD({ pel: 8, torso: -0.06, cab: 0.08 }), pop: CD({ pel: 6, torso: -0.1, cab: -0.12 }),
    arriba: CD({ pel: 14, torso: -0.08, cab: -0.34 }),
    agacha: CD({ pel: 75, torso: -0.12, cab: -0.22 }), aire: CD({ pel: 0, torso: 0.16, cab: 0.32 }),
    aterriza: CD({ pel: 70, torso: 0.22, cab: -0.12 }), erguido: CD({ pel: 0, torso: -0.04, cab: 0.0 }),
    tada: CD({ pel: -6, torso: -0.1, cab: -0.24, hom: 0.6 }), ofrece: CD({ pel: 4, torso: 0.1, cab: 0.1 }),
    mira2: CD({ torso: 0.02, cab: 0.12 }), encoge: CD({ torso: -0.05, cab: -0.1, hom: 0.8 }), aplaude: CD({ torso: 0.04, cab: 0.06 }),
    camara: CD({ torso: 0.0, cab: -0.05 })
  };
  const GUION_CUERPO_B = [
    [0.35, 0.6, "mira"], [U.flick - 0.3, U.flick, "flick"], [U.flick + 0.05, U.t1, "pie"], [U.t1 + 0.25, U.rod, "rodilla"],
    [U.rod + 0.1, U.pop - 0.12, "pie"], [U.pop - 0.12, U.pop, "pop"], [U.pop + 0.1, U.pop + 0.45, "arriba"], [KB.agacha, KB.despega, "agacha"], [KB.despega, KB.despega + 0.14, "aire"],
    [KB.aterriza - 0.04, KB.aterriza + 0.08, "aterriza", salida], [KB.sube, KB.sube + 0.3, "erguido"], [KB.tada - 0.15, KB.tada + 0.1, "tada"],
    [U.ofrece - 0.1, U.ofrece + 0.2, "ofrece"], [U.bolsillos, U.bolsillos + 0.35, "mira2"], [U.bMueca, U.bMueca + 0.1, "encoge"],
    [U.barriga + 0.3, U.barriga + 0.5, "mira2"], [U.cara - 0.02, U.cara + 0.1, "encoge"], [U.aplauso0, U.aplauso0 + 0.35, "aplaude"],
    [U.bCamara, U.bCamara + 0.3, "camara"]
  ];
  const BOLS_B = { cerca: null, lejos: null };
  function poseB(a, geo = false) {
    const b = guion(GUION_CUERPO_B, CUERPOS_B, "base", a);
    const respira = Math.sin(a * 2.1 + 0.7);
    let toque = 0; for (const tc of [U.t1, U.rod]) toque += campana(a, tc - 0.05, tc + 0.25);
    const tadaBote = campana(a, KB.tada - 0.1, KB.tada + 0.5);
    let asiente = 0; for (const tc of U.aplausos) asiente += 0.035 * campana(a, tc - 0.15, tc + 0.3);
    const p = { x: XB, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, ikContinuo: false,
      pelvis: P(GB.PELVIS.x + b.dx, GB.PELVIS.y + b.pel + respira * 1.1 + 3 * toque - 8 * tadaBote), torso: b.torso,
      torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.02 * b.hom }, piernas: {},
      cabeza: { ang: b.cab + 0.04 * toque + asiente, dx: 0, dy: -8 * b.hom, esc: { x: 1, y: 1 } } };
    // piernas de pie (antes del salto y después de caer)
    const pieC = guionPie(GB, p, "cerca", PIES_B, GUION_PIE_B, Math.min(a, KB.despega));
    let pc = { tob: P(pieC.x, pieC.y), ang: pieC.ang }, pl = { tob: PIE_B_L, ang: 0 };
    const caeC = { tob: P(GB.PELVIS.x - 85, TOB_B), ang: 0 }, caeL = { tob: P(GB.PELVIS.x + 120, TOB_B - 6), ang: 0 };
    if (a > KB.aterriza - 0.06) {
      const vuelve = suave(fase(a, KB.sube + 0.05, KB.sube + 0.45));
      pc = mezPie(caeC, { tob: P(GB.PELVIS.x - 75, TOB_B), ang: 0 }, vuelve); pl = mezPie(caeL, { tob: PIE_B_L, ang: 0 }, vuelve);
    }
    // en el aire
    const enAire = tramo(a, KB.despega, KB.despega + 0.1) * (1 - tramo(a, KB.aterriza - 0.07, KB.aterriza));
    if (enAire > 0) {
      const [fc, kc, uc] = claves(AIRE_B.cerca, a), [fl, kl, ul] = claves(AIRE_B.lejos, a);
      pc = mezPie(pc, piernaF(GB, p, "cerca", fc, kc, uc), enAire);
      pl = mezPie(pl, piernaF(GB, p, "lejos", fl, kl, ul), enAire);
    }
    p.piernas.cerca = pc; p.piernas.lejos = pl;
    const gi = giroB(a); ponGiro(GB, p, gi.phi, 0, gi.dy);
    // cara
    const e = guion(GUION_CARA_B, CARAS_B, "inicio", a);
    p.cara = cara(e, parpadeo(a, [1.6, KB.sube + 0.3, U.ofrece + 0.5, U.bolsillos + 0.9, U.alivio + 0.2, U.rueda + 0.3, U.aplausos[1] + 0.2, U.bCamara + 0.6]));
    // manos
    const Tr = GB.tronco(p), hc = Tr(GB.HOMBRO_C), hl = Tr(GB.HOMBRO);
    const bC = Tr(GB.BOLSILLO_C), bL = Tr(GB.BOLSILLO_L);
    const enBC = { x: bC.x, y: bC.y, ang: 0, mu: -1.75, puno: 0, dedos: CERO, dobla: -1 };
    const enBL = { x: bL.x, y: bL.y, ang: 0, mu: -1.75, puno: 0, dedos: CERO, dobla: 1 };
    const R = (dx, dy, o = {}) => Object.assign({ dx, dy, puno: 1, dedos: todos(0.45), ang: 0 }, o);
    // posiciones de las manos respecto a su hombro: [τ, {dx, dy, …}]
    const balC = R(-95, 250), balL = R(100, 235);
    const listaC = [
      [T.manos, T.manos + 0.3, balC], [KB.agacha, KB.despega, R(-130, 240)], [KB.despega + 0.02, KB.despega + 0.16, R(-200, 60, { dedos: todos(1) })],
      [KB.contacto - 0.15, KB.contacto, R(-175, -30, { dedos: todos(1) })], [KB.contacto + 0.1, KB.aterriza, R(-185, 160, { dedos: todos(1) })],
      [KB.sube, KB.sube + 0.25, R(-110, 210)], [KB.tada - 0.18, KB.tada + 0.05, R(-235, 40, { dedos: todos(1) })],
      [U.ofrece - 0.1, U.ofrece + 0.2, R(-95, 250)], [U.bolsillos, U.bolsillos + 0.3, "bolsillo"],
      [U.aplauso0, U.aplauso0 + 0.4, "palma"]
    ];
    const listaL = [
      [T.manos + 0.05, T.manos + 0.35, balL], [KB.agacha, KB.despega, R(-40, 260)], [KB.despega + 0.02, KB.despega + 0.16, R(200, 30, { dedos: todos(1) })],
      [KB.contacto - 0.15, KB.contacto, R(165, -70, { dedos: todos(1) })], [KB.contacto + 0.1, KB.aterriza, R(195, 140, { dedos: todos(1) })],
      [KB.sube, KB.sube + 0.25, R(110, 210)], [KB.tada - 0.15, KB.tada + 0.08, R(245, 20, { dedos: todos(1) })],
      [U.ofrece - 0.05, U.ofrece + 0.25, R(235, 95, { dedos: todos(1) })], [U.bolsillos + 0.05, U.bolsillos + 0.35, "bolsillo"],
      [U.aplauso0 + 0.05, U.aplauso0 + 0.45, "palma"]
    ];
    const palC = Tr(P(215, 450)), palL = Tr(P(375, 440)), junta = Tr(P(298, 438));
    const fin = (lado, d) => {
      if (d === "bolsillo") return lado === "cerca" ? enBC : enBL;
      const h = lado === "cerca" ? hc : hl;
      if (d === "palma") return lado === "cerca" ? { x: palC.x, y: palC.y, ang: 0, mu: 1.65, puno: 1, dedos: todos(1), dobla: -1 } : { x: palL.x, y: palL.y, ang: 0, mu: 1.45, puno: 1, dedos: todos(1), dobla: 1 };
      const m = P(h.x + d.dx, h.y + d.dy);
      return { x: m.x, y: m.y, ang: d.ang, mu: muHacia(m, h, lado === "cerca" ? -0.15 : 0.15), puno: d.puno, dedos: d.dedos, dobla: lado === "cerca" ? -1 : 1 };
    };
    const mezM = (x, y, k) => ({ x: lerp(x.x, y.x, k), y: lerp(x.y, y.y, k), ang: lerp(x.ang, y.ang, k), mu: lerp(x.mu, y.mu, k), puno: lerp(x.puno, y.puno, k), dedos: mezD(x.dedos, y.dedos, k), dobla: y.dobla });
    const ruta = (lista, lado, ini) => { let m = ini; for (const [t0, t1, d] of lista) { if (a <= t0) break; m = mezM(m, fin(lado, d), suave(fase(a, t0, t1))); } return m; };
    const C = ruta(listaC, "cerca", enBC), L = ruta(listaL, "lejos", enBL);
    // equilibrio mientras hace toques
    const equi = tramo(a, T.manos + 0.2, T.manos + 0.4) * (1 - tramo(a, KB.agacha - 0.1, KB.agacha));
    C.y += 18 * Math.sin(a * 5.3) * equi; L.y += 16 * Math.sin(a * 4.7 + 1.3) * equi; C.x -= 10 * toque; L.x += 12 * toque;
    // aleteo en el aire
    const ale = tramo(a, KB.despega, KB.despega + 0.1) * (1 - tramo(a, KB.contacto + 0.1, KB.aterriza));
    C.y += 14 * Math.sin(a * 9) * ale; L.y += 12 * Math.sin(a * 8 + 1) * ale;
    // aplausos lentos
    for (const tc of U.aplausos) {
      const k = Math.pow(campana(a, tc - 0.24, tc + 0.24), 0.7);
      C.x = lerp(C.x, junta.x - 17, k); C.y = lerp(C.y, junta.y + 2, k); L.x = lerp(L.x, junta.x + 17, k); L.y = lerp(L.y, junta.y, k);
    }
    p.manoCerca = C; p.manoLejos = L;
    if (!geo && GEO) {
      const q = balonB(a);
      const w = tramo(a, 0.9, 1.1) * (1 - tramo(a, KB.contacto + 0.05, KB.contacto + 0.25));
      miraA(GB, p, q, OJO_B, clamp(w));
      const pg = poseG(a, true);
      const vG = tramo(a, U.bolsillos, U.bolsillos + 0.3) * (1 - tramo(a, U.aplauso0 + 0.4, U.aplauso0 + 0.7)) + tramo(a, U.aplausos[1] - 0.3, U.aplausos[1]) * (1 - tramo(a, U.bCamara - 0.05, U.bCamara + 0.2));
      if (vG > 0) miraA(GB, p, pant(G, pg, G.cabeza(pg).a(P(800, 560))), OJO_B, clamp(vG) * 0.9);
    }
    return p;
  }
  const OJO_B = P(830, 500);

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const XBG0 = 362, XBG1 = 334;                       // balón de Guillermo: bajo la suela y tras rodarlo hacia atrás
  const R_MG = G.MUNECA_R * G.JK;
  const desdeMuneca = (w, ang, mu) => { const o = rotP({ x: Math.cos(mu) * R_MG, y: Math.sin(mu) * R_MG }, ang); return { x: w.x - o.x, y: w.y - o.y }; };
  const BOLS_G_C = desdeMuneca(P(131, 652), 0, -1.75), BOLS_G_L = desdeMuneca(P(372, 648), 0, -1.75);
  function tobDesdeSuela(R, p, q, ang, cx, alto) { const h = R.aHoja(p, q), o = rotP({ x: cx, y: alto }, ang); return { tob: { x: h.x - o.x, y: h.y - o.y }, ang }; }
  const AIRE_G = P(XG + 22, 392), LYG = SUELO - 38, LXG = XG + 40;
  // posición del balón de Guillermo mientras está en el suelo, antes de la cuchara
  function balonSueloG(a) { const k = suave(fase(a, U.rueda0, U.rueda1)); return P(lerp(XBG0, XBG1, k), SUELO - RB); }
  const AIRE_G_P = {
    cerca: [[U.salta, 0.05, 0.85, 0.2], [U.salta + 0.12, 0.7, 0.9, 0.5], [U.horiz, -0.08, 0.98, 0.2], [U.cae0, -0.06, 0.98, 0.2], [U.pum, 0.07, 0.97, 0.15]],
    lejos: [[U.salta, 0.0, 0.85, 0.2], [U.salta + 0.12, 1.0, 0.93, 0.6], [U.horiz, 0.08, 0.98, 0.3], [U.cae0, 0.1, 0.98, 0.3], [U.pum, 0.1, 0.97, 0.2]]
  };
  const CG0 = { pel: 0, torso: 0.03, cab: 0, hom: 0 };
  const CG = o => Object.assign({}, CG0, o);
  const CUERPOS_G = {
    base: CG({ cab: 0.02 }), sigue: CG({ torso: 0.02, cab: -0.04 }), asombro: CG({ torso: -0.05, cab: -0.1, pel: -4 }),
    camara: CG({ torso: -0.02, cab: -0.04 }), pique: CG({ torso: 0.06, cab: 0.08, hom: 0.5 }), rueda: CG({ pel: 10, torso: 0.06, cab: 0.16 }),
    cuchara: CG({ pel: 8, torso: -0.08, cab: -0.05 }), arriba: CG({ pel: 2, torso: -0.1, cab: -0.36 }), chulo: CG({ torso: -0.02, cab: -0.06, hom: 0.3 }),
    agacha: CG({ pel: 70, torso: 0.1, cab: -0.1 }), aire: CG({ pel: 0, torso: 0.05, cab: 0.1 }), tumbado: CG({ torso: 0, cab: 0.06 }),
    mira: CG({ torso: 0.1, cab: 0.18 })
  };
  const GUION_CUERPO_G = [
    [0.8, 1.1, "sigue"], [U.gBoca, U.kick, "asombro"], [U.gCamara, U.gCamara + 0.25, "camara"], [U.gPique, U.gPique + 0.25, "pique"],
    [U.rueda0 - 0.1, U.rueda0 + 0.1, "rueda"], [U.cuchara - 0.1, U.cuchara + 0.02, "cuchara", salida], [U.gArriba, U.gArriba + 0.2, "arriba"],
    [U.gChulo, U.gChulo + 0.2, "chulo"], [U.agacha, U.salta, "agacha"], [U.salta, U.salta + 0.14, "aire"], [U.cae0, U.pum, "tumbado"],
    [U.ve - 0.05, U.ve + 0.12, "mira"], [U.barriga, U.barriga + 0.06, "tumbado", salida]
  ];
  function giroG(a) {
    if (a <= U.salta) return null;
    const k = salida(fase(a, U.salta, U.horiz));
    let phi = -Math.PI / 2 * k, x = AIRE_G.x, y = AIRE_G.y;
    // suspendido: un vaivén mínimo
    const fl = tramo(a, U.horiz, U.horiz + 0.12) * (1 - fase(a, U.cae0, U.cae0 + 0.03));
    y += 2.5 * Math.sin((a - U.horiz) * 8) * fl; phi += 0.025 * Math.sin((a - U.horiz) * 6.5) * fl;
    const c = entrada(fase(a, U.cae0, U.pum));
    x = lerp(x, LXG, c); y = lerp(y, LYG, c); phi = lerp(phi, -Math.PI / 2, c);
    if (a > U.pum) { const r = Math.exp(-(a - U.pum) * 10) * Math.sin((a - U.pum) * 24); y -= 6 * Math.max(0, r); }
    y += 3 * aplastaB(a);
    return { k, phi, x, y };
  }
  // hundimiento de la barriga cuando le cae el balón
  function aplastaB(a) { return a >= U.barriga ? Math.exp(-(a - U.barriga) * 7) * Math.abs(Math.cos((a - U.barriga) * 13)) : 0; }
  function poseG(a, geo = false) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "base", a);
    const respira = Math.sin(a * 2.2);
    const hombros = campana(a, U.gPique + 0.05, U.gPique + 0.3) + campana(a, U.gPique + 0.25, U.gPique + 0.5);
    const p = { x: XG, suelo: SUELO, s: S, tirasLimpias: true, ikContinuo: false,
      pelvis: P(G.PELVIS.x, G.PELVIS.y + b.pel + respira * 1.2), torso: b.torso,
      torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.02 * b.hom + 0.02 * hombros }, piernas: {},
      cabeza: { ang: b.cab + 0.05 * campana(a, U.gPique + 0.1, U.gPique + 0.5) * Math.sin((a - U.gPique) * 14), dx: 0, dy: -10 * b.hom - 8 * hombros, esc: { x: 1, y: 1 } } };
    // pies
    const pl = { tob: P(G.PELVIS.x + 62, TOB_G - 12), ang: 0 };
    let pc;
    const q0 = balonSueloG(a);
    const sobre = tobDesdeSuela(G, p, P(q0.x - 4, SUELO - 2 * RB + 2), -0.06, 40, G.TOBILLO_ALTO);
    const detras = tobDesdeSuela(G, p, P(XBG1 - 50, SUELO + 2), -0.12, 40, G.TOBILLO_ALTO);
    const h = G.tronco(p)(G.CADERA.cerca);
    const cuchara = { tob: P(h.x + 215, h.y + 360), ang: -0.55 };
    const planta = { tob: P(G.PELVIS.x - 55, TOB_G), ang: 0 };
    if (a < U.rueda1 + 0.02) pc = sobre;
    else {
      const k1 = suave(fase(a, U.rueda1 + 0.02, U.cuchara - 0.06)), arco = 26 * Math.sin(Math.PI * k1);
      pc = mezPie(sobre, detras, k1); pc.tob.y -= arco;
      pc = mezPie(pc, cuchara, salida(fase(a, U.cuchara - 0.04, U.cuchara + 0.06)));
      pc = mezPie(pc, planta, suave(fase(a, U.cuchara + 0.12, U.cuchara + 0.38)));
    }
    let pL = pl;
    // salto y caída (marco del cuerpo)
    const enAire = tramo(a, U.salta, U.salta + 0.1);
    if (enAire > 0) {
      const [fc, kc, uc] = claves(AIRE_G_P.cerca, a), [fl, kl, ul] = claves(AIRE_G_P.lejos, a);
      // ¡boing!: piernas arriba de golpe
      const golpe = a >= U.barriga ? Math.exp(-(a - U.barriga) * 4) * clamp((a - U.barriga) / 0.06) : 0;
      const sacude = 0.12 * campana(a, U.cara - 0.02, U.cara + 0.3);
      pc = mezPie(pc, piernaF(G, p, "cerca", fc + 0.75 * golpe + sacude, kc, uc), enAire);
      pL = mezPie(pL, piernaF(G, p, "lejos", fl + 0.62 * golpe + sacude * 0.8, kl, ul), enAire);
    }
    p.piernas.cerca = pc; p.piernas.lejos = pL;
    // giro
    const gi = giroG(a);
    if (gi) { const o = G.aPantalla(p, p.pelvis); ponGiro(G, p, gi.phi, (gi.x - o.x) * gi.k, (gi.y - o.y) * gi.k); } else ponGiro(G, p, 0, 0, 0);
    // cara
    const e = guion(GUION_CARA_G, CARAS_G, "inicio", a);
    p.cara = cara(e, parpadeo(a, [0.6, 2.2, 5.15, 6.1, U.horiz + 0.25, U.busca + 0.55, 12.1]));
    p.sudor = 0.85 * tramo(a, U.horiz + 0.1, U.horiz + 0.3) * (1 - tramo(a, U.pum, U.pum + 0.3)) + 0.7 * campana(a, U.ve, U.cara + 0.3);
    p.enfado = 0.8 * campana(a, U.gPique, U.rueda0 + 0.2);
    const marca = tramo(a, U.cara, U.cara + 0.1, salida) * (1 - 0.35 * tramo(a, U.rueda + 0.5, DUR));
    if (marca > 0.01) p.capaCabeza = g => huella(g, marca);
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    const bC = Tr(BOLS_G_C), bL = Tr(BOLS_G_L);
    const enBC = { x: bC.x, y: bC.y, ang: 0, mu: -1.75, puno: 0, dedos: CERO, dobla: -1 };
    const enBL = { x: bL.x, y: bL.y, ang: 0, mu: -1.75, puno: 0, dedos: CERO, dobla: -1 };
    const R = (dx, dy, o = {}) => Object.assign({ dx, dy, puno: 1, dedos: todos(0.45), ang: 0 }, o);
    const listaC = [
      [U.rueda0 - 0.15, U.rueda0 + 0.1, R(-90, 245)], [U.agacha - 0.05, U.salta, R(-150, 230)],
      [U.salta + 0.02, U.horiz - 0.05, R(235, 70, { dedos: todos(1) })], [U.cae0 + 0.02, U.pum, R(-90, 285, { dedos: todos(0.7) })]
    ];
    const listaL = [
      [U.rueda0 - 0.1, U.rueda0 + 0.15, R(105, 230)], [U.agacha - 0.05, U.salta, R(-60, 260)],
      [U.salta + 0.02, U.horiz - 0.05, R(215, -70, { dedos: todos(1) })], [U.cae0 + 0.02, U.pum, R(-50, 255, { dedos: todos(0.7) })],
      [U.mano0, U.mano0 + 0.35, R(250, -10, { dedos: todos(1) })], [U.mano1, U.mano1 + 0.3, R(-50, 255, { dedos: todos(0.6) })]
    ];
    const fin = (lado, d) => {
      const hh = lado === "cerca" ? hc : hl, m = P(hh.x + d.dx, hh.y + d.dy);
      return { x: m.x, y: m.y, ang: d.ang, mu: muHacia(m, hh, lado === "cerca" ? -0.15 : 0.15), puno: d.puno, dedos: d.dedos, dobla: -1 };
    };
    const mezM = (x, y, k) => ({ x: lerp(x.x, y.x, k), y: lerp(x.y, y.y, k), ang: lerp(x.ang, y.ang, k), mu: lerp(x.mu, y.mu, k), puno: lerp(x.puno, y.puno, k), dedos: mezD(x.dedos, y.dedos, k), dobla: -1 });
    const ruta = (lista, lado, ini) => { let m = ini; for (const [t0, t1, d] of lista) { if (a <= t0) break; m = mezM(m, fin(lado, d), suave(fase(a, t0, t1))); } return m; };
    const C = ruta(listaC, "cerca", enBC), L = ruta(listaL, "lejos", enBL);
    // equilibrio con el balón y aleteo al saltar
    const equi = tramo(a, U.rueda0, U.rueda0 + 0.2) * (1 - tramo(a, U.agacha - 0.1, U.agacha));
    C.y += 12 * Math.sin(a * 6.1) * equi; L.y += 12 * Math.sin(a * 5.3 + 1) * equi;
    const agita = tramo(a, U.salta, U.salta + 0.08) * (1 - tramo(a, U.horiz - 0.05, U.horiz + 0.05));
    C.x += 30 * Math.sin(a * 19) * agita; C.y += 22 * Math.cos(a * 17) * agita; L.x += 26 * Math.sin(a * 21 + 1) * agita; L.y += 20 * Math.cos(a * 15 + 2) * agita;
    // colgado: los dedos tiemblan un poco
    const cuelga = tramo(a, U.horiz, U.horiz + 0.1) * (1 - tramo(a, U.cae0, U.cae0 + 0.05));
    C.x += 4 * Math.sin(a * 23) * cuelga; L.x += 4 * Math.sin(a * 25 + 2) * cuelga;
    // ¡boing!: brazos arriba de golpe (en el marco girado, hacia delante)
    const golpe = a >= U.barriga ? Math.exp(-(a - U.barriga) * 4) * clamp((a - U.barriga) / 0.06) : 0;
    const bg = P(hc.x + 230, hc.y + 40), bgl = P(hl.x + 200, hl.y - 20);
    C.x = lerp(C.x, bg.x, golpe); C.y = lerp(C.y, bg.y, golpe); L.x = lerp(L.x, bgl.x, golpe); L.y = lerp(L.y, bgl.y, golpe);
    // contracciones con el balón en la cara
    const tic = campana(a, U.cara, U.cara + 0.35);
    C.x += 60 * tic; L.x += 70 * tic; C.mu += 0.2 * tic;
    // saludo flojito
    const saluda = tramo(a, U.mano0 + 0.3, U.mano0 + 0.4) * (1 - tramo(a, U.mano1 - 0.05, U.mano1 + 0.05));
    L.y += 22 * Math.sin((a - U.mano0) * 7) * saluda; L.mu += 0.2 * Math.sin((a - U.mano0) * 7) * saluda;
    p.manoCerca = C; p.manoLejos = L;
    if (!geo && GEO) {
      const qG = balonG(a), qB = balonB(a);
      const wB = tramo(a, 0.8, 1.1) * (1 - tramo(a, U.gCamara - 0.1, U.gCamara + 0.1));
      miraA(G, p, qB, OJO_G, clamp(wB));
      const wG = tramo(a, U.rueda0 - 0.1, U.rueda0 + 0.1) * (1 - tramo(a, U.gChulo - 0.08, U.gChulo + 0.05)) + tramo(a, U.ve + 0.05, U.ve + 0.12) * (1 - tramo(a, U.rueda + 0.1, U.rueda + 0.3));
      if (qG.y > -100) miraA(G, p, qG, OJO_G, clamp(wG));
      const pb = poseB(a, true), wGB = tramo(a, U.gPique, U.gPique + 0.15) * (1 - tramo(a, U.rueda0 - 0.1, U.rueda0 + 0.1));
      if (wGB > 0) miraA(G, p, pant(GB, pb, GB.cabeza(pb).a(P(830, 520))), OJO_G, clamp(wGB));
    }
    return p;
  }
  const OJO_G = P(835, 585);
  // huella del balón en la cara de Guillermo (coordenadas del retrato)
  function huella(g, k) {
    g.save(); g.globalAlpha = k;
    g.fillStyle = "rgba(232,62,52,0.42)"; g.beginPath(); g.arc(852, 702, 74, 0, TAU); g.fill();
    g.strokeStyle = "rgba(180,30,30,0.45)"; g.lineWidth = 5; g.lineJoin = "round";
    g.beginPath(); for (let i = 0; i < 5; i++) { const an = -Math.PI / 2 + i * 1.2566; g.lineTo(852 + Math.cos(an) * 24, 702 + Math.sin(an) * 24); } g.closePath(); g.stroke();
    for (let i = 0; i < 5; i++) { const an = -Math.PI / 2 + i * 1.2566; g.beginPath(); g.moveTo(852 + Math.cos(an) * 24, 702 + Math.sin(an) * 24); g.lineTo(852 + Math.cos(an) * 52, 702 + Math.sin(an) * 52); g.stroke(); }
    g.restore();
  }

  /* =====================================================================================
   * BALONES: contactos sacados de las posturas en el instante del toque
   * ===================================================================================== */
  function apoyo(R, p, qH, nH, hund = 0, r = RB) {
    const c = pant(R, p, qH), n0 = dirPant(p, nH), d = Math.hypot(n0.x, n0.y) || 1, n = P(n0.x / d, n0.y / d);
    return { x: c.x + n.x * (r - hund), y: c.y + n.y * (r - hund), n };
  }
  const LAZO = { b: P(88, 4), g: P(96, 16) };
  function enPie(R, p, lado, lazo, hund = 2) { const q = p.piernas[lado], o = rotP(lazo, q.ang); return apoyo(R, p, P(q.tob.x + o.x, q.tob.y + o.y), rotP(P(0, -1), q.ang), hund); }
  function enRodilla(R, p, lado, grosor) {
    const cad = R.tronco(p)(R.CADERA[lado]), L = R.A.datos.piezas["pierna_" + lado].largo;
    const m = Recortes.muestras(Recortes.ik(cad, p.piernas[lado].tob, L, L * 0.5, 80, 1, 1.03), 10);
    const a = m[3], b = m[5], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
    let n = P(dy / d, -dx / d); if (n.y > 0) n = P(-n.x, -n.y);
    return apoyo(R, p, P(m[4].x + n.x * grosor, m[4].y + n.y * grosor), n, 2);
  }
  // papelera (al otro lado de la calle)
  const PAP = { x: 935, boca: 398, base: 452, rx: 23, esc: 0.84 };
  let GEO = null;
  function preparaGeo() {
    const b = a => poseB(a, true), g = a => poseG(a, true);
    const pF = b(U.flick), qF = pF.piernas.cerca, oF = rotP(GB.PUNTA, qF.ang), punta = pant(GB, pF, P(qF.tob.x + oF.x, qF.tob.y + oF.y));
    const reposo = { x: punta.x - 0.42 * RB, y: SUELO - RB, n: P(0, -1) };
    const C = enPie(GB, b(KB.contacto), "cerca", LAZO.b, 1);
    const entra = { x: PAP.x - 3, y: PAP.boca - RB * PAP.esc * 0.6, n: P(0, -1) };
    const VB = [[U.flick, reposo], [U.t1, enPie(GB, b(U.t1), "cerca", LAZO.b)], [U.rod, enRodilla(GB, b(U.rod), "cerca", 50)],
      [U.pop, enPie(GB, b(U.pop), "cerca", LAZO.b)], [KB.contacto, C], [KB.papelera, entra]];
    const giros = [];
    for (let i = 0; i < VB.length - 1; i++) { const [t0, p0] = VB[i], [t1, p1] = VB[i + 1]; giros.push([t0, t1, 0.85 * (p1.x - p0.x) / (t1 - t0) / RB + (i === VB.length - 2 ? 6 : 0)]); }
    // Guillermo: de cuchara al cielo → barriga → cara
    const sale = { x: XBG1, y: SUELO - RB, n: P(0, -1) };
    const pBar = g(U.barriga), barriga = apoyo(G, pBar, G.tronco(pBar)(P(325, 640)), P(1, -0.1), 4);
    const pCara = g(U.cara), cara0 = enCaraG(pCara);
    const VG = [[U.cuchara, sale], [U.barriga, barriga], [U.cara, cara0]];
    GEO = { reposo, VB, giros, C, entra, VG, barriga, cara0, ultimo: VB.length - 2, toques: VB.slice(1, VB.length - 2).map(([tc, c]) => [real(tc), c]) };
  }
  const NARIZ_G = P(892, 712);
  function enCaraG(p) { const h = G.cabeza(p); return apoyo(G, p, h.a(NARIZ_G), P(Math.cos(h.ang + 0.35), Math.sin(h.ang + 0.35)), 4); }
  // dónde está el balón de Gabacho (a: tiempo de la acción)
  function balonB(a) {
    if (a < U.flick) return Object.assign({ e: 1 }, GEO.reposo);
    if (a <= KB.papelera) {
      const q = vuelo(GEO.VB, a), e = q.i === GEO.ultimo ? lerp(1, PAP.esc, fase(a, KB.contacto, KB.papelera)) : 1;
      return { x: q.x, y: q.y, e, i: q.i };
    }
    // dentro de la papelera
    const u = fase(a, KB.papelera, KB.papelera + 0.12);
    return { x: GEO.entra.x + 2 * u, y: GEO.entra.y + 40 * entrada(u), e: PAP.esc, dentro: true };
  }
  function giroBalonB(a) {
    let g = 0.3;
    for (const [t0, t1, w] of GEO.giros) { if (a <= t0) break; g += w * (Math.min(a, t1) - t0); }
    return g;
  }
  // el balón de Guillermo
  function balonG(a) {
    const gR = (XBG1 - XBG0) / RB + 0.6;
    if (a < U.cuchara) { const q = balonSueloG(a); return { x: q.x, y: q.y, e: 1, giro: (q.x - XBG0) / RB + 0.6 }; }
    if (a < U.cara) { const q = vuelo(GEO.VG, a), g1 = q.i === 0 ? gR - (a - U.cuchara) * 9 : gR - (U.barriga - U.cuchara) * 9 - (a - U.barriga) * 5; return { x: q.x, y: q.y, e: 1, giro: g1 }; }
    const g0 = gR - (U.barriga - U.cuchara) * 9 - (U.cara - U.barriga) * 5;
    if (a < U.rueda) {
      const pg = poseG(a, true), c = enCaraG(pg), w = 3 * Math.sin((a - U.cara) * 5) * Math.exp(-(a - U.cara) * 1.5);
      return { x: c.x - c.n.y * w, y: c.y + c.n.x * w, e: 1, giro: g0 + w / RB };
    }
    const c0 = GEO.c0 || (GEO.c0 = enCaraG(poseG(U.rueda, true)));
    if (a < U.suelo) {
      const u = fase(a, U.rueda, U.suelo), x = lerp(c0.x, c0.x - 45, u), y0 = c0.y, y1 = SUELO - RB;
      const y = lerp(y0, y1, u * u) - 30 * Math.sin(Math.PI * u) * (1 - u);
      return { x, y, e: 1, giro: g0 - 45 * u / RB };
    }
    const u = salida(fase(a, U.suelo, U.para)), x = c0.x - 45 - 40 * u;
    const bote = 12 * Math.abs(Math.sin(fase(a, U.suelo, U.suelo + 0.5) * Math.PI * 2)) * (1 - fase(a, U.suelo, U.suelo + 0.5));
    return { x, y: SUELO - RB - bote, e: 1, giro: g0 - (45 + 40 * u) / RB };
  }

  /* ---------- dibujo de los balones ---------- */
  const SPR = {};
  function creaBalon(nombre, panel, costura) {
    const Kk = 3, r = RB * Kk, n = Math.ceil(r * 2 + 10);
    const mk = () => { const c = document.createElement("canvas"); c.width = c.height = n; const g = c.getContext("2d"); g.translate(n / 2, n / 2); return [c, g]; };
    const [c1, g] = mk();
    g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fillStyle = "#fbfaf3"; g.fill();
    g.save(); g.clip();
    const pent = (cx, cy, rr, rot) => { g.beginPath(); for (let i = 0; i < 5; i++) { const an = rot + i * TAU / 5; g.lineTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr); } g.closePath(); };
    g.lineCap = "round"; g.strokeStyle = costura; g.lineWidth = 1.3 * Kk; g.fillStyle = panel;
    pent(0, 0, r * 0.33, -Math.PI / 2); g.fill();
    for (let i = 0; i < 5; i++) {
      const an = -Math.PI / 2 + i * TAU / 5, b = an + Math.PI / 5;
      const v = P(Math.cos(an) * r * 0.33, Math.sin(an) * r * 0.33), m = P(Math.cos(an) * r * 0.64, Math.sin(an) * r * 0.64);
      g.beginPath(); g.moveTo(v.x, v.y); g.lineTo(m.x, m.y);
      for (const s of [-1, 1]) { const c = an + s * 0.36; g.moveTo(m.x, m.y); g.lineTo(Math.cos(c) * r * 0.86, Math.sin(c) * r * 0.86); }
      g.stroke();
      pent(Math.cos(b) * r * 1.02, Math.sin(b) * r * 1.02, r * 0.33, b + Math.PI); g.fill();
    }
    g.restore();
    const [c2, h] = mk();
    const sm = h.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, -r * 0.1, -r * 0.1, r * 1.15);
    sm.addColorStop(0, "rgba(255,250,235,0.35)"); sm.addColorStop(0.45, "rgba(255,240,220,0)"); sm.addColorStop(0.8, "rgba(60,40,70,0.22)"); sm.addColorStop(1, "rgba(40,25,50,0.5)");
    h.fillStyle = sm; h.beginPath(); h.arc(0, 0, r, 0, TAU); h.fill();
    h.fillStyle = "rgba(255,255,255,0.85)"; h.beginPath(); h.ellipse(-r * 0.42, -r * 0.45, r * 0.18, r * 0.11, -0.7, 0, TAU); h.fill();
    h.lineWidth = 2 * Kk; h.strokeStyle = TINTA; h.beginPath(); h.arc(0, 0, r - Kk, 0, TAU); h.stroke();
    SPR[nombre] = { c1, c2, n, Kk };
  }
  function dibujaBalon(g, q, giro, nombre, apl) {
    const { c1, c2, n, Kk } = SPR[nombre], e = q.e || 1;
    g.save(); g.translate(q.x, q.y); g.scale(e, e);
    if (apl && apl.k > 0.002) { const an = Math.atan2(apl.n.y, apl.n.x); g.rotate(an); g.scale(1 - apl.k, 1 + 0.6 * apl.k); g.rotate(-an); }
    g.save(); g.rotate(giro); g.drawImage(c1, -n / 2 / Kk, -n / 2 / Kk, n / Kk, n / Kk); g.restore();
    g.drawImage(c2, -n / 2 / Kk, -n / 2 / Kk, n / Kk, n / Kk);
    g.restore();
  }
  function aplastaBalon(a, lista) {
    let best = 0, n = P(0, -1);
    for (const [tc, c] of lista) { const k = Math.exp(-(((a - tc) / 0.04) ** 2)); if (k > best) { best = k; n = c.n; } }
    return { k: 0.16 * best, n };
  }
  function sombraBalon(g, q, suelo, e = 1) {
    const h = clamp((suelo - RB * e - q.y) / 420);
    g.save(); g.fillStyle = `rgba(40,30,20,${0.3 * (1 - 0.8 * h)})`;
    g.beginPath(); g.ellipse(q.x + 5, suelo + 1, RB * e * (1.15 - 0.4 * h), 3.2 * e * (1 - 0.4 * h), 0, 0, TAU); g.fill(); g.restore();
  }

  /* ---------- papelera ---------- */
  function tapaAng(a) {
    if (a < KB.papelera - 0.02) return 0;
    const u = a - KB.papelera + 0.02;
    return -1.7 * Math.exp(-2.6 * u) * Math.sin(10.5 * u);
  }
  function papeleraBoca(g) {
    const { x, boca, rx } = PAP;
    g.save(); g.fillStyle = "#14251a"; g.beginPath(); g.ellipse(x, boca, rx, 5.5, 0, 0, TAU); g.fill(); g.restore();
  }
  function papelera(g, a) {
    const { x, boca, base, rx } = PAP;
    const u = a - KB.papelera, temb = u > 0 ? Math.exp(-u * 6) * Math.sin(u * 40) : 0;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.translate(x, base); g.scale(1 + 0.025 * temb, 1 - 0.02 * temb); g.translate(-x, -base);
    // cuerpo
    const cu = g.createLinearGradient(x - rx, 0, x + rx, 0);
    cu.addColorStop(0, "#1d4a2f"); cu.addColorStop(0.35, "#3b7b51"); cu.addColorStop(0.7, "#2a6141"); cu.addColorStop(1, "#173b26");
    g.fillStyle = cu; g.beginPath(); g.moveTo(x - rx, boca); g.lineTo(x - rx + 3, base - 4); g.quadraticCurveTo(x, base + 4, x + rx - 3, base - 4); g.lineTo(x + rx, boca);
    g.ellipse(x, boca, rx, 5.5, 0, 0, Math.PI); g.closePath(); g.fill();
    g.strokeStyle = "rgba(10,30,18,0.45)"; g.lineWidth = 1.2;
    for (let i = -3; i <= 3; i++) { const xx = x + i * 6.2; g.beginPath(); g.moveTo(xx, boca + 8); g.lineTo(xx * 0.98 + x * 0.02, base - 6); g.stroke(); }
    g.fillStyle = "#2f6a45"; g.beginPath(); g.ellipse(x, boca + 14, rx - 0.5, 4, 0, 0, Math.PI); g.lineTo(x - rx + 0.5, boca + 10); g.ellipse(x, boca + 10, rx - 0.5, 4, 0, Math.PI, 0, true); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.8;
    g.beginPath(); g.moveTo(x - rx, boca); g.lineTo(x - rx + 3, base - 4); g.quadraticCurveTo(x, base + 4, x + rx - 3, base - 4); g.lineTo(x + rx, boca); g.stroke();
    g.fillStyle = "rgba(255,255,230,0.18)"; g.fillRect(x - rx + 7, boca + 6, 4, base - boca - 14);
    // borde
    g.strokeStyle = "#173b26"; g.lineWidth = 3.4; g.beginPath(); g.ellipse(x, boca, rx, 5.5, 0, 0, TAU); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 1.3; g.beginPath(); g.ellipse(x, boca, rx + 1.7, 7, 0, 0, TAU); g.stroke();
    // tapa basculante (de canto, gira sobre su eje)
    const th = tapaAng(a);
    g.save(); g.translate(x, boca); g.rotate(th);
    g.fillStyle = "#3f8558"; g.strokeStyle = TINTA; g.lineWidth = 1.4;
    g.beginPath(); g.roundRect ? g.roundRect(-rx + 3, -2.5, 2 * rx - 6, 5, 2.5) : g.rect(-rx + 3, -2.5, 2 * rx - 6, 5); g.fill(); g.stroke();
    g.fillStyle = "#c9b45a"; g.beginPath(); g.arc(0, 0, 2.2, 0, TAU); g.fill(); g.stroke();
    g.restore();
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrellaP(g, x, y, r, puntas, rot, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const an = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); } g.closePath();
  }
  function impacto(g, t, t0, q, tam, dur = 0.3) {
    const k = fase(t, t0, t0 + dur); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    estrellaP(g, q.x, q.y, tam * (0.5 + 0.9 * salida(k)), 10, 0.3, 0.42); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    estrellaP(g, q.x, q.y, tam * (0.3 + 0.55 * salida(k)), 10, 0.55, 0.5); g.fillStyle = "#ffffff"; g.fill();
    g.strokeStyle = "#ffffff"; g.lineWidth = 2.5; g.lineCap = "round";
    for (let i = 0; i < 8; i++) { const an = i / 8 * TAU + 0.2, r0 = tam * (0.9 + 0.9 * k), r1 = r0 + tam * 0.45; g.beginPath(); g.moveTo(q.x + Math.cos(an) * r0, q.y + Math.sin(an) * r0); g.lineTo(q.x + Math.cos(an) * r1, q.y + Math.sin(an) * r1); g.stroke(); }
    g.restore();
  }
  function toque(g, t, t0, c) {
    const k = fase(t, t0, t0 + 0.26); if (k <= 0 || k >= 1) return;
    const an = Math.atan2(c.n.y, c.n.x) + Math.PI, r = RB + 5 + 9 * salida(k);
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.9 * (1 - k)})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (const s of [-1, 1]) { g.beginPath(); g.arc(c.x, c.y, r, an + s * 0.55 - 0.32, an + s * 0.55 + 0.32); g.stroke(); }
    g.restore();
  }
  function polvo(g, t, t0, x0, y0, ancho = 1, dur = 0.9) {
    const k = fase(t, t0 - 0.02, t0 + dur); if (k <= 0 || k >= 1) return;
    g.save();
    for (let i = 0; i < 10; i++) { const lado = i % 2 ? 1 : -1, d = (20 + 110 * ancho * salida(k)) * (0.5 + hash(i + 70) * 0.7);
      g.globalAlpha = 0.45 * (1 - k); g.fillStyle = "#d8cbb3";
      g.beginPath(); g.ellipse(x0 + lado * d, y0 - 4 - 20 * k * hash(i + 71), (10 + 18 * k) * ancho, (5 + 8 * k) * ancho, 0, 0, TAU); g.fill(); }
    g.restore();
  }
  function estrellitas(g, t, c, k) {
    if (k <= 0.01) return;
    const pts = [];
    for (let i = 0; i < 5; i++) { const an = t * 4 + i * TAU / 5; pts.push({ an, x: c.x + Math.cos(an) * 44, y: c.y + Math.sin(an) * 12, z: Math.sin(an) }); }
    pts.sort((u, v) => u.z - v.z);
    g.save();
    for (const q of pts) { const r = (7.5 + 2.5 * q.z) * k; estrellaP(g, q.x, q.y, r, 5, t * 3 + q.an, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 1.6; g.strokeStyle = TINTA; g.stroke(); }
    g.restore();
  }
  // rastro del balón cuando va rápido
  function estela(g, t, fn, e = 1) {
    const qs = [0, 1, 2, 3, 4].map(i => fn(tau(Math.max(0, t - i * 0.02))));
    for (let i = 4; i >= 1; i--) {
      const q = qs[i], q2 = qs[i - 1], v = Math.hypot(q2.x - q.x, q2.y - q.y) / 0.02;
      const al = clamp((v - 550) / 500); if (al <= 0) continue;
      g.save(); g.globalAlpha = 0.09 * (5 - i) * al; g.fillStyle = "#ffffff"; g.beginPath(); g.arc(q.x, q.y, RB * (q.e || 1) * (1 - i * 0.12), 0, TAU); g.fill(); g.restore();
    }
  }
  // cámara lenta: líneas de foco congeladas alrededor del punto del remate
  function lineasFoco(g, t, c) {
    const k = lenta(t) * (1 - fase(t, T.kick + 0.05, T.kick + 0.35)); if (k <= 0.01) return;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.5 * k})`; g.lineCap = "round";
    for (let i = 0; i < 26; i++) {
      const an = i / 26 * TAU + 0.11 * hash(i), r0 = 250 + 60 * hash(i + 5), r1 = r0 + 140 + 120 * hash(i + 9);
      g.lineWidth = 1.5 + 2.5 * hash(i + 3);
      g.beginPath(); g.moveTo(c.x + Math.cos(an) * r0, c.y + Math.sin(an) * r0 * 0.7); g.lineTo(c.x + Math.cos(an) * r1, c.y + Math.sin(an) * r1 * 0.7); g.stroke();
    }
    g.restore();
  }
  // estela del pie que remata (arco blanco que se afina)
  function arcoPie(g, t) {
    const a = tau(t); if (a < KB.contacto - 0.18 || a > KB.contacto + 0.2) return;
    const pts = [];
    for (let i = 0; i <= 10; i++) {
      const ai = a - i * 0.018; if (ai < KB.contacto - 0.2) break;
      const p = poseB(ai, true), q = p.piernas.cerca, o = rotP(LAZO.b, q.ang);
      pts.push(pant(GB, p, P(q.tob.x + o.x, q.tob.y + o.y)));
    }
    if (pts.length < 3) return;
    const k = campana(a, KB.contacto - 0.18, KB.contacto + 0.2);
    g.save(); g.lineCap = "round";
    for (let i = 0; i < pts.length - 1; i++) {
      g.strokeStyle = `rgba(255,255,255,${0.75 * k * (1 - i / pts.length)})`; g.lineWidth = 10 * (1 - i / pts.length) + 1;
      g.beginPath(); g.moveTo(pts[i].x, pts[i].y); g.lineTo(pts[i + 1].x, pts[i + 1].y); g.stroke();
    }
    g.restore();
  }
  // fantasmas de Gabacho en la cámara lenta (en un lienzo aparte, a media resolución)
  let FC = null, VIN = null;
  function fantasmas(g, t) {
    const k = lenta(t); if (k <= 0.01) return;
    const a = tau(t); if (a < KB.despega + 0.03 || a > KB.aterriza) return;
    const cw = g.canvas.width, ch = g.canvas.height;           // en píxeles del lienzo real (sirve con vista/HiDPI)
    if (!FC || FC.width !== Math.round(cw / 2) || FC.height !== Math.round(ch / 2)) { FC = document.createElement("canvas"); FC.width = Math.round(cw / 2); FC.height = Math.round(ch / 2); }
    // los dos fantasmas en el mismo lienzo (el más viejo, más transparente) y un solo volcado
    const f = FC.getContext("2d");
    f.setTransform(1, 0, 0, 1, 0, 0); f.clearRect(0, 0, FC.width, FC.height);
    const m = g.getTransform(); f.setTransform(m.a * 0.5, m.b * 0.5, m.c * 0.5, m.d * 0.5, m.e * 0.5, m.f * 0.5);
    for (const [d, al] of [[0.17, 0.5], [0.085, 1]]) {
      const ai = a - d; if (ai < KB.despega) continue;
      f.globalAlpha = al; dibuja(GB, f, poseB(ai, true), t);
    }
    f.globalAlpha = 1; f.setTransform(1, 0, 0, 1, 0, 0);
    f.globalCompositeOperation = "source-atop"; f.fillStyle = "rgba(170,205,255,0.6)"; f.fillRect(0, 0, FC.width, FC.height); f.globalCompositeOperation = "source-over";
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 0.34 * k; g.drawImage(FC, 0, 0, cw, ch); g.restore();
  }
  // la papelera: nubecilla, hoja y vibración
  function efectoPapelera(g, t) {
    const t0 = KR.papelera, u = t - t0; if (u < 0 || u > 1.4) return;
    const { x, boca } = PAP;
    g.save();
    for (let i = 0; i < 7; i++) {
      const k = clamp(u / (0.55 + 0.3 * hash(i + 40))); if (k >= 1) continue;
      const an = -Math.PI / 2 + (hash(i + 41) - 0.5) * 2.4, d = 6 + 26 * salida(k);
      g.fillStyle = `rgba(232,222,200,${0.6 * (1 - k)})`; g.beginPath(); g.arc(x + Math.cos(an) * d, boca - 4 + Math.sin(an) * d * 0.8, 4 + 6 * k, 0, TAU); g.fill();
    }
    // una hoja seca que sale despedida y cae balanceándose
    const hx = x + 30 * u + 8 * Math.sin(u * 7), hy = boca - 70 * u + 75 * u * u + 3 * Math.sin(u * 9);
    if (hy < 452) { g.save(); g.translate(hx, hy); g.rotate(u * 5 + 0.6 * Math.sin(u * 8)); g.fillStyle = "#c98b38"; g.strokeStyle = "#6e4416"; g.lineWidth = 1;
      g.beginPath(); g.moveTo(-6, 0); g.quadraticCurveTo(0, -5, 6, 0); g.quadraticCurveTo(0, 5, -6, 0); g.fill(); g.stroke(); g.restore(); }
    // rayitas de la vibración
    const kv = 1 - clamp(u / 0.45);
    if (kv > 0) { g.strokeStyle = `rgba(255,255,255,${0.85 * kv})`; g.lineWidth = 2; g.lineCap = "round";
      for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { g.beginPath(); g.arc(x, boca + 26, PAP.rx + 6 + i * 6, s > 0 ? -0.5 : Math.PI - 0.5, s > 0 ? 0.5 : Math.PI + 0.5); g.stroke(); } }
    // destello de «perfecto»
    const kd = campana(u, 0.08, 0.6);
    if (kd > 0) { g.globalAlpha = kd; estrellaP(g, x + 20, boca - 30, 9 * kd + 3, 4, u * 2, 0.28); g.fillStyle = "#fffbe0"; g.fill(); }
    g.restore();
  }
  // Guillermo suspendido: rayitas debajo
  function suspendido(g, t, pg) {
    const a = tau(t), k = tramo(a, U.horiz + 0.1, U.horiz + 0.25) * (1 - fase(a, U.cae0, U.cae0 + 0.05)); if (k <= 0.01) return;
    const o = enGiro(pg, pg.o);
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.75 * k})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = 0; i < 4; i++) { const x = o.x - 120 + i * 80, y = o.y + 64 + 4 * Math.sin(t * 10 + i); g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 14); g.stroke(); }
    g.restore();
  }
  function lineasPalmas(g, t, pb) {
    for (const tc of T.aplausos) {
      const k = fase(t, tc - 0.02, tc + 0.24); if (k <= 0 || k >= 1) continue;
      const q = pant(GB, pb, GB.tronco(pb)(P(300, 410)));
      g.save(); g.strokeStyle = `rgba(255,255,255,${1 - k})`; g.lineWidth = 2; g.lineCap = "round";
      for (let i = 0; i < 3; i++) { const an = -Math.PI / 2 + (i - 1) * 0.6, r0 = 9 + 8 * k; g.beginPath(); g.moveTo(q.x + Math.cos(an) * r0, q.y + Math.sin(an) * r0); g.lineTo(q.x + Math.cos(an) * (r0 + 7), q.y + Math.sin(an) * (r0 + 7)); g.stroke(); }
      g.restore();
    }
  }
  function boingLineas(g, t, q) {
    const k = fase(t, T.barriga, T.barriga + 0.45); if (k <= 0 || k >= 1) return;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.9 * (1 - k)})`; g.lineWidth = 2.4; g.lineCap = "round";
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const x = q.x + s * (28 + 6 * i), y = q.y + 10; g.beginPath(); g.moveTo(x, y - 8 - 6 * i); g.quadraticCurveTo(x + s * 6, y, x, y + 8 + 6 * i); g.stroke(); }
    g.restore();
  }

  /* =====================================================================================
   * DECORADO: placita parisina por la tarde
   * ===================================================================================== */
  let fondo = null;
  const ACERA = 440, BORDE = 458, CALZ1 = 512, BORD2 = 522;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 100; const g = c.getContext("2d");
    g.translate(40, 50); g.lineJoin = "round"; g.lineCap = "round";
    // cielo
    const ci = g.createLinearGradient(0, -50, 0, 260); ci.addColorStop(0, "#f0b277"); ci.addColorStop(0.6, "#f8d3a0"); ci.addColorStop(1, "#fde6bf");
    g.fillStyle = ci; g.fillRect(-40, -50, W + 80, 320);
    // fachadas
    const bloques = [[-40, 250, "#ecdcc0", 0], [250, 560, "#e6d2b2", 1], [560, 830, "#efe0c6", 2], [830, W + 40, "#e2cfae", 3]];
    for (const [x0, x1, col, i] of bloques) fachada(g, x0, x1, col, i);
    // sombra suave de los árboles sobre las fachadas
    g.save(); g.globalAlpha = 0.13; g.fillStyle = "#4a3a28";
    for (let i = 0; i < 26; i++) { const x = hash(i + 500) * (W + 80) - 40, y = 180 + hash(i + 520) * 240, r = 16 + 30 * hash(i + 540); g.beginPath(); g.ellipse(x, y, r * 1.4, r, 0, 0, TAU); g.fill(); }
    g.restore();
    // acera de enfrente
    const ac = g.createLinearGradient(0, ACERA, 0, BORDE); ac.addColorStop(0, "#d3c5ab"); ac.addColorStop(1, "#c4b496");
    g.fillStyle = ac; g.fillRect(-40, ACERA, W + 80, BORDE - ACERA);
    g.strokeStyle = "rgba(90,75,55,0.25)"; g.lineWidth = 1;
    for (let x = -40; x < W + 40; x += 34) { g.beginPath(); g.moveTo(x, ACERA); g.lineTo(x - 6, BORDE); g.stroke(); }
    g.fillStyle = "#a99a80"; g.fillRect(-40, BORDE, W + 80, 5); g.fillStyle = "#f2e8d4"; g.fillRect(-40, BORDE, W + 80, 1.5);
    // calzada
    const ca = g.createLinearGradient(0, BORDE + 5, 0, CALZ1); ca.addColorStop(0, "#666a72"); ca.addColorStop(1, "#7b7e85");
    g.fillStyle = ca; g.fillRect(-40, BORDE + 5, W + 80, CALZ1 - BORDE - 5);
    for (let i = 0; i < 120; i++) { g.fillStyle = i % 2 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)"; g.fillRect(hash(i + 600) * (W + 80) - 40, BORDE + 6 + hash(i + 610) * (CALZ1 - BORDE - 8), 2 + 3 * hash(i), 1.5); }
    g.fillStyle = "rgba(240,236,225,0.55)"; for (let x = -20; x < W + 40; x += 90) g.fillRect(x, (BORDE + CALZ1) / 2 + 1, 46, 3);
    // alcantarilla
    g.fillStyle = "#3d3f45"; g.fillRect(612, CALZ1 - 8, 46, 6); g.strokeStyle = "#25262a"; g.lineWidth = 1; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(616 + i * 7, CALZ1 - 8); g.lineTo(616 + i * 7, CALZ1 - 2); g.stroke(); }
    // bordillo de este lado
    const bo = g.createLinearGradient(0, CALZ1, 0, BORD2); bo.addColorStop(0, "#c9c3b6"); bo.addColorStop(1, "#9d978b");
    g.fillStyle = bo; g.fillRect(-40, CALZ1, W + 80, BORD2 - CALZ1);
    g.strokeStyle = "rgba(60,55,45,0.4)"; g.lineWidth = 1; for (let x = -40; x < W + 40; x += 70) { g.beginPath(); g.moveTo(x, CALZ1); g.lineTo(x, BORD2); g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-40, CALZ1); g.lineTo(W + 40, CALZ1); g.stroke();
    // adoquines
    g.fillStyle = "#7d7264"; g.fillRect(-40, BORD2, W + 80, H + 50 - BORD2);
    let y = BORD2 + 1, fila = 0;
    while (y < H + 50) {
      const hh = 7 + (y - BORD2) * 0.075, ww = hh * 1.9, off = (fila % 2) * ww * 0.5;
      for (let x = -40 - off; x < W + 40; x += ww) {
        const v = hash(fila * 131 + Math.round(x)), cc = 138 + Math.round(30 * v);
        g.fillStyle = `rgb(${cc + 6},${cc - 2},${cc - 14})`;
        g.beginPath(); g.roundRect ? g.roundRect(x + 1, y + 1, ww - 2, hh - 2, hh * 0.35) : g.rect(x + 1, y + 1, ww - 2, hh - 2); g.fill();
        g.fillStyle = "rgba(255,245,225,0.22)"; g.fillRect(x + 3, y + 2, ww - 6, 1.6);
      }
      y += hh; fila++;
    }
    // manchas de sol entre las hojas
    g.save();
    for (let i = 0; i < 18; i++) { const x = hash(i + 700) * (W + 80) - 40, yy = ACERA + 4 + hash(i + 710) * 150, r = 12 + 26 * hash(i + 720);
      g.fillStyle = i % 3 ? "rgba(255,236,190,0.16)" : "rgba(40,30,20,0.1)"; g.beginPath(); g.ellipse(x, yy, r * 1.8, r * 0.45, 0, 0, TAU); g.fill(); }
    g.restore();
    // farola (izquierda) y banco (al fondo, entre los dos)
    farola(g, 58);
    banco(g, 452, 572);
    // mesita de café con dos sillas delante del café
    mesita(g, 760);
    // plátanos
    platano(g, 176, -1); platano(g, 1004, 1);
    // viñeta cálida
    const v = g.createRadialGradient(512, 300, 330, 512, 300, 780); v.addColorStop(0, "rgba(60,25,0,0)"); v.addColorStop(1, "rgba(60,25,0,0.38)");
    g.fillStyle = v; g.fillRect(-40, -50, W + 80, H + 100);
    return c;
  }
  // fachada de piedra con balcones de hierro y tejado de zinc
  function fachada(g, x0, x1, col, i) {
    const top = -10 + 12 * hash(i + 3), techo = top + 70;
    // tejado de zinc con buhardillas y chimeneas
    g.fillStyle = "#6f7e8e"; g.beginPath(); g.moveTo(x0, techo); g.lineTo(x0 + 18, top); g.lineTo(x1 - 18, top); g.lineTo(x1, techo); g.closePath(); g.fill();
    g.strokeStyle = "rgba(40,50,62,0.4)"; g.lineWidth = 1; for (let x = x0 + 22; x < x1 - 20; x += 9) { g.beginPath(); g.moveTo(x, top + 2); g.lineTo(x - 3, techo); g.stroke(); }
    for (let x = x0 + 36; x < x1 - 40; x += 74) {
      g.fillStyle = "#f2e6d0"; g.fillRect(x, top + 22, 26, 40); g.fillStyle = "#3b4a5e"; g.fillRect(x + 5, top + 30, 16, 28);
      g.fillStyle = "#59697b"; g.beginPath(); g.moveTo(x - 4, top + 24); g.lineTo(x + 13, top + 10); g.lineTo(x + 30, top + 24); g.closePath(); g.fill();
      g.strokeStyle = TINTA; g.lineWidth = 1.2; g.strokeRect(x, top + 22, 26, 40);
    }
    for (const xc of [x0 + 26, x1 - 46]) { g.fillStyle = "#c98d6a"; g.fillRect(xc, top - 22, 20, 24); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.strokeRect(xc, top - 22, 20, 24);
      for (let k = 0; k < 3; k++) { g.fillStyle = "#b5543c"; g.fillRect(xc + 2 + k * 6, top - 30, 4, 9); } }
    g.strokeStyle = TINTA; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0, techo); g.lineTo(x0 + 18, top); g.lineTo(x1 - 18, top); g.lineTo(x1, techo); g.stroke();
    // piedra
    const pi = g.createLinearGradient(x0, 0, x1, 0); pi.addColorStop(0, col); pi.addColorStop(1, "#d7c3a1");
    g.fillStyle = pi; g.fillRect(x0, techo, x1 - x0, ACERA - techo);
    g.strokeStyle = "rgba(120,100,70,0.14)"; g.lineWidth = 1;
    for (let y = techo + 14; y < ACERA; y += 14) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); }
    // pisos: [y, alto, balcón corrido]
    const pisos = [[techo + 14, 40, true], [techo + 74, 44, false], [techo + 136, 46, false], [techo + 198, 48, true]];
    for (const [py, ph, balcon] of pisos) {
      g.fillStyle = "#f6ecda"; g.fillRect(x0, py - 8, x1 - x0, 5); g.fillStyle = "rgba(120,95,60,0.3)"; g.fillRect(x0, py - 3, x1 - x0, 2);
      for (let x = x0 + 20; x < x1 - 26; x += 50) {
        const vg = g.createLinearGradient(0, py, 0, py + ph); vg.addColorStop(0, "#43546a"); vg.addColorStop(1, "#5d7086");
        g.fillStyle = "#f4ead6"; g.fillRect(x - 4, py - 4, 30, ph + 8);
        g.fillStyle = vg; g.fillRect(x, py, 22, ph);
        g.fillStyle = "rgba(255,240,215,0.35)"; g.beginPath(); g.moveTo(x + 2, py + 2); g.lineTo(x + 9, py + 2); g.lineTo(x + 2, py + 16); g.closePath(); g.fill();
        g.strokeStyle = "#f4ead6"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x + 11, py); g.lineTo(x + 11, py + ph); g.moveTo(x, py + ph * 0.42); g.lineTo(x + 22, py + ph * 0.42); g.stroke();
        g.strokeStyle = TINTA; g.lineWidth = 1; g.strokeRect(x - 4, py - 4, 30, ph + 8);
        if (!balcon) { g.strokeStyle = "#1f1c1c"; g.lineWidth = 1; const by = py + ph * 0.62; g.beginPath(); g.moveTo(x - 2, by); g.lineTo(x + 24, by);
          for (let k = 0; k < 7; k++) { g.moveTo(x + k * 4, by); g.lineTo(x + k * 4, py + ph); } g.stroke(); }
      }
      if (balcon) {
        const by = py + ph * 0.6;
        g.fillStyle = "#cdbb98"; g.fillRect(x0, py + ph + 1, x1 - x0, 4);
        g.strokeStyle = "#1c1a1a"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x0, by); g.lineTo(x1, by); g.moveTo(x0, py + ph); g.lineTo(x1, py + ph); g.stroke();
        g.lineWidth = 0.9; g.beginPath();
        for (let x = x0 + 2; x < x1; x += 5) { g.moveTo(x, by); g.lineTo(x, py + ph); }
        g.stroke();
        g.beginPath(); for (let x = x0 + 8; x < x1; x += 20) { g.moveTo(x + 4, by + 5); g.arc(x, by + 5, 4, 0, TAU); } g.stroke();
      }
    }
    // planta baja: tiendas con arcos (madera verde o granate)
    const bajo = techo + 262;
    g.fillStyle = "#f6ecda"; g.fillRect(x0, bajo - 8, x1 - x0, 6);
    const madera = ["#2f5a43", "#6d2430", "#2b3f5c", "#5a3a22"][i];
    for (let x = x0 + 14; x < x1 - 50; x += 92) {
      g.fillStyle = madera; g.beginPath(); g.moveTo(x, ACERA); g.lineTo(x, bajo + 18); g.quadraticCurveTo(x + 36, bajo - 4, x + 72, bajo + 18); g.lineTo(x + 72, ACERA); g.closePath(); g.fill();
      const cr = g.createLinearGradient(0, bajo, 0, ACERA); cr.addColorStop(0, "#f7c977"); cr.addColorStop(1, "#c98a45");
      g.fillStyle = cr; g.beginPath(); g.moveTo(x + 8, ACERA - 16); g.lineTo(x + 8, bajo + 24); g.quadraticCurveTo(x + 36, bajo + 8, x + 64, bajo + 24); g.lineTo(x + 64, ACERA - 16); g.closePath(); g.fill();
      g.strokeStyle = "rgba(60,30,10,0.4)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 36, bajo + 14); g.lineTo(x + 36, ACERA - 16); g.stroke();
      g.strokeStyle = TINTA; g.lineWidth = 1.3; g.beginPath(); g.moveTo(x, ACERA); g.lineTo(x, bajo + 18); g.quadraticCurveTo(x + 36, bajo - 4, x + 72, bajo + 18); g.lineTo(x + 72, ACERA); g.stroke();
    }
    // toldo granate del café (bloque 2)
    if (i === 2) {
      const tx0 = x0 + 8, tx1 = x1 - 8, ty = bajo - 2;
      g.fillStyle = "#8e2b35"; g.beginPath(); g.moveTo(tx0, ty); g.lineTo(tx1, ty); g.lineTo(tx1 + 10, ty + 26);
      for (let x = tx1 + 10; x > tx0 - 10; x -= 18) g.quadraticCurveTo(x - 9, ty + 34, x - 18, ty + 26);
      g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke();
      g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(tx0, ty + 2, tx1 - tx0, 5);
    }
    // arista entre edificios
    g.fillStyle = "rgba(90,70,45,0.22)"; g.fillRect(x1 - 3, techo, 3, ACERA - techo);
  }
  function farola(g, x) {
    g.save(); g.fillStyle = "#26402f"; g.strokeStyle = TINTA; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(x - 9, ACERA + 10); g.lineTo(x + 9, ACERA + 10); g.lineTo(x + 5, ACERA - 16); g.lineTo(x + 3, 230); g.lineTo(x - 3, 230); g.lineTo(x - 5, ACERA - 16); g.closePath(); g.fill(); g.stroke();
    for (const yy of [ACERA - 16, 330, 262]) { g.fillRect(x - 6, yy, 12, 5); g.strokeRect(x - 6, yy, 12, 5); }
    g.beginPath(); g.moveTo(x - 12, 230); g.lineTo(x + 12, 230); g.lineTo(x + 16, 206); g.lineTo(x - 16, 206); g.closePath(); g.fill(); g.stroke();
    const vi = g.createLinearGradient(0, 180, 0, 206); vi.addColorStop(0, "#fff3c6"); vi.addColorStop(1, "#f4c56e");
    g.fillStyle = vi; g.beginPath(); g.moveTo(x - 16, 206); g.lineTo(x + 16, 206); g.lineTo(x + 20, 176); g.lineTo(x - 20, 176); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#26402f"; g.beginPath(); g.moveTo(x - 22, 176); g.lineTo(x + 22, 176); g.lineTo(x, 160); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.arc(x, 156, 4, 0, TAU); g.fill(); g.stroke();
    g.strokeStyle = "rgba(30,50,35,0.9)"; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 6, 206); g.lineTo(x - 8, 176); g.moveTo(x + 6, 206); g.lineTo(x + 8, 176); g.stroke();
    g.restore();
  }
  function banco(g, x0, x1) {
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 1.2;
    const y = ACERA + 8;
    g.fillStyle = "#2e3a32"; for (const x of [x0 + 8, x1 - 14]) { g.fillRect(x, y - 30, 6, 32); g.strokeRect(x, y - 30, 6, 32); }
    g.fillStyle = "#3b6b4a";
    for (let k = 0; k < 3; k++) { const yy = y - 66 + k * 10; g.fillRect(x0, yy, x1 - x0, 6); g.strokeRect(x0, yy, x1 - x0, 6); }
    g.fillRect(x0 - 4, y - 32, x1 - x0 + 8, 6); g.strokeRect(x0 - 4, y - 32, x1 - x0 + 8, 6);
    g.fillStyle = "rgba(255,255,230,0.18)"; for (let k = 0; k < 3; k++) g.fillRect(x0 + 2, y - 65 + k * 10, x1 - x0 - 4, 1.5);
    g.fillStyle = "#2e3a32"; for (const x of [x0 + 10, x1 - 16]) { g.fillRect(x, y - 68, 4, 38); }
    g.restore();
  }
  function mesita(g, x) {
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 1.2; const y = ACERA + 10;
    // sillas de bistró
    for (const s of [-1, 1]) {
      const cx = x + s * 26;
      g.strokeStyle = "#5a3b20"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(cx - 7, y); g.lineTo(cx - 6, y - 18); g.moveTo(cx + 7, y); g.lineTo(cx + 6, y - 18); g.stroke();
      g.fillStyle = "#b8803e"; g.beginPath(); g.ellipse(cx, y - 19, 10, 3, 0, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1; g.stroke();
      g.strokeStyle = "#5a3b20"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(cx + s * 8, y - 19); g.quadraticCurveTo(cx + s * 12, y - 34, cx + s * 4, y - 40); g.lineTo(cx - s * 6, y - 38); g.stroke();
    }
    g.fillStyle = "#3a3a3e"; g.fillRect(x - 2, y - 26, 4, 26); g.fillRect(x - 9, y - 2, 18, 3);
    g.fillStyle = "#d9d3c4"; g.beginPath(); g.ellipse(x, y - 27, 15, 4, 0, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1; g.stroke();
    g.fillStyle = "#fbf8f0"; g.fillRect(x - 4, y - 35, 7, 7); g.strokeRect(x - 4, y - 35, 7, 7);
    g.restore();
  }
  // plátano de corteza moteada; copa hacia el lado `lado`
  function platano(g, x, lado) {
    g.save();
    const base = ACERA + 10;
    g.fillStyle = "#b9ae88"; g.strokeStyle = TINTA; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(x - 17, base); g.quadraticCurveTo(x - 12, 300, x - 9, 150); g.lineTo(x + 9, 150); g.quadraticCurveTo(x + 12, 300, x + 17, base); g.closePath(); g.fill();
    g.save(); g.clip();
    for (let i = 0; i < 40; i++) { const cx = x - 18 + hash(i + 900) * 36, cy = 150 + hash(i + 910) * (base - 150), r = 4 + 8 * hash(i + 920);
      g.fillStyle = ["#d9d2b3", "#8d8761", "#a59c74", "#e4dec6", "#7c7856"][i % 5]; g.beginPath(); g.ellipse(cx, cy, r * 1.2, r, hash(i) * 3, 0, TAU); g.fill(); }
    g.fillStyle = "rgba(50,40,20,0.25)"; g.fillRect(x + 4, 150, 14, base - 150);
    g.restore();
    g.beginPath(); g.moveTo(x - 17, base); g.quadraticCurveTo(x - 12, 300, x - 9, 150); g.moveTo(x + 9, 150); g.quadraticCurveTo(x + 12, 300, x + 17, base); g.stroke();
    // ramas
    g.strokeStyle = "#8d8761"; g.lineWidth = 7;
    g.beginPath(); g.moveTo(x, 170); g.quadraticCurveTo(x + lado * 40, 120, x + lado * 90, 80); g.moveTo(x, 160); g.quadraticCurveTo(x - lado * 30, 110, x - lado * 70, 70); g.stroke();
    // rejilla del alcorque
    g.fillStyle = "#3c3a36"; g.beginPath(); g.ellipse(x, base - 2, 34, 5, 0, 0, TAU); g.fill();
    // copa
    const cx = x + lado * 60, cy = 30;
    const cols = ["#4d7431", "#5f8a3a", "#6f9a43", "#7fab4b", "#9cc45a"];
    for (let i = 0; i < 46; i++) {
      const an = hash(i + 800) * TAU, d = Math.sqrt(hash(i + 810)), rx = 210, ry = 130;
      const px = cx + Math.cos(an) * d * rx, py = cy + Math.sin(an) * d * ry, r = 30 + 26 * hash(i + 820);
      g.fillStyle = cols[Math.min(4, Math.floor(hash(i + 830) * 3 + (py < cy ? 2 : 0)))];
      g.beginPath(); g.arc(px, py, r, 0, TAU); g.fill();
    }
    g.fillStyle = "rgba(255,240,170,0.22)";
    for (let i = 0; i < 14; i++) { const px = cx - lado * 60 + (hash(i + 850) - 0.5) * 260, py = cy - 40 + hash(i + 860) * 100; g.beginPath(); g.arc(px, py, 10 + 10 * hash(i + 870), 0, TAU); g.fill(); }
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const kl = tramo(t, 2.65, 3.55) * (1 - tramo(t, 4.4, 5.5));
    const kg = tramo(t, 7.05, 8.05) * (1 - tramo(t, 9.95, 11.2));
    return { k: 1 + 0.1 * kl + 0.07 * kg, x: 512 + 78 * kl - 60 * kg, y: 300 + 6 * kl + 20 * kg };
  }

  function pose(t) { const a = tau(t); return { g: poseG(a), b: poseB(a), a }; }

  class GuillermoGabachoChilena extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !GB.listo()) return;
      if (!fondo) fondo = creaFondo();
      if (!SPR.b) { creaBalon("b", "#1f2d5a", "#4a5578"); creaBalon("g", "#17151b", "#4b4652"); }
      if (!GEO) preparaGeo();
      const a = tau(t), pg = poseG(a), pb = poseB(a), qb = balonB(a), qg = balonG(a);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      let tb = 0;
      for (const [t0, f] of [[T.pum, 5], [T.barriga, 2.5], [T.cara, 1.6]]) if (t >= t0) tb += f * Math.exp(-(t - t0) * 8) * suave(fase(t, t0, t0 + 0.03));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 40) * tb, ruido(t * 40 + 13) * tb * 0.7);
      g.drawImage(fondo, -40, -50);
      // papelera (boca), balón dentro, cuerpo
      papeleraBoca(g);
      const rotBalB = giroBalonB(a);
      // al llegar a la papelera, el balón pasa por detrás del borde de delante (y de la tapa)
      const enBoca = qb.dentro || (qb.i === GEO.ultimo && a > KB.papelera - 0.12);
      if (enBoca) dibujaBalon(g, qb, rotBalB, "b");
      papelera(g, a);
      // sombras
      const sGB = enGiro(pb, pb.o), altoB = clamp((pb.o.y - sGB.y) / 120);
      g.save(); g.fillStyle = "rgba(40,28,15,0.28)";
      g.beginPath(); g.ellipse(sGB.x + 8, SUELO + 2, 78 + 40 * Math.abs(Math.sin(pb.gr.phi)) - 25 * altoB, 7 - 2 * altoB, 0, 0, TAU); g.globalAlpha = 1 - 0.5 * altoB; g.fill(); g.restore();
      const sGG = enGiro(pg, pg.o), altoG = clamp((pg.o.y - sGG.y) / 140), tumb = pg.gr ? Math.abs(Math.sin(pg.gr.phi)) : 0;
      g.save(); g.fillStyle = "rgba(40,28,15,0.28)"; g.globalAlpha = 1 - 0.4 * altoG * (1 - tramo(a, U.cae0, U.pum));
      g.beginPath(); g.ellipse(sGG.x + 8 - 30 * tumb, SUELO + 2, 78 + 110 * tumb - 20 * altoG, 7, 0, 0, TAU); g.fill(); g.restore();
      if (!qb.dentro) sombraBalon(g, qb, lerp(SUELO, PAP.base, qb.i === GEO.ultimo ? fase(a, KB.contacto, KB.papelera) : 0), qb.e);
      if (qg.y > -60) sombraBalon(g, qg, SUELO);
      // fantasmas de la cámara lenta (detrás de Gabacho)
      fantasmas(g, t);
      // Guillermo (con su balón debajo de la suela, si aún no lo ha levantado)
      const balonDetras = a < U.cuchara + 0.02;
      if (balonDetras) dibujaBalon(g, qg, qg.giro, "g");
      dibuja(G, g, pg, t);
      if (!balonDetras && qg.y > -60) { estela(g, t, balonG); dibujaBalon(g, qg, qg.giro, "g", aplastaBalon(a, [[U.barriga, GEO.barriga], [U.cara, GEO.cara0]])); }
      // Gabacho
      dibuja(GB, g, pb, t);
      arcoPie(g, t);
      if (!enBoca) {
        if (a > U.flick) estela(g, t, balonB);
        dibujaBalon(g, qb, rotBalB, "b", aplastaBalon(a, GEO.VB.slice(1, GEO.ultimo + 1)));
      }
      // efectos
      for (const [tc, c] of GEO.toques) toque(g, t, tc, c);
      lineasFoco(g, t, GEO.C);
      const sup = c => P(c.x - c.n.x * RB * 0.9, c.y - c.n.y * RB * 0.9);
      impacto(g, t, T.kick, sup(GEO.C), 22, 0.45);
      efectoPapelera(g, t);
      polvo(g, t, KR.aterriza, XB, SUELO, 0.7, 0.7);
      suspendido(g, t, pg);
      polvo(g, t, T.pum, LXG - 30, SUELO, 1.1, 0.9);
      impacto(g, t, T.barriga, sup(GEO.barriga), 16); boingLineas(g, t, GEO.barriga);
      impacto(g, t, T.cara, sup(GEO.cara0), 14);
      const cab = pant(G, pg, G.cabeza(pg).a(P(780, 520)));
      estrellitas(g, t, cab, tramo(t, T.rueda + 0.1, T.rueda + 0.4) * (1 - tramo(t, T.gFin - 0.2, T.gFin + 0.3)));
      lineasPalmas(g, t, pb);
      g.restore();
      // cámara lenta: tono frío y viñeta
      const kl = lenta(t);
      if (kl > 0.01) {
        if (!VIN) {
          VIN = document.createElement("canvas"); VIN.width = W / 2; VIN.height = H / 2; const h = VIN.getContext("2d"); h.scale(0.5, 0.5);
          h.fillStyle = "rgba(70,110,170,0.10)"; h.fillRect(0, 0, W, H);
          const v = h.createRadialGradient(W / 2, H / 2, 260, W / 2, H / 2, 640); v.addColorStop(0, "rgba(10,20,40,0)"); v.addColorStop(1, "rgba(10,20,40,0.45)");
          h.fillStyle = v; h.fillRect(0, 0, W, H);
        }
        g.save(); g.globalAlpha = kl; g.drawImage(VIN, 0, 0, W, H); g.restore();
      }
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00073", nombre: "Guillermo y Gabacho · La chilena", crear: () => new GuillermoGabachoChilena() });
  window.__A2D_00073 = { pose, T, DUR, tau, KB, KR, geo: () => GEO };
})();
