"use strict";
/* 00059 · Guillermo y Dari · El abrigo
 *
 * Negro → noche helada a la puerta del bar, nevando. Guillermo (a la izquierda, en camiseta) y Dari (a la derecha,
 * con su parka beis) acaban de salir. Dari, tan tranquilo, se sube la cremallera hasta la barbilla, se pone la
 * capucha y tira del cordón: un tirón, dos, tres… hasta que de la capucha solo asoman las gafas y el bigote.
 * Guillermo tirita, castañetea y se hace el valiente (brazos en jarras, sonrisa forzada) → una ráfaga de viento le
 * deja tieso: azulado, con un montón de nieve en el pelo y un carámbano colgando de la nariz. Le pone ojitos de pena
 * a Dari; Dari le mira de reojo… suspira (nube de vaho), se baja la cremallera y abre la parka de par en par como una
 * tienda de campaña (forro rojo y calorcito). Guillermo se tira de cabeza dentro; la parka se cierra a su alrededor,
 * la cremallera sube de golpe y quedan dos cabezas asomando de un solo abrigo, estirado a reventar. Guillermo se
 * descongela (de azul a mofletes rosas, le sale vapor del pelo y el carámbano se cae y se clava en la nieve) y Dari,
 * por fin, sonríe bajo el bigote. Se van andando juntos hacia la izquierda como un bicho de cuatro patas (con las
 * mangas vacías bailando); en la acera quedan sus huellas y el carámbano clavado → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto (la nieve, el viento y las huellas son deterministas). La capucha y
 * los cordones son una capa de la cabeza de Dari (encima de sus gafas); la cremallera y la parka abierta, una capa de
 * su torso. La parka compartida se dibuja encima de los dos cuerpos, pegada a sus hombros, cuellos y pelvis, y deja
 * fuera las dos cabezas y las cuatro piernas. El frío de Guillermo es un tinte sobre los polígonos de piel de su cara
 * y su cuello (como en 00006) y el carámbano, la nieve del pelo y el vapor van en su capa de la cara.
 */
(() => {
  const { clamp, lerp, suave, salida, entrada, campana, mezcla, ruido, hash } = M2;
  // fase y tramo a prueba de tramos de duración cero (sin NaN)
  const fase = (t, a, b) => b - a > 1e-9 ? clamp((t - a) / (b - a)) : (t >= b ? 1 : 0);
  const tramo = (t, a, b, f = suave) => f(fase(t, a, b));
  const dentro = (t, a, b, c, d) => tramo(t, a, b) * (1 - tramo(t, c, d));
  const G = Guillermo, D = Dari;
  const S = 0.30, SUELO = 560;
  const XG = 296, XD = 612, XG_IN = 470;         // pelvis (pantalla): Guillermo, Dari y Guillermo dentro de la parka
  const PASO = 760, PASOS = 18;                  // se van: distancia y pasos de cada uno
  const DUR = 14.6;
  const T = {
    zipA: 0.5, zip0: 0.76, zip1: 1.2, zipFin: 1.55,                       // Dari se sube la cremallera
    cap0: 1.42, capAg: 1.68, cap1: 2.1, capFin: 2.45,                      // se pone la capucha
    tug0: 2.32, tugA: 2.6, tugs: [2.7, 3.1, 3.5], tugFin: 3.82,            // tres tirones del cordón
    bravo0: 2.72, bravo1: 3.9,                                             // Guillermo se hace el valiente
    viento0: 3.92, viento1: 4.95,                                          // ráfaga
    tink: 4.42, helado1: 5.25,                                             // se queda tieso (carámbano)
    pena0: 5.3, dMira: 5.72, suspiro0: 6.32, suspiro1: 6.95,               // ojitos de pena · Dari mira y suspira
    abre0: 6.95, baja0: 7.06, baja1: 7.2, abre1: 7.52,                     // baja la cremallera y abre la parka
    ilusion: 7.38, agacha0: 7.72, salto0: 8.04, salto1: 8.5,               // ¡bien! y se tira dentro
    cierra0: 8.48, cierra1: 8.8, gira0: 8.55, gira1: 8.86, zipB0: 8.9, zipB1: 9.06,
    deshiela0: 9.3, deshiela1: 10.4, rosa0: 9.7, rosa1: 10.45, cae: 10.68,
    sonrisaD: 10.35, vaho2: 10.5,
    anda0: 11.05, anda1: 13.75, fin: 14.1
  };

  /* ---------- afinidades 2D (como el lienzo: x' = a·x + c·y + e, y' = b·x + d·y + f) ---------- */
  const AF = {
    mul: (m, n) => ({ a: m.a * n.a + m.c * n.b, b: m.b * n.a + m.d * n.b, c: m.a * n.c + m.c * n.d, d: m.b * n.c + m.d * n.d,
      e: m.a * n.e + m.c * n.f + m.e, f: m.b * n.e + m.d * n.f + m.f }),
    tras: (x, y) => ({ a: 1, b: 0, c: 0, d: 1, e: x, f: y }),
    rot: a => { const c = Math.cos(a), s = Math.sin(a); return { a: c, b: s, c: -s, d: c, e: 0, f: 0 }; },
    esc: (x, y = x) => ({ a: x, b: 0, c: 0, d: y, e: 0, f: 0 }),
    inv: m => { const k = m.a * m.d - m.b * m.c; return { a: m.d / k, b: -m.b / k, c: -m.c / k, d: m.a / k, e: (m.c * m.f - m.d * m.e) / k, f: (m.b * m.e - m.a * m.f) / k }; },
    ap: (m, q) => ({ x: m.a * q.x + m.c * q.y + m.e, y: m.b * q.x + m.d * q.y + m.f })
  };
  const mul = (...ms) => ms.reduce((a, b) => AF.mul(a, b));
  const mPers = (R, p) => { const k = p.s * (R.K || 1); return mul(AF.tras(p.x, p.suelo), AF.esc(p.espejo ? -k : k, k), AF.tras(-R.PELVIS.x, -R.SUELO)); };
  function mCab(R, p) {        // retrato → hoja
    const H = R.cabeza(p), o = H.a({ x: 0, y: 0 }), ex = H.a({ x: 1, y: 0 }), ey = H.a({ x: 0, y: 1 });
    return { a: ex.x - o.x, b: ex.y - o.y, c: ey.x - o.x, d: ey.y - o.y, e: o.x, f: o.y };
  }
  // hoja → coordenadas propias del torso (las de capaTronco)
  const aTorso = (R, p, q) => { const x = q.x - p.pelvis.x, y = q.y - p.pelvis.y, c = Math.cos(-p.torso), s = Math.sin(-p.torso);
    return { x: R.PELVIS.x + (x * c - y * s) / p.torsoEsc.x, y: R.PELVIS.y + (x * s + y * c) / p.torsoEsc.y }; };
  const scr = (R, p, q) => R.aPantalla(p, q);

  /* ---------- utilidades de poses ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const BASE = { mx: 0.85, my: 0, c: 0, cd: -1, ci: -1, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, esp: 0, mof: 0, rub: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    const cd = e.cd >= 0 ? e.cd : e.c, ci = e.ci >= 0 ? e.ci : e.c;
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: Math.max(cd, parp), i: Math.max(ci, parp), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }
  const parpadeo = (t, lista, d = 0.15) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const D0 = { pulgar: 0, indice: 0, medio: 0, anular: 0, menique: 0 };
  const DD = (pulgar, indice, medio, anular, menique) => ({ pulgar, indice, medio, anular, menique });
  const RELAJADA = DD(0.5, 0.55, 0.5, 0.45, 0.42), ABIERTA = DD(1, 1, 1, 1, 1), PINZA = DD(0.55, 0.45, 0.3, 0.25, 0.25),
    AGARRA = DD(0.45, 0.32, 0.3, 0.3, 0.3), PALMA = DD(0.8, 0.9, 0.9, 0.85, 0.8), PUNO = DD(0.2, 0, 0, 0, 0);
  const mezclaD = (a, b, w) => { const o = {}; for (const n in D0) o[n] = lerp(a[n], b[n], w); return o; };
  const R_M = G.MUNECA_R * G.JK;
  const bolsilloG = (p, lado) => { const b = G.tronco(p)(lado === "cerca" ? { x: 131, y: 652 } : { x: 372, y: 648 });
    const o = { x: Math.cos(-1.75) * R_M, y: Math.sin(-1.75) * R_M }; return { x: b.x - o.x, y: b.y - o.y }; };
  const bolsilloD = (p, lado) => { const m = D.manoReposo(p, lado); return { x: m.x, y: m.y }; };
  const DOBLA = { g: { cerca: -1, lejos: -1 }, d: { cerca: -1, lejos: 1 } };
  function manoInicial(R, p, lado) {
    const q = R === G ? bolsilloG(p, lado) : bolsilloD(p, lado);
    return { x: q.x, y: q.y, ang: 0, mu: -1.75, puno: 0, dobla: DOBLA[R === G ? "g" : "d"][lado], dedos: RELAJADA };
  }
  const muHacia = (R, p, q, lado) => { const h = R.tronco(p)(lado === "cerca" ? R.HOMBRO_C : R.HOMBRO); return Math.atan2(h.y - q.y, h.x - q.x); };
  function pone(R, p, m, lado, w, o) {
    if (w <= 0.0001) return;
    const q = o.q, mu = o.mu ?? muHacia(R, p, q, lado);
    m.x = lerp(m.x, q.x, w); m.y = lerp(m.y, q.y, w); m.ang = lerp(m.ang, o.ang || 0, w); m.mu = lerp(m.mu, mu, w);
    m.puno = lerp(m.puno, o.puno ?? 1, w); m.dedos = mezclaD(m.dedos, o.d || RELAJADA, w);
  }
  const vuelveBolsillo = (R, p, lado) => { const q = R === G ? bolsilloG(p, lado) : bolsilloD(p, lado); return { q, mu: -1.75, puno: 0, d: RELAJADA }; };

  // Andar de x0 a x1 en n pasos (pies alternos, empezando por `primero`); offs: pie respecto a la pelvis.
  function anda(t, t0, t1, x0, x1, n, primero, offs, alza) {
    const d = (t1 - t0) / n, X = tt => { const u = fase(tt, t0, t1); return lerp(x0, x1, u * u * (2 - u)); };   // arranca suave y no frena (sale de cuadro)
    const pies = {};
    for (const lado of ["cerca", "lejos"]) {
      const mios = []; for (let k = 0; k < n; k++) if ((k % 2 === 0) === (lado === primero)) mios.push(k);
      let x = x0, a = 0, ang = 0;
      mios.forEach((k, j) => {
        const u = fase(t, t0 + k * d, t0 + (k + 1) * d); if (u <= 0) return;
        const L = j === mios.length - 1 ? x1 : X(t0 + (k + 1.5) * d);
        const P = j === 0 ? x0 : X(t0 + (mios[j - 1] + 1.5) * d);
        x = lerp(P, L, suave(u)); if (u < 1) { a = alza * Math.sin(Math.PI * u); ang = 0.28 * Math.sin(2 * Math.PI * u); }
      });
      pies[lado] = { x: x + offs[lado], alza: a, ang };
    }
    const media = (pies.cerca.x - offs.cerca + pies.lejos.x - offs.lejos) / 2;
    return { x: media, pies, bob: Math.max(pies.cerca.alza, pies.lejos.alza) };
  }
  const OFF_G = dir => ({ cerca: -22 * dir, lejos: 20 * dir }), OFF_D = { cerca: 24, lejos: -20 };
  const andaG = t => anda(t, T.anda0, T.anda1, XG_IN, XG_IN - PASO, PASOS, "lejos", OFF_G(-1), 20);
  const andaD = t => anda(t, T.anda0, T.anda1, XD, XD - PASO, PASOS, "cerca", OFF_D, 20);

  /* =====================================================================================
   * VIENTO Y NIEVE (deterministas: el desplazamiento del viento es una integral tabulada)
   * ===================================================================================== */
  const racha = t => dentro(t, T.viento0, T.viento0 + 0.18, T.viento1 - 0.3, T.viento1);
  const VIENTO = (() => {             // desplazamiento acumulado hacia la izquierda (px), cada 1/120 s
    const n = Math.ceil(DUR * 120) + 2, a = new Float32Array(n); let s = 0;
    for (let i = 0; i < n; i++) { a[i] = s; const t = i / 120; s += (14 + 330 * racha(t)) / 120; }
    return a;
  })();
  const viento = t => { const f = clamp(t, 0, DUR) * 120, i = Math.floor(f), k = f - i; return lerp(VIENTO[i], VIENTO[i + 1], k); };
  const COPOS_LEJOS = [], COPOS_CERCA = [];
  for (let i = 0; i < 64; i++) COPOS_LEJOS.push({ x: hash(i * 3 + 1) * 1240, y: hash(i * 7 + 2) * 700, v: 26 + 22 * hash(i + 40), r: 1.1 + 1.3 * hash(i + 90), f: hash(i + 7) * 6.28, p: 0.55 + 0.3 * hash(i + 300) });
  for (let i = 0; i < 20; i++) COPOS_CERCA.push({ x: hash(i * 5 + 11) * 1240, y: hash(i * 9 + 13) * 700, v: 70 + 40 * hash(i + 140), r: 2.6 + 2.2 * hash(i + 190), f: hash(i + 17) * 6.28, p: 1.4 + 0.4 * hash(i + 400) });
  const modp = (a, m) => ((a % m) + m) % m;
  function nieva(g, t, lista, alfa) {
    const vx = viento(t), rf = racha(t);
    g.save(); g.fillStyle = "#ffffff"; g.strokeStyle = "#ffffff"; g.lineCap = "round";
    for (const c of lista) {
      const y = modp(c.y + c.v * t, 700) - 60, x = modp(c.x - vx * c.p + 9 * Math.sin(t * 1.3 + c.f), 1240) - 108;
      g.globalAlpha = alfa;
      if (rf > 0.15) { g.lineWidth = c.r * 1.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 26 * rf * c.p, y - 4 * rf); g.stroke(); }
      else { g.beginPath(); g.arc(x, y, c.r, 0, Math.PI * 2); g.fill(); }
    }
    g.restore();
  }

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  const CARAS_G = {
    frio: E({ mx: 0.5, my: 0.15, c: 0.35, orig: 0, sonr: -0.35, ancho: 0.8, abre: 4, sd: 10, gd: 0.18, si: 10, gi: 0.18 }),
    mira: E({ mx: 0.95, my: 0, c: 0.12, orig: 0, sonr: -0.3, ancho: 0.75, abre: 4, sd: 14, gd: 0.2, si: 14, gi: 0.2 }),
    envidia: E({ mx: 0.95, my: -0.05, c: 0.42, orig: 0, sonr: -0.2, ancho: 0.7, abre: 3, sd: -4, gd: -0.14, si: 6, gi: 0.12 }),
    bravo: E({ mx: -0.4, my: 0, c: 0.1, orig: 0, sonr: 0.8, ancho: 1.05, abre: 7, sd: 12, gd: 0.04, si: 12, gi: 0.04 }),
    helado: E({ mx: 0.3, my: 0.05, iris: 0.62, orig: 0, sonr: -0.15, ancho: 0.7, abre: 16, sd: 28, gd: 0.1, si: 28, gi: 0.1 }),
    pena: E({ mx: 0.95, my: -0.3, iris: 1.3, c: 0.04, orig: 0, sonr: -0.5, ancho: 0.55, abre: 2, sd: 20, gd: 0.4, si: 20, gi: 0.4 }),
    ilusion: E({ mx: 0.95, my: 0, iris: 1.25, orig: 0, sonr: 0.9, ancho: 1, abre: 18, sd: 26, gd: 0.1, si: 26, gi: 0.1 }),
    salta: E({ mx: 0.95, c: 0.55, orig: 0, sonr: 0.8, ancho: 1, abre: 10, sd: 16, gd: 0.1, si: 16, gi: 0.1 }),
    apreta: E({ c: 1, z: 1, orig: 0, sonr: 0.5, ancho: 0.9, abre: 0, sd: 6, si: 6 }),
    dentro: E({ mx: 0.6, my: 0.1, c: 0.25, orig: 0, sonr: 0.25, ancho: 0.85, abre: 3, sd: 8, gd: 0.12, si: 8, gi: 0.12 }),
    gusto: E({ mx: 0.6, c: 1, h: 1, orig: 0, sonr: 0.85, ancho: 1, abre: 4, sd: 14, gd: 0.15, si: 14, gi: 0.15, mof: 0.25, rub: 1 }),
    feliz: E({ mx: 0.95, c: 0.15, h: 0.3, orig: 0, sonr: 0.8, ancho: 1, abre: 6, sd: 10, gd: 0.05, si: 10, gi: 0.05, rub: 1 })
  };
  const GUION_CARA_G = [
    [0.5, 0.8, "frio"], [0.95, 1.15, "mira"], [2.15, 2.4, "envidia"], [T.bravo0, T.bravo0 + 0.2, "bravo"],
    [T.viento0, T.viento0 + 0.12, "helado"], [T.pena0, T.pena0 + 0.35, "pena"], [T.ilusion, T.ilusion + 0.15, "ilusion"],
    [T.salto0 - 0.05, T.salto0 + 0.1, "salta"], [T.salto1 - 0.04, T.salto1 + 0.05, "apreta"], [T.gira1 - 0.05, T.gira1 + 0.15, "dentro"],
    [T.rosa0 - 0.15, T.rosa0 + 0.2, "gusto"], [T.anda0 - 0.2, T.anda0 + 0.1, "feliz"]
  ];
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const ladoG = t => t < (T.gira0 + T.gira1) / 2 ? 1 : -1;
  const giroG = t => Math.abs(Math.cos(Math.PI * fase(t, T.gira0, T.gira1)));
  // frío de Guillermo: tiritar, azul y deshielo
  const E_ABRAZO = t => dentro(t, 0.42, 0.72, T.bravo0 - 0.08, T.bravo0 + 0.12);
  const E_BRAVO = t => dentro(t, T.bravo0, T.bravo0 + 0.28, T.viento0 - 0.02, T.viento0 + 0.1);
  const E_HELADO = t => dentro(t, T.viento0, T.viento0 + 0.12, T.pena0 - 0.05, T.pena0 + 0.3);
  const E_PENA = t => dentro(t, T.pena0, T.pena0 + 0.32, T.ilusion - 0.05, T.ilusion + 0.15);
  const E_ILUSION = t => dentro(t, T.ilusion, T.ilusion + 0.15, T.agacha0, T.agacha0 + 0.15);
  const E_AGACHA = t => dentro(t, T.agacha0, T.salto0 - 0.02, T.salto0, T.salto0 + 0.1);
  const E_SALTO = t => dentro(t, T.salto0 - 0.02, T.salto0 + 0.1, T.salto1 - 0.06, T.salto1 + 0.06);
  const tiesoG = t => dentro(t, T.tink - 0.06, T.tink + 0.02, T.helado1 - 0.25, T.helado1);
  const tiritaG = t => clamp(0.3 + 0.5 * tramo(t, 0.6, 2.3) - 0.25 * E_BRAVO(t) + 0.7 * dentro(t, T.viento0, T.viento0 + 0.12, T.tink - 0.1, T.tink)
    - 0.5 * tiesoG(t) - 0.55 * E_ILUSION(t) - 0.6 * dentro(t, T.agacha0 - 0.1, T.agacha0, 30, 31)
    + 0.35 * dentro(t, T.cierra1, T.cierra1 + 0.1, T.deshiela0, T.deshiela0 + 0.5), 0, 1.3);
  const azulG = t => clamp(0.3 + 0.35 * tramo(t, 0.6, 3.2) + 0.35 * tramo(t, T.viento0 + 0.1, T.tink + 0.1)) * (1 - tramo(t, T.deshiela0, T.deshiela1));
  const rosaG = t => tramo(t, T.rosa0, T.rosa1);

  function cuerpoG(t) {
    const dir = ladoG(t), respira = Math.sin(t * 2.6), tir = tiritaG(t);
    const ab = E_ABRAZO(t), br = E_BRAVO(t), he = E_HELADO(t), pe = E_PENA(t), il = E_ILUSION(t), ag = E_AGACHA(t), sa = E_SALTO(t);
    const offs = OFF_G(dir);
    let x = XG, suelo = SUELO, bob = 0;
    let pies = { cerca: { x: XG + offs.cerca, alza: 0, ang: 0 }, lejos: { x: XG + offs.lejos, alza: 0, ang: 0 } };
    // salto: arco de la pelvis y piernas recogidas
    const u = fase(t, T.salto0, T.salto1), aire = dentro(t, T.salto0, T.salto0 + 0.1, T.salto1 - 0.1, T.salto1);
    if (t >= T.salto0) {
      x = lerp(XG, XG_IN, 0.5 - 0.5 * Math.cos(Math.PI * u)); suelo = SUELO - 92 * 4 * u * (1 - u);
      pies = { cerca: { x: x + offs.cerca, alza: 0, ang: 0 }, lejos: { x: x + offs.lejos, alza: 0, ang: 0 } };
    }
    if (t >= T.anda0) { const a = andaG(t); x = a.x; pies = a.pies; bob = a.bob; }
    // botecito de ilusión, agachado antes de saltar y al aterrizar
    const bote = il * Math.abs(Math.sin((t - T.ilusion) * 14));
    const aterriza = campana(t, T.salto1 - 0.02, T.salto1 + 0.3);
    const gira = campana(t, T.gira0, T.gira1);
    const torso = 0.07 * ab + 0.05 * he - 0.07 * br + 0.1 * pe + 0.03 * il + 0.26 * ag + 0.42 * sa + 0.12 * aterriza
      + (t > T.gira1 ? -0.03 * dentro(t, T.rosa0, T.rosa1, 30, 31) + 0.03 * dentro(t, T.anda0, T.anda0 + 0.3, 30, 31) : 0)
      + ruido(t * 38) * 0.014 * tir + 0.005 * Math.sin(t * 1.4);
    const p = {
      x: x + ruido(t * 41 + 3) * 1.8 * tir, suelo, s: S, espejo: dir < 0, tirasLimpias: true, ikContinuo: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + respira * 1.2 * (1 - tiesoG(t)) + 12 * he + 10 * pe + 70 * ag + 14 * bote + 55 * aterriza + 20 * gira + 0.6 * bob },
      torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.02 * tir * Math.sin(t * 47) },
      piernas: {},
      cabeza: { ang: -0.09 * br + 0.13 * pe * (1 + 0.15 * Math.sin(t * 3)) - 0.24 * sa + 0.05 * aterriza - 0.04 * il + ruido(t * 36 + 5) * 0.03 * tir
          + (t > T.gira1 ? -0.07 * dentro(t, T.rosa0, T.rosa1, T.anda0, T.anda0 + 0.3) : 0),
        dx: 0, dy: 16 * clamp(tir) * (1 - br) + 6 * he, esc: { x: 1, y: 1 } }
    };
    for (const lado of ["cerca", "lejos"]) {
      const f = pies[lado];
      let tob = { x: G.aHoja(p, { x: f.x, y: 0 }).x, y: TOB_G[lado] - f.alza / S }, ang = f.ang;
      if (aire > 0) {    // en el aire: piernas recogidas hacia atrás
        const q = lado === "cerca" ? { x: G.PELVIS.x - 190, y: TOB_G.cerca - 190 } : { x: G.PELVIS.x - 90, y: TOB_G.lejos - 250 };
        tob = mezcla(tob, q, aire); ang = lerp(ang, lado === "cerca" ? -0.7 : -0.45, aire);
      }
      p.piernas[lado] = { tob, ang };
    }
    // cara
    const ex = guion(GUION_CARA_G, CARAS_G, "frio", t);
    const cast = clamp(tir) * (1 - tiesoG(t)) * (t < T.cierra1 + 0.6 ? 1 : 1 - tramo(t, T.deshiela0, T.deshiela0 + 0.5));
    ex.abre += 5 * cast * (0.5 + 0.5 * Math.sin(t * 46));          // castañetea
    p.cara = cara(ex, parpadeo(t, [1.9, 3.55, 6.05, 7.0, 9.25, 12.2]));
    p.cara.rubor = ex.rub * rosaG(t);
    p.tt = t;
    return p;
  }
  function manosG(P) {
    const p = P.g, t = P.t, Tr = G.tronco(p), H = G.cabeza(p), dir = ladoG(t);
    const c = manoInicial(G, p, "cerca"), l = manoInicial(G, p, "lejos");
    // abrazado a sí mismo, frotándose los brazos (y luego tieso)
    const fr = Math.sin(t * 13) * (1 - tiesoG(t)), ab = Math.max(E_ABRAZO(t), E_HELADO(t));
    pone(G, p, l, "lejos", ab, { q: Tr({ x: 132, y: 476 + 16 * fr }), d: PALMA, mu: -0.35 });
    pone(G, p, c, "cerca", ab, { q: Tr({ x: 318, y: 452 - 16 * fr }), d: PALMA, mu: 2.9 });
    // «yo no tengo frío»: brazos en jarras
    const br = E_BRAVO(t);
    pone(G, p, c, "cerca", br, { q: Tr({ x: 112, y: 640 }), d: PUNO, mu: -2.1 });
    pone(G, p, l, "lejos", br, { q: Tr({ x: 392, y: 640 }), d: PUNO, mu: -1.0 });
    // ojitos de pena: manos juntas bajo la barbilla
    const pe = E_PENA(t), tiem = 4 * Math.sin(t * 21);
    pone(G, p, c, "cerca", pe, { q: H.a({ x: 836, y: 930 + tiem }), d: PALMA, mu: 1.9 });
    pone(G, p, l, "lejos", pe, { q: H.a({ x: 880, y: 925 + tiem }), d: PALMA, mu: 1.6 });
    // ¡bien!: puños a la altura del pecho, dando botes
    const il = E_ILUSION(t), bt = 14 * Math.abs(Math.sin((t - T.ilusion) * 14));
    pone(G, p, c, "cerca", il, { q: Tr({ x: 250, y: 470 - bt }), d: PUNO, mu: 1.75 });
    pone(G, p, l, "lejos", il, { q: Tr({ x: 400, y: 470 - bt }), d: PUNO, mu: 1.4 });
    // coge impulso (brazos atrás) y se tira de cabeza (brazos por delante)
    const ag = E_AGACHA(t);
    pone(G, p, c, "cerca", ag, { q: Tr({ x: 10, y: 690 }), d: ABIERTA, mu: -0.9 });
    pone(G, p, l, "lejos", ag, { q: Tr({ x: 130, y: 720 }), d: ABIERTA, mu: -1.2 });
    const sa = E_SALTO(t);
    pone(G, p, c, "cerca", sa, { q: Tr({ x: 405, y: 330 }), d: ABIERTA, mu: Math.PI - 0.05 });
    pone(G, p, l, "lejos", sa, { q: Tr({ x: 600, y: 350 }), d: ABIERTA, mu: Math.PI - 0.1 });
    // dentro de la parka: se abraza (no se ven)
    const dentroP = tramo(t, T.salto1 - 0.04, T.salto1 + 0.2);
    pone(G, p, c, "cerca", dentroP, { q: Tr({ x: 300, y: 500 }), d: PALMA, mu: 2.9 });
    pone(G, p, l, "lejos", dentroP, { q: Tr({ x: 150, y: 520 }), d: PALMA, mu: -0.35 });
    p.manoCerca = c; p.manoLejos = l;
  }

  /* =====================================================================================
   * DARI (a la derecha, en espejo: mira a la izquierda)
   * ===================================================================================== */
  const CARAS_D = {
    normal: E({ mx: 0.6, my: 0.1, orig: 0, sonr: 0.0, ancho: 0.85 }),
    abajo: E({ mx: 0.5, my: 0.8, c: 0.4, orig: 0, sonr: 0.05, ancho: 0.8 }),
    arriba: E({ mx: 0.4, my: -0.55, orig: 0, sonr: 0, ancho: 0.8, sd: 8, si: 8 }),
    tira: E({ mx: 0.8, my: 0.25, c: 0.35, z: 0.3, orig: 0, sonr: -0.1, ancho: 0.7, sd: -4, si: -4 }),
    gusto: E({ c: 1, h: 1, orig: 0, sonr: 0.35, ancho: 0.8, sd: 6, si: 6 }),
    reojo: E({ mx: 1, my: 0.1, c: 0.45, orig: 0, sonr: -0.05, ancho: 0.75, sd: -6, gd: -0.1, si: 6, gi: 0.06 }),
    suspira: E({ mx: 0.3, my: -0.85, c: 0.5, orig: 0, sonr: -0.15, ancho: 0.6, abre: 12, sd: 6, si: 6 }),
    venga: E({ mx: 0.95, c: 0.2, orig: 0, sonr: 0.15, ancho: 0.85, sd: 4, si: 10 }),
    uf: E({ mx: 0.9, c: 0.65, z: 0.4, orig: 0, sonr: -0.15, ancho: 0.75, abre: 6, sd: 10, si: 10 }),
    neutro: E({ mx: 0.95, my: 0.05, c: 0.3, orig: 0, sonr: 0.0, ancho: 0.8 }),
    sonrie: E({ mx: 0.95, my: 0.15, c: 0.4, h: 0.35, orig: 0, sonr: 0.5, ancho: 0.9, sd: 6, si: 6 }),
    anda: E({ mx: 0.9, c: 0.2, h: 0.2, orig: 0, sonr: 0.4, ancho: 0.9 })
  };
  const GUION_CARA_D = [
    [T.zipA - 0.1, T.zipA + 0.15, "abajo"], [T.cap0, T.cap0 + 0.2, "arriba"], [T.tug0 + 0.1, T.tug0 + 0.3, "tira"],
    [T.tugFin - 0.1, T.tugFin + 0.15, "gusto"], [T.dMira, T.dMira + 0.18, "reojo"], [T.suspiro0, T.suspiro0 + 0.2, "suspira"],
    [T.abre0 + 0.15, T.abre0 + 0.35, "venga"], [T.salto1 - 0.03, T.salto1 + 0.06, "uf"], [T.zipB1, T.zipB1 + 0.3, "neutro"],
    [T.sonrisaD, T.sonrisaD + 0.25, "sonrie"], [T.anda0 + 0.2, T.anda0 + 0.5, "anda"]
  ];
  const TOB_D = { cerca: D.SUELO - D.TOBILLO_ALTO, lejos: D.SUELO - D.TOBILLO_ALTO - 10 };
  // cremallera (coordenadas del torso): de abierta (y 470) a la barbilla (y 246) y otra vez abajo
  const Y_ZIP_ABAJO = 470, Y_ZIP_ARRIBA = 246;
  const zipY = t => lerp(Y_ZIP_ABAJO, Y_ZIP_ARRIBA, tramo(t, T.zip0, T.zip1, s => salida(s) * 0.85 + s * 0.15)) + (Y_ZIP_ABAJO + 150 - Y_ZIP_ARRIBA) * tramo(t, T.baja0, T.baja1, entrada);
  const ZIP_X = y => 254 + (y - 246) * 0.02;
  // capucha: puesta (barrido 0..1) y apretada (0..1, tres tirones)
  const capOn = t => 0.42 * tramo(t, T.capAg, T.capAg + 0.28, s => 0.6 * s + 0.4 * s * s) + 0.58 * tramo(t, T.capAg + 0.28, T.cap1, salida);
  const botaCap = t => t > T.cap1 ? Math.exp(-(t - T.cap1) * 7) * Math.sin((t - T.cap1) * 24) : 0;
  const tirones = t => T.tugs.reduce((s, a) => s + tramo(t, a, a + 0.13, salida), 0);
  const apretada = t => tirones(t) / 3;
  const suspiro = t => campana(t, T.suspiro0 + 0.25, T.suspiro1 + 0.15);
  const inspira = t => campana(t, T.suspiro0 - 0.05, T.suspiro0 + 0.35);
  const abierta = t => tramo(t, T.baja1, T.abre1, salida) * (1 - tramo(t, T.cierra0, T.cierra1 + 0.05));

  function cuerpoD(t) {
    const respira = Math.sin(t * 2.0 + 1), tir = 0.5 * dentro(t, 0.3, 0.5, T.zip0, T.zip1);
    let x = XD, pies = { cerca: { x: XD + OFF_D.cerca, alza: 0, ang: 0 }, lejos: { x: XD + OFF_D.lejos, alza: 0, ang: 0 } }, bob = 0;
    if (t >= T.anda0) { const a = andaD(t); x = a.x; pies = a.pies; bob = a.bob; }
    const tug = T.tugs.reduce((s, a) => s + campana(t, a - 0.02, a + 0.22), 0);
    const ab = abierta(t), choque = campana(t, T.salto1 - 0.03, T.salto1 + 0.35), zipB = campana(t, T.zipB0, T.zipB1 + 0.25);
    const p = {
      x: x + ruido(t * 37 + 9) * 1.4 * tir + 7 * choque, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, ikContinuo: true,
      pelvis: { x: D.PELVIS.x, y: D.PELVIS.y + respira * 1.1 - 10 * inspira(t) + 16 * suspiro(t) + 8 * tug + 18 * choque + 0.6 * bob + 6 * zipB },
      torso: 0.03 * dentro(t, T.zipA, T.zip0, T.zip1, T.zipFin) + 0.04 * tug - 0.05 * ab - 0.07 * choque + 0.03 * suspiro(t)
        + 0.03 * dentro(t, T.anda0, T.anda0 + 0.3, 30, 31) + ruido(t * 33) * 0.01 * tir,
      torsoEsc: { x: 1 + 0.03 * choque, y: 1 + respira * 0.004 + 0.035 * inspira(t) - 0.03 * suspiro(t) - 0.04 * choque },
      piernas: {},
      cabeza: { ang: -0.05 * dentro(t, T.zipA, T.zip0, T.zip1, T.zipFin) - 0.06 * dentro(t, T.cap0, T.capAg, T.cap1, T.capFin)
          + 0.04 * tug - 0.06 * suspiro(t) + 0.05 * inspira(t) + 0.04 * dentro(t, T.dMira, T.dMira + 0.2, T.suspiro0, T.suspiro0 + 0.2)
          - 0.08 * choque + 0.05 * dentro(t, T.sonrisaD, T.sonrisaD + 0.3, T.anda0, T.anda0 + 0.4) + 0.012 * Math.sin(t * 0.9),
        dx: 0, dy: 10 * suspiro(t) + 8 * tug - 6 * inspira(t), esc: { x: 1, y: 1 } }
    };
    for (const lado of ["cerca", "lejos"]) {
      const f = pies[lado];
      p.piernas[lado] = { tob: { x: D.aHoja(p, { x: f.x, y: 0 }).x, y: TOB_D[lado] - f.alza / S }, ang: f.ang };
    }
    const ex = guion(GUION_CARA_D, CARAS_D, "normal", t);
    p.cara = cara(ex, parpadeo(t, [0.35, 2.2, 4.75, 6.1, 8.2, 9.6, 12.4]));
    p.gafas = { dx: 0, dy: -6 * campana(t, T.zipB1, T.zipB1 + 0.3), ang: 0, fuera: 0 };
    p.tt = t;
    return p;
  }

  // conversión retrato de Dari ↔ hoja
  const retratoAHoja = (p, q) => AF.ap(mCab(D, p), q);
  const hojaARetrato = (p, q) => AF.ap(AF.inv(mCab(D, p)), q);
  // la capucha: se pone con un barrido alrededor de la nuca (FI0 → FI1)
  const NUCA = { x: 690, y: 880 }, FI0 = -3.95, FI1 = -3.95 + 2 * Math.PI, R_MANO_CAP = 225;
  const CORDON_Q0 = { x: 884, y: 940 };                                // donde agarra los cordones (retrato)
  const BAJA_TIRON = 78;

  function manosD(P) {
    const p = P.d, t = P.t, Tr = D.tronco(p), H = D.cabeza(p);
    const c = manoInicial(D, p, "cerca"), l = manoInicial(D, p, "lejos");
    // 1) se sube la cremallera (mano de delante)
    const zy = zipY(t), corredera = Tr({ x: ZIP_X(zy), y: zy + 8 });
    pone(D, p, l, "lejos", tramo(t, T.zipA, T.zip0), { q: corredera, d: PINZA, mu: 1.25 });
    pone(D, p, l, "lejos", tramo(t, T.zip1 + 0.06, T.zipFin), vuelveBolsillo(D, p, "lejos"));
    // 2) la capucha: la mano de atrás la coge por detrás del cuello y la sube por la nuca
    // (la mano sube por detrás de la cabeza, por el borde de atrás de la capucha, sin cruzar la cara)
    const fi = lerp(FI0, FI1, capOn(t)), fiMano = Math.min(fi, -2.5), rM = R_MANO_CAP + 55 * clamp((fiMano - FI0) / (-2.5 - FI0));
    const borde = retratoAHoja(p, { x: NUCA.x + Math.cos(fiMano) * rM, y: NUCA.y + Math.sin(fiMano) * rM });
    pone(D, p, c, "cerca", tramo(t, T.cap0, T.capAg), { q: borde, d: AGARRA, mu: 1.75 });
    // 3) de ahí, la misma mano (la de este lado) baja a los cordones: tres tirones
    const cq = retratoAHoja(p, { x: CORDON_Q0.x, y: CORDON_Q0.y + BAJA_TIRON * tirones(t) });
    pone(D, p, c, "cerca", tramo(t, T.cap1 + 0.02, T.tugA), { q: cq, d: AGARRA, mu: 0.35 });
    pone(D, p, c, "cerca", tramo(t, T.tugFin, T.tugFin + 0.34), vuelveBolsillo(D, p, "cerca"));
    // 4) baja la cremallera y abre la parka de par en par
    pone(D, p, l, "lejos", tramo(t, T.abre0, T.baja0), { q: corredera, d: PINZA, mu: 1.25 });
    const ab = tramo(t, T.baja1 - 0.02, T.abre1, salida), ola = 10 * Math.sin((t - T.abre1) * 7) * dentro(t, T.abre1, T.abre1 + 0.1, T.salto0, T.salto1);
    pone(D, p, l, "lejos", ab, { q: Tr({ x: 640, y: 392 + ola }), d: AGARRA, mu: Math.PI - 0.15 });
    pone(D, p, c, "cerca", tramo(t, T.baja0, T.abre1, salida), { q: Tr({ x: -150, y: 420 - ola }), d: AGARRA, mu: 0.05 });
    // 5) la cierra alrededor de Guillermo y le abraza (las manos quedan dentro)
    const ci = tramo(t, T.cierra0 - 0.02, T.cierra1);
    pone(D, p, l, "lejos", ci, { q: Tr({ x: 470, y: 520 }), d: PALMA, mu: Math.PI - 0.6 });
    pone(D, p, c, "cerca", ci, { q: Tr({ x: 380, y: 560 }), d: PALMA, mu: Math.PI - 0.3 });
    p.manoCerca = c; p.manoLejos = l;
  }

  function posturas(t) {
    const P = { g: cuerpoG(t), d: cuerpoD(t), t };
    manosG(P);
    manosD(P);
    return P;
  }

  /* =====================================================================================
   * CAPAS DE DARI: cremallera, parka abierta (torso) · capucha y cordones (cabeza)
   * ===================================================================================== */
  const TINTA = "#0c0a0c", BEIS = "#d2b082", BEIS_OSC = "#b38d5c", BEIS_SOMBRA = "#967a56", BEIS_LUZ = "#ead0a6";
  const FORRO = "#b8402c", FORRO_OSC = "#82271b", FORRO_LUZ = "#e0704c", JERSEY = "#2c5a4c", JERSEY_OSC = "#1d3d34";
  const ruta = (g, pts, cerrada) => { g.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y); if (cerrada) g.closePath(); };
  function rutaSuave(g, pts) {      // curva cerrada suave por los puntos (puntos medios + cuadráticas)
    const n = pts.length, m = i => { const a = pts[(i + n) % n], b = pts[(i + 1) % n]; return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };
    const s = m(n - 1); g.moveTo(s.x, s.y);
    for (let i = 0; i < n; i++) { const q = m(i); g.quadraticCurveTo(pts[i].x, pts[i].y, q.x, q.y); }
    g.closePath();
  }
  function corredera(g, x, y, k, ang) {   // tirador metálico de la cremallera (k: escala)
    g.save(); g.translate(x, y); g.rotate(ang || 0); g.scale(k, k); g.lineJoin = "round";
    g.fillStyle = "#c9ccd2"; g.strokeStyle = TINTA; g.lineWidth = 3;
    g.beginPath(); g.rect(-8, -8, 16, 14); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-6, 6); g.lineTo(6, 6); g.lineTo(4, 30); g.quadraticCurveTo(0, 34, -4, 30); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#6c7078"; g.beginPath(); g.ellipse(0, 22, 2.4, 4.5, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // escote abierto (V) sobre el torso: el jersey asoma hasta la corredera
  function escote(g, zy) {
    if (zy <= Y_ZIP_ARRIBA + 1) return;
    const ap = { x: ZIP_X(zy), y: zy }, L = { x: 212, y: 236 }, R = { x: 300, y: 238 };
    const h = clamp((zy - Y_ZIP_ARRIBA) / (Y_ZIP_ABAJO - Y_ZIP_ARRIBA));
    g.save(); g.lineJoin = "round";
    g.beginPath(); g.moveTo(L.x, L.y); g.quadraticCurveTo(L.x + 16 * h, lerp(L.y, ap.y, 0.6), ap.x, ap.y); g.quadraticCurveTo(R.x - 10 * h, lerp(R.y, ap.y, 0.6), R.x, R.y); g.closePath();
    g.fillStyle = JERSEY; g.fill();
    g.save(); g.clip(); g.strokeStyle = JERSEY_OSC; g.lineWidth = 5;
    for (let x = 200; x < 320; x += 13) { g.beginPath(); g.moveTo(x, 230); g.lineTo(x + 2, 480); g.stroke(); }
    g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(190, 230, 140, 26); g.restore();
    // solapas (el borde de la parka, un poco levantado)
    g.strokeStyle = BEIS_OSC; g.lineWidth = 12; g.lineCap = "round";
    g.beginPath(); g.moveTo(L.x + 4, L.y + 4); g.quadraticCurveTo(L.x + 20 * h, lerp(L.y, ap.y, 0.6), ap.x, ap.y); g.stroke();
    g.beginPath(); g.moveTo(R.x - 4, R.y + 4); g.quadraticCurveTo(R.x - 12 * h, lerp(R.y, ap.y, 0.6), ap.x, ap.y); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 4;
    g.beginPath(); g.moveTo(L.x, L.y); g.quadraticCurveTo(L.x + 16 * h, lerp(L.y, ap.y, 0.6), ap.x, ap.y); g.quadraticCurveTo(R.x - 10 * h, lerp(R.y, ap.y, 0.6), R.x, R.y); g.stroke();
    g.restore();
  }
  // la parka abierta como una tienda: forro de cada delantero hasta la mano que lo sujeta (coordenadas del torso)
  function tienda(g, p, k, t) {
    if (k <= 0.002) return;
    const hl = aTorso(D, p, p.manoLejos), hc = aTorso(D, p, p.manoCerca);
    const zip = { x: ZIP_X(400), y: 400 };
    const bl = mezcla(zip, hl, k), bc = mezcla(zip, hc, k);
    const cuelloL = { x: 300, y: 240 }, cuelloC = { x: 212, y: 238 };
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // jersey del centro
    const centro = [cuelloC, cuelloL, { x: 330, y: 300 }, { x: 352, y: 652 }, { x: 160, y: 652 }, { x: 178, y: 300 }];
    g.globalAlpha = clamp(k * 3);
    g.beginPath(); ruta(g, centro, true); g.fillStyle = JERSEY; g.fill();
    g.save(); g.clip(); g.strokeStyle = JERSEY_OSC; g.lineWidth = 6;
    for (let x = 150; x < 370; x += 15) { g.beginPath(); g.moveTo(x, 230); g.lineTo(x + 3, 660); g.stroke(); }
    const lz = g.createRadialGradient(256, 450, 10, 256, 450, 260); lz.addColorStop(0, "rgba(255,170,90,0.4)"); lz.addColorStop(1, "rgba(255,170,90,0)");
    g.fillStyle = lz; g.fillRect(140, 220, 240, 450); g.restore();
    g.globalAlpha = 1;
    // los dos delanteros vueltos: se ve el forro acolchado
    const panel = (cuello, hombro, mano, lado, sg) => {
      const bajo = { x: mano.x + sg * 26, y: Math.max(mano.y + 250, 700) }, costado = { x: lado.x, y: lado.y };
      g.beginPath(); g.moveTo(cuello.x, cuello.y); g.lineTo(mano.x, mano.y); g.quadraticCurveTo(mano.x + sg * 24, (mano.y + bajo.y) / 2, bajo.x, bajo.y);
      g.lineTo(costado.x, costado.y); g.lineTo(hombro.x, hombro.y); g.closePath(); g.fillStyle = FORRO; g.fill();
      g.save(); g.clip();
      g.strokeStyle = FORRO_OSC; g.lineWidth = 4; g.globalAlpha = 0.8;
      for (let i = -12; i < 14; i++) { g.beginPath(); g.moveTo(cuello.x + i * 46 - 300, 160); g.lineTo(cuello.x + i * 46 + 300, 860); g.stroke();
        g.beginPath(); g.moveTo(cuello.x + i * 46 + 300, 160); g.lineTo(cuello.x + i * 46 - 300, 860); g.stroke(); }
      g.globalAlpha = 1;
      const lz2 = g.createRadialGradient(256, 450, 20, 256, 450, 420); lz2.addColorStop(0, "rgba(255,200,120,0.45)"); lz2.addColorStop(1, "rgba(255,200,120,0)");
      g.fillStyle = lz2; g.fillRect(-300, 150, 1000, 700);
      g.restore();
      // canto beis (la tapeta de la cremallera) y contorno
      g.beginPath(); g.moveTo(cuello.x, cuello.y); g.lineTo(mano.x, mano.y); g.quadraticCurveTo(mano.x + sg * 24, (mano.y + bajo.y) / 2, bajo.x, bajo.y);
      g.strokeStyle = TINTA; g.lineWidth = 14; g.stroke(); g.strokeStyle = BEIS; g.lineWidth = 8; g.stroke();
      g.strokeStyle = TINTA; g.lineWidth = 4; g.beginPath(); ruta(g, [bajo, costado], false); g.stroke();
    };
    panel(cuelloL, { x: 372, y: 300 }, bl, { x: 425, y: 650 }, 1);
    panel(cuelloC, { x: 140, y: 300 }, bc, { x: 86, y: 650 }, -1);
    g.restore();
  }

  // capucha (retrato de Dari, mirando a la derecha)
  const CAP_EXT = [[560, 1004], [478, 862], [448, 680], [456, 470], [520, 300], [640, 192], [790, 160], [930, 178], [1050, 248], [1114, 380],
    [1120, 540], [1092, 700], [1034, 830], [992, 952], [860, 1014], [700, 1024]].map(([x, y]) => ({ x, y }));
  const AB0 = { x: 852, y: 606, rx: 214, ry: 268, a: 0.1 }, AB1 = { x: 870, y: 590, rx: 158, ry: 134, a: 0.2 };
  const abertura = k => ({ x: lerp(AB0.x, AB1.x, k), y: lerp(AB0.y, AB1.y, k), rx: lerp(AB0.rx, AB1.rx, k), ry: lerp(AB0.ry, AB1.ry, k), a: lerp(AB0.a, AB1.a, k) });
  const elip = (g, o, dr, ccw) => g.ellipse(o.x, o.y, o.rx + dr, o.ry + dr, o.a, 0, Math.PI * 2, !!ccw);
  const ptElip = (o, th, dr = 0) => { const c = Math.cos(o.a), s = Math.sin(o.a), x = (o.rx + dr) * Math.cos(th), y = (o.ry + dr) * Math.sin(th); return { x: o.x + x * c - y * s, y: o.y + x * s + y * c }; };
  function capucha(g, t, on, k, puntas, nieve) {
    if (on <= 0.001) return;
    const ab = abertura(k), fi = lerp(FI0, FI1, on), bo = botaCap(t);
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    if (Math.abs(bo) > 0.002) { g.translate(NUCA.x, NUCA.y + 120); g.scale(1 + 0.035 * bo, 1 - 0.03 * bo); g.translate(-NUCA.x, -NUCA.y - 120); }
    if (on < 0.999) { g.beginPath(); g.moveTo(NUCA.x, NUCA.y); g.arc(NUCA.x, NUCA.y, 1500, FI0, fi, false); g.closePath(); g.clip(); }
    const forma = () => { g.beginPath(); rutaSuave(g, CAP_EXT); elip(g, ab, 0, true); };
    forma(); g.fillStyle = BEIS; g.fill("evenodd");
    g.save(); forma(); g.clip("evenodd");
    const sb = g.createLinearGradient(450, 0, 790, 0); sb.addColorStop(0, "rgba(104,74,40,0.6)"); sb.addColorStop(1, "rgba(104,74,40,0)");
    g.fillStyle = sb; g.fillRect(430, 120, 380, 880);
    g.fillStyle = "rgba(255,244,220,0.35)"; g.beginPath(); g.ellipse(860, 236, 160, 54, 0.12, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(104,74,40,0.3)"; g.beginPath(); g.ellipse(800, 930, 260, 60, 0, 0, Math.PI * 2); g.fill();
    // costura central y pliegues hacia la nuca
    const cima = ptElip(ab, -1.95, 30);
    g.strokeStyle = "rgba(92,62,32,0.7)"; g.lineWidth = 6;
    g.beginPath(); g.moveTo(cima.x, cima.y); g.bezierCurveTo(cima.x - 40, 150, 560, 220, 500, 640); g.stroke();
    g.lineWidth = 5; g.strokeStyle = "rgba(92,62,32,0.45)";
    for (const [x0, y0, x1, y1] of [[600, 330, 540, 520], [690, 300, 620, 470], [620, 760, 560, 860]]) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 - 20, (y0 + y1) / 2, x1, y1); g.stroke(); }
    g.restore();
    // por dentro de la abertura: sombra del interior de la capucha sobre el pelo y la cara
    g.save(); g.beginPath(); elip(g, ab, -6); g.clip();
    g.strokeStyle = `rgba(40,24,12,${0.4 * (1 - 0.65 * k)})`; g.lineWidth = 56; g.beginPath(); elip(g, ab, -30); g.stroke();
    g.restore();
    // contorno exterior
    g.strokeStyle = TINTA; g.lineWidth = 11; g.beginPath(); rutaSuave(g, CAP_EXT); g.stroke();
    // jareta de la abertura: tubo fruncido (más arrugas cuanto más apretada)
    g.strokeStyle = BEIS_OSC; g.lineWidth = 36; g.beginPath(); elip(g, ab, 0); g.stroke();
    g.strokeStyle = "rgba(255,240,210,0.45)"; g.lineWidth = 7; g.beginPath(); g.ellipse(ab.x, ab.y, ab.rx + 6, ab.ry + 6, ab.a, Math.PI * 1.05, Math.PI * 1.75); g.stroke();
    const n = Math.round(lerp(9, 26, k));
    g.strokeStyle = "rgba(80,52,26,0.8)"; g.lineWidth = 4.5;
    for (let i = 0; i < n; i++) { const th = (i + 0.5) / n * Math.PI * 2 + 0.2 * hash(i + 3), a = ptElip(ab, th, -14), b = ptElip(ab, th, 20 + 8 * hash(i));
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
    g.strokeStyle = TINTA; g.lineWidth = 8;
    g.beginPath(); elip(g, ab, 19); g.stroke(); g.beginPath(); elip(g, ab, -18); g.stroke();
    // borde que avanza mientras se la pone
    if (on < 0.999) {
      g.save(); g.beginPath(); rutaSuave(g, CAP_EXT); elip(g, ab, 0, true); g.clip("evenodd");
      const e = { x: NUCA.x + Math.cos(fi) * 1500, y: NUCA.y + Math.sin(fi) * 1500 };
      g.strokeStyle = TINTA; g.lineWidth = 44; g.beginPath(); g.moveTo(NUCA.x, NUCA.y); g.lineTo(e.x, e.y); g.stroke();
      g.strokeStyle = BEIS_OSC; g.lineWidth = 30; g.stroke();
      g.restore();
    }
    // nieve encima
    if (nieve > 0.01) monton(g, [[760, 168, 70], [880, 160, 58], [660, 196, 50]], nieve);
    g.restore();
    // cordones (fuera del barrido)
    if (puntas) {
      for (let i = 0; i < 2; i++) {
        const e = ptElip(ab, i ? 1.22 : 1.9, 16), q = puntas[i];
        const mx = (e.x + q.x) / 2 + (i ? 10 : -10), my = (e.y + q.y) / 2 + 20;
        g.save(); g.lineCap = "round";
        g.strokeStyle = TINTA; g.lineWidth = 13; g.beginPath(); g.moveTo(e.x, e.y); g.quadraticCurveTo(mx, my, q.x, q.y); g.stroke();
        g.strokeStyle = "#efe7d6"; g.lineWidth = 6.5; g.stroke();
        const an = Math.atan2(q.y - my, q.x - mx);
        g.translate(q.x, q.y); g.rotate(an); g.fillStyle = "#2a2a30"; g.strokeStyle = TINTA; g.lineWidth = 3;
        g.beginPath(); g.rect(-4, -7, 30, 14); g.fill(); g.stroke();
        g.restore();
      }
    }
  }
  // dónde están las puntas de los cordones (retrato): en la mano mientras tira, luego colgando
  function puntasCordon(t, P) {
    const p = P.d, k = apretada(t), ab = abertura(k);
    const L = 70 + BAJA_TIRON * tirones(t) + 40 * k;
    const sw = 0.28 * Math.exp(-Math.max(0, t - T.tugFin) * 2.6) * Math.sin((t - T.tugFin) * 8) + 0.5 * racha(t) * (0.75 + 0.25 * Math.sin(t * 23))
      + 0.12 * Math.sin(t * 1.7) * (t > T.anda0 ? 2 : 0.3);
    const libre = [0, 1].map(i => { const e = ptElip(ab, i ? 1.22 : 1.9, 16), a = sw + (i ? -0.06 : 0.06); return { x: e.x + Math.sin(a) * L, y: e.y + Math.cos(a) * L }; });
    const agarra = tramo(t, T.tugA - 0.06, T.tugA) * (1 - tramo(t, T.tugFin, T.tugFin + 0.12));
    if (agarra <= 0.001 || !p.manoCerca) return libre;
    const h = hojaARetrato(p, p.manoCerca);
    return libre.map((q, i) => mezcla(q, { x: h.x + (i ? 14 : -14), y: h.y - 12 }, agarra));
  }

  /* =====================================================================================
   * CAPAS DE GUILLERMO: frío (tinte azul), nieve en el pelo, carámbano y rubor
   * ===================================================================================== */
  const PIEL_CAB = [[806,850],[802,846],[766,842],[754,834],[746,834],[742,838],[734,826],[726,826],[718,814],[710,814],[704,808],[708,804],[702,798],[698,802],[690,798],[684,792],[682,782],[674,782],[662,774],[656,768],[660,764],[654,758],[650,762],[634,746],[630,746],[624,740],[624,732],[604,716],[608,712],[604,708],[604,692],[596,684],[596,668],[582,670],[570,654],[566,658],[556,648],[560,640],[558,638],[554,642],[544,632],[548,624],[532,604],[532,596],[528,592],[528,572],[532,568],[528,564],[532,560],[528,552],[540,536],[540,528],[548,516],[562,503],[570,499],[590,499],[624,532],[624,540],[630,550],[636,536],[632,532],[640,524],[640,516],[648,501],[676,477],[676,469],[684,461],[680,457],[690,447],[718,435],[734,423],[744,429],[728,461],[730,467],[762,451],[798,427],[806,431],[823,431],[839,443],[843,439],[851,439],[867,455],[875,455],[881,461],[869,481],[841,509],[843,511],[879,503],[903,487],[911,487],[917,493],[901,524],[893,532],[895,534],[931,514],[947,499],[955,503],[969,520],[965,596],[949,620],[953,624],[937,644],[937,652],[925,676],[909,732],[899,738],[877,764],[885,772],[875,782],[867,778],[861,788],[849,796],[825,832],[829,836],[819,846],[815,842]];
  const PIEL_CUELLO = [[269,321],[254,318],[252,316],[250,318],[216,304],[212,299],[197,292],[175,270],[178,264],[188,259],[196,251],[196,246],[203,234],[203,229],[209,223],[219,233],[228,237],[243,249],[257,254],[266,266],[283,264],[287,267],[282,286],[291,296],[291,308],[294,310],[281,318],[271,318]];
  const PZC = G.A.datos.piezas.cabeza, OJO_D = PZC.ojos.derecho, OJO_I = PZC.ojos.izquierdo;
  const camino = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
  const AZUL = "#3f78d6", AZUL_MUL = "rgb(176,202,246)", ROSA = "#ff7f74";
  function tinte(g, alfa, color, modo) { g.globalAlpha = alfa; g.globalCompositeOperation = modo; g.fillStyle = color; }
  function azulea(g, k, relleno) { tinte(g, k, AZUL, "color"); relleno(); tinte(g, 0.85 * k, AZUL_MUL, "multiply"); relleno(); }
  function capaCaraG(g, t, p) {
    const kA = 0.8 * azulG(t), kR = 0.28 * rosaG(t) * (1 - 0.6 * tramo(t, T.anda0, T.anda0 + 1.5));
    if (kA > 0.004 || kR > 0.004) {
      g.save();
      g.beginPath(); camino(g, PIEL_CAB); g.clip();
      g.beginPath(); g.rect(380, 100, 900, 900); camino(g, OJO_D); camino(g, OJO_I);
      if (kA > 0.004) azulea(g, kA, () => g.fill("evenodd"));
      if (kR > 0.004) { tinte(g, kR, ROSA, "multiply"); g.fill("evenodd"); }
      g.restore();
      // dentro de los ojos: el párpado (si está cerrado) también se tiñe
      for (const [ojo, c] of [[OJO_D, p.cara.ojos.d], [OJO_I, p.cara.ojos.i]]) {
        const cc = Math.pow(clamp((c - 0.5) / 0.5), 2);
        if (cc * kA < 0.004) continue;
        g.save(); g.beginPath(); camino(g, ojo); g.clip(); azulea(g, cc * kA, () => g.fillRect(700, 520, 260, 140)); g.restore();
      }
    }
    montonPelo(g, t);
    carambano(g, t);
  }
  function capaCuelloG(g, t) {
    const kA = 0.8 * azulG(t);
    if (kA > 0.004) { g.save(); g.beginPath(); camino(g, PIEL_CUELLO); g.clip(); azulea(g, kA, () => g.fillRect(160, 210, 150, 120)); g.restore(); }
    // nieve en los hombros
    const k = nieveG(t);
    if (k > 0.01) { g.save(); monton(g, [[120, 330, 30], [340, 345, 34], [235, 318, 18]], k); g.restore(); }
  }
  // montoncito de nieve (unión de bolas con sombra azulada)
  function monton(g, L, k) {
    if (k <= 0.01) return;
    g.save(); g.lineJoin = "round";
    const forma = () => { g.beginPath(); for (const [x, y, r] of L) { const rr = r * k; g.moveTo(x + rr * 1.3, y); g.ellipse(x, y, rr * 1.3, rr * 0.8, 0, 0, Math.PI, true); } };
    forma(); g.strokeStyle = "rgba(60,80,130,0.9)"; g.lineWidth = 7; g.stroke();
    forma(); g.fillStyle = "#f4f8ff"; g.fill();
    g.fillStyle = "rgba(160,186,230,0.8)";
    for (const [x, y, r] of L) { const rr = r * k; g.beginPath(); g.ellipse(x + rr * 0.25, y - rr * 0.08, rr * 0.9, rr * 0.25, 0, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#ffffff"; for (const [x, y, r] of L) { const rr = r * k; g.beginPath(); g.ellipse(x - rr * 0.4, y - rr * 0.55, rr * 0.35, rr * 0.14, -0.2, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // nieve que se le acumula (la ráfaga le planta un buen montón) y se derrite dentro de la parka
  const nieveG = t => clamp(0.15 + 0.35 * tramo(t, 0.5, 3.8) + 0.55 * tramo(t, T.viento0 + 0.15, T.tink, salida)) * (1 - tramo(t, T.deshiela0 + 0.1, T.deshiela1));
  function montonPelo(g, t) {
    const k = nieveG(t); if (k <= 0.01) return;
    monton(g, [[694, 290, 58], [800, 270, 50], [604, 336, 40], [744, 240, 46]], k);
  }
  // carámbano colgando de la nariz (retrato): crece, gotea y se cae
  const NARIZ = { x: 860, y: 694 };
  const largoCarambano = t => clamp(0.12 * tramo(t, 1.2, 3.2) + 0.25 * tramo(t, 3.2, T.viento0) + 0.63 * tramo(t, T.viento0 + 0.2, T.tink, salida)) * (1 - 0.22 * tramo(t, T.deshiela0, T.cae));
  function formaCarambano(g, L, w) {
    g.beginPath(); g.moveTo(-w, 0); g.quadraticCurveTo(-w * 0.55, L * 0.45, -w * 0.18, L * 0.82); g.quadraticCurveTo(0, L * 1.02, w * 0.18, L * 0.82); g.quadraticCurveTo(w * 0.55, L * 0.45, w, 0); g.closePath();
  }
  function dibCarambano(g, L, brillo) {
    const w = 18 + 0.06 * L;
    g.save(); g.lineJoin = "round";
    formaCarambano(g, L, w);
    const gr = g.createLinearGradient(-w, 0, w, 0); gr.addColorStop(0, "#9fd0f2"); gr.addColorStop(0.45, "#eaf7ff"); gr.addColorStop(1, "#7fb4e0");
    g.fillStyle = gr; g.fill(); g.lineWidth = 6; g.strokeStyle = "#1d3552"; g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 5; g.beginPath(); g.moveTo(-w * 0.35, L * 0.1); g.quadraticCurveTo(-w * 0.25, L * 0.45, -w * 0.08, L * 0.7); g.stroke();
    g.strokeStyle = "rgba(29,53,82,0.5)"; g.lineWidth = 3; for (const y of [0.25, 0.5]) { g.beginPath(); g.moveTo(-w * (1 - y) * 0.8, L * y); g.lineTo(w * (1 - y) * 0.6, L * y + 6); g.stroke(); }
    if (brillo > 0.01) destello(g, brillo, w * 0.2, L * 0.9, 1.6);
    g.restore();
  }
  function carambano(g, t) {
    if (t >= T.cae) return;
    const L = 250 * largoCarambano(t); if (L < 4) return;
    g.save(); g.translate(NARIZ.x, NARIZ.y);
    dibCarambano(g, L, campana(t, T.tink, T.tink + 0.4));
    // gota que se forma en la punta y cae
    for (const [t0, per] of [[5.4, 1.15], [T.deshiela0, 0.32]]) {
      if (t < t0) continue; if (t0 === 5.4 && t > T.deshiela0) continue;
      const ph = ((t - t0) / per) % 1, cuelga = clamp(ph / 0.7), cae = clamp((ph - 0.7) / 0.3);
      g.globalAlpha = 1 - cae; g.fillStyle = "#cfeeff"; g.strokeStyle = "#1d3552"; g.lineWidth = 3;
      g.beginPath(); g.arc(0, L * 0.98 + 8 + cae * cae * 160, 5 + 5 * cuelga, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    g.restore();
  }
  function destello(g, k, x, y, e) {
    if (k <= 0.01) return;
    g.save(); g.translate(x, y); g.rotate(k * 0.8); g.scale(k * (e || 1), k * (e || 1));
    g.fillStyle = "#ffffff"; g.strokeStyle = "rgba(170,220,255,0.95)"; g.lineWidth = 3;
    g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 9 : 40; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke();
    g.restore();
  }

  /* ---------- la pose completa (cuerpos, manos y capas) ---------- */
  function pose(t) {
    const P = posturas(t), pg = P.g, pd = P.d;
    pg.capaCabeza = g => capaCaraG(g, t, pg);
    pg.capaTronco = g => capaCuelloG(g, t);
    const puntas = capOn(t) > 0.999 ? puntasCordon(t, P) : null;
    const nieveD = 0.6 * tramo(t, T.cap1, 9.5);
    pd.capaCabeza = g => capucha(g, t, capOn(t), apretada(t), puntas, nieveD);
    pd.capaTronco = g => {
      escote(g, zipY(t));
      const k = abierta(t);
      if (k > 0.002) tienda(g, pd, k, t);
      else if (t < T.salto0) { const zy = zipY(t); corredera(g, ZIP_X(zy), zy, 1.25, 0); }
    };
    return P;
  }

  /* =====================================================================================
   * LA PARKA COMPARTIDA (pantalla): tapa los dos torsos y los brazos; deja las cabezas y las piernas
   * ===================================================================================== */
  function geoParka(P) {
    const pg = P.g, pd = P.d, Tg = G.tronco(pg), Td = D.tronco(pd);
    const sG = q => scr(G, pg, q), sD = q => scr(D, pd, q);
    const hg = [sG(Tg(G.HOMBRO)), sG(Tg(G.HOMBRO_C))], hd = [sD(Td(D.HOMBRO)), sD(Td(D.HOMBRO_C))];
    const barbG = sG(G.cabeza(pg).a({ x: 806, y: 852 })), cuG = sG(Tg(G.CUELLO));
    const barbD = sD(D.cabeza(pd).a({ x: 860, y: 760 })), cuD = sD(Td(D.CUELLO));
    const xl = Math.min(hg[0].x, hg[1].x) - 30, xr = Math.max(hd[0].x, hd[1].x) + 34;
    const ys = Math.min(hg[0].y, hg[1].y, hd[0].y, hd[1].y) - 14;
    const pel = Math.max(sG(pg.pelvis).y, sD(pd.pelvis).y);
    const yh = pel + 34;
    const zx = (barbG.x + barbD.x) / 2 + 6;
    return { hg, hd, barbG, barbD, cuG, cuD, xl, xr, ys, yh, zx };
  }
  function rutaParka(g, o) {
    const { barbG, barbD, xl, xr, ys, yh, zx } = o;
    const yg = Math.max(ys + 4, barbG.y - 8), yd = Math.max(ys + 2, barbD.y + 2), ym = (ys + yh) / 2;
    g.moveTo(xl, ys + 40);
    g.quadraticCurveTo(xl + 2, ys - 2, barbG.x - 46, yg);                  // hombro de fuera de Guillermo
    g.quadraticCurveTo(barbG.x, barbG.y + 16, barbG.x + 46, yg);            // cuello de Guillermo
    g.quadraticCurveTo(zx, ys - 12, barbD.x - 42, yd);                      // entre los dos
    g.quadraticCurveTo(barbD.x, yd + 20, barbD.x + 44, yd);                 // cuello de Dari
    g.quadraticCurveTo(xr - 2, ys - 2, xr, ys + 40);                        // hombro de fuera de Dari
    g.quadraticCurveTo(xr + 16, ym, xr - 2, yh - 24);
    g.quadraticCurveTo(xr - 4, yh + 6, xr - 34, yh + 4);
    const n = 6; for (let i = 1; i <= n; i++) { const x = lerp(xr - 34, xl + 34, i / n); g.quadraticCurveTo(x + (xr - xl - 68) / n / 2, yh + 11 + 3 * Math.sin(i * 2.1), x, yh + 4); }
    g.quadraticCurveTo(xl + 4, yh + 6, xl + 2, yh - 24);
    g.quadraticCurveTo(xl - 16, ym, xl, ys + 40);
    g.closePath();
  }
  function mangaVacia(g, x, y, sg, t, osc) {
    const sw = osc * Math.sin(t * 9 + (sg > 0 ? 0 : 1.6)) + 0.08 * sg;
    g.save(); g.translate(x, y); g.rotate(sw); g.lineJoin = "round";
    g.beginPath(); g.moveTo(-14, -6); g.quadraticCurveTo(sg * 16, 40, sg * 6, 112); g.lineTo(sg * 6 + 22, 116); g.quadraticCurveTo(sg * 18 + 14, 50, 14, -4); g.closePath();
    g.fillStyle = BEIS; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2.6; g.stroke();
    g.fillStyle = BEIS_SOMBRA; g.beginPath(); g.ellipse(sg * 6 + 11, 114, 12, 4, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = "rgba(90,62,32,0.5)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(sg * 4, 40); g.lineTo(sg * 4 + 12, 46); g.moveTo(sg * 6, 76); g.lineTo(sg * 6 + 14, 80); g.stroke();
    g.restore();
  }
  function parkaComun(g, P, t, c) {
    if (c <= 0.001) return;
    const o = geoParka(P), { xl, xr, ys, yh, zx } = o;
    const jig = Math.exp(-Math.max(0, t - T.zipB1) * 5) * Math.sin((t - T.zipB1) * 26) * (t > T.zipB1 ? 1 : 0);
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // estirón al subir la cremallera
    const cx = (xl + xr) / 2;
    g.translate(cx, yh); g.scale(1 + 0.03 * jig, 1 - 0.035 * jig); g.translate(-cx, -yh);
    // mangas vacías colgando a los lados (detrás del cuerpo de la parka)
    const osc = 0.1 + 0.25 * dentro(t, T.anda0, T.anda0 + 0.2, 30, 31);
    if (c > 0.6) { g.save(); g.globalAlpha = clamp((c - 0.6) / 0.3); mangaVacia(g, xl - 4, ys + 36, -1, t, osc); mangaVacia(g, xr + 4, ys + 36, 1, t, osc); g.restore(); }
    // los dos delanteros se cierran desde los lados hasta la cremallera
    const xL = lerp(xl - 40, zx, c), xR = lerp(xr + 40, zx, c);
    g.save();
    g.beginPath(); g.rect(xl - 200, ys - 200, xL - (xl - 200), yh - ys + 400); g.rect(xR, ys - 200, xr + 200 - xR, yh - ys + 400); g.clip();
    g.beginPath(); rutaParka(g, o); g.fillStyle = BEIS; g.fill();
    g.save(); g.clip();
    const sh = g.createLinearGradient(0, ys, 0, yh); sh.addColorStop(0, "rgba(255,240,210,0.25)"); sh.addColorStop(0.5, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(104,74,40,0.35)");
    g.fillStyle = sh; g.fillRect(xl - 30, ys - 40, xr - xl + 60, yh - ys + 60);
    g.fillStyle = "rgba(104,74,40,0.28)"; g.beginPath(); g.ellipse(xr - 20, (ys + yh) / 2 + 20, 40, (yh - ys) * 0.55, 0, 0, Math.PI * 2); g.fill();
    // costura del pecho, bolsillos con tapeta y arrugas de tirantez hacia la cremallera
    // acolchado: costuras horizontales con su bullón
    for (let i = 1; i <= 3; i++) {
      const y = lerp(ys + 46, yh - 12, i / 4);
      g.strokeStyle = "rgba(255,240,212,0.22)"; g.lineWidth = 7; g.beginPath(); g.moveTo(xl - 10, y - 9); g.quadraticCurveTo(cx, y + 3, xr + 10, y - 9); g.stroke();
      g.strokeStyle = "rgba(92,62,32,0.6)"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(xl - 10, y); g.quadraticCurveTo(cx, y + 12, xr + 10, y); g.stroke();
    }
    for (const [x, s] of [[lerp(xl, zx, 0.45), -1], [lerp(zx, xr, 0.55), 1]]) {
      g.fillStyle = BEIS_OSC; g.beginPath(); g.moveTo(x - 24, yh - 52); g.lineTo(x + 24, yh - 52 + 4 * s); g.lineTo(x + 22, yh - 38 + 4 * s); g.lineTo(x - 22, yh - 38); g.closePath(); g.fill();
      g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
      g.fillStyle = "#c9ccd2"; g.beginPath(); g.arc(x, yh - 44 + 2 * s, 2.6, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    g.strokeStyle = "rgba(92,62,32,0.4)"; g.lineWidth = 1.6;            // tirantez alrededor de la cremallera
    for (let i = 0; i < 4; i++) { const y = lerp(ys + 40, yh - 30, i / 3) + 14, L = 16 + 10 * hash(i + 4);
      g.beginPath(); g.moveTo(zx - 5, y); g.quadraticCurveTo(zx - 5 - L * 0.6, y - 6, zx - 5 - L, y - 4); g.stroke();
      g.beginPath(); g.moveTo(zx + 5, y + 4); g.quadraticCurveTo(zx + 5 + L * 0.6, y - 2, zx + 5 + L, y); g.stroke(); }
    g.restore();
    g.beginPath(); rutaParka(g, o); g.strokeStyle = TINTA; g.lineWidth = 3; g.stroke();
    // cuellos: tirilla alrededor de cada cuello
    for (const [b, y0, w] of [[o.barbG, Math.max(ys + 4, o.barbG.y - 8), 46], [o.barbD, Math.max(ys + 2, o.barbD.y + 2), 43]]) {
      const ruta = () => { g.beginPath(); g.moveTo(b.x - w + 3, y0 + 3); g.quadraticCurveTo(b.x, (b.y + (y0 === o.barbD.y + 2 ? 20 : 16)) + 5, b.x + w - 3, y0 + 3); };
      ruta(); g.strokeStyle = TINTA; g.lineWidth = 13; g.stroke(); ruta(); g.strokeStyle = BEIS_OSC; g.lineWidth = 9; g.stroke();
      ruta(); g.strokeStyle = "rgba(255,240,212,0.4)"; g.lineWidth = 2.5; g.stroke();
    }
    g.restore();
    // cantos de los delanteros mientras se cierran (con un poco de forro)
    if (c < 0.999) {
      for (const [x, s] of [[xL, -1], [xR, 1]]) {
        g.save(); g.beginPath(); rutaParka(g, o); g.clip();
        g.fillStyle = FORRO; g.fillRect(x - (s < 0 ? 0 : 8), ys - 40, 8, yh - ys + 60);
        g.strokeStyle = TINTA; g.lineWidth = 3; g.beginPath(); g.moveTo(x, ys - 40); g.lineTo(x, yh + 30); g.stroke();
        g.restore();
      }
    }
    // cremallera: dientes cerrados por debajo de la corredera, que sube de golpe
    if (c > 0.97) {
      const kz = tramo(t, T.zipB0, T.zipB1, s => s * s * (3 - 2 * s)), yz = lerp(yh - 2, ys + 18, kz);
      g.save(); g.beginPath(); rutaParka(g, o); g.clip();
      if (kz < 1) { g.fillStyle = "#3a2a1c"; g.beginPath(); g.moveTo(zx - 1, yz); g.lineTo(zx - 7, ys - 30); g.lineTo(zx + 7, ys - 30); g.lineTo(zx + 1, yz); g.closePath(); g.fill(); }
      g.strokeStyle = "#5b5f66"; g.lineWidth = 3; g.setLineDash([2.5, 2.5]); g.beginPath(); g.moveTo(zx, yz); g.lineTo(zx, yh + 6); g.stroke(); g.setLineDash([]);
      g.strokeStyle = TINTA; g.lineWidth = 1.2; g.beginPath(); g.moveTo(zx - 2.5, yz); g.lineTo(zx - 2.5, yh + 6); g.moveTo(zx + 2.5, yz); g.lineTo(zx + 2.5, yh + 6); g.stroke();
      g.restore();
      // estela del tirón
      const st = campana(t, T.zipB0, T.zipB1 + 0.12);
      if (st > 0.01) { g.save(); g.strokeStyle = `rgba(255,255,255,${0.8 * st})`; g.lineWidth = 2.5;
        for (const dx of [-12, 0, 12]) { g.beginPath(); g.moveTo(zx + dx, yz + 16 + Math.abs(dx)); g.lineTo(zx + dx, yz + 60 + Math.abs(dx)); g.stroke(); } g.restore(); }
      corredera(g, zx, yz, 0.36, 0.08 * jig);
    }
  }

  /* =====================================================================================
   * VAHO, VAPOR Y EL CARÁMBANO QUE SE CAE (pantalla)
   * ===================================================================================== */
  // bocanada: sale de la boca hacia delante, sube y se deshace
  function bocanada(g, t, t0, o, dir, tam, dur, al = 0.5) {
    const k = fase(t, t0, t0 + dur); if (k <= 0 || k >= 1) return;
    g.save(); g.fillStyle = "#eef4ff";
    for (let i = 0; i < 5; i++) {
      const u = clamp(k * 1.25 - i * 0.06), r = tam * (0.35 + 0.9 * u) * (1 - 0.12 * i);
      const x = o.x + dir * (tam * 2.2 * salida(u) + i * tam * 0.35), y = o.y - tam * 1.1 * u * u - i * 2 + 3 * Math.sin(i * 2 + t * 3);
      g.globalAlpha = al * Math.sin(Math.PI * clamp(k * 1.1)) * (1 - 0.15 * i);
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  const VAHO_G = []; for (let tt = 0.9; tt < 8.0; tt += 0.58) VAHO_G.push(tt + 0.07 * hash(tt * 13));
  function vahos(g, t, P) {
    const pg = P.g, pd = P.d;
    const bg = scr(G, pg, G.boca(pg)), bd = scr(D, pd, D.boca(pd)), dg = pg.espejo ? -1 : 1;
    for (const t0 of VAHO_G) if (!(t0 > T.tink - 0.2 && t0 < T.pena0)) bocanada(g, t, t0, { x: bg.x + 4 * dg, y: bg.y }, dg, 7, 0.75);
    for (const t0 of [1.05, 2.45, 4.2, 5.2]) bocanada(g, t, t0, { x: bd.x - 4, y: bd.y + 4 }, -1, 6, 0.8);
    bocanada(g, t, T.suspiro0 + 0.22, { x: bd.x - 6, y: bd.y + 6 }, -1, 24, 1.3, 0.75);       // el suspiro
    bocanada(g, t, T.vaho2, { x: bg.x - 4, y: bg.y }, -1, 9, 0.9);
    bocanada(g, t, T.vaho2 + 0.05, { x: bd.x - 4, y: bd.y + 4 }, -1, 9, 0.9);
  }
  // vapor del deshielo saliendo del pelo de Guillermo
  function vaporPelo(g, t, pg) {
    const k = dentro(t, T.deshiela0, T.deshiela0 + 0.3, T.deshiela1, T.deshiela1 + 0.5); if (k <= 0.01) return;
    const o = scr(G, pg, G.cabeza(pg).a({ x: 720, y: 290 }));
    g.save(); g.fillStyle = "#ffffff";
    for (let i = 0; i < 10; i++) {
      const ph = (t * 0.85 + i / 10 + 0.1 * hash(i)) % 1, h = ph * 70;
      g.globalAlpha = k * 0.5 * Math.sin(Math.PI * ph);
      g.beginPath(); g.arc(o.x + (hash(i + 4) - 0.5) * 40 + 6 * Math.sin(t * 3 + i), o.y - h, 3 + 7 * ph, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  // el carámbano se suelta de la nariz, cae y se queda clavado en la nieve
  let CAE = null;
  function carambanoCae(g, t) {
    if (t < T.cae) return;
    if (!CAE) {
      const pg = posturas(T.cae).g, H = G.cabeza(pg), base = scr(G, pg, H.a(NARIZ));
      const L = 250 * largoCarambano(T.cae - 0.001) * 0.6 * S;      // retrato → pantalla
      CAE = { x: base.x, y: base.y, L };
    }
    const k = fase(t, T.cae, T.cae + 0.34), y = lerp(CAE.y, SUELO + 22 - CAE.L * 0.55, k * k);
    const rebote = t > T.cae + 0.34 ? 0.25 * Math.exp(-(t - T.cae - 0.34) * 9) * Math.sin((t - T.cae - 0.34) * 30) : 0;
    g.save(); g.translate(CAE.x - 8 * k, y); g.rotate(-0.25 * k + rebote); g.scale(0.6 * S, 0.6 * S);
    if (k >= 1) { g.save(); g.beginPath(); g.rect(-200, -400, 400, 400 + CAE.L / (0.6 * S) * 0.55); g.clip(); }
    dibCarambano(g, CAE.L / (0.6 * S), 0);
    if (k >= 1) g.restore();
    g.restore();
    // salpicón de nieve al clavarse
    const sp = fase(t, T.cae + 0.33, T.cae + 0.75);
    if (sp > 0 && sp < 1) { g.save(); g.fillStyle = "#ffffff";
      for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.15 + 0.7 * hash(i + 31)), v = 18 + 16 * hash(i + 2);
        g.globalAlpha = 1 - sp; g.beginPath(); g.arc(CAE.x - 8 + Math.cos(a) * v * sp, SUELO + 22 + Math.sin(a) * v * sp + 30 * sp * sp, 2.2, 0, Math.PI * 2); g.fill(); }
      g.restore(); }
  }
  // agujerito en la nieve donde está clavado (por debajo de los personajes)
  function hoyoCarambano(g, t) {
    if (t < T.cae + 0.33 || !CAE) return;
    g.save(); g.fillStyle = "rgba(60,80,140,0.45)"; g.beginPath(); g.ellipse(CAE.x - 8, SUELO + 22, 10, 3, 0, 0, Math.PI * 2); g.fill(); g.restore();
  }

  /* =====================================================================================
   * HUELLAS EN LA NIEVE
   * ===================================================================================== */
  let HUELLAS = null;
  function huellas() {
    if (HUELLAS) return HUELLAS;
    HUELLAS = [];
    const offG = OFF_G(1);
    for (const lado of ["cerca", "lejos"]) {
      HUELLAS.push({ t: 0, x: XG + offG[lado], lado });
      HUELLAS.push({ t: 0, x: XD + OFF_D[lado], lado });
      HUELLAS.push({ t: T.salto1, x: XG_IN + offG[lado], lado });
    }
    const d = (T.anda1 - T.anda0) / PASOS;
    for (let k = 0; k < PASOS; k++) {
      const te = T.anda0 + (k + 1) * d;
      const ladoG = k % 2 === 0 ? "lejos" : "cerca", ladoD = k % 2 === 0 ? "cerca" : "lejos";
      HUELLAS.push({ t: te - 0.04, x: andaG(te + 1e-4).pies[ladoG].x, lado: ladoG });
      HUELLAS.push({ t: te - 0.04, x: andaD(te + 1e-4).pies[ladoD].x, lado: ladoD });
    }
    return HUELLAS;
  }
  function dibHuellas(g, t) {
    g.save();
    for (const h of huellas()) {
      if (t < h.t) continue;
      const y = SUELO + (h.lado === "lejos" ? -6 : 3);
      g.fillStyle = "rgba(70,92,150,0.42)"; g.beginPath(); g.ellipse(h.x + 4, y, 16, 4.2, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "rgba(255,255,255,0.5)"; g.beginPath(); g.ellipse(h.x + 4, y + 2.6, 15, 1.6, 0, 0, Math.PI); g.fill();
    }
    g.restore();
  }

  /* =====================================================================================
   * DECORADO: la fachada del bar de noche, nevando
   * ===================================================================================== */
  const VENT = { x0: 146, x1: 452, y0: 168, y1: 392 }, PUERTA = { x0: 10, x1: 116, y0: 166, y1: 452 }, ESQ = 812, FAROLA = 938;
  let fondo = null, neon = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 140; const g = c.getContext("2d");
    g.translate(60, 70); g.lineJoin = "round";
    // calle del fondo a la derecha: cielo, casas lejanas con ventanas encendidas y la farola
    const cie = g.createLinearGradient(0, -70, 0, 470); cie.addColorStop(0, "#060b1f"); cie.addColorStop(0.65, "#15244a"); cie.addColorStop(1, "#2a3f6c");
    g.fillStyle = cie; g.fillRect(ESQ, -70, W + 60 - ESQ, 540);
    const casas = [[ESQ, 150, 70], [ESQ + 70, 110, 60], [ESQ + 130, 176, 64], [ESQ + 194, 128, 80]];
    for (const [x, y, w] of casas) {
      g.fillStyle = "#101a36"; g.fillRect(x, y, w, 470 - y);
      g.fillStyle = "#e6eeff"; g.beginPath(); g.moveTo(x - 4, y + 4); g.quadraticCurveTo(x + w / 2, y - 12, x + w + 4, y + 4); g.lineTo(x + w + 4, y + 8); g.lineTo(x - 4, y + 8); g.closePath(); g.fill();
      for (let i = 0; i < 6; i++) { const wx = x + 10 + (i % 2) * (w / 2), wy = y + 26 + Math.floor(i / 2) * 56; if (wy > 420) continue;
        g.fillStyle = hash(x + i) > 0.45 ? "#ffcf7a" : "#25345c"; g.fillRect(wx, wy, 14, 20); }
    }
    // farola: halo y poste
    const hx = FAROLA, hy = 60;
    const halo = g.createRadialGradient(hx, hy, 6, hx, hy, 170); halo.addColorStop(0, "rgba(255,226,160,0.75)"); halo.addColorStop(0.3, "rgba(255,210,140,0.25)"); halo.addColorStop(1, "rgba(255,200,130,0)");
    g.fillStyle = halo; g.fillRect(hx - 170, hy - 170, 340, 340);
    g.fillStyle = "rgba(255,226,170,0.13)"; g.beginPath(); g.moveTo(hx - 14, hy + 10); g.lineTo(hx + 14, hy + 10); g.lineTo(hx + 120, 560); g.lineTo(hx - 120, 560); g.closePath(); g.fill();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 10; g.beginPath(); g.moveTo(hx, 520); g.lineTo(hx, hy + 20); g.stroke();
    g.strokeStyle = "#2d3445"; g.lineWidth = 5; g.stroke();
    g.fillStyle = "#1c2230"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(hx - 22, hy + 14); g.lineTo(hx + 22, hy + 14); g.lineTo(hx + 16, hy - 16); g.lineTo(hx - 16, hy - 16); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#ffe7a6"; g.fillRect(hx - 12, hy - 10, 24, 22);
    g.fillStyle = "#eef4ff"; g.beginPath(); g.ellipse(hx, hy - 20, 26, 8, 0, Math.PI, 0); g.fill();
    // fachada de ladrillo
    g.fillStyle = "#3a1914"; g.fillRect(-60, -70, ESQ + 60, 530);
    for (let fila = 0; fila < 24; fila++) {
      const y = -70 + fila * 22, des = (fila % 2) * 27;
      for (let x = -60 - des; x < ESQ; x += 54) {
        const v = hash(fila * 31 + x * 0.37);
        g.fillStyle = `rgb(${Math.round(92 + 30 * v)},${Math.round(40 + 14 * v)},${Math.round(32 + 10 * v)})`;
        g.fillRect(x + 2, y + 2, 50, 18);
        g.fillStyle = "rgba(255,180,140,0.07)"; g.fillRect(x + 2, y + 2, 50, 4);
      }
    }
    // la pared se oscurece hacia arriba y la ilumina la ventana
    const os = g.createLinearGradient(0, -70, 0, 300); os.addColorStop(0, "rgba(6,8,20,0.55)"); os.addColorStop(1, "rgba(6,8,20,0)");
    g.fillStyle = os; g.fillRect(-60, -70, ESQ + 60, 370);
    const cal = g.createRadialGradient(300, 280, 40, 300, 280, 420); cal.addColorStop(0, "rgba(255,170,80,0.35)"); cal.addColorStop(1, "rgba(255,150,70,0)");
    g.fillStyle = cal; g.fillRect(-60, -70, ESQ + 60, 540);
    // esquina, bajante y zócalo
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(ESQ - 16, -70, 16, 530);
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.beginPath(); g.moveTo(ESQ, -70); g.lineTo(ESQ, 460); g.stroke();
    g.fillStyle = "#3d4250"; g.fillRect(ESQ - 40, -70, 14, 520); g.strokeRect(ESQ - 40, -70, 14, 520);
    for (const y of [60, 230, 400]) { g.fillStyle = "#23262f"; g.fillRect(ESQ - 44, y, 22, 8); }
    g.fillStyle = "#2a2a33"; g.fillRect(-60, 420, ESQ + 60, 42); g.strokeRect(-62, 420, ESQ + 64, 42);
    g.fillStyle = "rgba(255,255,255,0.06)"; for (let x = -60; x < ESQ; x += 96) g.fillRect(x, 422, 2, 38);
    // ventana del bar (calentito por dentro)
    const V = VENT;
    g.save(); g.beginPath(); g.rect(V.x0, V.y0, V.x1 - V.x0, V.y1 - V.y0); g.clip();
    const dentroB = g.createLinearGradient(0, V.y0, 0, V.y1); dentroB.addColorStop(0, "#ffd88a"); dentroB.addColorStop(0.55, "#f5a64c"); dentroB.addColorStop(1, "#c86a2c");
    g.fillStyle = dentroB; g.fillRect(V.x0, V.y0, V.x1 - V.x0, V.y1 - V.y0);
    // lámpara, estantes con botellas de colores y la barra
    const lmp = g.createRadialGradient(V.x1 - 70, V.y0 + 40, 4, V.x1 - 70, V.y0 + 40, 110); lmp.addColorStop(0, "rgba(255,250,220,0.95)"); lmp.addColorStop(1, "rgba(255,240,200,0)");
    g.fillStyle = lmp; g.fillRect(V.x1 - 180, V.y0, 180, 160);
    g.strokeStyle = "#5a2a10"; g.lineWidth = 2; g.beginPath(); g.moveTo(V.x1 - 70, V.y0); g.lineTo(V.x1 - 70, V.y0 + 26); g.stroke();
    g.fillStyle = "#5a2a10"; g.beginPath(); g.moveTo(V.x1 - 88, V.y0 + 40); g.quadraticCurveTo(V.x1 - 70, V.y0 + 18, V.x1 - 52, V.y0 + 40); g.closePath(); g.fill();
    for (const y of [V.y0 + 120, V.y0 + 168]) {
      g.fillStyle = "#7a3a16"; g.fillRect(V.x0, y, V.x1 - V.x0, 6);
      for (let i = 0; i < 14; i++) { const x = V.x0 + 12 + i * 21, h = 22 + 12 * hash(i + y), col = ["#3f8a5a", "#c84a3a", "#e8c160", "#6a3a8a", "#2f6fa0"][Math.floor(hash(i * 3 + y) * 5)];
        g.fillStyle = col; g.fillRect(x, y - h, 9, h); g.fillRect(x + 3, y - h - 7, 3, 7); g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(x + 1, y - h + 3, 2, h - 6); }
    }
    g.fillStyle = "#6a2f10"; g.fillRect(V.x0, V.y1 - 30, V.x1 - V.x0, 30); g.fillStyle = "#8a4418"; g.fillRect(V.x0, V.y1 - 34, V.x1 - V.x0, 6);
    // vaho en el cristal (abajo) y escarcha en las esquinas
    const vh = g.createLinearGradient(0, V.y1 - 70, 0, V.y1); vh.addColorStop(0, "rgba(255,240,220,0)"); vh.addColorStop(1, "rgba(255,240,220,0.5)");
    g.fillStyle = vh; g.fillRect(V.x0, V.y1 - 70, V.x1 - V.x0, 70);
    for (const [ex, ey] of [[V.x0, V.y0], [V.x1, V.y0], [V.x0, V.y1], [V.x1, V.y1]]) {
      const e = g.createRadialGradient(ex, ey, 2, ex, ey, 60); e.addColorStop(0, "rgba(235,245,255,0.8)"); e.addColorStop(1, "rgba(235,245,255,0)");
      g.fillStyle = e; g.fillRect(ex - 60, ey - 60, 120, 120);
    }
    g.restore();
    g.strokeStyle = "#1b120c"; g.lineWidth = 12; g.strokeRect(V.x0, V.y0, V.x1 - V.x0, V.y1 - V.y0);
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(V.x0 - 6, V.y0 - 6, V.x1 - V.x0 + 12, V.y1 - V.y0 + 12);
    // alféizar con nieve
    g.fillStyle = "#3b3f4a"; g.fillRect(V.x0 - 14, V.y1 + 6, V.x1 - V.x0 + 28, 10); g.strokeRect(V.x0 - 14, V.y1 + 6, V.x1 - V.x0 + 28, 10);
    g.fillStyle = "#eef3ff"; g.beginPath(); g.moveTo(V.x0 - 16, V.y1 + 8);
    for (let x = V.x0 - 16; x <= V.x1 + 16; x += 22) g.quadraticCurveTo(x + 11, V.y1 - 4 - 4 * hash(x), x + 22, V.y1 + 8);
    g.closePath(); g.fill();
    // toldo a rayas con nieve encima y carámbanos colgando
    const TX0 = V.x0 - 26, TX1 = V.x1 + 26, TY0 = 108, TY1 = 150;
    g.save(); g.beginPath(); g.moveTo(TX0 + 10, TY0); g.lineTo(TX1 - 10, TY0); g.lineTo(TX1, TY1); g.lineTo(TX0, TY1); g.closePath(); g.clip();
    for (let i = 0, x = TX0; x < TX1; x += 30, i++) { g.fillStyle = i % 2 ? "#efe4c8" : "#2f6b4f"; g.fillRect(x, TY0, 30, TY1 - TY0); }
    g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(TX0, TY0, TX1 - TX0, 10);
    g.restore();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.beginPath(); g.moveTo(TX0 + 10, TY0); g.lineTo(TX1 - 10, TY0); g.lineTo(TX1, TY1); g.lineTo(TX0, TY1); g.closePath(); g.stroke();
    for (let i = 0, x = TX0; x < TX1; x += 30, i++) {         // faldón ondulado
      g.fillStyle = i % 2 ? "#efe4c8" : "#2f6b4f"; g.beginPath(); g.moveTo(x, TY1); g.lineTo(x + 30, TY1); g.quadraticCurveTo(x + 15, TY1 + 22, x, TY1); g.fill(); g.stroke();
    }
    g.fillStyle = "#f2f6ff"; g.beginPath(); g.moveTo(TX0 + 6, TY0 + 2);
    for (let x = TX0 + 6; x < TX1 - 6; x += 26) g.quadraticCurveTo(x + 13, TY0 - 14 - 6 * hash(x + 1), x + 26, TY0 + 2);
    g.lineTo(TX1 - 6, TY0 + 6); g.lineTo(TX0 + 6, TY0 + 6); g.closePath(); g.fill(); g.strokeStyle = "rgba(60,80,130,0.8)"; g.lineWidth = 2; g.stroke();
    for (let i = 0; i < 13; i++) { const x = TX0 + 15 + i * 30 + 6 * hash(i + 70), L = 10 + 26 * hash(i + 71);
      const ic = g.createLinearGradient(x - 4, 0, x + 4, 0); ic.addColorStop(0, "#a8d4f4"); ic.addColorStop(0.5, "#f2fbff"); ic.addColorStop(1, "#86b6e0");
      g.fillStyle = ic; g.beginPath(); g.moveTo(x - 4, TY1 + 12); g.lineTo(x + 4, TY1 + 12); g.lineTo(x + 0.5, TY1 + 12 + L); g.closePath(); g.fill(); g.strokeStyle = "#1d3552"; g.lineWidth = 1.4; g.stroke(); }
    // puerta del bar
    const P = PUERTA;
    g.fillStyle = "#4a2614"; g.fillRect(P.x0, P.y0, P.x1 - P.x0, P.y1 - P.y0); g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(P.x0, P.y0, P.x1 - P.x0, P.y1 - P.y0);
    g.fillStyle = "#1b120c"; g.fillRect(P.x0 - 12, P.y0 - 14, P.x1 - P.x0 + 24, 14); g.strokeRect(P.x0 - 12, P.y0 - 14, P.x1 - P.x0 + 24, 14);
    const vp = g.createLinearGradient(0, P.y0 + 22, 0, P.y0 + 150); vp.addColorStop(0, "#ffd88a"); vp.addColorStop(1, "#e7943e");
    g.fillStyle = vp; g.fillRect(P.x0 + 18, P.y0 + 22, P.x1 - P.x0 - 36, 128); g.strokeRect(P.x0 + 18, P.y0 + 22, P.x1 - P.x0 - 36, 128);
    g.strokeRect(P.x0 + 18, P.y0 + 176, P.x1 - P.x0 - 36, 90);
    g.fillStyle = "#d9b45a"; g.beginPath(); g.arc(P.x1 - 16, P.y0 + 168, 5, 0, Math.PI * 2); g.fill(); g.stroke();
    // neón (solo el dibujo de una jarra; el brillo va aparte)
    // acera nevada
    const su = g.createLinearGradient(0, 452, 0, H + 70); su.addColorStop(0, "#a9b6dc"); su.addColorStop(0.35, "#c9d4f0"); su.addColorStop(1, "#e3e9fb");
    g.fillStyle = su; g.fillRect(-60, 452, W + 120, H + 70 - 452);
    // luz de la ventana y de la puerta sobre la nieve
    g.fillStyle = "rgba(255,186,110,0.22)"; g.beginPath(); g.moveTo(V.x0 - 10, 462); g.lineTo(V.x1 + 10, 462); g.lineTo(V.x1 + 110, H + 70); g.lineTo(V.x0 - 40, H + 70); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,186,110,0.15)"; g.beginPath(); g.moveTo(P.x0, 462); g.lineTo(P.x1, 462); g.lineTo(P.x1 + 60, H + 70); g.lineTo(P.x0 - 20, H + 70); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,226,170,0.12)"; g.beginPath(); g.ellipse(FAROLA, 540, 150, 40, 0, 0, Math.PI * 2); g.fill();
    // montón de nieve al pie de la fachada
    g.fillStyle = "#e9eefc"; g.beginPath(); g.moveTo(-60, 470);
    for (let x = -60; x < W + 60; x += 40) g.quadraticCurveTo(x + 20, 440 - 16 * hash(x * 0.3 + 5), x + 40, 462 + 6 * hash(x));
    g.lineTo(W + 60, 480); g.lineTo(-60, 480); g.closePath(); g.fill();
    g.strokeStyle = "rgba(90,110,170,0.5)"; g.lineWidth = 2; g.stroke();
    // ondulaciones de la nieve
    g.strokeStyle = "rgba(110,130,190,0.25)"; g.lineWidth = 2;
    for (let i = 0; i < 16; i++) { const x = -40 + hash(i + 300) * (W + 80), y = 500 + hash(i + 301) * 90, w = 30 + 40 * hash(i + 302);
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y - 5, x + w, y); g.stroke(); }
    // huellas desde la puerta hasta donde están ellos
    const rastro = (x0, y0, x1, y1, n) => { for (let i = 0; i < n; i++) { const k = (i + 0.5) / n, x = lerp(x0, x1, k), y = lerp(y0, y1, k) + 14 * Math.sin(Math.PI * k), s = i % 2 ? 6 : -6;
      g.fillStyle = "rgba(70,92,150,0.35)"; g.beginPath(); g.ellipse(x, y + s, 12, 3.4, 0.1, 0, Math.PI * 2); g.fill(); } };
    rastro(70, 476, XG - 30, 556, 9); rastro(90, 478, XD - 30, 554, 15);
    // viñeta
    const v = g.createRadialGradient(512, 300, 320, 512, 300, 760); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,10,0.55)");
    g.fillStyle = v; g.fillRect(-60, -70, W + 120, H + 140);
    return c;
  }
  // neón de una jarra de cerveza en la pared (dibujo encendido, con su halo, una sola vez)
  function creaNeon() {
    const c = document.createElement("canvas"); c.width = 180; c.height = 200; const g = c.getContext("2d");
    g.translate(90, 100); g.lineJoin = "round"; g.lineCap = "round";
    const traza = (col, w) => {
      g.strokeStyle = col; g.lineWidth = w;
      g.beginPath(); g.moveTo(-34, -40); g.lineTo(-30, 50); g.quadraticCurveTo(-30, 58, -22, 58); g.lineTo(22, 58); g.quadraticCurveTo(30, 58, 30, 50); g.lineTo(34, -40); g.stroke();
      g.beginPath(); g.moveTo(32, -18); g.quadraticCurveTo(62, -18, 60, 12); g.quadraticCurveTo(58, 34, 31, 32); g.stroke();
    };
    const espuma = (col, w) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(-40, -40); g.quadraticCurveTo(-42, -62, -20, -58); g.quadraticCurveTo(-8, -76, 8, -62); g.quadraticCurveTo(28, -72, 34, -54); g.quadraticCurveTo(46, -46, 38, -38); g.stroke();
      for (const [x, y] of [[-12, -10], [6, 14], [-4, 34]]) { g.beginPath(); g.arc(x, y, 5, 0, Math.PI * 2); g.stroke(); } };
    for (const [w, a] of [[26, 0.12], [16, 0.22], [9, 0.45]]) { g.globalAlpha = a; traza("#ff4fa0", w); espuma("#5fe6ff", w); }
    g.globalAlpha = 1; traza("#ffd0ea", 3.5); espuma("#d8fbff", 3.5);
    return c;
  }
  const NEON = { x: 64, y: 92, k: 0.6 };
  const brilloNeon = t => (hash(Math.floor(t * 12) + 5) > 0.93 && t > 2 ? 0.35 : 1) * (t > 9.0 && t < 9.12 ? 0.3 : 1);

  /* ---------- cámara ---------- */
  const CAMS = {
    ancho: { k: 1, x: 512, y: 300 }, dos: { k: 1.3, x: 468, y: 236 }, tiron: { k: 1.42, x: 500, y: 214 }, helado: { k: 1.5, x: 400, y: 214 },
    pena: { k: 1.36, x: 468, y: 226 }, tienda: { k: 1.06, x: 500, y: 284 }, cabezas: { k: 1.62, x: 540, y: 206 }, sale: { k: 1, x: 512, y: 300 }
  };
  function camara(t) {
    const lista = [[1.0, 1.9, "dos"], [2.4, 3.0, "tiron"], [3.85, 4.45, "helado"], [5.35, 5.9, "pena"], [6.85, 7.4, "tienda"],
      [9.0, 9.6, "cabezas"], [10.22, 10.85, "sale"]];
    let c = CAMS.ancho;
    for (const [t0, t1, n] of lista) { if (t <= t0) break; const k = suave(fase(t, t0, t1)); const C = CAMS[n]; c = { k: lerp(c.k, C.k, k), x: lerp(c.x, C.x, k), y: lerp(c.y, C.y, k) }; }
    const tb = 3 * racha(t);
    return { k: c.k, x: c.x + tb * ruido(t * 17), y: c.y + tb * ruido(t * 19 + 4) };
  }

  // Guillermo con el «aplastado» de la vuelta
  function dibG(g, pg, t) {
    const sq = giroG(t);
    if (sq > 0.999) { G.dibujar(g, pg, t); return; }
    g.save(); g.translate(pg.x, 0); g.scale(Math.max(0.001, sq), 1); g.translate(-pg.x, 0); G.dibujar(g, pg, t); g.restore();
  }
  // calorcito que sale de la parka abierta
  function calor(g, t, pd) {
    const k = abierta(t); if (k <= 0.01) return;
    const o = scr(D, pd, D.tronco(pd)({ x: 256, y: 440 }));
    const r = g.createRadialGradient(o.x, o.y, 10, o.x, o.y, 170); r.addColorStop(0, `rgba(255,170,90,${0.28 * k})`); r.addColorStop(1, "rgba(255,170,90,0)");
    g.fillStyle = r; g.fillRect(o.x - 170, o.y - 170, 340, 340);
    g.save(); g.strokeStyle = `rgba(255,214,150,${0.55 * k})`; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < 4; i++) { const ph = (t * 0.9 + i / 4) % 1, x0 = o.x - 70 - 22 * i, y0 = o.y + 10 - 100 * ph;
      g.globalAlpha = Math.sin(Math.PI * ph); g.beginPath(); g.moveTo(x0, y0); for (let j = 1; j <= 6; j++) g.lineTo(x0 + 6 * Math.sin(j * 1.4 + t * 6), y0 - j * 7); g.stroke(); }
    g.restore();
  }

  class Abrigo extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !D.listo()) return;
      if (!fondo) { fondo = creaFondo(); neon = creaNeon(); }
      const P = pose(t), pg = P.g, pd = P.d;
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      g.drawImage(fondo, -60, -70);
      g.save(); g.globalAlpha = brilloNeon(t); g.drawImage(neon, NEON.x - 90 * NEON.k, NEON.y - 100 * NEON.k, 180 * NEON.k, 200 * NEON.k); g.restore();
      nieva(g, t, COPOS_LEJOS, 0.75);
      dibHuellas(g, t);
      hoyoCarambano(g, t);
      // sombras en la nieve
      const juntos = t >= T.cierra0;
      g.save(); g.fillStyle = "rgba(30,40,90,0.28)";
      const sx = SUELO - pg.suelo;
      g.beginPath(); g.ellipse(pg.x + 4, SUELO + 1, 84 * Math.max(0.4, giroG(t)) * (1 - sx / 260), 8, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pd.x, SUELO + 1, 86, 8, 0, 0, Math.PI * 2); g.fill(); g.restore();
      // personajes: Dari (con la parka abierta) y Guillermo por delante; luego la parka común encima
      D.dibujar(g, pd, t);
      calor(g, t, pd);
      dibG(g, pg, t);
      if (juntos) parkaComun(g, P, t, tramo(t, T.cierra0, T.cierra1, salida));
      vaporPelo(g, t, pg);
      vahos(g, t, P);
      carambanoCae(g, t);
      nieva(g, t, COPOS_CERCA, 0.9);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00059", nombre: "Guillermo y Dari · El abrigo", crear: () => new Abrigo() });
  window.__A2D_00059 = { pose: t => { const P = pose(t); return { g: P.g, d: P.d }; }, T, DUR, camara };
})();
