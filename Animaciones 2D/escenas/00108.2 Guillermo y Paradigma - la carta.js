"use strict";
/* 00108.2 · Guillermo y Paradigma · La partida de cartas
 *
 * Negro → noche de póquer en el cuarto de atrás del bar: pared forrada de madera oscura con su
 * zócalo, un cuadro, un aplique, un aparador con una licorera y una puerta entornada con luz; una
 * mesa redonda de tapete verde con su borde acolchado bajo una lámpara baja de pantalla verde que
 * hace un cono de luz cálida (motas de polvo, sin humo). Guillermo a la izquierda y Paradigma a la
 * derecha, sentados, cada uno con sus fichas; Paradigma con sus cartas en abanico y un vaso de
 * whisky con hielo; las dos cartas de Guillermo boca abajo en el tapete.
 *
 * Paradigma: cara de póquer perfecta (párpados a media asta, quieto; un sorbo, un parpadeo lento).
 * Guillermo coge sus cartas, mira… y se le ilumina la cara: estrellitas en los ojos, se pone
 * colorado, intenta disimular con los labios apretados (sudando), mira a cámara moviendo las cejas
 * y se marca un bailecito en la silla tamborileando en el borde de la mesa → deja las cartas, se
 * levanta medio cuerpo y empuja TODAS sus fichas al centro con los dos brazos (las pilas se deslizan
 * y se desmoronan, fichas que ruedan) y se sienta muy chulo → Paradigma iguala con una pila →
 * Guillermo da la vuelta a sus dos cartas de un manotazo (dos cartas flojísimas, solo pipos) y las
 * presenta con la palma → Paradigma, sin prisa, va dejando en el tapete cuatro ases, uno a uno (cada
 * uno con su clic y su brillo); a Guillermo se le congela la sonrisa, le da un tic, se le cae la
 * mandíbula → Paradigma recoge el bote con el antebrazo; Guillermo se queda tieso y cae de cara
 * sobre el tapete (¡pum!: la lámpara se balancea, una ficha salta y se le queda encima de la cabeza)
 * → Paradigma mira a cámara con la sonrisa justa y levanta el vaso → negro.
 *
 * Sin letras ni números: los naipes solo llevan pipos (♠ ♥ ♦ ♣). Todo depende de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, mezcla, hash, campana } = M2;
  const G = Guillermo, P = Paradigma;
  const DUR = 14.5;
  const TINTA = "#0b0a0e";

  /* ---------- guion (s) ---------- */
  const T = {
    // Guillermo mira sus cartas
    gCoge: 0.95, gSube: 1.3, gMira: 1.65, gWow: 2.0, gEstrellas: 2.05, gDisimula: 2.7, gCamara: 3.45, gBaile: 4.2, gBaileFin: 5.0,
    // all-in
    gDeja: 5.05, gDejado: 5.3, gCarga: 5.4, gEmpuja: 5.8, gEmpujado: 6.3, gSienta: 6.85, gSentado: 7.3,
    // Paradigma
    fanBaja: 6.68, fanDejado: 7.15, pSorbo: 1.45, pSorbido: 2.75, pParpadeo: 3.25, pCeja: 4.35, pIgualaV: 7.25, pIguala: 7.5, pIgualado: 7.95,
    // la vuelta
    gVuelve: 8.0, gGolpe: 8.32, gPresenta: 8.45,
    ases: [9.0, 9.47, 9.94, 10.41], AS_DUR: 0.47,
    // el bote
    pRastrillo: 10.95, pArrastra: 11.2, pArrastrado: 11.95, pVuelve: 12.25,
    // Guillermo se derrumba
    gTieso: 10.95, gCae: 11.45, gPum: 11.82,
    // final
    fichaSalta: 11.84, pMira: 12.3, pVaso: 12.55, pCamara: 13.05, pBrinda: 13.3, fin: 13.95
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
  const ABIERTA = D(1, 1), MESA_D = D(0.6, 0.7, 0.66, 0.62, 0.58), PINZA = D(0.38, 0.3, 0.16, 0.14, 0.14),
    AGARRA = D(0.3, 0.14, 0.12, 0.12, 0.12), CARTAS = D(0.35, 0.22, 0.12, 0.1, 0.1), EMPUJA = D(0.9, 0.95, 0.95, 0.92, 0.9),
    PALMA = D(0.85, 0.95, 0.95, 0.92, 0.88), VASO = D(0.4, 0.2, 0.18, 0.16, 0.16), PUNO = D(0, 0, 0, 0, 0), RAIL = D(0.5, 0.6, 0.55, 0.5, 0.45);

  /* ---------- caras (mismos campos para los dos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, wi: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista, d = 0.15) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* =====================================================================================
   * DISPOSICIÓN (px de pantalla, antes de la cámara)
   * ===================================================================================== */
  const S = 0.33, SUELO = 574;
  const XG = 330, XP = 694;                       // pelvis de cada uno
  const ASIENTO = 128, Y_ASIENTO = SUELO - ASIENTO, Y_PELVIS = Y_ASIENTO - 20;
  const MESA = { x: 512, y: 368, rx: 164, ry: 38, frx: 148, fry: 29, fy: 366, canto: 15 };
  const enTapete = (x, y) => { const dx = (x - MESA.x) / MESA.frx, dy = (y - MESA.fy) / MESA.fry; return dx * dx + dy * dy < 1; };

  /* =====================================================================================
   * NAIPES (sprites con solo pipos) y FICHAS
   * ===================================================================================== */
  const CW = 25, CH = 35, SPW = 60, SPH = 84;
  const ROJO = "#c8202f", NEGRO = "#16131a";
  // pipos: 0 corazón · 1 diamante · 2 pica · 3 trébol
  function pipo(g, palo, x, y, r, col) {
    g.save(); g.translate(x, y); g.scale(r, r); g.beginPath();
    if (palo === 0) {
      g.moveTo(0, 0.95); g.bezierCurveTo(-0.55, 0.45, -1.05, 0.05, -1.0, -0.38); g.bezierCurveTo(-0.95, -0.95, -0.2, -1.05, 0, -0.5);
      g.bezierCurveTo(0.2, -1.05, 0.95, -0.95, 1.0, -0.38); g.bezierCurveTo(1.05, 0.05, 0.55, 0.45, 0, 0.95);
    } else if (palo === 1) {
      g.moveTo(0, -1); g.quadraticCurveTo(0.3, -0.42, 0.74, 0); g.quadraticCurveTo(0.3, 0.42, 0, 1); g.quadraticCurveTo(-0.3, 0.42, -0.74, 0); g.quadraticCurveTo(-0.3, -0.42, 0, -1);
    } else if (palo === 2) {
      g.moveTo(0, -1); g.bezierCurveTo(-0.55, -0.48, -1.05, -0.12, -1.0, 0.28); g.bezierCurveTo(-0.95, 0.74, -0.28, 0.78, -0.08, 0.4);
      g.quadraticCurveTo(-0.12, 0.82, -0.42, 1.0); g.lineTo(0.42, 1.0); g.quadraticCurveTo(0.12, 0.82, 0.08, 0.4);
      g.bezierCurveTo(0.28, 0.78, 0.95, 0.74, 1.0, 0.28); g.bezierCurveTo(1.05, -0.12, 0.55, -0.48, 0, -1);
    } else {
      g.arc(0, -0.48, 0.42, 0, Math.PI * 2); g.moveTo(-0.04, 0.14); g.arc(-0.46, 0.14, 0.42, 0, Math.PI * 2); g.moveTo(0.88, 0.14); g.arc(0.46, 0.14, 0.42, 0, Math.PI * 2);
      g.moveTo(-0.1, 0.1); g.quadraticCurveTo(-0.1, 0.76, -0.42, 1.0); g.lineTo(0.42, 1.0); g.quadraticCurveTo(0.1, 0.76, 0.1, 0.1); g.closePath();
    }
    g.fillStyle = col || (palo < 2 ? ROJO : NEGRO); g.fill(); g.restore();
  }
  function redondeado(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r);
    g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r);
    g.quadraticCurveTo(x, y, x + r, y); g.closePath();
  }
  // tipos: 0..3 = as de cada palo · 4 = dos de tréboles · 5 = tres de diamantes · 6 = dorso
  const AS = [2, 0, 1, 3], DOS = 4, TRES = 5, DORSO = 6;
  let NAIPES = null;
  function creaNaipe(tipo) {
    const c = document.createElement("canvas"); c.width = SPW; c.height = SPH; const g = c.getContext("2d");
    redondeado(g, 0.5, 0.5, SPW - 1, SPH - 1, 5); g.fillStyle = "#fbf7ee"; g.fill();
    if (tipo === DORSO) {
      redondeado(g, 5, 5, SPW - 10, SPH - 10, 3); g.fillStyle = "#1f3f86"; g.fill();
      g.save(); g.clip(); g.strokeStyle = "rgba(170,200,255,0.5)"; g.lineWidth = 1.6;
      for (let k = -SPH; k < SPW + SPH; k += 8) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k - SPH, SPH); g.stroke(); g.beginPath(); g.moveTo(k - SPH, 0); g.lineTo(k, SPH); g.stroke(); }
      g.restore();
      g.fillStyle = "#fbf7ee"; g.beginPath(); g.ellipse(SPW / 2, SPH / 2, 11, 15, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "#0f2557"; g.lineWidth = 1.6; g.stroke();
      pipo(g, 2, SPW / 2, SPH / 2, 8, "#1f3f86");
      redondeado(g, 5, 5, SPW - 10, SPH - 10, 3); g.strokeStyle = "rgba(10,25,70,0.8)"; g.lineWidth = 1.6; g.stroke();
      return c;
    }
    redondeado(g, 4, 4, SPW - 8, SPH - 8, 3); g.strokeStyle = "rgba(90,60,60,0.25)"; g.lineWidth = 1.4; g.stroke();
    const palo = tipo < 4 ? AS[tipo] : tipo === DOS ? 3 : 1;
    // esquinas: solo un pipo pequeño
    pipo(g, palo, 11, 13, 5.2);
    g.save(); g.translate(SPW - 11, SPH - 13); g.rotate(Math.PI); pipo(g, palo, 0, 0, 5.2); g.restore();
    if (tipo < 4) {
      // as: un pipo enorme en el centro con un filete
      pipo(g, palo, SPW / 2, SPH / 2, palo === 1 ? 19 : 17);
      g.strokeStyle = "rgba(255,255,255,0.65)"; g.lineWidth = 1.5; g.beginPath(); g.ellipse(SPW / 2 - 6, SPH / 2 - 6, 4, 2.5, -0.6, 0, Math.PI * 2); g.stroke();
    } else if (tipo === DOS) {
      pipo(g, palo, SPW / 2, 27, 8.5); g.save(); g.translate(SPW / 2, 57); g.rotate(Math.PI); pipo(g, palo, 0, 0, 8.5); g.restore();
    } else {
      pipo(g, palo, SPW / 2, 22, 8); pipo(g, palo, SPW / 2, SPH / 2, 8); g.save(); g.translate(SPW / 2, 62); g.rotate(Math.PI); pipo(g, palo, 0, 0, 8); g.restore();
    }
    return c;
  }
  // naipe: centro (x, y), giro, escala horizontal (0 = de canto) y vertical (tumbado en la mesa < 1)
  function naipe(g, c) {
    if (!NAIPES) NAIPES = [0, 1, 2, 3, 4, 5, 6].map(creaNaipe);
    if (Math.abs(c.sx) < 0.02) return;
    g.save(); g.translate(c.x, c.y); g.rotate(c.rot || 0); g.scale(c.sx, c.sy);
    // sombrita en el tapete si está tumbado
    if (c.sombra) { g.fillStyle = "rgba(0,20,10,0.28)"; redondeado(g, -CW / 2 + 1.5, -CH / 2 + 2.5, CW, CH, 2.5); g.fill(); }
    g.drawImage(NAIPES[c.tipo], -CW / 2, -CH / 2, CW, CH);
    redondeado(g, -CW / 2, -CH / 2, CW, CH, 2.5); g.lineWidth = 1.1 / Math.max(0.3, Math.min(Math.abs(c.sx), c.sy)); g.strokeStyle = TINTA; g.stroke();
    if (c.brillo > 0.01) {
      g.save(); redondeado(g, -CW / 2, -CH / 2, CW, CH, 2.5); g.clip();
      const u = c.brillo, x = lerp(-CW, CW, u);
      g.globalAlpha = Math.sin(Math.PI * u) * 0.9; g.fillStyle = "#ffffff";
      g.beginPath(); g.moveTo(x - 4, -CH); g.lineTo(x + 4, -CH); g.lineTo(x + 4 - CH * 0.6, CH); g.lineTo(x - 4 - CH * 0.6, CH); g.closePath(); g.fill();
      g.restore();
    }
    g.restore();
  }
  // un naipe que cambia de «de canto en la mano» (dorso) a «tumbado boca arriba» (cara): f 0 → 1
  function volteo(f, tipo) {
    const sx = f < 0.5 ? 0.5 * (1 - 2 * f) : (2 * f - 1), sy = lerp(1, 0.62, suave(f));
    return { sx, sy, tipo: f < 0.5 ? DORSO : tipo };
  }

  // fichas: sprite de una ficha (canto + cara) a 3×
  const FR = 7.5, FRY = 3.1, FH = 2.7, FK = 3;
  const COLF = { r: ["#c62a33", "#7d0f18"], a: ["#2a5fc4", "#163578"], n: ["#26232b", "#0c0b0f"], v: ["#2f9b5a", "#17583a"], b: ["#efe9dc", "#a8a091"] };
  let FICHAS = null;
  function creaFicha(col) {
    const [cl, co] = COLF[col], w = (FR * 2 + 2) * FK, h = (FRY * 2 + FH + 2) * FK;
    const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d");
    g.scale(FK, FK); g.translate(FR + 1, FRY + 1);
    // canto
    g.fillStyle = co; g.beginPath(); g.ellipse(0, FH, FR, FRY, 0, 0, Math.PI); g.lineTo(-FR, 0); g.ellipse(0, 0, FR, FRY, 0, Math.PI, 0, true); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,0.85)";
    for (const a of [0.35, 1.2, 2.05, 2.8]) { const x = -Math.cos(a) * FR; g.fillRect(x - 0.9, Math.sin(a) * FRY + 0.2, 1.8, FH - 0.3); }
    g.strokeStyle = TINTA; g.lineWidth = 0.55; g.beginPath(); g.ellipse(0, FH, FR, FRY, 0, 0, Math.PI); g.moveTo(-FR, 0); g.lineTo(-FR, FH); g.moveTo(FR, 0); g.lineTo(FR, FH); g.stroke();
    // cara
    g.fillStyle = cl; g.beginPath(); g.ellipse(0, 0, FR, FRY, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 1.1; g.setLineDash([1.6, 1.9]); g.beginPath(); g.ellipse(0, 0, FR - 1.2, FRY - 0.55, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    g.fillStyle = "rgba(255,255,255,0.3)"; g.beginPath(); g.ellipse(-1.5, -0.6, FR * 0.4, FRY * 0.35, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 0.55; g.beginPath(); g.ellipse(0, 0, FR, FRY, 0, 0, Math.PI * 2); g.stroke();
    return c;
  }
  // ficha suelta: centro de la cara de abajo en (x, y); n fichas apiladas; inclinación (giro) opcional
  function pila(g, x, y, col, n, rot = 0) {
    if (!FICHAS) { FICHAS = {}; for (const k in COLF) FICHAS[k] = creaFicha(k); }
    const s = FICHAS[col], w = s.width / FK, h = s.height / FK;
    g.save(); g.translate(x, y); if (rot) g.rotate(rot);
    for (let i = 0; i < n; i++) g.drawImage(s, -FR - 1, -FRY - 1 - i * FH - FH, w, h);
    g.restore();
  }
  // sombra de una pila en el tapete
  function sombraPila(g, x, y) { g.fillStyle = "rgba(0,25,12,0.3)"; g.beginPath(); g.ellipse(x + 2, y + 1.5, FR + 1.5, FRY + 1, 0, 0, Math.PI * 2); g.fill(); }

  /* ---------- fichas: dónde está cada pila en cada instante ---------- */
  // pilas de Guillermo (las que empuja) · las de Paradigma · las ciegas del bote
  const VALOR_FICHA = { b: 1, r: 5, a: 10, v: 25, n: 100 };
  const PILAS_G = [
    { x: 398, y: 358, c: "b", n: 10, a: { x: 470, y: 352 } },
    { x: 414, y: 364, c: "a", n: 9, a: { x: 489, y: 358 } },
    { x: 430, y: 358, c: "n", n: 7, a: { x: 506, y: 351 } },
    { x: 408, y: 372, c: "v", n: 8, a: { x: 461, y: 368 } }
  ];
  const PILAS_P = [
    { x: 600, y: 356, c: "n", n: 10 }, { x: 616, y: 361, c: "r", n: 8 }, { x: 630, y: 355, c: "a", n: 11 }, { x: 608, y: 369, c: "b", n: 6 }
  ];
  const CIEGAS = [{ x: 512, y: 357, c: "b", n: 3 }, { x: 526, y: 362, c: "r", n: 2 }];
  // pila de Paradigma reservada para igualar la apuesta
  const IGUALA = { de: { x: 622, y: 372 }, a: { x: 534, y: 368 }, c: "n", n: 10 };
  // fichas que se caen de lo alto de dos pilas al frenar (rodando por el tapete)
  const CAIDAS = [
    { p: 0, k: 9, to: { x: 456, y: 371 }, gira: -2.2 },          // la rezagada (no la alcanza el rastrillo)
    { p: 1, k: 8, to: { x: 500, y: 372 }, gira: 1.6 },
    { p: 1, k: 7, to: { x: 515, y: 375 }, gira: 2.4 },
    { p: 2, k: 6, to: { x: 524, y: 352 }, gira: 1.2 },
    { p: 1, k: 6, to: { x: 492, y: 378 }, gira: -1.4 }
  ];
  const tEmpuje = t => salida(fase(t, T.gEmpuja + 0.05, T.gEmpujado));
  // altura (en fichas) que conserva cada pila de Guillermo tras el desmorone
  const instanteCaida = j => T.gEmpujado - 0.03 + j * 0.035;
  const alturaPilaG = (i, t) => PILAS_G[i].n - CAIDAS.filter((c, j) => c.p === i && t >= instanteCaida(j)).length;
  function fichasCaidas(t) {
    const out = [];
    CAIDAS.forEach((c, j) => {
      const pila = PILAS_G[c.p], inicio = instanteCaida(j), u = t - inicio;
      if (u < 0) return;
      const d = 0.42, k = Math.min(1, u / d);
      const punto = mezcla(pila, pila.a, tEmpuje(inicio));
      const x0 = punto.x, y0 = punto.y - c.k * FH;
      // vuela en arco y luego rueda un poco (rebotito)
      const x = lerp(x0, c.to.x, salida(k)), y = lerp(y0, c.to.y, k) - 14 * Math.sin(Math.PI * Math.min(1, k * 1.15)) * (1 - k * 0.3) - 3 * campana(u, d, d + 0.18);
      const rot = Math.sin(Math.PI * k) * (c.gira * 0.6 + Math.sin(u * 30) * 0.25 * (1 - k));
      out.push({ x, y, c: PILAS_G[c.p].c, rot, cae: k, j });
    });
    return out;
  }

  /* ---------- el bote y el rastrillo de Paradigma ---------- */
  // mano del rastrillo (x de pantalla) en el tiempo
  const XR0 = 466, XR1 = 576;
  const xRastrillo = t => lerp(XR0, XR1, suave(fase(t, T.pArrastra, T.pArrastrado)));
  function boteFinal(lista) {
    // al acabar: un montón desordenado delante de Paradigma
    return lista.map((o, i) => ({ x: 584 + 8 * hash(i * 3 + 1) + (i % 3) * 7, y: 352 + (i % 4) * 4 + 3 * hash(i + 7) }));
  }

  /* =====================================================================================
   * PISTAS DE MANOS (pantalla): [t0, t1, objetivo] con objetivo {x, y, mu, d} o función (t) → {…}
   * mu = hacia el codo, en ángulo de pantalla
   * ===================================================================================== */
  const evalua = (o, t) => (typeof o === "function" ? o(t) : o);
  const mezclaM = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), mu: lerpAng(a.mu, b.mu, k), d: mezclaD(a.d, b.d, k) });
  function pista(lista, t) {
    let c = evalua(lista[0][2], t);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i]; if (t <= t0) break;
      c = mezclaM(c, evalua(obj, t), (f || suave)(fase(t, t0, t1)));
    }
    return c;
  }
  const enPant = (rig, p, q) => rig.aPantalla(p, q);
  const bocaPant = (rig, p) => rig.aPantalla(p, rig.boca(p));
  function manoRig(rig, p, m, dobla, objeto) {
    const h = rig.aHoja(p, m);
    return { x: h.x, y: h.y, ang: 0, mu: p.espejo ? Math.PI - m.mu : m.mu, puno: 1, dedos: m.d, dobla, objeto };
  }
  // punto de pinza de una mano (entre pulgar e índice), en pantalla: hacia el lado contrario al codo
  const pinza = (m, r = 13) => ({ x: m.x - Math.cos(m.mu) * r, y: m.y - Math.sin(m.mu) * r });

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha)
   * ===================================================================================== */
  const PEL_G = G.SUELO + (Y_PELVIS - SUELO) / S - G.PELVIS.y;
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const CARAS_G = {
    inicio: E({ mx: 0.9, my: 0.15, c: 0.2, sd: 6, gd: 0.03, si: 8, gi: 0.04, sonr: 0.3 }),
    mira: E({ mx: 0.35, my: 0.35, c: 0.25, sd: 4, gd: 0, si: 6, gi: 0.02, sonr: 0.1, ancho: 0.9 }),
    wow: E({ mx: 0.35, my: 0.3, iris: 1.12, c: 0, sd: 28, gd: 0.16, si: 28, gi: 0.16, abre: 22, ancho: 0.62, sonr: 0.25 }),
    disimula: E({ mx: 0.9, my: 0.1, c: 0.35, sd: 2, gd: -0.04, si: 10, gi: 0.04, abre: 0, ancho: 0.48, sonr: 0.05, mof: 0.55, dientes: 0 }),
    camara: E({ mx: -0.85, my: 0, c: 0.3, sd: 18, gd: 0.08, si: 18, gi: 0.08, abre: 6, ancho: 1.08, sonr: 0.95 }),
    baile: E({ mx: -0.6, my: 0.05, c: 1, h: 1, sd: 16, gd: 0.06, si: 16, gi: 0.06, abre: 10, ancho: 1.05, sonr: 0.9 }),
    decidido: E({ mx: 0.85, my: 0.25, c: 0.4, sd: -6, gd: -0.14, si: -2, gi: -0.1, abre: 0, ancho: 0.9, sonr: 0.6 }),
    empuja: E({ mx: 0.85, my: 0.4, c: 0.55, z: 0.3, sd: -4, gd: -0.12, si: -4, gi: -0.12, abre: 18, ancho: 1.0, sonr: 0.55 }),
    chulo: E({ mx: 0.9, my: -0.1, c: 0.45, sd: 16, gd: 0.07, si: 4, gi: -0.02, sonr: 0.75, ancho: 1.05 }),
    tachan: E({ mx: -0.85, my: 0, c: 0.6, h: 0.75, sd: 22, gd: 0.1, si: 22, gi: 0.1, abre: 16, ancho: 1.1, sonr: 0.95 }),
    as1: E({ mx: 0.85, my: 0.4, c: 0.15, sd: 18, gd: 0.08, si: 18, gi: 0.08, abre: 8, ancho: 1.05, sonr: 0.8 }),
    as2: E({ mx: 0.85, my: 0.45, iris: 0.92, c: 0, sd: 22, gd: 0.14, si: 22, gi: 0.14, abre: 4, ancho: 1.0, sonr: 0.55 }),
    as3: E({ mx: 0.85, my: 0.45, iris: 0.82, c: 0, sd: 26, gd: 0.2, si: 22, gi: 0.12, abre: 2, ancho: 0.9, sonr: 0.2 }),
    as4: E({ mx: 0.8, my: 0.45, iris: 0.7, c: 0, sd: 30, gd: 0.24, si: 30, gi: 0.24, abre: 34, ancho: 0.6, sonr: -0.35 }),
    tieso: E({ mx: 0.1, my: 0.1, iris: 0.55, c: 0, sd: 12, gd: 0.18, si: 12, gi: 0.18, abre: 30, ancho: 0.55, sonr: -0.45 }),
    caido: E({ mx: 0, my: 0, c: 1, z: 0.6, sd: 8, gd: 0.2, si: 8, gi: 0.2, abre: 10, ancho: 0.7, sonr: -0.5 })
  };
  const GUION_CARA_G = [
    [T.gSube - 0.1, T.gMira, "mira"], [T.gWow - 0.02, T.gWow + 0.1, "wow", salida], [T.gDisimula, T.gDisimula + 0.2, "disimula"],
    [T.gCamara, T.gCamara + 0.22, "camara"], [T.gBaile, T.gBaile + 0.15, "baile"], [T.gBaileFin - 0.05, T.gBaileFin + 0.2, "decidido"],
    [T.gEmpuja - 0.1, T.gEmpuja + 0.1, "empuja"], [T.gEmpujado + 0.1, T.gEmpujado + 0.35, "chulo"],
    [T.gGolpe, T.gGolpe + 0.15, "tachan"], [T.ases[0] + 0.34, T.ases[0] + 0.5, "as1"], [T.ases[1] + 0.34, T.ases[1] + 0.5, "as2"],
    [T.ases[2] + 0.34, T.ases[2] + 0.5, "as3"], [T.ases[3] + 0.34, T.ases[3] + 0.46, "as4", salida], [T.gTieso + 0.1, T.gTieso + 0.4, "tieso"],
    [T.gPum - 0.08, T.gPum + 0.02, "caido"]
  ];
  const CUERPOS_G = {
    inicio: { torso: 0.06, cab: 0.04, dx: 0, dy: 0 }, mira: { torso: 0.1, cab: 0.16, dx: 0, dy: 0 },
    wow: { torso: -0.06, cab: -0.08, dx: 0, dy: -10 }, disimula: { torso: 0.03, cab: 0.02, dx: 0, dy: 0 },
    camara: { torso: 0.02, cab: -0.04, dx: 0, dy: 0 }, deja: { torso: 0.22, cab: 0.1, dx: 0, dy: 0 },
    carga: { torso: 0.10, cab: -0.04, dx: 25, dy: 0 }, empuja: { torso: 0.5, cab: 0.06, dx: 96, dy: -46 },
    sienta: { torso: -0.04, cab: -0.1, dx: 0, dy: 0 }, vuelve: { torso: 0.26, cab: 0.12, dx: 0, dy: 0 },
    presenta: { torso: 0.04, cab: -0.06, dx: 0, dy: -6 }, as: { torso: 0.08, cab: 0.08, dx: 0, dy: 0 },
    tieso: { torso: 0.02, cab: -0.02, dx: 0, dy: 0 }, cae: { torso: 0.86, cab: 1.14, dx: 25, dy: 24 }
  };
  const GUION_CUERPO_G = [
    [T.gCoge - 0.15, T.gSube, "mira"], [T.gWow - 0.03, T.gWow + 0.14, "wow", salida], [T.gDisimula, T.gDisimula + 0.3, "disimula"],
    [T.gCamara, T.gCamara + 0.25, "camara"], [T.gDeja - 0.05, T.gDejado, "deja"], [T.gCarga, T.gEmpuja, "carga"],
    [T.gEmpuja - 0.15, T.gEmpujado, "empuja", salida], [T.gSienta, T.gSentado, "sienta"], [T.gVuelve - 0.05, T.gGolpe, "vuelve"],
    [T.gGolpe + 0.04, T.gPresenta + 0.25, "presenta"], [T.ases[1], T.ases[2] + 0.4, "as"], [T.gTieso, T.gTieso + 0.35, "tieso"],
    [T.gCae, T.gPum, "cae", entrada]
  ];

  const MEJILLA = { x: 965, y: 596 };
  const contactoCara = p => enPant(G, p, G.cabeza(p).a(MEJILLA));
  function poseG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const respira = Math.sin(t * 2.4);
    const p = {
      x: XG, suelo: SUELO, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x + b.dx, y: G.PELVIS.y + PEL_G + b.dy + respira * 1.3 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.005 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // bailecito en la silla: hombros y cabeza al compás
    const baile = dentro(t, T.gBaile, T.gBaile + 0.12, T.gBaileFin - 0.1, T.gBaileFin + 0.05);
    const w = (t - T.gBaile) * Math.PI * 4.2;
    p.torso += 0.05 * Math.sin(w) * baile; p.cabeza.ang += 0.1 * Math.sin(w + 0.9) * baile;
    p.pelvis.y -= 8 * Math.abs(Math.sin(w)) * baile; p.pelvis.x += 6 * Math.sin(w) * baile;
    // cejas que bailan a cámara
    const cejas = dentro(t, T.gCamara + 0.1, T.gCamara + 0.25, T.gBaile - 0.1, T.gBaile + 0.1);
    // tic del ojo y temblor de la mandíbula con los ases
    const tic = (t > T.ases[2] + 0.36 && t < T.ases[3] + 0.3) ? Math.max(0, Math.sin((t - T.ases[2]) * 34)) * campana(t, T.ases[2] + 0.36, T.ases[3] + 0.3) : 0;
    // derrumbe: rebote al darse de cara
    const pum = t - T.gPum;
    if (pum > 0) { const r = Math.exp(-pum * 9) * Math.sin(pum * 30); p.torso -= 0.06 * r; p.cabeza.ang -= 0.08 * r; }
    const cae = tramo(t, T.gCae, T.gPum);
    if (cae > 0) {
      const rebote = pum > 0 ? 3 * Math.exp(-pum * 10) * Math.abs(Math.sin(pum * 22)) : 0;
      p.pelvis.y += (MESA.fy - rebote - contactoCara(p).y) * cae / (S * G.K);
    }
    // piernas: un pie golpetea con el baile
    for (const [lado, dx, dy] of [["cerca", 262, 0], ["lejos", 318, -10]]) {
      let x = G.PELVIS.x + dx, y = TOB_G + dy, ang = 0;
      if (lado === "lejos") { const tap = Math.max(0, Math.sin(w)); y -= 12 * tap * baile; ang -= 0.25 * tap * baile; }
      // al empujar se pone de puntillas
      const pun = dentro(t, T.gEmpuja - 0.05, T.gEmpuja + 0.2, T.gSienta, T.gSentado);
      x += 18 * pun; ang -= 0.35 * pun; y -= 10 * pun;
      p.piernas[lado] = { tob: { x, y }, ang };
    }
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    ex.sd += 9 * Math.sin((t - T.gCamara) * 11) * cejas; ex.si -= 9 * Math.sin((t - T.gCamara) * 11) * cejas;
    ex.wd += 0.55 * tic;
    // labios apretados que tiemblan al disimular (se le escapa la risa)
    const dis = dentro(t, T.gDisimula + 0.1, T.gDisimula + 0.25, T.gCamara - 0.1, T.gCamara + 0.05);
    ex.sonr += 0.12 * Math.sin(t * 23) * dis; ex.mof += 0.12 * Math.sin(t * 17) * dis;
    // mandíbula que tiembla con el cuarto as
    ex.abre += 4 * Math.sin(t * 29) * dentro(t, T.ases[3] + 0.4, T.ases[3] + 0.5, T.gTieso + 0.2, T.gTieso + 0.4);
    p.cara = cara(ex, parpadeo(t, [0.55, 3.0, 6.95, 9.3, 10.9]));
    p.sudor = 0.7 * dentro(t, T.gDisimula + 0.2, T.gDisimula + 0.4, T.gCamara + 0.2, T.gCamara + 0.5) + 0.9 * dentro(t, T.ases[2] + 0.3, T.ases[2] + 0.5, T.gPum, T.gPum + 0.2);
    p.rojo = 0.35 * dentro(t, T.gWow + 0.05, T.gWow + 0.2, T.gCamara, T.gCamara + 0.3) + 0.25 * dentro(t, T.gEmpuja, T.gEmpuja + 0.1, T.gEmpujado, T.gEmpujado + 0.3);
    manosG(p, t);
    p.capaCabeza = (g, tt) => capaCabezaG(g, tt, p);
    return p;
  }

  // las dos cartas de Guillermo: tumbadas boca abajo · en la mano · tumbadas otra vez · boca arriba
  const MUSLO_G = { x: 310, y: 404, mu: -1.95, d: D(0.7, 0.82, 0.78, 0.74, 0.7) };
  const CG_MESA = [{ x: 410, y: 374, rot: -0.12 }, { x: 426, y: 377, rot: 0.1 }];
  const CG_DEJA = [{ x: 442, y: 377, rot: -0.14 }, { x: 458, y: 379, rot: 0.08 }];
  const CG_VISTA = [{ x: 440, y: 378, rot: -0.16, tipo: DOS }, { x: 461, y: 380, rot: 0.12, tipo: TRES }];
  function manosG(p, t) {
    const reposo = { x: 386, y: 370, mu: 2.4, d: MESA_D };
    // en la mano: delante del pecho, un poco abajo; al mirar las sube y las inclina hacia la cara
    const H_CARTAS = { x: 398, y: 336, mu: 2.15, d: CARTAS }, H_MIRA = { x: 404, y: 316, mu: 1.95, d: CARTAS };
    const sacude = t => ({ x: H_MIRA.x + 2 * Math.sin(t * 40) * dentro(t, T.gWow, T.gWow + 0.05, T.gWow + 0.3, T.gWow + 0.4), y: H_MIRA.y + 6 * Math.sin((t - T.gBaile) * Math.PI * 4.2) * dentro(t, T.gBaile, T.gBaile + 0.12, T.gBaileFin - 0.1, T.gBaileFin), mu: H_MIRA.mu, d: CARTAS });
    // empuje: la palma detrás de las pilas, dedos arriba
    const tras = (i, dx = -13, dy = -6) => t2 => { const k = tEmpuje(t2), P0 = PILAS_G[i]; return { x: lerp(P0.x, P0.a.x, k) + dx, y: lerp(P0.y, P0.a.y, k) + dy, mu: 2.45, d: EMPUJA }; };
    const PL = [
      [0, 0, reposo],
      // coge sus dos cartas
      [T.gCoge - 0.35, T.gCoge, { x: CG_MESA[0].x + 6, y: CG_MESA[0].y - 4, mu: 2.4, d: PINZA }],
      [T.gCoge + 0.02, T.gSube, H_CARTAS],
      [T.gSube + 0.05, T.gMira, sacude],
      // las deja boca abajo
      [T.gDeja, T.gDejado, { x: CG_DEJA[0].x + 6, y: CG_DEJA[0].y - 4, mu: 2.4, d: PINZA }],
      [T.gDejado + 0.02, T.gCarga, { x: 384, y: 352, mu: 2.6, d: EMPUJA }],
      // ¡todo!: detrás de la pila de atrás, empuja
      [T.gCarga + 0.15, T.gEmpuja + 0.02, tras(2, -14, -8)],
      [T.gEmpujado + 0.15, T.gSienta, t2 => ({ x: PILAS_G[2].a.x - 16, y: PILAS_G[2].a.y - 6, mu: 2.45, d: PALMA })],
      // se sienta: manos al borde
      [T.gSienta, T.gSentado, { x: 392, y: 368, mu: 2.4, d: MESA_D }],
      // coge las cartas y les da la vuelta de un manotazo
      [T.gVuelve, T.gVuelve + 0.16, { x: CG_DEJA[1].x + 4, y: CG_DEJA[1].y - 6, mu: 2.4, d: PINZA }],
      [T.gVuelve + 0.18, T.gGolpe - 0.06, { x: 432, y: 352, mu: 2.3, d: CARTAS }],
      [T.gGolpe - 0.06, T.gGolpe, { x: CG_VISTA[0].x + 10, y: CG_VISTA[0].y - 6, mu: 2.4, d: ABIERTA }, entrada],
      // las presenta con la palma
      [T.gPresenta, T.gPresenta + 0.25, { x: 434, y: 344, mu: 2.55, d: D(1, 1, 1, 1, 1) }],
      // la palma se va cayendo con cada as
      [T.ases[1] + 0.3, T.ases[2] + 0.4, { x: 424, y: 356, mu: 2.4, d: D(0.8, 0.85, 0.8, 0.75, 0.7) }],
      [T.ases[3] + 0.3, T.ases[3] + 0.5, { x: 410, y: 368, mu: 2.4, d: MESA_D }],
      // se derrumba: la mano se queda tirada en el tapete
      [T.gCae, T.gPum, { x: 452, y: 384, mu: 2.7, d: D(0.6, 0.75, 0.7, 0.65, 0.6) }, entrada]
    ];
    const l = pista(PL, t);
    // ¿lleva las cartas?
    let objeto = null;
    if ((t >= T.gCoge && t < T.gDejado) || (t >= T.gVuelve + 0.14 && t < T.gGolpe)) {
      const pz = pinza(l, 12);
      const enMano = t < T.gDejado;
      const inclina = enMano ? lerp(-0.25, -0.55, tramo(t, T.gSube, T.gMira)) : -0.35;
      objeto = { cartas: [0, 1].map(i => {
        const c0 = enMano ? CG_MESA[i] : CG_DEJA[i];
        // de tumbadas a la mano (y al revés al dejarlas)
        let k;
        if (enMano) k = tramo(t, T.gCoge, T.gSube) * (1 - tramo(t, T.gDeja + 0.05, T.gDejado));
        else k = tramo(t, T.gVuelve + 0.14, T.gVuelve + 0.3);
        const enM = { x: pz.x + (i - 0.5) * 7, y: pz.y - 12 + (i - 0.5) * 2, rot: inclina + (i - 0.5) * 0.28, sx: 0.42, sy: 1, tipo: DORSO };
        if (!enMano) {
          const f = tramo(t, T.gGolpe - 0.10, T.gGolpe), destino = CG_VISTA[i];
          const centro = mezcla(c0, enM, k), entregada = mezcla(centro, destino, f);
          const cara = Math.cos(Math.PI * f);
          return { ...entregada, rot: lerpAng(lerpAng(c0.rot, enM.rot, k), destino.rot, f), sx: Math.max(0.025, Math.abs(cara) * lerp(lerp(1, enM.sx, k), 1, f)), sy: lerp(lerp(0.62, 1, k), 0.62, f), tipo: cara > 0 ? DORSO : destino.tipo, sombra: f > 0.8 };
        }
        const ref = t > T.gDeja ? CG_DEJA[i] : c0;
        return { x: lerp(ref.x, enM.x, k), y: lerp(ref.y, enM.y, k), rot: lerpAng(ref.rot, enM.rot, k), sx: lerp(1, enM.sx, k), sy: lerp(0.62, 1, k), tipo: DORSO, sombra: k < 0.2 };
      }) };
    }
    p.cartasMano = objeto;
    p.manoLejos = manoRig(G, p, l, -1, objeto ? (g => conCamara(g, () => objeto.cartas.forEach(c => naipe(g, c)))) : null);
    // mano cercana: en el borde de la mesa; tamborilea con el baile; empuja la pila de delante
    const tambor = dentro(t, T.gBaile, T.gBaile + 0.12, T.gBaileFin - 0.1, T.gBaileFin);
    const fd = i => 0.45 + 0.4 * Math.max(0, Math.sin((t - T.gBaile) * 26 - i * 1.1)) * tambor;
    const PC = [
      [0, 0, MUSLO_G],
      [T.gWow, T.gWow + 0.12, { x: 318, y: 384, mu: -2.0, d: ABIERTA }, salida],
      [T.gDisimula, T.gDisimula + 0.3, MUSLO_G],
      [T.gBaile - 0.18, T.gBaile + 0.03, { x: 355, y: 378, mu: 2.60, d: MESA_D }],
      [T.gBaileFin, T.gDejado, MUSLO_G],
      [T.gCarga, T.gEmpuja + 0.04, t2 => { const m = tras(3, -13, -5)(t2); m.mu = 2.75; return m; }],
      [T.gEmpujado + 0.15, T.gSienta, t2 => ({ x: PILAS_G[3].a.x - 15, y: PILAS_G[3].a.y - 4, mu: 2.75, d: PALMA })],
      [T.gSienta, T.gSentado, MUSLO_G],
      [T.gCae, T.gPum, { x: 392, y: 382, mu: -2.2, d: D(0.6, 0.7, 0.65, 0.6, 0.55) }, entrada]
    ];
    let c = pista(PC, t);
    if (tambor > 0.01) c = Object.assign({}, c, { d: { pulgar: 0.5, indice: fd(0), medio: fd(1), anular: fd(2), menique: fd(3) }, y: c.y - 2 * tambor });
    p.manoCerca = manoRig(G, p, c, -1, null);
  }

  /* ---------- capa de la cara de Guillermo (retrato): estrellas en los ojos ---------- */
  const OJO_G = [{ x: 771, y: 563, r: 30 }, { x: 894, y: 617, r: 24 }];
  function estrella(g, x, y, r, a) {
    g.save(); g.translate(x, y); g.rotate(a); g.beginPath();
    for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.32 : r, an = i * Math.PI / 4; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
    g.closePath(); g.fillStyle = "#fff6b8"; g.fill(); g.lineWidth = 3; g.strokeStyle = "#e0a400"; g.stroke(); g.restore();
  }
  function capaCabezaG(g, t, p) {
    const k = dentro(t, T.gEstrellas, T.gEstrellas + 0.12, T.gDisimula - 0.1, T.gDisimula + 0.05) + dentro(t, T.gPresenta, T.gPresenta + 0.1, T.ases[0] + 0.3, T.ases[0] + 0.45) * 0.8;
    if (k > 0.01) {
      const pul = 1 + 0.15 * Math.sin(t * 18);
      OJO_G.forEach((o, i) => estrella(g, o.x + (i ? 4 : 8), o.y - 4, o.r * k * pul, t * 3 + i));
    }
    void p;
  }

  /* =====================================================================================
   * PARADIGMA (derecha, mira a la izquierda)
   * ===================================================================================== */
  const PEL_P = P.SUELO + (Y_PELVIS - SUELO) / (S * P.K) - P.PELVIS.y;
  const TOB_P = P.SUELO - P.TOBILLO_ALTO;
  const CARAS_P = {
    poker: E({ mx: 0.85, my: 0.12, c: 0.5, sd: 2, gd: 0.02, si: 2, gi: 0.02, abre: 0, ancho: 0.82, sonr: 0.02 }),
    sorbo: E({ mx: 0.85, my: 0.3, c: 0.6, sd: 2, gd: 0.02, si: 2, gi: 0.02, abre: 3, ancho: 0.6, sonr: 0.0 }),
    ceja: E({ mx: 0.85, my: 0.1, c: 0.45, sd: 3, gd: 0.02, si: 10, gi: 0.06, abre: 0, ancho: 0.8, sonr: 0.05 }),
    mesa: E({ mx: 0.6, my: 0.55, c: 0.55, sd: 2, gd: 0.02, si: 2, gi: 0.02, abre: 0, ancho: 0.82, sonr: 0.02 }),
    mira: E({ mx: 0.85, my: 0.3, c: 0.5, sd: 4, gd: 0.03, si: 4, gi: 0.03, abre: 0, ancho: 0.8, sonr: 0.06 }),
    camara: E({ mx: -0.85, my: 0, c: 0.48, h: 0.2, sd: 6, gd: 0.03, si: 9, gi: 0.05, abre: 0, ancho: 0.86, sonr: 0.3 })
  };
  const GUION_CARA_P = [
    [T.pSorbo + 0.3, T.pSorbo + 0.5, "sorbo"], [T.pSorbido - 0.2, T.pSorbido, "poker"], [T.pCeja, T.pCeja + 0.2, "ceja"], [T.pCeja + 0.6, T.pCeja + 0.9, "poker"],
    [T.pIgualaV, T.pIgualaV + 0.2, "mesa"], [T.pIgualado + 0.05, T.pIgualado + 0.3, "poker"], [T.ases[0] - 0.1, T.ases[0] + 0.1, "mesa"],
    [T.pVuelve, T.pVuelve + 0.2, "poker"], [T.pMira, T.pMira + 0.2, "mira"], [T.pCamara, T.pCamara + 0.25, "camara"]
  ];
  const CUERPOS_P = {
    inicio: { torso: 0.04, cab: 0.02, dx: 0, dy: 0 }, sorbo: { torso: 0.08, cab: -0.12, dx: 0, dy: 0 }, mesa: { torso: 0.16, cab: 0.06, dx: 0, dy: 0 },
    iguala: { torso: 0.24, cab: 0.08, dx: 0, dy: 0 }, as: { torso: 0.3, cab: 0.1, dx: 0, dy: 0 }, rastrillo: { torso: 0.5, cab: 0.06, dx: 100, dy: -40 },
    arrastra: { torso: 0.16, cab: 0.04, dx: 0, dy: 0 }, mira: { torso: 0.04, cab: 0.06, dx: 0, dy: 0 }, brinda: { torso: 0.02, cab: -0.04, dx: 0, dy: 0 }
  };
  const GUION_CUERPO_P = [
    [T.pSorbo, T.pSorbo + 0.45, "sorbo"], [T.pSorbido - 0.25, T.pSorbido, "inicio"], [T.fanBaja - 0.05, T.fanDejado, "mesa"], [T.pIgualaV, T.pIguala, "iguala"], [T.pIgualado, T.pIgualado + 0.3, "inicio"],
    [T.ases[0] - 0.25, T.ases[0] + 0.1, "as"], [T.pRastrillo - 0.2, T.pArrastra, "rastrillo"], [T.pArrastra, T.pArrastrado, "arrastra"],
    [T.pVuelve, T.pVuelve + 0.4, "mira"], [T.pBrinda - 0.1, T.pBrinda + 0.2, "brinda"]
  ];
  function poseP(t) {
    const b = guion(GUION_CUERPO_P, CUERPOS_P, "inicio", t);
    const respira = Math.sin(t * 1.9 + 0.7);
    const p = {
      x: XP, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: P.PELVIS.x + b.dx, y: P.PELVIS.y + PEL_P + b.dy + respira * 1.0 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    for (const [lado, dx, dy] of [["cerca", 258, 0], ["lejos", 312, -10]]) p.piernas[lado] = { tob: { x: P.PELVIS.x + dx, y: TOB_P + dy }, ang: 0 };
    const ex = guion(GUION_CARA_P, CARAS_P, "poker", t);
    p.cara = cara(ex, parpadeo(t, [T.pParpadeo], 0.75) * 1 + parpadeo(t, [6.1, 8.7, 12.0]));
    manosP(p, t);
    return p;
  }
  // sus cuatro cartas, boca abajo en un montoncito delante de él; cada as sale de ahí
  const SLOT_AS = [{ x: 528, y: 382, rot: -0.1 }, { x: 549, y: 383, rot: 0.06 }, { x: 570, y: 382, rot: -0.04 }, { x: 591, y: 379, rot: 0.1 }];
  const MONTON_P = { x: 614, y: 375, rot: 0.08 };
  const VASO_MESA = { x: 642, y: 381 };
  const cartaMonton = i => { const k = 3 - i; return { x: MONTON_P.x + k * 0.4, y: MONTON_P.y - k * 1.1, rot: MONTON_P.rot + (k - 1.5) * 0.03 }; };
  // La misma carta pasa del abanico al montón y del montón a una de las cuatro posiciones.
  function cartaAs(i, t) {
    const ts = T.ases[i], f = tramo(t, ts + 0.15, ts + 0.37), origen = cartaMonton(i), fin = SLOT_AS[i];
    const c = mezcla(origen, fin, f), curva = Math.sin(Math.PI * f);
    return { x: c.x, y: c.y - 18 * curva, rot: lerpAng(origen.rot, fin.rot, f), sx: Math.max(0.025, Math.abs(Math.cos(Math.PI * f))), sy: 0.62 + 0.38 * curva, tipo: f < 0.5 ? DORSO : i };
  }
  const manoAs = (i, t) => { const c = cartaAs(i,t), a = c.rot, u = 9 * c.sx, v = -3 * c.sy, mu = -0.48;
    return { x: c.x + u * Math.cos(a) - v * Math.sin(a) + 11 * Math.cos(mu), y: c.y + u * Math.sin(a) + v * Math.cos(a) + 11 * Math.sin(mu), mu, d: PINZA }; };
  // pinza de la mano al coger un naipe por su canto derecho
  const FAN_INI = { x: 661, y: 328, mu: 0.98, d: CARTAS }, FAN_FIN = { x: 634, y: 370, mu: -0.50, d: CARTAS };
  function abanicoP(t, m) {
    const k = tramo(t, T.fanBaja, T.fanDejado), agarre = pinza(m, 11);
    return [3,2,1,0].map(i => {
      const a = (i - 1.5) * 0.39, origen = { x: agarre.x + 14 * Math.sin(a), y: agarre.y - 14 * Math.cos(a) }, fin = cartaMonton(i);
      return { ...mezcla(origen,fin,k), rot: lerpAng(a,fin.rot,k), sx: lerp(0.81,1,k), sy: lerp(1,0.62,k), tipo: DORSO, sombra: k > 0.92 };
    });
  }
  function manosP(p, t) {
    const boca = bocaPant(P, p);
    // la mano agarra el vaso: centro del vaso = mano − 6 hacia el lado contrario al codo − 2 arriba
    // (el vaso asoma por encima del puño: la mano lo coge por abajo)
    const vasoDeMano = (l, a = 0) => ({ x: l.x - Math.cos(l.mu) * 6 + Math.sin(a) * 9, y: l.y - Math.sin(l.mu) * 6 - 9 * Math.cos(a) });
    const manoDeVaso = (c, mu, a = 0) => ({ x: c.x + Math.cos(mu) * 6 - Math.sin(a) * 9, y: c.y + Math.sin(mu) * 6 + 9 * Math.cos(a), mu, d: VASO });
    const reposo = manoDeVaso({ x: VASO_MESA.x, y: VASO_MESA.y - 13.5 }, -0.7);
    // sorbo: el borde del vaso inclinado toca el labio
    const A_SORBO = 0.85;
    const enBoca = () => { const c = { x: boca.x - Math.sin(A_SORBO) * 13.5, y: boca.y + Math.cos(A_SORBO) * 13.5 }; return manoDeVaso(c, 1.15, A_SORBO); };
    const PL = [
      [0, 0, reposo],
      [T.pSorbo, T.pSorbo + 0.4, enBoca],
      [T.pSorbido - 0.35, T.pSorbido, reposo],
      // iguala: empuja una pila con el dorso de los dedos
      [T.pIgualaV, T.pIguala, { x: IGUALA.de.x + 10, y: IGUALA.de.y - 6, mu: -0.55, d: PALMA }],
      [T.pIguala, T.pIgualado, { x: IGUALA.a.x + 12, y: IGUALA.a.y - 6, mu: -0.4, d: PALMA }],
      [T.pIgualado + 0.05, T.ases[0] - 0.1, { x: 628, y: 372, mu: -0.7, d: MESA_D }]
    ];
    // los ases: coge la de arriba del montón, la voltea en el aire y la deja en su sitio
    T.ases.forEach((ts, i) => {
      const m1 = manoAs(i, ts + 0.37);
      PL.push([ts, ts + 0.15, t2 => manoAs(i,t2)]);
      PL.push([ts + 0.38, ts + 0.46, { x: m1.x + 8, y: m1.y - 9, mu: -0.55, d: MESA_D }]);
    });
    // rastrillo: el antebrazo barre el bote hacia él
    PL.push([T.ases[3] + 0.46, T.pArrastra, { x: XR0, y: 358, mu: -0.12, d: D(0.8, 0.85, 0.85, 0.8, 0.75) }]);
    PL.push([T.pArrastra, T.pArrastra, t2 => ({ x: xRastrillo(t2), y: lerp(358,360,tramo(t2,T.pArrastra,T.pArrastrado)), mu: lerp(-0.12,-0.18,tramo(t2,T.pArrastra,T.pArrastrado)), d: D(0.8, 0.85, 0.85, 0.8, 0.75) })]);
    PL.push([T.pArrastrado + 0.05, T.pVuelve + 0.1, reposo]);
    // final: coge el vaso y lo levanta un poquito hacia la cámara
    PL.push([T.pVaso, T.pVaso + 0.35, reposo]);
    PL.push([T.pBrinda, T.pBrinda + 0.3, { x: 616, y: 336, mu: 0.35, d: VASO }]);
    const l = pista(PL, t);
    // ¿qué lleva la mano lejana? el vaso (en reposo, sorbo y brindis) o un as
    let objeto = null;
    const conVaso = t < T.pIgualaV || t >= T.pVaso;
    if (conVaso) {
      const inc = A_SORBO * dentro(t, T.pSorbo + 0.1, T.pSorbo + 0.4, T.pSorbido - 0.4, T.pSorbido - 0.12) + 0.15 * dentro(t, T.pBrinda, T.pBrinda + 0.3, DUR, DUR + 1);
      // en la mesa (reposo) el vaso está en su sitio: la mano lo agarra
      const c = vasoDeMano(l, inc);
      objeto = { vaso: { x: c.x, y: c.y, ang: inc } };
    }
    T.ases.forEach((ts, i) => { if (t >= ts + 0.15 && t < ts + 0.37) objeto = { as: i }; });
    p.vasoMano = objeto && objeto.vaso ? objeto.vaso : null;
    p.asMano = objeto && objeto.as !== undefined ? objeto.as : null;
    p.manoLejosQ = l;
    p.manoLejos = manoRig(P, p, l, -1, g => conCamara(g, () => objetoP(g, t, p, l)));
    const reposoC = P.manoReposo(p, "cerca");
    if (t < T.fanDejado + 0.32) {
      const bolsillo = { ...enPant(P,p,reposoC), mu: Math.PI - reposoC.mu, d: D(0,0) };
      const m = pista([[0,0,FAN_INI],[T.fanBaja,T.fanDejado,FAN_FIN],[T.fanDejado,T.fanDejado+0.32,bolsillo]],t);
      p.abanico = t < T.fanDejado ? abanicoP(t,m) : null;
      p.manoCerca = manoRig(P,p,m,-1,p.abanico ? g => conCamara(g, () => p.abanico.forEach(c => naipe(g,c))) : null);
      p.manoCerca.puno = 1 - tramo(t,T.fanDejado,T.fanDejado+0.32);
    } else p.manoCerca = reposoC;
  }
  function objetoP(g, t, p, l) {
    if (p.vasoMano) vaso(g, p.vasoMano.x, p.vasoMano.y, p.vasoMano.ang, t);
    if (p.asMano !== null) {
      naipe(g, cartaAs(p.asMano, t));
    }
  }

  /* =====================================================================================
   * ATREZO
   * ===================================================================================== */
  // vaso bajo de whisky con hielo: centro (x, y), inclinación ang
  function vaso(g, x, y, ang, t) {
    const h = 27, w = 21;
    g.save(); g.translate(x, y); g.rotate(ang); g.lineJoin = "round";
    // líquido (siempre horizontal en pantalla: se dibuja contra-girado dentro del vaso)
    const forma = () => { g.beginPath(); g.moveTo(-w / 2, -h / 2); g.lineTo(-w / 2 + 1.2, h / 2); g.lineTo(w / 2 - 1.2, h / 2); g.lineTo(w / 2, -h / 2); g.closePath(); };
    forma(); g.fillStyle = "rgba(220,235,245,0.35)"; g.fill();
    g.save(); forma(); g.clip();
    g.rotate(-ang);
    const nivel = 2;
    g.fillStyle = "rgba(196,112,28,0.92)"; g.fillRect(-20, nivel, 40, 30);
    g.fillStyle = "rgba(255,200,110,0.6)"; g.fillRect(-20, nivel, 40, 1.6);
    // hielo
    const v = 0.6 * Math.sin(t * 3);
    for (const [dx, dy, r] of [[-3, nivel - 1, 0.3], [3.5, nivel + 1, -0.25]]) {
      g.save(); g.translate(dx + v, dy); g.rotate(r); g.fillStyle = "rgba(240,250,255,0.85)"; g.strokeStyle = "rgba(120,150,170,0.9)"; g.lineWidth = 0.8;
      g.fillRect(-3.4, -3.4, 6.8, 6.8); g.strokeRect(-3.4, -3.4, 6.8, 6.8); g.restore();
    }
    g.restore();
    // culo grueso, brillo y contorno
    g.fillStyle = "rgba(200,225,240,0.55)"; g.fillRect(-w / 2 + 1.3, h / 2 - 4, w - 2.6, 4);
    g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-w / 2 + 3, -h / 2 + 3); g.lineTo(-w / 2 + 3.6, h / 2 - 5); g.stroke();
    forma(); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke();
    g.beginPath(); g.ellipse(0, -h / 2, w / 2, 2, 0, 0, Math.PI * 2); g.lineWidth = 1.1; g.stroke();
    g.restore();
  }
  // silla de madera con respaldo y asiento de piel; dir = hacia dónde mira quien se sienta
  function silla(g, x, dir) {
    const ys = Y_ASIENTO, atras = x - dir * 46, delante = x + dir * 42;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.fillStyle = "rgba(10,6,4,0.35)"; g.beginPath(); g.ellipse(x, SUELO + 2, 58, 6, 0, 0, Math.PI * 2); g.fill();
    const mad = "#4a2a16", madL = "#6e4122";
    const pata = (x0, x1, w, c) => { g.strokeStyle = TINTA; g.lineWidth = w + 3; g.beginPath(); g.moveTo(x0, ys + 6); g.lineTo(x1, SUELO - 2); g.stroke(); g.strokeStyle = c; g.lineWidth = w; g.stroke(); };
    pata(atras + dir * 8, atras + dir * 2, 5, "#2f1a0d"); pata(delante - dir * 8, delante - dir * 2, 5, "#2f1a0d");
    g.strokeStyle = TINTA; g.lineWidth = 6; g.beginPath(); g.moveTo(atras, ys + 70); g.lineTo(delante, ys + 70); g.stroke(); g.strokeStyle = madL; g.lineWidth = 3; g.stroke();
    pata(atras, atras - dir * 4, 6, mad); pata(delante, delante + dir * 4, 6, mad);
    // respaldo: dos postes y travesaños
    const top = ys - 112;
    for (const [dx, c] of [[10, "#2f1a0d"], [0, mad]]) {
      g.strokeStyle = TINTA; g.lineWidth = 9; g.beginPath(); g.moveTo(atras + dir * dx, ys + 2); g.quadraticCurveTo(atras - dir * (6 - dx), ys - 60, atras - dir * (10 - dx), top); g.stroke();
      g.strokeStyle = c; g.lineWidth = 6; g.stroke();
    }
    for (const yy of [top + 10, top + 34]) { g.strokeStyle = TINTA; g.lineWidth = 9; g.beginPath(); g.moveTo(atras - dir * 12, yy); g.lineTo(atras + dir * 4, yy + 2); g.stroke(); g.strokeStyle = madL; g.lineWidth = 6; g.stroke(); }
    // asiento de piel verde botella con tachuelas
    g.fillStyle = "#1f3a2c"; g.beginPath(); g.ellipse(x - dir * 2, ys + 3, 50, 9, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#2d523e"; g.beginPath(); g.ellipse(x - dir * 2, ys + 1, 46, 6.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#c9a35a"; for (let i = -4; i <= 4; i++) { g.beginPath(); g.arc(x - dir * 2 + i * 11, ys + 3 + 8 * Math.sqrt(1 - (i * 11 / 50) ** 2), 1.3, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.ellipse(x - dir * 2, ys + 3, 50, 9, 0, 0, Math.PI * 2); g.stroke();
    g.restore();
  }
  // mesa: tapete y borde de atrás (antes de los personajes)
  function mesaAtras(g) {
    const { x, y, rx, ry, frx, fry, fy } = MESA;
    g.save(); g.lineJoin = "round";
    // borde acolchado (anillo entero; el de delante se repinta encima de los personajes)
    g.fillStyle = "#3a1a10"; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
    const gr = g.createLinearGradient(0, y - ry, 0, y + ry); gr.addColorStop(0, "#6b2e1c"); gr.addColorStop(0.5, "#4c1f12"); gr.addColorStop(1, "#33140b");
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, y - 2, rx - 2, ry - 2, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(255,190,150,0.25)"; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y - 4, rx - 6, ry - 5, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
    // tapete
    const gt = g.createRadialGradient(x, fy - 4, 10, x, fy, frx); gt.addColorStop(0, "#2f9a5c"); gt.addColorStop(0.7, "#1f7a45"); gt.addColorStop(1, "#155a33");
    g.fillStyle = gt; g.beginPath(); g.ellipse(x, fy, frx, fry, 0, 0, Math.PI * 2); g.fill();
    // fieltro: grano
    g.save(); g.beginPath(); g.ellipse(x, fy, frx, fry, 0, 0, Math.PI * 2); g.clip();
    for (let i = 0; i < 220; i++) { g.fillStyle = `rgba(${hash(i) > 0.5 ? "255,255,255" : "0,30,10"},${0.04 + 0.04 * hash(i + 3)})`; g.fillRect(x - frx + hash(i + 1) * frx * 2, fy - fry + hash(i + 2) * fry * 2, 1.5, 1.5); }
    // línea dorada pintada en el tapete
    g.strokeStyle = "rgba(240,215,140,0.55)"; g.lineWidth = 1.4; g.beginPath(); g.ellipse(x, fy + 1, frx * 0.72, fry * 0.66, 0, 0, Math.PI * 2); g.stroke();
    g.restore();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy, frx, fry, 0, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.ellipse(x, y, rx, ry, 0, Math.PI, Math.PI * 2); g.lineWidth = 2.4; g.stroke();
    g.restore();
  }
  // borde de delante, faldón y pie (encima de los personajes: les tapa lo que queda bajo la mesa)
  function mesaDelante(g) {
    const { x, y, rx, ry, frx, fry, fy, canto } = MESA;
    g.save(); g.lineJoin = "round";
    // pie central y su base
    g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse(x, SUELO + 2, 92, 9, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#2b1209"; g.beginPath(); g.moveTo(x - 16, y + ry); g.lineTo(x - 22, SUELO - 22); g.lineTo(x + 22, SUELO - 22); g.lineTo(x + 16, y + ry); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#3d1a0e"; g.beginPath(); g.moveTo(x - 80, SUELO - 4); g.quadraticCurveTo(x - 40, SUELO - 30, x, SUELO - 28); g.quadraticCurveTo(x + 40, SUELO - 30, x + 80, SUELO - 4); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "rgba(255,190,150,0.2)"; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 6, y + ry + 10); g.lineTo(x - 9, SUELO - 30); g.stroke();
    // faldón (canto de madera bajo el borde)
    g.beginPath(); g.ellipse(x, y + canto, rx - 4, ry - 1, 0, 0, Math.PI); g.lineTo(x - rx + 4, y); g.ellipse(x, y, rx - 4, ry - 1, 0, Math.PI, 0, true); g.closePath();
    g.fillStyle = "#24100a"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    // borde acolchado de delante (entre el tapete y el aro de fuera)
    g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI); g.lineTo(x - frx, fy); g.ellipse(x, fy, frx, fry, 0, Math.PI, 0, true); g.closePath();
    const gr = g.createLinearGradient(0, fy, 0, y + ry); gr.addColorStop(0, "#5a2617"); gr.addColorStop(0.45, "#7a3420"); gr.addColorStop(1, "#3a170c");
    g.fillStyle = gr; g.fill();
    g.save(); g.clip(); g.strokeStyle = "rgba(255,200,170,0.35)"; g.lineWidth = 2.5; g.beginPath(); g.ellipse(x, y + 4, rx - 10, ry - 6, 0, 0.15, Math.PI - 0.15); g.stroke();
    // costuras del acolchado
    g.strokeStyle = "rgba(20,6,2,0.55)"; g.lineWidth = 1.2;
    for (let a = 0.12; a < Math.PI; a += 0.19) { g.beginPath(); g.moveTo(x + Math.cos(a) * frx, fy + Math.sin(a) * fry); g.lineTo(x + Math.cos(a) * rx, y + Math.sin(a) * ry); g.stroke(); }
    g.restore();
    g.strokeStyle = TINTA; g.lineWidth = 2.2; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI); g.stroke();
    g.lineWidth = 1.6; g.beginPath(); g.ellipse(x, fy, frx, fry, 0, 0.02, Math.PI - 0.02); g.stroke();
    g.restore();
  }
  // lámpara baja de pantalla verde (con su balanceo)
  const LAMP = { x: 512, y: 128, ancho: 58, alto: 36 };
  const angLampara = t => { const u = t - T.gPum; return 0.008 * Math.sin(t * 0.9) + (u > 0 ? 0.075 * Math.exp(-u * 1.1) * Math.sin(u * 5.2) : 0); };
  const PIVOTE_L = { x: 512, y: -60 };
  const bocaLampara = t => { const a = angLampara(t), L = LAMP.y + LAMP.alto - PIVOTE_L.y; return { x: PIVOTE_L.x - Math.sin(a) * L, y: PIVOTE_L.y + Math.cos(a) * L, a }; };
  function lampara(g, t) {
    const a = angLampara(t);
    g.save(); g.translate(PIVOTE_L.x, PIVOTE_L.y); g.rotate(a); g.translate(-PIVOTE_L.x, -PIVOTE_L.y);
    const { x, y, ancho, alto } = LAMP;
    g.strokeStyle = TINTA; g.lineWidth = 3; g.beginPath(); g.moveTo(x, PIVOTE_L.y); g.lineTo(x, y - 6); g.stroke();
    g.fillStyle = "#b08a3a"; g.fillRect(x - 6, y - 10, 12, 8); g.strokeRect(x - 6, y - 10, 12, 8);
    // pantalla verde de cristal
    const forma = () => { g.beginPath(); g.moveTo(x - 10, y - 3); g.bezierCurveTo(x - ancho * 0.5, y, x - ancho, y + alto * 0.6, x - ancho, y + alto); g.lineTo(x + ancho, y + alto); g.bezierCurveTo(x + ancho, y + alto * 0.6, x + ancho * 0.5, y, x + 10, y - 3); g.closePath(); };
    forma(); const gr = g.createLinearGradient(x - ancho, 0, x + ancho, 0); gr.addColorStop(0, "#0d3b22"); gr.addColorStop(0.35, "#2a7a48"); gr.addColorStop(0.6, "#17573a"); gr.addColorStop(1, "#0a2c19");
    g.fillStyle = gr; g.fill();
    g.strokeStyle = "rgba(200,255,210,0.5)"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x - 22, y + 6); g.quadraticCurveTo(x - ancho * 0.75, y + alto * 0.45, x - ancho * 0.85, y + alto - 3); g.stroke();
    forma(); g.strokeStyle = TINTA; g.lineWidth = 2.2; g.stroke();
    // boca de la lámpara y bombilla
    g.fillStyle = "#fff4c8"; g.beginPath(); g.ellipse(x, y + alto, ancho, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#c79c45"; g.beginPath(); g.ellipse(x, y + alto, ancho, 6, 0, 0, Math.PI); g.lineTo(x - ancho, y + alto); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.8; g.beginPath(); g.ellipse(x, y + alto, ancho, 6, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#fffbe6"; g.beginPath(); g.arc(x, y + alto + 3, 9, 0, Math.PI); g.fill();
    g.restore();
  }
  // cono de luz (debajo de los personajes) y charco de luz en el tapete
  function luzLampara(g, t) {
    const b = bocaLampara(t), dx = (b.x - LAMP.x);
    g.save();
    const gr = g.createLinearGradient(0, b.y, 0, MESA.y + 30);
    gr.addColorStop(0, "rgba(255,230,160,0.26)"); gr.addColorStop(1, "rgba(255,220,150,0.07)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(b.x - LAMP.ancho + 4, b.y); g.lineTo(b.x + LAMP.ancho - 4, b.y);
    g.lineTo(MESA.x + dx * 3 + 200, MESA.fy + 10); g.lineTo(MESA.x + dx * 3 - 200, MESA.fy + 10); g.closePath(); g.fill();
    g.restore();
  }
  function charcoLuz(g, t) {
    const b = bocaLampara(t), cx = MESA.x + (b.x - LAMP.x) * 3.2;
    g.save(); g.beginPath(); g.ellipse(MESA.x, MESA.fy, MESA.frx, MESA.fry, 0, 0, Math.PI * 2); g.clip();
    const gr = g.createRadialGradient(cx, MESA.fy - 4, 6, cx, MESA.fy, 140);
    gr.addColorStop(0, "rgba(255,240,170,0.35)"); gr.addColorStop(1, "rgba(255,240,170,0)");
    g.fillStyle = gr; g.fillRect(MESA.x - 170, MESA.fy - 40, 340, 80);
    g.restore();
  }
  // motas de polvo que flotan en el cono
  function motas(g, t) {
    const b = bocaLampara(t);
    g.save();
    for (let i = 0; i < 26; i++) {
      const ph = (t * (0.04 + 0.03 * hash(i + 4)) + hash(i)) % 1, yy = lerp(b.y + 8, MESA.y - 18, ph);
      const half = lerp(LAMP.ancho - 6, 170, (yy - b.y) / (MESA.y - b.y));
      const xx = b.x + (hash(i + 9) * 2 - 1) * half * 0.85 + 6 * Math.sin(t * 0.7 + i);
      g.globalAlpha = 0.45 * Math.sin(Math.PI * ph); g.fillStyle = "#fff3cf";
      g.beginPath(); g.arc(xx, yy, 0.9 + 0.8 * hash(i + 2), 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  /* ---------- fondo (se pinta una vez) ---------- */
  const PARED = 470;
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 160; c.height = H + 140; const g = c.getContext("2d");
    g.translate(80, 70); g.lineJoin = "round";
    // pared de tablones oscuros
    g.fillStyle = "#2d1a10"; g.fillRect(-80, -70, W + 160, PARED + 70);
    for (let x = -80, i = 0; x < W + 80; x += 34, i++) {
      g.fillStyle = `rgba(${90 + 20 * hash(i)},${52 + 12 * hash(i + 1)},${30 + 8 * hash(i + 2)},0.55)`; g.fillRect(x + 1, -70, 32, PARED + 70);
      g.strokeStyle = "rgba(10,4,2,0.7)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, -70); g.lineTo(x, PARED); g.stroke();
      g.strokeStyle = "rgba(255,200,150,0.06)"; g.lineWidth = 1;
      for (let k = 0; k < 3; k++) { g.beginPath(); const xx = x + 6 + k * 9 + 3 * hash(i * 7 + k); g.moveTo(xx, -70); g.bezierCurveTo(xx + 3, 100, xx - 3, 250, xx + 2, PARED); g.stroke(); }
    }
    // friso de arriba y zócalo de cuarterones
    g.fillStyle = "#3d2214"; g.fillRect(-80, 300, W + 160, 10); g.fillStyle = "#1e110a"; g.fillRect(-80, 310, W + 160, 4);
    g.fillStyle = "#24140c"; g.fillRect(-80, 314, W + 160, PARED - 314);
    for (let x = -60; x < W + 60; x += 120) {
      g.fillStyle = "#331c10"; g.fillRect(x, 330, 104, PARED - 350);
      g.strokeStyle = "rgba(255,190,140,0.12)"; g.lineWidth = 2; g.strokeRect(x + 6, 336, 92, PARED - 362);
      g.strokeStyle = "rgba(0,0,0,0.6)"; g.lineWidth = 2; g.strokeRect(x, 330, 104, PARED - 350);
    }
    g.fillStyle = "#3d2214"; g.fillRect(-80, PARED - 10, W + 160, 10);
    // aplique de pared con su halo (izquierda) y cuadro de un paisaje
    const halo = (x, y, r, a) => { const gh = g.createRadialGradient(x, y, 4, x, y, r); gh.addColorStop(0, `rgba(255,205,130,${a})`); gh.addColorStop(1, "rgba(255,205,130,0)"); g.fillStyle = gh; g.fillRect(x - r, y - r, r * 2, r * 2); };
    halo(118, 150, 150, 0.32);
    g.fillStyle = "#a07a34"; g.fillRect(112, 150, 12, 26); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.strokeRect(112, 150, 12, 26);
    g.fillStyle = "#f2d7a0"; g.beginPath(); g.moveTo(102, 150); g.lineTo(134, 150); g.lineTo(128, 124); g.lineTo(108, 124); g.closePath(); g.fill(); g.stroke();
    // cuadro: un velero al atardecer (marco dorado)
    g.save(); g.translate(206, 88);
    g.fillStyle = "#7a5a22"; g.fillRect(-6, -6, 132, 96); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(-6, -6, 132, 96);
    const gc = g.createLinearGradient(0, 0, 0, 84); gc.addColorStop(0, "#e79a52"); gc.addColorStop(0.55, "#f2c88a"); gc.addColorStop(0.56, "#3e6a86"); gc.addColorStop(1, "#24465c");
    g.fillStyle = gc; g.fillRect(0, 0, 120, 84);
    g.fillStyle = "#ffe2a8"; g.beginPath(); g.arc(80, 44, 11, Math.PI, 0); g.fill();
    g.fillStyle = "#3a2a1c"; g.beginPath(); g.moveTo(34, 58); g.lineTo(66, 58); g.lineTo(60, 64); g.lineTo(40, 64); g.closePath(); g.fill();
    g.fillStyle = "#f6efe0"; g.beginPath(); g.moveTo(49, 56); g.lineTo(49, 24); g.lineTo(64, 56); g.closePath(); g.fill(); g.beginPath(); g.moveTo(47, 56); g.lineTo(47, 30); g.lineTo(36, 56); g.closePath(); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.4)"; g.lineWidth = 1; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(10 + i * 22, 66 + (i % 2) * 6); g.lineTo(24 + i * 22, 66 + (i % 2) * 6); g.stroke(); }
    g.restore();
    // puerta entornada a la derecha (luz del bar que se cuela)
    g.save(); g.translate(842, 118);
    g.fillStyle = "#1a0e07"; g.fillRect(-8, -8, 136, PARED - 110); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(-8, -8, 136, PARED - 110);
    const gl = g.createLinearGradient(0, 0, 40, 0); gl.addColorStop(0, "rgba(255,190,110,0.85)"); gl.addColorStop(1, "rgba(255,170,90,0.2)");
    g.fillStyle = gl; g.fillRect(0, 0, 40, PARED - 126);
    g.fillStyle = "#4a2a16"; g.beginPath(); g.moveTo(30, 0); g.lineTo(120, -6); g.lineTo(120, PARED - 120); g.lineTo(30, PARED - 126); g.closePath(); g.fill(); g.stroke();
    for (const [y0, h0] of [[16, 120], [158, 150]]) { g.strokeStyle = "rgba(0,0,0,0.5)"; g.lineWidth = 2; g.beginPath(); g.moveTo(44, y0); g.lineTo(108, y0 - 4); g.lineTo(108, y0 + h0 - 4); g.lineTo(44, y0 + h0); g.closePath(); g.stroke(); }
    g.fillStyle = "#d8b25a"; g.beginPath(); g.arc(42, 186, 4, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
    // aparador con licorera y vasos
    g.save(); g.translate(680, 330);
    halo(70, -40, 120, 0.12);
    g.fillStyle = "#3b1f10"; g.fillRect(0, 0, 140, 110); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(0, 0, 140, 110);
    g.fillStyle = "#4e2a16"; g.fillRect(-6, -8, 152, 10); g.strokeRect(-6, -8, 152, 10);
    for (const x of [8, 74]) { g.strokeStyle = "rgba(255,190,140,0.15)"; g.strokeRect(x, 16, 58, 84); g.fillStyle = "#c9a35a"; g.beginPath(); g.arc(x + (x < 50 ? 52 : 6), 58, 2.5, 0, Math.PI * 2); g.fill(); }
    // licorera
    g.fillStyle = "rgba(190,110,40,0.85)"; g.beginPath(); g.moveTo(40, -8); g.quadraticCurveTo(24, -10, 26, -34); g.quadraticCurveTo(28, -50, 38, -52); g.lineTo(38, -62); g.lineTo(46, -62); g.lineTo(46, -52); g.quadraticCurveTo(56, -50, 58, -34); g.quadraticCurveTo(60, -10, 44, -8); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.6; g.stroke(); g.fillStyle = "rgba(220,240,255,0.5)"; g.beginPath(); g.arc(42, -66, 5, 0, Math.PI * 2); g.fill(); g.stroke();
    for (const x of [80, 102]) { g.fillStyle = "rgba(220,235,245,0.4)"; g.fillRect(x, -24, 14, 16); g.strokeRect(x, -24, 14, 16); }
    g.restore();
    // reloj de pared sin números
    g.save(); g.translate(560, 70); g.fillStyle = "#5a3418"; g.beginPath(); g.arc(0, 0, 30, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#efe2c4"; g.beginPath(); g.arc(0, 0, 24, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = "#3a2a1a"; g.lineWidth = 2; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.beginPath(); g.moveTo(Math.cos(a) * 19, Math.sin(a) * 19); g.lineTo(Math.cos(a) * 22, Math.sin(a) * 22); g.stroke(); }
    g.lineWidth = 2.6; g.beginPath(); g.moveTo(0, 0); g.lineTo(9, -10); g.stroke(); g.lineWidth = 1.8; g.beginPath(); g.moveTo(0, 0); g.lineTo(-4, -18); g.stroke();
    g.restore();
    // suelo de tarima oscura y alfombra
    const gs = g.createLinearGradient(0, PARED, 0, H + 70); gs.addColorStop(0, "#2a160c"); gs.addColorStop(1, "#1a0d06");
    g.fillStyle = gs; g.fillRect(-80, PARED, W + 160, H + 70 - PARED);
    g.strokeStyle = "rgba(0,0,0,0.5)"; g.lineWidth = 1.5;
    for (let y = PARED + 10, i = 0; y < H + 70; y += 14 + i * 2, i++) { g.beginPath(); g.moveTo(-80, y); g.lineTo(W + 80, y); g.stroke(); }
    g.fillStyle = "#5a1a1c"; g.beginPath(); g.ellipse(512, SUELO + 4, 300, 30, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#c9a35a"; g.lineWidth = 2; g.beginPath(); g.ellipse(512, SUELO + 4, 284, 25, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "rgba(0,0,0,0.5)"; g.lineWidth = 2; g.beginPath(); g.ellipse(512, SUELO + 4, 300, 30, 0, 0, Math.PI * 2); g.stroke();
    // penumbra general (la luz está sobre la mesa)
    const gv = g.createRadialGradient(512, 300, 120, 512, 330, 700); gv.addColorStop(0, "rgba(0,0,0,0)"); gv.addColorStop(1, "rgba(0,0,0,0.55)");
    g.fillStyle = gv; g.fillRect(-80, -70, W + 160, H + 140);
    return c;
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  let BASE_M = null;
  function conCamara(g, f) { g.save(); g.setTransform(BASE_M); f(); g.restore(); }
  // tintineo de fichas: arquitos que salen de un punto
  function tin(g, x, y, k, sg = 1) {
    if (k <= 0.01) return;
    g.save(); g.strokeStyle = `rgba(255,248,220,${0.9 * Math.sin(Math.PI * k)})`; g.lineWidth = 1.6; g.lineCap = "round";
    for (let i = -1; i <= 1; i++) { const a = -Math.PI / 2 + sg * 0.5 + i * 0.45, r0 = 8 + 8 * k, r1 = r0 + 5; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // golpe en el tapete (manotazo): rayitas de impacto
  function impacto(g, x, y, k) {
    if (k <= 0.01) return;
    g.save(); g.strokeStyle = `rgba(20,16,20,${0.85 * Math.sin(Math.PI * k)})`; g.lineWidth = 2.4; g.lineCap = "round";
    for (const a of [-2.7, -2.2, -1.57, -0.95, -0.45]) { const r0 = 18 + 10 * k; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0 * 0.7); g.lineTo(x + Math.cos(a) * (r0 + 9), y + Math.sin(a) * (r0 + 9) * 0.7); g.stroke(); }
    g.restore();
  }
  // brillo en forma de estrella (cada as al posarse)
  function brillito(g, x, y, k) {
    if (k <= 0.01 || k >= 1) return;
    const r = 10 * Math.sin(Math.PI * k);
    g.save(); g.translate(x, y); g.rotate(k * 1.5); g.fillStyle = "#fffbe0"; g.beginPath();
    for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.25 : r, an = i * Math.PI / 4; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
    g.closePath(); g.fill(); g.restore();
  }
  // nubecilla de polvo del tapete al caer
  function polvo(g, x, y, t0, t) {
    const u = t - t0; if (u < 0 || u > 0.7) return;
    g.save();
    for (let i = 0; i < 7; i++) {
      const a = Math.PI + (i / 6) * Math.PI, d = 10 + 34 * salida(u / 0.7) * (0.6 + 0.4 * hash(i + 3));
      g.globalAlpha = 0.5 * (1 - u / 0.7); g.fillStyle = "#cfe8d4";
      g.beginPath(); g.ellipse(x + Math.cos(a) * d * 1.3, y + Math.sin(a) * d * 0.35 - 3, 6 + 5 * u, 3.5 + 2 * u, 0, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  // gotitas de sudor del bailecito (se ven las notitas de la alegría: corazoncitos no; rayitas de movimiento)
  function rayitasBaile(g, t, pG) {
    const k = dentro(t, T.gBaile, T.gBaile + 0.15, T.gBaileFin - 0.1, T.gBaileFin + 0.05); if (k <= 0.01) return;
    const c = enPant(G, pG, G.cabeza(pG).a({ x: 760, y: 420 }));
    g.save(); g.strokeStyle = `rgba(255,240,210,${0.8 * k})`; g.lineWidth = 2.2; g.lineCap = "round";
    const w = (t - T.gBaile) * Math.PI * 4.2;
    for (const sg of [-1, 1]) for (let i = 0; i < 2; i++) {
      const x = c.x + sg * (62 + i * 7), y = c.y - 10 + i * 12 + 4 * Math.sin(w + sg);
      g.beginPath(); g.moveTo(x, y - 6); g.quadraticCurveTo(x + sg * 4, y, x, y + 6); g.stroke();
    }
    g.restore();
  }
  // rayitas de «¡uy!» alrededor de la cabeza cuando ve sus cartas
  function lineasWow(g, t, pG) {
    const k = campana(t, T.gWow, T.gWow + 0.5); if (k <= 0.01) return;
    const c = enPant(G, pG, G.cabeza(pG).a({ x: 790, y: 420 }));
    g.save(); g.strokeStyle = `rgba(255,236,170,${0.95 * k})`; g.lineWidth = 3; g.lineCap = "round";
    for (let i = -3; i <= 3; i++) { const a = -Math.PI / 2 + 0.25 + i * 0.3; g.beginPath(); g.moveTo(c.x + Math.cos(a) * 92, c.y + Math.sin(a) * 80); g.lineTo(c.x + Math.cos(a) * 112, c.y + Math.sin(a) * 98); g.stroke(); }
    g.restore();
  }

  /* ---------- la ficha que salta al caer Guillermo y se le queda en la cabeza ---------- */
  const CORONA = { x: 556, y: 472 };              // punto del retrato que queda arriba con la cabeza tumbada
  function fichaCabeza(t, pG) {
    const c0 = CAIDAS[0].to, u = t - T.fichaSalta;
    if (u < 0) return null;
    const H = G.cabeza(pG), top = enPant(G, pG, H.a(CORONA));
    const vuelo = 0.42;
    if (u < vuelo) {
      const k = u / vuelo, x = lerp(c0.x, top.x, k), y = lerp(c0.y, top.y, k) - 46 * Math.sin(Math.PI * k);
      return { x, y, rot: (Math.PI * 2 + 0.1) * suave(k), cae: k };
    }
    // botecito y se queda (sigue a la cabeza)
    const r = u - vuelo, b = 9 * Math.abs(Math.sin(r * 12)) * Math.exp(-r * 8);
    return { x: top.x, y: top.y - b, rot: 0.1 + 0.25 * Math.exp(-r * 6) * Math.sin(r * 20) };
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const a = tramo(t, 7.85, 8.6) * (1 - tramo(t, 10.75, 11.5));
    const b = tramo(t, 12.6, 13.6);
    let k = 1.22 + 0.14 * a + 0.06 * b, x = 512 + 4 * a + 26 * b, y = 342 + 14 * a - 4 * b;
    // sacudida al caer de cara
    const u = t - T.gPum;
    if (u > 0 && u < 0.5) { const s = Math.exp(-u * 9) * Math.sin(u * 55); y += 2.2 * s; x += 1.2 * s; }
    return { k, x, y };
  }

  function poses(t) { return { g: poseG(t), p: poseP(t) }; }

  /* =====================================================================================
   * ESCENA
   * ===================================================================================== */
  class LaPartida extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !P.listo()) return;
      if (!fondo) fondo = creaFondo();
      const pG = poseG(t), pP = poseP(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      BASE_M = g.getTransform();
      g.drawImage(fondo, -80, -70);
      luzLampara(g, t);
      silla(g, XG - 6, 1); silla(g, XP + 6, -1);
      mesaAtras(g);
      charcoLuz(g, t);
      dibujaMesa(g, t, pG, pP);
      // personajes
      P.dibujar(g, pP, t);
      G.dibujar(g, pG, t);
      mesaDelante(g);
      // efectos
      efectos(g, t, pG, pP);
      motas(g, t);
      lampara(g, t);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }

  // todo lo que hay sobre el tapete: naipes, vaso, fichas (ordenado de atrás a delante)
  function boteEn(t) {
    const pot = [];          // lo que entra en el bote (para el rastrillo)
    PILAS_G.forEach((pl, i) => {
      const k = tEmpuje(t), x = lerp(pl.x, pl.a.x, k), y = lerp(pl.y, pl.a.y, k), n = alturaPilaG(i, t);
      pot.push({ x, y, c: pl.c, n, rot: 0 });
    });
    fichasCaidas(t).forEach((f, j) => { if (j === 0 && t >= T.fichaSalta) return; pot.push({ x: f.x, y: f.y, c: f.c, n: 1, rot: f.rot, suelta: true, rezagada: j === 0 }); });
    CIEGAS.forEach(c => pot.push(Object.assign({ rot: 0 }, c)));
    {
      const k = suave(fase(t, T.pIguala, T.pIgualado)), on = t >= T.pIguala - 0.02;
      const x = on ? lerp(IGUALA.de.x, IGUALA.a.x, k) : IGUALA.de.x, y = on ? lerp(IGUALA.de.y, IGUALA.a.y, k) : IGUALA.de.y;
      pot.push({ x, y, c: IGUALA.c, n: IGUALA.n, rot: 0, iguala: true, antes: !on });
    }
    // rastrillo: lo que está a la derecha de la mano se arrastra con ella y acaba en el montón de Paradigma
    if (t >= T.pArrastra) {
      const xh = xRastrillo(t), k = fase(t, T.pArrastra, T.pArrastrado);
      const orden = pot.filter(o => !o.rezagada && !o.antes).sort((a, b) => a.x - b.x);
      const fin = boteFinal(orden), kk = suave(clamp((k - 0.55) / 0.45));
      orden.forEach((o, r) => {
        const x0 = o.x, y0 = o.y;
        const recorre = Math.max(0, xh - XR0 - Math.max(0, x0 - XR0 - 12 - 4.5 * r));
        const pu = clamp(recorre / 40);
        o.x = lerp(x0 + recorre, fin[r].x, kk);
        o.y = lerp(y0, fin[r].y, Math.max(pu * 0.6, kk));
      });
    }
    return pot;
  }
  function dibujaMesa(g, t, pG, pP) {
    const items = [];
    // naipes de Guillermo
    if (t < T.gCoge) CG_MESA.forEach(c => items.push({ y: c.y, f: () => naipe(g, { x: c.x, y: c.y, rot: c.rot, sx: 1, sy: 0.62, tipo: DORSO, sombra: true }) }));
    else if (t >= T.gDejado && t < T.gVuelve + 0.14) CG_DEJA.forEach(c => items.push({ y: c.y, f: () => naipe(g, { x: c.x, y: c.y, rot: c.rot, sx: 1, sy: 0.62, tipo: DORSO, sombra: true }) }));
    else if (t >= T.gGolpe) CG_VISTA.forEach((c, i) => {
      const u = t - T.gGolpe, bote = 3 * Math.exp(-u * 12) * Math.abs(Math.sin(u * 30));
      items.push({ y: c.y, f: () => naipe(g, { x: c.x, y: c.y - bote, rot: c.rot, sx: 1, sy: 0.62, tipo: c.tipo, sombra: true }) });
      void i;
    });
    // montón de Paradigma (boca abajo) y sus ases ya posados
    if (t >= T.fanDejado) for (let i = 3; i >= 0; i--) {
      if (t < T.ases[i] + 0.15) items.push({ y: MONTON_P.y + (3 - i) * 0.01, f: () => naipe(g, { ...cartaMonton(i), sx: 1, sy: 0.62, tipo: DORSO, sombra: i === 3 }) });
    }
    T.ases.forEach((ts, i) => {
      if (t < ts + 0.37) return;
      const s = SLOT_AS[i], u = t - (ts + 0.37);
      items.push({ y: s.y, f: () => naipe(g, { x: s.x, y: s.y - 2 * Math.exp(-u * 14) * Math.abs(Math.sin(u * 28)), rot: s.rot, sx: 1, sy: 0.62, tipo: i, sombra: true, brillo: clamp(u / 0.45) < 1 ? clamp(u / 0.45) : 0 }) });
    });
    // vaso en la mesa (cuando no lo tiene en la mano)
    items.push({ y: VASO_MESA.y - 0.5, f: () => sombraVaso(g) });
    if (!pP.vasoMano) items.push({ y: VASO_MESA.y, f: () => vaso(g, VASO_MESA.x, VASO_MESA.y - 13.5, 0, t) });
    // fichas
    const pot = boteEn(t);
    pot.forEach(o => items.push({ y: o.y, f: () => { sombraPila(g, o.x, o.y); pila(g, o.x, o.y, o.c, o.n, o.rot); } }));
    PILAS_P.forEach(pl => items.push({ y: pl.y, f: () => { sombraPila(g, pl.x, pl.y); pila(g, pl.x, pl.y, pl.c, pl.n); } }));
    items.sort((a, b) => a.y - b.y).forEach(it => it.f());
    void pG;
  }
  function sombraVaso(g) { g.fillStyle = "rgba(0,25,12,0.32)"; g.beginPath(); g.ellipse(VASO_MESA.x + 3, VASO_MESA.y + 0.5, 11, 3.5, 0, 0, Math.PI * 2); g.fill(); }

  function efectos(g, t, pG, pP) {
    lineasWow(g, t, pG);
    rayitasBaile(g, t, pG);
    // tintineo al frenar las pilas y al caer las fichas
    tin(g, 492, 340, fase(t, T.gEmpujado - 0.05, T.gEmpujado + 0.35));
    CAIDAS.forEach((c, j) => { const t0 = T.gEmpujado + 0.39 + j * 0.035; tin(g, c.to.x, c.to.y - 4, fase(t, t0, t0 + 0.3), j % 2 ? 1 : -1); });
    tin(g, IGUALA.a.x, IGUALA.a.y - 22, fase(t, T.pIgualado - 0.05, T.pIgualado + 0.3));
    // manotazo de Guillermo
    impacto(g, (CG_VISTA[0].x + CG_VISTA[1].x) / 2, CG_VISTA[0].y, fase(t, T.gGolpe, T.gGolpe + 0.3));
    // brillo y clic de cada as
    T.ases.forEach((ts, i) => { const s = SLOT_AS[i]; brillito(g, s.x + 8, s.y - 10, fase(t, ts + 0.37, ts + 0.72)); tin(g, s.x, s.y - 12, fase(t, ts + 0.35, ts + 0.62)); });
    // rastrillo: tintineo
    if (t > T.pArrastra && t < T.pArrastrado + 0.2) tin(g, xRastrillo(t) + 22, 344, ((t - T.pArrastra) * 3) % 1);
    // ¡pum! de Guillermo
    polvo(g, contactoCara(pG).x, MESA.fy, T.gPum, t);
    // ficha que salta a su cabeza
    const fc = fichaCabeza(t, pG);
    if (fc) pila(g, fc.x, fc.y, PILAS_G[0].c, 1, fc.rot);
    if (fc) tin(g, fc.x, fc.y - 6, fase(t, T.fichaSalta + 0.42, T.fichaSalta + 0.72));
    void pP;
  }

  registrar({ id: "00108.2", nombre: "Guillermo y Paradigma · La partida de cartas", crear: () => new LaPartida() });
  // diagnóstico: distancia hombro → muñeca / largo del brazo (≤ 1,08 o la mano se despega)
  function diag(t) {
    const out = {};
    for (const [n, R, p] of [["g", G, poseG(t)], ["p", P, poseP(t)]]) for (const lado of ["cerca", "lejos"]) {
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m) continue;
      const Tr = R.tronco(p), h = Tr(lado === "cerca" ? R.HOMBRO_C : R.HOMBRO), mu = m.mu ?? -1.75;
      const w = { x: m.x + Math.cos(mu) * R.MUNECA_R * R.JK, y: m.y + Math.sin(mu) * R.MUNECA_R * R.JK };
      out[n + lado] = Math.hypot(w.x - h.x, w.y - h.y) / (lado === "cerca" ? R.BRAZO_C_L : R.BRAZO_L);
    }
    return out;
  }
  window.__A2D_00108_2 = { pose: poses, poseG, poseP, T, DUR, diag, PILAS_G, PILAS_P, IGUALA, CIEGAS, VASO_MESA, SLOT_AS, MONTON_P, CG_MESA, CG_DEJA, CG_VISTA, DOS, TRES, AS, DORSO, FH, CAIDAS, alturaPilaG, fichasCaidas, fichaCabeza, CORONA, MESA, CH, CW, enPant, bocaPant, xRastrillo, tEmpuje, pinza, abanicoP, cartaMonton, cartaAs, manoAs, VALOR_FICHA, instanteCaida, contactoCara, boteEn };
})();
