"use strict";
/* 00055 · Guillermo y Dari · La máquina recreativa
 *
 * Negro → rincón de recreativas al fondo de un bar: pared verde con zócalo de madera, suelo de
 * baldosas en damero, un póster de un cohete en píxeles, una diana y una guirnalda de bombillas.
 * En el centro, una recreativa de dos jugadores azul noche con la marquesina de un marciano en
 * píxeles; en la pantalla, un matamarcianos sin letras (solo píxeles y el marcador en números).
 * → Dari juega con una sola mano (la otra en el bolsillo): toquecitos mínimos y precisos a la
 *   palanca y cada disparo es un marciano menos. El marcador sube; Guillermo, al lado, pasa del
 *   aburrimiento a la boca abierta.
 * → Último marciano: fanfarria (bombillas en cadena, rayos y confeti, arcoíris en la pantalla,
 *   copa de píxeles y la bonificación disparando el marcador). Dari se sube las gafas con un dedo.
 * → Guillermo, picado, se frota las manos, sonríe chulo a cámara y mete una moneda. Juega con todo
 *   el cuerpo: palanca a tirones, botón aporreado, saltos, lengua fuera, rojo y sudando. Su nave va
 *   loca, casi no acierta y las bombas le quitan las tres vidas → la pantalla parpadea con una
 *   calavera de píxeles.
 * → Rabia: zarandea la palanca, la máquina se balancea… ¡crac! La palanca se le queda en la mano
 *   (en la consola, el muñón con el muelle botando). La mira, mira a cámara, mira a Dari; se la pasa
 *   a la otra mano, la esconde despacito detrás de la espalda (la bola roja asoma), mete la otra
 *   mano en el bolsillo y silba mirando al techo. Dari mira el muñón, le mira a él, sube una ceja y
 *   se coloca las gafas (destello) → negro.
 *
 * Todo depende del tiempo absoluto `t`: las dos partidas (disparos, choques y bombas) se calculan
 * una sola vez al cargar, así cualquier instante sale igual a cualquier fps.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, ruido, hash } = M2;
  const G = Guillermo, Da = Dari;
  const S = 0.30, SUELO = 560, DUR = 14.6, TINTA = "#0b0a0e";
  const T = {
    // Dari juega
    gAburre: 0.55, gMira: 1.05, gAlucina: 2.35, gana: 3.62, bonus0: 3.8, bonus1: 4.5, atrae: 4.95,
    dSuelta: 3.7, dGafas: 3.92, dEmpuja: 4.18, dGafas1: 4.55, dCede: 4.98, dCede1: 5.55,
    // Guillermo se pica y juega
    pique: 3.95, reto: 4.4, dedos0: 4.5, dedos1: 4.98, chulo: 5.0,
    saca: 5.2, mete: 5.55, clin: 5.6, ola: 5.66, coge: 5.78, juego: 5.95,
    golpe1: 6.95, golpe2: 7.8, golpe3: 8.6, over: 8.72,
    // la palanca
    agarra: 9.2, sacude0: 9.3, chas: 10.15,
    miraPalo: 10.4, camara: 11.0, aDari: 11.35, pasa: 11.6, pasa1: 11.88, esconde1: 12.62,
    silba: 12.5, dMiraTope: 12.62, ceja: 12.85, dGafas2: 12.98, dEmpuja2: 13.2, dGafas3: 13.5, fin: 13.9
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const D = (pu, ix, md, re) => ({ pulgar: pu, indice: ix, medio: md, anular: re, menique: re });
  const mezclaD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k), anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const PUNO = D(0, 0, 0, 0), PALMA = D(1, 1, 1, 1), PINZA = D(0.55, 0.5, 0.12, 0.12), SUAVE = D(0.4, 0.4, 0.4, 0.4),
    GAFAS_D = D(0.3, 1, 0.12, 0.1), FLOJA = D(0.45, 0.55, 0.45, 0.4), ABIERTA = D(0.8, 0.85, 0.8, 0.75);
  function mezclaM(a, b, k) {
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), ang: lerp(a.ang, b.ang, k), mu: lerp(a.mu, b.mu, k), puno: lerp(a.puno, b.puno, k),
      dedos: mezclaD(a.dedos, b.dedos, k), moneda: lerp(a.moneda || 0, b.moneda || 0, k) };
  }
  // guion de manos: cada modo es una función (contexto) → mano en pantalla
  function lineaM(guion, modos, ini, ctx, t) {
    let c = modos[ini](ctx);
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaM(c, modos[nom](ctx), (f || suave)(fase(t, t0, t1))); }
    return c;
  }
  // Catmull-Rom escalar por una lista [t, valor]
  function cat(L, t) {
    let i = 0; while (i < L.length - 2 && t > L[i + 1][0]) i++;
    const a = L[Math.max(0, i - 1)], b = L[i], c = L[i + 1], d = L[Math.min(L.length - 1, i + 2)];
    const k = clamp((t - b[0]) / (c[0] - b[0])), k2 = k * k, k3 = k2 * k;
    return 0.5 * ((2 * b[1]) + (-a[1] + c[1]) * k + (2 * a[1] - 5 * b[1] + 4 * c[1] - d[1]) * k2 + (-a[1] + 3 * b[1] - 3 * c[1] + d[1]) * k3);
  }
  const envolver = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a <= -Math.PI) a += 2 * Math.PI; return a; };
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mezclaCol = (a, b, k) => { const x = hex(a), y = hex(b); return `rgb(${Math.round(lerp(x[0], y[0], k))},${Math.round(lerp(x[1], y[1], k))},${Math.round(lerp(x[2], y[2], k))})`; };
  let CAM = null;          // matriz de la cámara del fotograma (para dibujar en pantalla dentro de las capas)
  const enPantalla = (g, f) => { g.save(); if (CAM) g.setTransform(CAM); f(g); g.restore(); };
  function rr(g, x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }

  /* =====================================================================================
   * LA MÁQUINA: medidas (pantalla, antes del balanceo)
   * ===================================================================================== */
  const MX = 512;
  const CAB = { x0: 428, x1: 596 };
  const MARQ = { x0: 420, x1: 604, y0: 52, y1: 116 };
  const BISEL = { x0: 442, x1: 582, y0: 126, y1: 280 };
  const PANT = { x: 452, y: 140, w: 120, h: 120 }, CEL = 4;         // 30 × 30 celdas de 4 px
  const MESA = { yA: 296, yB: 320, yC: 346, x0: 358, x1: 666 };    // consola: tapa (yA–yB, en trapecio) y frente (yB–yC)
  const STICK1 = { x: 398, y: 310 }, STICK2 = { x: 626, y: 310 }, LARGO = 26, R_BOLA = 11;
  const BOT1 = [{ x: 420, y: 314 }, { x: 437, y: 306 }], BOT2 = [{ x: 604, y: 314 }, { x: 587, y: 306 }];
  const START = [{ x: 500, y: 302 }, { x: 524, y: 302 }];
  const RANURA = { x: 381, y: 333 };
  const PIVOTE = { x: MX, y: 556 };
  const PANT_C = { x: 512, y: 200 };

  /* ---------- balanceo de la máquina cuando la zarandea ---------- */
  const W_SAC = 2 * Math.PI * 4.5;
  function balanceo(t) {
    const sac = tramo(t, T.sacude0, T.sacude0 + 0.12);
    let a = 0;
    if (t < T.chas) a = 0.024 * Math.sin((t - T.sacude0) * W_SAC) * sac;
    else {
      const u = t - T.chas, a0 = 0.024 * Math.sin((T.chas - T.sacude0) * W_SAC);
      a = (a0 * Math.cos(u * 2 * Math.PI * 3.2) - 0.028 * Math.sin(u * 2 * Math.PI * 3.2)) * Math.exp(-u * 4.5);
    }
    const fr = tramo(t, T.juego, T.juego + 0.2) * (1 - tramo(t, T.over, T.over + 0.2));
    return a + 0.0025 * ruido(t * 26) * fr;
  }
  function enMaq(q, t) {
    const a = balanceo(t), c = Math.cos(a), s = Math.sin(a), dx = q.x - PIVOTE.x, dy = q.y - PIVOTE.y;
    return { x: PIVOTE.x + dx * c - dy * s, y: PIVOTE.y + dx * s + dy * c };
  }

  /* =====================================================================================
   * LAS PARTIDAS (celdas de la pantalla)
   * ===================================================================================== */
  const V_BALA = 75;                                       // celdas por segundo
  // --- Dari: la formación se mece despacio; caza fila a fila, sin fallar uno
  const FX_D = t => 2.5 + 2 * Math.sin(t * 1.4), FY_D = t => 7 + 0.35 * t;
  const ORDEN_D = [[0, 2], [1, 2], [2, 2], [3, 2], [3, 1], [2, 1], [1, 1], [0, 1], [0, 0], [1, 0], [2, 0], [3, 0]];
  const MUERTE_D = {};
  const DISP_D = ORDEN_D.map(([c, r], i) => {
    const tk = 0.42 + i * 0.285, x = Math.round(FX_D(tk)) + c * 6 + 2, y = Math.round(FY_D(tk)) + r * 5 + 2;
    MUERTE_D[c + "," + r] = tk;
    return { t: tk, tf: tk - (25 - y) / V_BALA, x };
  });
  const NAVE_D = [[0, 9], ...DISP_D.map(d => [d.tf, d.x]), [T.gana + 0.3, 15], [T.ola, 15]];
  const naveD = t => cat(NAVE_D, t);
  function puntosD(t) {
    let n = 0; for (const d of DISP_D) if (t >= d.t) n++;
    return n * 350 + Math.round(5790 * suave(fase(t, T.bonus0, T.bonus1)) / 10) * 10;
  }
  // --- Guillermo: la formación baja deprisa; su nave va a tirones de palanca
  const FX_G = t => 2.5 + 2.2 * Math.sin((t - T.ola) * 2.3 + 0.5), FY_G = t => 7 + 1.35 * Math.max(0, t - T.juego);
  const VENT_G = [[T.juego - 0.05, 6.52], [6.98, 7.52], [7.86, 8.27]];         // ratos con la mano en la palanca
  const enPalancaG = t => { let k = 0; for (const [a, b] of VENT_G) k = Math.max(k, tramo(t, a, a + 0.06) * (1 - tramo(t, b - 0.06, b))); return k; };
  const tiron = t => 0.55 * Math.tanh(2.6 * Math.sin(2 * Math.PI * 2.4 * (t - T.juego) + 1.2 * ruido(t * 1.7 + 3)));
  const DTG = 1 / 240, T0G = T.ola, NG = Math.ceil((T.over + 0.6 - T0G) / DTG), NAVE_GX = new Float32Array(NG + 1);
  (() => { let x = 15; for (let i = 0; i <= NG; i++) { NAVE_GX[i] = x; const t = T0G + i * DTG; x = clamp(x + 50 * tiron(t) / 0.55 * enPalancaG(t) * DTG, 2.5, 27.5); } })();
  const naveG = t => { const u = clamp((t - T0G) / DTG, 0, NG - 1), i = Math.floor(u); return lerp(NAVE_GX[i], NAVE_GX[i + 1], u - i); };
  const PULSA_G = [6.6, 6.73, 6.86, 7.6, 7.72, 8.33, 8.46, 8.59];
  const MUERTE_G = {};
  const BALAS_G = PULSA_G.map(tp => {
    const x = Math.round(naveG(tp));
    let fin = tp + 27 / V_BALA;
    for (let tt = tp; tt < fin; tt += 1 / 240) {
      const y = 25 - (tt - tp) * V_BALA, fx = Math.round(FX_G(tt)), fy = Math.round(FY_G(tt));
      let mata = null;
      for (let r = 2; r >= 0 && !mata; r--) for (let c = 0; c < 4 && !mata; c++) {
        const k = c + "," + r; if (MUERTE_G[k] !== undefined && MUERTE_G[k] <= tt) continue;
        const ix = fx + c * 6, iy = fy + r * 5;
        if (x >= ix && x < ix + 5 && y >= iy && y < iy + 4) mata = k;
      }
      if (mata) { MUERTE_G[mata] = tt; fin = tt; break; }
    }
    return { tp, x, fin };
  });
  const BOMBAS_G = [T.golpe1, T.golpe2, T.golpe3].map(th => { const t0 = th - 0.42; return { th, t0, x: Math.round(naveG(th)), y0: Math.round(FY_G(t0)) + 14 }; });
  const puntosG = t => { let n = 0; for (const k in MUERTE_G) if (MUERTE_G[k] <= t) n++; return n * 10; };
  const vidasG = t => 3 - BOMBAS_G.filter(b => t >= b.th).length;
  const hundidoG = t => { let o = 0; for (const p of PULSA_G) o = Math.max(o, campana(t, p - 0.03, p + 0.07)); return o; };
  // la mano sube y baja entre golpe y golpe (0 encima del botón, 1 arriba)
  const rebotaBoton = t => { let d = 1; for (const p of PULSA_G) d = Math.min(d, Math.abs(t - p)); const k = clamp(d / 0.065); return 0.5 - 0.5 * Math.cos(Math.PI * k); };

  /* ---------- palancas ---------- */
  function palanca1(t) {
    if (t >= T.chas) return 0;
    let a = tiron(t) * enPalancaG(t);
    const sac = tramo(t, T.agarra + 0.02, T.sacude0 + 0.1);
    a -= 0.5 * Math.sin((t - T.sacude0) * W_SAC + 0.35) * sac;
    return a;
  }
  function palanca2(t) {
    const v = (naveD(t + 0.02) - naveD(t - 0.02)) / 0.04;
    return clamp(v / 45, -1, 1) * 0.22 * (1 - tramo(t, T.dSuelta - 0.06, T.dSuelta));
  }
  // bola, base y centro del puño que la agarra (el puño la coge por debajo: asoma el casquete rojo)
  function agarre(base, a, t) {
    const kl = { x: base.x + Math.sin(a) * LARGO, y: base.y - Math.cos(a) * LARGO };
    const K = enMaq(kl, t), B = enMaq(base, t), dx = B.x - K.x, dy = B.y - K.y, L = Math.hypot(dx, dy);
    return { bola: K, base: B, d: { x: dx / L, y: dy / L }, mano: { x: K.x + dx / L * 7, y: K.y + dy / L * 7 } };
  }

  /* =====================================================================================
   * PÍXELES DE LA PANTALLA
   * ===================================================================================== */
  const FIG = {
    inv0: [".XXX.", "X.X.X", "XXXXX", ".X.X."],
    inv1: [".XXX.", "X.X.X", "XXXXX", "X...X"],
    nave: ["..X..", ".XXX.", "XXXXX"],
    boom: ["X...X", ".X.X.", "..X..", ".X.X.", "X...X"],
    calavera: ["..XXXXXXX..", ".XXXXXXXXX.", "XXXXXXXXXXX", "XXoooXoooXX", "XXoooXoooXX", "XXoooXoooXX", "XXXXXnXXXXX", ".XXXnnnXXX.", "..XXXXXXX..", "..X.X.X.X..", "..XXXXXXX.."],
    copa: ["XXXXXXXXX", "X.XoXXX.X", "X.XoXXX.X", ".XXoXXXX.", "..XXXXX..", "...XXX...", "....X....", "...XXX...", "..XXXXX.."],
    moneda: [".XXX.", "XXoXX", "XXoXX", "XXoXX", ".XXX."],
    flecha: ["..X..", "..X..", "..X..", ".XXX.", ".XXX.", "..X.."],
    chispa: [".X.", "XXX", ".X."]
  };
  const DIG = [["XXX", "X.X", "X.X", "X.X", "XXX"], [".X.", "XX.", ".X.", ".X.", "XXX"], ["XXX", "..X", "XXX", "X..", "XXX"], ["XXX", "..X", ".XX", "..X", "XXX"],
    ["X.X", "X.X", "XXX", "..X", "..X"], ["XXX", "X..", "XXX", "..X", "XXX"], ["XXX", "X..", "XXX", "X.X", "XXX"], ["XXX", "..X", ".X.", ".X.", ".X."],
    ["XXX", "X.X", "XXX", "X.X", "XXX"], ["XXX", "X.X", "XXX", "..X", "XXX"]];
  const COL_INV = ["#ff5fd2", "#4ff3ff", "#9dff5a"];
  function sprite(filas, pal, c) {
    const cv = document.createElement("canvas"); cv.width = filas[0].length * c; cv.height = filas.length * c;
    const h = cv.getContext("2d");
    filas.forEach((f, y) => { for (let x = 0; x < f.length; x++) { const col = pal[f[x]]; if (col) { h.fillStyle = col; h.fillRect(x * c, y * c, c, c); } } });
    return cv;
  }
  let SPR = null, lienzoPant = null, velo = null;
  function creaSprites() {
    SPR = {
      inv: [0, 1].map(f => COL_INV.map(col => sprite(FIG["inv" + f], { X: col }, CEL))),
      naveD: sprite(FIG.nave, { X: "#8ff8ff" }, CEL), naveG: sprite(FIG.nave, { X: "#ffd84a" }, CEL),
      vidaD: sprite(FIG.nave, { X: "#8ff8ff" }, 2), vidaG: sprite(FIG.nave, { X: "#ffd84a" }, 2),
      boom: sprite(FIG.boom, { X: "#ffffff" }, CEL), boomG: sprite(FIG.boom, { X: "#ff9a2a" }, CEL),
      calav: sprite(FIG.calavera, { X: "#f6f2e8", o: "#1c0006", n: "#1c0006" }, 8), calavRoja: sprite(FIG.calavera, { X: "#f6f2e8", o: "#ff2a2a", n: "#1c0006" }, 8),
      copa: sprite(FIG.copa, { X: "#ffd23f", o: "#fff6b8" }, 5),
      moneda: sprite(FIG.moneda, { X: "#ffd23f", o: "#a36d00" }, 5), flecha: sprite(FIG.flecha, { X: "#ffffff" }, 4),
      chispa: sprite(FIG.chispa, { X: "#ffffff" }, 3),
      dig: DIG.map(f => sprite(f, { X: "#ffffff" }, 3)), digA: DIG.map(f => sprite(f, { X: "#ffd23f" }, 3))
    };
    lienzoPant = document.createElement("canvas"); lienzoPant.width = PANT.w; lienzoPant.height = PANT.h;
    // velo del tubo: líneas de barrido, viñeta y un reflejo
    velo = document.createElement("canvas"); velo.width = PANT.w; velo.height = PANT.h;
    const v = velo.getContext("2d");
    v.fillStyle = "rgba(0,0,0,0.2)"; for (let y = 0; y < PANT.h; y += 3) v.fillRect(0, y, PANT.w, 1);
    const vi = v.createRadialGradient(60, 60, 30, 60, 60, 92); vi.addColorStop(0, "rgba(0,0,0,0)"); vi.addColorStop(1, "rgba(0,0,0,0.55)");
    v.fillStyle = vi; v.fillRect(0, 0, PANT.w, PANT.h);
    v.fillStyle = "rgba(255,255,255,0.07)"; v.beginPath(); v.moveTo(8, 0); v.lineTo(46, 0); v.lineTo(14, 120); v.lineTo(0, 120); v.lineTo(0, 30); v.closePath(); v.fill();
  }
  function marcador(h, n, x, y, amarillo) {
    const s = String(Math.max(0, Math.min(99999, n))).padStart(5, "0"), L = amarillo ? SPR.digA : SPR.dig;
    for (let i = 0; i < 5; i++) h.drawImage(L[+s[i]], x + i * 12, y);
  }
  function vidas(h, n, img, perder) {
    for (let i = 0; i < 3; i++) {
      let a = i < n ? 1 : 0;
      if (perder && i === n) a = perder;
      if (a <= 0.01) continue;
      h.globalAlpha *= a; h.drawImage(img, PANT.w - 4 - (i + 1) * 13, 6); h.globalAlpha /= a;
    }
  }
  // partida de Dari + fanfarria
  function partidaD(h, t) {
    const fr = Math.floor(t * 3) % 2, fx = Math.round(FX_D(t)), fy = Math.round(FY_D(t));
    const a0 = h.globalAlpha;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      const tm = MUERTE_D[c + "," + r], x = (fx + c * 6) * CEL, y = (fy + r * 5) * CEL;
      if (t < tm) h.drawImage(SPR.inv[fr][r], x, y);
      else if (t < tm + 0.22) { h.globalAlpha = a0 * (1 - fase(t, tm, tm + 0.22)); h.drawImage(SPR.boom, x, y - 2); h.globalAlpha = a0; }
    }
    h.fillStyle = "#ffffff";
    for (const d of DISP_D) if (t >= d.tf && t < d.t) h.fillRect(d.x * CEL + 1, Math.round(25 - (t - d.tf) * V_BALA) * CEL, 2, 8);
    h.drawImage(SPR.naveD, (Math.round(naveD(t)) - 2) * CEL, 26 * CEL);
    // fanfarria: arcoíris que corre, destello, copa que bota y chispitas
    const wk = tramo(t, T.gana, T.gana + 0.12) * (1 - tramo(t, T.atrae, T.atrae + 0.22));
    if (wk > 0.005) {
      h.globalAlpha = a0 * wk * lerp(0.6, 0.3, tramo(t, T.gana + 0.5, T.gana + 0.9));
      for (let r = 0; r < 30; r++) { const hue = ((r * 13 - (t - T.gana) * 420) % 360 + 360) % 360; h.fillStyle = `hsl(${hue.toFixed(0)},100%,55%)`; h.fillRect(0, r * 4, PANT.w, 4); }
      const fl = campana(t, T.gana - 0.03, T.gana + 0.16);
      if (fl > 0) { h.globalAlpha = a0 * 0.7 * fl; h.fillStyle = "#ffffff"; h.fillRect(0, 0, PANT.w, PANT.h); }
      const kc = salida(tramo(t, T.gana + 0.06, T.gana + 0.32)), bo = 4 * Math.abs(Math.sin((t - T.gana) * 7)) * (1 - tramo(t, T.gana + 0.8, T.atrae));
      if (kc > 0.01) { h.globalAlpha = a0 * wk; h.save(); h.translate(60, 66 - bo); h.scale(kc, kc); h.drawImage(SPR.copa, -22.5, -22.5); h.restore(); }
      for (let i = 0; i < 7; i++) {
        const ch = Math.max(0, Math.sin(t * 9 + i * 1.9)); if (ch < 0.05) continue;
        h.globalAlpha = a0 * wk * ch; h.drawImage(SPR.chispa, 14 + hash(i + 40) * 86, 28 + hash(i + 41) * 70);
      }
      h.globalAlpha = a0;
    }
  }
  // pantalla de espera: moneda que parpadea y una flecha
  function atraer(h, t) {
    const ka = tramo(t, T.atrae + 0.05, T.atrae + 0.25) * (1 - tramo(t, T.ola, T.ola + 0.08));
    if (ka <= 0.005) return;
    const a0 = h.globalAlpha, bl = 0.55 + 0.45 * Math.sin(2 * Math.PI * 1.8 * (t - T.atrae));
    h.globalAlpha = a0 * ka * bl; h.drawImage(SPR.moneda, 48, 38);
    h.globalAlpha = a0 * ka; h.drawImage(SPR.flecha, 50, 68 + 3 * Math.sin((t - T.atrae) * 7));
    h.globalAlpha = a0;
  }
  // partida de Guillermo
  function partidaG(h, t) {
    const a0 = h.globalAlpha, fr = Math.floor(t * 5) % 2, fx = Math.round(FX_G(t)), fy = Math.round(FY_G(t));
    for (let r = 0; r < 3; r++) {
      const ka = tramo(t, T.ola + r * 0.05, T.ola + r * 0.05 + 0.06); if (ka <= 0) continue;
      for (let c = 0; c < 4; c++) {
        const tm = MUERTE_G[c + "," + r], x = (fx + c * 6) * CEL, y = (fy + r * 5) * CEL;
        if (tm === undefined || t < tm) { h.globalAlpha = a0 * ka; h.drawImage(SPR.inv[fr][r], x, y); }
        else if (t < tm + 0.22) { h.globalAlpha = a0 * (1 - fase(t, tm, tm + 0.22)); h.drawImage(SPR.boom, x, y - 2); }
      }
    }
    h.globalAlpha = a0; h.fillStyle = "#ffffff";
    for (const b of BALAS_G) if (t >= b.tp && t < b.fin) h.fillRect(b.x * CEL + 1, Math.round(25 - (t - b.tp) * V_BALA) * CEL, 2, 8);
    // bombas en zigzag
    h.fillStyle = "#ff4a4a";
    for (const b of BOMBAS_G) if (t >= b.t0 && t < b.th) {
      const y = Math.round(lerp(b.y0, 25, (t - b.t0) / (b.th - b.t0))), z = Math.floor(t * 12) % 2;
      h.fillRect((b.x + z) * CEL - 1, y * CEL, 3, 4); h.fillRect((b.x + 1 - z) * CEL - 1, y * CEL + 4, 3, 4);
    }
    // la nave: explota con cada bomba, reaparece parpadeando
    let vis = tramo(t, T.ola + 0.12, T.ola + 0.2);
    for (const b of BOMBAS_G) {
      if (t >= b.th && t < b.th + 0.36) { vis = 0; const k = fase(t, b.th, b.th + 0.36); h.globalAlpha = a0 * (1 - k * k);
        h.save(); h.translate(Math.round(naveG(b.th)) * CEL + 2, 27 * CEL + 2); h.scale(1.3 + 0.6 * k, 1.3 + 0.6 * k); h.drawImage(SPR.boomG, -10, -10); h.restore(); h.globalAlpha = a0; }
      else if (t >= b.th + 0.36 && t < b.th + 0.85) vis = b === BOMBAS_G[2] ? 0 : 0.55 + 0.45 * Math.cos((t - b.th) * 40);
      else if (b === BOMBAS_G[2] && t >= b.th) vis = 0;
    }
    if (vis > 0.01) { h.globalAlpha = a0 * vis; h.drawImage(SPR.naveG, (Math.round(naveG(t)) - 2) * CEL, 26 * CEL); h.globalAlpha = a0; }
  }
  // fin de partida: calavera que parpadea en rojo
  function calavera(h, t, k) {
    const ph = t < T.chas ? 3 * (t - T.over) : 3 * (T.chas - T.over) + 1.6 * (t - T.chas);
    const b = 0.5 - 0.5 * Math.cos(2 * Math.PI * ph);
    h.save(); h.globalAlpha = k;
    h.fillStyle = mezclaCol("#04050c", "#8a0012", 0.85 * b); h.fillRect(0, 0, PANT.w, PANT.h);
    const sc = lerp(0.55, 1, salida(k)) * (1 + 0.04 * b);
    h.translate(60, 68); h.scale(sc, sc); h.drawImage(SPR.calav, -44, -44);
    h.globalAlpha = k * b; h.drawImage(SPR.calavRoja, -44, -44);
    h.restore();
  }
  function pintaPantalla(h, t) {
    h.globalAlpha = 1; h.fillStyle = "#04050c"; h.fillRect(0, 0, PANT.w, PANT.h);
    h.fillStyle = "rgba(170,190,255,0.5)";
    for (let i = 0; i < 18; i++) { const x = Math.floor(hash(i + 11) * 30) * 4, y = (hash(i + 37) * 120 + t * (6 + 10 * hash(i + 5))) % 120; h.fillRect(x + 1, Math.floor(y / 2) * 2, 2, 2); }
    const kOver = tramo(t, T.over, T.over + 0.12);
    if (kOver < 1) {
      h.globalAlpha = 1 - kOver;
      if (t < T.atrae + 0.25) partidaD(h, t);
      if (t >= T.atrae) atraer(h, t);
      if (t >= T.ola) partidaG(h, t);
      h.globalAlpha = 1;
    }
    if (kOver > 0) calavera(h, t, kOver);
    // marcador y vidas
    if (t < T.ola) {
      const bon = tramo(t, T.bonus0 - 0.1, T.bonus0) * (1 - tramo(t, T.bonus1 + 0.3, T.bonus1 + 0.5));
      marcador(h, puntosD(t), 3, 3, false);
      if (bon > 0.01) { h.globalAlpha = bon * (0.6 + 0.4 * Math.sin(t * 20)); marcador(h, puntosD(t), 3, 3, true); h.globalAlpha = 1; }
      h.globalAlpha = 1 - tramo(t, T.atrae, T.atrae + 0.2); vidas(h, 3, SPR.vidaD); h.globalAlpha = 1;
    } else {
      h.globalAlpha = tramo(t, T.ola, T.ola + 0.08); marcador(h, puntosG(t), 3, 3, false);
      let n = vidasG(t), pierde = 0;
      for (const b of BOMBAS_G) if (t >= b.th && t < b.th + 0.12) pierde = 1 - fase(t, b.th, b.th + 0.12);
      vidas(h, n, SPR.vidaG, pierde); h.globalAlpha = 1;
    }
  }

  /* =====================================================================================
   * CARAS
   * ===================================================================================== */
  const BASE = { c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, mof: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, mir, parp) {
    const pc = Math.max(e.c, parp);
    return { mirada: mir, iris: e.iris, espiral: 0,
      ojos: { d: pc, i: pc, feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  const CAM_G = { x: -0.85, y: -0.1 }, CAM_D = { x: -0.85, y: -0.05 };
  function miradaA(objetivo, cabeza, espejo) {
    const dx = (objetivo.x - cabeza.x) * (espejo ? -1 : 1), dy = objetivo.y - cabeza.y;
    return { x: clamp(dx / 110, -1, 1), y: clamp(dy / 80, -1, 1) };
  }
  function lineaMirada(guion, ctx, t) {
    let m = guion[0][2](ctx);
    for (const [t0, t1, f] of guion) { if (t <= t0) break; const n = f(ctx), k = suave(fase(t, t0, t1)); m = { x: lerp(m.x, n.x, k), y: lerp(m.y, n.y, k) }; }
    return m;
  }

  /* =====================================================================================
   * GUILLERMO (izquierda, en el lado del jugador 1)
   * ===================================================================================== */
  const XG = 300;
  const CARAS_G = {
    inicio: E({ c: 0.18, sd: 2, sonr: 0.1, ancho: 0.9 }),
    aburre: E({ c: 0.42, sd: -2, gd: -0.05, si: -2, gi: -0.05, sonr: -0.05, ancho: 0.75, mof: 0.2 }),
    asombro: E({ iris: 0.9, sd: 22, gd: 0.15, si: 22, gi: 0.15, abre: 18, ancho: 0.6, sonr: 0 }),
    boquiabierto: E({ iris: 0.78, sd: 30, gd: 0.22, si: 30, gi: 0.22, abre: 62, ancho: 0.8, sonr: -0.1, lengua: 0.4 }),
    deslumbra: E({ c: 0.75, z: 0.5, sd: -4, si: -4, abre: 12, ancho: 0.8, sonr: -0.2 }),
    pique: E({ c: 0.32, sd: -12, gd: -0.28, si: -12, gi: -0.28, abre: 0, ancho: 0.7, sonr: -0.35, mof: 0.25 }),
    reto: E({ c: 0.22, sd: 20, gd: 0.16, si: -10, gi: -0.26, abre: 4, ancho: 1.0, sonr: 0.7 }),
    estira: E({ c: 0.35, sd: -6, gd: -0.14, si: -6, gi: -0.14, abre: 0, ancho: 0.95, sonr: 0.5 }),
    chulo: E({ c: 0.1, h: 0.3, sd: 16, gd: 0.1, si: 16, gi: 0.1, abre: 22, ancho: 1.15, sonr: 0.95 }),
    foco: E({ c: 0.22, sd: -8, gd: -0.16, si: -8, gi: -0.16, abre: 9, ancho: 0.55, sonr: 0.05, lengua: 1 }),
    frenesi: E({ c: 0.12, iris: 1.1, sd: -14, gd: -0.3, si: -14, gi: -0.3, abre: 26, ancho: 0.9, sonr: 0.1, lengua: 1 }),
    ay: E({ c: 0.8, z: 0.6, sd: 10, gd: -0.2, si: 10, gi: -0.2, abre: 22, ancho: 1.1, sonr: -0.6 }),
    horror: E({ iris: 0.78, c: 0.1, sd: 22, gd: -0.25, si: 22, gi: -0.25, abre: 44, ancho: 1.15, sonr: -0.7, lengua: 0.2 }),
    furia: E({ c: 0.45, z: 0.45, sd: -16, gd: -0.32, si: -16, gi: -0.32, abre: 34, ancho: 1.3, sonr: -0.4 }),
    susto: E({ iris: 0.72, sd: 30, gd: 0.2, si: 30, gi: 0.2, abre: 34, ancho: 0.7, sonr: -0.2 }),
    mira: E({ iris: 0.85, sd: 20, gd: 0.12, si: 20, gi: 0.12, abre: 8, ancho: 0.42, sonr: -0.1 }),
    culpa: E({ c: 0.1, sd: 18, gd: -0.22, si: 18, gi: -0.22, abre: 3, ancho: 1.0, sonr: -0.45 }),
    disimula: E({ c: 0.3, sd: 10, gd: 0.05, si: 10, gi: 0.05, abre: 0, ancho: 0.7, sonr: 0.1 }),
    silba: E({ c: 0.25, sd: 14, gd: 0.08, si: 14, gi: 0.08, abre: 7, ancho: 0.3, sonr: 0, mof: 0.35 })
  };
  const GUION_CARA_G = [
    [T.gAburre, T.gAburre + 0.3, "aburre"], [T.gMira, T.gMira + 0.2, "asombro"], [T.gAlucina, T.gAlucina + 0.22, "boquiabierto"],
    [T.gana, T.gana + 0.08, "deslumbra"], [T.pique, T.pique + 0.2, "pique"], [T.reto, T.reto + 0.15, "reto"], [T.dedos0 + 0.05, T.dedos0 + 0.2, "estira"],
    [T.chulo, T.chulo + 0.12, "chulo"], [T.saca + 0.2, T.saca + 0.35, "foco"],
    [T.juego, T.juego + 0.1, "frenesi"], [T.golpe1, T.golpe1 + 0.05, "ay"], [T.golpe1 + 0.2, T.golpe1 + 0.3, "frenesi"],
    [T.golpe2, T.golpe2 + 0.05, "ay"], [T.golpe2 + 0.2, T.golpe2 + 0.3, "frenesi"], [T.golpe3, T.golpe3 + 0.05, "ay"],
    [T.over + 0.02, T.over + 0.14, "horror"], [T.agarra - 0.12, T.agarra + 0.08, "furia"], [T.chas, T.chas + 0.06, "susto"],
    [T.miraPalo, T.miraPalo + 0.25, "mira"], [T.camara, T.camara + 0.2, "culpa"], [T.pasa1 + 0.05, T.pasa1 + 0.3, "disimula"],
    [T.silba, T.silba + 0.25, "silba"]
  ];
  const CUERPOS_G = {
    quieto: { dx: 0, pel: 2, torso: 0, cab: 0 },
    aburrido: { dx: -2, pel: 4, torso: -0.04, cab: -0.04 },
    asombro: { dx: 4, pel: 10, torso: 0.1, cab: 0.08 },
    boquiabierto: { dx: 8, pel: 16, torso: 0.16, cab: 0.1 },
    flash: { dx: -4, pel: 6, torso: -0.07, cab: -0.1 },
    pique: { dx: 0, pel: 8, torso: 0.04, cab: 0.06 },
    reto: { dx: 0, pel: 6, torso: -0.04, cab: -0.06 },
    dedos: { dx: 2, pel: 10, torso: 0.02, cab: 0 },
    moneda: { dx: 6, pel: 22, torso: 0.15, cab: 0.08 },
    juega: { dx: 8, pel: 26, torso: 0.18, cab: 0.06 },
    pasmo: { dx: 4, pel: 14, torso: 0.08, cab: 0.02 },
    rabia: { dx: 6, pel: 30, torso: 0.16, cab: 0.1 },
    retro: { dx: -16, pel: 18, torso: -0.14, cab: -0.1 },
    mira: { dx: -10, pel: 10, torso: 0.0, cab: 0.12 },
    culpa: { dx: -10, pel: 8, torso: -0.02, cab: 0.02 },
    entrega: { dx: -10, pel: 8, torso: 0.0, cab: 0.06 },
    esconde: { dx: -10, pel: 4, torso: -0.06, cab: -0.04 },
    silba: { dx: -10, pel: 2, torso: -0.08, cab: -0.14 }
  };
  const GUION_CUERPO_G = [
    [T.gAburre, T.gAburre + 0.4, "aburrido"], [T.gMira, T.gMira + 0.35, "asombro"], [T.gAlucina, T.gAlucina + 0.3, "boquiabierto"],
    [T.gana, T.gana + 0.1, "flash", salida], [T.pique, T.pique + 0.3, "pique"], [T.reto, T.reto + 0.25, "reto"],
    [T.dedos0, T.dedos0 + 0.2, "dedos"], [T.chulo, T.chulo + 0.15, "reto"], [T.saca, T.saca + 0.25, "moneda"],
    [T.coge, T.juego, "juega"], [T.over, T.over + 0.12, "pasmo"], [T.agarra, T.agarra + 0.15, "rabia"],
    [T.chas, T.chas + 0.12, "retro", salida], [T.chas + 0.3, T.miraPalo + 0.3, "mira"], [T.camara, T.camara + 0.25, "culpa"],
    [T.pasa, T.pasa1, "entrega"], [T.pasa1 + 0.05, T.esconde1, "esconde"], [T.silba, T.silba + 0.4, "silba"]
  ];
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const PASOS_G = {
    cerca: [[-10, -9, XG - 40], [T.chas + 0.02, T.chas + 0.2, XG - 58]],
    lejos: [[-10, -9, XG + 34], [T.chas + 0.1, T.chas + 0.3, XG + 20]]
  };
  const SALTOS_G = [6.12, 7.12, 7.93];
  function pieX(L, t) {
    let i = 0; while (i + 1 < L.length && t >= L[i + 1][0]) i++;
    const [t0, t1, x] = L[i], xa = i > 0 ? L[i - 1][2] : x, u = fase(t, t0, t1);
    return { x: lerp(xa, x, suave(u)), alto: Math.sin(Math.PI * u) * (u > 0 && u < 1 ? 1 : 0) };
  }
  const frenesi = t => tramo(t, T.juego, T.juego + 0.15) * (1 - tramo(t, T.over - 0.05, T.over + 0.08));
  function saltoG(t) {
    let h = 0;
    for (const tj of SALTOS_G) { const k = fase(t, tj, tj + 0.32); if (k > 0 && k < 1) h = Math.max(h, 26 * Math.sin(Math.PI * k)); }
    return h + 5 * Math.abs(Math.sin((t - T.juego) * Math.PI * 3.2)) * frenesi(t);
  }
  const PARP_G = [0.9, 2.0, 3.3, 4.36, 5.45, 9.05, 10.62, 11.28, 12.2, 13.4];
  const R_MG = G.MUNECA_R * G.JK;
  const punoDesdeG = (m, mu) => ({ x: m.x - Math.cos(mu) * R_MG, y: m.y - Math.sin(mu) * R_MG });
  const BOLS_GC = punoDesdeG({ x: 131, y: 652 }, -1.75), BOLS_GL = punoDesdeG({ x: 372, y: 648 }, -1.75);
  const ESPALDA_G = { x: 122, y: 596 };            // detrás de la espalda (hoja)

  function poseBaseG(t) {
    const b = linea(GUION_CUERPO_G, CUERPOS_G, "quieto", t);
    const respira = Math.sin(t * 2.4), fr = frenesi(t);
    const sac = tramo(t, T.sacude0 - 0.05, T.sacude0 + 0.1) * (1 - tramo(t, T.chas, T.chas + 0.04));
    const osc = Math.sin((t - T.sacude0) * W_SAC + 0.35);
    const h = saltoG(t) / S, silba = tramo(t, T.silba, T.silba + 0.4), ms = Math.sin((t - T.silba) * 4.2);
    const p = {
      x: XG + b.dx + 2.5 * ruido(t * 9) * fr - 4 * osc * sac, suelo: SUELO, s: S, tirasLimpias: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.3 - h + 6 * Math.abs(ms) * silba },
      torso: b.torso + 0.05 * Math.sin(t * 31) * fr - 0.07 * osc * sac + 0.03 * ms * silba,
      torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.05 * Math.sin(t * 27 + 1) * fr + 0.04 * ruido(t * 20) * sac + 0.04 * Math.sin((t - T.silba) * 4.2 + 0.6) * silba, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    for (const lado of ["cerca", "lejos"]) {
      const f = pieX(PASOS_G[lado], t);
      p.piernas[lado] = { tob: { x: G.PELVIS.x + (f.x - p.x) / S, y: TOB_G[lado] - 30 * f.alto - h }, ang: -0.15 * f.alto - 0.22 * clamp(h * S / 26) };
    }
    return p;
  }
  function ctxG(t, p) {
    const Tr = G.tronco(p), aP = q => G.aPantalla(p, q);
    return { t, p, Tr, aP, hc: aP(Tr(G.HOMBRO_C)), hl: aP(Tr(G.HOMBRO)) };
  }
  const muHacia = (desde, hacia, base = -1.75, k = 0.65) => Math.atan2(hacia.y - desde.y, hacia.x - desde.x) * k + base * (1 - k);
  const MANO_GL = {
    bolsillo: c => { const q = c.aP(c.Tr(BOLS_GL)); return { x: q.x, y: q.y, ang: 0, mu: -1.75, puno: 0, dedos: PUNO }; },
    dedos: c => ({ x: c.hl.x - 8, y: c.hl.y + 52, ang: 0, mu: -0.9, puno: 1, dedos: D(0.8, 0.95, 0.92, 0.88) }),
    moneda: c => ({ x: c.hl.x + 20, y: c.hl.y + 64, ang: 0, mu: -2.0, puno: 1, dedos: PINZA, moneda: 1 }),
    ranura: c => ({ x: c.ranura.x + 2, y: c.ranura.y - 15, ang: 0, mu: -1.5, puno: 1, dedos: PINZA, moneda: c.t < T.clin ? 1 : 0 }),
    palanca: c => { const m = c.pomo.mano; return { x: m.x, y: m.y, ang: 0, mu: muHacia(m, c.hl), puno: 1, dedos: PUNO }; },
    alto: c => ({ x: c.boton.x - 2, y: c.boton.y - 40, ang: 0, mu: -1.9, puno: 1, dedos: PUNO }),
    aporrea: c => ({ x: c.boton.x, y: c.boton.y - 11 - 26 * rebotaBoton(c.t), ang: 0, mu: -1.8, puno: 1, dedos: PUNO }),
    arranca: c => ({ x: c.hl.x + 30, y: c.hl.y + 8, ang: 0, mu: -2.9, puno: 1, dedos: PUNO }),
    palo: c => ({ x: c.hl.x + 30, y: c.hl.y + 34, ang: 0, mu: -2.55, puno: 1, dedos: PUNO }),
    entrega: c => ({ x: c.hl.x - 16, y: c.hl.y + 52, ang: 0, mu: -2.2, puno: 1, dedos: PUNO })
  };
  const MANO_GC = {
    bolsillo: c => { const q = c.aP(c.Tr(BOLS_GC)); return { x: q.x, y: q.y, ang: 0, mu: -1.75, puno: 0, dedos: PUNO }; },
    dedos: c => ({ x: c.hl.x - 22, y: c.hl.y + 57, ang: 0, mu: -2.3, puno: 1, dedos: D(0.8, 0.95, 0.92, 0.88) }),
    listo: c => ({ x: c.hc.x + 46, y: c.hc.y + 58, ang: 0, mu: -1.5, puno: 1, dedos: PUNO }),
    bombeo: c => { const k = 0.5 - 0.5 * Math.cos((c.t - T.juego) * 2 * Math.PI * 3.3); return { x: c.hc.x + 50 + 10 * k, y: c.hc.y + 30 + 26 * k, ang: 0, mu: lerp(-2.4, -1.9, k), puno: 1, dedos: PUNO }; },
    abierta: c => ({ x: c.hc.x + 34, y: c.hc.y + 62, ang: 0, mu: -1.6, puno: 1, dedos: ABIERTA }),
    rabia: c => ({ x: c.hc.x + 40 + 3 * ruido(c.t * 40), y: c.hc.y + 40 + 3 * ruido(c.t * 43 + 2), ang: 0, mu: -2.0, puno: 1, dedos: PUNO }),
    cuelga: c => ({ x: c.hc.x + 8, y: c.hc.y + 96, ang: 0, mu: -1.62, puno: 1, dedos: FLOJA }),
    coge: c => { const q = c.manoL, d = c.dirPalo; return { x: q.x + d.x * 16, y: q.y + d.y * 16, ang: 0, mu: -1.4, puno: 1, dedos: PUNO }; },
    espalda: c => { const q = c.aP(c.Tr(ESPALDA_G)); return { x: q.x, y: q.y, ang: 0, mu: -1.6, puno: 1, dedos: PUNO }; }
  };
  const GUION_GL = [
    [T.dedos0, T.dedos0 + 0.2, "dedos"], [T.chulo + 0.05, T.saca, "bolsillo"], [T.saca, T.saca + 0.16, "moneda"], [T.saca + 0.16, T.mete, "ranura"],
    [T.clin + 0.03, T.coge, "palanca"],
    [6.5, 6.57, "alto"], [6.57, 6.6, "aporrea", entrada], [6.9, 6.98, "palanca"],
    [7.5, 7.56, "alto"], [7.56, 7.6, "aporrea", entrada], [7.76, 7.86, "palanca"],
    [8.25, 8.3, "alto"], [8.3, 8.33, "aporrea", entrada],
    [T.agarra - 0.14, T.agarra, "palanca"],
    [T.chas, T.chas + 0.1, "arranca", salida], [T.chas + 0.2, T.miraPalo, "palo"],
    [T.pasa, T.pasa1, "entrega"], [T.pasa1 + 0.05, T.pasa1 + 0.5, "bolsillo"]
  ];
  const GUION_GC = [
    [T.dedos0, T.dedos0 + 0.22, "dedos"], [T.chulo + 0.05, T.saca + 0.1, "listo"], [T.juego, T.juego + 0.12, "bombeo"],
    [T.over, T.over + 0.1, "abierta"], [T.agarra - 0.1, T.agarra + 0.05, "rabia"], [T.chas, T.chas + 0.1, "abierta", salida],
    [T.chas + 0.35, T.miraPalo + 0.3, "cuelga"], [T.pasa + 0.05, T.pasa1, "coge"], [T.pasa1 + 0.05, T.esconde1, "espalda"]
  ];
  const GUION_MIRA_G = [
    [0, 0.01, c => miradaA(PANT_C, c.cabC, false)],
    [T.pique, T.pique + 0.15, c => miradaA(c.dari, c.cabC, false)], [T.reto, T.reto + 0.12, c => CAM_G],
    [T.dedos0 + 0.1, T.dedos0 + 0.25, c => miradaA(PANT_C, c.cabC, false)], [T.chulo, T.chulo + 0.1, c => CAM_G],
    [T.saca + 0.1, T.saca + 0.25, c => miradaA(c.ranura, c.cabC, false)], [T.clin + 0.05, T.clin + 0.2, c => miradaA(PANT_C, c.cabC, false)],
    [T.chas + 0.04, T.chas + 0.14, c => miradaA(c.palo, c.cabC, false)], [T.camara, T.camara + 0.15, c => CAM_G],
    [T.aDari, T.aDari + 0.12, c => miradaA(c.dari, c.cabC, false)], [T.pasa + 0.05, T.pasa + 0.2, c => CAM_G],
    [T.silba, T.silba + 0.35, c => ({ x: -0.35, y: -0.95 })]
  ];
  // la palanca arrancada: ángulo del palo (de la bola hacia el extremo roto)
  let A0_PALO = null;
  function anguloPaloL(t) {
    if (A0_PALO === null) { const k = agarre(STICK1, palanca1(T.chas - 1e-4), T.chas - 1e-4); A0_PALO = Math.atan2(k.d.y, k.d.x); }
    const a = lerp(A0_PALO, Math.PI / 2, salida(tramo(t, T.chas, T.chas + 0.35)));
    return lerp(a, 2.3, suave(fase(t, T.pasa, T.pasa1)));
  }
  const anguloPaloC = t => lerp(2.3, -0.64, suave(fase(t, T.pasa1 + 0.05, T.esconde1)));   // la bola acaba asomando por detrás, junto al culo
  // el puño se corre de la bola al eje para enseñarla (agarre: distancia de la bola al centro del puño)
  const agarreL = t => lerp(7, 20, suave(fase(t, T.chas + 0.05, T.chas + 0.3)));
  const AGARRE_C = 36;
  const OCULTA = [12.3, 12.46];                  // la parte que queda delante del cuerpo se va por detrás

  function poseG(t) {
    const p = poseBaseG(t), c = ctxG(t, p);
    c.pomo = agarre(STICK1, palanca1(t), t);
    c.boton = enMaq(BOT1[0], t); c.boton.y += 3 * hundidoG(t);
    c.ranura = enMaq(RANURA, t);
    c.cabC = G.aPantalla(p, G.centroCabeza(p));
    const pd = poseBaseD(t); c.dari = Da.aPantalla(pd, Da.centroCabeza(pd));
    c.palo = { x: c.hl.x + 30, y: c.hl.y + 14 };
    const e = linea(GUION_CARA_G, CARAS_G, "inicio", t);
    p.cara = cara(e, lineaMirada(GUION_MIRA_G, c, t), parpadeo(t, PARP_G));
    const fr = frenesi(t);
    p.rojo = Math.max(0.45 * tramo(t, T.juego + 0.3, T.juego + 1.2) * (1 - tramo(t, T.over, T.over + 0.3)),
      0.85 * tramo(t, T.over + 0.2, T.agarra + 0.2) * (1 - tramo(t, T.chas + 0.2, T.miraPalo + 0.6)),
      0.35 * tramo(t, T.camara, T.camara + 0.3) * (1 - tramo(t, T.silba, T.silba + 0.6)));
    p.cara.rubor = 0.45 * tramo(t, T.camara, T.camara + 0.3) * (1 - tramo(t, T.silba + 0.3, T.silba + 0.8));
    p.enfado = tramo(t, T.over + 0.3, T.agarra) * (1 - tramo(t, T.chas + 0.1, T.chas + 0.4));
    p.sudor = Math.max(tramo(t, 6.4, 7.0) * (1 - tramo(t, T.chas + 0.4, T.miraPalo + 0.8)), 0.6 * tramo(t, T.camara, T.camara + 0.4));
    // manos
    const l = lineaM(GUION_GL, MANO_GL, "bolsillo", c, t);
    const aD = anguloPaloL(t); c.manoL = l; c.dirPalo = { x: Math.cos(aD), y: Math.sin(aD) };
    const n = lineaM(GUION_GC, MANO_GC, "bolsillo", c, t);
    // se frota las manos antes de jugar
    const me = tramo(t, T.dedos0 + 0.18, T.dedos0 + 0.26) * (1 - tramo(t, T.dedos1 - 0.06, T.dedos1));
    if (me > 0) { const fr_ = Math.sin(t * 30); l.y += 5 * me * fr_; l.x += 2 * me * fr_; n.y -= 5 * me * fr_; n.x -= 2 * me * fr_; }
    const ql = G.aHoja(p, l), qn = G.aHoja(p, n);
    p.manoLejos = { x: ql.x, y: ql.y, ang: l.ang, mu: l.mu, puno: l.puno, dobla: -1, dedos: l.dedos };
    p.manoCerca = { x: qn.x, y: qn.y, ang: n.ang, mu: n.mu, puno: n.puno, dobla: -1, dedos: n.dedos };
    if (l.moneda > 0.01) {
      const km = l.moneda, mu = l.mu;
      p.manoLejos.objeto = gg => { const f = { x: -Math.cos(mu) * 19, y: -Math.sin(mu) * 19 }, th = { x: -Math.sin(mu) * 5, y: Math.cos(mu) * 5 };
        moneda(gg, f.x + th.x, f.y + th.y, km * 1.5, 0.9); };
    }
    // la palanca arrancada, primero en la mano lejana y luego en la cercana
    p._palo = null;
    if (t >= T.chas) {
      if (t < T.pasa1) {
        const d = c.dirPalo, gL = agarreL(t), bola = { x: l.x - d.x * gL, y: l.y - d.y * gL };
        p._palo = { bola, u: d, detras: false };
        p.manoLejos.objeto = gg => enPantalla(gg, h => dibPalo(h, bola, d, 1, t));
      } else {
        const aN = anguloPaloC(t), u = { x: Math.cos(aN), y: Math.sin(aN) }, bola = { x: n.x - u.x * AGARRE_C, y: n.y - u.y * AGARRE_C };
        const encima = 1 - tramo(t, OCULTA[0], OCULTA[1]);
        p._palo = { bola, u, detras: true };
        p._oculta = 1 - encima;
        if (encima > 0.01) p.manoCerca.objeto = gg => enPantalla(gg, h => dibPalo(h, bola, u, encima, t));
      }
    }
    p._l = l; p._n = n; p._boca = G.aPantalla(p, G.boca(p)); p._cab = c.cabC; p._fr = fr;
    return p;
  }

  /* =====================================================================================
   * DARI (derecha, en espejo, en el lado del jugador 2)
   * ===================================================================================== */
  const XD = 720;
  const CARAS_D = {
    juega: E({ c: 0.34, sd: 2, si: 4, sonr: 0.25, ancho: 0.8 }),
    gana: E({ c: 0.3, h: 0.3, sd: 4, si: 10, gi: 0.08, sonr: 0.5, ancho: 0.9 }),
    gafas: E({ c: 0.18, si: 10, gi: 0.1, sonr: 0.42, ancho: 0.85 }),
    cede: E({ c: 0.25, sd: 6, si: 12, gi: 0.1, sonr: 0.35, ancho: 0.85 }),
    mira: E({ c: 0.3, sd: 2, si: 6, sonr: 0.15, ancho: 0.8 }),
    ceja: E({ c: 0.3, sd: 0, si: 18, gi: 0.15, sonr: 0.1, ancho: 0.75 }),
    mueca: E({ c: 0.6, z: 0.3, sd: 8, gd: -0.15, si: 8, gi: -0.15, abre: 6, ancho: 0.9, sonr: -0.25 }),
    plano: E({ c: 0.46, sd: -2, si: -2, sonr: 0, ancho: 0.7 }),
    alarma: E({ iris: 0.85, sd: 18, gd: 0.12, si: 18, gi: 0.12, abre: 10, ancho: 0.6, sonr: -0.1 }),
    final: E({ c: 0.34, sd: -4, gd: -0.06, si: 26, gi: 0.22, sonr: 0.12, ancho: 0.75 })
  };
  const GUION_CARA_D = [
    [T.gana, T.gana + 0.2, "gana"], [T.dGafas, T.dGafas + 0.2, "gafas"], [T.dGafas1, T.dGafas1 + 0.2, "gana"], [T.dCede, T.dCede + 0.2, "cede"],
    [T.dCede1, T.dCede1 + 0.2, "mira"], [T.golpe1, T.golpe1 + 0.06, "mueca"], [T.golpe1 + 0.25, T.golpe1 + 0.45, "ceja"],
    [T.golpe2, T.golpe2 + 0.06, "mueca"], [T.golpe2 + 0.22, T.golpe2 + 0.4, "ceja"], [T.golpe3, T.golpe3 + 0.06, "mueca"],
    [T.over + 0.15, T.over + 0.4, "plano"], [T.sacude0, T.sacude0 + 0.2, "alarma"], [T.miraPalo + 0.3, T.miraPalo + 0.6, "plano"],
    [T.ceja, T.ceja + 0.6, "final"]
  ];
  const CUERPOS_D = {
    juega: { dx: 0, pel: 10, torso: 0.12, cab: 0.1 },
    gana: { dx: 0, pel: 6, torso: 0.02, cab: 0.0 },
    gafas: { dx: 0, pel: 4, torso: -0.02, cab: -0.04 },
    cede: { dx: 13, pel: 6, torso: 0.04, cab: 0.04 },
    mira: { dx: 13, pel: 4, torso: -0.02, cab: 0.03 },
    atras: { dx: 13, pel: 4, torso: -0.07, cab: -0.05 },
    final: { dx: 13, pel: 4, torso: -0.03, cab: 0.02 }
  };
  const GUION_CUERPO_D = [
    [T.dSuelta, T.dSuelta + 0.3, "gana"], [T.dGafas, T.dGafas + 0.3, "gafas"], [T.dCede - 0.05, T.dCede + 0.35, "cede"],
    [T.dCede1, T.dCede1 + 0.3, "mira"], [T.sacude0, T.sacude0 + 0.3, "atras"], [T.miraPalo + 0.3, T.miraPalo + 0.8, "final"]
  ];
  const TOB_D = Da.SUELO - Da.TOBILLO_ALTO;
  const PASOS_D = {
    cerca: [[-10, -9, XD + 27], [T.dCede - 0.02, T.dCede + 0.18, XD + 40]],
    lejos: [[-10, -9, XD - 29], [T.dCede + 0.08, T.dCede + 0.28, XD - 16]]
  };
  const PARP_D = [0.7, 1.9, 2.95, 4.75, 5.8, 6.6, 7.95, 9.6, 11.1, 12.4, 13.7];
  const PATILLA = { x: 716, y: 494 };         // esquina de fuera del cristal cercano (retrato): ahí empuja con el índice
  function poseBaseD(t) {
    const b = linea(GUION_CUERPO_D, CUERPOS_D, "juega", t);
    const respira = Math.sin(t * 1.9 + 1.4);
    const sus = t >= T.chas ? Math.exp(-(t - T.chas) * 6) * tramo(t, T.chas, T.chas + 0.05) : 0;
    const p = {
      x: XD + b.dx + 6 * sus, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: Da.PELVIS.x, y: Da.PELVIS.y + b.pel + respira * 1.1 },
      torso: b.torso - 0.08 * sus + 0.01 * Math.sin(t * 0.9), torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab - 0.06 * sus + 0.015 * Math.sin(t * 1.3), dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    for (const lado of ["cerca", "lejos"]) {
      const f = pieX(PASOS_D[lado], t);
      p.piernas[lado] = { tob: { x: Da.aHoja(p, { x: f.x, y: 0 }).x, y: (lado === "lejos" ? TOB_D - 10 : TOB_D) - 26 * f.alto }, ang: -0.12 * f.alto };
    }
    return p;
  }
  // gafas: se escurren mientras juega, se las sube; con el crac saltan y quedan torcidas hasta el final
  function gafasD(t) {
    let dy = 5 * tramo(t, 0.3, 2.8) * (1 - tramo(t, T.dEmpuja, T.dEmpuja + 0.1)), ang = 0;
    const u = t - T.chas;
    if (u > 0) {
      const fija = 1 - tramo(t, T.dEmpuja2, T.dEmpuja2 + 0.1), cae = tramo(t, T.chas + 0.08, T.chas + 0.3, salida);
      dy += -10 * campana(t, T.chas, T.chas + 0.2) + 8 * cae * fija; ang += 0.07 * cae * fija;
    }
    return { dx: 0, dy, ang };
  }
  const brilloD = t => Math.max(1.15 * campana(t, T.dEmpuja + 0.02, T.dEmpuja + 0.45), 1.25 * campana(t, T.dEmpuja2 + 0.02, T.dEmpuja2 + 0.5));
  function ctxD(t, p) {
    const Tr = Da.tronco(p), aP = q => Da.aPantalla(p, q);
    return { t, p, Tr, aP, hl: aP(Tr(Da.HOMBRO)), hc: aP(Tr(Da.HOMBRO_C)), H: Da.cabeza(p) };
  }
  // ángulo de la muñeca para Dari (en su hoja, que está en espejo)
  const muD = (desde, hacia, k = 0.65) => envolver(Math.PI - (Math.atan2(hacia.y - desde.y, hacia.x - desde.x) * k - 1.39 * (1 - k)));
  const MANO_DL = {
    bolsillo: c => { const q = c.aP(Da.manoReposo(c.p, "lejos")); return { x: q.x, y: q.y, ang: 0, mu: -1.75, puno: 0, dedos: SUAVE }; },
    palanca: c => { const m = c.pomo.mano; return { x: m.x, y: m.y, ang: 0, mu: muD(m, c.hl), puno: 1, dedos: PUNO }; },
    suelta: c => { const m = c.pomo.mano; return { x: m.x + 6, y: m.y - 16, ang: 0, mu: -2.0, puno: 1, dedos: D(0.6, 0.7, 0.65, 0.6) }; },
    cede: c => ({ x: c.hl.x - 58, y: c.hl.y + 10, ang: 0, mu: -3.05, puno: 1, dedos: PALMA })
  };
  const MANO_DC = {
    bolsillo: c => { const q = c.aP(Da.manoReposo(c.p, "cerca")); return { x: q.x, y: q.y, ang: 0, mu: -1.75, puno: 0, dedos: SUAVE }; },
    gafas: c => { const q = c.aP(c.H.a({ x: PATILLA.x, y: PATILLA.y + c.gafas.dy })); return { x: q.x, y: q.y + 14, ang: 0, mu: 2.0, puno: 1, dedos: GAFAS_D }; },
    empuja: c => { const q = c.aP(c.H.a({ x: PATILLA.x, y: PATILLA.y + c.gafas.dy })); return { x: q.x, y: q.y + 9, ang: 0, mu: 2.0, puno: 1, dedos: GAFAS_D }; }
  };
  const GUION_DL = [
    [T.dSuelta, T.dSuelta + 0.12, "suelta", salida], [T.dSuelta + 0.15, T.dSuelta + 0.5, "bolsillo"],
    [T.dCede, T.dCede + 0.3, "cede"], [T.dCede1, T.dCede1 + 0.35, "bolsillo"]
  ];
  const GUION_DC = [
    [T.dGafas, T.dEmpuja - 0.03, "gafas"], [T.dEmpuja, T.dEmpuja + 0.1, "empuja"], [T.dGafas1, T.dGafas1 + 0.35, "bolsillo"],
    [T.dGafas2, T.dEmpuja2 - 0.03, "gafas"], [T.dEmpuja2, T.dEmpuja2 + 0.1, "empuja"], [T.dGafas3, T.dGafas3 + 0.35, "bolsillo"]
  ];
  const GUION_MIRA_D = [
    [0, 0.01, c => miradaA(PANT_C, c.cabC, true)],
    [T.dSuelta + 0.1, T.dSuelta + 0.25, c => CAM_D], [T.dGafas1 - 0.05, T.dGafas1 + 0.1, c => miradaA(c.guille, c.cabC, true)],
    [T.dCede1 + 0.1, T.dCede1 + 0.25, c => miradaA(PANT_C, c.cabC, true)],
    [6.3, 6.42, c => miradaA(c.guille, c.cabC, true)], [6.75, 6.85, c => miradaA(PANT_C, c.cabC, true)],
    [7.25, 7.37, c => miradaA(c.guille, c.cabC, true)], [7.65, 7.75, c => miradaA(PANT_C, c.cabC, true)],
    [T.sacude0, T.sacude0 + 0.12, c => miradaA(c.palanca, c.cabC, true)], [T.chas + 0.05, T.chas + 0.15, c => miradaA(c.palo, c.cabC, true)],
    [T.miraPalo + 0.4, T.miraPalo + 0.6, c => miradaA(c.guille, c.cabC, true)], [T.dMiraTope, T.dMiraTope + 0.15, c => miradaA(c.tope, c.cabC, true)],
    [T.ceja - 0.08, T.ceja + 0.12, c => miradaA(c.espalda, c.cabC, true)], [T.dEmpuja2 + 0.05, T.dEmpuja2 + 0.2, c => CAM_D]
  ];
  function poseD(t) {
    const p = poseBaseD(t), c = ctxD(t, p);
    c.pomo = agarre(STICK2, palanca2(t), t);
    c.gafas = gafasD(t); p.gafas = c.gafas;
    c.cabC = Da.aPantalla(p, Da.centroCabeza(p));
    const pg = poseBaseG(t); c.guille = G.aPantalla(pg, G.centroCabeza(pg));
    c.palanca = enMaq({ x: STICK1.x, y: STICK1.y - LARGO }, t);
    const cg = ctxG(t, pg); c.palo = { x: cg.hl.x + 30, y: cg.hl.y + 14 };
    c.tope = enMaq(STICK1, t); c.espalda = G.aPantalla(pg, G.tronco(pg)({ x: 20, y: 680 }));
    const e = linea(GUION_CARA_D, CARAS_D, "juega", t);
    p.cara = cara(e, lineaMirada(GUION_MIRA_D, c, t), parpadeo(t, PARP_D, 0.13));
    const kb = brilloD(t), gf = c.gafas;
    p.capaCabeza = g => brillo(g, t, kb, gf.dy, gf.ang);
    const l = lineaM(GUION_DL, MANO_DL, "palanca", c, t), n = lineaM(GUION_DC, MANO_DC, "bolsillo", c, t);
    // toquecitos de dedo en la palanca mientras juega
    const ql = Da.aHoja(p, l), qn = Da.aHoja(p, n);
    p.manoLejos = { x: ql.x, y: ql.y, ang: l.ang, mu: l.mu, puno: l.puno, dobla: 1, dedos: l.dedos };
    p.manoCerca = { x: qn.x, y: qn.y, ang: n.ang, mu: n.mu, puno: n.puno, dobla: -1, dedos: n.dedos };
    return p;
  }
  const pose = t => ({ g: poseG(t), d: poseD(t) });

  /* ---------- destello en las gafas de Dari (coordenadas del retrato, encima de las gafas) ---------- */
  const ARO_D = [[729, 474], [744, 471], [789, 478], [833, 496], [858, 509], [861, 517], [849, 545], [837, 569], [823, 579], [789, 575], [745, 561], [734, 553], [729, 530]];
  function brillo(g, t, k, dy, ang) {
    if (k <= 0.01) return;
    g.save(); g.translate(884, 540 + dy); g.rotate(ang); g.translate(-884, -540); g.lineJoin = "round";
    g.save(); g.beginPath(); g.moveTo(ARO_D[0][0], ARO_D[0][1]); for (const [x, y] of ARO_D.slice(1)) g.lineTo(x, y); g.closePath(); g.clip();
    g.globalAlpha = 0.85 * clamp(k); g.fillStyle = "#ffffff"; g.fillRect(720, 460, 150, 130);
    g.globalAlpha = 0.9 * clamp(k); g.strokeStyle = "#dff0ff"; g.lineWidth = 16; g.beginPath(); g.moveTo(752, 572); g.lineTo(800, 474); g.stroke();
    g.restore();
    const r = 95 * k, cx = 828, cy = 498, a = 0.3 + t * 1.5;
    g.globalAlpha = clamp(k);
    const halo = g.createRadialGradient(cx, cy, 2, cx, cy, r * 0.7); halo.addColorStop(0, "rgba(255,255,255,0.9)"); halo.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = halo; g.beginPath(); g.arc(cx, cy, r * 0.7, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath();
    for (let i = 0; i < 8; i++) { const rr_ = i % 2 ? r * 0.12 : (i % 4 === 0 ? r : r * 0.62), an = a + i * Math.PI / 4; g.lineTo(cx + Math.cos(an) * rr_, cy + Math.sin(an) * rr_); }
    g.closePath(); g.fill();
    g.restore();
  }

  /* =====================================================================================
   * OBJETOS: moneda, palanca (en la consola y arrancada), notas musicales
   * ===================================================================================== */
  const CM = { cuerpo: "#1d2150", cuerpoLuz: "#2f3680", lado: "#121433", negro: "#0d0d14", rojo: "#e2382d", rojoOsc: "#9a1d18",
    naranja: "#ff8a2a", amarillo: "#ffd23f", cromo: "#d4dbe3", cromoOsc: "#8a95a3", bisel: "#23232c", magenta: "#ff4fb8" };
  function moneda(g, x, y, k, giro) {
    if (k <= 0.01) return;
    const w = (6 * Math.abs(Math.cos(giro)) + 1.2) * k, h = 6 * k;
    g.save(); g.fillStyle = "#f7c63a"; g.strokeStyle = "#5a3b00"; g.lineWidth = 1.3;
    g.beginPath(); g.ellipse(x, y, w, h, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#fff3b0"; g.beginPath(); g.ellipse(x - w * 0.3, y - h * 0.3, w * 0.3, h * 0.25, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function bola(g, x, y, r, c1, c2) {
    const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.4, 1, x, y, r * 1.1); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.75)"; g.beginPath(); g.ellipse(x - r * 0.38, y - r * 0.42, r * 0.28, r * 0.17, -0.6, 0, Math.PI * 2); g.fill();
  }
  // palanca en la consola (antes del crac): eje cromado y bola
  function dibPalanca(g, base, bolaP, c1, c2) {
    g.save(); g.lineCap = "round";
    g.strokeStyle = TINTA; g.lineWidth = 6.5; g.beginPath(); g.moveTo(base.x, base.y); g.lineTo(bolaP.x, bolaP.y); g.stroke();
    g.strokeStyle = CM.cromo; g.lineWidth = 3.6; g.stroke();
    bola(g, bolaP.x, bolaP.y, R_BOLA, c1, c2);
    g.restore();
  }
  // la palanca arrancada: bola, eje partido con astillas y dos cables colgando
  function dibPalo(g, b, u, alfa, t) {
    if (alfa <= 0.01) return;
    g.save(); g.globalAlpha *= alfa; g.lineCap = "round"; g.lineJoin = "round";
    const L = 40, f = { x: b.x + u.x * L, y: b.y + u.y * L }, n = { x: -u.y, y: u.x };
    // cables
    const cuelga = (col, s, dl) => {
      const m = { x: f.x + u.x * 5 + n.x * s * 3, y: f.y + u.y * 5 + n.y * s * 3 + 5 }, e = { x: f.x + u.x * 4 + n.x * s * 5 + 1.5 * Math.sin(t * 6 + s), y: f.y + u.y * 4 + n.y * s * 5 + 9 + dl };
      g.strokeStyle = TINTA; g.lineWidth = 3.2; g.beginPath(); g.moveTo(f.x, f.y); g.quadraticCurveTo(m.x, m.y, e.x, e.y); g.stroke();
      g.strokeStyle = col; g.lineWidth = 1.6; g.stroke();
    };
    cuelga("#ff4a3a", 1, 0); cuelga("#ffd23f", -1, 3);
    g.strokeStyle = TINTA; g.lineWidth = 6.5; g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(f.x, f.y); g.stroke();
    g.strokeStyle = CM.cromo; g.lineWidth = 3.6; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 1; g.beginPath(); g.moveTo(b.x + n.x, b.y + n.y); g.lineTo(f.x + n.x, f.y + n.y); g.stroke();
    // astillas del extremo
    g.fillStyle = CM.cromoOsc; g.strokeStyle = TINTA; g.lineWidth = 1.3; g.beginPath();
    g.moveTo(f.x + n.x * 2.6, f.y + n.y * 2.6); g.lineTo(f.x + u.x * 4 + n.x * 1.6, f.y + u.y * 4 + n.y * 1.6); g.lineTo(f.x + u.x * 1.5, f.y + u.y * 1.5);
    g.lineTo(f.x + u.x * 5 - n.x * 1.4, f.y + u.y * 5 - n.y * 1.4); g.lineTo(f.x - n.x * 2.6, f.y - n.y * 2.6); g.closePath(); g.fill(); g.stroke();
    bola(g, b.x, b.y, R_BOLA, "#ff9a8a", "#c8141f");
    g.restore();
  }
  // muñón que queda en la consola, con el muelle botando
  function dibMunon(g, base, t) {
    const u = t - T.chas, u2 = t - T.dMiraTope;
    let amp = 6 * Math.exp(-u * 3) * Math.sin(u * 2 * Math.PI * 5), ang = 0.35 * Math.exp(-u * 3.2) * Math.sin(u * 2 * Math.PI * 3);
    if (u2 > 0) { amp += 3 * Math.exp(-u2 * 4) * Math.sin(u2 * 2 * Math.PI * 5); ang += 0.2 * Math.exp(-u2 * 4) * Math.sin(u2 * 2 * Math.PI * 3); }
    const L = 15 + amp;
    g.save(); g.translate(base.x, base.y); g.lineCap = "round"; g.lineJoin = "round";
    // muelle
    g.save(); g.rotate(ang);
    g.beginPath(); g.moveTo(0, 0); const vueltas = 6;
    for (let i = 1; i <= vueltas * 2; i++) g.lineTo((i % 2 ? 4.5 : -4.5), -L * i / (vueltas * 2));
    g.strokeStyle = TINTA; g.lineWidth = 3.6; g.stroke(); g.strokeStyle = "#cfd6de"; g.lineWidth = 1.8; g.stroke();
    g.restore();
    // trozo de eje partido
    g.strokeStyle = TINTA; g.lineWidth = 6.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -7); g.stroke();
    g.strokeStyle = CM.cromo; g.lineWidth = 3.6; g.stroke();
    g.fillStyle = CM.cromoOsc; g.strokeStyle = TINTA; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-3, -6); g.lineTo(-1.5, -10.5); g.lineTo(0.5, -7.5); g.lineTo(2, -11); g.lineTo(3, -6); g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  function nota(g, x, y, s, a, dos) {
    g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s); g.lineCap = "round"; g.lineJoin = "round";
    const forma = () => {
      g.beginPath(); g.ellipse(0, 0, 5, 3.6, -0.4, 0, Math.PI * 2);
      if (dos) g.ellipse(13, -3, 5, 3.6, -0.4, 0, Math.PI * 2);
    };
    g.strokeStyle = TINTA; g.lineWidth = 6; g.beginPath(); g.moveTo(4, -1.5); g.lineTo(4, -20); if (dos) { g.lineTo(17, -23); g.lineTo(17, -4.5); } else g.quadraticCurveTo(10, -16, 10, -9); g.stroke();
    forma(); g.fillStyle = TINTA; g.fill(); g.lineWidth = 3; g.stroke();
    g.strokeStyle = "#ffffff"; g.lineWidth = 2.4; g.beginPath(); g.moveTo(4, -1.5); g.lineTo(4, -20); if (dos) { g.lineTo(17, -23); g.lineTo(17, -4.5); } else g.quadraticCurveTo(10, -16, 10, -9); g.stroke();
    forma(); g.fillStyle = "#ffffff"; g.fill();
    g.restore();
  }

  /* =====================================================================================
   * DIBUJO DE LA MÁQUINA
   * ===================================================================================== */
  let capaMaq = null;
  const CAPA = { x: 340, y: 30, w: 344, h: 540 };
  function estrella(g, x, y, r, n, a0, k) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const rr_ = i % 2 ? r * k : r, a = a0 + i * Math.PI / n; g.lineTo(x + Math.cos(a) * rr_, y + Math.sin(a) * rr_); } g.closePath(); }
  function creaMaquina() {
    capaMaq = document.createElement("canvas"); capaMaq.width = CAPA.w; capaMaq.height = CAPA.h;
    const g = capaMaq.getContext("2d"); g.translate(-CAPA.x, -CAPA.y); g.lineJoin = "round"; g.lineCap = "round";
    g.strokeStyle = TINTA;
    // zócalo
    g.fillStyle = "#0a0a10"; rr(g, CAB.x0 + 4, 540, CAB.x1 - CAB.x0 - 8, 16, 3); g.fill(); g.lineWidth = 2.5; g.stroke();
    // mueble de abajo
    const gm = g.createLinearGradient(CAB.x0, 0, CAB.x1, 0); gm.addColorStop(0, CM.lado); gm.addColorStop(0.15, CM.cuerpo); gm.addColorStop(0.6, CM.cuerpoLuz); gm.addColorStop(0.88, CM.cuerpo); gm.addColorStop(1, CM.lado);
    g.fillStyle = gm; g.fillRect(CAB.x0 + 8, MESA.yC, CAB.x1 - CAB.x0 - 16, 540 - MESA.yC); g.lineWidth = 3; g.strokeRect(CAB.x0 + 8, MESA.yC, CAB.x1 - CAB.x0 - 16, 540 - MESA.yC);
    // franjas de atardecer en diagonal (dibujo, sin letras)
    g.save(); g.beginPath(); g.rect(CAB.x0 + 9, MESA.yC + 1, CAB.x1 - CAB.x0 - 18, 540 - MESA.yC - 2); g.clip();
    const franjas = ["#ffd23f", "#ff8a2a", "#ff4f6e", "#c23ad1"];
    franjas.forEach((col, i) => { g.fillStyle = col; g.beginPath(); const y0 = 368 + i * 9; g.moveTo(CAB.x0, y0 + 30); g.lineTo(CAB.x1, y0 - 26); g.lineTo(CAB.x1, y0 - 20); g.lineTo(CAB.x0, y0 + 36); g.closePath(); g.fill(); });
    g.restore();
    // puerta de las monedas
    g.fillStyle = "#3a3f4c"; rr(g, 484, 404, 56, 70, 4); g.fill(); g.lineWidth = 2.5; g.stroke();
    g.fillStyle = "#4b5263"; rr(g, 488, 408, 48, 62, 3); g.fill();
    for (const x of [498, 526]) {
      g.fillStyle = "#1a1d24"; rr(g, x - 6, 416, 12, 18, 2); g.fill(); g.lineWidth = 1.5; g.stroke();
      g.fillStyle = CM.naranja; g.fillRect(x - 1.2, 419, 2.4, 12);
      g.fillStyle = "#1a1d24"; rr(g, x - 6, 444, 12, 14, 2); g.fill(); g.stroke();
    }
    g.fillStyle = "#c9ced8"; g.beginPath(); g.arc(512, 464, 3, 0, Math.PI * 2); g.fill();
    // chapa de abajo
    g.fillStyle = "#0e0f18"; g.fillRect(CAB.x0 + 8, 508, CAB.x1 - CAB.x0 - 16, 32); g.strokeRect(CAB.x0 + 8, 508, CAB.x1 - CAB.x0 - 16, 32);
    g.strokeStyle = "rgba(255,255,255,0.12)"; g.lineWidth = 1.5; for (let x = CAB.x0 + 18; x < CAB.x1 - 12; x += 10) { g.beginPath(); g.moveTo(x, 512); g.lineTo(x, 536); g.stroke(); }
    g.strokeStyle = TINTA;
    // cuerpo de arriba (laterales con casquillos para las bombillas)
    g.fillStyle = CM.lado; g.fillRect(CAB.x0, MARQ.y1 - 4, 16, MESA.yA - MARQ.y1 + 8); g.fillRect(CAB.x1 - 16, MARQ.y1 - 4, 16, MESA.yA - MARQ.y1 + 8);
    g.lineWidth = 2.5; g.strokeRect(CAB.x0, MARQ.y1 - 4, 16, MESA.yA - MARQ.y1 + 8); g.strokeRect(CAB.x1 - 16, MARQ.y1 - 4, 16, MESA.yA - MARQ.y1 + 8);
    const gc = g.createLinearGradient(0, MARQ.y1, 0, MESA.yA); gc.addColorStop(0, CM.cuerpoLuz); gc.addColorStop(1, CM.cuerpo);
    g.fillStyle = gc; g.fillRect(CAB.x0 + 16, MARQ.y1, CAB.x1 - CAB.x0 - 32, MESA.yA - MARQ.y1); g.strokeRect(CAB.x0 + 16, MARQ.y1, CAB.x1 - CAB.x0 - 32, MESA.yA - MARQ.y1);
    // bisel con rayas naranjas
    g.fillStyle = CM.bisel; rr(g, BISEL.x0, BISEL.y0, BISEL.x1 - BISEL.x0, BISEL.y1 - BISEL.y0, 8); g.fill(); g.lineWidth = 3; g.stroke();
    for (const [y, col] of [[BISEL.y1 - 15, CM.amarillo], [BISEL.y1 - 10, CM.naranja], [BISEL.y1 - 5, CM.magenta]]) { g.fillStyle = col; g.fillRect(BISEL.x0 + 6, y - 2, BISEL.x1 - BISEL.x0 - 12, 3); }
    g.fillStyle = "#000"; rr(g, PANT.x - 4, PANT.y - 4, PANT.w + 8, PANT.h + 8, 12); g.fill();
    // consola: tapa en trapecio y frente
    g.fillStyle = "#16161e"; g.beginPath(); g.moveTo(CAB.x0, MESA.yA); g.lineTo(CAB.x1, MESA.yA); g.lineTo(MESA.x1, MESA.yB); g.lineTo(MESA.x0, MESA.yB); g.closePath(); g.fill(); g.lineWidth = 3; g.stroke();
    const gt = g.createLinearGradient(0, MESA.yA, 0, MESA.yB); gt.addColorStop(0, "rgba(255,255,255,0)"); gt.addColorStop(1, "rgba(120,140,255,0.16)");
    g.fillStyle = gt; g.fill();
    g.save(); g.clip(); g.fillStyle = "rgba(255,255,255,0.35)";
    for (let i = 0; i < 26; i++) { const x = MESA.x0 + 20 + hash(i + 90) * (MESA.x1 - MESA.x0 - 40), y = MESA.yA + 3 + hash(i + 91) * 18; g.fillRect(x, y, 1.6, 1.6); }
    g.restore();
    const gf = g.createLinearGradient(0, MESA.yB, 0, MESA.yC); gf.addColorStop(0, CM.rojo); gf.addColorStop(1, CM.rojoOsc);
    g.fillStyle = gf; rr(g, MESA.x0, MESA.yB, MESA.x1 - MESA.x0, MESA.yC - MESA.yB, 4); g.fill(); g.lineWidth = 3; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.28)"; g.fillRect(MESA.x0 + 4, MESA.yB + 2, MESA.x1 - MESA.x0 - 8, 2.5);
    g.fillStyle = "#ffd23f"; g.fillRect(MESA.x0 + 2, MESA.yC - 5, MESA.x1 - MESA.x0 - 4, 2.5);
    // la ranura de las monedas (jugador 1)
    g.fillStyle = CM.cromo; rr(g, RANURA.x - 11, RANURA.y - 8, 22, 16, 3); g.fill(); g.lineWidth = 2; g.stroke();
    g.fillStyle = "#15161c"; rr(g, RANURA.x - 1.6, RANURA.y - 6, 3.2, 12, 1.5); g.fill();
    // arandelas de las palancas y aros de los botones
    for (const s of [STICK1, STICK2]) { g.fillStyle = "#050507"; g.beginPath(); g.ellipse(s.x, s.y + 1, 10, 4, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#3a3a46"; g.lineWidth = 1.5; g.stroke(); }
    g.strokeStyle = TINTA;
    for (const b of [...BOT1, ...BOT2]) { g.fillStyle = "#2a2a34"; g.beginPath(); g.ellipse(b.x, b.y + 1.5, 7.5, 3.6, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.5; g.stroke(); }
    // marquesina: caja con remate y el panel iluminado
    g.fillStyle = CM.lado; rr(g, MARQ.x0 + 4, MARQ.y0 - 12, MARQ.x1 - MARQ.x0 - 8, 14, 6); g.fill(); g.lineWidth = 2.5; g.stroke();
    g.fillStyle = "#101226"; rr(g, MARQ.x0, MARQ.y0, MARQ.x1 - MARQ.x0, MARQ.y1 - MARQ.y0, 6); g.fill(); g.lineWidth = 3; g.stroke();
    const mq = g.createLinearGradient(0, MARQ.y0 + 6, 0, MARQ.y1 - 6); mq.addColorStop(0, "#2a0f4a"); mq.addColorStop(0.55, "#c23ad1"); mq.addColorStop(1, "#ff8a2a");
    g.fillStyle = mq; g.fillRect(MARQ.x0 + 6, MARQ.y0 + 6, MARQ.x1 - MARQ.x0 - 12, MARQ.y1 - MARQ.y0 - 12);
    // sol de rayas y un marciano gigante en píxeles
    g.save(); g.beginPath(); g.rect(MARQ.x0 + 6, MARQ.y0 + 6, MARQ.x1 - MARQ.x0 - 12, MARQ.y1 - MARQ.y0 - 12); g.clip();
    g.fillStyle = "#ffd23f"; g.beginPath(); g.arc(MX, MARQ.y1 - 6, 30, Math.PI, 0); g.fill();
    g.fillStyle = "#c23ad1"; for (let i = 0; i < 4; i++) g.fillRect(MX - 32, MARQ.y1 - 12 - i * 6, 64, 2);
    g.restore();
    const inv = [".X.....X.", "..X...X..", ".XXXXXXX.", "XX.XXX.XX", "XXXXXXXXX", "X.XXXXX.X", "X.X...X.X", "...XX.XX."], c = 4;
    const ix = MX - 18, iy = MARQ.y0 + 14;
    g.fillStyle = TINTA; inv.forEach((f, y) => { for (let x = 0; x < f.length; x++) if (f[x] === "X") g.fillRect(ix + x * c - 1, iy + y * c - 1, c + 2, c + 2); });
    g.fillStyle = "#9dff5a"; inv.forEach((f, y) => { for (let x = 0; x < f.length; x++) if (f[x] === "X") g.fillRect(ix + x * c, iy + y * c, c, c); });
    // naves pequeñas y estrellas a los lados
    const nv = ["..X..", ".XXX.", "XXXXX", "X.X.X"];
    for (const [x0, col] of [[MARQ.x0 + 24, "#8ff8ff"], [MARQ.x1 - 44, "#ffd84a"]]) nv.forEach((f, y) => { for (let x = 0; x < f.length; x++) if (f[x] === "X") { g.fillStyle = col; g.fillRect(x0 + x * 4, MARQ.y0 + 34 + y * 4, 4, 4); } });
    g.fillStyle = "#ffffff"; for (let i = 0; i < 12; i++) g.fillRect(MARQ.x0 + 10 + hash(i + 140) * (MARQ.x1 - MARQ.x0 - 20), MARQ.y0 + 9 + hash(i + 141) * 22, 2, 2);
    g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(MARQ.x0 + 6, MARQ.y0 + 6, MARQ.x1 - MARQ.x0 - 12, 5);
    // sombra de la consola sobre el mueble
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(CAB.x0 + 9, MESA.yC + 1, CAB.x1 - CAB.x0 - 18, 8);
  }
  // bombillas de la marquesina y de los laterales (corren en cadena)
  const BOMBILLAS = [];
  for (let i = 0; i <= 14; i++) BOMBILLAS.push({ x: MARQ.x0 + 8 + i * (MARQ.x1 - MARQ.x0 - 16) / 14, y: MARQ.y1 + 2, f: i / 14 });
  for (let i = 0; i < 8; i++) { BOMBILLAS.push({ x: CAB.x0 + 8, y: 134 + i * 21, f: 1 + i / 8 }); BOMBILLAS.push({ x: CAB.x1 - 8, y: 134 + i * 21, f: 1 + i / 8 }); }
  function luces(g, t) {
    const fan = tramo(t, T.gana, T.gana + 0.1) * (1 - tramo(t, T.atrae, T.atrae + 0.4));
    const fr = tramo(t, T.juego, T.juego + 0.2) * (1 - tramo(t, T.over, T.over + 0.1)), ov = tramo(t, T.over, T.over + 0.1);
    const ph = t < T.chas ? 3 * (t - T.over) : 3 * (T.chas - T.over) + 1.6 * (t - T.chas), bl = 0.5 - 0.5 * Math.cos(2 * Math.PI * ph);
    const vel = 0.5 + 2.6 * fan + 1.6 * fr;
    BOMBILLAS.forEach((b, i) => {
      const fase_ = b.f * 2.5 - t * vel, on = 0.5 + 0.5 * Math.cos(fase_ * Math.PI * 2);
      g.fillStyle = "#3a2f1c"; g.beginPath(); g.arc(b.x, b.y, 3.6, 0, Math.PI * 2); g.fill(); g.lineWidth = 1; g.strokeStyle = TINTA; g.stroke();
      const base = (0.35 + 0.65 * on) * (1 - ov);
      if (base > 0.02) { g.globalAlpha = base; g.fillStyle = i % 2 ? "#ffe9a8" : "#fff6dc"; g.beginPath(); g.arc(b.x, b.y, 3.1, 0, Math.PI * 2); g.fill(); }
      if (fan > 0.02) { g.globalAlpha = fan * (0.4 + 0.6 * on); g.fillStyle = `hsl(${((i * 47 + t * 300) % 360).toFixed(0)},100%,62%)`; g.beginPath(); g.arc(b.x, b.y, 3.2, 0, Math.PI * 2); g.fill(); }
      if (ov > 0.02) { g.globalAlpha = ov * (0.25 + 0.75 * bl); g.fillStyle = "#ff3030"; g.beginPath(); g.arc(b.x, b.y, 3.2, 0, Math.PI * 2); g.fill(); }
      g.globalAlpha = 1;
    });
    // la marquesina se enciende más con la fanfarria y se tiñe de rojo con la calavera
    const brillo_ = 0.18 * fan * (0.6 + 0.4 * Math.sin(t * 14));
    if (brillo_ > 0.01) { g.globalAlpha = brillo_; g.fillStyle = "#ffffff"; g.fillRect(MARQ.x0 + 6, MARQ.y0 + 6, MARQ.x1 - MARQ.x0 - 12, MARQ.y1 - MARQ.y0 - 12); }
    if (ov > 0.01) { g.globalAlpha = 0.3 * ov * bl; g.fillStyle = "#ff1a1a"; g.fillRect(MARQ.x0 + 6, MARQ.y0 + 6, MARQ.x1 - MARQ.x0 - 12, MARQ.y1 - MARQ.y0 - 12); }
    g.globalAlpha = 1;
  }
  function botones(g, t) {
    const hb = hundidoG(t);
    const dib = (b, c1, c2, h) => {
      g.save(); g.translate(b.x, b.y + 2.2 * h);
      const gr = g.createRadialGradient(-2, -3, 1, 0, -1, 8); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
      g.fillStyle = gr; g.beginPath(); g.ellipse(0, -1.5, 6.2, 3.4 - 0.6 * h, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.5; g.strokeStyle = TINTA; g.stroke();
      g.fillStyle = c2; g.fillRect(-6.2, -1.5, 12.4, 2.5 - 2 * h); g.restore();
    };
    dib(BOT1[0], "#fff38a", "#f2a400", hb); dib(BOT1[1], "#9affb0", "#1fae4a", 0);
    dib(BOT2[0], "#fff38a", "#f2a400", 0); dib(BOT2[1], "#9affb0", "#1fae4a", 0);
    // botones de empezar: parpadean mientras espera la moneda
    const esp = tramo(t, T.atrae, T.atrae + 0.2) * (1 - tramo(t, T.clin, T.clin + 0.1)), pb = 0.5 + 0.5 * Math.sin(t * 9);
    for (const s of START) {
      g.fillStyle = "#e9e9f2"; g.beginPath(); g.ellipse(s.x, s.y, 4.5, 2.4, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.2; g.strokeStyle = TINTA; g.stroke();
      if (esp > 0.02) { g.globalAlpha = esp * pb; g.fillStyle = "#7ff0ff"; g.beginPath(); g.ellipse(s.x, s.y, 4.5, 2.4, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
    }
    // luz de la ranura: brilla con la moneda
    const cr = campana(t, T.clin, T.clin + 0.4);
    g.fillStyle = CM.naranja; g.globalAlpha = 0.55 + 0.45 * cr; g.fillRect(RANURA.x - 1, RANURA.y - 5, 2, 10); g.globalAlpha = 1;
    if (cr > 0.02) { g.globalAlpha = cr * 0.6; const h = g.createRadialGradient(RANURA.x, RANURA.y, 1, RANURA.x, RANURA.y, 14); h.addColorStop(0, "rgba(255,170,60,0.9)"); h.addColorStop(1, "rgba(255,170,60,0)"); g.fillStyle = h; g.fillRect(RANURA.x - 14, RANURA.y - 14, 28, 28); g.globalAlpha = 1; }
  }
  // dibuja la máquina completa en su sitio (con el balanceo)
  function dibujaMaquina(g, t) {
    const a = balanceo(t);
    g.save(); g.translate(PIVOTE.x, PIVOTE.y); g.rotate(a); g.translate(-PIVOTE.x, -PIVOTE.y);
    g.drawImage(capaMaq, CAPA.x, CAPA.y);
    // la pantalla
    const h = lienzoPant.getContext("2d");
    pintaPantalla(h, t);
    g.save(); rr(g, PANT.x, PANT.y, PANT.w, PANT.h, 10); g.clip();
    const gl = campana(t, T.chas, T.chas + 0.45);
    if (gl > 0.01) {
      for (let i = 0; i < 6; i++) { const y0 = i * 20, dx = ruido(t * 50 + i * 7) * 7 * gl; g.drawImage(lienzoPant, 0, y0, PANT.w, 20, PANT.x + dx, PANT.y + y0, PANT.w, 20); }
      g.globalAlpha = 0.35 * gl; g.fillStyle = "#ffffff"; for (let i = 0; i < 4; i++) g.fillRect(PANT.x, PANT.y + ((hash(Math.floor(t * 30) + i) * 120) | 0), PANT.w, 2); g.globalAlpha = 1;
    } else g.drawImage(lienzoPant, PANT.x, PANT.y);
    g.drawImage(velo, PANT.x, PANT.y);
    g.restore();
    luces(g, t);
    botones(g, t);
    g.restore();
    // palancas (en pantalla: ya llevan el balanceo)
    const p2 = agarre(STICK2, palanca2(t), t);
    dibPalanca(g, p2.base, p2.bola, "#9ad0ff", "#1f5fd8");
    if (t < T.chas) { const p1 = agarre(STICK1, palanca1(t), t); dibPalanca(g, p1.base, p1.bola, "#ff9a8a", "#c8141f"); }
    else { const b = enMaq(STICK1, t); g.save(); g.translate(b.x, b.y); g.rotate(a); dibMunon(g, { x: 0, y: 0 }, t); g.restore(); }
  }

  /* =====================================================================================
   * DECORADO: rincón de recreativas al fondo del bar
   * ===================================================================================== */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 140; const g = c.getContext("2d");
    g.translate(60, 70); g.lineJoin = "round"; g.lineCap = "round";
    // pared verde con papel de rombos
    const pared = g.createLinearGradient(0, -70, 0, 300); pared.addColorStop(0, "#10251f"); pared.addColorStop(1, "#1f463d");
    g.fillStyle = pared; g.fillRect(-60, -70, W + 120, 380);
    g.strokeStyle = "rgba(255,240,200,0.05)"; g.lineWidth = 1.5;
    for (let x = -80; x < W + 80; x += 36) { g.beginPath(); g.moveTo(x, -70); g.lineTo(x + 370, 300); g.stroke(); g.beginPath(); g.moveTo(x + 370, -70); g.lineTo(x, 300); g.stroke(); }
    g.fillStyle = "rgba(255,220,150,0.06)"; for (let x = -62; x < W + 80; x += 36) for (let y = -52; y < 300; y += 36) { g.beginPath(); g.arc(x + 18, y + 18, 2, 0, Math.PI * 2); g.fill(); }
    // zócalo de madera
    g.fillStyle = "#4a2c1a"; g.fillRect(-60, 304, W + 120, 166);
    g.strokeStyle = "#2e1b10"; g.lineWidth = 2; for (let x = -50; x < W + 70; x += 38) { g.beginPath(); g.moveTo(x, 310); g.lineTo(x, 466); g.stroke(); }
    g.strokeStyle = "rgba(255,200,150,0.07)"; g.lineWidth = 1.5; for (let x = -47; x < W + 70; x += 38) { g.beginPath(); g.moveTo(x, 312); g.lineTo(x, 464); g.stroke(); }
    g.fillStyle = "#6a4128"; g.fillRect(-60, 296, W + 120, 12); g.fillStyle = "rgba(255,220,170,0.18)"; g.fillRect(-60, 296, W + 120, 3);
    g.fillStyle = "#24150c"; g.fillRect(-60, 462, W + 120, 16);
    // suelo de baldosas en damero, en perspectiva
    const FH = 150, Y0 = 478, filas = []; for (let i = 0; i < 10; i++) filas.push(FH + (Y0 - FH) / (1 - i * 0.05));
    const xAt = (xw, y) => 512 + (xw - 512) * (y - FH) / (Y0 - FH);
    for (let i = 0; i < filas.length - 1; i++) for (let j = -16; j < 16; j++) {
      const ya = filas[i], yb = filas[i + 1], xa = 512 + j * 56, xb = xa + 56;
      g.fillStyle = (i + j) % 2 === 0 ? "#bfb293" : "#1f1b1b";
      g.beginPath(); g.moveTo(xAt(xa, ya), ya); g.lineTo(xAt(xb, ya), ya); g.lineTo(xAt(xb, yb), yb); g.lineTo(xAt(xa, yb), yb); g.closePath(); g.fill();
    }
    const su = g.createLinearGradient(0, Y0, 0, H + 70); su.addColorStop(0, "rgba(12,10,22,0.62)"); su.addColorStop(1, "rgba(12,10,22,0.35)");
    g.fillStyle = su; g.fillRect(-60, Y0, W + 120, H + 70 - Y0);
    // póster enmarcado: cohete de píxeles, planeta con anillo y estrellas
    g.fillStyle = "#0b0a0e"; g.fillRect(84, 96, 124, 158); g.fillStyle = "#8a6a3a"; g.fillRect(88, 100, 116, 150);
    g.fillStyle = "#1a1446"; g.fillRect(94, 106, 104, 138);
    g.fillStyle = "#ffffff"; for (let i = 0; i < 16; i++) g.fillRect(96 + hash(i + 200) * 98, 108 + hash(i + 201) * 132, 3, 3);
    g.fillStyle = "#ff8a2a"; g.beginPath(); g.arc(176, 136, 14, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#ffd23f"; g.lineWidth = 3; g.beginPath(); g.ellipse(176, 136, 24, 6, -0.3, 0, Math.PI * 2); g.stroke();
    const cohete = ["...X...", "..XXX..", "..XoX..", "..XXX..", "..XXX..", ".XXXXX.", "XX.X.XX", "X..f..X", "...f..."], pc = { X: "#e8e8f0", o: "#4ff3ff", f: "#ff8a2a" };
    cohete.forEach((f, y) => { for (let x = 0; x < f.length; x++) if (pc[f[x]]) { g.fillStyle = pc[f[x]]; g.fillRect(118 + x * 7, 150 + y * 9, 7, 9); } });
    // diana con dos dardos
    const DX = 884, DY = 178;
    g.fillStyle = "#0b0a0e"; g.beginPath(); g.arc(DX, DY, 52, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 20; i++) {
      const a0 = i / 20 * Math.PI * 2 - Math.PI / 20, a1 = a0 + Math.PI / 10;
      for (const [r0, r1, ca, cb] of [[40, 46, "#c8141f", "#1d8a3a"], [8, 40, "#e9dfc4", "#1b1716"]]) {
        g.fillStyle = i % 2 ? ca : cb; g.beginPath(); g.arc(DX, DY, r1, a0, a1); g.arc(DX, DY, r0, a1, a0, true); g.closePath(); g.fill();
      }
      g.fillStyle = i % 2 ? "#c8141f" : "#1d8a3a"; g.beginPath(); g.arc(DX, DY, 26, a0, a1); g.arc(DX, DY, 22, a1, a0, true); g.closePath(); g.fill();
    }
    g.fillStyle = "#1d8a3a"; g.beginPath(); g.arc(DX, DY, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = "#c8141f"; g.beginPath(); g.arc(DX, DY, 4, 0, Math.PI * 2); g.fill();
    for (const [x, y, a] of [[DX + 14, DY - 18, -0.5], [DX - 20, DY + 8, -0.2]]) {
      g.save(); g.translate(x, y); g.rotate(a);
      g.strokeStyle = "#cfd6de"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(18, -4); g.stroke();
      g.fillStyle = "#ff4fb8"; g.beginPath(); g.moveTo(16, -4); g.lineTo(28, -12); g.lineTo(26, -3); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(16, -4); g.lineTo(28, 4); g.lineTo(26, -3); g.closePath(); g.fill(); g.restore();
    }
    // guirnalda de bombillas
    for (const [xa, xb] of [[-60, 380], [646, W + 60]]) {
      g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.beginPath();
      for (let i = 0; i <= 30; i++) { const k = i / 30, x = lerp(xa, xb, k), y = 28 + 30 * Math.sin(Math.PI * k); if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke();
      for (let i = 1; i < 10; i++) {
        const k = i / 10, x = lerp(xa, xb, k), y = 32 + 30 * Math.sin(Math.PI * k), col = ["#ffd23f", "#ff6f6f", "#7ff0ff", "#9dff5a"][i % 4];
        const h = g.createRadialGradient(x, y + 4, 1, x, y + 4, 18); h.addColorStop(0, col + "66"); h.addColorStop(1, col + "00"); g.fillStyle = h; g.fillRect(x - 18, y - 14, 36, 36);
        g.fillStyle = col; g.beginPath(); g.ellipse(x, y + 4, 3.4, 5, 0, 0, Math.PI * 2); g.fill();
      }
    }
    // luz azulada de la máquina sobre la pared y el suelo
    const halo = g.createRadialGradient(MX, 230, 40, MX, 230, 420); halo.addColorStop(0, "rgba(90,150,255,0.22)"); halo.addColorStop(1, "rgba(90,150,255,0)");
    g.fillStyle = halo; g.fillRect(-60, -70, W + 120, H + 140);
    const charco = g.createRadialGradient(MX, 575, 20, MX, 575, 260); charco.addColorStop(0, "rgba(90,150,255,0.16)"); charco.addColorStop(1, "rgba(90,150,255,0)");
    g.fillStyle = charco; g.fillRect(-60, Y0, W + 120, H + 70 - Y0);
    // viñeta
    const v = g.createRadialGradient(512, 300, 300, 512, 300, 720); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.6)");
    g.fillStyle = v; g.fillRect(-60, -70, W + 120, H + 140);
    return c;
  }
  // brillo de la pantalla que cambia de color (azul jugando, fiesta con la fanfarria, rojo con la calavera)
  function resplandor(g, t) {
    const fan = tramo(t, T.gana, T.gana + 0.1) * (1 - tramo(t, T.atrae, T.atrae + 0.4)), ov = tramo(t, T.over, T.over + 0.12);
    const ph = t < T.chas ? 3 * (t - T.over) : 3 * (T.chas - T.over) + 1.6 * (t - T.chas), bl = 0.5 - 0.5 * Math.cos(2 * Math.PI * ph);
    const a = 0.1 + 0.12 * fan + 0.14 * ov * bl;
    let col = mezclaCol("#4f8cff", "#ffd36a", fan); if (ov > 0) col = mezclaCol("#4f8cff", "#ff2020", ov);
    const rg = g.createRadialGradient(MX, 220, 20, MX, 220, 360);
    rg.addColorStop(0, col.replace("rgb", "rgba").replace(")", `,${a.toFixed(3)})`)); rg.addColorStop(1, col.replace("rgb", "rgba").replace(")", ",0)"));
    g.fillStyle = rg; g.fillRect(MX - 360, -140, 720, 720);
  }
  // rayos de la fanfarria por detrás de la máquina
  function rayos(g, t) {
    const fan = tramo(t, T.gana, T.gana + 0.15) * (1 - tramo(t, T.atrae - 0.2, T.atrae + 0.3));
    if (fan <= 0.01) return;
    g.save(); g.translate(MX, 84); g.rotate(t * 0.6);
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * Math.PI * 2;
      g.fillStyle = i % 2 ? "rgba(255,210,63,1)" : "rgba(255,79,184,1)"; g.globalAlpha = 0.16 * fan;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a - 0.09) * 520, Math.sin(a - 0.09) * 520); g.lineTo(Math.cos(a + 0.09) * 520, Math.sin(a + 0.09) * 520); g.closePath(); g.fill();
    }
    g.restore();
  }
  // confeti que salta de la marquesina con la fanfarria
  function confeti(g, t) {
    const u = t - T.gana; if (u <= 0 || u > 1.6) return;
    g.save();
    for (let i = 0; i < 30; i++) {
      const d = u - hash(i + 300) * 0.25; if (d <= 0) continue;
      const vx = (hash(i + 301) - 0.5) * 380, vy = -160 - hash(i + 302) * 220;
      const x = MX + (hash(i + 303) - 0.5) * 150 + vx * d + 14 * Math.sin(d * 6 + i), y = 70 + vy * d + 0.5 * 700 * d * d;
      const a = 1 - tramo(d, 0.9, 1.3); if (a <= 0.01) continue;
      g.globalAlpha = a; g.fillStyle = `hsl(${(i * 47) % 360},95%,60%)`;
      g.save(); g.translate(x, y); g.rotate(d * 9 + i); g.scale(Math.cos(d * 12 + i), 1); g.fillRect(-3, -2, 6, 4); g.restore();
    }
    g.restore();
  }

  /* ---------- efectos ---------- */
  function rayitas(g, t, t0, x, y, r, n = 6, col = "#ffffff", dur = 0.22) {
    const k = fase(t, t0, t0 + dur); if (k <= 0 || k >= 1) return;
    g.save(); g.strokeStyle = col; g.globalAlpha = 1 - k; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + 0.3, r0 = r + 10 * k; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * (r0 + 8), y + Math.sin(a) * (r0 + 8)); g.stroke(); }
    g.restore();
  }
  function impacto(g, t, t0, x, y, tam) {
    const k = fase(t, t0, t0 + 0.3); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    estrella(g, x, y, tam * (0.6 + 0.8 * salida(k)), 10, 0.3, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke();
    estrella(g, x, y, tam * (0.35 + 0.5 * salida(k)), 10, 0.55, 0.5); g.fillStyle = "#ffffff"; g.fill();
    g.restore();
  }
  // tornillos y trocitos que salen volando con el crac
  function astillas(g, t, x, y) {
    const u = t - T.chas; if (u <= 0 || u > 0.9) return;
    g.save();
    for (let i = 0; i < 8; i++) {
      const vx = (hash(i + 500) - 0.3) * 260, vy = -120 - hash(i + 501) * 200, px = x + vx * u, py = y + vy * u + 0.5 * 1500 * u * u;
      if (py > SUELO + 2) continue;
      g.globalAlpha = 1 - tramo(u, 0.6, 0.9); g.save(); g.translate(px, py); g.rotate(u * 14 + i);
      g.fillStyle = ["#cfd6de", "#c8141f", "#1b1b22", "#ffd23f"][i % 4]; g.strokeStyle = TINTA; g.lineWidth = 1;
      if (i % 2) { g.beginPath(); g.arc(0, 0, 2.4, 0, Math.PI * 2); g.fill(); g.stroke(); } else { g.fillRect(-3, -1.5, 6, 3); g.strokeRect(-3, -1.5, 6, 3); }
      g.restore();
    }
    g.restore();
  }
  // líneas de velocidad junto al puño cuando da tirones a la palanca
  function tirones(g, t, pg) {
    const k = enPalancaG(t) * frenesi(t); if (k < 0.05) return;
    const v = (palanca1(t + 0.015) - palanca1(t - 0.015)) / 0.03, f = pg._l, s = v > 0 ? -1 : 1, a = clamp(Math.abs(v) / 14) * k;
    if (a < 0.08) return;
    g.save(); g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 2.2; g.lineCap = "round"; g.globalAlpha = a;
    for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(f.x + s * 16, f.y + i * 7); g.lineTo(f.x + s * (28 - 4 * Math.abs(i)), f.y + i * 7); g.stroke(); }
    g.restore();
  }
  // gotas de sudor que salen despedidas en los saltos
  function gotas(g, t, pg) {
    for (const tj of SALTOS_G) {
      const u = t - (tj + 0.14); if (u <= 0 || u > 0.45) continue;
      for (const s of [-1, 1]) {
        const x = pg._cab.x + s * 46 + s * 120 * u, y = pg._cab.y - 46 - 160 * u + 0.5 * 1400 * u * u;
        g.save(); g.globalAlpha = 1 - tramo(u, 0.3, 0.45); g.translate(x, y); g.rotate(s * 0.5);
        g.fillStyle = "#9fe0ff"; g.strokeStyle = TINTA; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, -6); g.quadraticCurveTo(4.5, 1, 0, 3.5); g.quadraticCurveTo(-4.5, 1, 0, -6); g.fill(); g.stroke();
        g.restore();
      }
    }
  }
  function notas(g, t, pg) {
    const k = tramo(t, T.silba + 0.2, T.silba + 0.45); if (k <= 0.01) return;
    for (let i = 0; i < 3; i++) {
      const ph = (((t - T.silba) * 0.8 + i / 3) % 1 + 1) % 1, b = pg._boca;
      const x = b.x + 16 + 34 * ph + 6 * Math.sin(ph * 9 + i), y = b.y - 8 - 58 * ph;
      g.save(); g.globalAlpha = k * Math.sin(Math.PI * ph); nota(g, x, y, 0.85 + 0.2 * ph, 0.15 * Math.sin(ph * 7 + i), i === 1); g.restore();
    }
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const gan = tramo(t, T.gana - 0.05, T.gana + 0.4) * (1 - tramo(t, T.reto, T.reto + 0.6));
    const ov = tramo(t, T.over, T.over + 0.4) * (1 - tramo(t, T.agarra + 0.3, T.chas));
    const fin = tramo(t, T.camara - 0.3, T.fin);
    const k = 1.12 + 0.03 * gan + 0.05 * ov + 0.04 * fin;
    const x = 512 - 12 * ov - 8 * fin, y = 312 - 2 * gan;
    const sac = tramo(t, T.sacude0, T.sacude0 + 0.1) * (1 - tramo(t, T.chas, T.chas + 0.05));
    const tb = (t >= T.chas ? 4 * Math.exp(-(t - T.chas) * 7) * tramo(t, T.chas, T.chas + 0.025) : 0) + 1.2 * sac;
    return { k, x: x + ruido(t * 40) * tb, y: y + ruido(t * 43 + 3) * tb * 0.6 };
  }

  /* =====================================================================================
   * ESCENA
   * ===================================================================================== */
  class Recreativa extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Da.listo()) return;
      if (!fondo) { fondo = creaFondo(); creaSprites(); creaMaquina(); }
      const P = pose(t), pg = P.g, pd = P.d;
      const luz = tramo(t, NEGRO_INICIO, 0.75, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      g.drawImage(fondo, -60, -70);
      resplandor(g, t);
      rayos(g, t);
      // sombras en el suelo
      g.save(); g.fillStyle = "rgba(0,0,0,0.4)";
      const hs = 1 - 0.35 * clamp(saltoG(t) / 26);
      g.beginPath(); g.ellipse(pg.x - 4, SUELO + 1, 86 * hs, 8 * hs, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pd.x, SUELO + 1, 84, 8, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(MX, SUELO + 1, 104, 9, 0, 0, Math.PI * 2); g.fill(); g.restore();
      dibujaMaquina(g, t);
      confeti(g, t);
      // ---- los dos ----
      CAM = g.getTransform();
      if (pg._palo && pg._palo.detras) dibPalo(g, pg._palo.bola, pg._palo.u, 1, t);    // escondida: por detrás del cuerpo
      G.dibujar(g, pg, t);
      if ((pg._oculta || 0) > 0.01) {
        // la mano se mete detrás de la espalda: se repinta el cuerpo encima, solo alrededor del puño
        const n = pg._n, hc = G.aPantalla(pg, G.tronco(pg)(G.HOMBRO_C)), fuera = G.aHoja(pg, { x: hc.x + 50, y: hc.y + 16 });
        const p2 = Object.assign({}, pg, { capaCabeza: null, manoCerca: Object.assign({}, pg.manoCerca, { x: fuera.x, y: fuera.y, mu: -2.8, objeto: null }),
          manoLejos: Object.assign({}, pg.manoLejos, { objeto: null }) });
        g.save(); g.globalAlpha = pg._oculta; g.beginPath(); g.arc(n.x + 4, n.y + 3, 21, 0, Math.PI * 2); g.clip(); G.dibujar(g, p2, t); g.restore();
      }
      Da.dibujar(g, pd, t);
      // ---- efectos por delante ----
      rayitas(g, t, T.clin, RANURA.x, RANURA.y - 4, 6, 6, "#fff6b0", 0.24);
      for (const tp of PULSA_G) { const b = enMaq(BOT1[0], tp); rayitas(g, t, tp, b.x, b.y - 4, 9, 6, "#ffe14d", 0.16); }
      tirones(g, t, pg);
      gotas(g, t, pg);
      { const k = agarre(STICK1, palanca1(T.chas - 1e-4), T.chas - 1e-4); impacto(g, t, T.chas, k.bola.x + 4, k.bola.y + 10, 20); astillas(g, t, k.base.x, k.base.y - 8); }
      notas(g, t, pg);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
      CAM = null;
    }
  }
  registrar({ id: "00055", nombre: "Guillermo y Dari · La máquina recreativa", crear: () => new Recreativa() });
  window.__A2D_00055 = { pose, T, DUR };
})();
