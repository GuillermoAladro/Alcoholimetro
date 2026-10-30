"use strict";
/* 00041 · Guillermo y Carla · La pasarela
 *
 * Negro → un bar convertido en pasarela de moda: una franja de luz cruza el suelo, focos, una
 * cortina de espumillón y el público a contraluz con cámaras. Guillermo mira desde la izquierda con
 * las manos en los bolsillos → Carla entra por la derecha desfilando como una modelo: tacones,
 * caderas, melena que bota y flashes del público → se planta en su marca con la mano en la cadera,
 * da una vuelta sobre sí misma y posa con la mano en el pelo y un guiño → Guillermo, boquiabierto,
 * se abanica… y acepta el reto: Carla le cede la pasarela con la mano → Guillermo desfila exagerando
 * las caderas, con morritos y la mano en la cadera; Carla se tapa la boca para no reírse → pisa el
 * charco del cartel de suelo mojado, resbala, cae abierto de piernas y sale deslizándose por la
 * pasarela (un flash le pilla en pleno espagat) → frena justo a los pies de Carla con los brazos en
 * alto y se recuesta en pose, con morritos y pistolita con los dedos → Carla le hace una «foto» con
 * las manos: clic, visor alrededor de Guillermo → guiña un ojo a cámara → negro.
 *
 * Sin textos (el cartel solo lleva el muñequito que resbala). Todo depende del tiempo absoluto. El
 * contacto de la zapatilla de Guillermo con la bota de Carla se calcula a partir de las dos posturas.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, tramo, mezcla, ruido, hash } = M2;
  const G = Guillermo, CA = Carla;
  const S = 0.30, SUELO = 545;
  const KC = S * CA.K;                                   // escala en pantalla de la hoja de Carla
  const DUR = 14.0;
  const T = {
    foco: 0.3, llega0: 0.45, llega1: 3.05, planta: 3.05, planta1: 3.3,
    giro0: 3.72, giro1: 4.32, poseB: 4.32, guino: 4.62, poseB1: 5.25,
    mira: 5.3, invita0: 5.45, invita1: 5.75, invitaFin: 6.15,
    gEmbob: 1.4, gAbanico0: 4.68, gAbanico1: 5.3, gReto: 5.6, gSacude0: 5.95, gSacude1: 6.4,
    desfile0: 6.55, pisa: 8.85, cae0: 9.02, cae1: 9.32, para: 10.55,
    tada: 9.45, pose0: 10.6, pose1: 11.05,
    risa0: 7.55, susto: 8.95, mirAbajo: 10.5, cRie: 11.3, marco0: 11.75, marco1: 12.2, clic: 12.3,
    baja0: 12.75, guinoC: 12.85, quejido: 12.6,
    fin: 13.3
  };

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const ABIERTA = D(1, 1), RELAJADA = D(0.55, 0.6, 0.55, 0.5, 0.45), LACIA = D(0.7, 0.8, 0.7, 0.65, 0.6), PISTOLA = D(1, 1, 0, 0, 0),
    ELE = D(1, 1, 0.05, 0.05, 0.05), CADERA = D(0.45, 0.7, 0.7, 0.65, 0.6), PELO = D(0.6, 0.85, 0.8, 0.75, 0.7);

  /* ---------- caras (mismos campos para los dos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, wi: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* ---------- pasos: x de pantalla de cada tobillo ---------- */
  function pie(lista, t, alto) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x, h] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    const arco = Math.sin(Math.PI * u);
    return { x: lerp(xa, x, suave5(u)), alza: (h ?? alto) * arco, ang: -0.15 * arco, u, i };
  }

  /* =====================================================================================
   * CARLA (a la derecha, en espejo: mira a la izquierda)
   * ===================================================================================== */
  const XC_IN = 1150, XC = 800;
  const OFF_C = { cerca: 60 * KC, lejos: -70 * KC };             // tobillos de pie (pantalla, respecto a la pelvis)
  const PASOS_C = (() => {
    const c = [[-10, -9, XC_IN + OFF_C.cerca]], l = [[-10, -9, XC_IN + OFF_C.lejos]];
    const n = 6, dt = (T.llega1 - T.llega0) / n;
    for (let i = 0; i < n; i++) {
      const t0 = T.llega0 + i * dt, x = lerp(XC_IN, XC, (i + 1) / n);
      // paso de modelo: cada pie cae casi en la línea del otro (cruzado), un poco por delante
      if (i % 2 === 0) c.push([t0, t0 + dt * 0.95, x + 4]); else l.push([t0, t0 + dt * 0.95, x - 4]);
    }
    // se planta: el pie de atrás llega a su sitio con un taconazo y la cadera fuera
    c.push([T.planta, T.planta1, XC + OFF_C.cerca, 14]); l.push([T.planta + 0.04, T.planta1 + 0.02, XC + OFF_C.lejos, 6]);
    return { cerca: c, lejos: l };
  })();
  const TOB_C = CA.SUELO - CA.TOBILLO_ALTO;
  // giro sobre sí misma: escala horizontal cos(θ) alrededor de su x (a mitad de vuelta mira a la derecha)
  const giroC = t => { const u = fase(t, T.giro0, T.giro1); return 2 * Math.PI * (u < 0.5 ? 0.5 * suave(u * 2) : 0.5 + 0.5 * suave(u * 2 - 1)); };

  const CARAS_C = {
    inicio: E({ mx: 0.85, my: 0.05, c: 0.3, sd: 4, gd: 0.04, si: 4, gi: 0.04, sonr: 0.35, ancho: 0.85 }),
    camara: E({ mx: -0.85, my: -0.05, c: 0.42, sd: 8, gd: 0.06, si: 2, gi: -0.02, sonr: 0.45, ancho: 0.85 }),
    gira: E({ mx: 0, my: -0.2, c: 0.9, h: 1, sd: 10, gd: 0.08, si: 10, gi: 0.08, abre: 10, ancho: 1, sonr: 0.8 }),
    poseB: E({ mx: -0.85, my: -0.15, c: 0.35, sd: 12, gd: 0.08, si: 6, gi: 0.02, abre: 6, ancho: 0.9, sonr: 0.7 }),
    guino: E({ mx: -0.85, my: -0.15, c: 0.25, wi: 0.75, sd: 12, gd: 0.08, si: -4, gi: -0.05, abre: 4, ancho: 0.95, sonr: 0.85 }),
    mira: E({ mx: 0.9, my: 0.05, c: 0.3, sd: 2, gd: 0, si: 20, gi: 0.12, abre: 0, ancho: 0.85, sonr: 0.45 }),
    invita: E({ mx: 0.9, my: 0, c: 0.2, sd: 10, gd: 0.06, si: 18, gi: 0.1, abre: 8, ancho: 1, sonr: 0.75 }),
    esceptica: E({ mx: 0.9, my: 0.05, c: 0.4, sd: -2, gd: -0.04, si: 22, gi: 0.14, abre: 0, ancho: 0.75, sonr: 0.05 }),
    aguanta: E({ mx: 0.9, my: 0.1, c: 0.7, h: 0.9, sd: 14, gd: 0.1, si: 14, gi: 0.1, abre: 0, ancho: 0.9, sonr: 0.8 }),
    susto: E({ mx: 0.9, my: 0.2, iris: 0.85, sd: 24, gd: 0.14, si: 24, gi: 0.14, abre: 24, ancho: 0.6, sonr: 0, lengua: 0 }),
    abajo: E({ mx: 0.7, my: 0.75, c: 0.1, sd: 18, gd: 0.1, si: 18, gi: 0.1, abre: 6, ancho: 0.7, sonr: 0.1 }),
    risa: E({ mx: 0.5, my: 0.4, c: 1, h: 1, sd: 16, gd: 0.12, si: 16, gi: 0.12, abre: 34, ancho: 1.15, sonr: 1, lengua: 0.3 }),
    apunta: E({ mx: 0.75, my: 0.7, c: 0.2, wd: 0.8, sd: -2, gd: -0.06, si: 16, gi: 0.1, abre: 0, ancho: 0.8, sonr: 0.55 }),
    final: E({ mx: -0.85, my: -0.05, c: 0.25, wi: 0.75, sd: 12, gd: 0.08, si: -4, gi: -0.05, abre: 10, ancho: 1.05, sonr: 0.95 })
  };
  const GUION_CARA_C = [
    [T.planta - 0.1, T.planta + 0.2, "camara"], [T.giro0, T.giro0 + 0.15, "gira"], [T.giro1 - 0.12, T.poseB + 0.1, "poseB"],
    [T.guino, T.guino + 0.12, "guino"], [T.guino + 0.4, T.guino + 0.55, "poseB"], [T.mira, T.mira + 0.2, "mira"],
    [T.invita0, T.invita0 + 0.2, "invita"], [T.desfile0, T.desfile0 + 0.3, "esceptica"], [T.risa0, T.risa0 + 0.25, "aguanta"],
    [T.susto, T.susto + 0.1, "susto"], [T.mirAbajo, T.mirAbajo + 0.3, "abajo"], [T.cRie, T.cRie + 0.15, "risa"],
    [T.marco0, T.marco0 + 0.25, "apunta"], [T.guinoC - 0.05, T.guinoC + 0.15, "final"]
  ];
  // cuerpo: pel (hoja, + abajo), torso (+ hacia delante), cab, cad (cadera fuera: x de la pelvis, hoja)
  const CUERPOS_C = {
    anda: { pel: 0, torso: -0.03, cab: -0.04, cad: 0 },
    pose: { pel: 6, torso: -0.07, cab: -0.1, cad: -22 },
    gira: { pel: -4, torso: -0.02, cab: -0.06, cad: 0 },
    poseB: { pel: 10, torso: -0.1, cab: -0.2, cad: -28 },
    mira: { pel: 4, torso: -0.04, cab: 0.02, cad: -16 },
    esceptica: { pel: 4, torso: -0.06, cab: 0.06, cad: -18 },
    rie: { pel: 10, torso: 0.08, cab: 0.1, cad: -10 },
    abajo: { pel: 8, torso: 0.07, cab: 0.18, cad: -12 },
    marco: { pel: 10, torso: 0.1, cab: 0.16, cad: -12 },
    final: { pel: 6, torso: -0.04, cab: -0.06, cad: -18 }
  };
  const GUION_CUERPO_C = [
    [T.planta, T.planta1, "pose"], [T.giro0, T.giro0 + 0.12, "gira"], [T.giro1 - 0.1, T.poseB + 0.15, "poseB"],
    [T.mira - 0.05, T.mira + 0.25, "mira"], [T.desfile0, T.desfile0 + 0.3, "esceptica"], [T.risa0, T.risa0 + 0.3, "rie"],
    [T.susto, T.susto + 0.15, "esceptica"], [T.mirAbajo, T.mirAbajo + 0.3, "abajo"], [T.marco0, T.marco1, "marco"], [T.baja0, T.baja0 + 0.35, "final"]
  ];

  function poseC(t) {
    const b = guion(GUION_CUERPO_C, CUERPOS_C, "anda", t);
    const fc = pie(PASOS_C.cerca, t, 22), fl = pie(PASOS_C.lejos, t, 22);
    const X = (fc.x - OFF_C.cerca + fl.x - OFF_C.lejos) / 2;
    const andando = dentro(t, T.llega0, T.llega0 + 0.2, T.llega1 - 0.1, T.planta1);
    // contoneo: la cadera sube del lado del pie que apoya y el torso va al revés
    const fu = Math.max(Math.sin(Math.PI * fc.u), Math.sin(Math.PI * fl.u));
    const lado = fc.u > 0 && fc.u < 1 ? 1 : -1;
    const contoneo = Math.sin(Math.PI * (fc.u > 0 && fc.u < 1 ? fc.u : fl.u)) * lado * andando;
    const respira = Math.sin(t * 2.1 + 1);
    const rie = dentro(t, T.risa0 + 0.15, T.risa0 + 0.35, T.susto, T.susto + 0.1) + dentro(t, T.cRie, T.cRie + 0.15, T.marco0, T.marco0 + 0.2);
    const p = {
      x: X, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, ikContinuo: true,
      pelvis: { x: CA.PELVIS.x + b.cad + 14 * contoneo, y: CA.PELVIS.y + b.pel + respira * 1.2 - 16 * fu * andando + 5 * Math.abs(Math.sin(t * 15)) * rie },
      torso: b.torso - 0.045 * contoneo + 0.025 * Math.sin(t * 15) * rie, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.03 * contoneo + 0.03 * Math.sin(t * 15 + 1) * rie, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    for (const [ld, f] of [["cerca", fc], ["lejos", fl]]) {
      const hx = CA.aHoja(p, { x: f.x, y: 0 }).x;
      p.piernas[ld] = { tob: { x: hx, y: TOB_C - (ld === "lejos" ? 6 : 0) - f.alza / KC }, ang: f.ang * 1.4 };
    }
    // melena: bota al andar, vuela en el giro y se mece
    const g = giroC(t), enGiro = t > T.giro0 && t < T.giro1;
    p.pelo = { inercia: -0.28 * andando + 0.16 * fu * andando * Math.sin(t * 12) + 0.05 * Math.sin(t * 1.7),
      viento: enGiro ? 0.9 * Math.sin(g) * Math.sin(Math.PI * fase(t, T.giro0, T.giro1)) : 0 };
    p.giro = g;
    const ex = guion(GUION_CARA_C, CARAS_C, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [1.6, 2.9, 5.1, 7.1, 9.9, 11.0, 12.55]));
    p.cara.rubor = 0.25 * dentro(t, T.cRie, T.cRie + 0.2, T.marco0, T.marco1);
    manosC(p, t, fc, fl, andando);
    return p;
  }
  // mano de Carla junto a la boca (hoja): delante de los labios
  function manosC(p, t, fc, fl, andando) {
    const Tr = CA.tronco(p);
    // andando: los brazos se balancean al revés que las piernas
    const vaiven = Math.sin(Math.PI * 2 * fase(t, T.llega0, T.llega1) * 3);
    let c = Tr({ x: 78 - 55 * vaiven, y: 612 }), l = Tr({ x: 408 + 45 * vaiven, y: 612 });
    let cmu = -1.6 + 0.25 * vaiven, lmu = -1.75 - 0.2 * vaiven, cang = 0, lang = 0, cd = RELAJADA, ld = RELAJADA, cdob = -1, ldob = 1;
    const pone = (w, cc, ll) => {
      if (w <= 0) return;
      if (cc) { c = mezcla(c, cc.q, w); cang = lerp(cang, cc.ang || 0, w); cmu = lerp(cmu, cc.mu, w); cd = mezclaD(cd, cc.d, w); }
      if (ll) { l = mezcla(l, ll.q, w); lang = lerp(lang, ll.ang || 0, w); lmu = lerp(lmu, ll.mu, w); ld = mezclaD(ld, ll.d, w); }
    };
    // al plantarse: manos en las caderas
    const jarras = dentro(t, T.planta - 0.05, T.planta1 + 0.05, T.marco0, T.marco1);
    pone(jarras, { q: Tr({ x: 132, y: 585 }), mu: -0.5, d: CADERA }, { q: Tr({ x: 372, y: 590 }), mu: -2.6, d: CADERA });
    // pose B: la mano cercana se mete en el pelo (por detrás de la cabeza)
    const pelo = dentro(t, T.giro1 - 0.15, T.poseB + 0.1, T.poseB1, T.mira + 0.2);
    pone(pelo, { q: Tr({ x: 110, y: 70 + 12 * Math.sin(t * 3) }), mu: 1.35, d: PELO }, null);
    // le cede la pasarela con la palma hacia arriba (mano lejana, hacia Guillermo)
    const invita = dentro(t, T.invita0, T.invita1, T.invitaFin, T.invitaFin + 0.35);
    pone(invita, null, { q: Tr({ x: 590, y: 490 }), mu: -3.0, ang: 0, d: ABIERTA });
    // se tapa la boca para no reírse (y del susto)
    const boca = dentro(t, T.risa0, T.risa0 + 0.25, T.mirAbajo + 0.3, T.mirAbajo + 0.6);
    if (boca > 0) { const b = CA.boca(p); pone(boca, { q: { x: b.x + 6, y: b.y + 10 }, mu: 1.15, d: D(0.25, 1, 1, 0.95, 0.9) }, null); }
    // el marco de foto con las dos manos, delante de la cara, apuntando abajo a Guillermo
    const marco = dentro(t, T.marco0, T.marco1, T.baja0, T.baja0 + 0.4);
    pone(marco, { q: Tr({ x: 386, y: 186 }), mu: Math.PI, d: ELE }, { q: Tr({ x: 492, y: 72 }), mu: -Math.PI / 2, d: ELE });
    // final: vuelven a la cadera
    pone(tramo(t, T.baja0, T.baja0 + 0.4), { q: Tr({ x: 132, y: 585 }), mu: -0.5, d: CADERA }, { q: Tr({ x: 372, y: 590 }), mu: -2.6, d: CADERA });
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: cdob, puno: 1, dedos: cd };
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: ldob, puno: 1, dedos: ld, espejo: marco > 0.5 };
  }

  /* =====================================================================================
   * GUILLERMO (a la izquierda, mira a la derecha)
   * ===================================================================================== */
  const XG0 = 200;
  const R_M = G.MUNECA_R * G.JK;
  const manoDesde = (m, a, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, a); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_C = manoDesde({ x: 131, y: 652 }, 0, -1.75), BOLS_L = manoDesde({ x: 372, y: 648 }, 0, -1.75);
  const OFF_G = { cerca: -19, lejos: 18 };
  const X_PISA = 470;                                       // donde el pie cercano pisa el charco
  const PASOS_G = (() => {
    const c = [[-10, -9, XG0 + OFF_G.cerca]], l = [[-10, -9, XG0 + OFF_G.lejos]];
    const n = 5, dt = (T.pisa - T.desfile0) / n;
    const xs = [XG0 + OFF_G.cerca, 268, 318, 368, 418, X_PISA];
    for (let i = 0; i < n; i++) {
      const t0 = T.desfile0 + i * dt;
      if (i % 2 === 0) c.push([t0, t0 + dt * 0.92, xs[i + 1], 46]); else l.push([t0, t0 + dt * 0.92, xs[i + 1], 46]);
    }
    return { cerca: c, lejos: l };
  })();
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  // contorno de la zapatilla respecto al tobillo (hoja): para apoyarla en el suelo cuando gira
  const ZAP = [G.PUNTA, G.TALON, { x: 120, y: 30 }, { x: -30, y: -6 }, { x: 60, y: 92 }];
  const bajoZap = a => Math.max(...ZAP.map(q => q.x * Math.sin(a) + q.y * Math.cos(a)));
  const delanteZap = a => Math.max(...ZAP.map(q => q.x * Math.cos(a) - q.y * Math.sin(a)).slice(0, 2));
  const LP = { cerca: 541.6 * 0.997, lejos: 540.9 * 0.997 };
  const ANG_F = -1.45, ANG_B = 2.75;                         // zapatilla de delante (punta arriba) y de atrás (empeine al suelo)
  const PEL_ESP = 70;                                        // altura de la cadera sobre el suelo en el espagat (hoja)
  // apertura del espagat (0 de pie … 1 abierto del todo)
  function apertura(t) {
    if (t < T.pisa) return 0;
    if (t < T.cae0) return 0.12 * suave(fase(t, T.pisa, T.cae0));
    const u = fase(t, T.cae0, T.cae1);
    return 0.12 + 0.88 * u * u;                              // cae por su peso
  }
  // geometría de las piernas abiertas (hoja): cadera y tobillos
  function espagat(k, pelvisX) {
    const af = lerp(0, ANG_F, suave(k)), ab = lerp(0, ANG_B, suave(k));
    const yF = lerp(TOB_G.cerca, G.SUELO - bajoZap(af), k), yB = lerp(TOB_G.lejos, G.SUELO - bajoZap(ab), k);
    const hipY = lerp(G.PELVIS.y, G.SUELO - PEL_ESP, k);
    const vF = yF - hipY, vB = yB - hipY;
    const uF = Math.sqrt(Math.max(0, LP.cerca * LP.cerca - vF * vF)), uB = Math.sqrt(Math.max(0, LP.lejos * LP.lejos - vB * vB));
    return { hipY, cerca: { x: G.CADERA.cerca.x + uF, y: yF, ang: af }, lejos: { x: G.CADERA.lejos.x - uB, y: yB, ang: ab } };
  }
  let X_FIN = null;                                          // pelvis de Guillermo al frenar (talón contra la punta de la bota de Carla)
  function preparaFin() {
    const pC = poseC(T.para);
    // punta de la bota delantera de Carla (pantalla): el pie lejano mira a la izquierda
    const fl = pC.piernas.lejos, punta = CA.aPantalla(pC, { x: fl.tob.x + CA.PUNTA.x, y: fl.tob.y });
    const e = espagat(1, 0);
    const talonX = (e.cerca.x - G.PELVIS.x) * S + delanteZap(ANG_F) * S;
    X_FIN = punta.x - 3 - talonX;
  }
  // x de la pelvis de Guillermo (pantalla) durante el resbalón
  function xDesliza(t, xPisa) {
    if (!X_FIN) preparaFin();
    const u = fase(t, T.pisa, T.para);
    return lerp(xPisa, X_FIN, 1 - Math.pow(1 - u, 2.6));
  }

  const CARAS_G = {
    inicio: E({ mx: 0.85, my: 0.05, c: 0.25, sd: 2, gd: 0.02, si: 2, gi: 0.02, sonr: 0.2, ancho: 0.85 }),
    mira: E({ mx: 0.9, my: 0, c: 0.1, sd: 10, gd: 0.06, si: 10, gi: 0.06, sonr: 0.3, ancho: 0.85 }),
    embobado: E({ mx: 0.9, my: 0, iris: 1.15, sd: 22, gd: 0.14, si: 22, gi: 0.14, abre: 40, ancho: 0.75, sonr: 0.1, lengua: 0.5 }),
    guino: E({ mx: 0.9, my: -0.05, iris: 1.2, c: 0.05, sd: 26, gd: 0.18, si: 26, gi: 0.18, abre: 48, ancho: 0.7, sonr: 0.2, lengua: 0.6 }),
    calor: E({ mx: -0.85, my: 0, c: 0.4, h: 0.4, sd: 14, gd: 0.1, si: 14, gi: 0.1, abre: 10, ancho: 0.8, sonr: 0.4 }),
    reto: E({ mx: -0.85, my: -0.05, c: 0.25, sd: 18, gd: 0.12, si: 4, gi: -0.04, abre: 4, ancho: 1.1, sonr: 0.9 }),
    morritos: E({ mx: -0.85, my: -0.1, c: 0.48, sd: 16, gd: 0.12, si: 16, gi: 0.12, abre: 0, ancho: 0.42, sonr: -0.15 }),
    uyuy: E({ mx: 0.5, my: 0.6, iris: 0.7, sd: 26, gd: 0.18, si: 26, gi: 0.18, abre: 30, ancho: 0.5, sonr: -0.4, lengua: 0 }),
    dolor: E({ mx: 0, my: 0, c: 1, z: 1, sd: 20, gd: 0.25, si: 20, gi: 0.25, abre: 36, ancho: 0.9, sonr: -0.75, lengua: 0 }),
    tada: E({ mx: -0.85, my: -0.1, c: 0.3, h: 1, sd: 18, gd: 0.12, si: 18, gi: 0.12, abre: 30, ancho: 1.2, sonr: 1, lengua: 0.2 }),
    pose: E({ mx: 0.9, my: -0.75, c: 0.3, wd: 0.7, sd: 18, gd: 0.12, si: 6, gi: 0, abre: 0, ancho: 0.42, sonr: -0.1 }),
    quejido: E({ mx: 0.9, my: -0.75, c: 0.35, sd: 26, gd: 0.25, si: 26, gi: 0.25, abre: 6, ancho: 1.1, sonr: 0.55 })
  };
  const GUION_CARA_G = [
    [0.45, 0.75, "mira"], [T.gEmbob, T.gEmbob + 0.6, "embobado"], [T.guino - 0.02, T.guino + 0.12, "guino"],
    [T.gAbanico0, T.gAbanico0 + 0.25, "calor"], [T.gReto, T.gReto + 0.2, "reto"], [T.desfile0 - 0.15, T.desfile0 + 0.15, "morritos"],
    [T.pisa + 0.02, T.pisa + 0.1, "uyuy"], [T.cae1 - 0.02, T.cae1 + 0.05, "dolor"], [T.tada, T.tada + 0.25, "tada"],
    [T.pose0, T.pose1, "pose"], [T.quejido, T.quejido + 0.25, "quejido"]
  ];
  const CUERPOS_G = {
    inicio: { pel: 0, torso: -0.02, cab: 0 },
    embobado: { pel: 8, torso: 0.08, cab: 0.08 },
    calor: { pel: 4, torso: -0.04, cab: -0.06 },
    reto: { pel: 0, torso: -0.05, cab: -0.08 },
    desfila: { pel: 4, torso: -0.08, cab: -0.1 },
    uyuy: { pel: 0, torso: -0.12, cab: -0.12 },
    espagat: { pel: 0, torso: 0.04, cab: -0.04 },
    tada: { pel: 0, torso: -0.06, cab: -0.1 },
    pose: { pel: 0, torso: -0.42, cab: -0.42 }
  };
  const GUION_CUERPO_G = [
    [T.gEmbob, T.gEmbob + 0.6, "embobado"], [T.gAbanico0, T.gAbanico0 + 0.3, "calor"], [T.gReto, T.gReto + 0.25, "reto"],
    [T.desfile0 - 0.1, T.desfile0 + 0.2, "desfila"], [T.pisa, T.cae0, "uyuy"], [T.cae1 - 0.04, T.cae1 + 0.12, "espagat"],
    [T.tada, T.tada + 0.3, "tada"], [T.pose0, T.pose1, "pose"]
  ];

  function poseG(t, pC) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const respira = Math.sin(t * 2.4);
    const fc = pie(PASOS_G.cerca, t, 40), fl = pie(PASOS_G.lejos, t, 40);
    const desfila = dentro(t, T.desfile0, T.desfile0 + 0.2, T.pisa - 0.05, T.pisa + 0.05);
    const pasoU = fc.u > 0 && fc.u < 1 ? fc.u : fl.u, lado = fc.u > 0 && fc.u < 1 ? 1 : -1;
    const contoneo = Math.sin(Math.PI * pasoU) * lado * desfila;
    const bote = Math.max(Math.sin(Math.PI * fc.u), Math.sin(Math.PI * fl.u)) * desfila;
    const xPie = (fc.x - OFF_G.cerca + fl.x - OFF_G.lejos) / 2;
    const k = apertura(t);
    let X = xPie;
    if (t >= T.pisa) X = xDesliza(t, (X_PISA - OFF_G.cerca + PASOS_G.lejos[PASOS_G.lejos.length - 1][2] - OFF_G.lejos) / 2);
    // sacudida de hombros antes de desfilar
    const sacude = dentro(t, T.gSacude0, T.gSacude0 + 0.08, T.gSacude1 - 0.08, T.gSacude1);
    const p = {
      x: X, suelo: SUELO, s: S, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: G.PELVIS.x + 26 * contoneo, y: G.PELVIS.y + b.pel + respira * 1.3 - 20 * bote + 6 * Math.sin(t * 30) * sacude },
      torso: b.torso - 0.13 * contoneo + 0.05 * Math.sin(t * 30) * sacude, torsoEsc: { x: 1, y: 1 + respira * 0.005 },
      piernas: {}, cabeza: { ang: b.cab + 0.1 * contoneo, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    for (const [ld, f] of [["cerca", fc], ["lejos", fl]]) {
      const hx = G.aHoja(p, { x: f.x, y: 0 }).x;
      p.piernas[ld] = { tob: { x: hx, y: TOB_G[ld] - f.alza / S }, ang: f.ang * (desfila > 0 ? 1.6 : 1) };
    }
    // ---- resbalón y espagat ----
    if (k > 0) {
      const e = espagat(k, 0);
      // al empezar el resbalón mezcla los pies del último paso con las piernas en tijera
      const w = suave(fase(k, 0, 0.3));
      p.pelvis.y = lerp(p.pelvis.y, e.hipY, k < 0.12 ? k / 0.12 * 0.3 : lerp(0.3, 1, (k - 0.12) / 0.88));
      for (const ld of ["cerca", "lejos"]) {
        const q = p.piernas[ld];
        q.tob = { x: lerp(q.tob.x, e[ld].x, w), y: lerp(q.tob.y, e[ld].y, w) }; q.ang = lerp(q.ang, e[ld].ang, w);
      }
      if (k >= 1) { p.pelvis.y = e.hipY; for (const ld of ["cerca", "lejos"]) { p.piernas[ld].tob = { x: e[ld].x, y: e[ld].y }; p.piernas[ld].ang = e[ld].ang; } }
      // rebote al caer
      if (t > T.cae1) p.pelvis.y -= 22 * Math.exp(-(t - T.cae1) * 9) * Math.abs(Math.sin((t - T.cae1) * 22));
    }
    // ---- manos ----
    manosG(p, t, pC, contoneo, desfila);
    // ---- cara ----
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [0.95, 2.45, 3.9, 6.2, 7.6, 10.2, 11.6]));
    p.cara.rubor = 0.7 * dentro(t, T.gEmbob + 0.4, T.gEmbob + 1, T.gReto, T.gReto + 0.3) + 0.5 * dentro(t, T.desfile0, T.desfile0 + 0.3, T.pisa, T.pisa + 0.1);
    p.rojo = 0.35 * dentro(t, T.guino, T.guino + 0.2, T.gAbanico1, T.gReto) + 0.3 * dentro(t, T.cae1, T.cae1 + 0.1, T.tada, T.tada + 0.3)
      + 0.2 * dentro(t, T.quejido, T.quejido + 0.2, T.fin + 2, T.fin + 3);
    p.sudor = 0.8 * dentro(t, T.gAbanico0, T.gAbanico0 + 0.3, T.gReto, T.gReto + 0.3) + dentro(t, T.quejido, T.quejido + 0.3, T.fin + 2, T.fin + 3);
    const morro = dentro(t, T.desfile0 - 0.15, T.desfile0 + 0.15, T.pisa, T.pisa + 0.08) + dentro(t, T.pose0 + 0.1, T.pose1, T.quejido, T.quejido + 0.2);
    p.capaCabeza = morro > 0.01 ? (g) => morritos(g, morro) : null;
    return p;
  }
  function manosG(p, t, pC, contoneo, desfila) {
    const Tr = G.tronco(p);
    let c = { x: BOLS_C.x, y: BOLS_C.y }, l = { x: BOLS_L.x, y: BOLS_L.y };
    let cpu = 0, lpu = 0, cang = 0, lang = 0, cmu = -1.75, lmu = -1.75, cd = RELAJADA, ld = RELAJADA;
    const pone = (w, cc, ll) => {
      if (w <= 0) return;
      if (cc) { c = mezcla(c, cc.q, w); cpu = lerp(cpu, 1, w); cang = lerp(cang, cc.ang || 0, w); cmu = lerp(cmu, cc.mu, w); cd = mezclaD(cd, cc.d, w); }
      if (ll) { l = mezcla(l, ll.q, w); lpu = lerp(lpu, 1, w); lang = lerp(lang, ll.ang || 0, w); lmu = lerp(lmu, ll.mu, w); ld = mezclaD(ld, ll.d, w); }
    };
    // se abanica con la mano lejana delante de la cara
    const aba = dentro(t, T.gAbanico0 - 0.1, T.gAbanico0 + 0.15, T.gAbanico1, T.gReto + 0.1);
    if (aba > 0) pone(aba, null, { q: Tr({ x: 470, y: 200 + 14 * Math.sin(t * 22) }), mu: 1.9 + 0.45 * Math.sin(t * 22), d: ABIERTA });
    // sacude los brazos para soltarse
    const sac = dentro(t, T.gSacude0, T.gSacude0 + 0.12, T.gSacude1 - 0.1, T.desfile0);
    if (sac > 0) { const f = Math.sin(t * 34), f2 = Math.sin(t * 31 + 1);
      pone(sac, { q: Tr({ x: 30 + 14 * f, y: 600 + 14 * f2 }), mu: -1.4 + 0.5 * f, d: LACIA }, { q: Tr({ x: 430 + 14 * f2, y: 610 + 14 * f }), mu: -2.0 + 0.5 * f2, d: LACIA }); }
    // desfile: mano lejana en la cadera, la cercana balanceándose con la muñeca lacia
    const des = dentro(t, T.gSacude1 - 0.1, T.desfile0 + 0.1, T.pisa, T.pisa + 0.08);
    if (des > 0) {
      const v = Math.sin(Math.PI * 2 * fase(t, T.desfile0, T.pisa) * 2.5);
      pone(des, { q: Tr({ x: 40 + 90 * v, y: 560 - 30 * v }), mu: -1.15 - 0.55 * v, d: LACIA }, { q: Tr({ x: 376, y: 620 }), mu: -2.6, d: D(0.5, 0.75) });
    }
    // resbala: brazos arriba agitándose
    const arriba = dentro(t, T.pisa, T.pisa + 0.12, T.tada, T.tada + 0.25);
    if (arriba > 0) { const f = Math.sin((t - T.pisa) * 26), f2 = Math.sin((t - T.pisa) * 23 + 1.2);
      pone(arriba, { q: Tr({ x: 20 + 30 * f, y: 160 + 30 * f2 }), mu: 1.0, d: ABIERTA }, { q: Tr({ x: 480 + 26 * f2, y: 170 + 26 * f }), mu: 2.1, d: ABIERTA }); }
    // ¡tachán!: brazos en uve
    const tada = dentro(t, T.tada, T.tada + 0.25, T.pose0, T.pose1);
    pone(tada, { q: Tr({ x: -40, y: 170 }), mu: 0.75, d: ABIERTA }, { q: Tr({ x: 540, y: 160 }), mu: 2.35, d: ABIERTA });
    // pose: la cercana apoyada en el suelo detrás, la lejana haciendo una pistolita hacia Carla
    const pose = tramo(t, T.pose0, T.pose1);
    if (pose > 0) {
      const apoyo = { x: G.PELVIS.x - 245, y: G.SUELO - 26 };
      let dir = -0.65;
      const m = Tr({ x: 560, y: 360 });
      if (pC) { const cc = G.aHoja(p, CA.aPantalla(pC, CA.tronco(pC)({ x: 240, y: 380 }))); dir = Math.max(-0.45, Math.atan2(cc.y - m.y, cc.x - m.x)); }
      pone(pose, { q: apoyo, mu: -0.2, ang: 0, d: D(0.9, 1, 1, 1, 0.95) }, { q: m, mu: dir + Math.PI, d: PISTOLA });
    }
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: -1, puno: cpu, dedos: cd };
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: -1, puno: lpu, dedos: ld };
  }
  // morritos de pato (encima de la boca, en el retrato de Guillermo)
  function morritos(g, k) {
    g.save(); g.translate(806, 728); g.rotate(0.22); g.scale(1.35 * k, 1.35 * k); g.lineJoin = "round";
    const forma = () => { g.beginPath(); g.moveTo(-6, -2); g.bezierCurveTo(-4, -26, 30, -30, 46, -12); g.bezierCurveTo(56, -2, 52, 14, 40, 18);
      g.bezierCurveTo(26, 30, -2, 26, -6, -2); g.closePath(); };
    forma(); g.fillStyle = "#d9675a"; g.fill();
    g.save(); forma(); g.clip(); g.fillStyle = "#b8453e"; g.beginPath(); g.ellipse(22, 16, 30, 10, 0.1, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.ellipse(24, -14, 12, 4, -0.1, 0, Math.PI * 2); g.fill(); g.restore();
    forma(); g.lineWidth = 6; g.strokeStyle = "#0b0a0e"; g.stroke();
    g.lineWidth = 4; g.beginPath(); g.moveTo(-2, 2); g.quadraticCurveTo(24, 6, 50, 2); g.stroke();
    g.restore();
  }

  /* =====================================================================================
   * DECORADO: bar convertido en pasarela
   * ===================================================================================== */
  const PISTA_Y0 = SUELO - 30, PISTA_Y1 = SUELO + 26;          // franja de luz de la pasarela
  const CHARCO = { x: 486, y: SUELO + 6, rx: 60, ry: 9 };
  let fondo = null, publico = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 100; const g = c.getContext("2d");
    g.translate(60, 50);
    // pared ciruela con rayas verticales satinadas
    const pared = g.createLinearGradient(0, -50, 0, 470); pared.addColorStop(0, "#1c0f26"); pared.addColorStop(1, "#3a1c45");
    g.fillStyle = pared; g.fillRect(-60, -50, W + 120, 520);
    for (let x = -60; x < W + 60; x += 46) { g.fillStyle = "rgba(255,255,255,0.025)"; g.fillRect(x, -50, 20, 520); }
    // cortina de espumillón plateado en el fondo
    for (let i = 0; i < 70; i++) {
      const x = 330 + i * 5.2 + hash(i) * 3, h = 330 + hash(i + 40) * 30;
      g.strokeStyle = `rgba(${200 + hash(i + 7) * 55 | 0},${200 + hash(i + 8) * 50 | 0},${230},${0.35 + hash(i + 9) * 0.35})`;
      g.lineWidth = 2; g.beginPath(); g.moveTo(x, 40); g.quadraticCurveTo(x + 3 * Math.sin(i), 40 + h * 0.5, x - 2, 40 + h); g.stroke();
    }
    g.fillStyle = "#120818"; g.fillRect(310, 22, 400, 22); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(310, 22, 400, 22);
    // marco de bombillas (sin letras) sobre la cortina
    g.strokeStyle = "#5a3a10"; g.lineWidth = 8; g.strokeRect(300, 14, 420, 380);
    // barra al fondo a la izquierda con botellas
    g.fillStyle = "#2a1410"; g.fillRect(-60, 290, 300, 180); g.fillStyle = "#4a2618"; g.fillRect(-60, 280, 300, 16);
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(-60, 280, 300, 190);
    g.fillStyle = "#1e0f0c"; g.fillRect(-60, 150, 300, 10);
    for (let i = 0; i < 9; i++) { const x = -40 + i * 30, h = 40 + (i % 3) * 8, col = ["#2f6a3a", "#7a2a2a", "#b98a2a", "#3a4f8a"][i % 4];
      g.fillStyle = col; g.beginPath(); g.moveTo(x - 8, 150); g.lineTo(x - 8, 150 - h + 14); g.quadraticCurveTo(x - 8, 150 - h + 6, x - 3, 150 - h + 2);
      g.lineTo(x - 3, 150 - h - 6); g.lineTo(x + 3, 150 - h - 6); g.lineTo(x + 3, 150 - h + 2); g.quadraticCurveTo(x + 8, 150 - h + 6, x + 8, 150 - h + 14); g.lineTo(x + 8, 150); g.closePath();
      g.fill(); g.lineWidth = 2; g.strokeStyle = "#0b0a0e"; g.stroke(); g.fillStyle = "rgba(255,255,255,0.3)"; g.fillRect(x - 5, 150 - h + 16, 2, h - 20); }
    // espejo dorado a la derecha
    g.fillStyle = "#c9a24a"; g.beginPath(); g.ellipse(900, 170, 62, 84, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.stroke();
    const esp = g.createLinearGradient(850, 100, 950, 240); esp.addColorStop(0, "#8fa3c9"); esp.addColorStop(1, "#3c4a72");
    g.fillStyle = esp; g.beginPath(); g.ellipse(900, 170, 50, 72, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.45)"; g.lineWidth = 4; g.beginPath(); g.moveTo(872, 130); g.lineTo(888, 110); g.moveTo(880, 160); g.lineTo(908, 124); g.stroke();
    // suelo oscuro brillante
    const su = g.createLinearGradient(0, 470, 0, H + 50); su.addColorStop(0, "#160b1c"); su.addColorStop(1, "#08040a");
    g.fillStyle = su; g.fillRect(-60, 470, W + 120, H + 50 - 470);
    g.fillStyle = "#4a2a52"; g.fillRect(-60, 466, W + 120, 6);
    // pasarela: franja de paneles claros con borde
    const pa = g.createLinearGradient(0, PISTA_Y0, 0, PISTA_Y1); pa.addColorStop(0, "#d9c7e6"); pa.addColorStop(0.5, "#f4eaf8"); pa.addColorStop(1, "#c5b0d6");
    g.fillStyle = pa; g.fillRect(-60, PISTA_Y0, W + 120, PISTA_Y1 - PISTA_Y0);
    g.strokeStyle = "rgba(120,90,140,0.45)"; g.lineWidth = 2;
    for (let x = -40; x < W + 60; x += 64) { g.beginPath(); g.moveTo(x, PISTA_Y0); g.lineTo(x - 10, PISTA_Y1); g.stroke(); }
    g.fillStyle = "#2a1630"; g.fillRect(-60, PISTA_Y0 - 5, W + 120, 5); g.fillRect(-60, PISTA_Y1, W + 120, 7);
    // charco (el brillo se pinta encima en cada fotograma)
    g.fillStyle = "rgba(120,190,230,0.55)"; g.beginPath(); g.ellipse(CHARCO.x, CHARCO.y, CHARCO.rx, CHARCO.ry, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(160,215,245,0.6)"; g.beginPath(); g.ellipse(CHARCO.x + 46, CHARCO.y - 2, 18, 5, 0, 0, Math.PI * 2); g.fill();
    // viñeta
    const v = g.createRadialGradient(512, 320, 240, 512, 320, 680); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.6)");
    g.fillStyle = v; g.fillRect(-60, -50, W + 120, H + 100);
    return c;
  }
  // cartel amarillo de suelo mojado (solo el muñequito que resbala), cacheado; se tambalea con el aire
  // cuando Guillermo pasa deslizándose por delante
  const CARTEL_X = 560;
  let cartel = null;
  function creaCartel() {
    const c = document.createElement("canvas"); c.width = 80; c.height = 120; const g = c.getContext("2d");
    g.translate(40, 82);
    g.fillStyle = "#e9b80f"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(-26, 30); g.lineTo(-14, -72); g.lineTo(14, -72); g.lineTo(26, 30); g.lineTo(18, 30); g.lineTo(10, -58); g.lineTo(-10, -58); g.lineTo(-18, 30); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#ffd21f"; g.beginPath(); g.moveTo(-22, 26); g.lineTo(-12, -66); g.lineTo(12, -66); g.lineTo(22, 26); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(0, -56); g.lineTo(16, -26); g.lineTo(-16, -26); g.closePath(); g.lineWidth = 2.5; g.stroke();
    g.fillStyle = "#0b0a0e"; g.beginPath(); g.arc(-2, -46, 3, 0, Math.PI * 2); g.fill();
    g.lineWidth = 2.6; g.lineCap = "round"; g.beginPath(); g.moveTo(-2, -42); g.lineTo(2, -34); g.moveTo(2, -34); g.lineTo(8, -30); g.moveTo(2, -34); g.lineTo(-6, -30);
    g.moveTo(-1, -40); g.lineTo(-8, -38); g.moveTo(-1, -40); g.lineTo(6, -44); g.stroke();
    g.beginPath(); g.moveTo(-12, -28); g.quadraticCurveTo(0, -31, 12, -28); g.lineWidth = 1.6; g.stroke();
    return c;
  }
  function dibCartel(g, t) {
    if (!cartel) cartel = creaCartel();
    const u = t - 9.22, a = u > 0 ? 0.22 * Math.exp(-u * 3.2) * Math.sin(u * 13) * suave(fase(u, 0, 0.08)) : 0;
    g.save(); g.translate(CARTEL_X + (a > 0 ? 18 : -18), SUELO); g.rotate(a); g.translate(-(a > 0 ? 18 : -18), 0);
    g.drawImage(cartel, -40, -114); g.restore();
  }
  // público a contraluz delante (cabezas, hombros y cámaras), cacheado
  const PUBLICO = [[40, 0], [120, 1], [215, 0], [300, 2], [395, 1], [490, 0], [585, 2], [680, 1], [770, 0], [860, 2], [950, 1], [1010, 0]];
  function creaPublico() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = 140; const g = c.getContext("2d");
    g.translate(60, 0);
    PUBLICO.forEach(([x, tipo], i) => {
      const y = 74 + hash(i * 3) * 10, r = 17 + hash(i * 5) * 4;
      g.fillStyle = "#050307";
      g.beginPath(); g.ellipse(x, y + r * 1.9, r * 1.9, r * 1.2, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      if (tipo === 1) { g.fillRect(x - 5, y - r - 14, 10, 16); g.fillRect(x - 11, y - r - 22, 22, 15); }   // cámara en alto
      if (tipo === 2) { g.save(); g.translate(x + 10, y - r - 6); g.rotate(-0.25); g.fillRect(-6, -11, 12, 20); g.restore(); }   // móvil
      g.strokeStyle = "rgba(170,120,200,0.35)"; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r, Math.PI * 1.1, Math.PI * 1.6); g.stroke();
    });
    return c;
  }
  const P_Y = 510;                                          // dónde va el público (pantalla)

  /* ---------- luces por fotograma ---------- */
  function focos(g, t, pG, pC) {
    g.save(); g.globalCompositeOperation = "lighter";
    const enc = tramo(t, T.foco, T.foco + 0.5);
    // cañón de seguimiento a Carla y otro a Guillermo
    const cono = (x, k, col) => {
      if (k <= 0.01) return;
      const gr = g.createLinearGradient(0, -40, 0, SUELO + 20); gr.addColorStop(0, `rgba(${col},${0.02 * k})`); gr.addColorStop(1, `rgba(${col},${0.2 * k})`);
      g.fillStyle = gr; g.beginPath(); g.moveTo(x - 22, -40); g.lineTo(x + 22, -40); g.lineTo(x + 120, SUELO + 10); g.lineTo(x - 120, SUELO + 10); g.closePath(); g.fill();
      const ci = g.createRadialGradient(x, SUELO + 4, 4, x, SUELO + 4, 130); ci.addColorStop(0, `rgba(${col},${0.35 * k})`); ci.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = ci; g.beginPath(); g.ellipse(x, SUELO + 4, 130, 26, 0, 0, Math.PI * 2); g.fill();
    };
    cono(pC.x, enc, "255,226,240");
    cono(G.aPantalla(pG, pG.pelvis).x, tramo(t, T.gSacude0, T.desfile0 + 0.3), "255,236,200");
    // luces del borde de la pasarela: una ola que corre hacia la izquierda
    for (let i = 0; i < 34; i++) {
      const x = -10 + i * 32, ola = 0.5 + 0.5 * Math.sin(i * 0.7 + t * 6);
      for (const y of [PISTA_Y0 - 2.5, PISTA_Y1 + 3.5]) {
        g.fillStyle = `rgba(255,${190 + 50 * ola | 0},${220},${0.25 + 0.6 * ola * enc})`;
        g.beginPath(); g.arc(x + (y > SUELO ? -6 : 0), y, 2.6, 0, Math.PI * 2); g.fill();
      }
    }
    // brillo del charco
    const br = 0.4 + 0.25 * Math.sin(t * 3);
    g.fillStyle = `rgba(200,240,255,${0.35 * br})`; g.beginPath(); g.ellipse(CHARCO.x - 18, CHARCO.y - 2, 22, 3, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // flashes de los fotógrafos: [t, x, y, tamaño]
  const FLASHES = [[1.0, 120, 560, 1], [1.45, 860, 562, 0.8], [1.9, 300, 556, 1], [2.3, 680, 560, 0.9], [2.75, 950, 558, 1], [3.18, 395, 560, 1.1],
    [3.32, 770, 556, 1], [3.48, 215, 562, 0.9], [4.42, 585, 558, 1.1], [4.56, 860, 562, 1], [4.66, 120, 560, 1.2], [4.82, 680, 556, 1], [4.98, 300, 562, 0.9],
    [9.22, 215, 560, 1.4]];
  function flashes(g, t) {
    g.save(); g.globalCompositeOperation = "lighter";
    for (const [t0, x, y, k] of FLASHES) {
      if (!k) continue;
      const u = t - t0; if (u < 0 || u > 0.32) continue;
      const a = u < 0.04 ? u / 0.04 : Math.exp(-(u - 0.04) * 13);
      const gr = g.createRadialGradient(x, y, 2, x, y, 70 * k); gr.addColorStop(0, `rgba(255,255,255,${0.95 * a})`); gr.addColorStop(0.25, `rgba(230,240,255,${0.5 * a})`); gr.addColorStop(1, "rgba(200,220,255,0)");
      g.fillStyle = gr; g.fillRect(x - 70 * k, y - 70 * k, 140 * k, 140 * k);
      g.strokeStyle = `rgba(255,255,255,${0.8 * a})`; g.lineWidth = 2; g.lineCap = "round";
      for (let j = 0; j < 4; j++) { const an = j * Math.PI / 4 + 0.3, r = 26 * k * (0.8 + 0.4 * a);
        g.beginPath(); g.moveTo(x + Math.cos(an) * r, y + Math.sin(an) * r); g.lineTo(x - Math.cos(an) * r, y - Math.sin(an) * r); g.stroke(); }
    }
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrellaPuntas(g, x, y, r, puntas, rot, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  // destellos del taconazo y del guiño
  function destello(g, t, t0, x, y, r) {
    const k = fase(t, t0, t0 + 0.4); if (k <= 0 || k >= 1) return;
    const s = Math.sin(Math.PI * k);
    g.save(); estrellaPuntas(g, x, y, r * s, 4, t * 2, 0.22); g.fillStyle = "#fffbe0"; g.fill(); g.lineWidth = 1.6; g.strokeStyle = "#0b0a0e"; g.stroke(); g.restore();
  }
  // líneas del giro
  function lineasGiro(g, t, pC) {
    const k = Math.sin(Math.PI * fase(t, T.giro0, T.giro1)); if (k <= 0.01) return;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.7 * k})`; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const y = SUELO - 120 - i * 95, r = 70 + 10 * i, a0 = t * 14 + i;
      g.beginPath(); g.ellipse(pC.x, y, r, 14, 0, a0, a0 + 2.2); g.stroke(); }
    g.restore();
  }
  // corazones de Guillermo embobado
  function corazones(g, t, pG) {
    const env = dentro(t, T.gEmbob + 0.6, T.gEmbob + 1, T.gAbanico0, T.gAbanico0 + 0.3); if (env <= 0.01) return;
    const c = G.aPantalla(pG, G.cabeza(pG).a({ x: 820, y: 380 }));
    g.save();
    for (let i = 0; i < 3; i++) {
      const ph = ((t - T.gEmbob) * 0.8 + i / 3) % 1;
      const x = c.x + 18 * Math.sin(t * 3 + i * 2) + 18 * i - 10, y = c.y - 70 * ph;
      g.globalAlpha = env * Math.sin(Math.PI * ph);
      g.save(); g.translate(x, y); g.scale(0.8, 0.8);
      g.beginPath(); g.moveTo(0, 8); g.bezierCurveTo(-14, -2, -8, -14, 0, -6); g.bezierCurveTo(8, -14, 14, -2, 0, 8); g.closePath();
      g.fillStyle = i % 2 ? "#ff6f91" : "#ff3d6a"; g.fill(); g.lineWidth = 2.4; g.strokeStyle = "#0b0a0e"; g.stroke();
      g.restore();
    }
    g.restore();
  }
  // estela de agua y salpicadura bajo la zapatilla de delante
  function salpica(g, t, pG) {
    if (t < T.pisa || t > T.para + 0.6) return;
    const tob = G.aPantalla(pG, pG.piernas.cerca.tob), xi = X_PISA;
    // reguero mojado brillante desde el charco
    g.save(); g.globalAlpha = 0.55 * (1 - tramo(t, T.para + 0.2, T.para + 0.6));
    g.fillStyle = "rgba(150,210,240,0.7)"; g.beginPath(); g.ellipse((xi + tob.x) / 2 + 20, SUELO + 2, Math.max(4, (tob.x - xi) / 2 + 20), 4, 0, 0, Math.PI * 2); g.fill();
    g.restore();
    const vel = t < T.para ? Math.pow(1 - fase(t, T.pisa, T.para), 1.6) : 0;
    if (vel <= 0.02) return;
    g.save(); g.fillStyle = "#cdeeff"; g.strokeStyle = "#1d3b52"; g.lineWidth = 1.6;
    for (let i = 0; i < 8; i++) {
      const ph = ((t * 3.2 + i / 8) % 1), a = -0.4 - hash(i + 20) * 1.0;
      const r = (14 + 46 * ph) * vel, x = tob.x + 22 + Math.cos(a) * r, y = SUELO - 4 + Math.sin(a) * r + 30 * ph * ph;
      g.globalAlpha = (1 - ph) * vel; g.beginPath(); g.ellipse(x, y, 4, 3, a, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    g.restore();
  }
  // golpe al caer en espagat: estrellitas y rayitas de «crac»
  function crac(g, t, pG) {
    const k = fase(t, T.cae1, T.cae1 + 0.55); if (k <= 0 || k >= 1) return;
    const c = { x: G.aPantalla(pG, pG.pelvis).x, y: SUELO - 6 };
    g.save(); g.globalAlpha = 1 - k; g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.lineCap = "round";
    for (let j = 0; j < 5; j++) { const a = Math.PI * (1.12 + 0.19 * j), r0 = 40 + 24 * salida(k), r1 = r0 + 16;
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0 * 0.6); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1 * 0.6); g.stroke(); }
    g.restore();
  }
  // visor de cámara alrededor de Guillermo y destello entre las manos de Carla
  function clic(g, t, pG, pC) {
    const k = fase(t, T.clic, T.clic + 0.8); if (k <= 0 || k >= 1) return;
    const a = suave(k / 0.2) * (1 - tramo(k, 0.6, 1));
    const sc = 1 + 0.18 * Math.exp(-k * 14);
    const x0 = G.aPantalla(pG, pG.piernas.lejos.tob).x - 24, x1 = G.aPantalla(pG, pG.piernas.cerca.tob).x + 14;
    const y0 = G.aPantalla(pG, G.cabeza(pG).a({ x: 760, y: 220 })).y - 10, y1 = SUELO + 14;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, hw = (x1 - x0) / 2 * sc, hh = (y1 - y0) / 2 * sc, L = 28;
    g.save(); g.globalAlpha = a; g.lineCap = "round"; g.lineJoin = "round";
    for (const [col, w] of [["#0b0a0e", 8], ["#ffffff", 4]]) {
      g.strokeStyle = col; g.lineWidth = w; g.beginPath();
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const x = cx + sx * hw, y = cy + sy * hh;
        g.moveTo(x - sx * L, y); g.lineTo(x, y); g.lineTo(x, y - sy * L);
      }
      g.stroke();
    }
    g.restore();
    // destello en el marco de las manos
    const m = CA.aPantalla(pC, mezcla(pC.manoCerca, pC.manoLejos, 0.5));
    const f = k < 0.12 ? suave(k / 0.12) : Math.exp(-(k - 0.12) * 8);
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createRadialGradient(m.x, m.y, 2, m.x, m.y, 90); gr.addColorStop(0, `rgba(255,255,255,${0.95 * f})`); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(m.x - 90, m.y - 90, 180, 180); g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const posa = dentro(t, T.planta, T.planta + 0.5, T.mira, T.mira + 0.6);
    const fin = tramo(t, T.para - 0.3, T.pose1, suave);
    return { k: 1 + 0.04 * posa + 0.1 * fin, x: 512 + 60 * posa + 90 * fin, y: 300 + 10 * posa + 40 * fin };
  }

  function poses(t) {
    const pC = poseC(t);
    const pG = poseG(t, pC);
    return { g: pG, c: pC };
  }

  class GuillermoPasarela extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !CA.listo()) return;
      if (!fondo) { fondo = creaFondo(); publico = creaPublico(); }
      const { g: pG, c: pC } = poses(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = t >= T.cae1 ? 3 * Math.exp(-(t - T.cae1) * 8) * suave(fase(t, T.cae1, T.cae1 + 0.05)) : 0;
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -60, -50);
      focos(g, t, pG, pC);
      dibCartel(g, t);
      // sombras
      g.save(); g.fillStyle = "rgba(0,0,0,0.4)";
      g.beginPath(); g.ellipse(G.aPantalla(pG, pG.pelvis).x, SUELO + 2, apertura(t) > 0.5 ? 170 : 58, 7, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pC.x, SUELO + 2, 52, 6, 0, 0, Math.PI * 2); g.fill();
      g.restore();
      salpica(g, t, pG);
      G.dibujar(g, pG, t);
      // Carla (con el giro sobre sí misma)
      const gx = Math.cos(pC.giro);
      g.save(); g.translate(pC.x, 0); g.scale(Math.abs(gx) < 0.02 ? 0.02 * Math.sign(gx || 1) : gx, 1); g.translate(-pC.x, 0);
      CA.dibujar(g, pC, t);
      g.restore();
      lineasGiro(g, t, pC);
      corazones(g, t, pG);
      crac(g, t, pG);
      destello(g, t, T.planta1 - 0.05, pC.x - 30, SUELO - 6, 16);
      destello(g, t, T.guino + 0.05, CA.aPantalla(pC, CA.cabeza(pC).a({ x: 940, y: 470 })).x - 6, CA.aPantalla(pC, CA.cabeza(pC).a({ x: 940, y: 470 })).y - 6, 14);
      destello(g, t, T.guinoC + 0.05, CA.aPantalla(pC, CA.cabeza(pC).a({ x: 940, y: 470 })).x - 6, CA.aPantalla(pC, CA.cabeza(pC).a({ x: 940, y: 470 })).y - 6, 14);
      clic(g, t, pG, pC);
      g.drawImage(publico, -60, P_Y);
      flashes(g, t);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00041", nombre: "Guillermo y Carla · La pasarela", crear: () => new GuillermoPasarela() });
  window.__A2D_00041 = { pose: poses, T, DUR };
})();
