"use strict";
/* 00079 · Guillermo y Gabacho · El rizo
 *
 * Negro → rincón de barbería por la tarde: pared verde botella con filete dorado, zócalo de azulejos
 * blancos, suelo de damero, un pilar alicatado a la izquierda (con su toalla colgada), un reloj sin
 * números, una lámpara de pantalla y, a la derecha, el tocador: encimera de mármol, lavabo, grifo,
 * frascos sin etiquetas, el bote azul de los peines y un espejo redondo con marco de latón.
 * Gabacho, sentado en un taburete giratorio frente al espejo, se peina los rizos con una púa (peine
 * afro): mete, levanta, mete… y a la tercera se le queda clavada. Tira, la cabeza va detrás; se
 * encoge de hombros y la deja ahí, muy orgulloso, y se señala en el espejo con un guiño.
 * Guillermo, que lo miraba aguantándose la risa, va a ayudarle: agarra la púa y tira (Gabacho y el
 * taburete se van detrás); a la segunda le planta el pie en los riñones y tira con todo (rojo,
 * temblando, el cuello de Gabacho se estira)… ¡pop!: la púa sale y Guillermo sale volando hacia
 * atrás y se estampa contra el pilar (se raja un azulejo y se queda rajado) y resbala hasta el suelo.
 * La púa, en el aire, da la vuelta como un bumerán y se le clava en sus propios pinchos. Gabacho se
 * toca el hueco del rizo, saca una púa de repuesto del bolsillo y se la clava un poco más arriba; gira
 * el taburete, los dos se miran, asienten con aprobación y miran a cámara → negro.
 *
 * Las púas se dibujan con una afín de pantalla (retrato de la cabeza → pantalla, con el giro del
 * cuerpo) dentro de la capa de la cabeza que las lleva (capaCabeza): quedan encima del pelo y debajo
 * de los brazos. Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, ruido, hash } = M2;
  const G = Guillermo, GB = Gabacho;
  const S = 0.3, SUELO = 560, DUR = 14.8;
  const XB = 662, YPB = 462;                       // pelvis de Gabacho sentado (pantalla)
  const XG0 = 252, XG1 = XB - 150, XG2 = XB - 168, XGW = 238;
  const PILAR = 158;                               // borde derecho del pilar alicatado
  const T = {
    // Gabacho se peina
    p1: 0.45, p2: 1.15, p3: 1.85, atasco: 2.2, tiron1: 2.38, tiron2: 2.72, suelta: 3.08,
    hombros0: 3.2, hombros1: 3.45, hombros2: 3.95, espejo0: 4.15, espejo1: 4.4, senala0: 4.45, senala1: 4.95, quieto: 5.15,
    // Guillermo
    risa: 2.45, camara: 4.0, sale: 4.55, anda0: 4.85, anda1: 5.97, agarra0: 6.02, agarra1: 6.32,
    tira0: 6.42, tira1: 6.72, afloja0: 6.98, afloja1: 7.16, mira: 7.2, decide: 7.42,
    pie0: 7.52, pie1: 7.86, tirazo0: 7.9, tirazo1: 8.86,
    pop: 8.88, choque: 9.24, sentado: 9.72, clava: 10.55,
    // final
    toca0: 10.72, toca1: 10.95, bols0: 10.98, bols1: 11.2, pone0: 11.24, pone1: 11.8, orgullo: 11.84,
    gira0: 12.02, gira1: 12.4, asiente0: 12.5, asiente1: 13.12, camara2: 13.25, fin: 13.95
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
  const norm = (x, y) => { const l = Math.hypot(x, y) || 1; return { x: x / l, y: y / l }; };
  const TINTA = "#16100c";
  let MATRIZ = null;

  // afines de pantalla { a, b, c, d, e, f } (como setTransform)
  const AF = (a, b, c, d, e, f) => ({ a, b, c, d, e, f });
  const mul = (A, B) => AF(A.a * B.a + A.c * B.b, A.b * B.a + A.d * B.b, A.a * B.c + A.c * B.d, A.b * B.c + A.d * B.d,
    A.a * B.e + A.c * B.f + A.e, A.b * B.e + A.d * B.f + A.f);
  const apl = (A, q) => ({ x: A.a * q.x + A.c * q.y + A.e, y: A.b * q.x + A.d * q.y + A.f });
  const Tm = (x, y) => AF(1, 0, 0, 1, x, y), Rm = r => AF(Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0), Sm = (x, y) => AF(x, 0, 0, y, 0, 0);
  const lerpAF = (A, B, k) => AF(lerp(A.a, B.a, k), lerp(A.b, B.b, k), lerp(A.c, B.c, k), lerp(A.d, B.d, k), lerp(A.e, B.e, k), lerp(A.f, B.f, k));

  /* ---------- giro (y aplastado) de todo el cuerpo ----------
   * p.gr = { phi, dx, dy, sx }: se gira alrededor de la pelvis en pantalla, se aplasta en x (sx) y se
   * desplaza (dx, dy). Las mismas cuentas para dibujar y para pasar puntos de la hoja a pantalla. */
  function ponGiro(R, p, phi, dx, dy, sx = 1) { p.o = R.aPantalla(p, p.pelvis); p.gr = { phi, dx, dy, sx }; }
  // giro alrededor de un pivote de pantalla cualquiera (la pata del taburete)
  function ponGiroPiv(R, p, phi, piv, sx = 1) {
    const o = R.aPantalla(p, p.pelvis), r = rota({ x: o.x - piv.x, y: o.y - piv.y }, phi);
    ponGiro(R, p, phi, piv.x + r.x - o.x, piv.y + r.y - o.y, sx);
  }
  function enGiro(p, q) {
    const gr = p.gr, o = p.o; if (!gr) return q;
    const r = rota({ x: (q.x - o.x) * gr.sx, y: q.y - o.y }, gr.phi);
    return { x: o.x + gr.dx + r.x, y: o.y + gr.dy + r.y };
  }
  function desGiro(p, q) {
    const gr = p.gr, o = p.o; if (!gr) return q;
    const r = rota({ x: q.x - o.x - gr.dx, y: q.y - o.y - gr.dy }, -gr.phi);
    return { x: o.x + r.x / (gr.sx || 1e-6), y: o.y + r.y };
  }
  const pant = (R, p, q) => enGiro(p, R.aPantalla(p, q));
  const aHojaG = (R, p, q) => R.aHoja(p, desGiro(p, q));
  function dibuja(R, g, p, t, antes) {
    const gr = p.gr, o = p.o;
    g.save();
    if (gr) { g.translate(o.x + gr.dx, o.y + gr.dy); g.rotate(gr.phi); g.translate(-o.x, -o.y); }
    if (antes) antes(g);
    if (gr && gr.sx !== 1) { g.translate(o.x, o.y); g.scale(gr.sx, 1); g.translate(-o.x, -o.y); }
    R.dibujar(g, p, t);
    g.restore();
  }
  // cabeza (retrato) → pantalla, con espejo, giro y aplastado
  function afCab(R, p) {
    const H = R.cabeza(p), f = q => pant(R, p, H.a(q));
    const o = f({ x: 0, y: 0 }), ex = f({ x: 100, y: 0 }), ey = f({ x: 0, y: 100 });
    return AF((ex.x - o.x) / 100, (ex.y - o.y) / 100, (ey.x - o.x) / 100, (ey.y - o.y) / 100, o.x, o.y);
  }

  /* ---------- manos ---------- */
  const JK = G.JK, R_M = G.MUNECA_R * JK;
  const offMano = (m, q) => { const r = rota(q, m.mu + Math.PI / 2); return rota({ x: r.x * JK, y: r.y * JK }, m.ang || 0); };
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, -1.75), l: punoDesde({ x: 372, y: 648 }, -1.75) };
  const PALMA = { x: 0, y: 2 };
  function bolsillo(R, p, lado) {
    if (R === G) return G.tronco(p)(lado === "cerca" ? BOLS_G.c : BOLS_G.l);
    const m = R.manoReposo(p, lado); return { x: m.x, y: m.y };
  }
  // objetivo de una mano: { bols } | { tr: punto del tronco } | { hoja } | { at: p => punto de la hoja } | { scr: () => punto de pantalla }
  function resolutor(R, p, lado) {
    return o => {
      if (o.bols) { const b = bolsillo(R, p, lado);
        return { x: b.x, y: b.y, mu: -1.75, ang: 0, puno: o.sale ? 1 : 0, dedos: o.dedos || D(0.4, 0.4, 0.4, 0.4), dobla: lado === "cerca" ? -1 : 1 }; }
      let q;
      if (o.tr) q = R.tronco(p)(o.tr);
      else if (o.hoja) q = o.hoja;
      else if (o.at) q = o.at(p);
      else q = aHojaG(R, p, o.scr());
      if (o.ref) { const f = offMano({ mu: o.mu, ang: o.ang || 0 }, o.ref); q = { x: q.x - f.x, y: q.y - f.y }; }
      return { x: q.x, y: q.y, mu: o.mu, ang: o.ang || 0, puno: o.puno ?? 1, dedos: o.dedos || D(0.35, 0.35, 0.35, 0.35), dobla: o.dobla ?? (lado === "cerca" ? -1 : 1) };
    };
  }
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
  const mano = m => ({ x: m.x, y: m.y, ang: m.ang, mu: m.mu, dobla: m.dobla, puno: m.puno, dedos: m.dedos });

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, rub: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0, espiral: e.esp };
  }
  // la mirada hacia un punto de la pantalla (en el marco de la cabeza)
  function miraA(R, p, q, ojo) {
    const A = afCab(R, p), o = apl(A, ojo), det = A.a * A.d - A.b * A.c;
    const dx = q.x - o.x, dy = q.y - o.y;
    const lx = (A.d * dx - A.c * dy) / det, ly = (-A.b * dx + A.a * dy) / det;
    const l = Math.hypot(lx, ly) || 1;
    return { x: clamp(lx / l * 1.1, -1, 1), y: clamp(ly / l * 1.1, -1, 1) };
  }

  /* ================= las púas (peines afro) ================= */
  // Marco propio en píxeles de pantalla: origen en el lomo, púas hacia +y (24 px) y mango hacia −y.
  const PX = 1 / (0.6 * S);                        // unidades de retrato por píxel de pantalla
  const TAM = 1.35;                                // tamaño de la púa (una púa afro grande)
  const COL_ROJA = { mango: "#d8342c", luz: "#ff7a5c", oscuro: "#8e1c16" };
  const COL_LILA = { mango: "#6a4ad8", luz: "#a690ff", oscuro: "#3a2690" };
  // fuera: cuánto asoman las púas (px) desde el pelo; el resto queda tapado por los rizos
  function dibPeine(g, col, fuera, pelo, rizos = 0) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const L = 24, vis = clamp(fuera, 0, L);
    // púas (solo lo que asoma)
    if (vis > 0.5) for (let i = 0; i < 6; i++) {
      const x = -8.5 + i * 3.4;
      g.strokeStyle = TINTA; g.lineWidth = 2.6; g.beginPath(); g.moveTo(x, 2); g.lineTo(x * (1 + 0.06 * vis / L), 2 + vis); g.stroke();
      g.strokeStyle = "#2a2a30"; g.lineWidth = 1.3; g.beginPath(); g.moveTo(x, 2); g.lineTo(x * (1 + 0.06 * vis / L), 2 + vis - 0.6); g.stroke();
    }
    // lomo
    g.fillStyle = "#26262c"; g.strokeStyle = TINTA; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(-11, -1.5); g.lineTo(11, -1.5); g.quadraticCurveTo(12.5, 0.5, 11, 3); g.lineTo(-11, 3); g.quadraticCurveTo(-12.5, 0.5, -11, -1.5); g.closePath(); g.fill(); g.stroke();
    // mango
    g.fillStyle = col.mango;
    g.beginPath(); g.moveTo(-6.5, -1.5); g.bezierCurveTo(-7.5, -12, -6.8, -22, -5.4, -29); g.quadraticCurveTo(0, -34.5, 5.4, -29);
    g.bezierCurveTo(6.8, -22, 7.5, -12, 6.5, -1.5); g.closePath(); g.fill(); g.lineWidth = 1.3; g.stroke();
    g.fillStyle = col.oscuro; g.beginPath(); g.ellipse(0, -26, 2.2, 2.6, 0, 0, Math.PI * 2); g.fill();      // agujero de colgar
    g.strokeStyle = col.oscuro; g.lineWidth = 1; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-4, -6 - i * 3); g.lineTo(4, -6 - i * 3); g.stroke(); }
    g.strokeStyle = col.luz; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-4.6, -3); g.bezierCurveTo(-5.6, -11, -5.2, -20, -3.8, -27); g.stroke();
    // rizos o pinchos que tapan la raíz de las púas
    if (pelo && vis < L) pelo(g, vis);
    // rizos enganchados en las puntas al peinar
    if (rizos > 0.02) {
      g.save(); g.globalAlpha = clamp(rizos * 1.6); g.lineWidth = 1.6;
      for (let i = 0; i < 5; i++) {
        const x = -8.5 + i * 4.2, y = 2 + vis + 1 + 2 * (i & 1), r = 2.6 + 0.8 * (i % 3);
        g.strokeStyle = i & 1 ? "#5a2f17" : "#3f2010"; g.beginPath();
        for (let j = 0; j <= 14; j++) { const a = j * 0.8, rr = r * (0.5 + j / 28); const xx = x + Math.cos(a) * rr, yy = y + j * 0.35 + Math.sin(a) * rr; j ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
        g.stroke();
      }
      g.restore();
    }
    g.restore();
  }
  // rizos de Gabacho por encima de las púas metidas
  const peloRizo = (g, vis) => {
    const y = 2 + vis;
    g.save();
    for (let i = -2; i <= 2; i++) {
      const x = i * 5, r = 4.2 + (i & 1) * 0.8;
      g.fillStyle = i & 1 ? "#5a2f17" : "#3f2010"; g.beginPath(); g.arc(x, y + 2.5, r, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "#8a4a26"; g.lineWidth = 1.2; g.beginPath(); g.arc(x - 0.6, y + 2, r * 0.55, Math.PI * 0.9, Math.PI * 2.1); g.stroke();
      g.strokeStyle = "#1e0e06"; g.lineWidth = 0.9; g.beginPath(); g.arc(x, y + 2.5, r, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
    }
    g.restore();
  };
  // pinchos de Guillermo por encima de las púas metidas
  const peloPincho = (g, vis) => {
    const y = 2 + vis;
    g.save(); g.strokeStyle = "#2a1408"; g.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      const x = i * 5.2, h = 8 + 3 * ((i + 5) % 2);
      g.fillStyle = i & 1 ? "#8a4a1e" : "#6b3412";
      g.beginPath(); g.moveTo(x - 4, y + 6); g.lineTo(x + 0.8, y - h + 4); g.lineTo(x + 4.5, y + 6); g.closePath(); g.fill(); g.stroke();
    }
    g.restore();
  };

  // sitios de la púa en la cabeza de Gabacho (retrato): lomo con la púa metida del todo y eje del mango
  const SITIO = {
    A: { s: { x: 612, y: 252 }, a: norm(-0.55, -0.83) },
    B: { s: { x: 560, y: 300 }, a: norm(-0.78, -0.62) },
    C: { s: { x: 536, y: 372 }, a: norm(-0.9, -0.43) }
  };
  const ATASCO = 4;                                 // lo que asoma cuando se queda clavada (px)
  // sitio en los pinchos de Guillermo
  const SITIO_G = { s: { x: 850, y: 262 }, a: norm(0.52, -0.85) };
  const mezS = (A, B, k) => ({ s: { x: lerp(A.s.x, B.s.x, k), y: lerp(A.s.y, B.s.y, k) }, a: norm(lerp(A.a.x, B.a.x, k), lerp(A.a.y, B.a.y, k)) });
  // estado de la púa roja en la cabeza de Gabacho mientras no ha saltado
  function puaGB(t) {
    const golpe = (t0) => ({ mete: [t0, t0 + 0.14], saca: [t0 + 0.14, t0 + 0.5], va: [t0 + 0.5, t0 + 0.7] });
    const ciclos = [[T.p1, "A", "B"], [T.p2, "B", "C"]];
    let sit = SITIO.A, fuera = 26, alza = 0;
    if (t < T.p1) { sit = SITIO.A; fuera = 26; }
    for (const [t0, a, b] of ciclos) {
      if (t < t0) break;
      const c = golpe(t0);
      sit = SITIO[a];
      fuera = lerp(26, 0, tramo(t, c.mete[0], c.mete[1], entrada));
      if (t > c.saca[0]) { const k = tramo(t, c.saca[0], c.saca[1], salida); fuera = lerp(0, 26, k); alza = Math.sin(Math.PI * k); }
      if (t > c.va[0]) { const k = tramo(t, c.va[0], c.va[1]); sit = mezS(SITIO[a], SITIO[b], k); fuera = 26 + 10 * Math.sin(Math.PI * k); alza = 0; }
    }
    if (t >= T.p3) {
      sit = SITIO.C;
      fuera = lerp(26, 0, tramo(t, T.p3, T.p3 + 0.14, entrada));
      // se queda clavada: apenas sale, y con los tirones se tensa un poco
      if (t > T.p3 + 0.14) fuera = lerp(0, ATASCO, tramo(t, T.p3 + 0.14, T.atasco));
      fuera += 2.2 * campana(t, T.tiron1, T.tiron1 + 0.24) + 2.6 * campana(t, T.tiron2, T.tiron2 + 0.26);
      // Guillermo tira
      fuera += 5 * tramo(t, T.tira0, T.tira1) * (1 - tramo(t, T.afloja0, T.afloja1)) + 13 * tramo(t, T.tirazo0, T.tirazo1, entrada);
    }
    // vibra al soltarla
    let vib = 0.18 * Math.sin((t - T.suelta) * 38) * Math.exp(-Math.max(0, t - T.suelta) * 7) * (t > T.suelta ? 1 : 0);
    vib += 0.05 * ruido(t * 40) * (campana(t, T.tira0, T.afloja0) + 2 * campana(t, T.tirazo0, T.pop));
    return { sit, fuera, alza, vib };
  }
  // afín de la púa en retrato a partir del sitio (lomo metido + eje) y lo que asoma
  function afSitio(sit, fuera, vib = 0) {
    const th = Math.atan2(sit.a.x, -sit.a.y) + vib, k = PX * TAM;
    const s = { x: sit.s.x + sit.a.x * fuera * k, y: sit.s.y + sit.a.y * fuera * k };
    return mul(mul(Tm(s.x, s.y), Rm(th)), Sm(k, k));
  }
  const AGARRE = { x: 0, y: -15 };
  // el antebrazo de quien la peina, perpendicular al mango (y hacia abajo)
  const muPua = sit => { const n = sit.a.y < 0 ? { x: sit.a.y, y: -sit.a.x } : { x: -sit.a.y, y: sit.a.x }; const m = n.y > 0 ? n : { x: -n.x, y: -n.y }; return Math.atan2(m.y, m.x); };                 // centro del mango (marco de la púa)

  /* ================= Gabacho ================= */
  const CB = {
    gusto: E({ mx: 0.7, my: -0.25, c: 0.4, sd: 8, si: 12, gi: 0.05, sonr: 0.6, ancho: 0.95 }),
    atasco: E({ mx: -0.7, my: -0.7, sd: 2, si: 18, gi: 0.12, abre: 4, ancho: 0.55, sonr: -0.1 }),
    tiron: E({ c: 1, z: 0.7, sd: -6, si: -6, abre: 12, ancho: 0.85, sonr: -0.35 }),
    bof: E({ mx: 0.3, my: 0.1, c: 0.55, sd: 22, si: 24, gi: 0.12, gd: 0.1, abre: 0, ancho: 0.5, sonr: -0.35, mof: 0.35 }),
    espejo: E({ mx: 0.95, my: 0.05, ci: 1, sd: 18, si: 4, sonr: 0.9, ancho: 1.05 }),
    chulo: E({ mx: 0.95, my: 0.05, c: 0.3, sd: 10, si: 12, sonr: 0.6, ancho: 0.95 }),
    eh: E({ mx: -1, my: -0.2, iris: 1.08, sd: 24, si: 14, abre: 8, ancho: 0.55, sonr: -0.05 }),
    tirado: E({ mx: -0.8, my: -0.6, c: 0.6, z: 0.4, sd: -8, gd: -0.1, si: -4, abre: 16, ancho: 0.9, sonr: -0.5 }),
    pie: E({ mx: -1, my: 0.45, iris: 0.92, sd: 4, si: 22, gi: 0.14, abre: 0, ancho: 0.55, sonr: -0.25 }),
    estira: E({ c: 1, z: 1, sd: -10, si: -10, abre: 22, ancho: 1.0, sonr: -0.4 }),
    pop: E({ mx: 0.4, my: -0.2, iris: 0.82, sd: 28, si: 28, abre: 20, ancho: 0.55, sonr: -0.1 }),
    sigue: E({ iris: 1.05, sd: 20, si: 18, abre: 10, ancho: 0.5, sonr: 0.05 }),
    gracia: E({ mx: -1, my: -0.1, c: 0.35, h: 0.5, sd: 16, si: 16, abre: 6, sonr: 0.7, ancho: 0.9 }),
    toca: E({ mx: -0.4, my: -0.85, sd: 18, si: 6, gi: 0.05, abre: 0, ancho: 0.6, sonr: -0.2 }),
    orgullo: E({ c: 1, h: 0.5, sd: 14, si: 18, gi: 0.08, sonr: 0.85, ancho: 1.0 }),
    aprueba: E({ mx: 0.95, my: 0.1, c: 0.3, sd: 18, si: 12, abre: 0, ancho: 0.55, sonr: 0.45 }),
    guino: E({ mx: -0.35, my: 0.05, cd: 1, sd: 16, si: 6, sonr: 0.9, ancho: 1.05 })
  };
  const GUION_CB = [
    [T.p3 + 0.15, T.p3 + 0.3, "atasco"], [T.tiron1, T.tiron1 + 0.08, "tiron"], [T.tiron1 + 0.28, T.tiron1 + 0.36, "atasco"],
    [T.tiron2, T.tiron2 + 0.08, "tiron"], [T.suelta, T.suelta + 0.15, "atasco"], [T.hombros0, T.hombros1, "bof"],
    [T.espejo0, T.espejo1, "espejo"], [T.senala1, T.quieto, "chulo"], [T.agarra1 - 0.05, T.agarra1 + 0.1, "eh"],
    [T.tira0 + 0.05, T.tira0 + 0.2, "tirado"], [T.afloja1, T.afloja1 + 0.15, "eh"], [T.pie1 - 0.15, T.pie1 + 0.05, "pie"],
    [T.tirazo0 + 0.1, T.tirazo0 + 0.3, "estira"], [T.pop, T.pop + 0.06, "pop"], [T.pop + 0.3, T.pop + 0.5, "sigue"],
    [T.clava + 0.05, T.clava + 0.25, "gracia"], [T.toca0 - 0.05, T.toca0 + 0.15, "toca"], [T.pone1 - 0.05, T.orgullo + 0.1, "orgullo"],
    [T.gira0 + 0.1, T.gira1, "aprueba"], [T.camara2, T.camara2 + 0.25, "guino"]
  ];
  const PARP_B = [0.3, 1.7, 3.6, 5.6, 7.3, 10.0, 12.45, 13.75];
  const P0B = { torso: 0.02, cab: 0.03, cdx: 0, cdy: 0, cey: 1, taburete: 0 };
  const CuB = o => Object.assign({}, P0B, o);
  const CUER_B = {
    peina: CuB({ torso: -0.02, cab: -0.16 }),
    atasco: CuB({ torso: -0.02, cab: -0.2 }),
    tiron: CuB({ torso: -0.06, cab: -0.34 }),
    bof: CuB({ torso: 0.0, cab: 0.06, cdy: 14 }),
    espejo: CuB({ torso: -0.05, cab: -0.1 }),
    quieto: CuB({ torso: 0.02, cab: -0.02 }),
    eh: CuB({ torso: 0.0, cab: -0.08 }),
    tirado: CuB({ torso: -0.1, cab: -0.36, cdx: -16, cdy: 0, taburete: -0.1 }),
    estira: CuB({ torso: 0.07, cab: -0.52, cdx: -40, cdy: -16, cey: 1.08, taburete: 0.02 }),
    suelto: CuB({ torso: 0.1, cab: 0.28, taburete: 0.05 }),
    mira: CuB({ torso: -0.04, cab: -0.14 }),
    toca: CuB({ torso: 0.0, cab: 0.1 }),
    orgullo: CuB({ torso: -0.05, cab: -0.14 }),
    mirarG: CuB({ torso: 0.04, cab: 0.06 }),
    asiente: CuB({ torso: 0.06, cab: 0.2 }),
    camara: CuB({ torso: 0.0, cab: 0.0 })
  };
  const GUION_B = [
    [0.4, 0.6, "peina"], [T.p3 + 0.1, T.p3 + 0.25, "atasco"], [T.tiron1, T.tiron1 + 0.1, "tiron", salida], [T.tiron1 + 0.12, T.tiron1 + 0.3, "atasco"],
    [T.tiron2, T.tiron2 + 0.1, "tiron", salida], [T.tiron2 + 0.12, T.tiron2 + 0.3, "atasco"], [T.hombros0, T.hombros1, "bof"],
    [T.hombros2, T.espejo1, "espejo"], [T.senala1, T.quieto + 0.2, "quieto"], [T.agarra1, T.agarra1 + 0.15, "eh"],
    [T.tira0, T.tira1, "tirado"], [T.afloja0, T.afloja1, "eh", salida], [T.tirazo0, T.tirazo1, "estira", entrada],
    [T.pop, T.pop + 0.1, "suelto", salida], [T.pop + 0.15, T.pop + 0.55, "mira"], [T.toca0 - 0.1, T.toca0 + 0.15, "toca"],
    [T.pone1, T.orgullo + 0.15, "orgullo"], [T.gira0, T.gira1, "mirarG"], [T.asiente0, T.asiente0 + 0.15, "asiente"],
    [T.asiente0 + 0.17, T.asiente0 + 0.32, "mirarG"], [T.asiente0 + 0.34, T.asiente0 + 0.49, "asiente"], [T.asiente0 + 0.51, T.asiente1, "mirarG"],
    [T.camara2, T.camara2 + 0.3, "camara"]
  ];
  const PEL_B = GB.SUELO + (YPB - SUELO) / (S * GB.K) - GB.PELVIS.y;
  const TOB_B = GB.SUELO - GB.TOBILLO_ALTO;
  const TAB = { x: XB - 10, asiento: YPB + 15, base: SUELO - 2, r: 50 };     // taburete
  const PIV_TAB = { x: TAB.x - 44, y: SUELO };
  // la mano lejana agarrada al borde de la encimera (pantalla)
  const ENCIMERA = { x: 776, y: 378 };
  function poseB(t, sinMirada) {
    const b = linea(GUION_B, CUER_B, "peina", t);
    const respira = Math.sin(t * 1.9 + 1.4);
    const tiembla = campana(t, T.tirazo0, T.pop) * tramo(t, T.tirazo0, T.tirazo1);
    const espejo = t > (T.gira0 + T.gira1) / 2;
    const p = {
      x: XB, suelo: SUELO, s: S, espejo, tirasLimpias: true,
      pelvis: { x: GB.PELVIS.x, y: GB.PELVIS.y + PEL_B + respira * 1.0 },
      torso: b.torso + 0.01 * tiembla * ruido(t * 41), torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: b.cdx, dy: b.cdy, esc: { x: 1, y: b.cey } }
    };
    // la cabeza sigue a cada golpe de peine (un poco) y rebota al soltar la púa
    const ph = puaGB(t);
    p.cabeza.ang -= 0.06 * ph.alza;
    if (t > T.pop) { const u = t - T.pop; p.cabeza.ang += 0.12 * Math.sin(u * 17) * Math.exp(-u * 5); }
    if (t > T.afloja0 && t < T.pie0) { const u = t - T.afloja0; p.cabeza.ang += 0.1 * Math.sin(u * 19) * Math.exp(-u * 7); }
    p.cabeza.ang += 0.02 * tiembla * ruido(t * 47 + 3);
    // asiente al final
    // piernas: pies en el suelo, por delante del taburete
    const aHojaX = sx => GB.PELVIS.x + (sx - XB) / (S * GB.K);
    const fr = espejo ? -1 : 1;
    p.piernas.cerca = { tob: { x: aHojaX(XB + 60), y: TOB_B }, ang: 0 };
    p.piernas.lejos = { tob: { x: aHojaX(XB + 92), y: TOB_B }, ang: 0 };
    // cara
    let e = linea(GUION_CB, CB, "gusto", t);
    p.cara = cara(e, parpadeo(t, PARP_B));
    // sigue a la púa en el aire con la mirada
    const sigue = tramo(t, T.pop + 0.25, T.pop + 0.5) * (1 - tramo(t, T.clava + 0.05, T.clava + 0.25));
    p.rojo = 0.5 * campana(t, T.tirazo0 + 0.3, T.pop + 0.2);
    p.sudor = 0.5 * campana(t, T.tirazo0, T.pop + 0.6);
    // giro del taburete (hacia atrás con los tirones) y al final, giro de la peonza
    const gira = fase(t, T.gira0, T.gira1);
    const sx = gira > 0 && gira < 1 ? Math.max(0.12, Math.abs(Math.cos(Math.PI * gira))) : 1;
    ponGiroPiv(GB, p, b.taburete + 0.012 * tiembla * ruido(t * 29), PIV_TAB, sx);
    if (sigue > 0.01 && !sinMirada) {
      const c = puaVuelo(t).c, m = miraA(GB, p, c, GB.OJOS.d.c);
      p.cara.mirada = { x: lerp(p.cara.mirada.x, m.x, sigue), y: lerp(p.cara.mirada.y, m.y, sigue) };
      // la cabeza también la sigue un poco (arriba: hacia atrás)
      p.cabeza.ang += sigue * (-0.16 * clamp((250 - c.y) / 160, -0.5, 1) - 0.06 * clamp((XB - c.x) / 300, -1, 1));
    }
    // manos
    const res = resolutor(GB, p, "cerca"), resL = resolutor(GB, p, "lejos");
    const agarre = () => { const A = afCab(GB, p), ph2 = puaGB(t); return apl(mul(A, afSitio(ph2.sit, ph2.fuera, ph2.vib)), AGARRE); };
    const agarreR = () => { const A = afCab(GB, p); return apl(mul(A, afSitio(SITIO.B, lerp(20, ATASCO, tramo(t, T.pone0 + 0.3, T.pone1 - 0.05)))), AGARRE); };
    const hueco = () => apl(afCab(GB, p), { x: SITIO.C.s.x - 30, y: SITIO.C.s.y + 10 });
    const RODILLA_C = { tr: { x: 228, y: 688 } }, RODILLA_L = { tr: { x: 335, y: 680 } };
    const PUNO = D5(0.55, 0.4, 0.35, 0.3, 0.3);
    const PISTA_BC = [
      [0, 0, { scr: agarre, mu: muPua(puaGB(t).sit), dedos: PUNO, dobla: 1 }],
      [T.suelta, T.suelta + 0.14, { scr: () => apl(afCab(GB, p), { x: 470, y: 360 }), mu: 2.1, dedos: D(1, 1, 1, 1), dobla: 1 }, salida],
      // se encoge de hombros: palma arriba hacia atrás
      [T.hombros0, T.hombros1, { tr: { x: -60, y: 640 }, mu: 0.2, ang: 0, dedos: D(1, 1, 1, 1), dobla: -1 }],
      [T.hombros2, T.espejo1, { ...RODILLA_C, mu: -2.2, dedos: D(0.6, 0.7, 0.7, 0.7), dobla: -1 }],
      [T.agarra1, T.agarra1 + 0.2, { tr: { x: 150, y: 880 }, mu: -1.6, dedos: D(0.3, 0.2, 0.2, 0.2), dobla: -1 }],
      [T.pop + 0.05, T.pop + 0.25, RODILLA_C ? { ...RODILLA_C, mu: -2.2, dedos: D(0.6, 0.7, 0.7, 0.7), dobla: -1 } : null],
      [T.toca0, T.toca0 + 0.2, { scr: hueco, mu: 1.95, dedos: D(0.8, 1, 1, 1), dobla: 1 }],
      [T.bols0, T.bols1 - 0.06, { bols: true }],
      [T.bols1 - 0.06, T.bols1, { bols: true, sale: true, dedos: PUNO }],
      [T.pone0, T.pone0 + 0.3, { scr: agarreR, mu: muPua(SITIO.B), dedos: PUNO, dobla: 1 }],
      [T.pone1 + 0.02, T.orgullo + 0.25, { ...RODILLA_C, mu: -2.2, dedos: D(0.6, 0.7, 0.7, 0.7), dobla: -1 }]
    ];
    const PISTA_BL = [
      [0, 0, { ...RODILLA_L, mu: -2.2, dedos: D(0.6, 0.7, 0.7, 0.7), dobla: 1 }],
      [T.hombros0, T.hombros1, { tr: { x: 560, y: 640 }, mu: Math.PI - 0.2, dedos: D(1, 1, 1, 1), dobla: 1 }],
      [T.hombros2, T.espejo1, { ...RODILLA_L, mu: -2.2, dedos: D(0.6, 0.7, 0.7, 0.7), dobla: 1 }],
      // se señala en el espejo (antebrazo horizontal, índice)
      [T.senala0, T.senala0 + 0.2, { tr: { x: 652, y: 210 }, mu: Math.PI - 0.55, dedos: D5(0.15, 1, 0, 0, 0), dobla: 1 }, salida],
      [T.senala1, T.quieto + 0.1, { ...RODILLA_L, mu: -2.2, dedos: D(0.6, 0.7, 0.7, 0.7), dobla: 1 }],
      // se agarra a la encimera mientras le tiran
      [T.tira0 - 0.1, T.tira0 + 0.1, { scr: () => ENCIMERA, mu: Math.PI - 0.5, dedos: D(0.5, 0.3, 0.3, 0.3), dobla: 1 }],
      [T.pop + 0.3, T.pop + 0.6, { ...RODILLA_L, mu: -2.2, dedos: D(0.6, 0.7, 0.7, 0.7), dobla: 1 }]
    ];
    const C = pista(PISTA_BC.filter(x => x[2]), t, res), L = pista(PISTA_BL, t, resL);
    // se dan palmaditas en el hueco
    const pal = campana(t, T.toca0 + 0.15, T.bols0);
    C.y += pal * 10 * Math.max(0, Math.sin((t - T.toca0) * 30));
    // el índice señala con un toquecito
    const tq = campana(t, T.senala0 + 0.2, T.senala1);
    L.x += tq * 14 * Math.sin((t - T.senala0) * 14);
    if (tiembla > 0) { const k = tiembla * 2 / S; L.x += k * ruido(t * 35); L.y += k * ruido(t * 39 + 5); }
    p.manoCerca = mano(C); p.manoLejos = mano(L);
    // cuello estirado: el bloque de piel del cuello asoma; se le pone su contorno del lado de delante
    const est = clamp(-b.cdy / 16);
    if (est > 0.02) p.capaTronco = gg => {
      gg.save(); gg.globalAlpha = est; gg.lineCap = "round";
      gg.fillStyle = "rgba(200,110,60,0.35)"; gg.fillRect(276, 140, 18, 112);
      gg.strokeStyle = "#0b0a0e"; gg.lineWidth = 6; gg.beginPath(); gg.moveTo(294, 140); gg.quadraticCurveTo(290, 200, 296, 252); gg.stroke();
      gg.restore();
    };
    return p;
  }

  /* ================= Guillermo ================= */
  const CG = {
    mira: E({ mx: 0.85, my: 0.05, sonr: 0.3, ancho: 0.9 }),
    aguanta: E({ mx: 0.85, my: 0, c: 0.35, h: 0.5, sd: 14, si: 14, abre: 0, ancho: 0.5, sonr: 0.45, mof: 0.55 }),
    camara: E({ mx: -0.5, my: 0.05, sd: 16, si: 2, gi: -0.08, sonr: 0.85, ancho: 1.0 }),
    decidido: E({ mx: 0.9, my: -0.2, sd: -4, gd: -0.12, si: -2, gi: -0.1, sonr: 0.35, ancho: 0.9 }),
    alcanza: E({ mx: 0.8, my: -0.7, sd: 12, si: 14, abre: 4, ancho: 0.5, sonr: 0.1 }),
    tira: E({ mx: 0.6, my: -0.6, c: 0.45, z: 0.4, sd: -8, si: -8, abre: 16, ancho: 1.0, sonr: -0.2 }),
    extranado: E({ mx: 0.8, my: -0.7, sd: 22, si: 4, gi: 0.1, abre: 2, ancho: 0.5, sonr: -0.1 }),
    reto: E({ mx: -0.5, my: 0.0, sd: -12, gd: -0.22, si: -10, gi: -0.2, sonr: 0.25, ancho: 0.85 }),
    fuerza: E({ c: 1, z: 1, sd: -10, gd: -0.2, si: -10, gi: -0.2, abre: 24, ancho: 1.05, sonr: -0.15, mof: 0.4 }),
    vuela: E({ mx: 0.2, my: -0.4, iris: 0.8, sd: 28, si: 28, abre: 26, ancho: 0.55, sonr: -0.2 }),
    golpe: E({ c: 1, z: 1, sd: -4, si: -4, abre: 12, ancho: 0.85, sonr: -0.35 }),
    mareo: E({ mx: 0, my: 0, sd: 10, si: 14, abre: 8, ancho: 0.6, sonr: 0.2, lengua: 1, esp: 1 }),
    arriba: E({ mx: 0.25, my: -1, iris: 0.88, sd: 24, si: 24, abre: 3, ancho: 0.5, sonr: -0.1 }),
    aprueba: E({ mx: 0.95, my: -0.05, c: 0.25, sd: 16, si: 14, abre: 0, ancho: 0.55, sonr: 0.4 }),
    sonrisa: E({ mx: -0.5, my: 0.05, sd: 12, si: 6, sonr: 0.95, ancho: 1.05, abre: 4 })
  };
  const GUION_CG = [
    [T.risa, T.risa + 0.2, "aguanta"], [T.camara, T.camara + 0.2, "camara"], [T.sale + 0.1, T.sale + 0.3, "decidido"],
    [T.agarra0, T.agarra0 + 0.15, "alcanza"], [T.tira0, T.tira0 + 0.12, "tira"], [T.afloja1, T.mira, "extranado"],
    [T.decide, T.decide + 0.12, "reto"], [T.pie1 - 0.05, T.tirazo0 + 0.1, "fuerza"], [T.pop, T.pop + 0.05, "vuela"],
    [T.choque, T.choque + 0.04, "golpe"], [T.choque + 0.3, T.sentado, "mareo"], [T.clava, T.clava + 0.1, "arriba"],
    [T.gira1 - 0.1, T.gira1 + 0.1, "aprueba"], [T.camara2, T.camara2 + 0.25, "sonrisa"]
  ];
  const PARP_G = [1.0, 2.9, 4.7, 6.0, 7.45, 11.3, 12.3, 13.6];
  const P0G = { torso: 0.02, cab: 0.03, cdy: 0, pel: 0 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    quieto: CuG({}),
    aguanta: CuG({ torso: 0.03, cab: 0.08, pel: 2 }),
    camara: CuG({ torso: -0.02, cab: -0.05 }),
    anda: CuG({ torso: 0.06, cab: 0.02 }),
    alcanza: CuG({ torso: 0.02, cab: -0.2 }),
    tira: CuG({ torso: -0.12, cab: -0.22 }),
    afloja: CuG({ torso: 0.04, cab: -0.12 }),
    reto: CuG({ torso: -0.02, cab: 0.0 }),
    tirazo: CuG({ torso: -0.22, cab: -0.26, cdy: 10 }),
    sentado: CuG({ torso: -0.04, cab: 0.06 }),
    arriba: CuG({ torso: -0.02, cab: -0.16 }),
    aprueba: CuG({ torso: 0.0, cab: 0.04 }),
    asiente: CuG({ torso: 0.03, cab: 0.2 }),
    camara2: CuG({ torso: -0.02, cab: -0.02 })
  };
  const GUION_G = [
    [T.risa, T.risa + 0.25, "aguanta"], [T.camara, T.camara + 0.25, "camara"], [T.sale, T.anda0 + 0.1, "anda"],
    [T.agarra0, T.agarra1, "alcanza"], [T.tira0, T.tira1, "tira"], [T.afloja0, T.afloja1, "afloja", salida], [T.decide, T.decide + 0.2, "reto"],
    [T.tirazo0, T.tirazo1, "tirazo"], [T.choque, T.sentado, "sentado"], [T.clava, T.clava + 0.12, "arriba"],
    [T.gira1 - 0.15, T.gira1 + 0.1, "aprueba"], [T.asiente0 + 0.05, T.asiente0 + 0.2, "asiente"], [T.asiente0 + 0.22, T.asiente0 + 0.37, "aprueba"],
    [T.asiente0 + 0.39, T.asiente0 + 0.54, "asiente"], [T.asiente0 + 0.56, T.asiente1, "aprueba"], [T.camara2, T.camara2 + 0.3, "camara2"]
  ];
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const LP = G.A.datos.piezas.pierna_cerca.largo;
  // pelvis de Guillermo en pantalla (x) mientras anda y tira
  function xG(t) {
    let x = lerp(XG0, XG1, tramo(t, T.anda0, T.anda1));
    x = lerp(x, XG2, tramo(t, T.tira0, T.tira1)); x = lerp(x, XG2 + 8, tramo(t, T.afloja0, T.afloja1, salida));
    x = lerp(x, XG2 - 10, tramo(t, T.tirazo0, T.tirazo1));
    return x;
  }
  // pasos: [t0, t1, pie, x final (pantalla)]
  const PASOS = [
    [T.anda0, T.anda0 + 0.26, "lejos", 345], [T.anda0 + 0.22, T.anda0 + 0.5, "cerca", 405], [T.anda0 + 0.46, T.anda0 + 0.74, "lejos", 492],
    [T.anda0 + 0.7, T.anda0 + 0.96, "cerca", XG1 - 30], [T.anda0 + 0.9, T.anda1 + 0.02, "lejos", XG1 + 34],
    [T.tira0 - 0.04, T.tira0 + 0.22, "cerca", XG2 - 42]
  ];
  function piesG(t) {
    const pies = { cerca: { x: XG0 - 30, y: 0 }, lejos: { x: XG0 + 32, y: 0 } };
    for (const [t0, t1, pie, x1] of PASOS) {
      if (t <= t0) break;
      const k = fase(t, t0, t1), x0 = pies[pie].x;
      pies[pie] = { x: lerp(x0, x1, suave(k)), y: 22 * Math.sin(Math.PI * k) };
    }
    return pies;
  }
  // el pie lejano en los riñones de Gabacho (pantalla): tobillo con la suela de lado contra la espalda
  function pieRinones(pB) {
    const q = pant(GB, pB, GB.tronco(pB)({ x: 118, y: 655 }));
    return { x: q.x - 26, y: q.y + 4 };
  }
  // vuelo: posición de la pelvis (pantalla), giro y piernas en el marco del cuerpo
  const PEL_ARRIBA = SUELO - (G.SUELO - G.PELVIS.y) * S;          // altura de la pelvis de pie (pantalla)
  const Y_SENT = SUELO - 32;                                       // pelvis sentado en el suelo
  function vueloG(t, x0) {
    const u = fase(t, T.pop, T.choque);
    const x = lerp(x0, XGW, salida(u * 0.85 + 0.15 * u * u));
    const y = lerp(PEL_ARRIBA, PEL_ARRIBA + 40, u) - 46 * Math.sin(Math.PI * u);
    const phi = -0.62 * Math.sin(Math.PI * Math.min(1, u * 1.15));
    return { x, y, phi };
  }
  // pierna en el marco del cuerpo: f = 0 abajo, + hacia delante; k = fracción del largo
  function piernaF(p, lado, f, k, punta) {
    const cad = G.tronco(p)(G.CADERA[lado]), L = LP * k;
    return { tob: { x: cad.x + Math.sin(f) * L, y: cad.y + Math.cos(f) * L }, ang: -f + punta };
  }
  const mezPie = (a, b, k) => ({ tob: { x: lerp(a.tob.x, b.tob.x, k), y: lerp(a.tob.y, b.tob.y, k) }, ang: lerp(a.ang, b.ang, k) });
  function poseG(t, pB) {
    const b = linea(GUION_G, CUER_G, "quieto", t);
    const respira = Math.sin(t * 2.1 + 0.4);
    const tiembla = campana(t, T.tira0 + 0.1, T.afloja0) * 0.5 + campana(t, T.tirazo0, T.pop) * (0.4 + 0.6 * tramo(t, T.tirazo0, T.tirazo1));
    const enPie = t < T.pop;
    let x = xG(t);
    const p = {
      x, suelo: SUELO, s: S, tirasLimpias: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 },
      torso: b.torso + 0.012 * tiembla * ruido(t * 40), torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.015 * tiembla * ruido(t * 47 + 3), dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } }
    };
    // andando: balanceo
    const andando = campana(t, T.anda0, T.anda1);
    p.pelvis.y -= 5 * Math.abs(Math.sin((t - T.anda0) * 11.5)) * andando;
    // se ríe por dentro (hombros)
    p.cabeza.ang += 0.03 * Math.sin(t * 22) * campana(t, T.risa + 0.1, T.camara);
    const aHojaX = sx => G.PELVIS.x + (sx - p.x) / S;
    if (enPie) {
      const pies = piesG(t);
      p.piernas.cerca = { tob: { x: aHojaX(pies.cerca.x), y: TOB_G - pies.cerca.y / S }, ang: 0 };
      p.piernas.lejos = { tob: { x: aHojaX(pies.lejos.x), y: TOB_G - pies.lejos.y / S }, ang: 0 };
      // el pie lejano sube a los riñones de Gabacho
      const kp = tramo(t, T.pie0, T.pie1);
      if (kp > 0) {
        const r = pieRinones(pB), ri = { x: aHojaX(r.x), y: G.SUELO + (r.y - SUELO) / S };
        const sube = { x: lerp(p.piernas.lejos.tob.x, ri.x, kp), y: lerp(p.piernas.lejos.tob.y, ri.y, kp) - 140 * Math.sin(Math.PI * kp) };
        p.piernas.lejos = { tob: sube, ang: lerp(0, -1.45, kp) };
      }
    } else {
      // vuela hacia atrás, choca con el pilar y resbala hasta el suelo
      const x0 = xG(T.pop - 0.001);
      const v = vueloG(t, x0);
      const desliza = tramo(t, T.choque + 0.06, T.sentado, entrada);
      const yP = t < T.choque ? v.y : lerp(PEL_ARRIBA + 40, Y_SENT, desliza);
      p.x = t < T.choque ? v.x : XGW;
      p.pelvis = { x: G.PELVIS.x, y: G.SUELO + (yP - SUELO) / S };
      // piernas: en el aire, hacia delante; luego estiradas en el suelo con la punta arriba
      const aire = mezPie(piernaF(p, "lejos", 1.35, 0.98, -0.2), piernaF(p, "lejos", 1.6, 0.96, -0.3), clamp(fase(t, T.pop, T.choque)));
      const aireC = mezPie(piernaF(p, "cerca", 0.5, 0.97, -0.1), piernaF(p, "cerca", 1.45, 0.97, -0.2), tramo(t, T.pop, T.choque));
      const suelo = { tob: { x: aHojaX(XGW + 150), y: TOB_G - 2 / S }, ang: -1.25 }, sueloC = { tob: { x: aHojaX(XGW + 128), y: TOB_G }, ang: -1.1 };
      const ks = tramo(t, T.choque + 0.1, T.sentado + 0.05);
      p.piernas.lejos = mezPie(aire, suelo, ks);
      p.piernas.cerca = mezPie(aireC, sueloC, ks);
      // patalea un poco al resbalar
      p.piernas.lejos.tob.y -= 30 * campana(t, T.choque, T.choque + 0.3);
      // aplastado contra el pilar
      const ap = campana(t, T.choque - 0.02, T.choque + 0.22);
      p.torsoEsc = { x: 1 - 0.12 * ap, y: 1 + 0.06 * ap };
      p.cabeza.ang += 0.25 * ap;
      // mareado: la cabeza da vueltecitas; con el púazo, respingo
      const mar = campana(t, T.choque + 0.2, T.clava + 0.1);
      p.cabeza.ang += 0.09 * Math.sin(t * 6.5) * mar; p.cabeza.dx = 10 * Math.cos(t * 6.5) * mar;
      if (t > T.clava) { const u = t - T.clava; p.cabeza.ang += 0.18 * Math.sin(u * 22) * Math.exp(-u * 8); p.cabeza.dy += -18 * Math.exp(-u * 10) * (u < 0.4 ? 1 : 0); }
      const ph = t < T.choque ? v.phi * (1 - tramo(t, T.choque - 0.1, T.choque)) : 0;
      ponGiro(G, p, ph, 0, 0);
      // la pelvis está ya donde toca en pantalla: el giro es alrededor de ella
    }
    // cara
    let e = linea(GUION_CG, CG, "mira", t);
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.rojo = 0.85 * tramo(t, T.tirazo0, T.tirazo1 - 0.3) * (1 - tramo(t, T.pop, T.pop + 0.4)) + 0.25 * campana(t, T.tira0, T.afloja0);
    p.sudor = 0.7 * campana(t, T.tirazo0, T.choque);
    p.enfado = 0.8 * campana(t, T.decide, T.pop);
    // manos
    const res = resolutor(G, p, "cerca"), resL = resolutor(G, p, "lejos");
    const agarre = () => { const A = afCab(GB, pB), ph = puaGB(t); return apl(mul(A, afSitio(ph.sit, ph.fuera, ph.vib)), AGARRE); };
    const PUNO = D5(0.55, 0.4, 0.35, 0.3, 0.3);
    const COLGANDO_C = { tr: { x: 120, y: 690 }, mu: -1.6, dedos: D(0.4, 0.5, 0.5, 0.5), dobla: -1 };
    const COLGANDO_L = { tr: { x: 380, y: 690 }, mu: -1.6, dedos: D(0.4, 0.5, 0.5, 0.5), dobla: 1 };
    const PISTA_GL = [
      [0, 0, { bols: true }],
      [T.sale, T.sale + 0.25, { bols: true, sale: true, dedos: D(0.5, 0.5, 0.5, 0.5) }],
      [T.sale + 0.25, T.anda0 + 0.1, COLGANDO_L],
      [T.agarra0, T.agarra1, t < T.pop ? { scr: agarre, mu: 2.6, dedos: PUNO, dobla: 1 } : { tr: agarreLocal(), mu: 2.6, dedos: PUNO, dobla: 1 }],
      [T.pop + 0.06, T.pop + 0.18, { tr: { x: 520, y: 240 }, mu: 1.9, dedos: D(1, 1, 1, 1), dobla: 1 }, salida],
      [T.choque, T.choque + 0.2, { tr: { x: 470, y: 560 }, mu: -2.0, dedos: D(1, 1, 1, 1), dobla: 1 }],
      [T.choque + 0.3, T.sentado + 0.2, { tr: { x: 400, y: 650 }, mu: -1.9, dedos: D(0.5, 0.6, 0.6, 0.6), dobla: 1 }],
      // pulgar arriba (antebrazo horizontal)
      [T.asiente0, T.asiente0 + 0.2, { tr: { x: 548, y: 478 }, mu: Math.PI, dedos: D5(1, 0, 0, 0, 0), dobla: 1 }, salida],
      [T.camara2 + 0.3, T.camara2 + 0.55, { tr: { x: 400, y: 650 }, mu: -1.9, dedos: D(0.5, 0.6, 0.6, 0.6), dobla: 1 }]
    ];
    const PISTA_GC = [
      [0, 0, { bols: true }],
      [T.sale, T.sale + 0.25, { bols: true, sale: true, dedos: D(0.5, 0.5, 0.5, 0.5) }],
      [T.sale + 0.25, T.anda0 + 0.1, COLGANDO_C],
      // primer tirón: puño de esfuerzo
      [T.tira0, T.tira0 + 0.2, { tr: { x: 150, y: 560 }, mu: -1.2, dedos: D(0, 0, 0, 0), dobla: -1 }],
      [T.afloja0, T.afloja1, COLGANDO_C],
      // con el pie arriba: el brazo atrás para no caerse
      [T.pie0, T.pie1, { tr: { x: -150, y: 300 }, mu: 0.6, dedos: D(1, 1, 1, 1), dobla: -1 }],
      [T.pop + 0.02, T.pop + 0.15, { tr: { x: -100, y: 120 }, mu: 1.2, dedos: D(1, 1, 1, 1), dobla: -1 }, salida],
      [T.choque, T.choque + 0.2, { tr: { x: 20, y: 560 }, mu: -1.0, dedos: D(1, 1, 1, 1), dobla: -1 }],
      [T.choque + 0.3, T.sentado + 0.2, { tr: { x: 112, y: 668 }, mu: -1.4, dedos: D(0.5, 0.6, 0.6, 0.6), dobla: -1 }]
    ];
    const L = pista(PISTA_GL, t, resL), C = pista(PISTA_GC, t, res);
    // al andar, los brazos se balancean
    if (andando > 0) { const sw = Math.sin((t - T.anda0) * 11.5) * 40 * andando; L.x += sw; C.x -= sw; }
    // el brazo de atrás hace molinetes para no caerse
    const mol = campana(t, T.pie1 - 0.1, T.pop);
    if (mol > 0) { C.x += 50 * mol * Math.cos(t * 13); C.y += 60 * mol * Math.sin(t * 13); }
    if (tiembla > 0) { const k = tiembla * 1.6 / S; L.x += k * ruido(t * 37 + 1); L.y += k * ruido(t * 41 + 7); }
    // al asentir con el pulgar arriba, un toquecito
    const pg = campana(t, T.asiente0 + 0.2, T.camara2);
    L.y -= pg * 8 * Math.max(0, Math.sin((t - T.asiente0) * 12));
    p.manoCerca = mano(C); p.manoLejos = mano(L);
    p.capaCabeza = () => {};
    return p;
  }

  // dónde tenía Guillermo el puño (en su tronco) al saltar la púa
  function invTronco(R, p, q) {
    const c = Math.cos(-p.torso), sn = Math.sin(-p.torso), dx = q.x - p.pelvis.x, dy = q.y - p.pelvis.y;
    return { x: R.PELVIS.x + (dx * c - dy * sn) / p.torsoEsc.x, y: R.PELVIS.y + (dx * sn + dy * c) / p.torsoEsc.y };
  }
  function agarreLocal() {
    return cache("agl", () => { const t0 = T.pop - 0.002, b = poseB(t0, true), g = poseG(t0, b); return invTronco(G, g, { x: g.manoLejos.x, y: g.manoLejos.y }); });
  }

  /* ---------- la púa en el aire: del puño de Guillermo, bumerán y a sus pinchos ---------- */
  // ruta del bumerán (pantalla): de donde la suelta, arriba a la izquierda, por todo lo alto y de vuelta
  const SUELTA = T.pop + 0.08;
  function puaVuelo(t) {
    const P0 = cache("p0", () => { const b = poseB(SUELTA, true), gg = poseG(SUELTA, b); return apl(puaManoAF(gg), { x: 0, y: 0 }); });
    const P5 = cache("p5", () => { const b = poseB(T.clava, true), gg = poseG(T.clava, b); return apl(mul(afCab(G, gg), afSitio(SITIO_G, 12)), { x: 0, y: 0 }); });
    const pts = [P0, { x: 300, y: 110 }, { x: 470, y: 48 }, { x: 700, y: 92 }, { x: 640, y: 210 }, { x: 430, y: 214 }, P5];
    const u = suave(fase(t, SUELTA, T.clava)) * 0.55 + fase(t, SUELTA, T.clava) * 0.45;
    const n = pts.length - 1, f = Math.min(n - 1e-6, u * n), i = Math.floor(f), k = f - i;
    const P = j => pts[Math.max(0, Math.min(n, j))];
    const cr = (a, b, c, d, k) => 0.5 * (2 * b + (-a + c) * k + (2 * a - 5 * b + 4 * c - d) * k * k + (-a + 3 * b - 3 * c + d) * k * k * k);
    const c = { x: cr(P(i - 1).x, P(i).x, P(i + 1).x, P(i + 2).x, k), y: cr(P(i - 1).y, P(i).y, P(i + 1).y, P(i + 2).y, k) };
    return { c, u };
  }
  // la púa en el puño de Guillermo (pantalla)
  function puaManoAF(g) {
    const m = g.manoLejos, cm = pant(G, g, { x: m.x, y: m.y });
    const angM = (g.gr ? g.gr.phi : 0) + (m.ang || 0) + m.mu - Math.PI / 2 - 0.5;
    return mul(mul(mul(Tm(cm.x, cm.y), Rm(angM + Math.PI)), Sm(TAM, TAM)), Tm(-AGARRE.x, -AGARRE.y));
  }
  const memo = new Map();
  const cache = (k, f) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };

  // las dos posturas del fotograma y las púas
  let ULT = { t: -1, v: null };
  function poses(t) {
    if (ULT.t === t) return ULT.v;
    const b = poseB(t), g = poseG(t, b);
    const v = { b, g };
    // púa roja: en la cabeza de Gabacho, en el puño de Guillermo, en el aire o en los pinchos
    const AB = afCab(GB, b);
    const ph = puaGB(t);
    if (t < T.pop) v.roja = { capa: "B", A: mul(AB, afSitio(ph.sit, ph.fuera, ph.vib)), fuera: ph.fuera, pelo: peloRizo, rizos: ph.alza };
    // en el puño de Guillermo justo al saltar
    v.puaMano = puaManoAF(g);
    if (t >= T.pop && t < SUELTA) v.roja = { capa: "aire", A: v.puaMano, fuera: 24 };
    else if (t >= SUELTA && t < T.clava) {
      const pv = puaVuelo(t), giro = -(t - SUELTA) * 19;
      const fin = tramo(t, T.clava - 0.12, T.clava);
      const A1 = mul(mul(Tm(pv.c.x, pv.c.y), Rm(giro)), Sm(TAM, TAM));
      const A2 = mul(afCab(G, g), afSitio(SITIO_G, 12));
      v.roja = { capa: "aire", A: fin > 0 ? lerpAF(A1, A2, fin) : A1, fuera: 24 };
    } else if (t >= T.clava) {
      const u = t - T.clava, vib = 0.4 * Math.sin(u * 42) * Math.exp(-u * 6);
      const fu = lerp(12, 9, tramo(t, T.clava, T.clava + 0.1));
      v.roja = { capa: "G", A: mul(afCab(G, g), afSitio(SITIO_G, fu, vib)), fuera: fu, pelo: peloPincho };
    }
    // la de repuesto (lila): del bolsillo a la cabeza de Gabacho
    if (t > T.bols1 - 0.04) {
      // en la mano hasta que llega a la cabeza (girando poco a poco hacia la postura de la cabeza); luego, clavada
      const mb = b.manoCerca, cmb = pant(GB, b, { x: mb.x, y: mb.y }), fl = b.espejo ? -1 : 1;
      const fu = lerp(20, ATASCO, tramo(t, T.pone0 + 0.3, T.pone1 - 0.05));
      const enCab = mul(AB, afSitio(SITIO.B, fu));
      const k = tramo(t, T.pone0, T.pone0 + 0.3);
      const thM = (b.gr ? b.gr.phi : 0) + 0.15 * fl, thC = Math.atan2(enCab.b, enCab.a);
      const th = thM + Math.atan2(Math.sin(thC - thM), Math.cos(thC - thM)) * k;
      const enMano = mul(mul(mul(Tm(cmb.x, cmb.y), Rm(th)), Sm(TAM, TAM)), Tm(-AGARRE.x, -AGARRE.y));
      v.lila = k < 1 ? { capa: "manoB", A: enMano, fuera: 24 } : { capa: "B", A: enCab, fuera: fu, pelo: peloRizo };
    }
    ULT = { t, v };
    return v;
  }
  function dibujaPua(g, P, col) {
    if (!MATRIZ || !P) return;
    g.save(); g.setTransform(MATRIZ); g.transform(P.A.a, P.A.b, P.A.c, P.A.d, P.A.e, P.A.f);
    dibPeine(g, col, P.fuera, P.pelo, P.rizos || 0);
    g.restore();
  }
  // el hueco del rizo (y pelos de punta) donde estaba la púa
  function dibHueco(g, AB, t) {
    const k = tramo(t, T.pop, T.pop + 0.08); if (k <= 0 || !MATRIZ) return;
    const sit = SITIO.C, A = mul(AB, afSitio(sit, 0));
    g.save(); g.setTransform(MATRIZ); g.transform(A.a, A.b, A.c, A.d, A.e, A.f);
    g.globalAlpha = k;
    g.fillStyle = "rgba(28,12,4,0.85)"; g.beginPath(); g.ellipse(0, 7, 9, 5.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(60,28,10,0.9)"; g.beginPath(); g.ellipse(0, 9, 6, 3, 0, 0, Math.PI * 2); g.fill();
    // pelos encrespados alrededor
    g.strokeStyle = "#4a240f"; g.lineWidth = 1.3; g.lineCap = "round";
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI * 0.95 + i * 0.32, r = 9 + 2 * hash(i + 3), sh = 1 + 0.25 * Math.sin(t * 6 + i) * Math.exp(-Math.max(0, t - T.pop) * 2);
      const x0 = Math.cos(a) * 8, y0 = 7 + Math.sin(a) * 5, x1 = Math.cos(a) * r * 1.5 * sh, y1 = 7 + Math.sin(a) * r * sh;
      g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + 3, (y0 + y1) / 2 - 3, x1, y1); g.stroke();
      g.beginPath(); g.arc(x1, y1, 1.6, 0, Math.PI * 1.6); g.stroke();
    }
    g.restore();
  }
  // rizos estirados entre el pelo y la púa mientras tiran de ella
  function dibTension(g, AB, t, ph) {
    const k = clamp(ph.fuera - ATASCO, 0, 9) / 9; if (k <= 0.02 || t >= T.pop || t < T.p3 + 0.2 || !MATRIZ) return;
    const A = mul(AB, afSitio(ph.sit, 0)), B = mul(AB, afSitio(ph.sit, ph.fuera, ph.vib));
    const a = apl(A, { x: 0, y: 6 }), bq = apl(B, { x: 0, y: 2 });
    g.save(); g.setTransform(MATRIZ); g.lineCap = "round";
    for (let i = -3; i <= 3; i++) {
      const w = i * 2.6, ox = -(bq.y - a.y), oy = bq.x - a.x, l = Math.hypot(ox, oy) || 1;
      const nx = ox / l, ny = oy / l;
      const x0 = a.x + nx * w * 1.8, y0 = a.y + ny * w * 1.8, x1 = bq.x + nx * w, y1 = bq.y + ny * w;
      g.strokeStyle = i & 1 ? "#5a2f17" : "#3a1c0c"; g.lineWidth = 2.2;
      g.beginPath(); g.moveTo(x0, y0);
      for (let j = 1; j <= 6; j++) { const f = j / 6; g.lineTo(lerp(x0, x1, f) + nx * 2.2 * Math.sin(j * 2.6 + i), lerp(y0, y1, f) + ny * 2.2 * Math.sin(j * 2.6 + i)); }
      g.stroke();
    }
    g.restore();
  }

  /* ================= decorado ================= */
  let fondo = null;
  const YZ = 470;                                   // pie de la pared
  const ESPEJO = { x: 893, y: 214, r: 80 };
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60); g.lineJoin = "round"; g.lineCap = "round";
    // pared verde botella con filete dorado
    const pa = g.createLinearGradient(0, -60, 0, 330); pa.addColorStop(0, "#1f4a43"); pa.addColorStop(1, "#2c6158");
    g.fillStyle = pa; g.fillRect(-40, -60, W + 80, 400);
    g.strokeStyle = "rgba(255,255,255,0.035)"; g.lineWidth = 14;
    for (let x = -40; x < W + 40; x += 46) { g.beginPath(); g.moveTo(x, -60); g.lineTo(x, 330); g.stroke(); }
    g.strokeStyle = "#c9a24e"; g.lineWidth = 2; g.strokeRect(190, 30, 520, 250);
    g.strokeStyle = "rgba(201,162,78,0.45)"; g.lineWidth = 1; g.strokeRect(198, 38, 504, 234);
    // luz cálida de la lámpara
    const lz = g.createRadialGradient(640, 40, 10, 640, 140, 420); lz.addColorStop(0, "rgba(255,214,150,0.45)"); lz.addColorStop(1, "rgba(255,214,150,0)");
    g.fillStyle = lz; g.fillRect(-40, -60, W + 80, 560);
    // zócalo de azulejos blancos (de metro) con su moldura
    azulejos(g, -40, 330, W + 80, YZ - 330, 30, 14, "#eef0ea", "#c9ccc4");
    g.fillStyle = "#6b4426"; g.fillRect(-40, 322, W + 80, 10); g.fillStyle = "rgba(255,230,190,0.35)"; g.fillRect(-40, 322, W + 80, 2);
    g.fillStyle = "#2a1a10"; g.fillRect(-40, 332, W + 80, 2);
    g.fillStyle = "#3a3b40"; g.fillRect(-40, YZ - 8, W + 80, 10);
    // suelo de damero
    damero(g);
    reloj(g, 548, 92);
    lampara(g, 640, 40);
    tocador(g);
    espejo(g);
    pilar(g);
    // viñeta
    const vi = g.createRadialGradient(560, 300, 300, 512, 300, 760); vi.addColorStop(0, "rgba(0,0,0,0)"); vi.addColorStop(1, "rgba(5,15,12,0.5)");
    g.fillStyle = vi; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }
  function azulejos(g, x, y, w, h, aw, ah, col, junta) {
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    g.fillStyle = junta; g.fillRect(x, y, w, h);
    let fila = 0;
    for (let yy = y; yy < y + h; yy += ah, fila++) {
      for (let xx = x - (fila % 2) * aw / 2; xx < x + w; xx += aw) {
        const n = hash(Math.floor(xx * 7 + yy * 13));
        g.fillStyle = col; g.fillRect(xx + 1, yy + 1, aw - 2, ah - 2);
        g.fillStyle = `rgba(255,255,255,${0.25 + 0.3 * n})`; g.fillRect(xx + 2, yy + 2, aw - 4, 2);
        g.fillStyle = "rgba(120,130,120,0.12)"; g.fillRect(xx + 1, yy + ah - 4, aw - 2, 3);
      }
    }
    g.restore();
  }
  function damero(g) {
    g.save();
    const y0 = YZ + 2, y1 = H + 60, vx = 560, vy = 120;
    g.fillStyle = "#e9e4d8"; g.fillRect(-40, y0, W + 80, y1 - y0);
    const filas = [y0];
    let yy = y0, hh = 9; while (yy < y1) { yy += hh; hh *= 1.32; filas.push(yy); }
    const col = 46;
    for (let i = 0; i < filas.length - 1; i++) {
      const ya = filas[i], yb = filas[i + 1];
      for (let j = -14; j < 14; j++) {
        if ((i + j) & 1) continue;
        const xa = x => vx + (x - vx) * (ya - vy) / (y0 - vy), xb = x => vx + (x - vx) * (yb - vy) / (y0 - vy);
        const X0 = vx + j * col, X1 = vx + (j + 1) * col;
        g.fillStyle = "#24262b"; g.beginPath(); g.moveTo(xa(X0), ya); g.lineTo(xa(X1), ya); g.lineTo(xb(X1), yb); g.lineTo(xb(X0), yb); g.closePath(); g.fill();
      }
    }
    const br = g.createLinearGradient(0, y0, 0, y1); br.addColorStop(0, "rgba(255,240,210,0.18)"); br.addColorStop(1, "rgba(0,0,0,0.18)");
    g.fillStyle = br; g.fillRect(-40, y0, W + 80, y1 - y0);
    g.restore();
  }
  function reloj(g, x, y) {
    g.save();
    g.fillStyle = "rgba(0,0,0,0.25)"; g.beginPath(); g.arc(x + 3, y + 4, 33, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#b8893a"; g.beginPath(); g.arc(x, y, 33, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#f6f0e2"; g.beginPath(); g.arc(x, y, 27, 0, Math.PI * 2); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 33, 0, Math.PI * 2); g.stroke();
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, r0 = i % 3 ? 22 : 19; g.lineWidth = i % 3 ? 1.4 : 2.6;
      g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * 25, y + Math.sin(a) * 25); g.stroke(); }
    g.restore();
  }
  function lampara(g, x, y) {
    g.save();
    g.strokeStyle = "#141414"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, -60); g.lineTo(x, y - 18); g.stroke();
    const h = g.createRadialGradient(x, y + 10, 4, x, y + 10, 70); h.addColorStop(0, "rgba(255,230,170,0.8)"); h.addColorStop(1, "rgba(255,220,150,0)");
    g.fillStyle = h; g.beginPath(); g.arc(x, y + 10, 70, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#1d3a35"; g.beginPath(); g.moveTo(x - 10, y - 20); g.lineTo(x + 10, y - 20); g.lineTo(x + 36, y + 8); g.lineTo(x - 36, y + 8); g.closePath(); g.fill();
    g.strokeStyle = "#c9a24e"; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#fff3c8"; g.beginPath(); g.ellipse(x, y + 9, 22, 5, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function tocador(g) {
    g.save();
    const x0 = 772, x1 = W + 40, yt = 372;
    // mueble de madera oscura
    const mu = g.createLinearGradient(0, yt, 0, YZ + 40); mu.addColorStop(0, "#5a3520"); mu.addColorStop(1, "#3c2213");
    g.fillStyle = mu; g.fillRect(x0 + 6, yt + 12, x1 - x0, YZ + 40 - yt);
    g.strokeStyle = "rgba(0,0,0,0.45)"; g.lineWidth = 2;
    for (const xx of [x0 + 20, x0 + 132]) { g.strokeRect(xx, yt + 26, 100, 112); g.fillStyle = "#c9a24e"; g.beginPath(); g.arc(xx + 88, yt + 82, 4, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "rgba(255,220,180,0.12)"; g.fillRect(x0 + 6, yt + 12, 6, YZ + 40 - yt);
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(x0 + 6, YZ + 30, x1 - x0, 10);
    // encimera de mármol
    const ma = g.createLinearGradient(0, yt - 8, 0, yt + 14); ma.addColorStop(0, "#f7f3ec"); ma.addColorStop(1, "#d9d2c6");
    g.fillStyle = ma; g.fillRect(x0, yt - 6, x1 - x0, 18);
    g.strokeStyle = "rgba(140,130,120,0.4)"; g.lineWidth = 1;
    for (let i = 0; i < 6; i++) { const xx = x0 + 20 + i * 45; g.beginPath(); g.moveTo(xx, yt - 4); g.quadraticCurveTo(xx + 14, yt + 2, xx + 30, yt + 10); g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x0, yt - 6, x1 - x0, 18);
    // lavabo y grifo
    g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(918, yt - 6, 46, 7, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = "#c9ced6"; g.beginPath(); g.ellipse(918, yt - 5, 34, 4, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#9aa2ad"; g.lineWidth = 6; g.beginPath(); g.moveTo(918, yt - 8); g.lineTo(918, yt - 34); g.quadraticCurveTo(918, yt - 42, 928, yt - 42); g.lineTo(940, yt - 42); g.stroke();
    g.strokeStyle = "#e8edf3"; g.lineWidth = 2; g.beginPath(); g.moveTo(916, yt - 10); g.lineTo(916, yt - 34); g.stroke();
    g.fillStyle = "#9aa2ad"; g.fillRect(906, yt - 30, 24, 5);
    // bote azul de los peines (sin letras)
    const bx = 806, by = yt - 6;
    g.fillStyle = "rgba(70,150,230,0.75)"; g.beginPath(); g.moveTo(bx - 15, by); g.lineTo(bx - 15, by - 52); g.lineTo(bx + 15, by - 52); g.lineTo(bx + 15, by); g.closePath(); g.fill();
    g.strokeStyle = "#22305a"; g.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) { const xx = bx - 9 + i * 6; g.beginPath(); g.moveTo(xx, by - 8); g.lineTo(xx + 1, by - 64 - 4 * (i & 1)); g.stroke();
      g.fillStyle = "#151515"; g.fillRect(xx - 1, by - 66 - 4 * (i & 1), 3, 14); }
    g.fillStyle = "#1a1a1a"; g.fillRect(bx - 17, by - 58, 34, 7);
    g.fillStyle = "rgba(255,255,255,0.45)"; g.fillRect(bx - 12, by - 48, 4, 40);
    g.strokeStyle = TINTA; g.lineWidth = 1.5; g.strokeRect(bx - 15, by - 52, 30, 52);
    // frascos sin etiquetas
    frasco(g, 852, yt - 6, 12, 40, "#c8822a");
    frasco(g, 990, yt - 6, 11, 50, "#3f8a54");
    frasco(g, 1010, yt - 6, 9, 32, "#d9d4f0");
    g.restore();
  }
  function frasco(g, x, y, r, h, col) {
    g.fillStyle = col; g.beginPath(); g.moveTo(x - r, y); g.lineTo(x - r, y - h + r); g.quadraticCurveTo(x - r, y - h, x - r * 0.4, y - h - 4); g.lineTo(x + r * 0.4, y - h - 4);
    g.quadraticCurveTo(x + r, y - h, x + r, y - h + r); g.lineTo(x + r, y); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = "#1c1c1c"; g.fillRect(x - r * 0.45, y - h - 12, r * 0.9, 9);
    g.fillStyle = "rgba(255,255,255,0.45)"; g.fillRect(x - r * 0.6, y - h + 6, 3, h - 12);
  }
  function espejo(g) {
    const { x, y, r } = ESPEJO;
    g.save();
    g.fillStyle = "rgba(0,0,0,0.3)"; g.beginPath(); g.arc(x + 5, y + 7, r + 10, 0, Math.PI * 2); g.fill();
    const mar = g.createLinearGradient(x - r, y - r, x + r, y + r); mar.addColorStop(0, "#f2d488"); mar.addColorStop(0.5, "#b8893a"); mar.addColorStop(1, "#7a5a22");
    g.fillStyle = mar; g.beginPath(); g.arc(x, y, r + 10, 0, Math.PI * 2); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    const cr = g.createLinearGradient(x - r, y - r, x + r, y + r); cr.addColorStop(0, "#cfe3e2"); cr.addColorStop(0.55, "#8fb3b0"); cr.addColorStop(1, "#5d827f");
    g.fillStyle = cr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.clip();
    // reflejo: la pared de enfrente y la lámpara, borrosos
    g.fillStyle = "rgba(40,90,80,0.35)"; g.fillRect(x - r, y - r, 2 * r, r * 1.2);
    g.fillStyle = "rgba(240,240,232,0.35)"; g.fillRect(x - r, y + r * 0.35, 2 * r, r);
    g.fillStyle = "rgba(255,240,200,0.5)"; g.beginPath(); g.ellipse(x - 30, y - 40, 14, 5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,0.55)";
    g.beginPath(); g.moveTo(x - r, y - 10); g.lineTo(x - 10, y - r); g.lineTo(x + 8, y - r); g.lineTo(x - r, y + 8); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(x - r, y + 22); g.lineTo(x + 22, y - r); g.lineTo(x + 30, y - r); g.lineTo(x - r, y + 30); g.closePath(); g.fill();
    g.restore();
    g.strokeStyle = "rgba(255,240,200,0.7)"; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r + 6, Math.PI * 1.05, Math.PI * 1.55); g.stroke();
    g.restore();
  }
  function pilar(g) {
    g.save();
    const x0 = 34, x1 = PILAR - 12;
    g.fillStyle = "rgba(0,0,0,0.3)"; g.fillRect(x1, -60, 26, YZ + 60 + 20);
    azulejos(g, x0, -60, x1 - x0, YZ + 80, 28, 14, "#f3f4ef", "#c6c9c1");
    // canto en perspectiva
    azulejos(g, x1, -60, 12, YZ + 80, 12, 14, "#d8dbd3", "#aeb2aa");
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x1, -60); g.lineTo(x1, YZ + 20); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.moveTo(PILAR, -60); g.lineTo(PILAR, YZ + 20); g.stroke();
    // rodapié
    g.fillStyle = "#2c2d31"; g.fillRect(x0, YZ + 4, PILAR - x0, 14);
    // percha con toalla de rayas
    g.fillStyle = "#9aa2ad"; g.beginPath(); g.arc(88, 236, 5, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // toalla (se mueve con el golpe)
  function toalla(g, t) {
    const u = Math.max(0, t - T.choque), bal = t > T.choque ? 0.35 * Math.sin(u * 9) * Math.exp(-u * 2.5) : 0;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // barra cromada con sus soportes
    g.fillStyle = "#7d848c"; g.fillRect(56, 226, 5, 12); g.fillRect(115, 226, 5, 12);
    g.strokeStyle = "#c8ced5"; g.lineWidth = 5; g.beginPath(); g.moveTo(56, 232); g.lineTo(120, 232); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 1; g.beginPath(); g.moveTo(56, 229); g.lineTo(120, 229); g.moveTo(56, 235); g.lineTo(120, 235); g.stroke();
    g.translate(88, 232); g.rotate(bal * 0.6);
    // hoja de atrás (más corta) y la de delante, con rayas rojas y flecos
    const hoja = (x0, x1, h, sombra) => {
      g.fillStyle = sombra ? "#d6ccb8" : "#efe7d6";
      g.beginPath(); g.moveTo(x0, 0); g.lineTo(x1, 0); g.lineTo(x1 + 2, h); g.quadraticCurveTo((x0 + x1) / 2, h + 5, x0 - 2, h); g.closePath(); g.fill();
      g.save(); g.clip(); g.fillStyle = "#b8322a"; g.fillRect(x0 - 4, h - 22, x1 - x0 + 8, 6); g.fillRect(x0 - 4, h - 12, x1 - x0 + 8, 3);
      g.fillStyle = "rgba(0,0,0,0.1)"; for (let x = x0 + 4; x < x1; x += 7) g.fillRect(x, 0, 2, h + 6); g.restore();
      g.strokeStyle = TINTA; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x1, 0); g.lineTo(x1 + 2, h); g.quadraticCurveTo((x0 + x1) / 2, h + 5, x0 - 2, h); g.closePath(); g.stroke();
      g.strokeStyle = "#e9dfca"; g.lineWidth = 1.2; for (let x = x0; x <= x1 + 2; x += 3.5) { g.beginPath(); g.moveTo(x, h + 2); g.lineTo(x + 0.5, h + 7); g.stroke(); }
    };
    hoja(-26, 6, 70, true);
    hoja(-14, 26, 92, false);
    g.fillStyle = "rgba(255,255,255,0.5)"; g.fillRect(-12, 2, 36, 3);
    g.restore();
  }
  // grieta del azulejo (se queda)
  const GRIETA = { x: PILAR, y: 312 };
  function grieta(g, t) {
    const k = tramo(t, T.choque, T.choque + 0.06); if (k <= 0) return;
    g.save(); g.globalAlpha = k;
    g.strokeStyle = "#2a2a28"; g.lineWidth = 1.6; g.lineCap = "round";
    const ramas = [[-1, -0.6, 52], [-1, 0.1, 64], [-1, 0.7, 46], [-0.6, -1, 38], [-0.5, 1, 40]];
    ramas.forEach(([dx, dy, L], i) => {
      g.beginPath(); g.moveTo(GRIETA.x, GRIETA.y);
      let x = GRIETA.x, y = GRIETA.y; const n = 5;
      for (let j = 1; j <= n; j++) { const f = j / n; x = GRIETA.x + dx * L * f + 5 * (hash(i * 9 + j) - 0.5); y = GRIETA.y + dy * L * f + 6 * (hash(i * 7 + j + 3) - 0.5); g.lineTo(x, y); }
      g.stroke();
    });
    // trozo de azulejo que falta
    g.fillStyle = "#9b9e96"; g.beginPath(); g.moveTo(PILAR, 300); g.lineTo(PILAR - 16, 306); g.lineTo(PILAR - 10, 322); g.lineTo(PILAR, 326); g.closePath(); g.fill();
    g.strokeStyle = "#3a3a38"; g.lineWidth = 1.2; g.stroke();
    g.restore();
    // el trozo cae al suelo y se queda
    const u = fase(t, T.choque + 0.05, T.choque + 0.6);
    const yf = lerp(312, 552, u * u), xf = PILAR - 6 + 30 * u, rt = u * 5;
    g.save(); g.translate(xf, yf); g.rotate(rt);
    g.fillStyle = "#f3f4ef"; g.beginPath(); g.moveTo(0, -12); g.lineTo(-12, -6); g.lineTo(-6, 10); g.lineTo(4, 12); g.closePath(); g.fill();
    g.strokeStyle = "#5a5a56"; g.lineWidth = 1.2; g.stroke();
    g.restore();
  }

  /* ---------- taburete ---------- */
  function taburete(g) {
    const { x, asiento: ya, base: yb, r } = TAB;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // base redonda y columna cromada con el aro para los pies
    g.fillStyle = "#8d949c"; g.beginPath(); g.ellipse(x, yb, 44, 7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#c8ced5"; g.beginPath(); g.ellipse(x, yb - 2, 40, 5, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.5; g.beginPath(); g.ellipse(x, yb, 44, 7, 0, 0, Math.PI * 2); g.stroke();
    const col = g.createLinearGradient(x - 7, 0, x + 7, 0); col.addColorStop(0, "#7d848c"); col.addColorStop(0.4, "#eef2f6"); col.addColorStop(1, "#6e757d");
    g.fillStyle = col; g.fillRect(x - 6, ya + 10, 12, yb - ya - 12); g.strokeRect(x - 6, ya + 10, 12, yb - ya - 12);
    g.strokeStyle = "#aeb5bd"; g.lineWidth = 4; g.beginPath(); g.ellipse(x, ya + 54, 34, 6, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 1.2; g.beginPath(); g.ellipse(x, ya + 54, 36, 8, 0, 0, Math.PI * 2); g.stroke();
    // asiento acolchado rojo con su ribete
    g.fillStyle = "#7e1d18"; g.beginPath(); g.moveTo(x - r, ya); g.lineTo(x - r + 2, ya + 12); g.quadraticCurveTo(x, ya + 20, x + r - 2, ya + 12); g.lineTo(x + r, ya); g.closePath(); g.fill();
    const se = g.createLinearGradient(0, ya - 10, 0, ya + 6); se.addColorStop(0, "#e14b3c"); se.addColorStop(1, "#a92a20");
    g.fillStyle = se; g.beginPath(); g.ellipse(x, ya, r, 10, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.6; g.stroke();
    g.beginPath(); g.moveTo(x - r, ya); g.lineTo(x - r + 2, ya + 12); g.quadraticCurveTo(x, ya + 20, x + r - 2, ya + 12); g.lineTo(x + r, ya); g.stroke();
    g.strokeStyle = "#f0c0a0"; g.lineWidth = 1; g.beginPath(); g.ellipse(x - 8, ya - 3, r * 0.6, 4, 0, Math.PI * 1.05, Math.PI * 1.7); g.stroke();
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrella(g, x, y, r, a, col = "#fff2a8") {
    g.save(); g.globalAlpha = a; g.fillStyle = col; g.beginPath();
    for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.4 : r, an = i * Math.PI / 5 - Math.PI / 2; g.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
    g.closePath(); g.fill(); g.strokeStyle = "rgba(60,30,10,0.7)"; g.lineWidth = 1; g.stroke(); g.restore();
  }
  // ¡pop!: estallido en el rizo y rizos sueltos que salen volando
  function pop(g, t, AB) {
    const k = fase(t, T.pop, T.pop + 0.4); if (k <= 0 || k >= 1) return;
    const c = apl(AB, { x: SITIO.C.s.x - 60, y: SITIO.C.s.y - 20 });
    g.save(); g.globalAlpha = 1 - k; g.strokeStyle = "#ffffff"; g.lineWidth = 2.6; g.lineCap = "round";
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.2, r0 = 10 + 26 * salida(k), r1 = r0 + 10;
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
    for (let i = 0; i < 4; i++) {
      const a = -2.2 + i * 0.5, v = 120 + 60 * hash(i + 2), x = c.x + Math.cos(a) * v * k, y = c.y + Math.sin(a) * v * k + 160 * k * k;
      g.save(); g.globalAlpha = 1 - k * k; g.strokeStyle = "#4a240f"; g.lineWidth = 2; g.beginPath();
      for (let j = 0; j <= 12; j++) { const b = j * 0.9 + t * 8, rr = 1 + j * 0.35; j ? g.lineTo(x + Math.cos(b) * rr, y + Math.sin(b) * rr) : g.moveTo(x + Math.cos(b) * rr, y + Math.sin(b) * rr); }
      g.stroke(); g.restore();
    }
  }
  // rayas de velocidad tras Guillermo y polvo del choque
  function vueloFx(g, t, pG) {
    const k = campana(t, T.pop, T.choque + 0.05); if (k > 0.01) {
      const c = pant(G, pG, G.tronco(pG)({ x: 250, y: 500 }));
      g.save(); g.globalAlpha = 0.8 * k; g.strokeStyle = "#ffffff"; g.lineWidth = 2.6; g.lineCap = "round";
      for (let i = 0; i < 5; i++) { const y = c.y - 110 + i * 48; g.beginPath(); g.moveTo(c.x + 60 + 20 * (i & 1), y); g.lineTo(c.x + 140 + 30 * hash(i), y); g.stroke(); }
      g.restore();
    }
    // polvo al llegar al suelo
    const ks = fase(t, T.sentado - 0.05, T.sentado + 0.6);
    if (ks > 0 && ks < 1) { g.save(); g.fillStyle = "#e8e4dc";
      for (let i = 0; i < 6; i++) { g.globalAlpha = 0.5 * (1 - ks); g.beginPath(); g.arc(XGW - 30 + i * 22 + 30 * ks * (i - 2.5) / 2.5, SUELO - 8 - 10 * ks, 8 + 10 * ks, 0, Math.PI * 2); g.fill(); }
      g.restore(); }
  }
  // polvillo del azulejo al chocar (por detrás de Guillermo)
  function polvoChoque(g, t) {
    const kp = fase(t, T.choque, T.choque + 0.7); if (kp <= 0 || kp >= 1) return;
    g.save();
    for (let i = 0; i < 9; i++) { const a = -Math.PI * 0.9 + i * 0.22, r = 16 + 70 * salida(kp) * (0.6 + 0.4 * hash(i + 4));
      g.globalAlpha = 0.55 * (1 - kp); g.fillStyle = "#e8e4dc"; g.beginPath(); g.arc(PILAR + 4 + Math.cos(a) * r * 0.6, GRIETA.y + Math.sin(a) * r, 7 + 8 * kp, 0, Math.PI * 2); g.fill(); }
    g.restore();
    if (kp < 0.25) estrella(g, PILAR + 2, GRIETA.y - 40, 16 + 26 * kp, 1 - kp * 4, "#ffffff");
  }
  // estrellitas girando alrededor de la cabeza de Guillermo
  function estrellitas(g, t, pG) {
    const k = tramo(t, T.choque + 0.05, T.choque + 0.3) * (1 - tramo(t, T.clava + 0.3, T.clava + 0.8)); if (k <= 0.01) return;
    const c = pant(G, pG, G.cabeza(pG).a({ x: 800, y: 260 }));
    for (let i = 0; i < 4; i++) { const a = t * 5 + i * Math.PI / 2, x = c.x + Math.cos(a) * 42, y = c.y + Math.sin(a) * 10;
      estrella(g, x, y, 6 + 2 * Math.sin(a), k * (0.6 + 0.4 * (Math.sin(a) + 1) / 2)); }
  }
  // estela del bumerán y ¡zas! al clavarse
  function estela(g, t, roja) {
    if (t < SUELTA || t > T.clava + 0.5) return;
    if (t < T.clava) {
      g.save(); g.strokeStyle = "rgba(255,255,255,0.75)"; g.lineCap = "round";
      for (let i = 1; i <= 6; i++) { const tt = t - i * 0.025; if (tt < SUELTA) break; const q = puaVuelo(tt).c, q2 = puaVuelo(tt - 0.02).c;
        g.globalAlpha = 0.7 * (1 - i / 7); g.lineWidth = 6 - i * 0.7; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q2.x, q2.y); g.stroke(); }
      g.restore();
      // arcos de giro
      const q = puaVuelo(t).c, a0 = -(t - SUELTA) * 19;
      g.save(); g.globalAlpha = 0.6; g.strokeStyle = "#ffffff"; g.lineWidth = 2;
      g.beginPath(); g.arc(q.x, q.y, 26, a0, a0 + 1.2); g.stroke(); g.beginPath(); g.arc(q.x, q.y, 26, a0 + Math.PI, a0 + Math.PI + 1.2); g.stroke(); g.restore();
    } else {
      const k = fase(t, T.clava, T.clava + 0.35), c = apl(roja.A, { x: 0, y: 0 });
      g.save(); g.globalAlpha = 1 - k; g.strokeStyle = "#ffffff"; g.lineWidth = 2.4; g.lineCap = "round";
      for (let i = 0; i < 6; i++) { const a = -Math.PI + i * Math.PI / 5, r0 = 16 + 16 * salida(k); g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0); g.lineTo(c.x + Math.cos(a) * (r0 + 9), c.y + Math.sin(a) * (r0 + 9)); g.stroke(); }
      g.restore();
    }
  }
  // rayitas del giro del taburete
  function giroFx(g, t, pB) {
    const k = campana(t, T.gira0, T.gira1 + 0.1); if (k <= 0.01) return;
    const c = pant(GB, pB, GB.tronco(pB)({ x: 255, y: 500 }));
    g.save(); g.globalAlpha = 0.8 * k; g.strokeStyle = "#ffffff"; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(c.x, c.y - 40 + i * 45, 70 - i * 6, 10, 0, Math.PI * 0.15, Math.PI * 0.85); g.stroke(); }
    g.restore();
  }

  /* ---------- cámara ---------- */
  const PLANOS = [
    [0, 1.12, 610, 300], [3.6, 1.12, 610, 300], [4.5, 1.0, 512, 300], [6.2, 1.0, 512, 300], [6.9, 1.1, 560, 300], [8.85, 1.14, 548, 302],
    [9.1, 1.0, 512, 300], [12.0, 1.0, 512, 300], [12.6, 1.04, 470, 300], [DUR, 1.04, 470, 300]
  ];
  function camara(t) {
    let i = 0; while (i < PLANOS.length - 2 && t > PLANOS[i + 1][0]) i++;
    const a = PLANOS[i], b = PLANOS[i + 1], k = suave(fase(t, a[0], b[0]));
    const kk = lerp(a[1], b[1], k), x = lerp(a[2], b[2], k), y = lerp(a[3], b[3], k);
    const mx = W / 2 / kk, my = H / 2 / kk;
    const tem = campana(t, T.choque, T.choque + 0.3);
    const sx = tem * 5 * ruido(t * 34), sy = tem * 4 * ruido(t * 29 + 4);
    return { k: kk, x: clamp(x, mx - 40, W + 40 - mx) + sx, y: clamp(y, my - 60, H + 60 - my) + sy };
  }

  const pose = t => { const v = poses(t); return { g: v.g, b: v.b }; };
  class GuillermoGabachoRizo extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !GB.listo()) return;
      if (!fondo) fondo = creaFondo();
      const v = poses(t), pG = v.g, pB = v.b;
      const luz = tramo(t, NEGRO_INICIO, 0.75, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      MATRIZ = g.getTransform();
      g.drawImage(fondo, -40, -60);
      toalla(g, t);
      grieta(g, t);
      // sombras
      g.save(); g.fillStyle = "rgba(10,10,10,0.28)";
      g.beginPath(); g.ellipse(TAB.x + 30, SUELO + 2, 92, 9, 0, 0, Math.PI * 2); g.fill();
      const sgx = pant(G, pG, pG.pelvis).x, alt = clamp((SUELO - pant(G, pG, pG.pelvis).y - 120) / 200);
      g.globalAlpha = 1 - 0.6 * alt; g.beginPath(); g.ellipse(sgx + 6, SUELO + 3, 62 + 30 * (t > T.choque ? 1 : 0), 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
      // Gabacho y su taburete
      const AB = afCab(GB, pB), ph = puaGB(t);
      pB.capaCabeza = gg => {
        dibHueco(gg, AB, t);
        if (v.roja && v.roja.capa === "B") dibujaPua(gg, v.roja, COL_ROJA);
        if (v.lila && v.lila.capa === "B") dibujaPua(gg, v.lila, COL_LILA);
      };
      if (v.lila && v.lila.capa === "manoB") { const ob = pB.manoCerca.objeto; pB.manoCerca.objeto = gg => { if (ob) ob(gg); dibujaPua(gg, v.lila, COL_LILA); }; }
      dibuja(GB, g, pB, t, taburete);
      dibTension(g, AB, t, ph);
      // Guillermo
      polvoChoque(g, t);
      pG.capaCabeza = gg => { if (v.roja && v.roja.capa === "G") dibujaPua(gg, v.roja, COL_ROJA); };
      dibuja(G, g, pG, t);
      if (v.roja && v.roja.capa === "aire") { estela(g, t, v.roja); dibujaPua(g, v.roja, COL_ROJA); }
      if (t >= T.clava) estela(g, t, v.roja);
      pop(g, t, AB);
      vueloFx(g, t, pG);
      estrellitas(g, t, pG);
      giroFx(g, t, pB);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00079", nombre: "Guillermo y Gabacho · El rizo", crear: () => new GuillermoGabachoRizo() });
  // diagnóstico: distancia hombro → muñeca de cada mano frente a lo que da el brazo
  function diag(t) {
    const v = poses(t), o = {};
    const dist = (Rg, p, lado) => { const m = lado === "cerca" ? p.manoCerca : p.manoLejos, h = Rg.tronco(p)(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO);
      const mu = m.mu ?? -1.75, w = rota({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, m.ang || 0);
      return Math.round(Math.hypot(m.x + w.x - h.x, m.y + w.y - h.y)); };
    o.gC = dist(G, v.g, "cerca"); o.gL = dist(G, v.g, "lejos"); o.bC = dist(GB, v.b, "cerca"); o.bL = dist(GB, v.b, "lejos");
    o.max = { gC: Math.round(G.BRAZO_C_L * 1.08), gL: Math.round(G.BRAZO_L * 1.08), bC: Math.round(GB.BRAZO_C_L * 1.08), bL: Math.round(GB.BRAZO_L * 1.08) };
    return o;
  }
  window.__A2D_00079 = { pose, poses, T, DUR, diag };
})();
