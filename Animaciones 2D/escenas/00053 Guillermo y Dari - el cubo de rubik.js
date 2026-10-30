"use strict";
/* 00053 · Guillermo y Dari · El cubo de Rubik
 *
 * Negro → bar de juegos de mesa por la noche: pared verde azulado, una estantería llena de cajas de
 * juegos, un letrero de neón con forma de cubo, un póster de un marciano de píxeles, una pizarra con el
 * desarrollo de un cubo dibujado con tiza y una lámpara colgante sobre una mesa alta redonda. En la
 * mesa, el cubo desordenado de Guillermo → Dari mira su propio cubo desordenado, le brillan las gafas y
 * lo resuelve en dos segundos con los dedos hechos un borrón; lo enseña resuelto y lo deja en la mesa:
 * ¡clic! → Guillermo, con la boca abierta, se pica: coge el suyo, se lo enseña chulo a cámara y empieza
 * a girar caras, primero despacio y con la lengua fuera, luego cada vez más rápido y más liado (le da la
 * vuelta, suda, se pone rojo, ojos en espiral) → se le ocurre despegar una pegatina: se le queda pegada
 * al dedo, sacude la mano y la pegatina acaba en su frente → rabia: levanta el cubo y lo estampa contra
 * la mesa: revienta en cubitos que saltan por toda la mesa (el cubo de Dari da un brinco) → Dari suspira
 * y, con una sola mano y sin inmutarse, hace saltar los cubitos a su sitio uno a uno hasta montar el
 * cubo resuelto (sigue faltando la pegatina) → se lo devuelve; Guillermo lo abraza con los ojos cerrados
 * y le salen corazones; a Dari le brillan las gafas → negro.
 *
 * El cubo es de verdad: 27 cubitos con sus pegatinas, giros de capa de 90° y la resolución de Dari es la
 * mezcla deshecha al revés. Sin textos. Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, entrada, salida, tramo, campana, ruido, hash } = M2;
  const G = Guillermo, Da = Dari;
  const S = 0.30, SUELO = 560;
  const XG = 400, XD = 625;                         // pelvis de Guillermo y de Dari (Dari mira a la izquierda)
  const MESA = { x: 512, y: 340, rx: 100, ry: 15, canto: 11 };   // tablero redondo visto en perspectiva
  const U = 10, PITCH = 0.42;                       // lado de un cubito (px) e inclinación de la vista
  const DUR = 14.65;
  const T = {
    examina: 0.5, brillo1: 1.2, r0: 1.42, r1: 3.22,
    dTop0: 3.32, dTop1: 3.46, dCerca0: 3.46, dCerca1: 3.8, baja0: 3.5, click: 3.86, brillo2: 4.08,
    gToma0: 4.3, gToma1: 4.66, gSube0: 4.68, gSube1: 5.02, gJunta0: 4.82, gJunta1: 5.02, gLado0: 5.03, gLado1: 5.18,
    chulo: 5.2, chulo1: 5.46, vuelta0: 6.22, vuelta1: 6.58,
    cara0: 7.5, cara1: 7.76, idea: 7.8, pinza0: 7.86, pinza1: 8.06, despega0: 8.08, despega1: 8.36,
    pegado0: 8.38, sacude0: 8.45, vuela: 8.86, frente: 9.0,
    rabia0: 9.2, rabia1: 9.45, golpe: 9.58,
    suspiro0: 10.1, suspiro1: 10.6, dSaca0: 10.38, dSaca1: 10.7, arma0: 10.72, arma1: 11.96,
    dCoge0: 11.98, dCoge1: 12.14, dSube0: 12.16, dSube1: 12.5, gAlc0: 12.24, gAlc1: 12.48,
    dSuelta0: 12.56, dSuelta1: 12.9, entregaG: 12.68, abrazo0: 12.62, abrazo1: 13.0,
    corazones: 13.05, brillo3: 13.3, fin: 13.95
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
  const envolver = a => a - 2 * Math.PI * Math.floor((a + Math.PI) / (2 * Math.PI));
  const TINTA = "#0b0a0e", NEGRO_CUBO = "#131317";
  let MATRIZ = null;                                  // matriz de la cámara (para dibujar en pantalla desde las manos)

  // dedos: agarrar de lado, agarrar por arriba, pinza, puño, palma abierta, relajada
  const AGARRA = D(0.35, 0.45, 0.42, 0.4), AGARRA_A = D(0.45, 0.55, 0.5, 0.45), PINZA = D(0.42, 0.5, 0.22, 0.18);
  const PUNO = D(0, 0, 0, 0), PALMA = D(1, 1, 1, 1), RELAJ = D(0.6, 0.55, 0.5, 0.45);
  const LADO = 19, ARRIBA = 21;                       // del centro del cubo al centro del puño que lo agarra (px)

  /* Pistas de una mano: [t0, t1, objetivo, curva]; el objetivo se resuelve en cada fotograma (pantalla, cubo,
   * hombro o bolsillo) y se mezcla con suavidad. El giro de la muñeca va por el camino corto. */
  function pista(lista, t, resuelve) {
    let c = resuelve(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)), d = resuelve(obj);
      c = { x: lerp(c.x, d.x, k), y: lerp(c.y, d.y, k), mu: c.mu + envolver(d.mu - c.mu) * k, ang: lerp(c.ang, d.ang, k),
        puno: lerp(c.puno, d.puno, k), dedos: DD(c.dedos, d.dedos, k) };
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

  /* ================= el cubo de Rubik en 3D ================= */
  // Matrices 3×3 por filas; x a la derecha, y arriba, z hacia la cámara. Proyección ortográfica.
  const mul = (A, B) => [
    A[0] * B[0] + A[1] * B[3] + A[2] * B[6], A[0] * B[1] + A[1] * B[4] + A[2] * B[7], A[0] * B[2] + A[1] * B[5] + A[2] * B[8],
    A[3] * B[0] + A[4] * B[3] + A[5] * B[6], A[3] * B[1] + A[4] * B[4] + A[5] * B[7], A[3] * B[2] + A[4] * B[5] + A[5] * B[8],
    A[6] * B[0] + A[7] * B[3] + A[8] * B[6], A[6] * B[1] + A[7] * B[4] + A[8] * B[7], A[6] * B[2] + A[7] * B[5] + A[8] * B[8]];
  const ap = (M, v) => [M[0] * v[0] + M[1] * v[1] + M[2] * v[2], M[3] * v[0] + M[4] * v[1] + M[5] * v[2], M[6] * v[0] + M[7] * v[1] + M[8] * v[2]];
  const rx = a => { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, -s, 0, s, c]; };
  const ry = a => { const c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 1, 0, -s, 0, c]; };
  const rz = a => { const c = Math.cos(a), s = Math.sin(a); return [c, -s, 0, s, c, 0, 0, 0, 1]; };
  const rEje = (e, a) => e === 0 ? rx(a) : e === 1 ? ry(a) : rz(a);
  const entero = M => M.map(v => Math.round(v) || 0);
  const ID3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  const VISTA = rx(PITCH);
  const orient = o => mul(VISTA, mul(ry(o.yaw), mul(rx(o.tilt), rz(o.roll))));
  const euler = E3 => mul(ry(E3[1]), mul(rx(E3[0]), rz(E3[2])));        // E3 = [ax, ay, az]
  const mezcla3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
  function eulerDe(M) {                              // giros de 90°: busca los tres ángulos
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) {
      const E3 = [j * Math.PI / 2, i * Math.PI / 2, k * Math.PI / 2], R = entero(euler(E3));
      if (R.every((v, n) => v === M[n])) return E3;
    }
    return [0, 0, 0];
  }

  // caras de un cubito: normal, borde negro y pegatina (unidades de cubito)
  const CARAS = [];
  for (let e = 0; e < 3; e++) for (const sg of [1, -1]) {
    const u = (e + 1) % 3, v = (e + 2) % 3, n = [0, 0, 0]; n[e] = sg;
    const esq = k => [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => { const q = [0, 0, 0]; q[e] = sg * 0.5; q[u] = a * k; q[v] = b * k; return q; });
    CARAS.push({ e, sg, n, borde: esq(0.5), peg: esq(0.4) });
  }
  // colores: [eje][+, −] → derecha/izquierda, arriba/abajo, delante/detrás
  const COL = [["#e0262e", "#ff7d14"], ["#f6f3ea", "#ffd21c"], ["#1fae4a", "#2a62d8"]];
  const CUBITOS = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
    const h = [x, y, z];
    CUBITOS.push({ h, col: CARAS.map(c => h[c.e] === c.sg ? COL[c.e][c.sg > 0 ? 0 : 1] : null) });
  }
  const RESUELTO = CUBITOS.map(c => ({ p: c.h.slice(), M: ID3 }));
  const CERO = [0, 0, 0];

  // sombreado de las pegatinas según hacia dónde mira la cara
  const LUZ = (() => { const v = [-0.35, 0.85, 0.45], l = Math.hypot(v[0], v[1], v[2]); return v.map(a => a / l); })();
  const tonos = new Map();
  function tono(hex, k) {
    const q = Math.round(clamp(k) * 12), key = hex + q;
    let s = tonos.get(key);
    if (!s) {
      const f = 0.6 + 0.4 * q / 12, r = parseInt(hex.slice(1, 3), 16), gg = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
      s = `rgb(${Math.round(r * f)},${Math.round(gg * f)},${Math.round(b * f)})`; tonos.set(key, s);
    }
    return s;
  }
  function quad(g, cx, cy, O, pos, pts, u) {
    g.beginPath();
    for (let i = 0; i < 4; i++) { const w = ap(O, pts[i]), x = cx + (pos[0] + w[0]) * u, y = cy - (pos[1] + w[1]) * u; if (i) g.lineTo(x, y); else g.moveTo(x, y); }
    g.closePath();
  }
  let PEG = { i: -1, f: -1 };                        // la pegatina que despega Guillermo (se calcula abajo)
  // un cubito: centro de pantalla (cx, cy) + pos (unidades de cubito, ya girada), orientación O (cubito → vista)
  function cubito(g, cx, cy, pos, O, i, u, todas, sinPeg) {
    const col = CUBITOS[i].col;
    for (let f = 0; f < 6; f++) {
      const c = CARAS[f], n = c.n;
      const nz = O[6] * n[0] + O[7] * n[1] + O[8] * n[2];
      if (nz <= 0.02) continue;
      if (!col[f] && !todas) continue;
      quad(g, cx, cy, O, pos, c.borde, u); g.fillStyle = NEGRO_CUBO; g.fill(); g.stroke();
      if (col[f] && !(sinPeg && i === PEG.i && f === PEG.f)) {
        const nx = O[0] * n[0] + O[1] * n[1] + O[2] * n[2], ny = O[3] * n[0] + O[4] * n[1] + O[5] * n[2];
        quad(g, cx, cy, O, pos, c.peg, u); g.fillStyle = tono(col[f], nx * LUZ[0] + ny * LUZ[1] + nz * LUZ[2]); g.fill();
      }
    }
  }
  // cubo entero: est = [{p, M}] por cubito; Rw = orientación del cubo vista; giro = {e, capa, ang} o null
  function cubo(g, c, Rw, est, giro, sinPeg) {
    g.save(); g.lineJoin = "round"; g.lineWidth = 0.16 * U; g.strokeStyle = NEGRO_CUBO;
    const lista = [];
    for (let i = 0; i < 27; i++) {
      let p = est[i].p, M = est[i].M;
      if (giro && p[giro.e] === giro.capa) { const R = rEje(giro.e, giro.ang); p = ap(R, p); M = mul(R, M); }
      const pos = ap(Rw, p);
      lista.push({ i, pos, O: mul(Rw, M), z: pos[2] });
    }
    if (giro) lista.sort((a, b) => a.z - b.z);
    for (const q of lista) cubito(g, c.x, c.y, q.pos, q.O, q.i, U, !!giro, sinPeg);
    g.restore();
  }
  function aplica(est, m) {
    const R = entero(rEje(m.e, m.dir * Math.PI / 2));
    return est.map(c => c.p[m.e] === m.capa ? { p: ap(R, c.p).map(v => Math.round(v) || 0), M: entero(mul(R, c.M)) } : c);
  }
  function revuelve(n, semilla) {
    const l = []; let ult = -1;
    for (let i = 0; i < n; i++) {
      let e = Math.floor(hash(semilla + i * 7.3) * 3); if (e === ult) e = (e + 1) % 3; ult = e;
      l.push({ e, capa: hash(semilla + i * 3.1 + 0.5) < 0.5 ? -1 : 1, dir: hash(semilla + i * 5.7 + 0.2) < 0.5 ? -1 : 1 });
    }
    return l;
  }
  // máquina de giros: estado y capa girando en el tiempo t
  function maquina(est0, giros) {
    const estados = [est0];
    for (const m of giros) estados.push(aplica(estados[estados.length - 1], m));
    const f = t => {
      let k = 0; while (k < giros.length && t >= giros[k].t1) k++;
      const m = giros[k];
      return { est: estados[k], giro: m && t > m.t0 ? { e: m.e, capa: m.capa, ang: m.dir * Math.PI / 2 * suave(fase(t, m.t0, m.t1)) } : null };
    };
    f.final = estados[estados.length - 1];
    return f;
  }

  // Dari: mezcla de 12 giros y la resuelve deshaciéndola al revés (0,15 s por giro)
  const MEZCLA_D = revuelve(12, 3.3);
  const cuboD = maquina(MEZCLA_D.reduce(aplica, RESUELTO), MEZCLA_D.slice().reverse().map((m, i) => {
    const dt = (T.r1 - T.r0) / 12; return { e: m.e, capa: m.capa, dir: -m.dir, t0: T.r0 + i * dt, t1: T.r0 + (i + 0.86) * dt }; }));
  // Guillermo: su cubo mezclado y sus giros, primero lentos y luego frenéticos
  const MOVS_G = [{ e: 1, capa: 1, dir: 1 }, { e: 0, capa: 1, dir: -1 }, { e: 2, capa: 1, dir: 1 }, { e: 1, capa: 1, dir: -1 }, { e: 0, capa: 1, dir: 1 },
    { e: 2, capa: 1, dir: -1 }, { e: 1, capa: -1, dir: 1 }, { e: 0, capa: -1, dir: -1 }, { e: 2, capa: 1, dir: 1 }];
  const TIEMPOS_G = [[5.5, 5.9], [6.0, 6.3], [6.42, 6.62], [6.7, 6.85], [6.92, 7.02], [7.05, 7.14], [7.17, 7.25], [7.28, 7.36], [7.39, 7.46]];
  const cuboG = maquina(revuelve(14, 8.1).reduce(aplica, RESUELTO), MOVS_G.map((m, i) => Object.assign({ t0: TIEMPOS_G[i][0], t1: TIEMPOS_G[i][1] }, m)));
  // la pegatina: la del centro de la columna izquierda de la cara de delante, al acabar sus giros
  PEG = (() => {
    const est = cuboG.final;
    for (let i = 0; i < 27; i++) {
      const c = est[i]; if (c.p[0] !== -1 || c.p[1] !== 0 || c.p[2] !== 1) continue;
      for (let f = 0; f < 6; f++) { const n = entero(ap(c.M, CARAS[f].n)); if (n[0] === 0 && n[1] === 0 && n[2] === 1) return { i, f }; }
    }
    return { i: -1, f: -1 };
  })();
  const COLOR_PEG = PEG.i >= 0 ? CUBITOS[PEG.i].col[PEG.f] : "#1fae4a";

  /* ---------- dónde está cada cubo (centro en pantalla y giro) ---------- */
  const cyM = d => MESA.y + d - 1.5 * Math.cos(PITCH) * U;   // centro de un cubo apoyado en la mesa (d: fondo)
  const TG = { x: 478, d: 4 }, TD = { x: 548, d: -6 }, TR = { x: 516, d: 4 };
  const YAW_R = -0.6;
  const OG = {
    mesa: { x: TG.x, y: cyM(TG.d), yaw: -0.5, tilt: 0, roll: 0 },
    pecho: { x: XG + 55, y: 296, yaw: -0.65, tilt: 0.14, roll: 0 },
    chulo: { x: XG + 57, y: 289, yaw: -0.9, tilt: 0.08, roll: 0 },
    giro: { x: XG + 55, y: 297, yaw: -0.45, tilt: 0.2, roll: 0 },
    vuelta: { x: XG + 55, y: 296, yaw: -0.7, tilt: 0.25, roll: Math.PI },
    lio: { x: XG + 52, y: 300, yaw: -0.3, tilt: -0.12, roll: Math.PI + 0.25 },
    agonia: { x: XG + 56, y: 305, yaw: -0.95, tilt: 0.35, roll: Math.PI - 0.2 },
    cara: { x: XG + 68, y: 252, yaw: -0.55, tilt: 0.12, roll: 2 * Math.PI },
    alza: { x: XG + 88, y: 212, yaw: -0.35, tilt: -0.25, roll: 2 * Math.PI + 0.35 },
    golpe: { x: XG + 97, y: cyM(2), yaw: -0.2, tilt: 0, roll: 2 * Math.PI }
  };
  const GUION_OG = [[T.gSube0, T.gSube1, "pecho"], [T.chulo, T.chulo + 0.2, "chulo"], [T.chulo1, T.chulo1 + 0.25, "giro"],
    [T.vuelta0, T.vuelta1, "vuelta"], [6.62, 6.9, "lio"], [6.95, 7.3, "agonia"], [T.cara0, T.cara1, "cara"],
    [T.rabia0, T.rabia1, "alza", salida], [T.rabia1 + 0.03, T.golpe, "golpe", entrada]];
  const OD = {
    mano: { x: XD - 52, y: 300, yaw: -0.75, tilt: 0.12, roll: 0 },
    examina: { x: XD - 54, y: 296, yaw: -0.3, tilt: 0.32, roll: 0 },
    examina2: { x: XD - 52, y: 298, yaw: -0.95, tilt: 0.05, roll: 0 },
    resuelve: { x: XD - 52, y: 298, yaw: -0.6, tilt: 0.25, roll: 0 },
    muestra: { x: XD - 55, y: 290, yaw: -0.55, tilt: 0.45, roll: 0 },
    mesa: { x: TD.x, y: cyM(TD.d), yaw: -0.55, tilt: 0, roll: 0 }
  };
  const GUION_OD = [[T.examina, T.examina + 0.35, "examina"], [T.examina + 0.4, T.brillo1 - 0.05, "examina2"], [T.brillo1, T.r0, "resuelve"],
    [T.r1, T.r1 + 0.2, "muestra"], [T.baja0, T.click, "mesa"]];
  const OR = {
    mesa: { x: TR.x, y: cyM(TR.d), yaw: YAW_R, tilt: 0, roll: 0 },
    alza: { x: 499, y: 282, yaw: YAW_R + 0.1, tilt: 0.12, roll: 0 },
    abrazo: { x: XG + 44, y: 297, yaw: YAW_R - 0.25, tilt: 0.22, roll: 0 }
  };
  const GUION_OR = [[T.dSube0, T.dSube1, "alza"], [T.abrazo0, T.abrazo1, "abrazo"]];

  function estadoCubo(cual, t) {
    if (cual === "g") {
      const o = linea(GUION_OG, OG, "mesa", t);
      const kw = tramo(t, 5.45, 5.6) * (1 - tramo(t, T.cara0, T.cara1));             // lo zarandea mientras gira
      o.yaw += 0.1 * kw * ruido(t * 2.7 + 3); o.tilt += 0.07 * kw * ruido(t * 2.3 + 8);
      const kf = tramo(t, 6.86, 6.95) * (1 - tramo(t, 7.42, 7.56));                   // frenético
      o.x += 1.8 * kf * ruido(t * 40); o.y += 1.5 * kf * ruido(t * 37 + 5);
      const kr = tramo(t, T.rabia1 - 0.12, T.rabia1) * (t < T.rabia1 + 0.03 ? 1 : 0);  // tiembla de rabia arriba
      o.x += 2 * kr * ruido(t * 45); o.y += 1.5 * kr * ruido(t * 43 + 2);
      return o;
    }
    if (cual === "d") {
      const o = linea(GUION_OD, OD, "mano", t);
      const kb = tramo(t, T.r0, T.r0 + 0.1) * (1 - tramo(t, T.r1 - 0.1, T.r1));       // cambia de agarre mientras resuelve
      o.yaw += 0.22 * kb * Math.sin((t - T.r0) * 7); o.tilt += 0.1 * kb * Math.sin((t - T.r0) * 5.3 + 1);
      o.x += 1.2 * kb * ruido(t * 30); o.y += 1.2 * kb * ruido(t * 33 + 2);
      o.y -= 2 * campana(t, T.click, T.click + 0.12);                                   // clic
      const kj = fase(t, T.golpe + 0.02, T.golpe + 0.3);                                // brinco con el golpe
      o.y -= 9 * Math.sin(Math.PI * kj) * (kj > 0 && kj < 1 ? 1 : 0); o.tilt += 0.18 * campana(t, T.golpe + 0.02, T.golpe + 0.3);
      o.y -= 2 * campana(t, T.golpe + 0.3, T.golpe + 0.4);
      return o;
    }
    const o = linea(GUION_OR, OR, "mesa", t);
    const kh = tramo(t, T.abrazo1, T.abrazo1 + 0.25);                                   // achuchones
    o.x += 1.6 * kh * Math.sin((t - T.abrazo1) * 5); o.yaw += 0.04 * kh * Math.sin((t - T.abrazo1) * 5);
    return o;
  }
  const dibujaG = (g, t) => { const o = estadoCubo("g", t), s = cuboG(t); cubo(g, o, orient(o), s.est, s.giro, t >= T.despega0); };
  const dibujaD = (g, t) => { const o = estadoCubo("d", t), s = cuboD(t); cubo(g, o, orient(o), s.est, s.giro, false); };
  const dibujaR = (g, t) => { const o = estadoCubo("r", t); cubo(g, o, orient(o), RESUELTO, null, true); };

  /* ---------- la pegatina ---------- */
  // esquinas de la pegatina en la cara del cubo (pantalla)
  function esquinasPeg(t) {
    const o = estadoCubo("g", t), Rw = orient(o), c = cuboG.final[PEG.i];
    const pos = ap(Rw, c.p), O = mul(Rw, c.M);
    return CARAS[PEG.f].peg.map(q => { const w = ap(O, q); return { x: o.x + (pos[0] + w[0]) * U, y: o.y - (pos[1] + w[1]) * U }; });
  }
  // borde libre (el de la izquierda) y los dos índices de sus esquinas
  function bordeLibre(es) {
    let mejor = null;
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4, mx = (es[i].x + es[j].x) / 2; if (!mejor || mx < mejor.mx) mejor = { i, j, mx, my: (es[i].y + es[j].y) / 2 }; }
    return mejor;
  }
  const TIRON = { x: -13, y: 3 };                    // hacia dónde tira el dedo al despegarla
  function puntaPeg(t, k) { const b = bordeLibre(esquinasPeg(t)); return { x: b.mx + TIRON.x * k, y: b.my + TIRON.y * k }; }
  // punto de pinza de la mano con dedos respecto al centro del puño (px de pantalla), para un giro de muñeca mu
  const offPunta = mu => { const a = mu + Math.PI / 2, k = S * G.JK, lx = 8, ly = 11.5; return { x: k * (lx * Math.cos(a) - ly * Math.sin(a)), y: k * (lx * Math.sin(a) + ly * Math.cos(a)) }; };
  // forma de la pegatina respecto a su centro (al despegarse)
  const formaPeg = () => cache("formaPeg", () => { const es = esquinasPeg(T.despega1), cx = es.reduce((s, q) => s + q.x, 0) / 4, cy = es.reduce((s, q) => s + q.y, 0) / 4;
    return es.map(q => ({ x: q.x - cx, y: q.y - cy })); });
  function poli(g, pts) { g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); g.closePath(); }
  function pintaPeg(g, pts, reverso) {
    g.save(); g.lineJoin = "round"; poli(g, pts);
    g.fillStyle = reverso > 0.5 ? "#efe9dc" : COLOR_PEG; g.fill(); g.lineWidth = 1.2; g.strokeStyle = TINTA; g.stroke(); g.restore();
  }
  // en la mano: despegándose del cubo (el borde libre va con el dedo) y luego pegada al dedo
  function pegatinaMano(g, t, punta) {
    if (t < T.despega1) {
      const k = fase(t, T.despega0, T.despega1), es = esquinasPeg(t), b = bordeLibre(es);
      const cx = es.reduce((s, q) => s + q.x, 0) / 4, cy = es.reduce((s, q) => s + q.y, 0) / 4;
      const dx = punta.x - cx, dy = punta.y - cy, wl = suave(k / 0.6), wa = suave((k - 0.6) / 0.4);
      const pts = es.map((q, n) => { const w = (n === b.i || n === b.j) ? wl : wa; return { x: q.x + dx * w, y: q.y + dy * w }; });
      pintaPeg(g, pts, k > 0.55 ? 1 : 0);
      return;
    }
    const f = formaPeg(), a = 0.25 * Math.sin((t - T.sacude0) * 50) * tramo(t, T.sacude0, T.sacude0 + 0.1), c = Math.cos(a), s = Math.sin(a);
    pintaPeg(g, f.map(q => ({ x: punta.x + q.x * c - q.y * s, y: punta.y + q.x * s + q.y * c })), 0);
  }
  // en la frente (coordenadas del retrato de Guillermo)
  const FRENTE = { x: 726, y: 646 }, PEG_TAM = 46, PEG_ROT = 0.3;          // en el moflete
  const esqFrente = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => { const c = Math.cos(PEG_ROT), s = Math.sin(PEG_ROT), x = a * PEG_TAM / 2, y = b * PEG_TAM / 2;
    return { x: FRENTE.x + x * c - y * s, y: FRENTE.y + x * s + y * c }; });
  function retratoAPantalla(p, q) { const H = G.cabeza(p); return G.aPantalla(p, H.a(q)); }
  function pegFrente(g, t) {
    if (t < T.frente) return;
    const k = fase(t, T.frente, T.frente + 0.28), sq = 1 + 0.4 * Math.sin(Math.PI * k) * (1 - k);
    g.save(); g.translate(FRENTE.x, FRENTE.y); g.rotate(PEG_ROT); g.scale(sq, 1 / sq); g.lineJoin = "round";
    g.fillStyle = COLOR_PEG; g.strokeStyle = TINTA; g.lineWidth = 6;
    g.beginPath(); g.rect(-PEG_TAM / 2, -PEG_TAM / 2, PEG_TAM, PEG_TAM); g.fill(); g.stroke();
    g.fillStyle = "#efe9dc"; g.lineWidth = 4;                                            // esquinita levantada
    g.beginPath(); g.moveTo(PEG_TAM / 2 - 15, -PEG_TAM / 2); g.lineTo(PEG_TAM / 2, -PEG_TAM / 2 + 15); g.lineTo(PEG_TAM / 2 - 4, -PEG_TAM / 2 - 5); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(-PEG_TAM / 2 + 7, -PEG_TAM / 2 + 7, 12, 7);
    g.restore();
  }
  // en vuelo: del dedo a la frente, dando vueltas
  function pegatinaVuela(g, t, pG) {
    if (t < T.vuela || t >= T.frente) return;
    const k = fase(t, T.vuela, T.frente), p0 = cache("tipVuela", () => poseG(T.vuela)._tip);
    const fin = esqFrente.map(q => retratoAPantalla(pG, q)), fc = { x: fin.reduce((s, q) => s + q.x, 0) / 4, y: fin.reduce((s, q) => s + q.y, 0) / 4 };
    const c1 = { x: (p0.x + fc.x) / 2 + 26, y: Math.min(p0.y, fc.y) - 34 };
    const x = (1 - k) * (1 - k) * p0.x + 2 * (1 - k) * k * c1.x + k * k * fc.x, y = (1 - k) * (1 - k) * p0.y + 2 * (1 - k) * k * c1.y + k * k * fc.y;
    const a = 4 * Math.PI * k, c = Math.cos(a), s = Math.sin(a), ks = suave(k);
    const pts = formaPeg().map((q, n) => { const r = { x: q.x * c - q.y * s, y: q.x * s + q.y * c }, e = { x: fin[n].x - fc.x, y: fin[n].y - fc.y };
      return { x: x + lerp(r.x, e.x, ks), y: y + lerp(r.y, e.y, ks) }; });
    pintaPeg(g, pts, 0);
    g.save(); g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 1.6; g.lineCap = "round";               // estela
    for (let i = 1; i <= 3; i++) { const kk = Math.max(0, k - i * 0.09), xx = (1 - kk) * (1 - kk) * p0.x + 2 * (1 - kk) * kk * c1.x + kk * kk * fc.x,
      yy = (1 - kk) * (1 - kk) * p0.y + 2 * (1 - kk) * kk * c1.y + kk * kk * fc.y; g.globalAlpha = 0.5 / i; g.beginPath(); g.arc(xx, yy, 1.4, 0, Math.PI * 2); g.stroke(); }
    g.restore();
  }

  /* ---------- el estallido: cubitos que saltan por la mesa y vuelven a su sitio ---------- */
  function cercano(Er, base) {          // el ángulo equivalente a `base` más cerca de Er (para no dar vueltas de más)
    return base.map((b, n) => b + 2 * Math.PI * Math.round((Er[n] - b) / (2 * Math.PI)));
  }
  const ESTALLIDO = () => cache("estallido", () => {
    const o = estadoCubo("g", T.golpe), est = cuboG.final;
    const Rflat = entero(mul(rx(o.tilt), rz(o.roll))), Wm = mul(VISTA, ry(o.yaw));
    // huecos en el tablero (sin el sitio del cubo de Dari ni donde se va a montar el nuevo)
    const huecos = [];
    for (let fila = 0; fila < 4; fila++) for (let col = 0; col < 12; col++) {
      const n = fila * 12 + col, d = [-0.72, -0.24, 0.26, 0.74][fila] + 0.12 * (hash(n + 401) - 0.5);
      const x = 456 + col * 13.5 + (fila % 2 ? 6 : 0) + 4 * (hash(n + 402) - 0.5);
      if (((x - MESA.x) / (MESA.rx - 9)) ** 2 + (d * 0.8) ** 2 > 1) continue;
      if (d < 0 && Math.abs(x - TD.x) < 22) continue;
      if (d > 0 && Math.abs(x - TR.x) < 19) continue;
      huecos.push({ x, d, r: hash(n + 403) });
    }
    huecos.sort((a, b) => a.r - b.r); huecos.length = Math.min(27, huecos.length); huecos.sort((a, b) => a.x - b.x);
    const piezas = est.map((c, i) => {
      const q = ap(Rflat, c.p), w = ap(Wm, q), E0 = eulerDe(entero(mul(Rflat, c.M)));
      return { i, S: { x: o.x + w[0] * U, y: o.y - w[1] * U }, zs: w[2] * U, E0: [E0[0], E0[1] + o.yaw, E0[2]] };
    });
    piezas.sort((a, b) => a.S.x - b.S.x);
    piezas.forEach((c, n) => {
      const h = huecos[Math.min(n, huecos.length - 1)], ys = MESA.y + h.d * MESA.ry * 0.8, i = c.i;
      c.R = { x: h.x, y: ys - 0.5 * Math.cos(PITCH) * U }; c.ys = ys; c.zr = ys - MESA.y;
      c.t0 = T.golpe + 0.03 * hash(i + 11); c.dv = 0.36 + 0.22 * hash(i + 12); c.H = 26 + 46 * hash(i + 13);
      c.db = 0.15; c.hb = 3 + 6 * hash(i + 14); c.bx = (c.R.x - c.S.x) * 0.05;
      // al caer, que enseñe sus pegatinas (si no, la mesa se llena de cubitos negros)
      const giroY = c.E0[1] + (hash(i + 17) - 0.5) * 7, col = CUBITOS[i].col;
      let mejor = null;
      for (let nX = -2; nX <= 2; nX++) for (let nZ = -2; nZ <= 2; nZ++) {
        const Er = [c.E0[0] + nX * Math.PI / 2, giroY, c.E0[2] + nZ * Math.PI / 2], O = mul(VISTA, euler(Er));
        let vis = 0;
        for (let f = 0; f < 6; f++) { if (!col[f] || (i === PEG.i && f === PEG.f)) continue; const n = CARAS[f].n, nz = O[6] * n[0] + O[7] * n[1] + O[8] * n[2]; if (nz > 0.2) vis += 1 + nz; }
        const coste = -vis * 10 + Math.abs(nX) + Math.abs(nZ) + 2 * hash(i * 25 + nX * 5 + nZ + 300);
        if (!mejor || coste < mejor.coste) mejor = { coste, Er };
      }
      c.Er = mejor.Er;
      // destino al montarlo: su sitio en el cubo resuelto, sobre la mesa
      const hp = ap(mul(VISTA, ry(YAW_R)), CUBITOS[i].h), cr = OR.mesa;
      c.T = { x: cr.x + hp[0] * U, y: cr.y - hp[1] * U }; c.zt = hp[2] * U + TR.d; c.hy = CUBITOS[i].h[1];
      const a = cercano(c.Er, [0, YAW_R, 0]), b = cercano(c.Er, [Math.PI, YAW_R + Math.PI, Math.PI]);
      const da = Math.abs(a[0] - c.Er[0]) + Math.abs(a[1] - c.Er[1]) + Math.abs(a[2] - c.Er[2]), db = Math.abs(b[0] - c.Er[0]) + Math.abs(b[1] - c.Er[1]) + Math.abs(b[2] - c.Er[2]);
      c.Et = da <= db ? a : b;
    });
    // orden de montaje: de abajo arriba, de atrás adelante
    const orden = piezas.slice().sort((a, b) => (a.hy - b.hy) || (a.zt - b.zt) || (a.T.x - b.T.x));
    const paso = (T.arma1 - 0.3 - T.arma0) / 26;
    orden.forEach((c, n) => { c.ta = T.arma0 + n * paso; c.da = 0.3; });
    return piezas;
  });
  function posCubito(c, t) {
    let x, y, z, E3;
    const u = t - c.t0;
    if (u < c.dv) {
      const k = clamp(u / c.dv);
      x = lerp(c.S.x, c.R.x, k); y = lerp(c.S.y, c.R.y, k) - c.H * 4 * k * (1 - k); z = lerp(c.zs, c.zr, k) + 30 * Math.sin(Math.PI * k);
      E3 = mezcla3(c.E0, c.Er, salida(k));
    } else {
      const k = clamp((u - c.dv) / c.db);
      x = c.R.x + c.bx * salida(k); y = c.R.y - c.hb * Math.sin(Math.PI * k); z = c.zr; E3 = c.Er;
    }
    let aire = y < c.R.y - 0.5 ? 1 : 0;
    if (t > c.ta) {
      const k = clamp((t - c.ta) / c.da), ks = suave(k);
      x = lerp(x, c.T.x, ks); y = lerp(y, c.T.y, ks) - 22 * Math.sin(Math.PI * k); z = lerp(z, c.zt, ks) + 40 * Math.sin(Math.PI * k);
      E3 = mezcla3(E3, c.Et, ks); aire = 1;
    }
    return { x, y, z, E3, aire };
  }
  function dibCubitos(g, t) {
    const L = ESTALLIDO().map(c => Object.assign(posCubito(c, t), { c }));
    // sombritas de los que están quietos en la mesa
    g.save(); g.fillStyle = "rgba(40,18,6,0.35)";
    for (const q of L) if (!q.aire && t < q.c.ta) { g.beginPath(); g.ellipse(q.x + 1, q.c.ys + 1, 6.5, 2, 0, 0, Math.PI * 2); g.fill(); }
    g.restore();
    L.sort((a, b) => a.z - b.z);
    g.save(); g.lineJoin = "round"; g.lineWidth = 0.16 * U; g.strokeStyle = NEGRO_CUBO;
    for (const q of L) cubito(g, q.x, q.y, CERO, mul(VISTA, euler(q.E3)), q.c.i, U, true, true);
    g.restore();
  }

  /* ================= decorado: bar de juegos de mesa ================= */
  let fondo = null;
  const YPARED = 470;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60); g.lineJoin = "round"; g.lineCap = "round";
    // pared verde azulada con rombos de papel pintado
    const pa = g.createLinearGradient(0, -60, 0, YPARED); pa.addColorStop(0, "#163a40"); pa.addColorStop(1, "#2c646b");
    g.fillStyle = pa; g.fillRect(-40, -60, W + 80, YPARED + 60);
    g.strokeStyle = "rgba(255,255,255,0.05)"; g.lineWidth = 2;
    for (let x = -300; x < W + 340; x += 38) { g.beginPath(); g.moveTo(x, -60); g.lineTo(x + 265, YPARED); g.moveTo(x, -60); g.lineTo(x - 265, YPARED); g.stroke(); }
    // luz cálida de la lámpara sobre la pared
    const halo = g.createRadialGradient(512, 110, 10, 512, 160, 330); halo.addColorStop(0, "rgba(255,214,150,0.32)"); halo.addColorStop(1, "rgba(255,214,150,0)");
    g.fillStyle = halo; g.fillRect(-40, -60, W + 80, YPARED + 60);
    // zócalo de madera con cuarterones
    const yz = 392;
    g.fillStyle = "#57301b"; g.fillRect(-40, yz, W + 80, YPARED - yz);
    for (let x = -40; x < W + 40; x += 72) {
      g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(x + 9, yz + 13, 54, YPARED - yz - 24);
      g.strokeStyle = "rgba(255,200,150,0.18)"; g.lineWidth = 2; g.strokeRect(x + 9, yz + 13, 54, YPARED - yz - 24);
    }
    g.fillStyle = "#7b4a2a"; g.fillRect(-40, yz - 9, W + 80, 11);
    g.strokeStyle = "#2a140a"; g.lineWidth = 2; g.beginPath(); g.moveTo(-40, yz - 9); g.lineTo(W + 40, yz - 9); g.moveTo(-40, yz + 2); g.lineTo(W + 40, yz + 2); g.stroke();
    // estantería llena de juegos (izquierda)
    estanteria(g, 24, 28, 246, 410);
    // letrero de neón con forma de cubo (derecha, arriba)
    neonCubo(g, 905, 110, 58);
    // póster de un marciano de píxeles
    poster(g, 742, 58, 118, 150);
    // pizarra con el desarrollo de un cubo dibujado con tiza
    pizarra(g, 748, 248, 236, 128);
    // lámpara colgante sobre la mesa y su cono de luz
    lampara(g, 512);
    // suelo de tablas en perspectiva
    const fs = g.createLinearGradient(0, YPARED, 0, H + 60); fs.addColorStop(0, "#4a2c18"); fs.addColorStop(1, "#2a170b");
    g.fillStyle = fs; g.fillRect(-40, YPARED, W + 80, H + 60 - YPARED);
    g.strokeStyle = "rgba(10,4,0,0.45)"; g.lineWidth = 1.6;
    for (let j = -14; j <= 14; j++) { g.beginPath(); g.moveTo(512 + j * 40, YPARED); g.lineTo(512 + j * 96, H + 60); g.stroke(); }
    for (let i = 0; i < 6; i++) {
      const y0 = YPARED + (H + 60 - YPARED) * (Math.pow(1.6, i) - 1) / (Math.pow(1.6, 6) - 1), y1 = YPARED + (H + 60 - YPARED) * (Math.pow(1.6, i + 1) - 1) / (Math.pow(1.6, 6) - 1);
      for (let j = -14; j <= 14; j++) {
        if (hash(i * 31 + j) < 0.5) continue;
        const u = (y0 - YPARED) / (H + 60 - YPARED), xa = 512 + j * lerp(40, 96, u), xb = 512 + (j + 1) * lerp(40, 96, u);
        g.beginPath(); g.moveTo(xa, y0); g.lineTo(xb, y0); g.stroke();
      }
      if (i === 0) continue;
      g.fillStyle = "rgba(255,190,120,0.04)"; g.fillRect(-40, y0, W + 80, (y1 - y0) * 0.3);
    }
    const ref = g.createRadialGradient(512, 545, 10, 512, 545, 260); ref.addColorStop(0, "rgba(255,200,130,0.16)"); ref.addColorStop(1, "rgba(255,200,130,0)");
    g.fillStyle = ref; g.fillRect(-40, YPARED, W + 80, H + 60 - YPARED);
    g.fillStyle = "#1c0e06"; g.fillRect(-40, YPARED - 4, W + 80, 6);
    // viñeta
    const vi = g.createRadialGradient(512, 300, 300, 512, 300, 720); vi.addColorStop(0, "rgba(0,0,0,0)"); vi.addColorStop(1, "rgba(5,10,20,0.45)");
    g.fillStyle = vi; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }
  function estanteria(g, x0, y0, w, h) {
    g.save();
    g.fillStyle = "#2a160b"; g.fillRect(x0, y0, w, h);
    g.fillStyle = "rgba(255,200,140,0.05)"; g.fillRect(x0 + 10, y0 + 10, w - 20, h - 20);
    const baldas = 4, alto = (h - 12) / baldas, PAL = ["#c0392b", "#e67e22", "#f1c40f", "#27ae60", "#2980b9", "#8e44ad", "#16a085", "#d35400",
      "#e84393", "#00b894", "#6c5ce7", "#fdcb6e", "#b33939", "#3d7ea6"];
    let n = 0;
    for (let b = 0; b < baldas; b++) {
      const yb = y0 + 10 + (b + 1) * alto;                     // canto de arriba de la balda
      let x = x0 + 14;
      while (x < x0 + w - 24) {
        n++;
        const r = hash(n * 3.7 + b), col = PAL[Math.floor(hash(n * 5.1) * PAL.length)];
        if (r < 0.22 && x < x0 + w - 70) {                      // montón de cajas tumbadas
          let yy = yb, k = 0;
          const ww = 52 + 14 * hash(n + 9);
          while (k < 3 && yy > yb - alto + 30) {
            const hh = 11 + 6 * hash(n * 7 + k), c2 = PAL[Math.floor(hash(n * 11 + k) * PAL.length)], dx = 4 * (hash(n + k) - 0.5);
            g.fillStyle = c2; g.strokeStyle = "#140a05"; g.lineWidth = 2;
            g.fillRect(x + dx, yy - hh, ww, hh); g.strokeRect(x + dx, yy - hh, ww, hh);
            g.fillStyle = "rgba(255,255,255,0.28)"; g.fillRect(x + dx + 6, yy - hh + 3, ww - 12, 2.5);
            yy -= hh; k++;
          }
          if (hash(n + 77) < 0.5) dado(g, x + ww / 2, yy - 7, 12, hash(n + 3));
          else meeple(g, x + ww / 2, yy, PAL[(n + 3) % PAL.length]);
          x += ww + 6;
        } else {                                                 // cajas de pie (lomos)
          const ww = 12 + 13 * hash(n * 1.3), hh = alto - 22 - 26 * hash(n * 2.9);
          g.fillStyle = col; g.strokeStyle = "#140a05"; g.lineWidth = 2;
          g.fillRect(x, yb - hh, ww, hh); g.strokeRect(x, yb - hh, ww, hh);
          g.fillStyle = "rgba(255,255,255,0.22)"; g.fillRect(x + 2.5, yb - hh + 6, ww - 5, 4);
          g.fillStyle = "rgba(0,0,0,0.22)"; g.fillRect(x + ww - 4, yb - hh, 3, hh);
          if (hash(n + 21) < 0.6) {                              // emblema sin letras
            g.fillStyle = hash(n + 22) < 0.5 ? "#fff6d8" : "#1b1b24";
            const cy = yb - hh * 0.5;
            if (hash(n + 23) < 0.5) { g.beginPath(); g.arc(x + ww / 2, cy, ww * 0.26, 0, Math.PI * 2); g.fill(); }
            else { g.beginPath(); g.moveTo(x + ww / 2, cy - ww * 0.32); g.lineTo(x + ww * 0.8, cy); g.lineTo(x + ww / 2, cy + ww * 0.32); g.lineTo(x + ww * 0.2, cy); g.closePath(); g.fill(); }
          }
          x += ww + 1.5;
        }
      }
      // balda
      g.fillStyle = "#6e4126"; g.fillRect(x0 + 6, yb, w - 12, 9);
      g.fillStyle = "rgba(255,220,180,0.25)"; g.fillRect(x0 + 6, yb, w - 12, 2);
      g.fillStyle = "rgba(0,0,0,0.3)"; g.fillRect(x0 + 6, yb + 9, w - 12, 4);
    }
    // laterales
    g.fillStyle = "#6e4126"; g.fillRect(x0, y0, 11, h); g.fillRect(x0 + w - 11, y0, 11, h); g.fillRect(x0, y0, w, 11);
    g.strokeStyle = "#140a05"; g.lineWidth = 2.5; g.strokeRect(x0, y0, w, h);
    g.restore();
  }
  function dado(g, x, y, s, r) {
    g.save(); g.fillStyle = "#f7f3ea"; g.strokeStyle = "#140a05"; g.lineWidth = 1.6;
    g.beginPath(); g.rect(x - s / 2, y - s / 2, s, s); g.fill(); g.stroke();
    g.fillStyle = "#c0392b"; const pts = r < 0.5 ? [[0, 0]] : [[-0.25, -0.25], [0.25, 0.25], [0, 0]];
    for (const [a, b] of pts) { g.beginPath(); g.arc(x + a * s, y + b * s, 1.5, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  function meeple(g, x, y, col) {
    g.save(); g.fillStyle = col; g.strokeStyle = "#140a05"; g.lineWidth = 1.6;
    g.beginPath(); g.arc(x, y - 17, 4, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(x - 9, y - 9); g.lineTo(x + 9, y - 9); g.lineTo(x + 7, y - 6); g.lineTo(x + 3, y - 7); g.lineTo(x + 6, y); g.lineTo(x - 6, y); g.lineTo(x - 3, y - 7); g.lineTo(x - 7, y - 6); g.closePath();
    g.fill(); g.stroke(); g.restore();
  }
  function neonCubo(g, cx, cy, r) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const hal = g.createRadialGradient(cx, cy, 10, cx, cy, r * 2); hal.addColorStop(0, "rgba(255,90,220,0.22)"); hal.addColorStop(1, "rgba(255,90,220,0)");
    g.fillStyle = hal; g.fillRect(cx - r * 2, cy - r * 2, r * 4, r * 4);
    const P = a => ({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
    const v = [0, 1, 2, 3, 4, 5].map(i => P(-Math.PI / 2 + i * Math.PI / 3));
    const caras = [[{ x: cx, y: cy }, v[5], v[0], v[1]], [{ x: cx, y: cy }, v[1], v[2], v[3]], [{ x: cx, y: cy }, v[3], v[4], v[5]]];
    const tubo = (col, ancho) => {
      g.strokeStyle = col; g.lineWidth = ancho;
      g.beginPath(); v.forEach((q, i) => i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); g.closePath(); g.stroke();
      g.beginPath(); for (const i of [1, 3, 5]) { g.moveTo(cx, cy); g.lineTo(v[i].x, v[i].y); } g.stroke();
    };
    const rejilla = (col, ancho) => {
      g.strokeStyle = col; g.lineWidth = ancho; g.beginPath();
      for (const [o, a, b, c2] of caras) for (const k of [1 / 3, 2 / 3]) {
        g.moveTo(lerp(o.x, a.x, k), lerp(o.y, a.y, k)); g.lineTo(lerp(c2.x, b.x, k), lerp(c2.y, b.y, k));
        g.moveTo(lerp(o.x, c2.x, k), lerp(o.y, c2.y, k)); g.lineTo(lerp(a.x, b.x, k), lerp(a.y, b.y, k));
      }
      g.stroke();
    };
    g.shadowColor = "#ff3fd0"; g.shadowBlur = 16; tubo("#ff5fd8", 5); g.shadowBlur = 0; tubo("#ffe0f7", 1.8);
    g.shadowColor = "#3ff0ff"; g.shadowBlur = 12; rejilla("#4ff3ff", 3); g.shadowBlur = 0; rejilla("#e0fdff", 1.1);
    g.restore();
  }
  function poster(g, x, y, w, h) {
    g.save();
    g.fillStyle = "rgba(0,0,0,0.3)"; g.fillRect(x + 6, y + 6, w, h);
    g.fillStyle = "#121a2c"; g.fillRect(x, y, w, h);
    g.strokeStyle = "#0a0a10"; g.lineWidth = 6; g.strokeRect(x, y, w, h);
    g.strokeStyle = "#c9a04a"; g.lineWidth = 2; g.strokeRect(x + 5, y + 5, w - 10, h - 10);
    const INV = ["00100000100", "00010001000", "00111111100", "01101110110", "11111111111", "10111111101", "10100000101", "00011011000"];
    const px = 8, ox = x + (w - 11 * px) / 2, oy = y + 34;
    g.shadowColor = "#5dff7a"; g.shadowBlur = 8; g.fillStyle = "#6dff86";
    INV.forEach((fila, j) => { for (let i = 0; i < 11; i++) if (fila[i] === "1") g.fillRect(ox + i * px, oy + j * px, px - 1, px - 1); });
    g.shadowBlur = 0;
    g.fillStyle = "#ffe066";
    for (let i = 0; i < 14; i++) g.fillRect(x + 12 + hash(i + 90) * (w - 24), y + 12 + hash(i + 91) * (h - 24), 2, 2);
    g.fillStyle = "#ff5f7a"; for (let i = 0; i < 5; i++) g.fillRect(x + 22 + i * 16, y + h - 30, 10, 6);           // barricadas de píxeles
    g.restore();
  }
  function pizarra(g, x, y, w, h) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.fillStyle = "rgba(0,0,0,0.3)"; g.fillRect(x + 5, y + 6, w, h);
    g.fillStyle = "#6b4426"; g.fillRect(x - 8, y - 8, w + 16, h + 16);
    g.fillStyle = "#24332d"; g.fillRect(x, y, w, h);
    g.fillStyle = "rgba(255,255,255,0.05)"; g.fillRect(x + 10, y + 10, w * 0.6, h * 0.5);
    // desarrollo del cubo (una cruz de seis caras con su cuadrícula)
    const s = 22, ox = x + 26, oy = y + 18;
    const caras = [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]];
    g.strokeStyle = "rgba(240,240,230,0.8)"; g.lineWidth = 2;
    for (const [i, j] of caras) {
      g.strokeRect(ox + i * s * 1.05, oy + j * s * 1.05, s, s);
      g.lineWidth = 0.9; g.beginPath();
      for (const k of [1 / 3, 2 / 3]) { g.moveTo(ox + i * s * 1.05 + k * s, oy + j * s * 1.05); g.lineTo(ox + i * s * 1.05 + k * s, oy + j * s * 1.05 + s);
        g.moveTo(ox + i * s * 1.05, oy + j * s * 1.05 + k * s); g.lineTo(ox + i * s * 1.05 + s, oy + j * s * 1.05 + k * s); }
      g.stroke(); g.lineWidth = 2;
    }
    // flechas de giro y un cubito en perspectiva
    g.strokeStyle = "rgba(255,230,140,0.85)"; g.lineWidth = 2.2;
    g.beginPath(); g.arc(x + 175, y + 46, 20, -2.6, 0.9); g.stroke();
    g.beginPath(); g.moveTo(x + 188, y + 61); g.lineTo(x + 187, y + 52); g.moveTo(x + 188, y + 61); g.lineTo(x + 179, y + 60); g.stroke();
    g.strokeStyle = "rgba(140,220,255,0.8)";
    const cx = x + 180, cy = y + 98, r = 18;
    g.beginPath(); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + i * Math.PI / 3; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath();
    g.moveTo(cx, cy); g.lineTo(cx, cy + r); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(-Math.PI / 6) * r, cy + Math.sin(-Math.PI / 6) * r);
    g.moveTo(cx, cy); g.lineTo(cx + Math.cos(-5 * Math.PI / 6) * r, cy + Math.sin(-5 * Math.PI / 6) * r); g.stroke();
    // repisa con tizas
    g.fillStyle = "#57381f"; g.fillRect(x - 4, y + h + 6, w + 8, 6);
    g.fillStyle = "#f2f0e6"; g.fillRect(x + 30, y + h + 2, 14, 4); g.fillStyle = "#ffd56b"; g.fillRect(x + 60, y + h + 2, 10, 4);
    g.restore();
  }
  function lampara(g, x) {
    g.save(); g.lineJoin = "round";
    // cono de luz hasta la mesa
    const cono = g.createLinearGradient(0, 86, 0, MESA.y);
    cono.addColorStop(0, "rgba(255,226,160,0.2)"); cono.addColorStop(1, "rgba(255,226,160,0.02)");
    g.fillStyle = cono; g.beginPath(); g.moveTo(x - 30, 86); g.lineTo(x + 30, 86); g.lineTo(x + 128, MESA.y); g.lineTo(x - 128, MESA.y); g.closePath(); g.fill();
    // cable y pantalla esmaltada
    g.strokeStyle = "#0d0d0f"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x, -60); g.lineTo(x, 50); g.stroke();
    g.fillStyle = "#1f5a3a"; g.strokeStyle = "#08130c"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(x - 10, 48); g.lineTo(x + 10, 48); g.lineTo(x + 38, 84); g.lineTo(x - 38, 84); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.22)"; g.beginPath(); g.moveTo(x - 6, 52); g.lineTo(x - 2, 52); g.lineTo(x - 22, 80); g.lineTo(x - 28, 80); g.closePath(); g.fill();
    const bo = g.createRadialGradient(x, 86, 2, x, 86, 40); bo.addColorStop(0, "rgba(255,248,215,1)"); bo.addColorStop(0.3, "rgba(255,226,160,0.7)"); bo.addColorStop(1, "rgba(255,226,160,0)");
    g.fillStyle = bo; g.beginPath(); g.arc(x, 86, 40, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fff8e0"; g.beginPath(); g.ellipse(x, 85, 12, 5, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // mesa alta redonda (se dibuja cada fotograma: da un saltito con el golpe)
  function mesa(g, t) {
    const { x, rx: rX, ry: rY, canto } = MESA, y = MESA.y - 3 * campana(t, T.golpe, T.golpe + 0.12);
    g.save(); g.lineJoin = "round";
    g.fillStyle = "rgba(10,4,0,0.4)"; g.beginPath(); g.ellipse(x, SUELO + 1, 56, 8, 0, 0, Math.PI * 2); g.fill();
    // pie y base de hierro
    g.fillStyle = "#16161a"; g.beginPath(); g.ellipse(x, SUELO - 4, 44, 7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#2c2c33"; g.beginPath(); g.ellipse(x, SUELO - 6, 40, 5.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#16161a"; g.fillRect(x - 7, y + canto, 14, SUELO - 8 - y - canto);
    g.fillStyle = "#3a3a44"; g.fillRect(x - 4, y + canto, 3, SUELO - 8 - y - canto);
    g.fillStyle = "#16161a"; g.beginPath(); g.ellipse(x, y + canto + 4, 22, 5, 0, 0, Math.PI * 2); g.fill();
    // canto del tablero
    g.fillStyle = "#3a1d0d"; g.beginPath(); g.ellipse(x, y + canto, rX, rY, 0, 0, Math.PI); g.lineTo(x - rX, y); g.ellipse(x, y, rX, rY, 0, Math.PI, 0, true); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.stroke();
    g.fillStyle = "rgba(255,190,120,0.18)"; g.fillRect(x - rX + 8, y + 3, rX * 2 - 16, 2);
    // tablero con vetas y la luz de la lámpara
    const tb = g.createLinearGradient(0, y - rY, 0, y + rY); tb.addColorStop(0, "#6a3a1c"); tb.addColorStop(1, "#8a5128");
    g.fillStyle = tb; g.beginPath(); g.ellipse(x, y, rX, rY, 0, 0, Math.PI * 2); g.fill();
    const lz = g.createRadialGradient(x, y, 4, x, y, rX); lz.addColorStop(0, "rgba(255,220,150,0.45)"); lz.addColorStop(1, "rgba(255,220,150,0)");
    g.fillStyle = lz; g.beginPath(); g.ellipse(x, y, rX, rY, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(50,20,5,0.35)"; g.lineWidth = 1.2;
    for (const k of [0.35, 0.6, 0.85]) { g.beginPath(); g.ellipse(x + 6, y, rX * k, rY * k, 0, 0.3, 2.6); g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.ellipse(x, y, rX, rY, 0, 0, Math.PI * 2); g.stroke();
    g.restore();
  }
  function sombraCubo(g, x, y, k = 1) { g.save(); g.fillStyle = `rgba(40,18,6,${0.4 * k})`; g.beginPath(); g.ellipse(x + 2, y + 1, 19, 4.5, 0, 0, Math.PI * 2); g.fill(); g.restore(); }

  /* ================= Guillermo ================= */
  const CG = {
    mira: E({ mx: 0.9, my: 0.35, sonr: 0.3, ancho: 0.95 }),
    esceptico: E({ mx: 0.9, my: 0.3, sonr: 0.5, ancho: 0.95, sd: 16, gd: 0.14, si: -3, gi: -0.06 }),
    pasma: E({ mx: 0.9, my: 0.3, abre: 30, ancho: 0.62, sonr: -0.1, sd: 24, si: 24, gd: 0.05, gi: 0.05, iris: 0.82 }),
    decidido: E({ mx: 0.6, my: 0.6, sonr: -0.1, ancho: 0.8, sd: -8, si: -8, gd: -0.2, gi: -0.2 }),
    coge: E({ mx: 0.6, my: 0.7, sonr: 0.15, ancho: 0.85, sd: -4, si: -4, gd: -0.1, gi: -0.1 }),
    chulo: E({ mx: -0.85, my: -0.05, sonr: 0.68, ancho: 0.95, sd: 14, gd: 0.14, si: -2, gi: -0.05 }),
    concentra: E({ mx: 0.45, my: 0.6, sonr: 0.05, ancho: 0.7, abre: 7, lengua: 1, sd: -5, si: 3, gd: -0.12, gi: 0.05 }),
    lio: E({ mx: 0.4, my: 0.55, sonr: -0.25, ancho: 0.75, abre: 6, sd: 20, gd: 0.22, si: -8, gi: -0.15, iris: 0.9 }),
    agonia: E({ mx: 0.45, my: 0.5, c: 0.2, sonr: -0.6, ancho: 1.05, abre: 16, sd: -12, si: -12, gd: -0.32, gi: -0.32 }),
    mareo: E({ mx: 0, my: 0, sonr: -0.3, ancho: 0.8, abre: 10, sd: 10, si: 10, esp: 1 }),
    bizco: E({ mx: 0.35, my: 0.55, iris: 0.9, sonr: -0.2, ancho: 0.7, abre: 4, sd: 6, si: 6 }),
    picaro: E({ mx: 0.4, my: 0.5, sonr: 0.7, ancho: 0.95, sd: 12, gd: 0.18, si: -6, gi: -0.12 }),
    molesto: E({ mx: 0.35, my: 0.75, sonr: -0.35, ancho: 0.8, abre: 9, sd: 6, si: 16, gd: 0.05, gi: 0.22 }),
    tonk: E({ mx: -0.55, my: 0.8, c: 0.3, sonr: -0.3, abre: 7, ancho: 0.7, sd: 18, si: 18, gd: 0.1, gi: 0.1 }),
    rabia: E({ mx: 0.6, my: 0.5, c: 0.15, sonr: -0.55, ancho: 1.1, abre: 20, sd: -18, si: -18, gd: -0.36, gi: -0.36 }),
    grito: E({ mx: 0.6, my: 0.7, c: 0.3, sonr: -0.4, ancho: 1.1, abre: 36, sd: -20, si: -20, gd: -0.36, gi: -0.36 }),
    jadea: E({ mx: 0.6, my: 0.7, c: 0.3, sonr: -0.2, ancho: 0.85, abre: 16, sd: -6, si: -6, gd: -0.1, gi: -0.1 }),
    asombro: E({ mx: 0.85, my: 0.55, abre: 24, ancho: 0.6, sonr: 0, sd: 24, si: 24, iris: 0.85 }),
    ilusion: E({ mx: 0.85, my: 0.4, sonr: 0.8, ancho: 1, abre: 10, sd: 18, si: 18, gd: 0.15, gi: 0.15, iris: 1.1 }),
    abrazo: E({ mx: 0.5, my: 0.5, c: 0.9, h: 1, sonr: 0.85, ancho: 0.95, abre: 4, rub: 0.65, sd: 14, si: 14, gd: 0.22, gi: 0.22 })
  };
  const GUION_CG = [
    [0.55, 0.8, "esceptico"], [1.75, 3.1, "pasma"], [T.click + 0.12, T.click + 0.3, "decidido"], [T.gToma0 - 0.1, T.gToma0 + 0.15, "coge"],
    [T.chulo, T.chulo + 0.15, "chulo"], [T.chulo1, T.chulo1 + 0.15, "concentra"], [6.3, 6.45, "lio"], [6.9, 7.0, "agonia"],
    [7.38, 7.46, "mareo"], [T.cara1 - 0.1, T.cara1, "bizco"], [T.idea, T.idea + 0.15, "picaro"], [T.despega0, T.despega0 + 0.1, "concentra"],
    [T.pegado0, T.pegado0 + 0.12, "molesto"], [T.frente - 0.02, T.frente + 0.06, "tonk"], [T.rabia0 - 0.02, T.rabia0 + 0.15, "rabia"],
    [T.golpe - 0.08, T.golpe, "grito"], [T.golpe + 0.2, T.golpe + 0.45, "jadea"], [T.dSaca1 - 0.1, T.dSaca1 + 0.2, "asombro"],
    [T.dSube0, T.dSube0 + 0.25, "ilusion"], [T.abrazo0 + 0.1, T.abrazo1, "abrazo"]
  ];
  const PARP_G = [0.3, 1.5, T.click + 0.02, 4.9, 5.95, T.chulo1 - 0.08, 8.2, T.golpe + 0.6, 11.2, 12.1];

  const P0G = { dx: 0, pel: 0, torso: 0, cab: 0 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    quieto: CuG({ cab: 0.02 }),
    inclina: CuG({ torso: 0.05, cab: 0.05, dx: 3 }),
    pasma: CuG({ torso: -0.03, cab: -0.04, pel: 4 }),
    coge: CuG({ torso: 0.1, cab: 0.1, pel: 8, dx: 5 }),
    chulo: CuG({ torso: -0.05, cab: -0.06 }),
    concentra: CuG({ torso: 0.06, cab: 0.12, pel: 4 }),
    lio: CuG({ torso: 0.03, cab: -0.07, pel: 4 }),
    agonia: CuG({ torso: 0.12, cab: 0.14, pel: 16 }),
    cara: CuG({ torso: 0.03, cab: 0.1, pel: 6 }),
    rabia: CuG({ torso: -0.1, cab: -0.08, pel: -4, dx: -3 }),
    golpe: CuG({ torso: 0.16, cab: 0.12, pel: 22, dx: 9 }),
    jadea: CuG({ torso: 0.12, cab: 0.08, pel: 16, dx: 7 }),
    mira: CuG({ torso: 0.03, cab: 0.04, pel: 6, dx: 3 }),
    recibe: CuG({ torso: 0.08, cab: 0.05, pel: 4, dx: 6 }),
    abrazo: CuG({ torso: -0.04, cab: 0.15, pel: 6 })
  };
  const GUION_G = [
    [1.6, 2.2, "inclina"], [2.5, 3.0, "pasma"], [T.gToma0 - 0.05, T.gToma1, "coge"], [T.gSube0, T.chulo, "quieto"],
    [T.chulo, T.chulo + 0.25, "chulo"], [T.chulo1, T.chulo1 + 0.3, "concentra"], [6.3, 6.5, "lio"], [6.9, 7.1, "agonia"],
    [T.cara0, T.cara1, "cara"], [T.rabia0, T.rabia1, "rabia", salida], [T.rabia1 + 0.03, T.golpe, "golpe", entrada],
    [T.golpe + 0.15, T.golpe + 0.5, "jadea"], [T.dSaca0, T.dSaca1 + 0.2, "mira"], [T.gAlc0, T.gAlc1, "recibe"], [T.abrazo0, T.abrazo1, "abrazo"]
  ];
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const PIES_G = { cerca: XG - 30, lejos: XG + 32 };
  const MESA_PALMA = { x: XG + 104, y: MESA.y - 5 };

  // mano lejana (la de la derecha de la pantalla): coge el cubo, lo sujeta por la derecha, lo estampa
  const PISTA_GL = [
    [0, 0, { bols: true }],
    [T.gToma0, T.gToma1, { cubo: "g", dx: 2, dy: -ARRIBA, mu: -1.75, dedos: AGARRA_A }],
    [T.gLado0, T.gLado1, { cubo: "g", dx: LADO, dy: 2, mu: 0.6, dedos: AGARRA }],
    [T.golpe, T.golpe + 0.1, { pant: MESA_PALMA, mu: Math.PI - 0.25, dedos: PALMA }, salida],
    [T.dSaca0, T.dSaca0 + 0.4, { hom: { x: 18, y: 262 }, mu: -1.75, dedos: RELAJ }],
    [T.gAlc0, T.gAlc1, { cubo: "r", dx: -LADO, dy: 3, mu: 2.7, dedos: AGARRA }],
    [T.abrazo0 + 0.05, T.abrazo1, { cubo: "r", dx: 15, dy: 4, mu: 0.45, dedos: D(0.5, 0.55, 0.5, 0.45) }]
  ];
  // mano cercana: se une al cubo por la izquierda, despega la pegatina, la sacude, puño de rabia, abrazo
  const PISTA_GC = [
    [0, 0, { bols: true }],
    [T.gJunta0, T.gJunta1, { cubo: "g", dx: -LADO, dy: 3, mu: 2.55, dedos: AGARRA }],
    [T.pinza0, T.pinza1, { peg: 0, mu: 2.75, dedos: PINZA }],
    [T.despega0, T.despega1, { peg: 1, mu: 2.75, dedos: PINZA }],
    [T.sacude0, T.sacude0 + 0.14, { pant: { x: XG + 40, y: 266 }, mu: 2.2, dedos: PINZA }],
    [T.vuela - 0.02, T.vuela + 0.1, { pant: { x: XG + 32, y: 256 }, mu: 1.7, dedos: PALMA }],
    [T.rabia0, T.rabia0 + 0.22, { hom: { x: 40, y: 255 }, mu: -1.75, dedos: PUNO }],
    [T.golpe + 0.45, T.golpe + 0.85, { hom: { x: 18, y: 270 }, mu: -1.75, dedos: RELAJ }],
    [T.abrazo0 + 0.12, T.abrazo1, { cubo: "r", dx: -18, dy: 6, mu: 2.6, dedos: AGARRA }]
  ];

  function temblor(t) {
    return 1.1 * tramo(t, 6.86, 6.95) * (1 - tramo(t, 7.42, 7.56)) + 1.6 * tramo(t, T.rabia0, T.rabia0 + 0.1) * (1 - tramo(t, T.golpe - 0.05, T.golpe));
  }
  function poseG(t) {
    const b = linea(GUION_G, CUER_G, "quieto", t);
    const respira = Math.sin(t * 2.2 + 0.3);
    const jad = campana(t, T.golpe + 0.15, T.dSaca0 + 0.3);                     // jadea tras el golpe
    const tb = temblor(t), sx = tb * ruido(t * 38), sy = tb * 0.6 * ruido(t * 41 + 7);
    const sw = tramo(t, T.abrazo1, T.abrazo1 + 0.25);                           // balanceo abrazando
    const x = XG + b.dx + sx + 2.5 * sw * Math.sin((t - T.abrazo1) * 5);
    const p = {
      x, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 + sy / S + 6 * jad * Math.sin(t * 15) },
      torso: b.torso + 0.015 * tb * ruido(t * 33 + 3) + 0.03 * sw * Math.sin((t - T.abrazo1) * 5 + 0.5),
      torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.012 * jad * Math.sin(t * 15) },
      piernas: {}, cabeza: { ang: b.cab + 0.02 * tb * ruido(t * 36 + 11), dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      tirasLimpias: true, ikContinuo: true
    };
    // mareo: la cabeza da vueltecitas; golpe de la pegatina: cabezazo atrás; abrazo: mece la cabeza
    const mar = campana(t, 7.34, 7.62);
    p.cabeza.ang += 0.07 * mar * Math.sin((t - 7.34) * 18); p.cabeza.dx += 10 * mar * Math.cos((t - 7.34) * 18);
    p.cabeza.ang -= 0.1 * campana(t, T.frente, T.frente + 0.25);
    p.cabeza.ang += 0.05 * sw * Math.sin((t - T.abrazo1) * 5 + 1);
    for (const lado of ["cerca", "lejos"]) {
      const rod = lado === "cerca" ? 1 : -1;
      p.piernas[lado] = { tob: { x: G.PELVIS.x + (PIES_G[lado] - x) / S + rod * 3 * tb * ruido(t * 30 + (rod > 0 ? 1 : 5)), y: TOB_G[lado] }, ang: 0 };
    }
    // cara
    const e = linea(GUION_CG, CG, "mira", t);
    e.abre += 6 * jad * Math.max(0, Math.sin(t * 15));
    p.cara = cara(e, e.esp > 0.5 || e.h > 0.5 ? 0 : parpadeo(t, PARP_G));
    p.rojo = 0.35 * tramo(t, 6.9, 7.1) * (1 - tramo(t, T.cara0, T.cara1)) + 0.85 * tramo(t, T.rabia0, T.rabia0 + 0.2) * (1 - tramo(t, T.golpe + 0.3, T.dSaca0 + 0.3));
    p.sudor = 0.9 * tramo(t, 6.45, 6.9) * (1 - tramo(t, T.dSaca1, T.dSaca1 + 0.6)) + 0.4 * campana(t, T.dSaca1, T.gAlc0);
    p.enfado = tramo(t, T.rabia0, T.rabia0 + 0.15) * (1 - tramo(t, T.golpe + 0.4, T.golpe + 0.8));
    p.capaCabeza = g => pegFrente(g, t);
    // manos
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    const resuelve = lado => o => {
      if (o.bols) { const q = Tr(BOLS_G[lado]); return { x: q.x, y: q.y, mu: -1.75, ang: 0, puno: 0, dedos: D(0.4, 0.4, 0.4, 0.4) }; }
      if (o.hom) { const h = lado === "l" ? hl : hc; return { x: h.x + o.hom.x, y: h.y + o.hom.y, mu: o.mu, ang: 0, puno: 1, dedos: o.dedos }; }
      let q;
      if (o.cubo) { const c = estadoCubo(o.cubo, t); q = { x: c.x + o.dx, y: c.y + o.dy }; }
      else if (o.peg !== undefined) { const pt = puntaPeg(t, o.peg), of = offPunta(o.mu); q = { x: pt.x - of.x, y: pt.y - of.y }; }
      else q = o.pant;
      const h = G.aHoja(p, q);
      return { x: h.x, y: h.y, mu: o.mu, ang: 0, puno: 1, dedos: o.dedos };
    };
    const L = pista(PISTA_GL, t, resuelve("l")), C = pista(PISTA_GC, t, resuelve("c"));
    // al girar una capa, las muñecas acompañan; temblores; sacudir la mano de la pegatina
    const s = cuboG(t);
    if (s.giro && t < T.cara0) { const k = Math.abs(Math.sin(s.giro.ang * 2)); L.y -= 4 * k; C.y += 3 * k; L.ang = 0.2 * Math.sin(s.giro.ang); }
    const sac = tramo(t, T.sacude0, T.sacude0 + 0.08) * (1 - tramo(t, T.vuela - 0.04, T.vuela));
    C.x += 7 * sac * Math.sin((t - T.sacude0) * 2 * Math.PI * 8.5) / S; C.y += 4 * sac * Math.sin((t - T.sacude0) * 2 * Math.PI * 8.5 + 1.3) / S;
    L.x += 0.8 * tb * ruido(t * 47 + 2) / S; C.x += 0.8 * tb * ruido(t * 44 + 4) / S;
    const jm = campana(t, T.golpe + 0.1, T.dSaca0 + 0.2);                                         // la mano en la mesa tiembla
    L.x += 1.2 * jm * ruido(t * 30) / S;
    p.manoCerca = { x: C.x, y: C.y, ang: C.ang, mu: C.mu, dobla: -1, puno: C.puno, dedos: C.dedos };
    p.manoLejos = { x: L.x, y: L.y, ang: L.ang, mu: L.mu, dobla: -1, puno: L.puno, dedos: L.dedos };
    const cs = G.aPantalla(p, C), of = offPunta(C.mu);
    p._tip = { x: cs.x + of.x, y: cs.y + of.y };
    // objetos en las manos (en pantalla, debajo de los dedos)
    const objL = [], objC = [];
    if (t >= T.gToma1 && t < T.golpe) objL.push(g => dibujaG(g, t));
    if (t >= T.entregaG) objL.push(g => dibujaR(g, t));
    if (t >= T.despega0 && t < T.despega1) objC.push(g => pegatinaMano(g, t, p._tip));
    const conM = l => g => { if (!MATRIZ) return; g.save(); g.setTransform(MATRIZ); for (const f of l) f(g); g.restore(); };
    if (objL.length) p.manoLejos.objeto = conM(objL);
    if (objC.length) p.manoCerca.objeto = conM(objC);
    return p;
  }

  /* ================= Dari ================= */
  const CD = {
    cubo: E({ mx: 0.6, my: 0.8, sonr: 0.22, ancho: 0.85 }),
    gira: E({ mx: 0.5, my: 0.8, sonr: 0.3, ancho: 0.85, sd: 6, si: 2 }),
    listo: E({ mx: 0.95, my: 0.1, c: 0.2, sonr: 0.45, ancho: 0.85, sd: 4, si: 10, gi: 0.1 }),
    foco: E({ mx: 0.55, my: 0.85, c: 0.25, sonr: 0.12, ancho: 0.8, sd: -3, si: -3 }),
    sufi: E({ mx: 0.95, my: 0.1, c: 0.3, sonr: 0.55, ancho: 0.9, sd: 6, si: 14, gd: 0.04, gi: 0.12 }),
    mesa: E({ mx: 0.7, my: 0.85, sonr: 0.3, ancho: 0.85 }),
    seco: E({ mx: 0.95, my: 0.25, c: 0.35, sonr: 0.12, ancho: 0.8, sd: 2, si: 6 }),
    ceja: E({ mx: 0.95, my: 0.3, c: 0.25, sonr: 0.05, ancho: 0.75, sd: 0, si: 18, gi: 0.15 }),
    susto: E({ mx: 0.95, my: 0.35, sonr: 0, abre: 8, ancho: 0.6, sd: 16, si: 16, iris: 0.9 }),
    suspiro: E({ mx: 0.8, my: 0.6, c: 0.75, sonr: 0.05, ancho: 0.8, abre: 3, sd: 4, si: 4 }),
    piezas: E({ mx: 0.85, my: 0.85, c: 0.3, sonr: 0.18, ancho: 0.85 }),
    amable: E({ mx: 0.95, my: 0.2, c: 0.15, sonr: 0.5, ancho: 0.9, sd: 8, si: 8, gd: 0.08, gi: 0.08 }),
    sonrisa: E({ mx: 0.95, my: 0.15, c: 0.3, sonr: 0.65, ancho: 0.95, sd: 8, si: 14, gi: 0.1 })
  };
  const GUION_CD = [
    [T.examina, T.examina + 0.2, "gira"], [T.brillo1 - 0.15, T.brillo1, "listo"], [T.r0 - 0.08, T.r0 + 0.05, "foco"],
    [T.r1, T.r1 + 0.12, "sufi"], [T.baja0, T.baja0 + 0.15, "mesa"], [T.click + 0.1, T.click + 0.25, "sufi"],
    [T.gToma0 + 0.2, T.gToma0 + 0.4, "seco"], [6.9, 7.1, "ceja"], [T.pegado0, T.pegado0 + 0.2, "seco"], [T.frente, T.frente + 0.1, "ceja"],
    [T.golpe + 0.02, T.golpe + 0.1, "susto"], [T.suspiro0, T.suspiro0 + 0.25, "suspiro"], [T.dSaca0, T.dSaca0 + 0.2, "piezas"],
    [T.dSube0, T.dSube0 + 0.2, "amable"], [T.abrazo1, T.abrazo1 + 0.2, "sonrisa"]
  ];
  const PARP_D = [0.25, 2.0, T.click + 0.35, 5.6, 7.0, 8.0, T.golpe + 0.03, 10.9, 11.6, 12.3];
  const P0D = { dx: 0, pel: 0, torso: 0.02, cab: 0.06 };
  const CuD = o => Object.assign({}, P0D, o);
  const CUER_D = {
    cubo: CuD({ torso: 0.03, cab: 0.12 }),
    erguido: CuD({ torso: 0.0, cab: 0.03 }),
    foco: CuD({ torso: 0.05, cab: 0.16, pel: 3 }),
    muestra: CuD({ torso: -0.03, cab: -0.02 }),
    deja: CuD({ torso: 0.06, cab: 0.12, dx: -2, pel: 3 }),
    mira: CuD({ torso: 0.01, cab: 0.04 }),
    susto: CuD({ torso: -0.05, cab: -0.06, dx: 3 }),
    arma: CuD({ torso: 0.06, cab: 0.15, dx: -4, pel: 4 }),
    da: CuD({ torso: 0.04, cab: 0.06, dx: -2, pel: 2 }),
    final: CuD({ torso: 0.0, cab: 0.03 })
  };
  const GUION_D = [
    [T.brillo1 - 0.2, T.brillo1, "erguido"], [T.r0 - 0.1, T.r0 + 0.1, "foco"], [T.r1, T.r1 + 0.2, "muestra"],
    [T.baja0, T.click, "deja"], [T.click + 0.15, T.click + 0.5, "mira"],
    [T.golpe + 0.02, T.golpe + 0.12, "susto", salida], [T.golpe + 0.3, T.golpe + 0.7, "mira"],
    [T.dSaca0, T.arma0, "arma"], [T.dSube0, T.dSube1, "da"], [T.dSuelta0, T.dSuelta1 + 0.2, "final"]
  ];
  const PIES_D = { cerca: XD + 22, lejos: XD - 26 };
  const ENCIMA_R = () => ({ x: TR.x + 3, y: cyM(TR.d) - 34 });                     // la mano flota sobre el cubo que se monta
  // mano lejana de Dari (la de la izquierda de la pantalla); mu en ángulo de pantalla
  const PISTA_DL = [
    [0, 0, { cubo: "d", dx: -LADO, dy: 2, mu: Math.PI - 0.6, dedos: AGARRA }],
    [T.click + 0.12, T.click + 0.5, { bols: true, lado: "lejos" }],
    [T.dSaca0, T.dSaca1, { pant: ENCIMA_R(), mu: -Math.PI / 2 + 0.2, dedos: RELAJ }],
    [T.dCoge0, T.dCoge1, { cubo: "r", dx: LADO, dy: 2, mu: 0.6, dedos: AGARRA }],
    [T.dSuelta0, T.dSuelta1, { bols: true, lado: "lejos" }]
  ];
  const PISTA_DC = [
    [0, 0, { cubo: "d", dx: LADO, dy: 2, mu: 0.6, dedos: AGARRA }],
    [T.dTop0, T.dCerca1, { bols: true, lado: "cerca" }]
  ];
  // borrón de los dedos: cuánto (0–1) y cómo se mueven
  const borronSolve = t => tramo(t, T.r0 - 0.06, T.r0 + 0.04) * (1 - tramo(t, T.r1 - 0.04, T.r1 + 0.06));
  const borronArma = t => tramo(t, T.arma0 - 0.06, T.arma0 + 0.06) * (1 - tramo(t, T.arma1 - 0.2, T.arma1 - 0.02));
  const flick = (t, ph) => D(0.2 + 0.6 * (0.5 + 0.5 * Math.sin(t * 47 + ph)), 0.2 + 0.7 * (0.5 + 0.5 * Math.sin(t * 53 + ph + 1)),
    0.2 + 0.7 * (0.5 + 0.5 * Math.sin(t * 41 + ph + 2)), 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(t * 59 + ph + 3)));

  function poseD(t) {
    const b = linea(GUION_D, CUER_D, "cubo", t);
    const respira = Math.sin(t * 2.0 + 1.1), sus = campana(t, T.suspiro0, T.suspiro1);
    const x = XD + b.dx;
    const p = {
      x, suelo: SUELO, s: S, espejo: true,
      pelvis: { x: Da.PELVIS.x, y: Da.PELVIS.y + b.pel + respira * 1.1 + 5 * sus },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 - 0.012 * sus },
      piernas: {}, cabeza: { ang: b.cab - 0.04 * sus, dx: 0, dy: 0, esc: { x: 1, y: 1 } }, tirasLimpias: true, ikContinuo: true
    };
    p.cabeza.ang += 0.05 * campana(t, T.brillo1 - 0.1, T.brillo1 + 0.25);                     // asiente: «vamos»
    const ty = Da.SUELO - Da.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: Da.aHoja(p, { x: PIES_D.cerca, y: 0 }).x, y: ty }, ang: 0 };
    p.piernas.lejos = { tob: { x: Da.aHoja(p, { x: PIES_D.lejos, y: 0 }).x, y: ty - 8 }, ang: 0 };
    const e = linea(GUION_CD, CD, "cubo", t);
    p.cara = cara(e, parpadeo(t, PARP_D, 0.13));
    // gafas: brincan con el golpe
    const dg = t - T.golpe, sac = dg > 0 ? Math.exp(-dg * 7) : 0;
    p.gafas = { dx: 0, dy: -18 * sac * Math.abs(Math.sin(dg * 22)), ang: 0.04 * sac * Math.sin(dg * 26 + 1) };
    p.capaCabeza = g => destello(g, t, p.gafas);
    // manos
    const resuelve = o => {
      if (o.bols) { const m = Da.manoReposo(p, o.lado); return { x: m.x, y: m.y, mu: m.mu, ang: 0, puno: m.puno ?? 0, dedos: D(0.4, 0.4, 0.4, 0.4) }; }
      let q;
      if (o.cubo) { const c = estadoCubo(o.cubo, t); q = { x: c.x + o.dx, y: c.y + o.dy }; } else q = o.pant;
      const h = Da.aHoja(p, q);
      return { x: h.x, y: h.y, mu: Math.PI - o.mu, ang: 0, puno: 1, dedos: o.dedos };
    };
    const L = pista(PISTA_DL, t, resuelve), C = pista(PISTA_DC, t, resuelve);
    // dedos hechos un borrón: resolviendo (las dos manos) y montando (la lejana, en círculos sobre el cubo)
    const kb = borronSolve(t), ka = borronArma(t);
    if (kb > 0) {
      L.dedos = DD(L.dedos, flick(t, 0), kb); C.dedos = DD(C.dedos, flick(t, 2.4), kb);
      L.x -= 2.2 * kb * ruido(t * 31) / S; L.y += 2 * kb * ruido(t * 29 + 4) / S;
      C.x -= 2.2 * kb * ruido(t * 27 + 9) / S; C.y += 2 * kb * ruido(t * 33 + 6) / S;
    }
    if (ka > 0) {
      L.dedos = DD(L.dedos, flick(t, 1.1), ka);
      const a = (t - T.arma0) * 2 * Math.PI * 3.2;
      L.x -= 7 * ka * Math.cos(a) / S; L.y += 4 * ka * Math.sin(a) / S;
    }
    p.manoLejos = { x: L.x, y: L.y, ang: L.ang, mu: L.mu, dobla: -1, puno: L.puno, dedos: L.dedos };
    p.manoCerca = { x: C.x, y: C.y, ang: C.ang, mu: C.mu, dobla: -1, puno: C.puno, dedos: C.dedos };
    p._L = Da.aPantalla(p, L); p._C = Da.aPantalla(p, C); p._kb = kb; p._ka = ka;
    const objL = [];
    if (t < T.click + 0.12) objL.push(g => dibujaD(g, t));
    if (t >= T.dCoge1 && t < T.entregaG) objL.push(g => dibujaR(g, t));
    if (objL.length) p.manoLejos.objeto = g => { if (!MATRIZ) return; g.save(); g.setTransform(MATRIZ); for (const f of objL) f(g); g.restore(); };
    return p;
  }
  // destello en las gafas de Dari (coordenadas del retrato)
  const ARO_D = [[729, 474], [744, 471], [789, 478], [833, 496], [858, 509], [861, 517], [849, 545], [837, 569], [823, 579], [789, 575], [745, 561], [734, 553], [729, 530]];
  function destello(g, t, gf) {
    let k = 0, tk = 0;
    for (const tb of [T.brillo1, T.brillo2, T.brillo3]) { const c = campana(t, tb, tb + 0.4); if (c > k) { k = c; tk = fase(t, tb, tb + 0.4); } }
    if (k <= 0.01) return;
    g.save(); g.translate(gf.dx || 0, gf.dy || 0);
    g.save(); g.beginPath(); ARO_D.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.clip();
    const xb = lerp(690, 900, tk);
    g.fillStyle = `rgba(255,255,255,${0.85 * k})`;
    g.beginPath(); g.moveTo(xb, 460); g.lineTo(xb + 34, 460); g.lineTo(xb - 6, 590); g.lineTo(xb - 40, 590); g.closePath(); g.fill();
    g.restore();
    // chispa de cuatro puntas
    const s = 46 * Math.sin(Math.PI * tk);
    g.translate(846, 488); g.rotate(0.3 * tk); g.fillStyle = "#ffffff"; g.globalAlpha = k;
    g.beginPath(); g.moveTo(0, -s); g.quadraticCurveTo(0, 0, s, 0); g.quadraticCurveTo(0, 0, 0, s); g.quadraticCurveTo(0, 0, -s, 0); g.quadraticCurveTo(0, 0, 0, -s); g.fill();
    g.restore();
  }

  /* ================= efectos ================= */
  // rayas de velocidad alrededor de las manos de Dari
  function borron(g, t, c, k, semilla) {
    if (k <= 0.02) return;
    g.save(); g.lineCap = "round"; g.strokeStyle = "#ffffff";
    for (let i = 0; i < 3; i++) {
      const a = t * 19 + semilla + i * 2.1, r = 11 + i * 3.5;
      g.globalAlpha = 0.7 * k * (1 - i * 0.2); g.lineWidth = 2.2 - i * 0.4;
      g.beginPath(); g.arc(c.x, c.y, r, a, a + 1.1); g.stroke();
    }
    g.restore();
  }
  // clic al dejar el cubo: tres rayitas
  function clic(g, t) {
    const k = fase(t, T.click, T.click + 0.3); if (k <= 0 || k >= 1) return;
    const o = estadoCubo("d", T.click), y = MESA.y + TD.d;
    g.save(); g.strokeStyle = "#fff4cf"; g.lineCap = "round"; g.lineWidth = 2; g.globalAlpha = 1 - k;
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) {
      const a = s > 0 ? -0.35 - i * 0.5 : Math.PI + 0.35 + i * 0.5, r0 = 20 + 6 * salida(k), r1 = r0 + 7;
      g.beginPath(); g.moveTo(o.x + s * 2 + Math.cos(a) * r0, y - 6 + Math.sin(a) * r0 * 0.6); g.lineTo(o.x + s * 2 + Math.cos(a) * r1, y - 6 + Math.sin(a) * r1 * 0.6); g.stroke();
    }
    g.restore();
  }
  // estrella de impacto y polvo
  function impacto(g, t) {
    const k = fase(t, T.golpe, T.golpe + 0.42); if (k <= 0 || k >= 1) return;
    const x = OG.golpe.x, y = MESA.y + 2, r = 40 * salida(Math.min(1, k * 4));
    g.save(); g.lineJoin = "round"; g.globalAlpha = 1 - k * k;
    g.fillStyle = "#fff1a8"; g.strokeStyle = TINTA; g.lineWidth = 2.5;
    g.beginPath();
    for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8 + 0.2, rr = (i % 2 ? 0.45 : 1) * r * (0.85 + 0.3 * hash(i + 50)); g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.55); }
    g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#ff8a3d"; g.beginPath(); g.ellipse(x, y, r * 0.3, r * 0.17, 0, 0, Math.PI * 2); g.fill();
    // polvo
    g.fillStyle = "rgba(235,225,210,0.8)";
    for (let i = 0; i < 6; i++) { const s = i % 2 ? 1 : -1, kk = salida(k), px = x + s * (30 + 34 * kk + 8 * i), py = y - 6 - 16 * kk - 3 * i;
      g.globalAlpha = 0.7 * (1 - k); g.beginPath(); g.arc(px, py, 4 + 6 * kk, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // rayas del golpe (el cubo baja como un rayo)
  function rayasGolpe(g, t) {
    const k = fase(t, T.rabia1 + 0.08, T.golpe + 0.06); if (k <= 0 || k >= 1) return;
    const o = estadoCubo("g", Math.min(t, T.golpe - 1e-3));
    g.save(); g.strokeStyle = "#ffffff"; g.lineCap = "round"; g.globalAlpha = 0.8 * Math.sin(Math.PI * k);
    for (let i = -1; i <= 1; i++) { g.lineWidth = 2.2 - Math.abs(i) * 0.6; g.beginPath(); g.moveTo(o.x + i * 10 - 6, o.y - 24); g.lineTo(o.x + i * 10 - 14, o.y - 62); g.stroke(); }
    g.restore();
  }
  // corazones que salen del abrazo
  function corazones(g, t, pG) {
    const c = G.aPantalla(pG, G.centroCabeza(pG));
    g.save(); g.lineJoin = "round";
    for (let i = 0; i < 4; i++) {
      const k = fase(t, T.corazones + i * 0.24, T.corazones + i * 0.24 + 1.0); if (k <= 0 || k >= 1) continue;
      const x = c.x + 34 + 16 * i - 14 * (i % 2) + 6 * Math.sin(k * 7 + i), y = c.y - 20 - 60 * k, s = 7 * salida(Math.min(1, k * 4)) * (1 - 0.3 * k);
      g.globalAlpha = Math.min(1, (1 - k) * 2.5);
      g.fillStyle = "#ff4d6d"; g.strokeStyle = TINTA; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(x, y + s * 0.9); g.bezierCurveTo(x - s * 1.6, y - s * 0.2, x - s * 0.6, y - s * 1.3, x, y - s * 0.4);
      g.bezierCurveTo(x + s * 0.6, y - s * 1.3, x + s * 1.6, y - s * 0.2, x, y + s * 0.9); g.closePath(); g.fill(); g.stroke();
    }
    g.restore();
  }

  /* ================= escena ================= */
  const pose = t => ({ g: poseG(t), d: poseD(t) });
  const CAM = [[0, 1.06, 512, 300], [1.0, 1.06, 512, 300], [1.55, 1.62, 565, 252], [3.95, 1.62, 560, 252], [4.55, 1.26, 492, 268],
    [5.3, 1.26, 492, 268], [5.9, 1.5, 458, 238], [7.45, 1.58, 452, 234], [7.85, 1.9, 445, 236], [9.08, 1.9, 445, 236],
    [9.45, 1.24, 500, 280], [10.35, 1.24, 500, 280],
    [10.9, 1.5, 525, 268], [12.05, 1.5, 525, 268], [12.7, 1.3, 478, 262], [13.5, 1.38, 458, 256], [DUR, 1.38, 458, 256]];
  function camara(t) {
    let i = 0; while (i < CAM.length - 2 && t > CAM[i + 1][0]) i++;
    const a = CAM[i], b = CAM[i + 1], k = suave(fase(t, a[0], b[0]));
    const kk = lerp(a[1], b[1], k), x = lerp(a[2], b[2], k), y = lerp(a[3], b[3], k);
    const mx = W / 2 / kk, my = H / 2 / kk;
    return { k: kk, x: clamp(x, mx - 40, W + 40 - mx), y: clamp(y, my - 60, H + 60 - my) };
  }
  function objetosMesa(g, t) {
    if (t >= T.click + 0.12) { const o = estadoCubo("d", t); sombraCubo(g, o.x, MESA.y + TD.d, clamp(1 - (cyM(TD.d) - o.y) / 30)); dibujaD(g, t); }
    if (t < T.gToma1) { sombraCubo(g, TG.x, MESA.y + TG.d, 1 - tramo(t, T.gToma1 - 0.05, T.gToma1)); dibujaG(g, t); }
    impacto(g, t);
    if (t >= T.golpe && t < T.arma1) dibCubitos(g, t);
    if (t >= T.arma1 - 0.3 && t < T.dSube0 + 0.2) sombraCubo(g, TR.x, MESA.y + TR.d, tramo(t, T.arma1 - 0.3, T.arma1) * (1 - tramo(t, T.dSube0, T.dSube0 + 0.2)));
    if (t >= T.arma1 && t < T.dCoge1) dibujaR(g, t);
    clic(g, t);
  }

  class GuillermoDariRubik extends Escena2D {
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
      g.save(); g.fillStyle = "rgba(10,4,0,0.4)";
      g.beginPath(); g.ellipse(pG.x + 4, SUELO + 2, 66, 7, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pD.x - 4, SUELO + 2, 62, 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
      mesa(g, t);
      objetosMesa(g, t);
      Da.dibujar(g, pD, t);
      G.dibujar(g, pG, t);
      borron(g, t, pD._L, pD._kb + pD._ka, 0); borron(g, t, pD._C, pD._kb, 2.7);
      rayasGolpe(g, t);
      if (t >= T.despega1 && t < T.vuela) pegatinaMano(g, t, pG._tip);
      pegatinaVuela(g, t, pG);
      corazones(g, t, pG);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00053", nombre: "Guillermo y Dari · El cubo de Rubik", crear: () => new GuillermoDariRubik() });
  window.__A2D_00053 = { pose, poseG, poseD, camara, T, DUR };
})();
