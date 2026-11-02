"use strict";
/* 00076 · Guillermo y Gabacho · La boina
 *
 * Negro → rincón de Montmartre a la hora dorada: fachada de piedra crema con balcones de hierro y
 * geranios, el café de abajo con su toldo de rayas, una mesita de mármol con su silla de bistró,
 * una farola, la escalinata con barandilla y su farol, un plátano dorado, adoquines y el caballete
 * de Gabacho con un lienzo de manchas (sin textos) y dos palomas picoteando.
 * Gabacho lanza al aire una boina negra, que gira y le cae en los rizos; se la ladea con dos dedos →
 * pose de pintor: brazo estirado, pincel en vertical y pulgar arriba, un ojo cerrado, midiendo a
 * Guillermo (que posa sacando pecho) → se retuerce un bigote imaginario → Guillermo señala la boina y
 * le pone ojitos → Gabacho se pone el pincel entre los dientes, se saca otra boina del bolsillo y la
 * abre de un sacudón; Guillermo hinca una rodilla, como si le fueran a armar caballero, y Gabacho se
 * la pone… pero los pinchos del pelo la atraviesan y se queda en lo alto,
 * pinchada, como un gorrito en un erizo → Guillermo se levanta orgulloso, la nota, echa la cabeza
 * atrás y la baja tirando del borde: la cabeza se le hunde, los pinchos asoman más… la suelta y
 * ¡boing!, vuelve a saltar arriba → segundo intento con todas sus fuerzas (rojo, temblando): ¡BOING!,
 * la boina sale disparada dando vueltas y cae encima de la de Gabacho → dos boinas apiladas: Gabacho
 * posa orgullosísimo retorciéndose el bigote; Guillermo, despeinado, hace pucheros a cámara → negro.
 *
 * Las boinas se dibujan con una transformación afín de pantalla (cabeza → pantalla), dentro de la
 * capa de la cabeza de quien la lleva (capaCabeza) o de la mano que la sujeta (objeto), así quedan
 * siempre debajo de los brazos y encima del pelo. Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, ruido, hash } = M2;
  const G = Guillermo, GB = Gabacho;
  const S = 0.3, SUELO = 560, XG = 360, XD0 = 650, XD1 = 592;
  const DUR = 14.8;
  const T = {
    // Gabacho se pone su boina
    lanzaPrep: 0.55, lanza: 0.85, cae1: 1.5,
    ajusta0: 1.75, ajusta1: 2.02, ajusta2: 2.36, ajusta3: 2.62,
    // pintor
    mide0: 2.7, mide1: 3.0, mide2: 3.88, mide3: 4.2,
    posa0: 2.95, posa1: 3.9,
    bigote0: 3.95, bigote1: 4.25, bigote2: 4.95, bigote3: 5.25,
    // Guillermo quiere una
    senala0: 5.05, senala1: 5.35, ruega0: 5.72, ruega1: 6.02,
    asiente: 6.2,
    // la segunda boina
    pincel0: 6.22, pincel1: 6.5, saca0: 6.62, saca1: 6.84, sale: 7.0, abre: 7.24,
    rodilla0: 6.55, rodilla1: 6.85, baja0: 6.8, baja1: 7.2,
    anda0: 7.25, anda1: 7.95, sube: 7.85, pon0: 8.22, pon1: 8.5, suelta: 8.58, retira: 8.8, vuelve1: 9.45,
    levanta0: 8.95, levanta1: 9.45, orgullo: 9.55,
    // primer intento
    mira: 9.95, agarra0: 10.02, agarra1: 10.25, tira1: 10.45, suelta1: 10.62, boingAlto: 10.84, aterriza1: 11.05,
    // segundo intento
    enfado: 11.12, agarra2: 11.32, agarra3: 11.5, tira3: 11.62, suelta2: 11.96, cae2: 12.76,
    // final
    posaB: 13.0, puchero: 12.95, fin: 13.98
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const D5 = (pu, ix, md, an, me) => ({ pulgar: pu, indice: ix, medio: md, anular: an, menique: me });
  const D = (pu, ix, md, re) => D5(pu, ix, md, re, re);
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const rota = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const TINTA = "#16100c";
  let MATRIZ = null;

  // afines de pantalla: { a, b, c, d, e, f } (como setTransform)
  const AF = (a, b, c, d, e, f) => ({ a, b, c, d, e, f });
  const mul = (A, B) => AF(A.a * B.a + A.c * B.b, A.b * B.a + A.d * B.b, A.a * B.c + A.c * B.d, A.b * B.c + A.d * B.d,
    A.a * B.e + A.c * B.f + A.e, A.b * B.e + A.d * B.f + A.f);
  const apl = (A, q) => ({ x: A.a * q.x + A.c * q.y + A.e, y: A.b * q.x + A.d * q.y + A.f });
  const Tm = (x, y) => AF(1, 0, 0, 1, x, y), Rm = r => AF(Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0), Sm = (x, y) => AF(x, 0, 0, y, 0, 0);
  const lerpAF = (A, B, k) => AF(lerp(A.a, B.a, k), lerp(A.b, B.b, k), lerp(A.c, B.c, k), lerp(A.d, B.d, k), lerp(A.e, B.e, k), lerp(A.f, B.f, k));
  // descompone A = T · R(θ) · S(sx, sy) (sin cizalla; sx < 0 si está reflejada)
  function desc(A) { const sy = Math.hypot(A.c, A.d), th = Math.atan2(-A.c, A.d); return { x: A.e, y: A.f, th, sx: A.a * Math.cos(th) + A.b * Math.sin(th), sy }; }
  // cabeza (retrato) → pantalla, exacta (con espejo y aplastamiento)
  function afCabeza(Rg, p) {
    const H = Rg.cabeza(p), o = Rg.aPantalla(p, H.a({ x: 0, y: 0 })), ex = Rg.aPantalla(p, H.a({ x: 1, y: 0 })), ey = Rg.aPantalla(p, H.a({ x: 0, y: 1 }));
    return AF(ex.x - o.x, ex.y - o.y, ey.x - o.x, ey.y - o.y, o.x, o.y);
  }
  const colocar = (q) => mul(mul(Tm(q.x, q.y), Rm(q.r || 0)), Sm((q.sx ?? 1) * (q.s ?? 1), (q.sy ?? 1) * (q.s ?? 1)));

  // Pistas de una mano: [t0, t1, objetivo, curva]; el objetivo se resuelve en la hoja en cada fotograma.
  function pista(lista, t, resuelve) {
    let c = resuelve(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)), d = resuelve(obj);
      c = { x: lerp(c.x, d.x, k), y: lerp(c.y, d.y, k), mu: lerp(c.mu, d.mu, k), ang: lerp(c.ang, d.ang, k), puno: lerp(c.puno, d.puno, k),
        dedos: DD(c.dedos, d.dedos, k), dobla: k < 0.5 ? c.dobla : d.dobla };
    }
    return c;
  }
  const offMano = (m, q) => { const r = rota(q, m.mu + Math.PI / 2); return rota({ x: r.x * G.JK, y: r.y * G.JK }, m.ang || 0); };
  const PINZA = { x: 6.2, y: 15.5 }, PALMA = { x: 0, y: 1 }, PUNO = { x: 0, y: 0 };
  const ptMano = (Rg, p, m, q) => { const o = offMano(m, q); return Rg.aPantalla(p, { x: m.x + o.x, y: m.y + o.y }); };
  // resolutor común: bolsillo, punto de la hoja (relativo al tronco) o punto de pantalla (con el punto de la mano que lo toca)
  function resolutor(Rg, p, lado) {
    const Tr = Rg.tronco(p);
    return o => {
      if (o.bols) { const m = Rg.manoReposo ? Rg.manoReposo(p, lado) : null;
        const B = m ? m : Tr(lado === "cerca" ? BOLS_G.c : BOLS_G.l);
        return { x: B.x, y: B.y, mu: -1.75, ang: 0, puno: o.sale ? 1 : 0, dedos: o.dedos || D(0.4, 0.4, 0.4, 0.4), dobla: lado === "cerca" ? -1 : 1 }; }
      const m = { mu: o.mu, ang: o.ang || 0 };
      let q;
      if (o.hoja) q = Tr(o.hoja);
      else { const sc = typeof o.scr === "function" ? o.scr() : o.scr, h = Rg.aHoja(p, sc), f = offMano(m, o.ref || PINZA); q = { x: h.x - f.x, y: h.y - f.y }; }
      return { x: q.x, y: q.y, mu: o.mu, ang: m.ang, puno: o.puno ?? 1, dedos: o.dedos, dobla: o.dobla ?? (lado === "cerca" ? -1 : 1) };
    };
  }
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, -1.75), l: punoDesde({ x: 372, y: 648 }, -1.75) };

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, rub: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* ================= boinas ================= */
  const BR = 160;                      // medio ancho de la boina (unidades del retrato)
  const NEGRO_B = "#1c1a21", LUZ_B = "#45424f", SOMBRA_B = "#0c0b10";
  // origen: centro de la cinta (abajo); la copa va hacia −y
  function rutaCopa(g, cae) {
    g.beginPath();
    g.moveTo(-BR * 0.74, -10);
    g.bezierCurveTo(-BR * 1.04, -14 + 10 * cae, -BR * 1.16, -46 + 14 * cae, -BR * 0.98, -76);
    g.bezierCurveTo(-BR * 0.74, -112, -BR * 0.28, -122, BR * 0.06, -119);
    g.bezierCurveTo(BR * 0.56, -116, BR * 1.02, -100, BR * 1.08, -62);
    g.bezierCurveTo(BR * 1.12, -36, BR * 1.0, -18, BR * 0.74, -10);
    g.closePath();
  }
  function dibBoina(g, agujeros, cae = 0) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // sombra bajo el vuelo de la copa
    g.fillStyle = SOMBRA_B; g.beginPath(); g.ellipse(0, -8, BR * 0.8, 15, 0, 0, Math.PI * 2); g.fill();
    rutaCopa(g, cae); g.fillStyle = NEGRO_B; g.fill();
    g.save(); rutaCopa(g, cae); g.clip();
    const luz = g.createRadialGradient(-BR * 0.35, -100, 6, -BR * 0.3, -90, BR * 0.95);
    luz.addColorStop(0, "rgba(120,112,138,0.75)"); luz.addColorStop(0.45, "rgba(70,66,82,0.35)"); luz.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = luz; g.fillRect(-BR * 1.2, -130, BR * 2.4, 130);
    g.fillStyle = "rgba(0,0,0,0.38)"; g.beginPath(); g.ellipse(BR * 0.2, -14, BR * 1.05, 20, 0, 0, Math.PI * 2); g.fill();
    // reflejo de la hora dorada en el canto derecho
    g.strokeStyle = "rgba(255,190,110,0.45)"; g.lineWidth = 7; g.beginPath(); g.moveTo(BR * 0.74, -100); g.quadraticCurveTo(BR * 1.06, -76, BR * 1.02, -40); g.stroke();
    g.restore();
    rutaCopa(g, cae); g.strokeStyle = TINTA; g.lineWidth = 7; g.stroke();
    // cinta (ribete de piel)
    g.fillStyle = "#0a090c"; g.beginPath(); g.moveTo(-BR * 0.74, -12); g.quadraticCurveTo(0, -2, BR * 0.74, -12); g.lineTo(BR * 0.72, 2);
    g.quadraticCurveTo(0, 12, -BR * 0.72, 2); g.closePath(); g.fill(); g.lineWidth = 5; g.stroke();
    g.strokeStyle = "rgba(255,220,170,0.28)"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-BR * 0.6, -3); g.quadraticCurveTo(0, 7, BR * 0.6, -3); g.stroke();
    // rabito de arriba
    g.fillStyle = NEGRO_B; g.strokeStyle = TINTA; g.lineWidth = 5;
    g.beginPath(); g.moveTo(-6, -118); g.quadraticCurveTo(-8, -142, 6, -146); g.quadraticCurveTo(12, -138, 7, -118); g.closePath(); g.fill(); g.stroke();
    // agujeros de los pinchos (se quedan para siempre)
    if (agujeros) for (const h of AGUJEROS) {
      g.fillStyle = "#3a2410"; g.beginPath(); g.ellipse(h.x, h.y, 12, 5, h.r, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "#5a5562"; g.lineWidth = 2.5;
      for (let i = 0; i < 5; i++) { const a = h.r + i * 1.25; g.beginPath(); g.moveTo(h.x + Math.cos(a) * 11, h.y + Math.sin(a) * 4.5); g.lineTo(h.x + Math.cos(a) * 17, h.y + Math.sin(a) * 7); g.stroke(); }
    }
    g.restore();
  }
  // agujeros de la boina de Guillermo (coordenadas locales de la boina, en la copa)
  const AGUJEROS = [{ x: -50, y: -110, r: -0.2 }, { x: 26, y: -117, r: 0.05 }, { x: 98, y: -101, r: 0.3 }];

  // dónde va cada boina en cada cabeza (retrato)
  const EN_GB = t => ({ x: 805, y: 232, s: 1.22, r: lerp(-0.06, -0.3, tramo(t, T.ajusta1, T.ajusta2)) + asentar(t, T.cae1, 0.09) });
  const EN_G = { x: 858, y: 252, r: 0.12, s: 1.08 };
  // pinchos de Guillermo que la atraviesan: punta fija en el retrato, prolongando cada pincho por su agujero
  // (con la boina en reposo asoman un poco; al hundirla asoman mucho más)
  const PUNTAS = [[-0.3, -0.95, 34], [0.28, -0.96, 40], [0.66, -0.75, 32]].map(([dx, dy, L], i) => {
    const h = apl(colocar(EN_G), AGUJEROS[i]); return { x: h.x + dx * L, y: h.y + dy * L }; });
  function asentar(t, t0, a) { if (t < t0) return 0; const u = t - t0; return a * Math.sin(u * 22) * Math.exp(-u * 7); }
  // la de Guillermo: hundida al tirar (a lo largo de los pinchos) y saltos de los «boing»
  function boinaG(t) {
    const k1 = tramo(t, T.agarra1, T.tira1) * (1 - tramo(t, T.suelta1, T.suelta1 + 0.05));
    const k2 = tramo(t, T.agarra3, T.tira3, salida) * (1 - tramo(t, T.suelta2, T.suelta2 + 0.04));
    const hunde = 72 * k1 + 104 * k2;
    let sube = 0, gira = 0, sq = 0;
    if (t > T.suelta1 && t < T.aterriza1 + 0.5) {
      const u = fase(t, T.suelta1, T.aterriza1);
      sube = u < 1 ? 230 * Math.sin(Math.PI * u) * (1 - 0.25 * u) : 0;
      gira = u < 1 ? 0.45 * Math.sin(u * 9) * (1 - u) : 0;
      if (t >= T.aterriza1) { const v = t - T.aterriza1; sq = 0.22 * Math.sin(v * 26) * Math.exp(-v * 8); gira = 0.12 * Math.sin(v * 19) * Math.exp(-v * 7); }
    }
    const dir = { x: -0.42, y: 0.91 };
    return { x: EN_G.x + dir.x * hunde, y: EN_G.y + dir.y * hunde - sube, r: EN_G.r + gira - 0.1 * k2, s: EN_G.s, sx: 1 + sq, sy: 1 - sq };
  }
  // vuelo entre dos afines: posición en parábola, giro en el plano y vueltas «de canto» (aplastando en x)
  function vuelo(A0, A1, u, alto, vueltas, bal = 0) {
    const a = desc(A0), b = desc(A1);
    const x = lerp(a.x, b.x, u), y = lerp(a.y, b.y, u) - alto * 4 * u * (1 - u);
    const s = lerp(Math.abs(a.sy), Math.abs(b.sy), u);
    const f0 = a.sx >= 0 ? 0 : Math.PI, f1 = (b.sx >= 0 ? 0 : Math.PI) + 2 * Math.PI * vueltas;
    const fi = lerp(f0, f1, salida(u) * 0.35 + u * 0.65);
    let th = lerp(a.th, a.th + Math.atan2(Math.sin(b.th - a.th), Math.cos(b.th - a.th)), u) + bal * Math.sin(Math.PI * u);
    return mul(mul(Tm(x, y), Rm(th)), Sm(s * Math.cos(fi), s));
  }

  /* ================= Guillermo ================= */
  const CG = {
    inicio: E({ mx: 0.8, my: 0.2, sonr: 0.25, ancho: 0.85 }),
    ooh: E({ mx: 0.85, my: -0.15, iris: 1.08, sd: 18, si: 16, abre: 14, ancho: 0.5, sonr: 0.1 }),
    posa: E({ mx: 0.6, my: 0.0, c: 0.25, sd: 6, si: 14, gi: 0.08, sonr: 0.7, ancho: 1.0 }),
    asombro: E({ mx: 0.85, my: -0.1, iris: 1.12, sd: 20, si: 20, abre: 20, ancho: 0.55, sonr: 0.2 }),
    senala: E({ mx: 0.9, my: -0.4, iris: 1.1, sd: 18, si: 10, abre: 8, ancho: 0.7, sonr: 0.45 }),
    ojitos: E({ mx: 0.85, my: -0.2, iris: 1.38, sd: 22, gd: 0.22, si: 22, gi: 0.22, abre: 2, ancho: 0.45, sonr: -0.15 }),
    solemne: E({ mx: 0.7, my: 0.6, c: 1, sd: 8, si: 8, sonr: 0.25, ancho: 0.7 }),
    abre: E({ mx: 0.2, my: -0.9, iris: 1.05, sd: 16, si: 18, abre: 4, ancho: 0.55, sonr: 0.3 }),
    chulo: E({ mx: -0.5, my: 0.05, c: 0.2, sd: 10, si: 4, gi: -0.06, sonr: 0.85, ancho: 1.02 }),
    arriba: E({ mx: 0.15, my: -1, iris: 0.95, sd: 18, si: 22, gi: 0.08, abre: 2, ancho: 0.5, sonr: -0.1 }),
    tira: E({ mx: 0.2, my: -0.9, c: 0.35, z: 0.25, sd: -6, gd: -0.14, si: -2, gi: -0.1, abre: 12, ancho: 0.9, sonr: -0.1 }),
    pasmo: E({ mx: 0.1, my: -1, iris: 0.82, sd: 26, si: 26, abre: 10, ancho: 0.5, sonr: -0.2 }),
    rabia: E({ mx: 0.15, my: -0.95, c: 0.15, sd: -14, gd: -0.24, si: -12, gi: -0.22, abre: 0, ancho: 0.62, sonr: -0.35 }),
    fuerza: E({ c: 1, z: 1, sd: -10, gd: -0.2, si: -10, gi: -0.2, abre: 24, ancho: 1.05, sonr: -0.15, mof: 0.4 }),
    sigue: E({ mx: 0.85, my: -0.55, iris: 0.8, sd: 24, si: 24, abre: 18, ancho: 0.55, sonr: -0.3 }),
    puchero: E({ mx: -0.55, my: 0.1, c: 0.25, sd: 14, gd: 0.3, si: 14, gi: 0.3, abre: 2, ancho: 0.5, sonr: -0.7, mof: 0.35 })
  };
  const GUION_CG = [
    [T.lanza + 0.05, T.lanza + 0.25, "ooh"], [T.posa0, T.posa0 + 0.2, "posa"], [T.posa1, T.posa1 + 0.2, "asombro"],
    [T.senala0, T.senala0 + 0.2, "senala"], [T.ruega0, T.ruega0 + 0.25, "ojitos"], [T.baja0 + 0.1, T.baja1, "solemne"],
    [T.suelta + 0.05, T.suelta + 0.3, "abre"], [T.levanta1, T.orgullo + 0.1, "chulo"], [T.mira - 0.05, T.mira + 0.15, "arriba"],
    [T.agarra1, T.agarra1 + 0.12, "tira"], [T.suelta1 + 0.02, T.suelta1 + 0.1, "pasmo"], [T.enfado, T.enfado + 0.15, "rabia"],
    [T.agarra3 - 0.04, T.agarra3 + 0.06, "fuerza"], [T.suelta2 + 0.02, T.suelta2 + 0.1, "sigue"], [T.puchero, T.puchero + 0.25, "puchero"]
  ];
  const PARP_G = [1.25, 2.55, 4.6, 6.4, 9.3, 11.2, 13.4];
  const P0G = { dx: 0, pel: 0, torso: 0, cab: 0, cdy: 0, cesc: 1 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    quieto: CuG({ torso: 0.02, cab: 0.03 }),
    mira: CuG({ torso: 0.0, cab: -0.04 }),
    posa: CuG({ torso: -0.07, cab: -0.12, pel: -4 }),
    senala: CuG({ torso: 0.04, cab: -0.05 }),
    ruega: CuG({ torso: 0.08, cab: 0.14, pel: 4 }),
    rodilla: CuG({ torso: 0.1, cab: 0.24 }),
    orgullo: CuG({ torso: -0.06, cab: -0.08, pel: -3 }),
    arriba: CuG({ torso: -0.04, cab: -0.3, cdy: 22 }),
    tira: CuG({ torso: -0.02, cab: -0.34, cdy: 30, cesc: 0.95 }),
    rabia: CuG({ torso: 0.04, cab: -0.22, cdy: 18 }),
    tira2: CuG({ torso: 0.02, cab: -0.36, cdy: 48, cesc: 0.9, pel: 10 }),
    sigue: CuG({ torso: -0.05, cab: -0.2, cdy: -6, cesc: 1.04 }),
    final: CuG({ torso: 0.04, cab: 0.06, pel: 4 })
  };
  const GUION_G = [
    [T.lanza, T.lanza + 0.3, "mira"], [T.posa0, T.posa0 + 0.25, "posa"], [T.posa1, T.posa1 + 0.25, "quieto"],
    [T.senala0, T.senala1, "senala"], [T.ruega0, T.ruega1, "ruega"], [T.baja0, T.baja1, "rodilla"],
    [T.levanta0 + 0.1, T.levanta1, "orgullo"], [T.mira, T.agarra0 + 0.15, "arriba"], [T.agarra1, T.tira1, "tira"],
    [T.suelta1, T.suelta1 + 0.08, "sigue", salida], [T.suelta1 + 0.15, T.aterriza1, "arriba"], [T.enfado, T.enfado + 0.18, "rabia"],
    [T.agarra3, T.tira3, "tira2", salida], [T.suelta2, T.suelta2 + 0.07, "sigue", salida], [T.suelta2 + 0.25, T.cae2, "mira"],
    [T.puchero - 0.1, T.puchero + 0.3, "final"]
  ];
  const TOB = G.SUELO - G.TOBILLO_ALTO;
  const PIE_G = { cerca: G.PELVIS.x - 30 / S, lejos: G.PELVIS.x + 32 / S };
  // rodilla en tierra: la pierna lejana da un paso adelante; la cercana apoya la rodilla con los dedos del pie doblados
  const RODILLA = { bajaPel: 318, lejos: { x: G.PELVIS.x + 78 + 262, y: TOB }, cerca: { x: G.PELVIS.x - 78 - 240, y: TOB - 46 } };
  function rodillaK(t) {
    const paso = tramo(t, T.rodilla0, T.rodilla1) * (1 - tramo(t, T.levanta1 - 0.12, T.levanta1 + 0.15));
    const baja = tramo(t, T.baja0, T.baja1) * (1 - tramo(t, T.levanta0, T.levanta1 - 0.05));
    return { paso, baja };
  }
  const CLASP_G = { x: 356, y: 478 };
  const PISTA_GL = [
    [0, 0, { bols: true }],
    [T.posa0 - 0.02, T.posa0 + 0.22, { hoja: { x: 392, y: 640 }, mu: -2.6, ang: 0, dedos: D(0.3, 0, 0, 0), dobla: -1 }],
    [T.posa1, T.posa1 + 0.28, { bols: true }],
    [T.senala0, T.senala1, { hoja: { x: 600, y: 300 }, mu: 2.5, dedos: D5(0.2, 1, 0, 0, 0), dobla: -1 }, salida],
    [T.ruega0 - 0.05, T.ruega1, { hoja: { x: CLASP_G.x + 14, y: CLASP_G.y }, mu: 1.75, dedos: D(0.45, 0.35, 0.3, 0.3), dobla: 1 }],
    [T.rodilla0 + 0.05, T.baja1 - 0.1, { hoja: { x: 300, y: 430 }, mu: 2.15, dedos: D(0.9, 1, 1, 1), dobla: -1 }],
    [T.levanta0 + 0.2, T.orgullo, { hoja: { x: 560, y: 330 }, mu: 2.9, dedos: D5(1, 1, 0.95, 0.9, 0.85), dobla: -1 }, salida],
    [T.mira + 0.05, T.agarra1, { hoja: { x: 420, y: 520 }, mu: -2.2, dedos: D(0.6, 1, 1, 1), dobla: -1 }],
    [T.suelta1, T.suelta1 + 0.15, { hoja: { x: 470, y: 470 }, mu: -2.5, dedos: D(1, 1, 1, 1), dobla: -1 }],
    [T.enfado - 0.05, T.agarra3, { hoja: { x: 430, y: 560 }, mu: -1.9, dedos: D(0, 0, 0, 0), dobla: -1 }],
    [T.suelta2 + 0.05, T.suelta2 + 0.25, { hoja: { x: 500, y: 430 }, mu: -2.9, dedos: D(1, 1, 1, 1), dobla: -1 }],
    [T.puchero - 0.15, T.puchero + 0.3, { bols: true }]
  ];
  function poseG(t) {
    const b = linea(GUION_G, CUER_G, "quieto", t);
    const respira = Math.sin(t * 2.1 + 0.4);
    const { paso, baja } = rodillaK(t);
    const tiembla = campana(t, T.tira1 - 0.12, T.suelta1) * 0.5 + campana(t, T.tira3 - 0.05, T.suelta2 + 0.02);
    const p = {
      x: XG + b.dx, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 + RODILLA.bajaPel * baja },
      torso: b.torso + 0.01 * tiembla * ruido(t * 40), torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.012 * tiembla * ruido(t * 47 + 3), dx: 0, dy: b.cdy, esc: { x: 2 - b.cesc, y: b.cesc } },
      tirasLimpias: true, ikContinuo: false
    };
    // asiente ilusionado al ver la boina; tiembla de rabia
    p.cabeza.ang += 0.06 * Math.sin((t - T.senala1) * 13) * campana(t, T.senala1, T.senala1 + 0.45);
    // piernas: de pie o con la rodilla en tierra
    const levanta = campana(t, T.rodilla0, T.rodilla1) * 50 + campana(t, T.levanta1 - 0.12, T.levanta1 + 0.15) * 40;
    const lej = { x: lerp(PIE_G.lejos, RODILLA.lejos.x, paso), y: TOB - levanta };
    const cer = { x: lerp(PIE_G.cerca, RODILLA.cerca.x, baja), y: lerp(TOB, RODILLA.cerca.y, baja) - 26 * Math.sin(Math.PI * baja) };
    p.piernas.lejos = { tob: lej, ang: -0.1 * Math.sin(Math.PI * paso) };
    p.piernas.cerca = { tob: cer, ang: 0.8 * baja };
    // cara
    let e = linea(GUION_CG, CG, "inicio", t);
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.rojo = 0.8 * tramo(t, T.agarra3, T.tira3 + 0.1) * (1 - tramo(t, T.suelta2, T.suelta2 + 0.4)) + 0.25 * campana(t, T.agarra1, T.suelta1 + 0.1);
    p.sudor = 0.7 * campana(t, T.tira3, T.cae2);
    p.enfado = 0.8 * campana(t, T.enfado, T.suelta2);
    // manos
    const res = resolutor(G, p, "cerca"), resL = resolutor(G, p, "lejos");
    // agarre del borde de atrás de la boina (mano cercana)
    const borde = () => apl(boinaMundo(t, p).A, { x: -BR * 0.86, y: -22 });
    const PISTA_GC = [
      [0, 0, { bols: true }],
      [T.ruega0 - 0.05, T.ruega1, { hoja: { x: CLASP_G.x - 16, y: CLASP_G.y + 6 }, mu: 2.2, dedos: D(0.45, 0.35, 0.3, 0.3), dobla: -1 }],
      [T.rodilla0, T.rodilla0 + 0.3, { bols: true }],
      [T.agarra0, T.agarra1, { scr: borde, ref: PINZA, mu: 1.95, dedos: D5(0.75, 0.55, 0.45, 0.4, 0.35), dobla: 1 }],
      [T.suelta1, T.suelta1 + 0.12, { hoja: { x: 120, y: 70 }, mu: 1.6, dedos: D(1, 1, 1, 1), dobla: 1 }, salida],
      [T.suelta1 + 0.3, T.enfado + 0.1, { hoja: { x: 250, y: 420 }, mu: -1.5, dedos: D(0.2, 0.2, 0.2, 0.2), dobla: -1 }],
      [T.agarra2, T.agarra3, { scr: borde, ref: PINZA, mu: 1.95, dedos: D5(0.6, 0.4, 0.35, 0.3, 0.3), dobla: 1 }, entrada],
      [T.suelta2, T.suelta2 + 0.12, { hoja: { x: 116, y: 50 }, mu: 1.6, dedos: D(1, 1, 1, 1), dobla: 1 }, salida],
      [T.suelta2 + 0.3, T.suelta2 + 0.6, { hoja: { x: 250, y: 420 }, mu: -1.5, dedos: D(0.3, 0.3, 0.3, 0.3), dobla: -1 }],
      [T.puchero - 0.2, T.puchero + 0.25, { bols: true }]
    ];
    const C = pista(PISTA_GC, t, res), L = pista(PISTA_GL, t, resL);
    // tiembla al tirar
    if (tiembla > 0) { const k = tiembla * 1.6 / S; C.x += k * ruido(t * 37 + 1); C.y += k * ruido(t * 41 + 7); L.x += k * 0.7 * ruido(t * 33 + 2); }
    // las manos juntas al rogar se frotan
    const fr = campana(t, T.ruega1 - 0.1, T.rodilla0 + 0.1);
    C.y += fr * 6 * Math.sin(t * 24); L.y -= fr * 6 * Math.sin(t * 24);
    p.manoCerca = { x: C.x, y: C.y, ang: C.ang, mu: C.mu, dobla: C.dobla, puno: C.puno, dedos: C.dedos };
    p.manoLejos = { x: L.x, y: L.y, ang: L.ang, mu: L.mu, dobla: L.dobla, puno: L.puno, dedos: L.dedos };
    p.capaCabeza = () => {};
    return p;
  }

  /* ================= Gabacho ================= */
  const CB = {
    inicio: E({ mx: 0.85, my: 0.25, c: 0.3, sd: 8, si: 12, gi: 0.06, sonr: 0.55, ancho: 0.95 }),
    lanza: E({ mx: 0.3, my: -1, sd: 14, si: 16, sonr: 0.6, ancho: 0.95 }),
    satisfecho: E({ c: 1, h: 0.6, sd: 10, si: 18, gi: 0.1, sonr: 0.75, ancho: 1 }),
    mide: E({ mx: 0.95, my: 0.1, ci: 1, sd: -4, gd: -0.1, si: 6, sonr: 0.25, ancho: 0.75 }),
    bigote: E({ mx: -0.3, my: 0.1, c: 0.55, sd: 16, si: 4, gi: -0.05, sonr: 0.8, ancho: 1.05 }),
    curioso: E({ mx: 0.9, my: 0.1, sd: 22, si: 6, gd: 0.06, sonr: 0.4, ancho: 0.85 }),
    risa: E({ mx: 0.9, my: 0.2, c: 0.6, h: 0.6, sd: 12, si: 12, abre: 14, sonr: 0.8, ancho: 1 }),
    ceremonia: E({ mx: 0.95, my: 0.75, c: 0.35, sd: 6, si: 12, sonr: 0.5, ancho: 0.85 }),
    contiene: E({ mx: 0.9, my: -0.2, c: 0.2, sd: 22, si: 10, gi: -0.05, sonr: 0.2, ancho: 0.45, mof: 0.9 }),
    risaB: E({ c: 1, h: 0.85, sd: 16, si: 16, abre: 0, sonr: 0.9, ancho: 1.05, mof: 0.7 }),
    sube: E({ mx: 0.4, my: -1, iris: 0.92, sd: 22, si: 22, abre: 0, ancho: 0.7, sonr: 0.1 }),
    orgullo: E({ c: 1, h: 0.4, sd: 16, si: 20, gi: 0.1, sonr: 0.85, ancho: 1.02 })
  };
  const GUION_CB = [
    [T.lanza - 0.1, T.lanza + 0.1, "lanza"], [T.cae1 + 0.08, T.cae1 + 0.25, "satisfecho"], [T.mide0 + 0.1, T.mide1, "mide"],
    [T.bigote0, T.bigote1, "bigote"], [T.senala0 + 0.2, T.senala1 + 0.1, "curioso"], [T.ruega1 - 0.05, T.asiente, "risa"],
    [T.saca1, T.sale, "curioso"], [T.anda0, T.anda0 + 0.3, "ceremonia"], [T.retira, T.retira + 0.3, "curioso"],
    [T.orgullo, T.orgullo + 0.25, "contiene"], [T.suelta1 + 0.05, T.suelta1 + 0.15, "risaB"], [T.aterriza1 + 0.15, T.enfado + 0.2, "contiene"],
    [T.suelta2 + 0.1, T.suelta2 + 0.3, "sube"], [T.posaB - 0.05, T.posaB + 0.25, "orgullo"]
  ];
  const PARP_B = [0.35, 2.55, 4.6, 5.6, 7.5, 9.9, 12.3];
  const P0B = { pel: 0, torso: 0.02, cab: 0.03, cdy: 0, bdx: 0, bdy: 0 };
  const CuB = o => Object.assign({}, P0B, o);
  const CUER_B = {
    quieto: CuB({}),
    lanza: CuB({ torso: -0.06, cab: -0.2 }),
    ajusta: CuB({ torso: -0.04, cab: -0.26, cdy: 12 }),
    chulo: CuB({ torso: -0.06, cab: -0.1 }),
    mide: CuB({ torso: 0.05, cab: 0.12 }),
    bigote: CuB({ torso: -0.05, cab: -0.08 }),
    rie: CuB({ torso: -0.06, cab: -0.1, pel: -3 }),
    saca: CuB({ torso: 0.06, cab: 0.06 }),
    pone: CuB({ torso: 0.17, cab: 0.2, pel: 8 }),
    sube: CuB({ torso: -0.06, cab: -0.22 }),
    orgullo: CuB({ torso: -0.07, cab: -0.16, pel: -3 })
  };
  const GUION_B = [
    [T.lanzaPrep, T.lanza, "lanza"], [T.cae1 - 0.05, T.cae1 + 0.2, "chulo"], [T.ajusta0, T.ajusta1, "ajusta"], [T.ajusta2, T.ajusta3, "chulo"],
    [T.mide0, T.mide1, "mide"], [T.mide2, T.mide3, "bigote"], [T.bigote3, T.bigote3 + 0.3, "quieto"], [T.ruega1, T.asiente, "rie"],
    [T.saca0, T.sale, "saca"], [T.anda0 + 0.3, T.pon0, "pone"], [T.suelta, T.retira + 0.3, "quieto"],
    [T.suelta2 + 0.08, T.suelta2 + 0.3, "sube"], [T.posaB - 0.05, T.posaB + 0.3, "orgullo"]
  ];
  // Gabacho anda hacia Guillermo y vuelve: pelvis y apoyos (pantalla)
  function xGab(t) { return lerp(lerp(XD0, XD1, tramo(t, T.anda0, T.anda1)), XD0, tramo(t, T.retira, T.vuelve1)); }
  function piesGab(t) {
    const X = XD0, d = XD1 - XD0;
    const paso = (t0, t1, a, b) => { const k = fase(t, t0, t1); return { x: lerp(a, b, suave(k)), y: 34 * Math.sin(Math.PI * k) }; };
    let lej = { x: X - 30, y: 0 }, cer = { x: X + 28, y: 0 };
    if (t > T.anda0) lej = paso(T.anda0, T.anda0 + 0.32, X - 30, X - 30 + d);
    if (t > T.anda0 + 0.32) cer = paso(T.anda0 + 0.32, T.anda1, X + 28, X + 28 + d);
    if (t > T.retira) cer = paso(T.retira, T.retira + 0.32, X + 28 + d, X + 28);
    if (t > T.retira + 0.32) lej = paso(T.retira + 0.32, T.vuelve1, X - 30 + d, X - 30);
    return { lej, cer };
  }
  const PIES_B_TOB = GB.SUELO - GB.TOBILLO_ALTO;
  // el bigote imaginario: comisura de la boca (lado cercano) en el retrato
  const BIGOTE = { x: 714, y: 598 };
  function poseB(t) {
    const b = linea(GUION_B, CUER_B, "quieto", t);
    const respira = Math.sin(t * 1.9 + 1.4);
    const x = xGab(t);
    const andando = campana(t, T.anda0, T.anda1) + campana(t, T.retira, T.vuelve1);
    const p = {
      x, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: GB.PELVIS.x, y: GB.PELVIS.y + b.pel + respira * 1.1 - 6 * Math.abs(Math.sin(t * 9)) * andando },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } }
    };
    // asiente y se ríe
    p.cabeza.ang += 0.07 * Math.sin((t - T.asiente) * 12) * campana(t, T.asiente, T.asiente + 0.5);
    p.cabeza.ang += 0.04 * Math.sin(t * 17) * (campana(t, T.ruega1, T.asiente) + campana(t, T.suelta1 + 0.05, T.aterriza1 + 0.3));
    const pies = piesGab(t);
    const aHojaX = sx => GB.PELVIS.x - (sx - x) / (S * GB.K);
    p.piernas.lejos = { tob: { x: aHojaX(pies.lej.x), y: PIES_B_TOB - pies.lej.y / S }, ang: 0 };
    p.piernas.cerca = { tob: { x: aHojaX(pies.cer.x), y: PIES_B_TOB - pies.cer.y / S }, ang: 0 };
    let e = linea(GUION_CB, CB, "inicio", t);
    p.cara = cara(e, parpadeo(t, PARP_B));
    // manos
    const res = resolutor(GB, p, "cerca"), resL = resolutor(GB, p, "lejos");
    const bordeB = () => apl(boinaMundoB(t, p), { x: -BR * 0.86, y: -20 });
    const bigote = () => GB.aPantalla(p, GB.cabeza(p).a(BIGOTE));
    const PISTA_BC = [
      [0, 0, { hoja: { x: 70, y: 610 }, mu: -1.75, dedos: D5(0.7, 0.55, 0.5, 0.45, 0.4), dobla: -1 }],
      [T.lanzaPrep, T.lanza - 0.08, { hoja: { x: 126, y: 700 }, mu: -1.3, dedos: D5(0.7, 0.55, 0.5, 0.45, 0.4), dobla: -1 }],
      [T.lanza - 0.08, T.lanza + 0.06, { hoja: { x: 170, y: 520 }, mu: 1.9, dedos: D(1, 1, 1, 1), dobla: -1 }, salida],
      [T.lanza + 0.15, T.cae1, { hoja: { x: 130, y: 640 }, mu: -1.7, dedos: D(0.4, 0.5, 0.5, 0.5), dobla: -1 }],
      [T.ajusta0, T.ajusta1, { scr: bordeB, ref: PINZA, mu: 2.0, dedos: D5(0.72, 0.62, 0.3, 0.25, 0.9), dobla: 1 }],
      [T.ajusta2, T.ajusta3, { hoja: { x: 130, y: 640 }, mu: -1.7, dedos: D(0.4, 0.5, 0.5, 0.5), dobla: -1 }],
      [T.bigote0, T.bigote1, { scr: bigote, ref: PINZA, mu: 2.2, dedos: D5(0.75, 0.75, 0.15, 0.1, 0.1), dobla: -1 }],
      [T.bigote2, T.bigote3, { bols: true }],
      [T.suelta1 + 0.02, T.suelta1 + 0.2, { scr: () => GB.aPantalla(p, GB.cabeza(p).a({ x: 820, y: 640 })), ref: PALMA, mu: 0.4, dedos: D(1, 1, 1, 1), dobla: -1 }],
      [T.aterriza1 + 0.15, T.aterriza1 + 0.45, { bols: true }],
      [T.posaB, T.posaB + 0.3, { scr: bigote, ref: PINZA, mu: 2.2, dedos: D5(0.75, 0.75, 0.15, 0.1, 0.1), dobla: -1 }]
    ];
    const PINCEL_H = { hoja: { x: 392, y: 642 }, mu: -1.55, dedos: D5(0.45, 0.3, 0.25, 0.25, 0.25), dobla: 1 };
    const AGARRA = D5(0.72, 0.6, 0.45, 0.4, 0.35);
    const PISTA_BL = [
      [0, 0, PINCEL_H],
      [T.mide0, T.mide1, { hoja: { x: 690, y: 362 }, mu: Math.PI, dedos: D(1, 0, 0, 0), dobla: 1 }, salida],
      [T.mide2, T.mide3, PINCEL_H],
      [T.pincel0, T.pincel1 - 0.06, { scr: () => apl(pincelBoca(p), { x: 0, y: -30 }), ref: PUNO, mu: 2.2, dedos: D5(0.3, 0.3, 0.25, 0.25, 0.25), dobla: 1 }],
      [T.pincel1, T.pincel1 + 0.12, { scr: () => apl(pincelBoca(p), { x: 0, y: -40 }), ref: PUNO, mu: 2.3, dedos: D(1, 1, 1, 1), dobla: 1 }],
      [T.saca0, T.saca1, { bols: true, sale: true, dedos: D(1, 1, 1, 1) }],
      [T.saca1, T.saca1 + 0.04, { bols: true, sale: true, dedos: AGARRA }],
      [T.saca1 + 0.04, T.sale, { hoja: { x: 520, y: 560 }, mu: -1.3, dedos: AGARRA, dobla: 1 }, salida],
      [T.abre, T.sube, { hoja: { x: 560, y: 330 }, mu: 2.3, dedos: AGARRA, dobla: 1 }],
      [T.sube, T.sube + 0.14, { scr: () => agarreBoina2(t, p), ref: PINZA, mu: 2.4, dedos: AGARRA, dobla: 1 }],
      [T.suelta, T.retira, { hoja: { x: 600, y: 300 }, mu: -0.7, dedos: D(1, 1, 1, 1), dobla: 1 }, salida],
      [T.retira + 0.1, T.retira + 0.45, { bols: true }],
      [T.posaB, T.posaB + 0.3, { hoja: { x: 395, y: 640 }, mu: -2.4, dedos: D(0.3, 0, 0, 0), dobla: 1 }]
    ];
    const C = pista(PISTA_BC, t, res), L = pista(PISTA_BL, t, resL);
    // mide: el brazo sube y baja un poco; bigote: la pinza da vueltas
    const md = campana(t, T.mide1, T.mide2);
    L.y += md * 22 * Math.sin((t - T.mide1) * 7.5);
    const vb = (t0, t1) => { const k = campana(t, t0, t1); return { x: k * 14 * Math.cos((t - t0) * 17), y: k * 10 * Math.sin((t - t0) * 17) }; };
    const v1 = vb(T.bigote1, T.bigote2), v2 = vb(T.posaB + 0.3, DUR);
    C.x += v1.x + v2.x; C.y += v1.y + v2.y;
    // sacude la boina para abrirla
    const sac = campana(t, T.sale, T.abre);
    L.y += sac * 16 * Math.sin((t - T.sale) * 40);
    p.manoCerca = { x: C.x, y: C.y, ang: C.ang, mu: C.mu, dobla: C.dobla, puno: C.puno, dedos: C.dedos };
    p.manoLejos = { x: L.x, y: L.y, ang: L.ang, mu: L.mu, dobla: L.dobla, puno: L.puno, dedos: L.dedos };
    return p;
  }
  // el pincel entre los dientes (afín de pantalla; agarre del mango en (0, −30))
  const BOCA_B = { x: 812, y: 634 };
  function pincelBoca(p) {
    const A = afCabeza(GB, p), d = desc(A), c = apl(A, BOCA_B);
    return mul(mul(Tm(c.x, c.y), Rm(d.th - Math.PI / 2 - 0.2)), mul(Sm(0.7, 0.7), Tm(0, -6)));
  }
  // el pincel en la mano lejana: ángulo de pantalla según el momento
  function pincelMano(t, p) {
    const m = p.manoLejos, c = ptMano(GB, p, m, PUNO);
    const th = lerp(lerp(-1.85, 0, tramo(t, T.mide0, T.mide1)), -1.85, tramo(t, T.mide2, T.mide3));
    return mul(mul(Tm(c.x, c.y), Rm(lerp(th, -1.9, tramo(t, T.pincel0, T.pincel1)))), Sm(0.78, 0.78));
  }
  function pincelMundo(t, p) {
    if (t < T.pincel0 + 0.1) return pincelMano(t, p);
    if (t < T.pincel1) return lerpAF(pincelMano(t, p), pincelBoca(p), tramo(t, T.pincel0 + 0.1, T.pincel1));
    return pincelBoca(p);
  }

  /* ---------- dónde está cada boina (afín de pantalla y capa) ---------- */
  // boina de Gabacho (la suya) sobre su cabeza
  function boinaMundoB(t, p) { return mul(afCabeza(GB, p), colocar(EN_GB(t))); }
  function boinaMundo(t, p) { return { A: mul(afCabeza(G, p), colocar(boinaG(t))) }; }
  // la segunda: encima de Guillermo, se acerca desde la mano de Gabacho y baja hasta los pinchos
  function encimaG(t, pG) {
    const k = tramo(t, T.pon0, T.pon1);
    const alto = lerp(-170, 0, k), lado = lerp(70, 0, k);
    const q = boinaG(t);
    return mul(afCabeza(G, pG), colocar({ x: q.x + lado, y: q.y + alto, r: q.r + lerp(0.25, 0, k), s: q.s }));
  }
  function agarreBoina2(t, pB) { return apl(encimaG(t, poseG(t)), { x: BR * 0.9, y: -24 }); }
  const memo = new Map();
  const cache = (k, f) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };

  /* ================= decorado ================= */
  let fondo = null;
  const YB = 470;                          // bordillo
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60); g.lineJoin = "round"; g.lineCap = "round";
    // cielo de la hora dorada
    const cie = g.createLinearGradient(0, -60, 0, 340);
    cie.addColorStop(0, "#e9915a"); cie.addColorStop(0.45, "#f6be7c"); cie.addColorStop(1, "#fde3b0");
    g.fillStyle = cie; g.fillRect(-40, -60, W + 80, 420);
    const sol = g.createRadialGradient(735, 250, 10, 735, 250, 330);
    sol.addColorStop(0, "rgba(255,248,205,0.95)"); sol.addColorStop(0.25, "rgba(255,226,150,0.55)"); sol.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = sol; g.fillRect(300, -60, 800, 500);
    nubes(g);
    tejados(g, 330, "#b98b8f", "#a57a82", 0, 0.9);
    tejados(g, 360, "#8f6673", "#7e5866", 7, 1.15);
    escalinata(g);
    arbol(g, 985, 70);
    fachada(g);
    // acera y bordillo
    g.fillStyle = "#cdb593"; g.fillRect(-40, YB - 26, W + 80, 26);
    g.fillStyle = "rgba(255,230,180,0.35)"; g.fillRect(-40, YB - 26, W + 80, 3);
    g.fillStyle = "#a88f70"; g.fillRect(-40, YB - 2, W + 80, 8); g.fillStyle = TINTA; g.fillRect(-40, YB + 6, W + 80, 2);
    adoquines(g);
    farola(g, 503, YB - 14);
    mesita(g, 120, 548);
    caballete(g, 878, 575);
    // luz cálida rasante y viñeta
    const cal = g.createLinearGradient(1024, 0, 0, 0); cal.addColorStop(0, "rgba(255,190,100,0.16)"); cal.addColorStop(1, "rgba(255,190,100,0)");
    g.fillStyle = cal; g.fillRect(-40, -60, W + 80, H + 120);
    const vi = g.createRadialGradient(560, 300, 280, 512, 300, 720); vi.addColorStop(0, "rgba(0,0,0,0)"); vi.addColorStop(1, "rgba(40,14,8,0.5)");
    g.fillStyle = vi; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }
  function nubes(g) {
    g.save(); g.fillStyle = "rgba(255,236,206,0.7)";
    for (const [x, y, w] of [[410, 40, 120], [640, 82, 90], [890, 26, 140]]) {
      g.beginPath(); g.ellipse(x, y, w, 12, 0, 0, Math.PI * 2); g.ellipse(x - w * 0.3, y - 8, w * 0.4, 12, 0, 0, Math.PI * 2); g.ellipse(x + w * 0.25, y - 6, w * 0.45, 11, 0, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = "rgba(225,140,110,0.35)"; for (const [x, y, w] of [[430, 50, 100], [905, 36, 120]]) { g.beginPath(); g.ellipse(x, y, w, 4, 0, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  function tejados(g, yb, col, col2, sem, esc) {
    g.save();
    let x = -40, i = 0;
    while (x < W + 40) {
      const n = sem * 31 + i, w = (60 + 70 * hash(n + 1)) * esc, h = (60 + 70 * hash(n + 2)) * esc, mans = 18 * esc;
      g.fillStyle = i % 2 ? col : col2;
      g.beginPath(); g.moveTo(x, yb); g.lineTo(x, yb - h); g.lineTo(x + mans, yb - h - mans * 1.4); g.lineTo(x + w - mans, yb - h - mans * 1.4); g.lineTo(x + w, yb - h); g.lineTo(x + w, yb); g.closePath(); g.fill();
      // chimeneas con sus macetas de barro
      const nc = 1 + Math.floor(hash(n + 3) * 2);
      for (let k = 0; k < nc; k++) { const cx = x + mans + (w - 2 * mans) * (0.2 + 0.6 * hash(n + 4 + k)), cy = yb - h - mans * 1.4;
        g.fillRect(cx - 7 * esc, cy - 16 * esc, 14 * esc, 16 * esc); g.fillStyle = "rgba(160,80,60,0.6)";
        for (let j = 0; j < 3; j++) g.fillRect(cx - 6 * esc + j * 4.4 * esc, cy - 22 * esc, 3 * esc, 6 * esc);
        g.fillStyle = i % 2 ? col : col2; }
      // ventanitas encendidas
      g.fillStyle = "rgba(255,214,140,0.55)";
      for (let k = 0; k < 3; k++) if (hash(n + 9 + k) > 0.45) g.fillRect(x + 10 + k * w / 3.2, yb - h + 14 + 8 * hash(n + k), 6 * esc, 9 * esc);
      g.fillStyle = "rgba(255,225,190,0.25)"; g.fillRect(x + w - 4, yb - h, 4, h);
      x += w + 2; i++;
    }
    g.restore();
  }
  function escalinata(g) {
    g.save();
    // muro de piedra a la derecha y escalones que suben hacia el fondo
    const x0 = 640, x1 = W + 40;
    const pie = g.createLinearGradient(0, 230, 0, YB); pie.addColorStop(0, "#c9ae8a"); pie.addColorStop(1, "#b0946e");
    g.fillStyle = pie; g.beginPath(); g.moveTo(x0, YB); g.lineTo(x0 + 70, 238); g.lineTo(x1, 238); g.lineTo(x1, YB); g.closePath(); g.fill();
    const n = 15;
    for (let i = 0; i < n; i++) {
      const k0 = i / n, k1 = (i + 1) / n, y0 = lerp(YB - 26, 238, k0), y1 = lerp(YB - 26, 238, k1);
      const xa = lerp(x0, x0 + 70, k0), xb = lerp(x0, x0 + 70, k1);
      g.fillStyle = i % 2 ? "#d7bf9b" : "#cdb38e"; g.beginPath(); g.moveTo(xa, y0); g.lineTo(xb, y1); g.lineTo(x1, y1); g.lineTo(x1, y0); g.closePath(); g.fill();
      g.fillStyle = "rgba(90,60,40,0.35)"; g.fillRect(xb, y1, x1 - xb, 2.5);
      g.fillStyle = "rgba(255,236,200,0.4)"; g.fillRect(xb, y1 + 2.5, x1 - xb, 1.5);
    }
    g.strokeStyle = "rgba(70,45,30,0.6)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, YB); g.lineTo(x0 + 70, 238); g.stroke();
    // barandilla de hierro por el centro y su farol
    g.strokeStyle = "#1e1714"; g.lineWidth = 4;
    g.beginPath(); g.moveTo(740, 440); g.lineTo(830, 268); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.moveTo(740, 470); g.lineTo(830, 298); g.stroke();
    for (let i = 0; i <= 6; i++) { const k = i / 6, x = lerp(740, 830, k), y = lerp(440, 268, k); g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 32); g.stroke(); }
    g.lineWidth = 5; g.beginPath(); g.moveTo(830, 268); g.lineTo(830, 150); g.stroke();
    farolillo(g, 830, 150, 0.8);
    // muro bajo de la izquierda de la escalinata con su remate
    g.fillStyle = "#bba07c"; g.fillRect(x0 - 20, YB - 110, 34, 84); g.fillStyle = "#d8c3a2"; g.fillRect(x0 - 26, YB - 118, 46, 10);
    g.strokeStyle = "rgba(60,40,26,0.6)"; g.lineWidth = 2; g.strokeRect(x0 - 20, YB - 110, 34, 84);
    g.restore();
  }
  function farolillo(g, x, y, e) {
    g.save(); g.translate(x, y); g.scale(e, e);
    const h = g.createRadialGradient(0, 14, 2, 0, 14, 60); h.addColorStop(0, "rgba(255,236,170,0.75)"); h.addColorStop(1, "rgba(255,220,150,0)");
    g.fillStyle = h; g.beginPath(); g.arc(0, 14, 60, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#1e1714"; g.beginPath(); g.moveTo(-16, -6); g.lineTo(16, -6); g.lineTo(6, -18); g.lineTo(-6, -18); g.closePath(); g.fill();
    g.beginPath(); g.arc(0, -21, 4, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ffe9a8"; g.beginPath(); g.moveTo(-13, -6); g.lineTo(13, -6); g.lineTo(9, 30); g.lineTo(-9, 30); g.closePath(); g.fill();
    g.strokeStyle = "#1e1714"; g.lineWidth = 3; g.stroke(); g.beginPath(); g.moveTo(0, -6); g.lineTo(0, 30); g.stroke();
    g.fillStyle = "#1e1714"; g.fillRect(-11, 30, 22, 5);
    g.restore();
  }
  function arbol(g, x, y) {
    g.save();
    g.strokeStyle = "#6b4a32"; g.lineWidth = 16; g.beginPath(); g.moveTo(x, 260); g.quadraticCurveTo(x - 8, 180, x - 30, y + 40); g.stroke();
    g.lineWidth = 8; g.beginPath(); g.moveTo(x - 12, 170); g.quadraticCurveTo(x - 60, 140, x - 90, y + 50); g.stroke();
    const tonos = ["#d99a3a", "#c47a2a", "#e8b54e", "#b5652b", "#f0c862"];
    for (let i = 0; i < 46; i++) {
      const a = hash(i + 500) * Math.PI * 2, r = 30 + 95 * Math.sqrt(hash(i + 501));
      const cx = x - 40 + Math.cos(a) * r * 1.25, cy = y + Math.sin(a) * r * 0.7;
      g.fillStyle = tonos[i % tonos.length]; g.beginPath(); g.ellipse(cx, cy, 26 + 14 * hash(i + 502), 18 + 10 * hash(i + 503), a, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = "rgba(255,240,190,0.35)";
    for (let i = 0; i < 14; i++) { const cx = x - 120 + 90 * hash(i + 520), cy = y - 40 + 60 * hash(i + 521); g.beginPath(); g.ellipse(cx, cy, 12, 8, 0.4, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  function fachada(g) {
    g.save();
    const x1 = 300;
    const pd = g.createLinearGradient(-40, 0, x1, 0); pd.addColorStop(0, "#e2c99c"); pd.addColorStop(1, "#efdcb6");
    g.fillStyle = pd; g.fillRect(-40, -60, x1 + 40, YB - 20);
    // sillares
    g.strokeStyle = "rgba(150,115,75,0.28)"; g.lineWidth = 1.5;
    for (let y = -40; y < YB - 140; y += 30) { g.beginPath(); g.moveTo(-40, y); g.lineTo(x1, y); g.stroke();
      for (let x = -40 + ((y / 30) % 2 ? 0 : 35); x < x1; x += 70) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 30); g.stroke(); } }
    g.fillStyle = "rgba(255,240,205,0.6)"; g.fillRect(x1 - 6, -60, 6, YB - 20);
    g.fillStyle = "rgba(120,80,50,0.35)"; g.fillRect(x1, -60, 10, YB - 20);
    // cornisa
    g.fillStyle = "#d8bf92"; g.fillRect(-40, 168, x1 + 40, 12); g.fillStyle = "rgba(90,60,30,0.35)"; g.fillRect(-40, 180, x1 + 40, 4);
    // ventanales con balcón y geranios
    for (const [x, y] of [[40, -10], [190, -10], [40, 200], [190, 200]]) ventana(g, x, y, y > 100);
    // toldo de rayas del café
    const yt = 300, xa = -40, xb = 280;
    g.fillStyle = "#3a2a20"; g.fillRect(xa, yt - 8, xb - xa, 8);
    for (let i = 0, x = xa; x < xb; x += 26, i++) {
      g.fillStyle = i % 2 ? "#f4e7cf" : "#c83a3a";
      g.beginPath(); g.moveTo(x, yt); g.lineTo(x + 26, yt); g.lineTo(x + 30, yt + 46); g.lineTo(x + 4, yt + 46); g.closePath(); g.fill();
      g.beginPath(); g.arc(x + 17, yt + 46, 13, 0, Math.PI); g.fill();
    }
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(xa, yt); g.lineTo(xb, yt); g.stroke();
    g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(xa, yt + 58, xb - xa, 10);
    // escaparate del café, cálido por dentro
    const ve = g.createLinearGradient(0, 360, 0, YB - 30); ve.addColorStop(0, "#ffcf7d"); ve.addColorStop(1, "#d98a3c");
    g.fillStyle = "#4a2e1c"; g.fillRect(-20, 352, 260, YB - 30 - 352 + 6);
    g.fillStyle = ve; g.fillRect(-12, 360, 160, YB - 30 - 360 - 2); g.fillRect(166, 360, 66, YB - 30 - 360 - 2);
    g.fillStyle = "rgba(120,60,30,0.55)";
    for (let i = 0; i < 7; i++) { const bx = -2 + i * 20, bh = 20 + 12 * hash(i + 40); g.fillRect(bx, YB - 34 - bh, 9, bh); g.beginPath(); g.arc(bx + 4.5, YB - 34 - bh, 4.5, Math.PI, 0); g.fill(); }
    g.fillStyle = "rgba(255,255,255,0.3)"; g.beginPath(); g.moveTo(10, 362); g.lineTo(40, 362); g.lineTo(0, YB - 34); g.lineTo(-12, YB - 34); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 3; g.strokeRect(-12, 360, 160, YB - 30 - 360 - 2); g.strokeRect(166, 360, 66, YB - 30 - 360 - 2);
    g.restore();
  }
  function ventana(g, x, y, conToldo) {
    const w = 70, h = 112;
    g.fillStyle = "#c7a87a"; g.fillRect(x - 6, y - 6, w + 12, h + 10);
    const vi = g.createLinearGradient(0, y, 0, y + h); vi.addColorStop(0, "#5a6d80"); vi.addColorStop(1, "#33404f");
    g.fillStyle = vi; g.fillRect(x, y, w, h);
    g.fillStyle = "rgba(255,210,150,0.45)"; g.beginPath(); g.moveTo(x + 8, y + 4); g.lineTo(x + 30, y + 4); g.lineTo(x + 8, y + 50); g.closePath(); g.fill();
    g.strokeStyle = "#f0e3c8"; g.lineWidth = 4; g.strokeRect(x, y, w, h); g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + h);
    g.moveTo(x, y + h * 0.35); g.lineTo(x + w, y + h * 0.35); g.stroke();
    // contraventanas
    g.fillStyle = "#6f8fa3"; g.fillRect(x - 26, y - 2, 20, h + 2); g.fillRect(x + w + 6, y - 2, 20, h + 2);
    g.strokeStyle = "rgba(30,40,50,0.5)"; g.lineWidth = 1.5;
    for (let k = 0; k < 9; k++) { g.beginPath(); g.moveTo(x - 24, y + 6 + k * 12); g.lineTo(x - 8, y + 6 + k * 12); g.moveTo(x + w + 8, y + 6 + k * 12); g.lineTo(x + w + 24, y + 6 + k * 12); g.stroke(); }
    // balcón de hierro con geranios
    const yb = y + h - 6;
    g.fillStyle = "#8a4b2a"; g.fillRect(x - 6, yb - 14, w + 12, 14);
    for (let i = 0; i < 9; i++) { const fx = x - 2 + i * 9.5, fy = yb - 18 - 6 * hash(i + y);
      g.fillStyle = "#3e7a35"; g.beginPath(); g.arc(fx, fy + 6, 6, 0, Math.PI * 2); g.fill();
      g.fillStyle = i % 3 ? "#e23b3b" : "#ff6a5a"; g.beginPath(); g.arc(fx + 1, fy, 4.5, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = "#1e1714"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x - 10, yb); g.lineTo(x + w + 10, yb); g.moveTo(x - 10, yb + 22); g.lineTo(x + w + 10, yb + 22); g.stroke();
    g.lineWidth = 1.8;
    for (let i = 0; i < 6; i++) { const cx = x - 4 + i * 15; g.beginPath(); g.moveTo(cx, yb); g.lineTo(cx, yb + 22); g.stroke();
      g.beginPath(); g.arc(cx + 7.5, yb + 11, 5, 0, Math.PI * 2); g.stroke(); }
  }
  function adoquines(g) {
    g.save();
    const y0 = YB + 8, y1 = H + 60;
    const base = g.createLinearGradient(0, y0, 0, y1); base.addColorStop(0, "#8d7660"); base.addColorStop(1, "#6e5947");
    g.fillStyle = base; g.fillRect(-40, y0, W + 80, y1 - y0);
    let y = y0, fila = 0;
    while (y < y1) {
      const k = (y - y0) / (y1 - y0), hy = lerp(7, 22, k), wx = lerp(16, 46, k);
      for (let x = -40 - (fila % 2) * wx * 0.5; x < W + 40; x += wx) {
        const n = fila * 97 + Math.floor(x);
        const tono = 150 + 30 * hash(n), r = tono, gg = tono * 0.86, bb = tono * 0.72;
        g.fillStyle = `rgb(${r | 0},${gg | 0},${bb | 0})`;
        g.beginPath(); g.ellipse(x + wx / 2, y + hy / 2, wx * 0.44, hy * 0.4, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = "rgba(255,230,190,0.25)"; g.beginPath(); g.ellipse(x + wx * 0.42, y + hy * 0.36, wx * 0.25, hy * 0.15, 0, 0, Math.PI * 2); g.fill();
      }
      y += hy; fila++;
    }
    // luz rasante del sol (desde la derecha)
    const lz = g.createLinearGradient(W, 0, 300, 0); lz.addColorStop(0, "rgba(255,200,120,0.22)"); lz.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = lz; g.fillRect(-40, y0, W + 80, y1 - y0);
    g.restore();
  }
  function farola(g, x, yb) {
    g.save();
    g.fillStyle = "#1e1714";
    g.beginPath(); g.moveTo(x - 14, yb); g.lineTo(x + 14, yb); g.lineTo(x + 8, yb - 30); g.lineTo(x - 8, yb - 30); g.closePath(); g.fill();
    g.fillRect(x - 4, yb - 230, 8, 200);
    g.beginPath(); g.ellipse(x, yb - 120, 8, 5, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#1e1714"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(x, yb - 210); g.quadraticCurveTo(x - 18, yb - 220, x - 22, yb - 238); g.moveTo(x, yb - 210); g.quadraticCurveTo(x + 18, yb - 220, x + 22, yb - 238); g.stroke();
    farolillo(g, x, yb - 262, 1);
    g.fillStyle = "rgba(255,230,190,0.3)"; g.fillRect(x + 2, yb - 228, 2, 196);
    g.restore();
  }
  function mesita(g, x, yb) {
    g.save(); g.lineJoin = "round";
    // silla de bistró detrás
    g.strokeStyle = "#3b2a1c"; g.lineWidth = 5;
    g.beginPath(); g.moveTo(x - 62, yb); g.lineTo(x - 58, yb - 64); g.moveTo(x - 20, yb); g.lineTo(x - 24, yb - 64); g.stroke();
    g.fillStyle = "#c79a5a"; g.beginPath(); g.ellipse(x - 41, yb - 66, 30, 8, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.strokeStyle = "#3b2a1c"; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 66, yb - 66); g.quadraticCurveTo(x - 72, yb - 110, x - 56, yb - 132); g.quadraticCurveTo(x - 40, yb - 140, x - 24, yb - 130); g.stroke();
    g.strokeStyle = "#c79a5a"; g.lineWidth = 3; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x - 64 + i * 3, yb - 78 - i * 14); g.lineTo(x - 28 + i, yb - 78 - i * 14); g.stroke(); }
    // mesita de mármol con pie de hierro, una tacita y un vaso
    g.strokeStyle = "#1e1714"; g.lineWidth = 5; g.beginPath(); g.moveTo(x + 10, yb - 92); g.lineTo(x + 10, yb - 4); g.stroke();
    g.beginPath(); g.moveTo(x - 14, yb); g.lineTo(x + 34, yb); g.stroke();
    g.fillStyle = "#f2ece2"; g.beginPath(); g.ellipse(x + 10, yb - 94, 42, 10, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.stroke();
    g.fillStyle = "#e8e0d4"; g.fillRect(x - 32, yb - 94, 84, 5);
    g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(x - 6, yb - 112); g.lineTo(x + 8, yb - 112); g.lineTo(x + 6, yb - 98); g.lineTo(x - 4, yb - 98); g.closePath(); g.fill(); g.lineWidth = 2; g.stroke();
    g.beginPath(); g.arc(x + 10, yb - 106, 4, -1.2, 1.2); g.stroke();
    g.fillStyle = "rgba(230,240,255,0.8)"; g.fillRect(x + 20, yb - 118, 10, 22); g.strokeRect(x + 20, yb - 118, 10, 22);
    g.fillStyle = "#c2405a"; g.fillRect(x + 21, yb - 108, 8, 11);
    g.restore();
  }
  function caballete(g, x, yb) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.fillStyle = "rgba(40,20,10,0.3)"; g.beginPath(); g.ellipse(x - 30, yb + 4, 70, 8, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#7a4e2a"; g.lineWidth = 7;
    g.beginPath(); g.moveTo(x - 46, yb); g.lineTo(x - 6, yb - 280); g.moveTo(x + 40, yb); g.lineTo(x + 2, yb - 280); g.moveTo(x + 14, yb - 4); g.lineTo(x - 2, yb - 240); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 50, yb); g.lineTo(x - 10, yb - 280); g.stroke();
    // bandeja con tubos de pintura y un trapo
    g.fillStyle = "#8a5a32"; g.fillRect(x - 64, yb - 112, 120, 9); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x - 64, yb - 112, 120, 9);
    for (const [dx, c] of [[-50, "#d9443a"], [-34, "#3a72c8"], [-18, "#f2c23a"]]) { g.fillStyle = "#e8e6ea"; g.fillRect(x + dx, yb - 122, 12, 10); g.fillStyle = c; g.fillRect(x + dx + 12, yb - 120, 4, 6); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.strokeRect(x + dx, yb - 122, 12, 10); }
    g.fillStyle = "#e9d8c4"; g.beginPath(); g.moveTo(x + 16, yb - 112); g.quadraticCurveTo(x + 30, yb - 92, x + 26, yb - 76); g.quadraticCurveTo(x + 40, yb - 90, x + 46, yb - 112); g.closePath(); g.fill();
    g.fillStyle = "rgba(60,120,200,0.6)"; g.beginPath(); g.arc(x + 28, yb - 98, 4, 0, Math.PI * 2); g.fill();
    // lienzo (manchas abstractas, sin texto)
    const cx = x - 70, cy = yb - 268, w = 132, h = 150;
    g.save(); g.translate(cx, cy); g.rotate(-0.04);
    g.fillStyle = "#f6efe2"; g.fillRect(0, 0, w, h);
    g.save(); g.beginPath(); g.rect(0, 0, w, h); g.clip();
    const fon = g.createLinearGradient(0, 0, 0, h); fon.addColorStop(0, "#ffd9a0"); fon.addColorStop(1, "#f29e72");
    g.fillStyle = fon; g.fillRect(4, 4, w - 8, h - 8);
    g.fillStyle = "#f26b3a"; g.beginPath(); g.arc(90, 46, 24, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ffe066"; g.beginPath(); g.arc(86, 42, 12, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#3a6fc8"; g.lineWidth = 9; g.beginPath(); g.moveTo(10, 110); g.bezierCurveTo(40, 80, 70, 140, 120, 100); g.stroke();
    g.strokeStyle = "#2f9a6a"; g.lineWidth = 7; g.beginPath(); g.moveTo(14, 70); g.quadraticCurveTo(30, 40, 52, 66); g.stroke();
    g.fillStyle = "#b34aa8"; g.beginPath(); g.ellipse(36, 128, 18, 9, 0.3, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#1d1b22"; g.beginPath(); g.ellipse(60, 30, 16, 6, -0.2, 0, Math.PI * 2); g.fill();
    g.restore();
    g.strokeStyle = "#b08a5e"; g.lineWidth = 4; g.strokeRect(0, 0, w, h); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(-2, -2, w + 4, h + 4);
    g.restore();
    g.fillStyle = "#7a4e2a"; g.fillRect(x - 26, yb - 286, 24, 12);
    g.restore();
  }

  /* ---------- palomas ---------- */
  const PALOMAS = [{ x: 742, y: 578, s: 1.5, f: 0 }, { x: 836, y: 570, s: -1.35, f: 1.7 }];
  function paloma(g, P, t) {
    const pic = Math.max(0, Math.sin(t * 3.2 + P.f)) ** 6;      // picotea
    const susto = campana(t, T.suelta1, T.suelta1 + 0.5) + campana(t, T.suelta2, T.suelta2 + 0.7) * 1.4;
    const salto = 10 * susto;
    g.save(); g.translate(P.x, P.y - salto); g.scale(P.s, Math.abs(P.s));
    g.fillStyle = "rgba(30,15,10,0.3)"; g.beginPath(); g.ellipse(0, salto + 8, 16, 4, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#c2563f"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-3, 2); g.lineTo(-4, 9); g.moveTo(3, 2); g.lineTo(4, 9); g.stroke();
    g.fillStyle = "#8f93a3"; g.beginPath(); g.ellipse(0, -4, 16, 10, -0.15, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#6d7182"; g.beginPath(); g.moveTo(-14, -6); g.quadraticCurveTo(-26, -6 - 10 * susto, -22, 0); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(-2, -6, 10, 6, -0.3 - 0.8 * susto, 0, Math.PI * 2); g.fill();
    const hx = 12 + 4 * pic, hy = -12 + 12 * pic - 4 * susto;
    g.fillStyle = "#6a8a8a"; g.beginPath(); g.ellipse(8, -8 + 4 * pic, 6, 5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#7b7f90"; g.beginPath(); g.arc(hx, hy, 6, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#e8a23a"; g.beginPath(); g.moveTo(hx + 5, hy - 1); g.lineTo(hx + 10, hy + 1); g.lineTo(hx + 5, hy + 2); g.closePath(); g.fill();
    g.fillStyle = "#ff8a3a"; g.beginPath(); g.arc(hx + 2, hy - 1.5, 1.8, 0, Math.PI * 2); g.fill(); g.fillStyle = "#000"; g.beginPath(); g.arc(hx + 2.3, hy - 1.5, 0.9, 0, Math.PI * 2); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.4; g.beginPath(); g.ellipse(0, -4, 16, 10, -0.15, 0, Math.PI * 2); g.stroke();
    g.restore();
  }

  /* ---------- pincel ---------- */
  // en unidades de la mano (como la jarra): agarre en el origen, mango hacia −y y pelo hacia +y
  function pincel(g, ang) {
    g.save(); g.rotate(ang); g.lineCap = "round";
    g.strokeStyle = TINTA; g.lineWidth = 7; g.beginPath(); g.moveTo(0, -44); g.lineTo(0, 22); g.stroke();
    g.strokeStyle = "#c0392b"; g.lineWidth = 4.4; g.beginPath(); g.moveTo(0, -43); g.lineTo(0, 10); g.stroke();
    g.strokeStyle = "#d9d4cc"; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 10); g.lineTo(0, 20); g.stroke();
    g.fillStyle = "#3a6fc8"; g.beginPath(); g.moveTo(-3.5, 20); g.quadraticCurveTo(-3, 32, 0, 36); g.quadraticCurveTo(3, 32, 3.5, 20); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke();
    g.restore();
  }

  /* ================= escena ================= */
  // estado de las dos boinas en t: afín de pantalla, capa y si lleva agujeros/pinchos
  function boinas(t, pG, pB) {
    const out = [];
    // 1 · la de Gabacho: en la mano → vuela → en su cabeza
    {
      const enMano = (tt, pb) => {
        const m = pb.manoCerca, c = ptMano(GB, pb, m, PINZA);
        return mul(mul(Tm(c.x, c.y), Rm(-Math.PI / 2 - 0.25)), mul(Sm(0.17, 0.17), Tm(-BR * 0.88, 12)));
      };
      if (t < T.lanza) out.push({ A: enMano(t, pB), capa: "manoB" });
      else if (t < T.cae1) {
        const A0 = cache("b1a", () => enMano(T.lanza, poseB(T.lanza))), A1 = boinaMundoB(T.cae1, cache("pb1", () => poseB(T.cae1)));
        out.push({ A: vuelo(A0, A1, fase(t, T.lanza, T.cae1), 120, 1, 0.5), capa: "aire" });
      } else out.push({ A: boinaMundoB(t, pB), capa: "B" });
    }
    // 2 · la de Guillermo
    {
      const pliegue = tramo(t, T.sale, T.abre, salida);
      const enManoL = (pb) => { const c = ptMano(GB, pb, pb.manoLejos, PINZA), s = 0.15 * lerp(0.5, 1, pliegue);
        return mul(mul(Tm(c.x, c.y), Rm(lerp(-1.1, 0.12, pliegue))), mul(Sm(s * lerp(0.5, 1, pliegue), s), Tm(-BR * 0.9, 20))); };
      if (t >= T.saca1 && t < T.sube) out.push({ A: enManoL(pB), capa: "manoB" });
      else if (t >= T.sube && t < T.suelta) {
        const A = t < T.sube + 0.14 ? lerpAF(enManoL(pB), encimaG(t, pG), tramo(t, T.sube, T.sube + 0.14)) : encimaG(t, pG);
        out.push({ A, capa: "manoB", pinchos: t >= T.pon0 });
      } else if (t >= T.suelta && t < T.suelta2) out.push({ A: boinaMundo(t, pG).A, capa: "G", pinchos: true, agujeros: true });
      else if (t >= T.suelta2) {
        const A0 = cache("b2a", () => boinaMundo(T.suelta2, poseG(T.suelta2)).A);
        const encimaB = (tt, pb) => mul(boinaMundoB(tt, pb), colocar({ x: 0, y: -108 + 6 * Math.sin(Math.max(0, tt - T.cae2) * 20) * Math.exp(-Math.max(0, tt - T.cae2) * 6), r: 0.28 + asentar(tt, T.cae2, 0.14), s: 0.92 }));
        if (t < T.cae2) {
          const A1 = encimaB(T.cae2, cache("pb2", () => poseB(T.cae2)));
          out.push({ A: vuelo(A0, A1, fase(t, T.suelta2, T.cae2), 80, 2, 0.6), capa: "aire", agujeros: true });
        } else out.push({ A: encimaB(t, pB), capa: "B", agujeros: true });
      }
    }
    return out;
  }
  function dibujaBoina(g, b) {
    if (!MATRIZ) return;
    g.save(); g.setTransform(MATRIZ); g.transform(b.A.a, b.A.b, b.A.c, b.A.d, b.A.e, b.A.f);
    if (b.plegada > 0.02) g.scale(1, 1 - 0.0 * b.plegada);
    dibBoina(g, b.agujeros, b.plegada || 0);
    g.restore();
  }
  // pinchos de Guillermo que atraviesan la boina (en pantalla)
  function dibPinchos(g, A, pG, t) {
    if (!MATRIZ) return;
    const H = afCabeza(G, pG), inv = invAF(A);
    g.save(); g.setTransform(MATRIZ); g.lineJoin = "round"; g.lineCap = "round";
    PUNTAS.forEach((q, i) => {
      const tip = apl(H, q), hl = AGUJEROS[i], hole = apl(A, hl);
      // ¿asoma? la punta tiene que quedar por encima de la copa (en coordenadas de la boina)
      const loc = apl(inv, tip), sale = hl.y - loc.y;
      if (sale < 4) return;
      const dx = tip.x - hole.x, dy = tip.y - hole.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, w = 4.2;
      const k = clamp(sale / 30);
      g.beginPath(); g.moveTo(hole.x + nx * w, hole.y + ny * w); g.quadraticCurveTo(hole.x + dx * 0.55 + nx * w * 0.5, hole.y + dy * 0.55 + ny * w * 0.5, tip.x, tip.y);
      g.quadraticCurveTo(hole.x + dx * 0.55 - nx * w * 0.6, hole.y + dy * 0.55 - ny * w * 0.6, hole.x - nx * w, hole.y - ny * w); g.closePath();
      g.fillStyle = "#9a5a2a"; g.fill();
      g.fillStyle = "#5a3014"; g.beginPath(); g.moveTo(hole.x - nx * w * 0.2, hole.y - ny * w * 0.2); g.lineTo(tip.x, tip.y); g.lineTo(hole.x - nx * w, hole.y - ny * w); g.closePath(); g.fill();
      g.strokeStyle = TINTA; g.lineWidth = 1.5; g.beginPath(); g.moveTo(hole.x + nx * w, hole.y + ny * w); g.quadraticCurveTo(hole.x + dx * 0.55 + nx * w * 0.5, hole.y + dy * 0.55 + ny * w * 0.5, tip.x, tip.y);
      g.quadraticCurveTo(hole.x + dx * 0.55 - nx * w * 0.6, hole.y + dy * 0.55 - ny * w * 0.6, hole.x - nx * w, hole.y - ny * w); g.stroke();
      g.globalAlpha = k; g.fillStyle = "rgba(255,210,150,0.6)"; g.beginPath(); g.ellipse(hole.x, hole.y, 4, 1.6, Math.atan2(A.b, A.a), 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
    });
    g.restore();
  }
  const invAF = A => { const det = A.a * A.d - A.b * A.c; return AF(A.d / det, -A.b / det, -A.c / det, A.a / det, (A.c * A.f - A.d * A.e) / det, (A.b * A.e - A.a * A.f) / det); };

  /* ---------- efectos ---------- */
  function estrella(g, x, y, r, a, col = "#fff6c8") {
    g.save(); g.globalAlpha = a; g.fillStyle = col; g.beginPath();
    for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.38 : r, an = i * Math.PI / 5 - Math.PI / 2; g.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
    g.closePath(); g.fill(); g.strokeStyle = "rgba(60,30,10,0.6)"; g.lineWidth = 1; g.stroke(); g.restore();
  }
  // ¡pinchazo!: estrellitas en las puntas al atravesar
  function pinchazo(g, t, pG) {
    const H = afCabeza(G, pG);
    PUNTAS.forEach((q, i) => {
      const t0 = T.pon1 - 0.07 + i * 0.045, k = fase(t, t0, t0 + 0.28); if (k <= 0 || k >= 1) return;
      const p = apl(H, q); estrella(g, p.x, p.y - 2, 4 + 8 * salida(k), 1 - k);
    });
  }
  // muelle del «boing»: rayitas en zigzag bajo la boina y líneas de velocidad
  function boing(g, t, pG) {
    for (const [t0, t1, fuerte] of [[T.suelta1, T.suelta1 + 0.35, 0], [T.suelta2, T.suelta2 + 0.45, 1]]) {
      const k = fase(t, t0, t1); if (k <= 0 || k >= 1) continue;
      const H = afCabeza(G, pG), c = apl(H, { x: 840, y: 190 });
      g.save(); g.globalAlpha = (1 - k) * 0.9; g.strokeStyle = "#ffffff"; g.lineWidth = 2.6; g.lineCap = "round";
      const alto = (30 + 30 * fuerte) * salida(k);
      g.beginPath(); for (let i = 0; i <= 8; i++) { const yy = c.y - alto * i / 8, xx = c.x + (i % 2 ? 7 : -7) * (1 - k * 0.5); i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke();
      for (let i = 0; i < 3; i++) { const dx = (i - 1) * 16; g.beginPath(); g.moveTo(c.x + dx, c.y - 6 - alto * 0.3); g.lineTo(c.x + dx * 1.5, c.y - 18 - alto * (0.8 + 0.2 * fuerte)); g.stroke(); }
      g.restore();
    }
  }
  // al caer la boina sobre la otra: ¡plof! y dos estrellitas
  function plof(g, t, pB) {
    const k = fase(t, T.cae2, T.cae2 + 0.4); if (k <= 0 || k >= 1) return;
    const c = apl(boinaMundoB(t, pB), { x: 0, y: -100 });
    g.save(); g.globalAlpha = 1 - k; g.strokeStyle = "#ffffff"; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < 6; i++) { const a = -Math.PI + i * Math.PI / 5, r0 = 26 + 18 * salida(k), r1 = r0 + 9;
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0 * 0.6); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1 * 0.6); g.stroke(); }
    g.restore();
    estrella(g, c.x - 36, c.y - 14 - 10 * k, 6, 1 - k); estrella(g, c.x + 30, c.y - 20 - 12 * k, 5, 1 - k);
  }
  // bigote imaginario: un rizo de puntitos que sigue a los dedos
  function rizo(g, t, pB) {
    for (const [t0, t1] of [[T.bigote1, T.bigote2 + 0.15], [T.posaB + 0.3, DUR]]) {
      const k = campana(t, t0, t1); if (k <= 0.01) continue;
      const c = GB.aPantalla(pB, GB.cabeza(pB).a(BIGOTE));
      g.save(); g.globalAlpha = 0.75 * k; g.fillStyle = "#ffffff";
      for (let i = 0; i < 9; i++) { const a = (t - t0) * 17 - i * 0.55, r = 7 + 0.6 * i;
        g.beginPath(); g.arc(c.x - 10 + Math.cos(a) * r * 0.9, c.y + 4 + Math.sin(a) * r * 0.6, 1.8 - i * 0.12, 0, Math.PI * 2); g.fill(); }
      g.restore();
    }
  }
  // rayitas de «mide» junto al ojo abierto y destellos de ilusión
  function brillos(g, t, pG) {
    const k = campana(t, T.ruega0, T.rodilla0); if (k <= 0.01) return;
    const c = G.aPantalla(pG, G.cabeza(pG).a({ x: 830, y: 560 }));
    for (let i = 0; i < 3; i++) { const a = t * 3 + i * 2.1; estrella(g, c.x + Math.cos(a) * 46, c.y - 30 + Math.sin(a) * 20, 4 + 2 * Math.sin(t * 9 + i), k * 0.9, "#ffffff"); }
  }

  /* ---------- cámara ---------- */
  const PLANOS = [
    [0, 1.0, 512, 300], [2.4, 1.0, 512, 300], [2.9, 1.06, 540, 304], [5.0, 1.06, 540, 304], [5.6, 1.02, 500, 302],
    [7.0, 1.02, 500, 302], [7.8, 1.08, 460, 320], [9.0, 1.08, 460, 320], [9.7, 1.08, 430, 302], [11.35, 1.08, 430, 302],
    [12.3, 1.0, 512, 300], [12.9, 1.0, 512, 300], [13.6, 1.04, 520, 300], [DUR, 1.04, 520, 300]
  ];
  function camara(t) {
    let i = 0; while (i < PLANOS.length - 2 && t > PLANOS[i + 1][0]) i++;
    const a = PLANOS[i], b = PLANOS[i + 1], k = suave(fase(t, a[0], b[0]));
    const kk = lerp(a[1], b[1], k), x = lerp(a[2], b[2], k), y = lerp(a[3], b[3], k);
    const mx = W / 2 / kk, my = H / 2 / kk;
    let sx = 0, sy = 0;
    const tem = campana(t, T.suelta2, T.suelta2 + 0.25);
    sx = tem * 1.6 * ruido(t * 30); sy = tem * 1.6 * ruido(t * 27 + 4);
    return { k: kk, x: clamp(x, mx - 40, W + 40 - mx) + sx, y: clamp(y, my - 60, H + 60 - my) + sy };
  }

  const pose = t => ({ g: poseG(t), b: poseB(t) });
  class GuillermoGabachoBoina extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !GB.listo()) return;
      if (!fondo) fondo = creaFondo();
      const pG = poseG(t), pB = poseB(t);
      const luz = tramo(t, NEGRO_INICIO, 0.75, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      MATRIZ = g.getTransform();
      g.drawImage(fondo, -40, -60);
      for (const P of PALOMAS) paloma(g, P, t);
      // sombras alargadas hacia la izquierda (el sol cae por la derecha)
      g.save(); g.fillStyle = "rgba(50,22,10,0.32)";
      g.beginPath(); g.ellipse(pG.x - 26, SUELO + 3, 74, 8, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pB.x - 26, SUELO + 3, 72, 8, 0, 0, Math.PI * 2); g.fill(); g.restore();
      const bs = boinas(t, pG, pB);
      // capas: boinas en la cabeza (debajo de los brazos), en la mano (debajo de los dedos) o en el aire
      const enG = bs.filter(b => b.capa === "G"), enB = bs.filter(b => b.capa === "B"), manoB = bs.filter(b => b.capa === "manoB");
      pG.capaCabeza = gg => { for (const b of enG) { dibujaBoina(gg, b); if (b.pinchos) dibPinchos(gg, b.A, pG, t); } };
      // pincel: en la mano lejana y luego entre los dientes
      const AP = pincelMundo(t, pB);
      const dibPincel = gg => { if (!MATRIZ) return; gg.save(); gg.setTransform(MATRIZ); gg.transform(AP.a, AP.b, AP.c, AP.d, AP.e, AP.f); pincel(gg, 0); gg.restore(); };
      if (t < T.pincel1) pB.manoLejos.objeto = dibPincel;
      pB.capaCabeza = gg => { for (const b of enB) dibujaBoina(gg, b); if (t >= T.pincel1) dibPincel(gg); };
      if (manoB.length) {
        const ob = pB.manoCerca.objeto, obl = pB.manoLejos.objeto;
        const cer = manoB.filter(b => t < T.lanza), lej = manoB.filter(b => !cer.includes(b));
        if (cer.length) pB.manoCerca.objeto = gg => { if (ob) ob(gg); for (const b of cer) dibujaBoina(gg, b); };
        if (lej.length) pB.manoLejos.objeto = gg => { if (obl) obl(gg); for (const b of lej) { dibujaBoina(gg, b); if (b.pinchos) dibPinchos(gg, b.A, pG, t); } };
      }
      G.dibujar(g, pG, t);
      GB.dibujar(g, pB, t);
      for (const b of bs.filter(b => b.capa === "aire")) dibujaBoina(g, b);
      pinchazo(g, t, pG);
      boing(g, t, pG);
      plof(g, t, pB);
      rizo(g, t, pB);
      brillos(g, t, pG);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00076", nombre: "Guillermo y Gabacho · La boina", crear: () => new GuillermoGabachoBoina() });
  // diagnóstico: distancia hombro → objetivo de las manos que tienen que llegar a una boina
  function diag(t) {
    const pG = poseG(t), pB = poseB(t), o = {};
    const dist = (Rg, p, lado) => { const m = lado === "cerca" ? p.manoCerca : p.manoLejos, h = Rg.tronco(p)(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO);
      const mu = m.mu ?? -1.75, w = rota({ x: Math.cos(mu) * 13 * 2.6, y: Math.sin(mu) * 13 * 2.6 }, m.ang || 0);
      return Math.round(Math.hypot(m.x + w.x - h.x, m.y + w.y - h.y)); };
    o.gC = dist(G, pG, "cerca"); o.gL = dist(G, pG, "lejos"); o.bC = dist(GB, pB, "cerca"); o.bL = dist(GB, pB, "lejos");
    o.max = { gC: Math.round(G.BRAZO_C_L * 1.08), gL: Math.round(G.BRAZO_L * 1.08), bC: Math.round(GB.BRAZO_C_L * 1.08), bL: Math.round(GB.BRAZO_L * 1.08) };
    return o;
  }
  window.__A2D_00076 = { pose, poseG, poseB, T, DUR, diag };
})();
