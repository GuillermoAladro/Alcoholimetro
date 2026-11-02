"use strict";
/* 00134 · Guillermo y Yorgi · La hamburguesa gigante
 *
 * Negro → una hamburguesería de las de antes: pared verde menta con una franja roja y molduras de
 * cromo, zócalo de escay rojo acolchado, suelo de baldosa blanca y negra, dos pizarras de menú solo
 * con dibujos (hamburguesa, patatas, perrito, batido, refresco, cucurucho; los precios son estrellitas)
 * y un neón con forma de hamburguesa. En medio, una barra en península con encimera de formica y
 * canto de cromo que llega hasta la ventanilla de la cocina (luz naranja, vapor y un timbre). En la
 * barra: un batido con nata, guinda y pajita de rayas, los biberones de kétchup y mostaza (sin
 * etiquetas) y un servilletero. Guillermo y Yorgi, sentados en taburetes de cromo con asiento rojo.
 *
 * ¡Ding! (el timbre de la ventanilla): desde la cocina (el cocinero no se ve) salen deslizándose dos
 * platos con dos torres de hamburguesa (pan, carne, queso que gotea, lechuga, tomate, cebolla, carne,
 * queso, pepinillos y pan con sésamo, con un palillo y su banderita de cuadros) y se paran delante de
 * cada uno bamboleándose como un flan. Guillermo se queda con la boca abierta; Yorgi se frota las
 * manos, la coge con las dos manos, desencaja la mandíbula hasta el pecho y se la come en TRES
 * bocados (arriba, en medio y el resto de golpe, palillo incluido; cada mordisco deja la marca de los
 * dientes), masticando entre uno y otro con la cara hinchada; traga y se da palmaditas en la barriga.
 * Guillermo traga saliva mirando a cámara, se arma de valor y lo intenta: abre la boca todo lo que
 * puede (poco), tiembla, se pone rojo… no cabe, así que la aplasta entre las manos (una encima y otra
 * debajo): la torre se comprime, el kétchup y la mostaza salen a chorro por los dos lados y le ponen
 * perdida la cara (manchas que se quedan y gotean). Aparta la mano de abajo del susto y la torre,
 * colgando del pan de arriba, se desmorona: las capas resbalan y caen de una en una a su regazo, cada
 * una con su botecito, mientras él las sigue con la mirada y Yorgi aguanta la risa (y hace «¡uy!» con
 * cada una). Le queda la tapa en la mano. Yorgi, sonriendo, saca una servilleta del servilletero y se
 * la ofrece; Guillermo deja la tapa en el plato, la coge, se la remete en el cuello de la camiseta a
 * modo de babero (tarde), recoge la tapa, le da un mordisquito diminuto con toda la dignidad del mundo y
 * los dos miran a cámara (Yorgi, con el pulgar arriba) → negro.
 *
 * La mandíbula de Yorgi es una capa propia en el retrato (barba de la mandíbula caída, boca, dientes y
 * lengua) que se abre y se cierra de golpe. Todo depende de `t` (determinista). Los objetos que pasan
 * de la barra a la mano se dibujan con la misma función y en la misma posición en los dos sitios.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, hash, campana, mezcla } = M2;
  const G = Guillermo, Y = Yorgi;
  const DUR = 14.9;
  const TINTA = "#0b0a0e", TAU = Math.PI * 2;
  const P = (x, y) => ({ x, y });
  const rotP = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };

  /* ---------- guion (s) ---------- */
  const T = {
    ding: 0.82, sale: 0.98, llega: 1.6,
    gPasmo: 1.42, yAnsia: 1.5, frota0: 1.62, frota1: 2.05,
    yCoge: 2.12, yAlza: 2.42,
    // los tres bocados de Yorgi: abre (a), cierra de golpe (m), aparta (b)
    a1: 2.62, m1: 2.86, b1: 2.98, a2: 3.5, m2: 3.74, b2: 3.86, a3: 4.38, m3: 4.62, b3: 4.74,
    yTraga: 5.32, yBarriga0: 5.5, yBarriga1: 6.15,
    // Guillermo se arma de valor
    gCamara: 4.84, gTraga: 5.2, gDecide: 5.5, gVa: 5.62, gCoge: 5.86, gAlza: 6.16,
    gAbre: 6.32, gEsfuerzo: 6.6, gAprieta0: 7.06, gAprieta1: 7.56, chorro: 7.56, impacto: 7.66,
    gSuelta: 7.86, gSueltaFin: 8.08,
    // se desmorona (las capas caen de abajo arriba)
    caida: [8.3, 8.56, 8.78, 8.98, 9.16, 9.32, 9.47, 9.6, 9.72],
    gMiraTapa: 10.0, gDeja0: 10.08, gDeja: 10.42,
    // la servilleta
    yServ0: 9.95, yServ: 10.25, yOfrece: 10.62, gVaServ: 10.5, gToma: 10.82, yVuelve: 10.95,
    gMete0: 10.95, gMete: 11.38, gPalpa: 11.55, gRecoge: 11.92,
    // el mordisquito
    gBollo0: 11.95, gBollo: 12.26, gMuerde: 12.34, gAparta: 12.46, gMastica1: 12.98,
    gCamara2: 13.04, yCamara: 13.18, fin: 14.06
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
  const RELAJA = D(0.6, 0.7, 0.66, 0.62, 0.58), AGARRA = D(0.32, 0.18, 0.16, 0.16, 0.16), PINZA = D(0.4, 0.32, 0.14, 0.12, 0.12),
    ABIERTA = D(0.95, 1, 1, 1, 1), MESA = D(0.55, 0.8, 0.76, 0.72, 0.68), BANDEJA = D(0.7, 0.55, 0.5, 0.48, 0.45),
    APRIETA = D(0.55, 0.75, 0.72, 0.7, 0.66), PUNO = D(0, 0, 0, 0, 0), PULGAR = D(1, 0, 0, 0, 0);

  /* ---------- caras (mismos campos para los dos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, mof: 0, wd: 0, wi: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: clamp(e.mx, -1, 1), y: clamp(e.my, -1, 1) }, iris: e.iris, espiral: 0,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: clamp(e.mof), rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista, d = 0.15) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const mastica = (t, t0, t1, f = 13) => { const k = dentro(t, t0, t0 + 0.08, t1 - 0.12, t1); return k * (0.5 + 0.5 * Math.sin((t - t0) * f - Math.PI / 2)); };
  // mirar a un punto de pantalla (ojos hacia allí, con peso k)
  function miraA(ex, R, p, q, k) {
    if (!q || k <= 0.001) return;
    const c = R.aPantalla(p, R.centroCabeza(p));
    let dx = (q.x - c.x) / 60, dy = (q.y - c.y) / 60;
    if (p.espejo) dx = -dx;
    const n = Math.max(1, Math.hypot(dx, dy));
    ex.mx = lerp(ex.mx, clamp(dx / n * 1.1, -1, 1), k); ex.my = lerp(ex.my, clamp(dy / n * 1.1, -1, 1), k);
  }

  /* =====================================================================================
   * DISPOSICIÓN (px de pantalla, antes de la cámara)
   * ===================================================================================== */
  const S = 0.32, SUELO = 578, XG = 352, XY = 672;
  const ASIENTO = 158, Y_ASIENTO = SUELO - ASIENTO, Y_PELVIS = Y_ASIENTO - 20, Y_ARO = SUELO - 64;
  const PEL_G = G.SUELO + (Y_PELVIS - SUELO) / S - G.PELVIS.y;
  const PEL_Y = Y.SUELO + (Y_PELVIS - SUELO) / (S * Y.K) - Y.PELVIS.y;
  // la barra: encimera en trapecio (atrás contra la pared, delante el canto de cromo)
  const BARRA = { y0: 296, y1: 336, xa0: 470, xa1: 558, xd0: 444, xd1: 584, canto: 13 };
  const bordeIzq = y => lerp(BARRA.xa0, BARRA.xd0, (y - BARRA.y0) / (BARRA.y1 - BARRA.y0));
  const bordeDer = y => lerp(BARRA.xa1, BARRA.xd1, (y - BARRA.y0) / (BARRA.y1 - BARRA.y0));
  const escBarra = y => lerp(0.8, 1, clamp((y - BARRA.y0) / (BARRA.y1 - BARRA.y0)));
  const PLATO_G = P(476, 331), PLATO_Y = P(552, 331);
  const SERVILLETERO = P(549, 308);

  /* =====================================================================================
   * PISTAS (pantalla): [t0, t1, objetivo, curva] — objetivo: objeto o función (t) → objeto.
   * ===================================================================================== */
  const ANG = { a: 1, mu: 1 };
  const evalua = (o, t) => (typeof o === "function" ? o(t) : o);
  function mezclaO(x, y, k) {
    const o = Object.assign({}, x);
    for (const n in y) {
      if (x[n] === undefined) { o[n] = y[n]; continue; }
      if (n === "d") o[n] = mezclaD(x[n], y[n], k);
      else if (ANG[n]) o[n] = lerpAng(x[n], y[n], k);
      else if (typeof y[n] === "number") o[n] = lerp(x[n], y[n], k);
      else o[n] = k < 0.5 ? x[n] : y[n];
    }
    return o;
  }
  function pista(lista, t) {
    let c = evalua(lista[0][2], t);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i]; if (t <= t0) break;
      c = mezclaO(c, evalua(obj, t), (f || suave)(fase(t, t0, t1)));
    }
    return c;
  }
  function manoRig(rig, p, m, dobla, objeto) {
    const h = rig.aHoja(p, m);
    return { x: h.x, y: h.y, ang: 0, mu: p.espejo ? Math.PI - m.mu : m.mu, puno: 1, dedos: m.d, dobla, objeto };
  }
  let BASE_M = null;
  function conCamara(g, f) { g.save(); g.setTransform(BASE_M); f(); g.restore(); }

  /* =====================================================================================
   * LA HAMBURGUESA (pantalla). Local: origen en el centro de la base, y hacia abajo (la torre en y < 0).
   * b = { x, y, a, e, sq (aplastada 0..1), com (comida desde la derecha 0..1), desde (capas que ya se
   *       han caído por abajo), piv ("base" | "tapa": el punto {x, y} es la base o lo alto del pan),
   *       wob (bamboleo), nib (mordisquito en la tapa 0..1) }
   * ===================================================================================== */
  const EH = 0.95;
  const CAPAS = [
    { n: "panB", h: 10, hw: 27, bl: 0.15 },
    { n: "carne", h: 9, hw: 28.5, bl: 0.08 },
    { n: "queso", h: 2.6, hw: 30, bl: 0.4 },
    { n: "lechuga", h: 5, hw: 31.5, bl: 0.5 },
    { n: "tomate", h: 5, hw: 27.5, bl: 0.45 },
    { n: "cebolla", h: 4, hw: 27, bl: 0.35 },
    { n: "carne", h: 9, hw: 28.5, bl: 0.08 },
    { n: "queso", h: 2.6, hw: 30, bl: 0.4 },
    { n: "pepino", h: 3.4, hw: 24, bl: 0.3 },
    { n: "panT", h: 20, hw: 28, bl: 0.2 }
  ];
  const NC = CAPAS.length, HWMAX = 31.5;
  const altoCapa = (c, sq) => c.h * (1 - sq * (0.22 + c.bl));
  const anchoCapa = (c, sq) => c.hw * (1 + sq * (0.08 + 0.45 * c.bl));
  const altoTorre = (sq, desde = 0) => { let h = 0; for (let i = desde; i < NC; i++) h += altoCapa(CAPAS[i], sq); return h; };
  const ALTO0 = altoTorre(0);
  const TINTA_H = "#3a2412";

  function dibCapa(g, c, hw, h, i, t, sal) {
    g.lineJoin = "round"; g.lineCap = "round";
    switch (c.n) {
      case "panB": {
        const f = () => { g.beginPath(); g.moveTo(-hw, -h); g.lineTo(hw, -h); g.lineTo(hw, -h * 0.45); g.quadraticCurveTo(hw, 0, hw - 6, 0); g.lineTo(-hw + 6, 0); g.quadraticCurveTo(-hw, 0, -hw, -h * 0.45); g.closePath(); };
        f(); const gr = g.createLinearGradient(0, -h, 0, 0); gr.addColorStop(0, "#f2c27c"); gr.addColorStop(0.35, "#d99448"); gr.addColorStop(1, "#b8732e"); g.fillStyle = gr; g.fill();
        g.fillStyle = "rgba(255,236,196,0.8)"; g.fillRect(-hw + 1, -h, 2 * hw - 2, 2.2);
        f(); g.lineWidth = 1.3; g.strokeStyle = TINTA_H; g.stroke();
        return f;
      }
      case "carne": {
        const n = 14, top = [], bot = [];
        for (let k = 0; k <= n; k++) { const x = -hw + 2 * hw * k / n; top.push(P(x, -h + 0.9 * (hash(i * 31 + k) - 0.5) * 2)); bot.push(P(x, 0.8 * (hash(i * 17 + k * 3) - 0.5) * 2)); }
        const f = () => { g.beginPath(); g.moveTo(top[0].x + 2, top[0].y + 1); for (const q of top) g.lineTo(q.x, q.y);
          g.quadraticCurveTo(hw + 2.4, -h / 2, bot[n].x, bot[n].y); for (let k = n; k >= 0; k--) g.lineTo(bot[k].x, bot[k].y);
          g.quadraticCurveTo(-hw - 2.4, -h / 2, top[0].x, top[0].y); g.closePath(); };
        f(); g.fillStyle = "#5e3420"; g.fill();
        g.save(); f(); g.clip();
        g.fillStyle = "#43220f"; for (let k = 0; k < 12; k++) { g.beginPath(); g.ellipse(-hw + 2 * hw * hash(i + k * 7.7), -h * (0.2 + 0.6 * hash(k * 3.3 + i)), 1.6, 0.9, 0, 0, TAU); g.fill(); }
        g.fillStyle = "rgba(160,104,70,0.65)"; g.fillRect(-hw, -h + 0.6, 2 * hw, 1.4);
        g.fillStyle = "rgba(30,12,4,0.35)"; g.fillRect(-hw, -1.6, 2 * hw, 2);
        g.restore();
        f(); g.lineWidth = 1.3; g.strokeStyle = "#24120a"; g.stroke();
        return f;
      }
      case "queso": {
        const go = [[-hw + 1.5, 7 + 3 * sal], [-hw * 0.32, 3.5 + 2 * sal], [hw * 0.28, 5 + 3 * sal], [hw - 1.5, 8.5 + 3 * sal]];
        const f = () => { g.beginPath(); g.moveTo(-hw, -h); g.lineTo(hw, -h); g.lineTo(hw, 0);
          for (let k = go.length - 1; k >= 0; k--) { const [x, d] = go[k]; g.lineTo(x + 3.2, 0); g.quadraticCurveTo(x + 2.2, d * 0.75, x, d); g.quadraticCurveTo(x - 2.2, d * 0.75, x - 3.2, 0); }
          g.lineTo(-hw, 0); g.closePath(); };
        f(); g.fillStyle = "#f7c531"; g.fill();
        g.fillStyle = "rgba(255,240,170,0.75)"; g.fillRect(-hw + 2, -h + 0.4, 2 * hw - 4, 0.9);
        f(); g.lineWidth = 1; g.strokeStyle = "#a8740c"; g.stroke();
        return f;
      }
      case "lechuga": {
        const n = 16, top = [], bot = [];
        for (let k = 0; k <= n; k++) { const x = -hw + 2 * hw * k / n; top.push(P(x, -h - 1.4 * Math.abs(Math.sin(k * 1.9 + i)))); bot.push(P(x, 1.6 * Math.abs(Math.sin(k * 2.3 + 1 + i)))); }
        const f = () => { g.beginPath(); g.moveTo(-hw - 2, -h * 0.5); for (const q of top) g.lineTo(q.x, q.y); g.lineTo(hw + 2.5, -h * 0.3);
          g.quadraticCurveTo(hw + 3.5, 2.5, hw - 1, bot[n].y + 1); for (let k = n; k >= 0; k--) g.lineTo(bot[k].x, bot[k].y);
          g.quadraticCurveTo(-hw - 3.5, 2.5, -hw - 2, -h * 0.5); g.closePath(); };
        f(); g.fillStyle = "#7cc43f"; g.fill();
        g.save(); f(); g.clip(); g.fillStyle = "#a6e06a"; g.fillRect(-hw - 4, -h - 2, 2 * hw + 8, 2.2);
        g.strokeStyle = "#4f9a2a"; g.lineWidth = 0.7; for (let k = 0; k < 7; k++) { const x = -hw + 4 + k * (2 * hw - 8) / 6; g.beginPath(); g.moveTo(x, -h + 1); g.quadraticCurveTo(x + 2, -h / 2, x - 1, 0); g.stroke(); }
        g.restore();
        f(); g.lineWidth = 1; g.strokeStyle = "#2f5e19"; g.stroke();
        return f;
      }
      case "tomate": {
        const f = () => { g.beginPath(); g.roundRect(-hw, -h, 2 * hw, h, h * 0.5); };
        f(); g.fillStyle = "#df3a2a"; g.fill();
        g.save(); f(); g.clip();
        g.fillStyle = "#f47a5c"; g.fillRect(-hw, -h * 0.62, 2 * hw, h * 0.3);
        g.fillStyle = "#f6d25a"; for (const x of [-hw + 4, -hw + 7.5, hw - 4, hw - 7.5, -2, 2]) { g.beginPath(); g.ellipse(x, -h * 0.5, 0.9, 0.55, 0, 0, TAU); g.fill(); }
        g.strokeStyle = "rgba(120,20,12,0.6)"; g.lineWidth = 0.7; g.beginPath(); g.moveTo(0, -h); g.lineTo(0, 0); g.stroke();
        g.restore();
        f(); g.lineWidth = 1; g.strokeStyle = "#7a1a10"; g.stroke();
        return f;
      }
      case "cebolla": {
        const f = () => { g.beginPath(); g.roundRect(-hw, -h, 2 * hw, h, h * 0.45); };
        f(); g.fillStyle = "#f6eff6"; g.fill();
        g.strokeStyle = "#9b5fb0"; g.lineWidth = 0.9;
        g.beginPath(); g.moveTo(-hw + 2, -h + 0.6); g.lineTo(hw - 2, -h + 0.6); g.moveTo(-hw + 2, -0.6); g.lineTo(hw - 2, -0.6); g.stroke();
        // aros que asoman por los lados
        for (const sg of [-1, 1]) { g.beginPath(); g.ellipse(sg * (hw + 1.6), -h * 0.5, 3.2, h * 0.75, 0, 0, TAU); g.lineWidth = 1.6; g.strokeStyle = "#f6eff6"; g.stroke(); g.lineWidth = 0.8; g.strokeStyle = "#8a4ea0"; g.stroke(); }
        f(); g.lineWidth = 0.9; g.strokeStyle = "#6a3a7a"; g.stroke();
        return f;
      }
      case "pepino": {
        const xs = [-hw * 0.72, -hw * 0.25, hw * 0.25, hw * 0.72], r = hw * 0.26;
        const f = () => { g.beginPath(); for (const x of xs) { g.moveTo(x + r, -h * 0.5); g.ellipse(x, -h * 0.5, r, h * 0.6, 0, 0, TAU); } };
        f(); g.fillStyle = "#86b347"; g.fill();
        g.fillStyle = "#d7e9a0"; for (const x of xs) { g.beginPath(); g.ellipse(x, -h * 0.5, r * 0.6, h * 0.3, 0, 0, TAU); g.fill(); }
        f(); g.lineWidth = 0.9; g.strokeStyle = "#3c6418"; g.stroke();
        return f;
      }
      case "panT": {
        const f = () => { g.beginPath(); g.moveTo(-hw, 0); g.lineTo(-hw, -h * 0.22); g.bezierCurveTo(-hw, -h * 1.08, hw, -h * 1.08, hw, -h * 0.22); g.lineTo(hw, 0); g.closePath(); };
        f(); const gr = g.createLinearGradient(-hw * 0.3, -h, hw * 0.3, 0); gr.addColorStop(0, "#eaa452"); gr.addColorStop(0.6, "#d38838"); gr.addColorStop(1, "#b56a28"); g.fillStyle = gr; g.fill();
        g.save(); f(); g.clip();
        g.fillStyle = "rgba(255,238,200,0.55)"; g.beginPath(); g.ellipse(-hw * 0.38, -h * 0.68, hw * 0.3, h * 0.14, -0.35, 0, TAU); g.fill();
        g.fillStyle = "#f6d39a"; g.fillRect(-hw, -2, 2 * hw, 2);
        // sésamo
        for (let k = 0; k < 11; k++) {
          const x = -hw * 0.8 + hw * 1.6 * hash(k * 5.1 + 1), yy = -h * (0.35 + 0.55 * hash(k * 2.7 + 3)) * (1 - 0.55 * Math.pow(Math.abs(x) / hw, 2));
          g.fillStyle = "#fff4dc"; g.beginPath(); g.ellipse(x, yy, 1.4, 0.8, hash(k) * 2 - 1, 0, TAU); g.fill();
          g.strokeStyle = "rgba(150,90,40,0.6)"; g.lineWidth = 0.4; g.stroke();
        }
        g.restore();
        f(); g.lineWidth = 1.3; g.strokeStyle = TINTA_H; g.stroke();
        return f;
      }
    }
    return null;
  }
  // palillo con banderita de cuadros (sale de lo alto de la tapa)
  function palillo(g, h, t, w) {
    g.save(); g.lineCap = "round";
    const top = -h - 24, ond = Math.sin(t * 7 + w) * 1.2;
    g.strokeStyle = TINTA_H; g.lineWidth = 2.6; g.beginPath(); g.moveTo(-2, -h + 4); g.lineTo(-2, top); g.stroke();
    g.strokeStyle = "#ead2a0"; g.lineWidth = 1.4; g.stroke();
    const ban = () => { g.beginPath(); g.moveTo(-1.5, top); g.quadraticCurveTo(5, top - 1.5 + ond, 12, top + ond * 0.6); g.lineTo(12, top + 8 + ond * 0.6); g.quadraticCurveTo(5, top + 6.5 + ond, -1.5, top + 8); g.closePath(); };
    ban(); g.fillStyle = "#fffaf2"; g.fill();
    g.save(); ban(); g.clip(); g.fillStyle = "#d8282a";
    for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) if ((r + k) % 2 === 0) g.fillRect(-1.5 + k * 3.4, top - 2 + r * 4.6 + ond * 0.4 * k / 4, 3.4, 4.6);
    g.restore();
    ban(); g.lineWidth = 0.9; g.strokeStyle = TINTA_H; g.stroke();
    g.restore();
  }
  // mordisco: disco {x, y, r, k} (local) con las muescas de los dientes en el borde
  function rutaMordisco(g, d, ox, oy, nueva) {
    const r = d.r * lerp(0.5, 1, d.k), n = Math.max(28, Math.round(r * 2)), nd = Math.max(6, Math.round(TAU * r / 7.5));
    if (nueva) g.beginPath();
    for (let j = 0; j <= n; j++) { const a = j / n * TAU, rr = r + 2.3 * Math.pow(Math.abs(Math.sin(a * nd / 2)), 0.6);
      const x = d.x + Math.cos(a) * rr - ox, y = d.y + Math.sin(a) * rr - oy; if (j) g.lineTo(x, y); else g.moveTo(x, y); }
    g.closePath();
  }
  function hamburguesa(g, b, t) {
    const sq = b.sq || 0, desde = b.desde || 0, mord = (b.mord || []).filter(d => d.k > 0.001);
    if (b.comida || desde >= NC) return;
    const Ht = altoTorre(sq, desde);
    g.save(); g.translate(b.x, b.y); g.rotate(b.a || 0); g.scale(EH * b.e, EH * b.e);
    if (b.piv === "tapa") g.translate(0, Ht);
    const H0 = altoTorre(sq, 0), yBase = altoTorre(sq, 0) - Ht;   // lo que ya no está
    const corte = mord.length > 0;
    for (const d of mord) { g.beginPath(); g.rect(-300, -300, 600, 600); rutaMordisco(g, d, 0, 0, false); g.clip("evenodd"); }
    let y = 0;
    for (let i = desde; i < NC; i++) {
      const c = CAPAS[i], h = altoCapa(c, sq), hw = anchoCapa(c, sq);
      const dx = b.wob ? b.wob * Math.pow((y + h / 2) / Ht, 1.2) : 0;
      g.save(); g.translate(dx, -y);
      if (i === NC - 1 && (b.nib || 0) > 0.001) {
        // mordisquito en la tapa (arriba a la derecha)
        const r = 5.5 * b.nib; g.beginPath(); g.rect(-60, -60, 120, 80); g.moveTo(-hw - 1 + r, -h * 0.55); g.arc(-hw - 1, -h * 0.55, r, 0, TAU, true); g.clip("evenodd");
      }
      const f = dibCapa(g, c, hw, h, i, t, sq);
      if (corte && f) {
        g.save(); f(); g.clip();
        const interior = { panB: "#f8dca6", panT: "#f8dca6", carne: "#8a5038", queso: "#ffe27a", lechuga: "#c6ef8e", tomate: "#f59a7c", cebolla: "#ffffff", pepino: "#e3f0b4" }[c.n];
        for (const d of mord) { rutaMordisco(g, d, dx, -y, true); g.lineWidth = 5; g.strokeStyle = interior; g.stroke(); g.lineWidth = 1.2; g.strokeStyle = TINTA_H; g.stroke(); }
        g.restore();
      }
      if (i === NC - 1 && (b.nib || 0) > 0.001) {
        const r = 5.5 * b.nib; g.beginPath(); g.arc(-hw - 1, -h * 0.55, r, -Math.PI * 0.45, Math.PI * 0.45); g.lineWidth = 1.1; g.strokeStyle = TINTA_H; g.stroke();
      }
      if (i === NC - 1) { g.save(); g.translate(-12, 0); palillo(g, h, t, 3); g.restore(); }
      g.restore();
      y += h;
    }
    void H0; void yBase; void corte;
    g.restore();
  }
  // una capa suelta (cayendo o en el regazo): {x, y} = centro de su base en pantalla
  function capaSuelta(g, i, q, t) {
    const c = CAPAS[i], h = c.h * (q.sy || 1), hw = c.hw * (q.sx || 1);
    g.save(); g.translate(q.x, q.y); g.rotate(q.a || 0); g.scale(EH, EH);
    dibCapa(g, c, hw, h, i, t, 1);
    g.restore();
  }

  /* =====================================================================================
   * PLATOS Y SU VIAJE DESDE LA VENTANILLA
   * ===================================================================================== */
  const SALIDA_G = P(498, 299), SALIDA_Y = P(528, 299);
  function platoPos(t, quien) {
    const a = quien === "g" ? SALIDA_G : SALIDA_Y, b = quien === "g" ? PLATO_G : PLATO_Y;
    const u = fase(t, T.sale, T.llega), k = 1 - Math.pow(1 - u, 3);
    const q = P(lerp(a.x, b.x, k), lerp(a.y, b.y, k));
    return { x: q.x, y: q.y, e: escBarra(q.y), u };
  }
  // bamboleo de la torre al frenar (como un flan)
  function bamboleo(t) { const v = t - T.llega; return v > 0 && v < 1.4 ? 9 * Math.exp(-v * 4.2) * Math.sin(v * 17) : 0; }
  function plato(g, q) {
    const e = q.e;
    g.save(); g.translate(q.x, q.y); g.scale(e, e); g.lineJoin = "round";
    g.fillStyle = "rgba(40,30,30,0.22)"; g.beginPath(); g.ellipse(1, 3, 32, 7.5, 0, 0, TAU); g.fill();
    g.fillStyle = "#fbfaf6"; g.beginPath(); g.ellipse(0, 0, 31, 7.6, 0, 0, TAU); g.fill(); g.lineWidth = 1.2; g.strokeStyle = "#55504c"; g.stroke();
    g.strokeStyle = "#d8282a"; g.lineWidth = 1.4; g.beginPath(); g.ellipse(0, 0.2, 27, 6.2, 0, 0, TAU); g.stroke();
    g.fillStyle = "#e9e5dc"; g.beginPath(); g.ellipse(0, 0.6, 20, 4.4, 0, 0, TAU); g.fill();
    g.restore();
  }

  /* =====================================================================================
   * YORGI (derecha, mira a la izquierda)
   * ===================================================================================== */
  // mandíbula: apertura J (0..1) en cada bocado; se cierra de golpe en m
  function mandibula(t) {
    let J = 0;
    for (const [a, m] of [[T.a1, T.m1], [T.a2, T.m2], [T.a3, T.m3]]) {
      const abre = salida(fase(t, a, a + 0.18)), cierra = fase(t, m, m + 0.09);
      J = Math.max(J, abre * (1 - cierra * cierra * (3 - 2 * cierra)));
    }
    return J;
  }
  // los tres mordiscos de Yorgi (discos en coordenadas de la hamburguesa): arriba, en medio y el resto
  // (b = número de bocado; el segundo se lleva también la esquina de abajo del pan)
  const MORD_Y = [{ x: 21, y: -54, r: 20, b: 0 }, { x: 20, y: -33, r: 21, b: 1 }, { x: 28, y: -6, r: 13, b: 1 }, { x: -12, y: -50, r: 70, b: 2 }];
  const mordY = t => MORD_Y.map(d => { const m = [T.m1, T.m2, T.m3][d.b]; return Object.assign({ k: suave(fase(t, m, m + 0.08)) }, d); });
  const CARAS_Y = {
    inicio: E({ mx: 0.2, my: -0.5, c: 0.15, sd: 6, si: 6, sonr: 0.45, ancho: 0.95 }),
    ansia: E({ mx: 0.6, my: 0.7, iris: 1.1, c: 0, sd: 22, gd: 0.08, si: 22, gi: 0.08, abre: 6, ancho: 1.12, sonr: 0.95 }),
    relame: E({ mx: 0.5, my: 0.75, c: 0.25, h: 0.2, sd: 16, gd: 0.06, si: 16, gi: 0.06, abre: 9, ancho: 1.05, sonr: 0.7, lengua: 1 }),
    abre: E({ mx: 0.5, my: 0.6, c: 0.35, sd: 26, gd: 0.12, si: 26, gi: 0.12, abre: 0, ancho: 1.1, sonr: 0.1 }),
    mastica: E({ mx: 0, my: 0, c: 1, h: 1, sd: 12, gd: 0.06, si: 12, gi: 0.06, abre: 0, ancho: 0.7, sonr: 0.55, dientes: 0, mof: 1 }),
    feliz: E({ mx: 0, my: 0, c: 1, h: 1, sd: 14, gd: 0.06, si: 14, gi: 0.06, abre: 6, ancho: 1.05, sonr: 0.95 }),
    mira: E({ mx: 0.9, my: 0.2, c: 0.1, sd: 8, gd: 0.02, si: 26, gi: 0.12, abre: 0, ancho: 1.06, sonr: 0.72 }),
    sorpresa: E({ mx: 0.9, my: 0.0, iris: 0.8, c: 0, sd: 34, gd: 0.1, si: 36, gi: 0.12, abre: 30, ancho: 0.6, sonr: -0.05 }),
    contiene: E({ mx: 0.85, my: 0.6, c: 0.5, h: 0.6, sd: 18, gd: 0.12, si: 20, gi: 0.12, abre: 0, ancho: 0.95, sonr: 0.85, mof: 0.35 }),
    tierno: E({ mx: 0.9, my: 0.2, c: 0.3, h: 0.3, sd: 16, gd: 0.12, si: 18, gi: 0.12, abre: 4, ancho: 1.02, sonr: 0.75 }),
    camara: E({ mx: -0.85, my: 0, c: 0.3, h: 0.35, sd: 16, gd: 0.05, si: 20, gi: 0.08, abre: 10, ancho: 1.1, sonr: 0.9 })
  };
  const GUION_CARA_Y = [
    [T.ding, T.ding + 0.15, "inicio"], [T.yAnsia, T.yAnsia + 0.2, "ansia"], [T.frota1 - 0.05, T.yCoge, "relame"], [T.yAlza, T.a1, "ansia"],
    [T.a1, T.a1 + 0.12, "abre"], [T.m1 + 0.04, T.m1 + 0.12, "mastica", salida], [T.a2, T.a2 + 0.12, "abre"], [T.m2 + 0.04, T.m2 + 0.12, "mastica", salida],
    [T.a3, T.a3 + 0.12, "abre"], [T.m3 + 0.04, T.m3 + 0.12, "mastica", salida], [T.yTraga + 0.08, T.yTraga + 0.25, "feliz"],
    [T.gAbre - 0.25, T.gAbre, "mira"], [T.chorro - 0.02, T.chorro + 0.08, "sorpresa", salida], [T.caida[0] - 0.05, T.caida[0] + 0.1, "contiene"],
    [T.caida[8] + 0.2, T.yServ0 + 0.1, "tierno"], [T.yCamara, T.yCamara + 0.25, "camara"]
  ];
  const CUERPOS_Y = {
    inicio: { torso: 0.04, cab: 0.03, dx: 0 }, ansia: { torso: 0.1, cab: 0.06, dx: -2 }, coge: { torso: 0.2, cab: 0.08, dx: -4 },
    alza: { torso: 0.03, cab: 0.0, dx: 0 }, abre: { torso: 0.06, cab: -0.16, dx: -2 }, abre3: { torso: 0.17, cab: -0.1, dx: -8 }, mastica: { torso: 0.0, cab: 0.04, dx: 0 },
    feliz: { torso: -0.06, cab: -0.08, dx: 2 }, mira: { torso: 0.03, cab: 0.04, dx: 0 }, sorpresa: { torso: -0.13, cab: -0.15, dx: 6 },
    contiene: { torso: 0.0, cab: 0.08, dx: 0 }, serv: { torso: 0.08, cab: 0.08, dx: -2 }, ofrece: { torso: 0.24, cab: 0.06, dx: -6 },
    final: { torso: 0.0, cab: -0.03, dx: 0 }
  };
  const GUION_CUERPO_Y = [
    [T.yAnsia, T.yAnsia + 0.3, "ansia"], [T.frota1, T.yCoge, "coge"], [T.yCoge + 0.05, T.yAlza + 0.1, "alza"],
    [T.a1 - 0.04, T.a1 + 0.16, "abre"], [T.m1 + 0.02, T.m1 + 0.2, "mastica", salida], [T.a2 - 0.04, T.a2 + 0.16, "abre"], [T.m2 + 0.02, T.m2 + 0.2, "mastica", salida],
    [T.a3 - 0.1, T.a3 + 0.16, "abre3"], [T.m3 + 0.02, T.m3 + 0.25, "mastica", salida], [T.yTraga, T.yTraga + 0.3, "feliz"],
    [T.gAbre - 0.3, T.gAbre, "mira"], [T.chorro, T.chorro + 0.12, "sorpresa", salida], [T.caida[0] - 0.1, T.caida[0] + 0.15, "contiene"],
    [T.yServ0, T.yServ, "serv"], [T.yServ + 0.05, T.yOfrece, "ofrece"], [T.yVuelve, T.yVuelve + 0.4, "final"]
  ];
  const cacheY = new Map();
  function poseY(t) {
    const k0 = t.toFixed(5);
    if (cacheY.has(k0)) return cacheY.get(k0);
    if (cacheY.size > 8) cacheY.clear();
    const p = poseY0(t); cacheY.set(k0, p); return p;
  }
  function poseY0(t) {
    const b = guion(GUION_CUERPO_Y, CUERPOS_Y, "inicio", t);
    const respira = Math.sin(t * 2.0 + 0.7);
    const K = S * Y.K;
    const p = {
      x: XY, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: Y.PELVIS.x - b.dx / K, y: Y.PELVIS.y + PEL_Y + respira * 1.1 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    const J = mandibula(t);
    // masticar: la cabeza cabecea con los carrillos llenos
    const mas = mastica(t, T.m1 + 0.08, T.a2, 12) + mastica(t, T.m2 + 0.08, T.a3, 12) + mastica(t, T.m3 + 0.08, T.yTraga, 11);
    p.cabeza.dy += 2.5 * mas; p.cabeza.ang += 0.02 * mas;
    // el trago: la cabeza sube
    const tr = campana(t, T.yTraga - 0.06, T.yTraga + 0.2); p.cabeza.dy -= 6 * tr; p.cabeza.ang -= 0.05 * tr;
    // al abrir la mandíbula la cabeza se estira un poco
    p.cabeza.esc.y = 1 + 0.05 * J; p.cabeza.dy -= 6 * J;
    // risita durante la caída (hombros que botan)
    const rie = dentro(t, T.caida[2], T.caida[2] + 0.15, T.caida[8] + 0.1, T.caida[8] + 0.35);
    p.torso += 0.02 * Math.abs(Math.sin((t - T.caida[2]) * 12)) * rie; p.pelvis.y -= 2 * Math.abs(Math.sin((t - T.caida[2]) * 12)) * rie / K;
    // piernas: los pies en el aro del taburete
    const TOB = Y.SUELO - Y.TOBILLO_ALTO, yAro = Y.SUELO + (Y_ARO - SUELO) / K - Y.TOBILLO_ALTO;
    const balancea = dentro(t, T.yTraga + 0.2, T.yTraga + 0.4, T.gAbre - 0.3, T.gAbre);
    p.piernas.cerca = { tob: { x: Y.PELVIS.x + 236 + 14 * balancea * (0.5 + 0.5 * Math.sin((t - T.yTraga) * 6)), y: yAro - 14 * balancea * (0.5 + 0.5 * Math.sin((t - T.yTraga) * 6)) }, ang: -0.1 * balancea * (0.5 + 0.5 * Math.sin((t - T.yTraga) * 6)) };
    p.piernas.lejos = { tob: { x: Y.PELVIS.x + 286, y: yAro - 8 }, ang: 0 };
    void TOB;
    // carrillos llenos: la cara se ensancha un poco mientras mastica
    const carr = clamp(mas * 0.35 + 0.65 * (dentro(t, T.m1 + 0.05, T.m1 + 0.12, T.a2 - 0.05, T.a2 + 0.02) + dentro(t, T.m2 + 0.05, T.m2 + 0.12, T.a3 - 0.05, T.a3 + 0.02) + dentro(t, T.m3 + 0.05, T.m3 + 0.12, T.yTraga - 0.05, T.yTraga + 0.05)));
    p.cabeza.esc.x *= 1 + 0.07 * carr; p.cabeza.esc.y *= 1 - 0.03 * carr;
    const ex = guion(GUION_CARA_Y, CARAS_Y, "inicio", t);
    ex.mof = Math.max(ex.mof * (1 - 0.25 * (1 - mas)), carr);
    ex.ancho -= 0.08 * mas + 0.12 * carr;
    // mira la ventanilla al principio y a la hamburguesa de Guillermo luego
    miraA(ex, Y, p, P(514, 250), dentro(t, 0.3, 0.6, T.yAnsia - 0.1, T.yAnsia + 0.1));
    if (t > T.gAlza && t < T.yServ0) miraA(ex, Y, p, poseG(t).hamb.ojo, 0.85 * dentro(t, T.gAlza, T.gAlza + 0.3, T.yServ0 - 0.2, T.yServ0));
    // cada capa que aterriza en el regazo: «¡uy!» (aprieta los ojos y enseña los dientes)
    let plop = 0; for (const tc of T.caida) plop = Math.max(plop, campana(t, tc + 0.2, tc + 0.42));
    ex.z = Math.max(ex.z, 0.8 * plop); ex.c = Math.max(ex.c, 0.85 * plop); ex.abre += 10 * plop; ex.ancho += 0.15 * plop; ex.sonr -= 0.6 * plop;
    p.cabeza.ang += 0.04 * plop; p.torso -= 0.02 * plop;
    const cerrado = ex.c > 0.8;
    p.cara = cara(ex, cerrado ? 0 : parpadeo(t, [0.42, 2.2, 5.98, 7.98, 10.5, 12.5, 13.9]));
    p.J = J;
    p.capaCabeza = (g, tt) => fauces(g, J, tt);
    manosY(p, t);
    return p;
  }

  /* ---------- la mandíbula desencajada (retrato de Yorgi, sin espejo: mira a la derecha) ---------- */
  const BOCA_Y = P(848, 686), ANG_BY = 0.27;
  const BARBA = ["#3a2216", "#4e2f1d", "#6a4329"];
  function fauces(g, J, t) {
    if (J <= 0.002) return;
    g.save(); g.translate(BOCA_Y.x, BOCA_Y.y); g.rotate(ANG_BY); g.lineJoin = "round"; g.lineCap = "round";
    const hw = 80 + 16 * J, Ho = HO_Y * J, ri = 40 * J + 4, rs = 22 * J + 4;
    const hueco = () => { g.beginPath(); g.moveTo(-hw, 0); g.quadraticCurveTo(0, -16 * J, hw, -4);
      g.bezierCurveTo(hw * 1.02, Ho * 0.55, hw * 0.55, Ho, 0, Ho); g.bezierCurveTo(-hw * 0.6, Ho, -hw * 1.0, Ho * 0.45, -hw, 0); g.closePath(); };
    // contorno exterior de la mandíbula caída: de la mejilla (atrás) por abajo hasta delante
    const X0 = -hw - rs * 1.6, X1 = hw + rs * 0.9, YB = Ho + ri;
    const contorno = () => { g.moveTo(X0, -26); g.bezierCurveTo(X0 - 6, YB * 0.45, -(hw + rs) * 0.75, YB, 0, YB); g.bezierCurveTo((hw + rs) * 0.62, YB, X1 * 1.05, YB * 0.62, X1, -8); };
    const aro = () => { g.beginPath(); contorno(); g.quadraticCurveTo(0, -36 * J, X0, -26); g.closePath(); };
    aro(); const gr = g.createLinearGradient(0, 0, 0, YB); gr.addColorStop(0, BARBA[1]); gr.addColorStop(1, BARBA[0]); g.fillStyle = gr; g.fill();
    g.save(); aro(); g.clip();
    // pelo de la barba: trazos cortos que siguen el contorno
    for (let i = 0; i < 70; i++) {
      const a = hash(i * 3.7) * Math.PI, rr = 0.75 + 0.3 * hash(i * 1.3);
      const x = Math.cos(a) * (hw + rs * 0.5) * rr, y = Math.sin(a) * (Ho + ri * 0.5) * rr + (hash(i * 9.1) - 0.5) * 20;
      g.strokeStyle = i % 3 ? BARBA[2] : "rgba(20,10,4,0.7)"; g.lineWidth = 3 + 2 * hash(i);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 9 + 2, y + Math.sin(a) * 11 + 4); g.stroke();
    }
    g.restore();
    g.beginPath(); contorno(); g.lineWidth = 6; g.strokeStyle = TINTA; g.stroke();
    // labio de abajo (rosa) y la boca
    g.save(); g.translate(0, 9 * J); g.scale(1.02, 1); hueco(); g.fillStyle = "#f18070"; g.fill(); g.restore();
    hueco(); g.fillStyle = "#3a0d0b"; g.fill();
    g.save(); hueco(); g.clip();
    g.fillStyle = "#1c0605"; g.beginPath(); g.ellipse(-hw * 0.35, Ho * 0.42, hw * 0.42, Ho * 0.33, 0, 0, TAU); g.fill();
    g.fillStyle = "#df6a5e"; g.beginPath(); g.ellipse(hw * 0.12, Ho * 0.93, hw * 0.78, Ho * 0.26, 0, 0, TAU); g.fill();
    g.strokeStyle = "rgba(120,20,20,0.5)"; g.lineWidth = 3; g.beginPath(); g.moveTo(hw * 0.1, Ho * 0.72); g.lineTo(hw * 0.12, Ho * 0.9); g.stroke();
    // dientes de arriba y de abajo
    g.fillStyle = "#fffaf2"; g.strokeStyle = "rgba(130,110,100,0.85)"; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(-hw, -8); g.quadraticCurveTo(0, -24 * J, hw, -10); g.lineTo(hw, 16); g.quadraticCurveTo(0, 2, -hw, 10); g.closePath(); g.fill();
    for (let i = -3; i <= 3; i++) { const x = i * hw / 4; g.beginPath(); g.moveTo(x, -10); g.lineTo(x, 9); g.stroke(); }
    g.beginPath(); g.moveTo(-hw * 0.72, Ho * 0.72); g.quadraticCurveTo(0, Ho - 20, hw * 0.86, Ho * 0.6); g.lineTo(hw * 0.92, Ho * 0.78); g.quadraticCurveTo(0, Ho + 4, -hw * 0.72, Ho * 0.88); g.closePath(); g.fill();
    for (let i = -2; i <= 2; i++) { const x = i * hw / 3.6, yy = Ho * 0.72 + (Ho * 0.25) * (1 - (x / hw) * (x / hw)) * 0.9; g.beginPath(); g.moveTo(x, yy - 2); g.lineTo(x, yy - 14); g.stroke(); }
    g.restore();
    hueco(); g.lineWidth = 6; g.strokeStyle = TINTA; g.stroke();
    // bigote encima (tapa la junta con el labio de arriba)
    g.fillStyle = BARBA[1]; g.beginPath(); g.moveTo(-hw - 8, -4); g.quadraticCurveTo(0, -30 * J - 14, hw + 6, -10); g.quadraticCurveTo(0, -18 * J - 2, -hw - 8, -4); g.fill();
    g.restore();
  }

  /* ---------- la hamburguesa de Yorgi ---------- */
  // punto del retrato (marco de la boca) → pantalla
  const enBocaY = (p, lx, ly) => { const q = rotP(P(lx, ly), ANG_BY); return Y.aPantalla(p, Y.cabeza(p).a(P(BOCA_Y.x + q.x, BOCA_Y.y + q.y))); };
  const HO_Y = 220;
  // la hamburguesa con el disco del mordisco k centrado en el hueco de la boca abierta (hueco: lo que le falta para llegar)
  function bocadoY(p, k, hueco, a) {
    const M = MORD_Y.find(q => q.b === k), H = enBocaY(p, -4, HO_Y * 0.5), d = rotP(P(M.x * EH, M.y * EH), a);
    return { x: H.x - d.x - hueco, y: H.y - d.y + hueco * 0.25, a, e: 1 };
  }
  function hamburguesaY(t, p) {
    const p0 = platoPos(t, "y");
    if (t < T.yCoge) return { x: p0.x, y: p0.y - 2 * p0.e, a: 0, e: p0.e, wob: bamboleo(t), quien: "barra" };
    const SOST = { x: 606, y: 324, a: 0.04, e: 1 };
    const L = [
      [0, 0, { x: PLATO_Y.x, y: PLATO_Y.y - 2, a: 0, e: 1 }],
      [T.yCoge, T.yAlza, SOST],
      [T.yAlza + 0.04, T.a1 + 0.02, () => bocadoY(p, 0, 14, 0.05)],
      [T.a1 + 0.02, T.m1, () => bocadoY(p, 0, 0, 0.04), entrada],
      [T.m1 + 0.04, T.b1 + 0.2, SOST],
      [T.a2 - 0.12, T.a2 + 0.04, () => bocadoY(p, 1, 14, 0.02)],
      [T.a2 + 0.04, T.m2, () => bocadoY(p, 1, 0, 0.0), entrada],
      [T.m2 + 0.04, T.b2 + 0.2, SOST],
      [T.a3 - 0.12, T.a3 + 0.04, () => bocadoY(p, 2, 12, -0.04)],
      [T.a3 + 0.04, T.m3, () => bocadoY(p, 2, 0, -0.06), entrada]
    ];
    const o = pista(L, t);
    // el temblor del bocado al cerrar
    for (const m of [T.m1, T.m2, T.m3]) { const v = t - m; if (v > 0 && v < 0.25) o.a += 0.05 * Math.exp(-v * 14) * Math.sin(v * 50); }
    o.mord = mordY(t); o.comida = t >= T.m3 + 0.08; o.quien = o.comida ? "nada" : "y";
    return o;
  }

  /* ---------- manos de Yorgi ---------- */
  const REPOSO_YL = { x: 578, y: 330, mu: -0.6, d: MESA };
  function manosY(p, t) {
    const hb = hamburguesaY(t, p);
    p.hamb = hb;
    const Tr = Y.tronco(p), muslo = Y.aPantalla(p, Tr(P(Y.PELVIS.x + 70, Y.PELVIS.y - 70)));
    const REPOSO_YC = { x: muslo.x, y: muslo.y, mu: -0.9, d: RELAJA };
    // frotarse las manos (delante del pecho)
    const pecho = Y.aPantalla(p, Tr(P(Y.PELVIS.x + 60, Y.PELVIS.y - 260)));
    const fr = Math.sin((t - T.frota0) * 22);
    const FROTA_L = () => ({ x: pecho.x - 26, y: pecho.y + 3 * fr, mu: -0.15, d: ABIERTA });
    const FROTA_C = () => ({ x: pecho.x - 14, y: pecho.y - 3 * fr, mu: 0.1, d: ABIERTA });
    // agarre: la lejana en el lado izquierdo de la torre; la cercana por debajo
    const ag = (lx, ly, mu, d) => () => { const o = hb, q = rotP(P(lx * EH * o.e, ly * EH * o.e), o.a || 0); return { x: o.x + q.x, y: o.y + q.y, mu: mu + (o.a || 0), d }; };
    const PL_L = [
      [0, 0, REPOSO_YL],
      [T.frota0 - 0.15, T.frota0 + 0.05, FROTA_L],
      [T.frota1, T.yCoge, ag(-19, 5, 1.7, BANDEJA)],
      [T.a3 - 0.14, T.a3 + 0.04, ag(-24, 5, 1.8, BANDEJA)],
      [T.m3 + 0.02, T.m3 + 0.14, () => { const o = hb; return { x: o.x - 20, y: o.y + 10, mu: 1.25, d: ABIERTA }; }],
      [T.m3 + 0.2, T.m3 + 0.55, REPOSO_YL],
      [T.yServ0, T.yServ, { x: SERVILLETERO.x - 2, y: SERVILLETERO.y - 11, mu: 0.2, d: PINZA }],
      [T.yServ + 0.1, T.yOfrece, { x: 478, y: 298, mu: 0.15, d: PINZA }],
      [T.yVuelve, T.yVuelve + 0.5, REPOSO_YL],
      [T.yCamara + 0.1, T.yCamara + 0.45, { x: 582, y: 296, mu: 1.0, d: PULGAR }]
    ];
    const PL_C = [
      [0, 0, REPOSO_YC],
      [T.frota0 - 0.15, T.frota0 + 0.05, FROTA_C],
      [T.frota1, T.yCoge, () => { const q = Y.aPantalla(p, Tr(P(Y.PELVIS.x + 70, Y.PELVIS.y - 190))); return { x: q.x - 10, y: q.y, mu: 0.5, d: RELAJA }; }],
      [T.yCoge + 0.08, T.yAlza, ag(4, 6, 0.85, BANDEJA)],
      [T.a3 - 0.14, T.a3 + 0.04, ag(-4, 6, 1.0, BANDEJA)],
      [T.m3 + 0.02, T.m3 + 0.14, () => { const o = hb; return { x: o.x + 10, y: o.y + 12, mu: 0.4, d: ABIERTA }; }],
      [T.m3 + 0.22, T.m3 + 0.5, REPOSO_YC],
      [T.yBarriga0, T.yBarriga0 + 0.25, () => { const q = Y.aPantalla(p, Tr(P(Y.PELVIS.x + 40, Y.PELVIS.y - 120))); return { x: q.x - 6, y: q.y, mu: 0.4, d: RELAJA }; }],
      [T.yBarriga1, T.yBarriga1 + 0.4, REPOSO_YC]
    ];
    const l = pista(PL_L, t), c = pista(PL_C, t);
    // palmaditas en la barriga
    const pal = dentro(t, T.yBarriga0 + 0.25, T.yBarriga0 + 0.3, T.yBarriga1 - 0.05, T.yBarriga1);
    if (pal > 0) { const w = Math.abs(Math.sin((t - T.yBarriga0) * 11)); c.x -= 6 * w * pal; c.y -= 2 * w * pal; }
    let objL = null, objC = null;
    if (hb.quien === "y") objL = g => conCamara(g, () => hamburguesa(g, hb, t));
    // la servilleta en la mano de Yorgi
    if (t >= T.yServ && t < T.gToma) {
      const k = suave(fase(t, T.yServ, T.yServ + 0.35));
      const sv = { quien: "y", x: l.x - 4, y: l.y + 2, a: lerp(-0.3, 0.25, k) + 0.08 * Math.sin(t * 9) * tramo(t, T.yServ + 0.3, T.yOfrece) * (1 - tramo(t, T.yOfrece, T.gToma - 0.04)), abre: k };
      p.serv = sv; objL = g => conCamara(g, () => servilleta(g, sv, t));
    }
    p.manoLejos = manoRig(Y, p, l, 1, objL);
    p.manoCerca = manoRig(Y, p, c, -1, objC);
  }

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha)
   * ===================================================================================== */
  const CARAS_G = {
    inicio: E({ mx: 0.5, my: -0.5, c: 0.15, sd: 8, si: 8, sonr: 0.4, ancho: 1 }),
    pasmo: E({ mx: 0.6, my: 0.65, iris: 0.8, c: 0, sd: 28, gd: 0.15, si: 28, gi: 0.15, abre: 30, ancho: 0.62, sonr: -0.15 }),
    mira: E({ mx: 0.9, my: 0.05, iris: 0.85, c: 0, sd: 24, gd: 0.14, si: 26, gi: 0.16, abre: 20, ancho: 0.6, sonr: -0.1 }),
    camara: E({ mx: -0.85, my: 0, iris: 0.8, c: 0.05, sd: 24, gd: 0.2, si: 24, gi: 0.2, abre: 3, ancho: 0.62, sonr: -0.35 }),
    traga: E({ mx: -0.85, my: 0, iris: 0.8, c: 0.3, sd: 20, gd: 0.22, si: 20, gi: 0.22, abre: 0, ancho: 0.55, sonr: -0.4, mof: 0.3 }),
    decide: E({ mx: 0.7, my: 0.55, c: 0.42, z: 0.1, sd: -8, gd: -0.16, si: -8, gi: -0.16, abre: 0, ancho: 0.95, sonr: 0.25 }),
    abre: E({ mx: 0.6, my: 0.5, c: 0.25, sd: 18, gd: 0.04, si: 18, gi: 0.04, abre: 40, ancho: 1.0, sonr: 0 }),
    esfuerzo: E({ mx: 0.4, my: 0.4, c: 0.75, z: 0.8, sd: 8, gd: -0.1, si: 8, gi: -0.1, abre: 46, ancho: 1.05, sonr: -0.2 }),
    aprieta: E({ mx: 0.3, my: 0.4, c: 0.9, z: 1, sd: -6, gd: -0.2, si: -6, gi: -0.2, abre: 8, ancho: 1.15, sonr: -0.35 }),
    salpica: E({ mx: 0, my: 0, c: 1, z: 1, sd: 10, gd: 0.1, si: 10, gi: 0.1, abre: 0, ancho: 0.8, sonr: -0.5 }),
    atonito: E({ mx: 0.8, my: 0.3, iris: 0.75, c: 0, sd: 26, gd: 0.18, si: 26, gi: 0.18, abre: 10, ancho: 0.6, sonr: -0.2 }),
    sigue: E({ mx: 0.35, my: 0.95, iris: 0.85, c: 0.1, sd: 22, gd: 0.22, si: 22, gi: 0.22, abre: 14, ancho: 0.6, sonr: -0.3 }),
    triste: E({ mx: 0.7, my: 0.55, c: 0.38, sd: 12, gd: 0.3, si: 12, gi: 0.3, abre: 0, ancho: 0.7, sonr: -0.45 }),
    servi: E({ mx: 0.9, my: 0.2, c: 0.2, sd: 16, gd: 0.18, si: 18, gi: 0.18, abre: 0, ancho: 0.8, sonr: 0.15 }),
    digno: E({ mx: 0.55, my: 0.6, c: 0.45, sd: 10, gd: 0.04, si: 14, gi: 0.08, abre: 0, ancho: 0.62, sonr: 0.2 }),
    muerde: E({ mx: 0.6, my: 0.55, c: 0.3, sd: 12, gd: 0.04, si: 14, gi: 0.06, abre: 12, ancho: 0.62, sonr: 0.05 }),
    mastica: E({ mx: 0.2, my: -0.2, c: 0.7, h: 0.5, sd: 14, gd: 0.06, si: 16, gi: 0.08, abre: 0, ancho: 0.55, sonr: 0.35, mof: 0.25 }),
    final: E({ mx: -0.85, my: 0, c: 0.12, sd: 22, gd: 0.12, si: 26, gi: 0.16, abre: 2, ancho: 0.75, sonr: 0.4 })
  };
  const GUION_CARA_G = [
    [T.gPasmo, T.gPasmo + 0.15, "pasmo", salida], [T.yAlza, T.yAlza + 0.25, "mira"], [T.gCamara, T.gCamara + 0.2, "camara"],
    [T.gTraga, T.gTraga + 0.1, "traga"], [T.gDecide, T.gDecide + 0.2, "decide"], [T.gAbre, T.gAbre + 0.2, "abre"],
    [T.gEsfuerzo, T.gEsfuerzo + 0.25, "esfuerzo"], [T.gAprieta0, T.gAprieta0 + 0.15, "aprieta"], [T.impacto - 0.02, T.impacto + 0.04, "salpica", salida],
    [T.gSuelta, T.gSuelta + 0.12, "atonito", salida], [T.caida[0] - 0.12, T.caida[0], "sigue"], [T.gMiraTapa, T.gMiraTapa + 0.3, "triste"],
    [T.gDeja + 0.05, T.gDeja + 0.25, "servi"], [T.gPalpa, T.gPalpa + 0.2, "digno"], [T.gMuerde - 0.15, T.gMuerde - 0.02, "muerde"],
    [T.gAparta, T.gAparta + 0.1, "mastica"], [T.gCamara2, T.gCamara2 + 0.25, "final"]
  ];
  const CUERPOS_G = {
    inicio: { torso: 0.04, cab: 0.02, dx: 0 }, pasmo: { torso: -0.04, cab: -0.06, dx: -2 }, mira: { torso: 0.02, cab: 0.04, dx: 0 },
    camara: { torso: 0.0, cab: 0.0, dx: 0 }, coge: { torso: 0.16, cab: 0.06, dx: 4 }, alza: { torso: -0.02, cab: 0.0, dx: 0 },
    esfuerzo: { torso: -0.04, cab: -0.12, dx: -2 }, aprieta: { torso: 0.02, cab: 0.02, dx: 0 }, salpica: { torso: -0.1, cab: -0.16, dx: -4 },
    sigue: { torso: 0.04, cab: 0.18, dx: 0 }, triste: { torso: 0.02, cab: 0.06, dx: 0 }, servi: { torso: 0.1, cab: 0.04, dx: 2 },
    digno: { torso: -0.03, cab: -0.04, dx: 0 }, muerde: { torso: 0.04, cab: 0.06, dx: 0 }, final: { torso: 0.0, cab: -0.02, dx: 0 },
    deja: { torso: 0.24, cab: 0.1, dx: 8 }
  };
  const GUION_CUERPO_G = [
    [T.gPasmo, T.gPasmo + 0.3, "pasmo", salida], [T.yAlza, T.yAlza + 0.3, "mira"], [T.gCamara, T.gCamara + 0.3, "camara"],
    [T.gVa, T.gCoge, "coge"], [T.gCoge + 0.04, T.gAlza + 0.1, "alza"], [T.gAbre, T.gEsfuerzo + 0.2, "esfuerzo"],
    [T.gAprieta0, T.gAprieta0 + 0.2, "aprieta"], [T.impacto - 0.02, T.impacto + 0.12, "salpica", salida],
    [T.caida[0] - 0.2, T.caida[0] + 0.1, "sigue"], [T.gMiraTapa, T.gMiraTapa + 0.3, "triste"], [T.gDeja0, T.gDeja, "deja"], [T.gDeja + 0.08, T.gToma, "servi"],
    [T.gMete, T.gPalpa + 0.15, "digno"], [T.gPalpa + 0.2, T.gRecoge, "deja"], [T.gRecoge + 0.04, T.gBollo, "muerde"], [T.gAparta, T.gAparta + 0.3, "digno"], [T.gCamara2, T.gCamara2 + 0.3, "final"]
  ];
  const cacheG = new Map();
  function poseG(t) {
    const k0 = t.toFixed(5);
    if (cacheG.has(k0)) return cacheG.get(k0);
    if (cacheG.size > 8) cacheG.clear();
    const p = poseG0(t); cacheG.set(k0, p); return p;
  }
  const esfuerzoK = t => dentro(t, T.gEsfuerzo, T.gEsfuerzo + 0.2, T.chorro, T.impacto);
  function poseG0(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const respira = Math.sin(t * 2.3);
    const tiembla = esfuerzoK(t);
    const p = {
      x: XG, suelo: SUELO, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x + b.dx / S + 1.2 * tiembla * Math.sin(t * 47) / S, y: G.PELVIS.y + PEL_G + respira * 1.3 },
      torso: b.torso + 0.01 * tiembla * Math.sin(t * 39), torsoEsc: { x: 1, y: 1 + respira * 0.005 }, piernas: {},
      cabeza: { ang: b.cab + 0.03 * tiembla * Math.sin(t * 43), dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // trago de saliva
    p.cabeza.dy -= 4 * campana(t, T.gTraga - 0.02, T.gTraga + 0.22);
    // un respingo con cada capa que le cae encima
    let resp = 0; for (const tc of T.caida) resp = Math.max(resp, campana(t, tc + 0.22, tc + 0.42));
    p.cabeza.dy -= 3 * resp; p.torso -= 0.015 * resp;
    // masticar el mordisquito
    const mas = mastica(t, T.gMuerde + 0.04, T.gMastica1, 16);
    p.cabeza.dy += 1.5 * mas;
    // piernas: en el aro del taburete
    const yAro = G.SUELO + (Y_ARO - SUELO) / S - G.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: G.PELVIS.x + 236, y: yAro }, ang: 0 };
    p.piernas.lejos = { tob: { x: G.PELVIS.x + 286, y: yAro - 8 }, ang: 0 };
    // cara
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    ex.abre += 6 * tiembla * Math.sin(t * 31);
    ex.abre += 5 * mas; ex.mof += 0.15 * mas;
    // mira la ventanilla, luego a Yorgi comiendo (sigue la hamburguesa)
    miraA(ex, G, p, P(514, 250), dentro(t, 0.3, 0.6, T.gPasmo - 0.1, T.gPasmo + 0.1));
    if (t > T.yAlza && t < T.gCamara) miraA(ex, G, p, Y.aPantalla(poseY(t), Y.boca(poseY(t))), 0.9 * dentro(t, T.yAlza, T.yAlza + 0.2, T.gCamara - 0.1, T.gCamara));
    // sigue con la mirada cada capa que cae
    const cae = capaCayendo(t);
    if (cae) miraA(ex, G, p, cae, 0.95);
    const cerrado = ex.c > 0.8 || ex.z > 0.5;
    p.cara = cara(ex, cerrado ? 0 : parpadeo(t, [0.5, 2.5, 4.1, 5.36, 8.05, 10.2, 11.0, 12.6, 13.85]));
    p.rojo = 0.55 * esfuerzoK(t);
    p.sudor = 0.8 * dentro(t, T.gEsfuerzo + 0.1, T.gEsfuerzo + 0.3, T.gSuelta, T.gSuelta + 0.4) + 0.4 * dentro(t, T.gCamara + 0.1, T.gCamara + 0.3, T.gDecide, T.gDecide + 0.2);
    const est = { t };
    p.capaCabeza = (g, tt) => manchasCara(g, tt);
    p.capaTronco = g => { const sv = p.serv; if (sv && sv.quien === "babero") conCamara(g, () => servilleta(g, sv, t)); };
    void est;
    manosG(p, t);
    return p;
  }

  /* ---------- la hamburguesa de Guillermo ---------- */
  const enBocaG = p => G.aPantalla(p, G.boca(p));
  // frente a la boca: la torre a la derecha de la boca, con su mitad a la altura de la boca
  function frenteG(p, sq, sube, hueco) {
    const m = enBocaG(p), Ht = altoTorre(sq) * EH;
    return { x: m.x + HWMAX * EH * (1 + 0.2 * sq) - 4 + hueco, y: m.y + Ht * 0.5 + 6 - sube, a: -0.04, e: 1, sq };
  }
  const aprietaK = t => {
    const k = suave(fase(t, T.gAprieta0, T.gAprieta1)) * (1 - salida(fase(t, T.gSuelta, T.gSueltaFin)));
    return 0.92 * k + 0.05 * k * Math.sin(t * 40) * dentro(t, T.gAprieta0, T.gAprieta0 + 0.1, T.chorro, T.chorro + 0.05);
  };
  // la torre cuelga del pan de arriba (sujeto por la mano lejana) mientras se desmorona
  const cayoN = t => { let n = 0; for (const tc of T.caida) if (t >= tc) n++; return n; };
  function colgandoG(p, t) {
    const m = enBocaG(p);
    const n = cayoN(t);
    // pequeño rebote hacia arriba cada vez que se suelta una capa
    let rb = 0; for (const tc of T.caida) { const v = t - tc; if (v > 0 && v < 0.5) rb += -3 * Math.exp(-v * 9) * Math.sin(v * 26); }
    const baja = 14 * tramo(t, T.caida[8], T.gMiraTapa + 0.2);
    return { x: m.x + 36, y: m.y - 16 + rb + baja, a: -0.06 + 0.04 * Math.sin(t * 3.1) * tramo(t, T.gSuelta, T.caida[0]), e: 1, sq: 0, desde: n, piv: "tapa" };
  }
  function hamburguesaG(t, p) {
    const p0 = platoPos(t, "g");
    let o;
    if (t < T.gCoge) o = { x: p0.x, y: p0.y - 2 * p0.e, a: 0, e: p0.e, sq: 0, wob: bamboleo(t), quien: "barra" };
    else {
      const sq = aprietaK(t);
      if (t < T.gSuelta) {
        o = pista([
          [0, 0, { x: PLATO_G.x, y: PLATO_G.y - 2, a: 0, e: 1, sq: 0 }],
          [T.gCoge, T.gAlza, () => frenteG(p, 0, -14, 14)],
          [T.gAbre, T.gEsfuerzo + 0.1, () => frenteG(p, 0, 4, 2)],
          [T.gAprieta0 - 0.1, T.gAprieta0, () => frenteG(p, sq, 2, 3)]
        ], t);
        o.sq = sq;
        if (t > T.gAprieta0) { const f = frenteG(p, sq, 2, 3); o.x = f.x; o.y = f.y; }
        // empuja contra la boca sin que quepa: tiembla
        const em = esfuerzoK(t); o.x += 1.2 * em * Math.sin(t * 37); o.y += 0.8 * em * Math.sin(t * 29);
        o.piv = "base";
      } else {
        // de «base» a colgando de la tapa
        const f = frenteG(p, sq, 2, 3), Ht = altoTorre(sq) * EH;
        const arriba = { x: f.x, y: f.y - Ht, a: f.a, e: 1, sq };
        const col = colgandoG(p, t);
        const k = suave(fase(t, T.gSuelta, T.gSueltaFin + 0.12));
        o = { x: lerp(arriba.x, col.x, k), y: lerp(arriba.y, col.y, k), a: lerp(arriba.a, col.a, k), e: 1, sq, desde: col.desde, piv: "tapa" };
        // al soltar, la torre se estira y bambolea
        const v = t - T.gSuelta; if (v > 0 && v < 1.4) o.wob = 7 * Math.exp(-v * 3.5) * Math.sin(v * 15);
      }
      // mordisquito en la tapa
      o.nib = salida(fase(t, T.gMuerde, T.gMuerde + 0.06));
      if (t > T.gDeja0) {
        const tapa = tapaG(t, p);
        o.x = tapa.x; o.y = tapa.y; o.a = tapa.a;
      }
    }
    o.quien = t >= T.gCoge ? (t >= T.gDeja && t < T.gRecoge ? "barra" : "g") : "barra";
    o.ojo = P(o.x, o.y - 30);
    return o;
  }
  // la tapa sola: la deja en el plato, la recoge, la sube a la boca para el mordisquito y la baja al masticar
  function tapaG(t, p) {
    const col = colgandoG(p, Math.min(t, T.gDeja0)), m = enBocaG(p);
    const h = altoCapa(CAPAS[NC - 1], 0) * EH;
    const plato = { x: PLATO_G.x - 9, y: PLATO_G.y - 2 - h, a: 0 };
    const boca = { x: m.x + CAPAS[NC - 1].hw * EH + 1, y: m.y - h * 0.45 + 6, a: 0.0 };
    const sostiene = { x: m.x + 36, y: m.y + 10, a: -0.08 };
    return pista([
      [0, 0, { x: col.x, y: col.y, a: col.a }],
      [T.gDeja0, T.gDeja, plato],
      [T.gRecoge, T.gBollo, boca],
      [T.gAparta, T.gAparta + 0.3, sostiene]
    ], t);
  }

  /* ---------- capas que caen al regazo ---------- */
  const GRAV = 2300;
  const PILA_DX = [-3, 4, -1, 5, -5, 2, -3, 4, 0], PILA_A = [0.04, -0.05, 0.07, -0.06, 0.03, -0.08, 0.05, -0.03, 0.06];
  let REGAZO = null;   // se calcula con la postura de Guillermo (muslo) en el primer uso
  function regazo() {
    if (REGAZO) return REGAZO;
    const p = poseG(T.caida[0] - 0.5), Tr = G.tronco(p);
    const q = G.aPantalla(p, Tr(P(G.PELVIS.x + 178, G.PELVIS.y - 50)));
    REGAZO = q; return q;
  }
  // dónde está la capa i cuando se suelta (pantalla) y cómo cae
  const sueltaInfo = [];
  function infoCapa(i) {
    if (sueltaInfo[i]) return sueltaInfo[i];
    const t0 = T.caida[i], p = poseG(t0 - 1e-4), b = p.hamb;
    // base de la capa i en la torre que cuelga (desde = i)
    const Ht = altoTorre(0, i) * EH;
    const base = rotP(P(0, Ht), b.a || 0);
    const q0 = P(b.x + base.x, b.y + base.y);
    // aterriza en lo alto de la pila
    let alto = 0; for (let j = 0; j < i; j++) alto += CAPAS[j].h * EH * 0.88;
    const R = regazo(), q1 = P(R.x + PILA_DX[i], R.y - alto);
    const tc = Math.sqrt(2 * Math.max(6, q1.y - q0.y) / GRAV);
    sueltaInfo[i] = { t0, q0, q1, tc, a0: b.a || 0, a1: PILA_A[i] };
    void p;
    return sueltaInfo[i];
  }
  function capaEstado(i, t) {
    if (t < T.caida[i]) return null;
    const f = infoCapa(i), tau = t - f.t0;
    // antes de soltarse del todo: se escurre un poco hacia un lado
    if (tau < f.tc) {
      const u = tau / f.tc;
      return { x: lerp(f.q0.x, f.q1.x, u), y: f.q0.y + 0.5 * GRAV * tau * tau, a: lerp(f.a0, f.a1 + (i % 2 ? 0.25 : -0.25), u), sx: 1, sy: 1, cae: true };
    }
    const v = tau - f.tc;
    const bote = 7 * Math.exp(-v * 9) * Math.abs(Math.sin(v * 19));
    const aplasta = 0.16 * Math.exp(-v * 16);
    return { x: f.q1.x, y: f.q1.y - bote, a: f.a1 + (i % 2 ? 0.25 : -0.25) * Math.exp(-v * 10) * Math.cos(v * 20), sx: 1 + aplasta * 0.6, sy: 1 - aplasta, cae: v < 0.05 };
  }
  function capaCayendo(t) {
    for (let i = 0; i < T.caida.length; i++) { const s = capaEstado(i, t); if (s && s.cae) return P(s.x, s.y); }
    if (t > T.caida[8] + 0.1 && t < T.gMiraTapa) return P(regazo().x, regazo().y - 20);
    return null;
  }

  /* ---------- manos de Guillermo ---------- */
  const REPOSO_GL = { x: 452, y: 331, mu: -2.3, d: MESA };
  const R_MG = G.MUNECA_R * G.JK;
  function manosG(p, t) {
    const hb = hamburguesaG(t, p);
    p.hamb = hb;
    const Tr = G.tronco(p), muslo = G.aPantalla(p, Tr(P(G.PELVIS.x + 30, G.PELVIS.y - 40)));
    const REPOSO_GC = { x: muslo.x, y: muslo.y, mu: -2.2, d: RELAJA };
    // agarre: lejana en el lado derecho (o encima al aplastar); cercana por debajo
    const enH = (lx, ly) => { const o = hb, Ht = altoTorre(o.sq || 0, o.desde || 0); const off = o.piv === "tapa" ? Ht : 0;
      const q = rotP(P(lx * EH, (ly + off) * EH), o.a || 0); return P(o.x + q.x, o.y + q.y); };
    const ladoD = () => { const o = hb, q = enH(HWMAX * (1 + 0.15 * (o.sq || 0)) + 4, -altoTorre(o.sq || 0) * 0.42); return { x: q.x, y: q.y, mu: 0.95, d: AGARRA }; };
    const encima = () => { const o = hb, q = enH(8, -altoTorre(o.sq || 0) - 4); return { x: q.x, y: q.y, mu: 1.15, d: APRIETA }; };
    const tapa = () => { const o = hb, Ht = altoTorre(o.sq || 0, o.desde || 0), q = enH(CAPAS[NC - 1].hw - 2, -Ht + 9); return { x: q.x, y: q.y, mu: 0.75, d: PINZA }; };
    const debajo = () => { const q = enH(-6, 4); return { x: q.x, y: q.y, mu: 2.55, d: BANDEJA }; };
    const arriba = () => { const o = hb, q = enH(6, -altoTorre(o.sq || 0) - 3); return { x: q.x, y: q.y, mu: 1.2, d: AGARRA }; };
    // la tapa en el plato (para coger la servilleta) y de vuelta
    const tapaPlato = () => { const o = hb, q = enH(CAPAS[NC - 1].hw - 2, -altoCapa(CAPAS[NC - 1], 0) + 9); return { x: q.x, y: q.y, mu: 0.75, d: PINZA }; };
    const PL_L = [
      [0, 0, REPOSO_GL],
      [T.gVa, T.gCoge, arriba],
      [T.gAprieta0 - 0.2, T.gAprieta0, encima],
      [T.gSuelta - 0.02, T.gSueltaFin, tapa],
      [T.gDeja + 0.04, T.gToma, () => { const s = poseY(T.gToma - 1e-4).serv; return { x: s.x - 2, y: s.y - 1, mu: 1.1, d: PINZA }; }],
      [T.gMete0, T.gMete, () => { const c = cuelloG(p); return { x: c.x + 2, y: c.y + 1, mu: 1.3, d: PINZA }; }],
      [T.gPalpa, T.gPalpa + 0.12, () => { const c = cuelloG(p); return { x: c.x + 4, y: c.y + 26, mu: 1.25, d: ABIERTA }; }],
      [T.gPalpa + 0.2, T.gRecoge, tapaPlato]
    ];
    const l = pista(PL_L, t);
    // la mano de abajo: coge, aprieta hacia arriba y se aparta de golpe (abierta) al salpicar
    const susto = { x: 0, y: 0, mu: 2.4, d: ABIERTA };
    const PL_C = [
      [0, 0, REPOSO_GC],
      [T.gCoge + 0.05, T.gAlza, debajo],
      [T.gSuelta, T.gSuelta + 0.16, () => { const q = enH(-28, 26); return Object.assign({}, susto, { x: q.x - 18, y: q.y + 6 }); }, salida],
      [T.gSueltaFin + 0.1, T.caida[0] + 0.1, REPOSO_GC]
    ];
    const c = pista(PL_C, t);
    // tamborilea en la barra al principio
    const tam = dentro(t, 0.3, 0.5, T.gPasmo - 0.1, T.gPasmo + 0.1);
    if (tam > 0) l.d = mezclaD(l.d, D(0.55, 0.62 + 0.25 * Math.max(0, Math.sin(t * 14)), 0.76, 0.72, 0.68), tam);
    let objL = null, objC = null;
    if (hb.quien === "g") objL = g => conCamara(g, () => hamburguesa(g, hb, t));
    // la servilleta (mano lejana): en la mano y luego de babero
    if (t >= T.gToma) {
      const s0 = poseY(T.gToma - 1e-4).serv;
      if (t < T.gMete) { const sv = { quien: "g", x: l.x + 2, y: l.y + 1, a: lerp(s0.a, -0.05, suave(fase(t, T.gToma, T.gMete))), abre: 1 }; p.serv = sv; objL = g => conCamara(g, () => servilleta(g, sv, t)); }
      else { const cu = cuelloG(p), k = salida(fase(t, T.gMete, T.gMete + 0.25)), mano = { x: lerp(l.x + 2, cu.x + 4, k), y: lerp(l.y + 1, cu.y + 2, k) };
        p.serv = { quien: "babero", x: mano.x, y: mano.y, a: -0.05 + 0.03 * Math.sin(t * 2.2) * k, abre: 1, babero: k }; }
    }
    p.manoLejos = manoRig(G, p, l, -1, objL);
    p.manoCerca = manoRig(G, p, c, -1, objC);
    void R_MG;
  }
  const cuelloG = p => G.aPantalla(p, G.tronco(p)(P(G.CUELLO.x + 36, G.CUELLO.y + 56)));

  /* =====================================================================================
   * LA SERVILLETA: del servilletero a la mano de Yorgi, a la de Guillermo y al cuello (babero)
   * ===================================================================================== */
  function servilletaT(t) {
    if (t < T.yServ) return { quien: "dispensador", x: SERVILLETERO.x - 6, y: SERVILLETERO.y - 9, a: -0.3, abre: 0 };
    if (t < T.gToma) return poseY(t).serv;
    return poseG(t).serv;
  }
  function servilleta(g, s, t) {
    g.save(); g.translate(s.x, s.y); g.rotate(s.a || 0); g.lineJoin = "round"; g.lineCap = "round";
    if (s.quien !== "dispensador") { const e = lerp(0.85, 1.4, s.abre ?? 1); g.scale(e, e); }
    if (s.quien === "dispensador") {
      // solo asoma la puntita
      g.fillStyle = "#fbfaf6"; g.beginPath(); g.moveTo(-4, 0); g.lineTo(4, 0); g.lineTo(2, -7); g.lineTo(-3, -6); g.closePath(); g.fill();
      g.lineWidth = 0.8; g.strokeStyle = "#8a8a90"; g.stroke(); g.restore(); return;
    }
    const k = s.abre ?? 1, bab = s.babero || 0;
    // cuadrado de papel: doblado en la mano, se despliega colgando de los dedos; de babero cuelga del cuello
    const DOB = [P(-5, -4), P(5, -5), P(5.5, 5.5), P(-4.5, 6)], ABI = [P(-10, -2), P(10, -2), P(11, 19), P(-9, 20)], BAB = [P(-9, -2), P(9, -2), P(14, 27), P(-12, 28)];
    const pts = DOB.map((q, i) => { const a = mezcla(q, ABI[i], k); return mezcla(a, BAB[i], bab); });
    g.beginPath(); g.moveTo(pts[0].x, pts[0].y);
    g.quadraticCurveTo((pts[0].x + pts[1].x) / 2, pts[0].y - 1.5, pts[1].x, pts[1].y);
    g.quadraticCurveTo(pts[1].x + 1.5, (pts[1].y + pts[2].y) / 2, pts[2].x, pts[2].y);
    g.quadraticCurveTo((pts[2].x + pts[3].x) / 2, pts[2].y + 2 + 1.5 * Math.sin(t * 3), pts[3].x, pts[3].y);
    g.quadraticCurveTo(pts[3].x - 1.5, (pts[3].y + pts[0].y) / 2, pts[0].x, pts[0].y); g.closePath();
    g.fillStyle = "#fbfaf6"; g.fill();
    g.save(); g.clip();
    // pliegues y la cenefa roja
    g.strokeStyle = "rgba(150,150,160,0.55)"; g.lineWidth = 0.7;
    g.beginPath(); g.moveTo((pts[0].x + pts[1].x) / 2, pts[0].y); g.lineTo((pts[2].x + pts[3].x) / 2, pts[2].y); g.stroke();
    g.beginPath(); g.moveTo((pts[0].x + pts[3].x) / 2, (pts[0].y + pts[3].y) / 2); g.lineTo((pts[1].x + pts[2].x) / 2, (pts[1].y + pts[2].y) / 2); g.stroke();
    g.strokeStyle = "rgba(216,40,42,0.85)"; g.lineWidth = 1;
    g.beginPath(); g.moveTo(pts[2].x - 2, pts[2].y - 2.5); g.lineTo(pts[3].x + 2, pts[3].y - 2.5); g.stroke();
    if (bab > 0.3) { g.fillStyle = `rgba(200,30,20,${0.85 * clamp((bab - 0.3) / 0.5)})`; g.beginPath(); g.arc(4, 18, 1.6, 0, TAU); g.fill(); }
    g.restore();
    g.lineWidth = 0.9; g.strokeStyle = "#6a6a72"; g.stroke();
    g.restore();
  }

  /* =====================================================================================
   * LA SALSA: chorros por los dos lados y manchas en la cara de Guillermo (retrato)
   * ===================================================================================== */
  const PIEL_CAB = [[806,850],[802,846],[766,842],[754,834],[746,834],[742,838],[734,826],[726,826],[718,814],[710,814],[704,808],[708,804],[702,798],[698,802],[690,798],[684,792],[682,782],[674,782],[662,774],[656,768],[660,764],[654,758],[650,762],[634,746],[630,746],[624,740],[624,732],[604,716],[608,712],[604,708],[604,692],[596,684],[596,668],[582,670],[570,654],[566,658],[556,648],[560,640],[558,638],[554,642],[544,632],[548,624],[532,604],[532,596],[528,592],[528,572],[532,568],[528,564],[532,560],[528,552],[540,536],[540,528],[548,516],[562,503],[570,499],[590,499],[624,532],[624,540],[630,550],[636,536],[632,532],[640,524],[640,516],[648,501],[676,477],[676,469],[684,461],[680,457],[690,447],[718,435],[734,423],[744,429],[728,461],[730,467],[762,451],[798,427],[806,431],[823,431],[839,443],[843,439],[851,439],[867,455],[875,455],[881,461],[869,481],[841,509],[843,511],[879,503],[903,487],[911,487],[917,493],[901,524],[893,532],[895,534],[931,514],[947,499],[955,503],[969,520],[965,596],[949,620],[953,624],[937,644],[937,652],[925,676],[909,732],[899,738],[877,764],[885,772],[875,782],[867,778],[861,788],[849,796],[825,832],[829,836],[819,846],[815,842]];
  const camino = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
  // manchas: x, y (retrato), radio, color (k kétchup / m mostaza), retraso desde el impacto, chorro (i izquierdo / d derecho)
  const MANCHAS = [
    { x: 852, y: 700, r: 28, c: "k", dt: 0.0, ch: "i" },
    { x: 842, y: 640, r: 12, c: "k", dt: 0.02, ch: "i" },
    { x: 680, y: 696, r: 36, c: "k", dt: 0.07, ch: "i" },
    { x: 786, y: 820, r: 13, c: "k", dt: 0.04, ch: "i" },
    { x: 646, y: 580, r: 25, c: "m", dt: 0.1, ch: "d" },
    { x: 712, y: 482, r: 17, c: "m", dt: 0.13, ch: "d" }
  ];
  const COL_SALSA = { k: ["#c81e14", "#ff6a50", "#7a0c08"], m: ["#f0b81a", "#fff0a0", "#a87808"] };
  function mancha(g, m, k, t, i) {
    if (k <= 0.001) return;
    const [col, luz, borde] = COL_SALSA[m.c];
    const r = m.r * (k < 1 ? salida(k) * (1 + 0.25 * Math.sin(Math.PI * k)) : 1);
    const forma = () => { g.beginPath();
      for (let j = 0; j <= 12; j++) { const a = j / 12 * TAU, rr = r * (0.82 + 0.3 * hash(i * 13 + j % 12)); const x = m.x + Math.cos(a) * rr, y = m.y + Math.sin(a) * rr * 0.9; if (j) g.lineTo(x, y); else g.moveTo(x, y); }
      g.closePath();
      // salpicaduras alrededor
      for (let j = 0; j < 2; j++) { const a = hash(i * 7 + j) * TAU, d = r * (1.3 + 0.35 * hash(i + j * 5)), rr = r * (0.2 + 0.1 * hash(j * 3 + i)) * clamp(k * 1.5); g.moveTo(m.x + Math.cos(a) * d + rr, m.y + Math.sin(a) * d); g.arc(m.x + Math.cos(a) * d, m.y + Math.sin(a) * d, rr, 0, TAU); }
    };
    // goterones que bajan despacio
    const vida = clamp((t - (T.impacto + m.dt)) / 2.4);
    g.fillStyle = col;
    for (let j = 0; j < (m.r > 20 ? 2 : 1); j++) {
      const x = m.x + (j ? 0.35 : -0.25) * r, L = r * (0.4 + 0.9 * suave(vida) * (0.6 + 0.4 * hash(i + j)));
      g.beginPath(); g.moveTo(x - r * 0.2, m.y); g.lineTo(x - r * 0.12, m.y + L); g.arc(x, m.y + L, r * 0.12, Math.PI, 0, true); g.lineTo(x + r * 0.2, m.y); g.closePath(); g.fill();
      g.strokeStyle = borde; g.lineWidth = 2; g.stroke();
    }
    forma(); g.fill(); g.strokeStyle = borde; g.lineWidth = 2.5; g.stroke();
    g.fillStyle = luz; g.globalAlpha = 0.8; g.beginPath(); g.ellipse(m.x - r * 0.3, m.y - r * 0.32, r * 0.3, r * 0.18, -0.5, 0, TAU); g.fill(); g.globalAlpha = 1;
  }
  function manchasCara(g, t) {
    if (t < T.impacto) return;
    g.save(); g.beginPath(); camino(g, PIEL_CAB); g.clip();
    MANCHAS.forEach((m, i) => mancha(g, m, clamp((t - T.impacto - m.dt) / 0.1), t, i));
    g.restore();
  }
  // los chorros (pantalla): de cada lado de la torre aplastada a su mancha en la cara
  function chorros(g, t, pG) {
    const t0 = T.chorro, t1 = T.impacto + 0.2;
    if (t < t0 || t > t1 + 0.1) return;
    const hb = pG.hamb, Ht = altoTorre(hb.sq || 0) * EH;
    const cen = P(hb.x, hb.y - Ht * 0.5), hw = HWMAX * EH * (1 + 0.2 * (hb.sq || 0));
    const H = G.cabeza(pG);
    g.save(); g.lineCap = "round";
    MANCHAS.forEach((m, i) => {
      const tl = T.impacto + m.dt, ts = t0 + m.dt * 0.6;
      const u = (t - ts) / (tl - ts); if (u < 0 || u > 1.15) return;
      const ini = m.ch === "i" ? P(cen.x - hw + 2, cen.y + 2) : P(cen.x + hw - 2, cen.y - 2);
      const fin = G.aPantalla(pG, H.a(P(m.x, m.y)));
      const alto = m.ch === "i" ? 18 : 70;
      const at = uu => P(lerp(ini.x, fin.x, uu), lerp(ini.y, fin.y, uu) - alto * 4 * uu * (1 - uu));
      const [col, , borde] = COL_SALSA[m.c];
      // rastro del chorro
      const u0 = clamp(u - 0.35), u1 = clamp(u);
      g.beginPath(); for (let k = 0; k <= 8; k++) { const q = at(lerp(u0, u1, k / 8)); if (k) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); }
      g.strokeStyle = borde; g.lineWidth = m.r * 0.16 + 1.4; g.stroke();
      g.strokeStyle = col; g.lineWidth = m.r * 0.16; g.stroke();
      if (u < 1) { const q = at(u1); g.fillStyle = col; g.beginPath(); g.arc(q.x, q.y, m.r * 0.11 + 1, 0, TAU); g.fill(); }
    });
    g.restore();
  }
  // goterones de salsa que asoman por los lados de la torre mientras la aprieta
  function rezuma(g, t, pG) {
    const k = aprietaK(t) * (1 - tramo(t, T.caida[0], T.caida[3]));
    if (k < 0.05 || pG.hamb.quien !== "g" || pG.hamb.piv === "tapa") return;
    const hb = pG.hamb, Ht = altoTorre(hb.sq || 0) * EH, hw = HWMAX * EH * (1 + 0.2 * hb.sq);
    g.save();
    for (const [sg, fy, c, r] of [[-1, 0.35, "k", 4], [1, 0.45, "m", 3.6], [-1, 0.65, "m", 3], [1, 0.7, "k", 4.2]]) {
      const x = hb.x + sg * (hw + r * 0.3 * k), y = hb.y - Ht * fy;
      g.fillStyle = COL_SALSA[c][0]; g.strokeStyle = COL_SALSA[c][2]; g.lineWidth = 0.8;
      g.beginPath(); g.ellipse(x, y, r * k, r * 0.8 * k, 0, 0, TAU); g.fill(); g.stroke();
    }
    g.restore();
  }

  /* =====================================================================================
   * FONDO (una vez): hamburguesería de las de antes
   * ===================================================================================== */
  let fondo = null, neon = null;
  const PARED = 472;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 160; c.height = H + 140; const g = c.getContext("2d");
    g.translate(80, 70); g.lineJoin = "round"; g.lineCap = "round";
    // pared verde menta
    const gr = g.createLinearGradient(0, -70, 0, 330); gr.addColorStop(0, "#7fc4ad"); gr.addColorStop(1, "#a9dcc8");
    g.fillStyle = gr; g.fillRect(-80, -70, W + 160, 400);
    for (let i = 0; i < 200; i++) { const x = -80 + hash(i * 3.1) * (W + 160), y = -70 + hash(i * 7.7) * 400, r = 8 + 20 * hash(i * 1.3);
      g.fillStyle = `rgba(${hash(i) > 0.5 ? "255,255,255" : "0,40,30"},${0.025 + 0.02 * hash(i * 9.1)})`; g.beginPath(); g.ellipse(x, y, r, r * 0.7, hash(i) * 3, 0, TAU); g.fill(); }
    // franja roja con molduras de cromo
    const franja = (y, h) => { g.fillStyle = "#d1313a"; g.fillRect(-80, y, W + 160, h); g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(-80, y + 2, W + 160, 2);
      for (const yy of [y - 4, y + h]) { const gc = g.createLinearGradient(0, yy, 0, yy + 4); gc.addColorStop(0, "#f4f7f9"); gc.addColorStop(0.5, "#9aa4ac"); gc.addColorStop(1, "#dfe6ea"); g.fillStyle = gc; g.fillRect(-80, yy, W + 160, 4); } };
    franja(186, 12);
    // zócalo de escay rojo acolchado con remate de cromo
    g.fillStyle = "#b8262e"; g.fillRect(-80, 336, W + 160, PARED - 336);
    for (let k = -4; k < 44; k++) { const x = k * 28 - 80;
      const gp = g.createLinearGradient(x, 0, x + 28, 0); gp.addColorStop(0, "rgba(0,0,0,0.18)"); gp.addColorStop(0.5, "rgba(255,255,255,0.1)"); gp.addColorStop(1, "rgba(0,0,0,0.22)");
      g.fillStyle = gp; g.fillRect(x, 340, 28, PARED - 340);
      g.fillStyle = "#7e1218"; for (const y of [372, 420]) { g.beginPath(); g.arc(x + 14, y + (k % 2) * 24, 1.8, 0, TAU); g.fill(); } }
    { const gc = g.createLinearGradient(0, 330, 0, 340); gc.addColorStop(0, "#f4f7f9"); gc.addColorStop(0.5, "#8d979f"); gc.addColorStop(1, "#d5dde2"); g.fillStyle = gc; g.fillRect(-80, 330, W + 160, 9); }
    g.fillStyle = "#2a2a2e"; g.fillRect(-80, PARED - 10, W + 160, 10);
    // suelo de baldosa blanca y negra en perspectiva
    const VP = { x: 512, y: -380 }, Y0 = PARED;
    const filas = [Y0]; { let y = Y0, h = 13; while (y < H + 80) { y += h; filas.push(y); h *= 1.22; } }
    const xEn = (X, y) => VP.x + (X - VP.x) * (y - VP.y) / (Y0 - VP.y);
    for (let r = 0; r < filas.length - 1; r++) for (let k = -18; k < 18; k++) {
      const X0 = 512 + k * 40, X1 = X0 + 40, ya = filas[r], yb = filas[r + 1];
      g.beginPath(); g.moveTo(xEn(X0, ya), ya); g.lineTo(xEn(X1, ya), ya); g.lineTo(xEn(X1, yb), yb); g.lineTo(xEn(X0, yb), yb); g.closePath();
      g.fillStyle = (r + k) % 2 ? "#1d1c22" : "#f1ede4"; g.fill();
    }
    const gs = g.createLinearGradient(0, Y0, 0, Y0 + 200); gs.addColorStop(0, "rgba(20,30,30,0.35)"); gs.addColorStop(1, "rgba(20,30,30,0.05)"); g.fillStyle = gs; g.fillRect(-80, Y0, W + 160, 260);
    // brillo del suelo bajo la barra
    const gb = g.createRadialGradient(514, 590, 10, 514, 590, 220); gb.addColorStop(0, "rgba(255,255,255,0.12)"); gb.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gb; g.fillRect(250, 480, 530, 200);

    // ventanilla de la cocina (detrás de la barra)
    const V = { x0: 446, x1: 582, y0: 214, y1: 296 };
    const gk = g.createLinearGradient(0, V.y0, 0, V.y1); gk.addColorStop(0, "#ffb85c"); gk.addColorStop(1, "#d9672c");
    g.fillStyle = gk; g.fillRect(V.x0, V.y0, V.x1 - V.x0, V.y1 - V.y0);
    g.save(); g.beginPath(); g.rect(V.x0, V.y0, V.x1 - V.x0, V.y1 - V.y0); g.clip();
    // la cocina: azulejo, campana, sartenes colgadas y la plancha
    g.strokeStyle = "rgba(150,70,20,0.35)"; g.lineWidth = 1;
    for (let y = V.y0 + 10; y < V.y1; y += 12) { g.beginPath(); g.moveTo(V.x0, y); g.lineTo(V.x1, y); g.stroke(); }
    for (let x = V.x0; x < V.x1; x += 16) { g.beginPath(); g.moveTo(x, V.y0); g.lineTo(x, V.y1); g.stroke(); }
    g.fillStyle = "#6c4a3a"; g.beginPath(); g.moveTo(V.x0 + 20, V.y0); g.lineTo(V.x1 - 20, V.y0); g.lineTo(V.x1 - 34, V.y0 + 22); g.lineTo(V.x0 + 34, V.y0 + 22); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,80,40,0.55)"; g.fillRect(V.x0 + 36, V.y0 + 22, V.x1 - V.x0 - 72, 4);
    for (const [x, r] of [[V.x0 + 22, 9], [V.x0 + 40, 7], [V.x1 - 26, 10]]) {
      g.strokeStyle = "#2b2324"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, V.y0 + 26); g.lineTo(x, V.y0 + 36); g.stroke();
      g.fillStyle = "#2b2324"; g.beginPath(); g.ellipse(x, V.y0 + 36 + r, r, r, 0, 0, TAU); g.fill();
      g.fillStyle = "rgba(255,200,140,0.35)"; g.beginPath(); g.ellipse(x - r * 0.3, V.y0 + 36 + r * 0.7, r * 0.4, r * 0.25, -0.5, 0, TAU); g.fill();
    }
    g.fillStyle = "#3a3236"; g.fillRect(V.x0, V.y1 - 18, V.x1 - V.x0, 18);
    g.fillStyle = "rgba(255,190,110,0.5)"; g.fillRect(V.x0, V.y1 - 19, V.x1 - V.x0, 2);
    g.restore();
    // marco de acero de la ventanilla
    const acero = (x, y, w, h) => { const ga = g.createLinearGradient(x, y, x + w, y + h); ga.addColorStop(0, "#eef2f4"); ga.addColorStop(0.5, "#a3adb4"); ga.addColorStop(1, "#d8dfe3"); g.fillStyle = ga; g.fillRect(x, y, w, h); g.strokeStyle = "#4a5056"; g.lineWidth = 1.2; g.strokeRect(x, y, w, h); };
    acero(V.x0 - 9, V.y0 - 9, V.x1 - V.x0 + 18, 9); acero(V.x0 - 9, V.y0, 9, V.y1 - V.y0); acero(V.x1, V.y0, 9, V.y1 - V.y0);
    // pizarras de menú (solo dibujos; los precios, estrellitas)
    pizarra(g, 104, 44, 196, 118, [["burger", "fries", "hotdog"], ["shake", "soda", "cono"]]);
    pizarra(g, 724, 44, 196, 118, [["cono", "burger", "shake"], ["fries", "hotdog", "soda"]]);
    // reloj de pared sin números
    const RX = 860, RY = 250, RR = 22;
    g.fillStyle = "#c9d1d6"; g.beginPath(); g.arc(RX, RY, RR + 4, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = "#fffaf0"; g.beginPath(); g.arc(RX, RY, RR, 0, TAU); g.fill();
    g.strokeStyle = "#d1313a"; for (let i = 0; i < 12; i++) { const a = i * TAU / 12; g.lineWidth = i % 3 ? 1.2 : 2.6; g.beginPath(); g.moveTo(RX + Math.cos(a) * (RR - 3), RY + Math.sin(a) * (RR - 3)); g.lineTo(RX + Math.cos(a) * (RR - (i % 3 ? 6 : 8)), RY + Math.sin(a) * (RR - (i % 3 ? 6 : 8))); g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = 2.6; g.beginPath(); g.moveTo(RX, RY); g.lineTo(RX + 9, RY - 7); g.stroke(); g.lineWidth = 1.8; g.beginPath(); g.moveTo(RX, RY); g.lineTo(RX - 4, RY - 16); g.stroke();
    // jukebox de pared (izquierda): solo formas y luces
    const JX = 150, JY = 232;
    g.fillStyle = "#f0e6d0"; g.beginPath(); g.roundRect(JX - 26, JY - 30, 52, 62, [26, 26, 6, 6]); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.stroke();
    g.fillStyle = "#ffcf5a"; g.beginPath(); g.roundRect(JX - 18, JY - 22, 36, 26, [18, 18, 3, 3]); g.fill(); g.stroke();
    for (let k = 0; k < 5; k++) { g.fillStyle = ["#e9463e", "#3ea7e9", "#f6d33c", "#59c25a", "#e9463e"][k]; g.fillRect(JX - 18 + k * 7.2, JY + 8, 6, 6); }
    g.fillStyle = "#b9c2c8"; g.fillRect(JX - 20, JY + 18, 40, 8); g.strokeRect(JX - 20, JY + 18, 40, 8);
    // taburetes y barra
    taburete(g, XG - 4); taburete(g, XY + 4);
    barra(g);
    // en la barra: batido, biberones y servilletero
    batido(g, 486, 306);
    biberon(g, 566, 314, "#d8282a", "#a51618"); biberon(g, 576, 318, "#f2c21e", "#c49510");
    servilletero(g, SERVILLETERO.x, SERVILLETERO.y);
    return c;
  }
  function icono(g, tipo, x, y) {
    g.save(); g.translate(x, y); g.lineJoin = "round"; g.lineCap = "round"; g.lineWidth = 1.2; g.strokeStyle = "#f4efe6";
    switch (tipo) {
      case "burger":
        g.fillStyle = "#e8a14d"; g.beginPath(); g.moveTo(-12, -2); g.bezierCurveTo(-12, -14, 12, -14, 12, -2); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = "#7cc43f"; g.fillRect(-13, -2, 26, 3); g.fillStyle = "#5e3420"; g.fillRect(-12, 1, 24, 4); g.fillStyle = "#e8a14d"; g.beginPath(); g.roundRect(-12, 5, 24, 5, 2); g.fill(); g.stroke(); break;
      case "fries":
        g.fillStyle = "#f6d33c"; for (let k = -3; k <= 3; k++) g.fillRect(k * 3 - 1, -14 + Math.abs(k) * 1.5, 2.4, 12);
        g.fillStyle = "#e9463e"; g.beginPath(); g.moveTo(-10, -4); g.lineTo(10, -4); g.lineTo(7, 10); g.lineTo(-7, 10); g.closePath(); g.fill(); g.stroke(); break;
      case "hotdog":
        g.fillStyle = "#e8a14d"; g.beginPath(); g.ellipse(0, 2, 14, 6, 0, 0, TAU); g.fill(); g.stroke();
        g.fillStyle = "#c2452c"; g.beginPath(); g.roundRect(-15, -3, 30, 5, 2.5); g.fill();
        g.strokeStyle = "#f6d33c"; g.lineWidth = 1.2; g.beginPath(); for (let k = 0; k <= 8; k++) g.lineTo(-11 + k * 2.8, -1 + (k % 2 ? 1.5 : -1.5)); g.stroke(); break;
      case "shake":
        g.fillStyle = "#f7b3c8"; g.beginPath(); g.moveTo(-7, -6); g.lineTo(7, -6); g.lineTo(4, 12); g.lineTo(-4, 12); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = "#fffaf2"; g.beginPath(); g.arc(-3, -7, 4, 0, TAU); g.arc(3, -8, 4, 0, TAU); g.fill();
        g.fillStyle = "#d8282a"; g.beginPath(); g.arc(0, -13, 2.2, 0, TAU); g.fill(); g.strokeStyle = "#f4efe6"; g.beginPath(); g.moveTo(3, -8); g.lineTo(7, -17); g.stroke(); break;
      case "soda":
        g.fillStyle = "#3ea7e9"; g.beginPath(); g.moveTo(-7, -8); g.lineTo(7, -8); g.lineTo(5, 12); g.lineTo(-5, 12); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = "#f4efe6"; g.fillRect(-8, -10, 16, 3); g.beginPath(); g.moveTo(2, -10); g.lineTo(5, -17); g.stroke(); break;
      case "cono":
        g.fillStyle = "#e0b070"; g.beginPath(); g.moveTo(-7, -2); g.lineTo(7, -2); g.lineTo(0, 13); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = "#a6e0f0"; g.beginPath(); g.arc(0, -6, 7, Math.PI, 0); g.lineTo(7, -2); g.lineTo(-7, -2); g.closePath(); g.fill(); g.stroke(); break;
    }
    g.restore();
  }
  function pizarra(g, x, y, w, h, filas) {
    g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(x + 5, y + 6, w, h);
    g.fillStyle = "#26272d"; g.fillRect(x, y, w, h);
    const gc = g.createLinearGradient(x, y, x + w, y + h); gc.addColorStop(0, "#eef2f4"); gc.addColorStop(0.5, "#98a2aa"); gc.addColorStop(1, "#dfe6ea");
    g.strokeStyle = gc; g.lineWidth = 6; g.strokeRect(x, y, w, h); g.strokeStyle = TINTA; g.lineWidth = 1; g.strokeRect(x - 3, y - 3, w + 6, h + 6);
    filas.forEach((f, r) => f.forEach((ic, k) => {
      const cx = x + w * (k + 0.5) / 3, cy = y + 30 + r * 52;
      icono(g, ic, cx, cy);
      // «precio»: estrellitas y puntos (sin números)
      g.fillStyle = "#f6d33c";
      for (let s = 0; s < 1 + ((r + k) % 3); s++) estrella(g, cx - 8 + s * 8, cy + 19, 2.8);
    }));
    g.fillStyle = "rgba(255,255,255,0.05)"; g.beginPath(); g.moveTo(x + 6, y + 4); g.lineTo(x + 60, y + 4); g.lineTo(x + 20, y + h - 4); g.lineTo(x + 6, y + h - 4); g.closePath(); g.fill();
  }
  function estrella(g, x, y, r) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); }
  function taburete(g, x) {
    g.save(); g.lineJoin = "round";
    const yS = Y_ASIENTO, gC = (x0, x1) => { const gc = g.createLinearGradient(x0, 0, x1, 0); gc.addColorStop(0, "#7d868d"); gc.addColorStop(0.35, "#f4f7f9"); gc.addColorStop(0.7, "#aab3ba"); gc.addColorStop(1, "#6a737a"); return gc; };
    // sombra y base
    g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse(x, SUELO + 2, 40, 7, 0, 0, TAU); g.fill();
    g.fillStyle = gC(x - 30, x + 30); g.beginPath(); g.ellipse(x, SUELO - 3, 30, 6.5, 0, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke();
    // poste
    g.fillStyle = gC(x - 6, x + 6); g.fillRect(x - 6, yS + 6, 12, SUELO - yS - 8); g.strokeRect(x - 6, yS + 6, 12, SUELO - yS - 8);
    // aro para los pies (con sus dos brazos)
    g.strokeStyle = TINTA; g.lineWidth = 6.4; g.beginPath(); g.ellipse(x, Y_ARO, 30, 7, 0, 0, TAU); g.stroke();
    g.strokeStyle = gC(x - 30, x + 30); g.lineWidth = 4; g.stroke();
    g.strokeStyle = "#8a939a"; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 6, Y_ARO - 12); g.lineTo(x - 28, Y_ARO - 1); g.moveTo(x + 6, Y_ARO - 12); g.lineTo(x + 28, Y_ARO - 1); g.stroke();
    // asiento: canto de cromo y cojín rojo acolchado
    g.fillStyle = gC(x - 34, x + 34); g.beginPath(); g.roundRect(x - 34, yS - 2, 68, 10, 4); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke();
    const gr = g.createRadialGradient(x - 8, yS - 8, 2, x, yS - 4, 38); gr.addColorStop(0, "#f05058"); gr.addColorStop(1, "#a8141c");
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, yS - 3, 34, 9, 0, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = "#7e1218"; g.beginPath(); g.arc(x, yS - 4, 1.6, 0, TAU); g.fill();
    g.restore();
  }
  function barra(g) {
    const B = BARRA;
    g.save(); g.lineJoin = "round";
    // pie de cromo con su base
    const xc = (B.xd0 + B.xd1) / 2, gC = (x0, x1) => { const gc = g.createLinearGradient(x0, 0, x1, 0); gc.addColorStop(0, "#6f787f"); gc.addColorStop(0.35, "#f4f7f9"); gc.addColorStop(0.7, "#a8b1b8"); gc.addColorStop(1, "#5f686f"); return gc; };
    g.fillStyle = "rgba(0,0,0,0.32)"; g.beginPath(); g.ellipse(xc, SUELO - 4, 56, 9, 0, 0, TAU); g.fill();
    g.fillStyle = gC(xc - 44, xc + 44); g.beginPath(); g.ellipse(xc, SUELO - 8, 44, 8, 0, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke();
    g.fillStyle = gC(xc - 11, xc + 11); g.fillRect(xc - 11, B.y1 + B.canto, 22, SUELO - 8 - B.y1 - B.canto); g.strokeRect(xc - 11, B.y1 + B.canto, 22, SUELO - 8 - B.y1 - B.canto);
    // sombra de la encimera sobre el pie y la pared
    g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(xc - 11, B.y1 + B.canto, 22, 10);
    // encimera de formica (blanca con bumeranes) en trapecio
    const sup = () => { g.beginPath(); g.moveTo(B.xa0, B.y0); g.lineTo(B.xa1, B.y0); g.lineTo(B.xd1, B.y1); g.lineTo(B.xd0, B.y1); g.closePath(); };
    sup(); g.fillStyle = "#f4efe4"; g.fill();
    g.save(); sup(); g.clip();
    for (let i = 0; i < 26; i++) { const x = B.xd0 + hash(i * 4.4) * (B.xd1 - B.xd0), y = B.y0 + hash(i * 2.9) * (B.y1 - B.y0), a = hash(i) * TAU;
      g.strokeStyle = ["rgba(216,40,42,0.35)", "rgba(60,160,190,0.35)", "rgba(40,40,40,0.25)"][i % 3]; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(x - Math.cos(a) * 5, y - Math.sin(a) * 2); g.quadraticCurveTo(x, y - 2.5, x + Math.cos(a + 0.8) * 5, y + Math.sin(a + 0.8) * 2); g.stroke(); }
    const gl = g.createLinearGradient(0, B.y0, 0, B.y1); gl.addColorStop(0, "rgba(0,40,30,0.12)"); gl.addColorStop(1, "rgba(255,255,255,0.15)"); g.fillStyle = gl; g.fillRect(B.xd0, B.y0, B.xd1 - B.xd0, B.y1 - B.y0);
    g.restore();
    sup(); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke();
    // canto de cromo acanalado
    const gc = g.createLinearGradient(0, B.y1, 0, B.y1 + B.canto); gc.addColorStop(0, "#f7fafb"); gc.addColorStop(0.45, "#9aa4ac"); gc.addColorStop(0.55, "#c9d0d5"); gc.addColorStop(1, "#6f787f");
    g.fillStyle = gc; g.fillRect(B.xd0, B.y1, B.xd1 - B.xd0, B.canto);
    g.strokeStyle = "rgba(60,66,72,0.5)"; g.lineWidth = 0.8; for (const yy of [B.y1 + 4, B.y1 + 8]) { g.beginPath(); g.moveTo(B.xd0, yy); g.lineTo(B.xd1, yy); g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = 1.5; g.strokeRect(B.xd0, B.y1, B.xd1 - B.xd0, B.canto);
    // cantos laterales (finos)
    g.strokeStyle = "#c9d0d5"; g.lineWidth = 2.4; g.beginPath(); g.moveTo(B.xa0 + 1, B.y0 + 1); g.lineTo(B.xd0 + 1, B.y1); g.moveTo(B.xa1 - 1, B.y0 + 1); g.lineTo(B.xd1 - 1, B.y1); g.stroke();
    // repisa de acero de la ventanilla (encima de la encimera, al fondo)
    const ga = g.createLinearGradient(0, B.y0 - 6, 0, B.y0); ga.addColorStop(0, "#f4f7f9"); ga.addColorStop(1, "#8d979f");
    g.fillStyle = ga; g.fillRect(442, B.y0 - 5, 144, 6); g.strokeStyle = "#4a5056"; g.lineWidth = 1; g.strokeRect(442, B.y0 - 5, 144, 6);
    g.restore();
  }
  function batido(g, x, y) {
    g.save(); g.translate(x, y); g.lineJoin = "round"; g.lineCap = "round";
    g.fillStyle = "rgba(0,0,0,0.2)"; g.beginPath(); g.ellipse(1, 1, 8, 2, 0, 0, TAU); g.fill();
    // pie de copa
    g.fillStyle = "rgba(225,240,245,0.9)"; g.beginPath(); g.ellipse(0, 0, 7, 1.8, 0, 0, TAU); g.fill(); g.strokeStyle = "#5a6a72"; g.lineWidth = 0.8; g.stroke();
    g.fillRect(-1.2, -6, 2.4, 6);
    // vaso con el batido de fresa
    const vaso = () => { g.beginPath(); g.moveTo(-6.5, -30); g.lineTo(6.5, -30); g.lineTo(3.2, -6); g.lineTo(-3.2, -6); g.closePath(); };
    vaso(); g.fillStyle = "#f7a9c0"; g.fill();
    g.fillStyle = "rgba(255,255,255,0.45)"; g.fillRect(-5, -29, 1.6, 20);
    vaso(); g.strokeStyle = "#5a6a72"; g.lineWidth = 0.9; g.stroke();
    // nata, guinda y pajita de rayas
    g.fillStyle = "#fffaf2"; for (const [cx, cy, r] of [[-3.6, -32, 3.6], [0, -34, 4.4], [3.6, -32, 3.6], [0, -38, 3]]) { g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); }
    g.strokeStyle = "rgba(160,150,140,0.7)"; g.lineWidth = 0.6; g.beginPath(); g.arc(0, -34, 4.4, Math.PI * 0.1, Math.PI * 0.9); g.stroke();
    g.strokeStyle = "#d8282a"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(2, -30); g.lineTo(6.5, -47); g.stroke();
    g.strokeStyle = "#fffaf2"; g.lineWidth = 2.2; g.setLineDash([2, 2]); g.stroke(); g.setLineDash([]);
    g.fillStyle = "#d8282a"; g.beginPath(); g.arc(-1, -42, 2.6, 0, TAU); g.fill(); g.strokeStyle = "#5a1010"; g.lineWidth = 0.6; g.stroke();
    g.strokeStyle = "#3a5a1a"; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-1, -44.5); g.quadraticCurveTo(0, -48, 2, -49); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.8)"; g.beginPath(); g.arc(-1.8, -43, 0.7, 0, TAU); g.fill();
    g.restore();
  }
  function biberon(g, x, y, col, osc) {
    g.save(); g.translate(x, y); g.lineJoin = "round";
    g.fillStyle = "rgba(0,0,0,0.2)"; g.beginPath(); g.ellipse(1, 1, 6, 1.6, 0, 0, TAU); g.fill();
    const cuerpo = () => { g.beginPath(); g.moveTo(-4.6, 0); g.lineTo(-4.6, -18); g.quadraticCurveTo(-4.6, -21, -2, -22); g.lineTo(2, -22); g.quadraticCurveTo(4.6, -21, 4.6, -18); g.lineTo(4.6, 0); g.closePath(); };
    cuerpo(); g.fillStyle = col; g.fill();
    g.fillStyle = osc; g.fillRect(1.6, -20, 3, 20);
    g.fillStyle = "rgba(255,255,255,0.55)"; g.fillRect(-3.4, -18, 1.3, 15);
    cuerpo(); g.strokeStyle = TINTA; g.lineWidth = 0.9; g.stroke();
    g.fillStyle = col; g.beginPath(); g.moveTo(-1.6, -22); g.lineTo(1.6, -22); g.lineTo(0.6, -29); g.lineTo(-0.6, -29); g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  function servilletero(g, x, y) {
    g.save(); g.translate(x, y); g.lineJoin = "round";
    g.fillStyle = "rgba(0,0,0,0.22)"; g.beginPath(); g.ellipse(1, 1, 11, 2.4, 0, 0, TAU); g.fill();
    const gc = g.createLinearGradient(-10, 0, 10, 0); gc.addColorStop(0, "#7d868d"); gc.addColorStop(0.4, "#f4f7f9"); gc.addColorStop(1, "#8a939a");
    g.fillStyle = gc; g.beginPath(); g.roundRect(-10, -14, 20, 14, 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1; g.stroke();
    g.fillStyle = "#fbfaf6"; g.fillRect(-7.5, -11, 15, 7); g.strokeStyle = "#9aa0a6"; g.lineWidth = 0.6; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-7.5, -10 + k * 1.8); g.lineTo(7.5, -10 + k * 1.8); g.stroke(); }
    g.restore();
  }
  // neón con forma de hamburguesa (con su halo), se pinta una vez
  function creaNeon() {
    const c = document.createElement("canvas"); c.width = 280; c.height = 200; const g = c.getContext("2d");
    g.translate(140, 100); g.lineJoin = "round"; g.lineCap = "round";
    const capas = (f, col, colIn) => {
      g.filter = "blur(9px)"; f(); g.strokeStyle = col; g.lineWidth = 11; g.stroke();
      g.filter = "blur(3px)"; f(); g.lineWidth = 6; g.stroke();
      g.filter = "none"; f(); g.strokeStyle = colIn; g.lineWidth = 2.8; g.stroke();
    };
    const tapa = () => { g.beginPath(); g.moveTo(-62, -6); g.bezierCurveTo(-62, -58, 62, -58, 62, -6); g.closePath(); };
    const sesamo = () => { g.beginPath(); for (const [x, y] of [[-24, -30], [0, -40], [24, -30], [-10, -20], [14, -18]]) { g.moveTo(x - 3, y); g.lineTo(x + 3, y - 1); } };
    const lechuga = () => { g.beginPath(); g.moveTo(-66, 4); for (let k = 0; k <= 12; k++) g.lineTo(-66 + k * 11, 4 + (k % 2 ? 6 : -2)); };
    const carne = () => { g.beginPath(); g.roundRect(-60, 14, 120, 12, 6); };
    const base = () => { g.beginPath(); g.moveTo(-58, 34); g.lineTo(58, 34); g.quadraticCurveTo(58, 48, 44, 48); g.lineTo(-44, 48); g.quadraticCurveTo(-58, 48, -58, 34); g.closePath(); };
    capas(tapa, "rgba(255,170,60,0.95)", "#fff1c8");
    capas(sesamo, "rgba(255,240,200,0.9)", "#ffffff");
    capas(lechuga, "rgba(80,255,120,0.9)", "#d8ffe0");
    capas(carne, "rgba(255,60,90,0.95)", "#ffd0dc");
    capas(base, "rgba(255,170,60,0.95)", "#fff1c8");
    return c;
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  // timbre en la repisa de la ventanilla: «¡ding!»
  const TIMBRE = P(452, 290);
  function timbre(g, t) {
    const v = t - T.ding, gol = v > 0 && v < 0.12 ? Math.sin(Math.PI * v / 0.12) : 0;
    g.save(); g.translate(TIMBRE.x, TIMBRE.y); g.lineJoin = "round";
    g.fillStyle = "#3a3236"; g.beginPath(); g.ellipse(0, 0, 8, 2.2, 0, 0, TAU); g.fill();
    const gc = g.createLinearGradient(-7, 0, 7, 0); gc.addColorStop(0, "#b48a2a"); gc.addColorStop(0.4, "#ffe9a0"); gc.addColorStop(1, "#9a7420");
    g.fillStyle = gc; g.beginPath(); g.moveTo(-7, -1); g.bezierCurveTo(-7, -10, 7, -10, 7, -1); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 0.9; g.stroke();
    g.fillStyle = "#2a2226"; g.fillRect(-0.8, -11 + 2.5 * gol, 1.6, 3); g.beginPath(); g.arc(0, -11.5 + 2.5 * gol, 1.6, 0, TAU); g.fill();
    // ondas del sonido
    if (v > 0 && v < 0.6) {
      const k = v / 0.6; g.strokeStyle = `rgba(255,250,220,${1 - k})`; g.lineWidth = 1.3; g.lineCap = "round";
      for (const sg of [-1, 1]) for (let i = 0; i < 2; i++) { const r = 10 + i * 5 + 10 * k; g.beginPath(); g.arc(0, -6, r, sg > 0 ? -0.9 : Math.PI - 0.5, sg > 0 ? 0.5 : Math.PI + 0.9); g.stroke(); }
      for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * 0.5, r0 = 12 + 8 * k, r1 = r0 + 5; g.beginPath(); g.moveTo(Math.cos(a) * r0, -6 + Math.sin(a) * r0); g.lineTo(Math.cos(a) * r1, -6 + Math.sin(a) * r1); g.stroke(); }
    }
    g.restore();
  }
  // vapor de la cocina por la ventanilla
  function vapor(g, t) {
    g.save(); g.beginPath(); g.rect(446, 150, 136, 146); g.clip();
    for (let i = 0; i < 6; i++) {
      const ph = (t * 0.32 + i / 6) % 1, x = 470 + i * 18 + 6 * Math.sin(t * 1.3 + i), y = 286 - 90 * ph;
      g.globalAlpha = 0.18 * Math.sin(Math.PI * ph); g.fillStyle = "#fff6ea";
      g.beginPath(); g.arc(x, y, 6 + 12 * ph, 0, TAU); g.fill();
    }
    g.restore();
  }
  // rayas de velocidad de los platos
  function rayasPlatos(g, t) {
    const k = dentro(t, T.sale, T.sale + 0.06, T.llega - 0.25, T.llega);
    if (k <= 0.01) return;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.75 * k})`; g.lineWidth = 1.4; g.lineCap = "round";
    for (const q of ["g", "y"]) {
      const p = platoPos(t, q), a = q === "g" ? SALIDA_G : SALIDA_Y, d = P(p.x - a.x, p.y - a.y), n = Math.hypot(d.x, d.y) || 1;
      for (let i = -1; i <= 1; i++) { const o = P(-d.y / n * i * 7, d.x / n * i * 7); g.beginPath(); g.moveTo(p.x - d.x / n * 14 + o.x, p.y - 8 - d.y / n * 14 + o.y); g.lineTo(p.x - d.x / n * 30 + o.x, p.y - 8 - d.y / n * 30 + o.y); g.stroke(); }
    }
    g.restore();
  }
  // rayitas del ¡ñam! de Yorgi y del ¡plof! de cada capa
  function rayitas(g, t, pY) {
    g.save(); g.lineCap = "round"; g.strokeStyle = "rgba(255,250,235,0.9)"; g.lineWidth = 1.6;
    for (const m of [T.m1, T.m2, T.m3]) {
      const v = fase(t, m, m + 0.3); if (v <= 0 || v >= 1) continue;
      const b = enBocaY(pY, 30, 40);
      g.globalAlpha = 1 - v;
      for (let i = 0; i < 5; i++) { const a = -Math.PI * 0.95 + i * 0.4, r0 = 26 + 14 * v, r1 = r0 + 8; g.beginPath(); g.moveTo(b.x + Math.cos(a) * r0, b.y + Math.sin(a) * r0); g.lineTo(b.x + Math.cos(a) * r1, b.y + Math.sin(a) * r1); g.stroke(); }
    }
    for (let i = 0; i < T.caida.length; i++) {
      const f = infoCapa(i), v = fase(t, f.t0 + f.tc, f.t0 + f.tc + 0.3); if (v <= 0 || v >= 1) continue;
      g.globalAlpha = 1 - v;
      for (const sg of [-1, 1]) { const x = f.q1.x + sg * (24 + 8 * v); g.beginPath(); g.moveTo(x, f.q1.y - 4); g.lineTo(x + sg * 6, f.q1.y - 10 - 3 * v); g.stroke(); }
    }
    g.restore();
  }
  // migas al morder
  function migas(g, t, pY) {
    for (const m of [T.m1, T.m2, T.m3]) {
      const v = t - m; if (v < 0 || v > 0.7) continue;
      const b = enBocaY(pY, 0, 120);
      for (let i = 0; i < 6; i++) {
        const vx = (hash(m * 10 + i) - 0.6) * 90, vy = -40 - 60 * hash(i * 3 + m), x = b.x + vx * v, y = b.y + vy * v + 0.5 * 900 * v * v;
        g.globalAlpha = clamp(1 - v / 0.7); g.fillStyle = i % 3 ? "#e8b26a" : (i % 2 ? "#7cc43f" : "#5e3420");
        g.beginPath(); g.ellipse(x, y, 1.5, 1.1, i, 0, TAU); g.fill();
      }
      g.globalAlpha = 1;
    }
  }

  /* ---------- cámara ---------- */
  const CAM = [
    [0, 0, { k: 1.36, x: 514, y: 300 }],
    [0.7, 1.4, { k: 1.62, x: 514, y: 292 }],
    [1.9, 2.5, { k: 1.92, x: 590, y: 262 }],
    [4.75, 5.15, { k: 1.85, x: 420, y: 258 }],
    [6.2, 6.8, { k: 1.82, x: 468, y: 262 }],
    [7.8, 8.3, { k: 1.66, x: 430, y: 310 }],
    [9.85, 10.4, { k: 1.42, x: 512, y: 296 }],
    [11.6, 12.1, { k: 1.72, x: 452, y: 278 }],
    [12.75, 13.6, { k: 1.42, x: 510, y: 286 }]
  ];
  function camara(t) {
    const c = pista(CAM, t);
    // golpecito en el chorro
    const ch = campana(t, T.chorro, T.chorro + 0.3); c.x += 2.5 * ch * Math.sin(t * 61); c.y += 1.8 * ch * Math.sin(t * 47);
    return c;
  }

  class LaHamburguesaGigante extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Y.listo()) return;
      if (!fondo) { fondo = creaFondo(); neon = creaNeon(); }
      const pG = poseG(t), pY = poseY(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      BASE_M = g.getTransform();
      g.drawImage(fondo, -80, -70);
      g.save(); g.globalAlpha = 0.84 + 0.1 * Math.sin(t * 1.7) + 0.06 * Math.sin(t * 9.3); g.drawImage(neon, 514 - 112, 140 - 80, 224, 160); g.restore();
      vapor(g, t);
      timbre(g, t);
      // en la barra: platos y hamburguesas (de atrás a delante)
      const hY = pY.hamb, hG = pG.hamb, sv = servilletaT(t);
      const items = [
        { y: platoPos(t, "g").y, f: () => { const q = platoPos(t, "g"); plato(g, q); if (hG.quien === "barra") hamburguesa(g, hG, t); } },
        { y: platoPos(t, "y").y, f: () => { const q = platoPos(t, "y"); plato(g, q); if (hY.quien === "barra") hamburguesa(g, hY, t); } }
      ];
      if (sv.quien === "dispensador") servilleta(g, sv, t);
      rayasPlatos(g, t);
      items.sort((a, c) => a.y - c.y).forEach(it => it.f());
      // personajes
      Y.dibujar(g, pY, t);
      G.dibujar(g, pG, t);
      // la pila del regazo y las capas que caen
      for (let i = 0; i < T.caida.length; i++) { const s = capaEstado(i, t); if (s) capaSuelta(g, i, s, t); }
      rezuma(g, t, pG);
      chorros(g, t, pG);
      migas(g, t, pY);
      rayitas(g, t, pY);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }

  registrar({ id: "00134", nombre: "Guillermo y Yorgi · La hamburguesa gigante", crear: () => new LaHamburguesaGigante() });
  // diagnóstico: distancia hombro → muñeca / largo del brazo (≤ 1,08 o la mano se despega)
  function diag(t) {
    const out = {};
    for (const [n, Rg, p] of [["g", G, poseG(t)], ["y", Y, poseY(t)]]) for (const lado of ["cerca", "lejos"]) {
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m || !m.puno) continue;
      const Tr = Rg.tronco(p), h = Tr(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO), mu = m.mu ?? -1.75;
      const w = { x: m.x + Math.cos(mu) * Rg.MUNECA_R * Rg.JK, y: m.y + Math.sin(mu) * Rg.MUNECA_R * Rg.JK };
      out[n + lado] = +(Math.hypot(w.x - h.x, w.y - h.y) / (lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L)).toFixed(3);
    }
    return out;
  }
  window.__A2D_00134 = { pose: t => ({ g: poseG(t), y: poseY(t) }), poseG, poseY, T, DUR, diag, hamburguesaG, hamburguesaY, capaEstado };
})();
