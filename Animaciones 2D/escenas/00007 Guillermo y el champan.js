"use strict";
/* 00007 · Guillermo y el champán
 *
 * Negro → fiesta: banderines, guirnalda de bombillas, globos y una torre de copas. Guillermo lleva
 * una botella de champán colgando de la mano → la levanta y la enseña a cámara con un guiño → la
 * agita como un loco (todo él vibra) → la apunta lejos, la agarra del cuello y empuja el corcho
 * con el pulgar: primero aguantando el aire (mofletes) y luego apretando los dientes, cada vez más
 * rojo y sudando; el corcho tiembla pero no sale → se rinde, mira la botella extrañado y se asoma
 * al cuello con un ojo cerrado → se encoge de hombros, la vuelve a apuntar y mira a cámara chulito;
 * un toquecito de nada y ¡pum!: el corcho sale disparado, un chorro enorme de espuma y el retroceso
 * lo arrastra hacia atrás, lo levanta del suelo y sale volando como un cohete por arriba a la
 * izquierda (de la sorpresa a la alegría), dejando una estela de espuma y confeti → la espuma cae
 * en llovizna → al rato el corcho vuelve a caer, bota en el suelo, rueda y se para → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, entrada, salida, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo;
  const S = 0.31, SUELO = 548, XG = 420;
  const DUR = 13.0;
  const T = {
    mira0: 0.45, alza0: 0.75, alza1: 1.35, guino: 1.15,
    agita0: 1.65, agita1: 3.3,
    apunta0: 3.35, apunta1: 3.9,
    empuja1: 3.98, suelta1: 4.7, empuja2: 4.92, suelta2: 5.62,
    mira1: 6.05, mira2: 6.5, asoma1: 7.2, vuelve1: 7.62,
    toque: 7.8, pop: 7.92, vuela: 8.22, alegria: 8.7, fuera: 9.85,
    corcho: 10.35, fin: 12.0
  };

  /* ---------- pasos (x de pantalla de cada tobillo) ---------- */
  const PASOS = {
    cerca: [[-10, -9, XG - 19], [T.apunta0 + 0.04, T.apunta0 + 0.3, XG - 54], [T.mira1 - 0.05, T.mira1 + 0.2, XG - 30], [T.asoma1 + 0.05, T.asoma1 + 0.3, XG - 54]],
    lejos: [[-10, -9, XG + 18], [T.apunta0 + 0.12, T.apunta0 + 0.38, XG + 46], [T.mira1 + 0.04, T.mira1 + 0.29, XG + 34], [T.asoma1 + 0.13, T.asoma1 + 0.38, XG + 46]]
  };
  const TOB_Y = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  function pie(lado, t) {
    const L = PASOS[lado]; let i = 0; while (i + 1 < L.length && t >= L[i + 1][0]) i++;
    const [t0, t1, x] = L[i], xa = i > 0 ? L[i - 1][2] : x, u = fase(t, t0, t1);
    const arco = Math.sin(Math.PI * u);
    return { x: lerp(xa, x, suave5(u)), y: TOB_Y[lado] - 40 * arco, ang: -0.2 * arco };
  }

  /* ---------- posturas del cuerpo (se mezclan) ---------- */
  // Botella (bx, by respecto al hombro lejano; ba = ángulo, 0 = cuello arriba). La mano lejana la coge
  // por el cuerpo (gl 0) o por el cuello con el pulgar en el corcho (gl 1, lpu). La mano cercana va
  // en el bolsillo (cp 0), libre (cx, cy respecto a su hombro) o sujetando el culo de la botella (gc 1).
  const P0 = { dx: 0, pel: 0, torso: 0, cab: 0, cx: 40, cy: 255, ca: 0, cp: 0, gc: 0, bx: 4, by: 268, ba: 0, gl: 0, lpu: 0 };
  const C_ = o => Object.assign({}, P0, o);
  const CUERPOS = {
    lleva: C_({}),
    muestra: C_({ torso: -0.03, cab: -0.04, bx: 170, by: -30, ba: -0.2 }),
    agita: C_({ pel: 14, bx: 160, by: 50, ba: 0.06 }),
    apunta: C_({ pel: 24, torso: -0.05, bx: 14, by: 150, ba: 1.2, cp: 1, gc: 1, gl: 1, lpu: 1 }),
    empuja: C_({ pel: 40, torso: -0.12, cab: -0.06, bx: 2, by: 150, ba: 1.14, cp: 1, gc: 1, gl: 1, lpu: 1 }),
    duda: C_({ pel: 16, torso: -0.01, cab: 0.06, bx: 18, by: 156, ba: 1.26, cp: 1, gc: 1, gl: 1, lpu: 0.3 }),
    asoma: C_({ pel: 12, torso: 0.1, cab: 0.17, bx: 254, by: 10, ba: -0.84, cp: 1, cx: 36, cy: 252, ca: 0.5, gc: 0, gl: 0, lpu: 0 }),
    chulo: C_({ pel: 18, torso: -0.03, cab: -0.05, bx: 14, by: 150, ba: 1.2, cp: 1, gc: 1, gl: 1, lpu: 1 }),
    retro: C_({ pel: 44, torso: -0.24, cab: -0.16, bx: 40, by: 120, ba: 1.75, cp: 1, cx: -20, cy: -60, ca: -0.6, gc: 0, gl: 1, lpu: 0 }),
    vuela: C_({ pel: 0, torso: -0.1, cab: -0.06, bx: 120, by: 64, ba: 2.45, cp: 1, cx: -24, cy: -262, ca: -0.4, gc: 0, gl: 1, lpu: 0 })
  };
  const GUION_CUERPO = [
    [T.alza0, T.alza1, "muestra"], [T.agita0 - 0.12, T.agita0 + 0.12, "agita"], [T.agita1 - 0.05, T.apunta1, "apunta"],
    [T.empuja1 - 0.06, T.empuja1 + 0.16, "empuja"], [T.suelta1, T.suelta1 + 0.16, "apunta"], [T.empuja2 - 0.06, T.empuja2 + 0.16, "empuja"],
    [T.suelta2, T.suelta2 + 0.3, "duda"], [T.mira1, T.mira2, "asoma"], [T.asoma1, T.vuelve1, "chulo"],
    [T.pop, T.pop + 0.14, "retro"], [T.vuela - 0.06, T.vuela + 0.5, "vuela"]
  ];
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function postura(t) {
    let c = CUERPOS.lleva;
    for (const [t0, t1, nom] of GUION_CUERPO) { if (t <= t0) break; c = mezclaE(c, CUERPOS[nom], (nom === "retro" ? salida : suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, mof: 0 };
  const E = o => Object.assign({}, BASE, o);
  const CARAS = {
    inicio: E({}),
    guino: E({ mx: -0.85, my: -0.2, sd: 16, gd: 0.14, si: 8, gi: 0.04, orig: 0, sonr: 0.75, abre: 5, ancho: 0.95 }),
    agita: E({ mx: 0.3, my: -0.2, c: 0.78, h: 1, sd: 20, gd: 0.18, si: 20, gi: 0.18, orig: 0, abre: 32, ancho: 1.15, sonr: 1, lengua: 0.45 }),
    apunta: E({ mx: 0.9, my: 0.3, sd: 2, gd: -0.05, si: 2, gi: -0.05, orig: 0, sonr: 0.2, ancho: 0.9 }),
    empuja1: E({ mx: 0.9, my: 0.2, c: 0.92, z: 1, sd: -10, gd: -0.25, si: -10, gi: -0.25, orig: 0, ancho: 0.62, sonr: -0.35, mof: 1 }),
    respira: E({ mx: 0.9, my: 0.25, c: 0.18, sd: 8, gd: 0.05, si: 8, gi: 0.05, orig: 0, abre: 26, ancho: 0.85, sonr: -0.2, lengua: 0.2 }),
    empuja2: E({ mx: 0.9, my: 0.2, c: 0.88, z: 1, sd: -13, gd: -0.3, si: -13, gi: -0.3, orig: 0, abre: 16, ancho: 1.25, sonr: -0.7, lengua: 0 }),
    duda: E({ mx: 0.9, my: 0.35, sd: 20, gd: 0.22, si: -8, gi: -0.16, orig: 0, abre: 5, ancho: 0.55, sonr: -0.25 }),
    asoma: E({ mx: 0.55, my: 0.8, cd: 1, iris: 1.22, sd: -8, gd: -0.15, si: 22, gi: 0.14, orig: 0, abre: 7, ancho: 0.45, sonr: 0 }),
    chulo: E({ mx: -0.85, my: -0.1, c: 0.32, sd: 14, gd: 0.14, si: 3, gi: 0, orig: 0, sonr: 0.62, ancho: 0.95 }),
    pop: E({ mx: 0.9, my: 0, iris: 0.62, sd: 32, gd: 0.1, si: 32, gi: 0.1, orig: 0, abre: 48, ancho: 0.6, sonr: -0.1, lengua: 0.25 }),
    alegria: E({ mx: -0.3, my: -0.3, c: 0.72, h: 1, sd: 24, gd: 0.2, si: 24, gi: 0.2, orig: 0, abre: 46, ancho: 1.2, sonr: 1, lengua: 0.6 })
  };
  const GUION_CARA = [
    [T.mira0, T.mira0 + 0.35, "guino"], [T.agita0 - 0.05, T.agita0 + 0.2, "agita"], [T.apunta0, T.apunta0 + 0.3, "apunta"],
    [T.empuja1, T.empuja1 + 0.14, "empuja1"], [T.suelta1, T.suelta1 + 0.14, "respira"], [T.empuja2, T.empuja2 + 0.14, "empuja2"],
    [T.suelta2, T.suelta2 + 0.18, "respira"], [T.suelta2 + 0.3, T.suelta2 + 0.6, "duda"], [T.mira2 - 0.1, T.mira2 + 0.25, "asoma"],
    [T.asoma1, T.asoma1 + 0.3, "duda"], [T.asoma1 + 0.3, T.vuelve1 + 0.05, "chulo"], [T.pop, T.pop + 0.05, "pop"], [T.alegria, T.alegria + 0.35, "alegria"]
  ];
  function expresion(t) {
    let e = CARAS.inicio;
    for (const [t0, t1, nom] of GUION_CARA) { if (t <= t0) break; e = mezclaE(e, CARAS[nom], suave(fase(t, t0, t1))); }
    return Object.assign({}, e);
  }
  function parpadeos(t) {
    let o = 0;
    for (const tb of [3.7, 5.95, 7.48]) { const k = fase(t, tb, tb + 0.14); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); }
    return o;
  }
  // rojo del esfuerzo: sube mientras empuja y baja al soltar
  function esfuerzo(t, a, b, alto) { return alto * suave(fase(t, a, b)) * (1 - suave(fase(t, b, b + 0.7))); }

  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLSILLO_C = punoDesde({ x: 131, y: 652 }, 0, -1.75);
  const difAng = (a, b) => { let d = b - a; d -= Math.round(d / (2 * Math.PI)) * 2 * Math.PI; return d; };
  // dirección de la muñeca: hacia el hombro (en el sistema de la mano) más un sesgo por el codo
  function muHacia(m, h, ang, sesgo) { const v = G.rotP({ x: h.x - m.x, y: h.y - m.y }, -ang); return Math.atan2(v.y, v.x) + sesgo; }

  /* ---------- botella (unidades de la mano: origen en el puño, cuello hacia -y) ---------- */
  const B_FONDO = 38, B_R = 15.5, B_HOMBRO = -20, B_CUELLO = -47, B_R_CUELLO = 6.4, B_BOCA = -73;
  const BK = 1.3;                                  // la botella, algo más grande que en la vida real (caricatura)
  const AGARRE = 56 * BK, AGARRE_C = 14;           // puño lejano en el cuello / puño cercano en el culo (unidades de la mano)
  const BOCA = -B_BOCA * BK;                       // del centro de la botella a la boca
  const presion = t => tramo(t, T.agita0 + 0.2, T.agita1) * (1 - tramo(t, T.pop, T.pop + 0.5));
  // hinchazón de la botella al empujar (dibujos animados: la presión la deforma)
  const hincha = t => presion(t) * (0.012 + 0.035 * (campana(t, T.empuja1, T.suelta1 + 0.1) + campana(t, T.empuja2, T.suelta2 + 0.1)) * (0.6 + 0.4 * Math.sin(t * 15)));
  const nivel = t => lerp(0.5, 0.08, salida(fase(t, T.pop, T.fuera)));
  function siluetaBotella(g, k) {
    const r = B_R * k, rc = B_R_CUELLO;
    g.beginPath();
    g.moveTo(-r + 3, B_FONDO); g.quadraticCurveTo(-r, B_FONDO, -r, B_FONDO - 4); g.lineTo(-r, B_HOMBRO);
    g.bezierCurveTo(-r, B_HOMBRO - 14, -rc, B_CUELLO + 8, -rc, B_CUELLO); g.lineTo(-rc, B_BOCA + 4);
    g.lineTo(-rc - 1.4, B_BOCA + 2.5); g.lineTo(-rc - 1.4, B_BOCA); g.lineTo(rc + 1.4, B_BOCA); g.lineTo(rc + 1.4, B_BOCA + 2.5); g.lineTo(rc, B_BOCA + 4);
    g.lineTo(rc, B_CUELLO); g.bezierCurveTo(rc, B_CUELLO + 8, r, B_HOMBRO - 14, r, B_HOMBRO); g.lineTo(r, B_FONDO - 4);
    g.quadraticCurveTo(r, B_FONDO, r - 3, B_FONDO); g.closePath();
  }
  function corchoForma(g, ink = 1) {      // origen en la boca de la botella; sale hacia -y
    g.lineJoin = "round"; g.lineCap = "round";
    g.beginPath(); g.moveTo(-5.6, 0); g.lineTo(-5.6, -6); g.quadraticCurveTo(-9.5, -7, -9.5, -11); g.quadraticCurveTo(-9, -19.5, 0, -19.5);
    g.quadraticCurveTo(9, -19.5, 9.5, -11); g.quadraticCurveTo(9.5, -7, 5.6, -6); g.lineTo(5.6, 0); g.closePath();
    g.fillStyle = "#dcb27a"; g.fill();
    g.save(); g.clip(); g.fillStyle = "#b98a52"; g.fillRect(2.5, -21, 8, 22); g.fillStyle = "rgba(255,240,210,0.7)"; g.fillRect(-7, -17, 3, 9); g.restore();
    g.lineWidth = 1.6 * ink; g.strokeStyle = "#0b0a0e"; g.stroke();
    // chapa y bozal de alambre
    g.fillStyle = "#e3b836"; g.beginPath(); g.ellipse(0, -19.5, 6.5, 2.2, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.1 * ink; g.stroke();
    g.strokeStyle = "#8d9096"; g.lineWidth = 1.1;
    g.beginPath(); g.moveTo(-5, -19); g.lineTo(-8.2, -8); g.lineTo(-6.8, 2); g.moveTo(5, -19); g.lineTo(8.2, -8); g.lineTo(6.8, 2); g.moveTo(0, -19.5); g.lineTo(0, -9); g.stroke();
    g.beginPath(); g.moveTo(-8.6, -8); g.lineTo(8.6, -8); g.stroke();
  }
  function botella(g, t, angM) {        // angM: ángulo de la botella en pantalla (el líquido queda horizontal)
    const k = 1 + hincha(t), pr = presion(t);
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // líneas de movimiento al agitar
    const ag = tramo(t, T.agita0, T.agita0 + 0.15) * (1 - tramo(t, T.agita1 - 0.2, T.agita1));
    if (ag > 0.02) {
      g.strokeStyle = `rgba(255,255,255,${0.75 * ag})`; g.lineWidth = 2.2;
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
        const y = -40 + i * 22 + 6 * Math.sin(t * 40 + i), x = s * (B_R + 7 + i % 2 * 3);
        g.beginPath(); g.moveTo(x, y - 9); g.quadraticCurveTo(x + s * 4, y, x, y + 9); g.stroke();
      }
    }
    siluetaBotella(g, k); g.fillStyle = "#0d4a2a"; g.fill();
    g.save(); siluetaBotella(g, k); g.clip();
    // champán visto a través del vidrio verde: la superficie queda horizontal (y se menea al agitar)
    const agL = tramo(t, T.agita0, T.agita0 + 0.15) * (1 - tramo(t, T.agita1 - 0.2, T.agita1 + 0.3));
    const aS = angM + 0.35 * agL * Math.sin((t - T.agita0) * 2 * Math.PI * 6.2 - 1.2);
    const n = { x: Math.sin(aS), y: Math.cos(aS) };                 // gravedad en el sistema de la botella
    const ARR = B_BOCA + 4, ABA = B_FONDO - 4, LARGO = ABA - ARR, v = nivel(t);
    const P = { x: 0, y: lerp(ARR + v * LARGO, ABA - v * LARGO, (n.y + 1) / 2) };
    const espumado = tramo(t, T.pop, T.pop + 0.3);
    g.save(); g.translate(P.x, P.y); g.rotate(-aS);
    g.fillStyle = espumado > 0 ? `rgba(${Math.round(lerp(61, 214, espumado))},${Math.round(lerp(127, 232, espumado))},${Math.round(lerp(47, 190, espumado))},1)` : "#3d7f2f";
    g.fillRect(-140, 0, 280, 200);
    if (pr > 0.02) {           // espuma que sube al agitar
      const ye = -15 * pr;
      g.fillStyle = "rgba(226,240,196,0.82)";
      g.beginPath(); g.moveTo(-140, 1); g.lineTo(-140, ye);
      for (let i = 0; i <= 14; i++) { const x = -32 + i * 4.6, r = (2.4 + 2 * hash(i + 11)) * (0.4 + 0.6 * pr) * (1 + 0.2 * Math.sin(t * 11 + i)); g.lineTo(x, ye - r); }
      g.lineTo(140, ye); g.lineTo(140, 1); g.closePath(); g.fill();
    }
    g.restore();
    g.fillStyle = "rgba(220,240,120,0.55)";
    const nb = 6 + Math.round(10 * pr);
    for (let i = 0; i < nb; i++) {
      const ph = (t * (0.7 + hash(i) * 0.9) * (1 + 2.5 * pr) + hash(i + 7)) % 1;
      const by = lerp(ABA, ARR, ph), bx = (hash(i + 3) - 0.5) * B_R * 1.5 * k;
      if ((bx - P.x) * n.x + (by - P.y) * n.y > 2) { g.beginPath(); g.arc(bx, by, 0.9 + hash(i + 5) * 1.3, 0, Math.PI * 2); g.fill(); }
    }
    // volumen del vidrio: sombra a la derecha, brillo a la izquierda
    g.fillStyle = "rgba(0,20,8,0.45)"; g.fillRect(B_R * k * 0.35, -80, 30, 130);
    g.fillStyle = "rgba(190,255,200,0.35)"; g.fillRect(-B_R * k + 3, -24, 4, 58);
    g.fillStyle = "rgba(255,255,255,0.85)"; g.beginPath(); g.ellipse(-B_R * k + 5.5, -10, 1.6, 9, 0, 0, Math.PI * 2); g.fill();
    // etiqueta (sin letras): crema con una corona dorada y una banda roja
    g.fillStyle = "#f3e7c4"; g.fillRect(-B_R * k, 14, 2 * B_R * k, 18);
    g.fillStyle = "#b8202f"; g.fillRect(-B_R * k, 27, 2 * B_R * k, 3.5);
    g.fillStyle = "#d9a520"; g.beginPath(); g.moveTo(-6, 24); g.lineTo(-6, 18); g.lineTo(-3, 21); g.lineTo(0, 16.5); g.lineTo(3, 21); g.lineTo(6, 18); g.lineTo(6, 24); g.closePath(); g.fill();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 0.9; g.beginPath(); g.moveTo(-B_R * k, 14); g.lineTo(B_R * k, 14); g.moveTo(-B_R * k, 32); g.lineTo(B_R * k, 32); g.stroke();
    // papel dorado del cuello
    g.fillStyle = "#e9bc35"; g.beginPath(); g.moveTo(-B_R * k, B_HOMBRO - 12);
    for (let i = 0; i <= 8; i++) { const x = -B_R * k + i * (2 * B_R * k) / 8; g.lineTo(x, B_HOMBRO - 15 + (i % 2) * 4); }
    g.lineTo(B_R * k, -100); g.lineTo(-B_R * k, -100); g.closePath(); g.fill();
    g.fillStyle = "#b8860b"; g.fillRect(2, -100, 12, 80);
    g.fillStyle = "rgba(255,250,200,0.8)"; g.fillRect(-B_R_CUELLO + 1.2, B_CUELLO - 2, 2, 24);
    g.strokeStyle = "rgba(120,80,0,0.7)"; g.lineWidth = 0.9;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-5, B_CUELLO + 4 + i * 6); g.lineTo(4, B_CUELLO + 2 + i * 6); g.stroke(); }
    g.restore();
    siluetaBotella(g, k); g.lineWidth = 2.2; g.strokeStyle = "#0b0a0e"; g.stroke();
    g.lineWidth = 1; g.beginPath(); g.moveTo(-B_R * k * 0.98, B_HOMBRO - 14); for (let i = 1; i <= 8; i++) g.lineTo(-B_R * k + i * (2 * B_R * k) / 8, B_HOMBRO - 15 + (i % 2) * 4); g.stroke();
    // corcho puesto (tiembla con la presión)
    if (t < T.pop) {
      const emp = campana(t, T.empuja1, T.suelta1) + campana(t, T.empuja2, T.suelta2) + campana(t, T.toque, T.pop + 0.1);
      const tb = pr * (0.25 + 1.4 * emp);
      g.save(); g.translate(ruido(t * 50) * 0.7 * tb, B_BOCA - (0.6 + 0.6 * ruido(t * 37 + 4)) * tb); g.rotate(ruido(t * 41 + 2) * 0.05 * tb);
      corchoForma(g); g.restore();
    }
    g.restore();
  }

  /* ---------- vuelo (retroceso y cohete): transformación de pantalla alrededor de la pelvis ---------- */
  function vuelo(t) {
    if (t < T.pop) return { dx: 0, dy: 0, phi: 0 };
    const sac = salida(fase(t, T.pop, T.pop + 0.14));
    const arr = suave(fase(t, T.pop + 0.05, T.vuela + 0.3));
    const cohete = entrada(fase(t, T.vuela + 0.28, T.fuera));
    const sube = salida(fase(t, T.vuela, T.vuela + 0.35));
    const dx = -38 * sac - 74 * arr - 440 * cohete;
    const dy = -78 * sube - 840 * cohete + 4 * Math.sin((t - T.vuela) * 11) * campana(t, T.vuela + 0.1, T.vuela + 0.6);
    const phi = -0.16 * arr - 0.34 * cohete + 0.06 * Math.sin((t - T.vuela) * 9) * campana(t, T.vuela, T.vuela + 0.7);
    return { dx, dy, phi };
  }
  function enVuelo(p, v, q) {     // punto de pantalla del cuerpo → pantalla tras el vuelo
    const o = pivote(p), c = Math.cos(v.phi), s = Math.sin(v.phi), x = q.x - o.x, y = q.y - o.y;
    return { x: o.x + x * c - y * s + v.dx, y: o.y + x * s + y * c + v.dy };
  }
  const pivote = p => G.aPantalla(p, p.pelvis);

  function poseBase(t) {
    const b = postura(t);
    const respira = Math.sin(t * 2.3);
    // agitar: la mano sube y baja muy rápido y todo el cuerpo vibra
    const ag = tramo(t, T.agita0, T.agita0 + 0.2) * (1 - tramo(t, T.agita1 - 0.25, T.agita1));
    const fa = (t - T.agita0) * 2 * Math.PI * 6.2;
    // temblor del esfuerzo
    const tem = campana(t, T.empuja1, T.suelta1 + 0.05) + campana(t, T.empuja2, T.suelta2 + 0.05);
    const p = {
      x: XG + b.dx, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x + 4 * ag * Math.sin(fa * 0.5 + 0.4) + 2.5 * tem * ruido(t * 28), y: G.PELVIS.y + b.pel + respira * 1.2 + 7 * ag * Math.sin(fa + 1.1) },
      torso: b.torso + 0.025 * ag * Math.sin(fa + 0.3), torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.012 * ag * Math.sin(fa + 2) },
      piernas: {}, cabeza: { ang: b.cab + 0.05 * ag * Math.sin(fa + 1.7) + 0.02 * tem * ruido(t * 31 + 3), dx: 0, dy: 3 * ag * Math.sin(fa + 2.4), esc: { x: 1, y: 1 } }, cara: null
    };
    for (const lado of ["cerca", "lejos"]) { const f = pie(lado, t); p.piernas[lado] = { tob: { x: G.PELVIS.x + (f.x - p.x) / S, y: f.y }, ang: f.ang }; }
    // en el aire: las piernas cuelgan y pedalean
    const cuelga = suave(fase(t, T.vuela - 0.04, T.vuela + 0.4));
    if (cuelga > 0) {
      for (const [lado, x0, ph] of [["cerca", 0, 0], ["lejos", 72, 1.9]]) {
        const q = p.piernas[lado], w = (t - T.vuela) * 8;
        const d = { x: p.pelvis.x + x0 + 46 * Math.sin(w + ph), y: p.pelvis.y + 468 + 26 * Math.cos(w + ph) };
        q.tob = mezcla(q.tob, d, cuelga); q.ang = lerp(q.ang, 0.5 + 0.3 * Math.sin(w + ph + 0.8), cuelga);
      }
    }
    // al salir el corcho: el retroceso dobla las rodillas
    p.pelvis.y += 26 * campana(t, T.pop, T.pop + 0.35);
    // cara
    const e = expresion(t), pb = parpadeos(t);
    const guino = campana(t, T.guino - 0.08, T.guino + 0.32);
    const cd = clamp(Math.max(e.c, pb) + e.cd + guino), ci = clamp(Math.max(e.c, pb) + e.ci);
    p.cara = { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: 0, ojos: { d: cd, i: ci, feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd - 6 * guino, giro: e.gd }, i: { sube: e.si + 6 * guino, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr + 0.2 * guino, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
    p.rojo = clamp(esfuerzo(t, T.empuja1, T.suelta1, 0.55) + esfuerzo(t, T.empuja2, T.suelta2, 0.95));
    p.cara.rubor = Math.max(p.rojo, 0.6 * tramo(t, T.alegria, T.alegria + 0.4));
    p.sudor = tramo(t, T.empuja1 + 0.25, T.empuja1 + 0.7) * (1 - tramo(t, T.mira1, T.mira2 + 0.3));
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    // botella: agitar (sube y baja muy rápido), temblor del esfuerzo, tirones del chorro
    let o = { x: hl.x + b.bx, y: hl.y + b.by }, ba = b.ba;
    o.y += 58 * Math.sin(fa) * ag; o.x += 9 * Math.sin(fa + 1.3) * ag; ba += 0.17 * Math.sin(fa - 0.7) * ag;
    o.x += 3 * tem * ruido(t * 33); o.y += 3 * tem * ruido(t * 29 + 5); ba += 0.02 * tem * ruido(t * 35 + 1);
    const chorro = tramo(t, T.pop, T.pop + 0.1) * (1 - tramo(t, T.fuera, T.fuera + 0.3));
    ba += 0.06 * chorro * ruido(t * 22 + 8); o.y += 6 * chorro * ruido(t * 24 + 3);
    const eje = { x: Math.sin(ba), y: -Math.cos(ba) };              // hacia el cuello
    // mano lejana: en el cuerpo de la botella o en el cuello (el toquecito final la sube un poco)
    const toque = campana(t, T.toque, T.pop + 0.06);
    const sube = (AGARRE * b.gl + 5 * toque) * G.JK;
    const l = { x: o.x + eje.x * sube, y: o.y + eje.y * sube };
    // mano cercana: bolsillo → libre → culo de la botella
    const culo = { x: o.x - eje.x * AGARRE_C * G.JK, y: o.y - eje.y * AGARRE_C * G.JK };
    const rodeo = tramo(t, T.vuela + 0.1, T.vuela + 0.5), wr = (t - T.vuela) * 9;     // en el aire saluda como en un rodeo
    const libre = { x: hc.x + b.cx + 46 * Math.cos(wr) * rodeo, y: hc.y + b.cy + 22 * Math.sin(wr) * rodeo };
    const fuera = clamp(b.cp);
    let c = mezcla(BOLSILLO_C, libre, suave(fuera));
    c = mezcla(c, culo, b.gc);
    const ca = lerp(b.ca, ba, b.gc);
    const muL = muHacia(l, hl, ba, -0.35), angM = ba + vuelo(t).phi;
    const muCl = muHacia(c, hc, ca, 0.35), muC = -1.75 + difAng(-1.75, muCl) * suave(fuera);
    const desplaza = b.gl;
    p.manoLejos = { x: l.x, y: l.y, ang: ba, mu: muL, dobla: -1, puno: 1, pulgar: b.lpu,
      objeto: (g, tt) => { g.save(); g.translate(0, AGARRE * desplaza + 5 * toque); g.scale(BK, BK); botella(g, tt, angM); g.restore(); } };
    p.manoCerca = { x: c.x, y: c.y, ang: ca, mu: muC, dobla: -1, puno: b.cp };
    p.botella = { x: o.x, y: o.y, ang: ba };
    p.ikContinuo = true;
    p.vuelo = vuelo(t);
    return p;
  }
  const pose = t => poseBase(t);

  // boca de la botella y dirección del chorro (pantalla, con el vuelo aplicado)
  function bocaBotella(p) {
    const m = p.botella, d = { x: Math.sin(m.ang), y: -Math.cos(m.ang) };
    const q = G.aPantalla(p, { x: m.x + d.x * BOCA * G.JK, y: m.y + d.y * BOCA * G.JK });
    const v = p.vuelo, c = Math.cos(v.phi), s = Math.sin(v.phi);
    return { ...enVuelo(p, v, q), dx: d.x * c - d.y * s, dy: d.x * s + d.y * c };
  }

  /* ---------- chorro de espuma: partículas deterministas ---------- */
  const TASA = 64, GRAV = 900, ROCE = 1.8;
  let EMISION = null;          // tabla de la boca de la botella durante el chorro (se calcula una vez)
  function preparaEmision() {
    const t0 = T.pop, t1 = T.fuera - 0.15, n = Math.ceil((t1 - t0) * 240), tab = [];
    for (let i = 0; i <= n; i++) tab.push(bocaBotella(pose(t0 + i / 240)));
    EMISION = { t0, t1, tab };
  }
  function bocaEn(te) {
    const u = (te - EMISION.t0) * 240, i = clamp(Math.floor(u), 0, EMISION.tab.length - 2), f = clamp(u - i, 0, 1);
    const a = EMISION.tab[i], b = EMISION.tab[i + 1];
    return { x: lerp(a.x, b.x, f), y: lerp(a.y, b.y, f), dx: lerp(a.dx, b.dx, f), dy: lerp(a.dy, b.dy, f) };
  }
  function particula(i, t) {
    const te = T.pop + (i + 0.35 * hash(i + 70)) / TASA;
    if (te > EMISION.t1 || t < te) return null;
    const a = t - te, o = bocaEn(te);
    const ang = Math.atan2(o.dy, o.dx) + (hash(i + 11) - 0.5) * 0.3, v = 1050 * (0.8 + 0.4 * hash(i + 23)) * fuerzaEn(te);
    const vx = Math.cos(ang) * v, vy = Math.sin(ang) * v, e = 1 - Math.exp(-ROCE * a);
    const x = o.x + vx * e / ROCE, y = o.y + GRAV * a / ROCE + (vy - GRAV / ROCE) * e / ROCE;
    const r = (6.5 + 10 * hash(i + 31)) * (0.6 + 0.9 * salida(fase(a, 0, 0.3))) * lerp(1, 0.3, suave(fase(a, 0.45, 1.3)));
    return { x, y, r, a, te, vx, vy };
  }
  // fuerza del chorro: muy fuerte al principio, se agota al final
  const fuerzaEn = te => (1 + 0.7 * Math.exp(-(te - T.pop) * 4)) * (1 - 0.6 * fase(te, T.fuera - 0.3, EMISION.t1));
  // chorro continuo pegado a la boca: la trayectoria central de lo que acaba de salir
  function nucleo(g, t) {
    const pts = [];
    for (let k = 0; k <= 16; k++) {
      const a = 0.26 * k / 16, te = t - a;
      if (te < T.pop || te > EMISION.t1) continue;
      const o = bocaEn(te), fz = fuerzaEn(te), v = 1050 * fz, e = 1 - Math.exp(-ROCE * a);
      pts.push({ x: o.x + o.dx * v * e / ROCE, y: o.y + GRAV * a / ROCE + (o.dy * v - GRAV / ROCE) * e / ROCE, w: (12 + 30 * a / 0.26) * Math.min(1, fz) });
    }
    if (pts.length < 2) return;
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    for (const [extra, color] of [[7, "#2a2318"], [0, "#fffaea"], [-0.55, "rgba(232,214,150,0.6)"]]) {
      g.strokeStyle = color;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], w = (a.w + b.w) / 2;
        g.lineWidth = extra >= 0 ? w + extra : w * -extra;
        const off = extra < 0 ? w * 0.18 : 0;
        g.beginPath(); g.moveTo(a.x + off, a.y + off); g.lineTo(b.x + off, b.y + off); g.stroke();
      }
    }
    g.restore();
  }
  const nPart = () => Math.ceil((EMISION.t1 - T.pop) * TASA);
  // instante en que una partícula llega al suelo (bisección)
  function aterriza(i) {
    let lo = 0, hi = 4;
    const y = a => { const q = particula(i, T.pop + (i + 0.35 * hash(i + 70)) / TASA + a); return q ? q.y : -1e9; };
    if (y(hi) < SUELO) return null;
    for (let k = 0; k < 22; k++) { const m = (lo + hi) / 2; if (y(m) < SUELO) lo = m; else hi = m; }
    return lo;
  }
  let ATERRIZA = null;
  function espuma(g, t) {
    if (t < T.pop) return;
    if (!ATERRIZA) { ATERRIZA = []; for (let i = 0; i < nPart(); i++) ATERRIZA.push(aterriza(i)); }
    const vivas = [], charcos = [];
    for (let i = 0; i < nPart(); i++) {
      const q = particula(i, t); if (!q) continue;
      const ta = ATERRIZA[i];
      if (ta !== null && q.a >= ta) { const k = fase(q.a, ta, ta + 1.6); if (k < 1) { const s = particula(i, q.te + ta); charcos.push({ x: s.x, r: s.r, k }); } continue; }
      if (q.x < -60 || q.x > W + 60 || q.y < -80) continue;
      const vida = 1 - fase(q.a, 1.5, 2.1); if (vida <= 0) continue;     // las últimas gotitas se deshacen
      q.r *= vida; vivas.push(q);
    }
    g.save(); g.lineJoin = "round";
    // salpicaduras en el suelo
    for (const c of charcos) {
      g.globalAlpha = 0.85 * (1 - c.k); g.fillStyle = "#fff6dc";
      g.beginPath(); g.ellipse(c.x, SUELO + 2, (c.r * 1.6 + 6) * (0.6 + 0.6 * salida(c.k * 3)), 3.2, 0, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
    const camino = (k, dx, dy) => { g.beginPath(); for (const q of vivas) { g.moveTo(q.x + dx + q.r * k, q.y + dy); g.arc(q.x + dx, q.y + dy, q.r * k, 0, Math.PI * 2); } };
    camino(1, 0, 0); g.lineWidth = 4.5; g.strokeStyle = "#2a2318"; g.stroke();
    nucleo(g, t);
    camino(1, 0, 0); g.fillStyle = "#fffaea"; g.fill();
    camino(0.55, 0.3, 0.35); g.fillStyle = "rgba(232,214,150,0.55)";
    g.beginPath(); for (const q of vivas) { g.moveTo(q.x + q.r * 0.25 + q.r * 0.5, q.y + q.r * 0.3); g.arc(q.x + q.r * 0.25, q.y + q.r * 0.3, q.r * 0.5, 0, Math.PI * 2); } g.fill();
    g.fillStyle = "#ffffff";
    g.beginPath(); for (const q of vivas) { if (q.r < 5) continue; g.moveTo(q.x - q.r * 0.3 + q.r * 0.22, q.y - q.r * 0.35); g.arc(q.x - q.r * 0.3, q.y - q.r * 0.35, q.r * 0.22, 0, Math.PI * 2); } g.fill();
    g.restore();
  }

  /* ---------- corcho suelto ---------- */
  function corchoSuelto(g, t, p0) {
    const kS = KC;
    if (t >= T.pop && t < T.pop + 0.4) {     // sale disparado por la derecha
      const a = t - T.pop, v = 2300, x = p0.x + p0.dx * v * a, y = p0.y + p0.dy * v * a + 300 * a * a;
      if (x < W + 60) {
        g.save(); g.strokeStyle = `rgba(255,255,255,${0.7 * clamp((a * v - 50) / 90)})`; g.lineWidth = 3; g.lineCap = "round";
        for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(x - p0.dx * 30 - p0.dy * i * 7, y - p0.dy * 30 + p0.dx * i * 7); g.lineTo(x - p0.dx * (80 + 20 * Math.abs(i)) - p0.dy * i * 7, y - p0.dy * (80 + 20 * Math.abs(i)) + p0.dx * i * 7); g.stroke(); }
        g.translate(x, y); g.rotate(Math.atan2(p0.dy, p0.dx) + Math.PI / 2 + a * 30); g.scale(kS, kS); corchoForma(g, 1 / kS * 0.8); g.restore();
      }
      return;
    }
    const c = corchoCae(t); if (!c) return;
    g.save(); g.translate(c.x, c.y); g.rotate(c.ang); g.scale(KC, KC); g.translate(0, 9.8); corchoForma(g, 0.8 / KC); g.restore();
  }
  const KC = G.JK * S * BK;                // unidades de la botella → pantalla
  // Vuelve a caer desde arriba, bota tres veces, rueda tumbado y se balancea hasta pararse.
  function corchoCae(t) {
    if (t < T.corcho) return null;
    const v0 = t - T.corcho, g0 = 2100, suelo = SUELO - 9.5 * KC + 1, giro = 13, a0 = 0.4;
    let x = 610, y = -40, vx = -95, vy = 160, tt = v0, tl = 0;
    for (let rebote = 0; rebote < 3; rebote++) {
      const tc = (-vy + Math.sqrt(vy * vy + 2 * g0 * (suelo - y))) / g0;
      if (tt < tc) return { x: x + vx * tt, y: y + vy * tt + 0.5 * g0 * tt * tt, ang: a0 + giro * v0 };
      x += vx * tc; y = suelo; vy = -(vy + g0 * tc) * 0.42; vx *= 0.75; tt -= tc; tl += tc;
    }
    // en el suelo: rueda frenando y se balancea tumbado de lado
    const R = 1.1, tr = Math.min(tt, R); x += vx * tr - 0.5 * vx / R * tr * tr;
    const angL = a0 + giro * tl, obj = Math.PI / 2 + Math.round((angL - Math.PI / 2) / Math.PI) * Math.PI;
    return { x, y: suelo, ang: obj + difAng(obj, angL) * Math.exp(-tt * 3.2) * Math.cos(tt * 10) };
  }

  /* ---------- confeti y efectos ---------- */
  const COLORES = ["#ffd23f", "#ff4f8b", "#3ee0d0", "#8f6bff", "#ffffff", "#ff8a2a"];
  function confeti(g, t, origen) {
    g.save();
    // lluvia suave de fiesta todo el rato
    for (let i = 0; i < 14; i++) {
      const per = 4.5 + hash(i + 300) * 3, ph = ((t + hash(i + 301) * per) / per) % 1;
      const x = hash(i + 302) * W + 30 * Math.sin(t * 1.3 + i), y = -20 + ph * (SUELO + 40);
      const r = t * (2 + hash(i + 303) * 3) + i;
      g.save(); g.translate(x, y); g.rotate(r); g.scale(1, Math.abs(Math.cos(r * 1.3)) + 0.15);
      g.fillStyle = COLORES[i % COLORES.length]; g.globalAlpha = 0.85; g.fillRect(-4, -2.5, 8, 5); g.restore();
    }
    // estallido con el corcho
    if (t >= T.pop && origen) {
      const a = t - T.pop;
      for (let i = 0; i < 34; i++) {
        const an = Math.atan2(origen.dy, origen.dx) + (hash(i + 400) - 0.5) * 2.4, v = 520 * (0.4 + hash(i + 401)), k = 2.4;
        const e = 1 - Math.exp(-k * a), x = origen.x + Math.cos(an) * v * e / k + 18 * Math.sin(a * 5 + i);
        const y = origen.y + Math.sin(an) * v * e / k + 120 * a * a * 0.5 + 40 * a;
        if (y > SUELO - 2 || a > 5) continue;
        const r = a * (6 + hash(i + 402) * 6) + i;
        g.save(); g.translate(x, y); g.rotate(r); g.scale(1, Math.abs(Math.cos(r * 1.7)) + 0.1);
        g.fillStyle = COLORES[i % COLORES.length]; g.fillRect(-5, -3, 10, 6); g.restore();
      }
    }
    g.restore();
  }
  function estrellaPuntas(g, x, y, r, puntas, rot, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function estallido(g, t, o) {
    const k = fase(t, T.pop, T.pop + 0.32); if (k <= 0 || k >= 1 || !o) return;
    const x = o.x + o.dx * 26, y = o.y + o.dy * 26, tam = 46;
    g.save(); g.globalAlpha = 1 - k;
    estrellaPuntas(g, x, y, tam * (0.6 + 0.8 * salida(k)), 12, 0.3, 0.42); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 3; g.strokeStyle = "#0b0a0e"; g.stroke();
    estrellaPuntas(g, x, y, tam * (0.35 + 0.5 * salida(k)), 12, 0.55, 0.5); g.fillStyle = "#ffffff"; g.fill();
    g.strokeStyle = "#ffffff"; g.lineWidth = 4; g.lineCap = "round";
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + 0.2, r0 = tam * (0.9 + 0.9 * k), r1 = r0 + tam * 0.5; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // gotas de esfuerzo que saltan de la cabeza al empujar
  function esfuerzoLineas(g, t, p) {
    const k = campana(t, T.empuja2 + 0.15, T.suelta2) ; if (k <= 0.01) return;
    const c = G.aPantalla(p, G.cabeza(p).a({ x: 760, y: 330 }));
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.85 * k})`; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.38, r0 = 70 + 6 * Math.sin(t * 20 + i), r1 = r0 + 16;
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0 * 0.8); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1 * 0.8); g.stroke(); }
    g.restore();
  }

  /* ---------- decorado: fiesta ---------- */
  let fondo = null;
  function cadena(g, x0, y0, x1, y1, caida) {   // catenaria aproximada (parábola)
    return u => ({ x: lerp(x0, x1, u), y: lerp(y0, y1, u) + caida * 4 * u * (1 - u) });
  }
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60);
    // pared ciruela con rayas de papel pintado
    const pared = g.createLinearGradient(0, -60, 0, 470); pared.addColorStop(0, "#220a2b"); pared.addColorStop(1, "#5c1d4f");
    g.fillStyle = pared; g.fillRect(-40, -60, W + 80, 530);
    for (let x = -40; x < W + 40; x += 44) { g.fillStyle = "rgba(255,255,255,0.035)"; g.fillRect(x, -60, 22, 530); }
    g.fillStyle = "rgba(255,210,120,0.08)";
    for (let y = -40; y < 450; y += 30) for (let x = -18 + ((y / 30) % 2) * 22; x < W + 40; x += 44) { g.beginPath(); g.arc(x, y, 1.6, 0, Math.PI * 2); g.fill(); }
    // foco cálido detrás de Guillermo
    const foco = g.createRadialGradient(XG + 40, 300, 20, XG + 40, 300, 470);
    foco.addColorStop(0, "rgba(255,150,190,0.38)"); foco.addColorStop(0.55, "rgba(200,80,150,0.14)"); foco.addColorStop(1, "rgba(120,30,100,0)");
    g.fillStyle = foco; g.fillRect(-40, -60, W + 80, 530);
    // zócalo y friso
    g.fillStyle = "#3a1030"; g.fillRect(-40, 452, W + 80, SUELO - 452);
    g.fillStyle = "#d6a83a"; g.fillRect(-40, 446, W + 80, 7); g.fillStyle = "rgba(255,240,180,0.6)"; g.fillRect(-40, 446, W + 80, 2);
    g.fillStyle = "rgba(0,0,0,0.3)"; g.fillRect(-40, 453, W + 80, 5);
    g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 2;
    for (let x = 20; x < W + 40; x += 120) { g.strokeRect(x, 468, 96, SUELO - 482); }
    // suelo de baldosas en damero con perspectiva
    const fy = [SUELO, SUELO + 9, SUELO + 21, SUELO + 37, SUELO + 58, SUELO + 86, SUELO + 120];
    const fuga = { x: 512, y: 150 };
    const enX = (x, y) => fuga.x + (x - fuga.x) * (y - fuga.y) / (SUELO - fuga.y);
    for (let r = 0; r < fy.length - 1; r++) for (let k = -16; k < 18; k++) {
      const xa = 512 + k * 64, xb = xa + 64, ya = fy[r], yb = fy[r + 1];
      g.fillStyle = (r + k) % 2 ? "#2b1424" : "#e9d6bd";
      g.beginPath(); g.moveTo(enX(xa, ya), ya); g.lineTo(enX(xb, ya), ya); g.lineTo(enX(xb, yb), yb); g.lineTo(enX(xa, yb), yb); g.closePath(); g.fill();
    }
    const brillo = g.createLinearGradient(0, SUELO, 0, H + 60); brillo.addColorStop(0, "rgba(90,20,70,0.15)"); brillo.addColorStop(1, "rgba(20,0,20,0.65)");
    g.fillStyle = brillo; g.fillRect(-40, SUELO, W + 80, H + 60 - SUELO);
    g.fillStyle = "rgba(255,200,230,0.25)"; g.fillRect(-40, SUELO, W + 80, 2);
    // mesa con torre de copas (al fondo, a la izquierda)
    const mx = 128, my = 452;
    g.fillStyle = "#f4eee6"; g.beginPath(); g.moveTo(mx - 80, my - 70); g.lineTo(mx + 80, my - 70); g.lineTo(mx + 92, my + 40); g.lineTo(mx - 92, my + 40); g.closePath(); g.fill();
    g.lineWidth = 3; g.strokeStyle = "#0b0a0e"; g.stroke();
    g.fillStyle = "rgba(170,130,170,0.4)"; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(mx - 70 + i * 28, my - 70); g.quadraticCurveTo(mx - 62 + i * 28, my - 10, mx - 76 + i * 31, my + 40); g.lineTo(mx - 68 + i * 31, my + 40); g.quadraticCurveTo(mx - 54 + i * 28, my - 10, mx - 62 + i * 28, my - 70); g.fill(); }
    const copita = (x, y) => {
      g.fillStyle = "rgba(255,212,90,0.85)"; g.beginPath(); g.moveTo(x - 17, y - 14); g.quadraticCurveTo(x, y + 4, x + 17, y - 14); g.closePath(); g.fill();
      g.fillStyle = "rgba(220,240,255,0.25)"; g.beginPath(); g.moveTo(x - 18, y - 17); g.quadraticCurveTo(x, y + 6, x + 18, y - 17); g.closePath(); g.fill();
      g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 18, y - 17); g.quadraticCurveTo(x, y + 6, x + 18, y - 17); g.closePath(); g.stroke();
      g.beginPath(); g.moveTo(x, y - 4); g.lineTo(x, y + 12); g.moveTo(x - 8, y + 13); g.lineTo(x + 8, y + 13); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.8)"; g.fillRect(x - 12, y - 15, 5, 2);
    };
    for (const [n, y] of [[4, my - 84], [3, my - 112], [2, my - 140], [1, my - 168]]) for (let i = 0; i < n; i++) copita(mx + (i - (n - 1) / 2) * 38, y);
    // globos atados (a la derecha)
    const globos = [[905, 150, "#ffcf3f", 0.1], [968, 190, "#3ad0c4", -0.15], [860, 214, "#ff5a96", 0.2], [940, 262, "#8f6bff", -0.05]];
    for (const [x, y, col] of globos) { g.strokeStyle = "rgba(255,255,255,0.55)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y + 46); g.bezierCurveTo(x + 20, y + 120, x - 30, y + 200, 930, 446); g.stroke(); }
    for (const [x, y, col, a] of globos) {
      g.save(); g.translate(x, y); g.rotate(a);
      g.fillStyle = col; g.beginPath(); g.ellipse(0, 0, 34, 42, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "rgba(0,0,0,0.18)"; g.beginPath(); g.ellipse(9, 8, 24, 32, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = col; g.beginPath(); g.ellipse(-3, -3, 26, 34, 0, 0, Math.PI * 2); g.fill();
      g.lineWidth = 3; g.strokeStyle = "#0b0a0e"; g.beginPath(); g.ellipse(0, 0, 34, 42, 0, 0, Math.PI * 2); g.stroke();
      g.fillStyle = col; g.beginPath(); g.moveTo(-6, 48); g.lineTo(6, 48); g.lineTo(0, 40); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.75)"; g.beginPath(); g.ellipse(-13, -18, 7, 11, 0.5, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    // serpentinas colgando
    for (const [x, col, L] of [[60, "#3ee0d0", 150], [300, "#ffd23f", 110], [690, "#ff4f8b", 135], [800, "#8f6bff", 95], [1000, "#ffd23f", 120]]) {
      g.strokeStyle = "#0b0a0e"; g.lineWidth = 6; g.lineCap = "round";
      const rizo = () => { g.beginPath(); g.moveTo(x, -60); for (let y = -60; y < -60 + L + 60; y += 3) g.lineTo(x + 9 * Math.sin(y * 0.11), y); };
      rizo(); g.stroke(); g.strokeStyle = col; g.lineWidth = 3.5; rizo(); g.stroke();
    }
    // banderines y guirnalda de bombillas
    const banda = (x0, y0, x1, y1, caida, n, fase0) => {
      const f = cadena(g, x0, y0, x1, y1, caida);
      g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.beginPath(); for (let i = 0; i <= 40; i++) { const q = f(i / 40); if (i) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); } g.stroke();
      for (let i = 0; i < n; i++) {
        const a = f((i + 0.15) / n), b = f((i + 0.85) / n), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + 30 };
        g.fillStyle = COLORES[(i + fase0) % 5]; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(m.x, m.y); g.closePath(); g.fill();
        g.lineWidth = 2.2; g.strokeStyle = "#0b0a0e"; g.stroke();
        g.fillStyle = "rgba(255,255,255,0.3)"; g.beginPath(); g.moveTo(a.x + 3, a.y + 2); g.lineTo(a.x + 9, a.y + 2); g.lineTo(m.x - 2, m.y - 9); g.closePath(); g.fill();
      }
    };
    banda(-40, 10, 560, 26, 50, 13, 0);
    banda(470, 30, W + 40, 6, 46, 12, 2);
    const bombillas = cadena(g, -40, 92, W + 40, 80, 60);
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.beginPath(); for (let i = 0; i <= 50; i++) { const q = bombillas(i / 50); if (i) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); } g.stroke();
    for (let i = 1; i < 18; i++) {
      const q = bombillas(i / 18);
      const halo = g.createRadialGradient(q.x, q.y + 9, 2, q.x, q.y + 9, 36); halo.addColorStop(0, "rgba(255,226,150,0.55)"); halo.addColorStop(1, "rgba(255,200,120,0)");
      g.fillStyle = halo; g.beginPath(); g.arc(q.x, q.y + 9, 36, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#ffeab0"; g.beginPath(); g.ellipse(q.x, q.y + 9, 5, 7, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.5; g.stroke();
      g.fillStyle = "#26222a"; g.fillRect(q.x - 3, q.y, 6, 4);
    }
    const v = g.createRadialGradient(512, 300, 300, 512, 300, 690); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.55)");
    g.fillStyle = v; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }

  /* ---------- cámara ---------- */
  let REPOSO = null;            // dónde se queda el corcho
  function camara(t) {
    const cerca = tramo(t, T.apunta0, T.empuja1 + 0.3) * (1 - tramo(t, T.pop - 0.02, T.pop + 0.35));
    if (!REPOSO) REPOSO = corchoCae(DUR);
    // al final, la cámara se acerca al corcho que vuelve a caer
    const fin = tramo(t, T.corcho + 0.3, T.corcho + 1.4, suave);
    const k = (1 + 0.08 * cerca) * (1 + 1.05 * fin);
    const x = 512 + (XG - 512 + 20) * cerca * 0.5, y = 300 + 20 * cerca;
    return { k, x: lerp(x, clamp(REPOSO.x, 300, W - 300), fin), y: lerp(y, SUELO - 50, fin) };
  }

  class GuillermoChampan extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo()) return;
      if (!fondo) fondo = creaFondo();
      if (!EMISION) preparaEmision();
      const p = pose(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = (t >= T.pop ? 8 * Math.exp(-(t - T.pop) * 6) : 0) + 1.2 * (campana(t, T.empuja1, T.suelta1) + campana(t, T.empuja2, T.suelta2));
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -40, -60);
      // sombra en el suelo (se encoge al despegar)
      const v = p.vuelo, alt = clamp(-v.dy / 300);
      if (alt < 0.99) { g.save(); g.fillStyle = `rgba(0,0,0,${0.4 * (1 - alt)})`; g.beginPath(); g.ellipse(p.x + 8 + v.dx, SUELO + 1, 110 * (1 - 0.5 * alt), 9 * (1 - 0.5 * alt), 0, 0, Math.PI * 2); g.fill(); g.restore(); }
      // Guillermo (con el vuelo aplicado)
      if (t < T.fuera + 0.4) {
        g.save();
        const o = pivote(p);
        g.translate(o.x + v.dx, o.y + v.dy); g.rotate(v.phi); g.translate(-o.x, -o.y);
        G.dibujar(g, p, t);
        esfuerzoLineas(g, t, p);
        g.restore();
      }
      espuma(g, t);
      estallido(g, t, t >= T.pop ? bocaBotella(pose(T.pop)) : null);
      corchoSuelto(g, t, bocaBotella(pose(T.pop)));
      confeti(g, t, t >= T.pop ? bocaBotella(pose(T.pop)) : null);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00007", nombre: "Guillermo y el champán", crear: () => new GuillermoChampan() });
  window.__A2D_00007 = { pose, T, DUR, bocaBotella: t => bocaBotella(pose(t)) };
})();
