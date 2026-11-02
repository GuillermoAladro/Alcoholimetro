"use strict";
/* 00132 · Guillermo y Yorgi · Las flexiones
 *
 * Negro → el bar ya cerrado, de noche: papel pintado burdeos con rayas, zócalo de nogal, dos
 * apliques encendidos, una lámpara colgante que deja un charco de luz en el suelo de tablas, a la
 * izquierda una mesa arrimada a la pared con las sillas patas arriba, al fondo la máquina del
 * alcoholímetro (con sus cifras rojas) y a la derecha el extremo de la barra con las botellas.
 * Concurso de flexiones, de perfil y cabeza con cabeza: Yorgi a la izquierda y Guillermo a la
 * derecha, los dos en plancha. Yorgi reta a Guillermo levantando una ceja y hace dos flexiones con
 * palmada (se impulsa, despega las manos, da la palmada bajo el pecho con rayitas de golpe y vuelve
 * a apoyar), tan tranquilo; Guillermo se queda boquiabierto. Yorgi pasa a una mano (la otra a la
 * espalda, sobre los riñones), hace dos y, abajo del todo, guiña un ojo a cámara. Guillermo, picado
 * (vena), coge aire con los mofletes hinchados y baja temblando… se queda atascado a medio camino
 * (brazos temblorosos, colorado, sudando, dientes apretados), intenta subir, no puede y se desploma:
 * ¡plaf!, la cara aplastada contra el suelo, nube de polvo y estrellitas. Yorgi se ríe y, con el
 * pulgar, le señala su espalda: «súbete». Guillermo levanta la cabeza encantado, se impulsa, da un
 * saltito encogido y cae sentado en lo alto de la espalda de Yorgi, como un jinete, con las piernas
 * colgando por el otro lado. Yorgi hace tres flexiones con él encima: Guillermo, con una mano en
 * jarra, rebota con un poco de retraso, primero mareado y luego a gusto, y saca el pulgar delante
 * del pecho con el antebrazo bien horizontal. La cámara se acerca y los dos miran a cámara → negro.
 *
 * Las flexiones de perfil: cada muñeco se dibuja girado alrededor de su pelvis (como en 00115) con
 * el tronco estrecho (de perfil) y las piernas rectas hasta la punta del pie, que no se mueve del
 * suelo; la inclinación sale de buscar, una vez, la que deja el brazo de arriba vertical y casi
 * estirado hasta la mano apoyada (y la que deja los hombros a un palmo del suelo). Las manos
 * apoyadas se fijan en el mundo con la yema en la línea del suelo y los codos se doblan hacia
 * atrás. La cabeza se endereza (mira al frente) con su propio giro. Encima de Yorgi, Guillermo
 * sigue su espalda con un pequeño retraso (rebota). Sus piernas se pintan antes que Yorgi (cuelgan
 * por el otro lado: con estas piernas tan largas para la altura de la espalda, por delante taparían
 * la cadera o el brazo de Yorgi) y el resto después; la cabeza de Yorgi se vuelve a pintar recortada
 * por encima, porque Guillermo se sienta justo detrás de ella. El codo de una mano solo cambia de
 * lado al llegar a una postura con el brazo estirado, así no salta.
 * Sin textos (solo las cifras de la máquina). Todo depende solo de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, ruido, hash } = M2;
  const G = Guillermo, Y = Yorgi;
  const DUR = 14.6, TAU = Math.PI * 2, TINTA = "#0b0a0e";
  const P = (x, y) => ({ x, y });
  const rot = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return P(q.x * c - q.y * s, q.x * s + q.y * c); };
  const sub = (a, b) => P(a.x - b.x, a.y - b.y), add = (a, b) => P(a.x + b.x, a.y + b.y), mul = (a, k) => P(a.x * k, a.y * k);
  const len = q => Math.hypot(q.x, q.y);
  const norm = q => { const l = len(q) || 1; return P(q.x / l, q.y / l); };
  const lerpP = (a, b, k) => P(lerp(a.x, b.x, k), lerp(a.y, b.y, k));
  const normAng = d => { while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return d; };
  const lerpAng = (a, b, k) => a + normAng(b - a) * k;
  // de a hacia b girando en el sentido sg (+1 horario en pantalla, −1 antihorario)
  const angDir = (a, b, k, sg) => { let d = b - a; while (sg > 0 && d < 0) d += TAU; while (sg > 0 && d >= TAU) d -= TAU;
    while (sg < 0 && d > 0) d -= TAU; while (sg < 0 && d <= -TAU) d += TAU; return a + d * k; };

  const S = 0.35;
  const FY = 478;                     // línea del suelo (yemas y puntas de los pies)
  const EX = 0.3;                     // el tronco visto de perfil: estrecho
  const XPY = 62, XPG = 962;          // punta del pie de Yorgi (a la izquierda) y de Guillermo (a la derecha)
  const TAU_M = 0.42;                 // mano apoyada: dedos hacia delante, inclinados sobre la vertical
  const LT = 22 * 2.6 * S;            // del centro de la mano abierta a la yema del dedo medio (px)
  const MR = 13 * 2.6 * S;            // del centro de la mano a la muñeca (px)

  const T = {
    reto: 0.42,
    p1: [0.95, 1.32, 1.4, 1.56, 1.7, 1.9],          // palmada 1: baja, abajo, despega, palmada, apoya, asentado
    p2: [1.98, 2.35, 2.43, 2.59, 2.73, 2.93],
    una0: 3.02, una1: 3.5,                           // pasa a una mano (la lejana, a la espalda)
    u1: [3.62, 3.97, 4.32],                          // flexión a una mano: baja, abajo, arriba
    u2: [4.42, 4.75, 5.22, 5.52],                    // baja, abajo (y se queda), guiña, sube
    guino: 4.86,
    gPique: 4.92, gCam: 5.3, gInspira: 5.55, gBaja0: 5.78, gMedio: 6.55, gIntenta0: 6.92, gIntenta1: 7.1, gCede: 7.34,
    gCae0: 7.46, gCae1: 7.6,
    yRie0: 7.66, yRie1: 8.2,
    yMano0: 8.2, yPulgar: 8.48, yMano1: 8.98, yApoya1: 9.22,
    gLevanta0: 8.42, gLevanta1: 8.72, gAgacha: 8.98, gSalta: 9.16, gAterriza: 9.7,
    r1: [9.98, 10.33, 10.7], r2: [10.8, 11.15, 11.52], r3: [11.62, 11.97, 12.34],
    gPulgar0: 11.18, gPulgar1: 11.5,
    camara: 12.42, fin: 13.98
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function guion(lista, dic, base, t) {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const D5 = (pu, ix, md, an, me) => ({ pulgar: pu, indice: ix, medio: md ?? ix, anular: an ?? ix, menique: me ?? ix });
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const mezD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const PUNO = D5(0, 0), PLANA = D5(0.85, 1), PALMA = D5(0.6, 1), PULGAR = D5(1, 0), LACIA = D5(0.7, 0.85, 0.8, 0.75, 0.7);
  function claves(lista, t) {
    if (t <= lista[0][0]) return lista[0].slice(1);
    for (let i = 1; i < lista.length; i++) if (t < lista[i][0]) {
      const a = lista[i - 1], b = lista[i], k = (b.f || suave)(fase(t, a[0], b[0]));
      return a.slice(1).map((v, j) => lerp(v, b[j + 1], k));
    }
    return lista[lista.length - 1].slice(1);
  }
  const KF = (arr, f) => { arr.f = f; return arr; };

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0.15, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.2,
    lengua: 0, esp: 0, mof: 0, rub: 0, wd: 0, wi: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: clamp(e.mx, -1, 1), y: clamp(e.my, -1, 1) }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }
  const CY = {
    mira: E({ mx: 0.9, my: 0.1, c: 0.25, abre: 2, ancho: 0.95, sonr: 0.5 }),
    reto: E({ mx: 0.9, my: 0, c: 0.35, h: 0.2, sd: 16, gd: 0.1, si: -4, gi: -0.08, abre: 4, ancho: 1.05, sonr: 0.95 }),
    concentra: E({ mx: 0.5, my: 0.25, c: 0.4, abre: 5, ancho: 0.95, sonr: 0.7 }),
    palmada: E({ mx: 0.3, my: 0, c: 0.15, h: 0.2, sd: 10, si: 10, abre: 18, ancho: 1.05, sonr: 1 }),
    chulo: E({ mx: -0.85, my: 0, c: 0.35, h: 0.25, sd: 6, si: -2, abre: 5, ancho: 1, sonr: 0.95 }),
    guino: E({ mx: -0.85, my: 0, c: 0.05, h: 0, wd: 0.98, sd: -10, gd: -0.1, si: 14, gi: 0.08, abre: 7, ancho: 1.08, sonr: 1, mof: 0.3 }),
    anima: E({ mx: 0.9, my: 0.2, c: 0.2, sd: 14, gd: 0.08, si: 14, gi: 0.08, abre: 6, ancho: 0.95, sonr: 0.6 }),
    risa: E({ mx: 0.7, my: 0.2, c: 1, h: 1, abre: 28, ancho: 1.05, sonr: 1 }),
    invita: E({ mx: 0.9, my: 0.25, c: 0.2, h: 0.2, sd: 18, gd: 0.1, si: 18, gi: 0.1, abre: 10, ancho: 1, sonr: 0.95 }),
    uf: E({ mx: 0.2, my: -0.3, c: 0.75, z: 0.5, sd: 8, si: 8, abre: 16, ancho: 0.85, sonr: 0.1, mof: 0.5 }),
    facil: E({ mx: -0.5, my: -0.1, c: 0.35, h: 0.3, abre: 4, ancho: 1, sonr: 0.85 }),
    camara: E({ mx: -0.85, my: 0, c: 0.25, h: 0.3, sd: 14, gd: 0.08, si: 6, abre: 12, ancho: 1.05, sonr: 1 })
  };
  const LY = [
    [T.reto, T.reto + 0.2, "reto"], [T.p1[0], T.p1[0] + 0.2, "concentra"], [T.p1[2] - 0.04, T.p1[2] + 0.06, "palmada"],
    [T.p1[5] - 0.06, T.p1[5] + 0.08, "concentra"], [T.p2[2] - 0.04, T.p2[2] + 0.06, "palmada"], [T.p2[5] - 0.05, T.p2[5] + 0.15, "chulo"],
    [T.u1[0], T.u1[0] + 0.15, "concentra"], [T.u2[1] - 0.05, T.u2[1] + 0.1, "chulo"], [T.guino, T.guino + 0.08, "guino"],
    [T.u2[2] - 0.12, T.u2[2], "chulo"], [T.u2[3] + 0.05, T.u2[3] + 0.25, "mira"], [6.6, 6.85, "anima"],
    [T.yRie0, T.yRie0 + 0.08, "risa"], [T.yMano0 + 0.05, T.yMano0 + 0.2, "invita"], [T.yApoya1 - 0.1, T.yApoya1 + 0.05, "mira"],
    [T.gAterriza, T.gAterriza + 0.05, "uf"], [T.gAterriza + 0.25, T.gAterriza + 0.4, "facil"], [T.camara, T.camara + 0.2, "camara"]
  ];
  const CG = {
    seguro: E({ mx: 0.9, my: 0.1, c: 0.2, sd: 4, si: 4, abre: 2, ancho: 0.95, sonr: 0.55 }),
    pasma: E({ mx: 0.9, my: 0, iris: 0.85, c: 0, sd: 22, gd: 0.14, si: 22, gi: 0.14, abre: 20, ancho: 0.75, sonr: -0.05 }),
    pasma2: E({ mx: 0.9, my: 0.1, iris: 0.75, c: 0, sd: 28, gd: 0.18, si: 28, gi: 0.18, abre: 30, ancho: 0.72, sonr: -0.1 }),
    ceno: E({ mx: 0.9, my: 0, c: 0.4, sd: -8, gd: -0.22, si: -8, gi: -0.22, abre: 2, ancho: 0.75, sonr: -0.25 }),
    pique: E({ mx: 0.9, my: 0, c: 0.5, z: 0.2, sd: -10, gd: -0.26, si: -10, gi: -0.26, abre: 10, ancho: 1.05, sonr: -0.4 }),
    decidido: E({ mx: -0.85, my: 0, c: 0.4, sd: -6, gd: -0.2, si: -6, gi: -0.2, abre: 3, ancho: 0.9, sonr: 0.45 }),
    inspira: E({ mx: -0.6, my: 0.1, c: 0.45, sd: -4, gd: -0.15, si: -4, gi: -0.15, abre: 0, ancho: 0.6, sonr: 0, mof: 1 }),
    esfuerzo: E({ mx: 0.3, my: 0.4, c: 1, z: 1, sd: -6, gd: -0.2, si: -6, gi: -0.2, abre: 10, ancho: 1.05, sonr: -0.35 }),
    agonia: E({ mx: 0.3, my: 0.3, c: 0.9, z: 1, sd: 10, gd: 0.2, si: 10, gi: 0.2, abre: 14, ancho: 1.12, sonr: -0.6, mof: 0.3 }),
    uy: E({ mx: 0, my: -0.3, iris: 0.7, c: 0, sd: 26, gd: 0.2, si: 26, gi: 0.2, abre: 22, ancho: 0.8, sonr: -0.5 }),
    aplastado: E({ mx: 0, my: 0, c: 1, z: 0.7, sd: 6, si: 6, abre: 10, ancho: 1.2, sonr: -0.35, lengua: 0.8, mof: 1 }),
    mareo: E({ mx: 0, my: 0, esp: 0.85, sd: 14, gd: 0.18, si: -4, gi: -0.08, abre: 9, ancho: 0.85, sonr: -0.15, lengua: 0.7, mof: 0.4 }),
    ilusion: E({ mx: 0.9, my: -0.2, iris: 1.1, c: 0, sd: 24, gd: 0.1, si: 24, gi: 0.1, abre: 16, ancho: 1, sonr: 0.95 }),
    yupi: E({ mx: 0.6, my: -0.4, c: 0.1, h: 0.4, sd: 26, si: 26, abre: 26, ancho: 1.05, sonr: 1 }),
    lacio: E({ mx: 0, my: 0.2, esp: 0.6, sd: 10, gd: 0.1, si: -4, abre: 8, ancho: 0.85, sonr: 0.1, lengua: 0.5 }),
    gusto: E({ mx: 0.4, my: -0.2, c: 0.75, h: 0.85, sd: 6, si: 6, abre: 4, ancho: 1, sonr: 0.95 }),
    pulgar: E({ mx: -0.85, my: 0, c: 0.2, h: 0.35, sd: 14, gd: 0.08, si: 14, gi: 0.08, abre: 14, ancho: 1.05, sonr: 1, rub: 0.35 })
  };
  const LG = [
    [T.p1[3] - 0.08, T.p1[3] + 0.02, "pasma"], [T.p2[3] - 0.08, T.p2[3] + 0.02, "pasma2"], [3.25, 3.5, "ceno"],
    [T.gPique, T.gPique + 0.1, "pique"], [T.gCam, T.gCam + 0.15, "decidido"], [T.gInspira, T.gInspira + 0.15, "inspira"],
    [T.gBaja0 + 0.05, T.gBaja0 + 0.2, "esfuerzo"], [T.gMedio, T.gMedio + 0.2, "agonia"], [T.gIntenta0, T.gIntenta0 + 0.08, "esfuerzo"],
    [T.gCede, T.gCede + 0.08, "agonia"], [T.gCae0, T.gCae0 + 0.06, "uy"], [T.gCae1, T.gCae1 + 0.03, "aplastado"],
    [7.95, 8.15, "mareo"], [T.gLevanta0, T.gLevanta0 + 0.15, "ilusion"], [T.gAgacha + 0.05, T.gAgacha + 0.12, "yupi"],
    [T.gAterriza, T.gAterriza + 0.04, "aplastado"], [T.gAterriza + 0.12, T.gAterriza + 0.3, "lacio"], [10.55, 10.8, "gusto"],
    [T.gPulgar0, T.gPulgar0 + 0.18, "pulgar"]
  ];
  const PARP_Y = [0.28, 2.95, 6.15, 9.32, 10.95, 13.05], PARP_G = [0.75, 3.85, 12.05, 13.45];

  /* ---------- marco del cuerpo en el mundo (como en 00115) ---------- */
  function nuevaP(R, espejo) {
    const p = { x: 0, suelo: 0, s: S, espejo, tirasLimpias: true, pelvis: { x: R.PELVIS.x, y: R.PELVIS.y }, torso: 0, torsoEsc: { x: 1, y: 1 },
      piernas: { cerca: { tob: P(R.CADERA.cerca.x, R.SUELO - R.TOBILLO_ALTO), ang: 0 }, lejos: { tob: P(R.CADERA.lejos.x, R.SUELO - R.TOBILLO_ALTO), ang: 0 } },
      cabeza: { ang: 0, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    if (R === G) { p.hombrosContinuos = true; p.hombrosRecortados = true; }
    return p;
  }
  function marco(R, p, phi, W) {
    const Pp = R.aPantalla(p, p.pelvis);
    return { phi, W, Pp, aMundo: q => add(W, rot(sub(q, Pp), phi)), aRig: q => add(Pp, rot(sub(q, W), -phi)) };
  }
  function dirHoja(p, M, d) { const r = rot(d, -M.phi); if (p.espejo) r.x = -r.x; return r; }
  const enMundo = (Q, q) => Q.M.aMundo(Q.R.aPantalla(Q.p, q));
  const vecMundo = (Q, v) => sub(enMundo(Q, v), enMundo(Q, P(0, 0)));        // vector de la hoja → mundo
  const aHojaM = (Q, w) => Q.R.aHoja(Q.p, Q.M.aRig(w));
  const hombroH = (Q, lado) => Q.R.tronco(Q.p)(lado === "cerca" ? Q.R.HOMBRO_C : Q.R.HOMBRO);
  const hombroM = (Q, lado) => enMundo(Q, hombroH(Q, lado));
  const cuelloM = Q => enMundo(Q, Q.R.tronco(Q.p)(Q.R.CUELLO));
  const largoBrazo = (R, lado) => lado === "cerca" ? R.BRAZO_C_L : R.BRAZO_L;
  const LP = R => (R.A.datos.piezas.pierna_cerca.largo + R.A.datos.piezas.pierna_lejos.largo) / 2 * S * R.K;
  const ejeDe = phi => P(Math.sin(phi), -Math.cos(phi));                     // de los pies a la cabeza (mundo)
  // cabeza: inclinación visible v (+ hacia donde mira) → giro de la cabeza en la hoja
  const angCabeza = (p, phi, v) => p.espejo ? phi + v : v - phi;

  /* El cuerpo de lado: girado alrededor de la pelvis, con el tronco estrecho (de perfil) y las
   * piernas rectas hasta la punta del pie apoyada en (Xp, FY). alfa: inclinación sobre el suelo. */
  function cuerpo(R, espejo, Xp, alfa, ey) {
    const sg = espejo ? -1 : 1, phi = sg * (Math.PI / 2 - alfa), b = ejeDe(phi);
    const p = nuevaP(R, espejo); p.torsoEsc = { x: EX, y: ey ?? 1 };
    const Q0 = { R, p, M: marco(R, p, phi, P(0, 0)) };
    const pie = P(sg * Math.sin(alfa + 0.12), Math.cos(alfa + 0.12));             // del tobillo a la punta: hacia el suelo
    const dh = dirHoja(p, Q0.M, pie), ang = Math.atan2(dh.y, dh.x);
    const A = sub(P(Xp, FY), vecMundo(Q0, rot(R.PUNTA, ang)));
    const W = add(A, mul(b, LP(R) * 0.985));
    const Q = { R, p, M: marco(R, p, phi, W), b, sg, alfa, A };
    p.piernas.cerca = { tob: aHojaM(Q, A), ang };
    p.piernas.lejos = { tob: aHojaM(Q, add(A, mul(b, -5))), ang };
    return Q;
  }

  /* ---------- manos (del mundo a la hoja) ---------- */
  // mano con centro c (mundo); haciaCodo: dirección (mundo) de la mano al codo; esp: espejo de la mano (en la hoja)
  function manoM(Q, c, haciaCodo, esp, extra) {
    const h = aHojaM(Q, c), u = dirHoja(Q.p, Q.M, norm(haciaCodo));
    return Object.assign({ x: h.x, y: h.y, mu: Math.atan2(u.y, u.x), ang: 0, puno: 1, espejo: esp }, extra);
  }
  // espejo de la mano con el que el pulgar sale hacia `pulgar` (mundo)
  function espPulgar(Q, haciaCodo, pulgar) {
    const u = dirHoja(Q.p, Q.M, norm(haciaCodo)), d = dirHoja(Q.p, Q.M, pulgar);
    return (-u.y * d.x + u.x * d.y) < 0;
  }
  // mano apoyada: yema del dedo medio en (X, FY); dedos hacia delante (sg) inclinados tau sobre la vertical
  function apoyada(Q, X, tau, esp, extra) {
    const df = P(Q.sg * Math.sin(tau), Math.cos(tau));
    return manoM(Q, P(X - df.x * LT, FY - df.y * LT), mul(df, -1), esp, Object.assign({ dedos: PLANA, dobla: -1 }, extra));
  }
  function mezMano(a, b, k, sg) {
    if (k <= 0) return a; if (k >= 1) return b;
    const o = Object.assign({}, k < 0.5 ? a : b);
    o.x = lerp(a.x, b.x, k); o.y = lerp(a.y, b.y, k);
    o.mu = sg ? angDir(a.mu, b.mu, k, sg) : lerpAng(a.mu, b.mu, k);
    o.puno = lerp(a.puno ?? 1, b.puno ?? 1, k);
    o.dedos = mezD(a.dedos || PUNO, b.dedos || PUNO, k);
    o.dobla = a.dobla;          // el codo solo cambia de lado al llegar (las posturas de cambio llevan el brazo estirado)
    return o;
  }
  // pista de una mano: [t, fn(Q, t), sentido de giro, curva]
  function pista(lista, Q, t) {
    if (t <= lista[0][0]) return lista[0][1](Q, t);
    for (let i = 1; i < lista.length; i++) if (t < lista[i][0]) {
      const a = lista[i - 1], b = lista[i];
      if (a[1] === b[1]) return a[1](Q, t);
      const k = (b[3] || suave)(fase(t, a[0], b[0]));
      return mezMano(a[1](Q, t), b[1](Q, t), k, b[2]);
    }
    return lista[lista.length - 1][1](Q, t);
  }
  function alcance(Q, lado) {
    const R = Q.R, m = lado === "cerca" ? Q.p.manoCerca : Q.p.manoLejos; if (!m) return 0;
    const mu = m.mu ?? -1.75, w = P(m.x + Math.cos(mu) * R.MUNECA_R * R.JK, m.y + Math.sin(mu) * R.MUNECA_R * R.JK);
    return len(sub(w, hombroH(Q, lado))) / largoBrazo(R, lado);
  }

  /* ---------- geometría de la plancha de cada uno (se calcula una vez) ----------
   * arriba: el brazo cercano (el de arriba) casi estirado hasta su mano; arriba1: igual con el
   * lejano (a una mano); abajo: los hombros a un palmo del suelo; plano: tumbado en el suelo. */
  let GEO = null;
  function geo() {
    if (GEO) return GEO;
    GEO = {};
    for (const [k, R, esp, Xp] of [["y", Y, false, XPY], ["g", G, true, XPG]]) {
      const sg = esp ? -1 : 1, ct = Math.cos(TAU_M);
      // arriba el brazo va vertical (la muñeca bajo el hombro) y la mano se dobla hacia delante
      const alc = lado => 0.96 * largoBrazo(R, lado) * S + ct * (MR + LT);
      const hom = (a, lado) => hombroM(cuerpo(R, esp, Xp, a), lado);
      const busca = f => { let lo = 0, hi = 1.3; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (f(m)) hi = m; else lo = m; } return (lo + hi) / 2; };
      const arriba = busca(a => FY - hom(a, "cerca").y > alc("cerca"));
      const arriba1 = busca(a => FY - hom(a, "lejos").y > alc("lejos"));
      const abajo = busca(a => FY - hom(a, "cerca").y > 74);
      const plano = busca(a => FY - hom(a, "lejos").y > 14);
      const hc = hom(arriba, "cerca"), XC = hc.x + sg * (Math.sin(TAU_M) * (MR + LT) - 3);
      const hl = hom(arriba1, "lejos"), XU = hl.x + sg * (Math.sin(0.25) * (MR + LT) - 6);     // a una mano
      GEO[k] = { arriba, arriba1, abajo, plano, XC, XL: XC + sg * 10, XU };
    }
    return GEO;
  }

  /* =====================================================================================
   * YORGI (a la izquierda, mira a la derecha)
   * ===================================================================================== */
  const KB_Y = (() => {
    const L = [[0, 0], [T.p1[0], 0]];
    for (const [d0, d1, e1, cl, l0, l1] of [T.p1, T.p2]) {
      if (d0 !== T.p1[0]) L.push([d0, 0]);
      L.push([d1, 1], KF([e1 + 0.05, -0.35], salida), KF([cl, -0.62], salida), KF([l0, -0.04], entrada), KF([l0 + 0.08, 0.32], salida), [l1, 0]);
    }
    L.push([T.u1[0], 0], [T.u1[1], 0.8], [T.u1[2], 0], [T.u2[0], 0], [T.u2[1], 0.86], [T.u2[2], 0.86], [T.u2[3], 0],
      [T.gAterriza, 0], KF([T.gAterriza + 0.09, 0.35], salida), [T.r1[0], 0]);
    for (const [, b, c] of [T.r1, T.r2, T.r3]) L.push([b, 0.92], [c, 0]);
    L.push([DUR, 0]);
    return L;
  })();
  const bY = t => claves(KB_Y, t)[0] + 0.03 * Math.sin(t * 2.4);
  const unaY = t => dentro(t, T.una0, T.una1, T.yMano1, T.yApoya1);        // a una mano (el «arriba» es el del brazo lejano)
  function alfaY(t) {
    const g = geo().y, b = bY(t), top = lerp(g.arriba, g.arriba1, unaY(t));
    return b < 0 ? top - b * (top - g.abajo) * 0.9 : lerp(top, g.abajo, b);
  }
  const cuerpoY = t => cuerpo(Y, false, XPY, alfaY(t));

  // posturas de cada mano de Yorgi
  const YC_SUELO = (Q, t) => apoyada(Q, geo().y.XC, TAU_M, false);
  const YL_SUELO = (Q, t) => apoyada(Q, geo().y.XL, TAU_M, false);
  const YL_UNA = (Q, t) => apoyada(Q, geo().y.XU, 0.25, false);
  const palmadaY = Q => add(hombroM(Q, "lejos"), P(22, 34));
  const YC_PALMA = (Q, t) => manoM(Q, add(palmadaY(Q), P(-2, -5)), P(-1, -0.35), false, { dobla: -1, dedos: PALMA });
  const YL_PALMA = (Q, t) => manoM(Q, add(palmadaY(Q), P(2, 5)), P(-1, 0.2), false, { dobla: -1, dedos: PALMA });
  const YC_ALZA = (Q, t) => manoM(Q, add(hombroM(Q, "cerca"), P(30, 70)), P(-0.7, -0.7), false, { dobla: -1, dedos: PALMA });
  const YL_ALZA = (Q, t) => manoM(Q, add(hombroM(Q, "lejos"), P(34, 54)), P(-0.75, -0.6), false, { dobla: -1, dedos: PALMA });
  // la mano cercana a la espalda (sobre los riñones) y el pulgar de «súbete»
  const YC_ESPALDA = (Q, t) => {
    const nU = P(-Math.sin(Q.alfa), -Math.cos(Q.alfa));
    return manoM(Q, add(add(Q.M.W, mul(Q.b, 14)), mul(nU, 24)), add(mul(nU, 0.75), mul(Q.b, 0.66)), false, { dobla: -1, dedos: D5(0.3, 0.75, 0.7, 0.65, 0.6) });
  };
  const YC_SUBE = (Q, t) => manoM(Q, add(hombroM(Q, "cerca"), P(-40, -62)), P(0.55, 0.84), false, { dobla: -1, dedos: D5(0.5, 0.4) });
  const YC_PULGAR = (Q, t) => {
    const tir = 10 * (campana(t, T.yPulgar, T.yPulgar + 0.16) + campana(t, T.yPulgar + 0.2, T.yPulgar + 0.36));
    const dirP = norm(P(-0.75, 0.66)), codo = norm(P(0.55, 0.84));
    const c = add(add(hombroM(Q, "cerca"), P(-46, -62)), mul(dirP, tir));
    return manoM(Q, c, codo, espPulgar(Q, codo, dirP), { dobla: -1, dedos: PULGAR });
  };
  const PISTA_YC = [
    [0, YC_SUELO],
    [T.p1[2], YC_SUELO], [T.p1[2] + 0.07, YC_ALZA, 0], [T.p1[3], YC_PALMA], [T.p1[3] + 0.07, YC_ALZA], [T.p1[4], YC_SUELO],
    [T.p2[2], YC_SUELO], [T.p2[2] + 0.07, YC_ALZA, 0], [T.p2[3], YC_PALMA], [T.p2[3] + 0.07, YC_ALZA], [T.p2[4], YC_SUELO],
    [T.una0 + 0.14, YC_SUELO], [T.una0 + 0.32, YC_SUBE], [T.una1, YC_ESPALDA],
    [T.yMano0, YC_ESPALDA], [T.yMano0 + 0.14, YC_SUBE], [T.yPulgar - 0.04, YC_PULGAR],
    [T.yMano1, YC_PULGAR], [T.yApoya1, YC_SUELO], [DUR, YC_SUELO]
  ];
  const PISTA_YL = [
    [0, YL_SUELO],
    [T.p1[2], YL_SUELO], [T.p1[2] + 0.07, YL_ALZA], [T.p1[3], YL_PALMA], [T.p1[3] + 0.07, YL_ALZA], [T.p1[4], YL_SUELO],
    [T.p2[2], YL_SUELO], [T.p2[2] + 0.07, YL_ALZA], [T.p2[3], YL_PALMA], [T.p2[3] + 0.07, YL_ALZA], [T.p2[4], YL_SUELO],
    [T.una0, YL_SUELO], [T.una0 + 0.2, YL_UNA],
    [T.yMano1, YL_UNA], [T.yApoya1, YL_SUELO], [DUR, YL_SUELO]
  ];
  function poseY(t) {
    const Q = cuerpoY(t), p = Q.p;
    p.manoCerca = pista(PISTA_YC, Q, t);
    p.manoLejos = pista(PISTA_YL, Q, t);
    // la cabeza, levantada mirando al frente; risa: se sacude; al guiñar, la ladea
    const risa = dentro(t, T.yRie0, T.yRie0 + 0.1, T.yRie1 - 0.15, T.yRie1);
    const v = 0.1 + 0.05 * risa * Math.sin(t * 26) - 0.12 * dentro(t, T.guino - 0.1, T.guino + 0.05, T.u2[2] - 0.15, T.u2[2])
      - 0.1 * dentro(t, T.camara, T.camara + 0.3, DUR, DUR + 1) - 0.1 * dentro(t, T.yMano0 + 0.1, T.yMano0 + 0.25, T.yMano1, T.yMano1 + 0.2)
      + 0.08 * campana(t, T.gAterriza, T.gAterriza + 0.3);
    p.cabeza.ang = angCabeza(p, Q.M.phi, v);
    p.cara = cara(guion(LY, CY, "mira", t), parpadeo(t, PARP_Y));
    return Q;
  }

  /* =====================================================================================
   * GUILLERMO en plancha (a la derecha, mira a la izquierda)
   * ===================================================================================== */
  const KG = [
    [0, 0], [T.gInspira, 0], [T.gBaja0, -0.08],
    [6.02, 0.2], [6.14, 0.24], [6.38, 0.4], [T.gMedio, 0.52],
    [T.gIntenta0, 0.52], [T.gIntenta1, 0.42], [T.gCede, 0.58], [T.gCae0, 0.6],
    KF([T.gCae1, 1.3], entrada), KF([T.gCae1 + 0.07, 1.22], salida), [T.gCae1 + 0.16, 1.3],
    [T.gLevanta0, 1.3], [T.gLevanta1, 0.95], [T.gAgacha, 1.02], KF([T.gSalta, -0.45], salida)
  ];
  const tiembla = t => dentro(t, T.gBaja0 + 0.1, T.gMedio, T.gCae0, T.gCae0 + 0.06) * (0.5 + 0.5 * tramo(t, T.gMedio - 0.2, T.gMedio + 0.2));
  const plafG = t => dentro(t, T.gCae0 + 0.06, T.gCae1, T.gLevanta0, T.gLevanta1);    // brazos espatarrados hacia delante
  function alfaG(t) {
    const g = geo().g, b = claves(KG, t)[0] + 0.012 * tiembla(t) * ruido(t * 31) + 0.02 * Math.sin(t * 2.1 + 1);
    if (b < 0) return g.arriba - b * (g.arriba - g.abajo) * 0.9;
    return b <= 1 ? lerp(g.arriba, g.abajo, b) : lerp(g.abajo, g.plano, (b - 1) / 0.3);
  }
  const GC_SUELO = (Q, t) => { const k = plafG(t), g = geo().g; return apoyada(Q, g.XC - 70 * k, lerp(TAU_M, 1.3, k), false); };
  const GL_SUELO = (Q, t) => { const k = plafG(t), g = geo().g; return apoyada(Q, g.XL - 58 * k, lerp(TAU_M, 1.3, k), false); };
  const GC_ALZA = (Q, t) => manoM(Q, add(hombroM(Q, "cerca"), P(-70, -40)), P(0.8, 0.6), false, { dobla: -1, dedos: PUNO });
  const GL_ALZA = (Q, t) => manoM(Q, add(hombroM(Q, "lejos"), P(-66, -24)), P(0.85, 0.5), false, { dobla: -1, dedos: PUNO });
  const PISTA_GC = [[0, GC_SUELO], [T.gAgacha + 0.08, GC_SUELO], [T.gSalta, GC_ALZA, 0, salida], [DUR, GC_ALZA]];
  const PISTA_GL = [[0, GL_SUELO], [T.gAgacha + 0.08, GL_SUELO], [T.gSalta, GL_ALZA, 0, salida], [DUR, GL_ALZA]];
  const CHIN_G = P(790, 850);
  function caraG(p, t) {
    p.rojo = 0.85 * dentro(t, 5.95, 7.0, 7.8, 8.8);
    p.sudor = dentro(t, 6.2, 7.2, 8.1, 9.4);
    p.enfado = dentro(t, T.gPique, T.gPique + 0.15, T.gInspira, T.gInspira + 0.3);
    p.cara = cara(guion(LG, CG, "seguro", t), parpadeo(t, PARP_G));
  }
  const vG = t => 0.1 + 0.03 * tiembla(t) * ruido(t * 29 + 3) + 0.15 * tramo(t, T.gCae0, T.gCae1) * (1 - tramo(t, T.gLevanta0, T.gLevanta1))
    - 0.15 * tramo(t, T.gLevanta0, T.gLevanta1) * (1 - tramo(t, T.gAgacha, T.gSalta));
  function poseGPlancha(t) {
    const Q = cuerpo(G, true, XPG, alfaG(t)), p = Q.p;
    p.manoCerca = pista(PISTA_GC, Q, t);
    p.manoLejos = pista(PISTA_GL, Q, t);
    // cabeza: tiembla con el esfuerzo; al caer, la barbilla da en el suelo y la cara se aplasta
    const aplasta = tramo(t, T.gCae1 - 0.03, T.gCae1 + 0.02) * (1 - tramo(t, T.gLevanta0, T.gLevanta1));
    const golpe = Math.exp(-Math.max(0, t - T.gCae1) * 9) * tramo(t, T.gCae1 - 0.03, T.gCae1 + 0.01);
    p.cabeza.ang = angCabeza(p, Q.M.phi, vG(t));
    p.cabeza.esc = { x: 1 + 0.1 * aplasta + 0.1 * golpe, y: 1 - 0.1 * aplasta - 0.12 * golpe };
    if (aplasta > 0) {
      const ch = enMundo(Q, G.cabeza(p).a(CHIN_G)), d = dirHoja(p, Q.M, P(0, aplasta * (FY + 2 - ch.y) / S));
      p.cabeza.dx = d.x; p.cabeza.dy = d.y;
    }
    caraG(p, t);
    return Q;
  }

  /* =====================================================================================
   * GUILLERMO: el saltito y a caballito (sentado como un jinete en la espalda de Yorgi)
   * ===================================================================================== */
  // asiento: lo alto de la espalda de Yorgi; Guillermo lo sigue con un poco de retraso (rebota)
  const ASIENTO = 90;                          // px de la pelvis de Yorgi hacia sus hombros
  function asiento(t) {
    const q = cuerpoY(t), nU = P(-Math.sin(q.alfa), -Math.cos(q.alfa));
    return add(add(q.M.W, mul(q.b, ASIENTO)), mul(nU, 18));
  }
  function anclaG(t) {
    const a = asiento(t - 0.06), b = asiento(t - 0.13), d = sub(a, b);
    return { W: add(add(a, mul(d, 0.45)), P(0, -8)), phi: -0.05 + 0.012 * d.y };
  }
  // sentado en lo alto de la espalda de Yorgi (mirando hacia sus pies, como siempre): tronco derecho y
  // de frente; las piernas cuelgan por el otro lado de Yorgi (se pintan antes que él) y las espinillas y
  // las zapatillas asoman bajo su pecho, entre su cadera y su brazo
  function poseGMonta(t, Wf, phif) {
    const R = G, p = nuevaP(R, true);
    const an = anclaG(t), W = Wf || an.W, lac = 1 - tramo(t, 10.4, 10.9);          // lacio al principio
    const sw = Math.sin(t * 7.2 + 0.6) * (0.35 + 0.65 * Math.exp(-Math.max(0, t - T.gAterriza) * 1.6));
    const phi = phif ?? an.phi + 0.05 * lac * sw;
    const Q = { R, p, M: marco(R, p, phi, W), sg: -1 };
    const at = Math.exp(-Math.max(0, t - T.gAterriza) * 10) * tramo(t, T.gAterriza - 0.02, T.gAterriza + 0.02);
    p.torsoEsc = { x: 1 + 0.05 * at, y: 1 - 0.08 * at };
    const T_ = R.tronco(p);
    for (const lado of ["cerca", "lejos"]) {
      const cadM = enMundo(Q, T_(R.CADERA[lado])), lj = lado === "lejos";
      const tob = add(cadM, P((lj ? 22 : -2) + 5 * sw, (lj ? 112 : 118) + 3 * sw));
      tob.y = Math.min(tob.y, FY - 36);
      p.piernas[lado] = { tob: aHojaM(Q, tob), ang: 0.12 + 0.12 * sw * (lj ? 1.2 : 1) };
    }
    // mano lejana en jarra; la cercana cuelga (lacia) y luego saca el pulgar delante del pecho
    const hl = hombroM(Q, "lejos"), hc = hombroM(Q, "cerca"), cadL = enMundo(Q, T_(R.CADERA.lejos));
    const jarra = add(cadL, P(-4, -32));
    p.manoLejos = manoM(Q, jarra, norm(add(sub(hl, jarra), P(-40, 0))), false, { dobla: 1, dedos: D5(0.2, 0.25) });
    const codo = P(1, 0.04), ep = espPulgar(Q, codo, P(0, -1));
    const cuelga = manoM(Q, add(hc, P(6 + 4 * sw, largoBrazo(R, "cerca") * S * 0.9 + MR)), P(-0.05, -1), ep, { dobla: -1, dedos: LACIA });
    const pul = manoM(Q, add(hc, P(-54, 54)), codo, ep, { dobla: -1, dedos: PULGAR });     // antebrazo horizontal
    p.manoCerca = mezMano(cuelga, pul, tramo(t, T.gPulgar0, T.gPulgar1));
    // cabeza: lacia y mareada al caer; luego derecha y, con el pulgar, mirando a cámara
    const v = -0.2 * lac + 0.06 * sw * lac + 0.05 * tramo(t, T.gPulgar0, T.gPulgar1);
    p.cabeza.ang = angCabeza(p, phi, v);
    p.cabeza.esc = { x: 1 + 0.05 * at, y: 1 - 0.07 * at };
    p.sudor = 0.3 * (1 - tramo(t, T.gAterriza, T.gAterriza + 0.6));
    p.cara = cara(guion(LG, CG, "seguro", t), parpadeo(t, PARP_G));
    Q.v = v;
    return Q;
  }
  // el saltito: de la plancha (en gSalta) a sentarse en la espalda de Yorgi, encogido
  let SAL = null;
  const salida0 = () => SAL || (SAL = poseGPlancha(T.gSalta));
  function trayecto(t) {
    const Q0 = salida0(), f = fase(t, T.gSalta, T.gAterriza), s = lerp(f, suave(f), 0.35), B = anclaG(t).W, A = Q0.M.W;
    const C = P(lerp(A.x, B.x, 0.5), Math.min(A.y, B.y) - 70);
    return P((1 - s) * (1 - s) * A.x + 2 * s * (1 - s) * C.x + s * s * B.x, (1 - s) * (1 - s) * A.y + 2 * s * (1 - s) * C.y + s * s * B.y);
  }
  function poseGVuelo(t) {
    const Q0 = salida0(), an = anclaG(t), f = fase(t, T.gSalta, T.gAterriza);
    const kA = suave(fase(f, 0, 0.42)), kB = suave(fase(f, 0.55, 1));
    const phi = lerp(lerp(Q0.M.phi, -0.1, kA), an.phi, kB), W = trayecto(t);
    const Qm = poseGMonta(t, W, phi), p = Qm.p, p0 = Q0.p, T_ = G.tronco(p);
    p.torsoEsc = { x: lerp(EX, 1, tramo(f, 0.15, 0.8)), y: 1 + 0.06 * campana(t, T.gSalta, T.gSalta + 0.3) };
    // piernas encogidas (rodillas al pecho) y brazos arriba; al final, a sentarse
    for (const lado of ["cerca", "lejos"]) {
      const enc = { tob: add(T_(G.CADERA[lado]), P(lado === "cerca" ? 150 : 175, 245)), ang: 0.7 };
      const a = { tob: lerpP(p0.piernas[lado].tob, enc.tob, kA), ang: lerpAng(p0.piernas[lado].ang, enc.ang, kA) };
      p.piernas[lado] = { tob: lerpP(a.tob, p.piernas[lado].tob, kB), ang: lerpAng(a.ang, p.piernas[lado].ang, kB) };
    }
    const arriba = (h, L, a, dobla) => { const d = P(Math.sin(a), -Math.cos(a)), r = L * 0.97 + G.MUNECA_R * G.JK;
      return { x: h.x + d.x * r, y: h.y + d.y * r, mu: Math.atan2(-d.y, -d.x), ang: 0, puno: 1, espejo: false, dobla, dedos: PUNO }; };
    const arC = arriba(T_(G.HOMBRO_C), G.BRAZO_C_L * 0.9, -0.7, -1), arL = arriba(T_(G.HOMBRO), G.BRAZO_L, 0.7, 1);
    p.manoCerca = mezMano(mezMano(p0.manoCerca, arC, kA), p.manoCerca, kB);
    p.manoLejos = mezMano(mezMano(p0.manoLejos, arL, kA), p.manoLejos, kB);
    p.cabeza.ang = angCabeza(p, phi, lerp(lerp(vG(T.gSalta), 0, kA), Qm.v, kB));
    p.cabeza.esc = { x: 1, y: 1 };
    caraG(p, t);
    return Qm;
  }
  const poseG = t => t < T.gSalta ? poseGPlancha(t) : t < T.gAterriza ? poseGVuelo(t) : poseGMonta(t);

  /* =====================================================================================
   * DIBUJO
   * ===================================================================================== */
  const TIRA = Recortes.tira, PIEZA = Recortes.pieza, LEJANA = new Set(["pierna_lejos", "zapato_lejos", "pierna_cerca", "zapato"]);
  function dibuja(g, Q, t, sinLejana) {
    const { R, p, M } = Q;
    g.save(); g.translate(M.W.x, M.W.y); g.rotate(M.phi); g.translate(-M.Pp.x, -M.Pp.y);
    if (sinLejana) {
      const A = R.A;
      Recortes.tira = function (gg, AA, n) { return AA === A && LEJANA.has(n) ? [] : TIRA.apply(this, arguments); };
      Recortes.pieza = function (gg, AA, n) { return AA === A && LEJANA.has(n) ? undefined : PIEZA.apply(this, arguments); };
      try { R.dibujar(g, p, t); } finally { Recortes.tira = TIRA; Recortes.pieza = PIEZA; }
    } else R.dibujar(g, p, t);
    g.restore();
  }
  // a caballo: las piernas de Guillermo cuelgan por el otro lado de Yorgi (se pintan antes que él),
  // con el mismo dibujo que guillermo.js (zapato y luego la pierna, primero la lejana)
  function piernasDetras(g, Q) {
    const { R, p, M } = Q, A = R.A, PZ = A.datos.piezas;
    g.save(); g.translate(M.W.x, M.W.y); g.rotate(M.phi); g.translate(-M.Pp.x, -M.Pp.y);
    g.translate(p.x, p.suelo); g.scale(p.espejo ? -p.s : p.s, p.s); g.translate(-R.PELVIS.x, -R.SUELO);
    for (const lado of ["lejos", "cerca"]) {
      const q = p.piernas[lado], L = PZ["pierna_" + lado].largo;
      g.save(); g.translate(q.tob.x, q.tob.y); g.rotate(q.ang); Recortes.pieza(g, A, lado === "lejos" ? "zapato_lejos" : "zapato", PZ.zapato.pivote); g.restore();
      const c = Recortes.ik(R.tronco(p)(R.CADERA[lado]), q.tob, L, L * 0.5, 80, 1, 1.03); c.cuna = true; c.cunaAjustada = true;
      Recortes.tira(g, A, "pierna_" + lado, c, 18);
    }
    g.restore();
  }

  /* ---------- fondo (se pinta una vez) ---------- */
  let fondo = null;
  const HOR = 372;               // pie de la pared
  const VP = P(512, 300);        // punto de fuga del suelo
  function sieteSeg(g, x, y, d, h) {      // una cifra de 7 segmentos (solo 0 y 1 hacen falta, pero vale cualquiera)
    const SEG = [[0, 0, 1, 0], [1, 0, 1, 1], [1, 1, 1, 2], [0, 2, 1, 2], [0, 1, 0, 2], [0, 0, 0, 1], [0, 1, 1, 1]];
    const ON = { 0: [0, 1, 2, 3, 4, 5], 1: [1, 2], 2: [0, 1, 6, 4, 3], 7: [0, 1, 2] }[d];
    for (let i = 0; i < 7; i++) {
      const [a, b, c, e] = SEG[i];
      g.globalAlpha = ON.includes(i) ? 1 : 0.12;
      g.beginPath(); g.moveTo(x + a * h * 0.55, y + b * h * 0.5); g.lineTo(x + c * h * 0.55, y + e * h * 0.5); g.stroke();
    }
    g.globalAlpha = 1;
  }
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d");
    g.lineJoin = "round"; g.lineCap = "round";
    // pared: papel pintado burdeos con rayas y florecitas
    let gr = g.createLinearGradient(0, 0, 0, HOR);
    gr.addColorStop(0, "#1b0a0d"); gr.addColorStop(0.55, "#3b151a"); gr.addColorStop(1, "#2c1013");
    g.fillStyle = gr; g.fillRect(0, 0, W, HOR);
    for (let x = 0; x < W; x += 30) { g.fillStyle = "rgba(255,180,150,0.04)"; g.fillRect(x, 0, 12, 262); }
    g.fillStyle = "rgba(230,170,110,0.13)";
    for (let y = 18; y < 250; y += 36) for (let x = (y / 36 % 2) * 15 + 6; x < W; x += 30) {
      g.beginPath(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; g.ellipse(x + Math.cos(a) * 2.6, y + Math.sin(a) * 2.6, 2.2, 1.4, a, 0, TAU); } g.fill();
    }
    // zócalo de nogal con cuarterones
    g.fillStyle = "#2a170f"; g.fillRect(0, 262, W, HOR - 262);
    g.fillStyle = "#4a2c1b"; g.fillRect(0, 256, W, 10);
    g.fillStyle = "#1a0d08"; g.fillRect(0, 266, W, 3);
    for (let x = 10; x < W; x += 96) {
      g.strokeStyle = "#1a0d08"; g.lineWidth = 3; g.strokeRect(x, 282, 78, 72);
      g.strokeStyle = "rgba(160,100,60,0.35)"; g.lineWidth = 1.5; g.strokeRect(x + 3, 285, 72, 66);
    }
    g.fillStyle = "#170b06"; g.fillRect(0, HOR - 10, W, 10);
    // cuadros (sin nada escrito): un barco y una montaña
    const cuadro = (x, y, w, h, dib) => {
      g.save(); g.fillStyle = "#6b4a22"; g.fillRect(x - 7, y - 7, w + 14, h + 14); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(x - 7, y - 7, w + 14, h + 14);
      g.beginPath(); g.rect(x, y, w, h); g.clip(); dib(x, y, w, h); g.restore();
      g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x, y, w, h);
    };
    cuadro(300, 92, 92, 70, (x, y, w, h) => {
      g.fillStyle = "#30455a"; g.fillRect(x, y, w, h); g.fillStyle = "#1d3044"; g.fillRect(x, y + h * 0.62, w, h);
      g.fillStyle = "#e9dcc0"; g.beginPath(); g.moveTo(x + 44, y + 14); g.lineTo(x + 44, y + 40); g.lineTo(x + 22, y + 40); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(x + 48, y + 18); g.lineTo(x + 48, y + 40); g.lineTo(x + 66, y + 40); g.closePath(); g.fill();
      g.fillStyle = "#5a2a18"; g.beginPath(); g.moveTo(x + 20, y + 42); g.lineTo(x + 72, y + 42); g.lineTo(x + 64, y + 50); g.lineTo(x + 28, y + 50); g.closePath(); g.fill();
    });
    cuadro(436, 104, 70, 54, (x, y, w, h) => {
      g.fillStyle = "#b07a4a"; g.fillRect(x, y, w, h); g.fillStyle = "#3e5a3a";
      g.beginPath(); g.moveTo(x - 4, y + h); g.lineTo(x + 26, y + 18); g.lineTo(x + 40, y + 32); g.lineTo(x + 52, y + 22); g.lineTo(x + w + 4, y + h); g.closePath(); g.fill();
      g.fillStyle = "#f2d9a0"; g.beginPath(); g.arc(x + 54, y + 12, 6, 0, TAU); g.fill();
    });
    // apliques de pared encendidos
    const aplique = (x, y) => {
      const r = g.createRadialGradient(x, y, 4, x, y, 150);
      r.addColorStop(0, "rgba(255,200,120,0.45)"); r.addColorStop(0.35, "rgba(255,170,90,0.14)"); r.addColorStop(1, "rgba(255,150,80,0)");
      g.fillStyle = r; g.fillRect(x - 160, y - 160, 320, 320);
      g.fillStyle = "#8a6a2a"; g.fillRect(x - 3, y + 6, 6, 18); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x - 3, y + 6, 6, 18);
      g.fillStyle = "#ffe2a8"; g.beginPath(); g.moveTo(x - 16, y + 8); g.lineTo(x + 16, y + 8); g.lineTo(x + 10, y - 14); g.lineTo(x - 10, y - 14); g.closePath(); g.fill();
      g.strokeStyle = "#5b3a14"; g.lineWidth = 2; g.stroke();
    };
    aplique(212, 150); aplique(740, 132);
    // máquina del alcoholímetro (con cifras en su pantalla)
    {
      const x = 668, y = 178, w = 74, h = 194;
      g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse(x + w / 2, HOR + 2, w * 0.7, 7, 0, 0, TAU); g.fill();
      gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, "#7d1018"); gr.addColorStop(0.5, "#b8222c"); gr.addColorStop(1, "#6a0d14");
      g.fillStyle = gr; g.beginPath(); g.moveTo(x, y + 26); g.quadraticCurveTo(x + w / 2, y - 14, x + w, y + 26); g.lineTo(x + w, y + h); g.lineTo(x, y + h); g.closePath(); g.fill();
      g.strokeStyle = TINTA; g.lineWidth = 3; g.stroke();
      g.fillStyle = "#cfd3d8"; g.fillRect(x + 6, y + 30, w - 12, 6); g.fillRect(x + 6, y + h - 40, w - 12, 6);
      g.fillStyle = "#16090a"; g.fillRect(x + 12, y + 46, w - 24, 30); g.strokeStyle = "#cfd3d8"; g.lineWidth = 2; g.strokeRect(x + 12, y + 46, w - 24, 30);
      g.strokeStyle = "#ff3b2f"; g.lineWidth = 2.6; g.shadowColor = "#ff3b2f"; g.shadowBlur = 6;
      sieteSeg(g, x + 17, y + 52, 0, 18); g.fillStyle = "#ff3b2f"; g.fillRect(x + 30, y + 69, 2.6, 2.6);
      sieteSeg(g, x + 35, y + 52, 0, 18); sieteSeg(g, x + 49, y + 52, 0, 18);
      g.shadowBlur = 0;
      g.fillStyle = "#e8e2d2"; g.beginPath(); g.arc(x + w / 2, y + 100, 9, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
      g.fillStyle = "#222"; g.fillRect(x + w / 2 - 8, y + 122, 16, 5);
      g.fillStyle = "#ffd36a"; g.beginPath(); g.arc(x + w / 2, y + 4, 6, 0, TAU); g.fill(); g.stroke();
      const r = g.createRadialGradient(x + w / 2, y + 60, 2, x + w / 2, y + 60, 70);
      r.addColorStop(0, "rgba(255,60,40,0.25)"); r.addColorStop(1, "rgba(255,60,40,0)"); g.fillStyle = r; g.fillRect(x - 40, y, w + 80, 130);
      g.fillStyle = "rgba(30,8,12,0.35)"; g.fillRect(x - 2, y - 12, w + 4, h + 14);
    }
    // a la izquierda: mesa arrimada con las sillas patas arriba
    const silla = (cx, by, esc, invertida, col) => {
      g.save(); g.translate(cx, by); g.scale(esc, invertida ? -esc : esc);
      g.fillStyle = col; g.strokeStyle = TINTA; g.lineWidth = 2.4 / esc;
      for (const lx of [-24, 20]) { g.beginPath(); g.rect(lx, -6, 5, 62); g.fill(); g.stroke(); }
      g.beginPath(); g.rect(-28, -12, 56, 9); g.fill(); g.stroke();
      for (const lx of [-24, 20]) { g.beginPath(); g.rect(lx, -70, 5, 60); g.fill(); g.stroke(); }
      g.beginPath(); g.rect(-26, -72, 52, 10); g.fill(); g.stroke();
      g.beginPath(); g.rect(-26, -50, 52, 6); g.fill(); g.stroke();
      g.restore();
    };
    {
      const mx = 120, top = 292;
      g.fillStyle = "rgba(0,0,0,0.4)"; g.beginPath(); g.ellipse(mx, HOR + 18, 96, 9, 0, 0, TAU); g.fill();
      g.fillStyle = "#3a2214"; g.strokeStyle = TINTA; g.lineWidth = 2.5;
      g.beginPath(); g.rect(mx - 7, top + 8, 14, HOR + 14 - top - 8); g.fill(); g.stroke();
      g.beginPath(); g.ellipse(mx, HOR + 14, 40, 7, 0, 0, TAU); g.fill(); g.stroke();
      silla(mx - 36, top - 4, 0.95, true, "#4d2e1a"); silla(mx + 40, top - 4, 0.95, true, "#56341d");
      g.fillStyle = "#5a3520"; g.beginPath(); g.ellipse(mx, top, 92, 11, 0, 0, TAU); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,200,130,0.18)"; g.beginPath(); g.ellipse(mx + 10, top - 3, 70, 5, 0, 0, TAU); g.fill();
      // otra silla suelta, de pie, arrimada a la pared
      silla(268, HOR + 6, 1.05, false, "#4a2b18");
    }
    // a la derecha: el extremo de la barra, las botellas y el espejo
    {
      const x0 = 800, top = 236, base = HOR + 22;
      g.fillStyle = "#2c3a40"; g.fillRect(x0 + 10, 40, W - x0, 186);
      gr = g.createLinearGradient(x0, 40, W, 226); gr.addColorStop(0, "rgba(200,230,240,0.10)"); gr.addColorStop(0.5, "rgba(200,230,240,0.02)"); gr.addColorStop(1, "rgba(200,230,240,0.08)");
      g.fillStyle = gr; g.fillRect(x0 + 10, 40, W - x0, 186);
      g.fillStyle = "#4a2c1b"; g.fillRect(x0, 106, W - x0, 8); g.fillRect(x0, 170, W - x0, 8);
      const cols = ["#2f6b3a", "#7a3b16", "#c9a23a", "#3a5d8a", "#8a1f2a", "#d8c9a0", "#2a4a2a"];
      for (let i = 0; i < 18; i++) {
        const fila = i < 9 ? 0 : 1, bx = x0 + 22 + (i % 9) * 24 + fila * 10, by = fila ? 170 : 106, hb = 34 + 12 * hash(i + 3), wb = 13 + 4 * hash(i + 9);
        g.fillStyle = cols[i % cols.length]; g.strokeStyle = TINTA; g.lineWidth = 1.8;
        g.beginPath(); g.moveTo(bx - wb / 2, by); g.lineTo(bx - wb / 2, by - hb * 0.62); g.quadraticCurveTo(bx - wb / 2, by - hb * 0.75, bx - 3, by - hb * 0.8);
        g.lineTo(bx - 3, by - hb); g.lineTo(bx + 3, by - hb); g.lineTo(bx + 3, by - hb * 0.8); g.quadraticCurveTo(bx + wb / 2, by - hb * 0.75, bx + wb / 2, by - hb * 0.62); g.lineTo(bx + wb / 2, by); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = "rgba(255,255,255,0.28)"; g.fillRect(bx - wb / 2 + 2.5, by - hb * 0.58, 2.5, hb * 0.45);
      }
      // mostrador
      gr = g.createLinearGradient(0, top, 0, base); gr.addColorStop(0, "#5a2f1a"); gr.addColorStop(1, "#2e170c");
      g.fillStyle = gr; g.beginPath(); g.moveTo(x0 - 18, top); g.lineTo(W + 10, top); g.lineTo(W + 10, base); g.lineTo(x0 - 8, base); g.closePath(); g.fill();
      g.strokeStyle = TINTA; g.lineWidth = 3; g.stroke();
      for (let x = x0 + 8; x < W; x += 70) { g.strokeStyle = "#1c0d06"; g.lineWidth = 2.5; g.strokeRect(x, top + 26, 56, base - top - 44); g.strokeStyle = "rgba(190,120,70,0.3)"; g.lineWidth = 1.2; g.strokeRect(x + 3, top + 29, 50, base - top - 50); }
      g.fillStyle = "#7a4426"; g.beginPath(); g.moveTo(x0 - 30, top - 14); g.lineTo(W + 10, top - 14); g.lineTo(W + 10, top + 2); g.lineTo(x0 - 26, top + 2); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 3; g.stroke();
      g.strokeStyle = "rgba(255,210,150,0.45)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 - 24, top - 11); g.lineTo(W, top - 11); g.stroke();
      // barra de latón para los pies
      g.strokeStyle = "#c9a14a"; g.lineWidth = 6; g.beginPath(); g.moveTo(x0 - 4, base - 18); g.lineTo(W + 10, base - 18); g.stroke();
      g.strokeStyle = "rgba(255,240,190,0.7)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x0 - 2, base - 20); g.lineTo(W + 10, base - 20); g.stroke();
      // un taburete
      g.fillStyle = "#1f1410"; g.strokeStyle = TINTA; g.lineWidth = 2.5;
      g.beginPath(); g.rect(888, top + 10, 7, base - top - 4); g.fill(); g.stroke();
      g.beginPath(); g.ellipse(891, top + 8, 30, 8, 0, 0, TAU); g.fillStyle = "#6a1e22"; g.fill(); g.stroke();
      g.beginPath(); g.ellipse(891, base + 4, 22, 5, 0, 0, TAU); g.fillStyle = "#1f1410"; g.fill(); g.stroke();
    }
    // suelo de tablas en perspectiva
    gr = g.createLinearGradient(0, HOR, 0, H); gr.addColorStop(0, "#2e1b10"); gr.addColorStop(1, "#5a3620");
    g.fillStyle = gr; g.fillRect(0, HOR, W, H - HOR);
    g.save(); g.beginPath(); g.rect(0, HOR, W, H - HOR); g.clip();
    for (let i = -14; i <= 14; i++) {
      const xb = 512 + i * 96, xt = VP.x + (xb - VP.x) * (HOR - VP.y) / (H - VP.y);
      g.strokeStyle = "rgba(20,10,5,0.75)"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(xt, HOR); g.lineTo(xb, H); g.stroke();
      g.strokeStyle = "rgba(200,140,90,0.10)"; g.lineWidth = 2; g.beginPath(); g.moveTo(xt + 2, HOR); g.lineTo(xb + 3, H); g.stroke();
    }
    for (let j = 0; j < 9; j++) {            // juntas de las tablas, más juntas al fondo
      const y = HOR + (H - HOR) * Math.pow((j + 1) / 9, 1.7);
      for (let i = -14; i <= 14; i++) {
        if (hash(i * 3.1 + j * 7.7) < 0.45) continue;
        const k = (y - VP.y) / (H - VP.y), x1 = VP.x + (512 + i * 96 - VP.x) * k, x2 = VP.x + (512 + (i + 1) * 96 - VP.x) * k;
        g.strokeStyle = "rgba(20,10,5,0.55)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x1, y); g.lineTo(x2, y); g.stroke();
      }
    }
    // charco de luz de la lámpara colgante
    let r = g.createRadialGradient(520, 505, 10, 520, 505, 420);
    r.addColorStop(0, "rgba(255,205,140,0.42)"); r.addColorStop(0.45, "rgba(255,180,110,0.16)"); r.addColorStop(1, "rgba(255,170,100,0)");
    g.fillStyle = r; g.save(); g.translate(520, 505); g.scale(1, 0.32); g.translate(-520, -505); g.fillRect(0, 0, W, 1600); g.restore();
    g.restore();
    // reflejo de la luz en la pared
    r = g.createRadialGradient(520, 40, 10, 520, 120, 360);
    r.addColorStop(0, "rgba(255,200,130,0.22)"); r.addColorStop(1, "rgba(255,180,110,0)");
    g.fillStyle = r; g.fillRect(0, 0, W, HOR);
    // lámpara colgante (la pantalla asoma arriba)
    g.strokeStyle = "#140a06"; g.lineWidth = 2; g.beginPath(); g.moveTo(520, 0); g.lineTo(520, 14); g.stroke();
    g.fillStyle = "#2d4a36"; g.beginPath(); g.moveTo(470, 44); g.quadraticCurveTo(476, 12, 520, 10); g.quadraticCurveTo(564, 12, 570, 44); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.stroke();
    g.fillStyle = "#fff0c0"; g.beginPath(); g.ellipse(520, 44, 26, 6, 0, 0, TAU); g.fill();
    // viñeta
    r = g.createRadialGradient(512, 330, 260, 512, 330, 720);
    r.addColorStop(0, "rgba(0,0,0,0)"); r.addColorStop(1, "rgba(0,0,0,0.55)");
    g.fillStyle = r; g.fillRect(0, 0, W, H);
    return c;
  }

  /* ---------- efectos ---------- */
  function sombra(g, x, y, rx, ry, a) {
    g.save(); g.fillStyle = `rgba(18,8,4,${a})`; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); g.restore();
  }
  // rayitas de la palmada (entran en unos fotogramas y se abren)
  function palmada(g, t, t0, c, e = 1) {
    const k = fase(t, t0 - 0.03, t0 + 0.3); if (k <= 0 || k >= 1) return;
    const a = tramo(t, t0 - 0.03, t0 + 0.03) * (1 - tramo(t, t0 + 0.12, t0 + 0.3));
    g.save(); g.lineCap = "round"; g.translate(c.x, c.y); g.scale(e, e); g.translate(-c.x, -c.y);
    for (let i = 0; i < 9; i++) {
      const an = Math.PI + i * Math.PI / 8 + (i % 2 ? 0.08 : -0.05), r0 = 30 + 26 * salida(k), r1 = r0 + 14 + 8 * (1 - k);
      const p0 = P(c.x + Math.cos(an) * r0, c.y + Math.sin(an) * r0 * 0.9), p1 = P(c.x + Math.cos(an) * r1, c.y + Math.sin(an) * r1 * 0.9);
      g.globalAlpha = a; g.strokeStyle = TINTA; g.lineWidth = 6.5; g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.stroke();
      g.strokeStyle = "#fff3c4"; g.lineWidth = 3.5; g.stroke();
    }
    g.restore();
  }
  // nube de polvo de dibujo animado (bolas con contorno)
  function nube(g, t, t0, c, ancho, alto, dur, n, op) {
    const k = fase(t, t0, t0 + dur); if (k <= 0 || k >= 1) return;
    const a = tramo(t, t0, t0 + 0.07) * (1 - tramo(t, t0 + dur * 0.45, t0 + dur)) * op;
    g.save(); g.globalAlpha = a;
    const bolas = [];
    for (let i = 0; i < n; i++) {
      const s = n > 1 ? i / (n - 1) * 2 - 1 : 0, h = hash(i * 7.31 + t0 * 3);
      const ex = salida(fase(t, t0, t0 + dur * 0.6));
      bolas.push({ x: c.x + s * ancho * (0.35 + 0.65 * ex) + (h - 0.5) * 10, y: c.y - alto * (0.15 + 0.5 * (1 - Math.abs(s)) * (0.6 + 0.4 * h)) * (0.5 + 0.5 * ex) - 14 * k,
        r: (alto * 0.32 + alto * 0.22 * h) * (0.55 + 0.45 * ex) * (1 - 0.25 * k) });
    }
    g.fillStyle = TINTA; for (const b of bolas) { g.beginPath(); g.arc(b.x, b.y, b.r + 2.6, 0, TAU); g.fill(); }
    g.fillStyle = "#cdb48c"; for (const b of bolas) { g.beginPath(); g.arc(b.x, b.y, b.r, 0, TAU); g.fill(); }
    g.fillStyle = "#e9d8b4"; for (const b of bolas) { g.beginPath(); g.arc(b.x - b.r * 0.25, b.y - b.r * 0.28, b.r * 0.55, 0, TAU); g.fill(); }
    g.restore();
  }
  // polvillo suave (sin contorno) al apoyar las manos
  function polvillo(g, t, t0, x, y, dir, n, op) {
    const k = fase(t, t0, t0 + 0.45); if (k <= 0 || k >= 1) return;
    const a = tramo(t, t0, t0 + 0.05) * (1 - suave(k)) * op;
    g.save(); g.fillStyle = "#d8c3a0";
    for (let i = 0; i < n; i++) {
      const h = hash(i * 3.7 + t0), s = dir * (0.3 + 0.7 * h) * (i % 2 ? 1 : -0.6);
      g.globalAlpha = a * (0.5 + 0.5 * h);
      g.beginPath(); g.arc(x + s * 34 * salida(k), y - 4 - 14 * salida(k) * h, 3 + 7 * salida(k), 0, TAU); g.fill();
    }
    g.restore();
  }
  // gotas de sudor que salen despedidas
  function gotas(g, t, c, k) {
    if (k <= 0.02) return;
    g.save(); g.fillStyle = "#bfe6ff"; g.strokeStyle = "#1d3b52"; g.lineWidth = 1.8;
    for (let i = 0; i < 3; i++) {
      const ph = (t * 1.6 + i / 3) % 1, sg = i % 2 ? 1 : -1, x = c.x + sg * (30 + 46 * ph), y = c.y - 30 - 40 * ph + 90 * ph * ph;
      g.globalAlpha = k * Math.sin(Math.PI * ph);
      g.save(); g.translate(x, y); g.rotate(sg * (0.4 + ph)); g.beginPath(); g.moveTo(0, -7); g.quadraticCurveTo(5, 1, 0, 4); g.quadraticCurveTo(-5, 1, 0, -7); g.fill(); g.stroke(); g.restore();
    }
    g.restore();
  }
  // rayitas de temblor junto a los codos
  function temblor(g, t, pts, k) {
    if (k <= 0.02) return;
    g.save(); g.strokeStyle = TINTA; g.lineCap = "round"; g.lineWidth = 2.6;
    for (const [q, sg] of pts) for (let i = 0; i < 2; i++) {
      g.globalAlpha = k * (0.6 + 0.4 * Math.sin(t * 40 + i * 2));
      const x = q.x + sg * (16 + i * 8), y = q.y;
      g.beginPath(); g.moveTo(x, y - 9 + i * 2); g.quadraticCurveTo(x + sg * 4, y, x, y + 9 - i * 2); g.stroke();
    }
    g.restore();
  }
  // estrellitas girando
  function estrellitas(g, t, c, k) {
    if (k <= 0.02) return;
    g.save(); g.globalAlpha = k;
    for (let i = 0; i < 4; i++) {
      const a = t * 4.5 + i * TAU / 4, x = c.x + Math.cos(a) * 54, y = c.y + Math.sin(a) * 14;
      g.save(); g.translate(x, y); g.rotate(t * 3 + i);
      g.beginPath(); for (let j = 0; j < 10; j++) { const r = j % 2 ? 4 : 10, aa = j * Math.PI / 5 - Math.PI / 2; g.lineTo(Math.cos(aa) * r, Math.sin(aa) * r); } g.closePath();
      g.fillStyle = "#ffe066"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke(); g.restore();
    }
    g.restore();
  }
  // estela del salto: tres rayas que siguen la pelvis
  function estela(g, t) {
    const k = dentro(t, T.gSalta + 0.04, T.gSalta + 0.12, T.gAterriza - 0.22, T.gAterriza - 0.06);
    if (k <= 0.02) return;
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    const base = [];
    for (let j = 0; j < 8; j++) { const tt = t - 0.03 - 0.028 * j; if (tt < T.gSalta) break; base.push(trayecto(tt)); }
    for (let i = 0; i < 3; i++) {
      const pts = base.map(q => add(q, P(0, (i - 1) * 30)));
      if (pts.length < 3) continue;
      g.globalAlpha = k * 0.75; g.strokeStyle = "#f6e7c6"; g.lineWidth = 4.5 - i * 0.8;
      g.beginPath(); g.moveTo(pts[1].x, pts[1].y); for (let j = 2; j < pts.length; j++) g.lineTo(pts[j].x, pts[j].y); g.stroke();
    }
    g.restore();
  }
  const manoMundo = (Q, m) => enMundo(Q, P(m.x, m.y));
  class LasFlexiones extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Y.listo()) return;
      if (!fondo) fondo = creaFondo();
      const QY = poseY(t), QG = poseG(t), gy = geo().y, gg = geo().g;
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      // cámara: se acerca a Guillermo en su intento y, al final, a los dos
      const kG = dentro(t, 5.3, 6.3, 8.5, 9.3), kF = tramo(t, 9.5, 11.2);
      const ck = 1 + 0.1 * kG + 0.15 * kF, cx = 512 + 60 * kG - 67 * kF, cy = 300 + 14 * kG - 32 * kF;
      let tb = 0;
      for (const [t0, a] of [[T.gCae1, 3.5], [T.gAterriza, 2.5]]) if (t >= t0) tb += a * Math.exp(-(t - t0) * 9) * tramo(t, t0, t0 + 0.03);
      g.save();
      g.translate(W / 2, H / 2); g.scale(ck, ck);
      const mx = W / 2 - W / 2 / ck, my = H / 2 - H / 2 / ck;
      g.translate(-clamp(cx, W / 2 - mx, W / 2 + mx), -clamp(cy, H / 2 - my, H / 2 + my));
      if (tb > 0.05) g.translate(ruido(t * 40) * tb, ruido(t * 40 + 13) * tb * 0.6);
      g.drawImage(fondo, 0, 0);
      // sombras en el suelo: de las puntas de los pies a las manos
      const enAire = t >= T.gSalta;
      sombra(g, (XPY + gy.XC) / 2, FY + 3, (gy.XC - XPY) / 2 + 26, 9, 0.34);
      sombra(g, gy.XC - 40, FY + 2, 70, 6, 0.3);
      if (!enAire) { sombra(g, (XPG + gg.XC) / 2, FY + 3, (XPG - gg.XC) / 2 + 26, 9, 0.34); sombra(g, gg.XC + 40, FY + 2, 70, 6, 0.3 + 0.12 * plafG(t)); }
      else if (t < T.gAterriza) { const pv = QG.M.W, h = clamp((FY - pv.y) / 320); sombra(g, pv.x, FY + 4, 120 * (1 - 0.5 * h), 9, 0.3 * (1 - 0.6 * h)); }
      // Guillermo, en el aire y encima, va por delante de Yorgi (cae sobre su espalda)
      if (enAire) estela(g, t);
      const aCaballo = t >= T.gSalta + 0.2;            // desde que cae sobre Yorgi, las piernas pasan por detrás
      if (aCaballo) piernasDetras(g, QG);
      dibuja(g, QY, t);
      dibuja(g, QG, t, aCaballo);
      // la cabeza de Yorgi, otra vez por encima (Guillermo se sienta justo detrás de ella)
      if (aCaballo) {
        const c = enMundo(QY, Y.centroCabeza(QY.p));
        g.save(); g.beginPath(); g.ellipse(c.x + 4, c.y + 6, 66, 72, 0, 0, TAU); g.clip(); dibuja(g, QY, t); g.restore();
      }
      // efectos
      for (const tp of [T.p1, T.p2]) if (t > tp[3] - 0.05 && t < tp[3] + 0.32) palmada(g, t, tp[3], palmadaY(cuerpoY(tp[3])));
      for (const tp of [T.p1, T.p2]) { polvillo(g, t, tp[4], gy.XC, FY, 1, 4, 0.7); polvillo(g, t, tp[4], gy.XL, FY, -1, 3, 0.5); }
      if (!enAire) {
        const cab = enMundo(QG, G.centroCabeza(QG.p));
        gotas(g, t, cab, dentro(t, 6.4, 6.7, T.gCae0, T.gCae0 + 0.1));
        const hc = hombroM(QG, "cerca"), mc = manoMundo(QG, QG.p.manoCerca), mid = lerpP(hc, mc, 0.5);
        temblor(g, t, [[add(mid, P(-14, 0)), -1], [add(mid, P(14, 0)), 1]], tiembla(t) * tramo(t, T.gMedio - 0.3, T.gMedio));
        estrellitas(g, t, add(cab, P(4, -66)), dentro(t, T.gCae1 + 0.08, T.gCae1 + 0.25, T.gLevanta0 - 0.1, T.gLevanta0 + 0.1));
      }
      nube(g, t, T.gCae1 - 0.02, P(gg.XC + 60, FY + 6), 150, 58, 0.8, 12, 0.92);
      nube(g, t, T.gSalta - 0.06, P(gg.XC + 50, FY + 6), 120, 62, 0.55, 11, 0.85);
      { const a = anclaG(t).W; palmada(g, t, T.gAterriza + 0.02, add(a, P(40, -40)), 0.75); polvillo(g, t, T.gAterriza, a.x - 60, a.y + 30, -1, 5, 0.6); polvillo(g, t, T.gAterriza, a.x + 70, a.y + 20, 1, 4, 0.5); }
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00132", nombre: "Guillermo y Yorgi · Las flexiones", crear: () => new LasFlexiones() });

  // diagnóstico: cuánto se estira cada brazo (fracción del largo, antes de limitarlo)
  function diag(t) {
    const out = {};
    for (const [n, Q] of [["y", poseY(t)], ["g", poseG(t)]]) for (const lado of ["cerca", "lejos"]) out[n + "_" + lado] = +alcance(Q, lado).toFixed(3);
    return out;
  }
  window.__A2D_00132 = { pose: t => ({ y: poseY(t).p, g: poseG(t).p }), T, DUR, diag };
})();
