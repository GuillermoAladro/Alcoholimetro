"use strict";
/* 00069 · Guillermo y Deivi · La momia
 *
 * Negro → noche de Halloween a la puerta del bar: luna llena, cielo morado, murciélagos a lo lejos, un
 * árbol pelado, telarañas en la puerta y en la ventana, una araña que sube y baja de su hilo, una
 * guirnalda de bombillas naranjas y moradas, calabazas talladas con la vela temblando y niebla baja.
 * Deivi enseña un rollo de papel higiénico (lo lanza al aire y lo caza) y le mueve las cejas a Guillermo,
 * que lo pilla al vuelo y abre los brazos, encantado → Deivi se acerca, se agacha y lanza la punta del
 * papel, que se enrosca en el tobillo de Guillermo; con el dedo le hace «¡gira!» → Guillermo gira como una
 * peonza y Deivi, levantándose poco a poco, le envuelve de los zapatos a la cabeza (el rollo adelgaza
 * hasta quedarse en el cartón) → Deivi rasga el papel y tira el cartón hacia atrás; Guillermo para: es
 * una momia, solo se le ven los ojos por una rendija → se mira, levanta los brazos rectos y, muy
 * orgulloso, avanza hacia la cámara a pasos tiesos para asustar (la cámara se acerca); Deivi se hace el
 * asustado → Guillermo pisa la punta suelta que le sale del tobillo: con el siguiente paso el papel se
 * tensa, le da un tirón y empieza a girar sobre el pie que la pisa; el papel se desenrolla de abajo arriba
 * y se amontona a sus pies hasta que sale del último trozo con su ropa de siempre, mareado (ojos en
 * espiral, estrellitas) → Deivi, muerto de risa, recoge el montón en una polvareda de papel y se levanta
 * con un rollo gigante que sube por encima de la cabeza; Guillermo lo ve y mira a cámara aterrado; Deivi
 * le guiña un ojo a la cámara → negro.
 *
 * Las vendas no son un dibujo aparte: siguen el esqueleto de Guillermo (piernas y brazos por su curva;
 * torso, cabeza y zapatos en sus propias coordenadas), aparecen y desaparecen por altura según se
 * enrollan o desenrollan y giran con él (giro de peonza: escala horizontal cos θ, nunca una vuelta entera).
 * Sin textos. Todo depende del tiempo absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, D = Deivi, R = Recortes;
  const S = 0.30, SUELO = 556, DUR = 15.0, TAU = Math.PI * 2;

  const T = {
    entra: 0.8, lanza0: 0.92, lanza1: 1.42, cejas0: 1.52, cejas1: 1.98,
    duda: 1.05, idea: 1.9, abre0: 2.0, abre1: 2.34,
    anda0: 2.12, anda1: 2.66, agacha0: 2.5, agacha1: 2.84, flick0: 2.84, llega: 3.04, nudo: 3.16,
    dedo0: 2.96, dedo1: 3.46,
    gira0: 3.22, giraB: 3.62, giraC: 5.98, gira1: 6.46,
    env0: 3.34, env1: 6.24, rasga: 6.33,
    tubo0: 6.76, tubo1: 7.45, atras0: 6.82, atras1: 7.48,
    cola0: 6.46, cola1: 6.95,
    parp: 6.68, mira0: 6.8, brazos0: 6.98, brazos1: 7.42, camara: 7.5,
    marcha0: 7.66, pisa: 8.6, tensa: 8.84, mira2: 8.96,
    miedo0: 7.86, miedo1: 8.62, risa0: 9.25, risa1: 10.75,
    gira2_0: 9.04, gira2B: 9.5, gira2C: 10.96, gira2_1: 11.5,
    des0: 9.14, des1: 10.94, pop: 10.98,
    tambalea0: 11.02, tambalea1: 11.9, mareo1: 12.7,
    vaD0: 11.06, vaD1: 11.62, remo0: 11.7, remo1: 12.3, sube: 12.7,
    muestra: 12.8, ve: 12.92, terror: 13.18, guino: 13.78,
    fin: 14.2
  };

  /* ---------- utilidades ---------- */
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const recorrido = (lista, t) => {
    if (t <= lista[0][0]) return lista[0][1];
    for (let i = 1; i < lista.length; i++) if (t < lista[i][0]) return lerp(lista[i - 1][1], lista[i][1], suave(fase(t, lista[i - 1][0], lista[i][0])));
    return lista[lista.length - 1][1];
  };
  // pie: lista de pasos [t0, t1, x, alza]
  function pie(lista, t) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x, alza = 20] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, u = fase(t, t0, t1);
    return { x: lerp(xa, x, suave5(u)), alza: alza * Math.sin(Math.PI * u), u };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const rot = (q, a) => ({ x: q.x * Math.cos(a) - q.y * Math.sin(a), y: q.x * Math.sin(a) + q.y * Math.cos(a) });
  const dedosTodos = k => ({ pulgar: k, indice: k, medio: k, anular: k, menique: k });
  const AGARRA = dedosTodos(0.32);
  const muHacia = (m, h, extra = 0) => Math.atan2(h.y - m.y, h.x - m.x) + extra;
  // ángulo de una peonza que arranca, gira constante y frena: da exactamente n vueltas
  function peonza(t, a, b, c, d, n) {
    const I = u => u * u * u - u * u * u * u / 2;
    const tot = 0.5 * (b - a) + (c - b) + 0.5 * (d - c), w = n * TAU / tot;
    let s;
    if (t <= a) s = 0;
    else if (t < b) s = (b - a) * I(fase(t, a, b));
    else if (t < c) s = 0.5 * (b - a) + (t - b);
    else if (t < d) { const u = fase(t, c, d); s = 0.5 * (b - a) + (c - b) + (d - c) * (u - I(u)); }
    else s = tot;
    return { ang: w * s, vel: suave(fase(t, a, b)) * (1 - suave(fase(t, c, d))) };
  }
  const giro1 = t => peonza(t, T.gira0, T.giraB, T.giraC, T.gira1, 7);
  const giro2 = t => peonza(t, T.gira2_0, T.gira2B, T.gira2C, T.gira2_1, 5);

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 1, abre: 0, ancho: 1, sonr: 0.12, dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: Math.max(e.c, parp, e.wd), i: Math.max(e.c, parp), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }

  /* =====================================================================================
   * EL PAPEL: colores, rollo y cinta
   * ===================================================================================== */
  const PAP = { base: "#ebe2d4", luz: "rgba(255,252,244,0.75)", sombra: "rgba(92,62,124,0.30)", costura: "#a3917f", tinta: "#1d1622",
    carton: "#b88a57", cartonOsc: "#7b5530", hueco: "#2b1a12" };
  // rollo: cilindro con el eje a `ang` (0 = vertical); tapa = redondez de la cara de arriba; giro = vueltas del papel
  function rollo(g, x, y, r, l, ang, tapa, giro, tubo) {
    g.save(); g.translate(x, y); g.rotate(ang); g.lineJoin = "round"; g.lineCap = "round";
    const ry = r * tapa, h = l / 2, tb = tubo ?? r * 0.42;
    const cuerpo = () => { g.beginPath(); g.moveTo(-r, -h); g.lineTo(-r, h); g.ellipse(0, h, r, ry, 0, Math.PI, 0, true); g.lineTo(r, -h); g.closePath(); };
    if (r > tb + 0.6) {
      cuerpo(); g.fillStyle = PAP.base; g.fill();
      g.save(); cuerpo(); g.clip();
      g.fillStyle = PAP.sombra; g.fillRect(-r, -h - ry, r * 0.55, l + 2 * ry);
      g.fillStyle = PAP.luz; g.fillRect(r * 0.3, -h - ry, r * 0.28, l + 2 * ry);
      // trepados del papel: rayas que pasan al girar
      g.strokeStyle = "rgba(150,132,116,0.55)"; g.lineWidth = Math.max(0.8, r * 0.06); g.setLineDash([l * 0.08, l * 0.06]);
      for (let i = 0; i < 4; i++) { const a = giro + i * TAU / 4, sx = Math.sin(a); if (Math.cos(a) < 0) continue;
        g.beginPath(); g.moveTo(r * sx, -h); g.lineTo(r * sx, h + ry * Math.sqrt(Math.max(0, 1 - sx * sx))); g.stroke(); }
      g.setLineDash([]);
      g.restore();
      cuerpo(); g.lineWidth = Math.max(1.4, r * 0.09); g.strokeStyle = PAP.tinta; g.stroke();
      // cara de arriba: anillos de papel y el cartón
      g.beginPath(); g.ellipse(0, -h, r, ry, 0, 0, TAU); g.fillStyle = "#f6f0e4"; g.fill(); g.stroke();
      g.strokeStyle = "rgba(160,140,120,0.6)"; g.lineWidth = Math.max(0.7, r * 0.04);
      for (const k of [0.82, 0.66]) if (r * k > tb + 1) { g.beginPath(); g.ellipse(0, -h, r * k, ry * k, 0, 0, TAU); g.stroke(); }
    }
    // tubo de cartón
    g.beginPath(); g.ellipse(0, -h, tb, tb * tapa, 0, 0, TAU); g.fillStyle = PAP.carton; g.fill();
    if (r <= tb + 0.6) {   // solo el cartón: se ve su lado
      g.beginPath(); g.moveTo(-tb, -h); g.lineTo(-tb, h); g.ellipse(0, h, tb, tb * tapa, 0, Math.PI, 0, true); g.lineTo(tb, -h); g.closePath();
      g.fillStyle = PAP.carton; g.fill(); g.lineWidth = 1.5; g.strokeStyle = PAP.tinta; g.stroke();
      g.strokeStyle = PAP.cartonOsc; g.lineWidth = 1; g.beginPath(); g.moveTo(-tb, -h + l * 0.3); g.quadraticCurveTo(0, -h + l * 0.45, tb, -h + l * 0.15); g.stroke();
      g.beginPath(); g.ellipse(0, -h, tb, tb * tapa, 0, 0, TAU); g.fillStyle = PAP.carton; g.fill();
    }
    g.beginPath(); g.ellipse(0, -h + tb * tapa * 0.12, tb * 0.74, tb * tapa * 0.7, 0, 0, TAU); g.fillStyle = PAP.hueco; g.fill();
    g.beginPath(); g.ellipse(0, -h, tb, tb * tapa, 0, 0, TAU); g.lineWidth = Math.max(1, r * 0.06); g.strokeStyle = PAP.tinta; g.stroke();
    g.restore();
  }
  // tira de papel de lado (fina): se dibuja como un trazo doble
  function tira(g, pts, grosor, cerrada = false) {
    if (pts.length < 2) return;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const camino = () => { g.beginPath(); M2.curva(g, pts, cerrada, 0.5); };
    camino(); g.strokeStyle = PAP.tinta; g.lineWidth = grosor + 2.6; g.stroke();
    camino(); g.strokeStyle = PAP.base; g.lineWidth = grosor; g.stroke();
    if (grosor > 4) { camino(); g.strokeStyle = "rgba(255,255,255,0.55)"; g.lineWidth = grosor * 0.28; g.stroke(); }
    g.restore();
  }
  // cinta ancha entre dos puntos (se le ve la cara): alto h0 en a y h1 en b, con algo de comba
  function cinta(g, a, b, h0, h1, comba, ondula = 0) {
    const n = 10, arriba = [], abajo = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, x = lerp(a.x, b.x, u), y = lerp(a.y, b.y, u) + comba * 4 * u * (1 - u) + ondula * Math.sin(u * 7 + ondula * 3) * u * (1 - u) * 4;
      const h = lerp(h0, h1, u) * (1 - 0.18 * Math.sin(Math.PI * u) * Math.abs(Math.sin(ondula * 2 + u * 3)));
      arriba.push({ x, y: y - h / 2 }); abajo.push({ x, y: y + h / 2 });
    }
    g.save(); g.lineJoin = "round";
    g.beginPath(); arriba.forEach((q, i) => i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); for (let i = n; i >= 0; i--) g.lineTo(abajo[i].x, abajo[i].y); g.closePath();
    g.fillStyle = PAP.base; g.fill();
    g.save(); g.clip(); g.fillStyle = PAP.sombra; g.beginPath(); abajo.forEach((q, i) => i ? g.lineTo(q.x, q.y - 3) : g.moveTo(q.x, q.y - 3));
    for (let i = n; i >= 0; i--) g.lineTo(abajo[i].x, abajo[i].y + 2); g.fill(); g.restore();
    g.strokeStyle = PAP.tinta; g.lineWidth = 1.5;
    g.beginPath(); arriba.forEach((q, i) => i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); g.stroke();
    g.beginPath(); abajo.forEach((q, i) => i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); g.stroke();
    g.restore();
  }

  /* =====================================================================================
   * LAS VENDAS DE GUILLERMO
   * Cada trozo de papel tiene su «altura de enrollado» w (0 = suela, 1 = coronilla) sacada de la
   * postura de referencia (brazos abiertos, de pie). Se ve la parte de cada trozo entre lo y hi.
   * ===================================================================================== */
  const PZG = G.A.datos.piezas;
  const CODO_C = PZG.brazo_cerca.codo;
  const SUELA_G = G.SUELO, ALTO_G = G.SUELO + 119;      // de la suela a la coronilla (hoja)
  const wDe = y => (SUELA_G - y) / ALTO_G, yDe = w => SUELA_G - w * ALTO_G;
  const TINTA_P = 5.2;                                  // trazo de las vendas (hoja)
  const NB_PIERNA = 7, NB_BRAZO = 5;
  const anchoPierna = u => lerp(88, 64, u) + 6 * Math.sin(Math.PI * clamp(u * 1.4));
  const anchoBrazo = u => u < 0.4 ? lerp(50, 40, u / 0.4) : lerp(40, 31, (u - 0.4) / 0.6);

  function curvaPierna(p, lado) {
    const Tr = G.tronco(p), L = PZG[lado === "cerca" ? "pierna_cerca" : "pierna_lejos"].largo;
    return R.ik(Tr(G.CADERA[lado]), p.piernas[lado].tob, L, L * 0.5, 80, 1, 1.03);
  }
  function curvaBrazo(p, lado) {
    const Tr = G.tronco(p), cerca = lado === "cerca", m = cerca ? p.manoCerca : p.manoLejos;
    const raiz = Tr(cerca ? G.HOMBRO_C : G.HOMBRO), L = cerca ? G.BRAZO_C_L : G.BRAZO_L, sj = cerca ? CODO_C : G.BRAZO_L * 0.5;
    const mu = m.mu ?? -1.75, k = G.MUNECA_R * G.JK;
    const o = G.rotP({ x: Math.cos(mu) * k, y: Math.sin(mu) * k }, m.ang || 0);
    const c = (p.ikContinuo ? R.ikContinuo : R.ik)(raiz, { x: m.x + o.x, y: m.y + o.y }, L, sj, 42, m.dobla ?? -1, 1.08);
    c.caminoCorto = true;
    return c;
  }
  // bordes de una extremidad: n + 1 juntas, cada una con su punto a (lado +normal) y b
  function geoTira(c, n, ancho, semilla, alarga = 0) {
    const pts = R.muestras(c, n);
    if (alarga) { const q = pts[n]; pts[n] = { x: q.x - Math.sin(q.a) * alarga, y: q.y + Math.cos(q.a) * alarga, a: q.a }; }
    return pts.map((q, j) => {
      const a = j === 0 ? q.a : j === n ? pts[n].a : (pts[j].a + pts[j + 1].a) / 2;
      const w = ancho(j / n), nx = Math.cos(a), ny = Math.sin(a), dx = -Math.sin(a), dy = Math.cos(a);
      const d = (j === 0 || j === n) ? 0 : 13 * (0.55 + 0.45 * hash(semilla + j * 1.7)) * (j % 3 === 1 ? -1 : 1);
      return { a: { x: q.x + nx * w + dx * d, y: q.y + ny * w + dy * d }, b: { x: q.x - nx * w - dx * d, y: q.y - ny * w - dy * d }, c: q, dir: { x: dx, y: dy } };
    });
  }
  const rangoW = (geo, k) => { const ys = [geo[k].a.y, geo[k].b.y, geo[k + 1].a.y, geo[k + 1].b.y]; return [wDe(Math.max(...ys)), wDe(Math.min(...ys))]; };
  // fracción visible de un trozo [w0, w1] con lo papel entre lo y hi; lado desde el que crece
  function visible(w0, w1, V) {
    let f = 1, desde = 1;
    if (V.hi < w1) f = clamp((V.hi - w0) / Math.max(1e-6, w1 - w0));
    if (V.lo > w0) { f = Math.min(f, clamp((w1 - V.lo) / Math.max(1e-6, w1 - w0))); desde = -1; }
    return { f, desde };
  }

  /* postura de referencia (brazos abiertos, de pie): de ella salen las alturas w de cada venda */
  let REF = null;
  function referencia() {
    if (REF) return REF;
    const p = poseGBase(4.0, true);
    const o = { piernas: {}, brazos: {}, manos: {}, zap: {} };
    for (const lado of ["cerca", "lejos"]) {
      const gp = geoTira(curvaPierna(p, lado), NB_PIERNA, anchoPierna, lado === "cerca" ? 3 : 11, 26);
      o.piernas[lado] = gp.slice(0, -1).map((_, k) => rangoW(gp, k));
      const gb = geoTira(curvaBrazo(p, lado), NB_BRAZO, anchoBrazo, lado === "cerca" ? 21 : 29, 0);
      o.brazos[lado] = gb.slice(0, -1).map((_, k) => rangoW(gb, k));
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos;
      o.manos[lado] = [wDe(m.y + 40), wDe(m.y - 40)];
      o.zap[lado] = p.piernas[lado].tob.y;
    }
    // bordes de la silueta por alturas (para saber dónde se engancha la cinta)
    const pts = [];
    for (const lado of ["cerca", "lejos"]) {
      for (const q of geoTira(curvaPierna(p, lado), NB_PIERNA, anchoPierna, 1, 26)) pts.push(q.a, q.b);
      for (const q of geoTira(curvaBrazo(p, lado), NB_BRAZO, anchoBrazo, 1, 0)) pts.push(q.a, q.b);
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos; pts.push({ x: m.x - 44, y: m.y }, { x: m.x + 44, y: m.y }, { x: m.x, y: m.y + 40 });
      const tb = p.piernas[lado].tob; for (const q of ZAPATO_P) pts.push({ x: tb.x + q.x, y: tb.y + q.y });
    }
    for (const [x, y] of TORSO_P) pts.push({ x, y });
    for (const q of HUEVO) pts.push({ x: 244 + (q.x - 700) * 0.6, y: 256 + (q.y - 800) * 0.6 });
    const BORDES = [];
    for (let y = SUELA_G; y >= SUELA_G - ALTO_G - 10; y -= 12) {
      let x0 = Infinity, x1 = -Infinity;
      for (const q of pts) if (Math.abs(q.y - y) < 22) { x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); }
      BORDES.push({ y, x0, x1 });
    }
    for (let i = 0; i < BORDES.length; i++) if (!isFinite(BORDES[i].x0)) { const v = BORDES[i - 1] || BORDES.find(b => isFinite(b.x0)); BORDES[i].x0 = v.x0; BORDES[i].x1 = v.x1; }
    o.bordes = BORDES;
    REF = o;
    return o;
  }
  // bordes izquierdo y derecho de la silueta envuelta a la altura w (hoja, postura de referencia)
  function bordeEn(w) {
    const B = referencia().bordes, y = yDe(w), i = clamp(Math.floor((SUELA_G - y) / 12), 0, B.length - 2), k = clamp((SUELA_G - y) / 12 - i);
    return { x0: lerp(B[i].x0, B[i + 1].x0, k), x1: lerp(B[i].x1, B[i + 1].x1, k), y };
  }

  // torso de papel (coordenadas del torso), cabeza de papel (retrato) y bota de papel (zapato)
  const TORSO_P = [[118, 290], [176, 270], [212, 240], [274, 240], [310, 272], [360, 302], [368, 344], [358, 400], [354, 470], [350, 530],
    [350, 600], [356, 646], [382, 672], [404, 706], [402, 752], [250, 770], [102, 752], [100, 704], [116, 674], [130, 640], [128, 600],
    [126, 548], [116, 500], [110, 445], [112, 360]];
  // curva cerrada suave (Catmull-Rom) muestreada en n puntos por tramo
  function suaviza(ctrl, n = 5) {
    const out = [], N = ctrl.length, P = i => ctrl[(i + N) % N];
    for (let i = 0; i < N; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      for (let k = 0; k < n; k++) { const u = k / n, u2 = u * u, u3 = u2 * u;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
        out.push({ x: f(p0[0], p1[0], p2[0], p3[0]), y: f(p0[1], p1[1], p2[1], p3[1]) }); }
    }
    return out;
  }
  // cabeza de papel (retrato): tapa la cara y el pelo, con el tupé envuelto arriba a la derecha
  const HUEVO = suaviza([[800, 866], [912, 800], [982, 692], [1014, 604], [1072, 522], [1124, 440], [1142, 356], [1124, 282], [1072, 230],
    [990, 192], [900, 166], [796, 156], [696, 170], [604, 206], [522, 254], [484, 330], [494, 424], [520, 506], [514, 594], [548, 664],
    [604, 736], [690, 812]], 4);
  const RENDIJA = (() => {  // rendija de los ojos (retrato): una lente a lo largo de la línea de los ojos
    const arriba = [], abajo = [], x0 = 704, x1 = 958;
    for (let i = 0; i <= 14; i++) { const x = lerp(x0, x1, i / 14), s = Math.pow(Math.sin(Math.PI * i / 14), 0.55), yc = 563 + 0.44 * (x - 771);
      arriba.push({ x, y: yc - 42 * s - 2 }); abajo.push({ x, y: yc + 34 * s + 2 }); }
    return arriba.concat(abajo.reverse());
  })();
  const ZAPATO_P = suaviza([[-74, -46], [36, -52], [104, -18], [158, 18], [184, 58], [176, 100], [120, 110], [-40, 110], [-82, 96], [-92, 40]], 4);

  const poli = (g, pts) => { g.moveTo(pts[0].x ?? pts[0][0], pts[0].y ?? pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x ?? pts[i][0], pts[i].y ?? pts[i][1]); g.closePath(); };
  // franja entre dos líneas de nivel (ya en coordenadas locales): y = yb + m (x − xc) y y = ya + m (x − xc)
  function franja(g, yAbajo, yArriba, m, xc, x0 = -400, x1 = 1600) {
    g.beginPath(); g.moveTo(x0, yArriba + m * (x0 - xc)); g.lineTo(x1, yArriba + m * (x1 - xc)); g.lineTo(x1, yAbajo + m * (x1 - xc)); g.lineTo(x0, yAbajo + m * (x0 - xc)); g.closePath();
  }

  // una venda de extremidad (k entre las juntas k y k+1) con fracción f
  function venda(g, J, k, f, desde, tinta, puntaFin, raizFin) {
    const A0 = J[k].a, A1 = J[k + 1].a, B0 = J[k].b, B1 = J[k + 1].b;
    let a0 = A0, a1 = A1, b0 = B0, b1 = B1;
    if (f < 0.999) { if (desde > 0) { b0 = mezcla(A0, B0, f); b1 = mezcla(A1, B1, f); } else { a0 = mezcla(B0, A0, f); a1 = mezcla(B1, A1, f); } }
    const forma = () => { g.beginPath(); g.moveTo(a0.x, a0.y); g.lineTo(a1.x, a1.y); g.lineTo(b1.x, b1.y); g.lineTo(b0.x, b0.y); g.closePath(); };
    forma(); g.fillStyle = PAP.base; g.fill();
    g.save(); forma(); g.clip();
    // sombra en el lado b, brillo en el a
    g.fillStyle = PAP.sombra; g.beginPath(); g.moveTo(B0.x, B0.y); g.lineTo(B1.x, B1.y); const s1 = mezcla(B1, A1, 0.34), s0 = mezcla(B0, A0, 0.34); g.lineTo(s1.x, s1.y); g.lineTo(s0.x, s0.y); g.closePath(); g.fill();
    g.fillStyle = PAP.luz; g.beginPath(); const l0 = mezcla(A0, B0, 0.1), l1 = mezcla(A1, B1, 0.1), l2 = mezcla(A1, B1, 0.24), l3 = mezcla(A0, B0, 0.24);
    g.moveTo(l0.x, l0.y); g.lineTo(l1.x, l1.y); g.lineTo(l2.x, l2.y); g.lineTo(l3.x, l3.y); g.closePath(); g.fill();
    // pliegue
    const m0 = mezcla(mezcla(A0, B0, 0.3), mezcla(A1, B1, 0.3), 0.45), m1 = mezcla(mezcla(A0, B0, 0.62), mezcla(A1, B1, 0.62), 0.6);
    g.strokeStyle = "rgba(150,128,112,0.5)"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(m0.x, m0.y); g.quadraticCurveTo((m0.x + m1.x) / 2 + J[k].dir.x * 8, (m0.y + m1.y) / 2 + J[k].dir.y * 8, m1.x, m1.y); g.stroke();
    // costura con la venda de abajo (lado punta) y su sombra
    const d = J[k + 1].dir;
    g.fillStyle = "rgba(70,45,90,0.22)"; g.beginPath(); g.moveTo(A1.x, A1.y); g.lineTo(B1.x, B1.y); g.lineTo(B1.x + d.x * 9, B1.y + d.y * 9); g.lineTo(A1.x + d.x * 9, A1.y + d.y * 9); g.closePath(); g.fill();
    g.restore();
    g.lineCap = "round"; g.lineJoin = "round";
    g.strokeStyle = PAP.costura; g.lineWidth = 2.6; g.beginPath(); g.moveTo(a1.x, a1.y); g.lineTo(b1.x, b1.y); g.stroke();
    g.strokeStyle = tinta; g.lineWidth = TINTA_P;
    g.beginPath(); g.moveTo(a0.x, a0.y); g.lineTo(a1.x, a1.y); g.moveTo(b0.x, b0.y); g.lineTo(b1.x, b1.y);
    if (raizFin) { g.moveTo(a0.x, a0.y); g.lineTo(b0.x, b0.y); }
    if (puntaFin) { g.moveTo(a1.x, a1.y); g.lineTo(b1.x, b1.y); }
    g.stroke();
  }
  function dibExtremidad(g, J, W, V) {
    const n = J.length - 1, vis = [];
    for (let k = 0; k < n; k++) vis[k] = visible(W[k][0], W[k][1], V);
    for (let k = n - 1; k >= 0; k--) {
      const v = vis[k]; if (v.f <= 0.002) continue;
      const raizFin = k === 0 || vis[k - 1].f < 0.999, puntaFin = k === n - 1 || vis[k + 1].f < 0.999 || v.f < 0.999;
      venda(g, J, k, v.f, v.desde, PAP.tinta, puntaFin, raizFin);
    }
  }
  // trozo con forma fija (torso, cabeza, bota) visible entre dos niveles de altura (en sus coordenadas)
  function dibTrozo(g, forma, yLo, yHi, m, xc, costuras, sombra, tintaK, agujero) {
    if (yHi >= yLo) return;
    g.save();
    const camino = () => { g.beginPath(); poli(g, forma); if (agujero) poli(g, agujero.slice().reverse()); };
    camino(); g.clip(agujero ? "evenodd" : "nonzero");
    franja(g, yLo, yHi, m, xc); g.clip();
    camino(); g.fillStyle = PAP.base; g.fill(agujero ? "evenodd" : "nonzero");
    sombra(g);
    // costuras: cada venda pisa a la de abajo
    g.lineCap = "round";
    for (const [y, mm, comba] of costuras) {
      const x0 = xc - 520, x1 = xc + 520, ya = y + mm * (x0 - xc), yb = y + mm * (x1 - xc);
      g.fillStyle = "rgba(70,45,90,0.2)"; g.beginPath(); g.moveTo(x0, ya); g.quadraticCurveTo(xc, y + comba, x1, yb); g.lineTo(x1, yb + 12 * tintaK); g.quadraticCurveTo(xc, y + comba + 12 * tintaK, x0, ya + 12 * tintaK); g.closePath(); g.fill();
      g.strokeStyle = PAP.costura; g.lineWidth = 2.8 * tintaK; g.beginPath(); g.moveTo(x0, ya); g.quadraticCurveTo(xc, y + comba, x1, yb); g.stroke();
    }
    g.lineJoin = "round"; g.strokeStyle = PAP.tinta; g.lineWidth = 2 * TINTA_P * tintaK;
    camino(); g.stroke();
    // bordes del papel en los niveles de corte
    g.beginPath(); g.moveTo(xc - 900, yHi + m * -900); g.lineTo(xc + 900, yHi + m * 900); g.moveTo(xc - 900, yLo + m * -900); g.lineTo(xc + 900, yLo + m * 900); g.stroke();
    g.restore();
  }
  const COST_TORSO = [698, 636, 574, 512, 450, 388, 326, 270].map((y, i) => [y, (i % 2 ? -0.07 : 0.05), 6]);
  const COST_CABEZA = [];
  for (let y = 812; y > 170; y -= 64) COST_CABEZA.push([y, 0.2 + 0.05 * Math.sin(y), 10]);
  const COST_ZAPATO = [[30, -0.1, 4]];
  const M_TORSO = -0.04, M_CABEZA = 0.2, M_ZAP = 0;

  // dibuja todas las vendas de Guillermo con su postura p (en coordenadas de su hoja)
  function dibMomia(g, p, V, t) {
    if (V.hi <= V.lo || V.hi < 0) return;
    const RF = referencia();
    g.save();
    g.translate(p.x, p.suelo); g.scale(p.s, p.s); g.translate(-G.PELVIS.x, -G.SUELO);
    g.lineJoin = "round"; g.lineCap = "round";
    const yLoG = yDe(V.lo), yHiG = yDe(V.hi);
    // piernas y botas (la lejana primero)
    for (const lado of ["lejos", "cerca"]) {
      const tb = p.piernas[lado].tob, ref = RF.zap[lado];
      g.save(); g.translate(tb.x, tb.y); g.rotate(p.piernas[lado].ang);
      dibTrozo(g, ZAPATO_P, yLoG - ref, yHiG - ref, M_ZAP, 40, COST_ZAPATO, gg => { gg.fillStyle = PAP.sombra; gg.fillRect(-120, -60, 80, 200); gg.fillRect(-120, 70, 320, 60); }, 1);
      g.restore();
      const J = geoTira(curvaPierna(p, lado), NB_PIERNA, anchoPierna, lado === "cerca" ? 3 : 11, 26);
      dibExtremidad(g, J, RF.piernas[lado], V);
    }
    // torso
    g.save(); g.translate(p.pelvis.x, p.pelvis.y); g.rotate(p.torso); g.scale(p.torsoEsc.x, p.torsoEsc.y); g.translate(-G.PELVIS.x, -G.PELVIS.y);
    dibTrozo(g, TORSO_P, yLoG, yHiG, M_TORSO, 250, COST_TORSO, gg => {
      gg.fillStyle = PAP.sombra; gg.beginPath(); gg.moveTo(60, 230); gg.lineTo(175, 230); gg.quadraticCurveTo(150, 500, 190, 800); gg.lineTo(60, 800); gg.closePath(); gg.fill();
      gg.fillStyle = PAP.luz; gg.beginPath(); gg.moveTo(318, 280); gg.lineTo(342, 280); gg.quadraticCurveTo(326, 500, 352, 760); gg.lineTo(330, 760); gg.quadraticCurveTo(306, 500, 318, 280); gg.closePath(); gg.fill();
    }, 1);
    g.restore();
    // cabeza (con la rendija de los ojos)
    const H = G.cabeza(p);
    g.save(); g.translate(H.cx, H.cy); g.rotate(H.ang); g.scale(H.kx, H.ky); g.translate(-700, -800);
    const yP = y => 800 + (y - 256) / 0.6;
    dibTrozo(g, HUEVO, yP(yLoG), yP(yHiG), M_CABEZA, 800, COST_CABEZA, gg => {
      gg.fillStyle = PAP.sombra; gg.beginPath(); gg.ellipse(560, 520, 170, 420, 0.1, 0, TAU); gg.fill();
      gg.fillStyle = PAP.luz; gg.beginPath(); gg.ellipse(1030, 470, 40, 220, 0.15, 0, TAU); gg.fill();
    }, 1 / 0.6, RENDIJA);
    // dentro de la rendija: sombra en los bordes (si ya hay papel alrededor de los ojos)
    const yOjos = yP(yHiG) < 520 && yP(yLoG) > 640;
    if (yOjos) {
      g.save(); g.beginPath(); poli(g, RENDIJA); g.clip();
      g.strokeStyle = "rgba(25,12,30,0.78)"; g.lineWidth = 30; g.beginPath(); poli(g, RENDIJA); g.stroke();
      g.restore();
      g.strokeStyle = PAP.tinta; g.lineWidth = TINTA_P / 0.6; g.beginPath(); poli(g, RENDIJA); g.stroke();
    }
    g.restore();
    // brazos y manoplas (el lejano primero)
    for (const lado of ["lejos", "cerca"]) {
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m) continue;
      const J = geoTira(curvaBrazo(p, lado), NB_BRAZO, anchoBrazo, lado === "cerca" ? 21 : 29, 0);
      const W = RF.brazos[lado];
      // hombrera de papel (tapa el hombro de la camiseta)
      const v0 = visible(W[0][0], W[0][1], V);
      if (v0.f > 0.5) { const h = J[0].c; g.beginPath(); g.ellipse(h.x + (lado === "cerca" ? 6 : -4), h.y + 16, 44 * (v0.f - 0.5) * 2, 46 * (v0.f - 0.5) * 2, 0, 0, TAU);
        g.fillStyle = PAP.base; g.fill(); g.strokeStyle = PAP.tinta; g.lineWidth = TINTA_P; g.stroke(); }
      dibExtremidad(g, J, W, V);
      const vm = visible(RF.manos[lado][0], RF.manos[lado][1], V);
      if (vm.f > 0.01) manopla(g, m, 0.55 + 0.45 * vm.f, vm.f);
    }
    g.restore();
  }
  function manopla(g, m, e, al) {
    const mu = m.mu ?? -1.75;
    g.save(); g.translate(m.x, m.y); g.rotate(mu + Math.PI); g.scale(e, e); g.globalAlpha *= clamp(al * 3);
    const forma = () => { g.beginPath(); g.ellipse(8, 0, 48, 38, 0, 0, TAU); };
    forma(); g.fillStyle = PAP.base; g.fill();
    g.save(); forma(); g.clip(); g.fillStyle = PAP.sombra; g.fillRect(-60, 10, 130, 40);
    g.strokeStyle = PAP.costura; g.lineWidth = 2.6; g.beginPath(); g.moveTo(-6, -40); g.quadraticCurveTo(2, 0, -8, 40); g.moveTo(26, -40); g.quadraticCurveTo(32, 0, 22, 40); g.stroke(); g.restore();
    forma(); g.strokeStyle = PAP.tinta; g.lineWidth = TINTA_P; g.stroke();
    // pulgar
    g.beginPath(); g.ellipse(10, -34, 18, 12, -0.3, Math.PI * 0.9, Math.PI * 2.1); g.fillStyle = PAP.base; g.fill(); g.stroke();
    g.restore();
  }

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  const CARAS_G = {
    inicio: E({ mx: 0.9, my: 0.05, sonr: 0.35, orig: 0, sd: 4, gd: 0.04, si: 4, gi: 0.04 }),
    curioso: E({ mx: 0.9, my: 0.3, sd: 16, gd: 0.12, si: -2, gi: -0.04, orig: 0, abre: 5, ancho: 0.6, sonr: 0.05 }),
    idea: E({ mx: 0.9, my: 0.1, iris: 1.08, sd: 24, gd: 0.14, si: 24, gi: 0.14, orig: 0, abre: 26, ancho: 0.95, sonr: 0.9 }),
    listo: E({ mx: 0.9, my: 0, c: 0.45, h: 0.9, sd: 16, gd: 0.1, si: 16, gi: 0.1, orig: 0, abre: 16, ancho: 1.05, sonr: 1 }),
    tobillo: E({ mx: 0.6, my: 0.95, sd: 14, gd: 0.08, si: 14, gi: 0.08, orig: 0, abre: 8, ancho: 0.7, sonr: 0.4 }),
    wiii: E({ mx: 0, my: 0, c: 1, h: 1, sd: 18, gd: 0.12, si: 18, gi: 0.12, orig: 0, abre: 34, ancho: 1.1, sonr: 1, lengua: 0.3 }),
    para: E({ mx: 0.2, my: 0.1, iris: 0.9, sd: 12, gd: 0.06, si: 12, gi: 0.06, orig: 0, sonr: 0.2 }),
    mira: E({ mx: 0.45, my: 0.85, sd: 10, gd: 0.05, si: 10, gi: 0.05, orig: 0, sonr: 0.2 }),
    manos: E({ mx: 0.9, my: 0.2, iris: 1.05, sd: 18, gd: 0.1, si: 18, gi: 0.1, orig: 0, sonr: 0.4 }),
    orgullo: E({ mx: -0.85, my: -0.05, c: 0.55, h: 1, sd: 16, gd: 0.12, si: 16, gi: 0.12, orig: 0, sonr: 0.8 }),
    malo: E({ mx: -0.85, my: 0.05, c: 0.35, sd: -8, gd: -0.22, si: -8, gi: -0.22, orig: 0, sonr: 0.6 }),
    tiron: E({ mx: -0.5, my: 0.1, iris: 0.66, sd: 28, gd: 0.18, si: 28, gi: 0.18, orig: 0, abre: 26, ancho: 0.7, sonr: -0.3 }),
    abajo: E({ mx: 0.2, my: 0.95, iris: 0.75, sd: 26, gd: 0.25, si: 26, gi: 0.25, orig: 0, abre: 20, ancho: 0.8, sonr: -0.4 }),
    gira: E({ mx: 0, my: 0, esp: 1, sd: 20, gd: 0.15, si: 20, gi: 0.15, orig: 0, abre: 30, ancho: 0.85, sonr: -0.3 }),
    mareo: E({ mx: 0.3, my: -0.1, esp: 1, c: 0.25, sd: 8, gd: 0.18, si: -4, gi: -0.08, orig: 0, abre: 16, ancho: 0.85, sonr: 0.15, lengua: 0.8 }),
    despeja: E({ mx: 0.5, my: 0, c: 0.2, sd: 6, gd: 0.04, si: 6, gi: 0.04, orig: 0, abre: 4, ancho: 0.7, sonr: 0.1 }),
    ve: E({ mx: 0.92, my: 0.05, iris: 0.85, sd: 22, gd: 0.14, si: 22, gi: 0.14, orig: 0, abre: 12, ancho: 0.65, sonr: -0.1 }),
    terror: E({ mx: -0.85, my: 0, iris: 0.6, sd: 30, gd: 0.28, si: 30, gi: 0.28, orig: 0, abre: 36, ancho: 1.15, sonr: -0.85 })
  };
  const GUION_CARA_G = [
    [0.7, 1.0, "inicio"], [T.duda, T.duda + 0.2, "curioso"], [T.idea, T.idea + 0.1, "idea"], [T.abre0 + 0.15, T.abre1, "listo"],
    [T.llega, T.llega + 0.1, "tobillo"], [T.gira0 + 0.05, T.giraB, "wiii"], [T.gira1 - 0.1, T.gira1 + 0.05, "para"],
    [T.mira0, T.mira0 + 0.15, "mira"], [T.brazos0 + 0.1, T.brazos0 + 0.3, "manos"], [T.camara, T.camara + 0.18, "orgullo"],
    [T.marcha0 + 0.3, T.marcha0 + 0.5, "malo"], [T.tensa - 0.02, T.tensa + 0.05, "tiron"], [T.mira2, T.mira2 + 0.1, "abajo"],
    [T.gira2_0 + 0.1, T.gira2B, "gira"], [T.pop, T.pop + 0.2, "mareo"], [T.mareo1, T.mareo1 + 0.12, "despeja"],
    [T.ve, T.ve + 0.1, "ve"], [T.terror, T.terror + 0.12, "terror"]
  ];
  const P0G = { pel: 0, torso: 0, cab: 0, cx: 0, cy: 0, cp: 0, cd: 0.5, lx: 0, ly: 0, lp: 0, ld: 0.5 };
  const CG = o => Object.assign({}, P0G, o);
  const CUERPOS_G = {
    bolsillos: CG({}),
    curioso: CG({ torso: -0.02, cab: 0.07 }),
    abre: CG({ pel: -4, torso: -0.03, cab: -0.04, cx: -175, cy: 240, cp: 1, cd: 1, lx: 180, ly: 230, lp: 1, ld: 1 }),
    tobillo: CG({ pel: 8, torso: 0.1, cab: 0.12, cx: -165, cy: 250, cp: 1, cd: 1, lx: 175, ly: 240, lp: 1, ld: 1 }),
    mira: CG({ pel: 6, torso: 0.06, cab: 0.14, cx: -165, cy: 255, cp: 1, cd: 0.8, lx: 172, ly: 245, lp: 1, ld: 0.8 }),
    momia: CG({ torso: 0.01, cab: -0.02, cx: 315, cy: 42, cp: 1, cd: 0.7, lx: 262, ly: 30, lp: 1, ld: 0.7 }),
    tiron: CG({ pel: 6, torso: -0.12, cab: -0.1, cx: 250, cy: -30, cp: 1, cd: 1, lx: 240, ly: -50, lp: 1, ld: 1 }),
    gira: CG({ pel: 0, torso: 0, cab: 0, cx: -245, cy: 115, cp: 1, cd: 1, lx: 250, ly: 100, lp: 1, ld: 1 }),
    mareo: CG({ pel: 14, torso: -0.04, cab: 0.1, cx: -120, cy: 285, cp: 1, cd: 0.8, lx: 115, ly: 280, lp: 1, ld: 0.8 }),
    terror: CG({ pel: 16, torso: -0.1, cab: -0.06, cx: 96, cy: -160, cp: 1, cd: 1, lx: 36, ly: -150, lp: 1, ld: 1 })
  };
  const GUION_CUERPO_G = [
    [T.duda, T.duda + 0.25, "curioso"], [T.abre0, T.abre1, "abre", salida], [T.llega - 0.04, T.llega + 0.1, "tobillo"], [T.gira0 - 0.08, T.gira0 + 0.12, "abre"],
    [T.mira0, T.mira0 + 0.15, "mira"], [T.brazos0, T.brazos1, "momia"], [T.tensa - 0.03, T.tensa + 0.08, "tiron"],
    [T.gira2_0, T.gira2_0 + 0.25, "gira"], [T.pop + 0.02, T.pop + 0.4, "mareo"], [T.terror - 0.05, T.terror + 0.18, "terror"]
  ];
  // sitio de Guillermo: x, escala y suelo (al marchar se acerca a la cámara)
  const XG = [[0, 360], [T.marcha0, 360], [T.marcha0 + 0.32, 372], [T.marcha0 + 0.68, 392], [T.pisa, 414], [T.tensa, 426], [T.gira2_0 + 0.12, 440],
    [T.pop, 440], [T.pop + 0.3, 410], [T.pop + 0.6, 370], [T.tambalea1, 326], [T.terror + 0.05, 326], [T.terror + 0.35, 310], [DUR, 310]];
  const acerca = t => suave(fase(t, T.marcha0, T.pisa + 0.1));
  const ESC_G = t => lerp(S, 0.33, acerca(t)), SUELO_G = t => lerp(SUELO, 574, acerca(t));
  // pasos (x de pantalla del tobillo respecto a nada: absoluto)
  const PASOS_G = {
    cerca: [[-9, -8, 336], [T.abre0 + 0.02, T.abre0 + 0.22, 330, 10], [T.marcha0, T.marcha0 + 0.3, 364, 16], [T.marcha0 + 0.62, T.pisa - 0.02, 426, 18],
            [T.tensa + 0.1, T.gira2_0 + 0.1, 432, 6], [T.pop + 0.06, T.pop + 0.3, 400, 14], [T.pop + 0.4, T.pop + 0.62, 356, 12], [T.tambalea1 - 0.22, T.tambalea1, 312, 10],
            [T.terror + 0.08, T.terror + 0.3, 296, 12]],
    lejos: [[-9, -8, 381], [T.abre0 + 0.1, T.abre0 + 0.3, 388, 10], [T.marcha0 + 0.34, T.marcha0 + 0.64, 398, 16],
            [T.mira2 + 0.02, T.gira2_0 + 0.14, 452, 10], [T.pop + 0.2, T.pop + 0.44, 426, 14], [T.pop + 0.56, T.pop + 0.8, 384, 12], [T.tambalea1 - 0.1, T.tambalea1 + 0.1, 346, 10],
            [T.terror + 0.18, T.terror + 0.4, 330, 10]]
  };
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const R_M = G.MUNECA_R * G.JK;
  const manoDesde = (m, ang, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_GC = manoDesde({ x: 131, y: 652 }, 0, -1.75), BOLS_GL = manoDesde({ x: 372, y: 648 }, 0, -1.75);

  // nivel del papel: se ve entre lo y hi (alturas w)
  function nivel(t) {
    const e = u => 0.75 * u + 0.25 * suave(u);
    if (t < T.des0) return { lo: -0.02, hi: t < T.env0 ? -0.02 : lerp(-0.02, 1.02, e(fase(t, T.env0, T.env1))) };
    return { lo: lerp(-0.02, 1.02, e(fase(t, T.des0, T.des1))), hi: 1.02 };
  }

  function poseGBase(t, refe) {
    const b = refe ? CUERPOS_G.abre : guion(GUION_CUERPO_G, CUERPOS_G, "bolsillos", t);
    const s = refe ? S : ESC_G(t), suelo = refe ? SUELO : SUELO_G(t);
    const x = refe ? 360 : recorrido(XG, t), respira = refe ? 0 : Math.sin(t * 2.3);
    const p = { x, suelo, s, tirasLimpias: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    for (const lado of ["cerca", "lejos"]) {
      let f = refe ? { x: lado === "cerca" ? 330 : 388, alza: 0, u: 0 } : pie(PASOS_G[lado], t), ang = f.alza > 1 ? -0.16 * Math.sin(Math.PI * f.u) : 0;
      // el pie lejano da un paso largo y tieso… y se queda clavado en el aire por la tira que pisa el otro pie
      if (!refe && lado === "lejos" && t > T.pisa + 0.06 && t < T.gira2_0 + 0.14) {
        const u = fase(t, T.pisa + 0.06, T.tensa);
        let fx = lerp(398, 566, salida(u)), al = 52 * salida(u);
        const tir = t > T.tensa ? Math.exp(-(t - T.tensa) * 5) * Math.abs(Math.sin((t - T.tensa) * 22)) : 0;
        fx -= 26 * tramo(t, T.tensa, T.tensa + 0.05) + 10 * tir; al -= 7 * tir;
        const baja = tramo(t, T.mira2 + 0.04, T.gira2_0 + 0.14);
        f = { x: lerp(fx, 452, baja), alza: lerp(al, 0, baja), u: 0.5 }; ang = lerp(-0.3 * salida(u), 0, baja);
      }
      p.piernas[lado] = { tob: { x: G.PELVIS.x + (f.x - p.x) / s, y: TOB_G[lado] - f.alza / s }, ang };
    }
    const Tr = G.tronco(p), hc = Tr(G.HOMBRO_C), hl = Tr(G.HOMBRO);
    const c = mezcla({ x: hc.x + b.cx, y: hc.y + b.cy }, BOLS_GC, 1 - clamp(b.cp * 1.4));
    const l = mezcla({ x: hl.x + b.lx, y: hl.y + b.ly }, BOLS_GL, 1 - clamp(b.lp * 1.4));
    let cmu = muHacia(c, hc, -0.1), lmu = muHacia(l, hl, 0.1);
    if (b.cp < 0.05) cmu = -1.75;
    if (b.lp < 0.05) lmu = -1.75;
    p.manoCerca = { x: c.x, y: c.y, ang: 0, mu: cmu, dobla: -1, puno: b.cp, dedos: dedosTodos(b.cd) };
    p.manoLejos = { x: l.x, y: l.y, ang: 0, mu: lmu, dobla: -1, puno: b.lp, dedos: dedosTodos(b.ld) };
    p.ikContinuo = false;
    p._b = b;
    return p;
  }

  function poseG(t, pd) {
    const p = poseGBase(t, false), b = p._b;
    // salto de alegría al abrir los brazos; vaivén al girar
    p.pelvis.y -= 30 * campana(t, T.abre0 + 0.05, T.abre1 + 0.1);
    const g1 = giro1(t), g2 = giro2(t);
    p.pelvis.y -= 8 * Math.abs(Math.sin(g1.ang * 2)) * g1.vel;
    // al parar: se tambalea
    const tamb = t > T.gira1 - 0.05 ? Math.exp(-(t - T.gira1) * 4) * Math.sin((t - T.gira1) * 13) * tramo(t, T.gira1 - 0.05, T.gira1 + 0.05) : 0;
    p.torso += 0.09 * tamb; p.cabeza.ang += 0.08 * tamb;
    // marcha de momia: tieso, se balancea de lado a lado
    const mar = tramo(t, T.marcha0, T.marcha0 + 0.15) * (1 - tramo(t, T.tensa - 0.05, T.tensa));
    p.torso += 0.06 * Math.sin((t - T.marcha0) * Math.PI / 0.34) * mar;
    p.pelvis.y -= 9 * Math.abs(Math.sin((t - T.marcha0) * Math.PI / 0.34)) * mar;
    // brazos de momia: suben y bajan un poco al andar
    const bm = tramo(t, T.brazos1 - 0.1, T.brazos1 + 0.1) * (1 - tramo(t, T.tensa - 0.05, T.tensa));
    const vaiv = 14 * Math.sin((t - T.marcha0) * Math.PI / 0.34 + 0.6) * mar;
    p.manoCerca.y += vaiv * bm; p.manoLejos.y -= vaiv * bm;
    // tirón: se va hacia delante y se queda clavado
    const ti = t > T.tensa ? Math.exp(-(t - T.tensa) * 6) * Math.sin((t - T.tensa) * 22) : 0;
    p.torso += 0.1 * ti * tramo(t, T.tensa, T.tensa + 0.02);
    // giro 2: brazos agitados
    const ag = tramo(t, T.gira2_0, T.gira2B) * (1 - tramo(t, T.gira2C, T.gira2_1));
    p.manoCerca.y += 30 * Math.sin(t * 17) * ag; p.manoLejos.y += 30 * Math.sin(t * 15 + 1) * ag;
    // mareo: el cuerpo da vueltecitas
    const mar2 = tramo(t, T.pop, T.pop + 0.3) * (1 - tramo(t, T.mareo1, T.mareo1 + 0.25));
    p.torso += 0.09 * Math.sin((t - T.pop) * 5.2) * mar2; p.cabeza.ang += 0.12 * Math.sin((t - T.pop) * 5.2 + 0.9) * mar2;
    p.pelvis.y += 6 * Math.cos((t - T.pop) * 5.2) * mar2;
    // se despeja: sacude la cabeza
    p.cabeza.ang += 0.12 * Math.sin((t - T.mareo1) * 30) * campana(t, T.mareo1, T.mareo1 + 0.3);
    // terror: tiembla
    const te = tramo(t, T.terror, T.terror + 0.1);
    p.cabeza.ang += 0.02 * Math.sin(t * 60) * te; p.pelvis.y += 1.5 * Math.sin(t * 57) * te;
    p.manoCerca.x += 3 * Math.sin(t * 61) * te; p.manoLejos.x += 3 * Math.sin(t * 59 + 1) * te;
    // cara
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    // mientras Deivi enseña el rollo, lo sigue con los ojos
    if (pd && t < T.agacha1) {
      const k = campana(t, T.lanza0, T.lanza1 + 0.25);
      ex.my = lerp(ex.my, -0.6, k);
    }
    p.cara = cara(ex, parpadeo(t, [1.7, 3.0, T.parp, T.parp + 0.32, 8.2, T.mareo1 + 0.05, T.mareo1 + 0.22]));
    p.cara.rubor = 0.3 * tramo(t, T.idea, T.idea + 0.2) * (1 - tramo(t, T.gira0, T.gira0 + 0.3));
    p.sudor = 0.9 * tramo(t, T.terror, T.terror + 0.2);
    p.giro = t < T.gira2_0 ? g1 : g2;
    p.capaTronco = null;
    return p;
  }

  /* =====================================================================================
   * DEIVI (a la derecha, mira a la izquierda)
   * ===================================================================================== */
  const CARAS_D = {
    mira: E({ mx: 0.85, my: 0.05, c: 0.12, sd: 6, gd: 0.05, si: 8, gi: 0.06, orig: 0, sonr: 0.5, ancho: 0.95 }),
    picaro: E({ mx: 0.85, my: 0.05, c: 0.3, sd: 16, gd: 0.12, si: -2, gi: -0.04, orig: 0, sonr: 0.9, abre: 4, ancho: 1 }),
    rollo: E({ mx: 0.4, my: -0.6, c: 0.1, sd: 12, gd: 0.08, si: 12, gi: 0.08, orig: 0, sonr: 0.7, ancho: 0.95 }),
    cejas: E({ mx: 0.85, my: 0, c: 0.2, sd: 22, gd: 0.14, si: 22, gi: 0.14, orig: 0, sonr: 0.95, abre: 6, ancho: 1.05 }),
    concentra: E({ mx: 0.7, my: 0.4, c: 0.3, sd: -4, gd: -0.1, si: -4, gi: -0.1, orig: 0, sonr: 0.45, abre: 6, ancho: 0.85, lengua: 0.9 }),
    sube: E({ mx: 0.75, my: -0.3, c: 0.15, sd: 10, gd: 0.06, si: 10, gi: 0.06, orig: 0, sonr: 0.7, abre: 4, ancho: 0.95, lengua: 0.5 }),
    rasga: E({ mx: 0.6, my: -0.1, c: 0.65, z: 0.8, sd: 6, gd: 0.06, si: 6, gi: 0.06, orig: 0, sonr: 0.8, abre: 10, ancho: 1.1 }),
    contento: E({ mx: 0.85, my: -0.05, c: 0.35, h: 0.7, sd: 14, gd: 0.1, si: 14, gi: 0.1, orig: 0, sonr: 0.9, abre: 10, ancho: 1 }),
    miedo: E({ mx: 0.85, my: -0.05, iris: 0.82, sd: 26, gd: 0.2, si: 26, gi: 0.2, orig: 0, abre: 30, ancho: 0.55, sonr: -0.15 }),
    astuto: E({ mx: 0.7, my: 0.5, c: 0.4, sd: -2, gd: -0.06, si: 16, gi: 0.1, orig: 0, sonr: 0.85, abre: 3, ancho: 1 }),
    risa: E({ mx: 0.6, my: 0.2, c: 1, h: 1, sd: 14, gd: 0.1, si: 14, gi: 0.1, orig: 0, sonr: 1, abre: 30, ancho: 1.1, lengua: 0.3 }),
    esfuerzo: E({ mx: 0.6, my: 0.6, c: 0.8, z: 1, sd: -6, gd: -0.15, si: -6, gi: -0.15, orig: 0, sonr: 0.7, abre: 14, ancho: 1.2 }),
    triunfo: E({ mx: 0.85, my: 0, c: 0.25, sd: 20, gd: 0.14, si: 20, gi: 0.14, orig: 0, sonr: 1, abre: 12, ancho: 1.08 }),
    guino: E({ mx: -0.85, my: -0.05, h: 1, wd: 1, sd: 6, gd: 0.05, si: 16, gi: 0.12, orig: 0, sonr: 1, abre: 8, ancho: 1.05 })
  };
  const GUION_CARA_D = [
    [T.lanza0 - 0.1, T.lanza0 + 0.1, "rollo"], [T.lanza1 - 0.05, T.lanza1 + 0.1, "picaro"], [T.cejas0, T.cejas0 + 0.1, "cejas"],
    [T.cejas1, T.cejas1 + 0.15, "picaro"], [T.agacha0, T.agacha0 + 0.2, "concentra"], [T.dedo0, T.dedo0 + 0.1, "picaro"],
    [T.gira0 + 0.1, T.gira0 + 0.3, "concentra"], [4.9, 5.2, "sube"], [T.rasga - 0.06, T.rasga + 0.04, "rasga"],
    [T.tubo1 - 0.3, T.tubo1, "contento"], [T.miedo0, T.miedo0 + 0.12, "miedo"], [T.miedo1, T.miedo1 + 0.2, "astuto"],
    [T.risa0 - 0.1, T.risa0 + 0.1, "risa"], [T.vaD0, T.vaD0 + 0.2, "picaro"], [T.remo0, T.remo0 + 0.1, "esfuerzo"],
    [T.remo1, T.sube, "triunfo"], [T.guino - 0.06, T.guino + 0.06, "guino"]
  ];
  // manos respecto a sus hombros (hoja de Deivi): c = cercana (la de fuera), l = lejana (la que da a Guillermo)
  // la mano lejana nunca vuelve al bolsillo (cuelga suelta): así su codo siempre dobla igual, sin saltos
  const P0D = { pel: 0, torso: 0, cab: 0, cx: 9, cy: 377, cp: 0, cd: 0.5, lx: 30, ly: 338, lp: 1, ld: 0.45 };
  const CD = o => Object.assign({}, P0D, o);
  const CUERPOS_D = {
    bolsillos: CD({}),
    rollo: CD({ torso: 0.03, cab: 0.02, lx: 140, ly: 250, lp: 1, ld: 0.32 }),
    agacha: CD({ pel: 240, torso: 0.3, cab: -0.18, cx: 150, cy: 300, cp: 1, cd: 0.6, lx: 140, ly: 250, lp: 1, ld: 0.32 }),
    de_pie: CD({ pel: 0, torso: 0.06, cab: -0.04, cx: 30, cy: 330, cp: 1, cd: 0.55, lx: 140, ly: 250, lp: 1, ld: 0.32 }),
    miedo: CD({ pel: -6, torso: -0.14, cab: -0.1, cx: 40, cy: -190, cp: 1, cd: 1, lx: 215, ly: -30, lp: 1, ld: 1 }),
    risa: CD({ pel: 16, torso: 0.12, cab: 0.08, cx: 120, cy: 260, cp: 1, cd: 0.7, lx: 120, ly: -10, lp: 1, ld: 0.9 }),
    remolino: CD({ pel: 250, torso: 0.36, cab: -0.22, cx: 240, cy: 440, cp: 1, cd: 0.7, lx: 200, ly: 400, lp: 1, ld: 0.7 }),
    gigante: CD({ pel: 8, torso: -0.06, cab: -0.02, cx: 140, cy: 160, cp: 1, cd: 0.4, lx: 120, ly: 160, lp: 1, ld: 0.4 })
  };
  const GUION_CUERPO_D = [
    [T.lanza0 - 0.2, T.lanza0, "rollo"], [T.agacha0, T.agacha1, "agacha"], [T.gira1 - 0.3, T.gira1, "de_pie"],
    [T.atras1 - 0.2, T.atras1 + 0.1, "bolsillos"], [T.miedo0 - 0.06, T.miedo0 + 0.1, "miedo", salida], [T.miedo1, T.miedo1 + 0.3, "bolsillos"],
    [T.risa0 - 0.1, T.risa0 + 0.15, "risa"], [T.risa1, T.risa1 + 0.3, "bolsillos"], [T.vaD1 - 0.1, T.remo0 + 0.02, "remolino"],
    [T.remo1, T.sube, "gigante"]
  ];
  const XD = [[0, 700], [T.anda0, 700], [T.anda1, 615], [T.atras0, 615], [T.atras1, 742], [T.vaD0, 742], [T.vaD1, 650], [DUR, 650]];
  const PASOS_D = {
    cerca: [[-9, -8, 715], [T.anda0, T.anda0 + 0.26, 665, 20], [T.anda0 + 0.3, T.anda1, 642, 16], [T.atras0 + 0.12, T.atras0 + 0.4, 700, 18], [T.atras0 + 0.44, T.atras1, 757, 16],
            [T.vaD0, T.vaD0 + 0.26, 712, 20], [T.vaD0 + 0.3, T.vaD1, 680, 16]],
    lejos: [[-9, -8, 653], [T.anda0 + 0.14, T.anda0 + 0.4, 600, 20], [T.anda0 + 0.42, T.anda1 + 0.04, 556, 14], [T.atras0, T.atras0 + 0.28, 640, 18], [T.atras0 + 0.32, T.atras1 - 0.04, 695, 16],
            [T.vaD0 + 0.14, T.vaD0 + 0.4, 645, 20], [T.vaD0 + 0.42, T.vaD1 + 0.04, 592, 14]]
  };
  function tobDesdeSuela(P, p, q, ang, cx, alto) {
    const ah = p.espejo ? -ang : ang, h = P.aHoja(p, q), o = rot({ x: cx, y: alto }, ah);
    return { tob: { x: h.x - o.x, y: h.y - o.y }, ang: ah };
  }

  // el rollo pequeño (centro en pantalla) mientras envuelve: sube con el nivel del papel
  const ROLLO_R0 = 15, ROLLO_L = 24, TUBO_R = 6.2;
  const radioRollo = t => {
    const u = clamp(nivel(Math.min(t, T.des0 - 0.01)).hi);
    return Math.sqrt(TUBO_R * TUBO_R + (ROLLO_R0 * ROLLO_R0 - TUBO_R * TUBO_R) * (1 - u));
  };
  function rolloEnvolviendo(t) {
    const u = clamp(nivel(Math.min(t, T.des0 - 0.01)).hi);
    const y = lerp(470, 168, suave(clamp(u * 1.02))) + 6 * Math.sin(t * 9) * tramo(t, T.env0, T.env0 + 0.2);
    return { x: lerp(532, 520, u), y };
  }

  function poseD(t) {
    const b = guion(GUION_CUERPO_D, CUERPOS_D, "bolsillos", t);
    const respira = Math.sin(t * 2.2 + 0.7);
    const p = { suelo: SUELO, s: S, espejo: true, tirasLimpias: true, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    p.x = recorrido(XD, t);
    // agachado mientras envuelve: se va levantando a la vez que sube el rollo
    const env = t >= T.env0 && t < T.gira1;
    let pel = b.pel, torso = b.torso;
    if (t > T.agacha1 && t < T.gira1) {
      const R0 = rolloEnvolviendo(t), k = clamp((R0.y - 300) / 170);
      const kk = env ? k : 1;
      pel = lerp(CUERPOS_D.de_pie.pel, CUERPOS_D.agacha.pel, kk * (t < T.gira1 - 0.3 ? 1 : 1 - tramo(t, T.gira1 - 0.3, T.gira1)));
      torso = lerp(CUERPOS_D.de_pie.torso, CUERPOS_D.agacha.torso, kk);
      p.cabeza.ang = lerp(-0.1, CUERPOS_D.agacha.cab, kk);
    }
    // pies
    for (const lado of ["cerca", "lejos"]) {
      const f = pie(PASOS_D[lado], t);
      const q = { x: f.x - 13, y: SUELO - f.alza };
      const r = tobDesdeSuela(D, p, q, f.alza > 1 ? -0.18 * Math.sin(Math.PI * f.u) : 0, 44, D.TOBILLO_ALTO);
      p.piernas[lado] = { tob: { x: r.tob.x, y: r.tob.y - (lado === "lejos" ? 6 : 0) }, ang: r.ang };
    }
    p.pelvis = { x: D.PELVIS.x, y: D.PELVIS.y + pel + respira * 1.2 };
    p.torso = torso;
    // risa: se sacude
    const ri = campana(t, T.risa0, T.risa1);
    p.pelvis.y += 6 * Math.abs(Math.sin((t - T.risa0) * 16)) * ri; p.cabeza.ang += 0.05 * Math.sin((t - T.risa0) * 16) * ri;
    // remolino: todo el cuerpo vibra
    const re = campana(t, T.remo0, T.remo1);
    p.torso += 0.05 * Math.sin(t * 40) * re; p.pelvis.y += 6 * Math.sin(t * 37) * re;
    // cara (las cejas suben y bajan dos veces al enseñar el rollo y al levantar el gigante)
    const ex = guion(GUION_CARA_D, CARAS_D, "mira", t);
    const cj = campana(t, T.cejas0, T.cejas1);
    if (cj > 0) { const o = 10 * Math.sin((t - T.cejas0) * 26); ex.sd += o * cj; ex.si += o * cj; }
    const cj2 = campana(t, T.muestra, T.muestra + 0.5);
    if (cj2 > 0) { const o = 10 * Math.sin((t - T.muestra) * 26); ex.sd += 8 * cj2 + o * cj2; ex.si += 8 * cj2 + o * cj2; }
    p.cara = cara(ex, parpadeo(t, [2.3, 4.6, 7.0, 9.0, 12.2, 13.4]));
    p.cara.rubor = 0.25 * campana(t, T.risa0, T.risa1 + 0.3);
    // ---- manos ----
    const Tr = D.tronco(p), hc = Tr(D.HOMBRO_C), hl = Tr(D.HOMBRO);
    const bC = Tr(D.BOLSILLO_C), bL = Tr(D.BOLSILLO_L);
    let c = mezcla({ x: hc.x + b.cx, y: hc.y + b.cy }, bC, 1 - clamp(b.cp * 1.4));
    let l = mezcla({ x: hl.x + b.lx, y: hl.y + b.ly }, bL, 1 - clamp(b.lp * 1.4));
    let cmu = muHacia(c, hc, 0.1), lmu = muHacia(l, hl, -0.1), cdedos = dedosTodos(b.cd), ldedos = dedosTodos(b.ld), cpuno = b.cp, lpuno = b.lp, dobLejos = 1;
    if (b.cp < 0.05) cmu = -1.75;
    if (b.lp < 0.05) lmu = -1.75;
    // el rollo en la mano lejana (pantalla)
    const R0 = rolloMano(t, p);
    if (R0) {
      const k = R0.k;
      const hs = D.aHoja(p, { x: R0.mano.x, y: R0.mano.y });
      l = mezcla(l, hs, k); lmu = lerp(lmu, muHacia(hs, hl, -0.05), k); ldedos = AGARRA; lpuno = Math.max(lpuno, k);
    }
    // giro con el dedo: «¡gira!»
    const dd = campana(t, T.dedo0, T.dedo1);
    if (dd > 0) {
      const a = (t - T.dedo0) * 16, cen = { x: hc.x + 330, y: hc.y - 70 };
      c = mezcla(c, { x: cen.x + 24 * Math.cos(a), y: cen.y + 18 * Math.sin(a) }, clamp(dd * 1.6));
      cmu = lerp(cmu, muHacia(c, hc, 0), clamp(dd * 1.6)); cdedos = { pulgar: 0, indice: 1, medio: 0, anular: 0, menique: 0 }; cpuno = 1;
    }
    // risa: la mano lejana tapa la boca
    const tapa = campana(t, T.risa0 - 0.05, T.risa1 + 0.1);
    if (tapa > 0) { const bo = D.boca(p); l = mezcla(l, { x: bo.x + 40, y: bo.y + 40 }, clamp(tapa * 1.6)); lmu = lerp(lmu, 1.2, clamp(tapa * 1.6)); }
    // remolino: las manos dan vueltas
    if (re > 0) {
      const a = (t - T.remo0) * 30;
      c = { x: c.x + 50 * Math.cos(a) * re, y: c.y + 36 * Math.sin(a) * re }; l = { x: l.x + 50 * Math.cos(a + 2) * re, y: l.y + 36 * Math.sin(a + 2) * re };
    }
    // rollo gigante: lo sujeta por los dos extremos
    const RG = rolloGigante(t, p);
    if (RG) {
      const k = RG.k, hcS = D.aHoja(p, RG.manoC), hlS = D.aHoja(p, RG.manoL);
      c = mezcla(c, hcS, k); l = mezcla(l, hlS, k); cmu = lerp(cmu, muHacia(hcS, hc, 0), k); lmu = lerp(lmu, muHacia(hlS, hl, 0), k);
      cdedos = dedosTodos(0.5); ldedos = dedosTodos(0.5); cpuno = 1; lpuno = 1;
    }
    p.manoCerca = { x: c.x, y: c.y, ang: 0, mu: cmu, dobla: -1, puno: cpuno, dedos: cdedos };
    dobLejos = -1;      // codo de la mano lejana hacia atrás y abajo
    p.manoLejos = { x: l.x, y: l.y, ang: 0, mu: lmu, dobla: dobLejos, puno: lpuno, dedos: ldedos };
    // en el susto la mano de fuera sube por detrás de la cabeza (sin taparle la cara)
    if (t > T.miedo0 - 0.1 && t < T.miedo1 + 0.32) p.manoCerca.detras = true;
    if (R0 && R0.dibuja) { const RR = R0; p.manoLejos.objeto = gg => { gg.save(); gg.setTransform(CAM); rollo(gg, RR.x, RR.y, RR.r, ROLLO_L, RR.ang, 0.36, RR.giro, TUBO_R); gg.restore(); }; }
    if (RG) { const RR = RG; p.manoLejos.objeto = gg => { gg.save(); gg.setTransform(CAM); dibRolloGigante(gg, RR, t); gg.restore(); }; }
    p.ikContinuo = false;
    p.rollo = R0; p.gigante = RG;
    return p;
  }

  // rollo pequeño en la mano de Deivi (posición en pantalla) — null cuando ya no lo lleva
  function rolloMano(t, p) {
    if (t > T.tubo0 + 0.36) return null;
    const Tr = D.tronco(p), hl = D.aPantalla(p, Tr(D.HOMBRO));
    let x, y, ang = 0, r = radioRollo(t);
    const reposo = { x: hl.x - 50, y: hl.y + 62 };
    if (t < T.agacha1) {
      x = reposo.x; y = reposo.y;
      // lo lanza al aire y lo caza
      const u = fase(t, T.lanza0, T.lanza1);
      if (u > 0 && u < 1) { y -= 78 * 4 * u * (1 - u); ang = TAU * suave(u); }
      // lo enseña a la altura de la cara
      const en = campana(t, T.lanza1, T.cejas1 + 0.15);
      x = lerp(x, hl.x - 64, en); y = lerp(y, hl.y - 6, en);
      // baja al agacharse
      const ag = tramo(t, T.agacha0, T.agacha1), R1 = rolloEnvolviendo(T.env0);
      x = lerp(x, R1.x, ag); y = lerp(y, R1.y, ag);
    } else {
      const R1 = rolloEnvolviendo(Math.min(t, T.rasga)); x = R1.x; y = R1.y;
      const fl = campana(t, T.flick0, T.flick0 + 0.16); x -= 26 * fl; y -= 10 * fl;          // latigazo al lanzar la punta
      const ra = campana(t, T.rasga - 0.05, T.rasga + 0.1); x -= 8 * ra; y += 22 * ra;          // tirón hacia abajo al rasgar
      // baja el cartón delante del pecho y lo lanza hacia atrás, por su derecha
      const baja = tramo(t, T.rasga + 0.04, T.tubo0 - 0.16), pecho = { x: hl.x - 16, y: hl.y + 74 };
      x = lerp(x, pecho.x, baja); y = lerp(y, pecho.y, baja);
      const la = tramo(t, T.tubo0 - 0.16, T.tubo0, entrada); x += 62 * la; y -= 30 * la; ang = 0.8 * la;
    }
    const giro = (t > T.env0 ? clamp(nivel(Math.min(t, T.des0 - 0.01)).hi) : 0) * 70;
    const k = 1 - tramo(t, T.tubo0 + 0.02, T.tubo0 + 0.36);
    return { x, y, r, ang, giro, k, mano: { x, y: y + ROLLO_L * 0.5 + 6 }, dibuja: t < T.tubo0 };
  }
  // el cartón vacío vuela por encima del hombro de Deivi hasta salir de cuadro
  let SUELTA = null;
  function carton(t) {
    const u = fase(t, T.tubo0, T.tubo1); if (u <= 0 || u >= 1) return null;
    if (!SUELTA) { const pd = poseD(T.tubo0 - 1e-4); SUELTA = { x: pd.rollo.x, y: pd.rollo.y }; }
    const p0 = SUELTA, p1 = { x: 1130, y: 330 };
    return { x: lerp(p0.x, p1.x, u), y: lerp(p0.y, p1.y, u * u) - 260 * u * (1 - u), ang: 0.8 + u * TAU * 2.2 };
  }

  /* ---------- rollo gigante: sale del remolino y lo levanta por encima de la cabeza ---------- */
  function rolloGigante(t, p) {
    if (t < T.remo1 - 0.04) return null;
    const k = tramo(t, T.remo1 - 0.04, T.remo1 + 0.1);
    const crece = salida(fase(t, T.remo1 - 0.04, T.sube));
    const r = lerp(24, 46, crece), l = lerp(40, 84, crece);
    const sube = tramo(t, T.remo1, T.sube + 0.05);
    const bote = 12 * campana(t, T.muestra, T.muestra + 0.22) + 8 * campana(t, T.muestra + 0.22, T.muestra + 0.42);
    const x = lerp(p.x - 100, p.x - 14, tramo(sube, 0.62, 1)), y = lerp(470, 112, sube) - bote;   // sube por su izquierda, sin taparle la cara
    const ang = -Math.PI / 2 + 0.06 * Math.sin(t * 2.6) * sube;
    const e = rot({ x: 0, y: l / 2 }, ang), n = rot({ x: -r * 0.8, y: 0 }, ang);      // manos por debajo de los extremos
    return { k, x, y, r, l, ang, manoL: { x: x - e.x * 0.72 + n.x, y: y - e.y * 0.72 + n.y }, manoC: { x: x + e.x * 0.72 + n.x, y: y + e.y * 0.72 + n.y } };
  }
  function dibRolloGigante(g, RG, t) { rollo(g, RG.x, RG.y, RG.r, RG.l, RG.ang, 0.42, t * 0.5, RG.r * 0.3); }

  /* =====================================================================================
   * LA PUNTA SUELTA: Deivi la lanza, se enrosca en el tobillo lejano de Guillermo y queda colgando;
   * al parar se tumba en el suelo, Guillermo la pisa al marchar y, con el tirón, todo el papel se
   * desenrolla sobre ese pie y se amontona alrededor.
   * ===================================================================================== */
  function giroPunto(pg, q) { const gr = pg.giroTr; return gr ? { x: gr.ax + (q.x - gr.ax) * gr.sx, y: q.y } : q; }
  // tobillo lejano de Guillermo en pantalla (con el giro de peonza)
  function tobilloG(pg) { const tb = pg.piernas.lejos.tob; return giroPunto(pg, G.aPantalla(pg, { x: tb.x + 34, y: tb.y + 6 })); }
  const COLA_L = 160, PISA_X = 462;
  function colaSuelo(A, L, yS, t) {
    const F = { x: A.x + 12, y: yS }, pts = [A, { x: A.x + 7, y: lerp(A.y, yS, 0.62) }, F];
    for (let i = 1; i <= 5; i++) { const u = i / 5; pts.push({ x: F.x + L * u, y: yS + 13 * u + 2.2 * Math.sin(u * 8 + 1.3) * u }); }
    return pts;
  }
  const largo = pts => { let s = 0; for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); return s; };
  let PIN = null;
  function pin() {
    if (PIN) return PIN;
    const pg = poseG(T.pisa, null), A = tobilloG(pg), pts = colaSuelo(A, COLA_L, pg.suelo - 3, T.pisa);
    let i = 3; while (i < pts.length - 1 && pts[i].x < PISA_X) i++;
    const k = clamp((PISA_X - pts[i - 1].x) / (pts[i].x - pts[i - 1].x));
    const P = mezcla(pts[i - 1], pts[i], k);
    PIN = { P, resto: [P].concat(pts.slice(i)), d0: largo(pts.slice(0, i).concat([P])) };
    return PIN;
  }
  // centro del montón de papel (en el suelo, bajo el pie que pisa)
  const centroMonton = () => { const P = pin().P; return { x: P.x - 2, y: P.y + 4 }; };

  // la cola detrás de Guillermo (se dibuja antes que él)
  function colaDetras(g, t, pg, recoge) {
    if (t < T.nudo) return;
    const A = tobilloG(pg);
    if (t < T.cola0) {     // aleteo corto durante el giro
      const gr = pg.giroTr, sg = gr ? Math.sign(Math.sin(pg.giro.ang) || 1) : 1, L = 22;
      const pts = []; for (let i = 0; i <= 4; i++) { const u = i / 4; pts.push({ x: A.x + sg * L * u, y: A.y + 5 * u + 4 * Math.sin(t * 30 + u * 5) * u }); }
      tira(g, pts, 5);
      return;
    }
    if (t < T.pisa) {
      const L = lerp(22, COLA_L, salida(fase(t, T.cola0, T.cola1)));
      const yS = lerp(A.y + 10, pg.suelo - 3, tramo(t, T.cola0, T.cola0 + 0.25));
      tira(g, colaSuelo(A, L, yS, t), 6);
      return;
    }
    const PN = pin(), a = 1 - recoge;
    if (a <= 0.01) return;
    g.save(); g.globalAlpha *= a;
    tira(g, PN.resto, 6);
    if (t < T.gira2_0 + 0.1) {
      const d = Math.hypot(A.x - PN.P.x, A.y - PN.P.y);
      if (d >= PN.d0 * 0.97) { tira(g, [A, mezcla(A, PN.P, 0.5), PN.P], 5);              // tensa
        tension(g, t, A, PN.P); }
      else { const m = mezcla(A, PN.P, 0.5); tira(g, [A, { x: m.x, y: Math.max(m.y + (PN.d0 - d) * 0.6, m.y) }, PN.P], 5); }   // floja
    }
    g.restore();
  }
  // tira que sube del montón al punto por donde se está desenrollando
  function tiraSube(g, t, pg) {
    if (t < T.gira2_0 + 0.1 || t > T.pop + 0.15) return;
    const V = nivel(t), w = clamp(V.lo + 0.015, 0, 1), bo = bordeEn(w);
    const qa = giroPunto(pg, G.aPantalla(pg, { x: bo.x0, y: bo.y })), qb = giroPunto(pg, G.aPantalla(pg, { x: bo.x1, y: bo.y }));
    const at = mezcla(qa, qb, 0.5 + 0.5 * Math.sin(pg.giro.ang * 1.0));
    const C = centroMonton(), base = { x: C.x + 26 * Math.cos(t * 9), y: C.y - 2 };
    const cae = tramo(t, T.pop, T.pop + 0.15);
    const fin = mezcla(at, { x: base.x + 20, y: base.y - 8 }, cae);
    tira(g, [base, mezcla(base, fin, 0.45), { x: lerp(base.x, fin.x, 0.75) + 8 * Math.sin(t * 21), y: lerp(base.y, fin.y, 0.75) }, fin], 5);
  }
  // montón de bucles de papel alrededor del pie (detrás o delante de Guillermo)
  const BUCLES = Array.from({ length: 32 }, (_, k) => {
    const an = hash(k * 7.7 + 1) * TAU, r = 6 + 84 * Math.sqrt(hash(k * 3.1 + 2));
    const alto = k % 3 === 0 ? 1 : 0;      // unos tumbados y otros de pie (dan volumen al montón)
    return { dx: Math.cos(an) * r + 10, dy: Math.sin(an) * r * 0.3, rx: 14 + 16 * hash(k + 5), ry: alto ? 13 + 9 * hash(k + 9) : 5 + 4 * hash(k + 9),
      a: (hash(k + 13) - 0.5) * (alto ? 1.1 : 0.6), a0: hash(k + 17) * TAU, sube: alto * (6 + 10 * hash(k + 21)) * (1 - r / 100) };
  });
  function monton(g, t, delante, recoge) {
    if (t < T.des0) return;
    const u = clamp(nivel(t).lo), C = centroMonton(), Cr = remolinoCentro();
    for (let k = 0; k < BUCLES.length; k++) {
      const b = BUCLES[k]; if ((b.dy >= 0) !== delante) continue;
      const f = clamp((u - k / BUCLES.length * 0.9) * BUCLES.length * 0.7); if (f <= 0.01) continue;
      const rk = clamp(recoge * 1.4 - hash(k + 31) * 0.4); if (rk >= 0.99) continue;
      const cx = lerp(C.x + b.dx, Cr.x, rk), cy = lerp(C.y + b.dy, Cr.y, rk), e = 1 - rk;
      const pts = [], n = 10, arco = TAU * 0.92 * f;
      for (let i = 0; i <= n; i++) { const a = b.a0 + arco * i / n; const q = rot({ x: Math.cos(a) * b.rx * e, y: Math.sin(a) * b.ry * e - b.ry * e }, b.a); pts.push({ x: cx + q.x, y: cy + q.y - b.sube * e }); }
      tira(g, pts, 4.2);
    }
  }
  // lanzamiento de la punta: va del rollo al tobillo y se enrosca
  function latigazo(g, t, pd, pg) {
    if (t < T.flick0 + 0.03 || t > T.env0 + 0.35 || !pd.rollo) return;
    const A = tobilloG(pg);
    if (t < T.nudo + 0.02) {
      const R0 = pd.rollo, a = { x: R0.x - R0.r * 0.8, y: R0.y + 4 }, u = salida(fase(t, T.flick0 + 0.03, T.llega));
      const c = { x: lerp(a.x, A.x, 0.5), y: Math.min(a.y, A.y) - 70 };
      const pts = [];
      for (let i = 0; i <= 12; i++) { const s = u * i / 12, q = { x: (1 - s) * (1 - s) * a.x + 2 * s * (1 - s) * c.x + s * s * A.x, y: (1 - s) * (1 - s) * a.y + 2 * s * (1 - s) * c.y + s * s * A.y };
        q.y += 6 * Math.sin(s * 9 - t * 30) * s * (1 - s); pts.push(q); }
      tira(g, pts, 6);
    }
    // anillo alrededor del tobillo (lo tapan enseguida las vendas)
    const f = salida(fase(t, T.llega - 0.02, T.nudo)), al = 1 - tramo(t, T.env0 + 0.15, T.env0 + 0.35);
    if (f > 0.02 && al > 0.01) {
      const pts = []; for (let i = 0; i <= 14; i++) { const a = -Math.PI / 2 + TAU * 0.95 * f * i / 14; pts.push({ x: A.x - 6 + Math.cos(a) * 17, y: A.y + Math.sin(a) * 6 }); }
      g.save(); g.globalAlpha *= al; tira(g, pts, 5); g.restore();
    }
  }
  // chispa de papel al rasgarse
  function rasgado(g, t, x, y) {
    const k = fase(t, T.rasga, T.rasga + 0.32); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k; g.strokeStyle = "#fff"; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + 0.3, r0 = 6 + 10 * salida(k), r1 = r0 + 9 * (1 - k); g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    for (let i = 0; i < 5; i++) { const a = hash(i + 3) * TAU, d = 10 + 30 * salida(k), px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * 0.6 + 40 * k * k;
      g.save(); g.translate(px, py); g.rotate(k * 9 + i); g.fillStyle = PAP.base; g.fillRect(-3, -2, 6, 4); g.lineWidth = 1; g.strokeStyle = PAP.tinta; g.strokeRect(-3, -2, 6, 4); g.restore(); }
    g.restore();
  }
  // rayitas de tensión junto al tobillo cuando la tira se tensa
  function tension(g, t, A, P) {
    const k = campana(t, T.tensa - 0.03, T.tensa + 0.3); if (k <= 0.01) return;
    const d = Math.atan2(P.y - A.y, P.x - A.x), n = { x: -Math.sin(d), y: Math.cos(d) };
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.9 * k})`; g.lineWidth = 2.2; g.lineCap = "round";
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const b = { x: A.x + Math.cos(d) * (14 + 10 * i) + n.x * s * 9, y: A.y + Math.sin(d) * (14 + 10 * i) + n.y * s * 9 };
      g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(b.x + n.x * s * 7, b.y + n.y * s * 7); g.stroke(); }
    g.restore();
  }
  // crujido del papel al pisarlo
  function arruga(g, t, t0, x, y) {
    const k = fase(t, t0 - 0.02, t0 + 0.34); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k; g.strokeStyle = "#fff"; g.lineWidth = 2; g.lineCap = "round"; g.lineJoin = "round";
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const x0 = x + s * (26 + 6 * i + 10 * salida(k)), y0 = y - 6 - 9 * i;
      g.beginPath(); g.moveTo(x0, y0 - 5); g.lineTo(x0 + s * 4, y0 - 2); g.lineTo(x0, y0 + 1); g.lineTo(x0 + s * 4, y0 + 4); g.stroke(); }
    g.restore();
  }
  // trocitos que saltan de la cabeza al salir del último trozo
  function trocitos(g, t, c) {
    const k = fase(t, T.pop - 0.04, T.pop + 0.9); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - tramo(t, T.pop + 0.55, T.pop + 0.9);
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI * (0.1 + 0.8 * hash(i + 41)), v = 120 + 140 * hash(i + 43), tt = k * 0.94;
      const x = c.x + Math.cos(a) * v * tt, y = c.y + Math.sin(a) * v * tt + 300 * tt * tt;
      g.save(); g.translate(x, y); g.rotate(tt * (8 + i)); const w = 9 + 7 * hash(i + 45);
      g.fillStyle = PAP.base; g.strokeStyle = PAP.tinta; g.lineWidth = 1.4; g.beginPath(); g.rect(-w / 2, -3, w, 6); g.fill(); g.stroke(); g.restore();
    }
    g.restore();
  }
  // remolino de papel mientras Deivi recoge el montón
  const remolinoCentro = () => { const C = centroMonton(); return { x: C.x + 88, y: C.y - 70 }; };
  const recogida = t => tramo(t, T.remo0 + 0.05, T.remo1 - 0.12);
  function remolino(g, t) {
    const k = tramo(t, T.remo0 - 0.06, T.remo0 + 0.08) * (1 - tramo(t, T.remo1 - 0.06, T.remo1 + 0.14)); if (k <= 0.01) return;
    const C = remolinoCentro();
    g.save(); g.globalAlpha = k;
    const nubes = []; for (let i = 0; i < 11; i++) { const a = t * 8 + i * TAU / 11, r = 52 + 12 * Math.sin(t * 13 + i * 1.7);
      nubes.push({ x: C.x + Math.cos(a) * r, y: C.y + Math.sin(a) * r * 0.9, r: (34 + 8 * Math.sin(t * 17 + i * 2)) * (0.6 + 0.4 * k) }); }
    nubes.push({ x: C.x, y: C.y, r: 56 * k });
    g.fillStyle = "#1d1622"; for (const q of nubes) { g.beginPath(); g.arc(q.x, q.y, q.r + 3, 0, TAU); g.fill(); }
    for (const q of nubes) { g.fillStyle = "#e6dcea"; g.beginPath(); g.arc(q.x, q.y, q.r, 0, TAU); g.fill(); }
    g.fillStyle = "rgba(170,150,190,0.5)"; for (const q of nubes) { g.beginPath(); g.arc(q.x + q.r * 0.25, q.y + q.r * 0.3, q.r * 0.55, 0, TAU); g.fill(); }
    for (let i = 0; i < 6; i++) { const a = -t * 13 + i * TAU / 6, r = 66 + 8 * (i % 3), pts = [];
      for (let j = 0; j <= 6; j++) { const aa = a + j * 0.2; pts.push({ x: C.x + Math.cos(aa) * r, y: C.y + Math.sin(aa) * r * 0.78 }); } tira(g, pts, 4.4); }
    for (let i = 0; i < 10; i++) { const a = t * 11 + i * TAU / 10, r = 84 + 14 * Math.sin(i * 3 + t * 5);
      g.save(); g.translate(C.x + Math.cos(a) * r, C.y + Math.sin(a) * r * 0.8); g.rotate(t * 14 + i);
      g.fillStyle = PAP.base; g.strokeStyle = PAP.tinta; g.lineWidth = 1.2; g.beginPath(); g.rect(-5, -3, 10, 6); g.fill(); g.stroke(); g.restore(); }
    g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const a0 = t * 10 + i * 2.1; g.beginPath(); g.ellipse(C.x, C.y, 104, 84, 0, a0, a0 + 1.1); g.stroke(); }
    g.restore();
  }

  /* =====================================================================================
   * POSTURA CONJUNTA
   * ===================================================================================== */
  function pose(t) {
    const pd = poseD(t), pg = poseG(t, pd);
    // giro de peonza: eje y escala horizontal
    const gi = pg.giro, girando = (t > T.gira0 && t < T.gira1) || (t > T.gira2_0 && t < T.gira2_1);
    if (girando) {
      const ax = t < T.gira1 ? pg.x : recorrido(XG, T.gira2_0 + 0.12);
      pg.giroTr = { ax, sx: Math.cos(gi.ang) };
    } else pg.giroTr = null;
    return { g: pg, d: pd };
  }

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  let fondo = null, CAM = null;
  function calabaza(g, x, y, r, cara, sem) {
    g.save(); g.translate(x, y); g.lineJoin = "round";
    const gajos = [[-0.62, 0.62], [-0.3, 0.86], [0.3, 0.86], [0.62, 0.62], [0, 1]];
    for (const [cx, w] of gajos) {
      g.beginPath(); g.ellipse(cx * r, -r * 0.82, r * 0.42 * w, r * 0.82, 0, 0, TAU);
      g.fillStyle = cx === 0 ? "#e8771f" : "#d0631a"; g.fill(); g.lineWidth = 2; g.strokeStyle = "#3a1608"; g.stroke();
    }
    g.fillStyle = "rgba(255,190,90,0.35)"; g.beginPath(); g.ellipse(r * 0.18, -r * 1.25, r * 0.16, r * 0.3, 0.2, 0, TAU); g.fill();
    // rabo
    g.fillStyle = "#4f6b2a"; g.strokeStyle = "#1c2a0e"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(-r * 0.08, -r * 1.58); g.quadraticCurveTo(-r * 0.05, -r * 1.95, r * 0.18, -r * 2.02); g.lineTo(r * 0.14, -r * 1.86); g.quadraticCurveTo(r * 0.06, -r * 1.75, r * 0.1, -r * 1.58); g.closePath(); g.fill(); g.stroke();
    // cara tallada (hueco oscuro: la luz se pinta cada fotograma)
    if (cara) {
      g.fillStyle = "#2a0d04";
      caraCalabaza(g, r, sem);
    }
    g.restore();
  }
  function caraCalabaza(g, r, sem) {
    const y0 = -r * 0.9;
    g.beginPath();
    for (const s of [-1, 1]) { g.moveTo(s * r * 0.38, y0 - r * 0.32); g.lineTo(s * r * 0.18, y0 - r * 0.02); g.lineTo(s * r * 0.58, y0 - r * 0.02); g.closePath(); }
    g.moveTo(-r * 0.05, y0 + r * 0.02); g.lineTo(r * 0.06, y0 + r * 0.18); g.lineTo(-r * 0.12, y0 + r * 0.18); g.closePath();
    const yb = y0 + r * 0.32; g.moveTo(-r * 0.62, yb);
    for (let i = 0; i <= 6; i++) { const x = lerp(-r * 0.62, r * 0.62, i / 6); g.lineTo(x, yb + (i % 2 ? r * 0.12 : 0) + (sem ? 0 : 0)); }
    g.quadraticCurveTo(0, yb + r * 0.55, -r * 0.62, yb); g.closePath();
    g.fill();
  }
  const CALABAZAS = [{ x: 182, y: 552, r: 32, cara: true, s: 1 }, { x: 905, y: 560, r: 30, cara: true, s: 2 }, { x: 962, y: 534, r: 19, cara: true, s: 3 }, { x: 586, y: 445, r: 15, cara: true, s: 4 }];
  function arbol(g, x, y, ang, largo, grosor, nivelA, sem) {
    if (nivelA > 6 || largo < 8) return;
    const x1 = x + Math.sin(ang) * largo, y1 = y - Math.cos(ang) * largo;
    g.lineWidth = grosor; g.beginPath(); g.moveTo(x, y);
    g.quadraticCurveTo((x + x1) / 2 + Math.cos(ang) * largo * 0.15 * (hash(sem) - 0.5), (y + y1) / 2, x1, y1); g.stroke();
    const n = nivelA < 2 ? 2 : 2 + (hash(sem + 3) > 0.6 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const da = (i - (n - 1) / 2) * (0.55 + 0.3 * hash(sem + i * 7)) + (hash(sem + i * 13) - 0.5) * 0.3;
      arbol(g, x1, y1, ang + da, largo * (0.68 + 0.12 * hash(sem + i * 5)), grosor * 0.66, nivelA + 1, sem * 3 + i + 1);
    }
  }
  function telarana(g, x, y, r, a0, a1) {
    g.save(); g.strokeStyle = "rgba(225,215,240,0.55)"; g.lineWidth = 1;
    const n = 6;
    for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.stroke(); }
    for (let k = 1; k <= 4; k++) { const rr = r * k / 4.4; g.beginPath();
      for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n), am = lerp(a0, a1, (i - 0.5) / n), p = { x: x + Math.cos(a) * rr, y: y + Math.sin(a) * rr };
        if (i === 0) g.moveTo(p.x, p.y); else g.quadraticCurveTo(x + Math.cos(am) * rr * 0.86, y + Math.sin(am) * rr * 0.86, p.x, p.y); }
      g.stroke(); }
    g.restore();
  }
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 140; const g = c.getContext("2d");
    g.translate(60, 70);
    // cielo
    const cielo = g.createLinearGradient(0, -70, 0, 470); cielo.addColorStop(0, "#0d0720"); cielo.addColorStop(0.55, "#2a1546"); cielo.addColorStop(1, "#4b2463");
    g.fillStyle = cielo; g.fillRect(-60, -70, W + 120, 560);
    for (let i = 0; i < 80; i++) { const x = 500 + hash(i + 3) * 600, y = -60 + hash(i + 91) * 380; if (Math.hypot(x - 812, y - 96) < 80) continue;
      g.fillStyle = `rgba(255,245,255,${0.25 + 0.5 * hash(i + 7)})`; g.beginPath(); g.arc(x, y, 0.6 + hash(i + 11) * 1.1, 0, TAU); g.fill(); }
    // luna
    const halo = g.createRadialGradient(812, 96, 30, 812, 96, 190); halo.addColorStop(0, "rgba(240,226,255,0.32)"); halo.addColorStop(1, "rgba(240,226,255,0)");
    g.fillStyle = halo; g.fillRect(600, -100, 430, 400);
    g.fillStyle = "#f5edd2"; g.beginPath(); g.arc(812, 96, 48, 0, TAU); g.fill();
    g.save(); g.beginPath(); g.arc(812, 96, 48, 0, TAU); g.clip();
    g.fillStyle = "rgba(214,198,160,0.55)"; for (const [x, y, r] of [[796, 80, 11], [828, 112, 8], [822, 76, 5], [800, 116, 6], [838, 92, 4]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    g.fillStyle = "rgba(160,130,170,0.25)"; g.beginPath(); g.arc(800, 112, 50, 0, TAU); g.fill();
    g.restore();
    // tejados a lo lejos
    g.fillStyle = "#1f1233";
    g.beginPath(); g.moveTo(500, 470); const tej = [[500, 360], [560, 360], [560, 330], [600, 300], [640, 330], [640, 350], [700, 350], [700, 318], [716, 318], [716, 350], [780, 350], [800, 322], [860, 322], [880, 350], [960, 350], [960, 300], [990, 260], [1020, 300], [1020, 340], [1084, 340], [1084, 470]];
    for (const [x, y] of tej) g.lineTo(x, y); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,190,90,0.6)"; for (const [x, y] of [[575, 345], [662, 360], [735, 340], [905, 338], [985, 290]]) g.fillRect(x, y, 6, 8);
    // árbol pelado
    g.strokeStyle = "#120a1e"; g.lineCap = "round";
    arbol(g, 1010, 470, -0.12, 120, 20, 0, 5);
    // muro de piedra a la derecha
    g.fillStyle = "#3a2d48"; g.fillRect(520, 452, 600, 72);
    g.fillStyle = "#4a3a5a"; g.fillRect(520, 444, 600, 12);
    g.strokeStyle = "rgba(20,10,30,0.55)"; g.lineWidth = 1.5;
    for (let r = 0; r < 3; r++) for (let i = 0; i < 12; i++) { const x = 520 + i * 52 + (r % 2) * 26, y = 456 + r * 22; g.strokeRect(x, y, 52, 22); }
    // fachada del bar (ladrillo morado)
    g.fillStyle = "#3d2346"; g.fillRect(-60, -70, 590, 594);
    g.save(); g.beginPath(); g.rect(-60, -70, 568, 594); g.clip();
    for (let r = 0; r < 30; r++) for (let i = 0; i < 16; i++) {
      const x = -60 + i * 40 + (r % 2) * 20, y = -70 + r * 20;
      g.fillStyle = `rgb(${68 + 14 * hash(r * 31 + i)},${38 + 8 * hash(r * 17 + i)},${74 + 12 * hash(r * 7 + i)})`;
      g.fillRect(x + 1.5, y + 1.5, 37, 17);
    }
    g.restore();
    // esquina de piedra
    g.fillStyle = "#4b3c58"; g.fillRect(506, -70, 30, 594);
    g.strokeStyle = "rgba(20,10,30,0.6)"; g.lineWidth = 2; for (let y = -70; y < 524; y += 34) g.strokeRect(506, y, 30, 34);
    // zócalo
    g.fillStyle = "#2a1a31"; g.fillRect(-60, 488, 596, 36);
    g.fillStyle = "rgba(255,255,255,0.06)"; g.fillRect(-60, 488, 596, 3);
    // puerta
    g.fillStyle = "#1a0d16"; g.fillRect(16, 240, 140, 252);
    g.fillStyle = "#2d1622"; g.fillRect(26, 250, 120, 242);
    g.strokeStyle = "#1a0b13"; g.lineWidth = 4; g.strokeRect(38, 330, 96, 66); g.strokeRect(38, 410, 96, 66);
    const vp = g.createRadialGradient(86, 290, 2, 86, 290, 22); vp.addColorStop(0, "#ffd27a"); vp.addColorStop(1, "#d77a2a");
    g.fillStyle = vp; g.beginPath(); g.arc(86, 290, 20, 0, TAU); g.fill(); g.lineWidth = 4; g.strokeStyle = "#1a0b13"; g.stroke();
    g.beginPath(); g.moveTo(66, 290); g.lineTo(106, 290); g.moveTo(86, 270); g.lineTo(86, 310); g.lineWidth = 3; g.stroke();
    g.fillStyle = "#c9a14a"; g.beginPath(); g.arc(132, 380, 5, 0, TAU); g.fill();
    // ventana con luz cálida y botellas
    const vg = g.createLinearGradient(0, 210, 0, 390); vg.addColorStop(0, "#ffc86b"); vg.addColorStop(1, "#e0802e");
    g.fillStyle = "#1c0e18"; g.fillRect(200, 200, 270, 196);
    g.fillStyle = vg; g.fillRect(210, 210, 250, 176);
    g.fillStyle = "rgba(120,50,20,0.55)"; g.fillRect(210, 300, 250, 6); g.fillRect(210, 360, 250, 6);
    for (let i = 0; i < 14; i++) { const x = 218 + i * 17.5, h = 26 + 18 * hash(i + 2), y = 300 - h;
      g.fillStyle = `rgba(${60 + 40 * hash(i)},${30 + 20 * hash(i + 4)},30,0.75)`; g.fillRect(x, y + 10, 10, h - 10); g.fillRect(x + 3, y, 4, 12); }
    for (let i = 0; i < 9; i++) { const x = 222 + i * 26; g.fillStyle = "rgba(70,30,20,0.7)"; g.fillRect(x, 340, 14, 20); }
    g.fillStyle = "#1c0e18"; g.fillRect(330, 210, 8, 176); g.fillRect(210, 294, 250, 6);
    const brillo = g.createRadialGradient(335, 300, 40, 335, 300, 220); brillo.addColorStop(0, "rgba(255,170,80,0.18)"); brillo.addColorStop(1, "rgba(255,170,80,0)");
    g.fillStyle = brillo; g.fillRect(100, 120, 470, 380);
    // telarañas
    telarana(g, 200, 200, 64, 0, Math.PI / 2);
    telarana(g, 470, 200, 50, Math.PI / 2, Math.PI);
    telarana(g, 16, 240, 46, 0, Math.PI / 2);
    telarana(g, 506, -70, 120, Math.PI / 2, Math.PI);
    // farolillo junto a la puerta
    g.fillStyle = "#140a12"; g.fillRect(170, 222, 26, 6); g.fillRect(178, 228, 10, 10);
    // acera
    const ac = g.createLinearGradient(0, 524, 0, 680); ac.addColorStop(0, "#2a2036"); ac.addColorStop(1, "#1a1424");
    g.fillStyle = ac; g.fillRect(-60, 524, W + 120, 160);
    g.strokeStyle = "rgba(10,5,18,0.6)"; g.lineWidth = 2;
    for (const y of [548, 580, 624]) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    for (let i = -6; i < 16; i++) { const x = i * 92; g.beginPath(); g.moveTo(512 + (x - 512) * 0.8, 524); g.lineTo(512 + (x - 512) * 1.5, 680); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,0.05)"; g.fillRect(-60, 524, W + 120, 3);
    // calabazas (sin luz)
    for (const k of CALABAZAS) calabaza(g, k.x, k.y, k.r, k.cara, k.s);
    return c;
  }
  // luz de las velas de las calabazas (cada fotograma)
  function velas(g, t) {
    for (const k of CALABAZAS) {
      const f = 0.75 + 0.15 * ruido(t * 7 + k.s * 10) + 0.1 * ruido(t * 19 + k.s * 3);
      const gr = g.createRadialGradient(k.x, k.y - k.r * 0.9, 2, k.x, k.y - k.r * 0.9, k.r * 3.2);
      gr.addColorStop(0, `rgba(255,170,60,${0.32 * f})`); gr.addColorStop(1, "rgba(255,140,40,0)");
      g.fillStyle = gr; g.fillRect(k.x - k.r * 3.3, k.y - k.r * 4.2, k.r * 6.6, k.r * 6.6);
      g.save(); g.translate(k.x, k.y); g.fillStyle = `rgb(255,${Math.round(170 + 60 * f)},${Math.round(60 + 40 * f)})`; caraCalabaza(g, k.r, k.s);
      g.globalAlpha = 0.6 * f; g.fillStyle = "#fff4c0"; g.beginPath(); g.ellipse(0, -k.r * 0.6, k.r * 0.14, k.r * 0.1, 0, 0, TAU); g.fill();
      g.restore();
    }
    // farolillo
    const f = 0.8 + 0.2 * ruido(t * 9 + 40);
    const gr = g.createRadialGradient(183, 252, 2, 183, 252, 60); gr.addColorStop(0, `rgba(255,190,90,${0.5 * f})`); gr.addColorStop(1, "rgba(255,160,60,0)");
    g.fillStyle = gr; g.fillRect(120, 190, 126, 126);
    g.fillStyle = "#140a12"; g.fillRect(172, 238, 22, 32);
    g.fillStyle = `rgba(255,${Math.round(190 + 50 * f)},110,1)`; g.fillRect(176, 242, 14, 24);
    g.strokeStyle = "#140a12"; g.lineWidth = 2; g.beginPath(); g.moveTo(183, 242); g.lineTo(183, 266); g.moveTo(176, 254); g.lineTo(190, 254); g.stroke();
  }
  // guirnalda de bombillas
  const GUIRNALDA = (() => { const pts = [], ancl = [[-10, 176], [180, 184], [340, 176], [500, 188]];
    for (let i = 0; i < ancl.length - 1; i++) { const [x0, y0] = ancl[i], [x1, y1] = ancl[i + 1];
      for (let k = 0; k < 6; k++) { const u = (k + 0.5) / 6; pts.push({ x: lerp(x0, x1, u), y: lerp(y0, y1, u) + 22 * 4 * u * (1 - u), c: (i * 6 + k) % 2 }); } }
    return { pts, ancl }; })();
  function guirnalda(g, t) {
    g.save(); g.strokeStyle = "#120812"; g.lineWidth = 1.6;
    const A = GUIRNALDA.ancl;
    g.beginPath(); g.moveTo(A[0][0], A[0][1]); for (let i = 0; i < A.length - 1; i++) g.quadraticCurveTo((A[i][0] + A[i + 1][0]) / 2, (A[i][1] + A[i + 1][1]) / 2 + 44, A[i + 1][0], A[i + 1][1]); g.stroke();
    GUIRNALDA.pts.forEach((q, i) => {
      const on = 0.65 + 0.35 * Math.max(0, Math.sin(t * 2.4 + i * 1.3));
      const col = q.c ? [190, 110, 255] : [255, 150, 50];
      g.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${0.22 * on})`; g.beginPath(); g.arc(q.x, q.y + 6, 9, 0, TAU); g.fill();
      g.fillStyle = `rgb(${col.map(v => Math.round(v * (0.7 + 0.3 * on))).join(",")})`; g.beginPath(); g.ellipse(q.x, q.y + 6, 3.2, 4.4, 0, 0, TAU); g.fill();
      g.fillStyle = "#120812"; g.fillRect(q.x - 2, q.y, 4, 3);
    });
    g.restore();
  }
  function arana(g, t) {
    const x = 160, y0 = 252, y = 288 + 16 * Math.sin(t * 1.1) + 6 * Math.sin(t * 2.7);
    g.save(); g.strokeStyle = "rgba(230,220,245,0.7)"; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y - 6); g.stroke();
    g.strokeStyle = "#0b0610"; g.lineWidth = 1.6; g.lineCap = "round";
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const a = 0.4 + i * 0.32 + 0.12 * Math.sin(t * 9 + i * 1.7 + s);
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + s * 7, y - 6 + i * 3, x + s * Math.cos(a) * 12, y + Math.sin(a) * 9 - 3 + i * 1.5); g.stroke(); }
    g.fillStyle = "#0b0610"; g.beginPath(); g.ellipse(x, y, 5, 6, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(x, y - 6, 3.4, 0, TAU); g.fill();
    g.fillStyle = "#ff5a5a"; g.fillRect(x - 2, y - 7, 1.4, 1.4); g.fillRect(x + 0.8, y - 7, 1.4, 1.4);
    g.restore();
  }
  function murcielagos(g, t) {
    g.save(); g.fillStyle = "#0a0614";
    for (let i = 0; i < 3; i++) {
      const x = 780 + 170 * Math.sin(t * (0.21 + i * 0.05) + i * 2.1), y = 70 + 60 * Math.sin(t * (0.37 + i * 0.07) + i * 1.3) + i * 30;
      const al = Math.sin(t * (13 + i * 2) + i), e = 0.8 + 0.25 * i;
      g.save(); g.translate(x, y); g.scale(e, e);
      g.beginPath(); g.moveTo(0, 0);
      for (const s of [-1, 1]) { g.moveTo(0, 0); g.quadraticCurveTo(s * 6, -6 * al - 2, s * 13, -7 * al); g.quadraticCurveTo(s * 9, -2 * al + 1, s * 7, 1); g.quadraticCurveTo(s * 4, 0, 0, 2); }
      g.fill(); g.beginPath(); g.ellipse(0, 0.5, 2.2, 3, 0, 0, TAU); g.fill();
      g.restore();
    }
    g.restore();
  }
  function niebla(g, t, delante) {
    g.save();
    for (let i = 0; i < (delante ? 3 : 5); i++) {
      const x = ((i * 260 + t * (12 + i * 4)) % 1400) - 200, y = delante ? 596 + i * 6 : 528 + i * 9;
      const gr = g.createRadialGradient(x, y, 4, x, y, 150); gr.addColorStop(0, `rgba(190,170,220,${delante ? 0.09 : 0.11})`); gr.addColorStop(1, "rgba(190,170,220,0)");
      g.fillStyle = gr; g.save(); g.translate(x, y); g.scale(1, 0.22); g.translate(-x, -y); g.fillRect(x - 150, y - 150, 300, 300); g.restore();
    }
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrellaPuntas(g, x, y, r, puntas, rot0, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot0 + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function lineasGiro(g, t, pg) {
    const gi = pg.giro; if (!pg.giroTr || gi.vel < 0.05) return;
    const ax = pg.giroTr.ax, top = pg.suelo - 430 * pg.s / S, k = gi.vel;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.55 * k})`; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < 4; i++) {
      const y = lerp(top + 90, pg.suelo - 40, i / 3), rx = 70 + 10 * i, a0 = (gi.ang * 0.5 + i * 1.3) % TAU;
      g.beginPath(); g.ellipse(ax, y, rx, 12, 0, a0, a0 + 1.6); g.stroke();
    }
    g.restore();
  }
  function estrellitas(g, t, cab) {
    const k = tramo(t, T.pop + 0.1, T.pop + 0.4) * (1 - tramo(t, T.mareo1 - 0.1, T.mareo1 + 0.2)); if (k <= 0.01) return;
    const pts = [];
    for (let i = 0; i < 5; i++) { const a = t * 4 + i * TAU / 5; pts.push({ a, x: cab.x + Math.cos(a) * 46, y: cab.y + Math.sin(a) * 12, z: Math.sin(a) }); }
    pts.sort((u, v) => u.z - v.z);
    g.save();
    for (const q of pts) { const r = (7.5 + 2.5 * q.z) * k; estrellaPuntas(g, q.x, q.y, r, 5, t * 3 + q.a, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2; g.strokeStyle = "#0b0a0e"; g.stroke(); }
    g.restore();
  }
  function sombra(g, x, y, ancho, alfa) { g.save(); g.fillStyle = `rgba(8,0,18,${alfa})`; g.beginPath(); g.ellipse(x, y + 2, ancho, 7, 0, 0, TAU); g.fill(); g.restore(); }

  /* ---------- cámara ---------- */
  function camara(t) {
    const z = tramo(t, T.camara, T.pisa - 0.15) * (1 - tramo(t, T.mira2, T.gira2B + 0.4));
    return { k: 1 + 0.12 * z, x: lerp(512, 452, z), y: lerp(300, 318, z) };
  }

  function dibujaGuillermo(g, pg, t, V) {
    g.save();
    const gr = pg.giroTr;
    if (gr) { g.translate(gr.ax, 0); g.scale(Math.abs(gr.sx) < 0.025 ? 0.025 * Math.sign(gr.sx || 1) : gr.sx, 1); g.translate(-gr.ax, 0); }
    G.dibujar(g, pg, t);
    dibMomia(g, pg, V, t);
    g.restore();
  }

  class Momia extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !D.listo()) return;
      if (!fondo) fondo = creaFondo();
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      CAM = g.getTransform();
      const P = pose(t), pg = P.g, pd = P.d, V = nivel(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      g.drawImage(fondo, -60, -70);
      murcielagos(g, t);
      velas(g, t);
      guirnalda(g, t);
      arana(g, t);
      niebla(g, t, false);
      // sombras
      sombra(g, D.aPantalla(pd, pd.pelvis).x - 6, SUELO, 62, 0.34);
      sombra(g, pg.giroTr ? pg.giroTr.ax : G.aPantalla(pg, pg.pelvis).x, pg.suelo, 64 * pg.s / S, 0.34);
      D.dibujar(g, pd, t);
      const rec = recogida(t);
      colaDetras(g, t, pg, rec);
      monton(g, t, false, rec);
      tiraSube(g, t, pg);
      dibujaGuillermo(g, pg, t, V);
      monton(g, t, true, rec);
      latigazo(g, t, pd, pg);
      // cinta del rollo a Guillermo mientras envuelve (al rasgarse, el trozo suelto se pega)
      if (pd.rollo && t > T.nudo && t < T.rasga + 0.22) {
        const R0 = pd.rollo, h = nivel(t).hi;
        const bo = bordeEn(clamp(h - 0.012, 0, 1));
        const qa = giroPunto(pg, G.aPantalla(pg, { x: bo.x0, y: bo.y })), qb = giroPunto(pg, G.aPantalla(pg, { x: bo.x1, y: bo.y }));
        const at = qa.x > qb.x ? qa : qb;
        let a0 = { x: R0.x - R0.r * 0.8, y: R0.y };
        const pega = tramo(t, T.rasga, T.rasga + 0.2);
        if (t > T.rasga) { const RR = poseD(T.rasga).rollo; a0 = mezcla({ x: RR.x - RR.r * 0.8 - 6, y: RR.y + 10 * pega }, at, pega); }
        const grueso = lerp(6, 1, tramo(t, T.nudo, T.nudo + 0.16));
        if (pega < 0.98) cinta(g, a0, at, ROLLO_L * 0.95 / grueso * (1 - 0.5 * pega), ROLLO_L * 0.8 / grueso, 5 * (1 - pega), t);
        if (t > T.rasga - 0.01) rasgado(g, t, a0.x, a0.y);
      }
      lineasGiro(g, t, pg);
      const cab = giroPunto(pg, G.aPantalla(pg, G.cabeza(pg).a({ x: 760, y: 470 })));
      estrellitas(g, t, cab);
      trocitos(g, t, giroPunto(pg, G.aPantalla(pg, G.cabeza(pg).a({ x: 800, y: 300 }))));
      remolino(g, t);
      const ca = carton(t); if (ca) rollo(g, ca.x, ca.y, TUBO_R, ROLLO_L, ca.ang, 0.36, 0, TUBO_R);
      arruga(g, t, T.pisa, PISA_X, pin().P.y);
      niebla(g, t, true);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00069", nombre: "Guillermo y Deivi · La momia", crear: () => new Momia() });
  window.__A2D_00069 = { pose, T, DUR, nivel, referencia };
})();
