"use strict";
/* 00117 · Guillermo y Rodri · Las latas
 *
 * Negro → la feria de noche: cielo azul tinta con estrellas, una noria encendida a lo lejos, luces
 * desenfocadas de otras casetas y el suelo de tierra apisonada. A la derecha, la caseta de las latas:
 * toldo con su faldón festoneado de rayas, postes de rayas, la lona del fondo a rayas, una grada de
 * madera de dos alturas con dos pirámides de latas (la grande abajo, la pequeña arriba), el mostrador
 * con una cesta de pelotas y, en una repisa del poste, el premio gordo: un peluche gigante rosa,
 * redondo, con orejitas, ojos de botón, un corazón en la tripa y un lazo.
 *
 * Guillermo espera en el mostrador; Rodri, más atrás, juega con una pelota → Rodri apunta guiñando un
 * ojo y la lanza tensa desde allí: la pelota pasa rozando la cabeza de Guillermo, que se agacha de
 * golpe → ¡CRASH!: la pirámide grande salta por los aires y las latas caen detrás del mostrador →
 * Rodri se sacude las manos, se las mete en los bolsillos y guiña a cámara → Guillermo se incorpora,
 * mira el desastre boquiabierto, se pica, coge una pelota de la cesta, apunta a la pirámide pequeña
 * con la lengua fuera, carga… y lanza: demasiado alta, pasa por encima de las latas, da en la lona
 * (que se abomba) y vuelve recta… a su frente: ¡bonk!, marca roja, estrellitas y ojos en espiral.
 * Rodri se dobla de risa → Guillermo, rojo de rabia, coge otra pelota y carga a lo bestia, con la
 * rodilla arriba, temblando… y se le escapa hacia arriba. Mira las latas (nada), mira arriba: la
 * pelota baja, da en la cabeza del peluche gigante, que se tambalea, se vuelca de la repisa y le cae
 * encima de la cabeza: ¡ploof! Ahí se queda, sentado como un gorro. Guillermo mira arriba, mira a
 * cámara, resignado; Rodri, entre lágrimas de risa, le levanta el pulgar («¡premio!») y guiña un ojo
 * → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`. Las pelotas van en pantalla: en la mano se dibujan
 * debajo de los dedos; en vuelo siguen arcos calculados desde la mano en el instante del lanzamiento.
 * Las latas y el peluche son sprites pintados una vez. Las latas que caen detrás del mostrador quedan
 * tapadas por su frente.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, hash } = M2;
  const G = Guillermo, R = Rodri;
  const DUR = 14.6, TINTA = "#0b0a0e", TAU = Math.PI * 2;

  /* ---------- guion (s) ---------- */
  const T = {
    // Rodri juega con la pelota y lanza
    toss: [0.36, 0.84],
    gMiraR: 0.5, gCeja: 0.8,
    rApunta: 1.3, rCarga: 1.6, rSuelta: 1.98, rSigue: 2.2,
    gAgacha: 2.0, gAgachado: 2.15, gSube: 2.48,
    impacto: 2.5,
    rSacude: 2.72, rBolsillo: 3.15, rGuino1: 3.4,
    gPasmo: 2.82, gMiraR2: 3.3, gPica: 3.55,
    // primer lanzamiento de Guillermo
    gCoge1: 3.9, gCogido1: 4.1, gPasa1: 4.32,
    gApunta: 4.38, gCarga: 4.68, gSuelta: 5.04, gSigue: 5.22,
    lona: 5.46, frente: 5.88,
    gMareo: 5.94, gDespeja: 6.85,
    rRie0: 5.98, rRie1: 7.2,
    // segundo lanzamiento
    gEnfado: 6.92, gCoge2: 7.22, gCogido2: 7.42, gPasa2: 7.62,
    gCarga2: 7.72, gTiembla: 8.25, gSuelta2: 8.9, gSigue2: 9.08,
    gMiraLatas: 9.1, gMiraArriba: 9.36,
    rMiraArriba: 9.24,
    golpePeluche: 9.63, vuelca: 9.72, aterriza: 10.02,
    rRie2: 10.2, rRie3: 11.6,
    gCamara: 10.95,
    rPulgar: 12.1, rCamara: 12.95, rGuino2: 13.35,
    fin: 13.95
  };

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const lerpAng = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const RELAJADA = D(0.55, 0.6, 0.55, 0.5, 0.45), ABRE = D(0.85, 0.9, 0.9, 0.85, 0.8), ABIERTA = D(1, 1),
    AGARRA = D(0.32, 0.34, 0.32, 0.32, 0.34), PUNO = D(0.1, 0.05, 0.05, 0.05, 0.05),
    SENALA = D(0.15, 1, 0.05, 0.05, 0.05), PULGAR = D(1, 0.04, 0.04, 0.04, 0.04);
  const muelle = (t, t0, f, dec) => t < t0 ? 0 : Math.exp(-(t - t0) * dec) * Math.sin((t - t0) * f);

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
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* =====================================================================================
   * DISPOSICIÓN (px de pantalla)
   * ===================================================================================== */
  const S = 0.3, SUELO = 560;
  const XR = 236, XG = 488;                               // pelvis de cada uno (los dos miran a la derecha)
  const PY_PIE = rig => SUELO - (rig.SUELO - rig.PELVIS.y) * S * rig.K;
  const POSTE = { x: 556 }, POSTE2 = { x: 1012 };
  const TOLDO = { y1: 42, fald: 74 };                     // techo y faldón festoneado
  const MOST = { x0: 548, y: 362, grosor: 13 };           // mostrador (tablero y frente)
  const LONA = { x0: 566, x1: 1024, y0: TOLDO.fald, y1: MOST.y, xRebote: 1000 };
  const GRADA1 = { x0: 646, x1: 822, y: 318 }, GRADA2 = { x0: 832, x1: 984, y: 222 };
  const LATA = { w: 26, h: 32, paso: 27 };
  const REPISA = { x0: 528, x1: 612, y: 96 };             // repisa del premio gordo, en el poste
  const PEL_BASE = { x: 568, y: REPISA.y };               // base del peluche en la repisa
  const PEL_ESC = 1.15, PEL_ALTO = 89 * PEL_ESC;          // alto hasta la coronilla (sin orejas)
  const CESTA = { x: 590, y: MOST.y, w: 54, h: 24 };
  const EN_CESTA = [{ x: 574, y: 337 }, { x: 592, y: 334 }, { x: 609, y: 338 }];
  const R_BOLA = 10, SUELO_BOLA = SUELO - 7;
  const GRAV = 1700;

  /* =====================================================================================
   * MANOS
   * ===================================================================================== */
  let BASE_M = null;
  function conCamara(g, f) { g.save(); g.setTransform(BASE_M); f(); g.restore(); }
  const evalua = (o, t, ctx) => (typeof o === "function" ? o(t, ctx) : o);
  // pista de objetivos de pantalla {x, y, ang, d, mo, bol, ma (mu absoluto de la hoja), ka (su peso)}
  function pista(lista, t, ctx) {
    let c = Object.assign({ mo: 0, bol: 0, ma: 0, ka: 0 }, evalua(lista[0][2], t, ctx));
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i]; if (t <= t0) break;
      const o = evalua(obj, t, ctx), k = (f || suave)(fase(t, t0, t1));
      c = { x: lerp(c.x, o.x, k), y: lerp(c.y, o.y, k), ang: lerpAng(c.ang || 0, o.ang ?? (c.ang || 0), k),
        d: mezclaD(c.d, o.d || c.d, k), mo: lerp(c.mo || 0, o.mo ?? (c.mo || 0), k), bol: lerp(c.bol || 0, o.bol || 0, k),
        ma: lerpAng(c.ma || 0, o.ma ?? (c.ma || 0), k), ka: lerp(c.ka || 0, o.ka || 0, k) };
    }
    return c;
  }
  const muHacia = (m, h, off) => Math.atan2(h.y - m.y, h.x - m.x) + off;
  const R_MG = G.MUNECA_R * G.JK;
  const manoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_MG, y: m.y - Math.sin(mu) * R_MG });
  const BOLS_GC = manoDesde({ x: 131, y: 652 }, -1.75), BOLS_GL = manoDesde({ x: 372, y: 648 }, -1.75);
  function manoRig(rig, p, m, lado, bolsillo, dobla, objeto) {
    const h = rig.aHoja(p, m), hom = rig.tronco(p)(lado === "cerca" ? rig.HOMBRO_C : rig.HOMBRO);
    const k = clamp(m.bol || 0);
    let mu0 = muHacia(h, hom, (m.mo || 0));
    if ((m.ka || 0) > 0.001) mu0 = lerpAng(mu0, m.ma, m.ka);
    const bt = rig.tronco(p)(bolsillo);
    const x = lerp(h.x, bt.x, k), y = lerp(h.y, bt.y, k);
    return { x, y, ang: 0, mu: lerpAng(mu0, -1.75, k), puno: 1 - k, dedos: m.d, dobla, objeto: k < 0.5 ? objeto : null };
  }
  // mano con el antebrazo horizontal hacia delante (pulgar arriba, señalar): se construye desde el codo
  function manoAnte(rig, p, lado, angBrazo, alarga = 1) {
    const PZ = rig.A.datos.piezas, pz = lado === "cerca" ? PZ.brazo_cerca : PZ.brazo;
    const Lt = lado === "cerca" ? rig.BRAZO_C_L : rig.BRAZO_L, Lu = lado === "cerca" ? pz.codo : (rig === G ? Lt * 0.5 : pz.codo);
    const hom = rig.tronco(p)(lado === "cerca" ? rig.HOMBRO_C : rig.HOMBRO);
    const codo = { x: hom.x + Lu * Math.sin(angBrazo), y: hom.y + Lu * Math.cos(angBrazo) };
    const mun = { x: codo.x + (Lt - Lu) * 0.97 * alarga, y: codo.y };
    const h = { x: mun.x + rig.MUNECA_R * rig.JK, y: mun.y };
    return rig.aPantalla(p, h);
  }
  const hombroP = (rig, p, lado) => rig.aPantalla(p, rig.tronco(p)(lado === "cerca" ? rig.HOMBRO_C : rig.HOMBRO));
  // un punto del tronco (hoja) en pantalla
  const enTronco = (rig, p, q) => rig.aPantalla(p, rig.tronco(p)(q));
  // objetivo relativo al hombro (sigue al cuerpo cuando se inclina)
  const rel = (rig, p, lado, dx, dy, extra) => { const h = hombroP(rig, p, lado); return Object.assign({ x: h.x + dx, y: h.y + dy, ang: 0 }, extra); };
  // lanzamiento por arriba: la mano recorre un arco alrededor del hombro, acelerando
  const acel = k => { k = clamp(k); return k * k; };
  // claves [t0, t1, ángulo, radio, curva]: el ángulo en pantalla (0 = delante, −π/2 = arriba, −π = detrás)
  const arcoLanza = (rig, p, lado, claves, extra) => t => {
    let a = claves[0][2], r = claves[0][3];
    for (let i = 1; i < claves.length; i++) { const [t0, t1, a1, r1, f] = claves[i]; if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)); a = lerp(a, a1, k); r = lerp(r, r1, k); }
    const h = hombroP(rig, p, lado);
    return Object.assign({ x: h.x + r * Math.cos(a), y: h.y + r * Math.sin(a), ang: 0 }, extra);
  };
  // dónde queda la pelota cogida: en la palma, un poco más allá de la mano (los dedos apuntan lejos del hombro)
  function agarre(rig, p, lado, c, d = 15) {
    const h = hombroP(rig, p, lado), L = Math.hypot(c.x - h.x, c.y - h.y) || 1;
    return { x: c.x + (c.x - h.x) / L * d, y: c.y + (c.y - h.y) / L * d };
  }

  /* =====================================================================================
   * PELOTA
   * ===================================================================================== */
  function dibPelota(g, x, y, r, giro, apl = 0) {
    g.save(); g.translate(x, y); g.rotate(giro || 0);
    if (apl) g.scale(1 + apl, 1 - apl);
    g.lineJoin = "round";
    g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fillStyle = "#f6f1e4"; g.fill();
    g.save(); g.clip();
    g.fillStyle = "#d92a2a"; g.beginPath(); g.ellipse(0, 0, r * 1.2, r * 0.36, 0.5, 0, TAU); g.fill();
    g.fillStyle = "rgba(0,0,0,0.18)"; g.beginPath(); g.arc(r * 0.35, r * 0.4, r, 0, TAU); g.fill();
    g.fillStyle = "rgba(255,255,255,0.75)"; g.beginPath(); g.ellipse(-r * 0.35, -r * 0.4, r * 0.32, r * 0.2, -0.6, 0, TAU); g.fill();
    g.restore();
    g.beginPath(); g.arc(0, 0, r, 0, TAU); g.lineWidth = 2.2; g.strokeStyle = TINTA; g.stroke();
    g.restore();
  }
  // arco: de a a b en [t0, t1] con una flecha h hacia arriba
  function arco(a, b, t0, t1, h, t) {
    const s = fase(t, t0, t1);
    return { x: lerp(a.x, b.x, s), y: lerp(a.y, b.y, s) - 4 * h * s * (1 - s), s };
  }
  // tiro parabólico con gravedad: sale de a en t0 y llega a b en t1
  function parabola(a, b, t0, t1, gv, t) {
    const tau = t1 - t0, u = clamp(t - t0, 0, tau);
    const vx = (b.x - a.x) / tau, vy = (b.y - a.y - 0.5 * gv * tau * tau) / tau;
    return { x: a.x + vx * u, y: a.y + vy * u + 0.5 * gv * u * u, vx, vy: vy + gv * u };
  }
  // botes en el suelo: altura de cada bote decreciente; devuelve y relativo al suelo (≤ 0)
  function botes(u, v0, gv, n) {
    let v = v0;
    for (let i = 0; i < n; i++) { const d = 2 * v / gv; if (u < d) return -(v * u - 0.5 * gv * u * u); u -= d; v *= 0.45; }
    return 0;
  }

  /* =====================================================================================
   * RODRI (izquierda, detrás; mira a la derecha)
   * ===================================================================================== */
  const CARAS_R = {
    inicio: E({ mx: 0.9, my: 0.05, c: 0.3, sonr: 0.6, ancho: 1.0 }),
    juega: E({ mx: 0.6, my: -0.55, c: 0.15, sonr: 0.5 }),
    reta: E({ mx: 0.95, my: 0.1, c: 0.4, h: 0.2, sonr: 0.75, ancho: 1.05 }),
    apunta: E({ mx: 0.95, my: 0.05, c: 0.15, wi: 1, sonr: 0.35, ancho: 0.9 }),
    lanza: E({ mx: 0.95, my: 0.05, c: 0.25, abre: 10, ancho: 0.8, sonr: 0.25 }),
    chulo: E({ mx: 0.9, my: 0.1, c: 0.55, h: 0.55, sonr: 0.9 }),
    camara: E({ mx: -0.85, my: 0.05, c: 0.42, h: 0.3, abre: 4, ancho: 1.05, sonr: 0.85 }),
    mira: E({ mx: 0.95, my: 0.1, c: 0.2, sonr: 0.45 }),
    risa: E({ mx: 0.7, my: 0.3, c: 1, h: 1, abre: 24, ancho: 1.1, sonr: 0.95 }),
    arriba: E({ mx: 0.7, my: -0.9, iris: 0.85, c: 0, abre: 8, ancho: 0.6, sonr: 0.0 }),
    recelo: E({ mx: 0.95, my: -0.35, iris: 0.85, c: 0, abre: 0, ancho: 0.8, sonr: 0.35 }),
    oh: E({ mx: 0.9, my: -0.3, iris: 0.8, c: 0, abre: 14, ancho: 0.55, sonr: 0.05 }),
    premio: E({ mx: 0.95, my: 0.0, c: 0.45, h: 0.6, abre: 6, ancho: 1.05, sonr: 0.9 }),
    final: E({ mx: -0.85, my: 0.05, c: 0.4, h: 0.4, abre: 4, ancho: 1.05, sonr: 0.85 })
  };
  const GUION_CARA_R = [
    [0.35, 0.5, "juega"], [T.toss[1] + 0.25, T.toss[1] + 0.4, "reta"], [T.rApunta, T.rApunta + 0.15, "apunta"],
    [T.rSuelta - 0.06, T.rSuelta + 0.02, "lanza"], [T.impacto + 0.08, T.impacto + 0.25, "chulo"],
    [T.rGuino1 - 0.25, T.rGuino1 - 0.05, "camara"], [T.gPica, T.gPica + 0.2, "mira"],
    [T.rRie0 - 0.04, T.rRie0 + 0.12, "risa"], [T.rRie1 - 0.2, T.rRie1, "mira"],
    [T.gCarga2 + 0.12, T.gCarga2 + 0.3, "recelo"], [T.gSuelta2 + 0.05, T.gSuelta2 + 0.2, "mira"],
    [T.rMiraArriba, T.rMiraArriba + 0.15, "arriba"], [T.aterriza - 0.1, T.aterriza + 0.05, "oh"],
    [T.rRie2, T.rRie2 + 0.12, "risa"], [T.rRie3 - 0.2, T.rRie3 + 0.1, "premio"],
    [T.rCamara, T.rCamara + 0.2, "final"]
  ];
  const CUERPOS_R = {
    inicio: { torso: 0.02, cab: 0.0, dx: 0, dy: 0 }, juega: { torso: 0.0, cab: -0.12, dx: 0, dy: 0 },
    apunta: { torso: -0.02, cab: 0.06, dx: -2, dy: 0 }, carga: { torso: -0.2, cab: -0.04, dx: -14, dy: 2 },
    lanza: { torso: 0.3, cab: 0.16, dx: 16, dy: 8 }, sigue: { torso: 0.36, cab: 0.2, dx: 20, dy: 10 },
    chulo: { torso: -0.03, cab: -0.1, dx: 6, dy: 0 }, mira: { torso: 0.02, cab: 0.02, dx: 6, dy: 0 },
    risa: { torso: 0.24, cab: 0.26, dx: -2, dy: 12 }, esquiva: { torso: -0.14, cab: -0.12, dx: -8, dy: 0 }, arriba: { torso: -0.08, cab: -0.3, dx: 6, dy: 0 },
    premio: { torso: 0.05, cab: 0.06, dx: 8, dy: 0 }
  };
  const GUION_CUERPO_R = [
    [0.35, 0.55, "juega"], [T.toss[1] + 0.2, T.toss[1] + 0.45, "inicio"], [T.rApunta - 0.1, T.rApunta + 0.15, "apunta"],
    [T.rCarga, T.rSuelta - 0.1, "carga"], [T.rSuelta - 0.1, T.rSuelta + 0.04, "lanza", salida], [T.rSuelta + 0.04, T.rSigue, "sigue"],
    [T.rSigue + 0.25, T.rSigue + 0.65, "chulo"], [T.gPica, T.gPica + 0.3, "mira"],
    [T.rRie0 - 0.04, T.rRie0 + 0.2, "risa"], [T.rRie1 - 0.25, T.rRie1, "mira"],
    [T.gCarga2 + 0.12, T.gCarga2 + 0.4, "esquiva"], [T.gSuelta2 + 0.05, T.gSuelta2 + 0.3, "mira"],
    [T.rMiraArriba, T.rMiraArriba + 0.3, "arriba"], [T.rRie2 - 0.04, T.rRie2 + 0.22, "risa"],
    [T.rRie3 - 0.3, T.rRie3 + 0.1, "premio"]
  ];
  const BARRIGA_R = { x: 285, y: 560 };

  function poseR(t) {
    const b = guion(GUION_CUERPO_R, CUERPOS_R, "inicio", t);
    const respira = Math.sin(t * 2.0 + 0.7);
    const p = {
      x: XR, suelo: SUELO, s: S, tirasLimpias: true,
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    const rie = Math.max(dentro(t, T.rRie0, T.rRie0 + 0.15, T.rRie1 - 0.3, T.rRie1), dentro(t, T.rRie2, T.rRie2 + 0.15, T.rRie3 - 0.3, T.rRie3));
    p.torso += 0.035 * Math.sin(t * 21) * rie; p.cabeza.ang += 0.04 * Math.sin(t * 21 + 0.6) * rie;
    p.pelvis = R.aHoja(p, { x: XR + b.dx, y: PY_PIE(R) + b.dy + respira * 0.8 });
    const TOB = R.SUELO - R.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: R.CADERA.cerca.x - 30, y: TOB }, ang: 0 };
    p.piernas.lejos = { tob: { x: R.CADERA.lejos.x + 34, y: TOB }, ang: 0 };
    const ex = guion(GUION_CARA_R, CARAS_R, "inicio", t);
    if (rie > 0) ex.abre += 8 * Math.abs(Math.sin(t * 10.5)) * rie;
    ex.mof = 0;
    ex.wd += 1.0 * campana(t, T.rGuino1 - 0.05, T.rGuino1 + 0.35) + 1.0 * campana(t, T.rGuino2 - 0.05, T.rGuino2 + 0.4);
    p.cara = cara(ex, (ex.c > 0.8 || ex.wi > 0.5) ? 0 : parpadeo(t, [0.3, 2.7, 4.6, 7.6, 9.0, 11.9, 12.6]));
    p.rojo = 0.22 * rie;
    p._rie = rie;
    manosR(p, t);
    return p;
  }

  function manosR(p, t) {
    const aP = q => enTronco(R, p, q);
    const sac = () => 0.5 + 0.5 * Math.cos((t - T.rSacude) * 24);
    const RS = T.rSuelta, A0 = RS - 0.13;
    const arco = arcoLanza(R, p, "cerca", [[0, 0, 0.16, 87], [T.rCarga, A0, -2.75, 96], [A0, RS, -0.22, 96, acel]], { d: AGARRA });
    // mano cercana: la pelota (juega, apunta, carga, lanza); se sacude las manos; bolsillo; risa (tripa)
    const PC = [
      [0, 0, { x: 262, y: 318, ang: 0, d: AGARRA }],
      [T.rApunta - 0.15, T.rApunta + 0.15, arco],
      [RS, T.rSigue + 0.06, () => rel(R, p, "cerca", 62, 76, { d: ABRE }), salida],
      [T.rSacude - 0.12, T.rSacude + 0.08, () => ({ x: 256 - 9 * sac(), y: 328 - 5 * sac(), ang: 0, d: ABIERTA, mo: 0.25 })],
      [T.rBolsillo - 0.1, T.rBolsillo + 0.15, { x: 240, y: 380, ang: 0, d: RELAJADA, bol: 1, mo: 0 }],
      [T.rRie0 - 0.05, T.rRie0 + 0.25, () => Object.assign(aP(BARRIGA_R), { ang: 0, d: ABIERTA, bol: 0, mo: 0.9 })],
      [T.rRie1 - 0.4, T.rRie1 - 0.05, { x: 240, y: 380, ang: 0, d: RELAJADA, bol: 1, mo: 0 }],
      [T.rRie2 - 0.05, T.rRie2 + 0.25, () => Object.assign(aP(BARRIGA_R), { ang: 0, d: ABIERTA, bol: 0, mo: 0.9 })],
      [T.rRie3 - 0.3, T.rRie3 + 0.1, { x: 240, y: 380, ang: 0, d: RELAJADA, bol: 1, mo: 0 }]
    ];
    const c = pista(PC, t);
    // juega: la mano baja un poco antes de lanzarla al aire y al recogerla
    for (const t0 of T.toss) c.y += 7 * campana(t, t0 - 0.12, t0 + 0.04) + 6 * campana(t, t0 + 0.36, t0 + 0.56);
    let objeto = null;
    if (t < RS) {
      const q = agarre(R, p, "cerca", c);
      let by = q.y, suelta = false;
      for (const t0 of T.toss) { const k = fase(t, t0, t0 + 0.42); if (k > 0 && k < 1) { by -= 72 * 4 * k * (1 - k); suelta = true; } }
      const bol = { x: q.x, y: by, giro: t * 7 };
      p.pelotaR = bol;
      if (!suelta) objeto = g => conCamara(g, () => dibPelota(g, bol.x, bol.y, R_BOLA, bol.giro));
      else p.pelotaSuelta = bol;
    }
    p.manoCerca = manoRig(R, p, c, "cerca", R.BOLSILLO_C, -1, objeto);
    // mano lejana: equilibrio en el lanzamiento; se sacude las manos con la otra; señala al reír; pulgar arriba
    const PL = [
      [0, 0, { x: 320, y: 380, ang: 0, d: RELAJADA, bol: 1 }],
      [T.rCarga - 0.05, A0, () => rel(R, p, "lejos", 78, 14, { d: ABRE, bol: 0 })],
      [A0 + 0.04, T.rSigue + 0.1, () => rel(R, p, "lejos", -12, 84, { d: RELAJADA, bol: 0 })],
      [T.rSacude - 0.12, T.rSacude + 0.08, () => ({ x: 270 + 9 * sac(), y: 318 + 5 * sac(), ang: 0, d: ABIERTA, mo: -0.25 })],
      [T.rBolsillo - 0.1, T.rBolsillo + 0.15, { x: 320, y: 380, ang: 0, d: RELAJADA, bol: 1, mo: 0 }],
      [T.rRie0 + 0.06, T.rRie0 + 0.3, () => Object.assign(manoAnte(R, p, "lejos", -0.2), { ang: 0, d: SENALA, bol: 0, ma: Math.PI, ka: 1 })],
      [T.rRie1 - 0.4, T.rRie1 - 0.05, { x: 320, y: 380, ang: 0, d: RELAJADA, bol: 1, ka: 0 }],
      [T.rRie2 + 0.06, T.rRie2 + 0.3, () => Object.assign(manoAnte(R, p, "lejos", -0.2), { ang: 0, d: SENALA, bol: 0, ma: Math.PI, ka: 1 })],
      [T.rRie3 - 0.3, T.rRie3, { x: 320, y: 380, ang: 0, d: RELAJADA, bol: 1, ka: 0 }],
      [T.rPulgar, T.rPulgar + 0.28, () => Object.assign(manoAnte(R, p, "lejos", 0.12), { ang: 0, d: PULGAR, bol: 0, mo: 0, ma: Math.PI, ka: 1 })]
    ];
    const l = pista(PL, t);
    p.manoLejos = manoRig(R, p, l, "lejos", R.BOLSILLO_L, -1, null);
  }

  /* =====================================================================================
   * GUILLERMO (en el mostrador; mira a la derecha)
   * ===================================================================================== */
  const CARAS_G = {
    inicio: E({ mx: 0.9, my: 0.1, c: 0.2, sd: 8, si: 8, abre: 0, ancho: 0.9, sonr: 0.25 }),
    miraR: E({ mx: -0.95, my: 0.05, c: 0.25, sd: 16, gd: 0.05, si: 4, gi: -0.05, abre: 0, ancho: 0.85, sonr: 0.1 }),
    agacha: E({ c: 1, z: 1, sd: 18, si: 18, abre: 14, ancho: 0.6, sonr: -0.3 }),
    pasmo: E({ mx: 0.9, my: 0.15, iris: 0.75, sd: 22, gd: 0.1, si: 22, gi: 0.12, abre: 16, ancho: 0.5, sonr: 0 }),
    picado: E({ mx: -0.95, my: 0.1, c: 0.3, sd: -8, gd: -0.18, si: -8, gi: -0.18, abre: 0, ancho: 0.75, sonr: -0.35 }),
    decidido: E({ mx: 0.95, my: 0.15, c: 0.35, sd: -4, gd: -0.12, si: 2, gi: -0.04, abre: 0, ancho: 0.95, sonr: 0.35 }),
    apunta: E({ mx: 0.95, my: -0.1, c: 0.1, wi: 1, sd: -2, gd: -0.1, si: 8, abre: 4, ancho: 0.55, sonr: 0.1, lengua: 0.8 }),
    lanza: E({ mx: 0.9, my: -0.2, c: 0.45, z: 0.5, sd: 6, si: 6, abre: 20, ancho: 1.05, sonr: 0.15 }),
    sorpresa: E({ mx: 0.95, my: -0.1, iris: 0.68, c: 0, sd: 24, gd: 0.12, si: 24, gi: 0.14, abre: 18, ancho: 0.55, sonr: 0 }),
    golpe: E({ c: 1, z: 1, sd: 14, si: 14, abre: 12, ancho: 0.7, sonr: -0.2 }),
    mareo: E({ mx: 0, my: 0, esp: 1, iris: 1, c: 0, sd: 10, si: 10, abre: 8, ancho: 0.7, sonr: 0.0 }),
    enfado: E({ mx: 0.95, my: 0.1, c: 0.32, sd: -10, gd: -0.22, si: -10, gi: -0.22, abre: 0, ancho: 0.7, sonr: -0.45 }),
    carga: E({ mx: 0.95, my: -0.05, c: 0.4, z: 0.6, sd: -8, gd: -0.2, si: -8, gi: -0.2, abre: 12, ancho: 1.1, sonr: -0.25 }),
    esperanza: E({ mx: 0.95, my: 0.05, iris: 0.85, c: 0, sd: 18, gd: 0.06, si: 18, gi: 0.06, abre: 6, ancho: 0.6, sonr: 0.3 }),
    arriba: E({ mx: 0.35, my: -0.95, iris: 0.72, c: 0, sd: 24, si: 24, abre: 14, ancho: 0.55, sonr: 0 }),
    aplasta: E({ c: 1, z: 1, sd: 6, si: 6, abre: 8, ancho: 0.7, sonr: -0.2 }),
    bizco: E({ mx: 0.2, my: -0.95, iris: 0.85, c: 0, sd: 20, gd: 0.1, si: 20, gi: 0.1, abre: 0, ancho: 0.6, sonr: -0.1 }),
    resignado: E({ mx: -0.95, my: 0.05, c: 0.45, sd: 4, gd: 0.16, si: 4, gi: 0.16, abre: 0, ancho: 0.6, sonr: -0.3 })
  };
  const GUION_CARA_G = [
    [T.gMiraR, T.gMiraR + 0.15, "miraR"], [T.gAgacha - 0.04, T.gAgacha + 0.06, "agacha"], [T.gPasmo - 0.1, T.gPasmo + 0.1, "pasmo"],
    [T.gMiraR2, T.gMiraR2 + 0.15, "picado"], [T.gCoge1 - 0.1, T.gCoge1 + 0.15, "decidido"], [T.gApunta, T.gApunta + 0.15, "apunta"],
    [T.gSuelta - 0.08, T.gSuelta + 0.02, "lanza"], [T.lona - 0.05, T.lona + 0.1, "sorpresa"], [T.frente - 0.02, T.frente + 0.03, "golpe"],
    [T.gMareo + 0.1, T.gMareo + 0.2, "mareo"], [T.gDespeja, T.gDespeja + 0.2, "enfado"], [T.gCarga2, T.gCarga2 + 0.15, "carga"],
    [T.gSuelta2 + 0.05, T.gSuelta2 + 0.15, "esperanza"], [T.gMiraArriba, T.gMiraArriba + 0.12, "arriba"],
    [T.aterriza - 0.03, T.aterriza + 0.03, "aplasta"], [T.aterriza + 0.35, T.aterriza + 0.5, "bizco"],
    [T.gCamara, T.gCamara + 0.25, "resignado"]
  ];
  const CUERPOS_G = {
    inicio: { torso: 0.02, cab: 0.0, dx: 0, dy: 0 }, mira: { torso: -0.02, cab: -0.08, dx: 0, dy: 0 },
    agacha: { torso: 0.16, cab: 0.32, dx: -4, dy: 70 }, pasmo: { torso: 0.04, cab: 0.04, dx: 2, dy: 0 },
    coge: { torso: 0.18, cab: 0.08, dx: 8, dy: 6 }, apunta: { torso: -0.02, cab: 0.04, dx: 0, dy: 0 },
    carga: { torso: -0.18, cab: -0.06, dx: -12, dy: 2 }, lanza: { torso: 0.28, cab: 0.16, dx: 10, dy: 8 },
    golpe: { torso: -0.16, cab: -0.42, dx: -8, dy: 0 }, mareo: { torso: -0.04, cab: -0.08, dx: -4, dy: 0 },
    carga2: { torso: -0.24, cab: -0.14, dx: -6, dy: 6 }, sigue2: { torso: 0.22, cab: 0.08, dx: 8, dy: 6 },
    arriba: { torso: -0.06, cab: -0.24, dx: 0, dy: 0 }, aplasta: { torso: 0.04, cab: 0.08, dx: 0, dy: 14 },
    final: { torso: 0.0, cab: -0.04, dx: 0, dy: 0 }
  };
  const GUION_CUERPO_G = [
    [T.gMiraR, T.gMiraR + 0.3, "mira"], [T.gAgacha, T.gAgachado, "agacha", salida], [T.gSube, T.gSube + 0.35, "pasmo"],
    [T.gCoge1 - 0.15, T.gCoge1 + 0.05, "coge"], [T.gCogido1, T.gPasa1, "apunta"],
    [T.gCarga, T.gSuelta - 0.1, "carga"], [T.gSuelta - 0.1, T.gSuelta + 0.04, "lanza", salida], [T.gSigue, T.gSigue + 0.3, "apunta"],
    [T.frente - 0.01, T.frente + 0.08, "golpe", salida], [T.gMareo + 0.2, T.gMareo + 0.6, "mareo"], [T.gDespeja, T.gDespeja + 0.3, "inicio"],
    [T.gCoge2 - 0.15, T.gCoge2 + 0.05, "coge"], [T.gCogido2, T.gPasa2, "apunta"],
    [T.gCarga2, T.gTiembla, "carga2"], [T.gSuelta2 - 0.08, T.gSuelta2 + 0.06, "sigue2", salida],
    [T.gMiraArriba - 0.05, T.gMiraArriba + 0.2, "arriba"], [T.aterriza - 0.02, T.aterriza + 0.06, "aplasta", salida],
    [T.aterriza + 0.1, T.aterriza + 0.45, "final"]
  ];

  function poseG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const respira = Math.sin(t * 2.3);
    const p = {
      x: XG, suelo: SUELO, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.005 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // carga con rabia: tiembla
    const temb = dentro(t, T.gTiembla - 0.2, T.gTiembla, T.gSuelta2 - 0.12, T.gSuelta2 - 0.04);
    p.torso += 0.012 * Math.sin(t * 61) * temb; p.cabeza.ang += 0.02 * Math.sin(t * 53 + 1) * temb;
    // mareo: la cabeza da vueltecitas
    const mar = dentro(t, T.gMareo, T.gMareo + 0.3, T.gDespeja - 0.2, T.gDespeja + 0.1);
    p.cabeza.ang += 0.08 * Math.sin((t - T.gMareo) * 7) * mar; p.torso += 0.03 * Math.sin((t - T.gMareo) * 7 + 1) * mar;
    // el golpe en la frente: latigazo atrás
    p.cabeza.ang += -0.1 * muelle(t, T.frente, 24, 6);
    // el peluche cae: le hunde la cabeza
    p.cabeza.dy += 9 * Math.max(0, muelle(t, T.aterriza, 18, 7));
    // carga con la rodilla arriba
    const rodilla = dentro(t, T.gCarga2 + 0.1, T.gTiembla, T.gSuelta2 - 0.05, T.gSuelta2 + 0.1);
    p.pelvis = G.aHoja(p, { x: XG + b.dx, y: PY_PIE(G) + b.dy + respira * 0.9 });
    const TOB = G.SUELO - G.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: G.CADERA.cerca.x - 22, y: TOB }, ang: 0 };
    p.piernas.lejos = { tob: { x: G.CADERA.lejos.x + 26 - 10 * rodilla, y: TOB - 330 * rodilla }, ang: 0.25 * rodilla };
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    if (mar > 0) { ex.esp = Math.max(ex.esp, mar); }
    p.cara = cara(ex, (ex.c > 0.8 || ex.z > 0.4 || ex.wi > 0.5 || ex.esp > 0.3) ? 0 : parpadeo(t, [0.25, 1.7, 3.1, 6.95, 10.5, 11.6, 12.6]));
    p.rojo = 0.3 * campana(t, T.gPica - 0.1, T.gPica + 0.9) + 0.6 * dentro(t, T.gEnfado, T.gEnfado + 0.3, T.gSuelta2, T.gSuelta2 + 0.4);
    p.enfado = 0.9 * dentro(t, T.gEnfado, T.gEnfado + 0.2, T.gSuelta2, T.gSuelta2 + 0.3) + 0.7 * dentro(t, T.gPica, T.gPica + 0.15, T.gCoge1, T.gCogido1);
    p.sudor = 0.7 * dentro(t, T.gTiembla - 0.2, T.gTiembla, T.gSuelta2, T.gSuelta2 + 0.3);
    const marca = tramo(t, T.frente, T.frente + 0.06);
    if (marca > 0) p.capaCabeza = g => marcaRoja(g, marca);
    p._temb = temb;
    manosG(p, t);
    return p;
  }

  // las manos de Guillermo: coge cada pelota con la de delante, se la pasa a la de detrás y lanza con ella
  function manosG(p, t) {
    const cesta1 = EN_CESTA[0], cesta2 = EN_CESTA[1];
    const pasoL = { x: 502, y: 328 }, pasoC = { x: 489, y: 331 };
    const S1 = T.gSuelta, A1 = S1 - 0.13, S2 = T.gSuelta2, A2 = S2 - 0.12;
    const arco1 = arcoLanza(G, p, "cerca", [[0, 0, -0.61, 50], [T.gCarga, A1, -2.6, 90], [A1, S1, -0.3, 90, acel]], { d: AGARRA });
    // la segunda: molinillo enorme hacia atrás, aguanta temblando y se le escapa hacia arriba
    const arco2 = arcoLanza(G, p, "cerca", [[0, 0, 0.91, 84], [T.gCarga2, T.gCarga2 + 0.42, -2.2, 92], [A2, S2, -1.05, 92, acel]], { d: AGARRA });
    const cuelgaL = () => rel(G, p, "lejos", 5, 86, { d: RELAJADA, bol: 0, ka: 0 });
    const cuelgaC = () => rel(G, p, "cerca", 6, 94, { d: RELAJADA, bol: 0 });
    // mano lejana (la de delante): coge la pelota de la cesta, se la pasa, apunta; equilibrio
    const PL = [
      [0, 0, { x: 520, y: 380, ang: 0, d: RELAJADA, bol: 1 }],
      [T.gPica, T.gPica + 0.2, () => rel(G, p, "lejos", 2, 82, { d: PUNO, bol: 0 })],
      [T.gCoge1 - 0.25, T.gCoge1, { x: cesta1.x, y: cesta1.y - 2, ang: 0, d: ABRE }],
      [T.gCoge1, T.gCogido1, { x: cesta1.x, y: cesta1.y, ang: 0, d: AGARRA }],
      [T.gCogido1, T.gPasa1 - 0.06, { x: pasoL.x, y: pasoL.y, ang: 0, d: AGARRA }],
      [T.gPasa1 - 0.02, T.gApunta + 0.1, () => Object.assign(manoAnte(G, p, "lejos", 0.45), { ang: 0, d: SENALA, ma: Math.PI, ka: 1 })],
      [T.gCarga, A1, () => rel(G, p, "lejos", 74, 8, { d: ABRE, ka: 0 })],
      [A1 + 0.04, T.gSigue + 0.1, () => rel(G, p, "lejos", -8, 84, { d: RELAJADA })],
      [T.frente + 0.01, T.frente + 0.14, () => rel(G, p, "lejos", 52, 52, { d: ABIERTA }), salida],
      [T.gMareo + 0.3, T.gMareo + 0.7, cuelgaL],
      [T.gEnfado, T.gEnfado + 0.15, () => rel(G, p, "lejos", 2, 82, { d: PUNO })],
      [T.gCoge2 - 0.25, T.gCoge2, { x: cesta2.x, y: cesta2.y - 2, ang: 0, d: ABRE }],
      [T.gCoge2, T.gCogido2, { x: cesta2.x, y: cesta2.y, ang: 0, d: AGARRA }],
      [T.gCogido2, T.gPasa2 - 0.06, { x: pasoL.x, y: pasoL.y, ang: 0, d: AGARRA }],
      [T.gPasa2, T.gCarga2 + 0.2, () => rel(G, p, "lejos", 72, -18, { d: ABRE })],
      [S2 - 0.04, T.gSigue2 + 0.05, () => rel(G, p, "lejos", 6, 84, { d: RELAJADA })],
      [T.aterriza - 0.01, T.aterriza + 0.1, () => rel(G, p, "lejos", 50, 44, { d: ABIERTA }), salida],
      [T.aterriza + 0.5, T.aterriza + 0.9, cuelgaL]
    ];
    const l = pista(PL, t);
    // mano cercana: recibe la pelota, la sujeta junto a la cabeza, carga y lanza
    const PC = [
      [0, 0, { x: 470, y: 380, ang: 0, d: RELAJADA, bol: 1 }],
      [T.gPica, T.gPica + 0.2, () => rel(G, p, "cerca", -4, 88, { d: PUNO, bol: 0 })],
      [T.gCogido1, T.gPasa1 - 0.06, { x: pasoC.x, y: pasoC.y, ang: 0, d: ABRE }],
      [T.gPasa1 - 0.06, T.gPasa1, { x: pasoC.x, y: pasoC.y, ang: 0, d: AGARRA }],
      [T.gPasa1, T.gApunta + 0.15, arco1],
      [S1, T.gSigue + 0.06, () => rel(G, p, "cerca", 64, 62, { d: ABRE }), salida],
      [T.frente + 0.01, T.frente + 0.14, () => rel(G, p, "cerca", 18, 70, { d: ABIERTA }), salida],
      [T.gMareo + 0.3, T.gMareo + 0.7, cuelgaC],
      [T.gEnfado, T.gEnfado + 0.15, () => rel(G, p, "cerca", -4, 88, { d: PUNO })],
      [T.gCogido2, T.gPasa2 - 0.06, { x: pasoC.x, y: pasoC.y, ang: 0, d: ABRE }],
      [T.gPasa2 - 0.06, T.gPasa2, { x: pasoC.x, y: pasoC.y, ang: 0, d: AGARRA }],
      [T.gPasa2, T.gPasa2 + 0.08, arco2],
      [S2, T.gSigue2 + 0.06, () => rel(G, p, "cerca", 70, 30, { d: ABRE }), salida],
      [T.gMiraArriba, T.gMiraArriba + 0.3, cuelgaC],
      [T.aterriza - 0.01, T.aterriza + 0.1, () => rel(G, p, "cerca", 16, 72, { d: ABIERTA }), salida],
      [T.aterriza + 0.5, T.aterriza + 0.9, cuelgaC]
    ];
    const c = pista(PC, t);
    // temblor de la carga
    if (p._temb > 0) { c.x += 2.5 * Math.sin(t * 57) * p._temb; c.y += 2 * Math.sin(t * 49) * p._temb; }
    // ¿qué mano lleva pelota?
    const enL = (t >= T.gCoge1 && t < T.gPasa1) || (t >= T.gCoge2 && t < T.gPasa2);
    const enC = (t >= T.gPasa1 && t < S1) || (t >= T.gPasa2 && t < S2);
    const qL = agarre(G, p, "lejos", l), qC = agarre(G, p, "cerca", c);
    const bL = { x: qL.x, y: qL.y, giro: 0.4 }, bC = { x: qC.x, y: qC.y, giro: -0.3 };
    p.pelotaL = enL ? bL : null; p.pelotaC = enC ? bC : null;
    p.manoLejos = manoRig(G, p, l, "lejos", BOLS_GL, -1, enL ? (g => conCamara(g, () => dibPelota(g, bL.x, bL.y, R_BOLA, bL.giro))) : null);
    p.manoCerca = manoRig(G, p, c, "cerca", BOLS_GC, -1, enC ? (g => conCamara(g, () => dibPelota(g, bC.x, bC.y, R_BOLA, bC.giro))) : null);
  }
  // marca roja de la pelota en la frente (retrato)
  function marcaRoja(g, k) {
    g.save(); g.globalAlpha = 0.75 * k;
    g.translate(782, 452);
    g.fillStyle = "#e0303a"; g.beginPath(); g.ellipse(0, 0, 44, 40, -0.2, 0, TAU); g.fill();
    g.strokeStyle = "rgba(140,10,20,0.8)"; g.lineWidth = 6; g.lineCap = "round";
    g.beginPath(); g.arc(-60, 0, 54, -0.6, 0.6); g.stroke(); g.beginPath(); g.arc(60, 0, 54, Math.PI - 0.6, Math.PI + 0.6); g.stroke();
    g.restore();
  }

  /* =====================================================================================
   * PELOTAS EN VUELO
   * ===================================================================================== */
  const BLANCO_R = { x: 707, y: 268 };        // la lata de la izquierda de la segunda fila
  const LONA_P = { x: 912, y: 102 };          // donde da la primera de Guillermo
  const PEL_CIMA = { x: PEL_BASE.x + 2, y: PEL_BASE.y - PEL_ALTO - R_BOLA + 2 };
  let SAL = null;                              // puntos de salida (se calculan una vez)
  function salidas() {
    if (SAL) return SAL;
    const pr = poseR(T.rSuelta - 0.0001), g1 = poseG(T.gSuelta - 0.0001), g2 = poseG(T.gSuelta2 - 0.0001), gf = poseG(T.frente);
    SAL = { r: pr.pelotaR, g1: g1.pelotaC, g2: g2.pelotaC,
      frente: G.aPantalla(gf, G.cabeza(gf).a({ x: 790, y: 452 })) };
    return SAL;
  }
  // devuelve {x, y, giro | "delante"} o null
  function pelotaRodri(t) {
    if (t < T.rSuelta) return null;
    const s = salidas();
    if (t < T.impacto) { const q = arco(s.r, BLANCO_R, T.rSuelta, T.impacto, 96, t); return { x: q.x, y: q.y, giro: t * 22, estela: true }; }
    const u = t - T.impacto; if (u > 0.9) return null;
    return { x: BLANCO_R.x + 120 * u, y: BLANCO_R.y - 220 * u + 0.5 * GRAV * u * u, giro: t * 18 };
  }
  const SUELO_G1 = { x: 446 };
  function pelotaG1(t) {
    if (t < T.gSuelta) return null;
    const s = salidas();
    if (t < T.lona) { const q = arco(s.g1, LONA_P, T.gSuelta, T.lona, 30, t); return { x: q.x, y: q.y, giro: t * 20, estela: true }; }
    if (t < T.frente) { const q = arco(LONA_P, s.frente, T.lona, T.frente, 10, t); return { x: q.x, y: q.y, giro: -t * 20, estela: true }; }
    // rebota en la frente, cae al suelo, bota y rueda hacia atrás
    const a = s.frente, u = t - T.frente;
    const tCae = 0.42;
    if (u < tCae) { const q = parabola(a, { x: a.x - 34, y: SUELO_BOLA }, T.frente, T.frente + tCae, GRAV, t); return { x: q.x, y: q.y, giro: -t * 9 }; }
    const v = u - tCae, x = a.x - 34 - 70 * (1 - Math.exp(-v * 2.2));
    return { x, y: SUELO_BOLA + botes(v, 320, GRAV, 3), giro: -(x - a.x) / R_BOLA };
  }
  function pelotaG2(t) {
    if (t < T.gSuelta2) return null;
    const s = salidas();
    if (t < T.golpePeluche) { const q = parabola(s.g2, PEL_CIMA, T.gSuelta2, T.golpePeluche, 2200, t); return { x: q.x, y: q.y, giro: t * 15, estela: q.vy < 0 }; }
    // rebota en la cabeza del peluche y cae al mostrador, bota y rueda
    const u = t - T.golpePeluche, tCae = 0.62, a = PEL_CIMA, b = { x: 742, y: MOST.y - R_BOLA };
    if (u < tCae) { const q = parabola(a, b, T.golpePeluche, T.golpePeluche + tCae, 2200, t); return { x: q.x, y: q.y, giro: t * 12 }; }
    const v = u - tCae, x = b.x + 60 * (1 - Math.exp(-v * 1.8));
    return { x, y: b.y + botes(v, 260, GRAV, 3), giro: (x - b.x) / R_BOLA };
  }

  /* =====================================================================================
   * LATAS
   * ===================================================================================== */
  const COL_LATA = [["#d92a2a", "#ffd25a"], ["#2a74d9", "#ffffff"], ["#f2b830", "#c22a36"], ["#2fae5a", "#ffe7a0"]];
  let SPR_LATA = null;
  function creaLatas() {
    SPR_LATA = COL_LATA.map(([banda, estr]) => {
      const c = document.createElement("canvas"); c.width = 64; c.height = 76; const g = c.getContext("2d");
      g.scale(2, 2); g.translate(16, 19); g.lineJoin = "round";
      const w = LATA.w / 2, h = LATA.h / 2, e = 3.4;
      const cuerpo = () => { g.beginPath(); g.moveTo(-w, -h + e); g.lineTo(-w, h - e); g.ellipse(0, h - e, w, e, 0, Math.PI, 0, true); g.lineTo(w, -h + e); g.ellipse(0, -h + e, w, e, 0, 0, Math.PI, true); g.closePath(); };
      cuerpo(); const gm = g.createLinearGradient(-w, 0, w, 0); gm.addColorStop(0, "#8d97a0"); gm.addColorStop(0.35, "#eef2f4"); gm.addColorStop(0.7, "#b9c2c9"); gm.addColorStop(1, "#7a838c");
      g.fillStyle = gm; g.fill();
      g.save(); cuerpo(); g.clip();
      g.fillStyle = banda; g.fillRect(-w, -h + 7, 2 * w, 2 * h - 14);
      g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(-w * 0.55, -h + 7, w * 0.35, 2 * h - 14);
      g.fillStyle = "rgba(0,0,0,0.22)"; g.fillRect(w * 0.45, -h, w * 0.6, 2 * h);
      g.restore();
      estrella(g, 0, 0.5, 5.2, estr, 1.2);
      g.beginPath(); g.ellipse(0, -h + e, w, e, 0, 0, TAU); g.fillStyle = "#dfe4e8"; g.fill();
      g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 0.8; g.beginPath(); g.ellipse(0, -h + e, w * 0.8, e * 0.7, 0, 0, TAU); g.stroke();
      cuerpo(); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke();
      g.beginPath(); g.ellipse(0, -h + e, w, e, 0, 0, Math.PI); g.stroke();
      return c;
    });
  }
  // las dos pirámides: posición de reposo de cada lata (centro)
  function piramide(cx, base, filas, sem) {
    const out = [];
    for (let r = 0; r < filas; r++) { const n = filas - r;
      for (let i = 0; i < n; i++) out.push({ x: cx + (i - (n - 1) / 2) * LATA.paso, y: base - LATA.h / 2 - r * (LATA.h + 0.5), fila: r, col: (i + r * 2 + sem) % 4 }); }
    return out;
  }
  const PIR1 = piramide(734, GRADA1.y, 4, 0), PIR2 = piramide(908, GRADA2.y, 3, 1);
  // vuelo de cada lata de la pirámide grande tras el golpe
  const VUELO1 = PIR1.map((q, j) => {
    const dx = q.x - BLANCO_R.x, dy = q.y - BLANCO_R.y, d = Math.hypot(dx, dy);
    return { ret: d / 1100, vx: 160 + 300 * hash(j * 3.3) + 2.2 * dx, vy: -(200 + 330 * hash(j * 7.1)) + 1.5 * dy, w: (hash(j * 1.9) - 0.5) * 26 };
  });
  function lataEn(q, v, t) {
    const u = t - T.impacto - v.ret;
    if (u <= 0) return { x: q.x, y: q.y, a: 0 };
    let x = q.x + v.vx * u, vx = v.vx;
    if (x > LONA.xRebote) { const tr = (LONA.xRebote - q.x) / v.vx; x = LONA.xRebote - (u - tr) * v.vx * 0.35; }
    void vx;
    return { x, y: q.y + v.vy * u + 0.5 * GRAV * u * u, a: v.w * u };
  }
  function dibLatas(g, t) {
    // la pirámide pequeña se estremece cuando la pelota da en la lona
    const tiembla = 0.05 * muelle(t, T.lona, 40, 7);
    for (const q of PIR2) { const a = tiembla * (1 + q.fila) * (q.x > 908 ? 1 : -1);
      g.save(); g.translate(q.x, q.y + LATA.h / 2); g.rotate(a); g.drawImage(SPR_LATA[q.col], -16, -19 - LATA.h / 2, 32, 38); g.restore(); }
    PIR1.forEach((q, j) => {
      const p = lataEn(q, VUELO1[j], t); if (p.y > MOST.y + 60) return;
      g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.drawImage(SPR_LATA[q.col], -16, -19, 32, 38); g.restore();
    });
  }

  /* =====================================================================================
   * EL PELUCHE GIGANTE
   * ===================================================================================== */
  let SPR_PEL = null;
  const PEL_K = 2;
  function creaPeluche() {
    const c = document.createElement("canvas"); c.width = 120 * PEL_K; c.height = 112 * PEL_K; const g = c.getContext("2d");
    g.scale(PEL_K, PEL_K); g.translate(60, 106); g.lineJoin = "round"; g.lineCap = "round";
    const ROSA = "#f49ac1", SOMBRA = "#d66f9f", CLARO = "#ffd3e6";
    const contorno = () => { g.strokeStyle = TINTA; g.lineWidth = 2.6; g.stroke(); };
    // pies
    for (const s of [-1, 1]) {
      g.beginPath(); g.ellipse(s * 22, -7, 15, 9, s * 0.15, 0, TAU); g.fillStyle = ROSA; g.fill(); contorno();
      g.beginPath(); g.ellipse(s * 22, -6, 8, 5, s * 0.15, 0, TAU); g.fillStyle = CLARO; g.fill();
    }
    // orejas
    for (const s of [-1, 1]) {
      g.beginPath(); g.arc(s * 31, -84, 14, 0, TAU); g.fillStyle = ROSA; g.fill(); contorno();
      g.beginPath(); g.arc(s * 31, -83, 7.5, 0, TAU); g.fillStyle = CLARO; g.fill();
    }
    // cuerpo (cabeza y tripa en una sola bola)
    g.beginPath(); g.ellipse(0, -47, 45, 42, 0, 0, TAU);
    const gc = g.createRadialGradient(-14, -64, 6, 0, -47, 50); gc.addColorStop(0, "#ffc2dc"); gc.addColorStop(0.6, ROSA); gc.addColorStop(1, SOMBRA);
    g.fillStyle = gc; g.fill(); contorno();
    // pelusa
    g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 1.2;
    for (let i = 0; i < 26; i++) { const a = i / 26 * TAU, r = 30 + 10 * hash(i * 2.7);
      const x = Math.cos(a) * r, y = -47 + Math.sin(a) * r * 0.9; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y - 2); g.stroke(); }
    // bracitos
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 40, -30, 9, 14, s * -0.6, 0, TAU); g.fillStyle = ROSA; g.fill(); contorno(); }
    // tripa con corazón y pespunte
    g.beginPath(); g.ellipse(0, -24, 22, 15, 0, 0, TAU); g.fillStyle = CLARO; g.fill();
    g.setLineDash([2.5, 2.5]); g.strokeStyle = SOMBRA; g.lineWidth = 1.2; g.beginPath(); g.ellipse(0, -24, 19, 12.5, 0, 0, TAU); g.stroke(); g.setLineDash([]);
    g.beginPath(); g.moveTo(0, -18); g.bezierCurveTo(-11, -25, -7, -34, 0, -28); g.bezierCurveTo(7, -34, 11, -25, 0, -18);
    g.fillStyle = "#e3264a"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
    // carrillos
    g.fillStyle = "rgba(255,90,140,0.45)";
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 25, -46, 7, 4.5, 0, 0, TAU); g.fill(); }
    // ojos de botón
    for (const s of [-1, 1]) {
      g.beginPath(); g.arc(s * 15, -57, 6.4, 0, TAU); g.fillStyle = "#1a1418"; g.fill();
      g.fillStyle = "#3a3038"; for (const [dx, dy] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) { g.beginPath(); g.arc(s * 15 + dx, -57 + dy, 0.9, 0, TAU); g.fill(); }
      g.fillStyle = "rgba(255,255,255,0.85)"; g.beginPath(); g.arc(s * 15 - 2.4, -59.5, 1.6, 0, TAU); g.fill();
    }
    // hocico y boquita cosida
    g.beginPath(); g.ellipse(0, -44, 9, 6.5, 0, 0, TAU); g.fillStyle = CLARO; g.fill();
    g.beginPath(); g.ellipse(0, -46.5, 3.6, 2.6, 0, 0, TAU); g.fillStyle = "#3a1a24"; g.fill();
    g.strokeStyle = "#3a1a24"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, -44); g.lineTo(0, -41.5); g.stroke();
    g.beginPath(); g.arc(-2.6, -41.5, 2.6, 0, Math.PI); g.arc(2.6, -41.5, 2.6, 0, Math.PI); g.stroke();
    // lazo en la oreja derecha
    g.save(); g.translate(38, -94); g.rotate(0.35);
    g.fillStyle = "#ffd23a"; g.strokeStyle = TINTA; g.lineWidth = 2;
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(s * 14, -11, s * 15, 1); g.quadraticCurveTo(s * 13, 9, 0, 0); g.fill(); g.stroke(); }
    g.beginPath(); g.arc(0, 0, 3.6, 0, TAU); g.fill(); g.stroke();
    g.restore();
    SPR_PEL = c;
  }
  function dibPeluche(g, x, y, ang, sx, sy) {
    g.save(); g.translate(x, y); g.rotate(ang); g.scale(sx * PEL_ESC, sy * PEL_ESC);
    g.drawImage(SPR_PEL, -60, -106, 120, 112);
    g.restore();
  }
  // estado del peluche: dónde está su base, su giro y su aplastado
  let ATERRIZA = null;
  function anclaCabeza(p) {
    const H = G.cabeza(p), a = G.aPantalla(p, H.a({ x: 800, y: 240 }));
    return { x: a.x, y: a.y, ang: H.ang };
  }
  function estadoPeluche(t, pG) {
    const golpe = muelle(t, T.golpePeluche, 30, 9);
    if (t < T.golpePeluche) return { x: PEL_BASE.x, y: PEL_BASE.y, ang: 0, sx: 1, sy: 1, capa: "repisa" };
    if (t < T.vuelca) {   // aplastón por el pelotazo
      const k = fase(t, T.golpePeluche, T.vuelca);
      return { x: PEL_BASE.x - 4 * k, y: PEL_BASE.y, ang: -0.12 * k, sx: 1 + 0.12 * Math.max(0, golpe), sy: 1 - 0.18 * Math.max(0, golpe), capa: "repisa" };
    }
    if (!ATERRIZA) ATERRIZA = anclaCabeza(poseG(T.aterriza));
    if (t < T.aterriza) {  // se vuelca hacia Guillermo y cae
      const k = fase(t, T.vuelca, T.aterriza);
      const a = { x: PEL_BASE.x - 4, y: PEL_BASE.y }, b = ATERRIZA;
      const x = lerp(a.x, b.x, salida(k)), y = lerp(a.y, b.y, entrada(k)) - 26 * Math.sin(Math.PI * k) * (1 - k);
      const ang = lerp(-0.12, b.ang, k) - 0.75 * Math.sin(Math.PI * k);
      return { x, y, ang, sx: 1 - 0.06 * Math.sin(Math.PI * k), sy: 1 + 0.08 * Math.sin(Math.PI * k), capa: "cae" };
    }
    // sentado en la cabeza: sigue a la cabeza, con su aplastón y un bamboleo
    const c = anclaCabeza(pG), u = t - T.aterriza;
    const apl = Math.exp(-u * 6) * Math.cos(u * 22);
    const bam = 0.06 * muelle(t, T.aterriza, 9, 2.4) + 0.02 * Math.sin(t * 2.1) * tramo(t, T.aterriza + 0.8, T.aterriza + 1.6);
    return { x: c.x, y: c.y, ang: c.ang + bam, sx: 1 + 0.16 * apl, sy: 1 - 0.22 * apl, capa: "cabeza" };
  }

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  let fondo = null, frente = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 100; const g = c.getContext("2d");
    g.translate(60, 50); g.lineJoin = "round"; g.lineCap = "round";
    const cielo = g.createLinearGradient(0, -50, 0, 420); cielo.addColorStop(0, "#0a0c22"); cielo.addColorStop(0.6, "#1d1846"); cielo.addColorStop(1, "#3a2552");
    g.fillStyle = cielo; g.fillRect(-60, -50, W + 120, 520);
    for (let i = 0; i < 70; i++) { const x = -50 + hash(i * 3.1) * (W + 100), y = -40 + hash(i * 7.7) * 260, r = 0.6 + hash(i * 1.3) * 1.3;
      g.fillStyle = `rgba(255,250,230,${0.35 + 0.5 * hash(i * 5.3)})`; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    // noria lejana
    const NX = 150, NY = 150, NR = 118;
    g.strokeStyle = "rgba(120,110,170,0.55)"; g.lineWidth = 3;
    g.beginPath(); g.arc(NX, NY, NR, 0, TAU); g.stroke();
    g.beginPath(); g.arc(NX, NY, NR * 0.92, 0, TAU); g.stroke();
    for (let i = 0; i < 16; i++) { const a = i * TAU / 16; g.beginPath(); g.moveTo(NX, NY); g.lineTo(NX + Math.cos(a) * NR, NY + Math.sin(a) * NR); g.lineWidth = 1.6; g.stroke(); }
    g.lineWidth = 4; g.beginPath(); g.moveTo(NX - 60, 420); g.lineTo(NX, NY); g.lineTo(NX + 60, 420); g.stroke();
    for (let i = 0; i < 12; i++) { const a = i * TAU / 12 + 0.13, x = NX + Math.cos(a) * NR, y = NY + Math.sin(a) * NR;
      g.fillStyle = "rgba(60,50,100,0.85)"; g.beginPath(); g.roundRect(x - 9, y + 2, 18, 13, 3); g.fill(); }
    // casetas lejanas: siluetas y luces desenfocadas
    g.fillStyle = "#1a1530";
    for (const [x, w, h] of [[-40, 170, 120], [250, 140, 100], [380, 120, 130]]) {
      g.beginPath(); g.moveTo(x, 420); g.lineTo(x, 420 - h); g.lineTo(x + w / 2, 420 - h - 34); g.lineTo(x + w, 420 - h); g.lineTo(x + w, 420); g.fill(); }
    for (let i = 0; i < 26; i++) { const x = -40 + hash(i * 9.1) * 600, y = 250 + hash(i * 2.3) * 150, r = 6 + hash(i * 4.4) * 16,
      col = ["255,120,150", "255,210,110", "120,230,255", "190,150,255"][i % 4];
      const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, `rgba(${col},0.42)`); rg.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    // suelo de tierra apisonada
    const gs = g.createLinearGradient(0, 410, 0, H + 50); gs.addColorStop(0, "#4a3326"); gs.addColorStop(1, "#7a573c");
    g.fillStyle = gs; g.fillRect(-60, 410, W + 120, H + 60 - 410);
    for (let i = 0; i < 160; i++) { const x = -50 + hash(i * 1.9) * (W + 100), y = 420 + hash(i * 3.7) * 200, r = 0.8 + hash(i * 6.1) * 1.8;
      g.fillStyle = hash(i * 8.3) > 0.5 ? "rgba(255,220,170,0.16)" : "rgba(30,15,8,0.25)"; g.beginPath(); g.ellipse(x, y, r * 1.6, r, 0, 0, TAU); g.fill(); }
    const lz = g.createRadialGradient(560, 470, 20, 560, 470, 420); lz.addColorStop(0, "rgba(255,190,110,0.32)"); lz.addColorStop(1, "rgba(255,190,110,0)");
    g.fillStyle = lz; g.fillRect(-60, 380, W + 120, 280);
    caseta(g);
    return c;
  }
  // la caseta (lo que queda detrás de las latas: lona, gradas, poste derecho y toldo)
  function caseta(g) {
    g.save(); g.beginPath(); g.rect(LONA.x0, LONA.y0, LONA.x1 - LONA.x0 + 40, LONA.y1 - LONA.y0 + 20); g.clip();
    for (let x = LONA.x0 - 20, i = 0; x < W + 40; x += 34, i++) { g.fillStyle = i % 2 ? "#e9dcc2" : "#b7323d"; g.fillRect(x, LONA.y0, 34, LONA.y1 - LONA.y0 + 20); }
    const sl = g.createLinearGradient(0, LONA.y0, 0, LONA.y1); sl.addColorStop(0, "rgba(20,8,20,0.45)"); sl.addColorStop(0.35, "rgba(20,8,20,0.12)"); sl.addColorStop(1, "rgba(20,8,20,0.38)");
    g.fillStyle = sl; g.fillRect(LONA.x0, LONA.y0, W, LONA.y1 - LONA.y0 + 20);
    g.strokeStyle = "rgba(60,20,30,0.22)"; g.lineWidth = 3;
    for (let x = LONA.x0 + 40; x < W; x += 68) { g.beginPath(); g.moveTo(x, LONA.y0); g.quadraticCurveTo(x + 6, (LONA.y0 + LONA.y1) / 2, x - 2, LONA.y1); g.stroke(); }
    const fo = g.createRadialGradient(800, 120, 10, 800, 160, 320); fo.addColorStop(0, "rgba(255,230,160,0.35)"); fo.addColorStop(1, "rgba(255,230,160,0)");
    g.fillStyle = fo; g.fillRect(LONA.x0, LONA.y0, W, LONA.y1);
    g.restore();
    grada(g, GRADA1.x0, GRADA1.x1, GRADA1.y, MOST.y);
    grada(g, GRADA2.x0, GRADA2.x1, GRADA2.y, MOST.y);
    for (const [x, col, l] of [[640, "#7fd3ff", 22], [994, "#a8f08a", 26]]) peluchito(g, x, TOLDO.fald, l, col);
    poste(g, POSTE2.x, 0, MOST.y + 4);
    g.fillStyle = "#4a1420"; g.fillRect(POSTE.x - 20, -50, W, TOLDO.y1 + 50);
  }
  function grada(g, x0, x1, y, yb) {
    g.fillStyle = "#5a3418"; g.fillRect(x0 + 8, y, 10, yb - y); g.fillRect(x1 - 18, y, 10, yb - y);
    g.fillStyle = "#3a2010"; g.fillRect(x0 + 14, y + 8, x1 - x0 - 28, 6);
    g.fillStyle = "#8a5a2c"; g.fillRect(x0, y, x1 - x0, 9);
    g.fillStyle = "rgba(255,220,160,0.35)"; g.fillRect(x0, y, x1 - x0, 2);
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x0, y, x1 - x0, 9);
    g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(x0, y + 9, x1 - x0, 5);
  }
  function peluchito(g, x, y0, l, col) {
    g.strokeStyle = "rgba(240,230,200,0.7)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + l); g.stroke();
    const y = y0 + l + 11;
    g.fillStyle = col; g.strokeStyle = TINTA; g.lineWidth = 2;
    for (const s of [-1, 1]) { g.beginPath(); g.arc(x + s * 7, y - 8, 4.5, 0, TAU); g.fill(); g.stroke(); }
    g.beginPath(); g.ellipse(x, y, 11, 12, 0, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = TINTA; g.beginPath(); g.arc(x - 4, y - 2, 1.6, 0, TAU); g.arc(x + 4, y - 2, 1.6, 0, TAU); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.4; g.beginPath(); g.arc(x, y + 2, 3, 0.3, Math.PI - 0.3); g.stroke();
  }
  function poste(g, x, y0, y1) {
    g.save(); g.beginPath(); g.rect(x - 7, y0, 15, y1 - y0); g.clip();
    g.fillStyle = "#f1e6cc"; g.fillRect(x - 7, y0, 15, y1 - y0);
    g.fillStyle = "#c22a36";
    for (let y = y0 - 40; y < y1; y += 28) { g.beginPath(); g.moveTo(x - 8, y); g.lineTo(x + 8, y - 12); g.lineTo(x + 8, y + 2); g.lineTo(x - 8, y + 14); g.fill(); }
    g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(x + 3, y0, 5, y1 - y0);
    g.restore();
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(x - 7, y0, 15, y1 - y0);
  }
  // lo que va delante de las latas: mostrador, poste izquierdo, faldón, repisa
  function creaFrente() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 100; const g = c.getContext("2d");
    g.translate(60, 50); g.lineJoin = "round"; g.lineCap = "round";
    const y0 = MOST.y + MOST.grosor;
    g.fillStyle = "#a8222e"; g.fillRect(MOST.x0, y0, W - MOST.x0 + 40, H + 50 - y0);
    g.fillStyle = "#f2c64a"; g.fillRect(MOST.x0, y0 + 8, W - MOST.x0 + 40, 7); g.fillRect(MOST.x0, H - 40, W - MOST.x0 + 40, 7);
    for (let x = MOST.x0 + 46; x < W + 20; x += 96) estrella(g, x, (y0 + H - 30) / 2 + 10, 17, "#f2c64a", 2);
    const so = g.createLinearGradient(0, y0, 0, H + 50); so.addColorStop(0, "rgba(0,0,0,0.0)"); so.addColorStop(1, "rgba(0,0,0,0.35)");
    g.fillStyle = so; g.fillRect(MOST.x0, y0, W, H + 50 - y0);
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.moveTo(MOST.x0, y0); g.lineTo(MOST.x0, H + 50); g.stroke();
    g.fillStyle = "#9a6630"; g.fillRect(MOST.x0 - 6, MOST.y, W - MOST.x0 + 46, MOST.grosor);
    g.fillStyle = "rgba(255,225,170,0.4)"; g.fillRect(MOST.x0 - 6, MOST.y, W, 3);
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(MOST.x0 - 6, MOST.y, W, MOST.grosor);
    poste(g, POSTE.x, -50, H + 50);
    const x0 = POSTE.x - 18;
    g.fillStyle = "#6a1a26"; g.fillRect(x0, -50, W + 40, TOLDO.y1 - 4 + 50);
    for (let x = x0, i = 0; x < W + 30; x += 30, i++) {
      g.fillStyle = i % 2 ? "#f2c64a" : "#c22a36";
      g.beginPath(); g.moveTo(x, TOLDO.y1 - 4); g.lineTo(x + 30, TOLDO.y1 - 4); g.lineTo(x + 30, TOLDO.fald - 14);
      g.arc(x + 15, TOLDO.fald - 14, 15, 0, Math.PI); g.closePath(); g.fill();
      g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    }
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x0, TOLDO.y1 - 4); g.lineTo(W + 40, TOLDO.y1 - 4); g.stroke();
    // cresta del toldo con banderines
    g.fillStyle = "#c22a36"; g.beginPath(); g.moveTo(x0, -6); g.lineTo(x0 + 26, -30); g.lineTo(W + 40, -30); g.lineTo(W + 40, -6); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    // repisa del premio gordo (escuadra en el poste)
    g.fillStyle = "#8a5a2c"; g.fillRect(REPISA.x0, REPISA.y, REPISA.x1 - REPISA.x0, 8);
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(REPISA.x0, REPISA.y, REPISA.x1 - REPISA.x0, 8);
    g.beginPath(); g.moveTo(POSTE.x - 6, REPISA.y + 8); g.lineTo(POSTE.x - 6, REPISA.y + 30); g.lineTo(POSTE.x - 26, REPISA.y + 8);
    g.closePath(); g.fillStyle = "#6a4020"; g.fill(); g.stroke();
    return c;
  }
  function estrella(g, x, y, r, col, lw) {
    g.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = TINTA; g.lineWidth = lw || 2; g.stroke();
  }
  // cesta de pelotas en el mostrador (las que quedan)
  function dibCesta(g, t) {
    const quedan = 3 - (t >= T.gCoge1 + 0.05 ? 1 : 0) - (t >= T.gCoge2 + 0.05 ? 1 : 0);
    const enCesta = [];
    if (t < T.gCoge1 + 0.05) enCesta.push(EN_CESTA[0]);
    if (t < T.gCoge2 + 0.05) enCesta.push(EN_CESTA[1]);
    enCesta.push(EN_CESTA[2]);
    void quedan;
    for (const q of enCesta) dibPelota(g, q.x, q.y, R_BOLA, 0.6);
    const { x, y, w, h } = CESTA;
    g.save(); g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - w / 2, y - h); g.lineTo(x + w / 2, y - h); g.lineTo(x + w / 2 - 5, y); g.lineTo(x - w / 2 + 5, y); g.closePath();
    g.fillStyle = "#c08a44"; g.fill();
    g.save(); g.clip(); g.strokeStyle = "rgba(90,50,15,0.6)"; g.lineWidth = 2;
    for (let i = -6; i < 8; i++) { g.beginPath(); g.moveTo(x - w / 2 + i * 8, y - h); g.lineTo(x - w / 2 + i * 8 + 14, y); g.stroke(); }
    for (let yy = y - h + 6; yy < y; yy += 6) { g.beginPath(); g.moveTo(x - w / 2, yy); g.lineTo(x + w / 2, yy); g.stroke(); }
    g.restore();
    g.strokeStyle = TINTA; g.lineWidth = 2.2; g.stroke();
    g.fillStyle = "#a8743a"; g.fillRect(x - w / 2 - 2, y - h - 3, w + 4, 5); g.strokeRect(x - w / 2 - 2, y - h - 3, w + 4, 5);
    g.restore();
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  function estela(g, pos, t, f, n, col) {
    for (let i = 1; i <= n; i++) {
      const q = f(t - i * 0.022); if (!q) continue;
      g.fillStyle = col.replace("A", (0.32 * (1 - i / (n + 1))).toFixed(3));
      g.beginPath(); g.arc(q.x, q.y, R_BOLA * (1 - i * 0.12), 0, TAU); g.fill();
    }
    void pos;
  }
  function rayitas(g, x, y, ang, n, largo, k, col = "rgba(255,255,255,0.85)") {
    if (k <= 0.01) return;
    g.save(); g.globalAlpha = clamp(k); g.strokeStyle = col; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < n; i++) { const a = ang + (i - (n - 1) / 2) * 0.32, r0 = 10, r1 = 10 + largo;
      g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  function estallido(g, x, y, t, t0, r, col = "#fff3b0") {
    const k = fase(t, t0, t0 + 0.32); if (k <= 0 || k >= 1) return;
    const e = salida(k), a = 1 - k;
    g.save(); g.translate(x, y); g.globalAlpha = a;
    g.beginPath();
    for (let i = 0; i < 16; i++) { const an = i * TAU / 16 + 0.2, rr = (i % 2 ? 0.45 : 1) * r * (0.6 + 0.4 * e); g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
    g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.stroke();
    g.restore();
  }
  function estrellitas(g, c, t, k) {
    if (k <= 0.01) return;
    g.save(); g.globalAlpha = clamp(k);
    for (let i = 0; i < 4; i++) {
      const a = t * 5 + i * TAU / 4, x = c.x + Math.cos(a) * 46, y = c.y + Math.sin(a) * 12;
      g.save(); g.translate(x, y); g.rotate(t * 3 + i);
      estrella(g, 0, 0, 7 + 1.5 * Math.sin(a), "#ffe25a", 1.6);
      g.restore();
    }
    g.restore();
  }
  // la lona se abomba donde da la pelota
  function bultoLona(g, t) {
    const u = t - T.lona; if (u < 0 || u > 0.8) return;
    const k = Math.exp(-u * 5);
    g.save(); g.translate(LONA_P.x + 6, LONA_P.y);
    const r = 26 + 40 * u;
    const rg = g.createRadialGradient(-4, -4, 2, 0, 0, r); rg.addColorStop(0, `rgba(255,255,240,${0.35 * k})`); rg.addColorStop(0.6, `rgba(0,0,0,${0.22 * k})`); rg.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = rg; g.beginPath(); g.ellipse(0, 0, r, r * 1.2, 0, 0, TAU); g.fill();
    g.strokeStyle = `rgba(60,10,20,${0.5 * k})`; g.lineWidth = 2;
    for (let i = 0; i < 3; i++) { const rr = 10 + 60 * u + i * 12; g.beginPath(); g.ellipse(0, 0, rr, rr * 1.2, 0, -1.2, 1.2); g.stroke(); }
    g.restore();
  }
  // lágrimas de risa de Rodri
  function lagrimas(g, t, pR) {
    if ((pR._rie || 0) < 0.3) return;
    const o = R.aPantalla(pR, R.cabeza(pR).a({ x: 700, y: 455 })), o2 = R.aPantalla(pR, R.cabeza(pR).a({ x: 960, y: 500 }));
    g.save(); g.globalAlpha = clamp((pR._rie - 0.3) * 2);
    for (const [q, sg] of [[o, -1], [o2, 1]]) for (let i = 0; i < 2; i++) {
      const u = ((t * 2.6 + i * 0.5 + (sg > 0 ? 0.25 : 0)) % 1);
      const x = q.x + sg * 26 * u, y = q.y - 10 * u + 40 * u * u;
      g.fillStyle = "#9fe0ff"; g.strokeStyle = TINTA; g.lineWidth = 1.2;
      g.beginPath(); g.ellipse(x, y, 2.6, 3.6, 0, 0, TAU); g.fill(); g.stroke();
    }
    g.restore();
  }
  // nubecilla de polvo al caer el peluche
  function ploof(g, t, c) {
    const k = fase(t, T.aterriza, T.aterriza + 0.5); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 0.8 * (1 - k);
    for (let i = 0; i < 7; i++) { const a = Math.PI + i / 6 * Math.PI, r = 30 + 40 * salida(k);
      g.fillStyle = "rgba(255,230,240,0.9)"; g.beginPath(); g.arc(c.x + Math.cos(a) * r * 1.3, c.y + 6 + Math.sin(a) * r * 0.25, 7 * (1 - k * 0.5), 0, TAU); g.fill(); }
    g.restore();
    rayitas(g, c.x, c.y - PEL_ALTO - 4, -Math.PI / 2, 5, 16, 1 - k * 1.4, "rgba(255,240,200,0.95)");
  }
  // el destello del pulgar de Rodri
  function destello(g, x, y, t, t0) {
    const k = campana(t, t0, t0 + 0.45); if (k <= 0) return;
    g.save(); g.translate(x, y); g.rotate(t * 2); g.globalAlpha = k;
    g.fillStyle = "#fffbe0"; g.beginPath();
    for (let i = 0; i < 8; i++) { const a = i * TAU / 8, rr = (i % 2 ? 3 : 13) * k; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    g.closePath(); g.fill(); g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const fin = tramo(t, T.aterriza + 0.5, T.gCamara + 0.4);
    return { k: lerp(0.92, 1.0, fin), x: lerp(512, 476, fin), y: lerp(292, 284, fin) };
  }

  function poses(t) { return { g: poseG(t), r: poseR(t) }; }

  class LasLatas extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !R.listo()) return;
      if (!fondo) { fondo = creaFondo(); frente = creaFrente(); creaLatas(); creaPeluche(); }
      const pR = poseR(t), pG = poseG(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      BASE_M = g.getTransform();
      g.drawImage(fondo, -60, -50);
      bultoLona(g, t);
      dibLatas(g, t);
      // las pelotas que entran en la caseta pasan por detrás del poste y del mostrador
      const vuelan = [pelotaRodri, pelotaG1, pelotaG2].map(f => [f, f(t)]).filter(([, b]) => b);
      const pinta = ([f, b]) => { if (b.estela) estela(g, null, t, f, 4, "rgba(255,255,255,A)"); dibPelota(g, b.x, b.y, R_BOLA, b.giro); };
      const dentroCaseta = ([f, b]) => f !== pelotaG2 && b.x > POSTE.x + (f === pelotaG1 && t > T.lona ? 22 : -8);
      vuelan.filter(dentroCaseta).forEach(pinta);
      g.drawImage(frente, -60, -50);
      dibCesta(g, t);
      const pel = estadoPeluche(t, pG);
      if (pel.capa === "repisa") dibPeluche(g, pel.x, pel.y, pel.ang, pel.sx, pel.sy);
      R.dibujar(g, pR, t);
      if (pR.pelotaSuelta) dibPelota(g, pR.pelotaSuelta.x, pR.pelotaSuelta.y, R_BOLA, pR.pelotaSuelta.giro);
      G.dibujar(g, pG, t);
      if (pel.capa !== "repisa") dibPeluche(g, pel.x, pel.y, pel.ang, pel.sx, pel.sy);
      vuelan.filter(v => !dentroCaseta(v)).forEach(pinta);
      // efectos
      const cab = G.aPantalla(pG, G.cabeza(pG).a({ x: 780, y: 330 }));
      rayitas(g, cab.x - 10, cab.y - 30, -Math.PI / 2 - 0.3, 4, 16, campana(t, T.gAgacha + 0.05, T.gAgacha + 0.45));
      estallido(g, BLANCO_R.x, BLANCO_R.y, t, T.impacto, 40);
      estallido(g, LONA_P.x, LONA_P.y, t, T.lona, 22, "#ffffff");
      const fr = salidas().frente;
      estallido(g, fr.x + 6, fr.y - 4, t, T.frente, 30);
      estrellitas(g, G.aPantalla(pG, G.cabeza(pG).a({ x: 780, y: 300 })), t, dentro(t, T.frente + 0.05, T.frente + 0.2, T.gDespeja - 0.3, T.gDespeja));
      estallido(g, PEL_CIMA.x, PEL_CIMA.y + 4, t, T.golpePeluche, 20);
      if (pel.capa === "cabeza") ploof(g, t, pel);
      lagrimas(g, t, pR);
      if (t > T.rPulgar) { const m = R.aPantalla(pR, { x: pR.manoLejos.x, y: pR.manoLejos.y }); destello(g, m.x + 4, m.y - 22, t, T.rPulgar + 0.25); }
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }

  registrar({ id: "00117", nombre: "Guillermo y Rodri · Las latas", crear: () => new LasLatas() });
  function diag(t) {
    const out = {};
    for (const [n, Rg, p] of [["g", G, poseG(t)], ["r", R, poseR(t)]]) for (const lado of ["cerca", "lejos"]) {
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m) continue;
      const Tr = Rg.tronco(p), h = Tr(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO), mu = m.mu ?? -1.75;
      const w = { x: m.x + Math.cos(mu) * Rg.MUNECA_R * Rg.JK, y: m.y + Math.sin(mu) * Rg.MUNECA_R * Rg.JK };
      out[n + lado] = +(Math.hypot(w.x - h.x, w.y - h.y) / (lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L)).toFixed(3);
    }
    return out;
  }
  const info = t => { const pg = poseG(t), pr = poseR(t);
    const r2 = q => ({ x: Math.round(q.x), y: Math.round(q.y) });
    return { gHomC: r2(hombroP(G, pg, "cerca")), gHomL: r2(hombroP(G, pg, "lejos")), rHomC: r2(hombroP(R, pr, "cerca")), rHomL: r2(hombroP(R, pr, "lejos")),
      gCab: r2(G.aPantalla(pg, G.cabeza(pg).a({ x: 800, y: 190 }))), gFrente: r2(G.aPantalla(pg, G.cabeza(pg).a({ x: 790, y: 452 }))),
      ancla: r2(anclaCabeza(pg)), gPel: r2(G.aPantalla(pg, pg.pelvis)), rPel: r2(R.aPantalla(pr, pr.pelvis)) }; };
  window.__A2D_00117 = { pose: poses, poseG, poseR, T, DUR, diag, info, salidas: () => salidas(),
    guiones: { GUION_CARA_R, GUION_CUERPO_R, GUION_CARA_G, GUION_CUERPO_G } };
})();
