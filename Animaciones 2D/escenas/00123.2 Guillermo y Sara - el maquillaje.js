"use strict";
/* 00123.2 · Guillermo y Sara · El delineado
 *
 * Negro → el camerino de una sala de conciertos, de noche: pared de ladrillo oscuro con carteles sin
 * letras (rayo, estrella, guitarra), una guirnalda de bombillas, una guitarra eléctrica en su soporte,
 * un amplificador y la puerta del camerino con su estrella dorada; en la pared de la izquierda (en
 * perspectiva) un espejo de camerino rodeado de bombillas y una repisa con pintalabios, polvera,
 * bote de brochas y laca; suelo de tablas.
 *
 * Sara se pinta la raya del ojo en el espejo (se la ve también reflejada): boca entreabierta de
 * concentración, el lápiz recorre el párpado y… ¡un solo golpe de muñeca! rabillo perfecto (ting).
 * Guillermo, detrás, alucina («ooh»), se acerca, señala el lápiz y pone ojitos de cachorro. Sara se
 * gira, se encoge de hombros, se pasa el lápiz a la otra mano y le llama con el dedo. Él se agacha,
 * cierra un ojo; ella empieza la raya… le pica la nariz: «ah…», «ah…», ¡ACHÍS! — el lápiz le cruza la
 * mejilla hasta la oreja. Silencio. Sara mira la raya. Intenta arreglarlo: garabatea alrededor de un
 * ojo, luego del otro para igualar, difumina… y le deja unos ojos de mapache. Mira a cámara. Le señala
 * el espejo: Guillermo se ve, se asusta… le encanta, y posa de rockero (cuernos con las dos manos,
 * lengua fuera, cabeceando) — también en el reflejo. Sara mira a cámara impasible y sonríe de lado → negro.
 *
 * Todo depende de `t` (determinista). El maquillaje se pinta en coordenadas del retrato de cada cabeza
 * (capaCabeza) siguiendo el párpado real; la punta del lápiz se calcula en pantalla con la misma
 * transformación de la cabeza, así toca exactamente la raya. El reflejo es el mismo muñeco dibujado
 * con una transformación de espejo recortada al cristal.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, mezcla, hash, campana } = M2;
  const G = Guillermo, Sa = SaraSaez;
  const DUR = 14.6;
  const TINTA = "#0b0a0e", TAU = Math.PI * 2;

  /* ---------- guion (s) ---------- */
  const T = {
    // A · Sara se delinea en el espejo
    sAcerca: 0.45, sListo: 1.12, trazoS0: 1.22, trazoS1: 1.9, flick0: 1.98, flick1: 2.1, ting: 2.13, sAdmira: 2.3, gOoh: 2.36,
    // B · Guillermo quiere probar
    sMira: 2.98, gAnda0: 2.9, gAnda1: 3.5, gSenala: 3.42, gRuega: 3.86, sGira0: 3.78, sGira1: 4.08, sEncoge: 4.12,
    sLlama: 4.36, sLlamaFin: 4.86, pasa0: 4.86, pasa: 5.0, pasa1: 5.08, gAnda2: 4.6, gAnda3: 5.04, gInclina0: 4.98, gInclina1: 5.42,
    // C · la raya
    lapizG0: 5.24, trazoG0: 5.62, trazoG1: 6.28,
    // D · el estornudo
    tic: 6.3, ah1: 6.48, ah2: 6.8, achis: 7.05, achisFin: 7.13, gAbre: 7.3, sorbe0: 7.36, sorbe1: 7.72, sRetira: 7.48,
    // E · el arreglo
    gCierra: 7.78, arr1a: 7.9, arr1b: 8.42, mira1: 8.46, arr2a: 8.66, arr2b: 9.16, arr3a: 9.24, arr3b: 9.6, sAtras: 9.64, sCam1: 9.8, sCam1Fin: 10.12,
    // F · el espejo
    sPresenta: 10.14, gEndereza: 10.16, gEnderezado: 10.5, gMiraEsp: 10.5, gShock: 10.7, gGusta: 11.12, gRock0: 11.46, gRock1: 11.7,
    // G · Sara a cámara
    sCam2: 12.15, sSonrisa: 12.85,
    fin: 13.95
  };

  /* ---------- utilidades ---------- */
  const P = (x, y) => ({ x, y });
  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n] ?? a[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const rota = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const lienzo = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  const amort = (t, t0, f, w) => t < t0 ? 0 : Math.exp(-(t - t0) * f) * Math.sin((t - t0) * w);
  const parpadeo = (t, lista, d = 0.15) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + d); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };
  const camino = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
  const rutaP = (g, pts) => { g.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y); };
  // punto de una polilínea por índice fraccionario
  const enIdx = (arr, f) => { const i = clamp(Math.floor(f), 0, arr.length - 2), u = clamp(f - i, 0, 1); return mezcla(arr[i], arr[i + 1], u); };
  // punto de una polilínea por fracción de longitud
  function largos(pts) { const d = [0]; for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)); return d; }
  function enFrac(pts, d, f) {
    const s = d[d.length - 1] * clamp(f); let i = 1; while (i < d.length - 1 && d[i] < s) i++;
    const u = (s - d[i - 1]) / Math.max(1e-6, d[i] - d[i - 1]); return mezcla(pts[i - 1], pts[i], clamp(u));
  }
  function remuestrea(pts, n) {
    const Pp = pts.map(q => ({ x: q[0], y: q[1] })), d = largos(Pp), out = [];
    for (let k = 0; k < n; k++) out.push(enFrac(Pp, d, k / (n - 1)));
    return out;
  }
  // párpado actual (misma fórmula que el muñeco): Up (borde de arriba) y Dp (de abajo)
  function parpado(o, c, h, z) {
    const U = o.U, Dd = o.D, n = U.length, hz = Math.max(h, z);
    if (c <= 0.002) return { Up: U, Dp: Dd };
    const M = U.map((u, i) => {
      const k = Math.sin(Math.PI * i / (n - 1));
      const ab = { x: Dd[i].x, y: Dd[i].y + 3 * k };
      const me = { x: lerp(u.x, Dd[i].x, 0.55), y: lerp(u.y, Dd[i].y, 0.55) - 9 * k * (1 - z) + (i % 2 ? 3 : -3) * k * z };
      return mezcla(ab, me, hz);
    });
    return { Up: U.map((u, i) => mezcla(u, M[i], c)), Dp: Dd.map((d, i) => mezcla(d, M[i], c * hz)) };
  }

  /* ---------- caras (mismos campos para los dos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, esp: 0, mof: 0, wd: 0, wi: 0, rub: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: 1 },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* =====================================================================================
   * DISPOSICIÓN (px de pantalla, antes de la cámara)
   * ===================================================================================== */
  const S = 0.30, SUELO = 548;
  const XS0 = 250, XS1 = 226;                 // Sara: en el espejo; un pasito atrás al final
  const XG0 = 600, XG1 = 480, XG2 = 433;      // Guillermo: mirando; pidiendo; agachado
  const VP = P(520, 245), ESQ = 175, FONDO_Y = 455;   // punto de fuga, esquina y pie de la pared del fondo
  const yPared = (x, y0) => VP.y + (y0 - VP.y) * (VP.x - x) / (VP.x - 30);   // recta de la pared izquierda por (30, y0)
  // espejo (cristal) en la pared izquierda
  const CRISTAL = [P(30, 92), P(165, yPared(165, 92)), P(165, yPared(165, 352)), P(30, 352)];
  // reflejo: cada muñeco se dibuja con un espejo horizontal y menor, recortado al cristal
  const YR = 476;
  const reflejo = x => ({ xr: 118 - 0.2 * (x - 250), c: 0.8 - 0.0005 * (x - 250) });

  /* ---------- pies ---------- */
  function pieDe(apoyos, t, alto = 20) {
    let i = 0; for (let k = 0; k < apoyos.length; k++) if (apoyos[k][0] <= t) i = k;
    const [tf, xf] = apoyos[i];
    if (t <= tf || i === apoyos.length - 1) return { x: xf, h: 0, a: 0, u: 0 };
    const [tn,xn]=apoyos[i+1];
    if(xf===xn)return {x:xf,h:0,a:0,u:0};
    const u=clamp((t-tf)/(tn-tf));
    return { x: lerp(xf, xn, M2.suave5(u)), h: alto * Math.sin(Math.PI * u), a: 0.24 * Math.sin(Math.PI * u) - 0.07 * Math.sin(TAU * u), u };
  }
  function aPierna(Rg, p, w, lado) {
    const tob = Rg.SUELO - Rg.TOBILLO_ALTO;
    return { tob: P(Rg.aHoja(p, P(p.x+(w.x-p.x)/(p.sx??1), 0)).x, tob - (lado === "lejos" ? 10 : 0) - w.h / (p.s * (Rg.K || 1))), ang: w.a };
  }

  /* ---------- manos ---------- */
  // estado de una mano (hoja): x, y, mu (hacia el codo, en la hoja), a (ángulo del lápiz en la hoja), puno, dedos, dobla
  const PINZA = P(6.2, 15.5);
  function pista(lista, t, resuelve) {
    let c = resuelve(lista[0][2], t);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i];
      if (t <= t0) break;
      const k = (f || suave)(fase(t, t0, t1)), d = resuelve(obj, t);
      c = { x: lerp(c.x, d.x, k), y: lerp(c.y, d.y, k), mu: lerp(c.mu, d.mu, k), a: lerp(c.a, d.a, k), puno: lerp(c.puno, d.puno, k),
        dedos: mezclaD(c.dedos, d.dedos, k), dobla: k < 0.5 ? c.dobla : d.dobla };
    }
    return c;
  }
  // objetivos: {hoja}: punto del tronco; {pel}: respecto a la pelvis (hoja); {scr}: pantalla (punto o función);
  // {punta}: la punta del lápiz cae ahí (pantalla); {bols}: en el bolsillo
  function resolutor(Rg, p, escMano, LP) {
    const Tr = Rg.tronco(p), JK = Rg.JK, R_M = Rg.MUNECA_R * JK;
    return (o, t) => {
      const base = { mu: o.mu ?? -1.75, a: o.a ?? 0, puno: o.puno ?? 1, dedos: o.dedos || D(0.5, 0.5), dobla: o.dobla ?? -1 };
      let q;
      if (o.bols) {
        if (Rg.manoReposo) { const r = Rg.manoReposo(p, o.bols); return Object.assign(base, { x: r.x, y: r.y, mu: r.mu + (o.vuelta || 0), puno: 0, dedos: D(0, 0), dobla: r.dobla }); }
        const b0 = o.bols === "cerca" ? P(131, 652) : P(372, 648), off = { x: Math.cos(-1.75) * R_M, y: Math.sin(-1.75) * R_M };
        const b = Tr(P(b0.x - off.x, b0.y - off.y));
        return Object.assign(base, { x: b.x, y: b.y, mu: -1.75, puno: 0, dedos: D(0, 0), dobla: o.bols === "cerca" ? -1 : 1 });
      }
      if (o.hoja) q = Tr(o.hoja);
      else if (o.pel) q = P(p.pelvis.x + o.pel.x, p.pelvis.y + o.pel.y);
      else if (o.scr) { const s = typeof o.scr === "function" ? o.scr(t) : o.scr; q = Rg.aHoja(p, s); }
      else if (o.punta) {
        const s = typeof o.punta === "function" ? o.punta(t) : o.punta, h = Rg.aHoja(p, s);
        const pz = rota(P(PINZA.x * escMano, PINZA.y * escMano), base.mu + Math.PI / 2);
        q = P(h.x - pz.x * JK - Math.cos(base.a) * LP, h.y - pz.y * JK - Math.sin(base.a) * LP);
      }
      return Object.assign(base, { x: q.x, y: q.y });
    };
  }
  const manoDe = (c, objeto) => ({ x: c.x, y: c.y, ang: 0, mu: c.mu, puno: c.puno, dedos: c.dedos, dobla: c.dobla, objeto });
  // de la cabeza (retrato) a pantalla
  const cabPant = (Rg, p, q) => Rg.aPantalla(p, Rg.cabeza(p).a(q));

  /* ---------- el lápiz de ojos ---------- */
  // largo de la pinza a la punta y de la pinza al culo (px de pantalla)
  const LP_SCR = 17, LB_SCR = 19, AN_SCR = 3.2;
  const LP_S = LP_SCR / (S * Sa.K);          // en la hoja de Sara
  const ESC_MANO_S = 0.86;
  // dibujo en el marco del objeto de la mano (hoja / JK), saliendo de la pinza con el ángulo a
  function lapiz(g, st) {
    const k = 1 / (S * Sa.K * Sa.JK);
    const pz = rota(P(PINZA.x * ESC_MANO_S, PINZA.y * ESC_MANO_S), st.mu + Math.PI / 2);
    const L1 = LP_SCR * k, L0 = LB_SCR * k, w = AN_SCR * k / 2;
    g.save(); g.translate(pz.x, pz.y); g.rotate(st.a); g.translate((st.extra||0)/Sa.JK,0); g.lineJoin = "round"; g.lineCap = "round";
    // cuerpo negro lacado
    const xc = L1 * 0.62;
    g.fillStyle = "#17151b"; g.strokeStyle = TINTA; g.lineWidth = 0.9 * k;
    g.beginPath(); g.moveTo(-L0, -w); g.lineTo(xc, -w); g.lineTo(xc, w); g.lineTo(-L0, w); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.28)"; g.fillRect(-L0 + 1 * k, -w * 0.62, L0 + xc - 2 * k, w * 0.4);
    // anilla plateada y tapa del culo
    g.fillStyle = "#c9ccd4"; g.fillRect(-L0 + 3.2 * k, -w, 1.6 * k, 2 * w);
    g.fillStyle = "#2b2830"; g.beginPath(); g.ellipse(-L0, 0, 0.9 * k, w, 0, 0, TAU); g.fill();
    // madera afilada y mina negra
    g.fillStyle = "#e3c9a2"; g.beginPath(); g.moveTo(xc, -w); g.lineTo(L1 * 0.9, -w * 0.32); g.lineTo(L1 * 0.9, w * 0.32); g.lineTo(xc, w); g.closePath(); g.fill();
    g.strokeStyle = "rgba(60,40,20,0.8)"; g.lineWidth = 0.6 * k; g.stroke();
    g.fillStyle = "#050406"; g.beginPath(); g.moveTo(L1 * 0.88, -w * 0.38); g.lineTo(L1, -w * 0.08); g.lineTo(L1, w * 0.08); g.lineTo(L1 * 0.88, w * 0.38); g.closePath(); g.fill();
    g.restore();
  }

  /* =====================================================================================
   * MAQUILLAJE DE GUILLERMO (coordenadas del retrato de su cabeza)
   * ===================================================================================== */
  const OJO_G = {
    d: { U: remuestrea([[733, 551], [737, 541], [748, 541], [762, 545], [776, 550], [790, 556], [803, 561], [809, 566]], 14),
      D: remuestrea([[733, 556], [737, 566], [748, 573], [762, 577], [778, 583], [795, 589], [808, 592]], 14) },
    i: { U: remuestrea([[866, 603], [872, 597], [885, 598], [900, 602], [913, 606], [921, 611]], 14),
      D: remuestrea([[866, 608], [868, 624], [880, 630], [895, 635], [910, 638], [921, 637]], 14) }
  };
  // la raya de Sara: del lagrimal (13) hacia el rabillo, hasta el índice FIN_RAYA
  const FIN_RAYA = 4.6;
  // la raya del estornudo: del párpado a la oreja (retrato), con un temblor
  const LINEA = [P(718, 566), P(702, 573), P(690, 571), P(676, 580), P(662, 583), P(648, 590), P(634, 589), P(620, 597), P(606, 600), P(594, 606), P(584, 612)];
  // piel de la cara (para recortar los anillos y el manchurrón)
  const PIEL_CAB = [[806,850],[802,846],[766,842],[754,834],[746,834],[742,838],[734,826],[726,826],[718,814],[710,814],[704,808],[708,804],[702,798],[698,802],[690,798],[684,792],[682,782],[674,782],[662,774],[656,768],[660,764],[654,758],[650,762],[634,746],[630,746],[624,740],[624,732],[604,716],[608,712],[604,708],[604,692],[596,684],[596,668],[582,670],[570,654],[566,658],[556,648],[560,640],[558,638],[554,642],[544,632],[548,624],[532,604],[532,596],[528,592],[528,572],[532,568],[528,564],[532,560],[528,552],[540,536],[540,528],[548,516],[562,503],[570,499],[590,499],[624,532],[624,540],[630,550],[636,536],[632,532],[640,524],[640,516],[648,501],[676,477],[676,469],[684,461],[680,457],[690,447],[718,435],[734,423],[744,429],[728,461],[730,467],[762,451],[798,427],[806,431],[823,431],[839,443],[843,439],[851,439],[867,455],[875,455],[881,461],[869,481],[841,509],[843,511],[879,503],[903,487],[911,487],[917,493],[901,524],[893,532],[895,534],[931,514],[947,499],[955,503],[969,520],[965,596],[949,620],[953,624],[937,644],[937,652],[925,676],[909,732],[899,738],[877,764],[885,772],[875,782],[867,778],[861,788],[849,796],[825,832],[829,836],[819,846],[815,842]];

  // progreso del maquillaje en el tiempo
  function maquillajeG(t) {
    return {
      raya: suave(fase(t, T.trazoG0, T.trazoG1)),
      linea: salida(fase(t, T.achis, T.achisFin)),
      anD: 0.62 * suave(fase(t, T.arr1a, T.arr1b)) + 0.38 * suave(fase(t, T.arr3a, T.arr3b)),
      anI: 0.7 * suave(fase(t, T.arr2a, T.arr2b)) + 0.3 * suave(fase(t, T.arr3a, T.arr3b)),
      difumina: suave(fase(t, T.arr3a, T.arr3b))
    };
  }
  // anillo de mapache pintado una vez (retrato), con su textura de lápiz
  let ANILLOS = null;
  function creaAnillo(cx, cy, rx, ry, rot, semilla) {
    const pad = 34, w = Math.ceil(rx * 2 + pad * 2), h = Math.ceil(ry * 2 + pad * 2), c = lienzo(w, h), g = c.getContext("2d");
    g.translate(w / 2, h / 2); g.rotate(rot);
    // manchas difuminadas: más oscuro junto al ojo, borde irregular y deshilachado
    g.filter = "blur(7px)";
    for (let i = 0; i < 9; i++) {
      const a = hash(semilla + i * 2.3) * TAU, d = 0.18 * hash(semilla + i * 4.1);
      g.fillStyle = `rgba(28,20,30,${0.22 + 0.1 * hash(semilla + i)})`;
      g.beginPath(); g.ellipse(Math.cos(a) * rx * d, Math.sin(a) * ry * d, rx * (0.78 + 0.2 * hash(semilla + i * 6.7)), ry * (0.74 + 0.24 * hash(semilla + i * 8.9)), 0.3 * (hash(semilla + i * 9.3) - 0.5), 0, TAU); g.fill();
    }
    g.filter = "blur(4px)"; g.fillStyle = "rgba(14,10,16,0.55)";
    g.beginPath(); g.ellipse(0, 0, rx * 0.66, ry * 0.6, 0, 0, TAU); g.fill();
    // corrido hacia fuera por el rabillo
    g.fillStyle = "rgba(24,18,28,0.35)"; g.beginPath(); g.ellipse(-rx * 0.62, ry * 0.32, rx * 0.4, ry * 0.3, 0.5, 0, TAU); g.fill();
    // trazos de lápiz por dentro (garabatos)
    g.filter = "blur(0.8px)"; g.lineCap = "round";
    for (let i = 0; i < 26; i++) {
      const a = hash(semilla + i * 1.7) * TAU, r = 0.4 + 0.32 * hash(semilla + i * 3.1), l = 0.4 + 0.6 * hash(semilla + i * 5.3);
      g.strokeStyle = `rgba(12,9,14,${0.25 + 0.35 * hash(semilla + i)})`; g.lineWidth = 2 + 3 * hash(semilla + i * 7.7);
      g.beginPath(); g.ellipse(0, 0, rx * r, ry * r, 0, a, a + l); g.stroke();
    }
    g.filter = "none";
    // brillo de grafito
    g.strokeStyle = "rgba(170,160,190,0.16)"; g.lineWidth = 3;
    for (let i = 0; i < 5; i++) { const a = -2.5 + i * 0.22; g.beginPath(); g.ellipse(0, 0, rx * 0.56, ry * 0.52, 0, a, a + 0.15); g.stroke(); }
    return { c, x: cx - w / 2, y: cy - h / 2, w, h, cx, cy };
  }
  // manchurrón de la raya difuminada (retrato)
  function creaMancha() {
    const c = lienzo(260, 120), g = c.getContext("2d");
    g.translate(-560, -530); g.lineCap = "round"; g.lineJoin = "round";
    g.filter = "blur(6px)"; g.strokeStyle = "rgba(26,20,30,0.75)"; g.lineWidth = 26;
    g.beginPath(); g.moveTo(735, 566); for (const q of LINEA) g.lineTo(q.x, q.y); g.stroke();
    g.filter = "blur(2px)"; g.strokeStyle = "rgba(20,16,24,0.6)"; g.lineWidth = 12;
    g.beginPath(); g.moveTo(730, 568); for (const q of LINEA) g.lineTo(q.x + 2, q.y + 3); g.stroke();
    g.filter = "none";
    return c;
  }
  let MANCHA = null;
  function capaCabezaG(g, t, p) {
    const f = p.cara, fe = f.ojos.feliz || 0, ap = f.ojos.apretado || 0;
    const pd = parpado(OJO_G.d, f.ojos.d, fe, ap), pi = parpado(OJO_G.i, f.ojos.i, fe, ap);
    const mk = maquillajeG(t);
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    // el párpado cerrado del muñeco queda muy claro sobre la sombra del ojo: lo templamos
    for (const [o, pp, k] of [[OJO_G.d, pd, 0.32], [OJO_G.i, pi, 0.18]]) {
      const c = lado(f.ojos, o === OJO_G.d ? "d" : "i");
      if (c < 0.05) continue;
      g.fillStyle = `rgba(196,112,66,${k * c})`; g.beginPath(); rutaP(g, o.U); for (let i = 13; i >= 0; i--) g.lineTo(pp.Up[i].x, pp.Up[i].y); g.closePath(); g.fill();
    }
    // anillos y manchurrón: sobre la piel, sin tapar los ojos abiertos
    if (t > T.arr1a) {
      if (!ANILLOS) ANILLOS = { d: creaAnillo(768, 566, 66, 44, 0.3, 11), i: creaAnillo(893, 617, 50, 38, 0.24, 37) };
      if (!MANCHA) MANCHA = creaMancha();
      g.save(); g.beginPath(); camino(g, PIEL_CAB);
      for (const o of [pd, pi]) { rutaP(g, o.Up); for (let i = o.Dp.length - 1; i >= 0; i--) g.lineTo(o.Dp[i].x, o.Dp[i].y); g.closePath(); }
      g.clip("evenodd");
      g.save();g.globalAlpha=0.88-0.38*mk.difumina;pintaPasadas(g,t);g.restore();
      if (mk.difumina > 0.01) { g.globalAlpha = 0.9 * mk.difumina; g.drawImage(MANCHA, 560, 530); }
      for (const [A,k] of [[ANILLOS.d,tramo(t,T.arr3a,T.arr3a+0.13)],[ANILLOS.i,tramo(t,T.arr3a+0.12,T.arr3a+0.24)]]) {
        if (k <= 0.002) continue;
        const e = 0.55 + 0.37 * Math.min(1, k * 1.4);
        g.globalAlpha = 0.86 * Math.min(1, k * 1.25);
        g.drawImage(A.c, A.cx - A.w * e / 2, A.cy - A.h * e / 2, A.w * e, A.h * e);
      }
      g.restore();
    }
    // raya del ojo cercano (se mueve con el párpado)
    const UpD = pd.Up;
    if (mk.raya > 0.001) {
      const i1 = lerp(13, FIN_RAYA, mk.raya);
      g.strokeStyle = "#08070a"; g.lineWidth = 8.5;
      g.beginPath(); g.moveTo(UpD[13].x, UpD[13].y);
      for (let i = 12; i > i1; i--) g.lineTo(UpD[i].x, UpD[i].y);
      const q = enIdx(UpD, i1); g.lineTo(q.x, q.y); g.stroke();
    }
    // la raya del estornudo (del final de la raya a la oreja); se emborrona al difuminar
    if (mk.linea > 0.001) {
      const q0 = enIdx(UpD, FIN_RAYA), pts = [q0, ...LINEA], d = largos(pts), fin = enFrac(pts, d, mk.linea);
      g.globalAlpha = 1 - 0.55 * mk.difumina;
      g.strokeStyle = "#0a090c"; g.lineWidth = 9 - 1.5 * mk.linea;
      g.beginPath(); g.moveTo(q0.x, q0.y);
      const s = d[d.length - 1] * mk.linea;
      for (let i = 1; i < pts.length && d[i] < s; i++) g.lineTo(pts[i].x, pts[i].y);
      g.lineTo(fin.x, fin.y); g.stroke();
      g.globalAlpha = 1;
    }
    // ojos de mapache: raya gorda arriba y abajo en los dos ojos
    const kr=mk.difumina;
    if (kr > 0.01) {
      for (const [o, k] of [[pd, mk.anD], [pi, mk.anI]]) {
        if (k < 0.05) continue;
        g.globalAlpha = kr*Math.min(1, k * 1.5); g.strokeStyle = "#08070a";
        g.lineWidth = 5 + 3 * k; g.beginPath(); M2.curva(g, o.Up, false, 0.5); g.stroke();
        g.lineWidth = 3 + 2.5 * k; g.beginPath(); M2.curva(g, o.Dp, false, 0.5); g.stroke();
      }
      g.globalAlpha = 1;
    }
    g.restore();
    lenguaG(g, t, p.lenguaFuera || 0);
  }
  const lado = (oj, l) => oj[l] || 0;
  // lengua de rockero, fuera y hacia abajo
  function lenguaG(g, t, k) {
    if (k <= 0.01) return;
    g.save(); g.translate(806, 750); g.rotate(-0.08 + 0.06 * Math.sin(t * 9.4)); g.scale(1, k);
    g.lineJoin = "round";
    const forma = () => { g.beginPath(); g.moveTo(-24, -8); g.lineTo(24, -8); g.bezierCurveTo(28, 30, 26, 70, 2, 74); g.bezierCurveTo(-22, 74, -28, 34, -24, -8); g.closePath(); };
    forma(); g.fillStyle = "#ec7883"; g.fill();
    g.save(); forma(); g.clip(); g.fillStyle = "rgba(160,40,60,0.35)"; g.beginPath(); g.ellipse(14, 44, 14, 32, 0, 0, TAU); g.fill(); g.restore();
    forma(); g.lineWidth = 6; g.strokeStyle = TINTA; g.stroke();
    g.strokeStyle = "rgba(140,30,50,0.7)"; g.lineWidth = 3.5; g.beginPath(); g.moveTo(0, 4); g.quadraticCurveTo(2, 32, 0, 56); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.ellipse(-10, 24, 4, 10, 0.2, 0, TAU); g.fill();
    g.restore();
  }

  /* =====================================================================================
   * MAQUILLAJE DE SARA: su raya y el rabillo nuevo (retrato de Sara)
   * ===================================================================================== */
  const ALA = P(737, 336);          // punta del rabillo
  function rabillo(Up, k) {         // del borde del párpado a la punta: hasta k
    const a = Up[0], tip = mezcla(a, ALA, k);
    return { a, tip };
  }
  function capaCabezaS(g, t, p) {
    const f = p.cara, pd = parpado(Sa.OJOS.d, f.ojos.d, f.ojos.feliz || 0, f.ojos.apretado || 0);
    const Up = pd.Up, kr = suave(fase(t, T.trazoS0, T.trazoS1)), kf = salida(fase(t, T.flick0, T.flick1));
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    if (kr > 0.001) {
      const i1 = lerp(13, 0, kr);
      g.strokeStyle = "#060507"; g.lineWidth = 9;
      g.beginPath(); g.moveTo(Up[13].x, Up[13].y); for (let i = 12; i > i1; i--) g.lineTo(Up[i].x, Up[i].y);
      const q = enIdx(Up, i1); g.lineTo(q.x, q.y); g.stroke();
    }
    if (kf > 0.001) {
      const { a, tip } = rabillo(Up, kf), b = Up[3];
      g.fillStyle = "#060507"; g.beginPath(); g.moveTo(b.x, b.y - 3); g.lineTo(tip.x, tip.y); g.lineTo(a.x + 2, a.y + 6); g.closePath(); g.fill();
      g.strokeStyle = "#060507"; g.lineWidth = 4; g.stroke();
      // brillo de raya recién hecha
      if (kf >= 1) { g.strokeStyle = "rgba(255,255,255,0.4)"; g.lineWidth = 2; g.beginPath(); g.moveTo(lerp(b.x, ALA.x, 0.2), lerp(b.y, ALA.y, 0.2) - 1); g.lineTo(lerp(b.x, ALA.x, 0.7), lerp(b.y, ALA.y, 0.7)); g.stroke(); }
    }
    g.restore();
  }

  /* =====================================================================================
   * GUILLERMO (a la derecha, mira a la izquierda: espejo)
   * ===================================================================================== */
  const CARAS_G = {
    mira: E({ mx: 0.9, my: 0.05, c: 0.12, sd: 8, si: 8, sonr: 0.2 }),
    curioso: E({ mx: 0.95, my: -0.05, iris: 1.06, sd: 18, gd: 0.05, si: 20, gi: 0.05, abre: 0, ancho: 0.8, sonr: 0.12 }),
    ooh: E({ mx: 0.95, my: 0, iris: 1.14, sd: 28, gd: 0.12, si: 28, gi: 0.12, abre: 16, ancho: 0.42, sonr: 0, dientes: 0 }),
    quiere: E({ mx: 0.9, my: 0.15, iris: 1.12, sd: 22, gd: 0.1, si: 22, gi: 0.1, abre: 8, ancho: 0.95, sonr: 0.65 }),
    ruega: E({ mx: 0.85, my: -0.25, iris: 1.32, sd: 24, gd: -0.22, si: 24, gi: -0.22, abre: 0, ancho: 0.52, sonr: -0.3, mof: 0.25 }),
    guino: E({ mx: 0.95, my: -0.25, wd: 1, c: 0, sd: 2, si: 16, gi: 0.06, abre: 0, ancho: 0.7, sonr: 0.12 }),
    ah1: E({ mx: 0.6, my: -0.5, wd: 1, c: 0.5, iris: 0.92, sd: 18, si: 18, abre: 11, ancho: 0.62, sonr: -0.1, dientes: 0 }),
    ah2: E({ mx: 0.4, my: -0.7, wd: 1, c: 0.72, iris: 0.9, sd: 28, si: 28, abre: 19, ancho: 0.62, sonr: -0.15, dientes: 0 }),
    achis: E({ mx: 0.5, my: 0, c: 1, z: 1, sd: -6, gd: -0.1, si: -6, gi: -0.1, abre: 6, ancho: 1.1, sonr: -0.25 }),
    post: E({ mx: 0.5, my: 0.1, c: 0.25, iris: 0.82, sd: 14, si: 14, abre: 0, ancho: 0.7, sonr: 0 }),
    sorbe: E({ mx: 0.8, my: 0.2, c: 0.4, sd: 8, si: 8, abre: 0, ancho: 0.6, sonr: -0.05, mof: 0.3 }),
    confia: E({ mx: 0.8, my: 0, c: 1, sd: 10, si: 10, abre: 0, ancho: 0.95, sonr: 0.45 }),
    aguanta: E({ mx: 0.8, my: 0, c: 1, z: 0.45, sd: 4, si: 4, abre: 0, ancho: 0.8, sonr: 0.2, mof: 0.2 }),
    abre: E({ mx: 0.92, my: 0, c: 0, sd: 12, si: 12, abre: 0, sonr: 0.3 }),
    espejo: E({ mx: 1, my: -0.08, c: 0, sd: 16, si: 16, sonr: 0.2 }),
    shock: E({ mx: 1, my: -0.08, iris: 0.6, c: 0, sd: 34, gd: 0.2, si: 34, gi: 0.2, abre: 24, ancho: 0.62, sonr: -0.3 }),
    gusta: E({ mx: 1, my: 0, c: 0.6, h: 1, sd: 22, si: 22, abre: 16, ancho: 1.15, sonr: 1.0, rub: 0.5 }),
    rock: E({ mx: 0.6, my: -0.1, c: 0.15, iris: 1.12, sd: -2, gd: -0.14, si: 8, gi: -0.08, abre: 26, ancho: 0.98, sonr: 0.45, rub: 0.3 })
  };
  const GUION_CARA_G = [
    [0.6, 0.85, "curioso"], [T.gOoh, T.gOoh + 0.12, "ooh", salida], [2.95, 3.15, "quiere"], [T.gRuega, T.gRuega + 0.18, "ruega"],
    [T.gInclina0, T.gInclina0 + 0.2, "guino"], [T.ah1, T.ah1 + 0.14, "ah1"], [T.ah2, T.ah2 + 0.18, "ah2"], [T.achis, T.achis + 0.04, "achis", salida],
    [T.achisFin + 0.05, T.achisFin + 0.18, "post"], [T.sorbe0, T.sorbe0 + 0.15, "sorbe"], [T.gCierra - 0.05, T.gCierra + 0.12, "confia"],
    [T.sAtras + 0.12, T.sAtras + 0.3, "abre"], [T.gMiraEsp, T.gMiraEsp + 0.15, "espejo"], [T.gShock - 0.02, T.gShock + 0.18, "shock"],
    [T.gGusta, T.gGusta + 0.22, "gusta"], [T.gRock0 + 0.08, T.gRock1, "rock"]
  ];
  const CUERPOS_G = {
    inicio: { torso: 0.05, cab: 0.03, pel: 0 },
    curioso: { torso: 0.13, cab: 0.08, pel: 2 },
    ooh: { torso: -0.02, cab: -0.07, pel: -2 },
    anda: { torso: 0.07, cab: 0.02, pel: 0 },
    senala: { torso: 0.1, cab: 0.0, pel: 0 },
    ruega: { torso: 0.07, cab: 0.14, pel: 5 },
    inclina: { torso: 0.42, cab: 0.08, pel: 27 },
    ah1: { torso: 0.37, cab: -0.08, pel: 25 },
    ah2: { torso: 0.35, cab: -0.15, pel: 23 },
    achis: { torso: 0.47, cab: 0.26, pel: 29 },
    post: { torso: 0.42, cab: 0.1, pel: 27 },
    endereza: { torso: 0.0, cab: -0.04, pel: 0 },
    shock: { torso: -0.12, cab: -0.12, pel: -5 },
    gusta: { torso: 0.02, cab: 0.06, pel: 0 },
    rock: { torso: -0.14, cab: -0.2, pel: 15 }
  };
  const GUION_CUERPO_G = [
    [0.55, 0.95, "curioso"], [T.gOoh, T.gOoh + 0.15, "ooh", salida], [T.gAnda0, T.gAnda0 + 0.3, "anda"], [T.gSenala, T.gSenala + 0.2, "senala"],
    [T.gRuega, T.gRuega + 0.25, "ruega"], [T.gAnda2, T.gAnda2 + 0.3, "anda"], [T.gInclina0, T.gInclina1, "inclina"],
    [T.ah1, T.ah1 + 0.18, "ah1"], [T.ah2, T.ah2 + 0.2, "ah2"], [T.achis, T.achis + 0.05, "achis", salida], [T.achisFin + 0.05, T.achisFin + 0.5, "post"],
    [T.gEndereza, T.gEnderezado, "endereza"], [T.gShock - 0.03, T.gShock + 0.22, "shock"], [T.gGusta, T.gGusta + 0.25, "gusta"],
    [T.gRock0, T.gRock1, "rock", salida]
  ];
  // pies (pantalla): cerca detrás (derecha), lejos delante
  const PIES_G = {
    cerca: [[0, XG0 + 16], [T.gAnda0 + 0.32, XG0 + 16], [T.gAnda1, XG1 + 16], [T.gAnda2 + 0.24, XG1 + 16], [T.gAnda3, XG2 + 18], [T.gRock0, XG2 + 18], [T.gRock0 + 0.11, XG2 + 38]],
    lejos: [[0, XG0 - 22], [T.gAnda0, XG0 - 22], [T.gAnda0 + 0.32, XG1 - 22], [T.gAnda2, XG1 - 22], [T.gAnda2 + 0.24, XG2 - 26], [T.gRock0 + 0.11, XG2 - 26], [T.gRock1, XG2 - 52]]
  };
  const OFF_G = { cerca: 16, lejos: -22 };
  // cabeceo de rockero
  const cabeceo = t => tramo(t, T.gRock1 + 0.05, T.gRock1 + 0.25) * (1 - tramo(t, T.fin - 0.25, T.fin + 0.2));
  const cacheG = new Map();
  function poseG(t) {
    const k0 = t;
    if (cacheG.has(k0)) return cacheG.get(k0);
    if (cacheG.size > 8) cacheG.clear();
    const p = poseG0(t); cacheG.set(k0, p); return p;
  }
  function poseG0(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const respira = Math.sin(t * 2.3 + 0.4);
    const wC = pieDe(PIES_G.cerca, t), wL = pieDe(PIES_G.lejos, t);
    const x = ((wC.x - OFF_G.cerca) + (wL.x - OFF_G.lejos)) / 2;
    const paso = Math.max(Math.sin(Math.PI * wC.u), Math.sin(Math.PI * wL.u)) * (wC.u > 0 || wL.u > 0 ? 1 : 0);
    // ruega: botecitos de puntillas
    const bote = 3.5 * Math.max(0, Math.sin((t - T.gRuega) * 15)) * dentro(t, T.gRuega + 0.1, T.gRuega + 0.2, 4.36, 4.5);
    // cabeceo de rockero (a 2,6 golpes por segundo)
    const cb = cabeceo(t), onda = Math.sin((t - T.gRock1) * TAU * 2.6);
    // el estornudo: tic de nariz, la cabeza atrás y ¡latigazo!
    const tic = campana(t, T.tic, T.tic + 0.12);
    const lat = amort(t, T.achisFin, 9, 30);
    const p = {
      x, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true, piernas: {},
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + (b.pel - 4 * paso - bote + respira * 1.2 + 5 * cb * (onda + 1) / 2) / S },
      torso: b.torso + 0.04 * lat + 0.04 * cb * onda, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      cabeza: { ang: b.cab + 0.04 * tic * Math.sin(t * 60) + 0.1 * lat + 0.14 * cb * onda + 0.012 * Math.sin(t * 1.7), dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    p.piernas.cerca = aPierna(G, p, wC, "cerca"); p.piernas.lejos = aPierna(G, p, wL, "lejos");
    const ex = guion(GUION_CARA_G, CARAS_G, "mira", t);
    // tic: la nariz se arruga (mofletes) y el ojo abierto parpadea
    ex.mof += 0.4 * tic;
    // aguanta cada pasada del lápiz
    const pas = dentro(t, T.arr1a, T.arr1a + 0.1, T.arr1b - 0.1, T.arr1b) + dentro(t, T.arr2a, T.arr2a + 0.1, T.arr2b - 0.1, T.arr2b) + dentro(t, T.arr3a, T.arr3a + 0.1, T.arr3b - 0.1, T.arr3b);
    if (t > T.gCierra) { ex.z = Math.max(ex.z, 0.45 * pas); ex.mof += 0.2 * pas; ex.sonr -= 0.25 * pas; }
    p.cara = cara(ex, parpadeo(t, [1.7, 3.3, 7.42, 10.05, 12.6]));
    p.rojo = 0.2 * dentro(t, T.gGusta, T.gGusta + 0.2, T.fin, T.fin + 0.5);
    p.lenguaFuera = tramo(t, T.gRock0 + 0.12, T.gRock1 + 0.05);
    manosG(p, t);
    p.capaCabeza = (g, tt) => capaCabezaG(g, tt, p);
    return p;
  }
  /* ---------- manos de Guillermo (mu y posiciones en su hoja: mira a +x) ---------- */
  const PUNO = D(0, 0), ABIERTA = D(1, 1), RELAJ = D(0.55, 0.62, 0.56, 0.52, 0.48), SENALA = D(0.15, 1, 0, 0, 0),
    JUNTAS = D(0.45, 0.3, 0.25, 0.22, 0.2), CUERNOS = D(0, 1, 0, 0, 1), MUSLO = D(0.6, 0.75, 0.7, 0.66, 0.6), APRIETA = D(0.35, 0.3, 0.25, 0.22, 0.2);
  function manosG(p, t) {
    const r = resolutor(G, p, 1, 0);
    const cb = cabeceo(t), onda = Math.sin((t - T.gRock1) * TAU * 2.6);
    // nariz en pantalla (para limpiarse)
    const nariz = tt => { const q = cabPant(G, p, P(884, 700)); return P(q.x + 8 * Math.sin((tt - T.sorbe0) * 18) * dentro(tt, T.sorbe0 + 0.1, T.sorbe0 + 0.15, T.sorbe1 - 0.1, T.sorbe1), q.y + 6); };
    // brazos colgando al agacharse: la mano bajo el hombro, con un balanceo nervioso
    const cuelga = lado => tt => { const Tr = G.tronco(p), h = G.aPantalla(p, Tr(lado === "cerca" ? G.HOMBRO_C : G.HOMBRO)), L = (lado === "cerca" ? G.BRAZO_C_L : G.BRAZO_L) * S;
      return P(h.x + (lado === "cerca" ? 4 : -6) + 2 * Math.sin(tt * 2.1 + (lado === "cerca" ? 0 : 1.3)), h.y + L * 0.86); };
    const PL = [
      [0, 0, { hoja: P(322, 296), mu: 1.75, dedos: PUNO, dobla: 1 }],
      [T.gOoh, T.gOoh + 0.2, { hoja: P(360, 420), mu: 2.0, dedos: APRIETA, dobla: 1 }],
      [T.gAnda0, T.gAnda0 + 0.35, { hoja: P(330, 640), mu: -1.75, dedos: RELAJ, dobla: 1 }],
      [T.gSenala, T.gSenala + 0.18, { hoja: P(600, 400), mu: Math.PI + 0.05, dedos: SENALA, dobla: 1 }, salida],
      [T.gRuega - 0.05, T.gRuega + 0.15, { hoja: P(345, 312), mu: 2.15, dedos: JUNTAS, dobla: 1 }],
      [4.42, 4.66, { hoja: P(320, 650), mu: -1.75, dedos: RELAJ, dobla: 1 }],
      [T.gInclina0 + 0.05, T.gInclina1, { scr: cuelga("lejos"), mu: -1.5, dedos: RELAJ, dobla: 1 }],
      [T.sorbe0, T.sorbe0 + 0.12, { scr: nariz, mu: 1.6, dedos: D(0.5, 0.85, 0.85, 0.85, 0.8), dobla: 1 }],
      [T.sorbe1, T.sorbe1 + 0.2, { scr: cuelga("lejos"), mu: -1.5, dedos: RELAJ, dobla: 1 }],
      [T.gEndereza, T.gEnderezado, { hoja: P(330, 640), mu: -1.75, dedos: RELAJ, dobla: 1 }],
      [T.gShock - 0.06, T.gShock + 0.24, { hoja: P(480, 240), mu: 1.85, dedos: ABIERTA, dobla: -1 }],
      [T.gGusta, T.gGusta + 0.18, { hoja: P(440, 500), mu: 2.0, dedos: PUNO, dobla: 1 }],
      [T.gRock0, T.gRock1, { hoja: P(492, 150), mu: 1.62, dedos: CUERNOS, dobla: 1 }, salida]
    ];
    const PC = [
      [0, 0, { bols: "cerca" }],
      [T.gAnda0 + 0.2, T.gAnda1, { hoja: P(110, 640), mu: -1.65, dedos: RELAJ, dobla: -1 }],
      [T.gRuega - 0.05, T.gRuega + 0.15, { hoja: P(300, 318), mu: 2.3, dedos: JUNTAS, dobla: -1 }],
      [4.42, 4.66, { hoja: P(110, 650), mu: -1.65, dedos: RELAJ, dobla: -1 }],
      [T.gInclina0 + 0.05, T.gInclina1, { scr: cuelga("cerca"), mu: -1.7, dedos: RELAJ, dobla: -1 }],
      [T.gEndereza, T.gEnderezado, { hoja: P(110, 640), mu: -1.65, dedos: RELAJ, dobla: -1 }],
      [T.gShock - 0.06, T.gShock + 0.24, { hoja: P(205, 232), mu: 1.45, dedos: ABIERTA, dobla: -1 }],
      [T.gGusta, T.gGusta + 0.18, { hoja: P(250, 480), mu: 1.9, dedos: PUNO, dobla: -1 }],
      [T.gRock0 + 0.05, T.gRock1 + 0.05, { hoja: P(352, 392), mu: Math.PI - 0.15, dedos: CUERNOS, dobla: -1 }, salida]
    ];
    const l = pista(PL, t, r), c = pista(PC, t, r);
    // cuernos que bombean con el cabeceo; puños que celebran
    l.y += 14 * cb * onda; c.y += 10 * cb * onda;
    const yes = campana(t, T.gGusta + 0.15, T.gGusta + 0.32);
    l.y -= 24 * yes; c.y -= 18 * yes;
    p.manoLejos = manoDe(l); p.manoCerca = manoDe(c);
  }

  /* =====================================================================================
   * SARA (en el espejo mirando a la izquierda; se gira hacia Guillermo)
   * ===================================================================================== */
  function giro(t, t0, t1, de, a) {
    const u = fase(t, t0, t1);
    if (u <= 0) return { espejo: de, sx: 1, gira: 0 };
    if (u >= 1) return { espejo: a, sx: 1, gira: 0 };
    const gira=Math.sin(Math.PI*u);
    return {espejo:u<0.5?de:a,sx:1-0.53*gira*gira,gira,mezcla:tramo(u,0.30,0.70)};
  }
  const CARAS_S = {
    espejo: E({ mx: 0.92, my: -0.05, c: 0.44, wd: 0.08, sd: 8, si: 12, gi: 0.04, abre: 7, ancho: 0.5, sonr: -0.05, dientes: 0 }),
    admira: E({ mx: 0.92, my: 0, c: 0.4, sd: 2, si: 10, gi: 0.06, abre: 0, ancho: 0.85, sonr: 0.28 }),
    atras: E({ mx: -1, my: 0, c: 0.42, sd: 0, si: 14, gi: 0.08, abre: 0, ancho: 0.82, sonr: 0 }),
    seria: E({ mx: 0.88, my: 0, c: 0.44, sd: 0, si: 4, abre: 0, ancho: 0.82, sonr: 0.02 }),
    encoge: E({ mx: 0.88, my: 0, c: 0.52, sd: 10, si: 18, gi: 0.08, abre: 0, ancho: 0.9, sonr: 0.12 }),
    trabaja: E({ mx: 0.88, my: -0.12, c: 0.36, sd: -2, gd: -0.04, si: 0, gi: -0.02, abre: 0, ancho: 0.6, sonr: -0.1 }),
    uhoh: E({ mx: 0.9, my: -0.12, c: 0.15, iris: 0.82, sd: 12, si: 18, gi: 0.05, abre: 0, ancho: 0.6, sonr: -0.12 }),
    sopla: E({ mx: 0.8, my: 0, c: 1, z: 1, sd: -4, si: -4, abre: 0, ancho: 0.7, sonr: -0.2 }),
    mira: E({ mx: 0.88, my: 0, c: 0.5, sd: 0, si: 8, abre: 0, ancho: 0.75, sonr: -0.06 }),
    duda: E({ mx: 0.86, my: 0, c: 0.4, sd: 4, si: 18, gi: 0.1, abre: 0, ancho: 0.68, sonr: -0.14 }),
    camara: E({ mx: -0.85, my: 0, c: 0.52, sd: 0, si: 10, gi: 0.05, abre: 0, ancho: 0.78, sonr: -0.04 }),
    presenta: E({ mx: -1, my: -0.05, c: 0.45, sd: 0, si: 8, abre: 0, ancho: 0.8, sonr: 0.05 }),
    miraG: E({ mx: 0.9, my: 0, c: 0.44, sd: 0, si: 12, gi: 0.06, abre: 0, ancho: 0.8, sonr: 0.04 }),
    camaraFin: E({ mx: -0.85, my: 0, c: 0.5, sd: 0, si: 6, abre: 0, ancho: 0.8, sonr: 0 }),
    sonrisa: E({ mx: -0.85, my: 0, c: 0.45, sd: 2, si: 15, gi: 0.08, abre: 0, ancho: 0.9, sonr: 0.42 })
  };
  const GUION_CARA_S = [
    [T.sAdmira, T.sAdmira + 0.2, "admira"], [T.sMira, T.sMira + 0.15, "atras"], [T.sGira0 + 0.1, T.sGira1, "seria"], [T.sEncoge, T.sEncoge + 0.15, "encoge"],
    [T.pasa1, T.pasa1 + 0.2, "seria"], [T.lapizG0, T.lapizG0 + 0.25, "trabaja"], [T.ah2, T.ah2 + 0.15, "uhoh"], [T.achis - 0.01, T.achis + 0.04, "sopla", salida],
    [T.achisFin + 0.1, T.achisFin + 0.3, "mira"], [T.arr1a - 0.1, T.arr1a + 0.1, "trabaja"], [T.mira1, T.mira1 + 0.12, "duda"], [T.arr2a - 0.05, T.arr2a + 0.1, "trabaja"],
    [T.sAtras, T.sAtras + 0.12, "mira"], [T.sCam1, T.sCam1 + 0.1, "camara"], [T.sCam1Fin + 0.08, T.sCam1Fin + 0.2, "presenta"],
    [T.gShock, T.gShock + 0.15, "miraG"], [T.sCam2, T.sCam2 + 0.15, "camaraFin"], [T.sSonrisa, T.sSonrisa + 0.3, "sonrisa"]
  ];
  const CUERPOS_S = {
    inicio: { torso: 0.1, cab: 0.04 },
    acerca: { torso: 0.2, cab: 0.1 },
    admira: { torso: 0.03, cab: -0.1 },
    atras: { torso: 0.05, cab: -0.04 },
    giro: { torso: 0.03, cab: 0.0 },
    trabaja: { torso: 0.13, cab: -0.05 },
    sopla: { torso: 0.15, cab: -0.14 },
    duda: { torso: 0.05, cab: -0.1 },
    atras2: { torso: 0.0, cab: -0.04 },
    presenta: { torso: -0.04, cab: 0.02 },
    final: { torso: 0.02, cab: 0.0 }
  };
  const GUION_CUERPO_S = [
    [T.sAcerca, T.sListo, "acerca"], [T.sAdmira, T.sAdmira + 0.35, "admira"], [T.sMira, T.sMira + 0.25, "atras"], [T.sGira0, T.sGira1, "giro"],
    [T.lapizG0 - 0.1, T.trazoG0, "trabaja"], [T.achis, T.achis + 0.05, "sopla", salida], [T.achisFin + 0.1, T.achisFin + 0.45, "trabaja"],
    [T.mira1, T.mira1 + 0.15, "duda"], [T.arr2a - 0.05, T.arr2a + 0.1, "trabaja"], [T.sAtras, T.sAtras + 0.25, "atras2"],
    [T.sPresenta, T.sPresenta + 0.3, "presenta"], [T.sCam2, T.sCam2 + 0.3, "final"]
  ];
  // pies (pantalla): la que va delante cambia al girarse
  const PIES_S = {
    cerca: [[0, XS0 + 22], [T.sPresenta + 0.18, XS0 + 22], [T.sPresenta + 0.32, XS1 + 22]],
    lejos: [[0, XS0 - 24], [T.sPresenta, XS0 - 24], [T.sPresenta + 0.18, XS1 - 30]]
  };
  function poseS(t,ladoForzado) {
    const b = guion(GUION_CUERPO_S, CUERPOS_S, "inicio", t);
    const respira = Math.sin(t * 1.9 + 0.7);
    const gr = giro(t, T.sGira0, T.sGira1, true, false);
    const wC = pieDe(PIES_S.cerca, t, 12), wL = pieDe(PIES_S.lejos, t, 12);
    const x = ((wC.x - 22) + (wL.x + 24)) / 2;
    // encogerse de hombros
    const enc = campana(t, T.sEncoge, T.sEncoge + 0.4);
    const p = {
      x, suelo: SUELO, s: S, espejo: ladoForzado??gr.espejo, sx:gr.sx, mezclaGiro:gr.mezcla, tirasLimpias: true,
      pelvis: { x: Sa.PELVIS.x, y: Sa.PELVIS.y + (respira * 1.0 - 3 * gr.gira - 4 * enc) / (S * Sa.K) },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 + 0.035 * enc }, piernas: {},
      cabeza: { ang: b.cab + 0.012 * Math.sin(t * 1.3), dx: 0, dy: 0, esc: { x: 1, y: 1 } },
      pelo: { viento: 0, inercia: 0 }
    };
    // admira el rabillo: ladea la cabeza a un lado y a otro
    p.cabeza.ang += 0.07 * Math.sin((t - T.sAdmira) * 6) * dentro(t, T.sAdmira + 0.15, T.sAdmira + 0.3, 2.8, 2.95);
    // el estornudo le echa el pelo atrás
    const sopla = amort(t, T.achis, 3.2, 4.5) * (t >= T.achis ? 1 : 0);
    p.pelo.viento = 1.6 * Math.max(0, sopla) * (t < T.achis + 1.2 ? 1 : 0);
    const b2 = guion(GUION_CUERPO_S, CUERPOS_S, "inicio", t - 0.1);
    p.pelo.inercia = clamp((b.torso - b2.torso) * 5 + gr.gira * 0.5, -0.8, 0.8);
    p.piernas.cerca = aPierna(Sa, p, wC, "cerca"); p.piernas.lejos = aPierna(Sa, p, wL, "lejos");
    const ex = guion(GUION_CARA_S, CARAS_S, "espejo", t);
    p.cara = cara(ex, parpadeo(t, [0.3, 2.62, 4.05, 7.62, 9.45, 11.3, 13.5], 0.16) + parpadeo(t, [T.sCam1 + 0.12, T.sCam2 + 0.3], 0.3));
    manosS(p, t);
    p.capaCabeza = (g, tt) => capaCabezaS(g, tt, p);
    return p;
  }
  /* ---------- manos de Sara (hoja de Sara: mira a +x) ---------- */
  const PINZA_D = D(0.42, 0.3, 0.12, 0.1, 0.1), LLAMA = D(0.2, 1, 0.1, 0.1, 0.1), APOYA = D(0.7, 0.8, 0.76, 0.72, 0.66), PALMA = D(0.85, 1, 1, 0.95, 0.9);
  // dónde cae la punta del lápiz
  const ojoS = (pS, q) => cabPant(Sa, pS, q);
  function puntaRayaS(pS, t) {           // su propia raya y el rabillo
    const f = pS.cara, Up = parpado(Sa.OJOS.d, f.ojos.d, f.ojos.feliz || 0, f.ojos.apretado || 0).Up;
    if (t < T.flick0) return ojoS(pS, enIdx(Up, lerp(13, 0, suave(fase(t, T.trazoS0, T.trazoS1)))));
    return ojoS(pS, rabillo(Up, salida(fase(t, T.flick0, T.flick1))).tip);
  }
  function upG(pG) { const f = pG.cara; return parpado(OJO_G.d, f.ojos.d, f.ojos.feliz || 0, f.ojos.apretado || 0).Up; }
  function puntaRayaG(t) {               // la raya de Guillermo, el estornudo y la oreja
    const pG = poseG(t), Up = upG(pG);
    if (t < T.achis) return cabPant(G, pG, enIdx(Up, lerp(13, FIN_RAYA, suave(fase(t, T.trazoG0, T.trazoG1)))));
    const pts = [enIdx(Up, FIN_RAYA), ...LINEA], d = largos(pts);
    return cabPant(G, pG, enFrac(pts, d, salida(fase(t, T.achis, T.achisFin))));
  }
  // garabatos alrededor de un ojo (retrato): óvalo con rizos
  function garabato(t, t0, t1, c, rx, ry, vueltas) {
    const u = fase(t, t0, t1), a = u * vueltas * TAU;
    const amp = Math.sin(Math.PI * u);
    return P(c.x + (rx * Math.cos(a) + 7 * Math.cos(5.3 * a)) * (0.5 + 0.5 * amp), c.y + (ry * Math.sin(a) + 6 * Math.sin(4.7 * a)) * (0.5 + 0.5 * amp));
  }
  const PASADAS=[
    {a:T.arr1a,b:T.arr1b,c:P(768,566),rx:52,ry:34},
    {a:T.arr2a,b:T.arr2b,c:P(893,617),rx:40,ry:28}
  ];
  const puntoPasada=(i,t)=>{const q=PASADAS[i];return garabato(t,q.a,q.b,q.c,q.rx,q.ry,3);};
  function puntaDifumina(t){
    const u=fase(t,T.arr3a,T.arr3b), puntos=[P(760,575),P(739,561),P(892,617),P(845,610),P(610,598)];
    const q=enIdx(puntos,u*4), onda=Math.sin(Math.PI*u);
    return P(q.x+4*onda*Math.sin(TAU*8*u),q.y+6*onda*Math.sin(TAU*6*u));
  }
  function pintaPasadas(g,t){
    g.lineCap="round";g.lineJoin="round";
    for(const [i,p] of PASADAS.entries()){
      const u=fase(t,p.a,p.b);if(u<=0)continue;
      const n=Math.max(1,Math.ceil(132*u));g.beginPath();
      for(let j=0;j<=n;j++){const q=puntoPasada(i,lerp(p.a,p.b,u*j/n));if(j)g.lineTo(q.x,q.y);else g.moveTo(q.x,q.y);}
      g.strokeStyle="#241b27";g.lineWidth=7;g.stroke();
    }
  }
  const cabG = (q, t) => cabPant(G, poseG(t), q);
  function manosS(p, t) {
    const r = resolutor(Sa, p, ESC_MANO_S, LP_S);
    // --- mano cercana: su raya; luego pasa el lápiz, llama con el dedo, al bolsillo; presenta el espejo
    const ojoIni = tt => ojoS(p, P(868, 384));
    const PASE = tt => Sa.aPantalla(p, Sa.tronco(p)(P(300, 478)));
    const PC = [
      [0, 0, { punta: tt => { const q = ojoIni(tt); return P(q.x + 12, q.y + 14); }, mu: 2.25, a: -0.72, dedos: PINZA_D, dobla: 1 }],
      [T.sAcerca, T.sListo, { punta: ojoIni, mu: 2.25, a: -0.72, dedos: PINZA_D, dobla: 1 }],
      [T.sListo + 0.02, T.trazoS0, { punta: tt => puntaRayaS(p, T.trazoS0), mu: 2.25, a: -0.72, dedos: PINZA_D, dobla: 1 }],
      [T.trazoS0, T.trazoS0, { punta: tt => puntaRayaS(p, tt), mu: 2.25, a: -0.72, dedos: PINZA_D, dobla: 1 }, x => x],
      [T.flick1, T.flick1 + 0.25, { punta: tt => { const q = ojoS(p, ALA); return P(q.x + 3, q.y - 9); }, mu: 2.3, a: -0.9, dedos: PINZA_D, dobla: 1 }, salida],
      [T.sAdmira + 0.1, 2.85, { hoja: P(330, 470), mu: 1.9, a: -1.5, dedos: PINZA_D, dobla: 1 }],
      [3.3, 3.75, { hoja: P(230, 560), mu: 1.75, a: -1.3, dedos: PINZA_D, dobla: 1 }],
      [T.sEncoge - 0.04, T.sEncoge + 0.16, { hoja: P(172, 584), mu: -2.2, a: -1.0, dedos: PINZA_D, dobla: 1 }],
      [T.sLlama, T.sLlama + 0.25, { hoja: P(250, 540), mu: 1.9, a: -1.4, dedos: PINZA_D, dobla: 1 }],
      [T.pasa0, T.pasa, { punta: PASE, mu: 2.2, a: -1.45, dedos: PINZA_D, dobla: 1 }],
      [T.pasa + 0.02, T.pasa + 0.32, { bols: "cerca", vuelta: TAU }],
      [T.sPresenta, T.sPresenta + 0.3, { hoja: P(-60, 540), mu: -0.15 + TAU, dedos: PALMA, dobla: 1 }, salida],
      [T.sCam2, T.sCam2 + 0.35, { bols: "cerca", vuelta: TAU }]
    ];
    // --- mano lejana: apoyada en la repisa; coge el lápiz; pinta a Guillermo
    const REPISA = P(197, 347);
    const HQ = tt => { const q = cabG(enIdx(upG(poseG(tt)), 13), tt); return q; };
    const MUG = 2.15, AG = -1.22;          // mano y lápiz al pintarle
    const lejos = (q, dx, dy) => P(q.x + dx, q.y + dy);
    const PL = [
      [0, 0, { scr: REPISA, mu: -2.35, dedos: APOYA, dobla: 1 }],
      [3.3, 3.7, { hoja: P(320, 690), mu: -1.7, dedos: RELAJ, dobla: 1 }],
      [T.sEncoge - 0.04, T.sEncoge + 0.16, { hoja: P(420, 640), mu: -2.6, dedos: PALMA, dobla: 1 }],
      [T.sLlama, T.sLlama + 0.16, { hoja: P(515, 392), mu: Math.PI - 0.25, dedos: LLAMA, dobla: 1 }, salida],
      [T.pasa0, T.pasa, { punta: PASE, mu: 2.5, a: -1.45, dedos: PINZA_D, dobla: 1 }],
      [T.pasa1, T.lapizG0, { hoja: P(470, 380), mu: 2.3, a: -1.3, dedos: PINZA_D, dobla: 1 }],
      [T.lapizG0, T.trazoG0, { punta: tt => lejos(HQ(tt), -6, -5), mu: MUG, a: AG, dedos: PINZA_D, dobla: 1 }],
      [T.trazoG0 - 0.08, T.trazoG0, { punta: tt => puntaRayaG(tt), mu: MUG, a: AG, dedos: PINZA_D, dobla: 1 }],
      [T.trazoG0, T.trazoG0, { punta: tt => puntaRayaG(tt), mu: MUG, a: AG, dedos: PINZA_D, dobla: 1 }, x => x],
      [T.sRetira, T.sRetira + 0.3, { punta: tt => lejos(cabG(P(700, 520), tt), -18, -14), mu: MUG + 0.1, a: AG - 0.3, dedos: PINZA_D, dobla: 1 }],
      [T.arr1a - 0.12, T.arr1a, { punta: tt => cabG(puntoPasada(0,T.arr1a), tt), mu: MUG, a: AG, dedos: PINZA_D, dobla: 1 }],
      [T.arr1a, T.arr1a, { punta: tt => cabG(puntoPasada(0,tt), tt), mu: MUG, a: AG, dedos: PINZA_D, dobla: 1 }, x => x],
      [T.arr1b, T.mira1 + 0.1, { punta: tt => lejos(cabG(P(820, 560), tt), -16, -10), mu: MUG + 0.1, a: AG - 0.2, dedos: PINZA_D, dobla: 1 }],
      [T.arr2a - 0.12, T.arr2a, { punta: tt => cabG(puntoPasada(1,T.arr2a), tt), mu: MUG, a: AG, dedos: PINZA_D, dobla: 1 }],
      [T.arr2a, T.arr2a, { punta: tt => cabG(puntoPasada(1,tt), tt), mu: MUG, a: AG, dedos: PINZA_D, dobla: 1 }, x => x],
      [T.arr2b, T.arr3a, { punta: tt => cabG(P(760, 575), tt), mu: MUG, a: AG, dedos: PINZA_D, dobla: 1 }],
      [T.arr3a, T.arr3a, { punta: tt => cabG(puntaDifumina(tt), tt), mu: MUG, a: AG, dedos: PINZA_D, dobla: 1 }, x => x],
      [T.sAtras, T.sAtras + 0.3, { hoja: P(450, 330), mu: 2.2, a: -1.4, dedos: PINZA_D, dobla: 1 }],
      [T.sPresenta + 0.1, T.sPresenta + 0.4, { hoja: P(420, 470), mu: 2.0, a: -1.2, dedos: PINZA_D, dobla: 1 }]
    ];
    const c = pista(PC, t, r), l = pista(PL, t, r);
    // llama con el dedo (dos veces)
    const ll = dentro(t, T.sLlama + 0.1, T.sLlama + 0.16, T.sLlamaFin - 0.08, T.sLlamaFin - 0.02);
    if (ll > 0) { const k = 0.5 + 0.5 * Math.cos((t - T.sLlama - 0.16) * TAU * 3.4); l.dedos = mezclaD(l.dedos, D(0.2, 0.15 + 0.85 * k, 0.1, 0.1, 0.1), ll); }
    // sacudida del estornudo en la mano del lápiz
    const sac = amort(t, T.achis, 12, 40);
    const previo=l.a;
    l.a+=0.18*sac;
    // La muñeca acusa el estornudo sin separar la mina de su trazo.
    l.x+=LP_S*(Math.cos(previo)-Math.cos(l.a));l.y+=LP_S*(Math.sin(previo)-Math.sin(l.a));
    // La mano que recibe agarra 7 px más atrás. Las dos pinzas caben sobre el mismo lápiz.
    l.extra=(7/(S*Sa.K))*dentro(t,T.pasa0,T.pasa,T.pasa1,T.lapizG0);
    l.x-=l.extra*Math.cos(l.a);l.y-=l.extra*Math.sin(l.a);
    p.__c = c; p.__l = l;
    const conLapiz = t < T.pasa ? "cerca" : "lejos";
    p.manoCerca = manoDe(c, conLapiz === "cerca" ? (g => lapiz(g, c)) : null);
    p.manoLejos = manoDe(l, conLapiz === "lejos" ? (g => lapiz(g, l)) : null);
  }

  /* =====================================================================================
   * DIBUJO DE LOS MUÑECOS (con el giro aplastado) Y SUS REFLEJOS
   * ===================================================================================== */
  function dibujaPerfil(g, Rg, p, t) {
    const sx = p.sx ?? 1;
    if (Math.abs(sx - 1) < 1e-4) { Rg.dibujar(g, p, t); return; }
    g.save(); g.translate(p.x, p.suelo); g.scale(sx, 1); g.translate(-p.x, -p.suelo); Rg.dibujar(g, p, t); g.restore();
  }
  let ultimoGiro=NaN, compuestoGiro=null, perfilGiro=null;
  function dibuja(g,Rg,p,t) {
    const k=p.mezclaGiro;
    if(Rg!==Sa||!(k>0&&k<1)){dibujaPerfil(g,Rg,p,t);return;}
    const x0=p.x-160,y0=SUELO-460;
    if(ultimoGiro!==t){
      compuestoGiro??=lienzo(320,490);perfilGiro??=lienzo(320,490);
      const dst=compuestoGiro.getContext("2d"),src=perfilGiro.getContext("2d");
      dst.clearRect(0,0,320,490);
      for(const [espejo,peso] of [[true,1-k],[false,k]]){
        src.clearRect(0,0,320,490);src.save();src.translate(-x0,-y0);
        dibujaPerfil(src,Sa,p.espejo===espejo?p:poseS(t,espejo),t);src.restore();
        dst.save();dst.globalAlpha=peso;dst.globalCompositeOperation="lighter";dst.drawImage(perfilGiro,0,0);dst.restore();
      }
      ultimoGiro=t;
    }
    g.drawImage(compuestoGiro,x0,y0);
  }
  function sombra(g, x, ancho) {
    g.save(); const gr = g.createRadialGradient(x, SUELO + 2, 2, x, SUELO + 2, ancho);
    gr.addColorStop(0, "rgba(0,0,0,0.45)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, SUELO + 2, ancho, ancho * 0.16, 0, 0, TAU); g.fill(); g.restore();
  }
  function recortaEspejo(g){g.beginPath();rutaP(g,CRISTAL);g.closePath();g.clip();}
  function reflejos(g, t, pG, pS) {
    g.save();recortaEspejo(g);
    for(const [Rg,p] of [[G,pG],[Sa,pS]]){
      const { xr, c } = reflejo(p.x);
      g.save(); g.globalAlpha=0.9; g.translate(xr, YR); g.scale(-c, c); g.translate(-p.x, -SUELO);
      dibuja(g, Rg, p, t); g.restore();
    }
    // tinte frío del cristal
    g.fillStyle = "rgba(70,110,150,0.16)"; g.fillRect(20, 80, 160, 290);
    g.restore();
  }

  /* =====================================================================================
   * ESCENARIO
   * ===================================================================================== */
  const FS = 1.5, FX = -120, FY = -80, FW = W + 240, FH = H + 160;
  let fondo = null, tocador = null;
  const BOMBILLAS = [];
  (function () {
    // bombillas alrededor del espejo (arriba, abajo y el lado cercano), en perspectiva
    const marco = 13;
    for (let i = 0; i < 5; i++) { const x = lerp(22, 160, i / 4), r = lerp(6.6, 4.6, i / 4); BOMBILLAS.push({ x, y: yPared(x, 92 - marco) - 2, r }); BOMBILLAS.push({ x, y: yPared(x, 352 + marco) + 2, r }); }
    for (let i = 1; i < 4; i++) BOMBILLAS.push({ x: 30 - marco - 2, y: lerp(92, 352, i / 4), r: 6.8 });
  })();
  function creaFondo() {
    const c = lienzo(Math.ceil(FW * FS), Math.ceil(FH * FS)), g = c.getContext("2d");
    g.scale(FS, FS); g.translate(-FX, -FY); g.lineJoin = "round"; g.lineCap = "round";
    // pared del fondo: ladrillo oscuro
    g.fillStyle = "#2a1714"; g.fillRect(ESQ, FY, W + 120 - ESQ, FONDO_Y - FY);
    const LH = 15, LW = 38;
    for (let r = 0; r * LH < FONDO_Y - FY; r++) {
      const y = FY + r * LH;
      for (let x = ESQ - (r % 2 ? LW / 2 : 0); x < W + 120; x += LW) {
        const h = hash(r * 31.7 + x * 0.37), v = 0.75 + 0.35 * h;
        g.fillStyle = `rgb(${Math.round(92 * v)},${Math.round(44 * v)},${Math.round(36 * v)})`;
        g.fillRect(Math.max(ESQ, x + 1.5), y + 1.5, LW - 3 - Math.max(0, ESQ - x - 1.5), LH - 3);
        if (h > 0.8) { g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(Math.max(ESQ, x + 4), y + 4, 10, 4); }
      }
    }
    // penumbra: más oscuro abajo y en los lados; un foco cálido en el centro
    let gr = g.createLinearGradient(0, FY, 0, FONDO_Y);
    gr.addColorStop(0, "rgba(8,4,10,0.55)"); gr.addColorStop(0.45, "rgba(8,4,10,0.18)"); gr.addColorStop(1, "rgba(8,4,10,0.6)");
    g.fillStyle = gr; g.fillRect(ESQ, FY, W + 120 - ESQ, FONDO_Y - FY);
    // zócalo
    g.fillStyle = "#120c0e"; g.fillRect(ESQ, FONDO_Y - 14, W + 120 - ESQ, 14); g.fillStyle = "#3a2a2c"; g.fillRect(ESQ, FONDO_Y - 15, W + 120 - ESQ, 2);
    // suelo de tablas hacia el punto de fuga
    g.fillStyle = "#2c1f18"; g.beginPath(); g.moveTo(FX, FONDO_Y); g.lineTo(W + 120, FONDO_Y); g.lineTo(W + 120, H + 80); g.lineTo(FX, H + 80); g.closePath(); g.fill();
    for (let i = -14; i < 22; i++) {
      const x0 = ESQ + i * 42, k = (H + 80 - VP.y) / (FONDO_Y - VP.y), x1 = VP.x + (x0 - VP.x) * k;
      g.strokeStyle = "rgba(10,6,4,0.75)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x0, FONDO_Y); g.lineTo(x1, H + 80); g.stroke();
      g.strokeStyle = `rgba(255,220,180,${0.03 + 0.04 * hash(i * 3.3)})`; g.lineWidth = 6; g.beginPath(); g.moveTo(x0 + 8, FONDO_Y); g.lineTo(VP.x + (x0 + 8 - VP.x) * k, H + 80); g.stroke();
    }
    for (const y of [470, 492, 522, 562, 616]) { g.strokeStyle = "rgba(10,6,4,0.35)"; g.lineWidth = 1; g.beginPath(); g.moveTo(FX, y); g.lineTo(W + 120, y); g.stroke(); }
    gr = g.createLinearGradient(0, FONDO_Y, 0, H + 80); gr.addColorStop(0, "rgba(6,3,4,0.55)"); gr.addColorStop(0.5, "rgba(6,3,4,0.1)"); gr.addColorStop(1, "rgba(6,3,4,0.45)");
    g.fillStyle = gr; g.fillRect(FX, FONDO_Y, FW, H + 80 - FONDO_Y);
    // pared izquierda (en perspectiva), verde petróleo oscuro
    const yPie = x => FONDO_Y + (ESQ - x) * (FONDO_Y - VP.y) / (VP.x - ESQ);
    g.beginPath(); g.moveTo(FX, FY); g.lineTo(ESQ, FY); g.lineTo(ESQ, FONDO_Y); g.lineTo(FX, yPie(FX)); g.closePath();
    gr = g.createLinearGradient(FX, 0, ESQ, 0); gr.addColorStop(0, "#162629"); gr.addColorStop(1, "#21363a");
    g.fillStyle = gr; g.fill();
    g.strokeStyle = "#0b1214"; g.lineWidth = 3; g.beginPath(); g.moveTo(ESQ, FY); g.lineTo(ESQ, FONDO_Y); g.stroke();
    // zócalo de la pared izquierda
    g.fillStyle = "#0d1416"; g.beginPath(); g.moveTo(ESQ, FONDO_Y - 14); g.lineTo(ESQ, FONDO_Y); g.lineTo(FX, yPie(FX)); g.lineTo(FX, yPie(FX) - 14 * (VP.x - FX) / (VP.x - ESQ)); g.closePath(); g.fill();
    // luz cálida de las bombillas sobre la pared izquierda
    gr = g.createRadialGradient(95, 220, 10, 95, 220, 230); gr.addColorStop(0, "rgba(255,214,150,0.32)"); gr.addColorStop(1, "rgba(255,214,150,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(FX, FY); g.lineTo(ESQ, FY); g.lineTo(ESQ, FONDO_Y); g.lineTo(FX, yPie(FX)); g.closePath(); g.fill();
    // cristal: el cuarto reflejado (oscuro, ladrillo apagado y las bombillas de enfrente)
    g.save(); g.beginPath(); rutaP(g, CRISTAL); g.closePath(); g.clip();
    gr = g.createLinearGradient(30, 92, 165, 340); gr.addColorStop(0, "#2a2f3a"); gr.addColorStop(0.5, "#3a3240"); gr.addColorStop(1, "#1d2028");
    g.fillStyle = gr; g.fillRect(20, 80, 160, 290);
    for (let r = 0; r < 18; r++) for (let x = 20 - (r % 2) * 9; x < 180; x += 19) { g.fillStyle = `rgba(120,70,60,${0.1 + 0.06 * hash(r * 7 + x)})`; g.fillRect(x + 1, 80 + r * 8 + 1, 16, 6); }
    for (const [x, y] of [[60, 300], [120, 290], [150, 160]]) { const rg = g.createRadialGradient(x, y, 1, x, y, 26); rg.addColorStop(0, "rgba(255,230,180,0.35)"); rg.addColorStop(1, "rgba(255,230,180,0)"); g.fillStyle = rg; g.fillRect(x - 26, y - 26, 52, 52); }
    g.restore();
    // carteles sin letras en el ladrillo
    const cartel = (x, y, w, h, rot, fondoC, dib) => {
      g.save(); g.translate(x, y); g.rotate(rot);
      g.fillStyle = "rgba(0,0,0,0.4)"; g.fillRect(-w / 2 + 4, -h / 2 + 5, w, h);
      g.fillStyle = fondoC; g.fillRect(-w / 2, -h / 2, w, h); dib(w, h);
      g.strokeStyle = "rgba(0,0,0,0.5)"; g.lineWidth = 1.2; g.strokeRect(-w / 2, -h / 2, w, h);
      // cinta americana en las esquinas
      g.fillStyle = "rgba(170,170,165,0.85)";
      for (const [sx, sy] of [[-1, -1], [1, -1]]) { g.save(); g.translate(sx * w / 2, sy * h / 2); g.rotate(sx * 0.7); g.fillRect(-9, -3.5, 18, 7); g.restore(); }
      g.restore();
    };
    cartel(250, 46, 70, 92, -0.05, "#f2c230", (w, h) => {
      g.fillStyle = TINTA; g.beginPath(); g.moveTo(6, -36); g.lineTo(-14, 4); g.lineTo(0, 4); g.lineTo(-8, 38); g.lineTo(16, -6); g.lineTo(2, -6); g.lineTo(12, -36); g.closePath(); g.fill();
    });
    cartel(612, 64, 84, 104, 0.05, "#141217", (w, h) => {
      for (let i = 0; i < 70; i++) { g.fillStyle = "rgba(255,80,180,0.35)"; g.beginPath(); g.arc(-w / 2 + hash(i * 3.3) * w, -h / 2 + hash(i * 5.1) * h, 1.6, 0, TAU); g.fill(); }
      g.strokeStyle = "#ff5fb4"; g.lineWidth = 4; g.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 13 : 32; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr + 4); }
      g.closePath(); g.stroke();
    });
    cartel(790, 118, 108, 80, -0.03, "#c8262f", (w, h) => {
      // guitarra blanca en silueta
      g.save(); g.rotate(-0.6); g.fillStyle = "#f4efe6";
      g.beginPath(); g.ellipse(-14, 6, 15, 11, 0, 0, TAU); g.ellipse(-2, 5, 11, 9, 0, 0, TAU); g.fill();
      g.fillRect(4, 2, 40, 5); g.fillRect(42, 0, 9, 9);
      g.fillStyle = "#c8262f"; g.beginPath(); g.arc(-10, 5, 3, 0, TAU); g.fill();
      g.restore();
    });
    // pegatinas
    for (const [x, y, r, col, tipo] of [[985, 330, 9, "#2bd1c4", 0], [742, 232, 8, "#f2c230", 1], [960, 236, 10, "#ff5fb4", 0], [508, 352, 7, "#e8e8e8", 1], [440, 34, 8, "#8a5cff", 0]]) {
      g.save(); g.translate(x, y); g.fillStyle = col; g.strokeStyle = "rgba(0,0,0,0.5)"; g.lineWidth = 1;
      g.beginPath(); if (tipo) { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); } else g.arc(0, 0, r, 0, TAU);
      g.fill(); g.stroke(); if (!tipo) { g.fillStyle = TINTA; g.beginPath(); g.arc(0, 0, r * 0.35, 0, TAU); g.fill(); } g.restore();
    }
    // guirnalda de bombillas arriba
    g.strokeStyle = "#0c0a0c"; g.lineWidth = 1.6; g.beginPath();
    const guir = x => 8 + 18 * Math.pow(Math.sin(((x - ESQ) / 180) * Math.PI), 2);
    for (let x = ESQ; x <= W + 120; x += 6) { const y = guir(x); if (x === ESQ) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke();
    for (let x = ESQ + 30; x < W + 120; x += 45) {
      const y = guir(x) + 6, rg = g.createRadialGradient(x, y, 1, x, y, 22); rg.addColorStop(0, "rgba(255,210,140,0.45)"); rg.addColorStop(1, "rgba(255,210,140,0)");
      g.fillStyle = rg; g.fillRect(x - 22, y - 22, 44, 44);
      g.fillStyle = "#ffe0a0"; g.beginPath(); g.ellipse(x, y, 3.2, 4.4, 0, 0, TAU); g.fill();
    }
    // guitarra eléctrica en su soporte
    g.save(); g.translate(560, 470);
    g.strokeStyle = "#1a181c"; g.lineWidth = 3; g.beginPath(); g.moveTo(-16, 8); g.lineTo(0, -40); g.lineTo(16, 8); g.moveTo(0, -40); g.lineTo(0, -150); g.stroke();
    g.rotate(-0.08);
    g.fillStyle = "#1a1418"; g.fillRect(-4, -235, 8, 140); g.fillStyle = "#2a2226"; g.beginPath(); g.roundRect(-7, -262, 14, 30, 3); g.fill();
    g.strokeStyle = "#d9d0bf"; g.lineWidth = 0.6; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(-2.5 + k, -258); g.lineTo(-2.5 + k, -40); g.stroke(); }
    g.fillStyle = "#b8141f"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.moveTo(-6, -104); g.bezierCurveTo(-30, -112, -36, -86, -26, -72); g.bezierCurveTo(-40, -58, -38, -22, -14, -14);
    g.bezierCurveTo(4, -10, 30, -16, 32, -40); g.bezierCurveTo(34, -60, 22, -70, 24, -84); g.bezierCurveTo(26, -100, 10, -108, 6, -100); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#f2ede4"; g.beginPath(); g.moveTo(-10, -84); g.bezierCurveTo(-24, -70, -22, -40, -6, -30); g.lineTo(14, -34); g.lineTo(10, -84); g.closePath(); g.fill();
    g.fillStyle = "#1a181c"; g.fillRect(-9, -76, 18, 5); g.fillRect(-9, -58, 18, 5);
    for (const [x, y] of [[18, -40], [22, -30], [14, -24]]) { g.fillStyle = "#d8c27a"; g.beginPath(); g.arc(x, y, 2.4, 0, TAU); g.fill(); }
    g.fillStyle = "rgba(255,255,255,0.25)"; g.beginPath(); g.ellipse(-22, -86, 3, 8, 0.4, 0, TAU); g.fill();
    g.restore();
    // amplificador (sin marca)
    g.save(); g.translate(690, 472);
    g.fillStyle = "#121014"; g.strokeStyle = TINTA; g.lineWidth = 2; g.beginPath(); g.roundRect(-58, -118, 116, 118, 6); g.fill(); g.stroke();
    g.fillStyle = "#2a262c"; g.beginPath(); g.roundRect(-50, -92, 100, 84, 4); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.06)"; g.lineWidth = 1; for (let k = -46; k < 50; k += 5) { g.beginPath(); g.moveTo(k, -90); g.lineTo(k + 8, -10); g.stroke(); }
    g.fillStyle = "#c9a85a"; g.fillRect(-56, -114, 112, 18);
    for (let k = 0; k < 6; k++) { g.fillStyle = "#151215"; g.beginPath(); g.arc(-42 + k * 14, -105, 4, 0, TAU); g.fill(); }
    g.fillStyle = "#ff3030"; g.beginPath(); g.arc(46, -105, 2.4, 0, TAU); g.fill();
    // cable enrollado
    g.strokeStyle = "#0a0a0c"; g.lineWidth = 2.4; g.beginPath(); g.ellipse(-80, 4, 22, 6, 0, 0, TAU); g.stroke(); g.beginPath(); g.ellipse(-78, 2, 16, 4.5, 0, 0, TAU); g.stroke();
    g.restore();
    // puerta del camerino con su estrella
    g.save(); g.translate(880, 455);
    g.fillStyle = "#0e0a0c"; g.fillRect(-58, -312, 116, 312);
    g.fillStyle = "#5a1a24"; g.strokeStyle = TINTA; g.lineWidth = 2; g.fillRect(-50, -304, 100, 304); g.strokeRect(-50, -304, 100, 304);
    g.strokeStyle = "rgba(0,0,0,0.4)"; g.strokeRect(-40, -290, 80, 120); g.strokeRect(-40, -150, 80, 130);
    g.fillStyle = "#e2b33c"; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 9 : 22; g.lineTo(Math.cos(a) * rr, -232 + Math.sin(a) * rr); } g.closePath(); g.fill(); g.strokeStyle = "#8a6514"; g.lineWidth = 1.4; g.stroke();
    g.fillStyle = "#d8c27a"; g.beginPath(); g.arc(-38, -150, 4, 0, TAU); g.fill();
    g.restore();
    return c;
  }
  // espejo de camerino (marco, bombillas, brillo del cristal) y repisa: delante del reflejo
  function creaTocador() {
    const c = lienzo(Math.ceil(300 * FS), Math.ceil(520 * FS)), g = c.getContext("2d");
    g.scale(FS, FS); g.translate(60, 20); g.lineJoin = "round"; g.lineCap = "round";
    // brillo diagonal del cristal
    g.save(); g.beginPath(); rutaP(g, CRISTAL); g.closePath(); g.clip();
    g.fillStyle = "rgba(255,255,255,0.09)"; g.beginPath(); g.moveTo(40, 300); g.lineTo(80, 300); g.lineTo(170, 120); g.lineTo(130, 120); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,0.06)"; g.beginPath(); g.moveTo(92, 330); g.lineTo(104, 330); g.lineTo(190, 150); g.lineTo(178, 150); g.closePath(); g.fill();
    g.restore();
    // marco
    const m = 13, ext = [P(30 - m, 92 - m), P(165 + 4, yPared(165, 92 - m)), P(165 + 4, yPared(165, 352 + m)), P(30 - m, 352 + m)];
    g.beginPath(); rutaP(g, ext); g.closePath(); rutaP(g, CRISTAL); g.closePath();
    const gm = g.createLinearGradient(17, 0, 170, 0); gm.addColorStop(0, "#efe7d6"); gm.addColorStop(1, "#b9b0a0");
    g.fillStyle = gm; g.fill("evenodd"); g.strokeStyle = TINTA; g.lineWidth = 2; g.stroke();
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 1.2; g.beginPath(); rutaP(g, CRISTAL); g.closePath(); g.stroke();
    // bombillas con su halo
    for (const b of BOMBILLAS) {
      const rg = g.createRadialGradient(b.x, b.y, 1, b.x, b.y, b.r * 3.4); rg.addColorStop(0, "rgba(255,226,160,0.55)"); rg.addColorStop(1, "rgba(255,226,160,0)");
      g.fillStyle = rg; g.fillRect(b.x - b.r * 3.4, b.y - b.r * 3.4, b.r * 6.8, b.r * 6.8);
      g.fillStyle = "#fff4d6"; g.strokeStyle = "rgba(120,90,40,0.8)"; g.lineWidth = 1; g.beginPath(); g.arc(b.x, b.y, b.r, 0, TAU); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.95)"; g.beginPath(); g.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.35, 0, TAU); g.fill();
    }
    // repisa: tablero que sale de la pared (perspectiva) y su canto
    const yA = 384, x0 = 4, x1 = 168, prof = 46;
    const a0 = P(x0, yPared(x0, yA)), a1 = P(x1, yPared(x1, yA));
    g.fillStyle = "#3b2a22"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.moveTo(a0.x, a0.y); g.lineTo(a1.x, a1.y); g.lineTo(a1.x + prof, a1.y); g.lineTo(a0.x + prof, a0.y); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#24170f"; g.beginPath(); g.moveTo(a0.x + prof, a0.y); g.lineTo(a1.x + prof, a1.y); g.lineTo(a1.x + prof, a1.y + 9); g.lineTo(a0.x + prof, a0.y + 12); g.closePath(); g.fill(); g.stroke();
    // cosas en la repisa (sin etiquetas): bote de brochas, laca, polvera, pintalabios, perfume
    const sobre = (u, d) => { const x = lerp(a0.x, a1.x, u) + d; return P(x, lerp(a0.y, a1.y, u) + 2); };
    let q = sobre(0.18, 18);   // bote de brochas
    g.fillStyle = "#30343c"; g.beginPath(); g.roundRect(q.x - 9, q.y - 22, 18, 22, 3); g.fill(); g.stroke();
    for (const [dx, a, col] of [[-5, -0.25, "#e8d7c0"], [0, 0.05, "#1b1b20"], [5, 0.3, "#c79b6a"]]) {
      g.save(); g.translate(q.x + dx, q.y - 20); g.rotate(a); g.strokeStyle = "#141216"; g.lineWidth = 2.6; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -20); g.stroke();
      g.fillStyle = col; g.beginPath(); g.ellipse(0, -24, 3.2, 6, 0, 0, TAU); g.fill(); g.lineWidth = 1; g.stroke(); g.restore();
    }
    q = sobre(0.45, 20);       // laca
    g.fillStyle = "#18161b"; g.beginPath(); g.roundRect(q.x - 7, q.y - 34, 14, 34, 3); g.fill(); g.stroke();
    g.fillStyle = "#c9ccd4"; g.fillRect(q.x - 7, q.y - 40, 14, 6); g.strokeRect(q.x - 7, q.y - 40, 14, 6);
    g.fillStyle = "rgba(255,255,255,0.3)"; g.fillRect(q.x - 4, q.y - 31, 2.5, 26);
    q = sobre(0.66, 24);       // polvera abierta
    g.fillStyle = "#1d1b21"; g.beginPath(); g.ellipse(q.x, q.y - 3, 11, 3.6, 0, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = "#e8b48e"; g.beginPath(); g.ellipse(q.x, q.y - 4, 8, 2.4, 0, 0, TAU); g.fill();
    q = sobre(0.82, 14);       // pintalabios rojo
    g.fillStyle = "#c9a85a"; g.fillRect(q.x - 3, q.y - 10, 6, 10); g.strokeRect(q.x - 3, q.y - 10, 6, 10);
    g.fillStyle = "#c21a2c"; g.beginPath(); g.moveTo(q.x - 2.5, q.y - 10); g.lineTo(q.x - 2.5, q.y - 16); g.lineTo(q.x + 2.5, q.y - 19); g.lineTo(q.x + 2.5, q.y - 10); g.closePath(); g.fill();
    q = sobre(0.95, 22);       // perfume
    g.fillStyle = "rgba(150,90,200,0.85)"; g.beginPath(); g.roundRect(q.x - 6, q.y - 15, 12, 15, 3); g.fill(); g.stroke();
    g.fillStyle = "#e2b33c"; g.fillRect(q.x - 2, q.y - 20, 4, 5);
    return c;
  }
  // una bombilla que parpadea un poco (encima del tocador)
  function parpadeoBombilla(g, t) {
    const b = BOMBILLAS[7], k = 0.5 + 0.5 * Math.sin(t * 23) * Math.sin(t * 3.1);
    if (k < 0.55) return;
    g.save(); g.globalAlpha = (k - 0.55) * 1.2; g.fillStyle = "#6b5a3a"; g.beginPath(); g.arc(b.x, b.y, b.r, 0, TAU); g.fill(); g.restore();
  }

  /* ---------- efectos ---------- */
  function estrellita(g, x, y, r, a, k) {
    if (k <= 0.01) return;
    g.save(); g.translate(x, y); g.rotate(a); g.scale(k, k); g.beginPath();
    for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.3 : r, an = i * Math.PI / 4; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
    g.closePath(); g.fillStyle = "#fffbe0"; g.fill(); g.lineWidth = 1; g.strokeStyle = "#e0a400"; g.stroke(); g.restore();
  }
  function efectos(g, t, pG, pS) {
    // ¡ting! en la punta del rabillo (y en el reflejo)
    const kt = fase(t, T.ting, T.ting + 0.5);
    if (kt > 0 && kt < 1) {
      const q = ojoS(pS, ALA), k = Math.sin(Math.PI * Math.pow(kt, 0.6));
      estrellita(g, q.x - 2, q.y - 3, 8, kt * 2, k);
      estrellita(g, q.x + 7, q.y - 9, 4, -kt * 3, k * 0.8);
      const { xr, c } = reflejo(pS.x), qr = P(xr - c * (q.x - pS.x), YR + c * (q.y - SUELO));
      g.save();recortaEspejo(g);estrellita(g,qr.x+2,qr.y-3,6,-kt*2,k*0.9);g.restore();
    }
    // «ah… ah…»: la nariz tiembla (rayitas)
    const ah = dentro(t, T.ah1, T.ah1 + 0.1, T.achis - 0.02, T.achis);
    if (ah > 0.01) {
      const n = cabPant(G, pG, P(900, 690));
      g.save(); g.strokeStyle = `rgba(255,240,230,${0.8 * ah})`; g.lineWidth = 1.2; g.lineCap = "round";
      for (let i = 0; i < 3; i++) { const a = -2.4 + i * 0.5 + 0.1 * Math.sin(t * 40 + i), r0 = 9 + 2 * Math.sin(t * 30 + i); g.beginPath(); g.moveTo(n.x + Math.cos(a) * r0, n.y + Math.sin(a) * r0); g.lineTo(n.x + Math.cos(a) * (r0 + 5), n.y + Math.sin(a) * (r0 + 5)); g.stroke(); }
      g.restore();
    }
    // ¡ACHÍS!: gotitas y ráfaga hacia Sara
    const ka = fase(t, T.achis, T.achis + 0.55);
    if (ka > 0 && ka < 1) {
      const n = cabPant(G, poseG(T.achis), P(890, 720));
      g.save(); g.lineCap = "round";
      for (let i = 0; i < 16; i++) {
        const a = Math.PI - 0.15 + (hash(i * 3.7) - 0.5) * 0.9, v = 120 + 160 * hash(i * 1.9), d = v * ka * (1 - 0.35 * ka);
        const x = n.x + Math.cos(a) * d, y = n.y + Math.sin(a) * d + 60 * ka * ka;
        g.fillStyle = `rgba(210,235,255,${(1 - ka) * 0.9})`; g.beginPath(); g.arc(x, y, 1.1 + 1.3 * hash(i * 5.3), 0, TAU); g.fill();
      }
      g.strokeStyle = `rgba(235,245,255,${0.85 * (1 - ka)})`; g.lineWidth = 1.6;
      for (let i = 0; i < 4; i++) { const y = n.y - 10 + i * 8, x0 = n.x - 10 - 50 * ka, L = 16 + 10 * hash(i); g.beginPath(); g.moveTo(x0, y); g.quadraticCurveTo(x0 - L / 2, y - 3, x0 - L, y + 1); g.stroke(); }
      g.restore();
    }
    // garabatos: virutas de lápiz al frotar
    const fr = dentro(t, T.arr1a, T.arr1a + 0.05, T.arr1b - 0.05, T.arr1b) + dentro(t, T.arr2a, T.arr2a + 0.05, T.arr2b - 0.05, T.arr2b) + dentro(t, T.arr3a, T.arr3a + 0.05, T.arr3b - 0.05, T.arr3b);
    if (fr > 0.01) {
      const q = puntaLapiz(pS);
      g.save(); g.strokeStyle = `rgba(255,255,255,${0.7 * fr})`; g.lineWidth = 1.1; g.lineCap = "round";
      for (let i = 0; i < 3; i++) { const a = t * 17 + i * 2.1, r0 = 6; g.beginPath(); g.moveTo(q.x + Math.cos(a) * r0, q.y + Math.sin(a) * r0); g.lineTo(q.x + Math.cos(a) * (r0 + 4), q.y + Math.sin(a) * (r0 + 4)); g.stroke(); }
      g.restore();
    }
    // le encanta: estrellitas alrededor del reflejo; rock: rayitas de cabeceo
    const gu = dentro(t, T.gGusta, T.gGusta + 0.15, T.fin, T.fin + 0.4);
    if (gu > 0.01) {
      const { xr, c } = reflejo(pG.x), h = cabPant(G, pG, P(760, 560)), qr = P(xr - c * (h.x - pG.x), YR + c * (h.y - SUELO));
      g.save();recortaEspejo(g);
      for (let i = 0; i < 5; i++) { const a = i * TAU / 5 + t * 1.4, r = 30 + 4 * Math.sin(t * 5 + i); estrellita(g, qr.x + Math.cos(a) * r, qr.y + Math.sin(a) * r * 0.9, 4.2, t * 2 + i, gu * (0.6 + 0.4 * Math.sin(t * 9 + i * 2))); }
      g.restore();
    }
    const cb = cabeceo(t);
    if (cb > 0.01) {
      const h = cabPant(G, pG, P(760, 400)), ph = (t - T.gRock1) * 2.6 % 1;
      g.save(); g.strokeStyle = `rgba(255,236,170,${0.8 * cb * Math.sin(Math.PI * ph)})`; g.lineWidth = 2; g.lineCap = "round";
      for (const sg of [-1, 1]) for (let i = 0; i < 2; i++) { const x = h.x + sg * (34 + i * 8), y = h.y - 6 + i * 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + sg * 8, y - 6); g.stroke(); }
      g.restore();
    }
  }
  // punta del lápiz (pantalla) para los efectos
  function puntaLapiz(pS) {
    return puntosLapiz(pS,pS.manoLejos.objeto?pS.__l:pS.__c).punta;
  }
  function puntosLapiz(p,st){
    const z=rota(P(PINZA.x*ESC_MANO_S,PINZA.y*ESC_MANO_S),st.mu+Math.PI/2);
    const base=P(st.x+z.x*Sa.JK,st.y+z.y*Sa.JK), c=Math.cos(st.a),s=Math.sin(st.a);
    const mundo=d=>{const q=Sa.aPantalla(p,P(base.x+c*d,base.y+s*d));return P(p.x+(q.x-p.x)*(p.sx??1),q.y);};
    return {pinza:mundo(0),punta:mundo((st.extra||0)+LP_S),cola:mundo((st.extra||0)-LB_SCR/(S*Sa.K))};
  }

  /* ---------- cámara ---------- */
  const CAMS = {
    ancho: { k: 1.16, x: 405, y: 318 },
    sara: { k: 2.2, x: 178, y: 222 },
    medio: { k: 1.42, x: 360, y: 290 },
    caras: { k: 1.9, x: 335, y: 236 },
    achis: { k: 2.05, x: 335, y: 232 },
    espejo: { k: 1.62, x: 245, y: 250 },
    final: { k: 1.16, x: 352, y: 316 }
  };
  const GUION_CAM = [
    [0.55, 1.2, "sara"], [2.45, 3.2, "medio"], [3.25, 3.75, "ancho"], [3.95, 4.5, "medio"], [4.95, 5.65, "caras"], [6.7, 7.05, "achis"], [7.2, 7.8, "caras"],
    [9.95, 10.55, "espejo"], [11.3, 11.85, "final"]
  ];
  function camara(t) {
    const c = guion(GUION_CAM, CAMS, "ancho", t);
    const u = t - T.achis; let dx = 0, dy = 0;
    if (u > 0 && u < 0.6) { dx = 3 * Math.exp(-u * 8) * Math.sin(u * 55); dy = 2 * Math.exp(-u * 8) * Math.sin(u * 47 + 1); }
    return { k: c.k, x: c.x + dx, y: c.y + dy };
  }

  function poses(t) { return { g: poseG(t), s: poseS(t) }; }

  class ElDelineado extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !Sa.listo()) return;
      if (!fondo) { fondo = creaFondo(); tocador = creaTocador(); }
      const pG = poseG(t), pS = poseS(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      g.drawImage(fondo, FX, FY, FW, FH);
      // el reflejo solo si el cristal está en pantalla
      const izq = cam.x - W / 2 / cam.k;
      if (izq < 175) reflejos(g, t, pG, pS);
      g.drawImage(tocador, -60, -20, 300, 520);
      parpadeoBombilla(g, t);
      sombra(g, pG.x, 46); sombra(g, pS.x, 40);
      dibuja(g, G, pG, t);
      dibuja(g, Sa, pS, t);
      efectos(g, t, pG, pS);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }

  registrar({ id: "00123.2", nombre: "Guillermo y Sara · El delineado (revisión 2)", crear: () => new ElDelineado() });
  // diagnóstico: distancia hombro → muñeca / largo del brazo (≤ 1,08 o la mano se despega)
  function diag(t) {
    const out = {};
    for (const [n, Rg, p] of [["g", G, poseG(t)], ["s", Sa, poseS(t)]]) for (const lado of ["cerca", "lejos"]) {
      const m = lado === "cerca" ? p.manoCerca : p.manoLejos; if (!m) continue;
      const Tr = Rg.tronco(p), h = Tr(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO), mu = m.mu ?? -1.75;
      const w = { x: m.x + Math.cos(mu) * Rg.MUNECA_R * Rg.JK, y: m.y + Math.sin(mu) * Rg.MUNECA_R * Rg.JK };
      out[n + lado] = +(Math.hypot(w.x - h.x, w.y - h.y) / (lado === "cerca" ? Rg.BRAZO_C_L : Rg.BRAZO_L)).toFixed(3);
    }
    return out;
  }
  window.__A2D_00123_2={pose:poses,poseG,poseS,T,DUR,diag,puntaLapiz,puntosLapiz,puntaRayaS,puntaRayaG,puntoPasada,puntaDifumina,
    cabG,pieDe,PIES_G,PIES_S,CRISTAL,reflejos,reflejo,YR,SUELO,dibuja,pintaPasadas,camara,maquillajeG};
})();
