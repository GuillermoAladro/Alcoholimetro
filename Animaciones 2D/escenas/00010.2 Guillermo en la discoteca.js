"use strict";
/* 00010.2 · Guillermo en la discoteca
 *
 * Negro → pista de baile a oscuras. Guillermo, con las manos en los bolsillos, ve bajar del techo
 * una bola de espejos → un foco la ilumina, empieza a girar y llena la sala de puntitos de luz →
 * arranca la música (120 pulsaciones por minuto; todo va a ese ritmo: luces, suelo, altavoces y
 * baile) → marca el ritmo con el pie y la cabeza → saca las manos y se viene arriba con las
 * rodillas → el paso de «Fiebre del sábado noche»: mano en la cadera y el dedo apuntando al cielo y
 * cruzando abajo, a cada golpe → mueve la cadera haciendo rodar las manos y guiña un ojo a cámara →
 * sale de escena haciendo el moonwalk hacia la izquierda → la bola sigue girando, se apagan las
 * luces → negro.
 *
 * Sin textos: las notas musicales son dibujos. Todo depende del tiempo absoluto.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, rebote, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo;
  const S = 0.31, SUELO = 548, XG = 404;
  const DUR = 13.6;
  const BEAT = 0.5, M0 = 2.7;                    // 120 ppm; el golpe 0 es cuando se encienden las luces
  const b = n => M0 + n * BEAT;
  const T = {
    baja0: 0.45, baja1: 2.0, mira0: 0.85, foco: 2.12, gira: 2.25, M0,
    tap0: b(1), salen: b(4), fiebre0: b(8), cadera0: b(13), guino: b(14), moon0: b(15), fin: 13.0
  };
  // golpe de música: 1 en cada pulso, 0 a mitad (forma suave, sin cortes)
  const golpe = t => { if (t < M0 - 0.25) return 0; const f = (t - M0) / BEAT; const c = 0.5 + 0.5 * Math.cos(2 * Math.PI * f); return c * c; };
  const musica = t => tramo(t, M0 - 0.08, M0 + 0.4);

  /* ---------- pies ---------- */
  const TOB_Y = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const MW = { s: 56, P: 0.25 };                 // moonwalk: zancada (px de pantalla) y medio ciclo (s)
  const PASOS = {
    cerca: [[-10, -9, XG - 19], [T.salen - 0.14, T.salen + 0.08, XG - 50], [b(14) - 0.02, b(14) + 0.16, XG - MW.s / 2]],
    lejos: [[-10, -9, XG + 18], [T.salen + 0.36, T.salen + 0.58, XG + 48], [b(14) + 0.23, b(14) + 0.41, XG + MW.s / 2]]
  };
  function paso(lado, t) {
    const L = PASOS[lado]; let i = 0; while (i + 1 < L.length && t >= L[i + 1][0]) i++;
    const [t0, t1, x] = L[i], xa = i > 0 ? L[i - 1][2] : x, u = fase(t, t0, t1);
    const arco = Math.sin(Math.PI * u);
    return { x: lerp(xa, x, suave5(u)), alza: 45 * arco, ang: -0.18 * arco };
  }
  // giro del pie alrededor de un punto de apoyo (punta o talón) que no se mueve
  const rotP = (q, a) => ({ x: q.x * Math.cos(a) - q.y * Math.sin(a), y: q.x * Math.sin(a) + q.y * Math.cos(a) });
  function apoyo(tob, ang, punto) { const r = rotP(punto, ang); return { x: tob.x + punto.x - r.x, y: tob.y + punto.y - r.y }; }

  const XMOON = XG;                              // centro de los pies al empezar el moonwalk
  const avance = v => (v < 1 ? v * v * (2 - v) : v);   // arranque suave y luego velocidad constante
  function moonwalk(t) {
    // Medio ciclo k: un pie está de puntillas, quieto sobre la punta; el otro va plano y resbala hacia
    // atrás desde delante hasta quedar detrás. Al acabar se cambian los papeles.
    const v = (t - T.moon0) / MW.P, k = Math.floor(v), u = v - k, s = MW.s;
    const puntillas = k % 2 === 0 ? "cerca" : "lejos", plano = puntillas === "cerca" ? "lejos" : "cerca";
    const xk = XMOON - s / 2 - k * s;
    const e = k === 0 ? suave(u) * 0.35 + u * u * 0.65 : 0.82 * u + 0.18 * suave(u);
    const sube = 0.42 * suave(u / 0.4), baja = k === 0 ? 0 : 0.42 * (1 - suave(u / 0.28));
    return { [puntillas]: { x: xk, talon: sube }, [plano]: { x: xk + s - 2 * s * e, talon: baja } };
  }
  function pies(t) {
    const out = {};
    if (t >= T.moon0) {
      const m = moonwalk(t);
      for (const lado of ["cerca", "lejos"]) out[lado] = { x: m[lado].x, alza: 0, ang: 0, talon: m[lado].talon, punta: 0 };
      return out;
    }
    for (const lado of ["cerca", "lejos"]) { const q = paso(lado, t); out[lado] = { x: q.x, alza: q.alza, ang: q.ang, talon: 0, punta: 0 }; }
    // marca el ritmo con la punta del pie de delante (el talón se queda en el suelo)
    const tap = tramo(t, T.tap0 - 0.3, T.tap0) * (1 - tramo(t, T.salen - 0.35, T.salen - 0.1));
    if (tap > 0) { const f = (t - M0) / BEAT; out.lejos.punta = 0.3 * tap * Math.pow(Math.sin(Math.PI * f), 2); }
    // en el baile, el pie de detrás se levanta un poco en cada golpe
    return out;
  }

  /* ---------- posturas ---------- */
  const P0 = { dx: 0, pel: 0, torso: 0, cab: 0, cx: 49, cy: 340, ca: 0, cmu: -1.75, cp: 0, lx: 0, ly: 300, la: 0, lmu: -1.75, lp: 0, lpol: 0, dedo: 0 };
  const C_ = o => Object.assign({}, P0, o);
  const CUERPOS = {
    bolsillos: C_({}),
    mira: C_({ cab: -0.08, torso: -0.03 }),
    groove: C_({ pel: 22, torso: 0.03, cx: 80, cy: 205, ca: 0.4, cmu: -1.6, cp: 1, lx: 46, ly: 205, la: 0.3, lmu: -1.75, lp: 1 }),
    fiebre: C_({ pel: 26, cx: 22, cy: 222, ca: 1.25, cmu: -1.6, cp: 1, lx: 120, ly: -200, la: -2.3, lp: 1, lpol: 1, dedo: 1 }),
    cadera: C_({ pel: 24, torso: 0.02, cx: 168, cy: 92, ca: 0.3, cmu: -1.6, cp: 1, lx: -20, ly: 180, la: 0.2, lmu: -1.75, lp: 1 }),
    moon: C_({ pel: 16, torso: 0.07, cab: 0.03, cx: 46, cy: 235, ca: 0.35, cmu: -1.6, cp: 1, lx: 70, ly: 215, la: 0.25, lmu: -1.75, lp: 1 })
  };
  const GUION_CUERPO = [
    [T.mira0, T.mira0 + 0.5, "mira"], [M0 + 0.1, M0 + 0.5, "bolsillos"], [T.salen - 0.18, T.salen + 0.18, "groove"],
    [T.fiebre0 - 0.18, T.fiebre0 + 0.04, "fiebre"], [T.cadera0 - 0.14, T.cadera0 + 0.12, "cadera"], [T.moon0 - 0.18, T.moon0 + 0.15, "moon"]
  ];
  const mezclaE = (a, c, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], c[n], k); return o; };
  function postura(t) {
    let c = CUERPOS.bolsillos;
    for (const [t0, t1, nom] of GUION_CUERPO) { if (t <= t0) break; c = mezclaE(c, CUERPOS[nom], suave(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  // «Fiebre del sábado noche»: 1 = dedo al cielo, 0 = abajo cruzando el cuerpo; cambia en cada golpe.
  const FIEBRE = [[b(9), 0], [b(10), 1], [b(11), 0], [b(12), 1]];
  function brazoFiebre(t) { let a = 1; for (const [tb, v] of FIEBRE) a = lerp(a, v, suave(fase(t, tb - 0.17, tb + 0.01))); return a; }
  const ARRIBA = { f: -0.98, r: 292 }, ABAJO = { f: 0.78, r: 292 };

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, gu: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0 };
  const E = o => Object.assign({}, BASE, o);
  const CARAS = {
    inicio: E({}),
    curioso: E({ mx: 0.6, my: -0.9, sd: 14, gd: 0.1, si: 10, gi: 0.05, orig: 0, abre: 10, ancho: 0.55, sonr: 0 }),
    asombro: E({ mx: 0.55, my: -0.9, iris: 1.12, sd: 24, gd: 0.15, si: 22, gi: 0.12, orig: 0, abre: 30, ancho: 0.62, sonr: 0.1, lengua: 0.3 }),
    guay: E({ mx: -0.85, my: -0.2, sd: 16, gd: 0.15, si: -4, gi: -0.08, orig: 0, sonr: 0.72, ancho: 0.95 }),
    groove: E({ mx: 0.3, my: 0.15, c: 0.62, h: 1, sd: 8, gd: 0.1, si: 8, gi: 0.1, orig: 0, abre: 8, sonr: 0.85, ancho: 1 }),
    arriba: E({ mx: 0.85, my: -0.9, sd: 18, gd: 0.15, si: 18, gi: 0.15, orig: 0, abre: 30, ancho: 1.05, sonr: 0.9 }),
    guino: E({ mx: -0.85, my: -0.15, gu: 1, h: 1, sd: 18, gd: 0.18, si: -6, gi: -0.15, orig: 0, abre: 4, sonr: 1, ancho: 1.05 }),
    moon: E({ mx: -0.85, my: 0, c: 0.3, sd: 8, gd: 0.1, si: 4, gi: 0.05, orig: 0, sonr: 0.7, ancho: 0.95, abre: 2 })
  };
  const GUION_CARA = [
    [T.mira0, T.mira0 + 0.35, "curioso"], [T.foco, T.foco + 0.2, "asombro"], [M0 + 0.2, M0 + 0.5, "guay"], [b(3), b(3) + 0.3, "groove"],
    [T.fiebre0 - 0.18, T.fiebre0 + 0.04, "arriba"], [T.cadera0, T.cadera0 + 0.25, "groove"], [T.guino - 0.1, T.guino + 0.15, "guino"],
    [T.moon0 + 0.15, T.moon0 + 0.5, "moon"]
  ];
  function expresion(t) {
    let e = CARAS.inicio;
    for (const [t0, t1, nom] of GUION_CARA) { if (t <= t0) break; e = mezclaE(e, CARAS[nom], suave(fase(t, t0, t1))); }
    return Object.assign({}, e);
  }
  function parpadeos(t) {
    let o = 0;
    for (const tb of [1.55, 6.2, 11.4]) { const k = fase(t, tb, tb + 0.14); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); }
    return o;
  }

  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLSILLO_C = punoDesde({ x: 131, y: 652 }, 0, -1.75), BOLSILLO_L = punoDesde({ x: 372, y: 648 }, 0, -1.75);

  // dedo índice estirado (en unidades de mano, sale por debajo del puño en la dirección del brazo)
  function dedo(k) {
    return g => {
      if (k <= 0.01) return;
      const L = 25 * k;
      g.save(); g.translate(4, 4); g.rotate(-0.18); g.lineJoin = "round"; g.lineCap = "round";
      g.beginPath(); g.moveTo(-4.6, 0); g.lineTo(-4.6, L); g.arc(0, L, 4.6, Math.PI, 0, true); g.lineTo(4.6, 0); g.closePath();
      g.fillStyle = G.C.piel; g.fill(); g.lineWidth = 1.8; g.strokeStyle = G.C.tinta; g.stroke();
      g.fillStyle = "#ffd9c4"; g.beginPath(); g.ellipse(0.6, L - 1.2, 2.6, 3.2, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 0.9; g.stroke();
      g.lineWidth = 1.1; g.beginPath(); g.moveTo(-2.5, L * 0.45); g.quadraticCurveTo(0, L * 0.45 + 1.6, 2.5, L * 0.45); g.stroke();
      g.restore();
    };
  }

  function pose(t) {
    const c0 = postura(t);
    const respira = Math.sin(t * 2.3), mu = musica(t), gp = golpe(t) * mu;
    // cuánto baila con las rodillas en cada tramo
    const rodillas = tramo(t, T.salen - 0.2, T.salen + 0.3) * (1 - 0.35 * tramo(t, T.moon0 - 0.2, T.moon0 + 0.2));
    const cabezazo = mu * (0.35 + 0.65 * tramo(t, T.tap0 - 0.3, T.tap0));
    const fiebre = tramo(t, T.fiebre0 - 0.18, T.fiebre0 + 0.04) * (1 - tramo(t, T.cadera0 - 0.14, T.cadera0 + 0.12));
    const cadera = tramo(t, T.cadera0 - 0.1, T.cadera0 + 0.2) * (1 - tramo(t, T.moon0 - 0.25, T.moon0));
    const a = brazoFiebre(t);
    let dx = c0.dx, torso = c0.torso;
    // fiebre: al subir el dedo la cadera sale y el cuerpo se echa atrás; al bajar se recoge
    dx += fiebre * lerp(4, 16, a); torso += fiebre * lerp(0.1, -0.1, a);
    // cadera de lado a lado, una vez por golpe
    const ph = Math.PI * (t - T.cadera0) / BEAT;
    dx += cadera * 15 * Math.sin(ph); torso += cadera * -0.06 * Math.sin(ph);
    let x = XG + dx;
    if (t >= T.moon0) { const v = (t - T.moon0) / MW.P; x = XMOON - MW.s * avance(v) + dx; }
    const p = {
      x, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + c0.pel + respira * 1.2 + 18 * gp * rodillas + 6 * gp * fiebre + 26 * fiebre * (1 - a) - 16 * campana(t, T.foco, T.foco + 0.3) },
      torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 - 0.012 * gp * rodillas },
      piernas: {}, cabeza: { ang: c0.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }, cara: null
    };
    // pies (en la hoja)
    const F = pies(t);
    for (const lado of ["cerca", "lejos"]) {
      const f = F[lado];
      let tob = { x: G.PELVIS.x + (f.x - p.x) / S, y: TOB_Y[lado] - f.alza }, ang = f.ang;
      if (f.talon > 0) { ang += f.talon; tob = apoyo(tob, f.talon, G.PUNTA); }
      if (f.punta > 0) { ang -= f.punta; tob = apoyo(tob, -f.punta, G.TALON); }
      p.piernas[lado] = { tob, ang };
    }
    // cabeza al ritmo
    p.cabeza.ang += 0.055 * gp * cabezazo - 0.03 * fiebre * (a - 0.5);
    p.cabeza.dy += 7 * gp * cabezazo;
    // cara
    const e = expresion(t);
    e.c = Math.max(e.c, parpadeos(t));
    e.sd += 7 * gp * (1 - tramo(t, b(2), b(3))) * tramo(t, M0 + 0.2, M0 + 0.5);       // cejas arriba con los primeros golpes
    if (fiebre > 0) { e.my = lerp(e.my, lerp(0.7, -0.9, a), fiebre); e.abre = lerp(e.abre, lerp(10, 30, a), fiebre); }
    p.cara = { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: 0, ojos: { d: e.c, i: Math.max(e.c, e.gu), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: 0, rubor: 0.25 * mu, bigote: 0 };
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    const enBolsC = 1 - clamp(c0.cp * 1.5), enBolsL = 1 - clamp(c0.lp * 1.5);
    let c = { x: hc.x + c0.cx, y: hc.y + c0.cy }, l = { x: hl.x + c0.lx, y: hl.y + c0.ly }, la = c0.la;
    // brazo de la fiebre en polares alrededor del hombro (el brazo gira, no se encoge)
    if (c0.lpol > 0) {
      const f = lerp(ABAJO.f, ARRIBA.f, a), r = lerp(ABAJO.r, ARRIBA.r, a) * (1 - 0.08 * Math.sin(Math.PI * a));
      l = mezcla(l, { x: hl.x + Math.cos(f) * r, y: hl.y + Math.sin(f) * r }, c0.lpol);
      la = lerp(la, f - 1.39, c0.lpol);
    }
    c = mezcla(c, BOLSILLO_C, enBolsC * (1 - c0.cp)); l = mezcla(l, BOLSILLO_L, enBolsL * (1 - c0.lp));
    l.x += 75 * Math.pow(Math.sin(Math.PI * fase(t, T.fiebre0 - .18, T.fiebre0 + .04)), 2);
    // puños al ritmo, uno arriba y otro abajo
    const groove = tramo(t, T.salen - 0.1, T.salen + 0.3) * (1 - tramo(t, T.fiebre0 - 0.2, T.fiebre0));
    const alt = Math.sin(Math.PI * (t - M0) / BEAT);
    c.y -= 28 * alt * groove; l.y += 28 * alt * groove; c.x += 10 * gp * groove;
    // manos que ruedan delante del pecho
    const w = 2 * Math.PI * (t - T.cadera0) / BEAT;
    c.x += cadera * 40 * Math.cos(w); c.y += cadera * 34 * Math.sin(w);
    l.x += cadera * 40 * Math.cos(w + Math.PI); l.y += cadera * 34 * Math.sin(w + Math.PI);
    // El brazo baja por fuera antes de hacer los círculos, sin plegarse sobre el cuello.
    l.x += 85 * Math.pow(Math.sin(Math.PI * fase(t, T.cadera0 - .14, T.cadera0 + .12)), 2);
    // moonwalk: los brazos se balancean con los pasos
    const mw = tramo(t, T.moon0, T.moon0 + 0.3), sw = Math.sin(Math.PI * (t - T.moon0) / MW.P);
    c.x += 16 * sw * mw; l.x -= 16 * sw * mw; c.y -= 8 * gp * mw; l.y -= 8 * gp * mw;
    p.manoCerca = { x: c.x, y: c.y, ang: c0.ca, mu: c0.cmu, dobla: -1, puno: c0.cp };
    p.manoLejos = { x: l.x, y: l.y, ang: la, mu: c0.lmu, dobla: -1, puno: c0.lp, objeto: c0.dedo > 0.01 ? dedo(c0.dedo) : null };
    p.ikContinuo = true; p.hombrosContinuos = true; p.tirasLimpias = true;               // rodillas y codos sin dientes de sierra
    return p;
  }

  // «ting»: destello en la sonrisa al guiñar el ojo
  function destello(g, t, p) {
    const k = fase(t, T.guino + 0.08, T.guino + 0.5); if (k <= 0 || k >= 1) return;
    const c = G.aPantalla(p, G.cabeza(p).a({ x: 786, y: 738 })), r = 12 * Math.sin(Math.PI * k), giro = k * 1.2;
    g.save(); g.translate(c.x, c.y); g.rotate(giro); g.globalCompositeOperation = "lighter";
    for (const [esc, al] of [[1.8, 0.25], [1, 1]]) {
      const R = r * esc; g.fillStyle = `rgba(255,255,240,${al})`; g.beginPath();
      g.moveTo(0, -R); g.quadraticCurveTo(0, 0, R * 0.8, 0); g.quadraticCurveTo(0, 0, 0, R); g.quadraticCurveTo(0, 0, -R * 0.8, 0); g.quadraticCurveTo(0, 0, 0, -R); g.fill();
    }
    g.restore();
  }

  /* ---------- luces ---------- */
  const PALETA = [[255, 46, 136], [30, 227, 255], [255, 210, 30], [155, 77, 255], [43, 255, 136]];
  function colorCiclo(u) {
    u = ((u % PALETA.length) + PALETA.length) % PALETA.length;
    const i = Math.floor(u), k = suave(u - i), a = PALETA[i], c = PALETA[(i + 1) % PALETA.length];
    return [0, 1, 2].map(j => Math.round(lerp(a[j], c[j], k)));
  }
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  /* bola de espejos */
  const BX = 700, BR = 40;
  function bolaPos(t) {
    const k = fase(t, T.baja0, T.baja1);
    const y = lerp(-70, 98, rebote(k, 1.25));
    const bal = 0.05 * Math.sin((t - T.baja1) * 3.1) * Math.exp(-Math.max(0, t - T.baja1) * 0.9) * tramo(t, T.baja1 - 0.3, T.baja1);
    return { x: BX + Math.sin(bal) * (y + 20), y: y - (1 - Math.cos(bal)) * (y + 20), bal };
  }
  function giro(t) {
    if (t < T.gira) return 0;
    const tau = t - T.gira, R0 = 0.9, w = 1.5;
    return tau < R0 ? w * tau * tau / (2 * R0) : w * (tau - R0 / 2);
  }
  const focoK = t => tramo(t, T.foco, T.foco + 0.16);
  const LUZ = { x: -0.62, y: -0.66, z: 0.42 };
  function bola(g, t) {
    const q = bolaPos(t), rho = giro(t), il = focoK(t), mu = musica(t);
    const tinte = colorCiclo((t - M0) * 0.35);
    g.save();
    // cadena
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 5; g.beginPath(); g.moveTo(BX, -20); g.lineTo(q.x, q.y - BR + 2); g.stroke();
    g.strokeStyle = "#6f6a78"; g.lineWidth = 2; g.setLineDash([5, 3]); g.stroke(); g.setLineDash([]);
    g.translate(q.x, q.y); g.rotate(q.bal);
    const fondo = g.createRadialGradient(-12, -14, 4, 0, 0, BR);
    fondo.addColorStop(0, `rgb(${110 + 90 * il},${110 + 90 * il},${125 + 90 * il})`); fondo.addColorStop(1, "#1c1a24");
    g.fillStyle = fondo; g.beginPath(); g.arc(0, 0, BR, 0, Math.PI * 2); g.fill();
    // teselas de espejo: brillan según la luz del foco y lanzan destellos al pasar
    const brillos = [];
    const NB = 9, NL = 16;
    for (let i = 0; i < NB; i++) {
      const a0 = -1.35 + i * 0.3, a1 = a0 + 0.3, am = (a0 + a1) / 2;
      for (let j = 0; j < NL; j++) {
        const l0 = j * 2 * Math.PI / NL + rho + (i % 2) * 0.2, l1 = l0 + 2 * Math.PI / NL, lm = (l0 + l1) / 2;
        if (Math.cos(lm) <= 0.05) continue;
        const pt = (la, lo) => ({ x: BR * Math.cos(la) * Math.sin(lo), y: -BR * Math.sin(la) });
        const m = 0.1;
        const q1 = pt(a0 + m * 0.3, l0 + m * 0.4), q2 = pt(a0 + m * 0.3, l1 - m * 0.4), q3 = pt(a1 - m * 0.3, l1 - m * 0.4), q4 = pt(a1 - m * 0.3, l0 + m * 0.4);
        const n = { x: Math.cos(am) * Math.sin(lm), y: -Math.sin(am), z: Math.cos(am) * Math.cos(lm) };
        const d = n.x * LUZ.x + n.y * LUZ.y + n.z * LUZ.z;
        const rz = 2 * d * n.z - LUZ.z, esp = Math.pow(Math.max(0, rz), 24) * il;
        const v = 0.22 + 0.5 * Math.max(0, d) * (0.35 + 0.65 * il) + 0.25 * hash(i * 31 + j) * (0.4 + 0.6 * il) + esp;
        const k = clamp(v), tk = 0.25 * mu;
        const col = [Math.round(255 * k * (1 - tk) + tinte[0] * k * tk), Math.round(255 * k * (1 - tk) + tinte[1] * k * tk), Math.round(262 * k * (1 - tk) + tinte[2] * k * tk)];
        g.fillStyle = `rgb(${Math.min(255, col[0])},${Math.min(255, col[1])},${Math.min(255, col[2])})`;
        g.beginPath(); g.moveTo(q1.x, q1.y); g.lineTo(q2.x, q2.y); g.lineTo(q3.x, q3.y); g.lineTo(q4.x, q4.y); g.closePath(); g.fill();
        if (esp > 0.35) brillos.push({ x: (q1.x + q3.x) / 2, y: (q1.y + q3.y) / 2, k: clamp((esp - 0.35) / 0.5) });
      }
    }
    g.lineWidth = 3; g.strokeStyle = "#0b0a0e"; g.beginPath(); g.arc(0, 0, BR, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#3a3742"; g.fillRect(-6, -BR - 6, 12, 8); g.strokeRect(-6, -BR - 6, 12, 8);
    // destellos en forma de estrella
    g.globalCompositeOperation = "lighter";
    for (const s of brillos) {
      const r = 4 + 12 * s.k;
      g.fillStyle = `rgba(255,255,255,${0.85 * s.k})`;
      g.beginPath(); g.moveTo(s.x, s.y - r); g.quadraticCurveTo(s.x, s.y, s.x + r * 0.7, s.y); g.quadraticCurveTo(s.x, s.y, s.x, s.y + r);
      g.quadraticCurveTo(s.x, s.y, s.x - r * 0.7, s.y); g.quadraticCurveTo(s.x, s.y, s.x, s.y - r); g.fill();
    }
    g.restore();
    return q;
  }
  // haz del foco que ilumina la bola desde arriba a la izquierda
  function hazFoco(g, t, q) {
    const k = focoK(t) * (1 - 0.45 * musica(t)); if (k <= 0.01) return;
    const o = { x: 300, y: -40 }, dx = q.x - o.x, dy = q.y - o.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const gr = g.createLinearGradient(o.x, o.y, q.x, q.y); gr.addColorStop(0, `rgba(255,250,235,${0.05 * k})`); gr.addColorStop(1, `rgba(255,250,235,${0.32 * k})`);
    g.save(); g.globalCompositeOperation = "lighter"; g.fillStyle = gr;
    g.beginPath(); g.moveTo(o.x - uy * 6, o.y + ux * 6); g.lineTo(q.x - uy * (BR + 6), q.y + ux * (BR + 6)); g.lineTo(q.x + uy * (BR + 6), q.y - ux * (BR + 6)); g.lineTo(o.x + uy * 6, o.y - ux * 6); g.closePath(); g.fill();
    g.restore();
  }
  // puntitos de luz que la bola reparte por la sala (pasan también por encima de Guillermo)
  const PUNTOS = Array.from({ length: 38 }, (_, i) => ({ lon: hash(i + 700) * Math.PI * 2, y: 40 + hash(i + 701) * 540, r: 4 + hash(i + 702) * 5, col: i % 3 }));
  function puntitos(g, t, q) {
    const k = tramo(t, T.gira, T.gira + 0.6) * (0.55 + 0.45 * musica(t)); if (k <= 0.01) return;
    const rho = giro(t) * 2, tinte = colorCiclo((t - M0) * 0.35 + 2);
    g.save(); g.globalCompositeOperation = "lighter";
    for (const d of PUNTOS) {
      const a = d.lon - rho, c = Math.cos(a); if (c <= 0.02) continue;
      const x = q.x + 820 * Math.sin(a), suelo = d.y > 455, al = k * Math.pow(c, 0.8) * (suelo ? 0.8 : 0.65);
      const r = d.r * (1 + 0.5 * (1 - c)), ry = suelo ? r * 0.45 : r;
      const col = d.col === 0 ? tinte : [255, 255, 255];
      g.fillStyle = rgba(col, 0.28 * al); g.beginPath(); g.ellipse(x, d.y, r * 2, ry * 2, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = rgba([255, 255, 255], 0.75 * al); g.beginPath(); g.ellipse(x, d.y, r * 0.8, ry * 0.8, 0, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  // haces de colores que barren la pista desde los focos del techo
  const FOCOS = [{ x: 132, y: 30, base: 1.2, ph: 0 }, { x: 512, y: 26, base: Math.PI / 2, ph: 2.1 }, { x: 892, y: 30, base: 1.94, ph: 4.2 }];
  function haces(g, t) {
    const k = musica(t); if (k <= 0.01) return;
    g.save(); g.globalCompositeOperation = "lighter";
    FOCOS.forEach((f, i) => {
      const ang = f.base + 0.5 * Math.sin((t - M0) * Math.PI / (BEAT * 4) + f.ph), ab = 0.1, L = 720;
      const col = colorCiclo((t - M0) * 0.5 + i * 1.7), al = k * (0.16 + 0.08 * golpe(t));
      const gr = g.createLinearGradient(f.x, f.y, f.x + Math.cos(ang) * L, f.y + Math.sin(ang) * L);
      gr.addColorStop(0, rgba(col, al * 1.6)); gr.addColorStop(0.6, rgba(col, al * 0.6)); gr.addColorStop(1, rgba(col, 0));
      g.fillStyle = gr; g.beginPath(); g.moveTo(f.x, f.y);
      g.lineTo(f.x + Math.cos(ang - ab) * L, f.y + Math.sin(ang - ab) * L); g.lineTo(f.x + Math.cos(ang + ab) * L, f.y + Math.sin(ang + ab) * L); g.closePath(); g.fill();
      g.fillStyle = rgba(col, 0.6 * k); g.beginPath(); g.arc(f.x, f.y + 4, 9, 0, Math.PI * 2); g.fill();
    });
    g.restore();
  }

  /* ---------- pista de baldosas que se encienden ---------- */
  const PISTA = { fondo: 452, vy: 150, filas: [452, 470, 493, 523, 562, 612, 680], cols: [] };
  for (let x = -460; x <= 1480; x += 92) PISTA.cols.push(x);
  const enPista = (X, y) => 512 + (X - 512) * (y - PISTA.vy) / (PISTA.fondo - PISTA.vy);
  function baldosas(g, t) {
    const k = musica(t); if (k <= 0.01) return;
    const f0 = (t - M0) / BEAT;
    g.save(); g.globalCompositeOperation = "lighter";
    const F = PISTA.filas, Cx = PISTA.cols;
    for (let i = 0; i < F.length - 1; i++) for (let j = 0; j < Cx.length - 1; j++) {
      const y0 = F[i], y1 = F[i + 1];
      const x00 = enPista(Cx[j], y0), x01 = enPista(Cx[j + 1], y0), x10 = enPista(Cx[j], y1), x11 = enPista(Cx[j + 1], y1);
      if (Math.max(x00, x01, x10, x11) < -10 || Math.min(x00, x01, x10, x11) > W + 10) continue;
      const col = PALETA[(i * 2 + j * 3 + 7) % PALETA.length];
      const dist = Math.abs(j - 10.5) * 0.12 + i * 0.07;
      const c = 0.5 + 0.5 * Math.cos(2 * Math.PI * (f0 - dist) * 0.5), env = Math.pow(c, 3);
      const al = k * (0.1 + 0.42 * env);
      const m = 3;
      g.fillStyle = rgba(col, al);
      g.beginPath(); g.moveTo(x00 + m, y0 + 1.5); g.lineTo(x01 - m, y0 + 1.5); g.lineTo(x11 - m, y1 - 1.5); g.lineTo(x10 + m, y1 - 1.5); g.closePath(); g.fill();
    }
    g.restore();
  }

  /* ---------- altavoces y notas ---------- */
  const ALTAVOCES = [{ x: 62, y: 330 }, { x: 962, y: 330 }];
  function conos(g, t) {
    const pul = golpe(t) * musica(t);
    for (const a of ALTAVOCES) for (const [dy, r] of [[-62, 26], [40, 42]]) {
      const k = 1 + 0.08 * pul, cx = a.x, cy = a.y + dy;
      g.fillStyle = "#121117"; g.beginPath(); g.arc(cx, cy, r + 6, 0, Math.PI * 2); g.fill();
      const gr = g.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 2, cx, cy, r * k);
      gr.addColorStop(0, "#5a5866"); gr.addColorStop(1, "#1d1c24");
      g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r * k, 0, Math.PI * 2); g.fill();
      g.lineWidth = 2.5; g.strokeStyle = "#0b0a0e"; g.stroke();
      g.fillStyle = "#2b2a33"; g.beginPath(); g.arc(cx, cy, r * 0.32 * k, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.18)"; g.beginPath(); g.ellipse(cx - r * 0.35, cy - r * 0.38, r * 0.22, r * 0.12, -0.6, 0, Math.PI * 2); g.fill();
    }
  }
  // notas musicales dibujadas (no son texto): salen de los altavoces con cada golpe y suben
  function nota(g, x, y, s, ang, doble, col) {
    g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s); g.lineJoin = "round"; g.lineCap = "round";
    const forma = () => {
      g.beginPath(); g.ellipse(0, 0, 9, 6.5, -0.45, 0, Math.PI * 2);
      if (doble) g.ellipse(24, -6, 9, 6.5, -0.45, 0, Math.PI * 2);
    };
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 7;
    g.beginPath(); g.moveTo(7.5, -2); g.lineTo(7.5, -34);
    if (doble) { g.lineTo(31.5, -40); g.lineTo(31.5, -8); } else g.quadraticCurveTo(20, -24, 16, -12);
    g.stroke(); forma(); g.fillStyle = "#0b0a0e"; g.fill(); g.lineWidth = 6; g.stroke();
    g.strokeStyle = col; g.lineWidth = 3.2;
    g.beginPath(); g.moveTo(7.5, -2); g.lineTo(7.5, -34);
    if (doble) { g.lineTo(31.5, -40); g.lineTo(31.5, -8); } else g.quadraticCurveTo(20, -24, 16, -12);
    g.stroke(); forma(); g.fillStyle = col; g.fill();
    g.restore();
  }
  function notas(g, t) {
    if (t < M0) return;
    const n1 = Math.floor((t - M0) / BEAT);
    for (let n = Math.max(0, n1 - 4); n <= n1; n++) {
      if (n > 24) continue;
      const t0 = M0 + n * BEAT, u = (t - t0) / 1.9; if (u < 0 || u > 1) continue;
      const a = ALTAVOCES[n % 2], lado = n % 2 ? -1 : 1;
      const x = a.x + lado * (36 + 60 * u) + 10 * Math.sin(u * 7 + n), y = a.y - 110 - 150 * u;
      const al = Math.min(1, u / 0.12) * (1 - suave((u - 0.6) / 0.4));
      g.save(); g.globalAlpha = al * musica(t);
      nota(g, x, y, 0.9 + 0.3 * salida(Math.min(1, u * 4)), 0.25 * Math.sin(u * 6 + n), n % 3 === 1, rgba(PALETA[(n * 2) % PALETA.length], 1));
      g.restore();
    }
  }

  /* ---------- decorado fijo ---------- */
  let fondo = null, vineta = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60);
    // pared
    const pared = g.createLinearGradient(0, -60, 0, PISTA.fondo); pared.addColorStop(0, "#07040f"); pared.addColorStop(1, "#1d0f33");
    g.fillStyle = pared; g.fillRect(-40, -60, W + 80, PISTA.fondo + 60);
    // paneles acolchados
    for (let x = -30; x < W + 40; x += 96) {
      g.fillStyle = "rgba(60,30,96,0.55)"; g.beginPath(); g.roundRect ? g.roundRect(x + 6, 70, 84, 360, 14) : g.rect(x + 6, 70, 84, 360); g.fill();
      g.strokeStyle = "rgba(0,0,0,0.5)"; g.lineWidth = 3; g.stroke();
      g.fillStyle = "rgba(255,255,255,0.05)"; g.fillRect(x + 14, 80, 6, 340);
      g.fillStyle = "rgba(0,0,0,0.35)"; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(x + 48, 120 + k * 88, 3, 0, Math.PI * 2); g.fill(); }
    }
    // zócalo
    g.fillStyle = "#0e0818"; g.fillRect(-40, PISTA.fondo - 16, W + 80, 16);
    g.fillStyle = "rgba(255,90,200,0.35)"; g.fillRect(-40, PISTA.fondo - 16, W + 80, 2);
    // suelo de baldosas (apagadas)
    const su = g.createLinearGradient(0, PISTA.fondo, 0, H + 60); su.addColorStop(0, "#120a1c"); su.addColorStop(1, "#06040a");
    g.fillStyle = su; g.fillRect(-40, PISTA.fondo, W + 80, H + 60 - PISTA.fondo);
    const F = PISTA.filas, Cx = PISTA.cols;
    for (let i = 0; i < F.length - 1; i++) for (let j = 0; j < Cx.length - 1; j++) {
      const y0 = F[i], y1 = F[i + 1];
      const x00 = enPista(Cx[j], y0), x01 = enPista(Cx[j + 1], y0), x10 = enPista(Cx[j], y1), x11 = enPista(Cx[j + 1], y1);
      const col = PALETA[(i * 2 + j * 3 + 7) % PALETA.length];
      g.fillStyle = `rgba(${col[0] >> 2},${col[1] >> 2},${col[2] >> 2},0.55)`;
      g.beginPath(); g.moveTo(x00 + 3, y0 + 1.5); g.lineTo(x01 - 3, y0 + 1.5); g.lineTo(x11 - 3, y1 - 1.5); g.lineTo(x10 + 3, y1 - 1.5); g.closePath(); g.fill();
    }
    g.strokeStyle = "#020104"; g.lineWidth = 3;
    for (const y of F) { g.beginPath(); g.moveTo(-40, y); g.lineTo(W + 40, y); g.stroke(); }
    for (const X of Cx) { g.beginPath(); g.moveTo(enPista(X, PISTA.fondo), PISTA.fondo); g.lineTo(enPista(X, H + 60), H + 60); g.stroke(); }
    // techo con estructura de focos
    g.fillStyle = "#050308"; g.fillRect(-40, -60, W + 80, 70);
    g.strokeStyle = "#3b3846"; g.lineWidth = 4; g.beginPath(); g.moveTo(-40, 14); g.lineTo(W + 40, 14); g.moveTo(-40, 2); g.lineTo(W + 40, 2); g.stroke();
    g.lineWidth = 2; g.beginPath(); for (let x = -40; x < W + 40; x += 24) { g.moveTo(x, 2); g.lineTo(x + 12, 14); g.lineTo(x + 24, 2); } g.stroke();
    for (const f of FOCOS) {
      g.save(); g.translate(f.x, f.y - 6); g.fillStyle = "#1a1820"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5;
      g.beginPath(); g.roundRect ? g.roundRect(-14, -12, 28, 26, 5) : g.rect(-14, -12, 28, 26); g.fill(); g.stroke();
      g.fillStyle = "#2c2a34"; g.beginPath(); g.ellipse(0, 12, 12, 4, 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
    // altavoces (cajas; los conos se mueven en cada fotograma)
    for (const a of ALTAVOCES) {
      g.fillStyle = "#17161d"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 4;
      g.beginPath(); g.roundRect ? g.roundRect(a.x - 56, a.y - 112, 112, 230, 8) : g.rect(a.x - 56, a.y - 112, 112, 230); g.fill(); g.stroke();
      g.fillStyle = "#24232b"; g.fillRect(a.x - 50, a.y - 106, 100, 6);
      g.fillStyle = "#0c0b10"; g.fillRect(a.x - 60, a.y + 118, 120, PISTA.fondo + 40 - (a.y + 118));
    }
    return c;
  }
  function creaVineta() {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    const v = g.createRadialGradient(512, 300, 260, 512, 300, 660); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.6)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    return c;
  }

  class GuillermoDiscoteca extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo()) return;
      if (!fondo) { fondo = creaFondo(); vineta = creaVineta(); }
      const p = pose(t), mu = musica(t);
      const luz = tramo(t, NEGRO_INICIO, 0.9, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      g.save();
      g.drawImage(fondo, -40, -60);
      conos(g, t);
      baldosas(g, t);
      // sombra (con un poco del color de la pista)
      g.save(); g.fillStyle = "rgba(0,0,0,0.5)"; g.beginPath(); g.ellipse(p.x + 8, SUELO + 2, 105, 10, 0, 0, Math.PI * 2); g.fill(); g.restore();
      notas(g, t);
      G.dibujar(g, p, t);
      // la sala está a oscuras hasta que arranca la música
      const osc = lerp(0.56, 0.06, mu) * (1 - 0.2 * focoK(t));
      g.fillStyle = `rgba(6,2,18,${osc})`; g.fillRect(0, 0, W, H);
      haces(g, t);
      const q = bola(g, t);
      hazFoco(g, t, q);
      puntitos(g, t, q);
      destello(g, t, p);
      g.drawImage(vineta, 0, 0);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00010.2", nombre: "Guillermo en la discoteca", crear: () => new GuillermoDiscoteca() });
  window.__A2D_00010_2 = { pose, T, DUR, pies, moonwalk, MW, TOB_Y, SUELO, golpe, musica, BEAT, M0, bolaPos, giro, focoK, brazoFiebre };
})();
