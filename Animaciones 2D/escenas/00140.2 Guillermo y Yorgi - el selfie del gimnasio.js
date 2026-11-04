"use strict";
/* 00140.2 · Guillermo y Yorgi · El selfie del gimnasio
 *
 * Negro → un gimnasio luminoso: pared gris claro con una franja naranja y el zócalo verde petróleo,
 * barras de LED colgadas del techo, carteles solo con iconos (rayo, brazo, mancuerna), un reloj sin
 * números, un árbol de discos de colores, dos kettlebells, un banco plano, cajones de salto y suelo
 * de caucho negro con motas. A la derecha, toda la pared es un espejo (en perspectiva, con juntas y
 * brillos): en él se ve la sala reflejada y a los dos, más pequeños y mirando hacia nosotros.
 *
 * Yorgi, delante del espejo, se hace un selfie: móvil en alto hacia el espejo, saca bíceps con el
 * otro brazo (dos «bombeos» y ¡ting!), ceja levantada, morritos, se echa un pelín atrás para el
 * ángulo. De la izquierda entra Guillermo de un salto, aterriza a su lado y saca bíceps él también
 * (puño en la cadera); el brazo le tiembla, mira el bíceps de Yorgi, mira el suyo… y decide hinchar
 * el pecho: coge aire, mofletes hinchados, cara roja, todo tiembla. Yorgi le mira de reojo, aguanta la
 * risa y dispara. Guillermo pone cara de orgullo; la costura del hombro cede (un rasgoncito), la manga
 * aletea y… ¡FLASH! — la manga sale disparada como un corcho, dando vueltas. Guillermo nota el aire,
 * se mira el hombro: brazo blanquísimo con la marca del moreno. La manga cae al suelo (¡plof!). Yorgi
 * mira la foto en el móvil y se parte de risa (mano en la barriga). Guillermo se encoge de hombros,
 * vuelve a sacar bíceps con el brazo pálido, más orgulloso que nunca (¡ting!). Yorgi mira la foto otra
 * vez → la escena se oscurece y aparece la foto (la del espejo, con su borde blanco, torcida y con
 * sombra): los dos sacando bíceps, el destello del flash en el móvil y la manga volando → negro.
 *
 * Todo depende de `t` (determinista). El reflejo es el mismo mundo (sala, muñecos, manga, efectos)
 * dibujado con una transformación de espejo (x' = AX − CR·x, y' = AY + CR·y) recortada al cristal;
 * en el reflejo el móvil enseña su espalda (cámara y flash). La manga: desde el rasgón el brazo cercano
 * de Guillermo se dibuja con una copia del atlas en la que la manga está pintada como piel pálida
 * (marca del moreno incluida) y encima, con la misma transformación que la rodaja del brazo, la manga
 * original recortada por el dobladillo; así el cambio no se nota. Luego la manga gira sobre la costura
 * de abajo, resbala y sale volando (vuelo simulado una vez con paso fijo de 1/240 s). La foto es el
 * reflejo en el instante del flash, pintado una sola vez en un lienzo aparte.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, ruido, hash, mezcla } = M2;
  const G = Guillermo, Yo = Yorgi, R = Recortes;
  const DUR = 14.3;
  const TAU = Math.PI * 2, TINTA = "#0b0a0e";
  const P = (x, y) => ({ x, y });

  /* ---------- guion (s) ---------- */
  const T = {
    // A · Yorgi se hace el selfie
    ajusta0: 0.45, ajusta1: 0.95, flexY0: 0.95, flexY1: 1.4, bombeo1: 1.55, bombeo2: 1.9, tingY: 1.72,
    ceja: 2.25, inclina0: 2.55, inclina1: 3.0,
    // B · entra Guillermo de un salto
    salto0: 3.02, aterriza: 3.52, caderaG0: 3.56, caderaG1: 3.88,
    miraY0: 3.6, miraY1: 3.78, vuelveY: 4.3,
    tiembla0: 3.9, miraBicY: 4.45, miraBrazo: 4.95, decide: 5.3,
    // C · hincha el pecho
    infla0: 5.45, infla1: 6.0, orgullo: 6.04,
    yOjo: 5.5, yAguanta: 5.72, yApunta: 5.98, yDispara: 5.96,
    // D · rasgón y flash
    rasgon: 6.12, suelta: 6.33, foto: 6.44, flashSube: 6.24, flashBaja0: 6.48, flashBaja1: 7.0,
    // E · después
    brisa: 6.95, hombro0: 7.05, hombro1: 7.3, sueloG: 7.46, brazoG: 8.1,
    encoge0: 8.42, encoge1: 8.82, reflex0: 8.95, reflex1: 9.3, tingG: 9.5,
    yVe: 6.58, yRie0: 6.86, yMovil0: 9.95, yMovil1: 10.4,
    // F · la foto
    oscurece0: 10.45, foto0: 10.62, foto1: 11.4, brillo0: 11.75, brillo1: 12.55, fin0: 13.55
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const rota = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const parpadeo = (t, lista, d = 0.15) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const DD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const PUNO = D(0.12, 0.04), AGARRA = D(0.55, 0.36, 0.34, 0.33, 0.32), ABIERTA = D(0.9, 0.95, 0.95, 0.92, 0.88),
    FLOJA = D(0.5, 0.55, 0.5, 0.48, 0.45), BOLS = D(0.4, 0.4);

  /* ---------- caras (mismos campos para los dos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15,
    lengua: 0, mof: 0, rub: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: 0,
      ojos: { d: clamp(Math.max(e.c, parp)), i: clamp(Math.max(e.c, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* =====================================================================================
   * DISPOSICIÓN (px de pantalla, antes de la cámara)
   * ===================================================================================== */
  const S = 0.30, SUELO_Y = 566, SUELO_G = 572, XY = 458, XG = 222;
  const MURO = 480, ESQ = 606;                              // pared del fondo con el suelo · esquina del espejo
  const CR = 0.72, AX = 1066, AY = 92;                      // reflejo: x' = AX − CR·x, y' = AY + CR·y
  const refl = q => P(AX - CR * q.x, AY + CR * q.y);
  const VIDRIO = [P(617, 40), P(1024, -26), P(1024, 604), P(617, 471)];
  const PARED_ESP = [P(ESQ, 26), P(1030, -46), P(1030, 640), P(ESQ, MURO)];
  // sala para el reflejo (coordenadas lógicas)
  const SALA = { x: -40, y: -240, w: 760, h: 960, rs: 0.75 };

  /* =====================================================================================
   * MANOS: estados en el marco del torso (hoja); mu hacia el codo
   * ===================================================================================== */
  const M = (x, y, mu, dedos, dobla, pu = 1) => ({ x, y, mu, dedos, dobla, pu });
  function pistaMano(lista, t) {
    let c = lista[0][2];
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, d, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1));
      c = { x: lerp(c.x, d.x, k), y: lerp(c.y, d.y, k), mu: lerp(c.mu, d.mu, k), dedos: DD(c.dedos, d.dedos, k),
        dobla: k < 0.5 ? c.dobla : d.dobla, pu: lerp(c.pu, d.pu, k) };
    }
    return Object.assign({}, c, { dedos: Object.assign({}, c.dedos) });
  }
  function aMano(Rg, p, e, dx = 0, dy = 0) {
    const q = Rg.tronco(p)(P(e.x + dx, e.y + dy));
    return { x: q.x, y: q.y, ang: 0, mu: e.mu + p.torso, dobla: e.dobla, puno: e.pu, dedos: e.dedos };
  }
  // curva del brazo tal como la dibuja el muñeco (para la manga, el bíceps…)
  function cadena(Rg, p, lado) {
    const cerca = lado === "cerca", m = cerca ? p.manoCerca : p.manoLejos;
    const h = Rg.tronco(p)(cerca ? Rg.HOMBRO_C : Rg.HOMBRO);
    const pz = Rg.A.datos.piezas[cerca ? "brazo_cerca" : "brazo"];
    const L = cerca ? Rg.BRAZO_C_L : Rg.BRAZO_L;
    const sj = cerca ? pz.codo : (Rg === G ? L * 0.5 : pz.codo);
    const mu = m.mu ?? -1.75, o = rota(P(Math.cos(mu) * Rg.MUNECA_R * Rg.JK, Math.sin(mu) * Rg.MUNECA_R * Rg.JK), m.ang || 0);
    const c = R.ik(h, P(m.x + o.x, m.y + o.y), L, sj, 42, m.dobla ?? -1, 1.08);
    c.grosor = m.grosor || 1;
    return c;
  }
  const hojaAPant = (Rg, p, q) => Rg.aPantalla(p, q);

  /* =====================================================================================
   * EL MÓVIL (en el marco de la mano: unidades de mano, rotado solo por mano.ang)
   * ===================================================================================== */
  let REFLEJO = false, FLASH_LED = 0;
  const giraMovil = t => tramo(t, T.yVe, T.yVe + 0.34);
  const BOTON = P(2.4913, -1.5697);
  const LED = P(4.8, -24), LED_LADO = P(13.5, -24);
  function movil(g, t) {
    const giro = giraMovil(t);
    g.save(); g.translate(6, 0); g.lineJoin = "round";
    if (REFLEJO) {
      // El espejo enseña el dorso al girar la pantalla hacia Yorgi.
      g.scale(1 - 0.40 * giro, 1);
      // espalda: carcasa, módulo de cámaras y flash
      g.fillStyle = "#2c3140"; g.strokeStyle = TINTA; g.lineWidth = 1.6;
      g.beginPath(); g.roundRect(-13, -40, 26, 54, 5); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.12)"; g.beginPath(); g.roundRect(-11, -38, 6, 50, 3); g.fill();
      g.fillStyle = "#14161c"; g.beginPath(); g.roundRect(-10.5, -37.5, 13, 16, 3.6); g.fill();
      for (const [x, y] of [[-7, -33.4], [-7, -26], [-1.2, -29.7]]) {
        g.fillStyle = "#4c5262"; g.beginPath(); g.arc(x, y, 2.7, 0, TAU); g.fill();
        g.fillStyle = "#07080b"; g.beginPath(); g.arc(x, y, 1.6, 0, TAU); g.fill();
        g.fillStyle = "rgba(160,190,255,0.7)"; g.beginPath(); g.arc(x - 0.6, y - 0.6, 0.5, 0, TAU); g.fill();
      }
      g.fillStyle = FLASH_LED > 0.05 ? "#ffffff" : "#efe6c4"; g.beginPath(); g.arc(-1.2, -24, 1.4, 0, TAU); g.fill();
    } else {
      // de canto: la espalda casi de perfil y un filo de pantalla encendida hacia Yorgi
      g.fillStyle = "#2c3140"; g.strokeStyle = TINTA; g.lineWidth = 1.6;
      g.beginPath(); g.roundRect(-3, -40, 11, 54, 3); g.fill(); g.stroke();
      g.fillStyle = "#9fd8ff"; g.beginPath(); g.roundRect(-6, -38.5, 3.6, 51, 1.6); g.fill();
      g.strokeStyle = TINTA; g.lineWidth = 1.1; g.stroke();
      g.fillStyle = "#14161c"; g.beginPath(); g.roundRect(6.4, -37, 3.6, 14, 1.4); g.fill();
      g.fillStyle = FLASH_LED > 0.05 ? "#fff" : "#efe6c4";
      g.beginPath(); g.arc(7.5, -24, 1.15, 0, TAU); g.fill();
      if (giro > 0 && FOTO) {
        const w = 3.6 + 23 * giro;
        g.fillStyle = "#232936"; g.beginPath(); g.roundRect(-3.5 - w, -40, w + 2, 54, 3); g.fill(); g.stroke();
        g.fillStyle = "#121924"; g.fillRect(-3 - w, -37.5, w, 47);
        const alto = w * RECORTE.h / RECORTE.w;
        g.drawImage(FOTO, -3 - w, -16 - alto / 2, w, alto);
      }
      g.fillStyle = t >= T.yDispara + .07 && t < T.foto ? "#d8ffc2" : "#cdd3dc";
      g.beginPath(); g.roundRect(BOTON.x - 7.5, BOTON.y - 2.7, 3, 5.4, 1.2); g.fill();
      g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(0, -38, 2, 50);
    }
    g.restore();
  }
  // punto del móvil (unidades de mano) → pantalla
  function puntoMovil(p, q) {
    const m = p.manoLejos, o = rota(P(q.x * Yo.JK, q.y * Yo.JK), m.ang || 0);
    return Yo.aPantalla(p, P(m.x + o.x, m.y + o.y));
  }

  /* =====================================================================================
   * YORGI (delante del espejo; mira a la derecha)
   * ===================================================================================== */
  const TOB_Y = Yo.SUELO - 82.05; // borde inferior opaco
  const CUERPOS_Y = {
    inicio: { pel: 0, torso: 0.0, cab: -0.04, px: 0, ex: 1 },
    ajusta: { pel: -2, torso: -0.02, cab: -0.07, px: 0, ex: 1 },
    flex: { pel: -6, torso: -0.04, cab: -0.1, px: -2, ex: 1.03 },
    atras: { pel: -2, torso: -0.085, cab: -0.14, px: -6, ex: 1.03 },
    mira: { pel: -4, torso: -0.06, cab: -0.02, px: -4, ex: 1.03 },
    dispara: { pel: -4, torso: -0.07, cab: -0.12, px: -4, ex: 1.03 },
    ve: { pel: 0, torso: 0.02, cab: 0.08, px: 2, ex: 1 },
    rie: { pel: 6, torso: 0.1, cab: -0.2, px: 6, ex: 1 },
    mira2: { pel: 4, torso: 0.04, cab: -0.04, px: 2, ex: 1 },
    movil: { pel: 0, torso: 0.03, cab: 0.1, px: 2, ex: 1 }
  };
  const GUION_CUERPO_Y = [
    [T.ajusta0, T.ajusta1, "ajusta"], [T.flexY0, T.flexY1, "flex", salida], [T.inclina0, T.inclina1, "atras"],
    [T.miraY0, T.miraY1, "mira"], [T.vuelveY, T.vuelveY + 0.3, "atras"], [T.yOjo, T.yOjo + 0.2, "mira"],
    [T.yApunta, T.yApunta + 0.2, "dispara"], [T.yVe, T.yVe + 0.2, "ve"], [T.yRie0, T.yRie0 + 0.25, "rie", salida],
    [8.9, 9.2, "mira2"], [T.yMovil0, T.yMovil1, "movil"]
  ];
  const CARAS_Y = {
    pose: E({ mx: 0.92, my: 0.3, sd: 8, si: 10, sonr: 0.45, ancho: 0.95 }),
    chulo: E({ mx: 0.92, my: 0.28, c: 0.3, sd: 26, gd: 0.1, si: 2, gi: -0.08, sonr: 0.62, ancho: 0.9 }),
    morros: E({ mx: 0.92, my: 0.26, c: 0.42, sd: 22, gd: 0.08, si: 0, gi: -0.06, abre: 0, ancho: 0.52, sonr: -0.05 }),
    mira: E({ mx: -0.92, my: 0.05, sd: 24, gd: 0.06, si: 24, sonr: 0.2, ancho: 0.85 }),
    sonrie: E({ mx: 0.92, my: 0.3, c: 0.25, sd: 14, si: 10, sonr: 0.7, ancho: 1.0 }),
    aguanta: E({ mx: -0.85, my: 0.1, c: 0.45, sd: 18, si: 14, sonr: 0.75, ancho: 0.62, mof: 0.6 }),
    dispara: E({ mx: 0.92, my: 0.3, c: 0.32, sd: 24, gd: 0.08, si: 4, gi: -0.06, sonr: 0.6, ancho: 0.9 }),
    ve: E({ mx: 0.92, my: 0.38, iris: 1.12, sd: 26, si: 28, abre: 10, ancho: 0.62, sonr: 0.3 }),
    rie: E({ mx: 0, my: 0, c: 1, h: 1, sd: 16, si: 18, abre: 30, ancho: 1.15, sonr: 1, rub: 0.5 }),
    rie2: E({ mx: -0.8, my: 0.05, c: 0.62, h: 0.8, sd: 18, si: 18, abre: 20, ancho: 1.1, sonr: 1, rub: 0.4 }),
    movil: E({ mx: 0.9, my: 0.4, c: 0.35, h: 0.4, sd: 16, si: 16, abre: 10, ancho: 1.05, sonr: 0.95, rub: 0.3 })
  };
  const GUION_CARA_Y = [
    [T.flexY0 + 0.1, T.flexY0 + 0.3, "chulo"], [T.ceja, T.ceja + 0.2, "morros"], [T.miraY0, T.miraY0 + 0.12, "mira"],
    [T.vuelveY, T.vuelveY + 0.2, "sonrie"], [T.yOjo, T.yOjo + 0.12, "mira"], [T.yAguanta, T.yAguanta + 0.15, "aguanta"],
    [T.yApunta, T.yApunta + 0.15, "dispara"], [T.yVe, T.yVe + 0.12, "ve"], [T.yRie0, T.yRie0 + 0.14, "rie", salida],
    [8.9, 9.1, "rie2"], [T.yMovil0, T.yMovil0 + 0.3, "movil"]
  ];
  // manos de Yorgi (marco del torso)
  const Y_CUELGA = M(58, 734, -1.66, FLOJA, 1);
  const Y_CUELGA_B = Object.assign({}, Y_CUELGA, { dobla: -1 });
  const Y_FLEX = M(-84, 146, 1.74, PUNO, 1);
  const Y_BARRIGA = M(230, 582, -2.5, D(0.7, 0.8, 0.82, 0.8, 0.75), -1);
  const Y_MOVIL = M(688, 318, 3.3, AGARRA, -1);
  const Y_MOVIL_ALTO = M(694, 300, 3.32, AGARRA, -1);
  const Y_MOVIL_BAJO = M(590, 470, 2.75, AGARRA, -1);
  const Y_MOVIL_VE = M(640, 330, 3.05, AGARRA, -1);
  const PISTA_YC = [
    [0, 0, Y_CUELGA], [T.flexY0, T.flexY1, Y_FLEX, salida],
    [6.6, 6.84, Y_CUELGA], [6.84, 6.84, Y_CUELGA_B], [6.86, 7.14, Y_BARRIGA, salida]
  ];
  const PISTA_YL = [
    [0, 0, Y_MOVIL], [T.ajusta0, T.ajusta1, Y_MOVIL_ALTO], [T.inclina0, T.inclina1, Y_MOVIL],
    [T.yVe - 0.1, T.yVe + 0.15, Y_MOVIL_VE], [T.yRie0 + 0.1, T.yRie0 + 0.45, Y_MOVIL_BAJO], [T.yMovil0, T.yMovil1, Y_MOVIL_VE]
  ];
  const parpY = t => parpadeo(t, [0.9, 2.05, 3.35, 4.9, 6.06, 8.6, 9.7, 11.0]);
  // risa: botes del cuerpo
  const risaY = t => dentro(t, T.yRie0, T.yRie0 + 0.15, 10.2, 10.6);

  const cacheY = new Map();
  function poseY(t) { const k = t.toFixed(5); if (cacheY.has(k)) return cacheY.get(k); if (cacheY.size > 16) cacheY.clear(); const p = poseY0(t); cacheY.set(k, p); return p; }
  function poseY0(t) {
    const b = guion(GUION_CUERPO_Y, CUERPOS_Y, "inicio", t);
    const resp = Math.sin(t * 2.2 + 1.1), ri = risaY(t), rb = Math.sin((t - T.yRie0) * 17);
    const p = {
      x: XY, suelo: SUELO_Y, s: S, tirasLimpias: true, espejo: false, piernas: {},
      pelvis: { x: Yo.PELVIS.x + b.px, y: Yo.PELVIS.y + b.pel + resp * 1.4 + ri * (4 + 5 * rb) },
      torso: b.torso + ri * 0.035 * rb, torsoEsc: { x: b.ex, y: 1 + resp * 0.006 + ri * 0.012 * rb },
      cabeza: { ang: b.cab + ri * 0.05 * Math.sin((t - T.yRie0) * 17 + 0.8), dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // bombeos del bíceps: la cabeza acompaña
    const bo = campana(t, T.bombeo1, T.bombeo1 + 0.24) + campana(t, T.bombeo2, T.bombeo2 + 0.24);
    p.cabeza.ang -= 0.03 * bo;
    // aguanta la risa: hombros que tiemblan
    const ag = dentro(t, T.yAguanta, T.yAguanta + 0.1, T.yApunta, T.yApunta + 0.1);
    p.pelvis.y += 1.6 * ag * Math.sin(t * 38); p.cabeza.ang += 0.012 * ag * Math.sin(t * 38 + 1);
    // pies: el cercano un poco adelantado, cadera ladeada
    const hx = d => Yo.PELVIS.x + d / S;
    p.piernas.cerca = { tob: { x: hx(-30), y: TOB_Y }, ang: 0 };
    p.piernas.lejos = { tob: { x: hx(30), y: TOB_Y - 6 / S }, ang: 0 };
    // manos
    const ec = pistaMano(PISTA_YC, t), el = pistaMano(PISTA_YL, t);
    const bomb = campana(t, T.bombeo1, T.bombeo1 + 0.24) + campana(t, T.bombeo2, T.bombeo2 + 0.24);
    let cdy = -14 * bomb;
    // en la risa la mano de la barriga sube y baja con los botes
    cdy += ri * 6 * rb * (1 - tramo(t, 6.86, 7.14));
    p.manoCerca = aMano(Yo, p, ec, 0, cdy);
    p.manoCerca.dobla = 1 - 2 * tramo(t, 6.80, 6.88);
    p.manoCerca.dedos = Object.assign({}, p.manoCerca.dedos);
    if (bomb > 0) { p.manoCerca.mu += 0.08 * bomb; }
    const ld = ri * 5 * Math.sin((t - T.yRie0) * 17 + 0.4);
    p.manoLejos = aMano(Yo, p, el, 0, ld);
    p.manoLejos.ang = -0.10 * giraMovil(t);
    p.manoLejos.objeto = movil;
    // pulgar: dispara
    const tap = campana(t, T.yDispara, T.yDispara + 0.14);
    p.manoLejos.dedos.pulgar = lerp(p.manoLejos.dedos.pulgar, 0.15, tap);
    // cara
    const ex = guion(GUION_CARA_Y, CARAS_Y, "pose", t);
    if (ri > 0) { ex.abre += 6 * ri * Math.sin((t - T.yRie0) * 17); }
    p.cara = cara(ex, parpY(t));
    return p;
  }

  /* =====================================================================================
   * GUILLERMO (entra de un salto por la izquierda; mira a la derecha)
   * ===================================================================================== */
  const TOB_G = G.SUELO - 93;
  const G_FLEX = M(-96, 182, 1.7, PUNO, 1);
  const G_FLEX_ALTO = M(-88, 160, 1.62, PUNO, 1);
  const G_CADERA = M(354, 667, -0.95, PUNO, 1);
  const G_ARRIBA = M(572, 150, 1.85, PUNO, -1);
  const PISTA_GC = [[0, 0, G_FLEX_ALTO], [T.aterriza, T.aterriza + 0.3, G_FLEX], [T.reflex0, T.reflex1, G_FLEX_ALTO, salida]];
  const G_LADO = M(560, 625, -2.21, PUNO, -1), G_LADO_B = Object.assign({}, G_LADO, { dobla: 1 });
  const PISTA_GL = [[0, 0, G_ARRIBA], [T.caderaG0, T.caderaG0 + 0.16, G_LADO, entrada], [T.caderaG0 + 0.16, T.caderaG0 + 0.16, G_LADO_B], [T.caderaG0 + 0.16, T.caderaG1, G_CADERA, salida]];
  const CUERPOS_G = {
    salto: { torso: -0.06, cab: -0.12, px: 0 },
    flex: { torso: 0.0, cab: 0.0, px: 0 },
    mira: { torso: 0.01, cab: 0.04, px: 2 },
    brazo: { torso: -0.02, cab: -0.12, px: 0 },
    decide: { torso: 0.03, cab: 0.06, px: 2 },
    infla: { torso: -0.07, cab: -0.12, px: -4 },
    orgullo: { torso: -0.08, cab: -0.16, px: -4 },
    hombro: { torso: -0.02, cab: -0.2, px: 0 },
    suelo: { torso: 0.06, cab: 0.04, px: 4 },
    piensa: { torso: 0.0, cab: -0.14, px: 0 },
    encoge: { torso: 0.0, cab: 0.04, px: 0 },
    orgullo2: { torso: -0.07, cab: -0.15, px: -4 }
  };
  const GUION_CUERPO_G = [
    [T.aterriza, T.aterriza + 0.25, "flex"], [T.miraBicY, T.miraBicY + 0.2, "mira"], [T.miraBrazo, T.miraBrazo + 0.22, "brazo"],
    [T.decide, T.decide + 0.18, "decide"], [T.infla0, T.infla1, "infla"], [T.orgullo, T.orgullo + 0.12, "orgullo", salida],
    [T.hombro0, T.hombro1, "hombro"], [T.sueloG, T.sueloG + 0.25, "suelo"], [T.brazoG, T.brazoG + 0.25, "piensa"],
    [T.encoge0, T.encoge0 + 0.2, "encoge"], [T.reflex0, T.reflex1, "orgullo2", salida]
  ];
  const CARAS_G = {
    salto: E({ mx: 0.92, my: 0.05, sd: 26, si: 28, abre: 24, ancho: 1.12, sonr: 1.0 }),
    esfuerzo: E({ mx: 0.85, my: 0, c: 0.6, z: 0.75, sd: -6, gd: -0.14, si: -4, gi: -0.14, abre: 7, ancho: 1.18, sonr: -0.35, rub: 0.3 }),
    mira: E({ mx: 0.95, my: -0.3, iris: 1.12, sd: 22, si: 24, abre: 10, ancho: 0.58, sonr: 0.0 }),
    brazo: E({ mx: -0.9, my: -0.45, sd: 8, gd: 0.06, si: 14, gi: 0.06, abre: 0, ancho: 0.8, sonr: -0.2 }),
    decide: E({ mx: 0.9, my: 0.05, sd: -10, gd: -0.22, si: -8, gi: -0.22, abre: 0, ancho: 0.8, sonr: 0.1 }),
    infla: E({ mx: 0.85, my: -0.05, iris: 1.12, c: 0.2, sd: 16, si: 18, abre: 0, ancho: 0.5, sonr: 0.0, mof: 1, rub: 0.6 }),
    orgullo: E({ mx: 0.9, my: -0.05, c: 0.62, h: 0.2, sd: 16, si: 18, abre: 0, ancho: 1.06, sonr: 0.9, mof: 0.15, rub: 0.25 }),
    brisa: E({ mx: 0.4, my: -0.1, iris: 1.05, sd: 22, si: 24, abre: 4, ancho: 0.7, sonr: 0.1 }),
    hombro: E({ mx: -0.95, my: 0.3, iris: 1.16, sd: 30, si: 32, abre: 20, ancho: 0.52, sonr: -0.25 }),
    suelo: E({ mx: -0.85, my: 0.9, iris: 1.1, sd: 26, si: 28, abre: 12, ancho: 0.6, sonr: -0.3 }),
    piensa: E({ mx: -0.92, my: -0.2, c: 0.3, sd: 2, gd: -0.12, si: 18, gi: 0.12, abre: 0, ancho: 0.72, sonr: -0.12 }),
    encoge: E({ mx: 0.7, my: 0, c: 0.38, sd: 22, si: 22, abre: 0, ancho: 0.95, sonr: 0.45 }),
    orgullo2: E({ mx: 0.9, my: -0.08, c: 0.55, h: 0.25, sd: 18, si: 20, abre: 5, ancho: 1.12, sonr: 1.0, rub: 0.2 })
  };
  const GUION_CARA_G = [
    [T.aterriza + 0.05, T.aterriza + 0.25, "esfuerzo"], [T.miraBicY, T.miraBicY + 0.12, "mira"], [T.miraBrazo, T.miraBrazo + 0.15, "brazo"],
    [T.decide, T.decide + 0.12, "decide"], [T.infla0, T.infla0 + 0.3, "infla"], [T.orgullo, T.orgullo + 0.1, "orgullo", salida],
    [T.brisa, T.brisa + 0.1, "brisa"], [T.hombro0, T.hombro0 + 0.12, "hombro", salida], [T.sueloG, T.sueloG + 0.15, "suelo"],
    [T.brazoG, T.brazoG + 0.18, "piensa"], [T.encoge0, T.encoge0 + 0.18, "encoge"], [T.reflex0, T.reflex0 + 0.2, "orgullo2"]
  ];
  const parpG = t => parpadeo(t, [3.98, 4.75, 5.22, 7.82, 8.66, 10.1, 11.0]);
  // salto: x, altura (px) y recogido de piernas
  function saltoG(t) {
    const u = fase(t, T.salto0, T.aterriza);
    const xa = -160, xb = XG;
    let x = lerp(xa, xb, u), h = 4 * 95 * u * (1 - u), rec = Math.sin(Math.PI * Math.min(1, u * 1.15));
    if (t >= T.aterriza) { x = xb; h = 0; rec = 0; }
    if (t < T.salto0) { x = xa; h = 0; rec = 0.3; }
    // aplastón al aterrizar y rebote
    const v = t - T.aterriza;
    let sq = 0;
    if (v > 0) sq = v < 0.07 ? 62 * salida(v / 0.07) : 62 * (1 - suave((v - 0.07) / 0.2)) - 14 * campana(t, T.aterriza + 0.2, T.aterriza + 0.42);
    return { x, h, rec, sq };
  }
  // esfuerzo: temblor del brazo flexionado
  const tiembla = t => dentro(t, T.tiembla0, T.tiembla0 + 0.2, T.rasgon + 0.1, T.rasgon + 0.4) * (1 + 1.4 * tramo(t, T.infla0, T.infla1)) * (1 - 0.6 * tramo(t, T.orgullo, T.orgullo + 0.1));
  const infla = t => tramo(t, T.infla0, T.infla1) * (1 - tramo(t, T.brisa + 0.15, T.hombro1 + 0.3));

  const cacheG = new Map();
  function poseG(t) { const k = t.toFixed(5); if (cacheG.has(k)) return cacheG.get(k); if (cacheG.size > 16) cacheG.clear(); const p = poseG0(t); cacheG.set(k, p); return p; }
  function poseG0(t) {
    const sg = saltoG(t), b = guion(GUION_CUERPO_G, CUERPOS_G, "salto", t);
    const resp = Math.sin(t * 2.4 + 0.3), inf = infla(t), tb = tiembla(t);
    const enc = campana(t, T.encoge0, T.encoge1);
    const p = {
      x: sg.x, suelo: SUELO_G - sg.h, s: S, tirasLimpias: true, ikContinuo: false, hombrosContinuos: true, hombrosRecortados: true,
      espejo: false, piernas: {}, visible: sg.x > -140,
      pelvis: { x: G.PELVIS.x + b.px - 13 * tramo(t, T.salto0, T.aterriza) * (1 - tramo(t, T.aterriza, T.aterriza + 0.22)) / S, y: G.PELVIS.y + sg.sq + resp * 1.3 - 8 * enc },
      torso: b.torso + 0.008 * tb * ruido(t * 21 + 3), torsoEsc: { x: 1 + 0.1 * inf, y: 1 + 0.025 * inf + resp * 0.006 + 0.03 * enc },
      cabeza: { ang: b.cab + 0.015 * tb * ruido(t * 23 + 9), dx: 0, dy: 6 * enc, esc: { x: 1, y: 1 } },
      rojo: 0.42 * dentro(t, T.infla0 + 0.2, T.infla1, T.orgullo, T.orgullo + 0.25),
      sudor: 0.6 * dentro(t, T.tiembla0 + 0.4, T.tiembla0 + 0.8, T.orgullo, T.orgullo + 0.3)
    };
    // pies: en el aire recogidos
    const hx = d => G.PELVIS.x + d / S;
    p.piernas.cerca = { tob: { x: hx(-26 + 22 * sg.rec), y: TOB_G - 150 * sg.rec }, ang: -0.35 * sg.rec };
    p.piernas.lejos = { tob: { x: hx(28 + 6 * sg.rec), y: TOB_G - 6 / S - 95 * sg.rec }, ang: -0.2 * sg.rec };
    // manos
    const ec = pistaMano(PISTA_GC, t), el = pistaMano(PISTA_GL, t);
    const a = 7 * tb, n1 = ruido(t * 31), n2 = ruido(t * 29 + 5);
    const pump = campana(t, T.reflex1 - 0.02, T.reflex1 + 0.22) + campana(t, T.tingG + 0.25, T.tingG + 0.5);
    p.manoCerca = aMano(G, p, ec, a * n1, a * n2 - 12 * pump - 10 * enc);
    p.manoLejos = aMano(G, p, el);
    p.manoLejos.dobla = -1 + 2 * tramo(t, T.caderaG0 + 0.12, T.caderaG0 + 0.20);
    // cara
    const ex = guion(GUION_CARA_G, CARAS_G, "salto", t);
    p.cara = cara(ex, parpG(t));
    return p;
  }

  /* =====================================================================================
   * LA MANGA (atlas con el brazo desnudo, la manga suelta y su vuelo)
   * ===================================================================================== */
  const BC = G.A.datos.piezas.brazo_cerca;
  const DOBLADILLO = [[0, 66.5], [5, 64.6], [10, 62.7], [20, 62.9], [28, 63.7], [34, 64.7], [39, 65.7], [44, 67.3], [52, 68.2]];
  const FILAS_MANGA = 72;
  let DESNUDO = null, MANGA = null;
  function rutaDobladillo(g, abajo) {
    const [, , mw] = BC.marco, hm = DOBLADILLO;
    g.beginPath(); g.moveTo(-2, abajo ? 200 : -4); g.lineTo(mw + 2, abajo ? 200 : -4); g.lineTo(mw + 2, hm[hm.length - 1][1]);
    for (let i = hm.length - 1; i >= 0; i--) g.lineTo(hm[i][0], hm[i][1]);
    g.lineTo(-2, hm[0][1]); g.closePath();
  }
  function preparaManga() {
    const im = G.A.imgs[1], [mx, my, mw] = BC.marco;
    // 1 · copia del atlas con el brazo cercano sin manga (piel pálida y marca del moreno)
    const c = document.createElement("canvas"); c.width = im.naturalWidth; c.height = im.naturalHeight;
    const g = c.getContext("2d"); g.drawImage(im, 0, 0);
    g.save(); g.translate(mx, my); g.beginPath(); g.rect(0, 0, mw, 90); g.clip();
    g.globalCompositeOperation = "destination-out"; rutaDobladillo(g, false); g.fill();
    g.globalCompositeOperation = "source-over";
    const izq = [[11.5, 12], [9.6, 24], [8.4, 40], [7.6, 56], [7.4, 68]], der = [[38.5, 12], [40.6, 26], [41.6, 44], [42.4, 60], [43.2, 70]];
    const brazo = () => { g.beginPath(); g.moveTo(izq[0][0], izq[0][1]); for (const q of izq) g.lineTo(q[0], q[1]);
      for (let i = der.length - 1; i >= 0; i--) g.lineTo(der[i][0], der[i][1]); g.closePath(); };
    // solo por encima del dobladillo (+1 px que tapa la junta)
    g.save(); g.beginPath(); g.rect(-2, -4, mw + 4, 4 + 66); g.clip();
    const sombraDob = [[0, 67.5], [5, 65.6], [10, 63.7], [20, 63.9], [28, 64.7], [34, 65.7], [39, 66.7], [44, 68.3], [52, 69.2]];
    g.beginPath(); g.moveTo(-2, -4); g.lineTo(mw + 2, -4); g.lineTo(mw + 2, sombraDob[sombraDob.length - 1][1]);
    for (let i = sombraDob.length - 1; i >= 0; i--) g.lineTo(sombraDob[i][0], sombraDob[i][1]); g.lineTo(-2, sombraDob[0][1]); g.closePath(); g.clip();
    brazo(); const gr = g.createLinearGradient(8, 0, 43, 0);
    gr.addColorStop(0, "#ffe6cf"); gr.addColorStop(0.3, "#ffdcc0"); gr.addColorStop(0.72, "#f6c9a4"); gr.addColorStop(1, "#e3a983");
    g.fillStyle = gr; g.fill();
    // músculo apenas marcado (es un brazo flaquito)
    g.strokeStyle = "rgba(200,140,110,0.5)"; g.lineWidth = 1; g.beginPath(); g.moveTo(30, 30); g.quadraticCurveTo(35, 46, 31, 60); g.stroke();
    g.lineWidth = 1.9; g.strokeStyle = TINTA; g.beginPath(); g.moveTo(izq[1][0], izq[1][1]); for (const q of izq.slice(1)) g.lineTo(q[0], q[1]); g.stroke();
    g.beginPath(); g.moveTo(der[1][0], der[1][1]); for (const q of der.slice(1)) g.lineTo(q[0], q[1]); g.stroke();
    g.restore();
    // marca del moreno: raya rosada justo encima del dobladillo
    g.save(); g.beginPath(); g.rect(8.6, 0, 33.6, 80); g.clip();
    g.strokeStyle = "rgba(226,120,96,0.75)"; g.lineWidth = 1.1; g.beginPath();
    DOBLADILLO.forEach(([x, y], i) => { if (i) g.lineTo(x, y + 0.2); else g.moveTo(x, y + 0.2); }); g.stroke();
    g.restore();
    g.restore();
    DESNUDO = c;
    // 2 · la manga sola (filas de arriba, recortada por el dobladillo)
    const m = document.createElement("canvas"); m.width = mw; m.height = FILAS_MANGA;
    const gm = m.getContext("2d"); gm.drawImage(im, mx, my, mw, FILAS_MANGA, 0, 0, mw, FILAS_MANGA);
    gm.globalCompositeOperation = "destination-out"; rutaDobladillo(gm, true); gm.fill();
    MANGA = m;
  }
  // hoja de Guillermo → pantalla (y al revés) con su transformación
  function enHojaG(g, p, f) {
    g.save(); g.translate(p.x, p.suelo); g.scale(p.espejo ? -p.s : p.s, p.s); g.translate(-G.PELVIS.x, -G.SUELO); f(); g.restore();
  }
  // estado de la manga pegada: giro sobre la costura de abajo y resbalón hacia el codo
  const BISAGRA = P(52, 4);                      // costura de debajo del brazo (marco local de la rodaja)
  function mangaPegada(t) {
    const r = tramo(t, T.rasgon, T.rasgon + 0.05);
    const ab = 0.05 * r + 0.32 * tramo(t, T.rasgon + 0.05, T.suelta, entrada);
    const ale = ab * (1 + 0.35 * Math.sin((t - T.rasgon) * 46));
    const res = 26 * tramo(t, T.suelta - 0.06, T.suelta, entrada);
    return { giro: -ale, res };
  }
  // dibuja la manga en el marco local de la rodaja (raíz del brazo, eje y hacia el codo)
  function spriteManga(g, conTapa) {
    const tau = BC.tau, ox = BC.origen[0], oy = BC.origen[1], ax = BC.raiz[0], ay = BC.raiz[1], [, , mw] = BC.marco;
    const k = BC.tam_hoja[0] / mw;
    if (conTapa) g.drawImage(MANGA, 0, 0, mw, FILAS_MANGA, ox - ax, oy - ay, mw * k, FILAS_MANGA / tau);
    else { const r0 = (ay - oy) * tau; g.drawImage(MANGA, 0, r0, mw, FILAS_MANGA - r0, ox - ax, 0, mw * k, (FILAS_MANGA - r0) / tau); }
  }
  // marco local de la manga pegada a un brazo (hoja): transformación completa
  function marcoManga(p, c, t) {
    const mp = mangaPegada(t);
    return { raiz: c.raiz, a: c.a1, gro: c.grosor || 1, sig: c.estira || 1, giro: mp.giro, res: mp.res };
  }
  function aplicaMarco(g, f) {
    g.translate(f.raiz.x, f.raiz.y); g.rotate(f.a); g.scale(f.gro, f.sig);
    g.translate(0, f.res);
    g.translate(BISAGRA.x, BISAGRA.y); g.rotate(f.giro); g.translate(-BISAGRA.x, -BISAGRA.y);
  }
  // punto local de la manga → pantalla
  const ANCLA = P(8, 30);
  function mangaAPantalla(p, f, q) {
    let v = P(q.x - BISAGRA.x, q.y - BISAGRA.y); v = rota(v, f.giro); v = P(v.x + BISAGRA.x, v.y + BISAGRA.y + f.res);
    v = P(v.x * f.gro, v.y * f.sig); v = rota(v, f.a);
    return G.aPantalla(p, P(f.raiz.x + v.x, f.raiz.y + v.y));
  }
  // vuelo: simulación de paso fijo (una vez)
  let VUELO = null;
  const SUELO_MANGA = 576;
  // Contorno opaco de la pieza de tela en el atlas, una vez recortado el dobladillo.
  const CONTORNO = [[2,60],[4,29],[5,26],[7,21],[12,11],[16,7],[19,5],[23,3],[26,2],[34,1],[37,1],[38,8],[41,56],[41,66],[2,66]].map(([x,y]) =>
    P(BC.origen[0] - BC.raiz[0] + x * BC.tam_hoja[0] / BC.marco[2], BC.origen[1] - BC.raiz[1] + y / BC.tau));
  function telaEn(e, q) {
    const v = rota(P((q.x - ANCLA.x) * S * e.fx, (q.y - ANCLA.y) * S), e.a);
    return P(e.x + v.x, e.y + v.y);
  }
  function apoyoTela(e) {
    let masBajo = telaEn(e, CONTORNO[0]);
    for (const q of CONTORNO.slice(1)) {
      const punto = telaEn(e, q);
      if (punto.y > masBajo.y) masBajo = punto;
    }
    return masBajo;
  }
  function simulaVuelo() {
    const t0 = T.suelta, p = poseG(t0), c = cadena(G, p, "cerca"), f = marcoManga(p, c, t0);
    const C0 = mangaAPantalla(p, f, ANCLA), A0 = f.a + f.giro;
    const dirB = P(-Math.sin(f.a), Math.cos(f.a));                      // a lo largo del brazo, hacia el codo
    let x = C0.x, y = C0.y, vx = 205 * dirB.x - 20, vy = 205 * dirB.y - 640, a = A0, w = -9.5, fx = 1, fase0 = 0, wf = 9;
    const dt = 1 / 240, out = [], kD = 2.3, gY = 1500;
    let posado = false, tPos = 0, xImpacto = 0;
    for (let i = 0; t0 + i * dt <= DUR + 0.05; i++) {
      out.push({ x, y, a, fx: posado ? fx : Math.cos(fase0), posado, tPos, xImpacto });
      if (!posado) {
        vx += -kD * vx * dt; vy += (gY - kD * vy) * dt; x += vx * dt; y += vy * dt;
        a += w * dt; w *= Math.exp(-0.6 * dt); const uu = (i + 1) * dt; fase0 = 2 * uu + wf * uu * uu;
        const contacto = apoyoTela({x, y, a, fx: Math.cos(fase0)});
        if (contacto.y >= SUELO_MANGA && vy > 0) {
          const previo = apoyoTela(out[i]);
          const k = clamp((SUELO_MANGA - previo.y) / (contacto.y - previo.y));
          posado = true; tPos = t0 + (i + k) * dt; xImpacto = lerp(previo.x, contacto.x, k);
          y -= contacto.y - SUELO_MANGA;
          fx = Math.cos(fase0);
        }
      } else {
        // se posa: resbala un poco, queda tumbada y aplastada
        const u = t0 + i * dt - tPos;
        x += vx * Math.exp(-u * 9) * dt * 0.35;
        const obj = Math.round((a - Math.PI / 2) / Math.PI) * Math.PI + Math.PI / 2;
        a += (obj - a) * (1 - Math.exp(-14 * dt));
        fx += ((fx >= 0 ? 1 : -1) * 0.55 - fx) * (1 - Math.exp(-12 * dt));
        y += SUELO_MANGA - apoyoTela({x, y, a, fx}).y;
      }
    }
    VUELO = { t0, dt, out, A0, C0 };
  }
  function estadoVuelo(t) {
    const V = VUELO, u = (t - V.t0) / V.dt, i = Math.max(0, Math.min(V.out.length - 2, Math.floor(u))), k = clamp(u - i);
    const a = V.out[i], b = V.out[i + 1];
    const e = { x: lerp(a.x,b.x,k), y: lerp(a.y,b.y,k), a: lerp(a.a,b.a,k), fx: lerp(a.fx,b.fx,k),
      posado: b.posado && t >= b.tPos, tPos: b.tPos, xImpacto: b.xImpacto };
    if (e.posado) e.y += SUELO_MANGA - apoyoTela(e).y;
    return e;
  }
  // Guillermo con su manga (desde el rasgón: brazo desnudo + manga aparte)
  function dibujaG(g, p, t) {
    if (!p.visible) return;
    if (t < T.rasgon) { G.dibujar(g, p, t); return; }
    const orig = G.A.imgs[1]; G.A.imgs[1] = DESNUDO;
    try { G.dibujar(g, p, t); } finally { G.A.imgs[1] = orig; }
    const c = cadena(G, p, "cerca");
    if (t < T.suelta) {
      const f = marcoManga(p, c, t);
      enHojaG(g, p, () => {
        g.save(); aplicaMarco(g, f); spriteManga(g, false);
        // El remate antes oculto tras el hombro sale a la vista mientras se despega.
        g.save(); g.beginPath(); g.rect(-150,-150,300,150); g.clip();
        g.globalAlpha *= tramo(t,T.rasgon,T.suelta); spriteManga(g,true); g.restore();
        rasgoncito(g, t); g.restore();
      });
    }
    // hilos sueltos en la costura de la camiseta
    const hk = tramo(t, T.rasgon, T.rasgon + 0.12);
    enHojaG(g, p, () => {
      g.save(); g.translate(c.raiz.x, c.raiz.y); g.rotate(c.a1);
      g.strokeStyle = "#1e1e24"; g.lineCap = "round"; g.lineWidth = 3.2;
      for (let i = 0; i < 5; i++) {
        const x0 = -44 + i * 21, L = (9 + 5 * hash(i + 3)) * hk, ond = Math.sin(t * 9 + i * 1.7) * 3 * hk;
        g.beginPath(); g.moveTo(x0, -2); g.quadraticCurveTo(x0 + ond, L * 0.5, x0 + ond * 1.6, L); g.stroke();
      }
      g.restore();
    });
  }
  // el rasgoncito: rayitas de tensión en la costura y un hilo
  function rasgoncito(g, t) {
    const k = campana(t, T.rasgon - 0.02, T.rasgon + 0.26); if (k < 0.01) return;
    g.save(); g.strokeStyle = TINTA; g.lineCap = "round"; g.lineWidth = 4; g.globalAlpha = k;
    for (const [x, a] of [[-40, -2.3], [-24, -1.9], [-8, -1.6]]) {
      const d = P(Math.cos(a), Math.sin(a)); g.beginPath(); g.moveTo(x + d.x * 10, d.y * 10); g.lineTo(x + d.x * 26, d.y * 26); g.stroke();
    }
    g.restore();
  }
  // manga volando (pantalla): con un poco de sombra en el suelo
  function mangaVuelo(g, t) {
    if (t < T.suelta || !VUELO) return;
    const e = estadoVuelo(t);
    // sombra
    const alto = clamp(1 - (SUELO_MANGA - e.y) / 300);
    g.save(); g.fillStyle = `rgba(10,12,16,${0.22 * alto})`; g.beginPath(); g.ellipse(apoyoTela(e).x, SUELO_MANGA + 1, 16 + 10 * alto, 4, 0, 0, TAU); g.fill(); g.restore();
    if (Math.abs(e.fx) < .18) {
      const v = telaEn(e, P(8,-40)), w = telaEn(e, P(8,90));
      g.save(); g.strokeStyle = TINTA; g.lineWidth = 1.5 * (1 - Math.abs(e.fx)/.18); g.lineCap = "round";
      g.beginPath(); g.moveTo(v.x,v.y); g.lineTo(w.x,w.y); g.stroke(); g.restore();
    }
    g.save(); g.translate(e.x, e.y); g.rotate(e.a); g.scale(S * e.fx, S);
    g.translate(-ANCLA.x, -ANCLA.y);
    spriteManga(g, true);
    g.restore();
    // rayitas de velocidad mientras sube
    const vk = campana(t, T.suelta + 0.02, T.suelta + 0.36);
    if (vk > 0.02) {
      const V = estadoVuelo(Math.max(T.suelta, t - 0.05)), dx = e.x - V.x, dy = e.y - V.y, L = Math.hypot(dx, dy) || 1;
      g.save(); g.strokeStyle = `rgba(40,40,52,${0.4 * vk})`; g.lineWidth = 1.8; g.lineCap = "round";
      for (const i of [-1, 1]) { const nx = -dy / L * i * 11, ny = dx / L * i * 11;
        g.beginPath(); g.moveTo(e.x - dx / L * 30 + nx, e.y - dy / L * 30 + ny); g.lineTo(e.x - dx / L * 50 + nx, e.y - dy / L * 50 + ny); g.stroke(); }
      g.restore();
    }
    // ¡plof! al caer: polvillo
    if (e.posado) {
      const u = t - e.tPos; if (u < 0.5) {
        g.save(); g.fillStyle = `rgba(200,205,215,${0.5 * (1 - u / 0.5)})`;
        for (let i = 0; i < 6; i++) { const a = Math.PI + i / 5 * Math.PI, r = 48 * salida(u / 0.5);
          g.beginPath(); g.arc(e.xImpacto + Math.cos(a) * r, SUELO_MANGA + Math.sin(a) * r * 0.25, 2.5 + 2 * (1 - u / 0.5), 0, TAU); g.fill(); }
        g.restore();
      }
    }
  }

  /* =====================================================================================
   * DESTELLOS Y EFECTOS
   * ===================================================================================== */
  function destello4(g, x, y, r, a, giro = 0) {
    if (a < 0.01 || r < 0.5) return;
    g.save(); g.translate(x, y); g.rotate(giro); g.globalAlpha = clamp(a);
    g.fillStyle = "#fffbe8"; g.beginPath();
    for (let i = 0; i < 8; i++) { const ang = i * Math.PI / 4, rr = i % 2 ? r * 0.22 : r; const q = P(Math.cos(ang) * rr, Math.sin(ang) * rr); if (i) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); }
    g.closePath(); g.fill(); g.strokeStyle = "rgba(255,200,80,0.8)"; g.lineWidth = 1.2; g.stroke();
    g.restore();
  }
  // brillo del bíceps (punto del brazo a media altura, un poco por encima)
  function bicepsPunto(Rg, p, lado) {
    const c = cadena(Rg, p, lado), pts = R.muestras(c, 16), q = pts[5], a = q.a;
    const n = P(Math.cos(a), Math.sin(a));                         // normal (lado +x local)
    return Rg.aPantalla(p, P(q.x - n.x * 11, q.y - n.y * 11));
  }
  function tings(g, t, pY, pG) {
    const a1 = campana(t, T.tingY - 0.05, T.tingY + 0.35);
    if (a1 > 0.01) { const q = bicepsPunto(Yo, pY, "cerca"); destello4(g, q.x, q.y, 14 * a1, a1, t * 2); }
    const a2 = campana(t, T.tingG - 0.05, T.tingG + 0.38);
    if (a2 > 0.01 && pG.visible) { const q = bicepsPunto(G, pG, "cerca"); destello4(g, q.x, q.y, 14 * a2, a2, t * 2); }
  }
  // flash del móvil
  const flash = t => tramo(t, T.flashSube, T.foto) * (1 - tramo(t, T.flashBaja0, T.flashBaja1));
  function flashReal(g, t, pY) {
    const a = flash(t); if (a < 0.01) return;
    const c = puntoMovil(pY, LED_LADO);
    g.save();
    const gr = g.createRadialGradient(c.x, c.y, 1, c.x, c.y, 90); gr.addColorStop(0, `rgba(255,255,255,${0.95 * a})`); gr.addColorStop(0.25, `rgba(245,250,255,${0.45 * a})`); gr.addColorStop(1, "rgba(245,250,255,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(c.x, c.y, 90, 0, TAU); g.fill();
    g.restore();
  }
  function flashReflejo(g, t, pY, fuerza = 1) {
    const a = fuerza * flash(t); if (a < 0.01) return;
    const c = puntoMovil(pY, P(6 + (LED.x - 6) * (1 - 0.40 * giraMovil(t)), LED.y));
    g.save();
    const gr = g.createRadialGradient(c.x, c.y, 2, c.x, c.y, 150); gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(0.18, `rgba(255,252,240,${0.75 * a})`); gr.addColorStop(0.5, `rgba(240,248,255,${0.25 * a})`); gr.addColorStop(1, "rgba(240,248,255,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(c.x, c.y, 150, 0, TAU); g.fill();
    destello4(g, c.x, c.y, 58 * a, a, 0.3);
    destello4(g, c.x, c.y, 30 * a, a, 0.3 + Math.PI / 4);
    g.restore();
  }
  // sombras de los dos en el suelo
  function sombras(g, t, pY, pG) {
    g.save(); g.fillStyle = "rgba(8,10,14,0.32)";
    g.beginPath(); g.ellipse(pY.x - 4, SUELO_Y + 3, 66, 9, 0, 0, TAU); g.fill();
    if (pG.visible) { const sg = saltoG(t), k = clamp(1 - sg.h / 220);
      g.globalAlpha = 0.4 + 0.6 * k; g.beginPath(); g.ellipse(pG.x - 2, SUELO_G + 3, 30 + 32 * k, 8, 0, 0, TAU); g.fill(); }
    g.restore();
  }
  // líneas de movimiento del salto
  function lineasSalto(g, t, pG) {
    const k = dentro(t, T.salto0, T.salto0 + 0.05, T.aterriza - 0.12, T.aterriza + 0.05); if (k < 0.01) return;
    g.save(); g.strokeStyle = `rgba(30,34,44,${0.5 * k})`; g.lineWidth = 3; g.lineCap = "round";
    const c = G.aPantalla(pG, P(G.PELVIS.x, 520));
    for (let i = 0; i < 4; i++) { const y = c.y - 110 + i * 52, x0 = c.x - 120 - 20 * (i % 2); g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 - 70 - 25 * hash(i), y + 6); g.stroke(); }
    g.restore();
    // polvo al aterrizar
  }
  function apoyoPieG(lado) {
    const p = poseG(T.aterriza), q = p.piernas[lado];
    return G.aPantalla(p, P(q.tob.x + 87.3, q.tob.y + 93));
  }
  function polvoAterriza(g, t, pG) {
    const u = t - T.aterriza; if (u < 0 || u > 0.55) return;
    const k = 1 - u / 0.55;
    g.save(); g.fillStyle = `rgba(190,196,206,${0.6 * k})`;
    for (let i = 0; i < 8; i++) { const lado = i < 4 ? -1 : 1, j = i % 4, r = 70 * salida(u / 0.55) * (0.6 + 0.12 * j);
      const apoyo = apoyoPieG(lado < 0 ? 'cerca' : 'lejos');
      g.beginPath(); g.arc(apoyo.x + lado * r, apoyo.y - 10 * j * salida(u / 0.55) * 0.5, 4 + 3 * k, 0, TAU); g.fill(); }
    g.restore();
  }
  // ¡pop! del rasgón (en pantalla, junto al hombro)
  function popRasgon(g, t, pG) {
    const k = campana(t, T.suelta - 0.02, T.suelta + 0.3); if (k < 0.01) return;
    const c = cadena(G, pG, "cerca"), h = G.aPantalla(pG, c.raiz), e = G.aPantalla(pG, R.muestras(c, 8)[3]);
    const m = mezcla(h, e, 0.6);
    g.save(); g.strokeStyle = `rgba(20,20,26,${0.85 * k})`; g.lineWidth = 2.6; g.lineCap = "round";
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.42, r0 = 26 + 10 * salida(fase(t, T.suelta, T.suelta + 0.3)), r1 = r0 + 12;
      g.beginPath(); g.moveTo(m.x + Math.cos(a) * r0, m.y + Math.sin(a) * r0); g.lineTo(m.x + Math.cos(a) * r1, m.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // carcajadas de Yorgi: rayitas alrededor de la cabeza
  function risaLineas(g, t, pY) {
    const k = risaY(t); if (k < 0.01) return;
    const H = Yo.cabeza(pY), c = Yo.aPantalla(pY, H.a(P(850, 520)));
    g.save(); g.strokeStyle = `rgba(30,30,40,${0.7 * k})`; g.lineWidth = 2.6; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const a = -0.9 + i * 0.45, r0 = 92 + 5 * Math.sin(t * 17 + i), r1 = r0 + 14;
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }

  /* =====================================================================================
   * EL MUNDO (sombras, muñecos, manga, efectos): se dibuja tal cual y reflejado
   * ===================================================================================== */
  function mundo(g, t, modo) {
    const pY = poseY(t), pG = poseG(t);
    REFLEJO = modo !== "real"; FLASH_LED = flash(t);
    sombras(g, t, pY, pG);
    Yo.dibujar(g, pY, t);
    if (pG.visible) { lineasSalto(g, t, pG); dibujaG(g, pG, t); }
    polvoAterriza(g, t, pG);
    mangaVuelo(g, t);
    popRasgon(g, t, pG);
    tings(g, t, pY, pG);
    risaLineas(g, t, pY);
    REFLEJO = false;
    return { pY, pG };
  }

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  let fondo = null, salaR = null, marco = null, FOTO = null, DETRAS = null;
  const rnd = i => hash(i * 1.618 + 0.37);
  const VP = P(512, 250);                                    // punto de fuga del suelo
  function dibujaSala(g) {
    g.lineJoin = "round"; g.lineCap = "round";
    // techo
    g.fillStyle = "#26292f"; g.fillRect(-60, -260, 1150, 288);
    g.strokeStyle = "#31353c"; g.lineWidth = 2;
    for (let i = 0; i < 9; i++) { const y = 20 - i * 30 - i * i * 3; g.beginPath(); g.moveTo(-60, y); g.lineTo(1100, y); g.stroke(); }
    // barras de LED colgadas (las cercanas se ven más grandes y más altas)
    for (const [x0, x1, y, k] of [[40, 300, 12, 1], [340, 600, 12, 1], [-30, 330, -70, 1.4], [370, 720, -70, 1.4], [-60, 380, -170, 1.9], [420, 840, -170, 1.9]]) {
      g.strokeStyle = "#16181c"; g.lineWidth = 1.5 * k;
      g.beginPath(); g.moveTo(x0 + 30, y - 40 * k); g.lineTo(x0 + 30, y); g.moveTo(x1 - 30, y - 40 * k); g.lineTo(x1 - 30, y); g.stroke();
      const gl = g.createLinearGradient(0, y - 20 * k, 0, y + 40 * k); gl.addColorStop(0, "rgba(255,250,235,0)"); gl.addColorStop(0.4, "rgba(255,250,235,0.35)"); gl.addColorStop(1, "rgba(255,250,235,0)");
      g.fillStyle = gl; g.fillRect(x0 - 20, y - 20 * k, x1 - x0 + 40, 60 * k);
      g.fillStyle = "#3a3f47"; g.beginPath(); g.roundRect(x0, y - 4 * k, x1 - x0, 8 * k, 3 * k); g.fill();
      g.fillStyle = "#fffdf4"; g.beginPath(); g.roundRect(x0 + 4, y + 1 * k, x1 - x0 - 8, 4 * k, 2 * k); g.fill();
    }
    // pared del fondo: arriba gris claro, franja naranja, abajo verde petróleo
    let gr = g.createLinearGradient(0, 26, 0, 260); gr.addColorStop(0, "#d5d1c9"); gr.addColorStop(0.35, "#e6e2db"); gr.addColorStop(1, "#dcd8d0");
    g.fillStyle = gr; g.fillRect(-60, 26, 1150, 236);
    g.fillStyle = "#c9c4bb"; g.fillRect(-60, 26, 1150, 4);
    gr = g.createLinearGradient(0, 262, 0, MURO); gr.addColorStop(0, "#1f6068"); gr.addColorStop(1, "#174850");
    g.fillStyle = gr; g.fillRect(-60, 262, 1150, MURO - 262);
    g.fillStyle = "#f07a2b"; g.fillRect(-60, 246, 1150, 16);
    g.fillStyle = "#ffffff"; g.fillRect(-60, 266, 1150, 4);
    // luz de las barras en la pared
    for (const x of [170, 470]) { const r = g.createRadialGradient(x, 30, 10, x, 30, 260); r.addColorStop(0, "rgba(255,252,240,0.55)"); r.addColorStop(1, "rgba(255,252,240,0)"); g.fillStyle = r; g.fillRect(x - 270, 26, 540, 260); }
    // paneles verticales del zócalo
    g.strokeStyle = "rgba(10,40,44,0.45)"; g.lineWidth = 2;
    for (let x = 20; x < 1100; x += 118) { g.beginPath(); g.moveTo(x, 272); g.lineTo(x, MURO - 12); g.stroke(); }
    g.fillStyle = "#101418"; g.fillRect(-60, MURO - 12, 1150, 12);
    // reloj sin números
    reloj(g, 92, 104, 32);
    // carteles (solo iconos)
    cartel(g, 166, 40, 62, 80, "#17181c", c => { c.fillStyle = "#ffd23a"; c.beginPath(); c.moveTo(36, 8); c.lineTo(16, 44); c.lineTo(30, 44); c.lineTo(24, 72); c.lineTo(48, 32); c.lineTo(33, 32); c.lineTo(42, 8); c.closePath(); c.fill(); });
    cartel(g, 300, 34, 74, 86, "#f07a2b", c => brazoIcono(c, 37, 48));
    cartel(g, 456, 40, 66, 78, "#1f6068", c => mancuernaIcono(c, 33, 39));
    // árbol de discos (izquierda)
    arbolDiscos(g, 70, MURO);
    // banco plano entre los dos
    banco(g, 296, 404);
    // cajones de salto en la esquina
    cajon(g, 528, 432, 74, 48, "#c9945a"); cajon(g, 540, 396, 56, 36, "#d6a46a");
    // kettlebells
    kettle(g, 146, MURO + 8, 15, "#2a2d33"); kettle(g, 182, MURO + 12, 18, "#e0473c");
    // suelo de caucho
    suelo(g);
  }
  function reloj(g, x, y, r) {
    g.save(); g.fillStyle = "rgba(0,0,0,0.15)"; g.beginPath(); g.arc(x + 3, y + 4, r + 4, 0, TAU); g.fill();
    g.fillStyle = "#1b1d22"; g.beginPath(); g.arc(x, y, r + 4, 0, TAU); g.fill();
    g.fillStyle = "#fbfaf6"; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    g.strokeStyle = "#1b1d22"; g.lineCap = "round";
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, r0 = i % 3 ? r - 6 : r - 10; g.lineWidth = i % 3 ? 1.6 : 3;
      g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * (r - 3), y + Math.sin(a) * (r - 3)); g.stroke(); }
    g.lineWidth = 3.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 12, y - 12); g.stroke();
    g.lineWidth = 2.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 4, y - 23); g.stroke();
    g.strokeStyle = "#e0473c"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y + 6); g.lineTo(x + 18, y + 14); g.stroke();
    g.fillStyle = "#1b1d22"; g.beginPath(); g.arc(x, y, 2.6, 0, TAU); g.fill();
    g.restore();
  }
  function cartel(g, x, y, w, h, fondoC, icono) {
    g.save(); g.fillStyle = "rgba(0,0,0,0.16)"; g.fillRect(x + 4, y + 5, w, h);
    g.fillStyle = fondoC; g.fillRect(x, y, w, h); g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 1.5; g.strokeRect(x, y, w, h);
    g.translate(x, y); icono(g); g.restore();
    g.save(); g.fillStyle = "#b9b4ab"; for (const [cx, cy] of [[x + 5, y + 5], [x + w - 5, y + 5]]) { g.beginPath(); g.arc(cx, cy, 2.2, 0, TAU); g.fill(); } g.restore();
  }
  function brazoIcono(g, x, y) {
    g.save(); g.translate(x, y); g.fillStyle = "#fff6ec";
    g.beginPath(); g.moveTo(-26, 22); g.lineTo(-26, 4); g.quadraticCurveTo(-24, -6, -10, -4); g.quadraticCurveTo(-2, -24, 6, -16);
    g.lineTo(6, -30); g.quadraticCurveTo(8, -36, 16, -34); g.quadraticCurveTo(24, -32, 22, -24); g.lineTo(18, -8);
    g.quadraticCurveTo(16, 6, 4, 12); g.quadraticCurveTo(-8, 18, -12, 22); g.closePath(); g.fill();
    g.restore();
  }
  function mancuernaIcono(g, x, y) {
    g.save(); g.translate(x, y); g.rotate(-0.5); g.fillStyle = "#ffffff";
    g.fillRect(-16, -3, 32, 6);
    for (const s of [-1, 1]) { g.beginPath(); g.roundRect(s * 16 - (s > 0 ? 0 : 9), -13, 9, 26, 2); g.fill(); g.beginPath(); g.roundRect(s * 25 - (s > 0 ? 0 : 6), -9, 6, 18, 2); g.fill(); }
    g.restore();
  }
  function arbolDiscos(g, x, y0) {
    g.save();
    g.fillStyle = "#15171b"; g.beginPath(); g.roundRect(x - 44, y0 - 10, 88, 14, 3); g.fill();
    g.fillStyle = "#2a2d33"; g.fillRect(x - 5, y0 - 230, 10, 222);
    g.fillStyle = "#c9ced6"; for (const [dy, s] of [[-200, -1], [-200, 1], [-130, -1], [-130, 1], [-62, -1], [-62, 1]]) g.fillRect(x + (s > 0 ? 4 : -26), y0 + dy - 3, 22, 6);
    const disco = (cx, cy, r, col) => {
      g.fillStyle = "rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(cx + 2, cy + 3, r * 0.32, r, 0, 0, TAU); g.fill();
      g.fillStyle = col; g.beginPath(); g.ellipse(cx, cy, r * 0.3, r, 0, 0, TAU); g.fill();
      g.strokeStyle = "rgba(0,0,0,0.5)"; g.lineWidth = 1.4; g.stroke();
      g.fillStyle = "rgba(255,255,255,0.18)"; g.beginPath(); g.ellipse(cx - r * 0.08, cy - r * 0.2, r * 0.1, r * 0.6, 0, 0, TAU); g.fill();
      g.fillStyle = "#c9ced6"; g.beginPath(); g.ellipse(cx, cy, r * 0.08, r * 0.24, 0, 0, TAU); g.fill();
    };
    disco(x + 30, y0 - 62, 40, "#d8352c"); disco(x + 22, y0 - 62, 40, "#d8352c"); disco(x - 26, y0 - 62, 36, "#2f62c8");
    disco(x + 26, y0 - 130, 30, "#f0c22a"); disco(x - 24, y0 - 130, 30, "#f0c22a"); disco(x - 18, y0 - 130, 30, "#f0c22a");
    disco(x + 22, y0 - 200, 22, "#3aa35b"); disco(x - 22, y0 - 200, 22, "#3aa35b");
    g.restore();
  }
  function banco(g, x, y) {
    g.save();
    g.fillStyle = "rgba(0,0,0,0.22)"; g.beginPath(); g.ellipse(x + 70, MURO + 30, 92, 8, 0, 0, TAU); g.fill();
    g.strokeStyle = "#9aa1ab"; g.lineWidth = 5; g.lineCap = "round";
    g.beginPath(); g.moveTo(x + 16, y + 22); g.lineTo(x + 10, MURO + 28); g.moveTo(x + 124, y + 22); g.lineTo(x + 132, MURO + 28); g.stroke();
    g.strokeStyle = "#6c737d"; g.beginPath(); g.moveTo(x - 4, MURO + 28); g.lineTo(x + 26, MURO + 28); g.moveTo(x + 116, MURO + 28); g.lineTo(x + 146, MURO + 28); g.stroke();
    g.fillStyle = "#1a1b20"; g.beginPath(); g.roundRect(x, y, 140, 22, 7); g.fill();
    g.fillStyle = "#2d2f36"; g.beginPath(); g.roundRect(x + 3, y + 2, 134, 9, 5); g.fill();
    g.fillStyle = "#f07a2b"; g.fillRect(x, y + 17, 140, 3);
    g.restore();
  }
  function cajon(g, x, y, w, h, col) {
    g.save(); g.fillStyle = col; g.fillRect(x, y, w, h);
    g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(x + w - 10, y, 10, h);
    g.fillStyle = "rgba(60,30,10,0.35)"; g.beginPath(); g.ellipse(x + w / 2 - 4, y + h * 0.45, 9, 4, 0, 0, TAU); g.fill();
    g.strokeStyle = "rgba(60,30,10,0.55)"; g.lineWidth = 1.5; g.strokeRect(x, y, w, h);
    g.strokeStyle = "rgba(120,70,30,0.25)"; g.lineWidth = 1; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(x + 3, y + i * h / 4 + 2); g.lineTo(x + w - 12, y + i * h / 4 - 1); g.stroke(); }
    g.restore();
  }
  function kettle(g, x, y, r, col) {
    g.save(); g.fillStyle = "rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(x + 2, y + 2, r * 1.1, 4, 0, 0, TAU); g.fill();
    g.strokeStyle = "#1c1e23"; g.lineWidth = r * 0.36; g.beginPath(); g.arc(x, y - r * 1.55, r * 0.62, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
    g.fillStyle = col; g.beginPath(); g.ellipse(x, y - r * 0.9, r, r * 0.92, 0, 0, TAU); g.fill();
    g.strokeStyle = "rgba(0,0,0,0.45)"; g.lineWidth = 1.4; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.22)"; g.beginPath(); g.ellipse(x - r * 0.35, y - r * 1.2, r * 0.22, r * 0.34, -0.4, 0, TAU); g.fill();
    g.restore();
  }
  function suelo(g) {
    g.save();
    const gr = g.createLinearGradient(0, MURO, 0, 740); gr.addColorStop(0, "#1c1e22"); gr.addColorStop(1, "#2a2d33");
    g.fillStyle = gr; g.fillRect(-60, MURO, 1150, 260);
    // juntas de las losetas
    g.strokeStyle = "rgba(0,0,0,0.5)"; g.lineWidth = 1.6;
    for (const y of [506, 540, 588, 660]) { g.beginPath(); g.moveTo(-60, y); g.lineTo(1100, y); g.stroke(); }
    for (let i = -8; i <= 10; i++) {
      const xb = VP.x + i * 140 * (MURO - VP.y) / 300;
      const f = y => VP.x + (xb - VP.x) * (y - VP.y) / (MURO - VP.y);
      g.beginPath(); g.moveTo(f(MURO), MURO); g.lineTo(f(740), 740); g.stroke();
    }
    // motas de colores del caucho
    const cols = ["#3d4450", "#4c5a68", "#5b6c7c", "#3b3f47", "#566070"];
    for (let i = 0; i < 520; i++) {
      const y = MURO + 4 + Math.pow(rnd(i), 1.3) * 250, x = -60 + rnd(i + 900) * 1150, s = 0.6 + (y - MURO) / 120;
      g.fillStyle = cols[i % 5]; g.fillRect(x, y, s * 1.6, s * 0.9);
    }
    // esterilla morada delante del árbol de discos
    g.fillStyle = "rgba(0,0,0,0.3)"; g.beginPath(); g.moveTo(-30, 552); g.lineTo(150, 552); g.lineTo(170, 604); g.lineTo(-30, 604); g.closePath(); g.fill();
    g.fillStyle = "#7c5cc4"; g.beginPath(); g.moveTo(-30, 548); g.lineTo(146, 548); g.lineTo(166, 600); g.lineTo(-30, 600); g.closePath(); g.fill();
    g.fillStyle = "#9479d6"; g.beginPath(); g.moveTo(-30, 548); g.lineTo(146, 548); g.lineTo(148, 553); g.lineTo(-30, 553); g.closePath(); g.fill();
    g.strokeStyle = "rgba(60,40,110,0.5)"; g.lineWidth = 1.2;
    for (let i = 1; i < 4; i++) { const y = 548 + i * 13; g.beginPath(); g.moveTo(-30, y); g.lineTo(146 + 20 * (y - 548) / 52, y); g.stroke(); }
    g.strokeStyle = "#5a3f9c"; g.lineWidth = 3; g.beginPath(); g.moveTo(146, 548); g.lineTo(166, 600); g.stroke();
    // charcos de luz
    for (const x of [170, 470]) { const r = g.createRadialGradient(x, 540, 10, x, 540, 240); r.addColorStop(0, "rgba(255,250,235,0.1)"); r.addColorStop(1, "rgba(255,250,235,0)"); g.fillStyle = r; g.fillRect(x - 250, MURO, 500, 260); }
    g.restore();
  }
  function creaSalaR() {
    const c = document.createElement("canvas"); c.width = Math.round(SALA.w * SALA.rs); c.height = Math.round(SALA.h * SALA.rs);
    const g = c.getContext("2d"); g.scale(SALA.rs, SALA.rs); g.translate(-SALA.x, -SALA.y); dibujaSala(g);
    return c;
  }
  const poli = (g, pts) => { g.beginPath(); g.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y); g.closePath(); };
  const enLinea = (a, b, x) => lerp(a.y, b.y, (x - a.x) / (b.x - a.x));
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    dibujaSala(g);
    // pared del espejo (marco oscuro alrededor del cristal)
    g.fillStyle = "#2b2f36"; poli(g, PARED_ESP); g.fill();
    g.fillStyle = "#121418"; g.beginPath(); g.moveTo(ESQ, MURO); g.lineTo(1030, 640); g.lineTo(1030, 610); g.lineTo(617, 471); g.closePath(); g.fill();
    g.fillStyle = "#1a2a33"; poli(g, VIDRIO); g.fill();
    return c;
  }
  function creaMarco() {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    // tinte frío del cristal y brillo
    g.save(); poli(g, VIDRIO); g.clip();
    g.fillStyle = "rgba(150,190,210,0.10)"; g.fillRect(600, -40, 440, 700);
    const sombraBorde = g.createLinearGradient(617, 0, 700, 0); sombraBorde.addColorStop(0, "rgba(10,20,30,0.35)"); sombraBorde.addColorStop(1, "rgba(10,20,30,0)");
    g.fillStyle = sombraBorde; g.fillRect(617, -40, 90, 700);
    for (const [x, w, a] of [[668, 26, 0.09], [702, 10, 0.07], [846, 46, 0.07], [900, 12, 0.06], [990, 22, 0.06]]) {
      g.fillStyle = `rgba(255,255,255,${a})`; g.beginPath(); g.moveTo(x, -40); g.lineTo(x + w, -40); g.lineTo(x + w - 160, 640); g.lineTo(x - 160, 640); g.closePath(); g.fill();
    }
    // juntas entre paneles
    for (const x of [790, 955]) {
      const y0 = enLinea(VIDRIO[0], VIDRIO[1], x), y1 = enLinea(VIDRIO[3], VIDRIO[2], x);
      g.fillStyle = "rgba(20,26,32,0.75)"; g.fillRect(x - 1.5, y0, 3, y1 - y0);
      g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(x + 1.5, y0, 1.2, y1 - y0);
    }
    g.restore();
    // perfil de aluminio: canto lejano, arriba y abajo
    g.save(); g.lineCap = "butt";
    const al = g.createLinearGradient(611, 0, 619, 0); al.addColorStop(0, "#8d949e"); al.addColorStop(0.5, "#e8ecf0"); al.addColorStop(1, "#7c838d");
    g.fillStyle = al; g.fillRect(611, 37, 7, 437);
    g.strokeStyle = "#c8cdd4"; g.lineWidth = 4;
    g.beginPath(); g.moveTo(VIDRIO[0].x, VIDRIO[0].y); g.lineTo(VIDRIO[1].x, VIDRIO[1].y); g.stroke();
    g.beginPath(); g.moveTo(VIDRIO[3].x, VIDRIO[3].y); g.lineTo(VIDRIO[2].x, VIDRIO[2].y); g.stroke();
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(VIDRIO[3].x, VIDRIO[3].y + 2.5); g.lineTo(VIDRIO[2].x, VIDRIO[2].y + 2.5); g.stroke();
    g.restore();
    return c;
  }

  /* =====================================================================================
   * LA ESCENA, LA FOTO Y LA CÁMARA
   * ===================================================================================== */
  function reflejo(g, t, recorta = true) {
    g.save();
    if (recorta) { poli(g, VIDRIO); g.clip(); }
    g.transform(-CR, 0, 0, CR, AX, AY);
    g.drawImage(salaR, SALA.x, SALA.y, SALA.w, SALA.h);
    const { pY } = mundo(g, t, "reflejo");
    flashReflejo(g, t, pY);
    g.restore();
  }
  function escena(g, t) {
    g.drawImage(fondo, 0, 0);
    reflejo(g, t);
    g.drawImage(marco, 0, 0);
    const { pY } = mundo(g, t, "real");
    flashReal(g, t, pY);
    // la luz del flash inunda la sala
    const a = flash(t);
    if (a > 0.005) { g.fillStyle = `rgba(255,255,255,${0.3 * a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  // la foto: el reflejo en el instante del flash (recorte vertical alrededor de los dos)
  const RECORTE = { x: 625, y: 104, w: 393, h: 418 }, SF = 1.5;
  function sacaFoto() {
    const c = document.createElement("canvas"); c.width = Math.round(RECORTE.w * SF); c.height = Math.round(RECORTE.h * SF); const g = c.getContext("2d");
    g.scale(SF, SF); g.translate(-RECORTE.x, -RECORTE.y);
    // Mismo cristal, juntas, encuadre y destello que en el instante del disparo.
    g.drawImage(fondo, 0, 0);
    reflejo(g, T.foto);
    g.drawImage(marco, 0, 0);
    g.setTransform(1, 0, 0, 1, 0, 0);
    // tono de foto de móvil: un pelín cálido, contraste y viñeta
    g.globalCompositeOperation = "soft-light"; g.fillStyle = "rgba(255,200,150,0.3)"; g.fillRect(0, 0, c.width, c.height);
    g.globalCompositeOperation = "source-over";
    const v = g.createRadialGradient(c.width / 2, c.height / 2, c.height * 0.3, c.width / 2, c.height / 2, c.height * 0.72);
    v.addColorStop(0, "rgba(20,20,30,0)"); v.addColorStop(1, "rgba(20,20,30,0.34)"); g.fillStyle = v; g.fillRect(0, 0, c.width, c.height);
    return c;
  }
  function creaDetras(tDetras) {
    const a = document.createElement("canvas"); a.width = W; a.height = H; const ga = a.getContext("2d");
    const cam = camara(tDetras); ga.translate(W / 2, H / 2); ga.scale(cam.k, cam.k); ga.translate(-cam.x, -cam.y); escena(ga, tDetras);
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    g.filter = "blur(6px)"; g.drawImage(a, 0, 0); g.filter = "none";
    g.fillStyle = "rgba(14,12,22,0.6)"; g.fillRect(0, 0, W, H);
    return c;
  }
  const oscurece = t => tramo(t, T.oscurece0, T.foto1);
  function dibujaFoto(g, t) {
    const k = tramo(t, T.foto0, T.foto1, salida);
    const lento = fase(t, T.foto1, DUR);
    const esc = lerp(1.22, 0.96, k) + 0.035 * lento;
    const rot = lerp(-0.14, -0.045, k) - 0.012 * lento;
    const fh = 444, fw = fh * RECORTE.w / RECORTE.h, bL = 16, bT = 16, bB = 54;
    const cx = W / 2 + lerp(70, 8, k) + 6 * lento, cy = H / 2 + lerp(-40, 0, k) - 3 * lento;
    g.save(); g.globalAlpha = clamp(k * 1.6);
    g.translate(cx, cy); g.rotate(rot); g.scale(esc, esc);
    const x0 = -fw / 2 - bL, y0 = -(fh + bT + bB) / 2, w = fw + 2 * bL, h = fh + bT + bB;
    g.fillStyle = `rgba(0,0,0,${0.38 * k})`; g.beginPath(); g.roundRect(x0 + 10 * k, y0 + 14 * k, w, h, 4); g.fill();
    g.fillStyle = `rgba(0,0,0,${0.18 * k})`; g.beginPath(); g.roundRect(x0 + 3, y0 + 5, w + 4, h + 4, 6); g.fill();
    g.fillStyle = "#fbf8f1"; g.beginPath(); g.roundRect(x0, y0, w, h, 3); g.fill();
    g.drawImage(FOTO, x0 + bL, y0 + bT, fw, fh);
    g.strokeStyle = "rgba(0,0,0,0.2)"; g.lineWidth = 1; g.strokeRect(x0 + bL, y0 + bT, fw, fh);
    // brillo del papel que cruza una vez
    const b = fase(t, T.brillo0, T.brillo1);
    if (b > 0 && b < 1) {
      g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
      const xs = lerp(x0 - 200, x0 + w + 200, suave(b));
      const br = g.createLinearGradient(xs - 70, y0, xs + 70, y0 + 120); br.addColorStop(0, "rgba(255,255,255,0)"); br.addColorStop(0.5, `rgba(255,255,255,${0.22 * Math.sin(Math.PI * b)})`); br.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = br; g.fillRect(x0, y0, w, h); g.restore();
    }
    g.restore();
  }
  const PLANOS = {
    a: { k: 1.07, x: 545, y: 300 }, b: { k: 1.0, x: 512, y: 300 }, c: { k: 1.1, x: 522, y: 306 }, f: { k: 1.26, x: 410, y: 361 },
    d: { k: 1.02, x: 512, y: 302 }, e: { k: 1.05, x: 520, y: 300 }
  };
  const mz = (a, b, k) => ({ k: lerp(a.k, b.k, k), x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });
  function camara(t) {
    let c = PLANOS.a;
    c = mz(c, PLANOS.b, tramo(t, 2.4, 3.5));
    c = mz(c, PLANOS.c, tramo(t, 4.6, 6.1));
    c = mz(c, PLANOS.f, tramo(t, 6.75, 7.4));
    c = mz(c, PLANOS.d, tramo(t, 8.25, 9.15));
    c = mz(c, PLANOS.e, tramo(t, 8.8, 10.4));
    return c;
  }

  const pose = t => ({ g: poseG(t), y: poseY(t) });
  class SelfieGimnasio extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Yo.listo()) return;
      if (!DESNUDO) preparaManga();
      if (!VUELO) simulaVuelo();
      // todo lo pesado se prepara en el primer fotograma (todavía negro): fondo, reflejo, foto y fondo borroso
      if (!fondo) { fondo = creaFondo(); salaR = creaSalaR(); marco = creaMarco(); FOTO = sacaFoto(); DETRAS = creaDetras(T.foto1); }
      const luz = tramo(t, NEGRO_INICIO, 0.7, suave) * (1 - tramo(t, T.fin0, DUR - NEGRO_FINAL - 0.02, suave));
      if (t < T.foto1) {
        const cam = camara(t);
        g.save(); g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
        escena(g, t);
        g.restore();
        const os = oscurece(t);
        if (os > 0.001) {
          if (!DETRAS) DETRAS = creaDetras(T.foto1);
          g.fillStyle = `rgba(14,12,22,${0.6 * os})`; g.fillRect(0, 0, W, H);
          g.save(); g.globalAlpha = tramo(t, T.foto0, T.foto1); g.drawImage(DETRAS, 0, 0); g.restore();
        }
      } else {
        if (!DETRAS) DETRAS = creaDetras(T.foto1);
        g.drawImage(DETRAS, 0, 0);
      }
      if (t >= T.foto0) { if (!FOTO) FOTO = sacaFoto(); dibujaFoto(g, t); }
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00140.2", nombre: "Guillermo y Yorgi · El selfie del gimnasio (revisión)", crear: () => new SelfieGimnasio() });
  window.__A2D_00140_2 = { pose, poseG, poseY, T, DUR, G, Yo, cadena, estadoVuelo, simulaVuelo,
    CONTORNO, ANCLA, mangaAPantalla, marcoManga, apoyoTela, telaEn, SUELO_MANGA, apoyoPieG, bicepsPunto,
    puntoMovil, BOTON, LED, LED_LADO, refl, RECORTE, flash, giraMovil, dibujoMovil: movil, reflejo,
    foto: () => FOTO, atlasBrazo: () => DESNUDO };
})();
