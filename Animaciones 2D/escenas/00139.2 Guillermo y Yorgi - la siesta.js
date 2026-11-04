"use strict";
/* 00139 · Guillermo y Yorgi · La siesta
 *
 * Negro → la terraza de un bar en la sobremesa, con sol de media tarde: la esquina de la fachada ocre
 * con su zócalo de azulejos, la puerta con cortina de tiras y un farol de forja; un murete encalado con
 * remate de azulejo y geranios; detrás, colinas con olivos, cipreses y un pueblo blanco con campanario;
 * a la derecha una pérgola con buganvilla y un limonero en su maceta; suelo de barro. En medio, una
 * mesita de mármol con los restos de la comida (la raspa del pescado, una caña, un tinto de verano) y
 * una sombrilla grande de rayas con flecos. Dos tumbonas de lona de rayas, una frente a otra.
 *
 * Yorgi se da palmaditas en la barriga, se estira a lo grande, bosteza… y se queda frito en el acto
 * (la cabeza cae contra la lona, la boca abierta, un brazo colgando): ronca con pompas (sin zetas).
 * Guillermo alucina, se ríe y se tumba. 1) Una mosca: le ronda, se le posa en la nariz, Guillermo abre
 * un ojo y ¡zas!: se da en la frente; la mosca se va al plato de la raspa. 2) La tarde avanza: el sol
 * sale por debajo de la sombrilla y les da en la cara; Guillermo se hace visera y coge las gafas de sol
 * que lleva colgadas de la camiseta; a Yorgi, dormido, se le frunce el ceño. 3) Yorgi coge muchísimo
 * aire y suelta un ronquido gordo: ondas que cruzan la terraza, la mosca sale volando, los flecos se
 * agitan y a Guillermo se le va el pelo hacia atrás (vuelve a su sitio con rebote). Guillermo le mira
 * fatal… suspira, mira las gafas, apunta con la lengua fuera y se las lanza: vuelan dando vueltas por
 * encima de la mesa y le caen a Yorgi en la cara, perfectas (¡clic!, destello). Yorgi sonríe en sueños
 * y ronca bajito; Guillermo, pasmado, se viene arriba y hace «¡sí!» con el puño. 4) Sin gafas, coge la
 * servilleta de cuadros del regazo, la sacude y se la echa por la cara. Roncan los dos: primero a
 * destiempo y luego a la vez (la servilleta se infla al soltar el aire); las pompas crecen, se sueltan,
 * vuelan hasta el centro y se funden en una gorda que tiembla… ¡plof!: los dos dan un respingo y siguen
 * durmiendo. La mosca vuelve y se posa en las gafas de Yorgi, frotándose las patas → negro.
 *
 * Todo depende de `t` (determinista). Las gafas se dibujan en unidades del retrato de Yorgi (origen en
 * el puente) con un marco de pantalla: colgadas del cuello (capa del torso de Guillermo), en la pinza
 * de la mano (debajo de los dedos), en el aire (parábola girando, con estela) y en la cara de Yorgi; al
 * aterrizar el marco del vuelo acaba en el de la cara. El pelo al viento es la propia pieza de la
 * cabeza de Guillermo en franjas (como 00077): se borra con el fondo cacheado (la lona de la tumbona)
 * y se vuelve a dibujar desplazado en la dirección de la ráfaga, en el marco de la cabeza recostada.
 * Respiración: una fase por personaje; la de Guillermo se acompasa con la de Yorgi.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, mezcla, hash, campana, ruido } = M2;
  const G = Guillermo, Yo = Yorgi, R = Recortes;
  const DUR = 14.6;
  const TINTA = "#0b0a0e", TAU = Math.PI * 2;
  const P = (x, y) => ({ x, y });

  /* ---------- guion (s) ---------- */
  const T = {
    // 1 · después de comer: Yorgi se da palmaditas, bosteza y se duerme en el acto
    palma0: 0.35, palma1: 0.95, bostezo0: 0.98, bostezo1: 1.5, cae: 1.52, dormido: 1.74,
    gMira: 0.95, gVe: 1.78, gRie: 2.0, gTumba0: 2.12, gTumba1: 2.5, gCierra: 2.42,
    // 2 · la mosca
    mosca0: 2.42, moscaNariz0: 2.98, moscaNariz1: 3.2, gOjo: 3.1, gArma: 3.3, gPum: 3.46, gAu1: 3.75,
    moscaPlato: 3.95, gCalma: 4.02,
    // 3 · el sol
    sol0: 4.1, sol1: 4.58, gAprieta: 4.6, gEntorna: 4.8, visera0: 4.86, visera1: 5.06,
    cuello0: 5.12, cuello1: 5.34, gafasArriba: 5.6,
    // 4 · el ronquido gordo
    inspira0: 5.4, inspira1: 5.86, sopla: 5.9, rafaga: 6.0, rafaga1: 6.46, vuelve1: 6.86,
    gMiraY: 5.55, gFuria: 6.88, gSuspira: 7.3, gIdea: 7.55,
    // 5 · las gafas, por el aire hasta la cara de Yorgi
    apunta0: 7.62, apunta1: 7.98, lanza0: 8.0, lanza1: 8.1, aterriza: 8.62, clic: 8.66, yFeliz: 8.78,
    gAsombro: 8.66, gChulo: 8.98, punio0: 8.98, punio1: 9.14,
    // 6 · la servilleta a la cara
    serv0: 9.3, serv1: 9.52, sacude0: 9.52, sacude1: 9.74, cara0: 9.74, cara1: 10.06, mano1: 10.36, gDuerme: 9.95,
    // 7 · roncan a la vez: las pompas se juntan y ¡plof!
    sinc0: 10.4, sinc1: 11.25, junta0: 12.08, junta1: 12.5, plof: 12.8, respingo: 12.82,
    // 8 · final: la mosca se posa en las gafas de Yorgi
    moscaVuelve: 12.92, moscaGafas: 13.5,
    fin: 13.95
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const angDif = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const lerpAng = (a, b, k) => a + angDif(a, b) * k;
  const rota = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const muelle = (t, t0, w, amort) => { const u = t - t0; return u > 0 ? Math.exp(-u * amort) * Math.sin(u * w) : 0; };
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const DD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const ABIERTA = D(1, 1, 1, 1, 1), FLOJA = D(0.55, 0.62, 0.56, 0.52, 0.48), RELAJA = D(0.7, 0.8, 0.78, 0.74, 0.7),
    PINZA_D = D(.46,.25,.22,.18,.16), PUNO = D(0.1, 0.06, 0.06, 0.06, 0.06), COGE = D(0.4, 0.3, 0.26, 0.24, 0.22),
    VISERA = D(0.9, 1, 1, 1, 1), CUELGA = D(0.6, 0.75, 0.72, 0.7, 0.66);

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
  function miraA(e, Rg, p, q, w, cx, cy) {
    if (w <= 0.001 || !q) return;
    const o = Rg.aPantalla(p, Rg.cabeza(p).a({ x: cx, y: cy }));
    let dx = q.x - o.x, dy = q.y - o.y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    if (p.espejo) dx = -dx;
    // la mirada va en el marco de la cara (girada con la cabeza)
    const r = rota({ x: dx, y: dy }, -p.cabeza.ang);
    e.mx = lerp(e.mx, 0.95 * r.x, w); e.my = lerp(e.my, 0.95 * r.y, w);
  }

  /* =====================================================================================
   * DISPOSICIÓN (px de pantalla, antes de la cámara)
   * ===================================================================================== */
  const S = 0.30, SUELO = 548, Y_PEL = 492;
  const XG = 262, XY = 762;                       // pelvis: Guillermo (izquierda, mira a la derecha), Yorgi (derecha, espejo)
  const MESA = { x: 512, y: 402, rx: 64, ry: 15, pie: 480 };
  const PALO = { x: 512, y0: 402, y1: 64 };
  const TOLDO = { x: 512, yA: 14, yB: 126, rx: 372, fleco: 150 };
  const HZ = 252;                                  // horizonte (colinas lejanas)
  const MURO = { y0: 336, y1: 394 };               // murete encalado
  const PISO = 394;                                // donde empieza el suelo de la terraza

  /* ---------- puntos de los retratos ---------- */
  const NARIZ_Y = P(897, 630), BOCA_Y = P(846, 690);       // Yorgi: ventanilla de la nariz, boca
  const PUENTE_Y = P(884, 527), ANG_GAFAS = 0.343;           // Yorgi: puente de la nariz y línea de los ojos
  const BOCA_G = P(806, 744), NARIZ_G = P(857, 668);
  const FRENTE_G = P(800, 470);
  const CENTRO_G = P(800, 600);

  /* =====================================================================================
   * MANOS: pistas [t0, t1, objetivo, curva]
   * objetivo { tr: [x, y] } punto del torso (hoja) | { cab: P } punto del retrato | { scr: P | fn } pantalla
   * mu en pantalla (hacia el codo); sin mu, apunta al hombro (+ muOff)
   * ===================================================================================== */
  const PINZA = { x: 7.98, y: 9.18 }, PALMA = { x: 0, y: 1 }, DEDOS = { x: 0, y: 14 };
  const offMano = (Rg, m, q) => { const r = rota(q, m.mu + Math.PI / 2); return rota({ x: r.x * Rg.JK, y: r.y * Rg.JK }, m.ang || 0); };
  const ptMano = (Rg, p, m, q) => { const o = offMano(Rg, m, q); return Rg.aPantalla(p, { x: m.x + o.x, y: m.y + o.y }); };
  function puntaDedo(d) {
    const ab=(d.indice+d.medio+d.anular+d.menique)/4, a=.05*(.4+.9*ab),l=3.2+12.8*Math.pow(d.medio,.85);
    return P(2.3+l*Math.sin(a),4.5+l*Math.cos(a));
  }
  const R_M = Rg => Rg.MUNECA_R * Rg.JK;
  const DOBLA = { g: { cerca: -1, lejos: -1 }, y: { cerca: -1, lejos: 1 } };
  function resolutor(Rg, p, lado) {
    const Tr = Rg.tronco(p), dob = DOBLA[Rg === G ? "g" : "y"][lado], hom = Tr(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO);
    return o => {
      let q0;
      if (o.tr) q0 = Tr(P(o.tr[0], o.tr[1]));
      else if (o.cab) q0 = Rg.cabeza(p).a(o.cab);
      else { const sc = typeof o.scr === "function" ? o.scr() : o.scr; q0 = Rg.aHoja(p, sc); }
      let mu;
      if (o.mu !== undefined) mu = p.espejo ? Math.PI - o.mu : o.mu;
      else mu = Math.atan2(hom.y - q0.y, hom.x - q0.x) + (o.muOff || 0) * (p.espejo ? -1 : 1);
      const m = { mu, ang: 0 };
      const f = offMano(Rg, m, o.ref || PALMA);
      return { x: q0.x - f.x, y: q0.y - f.y, mu, ang: 0, puno: o.puno ?? 1, dedos: o.dedos || FLOJA, dobla: o.dobla ?? dob };
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
  function alcanza(Rg, p, m, lado, k = 1.04) {
    const h = Rg.tronco(p)(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO), L = (lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L) * k;
    const o = rota({ x: Math.cos(m.mu) * R_M(Rg), y: Math.sin(m.mu) * R_M(Rg) }, m.ang || 0);
    const dx = m.x + o.x - h.x, dy = m.y + o.y - h.y, d = Math.hypot(dx, dy);
    if (d > L) { const f = L / d; m.x = h.x + dx * f - o.x; m.y = h.y + dy * f - o.y; }
    return m;
  }
  const manoDe = m => ({ x: m.x, y: m.y, ang: m.ang, mu: m.mu, dobla: m.dobla, puno: m.puno, dedos: m.dedos });
  let BASE_M = null;
  function conCamara(g, f) { g.save(); g.setTransform(BASE_M); f(); g.restore(); }
  const trW = (Rg, p, q) => Rg.aPantalla(p, Rg.tronco(p)(q));
  const cabW = (Rg, p, q) => Rg.aPantalla(p, Rg.cabeza(p).a(q));

  /* =====================================================================================
   * RESPIRACIÓN Y RONQUIDOS
   * fase: vueltas (1 = una respiración). Valor b: −1 coge aire, +1 lo suelta (la pompa crece).
   * ===================================================================================== */
  const PER_Y0 = 1.18, PER_Y1 = 0.92, T_CAMBIA = 9.0;
  const faseY = t => t < T_CAMBIA ? (t - T.dormido) / PER_Y0 : (T_CAMBIA - T.dormido) / PER_Y0 + (t - T_CAMBIA) / PER_Y1;
  // Guillermo duerme desde la servilleta; empieza a contratiempo y se acompasa con Yorgi
  const faseG = t => faseY(t) + 0.5 * (1 - tramo(t, T.sinc0, T.sinc1));
  const ondaResp = f => -Math.cos(TAU * f);          // f = 0: acaba de coger aire (−1); f = 0,5: soltado (+1)
  // el ronquido gordo: coge muchísimo aire y lo suelta de golpe
  const gordo = t => dentro(t, T.inspira0 - 0.25, T.inspira0, T.rafaga1, T.vuelve1);
  function respY(t) {
    if (t < T.dormido) return 0;
    const dorm = tramo(t, T.dormido, T.dormido + 0.4);
    let b = ondaResp(faseY(t)) * dorm;
    const w = gordo(t);
    if (w > 0) {
      const big = t < T.sopla ? -1.7 * tramo(t, T.inspira0, T.inspira1, salida) : -1.7 + 3.9 * tramo(t, T.sopla - 0.02, T.sopla + 0.08, salida) - 1.2 * tramo(t, T.sopla + 0.15, T.vuelve1);
      b = lerp(b, big, w);
    }
    return b;
  }
  // cuánto ronca (tamaño de pompas y ondas): crece con el sol, baja con las gafas
  const fuerzaY = t => (0.55 + 0.45 * tramo(t, T.sol1 - 0.1, T.sol1 + 0.4)) * (1 - 0.5 * tramo(t, T.clic, T.clic + 0.5)) * (1 + 0.6 * tramo(t, T.sinc1, T.junta0));
  const durmiendoG = t => tramo(t, T.cara1 - 0.1, T.cara1 + 0.2);
  const respG = t => ondaResp(faseG(t)) * durmiendoG(t);

  /* ---------- la ráfaga del ronquido sobre Guillermo ---------- */
  function llegadaRafaga(q){const b=cabW(Yo,poseY(T.sopla),BOCA_Y),r=Math.hypot(q.x-b.x,(q.y-b.y)/.8);
    return T.sopla+.6*(1-Math.cbrt(1-clamp((r-26)/860)));
  }
  function vientoG(t) {
    if (t < T.sopla || t > T.vuelve1 + 0.4) return { k: 0, v: 0 };
    const inicio=memoria("llegaPelo",()=>llegadaRafaga(cabW(G,cuerpoG(T.sopla-.02),P(760,310))));
    const sube=tramo(t,inicio,inicio+.095,salida);
    const vuelve = tramo(t, T.rafaga1, T.rafaga1 + 0.2, entrada);
    // vuelve a su sitio con rebote (los pinchos tienen gomina)
    const reb = t > T.rafaga1 + 0.2 ? -0.22 * Math.exp(-(t - T.rafaga1 - 0.2) * 7) * Math.sin((t - T.rafaga1 - 0.2) * 22) : 0;
    const k = sube * (1 - vuelve) + reb;
    const v = tramo(t, inicio, inicio + 0.06) * (1 - tramo(t, T.rafaga1 - 0.06, T.rafaga1 + 0.05));
    return { k, v };
  }

  /* =====================================================================================
   * EL SOL: sale por debajo del toldo (la tarde avanza a cámara rápida)
   * ===================================================================================== */
  const SOL0 = P(586, 82), SOL1 = P(604, 214);
  function sol(t) {
    const k = tramo(t, T.sol0, T.sol1, suave5);
    return { x: lerp(SOL0.x, SOL1.x, k), y: lerp(SOL0.y, SOL1.y, k), k, luz: tramo(t, T.sol1 - 0.18, T.sol1 + 0.06) };
  }

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha), tumbado en su tumbona
   * ===================================================================================== */
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const CUERPOS_G = {
    inicio: { torso: -0.8, cab: -0.42, px: 0, py: 0 },
    mira: { torso: -0.78, cab: -0.34, px: 0, py: 0 },
    ve: { torso: -0.74, cab: -0.28, px: 2, py: -2 },
    rie: { torso: -0.8, cab: -0.46, px: 0, py: 0 },
    tumba: { torso: -0.84, cab: -0.55, px: -2, py: 2 },
    acecha: { torso: -0.8, cab: -0.42, px: 0, py: 0 },
    pum: { torso: -0.86, cab: -0.66, px: -3, py: 2 },
    sol: { torso: -0.76, cab: -0.3, px: 0, py: 0 },
    teme: { torso: -0.74, cab: -0.36, px: 0, py: 0 },
    viento: { torso: -0.9, cab: -0.6, px: -4, py: 3 },
    furia: { torso: -0.6, cab: -0.24, px: 3, py: -3 },
    suspira: { torso: -0.72, cab: -0.36, px: 0, py: 0 },
    apunta: { torso: -0.58, cab: -0.26, px: 3, py: -3 },
    lanza: { torso: -0.48, cab: -0.2, px: 5, py: -4 },
    chulo: { torso: -0.7, cab: -0.36, px: 1, py: -1 },
    servi: { torso: -0.72, cab: -0.34, px: 0, py: 0 },
    duerme: { torso: -0.84, cab: -0.56, px: -2, py: 2 }
  };
  const GUION_CUERPO_G = [
    [T.gMira, T.gMira + 0.3, "mira"], [T.gVe, T.gVe + 0.12, "ve", salida], [T.gRie, T.gRie + 0.2, "rie"],
    [T.gTumba0, T.gTumba1, "tumba"], [T.gOjo, T.gOjo + 0.2, "acecha"], [T.gPum - 0.02, T.gPum + 0.08, "pum", salida],
    [T.gAu1, T.gCalma + 0.2, "tumba"], [T.gEntorna, T.visera1, "sol"], [T.gMiraY, T.inspira1, "teme"],
    [T.rafaga - 0.02, T.rafaga + 0.1, "viento", salida], [T.rafaga1, T.vuelve1, "teme"], [T.gFuria, T.gFuria + 0.18, "furia", salida],
    [T.gSuspira, T.gSuspira + 0.3, "suspira"], [T.apunta0, T.apunta1, "apunta"], [T.lanza0, T.lanza1, "lanza", salida],
    [T.lanza1 + 0.1, T.gAsombro + 0.1, "apunta"], [T.gChulo, T.gChulo + 0.3, "chulo"], [T.serv0, T.serv1, "servi"],
    [T.cara0, T.mano1, "duerme"]
  ];
  const CARAS_G = {
    inicio: E({ mx: 0.85, my: 0.1, c: 0.4, h: 0.35, sd: 8, si: 10, sonr: 0.7, ancho: 1.02 }),
    mira: E({ mx: 0.95, my: 0.05, c: 0.25, sd: 10, si: 12, sonr: 0.55 }),
    ve: E({ mx: 0.95, my: 0.05, iris: 1.12, sd: 28, gd: 0.04, si: 30, gi: 0.04, abre: 12, ancho: 0.6, sonr: 0.15 }),
    rie: E({ mx: 0.9, c: 0.6, h: 0.7, sd: 14, si: 16, abre: 8, ancho: 1.08, sonr: 0.95 }),
    duerme: E({ mx: 0.6, c: 1, h: 0.25, sd: 6, si: 8, abre: 0, ancho: 1.0, sonr: 0.5 }),
    tic: E({ mx: 0.6, c: 1, z: 0.35, sd: -2, gd: -0.08, si: 14, gi: 0.12, abre: 0, ancho: 0.85, sonr: 0.0 }),
    ojo: E({ mx: 0.6, my: -0.3, c: 0.1, wd: 0.9, sd: -4, gd: -0.1, si: 16, gi: 0.1, abre: 0, ancho: 0.8, sonr: -0.15 }),
    acecha: E({ mx: 0.7, my: -0.4, c: 0.32, sd: -8, gd: -0.16, si: -6, gi: -0.14, abre: 0, ancho: 0.7, sonr: -0.25 }),
    pum: E({ mx: 0.5, c: 1, z: 1, sd: 10, gd: 0.16, si: 10, gi: 0.16, abre: 12, ancho: 0.8, sonr: -0.5 }),
    au: E({ mx: 0.7, c: 0.5, z: 0.4, sd: 14, gd: 0.18, si: 12, gi: 0.16, abre: 4, ancho: 0.75, sonr: -0.35 }),
    aprieta: E({ mx: 0.6, c: 1, z: 0.85, sd: -6, gd: -0.12, si: -4, gi: -0.1, abre: 2, ancho: 0.9, sonr: -0.35 }),
    sol: E({ mx: 0.8, my: -0.1, c: 0.72, z: 0.25, sd: -8, gd: -0.14, si: -6, gi: -0.12, abre: 4, ancho: 0.95, sonr: -0.3 }),
    gafas: E({ mx: 0.6, my: 0.45, c: 0.62, z: 0.15, sd: -2, gd: -0.06, si: 0, abre: 0, ancho: 0.9, sonr: 0.1 }),
    teme: E({ mx: 0.95, my: 0.05, iris: 0.86, c: 0.05, sd: 22, gd: 0.14, si: 24, gi: 0.14, abre: 6, ancho: 0.58, sonr: -0.3 }),
    viento: E({ mx: 0.8, c: 1, z: 0.95, sd: 18, gd: 0.2, si: 18, gi: 0.2, abre: 20, ancho: 1.2, sonr: -0.45 }),
    furia: E({ mx: 0.95, my: 0.05, c: 0.45, sd: -14, gd: -0.26, si: -12, gi: -0.24, abre: 0, ancho: 0.78, sonr: -0.4, mof: 0.15 }),
    suspira: E({ mx: 0.55, my: 0.45, c: 0.55, sd: 12, gd: 0.12, si: 14, gi: 0.12, abre: 8, ancho: 0.8, sonr: -0.05 }),
    apunta: E({ mx: 0.95, my: -0.05, c: 0.12, wd: 0.88, sd: -6, gd: -0.12, si: 14, gi: 0.1, abre: 9, ancho: 0.72, sonr: 0.25, lengua: 0.8 }),
    lanza: E({ mx: 0.95, my: -0.1, c: 0.2, sd: 8, si: 12, abre: 10, ancho: 0.95, sonr: 0.3 }),
    asombro: E({ mx: 0.95, my: 0.05, iris: 1.22, sd: 36, gd: 0.06, si: 38, gi: 0.06, abre: 22, ancho: 0.55, sonr: 0.2 }),
    chulo: E({ mx: 0.95, my: 0.05, c: 0.42, h: 0.3, sd: 6, gd: -0.06, si: 16, gi: 0.04, abre: 6, ancho: 1.1, sonr: 1.0 }),
    servi: E({ mx: 0.55, my: 0.6, c: 0.62, z: 0.2, sd: -4, gd: -0.08, si: -2, abre: 0, ancho: 0.95, sonr: 0.3 })
  };
  const GUION_CARA_G = [
    [T.gMira, T.gMira + 0.2, "mira"], [T.gVe, T.gVe + 0.08, "ve", salida], [T.gRie, T.gRie + 0.15, "rie"],
    [T.gCierra - 0.1, T.gCierra + 0.15, "duerme"],
    [T.moscaNariz0 - 0.05, T.moscaNariz0 + 0.05, "tic"], [T.moscaNariz1 - 0.04, T.moscaNariz1 + 0.04, "duerme"],
    [T.gOjo, T.gOjo + 0.1, "ojo", salida], [T.gOjo + 0.14, T.gOjo + 0.24, "acecha"], [T.gPum - 0.02, T.gPum + 0.04, "pum", salida],
    [T.gPum + 0.2, T.gPum + 0.4, "au"], [T.gCalma - 0.1, T.gCalma + 0.15, "duerme"],
    [T.gAprieta - 0.04, T.gAprieta + 0.06, "aprieta", salida], [T.gEntorna, T.gEntorna + 0.15, "sol"],
    [T.cuello0, T.cuello0 + 0.15, "gafas"], [T.gMiraY, T.gMiraY + 0.15, "teme"], [T.rafaga - 0.03, T.rafaga + 0.05, "viento", salida],
    [T.rafaga1 + 0.05, T.vuelve1 - 0.1, "teme"], [T.gFuria, T.gFuria + 0.1, "furia", salida], [T.gSuspira, T.gSuspira + 0.2, "suspira"],
    [T.apunta0, T.apunta0 + 0.15, "apunta"], [T.lanza0 - 0.02, T.lanza0 + 0.06, "lanza"], [T.gAsombro, T.gAsombro + 0.08, "asombro", salida],
    [T.gChulo, T.gChulo + 0.18, "chulo"], [T.serv0 - 0.1, T.serv0 + 0.1, "servi"], [T.cara0 + 0.1, T.cara1, "duerme"]
  ];

  const ASIENTOS=[P(253,766),P(262,736)], NUCA=P(571.1,308.6);
  const LONAS=[0,14].map(d=>[P(52+d,300),P(64+d,352),P(100,430),P(150,496),P(200,526),P(250,520),P(300,486)]);
  function curvaLona(l,i,t) {
    const a=l[Math.max(0,i-1)],b=l[i],c=l[i+1],d=l[Math.min(l.length-1,i+2)],v=1-t;
    return P(...["x","y"].map(k=>v**3*b[k]+3*v*v*t*(b[k]+(c[k]-a[k])/6)+3*v*t*t*(c[k]-(d[k]-b[k])/6)+t**3*c[k]));
  }
  function puntoLona(l,i,k,v) {
    let a=0,b=1;for(let j=0;j<18;j++){const m=(a+b)/2;if(curvaLona(l,i,m)[k]<v)a=m;else b=m;}
    return curvaLona(l,i,(a+b)/2);
  }
  function asiento(r,p){const i=r===G?0:1,m=trW(r,p,ASIENTOS[i]);return puntoLona(LONAS[i],5,"x",r===G?m.x:XG+XY-m.x).y;}
  function sienta(r,p,salto){const i=r===G?0:1,m=trW(r,p,ASIENTOS[i]);p.pelvis.y+=(asiento(r,p)-m.y-salto)/(p.s*r.K);}
  function apoyoNuca(p){const q=cabW(Yo,p,NUCA),l=LONAS[1],s=puntoLona(l,q.y<=352?0:1,"y",q.y);return P(XY+XG-s.x,q.y);}
  const BORDES_SUELA=[[[153.03,61.8],[155.42,71.4],[155.42,78.6],[148.25,85.8],[141.08,88.2],[131.52,90.6],[119.57,93],[55.06,93],[-42.91,78.6],[-54.86,76.2],[-62.03,73.8]],[[157.06,53.49],[157.06,70.15],[154.69,72.53],[149.94,74.91],[142.81,77.29],[130.94,79.67],[114.31,82.05],[66.81,82.05],[-35.31,65.39],[-47.19,63.01],[-54.31,60.63],[-59.06,58.25]]];
  function suela(r,p,l) {const pi=p.piernas[l],dy=Math.max(...BORDES_SUELA[r===G?0:1].map(([x,y])=>x*Math.sin(pi.ang)+y*Math.cos(pi.ang)));return r.aPantalla(p,P(pi.tob.x,pi.tob.y+dy)).y;}
  function apoya(r,p,l,h){const pi=p.piernas[l];pi.tob.y+=(SUELO-h-suela(r,p,l))/(p.s*r.K);}
  function cuerpoG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const despierto = 1 - durmiendoG(t);
    const respira = Math.sin(t * 2.2) * despierto * 0.8 + respG(t) * 0.9;
    const p = {
      x: XG, suelo: SUELO, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x + b.px / S, y: G.SUELO + (Y_PEL - SUELO) / S + b.py / S + respira * 1.2 },
      torso: b.torso + respira * 0.008, torsoEsc: { x: 1 + respira * 0.008, y: 1 + respira * 0.006 }, piernas: {},
      cabeza: { ang: b.cab - respira * 0.012, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // se ríe por lo bajo (hombros)
    const ri = dentro(t, T.gRie, T.gRie + 0.05, T.gTumba0, T.gTumba0 + 0.15);
    p.torso += 0.012 * Math.sin(t * 30) * ri; p.cabeza.ang += 0.02 * Math.sin(t * 30 + 1) * ri;
    // ¡pum!: la cabeza rebota contra la lona
    p.cabeza.ang -= 0.07 * muelle(t, T.gPum, 26, 7);
    // la ráfaga: la cara tiembla
    const vt = vientoG(t);
    p.cabeza.ang += 0.02 * Math.sin(t * 47) * vt.v; p.cabeza.esc.x += 0.012 * Math.sin(t * 39) * vt.v;
    // suspiro: el pecho baja
    const su = campana(t, T.gSuspira, T.gSuspira + 0.5);
    p.torsoEsc.y -= 0.02 * su; p.cabeza.dy += 4 * su;
    // ¡yes!: un botecito
    p.pelvis.y -= 8 * campana(t, T.punio0, T.punio1 + 0.1);
    // respingo del ¡plof!
    const rs = muelle(t, T.respingo, 30, 9);
    p.cabeza.ang += 0.05 * rs; p.pelvis.y -= 10 * Math.max(0, rs);
    // piernas: rodillas arriba, pies en el suelo; un pie se mece un poco
    const mece = Math.sin(t * 1.7) * despierto;
    p.piernas.cerca = { tob: { x: G.PELVIS.x + 392 + 6 * mece, y: TOB_G }, ang: 0 };
    p.piernas.lejos = { tob: { x: G.PELVIS.x + 436, y: TOB_G - 4 - 10 * Math.max(0, mece) }, ang: -0.12 * Math.max(0, mece) };
    // el respingo levanta los pies
    p.piernas.lejos.tob.y -= 30 * Math.max(0, rs); p.piernas.cerca.tob.y -= 18 * Math.max(0, rs);
    const bote=Math.max(0,rs);
    sienta(G,p,3*bote+2.4*campana(t,T.punio0,T.punio1+.1));
    apoya(G,p,"cerca",5.4*bote);apoya(G,p,"lejos",4+3*Math.max(0,mece)+9*bote);
    return p;
  }

  const cacheG = new Map();
  function poseG(t) {
    const k0 = t.toFixed(5);
    if (cacheG.has(k0)) return cacheG.get(k0);
    if (cacheG.size > 12) cacheG.clear();
    const p = poseG0(t); cacheG.set(k0, p); return p;
  }
  function poseG0(t) {
    const p = cuerpoG(t);
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    // la mosca: los ojos la siguen
    const m = moscaEn(t);
    const sig = dentro(t, T.gOjo + 0.05, T.gOjo + 0.15, T.gPum - 0.04, T.gPum);
    if (m) miraA(ex, G, p, m, sig, CENTRO_G.x, CENTRO_G.y);
    // la ráfaga
    const vt = vientoG(t);
    ex.abre += 4 * Math.sin(t * 43) * vt.v;
    // ronca bajo la servilleta
    const rg = respG(t);
    if (durmiendoG(t) > 0) { ex.abre = lerp(ex.abre, 6 + 8 * Math.max(0, rg), durmiendoG(t)); }
    p.cara = cara(ex, parpadeo(t, [0.62, 1.38, 4.98, 7.2, 9.22]));
    p.enfado = dentro(t, T.gFuria, T.gFuria + 0.12, T.gSuspira, T.gSuspira + 0.2);
    p.sudor = 0;
    manosG(p, t);
    // las gafas en la mano (debajo de los dedos)
    const ga = gafas(t, p);
    if (ga.capa === "mano") p.manoCerca.objeto = g => conCamara(g, () => dibujaGafas(g, ga));
    // mientras la mano va a cogerlas, las del cuello pasan a la capa de la mano (encima del antebrazo, debajo de los dedos)
    else if (ga.capa === "cuello" && t >= T.cuello0) { const M = marcoCuello(p); p.manoCerca.objeto = g => conCamara(g, () => dibujaGafas(g, ga, M)); }
    p.capaCabeza = (g, tt) => capaCabezaG(g, tt, p);
    p.capaTronco = (g, tt) => capaTroncoG(g, tt, p);
    return p;
  }

  /* ---------- manos de Guillermo ---------- */
  // reposo: la cercana en la barriga (encima de la servilleta), la lejana en el muslo
  const BARRIGA_G = { tr: [214, 610], mu: -2.1, dedos: D(0.5, 0.58, 0.54, 0.5, 0.46), dobla: -1 };
  const MUSLO_G = { tr: [352, 712], mu: -2.4, dedos: D(0.5, 0.58, 0.54, 0.5, 0.46), dobla: -1 };
  function manosG(p, t) {
    const res = resolutor(G, p, "cerca"), resL = resolutor(G, p, "lejos");
    const cuello = () => mundoMarco(marcoCuello(p),PUENTE);
    const rasca = (k) => ({ tr: [214 + 30 * k, 600 - 10 * k], mu: -2.1, dedos: RELAJA, dobla: -1 });
    /* ----- mano cercana ----- */
    const PC = [
      [0, 0, BARRIGA_G],
      // palmaditas satisfechas en la barriga
      [0.3, 0.48, rasca(1)], [0.48, 0.66, rasca(0)], [0.66, 0.84, rasca(1)], [0.84, 1.02, rasca(0)],
      // la mosca: se arma y ¡zas!… se da en la frente
      [T.gArma - 0.28, T.gArma - 0.12, { cab: P(500, 600), ref: PALMA, mu: 1.2, dedos: RELAJA, dobla: -1 }, entrada],
      [T.gArma - 0.12, T.gArma + 0.06, { cab: P(640, 200), ref: PALMA, mu: 1.75, dedos: ABIERTA, dobla: -1 }, salida],
      [T.gArma + 0.1, T.gPum, { cab: FRENTE_G, ref: puntaDedo(ABIERTA), mu: 2.4, dedos: ABIERTA, dobla: -1 }, entrada],
      [T.gPum + 0.18, T.gAu1, { cab: P(760, 430), ref: DEDOS, mu: 2.5, dedos: RELAJA, dobla: -1 }],
      [T.gAu1 + 0.05, T.gCalma + 0.2, BARRIGA_G],
      // visera contra el sol
      // (sube por detrás de la oreja para no taparse la cara)
      [T.visera0 - 0.12, T.visera0 + 0.06, { cab: P(520, 640), ref: PALMA, mu: 1.3, dedos: RELAJA, dobla: -1 }, entrada],
      [T.visera0 + 0.06, T.visera1 + 0.04, { cab: P(760, 488), ref: puntaDedo(VISERA), mu: 2.55, dedos: VISERA, dobla: -1 }, salida],
      // coge las gafas del cuello de la camiseta (baja otra vez por detrás de la oreja)
      [T.cuello0 - 0.06, T.cuello0 + 0.08, { cab: P(540, 650), ref: PALMA, mu: 1.4, dedos: RELAJA, dobla: -1 }],
      [T.cuello0 + 0.08, T.cuello1, { scr: cuello, ref: PINZA, mu: 2.4, dedos: PINZA_D, dobla: -1 }, salida],
      [T.cuello1 + 0.02, T.gafasArriba, { scr: () => trW(G, p, P(330, 300)), ref: PINZA, mu: 2.0, dedos: PINZA_D, dobla: -1 }],
      // ráfaga: aguanta las gafas
      [T.rafaga, T.rafaga + 0.12, { scr: () => trW(G, p, P(300, 330)), ref: PINZA, mu: 2.2, dedos: PINZA_D, dobla: -1 }],
      [T.gSuspira, T.gSuspira + 0.3, { scr: () => trW(G, p, P(320, 380)), ref: PINZA, mu: 2.2, dedos: PINZA_D, dobla: -1 }],
      // apunta (el brazo delante del pecho), coge impulso cruzando el cuerpo y las lanza de un golpe de muñeca
      [T.apunta0, T.apunta1 - 0.1, { scr: () => trW(G, p, P(470, 380)), ref: PINZA, mu: 2.75, dedos: PINZA_D, dobla: -1 }],
      [T.apunta1 - 0.08, T.lanza0, { scr: () => trW(G, p, P(250, 500)), ref: PINZA, mu: 2.2, dedos: PINZA_D, dobla: -1 }, entrada],
      [T.lanza0, T.lanza1, { scr: () => trW(G, p, P(560, 300)), ref: PINZA, mu:3.0,dedos:PINZA_D,dobla:-1 },entrada],
      [T.lanza1,T.lanza1+.08,{scr:()=>trW(G,p,P(550,304)),ref:PINZA,mu:3,dedos:ABIERTA,dobla:-1},salida],
      // ¡sí!: tira del puño hacia abajo
      [T.punio0 - 0.1, T.punio0 + 0.06, { scr: () => trW(G, p, P(430, 250)), ref: PALMA, mu: 2.6, dedos: PUNO, dobla: -1 }, salida],
      [T.punio0 + 0.06, T.punio1, { scr: () => trW(G, p, P(330, 470)), ref: PALMA, mu: 2.3, dedos: PUNO, dobla: -1 }, entrada],
      // la servilleta: del regazo, sacudida y a la cara
      [T.serv0 - 0.12, T.serv1, { scr: () => trW(G,p,enRegazo(REGAZO_Q[0])), ref: PINZA, mu: 2.3, dedos: PINZA_D, dobla: -1 }],
      [T.sacude0, T.sacude1, { scr: () => trW(G, p, P(330, 260)), ref: PINZA, mu: 2.0, dedos: PINZA_D, dobla: -1 }],
      [T.cara0, T.cara1, { cab: SERV_CARA[0], ref: PINZA, mu: 2.4, dedos: PINZA_D, dobla: -1 }],
      [T.cara1 + 0.04, T.mano1, BARRIGA_G]
    ];
    let C=pista(PC,t,res);
    if(t>T.lanza1-.075&&t<T.lanza1+.11){
      const dt=Math.max(0,t-T.lanza1),z=t<=T.lanza1?t:T.lanza1+.016*(1-Math.exp(-dt/.016));
      const q=tiro(z),dedos=DD(PINZA_D,ABIERTA,tramo(t,T.lanza1,T.lanza1+.075));
      const m=res({scr:q,ref:PINZA,mu:2.65,dedos,dobla:-1});
      const k=tramo(t,T.lanza1-.075,T.lanza1-.035)*(1-tramo(t,T.lanza1+.035,T.lanza1+.11));
      C={...C,x:lerp(C.x,m.x,k),y:lerp(C.y,m.y,k),mu:lerpAng(C.mu,m.mu,k),dedos:DD(C.dedos,m.dedos,k)};
    }
    // sacude la servilleta
    const sac = campana(t, T.sacude0 + 0.04, T.sacude1);
    C.y += 18 * Math.sin((t - T.sacude0) * 40) * sac;
    // respingo
    C.y -= 20 * Math.max(0, muelle(t, T.respingo, 30, 9));
    alcanza(G, p, C, "cerca");
    /* ----- mano lejana: en el muslo; puño de «¡sí!» ----- */
    const PL = [
      [0, 0, MUSLO_G],
      [T.gAsombro, T.gAsombro + 0.12, { tr: [372, 690], mu: -2.4, dedos: ABIERTA, dobla: -1 }, salida],
      [T.gChulo, T.gChulo + 0.2, MUSLO_G]
    ];
    const L = pista(PL, t, resL);
    alcanza(G, p, L, "lejos");
    p.manoCerca = manoDe(C); p.manoLejos = manoDe(L);
  }

  /* =====================================================================================
   * YORGI (derecha, mira a la izquierda), tumbado en la suya
   * ===================================================================================== */
  const TOB_Y = Yo.SUELO - Yo.TOBILLO_ALTO;
  const CUERPOS_Y = {
    inicio: { torso: -0.78, cab: -0.42, px: 0, py: 0 },
    palma: { torso: -0.78, cab: -0.36, px: 0, py: 0 },
    bosteza: { torso: -0.66, cab: -0.66, px: 2, py: -3 },
    cae: { torso: -0.84, cab: -0.72, px: -2, py: 2 },
    duerme: { torso: -0.82, cab: -0.66, px: -2, py: 2 },
    feliz: { torso: -0.82, cab: -0.6, px: -2, py: 2 }
  };
  const GUION_CUERPO_Y = [
    [T.palma0, T.palma0 + 0.2, "palma"], [T.bostezo0, T.bostezo1 - 0.1, "bosteza"], [T.cae, T.cae + 0.12, "cae", entrada],
    [T.cae + 0.12, T.dormido + 0.3, "duerme"], [T.yFeliz, T.yFeliz + 0.4, "feliz"]
  ];
  const CARAS_Y = {
    inicio: E({ mx: 0.85, my: 0.1, c: 0.45, h: 0.4, sd: 8, si: 8, sonr: 0.75, ancho: 1.05 }),
    palma: E({ mx: 0.6, my: 0.4, c: 0.5, h: 0.5, sd: 10, si: 10, abre: 4, sonr: 0.9, ancho: 1.08 }),
    bosteza: E({ mx: 0.4, c: 1, z: 0.45, sd: 16, gd: 0.1, si: 16, gi: 0.1, abre: 44, ancho: 0.75, sonr: -0.05 }),
    duerme: E({ mx: 0.4, c: 1, sd: 4, si: 4, abre: 14, ancho: 0.78, sonr: -0.05 }),
    ceno: E({ mx: 0.4, c: 1, z: 0.7, sd: -16, gd: -0.26, si: -16, gi: -0.26, abre: 14, ancho: 0.86, sonr: -0.45 }),
    feliz: E({ mx: 0.4, c: 1, h: 0.4, sd: 8, si: 8, abre: 2, ancho: 1.06, sonr: 0.85 })
  };
  const GUION_CARA_Y = [
    [T.palma0, T.palma0 + 0.15, "palma"], [T.bostezo0, T.bostezo0 + 0.2, "bosteza"], [T.cae - 0.05, T.dormido, "duerme"],
    [T.sol1 - 0.05, T.sol1 + 0.25, "ceno"], [T.yFeliz, T.yFeliz + 0.3, "feliz"]
  ];
  const cacheY = new Map();
  function poseY(t) {
    const k0 = t.toFixed(5);
    if (cacheY.has(k0)) return cacheY.get(k0);
    if (cacheY.size > 12) cacheY.clear();
    const p = poseY0(t); cacheY.set(k0, p); return p;
  }
  function poseY0(t) {
    const b = guion(GUION_CUERPO_Y, CUERPOS_Y, "inicio", t);
    const dorm = tramo(t, T.dormido, T.dormido + 0.3);
    const br = respY(t);
    const respira = Math.sin(t * 2.0 + 0.7) * (1 - dorm) * 0.8 + br * dorm;
    const p = { x: XY, suelo: SUELO, s: S, tirasLimpias: true, espejo: true, piernas: {},
      pelvis: { x: Yo.PELVIS.x + b.px / S, y: Yo.SUELO + (Y_PEL - SUELO) / S + b.py / S + respira * 1.4 },
      torso: b.torso - respira * 0.012, torsoEsc: { x: 1 + Math.max(0, -respira) * 0.032, y: 1 + Math.max(0, -respira) * 0.018 },
      cabeza: { ang: b.cab - Math.max(0, -br) * 0.07 * dorm + Math.max(0, br) * 0.03 * dorm, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    // al caer dormido: la cabeza rebota en la lona
    p.cabeza.ang -= 0.06 * muelle(t, T.cae + 0.12, 20, 7);
    // el ronquido gordo: la cabeza da un latigazo
    p.cabeza.ang += 0.06 * muelle(t, T.sopla, 34, 8);
    // ¡clic!: las gafas le aterrizan en la cara
    p.cabeza.ang -= 0.04 * muelle(t, T.clic, 30, 9);
    // respingo del ¡plof!
    const rs = muelle(t, T.respingo, 30, 9);
    p.cabeza.ang -= 0.06 * rs; p.pelvis.y -= 10 * Math.max(0, rs);
    // piernas
    p.piernas.cerca = { tob: { x: Yo.PELVIS.x + 396, y: TOB_Y }, ang: 0 };
    p.piernas.lejos = { tob: { x: Yo.PELVIS.x + 440, y: TOB_Y - 4 }, ang: 0 };
    p.piernas.lejos.tob.y -= 26 * Math.max(0, rs);
    const bote=Math.max(0,rs);sienta(Yo,p,3*bote);
    apoya(Yo,p,"cerca",0);apoya(Yo,p,"lejos",4+7.8*bote);
    const nuca=cabW(Yo,p,NUCA),tela=apoyoNuca(p),peso=tramo(t,T.cae,T.dormido)*(1-.75*bote);
    p.cabeza.dx-=(tela.x-nuca.x)*peso/(p.s*Yo.K);
    // cara
    const ex = guion(GUION_CARA_Y, CARAS_Y, "inicio", t);
    if (dorm > 0) {
      // ronca: abre la boca al coger aire; la cierra al soltarlo (la pompa crece)
      const f = fuerzaY(t);
      const ng = 1 - gordo(t);
      ex.abre += dorm * (Math.max(0, -br) * 16 * f - Math.max(0, br) * 8 * ng);
      ex.mof += dorm * Math.max(0, br) * 0.25 * ng;
      ex.sd += dorm * Math.max(0, -br) * 6; ex.si += dorm * Math.max(0, -br) * 6;
      // el soplido gordo: la boca bien abierta y los carrillos hinchados
      const sg = dentro(t, T.sopla - 0.05, T.sopla + 0.03, T.rafaga1 - 0.1, T.rafaga1 + 0.15);
      ex.abre += 22 * sg; ex.ancho += 0.2 * sg; ex.mof = Math.max(0, ex.mof - 0.25 * sg);
    }
    p.cara = cara(ex, parpadeo(t, [0.5]));
    manosY(p, t, dorm);
    return p;
  }
  function manosY(p, t, dorm) {
    const res = resolutor(Yo, p, "cerca"), resL = resolutor(Yo, p, "lejos");
    const BARRIGA = k => ({scr:()=>{const q=trW(Yo,p,P(238,598));return P(q.x-5*(1-k),q.y-10*(1-k));},ref:PALMA,mu:-.9,dedos:RELAJA,dobla:1});
    // la cercana: en el reposabrazos; al dormirse cuelga
    const COLGADA = { scr: () => { const h = trW(Yo, p, Yo.HOMBRO_C); return P(h.x + 22, h.y + 112); }, mu: -1.45, dedos: CUELGA, dobla: -1 };
    const ARRIBA_C = { scr: () => { const h = trW(Yo, p, Yo.HOMBRO_C); return P(h.x + 96, h.y - 26); }, mu: Math.PI - 0.12, dedos: PUNO, dobla: -1 };
    const ARRIBA_L = { scr: () => { const h = trW(Yo, p, Yo.HOMBRO); return P(h.x - 98, h.y - 34); }, mu: 0.1, dedos: PUNO, dobla: 1 };
    const REPOSO_C = { tr: [168, 600], mu: -1.0, dedos: RELAJA, dobla: -1 };
    const PC = [
      [0, 0, REPOSO_C],
      [T.bostezo0, T.bostezo0 + 0.3, ARRIBA_C, salida],
      [T.cae, T.cae + 0.22, COLGADA, entrada]
    ];
    const C = pista(PC, t, res);
    // el brazo colgando se balancea con la respiración
    const cu = tramo(t, T.cae + 0.2, T.dormido + 0.3);
    C.x += 4 * Math.sin(t * 1.6) * cu;
    alcanza(Yo, p, C, "cerca");
    const PL = [
      [0, 0, BARRIGA(0)],
      [T.palma0, T.palma0 + 0.15, BARRIGA(1)], [T.palma0 + 0.15, T.palma0 + 0.3, BARRIGA(0)],
      [T.palma0 + 0.3, T.palma0 + 0.45, BARRIGA(1)], [T.palma0 + 0.45, T.palma1, BARRIGA(0)],
      [T.bostezo0 + 0.05, T.bostezo0 + 0.35, ARRIBA_L, salida],
      [T.cae + 0.02, T.cae + 0.24, BARRIGA(0), entrada]
    ];
    const L = pista(PL, t, resL);
    alcanza(Yo, p, L, "lejos");
    p.manoCerca = manoDe(C); p.manoLejos = manoDe(L);
  }

  /* =====================================================================================
   * LAS GAFAS DE SOL (unidades del retrato de Yorgi; origen en el puente, eje x = línea de los ojos)
   * marco = { x, y, a, sx, sy } en pantalla (antes de la cámara)
   * ===================================================================================== */
  const CUELLO_GAFAS = P(262, 318);              // donde cuelgan del cuello de la camiseta (hoja de Guillermo)
  function marcoDe(f) {                          // f: local → pantalla
    const o = f(P(0, 0)), ex = f(P(1, 0)), ey = f(P(0, 1));
    const ux = { x: ex.x - o.x, y: ex.y - o.y }, uy = { x: ey.x - o.x, y: ey.y - o.y };
    const a = Math.atan2(ux.y, ux.x), sx = Math.hypot(ux.x, ux.y);
    const cr = ux.x * uy.y - ux.y * uy.x, sy = Math.hypot(uy.x, uy.y) * Math.sign(cr || 1);
    return { x: o.x, y: o.y, a, sx, sy };
  }
  const lerpMarco = (A, B, k) => ({ x: lerp(A.x, B.x, k), y: lerp(A.y, B.y, k), a: lerpAng(A.a, B.a, k), sx: lerp(A.sx, B.sx, k), sy: lerp(A.sy, B.sy, k) });
  // en la cara de Yorgi
  const PUENTE=P(-1,-30.5), PATILLA=P(-40,-6), CRISTAL=P(-88,-37);
  const mundoMarco=(M,q)=>{const r=rota(P(q.x*M.sx,q.y*M.sy),M.a);return P(M.x+r.x,M.y+r.y);};
  function ancla(M,marca,dest){const a=mundoMarco(M,marca);return {...M,x:M.x+dest.x-a.x,y:M.y+dest.y-a.y};}
  const marcoCaraY=p=>marcoDe(q=>{
    const a=Math.atan2(55,154)-Math.atan2(-2,162),k=Math.hypot(55,154)/Math.hypot(2,162);
    const v=rota(P((q.x+88)*k,(q.y-6)*k),a);return cabW(Yo,p,P(790+v.x,496+v.y));
  });
  const marcoCuello=p=>marcoDe(q=>{const r=rota(P((q.x-PATILLA.x)*.6,(q.y-PATILLA.y)*.6),1.25);return trW(G,p,P(CUELLO_GAFAS.x+r.x,CUELLO_GAFAS.y+r.y));});
  function marcoMano(p,a,sx=.6*S,sy=.6*S){return ancla({x:0,y:0,a,sx,sy},PUENTE,ptMano(G,p,p.manoCerca,PINZA));}
  const memo = new Map();
  const memoria = (k, f) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };
  // estado de las gafas: capa cuello | mano | aire | cara   (pG: pose de Guillermo con las manos ya puestas)
  function tiro(t){
    const a=memoria("salePuente",()=>trW(G,cuerpoG(T.lanza1),P(445,350)));
    const b=memoria("recibePuente",()=>mundoMarco(marcoCaraY(poseY(T.aterriza)),PUENTE));
    const u=(t-T.lanza1)/(T.aterriza-T.lanza1);return P(lerp(a.x,b.x,u),lerp(a.y,b.y,u)-600*u*(1-u));
  }
  function gafas(t, pG) {
    const KS = 0.6 * S;
    if (t < T.cuello1) return { capa: "cuello", pleg: 1 };
    if (t < T.lanza1) {
      // en la mano: del cuello a la altura de la cara, se abren; al apuntar se ponen derechas
      const M0 = memoria("c1", () => marcoCuello(cuerpoG(T.cuello1)));
      const k = tramo(t, T.cuello1, T.gafasArriba);
      const ang = lerpAng(M0.a, -0.2, k) + 0.25 * Math.sin((t - T.rafaga) * 50) * dentro(t, T.rafaga, T.rafaga + 0.05, T.rafaga1 - 0.1, T.rafaga1);
      const M=marcoMano(pG,lerpAng(ang,.15,tramo(t,T.apunta0,T.apunta1)),lerp(M0.sx,KS,k),lerp(M0.sy,KS,k));
      return { capa: "mano", M, pleg: 1 - tramo(t, T.cuello1 + 0.1, T.gafasArriba) };
    }
    if (t < T.aterriza) {
      // por el aire: parábola girando, del lanzamiento a la cara de Yorgi
      const A = memoria("l1", () => { const p = cuerpoG(T.lanza1); manosG(p, T.lanza1); return marcoMano(p,.15); });
      const B=memoria("llegada",()=>marcoCaraY(poseY(T.aterriza))),u=fase(t,T.lanza1,T.aterriza),v=suave(u);
      const dest=tiro(t);
      const a=A.a+(angDif(A.a,B.a+Math.PI)-TAU*2)*v,gr=1+.12*Math.sin(Math.PI*u);
      const M=ancla({x:0,y:0,a,sx:lerp(A.sx,B.sx,u)*Math.cos(Math.PI*v)*gr,sy:lerp(A.sy,-B.sy,u)*gr},PUENTE,dest);
      return {capa:"aire",M,pleg:0,canto:Math.sin(Math.PI*v)};
    }
    // en la cara de Yorgi: aterrizan con un botecito
    const pY = poseY(t), M = marcoCaraY(pY);
    const bote = muelle(t, T.aterriza, 34, 10) + Math.max(0, muelle(t, T.respingo, 30, 9));
    const fijo=mundoMarco(M,PUENTE);Object.assign(M,ancla({...M,a:M.a+.034*bote},PUENTE,fijo));
    return { capa: "cara", M, pleg: 0, brillo: tramo(t, T.clic + 0.12, T.clic + 0.2) * (1 - tramo(t, T.clic + 0.3, T.clic + 0.6)) };
  }

  function dibujaGafas(g, ga, M) {
    M = M || ga.M;
    g.save(); g.translate(M.x, M.y); g.rotate(M.a);
    if(ga.canto>.78){g.strokeStyle=TINTA;g.lineWidth=2.6*ga.canto;g.lineCap="round";g.beginPath();g.moveTo(0,-40*M.sy);g.lineTo(0,46*M.sy);g.stroke();}
    if(Math.abs(M.sx)>1e-6){g.scale(M.sx,M.sy);gafasLocal(g,ga.pleg||0,ga.brillo||0);}
    g.restore();
  }
  // las gafas en su marco local (unidades del retrato): lente cercana (−x) más grande
  function lente(g, cx, cy, rx, ry) {
    g.beginPath();
    g.moveTo(cx - rx, cy - ry * 0.75);
    g.quadraticCurveTo(cx - rx, cy - ry, cx - rx * 0.7, cy - ry);
    g.lineTo(cx + rx * 0.75, cy - ry);
    g.quadraticCurveTo(cx + rx, cy - ry, cx + rx, cy - ry * 0.6);
    g.quadraticCurveTo(cx + rx * 0.95, cy + ry * 0.75, cx + rx * 0.35, cy + ry);
    g.quadraticCurveTo(cx - rx * 0.4, cy + ry * 1.05, cx - rx * 0.85, cy + ry * 0.55);
    g.quadraticCurveTo(cx - rx * 1.02, cy + ry * 0.1, cx - rx, cy - ry * 0.75);
    g.closePath();
  }
  function gafasLocal(g, pleg, brillo) {
    g.lineJoin = "round"; g.lineCap = "round";
    // patilla cercana (se pliega detrás de la lente)
    const pa = pleg;
    const raiz = P(-150, -14);
    const fin = mezcla(P(-268, 70), P(-40, -6), pa);
    g.strokeStyle = TINTA; g.lineWidth = 15; g.beginPath(); g.moveTo(raiz.x, raiz.y); g.quadraticCurveTo(lerp(-215, -110, pa), lerp(10, -16, pa), fin.x, fin.y); g.stroke();
    g.strokeStyle = "#2c2a30"; g.lineWidth = 8; g.stroke();
    // lentes
    const L1 = [-88, 6, 64, 46], L2 = [74, 4, 46, 44];
    for (const [cx, cy, rx, ry] of [L1, L2]) {
      lente(g, cx, cy, rx, ry);
      const gr = g.createLinearGradient(0, cy - ry, 0, cy + ry);
      gr.addColorStop(0, "#1b2a3a"); gr.addColorStop(0.55, "#2c4a62"); gr.addColorStop(1, "#5b7f96");
      g.fillStyle = gr; g.fill();
      // reflejo
      g.save(); lente(g, cx, cy, rx, ry); g.clip();
      g.fillStyle = "rgba(255,255,255,0.32)"; g.beginPath(); g.moveTo(cx - rx * 0.7, cy + ry); g.lineTo(cx - rx * 0.1, cy - ry); g.lineTo(cx + rx * 0.22, cy - ry); g.lineTo(cx - rx * 0.38, cy + ry); g.closePath(); g.fill();
      g.fillStyle = "rgba(255,240,200,0.55)"; g.beginPath(); g.ellipse(cx + rx * 0.45, cy - ry * 0.45, rx * 0.16, ry * 0.12, -0.4, 0, TAU); g.fill();
      g.restore();
      lente(g, cx, cy, rx, ry); g.strokeStyle = TINTA; g.lineWidth = 13; g.stroke();
      g.strokeStyle = "#2c2a30"; g.lineWidth = 6; g.stroke();
    }
    // puente
    g.strokeStyle = TINTA; g.lineWidth = 12; g.beginPath(); g.moveTo(-26, -24); g.quadraticCurveTo(-4, -36, 30, -26); g.stroke();
    // ¡ting!: destello en la lente
    if (brillo > 0.01) { g.save(); g.globalAlpha = brillo; estrella4(g, -60, -24, 70 * brillo, 1, 0.3, "#ffffff"); g.restore(); }
  }

  /* =====================================================================================
   * LA SERVILLETA DE CUADROS (en el regazo → sacudida → sobre la cara)
   * ===================================================================================== */
  const SERV_REGAZO = P(250, 545);              // hoja de Guillermo (sobre la barriga)
  // sobre la cara (retrato de Guillermo): esquinas (arriba-atrás, arriba-delante, abajo-delante, abajo-atrás) y
  // puntos de control de cada borde (abomba sobre la frente, la nariz y la barbilla)
  const SERV_CARA = [P(640, 440), P(1010, 468), P(990, 905), P(650, 870)];
  const SERV_MID = [P(820, 392), P(1068, 690), P(820, 935), P(598, 650)];
  const SERV_BOCA = P(1034, 772);                 // por donde asoma la pompa (borde de delante, a la altura de la boca)
  function servilleta(t, p) {
    if (t < T.serv1) return { capa: "regazo" };
    const pin = ptMano(G, p, p.manoCerca, PINZA);
    const L = 100;                                   // lado (px de pantalla)
    // colgando de la pinza, aleteando al sacudirla
    const flap = Math.sin((t - T.sacude0) * 40) * campana(t, T.sacude0, T.sacude1 + 0.08);
    const abre = tramo(t, T.serv1, T.sacude1);
    const a = -0.35 + 0.5 * flap, e = lerp(0.4, 1, abre);
    const Q0 = [pin, P(pin.x + L * Math.cos(a) * e, pin.y + L * Math.sin(a) * e),
      P(pin.x + L * 0.75 * e + 14 * flap, pin.y + L * lerp(0.5, 1.15, abre)), P(pin.x - 10 + 8 * flap, pin.y + L * lerp(0.5, 0.95, abre))];
    const M0 = Q0.map((q, i) => { const r = Q0[(i + 1) % 4], m = mezcla(q, r, 0.5), dx = r.x - q.x, dy = r.y - q.y, l = Math.hypot(dx, dy) || 1;
      const o = (i % 2 ? 5 : -4) + 8 * flap * (i === 1 ? 1 : 0.4); return P(m.x - dy / l * o, m.y + dx / l * o); });
    // al cogerla: sale de la forma arrugada del regazo
    const kr = tramo(t, T.serv1, T.serv1 + 0.16);
    if (kr < 1) {
      const R0 = REGAZO_Q.map(q => trW(G, p, enRegazo(q))), RM = REGAZO_M.map(q => trW(G, p, enRegazo(q)));
      for (let i = 0; i < 4; i++) { Q0[i] = mezcla(R0[i], Q0[i], kr); M0[i] = mezcla(RM[i], M0[i], kr); }
    }
    Q0[0]=pin;
    if(t<T.cara0)return {capa:"mano",Q:Q0,Mi:M0};
    const {Q:Q1,Mi:M1}=telaCara(t,p);
    const k=tramo(t,T.cara0+.04,T.cara1,suave5);
    if(k>=1)return {capa:"cara",Q:Q1,Mi:M1};
    return {capa:"mano",Q:Q0.map((q,i)=>i?mezcla(q,Q1[i],k):pin),Mi:M0.map((q,i)=>mezcla(q,M1[i],k))};
  }
  function telaCara(t,p){
    const r = Math.max(0, respG(t));
    // ¡plof!: la servilleta da un salto y vuelve a caer
    const sal = Math.max(0, muelle(t, T.respingo, 26, 8));
    const Q1 = SERV_CARA.map((q, i) => cabW(G, p, i === 1 ? P(q.x + 30 * sal, q.y - 90 * sal) : i === 2 ? P(q.x + 50 * sal, q.y - 40 * sal) : q));
    const M1 = SERV_MID.map((q, i) => cabW(G, p, i === 1 ? P(q.x + 34 * r, q.y + 6 * r) : i === 2 ? P(q.x + 10 * r, q.y + 18 * r) : q));
    return {Q:Q1,Mi:M1};
  }

  /* =====================================================================================
   * LA MOSCA
   * ===================================================================================== */
  const PLATO = P(486,MESA.y-2-5.76);
  function moscaEn(t) {
    if (t < T.mosca0 || (t >= T.rafaga + 0.6 && t < T.moscaVuelve)) return null;
    const pG = cuerpoG(t), cab = cabW(G, pG, P(820, 560)), nariz = cabW(G, pG, NARIZ_G);
    if (t < T.mosca0 + 0.3) {
      const k = fase(t, T.mosca0, T.mosca0 + 0.3);
      const a=P(330,120),b=P(cab.x+58,cab.y-34);
      return { x: lerp(a.x, b.x, suave(k)) + 10*Math.sin(t*25)*Math.sin(Math.PI*k), y:lerp(a.y,b.y,suave(k))+14*Math.sin(t*13)*Math.sin(Math.PI*k), vx: -1, posada: 0 };
    }
    if (t < T.gPum - 0.03) {
      // ronda la cabeza; se posa un momento en la nariz
      const u = t - T.mosca0 - 0.3;
      const ronda = { x: cab.x + 58 * Math.cos(u * 5.2) + 12 * Math.sin(u * 17), y: cab.y - 34 + 30 * Math.sin(u * 10.4) + 7 * Math.sin(u * 23), vx: -Math.sin(u * 5.2) };
      const kn = dentro(t, T.moscaNariz0 - 0.12, T.moscaNariz0, T.moscaNariz1, T.moscaNariz1 + 0.1);
      const en = { x: nariz.x - 1.6, y: nariz.y-5.76, vx: -1 };
      // justo antes del manotazo: delante de la frente
      const kf = tramo(t, T.gArma - 0.1, T.gPum - 0.06);
      const fr = cabW(G, pG, P(830, 380));
      let q = mezcla(ronda, en, kn); q = mezcla(q, fr, kf);
      return { x: q.x, y: q.y, vx: kn > 0.5 ? -1 : ronda.vx, posada: kn };
    }
    if (t < T.moscaPlato) {
      // esquiva hacia arriba y se va a la mesa, al plato
      const k = fase(t, T.gPum - 0.03, T.moscaPlato);
      const a = cabW(G, pG, P(830, 380)), c = P(330, 170);
      const x = lerp(lerp(a.x, c.x, k), lerp(c.x, PLATO.x, k), k), y = lerp(lerp(a.y, c.y, k), lerp(c.y, PLATO.y, k), k);
      return { x: x + 6 * Math.sin(t * 31) * Math.sin(Math.PI*k), y: y + 8 * Math.sin(t * 19) * Math.sin(Math.PI*k), vx: 1, posada: tramo(k, 0.92, 1) };
    }
    const leva=llegadaRafaga(P(PLATO.x,PLATO.y));
    if(t<leva){
      // en el plato: anda un poco y se frota las patas
      const u = t - T.moscaPlato;
      return { x: PLATO.x + 8 * Math.sin(u * 1.3), y: PLATO.y, vx: Math.cos(u * 1.3) > 0 ? 1 : -1, posada: 1, frota: Math.sin(u * 24) * campana(t, 4.4, 5.4) };
    }
    if (t < T.rafaga + 0.6) {
      // ¡la ráfaga se la lleva!, dando tumbos
      const k=fase(t,leva,T.rafaga+.6);
      const inicio=PLATO.x+8*Math.sin((leva-T.moscaPlato)*1.3);
      return { x: inicio - 560 * entrada(k) - 40 * k, y: PLATO.y - 150 * Math.sin(Math.PI * k * 0.8) - 20 * k, vx: -1, posada: 0, gira: k * 14 };
    }
    // vuelve al final y se posa en las gafas de Yorgi
    const bord=mundoMarco(gafas(t,pG).M,CRISTAL),dst=P(bord.x+1.6,bord.y-5.76);
    if (t < T.moscaGafas) {
      const k = fase(t, T.moscaVuelve, T.moscaGafas);
      const a = P(560, 140);
      const x = lerp(a.x, dst.x, salida(k)) + 30 * Math.sin(t * 9) * (1 - k), y = lerp(a.y, dst.y, salida(k)) + 24 * Math.sin(t * 13) * (1 - k);
      return { x, y, vx: 1, posada: tramo(k, 0.9, 1) };
    }
    const u = t - T.moscaGafas;
    return { x: dst.x, y: dst.y, vx: 1, posada: 1, frota: Math.sin(u * 24) * tramo(t, T.moscaGafas + 0.15, T.moscaGafas + 0.3) };
  }
  function dibMosca(g, t, m) {
    if (!m) return;
    const vuela = 1 - (m.posada || 0);
    if (vuela > 0.3) {
      g.save(); g.fillStyle = "rgba(30,20,30,0.4)";
      for (let i = 1; i <= 4; i++) { const q = moscaEn(t - i * 0.04); if (!q || q.posada > 0.5) continue; g.beginPath(); g.arc(q.x, q.y, 1.6, 0, TAU); g.fill(); }
      g.restore();
    }
    g.save(); g.translate(m.x, m.y); g.rotate(m.gira || 0); g.scale(m.vx < 0 ? -1.6 : 1.6, 1.6);
    const al = vuela > 0.1 ? 0.55 + 0.35 * Math.sin(t * 90) : 0.85;
    const bat = vuela * Math.sin(t * 90);
    g.fillStyle = `rgba(220,235,255,${0.6 * al})`; g.strokeStyle = `rgba(80,90,110,${0.7 * al})`; g.lineWidth = 0.6;
    g.beginPath(); g.ellipse(-1.5, -3.6, 4.5, 2.2, -0.4 - 0.3 * bat + 0.5 * (1 - vuela), 0, TAU); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(0.5, -3.6, 4.5, 2.2, 0.4 + 0.3 * bat - 0.3 * (1 - vuela), 0, TAU); g.fill(); g.stroke();
    // patas (frotándose las delanteras)
    if (vuela < 0.7) {
      g.strokeStyle = "#1b1820"; g.lineWidth = 0.7;
      const fr = m.frota || 0;
      for (const [x0, x1] of [[-2, -4], [0, -1], [1.5, 3.2]]) { g.beginPath(); g.moveTo(x0, 1.5); g.lineTo(x1, 3.6); g.stroke(); }
      g.beginPath(); g.moveTo(3, 0.6); g.lineTo(4.6 + fr * 0.8, 2.6 - fr * 0.5); g.moveTo(3, 0.6); g.lineTo(4.4 - fr * 0.8, 2.8 + fr * 0.4); g.stroke();
    }
    g.fillStyle = "#1b1820"; g.beginPath(); g.ellipse(0, 0, 3.6, 2.5, 0, 0, TAU); g.fill();
    g.beginPath(); g.arc(3, -0.4, 1.9, 0, TAU); g.fill();
    g.fillStyle = "#c0392b"; g.beginPath(); g.arc(3.8, -0.9, 0.8, 0, TAU); g.fill();
    g.restore();
    if (vuela > 0.4) {
      g.save(); g.strokeStyle = `rgba(40,30,40,${0.5 * vuela})`; g.lineWidth = 1; g.lineCap = "round";
      for (let i = 0; i < 3; i++) { const a = t * 6 + i * 2.1, r = 13 + 3 * Math.sin(t * 40 + i); g.beginPath(); g.arc(m.x, m.y, r, a, a + 0.7); g.stroke(); }
      g.restore();
    }
  }

  /* =====================================================================================
   * CAPAS DE GUILLERMO
   * ===================================================================================== */
  function capaTroncoG(g, t, p) {
    // la servilleta arrugada en el regazo
    if (t < T.serv1) servRegazo(g, t, p);
    // las gafas colgadas del cuello de la camiseta
    if (t < T.cuello0) {
      g.save(); g.translate(CUELLO_GAFAS.x, CUELLO_GAFAS.y); g.rotate(1.25); g.scale(0.6, 0.6); g.translate(-PATILLA.x,-PATILLA.y);
      gafasLocal(g, 1, 0); g.restore();
    }
  }
  function capaCabezaG(g, t, p) {
    const vt = vientoG(t);
    if (Math.abs(vt.k) > 0.002) peloAlViento(g, t, PELO_G, vt.k, vt.v, p);
    // la servilleta en la mano / sobre la cara
    if (t >= T.serv1) { const sv = servilleta(t, p); conCamara(g, () => dibServ(g, t, sv, sv.capa === "cara" ? Math.max(0, respG(t)) : 0)); }
  }

  /* ---------- la servilleta ---------- */
  function cuadros(g, A, B, D, n) {
    // patrón de cuadros en el paralelogramo A, B, D (A→B y A→D)
    const ux = { x: (B.x - A.x) / n, y: (B.y - A.y) / n }, uy = { x: (D.x - A.x) / n, y: (D.y - A.y) / n };
    g.save(); g.transform(ux.x, ux.y, uy.x, uy.y, A.x, A.y);
    g.fillStyle = "rgba(214,52,52,0.55)";
    for (let i = -2; i < n + 2; i += 2) { g.fillRect(i, -2, 1, n + 4); g.fillRect(-2, i, n + 4, 1); }
    g.restore();
  }
  function rutaServ(g, sv) {
    const Q = sv.Q, M = sv.Mi;
    g.beginPath(); g.moveTo(Q[0].x, Q[0].y);
    for (let i = 0; i < 4; i++) { const c = M[i], q = Q[(i + 1) % 4]; g.quadraticCurveTo(c.x, c.y, q.x, q.y); }
    g.closePath();
  }
  function dibServ(g, t, sv, resp) {
    const Q = sv.Q;
    g.save(); g.lineJoin = "round";
    rutaServ(g, sv); g.fillStyle = "#fbf6ee"; g.fill();
    g.save(); rutaServ(g, sv); g.clip();
    cuadros(g, Q[0], Q[1], Q[3], 9);
    // volumen: luz arriba-delante, sombra en los bordes que cuelgan
    const c = P((Q[0].x + Q[2].x) / 2, (Q[0].y + Q[2].y) / 2), L = Math.hypot(Q[2].x - Q[0].x, Q[2].y - Q[0].y);
    const gr = g.createRadialGradient(c.x + L * 0.08, c.y - L * 0.12, 2, c.x, c.y, L * 0.75);
    gr.addColorStop(0, `rgba(255,255,255,${0.3 + 0.2 * resp})`); gr.addColorStop(0.6, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(110,50,40,0.3)");
    g.fillStyle = gr; g.fillRect(c.x - L, c.y - L, 2 * L, 2 * L);
    // pliegues
    g.strokeStyle = "rgba(120,60,50,0.28)"; g.lineWidth = 1.4;
    for (const [u0, u1] of [[0.25, 0.55], [0.6, 0.8]]) { const a = mezcla(Q[0], Q[3], u0), b = mezcla(Q[1], Q[2], u1), m = mezcla(a, b, 0.5);
      g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo(m.x + 3, m.y + 4, b.x, b.y); g.stroke(); }
    g.restore();
    rutaServ(g, sv); g.strokeStyle = TINTA; g.lineWidth = 1.8; g.stroke();
    g.restore();
  }
  // la servilleta arrugada en el regazo (hoja de Guillermo, relativo a SERV_REGAZO, girada y a escala)
  const REGAZO_Q = [P(-120, -40), P(90, -52), P(70, 70), P(-110, 40)], REGAZO_M = [P(-30, -70), P(130, 10), P(-20, 80), P(-140, 0)];
  const enRegazo = q => { const r = rota(P(q.x * 0.72, q.y * 0.72), -0.55); return P(SERV_REGAZO.x + r.x, SERV_REGAZO.y + r.y); };
  function servRegazo(g, t, p) {
    g.save(); g.translate(SERV_REGAZO.x, SERV_REGAZO.y); g.rotate(-0.55); g.scale(0.72, 0.72); g.lineJoin = "round";
    const forma = () => { g.beginPath(); g.moveTo(REGAZO_Q[0].x, REGAZO_Q[0].y); for (let i = 0; i < 4; i++) { const c = REGAZO_M[i], q = REGAZO_Q[(i + 1) % 4]; g.quadraticCurveTo(c.x, c.y, q.x, q.y); } g.closePath(); };
    forma(); g.fillStyle = "#fbf6ee"; g.fill();
    g.save(); forma(); g.clip(); cuadros(g, P(-140, -80), P(150, -40), P(-160, 120), 9);
    g.fillStyle = "rgba(120,60,50,0.2)"; g.beginPath(); g.moveTo(-60, -50); g.quadraticCurveTo(0, 0, 40, 70); g.lineTo(70, 70); g.quadraticCurveTo(20, 0, -30, -55); g.fill();
    g.restore();
    forma(); g.strokeStyle = TINTA; g.lineWidth = 5; g.stroke();
    // una esquina doblada por encima
    g.beginPath(); g.moveTo(40, -56); g.quadraticCurveTo(72, -20, 96, -28); g.lineTo(84, -54); g.closePath();
    g.fillStyle = "#efe3d2"; g.fill(); g.lineWidth = 4; g.stroke();
    g.restore();
  }

  /* ---------- pelo al viento (la pieza de la cabeza de Guillermo, en franjas; como 00077) ---------- */
  const PELO_G = { R: G, yRef: 470, yTop: 170, A: 150,
    craneo: [[600, 470], [610, 430], [660, 400], [740, 385], [840, 385], [930, 400], [990, 430], [1010, 470]] };
  const SC_P = 0.25;
  function prepPelo(Z) {
    const pz = Z.R.A.datos.piezas.cabeza, [ox, oy] = pz.origen, [tw, th] = pz.tam_hoja;
    const w = Math.ceil(tw * SC_P), h = Math.ceil(th * SC_P);
    const lz = () => lienzo(w, h);
    const pelo = lz(), gp = pelo.getContext("2d");
    gp.scale(SC_P, SC_P); gp.translate(-ox, -oy); R.pieza(gp, Z.R.A, "cabeza");
    gp.setTransform(1, 0, 0, 1, 0, 0); gp.globalCompositeOperation = "destination-in";
    const grad = gp.createLinearGradient(0, (Z.yRef - 8 - oy) * SC_P, 0, (Z.yRef - oy) * SC_P);
    grad.addColorStop(0, "rgba(0,0,0,1)"); grad.addColorStop(1, "rgba(0,0,0,0)");
    gp.fillStyle = grad; gp.fillRect(0, 0, w, h);
    gp.globalCompositeOperation = "source-over";
    Object.assign(Z, { ox, oy, w, h, pelo, tmp: lz(), piel: G.C.piel });
  }
  let M0 = null;
  function peloAlViento(g, t, Z, k, v, p) {
    if (!Z.pelo || !fondo || !M0) return;
    const { ox, oy, w, h } = Z;
    const kk = Math.abs(k);
    // 1) borrar el pelo de arriba: el fondo cacheado (la lona de la tumbona) o piel, dentro del cráneo
    if (kk > 0.002) {
      const o = Z.tmp.getContext("2d");
      o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = "source-over"; o.clearRect(0, 0, w, h);
      o.drawImage(Z.pelo, 0, 0);
      o.globalCompositeOperation = "source-in";
      const Mh = g.getTransform();
      const A = new DOMMatrix().scale(SC_P, SC_P).translate(-ox, -oy).multiply(Mh.inverse()).multiply(M0);
      o.setTransform(A); o.drawImage(fondo, 0, 0);
      o.setTransform(new DOMMatrix().scale(SC_P, SC_P).translate(-ox, -oy));
      o.globalCompositeOperation = "source-atop";
      o.beginPath(); Z.craneo.forEach(([x, y], i) => i ? o.lineTo(x, y) : o.moveTo(x, y)); o.lineTo(Z.craneo[Z.craneo.length - 1][0], Z.yRef + 30); o.lineTo(Z.craneo[0][0], Z.yRef + 30); o.closePath();
      o.fillStyle = Z.piel; o.fill();
      o.globalCompositeOperation = "source-over"; o.setTransform(1, 0, 0, 1, 0, 0);
      g.drawImage(Z.tmp, ox, oy, w / SC_P, h / SC_P);
    }
    // 2) el pelo, en franjas desplazadas hacia atrás (la ráfaga viene de delante); con rebote al volver
    const dir = rota(P(-1, 0), -p.cabeza.ang);       // viento horizontal en pantalla, en el marco del retrato
    const N = 18, y0 = Z.yTop - 10, y1 = Z.yRef, dh = (y1 - y0) / N;
    for (let j = 0; j < N; j++) {
      const ya = y0 + j * dh, ym = ya + dh / 2;
      const f = Math.pow(clamp((Z.yRef - ym) / (Z.yRef - Z.yTop)), 1.2);
      const ondea = v * (9 * Math.sin(t * 47 + j * 0.9) + 5 * Math.sin(t * 29 + j * 2.3)) * f;
      const d = k * Z.A * f;
      const dx = dir.x * d + ondea, dy = dir.y * d * 0.6 + k * 10 * f, estira = 1 + 0.2 * kk * f;
      const sy = (ya - oy) * SC_P, sh = dh * SC_P + 0.6;
      if (sy + sh <= 0 || sy >= h) continue;
      const xFrente = ox + w / SC_P, dw = (w / SC_P) * estira;
      g.drawImage(Z.pelo, 0, sy, w, sh, xFrente + dx - dw, ya + dy, dw, dh + 0.6 / SC_P);
    }
  }

  /* =====================================================================================
   * POMPAS DE RONQUIDO
   * ===================================================================================== */
  // pompa pegada: de la nariz de Yorgi / del borde de la servilleta de Guillermo
  const DIR_Y = P(-0.72, -0.69), DIR_G = P(0.74, -0.67);
  // radio de la pompa pegada (px de pantalla)
  function radioY(t) {
    if (t <= T.dormido + 0.2) return 0;
    const br = respY(t) * (1 - gordo(t));
    const tam = 7 + 12 * fuerzaY(t) + 21 * tramo(t, T.sinc0, T.junta0);
    return (Math.max(0, br) * tam + Math.max(0, br + 0.6) * 2.5) * tramo(t, T.dormido + 0.2, T.dormido + 0.6);
  }
  function radioG(t) {
    if (t <= T.cara1 + 0.15) return 0;
    const bG = respG(t);
    return (Math.max(0, bG) * (12 + 29 * tramo(t, T.sinc0, T.junta0)) + Math.max(0, bG + 0.6) * 2.5) * tramo(t, T.cara1 + 0.15, T.cara1 + 0.5);
  }
  const origenY = (pY) => cabW(Yo, pY, NARIZ_Y);
  const origenG=(p,t)=>{if(t<T.cara1)return cabW(G,p,BOCA_G);
    const f=telaCara(t,p),u=.64,a=mezcla(f.Q[1],f.Mi[1],u),b=mezcla(f.Mi[1],f.Q[2],u);return mezcla(a,b,u);};
  function pompas(t, pG, pY) {
    const out = [];
    if (t < T.junta0) {
      const rY = radioY(t), oY = origenY(pY);
      if (rY > 0.6) out.push({ x: oY.x + DIR_Y.x * rY * 0.9, y: oY.y + DIR_Y.y * rY * 0.9, r: rY, o: oY });
      const rG = radioG(t), oG = origenG(pG, t);
      if (rG > 0.6) out.push({ x: oG.x + DIR_G.x * rG * 0.9, y: oG.y + DIR_G.y * rG * 0.9, r: rG, o: oG });
    }
    return out;
  }
  // la gran pompa: en el soplido más gordo las dos se sueltan, vuelan al centro y se juntan
  function granPompa(t) {
    if (t < T.junta0 || t > T.plof + 0.5) return null;
    const ini = memoria("pp", () => {
      const pY = poseY(T.junta0), pG = cuerpoG(T.junta0);
      const rY = radioY(T.junta0), rG = radioG(T.junta0), oY = origenY(pY), oG = origenG(pG, T.junta0);
      return { A: P(oY.x + DIR_Y.x * rY * 0.9, oY.y + DIR_Y.y * rY * 0.9), B: P(oG.x + DIR_G.x * rG * 0.9, oG.y + DIR_G.y * rG * 0.9), rY, rG };
    });
    const C = P(512, 252);
    // Sin aire nuevo, conservan el volumen al despegar y durante la fusión.
    const ra=ini.rY,rb=ini.rG,total=ra**3+rb**3,R2=Math.cbrt(total),sep=ra+rb;
    const u=suave(fase(t,T.junta0,T.junta1));
    const arco=(a,x)=>P(lerp(a.x,x,u),lerp(a.y,C.y,u)-60*Math.sin(Math.PI*u));
    const a=arco(ini.A,C.x+sep*rb**3/total),b=arco(ini.B,C.x-sep*ra**3/total);
    const une=tramo(t,T.junta1,T.junta1+.17),flota=P(C.x,C.y-14*tramo(t,T.junta1,T.plof));
    return {a:mezcla(a,flota,une),b:mezcla(b,flota,une),ra:lerp(ra,R2,une),rb:lerp(rb,R2,une),une,
      pop: fase(t, T.plof, T.plof + 0.42), c: flota, R: R2, wob: 0.07 * Math.sin((t - T.junta1) * 22) * Math.exp(-(t - T.junta1) * 4) * tramo(t, T.junta1, T.junta1 + 0.06) };
  }
  function burbuja(g, x, y, r, wob = 0) {
    g.save(); g.translate(x, y); g.scale(1 + wob, 1 - wob);
    g.fillStyle = "rgba(214,238,250,0.34)"; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
    g.strokeStyle = "rgba(40,80,115,0.9)"; g.lineWidth = Math.max(1.6, r * 0.055); g.stroke();
    // irisado
    g.strokeStyle = "rgba(255,170,220,0.45)"; g.lineWidth = Math.max(1, r * 0.06); g.beginPath(); g.arc(0, 0, r * 0.86, 0.3, 1.5); g.stroke();
    g.strokeStyle = "rgba(150,230,255,0.5)"; g.beginPath(); g.arc(0, 0, r * 0.86, 3.3, 4.2); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.9)"; g.beginPath(); g.ellipse(-r * 0.38, -r * 0.42, r * 0.22, r * 0.12, -0.7, 0, TAU); g.fill();
    g.beginPath(); g.arc(r * 0.36, r * 0.32, r * 0.07, 0, TAU); g.fill();
    g.restore();
  }
  function dibPompas(g, t, pG, pY) {
    for (const b of pompas(t, pG, pY)) {
      // hilito que la une a la nariz / servilleta
      const dx = b.x - b.o.x, dy = b.y - b.o.y, L = Math.max(1, Math.hypot(dx, dy));
      g.save(); g.strokeStyle = "rgba(70,110,140,0.6)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(b.o.x, b.o.y); g.lineTo(b.x - dx * b.r / L, b.y - dy * b.r / L); g.stroke(); g.restore();
      burbuja(g, b.x, b.y, b.r, 0.03 * Math.sin(t * 9));
    }
    const gp = granPompa(t);
    if (!gp) return;
    if (gp.pop <= 0) {
      if (gp.une < 0.98) {
        const d = Math.hypot(gp.a.x - gp.b.x, gp.a.y - gp.b.y);
        if (d < gp.ra + gp.rb) {
          // dos pompas que se tocan: cuello entre las dos
          const m = mezcla(gp.a, gp.b, 0.5), rr = Math.max(0, Math.min(gp.ra, gp.rb) * clamp(1 - (d - Math.max(gp.ra, gp.rb)) / Math.min(gp.ra, gp.rb)) * 0.9);
          g.save(); g.fillStyle = "rgba(214,238,250,0.28)";
          g.beginPath(); g.arc(gp.a.x, gp.a.y, gp.ra, 0, TAU); g.moveTo(gp.b.x + gp.rb, gp.b.y); g.arc(gp.b.x, gp.b.y, gp.rb, 0, TAU);
          if (rr > 1) { g.moveTo(m.x + rr, m.y); g.arc(m.x, m.y, rr, 0, TAU); }
          g.fill("nonzero");
          g.strokeStyle = "rgba(70,110,140,0.85)"; g.lineWidth = 2;
          const fuera = (c0, r0, cs) => { g.save(); for (const [c, r] of cs) { if (r < 1) continue; g.beginPath(); g.rect(-W, -H, W * 3, H * 3); g.moveTo(c.x + r, c.y); g.arc(c.x, c.y, r, TAU, 0, true); g.clip(); } g.beginPath(); g.arc(c0.x, c0.y, r0, 0, TAU); g.stroke(); g.restore(); };
          fuera(gp.a, gp.ra, [[gp.b, gp.rb], [m, rr]]); fuera(gp.b, gp.rb, [[gp.a, gp.ra], [m, rr]]); if (rr > 1) fuera(m, rr, [[gp.a, gp.ra], [gp.b, gp.rb]]);
          g.fillStyle = "rgba(255,255,255,0.9)";
          for (const [c, r] of [[gp.a, gp.ra], [gp.b, gp.rb]]) { g.beginPath(); g.ellipse(c.x - r * 0.38, c.y - r * 0.42, r * 0.2, r * 0.11, -0.7, 0, TAU); g.fill(); }
          g.restore();
        } else { burbuja(g, gp.a.x, gp.a.y, gp.ra); burbuja(g, gp.b.x, gp.b.y, gp.rb); }
      } else burbuja(g, gp.c.x, gp.c.y, gp.R, gp.wob);
    } else if (gp.pop < 1) {
      // ¡plof!: anillo, gotitas y rayitas
      const k = gp.pop, c = gp.c;
      g.save(); g.lineCap = "round";
      g.globalAlpha = 1 - k; g.strokeStyle = "rgba(120,170,200,0.9)"; g.lineWidth = 3;
      g.beginPath(); g.arc(c.x, c.y, gp.R * (1 + 0.6 * salida(k)), 0, TAU); g.stroke();
      g.strokeStyle = "rgba(255,255,255,0.95)"; g.lineWidth = 3.5;
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + 0.2, r0 = gp.R * (0.9 + 0.7 * salida(k)), r1 = r0 + 14 * (1 - k);
        g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1); g.stroke(); }
      g.fillStyle = "rgba(200,232,248,0.9)";
      for (let i = 0; i < 14; i++) { const a = hash(i * 3.1) * TAU, rr = gp.R * (0.5 + 1.4 * salida(k)) * (0.7 + 0.5 * hash(i * 7.7));
        g.beginPath(); g.arc(c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr + 60 * k * k, 2.6 * (1 - k * 0.5), 0, TAU); g.fill(); }
      g.restore();
    }
  }

  /* ---------- ondas de ronquido (sin letras): arcos ondulados que salen de la boca de Yorgi ---------- */
  function ondas(g, t, pY) {
    if (t < T.dormido) return;
    const boca = cabW(Yo, pY, BOCA_Y);
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    // ronquidos normales: al coger aire, dos o tres arquitos
    const f = faseY(t), fr = f - Math.floor(f);
    const coge = fr > 0.6 ? fase(fr, 0.6, 1) : 0;
    const fz = fuerzaY(t) * (1 - gordo(t)) * (1 - tramo(t, T.junta0, T.junta0 + 0.2));
    if (coge > 0 && fz > 0.05) {
      for (let i = 0; i < 3; i++) {
        const u = coge * 1.4 - i * 0.25; if (u <= 0 || u >= 1) continue;
        const r = 14 + 46 * u * fz, a = Math.sin(Math.PI * u) * fz;
        arcoOnda(g, boca, r, Math.PI + 0.15, 0.55, a, 1.4 + fz * 1.2, t + i);
      }
    }
    // el ronquido gordo: ondas enormes que cruzan la terraza
    if (t > T.inspira0 && t < T.vuelve1 + 0.3) {
      // al coger aire: rayitas que entran en la boca
      const ci = campana(t, T.inspira0, T.sopla);
      if (ci > 0.01) {
        g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 2.4;
        for (let i = 0; i < 6; i++) { const ph = ((t * 2.6 + i / 6) % 1), a = Math.PI + (i - 2.5) * 0.28, r0 = 90 * (1 - ph) + 12, r1 = r0 + 24;
          g.globalAlpha = Math.sin(Math.PI * ph) * ci;
          g.beginPath(); g.moveTo(boca.x + Math.cos(a) * r0, boca.y + Math.sin(a) * r0 * 0.8); g.lineTo(boca.x + Math.cos(a) * r1, boca.y + Math.sin(a) * r1 * 0.8); g.stroke(); }
        g.globalAlpha = 1;
      }
      for (let k = 0; k < 5; k++) {
        const t0 = T.sopla + k * 0.085, u = (t - t0) / 0.6; if (u <= 0 || u >= 1) continue;
        const r = 26 + 860 * salida(u * 0.9 + 0.1 * u), a = (1 - u) * tramo(u, 0, 0.06);
        ondaGorda(g, boca, r, a, 1 - u);
      }
      // rayas de viento
      const vv = dentro(t, T.sopla + 0.04, T.sopla + 0.12, T.rafaga1 - 0.1, T.rafaga1 + 0.05);
      if (vv > 0.01) {
        g.strokeStyle = "rgba(255,255,255,0.9)";
        for (let i = 0; i < 9; i++) {
          const ph = ((t * 3.2 + hash(i * 3.3)) % 1), y = 200 + 230 * hash(i * 7.1), x = lerp(boca.x - 40, -60, ph);
          g.globalAlpha = vv * Math.sin(Math.PI * ph) * 0.85; g.lineWidth = 2 + 2 * hash(i);
          g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - 60, y - 8 * Math.sin(t * 20 + i), x - 130, y + 4); g.stroke();
        }
        g.globalAlpha = 1;
      }
    }
    g.restore();
  }
  // onda expansiva del ronquido gordo: «)))» lisos, gruesos, hacia la izquierda
  function ondaGorda(g, c, r, alfa, grosor) {
    if (alfa <= 0.01) return;
    const ab = Math.min(0.62, 95 / r);
    g.save(); g.globalAlpha = alfa; g.lineCap = "round";
    for (const [dr, lw, col] of [[0, 4 + 6 * grosor, "rgba(70,110,150,0.35)"], [0, 2 + 4 * grosor, "rgba(255,255,255,0.95)"], [-12 - 6 * grosor, 1.5 + 2 * grosor, "rgba(255,255,255,0.6)"]]) {
      g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.ellipse(c.x, c.y, r + dr, (r + dr) * 0.8, 0, Math.PI - ab, Math.PI + ab); g.stroke();
    }
    g.restore();
  }
  function arcoOnda(g, c, r, a0, ab, alfa, lw, sem, fuerte) {
    if (alfa <= 0.01) return;
    ab = Math.min(ab, (fuerte ? 120 : 40) / r);
    const n = 26, amp = fuerte ? 1.6 : 1.2;
    const ruta = () => { g.beginPath(); for (let i = 0; i <= n; i++) { const a = a0 - ab + 2 * ab * i / n, rr = r + amp * Math.sin(i * 1.9 + sem * 9);
      const x = c.x + Math.cos(a) * rr, y = c.y + Math.sin(a) * rr * 0.85; i ? g.lineTo(x, y) : g.moveTo(x, y); } };
    g.globalAlpha = alfa;
    if (fuerte) { ruta(); g.strokeStyle = "rgba(60,80,110,0.55)"; g.lineWidth = lw + 2.5; g.stroke(); }
    ruta(); g.strokeStyle = "#ffffff"; g.lineWidth = lw; g.stroke();
    g.globalAlpha = 1;
  }

  /* ---------- estrellita de destello ---------- */
  function estrella4(g, x, y, r, alfa, rot, col = "#ffffff") {
    if (alfa <= 0.01 || r <= 0.5) return;
    g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha *= alfa; g.fillStyle = col;
    g.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.16 : r, a = i * Math.PI / 4; i ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.moveTo(rr, 0); } g.closePath(); g.fill();
    g.restore();
  }

  /* =====================================================================================
   * DECORADO: terraza de un bar en la sobremesa (se pinta una vez)
   * ===================================================================================== */
  const FX = -160, FY = -90, FW = W + 320, FH = H + 180, FS = 1.5;
  let fondo = null, toldo = null;
  function lienzo(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  function creaFondo() {
    const c = lienzo(Math.ceil(FW * FS), Math.ceil(FH * FS)), g = c.getContext("2d");
    g.scale(FS, FS); g.translate(-FX, -FY); g.lineJoin = "round"; g.lineCap = "round";
    // cielo de media tarde
    const cie = g.createLinearGradient(0, FY, 0, MURO.y0);
    cie.addColorStop(0, "#3f8fd0"); cie.addColorStop(0.55, "#86c2e6"); cie.addColorStop(1, "#e9eedb");
    g.fillStyle = cie; g.fillRect(FX, FY, FW, MURO.y0 - FY + 2);
    for (const [x, y, s] of [[110, 120, 1], [360, 168, 0.7], [820, 150, 0.85], [1050, 90, 1.1], [690, 236, 0.5]]) nube(g, x, y, s);
    colinas(g);
    murete(g);
    fachada(g);
    pergola(g);
    suelo(g);
    mesa(g);
    tumbona(g, XG, 1, ["#d8423c", "#fbf3e3"]);
    tumbona(g, XY, -1, ["#2f86b8", "#fbf3e3"]);
    return c;
  }
  function nube(g, x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s);
    g.fillStyle = "rgba(255,255,255,0.85)";
    for (const [dx, dy, r] of [[-40, 6, 22], [-14, -8, 30], [18, -2, 26], [44, 8, 18], [0, 10, 26]]) { g.beginPath(); g.arc(dx, dy, r, 0, TAU); g.fill(); }
    g.fillStyle = "rgba(190,214,232,0.55)"; g.fillRect(-60, 14, 120, 12);
    g.restore();
  }
  function colinas(g) {
    g.fillStyle = "#a9c3c9"; g.beginPath(); g.moveTo(FX, HZ + 10);
    for (let x = FX; x <= FX + FW; x += 20) g.lineTo(x, HZ + 4 - 30 * Math.sin(x * 0.006 + 1) - 14 * Math.sin(x * 0.017));
    g.lineTo(FX + FW, MURO.y0); g.lineTo(FX, MURO.y0); g.closePath(); g.fill();
    g.fillStyle = "#9bb07a"; g.beginPath(); g.moveTo(FX, HZ + 40);
    for (let x = FX; x <= FX + FW; x += 20) g.lineTo(x, HZ + 34 - 22 * Math.sin(x * 0.008 - 0.6) - 8 * Math.sin(x * 0.021));
    g.lineTo(FX + FW, MURO.y0); g.lineTo(FX, MURO.y0); g.closePath(); g.fill();
    g.fillStyle = "rgba(90,110,60,0.55)";
    for (let i = 0; i < 90; i++) { const x = FX + hash(i * 2.3) * FW, yb = HZ + 34 - 22 * Math.sin(x * 0.008 - 0.6) - 8 * Math.sin(x * 0.021), y = yb + 8 + hash(i * 5.1) * (MURO.y0 - yb - 10);
      g.beginPath(); g.ellipse(x, y, 3.2, 2.2, 0, 0, TAU); g.fill(); }
    const casas = [[600, 288], [620, 282], [640, 290], [662, 284], [684, 292], [704, 286], [630, 300], [656, 304], [690, 306], [712, 300], [586, 302]];
    for (const [x, y] of casas) {
      g.fillStyle = "#f6f1e6"; g.fillRect(x - 9, y - 9, 18, 13);
      g.fillStyle = "#c86a46"; g.beginPath(); g.moveTo(x - 11, y - 9); g.lineTo(x, y - 15); g.lineTo(x + 11, y - 9); g.closePath(); g.fill();
      g.fillStyle = "rgba(120,110,100,0.5)"; g.fillRect(x - 4, y - 5, 3, 4);
    }
    g.fillStyle = "#f4ecdc"; g.fillRect(664, 256, 12, 34); g.fillStyle = "#c86a46"; g.beginPath(); g.moveTo(662, 256); g.lineTo(670, 244); g.lineTo(678, 256); g.closePath(); g.fill();
    g.fillStyle = "rgba(90,80,70,0.6)"; g.fillRect(668, 262, 4, 6);
    for (const [x, y, h] of [[540, 312, 34], [552, 316, 26], [748, 304, 38], [760, 310, 28], [300, 318, 30], [880, 312, 34]]) {
      g.fillStyle = "#4f6a3c"; g.beginPath(); g.moveTo(x, y - h); g.quadraticCurveTo(x + 7, y - h * 0.4, x + 4, y); g.lineTo(x - 4, y); g.quadraticCurveTo(x - 7, y - h * 0.4, x, y - h); g.fill();
    }
    const br = g.createLinearGradient(0, HZ - 40, 0, MURO.y0);
    br.addColorStop(0, "rgba(255,240,210,0)"); br.addColorStop(1, "rgba(255,236,200,0.35)");
    g.fillStyle = br; g.fillRect(FX, HZ - 40, FW, MURO.y0 - HZ + 40);
  }
  function murete(g) {
    const { y0, y1 } = MURO;
    g.fillStyle = "#f7f1e4"; g.fillRect(FX, y0, FW, y1 - y0 + 4);
    g.fillStyle = "#2f6fa8"; g.fillRect(FX, y0 - 10, FW, 12);
    for (let x = FX; x < FX + FW; x += 16) { g.fillStyle = "#f4f6fb"; g.beginPath(); g.arc(x + 8, y0 - 4, 3.4, 0, TAU); g.fill(); g.fillStyle = "#e8a83a"; g.beginPath(); g.arc(x + 8, y0 - 4, 1.4, 0, TAU); g.fill(); }
    g.strokeStyle = "rgba(20,40,70,0.5)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(FX, y0 - 10); g.lineTo(FX + FW, y0 - 10); g.moveTo(FX, y0 + 2); g.lineTo(FX + FW, y0 + 2); g.stroke();
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(200,180,150,${0.08 + 0.08 * hash(i)})`; g.beginPath(); g.ellipse(FX + hash(i * 1.7) * FW, y0 + 8 + hash(i * 4.3) * (y1 - y0 - 10), 10 + 14 * hash(i * 2.9), 3, 0, 0, TAU); g.fill(); }
    g.fillStyle = "rgba(150,110,80,0.25)"; g.fillRect(FX, y1 - 4, FW, 8);
    for (const x of [300, 380, 640, 720]) maceta(g, x, y0 - 10, 0.8);
  }
  function maceta(g, x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s);
    g.fillStyle = "#4f8a3a"; for (const [dx, dy, r] of [[-14, -14, 10], [0, -20, 11], [14, -13, 10], [-6, -6, 9], [8, -6, 9]]) { g.beginPath(); g.arc(dx, dy, r, 0, TAU); g.fill(); }
    g.fillStyle = "rgba(30,70,20,0.35)"; for (const [dx, dy] of [[-10, -10], [6, -14], [12, -6]]) { g.beginPath(); g.arc(dx, dy, 4, 0, TAU); g.fill(); }
    for (const [dx, dy] of [[-12, -26], [4, -32], [16, -22], [-2, -16]]) { g.fillStyle = "#e3342f"; for (let i = 0; i < 5; i++) { const a = i * TAU / 5; g.beginPath(); g.arc(dx + Math.cos(a) * 3.4, dy + Math.sin(a) * 3.4, 2.8, 0, TAU); g.fill(); } g.fillStyle = "#ffd36b"; g.beginPath(); g.arc(dx, dy, 1.6, 0, TAU); g.fill(); }
    g.fillStyle = "#c56a3e"; g.beginPath(); g.moveTo(-15, -4); g.lineTo(15, -4); g.lineTo(11, 14); g.lineTo(-11, 14); g.closePath(); g.fill();
    g.fillStyle = "#d98252"; g.fillRect(-17, -6, 34, 6);
    g.strokeStyle = "rgba(60,30,15,0.6)"; g.lineWidth = 1.2; g.strokeRect(-17, -6, 34, 6);
    g.fillStyle = "rgba(80,40,20,0.25)"; g.fillRect(4, 0, 7, 14);
    g.restore();
  }
  function fachada(g) {
    const x1 = 228;
    const gp = g.createLinearGradient(FX, 0, x1, 0);
    gp.addColorStop(0, "#e3b467"); gp.addColorStop(1, "#d9a65a");
    g.fillStyle = gp; g.fillRect(FX, FY, x1 - FX, PISO - FY + 2);
    for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(160,110,50,${0.06 + 0.06 * hash(i * 3)})`; g.beginPath(); g.ellipse(FX + hash(i * 1.3) * (x1 - FX), FY + hash(i * 2.1) * (PISO - FY), 14 + 10 * hash(i), 4, 0, 0, TAU); g.fill(); }
    g.fillStyle = "rgba(120,70,30,0.22)"; g.fillRect(x1 - 18, FY, 18, PISO - FY);
    g.strokeStyle = "rgba(90,50,20,0.6)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x1, FY); g.lineTo(x1, PISO); g.stroke();
    for (let x = FX; x < x1; x += 22) for (let y = PISO - 40; y < PISO; y += 20) {
      g.fillStyle = (Math.floor(x / 22) + Math.floor(y / 20)) % 2 ? "#2f6fa8" : "#f4f6fb"; g.fillRect(x, y, Math.min(22, x1 - x), 20);
      g.fillStyle = "#e8a83a"; if (x + 11 < x1) { g.beginPath(); g.arc(x + 11, y + 10, 2.2, 0, TAU); g.fill(); }
    }
    g.strokeStyle = "rgba(20,40,70,0.5)"; g.lineWidth = 1.2; g.strokeRect(FX, PISO - 40, x1 - FX, 40);
    const px0 = -170, px1 = -60, py0 = 60;
    g.fillStyle = "#5a3418"; g.fillRect(px0 - 10, py0 - 10, px1 - px0 + 20, PISO - py0 + 10);
    g.fillStyle = "#2a1a12"; g.fillRect(px0, py0, px1 - px0, PISO - py0);
    const cols = ["#e3342f", "#f2c230", "#2f8f5b", "#2f6fa8", "#f2f2f2"];
    for (let i = 0; i < 14; i++) { const x = px0 + 4 + i * ((px1 - px0 - 8) / 13); g.strokeStyle = cols[i % 5]; g.lineWidth = 3.4; g.beginPath(); g.moveTo(x, py0 + 2); g.lineTo(x + 1.5 * Math.sin(i), PISO - 6); g.stroke(); }
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#fbf3e3" : "#2f8f5b"; g.beginPath(); const x = px0 - 30 + i * 22; g.moveTo(x, py0 - 40); g.lineTo(x + 22, py0 - 40); g.lineTo(x + 26, py0 - 12); g.lineTo(x + 4, py0 - 12); g.closePath(); g.fill(); }
    g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(px0 - 30, py0 - 14, 180, 4);
    for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? "#fbf3e3" : "#2f8f5b"; g.beginPath(); g.arc(px0 - 26 + i * 22, py0 - 12, 11, 0, Math.PI); g.fill(); }
    g.strokeStyle = "#2a2420"; g.lineWidth = 3; g.beginPath(); g.moveTo(x1 - 34, 70); g.lineTo(x1 - 34, 92); g.lineTo(x1 - 54, 92); g.stroke();
    g.fillStyle = "#2a2420"; g.fillRect(x1 - 66, 92, 24, 6); g.fillStyle = "#fff2c4"; g.fillRect(x1 - 63, 98, 18, 22); g.strokeStyle = "#2a2420"; g.lineWidth = 2; g.strokeRect(x1 - 63, 98, 18, 22);
    g.fillStyle = "#2a2420"; g.beginPath(); g.moveTo(x1 - 66, 120); g.lineTo(x1 - 42, 120); g.lineTo(x1 - 54, 130); g.closePath(); g.fill();
    maceta(g, 160, PISO + 18, 1.2);
  }
  function pergola(g) {
    const x0 = 838;
    g.fillStyle = "#8a5a32"; g.fillRect(x0 + 120, FY, 16, PISO + 30 - FY); g.fillStyle = "rgba(0,0,0,0.2)"; g.fillRect(x0 + 130, FY, 6, PISO + 30 - FY);
    g.fillStyle = "#8a5a32"; g.fillRect(x0 - 40, 24, FX + FW - x0 + 40, 14);
    for (let i = 0; i < 160; i++) {
      const x = x0 - 30 + hash(i * 1.9) * (FX + FW - x0 + 30), y = 20 + Math.pow(hash(i * 4.7), 1.8) * 240 * (0.4 + 0.6 * hash(i * 0.7 + 3));
      g.fillStyle = hash(i * 2.2) < 0.32 ? "#3f7a34" : (hash(i * 6.1) < 0.5 ? "#d6337f" : "#e95ba0");
      g.beginPath(); g.ellipse(x, y, 6 + 4 * hash(i), 4 + 3 * hash(i * 3), hash(i * 9) * 3, 0, TAU); g.fill();
    }
    const lx = 930, ly = PISO + 40;
    g.fillStyle = "#6a4426"; g.fillRect(lx - 4, ly - 110, 8, 90);
    g.fillStyle = "#3f7a34"; for (const [dx, dy, r] of [[-30, -130, 30], [0, -150, 34], [30, -128, 30], [-14, -104, 26], [18, -102, 24]]) { g.beginPath(); g.arc(lx + dx, ly + dy, r, 0, TAU); g.fill(); }
    g.fillStyle = "rgba(20,60,20,0.3)"; for (const [dx, dy, r] of [[-20, -112, 14], [24, -116, 12], [4, -136, 12]]) { g.beginPath(); g.arc(lx + dx, ly + dy, r, 0, TAU); g.fill(); }
    for (const [dx, dy] of [[-28, -122], [-6, -150], [20, -136], [34, -108], [-16, -96], [8, -112]]) { g.fillStyle = "#f6d23a"; g.beginPath(); g.ellipse(lx + dx, ly + dy, 6, 5, 0.4, 0, TAU); g.fill(); g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.arc(lx + dx - 2, ly + dy - 2, 1.5, 0, TAU); g.fill(); }
    g.fillStyle = "#c56a3e"; g.beginPath(); g.moveTo(lx - 34, ly - 24); g.lineTo(lx + 34, ly - 24); g.lineTo(lx + 26, ly + 14); g.lineTo(lx - 26, ly + 14); g.closePath(); g.fill();
    g.fillStyle = "#d98252"; g.fillRect(lx - 38, ly - 28, 76, 9); g.fillStyle = "rgba(80,40,20,0.25)"; g.fillRect(lx + 8, ly - 19, 14, 33);
  }
  function suelo(g) {
    const y0 = PISO, y1 = FY + FH;
    const gs = g.createLinearGradient(0, y0, 0, y1);
    gs.addColorStop(0, "#c98a5a"); gs.addColorStop(1, "#e0a56f");
    g.fillStyle = gs; g.fillRect(FX, y0, FW, y1 - y0);
    const FUGA = P(512, 150);
    g.strokeStyle = "rgba(110,60,30,0.32)"; g.lineWidth = 1.3;
    for (let i = -18; i <= 18; i++) { const xb = 512 + i * 92; g.beginPath(); g.moveTo(lerp(FUGA.x, xb, (y0 - FUGA.y) / (y1 - FUGA.y)), y0); g.lineTo(xb, y1); g.stroke(); }
    for (let i = 1; i < 10; i++) { const y = y0 + Math.pow(i / 10, 1.5) * (y1 - y0); g.beginPath(); g.moveTo(FX, y); g.lineTo(FX + FW, y); g.stroke(); }
    for (let i = 0; i < 80; i++) { g.fillStyle = `rgba(150,80,40,${0.05 + 0.06 * hash(i * 1.1)})`; g.beginPath(); g.ellipse(FX + hash(i * 3.7) * FW, y0 + hash(i * 5.3) * (y1 - y0), 12 + 10 * hash(i), 3, 0, 0, TAU); g.fill(); }
    const gl = g.createLinearGradient(0, y0, 0, y0 + 60); gl.addColorStop(0, "rgba(255,230,180,0.3)"); gl.addColorStop(1, "rgba(255,230,180,0)");
    g.fillStyle = gl; g.fillRect(FX, y0, FW, 60);
  }
  function mesa(g) {
    const { x, y, rx, ry, pie } = MESA;
    g.fillStyle = "rgba(90,45,20,0.25)"; g.beginPath(); g.ellipse(x + 4, pie + 3, 52, 9, 0, 0, TAU); g.fill();
    g.strokeStyle = "#2a2420"; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y + 6); g.lineTo(x, pie - 10); g.stroke();
    g.lineWidth = 4; g.beginPath(); g.moveTo(x, pie - 12); g.quadraticCurveTo(x - 20, pie - 6, x - 36, pie); g.moveTo(x, pie - 12); g.quadraticCurveTo(x + 20, pie - 6, x + 36, pie); g.moveTo(x, pie - 12); g.lineTo(x + 4, pie + 2); g.stroke();
    g.fillStyle = "#6a6058"; g.beginPath(); g.ellipse(x, y + 4, rx, ry, 0, 0, TAU); g.fill();
    g.fillStyle = "#f2efe8"; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill();
    g.strokeStyle = "rgba(150,140,130,0.5)"; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 40, y - 4); g.quadraticCurveTo(x - 10, y + 6, x + 30, y - 2); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 1.6; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.stroke();
    // el palo de la sombrilla (blanco) sale del centro del tablero
    g.fillStyle = "#f1ece2"; g.fillRect(PALO.x - 4, PALO.y1, 8, y - PALO.y1 - 2);
    g.fillStyle = "rgba(120,100,80,0.35)"; g.fillRect(PALO.x + 1, PALO.y1, 3, y - PALO.y1 - 2);
    g.strokeStyle = "rgba(60,50,40,0.6)"; g.lineWidth = 1.2; g.strokeRect(PALO.x - 4, PALO.y1, 8, y - PALO.y1 - 2);
    plato(g, PLATO.x - 2, y - 2, true);
    plato(g, x + 34, y + 1, false);
    vaso(g, x - 44, y - 2, 9, 26, "rgba(246,190,70,0.5)", true);
    vaso(g, x + 52, y - 6, 8, 22, "rgba(170,40,50,0.45)", false);
  }
  function plato(g, x, y, espina) {
    g.fillStyle = "rgba(80,60,50,0.25)"; g.beginPath(); g.ellipse(x + 1, y + 2, 21, 5.5, 0, 0, TAU); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x, y, 21, 5.5, 0, 0, TAU); g.fill();
    g.strokeStyle = "rgba(60,90,140,0.7)"; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y, 17, 4.2, 0, 0, TAU); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 1.1; g.beginPath(); g.ellipse(x, y, 21, 5.5, 0, 0, TAU); g.stroke();
    if (espina) {
      g.strokeStyle = "#e8e2d6"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x - 11, y - 1); g.lineTo(x + 8, y - 1); g.stroke();
      g.strokeStyle = "#cfc6b6"; g.lineWidth = 0.9; for (let i = 0; i < 5; i++) { const xx = x - 8 + i * 3.5; g.beginPath(); g.moveTo(xx, y - 3.2); g.lineTo(xx + 1, y + 1.2); g.stroke(); }
      g.fillStyle = "#e8e2d6"; g.beginPath(); g.moveTo(x + 8, y - 1); g.lineTo(x + 13, y - 3.5); g.lineTo(x + 13, y + 1.5); g.closePath(); g.fill();
      g.fillStyle = "#d6c8b0"; g.beginPath(); g.ellipse(x - 12, y - 1, 3.2, 2.2, 0, 0, TAU); g.fill();
    } else {
      g.fillStyle = "#f6d23a"; g.beginPath(); g.moveTo(x - 6, y - 1); g.quadraticCurveTo(x - 1, y - 6, x + 5, y - 1); g.closePath(); g.fill();
      g.fillStyle = "#c79a5a"; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(x - 10 + hash(i * 2.2) * 20, y - 1 + (hash(i * 5.5) - 0.5) * 4, 0.9, 0, TAU); g.fill(); }
      g.strokeStyle = "#9aa0a8"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x + 2, y - 2); g.lineTo(x + 18, y - 5); g.stroke();
    }
  }
  function vaso(g, x, y, r, h, liquido, espuma) {
    g.save();
    const forma = () => { g.beginPath(); g.moveTo(x - r, y - h); g.lineTo(x + r, y - h); g.lineTo(x + r * 0.82, y); g.lineTo(x - r * 0.82, y); g.closePath(); };
    forma(); g.fillStyle = "rgba(220,240,255,0.35)"; g.fill();
    g.fillStyle = liquido; g.beginPath(); g.moveTo(x - r * 0.88, y - h * 0.22); g.lineTo(x + r * 0.88, y - h * 0.22); g.lineTo(x + r * 0.82, y); g.lineTo(x - r * 0.82, y); g.closePath(); g.fill();
    if (espuma) { g.fillStyle = "rgba(255,250,235,0.85)"; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(x - r * 0.6 + i * r * 0.4, y - h * (0.4 + 0.15 * (i % 2)), 2.2, 1.4, 0, 0, TAU); g.fill(); } }
    else { g.fillStyle = "rgba(255,255,255,0.7)"; g.fillRect(x - 4, y - h * 0.32, 5, 5); g.fillStyle = "#f6d23a"; g.beginPath(); g.arc(x + r, y - h, 5, Math.PI * 0.6, Math.PI * 1.6); g.fill(); }
    forma(); g.strokeStyle = "rgba(40,50,70,0.85)"; g.lineWidth = 1.1; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.6)"; g.fillRect(x - r * 0.65, y - h * 0.9, 1.6, h * 0.7);
    g.restore();
  }
  // tumbona de lona de rayas (sg = 1: la cabeza a la izquierda; −1: espejo)
  function tumbona(g, xp, sg, col) {
    g.save(); g.translate(xp, 0); g.scale(sg, 1); g.translate(-XG, 0);
    const lona=LONAS[sg===1?0:1],ARR=lona[0], PIE_D = P(332, SUELO), PIE_T = P(36, SUELO), BAR_D = P(300, 486), CRUCE = P(150, 436);
    g.strokeStyle = "#7a4e2a"; g.lineWidth = 9;
    g.beginPath(); g.moveTo(PIE_T.x + 6, PIE_T.y); g.lineTo(CRUCE.x + 10, CRUCE.y - 4); g.stroke();
    g.strokeStyle = "#8f5d33"; g.lineWidth = 10;
    g.beginPath(); g.moveTo(PIE_D.x, PIE_D.y); g.lineTo(ARR.x, ARR.y); g.stroke();
    const n = lona.length, LEJ = P(-17, -22), CER = P(9, 13);
    const borde = o => lona.map((q, i) => { const k = Math.sin(Math.PI * i / (n - 1)) * 0.35 + 0.65; return P(q.x + o.x * k, q.y + o.y * k); });
    const bL = borde(LEJ), bC = borde(CER);
    // larguero del fondo (por el borde lejano de la lona)
    g.strokeStyle = "#6e4524"; g.lineWidth = 7; g.beginPath(); g.moveTo(PIE_D.x - 16, PIE_D.y - 18); g.lineTo(ARR.x - 16, ARR.y - 20); g.stroke();
    // lona de rayas
    g.save();
    g.beginPath(); M2.curva(g, bL, false, 0.5); for (let i = n - 1; i >= 0; i--) g.lineTo(bC[i].x, bC[i].y); g.closePath();
    g.fillStyle = col[1]; g.fill(); g.clip();
    for (let k = -3; k <= 3; k += 2) { const u = (k + 4) / 8; g.strokeStyle = col[0]; g.lineWidth = 5.5; g.beginPath(); M2.curva(g, lona.map((q, i) => mezcla(bL[i], bC[i], u)), false, 0.5); g.stroke(); }
    // sombra en la parte que cuelga y luz arriba
    const gs = g.createLinearGradient(0, 300, 0, 540); gs.addColorStop(0, "rgba(255,255,255,0.12)"); gs.addColorStop(1, "rgba(60,30,20,0.3)");
    g.fillStyle = gs; g.fillRect(-20, 280, 380, 270);
    g.restore();
    g.strokeStyle = "rgba(20,10,10,0.75)"; g.lineWidth = 1.6;
    g.beginPath(); M2.curva(g, bL, false, 0.5); g.stroke();
    g.beginPath(); M2.curva(g, bC, false, 0.5); g.stroke();
    for (const q of [ARR, BAR_D]) { g.fillStyle = "#a36b3b"; g.beginPath(); g.arc(q.x, q.y, 7, 0, TAU); g.fill(); g.strokeStyle = "#4a2e16"; g.lineWidth = 1.5; g.stroke(); }
    g.strokeStyle = "#9c6538"; g.lineWidth = 10;
    g.beginPath(); g.moveTo(PIE_T.x, PIE_T.y); g.lineTo(CRUCE.x, CRUCE.y); g.stroke();
    g.strokeStyle = "rgba(40,20,10,0.6)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(PIE_T.x - 4, PIE_T.y); g.lineTo(CRUCE.x - 4, CRUCE.y); g.stroke();
    g.fillStyle = "#4a2e16"; g.beginPath(); g.arc(CRUCE.x, CRUCE.y, 4, 0, TAU); g.fill();
    g.fillStyle = "rgba(90,45,20,0.22)"; g.beginPath(); g.ellipse(190, SUELO + 2, 170, 9, 0, 0, TAU); g.fill();
    g.restore();
  }

  /* ---------- la sombrilla (sprite aparte: el sol se esconde detrás) ---------- */
  const TS = 1.5;
  function creaToldo() {
    const w = TOLDO.rx * 2 + 60, h = TOLDO.fleco + 40;
    const c = lienzo(Math.ceil(w * TS), Math.ceil(h * TS)), g = c.getContext("2d");
    const ox = TOLDO.x - w / 2, oy = TOLDO.yA - 20;
    g.scale(TS, TS); g.translate(-ox, -oy); g.lineJoin = "round";
    const { x, yA, yB, rx } = TOLDO;
    const N = 10;
    for (let i = 0; i < N; i++) {
      const a0 = x - rx + (2 * rx) * i / N, a1 = x - rx + (2 * rx) * (i + 1) / N;
      g.beginPath(); g.moveTo(x, yA); g.lineTo(a0, yB); g.quadraticCurveTo((a0 + a1) / 2, yB + 10, a1, yB); g.closePath();
      g.fillStyle = i % 2 ? "#fbf3e3" : "#e8693a"; g.fill();
      const gr = g.createLinearGradient(0, yA, 0, yB + 10);
      gr.addColorStop(0, "rgba(255,255,255,0.15)"); gr.addColorStop(1, "rgba(120,50,20,0.22)");
      g.fillStyle = gr; g.fill();
      g.strokeStyle = "rgba(90,40,20,0.6)"; g.lineWidth = 1.4; g.stroke();
    }
    for (let i = 0; i < 2 * N; i++) {
      const a0 = x - rx + (2 * rx) * i / (2 * N), a1 = x - rx + (2 * rx) * (i + 1) / (2 * N);
      g.beginPath(); g.moveTo(a0, yB); g.lineTo(a1, yB); g.lineTo(a1, yB + 14); g.quadraticCurveTo((a0 + a1) / 2, yB + 28, a0, yB + 14); g.closePath();
      g.fillStyle = Math.floor(i / 2) % 2 ? "#fbf3e3" : "#e8693a"; g.fill(); g.strokeStyle = "rgba(90,40,20,0.6)"; g.lineWidth = 1.2; g.stroke();
    }
    g.fillStyle = "#f1ece2"; g.beginPath(); g.arc(x, yA - 4, 6, 0, TAU); g.fill(); g.strokeStyle = "rgba(60,50,40,0.6)"; g.stroke();
    return { c, w, h, ox, oy };
  }
  function dibToldo(g, t, so) {
    g.drawImage(toldo.c, toldo.ox, toldo.oy, toldo.w, toldo.h);
    // el sol detrás de la lona: brilla a través
    const tras = 1 - tramo(t, T.sol1 - 0.25, T.sol1 - 0.05);
    if (tras > 0.01) {
      g.save(); g.globalCompositeOperation = "lighter";
      const gr = g.createRadialGradient(so.x, so.y, 4, so.x, so.y, 90);
      gr.addColorStop(0, `rgba(255,236,170,${0.55 * tras})`); gr.addColorStop(1, "rgba(255,236,170,0)");
      g.fillStyle = gr; g.beginPath(); g.moveTo(TOLDO.x, TOLDO.yA); g.lineTo(TOLDO.x - TOLDO.rx, TOLDO.yB); g.lineTo(TOLDO.x - TOLDO.rx, TOLDO.yB + 22); g.lineTo(TOLDO.x + TOLDO.rx, TOLDO.yB + 22); g.lineTo(TOLDO.x + TOLDO.rx, TOLDO.yB); g.closePath(); g.fill();
      g.restore();
    }
    // flecos que se mecen (y se agitan con la ráfaga)
    g.save(); g.strokeStyle = "#c9442a"; g.lineWidth = 2; g.lineCap = "round";
    for (let i = 0; i <= 40; i++) {
      const x = TOLDO.x - TOLDO.rx + i * (2 * TOLDO.rx / 40), y = TOLDO.yB + 22;
      const llega=memoria("fleco"+i,()=>llegadaRafaga(P(x,y))),raf=dentro(t,llega,llega+.085,llega+.32,llega+.50);
      const a = 0.12 * Math.sin(t * 2.1 + i * 0.7) - 0.9 * raf * (0.8 + 0.2 * Math.sin(t * 40 + i));
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.sin(a) * 9, y + Math.cos(a) * 9); g.stroke();
    }
    g.restore();
  }
  function dibSol(g, t, so) {
    g.save();
    const gr = g.createRadialGradient(so.x, so.y, 10, so.x, so.y, 140);
    gr.addColorStop(0, "rgba(255,246,200,0.95)"); gr.addColorStop(0.25, "rgba(255,220,140,0.45)"); gr.addColorStop(1, "rgba(255,210,140,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(so.x, so.y, 140, 0, TAU); g.fill();
    g.fillStyle = "#fff7d6"; g.beginPath(); g.arc(so.x, so.y, 22, 0, TAU); g.fill();
    g.restore();
  }
  function sombraToldo(g, t, so) {
    const k = so.k;
    g.save(); g.fillStyle = "rgba(90,40,20,0.16)";
    g.beginPath(); g.ellipse(512 - 20 * k, lerp(476, 430, k), lerp(330, 280, k), lerp(46, 26, k), 0, 0, TAU); g.fill();
    g.restore();
  }
  function rayos(g, t, so, pG, pY) {
    const l = so.luz; if (l <= 0.01) return;
    g.save(); g.globalCompositeOperation = "lighter";
    const ojosG = cabW(G, pG, P(830, 590)), ojosY = cabW(Yo, pY, P(860, 520));
    for (const [q, w] of [[ojosG, 1], [ojosY, 0.8]]) {
      const dx = q.x - so.x, dy = q.y - so.y, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
      const gr = g.createLinearGradient(so.x, so.y, q.x, q.y);
      gr.addColorStop(0, `rgba(255,236,170,${0.13 * l * w})`); gr.addColorStop(0.75, `rgba(255,236,170,${0.03 * l * w})`); gr.addColorStop(1, "rgba(255,236,170,0)");
      g.fillStyle = gr; g.beginPath(); g.moveTo(so.x + nx * 6, so.y + ny * 6); g.lineTo(q.x + nx * 26, q.y + ny * 26); g.lineTo(q.x - nx * 26, q.y - ny * 26); g.lineTo(so.x - nx * 6, so.y - ny * 6); g.closePath(); g.fill();
    }
    g.restore();
  }
  function brilloCara(g, t, q, k) {
    if (k <= 0.01) return;
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createRadialGradient(q.x, q.y, 2, q.x, q.y, 30);
    gr.addColorStop(0, `rgba(255,240,190,${0.2 * k})`); gr.addColorStop(1, "rgba(255,240,190,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(q.x, q.y, 30, 0, TAU); g.fill();
    g.restore();
    for (let i = 0; i < 2; i++) estrella4(g, q.x + 12 * Math.cos(i * 2.9 + t * 2), q.y - 6 + 8 * Math.sin(i * 2.9 + t * 2), 5 * k, k * (0.6 + 0.4 * Math.sin(t * 9 + i)), t * 1.5 + i);
  }

  /* ---------- cámara ---------- */
  const PLANOS = [
    [0, 0, 1.1, 512, 356],
    [0.6, 1.9, 1.16, 512, 352],
    [2.3, 2.9, 1.7, 236, 362],
    [3.95, 4.35, 1.2, 430, 300],
    [4.85, 5.3, 1.48, 290, 350],
    [5.45, 5.85, 1.1, 490, 345],
    [6.9, 7.4, 1.5, 282, 352],
    [7.86, 8.24, 1.1, 512, 330],
    [8.4, 9.1, 1.2, 512, 345],
    [9.15, 9.5, 1.55, 252, 355],
    [10.3, 11.0, 1.26, 512, 318],
    [12.95, 13.9, 1.72, 800, 336]
  ];
  function camara(t) {
    let k = PLANOS[0][2], x = PLANOS[0][3], y = PLANOS[0][4];
    for (let i = 1; i < PLANOS.length; i++) { const [t0, t1, kk, xx, yy] = PLANOS[i]; if (t <= t0) break; const s = tramo(t, t0, t1); k = lerp(k, kk, s); x = lerp(x, xx, s); y = lerp(y, yy, s); }
    const e = 3 * muelle(t, T.sopla, 40, 6);
    return { k, x: x + e, y: y + 0.6 * e };
  }

  function poses(t) { return { g: poseG(t), y: poseY(t) }; }

  class LaSiesta extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Yo.listo()) return;
      if (!fondo) { fondo = creaFondo(); toldo = creaToldo(); prepPelo(PELO_G); }
      const pG = poseG(t), pY = poseY(t), so = sol(t);
      const luz = tramo(t, NEGRO_INICIO, 0.7, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      g.save(); g.translate(FX, FY); g.scale(1 / FS, 1 / FS); M0 = g.getTransform(); g.drawImage(fondo, 0, 0); g.restore();
      dibSol(g, t, so);
      dibToldo(g, t, so);
      sombraToldo(g, t, so);
      BASE_M = g.getTransform();
      const mo = moscaEn(t);
      Yo.dibujar(g, pY, t);
      const ga = gafas(t, pG);
      if (ga.capa === "cara") dibujaGafas(g, ga);
      G.dibujar(g, pG, t);
      rayos(g, t, so, pG, pY);
      const kG = so.luz * (1 - 0.8 * dentro(t, T.visera1 - 0.08, T.visera1, T.cuello0, T.cuello0 + 0.1)) * (1 - tramo(t, T.cara0 + 0.1, T.cara1));
      brilloCara(g, t, cabW(G, pG, P(820, 580)), kG);
      brilloCara(g, t, cabW(Yo, pY, P(860, 520)), so.luz * 0.7 * (1 - tramo(t, T.aterriza - 0.05, T.clic + 0.1)));
      ondas(g, t, pY);
      dibPompas(g, t, pG, pY);
      if (ga.capa === "aire") {
        // estela: dos copias que se desvanecen
        for (let i = 2; i >= 1; i--) { const g2 = gafas(t - i * 0.03, pG); if (g2.capa !== "aire") continue; g.save(); g.globalAlpha = 0.22 * (3 - i) / 2; dibujaGafas(g, g2); g.restore(); }
        dibujaGafas(g, ga);
      }
      dibMosca(g, t, mo);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }

  registrar({ id: "00139.2", nombre: "Guillermo y Yorgi · La siesta (revisión)", crear: () => new LaSiesta() });
  function diag(t) {
    const out = {};
    for (const [n, Rg, p] of [["g", G, poseG(t)], ["y", Yo, poseY(t)]]) for (const lado of ["cerca", "lejos"]) {
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m) continue;
      const Tr = Rg.tronco(p), h = Tr(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO), mu = m.mu ?? -1.75;
      const w = { x: m.x + Math.cos(mu) * Rg.MUNECA_R * Rg.JK, y: m.y + Math.sin(mu) * Rg.MUNECA_R * Rg.JK };
      out[n + lado] = +(Math.hypot(w.x - h.x, w.y - h.y) / (lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L)).toFixed(3);
    }
    return out;
  }
  window.__A2D_00139_2 = { pose: poses, poseG, poseY, T, DUR, diag, camara, gafas, moscaEn,G,Yo,ptMano,PINZA,PALMA,DEDOS,cabW,trW,cuerpoG,marcoCuello,marcoCaraY,servilleta,pompas,granPompa,origenG,origenY,radioG,radioY,faseG,faseY,respG,respY,vientoG,sol,PLATO,MESA,TOLDO,SERV_CARA,REGAZO_Q,enRegazo,NARIZ_G,FRENTE_G,SUELO,NUCA,ASIENTOS,asiento,apoyoNuca,suela,puntaDedo,mundoMarco,PUENTE,PATILLA,CRISTAL,llegadaRafaga,dibujaGafas,telaCara,tiro,servRegazo,CUELLO_GAFAS,BOCA_Y };
})();
