"use strict";
/* 00064 · Guillermo y Deivi · El castillo de naipes
 *
 * Negro → rincón de un bar de juegos: pared granate con palos de la baraja dorados, letrero de neón
 * con una pica y un corazón, estantería de juegos de mesa, botellero y una lámpara verde colgando
 * sobre una mesa alta de tapete verde. Encima, un castillo de naipes con el primer piso ya hecho.
 * Deivi, delicadísimo (meñique en alto, labios apretados), coge cartas del mazo y levanta el segundo
 * piso (dos tejadillos y una carta plana) y luego el tercero; cada carta sale del mazo, se pliega en
 * su mano y se posa justo en su hueco. Guillermo, con la última carta en la mano, se encoge cada vez
 * que una se posa → Deivi suelta el aire y le cede el honor → Guillermo, con la lengua fuera y un ojo
 * guiñado, gira la carta, la baja temblando y la deja plana en lo alto; el castillo se bambolea… y
 * aguanta (los dos con los mofletes hinchados) → ¡sí! se chocan los cinco justo encima: las palmas
 * se encuentran y el golpe de aire baja en ondas → el castillo se desmorona en cascada: las cartas
 * saltan, revolotean balanceándose y girando, y caen en la mesa y en el suelo, donde se quedan; la
 * del tejado sube la que más y aterriza plana en la cabeza de Guillermo → se miran, aún con las
 * manos juntas, y las bajan → Deivi se saca del bolsillo un mazo nuevo y levanta una ceja; a
 * Guillermo se le ilumina la cara y Deivi guiña a cámara → negro.
 *
 * Sin textos (los naipes solo llevan su palo). Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, ruido, hash } = M2;
  const G = Guillermo, Dv = Deivi;
  const S = 0.3, SUELO = 560;
  const XG = 388, XD = 640;                     // pelvis de Guillermo (mira a la derecha) y de Deivi (espejo)
  const DUR = 13.8;
  const T = {
    // viajes de Deivi: [coge del mazo, encima del hueco, la posa, abre los dedos]
    d: [[0.66, 0.98, 1.32, 1.43], [1.74, 2.04, 2.36, 2.47], [2.76, 3.04, 3.32, 3.43], [3.72, 4.06, 4.54, 4.66]],
    alivio: 4.7, cede: 4.95, cede1: 5.38,
    gSale: 5.05, gArriba: 5.9, gDeja: 6.75, gSuelta: 6.95, gRetira: 7.3,
    exito: 7.6, alza: 7.68, choque: 7.98,
    horror: 8.2, baja: 9.15, baja1: 9.7,
    miran: 10.2, bolsillo: 10.72, saca: 11.0, ensena: 11.42, ilusion: 11.7, guino: 12.25,
    fin: 12.8
  };
  T.cae = T.choque + 0.05;

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
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
  const memo = new Map();
  const cache = (k, f) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };
  const rota = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const TINTA = "#140c10";
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
  // punto de la mano (unidades de la mano) → desplazamiento en la hoja desde el centro de la mano
  const offMano = (m, q) => { const r = rota(q, m.mu + Math.PI / 2); return rota({ x: r.x * G.JK, y: r.y * G.JK }, m.ang || 0); };
  const PINZA = { x: 6.2, y: 15.5 };            // entre la yema del pulgar y la del índice
  const PALMA = { x: 0, y: 1 };                 // centro de la palma
  const ptMano = (R, p, m, q) => { const o = offMano(m, q); return R.aPantalla(p, { x: m.x + o.x, y: m.y + o.y }); };

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, wd: 0, wi: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.2,
    dientes: 1, lengua: 0, mof: 0, rub: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, extraC) {
    const c = clamp(e.c + extraC);
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, ojos: { d: clamp(c + e.wd), i: clamp(c + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* ================= naipes ================= */
  const CX = 512, TY = 350;                     // centro de la base del castillo (en la tapa de la mesa)
  const LN = 30, AN = 21;                       // largo y ancho de un naipe en pantalla
  const HV = 26, LC = 15, WC = 10, GF = 5;      // naipe apoyado: alto, inclinación y ancho visto; grosor de una plana
  const PISO = HV + GF;
  const ROJO = "#cf2331", NEGRO = "#1b1820";
  const det = A => A.a.x * A.b.y - A.a.y * A.b.x;
  const lerpA = (A, B, k) => ({ c: { x: lerp(A.c.x, B.c.x, k), y: lerp(A.c.y, B.c.y, k) }, a: { x: lerp(A.a.x, B.a.x, k), y: lerp(A.a.y, B.a.y, k) },
    b: { x: lerp(A.b.x, B.b.x, k), y: lerp(A.b.y, B.b.y, k) } });
  const mueveA = (A, d) => ({ c: { x: A.c.x + d.x, y: A.c.y + d.y }, a: A.a, b: A.b });
  // un naipe es un paralelogramo: centro c, a (de lado a lado) y b (de abajo arriba)
  const apoyada = (xb, yb, s) => ({ c: { x: xb + s * LC / 2, y: yb - HV / 2 }, a: { x: WC, y: 0 }, b: { x: s * LC, y: -HV } });
  const plana = (xc, yb) => ({ c: { x: xc, y: yb - GF / 2 }, a: { x: 0, y: -GF }, b: { x: LN, y: 0 } });
  // naipe libre: giro r en el plano y vuelta f alrededor de su eje largo
  const libre = (x, y, r, f) => ({ c: { x, y }, a: rota({ x: AN * Math.cos(f), y: 0 }, r), b: rota({ x: 0, y: -LN }, r) });
  // tumbado en una superficie vista desde arriba (e = cuánto se ve), con el signo del determinante pedido
  function tumbada(x, y, psi, e, sb, sd) {
    const b = { x: sb * LN * Math.cos(psi), y: sb * LN * e * Math.sin(psi) };
    let a = { x: -AN * Math.sin(psi), y: AN * e * Math.cos(psi) };
    if (Math.sign(a.x * b.y - a.y * b.x) !== sd) a = { x: -a.x, y: -a.y };
    return { c: { x, y }, a, b };
  }

  // el castillo: [forma, grupo (0 ya hecho · 1–4 viajes de Deivi · 5 Guillermo), palo, se le ve la cara]
  const NAIPES = [];
  const pon = (f, grupo, palo, cara) => NAIPES.push({ i: NAIPES.length, base: { c: { x: CX + f.c.x, y: TY + f.c.y }, a: f.a, b: f.b }, grupo, palo, cara });
  const tejadillo = (xa, yb) => [apoyada(xa - LC, yb, 1), apoyada(xa + LC, yb, -1)];
  {
    const p1 = [[0, true], [2, false], [1, true], [3, true], [2, true], [0, false]];
    [-30, 0, 30].forEach((xa, j) => tejadillo(xa, 0).forEach((f, k) => pon(f, 0, p1[j * 2 + k][0], p1[j * 2 + k][1])));
    pon(plana(-15, -HV), 0, 1, false); pon(plana(15, -HV), 0, 3, false);
    tejadillo(-15, -PISO).forEach((f, k) => pon(f, 1, k ? 1 : 3, !k));
    tejadillo(15, -PISO).forEach((f, k) => pon(f, 2, k ? 0 : 2, true));
    pon(plana(0, -PISO - HV), 3, 2, false);
    tejadillo(0, -2 * PISO).forEach((f, k) => pon(f, 4, k ? 2 : 0, true));
    { const f = plana(0, -2 * PISO - HV); pon({ c: f.c, a: { x: 0, y: GF }, b: { x: -LN, y: 0 } }, 5, 2, false); }   // el tejado: la carta de Guillermo (por la otra cara, el as de picas)
  }
  for (const n of NAIPES) n.s0 = det(n.base) > 0;
  const GRUPO = k => NAIPES.filter(n => n.grupo === k);
  const TECHO = NAIPES[NAIPES.length - 1];
  // dónde se cogen las cartas de cada viaje (pantalla): vértice del tejadillo o centro de la plana
  function pinzaHueco(k) {
    const ns = GRUPO(k);
    if (ns.length === 2) { const n = ns[0], top = { x: n.base.c.x + n.base.b.x / 2, y: n.base.c.y + n.base.b.y / 2 }; return { x: top.x, y: top.y + 2 }; }
    return { x: ns[0].base.c.x, y: ns[0].base.c.y };
  }
  // la carta de Guillermo cuelga de la pinza por una punta: colgando enseña el as; al girarla queda plana y enseña el dorso
  const giroG = q => ({ r: -Math.PI / 2 * q, f: Math.acos(-GF / AN) * q });
  function cartaG(pin, q, extra = 0) { const { r, f } = giroG(q), A = libre(0, 0, r + extra, f); return mueveA(A, { x: pin.x - 0.4 * A.b.x, y: pin.y - 0.4 * A.b.y }); }
  const PIN_TECHO = { x: TECHO.base.c.x + 0.4 * TECHO.base.b.x, y: TECHO.base.c.y };

  // mazo encima de la mesa
  const MAZO = { x: 572, y: TY + 9 }, PSI_M = 0.22, E_MESA = 0.22, N0 = 7;
  const enMazo = t => N0 - (t >= T.d[0][0] ? 2 : 0) - (t >= T.d[1][0] ? 2 : 0) - (t >= T.d[2][0] ? 1 : 0) - (t >= T.d[3][0] ? 2 : 0);
  const capaMazo = (i, sd) => tumbada(MAZO.x, MAZO.y - 1.15 * i, PSI_M, E_MESA, 1, sd);
  const DORSO_M = { palo: 0, cara: false, s0: det(capaMazo(0, -1)) > 0 };
  const VIAJE = T.d.map((v, k) => ({ toma: v[0], sube: v[1], deja: v[2], suelta: v[3], antes: N0 - [0, 2, 4, 5][k], ns: GRUPO(k + 1) }));
  VIAJE.forEach((V, k) => { V.pinMazo = { x: MAZO.x, y: MAZO.y - 1.15 * (V.antes - 1) }; V.pinHueco = pinzaHueco(k + 1); });

  /* ---------- sprites de los naipes ---------- */
  const SPW = 63, SPH = 90;
  let SPR = null;
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
  function creaNaipe(palo) {
    const c = document.createElement("canvas"); c.width = SPW; c.height = SPH; const g = c.getContext("2d");
    redondeado(g, 0.5, 0.5, SPW - 1, SPH - 1, 4); g.fillStyle = "#fbf7ee"; g.fill();
    if (palo < 0) {
      redondeado(g, 6, 6, SPW - 12, SPH - 12, 3); g.fillStyle = "#b51f2b"; g.fill();
      g.save(); g.clip(); g.strokeStyle = "rgba(255,196,176,0.5)"; g.lineWidth = 1.7;
      for (let k = -SPH; k < SPW + SPH; k += 9) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k - SPH, SPH); g.stroke(); g.beginPath(); g.moveTo(k - SPH, 0); g.lineTo(k, SPH); g.stroke(); }
      g.restore();
      g.fillStyle = "#fbf7ee"; g.beginPath(); g.ellipse(SPW / 2, SPH / 2, 12, 16, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "#7a0f1a"; g.lineWidth = 1.6; g.stroke();
      pipo(g, 2, SPW / 2, SPH / 2, 8.5, "#b51f2b");
      redondeado(g, 6, 6, SPW - 12, SPH - 12, 3); g.strokeStyle = "rgba(110,8,20,0.7)"; g.lineWidth = 1.6; g.stroke();
    } else {
      redondeado(g, 5, 5, SPW - 10, SPH - 10, 3); g.strokeStyle = "rgba(90,60,60,0.28)"; g.lineWidth = 1.5; g.stroke();
      pipo(g, palo, SPW / 2, SPH / 2, palo === 2 ? 17 : 15);
      pipo(g, palo, 12, 15, 5.6);
      g.save(); g.translate(SPW - 12, SPH - 15); g.rotate(Math.PI); pipo(g, palo, 0, 0, 5.6); g.restore();
    }
    return c;
  }
  // dibuja un naipe con forma A; n dice qué palo es y qué lado se ve en su forma del castillo
  function naipe(g, A, n) {
    if (!SPR) SPR = [0, 1, 2, 3, -1].map(creaNaipe);
    const d = det(A);
    if (Math.abs(d) > 0.4) {
      const cara = (d > 0) === n.s0 ? n.cara : !n.cara;
      g.save(); g.transform(A.a.x / SPW, A.a.y / SPW, -A.b.x / SPH, -A.b.y / SPH, A.c.x, A.c.y);
      g.drawImage(SPR[cara ? n.palo : 4], -SPW / 2, -SPH / 2); g.restore();
    }
    const ax = A.a.x / 2, ay = A.a.y / 2, bx = A.b.x / 2, by = A.b.y / 2, x = A.c.x, y = A.c.y;
    g.beginPath(); g.moveTo(x - ax - bx, y - ay - by); g.lineTo(x + ax - bx, y + ay - by); g.lineTo(x + ax + bx, y + ay + by); g.lineTo(x - ax + bx, y - ay + by); g.closePath();
    g.lineJoin = "round"; g.strokeStyle = TINTA; g.lineWidth = 1.15; g.stroke();
  }

  /* ---------- castillo: quién está, bamboleo y derrumbe ---------- */
  const bambo = t => t < T.gSuelta ? 0 : 0.055 * Math.sin((t - T.gSuelta) * 15) * Math.exp(-(t - T.gSuelta) * 4.6);
  const cizalla = (A, k) => k ? { c: { x: A.c.x + k * (TY - A.c.y), y: A.c.y }, a: { x: A.a.x - k * A.a.y, y: A.a.y }, b: { x: A.b.x - k * A.b.y, y: A.b.y } } : A;
  const puesto = (n, t) => n.grupo === 0 || (n.grupo <= 4 ? t >= T.d[n.grupo - 1][2] : t >= T.gDeja);

  // derrumbe: cada naipe sale despedido (los de arriba antes y más alto), revolotea y se queda tumbado
  const CORONA = { x: 812, y: 268 };
  const coronaG = p => G.aPantalla(p, G.cabeza(p).a(CORONA));
  const E_SUELO = 0.3, E_CAB = 0.34;
  // naipe tumbado en el pelo de Guillermo (sigue a la cabeza)
  function enCabeza(p, sd) {
    const c = coronaG(p), r = p.cabeza.ang;
    const b = rota({ x: LN * 0.96, y: 0 }, r - 0.08);
    let a = rota({ x: 0, y: AN * E_CAB }, r - 0.08);
    if (Math.sign(a.x * b.y - a.y * b.x) !== sd) a = { x: -a.x, y: -a.y };
    return { c: { x: c.x + 2, y: c.y - 2 }, a, b };
  }
  // destinos: [retraso, subida, duración, x, y, dónde, giro final ψ, vueltas, balanceo]
  const DESTINO = [];
  {
    const mesa = [[0.36, 3, 0.55, 478, TY + 1, -0.25], [0.31, 4, 0.5, 497, TY + 9, 0.3], [0.4, 2, 0.5, 503, TY - 5, 0.1],
      [0.33, 4, 0.55, 526, TY + 12, -0.35], [0.38, 3, 0.5, 532, TY - 3, 0.42], [0.42, 2, 0.6, 556, TY + 5, -0.1]];
    for (let i = 0; i < 6; i++) { const m = mesa[i]; DESTINO[i] = { ret: m[0], up: m[1], tau: m[2], x: m[3], y: m[4], donde: "mesa", psi: m[5], vueltas: 0, bal: 4 }; }
    DESTINO[6] = { ret: 0.24, up: 14, tau: 0.75, x: 488, y: TY + 13, donde: "mesa", psi: 0.15, vueltas: 1, bal: 8 };
    DESTINO[7] = { ret: 0.27, up: 16, tau: 0.8, x: 545, y: TY - 7, donde: "mesa", psi: -0.3, vueltas: 1, bal: 8 };
    DESTINO[8] = { ret: 0.16, up: 34, tau: 1.25, x: 438, y: 579, donde: "suelo", psi: 0.35, vueltas: 2, bal: 22 };
    DESTINO[9] = { ret: 0.19, up: 26, tau: 0.95, x: 470, y: TY + 2, donde: "mesa", psi: -0.2, vueltas: 1, bal: 12 };
    DESTINO[10] = { ret: 0.2, up: 30, tau: 0.98, x: 552, y: TY + 11, donde: "mesa", psi: 0.25, vueltas: 1, bal: 12 };
    DESTINO[11] = { ret: 0.17, up: 38, tau: 1.3, x: 596, y: 586, donde: "suelo", psi: -0.4, vueltas: 2, bal: 22 };
    DESTINO[12] = { ret: 0.11, up: 50, tau: 1.45, x: 517, y: 591, donde: "suelo", psi: 0.1, vueltas: 3, bal: 30 };
    DESTINO[13] = { ret: 0.06, up: 34, tau: 1.45, x: 404, y: 588, donde: "suelo", psi: 0.5, vueltas: 3, bal: 34 };
    DESTINO[14] = { ret: 0.07, up: 56, tau: 1.7, x: 694, y: 582, donde: "suelo", psi: -0.45, vueltas: 4, bal: 34 };
    DESTINO[15] = { ret: 0.0, up: 150, tau: 1.68, x: 0, y: 0, donde: "cabeza", psi: 0, vueltas: 4, bal: 30 };
  }
  T.cabeza = T.cae + DESTINO[15].ret + DESTINO[15].tau;
  const TCAB = 0.32;                            // tiempo de caída hasta la velocidad límite
  function planVuelo(n) {
    return cache("v" + n.i, () => {
      const D0 = DESTINO[n.i], t0 = T.cae + D0.ret, A0 = n.base;
      const r0 = Math.atan2(A0.b.x, -A0.b.y), l0 = Math.hypot(A0.a.x, A0.a.y) / AN;
      const f0 = Math.acos(clamp(-Math.sign(det(A0)) * l0, -1, 1));
      let xf = D0.x, yf = D0.y;
      if (D0.donde === "cabeza") { const c = enCabeza(poseG(t0 + D0.tau), 1).c; xf = c.x; yf = c.y; }
      const sentido = hash(n.i + 40) > 0.5 ? 1 : -1;
      const rf0 = r0 + sentido * (0.6 + 0.5 * hash(n.i + 41)) * (D0.vueltas ? 1 : 0.4);
      const rf = Math.round((rf0 - Math.PI / 2) / Math.PI) * Math.PI + Math.PI / 2 + D0.psi * 0.4;
      const e = D0.donde === "mesa" ? E_MESA : D0.donde === "suelo" ? E_SUELO : E_CAB;
      const kf = Math.round((f0 + D0.vueltas * Math.PI - Math.PI / 2) / Math.PI);
      const ff = Math.PI / 2 + kf * Math.PI + (hash(n.i + 42) > 0.5 ? 1 : -1) * Math.asin(e);
      const tu = D0.up > 0 ? Math.min(0.42, 0.2 + D0.up / 400) : 0;
      const yTop = A0.c.y - D0.up, w = D0.tau - tu;
      const vT = (yf - yTop) / (w - TCAB * (1 - Math.exp(-w / TCAB)));
      return { t0, A0, x0: A0.c.x, y0: A0.c.y, xf, yf, r0, rf, f0, ff, tu, up: D0.up, vT, tau: D0.tau, e, psi: D0.psi, donde: D0.donde,
        bal: D0.bal, om: 5 + 2.5 * hash(n.i + 43), ph: 6.28 * hash(n.i + 44), desliz: (hash(n.i + 45) - 0.5) * 6 };
    });
  }
  function libreVuelo(V, u) {
    const s = clamp(u / V.tau), env = Math.sin(Math.PI * s);
    let y;
    if (u < V.tu) y = V.y0 - V.up * salida(u / V.tu);
    else { const w = u - V.tu; y = V.y0 - V.up + V.vT * (w - TCAB * (1 - Math.exp(-w / TCAB))); }
    const hx = V.donde === "cabeza" ? suave(s) : 1 - (1 - s) * (1 - s);
    const x = V.x0 + (V.xf - V.x0) * hx + V.bal * Math.sin(V.om * u + V.ph) * env;
    const r = lerp(V.r0, V.rf, suave(s)) + 0.45 * Math.cos(V.om * u + V.ph) * env * Math.min(1, V.bal / 20);
    const f = lerp(V.f0, V.ff, salida(s));
    return libre(x, y, r, f);
  }
  // forma final del naipe tumbado (la cara que se ve, la misma que trae en el aire)
  function finVuelo(V, t, sd) {
    if (V.donde === "cabeza") return enCabeza(poseG(t), sd);
    const sb = Math.sin(V.rf) >= 0 ? 1 : -1;
    return tumbada(V.xf, V.yf, V.psi, V.e, sb, sd);
  }
  // estado de un naipe del castillo en t: { modo, A }
  function estadoNaipe(n, t) {
    const V = planVuelo(n);
    if (t < V.t0) return { modo: "castillo", A: cizalla(n.base, bambo(t)) };
    const u = t - V.t0, sd = Math.sign(det(libreVuelo(V, V.tau))) || 1;
    if (u >= V.tau) {
      const A = finVuelo(V, t, sd), v = u - V.tau;
      if (V.donde !== "cabeza") A.c = { x: A.c.x + V.desliz * (1 - Math.exp(-v * 9)), y: A.c.y };
      return { modo: V.donde, A };
    }
    let A = libreVuelo(V, u);
    A = lerpA(V.A0, A, suave(u / 0.13));
    const te = Math.min(0.2, V.tau * 0.3), kb = fase(u, V.tau - te, V.tau);
    if (kb > 0) A = lerpA(A, finVuelo(V, t, sd), suave(kb));
    return { modo: "aire", A };
  }

  /* ================= decorado: rincón de un bar de juegos ================= */
  let fondo = null;
  const ZOC = 334, YS0 = 470;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60); g.lineJoin = "round"; g.lineCap = "round";
    // pared granate con los cuatro palos en dorado
    const pg = g.createLinearGradient(0, -60, 0, ZOC); pg.addColorStop(0, "#32111b"); pg.addColorStop(1, "#5a2131");
    g.fillStyle = pg; g.fillRect(-40, -60, W + 80, ZOC + 60);
    g.globalAlpha = 0.13;
    for (let j = 0, y = -36; y < ZOC - 14; y += 44, j++) for (let i = 0, x = -26 + (j % 2) * 30; x < W + 40; x += 60, i++) pipo(g, (i + j * 3) % 4, x, y, 7, "#e9c46a");
    g.globalAlpha = 1;
    // luz de la lámpara sobre la pared
    const lz = g.createRadialGradient(512, 180, 20, 512, 200, 470); lz.addColorStop(0, "rgba(255,214,150,0.30)"); lz.addColorStop(1, "rgba(255,200,130,0)");
    g.fillStyle = lz; g.fillRect(-40, -60, W + 80, YS0 + 60);
    estanteria(g, 128, ZOC - 4);
    neon(g, 770, 112);
    botellero(g, 940, 300);
    cuadro(g, 300, 120);
    // zócalo de madera
    g.fillStyle = "#2c160c"; g.fillRect(-40, ZOC - 8, W + 80, 10); g.fillStyle = "rgba(255,200,140,0.22)"; g.fillRect(-40, ZOC - 8, W + 80, 2);
    const z = g.createLinearGradient(0, ZOC, 0, YS0); z.addColorStop(0, "#5a3219"); z.addColorStop(1, "#3e200e");
    g.fillStyle = z; g.fillRect(-40, ZOC + 2, W + 80, YS0 - ZOC - 2);
    for (let x = -24; x < W + 40; x += 104) {
      g.strokeStyle = "rgba(20,8,2,0.55)"; g.lineWidth = 3; g.strokeRect(x, ZOC + 20, 84, YS0 - ZOC - 44);
      g.strokeStyle = "rgba(255,190,130,0.15)"; g.lineWidth = 1.5; g.strokeRect(x + 3, ZOC + 23, 78, YS0 - ZOC - 50);
    }
    g.fillStyle = "#24110a"; g.fillRect(-40, YS0 - 10, W + 80, 10);
    // suelo de baldosas a cuadros en perspectiva
    const fy = k => YS0 + (H + 60 - YS0) * Math.pow(k, 1.45), fx = (i, y) => 512 + i * lerp(46, 150, (y - YS0) / (H + 60 - YS0));
    for (let k = 0; k < 7; k++) {
      const y0 = fy(k / 7), y1 = fy((k + 1) / 7);
      for (let i = -14; i < 14; i++) {
        g.fillStyle = (i + k) % 2 ? "#3e1c22" : "#1f1417";
        g.beginPath(); g.moveTo(fx(i, y0), y0); g.lineTo(fx(i + 1, y0), y0); g.lineTo(fx(i + 1, y1), y1); g.lineTo(fx(i, y1), y1); g.closePath(); g.fill();
      }
    }
    const br = g.createLinearGradient(0, YS0, 0, H + 60); br.addColorStop(0, "rgba(0,0,0,0.35)"); br.addColorStop(0.4, "rgba(255,210,150,0.06)"); br.addColorStop(1, "rgba(0,0,0,0.2)");
    g.fillStyle = br; g.fillRect(-40, YS0, W + 80, H + 60 - YS0);
    const ref = g.createRadialGradient(512, 560, 10, 512, 560, 260); ref.addColorStop(0, "rgba(255,220,160,0.16)"); ref.addColorStop(1, "rgba(255,220,160,0)");
    g.fillStyle = ref; g.fillRect(200, YS0, 624, H + 60 - YS0);
    mesa(g);
    lampara(g);
    const vi = g.createRadialGradient(512, 300, 290, 512, 300, 720); vi.addColorStop(0, "rgba(0,0,0,0)"); vi.addColorStop(1, "rgba(8,4,10,0.55)");
    g.fillStyle = vi; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }
  function estanteria(g, x, yb) {
    g.save();
    const w = 210, h = 250, x0 = x - w / 2, y0 = yb - h;
    g.fillStyle = "#3a1e0e"; g.fillRect(x0, y0, w, h); g.fillStyle = "#1e0e06"; g.fillRect(x0 + 9, y0 + 9, w - 18, h - 18);
    const hb = (h - 18) / 3;
    const cols = ["#2f6db0", "#d8a531", "#3c8a4a", "#c4462e", "#6d3f93", "#e0d6bf", "#1f8a8a"];
    for (let b = 0; b < 3; b++) {
      const yb2 = y0 + 9 + (b + 1) * hb;
      if (b === 1) {
        // juegos tumbados unos encima de otros y un par de dados grandes
        let yy = yb2;
        for (let i = 0; i < 4; i++) { const bw = 84 - 8 * hash(i + 70) * 3, bh = 13 + 4 * hash(i + 71); g.fillStyle = cols[(i * 2 + 1) % cols.length];
          g.fillRect(x0 + 16 + 6 * hash(i + 72), yy - bh, bw, bh); g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(x0 + 22 + 6 * hash(i + 72), yy - bh + 4, bw * 0.4, 3);
          g.strokeStyle = "rgba(0,0,0,0.5)"; g.lineWidth = 1; g.strokeRect(x0 + 16 + 6 * hash(i + 72), yy - bh, bw, bh); yy -= bh; }
        dado(g, x0 + 130, yb2 - 15, 26, 5); dado(g, x0 + 168, yb2 - 12, 22, 3);
      } else {
        let xx = x0 + 14, i = 0;
        while (xx < x0 + w - 26) {
          const n = b * 30 + i, bw = 12 + 14 * hash(n + 80), bh = hb - 14 - 26 * hash(n + 81);
          g.fillStyle = cols[Math.floor(hash(n + 82) * cols.length)]; g.fillRect(xx, yb2 - bh, bw, bh);
          g.fillStyle = "rgba(255,255,255,0.3)"; g.beginPath(); g.arc(xx + bw / 2, yb2 - bh * 0.62, Math.min(bw * 0.28, 5), 0, Math.PI * 2); g.fill();
          g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(xx, yb2 - 8, bw, 3);
          g.strokeStyle = "rgba(0,0,0,0.55)"; g.lineWidth = 1; g.strokeRect(xx, yb2 - bh, bw, bh);
          xx += bw + 2; i++;
        }
      }
      g.fillStyle = "#5c331a"; g.fillRect(x0 + 5, yb2, w - 10, 7); g.fillStyle = "rgba(255,200,140,0.22)"; g.fillRect(x0 + 5, yb2, w - 10, 2);
    }
    g.strokeStyle = "#140802"; g.lineWidth = 3; g.strokeRect(x0, y0, w, h);
    g.restore();
  }
  function dado(g, x, y, s, n) {
    g.save(); g.translate(x, y); g.rotate(-0.12);
    g.fillStyle = "#f4efe4"; redondeado(g, -s / 2, -s / 2, s, s, 4); g.fill(); g.strokeStyle = "#2a1a14"; g.lineWidth = 1.4; g.stroke();
    g.fillStyle = "#b51f2b"; const q = s * 0.26;
    const pts = n === 5 ? [[-q, -q], [q, -q], [0, 0], [-q, q], [q, q]] : [[-q, -q], [0, 0], [q, q]];
    for (const [px, py] of pts) { g.beginPath(); g.arc(px, py, s * 0.08, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  function neon(g, x, y) {
    g.save();
    g.fillStyle = "#1a0a10"; redondeado(g, x - 64, y - 46, 128, 92, 10); g.fill(); g.strokeStyle = "#0a0406"; g.lineWidth = 3; g.stroke();
    const tubo = (palo, cx, cy, r, col) => {
      g.save(); g.translate(cx, cy); g.scale(r, r);
      g.beginPath();
      if (palo === 2) { g.moveTo(0, -1); g.bezierCurveTo(-0.55, -0.48, -1.05, -0.12, -1.0, 0.28); g.bezierCurveTo(-0.95, 0.74, -0.28, 0.78, -0.08, 0.4);
        g.quadraticCurveTo(-0.12, 0.82, -0.42, 1.0); g.lineTo(0.42, 1.0); g.quadraticCurveTo(0.12, 0.82, 0.08, 0.4);
        g.bezierCurveTo(0.28, 0.78, 0.95, 0.74, 1.0, 0.28); g.bezierCurveTo(1.05, -0.12, 0.55, -0.48, 0, -1); }
      else { g.moveTo(0, 0.95); g.bezierCurveTo(-0.55, 0.45, -1.05, 0.05, -1.0, -0.38); g.bezierCurveTo(-0.95, -0.95, -0.2, -1.05, 0, -0.5);
        g.bezierCurveTo(0.2, -1.05, 0.95, -0.95, 1.0, -0.38); g.bezierCurveTo(1.05, 0.05, 0.55, 0.45, 0, 0.95); }
      g.restore();
      g.shadowColor = col; g.shadowBlur = 18; g.strokeStyle = col; g.lineWidth = 6; g.stroke();
      g.shadowBlur = 8; g.lineWidth = 3; g.strokeStyle = "#fff2fa"; g.stroke(); g.shadowBlur = 0;
    };
    tubo(2, x - 24, y - 2, 26, "#ff4fa8");
    tubo(0, x + 28, y + 4, 22, "#4fd8ff");
    g.restore();
  }
  function botellero(g, x, yb) {
    g.save();
    const w = 150, x0 = x - w / 2;
    g.fillStyle = "#24120a"; g.fillRect(x0, yb - 175, w, 175);
    const hl = g.createLinearGradient(0, yb - 175, 0, yb); hl.addColorStop(0, "rgba(255,190,110,0.35)"); hl.addColorStop(1, "rgba(255,160,80,0.08)");
    g.fillStyle = hl; g.fillRect(x0 + 6, yb - 169, w - 12, 163);
    const tonos = ["#3d7a3a", "#8a4a1a", "#c9b26a", "#5a2a6a", "#2a5a7a", "#b8562a", "#e0dccf"];
    for (const [yy, n0] of [[yb - 92, 0], [yb - 8, 10]]) {
      let xx = x0 + 14;
      for (let i = 0; xx < x0 + w - 16; i++) {
        const n = n0 + i, bw = 13 + 5 * hash(n + 120), bh = 46 + 26 * hash(n + 121);
        g.fillStyle = tonos[Math.floor(hash(n + 122) * tonos.length)];
        g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx, yy - bh * 0.6); g.quadraticCurveTo(xx, yy - bh * 0.75, xx + bw * 0.35, yy - bh * 0.8);
        g.lineTo(xx + bw * 0.35, yy - bh); g.lineTo(xx + bw * 0.65, yy - bh); g.lineTo(xx + bw * 0.65, yy - bh * 0.8);
        g.quadraticCurveTo(xx + bw, yy - bh * 0.75, xx + bw, yy - bh * 0.6); g.lineTo(xx + bw, yy); g.closePath(); g.fill();
        g.strokeStyle = "rgba(0,0,0,0.6)"; g.lineWidth = 1.2; g.stroke();
        g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(xx + 2.5, yy - bh * 0.55, 2.2, bh * 0.45);
        g.fillStyle = "rgba(245,235,210,0.8)"; g.fillRect(xx + 1.5, yy - bh * 0.42, bw - 3, bh * 0.18);
        xx += bw + 5;
      }
      g.fillStyle = "#6b3f1e"; g.fillRect(x0 + 3, yy, w - 6, 6); g.fillStyle = "rgba(255,210,150,0.3)"; g.fillRect(x0 + 3, yy, w - 6, 2);
    }
    g.strokeStyle = "#0e0603"; g.lineWidth = 3; g.strokeRect(x0, yb - 175, w, 175);
    g.restore();
  }
  function cuadro(g, x, y) {
    g.save();
    g.fillStyle = "#b8893a"; g.fillRect(x - 34, y - 44, 68, 88); g.strokeStyle = "#3a2206"; g.lineWidth = 3; g.strokeRect(x - 34, y - 44, 68, 88);
    g.fillStyle = "#1e4a36"; g.fillRect(x - 26, y - 36, 52, 72);
    // un abanico de cartas pintado
    for (let i = -2; i <= 2; i++) {
      g.save(); g.translate(x, y + 22); g.rotate(i * 0.32);
      g.fillStyle = "#f6f0e2"; g.fillRect(-9, -44, 18, 26); g.strokeStyle = "#2a1a14"; g.lineWidth = 1; g.strokeRect(-9, -44, 18, 26);
      pipo(g, (i + 4) % 4, 0, -31, 5); g.restore();
    }
    g.strokeStyle = "#3a2206"; g.lineWidth = 1.5; g.strokeRect(x - 26, y - 36, 52, 72);
    g.restore();
  }
  const MESA = { rx: 90, ry: 16 };
  function mesa(g) {
    const x = CX, y = TY, { rx, ry } = MESA;
    g.save(); g.lineJoin = "round";
    g.fillStyle = "rgba(0,0,0,0.4)"; g.beginPath(); g.ellipse(x, SUELO + 3, 60, 9, 0, 0, Math.PI * 2); g.fill();
    // base y pie de metal
    g.fillStyle = "#1c1c22"; g.beginPath(); g.ellipse(x, SUELO - 3, 46, 9, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.fillStyle = "rgba(255,230,200,0.18)"; g.beginPath(); g.ellipse(x - 10, SUELO - 6, 24, 3, 0, 0, Math.PI * 2); g.fill();
    const pie = g.createLinearGradient(x - 8, 0, x + 8, 0); pie.addColorStop(0, "#55555e"); pie.addColorStop(0.4, "#2a2a32"); pie.addColorStop(1, "#141418");
    g.fillStyle = pie; g.fillRect(x - 7, y + 14, 14, SUELO - 8 - y - 14); g.strokeStyle = TINTA; g.lineWidth = 1.8; g.strokeRect(x - 7, y + 14, 14, SUELO - 8 - y - 14);
    g.fillStyle = "#26262e"; g.beginPath(); g.ellipse(x, y + 16, 22, 5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    // canto de madera y tapete
    g.fillStyle = "#4a2410"; g.beginPath(); g.ellipse(x, y + 7, rx, ry, 0, 0, Math.PI); g.lineTo(x - rx, y); g.ellipse(x, y, rx, ry, 0, Math.PI, 0, true); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#6e3818"; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    const fe = g.createRadialGradient(x - 10, y - 4, 4, x, y, rx); fe.addColorStop(0, "#2f8a58"); fe.addColorStop(1, "#18563a");
    g.fillStyle = fe; g.beginPath(); g.ellipse(x, y, rx - 7, ry - 3.5, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(10,30,18,0.7)"; g.lineWidth = 1.5; g.stroke();
    g.strokeStyle = "rgba(255,220,170,0.35)"; g.lineWidth = 1.5; g.beginPath(); g.ellipse(x, y, rx - 2, ry - 1, 0, Math.PI * 1.08, Math.PI * 1.55); g.stroke();
    g.restore();
  }
  function lampara(g) {
    g.save();
    const x = CX, y = 112;
    g.strokeStyle = "#0c0608"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, -60); g.lineTo(x, y - 30); g.stroke();
    const cono = g.createLinearGradient(0, y, 0, TY); cono.addColorStop(0, "rgba(255,236,170,0.22)"); cono.addColorStop(1, "rgba(255,236,170,0)");
    g.fillStyle = cono; g.beginPath(); g.moveTo(x - 40, y + 4); g.lineTo(x + 40, y + 4); g.lineTo(x + 150, TY); g.lineTo(x - 150, TY); g.closePath(); g.fill();
    g.fillStyle = "#1f5a3c"; g.beginPath(); g.moveTo(x - 12, y - 32); g.lineTo(x + 12, y - 32); g.quadraticCurveTo(x + 16, y - 14, x + 44, y); g.lineTo(x - 44, y); g.quadraticCurveTo(x - 16, y - 14, x - 12, y - 32); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2.2; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.22)"; g.beginPath(); g.moveTo(x - 6, y - 28); g.quadraticCurveTo(x - 14, y - 12, x - 32, y - 3); g.lineTo(x - 24, y - 3); g.quadraticCurveTo(x - 9, y - 12, x - 3, y - 28); g.closePath(); g.fill();
    g.fillStyle = "#fff6d0"; g.beginPath(); g.ellipse(x, y + 1, 40, 5, 0, 0, Math.PI * 2); g.fill();
    const h = g.createRadialGradient(x, y + 2, 2, x, y + 2, 60); h.addColorStop(0, "rgba(255,240,190,0.6)"); h.addColorStop(1, "rgba(255,240,190,0)");
    g.fillStyle = h; g.beginPath(); g.arc(x, y + 2, 60, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  /* ================= Guillermo ================= */
  const CG = {
    inicio: E({ mx: 0.85, my: 0.4, sonr: 0.25, ancho: 0.85 }),
    mira: E({ mx: 0.9, my: 0.55, sonr: 0.1, ancho: 0.75, sd: 8, si: 12 }),
    turno: E({ mx: 0.9, my: 0.45, sonr: 0.6, ancho: 0.95, sd: 14, si: 6, gi: -0.06 }),
    lengua: E({ mx: 0.92, my: 0.62, wd: 0.42, sonr: 0.0, ancho: 0.66, sd: -10, si: 12, gd: -0.14, gi: 0.1 }),
    aguanta: E({ mx: 0.9, my: 0.55, iris: 0.8, sonr: -0.05, ancho: 0.42, sd: 22, si: 22, mof: 0.9 }),
    alegria: E({ mx: 0.95, my: 0.1, h: 0.85, sonr: 0.95, abre: 22, ancho: 1.05, sd: 18, si: 18 }),
    horror: E({ mx: 0.55, my: -0.8, iris: 0.66, abre: 26, ancho: 0.62, sonr: -0.45, sd: 28, si: 28 }),
    arriba: E({ mx: 0.25, my: -1, c: 0.15, iris: 0.85, sonr: -0.25, ancho: 0.5, abre: 3, sd: 16, si: 24, gi: 0.1 }),
    vacio: E({ mx: 0.95, my: 0.08, c: 0.42, sonr: -0.12, ancho: 0.55, sd: 2, si: 4 }),
    ilusion: E({ mx: 0.95, my: 0.05, h: 0.55, sonr: 0.95, abre: 14, ancho: 1.02, sd: 24, si: 24 })
  };
  const ENCOGE_G = E({ mx: 0.88, my: 0.5, c: 0.6, sonr: -0.3, ancho: 0.6, sd: 14, si: 18, gd: 0.08, gi: 0.08 });
  const GUION_CG = [
    [0.3, 0.55, "mira"], [T.gSale - 0.3, T.gSale - 0.05, "turno"], [T.gSale + 0.12, T.gSale + 0.4, "lengua"], [T.gSuelta, T.gSuelta + 0.2, "aguanta"],
    [T.exito, T.exito + 0.12, "alegria"], [T.horror, T.horror + 0.18, "horror"], [T.cabeza + 0.02, T.cabeza + 0.25, "arriba"],
    [T.miran, T.miran + 0.3, "vacio"], [T.ilusion, T.ilusion + 0.22, "ilusion"]
  ];
  const PARP_G = [1.95, 3.9, 5.5, 9.95, 11.25, 12.55];
  const P0G = { dx: 0, pel: 0, torso: 0, cab: 0 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    quieto: CuG({ torso: 0.03, cab: 0.05 }),
    mira: CuG({ torso: 0.07, cab: 0.1, pel: 2 }),
    coloca: CuG({ torso: 0.15, cab: 0.12, pel: 10, dx: 8 }),
    aguanta: CuG({ torso: 0.1, cab: 0.08, pel: 6, dx: 5 }),
    alegria: CuG({ torso: -0.05, cab: -0.09, pel: -6, dx: 2 }),
    choque: CuG({ torso: 0.06, cab: -0.02, pel: 0, dx: 6 }),
    horror: CuG({ torso: -0.08, cab: -0.16, pel: 4, dx: 0 }),
    final: CuG({ torso: 0.03, cab: 0.04 })
  };
  const GUION_G = [
    [0.3, 0.7, "mira"], [T.gSale, T.gArriba, "coloca"], [T.gRetira, T.gRetira + 0.3, "aguanta"], [T.exito, T.exito + 0.14, "alegria", salida],
    [T.alza, T.choque, "choque"], [T.horror, T.horror + 0.3, "horror"], [T.baja, T.baja1, "final"]
  ];
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const PIES_G = { cerca: XG - 30, lejos: XG + 32 };
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, -1.75), l: punoDesde({ x: 372, y: 648 }, -1.75) };
  // contacto de los cinco: punto de pantalla encima del tejado; cada palma queda a un lado
  const CHOQUE = { x: 505, y: 236 }, MEDIO = 6;
  const PINZA_G = D(0.72, 0.7, 0.3, 0.22), SUELTA_G = D(0.9, 0.95, 0.85, 0.8), ABIERTA = D(1, 1, 1, 1);
  const HOLD_G = { x: 451, y: 349 };
  const PISTA_GL = [
    [0, 0, { pinza: HOLD_G, mu: -1.62, dedos: PINZA_G }],
    [T.gSale, T.gArriba, { pinza: { x: PIN_TECHO.x, y: PIN_TECHO.y - 20 }, mu: -2.0, dedos: PINZA_G }],
    [T.gArriba + 0.02, T.gDeja, { pinza: PIN_TECHO, mu: -2.0, dedos: PINZA_G }, salida],
    [T.gDeja + 0.03, T.gDeja + 0.12, { pinza: PIN_TECHO, mu: -2.0, dedos: D5(0.72, 0.7, 0.75, 0.8, 0.85) }],
    [T.gDeja + 0.12, T.gSuelta, { pinza: PIN_TECHO, mu: -2.0, dedos: SUELTA_G }],
    [T.gSuelta + 0.05, T.gRetira, { pinza: { x: PIN_TECHO.x - 12, y: PIN_TECHO.y - 12 }, mu: -2.05, dedos: SUELTA_G }],
    [T.exito - 0.02, T.alza + 0.16, { palma: { x: CHOQUE.x - 34, y: CHOQUE.y - 24 }, mu: -4.35, dedos: ABIERTA }],
    [T.choque - 0.12, T.choque, { palma: { x: CHOQUE.x - MEDIO, y: CHOQUE.y }, mu: -4.55, dedos: ABIERTA }, entrada],
    [T.baja, T.baja1 - 0.12, { bols: true, sale: true }],
    [T.baja1 - 0.12, T.baja1, { bols: true }]
  ];
  const PISTA_GC = [[0, 0, { bols: true }]];
  const lenguaK = t => tramo(t, T.gSale + 0.15, T.gSale + 0.42) * (1 - tramo(t, T.gSuelta - 0.02, T.gSuelta + 0.14));
  // sobresalto de Guillermo cada vez que una carta se posa
  const encogeG = t => { let o = 0; for (const v of T.d) o = Math.max(o, campana(t, v[2] - 0.1, v[2] + 0.32)); return o; };
  const tiembla = t => tramo(t, T.gArriba - 0.1, T.gArriba + 0.15) * (1 - tramo(t, T.gDeja - 0.3, T.gDeja));
  // la lengua asoma por la comisura de delante (coordenadas del retrato)
  function lengua(g, k, b) {
    if (k <= 0.01) return;
    const hw = 44 * (b.ancho ?? 1), s = b.sonrisa ?? 0, ca = Math.cos(0.26), sa = Math.sin(0.26);
    const yR = -10 * s, cx = 803 + hw * ca - yR * sa, cy = 730 + hw * sa + yR * ca;
    g.save(); g.translate(cx - 6, cy + 2); g.rotate(0.95);
    const L = 48 * k;
    g.beginPath(); g.moveTo(-15, -4); g.quadraticCurveTo(-19, L * 0.75, 0, L); g.quadraticCurveTo(19, L * 0.75, 15, -4); g.closePath();
    g.fillStyle = "#e0675c"; g.fill(); g.strokeStyle = "#140c10"; g.lineWidth = 5; g.stroke();
    g.strokeStyle = "rgba(130,24,30,0.6)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 4); g.lineTo(0, L * 0.6); g.stroke();
    g.restore();
    // el labio vuelve a pasar por encima de la raíz de la lengua
    g.save(); g.translate(803, 730); g.rotate(0.26); g.strokeStyle = "#140c10"; g.lineWidth = 6.5; g.lineCap = "round";
    g.beginPath(); g.moveTo(hw - 26, 12 * s + 2 - 2); g.quadraticCurveTo(hw - 10, 4 * s + 1, hw + 1, yR); g.stroke(); g.restore();
  }

  function poseG(t) {
    const b = linea(GUION_G, CUER_G, "quieto", t);
    const respira = Math.sin(t * 2.1 + 0.4), en = encogeG(t);
    const al = campana(t, T.exito, T.exito + 0.3);
    const x = XG + b.dx;
    const p = {
      x, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 + 9 * en - 8 * al },
      torso: b.torso + 0.035 * en, torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.02 * al },
      piernas: {}, cabeza: { ang: b.cab + 0.05 * en, dx: 0, dy: 5 * en, esc: { x: 1, y: 1 } },
      tirasLimpias: true
    };
    // asiente ilusionado al ver el mazo nuevo
    p.cabeza.ang += 0.07 * Math.sin((t - T.ilusion) * 11) * campana(t, T.ilusion, T.ilusion + 0.75);
    for (const lado of ["cerca", "lejos"]) p.piernas[lado] = { tob: { x: G.PELVIS.x + (PIES_G[lado] - x) / S, y: TOB_G[lado] }, ang: 0 };
    let e = linea(GUION_CG, CG, "inicio", t);
    e = mezclaE(e, ENCOGE_G, en * (1 - tramo(t, T.gSale - 0.3, T.gSale)));
    // mofletes: suelta el aire de golpe al ver que aguanta
    e.mof *= 1 - tramo(t, T.exito - 0.06, T.exito + 0.04);
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.sudor = 0.75 * campana(t, T.gArriba, T.exito + 0.1) + 0.5 * campana(t, T.miran - 0.2, T.saca + 0.2);
    const lk = lenguaK(t);
    p.capaCabeza = g => lengua(g, lk, p.cara.boca);
    // manos
    const Tr = G.tronco(p);
    const resuelve = lado => o => {
      if (o.bols) { const B = Tr(BOLS_G[lado]); return { x: B.x, y: B.y, mu: -1.75, ang: 0, puno: o.sale ? 1 : 0, dedos: D(0.4, 0.4, 0.4, 0.4) }; }
      const m = { mu: o.mu, ang: o.ang || 0 };
      let q;
      if (o.pinza) { const h = G.aHoja(p, o.pinza), f = offMano(m, PINZA); q = { x: h.x - f.x, y: h.y - f.y }; }
      else if (o.palma) { const h = G.aHoja(p, o.palma), f = offMano(m, PALMA); q = { x: h.x - f.x, y: h.y - f.y }; }
      return { x: q.x, y: q.y, mu: o.mu, ang: m.ang, puno: 1, dedos: o.dedos };
    };
    const L = pista(PISTA_GL, t, resuelve("l")), C = pista(PISTA_GC, t, resuelve("c"));
    // espera: la carta se mece un poco; al bajarla, le tiembla el pulso
    const ms = 1 - tramo(t, T.gSale - 0.1, T.gSale + 0.2);
    L.x += ms * 2.2 * Math.sin(t * 2.6) / S; L.y += ms * 1.2 * Math.sin(t * 3.3 + 1) / S;
    const tb = tiembla(t);
    L.x += tb * 1.3 * ruido(t * 31 + 3) / S; L.y += tb * 1.0 * ruido(t * 29 + 8) / S;
    p.manoLejos = { x: L.x, y: L.y, ang: L.ang, mu: L.mu, dobla: -1, puno: L.puno, dedos: L.dedos };
    p.manoCerca = { x: C.x, y: C.y, ang: C.ang, mu: C.mu, dobla: -1, puno: C.puno, dedos: C.dedos };
    // la carta de Guillermo en la pinza (hasta que la deja en lo alto)
    if (t < T.gDeja) {
      const pin = ptMano(G, p, L, PINZA), q = tramo(t, T.gSale + 0.12, T.gArriba - 0.05);
      // colgando se balancea un poco (y se sacude en cada sobresalto)
      const bal = (0.07 * Math.sin(t * 2.6 - 0.8) + 0.12 * en * Math.sin(t * 19)) * (1 - q);
      const A = cartaG(pin, q, bal);
      p.manoLejos.objeto = g => { if (!MATRIZ) return; g.save(); g.setTransform(MATRIZ); naipe(g, A, TECHO); g.restore(); };
    }
    return p;
  }

  /* ================= Deivi ================= */
  const CD = {
    base: E({ mx: 0.85, my: 0.55, sonr: 0.15, ancho: 0.8 }),
    concentra: E({ mx: 0.85, my: 0.66, c: 0.18, sonr: 0.0, ancho: 0.48, sd: 6, si: 10, gd: 0.05 }),
    alivio: E({ mx: 0.85, my: 0.4, c: 0.75, sonr: 0.35, ancho: 0.7, sd: 10, si: 10 }),
    cede: E({ mx: 0.95, my: 0.1, sonr: 0.55, ancho: 0.9, sd: 12, si: 16, gi: 0.06 }),
    mira: E({ mx: 0.88, my: 0.5, sonr: 0.05, ancho: 0.6, sd: 10, si: 12 }),
    aguanta: E({ mx: 0.85, my: 0.55, iris: 0.8, sonr: -0.05, ancho: 0.4, sd: 22, si: 18, mof: 0.95 }),
    alegria: E({ mx: 0.95, my: 0.1, h: 0.85, sonr: 0.95, abre: 20, ancho: 1.05, sd: 16, si: 16 }),
    horror: E({ mx: 0.6, my: -0.7, iris: 0.66, abre: 24, ancho: 0.6, sonr: -0.45, sd: 26, si: 26 }),
    vacio: E({ mx: 0.95, my: 0.06, c: 0.4, sonr: -0.08, ancho: 0.55, sd: 2, si: 2 }),
    picaro: E({ mx: 0.95, my: 0.08, sonr: 0.7, ancho: 0.9, sd: -6, si: 24, gi: 0.15 }),
    camara: E({ mx: -0.85, my: 0.05, wd: 1, sonr: 0.85, ancho: 0.95, sd: -2, si: 22, gi: 0.12 })
  };
  const SOPLO_D = E({ mx: 0.85, my: 0.55, c: 0.45, sonr: 0, ancho: 0.32, sd: 8, si: 8, mof: 0.55 });
  const GUION_CD = [
    [0.25, 0.5, "concentra"], [T.alivio, T.alivio + 0.2, "alivio"], [T.cede, T.cede + 0.2, "cede"], [T.cede1 + 0.1, T.cede1 + 0.3, "mira"],
    [T.gArriba - 0.1, T.gArriba + 0.15, "aguanta"], [T.exito, T.exito + 0.12, "alegria"], [T.horror + 0.03, T.horror + 0.2, "horror"],
    [T.miran, T.miran + 0.3, "vacio"], [T.saca, T.saca + 0.25, "picaro"], [T.guino, T.guino + 0.15, "camara"]
  ];
  const PARP_D = [0.3, 2.62, 4.95, 6.3, 9.9, 10.95];
  const P0D = { pel: 0, torso: 0.02, cab: 0.03 };
  const CuD = o => Object.assign({}, P0D, o);
  const CUER_D = {
    quieto: CuD({}),
    erguido: CuD({ torso: 0.05, cab: 0.06 }),
    coge: CuD({ torso: 0.1, cab: 0.11, pel: 5 }),
    coloca: CuD({ torso: 0.17, cab: 0.14, pel: 9 }),
    alivio: CuD({ torso: -0.05, cab: -0.12, pel: -2 }),
    cede: CuD({ torso: 0.03, cab: 0.0 }),
    aguanta: CuD({ torso: 0.07, cab: 0.09, pel: 4 }),
    alegria: CuD({ torso: -0.05, cab: -0.08, pel: -6 }),
    choque: CuD({ torso: 0.07, cab: -0.02 }),
    horror: CuD({ torso: -0.08, cab: -0.15, pel: 4 }),
    final: CuD({ torso: 0.02, cab: 0.02 }),
    ensena: CuD({ torso: -0.03, cab: -0.06 })
  };
  const GUION_D = [];
  for (const V of VIAJE) GUION_D.push([V.toma - 0.32, V.toma, "coge"], [V.toma + 0.02, V.sube, "coloca"], [V.suelta, V.suelta + 0.3, "erguido"]);
  GUION_D.push([T.alivio, T.alivio + 0.25, "alivio"], [T.cede, T.cede + 0.25, "cede"], [T.gArriba - 0.15, T.gArriba + 0.2, "aguanta"],
    [T.exito, T.exito + 0.14, "alegria", salida], [T.alza, T.choque, "choque"], [T.horror, T.horror + 0.3, "horror"], [T.baja, T.baja1, "final"],
    [T.saca, T.ensena, "ensena"]);
  const PINZA_D = D5(0.72, 0.68, 0.3, 0.26, 0.95), ANTES_D = D5(0.9, 0.9, 0.5, 0.45, 1), AGARRA_D = D(0.55, 0.45, 0.35, 0.3);
  // empieza ya en faena: la mano lejana flota sobre el mazo
  const PISTA_DL = [[0, 0, { pinza: { x: VIAJE[0].pinMazo.x + 6, y: VIAJE[0].pinMazo.y - 20 }, mu: -1.8, dedos: ANTES_D }]];
  {
    let antes = null;
    for (const V of VIAJE) {
      PISTA_DL.push([V.toma - 0.32, V.toma - 0.06, { pinza: { x: V.pinMazo.x - 2, y: V.pinMazo.y - 6 }, mu: -1.85, dedos: ANTES_D }]);
      PISTA_DL.push([V.toma - 0.06, V.toma, { pinza: V.pinMazo, mu: -1.85, dedos: PINZA_D }]);
      PISTA_DL.push([V.toma + 0.02, V.sube, { pinza: { x: V.pinHueco.x, y: V.pinHueco.y - 14 }, mu: -1.95, dedos: PINZA_D }]);
      PISTA_DL.push([V.sube + 0.02, V.deja, { pinza: V.pinHueco, mu: -1.95, dedos: PINZA_D }, salida]);
      PISTA_DL.push([V.deja + 0.02, V.suelta, { pinza: V.pinHueco, mu: -1.95, dedos: ANTES_D }]);
      PISTA_DL.push([V.suelta + 0.02, V.suelta + 0.24, { pinza: { x: V.pinHueco.x + 6, y: V.pinHueco.y - 16 }, mu: -1.9, dedos: ANTES_D }]);
      antes = V;
    }
    PISTA_DL.push([T.cede - 0.05, T.cede + 0.22, { palma: { x: 532, y: 232 }, mu: -3.05, dedos: ABIERTA }]);
    // mientras Guillermo pone el tejado: la mano flota sobre el borde de la mesa con los dedos abiertos
    PISTA_DL.push([T.cede1, T.cede1 + 0.4, { pinza: { x: 590, y: TY + 1 }, mu: -1.7, dedos: D5(0.9, 1, 0.95, 0.9, 1) }]);
    PISTA_DL.push([T.exito - 0.02, T.alza + 0.16, { palma: { x: CHOQUE.x + 34, y: CHOQUE.y - 24 }, mu: -4.35, dedos: ABIERTA }]);
    PISTA_DL.push([T.choque - 0.12, T.choque, { palma: { x: CHOQUE.x + MEDIO, y: CHOQUE.y }, mu: -4.55, dedos: ABIERTA }, entrada]);
    PISTA_DL.push([T.baja + 0.05, T.baja1 - 0.07, { bols: true, sale: true }]);
    PISTA_DL.push([T.baja1 - 0.07, T.baja1 + 0.05, { bols: true }]);
  }
  const ENSENA = { x: 606, y: 276 };
  const PISTA_DC = [
    [0, 0, { bols: true }],
    [T.bolsillo, T.saca, { bols: true, sale: true, mu: -1.75, dedos: AGARRA_D }],
    [T.saca + 0.02, T.ensena, { pinza: ENSENA, mu: -4.45, dedos: AGARRA_D }]
  ];

  function poseD(t) {
    const b = linea(GUION_D, CUER_D, "quieto", t);
    const respira = Math.sin(t * 1.9 + 1.4);
    const al = campana(t, T.exito, T.exito + 0.3);
    const p = {
      x: XD, suelo: SUELO, s: S, espejo: true,
      pelvis: { x: Dv.PELVIS.x, y: Dv.PELVIS.y + b.pel + respira * 1.1 - 8 * al },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.02 * al },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      tirasLimpias: true
    };
    // concentrado: la cabeza acompaña cada carta con un cabeceo mínimo
    p.cabeza.ang += 0.02 * Math.sin(t * 3.1) * campana(t, 0.5, T.alivio);
    // enseña el mazo: cejas que suben y bajan
    const ty = Dv.SUELO - Dv.TOBILLO_ALTO;
    p.piernas.cerca = { tob: { x: Dv.PELVIS.x - 88, y: ty }, ang: 0 };
    p.piernas.lejos = { tob: { x: Dv.PELVIS.x + 94, y: ty - 10 }, ang: 0 };
    let e = linea(GUION_CD, CD, "base", t);
    // tras posar cada carta suelta un soplidito
    let so = 0; for (const V of VIAJE) so = Math.max(so, campana(t, V.suelta - 0.02, V.suelta + 0.36));
    e = mezclaE(e, SOPLO_D, 0.8 * so);
    e.mof *= 1 - tramo(t, T.exito - 0.06, T.exito + 0.04);
    const cj = campana(t, T.ensena, T.ensena + 0.6);
    e.si += 10 * cj * Math.max(0, Math.sin((t - T.ensena) * 20));
    p.cara = cara(e, parpadeo(t, PARP_D, 0.13));
    p.sudor = 0.7 * campana(t, T.gArriba, T.exito + 0.1);
    // manos
    const resuelve = lado => o => {
      if (o.bols) { const m = Dv.manoReposo(p, lado); return { x: m.x, y: m.y, mu: o.mu ?? -1.75, ang: 0, puno: o.sale ? 1 : 0, dedos: o.dedos || D(0.4, 0.4, 0.4, 0.4) }; }
      const m = { mu: o.mu, ang: o.ang || 0 };
      let q;
      if (o.pinza) { const h = Dv.aHoja(p, o.pinza), f = offMano(m, PINZA); q = { x: h.x - f.x, y: h.y - f.y }; }
      else if (o.palma) { const h = Dv.aHoja(p, o.palma), f = offMano(m, PALMA); q = { x: h.x - f.x, y: h.y - f.y }; }
      return { x: q.x, y: q.y, mu: o.mu, ang: m.ang, puno: 1, dedos: o.dedos };
    };
    const L = pista(PISTA_DL, t, resuelve("lejos")), C = pista(PISTA_DC, t, resuelve("cerca"));
    p.manoLejos = { x: L.x, y: L.y, ang: L.ang, mu: L.mu, dobla: -1, puno: L.puno, dedos: L.dedos };
    p.manoCerca = { x: C.x, y: C.y, ang: C.ang, mu: C.mu, dobla: -1, puno: C.puno, dedos: C.dedos };
    // cartas en la pinza: salen del mazo tumbadas y se pliegan en su forma del castillo
    const V = VIAJE.find(v => t >= v.toma && t < v.deja);
    if (V) {
      const pin = ptMano(Dv, p, L, PINZA), k = tramo(t, V.toma, V.toma + 0.3);
      const As = V.ns.map((n, j) => {
        const sd = (n.cara ? -1 : 1) * (n.s0 ? 1 : -1);
        const A0 = mueveA(capaMazo(V.antes - 1 - j, sd), { x: -V.pinMazo.x, y: -V.pinMazo.y });
        const A1 = mueveA(n.base, { x: -V.pinHueco.x, y: -V.pinHueco.y });
        return mueveA(lerpA(A0, A1, k), pin);
      });
      p.manoLejos.objeto = g => { if (!MATRIZ) return; g.save(); g.setTransform(MATRIZ); V.ns.forEach((n, j) => naipe(g, As[j], n)); g.restore(); };
    }
    // mazo nuevo en la mano cercana
    if (t >= T.bolsillo + 0.05) {
      const pin = ptMano(Dv, p, C, PINZA), k = clamp(C.puno);
      p.manoCerca.objeto = g => { if (!MATRIZ) return; g.save(); g.setTransform(MATRIZ); mazoNuevo(g, pin, k, t); g.restore(); };
    }
    return p;
  }
  // mazo nuevo: tres cartas apiladas en vertical, de pie sobre la pinza (con un destello al enseñarlo)
  function mazoNuevo(g, pin, k, t) {
    if (k <= 0.02) return;
    for (let j = 3; j >= 0; j--) {
      const A = { c: { x: pin.x + j * 1.1, y: pin.y - LN * 0.4 * k - j * 1.1 }, a: { x: AN * 0.95 * k, y: 0 }, b: { x: 0, y: -LN * k } };
      naipe(g, A, DORSO_M);
    }
    const kb = campana(t, T.ensena - 0.05, T.ensena + 0.45);
    if (kb > 0.01) {
      const cx = pin.x - 6, cy = pin.y - LN * 0.75, r = 16 * kb, a = t * 2;
      g.save(); g.globalAlpha = kb; g.fillStyle = "#ffffff"; g.beginPath();
      for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.16 : r, an = a + i * Math.PI / 4; g.lineTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr); }
      g.closePath(); g.fill(); g.restore();
    }
  }

  /* ================= efectos ================= */
  // golpe de los cinco: estrella blanca y rayitas
  function golpe(g, t) {
    const k = fase(t, T.choque, T.choque + 0.32); if (k <= 0 || k >= 1) return;
    const cr = salida(clamp(k / 0.2)), a = 1 - suave(clamp((k - 0.2) / 0.8));
    const x = CHOQUE.x, y = CHOQUE.y - 4;
    g.save(); g.globalAlpha = 0.95 * a;
    g.fillStyle = "#fff6c8"; g.beginPath();
    for (let i = 0; i < 16; i++) { const rr = (i % 2 ? 9 : 22) * cr, an = i * Math.PI / 8 + 0.2; g.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
    g.closePath(); g.fill();
    g.strokeStyle = "#ffffff"; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = 0; i < 6; i++) { const an = -Math.PI / 2 + (i - 2.5) * 0.42, r0 = 24 + 10 * cr, r1 = r0 + 12 * cr;
      g.beginPath(); g.moveTo(x + Math.cos(an) * r0, y + Math.sin(an) * r0); g.lineTo(x + Math.cos(an) * r1, y + Math.sin(an) * r1); g.stroke(); }
    g.restore();
  }
  // golpe de aire: ondas que bajan desde las palmas y rizos de viento
  function soplo(g, t) {
    for (let i = 0; i < 3; i++) {
      const k = fase(t, T.choque + 0.02 + i * 0.08, T.choque + 0.62 + i * 0.08); if (k <= 0 || k >= 1) continue;
      const r = 10 + 120 * salida(k), a = (1 - k) * (1 - k);
      g.save(); g.globalAlpha = 0.6 * a; g.strokeStyle = "#ffffff"; g.lineCap = "round"; g.lineWidth = 1.5 + 3 * (1 - k);
      g.beginPath(); g.ellipse(CHOQUE.x, CHOQUE.y + 8, r, r * 0.55, 0, 0.12 * Math.PI, 0.88 * Math.PI); g.stroke();
      g.globalAlpha = 0.25 * a; g.beginPath(); g.ellipse(CHOQUE.x, CHOQUE.y + 8, r * 0.8, r * 0.4, 0, 1.2 * Math.PI, 1.8 * Math.PI); g.stroke();
      g.restore();
    }
    const k = fase(t, T.choque + 0.04, T.choque + 0.7); if (k <= 0 || k >= 1) return;
    g.save(); g.strokeStyle = "#ffffff"; g.lineCap = "round"; g.lineWidth = 1.6;
    for (let i = 0; i < 6; i++) {
      const s = i % 2 ? 1 : -1, d = 10 + 70 * salida(k) * (0.7 + 0.4 * hash(i + 300)), y0 = CHOQUE.y + 14 + 10 * i * 0.5;
      g.globalAlpha = 0.5 * Math.sin(Math.PI * k);
      g.beginPath(); g.moveTo(CHOQUE.x + s * (d - 14), y0 + d * 0.35); g.quadraticCurveTo(CHOQUE.x + s * d, y0 + d * 0.3 + 6, CHOQUE.x + s * (d + 4), y0 + d * 0.5);
      g.arc(CHOQUE.x + s * (d + 4) - s * 3, y0 + d * 0.5 + 0.1, 3, s > 0 ? 0 : Math.PI, s > 0 ? Math.PI * 1.4 : -Math.PI * 0.4, s < 0); g.stroke();
    }
    g.restore();
  }

  /* ================= escena ================= */
  const pose = t => ({ g: poseG(t), d: poseD(t) });
  // cámara: casi general; se acerca mientras Guillermo pone el tejado y se abre para el derrumbe
  const PLANOS = [
    [0, 1.2, 516, 333], [4.5, 1.22, 514, 333], [5.5, 1.24, 508, 332], [7.75, 1.24, 508, 332], [8.35, 1.0, 512, 318], [10.3, 1.0, 512, 318],
    [11.2, 1.1, 522, 334], [DUR, 1.12, 522, 334]
  ];
  function camara(t) {
    let i = 0; while (i < PLANOS.length - 2 && t > PLANOS[i + 1][0]) i++;
    const a = PLANOS[i], b = PLANOS[i + 1], k = suave(fase(t, a[0], b[0]));
    const kk = lerp(a[1], b[1], k), x = lerp(a[2], b[2], k), y = lerp(a[3], b[3], k);
    const mx = W / 2 / kk, my = H / 2 / kk;
    return { k: kk, x: clamp(x, mx - 40, W + 40 - mx), y: clamp(y, my - 60, H + 60 - my) };
  }

  class GuillermoDeiviCastillo extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Dv.listo()) return;
      if (!fondo) fondo = creaFondo();
      const pG = poseG(t), pD = poseD(t);
      const luz = tramo(t, NEGRO_INICIO, 0.75, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      MATRIZ = g.getTransform();
      g.drawImage(fondo, -40, -60);
      // sombras de los dos
      g.save(); g.fillStyle = "rgba(0,0,0,0.35)";
      g.beginPath(); g.ellipse(pG.x + 4, SUELO + 2, 62, 7, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pD.x - 4, SUELO + 2, 60, 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
      // mazo
      const nm = enMazo(t);
      for (let i = 0; i < nm; i++) naipe(g, capaMazo(i, -1), DORSO_M);
      // castillo y naipes ya caídos en la mesa
      const est = NAIPES.map(n => ({ n, e: puesto(n, t) ? estadoNaipe(n, t) : null })).filter(o => o.e);
      const sombra = est.filter(o => o.e.modo === "castillo").length;
      if (sombra) { g.save(); g.fillStyle = `rgba(0,20,8,${0.03 * Math.min(8, sombra)})`; g.beginPath(); g.ellipse(CX, TY + 1, 54, 6, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
      est.filter(o => o.e.modo === "mesa").sort((a, b) => planVuelo(a.n).t0 + planVuelo(a.n).tau - planVuelo(b.n).t0 - planVuelo(b.n).tau).forEach(o => naipe(g, o.e.A, o.n));
      est.filter(o => o.e.modo === "castillo").forEach(o => naipe(g, o.e.A, o.n));
      Dv.dibujar(g, pD, t);
      G.dibujar(g, pG, t);
      // naipes por el aire, en el suelo y en la cabeza
      est.filter(o => o.e.modo === "suelo").sort((a, b) => a.e.A.c.y - b.e.A.c.y).forEach(o => naipe(g, o.e.A, o.n));
      est.filter(o => o.e.modo === "aire" || o.e.modo === "cabeza").forEach(o => naipe(g, o.e.A, o.n));
      golpe(g, t);
      soplo(g, t);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00064", nombre: "Guillermo y Deivi · El castillo de naipes", crear: () => new GuillermoDeiviCastillo() });
  window.__A2D_00064 = { pose, poseG, poseD, T, DUR };
})();
