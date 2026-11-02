"use strict";
/* 00095 · Guillermo y Marta · El gato
 *
 * Negro → un salón acogedor a la hora dorada: pared verde salvia con zócalo, una librería llena de libros
 * de colores (sin letras), un cuadro, y a la derecha un mirador con banco de obra, cojín mostaza, cojines,
 * una manta de punto y macetas; por la ventana entra el sol de la tarde en haces con motas de polvo.
 * Marta, sentada en el banco del mirador, tiene en el regazo un gato naranja atigrado, hecho una bola y
 * dormido: lo acaricia y el gato ronronea (rayitas que vibran). Guillermo se derrite al verlo, se acerca,
 * se agacha y alarga la mano muy despacio… el gato abre un ojo y ¡se eriza! (lomo arqueado, pelo de punta,
 * cola de escobilla, bufido con colmillos). Guillermo da un brinco hacia atrás con las manos en alto.
 * Marta se ríe, el gato se calma y se lame la pata. Marta le llama con el dedo, le susurra algo al oído y
 * le da una caña con una pluma. Guillermo la menea: el gato se agazapa, menea el culete, salta al suelo,
 * caza la pluma a zarpazos… Guillermo levanta la caña de un tirón y el gato se le sube por la pierna, el
 * pecho y el hombro (le frota la mejilla), le salta a la cabeza, da la vuelta, le da dos zarpazos al cordel
 * delante de la cara, amasa y se hace una bola encima de sus pinchos, como un gorro, ronroneando. Guillermo
 * no se atreve ni a respirar, encantado y colorado; Marta se ríe tapándose la boca. Guillermo mira a cámara
 * y el gato abre un ojo → negro.
 *
 * Sin textos. Todo depende solo de `t`. El gato es un dibujo propio (no es un muñeco recortado): un
 * esqueleto sencillo (lomo curvo, cuatro patas de dos tramos, cola por segmentos, cabeza) cuyas posturas
 * se mezclan sin saltos. La mano de Marta que acaricia se vuelve a pintar encima del gato.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, entrada, salida, tramo, campana, mezcla, hash } = M2;
  const G = Guillermo, M = Marta, R = Recortes;
  const S = 0.30, DUR = 14.8, TAU = Math.PI * 2;
  const KM = M.K, SM = S * KM;
  const SUELO = 556;
  const T = {
    c1a: 0.5, c1b: 1.55, c2a: 1.72, c2b: 2.8,
    gMira: 0.45, derrite0: 1.0, derrite1: 2.4,
    decide: 2.45, paso0: 2.62, paso1: 3.12, agacha0: 3.05, agacha1: 3.5, alarga0: 3.4, alarga1: 3.95,
    ojo1: 3.8, ojos: 3.94, eriza: 4.04, salto0: 4.14, salto1: 4.46,
    mRie0: 4.62, mRie1: 5.3, relaja0: 5.15, relaja1: 5.55, desinfla0: 5.0, desinfla1: 5.55,
    lame0: 5.62, lame1: 6.4,
    llama0: 5.36, llama1: 5.86, gAcerca0: 5.55, gAcerca1: 5.96,
    susurro0: 5.98, susurro1: 6.6, asiente0: 6.6, asiente1: 6.98,
    bolsillo0: 6.64, bolsillo1: 6.9, saca1: 7.1, ofrece1: 7.26, toma: 7.36,
    gAtras0: 7.45, gAtras1: 7.9, agita0: 7.7,
    caza0: 7.8, menea0: 7.98, saltaG0: 8.16, saltaG1: 8.48, golpe1: 8.6, golpe2: 8.8,
    abalanza: 8.94, muslo: 9.2, pecho: 9.5, hombro: 9.78, frota0: 9.84, frota1: 10.16, giraH0: 10.18, giraH1: 10.38,
    zarpa1: 10.5, zarpa2: 10.7, baja0: 10.78, baja1: 11.3, aCabeza0: 10.98, aCabeza1: 11.22,
    gira0: 11.34, gira1: 11.84, amasa0: 11.84, amasa1: 12.14, enrosca0: 12.14, enrosca1: 12.54,
    mRie2: 11.8, mRie3: 13.3, camara: 13.15, ojoGato: 13.5, mCamara: 13.4, fin: 14.05
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const rot = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const suma = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
  const difAng = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const lerpAng = (a, b, k) => a + difAng(a, b) * k;
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const Dd = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? m ?? i, menique: me ?? a ?? m ?? i });
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n], b[n], k); return o; };
  const RELAJ = Dd(0.55, 0.6, 0.55, 0.5, 0.45), ABIERTA = Dd(1, 1), PALMA = Dd(0.8, 0.95, 0.95, 0.92, 0.88),
    AGARRA = Dd(0.5, 0.36, 0.32, 0.3, 0.28), CARICIA = Dd(0.7, 0.88, 0.9, 0.86, 0.8), BOCA = Dd(0.75, 0.82, 0.8, 0.76, 0.7),
    TENSA = Dd(1, 1, 0.95, 0.95, 1), LLAMA = Dd(0.3, 1, 0.1, 0.08, 0.06), CUENCO = Dd(0.85, 0.7, 0.66, 0.62, 0.58);
  function pie(lista, t) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x, alza = 24] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    return { x: lerp(xa, x, suave5(u)), alza: alza * Math.sin(Math.PI * u), u };
  }
  const lienzo = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  const bez2 = (a, c, b, u) => { const v = 1 - u; return { x: v * v * a.x + 2 * v * u * c.x + u * u * b.x, y: v * v * a.y + 2 * v * u * c.y + u * u * b.y }; };

  /* ---------- manos por pistas (coordenadas de la hoja; el codo da el giro de la mano) ---------- */
  const SJ = new Map([[G, { l: G.BRAZO_L * 0.5, c: G.A.datos.piezas.brazo_cerca.codo }],
                      [M, { l: M.A.datos.piezas.brazo.codo, c: M.A.datos.piezas.brazo_cerca.codo }]]);
  const MU_BOLS = -1.75;
  function pista(lista, p, t) {
    const res = o => ({ q: o.en(p, t), mx: o.mx ?? 0, puno: o.puno ?? 1, fm: o.bolsillo ? 1 : 0,
      fw: o.mu === undefined ? 0 : 1, fx: Math.cos(o.mu ?? 0), fy: Math.sin(o.mu ?? 0),
      dedos: typeof o.dedos === "function" ? o.dedos(t) : (o.dedos || RELAJ) });
    let c = res(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, o, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)); if (k <= 0) continue;
      const d = res(o);
      c = { q: mezcla(c.q, d.q, k), mx: lerp(c.mx, d.mx, k), puno: lerp(c.puno, d.puno, k), fm: lerp(c.fm, d.fm, k), dedos: mezclaD(c.dedos, d.dedos, k),
        fw: lerp(c.fw, d.fw, k), fx: lerp(c.fw > 0 ? c.fx : d.fx, d.fx, k), fy: lerp(c.fw > 0 ? c.fy : d.fy, d.fy, k) };
    }
    return c;
  }
  function manoDe(rig, p, lado, h, dobla) {
    const Tr = rig.tronco(p), cerca = lado === "c";
    const hom = Tr(cerca ? rig.HOMBRO_C : rig.HOMBRO);
    const L = cerca ? rig.BRAZO_C_L : rig.BRAZO_L, sj = SJ.get(rig)[lado];
    const c = R.ik(hom, h.q, L, sj, 42, dobla, 1.08), d = R.dir(c.a1);
    const e = { x: hom.x + d.x * sj * c.estira, y: hom.y + d.y * sj * c.estira };
    let mu = Math.atan2(e.y - h.q.y, e.x - h.q.x) + h.mx;
    if (h.fw > 0.001) mu += difAng(mu, Math.atan2(h.fy, h.fx)) * h.fw;
    if (h.fm > 0) mu += difAng(mu, MU_BOLS) * h.fm;
    return { x: h.q.x, y: h.q.y, ang: 0, mu, dobla, puno: h.puno, dedos: h.dedos };
  }
  // destino en pantalla → hoja del personaje
  const enP = (rig, f) => (p, t) => rig.aHoja(p, f(p, t));

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, rub: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* =====================================================================================
   * EL GATO
   * Marco del suelo: origen en el centro del cuerpo, x hacia donde mira, y hacia el suelo (o hacia la
   * superficie donde se apoya). Marco del cuerpo: el del suelo girado `a` (cabeceo).
   * ===================================================================================== */
  const GT = { tinta: "#3a1d0d", base: "#ea9440", osc: "#c0631f", claro: "#fde6c4", lejos: "#c87430", lejosClaro: "#e7c9a2",
    nariz: "#ef8794", oreja: "#f2a3a3", iris: "#c2dc4e", irisOsc: "#7f9c24", pupila: "#1c120b", boca: "#6b1c22", lengua: "#f07f8e" };
  const FORMAS = {
    // bola dormida en un regazo
    dormido: { cf: 1.6, alto: 15, len: 0.92, arch: 5, gros: 1.12, puff: 0, loaf: 1, a: 0, hx: 9, hy: 5, ha: 0.2, hs: 1,
      oreja: 0.12, perk: 0, ojoC: 0, ojoL: 0, pupila: 0.6, mirX: 0, mirY: 0, feliz: 0, boca: 0, lengua: 0, frontal: 0.45,
      ca: 2.55, cc: -2.4, cw: 0.06, cp: 0, cdel: 1, garras: 0, ron: 0,
      fnx: 31, fny: 15, ffx: 25, ffy: 14, hnx: -14, hny: 15, hfx: -20, hfy: 14 },
    // de pie, normal
    dePie: { cf: 2.2, alto: 36, len: 1, arch: 4, gros: 1, puff: 0, loaf: 0, a: 0, hx: 12, hy: -14, ha: 0, hs: 1,
      oreja: 0, perk: 0.2, ojoC: 1, ojoL: 1, pupila: 0.55, mirX: 0.3, mirY: 0, feliz: 0, boca: 0, lengua: 0, frontal: 0.25,
      ca: -2.35, cc: 1.3, cw: 0.08, cp: 0, cdel: 0, garras: 0, ron: 0,
      fnx: 27, fny: 36, ffx: 20, ffy: 36, hnx: -23, hny: 36, hfx: -30, hfy: 36 },
    // erizado de Halloween: lomo arqueado, de puntillas, cola de escobilla, bufido
    erizado: { cf: 9, alto: 46, len: 0.9, arch: 18, gros: 1.16, puff: 1, loaf: 0, a: 0.04, hx: 7, hy: -3, ha: 0.12, hs: 1.02,
      oreja: 1, perk: 0, ojoC: 1, ojoL: 1, pupila: 0.2, mirX: 0.6, mirY: 0, feliz: 0, boca: 1, lengua: 0, frontal: 0.5,
      ca: -1.95, cc: 0.6, cw: 0.03, cp: 1, cdel: 0, garras: 0.6, ron: 0,
      fnx: 19, fny: 46, ffx: 13, ffy: 46, hnx: -19, hny: 46, hfx: -25, hfy: 46 },
    // sentado
    sentado: { cf: 1.8, alto: 27, len: 0.9, arch: 3, gros: 1.08, puff: 0, loaf: 0, a: -0.62, hx: 6, hy: -17, ha: 0.62, hs: 1,
      oreja: 0, perk: 0.1, ojoC: 1, ojoL: 1, pupila: 0.45, mirX: 0.3, mirY: 0, feliz: 0, boca: 0, lengua: 0, frontal: 0.35,
      ca: 1.95, cc: -1.9, cw: 0.05, cp: 0, cdel: 1, garras: 0, ron: 0,
      fnx: 17, fny: 27, ffx: 11, ffy: 27, hnx: -10, hny: 24, hfx: -16, hfy: 24 },
    // agazapado, cazando
    cazando: { cf: 9, alto: 22, len: 1.06, arch: -1, gros: 1, puff: 0, loaf: 0.1, a: 0.12, hx: 15, hy: -5, ha: -0.12, hs: 1,
      oreja: 0, perk: 1, ojoC: 1, ojoL: 1, pupila: 1, mirX: 0.6, mirY: 0.2, feliz: 0, boca: 0, lengua: 0, frontal: 0.2,
      ca: 3.0, cc: 0.5, cw: 0.22, cp: 0, cdel: 0, garras: 0, ron: 0,
      fnx: 33, fny: 22, ffx: 27, ffy: 22, hnx: -19, hny: 22, hfx: -25, hfy: 22 },
    // estirado en el aire
    salto: { cf: 3, alto: 30, len: 1.14, arch: -5, gros: 0.96, puff: 0, loaf: 0, a: 0, hx: 14, hy: -7, ha: 0, hs: 1,
      oreja: 0.35, perk: 0, ojoC: 1, ojoL: 1, pupila: 0.9, mirX: 0.6, mirY: 0.2, feliz: 0, boca: 0, lengua: 0, frontal: 0.15,
      ca: 3.0, cc: 0.35, cw: 0.05, cp: 0, cdel: 0, garras: 0.4, ron: 0,
      fnx: 50, fny: 12, ffx: 44, ffy: 16, hnx: -50, hny: 14, hfx: -44, hfy: 9 },
    // trepando por una superficie (la superficie está en +y)
    trepa: { cf: 4, alto: 19, len: 1.04, arch: 2, gros: 0.98, puff: 0, loaf: 0, a: 0, hx: 14, hy: -9, ha: -0.15, hs: 1,
      oreja: 0.25, perk: 0, ojoC: 1, ojoL: 1, pupila: 0.85, mirX: 0.5, mirY: -0.4, feliz: 0, boca: 0, lengua: 0, frontal: 0.15,
      ca: 3.25, cc: -0.6, cw: 0.06, cp: 0, cdel: 0, garras: 1, ron: 0,
      fnx: 35, fny: 19, ffx: 29, ffy: 17, hnx: -27, hny: 19, hfx: -33, hfy: 17 },
    // gorro: bola encima de una cabeza
    gorro: { cf: 1.6, alto: 13, len: 0.9, arch: 7, gros: 1.1, puff: 0, loaf: 1, a: 0, hx: 9, hy: 3, ha: 0.15, hs: 1,
      oreja: 0.15, perk: 0, ojoC: 0, ojoL: 0, pupila: 0.6, mirX: -0.6, mirY: 0, feliz: 0, boca: 0, lengua: 0, frontal: 0.6,
      ca: 2.35, cc: -0.9, cw: 0.07, cp: 0, cdel: 1, garras: 0, ron: 1,
      fnx: 31, fny: 13, ffx: 25, ffy: 12, hnx: -14, hny: 13, hfx: -20, hfy: 12 }
  };
  const mezclaF = (a, b, k) => mezclaE(a, b, k);

  // geometría del cuerpo (marco del cuerpo)
  function geoGato(P) {
    const L = 26 * P.len;
    const H = { x: -L, y: 0 }, Sh = { x: L, y: 0 }, Mc = { x: 0, y: -2 * P.arch };
    const sp = u => bez2(H, Mc, Sh, u);
    const tg = u => { const x = 2 * (1 - u) * (Mc.x - H.x) + 2 * u * (Sh.x - Mc.x), y = 2 * (1 - u) * (Mc.y - H.y) + 2 * u * (Sh.y - Mc.y), l = Math.hypot(x, y) || 1; return { x: x / l, y: y / l }; };
    const nr = u => { const q = tg(u); return { x: q.y, y: -q.x }; };            // hacia el lomo
    const q3 = (a, b, c, u) => (1 - u) * (1 - u) * a + 2 * u * (1 - u) * b + u * u * c;
    const wt = u => P.gros * q3(21, 17, 19.5, u) * (1 + 0.12 * P.puff);
    const wb = u => P.gros * q3(16, 17.5, 14.5, u) * (1 + 0.08 * P.puff);
    return { L, H, Sh, sp, tg, nr, wt, wb };
  }
  // contorno cerrado (marco del cuerpo), en sentido horario
  function contorno(Gc) {
    const pts = [], N = 12;
    for (let i = 0; i <= N; i++) { const u = i / N, P = Gc.sp(u), n = Gc.nr(u), w = Gc.wt(u); pts.push({ x: P.x + n.x * w, y: P.y + n.y * w }); }
    const cap = (u, desde, hacia, rt, sg) => {
      const P = Gc.sp(u), n = Gc.nr(u), tg = Gc.tg(u), wt = Gc.wt(u), wb = Gc.wb(u);
      const c = { x: P.x + n.x * (wt - wb) / 2, y: P.y + n.y * (wt - wb) / 2 }, rn = (wt + wb) / 2, rtt = rn * rt;
      for (let k = 1; k < 6; k++) {
        const a = lerp(desde, hacia, k / 6);
        pts.push({ x: c.x + n.x * Math.cos(a) * rn + tg.x * Math.sin(a) * rtt * sg, y: c.y + n.y * Math.cos(a) * rn + tg.y * Math.sin(a) * rtt * sg });
      }
    };
    cap(1, 0, Math.PI, 0.82, 1);                       // pecho
    for (let i = N; i >= 0; i--) { const u = i / N, P = Gc.sp(u), n = Gc.nr(u), w = Gc.wb(u); pts.push({ x: P.x - n.x * w, y: P.y - n.y * w }); }
    cap(0, Math.PI, TAU, 0.95, 1);                     // grupa
    return pts;
  }
  // pelaje: festones (pelo esponjoso) que se vuelven pinchos al erizarse
  function rutaPelo(g, pts, bump, spike, fase0 = 0, mult = null) {
    const n = pts.length;
    const V = pts.map((q, i) => {
      const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
      const tx = b.x - a.x, ty = b.y - a.y, l = Math.hypot(tx, ty) || 1, ox = ty / l, oy = -tx / l;
      const k = spike * (mult ? mult[i] : 1) * (i % 2 === 0 ? 1 : -0.3) * (0.75 + 0.5 * hash(i * 3.1 + fase0));
      return { x: q.x + ox * k, y: q.y + oy * k };
    });
    g.beginPath(); g.moveTo(V[0].x, V[0].y);
    for (let i = 0; i < n; i++) {
      const a = V[i], b = V[(i + 1) % n], tx = b.x - a.x, ty = b.y - a.y, l = Math.hypot(tx, ty) || 1;
      const m = { x: (a.x + b.x) / 2 + ty / l * bump, y: (a.y + b.y) / 2 - tx / l * bump };
      g.quadraticCurveTo(m.x, m.y, b.x, b.y);
    }
    g.closePath();
  }
  // pata de dos tramos (marco del suelo); la articulación va hacia atrás
  function pata(g, r, p, L1, L2, col, claro, ancho, oculta, garras) {
    let dx = p.x - r.x, dy = p.y - r.y, d = Math.hypot(dx, dy) || 0.001;
    const Lt = (L1 + L2) * 0.995;
    if (d > Lt) { dx *= Lt / d; dy *= Lt / d; d = Lt; }
    const e = { x: r.x + dx, y: r.y + dy };
    const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
    const ux = dx / d, uy = dy / d, k = { x: r.x + ux * a - uy * h, y: r.y + uy * a + ux * h };
    const vis = 1 - oculta;
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    if (vis > 0.01) {
      g.globalAlpha *= vis;
      g.beginPath(); g.moveTo(r.x, r.y); g.lineTo(k.x, k.y); g.lineTo(e.x, e.y);
      g.strokeStyle = GT.tinta; g.lineWidth = ancho + 2.8; g.stroke();
      g.strokeStyle = col; g.lineWidth = ancho; g.stroke();
      // raya atigrada
      g.strokeStyle = GT.osc; g.lineWidth = 2.2; g.globalAlpha *= 0.7;
      const m = mezcla(k, e, 0.4), nx = -(e.y - k.y), ny = e.x - k.x, nl = Math.hypot(nx, ny) || 1;
      g.beginPath(); g.moveTo(m.x - nx / nl * ancho * 0.45, m.y - ny / nl * ancho * 0.45); g.lineTo(m.x + nx / nl * ancho * 0.1, m.y + ny / nl * ancho * 0.1); g.stroke();
      g.globalAlpha = 1;
    }
    g.restore();
    // pata (mano)
    const da = Math.atan2(e.y - k.y, e.x - k.x);
    g.save(); g.translate(e.x, e.y); g.rotate(da - Math.PI / 2 + 1.25);
    g.beginPath(); g.ellipse(0, 0, 4.4, 6, 0, 0, TAU); g.fillStyle = claro; g.fill();
    g.lineWidth = 1.5; g.strokeStyle = GT.tinta; g.stroke();
    g.lineWidth = 0.9; g.beginPath(); g.moveTo(-1.6, 3.2); g.lineTo(-1.1, 5.4); g.moveTo(1.4, 3.2); g.lineTo(1.1, 5.4); g.stroke();
    if (garras > 0.02) {
      g.globalAlpha = clamp(garras); g.strokeStyle = "#fffaf0"; g.lineWidth = 1.1;
      for (const x of [-2.4, 0, 2.4]) { g.beginPath(); g.moveTo(x, 5.6); g.quadraticCurveTo(x + 0.4, 8.4, x - 1.3, 9); g.stroke(); }
    }
    g.restore();
    return { k, e };
  }
  // cola (marco del cuerpo)
  function puntosCola(P, Gc, t) {
    const n = 12, Lc = 64 * (0.9 + 0.1 * P.len), r0 = { x: Gc.H.x - 14 * P.gros, y: Gc.H.y - 6 * P.gros };
    const pts = [r0]; let x = r0.x, y = r0.y;
    for (let i = 1; i <= n; i++) {
      const u = i / n;
      const a = P.ca + P.cc * Math.pow(u, 1.2) + P.cw * Math.sin(t * P.cf - u * 4.2) * u * 2.2;
      x += Math.cos(a) * Lc / n; y += Math.sin(a) * Lc / n;
      pts.push({ x, y });
    }
    return pts;
  }
  function dibCola(g, pts, P, t) {
    const n = pts.length - 1, puff = P.cp;
    const w = u => (7.2 - 2.2 * u) * (1 + 1.3 * puff) * (u > 0.94 ? 0.85 : 1);
    // contorno de la cola (con pelo)
    const izq = [], der = [];
    for (let i = 0; i <= n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n, i + 1)], tx = b.x - a.x, ty = b.y - a.y, l = Math.hypot(tx, ty) || 1;
      const ww = w(i / n); izq.push({ x: pts[i].x + ty / l * ww, y: pts[i].y - tx / l * ww }); der.push({ x: pts[i].x - ty / l * ww, y: pts[i].y + tx / l * ww });
    }
    const ult = pts[n], pen = pts[n - 1], dl = Math.hypot(ult.x - pen.x, ult.y - pen.y) || 1;
    const punta = { x: ult.x + (ult.x - pen.x) / dl * w(1) * 0.9, y: ult.y + (ult.y - pen.y) / dl * w(1) * 0.9 };
    const ruta = [...izq, punta, ...der.slice().reverse()];
    g.save();
    rutaPelo(g, ruta, 1.2 * (1 - puff), 6 * puff, 7);
    g.fillStyle = GT.base; g.fill();
    g.save(); g.clip();
    // anillos
    g.lineCap = "butt"; g.strokeStyle = GT.osc;
    for (let k = 1; k <= 5; k++) {
      const u = k / 6, i = Math.round(u * n), a = pts[Math.max(0, i - 1)], b = pts[Math.min(n, i + 1)];
      const tx = b.x - a.x, ty = b.y - a.y, l = Math.hypot(tx, ty) || 1, ww = w(i / n) * 1.6;
      g.lineWidth = 3.4; g.beginPath(); g.moveTo(pts[i].x + ty / l * ww, pts[i].y - tx / l * ww); g.lineTo(pts[i].x - ty / l * ww, pts[i].y + tx / l * ww); g.stroke();
    }
    // punta más oscura
    g.fillStyle = GT.osc; g.beginPath(); g.arc(ult.x, ult.y, w(1) * 1.4, 0, TAU); g.fill();
    g.restore();
    rutaPelo(g, ruta, 1.2 * (1 - puff), 6 * puff, 7);
    g.lineWidth = 1.9; g.strokeStyle = GT.tinta; g.lineJoin = "round"; g.stroke();
    g.restore();
  }
  // cabeza (marco de la cabeza: centro en el origen, mira hacia +x)
  function dibCabezaGato(g, P, t) {
    const k3 = 1 - P.frontal, ob = P.oreja, pk = P.perk;
    // orejas
    const oreja = (bx, by, ang, h, cerca) => {
      g.save(); g.translate(bx, by); g.rotate(ang); g.scale(1, 1 - 0.42 * ob);
      g.beginPath(); g.moveTo(-7.5, 3); g.quadraticCurveTo(-4, -h * 0.6, 0.5, -h); g.quadraticCurveTo(4.5, -h * 0.55, 7.5, 3); g.closePath();
      g.fillStyle = cerca ? GT.base : GT.lejos; g.fill(); g.lineWidth = 1.8; g.strokeStyle = GT.tinta; g.lineJoin = "round"; g.stroke();
      g.beginPath(); g.moveTo(-4, 2); g.quadraticCurveTo(-2.2, -h * 0.45, 0.4, -h * 0.72); g.quadraticCurveTo(2.6, -h * 0.4, 4, 2); g.closePath();
      g.fillStyle = GT.oreja; g.fill();
      g.strokeStyle = "rgba(255,240,225,0.9)"; g.lineWidth = 0.9;
      g.beginPath(); g.moveTo(-1.5, 1); g.lineTo(-0.5, -h * 0.4); g.moveTo(1.2, 1); g.lineTo(1.4, -h * 0.35); g.stroke();
      g.restore();
    };
    const ecx = 3.2 * k3;
    oreja(-9 + 1.5 * k3, -10.5, -0.32 - 0.95 * ob + 0.2 * pk - 0.12 * P.frontal, 15, false);
    oreja(9 + 3.5 * k3, -11.2, 0.3 + 0.2 * k3 - 0.85 * ob + 0.15 * pk + 0.12 * P.frontal, 15.5, true);
    // cabeza con carrillos de pelo
    const pts = [];
    for (let i = 0; i < 26; i++) {
      const a = i / 26 * TAU, mof = Math.max(0, Math.sin(a)) * (0.6 + 0.4 * Math.abs(Math.cos(a)));
      const rx = 19.5 + 2.6 * mof, ry = 16.5 + 1.5 * mof;
      pts.push({ x: ecx * 0.3 + Math.cos(a) * rx, y: Math.sin(a) * ry + 1 });
    }
    rutaPelo(g, pts, 0.9, 1.6 * Math.max(0.25, P.puff), 3);
    g.fillStyle = GT.base; g.fill();
    g.save(); g.clip();
    // rayas de la frente (M) y de los carrillos
    g.strokeStyle = GT.osc; g.lineCap = "round"; g.lineWidth = 2.6;
    const fx = ecx + 2;
    for (const [x0, l] of [[-5.5, 7], [0, 9], [5.5, 7]]) { g.beginPath(); g.moveTo(fx + x0 * 0.9, -16.5); g.quadraticCurveTo(fx + x0, -13, fx + x0 * 0.8, -16.5 + l); g.stroke(); }
    g.lineWidth = 2.2;
    for (const y of [3, 7.5]) { g.beginPath(); g.moveTo(-20, y); g.quadraticCurveTo(-15, y - 1.5, -11 + 3 * k3, y + 0.5); g.stroke();
      g.beginPath(); g.moveTo(22, y); g.quadraticCurveTo(18, y - 1.5, 15 + 3 * k3, y + 0.5); g.stroke(); }
    // hocico y barbilla claros
    const hx = 9 * k3;
    g.fillStyle = GT.claro;
    g.beginPath(); g.ellipse(hx - 4, 7.5, 6.5, 5.2, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(hx + 4, 7.5, 6.5, 5.2, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(hx, 13.5, 7.5, 4.5, 0, 0, TAU); g.fill();
    g.restore();
    rutaPelo(g, pts, 0.9, 1.6 * Math.max(0.25, P.puff), 3);
    g.lineWidth = 1.9; g.strokeStyle = GT.tinta; g.lineJoin = "round"; g.stroke();
    // ojos
    const ojo = (cx, cy, esc, o) => {
      const rx = 5.4 * esc, ry = 6.4 * esc;
      if (o < 0.07) {
        const s = lerp(1, -1, P.feliz);
        g.strokeStyle = GT.tinta; g.lineWidth = 1.9; g.lineCap = "round";
        g.beginPath(); g.moveTo(cx - rx, cy + 1); g.quadraticCurveTo(cx, cy + 1 + ry * 0.85 * s, cx + rx, cy + 1); g.stroke();
        return;
      }
      g.save();
      g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU); g.fillStyle = GT.iris; g.fill();
      g.save(); g.clip();
      g.fillStyle = GT.irisOsc; g.globalAlpha = 0.5; g.beginPath(); g.ellipse(cx, cy - ry * 0.75, rx * 1.2, ry * 0.65, 0, 0, TAU); g.fill(); g.globalAlpha = 1;
      const px = cx + P.mirX * rx * 0.38, py = cy + P.mirY * ry * 0.3;
      g.fillStyle = GT.pupila; g.beginPath(); g.ellipse(px, py, rx * (0.16 + 0.66 * P.pupila), ry * 0.84, 0, 0, TAU); g.fill();
      g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(px + rx * 0.3, py - ry * 0.38, rx * 0.26, ry * 0.2, 0, 0, TAU); g.fill();
      g.beginPath(); g.arc(px - rx * 0.3, py + ry * 0.38, rx * 0.1, 0, TAU); g.fill();
      const ly = cy - ry + 2 * ry * (1 - o);
      if (o < 0.995) { g.fillStyle = GT.base; g.fillRect(cx - rx * 1.4, cy - ry * 1.5, rx * 2.8, ly - (cy - ry * 1.5)); }
      g.restore();
      g.strokeStyle = GT.tinta; g.lineWidth = 1.7;
      if (o >= 0.995) { g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU); g.stroke(); }
      else {
        g.save(); g.beginPath(); g.rect(cx - rx * 2, ly, rx * 4, ry * 3); g.clip(); g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU); g.stroke(); g.restore();
        const yy = clamp((ly - cy) / ry, -1, 1), hw = rx * Math.sqrt(1 - yy * yy);
        g.lineWidth = 2; g.beginPath(); g.moveTo(cx - hw - 0.8, ly); g.quadraticCurveTo(cx, ly + 1.2, cx + hw + 0.8, ly); g.stroke();
      }
      g.restore();
    };
    ojo(-6.2 + 7.4 * k3, -2.5, 1, P.ojoC);
    ojo(6.2 + 7.6 * k3, -2.5, 1 - 0.16 * k3, P.ojoL);
    // nariz y boca
    const nx = 10 * k3, ny = 4.2;
    const b = P.boca;
    if (b > 0.03) {
      g.save(); g.translate(nx, ny + 3.2);
      g.beginPath(); g.moveTo(-6 * b - 1, 0); g.quadraticCurveTo(0, -2 * b, 6 * b + 1, 0); g.quadraticCurveTo(5 * b, 9 * b + 1, 0, 10 * b + 1); g.quadraticCurveTo(-5 * b, 9 * b + 1, -6 * b - 1, 0); g.closePath();
      g.fillStyle = GT.boca; g.fill();
      g.save(); g.clip();
      g.fillStyle = GT.lengua; g.beginPath(); g.ellipse(0, 9 * b, 4.5 * b, 3 * b, 0, 0, TAU); g.fill();
      g.restore();
      g.fillStyle = "#fffdf6"; g.strokeStyle = GT.tinta; g.lineWidth = 0.8;
      for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 5 * b, 0.2); g.lineTo(s * 3.2 * b, 4.6 * b); g.lineTo(s * 1.9 * b, 0.4); g.closePath(); g.fill(); g.stroke(); }
      g.lineWidth = 1.6; g.beginPath(); g.moveTo(-6 * b - 1, 0); g.quadraticCurveTo(0, -2 * b, 6 * b + 1, 0); g.quadraticCurveTo(5 * b, 9 * b + 1, 0, 10 * b + 1); g.quadraticCurveTo(-5 * b, 9 * b + 1, -6 * b - 1, 0); g.closePath(); g.stroke();
      g.restore();
    } else {
      g.strokeStyle = GT.tinta; g.lineWidth = 1.4; g.lineCap = "round";
      g.beginPath(); g.moveTo(nx, ny + 2); g.lineTo(nx, ny + 4.2);
      g.moveTo(nx - 3.6, ny + 4.6); g.quadraticCurveTo(nx - 1.8, ny + 6.8, nx, ny + 4.2); g.quadraticCurveTo(nx + 1.8, ny + 6.8, nx + 3.6, ny + 4.6); g.stroke();
    }
    if (P.lengua > 0.02) {
      g.fillStyle = GT.lengua; g.strokeStyle = GT.tinta; g.lineWidth = 0.9;
      g.beginPath(); g.ellipse(nx + 0.5, ny + 6.6 + 2 * P.lengua, 2.6, 2.4 * P.lengua + 0.3, 0, 0, TAU); g.fill(); g.stroke();
    }
    g.fillStyle = GT.nariz; g.strokeStyle = GT.tinta; g.lineWidth = 1.1;
    g.beginPath(); g.moveTo(nx - 2.8, ny - 1); g.quadraticCurveTo(nx, ny - 2.2, nx + 2.8, ny - 1); g.quadraticCurveTo(nx + 1, ny + 2.2, nx, ny + 2.2); g.quadraticCurveTo(nx - 1, ny + 2.2, nx - 2.8, ny - 1); g.closePath(); g.fill(); g.stroke();
    // bigotes
    g.strokeStyle = "rgba(255,250,240,0.95)"; g.lineWidth = 0.8;
    const tw = 0.06 * Math.sin(t * 3.7);
    for (const [s, y0, a0] of [[-1, 4.5, -0.12], [-1, 6, 0.05], [-1, 7.5, 0.2], [1, 4.5, -0.12], [1, 6, 0.05], [1, 7.5, 0.2]]) {
      const bx = nx + s * 5, a = (s < 0 ? Math.PI - a0 : a0) + tw * s, L = s < 0 ? 15 * (0.6 + 0.4 * P.frontal + 0.4 * (1 - k3)) : 17;
      g.beginPath(); g.moveTo(bx, ny + y0 - 3); g.quadraticCurveTo(bx + Math.cos(a) * L * 0.5, ny + y0 - 3 + Math.sin(a) * L * 0.5 - 1, bx + Math.cos(a) * L, ny + y0 - 3 + Math.sin(a) * L + 1); g.stroke();
    }
  }
  // dibuja el gato completo
  function dibGato(g, P, t) {
    const Gc = geoGato(P), ca = Math.cos(P.a), sa = Math.sin(P.a);
    const B = q => ({ x: q.x * ca - q.y * sa, y: q.x * sa + q.y * ca });
    g.save();
    g.translate(P.x + (P.vx || 0), P.y + (P.vy || 0));
    g.scale(P.dk * P.s, P.s); g.rotate(P.g);
    const oc = clamp(P.loaf);
    const rFc = B({ x: Gc.Sh.x - 4, y: 8 }), rFl = B({ x: Gc.Sh.x - 10, y: 7 }), rHc = B({ x: Gc.H.x + 6, y: 7 }), rHl = B({ x: Gc.H.x, y: 6 });
    // patas del otro lado
    pata(g, rHl, { x: P.hfx, y: P.hfy }, 16, 18, GT.lejos, GT.lejosClaro, 8.5, oc, P.garras);
    pata(g, rFl, { x: P.ffx, y: P.ffy }, 15.5, 15.5, GT.lejos, GT.lejosClaro, 7.5, oc, P.garras);
    const cola = puntosCola(P, Gc, t);
    g.save(); g.rotate(P.a);
    if (P.cdel < 0.5) dibCola(g, cola, P, t);
    // cuerpo
    const pts = contorno(Gc), MULT = pts.map((q, i) => i <= 12 ? 1 : i <= 17 ? 0.4 : i <= 30 ? 0.55 : 0.9);
    rutaPelo(g, pts, 1.7 * (1 - P.puff), 7.5 * P.puff, 0, MULT);
    g.fillStyle = GT.base; g.fill();
    g.save(); g.clip();
    // tripa y pecho claros
    g.strokeStyle = GT.claro; g.lineCap = "round"; g.lineWidth = 9 * P.gros;
    g.beginPath();
    for (let i = 0; i <= 8; i++) { const u = 0.2 + 0.7 * i / 8, Pp = Gc.sp(u), n = Gc.nr(u), w = Gc.wb(u) * 0.85; if (i) g.lineTo(Pp.x - n.x * w, Pp.y - n.y * w); else g.moveTo(Pp.x - n.x * w, Pp.y - n.y * w); }
    g.stroke();
    { const Pp = Gc.sp(1), n = Gc.nr(1), tg = Gc.tg(1); g.fillStyle = GT.claro; g.beginPath(); g.ellipse(Pp.x + tg.x * 9 - n.x * 3, Pp.y + tg.y * 9 - n.y * 3, 11 * P.gros, 15 * P.gros, Math.atan2(tg.y, tg.x), 0, TAU); g.fill(); }
    // sombra de abajo
    g.strokeStyle = "rgba(120,50,10,0.22)"; g.lineWidth = 6;
    g.beginPath();
    for (let i = 0; i <= 10; i++) { const u = i / 10, Pp = Gc.sp(u), n = Gc.nr(u), w = Gc.wb(u) + 2; if (i) g.lineTo(Pp.x - n.x * w, Pp.y - n.y * w); else g.moveTo(Pp.x - n.x * w, Pp.y - n.y * w); }
    g.stroke();
    // rayas atigradas del lomo
    g.fillStyle = GT.osc;
    for (const [u, l] of [[0.1, 0.8], [0.27, 0.95], [0.44, 0.9], [0.61, 0.85], [0.78, 0.6]]) {
      const Pp = Gc.sp(u), n = Gc.nr(u), tg = Gc.tg(u), w = Gc.wt(u);
      const a = { x: Pp.x + n.x * (w + 4), y: Pp.y + n.y * (w + 4) }, b = { x: Pp.x + n.x * w * (1 - l) - tg.x * 3, y: Pp.y + n.y * w * (1 - l) - tg.y * 3 };
      g.beginPath(); g.moveTo(a.x - tg.x * 3.6, a.y - tg.y * 3.6); g.quadraticCurveTo((a.x + b.x) / 2 - tg.x * 3.5, (a.y + b.y) / 2 - tg.y * 3.5, b.x, b.y);
      g.quadraticCurveTo((a.x + b.x) / 2 + tg.x * 0.5, (a.y + b.y) / 2 + tg.y * 0.5, a.x + tg.x * 3.6, a.y + tg.y * 3.6); g.closePath(); g.fill();
    }
    g.restore();
    rutaPelo(g, pts, 1.7 * (1 - P.puff), 7.5 * P.puff, 0, MULT);
    g.lineWidth = 2; g.strokeStyle = GT.tinta; g.lineJoin = "round"; g.stroke();
    // anca de este lado
    { const c = { x: Gc.H.x + 7, y: Gc.H.y + 5 }, rx = 14.5 * P.gros, ry = 13 * P.gros;
      g.beginPath(); g.ellipse(c.x, c.y, rx, ry, -0.2, 0, TAU); g.fillStyle = GT.base; g.fill();
      g.save(); g.clip(); g.strokeStyle = GT.osc; g.lineWidth = 3; g.lineCap = "round";
      g.beginPath(); g.moveTo(c.x - rx * 0.5, c.y - ry * 0.9); g.quadraticCurveTo(c.x + 2, c.y - 2, c.x - 2, c.y + ry * 0.4); g.stroke();
      g.beginPath(); g.moveTo(c.x + rx * 0.2, c.y - ry * 0.95); g.quadraticCurveTo(c.x + rx * 0.7, c.y - 3, c.x + rx * 0.4, c.y + ry * 0.2); g.stroke();
      g.restore();
      g.strokeStyle = GT.tinta; g.lineWidth = 1.8; g.beginPath(); g.ellipse(c.x, c.y, rx, ry, -0.2, -0.45 * Math.PI, 0.75 * Math.PI); g.stroke(); }
    g.restore();
    // patas de este lado
    pata(g, rHc, { x: P.hnx, y: P.hny }, 16, 18, GT.base, GT.claro, 9, oc, P.garras);
    // gorguera del pecho
    g.save(); g.rotate(P.a);
    { const c = { x: Gc.Sh.x + 6, y: 6 }, pts2 = [];
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; pts2.push({ x: c.x + Math.cos(a) * 9 * P.gros, y: c.y + Math.sin(a) * 11 * P.gros }); }
      rutaPelo(g, pts2, 1.4, 1.5, 11); g.fillStyle = GT.claro; g.fill(); }
    g.restore();
    if (!P.pataDel) pata(g, rFc, { x: P.fnx, y: P.fny }, 15.5, 15.5, GT.base, GT.claro, 8, oc, P.garras);
    g.save(); g.rotate(P.a);
    if (P.cdel >= 0.5) dibCola(g, cola, P, t);
    // cabeza
    g.save(); g.translate(Gc.Sh.x + P.hx, Gc.Sh.y + P.hy); g.rotate(P.ha); g.scale(P.hs, P.hs);
    dibCabezaGato(g, P, t);
    g.restore();
    g.restore();
    // zarpazo: la pata de este lado pasa por delante de la cara
    if (P.pataDel) pata(g, rFc, { x: P.fnx, y: P.fny }, 15.5, 15.5, GT.base, GT.claro, 8, oc, Math.max(P.garras, 0.8));
    // ronroneo: rayitas que vibran alrededor del lomo
    if (P.ron > 0.02) {
      g.save(); g.rotate(P.a);
      g.strokeStyle = GT.tinta; g.lineCap = "round"; g.lineWidth = 1.5;
      [[0.18, 0], [0.5, 1.7], [0.82, 3.4]].forEach(([u, ph], i) => {
        const Pp = Gc.sp(u), n = Gc.nr(u), w = Gc.wt(u) + 5, ang = Math.atan2(n.y, n.x);
        const c = { x: Pp.x + n.x * w, y: Pp.y + n.y * w };
        for (let k = 0; k < 2; k++) {
          const v = 0.5 + 0.5 * Math.sin(t * 15 + ph + k * 1.6);
          g.globalAlpha = P.ron * (0.25 + 0.65 * v);
          const r = 4 + k * 4 + 1.2 * v;
          g.beginPath(); g.arc(c.x - n.x * 4, c.y - n.y * 4, r, ang - 0.55, ang + 0.55);
          g.strokeStyle = "rgba(255,248,230,0.8)"; g.lineWidth = 3.8; g.stroke();
          g.strokeStyle = GT.tinta; g.lineWidth = 1.7; g.stroke();
        }
      });
      g.restore();
      g.globalAlpha = 1;
    }
    g.restore();
  }
  // puntos del gato en pantalla
  function gatoMarco(P) {
    const cg = Math.cos(P.g), sg = Math.sin(P.g), ca = Math.cos(P.a), sa = Math.sin(P.a);
    const suelo = q => { const x = q.x * cg - q.y * sg, y = q.x * sg + q.y * cg; return { x: P.x + x * P.dk * P.s, y: P.y + y * P.s }; };
    const cuerpo = q => suelo({ x: q.x * ca - q.y * sa, y: q.x * sa + q.y * ca });
    return { suelo, cuerpo };
  }
  const lomoGato = (P, u, extra = 0) => { const Gc = geoGato(P), Pp = Gc.sp(u), n = Gc.nr(u), w = Gc.wt(u) + extra; return gatoMarco(P).cuerpo({ x: Pp.x + n.x * w, y: Pp.y + n.y * w }); };
  const cabezaGato = P => { const Gc = geoGato(P); return gatoMarco(P).cuerpo({ x: Gc.Sh.x + P.hx, y: Gc.Sh.y + P.hy }); };

  /* =====================================================================================
   * MARTA (sentada en el banco del mirador, mira a la izquierda)
   * ===================================================================================== */
  const XM = 728, Y_PEL_M = 452, ASIENTO = Y_PEL_M + 20;
  const PEL_M = M.SUELO + (Y_PEL_M - SUELO) / SM - M.PELVIS.y;
  const TOB_M = M.SUELO - M.TOBILLO_ALTO;
  const CARAS_M = {
    tierna: E({ mx: 0.45, my: 0.7, c: 0.55, h: 0.35, sd: 8, gd: 0.04, si: 8, gi: 0.04, sonr: 0.55, ancho: 0.9 }),
    miraG: E({ mx: 0.9, my: 0.1, c: 0.25, sd: 10, si: 10, sonr: 0.6, ancho: 0.95 }),
    cuidado: E({ mx: 0.9, my: 0.25, c: 0.1, sd: 16, gd: 0.14, si: 16, gi: 0.14, abre: 0, ancho: 0.7, sonr: 0.05 }),
    susto: E({ mx: 0.6, my: 0.4, iris: 0.82, c: 0, sd: 24, gd: 0.18, si: 24, gi: 0.18, abre: 14, ancho: 0.7, sonr: -0.1 }),
    risa: E({ mx: 0.5, my: 0.2, c: 1, h: 1, sd: 14, gd: 0.06, si: 14, gi: 0.06, abre: 10, ancho: 1.05, sonr: 0.85 }),
    llama: E({ mx: 0.9, my: 0.05, c: 0.32, sd: 6, gd: -0.04, si: 18, gi: 0.12, abre: 0, sonr: 0.7, ancho: 1 }),
    susurra: E({ mx: -0.8, my: 0.0, c: 0.3, sd: 12, gd: 0.04, si: 18, gi: 0.1, abre: 4, ancho: 0.6, sonr: 0.45 }),
    saca: E({ mx: 0.4, my: 0.75, c: 0.35, sd: 8, si: 10, sonr: 0.55 }),
    ofrece: E({ mx: 0.9, my: 0.15, c: 0.28, sd: 12, si: 12, abre: 3, sonr: 0.75, ancho: 1 }),
    emocion: E({ mx: 0.7, my: 0.6, c: 0.15, sd: 16, si: 16, abre: 6, ancho: 0.8, sonr: 0.7 }),
    ohh: E({ mx: 0.85, my: -0.25, iris: 0.9, c: 0, sd: 22, gd: 0.1, si: 22, gi: 0.1, abre: 12, ancho: 0.55, sonr: 0.2 }),
    mira: E({ mx: 0.9, my: -0.35, c: 0.25, sd: 14, si: 14, sonr: 0.75, ancho: 1 }),
    camara: E({ mx: -0.85, my: 0, c: 0.3, h: 0.4, sd: 10, si: 12, abre: 6, ancho: 1, sonr: 0.85 })
  };
  const GUION_CARA_M = [
    [T.derrite0 + 0.3, T.derrite0 + 0.6, "miraG"], [T.derrite1 - 0.2, T.derrite1, "tierna"], [T.paso0, T.paso0 + 0.3, "miraG"],
    [T.agacha1, T.agacha1 + 0.2, "cuidado"], [T.eriza, T.eriza + 0.08, "susto"], [T.mRie0, T.mRie0 + 0.15, "risa"],
    [T.llama0, T.llama0 + 0.2, "llama"], [T.susurro0, T.susurro0 + 0.15, "susurra"], [T.bolsillo0, T.bolsillo0 + 0.2, "saca"],
    [T.saca1, T.saca1 + 0.15, "ofrece"], [T.caza0, T.caza0 + 0.3, "emocion"], [T.abalanza + 0.15, T.abalanza + 0.3, "ohh"],
    [T.aCabeza1, T.aCabeza1 + 0.3, "mira"], [T.mRie2, T.mRie2 + 0.15, "risa"], [T.mCamara, T.mCamara + 0.25, "camara"]
  ];
  const PARP_M = [1.3, 3.2, 6.0, 7.6, 9.6, 10.9, 13.9];
  const CUERPOS_M = {
    base: { torso: 0.1, cab: 0.18, pel: 0 },
    acaricia: { torso: 0.14, cab: 0.28, pel: 0 },
    miraG: { torso: 0.06, cab: 0.05, pel: 0 },
    cuidado: { torso: -0.08, cab: -0.06, pel: 0 },
    susto: { torso: -0.12, cab: -0.12, pel: -2 },
    risa: { torso: 0.08, cab: 0.1, pel: 0 },
    susurra: { torso: 0.15, cab: 0.06, pel: 0 },
    saca: { torso: 0.12, cab: 0.2, pel: 0 },
    ofrece: { torso: 0.16, cab: 0.06, pel: 0 },
    mira: { torso: 0.06, cab: 0.02, pel: 0 }
  };
  const GUION_M = [
    [0.35, 0.7, "acaricia"], [T.derrite0 + 0.3, T.derrite0 + 0.7, "miraG"], [T.derrite1 - 0.2, T.derrite1 + 0.2, "acaricia"],
    [T.paso0 + 0.1, T.paso1, "cuidado"], [T.eriza, T.eriza + 0.12, "susto"], [T.mRie0, T.mRie0 + 0.3, "risa"],
    [T.llama0, T.llama0 + 0.3, "miraG"], [T.susurro0 - 0.1, T.susurro0 + 0.2, "susurra"], [T.bolsillo0, T.bolsillo1, "saca"],
    [T.saca1, T.ofrece1, "ofrece"], [T.toma + 0.1, T.toma + 0.5, "base"], [T.abalanza + 0.1, T.abalanza + 0.4, "mira"],
    [T.mRie2, T.mRie2 + 0.3, "risa"], [T.mCamara, T.mCamara + 0.3, "mira"]
  ];
  function poseMcuerpo(t) {
    const b = guion(GUION_M, CUERPOS_M, "base", t);
    const respira = Math.sin(t * 2.0 + 0.6);
    const rie = Math.max(dentro(t, T.mRie0, T.mRie0 + 0.12, T.mRie1 - 0.15, T.mRie1), dentro(t, T.mRie2, T.mRie2 + 0.12, T.mRie3 - 0.15, T.mRie3));
    const sacude = rie * Math.abs(Math.sin(t * 10.5));
    const p = { x: XM, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, piernas: {},
      pelvis: { x: M.PELVIS.x, y: M.PELVIS.y + PEL_M + b.pel + respira * 1.5 },
      torso: b.torso + 0.03 * sacude, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      cabeza: { ang: b.cab - 0.05 * sacude, dx: 0, dy: -3 * sacude, esc: { x: 1, y: 1 } } };
    // asiente al susurrar
    p.cabeza.ang += 0.05 * Math.sin((t - T.susurro0) * 11) * dentro(t, T.susurro0 + 0.1, T.susurro0 + 0.2, T.susurro1 - 0.15, T.susurro1);
    p.piernas.cerca = { tob: { x: M.PELVIS.x + 300, y: TOB_M }, ang: 0 };
    p.piernas.lejos = { tob: { x: M.PELVIS.x + 336, y: TOB_M - 10 }, ang: 0 };
    const e = guion(GUION_CARA_M, CARAS_M, "tierna", t);
    // habla al susurrar
    const habla = dentro(t, T.susurro0 + 0.1, T.susurro0 + 0.15, T.susurro1 - 0.1, T.susurro1);
    e.abre += habla * 4 * (0.5 + 0.5 * Math.sin(t * 23));
    p.cara = cara(e, parpadeo(t, PARP_M));
    p.pelo = { viento: 0, inercia: -1.2 * campana(t, T.eriza, T.eriza + 0.5) + 0.5 * sacude };
    return p;
  }
  // el regazo: muslo cercano (pantalla)
  const PIERNA_M = M.A.datos.piezas.pierna_cerca.largo;
  function regazo(p) {
    const cad = M.tronco(p)(M.CADERA.cerca), c = R.ik(cad, p.piernas.cerca.tob, PIERNA_M, PIERNA_M * 0.5, 80, 1, 1.03);
    const d = R.dir(c.a1), rod = { x: cad.x + d.x * PIERNA_M * 0.5 * c.estira, y: cad.y + d.y * PIERNA_M * 0.5 * c.estira };
    return { cadera: M.aPantalla(p, cad), rodilla: M.aPantalla(p, rod) };
  }

  /* =====================================================================================
   * GUILLERMO (mira a la derecha)
   * ===================================================================================== */
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const HH_G = (G.SUELO - G.PELVIS.y) * S;
  const PASOS_G = {
    cerca: [[-9, -8, 340], [T.paso0, T.paso0 + 0.26, 484, 22], [T.salto0, T.salto1, 364, 0], [T.gAcerca0, T.gAcerca0 + 0.22, 448, 18], [T.gAtras0, T.gAtras0 + 0.22, 372, 18]],
    lejos: [[-9, -8, 382], [T.paso0 + 0.22, T.paso0 + 0.48, 526, 20], [T.salto0, T.salto1, 404, 0], [T.gAcerca0 + 0.17, T.gAcerca0 + 0.4, 492, 16], [T.gAtras0 + 0.18, T.gAtras0 + 0.42, 412, 16]]
  };
  const CARAS_G = {
    mira: E({ mx: 0.9, my: 0.15, c: 0.15, sd: 6, si: 8, sonr: 0.3, ancho: 0.95 }),
    derrite: E({ mx: 0.9, my: 0.35, c: 0.62, h: 0.75, sd: 18, gd: 0.18, si: 18, gi: 0.18, abre: 4, ancho: 0.75, sonr: 0.7, rub: 0.5 }),
    decide: E({ mx: 0.9, my: 0.3, c: 0.25, sd: 4, gd: -0.06, si: 12, gi: 0.06, abre: 0, ancho: 0.85, sonr: 0.45 }),
    concentra: E({ mx: 0.85, my: 0.55, c: 0.3, sd: 10, gd: 0.1, si: 10, gi: 0.1, abre: 6, ancho: 0.5, sonr: 0.2, lengua: 1 }),
    susto: E({ mx: 0.9, my: 0.2, iris: 0.55, c: 0, sd: 32, gd: 0.16, si: 32, gi: 0.16, abre: 24, ancho: 0.75, sonr: -0.35 }),
    miedo: E({ mx: 0.9, my: 0.25, iris: 0.6, c: 0.05, sd: 22, gd: 0.22, si: 22, gi: 0.22, abre: 6, ancho: 0.6, sonr: -0.4 }),
    alivio: E({ mx: 0.9, my: 0.15, c: 0.4, sd: 8, gd: 0.1, si: 8, gi: 0.1, abre: 0, ancho: 0.8, sonr: 0.1 }),
    escucha: E({ mx: -0.5, my: -0.35, c: 0.3, sd: 12, gd: 0.06, si: 16, gi: 0.12, abre: 0, ancho: 0.7, sonr: 0.1 }),
    aha: E({ mx: 0.9, my: 0.1, c: 0.1, sd: 20, si: 22, abre: 8, ancho: 0.8, sonr: 0.65 }),
    juega: E({ mx: 0.8, my: 0.6, c: 0.25, sd: 10, gd: -0.05, si: 12, gi: 0.05, abre: 6, ancho: 0.95, sonr: 0.75 }),
    tieso: E({ mx: 0.9, my: 0.3, iris: 0.62, c: 0, sd: 26, gd: 0.14, si: 26, gi: 0.14, abre: 8, ancho: 0.55, sonr: -0.2 }),
    frota: E({ mx: 0.7, my: 0.1, c: 0.85, h: 0.85, sd: 14, gd: 0.12, si: 14, gi: 0.12, abre: 0, ancho: 0.8, sonr: 0.65, rub: 0.6 }),
    arriba: E({ mx: 0.4, my: -0.95, iris: 0.8, c: 0, sd: 26, gd: 0.08, si: 26, gi: 0.08, abre: 6, ancho: 0.6, sonr: 0.1, rub: 0.3 }),
    pluma: E({ mx: 0.95, my: 0.4, iris: 0.8, c: 0.05, sd: 20, gd: 0.12, si: 22, gi: 0.12, abre: 4, ancho: 0.55, sonr: 0.1, rub: 0.35 }),
    encantado: E({ mx: 0.1, my: -0.95, c: 0.2, sd: 18, gd: 0.04, si: 18, gi: 0.04, abre: 0, ancho: 0.85, sonr: 0.7, rub: 1 }),
    camara: E({ mx: -0.85, my: -0.15, c: 0.25, h: 0.25, sd: 14, si: 14, abre: 0, ancho: 0.9, sonr: 0.85, rub: 1 })
  };
  const GUION_CARA_G = [
    [T.derrite0, T.derrite0 + 0.3, "derrite"], [T.decide, T.decide + 0.2, "decide"], [T.alarga0, T.alarga0 + 0.25, "concentra"],
    [T.eriza + 0.02, T.eriza + 0.1, "susto"], [T.salto1, T.salto1 + 0.25, "miedo"], [T.relaja0, T.relaja1, "alivio"],
    [T.llama0 + 0.1, T.llama0 + 0.3, "mira"], [T.susurro0 + 0.05, T.susurro0 + 0.25, "escucha"], [T.asiente0, T.asiente0 + 0.15, "aha"],
    [T.gAtras0 + 0.2, T.gAtras0 + 0.45, "juega"], [T.abalanza + 0.04, T.abalanza + 0.12, "susto"], [T.muslo + 0.05, T.muslo + 0.25, "tieso"],
    [T.frota0, T.frota0 + 0.15, "frota"], [T.giraH1 - 0.05, T.giraH1 + 0.1, "pluma"], [T.aCabeza0, T.aCabeza0 + 0.15, "arriba"],
    [T.enrosca0, T.enrosca1, "encantado"], [T.camara, T.camara + 0.3, "camara"]
  ];
  const PARP_G = [0.3, 2.2, 5.8, 7.25, 8.4, 12.7, 13.95];
  const CUERPOS_G = {
    base: { torso: 0, cab: 0, pel: 0, px: 0, pecho: 0, cdy: 0 },
    derrite: { torso: -0.02, cab: -0.12, pel: 8, px: 0, pecho: 0.02, cdy: 2 },
    agachado: { torso: 0.38, cab: 0.2, pel: 290, px: -16, pecho: 0, cdy: 0 },
    alarga: { torso: 0.44, cab: 0.26, pel: 290, px: -12, pecho: 0, cdy: 0 },
    aire: { torso: -0.12, cab: -0.18, pel: 50, px: 0, pecho: 0.02, cdy: -4 },
    aterriza: { torso: 0.06, cab: 0.04, pel: 110, px: -4, pecho: 0, cdy: 0 },
    asustado: { torso: -0.06, cab: -0.06, pel: 6, px: 0, pecho: 0.01, cdy: -2 },
    escucha: { torso: 0.12, cab: 0.22, pel: 14, px: 0, pecho: 0, cdy: 2 },
    juega: { torso: 0.3, cab: 0.32, pel: 160, px: -14, pecho: 0, cdy: 0 },
    tieso: { torso: -0.05, cab: -0.04, pel: 0, px: 0, pecho: 0.02, cdy: -3 },
    frota: { torso: -0.04, cab: 0.08, pel: 0, px: 0, pecho: 0.01, cdy: -1 },
    gorro: { torso: -0.02, cab: -0.02, pel: 0, px: 0, pecho: 0.01, cdy: -3 }
  };
  const GUION_G = [
    [T.derrite0, T.derrite0 + 0.4, "derrite"], [T.decide, T.decide + 0.2, "base"], [T.agacha0, T.agacha1, "agachado"],
    [T.alarga0, T.alarga1, "alarga"], [T.salto0 - 0.06, T.salto0 + 0.1, "aire"], [T.salto1 - 0.04, T.salto1 + 0.08, "aterriza"],
    [T.salto1 + 0.1, T.salto1 + 0.45, "asustado"], [T.relaja0, T.relaja1, "base"], [T.susurro0 - 0.1, T.susurro0 + 0.2, "escucha"],
    [T.asiente1, T.asiente1 + 0.2, "base"], [T.gAtras0 + 0.15, T.agita0 + 0.1, "juega"], [T.abalanza, T.abalanza + 0.14, "tieso"],
    [T.frota0, T.frota0 + 0.2, "frota"], [T.aCabeza0, T.aCabeza0 + 0.2, "tieso"], [T.enrosca0, T.enrosca1, "gorro"]
  ];
  function poseGcuerpo(t) {
    const b = guion(GUION_G, CUERPOS_G, "base", t);
    const fc = pie(PASOS_G.cerca, t), fl = pie(PASOS_G.lejos, t);
    const respira = Math.sin(t * 2.25);
    const xF = (fc.x + fl.x) / 2;
    const px = xF + b.px;
    const alza = Math.max(fc.alza, fl.alza);
    // salto hacia atrás
    const us = fase(t, T.salto0, T.salto1), vuelo = us > 0 && us < 1 ? Math.sin(Math.PI * us) : 0;
    const sube = 52 * vuelo;
    // quieto, sin atreverse a respirar (cuando el gato está encima)
    const quieto = tramo(t, T.muslo, T.muslo + 0.3);
    const p = { x: px, xF, suelo: SUELO - sube, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true, piernas: {},
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y - 0.25 * alza / S + b.pel + respira * 2.5 * (1 - 0.7 * quieto) },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 * (1 - 0.7 * quieto) + b.pecho },
      cabeza: { ang: b.cab, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } } };
    // asiente
    p.cabeza.ang += 0.09 * Math.sin((t - T.asiente0) * 15) * campana(t, T.asiente0, T.asiente1);
    // se derrite: la cabeza se ladea
    p.cabeza.ang -= 0.08 * dentro(t, T.derrite0, T.derrite0 + 0.4, T.derrite1 - 0.2, T.derrite1 + 0.1);
    // da un respingo al erizarse el gato
    p.cabeza.ang -= 0.14 * campana(t, T.eriza, T.salto0 + 0.1);
    // tiembla de miedo
    const tiembla = dentro(t, T.salto1, T.salto1 + 0.1, T.relaja0, T.relaja1);
    p.torso += 0.01 * tiembla * Math.sin(t * 47); p.cabeza.ang += 0.012 * tiembla * Math.sin(t * 53);
    const pieG = (f, lado) => ({ tob: { x: G.PELVIS.x + (f.x - px) / S, y: TOB_G - (lado === "lejos" ? 12 : 0) - f.alza / S - 120 * vuelo }, ang: -0.22 * Math.sin(Math.PI * f.u) * (f.alza > 0.5 ? 1 : 0) + 0.3 * vuelo });
    p.piernas.cerca = pieG(fc, "cerca"); p.piernas.lejos = pieG(fl, "lejos");
    const e = guion(GUION_CARA_G, CARAS_G, "mira", t);
    // al jugar con la caña sigue la pluma con la mirada
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.sudor = Math.max(dentro(t, T.salto1, T.salto1 + 0.2, T.relaja0, T.relaja1), dentro(t, T.muslo, T.muslo + 0.2, T.frota0, T.frota0 + 0.2) * 0.8);
    p.rojo = 0;
    p.sobresalto = campana(t, T.eriza + 0.02, T.salto1 + 0.25);
    return p;
  }

  /* =====================================================================================
   * LA CAÑA CON PLUMA
   * ===================================================================================== */
  const CANA = 118, CUERDA = 45;
  // ángulo de la caña (pantalla) y por dónde se agarra (0 = mango, 1 = punta)
  function canaMarta(t) {
    const th = lerp(-Math.PI / 2 - 0.15, -0.08, suave(fase(t, T.bolsillo1 + 0.05, T.ofrece1)));
    return { th, u: 0.86 };
  }
  function canaGuillermo(t) {
    let th = -0.08;
    th = lerpAng(th, 1.12, suave(fase(t, T.toma + 0.08, T.gAtras1)));
    const agita = dentro(t, T.agita0, T.agita0 + 0.2, T.abalanza - 0.05, T.abalanza + 0.02);
    th += agita * (0.2 * Math.sin((t - T.agita0) * 9.5) + 0.1 * Math.sin((t - T.agita0) * 15.3 + 1));
    th = lerpAng(th, -1.1, salida(fase(t, T.abalanza, T.abalanza + 0.22)));
    th += 0.05 * Math.sin((t - T.muslo) * 33) * dentro(t, T.muslo, T.muslo + 0.1, T.frota0, T.frota0 + 0.2);
    // la baja despacio, girándola hacia delante hasta que apunta al suelo
    th = lerp(th, 1.15, suave(fase(t, T.baja0, T.baja1)));
    return { th, u: 0.08 };
  }
  // la pluma cuelga de la punta: péndulo amortiguado + retraso del movimiento
  function pluma(tip, tipAtras, t, sobreSuelo) {
    let phi = 0;
    for (const [t0, A, w] of [[T.golpe1, -0.45, 9], [T.golpe2, -0.4, 9], [T.abalanza + 0.12, -0.9, 7.5], [T.zarpa1, 0.7, 8.5], [T.zarpa2, -0.6, 8.5], [T.baja0 + 0.1, 0.25, 6]]) {
      const v = t - t0; if (v > 0) phi += A * Math.exp(-v * 3.2) * Math.sin(v * w);
    }
    const lag = { x: (tipAtras.x - tip.x) * 0.9, y: 0 };
    let q = { x: tip.x + Math.sin(phi) * CUERDA + lag.x, y: tip.y + Math.cos(phi) * CUERDA };
    const d = Math.hypot(q.x - tip.x, q.y - tip.y) || 1;
    if (d > CUERDA) q = { x: tip.x + (q.x - tip.x) / d * CUERDA, y: tip.y + (q.y - tip.y) / d * CUERDA };
    let enSuelo = false;
    if (q.y > sobreSuelo) { q.y = sobreSuelo; enSuelo = true; }
    return { x: q.x, y: q.y, enSuelo, phi };
  }

  /* =====================================================================================
   * EL GATO: postura según el guion
   * ===================================================================================== */
  function formaGato(t) {
    // secuencia de formas
    const L = [
      [T.ojo1, T.ojos, "dormido"],
      [T.eriza, T.eriza + 0.12, "erizado", salida], [T.desinfla0, T.desinfla1, "sentado"],
      [T.caza0, T.caza0 + 0.3, "cazando"], [T.saltaG0, T.saltaG0 + 0.1, "salto"], [T.saltaG1 - 0.05, T.saltaG1 + 0.08, "cazando"],
      [T.abalanza, T.abalanza + 0.08, "salto"], [T.muslo - 0.06, T.muslo + 0.06, "trepa"],
      [T.hombro - 0.08, T.hombro + 0.1, "sentado"], [T.aCabeza0, T.aCabeza0 + 0.08, "salto"], [T.aCabeza1 - 0.05, T.aCabeza1 + 0.08, "dePie"],
      [T.amasa1 - 0.05, T.enrosca1, "gorro"]
    ];
    let f = guion(L, FORMAS, "dormido", t);
    return f;
  }

  /* =====================================================================================
   * POSE DE TODO EN UN INSTANTE
   * ===================================================================================== */
  function canaDe(rig, p, c, deM) {
    const m = p.manoLejos, hp = rig.aPantalla(p, { x: m.x, y: m.y }), d = { x: Math.cos(c.th), y: Math.sin(c.th) };
    const mango = { x: hp.x - d.x * CANA * c.u, y: hp.y - d.y * CANA * c.u }, punta = { x: hp.x + d.x * CANA * (1 - c.u), y: hp.y + d.y * CANA * (1 - c.u) };
    return { deM, hp, d, mango, punta, th: c.th, u: c.u };
  }
  // dónde coge Guillermo la caña (el mango en el instante del relevo; Marta está quieta)
  let MANGO = null;
  function mangoRelevo() {
    if (!MANGO) {
      const t = T.toma, pm = poseMcuerpo(t), rg = regazo(pm), gato = poseGato(t, pm, null, rg);
      manosM(pm, t, gato, rg);
      const c = canaDe(M, pm, canaMarta(t), true);
      MANGO = { x: c.mango.x + c.d.x * CANA * 0.08, y: c.mango.y + c.d.y * CANA * 0.08 };
    }
    return MANGO;
  }
  function pose(t, sinPluma) {
    const pm = poseMcuerpo(t), pg = poseGcuerpo(t);
    const rg = regazo(pm);
    const gato = poseGato(t, pm, pg, rg);
    manosM(pm, t, gato, rg);
    manosG(pg, t, gato);
    // caña y pluma
    let cana = null;
    if (t >= T.bolsillo1 + 0.04) {
      const deM = t < T.toma;
      cana = deM ? canaDe(M, pm, canaMarta(t), true) : canaDe(G, pg, canaGuillermo(t), false);
      const punta = cana.punta;
      if (!sinPluma) {
        const atras = pose(Math.max(0, t - 0.11), true).cana;
        const pa = atras ? atras.punta : punta;
        cana.pluma = pluma(punta, pa, t, SUELO - 6);
      }
    }
    // lo que lleva cada mano
    if (cana) {
      const m = cana.deM ? pm.manoLejos : pg.manoLejos;
      const rig = cana.deM ? M : G, sx = cana.deM ? -1 : 1, KV = 1 / (rig.JK * S * rig.K);
      const c = cana;
      // el palo sale del bolsillo: se recorta por encima del bolsillo
      const tapa = cana.deM && t < T.saca1 ? M.aPantalla(pm, M.tronco(pm)(M.BOLSILLO_L)).y - 4 : null;
      m.objeto = g => { g.save(); g.scale(sx * KV, KV); dibCana(g, c, tapa); g.restore(); };
    }
    if (!sinPluma) ajustaGato(gato, t, cana, pg);
    return { m: pm, g: pg, gato, cana, rg };
  }

  /* ---------- el gato en cada fase ---------- */
  const X_SUELO = 620;
  function poseGato(t, pm, pg, rg) {
    const F = formaGato(t);
    const P = Object.assign({}, F, { x: 0, y: 0, s: 1, dk: -1, g: 0, vx: 0, vy: 0 });
    // regazo: superficie del muslo
    const surf = x => { const k = clamp((x - rg.rodilla.x) / (rg.cadera.x - rg.rodilla.x)); return lerp(rg.rodilla.y, rg.cadera.y, k) - 17; };
    const xRegazo = rg.cadera.x - 50;
    // respiración del gato dormido
    const resp = Math.sin(t * 3.1);
    if (t < T.saltaG0) {
      let x = xRegazo;
      // erizado: se pone de pie y retrocede un poco
      x += 6 * tramo(t, T.eriza, T.eriza + 0.12) - 6 * tramo(t, T.desinfla0, T.desinfla1);
      x += 4 * tramo(t, T.caza0, T.caza0 + 0.3);
      P.x = x; P.y = surf(x) - P.alto;
      P.gros += 0.02 * resp * (1 - tramo(t, T.ojos, T.eriza));
      // se arquea con la caricia
      const car = Math.max(dentro(t, T.c1a + 0.2, T.c1a + 0.4, T.c1b - 0.2, T.c1b), dentro(t, T.c2a + 0.2, T.c2a + 0.4, T.c2b - 0.2, T.c2b));
      P.arch += 3 * car; P.cw += 0.05 * car;
      P.ron = clamp(tramo(t, 0.6, 1.0) * (1 - tramo(t, T.ojo1 - 0.3, T.ojo1)));
      if (P.ron > 0) { P.vx = 0.35 * Math.sin(t * 93) * P.ron; P.vy = 0.25 * Math.sin(t * 81 + 1) * P.ron; }
      // abre un ojo, luego los dos
      P.ojoC = Math.max(P.ojoC, 0.55 * tramo(t, T.ojo1, T.ojo1 + 0.08)); P.ojoL = Math.max(P.ojoL, tramo(t, T.ojos, T.ojos + 0.06) * 0.6);
      if (t > T.ojo1 && t < T.eriza) { P.pupila = 0.25; P.mirX = 0.8; P.frontal = lerp(P.frontal, 0.1, tramo(t, T.ojo1, T.ojos)); }
      // bufido: tiembla y bufa a golpes
      const bufa = dentro(t, T.eriza, T.eriza + 0.05, T.desinfla0, T.desinfla0 + 0.2);
      P.boca *= 0.75 + 0.25 * Math.abs(Math.sin((t - T.eriza) * 9));
      P.vx += 0.6 * bufa * Math.sin(t * 61); P.arch += 1.5 * bufa * Math.sin(t * 13);
      // se lame la pata
      const lame = dentro(t, T.lame0, T.lame0 + 0.2, T.lame1 - 0.2, T.lame1);
      if (lame > 0) {
        const hc = { x: geoGato(P).Sh.x + P.hx, y: P.hy };
        const hcS = { x: hc.x * Math.cos(P.a) - hc.y * Math.sin(P.a), y: hc.x * Math.sin(P.a) + hc.y * Math.cos(P.a) };
        const lam = Math.sin((t - T.lame0) * 16);
        P.fnx = lerp(P.fnx, hcS.x + 9, lame); P.fny = lerp(P.fny, hcS.y + 11 + 2 * lam, lame);
        P.ha += 0.5 * lame; P.ojoC = lerp(P.ojoC, 0, lame); P.ojoL = lerp(P.ojoL, 0, lame); P.lengua = lame * (0.5 + 0.5 * lam);
        P.hy += 4 * lame; P.hx -= 2 * lame;
      }
      // mira a Guillermo con desdén y luego la caña
      // menea el culete antes de saltar
      const menea = dentro(t, T.menea0, T.menea0 + 0.05, T.saltaG0 - 0.04, T.saltaG0);
      P.a -= 0.06 * menea * Math.sin((t - T.menea0) * 30);
      P.hny -= 3 * menea; P.hfy -= 3 * menea;
      P.cw += 0.2 * menea;
    } else if (t < T.saltaG1) {
      // salta del regazo al suelo
      const u = fase(t, T.saltaG0, T.saltaG1);
      const A = { x: xRegazo + 4, y: surf(xRegazo + 4) - P.alto }, Bp = { x: X_SUELO, y: SUELO - P.alto };
      const q = bez2(A, { x: (A.x + Bp.x) / 2 - 10, y: Math.min(A.y, Bp.y) - 70 }, Bp, u);
      P.x = q.x; P.y = q.y; P.a = lerp(-0.25, 0.45, u);
    } else if (t < T.abalanza) {
      // en el suelo: zarpazos a la pluma
      P.x = X_SUELO - 6 * tramo(t, T.saltaG1, T.golpe1) - 4 * tramo(t, T.golpe2, T.abalanza); P.y = SUELO - P.alto;
    } else {
      // se encarama a Guillermo
      gatoEnGuillermo(P, t, pg);
    }
    return P;
  }
  // puntos del cuerpo de Guillermo (pantalla)
  const gT = (p, q) => G.aPantalla(p, G.tronco(p)(q));
  const gCab = (p, q) => G.aPantalla(p, G.cabeza(p).a(q));
  function gatoEnGuillermo(P, t, pg) {
    const py = G.aPantalla(pg, { x: G.PELVIS.x, y: pg.pelvis.y }).y, px = pg.x;
    const cr = G.cabeza(pg);
    // puntos de la ruta (pantalla)
    const muslo = { x: px + 50, y: py + 52 }, pecho = { x: px + 54, y: py - 32 };
    const hombroT = gT(pg, { x: 410, y: 340 });
    const sentadoH = { x: hombroT.x + 10, y: hombroT.y - P.alto + 6 };
    const coronilla = gCab(pg, { x: 790, y: 262 });
    const angC = cr.ang;
    if (t < T.muslo) {
      // salto desde el suelo hasta el muslo
      const u = fase(t, T.abalanza, T.muslo), A = { x: X_SUELO - 10, y: SUELO - P.alto };
      const q = bez2(A, { x: (A.x + muslo.x) / 2 + 10, y: Math.min(A.y, muslo.y) - 60 }, muslo, salida(u));
      P.x = q.x; P.y = q.y; P.g = lerp(0, -Math.PI / 2 + pg.torso, suave(u)); P.dk = -1;
      return;
    }
    if (t < T.hombro) {
      // trepa: muslo → pecho → hombro
      const u1 = fase(t, T.muslo + 0.06, T.pecho), u2 = fase(t, T.pecho, T.hombro);
      let q = mezcla(muslo, pecho, suave(u1));
      q = mezcla(q, sentadoH, suave(u2));
      P.x = q.x; P.y = q.y; P.dk = -1;
      P.g = lerp(-Math.PI / 2 + pg.torso, 0, suave(fase(t, T.hombro - 0.18, T.hombro)));
      // zancadas de trepar
      const ph = (t - T.muslo) * 11, k = dentro(t, T.muslo, T.muslo + 0.08, T.hombro - 0.15, T.hombro);
      P.fnx += 7 * k * Math.sin(ph); P.ffx += 7 * k * Math.sin(ph + Math.PI);
      P.hnx += 5 * k * Math.sin(ph + 0.9); P.hfx += 5 * k * Math.sin(ph + 0.9 + Math.PI);
      P.fny -= 2 * k * Math.max(0, Math.cos(ph)); P.ffy -= 2 * k * Math.max(0, -Math.cos(ph));
      P.a += 0.05 * k * Math.sin(ph * 2);
      return;
    }
    const minDk = d => Math.abs(d) < 0.12 ? 0.12 * (d < 0 ? -1 : 1) : d;
    if (t < T.aCabeza0) {
      // sentado en el hombro: le frota la mejilla, se da la vuelta hacia la pluma y le da zarpazos
      P.x = sentadoH.x; P.y = sentadoH.y; P.dk = minDk(lerp(-1, 1, suave(fase(t, T.giraH0, T.giraH1)))); P.g = 0;
      P.x += 8 * suave(fase(t, T.giraH0, T.giraH1));
      const fr = dentro(t, T.frota0, T.frota0 + 0.08, T.frota1 - 0.08, T.frota1);
      const w = Math.sin((t - T.frota0) * 14);
      P.ha += 0.25 * fr * w - 0.1 * fr; P.hx += 3 * fr * (0.5 + 0.5 * w); P.ojoC = lerp(P.ojoC, 0, fr); P.ojoL = lerp(P.ojoL, 0, fr); P.feliz = fr;
      P.oreja = lerp(P.oreja, 0.3, fr); P.ron = fr; P.frontal = lerp(P.frontal, 0.1, fr);
      P.vx = 0.3 * Math.sin(t * 93) * fr;
      return;
    }
    // salta a la cabeza y se queda allí
    const sobre = { x: coronilla.x + Math.sin(angC) * P.alto, y: coronilla.y - Math.cos(angC) * P.alto };
    if (t < T.aCabeza1) {
      // salta del hombro a la cabeza
      const u = fase(t, T.aCabeza0, T.aCabeza1), A = { x: sentadoH.x + 8, y: sentadoH.y };
      const q = bez2(A, { x: (A.x + sobre.x) / 2 + 10, y: Math.min(A.y, sobre.y) - 44 }, sobre, suave(u));
      P.dk = 1; P.x = q.x; P.y = q.y; P.g = angC * suave(u); P.a = -0.5 * Math.sin(Math.PI * u);
      return;
    }
    // en la cabeza: zarpazos a la pluma, da dos vueltas (aplastado), amasa y se enrosca
    const tm = (T.gira0 + T.gira1) / 2, k1 = suave(fase(t, T.gira0, tm)), k2 = suave(fase(t, tm, T.gira1));
    const hund = tramo(t, T.enrosca0, T.enrosca1);
    const alto = P.alto - 7 * hund;
    P.x = coronilla.x + Math.sin(angC) * alto + 5 * Math.sin(Math.PI * fase(t, T.gira0, T.gira1)); P.y = coronilla.y - Math.cos(angC) * alto;
    P.dk = minDk(lerp(lerp(1, -1, k1), 1, k2)); P.g = Math.sign(P.dk) * angC;
    // amasa
    const am = dentro(t, T.amasa0, T.amasa0 + 0.08, T.amasa1 - 0.08, T.amasa1);
    P.fny -= 4 * am * Math.max(0, Math.sin((t - T.amasa0) * 19)); P.ffy -= 4 * am * Math.max(0, Math.sin((t - T.amasa0) * 19 + Math.PI));
    const cierra = lerp(1, 0.3, tramo(t, T.amasa0, T.amasa0 + 0.2));
    P.ojoC = Math.min(P.ojoC, cierra); P.ojoL = Math.min(P.ojoL, cierra); P.ron = Math.max(P.ron, am);
    if (P.ron > 0.02) { P.vx = 0.3 * Math.sin(t * 93) * P.ron; P.vy = 0.2 * Math.sin(t * 81) * P.ron; }
    // abre un ojo al final
    const ojo = dentro(t, T.ojoGato, T.ojoGato + 0.15, 13.95, 14.1);
    P.ojoC = Math.max(P.ojoC, 0.75 * ojo); P.mirX = -0.7; P.mirY = 0.1;
  }
  // la mirada y las zarpas van a la pluma (o al cordel)
  function ajustaGato(P, t, cana, pg) {
    if (!cana || !cana.pluma) return;
    const pl = cana.pluma;
    const hc = cabezaGato(P);
    const dx = (pl.x - hc.x) * Math.sign(P.dk), dy = pl.y - hc.y;
    // sigue la pluma con la mirada mientras caza (en el regazo y en el suelo)
    const sigue = dentro(t, T.ofrece1 - 0.1, T.ofrece1 + 0.15, T.abalanza + 0.05, T.abalanza + 0.15);
    if (sigue > 0) {
      const l = Math.hypot(dx, dy) || 1;
      P.mirX = lerp(P.mirX, clamp(dx / l * 1.2, -1, 1), sigue); P.mirY = lerp(P.mirY, clamp(dy / l * 1.2, -1, 1), sigue);
      P.ha += 0.25 * sigue * clamp(dy / 80, -1, 1);
    }
    // zarpazos en el suelo
    const gm = (t0) => campana(t, t0 - 0.1, t0 + 0.12);
    const z = Math.max(gm(T.golpe1), gm(T.golpe2));
    if (z > 0 && t > T.saltaG1 && t < T.abalanza) {
      const m = gatoMarco(P), loc = (q) => { const x = (q.x - P.x) / (P.dk * P.s), y = (q.y - P.y) / P.s; return { x, y }; };
      const obj = loc(pl);
      P.x -= 9 * z * Math.sign(P.dk) * -1;
      P.fnx = lerp(P.fnx, obj.x + 4, z); P.fny = lerp(P.fny, Math.min(obj.y, P.fny), z) - 12 * Math.sin(Math.PI * z);
      P.hy -= 4 * z; P.ha -= 0.15 * z; P.pataDel = z > 0.2; P.oreja = lerp(P.oreja, 0.3, z);
      void m;
    }
    // en la cabeza: zarpazos a la pluma, que cuelga delante de la cara de Guillermo
    const zz = Math.max(campana(t, T.zarpa1 - 0.12, T.zarpa1 + 0.1), campana(t, T.zarpa2 - 0.12, T.zarpa2 + 0.1));
    if (zz > 0 && t > T.giraH1 && t < T.aCabeza0) {
      const q = { x: pl.x - 6, y: pl.y + 2 };
      const lx = (q.x - P.x) / (P.dk * P.s), ly = (q.y - P.y) / P.s;
      const cg = Math.cos(-P.g), sg = Math.sin(-P.g), gx = lx * cg - ly * sg, gy = lx * sg + ly * cg;
      P.fnx = lerp(P.fnx, gx, zz); P.fny = lerp(P.fny, gy, zz); P.pataDel = zz > 0.2;
      P.a -= 0.25 * zz; P.mirY = lerp(P.mirY, -0.3, zz); P.pupila = lerp(P.pupila, 1, zz); P.oreja = lerp(P.oreja, 0.4, zz);
    }
    if (t > T.aCabeza0 && t < T.enrosca0) {
      // mira la pluma hasta que se va
      const l = Math.hypot(dx, dy) || 1;
      const k = dentro(t, T.giraH0 + 0.05, T.giraH1, T.aCabeza1 - 0.1, T.aCabeza1 + 0.1);
      P.mirX = lerp(P.mirX, clamp(dx / l * 1.2, -1, 1), k); P.mirY = lerp(P.mirY, clamp(dy / l * 1.2, -1, 1), k);
      P.ha += 0.35 * k * clamp(dy / 80, -1, 1);
    }
  }

  /* ---------- manos de Marta: la lejana (la de delante) acaricia, saca la caña y se ríe; la cercana, en el bolsillo ---------- */
  const DOB_ML = -1, DOB_MC = 1;
  const MU_CAR = -2.77;
  function manosM(p, t, gato, rg) {
    const lomo = u => p2 => M.aHoja(p2, lomoGato(gato, u, 3));
    const boca = (dx, dy) => p2 => { const q = M.aPantalla(p2, M.boca(p2)); return M.aHoja(p2, { x: q.x + dx, y: q.y + dy }); };
    const deHom = (dx, dy) => p2 => { const h = M.aPantalla(p2, M.tronco(p2)(M.HOMBRO)); return M.aHoja(p2, { x: h.x + dx, y: h.y + dy }); };
    const rodilla = p2 => M.aHoja(p2, { x: rg.rodilla.x + 10, y: rg.rodilla.y - 16 });
    // la caricia: el lomo de cabeza a grupa
    const caricia = (ta, tb) => (p2, tt) => M.aHoja(p2, lomoGato(gato, lerp(0.9, 0.12, suave(fase(tt, ta, tb))), 2 + 3 * Math.sin(Math.PI * fase(tt, ta, tb))));
    const sube = (u) => (p2) => M.aHoja(p2, lomoGato(gato, u, 16));
    const tr = q => p2 => M.tronco(p2)(q);
    const LL = [
      [0, 0, { en: tr(M.BOLSILLO_L), puno: 0, bolsillo: 1 }],
      [0.25, T.c1a, { en: lomo(0.9), dedos: CARICIA, mu: MU_CAR }],
      [T.c1a, T.c1b, { en: caricia(T.c1a, T.c1b), dedos: CARICIA, mu: MU_CAR }, x => x],
      [T.c1b, T.c1b + 0.08, { en: sube(0.3), dedos: CARICIA, mu: MU_CAR }],
      [T.c1b + 0.08, T.c2a, { en: lomo(0.9), dedos: CARICIA, mu: MU_CAR }],
      [T.c2a, T.c2b, { en: caricia(T.c2a, T.c2b), dedos: CARICIA, mu: MU_CAR }, x => x],
      [T.c2b, T.c2b + 0.25, { en: lomo(0.25), dedos: CARICIA, mu: MU_CAR }],
      [T.eriza, T.eriza + 0.12, { en: deHom(-34, 4), dedos: ABIERTA, mx: 0.2 }, salida],
      [T.mRie0 - 0.05, T.mRie0 + 0.18, { en: boca(-8, 6), dedos: BOCA, mx: 0.9 }],
      [T.llama0, T.llama0 + 0.22, { en: deHom(-62, 22), dedos: (tt) => mezclaD(LLAMA, Dd(0.3, 0.25, 0.1, 0.08, 0.06), 0.5 + 0.5 * Math.sin((tt - T.llama0) * 14)), mx: 0.5 }],
      [T.susurro0 - 0.06, T.susurro0 + 0.14, { en: boca(-14, 2), dedos: CUENCO, mx: 1.1 }],
      [T.bolsillo0, T.bolsillo1, { en: tr(M.BOLSILLO_L), dedos: AGARRA, puno: 1 }],
      [T.bolsillo1, T.saca1, { en: deHom(-40, 34), dedos: AGARRA }],
      [T.saca1, T.ofrece1, { en: deHom(-72, -8), dedos: AGARRA }],
      [T.toma + 0.04, T.toma + 0.42, { en: rodilla, dedos: RELAJ, mx: 0.4 }],
      [T.abalanza + 0.15, T.abalanza + 0.35, { en: boca(-6, 8), dedos: BOCA, mx: 0.9 }],
      [T.aCabeza1 + 0.1, T.aCabeza1 + 0.45, { en: rodilla, dedos: RELAJ, mx: 0.4 }],
      [T.mRie2 - 0.05, T.mRie2 + 0.2, { en: boca(-8, 6), dedos: BOCA, mx: 0.9 }],
      [T.mCamara, T.mCamara + 0.35, { en: rodilla, dedos: RELAJ, mx: 0.4 }]
    ];
    p.manoLejos = manoDe(M, p, "l", pista(LL, p, t), DOB_ML);
    p.manoCerca = manoDe(M, p, "c", { q: M.tronco(p)(M.BOLSILLO_C), mx: 0, puno: 0, fm: 1, dedos: RELAJ }, DOB_MC);
    // ¿acaricia (la mano va encima del gato)?
    p.manoEncima = t > 0.25 && t < T.eriza + 0.05;
  }

  /* ---------- manos de Guillermo ---------- */
  const R_MG = G.MUNECA_R * G.JK;
  const manoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_MG, y: m.y - Math.sin(mu) * R_MG });
  const BOLS_GC = manoDesde({ x: 131, y: 652 }, MU_BOLS), BOLS_GL = manoDesde({ x: 372, y: 648 }, MU_BOLS);
  const DOB_GL = -1, DOB_GC = -1;
  function manosG(p, t, gato) {
    const tr = q => p2 => G.tronco(p2)(q);
    const deHom = (lado, dx, dy) => p2 => { const h = G.aPantalla(p2, G.tronco(p2)(lado === "c" ? G.HOMBRO_C : G.HOMBRO)); return G.aHoja(p2, { x: h.x + dx, y: h.y + dy }); };
    const aGato = (dx, dy) => p2 => { const h = cabezaGato(gato); return G.aHoja(p2, { x: h.x + dx, y: h.y + dy }); };
    const agita = (p2, tt) => { const h = G.aPantalla(p2, G.tronco(p2)(G.HOMBRO)), w = tt - T.agita0;
      return G.aHoja(p2, { x: h.x + 44 + 12 * Math.sin(w * 9.5), y: h.y + 68 + 8 * Math.sin(w * 19 + 0.5) }); };
    const PL = [
      [0, 0, { en: tr(BOLS_GL), puno: 0, bolsillo: 1 }],
      [T.decide, T.decide + 0.3, { en: deHom("l", 48, 42), dedos: (tt) => mezclaD(ABIERTA, RELAJ, 0.5 + 0.5 * Math.sin(tt * 26)), mx: 0.3 }],
      [T.agacha0 + 0.1, T.alarga0, { en: deHom("l", 60, 30), dedos: PALMA, mx: 0.5 }],
      [T.alarga0, T.alarga1, { en: aGato(-30, -6), dedos: PALMA, mx: 0.6 }, x => suave(x)],
      [T.eriza + 0.02, T.salto0 + 0.12, { en: deHom("l", 62, -40), dedos: TENSA, mx: -0.9 }, salida],
      [T.relaja0, T.relaja1, { en: tr(BOLS_GL), puno: 0, bolsillo: 1 }],
      [T.ofrece1 - 0.14, T.toma - 0.04, { en: p2 => { const q = mangoRelevo(); return G.aHoja(p2, { x: q.x - 6, y: q.y + 8 }); }, dedos: Dd(0.9, 0.8, 0.75, 0.7, 0.65) }],
      [T.toma - 0.04, T.toma, { en: p2 => G.aHoja(p2, mangoRelevo()), dedos: AGARRA }],
      [T.toma + 0.04, T.agita0, { en: agita, dedos: AGARRA }],
      [T.abalanza, T.abalanza + 0.2, { en: deHom("l", 32, 8), dedos: AGARRA }, salida],
      [T.baja0, T.baja1, { en: deHom("l", 22, 78), dedos: AGARRA }]
    ];
    const PC = [
      [0, 0, { en: tr(BOLS_GC), puno: 0, bolsillo: 1 }],
      [T.eriza + 0.04, T.salto0 + 0.14, { en: deHom("c", 84, 4), dedos: TENSA, mx: -0.9 }, salida],
      [T.relaja0 + 0.05, T.relaja1, { en: tr(BOLS_GC), puno: 0, bolsillo: 1 }],
      [T.abalanza + 0.04, T.abalanza + 0.24, { en: deHom("c", -54, 50), dedos: TENSA, mx: 0.3 }, salida],
      [T.frota0, T.frota1, { en: deHom("c", -34, 76), dedos: Dd(0.9, 0.85, 0.8, 0.75, 0.7), mx: 0.2 }],
      [T.enrosca0, T.enrosca1 + 0.2, { en: deHom("c", -26, 84), dedos: Dd(0.9, 0.85, 0.8, 0.75, 0.7), mx: 0.3 }]
    ];
    p.manoLejos = manoDe(G, p, "l", pista(PL, p, t), DOB_GL);
    p.manoCerca = manoDe(G, p, "c", pista(PC, p, t), DOB_GC);
    // tiembla con las manos en alto
    const tiembla = dentro(t, T.salto1, T.salto1 + 0.1, T.relaja0, T.relaja1);
    p.manoLejos.x += 4 * tiembla * Math.sin(t * 41); p.manoCerca.x += 4 * tiembla * Math.sin(t * 43 + 1);
  }

  /* ---------- dibujo de la caña (en píxeles de pantalla, con origen en la mano) ---------- */
  function dibCana(g, c, tapa) {
    const a = { x: -c.d.x * CANA * c.u, y: -c.d.y * CANA * c.u }, b = { x: c.d.x * CANA * (1 - c.u), y: c.d.y * CANA * (1 - c.u) };
    g.save();
    if (tapa != null) { const yl = tapa - c.hp.y; g.beginPath(); g.rect(-400, -400, 800, 400 + yl); g.clip(); }
    g.lineCap = "round";
    g.strokeStyle = "#2a1608"; g.lineWidth = 5; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    g.strokeStyle = "#c98b4a"; g.lineWidth = 3; g.stroke();
    g.strokeStyle = "rgba(255,230,180,0.7)"; g.lineWidth = 1; g.beginPath(); g.moveTo(a.x - c.d.y * 0.8, a.y + c.d.x * 0.8); g.lineTo(b.x - c.d.y * 0.8, b.y + c.d.x * 0.8); g.stroke();
    // mango forrado
    const m0 = { x: a.x + c.d.x * 2, y: a.y + c.d.y * 2 }, m1 = { x: a.x + c.d.x * 24, y: a.y + c.d.y * 24 };
    g.strokeStyle = "#2a1608"; g.lineWidth = 7.5; g.beginPath(); g.moveTo(m0.x, m0.y); g.lineTo(m1.x, m1.y); g.stroke();
    g.strokeStyle = "#7a3fb0"; g.lineWidth = 5.4; g.stroke();
    g.restore();
  }
  // cordel y pluma (pantalla)
  function dibPluma(g, c, t) {
    const pl = c.pluma, tip = c.punta;
    const d = Math.hypot(pl.x - tip.x, pl.y - tip.y), floja = Math.max(0, CUERDA - d);
    const ctl = { x: (tip.x + pl.x) / 2 + floja * 0.25, y: Math.max(tip.y, pl.y) + floja * 0.55 };
    g.save(); g.lineCap = "round";
    g.strokeStyle = "rgba(40,25,20,0.85)"; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(tip.x, tip.y); g.quadraticCurveTo(ctl.x, ctl.y, pl.x, pl.y); g.stroke();
    // cascabel
    g.fillStyle = "#e9c247"; g.strokeStyle = "#5a3a10"; g.lineWidth = 1;
    g.beginPath(); g.arc(pl.x, pl.y, 3.4, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.8)"; g.beginPath(); g.arc(pl.x - 1, pl.y - 1.2, 1, 0, TAU); g.fill();
    // plumas
    const dir = Math.atan2(pl.y - ctl.y, pl.x - ctl.x) + (pl.enSuelo ? -1.2 : 0);
    const ondea = 0.25 * Math.sin(t * 9) + 0.6 * (pl.phi || 0);
    const col = ["#e2559b", "#9b5fd6", "#3fb6c9", "#f29a3a"];
    for (let i = 0; i < 4; i++) {
      const a = dir + (i - 1.5) * 0.34 + ondea * (0.6 + 0.2 * i), L = 22 - 2 * Math.abs(i - 1.5);
      g.save(); g.translate(pl.x, pl.y); g.rotate(a);
      g.beginPath(); g.moveTo(2, 0); g.quadraticCurveTo(L * 0.5, -5.2, L, -0.5); g.quadraticCurveTo(L * 0.55, 5.2, 2, 0); g.closePath();
      g.fillStyle = col[i]; g.fill(); g.strokeStyle = "rgba(40,20,40,0.7)"; g.lineWidth = 0.9; g.stroke();
      g.strokeStyle = "rgba(255,255,255,0.65)"; g.beginPath(); g.moveTo(3, 0); g.lineTo(L - 2, -0.4); g.stroke();
      g.restore();
    }
    g.restore();
  }

  /* =====================================================================================
   * DECORADO (se pinta una vez)
   * ===================================================================================== */
  let fondo = null;
  const PARED = "#8fae9f", PARED_OSC = "#6f8f80", ZOC = 352;
  function creaFondo() {
    const c = lienzo(1024, 600), g = c.getContext("2d");
    // pared
    const gp = g.createLinearGradient(0, 0, 1024, 0); gp.addColorStop(0, "#7f9d8f"); gp.addColorStop(0.5, PARED); gp.addColorStop(1, "#a8bfae");
    g.fillStyle = gp; g.fillRect(0, 0, 1024, 600);
    // zócalo con cuarterones
    g.fillStyle = PARED_OSC; g.fillRect(0, ZOC, 1024, 160);
    g.fillStyle = "#e9e0cc"; g.fillRect(0, ZOC - 8, 1024, 9);
    g.strokeStyle = "rgba(40,60,50,0.5)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, ZOC + 1); g.lineTo(1024, ZOC + 1); g.stroke();
    for (let x = 22; x < 1024; x += 118) {
      g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 2; g.strokeRect(x, ZOC + 20, 96, 100);
      g.strokeStyle = "rgba(30,50,40,0.35)"; g.lineWidth = 2; g.strokeRect(x + 2, ZOC + 22, 96, 100);
    }
    // rodapié
    g.fillStyle = "#e3d8c0"; g.fillRect(0, 500, 1024, 14); g.fillStyle = "rgba(60,40,20,0.3)"; g.fillRect(0, 512, 1024, 2);
    // suelo de madera
    const gs = g.createLinearGradient(0, 514, 0, 600); gs.addColorStop(0, "#9c6a42"); gs.addColorStop(1, "#7a4b2a");
    g.fillStyle = gs; g.fillRect(0, 514, 1024, 86);
    g.strokeStyle = "rgba(50,25,10,0.35)"; g.lineWidth = 1;
    for (let y = 520, i = 0; y < 600; y += 9 + i * 2.2, i++) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke();
      for (let x = (i * 137) % 220; x < 1024; x += 220) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 9 + i * 2.2); g.stroke(); } }
    // alfombra redonda trenzada
    g.save(); g.translate(470, 566);
    for (let k = 0; k < 7; k++) { g.beginPath(); g.ellipse(0, 0, 250 - k * 30, 30 - k * 3.6, 0, 0, TAU); g.fillStyle = ["#b8463a", "#efe2c4", "#c98a3a", "#efe2c4", "#7a8f6a", "#efe2c4", "#b8463a"][k]; g.fill(); }
    g.strokeStyle = "rgba(60,30,20,0.25)"; g.lineWidth = 1; g.setLineDash([3, 3]);
    for (let k = 0; k < 7; k++) { g.beginPath(); g.ellipse(0, 0, 250 - k * 30 - 4, 30 - k * 3.6 - 1, 0, 0, TAU); g.stroke(); }
    g.setLineDash([]); g.restore();
    // librería (izquierda)
    libreria(g);
    // cuadro (sol abstracto)
    g.save(); g.translate(250, 82);
    g.fillStyle = "#5a3a22"; g.fillRect(-4, -4, 98, 78); g.fillStyle = "#f2e6cc"; g.fillRect(0, 0, 90, 70);
    g.fillStyle = "#e8a04a"; g.beginPath(); g.arc(45, 42, 18, Math.PI, TAU); g.fill();
    g.fillStyle = "#7c9a8a"; g.beginPath(); g.moveTo(0, 70); g.quadraticCurveTo(30, 44, 55, 58); g.quadraticCurveTo(75, 66, 90, 52); g.lineTo(90, 70); g.closePath(); g.fill();
    g.restore();
    // mirador
    mirador(g);
    lucesFondo(g);
    return c;
  }
  function libreria(g) {
    const x0 = 26, x1 = 214, y0 = 104, y1 = 512;
    g.fillStyle = "#6b4226"; g.fillRect(x0 - 8, y0 - 12, x1 - x0 + 16, y1 - y0 + 12);
    g.fillStyle = "#3e2414"; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    const baldas = [y0, 182, 262, 342, 422, y1];
    const cols = ["#c0503a", "#3d6e8f", "#e2b552", "#5d8a5a", "#8f5aa3", "#d9824a", "#2f4f6a", "#b9a27a", "#a33f4f", "#4f8f8a"];
    let n = 0;
    for (let i = 0; i < baldas.length - 1; i++) {
      const top = baldas[i] + 6, bot = baldas[i + 1] - 4;
      let x = x0 + 6;
      while (x < x1 - 14) {
        n++;
        const w = 9 + 7 * hash(n * 1.7), h = (bot - top) * (0.62 + 0.33 * hash(n * 2.3)), inclina = hash(n * 5.1) > 0.9 && x < x1 - 40;
        if (hash(n * 3.3) > 0.88 && x < x1 - 50) {     // hueco con un jarroncito o una planta
          g.fillStyle = "#d9c7a8"; g.beginPath(); g.ellipse(x + 13, bot - 11, 9, 11, 0, 0, TAU); g.fill();
          g.fillStyle = "#5f8a4a"; for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(x + 13 + (k - 2) * 4, bot - 26 - (k % 2) * 4, 3.5, 8, (k - 2) * 0.35, 0, TAU); g.fill(); }
          x += 30; continue;
        }
        g.save();
        if (inclina) { g.translate(x, bot); g.rotate(0.22); g.translate(-x, -bot); }
        g.fillStyle = cols[n % cols.length]; g.fillRect(x, bot - h, w, h);
        g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(x + 1.5, bot - h + 2, 1.6, h - 4);
        g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(x + w - 2, bot - h, 2, h);
        g.fillStyle = "rgba(255,235,190,0.55)"; g.fillRect(x + 1, bot - h + 8, w - 2, 2); g.fillRect(x + 1, bot - 12, w - 2, 2);
        g.restore();
        x += w + (inclina ? 9 : 0.8);
      }
      g.fillStyle = "#7a4c2c"; g.fillRect(x0 - 8, baldas[i + 1] - 4, x1 - x0 + 16, 8);
      g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(x0, baldas[i + 1] + 4, x1 - x0, 3);
    }
    // planta colgante encima
    g.fillStyle = "#c97b4a"; g.fillRect(150, 70, 34, 24); g.fillStyle = "#a35f36"; g.fillRect(148, 68, 38, 6);
    g.strokeStyle = "#4f7a3c"; g.lineWidth = 2;
    for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(158 + k * 7, 92); g.quadraticCurveTo(150 + k * 9, 130 + k * 12, 160 + k * 6, 170 + k * 15); g.stroke(); }
    g.fillStyle = "#6a9a4a";
    for (let k = 0; k < 22; k++) { const u = k / 22, x = 152 + (k % 4) * 8 + 5 * Math.sin(k), y = 80 + u * 110; g.beginPath(); g.ellipse(x, y, 5, 3.2, k * 0.7, 0, TAU); g.fill(); }
  }
  const VX0 = 586, VY0 = 64, VY1 = 424;
  function mirador(g) {
    // hueco del mirador (pared algo más oscura) y ventana
    g.fillStyle = "#e9dcc0"; g.fillRect(VX0 - 18, VY0 - 18, 1024 - VX0 + 18, VY1 - VY0 + 30);
    // el cielo de la tarde
    const gc = g.createLinearGradient(0, VY0, 0, VY1); gc.addColorStop(0, "#f6c26b"); gc.addColorStop(0.55, "#f7a35c"); gc.addColorStop(1, "#ee8a63");
    g.fillStyle = gc; g.fillRect(VX0, VY0, 1024 - VX0, VY1 - VY0);
    // sol bajo
    const sol = g.createRadialGradient(900, 318, 6, 900, 318, 170); sol.addColorStop(0, "rgba(255,250,215,1)"); sol.addColorStop(0.18, "rgba(255,235,170,0.9)"); sol.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = sol; g.fillRect(VX0, VY0, 1024 - VX0, VY1 - VY0);
    // nubes suaves
    g.fillStyle = "rgba(255,236,210,0.55)";
    for (const [x, y, w] of [[680, 130, 90], [820, 170, 120], [960, 112, 80]]) { g.beginPath(); g.ellipse(x, y, w, 12, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(x + w * 0.3, y - 8, w * 0.45, 10, 0, 0, TAU); g.fill(); }
    // tejados y árboles lejanos
    g.fillStyle = "#b9707a";
    g.beginPath(); g.moveTo(VX0, 380);
    for (const [x, y] of [[620, 360], [650, 360], [660, 340], [700, 340], [710, 356], [760, 356], [770, 330], [800, 318], [830, 330], [830, 350], [880, 350], [900, 336], [940, 336], [950, 352], [1024, 352]]) g.lineTo(x, y);
    g.lineTo(1024, VY1); g.lineTo(VX0, VY1); g.closePath(); g.fill();
    g.fillStyle = "#9a5c6c";
    for (const [x, y, r] of [[630, 386, 28], [700, 392, 34], [980, 380, 36], [1010, 372, 26]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    g.fillStyle = "#8a4f60"; g.fillRect(VX0, 400, 1024 - VX0, VY1 - 400);
    // pájaros
    g.strokeStyle = "rgba(90,50,60,0.7)"; g.lineWidth = 1.4;
    for (const [x, y] of [[730, 200], [748, 192], [880, 226]]) { g.beginPath(); g.moveTo(x - 5, y); g.quadraticCurveTo(x - 2, y - 3, x, y); g.quadraticCurveTo(x + 2, y - 3, x + 5, y); g.stroke(); }
    // marco y parteluces
    g.fillStyle = "#f4ecdc"; g.strokeStyle = "rgba(80,60,40,0.55)"; g.lineWidth = 1.5;
    const marco = (x, y, w, h) => { g.fillRect(x, y, w, h); g.strokeRect(x, y, w, h); };
    marco(VX0 - 10, VY0 - 10, 1024 - VX0 + 10, 12); marco(VX0 - 10, VY1 - 4, 1024 - VX0 + 10, 14);
    marco(VX0 - 10, VY0, 12, VY1 - VY0);
    for (const x of [736, 886]) marco(x - 7, VY0, 14, VY1 - VY0);
    marco(VX0, 236, 1024 - VX0, 8);
    // reflejos en los cristales
    g.strokeStyle = "rgba(255,255,255,0.28)"; g.lineWidth = 7;
    for (const x of [610, 760, 910]) { g.beginPath(); g.moveTo(x, 90); g.lineTo(x + 40, 40); g.stroke(); g.beginPath(); g.moveTo(x + 14, 112); g.lineTo(x + 52, 70); g.stroke(); }
    // cortina recogida a la izquierda
    g.save();
    const cx0 = VX0 - 46;
    g.fillStyle = "#c97b5a"; g.beginPath(); g.moveTo(cx0 - 6, 44); g.lineTo(cx0 + 70, 44);
    g.quadraticCurveTo(cx0 + 60, 180, cx0 + 34, 250); g.quadraticCurveTo(cx0 + 56, 330, cx0 + 50, 446); g.lineTo(cx0 - 12, 446); g.quadraticCurveTo(cx0 + 2, 300, cx0 - 6, 44); g.closePath(); g.fill();
    g.strokeStyle = "rgba(90,30,20,0.4)"; g.lineWidth = 2;
    for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(cx0 + 6 + k * 14, 48); g.quadraticCurveTo(cx0 + 10 + k * 9, 170, cx0 + 30 + k * 2, 248); g.quadraticCurveTo(cx0 + 10 + k * 10, 330, cx0 + k * 12, 444); g.stroke(); }
    g.fillStyle = "#e7c06a"; g.fillRect(cx0 + 20, 244, 30, 9);
    g.fillStyle = "#6a4426"; g.fillRect(cx0 - 20, 38, 1024 - cx0 + 20, 7);
    g.beginPath(); g.arc(cx0 - 20, 41, 6, 0, TAU); g.fill();
    g.restore();
    // macetas en el alféizar
    const maceta = (x, y, s, col) => {
      g.fillStyle = col; g.beginPath(); g.moveTo(x - 14 * s, y - 22 * s); g.lineTo(x + 14 * s, y - 22 * s); g.lineTo(x + 10 * s, y); g.lineTo(x - 10 * s, y); g.closePath(); g.fill();
      g.fillStyle = "rgba(0,0,0,0.15)"; g.fillRect(x - 14 * s, y - 22 * s, 28 * s, 4 * s);
    };
    maceta(612, VY1 - 6, 1, "#d98a5a");
    g.fillStyle = "#4f8a46"; for (let k = 0; k < 7; k++) { g.beginPath(); g.ellipse(612 + (k - 3) * 6, VY1 - 36 - Math.abs(k - 3) * -2 - (k % 2) * 6, 4.5, 11, (k - 3) * 0.32, 0, TAU); g.fill(); }
    maceta(990, VY1 - 6, 1.1, "#e8d6b4");
    g.strokeStyle = "#4f7a3c"; g.lineWidth = 2;
    for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(985 + k * 3, VY1 - 30); g.quadraticCurveTo(970 + k * 8, VY1 - 70 - k * 6, 990 + k * 5, VY1 - 96 - k * 4); g.stroke(); }
    g.fillStyle = "#6a9a4a"; for (let k = 0; k < 12; k++) { g.beginPath(); g.ellipse(975 + (k % 5) * 7, VY1 - 46 - k * 5, 6, 3.5, k, 0, TAU); g.fill(); }
    // banco del mirador: frente de madera pintada y cojín
    const by = ASIENTO;
    g.fillStyle = "#efe6d3"; g.fillRect(VX0 + 6, by + 14, 1024 - VX0, 514 - by - 14);
    g.strokeStyle = "rgba(80,60,40,0.35)"; g.lineWidth = 1.5;
    for (let x = VX0 + 22; x < 1024; x += 120) g.strokeRect(x, by + 30, 100, 514 - by - 46);
    g.fillStyle = "rgba(80,60,40,0.25)"; g.fillRect(VX0 + 6, 506, 1024 - VX0, 8);
    // cojín mostaza con vivo
    g.fillStyle = "#d9a53a"; g.beginPath(); g.moveTo(VX0 + 4, by + 16); g.quadraticCurveTo(VX0 + 2, by - 4, VX0 + 20, by - 6); g.lineTo(1024, by - 6); g.lineTo(1024, by + 16); g.closePath(); g.fill();
    g.strokeStyle = "#a8781e"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(VX0 + 6, by + 2); g.lineTo(1024, by + 2); g.stroke();
    g.fillStyle = "rgba(255,240,200,0.35)"; g.fillRect(VX0 + 20, by - 5, 1024 - VX0, 3);
    // cojines de respaldo
    const cojin = (x, y, w, h, col, a) => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = col; g.beginPath();
      g.moveTo(-w / 2, -h / 2); g.quadraticCurveTo(0, -h / 2 - 8, w / 2, -h / 2); g.quadraticCurveTo(w / 2 + 8, 0, w / 2, h / 2); g.quadraticCurveTo(0, h / 2 + 8, -w / 2, h / 2); g.quadraticCurveTo(-w / 2 - 8, 0, -w / 2, -h / 2); g.closePath(); g.fill();
      g.strokeStyle = "rgba(60,40,30,0.4)"; g.lineWidth = 1.5; g.stroke(); g.restore(); };
    cojin(872, by - 44, 84, 74, "#5e8a8a", -0.12); cojin(940, by - 40, 80, 70, "#e7c9b6", 0.1);
    g.fillStyle = "rgba(255,255,255,0.35)"; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(850 + k * 14, by - 52 + (k % 2) * 12, 3, 0, TAU); g.fill(); }
    // manta de punto colgando
    g.save(); g.translate(930, by - 4);
    g.fillStyle = "#f1e3c6"; g.beginPath(); g.moveTo(-60, 0); g.quadraticCurveTo(0, -10, 94, -2); g.lineTo(94, 92); g.quadraticCurveTo(30, 102, -52, 88); g.quadraticCurveTo(-64, 40, -60, 0); g.closePath(); g.fill();
    g.strokeStyle = "rgba(150,120,80,0.6)"; g.lineWidth = 1.4;
    for (let x = -50; x < 94; x += 11) for (let y = 6; y < 88; y += 9) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 4, y + 5); g.lineTo(x + 8, y); g.stroke(); }
    g.fillStyle = "#e7d2ac"; for (let x = -48; x < 94; x += 9) { g.beginPath(); g.moveTo(x, 90); g.lineTo(x + 2, 104); g.lineTo(x + 4, 90); g.fill(); }
    g.restore();
  }
  // haces de luz y motas (por encima de todo, suaves)
  // haces de luz de la ventana y viñeta: se pintan en el decorado (una vez)
  function lucesFondo(g) {
    g.save();
    g.globalCompositeOperation = "lighter";
    for (const [x0, w, a] of [[640, 70, 0.075], [770, 90, 0.065], [905, 70, 0.055]]) {
      const gr = g.createLinearGradient(x0, 100, x0 - 400, 560); gr.addColorStop(0, `rgba(255,214,140,${a})`); gr.addColorStop(1, "rgba(255,214,140,0)");
      g.fillStyle = gr; g.beginPath(); g.moveTo(x0, 90); g.lineTo(x0 + w, 90); g.lineTo(x0 + w - 430, 600); g.lineTo(x0 - 470, 600); g.closePath(); g.fill();
    }
    g.globalCompositeOperation = "multiply";
    const v = g.createRadialGradient(560, 300, 360, 560, 300, 760); v.addColorStop(0, "rgb(255,255,255)"); v.addColorStop(1, "rgb(196,170,150)");
    g.fillStyle = v; g.fillRect(0, 0, 1024, 600);
    g.restore();
  }
  // motas de polvo que flotan en los haces
  function motas(g, t) {
    g.save(); g.fillStyle = "rgba(255,240,200,0.8)";
    for (let i = 0; i < 26; i++) {
      const u = (hash(i * 3.7) + t * (0.01 + 0.015 * hash(i))) % 1, x = 300 + 600 * hash(i * 1.3) - 260 * u + 12 * Math.sin(t * 0.8 + i), y = 120 + 380 * u + 8 * Math.sin(t * 1.1 + i * 2);
      const a = 0.35 + 0.35 * Math.sin(t * 2 + i * 1.7);
      if (a <= 0.02) continue;
      g.globalAlpha = a; g.beginPath(); g.arc(x, y, 1.1 + hash(i * 9) * 1.2, 0, TAU); g.fill();
    }
    g.restore();
  }
  // sombras en el suelo
  function sombras(g, P) {
    g.save(); g.fillStyle = "rgba(50,25,10,0.28)";
    g.beginPath(); g.ellipse(P.g.xF + 4, SUELO + 4, 60 * (1 - 0.3 * clamp((SUELO - P.g.suelo) / 50)), 7, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(648, SUELO + 2, 46, 6, 0, 0, TAU); g.fill();
    const ga = P.gato;
    if (ga.y > 440 && ga.g === 0) { const h = clamp((SUELO - (ga.y + ga.alto)) / 80); g.globalAlpha = 1 - h * 0.6; g.beginPath(); g.ellipse(ga.x, SUELO + 2, 34 * (1 - 0.3 * h), 5, 0, 0, TAU); g.fill(); }
    g.restore();
  }
  // rayitas de susto alrededor de la cabeza de Guillermo
  function susto(g, pg, k) {
    if (k <= 0.01) return;
    const c = G.aPantalla(pg, G.centroCabeza(pg));
    g.save(); g.strokeStyle = "#1a1418"; g.lineCap = "round"; g.lineWidth = 2.6; g.globalAlpha = k;
    for (let i = 0; i < 7; i++) { const a = -Math.PI * 0.95 + i * 0.3, r0 = 66, r1 = 66 + 14 * k;
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0 * 0.95); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1 * 0.95); g.stroke(); }
    g.restore();
  }
  // corazoncitos de Guillermo
  function corazones(g, pg, t) {
    const k = dentro(t, T.derrite0 + 0.1, T.derrite0 + 0.3, T.derrite1 - 0.3, T.derrite1), k2 = dentro(t, T.enrosca1, T.enrosca1 + 0.2, 13.9, 14.05);
    const kk = Math.max(k, k2); if (kk <= 0.01) return;
    const c = G.aPantalla(pg, G.centroCabeza(pg));
    g.save();
    for (let i = 0; i < 3; i++) {
      const fin = t > T.enrosca0, ph = ((t - T.derrite0) * 0.55 + i / 3) % 1, x = c.x + (fin ? 70 : 54) + i * 14 + 8 * Math.sin(t * 3 + i), y = c.y - (fin ? 0 : 40) - (fin ? 40 : 50) * ph;
      g.globalAlpha = kk * Math.sin(Math.PI * ph); const s = 7 + 2.5 * (i % 2);
      g.fillStyle = "#e5445f"; g.beginPath(); g.moveTo(x, y + s * 0.9); g.bezierCurveTo(x - s * 1.4, y - s * 0.2, x - s * 0.7, y - s * 1.3, x, y - s * 0.45); g.bezierCurveTo(x + s * 0.7, y - s * 1.3, x + s * 1.4, y - s * 0.2, x, y + s * 0.9); g.fill();
    }
    g.restore();
  }
  // el susurro: ondas suaves de la boca de Marta hacia Guillermo
  function susurro(g, pm, pg, t) {
    const k = dentro(t, T.susurro0 + 0.08, T.susurro0 + 0.18, T.susurro1 - 0.12, T.susurro1);
    if (k <= 0.01) return;
    const a = M.aPantalla(pm, M.boca(pm)), b = G.aPantalla(pg, G.centroCabeza(pg));
    g.save(); g.strokeStyle = "rgba(70,45,80,0.85)"; g.lineCap = "round"; g.lineWidth = 2.2;
    for (let i = 0; i < 4; i++) {
      const ph = ((t - T.susurro0) * 2.2 + i / 4) % 1;
      const x = lerp(a.x - 24, b.x + 60, ph), y = lerp(a.y - 8, b.y + 10, ph) - 8 * Math.sin(Math.PI * ph);
      const sc = 0.7 + 0.5 * Math.sin(Math.PI * ph);
      g.globalAlpha = k * Math.sin(Math.PI * ph);
      g.beginPath(); for (let s = 0; s <= 12; s++) { const xx = x - 11 * sc + s * 1.85 * sc, yy = y + 3.5 * sc * Math.sin(s * 1.1 + t * 12); if (s) g.lineTo(xx, yy); else g.moveTo(xx, yy); } g.stroke();
    }
    g.restore();
  }
  // bufido: chispitas y zigzag delante de la boca
  function bufido(g, P, t) {
    const k = dentro(t, T.eriza, T.eriza + 0.05, T.desinfla0, T.desinfla0 + 0.15);
    if (k <= 0.01) return;
    const hc = cabezaGato(P);
    g.save(); g.strokeStyle = "#3a1d0d"; g.lineWidth = 1.6; g.lineCap = "round"; g.lineJoin = "round";
    for (let i = 0; i < 3; i++) {
      const ph = ((t - T.eriza) * 3 + i / 3) % 1, x = hc.x - 28 - 34 * ph, y = hc.y + 4 + (i - 1) * 9;
      g.globalAlpha = k * Math.sin(Math.PI * ph);
      g.beginPath(); g.moveTo(x, y); for (let s = 1; s <= 4; s++) g.lineTo(x - s * 4, y + (s % 2 ? -3 : 3)); g.stroke();
    }
    g.restore();
  }
  // pinchos del pelo de Guillermo que asoman entre el pelo del gato hecho gorro
  function puasEncima(g, P, t) {
    const k = tramo(t, T.enrosca0 + 0.15, T.enrosca1);
    if (k <= 0.01) return;
    g.save(); g.lineJoin = "round";
    for (const [u, L, w, ph] of [[0.2, 11, 7, 0], [0.42, 13, 8, 1.3], [0.63, 10, 6.5, 2.1], [0.82, 8, 6, 0.6]]) {
      const a = lomoGato(P, u, -3), b = lomoGato(P, u, 6);
      let dx = b.x - a.x, dy = b.y - a.y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const ll = L * k * (1 + 0.05 * Math.sin(t * 4 + ph)), nx = -dy, ny = dx;
      const tip = { x: a.x + dx * ll + nx * 2, y: a.y + dy * ll + ny * 2 };
      g.beginPath(); g.moveTo(a.x - nx * w / 2, a.y - ny * w / 2); g.quadraticCurveTo(a.x + dx * ll * 0.5 - nx * w * 0.2, a.y + dy * ll * 0.5 - ny * w * 0.2, tip.x, tip.y);
      g.quadraticCurveTo(a.x + dx * ll * 0.5 + nx * w * 0.35, a.y + dy * ll * 0.5 + ny * w * 0.35, a.x + nx * w / 2, a.y + ny * w / 2); g.closePath();
      g.fillStyle = "#6e3818"; g.fill(); g.strokeStyle = "#1c0d06"; g.lineWidth = 1.3; g.stroke();
      g.strokeStyle = "rgba(240,170,110,0.75)"; g.lineWidth = 1; g.beginPath(); g.moveTo(a.x + dx * ll * 0.2, a.y + dy * ll * 0.2); g.lineTo(a.x + dx * ll * 0.7 + nx * 0.8, a.y + dy * ll * 0.7 + ny * 0.8); g.stroke();
    }
    g.restore();
  }
  // la mano de Marta que acaricia, otra vez encima del gato
  function manoEncima(g, pm, t) {
    const m = pm.manoLejos;
    g.save();
    const k = pm.s * KM;
    g.translate(pm.x, pm.suelo); g.scale(-k, k); g.translate(-M.PELVIS.x, -M.SUELO);
    g.translate(m.x, m.y); g.rotate(m.ang || 0); g.scale(M.JK, M.JK);
    const ESC = 0.88; g.scale(ESC * (m.puno ?? 1), ESC * (m.puno ?? 1));
    Personaje2D.mano(g, m, { piel: M.C.piel, sombra: M.C.pielSombra, tinta: M.C.tinta });
    g.restore();
  }

  /* =====================================================================================
   * CÁMARA Y ESCENA
   * ===================================================================================== */
  function camara(t) {
    const z = tramo(t, T.enrosca0 - 0.3, T.camara + 0.4);
    return { k: 1 + 0.12 * z, x: 512 + (548 - 512) * z, y: 300 + (286 - 300) * z };
  }
  class Gato extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !M.listo()) return;
      if (!fondo) fondo = creaFondo();
      const P = pose(t), pg = P.g, pm = P.m, ga = P.gato;
      ga.t = t;
      const luzK = tramo(t, NEGRO_INICIO, 0.8) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      g.drawImage(fondo, 0, 0);
      sombras(g, P);
      M.dibujar(g, pm, t);
      const enRegazo = t < T.saltaG0 + 0.12;
      if (enRegazo) { dibGato(g, ga, t); bufido(g, ga, t); if (pm.manoEncima) manoEncima(g, pm, t); }
      G.dibujar(g, pg, t);
      if (P.cana && P.cana.pluma) dibPluma(g, P.cana, t);
      if (!enRegazo) { dibGato(g, ga, t); puasEncima(g, ga, t); }
      susto(g, pg, pg.sobresalto);
      corazones(g, pg, t);
      susurro(g, pm, pg, t);
      motas(g, t);
      g.restore();
      if (luzK < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luzK})`; g.fillRect(0, 0, W, H); }
    }
  }
  // la caña de este instante (para que Guillermo la coja justo por el mango)
  const poseOrig = pose;
  registrar({ id: "00095", nombre: "Guillermo y Marta · El gato", crear: () => new Gato() });
  window.__A2D_00095 = { pose: poseOrig, T, DUR, FORMAS, dibGato };
})();
