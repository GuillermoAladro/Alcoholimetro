"use strict";
/* 00081 · Guillermo y Kiriku · Las gafas de sol
 *
 * Negro → terraza al sol de mediodía, junto al mar: cielo azul con un sol que deslumbra (y sus
 * reflejos de lente), el mar con destellos, una isla con su pueblo blanco y un velero, la
 * balaustrada blanca, buganvilla, un limonero en su maceta, un parasol de rayas con una mesita y dos
 * limonadas, y suelo de barro. Guillermo (izquierda) y Kiriku (derecha) entornan los ojos al sol.
 * Kiriku coge las gafas de sol que lleva colgadas del cuello del polo, las abre de un golpe de muñeca,
 * se las pone, echa la cabeza atrás (¡ting!: destello en el cristal que deslumbra a Guillermo), se
 * pasa la mano por el pelo y mira a cámara, chulísimo → Guillermo, decidido, saca sus gafas de
 * plástico naranja del bolsillo, las abre, se las pone y mira a cámara muy chulo… echa la cabeza
 * atrás como Kiriku y las gafas salen volando dando vueltas: las bate con una mano, con la otra, y las
 * caza al vuelo… del revés. Se las pone así (la barra gruesa abajo) y posa orgullosísimo con los
 * brazos en jarras; Kiriku ladea la cabeza → Guillermo nota algo raro, se las quita, las mira, les da
 * la vuelta, las sostiene delante de la cara, las lanza al aire para «cazarlas» con la cara… y le
 * caen torcidas en la punta de la nariz (un cristal arriba y otro abajo) → Kiriku se baja las suyas
 * despacio por la patilla y le mira por encima, con la ceja levantada → Guillermo se las sube por la
 * patilla muy seguro, sonríe a cámara… y se le vuelven a resbalar → Kiriku se ríe, se sube las suyas
 * (¡ting!) y mira a cámara; Guillermo, con las gafas torcidas, sonríe a cámara → negro.
 *
 * Sin textos. Todo depende del tiempo absoluto. Las gafas se dibujan en unidades del retrato
 * (origen en el puente de la nariz) con una afín de pantalla: en la cara (capaCabeza, debajo de los
 * brazos), en la mano (objeto de la mano, debajo de los dedos) o en el aire. Las gafas que Kiriku
 * lleva colgadas son píxeles del torso: al cogerlas se tapan (capaTronco) y en ese mismo fotograma
 * aparecen las dibujadas, en el mismo sitio y con el mismo tamaño.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, mezcla, ruido, hash } = M2;
  const G = Guillermo, KI = Kiriku;
  const S = 0.31, SUELO = 556, XG = 372, XK = 652;
  const DUR = 14.4;
  const T = {
    sol0: 0.5, sol1: 0.85,
    // Kiriku: coge las gafas del cuello, las abre y se las pone
    kMano0: 1.0, kToca: 1.42, kSube0: 1.48, kSube1: 1.92, kAbre0: 1.94, kAbre1: 2.22,
    kPone0: 2.26, kPone1: 2.72, kFlick0: 2.76, kFlick1: 2.96, kFlick2: 3.3, kBrillo: 3.02,
    kPelo0: 3.0, kPelo1: 3.38, kBols1: 3.78, kChulo0: 3.35,
    // Guillermo copia
    gOoh: 2.35, gDeslum: 3.06, gDecide: 4.3, gSaca0: 4.46, gSaca1: 4.84, gAbre0: 4.86, gAbre1: 5.1,
    gPone0: 5.14, gPone1: 5.54, gChulo0: 5.56, gFlick0: 5.86, gFlick1: 6.02,
    vuela: 6.02, bote1: 6.5, bote2: 6.8, atrapa: 7.08,
    gReves0: 7.22, gReves1: 7.64, gOrgullo0: 7.68,
    kCeja0: 7.98, kCeja1: 8.22,
    gDuda: 8.42, gToca: 8.72, gQuita1: 9.04, gGira0: 9.08, gGira1: 9.4,
    gEstira0: 9.42, gEstira1: 9.6, gLanza: 9.7, gNariz: 10.0,
    kBaja0: 10.3, kBaja1: 10.56, kBaja2: 11.2,
    gEmpuja0: 11.24, gEmpuja1: 11.4, gEmpuja2: 11.54, gConfia0: 11.56,
    gResbala0: 12.1, gResbala1: 12.38,
    kArr0: 12.5, kArr1: 12.76, kBrillo2: 12.8, kBols2: 13.2, gFinal: 12.62, kFinal: 12.98,
    fin: 13.66
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
  const TINTA = "#141218";
  let MATRIZ = null;

  // afines de pantalla { a, b, c, d, e, f } (como setTransform)
  const AF = (a, b, c, d, e, f) => ({ a, b, c, d, e, f });
  const mul = (A, B) => AF(A.a * B.a + A.c * B.b, A.b * B.a + A.d * B.b, A.a * B.c + A.c * B.d, A.b * B.c + A.d * B.d,
    A.a * B.e + A.c * B.f + A.e, A.b * B.e + A.d * B.f + A.f);
  const apl = (A, q) => ({ x: A.a * q.x + A.c * q.y + A.e, y: A.b * q.x + A.d * q.y + A.f });
  const Tm = (x, y) => AF(1, 0, 0, 1, x, y), Rm = r => AF(Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0), Sm = (x, y) => AF(x, 0, 0, y, 0, 0);
  const lerpAF = (A, B, k) => AF(lerp(A.a, B.a, k), lerp(A.b, B.b, k), lerp(A.c, B.c, k), lerp(A.d, B.d, k), lerp(A.e, B.e, k), lerp(A.f, B.f, k));
  // A = T · R(θ) · S(sx, sy), sin cizalla (sx < 0 si está reflejada)
  function desc(A) { const sy = Math.hypot(A.c, A.d), th = Math.atan2(-A.c, A.d); return { x: A.e, y: A.f, th, sx: A.a * Math.cos(th) + A.b * Math.sin(th), sy }; }
  // retrato → pantalla, exacta (con espejo y aplastamiento de la cabeza)
  function afCabeza(Rg, p) {
    const H = Rg.cabeza(p), o = Rg.aPantalla(p, H.a({ x: 0, y: 0 })), ex = Rg.aPantalla(p, H.a({ x: 1, y: 0 })), ey = Rg.aPantalla(p, H.a({ x: 0, y: 1 }));
    return AF(ex.x - o.x, ex.y - o.y, ey.x - o.x, ey.y - o.y, o.x, o.y);
  }

  // Pistas de una mano: [t0, t1, objetivo, curva]; el objetivo se resuelve en la hoja en cada fotograma.
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
  const PINZA = { x: 6.2, y: 15.5 }, PALMA = { x: 0, y: 1 }, INDICE = { x: 8.4, y: 18.9 };
  const ptMano = (Rg, p, m, q) => { const o = offMano(m, q); return Rg.aPantalla(p, { x: m.x + o.x, y: m.y + o.y }); };
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, -1.75), l: punoDesde({ x: 372, y: 648 }, -1.75) };
  function resolutor(Rg, p, lado) {
    const Tr = Rg.tronco(p);
    return o => {
      if (o.bols) { const m = Rg.manoReposo ? Rg.manoReposo(p, lado) : null;
        const B = m ? m : Tr(lado === "cerca" ? BOLS_G.c : BOLS_G.l);
        return { x: B.x, y: B.y, mu: -1.75, ang: 0, puno: o.sale ? 1 : 0, dedos: o.dedos || D(0.4, 0.4, 0.4, 0.4), dobla: o.dobla ?? (lado === "cerca" ? -1 : 1) }; }
      const m = { mu: o.mu, ang: o.ang || 0 };
      let q;
      if (o.hoja) q = Tr(o.hoja);
      else { const sc = typeof o.scr === "function" ? o.scr() : o.scr, h = Rg.aHoja(p, sc), f = offMano(m, o.ref || PINZA); q = { x: h.x - f.x, y: h.y - f.y }; }
      return { x: q.x, y: q.y, mu: o.mu, ang: m.ang, puno: o.puno ?? 1, dedos: o.dedos, dobla: o.dobla ?? (lado === "cerca" ? -1 : 1) };
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
   * GAFAS · unidades del retrato; origen en el puente, x a lo largo de los ojos (hacia el
   * ojo lejano), y hacia abajo. persp: 1 de frente … ≈0,6 en la cara de tres cuartos.
   * ===================================================================================== */
  const AVIADOR = { tipo: 0, w: 100, h: 66, gap: 44, gapPleg: 22, cy: 4, patilla: 168,
    cristal: ["#343b50", "#07080c"], reflejo: "rgba(150,210,255,0.4)", reflejo2: "rgba(255,186,110,0.34)",
    montura: "#e2dccf", luz: "rgba(255,255,255,0.85)", sombra: "#8d8577", grosor: [9, 4.6], puente: [8, 3.8] };
  const WAYFARER = { tipo: 1, w: 126, h: 72, gap: 40, cy: -2, patilla: 190,
    cristal: ["#6a2fa0", "#163c94"], reflejo: "rgba(255,120,210,0.55)", reflejo2: "rgba(110,255,236,0.45)",
    montura: "#ff6a1e", luz: "rgba(255,226,170,0.9)", sombra: "#c23d0b", grosor: [20, 12.5], puente: [20, 12] };
  // cristal del aviador (de fuera −1 a la nariz +1)
  const AVI_PTS = [[-1.0, -0.6], [-0.58, -0.92], [0.12, -0.99], [0.76, -0.88], [1.0, -0.46], [0.97, 0.18], [0.74, 0.76], [0.26, 1.0], [-0.3, 0.93], [-0.78, 0.56], [-1.0, 0.02]];
  const WAY_PTS = [[-1, -0.92], [1, -1], [0.86, 0.84], [-0.8, 0.98]];
  function geo(E_, o) {
    const pe = o.persp ?? 1, pl = o.plegado ?? 0, inv = o.inv ?? 1, ko = o.oreja ? (o.kOreja ?? 1) : 0;
    const w = E_.w, h = E_.h, wf = w * pe;
    const gap = lerp(E_.gap, E_.gapPleg ?? E_.gap, pl);
    const nc = { x: -(gap / 2 + w / 2), y: E_.cy }, fc = { x: gap / 2 + wf / 2, y: E_.cy };
    const hn = { x: nc.x - w * 0.5 + 5, y: E_.cy - h * 0.3 }, hf = { x: fc.x + wf * 0.5 - 4, y: E_.cy - h * 0.3 };
    const fl = q => ({ x: q.x, y: q.y * inv });
    const abierta = { x: hn.x - E_.patilla, y: hn.y + 30 }, plegada = { x: hn.x + w * 0.86, y: hn.y + 10 };
    let fin = fl(mezcla(abierta, plegada, pl));
    if (ko > 0) fin = mezcla(fin, o.oreja, ko);
    const hnI = fl(hn);
    // agarre: en la patilla, junto a la bisagra (plegadas: el canto del cristal de fuera)
    const enPatilla = mezcla(hnI, fin, (o.agarreK ?? 0.14) * (1 - pl) + 0.02);
    const agarre = mezcla(enPatilla, fl({ x: nc.x - w * 0.5 - 2, y: nc.y }), pl);
    return { w, h, wf, nc, fc, hn: hnI, hf: fl(hf), fin, agarre, pe, pl, inv, ko };
  }
  function rutaLente(g, E_, c, w, h, sx) {
    g.beginPath();
    if (E_.tipo === 0) { M2.curva(g, AVI_PTS.map(([x, y]) => ({ x: c.x + sx * x * w / 2, y: c.y + y * h / 2 })), true, 0.5); return; }
    const P = WAY_PTS.map(([x, y]) => [c.x + sx * x * w / 2, c.y + y * h / 2]), r = Math.min(w, h) * 0.2;
    for (let i = 0; i < 4; i++) {
      const a = P[(i + 3) % 4], b = P[i], d = P[(i + 1) % 4];
      const ma = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], md = [(b[0] + d[0]) / 2, (b[1] + d[1]) / 2];
      if (i === 0) g.moveTo(ma[0], ma[1]);
      g.arcTo(b[0], b[1], md[0], md[1], r);
    }
    g.closePath();
  }
  function patilla(g, E_, a, b, alfa) {
    if (alfa <= 0.01) return;
    g.save(); g.globalAlpha *= alfa; g.lineCap = "round";
    const c = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - 8 };
    const ruta = () => { g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo(c.x, c.y, b.x, b.y); };
    ruta(); g.lineWidth = E_.tipo ? 17 : 9; g.strokeStyle = TINTA; g.stroke();
    ruta(); g.lineWidth = E_.tipo ? 9.5 : 4.4; g.strokeStyle = E_.montura; g.stroke();
    // terminal (la punta que va detrás de la oreja)
    const k = 0.78, q = { x: lerp(lerp(a.x, c.x, k), lerp(c.x, b.x, k), k), y: lerp(lerp(a.y, c.y, k), lerp(c.y, b.y, k), k) };
    g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(b.x, b.y); g.lineWidth = E_.tipo ? 17 : 11; g.strokeStyle = TINTA; g.stroke();
    g.lineWidth = E_.tipo ? 10 : 6; g.strokeStyle = E_.tipo ? E_.sombra : "#3a3632"; g.stroke();
    g.restore();
  }
  function lente(g, E_, c, w, h, sx) {
    rutaLente(g, E_, c, w, h, sx);
    const gr = g.createLinearGradient(0, c.y - h / 2, 0, c.y + h / 2);
    gr.addColorStop(0, E_.cristal[0]); gr.addColorStop(1, E_.cristal[1]);
    g.fillStyle = gr; g.fill();
    g.save(); rutaLente(g, E_, c, w, h, sx); g.clip();
    // reflejos: el cielo arriba, una franja cálida abajo y dos rayas de brillo
    g.fillStyle = E_.reflejo; g.beginPath(); g.ellipse(c.x - sx * w * 0.08, c.y - h * 0.42, w * 0.62, h * 0.3, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = E_.reflejo2; g.beginPath(); g.ellipse(c.x + sx * w * 0.12, c.y + h * 0.5, w * 0.6, h * 0.16, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,0.34)";
    g.beginPath(); g.moveTo(c.x - w * 0.28, c.y - h * 0.6); g.lineTo(c.x - w * 0.06, c.y - h * 0.6); g.lineTo(c.x - w * 0.36, c.y + h * 0.6); g.lineTo(c.x - w * 0.58, c.y + h * 0.6); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,0.16)";
    g.beginPath(); g.moveTo(c.x + w * 0.04, c.y - h * 0.6); g.lineTo(c.x + w * 0.14, c.y - h * 0.6); g.lineTo(c.x - w * 0.16, c.y + h * 0.6); g.lineTo(c.x - w * 0.26, c.y + h * 0.6); g.closePath(); g.fill();
    g.restore();
    // montura
    rutaLente(g, E_, c, w, h, sx); g.lineWidth = E_.grosor[0]; g.strokeStyle = TINTA; g.stroke();
    rutaLente(g, E_, c, w, h, sx); g.lineWidth = E_.grosor[1]; g.strokeStyle = E_.montura; g.stroke();
    if (E_.tipo === 1) {
      // barra gruesa de arriba con el ala hacia arriba en la esquina de fuera: del revés, el ala
      // apunta hacia abajo y la barra queda bajo los ojos (se nota enseguida)
      const bi = { x: c.x + sx * w * 0.5, y: c.y - h * 0.5 }, bo = { x: c.x - sx * w * 0.5, y: c.y - h * 0.46 };
      const ala = { x: c.x - sx * w * 0.74, y: c.y - h * 0.98 };
      const barra = () => { g.beginPath(); g.moveTo(bi.x, bi.y - 15); g.lineTo(bo.x, bo.y - 16);
        g.quadraticCurveTo(bo.x - sx * w * 0.12, bo.y - 18, ala.x, ala.y);
        g.quadraticCurveTo(bo.x - sx * w * 0.08, bo.y + 4, bo.x + sx * 4, bo.y + 16); g.lineTo(bi.x, bi.y + 15); g.closePath(); };
      barra(); g.fillStyle = E_.montura; g.fill(); g.lineWidth = 5; g.strokeStyle = TINTA; g.stroke();
      g.save(); barra(); g.clip();
      g.fillStyle = E_.sombra; g.beginPath(); g.moveTo(bi.x, bi.y + 4); g.lineTo(bo.x, bo.y + 5); g.lineTo(bo.x, bo.y + 16); g.lineTo(bi.x, bi.y + 16); g.closePath(); g.fill();
      g.restore();
      g.beginPath(); g.moveTo(bi.x - sx * 10, bi.y - 6); g.lineTo(bo.x + sx * 2, bo.y - 7); g.quadraticCurveTo(bo.x - sx * w * 0.1, bo.y - 11, ala.x + sx * 10, ala.y + 9);
      g.lineWidth = 3.5; g.strokeStyle = E_.luz; g.stroke();
    } else {
      g.save(); rutaLente(g, E_, c, w, h, sx); g.clip();
      g.restore();
      g.strokeStyle = E_.luz; g.lineWidth = 1.8; g.lineCap = "round";
      g.beginPath(); g.moveTo(c.x - sx * w * 0.36, c.y - h * 0.47); g.quadraticCurveTo(c.x, c.y - h * 0.56, c.x + sx * w * 0.34, c.y - h * 0.46); g.stroke();
    }
  }
  // dibuja las gafas (o: persp, plegado, inv, oreja, kOreja)
  function dibGafas(g, E_, o) {
    const q = geo(E_, o);
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // patilla lejana (detrás de los cristales; en la cara no se ve)
    const finL = mezcla({ x: q.hf.x - E_.patilla * 0.5, y: q.hf.y + 16 * q.inv }, { x: q.hf.x - q.wf * 0.86, y: q.hf.y + 10 * q.inv }, q.pl);
    patilla(g, E_, q.hf, finL, 1 - q.ko);
    // patilla cercana: de la bisagra a la oreja (o abierta / plegada en la mano)
    patilla(g, E_, q.hn, q.fin, 1);
    g.save(); g.scale(1, q.inv);
    lente(g, E_, q.fc, q.wf, q.h * 0.97, -1);
    lente(g, E_, q.nc, q.w, q.h, 1);
    // puente
    const a = { x: q.nc.x + q.w * 0.47, y: E_.cy - q.h * 0.22 }, b = { x: q.fc.x - q.wf * 0.47, y: E_.cy - q.h * 0.22 };
    const pr = () => { g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo((a.x + b.x) / 2, a.y - (E_.tipo ? 6 : 14), b.x, b.y); };
    pr(); g.lineWidth = E_.puente[0]; g.strokeStyle = TINTA; g.stroke(); pr(); g.lineWidth = E_.puente[1]; g.strokeStyle = E_.montura; g.stroke();
    if (E_.tipo === 0) {
      // doble puente del aviador
      const c1 = { x: q.nc.x + q.w * 0.36, y: E_.cy - q.h * 0.47 }, c2 = { x: q.fc.x - q.wf * 0.36, y: E_.cy - q.h * 0.47 };
      g.beginPath(); g.moveTo(c1.x, c1.y); g.quadraticCurveTo((c1.x + c2.x) / 2, c1.y - 6, c2.x, c2.y);
      g.lineWidth = E_.puente[0]; g.strokeStyle = TINTA; g.stroke(); g.lineWidth = E_.puente[1]; g.strokeStyle = E_.montura; g.stroke();
    }
    // bisagras
    g.fillStyle = E_.montura; g.strokeStyle = TINTA; g.lineWidth = 2.5;
    for (const hp of [{ x: q.nc.x - q.w * 0.5 + 3, y: E_.cy - q.h * 0.3 }, { x: q.fc.x + q.wf * 0.5 - 3, y: E_.cy - q.h * 0.3 }]) {
      g.beginPath(); g.ellipse(hp.x, hp.y, E_.tipo ? 9 : 6, E_.tipo ? 9 : 6, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    g.restore();
    g.restore();
  }
  function dibujaGafas(g, gf) {
    if (!MATRIZ || !gf) return;
    g.save(); g.setTransform(MATRIZ); g.transform(gf.A.a, gf.A.b, gf.A.c, gf.A.d, gf.A.e, gf.A.f);
    dibGafas(g, gf.E, gf.o);
    g.restore();
  }

  // dónde van en cada cara: puente (retrato), ángulo de la línea de los ojos y la oreja (local)
  const CARA_K = { B: { x: 908, y: 420 }, th: 0.327, oreja: { x: -228, y: 74 }, persp: 0.66 };
  const CARA_G = { B: { x: 850, y: 598 }, th: 0.36, oreja: { x: -262, y: 34 }, persp: 0.53 };
  // q: { dx, dy, rot } → desliza por la nariz (dy) y tuerce (rot) alrededor del puente
  function caraAF(Rg, p, CF, q) {
    return mul(afCabeza(Rg, p), mul(mul(Tm(CF.B.x, CF.B.y), Rm(CF.th)), mul(Tm(q.dx || 0, q.dy || 0), Rm(q.rot || 0))));
  }
  // afín en la mano: el agarre de las gafas en la pinza de la mano
  function manoAF(c, phi, sc, sx, agarre) { return mul(mul(Tm(c.x, c.y), Rm(phi)), mul(Sm(sx * sc, sc), Tm(-agarre.x, -agarre.y))); }

  /* ---------- las gafas colgadas del polo de Kiriku (píxeles del torso) ---------- */
  const COLG = { a: { x: 281, y: 340 }, b: { x: 288, y: 394 } };     // centros de los dos cristales (hoja)
  const ESC_COLG = 0.68;
  function colgadasAF(p) {
    const Tr = KI.tronco(p), a = KI.aPantalla(p, Tr(COLG.a)), b = KI.aPantalla(p, Tr(COLG.b));
    const d = { x: b.x - a.x, y: b.y - a.y }, L = Math.hypot(d.x, d.y), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const sep = AVIADOR.gapPleg + AVIADOR.w;                  // distancia entre centros (plegadas, de frente)
    const sc = L / sep, phi = Math.atan2(-d.y, -d.x);         // con S(−sc, sc): +x local va de a hacia b
    return mul(mul(Tm(m.x, m.y), Rm(phi)), Sm(-sc, sc));
  }
  // tapa de las gafas del cuello: polo negro con la tapeta (hoja del torso)
  const TAPA = [[262, 315], [280, 313], [294, 321], [300, 342], [301, 364], [308, 372], [309, 412], [302, 424], [289, 429], [276, 422], [270, 405], [268, 374], [262, 362], [260, 336]];
  function tapaCuello(g) {
    g.save(); g.lineJoin = "round";
    const ruta = () => { g.beginPath(); g.moveTo(TAPA[0][0], TAPA[0][1]); for (const [x, y] of TAPA) g.lineTo(x, y); g.closePath(); };
    const gr = g.createLinearGradient(0, 312, 0, 430);
    gr.addColorStop(0, "#2b2a30"); gr.addColorStop(0.42, "#26252b"); gr.addColorStop(0.62, "#1b1a20"); gr.addColorStop(1, "#16151a");
    ruta(); g.fillStyle = gr; g.fill();
    g.globalAlpha = 0.55; g.lineWidth = 5; g.strokeStyle = "#232228"; g.stroke(); g.globalAlpha = 1;
    // tapeta: pliegue oscuro y un botón
    g.save(); ruta(); g.clip();
    g.strokeStyle = "rgba(8,8,10,0.75)"; g.lineWidth = 3; g.beginPath(); g.moveTo(279, 312); g.quadraticCurveTo(284, 370, 286, 430); g.stroke();
    g.strokeStyle = "rgba(70,68,78,0.5)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(283, 314); g.quadraticCurveTo(288, 370, 290, 430); g.stroke();
    g.fillStyle = "#3b3a42"; g.beginPath(); g.arc(283, 338, 3.4, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#121116"; g.beginPath(); g.arc(283, 338, 1.4, 0, Math.PI * 2); g.fill();
    g.restore();
    g.restore();
  }

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha)
   * ===================================================================================== */
  const CG = {
    inicio: E({ mx: 0.8, my: 0.1, sonr: 0.25, ancho: 0.85 }),
    sol: E({ mx: 0.6, my: -0.3, c: 0.6, z: 0.35, sd: -6, si: -6, gd: -0.06, sonr: 0.05, ancho: 0.8 }),
    ooh: E({ mx: 0.9, my: -0.1, iris: 1.12, sd: 18, si: 16, abre: 16, ancho: 0.5, sonr: 0.1 }),
    deslumbra: E({ mx: 0.9, c: 1, z: 1, sd: -8, si: -8, abre: 8, ancho: 0.62, sonr: -0.25 }),
    admira: E({ mx: 0.9, my: -0.05, iris: 1.06, sd: 14, si: 12, abre: 4, ancho: 0.62, sonr: 0.35 }),
    decide: E({ mx: 0.85, my: 0.05, sd: -6, gd: -0.14, si: -4, gi: -0.12, sonr: 0.4, ancho: 0.95 }),
    miraGafas: E({ mx: 0.65, my: 0.75, sd: 8, si: 4, sonr: 0.5, ancho: 0.9 }),
    chulo: E({ mx: -0.5, my: 0.05, c: 0.2, sd: 12, si: 4, gi: -0.06, sonr: 0.85, ancho: 1.02 }),
    flick: E({ c: 1, h: 0.3, sd: 10, si: 8, sonr: 0.7, ancho: 1 }),
    sorpresa: E({ mx: 0.3, my: -1, iris: 0.85, sd: 26, si: 26, abre: 22, ancho: 0.6, sonr: -0.2 }),
    apura: E({ mx: 0.6, my: 0.2, iris: 0.92, sd: 22, si: 24, abre: 12, ancho: 0.7, sonr: -0.35 }),
    alivio: E({ mx: 0.6, my: 0.6, c: 0.45, h: 0.5, sd: 10, si: 10, sonr: 0.55, ancho: 0.9 }),
    orgullo: E({ mx: -0.5, sd: 16, si: 12, sonr: 0.92, ancho: 1.06 }),
    duda: E({ mx: 0.5, my: -0.7, sd: 20, gd: 0.22, si: 4, abre: 5, ancho: 0.55, sonr: -0.1 }),
    examina: E({ mx: 0.85, my: 0.25, iris: 1.05, sd: 16, gd: 0.14, si: 6, abre: 3, ancho: 0.55, sonr: 0.05 }),
    entiende: E({ mx: 0.85, my: 0.25, sd: 18, si: 16, abre: 10, ancho: 0.5, sonr: 0.45 }),
    listo: E({ mx: 0.85, my: -0.45, sd: -6, gd: -0.12, si: -4, gi: -0.1, sonr: 0.3, ancho: 0.8 }),
    recibe: E({ mx: 0.6, my: -0.9, c: 0.25, sd: 14, si: 14, abre: 10, ancho: 0.6, sonr: 0.3 }),
    pasmo: E({ mx: 0.7, my: -0.1, iris: 0.85, sd: 24, si: 24, abre: 9, ancho: 0.42, sonr: -0.1 }),
    seguro: E({ mx: 0.9, sd: -8, gd: -0.14, si: -6, gi: -0.12, sonr: 0.55, ancho: 0.95 }),
    confia: E({ mx: -0.5, my: 0.05, c: 0.25, sd: 12, si: 8, sonr: 0.95, ancho: 1.06 }),
    chafado: E({ mx: -0.3, my: 0.3, c: 0.35, sd: 16, gd: 0.3, si: 16, gi: 0.3, sonr: -0.45, ancho: 0.6, mof: 0.3 }),
    final: E({ mx: -0.55, my: 0.05, c: 0.15, sd: 14, si: 10, sonr: 0.8, ancho: 1.0 })
  };
  const GUION_CG = [
    [T.sol0, T.sol1, "sol"], [1.45, 1.7, "inicio"], [T.gOoh, T.gOoh + 0.2, "ooh"], [T.gDeslum, T.gDeslum + 0.06, "deslumbra", salida],
    [T.gDeslum + 0.4, T.gDeslum + 0.65, "admira"], [T.gDecide, T.gDecide + 0.15, "decide"], [T.gSaca1 - 0.1, T.gSaca1 + 0.05, "miraGafas"],
    [T.gPone1 - 0.05, T.gPone1 + 0.12, "chulo"], [T.gFlick0, T.gFlick0 + 0.08, "flick"], [T.vuela, T.vuela + 0.08, "sorpresa", salida],
    [T.bote1 - 0.12, T.bote1, "apura"], [T.atrapa, T.atrapa + 0.15, "alivio"], [T.gReves1 - 0.08, T.gReves1 + 0.12, "orgullo"],
    [T.gDuda, T.gDuda + 0.15, "duda"], [T.gQuita1 - 0.08, T.gQuita1 + 0.08, "examina"], [T.gGira1 - 0.05, T.gGira1 + 0.1, "entiende"],
    [T.gEstira0, T.gEstira1, "listo"], [T.gLanza, T.gLanza + 0.1, "recibe"], [T.gNariz, T.gNariz + 0.06, "pasmo", salida],
    [T.gEmpuja0 - 0.15, T.gEmpuja0, "seguro"], [T.gConfia0, T.gConfia0 + 0.14, "confia"], [T.gResbala0 + 0.08, T.gResbala1, "chafado"],
    [T.gFinal + 0.25, T.gFinal + 0.55, "final"]
  ];
  const PARP_G = [1.25, 2.0, 4.0, 4.95, 8.95, 10.75, 13.2];
  const P0G = { dx: 0, pel: 0, torso: 0, cab: 0, cdy: 0 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    quieto: CuG({ torso: 0.02, cab: 0.03 }),
    sol: CuG({ torso: -0.02, cab: -0.1 }),
    mira: CuG({ torso: 0.0, cab: -0.02 }),
    asombro: CuG({ torso: -0.04, cab: -0.07, pel: -2 }),
    deslumbra: CuG({ torso: -0.07, cab: -0.16, pel: -2 }),
    decide: CuG({ torso: 0.05, cab: 0.12, pel: 3 }),
    saca: CuG({ torso: 0.06, cab: 0.14, pel: 4 }),
    pone: CuG({ torso: 0.02, cab: 0.04 }),
    chulo: CuG({ torso: -0.06, cab: -0.08, pel: -3 }),
    antic: CuG({ torso: 0.07, cab: 0.2, pel: 6 }),
    flick: CuG({ torso: -0.1, cab: -0.34, pel: -4 }),
    arriba: CuG({ torso: -0.05, cab: -0.24, pel: 2 }),
    bate1: CuG({ torso: 0.08, cab: 0.1, pel: 12 }),
    bate2: CuG({ torso: 0.12, cab: 0.06, pel: 8, dx: 6 }),
    caza: CuG({ torso: 0.1, cab: 0.16, pel: 16 }),
    pone2: CuG({ torso: 0.03, cab: 0.03 }),
    orgullo: CuG({ torso: -0.08, cab: -0.12, pel: -5 }),
    duda: CuG({ torso: 0.0, cab: -0.04 }),
    quita: CuG({ torso: 0.03, cab: 0.08 }),
    examina: CuG({ torso: 0.06, cab: 0.2, pel: 3 }),
    listo: CuG({ torso: -0.01, cab: 0.02 }),
    lanza: CuG({ torso: -0.04, cab: -0.16, pel: -2 }),
    recibe: CuG({ torso: -0.06, cab: -0.12 }),
    aterriza: CuG({ torso: 0.03, cab: 0.07, pel: 4 }),
    empuja: CuG({ torso: -0.04, cab: -0.05 }),
    chulo2: CuG({ torso: -0.07, cab: -0.09, pel: -3 }),
    chafa: CuG({ torso: 0.03, cab: 0.11, pel: 3 }),
    final: CuG({ torso: 0.02, cab: 0.0 })
  };
  const GUION_G = [
    [T.sol0, T.sol1, "sol"], [1.45, 1.75, "mira"], [T.gOoh, T.gOoh + 0.25, "asombro"], [T.gDeslum, T.gDeslum + 0.07, "deslumbra", salida],
    [T.gDeslum + 0.35, T.gDeslum + 0.7, "mira"], [T.gDecide, T.gDecide + 0.15, "decide"], [T.gDecide + 0.15, T.gSaca0 + 0.1, "mira"],
    [T.gSaca0 + 0.1, T.gSaca1, "saca"], [T.gPone0, T.gPone1, "pone"], [T.gChulo0, T.gChulo0 + 0.2, "chulo"],
    [T.gFlick0, T.gFlick0 + 0.09, "antic"], [T.gFlick0 + 0.09, T.gFlick1, "flick", salida], [T.vuela + 0.06, T.bote1 - 0.12, "arriba"],
    [T.bote1 - 0.1, T.bote1 + 0.04, "bate1"], [T.bote2 - 0.12, T.bote2 + 0.03, "bate2"], [T.atrapa - 0.1, T.atrapa + 0.04, "caza"],
    [T.gReves0, T.gReves1, "pone2"], [T.gOrgullo0, T.gOrgullo0 + 0.25, "orgullo"], [T.gDuda, T.gDuda + 0.2, "duda"],
    [T.gToca, T.gQuita1, "quita"], [T.gQuita1, T.gGira0, "examina"], [T.gEstira0, T.gEstira1, "listo"],
    [T.gLanza - 0.08, T.gLanza + 0.02, "lanza"], [T.gLanza + 0.05, T.gNariz, "recibe"], [T.gNariz, T.gNariz + 0.1, "aterriza", salida],
    [T.gEmpuja0, T.gEmpuja1, "empuja"], [T.gConfia0, T.gConfia0 + 0.2, "chulo2"], [T.gResbala0, T.gResbala1, "chafa"],
    [T.gFinal + 0.2, T.gFinal + 0.55, "final"]
  ];
  const TOB = G.SUELO - G.TOBILLO_ALTO;
  const PIE_G = { cerca: G.PELVIS.x - 30 / S, lejos: G.PELVIS.x + 34 / S };
  // puntos de las manos (hoja de Guillermo)
  const HG = {
    delante: { x: 300, y: 430 }, bate1: { x: 408, y: 404 }, bate2: { x: 500, y: 300 }, caza: { x: 360, y: 384 },
    caderaC: { x: 118, y: 604 }, caderaL: { x: 398, y: 594 }, examina: { x: 448, y: 352 }, estira: { x: 452, y: 330 }, lanza: { x: 410, y: 190 },
    lado: { x: 70, y: 620 }
  };
  const FUERA_G = { x: -238, y: 172 }, LADO_G = { x: 98, y: 722 };
  const PINZA_G = D5(0.62, 0.55, 0.22, 0.18, 0.16), ABIERTA = D(1, 1, 1, 1), FLOJA = D(0.35, 0.4, 0.4, 0.4), DEDO = D5(0, 1, 0, 0, 0);
  function poseG(t) {
    const b = linea(GUION_G, CUER_G, "quieto", t);
    const respira = Math.sin(t * 2.1 + 0.4);
    const malabar = campana(t, T.vuela, T.atrapa + 0.15);
    const p = {
      x: XG + b.dx, suelo: SUELO, s: S,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } },
      tirasLimpias: true, ikContinuo: false, hombrosContinuos: true, hombrosRecortados: true
    };
    // asiente decidido; tiembla un poco al hacer malabares
    p.cabeza.ang += 0.07 * Math.sin((t - T.gDecide) * 14) * campana(t, T.gDecide, T.gDecide + 0.45);
    p.cabeza.ang += 0.05 * Math.sin((t - T.gEntiende) * 16) * campana(t, T.gGira1, T.gGira1 + 0.35);
    // piernas: quieto; durante el malabar da unos saltitos
    const salt = (t0, t1) => 22 * campana(t, t0, t1);
    const lev = { c: salt(T.bote2 - 0.12, T.bote2 + 0.08), l: salt(T.bote1 - 0.14, T.bote1 + 0.06) + salt(T.atrapa - 0.12, T.atrapa + 0.06) };
    p.piernas.cerca = { tob: { x: PIE_G.cerca - 26 * malabar, y: TOB - lev.c / S }, ang: 0 };
    p.piernas.lejos = { tob: { x: PIE_G.lejos + 30 * malabar, y: TOB - lev.l / S }, ang: 0 };
    // cara
    const e = linea(GUION_CG, CG, "inicio", t);
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.sudor = 0.6 * campana(t, T.vuela + 0.05, T.gReves0) + 0.4 * campana(t, T.gResbala0, DUR);
    p.rojo = 0.35 * campana(t, T.gResbala0, T.gFinal + 0.6);
    // manos
    const res = resolutor(G, p, "cerca"), resL = resolutor(G, p, "lejos");
    const AFc = q => caraAF(G, p, CARA_G, q);
    const agarreCara = (q, inv) => () => apl(AFc(q), geo(WAYFARER, { persp: CARA_G.persp, inv, oreja: CARA_G.oreja, kOreja: 1, agarreK: 0.8 }).agarre);
    const patillaG = () => apl(AFc(qG(t)), geo(WAYFARER, { persp: CARA_G.persp, inv: 1, oreja: CARA_G.oreja, kOreja: 1, agarreK: 0.55 }).agarre);
    // el codo cambia de lado (dobla −1 abajo ↔ +1 con la mano en la cara) solo con el brazo estirado
    const pelo = () => G.aPantalla(p, G.cabeza(p).a({ x: 585, y: 328 }));
    const PISTA_GC = [
      [0, 0, { bols: true }],
      [T.gSaca0, T.gSaca0 + 0.14, { bols: true, sale: true, dedos: PINZA_G }],
      [T.gSaca0 + 0.14, T.gSaca1, { hoja: FUERA_G, mu: 0.49, dedos: PINZA_G, dobla: -1 }, salida],
      [T.gAbre1, T.gPone0, { hoja: FUERA_G, mu: 0.49, dedos: PINZA_G, dobla: 1 }],
      [T.gPone0, T.gPone1, { scr: agarreCara({}, 1), mu: 2.2, dedos: PINZA_G, dobla: 1 }, salida],
      // se pasa la mano por el pelo, como Kiriku (con el brazo estirado cambia el codo)
      [T.gChulo0 + 0.02, T.gChulo0 + 0.24, { scr: pelo, ref: PALMA, mu: 1.95, dedos: D(0.9, 1, 1, 1), dobla: 1 }],
      [T.gFlick0 + 0.02, T.vuela + 0.04, { hoja: LADO_G, mu: -1.6, dedos: FLOJA, dobla: 1 }],
      [T.vuela + 0.04, T.vuela + 0.06, { hoja: LADO_G, mu: -1.6, dedos: FLOJA, dobla: -1 }],
      [T.vuela + 0.07, T.bote1, { hoja: HG.bate1, mu: 2.7, dedos: ABIERTA, dobla: -1 }, salida],
      [T.bote1, T.bote1 + 0.16, { hoja: { x: 300, y: 420 }, mu: 2.5, dedos: ABIERTA, dobla: -1 }],
      [T.bote2 + 0.02, T.atrapa, { hoja: HG.caza, mu: 2.45, dedos: PINZA_G, dobla: -1 }, salida],
      [T.atrapa + 0.02, T.atrapa + 0.14, { hoja: { x: 170, y: 500 }, mu: 1.2, dedos: PINZA_G, dobla: -1 }],
      [T.atrapa + 0.14, T.gReves0 + 0.1, { hoja: FUERA_G, mu: 0.49, dedos: PINZA_G, dobla: -1 }],
      [T.gReves0 + 0.1, T.gReves0 + 0.13, { hoja: FUERA_G, mu: 0.49, dedos: PINZA_G, dobla: 1 }],
      // se las pone del revés y se queda posando con la mano en la patilla
      [T.gReves0 + 0.13, T.gReves1, { scr: agarreCara({}, -1), mu: 2.2, dedos: PINZA_G, dobla: 1 }, salida],
      [T.gToca + 0.02, T.gQuita1, { hoja: HG.examina, mu: 2.75, dedos: PINZA_G, dobla: 1 }],
      [T.gEstira0, T.gEstira1, { hoja: HG.estira, mu: 2.9, dedos: PINZA_G, dobla: 1 }],
      [T.gLanza - 0.08, T.gLanza, { hoja: HG.lanza, mu: 2.6, dedos: PINZA_G, dobla: 1 }, salida],
      [T.gLanza, T.gLanza + 0.1, { hoja: { x: 380, y: 158 }, mu: 2.5, dedos: ABIERTA, dobla: 1 }],
      // suelta: el brazo cae estirado por delante (sin doblar el codo) y la mano vuelve al bolsillo
      [T.gLanza + 0.1, T.gNariz + 0.05, { hoja: { x: 408, y: 384 }, mu: 2.9, dedos: D(0.7, 0.8, 0.8, 0.8), dobla: 1 }],
      [T.gNariz + 0.05, T.gNariz + 0.3, { hoja: { x: 340, y: 628 }, mu: -2.4, dedos: FLOJA, dobla: 1 }],
      [T.gNariz + 0.3, T.gNariz + 0.32, { hoja: { x: 340, y: 628 }, mu: -2.4, dedos: FLOJA, dobla: -1 }],
      [T.gNariz + 0.32, T.gNariz + 0.65, { bols: true }],
      // se las sube cogiéndolas por la patilla, muy seguro (el codo hacia fuera)
      [T.gEmpuja0 - 0.32, T.gEmpuja0 - 0.14, { hoja: LADO_G, mu: -1.6, dedos: FLOJA, dobla: -1 }],
      [T.gEmpuja0 - 0.14, T.gEmpuja0 - 0.12, { hoja: LADO_G, mu: -1.6, dedos: FLOJA, dobla: 1 }],
      [T.gEmpuja0 - 0.12, T.gEmpuja1, { scr: patillaG, mu: 2.2, dedos: PINZA_G, dobla: 1 }, salida],
      [T.gEmpuja1, T.gEmpuja2, { scr: patillaG, mu: 2.2, dedos: PINZA_G, dobla: 1 }],
      [T.gEmpuja2 + 0.04, T.gEmpuja2 + 0.3, { hoja: LADO_G, mu: -1.6, dedos: FLOJA, dobla: 1 }],
      [T.gEmpuja2 + 0.3, T.gEmpuja2 + 0.32, { hoja: LADO_G, mu: -1.6, dedos: FLOJA, dobla: -1 }],
      [T.gEmpuja2 + 0.32, T.gEmpuja2 + 0.62, { bols: true }]
    ];
    const PISTA_GL = [
      [0, 0, { bols: true }],
      [T.bote1 + 0.02, T.bote2, { hoja: HG.bate2, mu: 2.2, dedos: ABIERTA, dobla: 1 }, salida],
      [T.bote2, T.atrapa - 0.02, { hoja: { x: 430, y: 400 }, mu: 2.0, dedos: ABIERTA, dobla: 1 }],
      [T.atrapa + 0.05, T.atrapa + 0.4, { bols: true }],
      [T.gReves1 + 0.08, T.gOrgullo0 + 0.26, { hoja: HG.caderaL, mu: -0.9, dedos: D(0.1, 0, 0, 0), dobla: 1 }, salida],
      [T.gDuda + 0.02, T.gDuda + 0.35, { bols: true }]
    ];
    const C = pista(PISTA_GC, t, res), L = pista(PISTA_GL, t, resL);
    // golpe de muñeca para abrirlas; lanza
    const abre = campana(t, T.gAbre0 - 0.02, T.gAbre1);
    C.ang += 0.5 * Math.sin((t - T.gAbre0) * 34) * abre;
    p.manoCerca = { x: C.x, y: C.y, ang: C.ang, mu: C.mu, dobla: C.dobla, puno: C.puno, dedos: C.dedos };
    p.manoLejos = { x: L.x, y: L.y, ang: L.ang, mu: L.mu, dobla: L.dobla, puno: L.puno, dedos: L.dedos };
    return p;
  }
  T.gEntiende = T.gGira1;
  // posición de las gafas de Guillermo en la cara
  const TORCIDAS = { dx: 4, dy: 60, rot: 0.34 }, SUBIDAS = { dx: 0, dy: 2, rot: 0.04 };
  function qG(t) {
    if (t < T.gNariz) return { dx: 0, dy: 0, rot: 0 };
    const tiembla = (t0, a) => { const u = Math.max(0, t - t0); return { dy: a * 7 * Math.sin(u * 24) * Math.exp(-u * 8), rot: a * 0.13 * Math.sin(u * 19) * Math.exp(-u * 7) }; };
    const w1 = tiembla(T.gNariz, 1), w2 = tiembla(T.gResbala1, 0.8);
    const sube = tramo(t, T.gEmpuja1, T.gEmpuja2, salida) * (1 - tramo(t, T.gResbala0, T.gResbala1, entrada));
    const tor = { dx: TORCIDAS.dx, dy: TORCIDAS.dy + w1.dy + (t > T.gResbala1 ? w2.dy : 0), rot: TORCIDAS.rot + w1.rot + (t > T.gResbala1 ? w2.rot : 0) };
    return { dx: lerp(tor.dx, SUBIDAS.dx, sube), dy: lerp(tor.dy, SUBIDAS.dy, sube), rot: lerp(tor.rot, SUBIDAS.rot, sube) };
  }

  /* =====================================================================================
   * KIRIKU (derecha, reflejado: mira a la izquierda)
   * ===================================================================================== */
  const CK = {
    inicio: E({ mx: 0.85, my: 0.1, c: 0.3, sd: 4, si: 6, sonr: 0.45, ancho: 0.9 }),
    sol: E({ mx: 0.5, my: -0.4, c: 0.62, z: 0.3, sd: -8, si: -8, sonr: 0.12, ancho: 0.8 }),
    coge: E({ mx: 0.45, my: 1, c: 0.4, sd: 4, si: 4, sonr: 0.5, ancho: 0.9 }),
    admira: E({ mx: 0.6, my: 0.4, c: 0.3, sd: 10, si: 8, sonr: 0.65, ancho: 0.95 }),
    pone: E({ c: 0.6, sd: 8, si: 8, sonr: 0.55, ancho: 0.9 }),
    flick: E({ c: 0.9, sd: 14, si: 10, sonr: 0.8, ancho: 1 }),
    chulo: E({ mx: -0.4, sd: 14, si: 8, gi: -0.05, sonr: 0.92, ancho: 1.04 }),
    mira: E({ mx: 0.9, my: 0.1, sd: 6, si: 6, sonr: 0.45, ancho: 0.9 }),
    sorpresa: E({ mx: 0.9, my: -0.6, sd: 18, si: 16, abre: 6, ancho: 0.55, sonr: 0.2 }),
    ceja: E({ mx: 0.9, sd: 24, gd: 0.12, si: -2, gi: -0.08, sonr: 0.1, ancho: 0.62 }),
    aguanta: E({ mx: 0.9, sd: 12, si: 10, sonr: 0.5, ancho: 0.7, mof: 0.55 }),
    sobre: E({ mx: 0.95, my: -0.45, iris: 0.95, sd: 28, gd: 0.14, si: 2, gi: -0.04, sonr: 0.05, ancho: 0.58 }),
    risa: E({ mx: 0.8, c: 0.65, h: 0.7, sd: 14, si: 14, abre: 10, sonr: 0.85, ancho: 1 }),
    final: E({ mx: -0.4, sd: 12, si: 14, gi: 0.05, sonr: 0.9, ancho: 1.02 })
  };
  const GUION_CK = [
    [T.sol0, T.sol1, "sol"], [T.kMano0, T.kToca, "coge"], [T.kSube0 + 0.1, T.kSube1, "admira"], [T.kPone0, T.kPone0 + 0.2, "pone"],
    [T.kFlick0, T.kFlick1, "flick"], [T.kChulo0, T.kChulo0 + 0.35, "chulo"], [T.gSaca0, T.gSaca0 + 0.2, "mira"],
    [T.vuela, T.vuela + 0.15, "sorpresa"], [T.atrapa + 0.05, T.atrapa + 0.25, "mira"], [T.kCeja0, T.kCeja1, "ceja"],
    [T.gToca, T.gToca + 0.2, "mira"], [T.gNariz + 0.05, T.gNariz + 0.2, "aguanta"], [T.kBaja1, T.kBaja1 + 0.3, "sobre"],
    [T.gResbala1, T.gResbala1 + 0.15, "risa"], [T.kFinal, T.kFinal + 0.3, "final"]
  ];
  const PARP_K = [0.3, 1.9, 4.6, 6.6, 9.3, 12.15, 13.4];
  const P0K = { pel: 0, torso: 0.02, cab: 0.03, cdy: 0 };
  const CuK = o => Object.assign({}, P0K, o);
  const CUER_K = {
    quieto: CuK({}),
    sol: CuK({ torso: -0.02, cab: -0.12 }),
    coge: CuK({ torso: 0.05, cab: 0.16, pel: 3 }),
    sube: CuK({ torso: 0.0, cab: 0.04 }),
    pone: CuK({ torso: 0.0, cab: 0.07 }),
    flick: CuK({ torso: -0.06, cab: -0.24, pel: -3 }),
    chulo: CuK({ torso: -0.05, cab: -0.09, pel: -2 }),
    mira: CuK({ torso: 0.02, cab: 0.03 }),
    sorpresa: CuK({ torso: -0.02, cab: -0.07 }),
    ladea: CuK({ torso: 0.03, cab: 0.13 }),
    baja: CuK({ torso: 0.05, cab: 0.17, pel: 2 }),
    rie: CuK({ torso: -0.03, cab: 0.04 }),
    final: CuK({ torso: -0.05, cab: -0.1, pel: -2 })
  };
  const GUION_K = [
    [T.sol0, T.sol1, "sol"], [T.kMano0, T.kToca, "coge"], [T.kSube0, T.kSube1, "sube"], [T.kPone0, T.kPone1, "pone"],
    [T.kFlick0, T.kFlick1, "flick", salida], [T.kFlick1, T.kFlick2, "chulo"], [T.gSaca0, T.gSaca0 + 0.35, "mira"],
    [T.vuela, T.vuela + 0.15, "sorpresa"], [T.atrapa + 0.1, T.atrapa + 0.35, "mira"], [T.kCeja0, T.kCeja1, "ladea"],
    [T.gToca, T.gToca + 0.3, "mira"], [T.kBaja0, T.kBaja1, "baja"], [T.gResbala1, T.gResbala1 + 0.2, "rie"],
    [T.kArr0, T.kArr1, "chulo"], [T.kFinal, T.kFinal + 0.3, "final"]
  ];
  const TOB_K = KI.SUELO - KI.TOBILLO_ALTO;
  const PIE_K = { cerca: KI.PELVIS.x - 28 / (S * KI.K), lejos: KI.PELVIS.x + 34 / (S * KI.K) };
  const DEDO_K = D5(0, 1, 0, 0, 0), PINZA_K = D5(0.6, 0.55, 0.2, 0.15, 0.12);
  function poseK(t) {
    const b = linea(GUION_K, CUER_K, "quieto", t);
    const respira = Math.sin(t * 1.9 + 1.4);
    const p = {
      x: XK, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: KI.PELVIS.x, y: KI.PELVIS.y + b.pel + respira * 1.1 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } }
    };
    // se ríe por lo bajo (hombros y cabeza)
    p.cabeza.ang += 0.035 * Math.sin(t * 19) * campana(t, T.gResbala1, T.kArr0 + 0.1);
    p.piernas.cerca = { tob: { x: PIE_K.cerca, y: TOB_K }, ang: 0 };
    p.piernas.lejos = { tob: { x: PIE_K.lejos, y: TOB_K }, ang: 0 };
    const e = linea(GUION_CK, CK, "inicio", t);
    p.cara = cara(e, parpadeo(t, PARP_K));
    // manos
    const res = resolutor(KI, p, "cerca"), resL = resolutor(KI, p, "lejos");
    const AFc = q => caraAF(KI, p, CARA_K, q);
    const oCara = { persp: CARA_K.persp, oreja: CARA_K.oreja, kOreja: 1 };
    const agarreColg = () => apl(colgadasAF(p), geo(AVIADOR, { plegado: 1 }).agarre);
    const agarreCara = () => apl(AFc(qK(t)), geo(AVIADOR, Object.assign({ agarreK: 0.8 }, oCara)).agarre);
    const pelo = () => KI.aPantalla(p, KI.cabeza(p).a({ x: 618, y: 300 }));
    // el codo cambia de lado (dobla −1 ↔ +1) solo con el brazo estirado, para que no salte
    const FUERA = { x: -318, y: 280 }, LADO = { x: 40, y: 714 };
    const PISTA_KC = [
      [0, 0, { bols: true }],
      [T.kMano0, T.kMano0 + 0.12, { bols: true, sale: true, dedos: D(0.9, 0.9, 0.8, 0.7) }],
      [T.kMano0 + 0.12, T.kToca, { scr: agarreColg, mu: 2.95, dedos: PINZA_K, dobla: -1 }],
      [T.kSube0, T.kSube1, { hoja: FUERA, mu: 0.1, dedos: PINZA_K, dobla: -1 }],
      [T.kAbre1, T.kPone0, { hoja: FUERA, mu: 0.1, dedos: PINZA_K, dobla: 1 }],
      [T.kPone0, T.kPone1, { scr: agarreCara, mu: 2.25, dedos: PINZA_K, dobla: 1 }, salida],
      [T.kPelo0, T.kPelo1, { scr: pelo, ref: PALMA, mu: 1.95, dedos: D(0.9, 1, 1, 1), dobla: 1 }],
      [T.kPelo1 + 0.02, T.kPelo1 + 0.26, { hoja: LADO, mu: -1.45, dedos: D(0.5, 0.6, 0.6, 0.6), dobla: 1 }],
      [T.kPelo1 + 0.26, T.kPelo1 + 0.3, { hoja: LADO, mu: -1.45, dedos: D(0.5, 0.6, 0.6, 0.6), dobla: -1 }],
      [T.kPelo1 + 0.3, T.kBols1 + 0.12, { bols: true }],
      // se baja las gafas tirando de la patilla (y luego se las sube)
      [T.kBaja0 - 0.3, T.kBaja0 - 0.08, { hoja: LADO, mu: -1.45, dedos: D(0.5, 0.6, 0.6, 0.6), dobla: -1 }],
      [T.kBaja0 - 0.08, T.kBaja0 - 0.06, { hoja: LADO, mu: -1.45, dedos: D(0.5, 0.6, 0.6, 0.6), dobla: 1 }],
      [T.kBaja0 - 0.06, T.kBaja1, { scr: agarreCara, mu: 2.25, dedos: PINZA_K, dobla: 1 }, salida],
      [T.kArr1 + 0.08, T.kArr1 + 0.32, { hoja: LADO, mu: -1.45, dedos: D(0.5, 0.6, 0.6, 0.6), dobla: 1 }],
      [T.kArr1 + 0.32, T.kArr1 + 0.34, { hoja: LADO, mu: -1.45, dedos: D(0.5, 0.6, 0.6, 0.6), dobla: -1 }],
      [T.kArr1 + 0.34, T.kBols2 + 0.2, { bols: true }]
    ];
    const PISTA_KL = [[0, 0, { bols: true }]];
    const C = pista(PISTA_KC, t, res), L = pista(PISTA_KL, t, resL);
    const abre = campana(t, T.kAbre0 - 0.02, T.kAbre1);
    C.ang += 0.45 * Math.sin((t - T.kAbre0) * 36) * abre;
    p.manoCerca = { x: C.x, y: C.y, ang: C.ang, mu: C.mu, dobla: C.dobla, puno: C.puno, dedos: C.dedos };
    p.manoLejos = { x: L.x, y: L.y, ang: L.ang, mu: L.mu, dobla: L.dobla, puno: L.puno, dedos: L.dedos };
    return p;
  }
  // gafas de Kiriku en su cara: se las baja con un dedo y se las vuelve a subir
  function qK(t) {
    const baja = tramo(t, T.kBaja1, T.kBaja2) * (1 - tramo(t, T.kArr0 + 0.04, T.kArr1, salida));
    return { dx: -4 * baja, dy: 68 * baja, rot: 0.05 * baja };
  }

  /* =====================================================================================
   * DÓNDE ESTÁN LAS GAFAS EN CADA INSTANTE
   * ===================================================================================== */
  const memo = new Map();
  const cache = (k, f) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };
  const SCK = () => desc(caraAF(KI, poseK(0), CARA_K, {})).sy;      // escala de la cara (retrato → pantalla)
  function gafasK(t, pK) {
    if (t < T.kToca) return null;
    const oCara = { persp: CARA_K.persp, oreja: CARA_K.oreja, kOreja: 1, inv: 1 };
    const AfC = caraAF(KI, pK, CARA_K, qK(t));
    if (t >= T.kPone1) return { E: AVIADOR, A: AfC, o: oCara, capa: "cara", brillo: true };
    const k = tramo(t, T.kPone0, T.kPone1);
    const pl = 1 - tramo(t, T.kAbre0, T.kAbre1, salida);
    const o = { persp: lerp(1, CARA_K.persp, tramo(t, T.kPone0, T.kPone1)), plegado: pl, oreja: CARA_K.oreja, kOreja: tramo(t, T.kPone0 + 0.18, T.kPone1), inv: 1, agarreK: lerp(0.14, 0.8, k) };
    const g0 = geo(AVIADOR, o);
    const c = ptMano(KI, pK, pK.manoCerca, PINZA);
    // ángulo y escala: los de las gafas colgadas al cogerlas → los de la cara al ponérselas
    const Ac = desc(colgadasAF(pK)), dc = desc(AfC);
    const phiM = lerpAng(Ac.th, -0.15, tramo(t, T.kToca, T.kSube1)) + 0.35 * Math.sin((t - T.kAbre0) * 36) * campana(t, T.kAbre0 - 0.02, T.kAbre1);
    const scM = lerp(Ac.sy, dc.sy, tramo(t, T.kToca + 0.04, T.kAbre1));
    const phi = lerpAng(phiM, dc.th, k), sc = lerp(scM, dc.sy, k);
    let A = manoAF(c, phi, sc, -1, g0.agarre);
    if (k > 0) A = lerpAF(A, AfC, suave(k));
    return { E: AVIADOR, A, o, capa: "manoK" };
  }
  // vuelo en parábola entre dos puntos (pos), con giro, escala y volteo
  const plegVuelo = t => 0.55 * campana(t, T.vuela, T.atrapa) * (0.75 + 0.25 * Math.sin(t * 26));
  const parabola = (a, b, u, alto) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) - alto * 4 * u * (1 - u) });
  function gafasG(t, pG) {
    if (t < T.gSaca0 + 0.06) return null;
    const oC = inv => ({ persp: CARA_G.persp, oreja: CARA_G.oreja, kOreja: 1, inv });
    const AfC = q => caraAF(G, pG, CARA_G, q || qG(t));
    const sc0 = desc(AfC({})).sy;
    const enMano = (phi, sc, o) => manoAF(ptMano(G, pG, pG.manoCerca, PINZA), phi, sc, 1, geo(WAYFARER, o).agarre);
    // 1 · del bolsillo a la cara
    if (t < T.gPone1) {
      const k = tramo(t, T.gPone0, T.gPone1);
      const o = { persp: lerp(1, CARA_G.persp, k), plegado: 1 - tramo(t, T.gAbre0, T.gAbre1, salida), oreja: CARA_G.oreja, kOreja: tramo(t, T.gPone0 + 0.16, T.gPone1), inv: 1, agarreK: lerp(0.14, 0.8, k) };
      const dc = desc(AfC({}));
      const sale = tramo(t, T.gSaca0 + 0.06, T.gSaca0 + 0.26);
      const phiM = lerp(1.15, -0.2, tramo(t, T.gSaca0 + 0.1, T.gSaca1)) + 0.4 * Math.sin((t - T.gAbre0) * 34) * campana(t, T.gAbre0 - 0.02, T.gAbre1);
      const phi = lerpAng(phiM, dc.th, k), sc = lerp(sc0 * lerp(0.45, 1, sale), dc.sy, k);
      let A = enMano(phi, sc, o);
      if (k > 0) A = lerpAF(A, AfC({}), suave(k));
      return { E: WAYFARER, A, o, capa: "manoG" };
    }
    // 2 · puestas
    if (t < T.vuela) return { E: WAYFARER, A: AfC({}), o: oC(1), capa: "cara" };
    // 3 · ¡salen volando!: bate con una mano, con la otra y las caza (del revés)
    if (t < T.atrapa) {
      const A0 = cache("g0", () => caraAF(G, poseG(T.vuela), CARA_G, {}));
      const d0 = desc(A0);
      const P1 = cache("b1", () => { const p = poseG(T.bote1); const q = ptMano(G, p, p.manoCerca, PALMA); return { x: q.x + 4, y: q.y - 14 }; });
      const P2 = cache("b2", () => { const p = poseG(T.bote2); const q = ptMano(G, p, p.manoLejos, PALMA); return { x: q.x - 2, y: q.y - 14 }; });
      const oF = { persp: 1, plegado: 0, inv: -1 };
      const Af = enMano(-0.5, sc0, oF), d3 = desc(Af);        // en la mano al cazarlas (vivo)
      let pos;
      if (t < T.bote1) pos = parabola(d0, P1, fase(t, T.vuela, T.bote1), 120);
      else if (t < T.bote2) pos = parabola(P1, P2, fase(t, T.bote1, T.bote2), 64);
      else pos = parabola(P2, apl(Af, { x: 0, y: 0 }), fase(t, T.bote2, T.atrapa), 46);
      const U = fase(t, T.vuela, T.atrapa);
      const th = lerp(d0.th, d3.th + 2 * Math.PI, U), inv = Math.cos(Math.PI * 3 * U);
      const o = { persp: lerp(CARA_G.persp, 1, tramo(t, T.vuela, T.vuela + 0.2)), plegado: plegVuelo(t), oreja: CARA_G.oreja, kOreja: 1 - tramo(t, T.vuela, T.vuela + 0.16), inv };
      // el origen de la afín es el puente: lo que vuela es el puente
      return { E: WAYFARER, A: mul(mul(Tm(pos.x, pos.y), Rm(th)), Sm(sc0, sc0)), o, capa: "aire" };
    }
    // 4 · en la mano (del revés) → se las pone así
    if (t < T.gReves1) {
      const k = tramo(t, T.gReves0, T.gReves1);
      const o = { persp: lerp(1, CARA_G.persp, k), plegado: 0, oreja: CARA_G.oreja, kOreja: tramo(t, T.gReves0 + 0.16, T.gReves1), inv: -1, agarreK: lerp(0.14, 0.8, k) };
      const dc = desc(AfC({}));
      let A = enMano(lerpAng(-0.5, dc.th, k), sc0, o);
      if (k > 0) A = lerpAF(A, AfC({}), suave(k));
      return { E: WAYFARER, A, o, capa: k < 1 ? "manoG" : "cara" };
    }
    // 5 · puestas del revés
    if (t < T.gToca) return { E: WAYFARER, A: AfC({}), o: oC(-1), capa: "cara" };
    // 6 · se las quita, las mira, les da la vuelta, las sostiene delante y las lanza
    if (t < T.gLanza) {
      const k = 1 - tramo(t, T.gToca, T.gQuita1);
      const gira = tramo(t, T.gGira0, T.gGira1);
      const inv = -Math.cos(Math.PI * gira);
      const o = { persp: lerp(1, CARA_G.persp, k), plegado: 0, oreja: CARA_G.oreja, kOreja: k, inv, agarreK: lerp(0.14, 0.8, k) };
      const dc = desc(AfC({}));
      const phiM = lerp(0.05, -0.12, tramo(t, T.gEstira0, T.gEstira1)) + 0.12 * Math.sin((t - T.gGira0) * 10) * campana(t, T.gGira0, T.gGira1);
      let A = enMano(lerpAng(phiM, dc.th, k), sc0, o);
      if (k > 0) A = lerpAF(A, AfC({}), suave(k));
      return { E: WAYFARER, A, o, capa: "manoG" };
    }
    // 7 · lanzadas: aterrizan torcidas en la punta de la nariz
    if (t < T.gNariz) {
      const u = fase(t, T.gLanza, T.gNariz);
      const A0 = cache("l0", () => { const p = poseG(T.gLanza); return manoAF(ptMano(G, p, p.manoCerca, PINZA), -0.12, sc0, 1, geo(WAYFARER, { persp: 1, inv: 1 }).agarre); });
      const d0 = desc(A0), Af = AfC(qG(T.gNariz)), d1 = desc(Af);
      const pos = parabola(d0, d1, salida(u), 56);
      const o = { persp: lerp(1, CARA_G.persp, tramo(t, T.gLanza + 0.1, T.gNariz)), plegado: 0, oreja: CARA_G.oreja, kOreja: tramo(t, T.gLanza + 0.12, T.gNariz), inv: 1 };
      const A = mul(mul(Tm(pos.x, pos.y), Rm(lerpAng(d0.th, d1.th, u) - 0.5 * Math.sin(Math.PI * u))), Sm(sc0, sc0));
      return { E: WAYFARER, A, o, capa: "aire" };
    }
    // 8 · en la nariz (torcidas, subidas, resbalan)
    return { E: WAYFARER, A: AfC(qG(t)), o: oC(1), capa: "cara" };
  }

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  let fondo = null;
  const HORIZ = 300, BAL0 = 318, BAL1 = 420;            // horizonte del mar y balaustrada
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 80; c.height = H + 120; const g = c.getContext("2d");
    g.translate(40, 60); g.lineJoin = "round"; g.lineCap = "round";
    // cielo
    const cie = g.createLinearGradient(0, -60, 0, HORIZ);
    cie.addColorStop(0, "#2a86de"); cie.addColorStop(0.55, "#62b6ee"); cie.addColorStop(1, "#c4ebfa");
    g.fillStyle = cie; g.fillRect(-40, -60, W + 80, HORIZ + 60);
    const halo = g.createRadialGradient(128, 58, 10, 128, 58, 420);
    halo.addColorStop(0, "rgba(255,255,236,0.95)"); halo.addColorStop(0.12, "rgba(255,250,214,0.75)"); halo.addColorStop(0.4, "rgba(255,244,200,0.22)"); halo.addColorStop(1, "rgba(255,240,200,0)");
    g.fillStyle = halo; g.fillRect(-40, -60, W + 80, HORIZ + 60);
    nubes(g);
    isla(g);
    mar(g);
    buganvilla(g, true);
    balaustrada(g);
    suelo(g);
    buganvilla(g, false);
    parasol(g);
    limonero(g, 62, 560);
    // luz de mediodía (de arriba a la izquierda) y viñeta suave
    const cal = g.createLinearGradient(0, 0, W, H); cal.addColorStop(0, "rgba(255,236,170,0.18)"); cal.addColorStop(1, "rgba(255,236,170,0)");
    g.fillStyle = cal; g.fillRect(-40, -60, W + 80, H + 120);
    const vi = g.createRadialGradient(560, 320, 320, 512, 300, 760); vi.addColorStop(0, "rgba(0,0,0,0)"); vi.addColorStop(1, "rgba(40,30,10,0.32)");
    g.fillStyle = vi; g.fillRect(-40, -60, W + 80, H + 120);
    return c;
  }
  function nubes(g) {
    g.save();
    for (const [x, y, w] of [[470, 46, 110], [700, 92, 80], [930, 30, 130], [330, 150, 70]]) {
      g.fillStyle = "rgba(255,255,255,0.82)";
      g.beginPath(); g.ellipse(x, y, w, 15, 0, 0, Math.PI * 2); g.ellipse(x - w * 0.32, y - 11, w * 0.42, 15, 0, 0, Math.PI * 2); g.ellipse(x + w * 0.22, y - 14, w * 0.48, 17, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "rgba(170,205,235,0.4)"; g.beginPath(); g.ellipse(x + 8, y + 9, w * 0.9, 5, 0, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  function isla(g) {
    g.save();
    g.fillStyle = "#7fa9c6";
    g.beginPath(); g.moveTo(560, HORIZ); g.bezierCurveTo(600, 268, 640, 252, 690, 258); g.bezierCurveTo(730, 246, 770, 262, 800, 276); g.bezierCurveTo(820, 286, 840, 292, 860, HORIZ); g.closePath(); g.fill();
    g.fillStyle = "#6c97b5"; g.beginPath(); g.moveTo(640, HORIZ); g.quadraticCurveTo(700, 266, 780, 284); g.lineTo(800, HORIZ); g.closePath(); g.fill();
    // pueblo blanco en la ladera
    for (let i = 0; i < 16; i++) {
      const x = 630 + i * 10 + 6 * hash(i + 3), y = 272 + 12 * hash(i + 9) + Math.abs(i - 7) * 1.4, w = 7 + 4 * hash(i + 1), h = 5 + 3 * hash(i + 2);
      g.fillStyle = "#f4f7fa"; g.fillRect(x, y, w, h); g.fillStyle = "rgba(90,120,150,0.5)"; g.fillRect(x + w - 2, y, 2, h);
    }
    g.fillStyle = "#f4f7fa"; g.fillRect(700, 254, 6, 18); g.beginPath(); g.arc(703, 254, 5, Math.PI, 0); g.fill();
    g.restore();
  }
  function mar(g) {
    g.save();
    const m = g.createLinearGradient(0, HORIZ, 0, BAL1);
    m.addColorStop(0, "#1a6cae"); m.addColorStop(0.5, "#2588c6"); m.addColorStop(1, "#3aa6d8");
    g.fillStyle = m; g.fillRect(-40, HORIZ, W + 80, BAL1 - HORIZ + 10);
    g.fillStyle = "rgba(255,255,255,0.6)"; g.fillRect(-40, HORIZ, W + 80, 1.5);
    // camino de luz del sol en el agua
    const cam = g.createLinearGradient(0, HORIZ, 0, BAL1); cam.addColorStop(0, "rgba(255,255,230,0.55)"); cam.addColorStop(1, "rgba(255,255,230,0.1)");
    g.fillStyle = cam; g.beginPath(); g.moveTo(110, HORIZ); g.lineTo(150, HORIZ); g.lineTo(260, BAL1 + 10); g.lineTo(40, BAL1 + 10); g.closePath(); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 1.4;
    for (let i = 0; i < 46; i++) { const y = HORIZ + 6 + 110 * hash(i + 40) ** 1.4, x = -20 + (W + 40) * hash(i + 41), w = 8 + 22 * (y - HORIZ) / 110;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.stroke(); }
    g.restore();
  }
  function balaustrada(g) {
    g.save();
    const yT = BAL0, yB = BAL1;
    // pasamanos
    g.fillStyle = "#fbf7ee"; g.fillRect(-40, yT, W + 80, 18);
    g.fillStyle = "rgba(200,180,150,0.6)"; g.fillRect(-40, yT + 15, W + 80, 4);
    g.fillStyle = "rgba(255,255,255,0.9)"; g.fillRect(-40, yT, W + 80, 3);
    g.strokeStyle = "rgba(90,70,50,0.6)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-40, yT + 19); g.lineTo(W + 40, yT + 19); g.stroke();
    // zócalo
    g.fillStyle = "#f2ebdc"; g.fillRect(-40, yB - 14, W + 80, 14);
    g.fillStyle = "rgba(180,150,110,0.55)"; g.fillRect(-40, yB - 3, W + 80, 3);
    // balaustres en forma de jarrón
    for (let x = -24; x < W + 40; x += 34) {
      if (x % 340 === 316 - 24 * 0) { /* pilar */ }
      const cx = x + 17, y0 = yT + 19, y1 = yB - 14, h = y1 - y0;
      g.beginPath(); g.moveTo(cx - 6, y0);
      g.bezierCurveTo(cx - 6, y0 + h * 0.15, cx - 14, y0 + h * 0.35, cx - 13, y0 + h * 0.62);
      g.bezierCurveTo(cx - 12, y0 + h * 0.82, cx - 7, y0 + h * 0.86, cx - 9, y1);
      g.lineTo(cx + 9, y1); g.bezierCurveTo(cx + 7, y0 + h * 0.86, cx + 12, y0 + h * 0.82, cx + 13, y0 + h * 0.62);
      g.bezierCurveTo(cx + 14, y0 + h * 0.35, cx + 6, y0 + h * 0.15, cx + 6, y0); g.closePath();
      const gr = g.createLinearGradient(cx - 13, 0, cx + 13, 0); gr.addColorStop(0, "#fffdf6"); gr.addColorStop(0.55, "#efe6d4"); gr.addColorStop(1, "#cbbb9e");
      g.fillStyle = gr; g.fill(); g.strokeStyle = "rgba(110,90,60,0.45)"; g.lineWidth = 1.2; g.stroke();
    }
    // pilares cada pocos balaustres
    for (const x of [236, 576, 916]) {
      g.fillStyle = "#fbf7ee"; g.fillRect(x - 20, yT - 8, 40, yB - yT + 8);
      g.fillStyle = "rgba(190,170,140,0.5)"; g.fillRect(x + 10, yT - 8, 10, yB - yT + 8);
      g.fillStyle = "#fffdf7"; g.fillRect(x - 24, yT - 14, 48, 8);
      g.strokeStyle = "rgba(90,70,50,0.55)"; g.lineWidth = 1.5; g.strokeRect(x - 20, yT - 8, 40, yB - yT + 8);
    }
    g.restore();
  }
  function suelo(g) {
    g.save();
    const y0 = BAL1, y1 = H + 60, fx = 512, fy = 180;
    const base = g.createLinearGradient(0, y0, 0, y1); base.addColorStop(0, "#d37a52"); base.addColorStop(1, "#b9603c");
    g.fillStyle = base; g.fillRect(-40, y0, W + 80, y1 - y0);
    // baldosas en perspectiva
    g.strokeStyle = "rgba(120,52,28,0.55)"; g.lineWidth = 1.6;
    let y = y0, hy = 10;
    const filas = [];
    while (y < y1) { filas.push(y); y += hy; hy *= 1.22; }
    filas.forEach((yy, i) => { g.globalAlpha = 0.5 + 0.5 * i / filas.length; g.beginPath(); g.moveTo(-40, yy); g.lineTo(W + 40, yy); g.stroke(); });
    g.globalAlpha = 1;
    for (let i = -30; i <= 30; i++) { const xb = fx + i * 70; g.beginPath(); g.moveTo(lerp(fx, xb, (y0 - fy) / (y1 - fy)), y0); g.lineTo(xb, y1); g.stroke(); }
    // matices de barro
    for (let i = 0; i < 70; i++) { const x = -20 + (W + 40) * hash(i + 300), yy = y0 + (y1 - y0) * hash(i + 301) ** 1.3;
      g.fillStyle = `rgba(${hash(i) > 0.5 ? "255,190,150" : "140,60,30"},0.12)`; g.beginPath(); g.ellipse(x, yy, 26 + 30 * hash(i + 2), 5 + 6 * hash(i + 3), 0, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "rgba(255,230,190,0.28)"; g.fillRect(-40, y0, W + 80, 3);
    g.restore();
  }
  function buganvilla(g, detras) {
    g.save();
    if (detras) {
      // muro blanco de la izquierda con la buganvilla cayendo
      g.fillStyle = "#f8f3e8"; g.fillRect(-40, -60, 92, BAL1 + 60);
      g.fillStyle = "rgba(200,180,150,0.45)"; g.fillRect(40, -60, 12, BAL1 + 60);
      g.strokeStyle = "rgba(90,70,50,0.5)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(52, -60); g.lineTo(52, BAL1); g.stroke();
      return g.restore();
    }
    const flores = ["#e0287a", "#f0499a", "#c41a66", "#ff6fb4"];
    for (let i = 0; i < 70; i++) {
      const a = hash(i + 700), r = hash(i + 701);
      const x = -30 + 140 * a * (1 - 0.6 * r), y = -40 + 250 * r * r + 30 * a;
      if (hash(i + 704) < 0.3) { g.fillStyle = "#3f7d34"; g.beginPath(); g.ellipse(x, y, 10, 6, a * 3, 0, Math.PI * 2); g.fill(); continue; }
      g.fillStyle = flores[i % 4]; g.beginPath(); g.ellipse(x, y, 9 + 5 * hash(i + 702), 7 + 4 * hash(i + 703), a * 2, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = "rgba(255,220,240,0.5)";
    for (let i = 0; i < 18; i++) { const x = -20 + 120 * hash(i + 760), y = -30 + 220 * hash(i + 761) ** 2; g.beginPath(); g.arc(x, y, 2.4, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  function parasol(g) {
    g.save();
    const x = 912, top = 118;
    // sombra del parasol en el suelo
    g.fillStyle = "rgba(90,30,10,0.22)"; g.beginPath(); g.ellipse(x + 30, 520, 150, 22, 0, 0, Math.PI * 2); g.fill();
    // mesita blanca con dos limonadas
    const ym = 470;
    g.strokeStyle = "#f4f1ea"; g.lineWidth = 7; g.beginPath(); g.moveTo(x - 4, ym); g.lineTo(x - 4, 548); g.stroke();
    g.beginPath(); g.moveTo(x - 34, 548); g.lineTo(x + 26, 548); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 8, ym); g.lineTo(x - 8, 545); g.stroke();
    g.fillStyle = "#fbfaf6"; g.beginPath(); g.ellipse(x - 4, ym, 64, 12, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 2.2; g.stroke();
    g.fillStyle = "#e6e1d6"; g.fillRect(x - 68, ym, 128, 5);
    for (const [dx, h] of [[-30, 34], [18, 30]]) {
      const bx = x + dx, by = ym - 4;
      g.fillStyle = "rgba(255,240,140,0.85)"; g.beginPath(); g.moveTo(bx - 9, by - h); g.lineTo(bx + 9, by - h); g.lineTo(bx + 7, by); g.lineTo(bx - 7, by); g.closePath(); g.fill();
      g.fillStyle = "rgba(255,255,255,0.55)"; g.fillRect(bx - 6, by - h + 3, 3, h - 6);
      g.strokeStyle = TINTA; g.lineWidth = 1.6; g.stroke();
      g.fillStyle = "#f5d33a"; g.beginPath(); g.arc(bx + 8, by - h, 6, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#a88a10"; g.lineWidth = 1.2; g.stroke();
      g.strokeStyle = "#ff4f7a"; g.lineWidth = 2.4; g.beginPath(); g.moveTo(bx - 2, by - h + 4); g.lineTo(bx - 8, by - h - 16); g.lineTo(bx - 14, by - h - 18); g.stroke();
    }
    // silla blanca
    const sx = x + 70;
    g.strokeStyle = "#f6f3ec"; g.lineWidth = 5;
    g.beginPath(); g.moveTo(sx - 18, 552); g.lineTo(sx - 14, 498); g.moveTo(sx + 18, 552); g.lineTo(sx + 14, 498); g.moveTo(sx + 16, 498); g.lineTo(sx + 20, 432); g.stroke();
    g.fillStyle = "#fbfaf6"; g.beginPath(); g.ellipse(sx, 498, 26, 7, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.stroke();
    g.strokeStyle = "#f6f3ec"; g.lineWidth = 4; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(sx + 2, 446 + i * 13); g.lineTo(sx + 20, 444 + i * 13); g.stroke(); }
    // mástil
    g.strokeStyle = "#dcd6ca"; g.lineWidth = 7; g.beginPath(); g.moveTo(x - 4, top + 20); g.lineTo(x - 4, ym - 8); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x - 8, top + 30); g.lineTo(x - 8, ym - 10); g.stroke();
    // lona de rayas turquesa y blanca, con festón
    const L = 168, n = 8;
    for (let i = 0; i < n; i++) {
      const a0 = -L + i * 2 * L / n, a1 = a0 + 2 * L / n;
      g.fillStyle = i % 2 ? "#fbfbf5" : "#16a5a5";
      g.beginPath(); g.moveTo(x - 4, top - 8); g.lineTo(x + a0, top + 52 - 6 * Math.abs(a0) / L); g.quadraticCurveTo(x + (a0 + a1) / 2, top + 70, x + a1, top + 52 - 6 * Math.abs(a1) / L); g.closePath(); g.fill();
    }
    g.strokeStyle = TINTA; g.lineWidth = 2.2;
    g.beginPath(); g.moveTo(x - 4, top - 8); g.lineTo(x - L, top + 46);
    for (let i = 0; i < n; i++) { const a0 = -L + i * 2 * L / n, a1 = a0 + 2 * L / n; g.quadraticCurveTo(x + (a0 + a1) / 2, top + 70, x + a1, top + 52 - 6 * Math.abs(a1) / L); }
    g.lineTo(x - 4, top - 8); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.moveTo(x - 4, top - 6); g.lineTo(x - 90, top + 40); g.lineTo(x - 60, top + 44); g.closePath(); g.fill();
    g.fillStyle = "#dcd6ca"; g.beginPath(); g.arc(x - 4, top - 10, 6, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
  }
  function limonero(g, x, yb) {
    g.save();
    g.fillStyle = "rgba(90,30,10,0.25)"; g.beginPath(); g.ellipse(x + 10, yb + 4, 70, 10, 0, 0, Math.PI * 2); g.fill();
    // tronco
    g.strokeStyle = "#7a5634"; g.lineWidth = 10; g.beginPath(); g.moveTo(x, yb - 80); g.quadraticCurveTo(x - 6, yb - 160, x + 4, yb - 230); g.stroke();
    // copa
    for (let i = 0; i < 40; i++) {
      const a = hash(i + 900) * Math.PI * 2, r = 70 * Math.sqrt(hash(i + 901));
      g.fillStyle = ["#2f7a32", "#3d9a3a", "#256a2b", "#4aa844"][i % 4];
      g.beginPath(); g.ellipse(x + Math.cos(a) * r * 1.1, yb - 270 + Math.sin(a) * r * 0.8, 16, 9, a, 0, Math.PI * 2); g.fill();
    }
    for (let i = 0; i < 9; i++) { const a = hash(i + 950) * Math.PI * 2, r = 55 * Math.sqrt(hash(i + 951));
      const lx = x + Math.cos(a) * r, ly = yb - 268 + Math.sin(a) * r * 0.7;
      g.fillStyle = "#ffd92e"; g.beginPath(); g.ellipse(lx, ly, 8, 6, 0.3, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#b08a10"; g.lineWidth = 1.2; g.stroke();
      g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.arc(lx - 3, ly - 2, 2, 0, Math.PI * 2); g.fill(); }
    // maceta de barro
    g.fillStyle = "#c4623a"; g.beginPath(); g.moveTo(x - 44, yb - 84); g.lineTo(x + 44, yb - 84); g.lineTo(x + 34, yb); g.lineTo(x - 34, yb); g.closePath(); g.fill();
    g.fillStyle = "#d8774c"; g.fillRect(x - 50, yb - 96, 100, 14);
    g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(x - 50, yb - 96, 100, 14);
    g.beginPath(); g.moveTo(x - 44, yb - 82); g.lineTo(x - 34, yb); g.lineTo(x + 34, yb); g.lineTo(x + 44, yb - 82); g.stroke();
    g.fillStyle = "rgba(255,210,170,0.3)"; g.fillRect(x - 40, yb - 80, 12, 74);
    g.restore();
  }

  /* ---------- efectos ---------- */
  function estrella4(g, x, y, r, a, rot = 0, col = "#ffffff") {
    if (a <= 0.01) return;
    g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = a;
    const hal = g.createRadialGradient(0, 0, 0, 0, 0, r * 1.3); hal.addColorStop(0, "rgba(255,255,230,0.9)"); hal.addColorStop(1, "rgba(255,255,230,0)");
    g.fillStyle = hal; g.beginPath(); g.arc(0, 0, r * 1.3, 0, Math.PI * 2); g.fill();
    g.fillStyle = col; g.beginPath();
    for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.16 : r, an = i * Math.PI / 4; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
    g.closePath(); g.fill();
    g.restore();
  }
  // ¡ting!: el destello recorre el cristal cercano
  function destello(g, t, gf, t0) {
    const u = fase(t, t0 - 0.06, t0 + 0.34); if (u <= 0 || u >= 1 || !gf) return;
    const q = geo(gf.E, gf.o);
    const loc = { x: lerp(q.nc.x - q.w * 0.3, q.nc.x + q.w * 0.3, u), y: q.nc.y - q.h * lerp(0.3, 0.05, u) };
    const p = apl(gf.A, loc), a = Math.sin(Math.PI * u);
    estrella4(g, p.x, p.y, 7 + 13 * a, a, u * 1.2);
  }
  // el sol: brillos que laten en el mar y reflejos de lente (en pantalla)
  function brillosMar(g, t) {
    g.save();
    for (let i = 0; i < 26; i++) {
      const x = 30 + 300 * hash(i + 60) + (i % 3) * 210, y = HORIZ + 8 + 100 * hash(i + 61) ** 1.6;
      const a = Math.max(0, Math.sin(t * (2.2 + 2 * hash(i + 62)) + i * 1.7)) ** 6;
      if (a < 0.05) continue;
      g.globalAlpha = a; g.fillStyle = "#ffffff";
      const r = 2 + 3 * hash(i + 63);
      g.beginPath(); g.moveTo(x - r * 2.2, y); g.lineTo(x, y - r * 0.5); g.lineTo(x + r * 2.2, y); g.lineTo(x, y + r * 0.5); g.closePath(); g.fill();
    }
    g.restore();
  }
  function velero(g, t) {
    const x = 470 + 9 * t, y = HORIZ + 4, b = Math.sin(t * 1.4) * 1.2;
    g.save(); g.translate(x, y + b);
    g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(0, -2); g.lineTo(0, -30); g.lineTo(14, -2); g.closePath(); g.fill();
    g.fillStyle = "#e9f2fa"; g.beginPath(); g.moveTo(-2, -4); g.lineTo(-2, -24); g.lineTo(-11, -4); g.closePath(); g.fill();
    g.fillStyle = "#2c3e5a"; g.beginPath(); g.moveTo(-13, -2); g.lineTo(17, -2); g.lineTo(13, 3); g.lineTo(-9, 3); g.closePath(); g.fill();
    g.restore();
  }
  function reflejosSol(g, cam, t) {
    // posición del sol en pantalla y eje del reflejo por el centro
    const sx = (128 - cam.x) * cam.k + W / 2, sy = (58 - cam.y) * cam.k + H / 2;
    const cx = W / 2, cy = H / 2, dx = cx - sx, dy = cy - sy;
    const late = 0.85 + 0.15 * Math.sin(t * 1.3);
    g.save(); g.globalCompositeOperation = "lighter";
    const rayo = g.createRadialGradient(sx, sy, 0, sx, sy, 150); rayo.addColorStop(0, "rgba(255,255,240,0.55)"); rayo.addColorStop(1, "rgba(255,255,240,0)");
    g.fillStyle = rayo; g.beginPath(); g.arc(sx, sy, 150, 0, Math.PI * 2); g.fill();
    const yH = (HORIZ - cam.y) * cam.k + H / 2;
    g.save(); g.beginPath(); g.rect(0, 0, W, yH); g.clip();
    for (const [k, r, col, al] of [[0.45, 26, "255,220,140", 0.1], [0.7, 12, "180,255,220", 0.12], [1.1, 40, "140,190,255", 0.07], [1.35, 18, "255,170,120", 0.1], [1.7, 60, "200,160,255", 0.05]]) {
      const x = sx + dx * k, y = sy + dy * k;
      g.fillStyle = `rgba(${col},${al * late})`;
      g.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.3; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); g.fill();
    }
    g.restore();
    // rayos del sol
    g.strokeStyle = `rgba(255,255,230,${0.18 * late})`; g.lineWidth = 3;
    for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 + t * 0.05, r0 = 34, r1 = 95 + 25 * Math.sin(t * 2 + i);
      g.beginPath(); g.moveTo(sx + Math.cos(a) * r0, sy + Math.sin(a) * r0); g.lineTo(sx + Math.cos(a) * r1, sy + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // el destello que deslumbra a Guillermo: un rayo blanco desde el cristal de Kiriku
  function rayoDeslumbra(g, t, gfK, pG) {
    const k = campana(t, T.kBrillo - 0.02, T.kBrillo + 0.3); if (k <= 0.01 || !gfK) return;
    const q = geo(gfK.E, gfK.o), a = apl(gfK.A, q.nc), b = G.aPantalla(pG, G.cabeza(pG).a({ x: 800, y: 580 }));
    const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    g.save(); g.globalAlpha = 0.55 * k;
    const gr = g.createLinearGradient(a.x, a.y, b.x, b.y); gr.addColorStop(0, "rgba(255,255,240,0.9)"); gr.addColorStop(1, "rgba(255,255,240,0.15)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(a.x + nx * 2, a.y + ny * 2); g.lineTo(b.x + nx * 16, b.y + ny * 16); g.lineTo(b.x - nx * 16, b.y - ny * 16); g.lineTo(a.x - nx * 2, a.y - ny * 2); g.closePath(); g.fill();
    g.restore();
  }
  // rayitas de golpe de cabeza y de sorpresa
  function rayitas(g, x, y, k, ang, n = 3, col = "#ffffff") {
    if (k <= 0.01) return;
    g.save(); g.globalAlpha = k; g.strokeStyle = col; g.lineWidth = 2.6; g.lineCap = "round";
    for (let i = 0; i < n; i++) { const a = ang + (i - (n - 1) / 2) * 0.42, r0 = 14, r1 = 14 + 12 * k;
      g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  // líneas de giro alrededor de las gafas que vuelan
  function vueloLineas(g, t, gf) {
    if (!gf || gf.capa !== "aire") return;
    const k = campana(t, T.vuela, T.atrapa) + campana(t, T.gLanza, T.gNariz);
    const c = apl(gf.A, { x: 0, y: 0 });
    g.save(); g.globalAlpha = 0.6 * k; g.strokeStyle = "#ffffff"; g.lineWidth = 2; g.lineCap = "round";
    for (let i = 0; i < 2; i++) { const a0 = t * 14 + i * Math.PI; g.beginPath(); g.arc(c.x, c.y, 26, a0, a0 + 1.1); g.stroke(); }
    g.restore();
  }

  /* ---------- cámara ---------- */
  const PLANOS = [
    [0, 1.0, 512, 300], [0.9, 1.0, 512, 300], [1.6, 1.16, 598, 334], [4.1, 1.16, 598, 334], [4.7, 1.14, 462, 334],
    [7.7, 1.14, 462, 334], [8.2, 1.06, 512, 318], [9.5, 1.06, 512, 318], [10.15, 1.18, 512, 340], [12.5, 1.18, 512, 340],
    [13.1, 1.08, 512, 322], [DUR, 1.08, 512, 322]
  ];
  function camara(t) {
    let i = 0; while (i < PLANOS.length - 2 && t > PLANOS[i + 1][0]) i++;
    const a = PLANOS[i], b = PLANOS[i + 1], k = suave(fase(t, a[0], b[0]));
    const kk = lerp(a[1], b[1], k), x = lerp(a[2], b[2], k), y = lerp(a[3], b[3], k);
    const mx = W / 2 / kk, my = H / 2 / kk;
    return { k: kk, x: clamp(x, mx - 40, W + 40 - mx), y: clamp(y, my - 60, H + 60 - my) };
  }

  const pose = t => ({ g: poseG(t), k: poseK(t) });
  class GuillermoKirikuGafas extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !KI.listo()) return;
      if (!fondo) fondo = creaFondo();
      const pG = poseG(t), pK = poseK(t);
      const luz = tramo(t, NEGRO_INICIO, 0.75, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const BASE = g.getTransform();
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      MATRIZ = g.getTransform();
      g.drawImage(fondo, -40, -60);
      velero(g, t);
      brillosMar(g, t);
      g.save(); g.setTransform(BASE); reflejosSol(g, cam, t); g.restore();
      // sombras cortas (sol alto a la izquierda)
      g.save(); g.fillStyle = "rgba(90,30,10,0.3)";
      g.beginPath(); g.ellipse(pG.x + 14, SUELO + 3, 62, 9, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pK.x + 14, SUELO + 3, 60, 9, 0, 0, Math.PI * 2); g.fill(); g.restore();
      // gafas: en la cara (debajo de los brazos), en la mano (debajo de los dedos) o en el aire
      const gK = gafasK(t, pK), gG = gafasG(t, pG);
      if (t >= T.kToca) pK.capaTronco = gg => tapaCuello(gg);
      if (gK && gK.capa === "cara") pK.capaCabeza = gg => dibujaGafas(gg, gK);
      if (gK && gK.capa === "manoK") pK.manoCerca.objeto = gg => dibujaGafas(gg, gK);
      if (gG && gG.capa === "cara") pG.capaCabeza = gg => dibujaGafas(gg, gG);
      if (gG && gG.capa === "manoG") pG.manoCerca.objeto = gg => dibujaGafas(gg, gG);
      G.dibujar(g, pG, t);
      KI.dibujar(g, pK, t);
      if (gG && gG.capa === "aire") { vueloLineas(g, t, gG); dibujaGafas(g, gG); }
      // ¡ting!
      if (gK && gK.capa === "cara") { destello(g, t, gK, T.kBrillo); destello(g, t, gK, T.kBrillo2); }
      rayoDeslumbra(g, t, gK, pG);
      // rayitas: cabezazo de Kiriku, susto de Guillermo, aterrizaje en la nariz
      const HK = KI.aPantalla(pK, KI.cabeza(pK).a({ x: 700, y: 220 })), HGc = G.aPantalla(pG, G.cabeza(pG).a({ x: 760, y: 330 }));
      rayitas(g, HK.x, HK.y, campana(t, T.kFlick0 + 0.08, T.kFlick1 + 0.2), -0.6);
      rayitas(g, HGc.x, HGc.y, campana(t, T.vuela, T.vuela + 0.35), -1.9, 3);
      rayitas(g, HGc.x, HGc.y, campana(t, T.gNariz, T.gNariz + 0.3), -1.6, 3);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00081", nombre: "Guillermo y Kiriku · Las gafas de sol", crear: () => new GuillermoKirikuGafas() });
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
  // diagnóstico: puntos de las gafas en pantalla (para comprobar que no saltan)
  function puntos(t) {
    const pG = poseG(t), pK = poseK(t), o = {};
    for (const [n, gf] of [["g", gafasG(t, pG)], ["k", gafasK(t, pK)]]) {
      if (!gf) continue; const q = geo(gf.E, gf.o);
      o[n] = [apl(gf.A, q.nc), apl(gf.A, q.fc), apl(gf.A, q.fin)].map(v => [Math.round(v.x * 10) / 10, Math.round(v.y * 10) / 10]);
    }
    return o;
  }
  window.__A2D_00081 = { pose, poseG, poseK, T, DUR, diag, puntos };
})();
