"use strict";
/* 00115.2 · Guillermo y Rodri · El pino
 *
 * Negro → una taberna de noche: papel pintado verde botella con lunarcitos dorados, zócalo de
 * madera oscura, una ventana con la calle y la luna, un reloj de pared sin números, un cuadro con
 * un velero, dos lámparas colgantes, suelo de baldosas de barro y crema y, a la derecha, el extremo
 * de la barra de caoba (con su barra de latón para los pies, los grifos de cerveza, una caña
 * servida y, detrás, el espejo y las baldas de botellas). Rodri, a la izquierda, y Guillermo, a la
 * derecha y de espaldas a la barra, se miran con las manos en los bolsillos.
 * Rodri mira a cámara con cara de pillo, estira los brazos con los dedos entrelazados, los pone al
 * frente… zancada, manos al suelo y patada: un pino perfecto (cuerpo recto, piernas juntas, puntas
 * estiradas, mínimos ajustes de equilibrio). Mira a cámara, chulísimo, levanta una mano y saluda:
 * ¡a una mano! Guillermo, boquiabierto, se pica (rojo, vena), se frota las manos y lo intenta:
 * patada floja, se queda a medias pataleando y cae de pie, trastabillando. Rodri, boca abajo, se
 * parte de risa. Segundo intento: patada con todas sus fuerzas → se pasa, da un manotazo hacia
 * atrás, se tambalea con las piernas en tijera, rojo y sudando, y echa a andar con las manos,
 * cada vez más deprisa, hacia la barra. Rodri ha bajado del pino y va detrás, con las manos
 * preparadas («¡cuidado, cuidado!»). Al llegar a la barra las piernas se le vencen por encima:
 * ¡pum!, quedan sobre la barra y la caña se vuelca (la cerveza se derrama y gotea por el frente).
 * Guillermo se queda colgado boca abajo, doblado sobre el canto, con las manos colgando casi rozando
 * el suelo y estrellitas: patalea, bracea y se rinde. Rodri se acerca, ladea la cabeza para verle del derecho, se parte de
 * risa señalándole; Guillermo sonríe, colorado, y saluda a cámara con la manita; Rodri guiña → negro.
 *
 * El pino: cada personaje se dibuja girado alrededor de su pelvis (ángulo θ del cuerpo, de 0 de pie
 * a π boca abajo). Las manos y los pies que pisan se fijan en el mundo y se pasan a su hoja con el
 * giro deshecho, así que no resbalan; con las dos manos apoyadas, la pelvis sale de buscar la
 * inclinación del brazo lejano (estirado) con la que el cercano llega a su mano sin pasarse.
 * Boca abajo, la cabeza va con la barbilla al pecho y los hombros encogidos (como en un pino de
 * verdad): con estos cabezones y brazos cortos, si no, la cabeza tocaría el suelo. La mano lejana
 * de Rodri va por detrás (`detras`); Guillermo pinta ese brazo encima de la cabeza, así que su cara
 * se vuelve a pintar recortada por encima de la manga.
 * Sin textos. Todo depende solo de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, ruido, hash, mezcla } = M2;
  const G = Guillermo, RO = Rodri;
  const DUR = 14.6, TAU = Math.PI * 2, TINTA = "#0b0a0e";
  const P = (x, y) => ({ x, y });
  const rot = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return P(q.x * c - q.y * s, q.x * s + q.y * c); };
  const sub = (a, b) => P(a.x - b.x, a.y - b.y), add = (a, b) => P(a.x + b.x, a.y + b.y), mul = (a, k) => P(a.x * k, a.y * k);
  const len = q => Math.hypot(q.x, q.y);
  const norm = q => { const l = len(q) || 1; return P(q.x / l, q.y / l); };
  const lerpAng = (a, b, k) => { let d = b - a; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return a + d * k; };

  const S = 0.29;
  const FL = { r: 528, g: 540 };                 // línea del suelo de cada uno (Rodri un poco más al fondo)
  const XC = 780, YC = FL.g - 204;              // esquina de arriba a la izquierda de la barra
  const HC = 18;                                 // altura del centro de la mano apoyada (las yemas tocan el suelo)

  const T = {
    // Rodri
    rCam: 0.5, rNud0: 0.82, rNud1: 1.2, rArr0: 1.18, rArr1: 1.45,
    rLun0: 1.45, rLun1: 1.66, rPlant: 1.86, rKick1: 2.3, rSet: 2.6,
    rCam2: 2.72, rOla0: 3.3, rOla1: 3.48, rOla2: 4.12, rOla3: 4.32,
    rRisa0: 5.62, rRisa1: 6.12,
    rBaja0: 6.18, rBaja1: 6.52, rArriba1: 6.88, rPolvo0: 6.92, rPolvo1: 7.16,
    rAnda0: 7.2, rAnda1: 9.12, rUy: 9.3, rAnda2: 9.68, rAnda3: 10.3,
    rInc0: 10.38, rInc1: 10.8, rRie0: 11.05, rRie1: 12.4, rCam3: 12.62, rGuino: 13.08,
    // Guillermo
    gCeja: 1.12, gBoca: 2.22, gCeno: 2.95, gPique: 3.62, gFrota0: 4.18, gFrota1: 4.55, gArr0: 4.55, gArr1: 4.74,
    g1Lun0: 4.74, g1Lun1: 4.9, g1Plant: 5.06, g1Top: 5.32, g1Cae0: 5.5, g1Pies: 5.72, g1Arriba: 5.98,
    gMira: 6.05, gFrota2: 6.36, gFrota3: 6.58, gArr2: 6.58, gArr3: 6.74,
    g2Lun0: 6.74, g2Lun1: 6.9, g2Plant: 7.04, g2Top: 7.3,
    gIzq: 7.42, gDer: 7.62,
    gPasos: [7.78, 7.93, 8.07, 8.2, 8.32, 8.43, 8.54, 8.64, 8.74, 8.84],
    gVuelca: 8.96, gBarra: 9.28, gResb: 9.6, gPat0: 9.62, gPat1: 10.45, gVeR: 10.55, gSonr: 11.3, gCam: 12.65, gSal0: 12.95, gSal1: 13.6,
    fin: 13.95
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
  const PUNO = D5(0, 0), PALMA = D5(0.9, 1), ABIERTA = D5(1, 1), FLOJA = D5(0.55, 0.6, 0.55, 0.5, 0.45), GARRA = D5(0.4, 0.35),
    SENALA = D5(0, 1, 0, 0, 0), ENTRELAZA = D5(0.3, 0.25), LACIA = D5(0.75, 0.85, 0.8, 0.75, 0.7);
  // claves [t, v…] con interpolación suave
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

  /* =====================================================================================
   * EL CUERPO GIRADO: marco del personaje en el mundo
   *   mundo = W + giro(φ)·(pantalla del muñeco − pelvis del muñeco), con φ = sg·θ
   * ===================================================================================== */
  const kOf = R => S * R.K;
  const MRo = R => R.MUNECA_R * R.JK;
  function nuevaP(R, espejo) {
    const p = { x: 0, suelo: 0, s: S, espejo, tirasLimpias: true, pelvis: { x: R.PELVIS.x, y: R.PELVIS.y }, torso: 0, torsoEsc: { x: 1, y: 1 },
      piernas: {}, cabeza: { ang: 0, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    if (R === G) { p.hombrosContinuos = true; p.hombrosRecortados = true; }
    return p;
  }
  function marco(R, p, phi, W) {
    const Pp = R.aPantalla(p, p.pelvis);
    return { phi, W, Pp,
      aMundo: q => add(W, rot(sub(q, Pp), phi)),
      aRig: q => add(Pp, rot(sub(q, W), -phi)) };
  }
  const hojaAMundo = (R, p, M, q) => M.aMundo(R.aPantalla(p, q));
  function dirHoja(p, M, d) { const r = rot(d, -M.phi); if (p.espejo) r.x = -r.x; return r; }

  // geometría del pino de cada uno (en reposo, boca abajo y recto)
  function geo(R, espejo) {
    const p = nuevaP(R, espejo), k = kOf(R), sg = espejo ? -1 : 1, phi = sg * Math.PI;
    const Pp = R.aPantalla(p, p.pelvis);
    const off = q => rot(sub(R.aPantalla(p, q), Pp), phi);
    const Of = off(R.HOMBRO), On = off(R.HOMBRO_C);
    const rF = (R.BRAZO_L * 0.985 + MRo(R)) * k, rN = (R.BRAZO_C_L * 0.97 + MRo(R)) * k;
    const Vf = P(-Of.x, -Of.y - rF);                          // pelvis − mano lejana
    return { k, sg, Of, On, rF, rN, Vf };
  }
  const GEO = { r: geo(RO, false), g: geo(G, true) };
  /* pelvis con las DOS manos apoyadas: el brazo lejano (el corto) va estirado hasta su mano y se
   * busca su inclinación β para que el cercano llegue a la suya sin pasarse (doblarlo un poco vale;
   * estirarlo de más levantaría la mano). */
  function apoyo(Gq, th, Hf, Hn, kf = 0.975, kn = 0.965) {
    const a = Gq.sg * (th - Math.PI), Of = rot(Gq.Of, a), On = rot(Gq.On, a);
    const r1 = Gq.rF * kf, r2 = Gq.rN * kn;
    const Wb = b => P(Hf.x + r1 * Math.sin(b) - Of.x, Hf.y - r1 * Math.cos(b) - Of.y);
    const coste = b => { const w = Wb(b), L = len(sub(add(w, On), Hn)), e = L - r2; return (e > 0 ? 4 * e * e : 0.6 * e * e) + 40 * b * b; };
    let bb = 0, cb = coste(0);
    for (let b = -0.8; b <= 0.8001; b += 0.04) { const c = coste(b); if (c < cb) { cb = c; bb = b; } }
    for (let h = 0.02; h > 0.0005; h /= 2) for (const b of [bb - h, bb + h]) { const c = coste(b); if (c < cb) { cb = c; bb = b; } }
    return Wb(bb);
  }
  // pino en reposo a partir de la mano lejana
  function reposo(Gq, Hf, fl, maxAbre) {
    const W0 = add(Hf, Gq.Vf), Sn = add(W0, Gq.On);
    const yN = fl - HC, dv = yN - Sn.y, dh = Math.min(maxAbre, Math.sqrt(Math.max(0, Gq.rN * Gq.rN - dv * dv)));
    const Hn = P(Sn.x + Gq.sg * dh, yN), W = apoyo(Gq, Math.PI, Hf, Hn);
    return { W, Hf, Hn, Vf: sub(W, Hf) };
  }
  // manos colocadas de modo que, al apoyarlas con el cuerpo a θ, la pelvis caiga en xPelvis
  function colocaPino(Gq, fl, maxAbre, th, xPelvis) {
    const R0 = reposo(Gq, P(0, fl - HC), fl, maxAbre), W0 = apoyo(Gq, th, R0.Hf, R0.Hn);
    return reposo(Gq, P(xPelvis - W0.x, fl - HC), fl, maxAbre);
  }

  /* ---------- miembros: especificación → postura del muñeco ---------- */
  function resPierna(R, p, M, lado, sp) {
    if (sp.a) { const A = resPierna(R, p, M, lado, sp.a), B = resPierna(R, p, M, lado, sp.b), u = clamp(sp.u);
      return { tob: mezcla(A.tob, B.tob, u), ang: lerp(A.ang, B.ang, u) }; }
    const hip = R.tronco(p)(R.CADERA[lado]), L = R.A.datos.piezas["pierna_" + lado].largo;
    let tob, ang;
    if (sp.w) {        // tobillo en el mundo, zapato con su inclinación propia (tilt: + puntera abajo)
      tob = R.aHoja(p, M.aRig(sp.w)); ang = p.espejo ? M.phi + (sp.tilt || 0) : (sp.tilt || 0) - M.phi;
      if (sp.punta !== undefined) ang = sp.punta - Math.atan2(tob.x - hip.x, tob.y - hip.y);   // pie estirado según la pierna
    } else {
      const kk = sp.k ?? 1;
      tob = P(hip.x + Math.sin(sp.f) * L * kk, hip.y + Math.cos(sp.f) * L * kk); ang = (sp.punta ?? 0) - sp.f;
    }
    return { tob, ang };
  }
  function clampPierna(R, p, lado, q) {
    const hip = R.tronco(p)(R.CADERA[lado]), L = R.A.datos.piezas["pierna_" + lado].largo * 1.02;
    const d = sub(q.tob, hip), l = len(d);
    if (l > L) q.tob = add(hip, mul(d, L / l));
    return q;
  }
  const R_MG = G.MUNECA_R * G.JK;
  const manoDesde = (m, mu) => P(m.x - Math.cos(mu) * R_MG, m.y - Math.sin(mu) * R_MG);
  const BOLS_GC = manoDesde(P(131, 652), -1.75), BOLS_GL = manoDesde(P(372, 648), -1.75);
  function bolsillo(R, p, lado) {
    if (R.manoReposo) { const m = R.manoReposo(p, lado); return { x: m.x, y: m.y, mu: m.mu, ang: 0, puno: 0, dedos: FLOJA, dobla: lado === "cerca" ? -1 : 1 }; }
    const m = R.tronco(p)(lado === "cerca" ? BOLS_GC : BOLS_GL);
    return { x: m.x, y: m.y, mu: -1.75 + p.torso, ang: 0, puno: 0, dedos: FLOJA, dobla: lado === "cerca" ? -1 : 1 };
  }
  function mezclaMano(A, B, u) {
    if (u <= 0) return A; if (u >= 1) return B;
    return { x: lerp(A.x, B.x, u), y: lerp(A.y, B.y, u), mu: lerpAng(A.mu, B.mu, u), ang: lerp(A.ang || 0, B.ang || 0, u), puno: lerp(A.puno, B.puno, u),
      dedos: mezD(A.dedos, B.dedos, u), dobla: u < 0.5 ? A.dobla : B.dobla, detras: u < 0.5 ? A.detras : B.detras };
  }
  // Extremo de tinta de los cuatro dedos abiertos del rig, con su transformación completa.
  const YEMAS = [[6.9,14.5,.17],[2.3,16,.05],[-2.3,15,-.07],[-6.7,12,-.2]].map(([x,L,a]) =>
    P(x + L * Math.sin(1.3 * a), 4.5 + L * Math.cos(1.3 * a)));
  function yemaApoyo(R, p, M, m) {
    const radio = 4.55 * kOf(R) * R.JK;
    const extremas = YEMAS.map(pt => {
      const d = mul(rot(pt, m.mu + Math.PI / 2 + (m.ang || 0)), R.JK);
      const q = hojaAMundo(R, p, M, add(m, d)); return P(q.x, q.y + radio);
    });
    return extremas.reduce((a,b) => b.y > a.y ? b : a);
  }
  function resMano(R, p, M, lado, sp) {
    if (sp.arco) {     // de a a b girando el brazo alrededor del hombro (la mano describe un arco, no una recta)
      const A = resMano(R, p, M, lado, sp.a), B = resMano(R, p, M, lado, sp.b), u = clamp(sp.u);
      if (u <= 0) return A; if (u >= 1) return B;
      const sh = R.tronco(p)(lado === "cerca" ? R.HOMBRO_C : R.HOMBRO);
      const aA = Math.atan2(A.y - sh.y, A.x - sh.x), aB = Math.atan2(B.y - sh.y, B.x - sh.x);
      const rA = len(sub(P(A.x, A.y), sh)), rB = len(sub(P(B.x, B.y), sh));
      const an = lerpAng(aA, aB, u), r = lerp(rA, rB, u), m = mezclaMano(A, B, u);
      m.x = sh.x + Math.cos(an) * r; m.y = sh.y + Math.sin(an) * r;
      return m;
    }
    if (sp.a) {
      return mezclaMano(resMano(R, p, M, lado, sp.a), resMano(R, p, M, lado, sp.b), clamp(sp.u));
    }
    const dob = sp.dobla ?? (lado === "cerca" ? -1 : 1);
    if (sp.bols) return bolsillo(R, p, lado);
    if (sp.w) {
      const q = R.aHoja(p, M.aRig(sp.w)), d = dirHoja(p, M, sp.dW);
      const m = { x: q.x, y: q.y, mu: Math.atan2(d.y, d.x), ang: 0, puno: sp.puno ?? 1, dedos: sp.dedos || ABIERTA, dobla: dob, detras: sp.detras };
      if (sp.apoyo) {
        const error = sp.w.y + HC - yemaApoyo(R,p,M,m).y;
        const centro = R.aHoja(p,M.aRig(P(sp.w.x,sp.w.y+error)));
        m.x = centro.x; m.y = centro.y;
      }
      return m;
    }
    const m = R.tronco(p)(sp.q);
    return { x: m.x, y: m.y, mu: sp.mu + p.torso, ang: sp.ang || 0, puno: sp.puno ?? 1, dedos: sp.dedos || FLOJA, dobla: dob, detras: sp.detras };
  }
  function alcance(R, p, lado, m) {      // fracción del brazo que hace falta (1 = estirado)
    const sh = R.tronco(p)(lado === "cerca" ? R.HOMBRO_C : R.HOMBRO), L = lado === "cerca" ? R.BRAZO_C_L : R.BRAZO_L;
    const w = add(P(m.x, m.y), rot(P(Math.cos(m.mu) * MRo(R), Math.sin(m.mu) * MRo(R)), m.ang || 0));
    return { sh, L, w, f: len(sub(w, sh)) / L };
  }
  function clampMano(R, p, lado, m) {
    const a = alcance(R, p, lado, m);
    if (a.f > 1.05) { const k = 1 - 1.05 / a.f, d = sub(a.sh, a.w); m.x += d.x * k; m.y += d.y * k; }
    return m;
  }

  // construye la postura completa a partir de la especificación o
  function construye(R, espejo, o, t) {
    const p = nuevaP(R, espejo);
    p.torso = o.torso || 0;
    p.cabeza.ang = o.cab || 0; p.cabeza.dy = o.cabDy || 0; p.cabeza.dx = o.cabDx || 0;
    p.torsoEsc.y = 1 + (o.resp || 0);
    const M = marco(R, p, (espejo ? -1 : 1) * o.th, o.W);
    for (const lado of ["cerca", "lejos"]) p.piernas[lado] = clampPierna(R, p, lado, resPierna(R, p, M, lado, o.piernas[lado]));
    p.manoCerca = clampMano(R, p, "cerca", resMano(R, p, M, "cerca", o.manos.cerca));
    p.manoLejos = clampMano(R, p, "lejos", resMano(R, p, M, "lejos", o.manos.lejos));
    p.cara = o.cara; p.rojo = o.rojo || 0; p.sudor = o.sudor || 0; p.enfado = o.enfado || 0;
    if (o.capaCabeza) p.capaCabeza = o.capaCabeza;
    return { p, M, R, o };
  }
  function dibuja(g, Q, t) {
    const { p, M, R } = Q;
    g.save(); g.translate(M.W.x, M.W.y); g.rotate(M.phi); g.translate(-M.Pp.x, -M.Pp.y); R.dibujar(g, p, t); g.restore();
  }
  /* Guillermo dibuja su brazo lejano DESPUÉS de la cabeza; boca abajo, la manga le taparía la cara.
   * Se vuelve a pintar el muñeco sin ese brazo, recortado a la cara, para que la cara quede encima. */
  function caraEncima(g, Q, t) {
    const { p, M, R } = Q, H = R.cabeza(p), pts = [];
    for (let i = 0; i < 40; i++) { const a = i * TAU / 40; pts.push(M.aMundo(R.aPantalla(p, H.a(P(770 + Math.cos(a) * 250, 600 + Math.sin(a) * 285))))); }
    g.save(); g.beginPath(); M2.poligono(g, pts); g.clip();
    dibuja(g, { p: Object.assign({}, p, { manoLejos: null }), M, R }, t);
    g.restore();
  }
  // la mirada sigue a un punto del mundo (con giro, espejo e inclinación de la cabeza)
  function miraA(Q, q, ojo, w) {
    if (!q || w <= 0.001) return;
    const { p, M, R } = Q;
    const o = hojaAMundo(R, p, M, R.cabeza(p).a(ojo));
    let d = dirHoja(p, M, sub(q, o)); d = rot(d, -p.cabeza.ang);
    const n = len(d) || 1;
    p.cara.mirada = mezcla(p.cara.mirada, P(clamp(d.x / n * 1.15, -1, 1), clamp(d.y / n * 1.15, -1, 1)), clamp(w));
  }
  const OJO = { g: P(830, 590), r: P(850, 465) };
  const caraMundo = (Q, quien) => hojaAMundo(Q.R, Q.p, Q.M, Q.R.cabeza(Q.p).a(quien === "g" ? P(790, 600) : P(830, 520)));

  /* ---------- pasos en el suelo (andares) ---------- */
  function pieDe(lista, ini, lado, t) {
    let prev = ini;
    for (const e of lista) {
      if (e.lado !== lado) continue;
      if (e.t <= t) { prev = e; continue; }
      const s0 = e.t - e.sw;
      if (t >= s0) { const u = (t - s0) / e.sw; return { x: lerp(prev.x, e.x, suave(u)), h: e.alto * Math.sin(Math.PI * u), tilt: 0.25 * Math.sin(Math.PI * u) }; }
      break;
    }
    return { x: prev.x, h: 0, tilt: 0 };
  }
  const tobAlto = R => R.TOBILLO_ALTO * kOf(R);
  /* la cabeza según lo girado que esté el cuerpo: al apoyar las manos mira adelante (barbilla arriba,
   * la cabeza se aleja del suelo); boca abajo, barbilla al pecho y hombros encogidos (como en un pino de
   * verdad), así estos cabezones no tocan el suelo */
  const CAB_PINO = { r: { ang: 0.95, dy: 140, dx: -50 }, g: { ang: 1.35, dy: 110, dx: 45 } };
  function cabPino(o, th, quien) {
    const c = CAB_PINO[quien];
    const atras = -0.6 * suave(fase(th, 0.8, 1.9)) * (1 - suave(fase(th, 1.95, 2.5)));
    o.cab = atras + c.ang * suave(fase(th, 1.95, 2.6));
    o.cabDy = c.dy * suave(fase(th, 1.2, 2.1));
    o.cabDx = c.dx * suave(fase(th, 1.9, 2.6));
  }

  /* =====================================================================================
   * RODRI: el pino perfecto
   * ===================================================================================== */
  const XR0 = 200;
  const R_TC = 2.08;                                           // ángulo del cuerpo al apoyar las manos
  const R_REP = colocaPino(GEO.r, FL.r, 24, R_TC, XR0 + 30);   // al apoyar, la pelvis está en XR0 + 30
  const R_WS = P(XR0, FL.r - (RO.SUELO - RO.PELVIS.y) * kOf(RO));       // pelvis de pie
  const R_PIE0 = { cerca: XR0 - 8, lejos: XR0 + 16 };
  const R_PIE_ZANCADA = XR0 + 82;                                        // pie lejano adelantado
  const R_ATERRIZA = { cerca: XR0 + 18, lejos: XR0 + 64 };                // donde bajan los pies del pino
  const R_X1 = XR0 + 40;                                                 // de pie tras el pino
  // andar detrás de Guillermo: [t, x de la pelvis]
  const R_ANDA = [[T.rAnda0, R_X1], KF([T.rAnda1, 505], suave), [T.rAnda2, 505], KF([T.rAnda3, 578], suave)];
  const pelvisAnda = t => claves(R_ANDA, t)[0];
  // pasos: cada 0,32 s alterna pie mientras avanza
  const R_PASOS = (() => {
    const L = [];
    const tramos = [[T.rAnda0 + 0.05, T.rAnda1, 0.34], [T.rAnda2 + 0.02, T.rAnda3 + 0.05, 0.3]];
    let lado = "lejos";
    for (const [a, b, dt] of tramos) {
      for (let tk = a + dt; tk <= b + 0.02; tk += dt) {
        const x = pelvisAnda(Math.min(tk + 0.12, b)) + (lado === "cerca" ? -10 : 18);
        L.push({ t: tk, x, lado, sw: dt * 0.9, alto: 13 }); lado = lado === "cerca" ? "lejos" : "cerca";
      }
      // remate: el otro pie se junta
      L.push({ t: b + 0.12, x: pelvisAnda(b) + (lado === "cerca" ? -10 : 18), lado, sw: 0.22, alto: 9 });
      lado = lado === "cerca" ? "lejos" : "cerca";
    }
    return L;
  })();

  const CARAS_R = {
    inicio: E({ mx: 0.9, my: 0.05, c: 0.2, sonr: 0.35 }),
    pillo: E({ mx: -0.85, my: 0, c: 0.35, h: 0.2, abre: 4, ancho: 1.05, sonr: 0.9 }),
    estira: E({ mx: 0.6, my: 0.1, c: 0.75, h: 0.6, abre: 6, ancho: 0.9, sonr: 0.6 }),
    concentra: E({ mx: 0.9, my: 0.35, c: 0.3, z: 0.25, abre: 4, ancho: 0.8, sonr: 0.2 }),
    chulo: E({ mx: -0.85, my: 0, c: 0.35, h: 0.25, abre: 5, ancho: 1, sonr: 0.95 }),
    saluda: E({ mx: -0.85, my: 0, c: 0.2, h: 0.35, abre: 16, ancho: 1.05, sonr: 1 }),
    mira: E({ mx: 0.9, my: 0, c: 0.25, abre: 4, ancho: 0.95, sonr: 0.5 }),
    risa: E({ mx: 0.5, my: 0, c: 1, h: 1, abre: 30, ancho: 1.05, sonr: 1 }),
    baja: E({ mx: 0.9, my: 0.3, c: 0.3, abre: 3, ancho: 0.85, sonr: 0.35 }),
    sigue: E({ mx: 0.9, my: 0.1, iris: 0.9, c: 0.05, abre: 12, ancho: 0.8, sonr: 0.45 }),
    uy: E({ mx: 0.9, my: 0.2, c: 0.85, z: 0.8, abre: 22, ancho: 1, sonr: -0.45 }),
    curioso: E({ mx: 0.9, my: 0.2, c: 0.1, abre: 6, ancho: 0.8, sonr: 0.55 }),
    risa2: E({ mx: 0.5, my: 0, c: 1, h: 1, abre: 38, ancho: 1.08, sonr: 1 }),
    camara: E({ mx: -0.85, my: 0, c: 0.25, abre: 8, ancho: 1, sonr: 0.95 }),
    guino: E({ mx: -0.85, my: 0, c: 0.25, wd: 0.75, abre: 8, ancho: 1, sonr: 1 })
  };
  const GUION_CARA_R = [
    [T.rCam, T.rCam + 0.15, "pillo"], [T.rNud0, T.rNud0 + 0.12, "estira"], [T.rLun0 - 0.1, T.rLun0 + 0.05, "concentra"],
    [T.rSet - 0.15, T.rSet, "mira"], [T.rCam2, T.rCam2 + 0.15, "chulo"], [T.rOla0, T.rOla1, "saluda"], [T.rOla3, T.rOla3 + 0.2, "mira"],
    [T.rRisa0, T.rRisa0 + 0.1, "risa"], [T.rRisa1, T.rRisa1 + 0.12, "baja"], [T.rPolvo1, T.rPolvo1 + 0.2, "sigue"],
    [T.rUy - 0.02, T.rUy + 0.06, "uy"], [T.rAnda2 - 0.1, T.rAnda2 + 0.1, "sigue"], [T.rInc0, T.rInc0 + 0.2, "curioso"],
    [T.rRie0, T.rRie0 + 0.1, "risa2"], [T.rCam3 - 0.1, T.rCam3 + 0.15, "camara"], [T.rGuino, T.rGuino + 0.1, "guino"],
    [T.rGuino + 0.4, T.rGuino + 0.52, "camara"]
  ];
  const PARP_R = [0.3, 1.95, 3.0, 4.6, 6.95, 8.1, 9.95, 12.0, 13.75];

  // manos de Rodri (hoja del tronco, sin inclinar)
  const RH = { F: RO.HOMBRO, N: RO.HOMBRO_C, LF: RO.BRAZO_L, LN: RO.BRAZO_C_L };
  // «preparado»: brazos estirados al frente y un poco arriba (por debajo de la barbilla: no tapan la cara)
  const alFrente = (R, H, L, a) => ({ q: add(H, mul(P(Math.cos(a), Math.sin(a)), L * 0.95 + MRo(R))), mu: Math.PI + a, dedos: ABIERTA });
  const rArriba = { lejos: alFrente(RO, RH.F, RH.LF, -0.22), cerca: alFrente(RO, RH.N, RH.LN, -0.12) };
  // Cada nueva maniobra parte de la última pose completa, incluidos los tobillos y la cabeza.
  const posturasPrevias = new Map();
  function antesDe(actor, t0) {
    if (!posturasPrevias.has(t0)) posturasPrevias.set(t0,actor(t0-1e-7));
    return posturasPrevias.get(t0);
  }
  function enlaza(o, actor, t, t0, duracion) {
    if (t < t0 || t >= t0 + duracion) return;
    const a = antesDe(actor,t0), u = tramo(t,t0,t0+duracion);
    o.W = mezcla(a.W,o.W,u);
    for (const clave of ["th","torso","cab","cabDx","cabDy","resp","rojo","sudor","enfado"]) o[clave] = lerp(a[clave] || 0,o[clave] || 0,u);
    for (const lado of ["cerca","lejos"]) {
      o.piernas[lado] = { a: a.piernas[lado], b: o.piernas[lado], u };
      o.manos[lado] = { a: a.manos[lado], b: o.manos[lado], u };
    }
  }
  function rodri(t) {
    const Gq = GEO.r, k = Gq.k;
    const o = { th: 0, W: R_WS, torso: 0, cab: 0, piernas: {}, manos: {} };
    const respira = 0.004 * Math.sin(t * 2.3 + 1);
    o.resp = respira;
    const wobble = 0.012 * Math.sin(t * 2.1) + 0.008 * Math.sin(t * 3.7 + 1);
    const plantF = R_REP.Hf, plantN = R_REP.Hn;
    // la mano lejana apoyada va por detrás del cuerpo y de la cabeza (si no, la manga le tapa la cara)
    const manoSuelo = (lado, H) => ({ w: H, apoyo: true, dW: norm(P(-Gq.sg * (lado === "cerca" ? -0.25 : 0.15), -1)), dedos: ABIERTA, detras: lado === "lejos" });
    const Wrod = (th, piv, Wr) => add(piv, rot(sub(Wr, piv), th - Math.PI));
    const pieSuelo = (x, fl = FL.r, tilt = 0) => ({ w: P(x, fl - tobAlto(RO)), tilt });
    let estado = "pie";

    if (t < T.rLun0) {
      // de pie: bolsillos → estira los brazos con los dedos entrelazados → brazos arriba
      o.W = add(R_WS, P(0, 3 * Math.sin(t * 2.3)));
      o.piernas.cerca = pieSuelo(R_PIE0.cerca); o.piernas.lejos = pieSuelo(R_PIE0.lejos);
      const est = dentro(t, T.rNud0, T.rNud0 + 0.16, T.rNud1 - 0.02, T.rNud1 + 0.08);
      const pulso = 1 + 0.06 * Math.sin((t - T.rNud0) * 22) * est;
      const delante = {
        lejos: { q: P(RH.F.x + 165 * pulso, RH.F.y + 95), mu: Math.PI, dedos: ENTRELAZA },
        cerca: { q: P(RH.F.x + 150 * pulso, RH.F.y + 108), mu: Math.PI - 0.15, dedos: ENTRELAZA }
      };
      const arr = tramo(t, T.rArr0, T.rArr1);
      for (const lado of ["cerca", "lejos"]) {
        const b = { bols: true };
        o.manos[lado] = { a: { a: b, b: delante[lado], u: est }, b: rArriba[lado], u: arr };
      }
      o.W = add(o.W, P(0, -5 * arr));                         // se estira (de puntillas)
      o.torso = -0.04 * arr + 0.05 * est;
      o.cab = -0.08 * arr;
    } else if (t < T.rBaja0) {
      // zancada → manos al suelo → patada → pino (y el saludo a una mano)
      const uL = tramo(t, T.rLun0, T.rLun1), uD = fase(t, T.rLun1, T.rPlant), uK = fase(t, T.rPlant, T.rKick1);
      let th;
      if (t < T.rLun1) th = 0.42 * uL;
      else if (t < T.rPlant) th = lerp(0.42, R_TC, suave(uD));
      else if (t < T.rKick1) th = lerp(R_TC, Math.PI + 0.07, salida(uK));
      else { const tau = t - T.rKick1; th = Math.PI + 0.07 * Math.exp(-tau * 7) * Math.cos(tau * 11) + wobble * tramo(t, T.rKick1, T.rSet); }
      // saludo: carga el peso en la mano lejana
      const ola = dentro(t, T.rOla0 - 0.1, T.rOla1, T.rOla2, T.rOla3 + 0.08);
      th -= 0.045 * ola;
      // risa boca abajo: tiembla
      const risa = dentro(t, T.rRisa0, T.rRisa0 + 0.08, T.rRisa1 - 0.1, T.rRisa1);
      th += 0.018 * Math.sin(t * 34) * risa;
      o.th = th;
      // pelvis: de la zancada a las dos manos apoyadas (y a una sola mano en el saludo)
      const olaU = tramo(t, T.rOla0, T.rOla1) * (1 - tramo(t, T.rOla2, T.rOla3));
      const Wl = add(R_WS, P(26 * uL, 20 * uL));
      const Wa = apoyo(Gq, th, plantF, plantN), Wr = Wrod(th, plantF, R_REP.W);
      if (t < T.rLun1) o.W = Wl;
      else if (t < T.rPlant) o.W = mezcla(Wl, Wa, suave(uD));
      else o.W = mezcla(Wa, Wr, olaU);
      // piernas: zancada (la lejana se adelanta), apoyo, patada (la cercana va primero)
      const pieL = pieSuelo(lerp(R_PIE0.lejos, R_PIE_ZANCADA, suave(fase(t, T.rLun0, T.rLun1 - 0.04))),
        FL.r, 0) ;
      if (t < T.rLun1) pieL.w.y -= 12 * Math.sin(Math.PI * fase(t, T.rLun0, T.rLun1 - 0.04));
      const pieC = pieSuelo(R_PIE0.cerca, FL.r, -0.35 * uL);
      const recto = (lado, ph) => ({ f: (lado === "cerca" ? 0.03 : -0.03) + 0.025 * Math.sin(t * 2.6 + ph) - 0.05 * risa * Math.sin(t * 30 + ph), k: 1, punta: 1.2 });
      // pierna cercana: patada (de atrás hacia arriba)
      const fC = claves([[T.rPlant - 0.1, 2.0], KF([T.rKick1 - 0.12, -0.18], salida), KF([T.rSet, 0.03], suave)], t)[0];
      const kC = 1 - 0.15 * campana(t, T.rPlant - 0.08, T.rKick1 - 0.1);
      const aireC = { f: fC, k: kC, punta: lerp(0.2, 1.2, tramo(t, T.rPlant, T.rKick1)) };
      o.piernas.cerca = { a: pieC, b: { a: aireC, b: recto("cerca", 0), u: tramo(t, T.rKick1, T.rSet) }, u: tramo(t, T.rPlant - 0.1, T.rPlant + 0.02) };
      // pierna lejana: empuja y sigue
      const fL = claves([[T.rPlant + 0.06, 2.2], KF([T.rKick1, 0.15], salida), KF([T.rSet, -0.03], suave)], t)[0];
      const kL = 1 - 0.35 * campana(t, T.rPlant + 0.04, T.rKick1 + 0.05);
      const aireL = { f: fL, k: kL, punta: lerp(0.1, 1.2, tramo(t, T.rPlant + 0.05, T.rKick1 + 0.05)) };
      o.piernas.lejos = { a: pieL, b: { a: aireL, b: recto("lejos", 1.3), u: tramo(t, T.rKick1, T.rSet) }, u: tramo(t, T.rPlant + 0.04, T.rPlant + 0.12) };
      // manos: de arriba (muñeco) al suelo (mundo)
      const uM = tramo(t, T.rLun0 + 0.04, T.rPlant);
      // los brazos bajan por delante (estirados hacia el suelo), sin pasar por la cara
      o.manos.lejos = { arco: true, a: rArriba.lejos, b: manoSuelo("lejos", plantF), u: uM };
      // saludo con la cercana
      const Sn = add(o.W, rot(Gq.On, o.th - Math.PI));
      const fOla = Math.sin((t - T.rOla1) * TAU * 2.6) * tramo(t, T.rOla1, T.rOla1 + 0.1) * (1 - tramo(t, T.rOla2 - 0.08, T.rOla2));
      const hOla = add(Sn, P(68 + 8 * fOla, -46 + 4 * Math.abs(fOla)));
      const saluda = { w: hOla, dW: norm(sub(Sn, hOla)), dedos: PALMA, dobla: -1 };
      o.manos.cerca = { a: { arco: true, a: rArriba.cerca, b: manoSuelo("cerca", plantN), u: tramo(t, T.rLun0 + 0.07, T.rPlant + 0.05) }, b: saluda, u: olaU };
      o.olaAng = 0.4 * fOla * olaU;
      // cabeza: mira al suelo y, boca abajo, hacia delante (barbilla al pecho)
      cabPino(o, th, "r"); o.cab += 0.04 * Math.sin(t * 1.7) * tramo(t, T.rSet, T.rSet + 0.3);
      o.torso = 0.04 * Math.sin(Math.PI * fase(t, T.rLun1, T.rKick1));
      estado = t < T.rPlant ? "pie" : "pino";
    } else if (t < T.rArriba1) {
      // baja del pino: piernas al suelo (por donde subió) y se levanta
      const uB = fase(t, T.rBaja0, T.rBaja1), uA = fase(t, T.rBaja1, T.rArriba1);
      let th = t < T.rBaja1 ? lerp(Math.PI, R_TC + 0.05, suave(uB)) : lerp(R_TC + 0.05, 0, suave(uA));
      o.th = th;
      const Wpie = P(R_X1, R_WS.y);
      o.W = t < T.rBaja1 ? apoyo(Gq, th, R_REP.Hf, R_REP.Hn) : mezcla(apoyo(Gq, R_TC + 0.05, R_REP.Hf, R_REP.Hn), Wpie, suave(uA));
      // piernas: la lejana baja primero, la cercana después
      const fL = lerp(0, 2.1, suave(fase(t, T.rBaja0, T.rBaja1 - 0.06))), fC = lerp(0, 2.0, suave(fase(t, T.rBaja0 + 0.06, T.rBaja1)));
      o.piernas.lejos = { a: { f: fL, k: 1 - 0.25 * campana(t, T.rBaja0, T.rBaja1), punta: lerp(1.2, 0, uB) }, b: pieSuelo(R_ATERRIZA.lejos), u: tramo(t, T.rBaja1 - 0.08, T.rBaja1 - 0.02) };
      o.piernas.cerca = { a: { f: fC, k: 1 - 0.25 * campana(t, T.rBaja0 + 0.05, T.rBaja1), punta: lerp(1.2, 0, uB) }, b: pieSuelo(R_ATERRIZA.cerca), u: tramo(t, T.rBaja1 - 0.03, T.rBaja1 + 0.02) };
      // manos: suelo → a los lados al levantarse
      const lado2 = {
        lejos: { q: P(RH.F.x + 40, RH.F.y + RH.LF * 0.85), mu: -1.9, dedos: FLOJA },
        cerca: { q: P(RH.N.x - 20, RH.N.y + RH.LN * 0.85), mu: -1.6, dedos: FLOJA }
      };
      o.manos.lejos = { a: manoSuelo("lejos", R_REP.Hf), b: lado2.lejos, u: tramo(t, T.rBaja1 + 0.02, T.rArriba1 - 0.05) };
      o.manos.cerca = { a: manoSuelo("cerca", R_REP.Hn), b: lado2.cerca, u: tramo(t, T.rBaja1, T.rArriba1 - 0.08) };
      cabPino(o, th, "r");
      estado = t < T.rBaja1 ? "pino" : "pie";
    } else {
      // de pie: se sacude las manos, va detrás de Guillermo, se agacha a mirarle y se ríe
      const x = t < T.rAnda0 ? R_X1 : pelvisAnda(t);
      const anda = dentro(t, T.rAnda0, T.rAnda0 + 0.1, T.rAnda1 - 0.05, T.rAnda1 + 0.1) + dentro(t, T.rAnda2, T.rAnda2 + 0.08, T.rAnda3, T.rAnda3 + 0.12);
      const bob = anda * 5 * Math.abs(Math.sin((t - T.rAnda0) * Math.PI / 0.34));
      o.W = P(x, R_WS.y + bob + 2 * Math.sin(t * 2.3) * tramo(t,T.rArriba1,T.rArriba1+0.12));
      const ini = { cerca: { x: R_ATERRIZA.cerca }, lejos: { x: R_ATERRIZA.lejos } };
      for (const lado of ["cerca", "lejos"]) {
        const f = pieDe(R_PASOS, ini[lado], lado, t);
        o.piernas[lado] = { w: P(f.x, FL.r - tobAlto(RO) - f.h), tilt: f.tilt };
      }
      // tronco: inclinado hacia delante siguiéndole, agachado a mirarle, risa
      const sigue = dentro(t, T.rAnda0, T.rAnda0 + 0.3, T.rAnda1, T.rAnda1 + 0.2);
      const uy = dentro(t, T.rUy - 0.03, T.rUy + 0.05, T.rAnda2 - 0.2, T.rAnda2);
      const inc = dentro(t, T.rInc0, T.rInc1, T.rRie0, T.rRie0 + 0.2);
      const risa = dentro(t, T.rRie0, T.rRie0 + 0.12, T.rRie1, T.rRie1 + 0.25);
      o.torso = 0.12 * sigue + 0.08 * anda * Math.sin((t - T.rAnda0) * TAU / 0.68) + 0.42 * inc - 0.12 * risa - 0.1 * uy
        + 0.05 * Math.sin(t * 26) * risa;
      o.W = add(o.W, P(-6 * inc, 18 * inc + 4 * risa * Math.abs(Math.sin(t * 13))));
      o.cab = 0.95 * suave(fase(t, T.rInc0 + 0.1, T.rInc1)) * (1 - tramo(t, T.rRie0, T.rRie0 + 0.3)) - 0.08 * risa + 0.04 * Math.sin(t * 13) * risa;
      // manos
      const sacude = dentro(t, T.rPolvo0, T.rPolvo0 + 0.05, T.rPolvo1, T.rPolvo1 + 0.1);
      const pal = Math.abs(Math.sin((t - T.rPolvo0) * Math.PI / 0.11));
      const polvo = {
        lejos: { q: P(RH.F.x + 120, RH.F.y + 160 - 14 * pal), mu: Math.PI + 0.3, dedos: PALMA },
        cerca: { q: P(RH.F.x + 108 - 18 * pal, RH.F.y + 172), mu: Math.PI - 0.3, dedos: PALMA }
      };
      const ojo = {      // manos preparadas («¡cuidado!»)
        lejos: { q: P(RH.F.x + 190, RH.F.y + 90 + 10 * Math.sin(t * 9)), mu: Math.PI + 0.5, dedos: ABIERTA },
        cerca: { q: P(RH.F.x + 150, RH.F.y + 120 + 10 * Math.sin(t * 9 + 1.5)), mu: Math.PI + 0.3, dedos: ABIERTA }
      };
      const caraUy = {
        lejos: { q: P(335, 125), mu: 1.9, dedos: PALMA },
        cerca: { q: P(262, 140), mu: 1.7, dedos: PALMA }
      };
      const rodillas = {
        lejos: { q: P(RH.F.x + 95, 700), mu: -1.75, dedos: GARRA },
        cerca: { q: P(RH.N.x + 150, 720), mu: -1.6, dedos: GARRA }
      };
      const rie = {       // mano en la barriga y la otra señalándole (antebrazo horizontal)
        lejos: { q: P(RH.F.x + 250, RH.F.y + 150), mu: Math.PI + 0.42, dedos: SENALA, puno: 1 },
        cerca: { q: P(RH.N.x + 160, 560 + 6 * Math.sin(t * 26)), mu: -1.2, dedos: PALMA }
      };
      const bols = { bols: true };
      const lado2 = {
        lejos: { q: P(RH.F.x + 40, RH.F.y + RH.LF * 0.85), mu: -1.9, dedos: FLOJA },
        cerca: { q: P(RH.N.x - 20, RH.N.y + RH.LN * 0.85), mu: -1.6, dedos: FLOJA }
      };
      for (const lado of ["cerca", "lejos"]) {
        let m = lado2[lado];
        m = { a: m, b: polvo[lado], u: sacude };
        m = { a: m, b: ojo[lado], u: sigue * (1 - uy) };
        m = { a: m, b: caraUy[lado], u: uy };
        m = { a: m, b: rodillas[lado], u: inc };
        m = { a: m, b: rie[lado], u: risa };
        m = { a: m, b: bols, u: tramo(t, T.rRie1 + 0.1, T.rCam3 + 0.3) };
        o.manos[lado] = m;
      }
      estado = "pie";
    }
    o.estado = estado;
    // cara
    const e = guion(GUION_CARA_R, CARAS_R, "inicio", t);
    o.cara = cara(e, parpadeo(t, PARP_R));
    enlaza(o,rodri,t,T.rLun0,0.09);
    enlaza(o,rodri,t,T.rBaja0,0.11);
    return o;
  }

  /* =====================================================================================
   * GUILLERMO: dos intentos, el paseo a manos y la barra
   * ===================================================================================== */
  const XG0 = 690;
  const G_TC = 2.08;
  const G_REP = colocaPino(GEO.g, FL.g, 10, G_TC, XG0 - 26);
  const G_WS = P(XG0, FL.g - (1344 - G.PELVIS.y) * kOf(G));
  const G_PIE0 = { cerca: XG0 + 8, lejos: XG0 - 16 };
  const G_PIE_ZANCADA = XG0 - 80;
  const G_ATERRIZA = { cerca: XG0 + 2, lejos: XG0 - 44 };
  const G_X1 = XG0 - 14;
  // el paseo: posiciones de cada mano en el tiempo (la mano que da el paso alterna)
  const G_ATASCO = P(XC - 30, YC - 10);                       // pelvis colgado de la barra
  const G_MANOS = (() => {
    // claves de la mano lejana (derecha) y la cercana (izquierda)
    let f = G_REP.Hf.x, n = G_REP.Hn.x;
    const lf = [[0, f]], ln = [[0, n]];
    // manotazo hacia atrás (a la izquierda) al pasarse
    ln.push([T.gIzq - 0.1, n]); n -= 26; ln.push([T.gIzq, n]);
    lf.push([T.gDer - 0.12, f]); f -= 8; lf.push([T.gDer, f]);
    // pasos hacia la derecha hasta la barra
    const pasos = T.gPasos, n0 = pasos.length;
    const dx = G_ATASCO.x - 44 - G_REP.W.x, metaF = G_REP.Hf.x + dx, metaN = G_REP.Hn.x + dx;
    for (let i = 0; i < n0; i++) {
      const tp = pasos[i], dt = (i ? pasos[i] - pasos[i - 1] : 0.18) * 0.85;
      const u = (i + 1) / n0;
      if (i % 2 === 0) { lf.push([tp - dt, f]); f = lerp(G_REP.Hf.x - 8, metaF, u); lf.push([tp, f]); }
      else { ln.push([tp - dt, n]); n = lerp(G_REP.Hn.x - 26, metaN, u); ln.push([tp, n]); }
    }
    return { lf, ln };
  })();
  function manoPaseo(lista, t) {
    for (let i = 1; i < lista.length; i++) {
      const [ta, xa] = lista[i - 1], [tb, xb] = lista[i];
      if (t < tb) { if (xa === xb) return { x: xa, h: 0 }; const u = fase(t, ta, tb); return { x: lerp(xa, xb, suave(u)), h: 16 * Math.sin(Math.PI * u) }; }
    }
    return { x: lista[lista.length - 1][1], h: 0 };
  }

  let huellas;
  function pasosManos() {
    if (!huellas) huellas = T.gPasos.map((t,i) => {
      const lado = i%2 ? "cerca" : "lejos", Q = poses(t).g;
      const m = lado==="cerca" ? Q.p.manoCerca : Q.p.manoLejos;
      return { t,lado,x:yemaApoyo(G,Q.p,Q.M,m).x };
    });
    return huellas;
  }
  const CARAS_G = {
    inicio: E({ mx: 0.9, my: 0.05, c: 0.15, sonr: 0.25 }),
    ceja: E({ mx: 0.9, my: 0, c: 0.1, sd: 4, gd: -0.05, si: 22, gi: 0.14, abre: 0, ancho: 0.8, sonr: 0.35 }),
    boca: E({ mx: 0.9, my: 0.1, iris: 0.8, c: 0, sd: 26, gd: 0.15, si: 26, gi: 0.15, abre: 30, ancho: 0.75, sonr: -0.05 }),
    ceno: E({ mx: 0.9, my: 0, c: 0.35, sd: -8, gd: -0.22, si: -8, gi: -0.22, abre: 2, ancho: 0.75, sonr: -0.25 }),
    pique: E({ mx: 0.9, my: 0, c: 0.5, z: 0.2, sd: -10, gd: -0.26, si: -10, gi: -0.26, abre: 12, ancho: 1.05, sonr: -0.4 }),
    listo: E({ mx: 0.85, my: 0.25, c: 0.3, sd: -2, gd: -0.1, si: -2, gi: -0.1, abre: 4, ancho: 1, sonr: 0.55 }),
    esfuerzo: E({ mx: 0.6, my: 0.3, c: 1, z: 1, sd: -6, gd: -0.2, si: -6, gi: -0.2, abre: 10, ancho: 1.05, sonr: -0.35, lengua: 0.5 }),
    susto: E({ mx: 0.3, my: -0.4, iris: 0.7, c: 0, sd: 28, gd: 0.2, si: 28, gi: 0.2, abre: 18, ancho: 0.8, sonr: -0.5, lengua: 0.2 }),
    cae: E({ mx: 0, my: 0, c: 0.8, z: 0.6, sd: 10, gd: 0.1, si: 10, gi: 0.1, abre: 12, ancho: 0.9, sonr: -0.3 }),
    mosqueo: E({ mx: -0.85, my: 0, c: 0.35, sd: -10, gd: -0.25, si: -6, gi: -0.2, abre: 3, ancho: 0.7, sonr: -0.35 }),
    listo2: E({ mx: 0.85, my: 0.25, c: 0.4, sd: -6, gd: -0.18, si: -6, gi: -0.18, abre: 10, ancho: 1.05, sonr: 0.6 }),
    tambaleo: E({ mx: 0.4, my: 0, iris: 0.72, c: 0, sd: 26, gd: 0.18, si: 26, gi: 0.18, abre: 13, ancho: 0.85, sonr: -0.45, lengua: 0.6 }),
    golpe: E({ mx: 0, my: 0, c: 1, z: 1, sd: 12, gd: 0.15, si: 12, gi: 0.15, abre: 12, ancho: 1, sonr: -0.4, lengua: 0.3 }),
    mareo: E({ mx: 0, my: 0, esp: 0.85, sd: 14, gd: 0.18, si: -4, gi: -0.08, abre: 9, ancho: 0.85, sonr: -0.15, lengua: 0.7 }),
    pataleo: E({ mx: 0.3, my: 0.2, c: 0.6, z: 0.5, sd: 8, gd: 0.1, si: 8, gi: 0.1, abre: 13, ancho: 1, sonr: -0.45 }),
    veR: E({ mx: -0.4, my: 0, iris: 0.85, c: 0, sd: 18, gd: 0.1, si: 18, gi: 0.1, abre: 6, ancho: 0.7, sonr: -0.1 }),
    apuro: E({ mx: -0.4, my: 0, c: 0.25, sd: 14, gd: 0.12, si: 20, gi: 0.16, abre: 6, ancho: 1.05, sonr: 0.75, rub: 0.8 }),
    camara: E({ mx: -0.85, my: 0, c: 0.25, h: 0.3, sd: 12, gd: 0.08, si: 16, gi: 0.12, abre: 6, ancho: 1.05, sonr: 0.85, rub: 0.8 })
  };
  const GUION_CARA_G = [
    [T.gCeja, T.gCeja + 0.15, "ceja"], [T.gBoca - 0.05, T.gBoca + 0.1, "boca"], [T.gCeno, T.gCeno + 0.2, "ceno"],
    [T.gPique, T.gPique + 0.12, "pique"], [T.gFrota0, T.gFrota0 + 0.15, "listo"], [T.g1Lun0, T.g1Lun0 + 0.12, "esfuerzo"],
    [T.g1Top - 0.04, T.g1Top + 0.06, "susto"], [T.g1Pies - 0.05, T.g1Pies + 0.05, "cae"], [T.gMira, T.gMira + 0.15, "mosqueo"],
    [T.gFrota2, T.gFrota2 + 0.12, "listo2"], [T.g2Lun0, T.g2Lun0 + 0.12, "esfuerzo"], [T.g2Top - 0.05, T.g2Top + 0.08, "tambaleo"],
    [T.gBarra - 0.03, T.gBarra + 0.04, "golpe"], [T.gBarra + 0.12, T.gBarra + 0.25, "mareo"], [T.gPat0 + 0.1, T.gPat0 + 0.25, "pataleo"],
    [T.gVeR, T.gVeR + 0.15, "veR"], [T.gSonr, T.gSonr + 0.25, "apuro"], [T.gCam, T.gCam + 0.2, "camara"]
  ];
  const PARP_G = [0.75, 2.6, 3.4, 6.2, 10.9, 12.2, 13.8];

  const GH = { F: G.HOMBRO, N: G.HOMBRO_C, LF: G.BRAZO_L, LN: G.BRAZO_C_L };
  const gArriba = { lejos: alFrente(G, GH.F, GH.LF, -0.2), cerca: alFrente(G, GH.N, GH.LN, -0.1) };
  function frotar(t, t0) {
    const s = Math.sin((t - t0) * 30);
    return {
      lejos: { q: P(GH.F.x + 6, 545 + 16 * s), mu: Math.PI + 0.25, dedos: PALMA },
      cerca: { q: P(GH.F.x - 22, 548 - 16 * s), mu: Math.PI - 0.1, dedos: PALMA }
    };
  }
  const gLados = {        // brazos abiertos para no caerse
    lejos: { q: P(GH.F.x + 170, GH.F.y + 120), mu: Math.PI + 0.6, dedos: ABIERTA },
    cerca: { q: P(GH.N.x - 150, GH.N.y + 110), mu: -0.5, dedos: ABIERTA }
  };

  // un intento de pino (los dos empiezan igual: zancada, manos al suelo y patada); rellena o
  function intento(t, I, o) {
    const Gq = GEO.g;
    const manoSuelo = (lado, H) => ({ w: H, apoyo: true, dW: norm(P(-Gq.sg * (lado === "cerca" ? -0.25 : 0.15), -1)), dedos: ABIERTA });
    const pieSuelo = (x, tilt = 0) => ({ w: P(x, FL.g - tobAlto(G)), tilt });
    const uL = tramo(t, I.lun0, I.lun1), uD = fase(t, I.lun1, I.plant);
    const Wl = add(G_WS, P(-26 * uL, 20 * uL));
    let th;
    if (t < I.lun1) th = 0.42 * uL;
    else if (t < I.plant) th = lerp(0.42, G_TC, suave(uD));
    else th = I.th(t);
    o.th = th;
    if (t < I.lun1) o.W = Wl;
    else if (t < I.plant) o.W = mezcla(Wl, apoyo(Gq, th, G_REP.Hf, G_REP.Hn), suave(uD));
    else o.W = I.W ? I.W(th) : apoyo(Gq, th, G_REP.Hf, G_REP.Hn);
    // piernas
    const pieL = pieSuelo(lerp(G_PIE0.lejos, G_PIE_ZANCADA, suave(fase(t, I.lun0, I.lun1 - 0.04))));
    if (t < I.lun1) pieL.w.y -= 12 * Math.sin(Math.PI * fase(t, I.lun0, I.lun1 - 0.04));
    const pieC = pieSuelo(G_PIE0.cerca, -0.35 * uL);
    o.piernas.cerca = { a: pieC, b: I.aireC(t), u: tramo(t, I.plant - 0.1, I.plant + 0.02) };
    o.piernas.lejos = { a: pieL, b: I.aireL(t), u: tramo(t, I.plant + 0.04, I.plant + 0.12) };
    // manos
    const uM = tramo(t, I.lun0 + 0.02, I.plant);
    o.manos.lejos = { arco: true, a: gArriba.lejos, b: manoSuelo("lejos", G_REP.Hf), u: uM };
    o.manos.cerca = { arco: true, a: gArriba.cerca, b: manoSuelo("cerca", G_REP.Hn), u: tramo(t, I.lun0 + 0.05, I.plant + 0.05) };
    cabPino(o, th, "g");
    return o;
  }

  function guillermo(t) {
    const Gq = GEO.g;
    const o = { th: 0, W: G_WS, torso: 0, cab: 0, piernas: {}, manos: {}, resp: 0.004 * Math.sin(t * 2.2) };
    const pieSuelo = (x, tilt = 0) => ({ w: P(x, FL.g - tobAlto(G)), tilt });
    const manoSuelo = (lado, H) => ({ w: H, apoyo: true, dW: norm(P(-Gq.sg * (lado === "cerca" ? -0.25 : 0.15), -1)), dedos: ABIERTA });
    let estado = "pie";
    let rojo = 0, sudor = 0, enfado = 0;

    if (t < T.g1Lun0) {
      // de pie mirando a Rodri: bolsillos → se pica → se frota las manos → brazos arriba
      o.W = add(G_WS, P(0, 3 * Math.sin(t * 2.2 + 0.5)));
      o.piernas.cerca = pieSuelo(G_PIE0.cerca); o.piernas.lejos = pieSuelo(G_PIE0.lejos);
      const fr = dentro(t, T.gFrota0, T.gFrota0 + 0.1, T.gFrota1 - 0.04, T.gFrota1 + 0.05);
      const arr = tramo(t, T.gArr0, T.gArr1);
      const F = frotar(t, T.gFrota0);
      for (const lado of ["cerca", "lejos"]) o.manos[lado] = { a: { a: { bols: true }, b: F[lado], u: fr }, b: gArriba[lado], u: arr };
      const pique = dentro(t, T.gPique, T.gPique + 0.15, T.gFrota0, T.gFrota0 + 0.3);
      o.torso = -0.05 * dentro(t, T.gBoca - 0.05, T.gBoca + 0.1, T.gCeno, T.gCeno + 0.2) + 0.08 * pique + 0.04 * fr - 0.05 * arr;
      o.cab = -0.12 * dentro(t, T.gBoca - 0.05, T.gBoca + 0.1, T.gCeno, T.gCeno + 0.2) + 0.06 * pique + 0.1 * fr - 0.1 * arr;
      o.W = add(o.W, P(0, -5 * arr + 4 * Math.abs(Math.sin((t - T.gPique) * 16)) * pique));
      rojo = 0.65 * pique; enfado = pique;
    } else if (t < T.g1Arriba) {
      // PRIMER INTENTO: patada floja, se queda a medias y cae de pie
      const I = {
        lun0: T.g1Lun0, lun1: T.g1Lun1, plant: T.g1Plant,
        th: tt => {
          if (tt < T.g1Top) return lerp(G_TC, 2.78, salida(fase(tt, T.g1Plant, T.g1Top)));
          if (tt < T.g1Cae0) return 2.78 + 0.04 * Math.sin((tt - T.g1Top) * 30) * (1 - fase(tt, T.g1Top, T.g1Cae0));
          return lerp(2.78, G_TC - 0.05, entrada(fase(tt, T.g1Cae0, T.g1Pies)));
        },
        aireC: tt => ({ a: { f: claves([[T.g1Plant - 0.1, 2.0], KF([T.g1Top, 0.7], salida), [T.g1Cae0, 0.6]], tt)[0] + 0.4 * Math.sin((tt - T.g1Top) * 26) * dentro(tt, T.g1Top, T.g1Top + 0.05, T.g1Cae0, T.g1Cae0 + 0.1),
          k: 0.95, punta: 0.6 }, b: pieSuelo(G_ATERRIZA.cerca), u: tramo(tt, T.g1Pies - 0.1, T.g1Pies) }),
        aireL: tt => ({ a: { f: claves([[T.g1Plant + 0.06, 2.2], KF([T.g1Top, 1.25], salida), [T.g1Cae0, 1.2]], tt)[0] - 0.35 * Math.sin((tt - T.g1Top) * 26 + 1) * dentro(tt, T.g1Top, T.g1Top + 0.05, T.g1Cae0, T.g1Cae0 + 0.1),
          k: 0.7, punta: 0.3 }, b: pieSuelo(G_ATERRIZA.lejos), u: tramo(tt, T.g1Pies - 0.075, T.g1Pies) })
      };
      if (t < T.g1Pies) {
        intento(t, I, o);
        estado = t < T.g1Plant ? "pie" : "pino";
      } else {
        // se levanta trastabillando
        const uA = fase(t, T.g1Pies, T.g1Arriba);
        const Wrod = apoyo(Gq, G_TC - 0.05, G_REP.Hf, G_REP.Hn);
        o.th = lerp(G_TC - 0.05, 0, suave(uA));
        o.W = mezcla(Wrod, P(G_X1, G_WS.y), suave(uA));
        o.W = add(o.W, P(8 * Math.sin(Math.PI * uA), 0));
        o.piernas.cerca = pieSuelo(G_ATERRIZA.cerca); o.piernas.lejos = pieSuelo(G_ATERRIZA.lejos);
        o.manos.lejos = { a: manoSuelo("lejos", G_REP.Hf), b: gLados.lejos, u: tramo(t, T.g1Pies + 0.02, T.g1Arriba - 0.06) };
        o.manos.cerca = { a: manoSuelo("cerca", G_REP.Hn), b: gLados.cerca, u: tramo(t, T.g1Pies, T.g1Arriba - 0.1) };
        cabPino(o, o.th, "g");
      }
      rojo = 0.8 * dentro(t, T.g1Lun0, T.g1Plant, T.g1Pies, T.g1Arriba + 0.4);
      sudor = dentro(t, T.g1Top, T.g1Top + 0.1, T.g1Arriba, T.g1Arriba + 0.4);
    } else if (t < T.g2Lun0) {
      // entre intentos: brazos abiertos, mira a cámara mosqueado, se frota las manos y sube los brazos
      o.W = add(P(G_X1, G_WS.y), P(0, 3 * Math.sin(t * 2.2 + 0.5)));
      // se coloca otra vez en su sitio con dos pasitos
      const vuelve = tramo(t, T.gFrota2 - 0.25, T.gFrota2 + 0.05);
      o.W.x = lerp(G_X1, G_WS.x, vuelve);
      o.piernas.cerca = pieSuelo(lerp(G_ATERRIZA.cerca, G_PIE0.cerca, tramo(t, T.gFrota2 - 0.25, T.gFrota2 - 0.08)));
      o.piernas.lejos = pieSuelo(lerp(G_ATERRIZA.lejos, G_PIE0.lejos, tramo(t, T.gFrota2 - 0.12, T.gFrota2 + 0.05)));
      o.piernas.cerca.w.y -= 10 * campana(t, T.gFrota2 - 0.25, T.gFrota2 - 0.08);
      o.piernas.lejos.w.y -= 10 * campana(t, T.gFrota2 - 0.12, T.gFrota2 + 0.05);
      const fr = dentro(t, T.gFrota2, T.gFrota2 + 0.08, T.gFrota3 - 0.04, T.gFrota3 + 0.04);
      const arr = tramo(t, T.gArr2, T.gArr3);
      const F = frotar(t, T.gFrota2);
      const jarras = {
        lejos: { q: P(GH.F.x + 20, 640), mu: -2.4, dedos: GARRA },
        cerca: { q: P(GH.N.x + 30, 650), mu: -0.9, dedos: GARRA }
      };
      for (const lado of ["cerca", "lejos"]) {
        let m = { a: gLados[lado], b: jarras[lado], u: tramo(t, T.g1Arriba, T.gMira + 0.1) };
        m = { a: m, b: F[lado], u: fr };
        m = { a: m, b: gArriba[lado], u: arr };
        o.manos[lado] = m;
      }
      o.cab = -0.25 * dentro(t, T.gMira, T.gMira + 0.12, T.gFrota2 - 0.1, T.gFrota2) + 0.1 * fr - 0.1 * arr;
      o.torso = -0.04 * arr + 0.04 * fr;
      enfado = dentro(t, T.gMira, T.gMira + 0.1, T.gFrota2, T.gFrota2 + 0.2);
      rojo = 0.5 * enfado;
    } else if (t < T.gVuelca) {
      // SEGUNDO INTENTO: patada con todo, se pasa y anda con las manos hasta la barra
      const thPaseo = tt => {
        if (tt < T.g2Top) return lerp(G_TC, Math.PI + 0.22, salida(fase(tt, T.g2Plant, T.g2Top)));
        const a = Math.PI + 0.22, b = Math.PI - 0.17;
        let th = tt < T.gDer ? lerp(a, a - 0.06, suave(fase(tt, T.g2Top, T.gIzq))) : 0;
        if (tt >= T.gIzq) th = lerp(a - 0.06, b, suave(fase(tt, T.gIzq, T.gDer + 0.12)));
        const tamb = tramo(tt, T.gDer, T.gDer + 0.3);
        return th + tamb * (0.06 * Math.sin((tt - T.gDer) * 15) + 0.03 * Math.sin((tt - T.gDer) * 23 + 1));
      };
      // pelvis: los dos brazos casi estirados hasta las manos (que van dando pasos)
      const WPaseo = (th, tt) => {
        const mf = manoPaseo(G_MANOS.lf, tt), mn = manoPaseo(G_MANOS.ln, tt);
        return apoyo(Gq, th, P(mf.x, G_REP.Hf.y), P(mn.x, G_REP.Hn.y));
      };
      const tijera = (tt, lado) => {
        const ph = lado === "cerca" ? 0 : Math.PI;
        const amp = tramo(tt, T.g2Top - 0.05, T.g2Top + 0.2);
        return { f: (lado === "cerca" ? 0.25 : -0.05) + 0.55 * Math.sin((tt - T.g2Top) * 13 + ph) * amp,
          k: 0.97 - 0.28 * Math.max(0, Math.sin((tt - T.g2Top) * 13 + ph + 0.6)) * amp, punta: 1.1 };
      };
      const I = {
        lun0: T.g2Lun0, lun1: T.g2Lun1, plant: T.g2Plant,
        th: thPaseo,
        W: th => WPaseo(th, t),
        aireC: tt => ({ a: { f: claves([[T.g2Plant - 0.1, 2.0], KF([T.g2Top - 0.1, -0.3], salida)], tt)[0], k: 1 - 0.1 * campana(tt, T.g2Plant, T.g2Top), punta: lerp(0.3, 1.1, tramo(tt, T.g2Plant, T.g2Top)) },
          b: tijera(tt, "cerca"), u: tramo(tt, T.g2Top - 0.1, T.g2Top + 0.1) }),
        aireL: tt => ({ a: { f: claves([[T.g2Plant + 0.06, 2.2], KF([T.g2Top, -0.1], salida)], tt)[0], k: 1 - 0.3 * campana(tt, T.g2Plant, T.g2Top + 0.05), punta: lerp(0.2, 1.1, tramo(tt, T.g2Plant, T.g2Top)) },
          b: tijera(tt, "lejos"), u: tramo(tt, T.g2Top - 0.05, T.g2Top + 0.15) })
      };
      intento(t, I, o);
      // manos: después del apoyo, las del paseo
      if (t >= T.g2Plant) {
        const mf = manoPaseo(G_MANOS.lf, t), mn = manoPaseo(G_MANOS.ln, t);
        const uP = tramo(t, T.g2Plant, T.g2Plant + 0.05);
        o.manos.lejos = { a: o.manos.lejos, b: manoSuelo("lejos", P(mf.x, G_REP.Hf.y - mf.h)), u: uP };
        o.manos.cerca = { a: o.manos.cerca, b: manoSuelo("cerca", P(mn.x, G_REP.Hn.y - mn.h)), u: uP };
      }
      estado = t < T.g2Plant ? "pie" : "pino";
      rojo = 0.9 * tramo(t, T.g2Lun0, T.g2Plant);
      sudor = tramo(t, T.g2Top, T.g2Top + 0.3);
      o.cab += 0.08 * Math.sin(t * 17) * tramo(t, T.g2Top, T.g2Top + 0.3);
    } else {
      // SE VUELCA SOBRE LA BARRA y se queda colgado
      const uV = fase(t, T.gVuelca, T.gBarra);
      const fin = manoPaseo(G_MANOS.lf, T.gVuelca), finN = manoPaseo(G_MANOS.ln, T.gVuelca);
      const anterior = antesDe(guillermo,T.gVuelca), thV = anterior.th, W0 = anterior.W;
      // el cuerpo se endereza contra la barra; la pelvis se queda en el canto
      const thA = Math.PI - 0.06;
      const bote = Math.exp(-(t - T.gBarra) * 9) * Math.sin((t - T.gBarra) * 24) * (t > T.gBarra ? 1 : 0);
      const resbala = tramo(t, T.gBarra + 0.05, T.gResb);
      const sway = 0.02 * Math.sin(t * 2.4) * tramo(t, T.gResb, T.gResb + 0.5);
      o.th = lerp(thV, thA, suave(uV)) + 0.04 * bote + sway + 0.03 * Math.sin(t * 19) * dentro(t, T.gPat0, T.gPat0 + 0.1, T.gPat1 - 0.1, T.gPat1);
      const Wst = add(G_ATASCO, P(0, -6 * resbala + 6 * bote));
      o.W = mezcla(W0, Wst, suave(uV));
      // piernas: se vencen por encima de la barra (rectas), golpean y se doblan pataleando
      const kick = dentro(t, T.gPat0, T.gPat0 + 0.08, T.gPat1 - 0.1, T.gPat1 + 0.1);
      const tic = campana(t, 11.9, 12.15) + campana(t, 13.2, 13.45);
      for (const lado of ["cerca", "lejos"]) {
        const sg = lado === "cerca" ? 1 : -1;
        const caidaF = lerp(0.1 * sg, 1.62, entrada(uV));               // flexión de cadera (en el muñeco)
        const encima = { f: caidaF, k: 1, punta: lerp(1.1, 0.5, uV) };
        // tumbada sobre la barra: recta desde la cadera hasta apoyar el tobillo en el tablero
        const hip = caderaMundo(G, true, o, lado), L = G.A.datos.piezas["pierna_" + lado].largo * kOf(G) * 0.97;
        const yT = YC - (lado === "cerca" ? 17 : 23), dy = clamp(yT - hip.y, -L * 0.9, L * 0.9);
        let a = Math.atan2(dy, Math.sqrt(L * L - dy * dy));
        const pat = Math.max(0, Math.sin(t * 14 + (lado === "cerca" ? 0 : Math.PI)));
        a -= (0.42 * pat * kick + 0.3 * campana(t, 11.9, 12.2) * (lado === "cerca" ? 1 : 0.6) + 0.22 * campana(t, 13.2, 13.5) * (lado === "lejos" ? 1 : 0.5));
        const recta = { w: P(hip.x + Math.cos(a) * L, hip.y + Math.sin(a) * L), punta: 0.95 + 0.25 * pat * kick };
        o.piernas[lado] = t < T.gBarra ? { a: encima, b: recta, u: tramo(t, T.gBarra - 0.07, T.gBarra) } : recta;
      }
      // manos: del suelo a colgando (sin llegar al suelo), braceo y saludo
      const brazea = dentro(t, T.gPat0, T.gPat0 + 0.1, T.gPat1 - 0.15, T.gPat1);
      const Sf = hojaYmundoHombro(G, true, o, "lejos"), Sn = hojaYmundoHombro(G, true, o, "cerca");
      const bf = Math.sin(t * 13), bn = Math.sin(t * 13 + 2);
      // los brazos cuelgan (casi estirados) y las manos quedan justo por encima del suelo
      const cuelga = (S, r, dx, sw) => P(S.x + dx + sw, Math.min(FL.g - 16, S.y + r * 0.95) - 10 * Math.abs(sw) / 26);
      const cuelgaF = cuelga(Sf, Gq.rF, 6, 22 * bf * brazea), cuelgaN = cuelga(Sn, Gq.rN, -12, 26 * bn * brazea);
      const uS = tramo(t, T.gBarra, T.gResb);
      o.manos.lejos = { a: manoSuelo("lejos", P(fin.x, G_REP.Hf.y)), b: { w: cuelgaF, dW: norm(sub(Sf, cuelgaF)), dedos: LACIA }, u: uS };
      o.manos.cerca = { a: manoSuelo("cerca", P(finN.x, G_REP.Hn.y)), b: { w: cuelgaN, dW: norm(sub(Sn, cuelgaN)), dedos: LACIA }, u: uS };
      cabPino(o, o.th, "g"); o.cab += -0.1 * resbala + 0.05 * Math.sin(t * 1.9) + 0.06 * bote;
      estado = "colgado";
      rojo = 1 - 0.25 * tramo(t, T.gSonr, T.gSonr + 0.5);
      sudor = 1 - 0.6 * tramo(t, T.gCam, T.gCam + 0.5);
    }
    o.estado = estado;
    o.rojo = rojo; o.sudor = sudor; o.enfado = enfado;
    const e = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    o.cara = cara(e, parpadeo(t, PARP_G));
    enlaza(o,guillermo,t,T.g1Lun0,0.08);
    enlaza(o,guillermo,t,T.g2Lun0,0.08);
    enlaza(o,guillermo,t,T.gVuelca,0.13);
    enlaza(o,guillermo,t,T.g1Arriba,0.09);
    return o;
  }
  // hombro en el mundo para una especificación (antes de construir del todo)
  function caderaMundo(R, espejo, o, lado) {
    const p = nuevaP(R, espejo); p.torso = o.torso || 0;
    const M = marco(R, p, (espejo ? -1 : 1) * o.th, o.W);
    return hojaAMundo(R, p, M, R.tronco(p)(R.CADERA[lado]));
  }
  function hojaYmundoHombro(R, espejo, o, lado) {
    const p = nuevaP(R, espejo); p.torso = o.torso || 0;
    const M = marco(R, p, (espejo ? -1 : 1) * o.th, o.W);
    return hojaAMundo(R, p, M, R.tronco(p)(lado === "cerca" ? R.HOMBRO_C : R.HOMBRO));
  }

  /* ---------- poses (con memoria) ---------- */
  const MEMO = new Map();
  function poses(t) {
    if (MEMO.has(t)) return MEMO.get(t);
    if (MEMO.size > 8) MEMO.clear();
    const oR = rodri(t), oG = guillermo(t);
    const QR = construye(RO, false, oR, t), QG = construye(G, true, oG, t);
    // giros de muñeca del saludo
    if (oR.olaAng) QR.p.manoCerca.ang = (QR.p.manoCerca.ang || 0) + oR.olaAng;
    // Guillermo, colgado, saluda a cámara con la manita junto a la cara (boca abajo: dedos hacia el suelo)
    const sal = dentro(t, T.gSal0, T.gSal0 + 0.18, T.gSal1 - 0.15, T.gSal1);
    if (sal > 0) {
      const cg = caraMundo(QG, "g"), flap = Math.sin((t - T.gSal0) * 20);
      const h = P(cg.x - 78 + 7 * flap, cg.y + 30 - 3 * Math.abs(flap));
      const B = clampMano(G, QG.p, "cerca", resMano(G, QG.p, QG.M, "cerca", { w: h, dW: norm(P(-0.35 + 0.25 * flap, -1)), dedos: PALMA, dobla: -1 }));
      QG.p.manoCerca = mezclaMano(QG.p.manoCerca, B, suave(sal));
    }
    // miradas
    const caraG = caraMundo(QG, "g"), caraR = caraMundo(QR, "r");
    const mR = dentro(t, T.rOla3, T.rOla3 + 0.15, T.rRisa0, T.rRisa0 + 0.05) + dentro(t, T.rRisa1, T.rRisa1 + 0.1, T.rCam3 - 0.1, T.rCam3 + 0.1) * (1 - campana(t, T.rUy - 0.05, T.rAnda2));
    miraA(QR, caraG, OJO.r, mR);
    const mG = dentro(t, 0.3, 0.5, T.gCeno + 0.2, T.gCeno + 0.4) + dentro(t, T.gPique, T.gPique + 0.1, T.gFrota0, T.gFrota0 + 0.1)
      + dentro(t, T.gVeR, T.gVeR + 0.15, T.gCam - 0.1, T.gCam + 0.1);
    miraA(QG, caraR, OJO.g, clamp(mG));
    const v = { r: QR, g: QG, oR, oG };
    MEMO.set(t, v);
    return v;
  }

  /* =====================================================================================
   * DECORADO: la taberna (se pinta una vez)
   * ===================================================================================== */
  const FX = -60, FY = -40, FW = W + 280, FH = H + 80;
  const XD = W + 210;                            // hasta dónde se pinta el decorado por la derecha
  const PARED_Y = 470;
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = FW; c.height = FH;
    const g = c.getContext("2d"); g.translate(-FX, -FY);
    // pared: papel verde botella con lunarcitos dorados
    let gr = g.createLinearGradient(0, -40, 0, PARED_Y);
    gr.addColorStop(0, "#14302e"); gr.addColorStop(0.55, "#1d4340"); gr.addColorStop(1, "#173633");
    g.fillStyle = gr; g.fillRect(-80, -60, XD + 80, PARED_Y + 60);
    g.fillStyle = "rgba(214,180,96,0.22)";
    for (let y = -30; y < 330; y += 26) for (let x = -60 + ((y / 26) % 2 ? 13 : 0); x < XD; x += 26) {
      g.beginPath(); g.moveTo(x, y - 4); g.lineTo(x + 3, y); g.lineTo(x, y + 4); g.lineTo(x - 3, y); g.closePath(); g.fill();
    }
    // moldura y zócalo de madera
    g.fillStyle = "#2a160e"; g.fillRect(-80, 318, XD + 80, 152);
    g.fillStyle = "#4a2a1a"; g.fillRect(-80, 318, XD + 80, 10);
    g.fillStyle = "#1b0d07"; g.fillRect(-80, 328, XD + 80, 3);
    for (let x = -60; x < XD; x += 118) {
      g.fillStyle = "#331b10"; g.fillRect(x + 8, 344, 100, 108);
      g.strokeStyle = "#1a0c06"; g.lineWidth = 3; g.strokeRect(x + 8, 344, 100, 108);
      g.strokeStyle = "rgba(160,100,60,0.25)"; g.lineWidth = 2; g.strokeRect(x + 14, 350, 88, 96);
    }
    g.fillStyle = "#3a2013"; g.fillRect(-80, 456, XD + 80, 16);
    g.fillStyle = "#170a05"; g.fillRect(-80, PARED_Y - 2, XD + 80, 4);
    // ventana con la calle de noche
    ventana(g, 28, 70, 150, 220);
    // reloj (la esfera; las agujas van aparte)
    g.save(); g.translate(RELOJ.x, RELOJ.y);
    g.fillStyle = "#6b4a22"; g.beginPath(); g.arc(0, 0, 38, 0, TAU); g.fill();
    g.fillStyle = "#f3ead2"; g.beginPath(); g.arc(0, 0, 31, 0, TAU); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 38, 0, TAU); g.stroke();
    for (let i = 0; i < 12; i++) { const a = i * TAU / 12, r0 = i % 3 ? 25 : 21; g.lineWidth = i % 3 ? 2 : 3.5;
      g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.lineTo(Math.cos(a) * 29, Math.sin(a) * 29); g.stroke(); }
    g.restore();
    // cuadro con un velero
    cuadro(g, 440, 112, 150, 104);
    // la barra (detrás: espejo y baldas; delante: la barra de caoba)
    contrabarra(g);
    // suelo de baldosas de barro y crema en perspectiva
    suelo(g);
    barra(g);
    // luz de las lámparas sobre la pared y el suelo
    for (const lx of LAMPARAS) {
      gr = g.createRadialGradient(lx, 150, 10, lx, 330, 330);
      gr.addColorStop(0, "rgba(255,206,120,0.22)"); gr.addColorStop(1, "rgba(255,206,120,0)");
      g.fillStyle = gr; g.fillRect(lx - 340, 60, 680, 560);
    }
    return c;
  }
  const RELOJ = P(318, 128);
  const LAMPARAS = [300, 600];
  function ventana(g, x, y, w, h) {
    let gr = g.createLinearGradient(0, y, 0, y + h);
    gr.addColorStop(0, "#0d1838"); gr.addColorStop(1, "#28406a");
    g.fillStyle = gr; g.fillRect(x, y, w, h);
    // luna y edificios de enfrente con ventanas encendidas
    g.fillStyle = "#fff6d6"; g.beginPath(); g.arc(x + w * 0.72, y + 42, 15, 0, TAU); g.fill();
    g.fillStyle = "#0d1838"; g.beginPath(); g.arc(x + w * 0.72 + 7, y + 37, 13, 0, TAU); g.fill();
    g.fillStyle = "#101a33";
    const ed = [[0, 120, 40], [38, 92, 44], [80, 136, 38], [116, 104, 40]];
    for (const [ex, eh, ew] of ed) {
      g.fillRect(x + ex, y + h - eh, ew, eh);
      for (let yy = y + h - eh + 10; yy < y + h - 8; yy += 18) for (let xx = x + ex + 6; xx < x + ex + ew - 8; xx += 12)
        if (hash(xx * 0.37 + yy * 1.3) > 0.5) { g.fillStyle = "#ffd77a"; g.fillRect(xx, yy, 6, 8); g.fillStyle = "#101a33"; }
    }
    g.fillStyle = "#3b2416";
    g.fillRect(x - 10, y - 10, w + 20, 10); g.fillRect(x - 10, y + h, w + 20, 14); g.fillRect(x - 10, y, 10, h); g.fillRect(x + w, y, 10, h);
    g.fillRect(x + w / 2 - 4, y, 8, h); g.fillRect(x, y + h * 0.45 - 4, w, 8);
    g.strokeStyle = TINTA; g.lineWidth = 3; g.strokeRect(x - 10, y - 10, w + 20, h + 24);
    g.fillStyle = "rgba(255,255,255,0.07)"; g.beginPath(); g.moveTo(x + 10, y + h); g.lineTo(x + 50, y); g.lineTo(x + 66, y); g.lineTo(x + 26, y + h); g.fill();
    // visillos
    g.fillStyle = "rgba(225,210,170,0.55)";
    for (const sx of [x - 6, x + w - 22]) { g.beginPath(); g.moveTo(sx, y - 4); g.quadraticCurveTo(sx + 30, y + h * 0.5, sx + 4, y + h + 6); g.lineTo(sx + 24, y + h + 6);
      g.quadraticCurveTo(sx + 44, y + h * 0.5, sx + 26, y - 4); g.closePath(); g.fill(); }
  }
  function cuadro(g, x, y, w, h) {
    g.fillStyle = "#c79a3e"; g.fillRect(x - 10, y - 10, w + 20, h + 20);
    g.strokeStyle = TINTA; g.lineWidth = 3; g.strokeRect(x - 10, y - 10, w + 20, h + 20);
    let gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, "#f2b36b"); gr.addColorStop(0.55, "#f7d79a"); gr.addColorStop(0.56, "#3c7d9c"); gr.addColorStop(1, "#24566f");
    g.fillStyle = gr; g.fillRect(x, y, w, h);
    g.fillStyle = "#ffe7a8"; g.beginPath(); g.arc(x + w * 0.3, y + h * 0.5, 14, Math.PI, 0); g.fill();
    g.fillStyle = "#f4efe2"; g.beginPath(); g.moveTo(x + w * 0.62, y + h * 0.18); g.lineTo(x + w * 0.62, y + h * 0.52); g.lineTo(x + w * 0.45, y + h * 0.52); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(x + w * 0.64, y + h * 0.24); g.lineTo(x + w * 0.64, y + h * 0.52); g.lineTo(x + w * 0.76, y + h * 0.52); g.closePath(); g.fill();
    g.fillStyle = "#7a3b22"; g.beginPath(); g.moveTo(x + w * 0.42, y + h * 0.55); g.lineTo(x + w * 0.8, y + h * 0.55); g.lineTo(x + w * 0.74, y + h * 0.64); g.lineTo(x + w * 0.48, y + h * 0.64); g.closePath(); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 2;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x + 10 + i * 30, y + h * 0.75 + i * 6); g.lineTo(x + 40 + i * 30, y + h * 0.75 + i * 6); g.stroke(); }
  }
  // baldas y espejo detrás de la barra
  function contrabarra(g) {
    const x0 = XC + 20;
    g.fillStyle = "#2b150b"; g.fillRect(x0 - 12, 60, XD - x0 + 20, 262);
    let gr = g.createLinearGradient(x0, 80, XD - 20, 300);
    gr.addColorStop(0, "#5f7f86"); gr.addColorStop(0.5, "#8fb0b2"); gr.addColorStop(1, "#4d6b72");
    g.fillStyle = gr; g.fillRect(x0, 74, XD - x0, 236);
    g.fillStyle = "rgba(255,255,255,0.18)";
    for (const sx of [x0 + 30, x0 + 120]) { g.beginPath(); g.moveTo(sx, 310); g.lineTo(sx + 70, 74); g.lineTo(sx + 96, 74); g.lineTo(sx + 26, 310); g.fill(); }
    g.strokeStyle = TINTA; g.lineWidth = 3; g.strokeRect(x0, 74, XD - x0, 236);
    // baldas con botellas (sin etiquetas)
    for (const [y, sem] of [[160, 1], [242, 7]]) {
      g.fillStyle = "#3f2214"; g.fillRect(x0 - 6, y, XD - x0 + 10, 10); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x0 - 6, y, XD - x0 + 10, 10);
      let bx = x0 + 6;
      for (let i = 0; bx < XD - 10; i++) {
        const h = hash(i * 3.1 + sem), alto = 46 + 26 * h, ancho = 14 + 7 * hash(i + sem * 2);
        const cols = ["#3d7a3a", "#8a2a1e", "#c98a2c", "#2c4f7a", "#e9e2c8", "#5a2a5c", "#9a6a2a"];
        const col = cols[Math.floor(hash(i * 7.7 + sem) * cols.length)];
        botella(g, bx + ancho / 2, y, ancho, alto, col);
        bx += ancho + 6 + 6 * hash(i * 1.9 + sem);
      }
    }
  }
  function botella(g, x, base, w, h, col) {
    g.save(); g.fillStyle = col; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x - w / 2, base); g.lineTo(x - w / 2, base - h * 0.62); g.quadraticCurveTo(x - w / 2, base - h * 0.74, x - w * 0.18, base - h * 0.8);
    g.lineTo(x - w * 0.18, base - h); g.lineTo(x + w * 0.18, base - h); g.lineTo(x + w * 0.18, base - h * 0.8);
    g.quadraticCurveTo(x + w / 2, base - h * 0.74, x + w / 2, base - h * 0.62); g.lineTo(x + w / 2, base); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(x - w * 0.32, base - h * 0.6, 3, h * 0.45);
    g.fillStyle = "#c9a24a"; g.fillRect(x - w * 0.2, base - h - 3, w * 0.4, 5);
    g.restore();
  }
  function suelo(g) {
    const y0 = PARED_Y, vp = P(512, 160);
    g.fillStyle = "#6a2c1b"; g.fillRect(-80, y0, XD + 80, H + 80 - y0);
    const filas = [470, 486, 505, 527, 553, 584, 621, 664];
    const xs = []; for (let i = -14; i <= 14; i++) xs.push(512 + i * 74);
    const aX = (xb, y) => vp.x + (xb - vp.x) * (y - vp.y) / (600 - vp.y);
    for (let r = 0; r < filas.length - 1; r++) for (let c = 0; c < xs.length - 1; c++) {
      const ya = filas[r], yb = filas[r + 1];
      const pts = [P(aX(xs[c], ya), ya), P(aX(xs[c + 1], ya), ya), P(aX(xs[c + 1], yb), yb), P(aX(xs[c], yb), yb)];
      const crema = (r + c) % 2 === 0;
      g.fillStyle = crema ? "#c9ad7e" : "#8a3a22";
      g.beginPath(); M2.poligono(g, pts); g.fill();
      g.fillStyle = crema ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
      g.beginPath(); M2.poligono(g, [pts[0], pts[1], mezcla(pts[1], pts[2], 0.4), mezcla(pts[0], pts[3], 0.4)]); g.fill();
    }
    g.strokeStyle = "rgba(40,16,8,0.55)"; g.lineWidth = 1.5;
    for (const y of filas) { g.beginPath(); g.moveTo(-80, y); g.lineTo(XD, y); g.stroke(); }
    for (const xb of xs) { g.beginPath(); g.moveTo(aX(xb, y0), y0); g.lineTo(aX(xb, 680), 680); g.stroke(); }
    // sombra del zócalo sobre el suelo
    const gr = g.createLinearGradient(0, y0, 0, y0 + 30); gr.addColorStop(0, "rgba(0,0,0,0.45)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(-80, y0, XD + 80, 30);
  }
  // la barra de caoba (extremo izquierdo en XC)
  const BARRA_BASE = FL.g + 8;
  function barra(g) {
    const x0 = XC, top = YC, fondoX = 14;
    // costado (se ve un poco: está a la derecha del centro)
    g.fillStyle = "#30140a";
    g.beginPath(); g.moveTo(x0, top); g.lineTo(x0 + fondoX, top - 14); g.lineTo(x0 + fondoX, BARRA_BASE - 22); g.lineTo(x0, BARRA_BASE); g.closePath(); g.fill();
    // frente
    let gr = g.createLinearGradient(0, top, 0, BARRA_BASE);
    gr.addColorStop(0, "#6a3119"); gr.addColorStop(1, "#401b0c");
    g.fillStyle = gr; g.fillRect(x0, top + 12, XD - x0, BARRA_BASE - top - 12);
    for (let x = x0 + 12; x < XD - 10; x += 96) {
      g.fillStyle = "rgba(0,0,0,0.22)"; g.fillRect(x, top + 30, 80, BARRA_BASE - top - 74);
      g.strokeStyle = "rgba(255,190,140,0.18)"; g.lineWidth = 2; g.strokeRect(x + 4, top + 34, 72, BARRA_BASE - top - 82);
      g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x, top + 30, 80, BARRA_BASE - top - 74);
    }
    g.fillStyle = "#1c0b04"; g.fillRect(x0, BARRA_BASE - 12, XD - x0, 12);
    // barra de latón para los pies
    g.strokeStyle = "#5a4012"; g.lineWidth = 9; g.beginPath(); g.moveTo(x0 + 6, BARRA_BASE - 30); g.lineTo(XD, BARRA_BASE - 30); g.stroke();
    g.strokeStyle = "#e0b552"; g.lineWidth = 5; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.6)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0 + 6, BARRA_BASE - 32); g.lineTo(XD, BARRA_BASE - 32); g.stroke();
    for (let x = x0 + 40; x < XD; x += 150) { g.fillStyle = "#b8892e"; g.fillRect(x - 3, BARRA_BASE - 30, 6, 18); }
    // tablero de arriba
    g.fillStyle = "#8a4a26"; g.beginPath(); g.moveTo(x0 - 6, top); g.lineTo(x0 + fondoX - 4, top - 14); g.lineTo(XD, top - 14); g.lineTo(XD, top); g.closePath(); g.fill();
    g.fillStyle = "#5e2a13"; g.fillRect(x0 - 6, top, XD + 6 - x0, 13);
    g.strokeStyle = "rgba(255,210,160,0.55)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 - 6, top + 1); g.lineTo(XD, top + 1); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(x0 - 6, top); g.lineTo(x0 + fondoX - 4, top - 14); g.stroke();
    g.strokeRect(x0 - 6, top, XD + 6 - x0, 13);
    g.beginPath(); g.moveTo(x0, top + 13); g.lineTo(x0, BARRA_BASE); g.stroke();
    // grifos de cerveza
    const gx = XC + 268;
    g.fillStyle = "#3a3a40"; g.fillRect(gx - 30, top - 18, 64, 6);
    g.fillStyle = "#d9ab45"; g.fillRect(gx - 6, top - 98, 14, 82); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(gx - 6, top - 98, 14, 82);
    g.fillRect(gx - 32, top - 92, 66, 12); g.strokeRect(gx - 32, top - 92, 66, 12);
    for (const [dx, col] of [[-24, "#1d1d22"], [1, "#8a1f1c"], [26, "#235a2a"]]) {
      g.fillStyle = "#c9a24a"; g.fillRect(gx + dx - 3, top - 80, 6, 14);
      g.fillStyle = col; g.beginPath(); g.roundRect ? g.roundRect(gx + dx - 5, top - 128, 10, 40, 4) : g.rect(gx + dx - 5, top - 128, 10, 40); g.fill(); g.stroke();
    }
    // posavasos apilados
    g.fillStyle = "#e9dcc0"; g.beginPath(); g.ellipse(XC + 318, top - 8, 16, 4, 0, 0, TAU); g.fill(); g.stroke();
  }

  /* ---------- la caña: se vuelca y se derrama ---------- */
  const CANA = P(XC + 176, YC - 10);
  const VASO = [P(-13,-46),P(13,-46),P(10,0),P(-10,0)];
  const INTERIOR = [P(-11.6,-44.5),P(11.6,-44.5),P(8.7,-1.5),P(-8.7,-1.5)];
  const areaVaso = pol => Math.abs(pol.reduce((a,p,i) => {
    const q = pol[(i+1)%pol.length]; return a+p.x*q.y-p.y*q.x;
  },0))/2;
  const LLENO = .88 * areaVaso(INTERIOR), ANG_LADO = Math.atan2(46,3);
  function recortaVaso(pol,n,c) {
    const out = [], d = p => p.x*n.x+p.y*n.y-c;
    for (let i=0;i<pol.length;i++) {
      const a=pol[i], b=pol[(i+1)%pol.length], da=d(a), db=d(b);
      if (da>=0) out.push(a);
      if ((da>=0)!==(db>=0)) { const k=da/(da-db); out.push(P(lerp(a.x,b.x,k),lerp(a.y,b.y,k))); }
    }
    return out;
  }
  function puntoVaso(p,a) { return add(P(CANA.x+10,CANA.y),rot(P(p.x-10,p.y),a)); }
  // Primera intersección real de un zapato con la silueta del vaso en reposo.
  let muestraZapato, instanteToque;
  function zapatoToca(t) {
    if (!muestraZapato) {
      const lienzo = document.createElement("canvas"); lienzo.width=28; lienzo.height=47;
      muestraZapato=lienzo.getContext("2d",{willReadFrequently:true});
    }
    const g=muestraZapato, Q=poses(t).g, {p,M}=Q;
    g.clearRect(0,0,28,47); g.save(); g.translate(14-CANA.x,46-CANA.y);
    g.translate(M.W.x,M.W.y); g.rotate(M.phi); g.translate(-M.Pp.x,-M.Pp.y);
    g.translate(p.x,p.suelo); g.scale(p.espejo?-p.s:p.s,p.s); g.translate(-G.PELVIS.x,-G.SUELO);
    g.imageSmoothingEnabled=true; g.imageSmoothingQuality="high";
    for (const lado of ["lejos","cerca"]) {
      const q=p.piernas[lado]; g.save(); g.translate(q.tob.x,q.tob.y); g.rotate(q.ang);
      Recortes.pieza(g,G.A,lado==="lejos"?"zapato_lejos":"zapato",G.A.datos.piezas.zapato.pivote); g.restore();
    }
    g.restore();
    const pix=g.getImageData(0,0,28,47).data;
    for (let y=0;y<46;y++) for (let x=0;x<28;x++) {
      if (Math.abs(x+.5-14)<=13-3*(y+.5)/46 && pix[4*(y*28+x)+3]>=128) return true;
    }
    return false;
  }
  function primerToqueCana() {
    if (instanteToque!==undefined) return instanteToque;
    let a=T.gVuelca;
    for (let b=a+1/120;b<=T.gBarra+1/120;b+=1/120) {
      if (zapatoToca(b)) {
        let hi=b;
        for (let j=0;j<9;j++) { const m=(a+hi)/2; if (zapatoToca(m)) hi=m; else a=m; }
        instanteToque=hi; return hi;
      }
      a=b;
    }
    return T.gBarra;
  }
  function cerveza(t) {
    const u=clamp((t-primerToqueCana())/.36);
    const a=ANG_LADO*suave(u), n=P(Math.sin(a),Math.cos(a));
    const labio=INTERIOR[1], vertido=labio.x*n.x+labio.y*n.y;
    const cabe=areaVaso(recortaVaso(INTERIOR,n,vertido));
    const volumen=u===1?0:Math.min(LLENO,cabe);
    let bajo=-52, alto=18;
    if (volumen >= LLENO-.001) {
      for (let i=0;i<15;i++) { const mid=(bajo+alto)/2;
        if (areaVaso(recortaVaso(INTERIOR,n,mid))>volumen) bajo=mid; else alto=mid; }
    } else bajo=alto=vertido;
    const nivel=(bajo+alto)/2, liquido=volumen>.001?recortaVaso(INTERIOR,n,nivel):[];
    return { a,n,volumen,nivel,liquido,labio:puntoVaso(VASO[1],a) };
  }
  function rutaVaso(g,pol) {
    g.beginPath(); g.moveTo(pol[0].x,pol[0].y);
    for (let i=1;i<pol.length;i++) g.lineTo(pol[i].x,pol[i].y); g.closePath();
  }
  // El chorro sigue a la boca durante el vuelco y tarda en alcanzar el tablero.
  function tramoChorro(t,edad) {
    const b=cerveza(t-edad), siguiente=cerveza(t-edad+.002);
    if (siguiente.volumen>=b.volumen-.0005) return null;
    const u=clamp(edad/.09); return P(b.labio.x+8*u,lerp(b.labio.y,CANA.y,u*u));
  }
  function cana(g,t) {
    const b=cerveza(t), tk=primerToqueCana();
    const llega=cerveza(t-.09), der=clamp(1-llega.volumen/LLENO);
    g.save();
    if (der>.0001) {
      const w=Math.sqrt(der),cx=lerp(llega.labio.x+8,CANA.x+52,der),cy=lerp(CANA.y,YC-6,der);
      g.fillStyle="rgba(236,170,40,.85)"; g.beginPath(); g.ellipse(cx,cy,43*w,8*w,0,0,TAU); g.fill();
      if (der>.20) { g.fillStyle="rgba(255,240,200,.65)"; g.beginPath(); g.ellipse(cx+3,cy-1,15*w,1.8*w,0,0,TAU); g.fill(); }
      if (cy+8*w>=YC) for (const [dx,d0,l] of [[0,0,60],[12,.15,38],[-8,.3,80]]) {
        const inicio=tk+.42+d0, u=tramo(t,inicio,inicio+.8);
        if (u<=0) continue;
        const x=cx+dx, L=l*u; g.strokeStyle="rgba(236,170,40,.82)"; g.lineWidth=4*u; g.lineCap="round";
        g.beginPath(); g.moveTo(x,YC); g.lineTo(x,YC+L); g.stroke();
        for (let i=0;i<2;i++) {
          const f=(t-inicio-.86-i*.35)/.4;
          if (f<0||f>1) continue;
          g.fillStyle="rgba(236,170,40,.85)"; g.beginPath(); g.ellipse(x,YC+l+f*f*(BARRA_BASE-YC-l-3),2.2,3,0,0,TAU); g.fill();
        }
      }
    }
    if (t>=tk&&t<=tk+.46) {
      let previo=null; g.strokeStyle="#e9a52c"; g.lineWidth=3; g.lineCap="round"; g.beginPath();
      for (let i=0;i<=16;i++) { const q=tramoChorro(t,i*.09/16);
        if (q) { if (previo) g.lineTo(q.x,q.y); else g.moveTo(q.x,q.y); } previo=q; } g.stroke();
    }
    g.translate(CANA.x+10,CANA.y); g.rotate(b.a); g.translate(-10,0);
    rutaVaso(g,VASO); g.fillStyle="rgba(220,240,255,.35)"; g.fill();
    if (b.liquido.length>2) {
      rutaVaso(g,b.liquido); g.fillStyle="#f2a72a"; g.fill();
      g.save(); g.clip();
      const f=recortaVaso(INTERIOR,P(-b.n.x,-b.n.y),-b.nivel-3.5);
      if (f.length>2) { rutaVaso(g,f); g.fillStyle="#fff6e0"; g.fill(); } g.restore();
    }
    g.fillStyle="rgba(255,255,255,.55)"; g.fillRect(-8,-40,2.5,28);
    rutaVaso(g,VASO); g.strokeStyle=TINTA; g.lineWidth=2.2; g.stroke(); g.restore();
  }

  /* ---------- efectos ---------- */
  function estrellaPuntas(g, x, y, r, n, rot0, ri) {
    g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot0 + i * Math.PI / n, rr = i % 2 ? r * ri : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function nube(g, x, y, r, a) {
    if (a <= 0.01 || r <= 0.5) return;
    g.save(); g.globalAlpha = a; g.fillStyle = "#e6d5bc"; g.strokeStyle = "rgba(110,80,50,0.5)"; g.lineWidth = 1.5;
    g.beginPath(); for (let i = 0; i < 5; i++) { const an = i * TAU / 5; g.moveTo(x + Math.cos(an) * r * 0.5 + r * 0.6, y + Math.sin(an) * r * 0.4); g.arc(x + Math.cos(an) * r * 0.5, y + Math.sin(an) * r * 0.4, r * 0.6, 0, TAU); }
    g.fill(); g.stroke(); g.restore();
  }
  function polvo(g, t, t0, x, y, dir, n = 5, esc = 1) {
    const u = fase(t, t0, t0 + 0.7); if (u <= 0 || u >= 1) return;
    for (let i = 0; i < n; i++) {
      const h = hash(i + t0 * 37), d = (16 + 50 * h) * salida(u) * esc, r = (6 + 8 * hash(i + 9 + t0 * 11)) * (0.5 + u) * esc;
      nube(g, x + dir * d * (0.4 + h) + (i % 2 ? -1 : 1) * d * 0.4, y - 3 - 14 * u * hash(i + 3), r, 0.75 * (1 - u) * (1 - u));
    }
  }
  function impacto(g, t, t0, x, y, r0 = 40) {
    const k = fase(t, t0, t0 + 0.26); if (k <= 0 || k >= 1) return;
    const r = r0 * salida(k);
    g.save(); g.globalAlpha = 1 - k;
    estrellaPuntas(g, x, y, r, 8, 0.3, 0.55); g.fillStyle = "#fff6c8"; g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    g.restore();
  }
  // arco de velocidad detrás de las piernas en la patada
  function zas(g, Q, t, t0, t1) {
    const k = campana(t, t0, t1); if (k <= 0.02) return;
    const { p, M, R } = Q;
    const pie = hojaAMundo(R, p, M, p.piernas.cerca.tob), cad = hojaAMundo(R, p, M, R.tronco(p)(R.CADERA.cerca));
    const r = len(sub(pie, cad)), a1 = Math.atan2(pie.y - cad.y, pie.x - cad.x);
    const dir = (R === G ? -1 : 1);
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.7 * k})`; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const rr = r * (0.75 + 0.14 * i); g.beginPath(); g.arc(cad.x, cad.y, rr, a1 + dir * 0.15, a1 + dir * (0.15 + 0.7), dir < 0); g.stroke(); }
    g.restore();
  }
  // rayitas de tembleque alrededor de los pies (boca abajo)
  function tembleque(g, Q, t, k) {
    if (k <= 0.02) return;
    const { p, M, R } = Q;
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.lineCap = "round"; g.globalAlpha = k;
    for (const lado of ["cerca", "lejos"]) {
      const pie = hojaAMundo(R, p, M, p.piernas[lado].tob);
      for (let i = -1; i <= 1; i += 2) {
        const w = Math.sin(t * 30 + i) * 3;
        g.beginPath(); g.moveTo(pie.x + i * 22, pie.y - 10 + w); g.quadraticCurveTo(pie.x + i * 30, pie.y + 2, pie.x + i * 22, pie.y + 14 - w); g.stroke();
      }
    }
    g.restore();
  }
  function estrellitas(g, t, c, k, tam = 1) {
    if (k <= 0.01) return;
    const pts = [];
    for (let i = 0; i < 5; i++) { const a = t * 4.2 + i * TAU / 5; pts.push({ a, x: c.x + Math.cos(a) * 44 * tam, y: c.y + Math.sin(a) * 11 * tam, z: Math.sin(a) }); }
    pts.sort((u, v) => u.z - v.z);
    g.save();
    for (const q of pts) { const r = (7 + 3 * q.z) * k * tam; estrellaPuntas(g, q.x, q.y, r, 5, t * 3 + q.a, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke(); }
    g.restore();
  }
  // lágrimas de risa
  function lagrimas(g, t, c, k, dir) {
    if (k <= 0.02) return;
    g.save(); g.fillStyle = "#bfe8ff"; g.strokeStyle = "#1d3b52"; g.lineWidth = 2; g.globalAlpha = k;
    for (let i = 0; i < 2; i++) {
      const ph = ((t * 1.8 + i * 0.5) % 1), x = c.x + dir * (16 + 40 * ph) * (i ? 1 : -1), y = c.y - 10 * ph + 60 * ph * ph;
      g.beginPath(); g.ellipse(x, y, 4, 6, 0, 0, TAU); g.fill(); g.stroke();
    }
    g.restore();
  }
  function sombra(g, x, y, a, rx) {
    g.save(); g.fillStyle = `rgba(25,8,4,${a})`; g.beginPath(); g.ellipse(x, y + 2, rx, 8, 0, 0, TAU); g.fill(); g.restore();
  }
  function lampara(g, x, t) {
    const sw = 0.015 * Math.sin(t * 1.3 + x);
    g.save(); g.translate(x, -40); g.rotate(sw);
    g.strokeStyle = "#1a1210"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 120); g.stroke();
    g.fillStyle = "#2d5a3a"; g.beginPath(); g.moveTo(-34, 150); g.quadraticCurveTo(-30, 118, 0, 116); g.quadraticCurveTo(30, 118, 34, 150); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.stroke();
    g.fillStyle = "#fff1b8"; g.beginPath(); g.ellipse(0, 150, 18, 6, 0, 0, TAU); g.fill();
    g.restore();
  }
  function reloj(g, t) {
    g.save(); g.translate(RELOJ.x, RELOJ.y); g.strokeStyle = TINTA; g.lineCap = "round";
    const am = 2.1 + t * 0.02, aM = -0.5 + t * 0.25;
    g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(am - Math.PI / 2) * 15, Math.sin(am - Math.PI / 2) * 15); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(aM - Math.PI / 2) * 23, Math.sin(aM - Math.PI / 2) * 23); g.stroke();
    g.fillStyle = "#c0392b"; g.beginPath(); g.arc(0, 0, 3.5, 0, TAU); g.fill();
    g.restore();
  }

  class ElPino extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !RO.listo()) return;
      if (!fondo) fondo = creaFondo();
      const V = poses(t), QR = V.r, QG = V.g;
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      // cámara: se acerca un poco al final
      const cerca = tramo(t, T.rAnda2, T.rInc1 + 0.4);
      const ck = 1 + 0.08 * cerca, cx = 512 + 120 * cerca, cy = 300 + 30 * cerca;
      let tb = 0;
      for (const [t0, a] of [[T.gBarra, 4], [T.g1Pies, 2]]) if (t >= t0) tb += a * Math.exp(-(t - t0) * 8) * suave(fase(t, t0, t0 + 0.03));
      g.save();
      g.translate(W / 2, H / 2); g.scale(ck, ck); g.translate(-cx, -cy);
      if (tb > 0.05) g.translate(ruido(t * 40) * tb, ruido(t * 40 + 13) * tb * 0.6);
      g.drawImage(fondo, FX, FY);
      reloj(g, t);
      for (const lx of LAMPARAS) lampara(g, lx, t);
      cana(g, t);
      // sombras
      const somb = (Q, fl, rx) => { const x = Q.M.W.x; sombra(g, x, fl, 0.28, rx); };
      somb(QR, FL.r, QR.o.estado === "pie" ? 46 : 58);
      somb(QG, FL.g, QG.o.estado === "pie" ? 46 : 62);
      // Rodri (al fondo) y Guillermo (delante)
      dibuja(g, QR, t);
      zas(g, QR, t, T.rPlant, T.rKick1 + 0.05);
      zas(g, QR, t, T.rBaja0, T.rBaja1);
      dibuja(g, QG, t);
      if (QG.o.th > 1.4) caraEncima(g, QG, t);
      zas(g, QG, t, T.g1Plant, T.g1Top);
      zas(g, QG, t, T.g2Plant, T.g2Top + 0.05);
      tembleque(g, QG, t, dentro(t, T.g2Top, T.g2Top + 0.15, T.gVuelca - 0.1, T.gVuelca) + 0.7 * dentro(t, T.g1Top, T.g1Top + 0.05, T.g1Cae0, T.g1Cae0 + 0.05));
      // efectos
      polvo(g, t, T.rPlant - 0.02, R_REP.Hf.x, FL.r, 1, 4, 0.7);
      polvo(g, t, T.rBaja1 - 0.03, R_ATERRIZA.lejos, FL.r, -1, 4, 0.8);
      polvo(g, t, T.g1Pies - 0.02, G_ATERRIZA.cerca, FL.g, 1, 5, 0.9);
      polvo(g, t, T.g2Plant - 0.02, G_REP.Hf.x, FL.g, -1, 4, 0.7);
      for (const paso of pasosManos()) polvo(g, t, paso.t, paso.x, FL.g, 1, 2, 0.45);
      impacto(g, t, T.gBarra, XC + 70, YC - 22, 42);
      polvo(g, t, T.gBarra, XC + 90, YC - 6, 1, 4, 0.6);
      polvo(g, t, (T.rPolvo0 + T.rPolvo1) / 2, QR.M.W.x + 40, QR.M.W.y - 40, 1, 3, 0.5);
      // estrellitas del golpe y lágrimas de risa
      const cg = caraMundo(QG, "g");
      const coronilla = hojaAMundo(G, QG.p, QG.M, G.cabeza(QG.p).a(P(800, 300)));   // boca abajo, las estrellitas giran bajo la coronilla
      estrellitas(g, t, coronilla, dentro(t, T.gBarra + 0.05, T.gBarra + 0.2, T.gPat0 + 0.4, T.gPat0 + 0.8), 0.9);
      const cr = caraMundo(QR, "r");
      lagrimas(g, t, cr, dentro(t, T.rRie0 + 0.2, T.rRie0 + 0.4, T.rRie1 - 0.2, T.rRie1), 1);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00115.2", nombre: "Guillermo y Rodri · El pino (revisión 2)", crear: () => new ElPino() });

  // diagnóstico: cuánto se estira cada brazo y pierna (antes de limitarlo)
  function diag(t) {
    const V = poses(t), out = {};
    for (const [n, Q] of [["r", V.r], ["g", V.g]]) {
      const { p, R } = Q;
      for (const lado of ["cerca", "lejos"]) {
        out[n + "_mano_" + lado] = +alcance(R, p, lado, lado === "cerca" ? p.manoCerca : p.manoLejos).f.toFixed(3);
        const hip = R.tronco(p)(R.CADERA[lado]), L = R.A.datos.piezas["pierna_" + lado].largo;
        out[n + "_pie_" + lado] = +(len(sub(p.piernas[lado].tob, hip)) / L).toFixed(3);
      }
    }
    return out;
  }
  window.__A2D_00115_2 = { pose: t => { const V = poses(t); return { g: V.g.p, r: V.r.p }; }, T, DUR, diag, poses, hojaAMundo, caraMundo, yemaApoyo, pasosManos, FL, G_MANOS, manoPaseo, rot, dibuja, primerToqueCana, zapatoToca, cerveza, puntoVaso, VASO, CANA, LLENO, tramoChorro, cana };
})();
