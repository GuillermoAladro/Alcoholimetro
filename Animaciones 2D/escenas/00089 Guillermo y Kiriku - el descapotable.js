"use strict";
/* 00089 · Guillermo y Kiriku · El descapotable
 *
 * Negro → carretera de la costa a media tarde, vista de lado desde un coche que va a la par: un
 * descapotable rojo de los de antes (capó largo, aleta, parabrisas con marco cromado, asientos de
 * piel color tabaco) corre hacia la derecha; detrás pasan el mar con sus brillos, un cabo con un
 * pueblo blanco, palmeras, farolas y el quitamiedos, cada cosa a su velocidad. Kiriku conduce (lejos
 * de cámara), con las gafas de sol puestas y una mano arriba del volante; Guillermo va de copiloto
 * (cerca de cámara), encantado: brazos arriba → Kiriku acelera y el viento le dobla los pinchos del
 * pelo hacia atrás, uno a uno, ondeando → se agarra a la puerta y el viento le hincha los carrillos y
 * se los sacude como a un perro asomado a la ventanilla (labios al aire, ojos apretados, lagrimones
 * que salen volando hacia atrás) → Kiriku le echa una mirada, impasible (a él solo se le levanta un
 * mechón, que vuelve a su sitio) → un bicho se le estampa en los dientes: Guillermo se queda helado,
 * lo pesca con dos dedos, lo mira, lo suelta al viento y saca la lengua con asco, verde → se le ocurre
 * algo: abre la guantera y saca, cogido por la coronilla, un casco de aviador de cuero con gafas (sale
 * arrugado y se infla); coge impulso y lo lanza hacia arriba (Kiriku echa la cabeza atrás), el casco da
 * una vuelta en el aire y le cae encajado en la cabeza (los pinchos asoman por detrás); se abrocha la
 * orejera, se baja las gafas y posa como un héroe, señalando la carretera → Kiriku se baja las gafas de
 * sol tirando de la patilla y mira a cámara por encima, con la ceja levantada; a Guillermo se le estampa
 * otro bicho… en las gafas, y ni se inmuta → Kiriku se sube las gafas → negro.
 *
 * Sin textos ni marcas. Todo depende del tiempo absoluto. El fondo son tiras dibujadas una vez que se
 * desplazan (cada capa a su velocidad); el coche y los dos van juntos, con el traqueteo de la
 * carretera. Guillermo se pinta en un lienzo aparte del tamaño del de salida: así se le pueden borrar
 * los pinchos del retrato («destination-out») y pintarlos doblados por el viento, sin leer píxeles.
 * Las gafas de Kiriku (las del cuello del polo, que se tapan en capaTronco) y el casco de
 * Guillermo se dibujan en unidades del retrato con una afín de pantalla (en la cara o en la mano).
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, mezcla, hash } = M2;
  const G = Guillermo, KI = Kiriku;
  const TAU = Math.PI * 2, TINTA = "#141218";
  const SG = 0.42, SK = 0.395;
  const XG = 300, YPG = 476, XK = 470, YPK = 448;            // pelvis de cada uno (en el coche)
  const SUELO_G = YPG + (G.SUELO - G.PELVIS.y) * SG, SUELO_K = YPK + (KI.SUELO - KI.PELVIS.y) * SK * KI.K;
  const DUR = 14.6;
  const T = {
    yuju0: 0.5, yuju1: 0.85, yuju2: 1.55,
    acel0: 0.95, acel1: 2.7,
    viento0: 1.25, viento1: 3.0,
    agarra0: 1.6, agarra1: 2.05,
    mof0: 3.05, mof1: 5.45,
    kMira0: 4.35, kMira1: 4.6, kMira2: 5.25,
    mechon0: 4.75, mechon1: 5.75,
    bicho0: 5.35, bicho: 5.95,
    pinza0: 6.45, pinza1: 6.78, mira: 6.95, tira0: 7.25, tira: 7.38,
    bleh0: 7.45, bleh1: 8.0,
    idea: 8.08,
    boton0: 8.25, boton: 8.4, abre1: 8.62,
    saca0: 8.7, saca1: 9.0, pone0: 9.08, suelta: 9.2, pone1: 9.62, encaja: 9.67,
    oreja0: 9.75, oreja1: 10.05, oreja2: 10.2,
    gafas0: 10.28, gafas1: 10.52, gafas2: 10.62,
    heroe0: 10.7, heroe1: 11.05,
    kBaja0: 11.35, kBaja1: 11.62, kBaja2: 12.05,
    bicho2a: 11.95, bicho2: 12.5,
    kArr0: 13.05, kArr1: 13.35,
    fin: 13.85
  };

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
  const angDif = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const lerpAng = (a, b, k) => a + angDif(a, b) * k;
  const lienzo = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  let MATRIZ = null;          // transformación del coche (cámara + traqueteo): las afines van en estas unidades

  // afines { a, b, c, d, e, f } (como setTransform)
  const AF = (a, b, c, d, e, f) => ({ a, b, c, d, e, f });
  const mul = (A, B) => AF(A.a * B.a + A.c * B.b, A.b * B.a + A.d * B.b, A.a * B.c + A.c * B.d, A.b * B.c + A.d * B.d,
    A.a * B.e + A.c * B.f + A.e, A.b * B.e + A.d * B.f + A.f);
  const apl = (A, q) => ({ x: A.a * q.x + A.c * q.y + A.e, y: A.b * q.x + A.d * q.y + A.f });
  const Tm = (x, y) => AF(1, 0, 0, 1, x, y), Rm = r => AF(Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0), Sm = (x, y) => AF(x, 0, 0, y, 0, 0);
  const lerpAF = (A, B, k) => AF(lerp(A.a, B.a, k), lerp(A.b, B.b, k), lerp(A.c, B.c, k), lerp(A.d, B.d, k), lerp(A.e, B.e, k), lerp(A.f, B.f, k));
  function desc(A) { const sy = Math.hypot(A.c, A.d), th = Math.atan2(-A.c, A.d); return { x: A.e, y: A.f, th, sx: A.a * Math.cos(th) + A.b * Math.sin(th), sy }; }
  function afCabeza(Rg, p) {
    const H = Rg.cabeza(p), o = Rg.aPantalla(p, H.a({ x: 0, y: 0 })), ex = Rg.aPantalla(p, H.a({ x: 1, y: 0 })), ey = Rg.aPantalla(p, H.a({ x: 0, y: 1 }));
    return AF(ex.x - o.x, ex.y - o.y, ey.x - o.x, ey.y - o.y, o.x, o.y);
  }
  const retrato = (Rg, p, q) => Rg.aPantalla(p, Rg.cabeza(p).a(q));

  // Pistas de una mano: [t0, t1, objetivo, curva]; el objetivo se resuelve en cada fotograma.
  function pista(lista, t, resuelve) {
    let c = resuelve(lista[0][2]);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)), d = resuelve(obj);
      c = { x: lerp(c.x, d.x, k), y: lerp(c.y, d.y, k), mu: lerp(c.mu, d.mu, k), ang: lerp(c.ang, d.ang, k), puno: lerp(c.puno, d.puno, k),
        dedos: DD(c.dedos, d.dedos, k), dobla: k < 0.5 ? c.dobla : d.dobla };
    }
    return c;
  }
  const offMano = (m, q) => { const r = rota(q, m.mu + Math.PI / 2); return rota({ x: r.x * G.JK, y: r.y * G.JK }, m.ang || 0); };
  const PINZA = { x: 6.2, y: 15.5 }, PALMA = { x: 0, y: 1 }, CENTRO = { x: 0, y: 0 };
  const ptMano = (Rg, p, m, q) => { const o = offMano(m, q); return Rg.aPantalla(p, { x: m.x + o.x, y: m.y + o.y }); };
  function resolutor(Rg, p) {
    const Tr = Rg.tronco(p);
    return o => {
      const m = { mu: o.mu, ang: o.ang || 0 };
      let q;
      if (o.hoja) q = Tr(o.hoja);
      else { const sc = typeof o.scr === "function" ? o.scr() : o.scr, h = Rg.aHoja(p, sc), f = offMano(m, o.ref || PINZA); q = { x: h.x - f.x, y: h.y - f.y }; }
      return { x: q.x, y: q.y, mu: o.mu, ang: m.ang, puno: o.puno ?? 1, dedos: o.dedos, dobla: o.dobla ?? 1 };
    };
  }

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, rub: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* =====================================================================================
   * VELOCIDAD Y CARRETERA: posición del paisaje (px de la capa de la carretera)
   * ===================================================================================== */
  const V0 = 560, V1 = 1180;
  function avance(t) {
    const a = T.acel0, b = T.acel1;
    let R = 0;
    if (t > a) { const k = fase(t, a, b); R = (b - a) * (k * k * k - k * k * k * k / 2); if (t > b) R = (b - a) / 2 + (t - b); }
    return V0 * t + (V1 - V0) * R;
  }
  const velocidad = t => lerp(V0, V1, tramo(t, T.acel0, T.acel1));
  // traqueteo del coche (y) y empujón al acelerar (los dos se van hacia atrás)
  const traqueteo = t => 1.4 * Math.sin(t * 10.7) + 0.9 * Math.sin(t * 19.3 + 1.2) + 2.2 * campana(t, 2.1, 2.45) * Math.sin((t - 2.1) * 40) + 1.8 * campana(t, 7.6, 7.9) * Math.sin((t - 7.6) * 45);
  const empujon = t => campana(t, T.acel0, T.acel0 + 0.9);

  /* =====================================================================================
   * GAFAS DE SOL DE KIRIKU (aviador): unidades del retrato, origen en el puente
   * ===================================================================================== */
  const AVIADOR = { tipo: 0, w: 100, h: 66, gap: 44, gapPleg: 22, cy: 4, patilla: 168,
    cristal: ["#343b50", "#07080c"], reflejo: "rgba(150,210,255,0.4)", reflejo2: "rgba(255,186,110,0.34)",
    montura: "#e2dccf", luz: "rgba(255,255,255,0.85)", sombra: "#8d8577", grosor: [9, 4.6], puente: [8, 3.8] };
  const AVI_PTS = [[-1.0, -0.6], [-0.58, -0.92], [0.12, -0.99], [0.76, -0.88], [1.0, -0.46], [0.97, 0.18], [0.74, 0.76], [0.26, 1.0], [-0.3, 0.93], [-0.78, 0.56], [-1.0, 0.02]];
  function geo(E_, o) {
    const pe = o.persp ?? 1, ko = o.oreja ? (o.kOreja ?? 1) : 0;
    const w = E_.w, h = E_.h, wf = w * pe, gap = E_.gap;
    const nc = { x: -(gap / 2 + w / 2), y: E_.cy }, fc = { x: gap / 2 + wf / 2, y: E_.cy };
    const hn = { x: nc.x - w * 0.5 + 5, y: E_.cy - h * 0.3 }, hf = { x: fc.x + wf * 0.5 - 4, y: E_.cy - h * 0.3 };
    let fin = { x: hn.x - E_.patilla, y: hn.y + 30 };
    if (ko > 0) fin = mezcla(fin, o.oreja, ko);
    const agarre = mezcla(hn, fin, o.agarreK ?? 0.14);
    return { w, h, wf, nc, fc, hn, hf, fin, agarre, pe, ko };
  }
  function rutaLente(g, c, w, h, sx) { g.beginPath(); M2.curva(g, AVI_PTS.map(([x, y]) => ({ x: c.x + sx * x * w / 2, y: c.y + y * h / 2 })), true, 0.5); }
  function patilla(g, E_, a, b, alfa) {
    if (alfa <= 0.01) return;
    g.save(); g.globalAlpha *= alfa; g.lineCap = "round";
    const c = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - 8 };
    const ruta = () => { g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo(c.x, c.y, b.x, b.y); };
    ruta(); g.lineWidth = 9; g.strokeStyle = TINTA; g.stroke();
    ruta(); g.lineWidth = 4.4; g.strokeStyle = E_.montura; g.stroke();
    const k = 0.78, q = { x: lerp(lerp(a.x, c.x, k), lerp(c.x, b.x, k), k), y: lerp(lerp(a.y, c.y, k), lerp(c.y, b.y, k), k) };
    g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(b.x, b.y); g.lineWidth = 11; g.strokeStyle = TINTA; g.stroke();
    g.lineWidth = 6; g.strokeStyle = "#3a3632"; g.stroke();
    g.restore();
  }
  function lente(g, E_, c, w, h, sx, t) {
    rutaLente(g, c, w, h, sx);
    const gr = g.createLinearGradient(0, c.y - h / 2, 0, c.y + h / 2);
    gr.addColorStop(0, E_.cristal[0]); gr.addColorStop(1, E_.cristal[1]);
    g.fillStyle = gr; g.fill();
    g.save(); rutaLente(g, c, w, h, sx); g.clip();
    g.fillStyle = E_.reflejo; g.beginPath(); g.ellipse(c.x - sx * w * 0.08, c.y - h * 0.42, w * 0.62, h * 0.3, 0, 0, TAU); g.fill();
    g.fillStyle = E_.reflejo2; g.beginPath(); g.ellipse(c.x + sx * w * 0.12, c.y + h * 0.5, w * 0.6, h * 0.16, 0, 0, TAU); g.fill();
    // el paisaje que pasa: rayas de brillo que corren por el cristal
    const fx = ((t * 0.9) % 1) * 2.2 - 1.1;
    g.fillStyle = "rgba(255,255,255,0.3)";
    g.beginPath(); g.moveTo(c.x + w * (fx - 0.1), c.y - h * 0.6); g.lineTo(c.x + w * (fx + 0.12), c.y - h * 0.6); g.lineTo(c.x + w * (fx - 0.08), c.y + h * 0.6); g.lineTo(c.x + w * (fx - 0.3), c.y + h * 0.6); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,0.14)";
    g.beginPath(); g.moveTo(c.x + w * 0.04, c.y - h * 0.6); g.lineTo(c.x + w * 0.14, c.y - h * 0.6); g.lineTo(c.x - w * 0.16, c.y + h * 0.6); g.lineTo(c.x - w * 0.26, c.y + h * 0.6); g.closePath(); g.fill();
    g.restore();
    rutaLente(g, c, w, h, sx); g.lineWidth = E_.grosor[0]; g.strokeStyle = TINTA; g.stroke();
    rutaLente(g, c, w, h, sx); g.lineWidth = E_.grosor[1]; g.strokeStyle = E_.montura; g.stroke();
    g.strokeStyle = E_.luz; g.lineWidth = 1.8; g.lineCap = "round";
    g.beginPath(); g.moveTo(c.x - sx * w * 0.36, c.y - h * 0.47); g.quadraticCurveTo(c.x, c.y - h * 0.56, c.x + sx * w * 0.34, c.y - h * 0.46); g.stroke();
  }
  function dibGafas(g, E_, o, t) {
    const q = geo(E_, o);
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    patilla(g, E_, q.hf, { x: q.hf.x - E_.patilla * 0.5, y: q.hf.y + 16 }, 1 - q.ko);
    patilla(g, E_, q.hn, q.fin, 1);
    lente(g, E_, q.fc, q.wf, q.h * 0.97, -1, t + 0.15);
    lente(g, E_, q.nc, q.w, q.h, 1, t);
    const a = { x: q.nc.x + q.w * 0.47, y: E_.cy - q.h * 0.22 }, b = { x: q.fc.x - q.wf * 0.47, y: E_.cy - q.h * 0.22 };
    const pr = () => { g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo((a.x + b.x) / 2, a.y - 14, b.x, b.y); };
    pr(); g.lineWidth = E_.puente[0]; g.strokeStyle = TINTA; g.stroke(); pr(); g.lineWidth = E_.puente[1]; g.strokeStyle = E_.montura; g.stroke();
    const c1 = { x: q.nc.x + q.w * 0.36, y: E_.cy - q.h * 0.47 }, c2 = { x: q.fc.x - q.wf * 0.36, y: E_.cy - q.h * 0.47 };
    g.beginPath(); g.moveTo(c1.x, c1.y); g.quadraticCurveTo((c1.x + c2.x) / 2, c1.y - 6, c2.x, c2.y);
    g.lineWidth = E_.puente[0]; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = E_.puente[1]; g.strokeStyle = E_.montura; g.stroke();
    g.fillStyle = E_.montura; g.strokeStyle = TINTA; g.lineWidth = 2.5;
    for (const hp of [{ x: q.nc.x - q.w * 0.5 + 3, y: E_.cy - q.h * 0.3 }, { x: q.fc.x + q.wf * 0.5 - 3, y: E_.cy - q.h * 0.3 }]) {
      g.beginPath(); g.ellipse(hp.x, hp.y, 6, 6, 0, 0, TAU); g.fill(); g.stroke();
    }
    g.restore();
  }
  const CARA_K = { B: { x: 908, y: 420 }, th: 0.327, oreja: { x: -228, y: 74 }, persp: 0.66 };
  const caraAF = (Rg, p, CF, q) => mul(afCabeza(Rg, p), mul(mul(Tm(CF.B.x, CF.B.y), Rm(CF.th)), mul(Tm(q.dx || 0, q.dy || 0), Rm(q.rot || 0))));
  const O_K = { persp: CARA_K.persp, oreja: CARA_K.oreja, kOreja: 1 };
  function gafasK(t, pK) { return caraAF(KI, pK, CARA_K, qK(t)); }
  function dibujaGafasK(g, A, t) {
    if (!MATRIZ) return;
    g.save(); g.setTransform(MATRIZ); g.transform(A.a, A.b, A.c, A.d, A.e, A.f);
    dibGafas(g, AVIADOR, O_K, t);
    g.restore();
  }
  // las gafas colgadas del polo son píxeles del torso: se tapan con el polo y su tapeta (hoja)
  const TAPA = [[262, 315], [280, 313], [294, 321], [300, 342], [301, 364], [308, 372], [309, 412], [302, 424], [289, 429], [276, 422], [270, 405], [268, 374], [262, 362], [260, 336]];
  function tapaCuello(g) {
    g.save(); g.lineJoin = "round";
    const ruta = () => { g.beginPath(); g.moveTo(TAPA[0][0], TAPA[0][1]); for (const [x, y] of TAPA) g.lineTo(x, y); g.closePath(); };
    const gr = g.createLinearGradient(0, 312, 0, 430);
    gr.addColorStop(0, "#2b2a30"); gr.addColorStop(0.42, "#26252b"); gr.addColorStop(0.62, "#1b1a20"); gr.addColorStop(1, "#16151a");
    ruta(); g.fillStyle = gr; g.fill();
    g.globalAlpha = 0.55; g.lineWidth = 5; g.strokeStyle = "#232228"; g.stroke(); g.globalAlpha = 1;
    g.save(); ruta(); g.clip();
    g.strokeStyle = "rgba(8,8,10,0.75)"; g.lineWidth = 3; g.beginPath(); g.moveTo(279, 312); g.quadraticCurveTo(284, 370, 286, 430); g.stroke();
    g.strokeStyle = "rgba(70,68,78,0.5)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(283, 314); g.quadraticCurveTo(288, 370, 290, 430); g.stroke();
    g.fillStyle = "#3b3a42"; g.beginPath(); g.arc(283, 338, 3.4, 0, TAU); g.fill();
    g.fillStyle = "#121116"; g.beginPath(); g.arc(283, 338, 1.4, 0, TAU); g.fill();
    g.restore();
    g.restore();
  }
  // gafas en la cara: se las baja tirando de la patilla y se las vuelve a subir
  function qK(t) {
    const baja = tramo(t, T.kBaja1, T.kBaja2) * (1 - tramo(t, T.kArr0 + 0.04, T.kArr1, salida));
    const tiembla = 0.6 * Math.sin(t * 21) * campana(t, 1.0, 13.6);
    return { dx: -4 * baja, dy: 64 * baja + tiembla, rot: 0.05 * baja };
  }
  // el mechón de Kiriku: se levanta con el viento y vuelve a su sitio (retrato)
  function mechon(g, t) {
    const k = campana(t, T.mechon0, T.mechon1);
    const fl = 0.15 * Math.sin(t * 23) * k;
    const raiz = { x: 905, y: 228 };
    const L = 70, a = lerp(-0.4, -2.4, Math.pow(k, 0.7)) + fl;
    const m = { x: raiz.x + Math.cos(a + 0.6) * L * 0.55, y: raiz.y + Math.sin(a + 0.6) * L * 0.55 }, f = { x: raiz.x + Math.cos(a) * L, y: raiz.y + Math.sin(a) * L };
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    const ruta = () => { g.beginPath(); g.moveTo(raiz.x, raiz.y); g.quadraticCurveTo(m.x, m.y, f.x, f.y); };
    ruta(); g.strokeStyle = "#0e0a0a"; g.lineWidth = 15; g.stroke();
    ruta(); g.strokeStyle = "#2b211e"; g.lineWidth = 9; g.stroke();
    g.beginPath(); g.moveTo(lerp(raiz.x, m.x, 0.3), lerp(raiz.y, m.y, 0.3)); g.quadraticCurveTo(m.x, m.y, lerp(m.x, f.x, 0.7), lerp(m.y, f.y, 0.7));
    g.strokeStyle = "rgba(160,140,130,0.6)"; g.lineWidth = 3; g.stroke();
    g.restore();
  }

  /* =====================================================================================
   * PELO DE GUILLERMO AL VIENTO: se borran los pinchos del retrato y se pintan doblados
   * ===================================================================================== */
  const PIEL_CAB = [[806,850],[802,846],[766,842],[754,834],[746,834],[742,838],[734,826],[726,826],[718,814],[710,814],[704,808],[708,804],[702,798],[698,802],[690,798],[684,792],[682,782],[674,782],[662,774],[656,768],[660,764],[654,758],[650,762],[634,746],[630,746],[624,740],[624,732],[604,716],[608,712],[604,708],[604,692],[596,684],[596,668],[582,670],[570,654],[566,658],[556,648],[560,640],[558,638],[554,642],[544,632],[548,624],[532,604],[532,596],[528,592],[528,572],[532,568],[528,564],[532,560],[528,552],[540,536],[540,528],[548,516],[562,503],[570,499],[590,499],[624,532],[624,540],[630,550],[636,536],[632,532],[640,524],[640,516],[648,501],[676,477],[676,469],[684,461],[680,457],[690,447],[718,435],[734,423],[744,429],[728,461],[730,467],[762,451],[798,427],[806,431],[823,431],[839,443],[843,439],[851,439],[867,455],[875,455],[881,461],[869,481],[841,509],[843,511],[879,503],[903,487],[911,487],[917,493],[901,524],[893,532],[895,534],[931,514],[947,499],[955,503],[969,520],[965,596],[949,620],[953,624],[937,644],[937,652],[925,676],[909,732],[899,738],[877,764],[885,772],[875,782],[867,778],[861,788],[849,796],[825,832],[829,836],[819,846],[815,842]];
  const camino = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
  const PELO = (() => {
    const CUP = [[536,610],[522,540],[524,470],[542,410],[574,360],[625,316],[694,286],[775,270],[860,272],[940,294],[1006,332],[1050,382],[1068,440],[1062,500]];
    const FLEQUILLO = [[1062,500],[1042,552],[1028,522],[1004,570],[984,526],[954,566],[934,522],[902,556],[882,515],[848,540],[826,498],[792,515],[770,478],[728,486],[690,466],[656,488],[642,530],[632,575],[618,528],[598,505],[574,502],[556,520],[546,560]];
    const FRENTE = [[640,482],[720,452],[830,452],[930,470],[985,500],[1000,570],[960,615],[640,600]];
    const CAJA = [[300,40],[1320,40],[1320,700],[300,700]];
    // pinchos: raíz, punta (de pie), ancho en la raíz, retraso (0..1: delante se doblan antes)
    const PUAS = [
      [[548, 470], [497, 343], 72, 0.9], [[572, 400], [528, 312], 80, 0.8], [[618, 342], [592, 250], 78, 0.7],
      [[664, 308], [640, 222], 78, 0.6], [[722, 290], [800, 172], 96, 0.5], [[800, 276], [912, 184], 96, 0.4],
      [[872, 284], [976, 206], 92, 0.3], [[942, 302], [1070, 228], 90, 0.2], [[1002, 336], [1122, 290], 84, 0.12],
      [[1044, 384], [1128, 404], 74, 0.06], [[1062, 440], [1110, 512], 64, 0.02], [[1050, 500], [1082, 562], 52, 0], [[1012, 540], [1022, 612], 42, 0]
    ];
    const COL = { medio: "#8a4219", oscuro: "#3c1e0e", claro: "#c4703a", tinta: "#1e0e08" };
    const cubica = (a, b, c, d, u) => { const v = 1 - u; return { x: v*v*v*a.x + 3*v*v*u*b.x + 3*v*u*u*c.x + u*u*u*d.x, y: v*v*v*a.y + 3*v*v*u*b.y + 3*v*u*u*c.y + u*u*u*d.y }; };
    const dir = a => ({ x: Math.cos(a), y: Math.sin(a) });
    // w: cuánto empuja el viento (0 de pie … 1 tumbado hacia atrás); atras: ángulo del viento en el retrato
    function curvaPua(P, i, w, atras, t, ondea, aplasta) {
      const [r, tip] = P;
      const Rq = { x: r[0], y: r[1] }, a0 = Math.atan2(tip[1] - r[1], tip[0] - r[0]), L = Math.hypot(tip[0] - r[0], tip[1] - r[1]);
      // los de arriba se van un poco hacia arriba y los de la nuca, hacia abajo (siguen la cabeza)
      const abre = lerp(0.12, -0.42, clamp((r[1] - 270) / 340));
      const objetivo = atras + abre * (1 - 0.5 * aplasta);
      // los del flequillo (delante) suben primero y se van hacia atrás por encima, cortitos
      const fr = clamp((r[0] - 960) / 80);
      const tBase = lerp(objetivo + 0.45, -1.7, fr), tMed = lerp(objetivo + 0.15, -2.5, fr), tTip = objetivo;
      const fl = ondea * (0.16 * Math.sin(t * 31 + i * 1.9) + 0.09 * Math.sin(t * 53 + i * 0.7));
      const wa = 1 - Math.pow(1 - clamp(w), 1.6);
      const aBase = a0 + angDif(a0, tBase) * 0.92 * wa, aMed = a0 + angDif(a0, tMed) * wa + fl * 0.5 * wa, aTip = a0 + angDif(a0, tTip) * wa + fl * wa;
      const Lw = L * lerp(1, lerp(1.12, 0.6, fr), wa) * lerp(1, 0.78, aplasta);
      const P1 = { x: Rq.x + dir(aBase).x * Lw * 0.36, y: Rq.y + dir(aBase).y * Lw * 0.36 };
      const P2 = { x: P1.x + dir(aMed).x * Lw * 0.34, y: P1.y + dir(aMed).y * Lw * 0.34 };
      const P3 = { x: P2.x + dir(aTip).x * Lw * 0.36, y: P2.y + dir(aTip).y * Lw * 0.36 };
      return [Rq, P1, P2, P3];
    }
    function pua(g, P, i, w, atras, t, ondea, aplasta) {
      const ancho = P[2];
      const [Rq, P1, P2, P3] = curvaPua(P, i, w, atras, t, ondea, aplasta);
      const N = 12, izq = [], der = [], cen = [];
      for (let k = 0; k <= N; k++) {
        const u = k / N, q = cubica(Rq, P1, P2, P3, u), q2 = cubica(Rq, P1, P2, P3, Math.min(1, u + 0.02)), q1 = cubica(Rq, P1, P2, P3, Math.max(0, u - 0.02));
        const tx = q2.x - q1.x, ty = q2.y - q1.y, tl = Math.hypot(tx, ty) || 1, nx = -ty / tl, ny = tx / tl;
        const wv = ancho * 0.5 * Math.pow(1 - u, 0.9) * (1 + 0.15 * Math.sin(u * 3.1)) * lerp(1, 0.86, clamp(w));
        izq.push({ x: q.x + nx * wv, y: q.y + ny * wv }); der.push({ x: q.x - nx * wv, y: q.y - ny * wv }); cen.push({ x: q.x + nx * wv * 0.25, y: q.y + ny * wv * 0.25 });
      }
      const forma = () => { g.beginPath(); g.moveTo(izq[0].x, izq[0].y); for (const q of izq) g.lineTo(q.x, q.y); for (let k = der.length - 1; k >= 0; k--) g.lineTo(der[k].x, der[k].y); g.closePath(); };
      forma(); g.fillStyle = COL.medio; g.fill();
      g.save(); forma(); g.clip();
      g.beginPath(); g.moveTo(cen[0].x, cen[0].y); for (const q of cen) g.lineTo(q.x, q.y); for (let k = der.length - 1; k >= 0; k--) g.lineTo(der[k].x, der[k].y); g.closePath();
      g.fillStyle = COL.oscuro; g.globalAlpha *= 0.85; g.fill(); g.globalAlpha /= 0.85;
      g.beginPath(); for (let k = 1; k < N * 0.7; k++) { const q = izq[k], c = cen[k]; const m = { x: lerp(q.x, c.x, 0.45), y: lerp(q.y, c.y, 0.45) }; if (k === 1) g.moveTo(m.x, m.y); else g.lineTo(m.x, m.y); }
      g.lineWidth = 9; g.strokeStyle = COL.claro; g.globalAlpha *= 0.8; g.stroke(); g.globalAlpha /= 0.8;
      g.restore();
      g.beginPath(); g.moveTo(izq[0].x, izq[0].y); for (const q of izq) g.lineTo(q.x, q.y); for (let k = der.length - 1; k >= 0; k--) g.lineTo(der[k].x, der[k].y);
      g.lineWidth = 5.5; g.lineJoin = "round"; g.strokeStyle = COL.tinta; g.stroke();
    }
    const ruta = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
    const casquete = CUP.concat(FLEQUILLO).map(([x, y]) => ({ x, y }));
    function zona(g) {
      g.beginPath(); ruta(g, CAJA); M2.curva(g, casquete, true, 0.35); g.clip("evenodd");
      g.beginPath(); ruta(g, CAJA); camino(g, PIEL_CAB); g.clip("evenodd");
      g.beginPath(); ruta(g, CAJA); ruta(g, FRENTE); g.clip("evenodd");
    }
    // borra los pinchos del retrato (lo que sobresale del casquete; solo en el lienzo aparte)
    function borra(g, alfa) {
      g.save(); zona(g); g.globalAlpha = alfa; g.globalCompositeOperation = "destination-out"; g.fillStyle = "#000"; g.fillRect(300, 40, 1020, 660); g.restore();
    }
    function base(g) {
      g.save();
      g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); M2.curva(g, CUP.map(([x, y]) => ({ x, y })), false, 0.35);
      g.lineWidth = 16; g.strokeStyle = COL.oscuro; g.stroke(); g.lineWidth = 5; g.strokeStyle = COL.tinta; g.stroke();
      g.restore();
    }
    const ORDEN = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
    // w: viento (0…1); el retraso hace que se doblen uno a uno, empezando por delante
    function puas(g, w, atras, t, ondea, aplasta, solo) {
      g.save(); g.lineCap = "round"; g.lineJoin = "round";
      for (const i of ORDEN) {
        if (solo && !solo(i)) continue;
        const r = PUAS[i][3], wi = clamp((w - r * 0.45) / 0.55);
        pua(g, PUAS[i], i, wi, atras, t, ondea, aplasta);
      }
      g.restore();
    }
    const puntas = (w, atras, t, ondea, aplasta) => PUAS.map((P, i) => curvaPua(P, i, clamp((w - P[3] * 0.45) / 0.55), atras, t, ondea, aplasta)[3]);
    return { borra, base, puas, puntas, PUAS };
  })();

  /* =====================================================================================
   * CARA DE GUILLERMO AL VIENTO (retrato): carrillo cercano que ondea, lagrimones, el bicho
   * ===================================================================================== */
  const BOCA_C = { x: 803, y: 730 }, BOCA_ANG = 0.26;
  const PIEL_G = (() => { const c = G.A.datos.paleta.piel; return `rgb(${c.join(",")})`; })();
  // carrillo cercano: el contorno de la cara (lado de la oreja) se hincha y ondea hacia atrás
  // contorno de la cara del lado de la oreja (retrato): de debajo de la oreja a la barbilla
  const CONTORNO = [[600, 676], [604, 700], [612, 722], [624, 738], [640, 752], [656, 766], [674, 782], [692, 796], [712, 812], [734, 826], [760, 838]];
  const NORMAL = CONTORNO.map((q, i) => {
    const a = CONTORNO[Math.max(0, i - 1)], b = CONTORNO[Math.min(CONTORNO.length - 1, i + 1)];
    let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
    if (nx > 0) { nx = -nx; ny = -ny; }
    return { x: nx, y: ny };
  });
  function carrillos(g, k, t) {
    if (k <= 0.01) return;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const n = CONTORNO.length - 1;
    // el carrillo se hincha hacia fuera y una onda lo recorre hacia atrás (de la barbilla a la oreja)
    const pts = CONTORNO.map(([x, y], i) => {
      const u = i / n, env = Math.pow(Math.sin(Math.PI * u), 0.8);
      const ola = Math.sin(t * 38 + u * 10);
      const sale = k * env * (34 + 22 * ola), N = NORMAL[i];
      return { x: x + N.x * sale - 10 * k * env, y: y + N.y * sale - 6 * k * env };
    });
    const dentro = CONTORNO.map(([x, y], i) => ({ x: x - NORMAL[i].x * 22, y: y - NORMAL[i].y * 22 }));
    g.beginPath(); g.moveTo(dentro[0].x, dentro[0].y); g.lineTo(pts[0].x, pts[0].y); M2.curva(g, pts, false, 0.5);
    g.lineTo(dentro[n].x, dentro[n].y); for (let i = n; i >= 0; i--) g.lineTo(dentro[i].x, dentro[i].y);
    g.closePath(); g.fillStyle = PIEL_G; g.fill();
    g.beginPath(); M2.curva(g, pts, false, 0.5); g.lineWidth = 6.5; g.strokeStyle = TINTA; g.stroke();
    // pliegues que viajan con la onda
    g.globalAlpha = 0.6 * k; g.strokeStyle = "#c46a3c"; g.lineWidth = 4;
    for (let j = 0; j < 3; j++) {
      const ph = ((t * 4.2 + j / 3) % 1), u = lerp(0.85, 0.2, ph), i = Math.round(u * n), P = pts[i], N = NORMAL[i];
      const c = { x: P.x - N.x * 30, y: P.y - N.y * 30 }, tx = -N.y, ty = N.x;
      g.beginPath(); g.moveTo(c.x - tx * 22, c.y - ty * 22); g.quadraticCurveTo(c.x + N.x * 10, c.y + N.y * 10, c.x + tx * 22, c.y + ty * 22); g.stroke();
    }
    // brillo del moflete hinchado
    g.globalAlpha = 0.5 * k; g.fillStyle = "#fff1dc";
    g.beginPath(); g.ellipse(668, 700, 30, 15, -0.7, 0, TAU); g.fill();
    g.restore();
  }
  // ¡puaj!: la lengua fuera, meneándose (retrato)
  function lenguaFuera(g, k, t) {
    if (k <= 0.01) return;
    g.save(); g.translate(BOCA_C.x + 4, BOCA_C.y + 6); g.rotate(BOCA_ANG + 0.12 * Math.sin(t * 26));
    const L = 58 * k, w = 26;
    const forma = () => { g.beginPath(); g.moveTo(-w, -4); g.bezierCurveTo(-w - 2, L * 0.6, -w * 0.6, L, 0, L); g.bezierCurveTo(w * 0.6, L, w + 2, L * 0.6, w, -4); g.closePath(); };
    forma(); g.fillStyle = "#e46a6a"; g.fill(); g.lineWidth = 5; g.strokeStyle = TINTA; g.stroke();
    g.save(); forma(); g.clip(); g.fillStyle = "#c84c56"; g.beginPath(); g.ellipse(w * 0.4, L * 0.6, w * 0.6, L * 0.5, 0, 0, TAU); g.fill(); g.restore();
    g.strokeStyle = "rgba(120,20,30,0.7)"; g.lineWidth = 3.5; g.beginPath(); g.moveTo(0, 6); g.lineTo(0, L * 0.62); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.5)"; g.beginPath(); g.ellipse(-w * 0.45, L * 0.35, 5, 10, 0.2, 0, TAU); g.fill();
    g.restore();
  }
  function gotaDib(g, x, y, s, a = 1, ang = 0) {
    if (a <= 0.01 || s <= 0.2) return;
    g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(ang);
    g.beginPath(); g.moveTo(0, -s * 1.7); g.quadraticCurveTo(s, 0, 0, s); g.quadraticCurveTo(-s, 0, 0, -s * 1.7);
    g.fillStyle = "#bfe8ff"; g.fill(); g.lineWidth = Math.max(0.8, s * 0.32); g.strokeStyle = "#1d3b52"; g.stroke();
    g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(-s * 0.3, -s * 0.15, s * 0.22, s * 0.35, 0, 0, TAU); g.fill();
    g.restore();
  }
  // lagrimones: salen del rabillo de los ojos y se van volando hacia atrás (retrato)
  function lagrimas(g, k, t, atras) {
    if (k <= 0.01) return;
    g.save(); g.lineCap = "round";
    const dx = Math.cos(atras), dy = Math.sin(atras);
    // lagrimón en el rabillo del ojo cercano, estirado hacia atrás por el viento (tiembla)
    const tb = Math.sin(t * 40), fin = { x: 690 + 6 * tb, y: 560 };
    g.save(); g.globalAlpha = k; g.translate(736, 568); g.rotate(atras - Math.PI + 0.1);
    const L = 40 + 6 * tb;
    g.beginPath(); g.moveTo(0, -9); g.quadraticCurveTo(-L * 0.6, -11, -L, -2); g.quadraticCurveTo(-L * 0.6, 12, 0, 9); g.quadraticCurveTo(5, 0, 0, -9); g.closePath();
    g.fillStyle = "#bfe8ff"; g.fill(); g.lineWidth = 3; g.strokeStyle = "#1d3b52"; g.stroke();
    g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(-L * 0.35, -3, L * 0.18, 2.6, 0, 0, TAU); g.fill();
    g.restore();
    // gotas que salen volando hacia atrás: del rabillo cercano y del ojo lejano, por encima de la cara
    for (const [x0, y0, d, n, esc] of [[fin.x, fin.y, 0, 5, 1], [868, 596, 0.37, 3, 0.75]]) {
      for (let i = 0; i < n; i++) {
        const ph = ((t * 3.1 + i / n + d) % 1), L = 20 + ph * 300;
        gotaDib(g, x0 + dx * L, y0 + dy * L - 40 * ph + 26 * ph * ph, esc * 10 * (1 - 0.45 * ph), k * Math.sin(Math.PI * Math.min(1, ph * 1.15)), atras + Math.PI / 2);
      }
    }
    g.restore();
  }
  // el bicho (unidades propias, ~1 = 1 px de pantalla a escala 1)
  function dibBicho(g, t, aplastado) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    if (!aplastado) {
      // alas en movimiento
      const al = 0.6 + 0.4 * Math.sin(t * 90);
      g.fillStyle = "rgba(220,240,255,0.55)"; g.strokeStyle = "rgba(60,80,100,0.6)"; g.lineWidth = 0.8;
      g.beginPath(); g.ellipse(-1, -5 * al, 7, 3.4, -0.5, 0, TAU); g.fill(); g.stroke();
      g.beginPath(); g.ellipse(2, -5 * al, 6, 3, 0.4, 0, TAU); g.fill(); g.stroke();
    }
    g.strokeStyle = "#141810"; g.lineWidth = 1.2;
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      const x = -3 + i * 3, w = aplastado ? Math.sin(t * 30 + i) * 1.5 : 0;
      g.beginPath(); g.moveTo(x, 1); g.lineTo(x - 2 + w, 1 + s * 5); g.stroke();
    }
    if (aplastado) { g.fillStyle = "rgba(160,200,60,0.85)"; g.beginPath(); g.ellipse(1, 1, 9, 4, 0.2, 0, TAU); g.fill(); }
    g.fillStyle = "#2a3a1c"; g.beginPath(); g.ellipse(0, 0, aplastado ? 7 : 5.5, aplastado ? 2.6 : 4, 0, 0, TAU); g.fill();
    g.fillStyle = "#4d6a2c"; g.beginPath(); g.ellipse(-1, -1, 3, 1.6, 0, 0, TAU); g.fill();
    g.fillStyle = "#0e120a"; g.beginPath(); g.arc(5, 0, aplastado ? 2.2 : 2.6, 0, TAU); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(5.6, -0.8, 0.8, 0, TAU); g.fill();
    g.restore();
  }

  /* =====================================================================================
   * CASCO DE AVIADOR (retrato de Guillermo; origen = retrato): cuero, borreguito y gafas
   * ===================================================================================== */
  const CUERO = { base: "#7c4a26", sombra: "#55301a", luz: "#a8703f", tinta: "#1e120a", borrego: "#f1e3c2", borregoS: "#c9b48a", laton: "#d1a64a", latonS: "#8a6420" };
  const CASCO = [[548, 640], [520, 560], [520, 470], [540, 400], [580, 340], [640, 292], [720, 258], [810, 246], [900, 254], [980, 284], [1040, 334], [1074, 400], [1080, 470], [1066, 520]];
  const BORDE = [[1066, 520], [990, 498], [900, 486], [800, 482], [712, 490], [646, 510], [604, 544], [584, 600], [548, 640]];
  // orejera cercana: cuelga sobre la oreja; ondea suelta o va abrochada bajo la barbilla
  function orejera(g, t, ondea, abrocha) {
    const fl = ondea * Math.sin(t * 27);
    const P = [[560, 560], [622, 556], [652, 640], [640, 720 + 10 * fl], [606, 760 + 14 * fl], [566, 742 + 8 * fl], [548, 680]];
    g.save(); g.lineJoin = "round";
    g.beginPath(); M2.curva(g, P.map(([x, y]) => ({ x, y })), true, 0.45);
    g.fillStyle = CUERO.base; g.fill(); g.lineWidth = 6; g.strokeStyle = CUERO.tinta; g.stroke();
    g.save(); g.clip(); g.fillStyle = CUERO.sombra; g.beginPath(); g.ellipse(640, 720, 40, 70, 0.2, 0, TAU); g.fill(); g.restore();
    // pespunte
    g.setLineDash([7, 6]); g.lineWidth = 2.2; g.strokeStyle = "rgba(255,226,180,0.55)";
    g.beginPath(); M2.curva(g, P.map(([x, y]) => ({ x: lerp(x, 600, 0.16), y: lerp(y, 660, 0.16) })), true, 0.45); g.stroke(); g.setLineDash([]);
    // correa: suelta, ondeando hacia atrás; abrochada, por debajo de la barbilla
    const a = { x: 600, y: 748 + 10 * fl };
    const suelta = [a, { x: 560 - 30 * ondea, y: 790 + 24 * fl }, { x: 520 - 60 * ondea, y: 800 - 10 * fl }];
    const atada = [a, { x: 680, y: 850 }, { x: 800, y: 868 }];
    const c = [0, 1, 2].map(i => mezcla(suelta[i], atada[i], abrocha));
    g.lineCap = "round"; g.beginPath(); g.moveTo(c[0].x, c[0].y); g.quadraticCurveTo(c[1].x, c[1].y, c[2].x, c[2].y);
    g.lineWidth = 17; g.strokeStyle = CUERO.tinta; g.stroke(); g.lineWidth = 11; g.strokeStyle = CUERO.sombra; g.stroke();
    // hebilla
    g.save(); g.translate(c[2].x, c[2].y); g.fillStyle = CUERO.laton; g.strokeStyle = CUERO.tinta; g.lineWidth = 3;
    g.beginPath(); g.rect(-9, -8, 18, 16); g.fill(); g.stroke(); g.restore();
    g.restore();
  }
  // gafas del casco: k = 0 subidas en la frente del casco … 1 sobre los ojos
  const GAFAS_ARR = { a: { x: 742, y: 404, r: 54 }, b: { x: 894, y: 420, r: 46 } };
  const GAFAS_AB = { a: { x: 770, y: 566, r: 60 }, b: { x: 900, y: 618, r: 46 } };
  function gafasCasco(g, k, t, salpica) {
    const A = { x: lerp(GAFAS_ARR.a.x, GAFAS_AB.a.x, k), y: lerp(GAFAS_ARR.a.y, GAFAS_AB.a.y, k), r: lerp(GAFAS_ARR.a.r, GAFAS_AB.a.r, k) };
    const B = { x: lerp(GAFAS_ARR.b.x, GAFAS_AB.b.x, k), y: lerp(GAFAS_ARR.b.y, GAFAS_AB.b.y, k), r: lerp(GAFAS_ARR.b.r, GAFAS_AB.b.r, k) };
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // correa elástica hacia la nuca
    const n = { x: 548, y: lerp(470, 560, k) };
    g.beginPath(); g.moveTo(A.x - A.r * 0.9, A.y); g.quadraticCurveTo(lerp(A.x, n.x, 0.5), lerp(A.y, n.y, 0.5) - 26, n.x, n.y);
    g.lineWidth = 26; g.strokeStyle = CUERO.tinta; g.stroke(); g.lineWidth = 18; g.strokeStyle = "#6b5a3a"; g.stroke();
    g.setLineDash([10, 8]); g.lineWidth = 2; g.strokeStyle = "rgba(255,240,200,0.5)"; g.stroke(); g.setLineDash([]);
    // puente
    g.beginPath(); g.moveTo(A.x + A.r * 0.8, A.y + 4); g.quadraticCurveTo((A.x + B.x) / 2, (A.y + B.y) / 2 - 18, B.x - B.r * 0.8, B.y - 2);
    g.lineWidth = 14; g.strokeStyle = CUERO.tinta; g.stroke(); g.lineWidth = 8; g.strokeStyle = CUERO.laton; g.stroke();
    for (const [c, sx] of [[B, 0.62], [A, 1]]) {
      // copa de latón (cristal redondo con aro grueso) vista de tres cuartos
      g.save(); g.translate(c.x, c.y); g.scale(sx, 1);
      g.beginPath(); g.arc(0, 0, c.r + 12, 0, TAU); g.fillStyle = CUERO.latonS; g.fill(); g.lineWidth = 6; g.strokeStyle = CUERO.tinta; g.stroke();
      g.beginPath(); g.arc(0, 0, c.r + 6, 0, TAU); g.fillStyle = CUERO.laton; g.fill();
      g.beginPath(); g.arc(0, 0, c.r - 2, 0, TAU);
      const gr = g.createLinearGradient(0, -c.r, 0, c.r); gr.addColorStop(0, "#bfe6ef"); gr.addColorStop(0.55, "#6fb3c8"); gr.addColorStop(1, "#3c7f98");
      g.fillStyle = gr; g.fill(); g.lineWidth = 4; g.strokeStyle = CUERO.tinta; g.stroke();
      g.save(); g.clip();
      g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.ellipse(-c.r * 0.3, -c.r * 0.35, c.r * 0.5, c.r * 0.22, -0.5, 0, TAU); g.fill();
      const fx = ((t * 1.1 + sx) % 1) * 2.4 - 1.2;
      g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.moveTo(c.r * (fx - 0.2), -c.r); g.lineTo(c.r * (fx + 0.1), -c.r); g.lineTo(c.r * (fx - 0.3), c.r); g.lineTo(c.r * (fx - 0.6), c.r); g.closePath(); g.fill();
      g.restore();
      // tornillos del aro
      g.fillStyle = CUERO.latonS; for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + 0.3; g.beginPath(); g.arc(Math.cos(a) * (c.r + 6), Math.sin(a) * (c.r + 6), 2.6, 0, TAU); g.fill(); }
      g.restore();
    }
    // bicho estampado en el cristal cercano
    if (salpica > 0.01) {
      g.save(); g.translate(A.x + 10, A.y - 8); g.scale(4.2 * salpica, 4.2 * salpica);
      g.fillStyle = "rgba(170,210,70,0.9)"; g.beginPath();
      for (let i = 0; i < 10; i++) { const a = i * TAU / 10, r = i % 2 ? 5 : 9; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      g.closePath(); g.fill();
      dibBicho(g, t, true);
      g.restore();
    }
    g.restore();
  }
  // el casco entero. o: { gafas, ondea, abrocha, salpica, inflado (0 arrugado … 1) }
  function dibCasco(g, o, t) {
    const inf = o.inflado ?? 1;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    if (inf < 0.999) { g.translate(800, 500); g.scale(lerp(0.5, 1, inf), lerp(0.42, 1, inf)); g.translate(-800, -500); }
    orejera(g, t, o.ondea ?? 0, o.abrocha ?? 0);
    // cúpula
    const ruta = () => { g.beginPath(); M2.curva(g, CASCO.concat(BORDE.slice(1)).map(([x, y]) => ({ x, y })), true, 0.38); };
    ruta(); g.fillStyle = CUERO.base; g.fill();
    g.save(); ruta(); g.clip();
    g.fillStyle = CUERO.sombra; g.beginPath(); g.ellipse(620, 520, 150, 210, 0.3, 0, TAU); g.fill();
    g.fillStyle = CUERO.luz; g.globalAlpha = 0.85; g.beginPath(); g.ellipse(860, 330, 150, 60, 0.15, 0, TAU); g.fill();
    g.fillStyle = "rgba(255,240,215,0.5)"; g.beginPath(); g.ellipse(880, 300, 70, 20, 0.15, 0, TAU); g.fill();
    g.globalAlpha = 1;
    // costuras de la cúpula (de delante a la nuca)
    g.strokeStyle = CUERO.tinta; g.lineWidth = 4.5;
    for (const [a, b, c] of [[[1000, 300], [820, 230], [560, 420]], [[1060, 420], [820, 300], [530, 560]]]) {
      g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(b[0], b[1], c[0], c[1]); g.stroke();
      g.save(); g.setLineDash([7, 7]); g.lineWidth = 2; g.strokeStyle = "rgba(255,226,180,0.5)"; g.translate(0, 9);
      g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(b[0], b[1], c[0], c[1]); g.stroke(); g.restore();
    }
    g.restore();
    ruta(); g.lineWidth = 7; g.strokeStyle = CUERO.tinta; g.stroke();
    // borreguito en el borde de la frente
    g.beginPath(); M2.curva(g, BORDE.map(([x, y]) => ({ x, y })), false, 0.4);
    g.lineWidth = 34; g.strokeStyle = CUERO.tinta; g.stroke(); g.lineWidth = 26; g.strokeStyle = CUERO.borrego; g.stroke();
    g.fillStyle = CUERO.borregoS;
    for (let i = 0; i < BORDE.length - 1; i++) for (let j = 0; j < 3; j++) {
      const a = BORDE[i], b = BORDE[i + 1], u = (j + 0.5) / 3;
      g.beginPath(); g.arc(lerp(a[0], b[0], u), lerp(a[1], b[1], u) + 4, 4, 0, TAU); g.fill();
    }
    gafasCasco(g, o.gafas ?? 0, t, o.salpica ?? 0);
    g.restore();
  }
  // afín del casco en la cabeza (con un desplazamiento mientras se lo encasqueta) y en la mano
  const AGARRE_CASCO = { x: 806, y: 262 };              // por dónde lo coge: la coronilla (cuelga de la mano)
  const cascoCabeza = (p, q) => mul(afCabeza(G, p), mul(Tm(q.dx || 0, q.dy || 0), mul(Tm(800, 500), mul(Rm(q.rot || 0), Tm(-800, -500)))));

  /* =====================================================================================
   * GUILLERMO (copiloto, cerca de cámara)
   * ===================================================================================== */
  const CG = {
    inicio: E({ mx: 0.6, my: -0.1, iris: 1.05, sd: 12, si: 10, sonr: 0.8, ancho: 1.02, abre: 6 }),
    yuju: E({ mx: 0.4, my: -0.6, c: 0.5, h: 0.8, sd: 18, si: 16, abre: 28, ancho: 1.05, sonr: 0.95 }),
    contento: E({ mx: 0.9, my: -0.1, sd: 10, si: 10, abre: 10, sonr: 0.9, ancho: 1.04 }),
    aprieta: E({ mx: 0.8, c: 0.7, z: 0.5, sd: -4, si: -4, abre: 12, ancho: 1.0, sonr: 0.3 }),
    viento: E({ c: 1, z: 1, sd: -10, si: -10, abre: 32, ancho: 1.24, sonr: -0.12 }),
    helado: E({ mx: 0.7, my: 0.9, iris: 0.82, sd: 26, si: 24, abre: 13, ancho: 0.82, sonr: -0.2 }),
    pesca: E({ mx: 0.85, my: 0.85, iris: 0.9, sd: 22, gd: 0.1, si: 18, abre: 12, ancho: 0.8, sonr: -0.35 }),
    mira: E({ mx: 0.95, my: 0.55, iris: 0.95, sd: 20, gd: 0.18, si: 6, abre: 4, ancho: 0.62, sonr: -0.45 }),
    tira: E({ mx: -0.4, my: -0.2, c: 0.4, sd: 14, si: 10, abre: 6, ancho: 0.7, sonr: -0.4 }),
    bleh: E({ mx: 0.4, my: 0.2, c: 0.9, z: 0.8, sd: 8, gd: 0.2, si: 8, gi: 0.2, abre: 18, ancho: 0.8, sonr: -0.5, lengua: 0, rub: 0 }),
    idea: E({ mx: 0.6, my: -0.5, iris: 1.12, sd: 26, si: 24, abre: 8, ancho: 0.8, sonr: 0.55 }),
    busca: E({ mx: 0.85, my: 0.9, sd: 10, si: 10, abre: 3, ancho: 0.8, sonr: 0.4 }),
    saca: E({ mx: 0.7, my: 0.5, iris: 1.08, sd: 20, si: 18, abre: 14, ancho: 0.95, sonr: 0.8 }),
    pone: E({ mx: 0.6, my: -0.7, c: 0.3, sd: 16, si: 14, abre: 6, ancho: 0.9, sonr: 0.7 }),
    heroe: E({ mx: 0.9, my: -0.2, sd: 8, gd: -0.1, si: 6, gi: -0.08, abre: 14, ancho: 1.08, sonr: 1.0 }),
    camara: E({ mx: -0.5, my: -0.1, sd: 14, si: 10, abre: 10, ancho: 1.06, sonr: 1.0 })
  };
  const GUION_CG = [
    [T.yuju0, T.yuju1, "yuju"], [T.yuju2, T.yuju2 + 0.3, "contento"], [T.viento0 + 0.4, T.viento1 - 0.3, "aprieta"],
    [T.mof0 - 0.15, T.mof0 + 0.15, "viento"], [T.bicho, T.bicho + 0.06, "helado", salida], [T.pinza0 - 0.1, T.pinza0 + 0.1, "pesca"],
    [T.mira - 0.1, T.mira + 0.08, "mira"], [T.tira0, T.tira0 + 0.12, "tira"], [T.bleh0, T.bleh0 + 0.1, "bleh", salida],
    [T.idea, T.idea + 0.08, "idea", salida], [T.boton0 - 0.05, T.boton0 + 0.15, "busca"], [T.saca0 + 0.15, T.saca0 + 0.3, "saca"],
    [T.suelta, T.suelta + 0.2, "pone"], [T.gafas2, T.heroe0 + 0.1, "heroe"], [T.heroe1 + 0.3, T.heroe1 + 0.55, "camara"],
    [12.25, 12.5, "heroe"]
  ];
  const PARP_G = [0.3, 2.4, 6.3, 8.55, 9.15, 11.6, 13.2];
  const P0G = { pel: 0, torso: -0.04, cab: 0.0, cdy: 0, dx: 0 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    quieto: CuG({}),
    yuju: CuG({ torso: -0.1, cab: -0.14, pel: -6 }),
    agarra: CuG({ torso: -0.07, cab: -0.06 }),
    viento: CuG({ torso: -0.11, cab: -0.12, pel: -2 }),
    helado: CuG({ torso: -0.04, cab: 0.08 }),
    pesca: CuG({ torso: 0.02, cab: 0.14 }),
    mira: CuG({ torso: 0.03, cab: 0.06 }),
    tira: CuG({ torso: -0.06, cab: -0.1 }),
    bleh: CuG({ torso: 0.03, cab: 0.12 }),
    idea: CuG({ torso: -0.03, cab: -0.08 }),
    busca: CuG({ torso: 0.22, cab: 0.28, pel: 8 }),
    saca: CuG({ torso: 0.08, cab: 0.08 }),
    lanza: CuG({ torso: -0.05, cab: -0.16, pel: -3 }),
    pone: CuG({ torso: 0.05, cab: 0.12 }),
    ajusta: CuG({ torso: 0.0, cab: 0.06 }),
    heroe: CuG({ torso: -0.1, cab: -0.16, pel: -5 })
  };
  const GUION_G = [
    [T.yuju0, T.yuju1, "yuju"], [T.agarra0, T.agarra1, "agarra"], [T.mof0 - 0.2, T.mof0 + 0.2, "viento"],
    [T.bicho, T.bicho + 0.08, "helado", salida], [T.pinza0, T.pinza1, "pesca"], [T.mira - 0.12, T.mira + 0.1, "mira"],
    [T.tira0, T.tira, "tira", salida], [T.bleh0, T.bleh0 + 0.15, "bleh"], [T.idea, T.idea + 0.12, "idea"],
    [T.boton0 - 0.1, T.boton0 + 0.12, "busca"], [T.saca0 + 0.15, T.saca1, "saca"], [T.pone0, T.suelta + 0.05, "lanza"], [T.pone1 - 0.12, T.pone1 + 0.04, "pone", salida],
    [T.encaja, T.encaja + 0.2, "ajusta"], [T.heroe0, T.heroe1, "heroe", salida]
  ];
  // viento en el pelo: de pie → doblado del todo; con el casco, aplastado debajo
  const vientoPelo = t => 0.02 + 0.98 * tramo(t, T.viento0, T.viento1, k => k);
  const capaPelo = t => tramo(t, T.viento0 - 0.08, T.viento0 + 0.14);
  const carrillosK = t => tramo(t, T.mof0, T.mof0 + 0.25) * (1 - tramo(t, T.bicho - 0.04, T.bicho + 0.1));
  const llanto = t => tramo(t, T.mof0 + 0.2, T.mof0 + 0.5) * (1 - tramo(t, T.bicho, T.bicho + 0.3));
  const verdeAsco = t => 0.3 * tramo(t, T.bleh0, T.bleh0 + 0.15) * (1 - tramo(t, T.idea - 0.05, T.idea + 0.2));
  // el casco: arrugado en la guantera → en la mano → en la cabeza
  const EN_GUANTERA = { x: 440, y: 404 }, MIRA_BICHO = { x: 1150, y: 700 };
  const SOSTIENE = { x: 520, y: 330 }, IMPULSO = { x: 500, y: 420 }, LANZA = { x: 470, y: 240 };
  const PUNTOS_G = {};
  function poseG(t) {
    const b = linea(GUION_G, CUER_G, "quieto", t);
    const respira = Math.sin(t * 2.3 + 0.4);
    const emp = empujon(t), trq = traqueteo(t);
    const p = {
      x: XG + b.dx, suelo: SUELO_G, s: SG,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 + trq * 0.7 / SG },
      torso: b.torso - 0.08 * emp, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab - 0.12 * emp + 0.02 * Math.sin(t * 10.7 + 0.5), dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } },
      tirasLimpias: true, ikContinuo: false, hombrosContinuos: true, hombrosRecortados: true
    };
    // tiembla con el viento; se sacude de asco; se ríe de gusto con el casco
    p.cabeza.ang += 0.03 * Math.sin(t * 29) * tramo(t, T.mof0, T.mof0 + 0.3) * (1 - tramo(t, T.bicho, T.bicho + 0.1));
    p.cabeza.ang += 0.09 * Math.sin((t - T.bleh0) * 30) * campana(t, T.bleh0 + 0.05, T.bleh1);
    p.cabeza.ang += 0.05 * Math.sin((t - T.encaja) * 26) * campana(t, T.encaja - 0.04, T.encaja + 0.3);
    // piernas: sentado, por debajo del salpicadero (no se ven)
    p.piernas.cerca = { tob: { x: G.PELVIS.x + 480, y: G.PELVIS.y + 60 }, ang: -0.8 };
    p.piernas.lejos = { tob: { x: G.PELVIS.x + 610, y: G.PELVIS.y + 50 }, ang: -0.8 };
    const e = linea(GUION_CG, CG, "inicio", t);
    // carrillos al viento: la boca aletea
    const mof = carrillosK(t);
    if (mof > 0.01) { e.abre += mof * (9 * Math.sin(t * 37) + 5 * Math.sin(t * 59 + 1)); e.ancho += mof * 0.06 * Math.sin(t * 43); e.mof = Math.max(e.mof, mof * (0.6 + 0.4 * Math.sin(t * 34 + 0.6))); }
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.sudor = 0;
    // manos
    const res = resolutor(G, p);
    const H = q => () => retrato(G, p, q);
    const mano = (o) => Object.assign({ dobla: 1 }, o);
    const PUERTA_C = { x: 236, y: 418 }, PUERTA_L = { x: 352, y: 420 };
    const RELAJA_C = { hoja: { x: 120, y: 660 }, mu: -1.4, dedos: D(0.3, 0.4, 0.4, 0.4), dobla: -1 };
    const RELAJA_L = { hoja: { x: 380, y: 640 }, mu: -1.7, dedos: D(0.3, 0.4, 0.4, 0.4), dobla: 1 };
    const AGARRA = D(0.15, 0.1, 0.1, 0.1);
    const casco = t >= T.pone1 ? cascoG(t, p) : null;
    const PISTA_GC = [
      [0, 0, RELAJA_C],
      // ¡yuju!: los dos brazos arriba
      [T.yuju0 - 0.1, T.yuju1, { hoja: { x: 40, y: 120 }, mu: -1.9, dedos: D(0.9, 1, 1, 1), dobla: -1 }, salida],
      [T.yuju2, T.agarra1, { scr: PUERTA_C, ref: CENTRO, mu: 1.35, dedos: AGARRA, dobla: -1 }],
      // se ajusta la orejera tirando de ella hacia abajo
      [T.oreja0, T.oreja1, { scr: H({ x: 600, y: 700 }), ref: PALMA, mu: 1.2, dedos: D(0.4, 0.7, 0.7, 0.7), dobla: -1 }],
      [T.oreja1, T.oreja2, { scr: H({ x: 606, y: 742 }), ref: PALMA, mu: 1.2, dedos: D(0.3, 0.5, 0.5, 0.5), dobla: -1 }],
      // se baja las gafas por el lado
      [T.gafas0, T.gafas0 + 0.12, { scr: () => retrato(G, p, casco.cabeza ? apl(casco.local, { x: 690, y: lerp(404, 566, bajaGafas(t)) }) : { x: 690, y: 404 }), ref: PALMA, mu: 1.0, dedos: D(0.5, 0.8, 0.8, 0.8), dobla: -1 }],
      [T.gafas0 + 0.12, T.gafas1, { scr: () => retrato(G, p, { x: 690, y: lerp(404, 566, bajaGafas(t)) }), ref: PALMA, mu: 1.0, dedos: D(0.5, 0.8, 0.8, 0.8), dobla: -1 }],
      [T.gafas2, T.heroe0 + 0.25, { scr: PUERTA_C, ref: CENTRO, mu: 1.35, dedos: AGARRA, dobla: -1 }]
    ];
    const PISTA_GL = [
      [0, 0, RELAJA_L],
      [T.yuju0 - 0.1, T.yuju1, { hoja: { x: 470, y: 110 }, mu: -1.2, dedos: D(0.9, 1, 1, 1), dobla: 1 }, salida],
      [T.yuju2, T.agarra1, { scr: PUERTA_L, ref: CENTRO, mu: 1.35, dedos: AGARRA, dobla: 1 }],
      // pesca el bicho de los dientes, lo mira y lo tira
      [T.pinza0, T.pinza1, { scr: H({ x: 812, y: 744 }), mu: 2.6, dedos: D5(0.62, 0.55, 0.22, 0.18, 0.16), dobla: 1 }],
      [T.pinza1 + 0.04, T.mira, { scr: () => retrato(G, p, MIRA_BICHO), mu: 2.2, dedos: D5(0.62, 0.55, 0.22, 0.18, 0.16), dobla: 1 }],
      [T.tira0, T.tira0 + 0.1, { scr: () => retrato(G, p, MIRA_BICHO), mu: 2.3, dedos: D(1, 1, 1, 1), dobla: 1 }, salida],
      [T.tira + 0.08, T.bleh1, { scr: PUERTA_L, ref: CENTRO, mu: 1.35, dedos: AGARRA, dobla: 1 }],
      // botón de la guantera, mano dentro y fuera con el casco
      [T.boton0, T.boton, { scr: { x: 456, y: 396 }, mu: 1.2, dedos: D5(0, 1, 0, 0, 0), dobla: 1 }],
      [T.boton + 0.04, T.saca0, { scr: EN_GUANTERA, ref: PINZA, mu: 1.5, dedos: D5(0.6, 0.55, 0.3, 0.25, 0.2), dobla: 1 }],
      // lo saca, lo sostiene delante, coge impulso y lo lanza hacia arriba
      [T.saca0, T.saca1, { hoja: SOSTIENE, mu: 2.1, dedos: D5(0.6, 0.55, 0.3, 0.25, 0.2), dobla: 1 }, salida],
      [T.saca1, T.pone0, { hoja: IMPULSO, mu: 2.3, dedos: D5(0.6, 0.55, 0.3, 0.25, 0.2), dobla: 1 }],
      [T.pone0, T.suelta, { hoja: LANZA, mu: 1.9, dedos: D5(0.6, 0.55, 0.3, 0.25, 0.2), dobla: 1 }, salida],
      [T.suelta, T.suelta + 0.08, { hoja: LANZA, mu: 1.9, dedos: D(1, 1, 1, 1), dobla: 1 }],
      [T.suelta + 0.1, T.encaja + 0.1, { scr: PUERTA_L, ref: CENTRO, mu: 1.35, dedos: AGARRA, dobla: 1 }],
      // héroe: señala la carretera
      [T.heroe0, T.heroe1, { hoja: { x: 612, y: 300 }, mu: 2.85, dedos: D5(0, 1, 0, 0, 0), dobla: 1 }, salida]
    ];
    const C = pista(PISTA_GC, t, res), L = pista(PISTA_GL, t, res);
    // aletea un poco con el viento
    const fl = Math.sin(t * 14) * 0.08 * tramo(t, T.heroe1, T.heroe1 + 0.3);
    p.manoCerca = { x: C.x, y: C.y, ang: C.ang, mu: C.mu, dobla: C.dobla, puno: C.puno, dedos: C.dedos };
    p.manoLejos = { x: L.x, y: L.y, ang: L.ang + fl, mu: L.mu, dobla: L.dobla, puno: L.puno, dedos: L.dedos };
    p._casco = casco || cascoG(t, p);
    return p;
  }
  const bajaGafas = t => tramo(t, T.gafas0 + 0.1, T.gafas1, entrada) + 0.06 * Math.sin((t - T.gafas1) * 30) * campana(t, T.gafas1, T.gafas2 + 0.15);

  // dónde está el casco: { A (afín del retrato a la pantalla), capa: "guantera" | "mano" | "aire" | "cabeza", inflado, cabeza, local }
  const memoCasco = new Map();
  function cascoEnMano(t, p) {
    const sc = desc(afCabeza(G, p)).sy, q = ptMano(G, p, p.manoLejos, PINZA);
    const th = 0.18 * Math.sin((t - T.saca0) * 9) * campana(t, T.saca0, T.pone0 + 0.05) + 0.12 * tramo(t, T.saca1, T.pone0) - 0.3 * tramo(t, T.pone0, T.suelta);
    return mul(Tm(q.x, q.y), mul(Rm(th), mul(Sm(sc, sc), Tm(-AGARRE_CASCO.x, -AGARRE_CASCO.y))));
  }
  const CENTRO_CASCO = { x: 800, y: 440 };
  function cascoG(t, p) {
    if (t < T.boton) return null;
    const inflado = t < T.saca0 ? 0 : tramo(t, T.saca0 + 0.12, T.saca0 + 0.42, salida) + 0.08 * Math.sin((t - T.saca0) * 22) * campana(t, T.saca0 + 0.3, T.saca1 + 0.2);
    const bote = 1 + 0.07 * Math.sin((t - T.pone1) * 30) * Math.exp(-Math.max(0, t - T.pone1) * 6) * (t >= T.pone1 ? 1 : 0);
    const local = mul(Tm(800, 470), mul(Sm(1, bote), Tm(-800, -470)));
    if (t >= T.pone1) return { A: mul(cascoCabeza(p, {}), local), capa: "cabeza", inflado: 1, cabeza: true, local };
    if (t < T.saca0) {
      // en la guantera: arrugado, de lado
      const sc = desc(afCabeza(G, p)).sy;
      return { A: mul(Tm(EN_GUANTERA.x, EN_GUANTERA.y), mul(Rm(-0.15), mul(Sm(sc, sc), Tm(-AGARRE_CASCO.x, -AGARRE_CASCO.y)))), capa: "guantera", inflado, cabeza: false, local };
    }
    if (t <= T.suelta) return { A: cascoEnMano(t, p), capa: "mano", inflado, cabeza: false, local };
    // en el aire: de la mano a la cabeza, dando una vuelta hacia atrás
    if (!memoCasco.has("suelta")) memoCasco.set("suelta", desc(cascoEnMano(T.suelta, poseG(T.suelta))));
    const d0 = memoCasco.get("suelta"), A1 = cascoCabeza(p, {}), d1 = desc(A1);
    const c0 = apl(mul(mul(Tm(d0.x, d0.y), Rm(d0.th)), Sm(d0.sx, d0.sy)), CENTRO_CASCO), c1 = apl(A1, CENTRO_CASCO);
    const u = fase(t, T.suelta, T.pone1), ue = salida(u);
    const c = { x: lerp(c0.x, c1.x, u), y: lerp(c0.y, c1.y, u) - 95 * 4 * u * (1 - u) };
    const th = lerp(d0.th, d1.th - TAU, suave(u)), sx = lerp(d0.sx, d1.sx, ue), sy = lerp(d0.sy, d1.sy, ue);
    const A = mul(Tm(c.x, c.y), mul(Rm(th), mul(Sm(sx, sy), Tm(-CENTRO_CASCO.x, -CENTRO_CASCO.y))));
    return { A, capa: "aire", inflado: 1, cabeza: false, local };
  }

  /* =====================================================================================
   * KIRIKU (conductor, lejos de cámara)
   * ===================================================================================== */
  const CK = {
    inicio: E({ mx: 0.6, my: 0.1, sd: 6, si: 8, sonr: 0.5, ancho: 0.92 }),
    camara: E({ mx: -0.5, my: 0.1, sd: 10, si: 14, gi: -0.06, sonr: 0.75, ancho: 0.98 }),
    conduce: E({ mx: 0.8, my: 0.0, sd: 4, si: 4, sonr: 0.45, ancho: 0.9 }),
    mira: E({ mx: -0.8, my: 0.1, sd: 20, gd: 0.1, si: 4, sonr: 0.15, ancho: 0.7 }),
    esquiva: E({ mx: -0.2, my: -0.8, c: 0.15, sd: 22, si: 20, sonr: 0.2, ancho: 0.7 }),
    sobre: E({ mx: -0.55, my: -0.35, iris: 0.95, sd: 28, gd: 0.14, si: 0, gi: -0.05, sonr: 0.08, ancho: 0.6 }),
    final: E({ mx: 0.6, my: 0.0, sd: 8, si: 10, sonr: 0.7, ancho: 0.98 })
  };
  const GUION_CK = [
    [0.35, 0.6, "camara"], [0.95, 1.25, "conduce"], [T.kMira0, T.kMira1, "mira"], [T.kMira2, T.kMira2 + 0.25, "conduce"], [T.pone0, T.suelta, "esquiva"], [T.suelta + 0.3, T.pone1 + 0.25, "conduce"],
    [T.kBaja1 - 0.05, T.kBaja2, "sobre"], [T.kArr0, T.kArr1, "final"]
  ];
  const PARP_K = [1.8, 4.0, 7.2, 9.8, 12.6];
  const P0K = { pel: 0, torso: -0.05, cab: -0.03, cdy: 0 };
  const CuK = o => Object.assign({}, P0K, o);
  const CUER_K = {
    quieto: CuK({}),
    camara: CuK({ torso: -0.06, cab: -0.08 }),
    mira: CuK({ torso: -0.06, cab: -0.12 }),
    esquiva: CuK({ torso: -0.11, cab: -0.2, pel: -2 }),
    baja: CuK({ torso: -0.02, cab: 0.08 }),
    final: CuK({ torso: -0.06, cab: -0.06 })
  };
  const GUION_K = [
    [0.35, 0.6, "camara"], [0.95, 1.25, "quieto"], [T.kMira0, T.kMira1, "mira"], [T.kMira2, T.kMira2 + 0.25, "quieto"],
    [T.pone0 - 0.02, T.suelta + 0.04, "esquiva"], [T.suelta + 0.3, T.pone1 + 0.25, "quieto"],
    [T.kBaja0, T.kBaja1, "baja"], [T.kArr0, T.kArr1, "final"]
  ];
  const VOLANTE = { x: 604, y: 352, rx: 13, ry: 42, ang: -0.28 };
  const AGARRE_VOL = () => { const a = VOLANTE.ang - Math.PI / 2; return { x: VOLANTE.x + Math.cos(VOLANTE.ang) * 0 + Math.sin(-VOLANTE.ang) * 0 - 2, y: VOLANTE.y - VOLANTE.ry + 2 }; };
  function poseK(t) {
    const b = linea(GUION_K, CUER_K, "quieto", t);
    const respira = Math.sin(t * 1.9 + 1.4);
    const emp = empujon(t), trq = traqueteo(t + 0.03);
    const p = {
      x: XK, suelo: SUELO_K, s: SK, tirasLimpias: true,
      pelvis: { x: KI.PELVIS.x, y: KI.PELVIS.y + b.pel + respira * 1.1 + trq * 0.5 / (SK * KI.K) },
      torso: b.torso - 0.05 * emp, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab - 0.06 * emp + 0.012 * Math.sin(t * 10.7 + 0.8), dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } }
    };
    p.piernas.cerca = { tob: { x: KI.PELVIS.x + 480, y: KI.PELVIS.y + 110 }, ang: -0.7 };
    p.piernas.lejos = { tob: { x: KI.PELVIS.x + 600, y: KI.PELVIS.y + 110 }, ang: -0.7 };
    const e = linea(GUION_CK, CK, "inicio", t);
    p.cara = cara(e, parpadeo(t, PARP_K));
    const res = resolutor(KI, p);
    const oCara = Object.assign({ agarreK: 0.8 }, O_K);
    const patillaK = () => apl(gafasK(t, p), geo(AVIADOR, oCara).agarre);
    const REPOSO_C = { hoja: { x: 150, y: 640 }, mu: -1.5, dedos: D(0.3, 0.4, 0.4, 0.4), dobla: -1 };
    const PISTA_KC = [
      [0, 0, REPOSO_C],
      [T.kBaja0 - 0.25, T.kBaja0, { hoja: { x: 60, y: 420 }, mu: -1.2, dedos: D(0.5, 0.6, 0.6, 0.6), dobla: -1 }],
      [T.kBaja0, T.kBaja1, { scr: patillaK, mu: 2.2, dedos: D5(0.6, 0.55, 0.2, 0.15, 0.12), dobla: -1 }, salida],
      [T.kBaja1, T.kBaja2, { scr: patillaK, mu: 2.2, dedos: D5(0.6, 0.55, 0.2, 0.15, 0.12), dobla: -1 }],
      [T.kBaja2 + 0.1, T.kBaja2 + 0.4, { hoja: { x: 60, y: 420 }, mu: -1.2, dedos: D(0.5, 0.6, 0.6, 0.6), dobla: -1 }],
      [T.kBaja2 + 0.4, T.kBaja2 + 0.7, REPOSO_C],
      [T.kArr0 - 0.25, T.kArr0, { hoja: { x: 60, y: 420 }, mu: -1.2, dedos: D(0.5, 0.6, 0.6, 0.6), dobla: -1 }],
      [T.kArr0, T.kArr1, { scr: patillaK, mu: 2.2, dedos: D5(0.6, 0.55, 0.2, 0.15, 0.12), dobla: -1 }, salida],
      [T.kArr1 + 0.06, T.kArr1 + 0.35, { hoja: { x: 60, y: 420 }, mu: -1.2, dedos: D(0.5, 0.6, 0.6, 0.6), dobla: -1 }],
      [T.kArr1 + 0.35, T.kArr1 + 0.65, REPOSO_C]
    ];
    const vol = AGARRE_VOL();
    const PISTA_KL = [[0, 0, { scr: vol, ref: CENTRO, mu: 0.25, ang: 0, dedos: D(0.2, 0.15, 0.15, 0.15), dobla: 1 }]];
    const C = pista(PISTA_KC, t, res), L = pista(PISTA_KL, t, res);
    // tamborilea sobre el volante, tan tranquilo
    const tam = campana(t, 6.0, 9.0);
    L.dedos = DD(L.dedos, D5(0.2, 0.15 + 0.5 * Math.max(0, Math.sin(t * 14)), 0.15 + 0.5 * Math.max(0, Math.sin(t * 14 - 1)), 0.15 + 0.5 * Math.max(0, Math.sin(t * 14 - 2)), 0.15), tam);
    p.manoCerca = { x: C.x, y: C.y, ang: C.ang, mu: C.mu, dobla: C.dobla, puno: C.puno, dedos: C.dedos };
    p.manoLejos = { x: L.x, y: L.y, ang: L.ang, mu: L.mu, dobla: L.dobla, puno: L.puno, dedos: L.dedos };
    return p;
  }

  /* =====================================================================================
   * EL PAISAJE: capas dibujadas una vez que se desplazan a distinta velocidad
   * ===================================================================================== */
  const HORIZ = 300;
  let FONDO = null;
  function creaFondo() {
    const F = {};
    // cielo, sol y mar (quietos)
    const c = lienzo(W + 120, H + 80), g = c.getContext("2d"); g.translate(60, 40);
    const cie = g.createLinearGradient(0, -40, 0, HORIZ);
    cie.addColorStop(0, "#2f86d6"); cie.addColorStop(0.6, "#73bdeb"); cie.addColorStop(1, "#cdeefa");
    g.fillStyle = cie; g.fillRect(-60, -40, W + 120, HORIZ + 40);
    const sol = g.createRadialGradient(880, 70, 8, 880, 70, 380);
    sol.addColorStop(0, "rgba(255,255,236,1)"); sol.addColorStop(0.08, "rgba(255,250,210,0.9)"); sol.addColorStop(0.3, "rgba(255,240,190,0.3)"); sol.addColorStop(1, "rgba(255,240,190,0)");
    g.fillStyle = sol; g.fillRect(-60, -40, W + 120, HORIZ + 40);
    const mar = g.createLinearGradient(0, HORIZ, 0, 520);
    mar.addColorStop(0, "#1d6cad"); mar.addColorStop(0.45, "#2b8bc8"); mar.addColorStop(1, "#45addb");
    g.fillStyle = mar; g.fillRect(-60, HORIZ, W + 120, 300);
    g.fillStyle = "rgba(255,255,255,0.65)"; g.fillRect(-60, HORIZ, W + 120, 1.6);
    // estela del sol en el agua: una franja estrecha de brillos
    for (let i = 0; i < 22; i++) {
      const y = HORIZ + 4 + i * 7 + 3 * hash(i), w = 14 + i * 2.2 + 10 * hash(i + 1), x = 880 + 18 * (hash(i + 2) - 0.5);
      g.fillStyle = `rgba(255,252,225,${0.55 - i * 0.018})`; g.fillRect(x - w / 2, y, w, 2.2);
    }
    F.cielo = c;
    // nubes (muy lentas)
    F.nubes = tira(1600, 180, gg => {
      for (const [x, y, w] of [[120, 60, 120], [480, 110, 80], [760, 40, 150], [1120, 90, 100], [1400, 50, 90]]) {
        gg.fillStyle = "rgba(255,255,255,0.85)";
        gg.beginPath(); gg.ellipse(x, y, w, 16, 0, 0, TAU); gg.ellipse(x - w * 0.32, y - 12, w * 0.42, 16, 0, 0, TAU); gg.ellipse(x + w * 0.22, y - 15, w * 0.48, 18, 0, 0, TAU); gg.fill();
        gg.fillStyle = "rgba(170,205,235,0.4)"; gg.beginPath(); gg.ellipse(x + 8, y + 10, w * 0.9, 5, 0, 0, TAU); gg.fill();
      }
    });
    // cabos lejanos con un pueblo blanco y un faro
    F.cabos = tira(2200, 90, gg => {
      const y0 = 80;
      for (const [x, w, h, col] of [[200, 520, 46, "#7ea6c4"], [1150, 700, 60, "#7099b9"], [1900, 420, 34, "#86adc9"]]) {
        gg.fillStyle = col; gg.beginPath(); gg.moveTo(x - w / 2, y0); gg.bezierCurveTo(x - w * 0.3, y0 - h, x + w * 0.1, y0 - h * 1.1, x + w * 0.25, y0 - h * 0.7);
        gg.bezierCurveTo(x + w * 0.38, y0 - h * 0.5, x + w * 0.45, y0 - h * 0.2, x + w / 2, y0); gg.closePath(); gg.fill();
      }
      for (let i = 0; i < 18; i++) {
        const x = 1060 + i * 12 + 6 * hash(i + 3), y = y0 - 34 - 10 * hash(i + 9) + Math.abs(i - 9) * 2.2, w = 8 + 4 * hash(i + 1), h = 5 + 3 * hash(i + 2);
        gg.fillStyle = "#f4f7fa"; gg.fillRect(x, y, w, h); gg.fillStyle = "rgba(90,120,150,0.5)"; gg.fillRect(x + w - 2, y, 2, h);
      }
      gg.fillStyle = "#f4f7fa"; gg.fillRect(1440, y0 - 62, 7, 22); gg.fillStyle = "#d94a3a"; gg.fillRect(1440, y0 - 54, 7, 4); gg.fillRect(1440, y0 - 46, 7, 4);
    });
    // palmeras y farolas del paseo (entre la carretera y el mar)
    F.palmas = tira(1800, 380, gg => {
      const yb = 372;
      for (const [x, h, inc] of [[160, 350, 0.1], [620, 330, -0.07], [1050, 368, 0.05], [1500, 340, -0.1]]) palmera(gg, x, yb, h, inc);
      for (const x of [380, 840, 1280, 1680]) farola(gg, x, yb);
    });
    // quitamiedos (rápido, con rastro)
    F.valla = tira(960, 90, gg => {
      gg.fillStyle = "rgba(60,70,80,0.3)"; gg.fillRect(0, 70, 960, 6);
      for (let i = 0; i < 6; i++) {
        const x = i * 160 + 20;
        for (let k = 0; k < 5; k++) { gg.fillStyle = `rgba(90,96,104,${0.18 + 0.12 * (k === 2)})`; gg.fillRect(x - 10 + k * 4, 26, 8, 50); }
      }
      const gr = gg.createLinearGradient(0, 18, 0, 46); gr.addColorStop(0, "#e9eef2"); gr.addColorStop(0.5, "#aeb8c1"); gr.addColorStop(1, "#77828c");
      gg.fillStyle = gr; gg.fillRect(0, 18, 960, 26);
      gg.fillStyle = "rgba(255,255,255,0.7)"; gg.fillRect(0, 22, 960, 3);
      gg.fillStyle = "rgba(40,50,60,0.5)"; gg.fillRect(0, 42, 960, 2);
    });
    // carretera (la más rápida)
    F.carretera = tira(640, 120, gg => {
      const gr = gg.createLinearGradient(0, 0, 0, 120); gr.addColorStop(0, "#6a6c73"); gr.addColorStop(1, "#55575e");
      gg.fillStyle = gr; gg.fillRect(0, 0, 640, 120);
      for (let i = 0; i < 120; i++) { gg.fillStyle = `rgba(${hash(i) > 0.5 ? "255,255,255" : "20,20,24"},${0.06 + 0.06 * hash(i + 7)})`; gg.fillRect(hash(i + 3) * 640, hash(i + 5) * 120, 20 + 30 * hash(i + 9), 2); }
      gg.fillStyle = "#f2efe6"; gg.fillRect(0, 6, 640, 4);
      for (let k = 0; k < 4; k++) { gg.fillStyle = `rgba(245,240,226,${k === 0 ? 0.95 : 0.22})`; gg.fillRect(40 + k * 18, 96, 200, 6); gg.fillRect(360 + k * 18, 96, 200, 6); }
    });
    return F;
  }
  function tira(w, h, dib) { const c = lienzo(w, h); dib(c.getContext("2d")); return c; }
  // capa del coche: se dibuja una vez a pantalla completa y se recorta a lo que tiene pintado (una sola lectura, al crearla)
  function capaRecortada(dib) {
    const c = lienzo(W + 80, H + 80), g = c.getContext("2d", { willReadFrequently: true }); g.translate(40, 40); dib(g);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return { img: lienzo(1, 1), x: 0, y: 0 };
    const r = lienzo(x1 - x0 + 1, y1 - y0 + 1); r.getContext("2d").drawImage(c, -x0, -y0);
    return { img: r, x: x0 - 40, y: y0 - 40 };
  }
  const pon = (g, L) => g.drawImage(L.img, L.x, L.y);
  function palmera(g, x, yb, h, inc) {
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    const top = { x: x + inc * h, y: yb - h };
    g.strokeStyle = "#7a5a3a"; g.lineWidth = 12;
    g.beginPath(); g.moveTo(x, yb); g.quadraticCurveTo(x + inc * h * 0.2, yb - h * 0.5, top.x, top.y); g.stroke();
    g.strokeStyle = "rgba(60,40,25,0.5)"; g.lineWidth = 2;
    for (let i = 1; i < 14; i++) { const u = i / 14, px = lerp(x, top.x, u * u * 0.6 + u * 0.4), py = lerp(yb, top.y, u); g.beginPath(); g.moveTo(px - 6, py); g.lineTo(px + 6, py - 3); g.stroke(); }
    for (let i = 0; i < 8; i++) {
      const a = -Math.PI / 2 + (i - 3.5) * 0.42, L = 70 + 20 * hash(i + x);
      const f = { x: top.x + Math.cos(a) * L, y: top.y + Math.sin(a) * L * 0.6 + 30 };
      g.strokeStyle = i % 2 ? "#2f7d3a" : "#3c9444"; g.lineWidth = 9;
      g.beginPath(); g.moveTo(top.x, top.y); g.quadraticCurveTo((top.x + f.x) / 2, top.y - 22, f.x, f.y); g.stroke();
    }
    g.fillStyle = "#6b4a2a"; for (const [dx, dy] of [[-5, 6], [5, 7], [0, 12]]) { g.beginPath(); g.arc(top.x + dx, top.y + dy, 5, 0, TAU); g.fill(); }
    g.restore();
  }
  function farola(g, x, yb) {
    g.save(); g.lineCap = "round";
    g.strokeStyle = "#3d4a52"; g.lineWidth = 6; g.beginPath(); g.moveTo(x, yb); g.lineTo(x, yb - 190); g.quadraticCurveTo(x, yb - 210, x + 24, yb - 212); g.stroke();
    g.fillStyle = "#3d4a52"; g.beginPath(); g.moveTo(x + 14, yb - 212); g.lineTo(x + 40, yb - 212); g.lineTo(x + 34, yb - 202); g.lineTo(x + 20, yb - 202); g.closePath(); g.fill();
    g.fillStyle = "#fff6cf"; g.fillRect(x + 21, yb - 203, 12, 3);
    g.restore();
  }
  // dibuja una tira repetida desplazada (x0 = desplazamiento en px de la tira)
  function capa(g, img, x0, y) {
    const w = img.width; let x = -((x0 % w) + w) % w;
    for (; x < W + 80; x += w) g.drawImage(img, Math.round(x * 4) / 4 - 40, y);
  }
  function brillosMar(g, t, ax) {
    g.save(); g.fillStyle = "#ffffff";
    for (let i = 0; i < 30; i++) {
      const y = HORIZ + 6 + 150 * Math.pow(hash(i + 61), 1.4), par = 0.08 + 0.25 * (y - HORIZ) / 150;
      const x = ((hash(i + 60) * 1400 - ax * par) % 1400 + 1400) % 1400 - 180;
      const a = Math.pow(Math.max(0, Math.sin(t * (2.2 + 2 * hash(i + 62)) + i * 1.7)), 6);
      if (a < 0.05) continue;
      g.globalAlpha = a; const r = 2 + 3 * hash(i + 63);
      g.beginPath(); g.moveTo(x - r * 2.2, y); g.lineTo(x, y - r * 0.5); g.lineTo(x + r * 2.2, y); g.lineTo(x, y + r * 0.5); g.closePath(); g.fill();
    }
    g.restore();
  }

  /* =====================================================================================
   * EL COCHE (coordenadas de pantalla con el coche quieto; el traqueteo va aparte)
   * ===================================================================================== */
  const ROJO = { base: "#c9262e", luz: "#ef5a52", sombra: "#8d1520", tinta: "#1a0a0c", cromo: ["#ffffff", "#c9d2da", "#7e8a96"], piel: "#c58a52", pielS: "#9a6236", pielL: "#e2b07a" };
  const CINTURA = 420, ELEVA = -14;                 // borde de arriba de la puerta
  const RUEDA_D = { x: 800, y: 548, r: 50 }, RUEDA_T = { x: 46, y: 548, r: 50 };
  let COCHE = null;
  function creaCoche() {
    const C = {};
    // asientos y borde lejano del habitáculo (detrás de los dos)
    C.detras = capaRecortada(g => {
      g.lineJoin = "round"; g.lineCap = "round";
      // borde lejano del habitáculo (piel acolchada)
      g.fillStyle = ROJO.pielS; g.beginPath(); g.moveTo(90, 404); g.quadraticCurveTo(300, 388, 560, 392); g.lineTo(560, 410); g.lineTo(90, 424); g.closePath(); g.fill();
      g.strokeStyle = ROJO.tinta; g.lineWidth = 2.5; g.stroke();
      // respaldo lejano (el de Kiriku)
      respaldo(g, 352, 432, 300, 0.92);
    });
    C.respaldoCerca = capaRecortada(g => { g.lineJoin = "round"; respaldo(g, 188, 470, 300, 1); });
    // carrocería del lado de cámara
    C.delante = capaRecortada(g => {
      g.lineJoin = "round"; g.lineCap = "round";
      const cuerpo = () => {
        g.beginPath(); g.moveTo(-40, CINTURA); g.lineTo(700, CINTURA);
        // capó: largo, casi recto, hasta el morro
        g.bezierCurveTo(790, 412, 880, 414, 930, 434); g.bezierCurveTo(968, 450, 982, 480, 976, 508);
        g.lineTo(968, 532); g.lineTo(-40, 540); g.closePath();
      };
      cuerpo(); const gr = g.createLinearGradient(0, CINTURA, 0, 540);
      gr.addColorStop(0, ROJO.luz); gr.addColorStop(0.18, ROJO.base); gr.addColorStop(0.75, ROJO.base); gr.addColorStop(1, ROJO.sombra);
      g.fillStyle = gr; g.fill();
      g.save(); cuerpo(); g.clip();
      // reflejo del cielo a lo largo de la carrocería
      g.fillStyle = "rgba(255,255,255,0.28)"; g.beginPath(); g.moveTo(-40, 428); g.lineTo(940, 432); g.lineTo(940, 440); g.lineTo(-40, 438); g.closePath(); g.fill();
      g.fillStyle = "rgba(120,10,20,0.35)"; g.fillRect(-40, 500, 1020, 40);
      // aleta delantera abombada
      g.fillStyle = "rgba(255,120,110,0.25)"; g.beginPath(); g.ellipse(800, 470, 150, 34, 0, Math.PI, TAU); g.fill();
      g.restore();
      cuerpo(); g.lineWidth = 5; g.strokeStyle = ROJO.tinta; g.stroke();
      // borde acolchado de la puerta (piel)
      g.fillStyle = ROJO.piel; g.beginPath(); g.moveTo(-40, CINTURA - 8); g.lineTo(690, CINTURA - 8); g.quadraticCurveTo(704, CINTURA - 4, 700, CINTURA + 6); g.lineTo(-40, CINTURA + 6); g.closePath(); g.fill();
      g.lineWidth = 3; g.strokeStyle = ROJO.tinta; g.stroke();
      g.strokeStyle = ROJO.pielL; g.lineWidth = 2; g.beginPath(); g.moveTo(-40, CINTURA - 5); g.lineTo(688, CINTURA - 5); g.stroke();
      // moldura cromada
      cromo(g, -40, 462, 950, 462, 6);
      // puerta: juntas y maneta
      g.strokeStyle = "rgba(40,6,10,0.7)"; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(130, CINTURA + 8); g.quadraticCurveTo(122, 480, 130, 532); g.stroke();
      g.beginPath(); g.moveTo(560, CINTURA + 8); g.quadraticCurveTo(570, 480, 562, 532); g.stroke();
      g.fillStyle = ROJO.cromo[1]; g.strokeStyle = ROJO.tinta; g.lineWidth = 2;
      g.beginPath(); g.ellipse(520, 446, 20, 5, 0, 0, TAU); g.fill(); g.stroke();
      g.fillStyle = "#ffffff"; g.fillRect(506, 443, 18, 2);
      // pasos de rueda
      for (const R of [RUEDA_D, RUEDA_T]) {
        g.fillStyle = "#1a0d10"; g.beginPath(); g.arc(R.x, R.y, R.r + 12, Math.PI, TAU); g.lineTo(R.x + R.r + 12, 545); g.lineTo(R.x - R.r - 12, 545); g.closePath(); g.fill();
        g.strokeStyle = ROJO.tinta; g.lineWidth = 4; g.beginPath(); g.arc(R.x, R.y, R.r + 12, Math.PI, TAU); g.stroke();
      }
      // morro: rejilla, faro y parachoques
      g.fillStyle = "#e9edf0"; g.beginPath(); g.ellipse(950, 446, 15, 20, -0.2, 0, TAU); g.fill(); g.lineWidth = 3; g.strokeStyle = ROJO.tinta; g.stroke();
      g.fillStyle = "#fffbe6"; g.beginPath(); g.ellipse(953, 444, 9, 13, -0.2, 0, TAU); g.fill();
      g.fillStyle = "rgba(255,255,255,0.9)"; g.beginPath(); g.ellipse(950, 438, 3, 5, -0.2, 0, TAU); g.fill();
      cromo(g, 900, 520, 984, 516, 9);
      // retrovisor en la puerta
      g.strokeStyle = ROJO.tinta; g.lineWidth = 7; g.beginPath(); g.moveTo(642, CINTURA - 6); g.lineTo(650, 392); g.stroke();
      g.strokeStyle = ROJO.cromo[1]; g.lineWidth = 4; g.stroke();
      g.fillStyle = ROJO.cromo[1]; g.beginPath(); g.ellipse(654, 384, 14, 11, 0.2, 0, TAU); g.fill(); g.lineWidth = 3; g.strokeStyle = ROJO.tinta; g.stroke();
      g.fillStyle = "#8fc6e6"; g.beginPath(); g.ellipse(654, 384, 9, 7, 0.2, 0, TAU); g.fill();
      // sombra de la carrocería en el suelo
      g.fillStyle = "rgba(10,10,14,0.35)"; g.beginPath(); g.ellipse(470, 592, 520, 10, 0, 0, TAU); g.fill();
    });
    // parabrisas (delante de todo)
    C.parabrisas = capaRecortada(g => {
      g.lineJoin = "round"; g.lineCap = "round";
      const vid = () => { g.beginPath(); g.moveTo(688, CINTURA - 4); g.lineTo(650, 286); g.quadraticCurveTo(662, 276, 676, 282); g.lineTo(726, CINTURA - 4); g.closePath(); };
      vid(); g.fillStyle = "rgba(200,235,250,0.22)"; g.fill();
      g.save(); vid(); g.clip();
      g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.moveTo(640, 330); g.lineTo(700, 300); g.lineTo(720, 320); g.lineTo(660, 350); g.closePath(); g.fill();
      g.fillStyle = "rgba(255,255,255,0.18)"; g.beginPath(); g.moveTo(650, 372); g.lineTo(720, 340); g.lineTo(728, 352); g.lineTo(658, 384); g.closePath(); g.fill();
      g.restore();
      // marco cromado
      g.strokeStyle = ROJO.tinta; g.lineWidth = 10; vid(); g.stroke();
      g.strokeStyle = ROJO.cromo[1]; g.lineWidth = 5; vid(); g.stroke();
      g.strokeStyle = "#ffffff"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(686, CINTURA - 8); g.lineTo(650, 290); g.stroke();
    });
    return C;
  }
  function cromo(g, x0, y0, x1, y1, w) {
    g.save(); g.lineCap = "round";
    g.strokeStyle = ROJO.tinta; g.lineWidth = w + 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    g.strokeStyle = ROJO.cromo[2]; g.lineWidth = w; g.stroke();
    g.strokeStyle = ROJO.cromo[1]; g.lineWidth = w * 0.6; g.beginPath(); g.moveTo(x0, y0 - w * 0.15); g.lineTo(x1, y1 - w * 0.15); g.stroke();
    g.strokeStyle = ROJO.cromo[0]; g.lineWidth = w * 0.22; g.beginPath(); g.moveTo(x0, y0 - w * 0.25); g.lineTo(x1, y1 - w * 0.25); g.stroke();
    g.restore();
  }
  // respaldo de piel con pliegues (base, alto)
  function respaldo(g, x, yb, top, k) {
    g.save(); g.translate(x, yb); g.scale(k, k);
    const forma = () => { g.beginPath(); g.moveTo(-34, 0); g.bezierCurveTo(-44, -60, -46, -120, -36, -(yb - top) / k + 26); g.quadraticCurveTo(-30, -(yb - top) / k, -6, -(yb - top) / k);
      g.quadraticCurveTo(20, -(yb - top) / k, 26, -(yb - top) / k + 30); g.bezierCurveTo(30, -110, 28, -50, 30, 0); g.closePath(); };
    forma(); const gr = g.createLinearGradient(-40, 0, 30, 0); gr.addColorStop(0, ROJO.pielS); gr.addColorStop(0.5, ROJO.piel); gr.addColorStop(1, ROJO.pielL);
    g.fillStyle = gr; g.fill(); g.lineWidth = 4; g.strokeStyle = ROJO.tinta; g.stroke();
    g.save(); forma(); g.clip(); g.strokeStyle = "rgba(90,50,20,0.55)"; g.lineWidth = 2.5;
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(-4 + i * 12, -(yb - top) / k + 20); g.quadraticCurveTo(-6 + i * 12, -60, -2 + i * 12, 0); g.stroke(); }
    g.restore();
    g.restore();
  }
  function rueda(g, R, giro, v) {
    g.save(); g.translate(R.x, R.y);
    g.fillStyle = "#16161a"; g.beginPath(); g.arc(0, 0, R.r, 0, TAU); g.fill();
    g.strokeStyle = "#2c2c33"; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, R.r - 6, 0, TAU); g.stroke();
    // llanta de radios: a toda velocidad se ve como un disco borroso
    g.fillStyle = "#c9d2da"; g.beginPath(); g.arc(0, 0, R.r * 0.62, 0, TAU); g.fill();
    const bor = clamp((v - 300) / 700);
    g.save(); g.rotate(giro); g.strokeStyle = `rgba(90,100,112,${1 - 0.7 * bor})`; g.lineWidth = 2.2;
    for (let i = 0; i < 16; i++) { const a = i * TAU / 16; g.beginPath(); g.moveTo(Math.cos(a) * 7, Math.sin(a) * 7); g.lineTo(Math.cos(a + 0.4) * R.r * 0.6, Math.sin(a + 0.4) * R.r * 0.6); g.stroke(); }
    g.restore();
    if (bor > 0.01) { g.fillStyle = `rgba(170,180,190,${0.55 * bor})`; g.beginPath(); g.arc(0, 0, R.r * 0.6, 0, TAU); g.fill();
      g.strokeStyle = `rgba(255,255,255,${0.5 * bor})`; g.lineWidth = 2; for (const r of [0.3, 0.48]) { g.beginPath(); g.arc(0, 0, R.r * r, giro, giro + 2.2); g.stroke(); } }
    g.fillStyle = "#e9eef2"; g.beginPath(); g.arc(0, 0, 8, 0, TAU); g.fill(); g.strokeStyle = "#16161a"; g.lineWidth = 2; g.stroke();
    g.restore();
  }
  // salpicadero (delante de Kiriku, detrás de Guillermo): relojes, volante y guantera
  function salpicadero(g, t, abre) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const forma = () => { g.beginPath(); g.moveTo(392, CINTURA - 4); g.quadraticCurveTo(398, 392, 440, 386); g.lineTo(690, 376); g.lineTo(700, CINTURA - 4); g.closePath(); };
    forma(); const gr = g.createLinearGradient(0, 376, 0, CINTURA); gr.addColorStop(0, "#7a4a28"); gr.addColorStop(1, "#4e2c16");
    g.fillStyle = gr; g.fill(); g.lineWidth = 3.5; g.strokeStyle = ROJO.tinta; g.stroke();
    // vetas de la madera
    g.save(); forma(); g.clip(); g.strokeStyle = "rgba(255,210,160,0.18)"; g.lineWidth = 2;
    for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(400, 392 + i * 6); g.bezierCurveTo(500, 386 + i * 6, 560, 396 + i * 6, 700, 382 + i * 6); g.stroke(); }
    g.restore();
    // relojes (sin números)
    for (const [x, y, r, a] of [[548, 398, 11, 0.9], [574, 396, 9, 2.2]]) {
      g.fillStyle = "#f4efe2"; g.beginPath(); g.ellipse(x, y, r * 0.7, r, 0, 0, TAU); g.fill(); g.lineWidth = 2.5; g.strokeStyle = "#c9a24a"; g.stroke();
      g.strokeStyle = TINTA; g.lineWidth = 1.2; for (let i = 0; i < 6; i++) { const b = i * TAU / 6; g.beginPath(); g.moveTo(x + Math.cos(b) * r * 0.5, y + Math.sin(b) * r * 0.72); g.lineTo(x + Math.cos(b) * r * 0.6, y + Math.sin(b) * r * 0.86); g.stroke(); }
      const ag = a + 0.08 * Math.sin(t * 9) + (x < 560 ? 1.2 * tramo(t, T.acel0, T.acel1) : 0);
      g.strokeStyle = "#d4202a"; g.lineWidth = 1.8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ag) * r * 0.5, y + Math.sin(ag) * r * 0.75); g.stroke();
    }
    // guantera: la tapa cae hacia abajo y deja ver el hueco
    const G0 = { x: 404, y: 392, w: 68, h: 22 };
    g.fillStyle = "#1a0e08"; g.beginPath(); g.rect(G0.x, G0.y, G0.w, G0.h); g.fill();
    if (abre > 0.02) {
      // dentro: el casco arrugado
      g.save(); g.beginPath(); g.rect(G0.x, G0.y, G0.w, G0.h); g.clip();
      g.fillStyle = "rgba(255,200,140,0.12)"; g.fillRect(G0.x, G0.y, G0.w, 4);
      g.restore();
    }
    const h = G0.h * Math.cos(abre * Math.PI * 0.55);
    if (h > 0.5) {
      g.fillStyle = "#6a3e20"; g.beginPath(); g.rect(G0.x, G0.y + G0.h - h, G0.w, h); g.fill(); g.lineWidth = 2.5; g.strokeStyle = ROJO.tinta; g.stroke();
      g.fillStyle = "#d9c08a"; g.beginPath(); g.ellipse(G0.x + G0.w * 0.82, G0.y + G0.h - h * 0.55, 4, 3 * h / G0.h + 0.5, 0, 0, TAU); g.fill(); g.lineWidth = 1.5; g.stroke();
    }
    g.lineWidth = 2.5; g.strokeStyle = ROJO.tinta; g.strokeRect(G0.x, G0.y, G0.w, G0.h);
    g.restore();
  }
  function volante(g) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const V = VOLANTE;
    // columna
    g.strokeStyle = ROJO.tinta; g.lineWidth = 11; g.beginPath(); g.moveTo(V.x, V.y); g.lineTo(V.x + 46, V.y + 40); g.stroke();
    g.strokeStyle = "#3a3a40"; g.lineWidth = 6; g.stroke();
    g.translate(V.x, V.y); g.rotate(V.ang);
    // radios
    g.strokeStyle = "#c9d2da"; g.lineWidth = 4;
    for (const a of [-1.2, 0.3, 1.8]) { g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * V.rx * 0.9, Math.sin(a) * V.ry * 0.9); g.stroke(); }
    g.fillStyle = "#2a2a30"; g.beginPath(); g.ellipse(0, 0, 5, 9, 0, 0, TAU); g.fill();
    // aro de madera
    g.lineWidth = 11; g.strokeStyle = ROJO.tinta; g.beginPath(); g.ellipse(0, 0, V.rx, V.ry, 0, 0, TAU); g.stroke();
    g.lineWidth = 7; g.strokeStyle = "#7a4a28"; g.stroke();
    g.lineWidth = 2; g.strokeStyle = "rgba(255,220,170,0.6)"; g.beginPath(); g.ellipse(-1, -2, V.rx, V.ry, 0, Math.PI * 1.1, Math.PI * 1.6); g.stroke();
    g.restore();
  }

  /* =====================================================================================
   * EFECTOS: rayas de viento, golpes, el bicho volando
   * ===================================================================================== */
  function rayasViento(g, t, k, y0, y1, x0, x1) {
    if (k <= 0.01) return;
    g.save(); g.lineCap = "round"; g.strokeStyle = "#ffffff";
    for (let i = 0; i < 9; i++) {
      const ph = ((t * (1.6 + hash(i + 40)) + hash(i + 41)) % 1), y = lerp(y0, y1, hash(i + 42));
      const x = lerp(x1, x0, ph), L = 60 + 80 * hash(i + 43);
      g.globalAlpha = k * 0.55 * Math.sin(Math.PI * ph); g.lineWidth = 2 + 2 * hash(i + 44);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + L, y + 2 * Math.sin(t * 9 + i)); g.stroke();
    }
    g.restore();
  }
  function estrella4(g, x, y, r, a, rot = 0) {
    if (a <= 0.01) return;
    g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = a;
    const hal = g.createRadialGradient(0, 0, 0, 0, 0, r * 1.3); hal.addColorStop(0, "rgba(255,255,230,0.9)"); hal.addColorStop(1, "rgba(255,255,230,0)");
    g.fillStyle = hal; g.beginPath(); g.arc(0, 0, r * 1.3, 0, TAU); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath();
    for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.16 : r, an = i * Math.PI / 4; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
    g.closePath(); g.fill();
    g.restore();
  }
  function rayitas(g, x, y, k, ang, n = 3, col = "#ffffff") {
    if (k <= 0.01) return;
    g.save(); g.globalAlpha = k; g.strokeStyle = col; g.lineWidth = 2.6; g.lineCap = "round";
    for (let i = 0; i < n; i++) { const a = ang + (i - (n - 1) / 2) * 0.42, r0 = 14, r1 = 14 + 12 * k;
      g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // el bicho que viene de frente: de la derecha de la pantalla a la boca (o a las gafas)
  function bichoVuela(g, t, t0, t1, destino, esc) {
    const u = fase(t, t0, t1); if (u <= 0 || u >= 1) return;
    const a = { x: 1100, y: destino.y - 70 };
    const x = lerp(a.x, destino.x, u), y = lerp(a.y, destino.y, u) + 14 * Math.sin(u * 9) * (1 - u);
    g.save(); g.translate(x, y); g.scale(esc * lerp(0.7, 1.15, u), esc * lerp(0.7, 1.15, u)); g.scale(-1, 1);
    dibBicho(g, t, false);
    g.restore();
    // rayitas de velocidad detrás del bicho
    g.save(); g.globalAlpha = 0.5; g.strokeStyle = "#ffffff"; g.lineWidth = 1.5; g.lineCap = "round";
    for (const dy of [-4, 3]) { g.beginPath(); g.moveTo(x + 10, y + dy); g.lineTo(x + 34, y + dy); g.stroke(); }
    g.restore();
  }

  /* =====================================================================================
   * CAPAS DE LA CABEZA Y EL TRONCO DE GUILLERMO
   * ===================================================================================== */
  const VERDE = "#6fae2e", VERDE_MUL = "rgb(196,228,150)";
  function enverdece(g, k, relleno) {
    g.globalAlpha = k; g.globalCompositeOperation = "color"; g.fillStyle = VERDE; relleno();
    g.globalAlpha = k * 0.9; g.globalCompositeOperation = "multiply"; g.fillStyle = VERDE_MUL; relleno();
    g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
  }
  const OJO_D = G.A.datos.piezas.cabeza.ojos.derecho, OJO_I = G.A.datos.piezas.cabeza.ojos.izquierdo;
  function capaG(g, t, p, enCapa) {
    const H = G.cabeza(p), atras = Math.PI - H.ang + 0.02;
    const w = vientoPelo(t), kc = capaPelo(t), casco = p._casco;
    const conCasco = casco && casco.capa === "cabeza";
    // verde de asco
    const vd = verdeAsco(t);
    if (vd > 0.004) {
      g.save(); g.beginPath(); camino(g, PIEL_CAB); g.clip();
      g.beginPath(); g.rect(380, 100, 900, 900); camino(g, OJO_D); camino(g, OJO_I);
      enverdece(g, vd, () => g.fill("evenodd")); g.restore();
    }
    carrillos(g, carrillosK(t), t);
    lenguaFuera(g, tramo(t, T.bleh0, T.bleh0 + 0.12) * (1 - tramo(t, T.bleh1 - 0.05, T.idea + 0.05)), t);
    lagrimas(g, llanto(t), t, atras);
    // pelo al viento (solo en el lienzo aparte)
    if (enCapa && kc > 0.002) {
      const aplasta = conCasco ? 1 : 0;
      PELO.borra(g, kc);
      g.save(); g.globalAlpha = kc;
      PELO.base(g);
      const ondea = 0.5 + 0.5 * tramo(t, T.viento1 - 0.6, T.viento1);
      PELO.puas(g, w, atras, t, ondea, aplasta, conCasco ? (i => i <= 3) : null);
      g.restore();
    }
    // el bicho en los dientes
    if (t >= T.bicho && t < T.pinza1) {
      g.save(); g.translate(BOCA_C.x, BOCA_C.y); g.rotate(BOCA_ANG); g.translate(-6, -2); g.scale(5.2, 5.2);
      dibBicho(g, t, true); g.restore();
    }
    // el casco puesto (debajo de los brazos)
    if (conCasco) dibujaCasco(g, casco, t);
  }
  function dibujaCasco(g, casco, t) {
    if (!MATRIZ || !casco) return;
    g.save(); g.setTransform(MATRIZ); g.transform(casco.A.a, casco.A.b, casco.A.c, casco.A.d, casco.A.e, casco.A.f);
    const ondea = casco.capa === "cabeza" ? 0.7 : 0.25;
    dibCasco(g, { gafas: bajaGafas(t), ondea: ondea * (1 - 0.6 * tramo(t, T.oreja0, T.oreja2)), abrocha: tramo(t, T.oreja0 + 0.1, T.oreja2), salpica: tramo(t, T.bicho2, T.bicho2 + 0.06, salida), inflado: casco.inflado }, t);
    g.restore();
  }

  /* ---------- Guillermo en su lienzo aparte ---------- */
  let CAPA = null;
  function dibujaG(g, pg, t) {
    const casco = pg._casco;
    // el casco en la mano va como objeto de la mano (debajo de los dedos); al salir de la guantera, recortado por el hueco
    if (casco && casco.capa === "mano") pg.manoLejos.objeto = gg => {
      gg.save();
      if (t < T.saca0 + 0.25) { gg.setTransform(MATRIZ); gg.beginPath(); gg.rect(300, 0, 500, 414); gg.clip(); }
      dibujaCasco(gg, casco, t); gg.restore();
    };
    const usaCapa = capaPelo(t) > 0.002;
    pg.capaCabeza = gg => capaG(gg, t, pg, usaCapa);
    if (!usaCapa) { G.dibujar(g, pg, t); return; }
    const c = g.canvas;
    if (!CAPA || CAPA.width !== c.width || CAPA.height !== c.height) CAPA = lienzo(c.width, c.height);
    const o = CAPA.getContext("2d"), M = g.getTransform();
    const caja = [{ x: pg.x - 230, y: 0 }, { x: pg.x + 240, y: 0 }, { x: pg.x + 240, y: 480 }, { x: pg.x - 230, y: 480 }].map(q => M.transformPoint(new DOMPoint(q.x, q.y)));
    const x0 = Math.max(0, Math.floor(Math.min(...caja.map(q => q.x))) - 2), y0 = Math.max(0, Math.floor(Math.min(...caja.map(q => q.y))) - 2);
    const x1 = Math.min(c.width, Math.ceil(Math.max(...caja.map(q => q.x))) + 2), y1 = Math.min(c.height, Math.ceil(Math.max(...caja.map(q => q.y))) + 2);
    if (x1 <= x0 || y1 <= y0) return;
    o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1; o.globalCompositeOperation = "source-over";
    o.clearRect(x0, y0, x1 - x0, y1 - y0);
    o.setTransform(M);
    G.dibujar(o, pg, t);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(CAPA, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0); g.restore();
    if (casco && casco.capa === "aire") dibujaCasco(g, casco, t);
  }

  /* ---------- cámara ---------- */
  const PLANOS = [
    [0, 1.0, 512, 300], [2.6, 1.0, 512, 300], [3.3, 1.13, 400, 262], [5.3, 1.13, 400, 262], [5.8, 1.1, 430, 272],
    [7.9, 1.1, 430, 272], [8.4, 1.0, 512, 300], [10.6, 1.0, 512, 300], [11.2, 1.07, 470, 280], [13.3, 1.07, 470, 280], [DUR, 1.04, 490, 290]
  ];
  function camara(t) {
    let i = 0; while (i < PLANOS.length - 2 && t > PLANOS[i + 1][0]) i++;
    const a = PLANOS[i], b = PLANOS[i + 1], k = suave(fase(t, a[0], b[0]));
    return { k: lerp(a[1], b[1], k), x: lerp(a[2], b[2], k), y: lerp(a[3], b[3], k) };
  }

  const pose = t => ({ g: poseG(t), k: poseK(t) });
  class GuillermoKirikuDescapotable extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !KI.listo()) return;
      if (!FONDO) { FONDO = creaFondo(); COCHE = creaCoche(); }
      const luz = tramo(t, NEGRO_INICIO, 0.75, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t), ax = avance(t), v = velocidad(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      // paisaje
      g.drawImage(FONDO.cielo, -60, -40);
      capa(g, FONDO.nubes, ax * 0.03, 10);
      capa(g, FONDO.cabos, ax * 0.06, HORIZ - 80);
      brillosMar(g, t, ax);
      capa(g, FONDO.palmas, ax * 0.42, 100);
      capa(g, FONDO.valla, ax * 0.88, 452);
      capa(g, FONDO.carretera, ax, 500);
      // rayas de viento (por detrás del coche)
      rayasViento(g, t, 0.4 + 0.6 * tramo(t, T.acel0, T.acel1), 70, 360, -100, 1100);
      // el coche y los dos (con el traqueteo)
      const trq = traqueteo(t);
      g.save(); g.translate(0, trq + ELEVA);
      MATRIZ = g.getTransform();
      const pG = poseG(t), pK = poseK(t);
      pon(g, COCHE.detras);
      volante(g);
      pK.capaCabeza = gg => { mechon(gg, t); dibujaGafasK(gg, gafasK(t, pK), t); };
      pK.capaTronco = gg => tapaCuello(gg);
      KI.dibujar(g, pK, t);
      salpicadero(g, t, tramo(t, T.boton, T.abre1, salida));
      pon(g, COCHE.respaldoCerca);
      dibujaG(g, pG, t);
      // el bicho pescado entre los dedos y, al soltarlo, se lo lleva el viento
      if (t >= T.pinza1 && t < T.tira0 + 0.02) { const q = ptMano(G, pG, pG.manoLejos, PINZA); g.save(); g.translate(q.x, q.y); g.rotate(0.6); g.scale(1.25, 1.25); dibBicho(g, t, true); g.restore(); }
      if (t >= T.tira0 + 0.02 && t < T.tira0 + 0.7) {
        const q0 = retrato(G, poseG(T.tira0), MIRA_BICHO), u = fase(t, T.tira0 + 0.02, T.tira0 + 0.7);
        const x = q0.x - 900 * u * u - 120 * u, y = q0.y - 180 * u + 60 * u * u;
        g.save(); g.translate(x, y); g.rotate(u * 14); g.scale(1.25, 1.25); dibBicho(g, t, true); g.restore();
      }
      pon(g, COCHE.delante);
      const giro = ax / RUEDA_D.r;
      rueda(g, RUEDA_D, giro, v); rueda(g, RUEDA_T, giro, v);
      pon(g, COCHE.parabrisas);
      g.restore();
      // el bicho: a la boca y, al final, a las gafas del casco
      const boca = retrato(G, pG, { x: 806, y: 744 }), gafa = retrato(G, pG, { x: 780, y: 560 });
      const dy = trq + ELEVA;
      bichoVuela(g, t, T.bicho0, T.bicho, { x: boca.x, y: boca.y + dy }, 1.2);
      bichoVuela(g, t, T.bicho2a, T.bicho2, { x: gafa.x, y: gafa.y + dy }, 1.1);
      rayitas(g, boca.x + 10, boca.y + dy - 6, campana(t, T.bicho, T.bicho + 0.3), -0.5, 3);
      rayitas(g, gafa.x + 10, gafa.y + dy - 6, campana(t, T.bicho2, T.bicho2 + 0.3), -0.5, 3);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00089", nombre: "Guillermo y Kiriku · El descapotable", crear: () => new GuillermoKirikuDescapotable() });
  // diagnóstico: distancia hombro → objetivo de cada mano (y el máximo que da el brazo)
  function diag(t) {
    const pG = poseG(t), pK = poseK(t), o = {};
    const dist = (Rg, p, lado) => { const m = lado === "cerca" ? p.manoCerca : p.manoLejos, h = Rg.tronco(p)(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO);
      const mu = m.mu ?? -1.75, w = rota({ x: Math.cos(mu) * 13 * 2.6, y: Math.sin(mu) * 13 * 2.6 }, m.ang || 0);
      return Math.round(Math.hypot(m.x + w.x - h.x, m.y + w.y - h.y)); };
    o.gC = dist(G, pG, "cerca"); o.gL = dist(G, pG, "lejos"); o.kC = dist(KI, pK, "cerca"); o.kL = dist(KI, pK, "lejos");
    o.max = { gC: Math.round(G.BRAZO_C_L * 1.08), gL: Math.round(G.BRAZO_L * 1.08), kC: Math.round(KI.BRAZO_C_L * 1.08), kL: Math.round(KI.BRAZO_L * 1.08) };
    return o;
  }
  window.__A2D_00089 = { pose, poseG, poseK, T, DUR, diag, PELO };
})();
