"use strict";
/* 00051 · Guillermo y Dari · El ajedrez
 *
 * Negro → rincón de un club de ajedrez de noche: papel pintado verde, zócalo de madera, ventana con
 * luna, estantería con libros y un trofeo, y una mesita alta con el tablero entre los dos. Dari piensa
 * muchísimo (puño en la barbilla; las gafas le dan un destello) mientras Guillermo tamborilea en la
 * mesa y bosteza → Dari, por fin, adelanta un peón una sola casilla → Guillermo, sin pensar, coge su
 * dama, cruza el tablero y la planta de golpe (todo el tablero salta); se echa atrás y mira a cámara,
 * chulísimo → Dari se sube las gafas (destello) y mueve el caballo con un saltito → el rey de Guillermo
 * se tambalea y cae despacito: jaque mate → Guillermo se queda de piedra; Dari, que ya lo ve venir,
 * coge su taza de té → a Guillermo se le pone la cabeza roja, tiembla, agarra el tablero y lo lanza
 * por los aires → el tablero sale por arriba dando vueltas y cae detrás de él; las piezas le llueven
 * una a una en la cabeza (estrellitas en cada golpe) y el caballo, el último, se le queda encima del
 * pelo; el rey de Dari cae de pie en la mesa → Dari sorbe el té con los ojos cerrados, tan tranquilo →
 * Guillermo, mareado, con ojos de espiral y el caballo bamboleándose en la cabeza; Dari mira a cámara,
 * levanta una ceja y vuelve a sorber → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, rebote, tramo, campana, ruido, hash } = M2;
  const G = Guillermo, Da = Dari;
  const S = 0.31, SUELO = 560;
  const XG = 405, XD = 630;                     // pelvis de Guillermo y de Dari (Dari mira a la izquierda)
  const DUR = 13.8;
  const T = {
    piensa: 0.35, brillos: [1.25, 2.15],
    tamb: 0.7, tamb1: 1.6, bostezo: 1.7, bostezo1: 2.45,
    dPeon: 2.5, dPeonToma: 2.8, dPeonDeja: 3.08, dPeonFin: 3.45,
    gMira: 2.6, gYa: 3.05,
    gSale: 3.28, gToma: 3.44, gArriba: 3.58, gPlanta: 3.7, gSuelta: 3.82, gVuelve: 4.15,
    chulo: 4.05, cejas: 4.5, chulo1: 5.1,
    dGafas: 4.5, dEmpuja: 4.68, dBrillo: 4.95, dGafas1: 5.05,
    dCab: 5.3, dCabToma: 5.56, dCabDeja: 6.0, dCabFin: 6.35,
    rey: 6.45, reyCae: 7.2,
    pasmo: 6.6,
    dTaza: 7.25, dTazaToma: 7.55, dTazaSube: 7.95,
    furia: 7.85, furia1: 8.3,
    gAgarra: 8.36, gTira: 8.58, suelta: 8.72,
    arriba: 8.95,
    sorbo: 9.0, sorbo1: 10.7,
    tabCae: 10.3,
    caballo: 10.62,
    mareo: 10.7, miraArriba: 11.75, mira: 11.2, camaraD: 11.45, brindis: 11.8, sorbo2: 12.15, sorbo21: 12.75,
    fin: 12.95
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const D = (pu, ix, md, re) => ({ pulgar: pu, indice: ix, medio: md, anular: re, menique: re });
  const DD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k),
    anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, -1.75), l: punoDesde({ x: 372, y: 648 }, -1.75) };
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const memo = new Map();
  const cache = (k, f) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };
  const rota = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const TINTA = "#0b0a0e";
  const GRAV = 1800, ESC_V = 1.65;
  let MATRIZ = null;

  // Pistas de una mano: [t0, t1, objetivo, curva]; el objetivo se resuelve a la hoja del personaje en cada fotograma.
  function pista(lista, t, resuelve) {
    let c = resuelve(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)), d = resuelve(obj);
      c = { x: lerp(c.x, d.x, k), y: lerp(c.y, d.y, k), mu: lerp(c.mu, d.mu, k), ang: lerp(c.ang, d.ang, k), puno: lerp(c.puno, d.puno, k),
        dedos: DD(c.dedos, d.dedos, k) };
    }
    return c;
  }

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, wd: 0, wi: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.2,
    dientes: 1, lengua: 0, mof: 0, rub: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, extraC) {
    const c = clamp(e.c + extraC);
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp, ojos: { d: clamp(c + e.wd), i: clamp(c + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* ================= tablero y piezas ================= */
  const TAB = { x: 512, y: 306 };               // centro de la cara del tablero en la mesa
  const CAS = 11;                               // ancho de una casilla en pantalla
  const IMG = { N: 208, F: 8, Q: 24 };          // imagen del tablero vista desde arriba
  const ESC_T = CAS / IMG.Q;                    // imagen → pantalla
  const WT = IMG.N * ESC_T;                     // ancho total con el marco (≈ 95 px)
  const PSI0 = Math.asin(0.34);                 // inclinación con que se ve la cara del tablero
  const GROSOR = 5;
  const casillaLocal = (r, f) => ({ x: (r - 3.5) * CAS, y: (3.5 - f) * CAS * Math.sin(PSI0) });
  const PIV = { x: TAB.x + WT / 2, y: TAB.y + 3 };          // el tablero gira sobre su canto derecho al levantarlo
  const BORDE0 = { x: TAB.x - WT / 2, y: TAB.y + 3 };       // canto izquierdo, por donde lo agarra Guillermo
  const MESA = { x: 512, y: 309, rx: 84, ry: 25 };
  const PLATO = { x: 572, y: 314 };                         // platillo de la taza de Dari

  const ALTO = { peon: 11.5, torre: 13, alfil: 16.5, caballo: 16.5, dama: 19, rey: 21.5 };
  const PIEZAS = [
    // blancas: Guillermo, a la izquierda (r = 0 su fila de atrás)
    { id: "RB", tipo: "rey", col: "b", r: 1, f: 4 },
    { id: "DB", tipo: "dama", col: "b", r: 0, f: 2 },
    { id: "TB", tipo: "torre", col: "b", r: 0, f: 7 },
    { id: "AB", tipo: "alfil", col: "b", r: 2, f: 6 },
    { id: "PB1", tipo: "peon", col: "b", r: 1, f: 0 },
    { id: "PB2", tipo: "peon", col: "b", r: 2, f: 1 },
    { id: "PB3", tipo: "peon", col: "b", r: 3, f: 2 },
    // negras: Dari, a la derecha
    { id: "RN", tipo: "rey", col: "n", r: 7, f: 4 },
    { id: "TN", tipo: "torre", col: "n", r: 7, f: 0 },
    { id: "CN", tipo: "caballo", col: "n", r: 5, f: 6 },
    { id: "AN", tipo: "alfil", col: "n", r: 6, f: 7 },
    { id: "PN1", tipo: "peon", col: "n", r: 6, f: 3 },
    { id: "PN2", tipo: "peon", col: "n", r: 6, f: 0 }
  ];
  const PZ = {}; PIEZAS.forEach((p, i) => { p.i = i; PZ[p.id] = p; });
  // jugadas: [pieza, t coge, t deja, casilla destino]
  const JUGADAS = { PN1: [T.dPeonToma, T.dPeonDeja, [5, 3]], DB: [T.gToma, T.gPlanta, [4, 6]], CN: [T.dCabToma, T.dCabDeja, [3, 5]] };
  // lluvia de piezas tras lanzar el tablero: a la cabeza de Guillermo, al suelo o a la mesa
  const LLUVIA = {
    PB1: { t: 9.4, a: "cab", vx: -170 }, TN: { t: 9.52, a: "cab", vx: 150 }, AB: { t: 9.63, a: "cab", vx: -120 },
    PN2: { t: 9.76, a: "cab", vx: 190 }, DB: { t: 9.89, a: "cab", vx: -210 }, PB2: { t: 10.03, a: "cab", vx: 110 },
    AN: { t: 10.18, a: "cab", vx: -150 }, RB: { t: 10.36, a: "cab", vx: 170 },
    CN: { t: T.caballo, a: "pelo" },
    TB: { t: 9.68, a: "suelo", x: 336, y: 568 }, PB3: { t: 9.95, a: "suelo", x: 492, y: 574 }, PN1: { t: 10.12, a: "suelo", x: 262, y: 564 },
    RN: { t: 10.5, a: "mesa", x: 540, y: 300 }
  };
  const GOLPES = Object.keys(LLUVIA).filter(k => LLUVIA[k].a !== "suelo" && LLUVIA[k].a !== "mesa").map(k => LLUVIA[k].t).sort((a, b) => a - b);

  // giro del tablero al levantarlo (sobre su canto derecho)
  const giroTira = t => 0.78 * entrada(fase(t, T.gTira, T.suelta));
  const enTablero = (q, t) => { const th = giroTira(t); const r = rota({ x: q.x - PIV.x, y: q.y - PIV.y }, th); return { x: PIV.x + r.x, y: PIV.y + r.y }; };
  const sacudida = t => campana(t, T.gPlanta, T.gPlanta + 0.14);
  // posición de reposo (base de la pieza) en una casilla
  const enCasilla = (r, f) => { const l = casillaLocal(r, f); return { x: TAB.x + l.x, y: TAB.y + l.y }; };

  // estado de una pieza mientras sigue en el tablero (o en la mano: modo "mano")
  function enJuego(pz, t) {
    let r = pz.r, f = pz.f;
    const j = JUGADAS[pz.id];
    if (j) { if (t >= j[0] && t < j[1]) return { modo: "mano" }; if (t >= j[1]) { r = j[2][0]; f = j[2][1]; } }
    let b = enCasilla(r, f), rot = 0;
    // el rey de Guillermo se tambalea y cae hacia su lado
    if (pz.id === "RB" && t > T.rey) {
      const piv = { x: b.x - 5, y: b.y };
      const wob = 0.07 * Math.sin((t - T.rey) * 15) * campana(t, T.rey, T.rey + 0.35);
      const k = fase(t, T.rey + 0.25, T.reyCae);
      let a = -Math.PI / 2 * entrada(k);
      if (t > T.reyCae) a = -Math.PI / 2 + 0.16 * Math.sin((t - T.reyCae) * 22) * Math.exp(-(t - T.reyCae) * 9);
      a += wob * (1 - k);
      const c = rota({ x: 5, y: 0 }, a); b = { x: piv.x + c.x, y: piv.y + c.y }; rot = a;
    }
    // salto de todo al plantar la dama
    const sa = sacudida(t);
    if (sa > 0 && pz.id !== "DB") { b.y -= 2.4 * sa * (0.6 + 0.8 * hash(pz.i + 3)); rot += 0.12 * sa * (hash(pz.i + 9) - 0.5); }
    const p2 = enTablero(b, t);
    return { modo: "tablero", x: p2.x, y: p2.y, rot: rot + giroTira(t), esc: 1 - 0.012 * f };
  }

  /* ---------- Guillermo: punto de la coronilla (retrato) ---------- */
  const CORONA = { x: 812, y: 268 };
  const coronaG = p => G.aPantalla(p, G.cabeza(p).a(CORONA));
  const coronaEn = t => cache("cor" + t, () => { const p = poseG(t); return { c: coronaG(p), ang: p.cabeza.ang }; });

  // vuelo de una pieza desde el tablero (al soltarlo) hasta su destino: tiro parabólico exacto
  function vuelo(pz) {
    return cache("v" + pz.id, () => {
      const L = LLUVIA[pz.id], s0 = enJuego(pz, T.suelta), tau = L.t - T.suelta;
      let fin, rotFin;
      if (L.a === "cab" || L.a === "pelo") { const c = coronaEn(L.t); fin = c.c; rotFin = c.ang; }
      else { fin = { x: L.x, y: L.y }; rotFin = 0; }
      const vx = (fin.x - s0.x) / tau, vy = (fin.y - s0.y - 0.5 * GRAV * tau * tau) / tau;
      let w;
      if (L.a === "pelo" || L.a === "mesa") { const n = Math.round((-6 * tau - (rotFin - s0.rot)) / (2 * Math.PI)); w = (rotFin + 2 * Math.PI * n - s0.rot) / tau; }
      else w = (hash(pz.i + 21) > 0.5 ? 1 : -1) * (7 + 6 * hash(pz.i + 22));
      return { x0: s0.x, y0: s0.y, r0: s0.rot, vx, vy, w, tau, fin };
    });
  }
  // rebote de una pieza que cae al suelo: sale de (x, y) con (vx, vy) y se queda tumbada
  function alSuelo(x, y, vx, vy, r, w, yS, u) {
    const a = 0.5 * GRAV, tc = (-vy + Math.sqrt(vy * vy + 4 * a * Math.max(0, yS - y))) / (2 * a);
    const tumb = Math.round((r + w * tc - Math.PI / 2) / Math.PI) * Math.PI + Math.PI / 2;
    if (u < tc) return { x: x + vx * u, y: y + vy * u + a * u * u, rot: r + w * u };
    const v = u - tc, db = 0.2;
    const xf = x + vx * tc;
    if (v < db) { const k = v / db; return { x: xf + vx * 0.08 * k, y: yS - 9 * Math.sin(Math.PI * k), rot: lerp(r + w * tc, tumb, suave(k)) }; }
    return { x: xf + vx * 0.08, y: yS, rot: tumb + 0.08 * Math.sin((v - db) * 18) * Math.exp(-(v - db) * 8) };
  }
  // estado de cualquier pieza en el instante t
  function estadoPieza(pz, t) {
    if (t < T.suelta) return enJuego(pz, t);
    const V = vuelo(pz), L = LLUVIA[pz.id], u = t - T.suelta;
    if (u < V.tau) {
      // en el aire crecen un poco (más cerca de la cámara): se leen mejor en el plano abierto
      const esc = L.a === "mesa" ? 1 + (ESC_V - 1) * Math.sin(Math.PI * u / V.tau) : lerp(1, ESC_V, suave(u / 0.4));
      return { modo: "aire", x: V.x0 + V.vx * u, y: V.y0 + V.vy * u + 0.5 * GRAV * u * u, rot: V.r0 + V.w * u, esc };
    }
    const v = u - V.tau, rLleg = V.r0 + V.w * V.tau;
    if (L.a === "cab") {
      const s = alSuelo(V.fin.x, V.fin.y, L.vx, -330 - 90 * hash(pz.i + 5), rLleg, 0.6 * V.w, 563 + 12 * hash(pz.i + 6), v);
      return { modo: "suelo", x: s.x, y: s.y, rot: s.rot, esc: ESC_V };
    }
    if (L.a === "suelo") { const s = alSuelo(V.fin.x, V.fin.y, 0.25 * V.vx, -0.3 * (V.vy + GRAV * V.tau), rLleg, 0.4 * V.w, V.fin.y, v); return { modo: "suelo", x: s.x, y: s.y, rot: s.rot, esc: ESC_V }; }
    if (L.a === "mesa") { const h = 4 * Math.abs(Math.sin(v * 12)) * Math.exp(-v * 7); return { modo: "mesa", x: V.fin.x, y: V.fin.y - h, rot: 0.2 * Math.sin(v * 16) * Math.exp(-v * 6), esc: 1 }; }
    return { modo: "pelo" };
  }
  // golpes en la cabeza de Guillermo (0–1): sube de golpe y se apaga
  function golpe(t) {
    let o = 0;
    for (const tg of GOLPES) { const k = fase(t, tg, tg + 0.24); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * Math.sqrt(k)) * (tg === T.caballo ? 0.7 : 1)); }
    return o;
  }

  /* ---------- dibujo de las piezas (sprites hechos una vez) ---------- */
  const SP = 3, SPW = 16, SPH = 24;               // sprite a 3×, base en (SPW/2, SPH - 1)
  let SPRITES = null;
  function formas(tipo) {
    const P = [];
    const base = (w, h) => g => { g.moveTo(-w, 0); g.lineTo(w, 0); g.quadraticCurveTo(w + 0.2, -h * 0.6, w - 0.9, -h); g.lineTo(-w + 0.9, -h); g.quadraticCurveTo(-w - 0.2, -h * 0.6, -w, 0); g.closePath(); };
    const cuello = (y, rx) => g => { g.ellipse(0, y, rx, 0.95, 0, 0, Math.PI * 2); };
    if (tipo === "peon") {
      P.push(g => { g.moveTo(-3.2, -2); g.quadraticCurveTo(-1.3, -3.8, -1.4, -6.6); g.lineTo(1.4, -6.6); g.quadraticCurveTo(1.3, -3.8, 3.2, -2); g.closePath(); });
      P.push(base(4.8, 2.3)); P.push(cuello(-6.7, 2.6)); P.push(g => g.arc(0, -9.1, 2.6, 0, Math.PI * 2));
    } else if (tipo === "torre") {
      P.push(g => { g.moveTo(-3.4, -2); g.lineTo(-2.9, -9.2); g.lineTo(2.9, -9.2); g.lineTo(3.4, -2); g.closePath(); });
      P.push(base(5, 2.5));
      P.push(g => { const q = [[-4.3, -8.8], [4.3, -8.8], [4.3, -13], [2.7, -13], [2.7, -11.6], [0.85, -11.6], [0.85, -13], [-0.85, -13], [-0.85, -11.6], [-2.7, -11.6], [-2.7, -13], [-4.3, -13]];
        g.moveTo(q[0][0], q[0][1]); for (const [x, y] of q.slice(1)) g.lineTo(x, y); g.closePath(); });
    } else if (tipo === "alfil") {
      P.push(g => { g.moveTo(-3, -2); g.quadraticCurveTo(-1.2, -5.6, -1.4, -8.6); g.lineTo(1.4, -8.6); g.quadraticCurveTo(1.2, -5.6, 3, -2); g.closePath(); });
      P.push(base(4.8, 2.3)); P.push(cuello(-8.8, 2.8));
      P.push(g => { g.moveTo(0, -15.3); g.bezierCurveTo(3.7, -13, 3.5, -10, 1.6, -9.5); g.lineTo(-1.6, -9.5); g.bezierCurveTo(-3.5, -10, -3.7, -13, 0, -15.3); g.closePath(); });
      P.push(g => g.arc(0, -16, 1.15, 0, Math.PI * 2));
    } else if (tipo === "caballo") {
      P.push(g => { g.moveTo(-3.9, -2); g.lineTo(3.7, -2); g.bezierCurveTo(3.6, -4.6, 1.6, -6, 2.1, -8.2); g.lineTo(5.5, -10.1);
        g.quadraticCurveTo(6.9, -11.1, 5.9, -12.5); g.lineTo(2.7, -14.6); g.lineTo(1.7, -16.7); g.lineTo(0.3, -15.1);
        g.quadraticCurveTo(-3.5, -14.2, -4.3, -9.2); g.quadraticCurveTo(-4.7, -5, -3.9, -2); g.closePath(); });
      P.push(base(5, 2.5));
    } else if (tipo === "dama") {
      P.push(g => { g.moveTo(-3.4, -2); g.quadraticCurveTo(-1.4, -7, -1.5, -11.4); g.lineTo(1.5, -11.4); g.quadraticCurveTo(1.4, -7, 3.4, -2); g.closePath(); });
      P.push(base(5.2, 2.5)); P.push(cuello(-11.6, 3));
      P.push(g => { const q = [[-2.3, -12.3], [-4.3, -16.4], [-2.4, -15], [-1.3, -17], [0, -15.3], [1.3, -17], [2.4, -15], [4.3, -16.4], [2.3, -12.3]];
        g.moveTo(q[0][0], q[0][1]); for (const [x, y] of q.slice(1)) g.lineTo(x, y); g.closePath(); });
      P.push(g => g.arc(0, -17.7, 1.3, 0, Math.PI * 2));
    } else {
      P.push(g => { g.moveTo(-3.4, -2); g.quadraticCurveTo(-1.5, -7.5, -1.7, -12); g.lineTo(1.7, -12); g.quadraticCurveTo(1.5, -7.5, 3.4, -2); g.closePath(); });
      P.push(base(5.2, 2.5)); P.push(cuello(-12.2, 3.1));
      P.push(g => { g.moveTo(-2.4, -12.8); g.bezierCurveTo(-4.7, -14.5, -3.5, -17.5, 0, -17.1); g.bezierCurveTo(3.5, -17.5, 4.7, -14.5, 2.4, -12.8); g.closePath(); });
      P.push(g => { const q = [[-0.75, -16.9], [-0.75, -18.6], [-2.1, -18.6], [-2.1, -19.95], [-0.75, -19.95], [-0.75, -21.4], [0.75, -21.4], [0.75, -19.95], [2.1, -19.95], [2.1, -18.6], [0.75, -18.6], [0.75, -16.9]];
        g.moveTo(q[0][0], q[0][1]); for (const [x, y] of q.slice(1)) g.lineTo(x, y); g.closePath(); });
    }
    return P;
  }
  function creaSprite(tipo, col) {
    const c = document.createElement("canvas"); c.width = SPW * SP; c.height = SPH * SP; const g = c.getContext("2d");
    g.scale(SP, SP); g.translate(SPW / 2, SPH - 1.2); if (tipo === "caballo" && col === "n") g.scale(-1, 1);
    g.lineJoin = "round"; g.lineCap = "round";
    const claro = col === "b", relleno = claro ? "#f5edd9" : "#2e2a34", sombra = claro ? "rgba(150,120,80,0.45)" : "rgba(0,0,0,0.45)",
      luz = claro ? "rgba(255,255,255,0.85)" : "rgba(170,165,200,0.55)", borde = claro ? "#1a120c" : "#0a080c";
    for (const f of formas(tipo)) {
      g.beginPath(); f(g); g.fillStyle = relleno; g.fill();
      g.save(); g.beginPath(); f(g); g.clip();
      g.fillStyle = sombra; g.fillRect(1.3, -24, 8, 26);
      g.fillStyle = luz; g.fillRect(-3.1, -24, 1.1, 26);
      g.restore();
      g.beginPath(); f(g); g.lineWidth = 0.95; g.strokeStyle = borde; g.stroke();
    }
    if (tipo === "caballo") { g.fillStyle = claro ? TINTA : "#e9e3f2"; g.beginPath(); g.arc(2.7, -12.4, 0.62, 0, Math.PI * 2); g.fill();
      g.strokeStyle = claro ? "rgba(26,18,12,0.7)" : "rgba(200,195,225,0.55)"; g.lineWidth = 0.6; g.beginPath(); g.moveTo(-1.4, -14.2); g.quadraticCurveTo(-3.2, -10.5, -2.8, -6.2); g.stroke(); }
    if (tipo === "alfil") { g.strokeStyle = claro ? "#1a120c" : "#cfc8e0"; g.lineWidth = 0.7; g.beginPath(); g.moveTo(-1.2, -13.3); g.lineTo(1.4, -11.1); g.stroke(); }
    return c;
  }
  function pieza(g, tipo, col, x, y, rot, esc = 1) {
    if (!SPRITES) { SPRITES = {}; for (const tp of Object.keys(ALTO)) for (const c of ["b", "n"]) SPRITES[tp + c] = creaSprite(tp, c); }
    g.save(); g.translate(x, y); if (rot) g.rotate(rot); g.scale(esc / SP, esc / SP);
    g.drawImage(SPRITES[tipo + col], -SPW * SP / 2, -(SPH - 1.2) * SP);
    g.restore();
  }

  /* ---------- tablero (imagen de arriba y de abajo, hecha una vez) ---------- */
  let TABL = null;
  function creaTablero() {
    const { N, F, Q } = IMG;
    const a = document.createElement("canvas"); a.width = a.height = N; let g = a.getContext("2d");
    g.fillStyle = "#4a2a14"; g.fillRect(0, 0, N, N);
    g.fillStyle = "#70401f"; g.fillRect(2, 2, N - 4, N - 4);
    for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) { g.fillStyle = (r + f) % 2 ? "#efd9a8" : "#8f5a33"; g.fillRect(F + r * Q, F + (7 - f) * Q, Q, Q); }
    g.strokeStyle = "rgba(60,30,10,0.25)"; g.lineWidth = 1;
    for (let i = 0; i < 14; i++) { const y = F + hash(i + 300) * 8 * Q; g.beginPath(); g.moveTo(F, y); g.lineTo(F + 8 * Q, y + 6 * (hash(i + 301) - 0.5)); g.stroke(); }
    const lg = g.createLinearGradient(0, 0, N, N); lg.addColorStop(0, "rgba(255,240,200,0.22)"); lg.addColorStop(0.55, "rgba(255,255,255,0)"); lg.addColorStop(1, "rgba(0,0,0,0.12)");
    g.fillStyle = lg; g.fillRect(0, 0, N, N);
    g.strokeStyle = "#2a160a"; g.lineWidth = 4; g.strokeRect(2, 2, N - 4, N - 4); g.lineWidth = 2; g.strokeRect(F, F, 8 * Q, 8 * Q);
    const b = document.createElement("canvas"); b.width = b.height = N; g = b.getContext("2d");
    g.fillStyle = "#5a3418"; g.fillRect(0, 0, N, N);
    g.fillStyle = "#2f6a40"; g.fillRect(14, 14, N - 28, N - 28);
    g.fillStyle = "rgba(255,255,255,0.06)"; for (let i = 0; i < 60; i++) g.fillRect(14 + hash(i + 400) * (N - 30), 14 + hash(i + 401) * (N - 30), 2, 2);
    g.strokeStyle = "rgba(20,10,4,0.5)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(N / 2, 4); g.lineTo(N / 2, N - 4); g.stroke();
    g.strokeStyle = "#2a160a"; g.lineWidth = 4; g.strokeRect(2, 2, N - 4, N - 4); g.lineWidth = 2; g.strokeRect(14, 14, N - 28, N - 28);
    return { arriba: a, abajo: b };
  }
  // dibuja el tablero con su centro en (x, y), giro en el plano th e inclinación psi (PSI0 = en la mesa)
  function tablero(g, x, y, th, psi) {
    if (!TABL) TABL = creaTablero();
    const sp = Math.sin(psi), cp = Math.cos(psi), hC = Math.abs(WT * sp), hE = Math.abs(GROSOR * cp);
    g.save(); g.translate(x, y); g.rotate(th); g.lineJoin = "round";
    const abajo = sp * cp > 0;                       // el canto se ve por debajo de la cara
    const yE = abajo ? hC / 2 : -hC / 2 - hE;
    g.fillStyle = "#3d2210"; g.fillRect(-WT / 2, yE, WT, hE);
    g.fillStyle = "rgba(255,210,150,0.18)"; g.fillRect(-WT / 2, yE + (abajo ? 0 : hE - 1), WT, 1);
    g.strokeStyle = TINTA; g.lineWidth = 1.4; g.strokeRect(-WT / 2, yE, WT, hE);
    if (hC > 0.3) { g.save(); g.scale(ESC_T, hC / IMG.N); g.drawImage(sp > 0 ? TABL.arriba : TABL.abajo, -IMG.N / 2, -IMG.N / 2); g.restore(); }
    g.strokeStyle = TINTA; g.lineWidth = 1.6; g.strokeRect(-WT / 2, -hC / 2, WT, hC);
    g.restore();
  }
  // estado del tablero: en la mesa, levantado, volando o tirado en el suelo detrás de Guillermo
  const TAB_FIN = { x: 290, y: 514 };
  const TH_FIN = 2 * Math.PI, PSI_FIN = PSI0 + 3 * Math.PI;
  function estadoTablero(t) {
    if (t < T.suelta) {
      const th = giroTira(t), c = enTablero(TAB, t), sa = sacudida(t);
      return { x: c.x, y: c.y - 1.6 * sa, th: th + 0.012 * sa * Math.sin(t * 90), psi: PSI0 };
    }
    const s = cache("tabS", () => { const c = enTablero(TAB, T.suelta - 1e-4); return { x: c.x, y: c.y, th: giroTira(T.suelta) }; });
    const tau = T.tabCae - T.suelta, u = t - T.suelta;
    if (u < tau) {
      const vx = (TAB_FIN.x - s.x) / tau, vy = (TAB_FIN.y - s.y - 0.5 * GRAV * tau * tau) / tau;
      const k = u / tau;
      return { x: s.x + vx * u, y: s.y + vy * u + 0.5 * GRAV * u * u, th: lerp(s.th, TH_FIN, k), psi: lerp(PSI0, PSI_FIN, k) };
    }
    const v = u - tau, am = Math.exp(-v * 6);
    return { x: TAB_FIN.x, y: TAB_FIN.y - 10 * Math.abs(Math.sin(v * 11)) * am, th: TH_FIN + 0.1 * Math.sin(v * 15) * am, psi: PSI_FIN };
  }
  function borde(t) { return enTablero(BORDE0, t); }

  /* ---------- taza de té ---------- */
  // taza en pantalla: (x, y) es el centro del fondo; rot la inclina; el asa va a la derecha (hacia Dari)
  const ESC_TAZA = 1.6, ASA = { x: 9.4, y: -6 };
  function taza(g, x, y, rot, lleno = 1) {
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(ESC_TAZA, ESC_TAZA); g.lineJoin = "round"; g.lineCap = "round";
    g.strokeStyle = TINTA; g.lineWidth = 3.2; g.beginPath(); g.ellipse(7.4, -6, 2.8, 3, 0, -Math.PI * 0.55, Math.PI * 0.55); g.stroke();
    g.strokeStyle = "#f7f4ee"; g.lineWidth = 1.5; g.stroke();
    g.beginPath(); g.moveTo(-7, -10.5); g.lineTo(7, -10.5); g.quadraticCurveTo(6.6, -1.5, 3.4, 0); g.lineTo(-3.4, 0); g.quadraticCurveTo(-6.6, -1.5, -7, -10.5); g.closePath();
    g.fillStyle = "#f7f4ee"; g.fill();
    g.save(); g.clip(); g.fillStyle = "#2c65b0"; g.fillRect(-8, -7.6, 16, 2.2); g.fillStyle = "rgba(120,140,170,0.35)"; g.fillRect(2.5, -11, 5, 12); g.restore();
    g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke();
    g.fillStyle = "#8a4a1c"; g.beginPath(); g.ellipse(0, -10.4, 6.6, 1.5, 0, 0, Math.PI * 2); g.fill();
    if (lleno > 0) { g.fillStyle = "#a65d27"; g.beginPath(); g.ellipse(0, -10.1, 5.8, 1.1, 0, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = TINTA; g.lineWidth = 1.2; g.beginPath(); g.ellipse(0, -10.5, 7, 1.7, 0, 0, Math.PI * 2); g.stroke();
    g.restore();
  }
  function vapor(g, t, x, y, a) {
    if (a <= 0.01) return;
    g.save(); g.strokeStyle = "rgba(255,255,255,0.5)"; g.lineWidth = 1.6; g.lineCap = "round"; g.globalAlpha = a;
    for (let i = 0; i < 2; i++) {
      const ph = t * 1.4 + i * 0.5, k = ph - Math.floor(ph);
      g.globalAlpha = a * Math.sin(Math.PI * k) * 0.8;
      g.beginPath();
      for (let j = 0; j <= 8; j++) { const u = j / 8, yy = y - 4 - u * 16 - k * 6, xx = x - 2 + i * 4 + 2.4 * Math.sin(u * 6 + t * 3 + i * 2); if (j) g.lineTo(xx, yy); else g.moveTo(xx, yy); }
      g.stroke();
    }
    g.restore();
  }

  /* ================= decorado: club de ajedrez de noche ================= */
  let fondo = null;
  const ZOC = 330, YS0 = 470;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60); g.lineJoin = "round"; g.lineCap = "round";
    // papel pintado verde botella con rayas y rombos dorados
    g.fillStyle = "#23473a"; g.fillRect(-40, -60, W + 80, ZOC + 60);
    for (let x = -40; x < W + 40; x += 30) { g.fillStyle = "rgba(255,255,255,0.04)"; g.fillRect(x, -60, 13, ZOC + 60); }
    g.fillStyle = "rgba(214,186,110,0.16)";
    for (let j = 0, y = -44; y < ZOC - 6; y += 34, j++) for (let x = -34 + (j % 2) * 15; x < W + 40; x += 30) { g.beginPath(); g.moveTo(x, y - 4); g.lineTo(x + 3, y); g.lineTo(x, y + 4); g.lineTo(x - 3, y); g.closePath(); g.fill(); }
    // luz cálida de la lámpara del techo sobre la pared
    const luz = g.createRadialGradient(512, 150, 20, 512, 150, 520); luz.addColorStop(0, "rgba(255,214,140,0.30)"); luz.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = luz; g.fillRect(-40, -60, W + 80, YS0 + 60);
    // ventana con luna y tejados
    ventana(g, 190, 140);
    // estantería con libros y trofeo
    estanteria(g, 905, 470);
    // cuadro pequeño: caballo de ajedrez en silueta
    cuadro(g, 690, 120);
    // apliques de pared
    for (const x of [330, 760]) aplique(g, x, 120);
    // moldura y zócalo de madera con paneles
    g.fillStyle = "#5b3519"; g.fillRect(-40, ZOC - 10, W + 80, 12); g.fillStyle = "rgba(255,210,150,0.25)"; g.fillRect(-40, ZOC - 10, W + 80, 2);
    const z = g.createLinearGradient(0, ZOC, 0, YS0); z.addColorStop(0, "#7a4924"); z.addColorStop(1, "#5e3517");
    g.fillStyle = z; g.fillRect(-40, ZOC + 2, W + 80, YS0 - ZOC - 2);
    for (let x = -30; x < W + 40; x += 118) {
      g.strokeStyle = "rgba(30,14,4,0.55)"; g.lineWidth = 3; g.strokeRect(x, ZOC + 22, 96, YS0 - ZOC - 48);
      g.strokeStyle = "rgba(255,200,140,0.18)"; g.lineWidth = 1.5; g.strokeRect(x + 3, ZOC + 25, 90, YS0 - ZOC - 54);
    }
    g.fillStyle = "#3e220e"; g.fillRect(-40, YS0 - 10, W + 80, 10);
    // suelo de tarima en perspectiva
    const fs = g.createLinearGradient(0, YS0, 0, H + 60); fs.addColorStop(0, "#8a5530"); fs.addColorStop(1, "#5d3418");
    g.fillStyle = fs; g.fillRect(-40, YS0, W + 80, H + 60 - YS0);
    g.strokeStyle = "rgba(40,18,6,0.4)"; g.lineWidth = 1.4;
    for (let j = -16; j <= 16; j++) { g.beginPath(); g.moveTo(512 + j * 40, YS0); g.lineTo(512 + j * 96, H + 60); g.stroke(); }
    for (let i = 0; i < 40; i++) { const j = Math.floor(hash(i + 90) * 32) - 16, u = hash(i + 91) * 0.9 + 0.05, y = YS0 + (H + 60 - YS0) * u;
      const x = 512 + j * lerp(40, 96, u) + 20 * lerp(40, 96, u) / 40; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y + 6); g.stroke(); }
    // alfombra
    g.fillStyle = "#7d1f22"; g.beginPath(); g.moveTo(230, 520); g.lineTo(800, 520); g.lineTo(850, 612); g.lineTo(180, 612); g.closePath(); g.fill();
    g.strokeStyle = "#d9a441"; g.lineWidth = 3; g.beginPath(); g.moveTo(244, 527); g.lineTo(786, 527); g.lineTo(830, 605); g.lineTo(200, 605); g.closePath(); g.stroke();
    g.strokeStyle = "rgba(217,164,65,0.55)"; g.lineWidth = 1.5;
    for (let i = 0; i < 9; i++) { const x = 300 + i * 52; g.beginPath(); g.moveTo(x, 545); g.lineTo(x + 8, 552); g.lineTo(x, 559); g.lineTo(x - 8, 552); g.closePath(); g.stroke(); }
    // mesita alta
    mesa(g);
    // viñeta
    const vi = g.createRadialGradient(512, 290, 300, 512, 290, 720); vi.addColorStop(0, "rgba(0,0,0,0)"); vi.addColorStop(1, "rgba(10,8,20,0.5)");
    g.fillStyle = vi; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }
  function ventana(g, x, y) {
    g.save();
    // cortinas granates
    g.fillStyle = "#6a1a22"; g.strokeStyle = "#2a0608"; g.lineWidth = 2.5;
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x + s * 96, y - 120); g.lineTo(x + s * 128, y - 120); g.quadraticCurveTo(x + s * 120, y + 20, x + s * 134, y + 124); g.lineTo(x + s * 90, y + 124); g.quadraticCurveTo(x + s * 104, y, x + s * 96, y - 120); g.closePath(); g.fill(); g.stroke(); }
    // cristal de noche
    const n = g.createLinearGradient(0, y - 100, 0, y + 100); n.addColorStop(0, "#0d1838"); n.addColorStop(1, "#2a3d6e");
    g.fillStyle = n; g.fillRect(x - 86, y - 100, 172, 200);
    g.fillStyle = "#fffbe0"; for (let i = 0; i < 14; i++) { g.globalAlpha = 0.5 + 0.5 * hash(i + 50); g.fillRect(x - 84 + hash(i + 51) * 168, y - 98 + hash(i + 52) * 110, 1.6, 1.6); } g.globalAlpha = 1;
    const lu = g.createRadialGradient(x + 40, y - 52, 4, x + 40, y - 52, 48); lu.addColorStop(0, "rgba(255,250,220,0.5)"); lu.addColorStop(1, "rgba(255,250,220,0)");
    g.fillStyle = lu; g.beginPath(); g.arc(x + 40, y - 52, 48, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fbf6dc"; g.beginPath(); g.arc(x + 40, y - 52, 17, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#0d1838"; g.beginPath(); g.arc(x + 48, y - 57, 15, 0, Math.PI * 2); g.fill();
    // tejados con ventanitas encendidas
    g.fillStyle = "#0a0f1e";
    g.beginPath(); g.moveTo(x - 86, y + 100); g.lineTo(x - 86, y + 40); g.lineTo(x - 50, y + 20); g.lineTo(x - 14, y + 40); g.lineTo(x - 14, y + 56); g.lineTo(x + 20, y + 56);
    g.lineTo(x + 20, y + 30); g.lineTo(x + 56, y + 30); g.lineTo(x + 56, y + 48); g.lineTo(x + 86, y + 48); g.lineTo(x + 86, y + 100); g.closePath(); g.fill();
    g.fillStyle = "#f6c95a"; for (const [a, b] of [[-66, 52], [-40, 64], [30, 44], [42, 70], [70, 62]]) g.fillRect(x + a, y + b, 6, 7);
    // marco y cruceta
    g.strokeStyle = "#2a1608"; g.lineWidth = 12; g.strokeRect(x - 86, y - 100, 172, 200);
    g.strokeStyle = "#7a4a26"; g.lineWidth = 7; g.strokeRect(x - 86, y - 100, 172, 200);
    g.lineWidth = 6; g.beginPath(); g.moveTo(x, y - 100); g.lineTo(x, y + 100); g.moveTo(x - 86, y); g.lineTo(x + 86, y); g.stroke();
    g.fillStyle = "#6b3f1e"; g.fillRect(x - 100, y + 100, 200, 12); g.strokeStyle = "#2a1608"; g.lineWidth = 2; g.strokeRect(x - 100, y + 100, 200, 12);
    // barra de la cortina
    g.strokeStyle = "#c9a04a"; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 140, y - 122); g.lineTo(x + 140, y - 122); g.stroke();
    g.restore();
  }
  function estanteria(g, x, y) {
    g.save();
    const w = 190, h = 440, x0 = x - w / 2, y0 = y - h;
    g.fillStyle = "#4a2a12"; g.fillRect(x0, y0, w, h);
    g.fillStyle = "#2a1608"; g.fillRect(x0 + 10, y0 + 10, w - 20, h - 20);
    const baldas = 4, hb = (h - 20) / baldas;
    for (let b = 0; b < baldas; b++) {
      const yb = y0 + 10 + (b + 1) * hb;
      let xx = x0 + 14, i = 0;
      while (xx < x0 + w - 24) {
        const n = b * 40 + i, bw = 8 + 9 * hash(n + 200), bh = hb - 18 - 22 * hash(n + 201);
        if (b === 1 && xx > x0 + 100 && xx < x0 + 150) { xx += 52; i++; continue; }       // hueco para el trofeo
        const cols = ["#8c2a2a", "#2a4f7a", "#b8892d", "#3b6b3a", "#5a2f6a", "#c45a2a", "#2e2e3a"];
        g.fillStyle = cols[Math.floor(hash(n + 202) * cols.length)];
        const incl = hash(n + 203) > 0.86 ? 0.18 : 0;
        g.save(); g.translate(xx, yb); g.rotate(incl); g.fillRect(0, -bh, bw, bh);
        g.fillStyle = "rgba(255,230,160,0.45)"; g.fillRect(1.5, -bh + 6, bw - 3, 2); g.fillRect(1.5, -12, bw - 3, 2);
        g.strokeStyle = "rgba(0,0,0,0.5)"; g.lineWidth = 1; g.strokeRect(0, -bh, bw, bh); g.restore();
        xx += bw + 1 + (incl ? 4 : 0); i++;
      }
      g.fillStyle = "#6b3f1e"; g.fillRect(x0 + 6, yb, w - 12, 8); g.fillStyle = "rgba(255,210,150,0.25)"; g.fillRect(x0 + 6, yb, w - 12, 2);
    }
    // trofeo: un caballo dorado sobre peana
    const tx = x0 + 126, ty = y0 + 10 + 2 * hb;
    g.fillStyle = "#3a2410"; g.fillRect(tx - 16, ty - 14, 32, 14);
    g.save(); g.translate(tx, ty - 14); g.scale(2.6, 2.6);
    g.beginPath(); for (const f of formas("caballo")) f(g); g.fillStyle = "#d9a83a"; g.fill(); g.lineWidth = 0.8; g.strokeStyle = "#5a3a08"; g.stroke(); g.restore();
    g.fillStyle = "rgba(255,250,200,0.7)"; g.fillRect(tx - 6, ty - 50, 2, 26);
    g.strokeStyle = "#1c0c04"; g.lineWidth = 4; g.strokeRect(x0, y0, w, h);
    g.restore();
  }
  function cuadro(g, x, y) {
    g.save();
    g.fillStyle = "#a8742c"; g.fillRect(x - 40, y - 48, 80, 96); g.strokeStyle = "#3a2208"; g.lineWidth = 3; g.strokeRect(x - 40, y - 48, 80, 96);
    g.fillStyle = "#efe2c0"; g.fillRect(x - 31, y - 39, 62, 78);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) if ((i + j) % 2) { g.fillStyle = "rgba(60,40,20,0.12)"; g.fillRect(x - 31 + i * 15.5, y - 39 + j * 15.6, 15.5, 15.6); }
    g.save(); g.translate(x, y + 30); g.scale(3.2, 3.2); g.beginPath(); for (const f of formas("caballo")) f(g); g.fillStyle = "#1e1a22"; g.fill(); g.restore();
    g.strokeStyle = "#3a2208"; g.lineWidth = 2; g.strokeRect(x - 31, y - 39, 62, 78);
    g.restore();
  }
  function aplique(g, x, y) {
    g.save();
    const h = g.createRadialGradient(x, y - 8, 2, x, y - 8, 70); h.addColorStop(0, "rgba(255,220,150,0.55)"); h.addColorStop(1, "rgba(255,210,140,0)");
    g.fillStyle = h; g.beginPath(); g.arc(x, y - 8, 70, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#c9a04a"; g.strokeStyle = "#3a2608"; g.lineWidth = 2;
    g.fillRect(x - 4, y, 8, 22); g.strokeRect(x - 4, y, 8, 22);
    g.fillStyle = "#f7e0a8"; g.beginPath(); g.moveTo(x - 13, y); g.lineTo(x + 13, y); g.lineTo(x + 8, y - 22); g.lineTo(x - 8, y - 22); g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  function mesa(g) {
    const { x, y, rx, ry } = MESA;
    g.save(); g.lineJoin = "round";
    g.fillStyle = "rgba(20,6,0,0.35)"; g.beginPath(); g.ellipse(x, SUELO + 2, 54, 8, 0, 0, Math.PI * 2); g.fill();
    // pie torneado y base
    g.fillStyle = "#3a1f0c"; g.beginPath(); g.ellipse(x, SUELO - 4, 40, 8, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    const pie = g.createLinearGradient(x - 10, 0, x + 10, 0); pie.addColorStop(0, "#8a5a2e"); pie.addColorStop(1, "#4a2a12");
    g.fillStyle = pie; g.beginPath(); g.moveTo(x - 8, y + 12); g.quadraticCurveTo(x - 4, y + 120, x - 9, SUELO - 10); g.lineTo(x + 9, SUELO - 10); g.quadraticCurveTo(x + 4, y + 120, x + 8, y + 12); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(x, y + 130, 12, 4, 0, 0, Math.PI * 2); g.fillStyle = "#6b3f1e"; g.fill(); g.stroke();
    // canto y tapa redonda vista un poco desde arriba
    g.fillStyle = "#4a2810"; g.beginPath(); g.ellipse(x, y + 7, rx, ry, 0, 0, Math.PI); g.lineTo(x - rx, y); g.ellipse(x, y, rx, ry, 0, Math.PI, 0, true); g.closePath(); g.fill(); g.stroke();
    const tp = g.createLinearGradient(0, y - ry, 0, y + ry); tp.addColorStop(0, "#9a6234"); tp.addColorStop(1, "#7a4824");
    g.fillStyle = tp; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = "rgba(255,220,170,0.3)"; g.lineWidth = 1.5; g.beginPath(); g.ellipse(x, y, rx - 5, ry - 3, 0, Math.PI * 1.05, Math.PI * 1.6); g.stroke();
    // platillo de la taza de Dari
    g.fillStyle = "#f4f1ea"; g.strokeStyle = TINTA; g.lineWidth = 1.4;
    g.beginPath(); g.ellipse(PLATO.x, PLATO.y, 13, 3.6, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = "#2c65b0"; g.lineWidth = 1; g.beginPath(); g.ellipse(PLATO.x, PLATO.y - 0.3, 9, 2.2, 0, 0, Math.PI * 2); g.stroke();
    g.restore();
  }

  /* ================= Guillermo ================= */
  const CG = {
    inicio: E({ mx: 0.85, my: 0.45, sonr: 0.32, ancho: 0.95 }),
    aburre: E({ mx: 0.4, my: -0.75, c: 0.38, sonr: -0.05, ancho: 0.75, sd: -4, si: 4, gd: -0.05 }),
    bosteza: E({ mx: 0, my: -0.4, c: 1, abre: 46, ancho: 0.85, sonr: 0, sd: 16, si: 16, gd: 0.1, gi: 0.1, lengua: 0.5 }),
    mira: E({ mx: 0.92, my: 0.5, sonr: 0.1, ancho: 0.85, sd: 8, si: 8 }),
    yaesta: E({ mx: 0.92, my: 0.4, sonr: 0.05, ancho: 0.6, abre: 7, sd: 24, si: 10, gd: 0.12, gi: -0.05 }),
    decide: E({ mx: 0.85, my: 0.55, sonr: 0.62, ancho: 0.95, sd: 4, si: -6, gi: -0.12 }),
    planta: E({ mx: 0.85, my: 0.55, c: 0.2, sonr: 0.5, ancho: 1, abre: 8, sd: -6, si: -6, gd: -0.15, gi: -0.15 }),
    chulo: E({ mx: -0.85, my: -0.1, c: 0.42, sonr: 0.8, ancho: 1, sd: 16, gd: 0.14, si: -2, gi: -0.08 }),
    sigue: E({ mx: 0.9, my: 0.45, c: 0.3, sonr: 0.55, ancho: 0.95, sd: 10, si: 2 }),
    pasmo: E({ mx: 0.75, my: 0.6, iris: 0.68, sonr: -0.2, ancho: 0.5, abre: 12, sd: 24, si: 24 }),
    furia: E({ mx: 0.85, my: 0.45, iris: 0.82, sd: -18, si: -18, gd: -0.38, gi: -0.38, abre: 10, ancho: 1, sonr: -0.55 }),
    tira: E({ mx: 0.6, my: -0.4, iris: 0.85, c: 0.15, sd: -20, si: -20, gd: -0.4, gi: -0.4, abre: 30, ancho: 1, sonr: -0.4 }),
    arriba: E({ mx: 0.25, my: -1, iris: 0.72, sd: 26, si: 26, abre: 20, ancho: 0.55, sonr: -0.35 }),
    mareo: E({ mx: 0, my: 0, esp: 1, sonr: 0.15, ancho: 0.75, abre: 9, sd: 10, si: 2, gd: 0.08 }),
    alCaballo: E({ mx: 0.3, my: -1, iris: 0.9, c: 0.25, sonr: -0.25, ancho: 0.6, abre: 3, sd: 14, si: 20, gd: 0.1, gi: 0.15 })
  };
  const GOLPE_E = E({ mx: 0, my: 0, c: 1, z: 1, sd: -10, si: -10, gd: -0.2, gi: -0.2, abre: 14, ancho: 0.6, sonr: -0.4 });
  const GUION_CG = [
    [0.95, 1.2, "aburre"], [T.bostezo, T.bostezo + 0.2, "bosteza"], [T.bostezo1 - 0.1, T.bostezo1 + 0.1, "aburre"],
    [T.gMira, T.gMira + 0.2, "mira"], [T.gYa, T.gYa + 0.15, "yaesta"], [T.gSale - 0.08, T.gSale + 0.08, "decide"],
    [T.gPlanta - 0.06, T.gPlanta + 0.02, "planta"], [T.chulo, T.chulo + 0.2, "chulo"], [T.chulo1, T.chulo1 + 0.25, "sigue"],
    [T.pasmo, T.pasmo + 0.3, "pasmo"], [T.furia, T.furia1, "furia"], [T.gTira, T.gTira + 0.1, "tira"], [T.arriba, T.arriba + 0.2, "arriba"],
    [T.mareo, T.mareo + 0.3, "mareo"], [T.miraArriba, T.miraArriba + 0.35, "alCaballo"], [T.fin - 0.1, T.fin + 0.2, "mareo"]
  ];
  const PARP_G = [0.4, 2.85, 4.0, 6.2, 7.6];
  const P0G = { dx: 0, pel: 0, torso: 0, cab: 0 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    quieto: CuG({ torso: 0.02, cab: 0.04 }),
    aburre: CuG({ torso: -0.02, cab: -0.08 }),
    bosteza: CuG({ torso: -0.08, cab: -0.18, pel: 4 }),
    mira: CuG({ torso: 0.05, cab: 0.07 }),
    coge: CuG({ torso: 0.13, cab: 0.08, pel: 8, dx: 4 }),
    planta: CuG({ torso: 0.17, cab: 0.1, pel: 16, dx: 6 }),
    chulo: CuG({ torso: -0.08, cab: -0.13, pel: -2 }),
    sigue: CuG({ torso: 0.0, cab: 0.04 }),
    pasmo: CuG({ torso: 0.07, cab: 0.11, pel: 6 }),
    furia: CuG({ torso: 0.06, cab: 0.04, pel: 12 }),
    agarra: CuG({ torso: 0.12, cab: 0.06, pel: 22, dx: 3 }),
    tira: CuG({ torso: -0.13, cab: -0.16, pel: -12, dx: -4 }),
    arriba: CuG({ torso: -0.06, cab: -0.2, pel: 4 }),
    encoge: CuG({ torso: 0.07, cab: 0.1, pel: 14 }),
    mareo: CuG({ torso: 0.02, cab: 0.03, pel: 8 })
  };
  const GUION_G = [
    [0.95, 1.3, "aburre"], [T.bostezo, T.bostezo + 0.3, "bosteza"], [T.bostezo1 - 0.1, T.bostezo1 + 0.2, "quieto"],
    [T.gMira, T.gMira + 0.25, "mira"], [T.gSale, T.gToma, "coge"], [T.gArriba, T.gPlanta, "planta", entrada],
    [T.chulo - 0.05, T.chulo + 0.3, "chulo"], [T.chulo1, T.chulo1 + 0.35, "sigue"], [T.pasmo, T.pasmo + 0.35, "pasmo"],
    [T.furia, T.furia1, "furia"], [T.gAgarra, T.gTira, "agarra"], [T.gTira, T.suelta + 0.06, "tira", salida],
    [T.arriba, T.arriba + 0.3, "arriba"], [GOLPES[0] - 0.05, GOLPES[0] + 0.15, "encoge"], [T.mareo + 0.1, T.mareo + 0.6, "mareo"]
  ];
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const PIES_G = { cerca: XG - 30, lejos: XG + 32 };
  const PINZA = 6;                                  // del centro del puño a la cabeza de la pieza cogida (Dari, con dos dedos)
  const AGARRE = { x: 2, y: 9 };                    // de su puño a la base de la dama (Guillermo la agarra a puñado)
  const PISTA_GL = [
    [0, 0, { bols: true }],
    [T.tamb - 0.3, T.tamb, { pant: { x: 466, y: 312 }, mu: 3.0, puno: 1, dedos: D(0.35, 0.2, 0.2, 0.25) }],
    [T.bostezo - 0.05, T.bostezo + 0.18, { boca: { x: 13, y: 2 }, mu: -2.75, puno: 1, dedos: D(0.6, 0.9, 0.92, 0.85) }],
    [T.bostezo1 - 0.05, T.bostezo1 + 0.25, { pant: { x: 466, y: 312 }, mu: 3.0, puno: 1, dedos: D(0.35, 0.2, 0.2, 0.25) }],
    [T.gSale, T.gToma, { pieza: "DB", agarre: true, mu: 2.3, puno: 1, dedos: D(0.3, 0.25, 0.2, 0.18) }],
    [T.gToma + 0.01, T.gArriba, { pant: { x: 500, y: 262 }, mu: 2.3, puno: 1, dedos: D(0.15, 0.1, 0.08, 0.06) }, salida],
    [T.gArriba, T.gPlanta, { casilla: [4, 6], agarre: true, mu: 2.1, puno: 1, dedos: D(0.15, 0.1, 0.08, 0.06) }, entrada],
    [T.gSuelta, T.gVuelve, { bols: true }],
    [T.furia + 0.05, T.furia1, { hom: { x: 60, y: 175 }, mu: -1.4, puno: 1, dedos: D(0, 0, 0, 0) }],
    [T.gAgarra, T.gTira, { borde: true, mu: -2.7, puno: 1, dedos: D(0.5, 0.55, 0.55, 0.55) }],
    [T.gTira, T.suelta, { borde: true, mu: -3.6, puno: 1, dedos: D(0.5, 0.55, 0.55, 0.55) }],
    [T.suelta, T.suelta + 0.2, { hom: { x: 110, y: -235 }, mu: 1.35 - 2 * Math.PI, puno: 1, dedos: D(0.85, 1, 1, 0.95) }, salida],
    [T.arriba + 0.1, T.arriba + 0.5, { colgar: { x: 14, y: 22 }, mu: -1.85, puno: 1, dedos: D(0.6, 0.65, 0.6, 0.55) }],
    [T.mareo + 0.2, T.mareo + 0.8, { colgar: { x: 6, y: 34 }, mu: -1.75, puno: 1, dedos: D(0.55, 0.6, 0.55, 0.5) }]
  ];
  const PISTA_GC = [
    [0, 0, { bols: true }],
    [T.furia, T.furia1, { hom: { x: 40, y: 220 }, mu: -1.3, puno: 1, dedos: D(0, 0, 0, 0) }],
    [T.gTira - 0.04, T.suelta + 0.05, { hom: { x: -70, y: -200 }, mu: 1.5 - 2 * Math.PI, puno: 1, dedos: D(0, 0, 0, 0) }, salida],
    [T.arriba + 0.1, T.arriba + 0.55, { colgar: { x: 10, y: 24 }, mu: -1.65, puno: 1, dedos: D(0.6, 0.65, 0.6, 0.55) }],
    [T.mareo + 0.3, T.mareo + 0.9, { colgar: { x: 4, y: 34 }, mu: -1.75, puno: 1, dedos: D(0.55, 0.6, 0.55, 0.5) }]
  ];
  // ira (0–1): cabeza roja, vena y temblor
  const ira = t => tramo(t, T.furia, T.furia1) * (1 - tramo(t, T.mareo, T.mareo + 1.2));
  const mareo = t => tramo(t, T.mareo, T.mareo + 0.5) * (1 - 0.6 * tramo(t, T.miraArriba, T.miraArriba + 0.4));

  function poseG(t) {
    const b = linea(GUION_G, CUER_G, "quieto", t);
    const respira = Math.sin(t * 2.1 + 0.4);
    const ir = ira(t), tb = 1.7 * ir * (1 - tramo(t, T.suelta, T.suelta + 0.2));
    const bk = golpe(t), ma = mareo(t);
    const sx = tb * ruido(t * 40), sy = tb * 0.5 * ruido(t * 43 + 5);
    const x = XG + b.dx + sx;
    const p = {
      x, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 + sy / S + 16 * bk },
      torso: b.torso + 0.04 * bk + 0.03 * ma * Math.sin(t * 4.2 + 0.7), torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.07 * bk + 0.08 * ma * Math.sin(t * 4.2), dx: 14 * ma * Math.cos(t * 4.2), dy: 30 * bk, esc: { x: 1 + 0.06 * bk, y: 1 - 0.1 * bk } },
      tirasLimpias: true
    };
    // tamborileo: la mano apenas sube y baja; plantar la dama: la cabeza da un cabezazo
    p.cabeza.ang += 0.05 * campana(t, T.gPlanta - 0.04, T.gPlanta + 0.2);
    for (const lado of ["cerca", "lejos"]) {
      p.piernas[lado] = { tob: { x: G.PELVIS.x + (PIES_G[lado] - x) / S, y: TOB_G[lado] }, ang: 0 };
    }
    // cara
    let e = linea(GUION_CG, CG, "inicio", t);
    e = mezclaE(e, GOLPE_E, clamp(bk * 1.3) * (1 - 0.5 * ma));
    const bos = campana(t, T.bostezo + 0.1, T.bostezo1 - 0.05);
    e.abre += 8 * bos * Math.sin((t - T.bostezo) * 5);
    // chulería: cejas que suben y bajan
    const cj = campana(t, T.cejas, T.cejas + 0.5);
    e.sd += 12 * cj * Math.max(0, Math.sin((t - T.cejas) * 25)); e.si += 12 * cj * Math.max(0, Math.sin((t - T.cejas) * 25));
    p.cara = cara(e, bk > 0.3 ? 0 : parpadeo(t, PARP_G));
    p.rojo = 0.92 * ir;
    p.enfado = ir * (1 - tramo(t, T.suelta + 0.3, T.arriba + 0.4));
    p.sudor = 0.7 * campana(t, T.pasmo + 0.2, T.furia + 0.4) + 0.6 * tramo(t, T.arriba, T.arriba + 0.3) * (1 - tramo(t, T.mareo + 0.5, T.mareo + 1.3));
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    const bo = G.boca(p);
    const resuelve = lado => o => {
      let q;
      if (o.bols) { const B = Tr(BOLS_G[lado]); return { x: B.x, y: B.y, mu: -1.75, ang: 0, puno: 0, dedos: D(0.4, 0.4, 0.4, 0.4) }; }
      if (o.colgar) { const B = Tr(BOLS_G[lado]); q = { x: B.x + o.colgar.x, y: B.y + o.colgar.y }; }
      else if (o.pant) q = G.aHoja(p, o.pant);
      else if (o.hom) { const h = lado === "l" ? hl : hc; q = { x: h.x + o.hom.x, y: h.y + o.hom.y }; }
      else if (o.boca) { const bp = G.aPantalla(p, bo); q = G.aHoja(p, { x: bp.x + o.boca.x, y: bp.y + o.boca.y }); }
      else if (o.pieza) { const pz = PZ[o.pieza], c = enCasilla(pz.r, pz.f); q = G.aHoja(p, { x: c.x - AGARRE.x, y: c.y - AGARRE.y }); }
      else if (o.casilla) { const c = enCasilla(o.casilla[0], o.casilla[1]); q = G.aHoja(p, { x: c.x - AGARRE.x, y: c.y - AGARRE.y }); }
      else if (o.borde) { const c = borde(t); q = G.aHoja(p, { x: c.x - 3, y: c.y + 2 }); }
      return { x: q.x, y: q.y, mu: o.mu, ang: o.ang || 0, puno: o.puno, dedos: o.dedos };
    };
    const L = pista(PISTA_GL, t, resuelve("l")), C = pista(PISTA_GC, t, resuelve("c"));
    // tamborileo de dedos sobre la mesa
    const tam = tramo(t, T.tamb, T.tamb + 0.1) * (1 - tramo(t, T.bostezo - 0.08, T.bostezo)) + tramo(t, T.bostezo1 + 0.2, T.bostezo1 + 0.3) * (1 - tramo(t, T.gSale - 0.1, T.gSale));
    if (tam > 0) {
      const f = (ph) => 0.2 + 0.55 * tam * Math.max(0, Math.sin(t * 22 - ph));
      L.dedos = { pulgar: L.dedos.pulgar, indice: lerp(L.dedos.indice, f(0), tam), medio: lerp(L.dedos.medio, f(0.9), tam), anular: lerp(L.dedos.anular, f(1.8), tam), menique: lerp(L.dedos.menique, f(2.7), tam) };
    }
    // puños de rabia que tiemblan
    const tm = 1.4 * tb;
    L.x += tm * ruido(t * 47 + 2) / S; L.y += tm * 0.7 * ruido(t * 51 + 9) / S;
    C.x += tm * ruido(t * 44 + 4) / S; C.y += tm * 0.7 * ruido(t * 49 + 6) / S;
    p.manoCerca = { x: C.x, y: C.y, ang: C.ang, mu: C.mu, dobla: -1, puno: C.puno, dedos: C.dedos };
    p.manoLejos = { x: L.x, y: L.y, ang: L.ang, mu: L.mu, dobla: -1, puno: L.puno, dedos: L.dedos };
    // la dama en el puño (se dibuja por delante: la mano lejana la agarra por detrás)
    p._dama = null;
    if (t >= T.gToma && t < T.gPlanta) { const fist = G.aPantalla(p, L); p._dama = { x: fist.x + AGARRE.x, y: fist.y + AGARRE.y, rot: -0.12 * campana(t, T.gToma, T.gArriba) + 0.1 * campana(t, T.gArriba, T.gPlanta) }; }
    return p;
  }

  /* ================= Dari ================= */
  const CD = {
    base: E({ mx: 0.88, my: 0.5, sonr: 0.18, ancho: 0.85 }),
    piensa: E({ mx: 0.8, my: 0.62, sonr: 0.0, ancho: 0.7, sd: -8, si: 12, gd: -0.18, gi: 0.14, c: 0.12 }),
    mueve: E({ mx: 0.75, my: 0.7, sonr: 0.12, ancho: 0.8, sd: 2, si: 6 }),
    mira: E({ mx: 0.95, my: 0.1, sonr: 0.12, ancho: 0.85, sd: 4, si: 8 }),
    gafas: E({ mx: 0.9, my: 0.15, c: 0.15, sonr: 0.25, ancho: 0.85, sd: 0, si: 10, gi: 0.1 }),
    jugada: E({ mx: 0.7, my: 0.7, sonr: 0.3, ancho: 0.8, sd: 2, si: 8 }),
    mate: E({ mx: 0.95, my: 0.15, c: 0.25, sonr: 0.35, ancho: 0.85, sd: 2, si: 14, gi: 0.12 }),
    taza: E({ mx: 0.4, my: 0.6, sonr: 0.3, ancho: 0.8, sd: 4, si: 4 }),
    sorbe: E({ mx: 0, my: 0, c: 1, h: 0.4, sonr: 0.2, ancho: 0.55, sd: 10, si: 10, gd: 0.1, gi: 0.1 }),
    miraG: E({ mx: 0.95, my: 0.0, c: 0.2, sonr: 0.2, ancho: 0.75, sd: 2, si: 12, gi: 0.1 }),
    camara: E({ mx: -0.85, my: 0.0, c: 0.3, sonr: 0.38, ancho: 0.85, sd: 2, si: 22, gd: -0.04, gi: 0.2 })
  };
  const GUION_CD = [
    [T.piensa, T.piensa + 0.4, "piensa"], [T.dPeon + 0.1, T.dPeon + 0.3, "mueve"], [T.dPeonFin, T.dPeonFin + 0.2, "piensa"],
    [T.gPlanta + 0.05, T.gPlanta + 0.2, "mira"], [T.dGafas + 0.15, T.dGafas + 0.3, "gafas"], [T.dCab, T.dCab + 0.2, "jugada"],
    [T.dCabFin, T.dCabFin + 0.25, "mate"], [T.dTaza, T.dTaza + 0.2, "taza"], [T.sorbo + 0.1, T.sorbo + 0.3, "sorbe"],
    [T.mira, T.mira + 0.2, "miraG"], [T.camaraD, T.camaraD + 0.2, "camara"], [T.sorbo2 + 0.15, T.sorbo2 + 0.3, "sorbe"]
  ];
  const PARP_D = [0.25, 3.6, 5.15, 6.9, 8.4, 11.05];
  const P0D = { pel: 0, torso: 0.02, cab: 0.03 };
  const CuD = o => Object.assign({}, P0D, o);
  const CUER_D = {
    quieto: CuD({}),
    piensa: CuD({ torso: 0.06, cab: 0.12 }),
    peon: CuD({ torso: 0.11, cab: 0.12, pel: 5 }),
    gafas: CuD({ torso: 0.02, cab: 0.0 }),
    caballo: CuD({ torso: 0.16, cab: 0.1, pel: 8 }),
    mate: CuD({ torso: 0.0, cab: -0.02 }),
    taza: CuD({ torso: 0.08, cab: 0.05, pel: 4 }),
    sorbo: CuD({ torso: -0.03, cab: -0.1 }),
    final: CuD({ torso: -0.01, cab: -0.02 })
  };
  const GUION_D = [
    [T.piensa, T.piensa + 0.5, "piensa"], [T.dPeon, T.dPeonToma, "peon"], [T.dPeonDeja, T.dPeonFin, "piensa"],
    [T.dGafas, T.dGafas + 0.3, "gafas"], [T.dCab, T.dCabToma, "caballo"], [T.dCabDeja, T.dCabFin, "mate"],
    [T.dTaza, T.dTazaToma, "taza"], [T.dTazaToma, T.dTazaSube, "mate"], [T.sorbo, T.sorbo + 0.35, "sorbo"],
    [T.sorbo1 - 0.1, T.sorbo1 + 0.3, "final"], [T.sorbo2, T.sorbo2 + 0.3, "sorbo"], [T.sorbo21, T.sorbo21 + 0.3, "final"]
  ];
  const BARBILLA = { x: 850, y: 800 }, PUENTE = { x: 884, y: 515 };
  // fondo de la taza cuando el puño agarra el asa (pantalla), según lo inclinada que esté
  const fondoTaza = (f, rot) => { const a = rota({ x: ASA.x * ESC_TAZA, y: ASA.y * ESC_TAZA }, rot); return { x: f.x - a.x, y: f.y - a.y }; };
  const PISTA_DL = [
    [0, 0, { bols: true }],
    [T.dPeon, T.dPeonToma, { pieza: "PN1", mu: -2.05, puno: 1, dedos: D(0.4, 0.42, 0.36, 0.32) }],
    [T.dPeonToma + 0.02, T.dPeonDeja, { casilla: [5, 3], alto: ALTO.peon, mu: -2.05, puno: 1, dedos: D(0.4, 0.42, 0.36, 0.32) }],
    [T.dPeonDeja + 0.04, T.dPeonFin, { bols: true }],
    [T.dCab, T.dCabToma, { pieza: "CN", mu: -2.1, puno: 1, dedos: D(0.4, 0.42, 0.36, 0.32) }],
    [T.dCabToma + 0.02, T.dCabDeja, { casilla: [3, 5], alto: ALTO.caballo, mu: -2.2, puno: 1, dedos: D(0.4, 0.42, 0.36, 0.32) }],
    [T.dCabDeja + 0.05, T.dCabFin, { bols: true }],
    [T.dTaza, T.dTazaToma, { taza: true, mu: 2.6, puno: 1, dedos: D(0.35, 0.3, 0.26, 0.22) }],
    [T.dTazaToma + 0.02, T.dTazaSube, { hom: { x: 80, y: 165 }, mu: 2.5, puno: 1, dedos: D(0.35, 0.3, 0.26, 0.22) }],
    [T.sorbo, T.sorbo + 0.35, { boca: { x: 7, y: 13 }, mu: 2.0, puno: 1, dedos: D(0.35, 0.3, 0.26, 0.22) }],
    [T.sorbo1, T.sorbo1 + 0.3, { hom: { x: 80, y: 165 }, mu: 2.5, puno: 1, dedos: D(0.35, 0.3, 0.26, 0.22) }],
    [T.brindis, T.brindis + 0.2, { hom: { x: 100, y: 120 }, mu: 2.4, puno: 1, dedos: D(0.35, 0.3, 0.26, 0.22) }],
    [T.sorbo2, T.sorbo2 + 0.3, { boca: { x: 7, y: 13 }, mu: 2.0, puno: 1, dedos: D(0.35, 0.3, 0.26, 0.22) }]
  ];
  const PISTA_DC = [
    [0, 0, { bols: true }],
    [T.piensa, T.piensa + 0.5, { cab: BARBILLA, off: { x: 3, y: 9 }, mu: 1.85, puno: 1, dedos: D(0.2, 0.12, 0.06, 0.05) }],
    [T.dGafas, T.dEmpuja - 0.02, { cab: PUENTE, off: { x: 5, y: 17 }, mu: 1.95, puno: 1, dedos: D(0.25, 0.55, 0.12, 0.08) }],
    [T.dEmpuja, T.dEmpuja + 0.1, { cab: PUENTE, off: { x: 5, y: 13 }, mu: 1.95, puno: 1, dedos: D(0.25, 0.55, 0.12, 0.08) }],
    [T.dEmpuja + 0.16, T.dGafas1 + 0.2, { bols: true }]
  ];
  // gafas: escurridas mientras piensa; se las sube de un toque
  const gafasDy = t => 9 * tramo(t, T.piensa, T.piensa + 1.2) * (1 - tramo(t, T.dEmpuja, T.dEmpuja + 0.12));
  function brilloGafas(t) {
    let o = 0;
    for (const tb of T.brillos) o = Math.max(o, campana(t, tb, tb + 0.42));
    return Math.max(o, 1.25 * campana(t, T.dBrillo - 0.08, T.dBrillo + 0.5));
  }

  function poseD(t) {
    const b = linea(GUION_D, CUER_D, "quieto", t);
    const respira = Math.sin(t * 1.9 + 1.4);
    const p = {
      x: XD, suelo: SUELO, s: S, espejo: true,
      pelvis: { x: Da.PELVIS.x, y: Da.PELVIS.y + b.pel + respira * 1.1 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      tirasLimpias: true
    };
    // piensa: la cabeza da un par de cabeceos lentos
    p.cabeza.ang += 0.025 * Math.sin(t * 2.4) * campana(t, T.piensa, T.dPeon);
    const ty = Da.SUELO - Da.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: Da.PELVIS.x - 90, y: ty }, ang: 0 };
    p.piernas.lejos = { tob: { x: Da.PELVIS.x + 96, y: ty - 10 }, ang: 0 };
    const e = linea(GUION_CD, CD, "base", t);
    // sorbo: mejillas y garganta (la boca queda tapada por la taza)
    p.cara = cara(e, e.c > 0.8 ? 0 : parpadeo(t, PARP_D, 0.13));
    const gdy = gafasDy(t), kb = brilloGafas(t);
    p.gafas = { dx: 0, dy: gdy, ang: 0 };
    p.capaCabeza = g => brillo(g, t, kb, gdy);
    // manos
    const bo = Da.boca(p);
    const H = Da.cabeza(p);
    const resuelve = lado => o => {
      if (o.bols) { const m = Da.manoReposo(p, lado); return { x: m.x, y: m.y, mu: -1.75, ang: 0, puno: 0, dedos: D(0.4, 0.4, 0.4, 0.4) }; }
      let q;
      if (o.pieza) { const pz = PZ[o.pieza], c = enCasilla(pz.r, pz.f); q = Da.aHoja(p, { x: c.x, y: c.y - ALTO[pz.tipo] - PINZA }); }
      else if (o.casilla) { const c = enCasilla(o.casilla[0], o.casilla[1]); q = Da.aHoja(p, { x: c.x, y: c.y - o.alto - PINZA }); }
      else if (o.taza) q = Da.aHoja(p, { x: PLATO.x + ASA.x * ESC_TAZA, y: PLATO.y - 1 + ASA.y * ESC_TAZA });
      else if (o.hom) { const h = Da.tronco(p)(lado === "lejos" ? Da.HOMBRO : Da.HOMBRO_C); q = { x: h.x + o.hom.x, y: h.y + o.hom.y }; }
      else if (o.boca) { const bp = Da.aPantalla(p, bo); q = Da.aHoja(p, { x: bp.x + o.boca.x, y: bp.y + o.boca.y }); }
      else if (o.cab) { const c = Da.aPantalla(p, H.a(o.cab)); q = Da.aHoja(p, { x: c.x + o.off.x, y: c.y + o.off.y }); }
      return { x: q.x, y: q.y, mu: o.mu, ang: o.ang || 0, puno: o.puno, dedos: o.dedos };
    };
    const L = pista(PISTA_DL, t, resuelve("lejos")), C = pista(PISTA_DC, t, resuelve("cerca"));
    // salto del caballo
    const ks = fase(t, T.dCabToma + 0.02, T.dCabDeja);
    if (ks > 0 && ks < 1) L.y -= 26 / S * Math.sin(Math.PI * suave(ks));
    // pensando: el puño frota un poco la barbilla
    const fr = campana(t, T.piensa + 0.5, T.dGafas);
    C.x += 1.2 * fr * Math.sin(t * 3.1) / S;
    p.manoLejos = { x: L.x, y: L.y, ang: L.ang, mu: L.mu, dobla: -1, puno: L.puno, dedos: L.dedos };
    p.manoCerca = { x: C.x, y: C.y, ang: C.ang, mu: C.mu, dobla: -1, puno: C.puno, dedos: C.dedos };
    // pieza o taza en la mano
    const fist = Da.aPantalla(p, L);
    let obj = null;
    if (t >= T.dPeonToma && t < T.dPeonDeja) obj = g => pieza(g, "peon", "n", fist.x, fist.y + PINZA + ALTO.peon, 0);
    else if (t >= T.dCabToma && t < T.dCabDeja) obj = g => pieza(g, "caballo", "n", fist.x, fist.y + PINZA + ALTO.caballo, -0.35 * Math.sin(Math.PI * ks));
    else if (t >= T.dTazaToma) {
      const sorbe = tramo(t, T.sorbo + 0.15, T.sorbo + 0.4) * (1 - tramo(t, T.sorbo1 - 0.05, T.sorbo1 + 0.2)) + tramo(t, T.sorbo2 + 0.15, T.sorbo2 + 0.4);
      const rt = 0.75 * sorbe, f0 = fondoTaza(fist, rt);
      p._taza = { x: f0.x, y: f0.y, rot: rt };
    }
    if (obj) p.manoLejos.objeto = g => { if (!MATRIZ) return; g.save(); g.setTransform(MATRIZ); obj(g); g.restore(); };
    p._L = L;
    return p;
  }

  /* ---------- destello en las gafas (coordenadas del retrato, encima de las gafas) ---------- */
  const ARO_D = [[729, 474], [744, 471], [789, 478], [833, 496], [858, 509], [861, 517], [849, 545], [837, 569], [823, 579], [789, 575], [745, 561], [734, 553], [729, 530]];
  function brillo(g, t, k, dy) {
    if (k <= 0.01) return;
    g.save(); g.translate(0, dy); g.lineJoin = "round";
    // el cristal se pone blanco
    g.save(); g.beginPath(); g.moveTo(ARO_D[0][0], ARO_D[0][1]); for (const [x, y] of ARO_D.slice(1)) g.lineTo(x, y); g.closePath(); g.clip();
    g.globalAlpha = 0.85 * clamp(k); g.fillStyle = "#ffffff"; g.fillRect(720, 460, 150, 130);
    g.globalAlpha = 0.9 * clamp(k); g.strokeStyle = "#dff0ff"; g.lineWidth = 16; g.beginPath(); g.moveTo(752, 572); g.lineTo(800, 474); g.stroke();
    g.restore();
    // chispa de cuatro puntas
    const r = 95 * k, cx = 828, cy = 498, a = 0.3 + t * 1.5;
    g.globalAlpha = clamp(k);
    const halo = g.createRadialGradient(cx, cy, 2, cx, cy, r * 0.7); halo.addColorStop(0, "rgba(255,255,255,0.9)"); halo.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = halo; g.beginPath(); g.arc(cx, cy, r * 0.7, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath();
    for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.12 : (i % 4 === 0 ? r : r * 0.62), an = a + i * Math.PI / 4; g.lineTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr); }
    g.closePath(); g.fill();
    g.restore();
  }

  /* ================= efectos ================= */
  function estrella(g, x, y, r, a, col) {
    g.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r, an = a + i * Math.PI / 5 - Math.PI / 2; g.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); } g.closePath();
    g.fillStyle = col; g.fill(); g.lineWidth = 1.4; g.strokeStyle = TINTA; g.stroke();
  }
  // estrellitas que saltan en cada golpe
  function chispazos(g, t) {
    for (const tg of GOLPES) {
      const k = fase(t, tg, tg + 0.38); if (k <= 0 || k >= 1) continue;
      const c = coronaEn(tg).c;
      g.save(); g.globalAlpha = 1 - k * k;
      for (let i = 0; i < 3; i++) {
        const an = -Math.PI / 2 + (i - 1) * 0.9 + 0.3 * (hash(tg * 10 + i) - 0.5), d = 10 + 26 * salida(k);
        estrella(g, c.x + Math.cos(an) * d, c.y + Math.sin(an) * d, 4.2 * (1 - 0.4 * k), k * 4, "#ffe14a");
      }
      g.restore();
    }
  }
  // estrellitas del mareo girando alrededor de la cabeza
  function mareoEstrellas(g, t, pG) {
    const a = tramo(t, T.mareo, T.mareo + 0.4) * (1 - tramo(t, T.fin - 0.2, T.fin + 0.4));
    if (a <= 0.01) return [];
    const c = coronaG(pG), atras = [], delante = [];
    for (let i = 0; i < 3; i++) {
      const an = t * 4.5 + i * Math.PI * 2 / 3, x = c.x + Math.cos(an) * 36, y = c.y + 6 + Math.sin(an) * 8;
      (Math.sin(an) < 0 ? atras : delante).push([x, y, an]);
    }
    return { atras, delante, a };
  }
  function pintaEstrellas(g, lista, a) {
    if (!lista || !lista.length) return;
    g.save(); g.globalAlpha = a; for (const [x, y, an] of lista) estrella(g, x, y, 6, an, "#ffe14a"); g.restore();
  }
  // polvo cuando cae el tablero
  function polvo(g, t) {
    const k = fase(t, T.tabCae, T.tabCae + 0.6); if (k <= 0 || k >= 1) return;
    g.save(); g.fillStyle = "#d8c8b0";
    for (let i = 0; i < 7; i++) {
      const s = i % 2 ? 1 : -1, d = 20 + 50 * salida(k) * (0.6 + 0.5 * hash(i + 600));
      g.globalAlpha = 0.55 * (1 - k);
      g.beginPath(); g.arc(TAB_FIN.x + s * d, TAB_FIN.y + 4 - 8 * hash(i + 601) * k, 5 + 9 * k, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  // el caballo encima del pelo, bamboleándose
  function caballoEnPelo(g, t, pG) {
    if (t < T.caballo) return;
    const c = coronaG(pG), v = t - T.caballo;
    const w = 0.42 * Math.sin(v * 11) * Math.exp(-v * 2.6) + 0.12 * mareo(t) * Math.sin(t * 4.2 + 1.3);
    const ap = 1 + 0.18 * Math.sin(v * 22) * Math.exp(-v * 9);
    g.save(); g.translate(c.x, c.y); g.rotate(pG.cabeza.ang + w); g.scale(1 / ap, ap); pieza(g, "caballo", "n", 0, 0, 0, ESC_V); g.restore();
  }

  /* ================= escena ================= */
  const pose = t => ({ g: poseG(t), d: poseD(t) });
  // cámara: general; se acerca al tablero mientras piensan; al rey que cae; a Guillermo furioso; y se abre para la lluvia
  const PLANOS = [
    [0, 1.08, 512, 300], [0.6, 1.08, 512, 300], [2.3, 1.38, 506, 262], [6.35, 1.4, 504, 262], [7.0, 1.62, 488, 262], [7.55, 1.62, 488, 262],
    [8.05, 1.5, 445, 236], [8.45, 1.5, 445, 236], [9.15, 1.22, 455, 285], [10.85, 1.22, 455, 285], [11.8, 1.12, 482, 305], [DUR, 1.14, 482, 305]
  ];
  function camara(t) {
    let i = 0; while (i < PLANOS.length - 2 && t > PLANOS[i + 1][0]) i++;
    const a = PLANOS[i], b = PLANOS[i + 1], k = suave(fase(t, a[0], b[0]));
    const kk = lerp(a[1], b[1], k), x = lerp(a[2], b[2], k), y = lerp(a[3], b[3], k);
    const mx = W / 2 / kk, my = H / 2 / kk;
    return { k: kk, x: clamp(x, mx - 40, W + 40 - mx), y: clamp(y, my - 60, H + 60 - my) };
  }

  class GuillermoDariAjedrez extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Da.listo()) return;
      if (!fondo) fondo = creaFondo();
      const pG = poseG(t), pD = poseD(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      MATRIZ = g.getTransform();
      g.drawImage(fondo, -40, -60);
      // sombras
      g.save(); g.fillStyle = "rgba(20,6,0,0.32)";
      g.beginPath(); g.ellipse(pG.x + 4, SUELO + 2, 64, 7, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pD.x - 4, SUELO + 2, 62, 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
      // tablero y piezas que van con él (o tirado detrás de Guillermo)
      const tb = estadoTablero(t);
      if (t >= T.suelta) polvo(g, t);
      tablero(g, tb.x, tb.y, tb.th, tb.psi);
      const est = PIEZAS.map(pz => ({ pz, e: estadoPieza(pz, t) }));
      est.filter(o => o.e.modo === "tablero" || o.e.modo === "mesa").sort((a, b) => a.e.y - b.e.y)
        .forEach(({ pz, e }) => pieza(g, pz.tipo, pz.col, e.x, e.y, e.rot, e.esc));
      // taza en el platillo (hasta que Dari la coge) y su vapor
      if (t < T.dTazaToma) { taza(g, PLATO.x, PLATO.y - 1, 0); vapor(g, t, PLATO.x, PLATO.y - 1 - 12 * ESC_TAZA, 1); }
      Da.dibujar(g, pD, t);
      // la taza en la mano de Dari va por delante de los dedos (la sujeta por detrás, del asa)
      if (pD._taza) taza(g, pD._taza.x, pD._taza.y, pD._taza.rot);
      if (pD._taza) { const tz = pD._taza, a = rota({ x: 0, y: -12 * ESC_TAZA }, tz.rot); vapor(g, t, tz.x + a.x, tz.y + a.y, 1 - tramo(t, T.sorbo, T.sorbo + 0.3) * (1 - tramo(t, T.sorbo1, T.sorbo1 + 0.3)) - tramo(t, T.sorbo2, T.sorbo2 + 0.3)); }
      const me = mareoEstrellas(g, t, pG);
      pintaEstrellas(g, me.atras, me.a);
      G.dibujar(g, pG, t);
      if (pG._dama) pieza(g, "dama", "b", pG._dama.x, pG._dama.y, pG._dama.rot);
      caballoEnPelo(g, t, pG);
      pintaEstrellas(g, me.delante, me.a);
      // piezas por el aire y en el suelo
      est.filter(o => o.e.modo === "aire" || o.e.modo === "suelo").sort((a, b) => a.e.y - b.e.y)
        .forEach(({ pz, e }) => pieza(g, pz.tipo, pz.col, e.x, e.y - (e.modo === "suelo" ? 4.5 * ESC_V * Math.abs(Math.sin(e.rot)) : 0), e.rot, e.esc));
      chispazos(g, t);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00051", nombre: "Guillermo y Dari · El ajedrez", crear: () => new GuillermoDariAjedrez() });
  window.__A2D_00051 = { pose, poseG, poseD, T, DUR };
})();
