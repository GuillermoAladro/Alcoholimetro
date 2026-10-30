"use strict";
/* 00036 · Guillermo y Ander · La máquina del gancho
 *
 * Negro → rincón de recreativos de noche: moqueta de colores, neones sin letras y máquinas al
 * fondo. En el centro, una máquina del gancho turquesa y rosa llena de peluches redondos (pollitos,
 * gatitos, ballenas, ranas, pulpos, nubes y naranjas). Guillermo, a la izquierda, junto a la consola;
 * Ander, a la derecha, con las manos en los bolsillos.
 * → Guillermo besa una moneda y la mete. Maneja la palanca con la lengua fuera, aporrea el botón:
 *   el gancho baja, coge un gatito rosa, lo sube… y justo encima de la rampa se le escurre, rebota en
 *   el borde y vuelve al montón. Guillermo, que ya celebraba, se lleva las manos a la cabeza.
 * → Segunda moneda, rojo de rabia: el pollito se le escapa nada más levantarlo. Zarandea la palanca;
 *   Ander se tapa la boca aguantando la risa.
 * → Tercera moneda, con muchísimo cuidado y un solo dedo: el gancho se cierra en el aire, al lado
 *   del gatito, y abre y cierra las pinzas como burlándose. Guillermo apoya la frente en el cristal.
 * → Ander, sin mirar, lanza una moneda con el pulgar por encima de Guillermo directa a la ranura y le
 *   da a la máquina un golpecito de cadera: el gancho baja solo, se hunde en el montón y saca un
 *   peluche gigante, que entra a presión por la rampa y sale disparado por la trampilla. Ander lo caza
 *   con una mano sin mirar y se lo lanza a Guillermo, que lo abraza haciendo pucheros. Guiño → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto `t` (el balanceo del gancho se integra una sola vez al
 * cargar, en una tabla), así cualquier instante sale igual a cualquier fps.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, A = Ander;
  const S = 0.30, SUELO = 560, DUR = 15.0, TINTA = "#0b0a0e";
  const T = {
    mira: 0.35, saca1: 0.48, beso1: 0.78, mete1: 1.08, clin1: 1.16, coge1: 1.26,
    g1a: 1.34, g1b: 2.42, alza1: 2.44, boton1: 2.56, baja1: 2.6, toca1: 2.98, cierra1: 3.04, sube1: 3.12, arriba1: 3.5, lleva1b: 4.18,
    reza1: 2.7, yes1: 3.7, suelta1: 3.95, vuelve1a: 4.24, vuelve1b: 4.62, cabeza1: 4.25,
    saca2: 4.75, mete2: 4.98, clin2: 5.04, coge2: 5.1, g2a: 5.14, g2b: 5.66, alza2: 5.66, boton2: 5.76, baja2: 5.8, toca2: 6.08, cierra2: 6.12,
    sube2: 6.18, escapa2: 6.3, arriba2: 6.6, vuelve2b: 6.95, sacude0: 6.62, sacude1: 7.16,
    saca3: 7.3, mete3: 7.58, clin3: 7.66, coge3: 7.72, g3a: 7.76, g3b: 8.32, dedo3: 8.42, baja3: 8.48, toca3: 8.82, cierra3: 8.85,
    sube3: 8.96, arriba3: 9.3, clac0: 9.32, clac1: 9.68, vuelve3b: 9.62, desploma: 9.62,
    aMoneda: 9.72, flick: 10.05, encaja: 10.42,
    cadera0: 10.48, golpe: 10.62, baja4: 10.68, toca4: 11.0, cierra4: 11.04, sube4: 11.1, arriba4: 11.5, lleva4b: 11.8, suelta4: 11.84,
    traga1: 12.1, trampilla: 12.2, atrapa: 12.66, lanza0: 12.95, lanza: 13.2, recibe: 13.55, fin: 14.3
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const rot = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const D = (pu, ix, re) => ({ pulgar: pu, indice: ix, medio: re, anular: re, menique: re });
  const mezclaD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k), anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const PUNO = D(0, 0, 0), PALMA = D(1, 1, 1), INDICE = D(0, 1, 0), PINZA = D(0.55, 0.5, 0.12), AGARRE = D(0.3, 0.3, 0.3), ABIERTA = D(0.8, 0.85, 0.8), FLICK0 = D(0.25, 0.22, 0.12), FLICK1 = D(1, 0.35, 0.15);
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

  /* =====================================================================================
   * LA MÁQUINA (pantalla, antes de la cámara)
   * ===================================================================================== */
  const MX = 530;
  const CAB = { x0: 420, x1: 640 };
  const MARQ = { y0: 60, y1: 126 };
  const VID = { x0: 432, x1: 628, y0: 134, y1: 338 };
  const RIEL_Y = 148, HOME = 528, TOP = 180, TOP4 = 166;
  const CH = { x0: 576, x1: 628, borde: 292 };                  // rampa de premios dentro del cristal
  const CONS = { yA: 338, yB: 352, yC: 378, x0: 402, x1: 658 };  // consola: tapa (yA–yB) y frente (yB–yC)
  const BASE_P = { x: 452, y: 346 }, LARGO_P = 26;
  const BOTON = { x: 494, y: 345, r: 11 };
  const RANURA = { x: 423, y: 346 };
  const TRAMP = { x0: 576, x1: 626, y0: 468, y1: 520 };

  /* ---------- el carro del gancho: x(t) ---------- */
  const RUTA1 = [[T.g1a, HOME], [1.66, 466], [1.96, 497], [2.22, 481], [T.g1b, 486]];
  const RUTA2 = [[T.g2a, HOME], [5.34, 448], [5.5, 467], [T.g2b, 462]];
  const RUTA3 = [[T.g3a, HOME], [7.98, 508], [8.15, 496], [T.g3b, 500]];
  function gX(t) {
    if (t < T.g1a) return HOME;
    if (t < T.g1b) return cat(RUTA1, t);
    if (t < T.arriba1) return 486;
    if (t < T.vuelve1a) return lerp(486, 600, suave(fase(t, T.arriba1, T.lleva1b)));
    if (t < T.g2a) return lerp(600, HOME, suave(fase(t, T.vuelve1a, T.vuelve1b)));
    if (t < T.g2b) return cat(RUTA2, t);
    if (t < T.arriba2) return 462;
    if (t < T.g3a) return lerp(462, HOME, suave(fase(t, T.arriba2, T.vuelve2b)));
    if (t < T.g3b) return cat(RUTA3, t);
    if (t < T.arriba3) return 500;
    if (t < T.arriba4) return lerp(500, HOME, suave(fase(t, T.clac0, T.vuelve3b)));
    if (t < T.traga1) return lerp(HOME, 586, suave(fase(t, T.arriba4, T.lleva4b)));
    return lerp(586, HOME, suave(fase(t, T.traga1 + 0.1, T.traga1 + 0.5)));
  }
  // altura del cubo del gancho
  function gY(t) {
    const baja = (t0, t1, y0, y1, f = suave) => lerp(y0, y1, f(fase(t, t0, t1)));
    if (t < T.baja1) return TOP;
    if (t < T.sube1) return baja(T.baja1, T.toca1, TOP, 276);
    if (t < T.baja2) return baja(T.sube1, T.arriba1, 276, TOP);
    if (t < T.sube2) return baja(T.baja2, T.toca2, TOP, 276);
    if (t < T.baja3) return baja(T.sube2, T.arriba2, 276, TOP);
    if (t < T.sube3) return baja(T.baja3, T.toca3, TOP, 272);
    if (t < T.baja4) return baja(T.sube3, T.arriba3, 272, TOP);
    if (t < T.sube4) return baja(T.baja4, T.toca4, TOP, 300, entrada);
    if (t < T.traga1) return baja(T.sube4, T.arriba4, 300, TOP4);
    return baja(T.traga1 + 0.1, T.traga1 + 0.5, TOP4, TOP);
  }
  // apertura de las pinzas (0 cerradas, 1 abiertas)
  const REPOSO = 0.3, AGARRA = 0.6;
  function gAbre(t) {
    let a = REPOSO;
    const ciclo = (tb, tc, cierre, ts, ta) => {
      a = lerp(a, 1, tramo(t, tb, tb + 0.16));                       // se abren al bajar
      a = lerp(a, cierre, tramo(t, tc, tc + 0.08, salida));          // se cierran
      if (ts !== undefined) a = lerp(a, 0.9, tramo(t, ts, ts + 0.08)); // sueltan
      if (ta !== undefined) a = lerp(a, REPOSO, tramo(t, ta, ta + 0.3));
    };
    ciclo(T.baja1, T.cierra1, AGARRA, T.suelta1 - 0.02, T.vuelve1b);
    ciclo(T.baja2, T.cierra2, AGARRA, T.escapa2 - 0.02, T.vuelve2b - 0.2);
    ciclo(T.baja3, T.cierra3, 0.0, undefined, undefined);
    // ¡clac, clac!: abre y cierra burlándose
    const cl = fase(t, T.clac0, T.clac1);
    if (cl > 0 && cl < 1) a = lerp(0, 0.75, 0.5 - 0.5 * Math.cos(cl * Math.PI * 4));
    a = lerp(a, REPOSO, tramo(t, T.clac1, T.clac1 + 0.25));
    ciclo(T.baja4, T.cierra4, 0.18, T.suelta4 - 0.02, T.traga1 + 0.2);
    // temblor de pinzas flojas antes de soltar
    for (const ts of [T.suelta1, T.escapa2]) a += 0.06 * Math.sin((t - ts) * 70) * campana(t, ts - 0.16, ts);
    return clamp(a, 0, 1);
  }
  // Balanceo del gancho: péndulo forzado por la aceleración del carro, integrado una vez.
  const DT = 1 / 480, NP = Math.ceil((DUR + 0.5) / DT), THETA = new Float32Array(NP);
  (() => {
    let th = 0, w = 0;
    const acel = t => (gX(t + 0.01) - 2 * gX(t) + gX(t - 0.01)) / 0.0001;
    for (let i = 0; i < NP; i++) {
      const t = i * DT, L = Math.max(30, gY(t) - RIEL_Y + 20);
      THETA[i] = th;
      const a = -(1500 / L) * Math.sin(th) - 3.2 * w - clamp(acel(t), -4000, 4000) * Math.cos(th) / L;
      w += a * DT; th += w * DT;
      th = clamp(th, -0.35, 0.35);
    }
  })();
  const theta = t => { const x = clamp(t, 0, DUR) / DT, i = Math.min(NP - 2, Math.floor(x)), f = x - i; return lerp(THETA[i], THETA[i + 1], f); };
  // estado del gancho
  function gancho(t) {
    const x = gX(t), y = gY(t), th = theta(t) * (1 - 0.8 * campana(t, T.baja4 - 0.05, T.sube4 + 0.1));
    const L = y - RIEL_Y;
    return { x, hx: x + Math.sin(th) * L, hy: RIEL_Y + Math.cos(th) * L, th, abre: gAbre(t) };
  }
  const colgado = (gs, d) => ({ x: gs.hx + Math.sin(gs.th) * d, y: gs.hy + Math.cos(gs.th) * d });
  // sacudidas de la máquina (rabieta con la palanca, golpe de cadera)
  function temblorMaq(t) {
    const rab = campana(t, T.sacude0, T.sacude1);
    const cad = t >= T.golpe ? Math.exp(-(t - T.golpe) * 7) * Math.sin((t - T.golpe) * 40) : 0;
    return { x: ruido(t * 30) * 2.4 * rab - 7 * cad, y: ruido(t * 33 + 4) * 1.2 * rab + 1.5 * Math.abs(cad) };
  }
  // palanca: se inclina con la velocidad del carro mientras Guillermo la maneja; zarandeo con la rabieta
  function palanca(t) {
    let manual = 0;
    for (const [a, b] of [[T.g1a, T.g1b], [T.g2a, T.g2b], [T.g3a, T.g3b]]) manual = Math.max(manual, tramo(t, a - 0.06, a + 0.06) * (1 - tramo(t, b - 0.04, b + 0.08)));
    const v = (gX(t + 0.02) - gX(t - 0.02)) / 0.04;
    let a = clamp(v / 300, -1, 1) * 0.5 * manual;
    a += 0.48 * Math.sin((t - T.sacude0) * 24) * campana(t, T.sacude0, T.sacude1);
    return a;
  }
  const pomo = (t, sh) => { const a = palanca(t); return { x: BASE_P.x + sh.x + Math.sin(a) * LARGO_P, y: BASE_P.y + sh.y - Math.cos(a) * LARGO_P, a }; };
  // botón hundido
  const hundido = t => Math.max(campana(t, T.boton1 - 0.02, T.boton1 + 0.16), campana(t, T.boton2 - 0.02, T.boton2 + 0.16), campana(t, T.dedo3 - 0.04, T.dedo3 + 0.18));

  /* ---------- peluches ---------- */
  const TIPOS = {
    gato: { c: "#ff9ec4", s: "#e0679a", l: "#ffd1e3" }, gatoAzul: { c: "#93d4ff", s: "#559ed6", l: "#d4eeff" },
    pollito: { c: "#ffd94d", s: "#e2a51c", l: "#fff1a8" }, ballena: { c: "#86b6ff", s: "#4f7fd6", l: "#c9ddff" },
    rana: { c: "#86dd5e", s: "#4ea43a", l: "#cdf3b0" }, pulpo: { c: "#c79bff", s: "#8f5ed6", l: "#e6d4ff" },
    nube: { c: "#ffffff", s: "#b9cbe0", l: "#ffffff" }, naranja: { c: "#ffaa4d", s: "#df7420", l: "#ffd7a6" }
  };
  // cara: "feliz" (ojitos), "dormido" (^ ^), "susto" (ojos redondos)
  function peluche(g, tipo, x, y, r, rot0 = 0, sx = 1, sy = 1, cara = "feliz") {
    const P = TIPOS[tipo], lw = Math.max(1.1, r * 0.11);
    g.save(); g.translate(x, y); g.rotate(rot0); g.scale(sx, sy); g.lineJoin = "round"; g.lineCap = "round";
    g.strokeStyle = TINTA; g.lineWidth = lw;
    // apéndices detrás del cuerpo
    if (tipo === "gato" || tipo === "gatoAzul") {
      for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * r * 0.82, -r * 0.42); g.lineTo(s * r * 0.72, -r * 1.12); g.lineTo(s * r * 0.24, -r * 0.86); g.closePath(); g.fillStyle = P.c; g.fill(); g.stroke();
        g.beginPath(); g.moveTo(s * r * 0.68, -r * 0.6); g.lineTo(s * r * 0.66, -r * 0.94); g.lineTo(s * r * 0.4, -r * 0.8); g.closePath(); g.fillStyle = P.l; g.fill(); }
    } else if (tipo === "rana") {
      for (const s of [-1, 1]) { g.beginPath(); g.arc(s * r * 0.45, -r * 0.78, r * 0.36, 0, Math.PI * 2); g.fillStyle = P.c; g.fill(); g.stroke(); }
    } else if (tipo === "ballena") {
      g.beginPath(); g.moveTo(r * 0.85, r * 0.05); g.quadraticCurveTo(r * 1.35, -r * 0.2, r * 1.42, -r * 0.6); g.quadraticCurveTo(r * 1.2, -r * 0.1, r * 1.5, r * 0.05); g.quadraticCurveTo(r * 1.25, r * 0.15, r * 0.85, r * 0.35); g.closePath(); g.fillStyle = P.c; g.fill(); g.stroke();
      g.strokeStyle = "#9fd8ff"; g.lineWidth = lw * 1.2; g.beginPath(); g.moveTo(-r * 0.1, -r * 0.95); g.quadraticCurveTo(-r * 0.3, -r * 1.35, -r * 0.55, -r * 1.3); g.moveTo(-r * 0.1, -r * 0.95); g.quadraticCurveTo(r * 0.1, -r * 1.4, r * 0.35, -r * 1.3); g.stroke();
      g.strokeStyle = TINTA; g.lineWidth = lw;
    } else if (tipo === "naranja") {
      g.beginPath(); g.ellipse(r * 0.25, -r * 1.02, r * 0.32, r * 0.14, -0.5, 0, Math.PI * 2); g.fillStyle = "#5fbf4a"; g.fill(); g.stroke();
    } else if (tipo === "pollito") {
      g.beginPath(); g.moveTo(-r * 0.05, -r * 0.9); g.quadraticCurveTo(-r * 0.2, -r * 1.35, r * 0.1, -r * 1.3); g.moveTo(r * 0.05, -r * 0.9); g.quadraticCurveTo(r * 0.25, -r * 1.25, r * 0.4, -r * 1.12); g.stroke();
    }
    // cuerpo
    const cuerpo = () => {
      g.beginPath();
      if (tipo === "nube") { for (let i = 0; i < 7; i++) { const a = Math.PI + i / 6 * Math.PI, cx = Math.cos(a) * r * 0.62, cy = Math.sin(a) * r * 0.5 - r * 0.05; g.moveTo(cx + r * 0.42, cy); g.arc(cx, cy, r * 0.42, 0, Math.PI * 2); } g.moveTo(r * 0.95, r * 0.15); g.ellipse(0, r * 0.15, r * 0.95, r * 0.62, 0, 0, Math.PI * 2); }
      else if (tipo === "ballena") g.ellipse(0, 0, r * 1.05, r * 0.88, 0, 0, Math.PI * 2);
      else if (tipo === "pulpo") { g.moveTo(-r, 0); g.arc(0, 0, r, Math.PI, 0); for (let i = 0; i <= 4; i++) { const xx = r - i * r / 2; g.quadraticCurveTo(xx + r * 0.05, r * 1.15, xx - r * 0.25, r * 0.75); } g.closePath(); }
      else g.arc(0, 0, r, 0, Math.PI * 2);
    };
    cuerpo(); g.lineWidth = lw * 2; g.stroke(); g.lineWidth = lw;
    cuerpo(); g.fillStyle = P.c; g.fill();
    g.save(); cuerpo(); g.clip();
    g.fillStyle = P.s; g.globalAlpha = 0.55; g.beginPath(); g.ellipse(r * 0.35, r * 0.55, r * 1.05, r * 0.55, -0.3, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 0.8; g.fillStyle = P.l; g.beginPath(); g.ellipse(-r * 0.4, -r * 0.5, r * 0.35, r * 0.2, -0.6, 0, Math.PI * 2); g.fill();
    g.restore();
    // cara
    const ey = -r * 0.05, ex = r * 0.34;
    g.fillStyle = TINTA; g.strokeStyle = TINTA;
    if (cara === "dormido") {
      g.lineWidth = lw * 1.1;
      for (const s of [-1, 1]) { g.beginPath(); g.arc(s * ex, ey + r * 0.06, r * 0.13, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    } else {
      const er = r * (cara === "susto" ? 0.16 : 0.12);
      for (const s of [-1, 1]) { g.beginPath(); g.arc(s * ex, ey, er, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = "#ffffff"; for (const s of [-1, 1]) { g.beginPath(); g.arc(s * ex - er * 0.3, ey - er * 0.35, er * 0.38, 0, Math.PI * 2); g.fill(); }
    }
    g.fillStyle = "rgba(255,90,120,0.45)"; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * r * 0.58, r * 0.2, r * 0.17, r * 0.1, 0, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = TINTA; g.lineWidth = lw * 0.9;
    if (tipo === "pollito") { g.fillStyle = "#ff8a24"; g.beginPath(); g.moveTo(-r * 0.13, r * 0.1); g.lineTo(r * 0.13, r * 0.1); g.lineTo(0, r * 0.28); g.closePath(); g.fill(); g.stroke(); }
    else if (cara === "susto") { g.beginPath(); g.ellipse(0, r * 0.25, r * 0.1, r * 0.13, 0, 0, Math.PI * 2); g.stroke(); }
    else { g.beginPath(); g.moveTo(-r * 0.14, r * 0.17); g.quadraticCurveTo(-r * 0.07, r * 0.3, 0, r * 0.19); g.quadraticCurveTo(r * 0.07, r * 0.3, r * 0.14, r * 0.17); g.stroke(); }
    if (tipo === "gato" || tipo === "gatoAzul") { g.lineWidth = lw * 0.6; for (const s of [-1, 1]) for (const k of [-1, 1]) { g.beginPath(); g.moveTo(s * r * 0.72, r * 0.12 + k * r * 0.07); g.lineTo(s * r * 1.02, r * 0.07 + k * r * 0.16); g.stroke(); } }
    if (tipo === "pulpo") { g.fillStyle = "rgba(255,255,255,0.5)"; for (const [a, b] of [[-0.4, -0.55], [0.5, -0.35], [0.1, -0.75]]) { g.beginPath(); g.arc(a * r, b * r, r * 0.08, 0, Math.PI * 2); g.fill(); } }
    g.restore();
  }
  // el montón: fila de atrás y fila de delante
  const FILA_ATRAS = [
    { id: "b1", tipo: "rana", x: 441, y: 299, r: 13, rot: -0.1 }, { id: "P2", tipo: "pollito", x: 463, y: 297, r: 13, rot: 0.05 },
    { id: "P1", tipo: "gato", x: 487, y: 298, r: 14, rot: -0.05 }, { id: "b2", tipo: "ballena", x: 512, y: 301, r: 12, rot: 0.08 },
    { id: "b3", tipo: "pulpo", x: 535, y: 298, r: 13, rot: -0.06 }, { id: "b4", tipo: "nube", x: 558, y: 302, r: 12, rot: 0.04 }
  ];
  const FILA_DELANTE = [
    { id: "f1", tipo: "naranja", x: 446, y: 322, r: 14, rot: 0.1 }, { id: "f2", tipo: "gatoAzul", x: 473, y: 324, r: 14, rot: -0.08 },
    { id: "f3", tipo: "pollito", x: 499, y: 321, r: 14, rot: 0.06 }, { id: "f4", tipo: "rana", x: 524, y: 323, r: 14, rot: -0.1 },
    { id: "f5", tipo: "ballena", x: 550, y: 323, r: 13, rot: 0.04 }
  ];
  // peluche gigante: emerge del montón y lo aparta todo
  const R_GIG = 47;
  function apartado(q, t) {
    const k = tramo(t, T.sube4 - 0.06, T.sube4 + 0.32, salida);
    if (k <= 0) return { x: q.x, y: q.y, rot: q.rot };
    const dx = q.x - HOME, lejos = 60, s = dx < 0 ? -1 : 1;
    if (Math.abs(dx) > lejos) return { x: q.x, y: q.y, rot: q.rot };
    const fuerza = (lejos - Math.abs(dx)) / lejos;
    let nx = q.x + s * (lejos - Math.abs(dx)) * 0.42;
    nx = s > 0 ? Math.min(nx, 560) : nx;
    const salto = Math.sin(Math.PI * k) * (10 + 26 * fuerza);
    return { x: lerp(q.x, nx, k), y: q.y - salto - 3 * fuerza * k, rot: q.rot + s * 0.5 * fuerza * k };
  }

  /* ---------- trayectorias de los peluches que se mueven ---------- */
  const R1 = { x: 487, y: 298 }, R2 = { x: 463, y: 297 };
  const OFF_P = 26;                       // del cubo al centro del peluche agarrado
  // gatito rosa (ronda 1): se escurre justo encima de la rampa y rebota en el borde
  const VUELO1 = (() => {
    const t0 = T.suelta1, gs = gancho(t0), p0 = colgado(gs, OFF_P);
    const vx0 = (gX(t0 + 0.01) - gX(t0 - 0.01)) / 0.02 * 0.6, r = 14;
    const yC = CH.borde - r * 0.75, tauC = Math.sqrt(Math.max(0, 2 * (yC - p0.y) / 1500));
    const xC = p0.x + vx0 * tauC;
    const yL = 288, vy2 = -300, a = 750, b = vy2, c = yC - yL;
    const tau2 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
    const xL = 520, vx2 = (xL - xC) / tau2;
    return { t0, p0, vx0, tauC, xC, yC, vy2, vx2, tau2, xL, yL };
  })();
  function p1(t) {
    const V = VUELO1;
    if (t < T.cierra1) return { x: R1.x, y: R1.y, rot: -0.05 };
    if (t < V.t0) { const gs = gancho(t), c = colgado(gs, OFF_P), k = tramo(t, T.cierra1, T.cierra1 + 0.1); return { x: lerp(R1.x, c.x, k), y: lerp(R1.y, c.y, k), rot: lerp(-0.05, gs.th, k) }; }
    const u = t - V.t0;
    if (u < V.tauC) return { x: V.p0.x + V.vx0 * u, y: V.p0.y + 750 * u * u, rot: 0.6 * u };
    const v = u - V.tauC;
    if (v < V.tau2) return { x: V.xC + V.vx2 * v, y: V.yC + V.vy2 * v + 750 * v * v, rot: 0.6 * V.tauC - 5 * v };
    const w = v - V.tau2, rebote = Math.abs(Math.sin(w * 14)) * 9 * Math.exp(-w * 7);
    const rot1 = 0.6 * V.tauC - 5 * V.tau2;
    return { x: V.xL + 4 * salida(clamp(w / 0.4)), y: V.yL - rebote, rot: lerp(rot1, 0.35, salida(clamp(w / 0.35))) };
  }
  // pollito (ronda 2): se escapa nada más levantarlo
  function p2(t) {
    if (t < T.cierra2) return { x: R2.x, y: R2.y, rot: 0.05 };
    if (t < T.escapa2) { const gs = gancho(t), c = colgado(gs, OFF_P), k = tramo(t, T.cierra2, T.cierra2 + 0.06); return { x: lerp(R2.x, c.x, k), y: lerp(R2.y, c.y, k), rot: lerp(0.05, gs.th, k) }; }
    const gs = gancho(T.escapa2), c0 = colgado(gs, OFF_P), u = t - T.escapa2, yF = 297;
    const vy = -250, tl = (-vy + Math.sqrt(vy * vy + 3000 * (yF - c0.y))) / 1500;
    if (u < tl) return { x: c0.x - 32 * u, y: c0.y + vy * u + 750 * u * u, rot: -3 * u };
    const w = u - tl, reb = Math.abs(Math.sin(w * 16)) * 6 * Math.exp(-w * 8);
    return { x: c0.x - 32 * tl, y: yF - reb, rot: lerp(-3 * tl, -0.25, salida(clamp(w / 0.3))) };
  }
  // peluche gigante: estado en cada momento
  function gigante(t) {
    if (t < T.toca4 - 0.02) return null;
    if (t < T.suelta4) {
      const gs = gancho(t), c = colgado(gs, 26 + R_GIG);
      const crece = 0.85 + 0.15 * tramo(t, T.sube4, T.arriba4);
      // se aplasta contra la pared derecha al llevarlo a la rampa
      let sx = crece, sy = crece, x = c.x;
      const der = x + R_GIG * sx;
      if (der > VID.x1 - 2) { const sobra = der - (VID.x1 - 2); sx = crece - sobra / (2 * R_GIG); x -= sobra / 2; sy = crece * (1 + 0.5 * (crece - sx)); }
      return { lugar: "vidrio", x, y: c.y, sx, sy, rot: gs.th * 0.6, cara: "dormido" };
    }
    if (t < T.trampilla) {
      // entra a presión por la boca de la rampa y cae dentro del mueble
      const g0 = gigante(T.suelta4 - 1e-4), k = fase(t, T.suelta4, T.traga1 + 0.06);
      const x = lerp(g0.x, (CH.x0 + CH.x1) / 2, salida(clamp(k * 2)));
      const y = g0.y + 190 * entrada(k);
      const aprieta = tramo(k, 0.12, 0.45);
      return { lugar: "vidrio", x, y, sx: lerp(g0.sx, 0.5, aprieta), sy: lerp(g0.sy, 1.38, aprieta), rot: 0, cara: "susto" };
    }
    if (t < T.atrapa) {
      // ¡pop! sale por la trampilla y sube en vertical hasta la mano de Ander
      const u = t - T.trampilla, D_ = T.atrapa - T.trampilla, y0 = 500, yA = 340;
      const v0 = 2 * (y0 - yA) / D_, gg = v0 / D_;
      const y = y0 - v0 * u + 0.5 * gg * u * u, x = lerp(601, PUNTO_ATRAPA.x, salida(u / D_));
      const pop = tramo(u, 0, 0.14, salida), boing = 1 + 0.18 * Math.sin(Math.PI * fase(u, 0.1, 0.3)) * (u > 0.1 ? 1 : 0);
      return { lugar: "aire", x, y, sx: lerp(0.4, 1, pop) * boing, sy: lerp(0.7, 1, pop) / boing, rot: 0.15 * Math.sin(u * 9), cara: "susto" };
    }
    return { lugar: "mano" };
  }
  const PUNTO_ATRAPA = { x: 616, y: 340 };

  /* =====================================================================================
   * CARAS
   * ===================================================================================== */
  const BASE = { c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, mof: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, mir, parp, guino) {
    const pc = Math.max(e.c, parp);
    return { mirada: mir, iris: e.iris, espiral: 0,
      ojos: { d: Math.max(pc, guino || 0), i: pc, feliz: Math.max(e.h, guino || 0), apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  // mirada hacia un objetivo: punto de pantalla o la cámara
  const CAM_G = { x: -0.85, y: -0.1 }, CAM_A = { x: -0.85, y: -0.05 };
  function miradaA(objetivo, cabeza, espejo, cam) {
    if (!objetivo) return cam;
    const dx = (objetivo.x - cabeza.x) * (espejo ? -1 : 1), dy = objetivo.y - cabeza.y;
    return { x: clamp(dx / 110, -1, 1), y: clamp(dy / 80, -1, 1) };
  }
  function lineaMirada(guion, ctx, t) {
    let m = guion[0][2](ctx);
    for (const [t0, t1, f] of guion) { if (t <= t0) break; const n = f(ctx), k = suave(fase(t, t0, t1)); m = { x: lerp(m.x, n.x, k), y: lerp(m.y, n.y, k) }; }
    return m;
  }

  /* =====================================================================================
   * GUILLERMO (izquierda, junto a la consola)
   * ===================================================================================== */
  const XG = 355;
  const CARAS_G = {
    inicio: E({ orig: 0, sonr: 0.3, sd: 6 }),
    codicia: E({ iris: 1.15, sd: 20, gd: 0.12, si: 20, gi: 0.12, orig: 0, abre: 18, ancho: 0.9, sonr: 0.7, lengua: 0.2 }),
    beso: E({ c: 0.85, h: 0.6, sd: 10, gd: 0.08, si: 10, gi: 0.08, orig: 0, abre: 3, ancho: 0.42, sonr: 0.05 }),
    foco: E({ c: 0.22, sd: -8, gd: -0.16, si: -8, gi: -0.16, orig: 0, abre: 9, ancho: 0.55, sonr: 0.05, lengua: 1 }),
    golpe: E({ c: 0.7, z: 0.6, sd: -10, gd: -0.25, si: -10, gi: -0.25, orig: 0, abre: 30, ancho: 1.2, sonr: 0.2 }),
    reza: E({ iris: 1.1, sd: 24, gd: 0.22, si: 24, gi: 0.22, orig: 0, abre: 0, ancho: 0.62, sonr: 0.15 }),
    ilusion: E({ iris: 1.12, sd: 20, gd: 0.15, si: 20, gi: 0.15, orig: 0, abre: 26, ancho: 1.05, sonr: 0.9 }),
    yes: E({ c: 0.65, h: 1, sd: 18, gd: 0.18, si: 18, gi: 0.18, orig: 0, abre: 40, ancho: 1.2, sonr: 1 }),
    pasmo: E({ iris: 0.8, sd: 26, gd: 0.2, si: 26, gi: 0.2, orig: 0, abre: 50, ancho: 0.72, sonr: -0.15, lengua: 0.3 }),
    horror: E({ iris: 0.78, c: 0.1, sd: 22, gd: -0.25, si: 22, gi: -0.25, orig: 0, abre: 44, ancho: 1.15, sonr: -0.7, lengua: 0.2 }),
    rabia: E({ c: 0.35, z: 0.2, sd: -14, gd: -0.3, si: -14, gi: -0.3, orig: 0, abre: 22, ancho: 1.25, sonr: -0.6 }),
    furia: E({ c: 0.45, z: 0.45, sd: -16, gd: -0.32, si: -16, gi: -0.32, orig: 0, abre: 34, ancho: 1.3, sonr: -0.4 }),
    cuidado: E({ c: 0.42, sd: -4, gd: -0.12, si: -4, gi: -0.12, orig: 0, abre: 8, ancho: 0.5, sonr: 0, lengua: 1 }),
    nada: E({ iris: 0.82, sd: 14, gd: 0.04, si: 14, gi: 0.04, orig: 0, abre: 4, ancho: 0.62, sonr: -0.2 }),
    derrota: E({ c: 0.85, sd: 12, gd: -0.3, si: 12, gi: -0.3, orig: 0, abre: 0, ancho: 0.7, sonr: -0.7 }),
    sigue: E({ c: 0.18, sd: 10, gd: -0.18, si: 10, gi: -0.18, orig: 0, abre: 4, ancho: 0.65, sonr: -0.45 }),
    boquiabierto: E({ iris: 0.78, sd: 30, gd: 0.22, si: 30, gi: 0.22, orig: 0, abre: 62, ancho: 0.8, sonr: -0.1, lengua: 0.4 }),
    queja: E({ sd: 18, gd: -0.3, si: 18, gi: -0.3, orig: 0, abre: 24, ancho: 0.95, sonr: -0.55 }),
    sorpresa: E({ iris: 0.85, sd: 24, gd: 0.18, si: 24, gi: 0.18, orig: 0, abre: 30, ancho: 0.7, sonr: 0 }),
    puchero: E({ c: 0.45, sd: 14, gd: -0.28, si: 14, gi: -0.28, orig: 0, abre: 0, ancho: 0.6, sonr: -0.78 })
  };
  const GUION_CARA_G = [
    [T.mira, T.mira + 0.2, "codicia"], [T.beso1 - 0.08, T.beso1 + 0.08, "beso"], [T.mete1 - 0.05, T.mete1 + 0.1, "codicia"],
    [T.g1a, T.g1a + 0.15, "foco"], [T.boton1 - 0.05, T.boton1, "golpe"], [T.reza1 - 0.06, T.reza1 + 0.12, "reza"],
    [T.sube1, T.sube1 + 0.25, "ilusion"], [T.yes1, T.yes1 + 0.12, "yes"], [T.suelta1 + 0.04, T.suelta1 + 0.12, "pasmo"],
    [T.suelta1 + 0.5, T.suelta1 + 0.65, "horror"], [T.saca2, T.saca2 + 0.2, "rabia"], [T.g2a, T.g2a + 0.15, "rabia"],
    [T.boton2 - 0.05, T.boton2, "golpe"], [T.boton2 + 0.15, T.boton2 + 0.3, "rabia"], [T.escapa2 + 0.04, T.escapa2 + 0.12, "pasmo"],
    [T.sacude0, T.sacude0 + 0.1, "furia"], [T.saca3 - 0.1, T.saca3 + 0.2, "cuidado"], [T.toca3 + 0.06, T.toca3 + 0.14, "nada"],
    [T.desploma, T.desploma + 0.3, "derrota"], [T.encaja, T.encaja + 0.15, "sigue"], [T.sube4 + 0.12, T.sube4 + 0.25, "boquiabierto"],
    [T.atrapa - 0.05, T.atrapa + 0.15, "queja"], [T.lanza, T.lanza + 0.1, "sorpresa"], [T.recibe + 0.1, T.recibe + 0.35, "puchero"]
  ];
  const CUERPOS_G = {
    quieto: { dx: 0, pel: 2, torso: 0, cab: 0, ey: 0 },
    codicia: { dx: 4, pel: 8, torso: 0.07, cab: 0.06, ey: 0 },
    beso: { dx: 2, pel: 6, torso: 0.02, cab: -0.04, ey: 0 },
    mete: { dx: 6, pel: 22, torso: 0.18, cab: 0.1, ey: 0 },
    juega: { dx: 4, pel: 24, torso: 0.06, cab: 0.06, ey: 0 },
    alza: { dx: 4, pel: 10, torso: 0.02, cab: -0.04, ey: 0.02 },
    golpe: { dx: 14, pel: 40, torso: 0.24, cab: 0.12, ey: -0.02 },
    reza: { dx: 6, pel: 18, torso: 0.08, cab: -0.04, ey: 0 },
    yes: { dx: 0, pel: 0, torso: -0.06, cab: -0.1, ey: 0.03 },
    cabeza: { dx: -6, pel: 10, torso: -0.05, cab: -0.12, ey: 0 },
    rabia: { dx: 6, pel: 28, torso: 0.08, cab: 0.08, ey: 0 },
    cuidado: { dx: 6, pel: 30, torso: 0.08, cab: 0.12, ey: 0 },
    toque: { dx: 10, pel: 30, torso: 0.15, cab: 0.12, ey: 0 },
    desplome: { dx: 24, pel: 44, torso: 0.46, cab: 0.3, ey: -0.02 },
    sigue: { dx: 16, pel: 30, torso: 0.28, cab: -0.16, ey: 0 },
    pasmo: { dx: 2, pel: 8, torso: 0.02, cab: -0.06, ey: 0.02 },
    queja: { dx: 0, pel: 6, torso: -0.03, cab: 0.04, ey: 0 },
    recibe: { dx: -2, pel: 16, torso: -0.02, cab: -0.02, ey: 0 },
    abrazo: { dx: -12, pel: 18, torso: -0.06, cab: 0.2, ey: 0 }
  };
  const GUION_CUERPO_G = [
    [T.mira, T.mira + 0.3, "codicia"], [T.saca1 + 0.1, T.beso1, "beso"], [T.beso1 + 0.1, T.mete1, "mete"], [T.coge1, T.coge1 + 0.2, "juega"],
    [T.alza1 - 0.04, T.boton1 - 0.04, "alza"], [T.boton1 - 0.04, T.boton1 + 0.02, "golpe", salida], [T.reza1, T.reza1 + 0.3, "reza"],
    [T.yes1 - 0.05, T.yes1 + 0.12, "yes"], [T.suelta1 + 0.2, T.suelta1 + 0.5, "cabeza"],
    [T.saca2, T.mete2, "mete"], [T.coge2, T.coge2 + 0.15, "rabia"], [T.alza2 - 0.04, T.boton2 - 0.04, "alza"], [T.boton2 - 0.04, T.boton2 + 0.02, "golpe", salida],
    [T.boton2 + 0.1, T.boton2 + 0.3, "rabia"], [T.saca3, T.mete3, "mete"], [T.coge3, T.coge3 + 0.2, "cuidado"], [T.dedo3 - 0.2, T.dedo3, "toque"],
    [T.sube3, T.sube3 + 0.3, "cuidado"], [T.desploma, T.desploma + 0.4, "desplome"], [T.encaja, T.encaja + 0.22, "sigue"],
    [T.sube4 + 0.1, T.sube4 + 0.35, "pasmo"], [T.atrapa - 0.1, T.atrapa + 0.2, "queja"], [T.lanza - 0.05, T.lanza + 0.2, "recibe"],
    [T.recibe, T.recibe + 0.3, "abrazo", salida]
  ];
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const PASOS_G = {
    cerca: [[-10, -9, XG - 40], [T.recibe + 0.02, T.recibe + 0.2, XG - 62]],
    lejos: [[-10, -9, XG + 34], [T.recibe + 0.08, T.recibe + 0.28, XG + 18]]
  };
  function pieX(L, t) {
    let i = 0; while (i + 1 < L.length && t >= L[i + 1][0]) i++;
    const [t0, t1, x] = L[i], xa = i > 0 ? L[i - 1][2] : x, u = fase(t, t0, t1);
    return { x: lerp(xa, x, suave(u)), alto: Math.sin(Math.PI * u) * (u > 0 && u < 1 ? 1 : 0) };
  }
  const PARP_G = [0.62, 1.95, 4.0, 5.95, 7.2, 8.1, 11.0, 12.05, 13.9];
  const R_MG = G.MUNECA_R * G.JK;
  const punoDesdeG = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_MG, y: Math.sin(mu) * R_MG }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_GC = punoDesdeG({ x: 131, y: 652 }, 0, -1.75), BOLS_GL = punoDesdeG({ x: 372, y: 648 }, 0, -1.75);
  // ancla del peluche en el pecho de Guillermo (hoja)
  const PECHO_G = { x: 262, y: 452 };

  function poseBaseG(t) {
    const b = linea(GUION_CUERPO_G, CUERPOS_G, "quieto", t);
    const respira = Math.sin(t * 2.4);
    const rab = campana(t, T.sacude0, T.sacude1);
    const p = {
      x: XG + b.dx + ruido(t * 25) * 3 * rab, suelo: SUELO, s: S, tirasLimpias: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.3 },
      torso: b.torso + 0.04 * ruido(t * 21 + 2) * rab, torsoEsc: { x: 1, y: 1 + respira * 0.004 + b.ey },
      piernas: {}, cabeza: { ang: b.cab + 0.05 * ruido(t * 27 + 4) * rab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // brinco de alegría prematuro y el ¡uf! del peluche al cazarlo
    p.pelvis.y -= 26 * campana(t, T.yes1 - 0.05, T.yes1 + 0.3);
    const choque = t >= T.recibe ? Math.exp(-(t - T.recibe) * 7) * suave(fase(t, T.recibe, T.recibe + 0.05)) : 0;
    p.x -= 14 * choque; p.torso -= 0.12 * choque;
    // frente apoyada en el cristal: la cabeza se aplasta un poco
    const apoya = tramo(t, T.desploma + 0.25, T.desploma + 0.4) * (1 - tramo(t, T.encaja - 0.02, T.encaja + 0.15));
    p.cabeza.esc = { x: 1 - 0.05 * apoya, y: 1 + 0.02 * apoya };
    // cabeza que tiembla de rabia; mejilla sobre el peluche al abrazarlo
    p.cabeza.ang += 0.04 * Math.sin(t * 2.2) * tramo(t, T.recibe + 0.3, T.recibe + 0.6);
    for (const lado of ["cerca", "lejos"]) {
      const f = pieX(PASOS_G[lado], t);
      p.piernas[lado] = { tob: { x: G.PELVIS.x + (f.x - p.x) / S, y: TOB_G[lado] - 30 * f.alto }, ang: -0.15 * f.alto };
    }
    return p;
  }

  /* ---------- manos de Guillermo (pantalla) ---------- */
  function ctxG(t, p) {
    const Tr = G.tronco(p), aP = q => G.aPantalla(p, q), sh = temblorMaq(t);
    return { t, p, sh, hc: aP(Tr(G.HOMBRO_C)), hl: aP(Tr(G.HOMBRO)), boca: aP(G.boca(p)), cab: G.cabeza(p), aP, Tr,
      pomo: pomo(t, sh), peluche: aP(Tr(PECHO_G)) };
  }
  const muHacia = (desde, hacia, base = -1.75, k = 0.65) => Math.atan2(hacia.y - desde.y, hacia.x - desde.x) * k + base * (1 - k);
  const MANO_GL = {
    bolsillo: c => { const q = c.aP(c.Tr(BOLS_GL)); return { x: q.x, y: q.y, ang: 0, mu: -1.75, puno: 0, dedos: PUNO }; },
    moneda: c => ({ x: c.hl.x + 26, y: c.hl.y + 74, ang: 0, mu: -2.1, puno: 1, dedos: PINZA, moneda: 1 }),
    beso: c => ({ x: c.boca.x + 24, y: c.boca.y + 6, ang: 0, mu: -2.6, puno: 1, dedos: PINZA, moneda: 1 }),
    ranura: c => { const tiem = c.t > T.saca3 && c.t < T.coge3 ? 1.6 * Math.sin(c.t * 60) : 0;
      return { x: RANURA.x + c.sh.x + 3 + tiem, y: RANURA.y + c.sh.y - 20, ang: 0, mu: -1.45, puno: 1, dedos: PINZA, moneda: c.t < T.clin1 || (c.t > T.saca2 && c.t < T.clin2) || (c.t > T.saca3 && c.t < T.clin3) ? 1 : 0 }; },
    palanca: c => ({ x: c.pomo.x, y: c.pomo.y + 2, ang: c.pomo.a * 0.8, mu: muHacia(c.pomo, c.hl), puno: 1, dedos: PUNO }),
    alto: c => ({ x: BOTON.x + c.sh.x - 6, y: BOTON.y + c.sh.y - 66, ang: -0.2, mu: -1.5, puno: 1, dedos: PUNO }),
    boton: c => ({ x: BOTON.x + c.sh.x, y: BOTON.y + c.sh.y - 14 + 3 * hundido(c.t), ang: 0, mu: -1.6, puno: 1, dedos: PUNO }),
    dedo: c => ({ x: BOTON.x + c.sh.x + 4, y: BOTON.y + c.sh.y - 36 + 3 * hundido(c.t), ang: 0, mu: -1.62, puno: 1, dedos: INDICE }),
    reza: c => ({ x: c.boca.x + 20, y: c.boca.y + 36, ang: 0, mu: -2.2, puno: 1, dedos: PUNO }),
    yes: c => ({ x: c.hl.x + 42, y: c.hl.y + 46, ang: 0, mu: -2.4, puno: 1, dedos: PUNO }),
    cabeza: c => { const q = c.aP(c.cab.a({ x: 930, y: 380 })); return { x: q.x, y: q.y, ang: 0.4, mu: -0.4, puno: 1, dedos: PALMA }; },
    cristal: c => ({ x: VID.x0 + 62 + c.sh.x, y: 232 + c.sh.y + 14 * tramo(c.t, T.desploma, T.desploma + 0.8), ang: 0, mu: 2.2, puno: 1, dedos: PALMA }),
    queja: c => ({ x: c.hl.x + 52, y: c.hl.y + 50, ang: 0, mu: -3.0, puno: 1, dedos: PALMA }),
    recibe: c => ({ x: c.hl.x + 56, y: c.hl.y + 4, ang: 0, mu: -3.0, puno: 1, dedos: PALMA }),
    abraza: c => { const s = 1 + 0.035 * Math.sin((c.t - T.recibe) * 5); return { x: c.peluche.x + 34 * s, y: c.peluche.y + 16, ang: 0, mu: -0.6, puno: 1, dedos: D(0.7, 0.8, 0.75) }; }
  };
  const MANO_GC = {
    bolsillo: c => { const q = c.aP(c.Tr(BOLS_GC)); return { x: q.x, y: q.y, ang: 0, mu: -1.75, puno: 0, dedos: PUNO }; },
    pecho: c => ({ x: c.hc.x + 34, y: c.hc.y + 62, ang: 0, mu: -1.3, puno: 1, dedos: PUNO }),
    reza: c => ({ x: c.boca.x + 4, y: c.boca.y + 40, ang: 0, mu: -1.2, puno: 1, dedos: PUNO }),
    yes: c => ({ x: c.hc.x + 4, y: c.hc.y - 44, ang: 0, mu: 1.45, puno: 1, dedos: PUNO }),
    cabeza: c => { const q = c.aP(c.cab.a({ x: 640, y: 380 })); return { x: q.x, y: q.y, ang: -0.3, mu: -1.6, puno: 1, dedos: PALMA }; },
    cuelga: c => ({ x: c.hc.x + 4, y: c.hc.y + 104, ang: 0, mu: -1.62, puno: 1, dedos: D(0.3, 0.45, 0.35) }),
    queja: c => ({ x: c.hc.x - 34, y: c.hc.y + 54, ang: 0, mu: -0.4, puno: 1, dedos: PALMA }),
    recibe: c => ({ x: c.hc.x - 40, y: c.hc.y + 8, ang: 0, mu: -0.2, puno: 1, dedos: PALMA }),
    abraza: c => { const s = 1 + 0.035 * Math.sin((c.t - T.recibe) * 5); return { x: c.peluche.x - 30 * s, y: c.peluche.y + 22, ang: 0, mu: -2.6, puno: 1, dedos: D(0.7, 0.8, 0.75) }; }
  };
  const GUION_GL = [
    [T.saca1, T.saca1 + 0.22, "moneda"], [T.beso1 - 0.12, T.beso1, "beso"], [T.beso1 + 0.1, T.mete1, "ranura"], [T.clin1 + 0.02, T.coge1, "palanca"],
    [T.alza1, T.boton1 - 0.06, "alto"], [T.boton1 - 0.06, T.boton1, "boton", entrada], [T.reza1, T.reza1 + 0.25, "reza"], [T.yes1 - 0.08, T.yes1 + 0.1, "yes"],
    [T.suelta1 + 0.25, T.suelta1 + 0.55, "cabeza"],
    [T.saca2 - 0.05, T.saca2 + 0.12, "moneda"], [T.saca2 + 0.12, T.mete2, "ranura"], [T.clin2 + 0.02, T.coge2, "palanca"],
    [T.alza2, T.boton2 - 0.06, "alto"], [T.boton2 - 0.06, T.boton2, "boton", entrada], [T.boton2 + 0.4, T.sacude0, "palanca"],
    [T.saca3 - 0.08, T.saca3 + 0.12, "moneda"], [T.saca3 + 0.12, T.mete3, "ranura"], [T.clin3 + 0.02, T.coge3, "palanca"],
    [T.g3b + 0.02, T.dedo3 - 0.06, "dedo"], [T.desploma, T.desploma + 0.4, "cristal"], [T.sube4 + 0.25, T.sube4 + 0.6, "queja"],
    [T.lanza - 0.1, T.lanza + 0.15, "recibe"], [T.recibe - 0.02, T.recibe + 0.18, "abraza", salida]
  ];
  const GUION_GC = [
    [T.coge1, T.coge1 + 0.25, "pecho"], [T.reza1, T.reza1 + 0.25, "reza"], [T.yes1 - 0.1, T.yes1 + 0.08, "yes"], [T.suelta1 + 0.25, T.suelta1 + 0.55, "cabeza"],
    [T.saca2, T.saca2 + 0.3, "pecho"], [T.saca3, T.saca3 + 0.3, "pecho"], [T.desploma, T.desploma + 0.4, "cuelga"], [T.sube4 + 0.25, T.sube4 + 0.6, "queja"],
    [T.lanza - 0.1, T.lanza + 0.15, "recibe"], [T.recibe - 0.02, T.recibe + 0.18, "abraza", salida]
  ];
  const GUION_MIRA_G = [
    [0, 0.01, c => miradaA(null, null, false, { x: 0.5, y: 0.3 })],
    [T.mira, T.mira + 0.2, c => miradaA(c.garra, c.cabC, false)],
    [T.beso1 - 0.15, T.beso1, c => CAM_G], [T.mete1 - 0.15, T.mete1, c => miradaA({ x: RANURA.x, y: RANURA.y }, c.cabC, false)],
    [T.coge1, T.coge1 + 0.15, c => miradaA(c.garra, c.cabC, false)],
    [T.yes1 - 0.1, T.yes1, c => CAM_G], [T.suelta1, T.suelta1 + 0.08, c => miradaA(c.garra, c.cabC, false)],
    [T.suelta1 + 0.2, T.suelta1 + 0.3, c => miradaA(c.peluche1, c.cabC, false)], [T.saca2, T.saca2 + 0.15, c => miradaA(c.garra, c.cabC, false)],
    [T.escapa2, T.escapa2 + 0.06, c => miradaA(c.peluche2, c.cabC, false)], [T.sacude0, T.sacude0 + 0.1, c => miradaA(c.garra, c.cabC, false)],
    [T.toca3 + 0.1, T.toca3 + 0.2, c => CAM_G], [T.desploma, T.desploma + 0.3, c => ({ x: 0.3, y: 0.8 })],
    [T.encaja, T.encaja + 0.1, c => miradaA({ x: RANURA.x, y: RANURA.y }, c.cabC, false)], [T.encaja + 0.15, T.encaja + 0.3, c => miradaA({ x: 690, y: 240 }, c.cabC, false)],
    [T.cadera0 + 0.1, T.golpe, c => miradaA({ x: 690, y: 320 }, c.cabC, false)], [T.baja4, T.baja4 + 0.15, c => miradaA(c.garra, c.cabC, false)],
    [T.trampilla, T.trampilla + 0.1, c => miradaA(c.gig, c.cabC, false)], [T.atrapa + 0.1, T.atrapa + 0.3, c => miradaA({ x: 700, y: 210 }, c.cabC, false)],
    [T.lanza, T.lanza + 0.08, c => miradaA(c.gig, c.cabC, false)], [T.recibe + 0.4, T.recibe + 0.6, c => CAM_G]
  ];

  /* =====================================================================================
   * ANDER (derecha, en espejo)
   * ===================================================================================== */
  const XA = 722;
  const CARAS_A = {
    inicio: E({ c: 0.32, orig: 0, sonr: 0.22 }),
    mira: E({ c: 0.3, sd: 2, gd: 0.02, si: 8, gi: 0.06, orig: 0, sonr: 0.15, ancho: 0.9 }),
    mueca: E({ c: 0.55, z: 0.4, sd: 14, gd: -0.2, si: 14, gi: -0.2, orig: 0, abre: 10, ancho: 1.1, sonr: -0.35, dientes: 1 }),
    ceja: E({ c: 0.28, sd: 2, gd: 0.02, si: 20, gi: 0.16, orig: 0, sonr: 0.3, ancho: 0.9 }),
    risa: E({ c: 0.85, h: 1, sd: 10, gd: 0.08, si: 10, gi: 0.08, orig: 0, abre: 2, ancho: 0.95, sonr: 0.85 }),
    camara: E({ c: 0.35, sd: 2, gd: 0.02, si: 16, gi: 0.12, orig: 0, sonr: 0.1, ancho: 0.85 }),
    suspiro: E({ c: 0.8, sd: 6, gd: -0.08, si: 6, gi: -0.08, orig: 0, abre: 6, ancho: 0.6, sonr: 0, mof: 0.4 }),
    cool: E({ c: 0.38, sd: 4, gd: 0.03, si: 14, gi: 0.1, orig: 0, sonr: 0.55, ancho: 0.95 }),
    sonrie: E({ c: 0.3, h: 0.5, sd: 8, gd: 0.05, si: 10, gi: 0.06, orig: 0, sonr: 0.7, ancho: 1.0 }),
    final: E({ c: 0.3, h: 0.3, sd: 6, gd: 0.04, si: 18, gi: 0.14, orig: 0, sonr: 0.62, ancho: 0.95 })
  };
  const GUION_CARA_A = [
    [T.mira, T.mira + 0.3, "mira"], [T.suelta1 + 0.05, T.suelta1 + 0.2, "mueca"], [T.cabeza1 + 0.3, T.cabeza1 + 0.6, "mira"],
    [T.escapa2 + 0.1, T.escapa2 + 0.3, "ceja"], [T.sacude0 + 0.05, T.sacude0 + 0.25, "risa"], [T.sacude1, T.sacude1 + 0.3, "mira"],
    [T.toca3 + 0.15, T.toca3 + 0.35, "camara"], [T.desploma + 0.1, T.desploma + 0.3, "suspiro"], [T.aMoneda, T.aMoneda + 0.2, "cool"],
    [T.trampilla - 0.2, T.trampilla, "cool"], [T.atrapa + 0.1, T.atrapa + 0.3, "sonrie"], [T.recibe + 0.2, T.recibe + 0.45, "final"]
  ];
  const CUERPOS_A = {
    relax: { dx: 0, pel: 6, torso: -0.03, cab: 0.03 },
    mira: { dx: 0, pel: 8, torso: 0.02, cab: 0.07 },
    risa: { dx: 0, pel: 12, torso: 0.08, cab: 0.12 },
    moneda: { dx: 0, pel: 6, torso: -0.02, cab: -0.04 },
    cadera: { dx: -34, pel: 24, torso: -0.24, cab: -0.1 },
    atrapa: { dx: -6, pel: 10, torso: 0.04, cab: -0.04 },
    lanza: { dx: -8, pel: 18, torso: 0.1, cab: 0.02 },
    final: { dx: -4, pel: 6, torso: -0.02, cab: 0.03 }
  };
  const GUION_CUERPO_A = [
    [T.mira, T.mira + 0.4, "mira"], [T.sacude0, T.sacude0 + 0.15, "risa"], [T.sacude1, T.sacude1 + 0.3, "mira"], [T.aMoneda, T.aMoneda + 0.3, "moneda"],
    [T.cadera0, T.golpe, "cadera", entrada], [T.golpe + 0.08, T.golpe + 0.4, "moneda"], [T.trampilla, T.atrapa, "atrapa"],
    [T.lanza0, T.lanza, "lanza"], [T.lanza + 0.1, T.lanza + 0.5, "final"]
  ];
  const TOB_A = { cerca: A.SUELO - A.TOBILLO_ALTO, lejos: A.SUELO - A.TOBILLO_ALTO - 12 };
  const PASOS_A = {
    cerca: [[-10, -9, XA + 30]],
    lejos: [[-10, -9, XA - 34], [T.cadera0 - 0.08, T.cadera0 + 0.1, XA - 52], [T.golpe + 0.3, T.golpe + 0.5, XA - 34]]
  };
  const PARP_A = [1.7, 3.3, 5.5, 8.2, 9.95, 12.0, 13.4];
  const MANO_AL = {      // lejana (la de delante, hacia la máquina): x, y en pantalla; mu en la hoja de Ander
    bolsillo: c => { const q = A.aPantalla(c.p, c.Tr(A.BOLSILLO_L)); return { x: q.x, y: q.y, ang: 0, mu: -1.75, puno: 0, dedos: PUNO }; },
    tapa: c => ({ x: c.boca.x - 12, y: c.boca.y + 14, ang: 0, mu: -2.3, puno: 1, dedos: D(0.6, 0.75, 0.7) }),
    moneda: c => ({ x: c.hl.x - 46, y: c.hl.y + 30, ang: 0, mu: -2.5, puno: 1, dedos: FLICK0, moneda: 1 }),
    flick: c => ({ x: c.hl.x - 54, y: c.hl.y + 20, ang: 0, mu: -2.45, puno: 1, dedos: FLICK1 }),
    atrapa: c => ({ x: PUNTO_ATRAPA.x, y: PUNTO_ATRAPA.y - R_GIG - 10, ang: 0, mu: -1.2, puno: 1, dedos: ABIERTA }),
    coge: c => ({ x: PUNTO_ATRAPA.x, y: PUNTO_ATRAPA.y - R_GIG - 8, ang: 0, mu: -1.25, puno: 1, dedos: AGARRE }),
    atras: c => ({ x: c.hl.x - 26, y: c.hl.y + 90, ang: 0, mu: -1.4, puno: 1, dedos: AGARRE }),
    suelta: c => ({ x: c.hl.x - 96, y: c.hl.y + 6, ang: 0, mu: -3.0, puno: 1, dedos: ABIERTA })
  };
  const GUION_AL = [
    [T.escapa2 + 0.2, T.escapa2 + 0.45, "tapa"], [T.sacude1, T.sacude1 + 0.4, "bolsillo"],
    [T.aMoneda, T.aMoneda + 0.22, "moneda"], [T.flick - 0.03, T.flick + 0.05, "flick", salida], [T.flick + 0.3, T.flick + 0.6, "bolsillo"],
    [T.trampilla + 0.05, T.atrapa - 0.1, "atrapa"], [T.atrapa - 0.04, T.atrapa + 0.04, "coge", salida],
    [T.lanza0, T.lanza0 + 0.12, "atras"], [T.lanza0 + 0.12, T.lanza, "suelta", salida], [T.lanza + 0.3, T.lanza + 0.7, "bolsillo"]
  ];
  const GUION_MIRA_A = [
    [0, 0.01, c => miradaA(c.guille, c.cabC, true)],
    [T.mira, T.mira + 0.3, c => miradaA(c.garra, c.cabC, true)], [T.suelta1 + 0.05, T.suelta1 + 0.2, c => miradaA(c.guille, c.cabC, true)],
    [T.saca2, T.saca2 + 0.2, c => miradaA(c.garra, c.cabC, true)], [T.escapa2 + 0.1, T.escapa2 + 0.25, c => miradaA(c.guille, c.cabC, true)],
    [T.sacude1, T.sacude1 + 0.2, c => miradaA(c.garra, c.cabC, true)], [T.toca3 + 0.15, T.toca3 + 0.3, c => CAM_A],
    [T.desploma + 0.1, T.desploma + 0.3, c => miradaA(c.guille, c.cabC, true)], [T.aMoneda + 0.1, T.aMoneda + 0.25, c => CAM_A],
    [T.baja4 + 0.05, T.baja4 + 0.2, c => miradaA(c.garra, c.cabC, true)], [T.arriba4, T.arriba4 + 0.15, c => CAM_A],
    [T.atrapa + 0.1, T.atrapa + 0.25, c => miradaA(c.guille, c.cabC, true)], [T.lanza + 0.25, T.lanza + 0.4, c => miradaA(c.guille, c.cabC, true)],
    [T.recibe + 0.3, T.recibe + 0.5, c => CAM_A]
  ];

  function poseBaseA(t) {
    const b = linea(GUION_CUERPO_A, CUERPOS_A, "relax", t);
    const respira = Math.sin(t * 2.1 + 1), risa = campana(t, T.sacude0, T.sacude1 + 0.1);
    const p = {
      x: XA + b.dx, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: A.PELVIS.x, y: A.PELVIS.y + b.pel + respira * 1.1 - 4 * Math.abs(Math.sin(t * 22)) * risa },
      torso: b.torso + 0.012 * Math.sin(t * 0.9), torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.03 * Math.sin(t * 1.1) + 0.03 * Math.sin(t * 22) * risa, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    for (const lado of ["cerca", "lejos"]) {
      const f = pieX(PASOS_A[lado], t);
      p.piernas[lado] = { tob: { x: A.aHoja(p, { x: f.x, y: 0 }).x, y: TOB_A[lado] - 26 * f.alto }, ang: -0.12 * f.alto };
    }
    return p;
  }

  /* ---------- objetos en las manos y por el aire ---------- */
  function moneda(g, x, y, k, giro) {
    if (k <= 0.01) return;
    const w = (6 * Math.abs(Math.cos(giro)) + 1.2) * k, h = 6 * k;
    g.save(); g.fillStyle = "#f7c63a"; g.strokeStyle = "#5a3b00"; g.lineWidth = 1.3;
    g.beginPath(); g.ellipse(x, y, w, h, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#fff3b0"; g.beginPath(); g.ellipse(x - w * 0.3, y - h * 0.3, w * 0.3, h * 0.25, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // moneda que Ander lanza con el pulgar hasta la ranura
  let M0 = null;
  function monedaAnder(t) {
    if (t < T.flick || t >= T.encaja) return null;
    if (!M0) { const pa0 = poseBaseA(T.flick); M0 = MANO_AL.flick(ctxA(T.flick, pa0)); }
    const k = fase(t, T.flick, T.encaja), m = M0;
    const x0 = m.x - 8, y0 = m.y - 10;
    return { x: lerp(x0, RANURA.x, k), y: lerp(y0, RANURA.y - 6, k) - 4 * 110 * k * (1 - k), giro: t * 30 };
  }

  /* ---------- poses finales (con manos) ---------- */
  let CAM = null;          // matriz de la cámara del fotograma (para dibujar en pantalla dentro de las capas)
  const enPantalla = (g, f) => { g.save(); if (CAM) g.setTransform(CAM); f(g); g.restore(); };
  function poseG(t) {
    const p = poseBaseG(t), c = ctxG(t, p);
    const gs = gancho(t);
    c.garra = { x: gs.hx, y: gs.hy };
    const cab = G.aPantalla(p, G.centroCabeza(p)); c.cabC = cab;
    c.peluche1 = p1(t); c.peluche2 = p2(t);
    const mon = monedaAnder(t); c.moneda = mon || { x: RANURA.x, y: RANURA.y };
    c.gig = gigPantalla(t) || { x: 600, y: 300 };
    const e = linea(GUION_CARA_G, CARAS_G, "inicio", t);
    const mir = lineaMirada(GUION_MIRA_G, c, t);
    p.cara = cara(e, mir, parpadeo(t, PARP_G));
    p.rojo = 0.65 * tramo(t, T.saca2, T.saca2 + 0.4) * (1 - tramo(t, T.sacude1, T.saca3 + 0.2));
    p.cara.rubor = Math.max(p.rojo, 0.55 * tramo(t, T.recibe + 0.3, T.recibe + 0.7));
    p.enfado = tramo(t, T.escapa2 + 0.1, T.sacude0 + 0.1) * (1 - tramo(t, T.sacude1 - 0.1, T.saca3));
    p.sudor = tramo(t, T.coge3, T.g3a + 0.3) * (1 - tramo(t, T.desploma + 0.2, T.flick));
    const l = lineaM(GUION_GL, MANO_GL, "bolsillo", c, t), n = lineaM(GUION_GC, MANO_GC, "bolsillo", c, t);
    const aH = q => G.aHoja(p, q);
    const ql = aH(l), qn = aH(n);
    p.manoLejos = { x: ql.x, y: ql.y, ang: l.ang, mu: l.mu, puno: l.puno, dobla: -1, dedos: l.dedos };
    p.manoCerca = { x: qn.x, y: qn.y, ang: n.ang, mu: n.mu, puno: n.puno, dobla: -1, dedos: n.dedos };
    if (l.moneda > 0.01) {
      const km = l.moneda, mu = l.mu;
      p.manoLejos.objeto = gg => { const f = { x: -Math.cos(mu) * 19, y: -Math.sin(mu) * 19 }, th = { x: -Math.sin(mu) * 5, y: Math.cos(mu) * 5 };
        moneda(gg, f.x + th.x, f.y + th.y, km * 1.5, 0.9); };
    }
    // peluche gigante en brazos (capa del torso: debajo de la cabeza y de los brazos)
    const gp = gigPantalla(t);
    if (gp && gp.capa === "guille") p.capaTronco = gg => enPantalla(gg, h => dibGigante(h, gp));
    p.capaCabeza = gg => pucheros(gg, t);
    return p;
  }
  function ctxA(t, p) {
    const Tr = A.tronco(p), aP = q => A.aPantalla(p, q);
    return { t, p, Tr, hc: aP(Tr(A.HOMBRO_C)), hl: aP(Tr(A.HOMBRO)), boca: aP(A.boca(p)) };
  }
  function poseA(t) {
    const p = poseBaseA(t), c = ctxA(t, p);
    const gs = gancho(t);
    c.garra = { x: gs.hx, y: gs.hy };
    c.cabC = A.aPantalla(p, A.centroCabeza(p));
    const pg = poseBaseG(t); c.guille = G.aPantalla(pg, G.centroCabeza(pg));
    const e = linea(GUION_CARA_A, CARAS_A, "inicio", t);
    const mir = lineaMirada(GUION_MIRA_A, c, t);
    const guino = campana(t, 13.95, 14.35);
    p.cara = cara(e, mir, parpadeo(t, PARP_A), guino);
    const l = lineaM(GUION_AL, MANO_AL, "bolsillo", c, t);
    const ql = A.aHoja(p, l);
    p.manoLejos = { x: ql.x, y: ql.y, ang: l.ang, mu: l.mu, puno: l.puno, dobla: 1, dedos: l.dedos };
    const qn = A.tronco(p)(A.BOLSILLO_C);
    p.manoCerca = { x: qn.x, y: qn.y, ang: 0, mu: -1.75, puno: 0, dobla: -1, dedos: PUNO };
    if (l.moneda > 0.01 && t < T.flick + 0.02) {
      const km = l.moneda;
      p.manoLejos.objeto = gg => moneda(gg, 4, -12, km * 0.9, 0.3);
    }
    // el peluche gigante cuando lo lleva Ander (y por el aire, hasta que llega a Guillermo)
    const gp = gigPantalla(t);
    if (gp && gp.capa === "ander") { const prev = p.manoLejos.objeto; p.manoLejos.objeto = (gg, tt) => { if (prev) prev(gg, tt); enPantalla(gg, h => dibGigante(h, gp)); }; }
    return p;
  }
  const pose = t => ({ g: poseG(t), a: poseA(t) });

  /* ---------- peluche gigante fuera de la máquina (pantalla) ---------- */
  // devuelve {x, y, sx, sy, rot, cara, capa} para las fases «aire» (sale), «mano» (Ander), «vuelo» y «abrazo»
  function gigPantalla(t) {
    const gi = gigante(t);
    if (!gi) return null;
    if (gi.lugar === "vidrio") return null;
    if (gi.lugar === "aire") return Object.assign({}, gi, { capa: "ander" });
    // en la mano de Ander: cuelga de la etiqueta y se balancea
    if (t < T.lanza) {
      const pa = poseBaseA(t), c = ctxA(t, pa), l = lineaM(GUION_AL, MANO_AL, "bolsillo", c, t);
      const vy = (lineaM(GUION_AL, MANO_AL, "bolsillo", ctxA(t + 0.03, poseBaseA(t + 0.03)), t + 0.03).x - l.x) / 0.03;
      const balanceo = -clamp(vy / 900, -0.5, 0.5) + 0.12 * Math.sin((t - T.atrapa) * 9) * Math.exp(-(t - T.atrapa) * 3);
      const cuelga = R_GIG + 8;
      const x = l.x - Math.sin(balanceo) * cuelga, y = l.y + Math.cos(balanceo) * cuelga + 2;
      const pell = 1 + 0.1 * Math.exp(-(t - T.atrapa) * 10) * Math.sin((t - T.atrapa) * 30);
      return { x, y, sx: 1 / pell, sy: pell, rot: balanceo * 0.8, cara: "dormido", capa: "ander", lugar: "mano" };
    }
    // por el aire hasta el pecho de Guillermo
    const destino = (() => { const pg = poseBaseG(T.recibe); return G.aPantalla(pg, G.tronco(pg)(PECHO_G)); })();
    if (t < T.recibe) {
      const g0 = gigPantalla(T.lanza - 1e-4), u = t - T.lanza, Dv = T.recibe - T.lanza;
      const vy = (destino.y - g0.y - 750 * Dv * Dv) / Dv;
      const x = lerp(g0.x, destino.x, u / Dv), y = g0.y + vy * u + 750 * u * u;
      return { x, y, sx: 1, sy: 1, rot: g0.rot - 0.7 * (u / Dv), cara: "dormido", capa: x < 478 ? "guille" : "ander", lugar: "vuelo" };
    }
    // en brazos de Guillermo: lo aprieta
    const pg = poseBaseG(t), c = G.aPantalla(pg, G.tronco(pg)(PECHO_G)), u = t - T.recibe;
    const llega = Math.exp(-u * 8) * Math.sin(u * 26) * 0.12, apr = 0.06 * tramo(t, T.recibe + 0.15, T.recibe + 0.35) + 0.03 * Math.sin(u * 5) * tramo(t, T.recibe + 0.3, T.recibe + 0.6);
    const rot0 = lerp(-0.7, -0.08, salida(clamp(u / 0.25)));
    return { x: c.x, y: c.y, sx: 1 + llega + apr, sy: 1 - llega - apr * 0.8, rot: rot0 + pg.torso, cara: "dormido", capa: "guille", lugar: "abrazo" };
  }
  function dibGigante(g, gi) {
    g.save(); g.translate(gi.x, gi.y); g.rotate(gi.rot || 0); g.scale(gi.sx, gi.sy);
    // etiqueta en lazo encima de la cabeza
    g.strokeStyle = TINTA; g.lineWidth = 4.2; g.lineCap = "round";
    g.beginPath(); g.ellipse(0, -R_GIG - 8, 6, 9, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "#ffffff"; g.lineWidth = 2.2; g.stroke();
    peluche(g, "gato", 0, 0, R_GIG, 0, 1, 1, gi.cara || "dormido");
    g.restore();
  }

  /* ---------- pucheros de Guillermo: labio de abajo que tiembla y ojos llorosos (retrato) ---------- */
  function pucheros(g, t) {
    const k = tramo(t, T.recibe + 0.15, T.recibe + 0.45);
    if (k <= 0.01) return;
    g.save(); g.translate(803, 742); g.rotate(0.26);
    const tiembla = 1.2 * Math.sin(t * 38) * k;
    g.fillStyle = "#e28c7c"; g.strokeStyle = TINTA; g.lineWidth = 4.5; g.globalAlpha = k;
    g.beginPath(); g.moveTo(-26, 6); g.quadraticCurveTo(0, 30 + tiembla, 26, 6); g.quadraticCurveTo(0, 14, -26, 6); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(-26, 6); g.quadraticCurveTo(0, 30 + tiembla, 26, 6); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.ellipse(-4, 18, 8, 3, 0, 0, Math.PI * 2); g.fill();
    g.restore();
    // ojos llorosos: brillo de agua sobre el párpado de abajo
    g.save(); g.globalAlpha = 0.85 * k; g.strokeStyle = "#7fd0ff"; g.lineWidth = 6; g.lineCap = "round";
    g.beginPath(); g.moveTo(745, 574); g.quadraticCurveTo(772, 590, 803, 588); g.stroke();
    g.beginPath(); g.moveTo(872, 628); g.quadraticCurveTo(894, 638, 916, 634); g.stroke();
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(790, 586, 3.5, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  /* =====================================================================================
   * DIBUJO DE LA MÁQUINA
   * ===================================================================================== */
  const C_MAQ = { turquesa: "#1fb5ad", turqOsc: "#127a75", turqLuz: "#7fe3d9", rosa: "#ff5fa2", rosaOsc: "#c22f72", amarillo: "#ffd23f", cromo: "#d4dbe3", cromoOsc: "#8a95a3" };
  let capaMaq = null, capaFrente = null, capaFilaA = null, capaFilaD = null;
  function rr(g, x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }
  function creaMaquina() {
    // fondo de la máquina (todo lo que queda detrás de los peluches y del gancho)
    capaMaq = document.createElement("canvas"); capaMaq.width = W; capaMaq.height = H;
    let g = capaMaq.getContext("2d"); g.lineJoin = "round"; g.lineCap = "round";
    // sombra en el suelo
    g.fillStyle = "rgba(0,0,0,0.4)"; g.beginPath(); g.ellipse(MX, SUELO + 2, 150, 12, 0, 0, Math.PI * 2); g.fill();
    // lateral en perspectiva (derecha)
    g.fillStyle = C_MAQ.turqOsc; g.strokeStyle = TINTA; g.lineWidth = 3;
    g.beginPath(); g.moveTo(CAB.x1, MARQ.y0 + 20); g.lineTo(CAB.x1 + 18, MARQ.y0 + 30); g.lineTo(CAB.x1 + 18, SUELO - 6); g.lineTo(CAB.x1, SUELO); g.closePath(); g.fill(); g.stroke();
    // mueble de abajo
    const gm = g.createLinearGradient(CAB.x0, 0, CAB.x1, 0); gm.addColorStop(0, C_MAQ.turquesa); gm.addColorStop(0.55, "#29c7be"); gm.addColorStop(1, "#17958f");
    g.fillStyle = gm; g.beginPath(); g.rect(CAB.x0, CONS.yC, CAB.x1 - CAB.x0, SUELO - 12 - CONS.yC); g.fill(); g.stroke();
    // franja rosa con estrellas y lunares (sin letras)
    g.fillStyle = C_MAQ.rosa; g.fillRect(CAB.x0 + 3, 404, CAB.x1 - CAB.x0 - 6, 34); g.strokeRect(CAB.x0 + 3, 404, CAB.x1 - CAB.x0 - 6, 34);
    for (let i = 0; i < 7; i++) { const x = CAB.x0 + 22 + i * 30; estrella(g, x, 421, i % 2 ? 7 : 9, 5, -Math.PI / 2, 0.45); g.fillStyle = i % 2 ? "#ffffff" : C_MAQ.amarillo; g.fill(); g.lineWidth = 1.5; g.stroke(); }
    // panel con un peluche dibujado (reclamo) a la izquierda
    g.fillStyle = "#fff4fa"; rr(g, CAB.x0 + 14, 452, 120, 76, 10); g.fill(); g.lineWidth = 2.5; g.stroke();
    peluche(g, "gato", CAB.x0 + 52, 494, 20, -0.1); peluche(g, "pollito", CAB.x0 + 98, 500, 15, 0.12);
    g.fillStyle = C_MAQ.rosa; for (const [x, y] of [[CAB.x0 + 28, 466], [CAB.x0 + 120, 464], [CAB.x0 + 124, 516]]) { corazon(g, x, y, 6); g.fill(); }
    // marco de la trampilla de premios
    g.fillStyle = C_MAQ.cromo; rr(g, TRAMP.x0 - 7, TRAMP.y0 - 7, TRAMP.x1 - TRAMP.x0 + 14, TRAMP.y1 - TRAMP.y0 + 14, 6); g.fill(); g.lineWidth = 2.5; g.stroke();
    g.fillStyle = "#0e0a12"; g.fillRect(TRAMP.x0, TRAMP.y0, TRAMP.x1 - TRAMP.x0, TRAMP.y1 - TRAMP.y0);
    // zócalo
    g.fillStyle = "#14131a"; g.fillRect(CAB.x0 - 4, SUELO - 14, CAB.x1 - CAB.x0 + 8, 14); g.lineWidth = 2.5; g.strokeRect(CAB.x0 - 4, SUELO - 14, CAB.x1 - CAB.x0 + 8, 14);
    // columnas del cristal y marquesina
    g.fillStyle = C_MAQ.turquesa; g.fillRect(CAB.x0, MARQ.y1, VID.x0 - CAB.x0, VID.y1 - MARQ.y1); g.fillRect(VID.x1, MARQ.y1, CAB.x1 - VID.x1, VID.y1 - MARQ.y1);
    g.lineWidth = 2.5; g.strokeRect(CAB.x0, MARQ.y1, VID.x0 - CAB.x0, VID.y1 - MARQ.y1); g.strokeRect(VID.x1, MARQ.y1, CAB.x1 - VID.x1, VID.y1 - MARQ.y1);
    // interior del cristal: pared del fondo con espejos y lucecitas
    const fi = g.createLinearGradient(0, VID.y0, 0, VID.y1); fi.addColorStop(0, "#3a1f5c"); fi.addColorStop(1, "#7a3d8a");
    g.fillStyle = fi; g.fillRect(VID.x0, VID.y0, VID.x1 - VID.x0, VID.y1 - VID.y0);
    g.fillStyle = "rgba(255,255,255,0.08)"; for (let i = 0; i < 26; i++) { const x = VID.x0 + 8 + hash(i + 70) * (VID.x1 - VID.x0 - 16), y = VID.y0 + 30 + hash(i + 71) * 110; g.beginPath(); g.arc(x, y, 1.5 + hash(i + 72) * 2, 0, Math.PI * 2); g.fill(); }
    // riel del carro
    g.fillStyle = C_MAQ.cromoOsc; g.fillRect(VID.x0, RIEL_Y - 4, VID.x1 - VID.x0, 7); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.strokeRect(VID.x0, RIEL_Y - 4, VID.x1 - VID.x0, 7);
    g.fillStyle = "rgba(255,255,255,0.5)"; g.fillRect(VID.x0, RIEL_Y - 3, VID.x1 - VID.x0, 2);
    // fondo de la rampa (oscuro, el agujero)
    g.fillStyle = "#1a0e22"; g.fillRect(CH.x0, CH.borde + 8, CH.x1 - CH.x0, VID.y1 - CH.borde - 8);
    g.fillStyle = "#0a0610"; g.beginPath(); g.ellipse((CH.x0 + CH.x1) / 2, VID.y1 - 6, (CH.x1 - CH.x0) / 2 - 3, 8, 0, 0, Math.PI * 2); g.fill();
    // marquesina con su remate redondeado
    const mq = g.createLinearGradient(0, MARQ.y0, 0, MARQ.y1); mq.addColorStop(0, "#ff86bb"); mq.addColorStop(1, C_MAQ.rosa);
    g.fillStyle = mq; g.beginPath(); g.moveTo(CAB.x0 - 6, MARQ.y1); g.lineTo(CAB.x0 - 6, MARQ.y0 + 22); g.quadraticCurveTo(MX, MARQ.y0 - 26, CAB.x1 + 6, MARQ.y0 + 22); g.lineTo(CAB.x1 + 6, MARQ.y1); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 3; g.stroke();
    // en la marquesina: un gancho con un corazón (dibujo, sin letras)
    g.save(); g.translate(MX, MARQ.y0 + 42);
    g.fillStyle = "#fff4fa"; rr(g, -70, -24, 140, 46, 20); g.fill(); g.lineWidth = 2.5; g.stroke();
    g.strokeStyle = C_MAQ.cromoOsc; g.lineWidth = 3; g.beginPath(); g.moveTo(-6, -22); g.lineTo(-6, -8); g.stroke();
    g.fillStyle = C_MAQ.cromo; g.strokeStyle = TINTA; g.lineWidth = 2; rr(g, -14, -10, 16, 8, 3); g.fill(); g.stroke();
    g.lineWidth = 3.5; g.beginPath(); g.moveTo(-12, -2); g.quadraticCurveTo(-22, 8, -14, 16); g.moveTo(0, -2); g.quadraticCurveTo(10, 8, 2, 16); g.stroke();
    corazon(g, -6, 14, 9); g.fillStyle = C_MAQ.rosa; g.fill(); g.lineWidth = 2; g.stroke();
    for (const [x, y, r] of [[-48, -2, 7], [38, 0, 9], [52, -10, 5], [-36, 10, 5]]) { estrella(g, x, y, r, 5, -Math.PI / 2, 0.45); g.fillStyle = C_MAQ.amarillo; g.fill(); g.lineWidth = 1.4; g.stroke(); }
    g.restore();
    // capa de delante: cristal (brillos), pared de la rampa, marco, consola
    capaFrente = document.createElement("canvas"); capaFrente.width = W; capaFrente.height = H;
    g = capaFrente.getContext("2d"); g.lineJoin = "round"; g.lineCap = "round";
    // pared de metacrilato de la rampa
    g.fillStyle = "rgba(200,240,255,0.22)"; g.fillRect(CH.x0 - 3, CH.borde, CH.x1 - CH.x0 + 3, VID.y1 - CH.borde);
    g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 2; g.beginPath(); g.moveTo(CH.x0 - 3, VID.y1); g.lineTo(CH.x0 - 3, CH.borde); g.lineTo(CH.x1, CH.borde); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 1.4; g.beginPath(); g.moveTo(CH.x0 - 4.5, VID.y1); g.lineTo(CH.x0 - 4.5, CH.borde - 1.5); g.lineTo(CH.x1, CH.borde - 1.5); g.stroke();
    // brillos del cristal
    g.save(); g.beginPath(); g.rect(VID.x0, VID.y0, VID.x1 - VID.x0, VID.y1 - VID.y0); g.clip();
    g.fillStyle = "rgba(255,255,255,0.13)"; g.beginPath(); g.moveTo(VID.x0 + 20, VID.y0); g.lineTo(VID.x0 + 60, VID.y0); g.lineTo(VID.x0 - 10, VID.y1); g.lineTo(VID.x0 - 50, VID.y1); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,0.08)"; g.beginPath(); g.moveTo(VID.x0 + 80, VID.y0); g.lineTo(VID.x0 + 92, VID.y0); g.lineTo(VID.x0 + 22, VID.y1); g.lineTo(VID.x0 + 10, VID.y1); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,0.1)"; g.beginPath(); g.moveTo(VID.x1 - 30, VID.y0); g.lineTo(VID.x1 - 18, VID.y0); g.lineTo(VID.x1 - 70, VID.y1); g.lineTo(VID.x1 - 82, VID.y1); g.closePath(); g.fill();
    g.restore();
    g.strokeStyle = TINTA; g.lineWidth = 3; g.strokeRect(VID.x0, VID.y0, VID.x1 - VID.x0, VID.y1 - VID.y0);
    g.fillStyle = C_MAQ.cromo; g.fillRect(VID.x0, VID.y0 - 8, VID.x1 - VID.x0, 8); g.lineWidth = 2; g.strokeRect(VID.x0, VID.y0 - 8, VID.x1 - VID.x0, 8);
    // consola: tapa en perspectiva y frente
    const tapa = g.createLinearGradient(0, CONS.yA, 0, CONS.yB); tapa.addColorStop(0, "#ff9ac6"); tapa.addColorStop(1, C_MAQ.rosa);
    g.fillStyle = tapa; g.beginPath(); g.moveTo(CAB.x0, CONS.yA); g.lineTo(CAB.x1, CONS.yA); g.lineTo(CONS.x1, CONS.yB); g.lineTo(CONS.x0, CONS.yB); g.closePath(); g.fill(); g.lineWidth = 2.5; g.stroke();
    const fr = g.createLinearGradient(0, CONS.yB, 0, CONS.yC); fr.addColorStop(0, C_MAQ.rosaOsc); fr.addColorStop(1, "#8f1f53");
    g.fillStyle = fr; g.beginPath(); g.rect(CONS.x0, CONS.yB, CONS.x1 - CONS.x0, CONS.yC - CONS.yB); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(CONS.x0 + 4, CONS.yB + 2, CONS.x1 - CONS.x0 - 8, 2);
    g.fillStyle = C_MAQ.amarillo; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(CONS.x0 + 30 + i * 26, CONS.yB + 15, 2.6, 0, Math.PI * 2); g.fill(); }
    // placa de la ranura (cromada) y base de la palanca
    g.fillStyle = C_MAQ.cromo; g.strokeStyle = TINTA; g.lineWidth = 1.6; rr(g, RANURA.x - 11, RANURA.y - 5, 22, 10, 3); g.fill(); g.stroke();
    g.fillStyle = "#0b0a0e"; g.fillRect(RANURA.x - 6, RANURA.y - 1.5, 12, 3);
    g.fillStyle = "#1b1a20"; g.beginPath(); g.ellipse(BASE_P.x, BASE_P.y, 13, 5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#2a2a32"; g.beginPath(); g.ellipse(BOTON.x, BOTON.y + 3, BOTON.r + 4, 6, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    // filas de peluches en caché (antes del gigante)
    capaFilaA = filaEnCache(FILA_ATRAS.filter(q => q.id !== "P1" && q.id !== "P2"));
    capaFilaD = filaEnCache(FILA_DELANTE);
  }
  const CACHE_FILA = { x: VID.x0, y: 262, w: VID.x1 - VID.x0, h: 80 };
  function filaEnCache(lista) {
    const c = document.createElement("canvas"); c.width = CACHE_FILA.w; c.height = CACHE_FILA.h;
    const g = c.getContext("2d"); g.translate(-CACHE_FILA.x, -CACHE_FILA.y);
    for (const q of lista) peluche(g, q.tipo, q.x, q.y, q.r, q.rot);
    return c;
  }
  function estrella(g, x, y, r, n, rot0, rel) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot0 + i * Math.PI / n, rr_ = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr_, y + Math.sin(a) * rr_); } g.closePath(); }
  function corazon(g, x, y, r) { g.beginPath(); g.moveTo(x, y + r * 0.9); g.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.6, y - r * 1.2, x, y - r * 0.35); g.bezierCurveTo(x + r * 0.6, y - r * 1.2, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); g.closePath(); }

  // bombillas alrededor del cristal y de la marquesina
  const BOMBILLAS = (() => {
    const L = [];
    for (let i = 0; i < 8; i++) L.push({ x: CAB.x0 + 6, y: MARQ.y1 + 14 + i * 26 });
    for (let i = 0; i < 8; i++) L.push({ x: CAB.x1 - 6, y: MARQ.y1 + 14 + i * 26 });
    for (let i = 0; i < 9; i++) { const k = i / 8, x = lerp(CAB.x0 + 4, CAB.x1 - 4, k); L.push({ x, y: MARQ.y0 + 22 - 4 * 30 * k * (1 - k) * 1.2 + 6 }); }
    return L;
  })();
  function luces(g, t) {
    const juego = Math.max(tramo(t, T.clin1, T.clin1 + 0.2) * (1 - tramo(t, T.vuelve1b, T.vuelve1b + 0.3)), tramo(t, T.clin2, T.clin2 + 0.2) * (1 - tramo(t, T.vuelve2b, T.vuelve2b + 0.3)),
      tramo(t, T.clin3, T.clin3 + 0.2) * (1 - tramo(t, T.vuelve3b, T.vuelve3b + 0.3)));
    const fiesta = tramo(t, T.golpe, T.golpe + 0.2) * (1 - tramo(t, T.atrapa + 0.4, T.fin));
    const vel = 3 + 8 * juego + 12 * fiesta;
    const pal = ["#ffe24d", "#ff6fae", "#7ff0ff", "#9dff7a"];
    BOMBILLAS.forEach((b, i) => {
      const fase_ = (i * 0.37 - t * vel * 0.25) % 1, on = 0.5 + 0.5 * Math.cos((fase_ < 0 ? fase_ + 1 : fase_) * Math.PI * 2);
      const col = fiesta > 0.5 ? pal[(i + Math.floor(t * 6)) % 4] : (i % 2 ? "#ffe24d" : "#fff6c8");
      g.globalAlpha = 0.35 + 0.65 * on; g.fillStyle = col; g.beginPath(); g.arc(b.x, b.y, 3.6, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 1; g.strokeStyle = TINTA; g.lineWidth = 1; g.stroke();
    });
    g.globalAlpha = 1;
    // brillo del cristal cuando hay premio
    if (fiesta > 0.01) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.18 * fiesta * (0.6 + 0.4 * Math.sin(t * 9));
      g.fillStyle = "#ff7ac0"; g.fillRect(VID.x0, VID.y0, VID.x1 - VID.x0, VID.y1 - VID.y0); g.restore(); }
  }
  // el gancho: carro, cable, cubo y pinzas (las laterales detrás del peluche, la de delante encima)
  function pinza(g, s, abre) {
    const a1 = lerp(0.1, 0.95, abre), a2 = a1 - 1.3;
    const b = { x: s * 7, y: 6 }, m = { x: b.x + s * Math.sin(a1) * 15, y: b.y + Math.cos(a1) * 15 }, p = { x: m.x + s * Math.sin(a2) * 12, y: m.y + Math.cos(a2) * 12 };
    g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(m.x, m.y); g.lineTo(p.x, p.y);
    g.strokeStyle = TINTA; g.lineWidth = 7; g.stroke(); g.strokeStyle = C_MAQ.cromo; g.lineWidth = 4; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(b.x - s, b.y + 1); g.lineTo(m.x - s, m.y); g.stroke();
  }
  function ganchoAtras(g, gs) {
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    // carro
    g.fillStyle = C_MAQ.cromoOsc; g.strokeStyle = TINTA; g.lineWidth = 1.8; rr(g, gs.x - 12, RIEL_Y - 7, 24, 13, 3); g.fill(); g.stroke();
    g.fillStyle = "#ff5fa2"; g.beginPath(); g.arc(gs.x, RIEL_Y - 1, 2.4, 0, Math.PI * 2); g.fill();
    // cable
    g.strokeStyle = "#2a2730"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(gs.x, RIEL_Y + 6); g.lineTo(gs.hx, gs.hy - 6); g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.45)"; g.lineWidth = 0.8; g.stroke();
    // cubo y pinzas laterales
    g.translate(gs.hx, gs.hy); g.rotate(-gs.th * 0.5);
    pinza(g, -1, gs.abre); pinza(g, 1, gs.abre);
    g.fillStyle = C_MAQ.cromo; g.strokeStyle = TINTA; g.lineWidth = 1.8; rr(g, -10, -8, 20, 15, 4); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.75)"; g.fillRect(-7, -6, 3, 10);
    g.fillStyle = "#ffd23f"; g.beginPath(); g.arc(0, -1, 2.4, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function ganchoDelante(g, gs) {
    g.save(); g.lineCap = "round"; g.translate(gs.hx, gs.hy); g.rotate(-gs.th * 0.5);
    const L = lerp(24, 16, gs.abre), cu = lerp(-3, 4, gs.abre);
    g.beginPath(); g.moveTo(0, 6); g.quadraticCurveTo(cu, 6 + L * 0.6, -cu * 0.5, 6 + L);
    g.strokeStyle = TINTA; g.lineWidth = 6.5; g.stroke(); g.strokeStyle = "#e9eef3"; g.lineWidth = 3.6; g.stroke();
    g.restore();
  }
  // trampilla de premios: la tapa se abre de golpe hacia fuera
  function trampilla(g, t) {
    const ab = tramo(t, T.trampilla - 0.02, T.trampilla + 0.06, salida) * (1 - tramo(t, T.trampilla + 0.5, T.trampilla + 0.8));
    const reb = ab > 0.98 ? 0 : 0;
    const h = (TRAMP.y1 - TRAMP.y0) * (1 - ab * 0.92) + reb, x0 = TRAMP.x0, w = TRAMP.x1 - TRAMP.x0;
    g.save(); g.lineJoin = "round";
    const gr = g.createLinearGradient(0, TRAMP.y0, 0, TRAMP.y0 + h); gr.addColorStop(0, "#c9d1da"); gr.addColorStop(1, "#7d8896");
    g.fillStyle = gr; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x0 - 2 * ab, TRAMP.y0); g.lineTo(x0 + w + 2 * ab, TRAMP.y0); g.lineTo(x0 + w + 6 * ab, TRAMP.y0 + h); g.lineTo(x0 - 6 * ab, TRAMP.y0 + h); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(x0 + w / 2 - 9, TRAMP.y0 + h * 0.6 - 2, 18, 4);
    g.restore();
  }

  /* =====================================================================================
   * DECORADO: rincón de recreativos
   * ===================================================================================== */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 140; const g = c.getContext("2d");
    g.translate(60, 70); g.lineJoin = "round"; g.lineCap = "round";
    // pared morada con un degradado
    const pared = g.createLinearGradient(0, -70, 0, 470); pared.addColorStop(0, "#1a1033"); pared.addColorStop(1, "#3a1f5a");
    g.fillStyle = pared; g.fillRect(-60, -70, W + 120, 540);
    // paneles de la pared
    g.strokeStyle = "rgba(255,255,255,0.05)"; g.lineWidth = 2; for (let x = -40; x < W + 60; x += 110) g.strokeRect(x, 20, 96, 380);
    // neones sin letras: estrella, rayo, anillo y onda
    const neon = (dibuja, col) => { g.save(); g.strokeStyle = col; g.globalAlpha = 0.25; g.lineWidth = 14; dibuja(); g.stroke(); g.globalAlpha = 0.5; g.lineWidth = 7; dibuja(); g.stroke(); g.globalAlpha = 1; g.strokeStyle = "#ffffff"; g.lineWidth = 2.2; dibuja(); g.stroke(); g.restore(); };
    neon(() => estrella(g, 150, 110, 44, 5, -Math.PI / 2, 0.45), "#ff4fd1");
    neon(() => { g.beginPath(); g.moveTo(268, 70); g.lineTo(244, 122); g.lineTo(266, 122); g.lineTo(240, 176); }, "#ffe14d");
    neon(() => { g.beginPath(); g.arc(860, 112, 38, 0, Math.PI * 2); }, "#4ff3ff");
    neon(() => { g.beginPath(); for (let i = 0; i <= 40; i++) { const x = 790 + i * 4.2, y = 190 + 10 * Math.sin(i / 40 * Math.PI * 4); if (i) g.lineTo(x, y); else g.moveTo(x, y); } }, "#8dff6a");
    // máquinas recreativas al fondo, en penumbra
    const recreativa = (x, w, col, pant) => {
      g.save(); g.fillStyle = col; g.strokeStyle = "#07040c"; g.lineWidth = 3;
      g.beginPath(); g.moveTo(x, 470); g.lineTo(x, 236); g.lineTo(x + 14, 206); g.lineTo(x + w - 14, 206); g.lineTo(x + w, 236); g.lineTo(x + w, 470); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#0b0712"; g.fillRect(x + 12, 244, w - 24, 88);
      const gr = g.createLinearGradient(0, 244, 0, 332); gr.addColorStop(0, pant); gr.addColorStop(1, "#140a24");
      g.globalAlpha = 0.85; g.fillStyle = gr; g.fillRect(x + 16, 248, w - 32, 80); g.globalAlpha = 1;
      g.fillStyle = "rgba(255,255,255,0.75)"; for (let i = 0; i < 9; i++) g.fillRect(x + 22 + hash(i + x) * (w - 50), 256 + hash(i + x + 3) * 60, 5, 5);
      g.fillStyle = "#0b0712"; g.fillRect(x + 6, 338, w - 12, 18);
      g.fillStyle = "#ff3a5c"; g.beginPath(); g.arc(x + w * 0.35, 347, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = "#3aff8c"; g.beginPath(); g.arc(x + w * 0.6, 347, 4, 0, Math.PI * 2); g.fill();
      g.fillStyle = "rgba(0,0,0,0.45)"; g.fillRect(x, 206, w, 264);
      g.restore();
    };
    recreativa(28, 110, "#3b2c8a", "#38e0ff"); recreativa(150, 100, "#7a1f5a", "#ff7a3a");
    recreativa(850, 108, "#1f6a7a", "#9dff5a"); recreativa(962, 96, "#5a3b8a", "#ff4fd1");
    // rodapié
    g.fillStyle = "#12091f"; g.fillRect(-60, 462, W + 120, SUELO - 462);
    g.fillStyle = "#ff4fd1"; g.globalAlpha = 0.6; g.fillRect(-60, 460, W + 120, 3); g.globalAlpha = 1;
    // moqueta de recreativos: azul noche con formas de colores
    const su = g.createLinearGradient(0, SUELO, 0, H + 70); su.addColorStop(0, "#1b1446"); su.addColorStop(1, "#0d0a26");
    g.fillStyle = su; g.fillRect(-60, SUELO, W + 120, H + 70 - SUELO);
    const cols = ["#ff4fd1", "#4ff3ff", "#ffe14d", "#8dff6a", "#ff8a3a"];
    for (let i = 0; i < 70; i++) {
      const x = -50 + hash(i + 300) * (W + 100), y = SUELO + 6 + hash(i + 301) * (H + 50 - SUELO), sc = 0.5 + (y - SUELO) / 110;
      g.save(); g.translate(x, y); g.scale(sc, sc * 0.5); g.rotate(hash(i + 302) * 6); g.strokeStyle = cols[i % 5]; g.fillStyle = cols[i % 5]; g.globalAlpha = 0.55; g.lineWidth = 2.5;
      const f = i % 4;
      if (f === 0) { g.beginPath(); g.moveTo(-7, 5); g.lineTo(0, -7); g.lineTo(7, 5); g.closePath(); g.stroke(); }
      else if (f === 1) { g.beginPath(); g.arc(0, 0, 5, 0, Math.PI * 2); g.stroke(); }
      else if (f === 2) { g.beginPath(); g.moveTo(-9, 0); g.quadraticCurveTo(-4, -6, 0, 0); g.quadraticCurveTo(4, 6, 9, 0); g.stroke(); }
      else { g.beginPath(); g.arc(0, 0, 2.5, 0, Math.PI * 2); g.fill(); }
      g.restore();
    }
    g.fillStyle = "rgba(255,120,220,0.15)"; g.fillRect(-60, SUELO, W + 120, 2);
    // luz cálida de la máquina sobre la pared
    const halo = g.createRadialGradient(MX, 240, 30, MX, 240, 360); halo.addColorStop(0, "rgba(255,140,210,0.32)"); halo.addColorStop(1, "rgba(255,140,210,0)");
    g.fillStyle = halo; g.fillRect(-60, -70, W + 120, 600);
    // viñeta
    const v = g.createRadialGradient(512, 300, 280, 512, 300, 720); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.55)");
    g.fillStyle = v; g.fillRect(-60, -70, W + 120, H + 140);
    return c;
  }

  /* ---------- efectos ---------- */
  function rayitas(g, t, t0, x, y, r, n = 6, col = "#ffffff", dur = 0.22) {
    const k = fase(t, t0, t0 + dur); if (k <= 0 || k >= 1) return;
    g.save(); g.strokeStyle = col; g.globalAlpha = 1 - k; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + 0.3, r0 = r + 10 * k; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * (r0 + 8), y + Math.sin(a) * (r0 + 8)); g.stroke(); }
    g.restore();
  }
  function impacto(g, t, t0, x, y, tam) {
    const k = fase(t, t0, t0 + 0.28); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    estrella(g, x, y, tam * (0.6 + 0.8 * salida(k)), 10, 0.3, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke();
    estrella(g, x, y, tam * (0.35 + 0.5 * salida(k)), 10, 0.55, 0.5); g.fillStyle = "#ffffff"; g.fill();
    g.restore();
  }
  // líneas de «clac» al cerrar las pinzas en el aire
  function clacs(g, t, gs) {
    for (const t0 of [T.cierra3, T.clac0 + 0.09, T.clac0 + 0.27]) rayitas(g, t, t0, gs.hx, gs.hy + 26, 8, 5, "#ffffff", 0.18);
  }
  // líneas de movimiento al aporrear el botón
  function golpesBoton(g, t, sh) { for (const t0 of [T.boton1, T.boton2]) rayitas(g, t, t0, BOTON.x + sh.x, BOTON.y + sh.y - 8, 12, 7, "#ffe14d", 0.2); }
  // corazoncitos alrededor de Guillermo abrazado al peluche
  function corazones(g, t, pg) {
    const k = tramo(t, T.recibe + 0.4, T.recibe + 0.7); if (k <= 0.01) return;
    const c = G.aPantalla(pg, G.centroCabeza(pg));
    g.save();
    for (let i = 0; i < 4; i++) {
      const ph = ((t - T.recibe) * 0.5 + i / 4) % 1, x = c.x - 60 + i * 40 + 8 * Math.sin(t * 2 + i), y = c.y - 20 - ph * 70;
      g.globalAlpha = k * Math.sin(Math.PI * ph) * 0.9; corazon(g, x, y, 7 + 2 * Math.sin(t * 4 + i)); g.fillStyle = "#ff6fae"; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke();
    }
    g.restore();
  }
  // estela del golpe de cadera
  function lineasCadera(g, t, pa) {
    const k = campana(t, T.cadera0, T.golpe + 0.18); if (k <= 0.01) return;
    const q = A.aPantalla(pa, A.tronco(pa)({ x: 330, y: 690 }));
    g.save(); g.strokeStyle = "rgba(255,255,255,0.75)"; g.lineWidth = 2.4; g.lineCap = "round"; g.globalAlpha = k;
    for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(q.x + 40, q.y + i * 12); g.lineTo(q.x + 70, q.y + i * 12); g.stroke(); }
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const r1 = tramo(t, T.boton1 - 0.2, T.baja1 + 0.2) * (1 - tramo(t, T.cabeza1, T.cabeza1 + 0.6));
    const r3 = tramo(t, T.dedo3 - 0.3, T.dedo3) * (1 - tramo(t, T.desploma, T.desploma + 0.5));
    const gig = tramo(t, T.golpe, T.golpe + 0.4) * (1 - tramo(t, T.trampilla, T.atrapa));
    const fin = tramo(t, T.recibe - 0.2, T.fin);
    const k = 1.08 + 0.06 * r1 + 0.06 * r3 + 0.07 * gig + 0.04 * fin;
    const x = 535 - 8 * r1 - 4 * r3 + 10 * gig - 46 * fin, y = 310;
    const tb = (t >= T.golpe ? 4 * Math.exp(-(t - T.golpe) * 7) : 0) + (t >= T.recibe ? 2.5 * Math.exp(-(t - T.recibe) * 8) : 0);
    return { k, x: x + ruido(t * 40) * tb, y: y + ruido(t * 43 + 3) * tb * 0.6 };
  }

  /* =====================================================================================
   * ESCENA
   * ===================================================================================== */
  class Gancho extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !A.listo()) return;
      if (!fondo) fondo = creaFondo();
      if (!capaMaq) creaMaquina();
      const P = pose(t), pg = P.g, pa = P.a;
      const luz = tramo(t, NEGRO_INICIO, 0.75, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t), sh = temblorMaq(t), gs = gancho(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      g.drawImage(fondo, -60, -70);
      // sombras de los dos en el suelo
      g.save(); g.fillStyle = "rgba(0,0,0,0.38)";
      g.beginPath(); g.ellipse(pg.x - 4, SUELO + 1, 92, 8, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pa.x, SUELO + 1, 90, 8, 0, 0, Math.PI * 2); g.fill(); g.restore();
      // ---- la máquina ----
      g.save(); g.translate(sh.x, sh.y);
      g.drawImage(capaMaq, 0, 0);
      g.save(); g.beginPath(); g.rect(VID.x0, VID.y0, VID.x1 - VID.x0, VID.y1 - VID.y0); g.clip();
      const yaGig = t >= T.sube4 - 0.06;
      // fila de atrás
      if (!yaGig) g.drawImage(capaFilaA, CACHE_FILA.x, CACHE_FILA.y);
      else for (const q of FILA_ATRAS) { if (q.id === "P1" || q.id === "P2") continue; const a = apartado(q, t); peluche(g, q.tipo, a.x, a.y, q.r, a.rot); }
      // peluches que se mueven cuando no los lleva el gancho
      const q1 = p1(t), q2 = p2(t);
      const lleva1 = t >= T.cierra1 && t < T.suelta1, lleva2 = t >= T.cierra2 && t < T.escapa2;
      const dibP = (tipo, q, r, cara) => { const a = yaGig ? apartado(q, t) : q; peluche(g, tipo, a.x, a.y, r, a.rot, 1, 1, cara); };
      const cayendo1 = t >= T.suelta1 && t < T.suelta1 + 0.75, cayendo2 = t >= T.escapa2 && t < T.escapa2 + 0.45;
      if (!lleva2 && !cayendo2) dibP("pollito", Object.assign({ rot: q2.rot }, q2), 13);
      if (!lleva1 && !cayendo1) dibP("gato", Object.assign({ rot: q1.rot }, q1), 14);
      // gigante dentro del cristal (detrás de la fila de delante mientras emerge)
      const gi = gigante(t);
      if (gi && gi.lugar === "vidrio") {
        g.save(); g.beginPath(); g.rect(VID.x0, VID.y0, VID.x1 - VID.x0, VID.y1 - VID.y0 - 1); g.clip();
        if (t >= T.suelta4) { g.beginPath(); g.rect(CH.x0 - 2, VID.y0, CH.x1 - CH.x0 + 2, VID.y1 - VID.y0); g.rect(VID.x0, VID.y0, VID.x1 - VID.x0, CH.borde - VID.y0); g.clip(); }
        dibGigante(g, gi); g.restore();
      }
      ganchoAtras(g, gs);
      if (lleva1) peluche(g, "gato", q1.x, q1.y, 14, q1.rot);
      if (lleva2) peluche(g, "pollito", q2.x, q2.y, 13, q2.rot, 1, 1, "susto");
      ganchoDelante(g, gs);
      // fila de delante
      if (!yaGig) g.drawImage(capaFilaD, CACHE_FILA.x, CACHE_FILA.y);
      else for (const q of FILA_DELANTE) { const a = apartado(q, t); peluche(g, q.tipo, a.x, a.y, q.r, a.rot, 1, 1, Math.abs(q.x - HOME) < 64 && t < T.arriba4 + 0.3 ? "susto" : "feliz"); }
      // los que caen van por delante de todo
      if (cayendo1) peluche(g, "gato", q1.x, q1.y, 14, q1.rot, 1, 1, "susto");
      if (cayendo2) peluche(g, "pollito", q2.x, q2.y, 13, q2.rot, 1, 1, "susto");
      g.restore();
      g.drawImage(capaFrente, 0, 0);
      // palanca y botón
      const pm = pomo(t, { x: 0, y: 0 });
      g.save(); g.lineCap = "round"; g.strokeStyle = TINTA; g.lineWidth = 6.5; g.beginPath(); g.moveTo(BASE_P.x, BASE_P.y); g.lineTo(pm.x, pm.y); g.stroke();
      g.strokeStyle = C_MAQ.cromo; g.lineWidth = 3.5; g.stroke();
      const gb = g.createRadialGradient(pm.x - 3, pm.y - 4, 1, pm.x, pm.y, 10); gb.addColorStop(0, "#ff9ab0"); gb.addColorStop(1, "#d81b4a");
      g.fillStyle = gb; g.beginPath(); g.arc(pm.x, pm.y, 9, 0, Math.PI * 2); g.fill(); g.lineWidth = 2; g.strokeStyle = TINTA; g.stroke();
      const hb = hundido(t);
      const gbo = g.createRadialGradient(BOTON.x - 4, BOTON.y - 4 + 3 * hb, 1, BOTON.x, BOTON.y + 3 * hb, BOTON.r + 2); gbo.addColorStop(0, "#fff38a"); gbo.addColorStop(1, "#f2a400");
      g.fillStyle = gbo; g.beginPath(); g.ellipse(BOTON.x, BOTON.y - 2 + 3 * hb, BOTON.r, BOTON.r * (0.62 - 0.12 * hb), 0, Math.PI, 0); g.lineTo(BOTON.x + BOTON.r, BOTON.y + 2); g.ellipse(BOTON.x, BOTON.y + 2, BOTON.r, 4, 0, 0, Math.PI); g.closePath(); g.fill(); g.stroke();
      // luz de la ranura
      const credito = Math.max(campana(t, T.clin1, T.clin1 + 0.3), campana(t, T.clin2, T.clin2 + 0.3), campana(t, T.clin3, T.clin3 + 0.3), campana(t, T.encaja, T.encaja + 0.3));
      g.fillStyle = credito > 0.05 ? `rgba(80,255,140,${0.4 + 0.6 * credito})` : "#1f5a36"; g.beginPath(); g.arc(RANURA.x + 14, RANURA.y, 2.6, 0, Math.PI * 2); g.fill();
      g.restore();
      trampilla(g, t);
      luces(g, t);
      g.restore();
      // ---- los dos ----
      CAM = g.getTransform();
      G.dibujar(g, pg, t);
      A.dibujar(g, pa, t);
      // ---- efectos por delante ----
      const ma = monedaAnder(t);
      if (ma) moneda(g, ma.x, ma.y, 1, ma.giro);
      for (const tc of [T.clin1, T.clin2, T.clin3, T.encaja]) rayitas(g, t, tc, RANURA.x + sh.x, RANURA.y + sh.y - 4, 6, 6, "#fff6b0", 0.24);
      golpesBoton(g, t, sh);
      clacs(g, t, { hx: gs.hx + sh.x, hy: gs.hy + sh.y });
      lineasCadera(g, t, pa);
      { const hp = A.aPantalla(pa, A.tronco(pa)({ x: 335, y: 690 })); impacto(g, t, T.golpe, CAB.x1 + 20, hp.y, 16); }
      impacto(g, t, T.trampilla, (TRAMP.x0 + TRAMP.x1) / 2, TRAMP.y0 + 20, 22);
      rayitas(g, t, VUELO1.t0 + VUELO1.tauC, VUELO1.xC + 8, CH.borde - 2, 6, 6, "#ffffff", 0.2);
      corazones(g, t, pg);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
      CAM = null;
    }
  }
  registrar({ id: "00036", nombre: "Guillermo y Ander · La máquina del gancho", crear: () => new Gancho() });
  window.__A2D_00036 = { pose, T, DUR, gancho, gigante, gigPantalla };
})();
