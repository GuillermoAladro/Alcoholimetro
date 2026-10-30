"use strict";
/* 00050 · Guillermo y Carla · Las gafas de sol
 *
 * Negro → mediodía de verano a la puerta del bar, en un pueblo blanco junto al mar: sol que
 * deslumbra, buganvilla, una farola de hierro y una papelera junto al bordillo. Guillermo se hace
 * visera con la mano, deslumbrado → Carla coge por la patilla las gafas que lleva subidas en el
 * pelo, se las baja, se echa la melena atrás (destello en el cristal) y se va calle abajo muy chula
 * → Guillermo saca sus gafas del bolsillo, las abre de un golpe de muñeca, mira a cámara y se las
 * pone… y el mundo se queda casi negro (una viñeta que se cierra a su alrededor): sus gafas son
 * demasiado oscuras → sale detrás de ella andando a lo guay, con las manos en los bolsillos, sin ver;
 * se va desviando hacia el bordillo y se da de morros con la farola: ¡boing!, la farola vibra, gafas
 * torcidas, chichón y estrellitas → retrocede dando tumbos con los brazos como aspas y choca de culo
 * con la papelera: la tapa sale volando dando vueltas y le cae en la cabeza → Carla vuelve, se sube
 * sus gafas para mirarle bien, le sube a él las suyas a la frente y se ríe → Guillermo parpadea,
 * la ve, se rasca la nuca y se pone colorado → Carla da media vuelta, le tiende la mano y se lo lleva
 * de la mano calle abajo, esta vez por delante de la farola, guiñando un ojo a cámara → negro.
 *
 * Sin textos (el cartel del bar solo lleva una copa). Todo depende del tiempo absoluto. Las gafas,
 * la tapa y las manos que se cogen se calculan a partir de las posturas de los dos personajes.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, tramo, mezcla, ruido, hash } = M2;
  const G = Guillermo, CA = Carla;
  const S = 0.30, KC = S * CA.K;
  const Y_MED = 516, Y_DEL = 552, Y_FRE = 568;   // suelo: paseo, junto al bordillo (farola y papelera) y delante de la farola
  const DUR = 14.5;
  const T = {
    // Carla se baja las gafas y se va
    cMano0: 0.85, cToca: 1.15, cBaja1: 1.55, cFlick1: 1.95, cBrillo: 1.7, cMira: 1.9, cSale0: 2.3, cSale1: 4.8,
    // Guillermo: visera, saca sus gafas, se las pone
    gVisera0: 0.45, gVisera1: 1.85, gMira: 2.0, gWow: 2.6,
    gSaca0: 2.95, gSaca1: 3.45, gAbre0: 3.5, gAbre1: 3.8, gChulo: 3.5, gPone0: 3.85, gPone1: 4.35, gSuelta1: 4.95,
    osc0: 4.45, osc1: 4.8, oscFin0: 5.3, oscFin1: 5.7,
    anda0: 5.75, bonk: 7.95, tamb0: 8.15, tope: 9.3, tapa: 9.85,
    // Carla vuelve y le rescata
    cVuelve0: 8.55, cLlega: 10.25, cGafasArriba0: 10.2, cGafasArriba1: 10.55,
    cLevanta0: 10.65, cLevanta1: 11.15, gVe0: 11.2, gSonrie: 11.65, cRie: 11.3,
    cGira0: 11.8, cGira1: 12.2, cOfrece0: 12.2, cogen: 12.5,
    salen0: 12.55, guino: 13.5,
    fin: 13.85
  };

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const ABIERTA = D(1, 1), RELAJADA = D(0.55, 0.6, 0.55, 0.5, 0.45), LACIA = D(0.7, 0.8, 0.7, 0.65, 0.6),
    AGARRA = D(0.35, 0.35), DEDO = D(0.3, 1, 0.05, 0.05, 0.05), CADERA = D(0.45, 0.7, 0.7, 0.65, 0.6), COGE = D(0.45, 0.5, 0.45, 0.4, 0.35);

  /* ---------- caras (mismos campos para los dos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, wi: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* ---------- pasos: cada pisada es [t0, t1, x de pantalla, suelo de pantalla, altura] ---------- */
  function pie(lista, t, alto) {
    let i = 0; while (i + 1 < lista.length && t >= lista[i + 1][0]) i++;
    const [t0, t1, x, y, h] = lista[i], xa = i > 0 ? lista[i - 1][2] : x, ya = i > 0 ? lista[i - 1][3] : y, u = fase(t, t0, t1);
    const arco = Math.sin(Math.PI * u);
    return { x: lerp(xa, x, suave5(u)), y: lerp(ya, y, suave5(u)), alza: (h ?? alto) * arco, ang: -0.15 * arco, u };
  }
  // n pasos alternos de t0 a t1 que acaban con la pelvis en X1 (los pies a sus distancias `off`);
  // el suelo pasa a y1 en los pasos [desde, desde + nY)
  function caminata(P, off, t0, t1, n, primero, X1, y1, alto, desde = 0, nY = 1) {
    const ult = l => P[l][P[l].length - 1], otro = l => (l === "cerca" ? "lejos" : "cerca");
    const lados = []; for (let i = 0; i < n; i++) lados.push(i % 2 === 0 ? primero : otro(primero));
    const cuenta = { cerca: lados.filter(l => l === "cerca").length, lejos: lados.filter(l => l === "lejos").length };
    const x0 = { cerca: ult("cerca")[2], lejos: ult("lejos")[2] }, y0 = ult(primero)[3];
    const hechos = { cerca: 0, lejos: 0 }, dt = (t1 - t0) / n;
    for (let i = 0; i < n; i++) {
      const l = lados[i]; hechos[l]++;
      const x = lerp(x0[l], X1 + off[l], hechos[l] / cuenta[l]);
      const y = lerp(y0, y1, clamp((i + 1 - desde) / nY));
      P[l].push([t0 + i * dt, t0 + i * dt + dt * 0.95, x, y, alto]);
    }
  }

  /* =====================================================================================
   * GEOMETRÍA DEL DECORADO
   * ===================================================================================== */
  const LX = 700, POSTE_R = 6;                        // farola (en el bordillo)
  const BX = 400, BASE_Y = Y_DEL + 3, CUBO_H = 100, CUBO_W = 72, TAPA_Y = BASE_Y - CUBO_H - 3;   // papelera
  const XG0 = 250, XC0 = 470;                         // Guillermo y Carla al empezar (en el paseo)
  const OFF_G = { cerca: -19, lejos: 18 };
  const offC = esp => ({ cerca: -60 * KC * (esp ? -1 : 1), lejos: 70 * KC * (esp ? -1 : 1) });
  const TOB_G = { cerca: G.SUELO - G.TOBILLO_ALTO, lejos: G.SUELO - G.TOBILLO_ALTO - 12 };
  const TOB_C = CA.SUELO - CA.TOBILLO_ALTO;
  const NARIZ = { x: 884, y: 694 };                  // punta de la nariz de Guillermo (retrato)

  /* =====================================================================================
   * GAFAS (unidades del retrato, origen en el puente)
   * ===================================================================================== */
  const GAF_G = {                                      // las de Guillermo: wayfarer negras, cristales opacos
    cerca: [[-146, -32], [-20, -36], [-26, 32], [-130, 42]],
    lejos: [[18, -36], [92, -38], [88, 32], [26, 42]],
    bisagra: { x: -146, y: -22 }, patilla: { x: -262, y: 46 }, plegada: { x: -40, y: -10 },
    agarre: { x: -168, y: -14 }
  };
  const GAF_C = {                                      // las de Carla: ojo de gato, cristales caramelo
    cerca: [[-118, -40], [-14, -26], [-16, 26], [-104, 34]],
    lejos: [[14, -28], [92, -42], [90, 26], [22, 34]],
    bisagra: { x: -116, y: -30 }, patilla: { x: -170, y: 44 }
  };
  // posiciones en el retrato
  const POS_G = { ojos: { x: 853, y: 597, ang: 0.33, sx: 1, sy: 1 }, torcidas: { x: 846, y: 612, ang: 0.55, sx: 1, sy: 1 },
    frente: { x: 838, y: 448, ang: 0.22, sx: 0.96, sy: 0.78 } };
  const POS_C = { pelo: { x: 868, y: 328, ang: 0.3, sx: 0.96, sy: 0.74 }, ojos: { x: 905, y: 470, ang: 0.38, sx: 1, sy: 1 } };
  const mezP = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), ang: lerp(a.ang, b.ang, k), sx: lerp(a.sx, b.sx, k), sy: lerp(a.sy, b.sy, k) });
  const colocar = q => new DOMMatrix().translateSelf(q.x, q.y).rotateSelf(q.ang * 180 / Math.PI).scaleSelf(q.sx, q.sy);
  // retrato → pantalla (incluye la escala de la cabeza, su giro y el espejo)
  function matRetrato(R, p) {
    const H = R.cabeza(p);
    const o = R.aPantalla(p, H.a({ x: 0, y: 0 })), ax = R.aPantalla(p, H.a({ x: 1, y: 0 })), ay = R.aPantalla(p, H.a({ x: 0, y: 1 }));
    return new DOMMatrix([ax.x - o.x, ax.y - o.y, ay.x - o.x, ay.y - o.y, o.x, o.y]);
  }
  const aplica = (M, q) => ({ x: M.a * q.x + M.c * q.y + M.e, y: M.b * q.x + M.d * q.y + M.f });
  const descompon = M => ({ x: M.e, y: M.f, ang: Math.atan2(M.b, M.a), sx: Math.hypot(M.a, M.b), sy: Math.hypot(M.c, M.d) });

  function cuadRed(g, pts, r) {
    const n = pts.length; g.beginPath();
    for (let i = 0; i < n; i++) {
      const a = pts[(i + n - 1) % n], b = pts[i], c = pts[(i + 1) % n];
      const ma = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], mc = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];
      if (i === 0) g.moveTo(ma[0], ma[1]);
      g.arcTo(b[0], b[1], mc[0], mc[1], r);
    }
    g.closePath();
  }
  // dibuja unas gafas (abre: patilla 0 plegada … 1 abierta)
  function dibGafas(g, GF, estilo, abre = 1) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const tinta = "#0b0a0e";
    // patilla (por detrás de los cristales)
    const fin = GF.plegada ? mezcla(GF.plegada, GF.patilla, abre) : GF.patilla;
    g.beginPath(); g.moveTo(GF.bisagra.x, GF.bisagra.y); g.quadraticCurveTo((GF.bisagra.x + fin.x) / 2, Math.min(GF.bisagra.y, fin.y) - 6, fin.x, fin.y);
    g.lineWidth = 17; g.strokeStyle = tinta; g.stroke(); g.lineWidth = 9; g.strokeStyle = estilo.patilla; g.stroke();
    for (const lado of ["lejos", "cerca"]) {
      const pts = GF[lado];
      cuadRed(g, pts, 14);
      const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]);
      const gr = g.createLinearGradient(0, Math.min(...ys), 0, Math.max(...ys));
      gr.addColorStop(0, estilo.cristal[0]); gr.addColorStop(1, estilo.cristal[1]);
      g.fillStyle = gr; g.fill();
      // brillo diagonal
      g.save(); cuadRed(g, pts, 14); g.clip();
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), w = x1 - x0;
      g.fillStyle = "rgba(255,255,255,0.32)";
      g.beginPath(); g.moveTo(x0 + w * 0.2, y0 - 4); g.lineTo(x0 + w * 0.42, y0 - 4); g.lineTo(x0 + w * 0.12, y1 + 4); g.lineTo(x0 - w * 0.1, y1 + 4); g.closePath(); g.fill();
      g.fillStyle = "rgba(255,255,255,0.16)";
      g.beginPath(); g.moveTo(x0 + w * 0.52, y0 - 4); g.lineTo(x0 + w * 0.6, y0 - 4); g.lineTo(x0 + w * 0.3, y1 + 4); g.lineTo(x0 + w * 0.22, y1 + 4); g.closePath(); g.fill();
      g.restore();
      // montura gruesa
      cuadRed(g, pts, 14); g.lineWidth = 22; g.strokeStyle = tinta; g.stroke();
      cuadRed(g, pts, 14); g.lineWidth = 12; g.strokeStyle = estilo.montura; g.stroke();
      if (estilo.luzMontura) { g.strokeStyle = estilo.luzMontura; g.lineWidth = 4; g.beginPath(); g.moveTo(pts[0][0] + 10, pts[0][1] + 2); g.lineTo(pts[1][0] - 10, pts[1][1] + 2); g.stroke(); }
    }
    // puente
    const a = GF.cerca[1], b = GF.lejos[0];
    g.beginPath(); g.moveTo(a[0] - 4, a[1] + 14); g.quadraticCurveTo((a[0] + b[0]) / 2, a[1] + 4, b[0] + 4, b[1] + 14);
    g.lineWidth = 18; g.strokeStyle = tinta; g.stroke(); g.lineWidth = 9; g.strokeStyle = estilo.montura; g.stroke();
    if (estilo.remaches) { g.fillStyle = "#f2c14e"; for (const q of [GF.cerca[0], GF.lejos[1]]) { g.beginPath(); g.arc(q[0] + (q[0] < 0 ? 10 : -10), q[1] + 12, 5, 0, Math.PI * 2); g.fill(); } }
    g.restore();
  }
  const ESTILO_G = { cristal: ["#24262e", "#050507"], montura: "#17161b", patilla: "#17161b", luzMontura: "rgba(255,255,255,0.35)" };
  const ESTILO_C = { cristal: ["rgba(48,22,12,0.93)", "rgba(150,82,34,0.88)"], montura: "#141016", patilla: "#141016", luzMontura: "rgba(255,230,200,0.45)", remaches: true };

  /* ---------- tapa de la papelera (unidades de pantalla, centrada en el borde) ---------- */
  function dibTapa(g) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const tinta = "#0b0a0e";
    g.beginPath(); g.ellipse(0, 0, 43, 7, 0, 0, Math.PI * 2); g.fillStyle = "#8e98a2"; g.fill(); g.lineWidth = 2.4; g.strokeStyle = tinta; g.stroke();
    g.beginPath(); g.moveTo(-41, -1); g.bezierCurveTo(-36, -22, 36, -22, 41, -1); g.closePath();
    const gr = g.createLinearGradient(-40, 0, 40, 0); gr.addColorStop(0, "#d5dde4"); gr.addColorStop(0.45, "#aab4bd"); gr.addColorStop(1, "#6f7a85");
    g.fillStyle = gr; g.fill(); g.stroke();
    g.strokeStyle = "rgba(60,70,80,0.5)"; g.lineWidth = 1.4;
    for (const r of [0.45, 0.75]) { g.beginPath(); g.ellipse(0, -2, 40 * r, 14 * r, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); }
    g.beginPath(); g.moveTo(-12, -15); g.quadraticCurveTo(0, -28, 12, -15); g.lineWidth = 6; g.strokeStyle = tinta; g.stroke(); g.lineWidth = 3; g.strokeStyle = "#c9d1d8"; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(-16, -11, 9, 3, -0.25, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  /* =====================================================================================
   * GUILLERMO (a la izquierda, mira a la derecha)
   * ===================================================================================== */
  const R_M = G.MUNECA_R * G.JK;
  const manoDesde = (m, a, mu) => { const o = G.rotP({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, a); return { x: m.x - o.x, y: m.y - o.y }; };
  const BOLS_C = manoDesde({ x: 131, y: 652 }, 0, -1.75), BOLS_L = manoDesde({ x: 372, y: 648 }, 0, -1.75);

  const CARAS_G = {
    inicio: E({ mx: 0.85, my: 0, c: 0.35, sd: -2, gd: -0.02, si: -2, gi: -0.02, sonr: 0.1, ancho: 0.9 }),
    sol: E({ mx: 0.85, my: -0.1, c: 0.72, z: 0.6, sd: -8, gd: -0.12, si: -8, gi: -0.12, abre: 6, ancho: 0.9, sonr: -0.25 }),
    mira: E({ mx: 0.9, my: 0, c: 0.15, sd: 14, gd: 0.08, si: 14, gi: 0.08, abre: 10, ancho: 0.7, sonr: 0.2 }),
    wow: E({ mx: 0.9, my: 0, iris: 1.15, sd: 24, gd: 0.15, si: 24, gi: 0.15, abre: 34, ancho: 0.7, sonr: 0.25, lengua: 0.4 }),
    saca: E({ mx: 0.4, my: 0.75, c: 0.2, sd: 8, gd: 0.04, si: 8, gi: 0.04, sonr: 0.45, ancho: 0.95 }),
    chulo: E({ mx: -0.85, my: -0.05, c: 0.3, sd: 16, gd: 0.12, si: 2, gi: -0.04, abre: 4, ancho: 1.05, sonr: 0.85 }),
    puesto: E({ mx: -0.85, my: 0, c: 0.3, sd: 6, gd: 0.04, si: 6, gi: 0.04, abre: 2, ancho: 1, sonr: 0.7 }),
    oscuro: E({ mx: 0, my: 0, c: 0.1, sd: 26, gd: 0.2, si: 26, gi: 0.2, abre: 16, ancho: 0.55, sonr: -0.1 }),
    guay: E({ mx: 0.85, my: -0.1, c: 0.3, sd: 2, gd: -0.02, si: 2, gi: -0.02, abre: 0, ancho: 0.85, sonr: 0.65 }),
    bonk: E({ mx: 0, my: 0, c: 1, z: 1, sd: 20, gd: 0.22, si: 20, gi: 0.22, abre: 30, ancho: 0.75, sonr: -0.55, lengua: 0.4 }),
    mareo: E({ mx: 0, my: 0, c: 0.6, sd: 12, gd: 0.12, si: -6, gi: -0.08, abre: 16, ancho: 0.9, sonr: -0.25, lengua: 0.6 }),
    susto: E({ mx: 0, my: 0, sd: 28, gd: 0.18, si: 28, gi: 0.18, abre: 40, ancho: 0.55, sonr: -0.3 }),
    aturdido: E({ mx: 0, my: 0, c: 0.6, sd: 14, gd: 0.14, si: -2, gi: -0.06, abre: 12, ancho: 1.05, sonr: 0.1, lengua: 0.5 }),
    deslumbra: E({ mx: 0.9, my: 0, c: 0.8, z: 0.9, sd: -6, gd: -0.1, si: -6, gi: -0.1, abre: 8, ancho: 0.9, sonr: -0.2 }),
    ve: E({ mx: 0.9, my: -0.1, iris: 1.1, sd: 18, gd: 0.1, si: 18, gi: 0.1, abre: 6, ancho: 0.8, sonr: 0.3 }),
    sonrie: E({ mx: 0.9, my: -0.1, c: 0.35, h: 1, sd: 16, gd: 0.15, si: 16, gi: 0.15, abre: 18, ancho: 1.1, sonr: 1 }),
    sigue: E({ mx: 0.9, my: -0.15, c: 0.25, h: 0.7, sd: 12, gd: 0.1, si: 12, gi: 0.1, abre: 22, ancho: 1.1, sonr: 0.95, lengua: 0.2 })
  };
  const GUION_CARA_G = [
    [T.gVisera0, T.gVisera0 + 0.3, "sol"], [T.gMira - 0.1, T.gMira + 0.2, "mira"], [T.gWow, T.gWow + 0.2, "wow"],
    [T.gSaca0 - 0.05, T.gSaca0 + 0.25, "saca"], [T.gChulo, T.gChulo + 0.2, "chulo"], [T.gPone1 - 0.15, T.gPone1 + 0.05, "puesto"],
    [T.osc0 + 0.1, T.osc0 + 0.3, "oscuro"], [T.oscFin0, T.oscFin1, "guay"], [T.bonk, T.bonk + 0.04, "bonk"], [T.bonk + 0.35, T.bonk + 0.6, "mareo"],
    [T.tope, T.tope + 0.06, "susto"], [T.tapa + 0.05, T.tapa + 0.3, "aturdido"], [T.cLevanta1 - 0.05, T.gVe0 + 0.1, "deslumbra"],
    [T.gVe0 + 0.3, T.gVe0 + 0.45, "ve"], [T.gSonrie, T.gSonrie + 0.25, "sonrie"], [T.salen0, T.salen0 + 0.3, "sigue"]
  ];
  const CUERPOS_G = {
    inicio: { pel: 0, torso: -0.02, cab: 0 },
    sol: { pel: 2, torso: -0.04, cab: 0.02 },
    mira: { pel: 4, torso: 0.04, cab: 0.04 },
    wow: { pel: 0, torso: -0.02, cab: -0.04 },
    saca: { pel: 6, torso: 0.06, cab: 0.12 },
    chulo: { pel: 0, torso: -0.06, cab: -0.1 },
    oscuro: { pel: 2, torso: 0, cab: -0.02 },
    anda: { pel: 0, torso: -0.06, cab: -0.14 },
    golpe: { pel: 14, torso: -0.2, cab: -0.26 },
    tambalea: { pel: 18, torso: -0.08, cab: -0.06 },
    tope: { pel: 10, torso: 0.14, cab: 0.04 },
    aturdido: { pel: 50, torso: 0.05, cab: 0.12 },
    endereza: { pel: 26, torso: 0.06, cab: 0.04 },
    sigue: { pel: 6, torso: 0.02, cab: -0.04 }
  };
  const GUION_CUERPO_G = [
    [T.gVisera0, T.gVisera0 + 0.3, "sol"], [T.gMira - 0.1, T.gMira + 0.3, "mira"], [T.gWow, T.gWow + 0.2, "wow"],
    [T.gSaca0, T.gSaca0 + 0.3, "saca"], [T.gChulo, T.gChulo + 0.25, "chulo"], [T.osc0, T.osc0 + 0.3, "oscuro"],
    [T.anda0 - 0.1, T.anda0 + 0.25, "anda"], [T.bonk, T.bonk + 0.08, "golpe", salida], [T.tamb0, T.tamb0 + 0.3, "tambalea"],
    [T.tope, T.tope + 0.08, "tope", salida], [T.tapa, T.tapa + 0.35, "aturdido"], [T.cLevanta1, T.gVe0 + 0.4, "endereza"],
    [T.salen0 - 0.1, T.salen0 + 0.3, "sigue"]
  ];

  let GEO = null;                                       // geometría que depende de las posturas (se calcula una vez)
  function preparaGeo() {
    GEO = {};
    // dónde tiene que estar la pelvis para que la nariz dé justo en la farola
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", T.bonk - 0.001);
    const p0 = { x: 0, suelo: Y_DEL, s: S, pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel }, torso: b.torso, torsoEsc: { x: 1, y: 1 },
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } } };
    const nariz = G.aPantalla(p0, G.cabeza(p0).a(NARIZ));
    GEO.X_BONK = LX - POSTE_R + 2 - nariz.x;
    GEO.NARIZ_Y = nariz.y;
    // dónde tiene que estar para que el culo dé justo en la papelera
    const bt = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", T.tope + 0.001);
    const p1 = { x: 0, suelo: Y_DEL, s: S, pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + bt.pel }, torso: bt.torso, torsoEsc: { x: 1, y: 1 } };
    const culo = G.aPantalla(p1, G.tronco(p1)({ x: 112, y: 735 }));
    GEO.X_BIN = BX + CUBO_W / 2 - culo.x - 2;
    GEO.X_C1 = GEO.X_BIN + 140;                                 // Carla a su lado
    // pisadas de Guillermo
    const PG = { cerca: [[-10, -9, XG0 + OFF_G.cerca, Y_MED]], lejos: [[-10, -9, XG0 + OFF_G.lejos, Y_MED]] };
    caminata(PG, OFF_G, T.anda0, T.bonk, 6, "cerca", GEO.X_BONK, Y_DEL, 30, 0, 6);
    caminata(PG, OFF_G, T.tamb0, T.tope - 0.04, 4, "lejos", GEO.X_BIN, Y_DEL, 20);
    // se va de la mano de Carla: ella tira un paso por delante y los dos llevan el mismo compás
    const dtS = 0.27, nS = 9, D_SAL = 330, SEP = 150;
    caminata(PG, OFF_G, T.salen0, T.salen0 + dtS * nS, nS, "cerca", GEO.X_BIN + D_SAL, Y_FRE, 24, 0, 2);
    GEO.PG = PG;
    // pisadas de Carla
    const oR = offC(false), oL = offC(true);
    const PC = { cerca: [[-10, -9, XC0 + oR.cerca, Y_MED]], lejos: [[-10, -9, XC0 + oR.lejos, Y_MED]] };
    caminata(PC, oR, T.cSale0, T.cSale1, 10, "cerca", 1112, Y_MED, 24);
    // fuera de plano se da la vuelta y vuelve deprisa
    PC.cerca.push([T.cVuelve0 - 0.4, T.cVuelve0 - 0.39, 1112 + oL.cerca, Y_MED]); PC.lejos.push([T.cVuelve0 - 0.4, T.cVuelve0 - 0.39, 1112 + oL.lejos, Y_MED]);
    caminata(PC, oL, T.cVuelve0, T.cLlega, 8, "cerca", GEO.X_C1, Y_DEL, 26, 6, 2);
    // se adelanta medio paso para llegar a sus gafas
    PC.lejos.push([T.cLevanta0 - 0.3, T.cLevanta0 - 0.02, GEO.X_C1 + oL.lejos - 32, Y_DEL, 16]);
    // media vuelta: saltito con los dos pies a la vez
    PC.cerca.push([T.cGira0 + 0.05, T.cGira1 - 0.05, GEO.X_C1 + 18 + oR.cerca, Y_DEL, 7]); PC.lejos.push([T.cGira0 + 0.05, T.cGira1 - 0.05, GEO.X_C1 + 18 + oR.lejos, Y_DEL, 7]);
    caminata(PC, oR, T.salen0, T.salen0 + dtS * nS, nS, "cerca", GEO.X_BIN + D_SAL + SEP, Y_FRE, 22, 0, 2);
    GEO.PC = PC;
  }

  function cuerpoG(t) {
    if (!GEO) preparaGeo();
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const respira = Math.sin(t * 2.4);
    const fc = pie(GEO.PG.cerca, t, 30), fl = pie(GEO.PG.lejos, t, 30);
    const anda = dentro(t, T.anda0, T.anda0 + 0.2, T.bonk - 0.08, T.bonk) + dentro(t, T.salen0, T.salen0 + 0.2, DUR, DUR + 1);
    const tamb = dentro(t, T.tamb0, T.tamb0 + 0.15, T.tope - 0.1, T.tope);
    const bote = Math.max(Math.sin(Math.PI * fc.u), Math.sin(Math.PI * fl.u));
    const lado = fc.u > 0 && fc.u < 1 ? 1 : -1;
    const contoneo = Math.sin(Math.PI * (fc.u > 0 && fc.u < 1 ? fc.u : fl.u)) * lado;
    let X = (fc.x - OFF_G.cerca + fl.x - OFF_G.lejos) / 2;
    // retroceso del golpe contra la farola y empujón de la papelera
    const kb = t >= T.bonk ? Math.exp(-(t - T.bonk) * 7) * suave(fase(t, T.bonk, T.bonk + 0.05)) : 0;
    const kt = t >= T.tope ? Math.exp(-(t - T.tope) * 8) * suave(fase(t, T.tope, T.tope + 0.05)) : 0;
    X += -14 * kb + 10 * kt;
    const tapaK = t >= T.tapa ? Math.exp(-(t - T.tapa) * 9) * suave(fase(t, T.tapa, T.tapa + 0.04)) : 0;
    const p = {
      x: X, suelo: (fc.y + fl.y) / 2, s: S, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: G.PELVIS.x + 8 * contoneo * anda, y: G.PELVIS.y + b.pel + respira * 1.3 - 14 * bote * (anda + tamb * 0.6) + 26 * tapaK },
      torso: b.torso + 0.045 * contoneo * anda + 0.09 * Math.sin((t - T.tamb0) * 8) * tamb, torsoEsc: { x: 1, y: 1 + respira * 0.005 },
      piernas: {}, cabeza: { ang: b.cab + 0.04 * contoneo * anda + 0.12 * Math.sin((t - T.tamb0) * 7 + 1) * tamb, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // mareo cuando se queda quieto con la tapa
    const mar = dentro(t, T.tapa + 0.2, T.tapa + 0.5, T.cLevanta1, T.gVe0 + 0.3);
    p.torso += 0.035 * Math.sin(t * 3.1) * mar; p.cabeza.ang += 0.06 * Math.sin(t * 3.1 + 0.8) * mar;
    // la cara se aplasta contra la farola y la cabeza contra la tapa
    const sq = t >= T.bonk ? Math.exp(-(t - T.bonk) * 6) * Math.cos((t - T.bonk) * 24) * suave(fase(t, T.bonk, T.bonk + 0.03)) : 0;
    p.cabeza.esc = { x: 1 - 0.14 * sq, y: 1 + 0.05 * sq - 0.12 * tapaK };
    for (const [ld, f] of [["cerca", fc], ["lejos", fl]]) {
      const hx = G.aHoja(p, { x: f.x, y: 0 }).x;
      p.piernas[ld] = { tob: { x: hx, y: TOB_G[ld] + (f.y - p.suelo) / S - f.alza / S }, ang: f.ang * (anda > 0.5 ? 1.3 : 1) };
    }
    // cara
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [0.3, 2.35, 3.25, 11.15, 11.32, 12.6, 13.4]));
    p.cara.rubor = 0.75 * dentro(t, T.gSonrie, T.gSonrie + 0.3, DUR, DUR + 1) + 0.35 * dentro(t, T.gWow, T.gWow + 0.3, T.gSaca0, T.gSaca0 + 0.3);
    p.rojo = 0.25 * dentro(t, T.bonk, T.bonk + 0.05, T.tope, T.tope + 0.5);
    p.chichonEn = { x: 870, y: 492 };
    p.chichon = t > T.bonk + 0.08 ? clamp(salida(fase(t, T.bonk + 0.08, T.bonk + 0.3)) * (1 + 0.15 * Math.sin(fase(t, T.bonk + 0.08, T.bonk + 0.6) * Math.PI))) : 0;
    p.sudor = 0.6 * dentro(t, T.tope, T.tope + 0.2, T.cLevanta1, T.gVe0 + 0.3);
    p._contoneo = contoneo; p._anda = anda; p._tamb = tamb;
    return p;
  }

  /* =====================================================================================
   * CARLA (primero mira a la derecha; vuelve mirando a la izquierda; se va mirando a la derecha)
   * ===================================================================================== */
  const CARAS_C = {
    inicio: E({ mx: 0.85, my: -0.1, c: 0.3, sd: 6, gd: 0.04, si: 6, gi: 0.04, sonr: 0.45, ancho: 0.85 }),
    sube: E({ mx: 0.6, my: -0.6, c: 0.2, sd: 14, gd: 0.08, si: 14, gi: 0.08, abre: 4, ancho: 0.8, sonr: 0.5 }),
    gafas: E({ mx: -0.85, my: -0.05, c: 0.3, sd: 12, gd: 0.08, si: 4, gi: 0, abre: 6, ancho: 0.95, sonr: 0.85 }),
    anda: E({ mx: 0.85, my: -0.05, c: 0.25, sd: 8, gd: 0.04, si: 8, gi: 0.04, abre: 0, ancho: 0.85, sonr: 0.6 }),
    vuelve: E({ mx: 0.9, my: 0.05, sd: 22, gd: 0.14, si: 22, gi: 0.14, abre: 14, ancho: 0.6, sonr: 0.05 }),
    ceja: E({ mx: 0.9, my: 0.1, c: 0.25, sd: 2, gd: -0.02, si: 26, gi: 0.16, abre: 0, ancho: 0.8, sonr: 0.45 }),
    levanta: E({ mx: 0.9, my: -0.2, c: 0.2, sd: 12, gd: 0.08, si: 12, gi: 0.08, abre: 4, ancho: 0.85, sonr: 0.55 }),
    rie: E({ mx: 0.6, my: 0.2, c: 1, h: 1, sd: 16, gd: 0.12, si: 16, gi: 0.12, abre: 30, ancho: 1.15, sonr: 1, lengua: 0.3 }),
    tierna: E({ mx: 0.9, my: 0, c: 0.4, h: 0.8, sd: 12, gd: 0.1, si: 12, gi: 0.1, abre: 6, ancho: 0.95, sonr: 0.8 }),
    guino: E({ mx: -0.85, my: -0.05, c: 0.25, wi: 0.75, sd: 12, gd: 0.08, si: -4, gi: -0.05, abre: 10, ancho: 1.05, sonr: 0.95 }),
    sale: E({ mx: 0.85, my: 0, c: 0.3, sd: 8, gd: 0.05, si: 8, gi: 0.05, abre: 4, ancho: 0.95, sonr: 0.8 })
  };
  const GUION_CARA_C = [
    [T.cMano0, T.cMano0 + 0.25, "sube"], [T.cBaja1 - 0.05, T.cBaja1 + 0.15, "gafas"], [T.cSale0, T.cSale0 + 0.25, "anda"],
    [T.cVuelve0 - 0.3, T.cVuelve0 - 0.2, "vuelve"], [T.cLlega - 0.05, T.cLlega + 0.2, "ceja"], [T.cLevanta0, T.cLevanta0 + 0.2, "levanta"],
    [T.cRie, T.cRie + 0.15, "rie"], [T.cGira0 - 0.1, T.cGira0 + 0.1, "tierna"], [T.guino - 0.05, T.guino + 0.15, "guino"], [T.guino + 0.6, T.guino + 0.8, "sale"]
  ];
  const CUERPOS_C = {
    inicio: { pel: 4, torso: -0.04, cab: -0.04, cad: -14 },
    sube: { pel: 2, torso: -0.06, cab: -0.12, cad: -16 },
    gafas: { pel: 6, torso: -0.08, cab: -0.16, cad: -24 },
    anda: { pel: 0, torso: -0.03, cab: -0.04, cad: 0 },
    vuelve: { pel: 0, torso: 0.04, cab: 0.04, cad: 0 },
    ceja: { pel: 6, torso: -0.04, cab: 0.08, cad: -20 },
    puntillas: { pel: -26, torso: 0.17, cab: -0.04, cad: 6 },
    rie: { pel: 10, torso: 0.1, cab: 0.08, cad: -12 },
    tierna: { pel: 6, torso: 0, cab: 0.02, cad: -12 },
    sale: { pel: 0, torso: -0.03, cab: -0.04, cad: 0 }
  };
  const GUION_CUERPO_C = [
    [T.cMano0, T.cMano0 + 0.3, "sube"], [T.cBaja1 - 0.1, T.cBaja1 + 0.2, "gafas"], [T.cSale0, T.cSale0 + 0.25, "anda"],
    [T.cVuelve0 - 0.3, T.cVuelve0 - 0.2, "vuelve"], [T.cLlega - 0.1, T.cLlega + 0.2, "ceja"], [T.cLevanta0, T.cLevanta0 + 0.25, "puntillas"],
    [T.cLevanta1, T.cLevanta1 + 0.2, "rie"], [T.cGira0 - 0.1, T.cGira0 + 0.15, "tierna"], [T.salen0, T.salen0 + 0.3, "sale"]
  ];
  // espejo de Carla y su media vuelta (escala horizontal que pasa por cero)
  const vueltaC = t => fase(t, T.cGira0, T.cGira1);
  function espejoC(t) {
    if (t < T.cVuelve0 - 0.4) return false;
    if (t < T.cGira0) return true;
    return suave(vueltaC(t)) < 0.5;
  }

  function cuerpoC(t) {
    if (!GEO) preparaGeo();
    const b = guion(GUION_CUERPO_C, CUERPOS_C, "inicio", t);
    const esp = espejoC(t), off = offC(esp);
    const fc = pie(GEO.PC.cerca, t, 24), fl = pie(GEO.PC.lejos, t, 24);
    const X = (fc.x - off.cerca + fl.x - off.lejos) / 2;
    const andando = dentro(t, T.cSale0, T.cSale0 + 0.2, T.cSale1 - 0.1, T.cSale1) + dentro(t, T.cVuelve0, T.cVuelve0 + 0.1, T.cLlega - 0.1, T.cLlega + 0.05)
      + dentro(t, T.salen0, T.salen0 + 0.2, DUR, DUR + 1);
    const fu = Math.max(Math.sin(Math.PI * fc.u), Math.sin(Math.PI * fl.u));
    const lado = fc.u > 0 && fc.u < 1 ? 1 : -1;
    const contoneo = Math.sin(Math.PI * (fc.u > 0 && fc.u < 1 ? fc.u : fl.u)) * lado * andando;
    const respira = Math.sin(t * 2.1 + 1);
    const rie = dentro(t, T.cRie + 0.1, T.cRie + 0.25, T.cGira0 - 0.15, T.cGira0);
    const p = {
      x: X, suelo: (fc.y + fl.y) / 2, s: S, espejo: esp, tirasLimpias: true, ikContinuo: true,
      pelvis: { x: CA.PELVIS.x + b.cad + 12 * contoneo, y: CA.PELVIS.y + b.pel + respira * 1.2 - 14 * fu * andando + 5 * Math.abs(Math.sin(t * 15)) * rie },
      torso: b.torso - 0.04 * contoneo + 0.025 * Math.sin(t * 15) * rie, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab + 0.03 * contoneo + 0.03 * Math.sin(t * 15 + 1) * rie, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    for (const [ld, f] of [["cerca", fc], ["lejos", fl]]) {
      const hx = CA.aHoja(p, { x: f.x, y: 0 }).x;
      p.piernas[ld] = { tob: { x: hx, y: TOB_C - (ld === "lejos" ? 6 : 0) + (f.y - p.suelo) / KC - f.alza / KC }, ang: f.ang * 1.3 };
    }
    // melena: se la echa atrás con las gafas, bota al andar, vuela en la media vuelta
    const toss = campanaSuave(t, T.cBaja1 - 0.05, T.cFlick1 + 0.25);
    const giro = Math.sin(Math.PI * vueltaC(t));
    p.pelo = { inercia: -0.3 * andando + 0.16 * fu * andando * Math.sin(t * 12) + 0.05 * Math.sin(t * 1.7) - 0.9 * toss,
      viento: 0.35 * toss + 0.7 * giro };
    const ex = guion(GUION_CARA_C, CARAS_C, "inicio", t);
    p.cara = cara(ex, parpadeo(t, [0.55, 2.05, 9.4, 11.55, 12.75]));
    p.cara.rubor = 0.25 * rie;
    p._vuelta = vueltaC(t);
    return p;
  }
  function campanaSuave(t, a, b) { const k = fase(t, a, b); return k <= 0 || k >= 1 ? 0 : Math.pow(Math.sin(Math.PI * k), 2); }

  /* =====================================================================================
   * GAFAS: dónde está cada par en cada instante
   * ===================================================================================== */
  // Carla: posición en su retrato
  function gafasCarla(t) {
    const baja = suave(fase(t, T.cToca, T.cBaja1)), sube = suave(fase(t, T.cGafasArriba0 + 0.1, T.cGafasArriba1));
    return mezP(mezP(POS_C.pelo, POS_C.ojos, baja), { x: 872, y: 348, ang: 0.32, sx: 0.97, sy: 0.78 }, sube);
  }
  // Guillermo: devuelve { M: matriz de pantalla, capa: "mano" | "cara" | null, abre }
  const SC_G = S * 0.6;                                     // retrato de Guillermo → pantalla
  function posCaraG(t) {
    const torc = suave(fase(t, T.bonk, T.bonk + 0.12)), sube = suave(fase(t, T.cLevanta0 + 0.15, T.cLevanta1));
    return mezP(mezP(POS_G.ojos, POS_G.torcidas, torc), POS_G.frente, sube);
  }
  function gafasGuillermo(t, pG) {
    if (t < T.gSaca0 + 0.05) return null;
    const Mcara = matRetrato(G, pG).multiply(colocar(posCaraG(t)));
    if (t >= T.gPone1) return { M: Mcara, capa: "cara", abre: 1 };
    // en la mano: el puño sujeta la montura por la bisagra
    const m = G.aPantalla(pG, pG.manoCerca), k = suave(fase(t, T.gPone0, T.gPone1));
    const angMano = -0.12 + 0.18 * Math.sin((t - T.gAbre0) * 30) * campanaSuave(t, T.gAbre0, T.gAbre1);
    const sc = SC_G * 0.95 * suave(fase(t, T.gSaca0 + 0.08, T.gSaca0 + 0.35));
    const Mm = new DOMMatrix().translateSelf(m.x, m.y).rotateSelf(angMano * 180 / Math.PI).scaleSelf(sc, sc).translateSelf(-GAF_G.agarre.x, -GAF_G.agarre.y);
    if (k <= 0) return { M: Mm, capa: "mano", abre: suave(fase(t, T.gAbre0, T.gAbre1)) };
    const a = descompon(Mm), b = descompon(Mcara);
    const M = new DOMMatrix().translateSelf(lerp(a.x, b.x, k), lerp(a.y, b.y, k)).rotateSelf(lerp(a.ang, b.ang, k) * 180 / Math.PI).scaleSelf(lerp(a.sx, b.sx, k), lerp(a.sy, b.sy, k));
    return { M, capa: "mano", abre: 1 };
  }

  /* =====================================================================================
   * MANOS (se calculan con las dos posturas a la vez)
   * ===================================================================================== */
  const muHacia = (R, p, mano, lado) => { const sh = R.tronco(p)(lado === "cerca" ? R.HOMBRO_C : R.HOMBRO); return Math.atan2(sh.y - mano.y, sh.x - mano.x); };
  function manosG(p, pC, t) {
    const Tr = G.tronco(p), H = G.cabeza(p);
    let c = { x: BOLS_C.x, y: BOLS_C.y }, l = { x: BOLS_L.x, y: BOLS_L.y };
    let cpu = 0, lpu = 0, cang = 0, lang = 0, cmu = -1.75, lmu = -1.75, cd = RELAJADA, ld = RELAJADA;
    const pone = (w, cc, ll) => {
      if (w <= 0) return;
      if (cc) { c = mezcla(c, cc.q, w); cpu = lerp(cpu, 1, w); cang = lerp(cang, cc.ang || 0, w); cmu = lerp(cmu, cc.mu ?? muHacia(G, p, cc.q, "cerca"), w); cd = mezclaD(cd, cc.d, w); }
      if (ll) { l = mezcla(l, ll.q, w); lpu = lerp(lpu, 1, w); lang = lerp(lang, ll.ang || 0, w); lmu = lerp(lmu, ll.mu ?? muHacia(G, p, ll.q, "lejos"), w); ld = mezclaD(ld, ll.d, w); }
    };
    // visera contra el sol (y otra vez al quitarle las gafas)
    // visera con la mano de delante contra el sol: la palma por encima de las cejas, como una gorra
    const visera = H.a({ x: 958, y: 474 });
    pone(dentro(t, T.gVisera0, T.gVisera0 + 0.35, T.gVisera1 - 0.3, T.gVisera1), null, { q: visera, mu: 2.95, d: ABIERTA });
    // saca las gafas, las abre y se las pone
    const sujeta = Tr({ x: 330, y: 400 });
    const saca = dentro(t, T.gSaca0, T.gSaca1, T.gPone1 + 0.05, T.gSuelta1);
    if (saca > 0) {
      const sacude = campanaSuave(t, T.gAbre0, T.gAbre1);
      let q = { x: sujeta.x + 10 * Math.sin((t - T.gAbre0) * 30) * sacude, y: sujeta.y - 12 * sacude };
      const k = suave(fase(t, T.gPone0, T.gPone1));
      if (k > 0) {
        const Mc = matRetrato(G, p).multiply(colocar(posCaraG(t)));
        const ag = G.aHoja(p, aplica(Mc, GAF_G.agarre));
        q = mezcla(q, ag, k);
      }
      pone(saca, { q, d: AGARRA }, null);
    }
    // tumbos: brazos como aspas (al salir del bolsillo)
    const aspas = dentro(t, T.bonk, T.bonk + 0.12, T.tope + 0.2, T.tapa + 0.25);
    if (aspas > 0) {
      const w = (t - T.bonk) * 9;
      pone(aspas, { q: Tr({ x: 20 + 70 * Math.cos(w), y: 230 + 80 * Math.sin(w) }), d: ABIERTA },
        { q: Tr({ x: 470 + 60 * Math.cos(w + 2.2), y: 240 + 70 * Math.sin(w + 2.2) }), d: ABIERTA });
    }
    // aturdido: brazos colgando, lacios
    const lacio = dentro(t, T.tapa + 0.05, T.tapa + 0.35, T.salen0, T.salen0 + 0.3);
    pone(lacio, { q: Tr({ x: 80, y: 640 }), mu: -1.45, d: LACIA }, { q: Tr({ x: 400, y: 640 }), mu: -1.8, d: LACIA });
    // se rasca la nuca, avergonzado
    const nuca = dentro(t, T.gSonrie - 0.1, T.gSonrie + 0.2, T.cOfrece0 - 0.1, T.cOfrece0 + 0.2);
    if (nuca > 0) pone(nuca, { q: H.a({ x: 585, y: 470 + 14 * Math.sin(t * 22) }), mu: -0.6, d: D(0.4, 0.6, 0.55, 0.5, 0.45) }, null);
    // le da la mano a Carla (la lejana, hacia delante) y se deja llevar
    const coge = tramo(t, T.cOfrece0 + 0.05, T.cogen);
    if (coge > 0 && pC) {
      const q = G.aHoja(p, manoJunta(p, pC, t));
      pone(coge, null, { q, d: COGE });
      // la otra mano se balancea al andar
      const v = Math.sin(Math.PI * 2 * fase(t, T.salen0, T.salen0 + 0.52 * 4.5) * 4.5);
      pone(tramo(t, T.salen0, T.salen0 + 0.3), { q: Tr({ x: 60 - 60 * v, y: 600 - 10 * Math.abs(v) }), d: RELAJADA }, null);
    }
    p.manoCerca = { x: c.x, y: c.y, ang: cang, mu: cmu, dobla: -1, puno: cpu, dedos: cd };
    p.manoLejos = { x: l.x, y: l.y, ang: lang, mu: lmu, dobla: -1, puno: lpu, dedos: ld };
  }
  // punto (pantalla) donde se cogen de la mano: entre el hombro de atrás de Carla y el de delante de Guillermo
  function manoJunta(pG, pC, t) {
    const hc = CA.aPantalla(pC, CA.tronco(pC)(CA.HOMBRO_C)), hg = G.aPantalla(pG, G.tronco(pG)(G.HOMBRO));
    return { x: (hc.x + hg.x) / 2, y: Math.max(hc.y, hg.y) + 50 + 3 * Math.sin(t * 9) };
  }

  function manosC(p, pG, t, gafG) {
    const Tr = CA.tronco(p), H = CA.cabeza(p);
    const B_C = CA.BOLSILLO_C, B_L = CA.BOLSILLO_L;
    let c = Tr(B_C), l = Tr(B_L);
    let cpu = 0, lpu = 0, cmu = -1.75, lmu = -1.75, cd = RELAJADA, ld = RELAJADA;
    const pone = (w, cc, ll) => {
      if (w <= 0) return;
      if (cc) { c = mezcla(c, cc.q, w); cpu = lerp(cpu, 1, w); cmu = lerp(cmu, cc.mu ?? muHacia(CA, p, cc.q, "cerca"), w); cd = mezclaD(cd, cc.d, w); }
      if (ll) { l = mezcla(l, ll.q, w); lpu = lerp(lpu, 1, w); lmu = lerp(lmu, ll.mu ?? muHacia(CA, p, ll.q, "lejos"), w); ld = mezclaD(ld, ll.d, w); }
    };
    // dedo en el puente de sus gafas: la mano queda un poco por encima, apuntando al puente
    const dedoEn = (puente, lado) => {
      const sh = Tr(lado === "cerca" ? CA.HOMBRO_C : CA.HOMBRO);
      const a = Math.atan2(sh.y - puente.y, sh.x - puente.x), r = 30;
      return { q: { x: puente.x + Math.cos(a) * r, y: puente.y + Math.sin(a) * r }, mu: a, d: DEDO };
    };
    // coge sus gafas por la bisagra (la mano queda al lado de la cara, sin taparla)
    const bisagra = () => { const gp = colocar(gafasCarla(t)); return H.a(aplica(gp, { x: -114, y: 8 })); };
    const pinza = (q, lado) => { const sh = Tr(lado === "cerca" ? CA.HOMBRO_C : CA.HOMBRO), a = Math.atan2(sh.y - q.y, sh.x - q.x);
      return { q: { x: q.x + Math.cos(a) * 54, y: q.y + Math.sin(a) * 54 }, mu: a, d: D(0.25, 0.3, 0.45, 0.6, 0.65) }; };
    pone(dentro(t, T.cMano0, T.cToca, T.cBaja1 + 0.2, T.cBaja1 + 0.25), pinza(bisagra(), "cerca"), null);
    // se echa la melena atrás con la mano abierta (cada gesto tapa del todo al anterior antes de soltarlo)
    pone(dentro(t, T.cBaja1, T.cBaja1 + 0.2, T.cFlick1, T.cSale0 + 0.15), { q: H.a({ x: 700, y: 468 }), mu: -1.3, d: ABIERTA }, null);
    // se va: la mano cercana se balancea y la lejana sigue en el bolsillo
    const va = dentro(t, T.cSale0, T.cSale0 + 0.3, T.cSale1, T.cSale1 + 0.1);
    if (va > 0) { const v = Math.sin(Math.PI * 2 * fase(t, T.cSale0, T.cSale1) * 5); pone(va, { q: Tr({ x: 80 - 70 * v, y: 600 - 12 * Math.abs(v) }), d: RELAJADA }, null); }
    // vuelve: la lejana se balancea; luego se sube las gafas con la cercana y se pone en jarras
    const vu = dentro(t, T.cVuelve0 - 0.1, T.cVuelve0 + 0.1, T.cLlega - 0.2, T.cLlega + 0.1);
    if (vu > 0) { const v = Math.sin(Math.PI * 2 * fase(t, T.cVuelve0, T.cLlega) * 4); pone(vu, null, { q: Tr({ x: 400 + 60 * v, y: 600 - 10 * Math.abs(v) }), d: RELAJADA }); }
    const g1 = dentro(t, T.cGafasArriba0 - 0.1, T.cGafasArriba0 + 0.12, T.cGafasArriba1, T.cGafasArriba1 + 0.2);
    if (g1 > 0) pone(g1, pinza(bisagra(), "cerca"), null);
    const jarras = dentro(t, T.cGafasArriba1, T.cGafasArriba1 + 0.25, T.cGira0 - 0.2, T.cGira0);
    pone(jarras, { q: Tr({ x: 132, y: 585 }), mu: -0.5, d: CADERA }, null);
    // le sube las gafas a Guillermo a la frente
    const lev = dentro(t, T.cLevanta0 - 0.1, T.cLevanta0 + 0.15, T.cLevanta1, T.cLevanta1 + 0.25);
    if (lev > 0 && gafG) {
      const puente = CA.aHoja(p, aplica(gafG.M, { x: 0, y: 30 }));
      pone(lev, null, dedoEn(puente, "lejos"));
    }
    // media vuelta y le tiende la mano (la cercana, hacia atrás); la otra al bolsillo
    const tiende = tramo(t, T.cOfrece0 - 0.05, T.cogen - 0.05);
    if (tiende > 0 && pG) {
      const q = CA.aHoja(p, manoJunta(pG, p, t));
      pone(tiende, { q: { x: q.x + 2, y: q.y - 8 }, d: D(0.5, 0.7, 0.7, 0.65, 0.6) }, null);
    }
    p.manoCerca = { x: c.x, y: c.y, ang: 0, mu: cmu, dobla: (t > T.cGira0 + 0.2 ? 1 : -1), puno: cpu, dedos: cd };
    p.manoLejos = { x: l.x, y: l.y, ang: 0, mu: lmu, dobla: 1, puno: lpu, dedos: ld };
  }

  /* =====================================================================================
   * TAPA DE LA PAPELERA: en el cubo, volando, en la cabeza
   * ===================================================================================== */
  const POS_TAPA = { x: 792, y: 296, ang: 0.08, sx: 1 / SC_G, sy: 1 / SC_G };
  function tapa(t, pG) {
    const wob = t >= T.tope ? 0.12 * Math.exp(-(t - T.tope) * 4) * Math.sin((t - T.tope) * 15) : 0;
    const base = { x: BX + Math.sin(wob) * 60, y: TAPA_Y + (1 - Math.cos(wob)) * 30, ang: wob, sx: 1, sy: 1 };
    if (t < T.tope) return { M: colocar(base), capa: "cubo" };
    const bam = (t >= T.tapa ? 0.1 * Math.exp(-(t - T.tapa) * 5) * Math.sin((t - T.tapa) * 18) : 0)
      + 0.05 * Math.sin((t - T.salen0) * 11) * tramo(t, T.salen0, T.salen0 + 0.4);
    const Mc = matRetrato(G, pG).multiply(colocar(Object.assign({}, POS_TAPA, { ang: POS_TAPA.ang + bam })));
    if (t >= T.tapa) return { M: Mc, capa: "cabeza" };
    const u = fase(t, T.tope, T.tapa), d = descompon(Mc);
    const x = lerp(base.x, d.x, u), y = lerp(base.y, d.y, u) - 210 * 4 * u * (1 - u) * (1 - 0.15 * u);
    const ang = lerp(0, d.ang + 2 * Math.PI, suave(u));
    const flip = Math.cos(u * Math.PI * 4);
    return { M: new DOMMatrix().translateSelf(x, y).rotateSelf(ang * 180 / Math.PI).scaleSelf(lerp(1, d.sx, u), lerp(1, d.sy, u) * flip), capa: "aire" };
  }

  /* =====================================================================================
   * POSTURAS DE LOS DOS
   * ===================================================================================== */
  let CAM = null;                                       // matriz de cámara del fotograma (para dibujar en pantalla desde los ganchos)
  const enPantalla = (g, M) => { g.setTransform(CAM); g.transform(M.a, M.b, M.c, M.d, M.e, M.f); };
  function poses(t) {
    const pG = cuerpoG(t), pC = cuerpoC(t);
    manosG(pG, pC, t);
    const gafG = gafasGuillermo(t, pG);
    manosC(pC, pG, t, gafG);
    // ganchos de dibujo
    const tp = tapa(t, pG);
    if (gafG && gafG.capa === "mano") pG.manoCerca.objeto = (g) => { if (!CAM) return; g.save(); enPantalla(g, gafG.M); dibGafas(g, GAF_G, ESTILO_G, gafG.abre); g.restore(); };
    pG.capaCabeza = (g) => {
      if (!CAM) return;
      if (gafG && gafG.capa === "cara") { g.save(); enPantalla(g, gafG.M); dibGafas(g, GAF_G, ESTILO_G, 1); g.restore(); }
      if (tp.capa === "cabeza") { g.save(); enPantalla(g, tp.M); dibTapa(g); g.restore(); }
    };
    const gc = gafasCarla(t);
    const Mgc = colocar(gc);
    pC.capaCabeza = (g) => { g.save(); g.transform(Mgc.a, Mgc.b, Mgc.c, Mgc.d, Mgc.e, Mgc.f); dibGafas(g, GAF_C, ESTILO_C, 1); g.restore(); };
    return { g: pG, c: pC, gafG, tp };
  }

  /* =====================================================================================
   * DECORADO: pueblo blanco junto al mar a mediodía
   * ===================================================================================== */
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 100; const g = c.getContext("2d");
    g.translate(60, 50); g.lineJoin = "round"; g.lineCap = "round";
    const tinta = "#0b0a0e";
    // cielo
    const cielo = g.createLinearGradient(0, -50, 0, 330); cielo.addColorStop(0, "#1f9be3"); cielo.addColorStop(0.65, "#7fd0f5"); cielo.addColorStop(1, "#d2f1ff");
    g.fillStyle = cielo; g.fillRect(-60, -50, W + 120, 400);
    // sol con halo y rayos
    const SX = 905, SY = 62;
    const halo = g.createRadialGradient(SX, SY, 20, SX, SY, 260); halo.addColorStop(0, "rgba(255,250,210,0.95)"); halo.addColorStop(0.3, "rgba(255,240,170,0.45)"); halo.addColorStop(1, "rgba(255,240,170,0)");
    g.fillStyle = halo; g.fillRect(SX - 260, SY - 260, 520, 520);
    g.fillStyle = "rgba(255,236,140,0.55)";
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + 0.1; g.beginPath(); g.moveTo(SX + Math.cos(a - 0.06) * 54, SY + Math.sin(a - 0.06) * 54); g.lineTo(SX + Math.cos(a) * (96 + (i % 2) * 22), SY + Math.sin(a) * (96 + (i % 2) * 22)); g.lineTo(SX + Math.cos(a + 0.06) * 54, SY + Math.sin(a + 0.06) * 54); g.closePath(); g.fill(); }
    g.beginPath(); g.arc(SX, SY, 44, 0, Math.PI * 2); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 3; g.strokeStyle = "#c98a1c"; g.stroke();
    g.fillStyle = "#fff3a8"; g.beginPath(); g.arc(SX - 12, SY - 12, 18, 0, Math.PI * 2); g.fill();
    // nubes
    const nube = (x, y, k) => { g.fillStyle = "#ffffff"; g.strokeStyle = "rgba(90,150,200,0.55)"; g.lineWidth = 2.5;
      g.beginPath(); for (const [dx, dy, r] of [[0, 0, 22], [24, -10, 28], [54, -2, 24], [76, 6, 17], [-20, 8, 15]]) { g.moveTo(x + (dx + r) * k, y + dy * k); g.arc(x + dx * k, y + dy * k, r * k, 0, Math.PI * 2); }
      g.fill(); g.stroke(); g.fillRect(x - 20 * k, y + 6 * k, 96 * k, 14 * k); };
    nube(470, 70, 1.0); nube(650, 140, 0.7);
    // mar al fondo (a la derecha) y casitas blancas en la loma
    g.fillStyle = "#cfe8d0"; g.beginPath(); g.moveTo(330, 300); g.quadraticCurveTo(520, 250, 700, 280); g.quadraticCurveTo(860, 300, W + 60, 270); g.lineTo(W + 60, 330); g.lineTo(330, 330); g.closePath(); g.fill();
    for (let i = 0; i < 12; i++) { const x = 360 + i * 60 + hash(i) * 20, y = 268 + Math.sin(i * 1.3) * 10, w = 26 + hash(i + 3) * 16, h = 18 + hash(i + 5) * 12;
      g.fillStyle = "#fdfbf6"; g.fillRect(x, y - h, w, h); g.strokeStyle = "rgba(60,80,100,0.5)"; g.lineWidth = 1.5; g.strokeRect(x, y - h, w, h);
      g.fillStyle = i % 3 ? "#3b7fc4" : "#d9733a"; g.fillRect(x + w * 0.35, y - h * 0.55, w * 0.25, h * 0.4); }
    const mar = g.createLinearGradient(0, 312, 0, 400); mar.addColorStop(0, "#27b8c9"); mar.addColorStop(1, "#5fd6d6");
    g.fillStyle = mar; g.fillRect(330, 312, W + 60 - 330, 90);
    g.strokeStyle = "rgba(255,255,255,0.65)"; g.lineWidth = 2;
    for (let i = 0; i < 16; i++) { const x = 350 + hash(i + 20) * (W - 330), y = 325 + hash(i + 30) * 60; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 16 + hash(i) * 14, y); g.stroke(); }
    // velero lejos
    g.fillStyle = "#ffffff"; g.strokeStyle = tinta; g.lineWidth = 1.5; g.beginPath(); g.moveTo(780, 336); g.lineTo(780, 304); g.lineTo(798, 334); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#c9573a"; g.beginPath(); g.moveTo(768, 338); g.lineTo(804, 338); g.lineTo(798, 344); g.lineTo(772, 344); g.closePath(); g.fill(); g.stroke();
    // murete del paseo marítimo
    g.fillStyle = "#f6f1e7"; g.fillRect(330, 398, W + 60 - 330, 72); g.strokeStyle = tinta; g.lineWidth = 3; g.strokeRect(330, 398, W + 60 - 330, 72);
    g.fillStyle = "#e6dccb"; g.fillRect(330, 398, W + 60 - 330, 12);
    g.strokeStyle = "rgba(150,130,100,0.35)"; g.lineWidth = 2; for (let x = 360; x < W + 60; x += 70) { g.beginPath(); g.moveTo(x, 412); g.lineTo(x, 468); g.stroke(); }
    // palmera
    const PX = 905;
    g.strokeStyle = tinta; g.lineWidth = 3; g.fillStyle = "#a97a4a";
    g.beginPath(); g.moveTo(PX - 9, 400); g.quadraticCurveTo(PX - 4, 300, PX + 18, 210); g.lineTo(PX + 30, 212); g.quadraticCurveTo(PX + 10, 300, PX + 9, 400); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "rgba(90,60,30,0.5)"; g.lineWidth = 2; for (let y = 230; y < 395; y += 14) { const x = PX + 2 + (400 - y) * 0.1; g.beginPath(); g.moveTo(x - 9, y); g.lineTo(x + 9, y + 3); g.stroke(); }
    for (let i = 0; i < 7; i++) { const a = -Math.PI * 0.95 + i * Math.PI * 0.32, L = 88 + (i % 2) * 16;
      g.save(); g.translate(PX + 24, 212); g.rotate(a);
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(L * 0.5, -22, L, 14); g.quadraticCurveTo(L * 0.5, 4, 0, 0); g.closePath();
      g.fillStyle = i % 2 ? "#2f9a4a" : "#3cb35a"; g.fill(); g.strokeStyle = tinta; g.lineWidth = 2.5; g.stroke(); g.restore(); }
    // fachada del bar (pared encalada, a la izquierda)
    const FX0 = -60, FX1 = 330;
    g.fillStyle = "#fbf8f1"; g.fillRect(FX0, 30, FX1 - FX0, 440);
    const somb = g.createLinearGradient(FX1 - 60, 0, FX1, 0); somb.addColorStop(0, "rgba(160,170,200,0)"); somb.addColorStop(1, "rgba(160,170,200,0.35)");
    g.fillStyle = somb; g.fillRect(FX1 - 60, 30, 60, 440);
    g.strokeStyle = tinta; g.lineWidth = 3; g.strokeRect(FX0, 30, FX1 - FX0, 440);
    // tejado de tejas
    g.fillStyle = "#c8643a"; g.beginPath(); g.moveTo(FX0 - 10, 34); g.lineTo(FX1 + 16, 34); g.lineTo(FX1 + 6, 6); g.lineTo(FX0 - 10, 6); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "rgba(90,30,10,0.55)"; g.lineWidth = 2; for (let x = FX0; x < FX1 + 10; x += 16) { g.beginPath(); g.arc(x + 8, 34, 8, 0, Math.PI); g.stroke(); }
    // zócalo azul
    g.fillStyle = "#2f6fb5"; g.fillRect(FX0, 440, FX1 - FX0, 30); g.strokeStyle = tinta; g.lineWidth = 3; g.strokeRect(FX0, 440, FX1 - FX0, 30);
    // puerta en arco
    g.fillStyle = "#1f5aa0"; g.beginPath(); g.moveTo(70, 470); g.lineTo(70, 300); g.arc(125, 300, 55, Math.PI, 0); g.lineTo(180, 470); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.25)"; g.lineWidth = 3; for (const x of [95, 125, 155]) { g.beginPath(); g.moveTo(x, 300); g.lineTo(x, 462); g.stroke(); }
    g.fillStyle = "#f2c14e"; g.beginPath(); g.arc(166, 390, 5, 0, Math.PI * 2); g.fill(); g.strokeStyle = tinta; g.lineWidth = 1.5; g.stroke();
    // ventana con contraventanas
    g.fillStyle = "#9fd8f2"; g.fillRect(222, 170, 70, 90); g.strokeStyle = tinta; g.lineWidth = 3; g.strokeRect(222, 170, 70, 90);
    g.beginPath(); g.moveTo(257, 170); g.lineTo(257, 260); g.moveTo(222, 215); g.lineTo(292, 215); g.stroke();
    for (const [x, sg] of [[198, 1], [292, -1]]) { g.fillStyle = "#2f6fb5"; g.fillRect(x, 166, 24, 98); g.strokeRect(x, 166, 24, 98);
      g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 2; for (let y = 176; y < 260; y += 10) { g.beginPath(); g.moveTo(x + 4, y); g.lineTo(x + 20, y + 3 * sg); g.stroke(); } g.strokeStyle = tinta; g.lineWidth = 3; }
    // cartel colgante redondo con una copa (sin letras)
    g.strokeStyle = tinta; g.lineWidth = 3; g.beginPath(); g.moveTo(200, 86); g.lineTo(250, 86); g.moveTo(222, 86); g.lineTo(222, 102); g.stroke();
    g.fillStyle = "#2f6fb5"; g.beginPath(); g.arc(222, 128, 26, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.beginPath(); g.moveTo(208, 116); g.lineTo(236, 116); g.lineTo(222, 132); g.closePath(); g.moveTo(222, 132); g.lineTo(222, 144); g.moveTo(214, 144); g.lineTo(230, 144); g.stroke();
    // buganvilla trepando por la esquina
    for (let i = 0; i < 70; i++) { const a = hash(i) * Math.PI * 2, r = 70 * Math.sqrt(hash(i + 100)), x = 30 + Math.cos(a) * r * 1.6 + i * 0.6, y = 60 + Math.sin(a) * r * 0.8 + hash(i + 7) * 40;
      g.fillStyle = ["#e0218a", "#f04aa5", "#c2187a"][i % 3]; g.beginPath(); g.arc(x, y, 6 + hash(i + 50) * 5, 0, Math.PI * 2); g.fill(); }
    for (let i = 0; i < 30; i++) { const x = -40 + hash(i + 200) * 180, y = 30 + hash(i + 300) * 120; g.fillStyle = "#3f8f3a"; g.beginPath(); g.ellipse(x, y, 7, 4, hash(i) * 3, 0, Math.PI * 2); g.fill(); }
    // maceta junto a la puerta
    g.fillStyle = "#c8643a"; g.strokeStyle = tinta; g.lineWidth = 2.5; g.beginPath(); g.moveTo(22, 470); g.lineTo(16, 436); g.lineTo(56, 436); g.lineTo(50, 470); g.closePath(); g.fill(); g.stroke();
    for (let i = 0; i < 7; i++) { g.fillStyle = "#3cb35a"; g.beginPath(); g.ellipse(36 + (i - 3) * 6, 424 - (i % 2) * 8, 6, 14, (i - 3) * 0.3, 0, Math.PI * 2); g.fill(); g.stroke(); }
    // acera de baldosas
    const ace = g.createLinearGradient(0, 470, 0, 576); ace.addColorStop(0, "#e9dcc4"); ace.addColorStop(1, "#d8c7a8");
    g.fillStyle = ace; g.fillRect(-60, 470, W + 120, 106);
    g.strokeStyle = "rgba(140,110,70,0.35)"; g.lineWidth = 1.5;
    for (const y of [492, 520, 552]) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    for (let x = -60; x < W + 60; x += 48) { g.beginPath(); g.moveTo(x, 470); g.lineTo(x - 14, 576); g.stroke(); }
    g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(-60, 470, W + 120, 5);
    // bordillo y calzada
    g.fillStyle = "#f4f1ea"; g.fillRect(-60, 574, W + 120, 9); g.strokeStyle = tinta; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-60, 574); g.lineTo(W + 60, 574); g.stroke();
    const cal = g.createLinearGradient(0, 583, 0, H + 50); cal.addColorStop(0, "#5d6168"); cal.addColorStop(1, "#45484e");
    g.fillStyle = cal; g.fillRect(-60, 583, W + 120, H + 50 - 583);
    g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(-60, 583, W + 120, 4);
    return c;
  }

  /* ---------- farola (vibra con el golpe) y papelera ---------- */
  function farola(g, t) {
    const u = t - T.bonk, vib = u > 0 ? 10 * Math.exp(-u * 2.6) * Math.sin(u * 26) * suave(fase(u, 0, 0.04)) : 0;
    const B = BASE_Y, TOP = 92;
    const dx = y => vib * Math.pow((B - y) / (B - TOP), 2);
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const tinta = "#0b0a0e", hierro = "#1f4a3a", luz = "#3f7a62";
    // base
    g.fillStyle = hierro; g.strokeStyle = tinta; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(LX - 22, B); g.lineTo(LX + 22, B); g.lineTo(LX + 16, B - 14); g.quadraticCurveTo(LX + 9, B - 40, LX + 10, B - 62); g.lineTo(LX - 10, B - 62); g.quadraticCurveTo(LX - 9, B - 40, LX - 16, B - 14); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(LX, B - 62, 13, 4, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    // poste (curvado según la vibración)
    const y0 = B - 62, y1 = TOP;
    g.beginPath(); g.moveTo(LX - POSTE_R + dx(y0), y0); g.quadraticCurveTo(LX - POSTE_R + dx((y0 + y1) / 2) * 1.0, (y0 + y1) / 2, LX - POSTE_R + dx(y1), y1);
    g.lineTo(LX + POSTE_R + dx(y1), y1); g.quadraticCurveTo(LX + POSTE_R + dx((y0 + y1) / 2), (y0 + y1) / 2, LX + POSTE_R + dx(y0), y0); g.closePath();
    g.fillStyle = hierro; g.fill(); g.stroke();
    g.strokeStyle = luz; g.lineWidth = 2; g.beginPath(); g.moveTo(LX - 2 + dx(y0), y0 - 4); g.quadraticCurveTo(LX - 2 + dx((y0 + y1) / 2), (y0 + y1) / 2, LX - 2 + dx(y1), y1 + 6); g.stroke();
    // brazo curvo y farol
    const tx = LX + dx(y1), ty = y1, osc = 0.4 * vib / 10;
    g.strokeStyle = tinta; g.lineWidth = 7; g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + 6, ty - 34, tx + 40, ty - 32); g.stroke();
    g.strokeStyle = hierro; g.lineWidth = 3.5; g.stroke();
    g.save(); g.translate(tx + 42, ty - 30); g.rotate(osc);
    g.fillStyle = hierro; g.strokeStyle = tinta; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(-16, 8); g.lineTo(16, 8); g.lineTo(8, -4); g.lineTo(-8, -4); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,246,210,0.9)"; g.beginPath(); g.moveTo(-13, 8); g.lineTo(13, 8); g.lineTo(10, 36); g.lineTo(-10, 36); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = tinta; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, 8); g.lineTo(0, 36); g.stroke();
    g.fillStyle = hierro; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-12, 36); g.lineTo(12, 36); g.lineTo(6, 44); g.lineTo(-6, 44); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.75)"; g.fillRect(-9, 12, 4, 18);
    g.restore();
    g.restore();
  }
  function papelera(g, t, tp) {
    const wob = t >= T.tope ? 0.12 * Math.exp(-(t - T.tope) * 4) * Math.sin((t - T.tope) * 15) : 0;
    g.save(); g.translate(BX - CUBO_W / 2, BASE_Y); g.rotate(-wob * 0.5); g.translate(-(BX - CUBO_W / 2), -BASE_Y);
    g.lineJoin = "round"; g.lineCap = "round";
    const tinta = "#0b0a0e";
    const x0 = BX - CUBO_W / 2, x1 = BX + CUBO_W / 2, top = BASE_Y - CUBO_H;
    const cuerpo = () => { g.beginPath(); g.moveTo(x0, top); g.lineTo(x1, top); g.lineTo(x1 - 5, BASE_Y); g.lineTo(x0 + 5, BASE_Y); g.closePath(); };
    const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, "#c4ccd3"); gr.addColorStop(0.35, "#eef2f5"); gr.addColorStop(1, "#7d8892");
    cuerpo(); g.fillStyle = gr; g.fill();
    g.save(); cuerpo(); g.clip(); g.strokeStyle = "rgba(70,80,90,0.45)"; g.lineWidth = 2;
    for (let i = 1; i < 6; i++) { const x = x0 + i * CUBO_W / 6; g.beginPath(); g.moveTo(x, top); g.lineTo(x + (BX - x) * 0.07, BASE_Y); g.stroke(); }
    g.restore();
    cuerpo(); g.lineWidth = 2.5; g.strokeStyle = tinta; g.stroke();
    for (const y of [top + 18, BASE_Y - 22]) { g.beginPath(); g.moveTo(x0 + 1, y); g.lineTo(x1 - 1, y); g.lineWidth = 5; g.strokeStyle = tinta; g.stroke(); g.lineWidth = 2.5; g.strokeStyle = "#dfe5ea"; g.stroke(); }
    // asas
    g.strokeStyle = tinta; g.lineWidth = 3; for (const [x, s] of [[x0, -1], [x1, 1]]) { g.beginPath(); g.moveTo(x, top + 30); g.quadraticCurveTo(x + 9 * s, top + 36, x, top + 44); g.stroke(); }
    // boca abierta y basura asomando cuando la tapa salta
    if (tp.capa !== "cubo") {
      g.fillStyle = "#2a2f35"; g.beginPath(); g.ellipse(BX, top, CUBO_W / 2 - 1, 6, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 2.5; g.strokeStyle = tinta; g.stroke();
      g.fillStyle = "#f4efe2"; g.beginPath(); g.ellipse(BX - 12, top - 3, 10, 7, 0.3, 0, Math.PI * 2); g.fill(); g.lineWidth = 1.6; g.stroke();
      g.fillStyle = "#e8c23a"; g.beginPath(); g.ellipse(BX + 14, top - 2, 9, 4, -0.4, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    g.restore();
    if (tp.capa === "cubo") { g.save(); g.setTransform(CAM); g.transform(tp.M.a, tp.M.b, tp.M.c, tp.M.d, tp.M.e, tp.M.f); dibTapa(g); g.restore(); }
  }

  /* ---------- efectos ---------- */
  function estrellaPuntas(g, x, y, r, puntas, rot, rel = 0.45) {
    g.beginPath(); for (let i = 0; i < puntas * 2; i++) { const a = rot + i * Math.PI / puntas, rr = i % 2 ? r * rel : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  }
  function impacto(g, t, t0, x, y, tam) {
    const k = fase(t, t0, t0 + 0.32); if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 1 - k;
    estrellaPuntas(g, x, y, tam * (0.6 + 0.8 * salida(k)), 10, 0.3, 0.42); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 2.5; g.strokeStyle = "#0b0a0e"; g.stroke();
    estrellaPuntas(g, x, y, tam * (0.35 + 0.5 * salida(k)), 10, 0.55, 0.5); g.fillStyle = "#ffffff"; g.fill();
    g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2, r0 = tam * (0.9 + 0.9 * k), r1 = r0 + tam * 0.45; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  }
  function destello(g, t, t0, x, y, r) {
    const k = fase(t, t0, t0 + 0.4); if (k <= 0 || k >= 1) return;
    const s = Math.sin(Math.PI * k);
    g.save(); estrellaPuntas(g, x, y, r * s, 4, t * 2, 0.22); g.fillStyle = "#fffbe0"; g.fill(); g.lineWidth = 1.6; g.strokeStyle = "#0b0a0e"; g.stroke(); g.restore();
  }
  function estrellitas(g, t, pG) {
    const k = tramo(t, T.bonk + 0.1, T.bonk + 0.35) * (1 - tramo(t, T.cLevanta1, T.gVe0 + 0.3)); if (k <= 0.01) return;
    const c = G.aPantalla(pG, G.cabeza(pG).a({ x: 790, y: 300 }));
    const pts = [];
    for (let i = 0; i < 5; i++) { const a = t * 4.2 + i * Math.PI * 2 / 5; pts.push({ a, x: c.x + Math.cos(a) * 56, y: c.y - 34 + Math.sin(a) * 14, z: Math.sin(a) }); }
    pts.sort((u, v) => u.z - v.z);
    g.save();
    for (const q of pts) { const r = (8 + 3 * q.z) * k; estrellaPuntas(g, q.x, q.y, r, 5, t * 3 + q.a, 0.45); g.fillStyle = "#ffe14d"; g.fill(); g.lineWidth = 1.8; g.strokeStyle = "#0b0a0e"; g.stroke(); }
    g.restore();
  }
  // «clonc» de la tapa en la cabeza
  function clonc(g, t, tp) {
    const k = fase(t, T.tapa, T.tapa + 0.35); if (k <= 0 || k >= 1) return;
    const c = { x: tp.M.e, y: tp.M.f - 8 };
    g.save(); g.globalAlpha = 1 - k; g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.lineCap = "round";
    for (let j = 0; j < 6; j++) { const a = Math.PI * (1.05 + 0.18 * j), r0 = 48 + 20 * salida(k), r1 = r0 + 14;
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0 * 0.7); g.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1 * 0.7); g.stroke(); }
    g.restore();
  }
  // líneas de la media vuelta de Carla
  function lineasGiro(g, t, pC) {
    const k = Math.sin(Math.PI * vueltaC(t)); if (k <= 0.01) return;
    g.save(); g.strokeStyle = `rgba(255,255,255,${0.75 * k})`; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const y = pC.suelo - 100 - i * 100, r = 60 + 8 * i, a0 = t * 14 + i; g.beginPath(); g.ellipse(pC.x, y, r, 12, 0, a0, a0 + 2.2); g.stroke(); }
    g.restore();
  }
  // brillos de los cristales de Guillermo (también se ven en la oscuridad)
  function brillosG(g, t, gafG, k) {
    if (!gafG || k <= 0.01) return;
    g.save(); g.globalCompositeOperation = "lighter";
    for (const q of [{ x: -110, y: -16 }, { x: 48, y: -14 }]) {
      const c = aplica(gafG.M, q), r = 9 + 2 * Math.sin(t * 6);
      const gr = g.createRadialGradient(c.x, c.y, 0.5, c.x, c.y, r * 2.2); gr.addColorStop(0, `rgba(255,255,255,${0.9 * k})`); gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr; g.fillRect(c.x - r * 2.2, c.y - r * 2.2, r * 4.4, r * 4.4);
      g.strokeStyle = `rgba(255,255,255,${0.8 * k})`; g.lineWidth = 1.5; g.beginPath(); g.moveTo(c.x - r, c.y); g.lineTo(c.x + r, c.y); g.moveTo(c.x, c.y - r); g.lineTo(c.x, c.y + r); g.stroke();
    }
    g.restore();
  }
  // lo que ve Guillermo con sus gafas: todo casi negro (viñeta centrada en él)
  function nivelOscuro(t) { return 0.93 * tramo(t, T.osc0, T.osc1) - 0.55 * tramo(t, T.oscFin0, T.oscFin1) - 0.38 * tramo(t, T.cLevanta0 + 0.2, T.cLevanta1 + 0.1); }
  function oscuridad(g, t, pG) {
    const a = nivelOscuro(t); if (a <= 0.004) return;
    const c = G.aPantalla(pG, G.cabeza(pG).a({ x: 820, y: 600 }));
    const gr = g.createRadialGradient(c.x, c.y, 30, c.x, c.y, 640);
    gr.addColorStop(0, `rgba(4,4,10,${0.2 * a})`); gr.addColorStop(0.22, `rgba(4,4,10,${0.62 * a})`); gr.addColorStop(0.55, `rgba(4,4,10,${0.93 * a})`); gr.addColorStop(1, `rgba(4,4,10,${a})`);
    g.fillStyle = gr; g.fillRect(-80, -80, W + 160, H + 160);
  }
  // reflejo del sol: Guillermo deslumbrado al principio
  function solazo(g, t) {
    const k = 0.5 + 0.15 * Math.sin(t * 2.3);
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createRadialGradient(905, 62, 10, 905, 62, 420); gr.addColorStop(0, `rgba(255,250,215,${0.28 * k})`); gr.addColorStop(1, "rgba(255,250,215,0)");
    g.fillStyle = gr; g.fillRect(480, -100, 700, 560);
    g.restore();
  }

  /* ---------- cámara ---------- */
  function camara(t) {
    const sigue = tramo(t, T.anda0, T.bonk, suave) * (1 - tramo(t, T.cLevanta1, T.salen0 + 0.5, suave));
    const sale = tramo(t, T.salen0, DUR, suave);
    return { k: 1 + 0.05 * sigue, x: 512 + 40 * sigue + 60 * sale, y: 300 + 16 * sigue };
  }

  class GuillermoGafas extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !CA.listo()) return;
      if (!fondo) fondo = creaFondo();
      const { g: pG, c: pC, gafG, tp } = poses(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      const tb = (t >= T.bonk ? 4 * Math.exp(-(t - T.bonk) * 8) * suave(fase(t, T.bonk, T.bonk + 0.04)) : 0)
        + (t >= T.tapa ? 3 * Math.exp(-(t - T.tapa) * 9) * suave(fase(t, T.tapa, T.tapa + 0.04)) : 0);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      if (tb > 0.05) g.translate(ruido(t * 45) * tb, ruido(t * 45 + 13) * tb * 0.7);
      CAM = g.getTransform();
      g.drawImage(fondo, -60, -50);
      // sombras
      g.save(); g.fillStyle = "rgba(60,40,20,0.28)";
      g.beginPath(); g.ellipse(G.aPantalla(pG, pG.pelvis).x, pG.suelo + 2, 54, 6, 0, 0, Math.PI * 2); g.fill();
      if (pC.x < W + 120) { g.beginPath(); g.ellipse(pC.x, pC.suelo + 2, 46, 5, 0, 0, Math.PI * 2); g.fill(); }
      g.beginPath(); g.ellipse(BX + 6, BASE_Y + 1, 42, 5, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(LX + 6, BASE_Y + 1, 30, 5, 0, 0, Math.PI * 2); g.fill();
      g.restore();
      // la papelera va delante de Guillermo mientras él pasa por detrás (en el paseo) y detrás cuando choca con ella
      const cuboAtras = t > 7.3, farolaAtras = t > T.cGira0 + 0.2;
      if (farolaAtras) farola(g, t);
      if (cuboAtras) papelera(g, t, tp);
      G.dibujar(g, pG, t);
      if (!cuboAtras) papelera(g, t, tp);
      // Carla, con su media vuelta
      if (pC.x < W + 130) {
        const v = pC._vuelta, sc = Math.abs(Math.cos(Math.PI * suave(v)));
        g.save(); g.translate(pC.x, 0); g.scale(Math.max(0.02, sc), 1); g.translate(-pC.x, 0);
        CA.dibujar(g, pC, t);
        g.restore();
      }
      if (!farolaAtras) farola(g, t);
      if (tp.capa === "aire") { g.save(); g.setTransform(CAM); g.transform(tp.M.a, tp.M.b, tp.M.c, tp.M.d, tp.M.e, tp.M.f); dibTapa(g); g.restore(); }
      lineasGiro(g, t, pC);
      estrellitas(g, t, pG);
      // golpes
      if (GEO) {
        impacto(g, t, T.bonk, LX - 2, GEO.NARIZ_Y - 6, 30);
      }
      impacto(g, t, T.tope, BX + CUBO_W / 2, pG.suelo - 70, 22);
      clonc(g, t, tp);
      // destellos de las gafas
      const pCa = CA.cabeza(pC), lenteC = CA.aPantalla(pC, pCa.a({ x: 860, y: 448 }));
      if (pC.x < W + 100) destello(g, t, T.cBrillo, lenteC.x, lenteC.y, 16);
      if (gafG) { const lg = aplica(gafG.M, { x: -100, y: -16 }); destello(g, t, T.gPone1 + 0.08, lg.x, lg.y, 15); }
      solazo(g, t);
      oscuridad(g, t, pG);
      brillosG(g, t, gafG && gafG.capa === "cara" ? gafG : null, clamp((nivelOscuro(t) - 0.3) * 1.6));
      g.restore();
      CAM = null;
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00050", nombre: "Guillermo y Carla · Las gafas de sol", crear: () => new GuillermoGafas() });
  // alcance: |mano − hombro| / largo del brazo (para revisar que ninguna mano flote)
  function alcance(t) {
    const { g: pG, c: pC } = poses(t), o = {};
    for (const [nom, R, p] of [["G", G, pG], ["C", CA, pC]]) {
      const Tr = R.tronco(p);
      for (const [lado, m, sh, L] of [["c", p.manoCerca, R.HOMBRO_C, R.BRAZO_C_L], ["l", p.manoLejos, R.HOMBRO, R.BRAZO_L]]) {
        if (!m || (m.puno ?? 1) < 0.5) continue;
        const h = Tr(sh), mu = m.mu ?? -1.75, w = R.rotP({ x: Math.cos(mu) * R.MUNECA_R * R.JK, y: Math.sin(mu) * R.MUNECA_R * R.JK }, m.ang || 0);
        o[nom + lado] = +(Math.hypot(m.x + w.x - h.x, m.y + w.y - h.y) / (1.08 * L)).toFixed(2);   // > 1: la mano flota
      }
    }
    return o;
  }
  window.__A2D_00050 = { pose: t => { const r = poses(t); return { g: r.g, c: r.c }; }, T, DUR, alcance, geo: () => (GEO || preparaGeo(), GEO) };
})();
