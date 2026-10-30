"use strict";
/* 00020 · Guillermo y Laura · Piedra, papel o tijera
 *
 * Negro → en la barra de una taberna verde esmeralda, Guillermo (a la izquierda) y Laura (a la
 * derecha, mirándole) tienen entre los dos la cuenta en una bandejita. La miran, se miran… y
 * Guillermo la reta con el puño: ¿quién paga? Laura levanta una ceja y acepta.
 * Tres rondas: los puños botan tres veces a la vez y al cuarto golpe se enseña la mano (la cámara
 * se acerca a las manos para que se lea el gesto):
 *   1. él tijera, ella piedra: el puño de Laura le aplasta los dedos; él se sopla la mano.
 *   2. él papel (muy chulo), ella tijera: «tris, tras», le corta las puntas; él se cuenta los dedos.
 *   3. él piedra, rojo y desesperado; ella papel: le envuelve el puño con la palma.
 * Guillermo cae de rodillas, se saca los bolsillos del revés: vacíos, y sale volando una polilla.
 * Laura se parte de risa, saca su tarjeta, la lanza con un giro de muñeca y aterriza en la bandeja;
 * luego va hasta él, le da unas palmaditas en la cabeza y guiña a cámara → negro.
 *
 * Sin textos (la cuenta solo lleva rayitas). Todo depende del tiempo absoluto. Las manos del
 * juego se dibujan con dedos en `mano.objeto` (un poco más grandes, como en los dibujos animados)
 * para que piedra, papel y tijera se lean a la primera.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, L = Laura;
  const S = 0.33, SUELO = 566;
  const DUR = 14.95;
  const XG = 350, XL = 662;                          // pelvis de cada uno (pantalla)
  const CT = 350;                                    // tablero de la barra (pantalla)
  const BANDEJA = { x: 516, y: CT + 1 };
  const T = {
    mira: 0.42, seMiran: 0.95, reta0: 1.0, reta1: 1.45, acepta0: 1.3, acepta1: 1.8,
    rodillas0: 8.87, rodillas: 9.22, bolsillo0: 9.42, bolsillo1: 10.12, polilla: 10.12, polillaFin: 11.87,
    risa0: 10.27, risa1: 11.17, tarjeta0: 11.17, tarjeta1: 11.42, apunta: 11.67, lanza: 11.72, cae: 12.07,
    suelta: 10.62, anda0: 12.17, anda1: 12.82, pat0: 12.82, pat1: 13.62, miraArriba: 12.87, guino: 13.67, fin: 14.17
  };
  const RONDAS = [
    { b0: 2.1, sp: 0.3, g: "tijera", l: "piedra" },
    { b0: 4.9, sp: 0.3, g: "papel", l: "tijera" },
    { b0: 7.42, sp: 0.25, g: "piedra", l: "papel" }
  ];
  for (const r of RONDAS) { r.ini = r.b0 - r.sp; r.rev = r.b0 + 3 * r.sp; }
  const [R1, R2, R3] = RONDAS;

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const R_M = G.MUNECA_R * G.JK;
  const manoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };

  /* =====================================================================================
   * MANOS DEL JUEGO
   * Misma construcción que la mano con dedos del montaje común (Personaje2D.mano), con dos extras:
   * `v` abre el índice y el corazón en uve (tijera) y `fan` separa los dedos (papel).
   * ===================================================================================== */
  const FORMAS = {
    piedra: { pulgar: 0, indice: 0, medio: 0, anular: 0, menique: 0, v: 0, fan: 1 },
    papel: { pulgar: 1, indice: 1, medio: 1, anular: 1, menique: 1, v: 0, fan: 1.6 },
    tijera: { pulgar: 0, indice: 1, medio: 1, anular: 0, menique: 0, v: 1, fan: 1 },
    pinza: { pulgar: 0.35, indice: 0.35, medio: 0.35, anular: 0.35, menique: 0.35, v: 0, fan: 1 },
    abierta: { pulgar: 0.9, indice: 0.95, medio: 0.95, anular: 0.95, menique: 0.95, v: 0, fan: 1.15 },
    suelta: { pulgar: 0.55, indice: 0.6, medio: 0.6, anular: 0.6, menique: 0.6, v: 0, fan: 1 },
    aplastada: { pulgar: 0, indice: 0.35, medio: 0.3, anular: 0, menique: 0, v: 0.25, fan: 1 },
    envuelve: { pulgar: 0.75, indice: 0.42, medio: 0.42, anular: 0.42, menique: 0.45, v: 0, fan: 1 },
    tarjeta: { pulgar: 0.3, indice: 0.55, medio: 0.5, anular: 0.3, menique: 0.3, v: 0, fan: 1 }
  };
  const mezclaF = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const DEDOS = [["indice", 6.9, 14.5, 0.17, 0.34], ["medio", 2.3, 16, 0.05, -0.26], ["anular", -2.3, 15, -0.07, 0], ["menique", -6.7, 12, -0.2, 0]];
  function manoJuego(g, d, mu, col) {
    const e = n => clamp(d[n] ?? 0);
    const abre = (e("indice") + e("medio") + e("anular") + e("menique")) / 4;
    const W = 5.3, TI = 1.9;
    g.save(); g.rotate(mu + Math.PI / 2); g.lineJoin = "round"; g.lineCap = "round";
    const palma = () => { g.beginPath(); g.moveTo(-7.5, -12.5); g.lineTo(7.5, -12.5); g.bezierCurveTo(10.5, -9, 11, -3, 10.5, 2);
      g.quadraticCurveTo(10, 6.5, 6, 7); g.lineTo(-6, 7); g.quadraticCurveTo(-10, 6.5, -10.2, 2); g.bezierCurveTo(-10.6, -3, -10.2, -9, -7.5, -12.5); g.closePath(); };
    const dedos = DEDOS.map(([n, x, L0, ab, uve]) => {
      const k = e(n), ang = ab * (0.4 + 0.9 * abre) * (d.fan ?? 1) + uve * (d.v || 0) * k, largo = 3.2 + (L0 - 3.2) * Math.pow(k, 0.85);
      const b = { x, y: 4.5 }, f = { x: x + Math.sin(ang) * largo, y: 4.5 + Math.cos(ang) * largo };
      return { k, b, f };
    });
    const ruta = q => { g.beginPath(); g.moveTo(q.b.x, q.b.y); g.lineTo(q.f.x, q.f.y); };
    g.strokeStyle = col.tinta; g.lineWidth = W + 2 * TI;
    for (const q of dedos) { ruta(q); g.stroke(); }
    palma(); g.lineWidth = 2 * TI; g.stroke();
    g.strokeStyle = col.piel; g.fillStyle = col.piel; g.lineWidth = W;
    for (const q of dedos) { ruta(q); g.stroke(); }
    palma(); g.fill();
    g.save(); palma(); g.clip(); g.fillStyle = col.sombra; g.globalAlpha = 0.8;
    g.beginPath(); g.ellipse(-3, 8, 13, 5, 0, 0, Math.PI * 2); g.fill(); g.restore();
    g.strokeStyle = col.tinta; g.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) { const a = dedos[i], b = dedos[i + 1], kk = Math.min(a.k, b.k);
      const xm = (a.b.x + b.b.x) / 2; g.beginPath(); g.moveTo(xm, 3 + 1.5 * kk); g.lineTo(xm + (a.f.x + b.f.x - a.b.x - b.b.x) * 0.06, 6.5 + 3 * kk); g.stroke(); }
    for (const q of dedos) {
      const pl = 1 - q.k; if (pl < 0.04) continue;
      const y0 = q.f.y - 0.6, y1 = y0 - 8.5 * pl;
      g.strokeStyle = col.tinta; g.lineWidth = W + 3; g.beginPath(); g.moveTo(q.f.x, y0); g.lineTo(q.f.x * 0.92, y1); g.stroke();
      g.strokeStyle = col.piel; g.lineWidth = W - 0.2; g.stroke();
    }
    const kp = e("pulgar"), base = { x: 8.6, y: lerp(-5.5, -3, kp * (1 - abre)) };
    const phi = lerp(-1.15, lerp(1.4, 0.95, abre), kp), Lp = lerp(9.5, lerp(15, 12.5, abre), kp);
    const medio = { x: base.x + Math.sin(phi * 0.85) * Lp * 0.5, y: base.y + Math.cos(phi * 0.85) * Lp * 0.5 };
    const punta = { x: medio.x + Math.sin(phi) * Lp * 0.5, y: medio.y + Math.cos(phi) * Lp * 0.5 };
    const rp = () => { g.beginPath(); g.moveTo(base.x, base.y); g.quadraticCurveTo(medio.x, medio.y, punta.x, punta.y); };
    g.strokeStyle = col.tinta; g.lineWidth = 5.8 + 2 * TI; rp(); g.stroke();
    g.strokeStyle = col.piel; g.lineWidth = 5.8; rp(); g.stroke();
    // nudillos marcados en el puño (piedra)
    const nud = clamp(1 - abre * 1.6);
    if (nud > 0.05) { g.globalAlpha = nud; g.strokeStyle = col.tinta; g.lineWidth = 1.1;
      for (const x of [4.6, 0, -4.5]) { g.beginPath(); g.arc(x, 9.5, 2.1, 0.2, Math.PI - 0.2); g.stroke(); } g.globalAlpha = 1; }
    g.restore();
  }
  const MS = 1.42;                                     // las manos del juego, un poco más grandes
  const COL_G = { piel: G.C.piel, sombra: G.C.pielSombra, tinta: "#0b0a0e" };
  const COL_L = { piel: L.C.piel, sombra: L.C.pielSombra, tinta: "#0b0a0e" };
  // objeto de la mano: la mano con dedos escalada alrededor de la muñeca (así no se separa del brazo)
  function objetoMano(forma, mu, vis, col, esc, extra) {
    return g => {
      if (vis <= 0.01) return;
      const w = { x: Math.cos(mu) * G.MUNECA_R, y: Math.sin(mu) * G.MUNECA_R }, k = MS * vis * esc;
      g.save(); g.translate(w.x, w.y); g.scale(k, k); g.translate(-w.x, -w.y);
      if (extra) extra(g, "antes");
      manoJuego(g, forma, mu, col);
      if (extra) extra(g, "despues");
      g.restore();
    };
  }

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, esp: 0, mof: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: Math.max(e.c, e.cd, parp), i: Math.max(e.c, e.ci, parp), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* =====================================================================================
   * EL JUEGO: dónde está cada mano de juego (pantalla) y qué forma tiene
   * ===================================================================================== */
  const LISTO_G = { x: 450, y: 282 }, LISTO_L = { x: 556, y: 283 };     // puños preparados delante del pecho
  const SACA_G = { x: 478, y: 286 }, SACA_L = { x: 541, y: 287 };       // manos enseñadas, una frente a otra
  function bombeo(t, r, A) {        // altura del puño (px hacia arriba): tres botes y un cuarto que enseña la mano
    if (t <= r.ini || t >= r.rev) return 0;
    const u = (t - r.ini) / r.sp;
    return Math.abs(Math.sin(Math.PI * u)) * A * (u < 1 ? 0.75 + 0.25 * u : 1);
  }
  // de puño a la forma de la ronda en el último bajón
  const abreForma = (t, r) => salida(fase(t, r.rev - 0.12, r.rev + 0.02));
  // lleva la mano del sitio preparado al de enseñar durante el último bote
  const empuja = (t, r) => suave(fase(t, r.rev - r.sp * 0.75, r.rev));

  function juegoG(t, pg) {
    // devuelve { q (pantalla), f (forma), vis } de la mano de juego de Guillermo, o null fuera del juego
    if (t < T.reta0) return null;
    let q = { ...LISTO_G }, f = FORMAS.piedra;
    // reto: saca el puño y lo agita delante de ella
    const reto = { x: LISTO_G.x - 6, y: LISTO_G.y - 62 };
    const sube = tramo(t, T.reta0, T.reta1), aListo = tramo(t, 1.6, R1.ini);
    q = mezcla(q, reto, sube * (1 - aListo));
    q.y += 8 * Math.sin((t - T.reta1) * 22) * campana(t, T.reta1 - 0.05, 1.65);
    for (const r of RONDAS) {
      if (t < r.ini - 0.4) break;
      const A = r === R3 ? 42 : 30;
      q.y -= bombeo(t, r, A);
      q = mezcla(q, r === R3 ? { x: SACA_G.x + 6, y: SACA_G.y } : SACA_G, empuja(t, r) * (1 - vuelveG(t, r)));
      if (t >= r.rev - 0.12) f = mezclaF(FORMAS.piedra, FORMAS[r.g], abreForma(t, r) * (1 - vuelveG(t, r)));
    }
    // --- ronda 1: el puño de Laura le aplasta la tijera; retira la mano, la sacude y se la sopla
    const ap = R1.rev + 0.56;                                  // momento del golpe
    if (t >= ap - 0.02 && t < R2.ini) {
      const w = 1 - vuelveG(t, R1);
      const k = salida(fase(t, ap - 0.02, ap + 0.06)) * w;
      q = { x: q.x + 2 * k, y: q.y + 24 * k * (1 - tramo(t, ap + 0.08, ap + 0.3)) };
      f = mezclaF(f, FORMAS.aplastada, k);
      const boca = G.aPantalla(pg, G.boca(pg)), sopla = { x: boca.x + 44, y: boca.y + 16 };
      const ret = suave(fase(t, ap + 0.06, ap + 0.32)) * w;
      const sac = campana(t, ap + 0.3, ap + 0.7);
      const aSopla = { x: sopla.x + 10 * Math.sin((t - ap) * 40) * sac, y: sopla.y + 12 * Math.sin((t - ap) * 33 + 1) * sac };
      q = mezcla(q, aSopla, ret);
      f = mezclaF(f, FORMAS.suelta, ret);
    }
    // --- ronda 2: le cortan las puntas; retira la mano a la cara y se cuenta los dedos
    const tc = R2.rev + 0.45;                                  // primer «tris»
    if (t >= tc && t < R3.ini) {
      const cara = G.aPantalla(pg, G.centroCabeza(pg)), mira = { x: cara.x + 70, y: cara.y + 80 };
      const ret = suave(fase(t, tc + 0.02, tc + 0.22)) * (1 - vuelveG(t, R2));
      q = mezcla(q, mira, ret);
      const cuenta = fase(t, tc + 0.28, tc + 0.68);
      const dd = FORMAS.papel, fd = { ...dd, fan: 1.25 };
      for (const [i, n] of ["indice", "medio", "anular", "menique"].entries()) fd[n] = 1 - 0.55 * campana(cuenta, i * 0.22, i * 0.22 + 0.3);
      f = mezclaF(f, fd, ret);
    }
    // --- ronda 3: ella le envuelve el puño; él se queda helado y luego se le cae el brazo
    const te = R3.rev + 0.25;
    if (t >= te) {
      const cae = suave(fase(t, T.rodillas0, T.rodillas0 + 0.35));
      const lado = G.aPantalla(pg, G.tronco(pg)({ x: G.HOMBRO.x + 30, y: G.HOMBRO.y + 300 }));
      q = mezcla(q, lado, cae);
      f = mezclaF(f, FORMAS.suelta, cae);
    }
    return { q, f, vis: 1 };
  }
  // vuelta al puño preparado entre rondas (para Guillermo)
  function vuelveG(t, r) {
    if (r === R1) return tramo(t, R2.ini - 0.45, R2.ini - 0.1);
    if (r === R2) return tramo(t, R3.ini - 0.4, R3.ini - 0.1);
    return 0;
  }
  function vuelveL(t, r) {
    if (r === R1) return tramo(t, R2.ini - 0.5, R2.ini - 0.12);
    if (r === R2) return tramo(t, R3.ini - 0.45, R3.ini - 0.12);
    return 0;
  }
  function juegoL(t, pg, pl) {
    if (t < T.acepta0 || t > FIN_L) return null;
    let q = { ...LISTO_L }, f = FORMAS.piedra;
    for (const r of RONDAS) {
      if (t < r.ini - 0.4) break;
      q.y -= bombeo(t, r, r === R3 ? 36 : 30);
      q = mezcla(q, SACA_L, empuja(t, r) * (1 - vuelveL(t, r)));
      if (t >= r.rev - 0.12) f = mezclaF(FORMAS.piedra, FORMAS[r.l], abreForma(t, r) * (1 - vuelveL(t, r)));
    }
    // --- ronda 1: levanta un poco el puño… y lo deja caer sobre la tijera de Guillermo
    const ap = R1.rev + 0.56;
    if (t >= R1.rev + 0.28 && t < R2.ini) {
      const levanta = salida(fase(t, R1.rev + 0.28, ap - 0.1)), golpe = entrada(fase(t, ap - 0.1, ap));
      const sobre = { x: SACA_G.x + 30, y: SACA_G.y - 22 };            // encima de los dedos de él
      const alto = { x: SACA_L.x + 4, y: SACA_L.y - 40 };
      q = mezcla(mezcla(q, alto, levanta), sobre, golpe);
      const empujon = salida(fase(t, ap - 0.02, ap + 0.06)) * (1 - tramo(t, ap + 0.08, ap + 0.3));
      q.y += 22 * empujon;
      // se sopla los nudillos y vuelve a su sitio
      const boca = L.aPantalla(pl, L.boca(pl));
      const sopla = suave(fase(t, ap + 0.25, ap + 0.45)) * (1 - tramo(t, ap + 0.6, R2.ini - 0.12));
      q = mezcla(q, { x: boca.x - 30, y: boca.y + 14 }, sopla);
      q = mezcla(q, LISTO_L, tramo(t, ap + 0.6, R2.ini - 0.12));
    }
    // --- ronda 2: la uve avanza hasta las puntas de los dedos de él y corta dos veces
    const tc = R2.rev + 0.45;
    if (t >= R2.rev + 0.25 && t < R3.ini) {
      const va = suave(fase(t, R2.rev + 0.25, tc - 0.04)), vuelve = tramo(t, tc + 0.35, R3.ini - 0.15);
      q = mezcla(q, { x: SACA_G.x + 46, y: SACA_G.y - 1 }, va * (1 - vuelve));
      const corta = campana(t, tc - 0.04, tc + 0.12) + campana(t, tc + 0.16, tc + 0.32);
      f = { ...f, v: f.v * (1 - 0.85 * corta) };
      q = mezcla(q, LISTO_L, vuelve);
    }
    // --- ronda 3: la palma pasa por encima del puño de él y lo envuelve
    const te = R3.rev + 0.25;
    if (t >= te) {
      const va = suave(fase(t, te, te + 0.22)), suelta = suave(fase(t, T.rodillas0 - 0.05, T.rodillas0 + 0.2));
      q = mezcla(q, { x: SACA_G.x + 18, y: SACA_G.y - 6 }, va * (1 - suelta));
      q.y += 3 * Math.sin((t - te) * 18) * campana(t, te + 0.25, T.rodillas0);        // un apretoncito
      f = mezclaF(f, FORMAS.envuelve, salida(fase(t, te + 0.1, te + 0.3)) * (1 - suelta));
      f = mezclaF(f, FORMAS.abierta, suelta);
      q = mezcla(q, { x: SACA_L.x + 20, y: SACA_L.y + 24 }, suelta);
    }
    return { q, f, vis: 1 };
  }

  /* =====================================================================================
   * GUILLERMO (a la izquierda, mira a la derecha)
   * ===================================================================================== */
  const CARAS_G = {
    inicio: E({ orig: 0, sonr: 0.35, sd: 4, gd: 0.05, si: 4, gi: 0.05 }),
    cuenta: E({ mx: 0.55, my: 0.75, sd: 8, gd: 0.06, si: 8, gi: 0.06, orig: 0, sonr: 0.05, ancho: 0.9 }),
    reta: E({ mx: 0.9, my: 0.05, sd: 20, gd: 0.18, si: 4, gi: -0.05, orig: 0, sonr: 0.85, abre: 8, ancho: 0.95 }),
    listo: E({ mx: 0.9, my: 0.25, c: 0.22, sd: -10, gd: -0.22, si: -10, gi: -0.22, orig: 0, sonr: 0.3, ancho: 0.85 }),
    manos: E({ mx: 0.75, my: 0.55, sd: 6, gd: 0.05, si: 6, gi: 0.05, orig: 0, sonr: 0.2, ancho: 0.9 }),
    duele: E({ mx: 0.4, my: 0.3, c: 1, z: 1, sd: 14, gd: -0.2, si: 14, gi: -0.2, orig: 0, abre: 30, ancho: 1.15, sonr: -0.55, lengua: 0.2 }),
    sopla: E({ mx: 0.7, my: 0.45, c: 0.35, sd: 16, gd: -0.22, si: 16, gi: -0.22, orig: 0, abre: 5, ancho: 0.38, sonr: 0, dientes: 0 }),
    decidido: E({ mx: 0.9, my: 0.2, c: 0.3, sd: -14, gd: -0.3, si: -14, gi: -0.3, orig: 0, sonr: -0.2, ancho: 0.8 }),
    chulo: E({ mx: -0.8, my: -0.15, sd: 18, gd: 0.15, si: 2, gi: -0.05, orig: 0, sonr: 0.9, abre: 10, ancho: 1.05 }),
    susto: E({ mx: 0.7, my: 0.4, iris: 0.72, sd: 26, gd: 0.14, si: 26, gi: 0.14, orig: 0, abre: 44, ancho: 0.8, sonr: -0.2, lengua: 0.4 }),
    dedos: E({ mx: 0.5, my: 0.55, iris: 0.85, sd: 18, gd: -0.12, si: 18, gi: -0.12, orig: 0, abre: 12, ancho: 0.7, sonr: -0.4 }),
    desespera: E({ mx: 0.92, my: 0.25, c: 0.55, z: 0.5, sd: -16, gd: -0.32, si: -16, gi: -0.32, orig: 0, abre: 16, ancho: 1.2, sonr: -0.6, lengua: 0 }),
    grita: E({ mx: 0.9, my: 0.35, c: 0.2, sd: -14, gd: -0.3, si: -14, gi: -0.3, orig: 0, abre: 36, ancho: 1.2, sonr: -0.2, lengua: 0.2 }),
    triunfo: E({ mx: 0.75, my: 0.45, sd: 16, gd: 0.15, si: 16, gi: 0.15, orig: 0, abre: 22, ancho: 1.15, sonr: 0.9 }),
    helado: E({ mx: 0.75, my: 0.45, iris: 0.7, sd: 22, gd: 0.1, si: 22, gi: 0.1, orig: 0, abre: 20, ancho: 1.0, sonr: 0.35 }),
    derrota: E({ mx: 0.3, my: 0.7, c: 0.35, sd: 18, gd: -0.3, si: 18, gi: -0.3, orig: 0, abre: 14, ancho: 0.9, sonr: -0.8 }),
    bolsillos: E({ mx: -0.85, my: -0.05, c: 0.15, sd: 20, gd: -0.3, si: 20, gi: -0.3, orig: 0, abre: 6, ancho: 0.95, sonr: -0.7 }),
    polilla: E({ mx: 0.1, my: -0.95, iris: 0.85, sd: 20, gd: 0.05, si: 20, gi: 0.05, orig: 0, abre: 14, ancho: 0.7, sonr: -0.3, lengua: 0.3 }),
    triste: E({ mx: 0.6, my: 0.55, c: 0.3, sd: 16, gd: -0.28, si: 16, gi: -0.28, orig: 0, abre: 0, ancho: 0.85, sonr: -0.75 }),
    arriba: E({ mx: 0.85, my: -0.75, iris: 1.15, sd: 18, gd: -0.25, si: 18, gi: -0.25, orig: 0, abre: 0, ancho: 0.8, sonr: -0.35 }),
    tonto: E({ mx: 0.85, my: -0.7, c: 0.3, h: 0.8, sd: 12, gd: -0.1, si: 12, gi: -0.1, orig: 0, abre: 4, ancho: 1.0, sonr: 0.75 })
  };
  const tc2 = R2.rev + 0.45, ap1 = R1.rev + 0.56, te3 = R3.rev + 0.25;
  const GUION_CARA_G = [
    [T.mira, T.mira + 0.2, "cuenta"], [T.seMiran, T.seMiran + 0.15, "inicio"], [T.reta0 + 0.05, T.reta0 + 0.25, "reta"],
    [1.75, 1.95, "listo"], [R1.rev - 0.05, R1.rev + 0.08, "manos"], [ap1, ap1 + 0.05, "duele"], [ap1 + 0.4, ap1 + 0.55, "sopla"],
    [R2.ini - 0.4, R2.ini - 0.2, "decidido"], [R2.rev - 0.02, R2.rev + 0.1, "chulo"], [tc2, tc2 + 0.05, "susto"], [tc2 + 0.3, tc2 + 0.45, "dedos"],
    [R3.ini - 0.35, R3.ini - 0.15, "desespera"], [R3.rev - 0.06, R3.rev + 0.04, "grita"], [R3.rev + 0.06, R3.rev + 0.16, "triunfo"],
    [te3 + 0.12, te3 + 0.24, "helado"], [T.rodillas0 - 0.15, T.rodillas0 + 0.15, "derrota"], [T.bolsillo1 - 0.25, T.bolsillo1, "bolsillos"],
    [T.polilla + 0.15, T.polilla + 0.35, "polilla"], [T.polillaFin - 0.4, T.polillaFin - 0.1, "triste"],
    [T.miraArriba, T.miraArriba + 0.2, "arriba"], [T.pat0 + 0.4, T.pat0 + 0.65, "tonto"]
  ];
  // cuerpo: dx (px), pel (hoja, + abajo), torso, cab
  const P0G = { dx: 0, pel: 0, torso: 0, cab: 0 };
  const CG = o => Object.assign({}, P0G, o);
  const CUERPOS_G = {
    quieto: CG({}), mira: CG({ cab: 0.08, torso: 0.02 }), reta: CG({ dx: 4, torso: 0.05, cab: -0.04 }),
    juega: CG({ dx: 4, pel: 10, torso: 0.07, cab: 0.04 }), duele: CG({ dx: -6, pel: 18, torso: -0.04, cab: 0.08 }),
    desespera: CG({ dx: 8, pel: 26, torso: 0.11, cab: 0.06 }), saca: CG({ dx: 12, pel: 20, torso: 0.14, cab: 0.06 }),
    rodillas: CG({ dx: 6, pel: 352, torso: 0.1, cab: 0.18 }), bolsillos: CG({ dx: 6, pel: 352, torso: 0.02, cab: 0.06 }),
    arriba: CG({ dx: 6, pel: 352, torso: 0.2, cab: 0.3 })
  };
  const GUION_CUERPO_G = [
    [T.mira, T.mira + 0.25, "mira"], [T.reta0, T.reta1, "reta"], [1.7, 2.0, "juega"],
    [ap1, ap1 + 0.1, "duele"], [R2.ini - 0.4, R2.ini - 0.1, "juega"], [R3.ini - 0.4, R3.ini - 0.1, "desespera"],
    [R3.rev - 0.1, R3.rev, "saca"], [T.rodillas0, T.rodillas, "rodillas", entrada], [T.bolsillo0, T.bolsillo0 + 0.4, "bolsillos"],
    [T.miraArriba - 0.1, T.miraArriba + 0.3, "arriba"]
  ];
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  // forros de los bolsillos (hoja, coordenadas del torso): boca del bolsillo [a, b]
  const BOLS_G = { cerca: { a: { x: 124, y: 664 }, b: { x: 170, y: 632 } }, lejos: { a: { x: 344, y: 640 }, b: { x: 384, y: 676 } } };
  const inversoTronco = (p, q) => { const c = Math.cos(-p.torso), s = Math.sin(-p.torso), dx = q.x - p.pelvis.x, dy = q.y - p.pelvis.y;
    return { x: G.PELVIS.x + (dx * c - dy * s) / p.torsoEsc.x, y: G.PELVIS.y + (dx * s + dy * c) / p.torsoEsc.y }; };

  function poseG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "quieto", t);
    const respira = Math.sin(t * 2.3);
    const rod = tramo(t, T.rodillas0, T.rodillas, entrada);
    const p = {
      x: XG + b.dx, suelo: SUELO, s: S, tirasLimpias: true, ikContinuo: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 * (1 - rod) },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // botes con el juego: el cuerpo acompaña a cada golpe (en la tercera ronda, mucho)
    for (const r of RONDAS) { const h = bombeo(t, r, 1); p.pelvis.y += (r === R3 ? 22 : 9) * h; p.cabeza.ang += (r === R3 ? 0.04 : 0.015) * h; }
    // ¡zas! al aplastarle los dedos, la cabeza da un respingo; al cortarle, igual
    p.cabeza.dy -= 10 * campana(t, ap1, ap1 + 0.25) + 12 * campana(t, tc2, tc2 + 0.25);
    // de rodillas: rebote al caer y hombros caídos; las palmaditas le hunden la cabeza
    p.pelvis.y -= 14 * campana(t, T.rodillas, T.rodillas + 0.22);
    for (const tp of PALMADAS) p.cabeza.dy += 7 * campana(t, tp - 0.02, tp + 0.16);
    // pies: plantados; al arrodillarse se van hacia atrás y quedan de puntillas
    for (const lado of ["cerca", "lejos"]) {
      const fx = lado === "cerca" ? XG - 19 : XG + 22;
      let tob = { x: G.PELVIS.x + (fx - p.x) / S, y: TOB_G[lado] }, ang = 0;
      if (rod > 0) {
        const atras = { x: G.PELVIS.x - 175 + (lado === "cerca" ? -20 : 25), y: G.SUELO - 58 };
        tob = mezcla(tob, atras, rod); ang = lerp(0, 1.1, rod);
      }
      p.piernas[lado] = { tob, ang };
    }
    // cara
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [0.7, 1.95, 4.6, 7.1, 9.35, 12.0, 13.95]));
    // el que sigue a la polilla con la mirada (y bizquea cuando pasa por delante de la nariz)
    const pol = tramo(t, T.polilla + 0.1, T.polilla + 0.3) * (1 - tramo(t, T.polillaFin - 0.45, T.polillaFin - 0.15));
    if (pol > 0) { const m = polilla(t); const c = G.aPantalla(p, G.centroCabeza(p));
      p.cara.mirada = { x: lerp(p.cara.mirada.x, clamp((m.x - c.x) / 90, -1, 1), pol), y: lerp(p.cara.mirada.y, clamp((m.y - c.y) / 70, -1, 1), pol) }; }
    p.rojo = 0.35 * tramo(t, ap1, ap1 + 0.1) * (1 - tramo(t, ap1 + 0.6, R2.ini)) + 0.85 * tramo(t, R3.ini - 0.4, R3.ini) * (1 - tramo(t, te3 + 0.2, T.rodillas0 + 0.2))
      + 0.4 * tramo(t, T.pat0 + 0.45, T.pat0 + 0.8);
    p.cara.rubor = p.rojo;
    p.sudor = tramo(t, tc2 + 0.2, tc2 + 0.6) * (1 - tramo(t, T.bolsillo1, T.bolsillo1 + 0.4));
    p.enfado = tramo(t, R3.ini - 0.3, R3.ini) * (1 - tramo(t, te3, te3 + 0.2));
    // manos
    const Tr = G.tronco(p), bolsC = Tr(manoDesde({ x: 131, y: 652 }, 0, -1.75)), bolsL = Tr(manoDesde({ x: 372, y: 648 }, 0, -1.75));
    // lejana: la del juego
    let l = bolsL, lmu = -1.75, lang = 0, lvis = 0, lf = FORMAS.piedra;
    const jg = juegoG(t, p);
    if (jg) {
      const sale = tramo(t, T.reta0, T.reta0 + 0.3);
      l = mezcla(bolsL, G.aHoja(p, jg.q), sale); lmu = lerp(-1.75, -Math.PI, sale); lvis = sale; lf = jg.f;
      if (t > T.rodillas0) {       // al caer de rodillas el brazo cuelga
        const k = tramo(t, T.rodillas0, T.rodillas0 + 0.35); lmu = lerp(-Math.PI, -1.75, k);
      }
    }
    // cercana: en el bolsillo
    let c = bolsC, cmu = -1.75, cang = 0, cvis = 0, cf = FORMAS.piedra;
    // los dos bolsillos del revés: las manos entran, sacan el forro y lo enseñan
    const fo = forros(t, p);
    if (t > T.bolsillo0) {
      const va = tramo(t, T.bolsillo0, T.bolsillo0 + 0.3);
      const pinzaL = fo.lejos.pinza, pinzaC = fo.cerca.pinza;
      l = mezcla(l, Tr(manoDesde(BOLS_G.lejos.b, 0, -1.75)), va * (1 - fo.k)); lmu = lerp(lmu, -1.75, va);
      l = mezcla(l, Tr(pinzaL), fo.k);
      lvis = Math.max(lvis * (1 - va), fo.k); lf = mezclaF(lf, FORMAS.pinza, va);
      c = mezcla(c, Tr(pinzaC), fo.k); cvis = fo.k; cf = FORMAS.pinza; cmu = lerp(-1.75, -1.45, fo.k);
      lmu = lerp(lmu, -2.0, fo.k);
      // suelta los forros y deja las manos en los muslos
      const deja = tramo(t, T.suelta, T.suelta + 0.35);
      if (deja > 0) {
        const mus = Tr({ x: G.PELVIS.x + 150, y: G.PELVIS.y + 130 }), musC = Tr({ x: G.PELVIS.x - 10, y: G.PELVIS.y + 150 });
        l = mezcla(l, mus, deja); c = mezcla(c, musC, deja); lf = mezclaF(lf, FORMAS.suelta, deja); cf = mezclaF(cf, FORMAS.suelta, deja);
        lmu = lerp(lmu, -2.0, deja); cmu = lerp(cmu, -2.0, deja);
      }
    }
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: -1, puno: 0, objeto: objetoMano(cf, cmu, cvis, COL_G, 1) };
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: -1, puno: 0, objeto: objetoMano(lf, lmu, lvis, COL_G, 1) };
    p.forros = fo;
    p.capaTronco = g => dibForros(g, p, fo);
    return p;
  }

  /* ---------- forros de los bolsillos ---------- */
  function forros(t, p) {
    const k = salida(fase(t, T.bolsillo0 + 0.3, T.bolsillo1 - 0.1));
    const deja = tramo(t, T.suelta, T.suelta + 0.35);
    const o = { k };
    for (const lado of ["cerca", "lejos"]) {
      const B = BOLS_G[lado], m = mezcla(B.a, B.b, 0.5), sg = lado === "cerca" ? -1 : 1;
      // el saco sale hacia fuera mientras tira de él y, al soltarlo, cuelga y se balancea
      const balanceo = 0.35 * Math.sin((t - T.suelta) * 6.5 + (lado === "cerca" ? 0 : 1.3)) * deja * Math.exp(-Math.max(0, t - T.suelta) * 1.4);
      const ang = lerp(sg * 0.75, sg * 0.18, deja) + balanceo + 0.04 * Math.sin(t * 2.2 + sg);    // respecto a la vertical
      const largo = 150 * k;
      const eje = { x: Math.sin(ang), y: Math.cos(ang) };
      o[lado] = { a: B.a, b: B.b, m, sg, eje, largo, punta: { x: m.x + eje.x * largo, y: m.y + eje.y * largo },
        pinza: { x: m.x + eje.x * 38 + sg * Math.cos(ang) * 22, y: m.y + eje.y * 38 - sg * Math.sin(ang) * 22 } };
    }
    return o;
  }
  function dibForros(g, p, fo) {
    if (fo.k <= 0.01) return;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    for (const lado of ["cerca", "lejos"]) {
      const f = fo[lado], { m, eje, largo } = f, w = { x: eje.y, y: -eje.x };        // w: perpendicular al eje
      const pt = (u, v) => ({ x: m.x + eje.x * u * largo + w.x * v, y: m.y + eje.y * u * largo + w.y * v });
      const ancho = u => fo.k * (30 + 16 * Math.sin(Math.PI * Math.min(1, u * 1.15)));
      const izq = [], der = [];
      for (let i = 1; i <= 6; i++) { const u = i / 7; izq.push(pt(u, -ancho(u))); der.push(pt(u, ancho(u))); }
      // fondo redondeado
      const fondo = []; for (let i = 0; i <= 6; i++) { const a = Math.PI * i / 6, r = ancho(0.9); fondo.push(pt(0.86 + 0.12 * Math.sin(a), -r * Math.cos(a))); }
      // de un borde de la boca del bolsillo al otro, rodeando el saco
      const da = (q, r) => (q.x - r.x) * w.x + (q.y - r.y) * w.y;
      const [A0, B0] = da(f.a, m) < da(f.b, m) ? [f.a, f.b] : [f.b, f.a];
      const pts = [A0, ...izq, ...fondo, ...der.reverse(), B0];
      const forma = () => { g.beginPath(); M2.curva(g, pts, true, 0.45); };
      forma(); g.fillStyle = "#f4f1ea"; g.fill();
      g.save(); forma(); g.clip();
      g.fillStyle = "#d6cfc2"; g.beginPath(); const c1 = pt(0.6, 12); g.ellipse(c1.x, c1.y, 18, largo * 0.32, Math.atan2(eje.x, eje.y) * -1, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "rgba(110,100,90,0.55)"; g.lineWidth = 2.4;
      for (const [u0, u1, v] of [[0.25, 0.55, -8], [0.5, 0.78, 10]]) { const q0 = pt(u0, v), q1 = pt(u1, v * 0.4); g.beginPath(); g.moveTo(q0.x, q0.y); g.lineTo(q1.x, q1.y); g.stroke(); }
      g.restore();
      forma(); g.lineWidth = 5; g.strokeStyle = "#0b0a0e"; g.stroke();
      g.lineWidth = 3.5; g.beginPath(); g.moveTo(f.a.x, f.a.y); g.lineTo(f.b.x, f.b.y); g.stroke();
    }
    g.restore();
  }

  /* ---------- polilla ---------- */
  let ORIGEN_POLILLA = null;
  function polilla(t) {
    if (!ORIGEN_POLILLA) { const p = poseG(T.polilla); ORIGEN_POLILLA = G.aPantalla(p, G.tronco(p)(p.forros.cerca.punta)); }
    const o = ORIGEN_POLILLA, u = fase(t, T.polilla, T.polillaFin);
    // sube revoloteando por delante de su cara, da una vuelta alrededor de la cabeza y se va arriba a la izquierda
    const sube = salida(fase(u, 0, 0.35));
    const vuelta = suave(fase(u, 0.3, 0.75)), vete = entrada(fase(u, 0.7, 1));
    const cabeza = { x: XG + 30, y: 300 };
    const ang = -Math.PI * 0.2 + vuelta * Math.PI * 2.2;
    let x = lerp(o.x, cabeza.x + 60, sube) + Math.cos(ang) * 70 * vuelta * (1 - vete), y = lerp(o.y, cabeza.y - 30, sube) + Math.sin(ang) * 40 * vuelta * (1 - vete);
    x = lerp(x, -80, vete); y = lerp(y, -80, vete);
    x += 10 * Math.sin(t * 17) + 5 * Math.sin(t * 29 + 1); y += 8 * Math.sin(t * 13 + 2) + 4 * Math.sin(t * 31);
    return { x, y, u, aleteo: Math.sin(t * 46) };
  }
  function dibPolilla(g, t) {
    if (t < T.polilla || t > T.polillaFin) return;
    const m = polilla(t), sale = tramo(t, T.polilla, T.polilla + 0.15);
    g.save(); g.translate(m.x, m.y); g.scale(1.6 * sale, 1.6 * sale); g.rotate(0.25 * Math.sin(t * 9)); g.lineJoin = "round";
    const ala = (sg) => { const ab = 0.35 + 0.65 * Math.abs(m.aleteo);
      g.save(); g.scale(1, sg * ab);
      g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-12, -16, -26, -12, -22, -2); g.quadraticCurveTo(-14, 2, 0, 0); g.closePath();
      g.fillStyle = "#b9a98d"; g.fill(); g.strokeStyle = "#2a2018"; g.lineWidth = 1.6; g.stroke();
      g.fillStyle = "#8a7a62"; g.beginPath(); g.ellipse(-14, -7, 4, 3, 0.3, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.moveTo(2, 0); g.bezierCurveTo(10, -14, 22, -12, 18, -2); g.quadraticCurveTo(10, 2, 2, 0); g.closePath();
      g.fillStyle = "#c8b99c"; g.fill(); g.stroke(); g.restore(); };
    ala(1); ala(-1);
    g.fillStyle = "#5a4a3a"; g.beginPath(); g.ellipse(0, 0, 4, 9, Math.PI / 2, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#1a120c"; g.lineWidth = 1.4; g.stroke();
    g.strokeStyle = "#2a2018"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(8, -2); g.quadraticCurveTo(14, -8, 16, -10); g.moveTo(8, 2); g.quadraticCurveTo(14, -2, 17, -4); g.stroke();
    g.restore();
    // polvillo que suelta
    g.save(); g.fillStyle = "rgba(220,205,170,0.7)";
    for (let i = 0; i < 6; i++) { const tt = t - i * 0.07; if (tt < T.polilla) continue; const q = polilla(tt);
      g.globalAlpha = 0.5 * (1 - i / 6); g.beginPath(); g.arc(q.x + 3 * Math.sin(i * 2.3), q.y + i * 3, 1.6, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }

  /* =====================================================================================
   * LAURA (a la derecha, en espejo: mira a la izquierda)
   * ===================================================================================== */
  const CARAS_L = {
    inicio: E({ orig: 1, sonr: 0.2 }),
    cuenta: E({ mx: 0.55, my: 0.75, c: 0.2, sd: 6, gd: 0.04, si: 6, gi: 0.04, orig: 0, sonr: 0.15, ancho: 0.9 }),
    ceja: E({ mx: 0.85, my: 0.05, c: 0.3, sd: 2, gd: 0.02, si: 18, gi: 0.14, orig: 0, sonr: 0.45, ancho: 0.9 }),
    listo: E({ mx: 0.9, my: 0.2, c: 0.28, sd: 4, gd: 0.04, si: 10, gi: 0.08, orig: 0, sonr: 0.5, ancho: 0.9 }),
    manos: E({ mx: 0.75, my: 0.55, c: 0.15, sd: 6, gd: 0.04, si: 8, gi: 0.06, orig: 0, sonr: 0.45, ancho: 0.9 }),
    chula: E({ mx: 0.85, my: 0.15, c: 0.3, sd: 6, gd: 0.04, si: 18, gi: 0.14, orig: 0, sonr: 0.8, ancho: 0.95 }),
    sopla: E({ mx: 0.5, my: 0.4, c: 0.5, sd: 8, gd: 0.06, si: 12, gi: 0.08, orig: 0, abre: 5, ancho: 0.4, sonr: 0, dientes: 0 }),
    risita: E({ mx: 0.6, my: 0.3, c: 0.75, h: 1, sd: 10, gd: 0.08, si: 10, gi: 0.08, orig: 0, abre: 8, ancho: 0.95, sonr: 0.85 }),
    camara: E({ mx: -0.85, my: -0.05, c: 0.2, sd: 8, gd: 0.06, si: 14, gi: 0.1, orig: 0, sonr: 0.7, ancho: 0.95 }),
    risa: E({ mx: 0, my: -0.4, c: 1, h: 1, sd: 16, gd: 0.12, si: 16, gi: 0.12, orig: 0, abre: 40, ancho: 1.05, sonr: 0.9, lengua: 0.6 }),
    apunta: E({ mx: 0.75, my: 0.35, c: 0.35, sd: 2, gd: 0, si: 14, gi: 0.12, orig: 0, sonr: 0.6, ancho: 0.9 }),
    tierna: E({ mx: 0.8, my: 0.6, c: 0.2, sd: 12, gd: -0.12, si: 12, gi: -0.12, orig: 0, sonr: 0.55, ancho: 0.95 }),
    guino: E({ mx: -0.85, my: -0.05, cd: 1, h: 1, sd: 10, gd: 0.08, si: 16, gi: 0.12, orig: 0, sonr: 0.85, ancho: 1, abre: 4 })
  };
  const GUION_CARA_L = [
    [T.mira + 0.08, T.mira + 0.28, "cuenta"], [T.seMiran, T.seMiran + 0.15, "inicio"], [T.reta1 - 0.15, T.reta1, "ceja"],
    [1.8, 2.0, "listo"], [R1.rev - 0.04, R1.rev + 0.1, "manos"], [ap1 + 0.05, ap1 + 0.2, "chula"], [ap1 + 0.25, ap1 + 0.4, "sopla"],
    [ap1 + 0.62, ap1 + 0.78, "listo"], [R2.rev - 0.04, R2.rev + 0.1, "manos"], [tc2 + 0.05, tc2 + 0.2, "risita"], [R3.ini - 0.4, R3.ini - 0.2, "listo"],
    [R3.rev - 0.04, R3.rev + 0.1, "manos"], [te3 + 0.1, te3 + 0.3, "chula"], [T.rodillas0 + 0.1, T.rodillas0 + 0.3, "camara"],
    [T.risa0, T.risa0 + 0.12, "risa"], [T.risa1, T.risa1 + 0.2, "apunta"], [T.cae, T.cae + 0.2, "camara"], [T.anda0 + 0.3, T.anda0 + 0.5, "tierna"],
    [T.guino, T.guino + 0.12, "guino"]
  ];
  const TOB_L = { cerca: L.SUELO - L.TOBILLO_ALTO, lejos: L.SUELO - L.TOBILLO_ALTO - 10 };
  const PALMADAS = [12.99, 13.24, 13.47];
  const FIN_L = T.rodillas0 + 0.3;
  // mano lejana de Laura después del juego: [t0, t1, destino, mu, forma, visible, curva]
  const TRAMOS_L = [
    [T.risa0 - 0.05, T.risa0 + 0.2, "boca", 2.2, "abierta", 1],
    [T.risa0 + 0.55, T.tarjeta0 + 0.1, "bolsillo", 4.53, "tarjeta", 0.3],
    [T.tarjeta1, T.apunta, "carga", 2.3, "tarjeta", 1],
    [T.lanza - 0.04, T.lanza + 0.08, "lanza", Math.PI, "abierta", 1, salida],
    [T.cae - 0.1, T.anda0 + 0.2, "baja", 4.53, "suelta", 1],
    [T.pat0 - 0.1, T.pat0 + 0.12, "pat", 3.44, "abierta", 1],
    [T.pat1 - 0.05, T.pat1 + 0.3, "baja", 4.53, "suelta", 1]
  ];
  // sitio desde el que Laura alcanza la coronilla de Guillermo arrodillado (se calcula una vez)
  let XL_PAT = null;
  const CORONILLA = { x: 820, y: 330 };              // punto del pelo de Guillermo (retrato)
  function preparaPat() {
    const pg = poseG(T.pat0 + 0.3), cor = G.aPantalla(pg, G.cabeza(pg).a(CORONILLA));
    const brazo = (L.A.datos.piezas.brazo.fin[1] - L.A.datos.piezas.brazo.raiz[1]) * S * L.K;
    let lo = cor.x + 20, hi = cor.x + 260;
    for (let i = 0; i < 40; i++) {
      const m = (lo + hi) / 2;
      const p = { x: m, suelo: SUELO, s: S, espejo: true, pelvis: { x: L.PELVIS.x, y: L.PELVIS.y + CUERPOS_L.pat.pel }, torso: CUERPOS_L.pat.torso, torsoEsc: { x: 1, y: 1 } };
      const h = L.aPantalla(p, L.tronco(p)(L.HOMBRO)), d = Math.hypot(cor.x + 4 - h.x, cor.y - 12 - h.y);
      if (d > brazo * 0.93) hi = m; else lo = m;
    }
    XL_PAT = (lo + hi) / 2; return XL_PAT;
  }
  const CUERPOS_L = {
    quieto: { dx: 0, pel: 0, torso: 0, cab: 0 }, juega: { dx: -4, pel: 6, torso: 0.05, cab: 0.03 },
    risa: { dx: 8, pel: 14, torso: -0.12, cab: -0.2 }, lanza: { dx: 0, pel: 4, torso: 0.06, cab: 0.02 },
    pat: { dx: 0, pel: 12, torso: 0.28, cab: 0.2 }
  };
  const GUION_CUERPO_L = [[1.7, 2.0, "juega"], [T.risa0, T.risa0 + 0.2, "risa"], [T.risa1, T.risa1 + 0.25, "lanza"], [T.anda1 - 0.2, T.anda1 + 0.1, "pat"]];
  function pieL(lado, t) {      // x de pantalla del tobillo de Laura y altura del paso
    const xp = XL_PAT ?? preparaPat();
    const ini = lado === "cerca" ? XL + 22 : XL - 20, fin = lado === "cerca" ? xp + 22 : xp - 20;
    const pasos = lado === "lejos" ? [[T.anda0, T.anda0 + 0.32, lerp(ini, fin, 0.55)], [T.anda0 + 0.62, T.anda1, fin]]
                                   : [[T.anda0 + 0.3, T.anda0 + 0.62, lerp(ini, fin, 0.75) + 6], [T.anda1 - 0.05, T.anda1 + 0.2, fin]];
    let x = ini, alto = 0;
    for (const [t0, t1, xd] of pasos) { const u = fase(t, t0, t1); if (u <= 0) break; const k = suave(u); x = lerp(x, xd, k); alto = Math.max(alto, Math.sin(Math.PI * u)); if (u < 1) break; }
    return { x, alto };
  }

  function poseL(t, pg) {
    const xp = XL_PAT ?? preparaPat();
    const b = guion(GUION_CUERPO_L, CUERPOS_L, "quieto", t);
    const respira = Math.sin(t * 2.1 + 1);
    const anda = suave(fase(t, T.anda0, T.anda1 + 0.15));
    const risa = campana(t, T.risa0, T.risa1 + 0.15);
    const p = {
      x: lerp(XL, xp, anda) + b.dx, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: L.PELVIS.x, y: L.PELVIS.y + b.pel + respira * 1.1 + 6 * Math.abs(Math.sin(t * 15)) * risa },
      torso: b.torso + 0.025 * Math.sin(t * 15) * risa, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.04 * Math.sin(t * 15 + 0.5) * risa, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      pelo: { viento: 0, inercia: 0 }
    };
    // botes con el juego
    for (const r of RONDAS) { const h = bombeo(t, r, 1); p.pelvis.y += 6 * h; }
    // se echa hacia él para aplastar, cortar y envolver (con el brazo tan corto no llegaría)
    const lunge = Math.max(tramo(t, R1.rev + 0.2, ap1 - 0.12) * (1 - tramo(t, ap1 + 0.35, ap1 + 0.7)),
      tramo(t, R2.rev + 0.15, tc2 - 0.08) * (1 - tramo(t, tc2 + 0.35, tc2 + 0.7)),
      tramo(t, te3 - 0.08, te3 + 0.14) * (1 - tramo(t, T.rodillas0, T.rodillas0 + 0.35)));
    p.x -= 22 * lunge; p.torso += 0.22 * lunge; p.pelvis.y += 8 * lunge; p.cabeza.ang -= 0.08 * lunge;
    // encoge los hombros al aceptar el reto
    const enc = campana(t, T.reta1 - 0.1, T.reta1 + 0.35);
    p.cabeza.dy = 8 * enc; p.torsoEsc.y += 0.02 * enc;
    // la melena se mueve con la risa, el lanzamiento y los pasos
    p.pelo.inercia = 0.35 * Math.sin(t * 15) * risa + 0.4 * campana(t, T.lanza - 0.05, T.lanza + 0.45) - 0.35 * campana(t, T.anda0, T.anda1 + 0.3);
    for (const lado of ["cerca", "lejos"]) {
      const f = pieL(lado, t);
      p.piernas[lado] = { tob: { x: L.aHoja(p, { x: f.x, y: 0 }).x, y: TOB_L[lado] - 52 * f.alto }, ang: -0.2 * f.alto };
    }
    const ex = guion(GUION_CARA_L, CARAS_L, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [0.75, 2.0, 4.45, 7.15, 9.6, 12.25, 14.0]));
    // manos
    const Tr = L.tronco(p), bolsC = Tr(L.BOLSILLO_C), bolsL = Tr(L.BOLSILLO_L);
    const boca = L.aPantalla(p, L.boca(p));
    // cercana: en la cadera mientras juega; en la tripa al reírse; en la cadera al ir hacia él
    const cadera = Tr({ x: L.PELVIS.x - 150, y: L.PELVIS.y - 30 });
    let c = bolsC, cmu = -1.75, cang = 0, cvis = 0, cf = FORMAS.suelta, cdob = -1;
    const enCadera = tramo(t, 1.85, 2.25) * (1 - tramo(t, T.risa0 - 0.1, T.risa0 + 0.15)) + tramo(t, T.risa1 + 0.1, T.risa1 + 0.45);
    const enTripa = tramo(t, T.risa0 - 0.1, T.risa0 + 0.15) * (1 - tramo(t, T.risa1 + 0.1, T.risa1 + 0.45));
    c = mezcla(c, cadera, clamp(enCadera)); cmu = lerp(cmu, -2.3, clamp(enCadera)); cang = 0; cvis = clamp(enCadera + enTripa);
    const tripa = Tr({ x: L.PELVIS.x + 60, y: L.PELVIS.y - 110 });
    c = mezcla(c, tripa, enTripa); cmu = lerp(cmu, -2.6, enTripa); cf = mezclaF(cf, FORMAS.abierta, enTripa);
    // lejana: la del juego; luego se tapa la boca, saca la tarjeta, la lanza y le da palmaditas
    let l = bolsL, lmu = -1.75, lang = 0, lvis = 0, lf = FORMAS.piedra, ldob = 1, extra = null;
    const jl = juegoL(t, pg, p);
    if (jl) {
      const sale = tramo(t, T.acepta0, T.acepta1);
      l = mezcla(bolsL, L.aHoja(p, jl.q), sale); lmu = lerp(-1.75, -Math.PI, sale); lvis = sale; lf = jl.f; ldob = lerp(1, -1, sale);
    }
    if (t > FIN_L) {
      const hombro = L.aPantalla(p, Tr(L.HOMBRO));
      let up = 0; for (const tp of PALMADAS) up += campana(t, tp - 0.12, tp);
      const cor = pg ? G.aPantalla(pg, G.cabeza(pg).a(CORONILLA)) : { x: 0, y: 0 };
      const dest = {
        boca: () => ({ x: boca.x - 16, y: boca.y + 8 }), bolsillo: () => L.aPantalla(p, bolsL),
        carga: () => ({ x: hombro.x - 58, y: hombro.y - 50 }), lanza: () => ({ x: hombro.x - 80, y: hombro.y + 2 }),
        baja: () => ({ x: hombro.x - 8, y: hombro.y + 88 }), pat: () => ({ x: cor.x + 4, y: cor.y - 12 - 14 * up })
      };
      let e = { q: { x: SACA_L.x + 20, y: SACA_L.y + 24 }, mu: Math.PI, f: FORMAS.abierta, vis: 1 };
      for (const [t0, t1, nom, mu, fo, vis, curva] of TRAMOS_L) {
        if (t <= t0) break;
        const k = (curva || suave)(fase(t, t0, t1)), d = dest[nom]();
        e = { q: mezcla(e.q, d, k), mu: lerp(e.mu, mu, k), f: mezclaF(e.f, FORMAS[fo], k), vis: lerp(e.vis, vis, k) };
      }
      // mientras se lleva la mano a por la tarjeta, la tarjeta aparece al sacarla del bolsillo
      l = L.aHoja(p, e.q); lmu = e.mu; lf = e.f; lvis = e.vis; ldob = -1; lang = 0;
      if (t > T.tarjeta0 + 0.05 && t < T.lanza) extra = (g, cuando) => { if (cuando === "despues") tarjetaEnMano(g); };
    }
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: cdob, puno: 0, objeto: objetoMano(cf, cmu, cvis, COL_L, L.K) };
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: ldob, puno: 0, objeto: objetoMano(lf, lmu, lvis, COL_L, L.K, extra) };
    return p;
  }
  const pose = t => { const g = poseG(t); return { g, l: poseL(t, g) }; };

  /* ---------- la tarjeta de Laura ---------- */
  function tarjeta(g, w = 1) {        // centrada, unidades de pantalla a escala 1 (≈ 30 × 19 px)
    g.save(); g.lineJoin = "round";
    g.fillStyle = "#1e4fa8"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.6;
    g.beginPath(); g.roundRect ? g.roundRect(-15 * w, -9.5, 30 * w, 19, 3) : g.rect(-15 * w, -9.5, 30 * w, 19); g.fill(); g.stroke();
    g.fillStyle = "#3e78d8"; g.fillRect(-15 * w + 1.5, -8, 28 * w - 3, 4);
    g.fillStyle = "#f2c14e"; g.fillRect(-10 * w, -2, 7 * w, 5.5);
    g.strokeStyle = "rgba(255,255,255,0.6)"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(1 * w, 5); g.lineTo(11 * w, 5); g.stroke();
    g.restore();
  }
  function tarjetaEnMano(g) { g.save(); g.translate(13, 4); g.rotate(-0.4); g.scale(0.85 / (G.JK * S), 0.85 / (G.JK * S)); tarjeta(g); g.restore(); }
  let ORIGEN_TARJETA = null;
  function vueloTarjeta(t) {
    if (!ORIGEN_TARJETA) { const P = pose(T.lanza); const pl = P.l; ORIGEN_TARJETA = L.aPantalla(pl, pl.manoLejos); }
    const o = ORIGEN_TARJETA, d = { x: BANDEJA.x + 4, y: BANDEJA.y - 5 }, u = fase(t, T.lanza, T.cae);
    const x = lerp(o.x, d.x, u), y = lerp(o.y, d.y, u) - 70 * Math.sin(Math.PI * u);
    return { x, y, giro: Math.cos(u * Math.PI * 5), u };
  }

  /* ---------- efectos ---------- */
  function estrellaPuntas(g, x, y, r, puntas, rot, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function impacto(g, t, t0, x, y, tam) {
    const k = fase(t, t0, t0 + 0.3); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    estrellaPuntas(g, x, y, tam * (0.6 + 0.8 * salida(k)), 10, 0.3, 0.42); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2.5; g.strokeStyle = "#0b0a0e"; g.stroke();
    estrellaPuntas(g, x, y, tam * (0.35 + 0.5 * salida(k)), 10, 0.55, 0.5); g.fillStyle = "#ffffff"; g.fill();
    g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2, r0 = tam * (0.9 + 0.9 * k), r1 = r0 + tam * 0.45; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // «tris, tras»: chispitas y rayas de corte
  function corte(g, t, t0, x, y) {
    const k = fase(t, t0, t0 + 0.22); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k; g.strokeStyle = "#ffffff"; g.lineWidth = 2.6; g.lineCap = "round";
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.5, r0 = 8 + 14 * salida(k); g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * (r0 + 8), y + Math.sin(a) * (r0 + 8)); g.stroke(); }
    estrellaPuntas(g, x, y, 7 * (1 - k * 0.5), 4, 0.4 + k, 0.35); g.fillStyle = "#fff8c0"; g.fill();
    g.restore();
  }
  // brillo de la tarjeta al aterrizar
  function brillo(g, t, t0, x, y) {
    const k = fase(t, t0, t0 + 0.4); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = Math.sin(Math.PI * k); g.translate(x, y); g.rotate(k * 1.2);
    estrellaPuntas(g, 0, 0, 13, 4, 0, 0.22); g.fillStyle = "#fffbe0"; g.fill(); g.restore();
  }
  function soplido(g, t, t0, t1, b, sg) {        // líneas de aire que salen de la boca hacia los dedos
    const k = tramo(t, t0, t0 + 0.1) * (1 - tramo(t, t1 - 0.1, t1)); if (k <= 0.01) return;
    g.save(); g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 2; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const ph = (t * 2.4 + i / 3) % 1; g.globalAlpha = k * Math.sin(Math.PI * ph);
      const x = b.x + sg * (6 + 22 * ph), y = b.y + 2 + (i - 1) * 5 + 4 * ph; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + sg * 5, y - 3, x + sg * 10, y); g.stroke(); }
    g.restore();
  }
  function polvo(g, t, x0) {
    const k = fase(t, T.rodillas - 0.02, T.rodillas + 0.8); if (k <= 0 || k >= 1) return;
    g.save();
    for (let i = 0; i < 8; i++) { const lado = i % 2 ? 1 : -1, d = (24 + 80 * salida(k)) * (0.5 + hash(i + 70) * 0.7);
      g.globalAlpha = 0.38 * (1 - k); g.fillStyle = "#a88f72";
      g.beginPath(); g.ellipse(x0 + lado * d, SUELO - 6 - 18 * k * hash(i + 71), 12 + 18 * k, 6 + 8 * k, 0, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // rayitas de sacudir la mano dolorida
  function sacudida(g, t, pg) {
    const k = campana(t, ap1 + 0.3, ap1 + 0.7); if (k <= 0.05) return;
    const m = G.aPantalla(pg, pg.manoLejos);
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.8 * k})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const a = -0.6 + i * 0.6; g.beginPath(); g.arc(m.x, m.y, 30 + i * 2, a - 0.25, a + 0.25); g.stroke(); g.beginPath(); g.arc(m.x, m.y, 30 + i * 2, Math.PI + a - 0.25, Math.PI + a + 0.25); g.stroke(); }
    g.restore();
  }
  // gotitas de sudor que salen despedidas en la tercera ronda
  function gotas(g, t, pg) {
    const k = tramo(t, R3.ini, R3.ini + 0.2) * (1 - tramo(t, R3.rev, R3.rev + 0.3)); if (k <= 0.02) return;
    const c = G.aPantalla(pg, G.cabeza(pg).a({ x: 620, y: 420 }));
    g.save(); g.lineWidth = 1.5; g.strokeStyle = "#1d3b52";
    for (let i = 0; i < 4; i++) { const ph = ((t - R3.ini) * 3.2 + i / 4) % 1, a = -2.2 - i * 0.25;
      const x = c.x + Math.cos(a) * (10 + 40 * ph), y = c.y + Math.sin(a) * (10 + 40 * ph) + 30 * ph * ph;
      g.globalAlpha = k * Math.sin(Math.PI * ph); g.fillStyle = "#bfe8ff"; g.beginPath(); g.ellipse(x, y, 3.4, 4.6, a, 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.restore();
  }

  /* ---------- decorado: taberna verde esmeralda con la barra detrás ---------- */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 160; c.height = H + 160; const g = c.getContext("2d");
    g.translate(80, 80);
    // pared verde
    const pared = g.createLinearGradient(0, -80, 0, 330); pared.addColorStop(0, "#0a2a20"); pared.addColorStop(1, "#16503b");
    g.fillStyle = pared; g.fillRect(-80, -80, W + 160, 420);
    // papel pintado con rombos muy suaves
    g.fillStyle = "rgba(255,255,255,0.035)";
    for (let y = -70; y < 320; y += 36) for (let x = -80 + ((y / 36) % 2 ? 18 : 0); x < W + 80; x += 36) { g.beginPath(); g.moveTo(x, y - 7); g.lineTo(x + 6, y); g.lineTo(x, y + 7); g.lineTo(x - 6, y); g.closePath(); g.fill(); }
    // espejo de la contrabarra con marco de madera
    g.fillStyle = "#3a1c0c"; g.fillRect(150, 20, 724, 210);
    const esp = g.createLinearGradient(160, 30, 864, 220); esp.addColorStop(0, "#28423a"); esp.addColorStop(0.5, "#3b5c52"); esp.addColorStop(1, "#22382f");
    g.fillStyle = esp; g.fillRect(162, 32, 700, 186);
    g.strokeStyle = "rgba(255,255,255,0.10)"; g.lineWidth = 16;
    for (const x of [260, 320, 640]) { g.beginPath(); g.moveTo(x, 214); g.lineTo(x + 90, 36); g.stroke(); }
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(150, 20, 724, 210);
    // estantes con botellas delante del espejo
    for (const [y0, n, sem] of [[118, 16, 0], [214, 18, 40]]) {
      g.fillStyle = "#5c2e14"; g.fillRect(150, y0, 724, 9); g.fillStyle = "#2a1408"; g.fillRect(150, y0 + 9, 724, 4);
      for (let i = 0; i < n; i++) {
        const x = 176 + i * (680 / n) + hash(i + sem) * 8, h = 46 + hash(i + sem + 3) * 34, w = 13 + hash(i + sem + 5) * 7;
        const cols = ["#2f6b2a", "#7a2a1c", "#c99a2e", "#d8d6c8", "#2c3f7a", "#5a2d6e", "#a8541c", "#1f4a3a"];
        g.fillStyle = cols[Math.floor(hash(i + sem + 7) * cols.length)]; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.6;
        g.beginPath(); g.moveTo(x - w / 2, y0); g.lineTo(x - w / 2, y0 - h * 0.62); g.quadraticCurveTo(x - w / 2, y0 - h * 0.74, x - w * 0.18, y0 - h * 0.8);
        g.lineTo(x - w * 0.18, y0 - h); g.lineTo(x + w * 0.18, y0 - h); g.lineTo(x + w * 0.18, y0 - h * 0.8);
        g.quadraticCurveTo(x + w / 2, y0 - h * 0.74, x + w / 2, y0 - h * 0.62); g.lineTo(x + w / 2, y0); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = "rgba(255,255,255,0.75)"; g.fillRect(x - w / 2 + 2, y0 - h * 0.55, 2, h * 0.4);
        g.fillStyle = "#efe6cf"; g.fillRect(x - w / 2 + 1.5, y0 - h * 0.42, w - 3, h * 0.2);
      }
    }
    // caja registradora de latón a la izquierda (sin números)
    g.save(); g.translate(64, 250); g.lineJoin = "round"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5;
    g.fillStyle = "#b8862e"; g.beginPath(); g.moveTo(-40, 50); g.lineTo(-34, -6); g.lineTo(34, -6); g.lineTo(40, 50); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#d6a84a"; g.beginPath(); g.roundRect ? g.roundRect(-24, -40, 48, 34, 6) : g.rect(-24, -40, 48, 34); g.fill(); g.stroke();
    g.fillStyle = "#2a2218"; g.fillRect(-16, -32, 32, 16);
    for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) { g.fillStyle = "#f2ead8"; g.beginPath(); g.arc(-24 + i * 16, 8 + r * 14, 5, 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.restore();
    // farolillos verdes colgantes
    for (const lx of [300, 724]) {
      g.strokeStyle = "#0a0a0c"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(lx, -80); g.lineTo(lx, -6); g.stroke();
      const halo = g.createRadialGradient(lx, 18, 4, lx, 18, 190); halo.addColorStop(0, "rgba(255,214,140,0.55)"); halo.addColorStop(1, "rgba(255,200,120,0)");
      g.fillStyle = halo; g.beginPath(); g.arc(lx, 18, 190, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#1f6b4a"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(lx - 40, 22); g.quadraticCurveTo(lx - 34, -12, lx, -12); g.quadraticCurveTo(lx + 34, -12, lx + 40, 22); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "rgba(160,230,190,0.5)"; g.beginPath(); g.moveTo(lx - 26, 14); g.quadraticCurveTo(lx - 20, -4, lx - 6, -8); g.lineTo(lx - 10, 14); g.closePath(); g.fill();
      g.fillStyle = "#ffe9b8"; g.beginPath(); g.ellipse(lx, 22, 32, 6, 0, 0, Math.PI * 2); g.fill();
    }
    // luz cálida general sobre la barra
    const foco = g.createRadialGradient(512, 250, 40, 512, 250, 520); foco.addColorStop(0, "rgba(255,210,140,0.28)"); foco.addColorStop(1, "rgba(255,180,100,0)");
    g.fillStyle = foco; g.fillRect(-80, -80, W + 160, H + 160);
    // la barra: tablero de caoba y frente con cuarterones
    const yT = CT;
    g.fillStyle = "#3c1a0b"; g.fillRect(-80, yT + 8, W + 160, SUELO - yT - 8);
    for (let x = -60; x < W + 80; x += 128) {
      g.fillStyle = "#4e2410"; g.fillRect(x + 10, yT + 30, 108, SUELO - yT - 74);
      g.strokeStyle = "rgba(0,0,0,0.45)"; g.lineWidth = 3; g.strokeRect(x + 10, yT + 30, 108, SUELO - yT - 74);
      g.strokeStyle = "rgba(255,190,130,0.16)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 12, yT + 32); g.lineTo(x + 116, yT + 32); g.stroke();
    }
    const tab = g.createLinearGradient(0, yT - 8, 0, yT + 12); tab.addColorStop(0, "#a0542a"); tab.addColorStop(0.5, "#7a3a1a"); tab.addColorStop(1, "#4a200c");
    g.fillStyle = tab; g.fillRect(-80, yT - 8, W + 160, 18);
    g.fillStyle = "rgba(255,220,180,0.35)"; g.fillRect(-80, yT - 8, W + 160, 3);
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-80, yT - 8); g.lineTo(W + 80, yT - 8); g.moveTo(-80, yT + 10); g.lineTo(W + 80, yT + 10); g.stroke();
    // barra de latón para los pies
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 9; g.beginPath(); g.moveTo(-80, SUELO - 30); g.lineTo(W + 80, SUELO - 30); g.stroke();
    g.strokeStyle = "#d6a84a"; g.lineWidth = 5; g.stroke();
    g.strokeStyle = "rgba(255,245,200,0.7)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-80, SUELO - 32); g.lineTo(W + 80, SUELO - 32); g.stroke();
    for (let x = 40; x < W; x += 210) { g.fillStyle = "#b8862e"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 5, SUELO - 30); g.lineTo(x - 3, SUELO - 8); g.lineTo(x + 3, SUELO - 8); g.lineTo(x + 5, SUELO - 30); g.closePath(); g.fill(); g.stroke(); }
    // suelo de baldosas de barro
    const su = g.createLinearGradient(0, SUELO, 0, H + 80); su.addColorStop(0, "#6e3a22"); su.addColorStop(1, "#2a140a");
    g.fillStyle = su; g.fillRect(-80, SUELO, W + 160, H + 80 - SUELO);
    g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = 2;
    for (let y = SUELO + 9; y < H + 80; y += 12 + (y - SUELO) * 0.3) { g.beginPath(); g.moveTo(-80, y); g.lineTo(W + 80, y); g.stroke(); }
    for (let i = -12; i < 14; i++) { g.beginPath(); g.moveTo(512 + i * 70, SUELO); g.lineTo(512 + i * 130, H + 80); g.stroke(); }
    g.fillStyle = "rgba(255,210,150,0.15)"; g.fillRect(-80, SUELO, W + 160, 2);
    // viñeta
    const v = g.createRadialGradient(512, 300, 300, 512, 300, 740); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.55)");
    g.fillStyle = v; g.fillRect(-80, -80, W + 160, H + 160);
    return c;
  }
  // bandeja con la cuenta (sin letras: solo rayitas) y la tarjeta encima cuando aterriza
  function bandeja(g, t) {
    const { x, y } = BANDEJA;
    const bote = t >= T.cae ? Math.exp(-(t - T.cae) * 12) * Math.abs(Math.sin((t - T.cae) * 30)) * 3 : 0;
    g.save(); g.lineJoin = "round"; g.translate(0, -bote);
    g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse(x + 2, y + 3 + bote, 36, 5, 0, 0, Math.PI * 2); g.fill();
    const pl = g.createLinearGradient(x - 34, 0, x + 34, 0); pl.addColorStop(0, "#9aa3ad"); pl.addColorStop(0.45, "#eef2f6"); pl.addColorStop(1, "#7c858f");
    g.fillStyle = pl; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2;
    g.beginPath(); g.ellipse(x, y, 34, 7, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 1.2; g.beginPath(); g.ellipse(x, y - 0.5, 27, 4.5, 0, Math.PI * 1.05, Math.PI * 1.7); g.stroke();
    // la cuenta: papel doblado en tienda con rayitas
    g.fillStyle = "#fbf6ea"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(x - 20, y - 1); g.lineTo(x - 13, y - 26); g.lineTo(x + 9, y - 26); g.lineTo(x + 2, y - 1); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#e9dfca"; g.beginPath(); g.moveTo(x + 2, y - 1); g.lineTo(x + 9, y - 26); g.lineTo(x + 14, y - 1); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "rgba(60,50,40,0.55)"; g.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) { const yy = y - 21 + i * 5, x0 = x - 14 + (i * 5) * 0.28; g.beginPath(); g.moveTo(x0, yy); g.lineTo(x0 + 12 - (i === 3 ? 5 : 0), yy); g.stroke(); }
    // caramelito de menta
    g.fillStyle = "#e8f6ec"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 1.3; g.beginPath(); g.ellipse(x + 22, y - 3, 5, 3.4, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = "#2f9a5a"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x + 19, y - 4); g.lineTo(x + 25, y - 2); g.stroke();
    // la tarjeta, ya apoyada
    if (t >= T.cae) { g.save(); g.translate(x + 4, y - 5); g.scale(1, 0.55); g.rotate(-0.12); tarjeta(g); g.restore(); }
    g.restore();
  }

  /* ---------- cámara ---------- */
  // [t0, t1, k, x, y]: se mezcla de una toma a la siguiente
  const TOMAS = [
    [1.65, 2.0, 1.28, 512, 262],
    [R1.rev - 0.42, R1.rev + 0.12, 1.56, 513, 258], [ap1 + 0.35, R2.ini - 0.1, 1.28, 512, 262],
    [R2.rev - 0.42, R2.rev + 0.12, 1.56, 513, 258], [tc2 + 0.45, R3.ini - 0.1, 1.3, 512, 262],
    [R3.rev - 0.42, R3.rev + 0.12, 1.56, 513, 258], [T.rodillas0 - 0.05, T.rodillas + 0.15, 1.0, 512, 314],
    [T.anda0, T.anda1 + 0.3, 1.1, 474, 330], [T.pat1 + 0.1, T.fin, 1.06, 486, 322]
  ];
  function camara(t) {
    let c = { k: 1.0, x: 512, y: 312 };
    for (const [t0, t1, k, x, y] of TOMAS) { if (t <= t0) break; const u = suave(fase(t, t0, t1)); c = { k: lerp(c.k, k, u), x: lerp(c.x, x, u), y: lerp(c.y, y, u) }; }
    return c;
  }

  class PiedraPapelTijera extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !L.listo()) return;
      if (!fondo) fondo = creaFondo();
      const P = pose(t), pg = P.g, pl = P.l;
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = (t >= ap1 ? 4 * Math.exp(-(t - ap1) * 9) * suave(fase(t, ap1, ap1 + 0.04)) : 0)
        + (t >= T.rodillas ? 5 * Math.exp(-(t - T.rodillas) * 8) * suave(fase(t, T.rodillas, T.rodillas + 0.04)) : 0);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      g.drawImage(fondo, -80, -80);
      bandeja(g, t);
      // sombras
      g.save(); g.fillStyle = "rgba(0,0,0,0.36)";
      g.beginPath(); g.ellipse(pg.x - 10 * tramo(t, T.rodillas0, T.rodillas), SUELO + 1, lerp(90, 120, tramo(t, T.rodillas0, T.rodillas)), 8, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pl.x, SUELO + 1, 80, 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
      G.dibujar(g, pg, t);
      L.dibujar(g, pl, t);
      // efectos de las rondas
      impacto(g, t, ap1, SACA_G.x + 26, SACA_G.y - 6, 22);
      for (const tt of [tc2, tc2 + 0.2]) corte(g, t, tt, SACA_G.x + 32, SACA_G.y - 2);
      sacudida(g, t, pg);
      soplido(g, t, ap1 + 0.45, ap1 + 0.75, G.aPantalla(pg, G.boca(pg)), 1);
      soplido(g, t, ap1 + 0.3, ap1 + 0.62, L.aPantalla(pl, L.boca(pl)), -1);
      gotas(g, t, pg);
      polvo(g, t, pg.x);
      dibPolilla(g, t);
      // la tarjeta volando hasta la bandeja
      if (t >= T.lanza && t < T.cae) {
        const v = vueloTarjeta(t); g.save(); g.translate(v.x, v.y); g.scale(v.giro, 1); g.rotate(v.u * 3); tarjeta(g); g.restore();
      }
      brillo(g, t, T.cae, BANDEJA.x + 16, BANDEJA.y - 14);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00020", nombre: "Guillermo y Laura · Piedra, papel o tijera", crear: () => new PiedraPapelTijera() });
  window.__A2D_00020 = { pose, T, DUR, RONDAS, camara };
})();
