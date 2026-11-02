"use strict";
/* 00086 · Guillermo y Kiriku · El peine
 *
 * Negro → camerino elegante: papel pintado a rayas rosa, zócalo crema, suelo de espiga, un tocador con
 * espejo de bombillas, encimera de mármol (bote de gomina, perfume, brochas, toallas), un cuadro, una
 * planta y un aplique. Kiriku, con un espejito de mano, se peina su pelo perfecto con un peine negro:
 * tres pasadas, y cada una coloca un pelo rebelde (destello). Se admira (¡ting!) → Guillermo le pide
 * el peine con la palma; Kiriku suspira y se lo lanza → Guillermo se peina los pinchos hacia atrás,
 * mira a cámara muy chulo… y los pinchos vuelven a saltar uno a uno (boing, boing, boing). Kiriku se
 * ríe por lo bajo → Guillermo, picado, clava el peine en la coronilla y va a por la gomina: coge el
 * bote, moja dos dedos y ¡plas!, se la planta con la palma y se alisa el pelo: brillante y pegado,
 * con el peine encima; mira a cámara orgullosísimo → los pinchos se levantan despacio, temblando, y el
 * último lanza el peine por los aires dando vueltas… hasta clavarse en el pelo de Kiriku, que se le
 * alborota entero. Kiriku se queda helado, se mira en el espejito y se horroriza; Guillermo deja el
 * bote, se mete las manos en los bolsillos y silba mirando al techo; mira a cámara → negro.
 *
 * Sin textos. El pelo de Guillermo se dibuja en su capa de la cabeza (capaCabeza): se borran sus púas
 * del retrato repintando el fondo y se dibujan púas nuevas que van de «de pie» a «peinadas» sobre el
 * casquete (la técnica de 00074). El peine se coloca con una afín de pantalla: en el pelo (sobre la
 * curva del casquete, en coordenadas del retrato), en el puño o en el aire. Todo depende solo de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, KI = Kiriku;
  const S = 0.30, SUELO = 548, DUR = 14.6, TAU = Math.PI * 2;
  const TINTA = "#0b0a0e";
  const XG0 = 292, XK0 = 732;
  const T = { fin: 13.95 };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
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
  const rota = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const difAng = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const P2 = (x, y) => ({ x, y });

  // afines de pantalla { a, b, c, d, e, f } (como setTransform)
  const AF = (a, b, c, d, e, f) => ({ a, b, c, d, e, f });
  const mul = (A, B) => AF(A.a * B.a + A.c * B.b, A.b * B.a + A.d * B.b, A.a * B.c + A.c * B.d, A.b * B.c + A.d * B.d,
    A.a * B.e + A.c * B.f + A.e, A.b * B.e + A.d * B.f + A.f);
  const apl = (A, q) => ({ x: A.a * q.x + A.c * q.y + A.e, y: A.b * q.x + A.d * q.y + A.f });
  const Tm = (x, y) => AF(1, 0, 0, 1, x, y), Rm = r => AF(Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0), Sm = (x, y) => AF(x, 0, 0, y, 0, 0);
  const aplica = (g, A) => g.transform(A.a, A.b, A.c, A.d, A.e, A.f);
  // retrato de la cabeza → pantalla
  function afCab(R, p) {
    const H = R.cabeza(p), f = q => R.aPantalla(p, H.a(q));
    const o = f(P2(0, 0)), ex = f(P2(100, 0)), ey = f(P2(0, 100));
    return AF((ex.x - o.x) / 100, (ex.y - o.y) / 100, (ey.x - o.x) / 100, (ey.y - o.y) / 100, o.x, o.y);
  }
  const enCab = (R, p, q) => R.aPantalla(p, R.cabeza(p).a(q));

  /* ---------- manos ---------- */
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { c: punoDesde(P2(131, 652), -1.75), l: punoDesde(P2(372, 648), -1.75) };
  function bolsillo(R, p, lado) {
    if (R === G) return G.tronco(p)(lado === "cerca" ? BOLS_G.c : BOLS_G.l);
    const m = R.manoReposo(p, lado); return P2(m.x, m.y);
  }
  // objetivo: { bols } | { tr: punto del tronco } | { hoja } | { scr: () => punto de pantalla }
  function resolutor(R, p, lado) {
    return o => {
      if (o.bols) { const b = bolsillo(R, p, lado);
        return { x: b.x, y: b.y, mu: -1.75, ang: 0, puno: o.sale ? 1 : 0, dedos: o.dedos || D(0.4, 0.4, 0.4, 0.4), dobla: lado === "cerca" ? -1 : 1 }; }
      let q;
      if (o.tr) q = R.tronco(p)(o.tr);
      else if (o.hoja) q = o.hoja;
      else q = R.aHoja(p, o.scr());
      return { x: q.x, y: q.y, mu: o.mu ?? -1.75, ang: o.ang || 0, puno: o.puno ?? 1, dedos: o.dedos || D(0.35, 0.35, 0.35, 0.35), dobla: o.dobla ?? (lado === "cerca" ? -1 : 1), auto: o.auto };
    };
  }
  function pista(lista, t, resuelve) {
    let c = resuelve(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)), d = resuelve(obj);
      c = { x: lerp(c.x, d.x, k), y: lerp(c.y, d.y, k), mu: lerp(c.mu, d.mu, k), ang: lerp(c.ang, d.ang, k), puno: lerp(c.puno, d.puno, k),
        dedos: DD(c.dedos, d.dedos, k), dobla: k < 0.5 ? c.dobla : d.dobla, auto: k < 0.5 ? c.auto : d.auto };
    }
    return c;
  }
  // mu automático: el antebrazo llega por su lado natural (de la mano hacia el codo)
  // codo y estiramiento del brazo para una mano (como lo calcula el muñeco: la muñeca está a MUNECA_R·JK del centro)
  function codo(R, p, lado, m, mu) {
    const cerca = lado === "cerca", h = R.tronco(p)(cerca ? R.HOMBRO_C : R.HOMBRO);
    const L = cerca ? R.BRAZO_C_L : R.BRAZO_L;
    const pz = R.A.datos.piezas[cerca ? "brazo_cerca" : "brazo"], sj = pz.codo || L * 0.5;
    const muu = mu ?? m.mu ?? Math.atan2(h.y - m.y, h.x - m.x), rm = R.MUNECA_R * R.JK;
    const w = rota(P2(Math.cos(muu) * rm, Math.sin(muu) * rm), m.ang || 0);
    const c = Recortes.ik(h, P2(m.x + w.x, m.y + w.y), L, sj, 42, m.dobla, 1.08), dv = { x: -Math.sin(c.a1), y: Math.cos(c.a1) };
    return { e: { x: h.x + dv.x * sj * c.estira, y: h.y + dv.y * sj * c.estira }, estira: c.estira, h, L };
  }
  function mano(R, p, lado, m) {
    const o = { x: m.x, y: m.y, ang: m.ang || 0, mu: m.mu, dobla: m.dobla, puno: m.puno, dedos: m.dedos };
    if (m.auto !== undefined) {
      const h = R.tronco(p)(lado === "cerca" ? R.HOMBRO_C : R.HOMBRO);
      let mu = Math.atan2(h.y - o.y, h.x - o.x);
      for (let it = 0; it < 3; it++) { const c = codo(R, p, lado, o, mu); mu = Math.atan2(c.e.y - o.y, c.e.x - o.x); }
      o.mu = mu + m.auto;
    }
    return o;
  }

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, rub: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0, espiral: e.esp };
  }


  /* =====================================================================================
   * EL PEINE (marco propio en píxeles de pantalla: origen en el agarre, el peine hacia +x,
   * las púas hacia +y). Se coloca con una afín (en el pelo, en la mano o en el aire).
   * ===================================================================================== */
  const LP = 42;                                   // largo del peine (px)
  function dibPeine(g, brillo = 0, gel = 0) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // púas
    const x0 = 3, x1 = LP - 2, n = 17;
    g.strokeStyle = TINTA; g.lineWidth = 2.2;
    g.beginPath(); for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n), L = i % 2 ? 6.2 : 6.8; g.moveTo(x, 0.5); g.lineTo(x, L); } g.stroke();
    g.strokeStyle = "#2c2c34"; g.lineWidth = 1.05;
    g.beginPath(); for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n), L = i % 2 ? 5.6 : 6.2; g.moveTo(x, 0.8); g.lineTo(x, L); } g.stroke();
    // lomo (más ancho en el mango)
    g.fillStyle = "#1b1b20"; g.strokeStyle = TINTA; g.lineWidth = 1.3;
    g.beginPath(); g.moveTo(-7, -2.2); g.quadraticCurveTo(-8.5, 0.8, -6, 2.2); g.lineTo(x0, 1.2); g.lineTo(LP - 0.5, 1.2);
    g.quadraticCurveTo(LP + 0.8, -0.8, LP - 1, -2.6); g.lineTo(-4, -3.4); g.quadraticCurveTo(-6.5, -3.4, -7, -2.2); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "rgba(170,175,195,0.75)"; g.lineWidth = 0.9; g.beginPath(); g.moveTo(-3, -2.4); g.lineTo(LP - 3, -1.9); g.stroke();
    if (gel > 0.01) { g.globalAlpha = 0.7 * gel; g.fillStyle = "#7fd7ff"; g.beginPath(); g.ellipse(LP * 0.55, 3, 9, 2.4, 0, 0, TAU); g.fill(); g.globalAlpha = 1; }
    if (brillo > 0.01) { g.globalAlpha = brillo; g.strokeStyle = "#ffffff"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(LP * 0.3, -2.6); g.lineTo(LP * 0.62, -2.3); g.stroke(); g.globalAlpha = 1; }
    g.restore();
  }
  // afín del peine en el retrato: agarre en o, eje u (hacia delante), púas hacia v; k = px de pantalla → retrato
  const afPeineRet = (o, u, v, k) => AF(u.x * k, u.y * k, v.x * k, v.y * k, o.x, o.y);
  const AGARRE = P2(1, -1);                        // centro del puño en el marco del peine

  /* =====================================================================================
   * EL PELO DE GUILLERMO: se borran sus púas del retrato (repintando el fondo) y se dibujan
   * púas nuevas que se peinan hacia atrás, saltan, se engominan… (técnica de 00074)
   * ===================================================================================== */
  const PIEL_CAB = [[806,850],[802,846],[766,842],[754,834],[746,834],[742,838],[734,826],[726,826],[718,814],[710,814],[704,808],[708,804],[702,798],[698,802],[690,798],[684,792],[682,782],[674,782],[662,774],[656,768],[660,764],[654,758],[650,762],[634,746],[630,746],[624,740],[624,732],[604,716],[608,712],[604,708],[604,692],[596,684],[596,668],[582,670],[570,654],[566,658],[556,648],[560,640],[558,638],[554,642],[544,632],[548,624],[532,604],[532,596],[528,592],[528,572],[532,568],[528,564],[532,560],[528,552],[540,536],[540,528],[548,516],[562,503],[570,499],[590,499],[624,532],[624,540],[630,550],[636,536],[632,532],[640,524],[640,516],[648,501],[676,477],[676,469],[684,461],[680,457],[690,447],[718,435],[734,423],[744,429],[728,461],[730,467],[762,451],[798,427],[806,431],[823,431],[839,443],[843,439],[851,439],[867,455],[875,455],[881,461],[869,481],[841,509],[843,511],[879,503],[903,487],[911,487],[917,493],[901,524],[893,532],[895,534],[931,514],[947,499],[955,503],[969,520],[965,596],[949,620],[953,624],[937,644],[937,652],[925,676],[909,732],[899,738],[877,764],[885,772],[875,782],[867,778],[861,788],[849,796],[825,832],[829,836],[819,846],[815,842]];
  const camino = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
  const PELO_G = (() => {
    const CUP = [[536,610],[522,540],[524,470],[542,410],[574,360],[625,316],[694,286],[775,270],[860,272],[940,294],[1006,332],[1050,382],[1068,440],[1062,500]];
    const FLEQUILLO = [[1062,500],[1042,552],[1028,522],[1004,570],[984,526],[954,566],[934,522],[902,556],[882,515],[848,540],[826,498],[792,515],[770,478],[728,486],[690,466],[656,488],[642,530],[632,575],[618,528],[598,505],[574,502],[556,520],[546,560]];
    const FRENTE = [[640,482],[720,452],[830,452],[930,470],[985,500],[1000,570],[960,615],[640,600]];
    const CAJA = [[300,40],[1320,40],[1320,700],[300,700]];
    // púas: raíz, punta (de pie), ancho en la raíz
    const PUAS = [
      [[548, 470], [497, 343], 72], [[572, 400], [528, 312], 80], [[618, 342], [592, 250], 78],
      [[664, 308], [640, 222], 78], [[722, 290], [800, 172], 96], [[800, 276], [912, 184], 96],
      [[872, 284], [976, 206], 92], [[942, 302], [1070, 228], 90], [[1002, 336], [1122, 290], 84],
      [[1044, 384], [1128, 404], 74], [[1062, 440], [1110, 512], 64], [[1050, 500], [1082, 562], 52],
      [[1012, 540], [1022, 612], 42]
    ];
    const COL = { medio: "#8a4219", oscuro: "#3c1e0e", claro: "#c4703a", tinta: "#1e0e08" };
    const cubica = (a, b, c, d, u) => { const v = 1 - u; return { x: v*v*v*a.x + 3*v*v*u*b.x + 3*v*u*u*c.x + u*u*u*d.x, y: v*v*v*a.y + 3*v*v*u*b.y + 3*v*u*u*c.y + u*u*u*d.y }; };
    const dir = a => ({ x: Math.cos(a), y: Math.sin(a) });
    // recorrido del casquete (de atrás abajo a delante): longitudes acumuladas, para el peine y las tangentes
    const CP = CUP.map(([x, y]) => P2(x, y)), CS = [0];
    for (let i = 1; i < CP.length; i++) CS.push(CS[i - 1] + Math.hypot(CP[i].x - CP[i - 1].x, CP[i].y - CP[i - 1].y));
    const LCUP = CS[CS.length - 1];
    // punto del casquete a una distancia s desde DELANTE (s = 0 en la sien de delante), con la tangente hacia
    // atrás; más allá de la nuca sigue en línea recta
    function enCasco(s) {
      const d = LCUP - s;
      if (d < 0) { const a = CP[0], b = CP[1], l = Math.hypot(a.x - b.x, a.y - b.y), u = P2((a.x - b.x) / l, (a.y - b.y) / l); return { q: P2(a.x + u.x * -d, a.y + u.y * -d), u }; }
      const dd = Math.min(d, LCUP); let i = 1; while (i < CS.length - 1 && CS[i] < dd) i++;
      const f = (dd - CS[i - 1]) / Math.max(1e-6, CS[i] - CS[i - 1]), a = CP[i - 1], b = CP[i];
      const q = P2(lerp(a.x, b.x, f), lerp(a.y, b.y, f)), t = P2(a.x - b.x, a.y - b.y), l = Math.hypot(t.x, t.y) || 1;
      return { q, u: P2(t.x / l, t.y / l) };                // u: hacia atrás
    }
    // distancia (desde delante) de cada raíz sobre el casquete
    const DESV = [0, 0, 0, 4, 10, 18, 28, 38, 48, 58, 68, 78, 88];      // peinada: cuánto entra hacia la cara del casquete
    const INFO = PUAS.map(([r, tip], i) => {
      let best = 1e9, sBest = 0;
      for (let s = 0; s <= LCUP; s += 4) { const e = enCasco(s), d = Math.hypot(e.q.x - r[0], e.q.y - r[1]); if (d < best) { best = d; sBest = s; } }
      const L = Math.hypot(tip[0] - r[0], tip[1] - r[1]);
      return { s: sBest, Ls: L * (i < 4 ? 0.9 : 1.25), off: DESV[i] };
    });
    // línea central de la púa peinada hacia atrás (tumbada sobre el casquete)
    function plana(i, u) {
      const inf = INFO[i], r = PUAS[i][0];
      const e = enCasco(inf.s + u * inf.Ls), n = P2(e.u.y, -e.u.x);   // normal hacia dentro del casquete
      const b0 = enCasco(inf.s), q0 = P2(b0.q.x + b0.u.y * inf.off, b0.q.y - b0.u.x * inf.off);
      const k = Math.pow(1 - u, 2);
      return P2(e.q.x + n.x * inf.off + (r[0] - q0.x) * k, e.q.y + n.y * inf.off + (r[1] - q0.y) * k);
    }
    // st: { f: 0 de pie → 1 peinada hacia atrás (negativo: se pasa hacia delante), o: oscila (rad), lm: largo }
    const NP = 12;
    function linea(i, st) {
      const [r, tip] = PUAS[i];
      const Rq = P2(r[0], r[1]), a0 = Math.atan2(tip[1] - r[1], tip[0] - r[0]), L = Math.hypot(tip[0] - r[0], tip[1] - r[1]) * (st.lm || 1);
      const f = st.f;
      const S1 = P2(Rq.x + Math.cos(a0) * L * 0.36, Rq.y + Math.sin(a0) * L * 0.36);
      const S2 = P2(Rq.x + Math.cos(a0) * L * 0.7, Rq.y + Math.sin(a0) * L * 0.7);
      const S3 = P2(Rq.x + Math.cos(a0) * L, Rq.y + Math.sin(a0) * L);
      const cen0 = [];
      for (let k = 0; k <= NP; k++) {
        const u = k / NP, s = cubica(Rq, S1, S2, S3, u), pl = plana(i, u);
        let q = P2(s.x + (pl.x - s.x) * f, s.y + (pl.y - s.y) * f);
        if (st.o) { const rr = rota(P2(q.x - Rq.x, q.y - Rq.y), st.o * u); q = P2(Rq.x + rr.x, Rq.y + rr.y); }
        cen0.push(q);
      }
      return cen0;
    }
    const enLinea = (cen0, u) => { const x = clamp(u) * NP, k = Math.min(NP - 1, Math.floor(x)), f2 = x - k; return mezcla(cen0[k], cen0[k + 1], f2); };
    function pua(g, i, st, gel) {
      const ancho = PUAS[i][2], fp = clamp(st.f), N = NP;
      const cen0 = linea(i, st);
      const izq = [], der = [], cen = [];
      for (let k = 0; k <= N; k++) {
        const u = k / N, q = cen0[k], q2 = cen0[Math.min(N, k + 1)], q1 = cen0[Math.max(0, k - 1)];
        const tx = q2.x - q1.x, ty = q2.y - q1.y, tl = Math.hypot(tx, ty) || 1, nx = -ty / tl, ny = tx / tl;
        const wv = ancho * 0.5 * Math.pow(1 - u, 0.9) * (1 + 0.15 * Math.sin(u * 3.1)) * lerp(1, 0.6, fp);
        izq.push(P2(q.x + nx * wv, q.y + ny * wv)); der.push(P2(q.x - nx * wv, q.y - ny * wv)); cen.push(P2(q.x + nx * wv * 0.25, q.y + ny * wv * 0.25));
      }
      const forma = () => { g.beginPath(); g.moveTo(izq[0].x, izq[0].y); for (const q of izq) g.lineTo(q.x, q.y); for (let k = der.length - 1; k >= 0; k--) g.lineTo(der[k].x, der[k].y); g.closePath(); };
      forma(); g.fillStyle = COL.medio; g.fill();
      g.save(); forma(); g.clip();
      g.beginPath(); g.moveTo(cen[0].x, cen[0].y); for (const q of cen) g.lineTo(q.x, q.y); for (let k = der.length - 1; k >= 0; k--) g.lineTo(der[k].x, der[k].y); g.closePath();
      g.fillStyle = COL.oscuro; g.globalAlpha *= 0.85; g.fill(); g.globalAlpha /= 0.85;
      g.beginPath(); for (let k = 1; k < N * 0.7; k++) { const q = izq[k], c = cen[k]; const m = P2(lerp(q.x, c.x, 0.45), lerp(q.y, c.y, 0.45)); if (k === 1) g.moveTo(m.x, m.y); else g.lineTo(m.x, m.y); }
      g.lineWidth = 9; g.strokeStyle = COL.claro; g.globalAlpha *= 0.8; g.stroke(); g.globalAlpha /= 0.8;
      if (gel > 0.01) {                              // gomina: brillo mojado y un reflejo azulado
        g.globalAlpha *= 0.55 * gel; g.fillStyle = "#3a6f9a"; g.globalCompositeOperation = "soft-light"; forma(); g.fill();
        g.globalCompositeOperation = "source-over"; g.globalAlpha /= 0.55 * gel;
        g.beginPath(); for (let k = 1; k < N * 0.8; k++) { const q = izq[k], c = cen[k]; const m = P2(lerp(q.x, c.x, 0.3), lerp(q.y, c.y, 0.3)); if (k === 1) g.moveTo(m.x, m.y); else g.lineTo(m.x, m.y); }
        g.lineWidth = 5; g.strokeStyle = "#ffffff"; g.globalAlpha *= 0.75 * gel; g.stroke(); g.globalAlpha /= 0.75 * gel;
      }
      g.restore();
      g.beginPath(); g.moveTo(izq[0].x, izq[0].y); for (const q of izq) g.lineTo(q.x, q.y); for (let k = der.length - 1; k >= 0; k--) g.lineTo(der[k].x, der[k].y);
      g.lineWidth = 5.5; g.lineJoin = "round"; g.strokeStyle = COL.tinta; g.stroke();
      return cen0;
    }
    const ruta = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
    const casquete = CUP.concat(FLEQUILLO).map(([x, y]) => P2(x, y));
    // recorte: todo menos la cabeza (casquete y piel): lo clavado parece metido en el pelo
    function fueraCasco(g) {
      g.beginPath(); ruta(g, CAJA); M2.curva(g, casquete, true, 0.35); g.clip("evenodd");
      g.beginPath(); ruta(g, CAJA); camino(g, PIEL_CAB); g.clip("evenodd");
    }
    function zonaBorrado(g) {
      g.beginPath(); ruta(g, CAJA); M2.curva(g, casquete, true, 0.35); g.clip("evenodd");
      g.beginPath(); ruta(g, CAJA); camino(g, PIEL_CAB); g.clip("evenodd");
      g.beginPath(); ruta(g, CAJA); ruta(g, FRENTE); g.clip("evenodd");
    }
    // orden de dibujo: las de atrás primero, la de la coronilla (4) la última
    const ORDEN = [0, 1, 2, 3, 12, 11, 10, 9, 8, 7, 6, 5, 4];
    function puas(g, est, t) {
      g.save(); g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); M2.curva(g, CP, false, 0.35);
      g.lineWidth = 16; g.strokeStyle = COL.oscuro; g.stroke(); g.lineWidth = 5; g.strokeStyle = COL.tinta; g.stroke();
      if (est.antes) est.antes(g);                 // el peine clavado: entre el casquete y las púas
      const geo = [];
      for (const i of ORDEN) geo[i] = pua(g, i, est.puas[i], est.gel);
      if (est.despues) est.despues(g);              // el peine clavado en la coronilla
      // brillo de la gomina en el casquete
      const gc = est.gel * (est.gelCasco ?? 1);
      if (gc > 0.01) {
        g.save(); g.globalAlpha = 0.6 * gc; g.strokeStyle = "#ffffff"; g.lineWidth = 7;
        g.beginPath(); M2.curva(g, [P2(600, 360), P2(680, 316), P2(780, 300), P2(880, 304)], false, 0.4); g.stroke(); g.restore();
      }
      g.restore();
      return geo;
    }
    return { zonaBorrado, fueraCasco, puas, enCasco, linea, enLinea, INFO, PUAS, N: PUAS.length, LCUP, COL };
  })();


  /* =====================================================================================
   * GUION (segundos)
   * ===================================================================================== */
  Object.assign(T, {
    kp: [0.62, 1.42, 2.22],                         // pasadas de peine de Kiriku (baja 0,18 · barre 0,42 · sube 0,16)
    kBaja0: 2.86, kBaja1: 3.14, kTing: 3.02, kAdmira1: 3.5,
    gPide0: 3.36, gPide1: 3.68,
    kMiraG: 3.52, kSuspira: 3.74, kArma0: 3.94, kLanza: 4.2, gAtrapa: 4.7,
    gSube0: 4.86, gToca: 5.1, gBarre1: 5.6, gAlza1: 5.8,
    gChulo0: 5.84, gChulo1: 6.36,
    boing0: 6.44, boingPaso: 0.05,
    gCae: 6.56, gDecide: 7.2,
    kGomina0: 7.22, kGomina1: 7.58, kGomina2: 7.96,
    gPlanta0: 7.4, gPlanta1: 7.74, gSuelta: 7.8,
    gAnda0: 7.86, gAnda1: 8.3,
    gCoge0: 8.2, gAgarra: 8.4, gAlza1: 8.6, gMoja0: 8.58, gMoja1: 8.72, gSaca1: 8.86, gCarga0: 8.92,
    gPlas: 9.12, gAlisa1: 9.48,
    gOrgullo0: 9.54, gOrgullo1: 9.96,
    sube0: 10.1, sube1: 10.98,
    lanza: 11.04, cae: 11.62,
    kHelado: 11.66, kEspejo0: 11.96, kEspejo1: 12.34, kHorror: 12.38, kMano0: 12.44, kMano1: 12.78,
    gBols0: 11.76, gDeja: 11.98, gBols1: 12.12, gSilba0: 12.12, gSilba1: 13.6, gMiraK: 12.88, gMiraK1: 13.12, gCamara: 13.34,
    kCamara: 13.18
  });
  const XG1 = 366;                                  // Guillermo junto a la encimera (para la gomina)
  const BOTE = P2(448, 350);                        // bote de gomina en la encimera (base)
  const BOTE2 = P2(424, 350);                       // donde lo deja al final

  /* ---------- superficies de peinado (retrato) ---------- */
  function curvaS(pts) {
    const P = pts.map(([x, y]) => P2(x, y)), C = [0];
    for (let i = 1; i < P.length; i++) C.push(C[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
    const L = C[C.length - 1];
    return { L, en(s) {
      s = clamp(s, 0, L); let i = 1; while (i < C.length - 1 && C[i] < s) i++;
      const f = (s - C[i - 1]) / Math.max(1e-6, C[i] - C[i - 1]), a = P[i - 1], b = P[i], l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      return { q: P2(lerp(a.x, b.x, f), lerp(a.y, b.y, f)), u: P2((b.x - a.x) / l, (b.y - a.y) / l) };
    } };
  }
  // pelo de Kiriku de delante (sien) a atrás (nuca)
  const SUP_K = curvaS([[1050, 288], [1018, 226], [962, 194], [900, 180], [840, 192], [780, 204], [722, 218], [676, 248], [632, 276], [598, 316], [576, 366], [572, 420], [584, 472]]);
  // el peine sobre una superficie: frente en sF, agarre detrás (sF + largo); hunde: hacia dentro (+) o levantado (−)
  function peineEnSup(en, sF, Lc, hunde) {
    const a = en(sF), b = en(sF + Lc);
    const nA = P2(-a.u.y, a.u.x), nB = P2(-b.u.y, b.u.x);              // normal hacia dentro (la tangente va hacia atrás)
    const qF = P2(a.q.x + nA.x * hunde, a.q.y + nA.y * hunde), qG = P2(b.q.x + nB.x * hunde, b.q.y + nB.y * hunde);
    const l = Math.hypot(qF.x - qG.x, qF.y - qG.y) || 1, u = P2((qF.x - qG.x) / l, (qF.y - qG.y) / l);
    return { o: qG, u, v: P2(-u.y, u.x) };
  }
  const enCascoG = s => { const e = PELO_G.enCasco(s); return { q: e.q, u: e.u }; };
  // escala retrato ↔ píxeles de pantalla de una cabeza
  const kRet = A => 1 / Math.hypot(A.a, A.b);
  const retAPant = (A, c) => mul(A, afPeineRet(c.o, c.u, c.v, kRet(A)));

  // descomponer / mezclar afines de peine (posición, ángulo, volteo)
  const desc = A => { const sx = Math.hypot(A.a, A.b), th = Math.atan2(A.b, A.a), det = A.a * A.d - A.b * A.c; return { o: P2(A.e, A.f), th, sx, sy: det / sx }; };
  const comp = d => { const c = Math.cos(d.th), s = Math.sin(d.th); return AF(c * d.sx, s * d.sx, -s * d.sy, c * d.sy, d.o.x, d.o.y); };
  function mezclaAF(A, B, k) {
    if (k <= 0) return A; if (k >= 1) return B;
    const a = desc(A), b = desc(B);
    return comp({ o: mezcla(a.o, b.o, k), th: a.th + difAng(a.th, b.th) * k, sx: lerp(a.sx, b.sx, k), sy: lerp(a.sy, b.sy, k) });
  }
  // peine en un puño: sale por el lado del pulgar, perpendicular al antebrazo (h: mano, e: codo, en pantalla)
  function peineEnPuno(h, e, arriba = 1, giro = 0) {
    const phi = Math.atan2(e.y - h.y, e.x - h.x);
    let a = phi + Math.PI / 2; if (Math.sin(a) * arriba > 0) a = phi - Math.PI / 2;
    a += giro;
    const u = P2(Math.cos(a), Math.sin(a));
    let v = P2(-u.y, u.x); if (v.x * (h.x - e.x) + v.y * (h.y - e.y) < 0) v = P2(u.y, -u.x);
    const o = P2(h.x - u.x * AGARRE.x - v.x * AGARRE.y, h.y - u.y * AGARRE.x - v.y * AGARRE.y);
    return AF(u.x, u.y, v.x, v.y, o.x, o.y);
  }
  const agarreDe = A => apl(A, AGARRE);

  /* =====================================================================================
   * EL PELO DE GUILLERMO A LO LARGO DE LA ESCENA
   * ===================================================================================== */
  const LC_G = LP / 0.18;
  const PCLAV = 3;                                  // púa (de la coronilla, atrás) donde se clava el peine                            // largo del peine en unidades de su retrato
  const sG0 = 205, sG1 = 760;                        // la frente del peine recorre el casquete de aquí a aquí
  const sFrenteG = t => lerp(sG0, sG1, suave5(fase(t, T.gToca, T.gBarre1)));
  const ORDEN_S = PELO_G.INFO.map((o, i) => [o.s, i]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  const muelle = (u, A, B, w = 17, am = 6.5) => u <= 0 ? A : Math.exp(-am * u) * (A * Math.cos(w * u) + B * Math.sin(w * u));
  function pelosG(t) {
    const N = PELO_G.N, puas = [];
    const sF = sFrenteG(t), aterriza = tramo(t, T.gToca - 0.1, T.gToca + 0.08);
    for (let i = 0; i < N; i++) {
      const si = PELO_G.INFO[i].s, j = ORDEN_S.indexOf(i);
      let f = 0, o = 0;
      // 1) el peine las tumba hacia atrás al pasar
      if (t >= T.gToca - 0.1) f = aterriza * suave(fase(sF + 150, si - 0.75 * LC_G, si + 10));
      // 2) saltan una a una (de delante a atrás)
      const rel = T.boing0 + j * T.boingPaso;
      if (t >= rel) { const u = t - rel; f = muelle(u, 1, 0.15); o = 0.14 * Math.exp(-6 * u) * Math.sin(23 * u + j); }
      // 3) gomina: plas, alisado y a pegarse
      if (t >= T.gPlas - 0.02) f = suave(fase(t, T.gPlas - 0.02 + 0.012 * j, T.gPlas + 0.16 + 0.012 * j));
      // 4) se levantan despacio, a trompicones, temblando
      if (t >= T.sube0) {
        const k = fase(t, T.sube0 + 0.02 * j, T.sube1), esc = k + 0.07 * Math.sin(k * Math.PI * 5);
        f = 1 - 0.68 * clamp(esc) ;
        o = 0.02 * Math.sin(t * 61 + j * 2.1) * tramo(t, T.sube0, T.sube0 + 0.3);
      }
      // 5) ¡boing! la de la coronilla (con el peine) primero y las demás detrás
      const disparo = T.lanza + (i === PCLAV ? 0 : 0.035 + 0.028 * j);
      if (t >= disparo) { const u = t - disparo, fuerte = i === PCLAV ? 1 : 0.5; f = muelle(u, 0.32, -0.62 * fuerte, 18, 5.2); o = 0.18 * fuerte * Math.exp(-5 * u) * Math.sin(26 * u); }
      puas.push({ f, o });
    }
    return { wC: tramo(t, T.gSube0 + 0.08, T.gToca - 0.02), gel: tramo(t, T.gPlas, T.gPlas + 0.2), gelCasco: 1 - tramo(t, T.sube0 + 0.2, T.sube1), puas };
  }
  // peine clavado en la púa de la coronilla (retrato de Guillermo), a partir de cómo está esa púa
  function peineClavado(st) {
    const cen = PELO_G.linea(PCLAV, st), r = cen[0];
    const a = PELO_G.enLinea(cen, 0.15), b = PELO_G.enLinea(cen, 0.5), l = Math.hypot(b.x - a.x, b.y - a.y) || 1, d = P2((b.x - a.x) / l, (b.y - a.y) / l);
    const fuera = LC_G * 0.7;
    const o = P2(r.x + d.x * fuera, r.y + d.y * fuera), u = P2(-d.x, -d.y);
    return { o, u, v: P2(u.y, -u.x) };
  }

  /* =====================================================================================
   * EL PELO DE KIRIKU: pelos sueltos que el peine va colocando y, al final, el desastre
   * ===================================================================================== */
  const SUELTOS = [[[772, 212], -1.9, 64], [[872, 186], -1.45, 70], [[948, 194], -1.15, 58]];
  const finPasada = i => T.kp[i] + 0.6;
  // pelos de punta del desastre: raíz (retrato), ángulo, largo, grosor
  const DESASTRE = (() => {
    const tope = [[600, 318], [628, 282], [660, 262], [700, 232], [736, 222], [772, 212], [810, 204], [846, 198], [884, 188], [920, 188], [956, 196], [990, 214], [1018, 238], [1036, 268]];
    return tope.map(([x, y], i) => {
      const c = P2(820, 420), a = Math.atan2(y - c.y, x - c.x) + (hash(i + 7) - 0.5) * 0.9;
      return { r: P2(x + (c.x - x) * 0.05, y + (c.y - y) * 0.05), a, L: 55 + 70 * hash(i + 21), w: 12 + 8 * hash(i + 3), kink: hash(i + 40) };
    });
  })();
  const COL_K = { pelo: "#241a17", luz: "#5a463c", tinta: "#0b0a0e" };
  function mechon(g, r, a, L, w, kink, t, i, flojo = 0) {
    const n = 6, pts = [];
    for (let k = 0; k <= n; k++) {
      const u = k / n, zz = (k % 2 ? 1 : -1) * kink * 9 * u;
      const ang = a + 0.25 * Math.sin(u * 3 + i) + flojo * u * 0.6;
      const base = P2(r.x + Math.cos(ang) * L * u, r.y + Math.sin(ang) * L * u);
      pts.push(P2(base.x - Math.sin(ang) * zz, base.y + Math.cos(ang) * zz));
    }
    const izq = [], der = [];
    for (let k = 0; k <= n; k++) {
      const q = pts[k], q2 = pts[Math.min(n, k + 1)], q1 = pts[Math.max(0, k - 1)], tl = Math.hypot(q2.x - q1.x, q2.y - q1.y) || 1;
      const nx = -(q2.y - q1.y) / tl, ny = (q2.x - q1.x) / tl, ww = w * 0.5 * Math.pow(1 - k / n, 0.8);
      izq.push(P2(q.x + nx * ww, q.y + ny * ww)); der.push(P2(q.x - nx * ww, q.y - ny * ww));
    }
    g.beginPath(); g.moveTo(izq[0].x, izq[0].y); for (const q of izq) g.lineTo(q.x, q.y); for (let k = n; k >= 0; k--) g.lineTo(der[k].x, der[k].y); g.closePath();
    g.fillStyle = COL_K.pelo; g.fill(); g.lineWidth = 4; g.strokeStyle = COL_K.tinta; g.stroke();
    g.beginPath(); g.moveTo(pts[1].x, pts[1].y); for (let k = 2; k < n; k++) g.lineTo(pts[k].x, pts[k].y);
    g.lineWidth = 2.5; g.strokeStyle = COL_K.luz; g.stroke();
  }
  // peine clavado en el pelo de Kiriku (retrato)
  function peineEnK(t) {
    const u = t - T.cae, vib = u > 0 ? 0.3 * Math.exp(-6 * u) * Math.sin(27 * u) : 0;
    const b = P2(870, 206), d0 = P2(-0.42, -0.91), d = rota(d0, vib);
    const fuera = LP / 0.1854 * 0.74;
    const o = P2(b.x + d.x * fuera, b.y + d.y * fuera), uu = P2(-d.x, -d.y);
    return { o, u: uu, v: P2(uu.y, -uu.x) };
  }

  /* =====================================================================================
   * KIRIKU
   * ===================================================================================== */
  const LC_K = LP / 0.1854;
  const SK0 = 62, SK1 = 330, K_ARRIBA = -46, K_DENTRO = 13;
  function pasadaK(t) {
    let sF = SK0, hunde = K_ARRIBA;
    for (const tp of T.kp) {
      if (t < tp) break;
      const b = fase(t, tp, tp + 0.18), r = fase(t, tp + 0.18, tp + 0.6), s = fase(t, tp + 0.6, tp + 0.78);
      if (s > 0) { sF = lerp(SK1, SK0, suave(s)); hunde = lerp(K_DENTRO, K_ARRIBA, salida(s)) - 30 * Math.sin(Math.PI * s); }
      else if (r > 0) { sF = lerp(SK0, SK1, suave(r)); hunde = K_DENTRO + 2 * Math.sin(Math.PI * r); }
      else { sF = SK0; hunde = lerp(K_ARRIBA, K_DENTRO, suave(b)); }
    }
    return { sF, hunde };
  }
  const CK = {
    espejo: E({ mx: 0.92, my: -0.55, c: 0.18, sd: 10, si: 14, gi: 0.05, sonr: 0.55, ancho: 0.95 }),
    gusto: E({ mx: 0.92, my: -0.55, c: 0.55, h: 0.4, sd: 14, si: 16, sonr: 0.8, ancho: 1.0 }),
    ting: E({ mx: 0.9, my: -0.5, cd: 1, sd: 18, si: 6, sonr: 0.95, ancho: 1.05 }),
    miraG: E({ mx: 0.95, my: 0.1, c: 0.2, sd: -2, si: 20, gi: 0.12, sonr: 0.15, ancho: 0.8 }),
    suspira: E({ mx: 0.5, my: -0.3, c: 0.75, sd: 12, si: 12, abre: 4, ancho: 0.6, sonr: -0.05 }),
    lanza: E({ mx: 0.95, my: 0.05, c: 0.32, sd: 6, si: 10, sonr: 0.45, ancho: 0.9 }),
    mira: E({ mx: 0.95, my: -0.3, c: 0.15, sd: 6, si: 14, gi: 0.06, sonr: 0.3, ancho: 0.85 }),
    ceja: E({ mx: 0.95, my: -0.4, c: 0.22, sd: -6, gd: -0.1, si: 24, gi: 0.14, sonr: 0.05, ancho: 0.7 }),
    risita: E({ mx: 0.95, my: -0.2, c: 0.45, h: 0.3, sd: 8, si: 12, sonr: 0.75, ancho: 0.85, rub: 0.15 }),
    vanidad: E({ mx: 0.9, my: -0.45, c: 0.25, sd: 14, si: 16, sonr: 0.7, ancho: 0.95 }),
    senala: E({ mx: 0.95, my: 0.2, c: 0.3, sd: 4, si: 18, gi: 0.1, sonr: 0.6, ancho: 0.9 }),
    curioso: E({ mx: 0.95, my: -0.5, iris: 1.05, sd: 14, si: 18, abre: 4, ancho: 0.55, sonr: 0.05 }),
    impacto: E({ c: 1, z: 1, sd: -4, si: -4, abre: 8, ancho: 0.8, sonr: -0.3 }),
    helado: E({ mx: 0.3, my: -0.2, iris: 0.82, sd: 12, si: 14, abre: 0, ancho: 0.5, sonr: 0 }),
    horror: E({ mx: 0.92, my: -0.45, iris: 0.5, sd: 40, gd: 0.16, si: 40, gi: 0.16, abre: 66, ancho: 0.72, sonr: -0.6 }),
    camara: E({ mx: -0.45, my: -0.05, iris: 0.55, sd: 38, gd: 0.16, si: 38, gi: 0.16, abre: 58, ancho: 0.7, sonr: -0.55 })
  };
  const GUION_CK = [
    [T.kp[2] + 0.62, T.kp[2] + 0.8, "gusto"], [T.kTing - 0.05, T.kTing + 0.06, "ting"], [T.kAdmira1 - 0.1, T.kMiraG, "miraG"],
    [T.kSuspira, T.kSuspira + 0.15, "suspira"], [T.kArma0 + 0.1, T.kLanza, "lanza"], [T.gAtrapa - 0.1, T.gAtrapa + 0.1, "mira"],
    [T.gChulo0 + 0.1, T.gChulo0 + 0.3, "ceja"], [T.boing0 + 0.15, T.boing0 + 0.3, "risita"], [6.86, 7.02, "vanidad"],
    [T.kGomina0, T.kGomina0 + 0.15, "senala"], [T.gPlanta0, T.gPlanta0 + 0.2, "mira"], [T.gOrgullo0 + 0.1, T.gOrgullo0 + 0.3, "ceja"],
    [T.sube0 + 0.2, T.sube0 + 0.45, "curioso"], [T.cae - 0.02, T.cae + 0.03, "impacto"], [T.kHelado + 0.05, T.kHelado + 0.2, "helado"],
    [T.kHorror - 0.04, T.kHorror + 0.06, "horror"], [T.kCamara, T.kCamara + 0.2, "camara"]
  ];
  const PARP_K = [3.3, 4.55, 6.1, 8.4, 9.3, 10.9, 12.1];
  const P0K = { torso: 0, cab: 0.02, cdx: 0, cdy: 0, pel: 0 };
  const CuK = o => Object.assign({}, P0K, o);
  const CUER_K = {
    peina: CuK({ torso: -0.04, cab: -0.26, cdy: 8 }),
    admira: CuK({ torso: -0.03, cab: -0.16, cdy: 4 }),
    quieto: CuK({ torso: 0.0, cab: 0.04 }),
    lanza: CuK({ torso: 0.06, cab: 0.06 }),
    mira: CuK({ torso: 0.0, cab: -0.06 }),
    vanidad: CuK({ torso: -0.02, cab: -0.14 }),
    senala: CuK({ torso: 0.06, cab: 0.1 }),
    curioso: CuK({ torso: 0.03, cab: -0.12 }),
    helado: CuK({ torso: -0.02, cab: 0.05 }),
    horror: CuK({ torso: -0.07, cab: -0.16, cdy: -4 }),
    camara: CuK({ torso: -0.04, cab: -0.04, cdy: -2 })
  };
  const GUION_K = [
    [T.kp[2] + 0.66, T.kBaja1, "admira"], [T.kAdmira1, T.kMiraG + 0.2, "quieto"], [T.kArma0, T.kLanza, "lanza"],
    [T.kLanza + 0.1, T.kLanza + 0.4, "mira"], [6.8, 7.0, "vanidad"], [7.1, 7.22, "mira"], [T.kGomina0, T.kGomina1, "senala"],
    [T.kGomina2, T.kGomina2 + 0.3, "mira"], [T.sube0 + 0.15, T.sube0 + 0.6, "curioso"], [T.kHelado, T.kHelado + 0.2, "helado"],
    [T.kEspejo0, T.kHorror, "horror"], [T.kCamara, T.kCamara + 0.3, "camara"]
  ];
  const TOB_K = KI.SUELO - KI.TOBILLO_ALTO;
  const pieK = (p, x) => KI.PELVIS.x - (x - p.x) / (S * KI.K);
  // espejo de mano: delante de la cara
  const ESPEJO_ARRIBA = P2(1250, 300), ESPEJO_CARA = P2(1260, 380);
  // espejo de mano: el mango sigue al antebrazo (h: mano, e: codo, pantalla)
  function espejoEnPuno(h, e, giro = 0) {
    const a = Math.atan2(h.y - e.y, h.x - e.x) + giro, u = P2(Math.cos(a), Math.sin(a)), v = P2(-u.y, u.x);
    return AF(u.x, u.y, v.x, v.y, h.x, h.y);
  }
  function poseK(t) {
    const b = linea(GUION_K, CUER_K, "peina", t);
    const respira = Math.sin(t * 1.9 + 1.4);
    const p = { x: XK0, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: KI.PELVIS.x, y: KI.PELVIS.y + b.pel + respira * 1.1 }, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: b.cdx, dy: b.cdy, esc: { x: 1, y: 1 } } };
    // la cabeza acompaña cada pasada; al recibir el peine, cabezazo
    for (const tp of T.kp) p.cabeza.ang -= 0.04 * campana(t, tp + 0.15, tp + 0.65);
    if (t > T.cae) { const u = t - T.cae; p.cabeza.ang += 0.2 * Math.exp(-6 * u) * Math.sin(18 * u + 0.4); p.torso += 0.04 * Math.exp(-6 * u) * Math.sin(18 * u); }
    p.cabeza.ang += 0.012 * Math.sin(t * 13) * tramo(t, T.kHorror, T.kHorror + 0.1);   // tiembla de horror
    p.piernas.cerca = { tob: P2(pieK(p, XK0 + 34), TOB_K), ang: 0 };
    p.piernas.lejos = { tob: P2(pieK(p, XK0 - 40), TOB_K - 8), ang: 0 };
    const e = linea(GUION_CK, CK, "espejo", t);
    p.cara = cara(e, parpadeo(t, PARP_K));
    p.sudor = 0.7 * tramo(t, T.kHorror, T.kHorror + 0.3);
    // ---- manos ----
    const res = resolutor(KI, p, "cerca"), resL = resolutor(KI, p, "lejos");
    const AK = afCab(KI, p);
    const pz = pasadaK(t), cPel = peineEnSup(SUP_K.en, pz.sF, LC_K, pz.hunde), APel = retAPant(AK, cPel);
    const enPelo = 1 - tramo(t, T.kBaja0, T.kBaja0 + 0.2);
    const bajoDisco = q => () => { const c = enCab(KI, p, q); return P2(c.x + 6, c.y + 31); };
    const espejoA = bajoDisco(ESPEJO_ARRIBA), espejoC = bajoDisco(ESPEJO_CARA);
    const PUNO = D(0.45, 0.32, 0.3, 0.3), ESP = D(0.5, 0.36, 0.34, 0.32);
    const PISTA_KC = [
      [0, 0, { scr: () => agarreDe(APel), auto: 0, dedos: PUNO, dobla: 1 }],
      [T.kBaja0, T.kBaja1, { tr: P2(120, 600), auto: 0, dedos: PUNO, dobla: 1 }],
      [T.kBaja1, T.kBaja1 + 0.02, { tr: P2(120, 600), auto: 0, dedos: PUNO, dobla: -1 }],
      [T.kArma0, T.kArma0 + 0.16, { tr: P2(20, 640), auto: 0, dedos: PUNO, dobla: -1 }],
      [T.kArma0 + 0.16, T.kLanza, { tr: P2(330, 470), auto: 0, dedos: PUNO, dobla: -1 }, salida],
      [T.kLanza, T.kLanza + 0.1, { tr: P2(350, 455), auto: 0, dedos: D(0.9, 1, 1, 1), dobla: -1 }],
      [T.kLanza + 0.25, T.kLanza + 0.6, { bols: true }],
      [T.kMano0 - 0.2, T.kMano0 - 0.08, { tr: P2(80, 430), auto: 0, dedos: D(0.7, 0.8, 0.8, 0.8), dobla: -1 }],
      [T.kMano0 - 0.08, T.kMano0 - 0.06, { tr: P2(80, 430), auto: 0, dedos: D(0.7, 0.8, 0.8, 0.8), dobla: 1 }],
      [T.kMano0 - 0.06, T.kMano1, { scr: () => enCab(KI, p, P2(650, 318)), auto: 0.25, dedos: D(0.6, 0.5, 0.5, 0.5), dobla: 1 }, salida]
    ];
    const PISTA_KL = [
      [0, 0, { scr: espejoA, auto: 0, dedos: ESP, dobla: -1 }],
      [T.kAdmira1, T.kAdmira1 + 0.32, { tr: P2(418, 655), auto: 0, dedos: ESP, dobla: -1 }],
      [6.78, 6.98, { scr: espejoC, auto: 0, dedos: ESP, dobla: -1 }],
      [7.04, 7.2, { tr: P2(418, 655), auto: 0, dedos: ESP, dobla: -1 }],
      [T.kGomina0, T.kGomina1, { tr: P2(520, 560), auto: 0, dedos: ESP, dobla: -1 }, salida],
      [T.kGomina2, T.kGomina2 + 0.3, { tr: P2(418, 655), auto: 0, dedos: ESP, dobla: -1 }],
      [T.kEspejo0, T.kEspejo1, { scr: espejoC, auto: 0, dedos: ESP, dobla: -1 }, salida]
    ];
    const C = pista(PISTA_KC, t, res), L = pista(PISTA_KL, t, resL);
    // señala con el espejo: dos meneítos
    const sen = campana(t, T.kGomina1 - 0.05, T.kGomina2);
    L.x += sen * 14 * Math.sin((t - T.kGomina1) * 22);
    // mano en el pelo: lo palpa
    C.y += 8 * campana(t, T.kMano1, T.kMano1 + 1.2) * Math.sin((t - T.kMano1) * 14);
    p.manoCerca = mano(KI, p, "cerca", C); p.manoLejos = mano(KI, p, "lejos", L);
    // ---- peine (en su mano mientras lo tiene) y espejo de mano ----
    if (t < T.kLanza) {
      const h = KI.aPantalla(p, p.manoCerca), el = KI.aPantalla(p, codo(KI, p, "cerca", p.manoCerca).e);
      const Ahand = peineEnPuno(h, el, 1);
      p.peineAF = mezclaAF(Ahand, APel, enPelo);
      p.manoCerca.objeto = objPeine(() => p.peineAF);
    }
    {
      const h = KI.aPantalla(p, p.manoLejos), el = KI.aPantalla(p, codo(KI, p, "lejos", p.manoLejos).e);
      p.espejoAF = espejoEnPuno(h, el, -0.25);
      p.manoLejos.objeto = objEspejo(() => p.espejoAF);
    }
    p.capaCabeza = (g, tt) => capaK(g, tt, p, AK);
    return p;
  }

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  const CG = {
    mira: E({ mx: 0.88, my: -0.1, sonr: 0.25, ancho: 0.9 }),
    asombro: E({ mx: 0.92, my: -0.35, iris: 1.05, sd: 18, si: 20, abre: 8, ancho: 0.55, sonr: 0.15 }),
    pide: E({ mx: 0.95, my: -0.1, iris: 1.18, sd: 22, gd: -0.16, si: 22, gi: -0.16, abre: 0, ancho: 0.55, sonr: 0.25 }),
    atrapa: E({ mx: 0.7, my: -0.4, iris: 1.05, sd: 16, si: 16, abre: 12, ancho: 0.6, sonr: 0.3 }),
    peina: E({ mx: 0.4, my: -1, c: 0.25, sd: 10, si: 12, sonr: 0.45, ancho: 0.9 }),
    chulo: E({ mx: -0.5, my: 0.05, c: 0.2, sd: 16, si: 4, gi: -0.1, sonr: 0.9, ancho: 1.02 }),
    cae: E({ mx: 0.15, my: -1, iris: 0.82, sd: 24, si: 24, abre: 4, ancho: 0.45, sonr: -0.3 }),
    decidido: E({ mx: 0.92, my: -0.05, sd: -8, gd: -0.14, si: -6, gi: -0.12, sonr: 0.15, ancho: 0.8 }),
    planta: E({ mx: 0.3, my: -1, c: 0.2, sd: 8, si: 10, sonr: 0.4, ancho: 0.8 }),
    coge: E({ mx: 0.8, my: 0.7, c: 0.15, sd: 6, si: 8, sonr: 0.55, ancho: 0.9 }),
    frota: E({ mx: 0.7, my: 0.4, c: 0.45, h: 0.6, sd: 14, si: 14, sonr: 0.85, ancho: 1.0, abre: 6 }),
    plas: E({ c: 1, z: 0.9, sd: -2, si: -2, abre: 10, ancho: 0.8, sonr: 0.15 }),
    orgullo: E({ mx: -0.5, my: 0.0, c: 0.32, sd: 18, si: 6, gi: -0.08, sonr: 0.95, ancho: 1.05 }),
    tension: E({ mx: 0.2, my: -1, iris: 0.86, sd: 14, si: 16, abre: 0, sonr: 0.5, ancho: 0.95 }),
    susto: E({ mx: 0.3, my: -1, iris: 0.6, sd: 32, si: 32, abre: 24, ancho: 0.55, sonr: -0.2 }),
    sigue: E({ mx: 0.95, my: -0.2, iris: 0.7, sd: 28, si: 28, abre: 16, ancho: 0.5, sonr: -0.15 }),
    silba: E({ mx: 0.5, my: -0.95, c: 0.15, sd: 16, si: 18, abre: 3, ancho: 0.3, sonr: -0.05 }),
    miraK: E({ mx: 0.97, my: 0.05, c: 0.2, sd: 10, si: 14, abre: 3, ancho: 0.3, sonr: -0.05 }),
    camara: E({ mx: -0.5, my: 0.05, sd: 14, si: 8, gi: -0.08, abre: 2, ancho: 0.85, sonr: 0.65, rub: 0.45 })
  };
  const GUION_CG = [
    [1.0, 1.2, "asombro"], [2.4, 2.6, "mira"], [T.gPide0, T.gPide0 + 0.2, "pide"], [T.kLanza - 0.05, T.kLanza + 0.1, "atrapa"],
    [T.gSube0, T.gToca, "peina"], [T.gAlza1 - 0.06, T.gChulo0 + 0.08, "chulo"], [T.gCae, T.gCae + 0.12, "cae"],
    [T.gDecide, T.gDecide + 0.14, "decidido"], [T.gPlanta0, T.gPlanta0 + 0.15, "planta"], [T.gAnda0 + 0.1, T.gAnda0 + 0.3, "decidido"],
    [T.gCoge0, T.gCoge0 + 0.15, "coge"], [T.gMoja0, T.gMoja0 + 0.1, "frota"], [T.gPlas - 0.04, T.gPlas + 0.02, "plas"],
    [T.gAlisa1 - 0.06, T.gOrgullo0 + 0.08, "orgullo"], [T.sube0 + 0.25, T.sube0 + 0.5, "tension"], [T.lanza - 0.02, T.lanza + 0.04, "susto"],
    [T.lanza + 0.2, T.lanza + 0.35, "sigue"], [T.gBols0 + 0.1, T.gSilba0 + 0.1, "silba"], [T.gMiraK, T.gMiraK + 0.1, "miraK"],
    [T.gMiraK1, T.gMiraK1 + 0.12, "silba"], [T.gCamara, T.gCamara + 0.18, "camara"]
  ];
  const PARP_G = [0.5, 2.0, 3.9, 6.3, 8.1, 10.5, 11.5, 13.0];
  const P0G = { torso: 0.02, cab: 0.03, cdx: 0, cdy: 0 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    quieto: CuG({}),
    asombro: CuG({ torso: 0.0, cab: -0.04 }),
    pide: CuG({ torso: 0.07, cab: 0.1 }),
    atrapa: CuG({ torso: 0.02, cab: -0.08 }),
    peina: CuG({ torso: -0.06, cab: -0.48, cdy: 32 }),
    chulo: CuG({ torso: -0.05, cab: -0.08 }),
    cae: CuG({ torso: 0.0, cab: -0.18 }),
    decidido: CuG({ torso: 0.03, cab: 0.04 }),
    planta: CuG({ torso: -0.06, cab: -0.5, cdy: 36 }),
    anda: CuG({ torso: 0.06, cab: 0.04 }),
    coge: CuG({ torso: 0.2, cab: 0.16 }),
    frota: CuG({ torso: 0.04, cab: 0.06 }),
    plas: CuG({ torso: 0.12, cab: 0.55, cdy: 18 }),
    orgullo: CuG({ torso: -0.06, cab: -0.12 }),
    tension: CuG({ torso: -0.02, cab: -0.1 }),
    susto: CuG({ torso: -0.08, cab: -0.16 }),
    sigue: CuG({ torso: 0.04, cab: 0.02 }),
    silba: CuG({ torso: 0.0, cab: -0.12 }),
    miraK: CuG({ torso: 0.02, cab: 0.04 }),
    camara: CuG({ torso: 0.0, cab: -0.02 })
  };
  const GUION_G = [
    [1.0, 1.25, "asombro"], [2.4, 2.7, "quieto"], [T.gPide0, T.gPide1, "pide"], [T.kLanza, T.gAtrapa, "atrapa"],
    [T.gSube0, T.gToca, "peina"], [T.gBarre1, T.gChulo0 + 0.1, "chulo"], [T.gCae, T.gCae + 0.25, "cae"], [T.gDecide, T.gDecide + 0.18, "decidido"],
    [T.gPlanta0, T.gPlanta0 + 0.2, "planta"], [T.gSuelta, T.gAnda0 + 0.1, "anda"], [T.gCoge0, T.gAgarra, "coge"],
    [T.gMoja0, T.gMoja0 + 0.15, "frota"], [T.gPlas - 0.1, T.gPlas, "plas", entrada], [T.gAlisa1, T.gOrgullo0 + 0.2, "orgullo"],
    [T.sube0 + 0.2, T.sube0 + 0.5, "tension"], [T.lanza - 0.02, T.lanza + 0.06, "susto", salida], [T.lanza + 0.25, T.lanza + 0.5, "sigue"],
    [T.gBols0, T.gSilba0, "silba"], [T.gMiraK, T.gMiraK + 0.12, "miraK"], [T.gMiraK1, T.gMiraK1 + 0.14, "silba"], [T.gCamara, T.gCamara + 0.2, "camara"]
  ];
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  // pies: [t0, t1, x de pantalla, alza]
  function pie(lista, t) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x, alza = 22] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    return { x: lerp(xa, x, suave5(u)), alza: alza * Math.sin(Math.PI * u), u };
  }
  const PASOS_G = {
    cerca: [[-9, -8, XG0 - 34], [T.gAnda0 + 0.2, T.gAnda1, XG1 - 30, 20]],
    lejos: [[-9, -8, XG0 + 42], [T.gAnda0, T.gAnda0 + 0.22, XG1 + 44, 22]]
  };
  const BOTE_C = P2(BOTE.x, BOTE.y - 10.5), BOTE_MANO = P2(11, 1);       // centro del bote y dónde lo agarra el puño
  function poseG(t) {
    const b = linea(GUION_G, CUER_G, "quieto", t);
    const respira = Math.sin(t * 2.2);
    const fc = pie(PASOS_G.cerca, t), fl = pie(PASOS_G.lejos, t);
    const xW = (fc.x + fl.x) / 2 - 4;
    // se balancea de puntillas a talones mientras silba
    const silba = tramo(t, T.gSilba0, T.gSilba0 + 0.3) * (1 - tramo(t, T.gCamara, T.gCamara + 0.3));
    const balanceo = silba * Math.sin((t - T.gSilba0) * 5.2);
    const p = { x: xW, suelo: SUELO, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + respira * 1.3 - 0.22 * Math.max(fc.alza, fl.alza) / S - 10 * Math.max(0, balanceo) },
      torso: b.torso + 0.02 * balanceo, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: b.cdx, dy: b.cdy, esc: { x: 1, y: 1 } } };
    // al tumbarse el pelo con el peine: la cabeza acompaña la pasada
    p.cabeza.ang += 0.05 * campana(t, T.gToca, T.gBarre1);
    // cejas que bailan (chulo y orgullo)
    const cejas = campana(t, T.gChulo0 + 0.1, T.gChulo1) + campana(t, T.gOrgullo0 + 0.15, T.gOrgullo1);
    // plas: rebote de la cabeza
    if (t > T.gPlas) { const u = t - T.gPlas; p.cabeza.dy += 8 * Math.exp(-9 * u) * Math.sin(20 * u); }
    // tensión: tiembla un poco
    p.cabeza.ang += 0.01 * Math.sin(t * 47) * campana(t, T.sube0 + 0.3, T.lanza + 0.1);
    // piernas
    const pieG = (f, lado) => ({ tob: P2(G.PELVIS.x + (f.x - xW) / S, TOB_G - (lado === "lejos" ? 10 : 0) - f.alza / S), ang: -0.2 * Math.sin(Math.PI * f.u) * (f.alza > 0.5 ? 1 : 0) });
    p.piernas.cerca = pieG(fc, "cerca"); p.piernas.lejos = pieG(fl, "lejos");
    p.piernas.cerca.ang += 0.18 * Math.max(0, balanceo); p.piernas.lejos.ang += 0.18 * Math.max(0, balanceo);
    const e = linea(GUION_CG, CG, "mira", t);
    e.sd += 10 * Math.max(0, Math.sin(t * 16)) * cejas; e.si += 10 * Math.max(0, Math.sin(t * 16)) * cejas;
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.sudor = 0.8 * campana(t, T.sube0 + 0.3, T.lanza + 0.8);
    p.enfado = 0.8 * campana(t, T.gDecide, T.gPlanta0 + 0.1);
    // ---- pelo (capa de la cabeza) ----
    const est = pelosG(t);
    est.cla = t >= T.gSuelta && t < T.lanza;     // peine clavado en la coronilla
    // ---- manos ----
    const res = resolutor(G, p, "cerca"), resL = resolutor(G, p, "lejos");
    const AG = afCab(G, p);
    const hundeG = lerp(-60, -8, tramo(t, T.gSube0 + 0.06, T.gToca)) - 70 * tramo(t, T.gBarre1, T.gAlza1);
    const APel = retAPant(AG, peineEnSup(enCascoG, sFrenteG(t), LC_G, hundeG));
    const AClav = retAPant(AG, peineClavado(est.puas[PCLAV]));
    const enPelo = tramo(t, T.gToca - 0.1, T.gToca) * (1 - tramo(t, T.gBarre1 + 0.06, T.gAlza1 + 0.04));
    const clavando = tramo(t, T.gPlanta0, T.gPlanta1);
    const ABRE = D(1, 1, 1, 1), PUNO = D(0.45, 0.32, 0.3, 0.3), FLOJA = D(0.6, 0.65, 0.6, 0.55), DOS = D5(0.25, 1, 1, 0.05, 0.05);
    const cabG = q => () => enCab(G, p, q);
    const PISTA_GC = [
      [0, 0, { bols: true }],
      [T.gPide0, T.gPide0 + 0.1, { bols: true, sale: true, dedos: ABRE }],
      // pide el peine: la palma hacia arriba, tendida hacia Kiriku (y la mueve: «venga, déjamelo»)
      [T.gPide0 + 0.1, T.gPide1, { tr: P2(345, 525), auto: 0.75, dedos: ABRE, dobla: -1 }],
      [T.gAtrapa - 0.12, T.gAtrapa, { tr: P2(338, 515), auto: 0.5, dedos: D(0.8, 0.85, 0.85, 0.85), dobla: -1 }],
      [T.gAtrapa, T.gAtrapa + 0.05, { tr: P2(336, 522), auto: 0, dedos: PUNO, dobla: -1 }],
      // lo lleva por el costado (brazo estirado: ahí cambia el codo) y sube a la nuca
      [T.gAtrapa + 0.05, T.gSube0 - 0.02, { tr: P2(10, 600), auto: 0, dedos: PUNO, dobla: -1 }],
      [T.gSube0 - 0.02, T.gSube0, { tr: P2(10, 600), auto: 0, dedos: PUNO, dobla: 1 }],
      [T.gSube0, T.gSube0 + 0.13, { scr: cabG(P2(440, 300)), auto: 0, dedos: PUNO, dobla: 1 }],
      [T.gSube0 + 0.13, T.gToca, { scr: () => agarreDe(APel), auto: 0, dedos: PUNO, dobla: 1 }],
      [T.gBarre1 + 0.04, T.gAlza1 + 0.06, { scr: cabG(P2(470, 470)), auto: 0, dedos: PUNO, dobla: 1 }, salida],
      [T.boing0 + 0.2, T.boing0 + 0.6, { scr: cabG(P2(430, 640)), auto: 0, dedos: PUNO, dobla: 1 }],
      [T.gPlanta0, T.gPlanta1, { scr: () => apl(AClav, P2(LP * 0.46, -1)), auto: 0, dedos: PUNO, dobla: 1 }],
      [T.gSuelta, T.gSuelta + 0.16, { scr: cabG(P2(480, 500)), auto: 0, dedos: ABRE, dobla: 1 }, salida],
      [T.gSuelta + 0.16, T.gAnda0 + 0.24, { tr: P2(30, 690), auto: 0, dedos: FLOJA, dobla: 1 }],
      [T.gAnda0 + 0.24, T.gAnda0 + 0.26, { tr: P2(30, 690), auto: 0, dedos: FLOJA, dobla: -1 }],
      [T.gAnda0 + 0.26, T.gMoja0 - 0.12, { tr: P2(120, 640), auto: 0, dedos: FLOJA, dobla: -1 }],
      // moja dos dedos en el bote que sostiene la otra mano y saca un pegote
      [T.gMoja0 - 0.12, T.gMoja0 + 0.06, { scr: () => P2(bocaBote.x - 4, bocaBote.y - 2), auto: 0.2, dedos: DOS, dobla: -1 }],
      [T.gMoja1, T.gSaca1, { scr: () => P2(bocaBote.x - 20, bocaBote.y - 38), auto: 0.2, dedos: DOS, dobla: -1 }, salida],
      // carga: la mano sube atrás con el brazo estirado (ahí cambia el codo) y ¡plas!
      [T.gCarga0, T.gPlas - 0.05, { tr: P2(-90, 220), auto: 0.2, dedos: ABRE, dobla: -1 }, salida],
      [T.gPlas - 0.05, T.gPlas - 0.04, { tr: P2(-90, 220), auto: 0.2, dedos: ABRE, dobla: 1 }],
      [T.gPlas - 0.04, T.gPlas, { scr: cabG(P2(600, 390)), auto: 0.2, dedos: ABRE, dobla: 1 }, entrada],
      [T.gPlas + 0.02, T.gAlisa1, { scr: cabG(P2(548, 560)), auto: 0.2, dedos: ABRE, dobla: 1 }],
      [T.gOrgullo0, T.gOrgullo0 + 0.2, { scr: cabG(P2(470, 520)), auto: 0.5, dedos: ABRE, dobla: 1 }, salida],
      [T.sube0 + 0.3, T.sube0 + 0.8, { scr: cabG(P2(440, 620)), auto: 0.4, dedos: FLOJA, dobla: 1 }],
      [T.gBols0 - 0.22, T.gBols0, { tr: P2(30, 690), auto: 0, dedos: FLOJA, dobla: 1 }],
      [T.gBols0, T.gBols0 + 0.02, { tr: P2(30, 690), auto: 0, dedos: FLOJA, dobla: -1 }],
      [T.gBols0 + 0.02, T.gBols1, { bols: true }]
    ];
    const AGARRA = D(0.5, 0.34, 0.32, 0.3);
    const PISTA_GL = [
      [0, 0, { bols: true }],
      [T.gCoge0 - 0.12, T.gCoge0, { bols: true, sale: true, dedos: D(0.9, 0.8, 0.8, 0.8) }],
      [T.gCoge0, T.gAgarra - 0.03, { scr: () => P2(BOTE_C.x + BOTE_MANO.x, BOTE_C.y + BOTE_MANO.y), auto: 0, dedos: D(0.9, 0.75, 0.75, 0.75), dobla: 1 }],
      [T.gAgarra - 0.03, T.gAgarra, { scr: () => P2(BOTE_C.x + BOTE_MANO.x, BOTE_C.y + BOTE_MANO.y), auto: 0, dedos: AGARRA, dobla: 1 }],
      [T.gAgarra + 0.02, T.gAlza1, { tr: P2(410, 470), auto: 0, dedos: AGARRA, dobla: 1 }],
      [T.gOrgullo0 + 0.05, T.gOrgullo0 + 0.32, { tr: P2(470, 410), auto: 0, dedos: AGARRA, dobla: 1 }, salida],
      [T.sube0 + 0.3, T.sube0 + 0.8, { tr: P2(410, 520), auto: 0, dedos: AGARRA, dobla: 1 }],
      [T.gBols0 - 0.1, T.gDeja, { scr: () => P2(BOTE2.x + BOTE_MANO.x, BOTE_C.y + BOTE_MANO.y), auto: 0, dedos: AGARRA, dobla: 1 }],
      [T.gDeja, T.gDeja + 0.05, { scr: () => P2(BOTE2.x + BOTE_MANO.x, BOTE_C.y + BOTE_MANO.y - 3), auto: 0, dedos: D(0.9, 0.8, 0.8, 0.8), dobla: 1 }],
      [T.gDeja + 0.06, T.gBols1 + 0.1, { bols: true }]
    ];
    const L = pista(PISTA_GL, t, resL);
    p.manoLejos = mano(G, p, "lejos", L);
    const conBote = t >= T.gAgarra && t < T.gDeja + 0.02;
    const boteC = conBote ? (() => { const h = G.aPantalla(p, p.manoLejos); return P2(h.x - BOTE_MANO.x, h.y - BOTE_MANO.y); })() : BOTE_C;
    const bocaBote = P2(boteC.x, boteC.y - 10);
    const PISTA_GC2 = PISTA_GC.map(x => x);
    const C = pista(PISTA_GC2, t, res);
    const ven = campana(t, T.gPide0 + 0.2, T.kLanza - 0.1);
    C.y -= ven * 16 * Math.max(0, Math.sin((t - T.gPide0) * 14));
    // alisa: dos palmadas más hacia atrás
    const al = campana(t, T.gPlas + 0.04, T.gAlisa1);
    C.y -= al * 18 * Math.max(0, Math.sin((t - T.gPlas) * 17));
    p.manoCerca = mano(G, p, "cerca", C);
    if (conBote) { const mL = p.manoLejos; mL.objeto = objBote(() => boteC, () => tramo(t, T.gMoja0 + 0.04, T.gMoja1)); }
    // ---- el peine en la mano ----
    if (t >= T.gAtrapa && t < T.gSuelta) {
      const h = G.aPantalla(p, p.manoCerca), el = G.aPantalla(p, codo(G, p, "cerca", p.manoCerca).e);
      const corre = LP * 0.46 * clavando;                 // al clavarlo lo coge por el medio
      let A = peineEnPuno(h, el, 1);
      if (corre > 0) { const d = desc(A), c = Math.cos(d.th), sn = Math.sin(d.th); A = comp({ o: P2(d.o.x - c * corre, d.o.y - sn * corre), th: d.th, sx: d.sx, sy: d.sy }); }
      A = mezclaAF(A, APel, enPelo);
      A = mezclaAF(A, AClav, clavando);
      p.peineAF = A;
      p.manoCerca.objeto = objPeine(() => p.peineAF);
    }
    if (est.cla) { const pc = peineClavado(est.puas[PCLAV]), kk = kRet(AG), mete = tramo(t, T.gSuelta, T.gSuelta + 0.12);
      est.despues = g => { g.save(); PELO_G.fueraCasco(g); aplica(g, afPeineRet(pc.o, pc.u, pc.v, kk)); dibPeine(g, 0, est.gel); tupe(g, mete, est.gel); g.restore(); }; }
    p.AClav = AClav;
    // pegote de gomina en los dedos (hasta el plas)
    const blob = tramo(t, T.gMoja1 - 0.04, T.gMoja1 + 0.06) * (1 - tramo(t, T.gPlas - 0.01, T.gPlas + 0.03));
    if (blob > 0.01) { const mC = p.manoCerca, prev = mC.objeto; mC.objeto = g => { if (prev) prev(g); objGomina(blob, () => mC.mu)(g); }; }
    p.est = est;
    p.capaCabeza = (g, tt) => capaG(g, tt, est);
    return p;
  }
  function capaG(g, t, est) {
    if (est.wC > 0.002 && MATRIZ && fondo) {
      g.save(); g.globalAlpha = est.wC;
      g.save(); PELO_G.zonaBorrado(g); g.setTransform(MATRIZ); g.drawImage(fondo, -60, -60); g.restore();
      PELO_G.puas(g, est, t);
      g.restore();
    }
  }

  /* ---------- objetos en las manos (se dibujan en pantalla con su afín) ---------- */
  const objPeine = af => g => { if (!MATRIZ) return; g.save(); g.setTransform(MATRIZ); aplica(g, af()); dibPeine(g); g.restore(); };
  const objEspejo = af => g => { if (!MATRIZ) return; g.save(); g.setTransform(MATRIZ); aplica(g, af()); dibEspejo(g); g.restore(); };
  // pegote de gomina en la yema de los dedos (unidades de la mano)
  const objGomina = (k, mu) => g => {
    const q = rota(P2(3, 21), mu() + Math.PI / 2);
    g.save(); g.translate(q.x, q.y); g.lineWidth = 0.6;
    g.globalAlpha = clamp(k * 1.5); g.fillStyle = "#53c4f2"; g.strokeStyle = "#13506e";
    g.beginPath(); g.ellipse(0, 0, 7 * k, 5.4 * k, 0.4, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.85)"; g.beginPath(); g.ellipse(-2, -1.8, 2 * k, 1.2 * k, 0.4, 0, TAU); g.fill();
    g.restore();
  };
  // pinchos que tapan la raíz del peine clavado (marco del peine)
  function tupe(g, k, gel) {
    if (k <= 0.01) return;
    g.save(); g.globalAlpha *= k; g.lineJoin = "round";
    for (let i = 0; i < 4; i++) {
      const y = -4 + i * 3.6, x = LP - 3 + (i % 2) * 2, L = 9 + 3 * (i % 2);
      g.beginPath(); g.moveTo(x + 3, y - 2.6); g.lineTo(x - L, y + 0.6); g.lineTo(x + 3, y + 3); g.closePath();
      g.fillStyle = i % 2 ? PELO_G.COL.medio : PELO_G.COL.oscuro; g.fill(); g.strokeStyle = PELO_G.COL.tinta; g.lineWidth = 1; g.stroke();
      if (gel > 0.01) { g.strokeStyle = `rgba(255,255,255,${0.6 * gel})`; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x, y); g.lineTo(x - L * 0.6, y + 0.6); g.stroke(); }
    }
    g.restore();
  }
  const objBote = (c, hoyo) => g => { if (!MATRIZ) return; g.save(); g.setTransform(MATRIZ); const q = c(); g.translate(q.x, q.y + 10.5); dibBoteEn(g, hoyo()); g.restore(); };
  // espejo de mano (marco propio: agarre en el origen, el mango hacia +x)
  function dibEspejo(g) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // mango
    g.fillStyle = "#1c1a1f"; g.strokeStyle = TINTA; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(-6, -2.2); g.lineTo(14, -2.6); g.lineTo(14, 2.6); g.lineTo(-6, 2.2); g.quadraticCurveTo(-8, 0, -6, -2.2); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#c9a24a"; g.fillRect(12, -3.2, 3, 6.4);
    // disco (de canto: se ve el cristal)
    g.translate(29, 0);
    g.fillStyle = "#c9a24a"; g.beginPath(); g.ellipse(0, 0, 15.5, 8.5, 0, 0, TAU); g.fill(); g.lineWidth = 1.3; g.stroke();
    const vi = g.createLinearGradient(-12, -6, 10, 6); vi.addColorStop(0, "#e9f6ff"); vi.addColorStop(0.5, "#9fc8e2"); vi.addColorStop(1, "#5d86a6");
    g.fillStyle = vi; g.beginPath(); g.ellipse(0.5, 0.8, 13, 6.6, 0, 0, TAU); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-7, -2.4); g.lineTo(-1, 3.6); g.moveTo(-2, -4); g.lineTo(2, 0.2); g.stroke();
    g.restore();
  }

  /* ---------- capa de la cabeza de Kiriku: pelos sueltos, desastre y peine clavado ---------- */
  function capaK(g, t, p, AK) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // pelos sueltos: cada pasada coloca uno (se acuesta y desaparece en el peinado)
    SUELTOS.forEach(([r, a, L], i) => {
      const k = 1 - tramo(t, finPasada(i) - 0.2, finPasada(i) - 0.02);
      if (k <= 0.01) return;
      g.globalAlpha = clamp(k * 1.6);
      mechon(g, P2(r[0], r[1]), a - (1 - k) * 0.9, L * (0.35 + 0.65 * k), 7, 0.25, t, i, 0.3 * Math.sin(t * 3 + i));
    });
    g.globalAlpha = 1;
    if (t >= T.cae - 0.001) {
      const u = t - T.cae, m = 1 - Math.exp(-9 * u) * Math.cos(15 * u);
      const pc = peineEnK(t), A = afPeineRet(pc.o, pc.u, pc.v, kRet(AK));
      g.save(); aplica(g, A); dibPeine(g); g.restore();
      DESASTRE.forEach((d, i) => {
        const tarde = clamp(m - 0.06 * (i % 3));
        mechon(g, d.r, d.a + 0.12 * Math.sin(t * 2.3 + i) * Math.exp(-0.6 * u), d.L * clamp(tarde, 0, 1.3), d.w, d.kink, t, i, 0.05 * Math.sin(t * 4 + i));
      });
    }
    g.restore();
  }

  /* =====================================================================================
   * EL PEINE EN EL AIRE
   * ===================================================================================== */
  const memo = new Map();
  const cache = (k, f) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };
  // vuelo de A0 a A1 en arco (altura h), girando n vueltas (sentido sg)
  function vuelo(A0, A1, k, h, n, sg) {
    const a = desc(A0), b = desc(A1), e = suave(k) * 0.35 + k * 0.65;
    const o = P2(lerp(a.o.x, b.o.x, e), lerp(a.o.y, b.o.y, e) - h * Math.sin(Math.PI * e));
    const th = a.th + (difAng(a.th, b.th) + sg * TAU * n) * e;
    return comp({ o, th, sx: lerp(a.sx, b.sx, e), sy: lerp(a.sy, b.sy, e) });
  }
  const H_VUELO2 = 80;
  function peineVolando(t) {
    if (t >= T.kLanza && t < T.gAtrapa) {
      const A0 = cache("k0", () => poseK(T.kLanza - 1e-6).peineAF), A1 = cache("g1", () => poseG(T.gAtrapa).peineAF);
      return { A: vuelo(A0, A1, fase(t, T.kLanza, T.gAtrapa), 120, 1, -1), k: fase(t, T.kLanza, T.gAtrapa), A0, A1 };
    }
    if (t >= T.lanza && t < T.cae) {
      const A0 = cache("g2", () => poseG(T.lanza).AClav);
      const A1 = cache("k2", () => { const pk = poseK(T.cae); const pc = peineEnK(T.cae); return retAPant(afCab(KI, pk), pc); });
      return { A: vuelo(A0, A1, fase(t, T.lanza, T.cae), H_VUELO2, 2, 1), k: fase(t, T.lanza, T.cae), A0, A1 };
    }
    return null;
  }

  /* =====================================================================================
   * FONDO (una vez): tocador de un camerino elegante
   * ===================================================================================== */
  let fondo = null, MATRIZ = null;
  const ESP = { x0: 430, x1: 600, y0: 96, y1: 322 };
  const ENC = { x0: 404, x1: 626, top: 342, frente: 352, base: 466 };
  const BOMBILLAS = (() => {
    const b = [];
    for (let i = 0; i < 6; i++) b.push(P2(lerp(ESP.x0 + 10, ESP.x1 - 10, i / 5), ESP.y0 - 11));
    for (let i = 0; i < 6; i++) { const y = lerp(ESP.y0 + 18, ESP.y1 - 14, i / 5); b.push(P2(ESP.x0 - 11, y), P2(ESP.x1 + 11, y)); }
    return b;
  })();
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 120;
    const g = c.getContext("2d"); g.translate(60, 60);
    g.lineJoin = "round"; g.lineCap = "round";
    // papel pintado a rayas
    const pa = g.createLinearGradient(0, -60, 0, 370); pa.addColorStop(0, "#c98d84"); pa.addColorStop(1, "#dba69b");
    g.fillStyle = pa; g.fillRect(-60, -60, W + 120, 432);
    for (let x = -60; x < W + 60; x += 36) {
      g.fillStyle = "rgba(255,236,220,0.13)"; g.fillRect(x, -60, 18, 432);
      g.fillStyle = "rgba(232,197,154,0.35)"; g.fillRect(x + 17, -60, 1.6, 432);
    }
    // moldura de techo
    g.fillStyle = "#efe0cf"; g.fillRect(-60, -60, W + 120, 52); g.fillStyle = "#d9c3ac"; g.fillRect(-60, -10, W + 120, 6);
    g.strokeStyle = "rgba(60,30,20,0.35)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-60, -4); g.lineTo(W + 60, -4); g.stroke();
    // zócalo de paneles crema y moldura
    g.fillStyle = "#efe2d3"; g.fillRect(-60, 372, W + 120, 100);
    for (let x = -40; x < W + 40; x += 112) {
      g.strokeStyle = "rgba(150,110,80,0.45)"; g.lineWidth = 2; g.strokeRect(x, 386, 92, 70);
      g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x + 2, 454); g.lineTo(x + 2, 388); g.lineTo(x + 90, 388); g.stroke();
    }
    g.fillStyle = "#8a5a3c"; g.fillRect(-60, 364, W + 120, 9); g.fillStyle = "#a97452"; g.fillRect(-60, 364, W + 120, 3);
    // suelo de espiga (miel)
    const Y0 = 470;
    g.fillStyle = "#c08850"; g.fillRect(-60, Y0, W + 120, H + 60 - Y0);
    const tabla = (x, y, sg, col) => { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 34, y + sg * 17); g.lineTo(x + 34, y + sg * 17 + 11); g.lineTo(x, y + 11); g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = "rgba(90,50,20,0.55)"; g.lineWidth = 1; g.stroke(); };
    for (let fila = 0; fila < 14; fila++) {
      const y = Y0 - 10 + fila * 11;
      for (let x = -80 + (fila % 2) * 17; x < W + 80; x += 68) {
        const h1 = hash(fila * 31 + x * 0.1), h2 = hash(fila * 17 + x * 0.3 + 5);
        tabla(x, y, -1, h1 > 0.5 ? "#c9955c" : "#b8824b"); tabla(x + 34, y - 17, 1, h2 > 0.5 ? "#d09f66" : "#bd8a51");
      }
    }
    const so = g.createLinearGradient(0, Y0, 0, Y0 + 40); so.addColorStop(0, "rgba(60,30,10,0.35)"); so.addColorStop(1, "rgba(60,30,10,0)");
    g.fillStyle = so; g.fillRect(-60, Y0, W + 120, 40);
    g.fillStyle = "#f4ece2"; g.fillRect(-60, 462, W + 120, 9); g.strokeStyle = "rgba(90,60,40,0.5)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-60, 471); g.lineTo(W + 60, 471); g.stroke();
    // cuadro abstracto (izquierda)
    g.save(); g.translate(150, 126);
    g.fillStyle = "#1d1b20"; g.fillRect(-6, -6, 102, 122); g.fillStyle = "#f6f1ea"; g.fillRect(4, 4, 82, 102);
    g.fillStyle = "#d77a5c"; g.beginPath(); g.arc(34, 44, 20, 0, TAU); g.fill();
    g.fillStyle = "#2f5c5a"; g.beginPath(); g.moveTo(14, 96); g.quadraticCurveTo(48, 50, 80, 96); g.closePath(); g.fill();
    g.strokeStyle = "#c9a24a"; g.lineWidth = 3; g.beginPath(); g.arc(58, 36, 14, Math.PI * 0.9, Math.PI * 2.1); g.stroke();
    g.restore();
    // aplique redondo (derecha)
    g.save(); g.translate(902, 132);
    g.fillStyle = "#b8913e"; g.fillRect(-4, -26, 8, 26); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.strokeRect(-4, -26, 8, 26);
    const gl = g.createRadialGradient(-5, -4, 3, 0, 0, 20); gl.addColorStop(0, "#fffbe8"); gl.addColorStop(1, "#f3d79a");
    g.fillStyle = gl; g.beginPath(); g.arc(0, 4, 19, 0, TAU); g.fill(); g.strokeStyle = "rgba(120,80,30,0.6)"; g.stroke();
    g.restore();
    // toallero con toalla
    g.save();
    g.strokeStyle = "#b8913e"; g.lineWidth = 5; g.beginPath(); g.moveTo(858, 252); g.lineTo(986, 252); g.stroke();
    g.fillStyle = "#b8913e"; g.fillRect(852, 244, 8, 16); g.fillRect(984, 244, 8, 16);
    g.fillStyle = "#93a98a"; g.beginPath(); g.moveTo(878, 250); g.lineTo(966, 250); g.lineTo(962, 360); g.quadraticCurveTo(921, 368, 882, 360); g.closePath(); g.fill();
    g.strokeStyle = "rgba(30,40,25,0.7)"; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = "#f2efe6"; g.fillRect(880, 330, 84, 7); g.fillStyle = "#c9a24a"; g.fillRect(880, 340, 84, 3);
    g.fillStyle = "rgba(255,255,255,0.2)"; g.fillRect(884, 256, 12, 70);
    g.restore();
    // planta (izquierda, en el suelo)
    g.save(); g.translate(70, 0);
    g.fillStyle = "#f2ede4"; g.beginPath(); g.moveTo(-34, 452); g.lineTo(34, 452); g.lineTo(26, 520); g.lineTo(-26, 520); g.closePath(); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke(); g.fillStyle = "rgba(0,0,0,0.08)"; g.fillRect(6, 456, 18, 62);
    g.strokeStyle = "#4b3a22"; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 452); g.quadraticCurveTo(6, 330, -4, 210); g.stroke();
    for (let i = 0; i < 11; i++) {
      const y = 430 - i * 22, sd = i % 2 ? 1 : -1, x = 3 * Math.sin(i), a = sd * (0.55 + 0.25 * hash(i + 2)) - Math.PI / 2;
      g.save(); g.translate(x, y); g.rotate(a);
      g.fillStyle = i % 3 ? "#3f7a45" : "#4f8f52"; g.beginPath(); g.ellipse(0, -30, 15, 31, 0, 0, TAU); g.fill();
      g.strokeStyle = "#1f3a22"; g.lineWidth = 1.6; g.stroke();
      g.strokeStyle = "rgba(200,240,190,0.5)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -56); g.stroke();
      g.restore();
    }
    g.restore();
    // espejo de camerino con bombillas
    g.save();
    g.fillStyle = "#b8913e"; g.fillRect(ESP.x0 - 22, ESP.y0 - 22, ESP.x1 - ESP.x0 + 44, ESP.y1 - ESP.y0 + 34);
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(ESP.x0 - 22, ESP.y0 - 22, ESP.x1 - ESP.x0 + 44, ESP.y1 - ESP.y0 + 34);
    g.fillStyle = "#d8b45e"; g.fillRect(ESP.x0 - 18, ESP.y0 - 18, ESP.x1 - ESP.x0 + 36, 4);
    const cr = g.createLinearGradient(ESP.x0, ESP.y0, ESP.x1, ESP.y1); cr.addColorStop(0, "#d6e5e6"); cr.addColorStop(0.6, "#a9c1c6"); cr.addColorStop(1, "#8eaab1");
    g.fillStyle = cr; g.fillRect(ESP.x0, ESP.y0, ESP.x1 - ESP.x0, ESP.y1 - ESP.y0);
    // reflejo: la pared de enfrente (verde agua) con una puerta iluminada
    g.save(); g.beginPath(); g.rect(ESP.x0, ESP.y0, ESP.x1 - ESP.x0, ESP.y1 - ESP.y0); g.clip();
    g.fillStyle = "rgba(90,140,138,0.35)"; g.fillRect(ESP.x0, ESP.y0 + 150, ESP.x1 - ESP.x0, 80);
    g.fillStyle = "rgba(255,246,222,0.55)"; g.fillRect(ESP.x0 + 96, ESP.y0 + 46, 46, 110);
    g.strokeStyle = "rgba(120,90,60,0.35)"; g.lineWidth = 3; g.strokeRect(ESP.x0 + 96, ESP.y0 + 46, 46, 110);
    g.fillStyle = "rgba(255,255,255,0.28)";
    for (const [x, w] of [[ESP.x0 + 18, 26], [ESP.x0 + 58, 10]]) { g.beginPath(); g.moveTo(x, ESP.y1); g.lineTo(x + w, ESP.y1); g.lineTo(x + w + 110, ESP.y0); g.lineTo(x + 110, ESP.y0); g.closePath(); g.fill(); }
    g.restore();
    g.strokeStyle = "rgba(40,30,20,0.6)"; g.lineWidth = 1.5; g.strokeRect(ESP.x0, ESP.y0, ESP.x1 - ESP.x0, ESP.y1 - ESP.y0);
    for (const b of BOMBILLAS) {
      g.fillStyle = "#e9d7a8"; g.beginPath(); g.arc(b.x, b.y, 8.5, 0, TAU); g.fill();
      const bg = g.createRadialGradient(b.x - 2, b.y - 2, 1, b.x, b.y, 7); bg.addColorStop(0, "#ffffff"); bg.addColorStop(1, "#ffe9b0");
      g.fillStyle = bg; g.beginPath(); g.arc(b.x, b.y, 6.5, 0, TAU); g.fill();
      g.strokeStyle = "rgba(120,80,30,0.7)"; g.lineWidth = 1; g.stroke();
    }
    // halo de las bombillas y del aplique (va en el fondo: los personajes quedan delante)
    g.save(); g.globalCompositeOperation = "lighter";
    const la = g.createRadialGradient(515, 200, 30, 515, 210, 300); la.addColorStop(0, "rgba(255,226,170,0.08)"); la.addColorStop(1, "rgba(255,226,170,0)");
    g.fillStyle = la; g.fillRect(200, -100, 640, 620);
    for (const b of BOMBILLAS) { const r = g.createRadialGradient(b.x, b.y, 2, b.x, b.y, 20); r.addColorStop(0, "rgba(255,240,200,0.32)"); r.addColorStop(1, "rgba(255,240,200,0)"); g.fillStyle = r; g.fillRect(b.x - 20, b.y - 20, 40, 40); }
    const ap = g.createRadialGradient(902, 136, 4, 902, 136, 80); ap.addColorStop(0, "rgba(255,230,170,0.2)"); ap.addColorStop(1, "rgba(255,230,170,0)");
    g.fillStyle = ap; g.fillRect(812, 46, 180, 180);
    g.restore();
    g.restore();
    // encimera de mármol y mueble verde
    g.save();
    g.fillStyle = "#2d5c5a"; g.fillRect(ENC.x0 + 6, ENC.frente, ENC.x1 - ENC.x0 - 12, ENC.base - ENC.frente);
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(ENC.x0 + 6, ENC.frente, ENC.x1 - ENC.x0 - 12, ENC.base - ENC.frente);
    const mitad = (ENC.x0 + ENC.x1) / 2;
    for (const [x0, x1] of [[ENC.x0 + 16, mitad - 4], [mitad + 4, ENC.x1 - 16]]) {
      g.strokeStyle = "rgba(10,30,28,0.7)"; g.lineWidth = 2; g.strokeRect(x0, ENC.frente + 14, x1 - x0, ENC.base - ENC.frente - 26);
      g.strokeStyle = "rgba(160,210,200,0.25)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x0 + 2, ENC.base - 14); g.lineTo(x0 + 2, ENC.frente + 16); g.lineTo(x1 - 2, ENC.frente + 16); g.stroke();
    }
    g.fillStyle = "#c9a24a"; for (const x of [mitad - 12, mitad + 12]) { g.beginPath(); g.arc(x, ENC.frente + 50, 3.5, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1; g.stroke(); }
    g.fillStyle = "#f3f0ec"; g.fillRect(ENC.x0, ENC.top, ENC.x1 - ENC.x0, ENC.frente - ENC.top); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(ENC.x0, ENC.top, ENC.x1 - ENC.x0, ENC.frente - ENC.top);
    g.strokeStyle = "rgba(140,140,150,0.45)"; g.lineWidth = 1;
    for (let i = 0; i < 5; i++) { const x = ENC.x0 + 20 + i * 44; g.beginPath(); g.moveTo(x, ENC.top + 2); g.quadraticCurveTo(x + 12, ENC.top + 6, x + 26, ENC.frente - 2); g.stroke(); }
    // cosas en la encimera: perfume, vaso de brochas y toallas dobladas
    g.save(); g.translate(522, ENC.top);
    g.fillStyle = "rgba(230,190,200,0.85)"; g.beginPath(); g.roundRect(-9, -24, 18, 24, 4); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.3; g.stroke();
    g.fillStyle = "#c9a24a"; g.fillRect(-4, -31, 8, 7); g.strokeRect(-4, -31, 8, 7); g.fillStyle = "rgba(255,255,255,0.6)"; g.fillRect(-6, -20, 3, 14);
    g.restore();
    g.save(); g.translate(554, ENC.top);
    for (const [dx, a, c] of [[-4, -0.2, "#3b2a24"], [1, 0.05, "#d8a28e"], [5, 0.25, "#1f1b1d"]]) { g.save(); g.translate(dx, -16); g.rotate(a); g.fillStyle = "#c9a24a"; g.fillRect(-1.5, -18, 3, 18); g.fillStyle = c; g.beginPath(); g.ellipse(0, -22, 3.5, 6, 0, 0, TAU); g.fill(); g.restore(); }
    g.fillStyle = "#2d2a30"; g.beginPath(); g.roundRect(-9, -18, 18, 18, 3); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
    g.restore();
    g.save(); g.translate(598, ENC.top);
    for (let i = 0; i < 3; i++) { g.fillStyle = i % 2 ? "#f6f2ea" : "#e9e2d6"; g.beginPath(); g.roundRect(-18, -9 - i * 9, 36, 9, 3); g.fill(); g.strokeStyle = "rgba(60,50,40,0.6)"; g.lineWidth = 1; g.stroke();
      g.fillStyle = "#93a98a"; g.fillRect(-18, -6 - i * 9, 36, 2); }
    g.restore();
    // tapa del bote de gomina, abierta en la encimera
    g.save(); g.translate(BOTE.x + 30, ENC.top);
    g.fillStyle = "#cfd6dc"; g.beginPath(); g.ellipse(0, -3, 13, 4, 0, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = "#e9eef2"; g.beginPath(); g.ellipse(-2, -4.5, 8, 2, 0, 0, TAU); g.fill();
    g.restore();
    g.restore();
    return c;
  }
  // bote de gomina (pantalla); hoyo: lo que se ha sacado
  function dibBote(g, hoyo, x = BOTE.x) { g.save(); g.translate(x, ENC.top); dibBoteEn(g, hoyo); g.restore(); }
  function dibBoteEn(g, hoyo) {
    g.save(); g.lineJoin = "round";
    g.fillStyle = "rgba(60,150,200,0.85)"; g.beginPath(); g.roundRect(-14, -21, 28, 21, 5); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = "#37a9df"; g.beginPath(); g.ellipse(0, -19, 13, 3.6, 0, 0, TAU); g.fill();
    if (hoyo > 0.01) { g.fillStyle = "#1d7fae"; g.beginPath(); g.ellipse(-2, -18.6, 6 * hoyo, 2 * hoyo, 0, 0, TAU); g.fill(); }
    g.strokeStyle = "#dbe5ec"; g.lineWidth = 2.2; g.beginPath(); g.ellipse(0, -20, 14, 4, 0, 0, TAU); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 0.9; g.beginPath(); g.ellipse(0, -20, 15.2, 5, 0, 0, TAU); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.55)"; g.fillRect(-10, -14, 3, 11);
    // una gota dibujada en la etiqueta (sin letras)
    g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(4, -15); g.quadraticCurveTo(8.5, -8, 4, -5.5); g.quadraticCurveTo(-0.5, -8, 4, -15); g.fill();
    g.restore();
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  function estrella(g, x, y, r, a = 0, col = "#fff6c8") {
    g.save(); g.translate(x, y); g.rotate(a); g.beginPath();
    for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.28 : r, an = i * Math.PI / 4; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
    g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = "rgba(90,70,20,0.8)"; g.lineWidth = 1; g.stroke(); g.restore();
  }
  function destellos(g, t, P) {
    // un destellito en el pelo de Kiriku al final de cada pasada; ¡ting! al admirarse
    T.kp.forEach((tp, i) => {
      const k = fase(t, finPasada(i) - 0.05, finPasada(i) + 0.35); if (k <= 0 || k >= 1) return;
      const q = enCab(KI, P.k, [P2(960, 196), P2(860, 184), P2(760, 212)][i]);
      g.save(); g.globalAlpha = Math.sin(Math.PI * k); estrella(g, q.x, q.y - 4, 5 + 6 * Math.sin(Math.PI * k), k * 2); g.restore();
    });
    const kt = fase(t, T.kTing - 0.04, T.kTing + 0.45);
    if (kt > 0 && kt < 1) {
      const q = enCab(KI, P.k, P2(900, 182));
      g.save(); g.globalAlpha = Math.sin(Math.PI * kt); estrella(g, q.x + 4, q.y - 8, 13 * salida(kt) + 2, kt * 1.5);
      g.strokeStyle = "#fff6c8"; g.lineWidth = 2; g.lineCap = "round";
      for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + 0.3, r0 = 14 + 10 * kt, r1 = r0 + 7; g.beginPath(); g.moveTo(q.x + 4 + Math.cos(a) * r0, q.y - 8 + Math.sin(a) * r0); g.lineTo(q.x + 4 + Math.cos(a) * r1, q.y - 8 + Math.sin(a) * r1); g.stroke(); }
      g.restore();
    }
    // brillo de la gomina
    for (const [t0, ix] of [[9.64, 2], [9.86, 6], [10.02, 9]]) {
      const k = fase(t, t0, t0 + 0.3); if (k <= 0 || k >= 1) continue;
      const cen = PELO_G.linea(ix, P.g.est.puas[ix]), q = apl(afCab(G, P.g), PELO_G.enLinea(cen, 0.5));
      g.save(); g.globalAlpha = Math.sin(Math.PI * k); estrella(g, q.x, q.y, 7 * Math.sin(Math.PI * k) + 1, k, "#ffffff"); g.restore();
    }
  }
  // muelles de dibujo junto a las púas que saltan
  function muelles(g, t, P) {
    const AG = afCab(G, P.g);
    const brotes = [];
    ORDEN_S.forEach((i, j) => { if (j % 2 === 0) brotes.push([i, T.boing0 + j * T.boingPaso]); });
    brotes.push([4, T.lanza], [8, T.lanza + 0.12], [1, T.lanza + 0.2]);
    for (const [i, t0] of brotes) {
      const k = fase(t, t0 + 0.02, t0 + 0.3); if (k <= 0 || k >= 1) continue;
      const cen = PELO_G.linea(i, P.g.est.puas[i]), a = apl(AG, PELO_G.enLinea(cen, 1)), b = apl(AG, PELO_G.enLinea(cen, 0.75));
      const d = P2(a.x - b.x, a.y - b.y), l = Math.hypot(d.x, d.y) || 1, u = P2(d.x / l, d.y / l), n = P2(-u.y, u.x);
      g.save(); g.globalAlpha = Math.sin(Math.PI * k); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.lineCap = "round"; g.lineJoin = "round";
      const o = P2(a.x + u.x * 5, a.y + u.y * 5), L = 12 + 4 * Math.sin(k * 30);
      g.beginPath(); for (let s = 0; s <= 12; s++) { const w = (s % 2 ? 1 : -1) * 4 * (s && s < 12 ? 1 : 0); g.lineTo(o.x + u.x * L * s / 12 + n.x * w, o.y + u.y * L * s / 12 + n.y * w); } g.stroke();
      g.restore();
    }
  }
  function gotasGomina(g, t, P) {
    const k = fase(t, T.gPlas, T.gPlas + 0.55); if (k <= 0 || k >= 1) return;
    const c = enCab(G, P.g, P2(800, 300));
    g.save(); g.fillStyle = "#59c6f2"; g.strokeStyle = "#13506e"; g.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (i - 3) * 0.42, v = 70 + 40 * hash(i + 3), x = c.x + Math.cos(a) * v * k, y = c.y + Math.sin(a) * v * k + 160 * k * k;
      g.globalAlpha = 1 - k; g.beginPath(); g.ellipse(x, y, 3.2, 2.4, a, 0, TAU); g.fill(); g.stroke();
    }
    g.restore();
  }
  function crujidos(g, t, P) {
    const k = campana(t, T.sube0 + 0.15, T.lanza);
    if (k <= 0.01) return;
    const AG = afCab(G, P.g);
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 1.5; g.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const ph = (t * 3.1 + i * 0.37) % 1; if (ph > 0.55) continue;
      const q = apl(AG, [P2(540, 300), P2(980, 220), P2(760, 160)][i]);
      g.globalAlpha = k * Math.sin(Math.PI * ph / 0.55);
      g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q.x + 5, q.y - 4); g.lineTo(q.x + 1, q.y - 8); g.lineTo(q.x + 6, q.y - 12); g.stroke();
    }
    g.restore();
  }
  function lineasVuelo(g, t) {
    const tramos = [[T.kLanza, T.gAtrapa, 120, 1, -1], [T.lanza, T.cae, H_VUELO2, 2, 1]];
    for (const [t0, t1, h, n, sg] of tramos) {
      if (t < t0 || t > t1 + 0.12) continue;
      const V = peineVolando(Math.min(t, t1 - 1e-4)) || peineVolando(t1 - 1e-4); if (!V) continue;
      const k = fase(t, t0, t1);
      g.save(); g.lineCap = "round"; g.strokeStyle = "rgba(255,255,255,0.8)";
      for (let j = 0; j < 3; j++) {
        g.beginPath();
        for (let s = 0; s <= 8; s++) {
          const kk = clamp(k - 0.03 - s * 0.012 - j * 0.004); const A = vuelo(V.A0, V.A1, kk, h, n, sg), q = apl(A, P2(LP * 0.5, j * 3 - 3));
          if (s) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y);
        }
        g.globalAlpha = 0.55 * (1 - fase(t, t1, t1 + 0.12)); g.lineWidth = 2.2 - j * 0.5; g.stroke();
      }
      g.restore();
    }
  }
  function impacto(g, t, P) {
    const k = fase(t, T.cae, T.cae + 0.35); if (k <= 0 || k >= 1) return;
    const q = enCab(KI, P.k, P2(870, 196));
    g.save(); g.globalAlpha = 1 - k; estrella(g, q.x, q.y - 6, 10 + 12 * salida(k), 0.3, "#fff2a8");
    g.strokeStyle = TINTA; g.lineWidth = 2; g.lineCap = "round";
    for (let i = 0; i < 7; i++) { const a = -Math.PI * 0.95 + i * Math.PI * 0.9 / 6, r0 = 20 + 18 * k, r1 = r0 + 9; g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y - 6 + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * r1, q.y - 6 + Math.sin(a) * r1); g.stroke(); }
    g.restore();
    // pelillos que caen
    g.save(); g.strokeStyle = COL_K.pelo; g.lineWidth = 1.4; g.lineCap = "round";
    for (let i = 0; i < 5; i++) {
      const kk = fase(t, T.cae, T.cae + 1.4); if (kk <= 0 || kk >= 1) break;
      const x = q.x - 30 + i * 15 + 14 * Math.sin(kk * 8 + i), y = q.y + 10 + 120 * kk + 6 * i;
      g.globalAlpha = 1 - kk; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 4, y + 3, x + 2, y + 8); g.stroke();
    }
    g.restore();
  }
  function susto(g, t, P) {
    const k = fase(t, T.kHorror - 0.02, T.kHorror + 0.5); if (k <= 0 || k >= 1) return;
    const c = enCab(KI, P.k, P2(820, 420));
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 2.6; g.lineCap = "round"; g.globalAlpha = clamp(k * 6) * (1 - k * k);
    for (let i = 0; i < 9; i++) { const a = -Math.PI * 0.98 + i * Math.PI * 0.96 / 8, r = 70 + 16 * salida(k), L = 12 * (1 - 0.4 * k);
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r); g.lineTo(c.x + Math.cos(a) * (r + L), c.y + Math.sin(a) * (r + L)); g.stroke(); }
    g.restore();
  }
  // notas de silbido (redondas, sin letras)
  function notas(g, t, P) {
    if (t < T.gSilba0 || t > T.gSilba1 + 1) return;
    const b = G.aPantalla(P.g, G.boca(P.g));
    for (let i = 0; i < 6; i++) {
      const t0 = T.gSilba0 + 0.05 + i * 0.26; if (t0 > T.gSilba1) break;
      const k = fase(t, t0, t0 + 1.1); if (k <= 0 || k >= 1) continue;
      const x = b.x + 26 + 44 * k + 7 * Math.sin(k * 7 + i), y = b.y - 4 - 64 * k;
      g.save(); g.globalAlpha = Math.sin(Math.PI * k) * (t > T.gMiraK && t < T.gMiraK1 + 0.1 ? 0.25 : 1);
      g.translate(x, y); g.rotate(0.2 * Math.sin(k * 5 + i)); g.scale(1.5, 1.5); g.lineCap = "round"; g.lineJoin = "round";
      const nota = () => { g.beginPath(); g.ellipse(0, 0, 4.2, 3.1, -0.4, 0, TAU); g.moveTo(3.6, -1); g.lineTo(3.6, -15); g.quadraticCurveTo(8, -12, 9, -7); };
      g.strokeStyle = "rgba(255,248,236,0.9)"; g.lineWidth = 4; nota(); g.stroke();
      g.fillStyle = TINTA; g.strokeStyle = TINTA; g.lineWidth = 1.7;
      g.beginPath(); g.ellipse(0, 0, 4.2, 3.1, -0.4, 0, TAU); g.fill();
      g.beginPath(); g.moveTo(3.6, -1); g.lineTo(3.6, -15); g.quadraticCurveTo(8, -12, 9, -7); g.stroke();
      g.restore();
    }
  }
  function sombras(g, P) {
    g.save(); g.fillStyle = "rgba(60,30,10,0.28)";
    g.beginPath(); g.ellipse(P.g.x + 4, SUELO + 4, 62, 7, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(P.k.x - 2, SUELO + 4, 62, 7, 0, 0, TAU); g.fill();
    g.restore();
  }
  function luces(g) {
    g.save(); g.globalCompositeOperation = "multiply";
    const v = g.createRadialGradient(512, 300, 300, 512, 300, 700); v.addColorStop(0, "rgb(255,255,255)"); v.addColorStop(1, "rgb(150,120,115)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    g.restore();
  }
  function camara(t) {
    const z1 = tramo(t, T.gAlisa1, T.gOrgullo0 + 0.4) * (1 - tramo(t, T.sube0 + 0.5, T.lanza - 0.1));
    const z2 = tramo(t, T.kEspejo0, T.kHorror + 0.4);
    return { k: 1 + 0.06 * z1 + 0.07 * z2, x: 512 - 70 * z1 + 70 * z2, y: 300 - 8 * z1 - 8 * z2 };
  }

  /* =====================================================================================
   * ESCENA
   * ===================================================================================== */
  function poses(t) { return { g: poseG(t), k: poseK(t) }; }
  class Peine extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !KI.listo()) return;
      if (!fondo) fondo = creaFondo();
      const luz = tramo(t, NEGRO_INICIO, 0.8) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      MATRIZ = g.getTransform();
      const P = poses(t);
      g.drawImage(fondo, -60, -60);
      if (t < T.gAgarra) dibBote(g, 0); else if (t >= T.gDeja + 0.02) dibBote(g, 1, BOTE2.x);
      sombras(g, P);
      G.dibujar(g, P.g, t);
      KI.dibujar(g, P.k, t);
      const V = peineVolando(t);
      lineasVuelo(g, t);
      if (V) { g.save(); aplica(g, V.A); dibPeine(g, 0.6); g.restore(); }
      muelles(g, t, P); crujidos(g, t, P); gotasGomina(g, t, P);
      destellos(g, t, P); impacto(g, t, P); susto(g, t, P); notas(g, t, P);
      g.restore();
      luces(g);
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00086", nombre: "Guillermo y Kiriku · El peine", crear: () => new Peine() });
  window.__A2D_00086 = { pose: poses, poses, T, DUR, afCab, enCab, codo, G, KI, PELO: PELO_G };
})();
