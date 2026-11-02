"use strict";
/* 00094 · Guillermo y Marta · La pinza del pelo
 *
 * Negro → un rincón de dormitorio a media mañana: papel pintado crema con ramitas, una ventana con
 * cortinas de visillo por la que entra el sol en rayos, un tocador blanco con su espejo redondo,
 * una balda con libros sin letras, una planta y una alfombra redonda. Marta se lleva la mano a la
 * nuca y se quita la pinza de carey: la melena se le suelta despacio, cae, se mece y la sacude con
 * gusto (destellos). Guillermo se queda embobado (corazones) → señala la pinza, junta las manos y le
 * pone ojitos; Marta se ríe y se la da → Guillermo se la engancha en un pincho de atrás: el pincho se
 * dobla con el peso y la pinza se queda colgando, balanceándose; Marta se aguanta la risa →
 * Guillermo la quita (¡boing!, el pincho vuelve a su sitio), echa la cabeza atrás y la cierra en la
 * coronilla: ¡clac!, se le recogen todos los pinchos y le sale una palmerita de pelo, tiesa, que se
 * abre y se bambolea → la mira con los ojos en blanco y posa orgullosísimo, con los brazos en jarras
 * → Marta se tapa la boca de risa y le hace una «foto» con los dedos (¡flash!); él guiña → Marta
 * se recoge el pelo con un par de vueltas y se pone la goma rosa de la muñeca → los dos miran a cámara;
 * Marta guiña un ojo y a Guillermo le bota la palmera → negro.
 *
 * Sin textos. La melena suelta de Marta es una capa de la escena con los colores de su pelo: en la
 * cabeza (capaCabeza, en coordenadas de su retrato) tapa el moño y la pinza, y por detrás del cuerpo
 * le alarga la melena. El pelo de Guillermo usa la técnica de 00074/00086: se borran sus púas del
 * retrato repintando el fondo y se dibujan púas que se pueden doblar o recoger en la palmera.
 * La pinza en la mano se dibuja en pantalla con una afín; en la cabeza, en el retrato. Todo depende
 * solo de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, campana, mezcla, hash } = M2;
  const G = Guillermo, M = Marta;
  const S = 0.31, SUELO = 548, DUR = 14.6, TAU = Math.PI * 2;
  const TINTA = "#0b0a0e";
  const XG0 = 400, XM0 = 630;
  let MATRIZ = null, fondo = null;

  /* ---------- utilidades ---------- */
  const P2 = (x, y) => ({ x, y });
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
  // muelle amortiguado: de 0 a 1 con un pelín de rebote (velocidad 0 al empezar)
  const muelle01 = (u, k = 5, w = 9) => u <= 0 ? 0 : 1 - Math.exp(-k * u) * (Math.cos(w * u) + (k / w) * Math.sin(w * u));
  // oscilación que se apaga (empieza en 0)
  const vibra = (u, A, w = 18, k = 5) => u <= 0 ? 0 : A * Math.exp(-k * u) * Math.sin(w * u);

  // afines de pantalla { a, b, c, d, e, f } (como setTransform)
  const AF = (a, b, c, d, e, f) => ({ a, b, c, d, e, f });
  const aplica = (g, A) => g.transform(A.a, A.b, A.c, A.d, A.e, A.f);
  // retrato de la cabeza → pantalla
  function afCab(R, p) {
    const H = R.cabeza(p), f = q => R.aPantalla(p, H.a(q));
    const o = f(P2(0, 0)), ex = f(P2(100, 0)), ey = f(P2(0, 100));
    return AF((ex.x - o.x) / 100, (ex.y - o.y) / 100, (ey.x - o.x) / 100, (ey.y - o.y) / 100, o.x, o.y);
  }
  const enCab = (R, p, q) => R.aPantalla(p, R.cabeza(p).a(q));
  const kRet = A => 1 / Math.hypot(A.a, A.b);            // píxeles de pantalla → unidades del retrato

  /* ---------- manos ---------- */
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { c: punoDesde(P2(131, 652), -1.75), l: punoDesde(P2(372, 648), -1.75) };
  function bolsillo(R, p, lado) {
    if (R === G) return G.tronco(p)(lado === "cerca" ? BOLS_G.c : BOLS_G.l);
    const m = R.manoReposo(p, lado); return P2(m.x, m.y);
  }
  // objetivo: { bols } | { tr: punto del tronco } | { scr: () => punto de pantalla }
  function resolutor(R, p, lado) {
    return o => {
      if (o.bols) { const b = bolsillo(R, p, lado);
        return { x: b.x, y: b.y, mu: -1.75, ang: 0, puno: o.sale ? 1 : 0, dedos: o.dedos || D(0.4, 0.4, 0.4, 0.4), dobla: o.dobla ?? (lado === "cerca" ? -1 : 1) }; }
      let q;
      if (o.tr) q = R.tronco(p)(o.tr);
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
  // codo y estiramiento del brazo para una mano (como lo calcula el muñeco)
  function codo(R, p, lado, m, mu) {
    const cerca = lado === "cerca", h = R.tronco(p)(cerca ? R.HOMBRO_C : R.HOMBRO);
    const L = cerca ? R.BRAZO_C_L : R.BRAZO_L;
    const pz = R.A.datos.piezas[cerca ? "brazo_cerca" : "brazo"], sj = (pz && pz.codo) || L * 0.5;
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
  // mano y codo en pantalla
  const manoPant = (R, p, lado) => { const m = lado === "cerca" ? p.manoCerca : p.manoLejos; return { h: R.aPantalla(p, m), e: R.aPantalla(p, codo(R, p, lado, m).e) }; };

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
   * GUION (segundos)
   * ===================================================================================== */
  const T = {
    // Marta se quita la pinza y se suelta el pelo
    mSale: 0.62, mLlega: 1.12, mAprieta: 1.2, mQuita: 1.34, mBaja: 1.78,
    suelta: 1.38, sacude0: 1.55, sacude1: 2.6,
    // Guillermo se queda embobado, señala y suplica
    gEmbobado: 1.75, gSenala0: 3.0, gSenala1: 3.55, gRuega0: 3.62, gRuega1: 4.25,
    mMiraG: 2.85, mPasa: 3.72, mRie: 3.95, mDa0: 4.2, mDa1: 4.7, gCoge: 4.68, mVuelve0: 4.86, mVuelve1: 5.36,
    // el pincho de delante
    gSube0: 4.86, gEngancha: 5.42, gSuelta1: 5.52, cuelga: 5.48, gMiraPincho: 5.75, mRisita: 6.05,
    gCogePinza: 6.48, gQuita: 6.6, gPasa: 6.86, gEchaAtras0: 6.88, gCoronilla: 7.28, clac: 7.36, gEndereza0: 7.58, gEndereza1: 8.0,
    // la palmera
    gMiraArriba0: 8.04, gMiraArriba1: 8.55, gOrgullo0: 8.6, gOrgullo1: 9.0,
    mRisa0: 8.3, mRisa1: 9.4,
    // la foto con los dedos
    mFoto0: 9.45, mFoto1: 9.9, flash: 10.22, mFotoFin: 10.66, gGuino: 10.16,
    // Marta se recoge el pelo
    mRecoge0: 10.72, mGira0: 11.12, mGira1: 11.86, mGoma: 11.9, mRecoge1: 12.14, mBolsillo: 12.6,
    gBaila0: 11.1, gBaila1: 12.5,
    camara: 12.85, mGuino: 13.3, gBota: 13.25,
    fin: 13.95
  };

  /* =====================================================================================
   * LA PINZA DE CAREY (marco propio en píxeles de pantalla: centrada, eje largo en x,
   * bisagra a la izquierda; abre: ángulo de las mandíbulas)
   * ===================================================================================== */
  const PZ_L = 9.5, PZ_H = 3.6;
  function dibPinza(g, abre = 0) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round"; g.scale(1.3, 1.3);
    const manchas = (y0, sg) => {
      for (let i = 0; i < 6; i++) {
        const x = -PZ_L + 2.6 + i * 3.1 + 1.2 * hash(i * 7 + (sg > 0 ? 3 : 9)), y = y0 + sg * (0.9 + 1.0 * hash(i * 11 + 5));
        g.fillStyle = i % 2 ? "rgba(92,36,8,0.85)" : "rgba(60,22,4,0.75)";
        g.beginPath(); g.ellipse(x, y, 1.3 + 0.6 * hash(i + 4), 0.8, 0.4, 0, TAU); g.fill();
      }
    };
    for (const sg of [1, -1]) {                       // mandíbula de abajo (sg 1) y de arriba (sg −1)
      g.save(); g.translate(-PZ_L, 0); g.rotate(-sg * abre * 0.5); g.translate(PZ_L, 0);
      // púas que se cruzan con la otra mandíbula
      g.strokeStyle = "#5a2a0c"; g.lineWidth = 1.1;
      g.beginPath(); for (let i = 0; i < 7; i++) { const x = -PZ_L + 3.2 + i * 2.5 + (sg > 0 ? 1.2 : 0); g.moveTo(x, sg * 0.8); g.lineTo(x + 0.3, -sg * 2.0); } g.stroke();
      // lomo curvado
      g.beginPath(); g.moveTo(-PZ_L, sg * 0.4);
      g.quadraticCurveTo(-PZ_L * 0.1, sg * (PZ_H * 1.25), PZ_L, sg * 0.9);
      g.quadraticCurveTo(PZ_L + 1.2, sg * 2.3, PZ_L - 0.6, sg * 3.1);
      g.quadraticCurveTo(-PZ_L * 0.1, sg * (PZ_H * 2.05), -PZ_L - 0.6, sg * 1.9);
      g.closePath();
      g.fillStyle = sg > 0 ? "#c9741f" : "#e08a2a"; g.fill();
      g.save(); g.clip(); manchas(sg * 1.2, sg); g.restore();
      g.strokeStyle = TINTA; g.lineWidth = 1.1; g.stroke();
      if (sg < 0) { g.strokeStyle = "rgba(255,240,210,0.85)"; g.lineWidth = 0.9; g.beginPath(); g.moveTo(-PZ_L * 0.55, -2.6); g.quadraticCurveTo(0, -3.9, PZ_L * 0.55, -2.4); g.stroke(); }
      g.restore();
    }
    // bisagra con su muelle
    g.fillStyle = "#3a1a08"; g.beginPath(); g.ellipse(-PZ_L - 0.4, 0, 1.9, 2.6, 0, 0, TAU); g.fill();
    g.strokeStyle = "#d9a060"; g.lineWidth = 0.7; g.beginPath(); for (let i = -2; i <= 2; i++) { g.moveTo(-PZ_L - 1.6, i * 0.8); g.lineTo(-PZ_L + 0.8, i * 0.8 + 0.4); } g.stroke();
    g.restore();
  }
  // la pinza en pantalla: c centro, ang ángulo del eje largo, k escala
  const pinzaEn = (g, c, ang, k, abre) => { g.save(); g.translate(c.x, c.y); g.rotate(ang); g.scale(k, k); dibPinza(g, abre); g.restore(); };

  /* ---------- la goma del pelo (rosa, de tela fruncida) ---------- */
  function dibGoma(g, rx, ry) {
    g.save(); g.lineJoin = "round";
    const n = 8, r0 = 0.42 * Math.min(rx, ry) + 0.6;
    for (let pasada = 0; pasada < 2; pasada++) {
      for (let i = 0; i < n; i++) {
        const a = i / n * TAU, x = Math.cos(a) * rx, y = Math.sin(a) * ry, ta = Math.atan2(Math.cos(a) * ry, -Math.sin(a) * rx);
        const r = r0 * (1 + 0.15 * hash(i * 3 + 1));
        g.beginPath(); g.ellipse(x, y, r * 1.25, r, ta, 0, TAU);
        if (pasada === 0) { g.lineWidth = 1.4; g.strokeStyle = TINTA; g.stroke(); }
        else { g.fillStyle = i % 2 ? "#f06c9c" : "#ff8fb4"; g.fill(); }
      }
    }
    g.fillStyle = "rgba(255,255,255,0.75)"; g.beginPath(); g.ellipse(-rx * 0.35, -ry * 0.8, r0 * 0.5, r0 * 0.3, -0.3, 0, TAU); g.fill();
    g.restore();
  }

  /* =====================================================================================
   * LA MELENA SUELTA DE MARTA (coordenadas de su retrato; ya mira a la derecha, el muñeco
   * la refleja). La nuca y la pinza quedan a la izquierda del retrato.
   * ===================================================================================== */
  const PINZA_M = P2(495, 366);                       // la pinza de carey del avatar
  const MONO_M = P2(512, 352);                        // donde se recoge el moño al final
  const COL_M = { base: "#7a4826", sombra: "#4f2c16", oscuro: "#3a1f0f", luz: "#a3693b", brillo: "#c98d58", tinta: "#26140a" };
  // borde de fuera (nuca) y de dentro (junto a la oreja), de la coronilla hacia abajo
  const PELO_FUERA = [[702, 190], [640, 196], [580, 214], [528, 248], [488, 298], [462, 360], [448, 430], [438, 510], [428, 590], [420, 668], [418, 740]];
  const PELO_DENTRO = [[712, 200], [676, 232], [646, 274], [622, 326], [606, 384], [598, 440], [594, 500], [598, 560], [604, 628], [610, 690], [614, 742]];
  const NF = PELO_FUERA.length;
  // f: caída (0 recogido → 1 suelto, puede pasarse), giro: recogida final (0 → 1), t para el vaivén
  function melenaSuelta(g, t, f, giro, uRel) {
    if (f <= 0.002 && giro <= 0.002) return;
    const yTope = lerp(392, 742, clamp(f, 0, 1.25));                 // hasta dónde ha caído el pelo
    const al = clamp(f * 14) * (1 - tramo(giro, 0.82, 1));
    if (al <= 0.002) return;
    const ondea = (v, j) => (5 * Math.sin(t * 1.35 + j * 0.7) * v + vibra(uRel, 22, 6.5, 3.2) * Math.sin(1.4 + j * 0.4) * v * v) * clamp(f);
    const vol = 14 * clamp(f) * (1 + 0.15 * Math.sin(t * 1.1));
    // un punto del borde, ya caído y recogido: v = 0 arriba … 1 abajo
    const pt = (arr, i, sgVol) => {
      const [x0, y0] = arr[i], v = i / (NF - 1);
      let y = Math.min(y0, yTope + (y0 - 392) * 0.02), x = x0 + sgVol * (vol * Math.sin(Math.PI * Math.min(1, v * 1.2)) + 5 * Math.sin(v * 11 + 0.8) * v * clamp(f)) + ondea(v, i);
      if (y0 > yTope) y = yTope + 8 * Math.sin(i * 1.7) * clamp(f);
      // recogida: todo gira alrededor del moño y se encoge hacia él
      if (giro > 0) { const a = suave(giro) * 1.0 * v, k = 1 - salida(giro) * 0.92;
        const r = rota(P2(x - MONO_M.x, y - MONO_M.y), a); x = MONO_M.x + r.x * k; y = MONO_M.y + r.y * k; }
      return P2(x, y);
    };
    const fuera = [], dentro = [];
    for (let i = 0; i < NF; i++) { fuera.push(pt(PELO_FUERA, i, -1)); dentro.push(pt(PELO_DENTRO, i, 0)); }
    g.save(); g.globalAlpha *= al; g.lineJoin = "round"; g.lineCap = "round";
    // puntas: el borde de abajo en picos, más largos cuanto más suelto
    const fin = fuera[NF - 1], fin2 = dentro[NF - 1], puntas = [];
    for (let i = 1; i < 9; i++) { const q = mezcla(fin, fin2, i / 9), lg = (i % 2 ? 26 : 4) * clamp(f) * (1 - 0.2 * hash(i));
      puntas.push(P2(q.x - 4 + 3 * Math.sin(t * 1.6 + i), q.y + lg)); }
    const contorno = () => { g.beginPath(); M2.curva(g, fuera, false, 0.45); for (const q of puntas) g.lineTo(q.x, q.y);
      const d = dentro.slice().reverse(); for (const q of d) g.lineTo(q.x, q.y); g.closePath(); };
    contorno();
    const gr = g.createLinearGradient(440, 200, 620, 700); gr.addColorStop(0, COL_M.luz); gr.addColorStop(0.45, COL_M.base); gr.addColorStop(1, COL_M.sombra);
    g.fillStyle = gr; g.fill();
    g.save(); contorno(); g.clip();
    // mechones: de la coronilla hacia abajo, ondulando (oscuros y claros alternos, con su raya de tinta)
    const N = 14;
    for (let j = 0; j < N; j++) {
      const k = (j + 0.5) / N, lado = lerp(0.02, 0.98, k), ph = hash(j * 13 + 2) * 6;
      g.beginPath();
      for (let i = 1; i < NF; i++) { const q = mezcla(fuera[i], dentro[i], lado), w = 5 * Math.sin(i * 0.8 + ph + t * 0.9) * (i / NF);
        if (i > 1) g.lineTo(q.x + w, q.y); else g.moveTo(q.x, q.y); }
      const claro = j % 3 === 1;
      g.lineWidth = claro ? 7 : (j % 3 === 0 ? 11 : 6); g.strokeStyle = claro ? COL_M.luz : (j % 3 === 0 ? COL_M.oscuro : COL_M.sombra);
      g.globalAlpha = al * (claro ? 0.8 : 0.55); g.stroke();
      if (!claro) { g.lineWidth = 1.8; g.strokeStyle = COL_M.tinta; g.globalAlpha = al * 0.4; g.stroke(); }
    }
    // brillo de anuncio de champú: una banda clara que sigue la curva de la cabeza
    g.globalAlpha = al;
    for (const [v0, an, alf] of [[0.33, 10, 0.5], [0.4, 5, 0.7]]) {
      g.beginPath();
      for (let j = 0; j <= 10; j++) { const lado = j / 10, i0 = v0 * (NF - 1) + 0.5 * Math.sin(lado * Math.PI), i = Math.floor(i0), f2 = i0 - i;
        const q = mezcla(mezcla(fuera[i], dentro[i], lado), mezcla(fuera[i + 1], dentro[i + 1], lado), f2);
        if (j) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); }
      g.lineWidth = an; g.strokeStyle = COL_M.brillo; g.globalAlpha = al * alf; g.stroke();
    }
    g.globalAlpha = al;
    g.restore();
    // contorno de tinta por fuera y puntas
    g.globalAlpha = al;
    g.beginPath(); M2.curva(g, fuera, false, 0.45); g.lineWidth = 5; g.strokeStyle = COL_M.tinta; g.stroke();
    g.beginPath(); g.moveTo(fin.x, fin.y); for (const q of puntas) g.lineTo(q.x, q.y); g.lineTo(fin2.x, fin2.y);
    g.lineWidth = 2.5; g.strokeStyle = "rgba(38,20,10,0.55)"; g.stroke();
    g.restore();
  }
  // melena larga por detrás del cuerpo (retrato, se dibuja antes que Marta)
  function melenaDetras(g, t, f, giro) {
    const k = clamp(f) * (1 - tramo(giro, 0, 0.45));
    if (k <= 0.002) return;
    const largo = lerp(0, 190, k);
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const top = [[438, 560], [470, 560], [505, 560], [540, 560], [572, 560], [600, 560]];
    const tiras = top.map(([x, y], j) => {
      const L = largo * (0.78 + 0.22 * hash(j * 5 + 1)), sw = 7 * Math.sin(t * 1.25 + j * 0.8) * k;
      return [P2(x, y), P2(x - 6 + sw * 0.4, y + L * 0.5), P2(x - 10 + sw, y + L)];
    });
    const izq = tiras[0], der = tiras[tiras.length - 1];
    g.beginPath(); g.moveTo(izq[0].x - 4, izq[0].y);
    g.quadraticCurveTo(izq[1].x - 10, izq[1].y, izq[2].x - 4, izq[2].y);
    for (let j = 1; j < tiras.length; j++) { const b = tiras[j][2]; g.lineTo(lerp(tiras[j - 1][2].x, b.x, 0.5), Math.max(tiras[j - 1][2].y, b.y) + 12); g.lineTo(b.x, b.y); }
    g.quadraticCurveTo(der[1].x + 6, der[1].y, der[0].x + 4, der[0].y); g.closePath();
    g.fillStyle = COL_M.sombra; g.fill(); g.lineWidth = 5; g.strokeStyle = COL_M.tinta; g.stroke();
    for (let j = 0; j < tiras.length; j++) { const [a, b, c] = tiras[j];
      g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo(b.x, b.y, c.x, c.y - 10); g.lineWidth = 9; g.strokeStyle = j % 2 ? COL_M.oscuro : COL_M.base; g.globalAlpha = 0.7; g.stroke(); g.globalAlpha = 1; }
    g.restore();
  }
  // moño enroscado que tapa la pinza del avatar (retrato)
  function mono(g, k, giroM) {
    if (k <= 0.01) return;
    g.save(); g.translate(MONO_M.x, MONO_M.y); g.scale(k, k); g.rotate(giroM);
    g.beginPath(); g.ellipse(0, 0, 40, 46, 0.2, 0, TAU); g.fillStyle = COL_M.base; g.fill();
    g.save(); g.clip();
    g.fillStyle = COL_M.sombra; g.beginPath(); g.ellipse(12, 14, 36, 34, 0, 0, TAU); g.fill();
    g.strokeStyle = COL_M.luz; g.lineWidth = 7; g.beginPath();
    for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 3.4, r = 4 + i * 0.85; const x = Math.cos(a) * r, y = Math.sin(a) * r * 1.1; if (i) g.lineTo(x, y); else g.moveTo(x, y); }
    g.stroke();
    g.strokeStyle = COL_M.oscuro; g.lineWidth = 3; g.beginPath();
    for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 3.4 + 0.5, r = 6 + i * 0.85; const x = Math.cos(a) * r, y = Math.sin(a) * r * 1.1; if (i) g.lineTo(x, y); else g.moveTo(x, y); }
    g.stroke();
    g.restore();
    g.beginPath(); g.ellipse(0, 0, 40, 46, 0.2, 0, TAU); g.lineWidth = 5; g.strokeStyle = COL_M.tinta; g.stroke();
    g.restore();
  }

  /* =====================================================================================
   * EL PELO DE GUILLERMO: se borran sus púas del retrato (repintando el fondo) y se dibujan
   * púas nuevas que se doblan (la pinza en un pincho) o se recogen en una palmera.
   * ===================================================================================== */
  const PIEL_CAB = [[806,850],[802,846],[766,842],[754,834],[746,834],[742,838],[734,826],[726,826],[718,814],[710,814],[704,808],[708,804],[702,798],[698,802],[690,798],[684,792],[682,782],[674,782],[662,774],[656,768],[660,764],[654,758],[650,762],[634,746],[630,746],[624,740],[624,732],[604,716],[608,712],[604,708],[604,692],[596,684],[596,668],[582,670],[570,654],[566,658],[556,648],[560,640],[558,638],[554,642],[544,632],[548,624],[532,604],[532,596],[528,592],[528,572],[532,568],[528,564],[532,560],[528,552],[540,536],[540,528],[548,516],[562,503],[570,499],[590,499],[624,532],[624,540],[630,550],[636,536],[632,532],[640,524],[640,516],[648,501],[676,477],[676,469],[684,461],[680,457],[690,447],[718,435],[734,423],[744,429],[728,461],[730,467],[762,451],[798,427],[806,431],[823,431],[839,443],[843,439],[851,439],[867,455],[875,455],[881,461],[869,481],[841,509],[843,511],[879,503],[903,487],[911,487],[917,493],[901,524],[893,532],[895,534],[931,514],[947,499],[955,503],[969,520],[965,596],[949,620],[953,624],[937,644],[937,652],[925,676],[909,732],[899,738],[877,764],[885,772],[875,782],[867,778],[861,788],[849,796],[825,832],[829,836],[819,846],[815,842]];
  const camino = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
  const PELO_G = (() => {
    const CUP = [[536,610],[522,540],[524,470],[542,410],[574,360],[625,316],[694,286],[775,270],[860,272],[940,294],[1006,332],[1050,382],[1068,440],[1062,500]];
    const FLEQUILLO = [[1062,500],[1042,552],[1028,522],[1004,570],[984,526],[954,566],[934,522],[902,556],[882,515],[848,540],[826,498],[792,515],[770,478],[728,486],[690,466],[656,488],[642,530],[632,575],[618,528],[598,505],[574,502],[556,520],[546,560]];
    const FRENTE = [[640,482],[720,452],[830,452],[930,470],[985,500],[1000,570],[960,615],[640,600]];
    const CAJA = [[300,40],[1320,40],[1320,700],[300,700]];
    // púas: raíz, punta (de pie), ancho en la raíz — de la nuca (0) a la frente (12)
    const PUAS = [
      [[548, 470], [497, 343], 72], [[572, 400], [528, 312], 80], [[618, 342], [592, 250], 78],
      [[664, 308], [640, 222], 78], [[722, 290], [800, 172], 96], [[800, 276], [912, 184], 96],
      [[872, 284], [976, 206], 92], [[942, 302], [1070, 228], 90], [[1002, 336], [1122, 290], 84],
      [[1044, 384], [1128, 404], 74], [[1062, 440], [1110, 512], 64], [[1050, 500], [1082, 562], 52],
      [[1012, 540], [1022, 612], 42]
    ];
    const N = PUAS.length;
    const COL = { medio: "#8a4219", oscuro: "#3c1e0e", claro: "#c4703a", tinta: "#1e0e08" };
    const CP = CUP.map(([x, y]) => P2(x, y));
    const ruta = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
    const casquete = CUP.concat(FLEQUILLO).map(([x, y]) => P2(x, y));
    function zonaBorrado(g) {
      g.beginPath(); ruta(g, CAJA); M2.curva(g, casquete, true, 0.35); g.clip("evenodd");
      g.beginPath(); ruta(g, CAJA); camino(g, PIEL_CAB); g.clip("evenodd");
      g.beginPath(); ruta(g, CAJA); ruta(g, FRENTE); g.clip("evenodd");
    }
    // ---- la palmera: todas las púas se recogen en GP (coronilla, un poco atrás) ----
    const GP = P2(728, 236), C0 = P2(800, 520), UG = 0.34, UT = 0.46, NP = 28, TRONCO = 52;
    const cuad = (a, b, c, u) => { const v = 1 - u; return P2(v * v * a.x + 2 * v * u * b.x + u * u * c.x, v * v * a.y + 2 * v * u * b.y + u * u * c.y); };
    const HOJAS = PUAS.map(([r], i) => {
      const lean = (i - 6) / 6;
      return { th: -Math.PI / 2 + 1.25 * lean + 0.08 * (hash(i + 3) - 0.5), cae: (0.45 + 1.2 * Math.abs(lean)) * Math.sign(lean || 0.2),
        L: 190 - 40 * Math.abs(lean) + 24 * hash(i * 7 + 1), w: 17 + 6 * hash(i * 3 + 2) };
    });
    // línea central de la púa i: de pie (con giro o), recogida en la palmera (pk), y la hoja que se mece (bam)
    function lineaPua(i, st) {
      const [r, tip] = PUAS[i], Rq = P2(r[0], r[1]);
      const a0 = Math.atan2(tip[1] - r[1], tip[0] - r[0]), L = Math.hypot(tip[0] - r[0], tip[1] - r[1]);
      const pts = [];
      let palma = null;
      if (st.pk > 0.001) {
        const mid = mezcla(Rq, GP, 0.5), dn = P2(mid.x - C0.x, mid.y - C0.y), dl = Math.hypot(dn.x, dn.y) || 1;
        const lev = 0.22 * Math.hypot(GP.x - Rq.x, GP.y - Rq.y);
        const ctrl = P2(mid.x + dn.x / dl * lev, mid.y + dn.y / dl * lev);
        const H = HOJAS[i], copa = P2(GP.x + 4 * Math.sin(st.bam || 0), GP.y - TRONCO);
        palma = []; let q = copa, a = H.th + (st.bam || 0);
        for (let k = 0; k <= NP; k++) {
          const u = k / NP;
          if (u <= UG) palma.push(cuad(Rq, ctrl, GP, u / UG));
          else if (u <= UT) palma.push(mezcla(GP, copa, (u - UG) / (UT - UG)));
          else {
            const v = (u - UT) / (1 - UT), dv = 1 / NP / (1 - UT);
            a = H.th + (st.bam || 0) * (0.4 + v) + H.cae * Math.pow(v, 1.6) * 1.1;
            q = P2(q.x + Math.cos(a) * H.L * dv, q.y + Math.sin(a) * H.L * dv); palma.push(q);
          }
        }
      }
      for (let k = 0; k <= NP; k++) {
        const u = k / NP, bend = (st.o || 0) * Math.pow(u, 1.25), Lm = L * (st.lm || 1);
        const s = P2(Rq.x + Math.cos(a0 + bend) * Lm * u, Rq.y + Math.sin(a0 + bend) * Lm * u);
        pts.push(palma ? mezcla(s, palma[k], st.pk) : s);
      }
      return pts;
    }
    function anchoPua(i, u, pk) {
      const a = PUAS[i][2] * 0.5 * Math.pow(1 - u, 0.9);
      if (pk <= 0.001) return a;
      let b;
      if (u <= UG) b = lerp(PUAS[i][2] * 0.42, 11, Math.pow(u / UG, 0.7));
      else if (u <= UT) b = 10;
      else { const v = (u - UT) / (1 - UT); b = HOJAS[i].w * Math.sin(Math.PI * Math.min(1, 0.2 + v * 0.9)) * (1 - 0.25 * v) + 2; }
      return lerp(a, b, clamp(pk));
    }
    const enLinea = (c, u) => { const x = clamp(u) * NP, k = Math.min(NP - 1, Math.floor(x)), f2 = x - k; return mezcla(c[k], c[k + 1], f2); };
    function tira(g, i, st, desde, hasta, suaveTinta) {
      const cen0 = lineaPua(i, st), N2 = NP;
      const izq = [], der = [], cen = [];
      for (let k = 0; k <= N2; k++) {
        const u = k / N2; if (u < desde - 1e-6 || u > hasta + 1e-6) continue;
        const q = cen0[k], q2 = cen0[Math.min(N2, k + 1)], q1 = cen0[Math.max(0, k - 1)];
        const tx = q2.x - q1.x, ty = q2.y - q1.y, tl = Math.hypot(tx, ty) || 1, nx = -ty / tl, ny = tx / tl;
        const wv = anchoPua(i, u, st.pk) * (1 + 0.12 * Math.sin(u * 3.1));
        izq.push(P2(q.x + nx * wv, q.y + ny * wv)); der.push(P2(q.x - nx * wv, q.y - ny * wv)); cen.push(P2(q.x + nx * wv * 0.25, q.y + ny * wv * 0.25));
      }
      if (izq.length < 2) return cen0;
      const forma = () => { g.beginPath(); g.moveTo(izq[0].x, izq[0].y); for (const q of izq) g.lineTo(q.x, q.y); for (let k = der.length - 1; k >= 0; k--) g.lineTo(der[k].x, der[k].y); g.closePath(); };
      forma(); g.fillStyle = COL.medio; g.fill();
      g.save(); forma(); g.clip();
      g.beginPath(); g.moveTo(cen[0].x, cen[0].y); for (const q of cen) g.lineTo(q.x, q.y); for (let k = der.length - 1; k >= 0; k--) g.lineTo(der[k].x, der[k].y); g.closePath();
      g.fillStyle = COL.oscuro; g.globalAlpha *= 0.85; g.fill(); g.globalAlpha /= 0.85;
      g.beginPath(); for (let k = 1; k < izq.length * 0.75; k++) { const q = izq[k], c = cen[k]; const m = P2(lerp(q.x, c.x, 0.45), lerp(q.y, c.y, 0.45)); if (k === 1) g.moveTo(m.x, m.y); else g.lineTo(m.x, m.y); }
      g.lineWidth = 8; g.strokeStyle = COL.claro; g.globalAlpha *= 0.8; g.stroke(); g.globalAlpha /= 0.8;
      g.restore();
      if (suaveTinta) { g.save(); g.globalAlpha *= 0.45; forma(); g.lineWidth = 2.2; g.lineJoin = "round"; g.strokeStyle = COL.tinta; g.stroke(); g.restore(); }
      else { forma(); g.lineWidth = 5; g.lineJoin = "round"; g.strokeStyle = COL.tinta; g.stroke(); }
      return cen0;
    }
    // orden: las de atrás primero, la de la coronilla (4) la última
    const ORDEN = [0, 1, 2, 3, 12, 11, 10, 9, 8, 7, 6, 5, 4];
    // est: { puas: [{o, pk, bam}], pinza: null | { en: 'pua' , u, abre } | { en: 'palma', abre, k } , kPinza }
    function puas(g, est, t) {
      g.save(); g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); M2.curva(g, CP, false, 0.35);
      g.lineWidth = 16; g.strokeStyle = COL.oscuro; g.stroke(); g.lineWidth = 5; g.strokeStyle = COL.tinta; g.stroke();
      const pk = est.puas[0].pk;
      if (pk > 0.001) {
        // recogidas: primero los mechones que suben a la pinza, luego la pinza y encima las hojas
        for (const i of ORDEN) tira(g, i, est.puas[i], 0, UG + 0.02, pk > 0.6);
        if (est.pinza && est.pinza.en === "palma") pinzaRet(g, GP, -0.04 + (est.pinza.gira || 0), est, est.pinza.abre);
        const orden2 = [0, 12, 1, 11, 2, 10, 3, 9, 4, 8, 5, 7, 6];
        for (const i of orden2) tira(g, i, est.puas[i], UG, 1);
      } else {
        for (const i of ORDEN) {
          const cen = tira(g, i, est.puas[i], 0, 1);
          if (est.pinza && est.pinza.en === "pua" && i === est.pinza.i) {
            const u = est.pinza.u, q = enLinea(cen, u), q2 = enLinea(cen, u + 0.05), a = Math.atan2(q2.y - q.y, q2.x - q.x);
            pinzaRet(g, q, a + Math.PI / 2 + (est.pinza.gira || 0), est, est.pinza.abre);
          }
        }
      }
      g.restore();
    }
    function pinzaRet(g, q, ang, est, abre) { g.save(); g.translate(q.x, q.y); g.rotate(ang); g.scale(est.kPinza, est.kPinza); dibPinza(g, abre || 0); g.restore(); }
    return { zonaBorrado, puas, lineaPua, enLinea, PUAS, N, COL, GP, UG, TRONCO };
  })();

  /* =====================================================================================
   * EL PELO DE GUILLERMO A LO LARGO DE LA ESCENA
   * ===================================================================================== */
  const PUA_P = 9, U_P = 0.75;                        // el pincho de delante donde se engancha la pinza (y a qué altura)
  function pelosG(t) {
    const N = PELO_G.N, puas = [];
    const ucl = t - T.clac;
    for (let i = 0; i < N; i++) {
      let o = 0, pk = 0, bam = 0, lm = 1;
      // la pinza en el pincho: se dobla hacia abajo con el peso, delante de los ojos, y se balancea
      if (i === PUA_P && t >= T.cuelga && t < T.gQuita + 0.6) {
        const u = t - T.cuelga, dob = 2.15 * muelle01(u, 3.2, 6.5);
        o = dob + 0.1 * Math.sin((t - T.cuelga) * 4.2) * tramo(t, T.cuelga + 0.5, T.cuelga + 0.9);
        if (t >= T.gQuita) { const v = t - T.gQuita; o = o * (1 - muelle01(v, 5.5, 16)); }
        lm = 1 + 0.75 * clamp(o / 2.15, -0.3, 1.2);
      }
      // ¡clac!: todas a la palmera, con rebote, la de cada lado un pelín después
      if (t >= T.clac - 0.06) {
        const d = 0.012 * Math.abs(i - 6);
        pk = muelle01(t - (T.clac - 0.06) - d, 7, 13);
        // las hojas se abren y se bambolean (más con los meneos de la cabeza)
        bam = vibra(ucl - d, 0.32, 13, 3.6) * Math.sign(i - 6 || 1) + baileG(t) * 0.12 + botaG(t) * 0.25 * Math.sign(i - 6 || 1);
      }
      puas.push({ o, pk, bam, lm });
    }
    const wC = tramo(t, T.gEngancha - 0.16, T.gEngancha - 0.04);
    let pinza = null;
    if (t >= T.gSuelta1 && t < T.gQuita) pinza = { en: "pua", i: PUA_P, u: U_P, abre: 0, gira: 0.15 * Math.sin((t - T.cuelga) * 4.2) * tramo(t, T.cuelga + 0.4, T.cuelga + 0.8) };
    if (t >= T.clac) pinza = { en: "palma", abre: 0.5 * (1 - tramo(t, T.clac, T.clac + 0.05)), gira: vibra(ucl, 0.12, 20, 6) + 0.05 * baileG(t) };
    return { wC, puas, pinza };
  }
  // meneos de cabeza de Guillermo (mueven la palmera)
  const baileG = t => Math.sin((t - T.gBaila0) * 7.5) * campana(t, T.gBaila0, T.gBaila1);
  const botaG = t => vibra(t - T.gBota, 1, 15, 4.5);

  /* =====================================================================================
   * MARTA
   * ===================================================================================== */
  const CM = {
    quieta: E({ mx: 0.9, my: 0, sonr: 0.35, ancho: 0.9 }),
    nuca: E({ mx: 0.3, my: -0.3, c: 0.25, sd: 6, si: 6, sonr: 0.4, ancho: 0.85 }),
    suelta: E({ mx: 0.4, my: -0.2, c: 1, h: 0.6, sd: 10, si: 10, sonr: 0.8, ancho: 0.95 }),
    mira: E({ mx: 0.95, my: 0.1, sd: 6, si: 8, sonr: 0.45, ancho: 0.9 }),
    tierna: E({ mx: 0.95, my: 0.05, c: 0.3, h: 0.5, sd: 12, si: 12, sonr: 0.75, ancho: 0.9, rub: 0.25 }),
    da: E({ mx: 0.95, my: 0.15, c: 0.2, sd: 8, si: 8, sonr: 0.6, ancho: 0.9 }),
    curiosa: E({ mx: 0.95, my: -0.45, sd: 14, si: 18, gi: 0.08, sonr: 0.3, ancho: 0.75 }),
    aguanta: E({ mx: 0.95, my: -0.4, c: 0.35, sd: 16, si: 16, sonr: 0.55, ancho: 0.7, mof: 0.7, rub: 0.3 }),
    risa: E({ mx: 0.6, my: -0.2, c: 1, h: 1, sd: 16, si: 16, abre: 26, sonr: 0.9, ancho: 1.0, rub: 0.45 }),
    foto: E({ mx: 0.98, my: -0.25, ci: 1, cd: 0.1, sd: 6, si: -4, gi: -0.08, sonr: 0.5, ancho: 0.8 }),
    recoge: E({ mx: 0.7, my: -0.2, c: 0.45, sd: 8, si: 8, sonr: 0.55, ancho: 0.85 }),
    camara: E({ mx: -0.45, my: 0.05, sd: 10, si: 10, sonr: 0.8, ancho: 0.95, rub: 0.2 }),
    guino: E({ mx: -0.45, my: 0.05, cd: 1, h: 0.4, sd: 14, si: 8, sonr: 0.9, ancho: 1.0, rub: 0.25 })
  };
  const GUION_CM = [
    [T.mSale, T.mSale + 0.25, "nuca"], [T.mQuita, T.mQuita + 0.22, "suelta"], [T.mMiraG - 0.15, T.mMiraG + 0.12, "mira"],
    [T.gRuega0 + 0.15, T.gRuega0 + 0.4, "tierna"], [T.mDa0, T.mDa0 + 0.2, "da"], [T.gSube0 + 0.2, T.gSube0 + 0.45, "curiosa"],
    [T.mRisita, T.mRisita + 0.18, "aguanta"], [T.gQuita, T.gQuita + 0.1, "curiosa"], [T.clac + 0.05, T.clac + 0.15, "aguanta"],
    [T.mRisa0, T.mRisa0 + 0.12, "risa"], [T.mFoto0 + 0.1, T.mFoto1, "foto"], [T.mFotoFin, T.mFotoFin + 0.2, "risa"],
    [T.mRecoge0 + 0.1, T.mRecoge0 + 0.3, "recoge"], [T.camara, T.camara + 0.2, "camara"], [T.mGuino, T.mGuino + 0.12, "guino"]
  ];
  const PARP_M = [2.7, 4.95, 7.6, 11.0, 12.7];
  const P0M = { torso: 0, cab: 0.02, cdx: 0, cdy: 0, pel: 0 };
  const CuM = o => Object.assign({}, P0M, o);
  const CUER_M = {
    quieta: CuM({}),
    nuca: CuM({ torso: -0.02, cab: 0.08 }),
    suelta: CuM({ torso: -0.04, cab: -0.1 }),
    mira: CuM({ torso: 0.0, cab: 0.04 }),
    tierna: CuM({ torso: 0.02, cab: 0.12 }),
    da: CuM({ torso: 0.08, cab: 0.06 }),
    curiosa: CuM({ torso: 0.02, cab: -0.04 }),
    risa: CuM({ torso: 0.07, cab: 0.16, cdy: 4 }),
    foto: CuM({ torso: -0.05, cab: 0.1, cdy: 2 }),
    recoge: CuM({ torso: -0.02, cab: 0.14 }),
    camara: CuM({ torso: 0.0, cab: 0.0 })
  };
  const GUION_M = [
    [T.mSale, T.mLlega, "nuca"], [T.mQuita, T.mQuita + 0.4, "suelta"], [T.mMiraG - 0.2, T.mMiraG + 0.2, "mira"],
    [T.gRuega0 + 0.1, T.gRuega0 + 0.45, "tierna"], [T.mDa0, T.mDa1, "da"], [T.mVuelve0, T.mVuelve1, "curiosa"],
    [T.mRisa0, T.mRisa0 + 0.2, "risa"], [T.mFoto0, T.mFoto1, "foto"], [T.mFotoFin, T.mFotoFin + 0.2, "risa"],
    [T.mRecoge0, T.mRecoge0 + 0.4, "recoge"], [T.mRecoge1, T.mRecoge1 + 0.4, "mira"], [T.camara, T.camara + 0.3, "camara"]
  ];
  const TOB_M = M.SUELO - M.TOBILLO_ALTO;
  const pieM = (p, x) => M.PELVIS.x - (x - p.x) / (S * M.K);
  // caída del pelo (0 → 1, se pasa un poco) y recogida final (0 → 1)
  const caidaM = t => muelle01(t - T.suelta, 4.2, 7.5);
  const giroM = t => tramo(t, T.mGira0, T.mGira1, suave5);
  function poseM(t) {
    const b = linea(GUION_M, CUER_M, "quieta", t);
    const respira = Math.sin(t * 1.8 + 0.6);
    const p = { x: XM0, suelo: SUELO, s: S, espejo: true, tirasLimpias: true,
      pelvis: { x: M.PELVIS.x, y: M.PELVIS.y + b.pel + respira * 1.1 }, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: b.cdx, dy: b.cdy, esc: { x: 1, y: 1 } } };
    // sacude la melena: la cabeza baja un poco y se echa atrás, despacio
    const us = fase(t, T.sacude0, T.sacude1);
    if (us > 0 && us < 1) p.cabeza.ang += 0.13 * Math.sin(us * Math.PI * 2) * Math.sin(us * Math.PI);
    // risa: la cabeza bota
    p.cabeza.dy += 3 * Math.abs(Math.sin((t - T.mRisa0) * 13)) * campana(t, T.mRisa0, T.mRisa1);
    p.torso += 0.012 * Math.sin((t - T.mRisa0) * 13) * campana(t, T.mRisa0, T.mRisa1);
    // la recogida: la cabeza acompaña las vueltas
    p.cabeza.ang += 0.05 * Math.sin((t - T.mGira0) * 9) * campana(t, T.mGira0, T.mGira1);
    p.piernas.cerca = { tob: P2(pieM(p, XM0 + 30), TOB_M), ang: 0 };
    p.piernas.lejos = { tob: P2(pieM(p, XM0 - 34), TOB_M - 8), ang: 0 };
    // la melena del avatar: inercia al soltarse y al sacudirla
    p.pelo = { viento: 0.05 * Math.sin(t * 1.3), inercia: vibra(t - T.suelta, 0.9, 7, 2.6) + 0.5 * Math.sin(us * Math.PI * 2) * campana(t, T.sacude0, T.sacude1) };
    const e = linea(GUION_CM, CM, "quieta", t);
    p.cara = cara(e, parpadeo(t, PARP_M));
    // ---- manos ----
    const res = resolutor(M, p, "cerca"), resL = resolutor(M, p, "lejos");
    const cab = q => () => enCab(M, p, q);
    const PINZA = D(0.55, 0.45, 0.4, 0.35), ABRE = D(1, 1, 1, 1), FLOJA = D(0.6, 0.6, 0.55, 0.5), BOCA = D(0.8, 0.95, 0.95, 0.9), COGE = D(0.85, 0.8, 0.8, 0.8);
    const ESE = D5(1, 1, 0.05, 0.05, 0.05);              // la «L» de la foto
    const entrega = () => puntoEntrega(t);
    const mon = () => { const c = enCab(M, p, MONO_M), a = (t - T.mGira0) * 9.5; return P2(c.x + 7 * Math.cos(a), c.y + 6 * Math.sin(a)); };
    const PISTA_MC = [
      [0, 0, { bols: true }],
      [T.mSale - 0.12, T.mSale, { bols: true, sale: true, dedos: FLOJA }],
      [T.mSale, T.mLlega, { scr: cab(P2(PINZA_M.x + 10, PINZA_M.y + 6)), auto: 0.2, dedos: D(0.85, 0.8, 0.75, 0.7), dobla: 1 }],
      [T.mLlega, T.mAprieta, { scr: cab(PINZA_M), auto: 0.2, dedos: PINZA, dobla: 1 }],
      // tira de la pinza hacia atrás y la baja delante del pecho
      [T.mQuita, T.mQuita + 0.22, { scr: cab(P2(PINZA_M.x - 70, PINZA_M.y + 40)), auto: 0.2, dedos: PINZA, dobla: 1 }, salida],
      [T.mQuita + 0.22, T.mBaja + 0.3, { tr: P2(170, 462), auto: 0.4, dedos: PINZA, dobla: 1 }],
      // se la pasa a la otra mano
      [T.mPasa - 0.35, T.mPasa, { tr: P2(236, 456), auto: 0.3, dedos: PINZA, dobla: 1 }],
      [T.mPasa + 0.04, T.mPasa + 0.45, { bols: true }],
      // se tapa la boca de risa
      [T.mRisa0 - 0.18, T.mRisa0 - 0.16, { bols: true, sale: true, dedos: BOCA }],
      [T.mRisa0 - 0.16, T.mRisa0 + 0.08, { scr: () => bocaM(p, -6), auto: -0.1, dedos: BOCA, dobla: 1 }, salida],
      // la foto: L con el índice y el pulgar
      [T.mFoto0, T.mFoto1, { tr: FOTO_C, mu: Math.PI, ang: 0, dedos: ESE, dobla: -1 }],
      [T.mFotoFin, T.mFotoFin + 0.12, { tr: P2(140, 470), auto: 0.4, dedos: FLOJA, dobla: 1 }],
      // se recoge el pelo: la mano a la nuca, vueltas y la goma
      [T.mRecoge0, T.mGira0, { scr: cab(P2(MONO_M.x + 20, MONO_M.y + 30)), auto: 0.2, dedos: PINZA, dobla: 1 }],
      [T.mGira0, T.mGira0 + 0.1, { scr: mon, auto: 0.2, dedos: PINZA, dobla: 1 }],
      [T.mGira1, T.mGoma, { scr: cab(P2(MONO_M.x + 10, MONO_M.y + 20)), auto: 0.2, dedos: ABRE, dobla: 1 }],
      [T.mRecoge1, T.mBolsillo, { bols: true }]
    ];
    const PISTA_ML = [
      [0, 0, { bols: true }],
      [T.mPasa - 0.42, T.mPasa - 0.3, { bols: true, sale: true, dedos: COGE }],
      [T.mPasa - 0.3, T.mPasa, { tr: P2(262, 466), auto: 0.3, dedos: COGE, dobla: 1 }],
      [T.mPasa, T.mPasa + 0.05, { tr: P2(262, 466), auto: 0.3, dedos: PINZA, dobla: 1 }],
      // se la da a Guillermo
      [T.mDa0 - 0.1, T.mDa1, { scr: entrega, auto: 0.3, dedos: PINZA, dobla: 1 }],
      [T.gCoge + 0.06, T.gCoge + 0.2, { scr: entrega, auto: 0.3, dedos: ABRE, dobla: 1 }],
      [T.mVuelve0, T.mVuelve1, { bols: true }],
      [T.mFoto0 - 0.14, T.mFoto0, { bols: true, sale: true, dedos: ESE }],
      [T.mFoto0, T.mFoto1, { tr: FOTO_L, mu: 0, ang: 0, dedos: ESE, dobla: 1 }],
      [T.mFotoFin, T.mFotoFin + 0.4, { bols: true }]
    ];
    const C = pista(PISTA_MC, t, res), L = pista(PISTA_ML, t, resL);
    // se ríe: la mano tiembla un poco
    C.y += 4 * Math.sin((t - T.mRisa0) * 13) * campana(t, T.mRisa0, T.mRisa1 - 0.1);
    p.manoCerca = mano(M, p, "cerca", C); p.manoLejos = mano(M, p, "lejos", L);
    // la pinza en sus manos (desde que la quita hasta que la coge Guillermo), encima de los dedos
    p.pinzaAF = null;
    if (t >= T.mQuita - 0.02 && t < T.gCoge) {
      const k = lerp(0.45, 1, tramo(t, T.mQuita, T.mQuita + 0.3));
      const mC = manoPant(M, p, "cerca"), mL = manoPant(M, p, "lejos");
      let A = mezclaAF(pinzaEnMano(mC.h, mC.e, k, 1), pinzaEnMano(mL.h, mL.e, 1, -1), tramo(t, T.mPasa - 0.08, T.mPasa + 0.04));
      A = mezclaAF(A, afEntrega(t), tramo(t, T.mDa1 - 0.22, T.mDa1 - 0.02));
      p.pinzaAF = A; p.pinzaAbre = 0.35 * campana(t, T.mAprieta - 0.06, T.mQuita + 0.12);
    }
    // la goma rosa en la muñeca (hasta que se la pone en el moño)
    p.gomaMuneca = t < T.mGoma && C.puno > 0.5;
    p.capaCabeza = (g, tt) => capaM(g, tt);
    return p;
  }
  const bocaM = (p, dx) => { const b = M.aPantalla(p, M.boca(p)); return P2(b.x + dx, b.y + 4); };
  // la «foto»: las dos «L» hacen un marco delante de ella (esquina de abajo y esquina de arriba; tronco)
  const FOTO_C = P2(340, 302), FOTO_L = P2(482, 182);
  function capaM(g, t) {
    const f = caidaM(t), gi = giroM(t);
    melenaSuelta(g, t, f, gi, t - T.suelta);
    mono(g, tramo(gi, 0.45, 0.85, salida), (t - T.mGira0) * 1.2 * (1 - tramo(t, T.mGira1, T.mGira1 + 0.2)));
  }

  /* =====================================================================================
   * GUILLERMO
   * ===================================================================================== */
  const CG = {
    mira: E({ mx: 0.9, my: -0.05, sonr: 0.25, ancho: 0.9 }),
    embobado: E({ mx: 0.95, my: -0.2, iris: 1.12, sd: 18, si: 20, abre: 22, ancho: 0.7, sonr: 0.2, rub: 0.55 }),
    senala: E({ mx: 0.95, my: 0.25, sd: 14, si: 18, gi: 0.08, abre: 8, ancho: 0.7, sonr: 0.5 }),
    ruega: E({ mx: 0.95, my: -0.35, iris: 1.22, sd: 26, gd: -0.22, si: 28, gi: -0.24, sonr: 0.3, ancho: 0.55, rub: 0.3 }),
    coge: E({ mx: 0.9, my: 0.25, sd: 10, si: 12, sonr: 0.85, ancho: 1.0 }),
    concentra: E({ mx: -0.6, my: -0.55, sd: -4, si: 10, abre: 4, ancho: 0.4, sonr: 0.1, lengua: 1 }),
    pincho: E({ mx: 0.75, my: -0.75, iris: 1.15, sd: 16, si: 22, gi: 0.1, abre: 4, ancho: 0.5, sonr: -0.05 }),
    pasa: E({ mx: 0.6, my: 0.6, sd: 6, si: 8, sonr: 0.3, ancho: 0.8 }),
    quita: E({ mx: 0.0, my: -1, sd: 8, si: 8, abre: 6, ancho: 0.5, sonr: 0.1 }),
    clac: E({ c: 1, z: 1, sd: -4, si: -4, abre: 4, ancho: 0.7, sonr: 0.2 }),
    arriba: E({ mx: 0.1, my: -1, iris: 1.1, sd: 22, si: 22, abre: 12, ancho: 0.6, sonr: 0.35 }),
    orgullo: E({ mx: -0.3, my: -0.05, c: 0.4, sd: 18, si: 8, gi: -0.08, sonr: 0.95, ancho: 1.05 }),
    guino: E({ mx: 0.6, my: -0.05, cd: 1, h: 0.5, sd: 20, si: 10, sonr: 1.0, ancho: 1.1 }),
    baila: E({ mx: 0.9, my: -0.1, c: 0.25, h: 0.4, sd: 14, si: 14, sonr: 0.9, ancho: 1.0 }),
    camara: E({ mx: -0.45, my: 0.0, sd: 16, si: 10, gi: -0.06, sonr: 1.0, ancho: 1.1, rub: 0.3 })
  };
  const GUION_CG = [
    [T.gEmbobado, T.gEmbobado + 0.25, "embobado"], [T.gSenala0, T.gSenala0 + 0.15, "senala"], [T.gRuega0, T.gRuega0 + 0.18, "ruega"],
    [T.gCoge - 0.12, T.gCoge + 0.08, "coge"], [T.gSube0 + 0.15, T.gSube0 + 0.35, "concentra"], [T.gMiraPincho, T.gMiraPincho + 0.15, "pincho"],
    [T.gCogePinza - 0.2, T.gCogePinza, "concentra"], [T.gQuita + 0.05, T.gQuita + 0.2, "pasa"], [T.gEchaAtras0 + 0.1, T.gEchaAtras0 + 0.3, "quita"], [T.clac - 0.02, T.clac + 0.03, "clac"],
    [T.gEndereza0 + 0.1, T.gEndereza0 + 0.3, "mira"], [T.gMiraArriba0, T.gMiraArriba0 + 0.15, "arriba"], [T.gOrgullo0, T.gOrgullo0 + 0.2, "orgullo"],
    [T.gGuino - 0.05, T.gGuino + 0.08, "guino"], [T.gGuino + 0.6, T.gGuino + 0.8, "orgullo"], [T.gBaila0, T.gBaila0 + 0.2, "baila"],
    [T.camara, T.camara + 0.2, "camara"]
  ];
  const PARP_G = [0.5, 1.4, 4.45, 6.25, 9.2, 11.6, 12.6];
  const P0G = { torso: 0.02, cab: 0.03, cdx: 0, cdy: 0, pun: 0 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    quieto: CuG({}),
    embobado: CuG({ torso: 0.08, cab: 0.1 }),
    senala: CuG({ torso: 0.06, cab: 0.06 }),
    ruega: CuG({ torso: 0.1, cab: 0.16, cdy: 4 }),
    coge: CuG({ torso: 0.06, cab: 0.04 }),
    engancha: CuG({ torso: 0.12, cab: 0.46, cdy: 22 }),
    pincho: CuG({ torso: 0.02, cab: 0.06 }),
    pasa: CuG({ torso: 0.05, cab: 0.14 }),
    atras: CuG({ torso: -0.08, cab: -0.5, cdy: 30, pun: 1 }),
    recto: CuG({ torso: -0.02, cab: -0.04 }),
    arriba: CuG({ torso: -0.05, cab: -0.14 }),
    orgullo: CuG({ torso: -0.06, cab: -0.1 }),
    camara: CuG({ torso: -0.02, cab: -0.04 })
  };
  const GUION_G = [
    [T.gEmbobado, T.gEmbobado + 0.4, "embobado"], [T.gSenala0, T.gSenala1, "senala"], [T.gRuega0, T.gRuega0 + 0.25, "ruega"],
    [T.gCoge - 0.2, T.gCoge, "coge"], [T.gSube0 + 0.1, T.gEngancha, "engancha"], [T.gMiraPincho, T.gMiraPincho + 0.3, "pincho"],
    [T.gCogePinza - 0.3, T.gCogePinza, "engancha"], [T.gQuita + 0.04, T.gPasa - 0.05, "pasa"], [T.gEchaAtras0, T.gCoronilla, "atras"], [T.gEndereza0, T.gEndereza1, "recto", salida], [T.gMiraArriba0, T.gMiraArriba0 + 0.3, "arriba"],
    [T.gOrgullo0, T.gOrgullo1, "orgullo"], [T.camara, T.camara + 0.3, "camara"]
  ];
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const pieG = (p, x, lado) => ({ tob: P2(G.PELVIS.x + (x - p.x) / S, TOB_G - (lado === "lejos" ? 10 : 0)), ang: 0 });
  function poseG(t) {
    const b = linea(GUION_G, CUER_G, "quieto", t);
    const respira = Math.sin(t * 2.2);
    const p = { x: XG0, suelo: SUELO, s: S, tirasLimpias: true, hombrosContinuos: true, hombrosRecortados: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + respira * 1.3 }, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: b.cdx, dy: b.cdy, esc: { x: 1, y: 1 } } };
    // de puntillas al cerrar la pinza en la coronilla
    const pun = b.pun;
    p.pelvis.y -= 26 * pun;
    p.piernas.cerca = pieG(p, XG0 - 34, "cerca"); p.piernas.lejos = pieG(p, XG0 + 40, "lejos");
    p.piernas.cerca.tob.y -= 22 * pun; p.piernas.lejos.tob.y -= 22 * pun;
    p.piernas.cerca.ang = -0.35 * pun; p.piernas.lejos.ang = -0.35 * pun;
    // ¡clac!: respingo
    if (t > T.clac) { const u = t - T.clac; p.cabeza.dy += vibra(u, 6, 22, 9); }
    // embobado: se balancea hacia ella
    p.torso += 0.03 * Math.sin((t - T.gEmbobado) * 3) * campana(t, T.gEmbobado, T.gSenala0);
    // baila con la palmera; bote final
    p.cabeza.ang += 0.07 * baileG(t) + 0.04 * botaG(t);
    p.torso += 0.02 * baileG(t);
    p.pelvis.y -= 6 * Math.abs(Math.sin((t - T.gBaila0) * 7.5)) * campana(t, T.gBaila0, T.gBaila1);
    const e = linea(GUION_CG, CG, "mira", t);
    p.cara = cara(e, parpadeo(t, PARP_G));
    p.rojo = 0;
    // ---- manos ----
    const res = resolutor(G, p, "cerca"), resL = resolutor(G, p, "lejos");
    const PUNO = D(0.45, 0.32, 0.3, 0.3), ABRE = D(1, 1, 1, 1), FLOJA = D(0.6, 0.65, 0.6, 0.55), PINZA = D(0.6, 0.5, 0.42, 0.38);
    const SENALA = D(0.15, 1, 0.05, 0.05), RUEGA = D(0.9, 1, 1, 1), COGE = D(0.85, 0.8, 0.8, 0.8);
    const est = pelosG(t);
    const AG = afCab(G, p);
    // dónde va la pinza en el pincho (pantalla), con el pincho de pie
    const enPincho = () => { const cen = PELO_G.lineaPua(PUA_P, { o: 0, pk: 0 }); return aPant(AG, PELO_G.enLinea(cen, U_P)); };
    const enCoronilla = () => aPant(AG, PELO_G.GP);
    const colgada = () => aPant(AG, pinzaEnPuaRet(est).q);
    const PISTA_GL = [
      [0, 0, { bols: true }],
      // señala la pinza de Marta
      [T.gSenala0 - 0.14, T.gSenala0, { bols: true, sale: true, dedos: SENALA }],
      [T.gSenala0, T.gSenala0 + 0.22, { scr: () => senalaG(p), mu: Math.PI, ang: 0, dedos: SENALA, dobla: 1 }, salida],
      // junta las manos y suplica
      [T.gRuega0, T.gRuega0 + 0.22, { tr: P2(262, 444), mu: 2.0, ang: 0, dedos: RUEGA, dobla: 1 }, salida],
      // la coge
      [T.mDa0, T.gCoge, { scr: () => puntoEntrega(t), auto: 0.3, dedos: COGE, dobla: 1 }],
      [T.gCoge, T.gCoge + 0.05, { scr: () => puntoEntrega(t), auto: 0.3, dedos: PINZA, dobla: 1 }],
      // con el brazo estirado: el codo pasa a ir hacia delante (no por delante de la cara)
      [T.gCoge + 0.06, T.gCoge + 0.08, { scr: () => puntoEntrega(t), auto: 0.3, dedos: PINZA, dobla: -1 }],
      // se la engancha en el pincho de delante
      [T.gSube0 + 0.06, T.gEngancha, { scr: enPincho, auto: 0.15, dedos: PINZA, dobla: -1 }],
      [T.gSuelta1, T.gSuelta1 + 0.25, { scr: () => { const q = enPincho(); return P2(q.x + 24, q.y + 34); }, auto: 0.2, dedos: ABRE, dobla: -1 }, salida],
      [T.gMiraPincho + 0.1, T.gCogePinza - 0.3, { tr: P2(360, 560), auto: 0.3, dedos: FLOJA, dobla: -1 }],
      // la quita del pincho y se la pasa a la otra mano delante del pecho
      [T.gCogePinza - 0.26, T.gCogePinza, { scr: colgada, auto: 0.15, dedos: COGE, dobla: -1 }],
      [T.gCogePinza, T.gQuita, { scr: colgada, auto: 0.15, dedos: PINZA, dobla: -1 }],
      [T.gQuita, T.gPasa - 0.02, { tr: P2(296, 520), auto: 0.3, dedos: PINZA, dobla: -1 }, salida],
      [T.gPasa + 0.04, T.gPasa + 0.4, { bols: true, dobla: -1 }],
      [T.gOrgullo0 - 0.32, T.gOrgullo0 - 0.3, { bols: true }],
      // brazos en jarras
      [T.gOrgullo0 - 0.1, T.gOrgullo0 + 0.05, { bols: true, sale: true, dedos: PUNO }],
      [T.gOrgullo0 + 0.05, T.gOrgullo1, { tr: P2(388, 610), mu: -0.8, ang: 0, dedos: PUNO, dobla: 1 }, salida]
    ];
    const PISTA_GC = [
      [0, 0, { bols: true }],
      [T.gRuega0 - 0.14, T.gRuega0, { bols: true, sale: true, dedos: RUEGA }],
      [T.gRuega0, T.gRuega0 + 0.22, { tr: P2(232, 440), mu: 2.3, ang: 0, dedos: RUEGA, dobla: -1 }, salida],
      [T.mDa0, T.mDa0 + 0.4, { bols: true }],
      // recoge la pinza de la otra mano
      [T.gPasa - 0.32, T.gPasa - 0.3, { bols: true, sale: true, dedos: COGE }],
      [T.gPasa - 0.3, T.gPasa, { tr: P2(250, 520), auto: 0.3, dedos: COGE, dobla: -1 }],
      [T.gPasa, T.gPasa + 0.04, { tr: P2(250, 520), auto: 0.3, dedos: PINZA, dobla: -1 }],
      // sube por detrás de la cabeza (sin pasar por delante de la cara) hasta la coronilla
      [T.gPasa + 0.04, T.gPasa + 0.13, { tr: P2(70, 500), auto: 0.2, dedos: PINZA, dobla: -1 }],
      [T.gPasa + 0.13, T.gPasa + 0.24, { tr: P2(-10, 320), auto: 0.2, dedos: PINZA, dobla: -1 }],
      [T.gPasa + 0.24, T.gCoronilla, { scr: enCoronilla, auto: 0.1, dedos: PINZA, dobla: -1 }],
      [T.clac + 0.06, T.gEndereza0 + 0.12, { scr: () => { const q = enCoronilla(); return P2(q.x - 30, q.y + 30); }, auto: 0.2, dedos: ABRE, dobla: -1 }, salida],
      [T.gEndereza0 + 0.12, T.gEndereza0 + 0.34, { tr: P2(40, 450), auto: 0.2, dedos: FLOJA, dobla: -1 }],
      [T.gEndereza0 + 0.34, T.gOrgullo0, { tr: P2(80, 600), auto: 0.3, dedos: FLOJA, dobla: -1 }],
      // brazos en jarras
      [T.gOrgullo0, T.gOrgullo1, { tr: P2(96, 612), mu: -2.3, ang: 0, dedos: PUNO, dobla: -1 }, salida]
    ];
    const C = pista(PISTA_GC, t, res), L = pista(PISTA_GL, t, resL);
    // ruega: las manos juntas tiemblan un poquito
    const rg = campana(t, T.gRuega0 + 0.15, T.mDa0 + 0.05);
    C.y += rg * 3 * Math.sin(t * 24); L.y += rg * 3 * Math.sin(t * 24);
    p.manoCerca = mano(G, p, "cerca", C); p.manoLejos = mano(G, p, "lejos", L);
    // la pinza en sus manos (se dibuja encima de los dedos)
    est.kPinza = kRet(AG) * KPINZA;
    p.pinzaAF = null;
    if ((t >= T.gCoge && t < T.gSuelta1) || (t >= T.gQuita && t < T.clac)) {
      const mL = manoPant(G, p, "lejos"), AL = pinzaEnMano(mL.h, mL.e, 1, 1);
      let A;
      if (t < T.gSuelta1) {
        A = mezclaAF(afEntrega(t), AL, tramo(t, T.gCoge + 0.04, T.gCoge + 0.26));
        A = mezclaAF(A, pinzaAfinRet(AG, pinzaEnPuaRet(est), 1), tramo(t, T.gEngancha - 0.24, T.gEngancha - 0.03));
      } else {
        const mC = manoPant(G, p, "cerca"), AC = pinzaEnMano(mC.h, mC.e, 1, -1);
        A = mezclaAF(pinzaAfinRet(AG, pinzaEnPuaRet(est), 1), AL, tramo(t, T.gQuita + 0.02, T.gQuita + 0.2));
        A = mezclaAF(A, AC, tramo(t, T.gPasa - 0.08, T.gPasa + 0.04));
        A = mezclaAF(A, pinzaAfinRet(AG, { q: PELO_G.GP, a: -0.04 }, 1), tramo(t, T.gCoronilla - 0.24, T.gCoronilla - 0.03));
      }
      p.pinzaAF = A;
      p.pinzaAbre = t >= T.gQuita ? 0.5 * tramo(t, T.gQuita - 0.04, T.gQuita + 0.04) * (1 - tramo(t, T.gQuita + 0.08, T.gQuita + 0.16)) + 0.5 * tramo(t, T.gCoronilla - 0.2, T.gCoronilla - 0.1) * (1 - tramo(t, T.clac - 0.04, T.clac))
        : 0.45 * tramo(t, T.gEngancha - 0.2, T.gEngancha - 0.1) * (1 - tramo(t, T.gEngancha - 0.04, T.gSuelta1));
    }
    p.est = est;
    p.capaCabeza = (g, tt) => capaG(g, tt, est);
    return p;
  }
  const KPINZA = 1.05;                                  // tamaño de la pinza (respecto a la de la mano)
  const aPant = (A, q) => P2(A.a * q.x + A.c * q.y + A.e, A.b * q.x + A.d * q.y + A.f);
  // la pinza enganchada en el pincho (retrato): centro y ángulo
  function pinzaEnPuaRet(est) {
    const st = est.puas[PUA_P], cen = PELO_G.lineaPua(PUA_P, st), q = PELO_G.enLinea(cen, U_P), q2 = PELO_G.enLinea(cen, U_P + 0.05);
    return { q, a: Math.atan2(q2.y - q.y, q2.x - q.x) + Math.PI / 2 };
  }
  const pinzaColgadaPant = (R, p, A, est) => aPant(A, pinzaEnPuaRet(est).q);
  // afín de pantalla de la pinza puesta en el retrato (q, a) de la cabeza A
  function pinzaAfinRet(A, c, k) {
    const o = aPant(A, c.q), ex = aPant(A, P2(c.q.x + Math.cos(c.a) * 100, c.q.y + Math.sin(c.a) * 100));
    const a = Math.atan2(ex.y - o.y, ex.x - o.x), det = A.a * A.d - A.b * A.c, sg = det < 0 ? -1 : 1;
    const cs = Math.cos(a) * k * KPINZA, sn = Math.sin(a) * k * KPINZA;
    return AF(cs, sn, -sn * sg, cs * sg, o.x, o.y);
  }
  // pinza en un puño: cruzada al antebrazo, un pelín por delante de los dedos
  function pinzaEnMano(h, e, k, sgv) {
    const phi = Math.atan2(h.y - e.y, h.x - e.x), d = P2(Math.cos(phi), Math.sin(phi));
    const c = P2(h.x + d.x * 9, h.y + d.y * 9), a = phi + Math.PI / 2 * sgv;
    const cs = Math.cos(a) * k, sn = Math.sin(a) * k;
    return AF(cs, sn, -sn, cs, c.x, c.y);
  }
  // descomponer / mezclar afines (posición, ángulo, escala, volteo)
  const difAng = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const desc = A => { const sx = Math.hypot(A.a, A.b), th = Math.atan2(A.b, A.a), det = A.a * A.d - A.b * A.c; return { o: P2(A.e, A.f), th, sx, sy: det / sx }; };
  const comp = d => { const c = Math.cos(d.th), s = Math.sin(d.th); return AF(c * d.sx, s * d.sx, -s * d.sy, c * d.sy, d.o.x, d.o.y); };
  function mezclaAF(A, B, k) {
    if (k <= 0) return A; if (k >= 1) return B;
    const a = desc(A), b = desc(B);
    return comp({ o: mezcla(a.o, b.o, k), th: a.th + difAng(a.th, b.th) * k, sx: lerp(a.sx, b.sx, k), sy: lerp(a.sy, b.sy, k) });
  }
  // la pinza en el momento de la entrega: tumbada, en el punto de la entrega
  const afEntrega = t => { const q = puntoEntrega(t); return AF(1, 0, 0, 1, q.x, q.y - 2); };
  const objPinza = (af, abre) => g => { if (!MATRIZ) return; g.save(); g.setTransform(MATRIZ); aplica(g, af()); dibPinza(g, abre()); g.restore(); };
  function capaG(g, t, est) {
    if (est.wC > 0.002 && MATRIZ && fondo) {
      g.save(); g.globalAlpha = est.wC;
      g.save(); PELO_G.zonaBorrado(g); g.setTransform(MATRIZ); g.drawImage(fondo, -60, -60); g.restore();
      PELO_G.puas(g, est, t);
      g.restore();
    }
  }
  // señala la pinza que tiene Marta en la mano (pantalla)
  function senalaG(p) { const c = enCab(G, p, P2(820, 470)); return P2(c.x + 66, c.y + 64); }
  // punto de la entrega (entre los dos, a la altura del pecho)
  function puntoEntrega(t) { return P2(516, SUELO - 270 + 3 * Math.sin(t * 2)); }

  /* =====================================================================================
   * DECORADO
   * ===================================================================================== */
  const W2 = W + 120;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W2; c.height = H + 120;
    const g = c.getContext("2d"); g.translate(60, 60);
    g.lineJoin = "round"; g.lineCap = "round";
    // pared crema con ramitas
    const pa = g.createLinearGradient(0, -60, 0, 520); pa.addColorStop(0, "#f7ead6"); pa.addColorStop(1, "#efdcc2");
    g.fillStyle = pa; g.fillRect(-60, -60, W2, 590);
    for (let fila = 0; fila < 13; fila++) for (let col = 0; col < 22; col++) {
      const x = -50 + col * 52 + (fila % 2) * 26, y = -40 + fila * 44, h = hash(fila * 37 + col * 11);
      g.save(); g.translate(x, y); g.rotate((h - 0.5) * 0.8);
      g.strokeStyle = "rgba(128,150,112,0.55)"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, 6); g.quadraticCurveTo(1, 0, 0, -6); g.stroke();
      g.fillStyle = "rgba(128,150,112,0.5)";
      for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 3, -1 + s, 3, 1.4, s * 0.6, 0, TAU); g.fill(); }
      g.fillStyle = h > 0.5 ? "rgba(226,150,150,0.6)" : "rgba(238,190,120,0.6)"; g.beginPath(); g.arc(0, -7, 2.1, 0, TAU); g.fill();
      g.restore();
    }
    // zócalo blanco
    g.fillStyle = "#fbf6ee"; g.fillRect(-60, 508, W2, 26);
    g.strokeStyle = "rgba(120,90,60,0.4)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-60, 508); g.lineTo(W + 60, 508); g.stroke();
    g.fillStyle = "rgba(120,90,60,0.18)"; g.fillRect(-60, 530, W2, 4);
    // suelo de tablas claras
    const Y0 = 534;
    const su = g.createLinearGradient(0, Y0, 0, H + 60); su.addColorStop(0, "#d2a676"); su.addColorStop(1, "#c08f5c");
    g.fillStyle = su; g.fillRect(-60, Y0, W2, H + 60 - Y0);
    for (let fila = 0; fila < 8; fila++) {
      const y = Y0 + fila * 12 + fila * fila * 0.6;
      g.strokeStyle = "rgba(110,70,35,0.35)"; g.lineWidth = 1; g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke();
      for (let x = -60 + (fila % 3) * 70; x < W + 60; x += 210) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 12 + fila); g.stroke(); }
    }
    // ventana (izquierda) con el cielo, copas de árboles y tejados
    const VX = 92, VY = 64, VW = 236, VH = 262;
    const cielo = g.createLinearGradient(0, VY, 0, VY + VH); cielo.addColorStop(0, "#9fd3f0"); cielo.addColorStop(1, "#e3f3f8");
    g.fillStyle = cielo; g.fillRect(VX, VY, VW, VH);
    g.fillStyle = "rgba(255,255,255,0.9)";
    for (const [x, y, s] of [[150, 110, 1], [262, 150, 0.8]]) { g.beginPath(); g.ellipse(x, y, 30 * s, 11 * s, 0, 0, TAU); g.ellipse(x + 20 * s, y - 8 * s, 18 * s, 12 * s, 0, 0, TAU); g.ellipse(x - 18 * s, y - 4 * s, 14 * s, 9 * s, 0, 0, TAU); g.fill(); }
    g.fillStyle = "#e9b9a2"; g.beginPath(); g.moveTo(VX, 268); g.lineTo(VX + 60, 248); g.lineTo(VX + 110, 262); g.lineTo(VX + 150, 244); g.lineTo(VX + VW, 266); g.lineTo(VX + VW, VY + VH); g.lineTo(VX, VY + VH); g.closePath(); g.fill();
    g.fillStyle = "#8fbf86";
    for (let i = 0; i < 9; i++) { const x = VX + 8 + i * 28, r = 18 + 8 * hash(i + 2); g.beginPath(); g.arc(x, 286 - 6 * hash(i * 3), r, 0, TAU); g.fill(); }
    g.fillStyle = "#79aa72"; for (let i = 0; i < 9; i++) { const x = VX + 20 + i * 28; g.beginPath(); g.arc(x, 300, 16, 0, TAU); g.fill(); }
    // marco y travesaños
    g.strokeStyle = "#fffdf8"; g.lineWidth = 9;
    g.beginPath(); g.moveTo(VX + VW / 2, VY); g.lineTo(VX + VW / 2, VY + VH); g.moveTo(VX, VY + VH * 0.48); g.lineTo(VX + VW, VY + VH * 0.48); g.stroke();
    g.strokeStyle = "rgba(90,70,50,0.45)"; g.lineWidth = 1.3; g.strokeRect(VX + VW / 2 - 4.5, VY, 9, VH);
    g.fillStyle = "#fffdf8"; g.fillRect(VX - 12, VY - 12, VW + 24, 12); g.fillRect(VX - 12, VY + VH, VW + 24, 10); g.fillRect(VX - 12, VY, 12, VH); g.fillRect(VX + VW, VY, 12, VH);
    g.fillStyle = "#f2e8da"; g.fillRect(VX - 22, VY + VH + 8, VW + 44, 12);
    g.strokeStyle = "rgba(90,70,50,0.55)"; g.lineWidth = 1.6; g.strokeRect(VX - 12, VY - 12, VW + 24, VH + 22); g.strokeRect(VX - 22, VY + VH + 8, VW + 44, 12);
    // macetita en el alféizar
    g.save(); g.translate(VX + 190, VY + VH + 8);
    g.fillStyle = "#d9826a"; g.beginPath(); g.moveTo(-12, -16); g.lineTo(12, -16); g.lineTo(9, 0); g.lineTo(-9, 0); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.4; g.stroke();
    g.fillStyle = "#5f9a5c"; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(-8 + i * 4, -22 - 4 * Math.sin(i), 4, 8, -0.6 + i * 0.3, 0, TAU); g.fill(); }
    g.restore();
    // barra y visillos con su lazo
    g.strokeStyle = "#b08a5e"; g.lineWidth = 4; g.beginPath(); g.moveTo(VX - 50, VY - 26); g.lineTo(VX + VW + 50, VY - 26); g.stroke();
    g.fillStyle = "#b08a5e"; for (const x of [VX - 52, VX + VW + 52]) { g.beginPath(); g.arc(x, VY - 26, 6, 0, TAU); g.fill(); }
    for (const [x0, sg] of [[VX - 44, 1], [VX + VW + 44, -1]]) {
      g.save();
      g.beginPath(); g.moveTo(x0, VY - 26); g.lineTo(x0 + sg * 66, VY - 26);
      g.quadraticCurveTo(x0 + sg * 40, VY + 120, x0 + sg * 26, VY + 170);
      g.quadraticCurveTo(x0 + sg * 34, VY + 260, x0 + sg * 50, VY + VH + 40); g.lineTo(x0 - sg * 6, VY + VH + 40); g.closePath();
      g.fillStyle = "rgba(255,246,248,0.82)"; g.fill(); g.strokeStyle = "rgba(170,130,130,0.5)"; g.lineWidth = 1.3; g.stroke();
      g.clip();
      g.strokeStyle = "rgba(220,180,185,0.55)"; g.lineWidth = 2;
      for (let i = 0; i < 6; i++) { const x = x0 + sg * (6 + i * 11); g.beginPath(); g.moveTo(x, VY - 26); g.quadraticCurveTo(x - sg * 8, VY + 150, x + sg * (i * 3), VY + VH + 40); g.stroke(); }
      g.restore();
      g.fillStyle = "#e7a7b4"; g.beginPath(); g.ellipse(x0 + sg * 28, VY + 168, 12, 5, 0, 0, TAU); g.fill(); g.strokeStyle = "rgba(120,60,70,0.6)"; g.lineWidth = 1.2; g.stroke();
    }
    // balda con libros sin letras, una velita y una maceta colgante
    g.save(); g.translate(430, 176);
    g.fillStyle = "#e9dcc8"; g.fillRect(-6, 0, 168, 9); g.strokeStyle = "rgba(90,70,50,0.6)"; g.lineWidth = 1.4; g.strokeRect(-6, 0, 168, 9);
    const LIB = ["#7fa6b8", "#e1a17a", "#c8b46a", "#9c86b8", "#86b08a", "#d98f97"];
    let lx = 0;
    for (let i = 0; i < 6; i++) { const w = 11 + 5 * hash(i * 9), h = 44 + 16 * hash(i * 5 + 2);
      g.fillStyle = LIB[i]; g.fillRect(lx, -h, w, h); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.strokeRect(lx, -h, w, h);
      g.fillStyle = "rgba(255,255,255,0.45)"; g.fillRect(lx + 2, -h + 6, w - 4, 2.5); lx += w + 1; }
    g.save(); g.translate(lx + 6, 0); g.rotate(-0.28); g.fillStyle = "#b9a3c9"; g.fillRect(0, -48, 13, 48); g.strokeStyle = TINTA; g.strokeRect(0, -48, 13, 48); g.restore();
    g.fillStyle = "#f3efe6"; g.fillRect(118, -22, 16, 22); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.strokeRect(118, -22, 16, 22);
    g.fillStyle = "#ffcf6a"; g.beginPath(); g.ellipse(126, -28, 3, 5, 0, 0, TAU); g.fill();
    g.fillStyle = "#cf8f6a"; g.beginPath(); g.moveTo(140, -18); g.lineTo(158, -18); g.lineTo(155, 0); g.lineTo(143, 0); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#6aa267"; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(144 + i * 4, -24 - 3 * i % 2, 3.5, 7, -0.5 + i * 0.35, 0, TAU); g.fill(); }
    g.strokeStyle = "#6aa267"; g.lineWidth = 2; g.beginPath(); g.moveTo(150, 0); g.quadraticCurveTo(160, 30, 152, 58); g.stroke();
    for (let i = 0; i < 5; i++) { g.fillStyle = "#79b175"; g.beginPath(); g.ellipse(156 - i * 1.2, 12 + i * 10, 4, 2.4, 0.6, 0, TAU); g.fill(); }
    g.restore();
    // tocador con su espejo redondo (derecha)
    const EX = 880, EY = 236;
    g.save();
    g.fillStyle = "#d8b066"; g.beginPath(); g.arc(EX, EY, 88, 0, TAU); g.fill(); g.strokeStyle = "rgba(90,60,20,0.8)"; g.lineWidth = 2; g.stroke();
    const es = g.createLinearGradient(EX - 70, EY - 70, EX + 70, EY + 70); es.addColorStop(0, "#e7f1f2"); es.addColorStop(1, "#b9cdd2");
    g.fillStyle = es; g.beginPath(); g.arc(EX, EY, 76, 0, TAU); g.fill(); g.stroke();
    g.save(); g.beginPath(); g.arc(EX, EY, 76, 0, TAU); g.clip();
    g.fillStyle = "rgba(240,220,195,0.6)"; g.fillRect(EX - 80, EY + 30, 160, 60);
    g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.moveTo(EX - 60, EY - 80); g.lineTo(EX - 30, EY - 80); g.lineTo(EX - 90, EY + 30); g.lineTo(EX - 120, EY + 30); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(EX - 10, EY - 80); g.lineTo(EX + 2, EY - 80); g.lineTo(EX - 58, EY + 30); g.lineTo(EX - 70, EY + 30); g.closePath(); g.fill();
    g.restore(); g.restore();
    const TX = 776, TW = 210, TY = 360;
    g.fillStyle = "#fbf7f0"; g.fillRect(TX, TY, TW, 14); g.strokeStyle = "rgba(90,70,50,0.7)"; g.lineWidth = 1.6; g.strokeRect(TX, TY, TW, 14);
    g.fillStyle = "#f3ece0"; g.fillRect(TX + 10, TY + 14, TW - 20, 120); g.strokeRect(TX + 10, TY + 14, TW - 20, 120);
    for (let i = 0; i < 2; i++) { const y = TY + 24 + i * 56; g.strokeStyle = "rgba(90,70,50,0.6)"; g.strokeRect(TX + 22, y, TW - 44, 46);
      g.fillStyle = "#cfa25f"; g.beginPath(); g.arc(TX + TW / 2, y + 23, 4.5, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1; g.stroke(); }
    g.fillStyle = "#e8dfd1"; for (const x of [TX + 16, TX + TW - 26]) g.fillRect(x, TY + 134, 10, 40);
    // cosas encima: jarroncito con una flor, perfume, cepillo y un platito
    g.save(); g.translate(TX + 30, TY);
    g.fillStyle = "#a7cfd6"; g.beginPath(); g.ellipse(0, -12, 8, 12, 0, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.3; g.stroke();
    g.strokeStyle = "#5f8f5c"; g.lineWidth = 1.8; g.beginPath(); g.moveTo(0, -20); g.quadraticCurveTo(4, -40, 2, -52); g.stroke();
    g.fillStyle = "#f29bb0"; for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; g.beginPath(); g.ellipse(2 + Math.cos(a) * 5, -55 + Math.sin(a) * 5, 4, 3, a, 0, TAU); g.fill(); }
    g.fillStyle = "#ffd56b"; g.beginPath(); g.arc(2, -55, 3, 0, TAU); g.fill();
    g.restore();
    g.save(); g.translate(TX + 74, TY);
    g.fillStyle = "rgba(244,170,190,0.85)"; g.beginPath(); g.moveTo(-9, 0); g.lineTo(-9, -16); g.quadraticCurveTo(0, -24, 9, -16); g.lineTo(9, 0); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.3; g.stroke();
    g.fillStyle = "#d8b066"; g.fillRect(-3, -28, 6, 6); g.strokeRect(-3, -28, 6, 6);
    g.fillStyle = "rgba(255,255,255,0.6)"; g.fillRect(-6, -14, 2.5, 10);
    g.restore();
    g.save(); g.translate(TX + 130, TY - 4); g.rotate(-0.08);
    g.fillStyle = "#8a6a9c"; g.beginPath(); g.ellipse(0, 0, 18, 7, 0, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.3; g.stroke();
    g.fillRect(16, -2.5, 26, 5); g.strokeRect(16, -2.5, 26, 5);
    g.restore();
    g.fillStyle = "#f0d9c4"; g.beginPath(); g.ellipse(TX + 178, TY - 3, 14, 4, 0, 0, TAU); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.2; g.stroke();
    // planta grande (izquierda del todo)
    g.save(); g.translate(30, 530);
    g.fillStyle = "#c9a57a"; g.beginPath(); g.moveTo(-30, -60); g.lineTo(30, -60); g.lineTo(24, 0); g.lineTo(-24, 0); g.closePath(); g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.stroke();
    g.strokeStyle = "rgba(120,80,40,0.5)"; g.lineWidth = 1; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-28 + i * 1.2, -48 + i * 10); g.lineTo(28 - i * 1.2, -48 + i * 10); g.stroke(); }
    const hoja = (x, y, a, L) => { g.save(); g.translate(x, y); g.rotate(a);
      g.fillStyle = "#4f8f55"; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(L * 0.5, -L * 0.35, L, 0); g.quadraticCurveTo(L * 0.5, L * 0.35, 0, 0); g.fill();
      g.strokeStyle = "#2f5f36"; g.lineWidth = 1.3; g.stroke(); g.beginPath(); g.moveTo(2, 0); g.lineTo(L * 0.9, 0); g.stroke(); g.restore(); };
    g.strokeStyle = "#3f7046"; g.lineWidth = 2.4;
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.28, L = 120 + 40 * hash(i * 3);
      const x = Math.cos(a) * L * 0.8, y = -60 + Math.sin(a) * L * 0.8;
      g.beginPath(); g.moveTo(0, -60); g.quadraticCurveTo(x * 0.4, y * 0.6 - 20, x, y); g.stroke(); hoja(x, y, a + (i - 4) * 0.08, 46 + 10 * hash(i)); }
    g.restore();
    // rayos de sol que entran por la ventana y la mancha de luz en el suelo
    g.save(); g.globalCompositeOperation = "screen";
    const rayo = (x0, x1, x2, x3, al) => { g.beginPath(); g.moveTo(x0, VY + 10); g.lineTo(x1, VY + 10); g.lineTo(x3, 560); g.lineTo(x2, 560); g.closePath();
      const gr = g.createLinearGradient(0, VY, 0, 560); gr.addColorStop(0, `rgba(255,236,190,${al})`); gr.addColorStop(1, "rgba(255,236,190,0)"); g.fillStyle = gr; g.fill(); };
    rayo(VX + 20, VX + 80, VX + 200, VX + 320, 0.28); rayo(VX + 120, VX + 170, VX + 330, VX + 430, 0.22); rayo(VX + 190, VX + 230, VX + 420, VX + 500, 0.16);
    g.restore();
    g.fillStyle = "rgba(255,238,200,0.35)"; g.beginPath(); g.moveTo(250, 556); g.lineTo(560, 556); g.lineTo(600, 590); g.lineTo(230, 590); g.closePath(); g.fill();
    // alfombra redonda
    g.save(); g.translate(518, 574);
    g.fillStyle = "#c9d8c2"; g.beginPath(); g.ellipse(0, 0, 300, 26, 0, 0, TAU); g.fill();
    g.strokeStyle = "#e9a9b2"; g.lineWidth = 5; g.beginPath(); g.ellipse(0, 0, 268, 20, 0, 0, TAU); g.stroke();
    g.strokeStyle = "#f6efe2"; g.lineWidth = 3; g.beginPath(); g.ellipse(0, 0, 230, 16, 0, 0, TAU); g.stroke();
    g.strokeStyle = "rgba(80,90,70,0.6)"; g.lineWidth = 1.4; g.beginPath(); g.ellipse(0, 0, 300, 26, 0, 0, TAU); g.stroke();
    g.restore();
    return c;
  }
  // sombras en el suelo
  function sombras(g, P) {
    g.save(); g.fillStyle = "rgba(70,50,30,0.25)";
    g.beginPath(); g.ellipse(P.g.x + 4, SUELO + 4, 60, 7, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(P.m.x - 2, SUELO + 4, 52, 7, 0, 0, TAU); g.fill();
    g.restore();
  }
  // luz cálida de mañana
  function luces(g) {
    g.save(); g.globalCompositeOperation = "multiply";
    const v = g.createRadialGradient(420, 260, 260, 512, 300, 720); v.addColorStop(0, "rgb(255,255,255)"); v.addColorStop(1, "rgb(188,160,140)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    g.restore();
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  function corazon(g, x, y, s, col) {
    g.save(); g.translate(x, y); g.scale(s, s);
    g.beginPath(); g.moveTo(0, 4); g.bezierCurveTo(-7, -1, -6, -8, 0, -4); g.bezierCurveTo(6, -8, 7, -1, 0, 4); g.closePath();
    g.fillStyle = col; g.fill(); g.strokeStyle = TINTA; g.lineWidth = 1.1 / s * 0.9; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(-2.6, -3.6, 1.3, 0.9, -0.5, 0, TAU); g.fill();
    g.restore();
  }
  function corazones(g, t, P) {
    if (t < T.gEmbobado || t > T.gSenala0 + 0.8) return;
    const c = enCab(G, P.g, P2(860, 300));
    for (let i = 0; i < 5; i++) {
      const t0 = T.gEmbobado + 0.1 + i * 0.26, k = fase(t, t0, t0 + 1.2); if (k <= 0 || k >= 1) continue;
      const x = c.x + 10 + i * 6 + 9 * Math.sin(k * 6 + i), y = c.y - 10 - 70 * k;
      g.save(); g.globalAlpha = Math.sin(Math.PI * k); corazon(g, x, y, 1.1 + 0.4 * Math.sin(k * 9 + i) * 0.3 + 0.3 * k, i % 2 ? "#ff6f91" : "#ff9ab2"); g.restore();
    }
  }
  function destello(g, x, y, r, a = 0) {
    g.save(); g.translate(x, y); g.rotate(a);
    g.fillStyle = "#fffbe6"; g.strokeStyle = "rgba(200,150,40,0.9)"; g.lineWidth = 0.9;
    g.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.28 : r, aa = i / 8 * TAU; g.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  function brillosPelo(g, t, P) {
    const k0 = fase(t, T.suelta + 0.15, T.sacude1 + 0.3); if (k0 <= 0 || k0 >= 1) return;
    const pts = [P2(520, 300), P2(470, 470), P2(450, 620), P2(560, 560), P2(600, 250)];
    pts.forEach((q, i) => {
      const k = fase(t, T.suelta + 0.15 + i * 0.2, T.suelta + 0.75 + i * 0.2); if (k <= 0 || k >= 1) return;
      const c = enCab(M, P.m, q);
      g.save(); g.globalAlpha = Math.sin(Math.PI * k); destello(g, c.x, c.y, 4 + 4 * Math.sin(Math.PI * k), k * 1.5); g.restore();
    });
  }
  // ¡clac! de la pinza
  function clac(g, t, P) {
    const k = fase(t, T.clac - 0.02, T.clac + 0.32); if (k <= 0 || k >= 1) return;
    const c = enCab(G, P.g, P2(PELO_G.GP.x, PELO_G.GP.y - 6));
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 2.2; g.lineCap = "round"; g.globalAlpha = clamp(k * 8) * (1 - k);
    for (let i = 0; i < 6; i++) { const a = -Math.PI * 0.95 + i * Math.PI * 0.9 / 5, r = 15 + 14 * salida(k), L = 9 * (1 - 0.5 * k);
      g.beginPath(); g.moveTo(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r); g.lineTo(c.x + Math.cos(a) * (r + L), c.y + Math.sin(a) * (r + L)); g.stroke(); }
    g.restore();
  }
  // ¡boing! al quitar la pinza del pincho
  function boing(g, t, P) {
    const k = fase(t, T.gQuita, T.gQuita + 0.45); if (k <= 0 || k >= 1) return;
    const c = enCab(G, P.g, P2(960, 300));
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 1.8; g.lineCap = "round"; g.globalAlpha = 1 - k;
    for (let i = 0; i < 3; i++) { const r = 8 + i * 6 + 10 * k; g.beginPath(); g.arc(c.x, c.y, r, -Math.PI * 0.45, Math.PI * 0.05); g.stroke(); }
    g.restore();
  }
  // risa de Marta: lagrimitas y rayitas de temblor
  function risa(g, t, P) {
    const k = campana(t, T.mRisa0 + 0.05, T.mRisa1); if (k <= 0) return;
    const c = enCab(M, P.m, P2(820, 330));
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 1.8; g.lineCap = "round"; g.globalAlpha = k;
    for (let i = 0; i < 3; i++) { const a = -Math.PI * 0.35 - i * 0.32, w = Math.sin((t - T.mRisa0) * 13 + i) * 2;
      g.beginPath(); g.moveTo(c.x + 30 * Math.cos(a) + w, c.y + 30 * Math.sin(a)); g.lineTo(c.x + 40 * Math.cos(a) + w, c.y + 40 * Math.sin(a)); g.stroke(); }
    g.restore();
  }
  // la «foto»: destello blanco suave y chispa entre los dedos
  // el «flash» de la foto: un resplandor que sale del marco de los dedos
  function flash(g, t, P) {
    const k = tramo(t, T.flash - 0.12, T.flash) * (1 - tramo(t, T.flash + 0.02, T.flash + 0.5, suave5)); if (k <= 0.005) return;
    const a = M.aPantalla(P.m, P.m.manoCerca), b = M.aPantalla(P.m, P.m.manoLejos), c = mezcla(a, b, 0.5), r = 30 + 90 * k;
    g.save();
    const gr = g.createRadialGradient(c.x, c.y, 2, c.x, c.y, r); gr.addColorStop(0, `rgba(255,255,255,${0.9 * k})`); gr.addColorStop(0.35, `rgba(255,252,236,${0.45 * k})`); gr.addColorStop(1, "rgba(255,252,236,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(c.x, c.y, r, 0, TAU); g.fill();
    g.restore();
  }
  function chispaFoto(g, t, P) {
    const k = fase(t, T.flash - 0.04, T.flash + 0.4); if (k <= 0 || k >= 1) return;
    const a = M.aPantalla(P.m, P.m.manoCerca), b = M.aPantalla(P.m, P.m.manoLejos), c = mezcla(a, b, 0.5);
    g.save(); g.globalAlpha = Math.sin(Math.PI * k); destello(g, c.x, c.y, 8 + 10 * Math.sin(Math.PI * k), k * 2); g.restore();
  }
  // vaivén de las hojas de la palmera: rayitas
  function vaiven(g, t, P) {
    const k = campana(t, T.clac + 0.05, T.clac + 0.7) + 0.7 * campana(t, T.gBota, T.gBota + 0.5); if (k <= 0) return;
    const c = enCab(G, P.g, P2(PELO_G.GP.x, PELO_G.GP.y - 120));
    g.save(); g.strokeStyle = TINTA; g.lineWidth = 1.6; g.lineCap = "round"; g.globalAlpha = 0.8 * k;
    for (const s of [-1, 1]) { g.beginPath(); g.arc(c.x, c.y + 6, 30, Math.PI * (s < 0 ? 1.08 : 1.72), Math.PI * (s < 0 ? 1.28 : 1.92)); g.stroke(); }
    g.restore();
  }
  // la goma: de la muñeca al moño
  function goma(g, t, P) {
    const p = P.m, cMono = enCab(M, p, P2(MONO_M.x + 4, MONO_M.y + 34)), A = afCab(M, p);
    const sMono = 1 / kRet(A) * 40;                      // tamaño del moño en pantalla
    if (t >= T.mGoma) {
      const k = tramo(t, T.mGoma, T.mGoma + 0.22);
      const m = manoPant(M, p, "cerca"), w = mezcla(m.h, m.e, 0.45), aw = Math.atan2(m.e.y - m.h.y, m.e.x - m.h.x);
      const c = t < T.mGoma + 0.22 ? mezcla(w, cMono, k) : cMono;
      g.save(); g.translate(c.x, c.y); g.rotate(lerp(aw, 0.3, k)); dibGoma(g, lerp(2.4, sMono * 0.92, k), lerp(3.6, sMono * 0.36, k)); g.restore();
      return;
    }
    if (!p.gomaMuneca) return;
    const m = manoPant(M, p, "cerca"), w = mezcla(m.h, m.e, 0.45), a = Math.atan2(m.e.y - m.h.y, m.e.x - m.h.x);
    g.save(); g.translate(w.x, w.y); g.rotate(a); dibGoma(g, 2.4, 3.6); g.restore();
  }
  function camara(t) {
    const z1 = tramo(t, 0.7, 1.3) * (1 - tramo(t, 2.5, 3.2));
    const z2 = tramo(t, T.gSube0 + 0.2, T.gEngancha + 0.25) * (1 - tramo(t, T.gOrgullo0, T.gOrgullo1 + 0.3));
    return { k: 1 + 0.12 * z1 + 0.13 * z2, x: 512 + 96 * z1 - 90 * z2, y: 300 - 60 * z1 - 70 * z2 };
  }

  /* =====================================================================================
   * ESCENA
   * ===================================================================================== */
  function poses(t) { return { g: poseG(t), m: poseM(t) }; }
  class Pinza extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !M.listo()) return;
      if (!fondo) fondo = creaFondo();
      const luz = tramo(t, NEGRO_INICIO, 0.8) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      MATRIZ = g.getTransform();
      const P = poses(t);
      g.drawImage(fondo, -60, -60);
      sombras(g, P);
      // la melena larga de Marta, por detrás de todo su cuerpo
      { const A = afCab(M, P.m); g.save(); aplica(g, A); melenaDetras(g, t, caidaM(t), giroM(t)); g.restore(); }
      G.dibujar(g, P.g, t);
      M.dibujar(g, P.m, t);
      for (const q of [P.g, P.m]) if (q.pinzaAF) { g.save(); aplica(g, q.pinzaAF); dibPinza(g, q.pinzaAbre || 0); g.restore(); }
      goma(g, t, P);
      corazones(g, t, P); brillosPelo(g, t, P); clac(g, t, P); boing(g, t, P); vaiven(g, t, P); risa(g, t, P);
      flash(g, t, P); chispaFoto(g, t, P);
      g.restore();
      luces(g);
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00094", nombre: "Guillermo y Marta · La pinza del pelo", crear: () => new Pinza() });
  window.__A2D_00094 = { pose: poses, poses, T, DUR, afCab, enCab, codo, G, M, PELO: PELO_G };
})();
