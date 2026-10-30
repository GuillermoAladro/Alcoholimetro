"use strict";
/* 00052 · Guillermo y Dari · Las gafas empañadas
 *
 * Negro → noche de nieve. Guillermo (a la izquierda) y Dari (a la derecha, mirándole) acaban de entrar
 * en un bar calentito: la puerta se cierra de golpe detrás de ellos con una ráfaga de copos, llevan
 * nieve en los hombros y en el pelo y tiritan. Con el calor, las gafas de Dari se empañan de abajo
 * arriba hasta quedarse blancas del todo; Dari se queda quieto, sin ver nada → se las quita con la mano
 * de delante, las frota en la parka, se las vuelve a poner y le brillan, limpias → Guillermo se parte
 * de risa, coge una taza de café humeante de la mesita y se la da; Dari la huele a gusto con la nariz
 * encima… y el vapor se las vuelve a empañar → Guillermo le señala, muerto de risa. Dari se las quita
 * con la otra mano y las mira de lejos, entornando los ojos; Guillermo se las birla, les da la vuelta y
 * se las pone → todo se ve borroso: el bar ondula, Guillermo se ve doble y con los ojos en espiral; da
 * una vuelta sobre sí mismo, ve el perchero (abrigo beis y gorro de pelo rizado: «¡Dari!»), abre los
 * brazos, va dando tumbos y lo abraza; el perchero se tambalea y el gorro le cae en la cabeza (y ahí
 * se queda). Dari, sin gafas, se toma el café tan tranquilo (sin gafas no se empaña nada), levanta una
 * ceja, deja la taza en la mesita, va hasta Guillermo, le quita las gafas y se las pone: todo vuelve a
 * verse nítido → Guillermo ve lo que estaba abrazando, suelta el abrigo, se pone rojo como un tomate y
 * le sale vapor de la cabeza… que vuelve a empañar las gafas de Dari, que mira a cámara → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto. Las gafas son una sola pieza que va de un sitio a otro:
 * en la cara de Dari las dibuja su gancho (`p.gafas`) y el vaho va en su capa de la cara; en una mano
 * van en `mano.objeto` (con el agarre medido en el instante en que la mano llega a la bisagra) y en la
 * cara de Guillermo en su capa de la cara. Lo borroso son transformaciones baratas: el fondo en franjas
 * que ondulan, una segunda imagen corrida y un leve bamboleo de cámara (sin `ctx.filter`).
 */
(() => {
  const { clamp, lerp, suave, salida, entrada, campana, mezcla, ruido, hash } = M2;
  // fase y tramo a prueba de tramos de duración cero (sin NaN)
  const fase = (t, a, b) => b - a > 1e-9 ? clamp((t - a) / (b - a)) : (t >= b ? 1 : 0);
  const tramo = (t, a, b, f = suave) => f(fase(t, a, b));
  const G = Guillermo, D = Dari;
  const S = 0.30, SUELO = 560;
  const XG = 410, XD = 610, XG_ABRAZO = 168, XD_FIN = 276;     // pelvis (pantalla)
  const PX = 112;                                               // perchero (pantalla)
  const MESA = { x: 508, y: 332 }, TAZA0 = { x: 486, y: 320 }, TAZA1 = { x: 532, y: 320 };
  const DUR = 14.7;
  const T = {
    puerta0: 0.12, puerta1: 0.72, tir0: 0.2, tir1: 1.75,
    n1a: 1.45, n1b: 2.15,
    dSube: 2.6, dQuita: 2.95, dBaja: 3.25, frota0: 3.3, frota1: 4.0, dPone0: 4.0, dPone: 4.42, brillo: 4.5,
    rie0: 3.0, rie1: 4.55,
    gCoge0: 4.55, gCoge: 4.95, gDa: 5.45, gVuelve: 5.9,
    dTaza0: 5.05, huele0: 5.5, huele1: 5.92, n2a: 5.85, n2b: 6.3,
    rie2a: 6.45, rie2b: 7.25,
    dnSube: 6.85, dnQuita: 7.25, dnFuera: 7.55,
    gQuita0: 7.35, gQuita: 7.75, gPone0: 7.82, gPone: 8.3, eva0: 7.85, eva1: 8.25,
    borra0: 8.3, borra1: 8.75,
    gira0: 8.95, gira1: 9.3, ve: 9.35, abre0: 9.42, abre1: 9.7,
    anda0: 9.7, anda1: 10.5, choca: 10.5, gorro0: 10.56, gorro1: 10.86,
    dSorbe0: 8.65, dSorbe1: 9.55, dVe: 10.25,
    dDeja0: 10.55, dDeja: 10.95, dAnda0: 11.0, dAnda1: 12.0,
    dCoge0: 12.0, dCoge: 12.35, dPone2_0: 12.4, dPone2: 12.85, brillo2: 12.9,
    borraFin0: 12.35, borraFin1: 12.65,
    gVe: 12.5, gSuelta: 12.75, gCamara: 13.0, rojo0: 12.95, vapor0: 13.1, vapor1: 13.95, n3a: 13.35, n3b: 13.8,
    dAtras0: 12.95, dAtras1: 13.35, dCamara: 13.85, fin: 14.05
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
  // giro + escala (con el espejo como escala x negativa, así un cambio de lado es un «aplastado», no una vuelta entera)
  function descompon(m) {
    let th = Math.atan2(m.b, m.a), sx = Math.hypot(m.a, m.b);
    const c = Math.cos(th), s = Math.sin(th);
    let k = m.c * c + m.d * s, sy = -m.c * s + m.d * c;
    if (sy < 0) { th += Math.PI; sx = -sx; k = -k; sy = -sy; }
    return { th, sx, sy, k, e: m.e, f: m.f };
  }
  const compon = o => { const c = Math.cos(o.th), s = Math.sin(o.th); return { a: c * o.sx, b: s * o.sx, c: c * o.k - s * o.sy, d: s * o.k + c * o.sy, e: o.e, f: o.f }; };
  function mezclaAf(m, n, w) {
    if (w <= 0) return m; if (w >= 1) return n;
    const A = descompon(m), B = descompon(n); const dth = Math.atan2(Math.sin(B.th - A.th), Math.cos(B.th - A.th));
    return compon({ th: A.th + dth * w, sx: lerp(A.sx, B.sx, w), sy: lerp(A.sy, B.sy, w), k: lerp(A.k, B.k, w), e: lerp(A.e, B.e, w), f: lerp(A.f, B.f, w) });
  }
  // de cada personaje: hoja → pantalla, retrato → pantalla y marco de la mano → pantalla
  const mPers = (R, p) => { const k = p.s * (R.K || 1); return mul(AF.tras(p.x, p.suelo), AF.esc(p.espejo ? -k : k, k), AF.tras(-R.PELVIS.x, -R.SUELO)); };
  function mCab(R, p) {
    const H = R.cabeza(p), o = H.a({ x: 0, y: 0 }), ex = H.a({ x: 1, y: 0 }), ey = H.a({ x: 0, y: 1 });
    return AF.mul(mPers(R, p), { a: ex.x - o.x, b: ex.y - o.y, c: ey.x - o.x, d: ey.y - o.y, e: o.x, f: o.y });
  }
  const mMano = (R, p, m) => mul(mPers(R, p), AF.tras(m.x, m.y), AF.rot(m.ang || 0), AF.esc(R.JK));

  /* ---------- utilidades de poses ---------- */
  const dentro = (t, a, b, c, d) => tramo(t, a, b) * (1 - tramo(t, c, d));
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const BASE = { mx: 0.85, my: 0, c: 0, cd: -1, ci: -1, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, esp: 0, mof: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    const cd = e.cd >= 0 ? e.cd : e.c, ci = e.ci >= 0 ? e.ci : e.c;
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: Math.max(cd, parp), i: Math.max(ci, parp), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista, d = 0.15) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const D0 = { pulgar: 0, indice: 0, medio: 0, anular: 0, menique: 0 };
  const DD = (pulgar, indice, medio, anular, menique) => ({ pulgar, indice, medio, anular, menique });
  const RELAJADA = DD(0.5, 0.55, 0.5, 0.45, 0.42), ABIERTA = DD(1, 1, 1, 1, 1), PINZA = DD(0.55, 0.45, 0.3, 0.25, 0.25),
    AGARRA = DD(0.45, 0.32, 0.3, 0.3, 0.3), SENALA = DD(0.1, 1, 0, 0, 0), PALMA = DD(0.8, 0.9, 0.9, 0.85, 0.8);
  const mezclaD = (a, b, w) => { const o = {}; for (const n in D0) o[n] = lerp(a[n], b[n], w); return o; };
  const R_M = G.MUNECA_R * G.JK;
  // mano en reposo: puño metido en el bolsillo
  const bolsilloG = (p, lado) => { const b = G.tronco(p)(lado === "cerca" ? { x: 131, y: 652 } : { x: 372, y: 648 });
    const o = { x: Math.cos(-1.75) * R_M, y: Math.sin(-1.75) * R_M }; return { x: b.x - o.x, y: b.y - o.y }; };
  const bolsilloD = (p, lado) => { const m = D.manoReposo(p, lado); return { x: m.x, y: m.y }; };
  // acumulador de una mano: empieza en el bolsillo y cada gesto lo mezcla hacia su objetivo
  // codos: el brazo de delante de Dari dobla hacia delante (al llevarse la mano a la cara el codo queda abajo)
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
    const d = (t1 - t0) / n, X = tt => lerp(x0, x1, suave(fase(tt, t0, t1)));
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

  /* =====================================================================================
   * GAFAS (geometría de la montura de Dari, en su retrato) y vaho
   * ===================================================================================== */
  const GAF = {
    aro_d: [[729, 474], [744, 471], [789, 478], [833, 496], [858, 509], [861, 517], [849, 545], [837, 569], [823, 579], [789, 575], [745, 561], [734, 553], [729, 530]],
    aro_i: [[905, 522], [949, 537], [993, 551], [1006, 557], [1003, 580], [999, 608], [986, 621], [949, 624], [917, 615], [907, 604], [904, 570]],
    puente: [[858, 509], [884, 513], [905, 522]],
    varilla_d: [[729, 474], [700, 475], [668, 477], [642, 479]],
    varilla_i: [[1006, 557], [1026, 563], [1040, 567]]
  };
  const CEN = { x: 884, y: 540 };
  const BIS = { cerca: { x: 716, y: 474 }, lejos: { x: 1016, y: 560 }, punta: { x: 650, y: 479 } };
  const caja = pts => { const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]); return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) }; };
  const AROS = [GAF.aro_d, GAF.aro_i].map(pts => Object.assign({ pts }, caja(pts)));
  const rutaA = (g, pts, cerrada) => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); if (cerrada) g.closePath(); };
  function lentes(g) {
    for (const a of AROS) {
      g.save(); rutaA(g, a.pts, true); g.fillStyle = "rgba(214,232,255,0.13)"; g.fill(); g.clip();
      g.strokeStyle = "rgba(255,255,255,0.5)"; g.lineWidth = 7;
      g.beginPath(); g.moveTo(a.x0 + (a.x1 - a.x0) * 0.14, a.y1); g.lineTo(a.x0 + (a.x1 - a.x0) * 0.4, a.y0); g.stroke();
      g.lineWidth = 3; g.beginPath(); g.moveTo(a.x0 + (a.x1 - a.x0) * 0.3, a.y1); g.lineTo(a.x0 + (a.x1 - a.x0) * 0.56, a.y0); g.stroke();
      g.restore();
    }
  }
  function montura(g) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const piezas = [[GAF.varilla_d, false], [GAF.varilla_i, false], [GAF.puente, false], [GAF.aro_d, true], [GAF.aro_i, true]];
    g.strokeStyle = "#170e0a"; g.lineWidth = 13.5; for (const [q, c] of piezas) { rutaA(g, q, c); g.stroke(); }
    g.strokeStyle = "#6b4231"; g.lineWidth = 9; for (const [q, c] of piezas) { rutaA(g, q, c); g.stroke(); }
    g.strokeStyle = "#a8704f"; g.lineWidth = 2.2; g.globalAlpha *= 0.85;
    g.save(); g.translate(-1.2, -1.8); for (const [q] of piezas) { rutaA(g, q, false); g.stroke(); } g.restore();
    g.globalAlpha /= 0.85; g.fillStyle = "#cfc6bd";
    for (const q of [[716, 474], [1016, 560]]) { g.beginPath(); g.arc(q[0], q[1], 2.2, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  // vaho: sube de abajo arriba (nivel) y se va (alfa); unas gotitas y un brillo
  function vaho(g, nv, al, t) {
    if (nv * al <= 0.004) return;
    g.save();
    AROS.forEach((a, i) => {
      g.save(); rutaA(g, a.pts, true); g.clip();
      const alto = a.y1 - a.y0, top = a.y1 - (alto + 46) * nv;
      const gr = g.createLinearGradient(0, top, 0, top + 46);
      gr.addColorStop(0, "rgba(244,248,252,0)"); gr.addColorStop(1, `rgba(244,248,252,${0.95 * al})`);
      g.fillStyle = gr; g.fillRect(a.x0 - 6, top, a.x1 - a.x0 + 12, a.y1 - top + 6);
      g.globalAlpha = al * clamp(nv * 1.6 - 0.4);
      g.fillStyle = "rgba(255,255,255,0.9)"; g.beginPath(); g.ellipse(a.x0 + (a.x1 - a.x0) * 0.36, a.y0 + alto * 0.3, 16, 6, -0.5, 0, Math.PI * 2); g.fill();
      g.fillStyle = "rgba(170,196,220,0.55)";
      for (let k = 0; k < 6; k++) { const x = a.x0 + 14 + hash(k * 7 + i * 3) * (a.x1 - a.x0 - 28), y = a.y0 + 20 + hash(k * 5 + i + 11) * (alto - 34);
        if (y < top + 20) continue; g.beginPath(); g.arc(x, y, 2.4 + 2.2 * hash(k + i * 9), 0, Math.PI * 2); g.fill(); }
      g.restore();
    });
    g.restore();
  }
  function destello(g, k, x, y) {
    if (k <= 0.01) return;
    g.save(); g.translate(x, y); g.rotate(k * 0.8); g.scale(k, k);
    g.fillStyle = "#ffffff"; g.strokeStyle = "rgba(255,240,170,0.9)"; g.lineWidth = 3;
    g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 9 : 40; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  function dibGafas(g, nv, al, t) { lentes(g); vaho(g, nv, al, t); montura(g); }

  // vaho de cada momento: {nv nivel, al alfa}
  function niebla(t) {
    if (t < T.dSube) return { nv: tramo(t, T.n1a, T.n1b, s => suave(s)), al: 1 };
    if (t < T.n2a) return { nv: 1, al: 1 - tramo(t, T.frota0, T.frota1) };
    if (t < T.n3a) return { nv: tramo(t, T.n2a, T.n2b), al: 1 - tramo(t, T.eva0, T.eva1) };
    return { nv: tramo(t, T.n3a, T.n3b), al: 1 };
  }

  // las gafas en la cara de Guillermo: semejanza que lleva los ojos de Dari a los de Guillermo
  const SIM = (() => {
    const d0 = { x: 795, y: 519 }, d1 = { x: 935, y: 565 }, g0 = { x: 771, y: 563 }, g1 = { x: 894, y: 617 };
    const md = mezcla(d0, d1, 0.5), mg = mezcla(g0, g1, 0.5);
    const sc = 0.97 * Math.hypot(g1.x - g0.x, g1.y - g0.y) / Math.hypot(d1.x - d0.x, d1.y - d0.y);
    const an = Math.atan2(g1.y - g0.y, g1.x - g0.x) - Math.atan2(d1.y - d0.y, d1.x - d0.x);
    return mul(AF.tras(mg.x + 4, mg.y - 4), AF.rot(an), AF.esc(sc), AF.tras(-md.x, -md.y), AF.tras(CEN.x, CEN.y));
  })();
  const loc = q => ({ x: q.x - CEN.x, y: q.y - CEN.y });
  const gafasCaraD = pd => { const o = pd.gafas; return mul(mCab(D, pd), AF.tras(CEN.x + o.dx, CEN.y + o.dy), AF.rot(o.ang)); };
  const gafasCaraG = pg => AF.mul(mCab(G, pg), SIM);
  // Dónde van las gafas: en la cara de Dari, en una mano o en la cara de Guillermo.
  const ESTADOS = [
    { t: 0, en: "caraD" },
    { t: T.dQuita, en: "mano", R: "d", lado: "lejos", piv: "lejos", hacia: "caraD", suelta: [T.dPone0 + 0.08, T.dPone] },
    { t: T.dPone, en: "caraD" },
    { t: T.dnQuita, en: "mano", R: "d", lado: "cerca", piv: "cerca" },
    { t: T.gQuita, en: "mano", R: "g", lado: "lejos", piv: "lejos", hacia: "caraG", suelta: [T.gPone0 + 0.06, T.gPone] },
    { t: T.gPone, en: "caraG" },
    { t: T.dCoge, en: "mano", R: "d", lado: "lejos", piv: "punta", hacia: "caraD", suelta: [T.dPone2_0, T.dPone2] },
    { t: T.dPone2, en: "caraD" }
  ];
  const estadoEn = t => { let i = 0; while (i + 1 < ESTADOS.length && t >= ESTADOS[i + 1].t) i++; return i; };
  const REL = [];
  const RP = { g: G, d: D };
  const manoDe = (P, e) => P[e.R][e.lado === "cerca" ? "manoCerca" : "manoLejos"];
  function gafasEstado(i, P) {
    const e = ESTADOS[i];
    if (e.en === "caraD") return gafasCaraD(P.d);
    if (e.en === "caraG") return gafasCaraG(P.g);
    if (!REL[i]) {                                // agarre: medido en el instante en que la mano llega a la bisagra
      const P0 = posturas(e.t), M0 = gafasEstado(i - 1, P0), H0 = mMano(RP[e.R], P0[e.R], manoDe(P0, e));
      REL[i] = mul(AF.inv(H0), M0, AF.tras(loc(BIS[e.piv]).x, loc(BIS[e.piv]).y));
    }
    const H = mMano(RP[e.R], P[e.R], manoDe(P, e)), pv = loc(BIS[e.piv]);
    let rel = REL[i];
    if (e.suelta) {
      const w = tramo(P.t, e.suelta[0], e.suelta[1]);
      if (w > 0) { const dest = e.hacia === "caraD" ? gafasCaraD(P.d) : gafasCaraG(P.g); rel = mezclaAf(rel, mul(AF.inv(H), dest, AF.tras(pv.x, pv.y)), w); }
    }
    return mul(H, rel, AF.tras(-pv.x, -pv.y));
  }
  // bisagra de las gafas (pantalla) según un estado dado
  const bisagra = (i, P, lado) => AF.ap(gafasEstado(i, P), loc(BIS[lado]));

  /* =====================================================================================
   * LA TAZA DE CAFÉ (unidades de la mano: cuerpo centrado en el origen, asa a la izquierda)
   * ===================================================================================== */
  const U_TAZA = S * G.JK;                         // unidades de taza → pantalla
  const AGARRE_G = AF.tras(21, 0);                 // Guillermo la coge por el asa
  const AGARRE_D = mul(AF.tras(0, -16), AF.esc(-1, 1));   // Dari la sujeta por debajo (el asa hacia delante)
  const TAZA_EST = [{ t: 0, en: "mesa", q: TAZA0 }, { t: T.gCoge, en: "g" }, { t: T.gDa, en: "d" }, { t: T.dDeja, en: "mesa", q: TAZA1 }];
  function tazaM(t, P) {
    let i = 0; while (i + 1 < TAZA_EST.length && t >= TAZA_EST[i + 1].t) i++;
    const e = TAZA_EST[i];
    if (e.en === "mesa") return { M: mul(AF.tras(e.q.x, e.q.y), AF.esc(U_TAZA)), en: "mesa" };
    if (e.en === "g") return { M: AF.mul(mMano(G, P.g, P.g.manoLejos), AGARRE_G), en: "g" };
    return { M: AF.mul(mMano(D, P.d, P.d.manoLejos), AGARRE_D), en: "d" };
  }
  function taza(g) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 8; g.beginPath(); g.ellipse(-17, 0, 8, 7.5, 0, Math.PI * 0.5, Math.PI * 1.5); g.stroke();
    g.strokeStyle = "#f4efe6"; g.lineWidth = 3.6; g.stroke();
    const cuerpo = () => { g.beginPath(); g.moveTo(-16, -12); g.lineTo(16, -12); g.quadraticCurveTo(15.5, 9, 9, 14); g.lineTo(-9, 14); g.quadraticCurveTo(-15.5, 9, -16, -12); g.closePath(); };
    cuerpo(); g.fillStyle = "#f4efe6"; g.fill();
    g.save(); cuerpo(); g.clip(); g.fillStyle = "rgba(150,128,110,0.35)"; g.fillRect(5, -12, 14, 28); g.fillStyle = "#b8322a"; g.fillRect(-17, 1.5, 34, 3.2); g.restore();
    cuerpo(); g.lineWidth = 2.6; g.strokeStyle = "#0b0a0e"; g.stroke();
    g.beginPath(); g.ellipse(0, -12, 16, 4, 0, 0, Math.PI * 2); g.fillStyle = "#f4efe6"; g.fill(); g.lineWidth = 2.2; g.stroke();
    g.beginPath(); g.ellipse(0, -11.5, 13, 2.7, 0, 0, Math.PI * 2); g.fillStyle = "#5a2e14"; g.fill();
    g.fillStyle = "rgba(222,174,116,0.85)"; g.beginPath(); g.ellipse(-3, -11.8, 6, 1.2, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // vapor: bolitas que suben del borde de la taza y se deshacen (en pantalla, por encima de todo)
  function vapor(g, t, o, fuerza, alto) {
    if (fuerza <= 0.01) return;
    g.save();
    for (let i = 0; i < 9; i++) {
      const ph = (t * 0.9 + i / 9 + 0.13 * hash(i)) % 1, h = ph * alto;
      const x = o.x + (hash(i + 3) - 0.5) * 10 + 7 * Math.sin(t * 3 + i * 1.7 + h * 0.06) * ph, y = o.y - h;
      g.globalAlpha = fuerza * 0.55 * Math.sin(Math.PI * ph) * (1 - 0.4 * ph);
      g.fillStyle = "#ffffff"; g.beginPath(); g.arc(x, y, 3 + 7 * ph, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  /* =====================================================================================
   * GUILLERMO (a la izquierda; después de la vuelta, mirando a la izquierda)
   * ===================================================================================== */
  const CARAS_G = {
    frio: E({ mx: 0.6, my: 0.1, orig: 0, sonr: -0.35, ancho: 0.75, abre: 5, sd: 14, gd: 0.15, si: 14, gi: 0.15 }),
    mira: E({ mx: 0.95, my: -0.05, orig: 0, sonr: 0.25, ancho: 0.9, sd: 6, gd: 0.04, si: 6, gi: 0.04 }),
    risita: E({ mx: 0.95, c: 0.35, h: 0.5, orig: 0, sonr: 0.7, ancho: 0.95, abre: 3, sd: 8, gd: 0.12, si: 8, gi: 0.12 }),
    risa: E({ mx: 0.6, my: -0.3, c: 1, h: 1, orig: 0, sonr: 0.85, abre: 30, ancho: 1, lengua: 0.5, sd: 16, gd: 0.2, si: 16, gi: 0.2 }),
    ofrece: E({ mx: 0.95, c: 0.15, orig: 0, sonr: 0.55, ancho: 0.95, sd: 8, gd: 0.05, si: 8, gi: 0.05 }),
    pillo: E({ mx: 0.95, my: 0.25, c: 0.2, orig: 0, sonr: 0.75, abre: 5, ancho: 1, sd: 12, gd: -0.12, si: 2, gi: 0.14 }),
    curioso: E({ mx: 0.4, my: -0.2, orig: 0, sonr: 0.45, abre: 9, ancho: 0.9, sd: 18, gd: 0.12, si: 18, gi: 0.12 }),
    mareo: E({ esp: 1, orig: 0, sonr: -0.1, abre: 12, ancho: 0.8, lengua: 0.4, sd: 12, gd: 0.25, si: -6, gi: -0.22 }),
    ilusion: E({ esp: 0.8, orig: 0, sonr: 0.9, abre: 20, ancho: 1, sd: 24, gd: 0.15, si: 24, gi: 0.15 }),
    abrazo: E({ c: 1, h: 1, orig: 0, sonr: 0.85, abre: 4, ancho: 1, sd: 14, gd: 0.18, si: 14, gi: 0.18 }),
    descubre: E({ mx: 0.9, my: 0.15, iris: 0.72, orig: 0, sonr: -0.25, abre: 16, ancho: 0.6, sd: 28, gd: 0.2, si: 28, gi: 0.2 }),
    verguenza: E({ mx: -0.85, my: 0.05, c: 0.15, orig: 0, sonr: 0.62, abre: 8, ancho: 0.95, sd: 18, gd: 0.26, si: 18, gi: 0.26 })
  };
  const GUION_CARA_G = [
    [0.2, 0.4, "frio"], [1.6, 1.9, "mira"], [2.2, 2.4, "risita"], [T.rie0, T.rie0 + 0.15, "risa"], [T.rie1 - 0.15, T.rie1, "ofrece"],
    [6.2, 6.4, "risita"], [T.rie2a, T.rie2a + 0.12, "risa"], [T.rie2b - 0.1, T.rie2b + 0.05, "pillo"], [T.gPone0, T.gPone0 + 0.2, "curioso"],
    [T.borra0, T.borra0 + 0.3, "mareo"], [T.ve, T.ve + 0.2, "ilusion"], [T.choca - 0.05, T.choca + 0.12, "abrazo"],
    [T.gVe, T.gVe + 0.15, "descubre"], [T.gCamara, T.gCamara + 0.2, "verguenza"]
  ];
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const ladoG = t => t < (T.gira0 + T.gira1) / 2 ? 1 : -1;            // +1 mira a la derecha
  const giroG = t => Math.abs(Math.cos(Math.PI * fase(t, T.gira0, T.gira1)));   // «aplastado» de la vuelta

  function cuerpoG(t) {
    const dir = ladoG(t), respira = Math.sin(t * 2.3);
    const tirita = dentro(t, T.tir0, T.tir0 + 0.2, T.tir1 - 0.4, T.tir1);
    const risa = dentro(t, T.rie0, T.rie0 + 0.15, T.rie1 - 0.25, T.rie1) + dentro(t, T.rie2a, T.rie2a + 0.12, T.rie2b - 0.2, T.rie2b);
    const bote = risa * Math.abs(Math.sin(t * 17));
    const mareo = dentro(t, T.borra0, T.borra0 + 0.3, T.anda0, T.anda1);
    const abrazo = dentro(t, T.anda1 - 0.15, T.choca + 0.1, T.gSuelta, T.gSuelta + 0.3);
    // posición: quieto, y luego tres tumbos hasta el perchero
    const offs = { cerca: -22 * dir, lejos: 20 * dir };
    let x = XG, pies = { cerca: { x: XG + offs.cerca, alza: 0, ang: 0 }, lejos: { x: XG + offs.lejos, alza: 0, ang: 0 } }, bob = 0;
    if (t >= T.anda0) { const a = anda(t, T.anda0, T.anda1, XG, XG_ABRAZO, 4, "lejos", offs, 26); x = a.x; pies = a.pies; bob = a.bob; }
    const torso = 0.12 * dentro(t, T.gCoge0, T.gCoge, T.gDa, T.gVuelve) + 0.08 * dentro(t, T.gDa - 0.1, T.gDa, T.gDa + 0.05, T.gVuelve)
      - 0.07 * dentro(t, T.rie0, T.rie0 + 0.2, T.rie1 - 0.3, T.rie1) + 0.2 * dentro(t, T.rie2a, T.rie2a + 0.15, T.rie2b - 0.15, T.rie2b)
      + 0.08 * dentro(t, T.gQuita0, T.gQuita, T.gQuita + 0.1, T.gPone)
      + 0.07 * Math.sin(t * 4.3) * mareo + 0.1 * dentro(t, T.abre0, T.abre1, T.anda1 - 0.1, T.anda1)
      + (0.12 + 0.03 * Math.sin(t * 4)) * abrazo + 0.08 * dentro(t, T.gSuelta, T.gSuelta + 0.3, 20, 21)
      + ruido(t * 38) * 0.012 * tirita + 0.006 * Math.sin(t * 1.4);
    const p = {
      x: x + ruido(t * 41 + 3) * 1.6 * tirita + 6 * Math.sin(t * 3.1) * mareo, suelo: SUELO, s: S, espejo: dir < 0, tirasLimpias: true, ikContinuo: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + respira * 1.2 + 10 * bote + 0.6 * bob + 10 * mareo * (0.5 + 0.5 * Math.sin(t * 6)) + 12 * abrazo },
      torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.022 * tirita + 0.02 * bote },
      piernas: {},
      cabeza: { ang: -0.12 * dentro(t, T.rie0, T.rie0 + 0.2, T.rie1 - 0.3, T.rie1) + 0.06 * risa * Math.sin(t * 17)
          - 0.08 * dentro(t, T.gPone0, T.gPone0 + 0.2, T.gPone, T.gPone + 0.3) + 0.09 * Math.sin(t * 3.7) * mareo + 0.14 * abrazo
          - 0.1 * dentro(t, T.gCamara, T.gCamara + 0.25, 20, 21),
        dx: 0, dy: 12 * tirita, esc: { x: 1 + 0.03 * bote, y: 1 - 0.03 * bote } }
    };
    for (const lado of ["cerca", "lejos"]) {
      const f = pies[lado];
      p.piernas[lado] = { tob: { x: G.aHoja(p, { x: f.x, y: 0 }).x, y: TOB_G[lado] - f.alza / S }, ang: f.ang };
    }
    // cara
    const ex = guion(GUION_CARA_G, CARAS_G, "frio", t);
    ex.abre += 4 * tirita * (0.5 + 0.5 * Math.sin(t * 46));          // castañetea
    ex.esp *= 1 - tramo(t, T.borraFin0, T.borraFin1);
    p.cara = cara(ex, parpadeo(t, [0.85, 2.05, 4.7, 7.5, 13.6]));
    p.rojo = 0.85 * tramo(t, T.rojo0, T.rojo0 + 0.4);
    p.sudor = 0.7 * dentro(t, T.gVe + 0.1, T.gVe + 0.4, 20, 21);
    p.tt = t;
    return p;
  }

  /* =====================================================================================
   * DARI (a la derecha, en espejo: mira a la izquierda)
   * ===================================================================================== */
  const CARAS_D = {
    frio: E({ mx: 0.8, my: 0.1, orig: 0, sonr: -0.3, ancho: 0.7, abre: 3, sd: 10, gd: 0.12, si: 10, gi: 0.12 }),
    normal: E({ mx: 0.9, orig: 0, sonr: 0.1, ancho: 0.85 }),
    empanado: E({ mx: 0.9, orig: 0, sonr: -0.12, ancho: 0.72, sd: -3, si: -3 }),
    gafas: E({ mx: 0.5, my: 0.8, c: 0.5, orig: 0, sonr: -0.1, ancho: 0.75, sd: -8, gd: -0.12, si: -8, gi: -0.12 }),
    satisfecho: E({ mx: 0.85, c: 0.2, orig: 0, sonr: 0.45, ancho: 0.85, sd: 4, gd: 0.04, si: 10, gi: 0.08 }),
    serio: E({ mx: 0.95, c: 0.35, orig: 0, sonr: -0.1, ancho: 0.8, sd: -4, gd: -0.06, si: 14, gi: 0.1 }),
    gusto: E({ c: 1, h: 1, orig: 0, sonr: 0.5, ancho: 0.85, sd: 10, gd: 0.1, si: 10, gi: 0.1 }),
    bizquea: E({ mx: 0.85, c: 0.55, z: 0.1, orig: 0, sonr: -0.15, ancho: 0.7, sd: -10, gd: -0.18, si: -10, gi: -0.18 }),
    eh: E({ mx: 0.9, c: 0.45, orig: 0, abre: 10, sonr: -0.1, ancho: 0.6, sd: 16, gd: 0.15, si: 16, gi: 0.15 }),
    sorbe: E({ c: 1, h: 0.8, orig: 0, sonr: 0.3, ancho: 0.55, sd: 12, gd: 0.12, si: 12, gi: 0.12 }),
    ceja: E({ mx: 0.9, my: 0.1, c: 0.5, orig: 0, sonr: -0.15, ancho: 0.75, sd: 34, gd: -0.2, si: -8, gi: -0.12 }),
    listo: E({ mx: 0.9, c: 0.15, orig: 0, sonr: 0.5, ancho: 0.9, sd: 6, gd: 0.04, si: 14, gi: 0.1 }),
    final: E({ mx: -0.8, my: 0, orig: 0, sonr: -0.15, ancho: 0.7, sd: 2, gd: 0, si: 6, gi: 0.04 })
  };
  const GUION_CARA_D = [
    [0.2, 0.4, "frio"], [T.n1a, T.n1a + 0.4, "empanado"], [T.dQuita, T.dQuita + 0.2, "gafas"], [T.dPone, T.dPone + 0.15, "satisfecho"],
    [T.rie0 + 0.3, T.rie0 + 0.6, "gafas"], [T.dPone + 0.4, T.dPone + 0.6, "serio"], [T.huele0, T.huele0 + 0.25, "gusto"],
    [T.n2b - 0.1, T.n2b + 0.1, "empanado"], [T.dnQuita, T.dnQuita + 0.2, "bizquea"], [T.gQuita, T.gQuita + 0.12, "eh"],
    [8.25, 8.45, "bizquea"], [T.dSorbe0 + 0.15, T.dSorbe0 + 0.35, "sorbe"], [T.dSorbe1 - 0.3, T.dSorbe1 - 0.1, "bizquea"],
    [T.dVe, T.dVe + 0.25, "ceja"], [T.dAnda0, T.dAnda0 + 0.3, "bizquea"], [T.dPone2, T.dPone2 + 0.15, "listo"],
    [T.n3a + 0.15, T.n3b, "empanado"], [T.dCamara, T.dCamara + 0.3, "final"]
  ];
  const TOB_D = { cerca: D.SUELO - D.TOBILLO_ALTO, lejos: D.SUELO - D.TOBILLO_ALTO - 10 };

  function cuerpoD(t) {
    const respira = Math.sin(t * 2.0 + 1);
    const tirita = dentro(t, T.tir0 + 0.05, T.tir0 + 0.25, T.n1a - 0.1, T.n1a + 0.2);
    const quieto = dentro(t, T.n1b - 0.1, T.n1b, T.dSube - 0.05, T.dSube + 0.1);
    let x = XD, pies = { cerca: { x: XD + 24, alza: 0, ang: 0 }, lejos: { x: XD - 20, alza: 0, ang: 0 } }, bob = 0;
    if (t >= T.dAnda0) { const a = anda(t, T.dAnda0, T.dAnda1, XD, XD_FIN, 5, "lejos", { cerca: 24, lejos: -20 }, 24); x = a.x; pies = a.pies; bob = a.bob; }
    if (t >= T.dAtras0) { const a = anda(t, T.dAtras0, T.dAtras1, XD_FIN, XD_FIN + 34, 2, "cerca", { cerca: 24, lejos: -20 }, 14); x = a.x; pies = a.pies; bob = a.bob; }
    const frota = dentro(t, T.dQuita, T.dBaja, T.dPone0, T.dPone);
    const huele = dentro(t, T.huele0, T.huele1, T.dnSube, T.dnQuita);
    const mira = dentro(t, T.dnQuita, T.dnFuera, T.gQuita + 0.1, T.gQuita + 0.45);
    const sorbe = dentro(t, T.dSorbe0, T.dSorbe0 + 0.3, T.dSorbe1 - 0.3, T.dSorbe1);
    const deja = dentro(t, T.dDeja0, T.dDeja, T.dDeja + 0.05, T.dAnda0 + 0.3);
    const coge = dentro(t, T.dCoge0, T.dCoge, T.dPone2_0 + 0.1, T.dPone2);
    const p = {
      x: x + ruido(t * 37 + 9) * 1.5 * tirita - 12 * coge, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, ikContinuo: true,
      pelvis: { x: D.PELVIS.x, y: D.PELVIS.y + respira * 1.1 * (1 - quieto) + 0.6 * bob + 12 * huele + 16 * deja + 10 * coge },
      torso: 0.06 * frota + 0.07 * dentro(t, T.dTaza0, T.gDa, T.gDa + 0.05, T.huele0 + 0.25) + 0.12 * huele + 0.1 * mira - 0.05 * sorbe + 0.16 * deja
        + 0.06 * dentro(t, T.dAnda0, T.dAnda0 + 0.3, T.dAnda1 - 0.3, T.dAnda1) + 0.24 * coge + ruido(t * 33) * 0.01 * tirita,
      torsoEsc: { x: 1, y: 1 + respira * 0.004 * (1 - quieto) + 0.024 * tirita },
      piernas: {},
      cabeza: { ang: 0.13 * frota + 0.14 * huele + 0.06 * mira - 0.1 * sorbe - 0.06 * dentro(t, T.dVe, T.dVe + 0.3, T.dDeja0, T.dDeja)
          + 0.06 * coge + 0.015 * Math.sin(t * 0.9) - 0.08 * tramo(t, T.dCamara, T.dCamara + 0.35),
        dx: 0, dy: 12 * tirita, esc: { x: 1, y: 1 } }
    };
    for (const lado of ["cerca", "lejos"]) {
      const f = pies[lado];
      p.piernas[lado] = { tob: { x: D.aHoja(p, { x: f.x, y: 0 }).x, y: TOB_D[lado] - f.alza / S }, ang: f.ang };
    }
    const ex = guion(GUION_CARA_D, CARAS_D, "frio", t);
    p.cara = cara(ex, parpadeo(t, [0.65, 4.9, 8.3, 10.0, 12.95]));
    // gafas en la cara (gancho de Dari): un empujoncito al ponérselas
    const ajusta = campana(t, T.dPone - 0.05, T.dPone + 0.3) + campana(t, T.dPone2 - 0.05, T.dPone2 + 0.3);
    const est = ESTADOS[estadoEn(t)].en;
    p.gafas = { dx: 0, dy: -7 * ajusta, ang: 0, fuera: est === "caraD" ? 0 : 1 };
    p.tt = t;
    return p;
  }

  /* =====================================================================================
   * MANOS (se calculan con las dos posturas)
   * ===================================================================================== */
  // Dari, mano cercana (la de detrás): se quita las gafas empañadas por segunda vez y las mira de lejos
  function manoDcerca(P) {
    const p = P.d, t = P.t, m = manoInicial(D, p, "cerca");
    const H = D.cabeza(p);
    if (t > T.dnSube) {
      const bis = H.a({ x: CEN.x + p.gafas.dx + (BIS.cerca.x - CEN.x), y: CEN.y + p.gafas.dy + (BIS.cerca.y - CEN.y) });
      pone(D, p, m, "cerca", tramo(t, T.dnSube, T.dnQuita), { q: bis, d: PINZA, mu: 1.75 });
      const fuera = D.tronco(p)({ x: 440 + 6 * Math.sin(t * 5), y: 418 });
      pone(D, p, m, "cerca", tramo(t, T.dnQuita + 0.02, T.dnFuera), { q: fuera, d: PINZA, mu: Math.PI - 0.15 });
      pone(D, p, m, "cerca", tramo(t, T.gQuita + 0.25, T.gQuita + 0.65), vuelveBolsillo(D, p, "cerca"));
    }
    p.manoCerca = m;
    return m;
  }
  // Guillermo
  function manosG(P) {
    const p = P.g, t = P.t, Tr = G.tronco(p);
    const c = manoInicial(G, p, "cerca"), l = manoInicial(G, p, "lejos");
    // se ríe con la mano en la barriga
    const barriga = { q: Tr({ x: 300 + 6 * Math.sin(t * 17), y: 560 }), d: PALMA, mu: -2.6 };
    pone(G, p, c, "cerca", dentro(t, T.rie0 + 0.05, T.rie0 + 0.3, T.rie1 - 0.3, T.rie1), barriga);
    pone(G, p, c, "cerca", dentro(t, T.rie2a + 0.05, T.rie2a + 0.3, T.rie2b - 0.2, T.rie2b + 0.1), barriga);
    // coge la taza por el asa y se la da a Dari
    const asa = G.aHoja(p, { x: TAZA0.x - 21 * U_TAZA, y: TAZA0.y });
    pone(G, p, l, "lejos", tramo(t, T.gCoge0, T.gCoge), { q: asa, d: AGARRA, mu: -2.4 });
    const da = G.aHoja(p, { x: 500, y: 300 - 14 * campana(t, T.gCoge, T.gDa) });
    pone(G, p, l, "lejos", tramo(t, T.gCoge + 0.02, T.gDa - 0.05), { q: da, d: AGARRA, mu: Math.PI - 0.5 });
    pone(G, p, l, "lejos", tramo(t, T.gDa + 0.05, T.gVuelve), vuelveBolsillo(G, p, "lejos"));
    // le señala muerto de risa
    const h = Tr(G.HOMBRO);
    const senala = { q: { x: h.x + 215, y: h.y - 130 + 10 * Math.sin(t * 17) }, d: SENALA, mu: Math.PI - 0.55 };
    pone(G, p, l, "lejos", tramo(t, T.rie2a + 0.1, T.rie2a + 0.35), senala);
    // le birla las gafas (por la bisagra de delante) y se las pone
    if (t > T.gQuita0) {
      const Pd = { g: p, d: P.d, t };
      const bis = G.aHoja(p, bisagra(3, Pd, "lejos"));
      pone(G, p, l, "lejos", tramo(t, T.gQuita0, T.gQuita), { q: bis, d: PINZA, mu: Math.PI - 0.3 });
      const cara = G.cabeza(p).a(AF.ap(SIM, loc(BIS.lejos)));
      pone(G, p, l, "lejos", tramo(t, T.gQuita + 0.03, T.gPone), { q: cara, d: PINZA, mu: 1.9 });
    }
    // mareado: brazos abiertos para no caerse
    const wob = Math.sin(t * 5.3);
    pone(G, p, l, "lejos", tramo(t, T.gPone + 0.05, T.gPone + 0.35), { q: Tr({ x: 540, y: 560 + 30 * wob }), d: ABIERTA, mu: -2.3 });
    pone(G, p, c, "cerca", tramo(t, T.gPone + 0.05, T.gPone + 0.4), { q: Tr({ x: 20, y: 600 - 30 * wob }), d: ABIERTA, mu: -1.0 });
    // «¡Dari!»: abre los brazos y va hacia él
    const abre = tramo(t, T.abre0, T.abre1) * (1 - tramo(t, T.anda1 - 0.15, T.anda1 + 0.05));
    const bb = 10 * Math.sin(t * 9);
    pone(G, p, l, "lejos", abre, { q: Tr({ x: 590, y: 420 + bb }), d: ABIERTA, mu: Math.PI - 0.2 });
    pone(G, p, c, "cerca", abre, { q: Tr({ x: 430, y: 400 - bb }), d: ABIERTA, mu: Math.PI - 0.1 });
    // lo abraza: una mano por detrás del abrigo, la otra le da palmaditas
    const ab = tramo(t, T.anda1 - 0.15, T.choca + 0.1) * (1 - tramo(t, T.gSuelta, T.gSuelta + 0.25));
    const th = anguloPercha(t), pc = (x, y) => G.aHoja(p, rotaPercha({ x, y }, th));
    const palmadita = Math.max(0, Math.sin((t - T.choca) * 11)) * dentro(t, 10.9, 11.0, 12.1, 12.3);
    pone(G, p, l, "lejos", ab, { q: pc(PX - 22, 326), d: PALMA, mu: Math.PI - 0.3, ang: 0 });
    pone(G, p, c, "cerca", ab, { q: pc(PX - 2 + 3 * palmadita, 262 - 12 * palmadita), d: ABIERTA, mu: Math.PI - 0.1 });
    // lo suelta, «uy»: las manos arriba
    const suelta = tramo(t, T.gSuelta, T.gSuelta + 0.25);
    pone(G, p, l, "lejos", suelta, { q: Tr({ x: 470, y: 300 }), d: ABIERTA, mu: Math.PI / 2 + 0.2 });
    pone(G, p, c, "cerca", suelta, { q: Tr({ x: 230, y: 330 }), d: ABIERTA, mu: Math.PI / 2 + 0.3 });
    p.manoCerca = c; p.manoLejos = l;
  }
  // Dari, mano lejana (la de delante): gafas, taza y, al final, las gafas otra vez
  function manoDlejos(P) {
    const p = P.d, t = P.t, Tr = D.tronco(p), H = D.cabeza(p), m = manoInicial(D, p, "lejos");
    const bisCara = () => H.a({ x: CEN.x + p.gafas.dx + (BIS.lejos.x - CEN.x), y: CEN.y + p.gafas.dy + (BIS.lejos.y - CEN.y) });
    // se las quita, las frota en la parka y se las vuelve a poner
    pone(D, p, m, "lejos", tramo(t, T.dSube, T.dQuita), { q: bisCara(), d: PINZA, mu: 1.9 });
    const w = (t - T.frota0) * Math.PI * 2 * 3 / (T.frota1 - T.frota0), kf = dentro(t, T.frota0 - 0.05, T.frota0 + 0.08, T.frota1 - 0.08, T.frota1);
    pone(D, p, m, "lejos", tramo(t, T.dQuita + 0.02, T.dBaja), { q: Tr({ x: 330 + 22 * Math.cos(w) * kf, y: 450 + 14 * Math.sin(w) * kf }), d: PINZA, mu: -2.2 });
    pone(D, p, m, "lejos", tramo(t, T.dPone0, T.dPone), { q: bisCara(), d: PINZA, mu: 1.9 });
    pone(D, p, m, "lejos", tramo(t, T.dPone + 0.15, T.dPone + 0.5), vuelveBolsillo(D, p, "lejos"));
    // la taza: la coge de la mano de Guillermo (por debajo), la huele y luego la baja
    if (t > T.dTaza0 && t < T.gDa) {
      const cTaza = AF.ap(tazaM(t, P).M, { x: 0, y: 0 });
      pone(D, p, m, "lejos", tramo(t, T.dTaza0, T.gDa), { q: D.aHoja(p, { x: cTaza.x, y: cTaza.y + 16 * U_TAZA }), d: AGARRA, mu: 2.2 });
    } else if (t >= T.gDa) {
      pone(D, p, m, "lejos", 1, { q: D.aHoja(p, { x: 516.4, y: 312.5 }), d: AGARRA, mu: 2.2 });
    }
    const bajoNariz = H.a({ x: 930, y: 870 });
    pone(D, p, m, "lejos", tramo(t, T.huele0, T.huele1), { q: { x: bajoNariz.x - 10, y: bajoNariz.y + 110 }, d: AGARRA, mu: 2.4 });
    pone(D, p, m, "lejos", tramo(t, T.dnSube - 0.1, T.dnQuita + 0.2), { q: Tr({ x: 360, y: 410 }), d: AGARRA, mu: 2.3 });
    // sorbe (sin gafas no se le empaña nada)
    const boca = H.a({ x: 880, y: 760 });
    pone(D, p, m, "lejos", dentro(t, T.dSorbe0, T.dSorbe0 + 0.3, T.dSorbe1 - 0.3, T.dSorbe1), { q: { x: boca.x, y: boca.y + 60 }, d: AGARRA, mu: 2.1, ang: 0.45 });
    // la deja en la mesita
    pone(D, p, m, "lejos", tramo(t, T.dDeja0, T.dDeja), { q: D.aHoja(p, { x: TAZA1.x, y: TAZA1.y + 16 * U_TAZA }), d: AGARRA, mu: 2.4 });
    pone(D, p, m, "lejos", tramo(t, T.dDeja + 0.05, T.dAnda0 + 0.3), vuelveBolsillo(D, p, "lejos"));
    // le quita las gafas a Guillermo (por la bisagra de atrás) y se las pone
    if (t > T.dCoge0 - 0.05) {
      const bis = D.aHoja(p, bisagra(5, P, "punta"));
      pone(D, p, m, "lejos", tramo(t, T.dCoge0, T.dCoge), { q: bis, d: PINZA, mu: 1.6 });
      pone(D, p, m, "lejos", tramo(t, T.dCoge + 0.03, T.dPone2), { q: bisCara(), d: PINZA, mu: 1.9 });
      pone(D, p, m, "lejos", tramo(t, T.dPone2 + 0.2, T.dPone2 + 0.55), vuelveBolsillo(D, p, "lejos"));
    }
    p.manoLejos = m;
    return m;
  }

  // posturas (cuerpos y manos) y, aparte, lo que llevan encima (objetos en las manos y capas de la cara)
  function posturas(t) {
    const P = { g: cuerpoG(t), d: cuerpoD(t), t };
    manoDcerca(P);
    manosG(P);
    manoDlejos(P);
    return P;
  }
  function pose(t) {
    const P = posturas(t);
    // objetos en las manos
    const gi = estadoEn(t), e = ESTADOS[gi];
    if (e.en === "mano") {
      const m = manoDe(P, e), H = mMano(RP[e.R], P[e.R], m), M = gafasEstado(gi, P), rel = AF.mul(AF.inv(H), M), nb = niebla(t);
      m.objeto = g => { g.save(); g.transform(rel.a, rel.b, rel.c, rel.d, rel.e, rel.f); g.translate(-CEN.x, -CEN.y); dibGafas(g, nb.nv, nb.al, t); g.restore(); };
    }
    const tz = tazaM(t, P);
    if (tz.en !== "mesa") {
      const m = tz.en === "g" ? P.g.manoLejos : P.d.manoLejos, ag = tz.en === "g" ? AGARRE_G : AGARRE_D;
      const prev = m.objeto;
      m.objeto = (g, tt) => { if (prev) prev(g, tt); g.save(); g.transform(ag.a, ag.b, ag.c, ag.d, ag.e, ag.f); taza(g); g.restore(); };
    }
    // capas de la cara
    const nb = niebla(t);
    P.d.capaCabeza = g => {
      const o = P.d.gafas;
      if (o.fuera < 0.5) {
        g.save(); g.translate(CEN.x + o.dx, CEN.y + o.dy); g.rotate(o.ang); g.translate(-CEN.x, -CEN.y);
        if (nb.nv * nb.al > 0.004) { vaho(g, nb.nv, nb.al, t); montura(g); }
        destello(g, campana(t, T.brillo, T.brillo + 0.45) + campana(t, T.brillo2, T.brillo2 + 0.45), 985, 548);
        g.restore();
      }
      nieveCabeza(g, t, NIEVE_D);
    };
    P.d.capaTronco = g => nieveTronco(g, t, NIEVE_TD);
    P.g.capaCabeza = g => {
      nieveCabeza(g, t, NIEVE_G);
      if (e.en === "caraG") { g.save(); g.transform(SIM.a, SIM.b, SIM.c, SIM.d, SIM.e, SIM.f); g.translate(-CEN.x, -CEN.y); dibGafas(g, 0, 0, t); g.restore(); }
    };
    P.g.capaTronco = g => nieveTronco(g, t, NIEVE_TG);
    return P;
  }

  /* ---------- nieve en los hombros y en el pelo (se derrite) ---------- */
  const NIEVE_G = [[700, 300, 30], [800, 285, 26], [610, 340, 22]], NIEVE_D = [[742, 236, 32], [862, 226, 30], [636, 292, 26]];
  const NIEVE_TG = [[120, 330, 30], [340, 345, 34]], NIEVE_TD = [[118, 300, 32], [370, 305, 34]];
  const derrite = t => 1 - tramo(t, 1.3, 3.4);
  function copito(g, x, y, r, k, t, i) {
    if (k <= 0.01) return;
    g.save(); g.fillStyle = "#ffffff"; g.strokeStyle = "rgba(120,150,190,0.8)"; g.lineWidth = 3;
    const rr = r * (0.35 + 0.65 * k);
    g.beginPath(); g.ellipse(x, y, rr * 1.2, rr * 0.62, 0, Math.PI, 0); g.quadraticCurveTo(x + rr * 0.4, y + rr * 0.35, x - rr * 1.2, y); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(205,225,245,0.9)"; g.beginPath(); g.ellipse(x + rr * 0.3, y - rr * 0.05, rr * 0.5, rr * 0.18, 0, 0, Math.PI * 2); g.fill();
    // gota que cae al derretirse
    const ph = fase(t, 1.6 + 0.3 * i, 2.6 + 0.3 * i);
    if (ph > 0 && ph < 1) { g.globalAlpha = 1 - ph; g.fillStyle = "#cfeaff"; g.beginPath(); g.arc(x, y + 8 + ph * 70, 5, 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.restore();
  }
  const nieveCabeza = (g, t, L) => { const k = derrite(t); L.forEach(([x, y, r], i) => copito(g, x, y, r, k, t, i)); };
  const nieveTronco = (g, t, L) => { const k = derrite(t); L.forEach(([x, y, r], i) => copito(g, x, y, r, k, t, i + 3)); };

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  const PUERTA = { x0: 196, x1: 326, y0: 128, y1: 452 }, VENT = { x0: 712, x1: 934, y0: 92, y1: 296 };
  let fondo = null, bruma = null;
  function exterior(g, x0, y0, x1, y1) {          // la calle nevada de noche (recortada a un hueco)
    const c = g.createLinearGradient(0, y0, 0, y1); c.addColorStop(0, "#0b1430"); c.addColorStop(0.6, "#1d3260"); c.addColorStop(1, "#3a5a8c");
    g.fillStyle = c; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    const f = g.createRadialGradient(x0 + (x1 - x0) * 0.7, y0 + (y1 - y0) * 0.35, 4, x0 + (x1 - x0) * 0.7, y0 + (y1 - y0) * 0.35, 120);
    f.addColorStop(0, "rgba(255,226,160,0.75)"); f.addColorStop(1, "rgba(255,226,160,0)"); g.fillStyle = f; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  }
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 140; const g = c.getContext("2d");
    g.translate(60, 70); g.lineJoin = "round";
    // papel pintado granate con rayas y medallones
    g.fillStyle = "#6e2320"; g.fillRect(-60, -70, W + 120, 520);
    for (let x = -60; x < W + 60; x += 34) { g.fillStyle = "rgba(255,190,140,0.05)"; g.fillRect(x, -70, 14, 520); }
    g.fillStyle = "rgba(255,200,140,0.07)";
    for (let y = -40; y < 330; y += 64) for (let x = -50 + ((y / 64) % 2) * 17; x < W + 60; x += 68) { g.beginPath(); g.ellipse(x, y, 6, 9, 0, 0, Math.PI * 2); g.fill(); }
    // luz cálida de las lámparas sobre la pared
    for (const [lx, ly, r] of [[MESA.x, 70, 330], [990, 80, 240], [120, 60, 220]]) {
      const h = g.createRadialGradient(lx, ly, 10, lx, ly, r); h.addColorStop(0, "rgba(255,196,110,0.42)"); h.addColorStop(1, "rgba(255,170,90,0)");
      g.fillStyle = h; g.fillRect(lx - r, ly - r, 2 * r, 2 * r);
    }
    // zócalo de madera con cuarterones
    g.fillStyle = "#4a2614"; g.fillRect(-60, 330, W + 120, 122);
    g.fillStyle = "#6b3a1e"; g.fillRect(-60, 322, W + 120, 12); g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.strokeRect(-62, 322, W + 124, 12);
    for (let x = -50; x < W + 60; x += 92) { g.strokeStyle = "rgba(0,0,0,0.45)"; g.lineWidth = 3; g.strokeRect(x + 8, 346, 76, 92); g.strokeStyle = "rgba(255,190,130,0.12)"; g.lineWidth = 2; g.strokeRect(x + 11, 349, 70, 86); }
    // ventana con la calle nevada
    const V = VENT;
    g.save(); g.beginPath(); g.rect(V.x0, V.y0, V.x1 - V.x0, V.y1 - V.y0); g.clip(); exterior(g, V.x0, V.y0, V.x1, V.y1);
    // tejados nevados y una farola
    g.fillStyle = "#14203f"; g.beginPath(); g.moveTo(V.x0, 230); g.lineTo(V.x0 + 50, 196); g.lineTo(V.x0 + 110, 214); g.lineTo(V.x0 + 150, 186); g.lineTo(V.x1, 220); g.lineTo(V.x1, V.y1); g.lineTo(V.x0, V.y1); g.closePath(); g.fill();
    g.fillStyle = "#e8f0ff"; g.beginPath(); g.moveTo(V.x0, 232); g.lineTo(V.x0 + 50, 198); g.lineTo(V.x0 + 110, 216); g.lineTo(V.x0 + 150, 188); g.lineTo(V.x1, 222); g.lineTo(V.x1, 230); g.lineTo(V.x0 + 150, 197); g.lineTo(V.x0 + 110, 224); g.lineTo(V.x0 + 50, 206); g.lineTo(V.x0, 240); g.closePath(); g.fill();
    for (const [wx, wy] of [[V.x0 + 30, 244], [V.x0 + 90, 238], [V.x0 + 170, 236]]) { g.fillStyle = "#ffcf7a"; g.fillRect(wx, wy, 14, 18); }
    g.fillStyle = "#dfe9fb"; g.fillRect(V.x0, 270, V.x1 - V.x0, 30);
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 4; g.beginPath(); g.moveTo(V.x1 - 50, 272); g.lineTo(V.x1 - 50, 140); g.stroke();
    g.fillStyle = "#ffe2a0"; g.beginPath(); g.arc(V.x1 - 50, 134, 7, 0, Math.PI * 2); g.fill();
    // escarcha en las esquinas
    for (const [ex, ey] of [[V.x0, V.y0], [V.x1, V.y0], [V.x0, V.y1], [V.x1, V.y1]]) {
      const e = g.createRadialGradient(ex, ey, 2, ex, ey, 70); e.addColorStop(0, "rgba(235,245,255,0.75)"); e.addColorStop(1, "rgba(235,245,255,0)");
      g.fillStyle = e; g.fillRect(ex - 70, ey - 70, 140, 140);
    }
    g.restore();
    g.strokeStyle = "#3b1e0e"; g.lineWidth = 14; g.strokeRect(V.x0, V.y0, V.x1 - V.x0, V.y1 - V.y0);
    g.lineWidth = 6; g.beginPath(); g.moveTo((V.x0 + V.x1) / 2, V.y0); g.lineTo((V.x0 + V.x1) / 2, V.y1); g.moveTo(V.x0, 190); g.lineTo(V.x1, 190); g.stroke();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(V.x0 - 7, V.y0 - 7, V.x1 - V.x0 + 14, V.y1 - V.y0 + 14);
    g.fillStyle = "#5b3220"; g.fillRect(V.x0 - 16, V.y1 + 4, V.x1 - V.x0 + 32, 12); g.strokeRect(V.x0 - 16, V.y1 + 4, V.x1 - V.x0 + 32, 12);
    // radiador bajo la ventana
    g.fillStyle = "#d9d2c3"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5;
    for (let i = 0; i < 9; i++) { const x = V.x0 + 30 + i * 18; g.beginPath(); g.roundRect ? g.roundRect(x, 352, 15, 74, 6) : g.rect(x, 352, 15, 74); g.fill(); g.stroke(); }
    g.fillRect(V.x0 + 24, 418, 172, 8); g.strokeRect(V.x0 + 24, 418, 172, 8);
    // la puerta: hueco a la calle y marco (la hoja se dibuja aparte)
    const P = PUERTA;
    g.save(); g.beginPath(); g.rect(P.x0, P.y0, P.x1 - P.x0, P.y1 - P.y0); g.clip(); exterior(g, P.x0, P.y0, P.x1, P.y1);
    g.fillStyle = "#dfe9fb"; g.fillRect(P.x0, 380, P.x1 - P.x0, P.y1 - 380); g.fillStyle = "#14203f"; g.fillRect(P.x0 + 20, 300, 40, 80); g.restore();
    g.fillStyle = "#3b1e0e"; g.fillRect(P.x0 - 16, P.y0 - 18, P.x1 - P.x0 + 32, 18); g.fillRect(P.x0 - 16, P.y0, 16, P.y1 - P.y0); g.fillRect(P.x1, P.y0, 16, P.y1 - P.y0);
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.strokeRect(P.x0 - 16, P.y0 - 18, P.x1 - P.x0 + 32, P.y1 - P.y0 + 18); g.strokeRect(P.x0, P.y0, P.x1 - P.x0, P.y1 - P.y0);
    // barra al fondo a la derecha con la cafetera
    g.fillStyle = "#3a1d0f"; g.fillRect(958, 322, 130, 130); g.strokeRect(958, 322, 130, 130);
    g.fillStyle = "#7a4220"; g.fillRect(950, 312, 140, 12); g.strokeRect(950, 312, 140, 12);
    g.fillStyle = "#b9c0c8"; g.fillRect(976, 236, 70, 76); g.strokeRect(976, 236, 70, 76);
    g.fillStyle = "#c0322a"; g.fillRect(976, 226, 70, 14); g.strokeRect(976, 226, 70, 14);
    g.fillStyle = "#0b0a0e"; g.fillRect(990, 276, 8, 16); g.fillRect(1020, 276, 8, 16);
    g.fillStyle = "#f4efe6"; for (const x of [985, 1015]) { g.beginPath(); g.rect(x, 294, 18, 14); g.fill(); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,0.45)"; g.fillRect(982, 244, 6, 60);
    // estante con tazas y botes
    g.fillStyle = "#5b3220"; g.fillRect(950, 150, 140, 10); g.strokeRect(950, 150, 140, 10);
    for (let i = 0; i < 5; i++) { const x = 962 + i * 24; g.fillStyle = ["#e9c46a", "#2a9d8f", "#f4efe6", "#e76f51", "#f4efe6"][i]; g.beginPath(); g.rect(x, 124, 16, 26); g.fill(); g.stroke(); }
    // suelo de tarima y felpudo
    const su = g.createLinearGradient(0, 452, 0, H + 70); su.addColorStop(0, "#7a4527"); su.addColorStop(1, "#46230f");
    g.fillStyle = su; g.fillRect(-60, 452, W + 120, H + 70 - 452);
    g.fillStyle = "#0b0a0e"; g.fillRect(-60, 449, W + 120, 5);
    g.strokeStyle = "rgba(30,10,4,0.45)"; g.lineWidth = 2;
    for (const y of [474, 502, 536, 578, 628]) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    for (let i = 0; i < 40; i++) { const y = [452, 474, 502, 536, 578, 628][i % 6], y2 = [474, 502, 536, 578, 628, 680][i % 6], x = -60 + hash(i + 2) * (W + 120);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x, y2); g.stroke(); }
    g.fillStyle = "#6a5a3a"; g.beginPath(); g.moveTo(PUERTA.x0 - 20, 458); g.lineTo(PUERTA.x1 + 20, 458); g.lineTo(PUERTA.x1 + 44, 486); g.lineTo(PUERTA.x0 - 44, 486); g.closePath(); g.fill();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5; g.stroke();
    g.strokeStyle = "rgba(40,30,15,0.5)"; g.lineWidth = 1.5; for (let i = 0; i < 14; i++) { const x = PUERTA.x0 - 30 + i * 13; g.beginPath(); g.moveTo(x, 461); g.lineTo(x - 4, 483); g.stroke(); }
    // charquito de nieve derretida
    g.fillStyle = "rgba(170,210,240,0.35)"; g.beginPath(); g.ellipse(PUERTA.x1 + 24, 500, 40, 7, 0, 0, Math.PI * 2); g.fill();
    // lámpara colgante sobre la mesita
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 3; g.beginPath(); g.moveTo(MESA.x, -70); g.lineTo(MESA.x, 30); g.stroke();
    g.fillStyle = "#2a4a3a"; g.beginPath(); g.moveTo(MESA.x - 34, 58); g.quadraticCurveTo(MESA.x, 18, MESA.x + 34, 58); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#ffe6a8"; g.beginPath(); g.ellipse(MESA.x, 58, 26, 6, 0, 0, Math.PI * 2); g.fill();
    // viñeta
    const v = g.createRadialGradient(512, 300, 300, 512, 300, 720); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.5)");
    g.fillStyle = v; g.fillRect(-60, -70, W + 120, H + 140);
    return c;
  }
  // bruma de los bordes cuando todo se ve borroso (una vez)
  function creaBruma() {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    const v = g.createRadialGradient(W / 2, H / 2, 180, W / 2, H / 2, 620); v.addColorStop(0, "rgba(235,225,255,0)"); v.addColorStop(1, "rgba(235,225,255,0.85)");
    g.fillStyle = v; g.fillRect(0, 0, W, H); return c;
  }
  // copos que caen al otro lado de la ventana
  function nevada(g, t) {
    const V = VENT;
    g.save(); g.beginPath(); g.rect(V.x0, V.y0, V.x1 - V.x0, V.y1 - V.y0); g.clip(); g.fillStyle = "#ffffff";
    for (let i = 0; i < 26; i++) {
      const v = 18 + 16 * hash(i + 50), alto = V.y1 - V.y0 + 20, y = V.y0 - 10 + ((t * v + hash(i + 9) * alto) % alto);
      const x = V.x0 + hash(i) * (V.x1 - V.x0) + 7 * Math.sin(t * 1.3 + i);
      g.globalAlpha = 0.85; g.beginPath(); g.arc(x, y, 1.2 + 1.8 * hash(i + 3), 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  // la hoja de la puerta: abierta al empezar, se cierra de golpe (rebota un poco)
  function angPuerta(t) {
    const k = fase(t, T.puerta0, T.puerta1), c = entrada(k);
    const rebote = t > T.puerta1 ? 0.12 * Math.exp(-(t - T.puerta1) * 9) * Math.abs(Math.sin((t - T.puerta1) * 22)) : 0;
    return lerp(1.2, 0, c) + rebote;
  }
  function puerta(g, t) {
    const P = PUERTA, a = angPuerta(t), w = (P.x1 - P.x0) * Math.cos(a);
    g.save(); g.lineJoin = "round"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 3;
    // copos que entran mientras está abierta
    if (a > 0.05) { g.save(); g.beginPath(); g.rect(P.x0 + w, P.y0, P.x1 - P.x0 - w, P.y1 - P.y0); g.clip(); g.fillStyle = "#fff";
      for (let i = 0; i < 10; i++) { const y = P.y0 + ((t * 60 + hash(i + 70) * 330) % 330), x = P.x0 + hash(i + 71) * (P.x1 - P.x0) + 10 * Math.sin(t * 3 + i);
        g.beginPath(); g.arc(x, y, 1.6 + hash(i) * 1.6, 0, Math.PI * 2); g.fill(); } g.restore(); }
    // hoja (de madera, con cristal) que gira sobre las bisagras de la izquierda
    g.fillStyle = "#5e3218"; g.fillRect(P.x0, P.y0, w, P.y1 - P.y0); g.strokeRect(P.x0, P.y0, w, P.y1 - P.y0);
    g.fillStyle = "#26406e"; g.fillRect(P.x0 + w * 0.16, P.y0 + 24, w * 0.68, 150); g.strokeRect(P.x0 + w * 0.16, P.y0 + 24, w * 0.68, 150);
    g.fillStyle = "rgba(235,245,255,0.5)"; g.fillRect(P.x0 + w * 0.2, P.y0 + 140, w * 0.6, 30);
    g.strokeRect(P.x0 + w * 0.16, P.y0 + 200, w * 0.68, 100);
    g.fillStyle = "#d9b45a"; g.beginPath(); g.arc(P.x0 + w * 0.86, P.y0 + 190, 5, 0, Math.PI * 2); g.fill(); g.stroke();
    // canto de la hoja (se ve al abrirse)
    const canto = 14 * Math.sin(a); if (canto > 0.5) { g.fillStyle = "#3b1e0e"; g.fillRect(P.x0 + w, P.y0, canto, P.y1 - P.y0); g.strokeRect(P.x0 + w, P.y0, canto, P.y1 - P.y0); }
    g.restore();
    // aire frío en el suelo
    const frio = tramo(a, 0, 1.0, s => s);
    if (frio > 0.01) { g.save(); g.globalAlpha = 0.35 * frio; g.fillStyle = "#9cc4ff";
      g.beginPath(); g.moveTo(P.x0 + w, P.y1); g.lineTo(P.x1, P.y1); g.lineTo(P.x1 + 140, H + 40); g.lineTo(P.x0 + w - 40, H + 40); g.closePath(); g.fill(); g.restore(); }
  }
  // ráfaga de copos que se cuela al entrar
  function rafaga(g, t) {
    const k = fase(t, 0.12, 1.7); if (k <= 0 || k >= 1) return;
    g.save(); g.fillStyle = "#ffffff";
    for (let i = 0; i < 14; i++) {
      const u = clamp(k * 1.3 - hash(i + 5) * 0.3), x = PUERTA.x1 - 10 + u * (160 + 220 * hash(i + 1)) + 20 * Math.sin(u * 9 + i), y = 160 + hash(i + 2) * 200 + u * u * 260 + 12 * Math.sin(u * 7 + i);
      g.globalAlpha = Math.sin(Math.PI * clamp(u * 1.05)); g.beginPath(); g.arc(x, Math.min(y, 552), 2 + 2 * hash(i + 3), 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  /* ---------- perchero: abrigo beis y gorro de pelo rizado (de lejos y borroso… parece Dari) ---------- */
  function anguloPercha(t) {
    const tc = t - T.choca; if (tc <= 0) return 0.006 * campana(t, T.puerta1, T.puerta1 + 0.5) * Math.sin((t - T.puerta1) * 30);
    return -0.05 * suave(fase(tc, 0, 0.25)) - 0.07 * Math.exp(-tc * 4) * Math.sin(tc * 14);
  }
  const rotaPercha = (q, th) => { const c = Math.cos(th), s = Math.sin(th), x = q.x - PX, y = q.y - SUELO; return { x: PX + x * c - y * s, y: SUELO + x * s + y * c }; };
  const CIMA = { x: PX, y: 128 };
  function gorro(g, x, y, ang, esc) {
    g.save(); g.translate(x, y); g.rotate(ang); g.scale(esc, esc); g.lineJoin = "round";
    g.fillStyle = "#4a2c1c"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(-30, 10); g.bezierCurveTo(-34, -30, 34, -30, 30, 10); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#6b4430"; g.strokeStyle = "#2a160c"; g.lineWidth = 1.6;
    for (let i = 0; i < 13; i++) { const a = Math.PI * (1.05 + 0.9 * hash(i + 1)), r = 10 + 14 * hash(i + 2), cx = Math.cos(a) * r * 1.1, cy = 4 + Math.sin(a) * r;
      g.beginPath(); g.arc(cx, cy, 4.5 + 2 * hash(i + 3), 0, Math.PI * 1.6); g.fill(); g.stroke(); }
    g.fillStyle = "#3a2216"; g.beginPath(); g.ellipse(0, 10, 31, 5, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 2.5; g.strokeStyle = "#0b0a0e"; g.stroke();
    g.restore();
  }
  function perchero(g, t, conGorro) {
    const th = anguloPercha(t);
    g.save(); g.translate(PX, SUELO); g.rotate(th); g.translate(-PX, -SUELO);
    g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = "#0b0a0e";
    // patas y palo
    g.lineWidth = 9; g.beginPath(); g.moveTo(PX - 44, SUELO); g.quadraticCurveTo(PX - 10, SUELO - 10, PX, SUELO - 50); g.quadraticCurveTo(PX + 10, SUELO - 10, PX + 44, SUELO); g.stroke();
    g.strokeStyle = "#7a4520"; g.lineWidth = 5; g.stroke();
    g.strokeStyle = "#0b0a0e"; g.lineWidth = 12; g.beginPath(); g.moveTo(PX, SUELO - 4); g.lineTo(PX, CIMA.y + 4); g.stroke();
    g.strokeStyle = "#7a4520"; g.lineWidth = 7; g.stroke(); g.strokeStyle = "rgba(255,200,140,0.35)"; g.lineWidth = 2; g.beginPath(); g.moveTo(PX - 2, SUELO - 10); g.lineTo(PX - 2, CIMA.y + 10); g.stroke();
    // ganchos
    g.lineWidth = 7; g.strokeStyle = "#0b0a0e";
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(PX, 168); g.quadraticCurveTo(PX + s * 30, 160, PX + s * 34, 140); g.stroke(); }
    g.lineWidth = 3.5; g.strokeStyle = "#7a4520"; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(PX, 168); g.quadraticCurveTo(PX + s * 30, 160, PX + s * 34, 140); g.stroke(); }
    // bufanda roja colgando por detrás
    g.fillStyle = "#b8322a"; g.strokeStyle = "#0b0a0e"; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(PX + 22, 156); g.quadraticCurveTo(PX + 40, 220, PX + 34, 300); g.lineTo(PX + 22, 300); g.quadraticCurveTo(PX + 26, 220, PX + 10, 166); g.closePath(); g.fill(); g.stroke();
    // abrigo beis con capucha
    const sw = 4 * Math.sin(t * 1.3) * 0;
    g.fillStyle = "#cfac7c"; g.beginPath();
    g.moveTo(PX - 18, 160); g.quadraticCurveTo(PX - 46, 172, PX - 48, 210); g.lineTo(PX - 50 + sw, 372); g.quadraticCurveTo(PX, 382, PX + 46 + sw, 370);
    g.lineTo(PX + 44, 210); g.quadraticCurveTo(PX + 42, 172, PX + 18, 160); g.quadraticCurveTo(PX, 150, PX - 18, 160); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(120,86,48,0.35)"; g.beginPath(); g.moveTo(PX + 10, 175); g.lineTo(PX + 44, 210); g.lineTo(PX + 46, 370); g.quadraticCurveTo(PX + 26, 376, PX + 12, 376); g.closePath(); g.fill();
    // mangas colgando
    g.fillStyle = "#c39f6e";
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(PX + s * 44, 200); g.quadraticCurveTo(PX + s * 58, 270, PX + s * 52, 340); g.lineTo(PX + s * 38, 338); g.quadraticCurveTo(PX + s * 42, 270, PX + s * 34, 214); g.closePath(); g.fill(); g.stroke(); }
    // capucha, cremallera y bolsillos
    g.fillStyle = "#d8b98c"; g.beginPath(); g.ellipse(PX, 166, 26, 12, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.moveTo(PX, 180); g.lineTo(PX + 2, 376); g.stroke();
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(PX + s * 12, 300); g.lineTo(PX + s * 36, 296); g.stroke(); }
    // bola del remate
    g.fillStyle = "#7a4520"; g.lineWidth = 3; g.beginPath(); g.arc(CIMA.x, CIMA.y + 6, 8, 0, Math.PI * 2); g.fill(); g.stroke();
    if (conGorro) gorro(g, CIMA.x, CIMA.y - 8, 0, 1);
    g.restore();
  }
  // el gorro: en el perchero, cae a la cabeza de Guillermo y se queda allí
  const GORRO_G = { x: 745, y: 290 };         // coronilla de Guillermo (retrato)
  function gorroCae(g, t, pg) {
    if (t < T.gorro0) return;
    const th = anguloPercha(t), ini = rotaPercha({ x: CIMA.x, y: CIMA.y - 8 }, th);
    const H = G.cabeza(pg), fin = G.aPantalla(pg, H.a(GORRO_G)), angG = pg.espejo ? -H.ang : H.ang;
    const k = fase(t, T.gorro0, T.gorro1), ks = entrada(k);
    const q = { x: lerp(ini.x, fin.x, k), y: lerp(ini.y, fin.y, ks) - 40 * Math.sin(Math.PI * k) };
    const aterriza = t > T.gorro1 ? Math.exp(-(t - T.gorro1) * 8) * Math.sin((t - T.gorro1) * 30) : 0;
    gorro(g, q.x, q.y, lerp(th, angG, k) + 0.6 * Math.sin(Math.PI * k), lerp(1, 0.95, k) * (1 + 0.1 * aterriza));
  }

  /* ---------- mesita con la taza ---------- */
  function mesita(g, t, P) {
    g.save(); g.lineJoin = "round"; g.strokeStyle = "#0b0a0e";
    g.fillStyle = "#2a2a30"; g.fillRect(MESA.x - 5, MESA.y + 6, 10, SUELO - MESA.y - 12); g.lineWidth = 2.5; g.strokeRect(MESA.x - 5, MESA.y + 6, 10, SUELO - MESA.y - 12);
    g.beginPath(); g.ellipse(MESA.x, SUELO - 4, 40, 8, 0, 0, Math.PI * 2); g.fillStyle = "#1c1c22"; g.fill(); g.stroke();
    g.fillStyle = "#2e3a44"; g.beginPath(); g.ellipse(MESA.x, MESA.y + 5, 58, 12, 0, 0, Math.PI); g.lineTo(MESA.x - 58, MESA.y); g.ellipse(MESA.x, MESA.y, 58, 12, 0, Math.PI, 0, true); g.closePath(); g.fill(); g.lineWidth = 3; g.stroke();
    const tab = g.createLinearGradient(MESA.x - 58, 0, MESA.x + 58, 0); tab.addColorStop(0, "#c9c2b4"); tab.addColorStop(0.5, "#efe8da"); tab.addColorStop(1, "#b9b1a2");
    g.fillStyle = tab; g.beginPath(); g.ellipse(MESA.x, MESA.y, 58, 12, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    // azucarero
    g.save(); g.translate(MESA.x + 32, MESA.y - 2); g.fillStyle = "#e9c46a"; g.beginPath(); g.rect(-6, -16, 12, 16); g.fill(); g.lineWidth = 2; g.stroke();
    g.fillStyle = "#b9c0c8"; g.beginPath(); g.moveTo(-6, -16); g.lineTo(6, -16); g.lineTo(2, -24); g.lineTo(-2, -24); g.closePath(); g.fill(); g.stroke(); g.restore();
    const tz = tazaM(t, P);
    if (tz.en === "mesa") { const m = tz.M; g.save(); g.transform(m.a, m.b, m.c, m.d, m.e, m.f); taza(g); g.restore(); }
    g.restore();
  }

  /* ---------- vapor de la vergüenza: sale de la cabeza de Guillermo y va a las gafas de Dari ---------- */
  function vaporCabeza(g, t, pg, pd) {
    const k = fase(t, T.vapor0, T.vapor1); if (k <= 0 || k >= 1) return;
    const o = G.aPantalla(pg, G.cabeza(pg).a({ x: 560, y: 520 })), dest = AF.ap(gafasCaraD(pd), { x: 0, y: 0 });
    g.save();
    for (let i = 0; i < 12; i++) {
      const ph = (k * 2.2 + i / 12) % 1, u = salida(ph);
      const x = lerp(o.x, dest.x, u) + 10 * Math.sin(ph * 9 + i), y = lerp(o.y, dest.y, u) - 30 * Math.sin(Math.PI * u) + 6 * Math.cos(ph * 7 + i);
      g.globalAlpha = 0.6 * Math.sin(Math.PI * ph) * Math.sin(Math.PI * k); g.fillStyle = "#ffffff";
      g.beginPath(); g.arc(x, y, 5 + 9 * ph, 0, Math.PI * 2); g.fill();
    }
    // chorritos de las orejas
    g.globalAlpha = 0.8 * Math.sin(Math.PI * k); g.strokeStyle = "#ffffff"; g.lineWidth = 4; g.lineCap = "round";
    for (let i = 0; i < 2; i++) { const ph = (t * 3 + i * 0.5) % 1; g.beginPath(); g.moveTo(o.x + 4, o.y - 4 - 30 * ph); g.quadraticCurveTo(o.x + 14, o.y - 14 - 30 * ph, o.x + 8, o.y - 24 - 30 * ph); g.stroke(); }
    g.restore();
  }
  // ondas «de lupa» alrededor de Guillermo cuando lleva las gafas
  function ondas(g, t, pg, b) {
    if (b <= 0.01) return;
    const c = AF.ap(gafasCaraG(pg), { x: 0, y: 0 });
    g.save(); g.strokeStyle = "#ffffff"; g.lineWidth = 2.5;
    for (let i = 0; i < 3; i++) { const ph = (t * 0.7 + i / 3) % 1; g.globalAlpha = 0.28 * b * (1 - ph);
      g.beginPath(); g.ellipse(c.x, c.y, 30 + 160 * ph, 22 + 120 * ph, 0.1 * Math.sin(t * 2), 0, Math.PI * 2); g.stroke(); }
    g.restore();
  }

  /* ---------- cámara ---------- */
  let CAMS = null;
  function camaras() {
    if (CAMS) return;
    const cab = (t, dx, dy) => { const p = posturas(t).d, c = D.aPantalla(p, D.cabeza(p).a({ x: 860, y: 560 })); return { x: c.x + dx, y: c.y + dy }; };
    const a = cab(2.3, -10, 50), b = cab(6.5, -10, 55), c = cab(13.8, -20, 55);
    CAMS = { ancho: { k: 1, x: 512, y: 300 }, dari: { k: 1.55, x: a.x, y: a.y }, medio: { k: 1.16, x: 520, y: 290 }, dari2: { k: 1.45, x: b.x - 30, y: b.y },
      medio2: { k: 1.16, x: 505, y: 290 }, ancho2: { k: 1.0, x: 512, y: 300 }, izq: { k: 1.3, x: 362, y: 280 }, dari3: { k: 1.55, x: Math.max(c.x, 335), y: c.y } };
  }
  function camara(t) {
    camaras();
    const lista = [[1.5, 2.05, "dari"], [2.65, 3.25, "medio"], [5.55, 6.1, "dari2"], [6.75, 7.3, "medio2"], [8.35, 9.0, "ancho2"],
      [11.6, 12.3, "izq"], [13.2, 13.8, "dari3"]];
    let c = CAMS.ancho;
    for (const [t0, t1, n] of lista) { if (t <= t0) break; const k = suave(fase(t, t0, t1)); const C = CAMS[n]; c = { k: lerp(c.k, C.k, k), x: lerp(c.x, C.x, k), y: lerp(c.y, C.y, k) }; }
    return c;
  }
  const borroso = t => tramo(t, T.borra0, T.borra1) * (1 - tramo(t, T.borraFin0, T.borraFin1));

  // dibuja a Guillermo con el «aplastado» de la vuelta
  function dibG(g, pg, t, dx, dy) {
    const sq = giroG(t);
    g.save(); g.translate(pg.x + dx, dy); g.scale(Math.max(0.001, sq), 1); g.translate(-pg.x, 0);
    G.dibujar(g, pg, t); g.restore();
  }

  class GafasEmpanadas extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !D.listo()) return;
      if (!fondo) { fondo = creaFondo(); bruma = creaBruma(); }
      const P = pose(t), pg = P.g, pd = P.d;
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t), b = borroso(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k);
      if (b > 0.001) { g.rotate(0.022 * b * Math.sin(t * 2.1)); g.transform(1, 0, 0.04 * b * Math.sin(t * 1.7), 1, 0, 0); g.scale(1 + 0.02 * b * Math.sin(t * 2.6), 1 - 0.015 * b * Math.sin(t * 2.6 + 1)); }
      g.translate(-cam.x, -cam.y);
      // fondo (en franjas que ondulan cuando todo se ve borroso)
      if (b > 0.001) {
        const n = 16, h = fondo.height / n;
        for (let i = 0; i < n; i++) { const dx = b * 9 * Math.sin(i * 0.8 + t * 4.4); g.drawImage(fondo, 0, i * h, fondo.width, h + 1, -60 + dx, -70 + i * h, fondo.width, h + 1); }
        g.save(); g.globalAlpha = 0.3 * b; g.drawImage(fondo, -60 + 14 * Math.sin(t * 1.9), -70 + 6 * Math.cos(t * 2.3)); g.restore();
      } else g.drawImage(fondo, -60, -70);
      nevada(g, t);
      puerta(g, t);
      // sombras en el suelo
      g.save(); g.fillStyle = "rgba(0,0,0,0.3)";
      g.beginPath(); g.ellipse(pg.x + 4, SUELO + 1, 90 * Math.max(0.4, giroG(t)), 8, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pd.x, SUELO + 1, 88, 8, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(PX, SUELO + 1, 52, 6, 0, 0, Math.PI * 2); g.fill(); g.restore();
      // perchero y mesita (con su doble imagen si se ve borroso)
      const conGorro = t < T.gorro0;
      if (b > 0.01) { g.save(); g.globalAlpha = 0.35 * b; g.translate(12 * Math.sin(t * 2.3), 5 * Math.cos(t * 1.7)); perchero(g, t, conGorro); mesita(g, t, P); g.restore(); }
      perchero(g, t, conGorro);
      mesita(g, t, P);
      // personajes: Guillermo (con su fantasma si ve borroso), el gorro y Dari por delante
      if (b > 0.01) { g.save(); g.globalAlpha = 0.3 * b; dibG(g, pg, t, 13 * Math.sin(t * 2.7), 4 * Math.cos(t * 2.1)); g.restore(); }
      dibG(g, pg, t, 0, 0);
      // al abrazarlo, la mano de delante de Guillermo pasa por detrás del abrigo
      const tapa = tramo(t, T.anda1 - 0.1, T.choca + 0.12) * (1 - tramo(t, T.gSuelta, T.gSuelta + 0.2));
      if (tapa > 0.003) {
        const th = anguloPercha(t);
        g.save(); g.globalAlpha = tapa; g.translate(PX, SUELO); g.rotate(th); g.translate(-PX, -SUELO);
        g.beginPath(); g.rect(PX - 70, 292, 64, 110); g.clip(); g.translate(PX, SUELO); g.rotate(-th); g.translate(-PX, -SUELO);
        perchero(g, t, false); g.restore();
      }
      gorroCae(g, t, pg);
      D.dibujar(g, pd, t);
      ondas(g, t, pg, b);
      // vapor del café
      const tz = tazaM(t, P), boca = AF.ap(tz.M, { x: 0, y: -14 });
      const fuerzaVapor = tz.en === "mesa" ? (t < T.gCoge ? 0.55 : 0.3) : (0.6 + 0.6 * dentro(t, T.huele0, T.huele1, T.n2b + 0.3, T.dnQuita));
      vapor(g, t, boca, fuerzaVapor, tz.en === "d" && t < T.dnQuita ? 95 : 60);
      vaporCabeza(g, t, pg, pd);
      rafaga(g, t);
      g.restore();
      if (b > 0.01) { g.save(); g.globalAlpha = 0.55 * b; g.drawImage(bruma, 0, 0); g.restore(); }
      // frío de la calle (se va con el calor del bar)
      const frio = 1 - tramo(t, 0.4, 2.0);
      if (frio > 0.01) { g.fillStyle = `rgba(70,120,215,${0.22 * frio})`; g.fillRect(0, 0, W, H); }
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00052", nombre: "Guillermo y Dari · Las gafas empañadas", crear: () => new GafasEmpanadas() });
  window.__A2D_00052 = { pose: t => { const P = pose(t); return { g: P.g, d: P.d }; }, T, DUR, camara, niebla };
})();
