"use strict";
/* 00035 · Guillermo y Ander · El billar
 *
 * Negro → billar antiguo: pared granate con zócalo de madera, techo de vigas, una lámpara verde de
 * billar colgada sobre la mesa, taquero con tacos, marcador de bolas y un cuadro con el triángulo.
 * La mesa se ve de perfil, un poco desde arriba. Guillermo, en la punta izquierda, espera apoyado en
 * su taco; Ander, en la punta derecha (en espejo), le da tiza al suyo y sopla el polvillo.
 * → Ander se inclina, apunta y hace dos tiros de ensayo… y tira: la bola blanca hace una curva
 * imposible alrededor de la roja, toca la amarilla, que entra en la tronera del fondo, y se queda
 * quieta justo delante de Guillermo. Guillermo, boquiabierto, mira a cámara.
 * → Ander se incorpora y le cede el turno con la mano. Guillermo, picado, da tiza a lo bestia (nube
 * azul y tos), se inclina meneando la cadera, apunta con la lengua fuera y un ojo cerrado, hace mil
 * tiros de ensayo, guiña a cámara… echa el taco muy atrás y ¡zas!: le da demasiado fuerte.
 * → La blanca salta de la mesa, ¡clonc! contra la lámpara (que se balancea y se abolla), ¡pum!
 * contra el techo (grieta y polvillo)… y vuelve a caer en la coronilla de Guillermo: ¡coscorrón!
 * Rebota y entra limpiamente en la tronera de la esquina. Chichón, estrellitas y ojos en espiral.
 * → Ander, con su taco como bastón, rodea la mesa por detrás, le da dos palmaditas en el hombro y
 * guiña a cámara; Guillermo sonríe avergonzado → negro.
 *
 * Sin textos (las bolas no llevan números). Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, A = Ander;
  const S = 0.30, SUELO = 560, DUR = 14.3, TINTA = "#0b0a0e";
  const T = {
    tiza0: 0.6, tiza1: 1.35, sopla0: 1.4, sopla1: 1.72,
    baja0: 1.78, baja1: 2.38, prac0: 2.42, golpeA: 3.05,
    choque: 3.8, cae: 4.2, para: 4.5,
    sube0: 4.3, sube1: 4.9, turno0: 5.0, turno1: 5.65,
    gTiza0: 5.3, gTiza1: 6.05, nube: 5.5,
    gBaja0: 6.15, gBaja1: 6.75, gPrac0: 6.8, gPrac1: 7.7, guino: 7.72,
    carga0: 7.98, carga1: 8.32, golpeG: 8.46,
    lampara: 8.74, techo: 8.98, coco: 9.42, bolsa: 10.18,
    anda0: 10.55, anda1: 12.1, palma0: 12.12, palma1: 12.85,
    final: 12.95, fin: 13.6
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  function linea(guion, estados, ini, t) {
    let c = estados[ini];
    for (const [t0, t1, nom, f] of guion) { if (t <= t0) break; c = mezclaE(c, estados[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  }
  const parpadeo = (t, lista, d = 0.14) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const D = (pu, ix, re) => ({ pulgar: pu, indice: ix, medio: re, anular: re, menique: re });
  const mezclaD = (a, b, k) => ({ pulgar: lerp(a.pulgar, b.pulgar, k), indice: lerp(a.indice, b.indice, k), medio: lerp(a.medio, b.medio, k), anular: lerp(a.anular, b.anular, k), menique: lerp(a.menique, b.menique, k) });
  const PALMA = D(1, 1, 1), PUENTE = { pulgar: 0.85, indice: 0.9, medio: 0.95, anular: 0.95, menique: 0.88 }, PLANA = D(0.8, 0.9, 0.9);
  const PUENTE_DX = -30, PUENTE_DY = 14, MU_PUENTE = -2.75;   // mano de puente (marco de la hoja: +x es «hacia delante»)
  const dirA = a => ({ x: Math.cos(a), y: Math.sin(a) });
  const masP = (p, d, k) => ({ x: p.x + d.x * k, y: p.y + d.y * k });

  /* =====================================================================================
   * MESA (de perfil, vista un poco desde arriba): u a lo largo (0 izquierda → 1 derecha),
   * v en profundidad (0 banda cercana → 1 banda del fondo)
   * ===================================================================================== */
  const X0 = 292, X1 = 732, YN = 406, YF = 330, RB = 8;        // tapete y radio de bola
  const mesa = (u, v) => ({ x: X0 + (X1 - X0) * u, y: YN - (YN - YF) * v });
  const TRONERAS = { fi: { x: X0 + 2, y: YF + 2 }, fd: { x: X1 - 2, y: YF + 2 }, fc: { x: (X0 + X1) / 2, y: YF - 1 },
    ci: { x: X0 + 2, y: YN + 3 }, cd: { x: X1 - 2, y: YN + 3 }, cc: { x: (X0 + X1) / 2, y: YN + 4 } };

  /* ---------- bolas ---------- */
  const ROJA = mesa(0.52, 0.3), AMARILLA = mesa(0.2, 0.6);
  const FIJAS = [
    { c: "#d62828", o: "#7a0d0d", p: ROJA },
    { c: "#1f4fbf", o: "#0e2a6b", p: mesa(0.6, 0.12) },
    { c: "#2a8a3e", o: "#11451c", p: mesa(0.95, 0.86) },
    { c: "#151318", o: "#000000", p: mesa(0.37, 0.13), ocho: true },
    { c: "#f07f1d", o: "#8a4205", p: mesa(0.9, 0.12) },
    { c: "#7b2d8e", o: "#3c124a", p: mesa(0.3, 0.92) }
  ];
  // tiro de Ander: la blanca sale de S0, rodea la roja por el fondo y toca la amarilla de lado
  const S0 = mesa(0.82, 0.45);
  const DIR_TRONERA = (() => { const d = { x: TRONERAS.fi.x - AMARILLA.x, y: TRONERAS.fi.y - AMARILLA.y }, l = Math.hypot(d.x, d.y); return { x: d.x / l, y: d.y / l }; })();
  const CONTACTO = { x: AMARILLA.x - DIR_TRONERA.x * 2 * RB, y: AMARILLA.y - DIR_TRONERA.y * 2 * RB };
  // llega con un corte de 30°: la amarilla sale por la línea de centros y la blanca por la perpendicular (hacia la banda cercana)
  const DESVIO = { x: DIR_TRONERA.y, y: -DIR_TRONERA.x };       // abajo y algo a la izquierda
  const VIN = { x: DIR_TRONERA.x * 0.866 + DESVIO.x * 0.5, y: DIR_TRONERA.y * 0.866 + DESVIO.y * 0.5 };
  const BZ = [S0, { x: 600, y: 318 }, { x: CONTACTO.x - VIN.x * 70, y: CONTACTO.y - VIN.y * 70 }, CONTACTO];
  const bez = k => { const a = 1 - k; return { x: a * a * a * BZ[0].x + 3 * a * a * k * BZ[1].x + 3 * a * k * k * BZ[2].x + k * k * k * BZ[3].x,
    y: a * a * a * BZ[0].y + 3 * a * a * k * BZ[1].y + 3 * a * k * k * BZ[2].y + k * k * k * BZ[3].y }; };
  // tras el choque la blanca se desvía (perpendicular a la línea de centros) y se para delante de Guillermo
  const REPOSO = { x: CONTACTO.x + DESVIO.x * 22, y: CONTACTO.y + DESVIO.y * 22 };
  // vuelo del pelotazo de Guillermo: tramos parabólicos que pasan exactamente por cada choque
  const GRAV = 1900;
  const LAMPARA = { piv: { x: 512, y: 34 }, y0: 176, y1: 212, a0: 60, a1: 76 };
  const P_LAMP = { x: 458, y: 214 }, P_TECHO = { x: 418, y: 40 };
  let COCO = null;                                   // punto de la coronilla en el instante del coscorrón (se calcula de la postura)
  const COCO_RET = { x: 800, y: 290 };               // retrato: dónde le da (pelo)
  function parabola(p0, p1, t0, t1, t) {
    const d = t1 - t0, u = t - t0, vx = (p1.x - p0.x) / d, vy = (p1.y - p0.y - 0.5 * GRAV * d * d) / d;
    return { x: p0.x + vx * u, y: p0.y + vy * u + 0.5 * GRAV * u * u, vx, vy: vy + GRAV * u };
  }
  // estado de la blanca: { x, y, giro, en: "mesa"|"aire"|"cae", k (escala al caer) }
  function blanca(t) {
    if (t < T.golpeA) return { x: S0.x, y: S0.y, giro: 0, en: "mesa", k: 1 };
    if (t < T.choque) { const k = fase(t, T.golpeA, T.choque), kk = 1 - Math.pow(1 - k, 1.25); const p = bez(kk); return { x: p.x, y: p.y, giro: kk * 18, en: "mesa", k: 1 }; }
    if (t < T.golpeG) { const k = salida(fase(t, T.choque, T.para)); const p = mezcla(CONTACTO, REPOSO, k); return { x: p.x, y: p.y, giro: 18 + 2 * k, en: "mesa", k: 1 }; }
    const g0 = { x: REPOSO.x, y: REPOSO.y };
    if (t < T.lampara) { const p = parabola(g0, P_LAMP, T.golpeG, T.lampara, t); return { x: p.x, y: p.y, giro: 20 + (t - T.golpeG) * 30, en: "aire", k: 1 }; }
    if (t < T.techo) { const p = parabola(P_LAMP, P_TECHO, T.lampara, T.techo, t); return { x: p.x, y: p.y, giro: 28 - (t - T.lampara) * 25, en: "aire", k: 1 }; }
    if (!COCO) calculaCoco();
    if (t < T.coco) { const p = parabola(P_TECHO, COCO, T.techo, T.coco, t); return { x: p.x, y: p.y, giro: 22 + (t - T.techo) * 18, en: "aire", k: 1 }; }
    const fin = { x: TRONERAS.cc.x, y: TRONERAS.cc.y - 6 };
    if (t < T.bolsa) { const p = parabola(COCO, fin, T.coco, T.bolsa, t); return { x: p.x, y: p.y, giro: 30 + (t - T.coco) * 20, en: "aire", k: 1 }; }
    const k = fase(t, T.bolsa, T.bolsa + 0.14);
    if (k < 1) return { x: fin.x, y: fin.y + 6 * k, giro: 45, en: "cae", k: 1 - 0.75 * k };
    return null;
  }
  function amarilla(t) {
    if (t < T.choque) return { x: AMARILLA.x, y: AMARILLA.y, giro: 0, k: 1 };
    const k = fase(t, T.choque, T.cae), kk = 1 - Math.pow(1 - k, 1.6);
    const destino = { x: TRONERAS.fi.x + 3, y: TRONERAS.fi.y + 3 };
    if (k < 1) { const p = mezcla(AMARILLA, destino, kk); return { x: p.x, y: p.y, giro: kk * 9, k: 1 }; }
    const c = fase(t, T.cae, T.cae + 0.14);
    if (c < 1) return { x: destino.x, y: destino.y - 4 * c, giro: 9, k: 1 - 0.75 * c };
    return null;
  }

  /* =====================================================================================
   * TACOS: recta rígida (culata a → punta b). Las dos manos se colocan sobre ella.
   * ===================================================================================== */
  const LT = 262, S_AGARRE = 100;                  // largo del taco y dónde lo agarra la mano de atrás (desde la culata)
  const taco = (agarre, ang) => { const d = dirA(ang); return { a: masP(agarre, d, -S_AGARRE), b: masP(agarre, d, LT - S_AGARRE), d }; };
  const tacoPunta = (punta, ang) => { const d = dirA(ang); return { a: masP(punta, d, -LT), b: punta, d }; };
  const sobre = (tc, s) => masP(tc.a, tc.d, s);
  function mezclaTaco(t1, t2, k) {          // interpola por el agarre y el ángulo (no se deforma)
    const g1 = sobre(t1, S_AGARRE), g2 = sobre(t2, S_AGARRE);
    let a1 = Math.atan2(t1.d.y, t1.d.x), a2 = Math.atan2(t2.d.y, t2.d.x);
    a2 = a1 + Math.atan2(Math.sin(a2 - a1), Math.cos(a2 - a1));
    return taco(mezcla(g1, g2, k), lerp(a1, a2, k));
  }
  function dibTaco(g, tc, corta = 0) {
    const n = { x: -tc.d.y, y: tc.d.x }, L = LT - corta;
    const ancho = s => lerp(4.4, 2.0, s / LT);
    const tramoTaco = (s0, s1, col) => {
      const p0 = sobre(tc, s0), p1 = sobre(tc, Math.min(s1, L)); if (s0 >= L) return;
      const w0 = ancho(s0), w1 = ancho(Math.min(s1, L));
      g.beginPath(); g.moveTo(p0.x + n.x * w0, p0.y + n.y * w0); g.lineTo(p1.x + n.x * w1, p1.y + n.y * w1);
      g.lineTo(p1.x - n.x * w1, p1.y - n.y * w1); g.lineTo(p0.x - n.x * w0, p0.y - n.y * w0); g.closePath(); g.fillStyle = col; g.fill();
    };
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // silueta de tinta
    const fin = sobre(tc, L);
    g.strokeStyle = TINTA; g.lineWidth = 1;
    g.beginPath(); g.moveTo(tc.a.x + n.x * (ancho(0) + 1.4), tc.a.y + n.y * (ancho(0) + 1.4)); g.lineTo(fin.x + n.x * (ancho(L) + 1.4), fin.y + n.y * (ancho(L) + 1.4));
    g.lineTo(fin.x - n.x * (ancho(L) + 1.4), fin.y - n.y * (ancho(L) + 1.4)); g.lineTo(tc.a.x - n.x * (ancho(0) + 1.4), tc.a.y - n.y * (ancho(0) + 1.4)); g.closePath();
    g.fillStyle = TINTA; g.fill();
    tramoTaco(0, 8, "#1b1b1f");                    // contera de goma
    tramoTaco(8, 104, "#5a2412");                  // culata de palisandro
    tramoTaco(40, 46, "#e6d3a3"); tramoTaco(98, 104, "#e6d3a3");
    tramoTaco(104, LT - 9, "#e9c88a");             // flecha de arce
    tramoTaco(LT - 9, LT - 3, "#fbf8f0");          // virola
    tramoTaco(LT - 3, LT, "#3b6fd6");              // suela con tiza
    // brillo
    const b0 = sobre(tc, 14), b1 = sobre(tc, Math.min(L, LT - 14));
    g.strokeStyle = "rgba(255,255,255,0.45)"; g.lineWidth = 1.1; g.beginPath(); g.moveTo(b0.x - n.x * 1.6, b0.y - n.y * 1.6); g.lineTo(b1.x - n.x * 0.8, b1.y - n.y * 0.8); g.stroke();
    g.restore();
  }
  let CAM = null;                                  // matriz de cámara del fotograma (para dibujar el taco en el mundo desde la mano)

  /* =====================================================================================
   * CARAS (los dos usan los mismos campos; cd/ci cierran un solo ojo)
   * ===================================================================================== */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, mof: 0, esp: 0, sigue: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp, mirada) {
    const mx = lerp(e.mx, mirada ? mirada.x : e.mx, e.sigue), my = lerp(e.my, mirada ? mirada.y : e.my, e.sigue);
    return { mirada: { x: mx, y: my }, iris: e.iris, espiral: e.esp,
      ojos: { d: Math.max(e.c, e.cd, parp), i: Math.max(e.c, e.ci, parp), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  // mirada hacia un punto de pantalla (en el marco de la hoja, con el espejo)
  function miraA(P, p, ojo, q) {
    const c = P.aPantalla(p, P.cabeza(p).a(ojo)), dx = q.x - c.x, dy = q.y - c.y, l = Math.max(1, Math.hypot(dx, dy));
    return { x: clamp(dx / l * 1.15, -1, 1) * (p.espejo ? -1 : 1), y: clamp(dy / l * 1.15, -1, 1) };
  }
  // mano: mu para que la muñeca apunte hacia el hombro (marco de la hoja)
  const muHacia = (h, hombro, base = -1.75, k = 0.8) => Math.atan2(hombro.y - h.y, hombro.x - h.x) * k + base * (1 - k);

  /* ---------- pasos (x de pantalla de cada tobillo) ---------- */
  function pie(L, t) {
    let i = 0; while (i + 1 < L.length && t >= L[i + 1][0]) i++;
    const [t0, t1, x] = L[i], xa = i > 0 ? L[i - 1][2] : x, u = fase(t, t0, t1);
    const arco = Math.sin(Math.PI * u) * (L[i][3] ?? 1);
    return { x: lerp(xa, x, suave5(u)), alto: arco };
  }

  /* =====================================================================================
   * GUILLERMO (punta izquierda, mira a la derecha)
   * ===================================================================================== */
  const XG = 182;
  const CARAS_G = {
    inicio: E({ mx: 0.85, my: 0.15, orig: 0, sonr: 0.2 }),
    esceptico: E({ mx: 0.9, my: 0.2, sd: 16, gd: 0.14, si: -6, gi: -0.1, orig: 0, sonr: 0.32, ancho: 0.85 }),
    sigue: E({ sigue: 1, iris: 0.92, sd: 8, gd: 0.05, si: 8, gi: 0.05, orig: 0, abre: 6, ancho: 0.7, sonr: 0.05 }),
    pasmo: E({ sigue: 0.6, mx: 0.85, my: 0.4, iris: 0.78, sd: 24, gd: 0.18, si: 24, gi: 0.18, orig: 0, abre: 46, ancho: 0.7, sonr: -0.15, lengua: 0.3 }),
    camara: E({ mx: -0.85, my: -0.1, iris: 0.82, sd: 22, gd: 0.16, si: 22, gi: 0.16, orig: 0, abre: 30, ancho: 0.65, sonr: -0.1 }),
    picado: E({ mx: 0.9, my: 0.05, c: 0.3, sd: -10, gd: -0.22, si: 4, gi: 0.06, orig: 0, sonr: 0.55, ancho: 0.9 }),
    tiza: E({ mx: -0.4, my: 0.75, c: 0.15, sd: 10, gd: 0.06, si: 10, gi: 0.06, orig: 0, sonr: 0.6, abre: 6, ancho: 0.9 }),
    tos: E({ mx: 0, my: 0, c: 1, z: 1, sd: 6, gd: 0.1, si: 6, gi: 0.1, orig: 0, abre: 28, ancho: 0.95, sonr: -0.3, mof: 0.3 }),
    meneo: E({ mx: 0.9, my: 0.5, c: 0.2, h: 0.5, sd: 12, gd: 0.1, si: 12, gi: 0.1, orig: 0, sonr: 0.85, abre: 8, ancho: 1 }),
    apunta: E({ mx: 0.95, my: 0.55, cd: 1, z: 0.25, sd: -8, gd: -0.16, si: -4, gi: -0.08, orig: 0, abre: 9, ancho: 0.55, sonr: 0.05, lengua: 1 }),
    guino: E({ mx: -0.85, my: -0.1, cd: 1, h: 1, sd: 14, gd: 0.12, si: 16, gi: 0.12, orig: 0, sonr: 0.9, abre: 6, ancho: 1 }),
    carga: E({ mx: 0.95, my: 0.55, c: 0.4, z: 0.4, sd: -16, gd: -0.3, si: -16, gi: -0.3, orig: 0, abre: 12, ancho: 1.15, sonr: -0.5 }),
    golpe: E({ mx: 0.95, my: 0.4, c: 0.75, z: 0.6, sd: -10, gd: -0.25, si: -10, gi: -0.25, orig: 0, abre: 48, ancho: 1.25, sonr: -0.1, lengua: 0.3 }),
    arriba: E({ sigue: 1, iris: 0.82, sd: 24, gd: 0.18, si: 24, gi: 0.18, orig: 0, abre: 34, ancho: 0.62, sonr: -0.1, lengua: 0.2 }),
    coco: E({ mx: 0, my: 0, c: 1, z: 1, sd: 10, gd: 0.15, si: 10, gi: 0.15, orig: 0, abre: 26, ancho: 0.85, sonr: -0.4, lengua: 0.5 }),
    mareo: E({ mx: 0, my: 0, esp: 1, sd: 12, gd: 0.2, si: -6, gi: -0.1, orig: 0, abre: 16, ancho: 0.85, sonr: 0.15, lengua: 0.8 }),
    vuelve: E({ mx: 0.6, my: -0.3, esp: 0.35, c: 0.2, sd: 14, gd: 0.12, si: 6, gi: 0.04, orig: 0, abre: 8, ancho: 0.8, sonr: 0.1, lengua: 0.2 }),
    final: E({ mx: -0.85, my: -0.05, c: 0.25, h: 0.35, sd: 16, gd: -0.12, si: 16, gi: -0.12, orig: 0, sonr: 0.55, abre: 4, ancho: 0.95 })
  };
  const GUION_CARA_G = [
    [0.5, 0.75, "esceptico"], [T.golpeA - 0.05, T.golpeA + 0.15, "sigue"], [T.choque + 0.05, T.choque + 0.2, "pasmo"],
    [4.45, 4.7, "camara"], [5.0, 5.25, "picado"], [T.gTiza0 + 0.1, T.gTiza0 + 0.3, "tiza"], [T.nube + 0.05, T.nube + 0.15, "tos"],
    [5.95, 6.15, "picado"], [T.gBaja0 + 0.1, T.gBaja0 + 0.3, "meneo"], [T.gPrac0, T.gPrac0 + 0.2, "apunta"], [T.guino, T.guino + 0.12, "guino"],
    [T.carga0 - 0.04, T.carga0 + 0.12, "carga"], [T.golpeG - 0.05, T.golpeG + 0.02, "golpe"], [T.golpeG + 0.08, T.golpeG + 0.2, "arriba"],
    [T.coco, T.coco + 0.04, "coco"], [T.coco + 0.72, T.coco + 1.0, "mareo"], [T.palma0 + 0.25, T.palma1 - 0.05, "vuelve"], [T.final - 0.1, T.final + 0.25, "final"]
  ];
  // dx: pelvis (px de pantalla), pel: pelvis abajo (hoja), torso, cab (ángulo de la cabeza)
  const CUERPOS_G = {
    espera: { dx: 0, pel: 6, torso: 0.03, cab: 0.02 },
    pasmo: { dx: -4, pel: 2, torso: -0.06, cab: -0.04 },
    camara: { dx: -4, pel: 4, torso: -0.03, cab: 0.05 },
    tiza: { dx: 0, pel: 2, torso: -0.05, cab: -0.12 },
    tos: { dx: -6, pel: 18, torso: 0.18, cab: 0.16 },
    postura: { dx: 58, pel: 92, torso: 0.66, cab: 0.18 },
    carga: { dx: 50, pel: 96, torso: 0.6, cab: 0.16 },
    golpe: { dx: 68, pel: 86, torso: 0.72, cab: 0.22 },
    erguido: { dx: 40, pel: -4, torso: -0.14, cab: -0.32 },
    coco: { dx: 38, pel: 40, torso: 0.05, cab: 0.16 },
    mareo: { dx: 34, pel: 22, torso: -0.04, cab: 0.06 },
    final: { dx: 34, pel: 12, torso: -0.02, cab: 0.02 }
  };
  const GUION_CUERPO_G = [
    [T.choque, T.choque + 0.25, "pasmo"], [4.45, 4.7, "camara"], [T.gTiza0, T.gTiza0 + 0.3, "tiza"], [T.nube + 0.05, T.nube + 0.2, "tos"],
    [5.85, 6.1, "tiza"], [T.gBaja0, T.gBaja1, "postura"], [T.carga0, T.carga1, "carga"], [T.golpeG - 0.06, T.golpeG + 0.02, "golpe", salida],
    [T.golpeG + 0.06, T.golpeG + 0.32, "erguido"], [T.coco, T.coco + 0.06, "coco", salida], [T.coco + 0.12, T.coco + 0.5, "mareo"], [T.palma1, T.final + 0.2, "final"]
  ];
  const PARP_G = [0.3, 1.95, 4.15, 4.3, 7.15, 12.5];
  const PIES_G = {
    cerca: [[-9, -8, XG - 24], [T.gBaja0 + 0.05, T.gBaja0 + 0.3, XG - 6], [T.golpeG + 0.15, T.golpeG + 0.38, XG + 14], [T.coco + 0.25, T.coco + 0.5, XG - 10, 0.6],
      [T.coco + 0.75, T.coco + 1.0, XG + 18, 0.5]],
    lejos: [[-9, -8, XG + 22], [T.gBaja0 + 0.2, T.gBaja0 + 0.48, XG + 108], [T.golpeG + 0.05, T.golpeG + 0.3, XG + 70], [T.coco + 0.12, T.coco + 0.38, XG + 92, 0.6],
      [T.coco + 0.6, T.coco + 0.85, XG + 60, 0.5]]
  };
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const OJO_G = { x: 830, y: 590 };
  const SOBA = { x: 820, y: 360, mu: 0.95 };          // mano sobre la coronilla (retrato) y su orientación

  // backstroke de Guillermo (0 = la punta a ras de la bola)
  function retroceso(t, quien) {
    if (quien === "a") {
      let d = 6;
      d += 22 * campana(t, T.prac0, T.prac0 + 0.28) + 22 * campana(t, T.prac0 + 0.28, T.prac0 + 0.56);
      d += 26 * tramo(t, T.prac0 + 0.56, T.golpeA - 0.08) * (1 - tramo(t, T.golpeA - 0.08, T.golpeA, entrada));
      d -= 14 * tramo(t, T.golpeA - 0.02, T.golpeA + 0.1, salida) * (1 - tramo(t, T.golpeA + 0.5, T.golpeA + 0.9));
      return d;
    }
    let d = 8;
    const prac = tramo(t, T.gPrac0, T.gPrac0 + 0.12) * (1 - tramo(t, T.gPrac1 - 0.1, T.gPrac1 + 0.05));
    d += 18 * prac * (0.5 - 0.5 * Math.cos((t - T.gPrac0) * Math.PI * 2 * 5.4));
    d += 64 * tramo(t, T.carga0, T.carga1) * (1 - tramo(t, T.golpeG - 0.07, T.golpeG, entrada));
    d -= 26 * tramo(t, T.golpeG - 0.02, T.golpeG + 0.06, salida);
    return d;
  }

  function poseG(t, sinBola) {
    const b = linea(GUION_CUERPO_G, CUERPOS_G, "espera", t);
    const respira = Math.sin(t * 2.3);
    // meneo de cadera al colocarse
    const meneo = campana(t, T.gBaja0 + 0.25, T.gBaja1 + 0.1) * Math.sin((t - T.gBaja0) * 22);
    // tos en la nube de tiza
    const tos = campana(t, T.nube + 0.05, T.nube + 0.55) * Math.abs(Math.sin((t - T.nube) * 26));
    // coscorrón: aplastado, y luego tambaleo
    const zas = t >= T.coco ? Math.exp(-(t - T.coco) * 7) * suave(fase(t, T.coco, T.coco + 0.03)) : 0;
    const tamb = tramo(t, T.coco + 0.15, T.coco + 0.4) * (1 - tramo(t, T.palma0, T.palma1));
    const palm = palmadas(t);
    const p = {
      x: XG + b.dx + 7 * meneo, suelo: SUELO, s: S, tirasLimpias: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 + 6 * tos + 18 * zas + 8 * palm },
      torso: b.torso + 0.04 * meneo + 0.08 * tos + 0.07 * Math.sin((t - T.coco) * 5.2) * tamb - 0.03 * palm,
      torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab + 0.1 * Math.sin((t - T.coco) * 4.4 + 1) * tamb + 0.05 * tos, dx: 0, dy: 14 * zas, esc: { x: 1 + 0.12 * zas, y: 1 - 0.16 * zas } }
    };
    for (const lado of ["cerca", "lejos"]) {
      const f = pie(PIES_G[lado], t);
      p.piernas[lado] = { tob: { x: G.aHoja(p, { x: f.x, y: 0 }).x, y: TOB_G[lado] - 40 * f.alto }, ang: -0.18 * f.alto };
    }
    // cara (la mirada sigue a la blanca cuando toca)
    const e = linea(GUION_CARA_G, CARAS_G, "inicio", t);
    let mirada = null;
    if (!sinBola && e.sigue > 0.001) { const bb = blanca(t) || { x: TRONERAS.ci.x, y: TRONERAS.ci.y }; mirada = miraA(G, p, OJO_G, bb); }
    p.cara = cara(e, parpadeo(t, PARP_G), mirada);
    p.rojo = 0.45 * tramo(t, T.carga0, T.golpeG) * (1 - tramo(t, T.golpeG + 0.2, T.golpeG + 0.6)) + 0.35 * tramo(t, T.final, T.final + 0.3);
    p.cara.rubor = p.rojo;
    p.chichonEn = { x: COCO_RET.x - 20, y: COCO_RET.y + 40 };
    p.chichon = t > T.coco + 0.05 ? clamp(salida(fase(t, T.coco + 0.05, T.coco + 0.25)) * (1 + 0.15 * Math.sin(fase(t, T.coco + 0.05, T.coco + 0.5) * Math.PI))) : 0;
    p.sudor = 0.6 * tramo(t, T.carga0, T.carga1) * (1 - tramo(t, T.golpeG + 0.3, T.golpeG + 0.8));
    // --- taco y manos ---
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    const tc = tacoG(t, p);
    p._taco = tc;
    const enHoja = q => G.aHoja(p, q);
    // mano cercana: siempre en el agarre del taco
    const ag = enHoja(sobre(tc, S_AGARRE));
    const angTaco = Math.atan2(tc.d.y, tc.d.x);
    p.manoCerca = { x: ag.x, y: ag.y, ang: angTaco * 0.35, mu: muHacia(ag, hc), puno: 1, dobla: -1,
      objeto: g => { g.save(); g.setTransform(CAM); dibTaco(g, p._taco, tizaCorta(t, "g")); g.restore(); } };
    // mano lejana: bolsillo → tiza en la punta → puente en el tapete → suelta
    const bols = { x: G.PELVIS.x + 122, y: 640 };
    let l = { x: Tr(bols).x, y: Tr(bols).y, ang: 0, mu: -1.75, puno: 0, dobla: -1 };
    const kTiza = tramo(t, T.gTiza0 - 0.05, T.gTiza0 + 0.3) * (1 - tramo(t, 5.85, 6.12));
    if (kTiza > 0) {
      const twist = Math.sin((t - T.gTiza0) * 26) * campana(t, T.gTiza0 + 0.2, T.gTiza1 - 0.15);
      const punta = enHoja(tc.b);
      const q = { x: punta.x + 16 + 10 * twist, y: punta.y + 46 };
      l = { x: lerp(l.x, q.x, kTiza), y: lerp(l.y, q.y, kTiza), ang: lerp(0, 0.35 * twist, kTiza), mu: lerp(-1.75, muHacia(q, hl), kTiza), puno: kTiza, dobla: -1,
        objeto: g => tiza(g, kTiza) };
    }
    const kPuente = tramo(t, T.gBaja0 + 0.1, T.gBaja1) * (1 - tramo(t, T.golpeG + 0.05, T.golpeG + 0.3));
    if (kPuente > 0) {
      const pu = enHoja(puenteG());
      const q = { x: pu.x + PUENTE_DX, y: pu.y + PUENTE_DY };
      l = { x: lerp(l.x, q.x, kPuente), y: lerp(l.y, q.y, kPuente), ang: 0, mu: lerp(l.mu, MU_PUENTE, kPuente), puno: Math.max(l.puno, kPuente), dobla: -1,
        dedos: mezclaD(D(0, 0, 0), PUENTE, kPuente) };
    }
    // tras el golpe: la mano se levanta del susto («¡uy!»), luego se soba el chichón y al final vuelve al bolsillo
    const kSusto = tramo(t, T.golpeG + 0.04, T.golpeG + 0.24) * (1 - tramo(t, T.coco + 0.05, T.coco + 0.3));
    if (kSusto > 0) {
      const q = Tr({ x: 470, y: 470 });
      l = { x: lerp(l.x, q.x, kSusto), y: lerp(l.y, q.y, kSusto), ang: 0, mu: lerp(l.mu, -0.9, kSusto), puno: Math.max(l.puno * (1 - kSusto), kSusto), dobla: -1,
        dedos: mezclaD(l.dedos || D(0, 0, 0), PALMA, kSusto) };
    }
    const kSoba = tramo(t, T.coco + 0.08, T.coco + 0.3) * (1 - tramo(t, T.coco + 0.62, T.coco + 0.92));
    if (kSoba > 0) {
      const roza = Math.sin((t - T.coco) * 15) * tramo(t, T.coco + 0.3, T.coco + 0.5);
      const c = G.cabeza(p).a({ x: SOBA.x + 30 * roza, y: SOBA.y + 8 * roza });
      const q = enHoja(G.aPantalla(p, c));
      l = { x: lerp(l.x, q.x, kSoba), y: lerp(l.y, q.y, kSoba), ang: 0, mu: lerp(l.mu, SOBA.mu, kSoba), puno: Math.max(l.puno * (1 - kSoba), kSoba), dobla: -1,
        dedos: mezclaD(l.dedos || D(0, 0, 0), PLANA, kSoba) };
    }
    const kBols = tramo(t, T.coco + 0.62, T.coco + 0.95);
    if (kBols > 0) {
      const q = Tr(bols);
      l = { x: lerp(l.x, q.x, kBols), y: lerp(l.y, q.y, kBols), ang: 0, mu: lerp(l.mu, -1.75, kBols), puno: l.puno * (1 - kBols), dobla: -1, dedos: l.dedos };
    }
    p.manoLejos = l;
    return p;
  }
  // geometría del taco de Guillermo en cada fase
  const BOLA_G = () => REPOSO;
  const ANG_G = 0.13;
  function puenteG() { const d = dirA(ANG_G); return masP(BOLA_G(), d, -(RB + 50)); }
  function tacoG(t, p) {
    const pel = G.aPantalla(p, G.tronco(p)(G.PELVIS));
    // de pie: culata en el suelo, a su izquierda
    const dePie = (() => { const ag = { x: pel.x - 66, y: SUELO - S_AGARRE + 6 }; return taco(ag, -Math.PI / 2 + 0.05); })();
    // tiza: levanta un poco el taco hacia el pecho
    const tz = (() => { const ag = { x: pel.x - 60, y: SUELO - S_AGARRE - 30 }; return taco(ag, -Math.PI / 2 + 0.1); })();
    const kTz = tramo(t, T.gTiza0 - 0.1, T.gTiza0 + 0.2) * (1 - tramo(t, 5.85, 6.15));
    let tc = mezclaTaco(dePie, tz, kTz);
    // apuntando: la punta a ras de la bola menos el retroceso
    const d = dirA(ANG_G), apunta = tacoPunta(masP(BOLA_G(), d, -(RB + 1.5 + retroceso(t, "g"))), ANG_G);
    const kAp = tramo(t, T.gBaja0, T.gBaja1 - 0.05);
    if (kAp > 0) tc = mezclaTaco(tc, apunta, kAp);
    // tras el golpe: lo deja caer como un bastón, la punta al suelo delante
    const kBaston = tramo(t, T.golpeG + 0.08, T.golpeG + 0.45);
    if (kBaston > 0) {
      const ag = { x: pel.x - 34, y: pel.y + 30 };
      const balanceo = 0.08 * Math.sin((t - T.coco) * 4.4) * tramo(t, T.coco + 0.15, T.coco + 0.4) * (1 - tramo(t, T.palma0, T.palma1));
      tc = mezclaTaco(tc, taco(ag, 1.08 + balanceo), kBaston);
    }
    return tc;
  }

  /* =====================================================================================
   * ANDER (punta derecha, en espejo: mira a la izquierda)
   * ===================================================================================== */
  const XA = 842, XP = 410;                        // posición de tiro y de las palmaditas (detrás de la mesa)
  const CARAS_A = {
    inicio: E({ mx: 0.4, my: -0.5, c: 0.3, orig: 0, sonr: 0.25 }),
    tiza: E({ mx: -0.4, my: 0.75, c: 0.35, sd: 6, gd: 0.04, si: 6, gi: 0.04, orig: 0, sonr: 0.3, ancho: 0.9 }),
    sopla: E({ mx: -0.4, my: 0.75, c: 0.45, sd: 8, gd: 0.04, si: 8, gi: 0.04, orig: 0, abre: 7, ancho: 0.4, sonr: 0 }),
    camara: E({ mx: -0.85, my: -0.05, c: 0.3, sd: 4, gd: 0.02, si: 18, gi: 0.14, orig: 0, sonr: 0.45, ancho: 0.9 }),
    apunta: E({ mx: 0.95, my: 0.55, c: 0.5, sd: -4, gd: -0.06, si: -4, gi: -0.06, orig: 0, sonr: 0.2, ancho: 0.85 }),
    sigue: E({ sigue: 1, c: 0.25, sd: 6, gd: 0.04, si: 8, gi: 0.06, orig: 0, sonr: 0.35, ancho: 0.9 }),
    orgullo: E({ mx: -0.85, my: -0.1, c: 0.35, h: 0.4, sd: 6, gd: 0.04, si: 16, gi: 0.12, orig: 0, sonr: 0.7, ancho: 0.95 }),
    turno: E({ mx: 0.9, my: 0.1, c: 0.25, sd: 8, gd: 0.04, si: 10, gi: 0.06, orig: 0, sonr: 0.55, ancho: 0.95 }),
    ceja: E({ mx: 0.9, my: -0.05, c: 0.28, sd: 2, gd: 0.02, si: 20, gi: 0.16, orig: 0, sonr: 0.2, ancho: 0.9 }),
    aburrido: E({ mx: -0.85, my: 0, c: 0.55, sd: 0, gd: 0, si: 6, gi: 0.04, orig: 0, sonr: 0.0, ancho: 0.75 }),
    sigueB: E({ sigue: 1, iris: 0.9, c: 0.1, sd: 14, gd: 0.08, si: 16, gi: 0.1, orig: 0, abre: 5, ancho: 0.7, sonr: 0.05 }),
    mueca: E({ mx: 0.9, my: -0.2, c: 0.8, z: 0.8, sd: 8, gd: 0.1, si: 8, gi: 0.1, orig: 0, abre: 12, ancho: 1.2, sonr: -0.35 }),
    lastima: E({ mx: 0.9, my: 0.2, c: 0.3, sd: 12, gd: -0.16, si: 12, gi: -0.16, orig: 0, sonr: 0.35, ancho: 0.9 }),
    guino: E({ mx: -0.85, my: -0.05, cd: 1, h: 1, sd: 6, gd: 0.04, si: 16, gi: 0.12, orig: 0, sonr: 0.65, ancho: 0.95 })
  };
  const GUION_CARA_A = [
    [T.tiza0 - 0.1, T.tiza0 + 0.1, "tiza"], [T.sopla0, T.sopla0 + 0.08, "sopla"], [T.sopla1 - 0.02, T.sopla1 + 0.12, "camara"],
    [T.baja0 + 0.1, T.baja1, "apunta"], [T.golpeA + 0.02, T.golpeA + 0.15, "sigue"], [T.cae + 0.1, T.cae + 0.3, "orgullo"],
    [T.turno0, T.turno0 + 0.2, "turno"], [T.nube + 0.1, T.nube + 0.3, "ceja"], [7.05, 7.25, "aburrido"], [T.golpeG, T.golpeG + 0.12, "sigueB"],
    [T.coco - 0.02, T.coco + 0.06, "mueca"], [T.coco + 0.5, T.coco + 0.8, "lastima"], [T.final, T.final + 0.2, "guino"]
  ];
  const CUERPOS_A = {
    relax: { dx: 0, pel: 6, torso: 0.02, cab: 0.02 },
    tiza: { dx: 0, pel: 4, torso: -0.03, cab: -0.1 },
    postura: { dx: -46, pel: 86, torso: 0.62, cab: 0.16 },
    golpe: { dx: -50, pel: 86, torso: 0.64, cab: 0.18 },
    orgullo: { dx: -6, pel: 0, torso: -0.06, cab: -0.04 },
    turno: { dx: -10, pel: 8, torso: 0.15, cab: 0.08 },
    apoyado: { dx: -4, pel: 10, torso: 0.07, cab: 0.06 },
    sigue: { dx: -4, pel: 4, torso: -0.06, cab: -0.22 },
    mueca: { dx: 0, pel: 14, torso: -0.1, cab: -0.04 },
    lastima: { dx: -4, pel: 8, torso: 0.04, cab: 0.06 },
    palma: { dx: 0, pel: 10, torso: 0.18, cab: 0.1 }
  };
  const GUION_CUERPO_A = [
    [T.tiza0, T.tiza0 + 0.25, "tiza"], [T.baja0, T.baja1, "postura"], [T.golpeA - 0.05, T.golpeA + 0.05, "golpe", salida],
    [T.sube0, T.sube1, "orgullo"], [T.turno0, T.turno0 + 0.3, "turno"], [T.turno1, T.turno1 + 0.4, "apoyado"],
    [T.golpeG + 0.02, T.golpeG + 0.2, "sigue"], [T.coco - 0.02, T.coco + 0.1, "mueca"], [T.coco + 0.4, T.coco + 0.8, "lastima"],
    [T.palma0 - 0.2, T.palma0 + 0.1, "palma"], [T.palma1, T.final + 0.2, "relax"]
  ];
  const PARP_A = [1.2, 2.25, 4.0, 6.6, 8.2, 10.3, 11.6, 12.5];
  const TOB_A = { cerca: A.SUELO - A.TOBILLO_ALTO, lejos: A.SUELO - A.TOBILLO_ALTO - 12 };
  const OJO_A = { x: 880, y: 533 };
  // paseo por detrás de la mesa: la pelvis va de XA a XP y los pies dan pasos alternos
  const xAnder = t => lerp(XA, XP, suave(fase(t, T.anda0, T.anda1)));
  const PIES_A = (() => {
    const L = { cerca: [[-9, -8, XA + 30]], lejos: [[-9, -8, XA - 34]] };
    L.lejos.push([T.baja0 + 0.05, T.baja0 + 0.35, XA - 96]);           // da un paso hacia la mesa al inclinarse
    L.lejos.push([T.sube0 + 0.05, T.sube0 + 0.35, XA - 34]);
    const n = 7, dt = (T.anda1 - T.anda0) / n;
    for (let k = 0; k < n; k++) {
      const lado = k % 2 ? "cerca" : "lejos", t0 = T.anda0 + k * dt, t1 = t0 + dt * 1.05;
      const xp = xAnder(t1), ultimo = k >= n - 2;
      L[lado].push([t0, t1, ultimo ? xp + (lado === "lejos" ? -34 : 30) : xp - 36]);
    }
    return L;
  })();
  const ANG_A = Math.PI - 0.16;                   // apunta hacia la izquierda, la punta algo más baja

  function poseA(t, pg) {
    const b = linea(GUION_CUERPO_A, CUERPOS_A, "relax", t);
    const respira = Math.sin(t * 2.1 + 1);
    const anda = tramo(t, T.anda0, T.anda0 + 0.2) * (1 - tramo(t, T.anda1 - 0.2, T.anda1));
    const bote = Math.abs(Math.sin((t - T.anda0) / ((T.anda1 - T.anda0) / 7) * Math.PI)) * anda;
    const p = {
      x: xAnder(t) + b.dx * (1 - tramo(t, T.anda0, T.anda1)), suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: A.PELVIS.x, y: A.PELVIS.y + b.pel + respira * 1.1 - 10 * bote }, torso: b.torso + 0.04 * anda,
      torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {}, cabeza: { ang: b.cab + 0.02 * Math.sin(t * 1.1), dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    const respingo = t >= T.coco ? Math.exp(-(t - T.coco) * 6) * suave(fase(t, T.coco, T.coco + 0.05)) : 0;
    p.pelvis.y += 10 * respingo;
    for (const lado of ["cerca", "lejos"]) {
      const f = pie(PIES_A[lado], t);
      p.piernas[lado] = { tob: { x: A.aHoja(p, { x: f.x, y: 0 }).x, y: TOB_A[lado] - 38 * f.alto }, ang: -0.18 * f.alto };
    }
    const e = linea(GUION_CARA_A, CARAS_A, "inicio", t);
    let mirada = null;
    if (e.sigue > 0.001) { const bb = blanca(t) || amarilla(t) || { x: TRONERAS.ci.x, y: TRONERAS.ci.y }; mirada = miraA(A, p, OJO_A, bb); }
    p.cara = cara(e, parpadeo(t, PARP_A), mirada);
    // --- taco y manos ---
    const Tr = A.tronco(p), hc = Tr(A.HOMBRO_C), hl = Tr(A.HOMBRO);
    const enHoja = q => A.aHoja(p, q);
    const tc = tacoA(t, p);
    p._taco = tc;
    const ag = enHoja(sobre(tc, S_AGARRE));
    p.manoCerca = { x: ag.x, y: ag.y, ang: 0, mu: muHacia(ag, hc), puno: 1, dobla: -1,
      objeto: g => { g.save(); g.setTransform(CAM); dibTaco(g, p._taco, tizaCorta(t, "a")); g.restore(); } };
    // lejana: bolsillo → tiza → puente → «tu turno» → bolsillo → palmaditas
    const bols = A.BOLSILLO_L;
    let l = { x: Tr(bols).x, y: Tr(bols).y, ang: 0, mu: -1.75, puno: 0, dobla: 1 };
    const kTiza = tramo(t, T.tiza0 - 0.1, T.tiza0 + 0.2) * (1 - tramo(t, T.tiza1 - 0.05, T.sopla0 + 0.15));
    if (kTiza > 0) {
      const twist = Math.sin((t - T.tiza0) * 16) * campana(t, T.tiza0 + 0.15, T.tiza1 - 0.1);
      const punta = enHoja(tc.b);
      const q = { x: punta.x + 16 + 8 * twist, y: punta.y + 46 };
      l = { x: lerp(l.x, q.x, kTiza), y: lerp(l.y, q.y, kTiza), ang: lerp(0, 0.3 * twist, kTiza), mu: lerp(-1.75, muHacia(q, hl), kTiza), puno: kTiza, dobla: 1,
        objeto: g => tiza(g, kTiza) };
    }
    const kPuente = tramo(t, T.baja0 + 0.15, T.baja1) * (1 - tramo(t, T.sube0, T.sube0 + 0.3));
    if (kPuente > 0) {
      const pu = enHoja(puenteA());
      const q = { x: pu.x + PUENTE_DX, y: pu.y + PUENTE_DY };
      l = { x: lerp(l.x, q.x, kPuente), y: lerp(l.y, q.y, kPuente), ang: 0, mu: lerp(l.mu, MU_PUENTE, kPuente), puno: Math.max(l.puno, kPuente), dobla: 1,
        dedos: mezclaD(D(0, 0, 0), PUENTE, kPuente) };
    }
    const kTurno = tramo(t, T.turno0, T.turno0 + 0.3) * (1 - tramo(t, T.turno1, T.turno1 + 0.35));
    if (kTurno > 0) {
      const q = Tr({ x: 575, y: 445 });
      l = { x: lerp(l.x, q.x, kTurno), y: lerp(l.y, q.y, kTurno), ang: 0, mu: lerp(l.mu, 2.84, kTurno), puno: Math.max(l.puno, kTurno), dobla: 1,
        dedos: mezclaD(l.dedos || D(0, 0, 0), PALMA, kTurno) };
    }
    // palmaditas en el hombro de Guillermo
    const kPalma = tramo(t, T.palma0 - 0.25, T.palma0 + 0.05) * (1 - tramo(t, T.palma1 - 0.05, T.palma1 + 0.3));
    if (kPalma > 0 && pg) {
      const hom = G.aPantalla(pg, G.tronco(pg)({ x: G.HOMBRO.x - 26, y: G.HOMBRO.y + 14 }));
      const q = enHoja({ x: hom.x + 12, y: hom.y - 8 - 14 * palmadas(t, true) });
      l = { x: lerp(l.x, q.x, kPalma), y: lerp(l.y, q.y, kPalma), ang: 0, mu: lerp(l.mu, -2.55, kPalma), puno: Math.max(l.puno, kPalma), dobla: 1,
        dedos: mezclaD(l.dedos || D(0, 0, 0), PLANA, kPalma) };
      p._palma = kPalma;
    }
    p.manoLejos = l;
    return p;
  }
  function puenteA() { const d = dirA(ANG_A); return masP(S0, d, -(RB + 48)); }
  function tacoA(t, p) {
    const pel = A.aPantalla(p, A.tronco(p)(A.PELVIS));
    const dePie = (lev = 0) => { const ag = { x: pel.x + 64, y: SUELO - S_AGARRE + 6 - lev }; return taco(ag, -Math.PI / 2 - 0.05); };
    const tz = (() => { const ag = { x: pel.x + 58, y: SUELO - S_AGARRE - 30 }; return taco(ag, -Math.PI / 2 - 0.1); })();
    let tc = mezclaTaco(dePie(), tz, tramo(t, T.tiza0 - 0.15, T.tiza0 + 0.15) * (1 - tramo(t, T.sopla1, T.baja0 + 0.1)));
    const d = dirA(ANG_A), apunta = tacoPunta(masP(S0, d, -(RB + 1.5 + retroceso(t, "a"))), ANG_A);
    const kAp = tramo(t, T.baja0, T.baja1 - 0.05) * (1 - tramo(t, T.sube0, T.sube1));
    if (kAp > 0) tc = mezclaTaco(tc, apunta, kAp);
    // al andar lo lleva como un bastón, algo levantado
    const kAnda = tramo(t, T.anda0, T.anda0 + 0.2) * (1 - tramo(t, T.anda1 - 0.15, T.anda1 + 0.05));
    if (kAnda > 0) tc = mezclaTaco(tc, dePie(10 + 6 * Math.abs(Math.sin((t - T.anda0) * 6))), kAnda);
    return tc;
  }
  // la mano de la tiza tapa la punta: el taco se dibuja recortado para que la tiza quede encima
  function tizaCorta(t, quien) {
    const k = quien === "a" ? tramo(t, T.tiza0 - 0.05, T.tiza0 + 0.2) * (1 - tramo(t, T.tiza1 - 0.05, T.tiza1 + 0.1))
      : tramo(t, T.gTiza0, T.gTiza0 + 0.25) * (1 - tramo(t, 5.8, 5.95));
    return 10 * k;
  }
  // dos palmaditas: 0..1 (la mano baja) para Ander, y el hombro de Guillermo cede un poco
  function palmadas(t, mano) {
    let v = 0;
    for (const t0 of [T.palma0 + 0.1, T.palma0 + 0.42]) v = Math.max(v, campana(t, t0, t0 + 0.26));
    return mano ? 1 - v : campana(t, T.palma0 + 0.18, T.palma0 + 0.32) + campana(t, T.palma0 + 0.5, T.palma0 + 0.64);
  }
  function calculaCoco() {
    const pg = poseG(T.coco, true);
    COCO = G.aPantalla(pg, G.cabeza(pg).a(COCO_RET));
  }
  const pose = t => { const g = poseG(t); return { g, a: poseA(t, g) }; };

  /* ---------- tiza (unidades de mano) ---------- */
  function tiza(g, k) {
    if (k < 0.05) return;
    g.save(); g.globalAlpha *= clamp(k * 2);
    g.translate(0, -17); g.lineJoin = "round";
    g.fillStyle = "#3b6fd6"; g.strokeStyle = TINTA; g.lineWidth = 1.6;
    g.beginPath(); g.rect(-7, -7, 14, 14); g.fill(); g.stroke();
    g.fillStyle = "#7da2ee"; g.beginPath(); g.moveTo(-7, -7); g.lineTo(-3, -10); g.lineTo(10, -10); g.lineTo(7, -7); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#24499c"; g.beginPath(); g.moveTo(7, -7); g.lineTo(10, -10); g.lineTo(10, 4); g.lineTo(7, 7); g.closePath(); g.fill(); g.stroke();
    g.restore();
  }

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  let fondo = null, frente = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 120; const g = c.getContext("2d");
    g.translate(60, 60); g.lineJoin = "round"; g.lineCap = "round";
    // pared granate con papel adamascado
    const pared = g.createLinearGradient(0, 0, 0, 470); pared.addColorStop(0, "#3b0e14"); pared.addColorStop(0.55, "#5e1820"); pared.addColorStop(1, "#4a1219");
    g.fillStyle = pared; g.fillRect(-60, -60, W + 120, 540);
    g.fillStyle = "rgba(255,210,170,0.05)";
    for (let y = 60; y < 360; y += 34) for (let x = -40 + ((y / 34) % 2) * 26; x < W + 60; x += 52) {
      g.beginPath(); g.moveTo(x, y - 9); g.lineTo(x + 7, y); g.lineTo(x, y + 9); g.lineTo(x - 7, y); g.closePath(); g.fill(); }
    // luz cálida de la lámpara sobre la pared
    const foco = g.createRadialGradient(512, 260, 30, 512, 260, 520); foco.addColorStop(0, "rgba(255,196,120,0.32)"); foco.addColorStop(0.6, "rgba(255,170,90,0.08)"); foco.addColorStop(1, "rgba(255,170,90,0)");
    g.fillStyle = foco; g.fillRect(-60, -60, W + 120, 540);
    // techo de vigas
    g.fillStyle = "#2a1610"; g.fillRect(-60, -60, W + 120, 94);
    g.fillStyle = "#3d2117"; for (let x = -40; x < W + 60; x += 120) g.fillRect(x, -60, 70, 94);
    g.fillStyle = "#1a0d09"; g.fillRect(-60, 30, W + 120, 6);
    g.fillStyle = "rgba(255,200,140,0.12)"; g.fillRect(-60, 28, W + 120, 2);
    // zócalo de madera
    const zoc = g.createLinearGradient(0, 360, 0, 470); zoc.addColorStop(0, "#4a2614"); zoc.addColorStop(1, "#2c160b");
    g.fillStyle = zoc; g.fillRect(-60, 360, W + 120, 110);
    g.fillStyle = "#6e3c1f"; g.fillRect(-60, 354, W + 120, 10); g.fillStyle = "#8c5230"; g.fillRect(-60, 354, W + 120, 3);
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 2;
    for (let x = -30; x < W + 60; x += 96) { g.strokeRect(x, 376, 76, 80); }
    // suelo de tablones
    const su = g.createLinearGradient(0, 470, 0, H + 60); su.addColorStop(0, "#3a2214"); su.addColorStop(1, "#1d0f08");
    g.fillStyle = su; g.fillRect(-60, 470, W + 120, H + 60 - 470);
    g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) { const y = 478 + i * i * 4 + i * 12; g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    for (let x = -60; x < W + 80; x += 70) { g.beginPath(); g.moveTo(x, 470); g.lineTo(x + (x - 512) * 0.35, H + 60); g.stroke(); }
    // alfombra bajo la mesa
    g.fillStyle = "#3a1b33"; g.beginPath(); g.ellipse(512, 548, 330, 34, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#c79a3a"; g.lineWidth = 3; g.beginPath(); g.ellipse(512, 548, 314, 28, 0, 0, Math.PI * 2); g.stroke();
    // taquero en la pared (izquierda)
    g.fillStyle = "#5a301a"; g.strokeStyle = TINTA; g.lineWidth = 2.5;
    g.fillRect(28, 108, 92, 12); g.strokeRect(28, 108, 92, 12); g.fillRect(28, 316, 92, 14); g.strokeRect(28, 316, 92, 14);
    for (let i = 0; i < 4; i++) { const x = 40 + i * 22; dibTaco(g, tacoPunta({ x: x + 1, y: 92 }, -Math.PI / 2 + 0.01)); }
    // cuadro con el triángulo de bolas
    g.fillStyle = "#6b4220"; g.fillRect(250, 88, 104, 92); g.strokeStyle = TINTA; g.lineWidth = 3; g.strokeRect(250, 88, 104, 92);
    g.fillStyle = "#1d5a3a"; g.fillRect(260, 98, 84, 72); g.lineWidth = 1.5; g.strokeRect(260, 98, 84, 72);
    const colTri = ["#f4c20d", "#1f4fbf", "#d62828", "#7b2d8e", "#f07f1d", "#2a8a3e", "#8a1c1c", "#151318", "#f4c20d", "#1f4fbf"];
    let n = 0;
    for (let fila = 0; fila < 4; fila++) for (let j = 0; j <= fila; j++) {
      const x = 302 + (j - fila / 2) * 13, y = 112 + fila * 12; g.fillStyle = colTri[n++ % colTri.length];
      g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.2; g.strokeStyle = TINTA; g.stroke(); }
    g.strokeStyle = "#c9a14a"; g.lineWidth = 2; g.beginPath(); g.moveTo(302, 102); g.lineTo(279, 152); g.lineTo(325, 152); g.closePath(); g.stroke();
    // marcador de bolas (ábaco) a la derecha
    g.fillStyle = "#5a301a"; g.fillRect(640, 84, 150, 54); g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(640, 84, 150, 54);
    for (let fila = 0; fila < 2; fila++) {
      const y = 100 + fila * 22; g.strokeStyle = "#c9a14a"; g.lineWidth = 2; g.beginPath(); g.moveTo(646, y); g.lineTo(784, y); g.stroke();
      for (let i = 0; i < 9; i++) { const x = (i < (fila ? 3 : 5) ? 652 + i * 12 : 690 + i * 10); g.fillStyle = fila ? "#e8d9b8" : "#c0392b";
        g.beginPath(); g.ellipse(x, y, 5, 6, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.2; g.strokeStyle = TINTA; g.stroke(); } }
    // apliques de pared
    for (const x of [176, 916]) {
      const halo = g.createRadialGradient(x, 230, 4, x, 230, 90); halo.addColorStop(0, "rgba(255,206,130,0.5)"); halo.addColorStop(1, "rgba(255,190,110,0)");
      g.fillStyle = halo; g.beginPath(); g.arc(x, 230, 90, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#c9a14a"; g.strokeStyle = TINTA; g.lineWidth = 2; g.fillRect(x - 4, 236, 8, 20); g.strokeRect(x - 4, 236, 8, 20);
      g.fillStyle = "#ffe0a6"; g.beginPath(); g.moveTo(x - 16, 236); g.lineTo(x - 10, 214); g.lineTo(x + 10, 214); g.lineTo(x + 16, 236); g.closePath(); g.fill(); g.stroke();
    }
    // mesa (parte de atrás): banda del fondo, bandas laterales, tapete y troneras del fondo
    mesaAtras(g);
    // viñeta
    const v = g.createRadialGradient(512, 300, 300, 512, 300, 700); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.5)");
    g.fillStyle = v; g.fillRect(-60, -60, W + 120, H + 120);
    return c;
  }
  const MADERA = "#6b3417", MADERA_C = "#8f4b24", MADERA_O = "#3e1c0b", TAPETE = "#1f7a4a", TAPETE_O = "#14583a";
  function tronera(g, q, rx, ry) {
    g.fillStyle = "#2b1a10"; g.beginPath(); g.ellipse(q.x, q.y, rx + 4, ry + 3, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#050405"; g.beginPath(); g.ellipse(q.x, q.y, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.6; g.beginPath(); g.ellipse(q.x, q.y, rx + 4, ry + 3, 0, 0, Math.PI * 2); g.stroke();
  }
  function mesaAtras(g) {
    g.save(); g.lineJoin = "round";
    // banda del fondo
    g.fillStyle = MADERA; g.beginPath(); g.moveTo(X0 - 22, YF - 18); g.lineTo(X1 + 22, YF - 18); g.lineTo(X1 + 22, YF); g.lineTo(X0 - 22, YF); g.closePath(); g.fill();
    g.fillStyle = MADERA_C; g.fillRect(X0 - 22, YF - 18, X1 - X0 + 44, 4);
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(X0 - 22, YF - 18, X1 - X0 + 44, 18);
    // bandas laterales (cortas)
    g.fillStyle = MADERA; g.fillRect(X0 - 22, YF, 22, YN - YF); g.fillRect(X1, YF, 22, YN - YF);
    g.strokeRect(X0 - 22, YF, 22, YN - YF); g.strokeRect(X1, YF, 22, YN - YF);
    // tapete con un poco de degradado y la goma de las bandas
    const tp = g.createLinearGradient(0, YF, 0, YN); tp.addColorStop(0, TAPETE_O); tp.addColorStop(1, TAPETE);
    g.fillStyle = tp; g.fillRect(X0, YF, X1 - X0, YN - YF);
    g.fillStyle = "rgba(0,0,0,0.22)"; g.fillRect(X0, YF, X1 - X0, 6); g.fillRect(X0, YF, 6, YN - YF); g.fillRect(X1 - 6, YF, 6, YN - YF);
    // punto de saque y línea de cabeza
    g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(X0 + (X1 - X0) * 0.25, YF + 4); g.lineTo(X0 + (X1 - X0) * 0.25, YN - 2); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.3)"; g.beginPath(); g.ellipse(X0 + (X1 - X0) * 0.75, (YF + YN) / 2, 2.5, 1.5, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(X0, YF, X1 - X0, YN - YF);
    // rombos de nácar en la banda del fondo
    g.fillStyle = "#f3ead6"; for (let i = 1; i < 8; i++) { if (i === 4) continue; const x = X0 + (X1 - X0) * i / 8; g.beginPath(); g.moveTo(x, YF - 12); g.lineTo(x + 3, YF - 9); g.lineTo(x, YF - 6); g.lineTo(x - 3, YF - 9); g.closePath(); g.fill(); }
    tronera(g, TRONERAS.fi, 9, 5); tronera(g, TRONERAS.fd, 9, 5); tronera(g, TRONERAS.fc, 8, 4);
    g.restore();
  }
  function creaFrente() {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    g.lineJoin = "round"; g.lineCap = "round";
    // banda cercana (cara de arriba y canto)
    g.fillStyle = MADERA; g.fillRect(X0 - 22, YN, X1 - X0 + 44, 16);
    g.fillStyle = MADERA_C; g.fillRect(X0 - 22, YN, X1 - X0 + 44, 4);
    g.fillStyle = MADERA_O; g.fillRect(X0 - 22, YN + 16, X1 - X0 + 44, 14);
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.strokeRect(X0 - 22, YN, X1 - X0 + 44, 30);
    g.fillStyle = "#f3ead6"; for (let i = 1; i < 8; i++) { if (i === 4) continue; const x = X0 + (X1 - X0) * i / 8; g.beginPath(); g.moveTo(x, YN + 5); g.lineTo(x + 3, YN + 8); g.lineTo(x, YN + 11); g.lineTo(x - 3, YN + 8); g.closePath(); g.fill(); }
    // faldón con paneles y patas torneadas
    const fal = g.createLinearGradient(0, YN + 30, 0, YN + 76); fal.addColorStop(0, "#5a2a12"); fal.addColorStop(1, "#3a1a0a");
    g.fillStyle = fal; g.fillRect(X0 - 14, YN + 30, X1 - X0 + 28, 44); g.strokeRect(X0 - 14, YN + 30, X1 - X0 + 28, 44);
    g.strokeStyle = "rgba(255,190,120,0.25)"; g.lineWidth = 2;
    for (let i = 0; i < 4; i++) { const x = X0 + 18 + i * (X1 - X0 - 36) / 4; g.strokeRect(x, YN + 38, (X1 - X0 - 36) / 4 - 14, 28); }
    for (const x of [X0 + 6, X1 - 6]) {
      g.fillStyle = MADERA; g.strokeStyle = TINTA; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(x - 16, YN + 74); g.quadraticCurveTo(x - 24, YN + 96, x - 12, YN + 110); g.lineTo(x - 9, SUELO - 14); g.lineTo(x - 16, SUELO); g.lineTo(x + 16, SUELO); g.lineTo(x + 9, SUELO - 14);
      g.lineTo(x + 12, YN + 110); g.quadraticCurveTo(x + 24, YN + 96, x + 16, YN + 74); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,200,140,0.22)"; g.fillRect(x - 6, YN + 80, 4, SUELO - YN - 96);
    }
    // troneras cercanas (en la banda)
    tronera(g, TRONERAS.ci, 10, 5); tronera(g, TRONERAS.cd, 10, 5); tronera(g, TRONERAS.cc, 9, 4.5);
    return c;
  }

  /* ---------- lámpara de billar (se balancea tras el golpe) ---------- */
  function anguloLampara(t) {
    if (t < T.lampara) return 0.006 * Math.sin(t * 1.3);
    const u = t - T.lampara;
    return 0.006 * Math.sin(t * 1.3) - 0.13 * Math.exp(-1.5 * u) * Math.sin(u * 8.2) * suave(fase(t, T.lampara, T.lampara + 0.03));
  }
  function lampara(g, t, luz) {
    const L = LAMPARA, th = anguloLampara(t);
    g.save(); g.translate(L.piv.x, L.piv.y); g.rotate(th); g.translate(-L.piv.x, -L.piv.y);
    g.lineCap = "round"; g.lineJoin = "round";
    // varillas
    g.strokeStyle = TINTA; g.lineWidth = 4; g.beginPath(); g.moveTo(482, L.piv.y); g.lineTo(482, L.y0); g.moveTo(542, L.piv.y); g.lineTo(542, L.y0); g.stroke();
    g.strokeStyle = "#c9a14a"; g.lineWidth = 2; g.stroke();
    // pantalla verde
    const forma = () => { g.beginPath(); g.moveTo(512 - L.a0, L.y0); g.lineTo(512 + L.a0, L.y0); g.lineTo(512 + L.a1, L.y1); g.lineTo(512 - L.a1, L.y1); g.closePath(); };
    const gr = g.createLinearGradient(512 - L.a1, 0, 512 + L.a1, 0); gr.addColorStop(0, "#14462c"); gr.addColorStop(0.45, "#2d7a4c"); gr.addColorStop(1, "#14462c");
    forma(); g.fillStyle = gr; g.fill();
    g.fillStyle = "rgba(255,255,255,0.25)"; g.beginPath(); g.moveTo(512 - 30, L.y0 + 3); g.lineTo(512 - 6, L.y0 + 3); g.lineTo(512 - 8, L.y1 - 4); g.lineTo(512 - 38, L.y1 - 4); g.closePath(); g.fill();
    // abolladura donde le dio la bola
    const ab = tramo(t, T.lampara, T.lampara + 0.06, salida);
    if (ab > 0) { g.fillStyle = `rgba(0,0,0,${0.4 * ab})`; g.beginPath(); g.ellipse(P_LAMP.x + 2, L.y1 - 9, 9 * ab, 6 * ab, 0.3, 0, Math.PI * 2); g.fill();
      g.strokeStyle = `rgba(255,255,255,${0.5 * ab})`; g.lineWidth = 1.5; g.beginPath(); g.arc(P_LAMP.x + 2, L.y1 - 9, 8 * ab, 3.6, 5.4); g.stroke(); }
    forma(); g.strokeStyle = TINTA; g.lineWidth = 3; g.stroke();
    g.fillStyle = "#c9a14a"; g.fillRect(512 - L.a1 - 2, L.y1 - 3, 2 * L.a1 + 4, 5); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.strokeRect(512 - L.a1 - 2, L.y1 - 3, 2 * L.a1 + 4, 5);
    // bombillas
    for (const x of [482, 512, 542]) { const b = g.createRadialGradient(x, L.y1 + 2, 1, x, L.y1 + 2, 14); b.addColorStop(0, `rgba(255,248,215,${luz})`); b.addColorStop(1, "rgba(255,230,160,0)");
      g.fillStyle = b; g.beginPath(); g.arc(x, L.y1 + 2, 14, 0, Math.PI * 2); g.fill(); }
    g.restore();
    return th;
  }
  // cono de luz sobre la mesa (sigue al balanceo)
  function conoLuz(g, t, th, luz) {
    const L = LAMPARA, dx = Math.sin(th) * (L.y1 - L.piv.y);
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createLinearGradient(0, L.y1, 0, YN + 10); gr.addColorStop(0, `rgba(255,226,160,${0.16 * luz})`); gr.addColorStop(1, `rgba(255,214,140,${0.05 * luz})`);
    g.fillStyle = gr; g.beginPath(); g.moveTo(512 + dx - L.a1 + 6, L.y1); g.lineTo(512 + dx + L.a1 - 6, L.y1); g.lineTo(X1 + 30 + dx * 2.4, YN + 10); g.lineTo(X0 - 30 + dx * 2.4, YN + 10); g.closePath(); g.fill();
    const pool = g.createRadialGradient(512 + dx * 2.4, (YN + YF) / 2, 20, 512 + dx * 2.4, (YN + YF) / 2, 250); pool.addColorStop(0, `rgba(255,240,190,${0.22 * luz})`); pool.addColorStop(1, "rgba(255,240,190,0)");
    g.fillStyle = pool; g.fillRect(X0, YF, X1 - X0, YN - YF);
    g.restore();
  }

  /* ---------- bolas ---------- */
  function bola(g, x, y, col, borde, giro, k = 1, opts = {}) {
    const r = RB * k;
    g.save();
    if (opts.sombra !== false) { g.fillStyle = "rgba(0,0,0,0.3)"; g.beginPath(); g.ellipse(x + 2, y + r * 0.85, r * 0.95, r * 0.35, 0, 0, Math.PI * 2); g.fill(); }
    const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r * 1.05);
    gr.addColorStop(0, opts.blanca ? "#ffffff" : "rgba(255,255,255,0.9)"); gr.addColorStop(0.25, col); gr.addColorStop(1, borde);
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    if (opts.ocho) { g.fillStyle = "#fbf8f0"; g.beginPath(); g.ellipse(x + Math.cos(giro) * r * 0.3, y - r * 0.15, r * 0.36, r * 0.32, 0, 0, Math.PI * 2); g.fill(); }
    if (opts.blanca) { g.fillStyle = "#d0202a"; const a = giro; g.beginPath(); g.ellipse(x + Math.sin(a) * r * 0.55, y + Math.cos(a) * r * 0.25, r * 0.17 * Math.abs(Math.cos(a)) + 0.6, r * 0.17, 0, 0, Math.PI * 2); g.fill(); }
    g.lineWidth = 1.5; g.strokeStyle = TINTA; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.85)"; g.beginPath(); g.ellipse(x - r * 0.35, y - r * 0.42, r * 0.26, r * 0.16, -0.5, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function bolasMesa(g, t) {
    for (const b of FIJAS) bola(g, b.p.x, b.p.y, b.c, b.o, 0, 1, { ocho: b.ocho });
    const am = amarilla(t);
    if (am) { if (am.k < 1) { g.save(); g.beginPath(); g.ellipse(TRONERAS.fi.x, TRONERAS.fi.y, 12, 9, 0, 0, Math.PI * 2); g.rect(0, YF + 6, W, H); g.clip("evenodd"); }
      bola(g, am.x, am.y, "#f4c20d", "#8a6a00", am.giro, am.k, { sombra: am.k >= 1 }); if (am.k < 1) g.restore(); }
    // estela de la curva imposible
    const kc = fase(t, T.golpeA, T.choque + 0.35);
    if (kc > 0 && kc < 1) {
      g.save(); g.strokeStyle = "rgba(255,255,255,0.55)"; g.lineCap = "round";
      const k1 = clamp(fase(t, T.golpeA, T.choque)), k0 = Math.max(0, k1 - 0.55 + 0.55 * fase(t, T.choque, T.choque + 0.35));
      const n = 16; g.lineWidth = 3;
      for (let i = 0; i < n; i++) { const a = lerp(k0, k1, i / n), b2 = lerp(k0, k1, (i + 1) / n), ka = 1 - Math.pow(1 - a, 1.25), kb = 1 - Math.pow(1 - b2, 1.25);
        const p0 = bez(ka), p1 = bez(kb); g.globalAlpha = 0.15 + 0.6 * (i / n) * (1 - fase(t, T.choque, T.choque + 0.35)); g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.stroke(); }
      g.restore();
    }
    const bl = blanca(t);
    if (bl && bl.en === "mesa") bola(g, bl.x, bl.y, "#f8f6f0", "#a9a39a", bl.giro, 1, { blanca: true });
  }
  function blancaAire(g, t) {
    const bl = blanca(t); if (!bl || bl.en === "mesa") return;
    if (bl.en === "aire") {
      // rayas de velocidad detrás
      g.save(); g.strokeStyle = "rgba(255,255,255,0.6)"; g.lineCap = "round"; g.lineWidth = 2.2;
      const pa = blanca(Math.max(T.golpeG, t - 0.05));
      if (pa) { const dx = bl.x - pa.x, dy = bl.y - pa.y, l = Math.hypot(dx, dy); if (l > 3) { const ux = dx / l, uy = dy / l, nx = -uy, ny = ux;
        for (const o of [-5, 0, 5]) { g.globalAlpha = o ? 0.4 : 0.65; g.beginPath(); g.moveTo(bl.x - ux * (RB + 2) + nx * o, bl.y - uy * (RB + 2) + ny * o); g.lineTo(bl.x - ux * (RB + 2 + l * 2.2) + nx * o, bl.y - uy * (RB + 2 + l * 2.2) + ny * o); g.stroke(); } } }
      g.restore();
      bola(g, bl.x, bl.y, "#f8f6f0", "#a9a39a", bl.giro, 1, { blanca: true, sombra: false });
    } else {
      g.save(); g.beginPath(); g.ellipse(TRONERAS.cc.x, TRONERAS.cc.y, 13, 8, 0, 0, Math.PI * 2); g.rect(-200, -200, W + 400, YN + 202); g.clip("evenodd");
      bola(g, bl.x, bl.y, "#f8f6f0", "#a9a39a", bl.giro, bl.k, { blanca: true, sombra: false }); g.restore();
    }
  }

  /* ---------- efectos ---------- */
  function estrellaPuntas(g, x, y, r, puntas, rotac, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rotac + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function impacto(g, t, t0, x, y, tam, dur = 0.28) {
    const k = fase(t, t0, t0 + dur); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    estrellaPuntas(g, x, y, tam * (0.55 + 0.7 * salida(k)), 10, 0.3, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2.4; g.strokeStyle = TINTA; g.stroke();
    estrellaPuntas(g, x, y, tam * (0.3 + 0.45 * salida(k)), 10, 0.6, 0.5); g.fillStyle = "#ffffff"; g.fill();
    g.strokeStyle = "#ffffff"; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2, r0 = tam * (0.8 + 0.8 * k), r1 = r0 + tam * 0.45; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  function clac(g, t, t0, x, y) {             // anillito al chocar dos bolas o caer en la tronera
    const k = fase(t, t0, t0 + 0.22); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k; g.strokeStyle = "#ffffff"; g.lineWidth = 2; g.lineCap = "round";
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.4, r0 = 9 + 10 * k; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0 * 0.7); g.lineTo(x + Math.cos(a) * (r0 + 6), y + Math.sin(a) * (r0 + 6) * 0.7); g.stroke(); }
    g.restore();
  }
  // nube de tiza (polvo azul) alrededor de un punto
  function polvoTiza(g, t, t0, dur, c, n, tam) {
    const k = fase(t, t0, t0 + dur); if (k <= 0 || k >= 1) return;
    g.save();
    for (let i = 0; i < n; i++) {
      const a = hash(i * 3.1 + t0) * Math.PI * 2, d = (8 + tam * hash(i + 7.3)) * salida(k), r = (4 + tam * 0.22 * hash(i + 2.2)) * (0.6 + k);
      g.globalAlpha = 0.55 * (1 - k) * (0.6 + 0.4 * hash(i + 5)); g.fillStyle = i % 3 ? "#8fb0f0" : "#5d86e0";
      g.beginPath(); g.arc(c.x + Math.cos(a) * d, c.y + Math.sin(a) * d * 0.7 - 18 * k, r, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  // grieta del techo y polvillo que cae
  function techo(g, t) {
    if (t < T.techo) return;
    const k = tramo(t, T.techo, T.techo + 0.08, salida), x = P_TECHO.x, y = 34;
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 2; g.lineCap = "round"; g.globalAlpha = k;
    for (const [a, l] of [[0.3, 22], [2.6, 18], [1.4, 12], [3.4, 14]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l * 0.5, y + Math.abs(Math.sin(a)) * 2 - 3); g.lineTo(x + Math.cos(a) * l, y - 4 + Math.abs(Math.sin(a)) * 3); g.stroke(); }
    g.restore();
    const kp = fase(t, T.techo, T.techo + 1.1);
    if (kp > 0 && kp < 1) { g.save();
      for (let i = 0; i < 12; i++) { const fx = x + (hash(i + 20) - 0.5) * 34, vy = 0.5 + hash(i + 21), yy = y + 4 + kp * kp * 260 * vy;
        g.globalAlpha = 0.7 * (1 - kp); g.fillStyle = i % 2 ? "#d8c7b0" : "#a8957c"; g.beginPath(); g.arc(fx + Math.sin(kp * 6 + i) * 4, yy, 1.6 + hash(i + 22) * 2.2, 0, Math.PI * 2); g.fill(); }
      g.restore(); }
  }
  function estrellitas(g, t, pg) {
    const k = tramo(t, T.coco + 0.1, T.coco + 0.4) * (1 - tramo(t, T.palma0 + 0.3, T.palma1 + 0.1)); if (k <= 0.01) return;
    const c = G.aPantalla(pg, G.cabeza(pg).a({ x: 790, y: 330 }));
    const pts = [];
    for (let i = 0; i < 5; i++) { const a = t * 4.2 + i * Math.PI * 2 / 5; pts.push({ a, x: c.x + Math.cos(a) * 58, y: c.y - 26 + Math.sin(a) * 15, z: Math.sin(a) }); }
    pts.sort((u, v) => u.z - v.z);
    g.save();
    for (const q of pts) { const r = (8.5 + 3 * q.z) * k; estrellaPuntas(g, q.x, q.y, r, 5, t * 3 + q.a, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 1.8; g.strokeStyle = TINTA; g.stroke(); }
    g.restore();
  }
  // mano de Ander encima del hombro de Guillermo (el brazo queda detrás de Guillermo)
  function manoEncima(g, pa, t) {
    const m = pa.manoLejos, k = pa._palma || 0; if (!m || k <= 0.01) return;
    g.save();
    const kk = pa.s * A.K;
    g.translate(pa.x, pa.suelo); g.scale(-kk, kk); g.translate(-A.PELVIS.x, -A.SUELO);
    g.translate(m.x, m.y); g.rotate(m.ang || 0); g.scale(A.JK, A.JK);
    g.globalAlpha = clamp(k * 3);
    Personaje2D.mano(g, m, { piel: A.C.piel, sombra: A.C.pielSombra, tinta: A.C.tinta });
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const tiro = tramo(t, T.baja0, T.baja1) * (1 - tramo(t, T.cae + 0.2, T.turno0 + 0.3));
    const show = tramo(t, T.gPrac0, T.carga1) * (1 - tramo(t, T.golpeG, T.golpeG + 0.3));
    const coco = tramo(t, T.coco + 0.3, T.coco + 1.1) * (1 - tramo(t, T.final + 0.2, T.fin));
    const k = 1 + 0.1 * tiro + 0.08 * show + 0.1 * coco, mx = W / 2 / k - 52, my = H / 2 / k - 52;
    return { k, x: clamp(512 + 40 * tiro - 150 * show - 120 * coco, mx, W - mx), y: clamp(300 + 50 * tiro + 40 * show + 30 * coco, my, H - my) };
  }
  function temblor(t) {
    const a = (t >= T.golpeG ? 3 * Math.exp(-(t - T.golpeG) * 9) : 0) + (t >= T.lampara ? 3.5 * Math.exp(-(t - T.lampara) * 8) : 0)
      + (t >= T.techo ? 4 * Math.exp(-(t - T.techo) * 8) : 0) + (t >= T.coco ? 7 * Math.exp(-(t - T.coco) * 7) : 0);
    return a > 0.05 ? { x: ruido(t * 47) * a, y: ruido(t * 47 + 11) * a * 0.7 } : { x: 0, y: 0 };
  }

  class Billar extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !A.listo()) return;
      if (!fondo) { fondo = creaFondo(); frente = creaFrente(); }
      if (!COCO) calculaCoco();
      const P = pose(t), pg = P.g, pa = P.a;
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t), sh = temblor(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x + sh.x, -cam.y + sh.y);
      CAM = g.getTransform();
      g.drawImage(fondo, -60, -60);
      techo(g, t);
      const th = anguloLampara(t);
      conoLuz(g, t, th, 1);
      bolasMesa(g, t);
      clac(g, t, T.choque, CONTACTO.x - 6, CONTACTO.y);
      clac(g, t, T.cae, TRONERAS.fi.x, TRONERAS.fi.y);
      g.drawImage(frente, 0, 0);
      lampara(g, t, 1);
      // sombras de los dos en el suelo
      g.save(); g.fillStyle = "rgba(0,0,0,0.32)";
      g.beginPath(); g.ellipse(pg.x + 20, SUELO + 1, 96, 8, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pa.x - 10, SUELO + 1, 90, 8, 0, 0, Math.PI * 2); g.fill();
      g.restore();
      // Ander (por delante de la mesa) y luego Guillermo, delante de todo
      A.dibujar(g, pa, t);
      impacto(g, t, T.golpeA, S0.x + 10, S0.y - 2, 9, 0.18);
      polvoTiza(g, t, T.sopla0, 0.6, pa._taco.b, 10, 16);
      // Guillermo delante de todo
      G.dibujar(g, pg, t);
      manoEncima(g, pa, t);
      polvoTiza(g, t, T.nube, 1.0, { x: pg._taco.b.x + 6, y: pg._taco.b.y - 10 }, 26, 46);
      polvoTiza(g, t, T.nube + 0.25, 1.0, { x: pg._taco.b.x + 34, y: pg._taco.b.y - 72 }, 18, 36);
      impacto(g, t, T.golpeG, REPOSO.x - 12, REPOSO.y - 2, 22);
      blancaAire(g, t);
      impacto(g, t, T.lampara, P_LAMP.x, P_LAMP.y + 4, 22);
      impacto(g, t, T.techo, P_TECHO.x, P_TECHO.y, 20);
      impacto(g, t, T.coco, COCO.x, COCO.y + 6, 30);
      clac(g, t, T.bolsa + 0.05, TRONERAS.cc.x, TRONERAS.cc.y);
      estrellitas(g, t, pg);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00035", nombre: "Guillermo y Ander · El billar", crear: () => new Billar() });
  window.__A2D_00035 = { pose, T, DUR, blanca, poseG, poseA: t => poseA(t, poseG(t)) };
})();
