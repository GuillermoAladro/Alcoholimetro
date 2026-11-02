"use strict";
/* 00072 · Guillermo y Gabacho · El cruasán
 *
 * Negro → terraza de un café por la mañana: fachada color crema con toldo de rayas verdes, escaparate
 * con la barra y la cafetera dentro, macetas de geranios, farol, pizarra con dibujos de taza y cruasán
 * (sin letras) y luz de sol que entra en diagonal. Guillermo y Gabacho, sentados en sillas de mimbre a
 * los lados de una mesita de mármol: cada uno con su café humeante y su cruasán en un platito, y en
 * medio una cestita con más cruasanes y un jarroncito con una flor.
 *
 * Gabacho coge su cruasán con el meñique en alto, lo mira con amor, lo moja un instante en el café
 * (sale con la punta oscura, gotea) y le da un mordisco con los ojos cerrados, en la gloria: migas y
 * corazoncitos → Guillermo, impresionado, le imita: meñique en alto, mirada de «mira esto», lo moja… y
 * lo deja dentro mirando a cámara muy chulo mientras suben burbujitas; Gabacho se alarma y levanta la
 * mano → Guillermo lo saca: está empapado, se dobla, cuelga, se estira… y la punta se rompe y cae en
 * la taza: ¡plof!, corona de café y gotas que le salpican la cara (las manchas se quedan, una gotea) →
 * mirada seria a cámara; deja el muñón en el plato, mete los dedos en la taza para pescar el trozo y
 * se quema: ¡ay!, mano temblando, vapor; se sopla los dedos con los mofletes hinchados → Gabacho, con
 * una pequeña reverencia, coge un cruasán nuevo de la cesta y se lo ofrece → Guillermo lo coge, lo
 * mira, mira la taza con desconfianza, mira a cámara… y se lo mete en la boca tal cual, en seco: un
 * bocado enorme, los dos mofletes llenos, masticando muy digno; Gabacho se ríe → negro.
 *
 * Sin textos. Los cruasanes se dibujan en coordenadas de pantalla (lóbulos a lo largo de una espina
 * curvada; la parte empapada se oscurece y cuelga por su peso); el que va en una mano se pinta dentro
 * de la mano (debajo de los dedos) con la transformación de la cámara. El frente de las tazas se vuelve
 * a pintar encima de los personajes para que lo que entra en el café quede dentro. Todo depende de `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, suave5, salida, entrada, tramo, mezcla, ruido, hash, campana } = M2;
  const G = Guillermo, B = Gabacho;
  const DUR = 14.5;
  const TINTA = "#0b0a0e";

  /* ---------- guion (s) ---------- */
  const T = {
    // Gabacho
    bAlcanza: 0.75, bCoge: 1.15, bAdmira: 1.45, bBaja: 1.75, bDentro: 1.95, bSaca: 2.2, bBoca: 2.5, bMuerde: 2.9,
    bDeja: 3.95, bDejado: 4.4,
    // Guillermo imita
    gImpres: 3.0, gAlcanza: 3.6, gCoge: 3.95, gReto: 4.3, gBaja: 4.65, gDentro: 4.95, gCamara: 5.15,
    bDuda: 5.55, bAlto: 5.85, gSaca: 6.55, gFuera: 6.72, gHoriz: 6.92, gMira: 6.8, estira: 7.04, rompe: 7.2, plof: 7.43,
    salpica: 7.56, gSerio: 7.85, gDejaMunon: 8.3, gSuelta: 8.6, gPesca: 8.72, gMete: 8.95, quema: 9.07, gSopla: 9.38, gSoplaFin: 10.12,
    // Gabacho ofrece
    bCesta: 9.62, bCogeN: 9.95, bOfrece: 10.18, gToma: 10.55, entrega: 10.96, bVuelve: 11.05,
    // final
    gMiraN: 11.3, gTaza: 11.65, gCam2: 12.0, gZampa: 12.35, gBocado: 12.62, bRie: 12.7, fin: 13.75
  };

  const mezclaE = (a, b, k) => { const o = {}; for (const n in a) o[n] = lerp(a[n], b[n], k); return o; };
  const guion = (lista, dic, base, t) => {
    let c = dic[base];
    for (const [t0, t1, nom, f] of lista) { if (t <= t0) break; c = mezclaE(c, dic[nom], (f || suave)(fase(t, t0, t1))); }
    return Object.assign({}, c);
  };
  const dentro = (t, a0, a1, b0, b1) => tramo(t, a0, a1) * (1 - tramo(t, b0, b1));
  const lerpAng = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
  const DED = ["pulgar", "indice", "medio", "anular", "menique"];
  const mezclaD = (a, b, k) => { const o = {}; for (const n of DED) o[n] = lerp(a[n] ?? 0, b[n] ?? 0, k); return o; };
  const D = (pu, i, m, a, me) => ({ pulgar: pu, indice: i, medio: m ?? i, anular: a ?? i, menique: me ?? i });
  const ABIERTA = D(1, 1), RELAJADA = D(0.55, 0.6, 0.55, 0.5, 0.45), MUSLO = D(0.7, 0.82, 0.78, 0.74, 0.7),
    MESA_D = D(0.6, 0.7, 0.66, 0.62, 0.58), PINZA = D(0.38, 0.3, 0.16, 0.14, 0.14), MENIQUE = D(0, 0.12, 0.1, 0.12, 0.8),   // pulgar recogido: el meñique solo, un poco curvado (sin «cuernos»)
    
    AGARRA = D(0.3, 0.14, 0.12, 0.12, 0.12), PESCA = D(0.15, 1, 1, 0.08, 0.06), SOPLA = D(0.35, 1, 0.95, 0.35, 0.3),
    ABRE = D(0.85, 0.9, 0.9, 0.85, 0.8);

  /* ---------- caras (mismos campos para los dos) ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, abre: 0, ancho: 1, sonr: 0.15,
    dientes: 1, lengua: 0, esp: 0, mof: 0, wd: 0, wi: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, parp) + e.wd), i: clamp(Math.max(e.c, parp) + e.wi), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: 0, abre: e.abre, ancho: e.ancho, sonrisa: e.sonr, dientes: e.dientes > 0.5, lengua: e.lengua },
      mofletes: e.mof, rubor: 0, bigote: 0 };
  }
  const parpadeo = (t, lista) => { let o = 0; for (const tb of lista) { const k = fase(t, tb, tb + 0.15); if (k > 0 && k < 1) o = Math.max(o, Math.sin(Math.PI * k)); } return o; };

  /* =====================================================================================
   * DISPOSICIÓN (px de pantalla)
   * ===================================================================================== */
  const S = 0.33, SUELO = 574;
  const XG = 336, XB = 688;                       // pelvis de cada uno
  const ASIENTO = 128, Y_ASIENTO = SUELO - ASIENTO, Y_PELVIS = Y_ASIENTO - 20;
  const MESA = { x: 512, y: 366, rx: 122, ry: 15, canto: 8 };
  const TAZA_G = { x: 466, y: 371, asa: -1 }, TAZA_B = { x: 558, y: 371, asa: 1 };
  const PLATO_G = { x: 424, y: 374 }, PLATO_B = { x: 601, y: 374 };
  const CESTA = { x: 518, y: 365 }, JARRON = { x: 487, y: 357 };
  const SUP = c => ({ x: c.x, y: c.y - 24.4 });  // superficie del café (centro)

  /* =====================================================================================
   * CRUASANES: espina curvada + 7 lóbulos (pantalla)
   * c = { x, y (agarre, en un cuerno), ang (hacia la otra punta), cv (±1: lado de la curva), L,
   *       mord (largo comido desde la punta), moja (fracción empapada desde la punta), cae (0…1: lo
   *       empapado cuelga), estira (px: el cuello se estira antes de romper), corta (sin los 3 últimos) }
   * ===================================================================================== */
  const LC = 56, NL = 7, KC = 0.0115;
  const hwCr = u => 3.4 + 8.3 * Math.pow(Math.sin(Math.PI * clamp(u, 0.02, 0.98)), 0.85);
  const hex3 = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const COL = { claro: hex3("#f3be62"), medio: hex3("#e2973a"), tostado: hex3("#b8651f"), cafe: hex3("#5b2f13"), cafeOsc: hex3("#3c1c0a") };
  const mezC = (a, b, k) => [0, 1, 2].map(i => lerp(a[i], b[i], k));
  const css = (c, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
  function espina(c) {
    const L = c.L || LC, est = c.estira || 0, Lmax = L + est, s0 = L * (1 - (c.moja || 0)), cae = c.cae || 0;
    const pts = [{ x: c.x, y: c.y, a: c.ang }];
    let x = c.x, y = c.y;
    const n = Math.ceil(Lmax);
    for (let i = 0; i < n; i++) {
      const s = i + 0.5, sb = Math.min(s, L);
      let a = c.ang + (c.cv || 1) * KC * (sb - L / 2);
      if (cae > 0 && s > s0) { const w = suave((s - s0) / Math.max(4, Lmax - s0)); a += cae * w * Math.atan2(Math.sin(Math.PI / 2 - a), Math.cos(Math.PI / 2 - a)) * 0.92; }
      x += Math.cos(a); y += Math.sin(a);
      pts.push({ x, y, a });
    }
    return pts;
  }
  const enS = (pts, s) => { const i = clamp(Math.round(s), 0, pts.length - 1); return pts[i]; };
  // geometría de un cruasán: espina, largo, cuello (donde se rompe) y anchura en cada punto de la espina
  const S_ROTO = 4 / NL;                          // fracción del largo donde se rompe el empapado
  function geo(c) {
    const L = c.L || LC, est = c.estira || 0, sb = S_ROTO * L, s0 = L * (1 - (c.moja || 0));
    const orig = s => (s <= sb ? s : s >= sb + est ? s - est : sb);
    return { pts: espina(c), L, est, sb, s0e: s0 <= sb ? s0 : s0 + est, moja: c.moja || 0, hw: s => hwCr(orig(s) / L), orig };
  }
  // silueta del tramo [sA, sB] de la espina; tapas redondas en los extremos
  function rutaTramo(g, G, sA, sB) {
    const izq = [], der = [], paso = 1.5;
    for (let s = sA; ; s += paso) {
      const ss = Math.min(s, sB), P = enS(G.pts, ss), h = G.hw(ss), nx = -Math.sin(P.a), ny = Math.cos(P.a);
      izq.push({ x: P.x + nx * h, y: P.y + ny * h }); der.push({ x: P.x - nx * h, y: P.y - ny * h });
      if (ss >= sB) break;
    }
    const tapa = (P, h, a0) => { for (let k = 1; k < 6; k++) { const an = a0 + Math.PI * k / 6; out.push({ x: P.x + Math.cos(an) * h * 0.9, y: P.y + Math.sin(an) * h }); } };
    const out = [];
    for (const q of izq) out.push(q);
    const PB = enS(G.pts, sB); tapa(PB, G.hw(sB) * 0.55, PB.a + Math.PI / 2 - Math.PI);
    for (let i = der.length - 1; i >= 0; i--) out.push(der[i]);
    const PA = enS(G.pts, sA); tapa(PA, G.hw(sA) * 0.55, PA.a - Math.PI / 2 - Math.PI);
    g.beginPath(); M2.curva(g, out, true, 0.35);
  }
  // pinta un tramo: color, sombra, surcos de las capas, brillos, empapado y contorno
  function dibTramo(g, G, sA, sB) {
    const L = G.L;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    rutaTramo(g, G, sA, sB); g.fillStyle = css(COL.medio); g.fill();
    g.save(); rutaTramo(g, G, sA, sB); g.clip();
    // puntas más tostadas
    for (const [u0, u1] of [[0, 0.17], [0.83, 1.01]]) {
      const a = Math.max(sA, u0 * L + (u0 > S_ROTO ? G.est : 0)), b = Math.min(sB, u1 * L + (u1 > S_ROTO ? G.est : 0));
      if (b > a + 0.5) { rutaTramo(g, G, a, b); g.fillStyle = css(COL.tostado, 0.7); g.fill(); }
    }
    // sombra en la mitad de abajo (la que mira al suelo)
    g.fillStyle = css(COL.tostado, 0.55); g.beginPath();
    let pr = true;
    for (let s = sA; s <= sB + 0.01; s += 2) { const P = enS(G.pts, s), h = G.hw(s), nx = -Math.sin(P.a), ny = Math.cos(P.a), sg = ny >= 0 ? 1 : -1;
      const x = P.x + nx * sg * h * 0.2, y = P.y + ny * sg * h * 0.2; if (pr) { g.moveTo(x, y); pr = false; } else g.lineTo(x, y); }
    for (let s = sB; s >= sA - 0.01; s -= 2) { const P = enS(G.pts, s), h = G.hw(s), nx = -Math.sin(P.a), ny = Math.cos(P.a), sg = ny >= 0 ? 1 : -1; g.lineTo(P.x + nx * sg * h * 1.3, P.y + ny * sg * h * 1.3); }
    g.closePath(); g.fill();
    // brillos de cada capa (en el lado de arriba) y surcos entre capas
    for (let k = 0; k < NL; k++) {
      const u0 = k / NL, u1 = (k + 1) / NL, e0 = u0 * L + (u0 >= S_ROTO - 1e-6 && k >= 4 ? G.est : 0), e1 = u1 * L + (k + 1 > 4 ? G.est : 0);
      const a = Math.max(sA, e0 + 1.6), b = Math.min(sB, e1 - 1.6);
      if (b > a + 0.8) {
        g.strokeStyle = css(COL.claro, 0.95); g.lineWidth = 2.2; g.beginPath();
        for (let s = a, i = 0; s <= b + 0.01; s += 1, i++) { const P = enS(G.pts, s), h = G.hw(s), nx = -Math.sin(P.a), ny = Math.cos(P.a), sg = ny >= 0 ? -1 : 1, f = Math.sin(Math.PI * (s - a) / Math.max(1, b - a));
          const x = P.x + nx * sg * h * (0.35 + 0.25 * f), y = P.y + ny * sg * h * (0.35 + 0.25 * f); if (i) g.lineTo(x, y); else g.moveTo(x, y); }
        g.stroke();
      }
      if (k > 0 && e0 > sA + 0.5 && e0 < sB - 0.5) {
        const P = enS(G.pts, e0), h = G.hw(e0) * 1.05, nx = -Math.sin(P.a), ny = Math.cos(P.a);
        // el surco se curva hacia la punta más cercana
        const hacia = u0 < 0.5 ? -1 : 1, Q = enS(G.pts, e0 + hacia * 3.2);
        g.strokeStyle = "#7a3d10"; g.lineWidth = 1.7; g.beginPath(); g.moveTo(P.x + nx * h, P.y + ny * h); g.quadraticCurveTo(Q.x, Q.y, P.x - nx * h, P.y - ny * h); g.stroke();
      }
    }
    // lo empapado de café: más oscuro y brillante
    if (G.moja > 0 && G.s0e < sB) {
      const a = Math.max(sA, G.s0e);
      rutaTramo(g, G, a, sB); g.fillStyle = css(COL.cafe, 0.8); g.fill();
      if (a > sA + 0.5) { const P = enS(G.pts, a), h = G.hw(a), nx = -Math.sin(P.a), ny = Math.cos(P.a);
        g.strokeStyle = css(COL.cafe, 0.6); g.lineWidth = 2.2; g.beginPath(); g.moveTo(P.x + nx * h, P.y + ny * h); g.quadraticCurveTo(P.x - Math.cos(P.a) * 2.5, P.y - Math.sin(P.a) * 2.5, P.x - nx * h, P.y - ny * h); g.stroke(); }
      g.strokeStyle = "rgba(255,238,215,0.55)"; g.lineWidth = 1.4;
      for (let s = a + 3; s < sB - 2; s += 7) { const P = enS(G.pts, s), h = G.hw(s), nx = -Math.sin(P.a), ny = Math.cos(P.a), sg = ny >= 0 ? -1 : 1;
        g.beginPath(); g.ellipse(P.x + nx * sg * h * 0.5, P.y + ny * sg * h * 0.5, 2.6, 1, P.a, 0, Math.PI * 2); g.stroke(); }
    }
    g.restore();
    rutaTramo(g, G, sA, sB); g.lineWidth = 1.8; g.strokeStyle = "#4a2208"; g.stroke();
    g.restore();
  }
  // cara del mordisco (miga clara con alveolos) o del desgarro (empapado)
  function caraCorte(g, G, s, roto, hacia) {
    const P = enS(G.pts, s - hacia * 0.8), hw = G.hw(s) * 0.82;
    g.save(); g.translate(P.x, P.y); g.rotate(P.a + (hacia < 0 ? Math.PI : 0));
    if (roto) {
      g.fillStyle = css(COL.cafeOsc); g.beginPath(); g.ellipse(0, 0, 3.2, hw, 0, 0, Math.PI * 2); g.fill();
      g.lineWidth = 1.2; g.strokeStyle = "#2a1205"; g.stroke();
    } else {
      g.fillStyle = "#f8e5b6"; g.beginPath(); g.ellipse(0, 0, 3.2, hw, 0, 0, Math.PI * 2); g.fill();
      g.lineWidth = 1.3; g.strokeStyle = "#4a2208"; g.stroke();
      g.fillStyle = "#d7a865"; for (const [yy, r] of [[-hw * 0.45, 0.9], [hw * 0.1, 1.1], [hw * 0.5, 0.8]]) { g.beginPath(); g.arc(0.3, yy, r, 0, Math.PI * 2); g.fill(); }
      g.strokeStyle = "#4a2208"; g.lineWidth = 1.2;
      for (const yy of [-hw * 0.55, 0, hw * 0.55]) { g.beginPath(); g.arc(2.8, yy, 2.3, Math.PI * 0.6, Math.PI * 1.4); g.stroke(); }
    }
    g.restore();
  }
  function dibCroissant(g, c) {
    const Gm = geo(c), L = Gm.L, est = Gm.est, sb = Gm.sb, mord = c.mord || 0;
    if (c.corta) { dibTramo(g, Gm, 0, sb); caraCorte(g, Gm, sb, true, 1); colgajos(g, Gm, sb); return; }
    if (est > 0.3) {
      dibTramo(g, Gm, sb + est, L + est);
      // hilos de masa empapada que se estiran antes de romperse
      const A = enS(Gm.pts, sb), Bp = enS(Gm.pts, sb + est), h = Gm.hw(sb - 1);
      g.save(); g.strokeStyle = css(COL.cafe); g.lineCap = "round";
      for (const k of [-0.5, 0.05, 0.45]) {
        const na = { x: -Math.sin(A.a) * h * k, y: Math.cos(A.a) * h * k }, nb = { x: -Math.sin(Bp.a) * h * k, y: Math.cos(Bp.a) * h * k };
        g.lineWidth = Math.max(1, 3.6 - est * 0.36);
        g.beginPath(); g.moveTo(A.x + na.x, A.y + na.y); g.quadraticCurveTo((A.x + Bp.x) / 2 + (na.x + nb.x) * 0.2, (A.y + Bp.y) / 2 + (na.y + nb.y) * 0.2 + 2, Bp.x + nb.x, Bp.y + nb.y); g.stroke();
      }
      g.restore();
      dibTramo(g, Gm, 0, sb);
      return;
    }
    dibTramo(g, Gm, 0, L - mord);
    if (mord > 0) caraCorte(g, Gm, L - mord, false, 1);
  }
  // hebras empapadas que cuelgan del muñón
  function colgajos(g, Gm, sb) {
    const P = enS(Gm.pts, sb), h = Gm.hw(sb) * 0.7;
    g.save(); g.strokeStyle = css(COL.cafe); g.lineCap = "round"; g.lineWidth = 1.6;
    for (const k of [-0.6, 0.1, 0.55]) { const x = P.x - Math.sin(P.a) * h * k, y = P.y + Math.cos(P.a) * h * k;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 1.5, y + 4, x + 0.5, y + 6 + 3 * Math.abs(k)); g.stroke(); }
    g.restore();
  }
  const puntaCr = c => { const pts = espina(c); return pts[Math.min(pts.length - 1, Math.round((c.L || LC) + (c.estira || 0) - (c.mord || 0)))]; };

  /* ---------- cruasanes quietos: en los platos y en la cesta ---------- */
  const CR_PLATO_G = { x: PLATO_G.x - 27.5, y: PLATO_G.y - 10, ang: 0, cv: 1 };
  const CR_PLATO_B = { x: PLATO_B.x + 27.5, y: PLATO_B.y - 10, ang: Math.PI, cv: -1 };
  // el de delante de la cesta (el que coge Gabacho): agarre en su cuerno derecho
  const CR_CESTA = { x: CESTA.x + 25, y: CESTA.y - 24, ang: Math.PI - 0.16, cv: -1 };
  const CR_CESTA_ATRAS = [{ x: CESTA.x - 30, y: CESTA.y - 21, ang: -0.22, cv: 1 }, { x: CESTA.x - 2, y: CESTA.y - 27, ang: 0.3, cv: 1, L: 52 }];

  /* =====================================================================================
   * PISTAS DE MANOS (pantalla): [t0, t1, objetivo] con objetivo {x, y, mu, d} o función (t, p) → {…}
   * mu = hacia el codo, en ángulo de pantalla
   * ===================================================================================== */
  const evalua = (o, t, ctx) => (typeof o === "function" ? o(t, ctx) : o);
  const mezclaM = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), mu: lerpAng(a.mu, b.mu, k), d: mezclaD(a.d, b.d, k) });
  function pista(lista, t, ctx) {
    let c = evalua(lista[0][2], t, ctx);
    for (let i = 1; i < lista.length; i++) {
      const [t0, t1, obj, f] = lista[i]; if (t <= t0) break;
      c = mezclaM(c, evalua(obj, t, ctx), (f || suave)(fase(t, t0, t1)));
    }
    return c;
  }
  // pista de valores numéricos (ángulos del cruasán, etc.)
  function pistaN(lista, t, ang) {
    let v = lista[0][2];
    for (let i = 1; i < lista.length; i++) { const [t0, t1, obj, f] = lista[i]; if (t <= t0) break; const k = (f || suave)(fase(t, t0, t1)); v = ang ? lerpAng(v, obj, k) : lerp(v, obj, k); }
    return v;
  }

  /* ---------- puntos de pantalla de cada uno ---------- */
  const enPant = (rig, p, q) => rig.aPantalla(p, q);
  const bocaPant = (rig, p) => rig.aPantalla(p, rig.boca(p));
  function manoRig(rig, p, m, dobla, objeto) {
    const h = rig.aHoja(p, m);
    return { x: h.x, y: h.y, ang: 0, mu: p.espejo ? Math.PI - m.mu : m.mu, puno: 1, dedos: m.d, dobla, objeto };
  }

  /* =====================================================================================
   * GABACHO (derecha, mira a la izquierda)
   * ===================================================================================== */
  const PEL_B = B.SUELO + (Y_PELVIS - SUELO) / (S * B.K) - B.PELVIS.y;
  const TOB_B = B.SUELO - B.TOBILLO_ALTO;
  const CARAS_B = {
    inicio: E({ mx: 0.45, my: 0.55, c: 0.35, sd: 6, gd: 0.02, si: 6, gi: 0.02, sonr: 0.55, ancho: 0.95 }),
    amor: E({ mx: 0.35, my: -0.4, c: 0.55, h: 0.35, sd: 16, gd: 0.06, si: 16, gi: 0.06, sonr: 0.8, ancho: 0.9 }),
    moja: E({ mx: 0.4, my: 0.75, c: 0.55, sd: 10, gd: 0.04, si: 10, gi: 0.04, sonr: 0.4, ancho: 0.7 }),
    abre: E({ mx: 0.3, my: 0.2, c: 0.45, sd: 14, gd: 0.04, si: 14, gi: 0.04, abre: 26, ancho: 0.95, sonr: 0.3 }),
    gloria: E({ mx: 0, my: 0, c: 1, h: 1, sd: 18, gd: 0.08, si: 18, gi: 0.08, abre: 0, ancho: 0.85, sonr: 0.85 }),
    miraG: E({ mx: 0.9, my: 0.15, c: 0.3, sd: 8, gd: 0.03, si: 8, gi: 0.03, sonr: 0.55, ancho: 0.95 }),
    duda: E({ mx: 0.9, my: 0.35, c: 0.1, sd: 20, gd: 0.16, si: 20, gi: 0.16, abre: 9, ancho: 0.55, sonr: -0.15 }),
    alarma: E({ mx: 0.9, my: 0.3, iris: 0.88, c: 0, sd: 27, gd: 0.22, si: 27, gi: 0.22, abre: 18, ancho: 0.65, sonr: -0.3 }),
    aie: E({ mx: 0.6, my: 0.2, c: 1, z: 1, sd: 14, gd: 0.2, si: 14, gi: 0.2, abre: 14, ancho: 1.05, sonr: -0.5 }),
    contiene: E({ mx: 0.9, my: 0.1, c: 0.5, h: 0.35, sd: 10, gd: 0.05, si: 10, gi: 0.05, abre: 0, ancho: 0.62, sonr: 0.55, mof: 0.4 }),
    pena: E({ mx: 0.9, my: 0.2, c: 0.35, sd: 16, gd: 0.2, si: 16, gi: 0.2, sonr: 0.3, ancho: 0.85 }),
    cesta: E({ mx: 0.65, my: 0.75, c: 0.35, sd: 8, gd: 0.04, si: 8, gi: 0.04, sonr: 0.55 }),
    reverencia: E({ mx: 0.6, my: 0.3, c: 0.95, h: 1, sd: 12, gd: 0.06, si: 12, gi: 0.06, sonr: 0.75, ancho: 0.95 }),
    amable: E({ mx: 0.9, my: 0.1, c: 0.3, sd: 10, gd: 0.04, si: 10, gi: 0.04, sonr: 0.65 }),
    curioso: E({ mx: 0.9, my: 0.05, c: 0.25, sd: 14, gd: 0.06, si: 18, gi: 0.1, sonr: 0.35, ancho: 0.85 }),
    risa: E({ mx: 0.5, my: 0, c: 1, h: 1, sd: 18, gd: 0.08, si: 18, gi: 0.08, abre: 26, ancho: 1.1, sonr: 0.85 }),
    camara: E({ mx: -0.85, my: 0, c: 0.4, h: 0.4, sd: 12, gd: 0.05, si: 12, gi: 0.05, abre: 8, ancho: 1, sonr: 0.8 })
  };
  const GUION_CARA_B = [
    [T.bAlcanza - 0.1, T.bAlcanza + 0.2, "inicio"], [T.bCoge + 0.05, T.bCoge + 0.3, "amor"], [T.bBaja - 0.05, T.bBaja + 0.15, "moja"],
    [T.bBoca, T.bBoca + 0.25, "abre"], [T.bMuerde - 0.03, T.bMuerde + 0.06, "gloria"], [T.bDeja + 0.2, T.bDeja + 0.45, "miraG"],
    [T.bDuda - 0.05, T.bDuda + 0.2, "duda"], [T.bAlto - 0.05, T.bAlto + 0.12, "alarma"], [T.plof, T.plof + 0.12, "aie"],
    [T.gSerio + 0.05, T.gSerio + 0.3, "contiene"], [T.quema + 0.1, T.quema + 0.35, "pena"], [T.bCesta - 0.05, T.bCesta + 0.2, "cesta"],
    [T.bOfrece - 0.05, T.bOfrece + 0.25, "reverencia"], [T.entrega + 0.05, T.entrega + 0.3, "amable"], [T.gTaza, T.gTaza + 0.3, "curioso"],
    [T.bRie - 0.05, T.bRie + 0.12, "risa"], [13.3, 13.55, "camara"]
  ];
  const CUERPOS_B = {
    inicio: { torso: 0.04, cab: 0.03 }, alcanza: { torso: 0.16, cab: 0.1 }, admira: { torso: 0.02, cab: -0.06 },
    moja: { torso: 0.13, cab: 0.1 }, boca: { torso: 0.03, cab: -0.02 }, gloria: { torso: -0.05, cab: -0.16 },
    mira: { torso: 0.05, cab: 0.03 }, alarma: { torso: 0.19, cab: 0.06 }, aie: { torso: 0.08, cab: -0.07 },
    contiene: { torso: 0.03, cab: 0.04 }, cesta: { torso: 0.3, cab: 0.14 }, ofrece: { torso: 0.26, cab: 0.24 },
    vuelve: { torso: 0.05, cab: 0.02 }, rie: { torso: -0.03, cab: -0.08 }
  };
  const GUION_CUERPO_B = [
    [T.bAlcanza - 0.05, T.bCoge, "alcanza"], [T.bCoge, T.bAdmira, "admira"], [T.bBaja - 0.05, T.bDentro, "moja"],
    [T.bSaca + 0.1, T.bBoca + 0.2, "boca"], [T.bMuerde, T.bMuerde + 0.35, "gloria"], [T.bDeja - 0.05, T.bDeja + 0.3, "alcanza"],
    [T.bDejado - 0.05, T.bDejado + 0.3, "mira"], [T.bAlto - 0.1, T.bAlto + 0.2, "alarma"], [T.plof, T.plof + 0.24, "aie"],
    [T.gSerio, T.gSerio + 0.4, "contiene"], [T.bCesta - 0.05, T.bCogeN, "cesta"], [T.bOfrece, T.bOfrece + 0.35, "ofrece"],
    [T.bVuelve + 0.05, T.bVuelve + 0.45, "vuelve"], [T.bRie - 0.05, T.bRie + 0.2, "rie"]
  ];

  // mordisco del cruasán de Gabacho: dos lóbulos
  const MORD_B = 2 / NL * LC;
  function cruasanB(t) {
    // en el plato hasta que lo coge; en la mano hasta que lo deja; luego en el plato (mordido)
    const mord = t >= T.bMuerde ? MORD_B : 0;
    const moja = 0.22 * tramo(t, T.bDentro - 0.05, T.bDentro + 0.05);
    return { mord, moja };
  }
  function poseB(t) {
    const b = guion(GUION_CUERPO_B, CUERPOS_B, "inicio", t);
    const respira = Math.sin(t * 2.1 + 0.4);
    const p = {
      x: XB, suelo: SUELO, s: S, espejo: true, tirasLimpias: true, ikContinuo: true,
      pelvis: { x: B.PELVIS.x, y: B.PELVIS.y + PEL_B + respira * 1.1 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // masticando en la gloria: la cabeza se mece; risa final: sacudidas
    const gl = dentro(t, T.bMuerde, T.bMuerde + 0.2, T.bDeja - 0.2, T.bDeja + 0.1);
    p.cabeza.ang += 0.05 * Math.sin((t - T.bMuerde) * 4.2) * gl;
    const rie = dentro(t, T.bRie, T.bRie + 0.15, 13.3, 13.6);
    p.torso += 0.035 * Math.abs(Math.sin((t - T.bRie) * 11)) * rie; p.cabeza.ang -= 0.04 * Math.abs(Math.sin((t - T.bRie) * 11 + 0.5)) * rie;
    p.pelvis.y -= 3 * Math.abs(Math.sin((t - T.bRie) * 11)) * rie;
    // piernas: tobillos delante (la lejana algo más), un pie se balancea de gusto
    const gusto = dentro(t, T.bMuerde + 0.1, T.bMuerde + 0.3, T.bDeja - 0.3, T.bDeja);
    for (const [lado, dx, dy] of [["cerca", 262, 0], ["lejos", 318, -10]]) {
      let x = B.PELVIS.x + dx, y = TOB_B + dy, ang = 0;
      if (lado === "cerca") { const w = Math.sin((t - T.bMuerde) * 5.5); x += 22 * gusto * (0.5 + 0.5 * w); y -= 26 * gusto * (0.5 + 0.5 * w); ang -= 0.25 * gusto * (0.5 + 0.5 * w); }
      p.piernas[lado] = { tob: { x, y }, ang };
    }
    const ex = guion(GUION_CARA_B, CARAS_B, "inicio", t);
    // masticar: boca y mofletes
    const mast = dentro(t, T.bMuerde + 0.05, T.bMuerde + 0.15, T.bDeja - 0.1, T.bDeja + 0.2);
    if (mast > 0) { const w = Math.sin((t - T.bMuerde) * 13); ex.abre = lerp(ex.abre, 3 + 3 * w, mast); ex.mof = lerp(ex.mof, 0.35 + 0.2 * w, mast); ex.ancho = lerp(ex.ancho, 0.7, mast); }
    const rieA = Math.sin((t - T.bRie) * 11);
    ex.abre += 6 * rieA * rie;
    p.cara = cara(ex, parpadeo(t, [0.5, 4.75, 6.25, 8.55, 9.4, 11.6, 12.35]));
    manosB(p, t);
    return p;
  }

  function manosB(p, t) {
    const Tr = B.tronco(p), P = q => enPant(B, p, Tr(q));
    const reposo = { x: 634, y: 363, mu: -0.85, d: MESA_D };
    const boca = bocaPant(B, p), hom = P(B.HOMBRO);
    const crB = cruasanB(t);
    // agarre del cruasán: en el plato, admirado, sobre la taza, en la boca, cerca de la barbilla
    // el cruasán entra en la boca casi horizontal: la mano queda delante de la cara, lejos del hombro
    // (el brazo de Gabacho tiene el antebrazo corto: si la muñeca se acerca al hombro, el codo se sale por arriba)
    const DIR_B = -0.22;
    const enBoca = (tt) => { const Lc = LC - (tt >= T.bMuerde ? MORD_B : 0) - 2; return { x: boca.x - Math.cos(DIR_B) * Lc, y: boca.y - Math.sin(DIR_B) * Lc, mu: 1.0, d: MENIQUE }; };
    const PL = [
      [0, 0, reposo],
      [T.bAlcanza, T.bCoge, { x: CR_PLATO_B.x, y: CR_PLATO_B.y, mu: -0.6, d: PINZA }],
      [T.bCoge + 0.05, T.bAdmira, { x: 612, y: 297, mu: 1.25, d: MENIQUE }],
      [T.bBaja, T.bDentro, { x: TAZA_B.x + 2, y: 307, mu: 0.15, d: MENIQUE }],
      [T.bSaca, T.bSaca + 0.22, { x: TAZA_B.x + 8, y: 284, mu: 0.4, d: MENIQUE }],
      [T.bBoca, T.bMuerde - 0.02, enBoca],
      [T.bMuerde + 0.12, T.bMuerde + 0.45, (tt) => ({ x: hom.x - 64, y: hom.y - 4, mu: 0.5, d: MENIQUE })],
      [T.bDeja, T.bDejado - 0.1, { x: CR_PLATO_B.x, y: CR_PLATO_B.y, mu: -0.6, d: PINZA }],
      [T.bDejado - 0.08, T.bDejado + 0.25, reposo],
      // ¡alto! la palma hacia Guillermo
      [T.bAlto - 0.12, T.bAlto + 0.12, { x: 582, y: 284, mu: 1.25, d: ABIERTA }],
      [T.gSaca + 0.05, T.gHoriz + 0.1, { x: 590, y: 298, mu: 1.15, d: D(0.8, 0.85, 0.8, 0.75, 0.7) }],
      [T.plof, T.plof + 0.22, { x: 598, y: 290, mu: 1.15, d: ABIERTA }],
      [T.gSerio - 0.1, T.gSerio + 0.35, reposo],
      // la cesta: coge el cruasán de delante y se lo ofrece con una reverencia
      [T.bCesta, T.bCogeN - 0.03, { x: CR_CESTA.x, y: CR_CESTA.y, mu: -0.35, d: ABRE }],
      [T.bCogeN - 0.06, T.bCogeN + 0.04, { x: CR_CESTA.x, y: CR_CESTA.y, mu: -0.35, d: PINZA }],
      [T.bCogeN + 0.04, T.bOfrece + 0.1, { x: 556, y: 318, mu: -0.2, d: MENIQUE }],
      [T.bOfrece + 0.1, T.bOfrece + 0.45, { x: 549, y: 315, mu: -0.15, d: MENIQUE }],
      [T.entrega - 0.02, T.entrega + 0.12, { x: 552, y: 312, mu: -0.15, d: ABRE }],
      [T.bVuelve, T.bVuelve + 0.45, reposo],
      // risa: palmaditas en la mesa
      [T.bRie, T.bRie + 0.2, (tt) => ({ x: reposo.x + 2, y: reposo.y - 10 * Math.abs(Math.sin((tt - T.bRie) * 5.5)) * (1 - tramo(tt, 13.2, 13.5)), mu: -0.75, d: MESA_D })]
    ];
    const l = pista(PL, t);
    // ¿qué lleva en la mano lejana?
    let objeto = null;
    if (t >= T.bCoge && t < T.bDejado - 0.1) {
      const ang = pistaN([[0, 0, Math.PI], [T.bCoge + 0.05, T.bAdmira, -2.35, suave], [T.bBaja - 0.02, T.bDentro, Math.PI / 2 + 0.05], [T.bSaca + 0.1, T.bBoca, -1.1],
        [T.bBoca, T.bMuerde - 0.02, -0.22], [T.bMuerde + 0.12, T.bMuerde + 0.45, -1.75], [T.bDeja, T.bDejado - 0.1, Math.PI]], t, true);
      const cv = pistaN([[0, 0, -1], [T.bCoge, T.bAdmira, -1]], t);
      objeto = { x: l.x, y: l.y, ang, cv, mord: crB.mord, moja: crB.moja, cae: 0.08 * crB.moja / 0.22 };
    }
    let objN = null;
    if (t >= T.bCogeN && t < T.entrega) {
      const ang = pistaN([[0, 0, CR_CESTA.ang], [T.bCogeN + 0.04, T.bOfrece + 0.1, Math.PI + 0.02]], t, true);
      objN = { x: l.x, y: l.y, ang, cv: -1 };
    }
    p.crB = objeto; p.crN = objN;
    const lleva = objeto || objN;
    p.manoLejos = manoRig(B, p, l, -1, lleva ? (g => conCamara(g, () => dibCroissant(g, lleva))) : null);
    // mano cercana: sobre el muslo (con alguna palmada en la risa)
    const rie = dentro(t, T.bRie, T.bRie + 0.15, 13.3, 13.6);
    const c = { x: 707, y: 404 - 9 * Math.abs(Math.sin((t - T.bRie) * 5.5 + 1.2)) * rie, mu: -1.3, d: MUSLO };
    const alarma = dentro(t, T.bAlto - 0.1, T.bAlto + 0.1, T.gHoriz, T.gHoriz + 0.3);
    c.x -= 6 * alarma; c.y -= 6 * alarma;
    p.manoCerca = manoRig(B, p, c, -1, null);
    void P;
  }

  /* =====================================================================================
   * GUILLERMO (izquierda, mira a la derecha)
   * ===================================================================================== */
  const PEL_G = G.SUELO + (Y_PELVIS - SUELO) / S - G.PELVIS.y;
  const TOB_G = G.SUELO - G.TOBILLO_ALTO;
  const CARAS_G = {
    inicio: E({ mx: 0.9, my: 0.12, c: 0.2, sd: 6, gd: 0.03, si: 8, gi: 0.04, sonr: 0.35 }),
    curioso: E({ mx: 0.9, my: 0.1, c: 0.15, sd: 12, gd: 0.06, si: 16, gi: 0.1, abre: 3, ancho: 0.85, sonr: 0.2 }),
    impres: E({ mx: 0.9, my: 0.05, c: 0, sd: 22, gd: 0.12, si: 24, gi: 0.14, abre: 13, ancho: 0.55, sonr: 0.05 }),
    decidido: E({ mx: 0.55, my: 0.55, c: 0.35, sd: -2, gd: -0.1, si: 6, gi: 0.02, sonr: 0.5, ancho: 1.02 }),
    chulo: E({ mx: 0.7, my: -0.2, c: 0.35, sd: 14, gd: 0.06, si: 4, gi: -0.02, sonr: 0.65, ancho: 1.02 }),
    reto: E({ mx: 0.9, my: 0.05, c: 0.42, sd: 18, gd: 0.1, si: -2, gi: -0.06, sonr: 0.8, ancho: 1.05 }),
    concentra: E({ mx: 0.65, my: 0.75, c: 0.35, sd: 4, gd: 0, si: 8, gi: 0.04, sonr: 0.35, ancho: 0.9 }),
    camara: E({ mx: -0.85, my: 0, c: 0.42, sd: 14, gd: 0.06, si: 14, gi: 0.06, abre: 2, ancho: 1.05, sonr: 0.85 }),
    miraCr: E({ mx: 0.6, my: 0.55, c: 0.1, sd: 18, gd: 0.12, si: 8, gi: -0.05, abre: 4, ancho: 0.8, sonr: -0.05 }),
    horror: E({ mx: 0.6, my: 0.6, iris: 0.8, c: 0, sd: 26, gd: 0.2, si: 26, gi: 0.2, abre: 18, ancho: 0.6, sonr: -0.3 }),
    salpica: E({ mx: 0, my: 0, c: 1, z: 1, sd: 6, gd: 0.04, si: 6, gi: 0.04, abre: 0, ancho: 0.8, sonr: -0.5 }),
    serio: E({ mx: -0.85, my: 0, c: 0.48, sd: -2, gd: -0.04, si: -2, gi: -0.04, abre: 0, ancho: 0.75, sonr: -0.15 }),
    pesca: E({ mx: 0.6, my: 0.7, c: 0.3, sd: 6, gd: 0.02, si: 12, gi: 0.08, abre: 12, ancho: 0.5, sonr: 0.1, lengua: 1 }),
    quema: E({ mx: 0, my: 0, c: 1, z: 1, sd: 16, gd: 0.2, si: 16, gi: 0.2, abre: 30, ancho: 0.95, sonr: -0.6, lengua: 0.5 }),
    sopla: E({ mx: 0.8, my: 0.2, c: 0.55, sd: 12, gd: 0.15, si: 12, gi: 0.15, abre: 8, ancho: 0.3, sonr: -0.1, mof: 0.7, dientes: 0 }),
    agradece: E({ mx: 0.9, my: 0.1, c: 0.15, sd: 16, gd: 0.06, si: 18, gi: 0.08, abre: 6, ancho: 0.9, sonr: 0.6 }),
    miraN: E({ mx: 0.7, my: 0.45, c: 0.3, sd: 8, gd: 0.04, si: 10, gi: 0.05, sonr: 0.3, ancho: 0.9 }),
    sospecha: E({ mx: 0.7, my: 0.8, c: 0.58, sd: -6, gd: -0.12, si: 12, gi: 0.1, sonr: -0.1, ancho: 0.8 }),
    camara2: E({ mx: -0.85, my: 0, c: 0.45, sd: 2, gd: -0.04, si: 22, gi: 0.15, sonr: 0.15, ancho: 0.8 }),
    zampa: E({ mx: 0.6, my: 0.3, c: 0.1, sd: 18, gd: 0.06, si: 18, gi: 0.06, abre: 36, ancho: 0.95, sonr: 0.1 }),
    lleno: E({ mx: -0.85, my: 0, c: 0.5, h: 0.25, sd: 10, gd: 0.04, si: 16, gi: 0.08, abre: 0, ancho: 0.62, sonr: 0.35, mof: 1 })
  };
  const GUION_CARA_G = [
    [0.7, 1.0, "curioso"], [T.gImpres - 0.05, T.gImpres + 0.15, "impres"], [T.gAlcanza - 0.1, T.gAlcanza + 0.2, "decidido"],
    [T.gCoge + 0.05, T.gCoge + 0.3, "chulo"], [T.gReto, T.gReto + 0.15, "reto"], [T.gBaja, T.gBaja + 0.2, "concentra"],
    [T.gCamara, T.gCamara + 0.25, "camara"], [T.gMira, T.gMira + 0.25, "miraCr"], [T.estira + 0.02, T.estira + 0.15, "horror"],
    [T.salpica - 0.04, T.salpica + 0.06, "salpica"], [T.gSerio - 0.05, T.gSerio + 0.2, "serio"], [T.gPesca - 0.05, T.gPesca + 0.2, "pesca"],
    [T.quema - 0.01, T.quema + 0.05, "quema"], [T.gSopla, T.gSopla + 0.15, "sopla"], [T.bOfrece, T.bOfrece + 0.25, "agradece"],
    [T.gMiraN, T.gMiraN + 0.2, "miraN"], [T.gTaza, T.gTaza + 0.2, "sospecha"], [T.gCam2, T.gCam2 + 0.2, "camara2"],
    [T.gZampa, T.gZampa + 0.18, "zampa"], [T.gBocado - 0.02, T.gBocado + 0.08, "lleno"]
  ];
  const CUERPOS_G = {
    inicio: { torso: 0.05, cab: 0.03 }, mira: { torso: 0.02, cab: -0.04 }, alcanza: { torso: 0.16, cab: 0.1 },
    chulo: { torso: -0.02, cab: -0.06 }, moja: { torso: 0.12, cab: 0.06 }, camara: { torso: 0.08, cab: -0.04 },
    miraCr: { torso: 0.07, cab: 0.12 }, salpica: { torso: -0.06, cab: -0.16 }, serio: { torso: 0.02, cab: 0.0 },
    deja: { torso: 0.14, cab: 0.08 }, pesca: { torso: 0.2, cab: 0.14 }, quema: { torso: -0.08, cab: -0.14 },
    sopla: { torso: 0.0, cab: 0.06 }, toma: { torso: 0.24, cab: 0.06 }, sostiene: { torso: 0.05, cab: 0.06 },
    zampa: { torso: 0.08, cab: 0.06 }, mastica: { torso: 0.03, cab: -0.02 }
  };
  const GUION_CUERPO_G = [
    [T.gImpres - 0.1, T.gImpres + 0.3, "mira"], [T.gAlcanza - 0.05, T.gCoge, "alcanza"], [T.gCoge + 0.05, T.gReto, "chulo"],
    [T.gBaja - 0.05, T.gDentro, "moja"], [T.gCamara, T.gCamara + 0.3, "camara"], [T.gSaca, T.gHoriz, "miraCr"],
    [T.salpica - 0.03, T.salpica + 0.15, "salpica"], [T.gSerio - 0.15, T.gSerio + 0.2, "serio"],
    [T.gDejaMunon, T.gSuelta, "deja"], [T.gPesca, T.gMete, "pesca"], [T.quema, T.quema + 0.1, "quema", salida],
    [T.gSopla - 0.1, T.gSopla + 0.2, "sopla"], [T.gToma - 0.05, T.entrega, "toma"], [T.entrega + 0.05, T.gMiraN + 0.2, "sostiene"],
    [T.gZampa - 0.05, T.gBocado, "zampa"], [T.gBocado + 0.05, T.gBocado + 0.35, "mastica"]
  ];

  /* ---------- el cruasán de Guillermo: se empapa, se dobla y se rompe ---------- */
  const MORD_N = 4 / NL * LC;
  // mano lejana mientras lo moja y lo saca (fija en pantalla: así el trozo que cae se sabe de antemano)
  const H_DENTRO = { x: TAZA_G.x - 1, y: 307 }, H_ARRIBA = { x: TAZA_G.x - 6, y: 282 }, H_HORIZ = { x: 438, y: 300 };
  function cruasanG(t) {
    const moja = t < T.gDentro ? 0 : lerp(0.2, 0.7, tramo(t, T.gDentro, T.gSaca, s => s));
    const ang = pistaN([[0, 0, 0], [T.gCoge + 0.03, T.gReto - 0.05, -0.75], [T.gBaja, T.gDentro, Math.PI / 2 - 0.08],
      [T.gFuera, T.gHoriz, -0.28], [T.gSerio, T.gSerio + 0.3, -0.12], [T.gDejaMunon, T.gSuelta, 0]], t, true);
    // lo empapado cuelga al sacarlo y rebota (muelle amortiguado)
    let cae = 0;
    if (t > T.gFuera) {
      const tau = t - T.gFuera, base = tramo(t, T.gFuera, T.gHoriz + 0.1);
      cae = base * (1 + 0.16 * Math.exp(-tau * 3) * Math.sin(tau * 15));
      cae = lerp(cae, 1.05, tramo(t, T.estira - 0.05, T.rompe));
      if (t > T.rompe) { const tr = t - T.rompe; cae = 0.62 + 0.3 * Math.exp(-tr * 5) * Math.cos(tr * 17); }
      cae *= 1 - 0.4 * tramo(t, T.gDejaMunon, T.gSuelta);
    }
    const estira = t < T.rompe ? 7 * entrada(fase(t, T.estira, T.rompe)) : 0;
    const corta = t >= T.rompe;
    // posición del agarre
    let h;
    if (t < T.gBaja) h = null;
    else if (t < T.gSaca) h = H_DENTRO;
    else if (t < T.gFuera) h = mezcla(H_DENTRO, H_ARRIBA, tramo(t, T.gSaca, T.gFuera));
    else h = mezcla(H_ARRIBA, H_HORIZ, tramo(t, T.gFuera, T.gHoriz));
    return { h, ang, moja, cae, estira, corta, cv: 1 };
  }
  // trozo que se rompe: forma y sitio en el instante de la rotura (se calcula una vez)
  let PIEZA = null;
  function pieza() {
    if (PIEZA) return PIEZA;
    const e = cruasanG(T.rompe - 1e-4), c = Object.assign({ x: H_HORIZ.x, y: H_HORIZ.y }, e, { corta: false });
    const Gm = geo(c), a = Gm.sb + Gm.est, b = Gm.L + Gm.est;
    let cx = 0, cy = 0, n = 0; for (let s = a; s <= b; s += 2) { const P = enS(Gm.pts, s); cx += P.x; cy += P.y; n++; }
    PIEZA = { Gm, a, b, cx: cx / n, cy: cy / n };
    return PIEZA;
  }
  const CAIDA = { g: 1500 };
  function estadoPieza(t) {
    if (t < T.rompe) return null;
    const P = pieza(), tau = t - T.rompe, sup = SUP(TAZA_G).y;
    // cae: x hacia el centro de la taza, y con gravedad, girando un poco hacia vertical
    const dy0 = sup - (P.cy + 6);
    const tCae = Math.sqrt(2 * Math.max(4, dy0) / CAIDA.g);
    let dy, dx = (TAZA_G.x - P.cx) * Math.min(1, tau / tCae), r = 0.25 * Math.min(1, tau / tCae);
    if (tau < tCae) dy = 0.5 * CAIDA.g * tau * tau;
    else dy = dy0 + 40 * (tau - tCae);                 // se hunde despacio
    return { dx, dy, r, hundido: tau > tCae + 0.45 };
  }
  // T.plof real (cuando el trozo toca el café)
  const T_PLOF = (() => { const P = pieza(); return T.rompe + Math.sqrt(2 * Math.max(4, SUP(TAZA_G).y - (P.cy + 6)) / CAIDA.g); })();

  function poseG(t) {
    const b = guion(GUION_CUERPO_G, CUERPOS_G, "inicio", t);
    const respira = Math.sin(t * 2.4);
    const p = {
      x: XG, suelo: SUELO, s: S, tirasLimpias: true, ikContinuo: true,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + PEL_G + respira * 1.3 },
      torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.005 }, piernas: {},
      cabeza: { ang: b.cab, dx: 0, dy: 0, esc: { x: 1, y: 1 } }
    };
    // chulería: hombros que bailan y cejas que suben y bajan mientras mira a cámara
    const chulo = dentro(t, T.gCamara + 0.1, T.gCamara + 0.3, T.gSaca - 0.15, T.gSaca);
    p.torso += 0.025 * Math.sin((t - T.gCamara) * 6) * chulo; p.cabeza.ang += 0.03 * Math.sin((t - T.gCamara) * 6 + 1) * chulo;
    // temblor de la mano quemada se nota en los hombros
    const tiembla = dentro(t, T.quema, T.quema + 0.05, T.gSopla, T.gSopla + 0.2);
    p.torso += 0.015 * Math.sin(t * 60) * tiembla;
    // mastica con los mofletes llenos: la cabeza cabecea
    const mast = dentro(t, T.gBocado + 0.05, T.gBocado + 0.2, 13.6, 13.9);
    p.cabeza.ang += 0.025 * Math.sin((t - T.gBocado) * 9) * mast; p.cabeza.dy += 2 * Math.sin((t - T.gBocado) * 9) * mast;
    // piernas: un pie golpetea con la chulería; patadita al quemarse
    for (const [lado, dx, dy] of [["cerca", 268, 0], ["lejos", 320, -10]]) {
      let x = G.PELVIS.x + dx, y = TOB_G + dy, ang = 0;
      if (lado === "lejos") { const tap = Math.max(0, Math.sin((t - T.gCamara) * 9)); y -= 10 * tap * chulo; ang -= 0.2 * tap * chulo; }
      const pat = campana(t, T.quema, T.quema + 0.35);
      if (lado === "cerca") { x += 30 * pat; y -= 34 * pat; ang -= 0.35 * pat; }
      p.piernas[lado] = { tob: { x, y }, ang };
    }
    const ex = guion(GUION_CARA_G, CARAS_G, "inicio", t);
    // cejas que bailan (chulería)
    ex.sd += 7 * Math.sin((t - T.gCamara) * 9) * chulo; ex.si -= 5 * Math.sin((t - T.gCamara) * 9) * chulo;
    // masticar con los mofletes llenos
    if (mast > 0) { const w = Math.sin((t - T.gBocado) * 9); ex.abre = Math.max(0, ex.abre + 2.5 * w * mast); ex.mof = lerp(ex.mof, 0.85 + 0.15 * w, mast); ex.ancho = lerp(ex.ancho, 0.62 + 0.06 * w, mast); }
    p.cara = cara(ex, parpadeo(t, [0.4, 2.2, 3.4, 6.2, 8.2, 10.3, 11.5, 13.1]));
    p.sudor = 0.6 * dentro(t, T.quema + 0.05, T.quema + 0.2, T.gSoplaFin - 0.2, T.gSoplaFin + 0.2);
    p.rojo = 0.35 * dentro(t, T.quema, T.quema + 0.06, T.gSopla + 0.2, T.gSoplaFin);
    manosG(p, t);
    p.capaCabeza = (g, tt) => capaCabezaG(g, tt, p);
    return p;
  }

  function manosG(p, t) {
    const boca = bocaPant(G, p);
    const reposo = { x: 410, y: 362, mu: 2.45, d: MESA_D };
    const DIR_G = -2.9, enBocaN = (tt) => { const Lc = LC - 3; return { x: boca.x - Math.cos(DIR_G) * Lc, y: boca.y - Math.sin(DIR_G) * Lc, mu: 2.1, d: AGARRA }; };
    // dedos que se soplan: delante de la boca, apuntando hacia ella
    const soplaQ = (tt) => ({ x: boca.x + 30, y: boca.y + 16, mu: 1.25, d: SOPLA });
    const PL = [
      [0, 0, reposo],
      [T.gAlcanza, T.gCoge, { x: CR_PLATO_G.x, y: CR_PLATO_G.y, mu: 2.35, d: PINZA }],
      [T.gCoge + 0.03, T.gReto - 0.05, { x: 404, y: 304, mu: 1.75, d: MENIQUE }],
      [T.gBaja, T.gDentro, { x: H_DENTRO.x, y: H_DENTRO.y, mu: 2.75, d: MENIQUE }],
      [T.gSaca, T.gFuera, { x: H_ARRIBA.x, y: H_ARRIBA.y, mu: 2.55, d: MENIQUE }],
      [T.gFuera, T.gHoriz, { x: H_HORIZ.x, y: H_HORIZ.y, mu: 2.45, d: MENIQUE }],
      [T.gSerio, T.gSerio + 0.3, { x: H_HORIZ.x - 2, y: H_HORIZ.y + 2, mu: 2.45, d: PINZA }],
      // deja el muñón en el plato
      [T.gDejaMunon, T.gSuelta, { x: CR_PLATO_G.x, y: CR_PLATO_G.y, mu: 2.35, d: PINZA }],
      [T.gSuelta, T.gSuelta + 0.1, { x: CR_PLATO_G.x - 2, y: CR_PLATO_G.y - 4, mu: 2.35, d: ABRE }],
      // pesca con dos dedos en el café
      [T.gPesca, T.gMete - 0.05, { x: TAZA_G.x + 1, y: 318, mu: -1.75, d: PESCA }],
      [T.gMete - 0.05, T.gMete + 0.06, { x: TAZA_G.x + 1, y: 333, mu: -1.7, d: PESCA }],
      [T.quema, T.quema + 0.13, { x: 424, y: 268, mu: 1.9, d: ABRE }, salida],
      [T.gSopla - 0.12, T.gSopla + 0.1, soplaQ],
      [T.gSoplaFin, T.gSoplaFin + 0.35, reposo],
      // coge el cruasán nuevo por el cuerno libre
      [T.gToma, T.entrega - 0.04, { x: 495, y: 316, mu: 2.95, d: ABRE }],
      [T.entrega - 0.06, T.entrega + 0.04, { x: 495, y: 316, mu: 2.95, d: AGARRA }],
      [T.entrega + 0.08, T.gMiraN + 0.15, { x: 414, y: 303, mu: 2.3, d: AGARRA }],
      [T.gTaza, T.gTaza + 0.25, { x: 412, y: 306, mu: 2.3, d: AGARRA }],
      [T.gZampa, T.gBocado - 0.02, enBocaN],
      [T.gBocado + 0.1, T.gBocado + 0.45, { x: 410, y: 318, mu: 2.2, d: AGARRA }]
    ];
    let l = pista(PL, t);
    // la mano quemada tiembla y se agita
    const tiembla = dentro(t, T.quema + 0.06, T.quema + 0.1, T.gSopla, T.gSoplaFin);
    l = Object.assign({}, l, { x: l.x + 4.5 * Math.sin(t * 57) * tiembla, y: l.y + 3 * Math.sin(t * 43 + 1) * tiembla });
    // ¿qué lleva?
    let objeto = null;
    if (t >= T.gCoge && t < T.gSuelta) {
      const e = cruasanG(t);
      if (t < T.gBaja) objeto = { x: l.x, y: l.y, ang: e.ang, cv: 1 };
      else objeto = { x: l.x, y: l.y, ang: e.ang, cv: 1, moja: e.moja, cae: e.cae, estira: e.estira, corta: e.corta };
    } else if (t >= T.entrega) {
      const ang = pistaN([[0, 0, 0.02], [T.entrega + 0.08, T.gMiraN + 0.15, -0.55], [T.gZampa, T.gBocado - 0.02, -2.9], [T.gBocado + 0.1, T.gBocado + 0.45, -0.7]], t, true);
      objeto = { x: l.x, y: l.y, ang, cv: 1, mord: t >= T.gBocado ? MORD_N : 0 };
    }
    p.cr = objeto;
    p.manoLejos = manoRig(G, p, l, -1, objeto ? (g => conCamara(g, () => dibCroissant(g, objeto))) : null);
    // mano cercana: sobre el muslo; respingo al salpicarle y al quemarse
    const susto = Math.max(campana(t, T.salpica - 0.02, T.salpica + 0.4), campana(t, T.quema, T.quema + 0.4));
    const c = { x: 314 + 6 * susto, y: 404 - 22 * susto, mu: -1.95, d: mezclaD(MUSLO, ABIERTA, susto) };
    p.manoCerca = manoRig(G, p, c, -1, null);
  }

  /* ---------- capa de la cara de Guillermo (retrato): manchas de café, lágrimas, moflete cercano ---------- */
  const MANCHAS = [[812, 498, 13, 0.3], [714, 650, 15, -0.4], [925, 700, 10, 0.8], [858, 760, 8, 0.2], [760, 610, 6, 0], [880, 545, 6, 1.2]];
  function capaCabezaG(g, t, p) {
    const k = tramo(t, T.salpica - 0.02, T.salpica + 0.12);
    if (k > 0) {
      g.save();
      MANCHAS.forEach(([x, y, r, a], i) => {
        const e = clamp(k * 1.4 - i * 0.08); if (e <= 0) return;
        g.save(); g.translate(x, y); g.rotate(a); g.scale(e, e);
        g.fillStyle = "#5b2f13"; g.beginPath();
        for (let j = 0; j < 9; j++) { const an = j / 9 * Math.PI * 2, rr = r * (0.82 + 0.3 * hash(i * 11 + j)); g.lineTo(Math.cos(an) * rr * 1.15, Math.sin(an) * rr); }
        g.closePath(); g.fill();
        g.fillStyle = "rgba(255,230,200,0.5)"; g.beginPath(); g.ellipse(-r * 0.3, -r * 0.35, r * 0.28, r * 0.18, -0.4, 0, Math.PI * 2); g.fill();
        g.restore();
      });
      // la de la mejilla gotea despacio
      const d = 62 * salida(fase(t, T.salpica + 0.25, T.salpica + 2.4));
      if (d > 0.5) {
        g.fillStyle = "#5b2f13"; g.beginPath(); g.moveTo(709, 652); g.lineTo(705 + d * 0.06, 652 + d); g.lineTo(719 + d * 0.06, 652 + d); g.lineTo(721, 652); g.closePath(); g.fill();
        g.beginPath(); g.ellipse(712 + d * 0.06, 654 + d, 7, 8, 0, 0, Math.PI * 2); g.fill();
      }
      g.restore();
    }
    // lagrimitas al quemarse
    const lg = dentro(t, T.quema + 0.05, T.quema + 0.15, T.gSoplaFin - 0.1, T.gSoplaFin + 0.15);
    if (lg > 0.01) {
      g.save(); g.globalAlpha = lg; g.fillStyle = "#bfe8ff"; g.strokeStyle = "#1d3b52"; g.lineWidth = 4;
      for (const [x, y, f] of [[742, 590, 0], [925, 640, 0.5]]) {
        const ph = ((t - T.quema) * 1.6 + f) % 1, yy = y + ph * 40, s = 11 * (1 - 0.3 * ph);
        g.beginPath(); g.moveTo(x, yy - s * 1.5); g.quadraticCurveTo(x + s, yy, x, yy + s); g.quadraticCurveTo(x - s, yy, x, yy - s * 1.5); g.fill(); g.stroke();
      }
      g.restore();
    }
    // moflete cercano hinchado (soplar y con la boca llena)
    const inf = Math.max(0.7 * dentro(t, T.gSopla - 0.05, T.gSopla + 0.1, T.gSoplaFin - 0.1, T.gSoplaFin + 0.05) * (0.85 + 0.15 * Math.sin(t * 14)), p.cara.mofletes * tramo(t, T.gBocado - 0.02, T.gBocado + 0.08));
    carrillo(g, inf);
  }
  const PIEL_G = G.C.piel;
  function carrillo(g, k) {
    if (k <= 0.01) return;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const A = { x: 600, y: 684 }, Bq = { x: 768, y: 842 }, b = 30 * k;
    const c1 = { x: 586 - b * 0.9, y: 748 + b * 0.5 }, c2 = { x: 690 - b * 0.5, y: 850 + b * 0.8 };
    g.beginPath(); g.moveTo(A.x, A.y); g.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, Bq.x, Bq.y); g.lineTo(760, 800); g.lineTo(640, 700); g.closePath();
    g.fillStyle = PIEL_G; g.fill();
    g.beginPath(); g.moveTo(A.x, A.y); g.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, Bq.x, Bq.y); g.lineWidth = 6; g.strokeStyle = TINTA; g.stroke();
    g.globalAlpha = 0.5 * clamp(k); g.fillStyle = "#fff1dc";
    g.beginPath(); g.ellipse(706, 664, 20 + 12 * k, 13 + 7 * k, -0.35, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  /* =====================================================================================
   * ATREZO: tazas, platos, cesta, jarrón, mesa y sillas
   * ===================================================================================== */
  function platillo(g, x, y, rx, ry) {
    g.save();
    g.fillStyle = "rgba(60,40,30,0.18)"; g.beginPath(); g.ellipse(x + 2, y + 2.5, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fbf8f2"; g.strokeStyle = TINTA; g.lineWidth = 1.8;
    g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = "rgba(120,110,100,0.5)"; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 0.6, rx * 0.62, ry * 0.55, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "#3d7a5a"; g.lineWidth = 1.2; g.beginPath(); g.ellipse(x, y, rx - 2.2, ry - 1, 0, 0.1, Math.PI - 0.1); g.stroke();
    g.restore();
  }
  // taza: cuerpo (frente) — se repinta encima de los personajes
  function cuerpoTaza(g, c) {
    const yr = c.y - 27, yb = c.y - 3, x = c.x;
    g.beginPath(); g.moveTo(x - 14, yr); g.bezierCurveTo(x - 14, yr + 14, x - 11, yb, x - 7.5, yb); g.lineTo(x + 7.5, yb);
    g.bezierCurveTo(x + 11, yb, x + 14, yr + 14, x + 14, yr); g.ellipse(x, yr, 14, 4, 0, 0, Math.PI, false); g.closePath();
  }
  function frenteTaza(g, c, t) {
    const yr = c.y - 27, x = c.x, s = SUP(c);
    g.save(); g.lineJoin = "round";
    // mitad de delante de la superficie del café (lo que entra en el café queda dentro)
    g.fillStyle = "#6a3816"; g.beginPath(); g.ellipse(s.x, s.y, 12.3, 3.3, 0, 0, Math.PI); g.closePath(); g.fill();
    g.fillStyle = "#a76a37"; g.beginPath(); g.ellipse(s.x, s.y + 0.5, 10, 2.2, 0, 0.15, Math.PI - 0.15); g.fill();
    // cuerpo de porcelana
    cuerpoTaza(g, c); g.fillStyle = "#fbf8f2"; g.fill();
    g.save(); cuerpoTaza(g, c); g.clip();
    g.fillStyle = "#e4ddd0"; g.beginPath(); g.ellipse(x + 9, yr + 14, 7, 18, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,0.9)"; g.beginPath(); g.ellipse(x - 7, yr + 11, 2.2, 8, 0.1, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#3d7a5a"; g.lineWidth = 1.6; g.beginPath(); g.ellipse(x, yr + 3, 14, 4, 0, 0.05, Math.PI - 0.05); g.stroke();
    g.restore();
    cuerpoTaza(g, c); g.lineWidth = 1.8; g.strokeStyle = TINTA; g.stroke();
    // asa
    const sa = c.asa;
    g.beginPath(); g.ellipse(x + sa * 15.5, yr + 11, 5.5, 6.5, 0, -Math.PI / 2 - 0.3, Math.PI / 2 + 0.3, sa < 0); g.lineWidth = 5; g.strokeStyle = TINTA; g.stroke();
    g.lineWidth = 2.6; g.strokeStyle = "#fbf8f2"; g.stroke();
    g.restore();
    void t;
  }
  // taza completa (con la parte de atrás del borde y el café)
  function taza(g, c, t, onda) {
    const yr = c.y - 27, x = c.x, s = SUP(c);
    platillo(g, x, c.y, 21, 5.5);
    g.save();
    // interior: borde de atrás y café
    g.fillStyle = "#efe9de"; g.beginPath(); g.ellipse(x, yr, 14, 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#5b2f13"; g.beginPath(); g.ellipse(s.x, s.y, 12.3, 3.3, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#b9773f"; g.beginPath(); g.ellipse(s.x - 0.5, s.y - 0.2, 10, 2.4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,226,170,0.7)"; g.beginPath(); g.ellipse(s.x - 3, s.y - 0.8, 3.5, 0.9, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = TINTA; g.lineWidth = 1.6; g.beginPath(); g.ellipse(x, yr, 14, 4, 0, Math.PI, Math.PI * 2); g.stroke();
    g.restore();
    frenteTaza(g, c, t);
    void onda;
  }
  function plato(g, c) { platillo(g, c.x, c.y, 25, 6.5); }
  function cesta(g, t, conDelantero) {
    const x = CESTA.x, y = CESTA.y;
    g.save(); g.lineJoin = "round";
    g.fillStyle = "rgba(60,40,30,0.2)"; g.beginPath(); g.ellipse(x + 2, y + 3, 26, 5, 0, 0, Math.PI * 2); g.fill();
    // fondo de la cesta (boca de atrás)
    g.fillStyle = "#7a4a1e"; g.beginPath(); g.ellipse(x, y - 15, 27, 6, 0, Math.PI, Math.PI * 2); g.fill();
    g.fillStyle = "#f4eadb"; g.beginPath(); g.moveTo(x - 24, y - 15); g.lineTo(x - 14, y - 22); g.lineTo(x + 2, y - 19); g.lineTo(x + 18, y - 23); g.lineTo(x + 25, y - 15); g.closePath(); g.fill();
    for (const c of CR_CESTA_ATRAS) dibCroissant(g, c);
    // cuerpo de mimbre
    const cuerpo = () => { g.beginPath(); g.moveTo(x - 27, y - 15); g.lineTo(x - 21, y); g.quadraticCurveTo(x, y + 5, x + 21, y); g.lineTo(x + 27, y - 15); g.ellipse(x, y - 15, 27, 6, 0, 0, Math.PI, false); g.closePath(); };
    cuerpo(); g.fillStyle = "#c48a45"; g.fill();
    g.save(); cuerpo(); g.clip();
    g.strokeStyle = "#8a5622"; g.lineWidth = 1.4;
    for (let i = -6; i <= 6; i++) { g.beginPath(); g.moveTo(x + i * 5, y - 12); g.lineTo(x + i * 4.2, y + 4); g.stroke(); }
    for (let j = 0; j < 4; j++) { g.beginPath(); g.ellipse(x, y - 11 + j * 4, 26 - j * 1.5, 5, 0, 0.05, Math.PI - 0.05); g.stroke(); }
    g.restore();
    cuerpo(); g.lineWidth = 1.8; g.strokeStyle = TINTA; g.stroke();
    // servilleta de cuadros asomando
    g.fillStyle = "#d94a3c"; g.beginPath(); g.moveTo(x - 27, y - 15); g.lineTo(x - 33, y - 6); g.lineTo(x - 24, y - 9); g.closePath(); g.fill(); g.lineWidth = 1.2; g.stroke();
    if (conDelantero) dibCroissant(g, CR_CESTA);
    g.restore();
    void t;
  }
  function jarron(g, t) {
    const x = JARRON.x, y = JARRON.y;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // tallo y flor (margarita) que se mece
    const m = 0.04 * Math.sin(t * 1.3);
    g.strokeStyle = "#3f7a3a"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - 14); g.quadraticCurveTo(x - 2, y - 30, x + 2 + m * 40, y - 44); g.stroke();
    g.fillStyle = "#4f9a46"; g.beginPath(); g.ellipse(x - 4, y - 27, 4.5, 2, -0.6, 0, Math.PI * 2); g.fill();
    const fx = x + 2 + m * 40, fy = y - 46;
    g.fillStyle = "#fffdf6"; g.strokeStyle = "#7d6a55"; g.lineWidth = 0.9;
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + m; g.beginPath(); g.ellipse(fx + Math.cos(a) * 5, fy + Math.sin(a) * 4, 3.6, 1.6, a, 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.fillStyle = "#f4c21f"; g.beginPath(); g.arc(fx, fy, 2.6, 0, Math.PI * 2); g.fill(); g.stroke();
    // jarroncito de cristal
    g.fillStyle = "rgba(200,232,240,0.75)"; g.strokeStyle = TINTA; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(x - 3, y - 16); g.lineTo(x - 3, y - 12); g.quadraticCurveTo(x - 8, y - 6, x - 6, y); g.lineTo(x + 6, y); g.quadraticCurveTo(x + 8, y - 6, x + 3, y - 12); g.lineTo(x + 3, y - 16); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.8)"; g.fillRect(x - 4, y - 9, 1.5, 6);
    g.restore();
  }
  function mesa(g) {
    const m = MESA;
    g.save(); g.lineJoin = "round";
    // pie de hierro: base de tres patas y columna
    const yb = SUELO - 12;
    g.fillStyle = "rgba(40,30,20,0.25)"; g.beginPath(); g.ellipse(m.x, yb + 4, 70, 7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#26262a"; g.strokeStyle = TINTA; g.lineWidth = 2;
    for (const sg of [-1, 1]) { g.beginPath(); g.moveTo(m.x, yb - 26); g.quadraticCurveTo(m.x + sg * 30, yb - 18, m.x + sg * 58, yb); g.lineTo(m.x + sg * 60, yb + 3); g.lineTo(m.x + sg * 50, yb + 3); g.quadraticCurveTo(m.x + sg * 26, yb - 10, m.x, yb - 16); g.closePath(); g.fill(); g.stroke(); }
    g.beginPath(); g.moveTo(m.x, yb - 20); g.lineTo(m.x + 4, yb + 6); g.lineTo(m.x - 4, yb + 6); g.closePath(); g.fill(); g.stroke();
    const col = (y0, y1, w) => { g.beginPath(); g.rect(m.x - w, y0, w * 2, y1 - y0); g.fill(); g.stroke(); };
    col(m.y + m.canto, yb - 20, 5);
    for (const [y, rx, ry] of [[yb - 22, 11, 6], [m.y + 80, 9, 7], [m.y + 16, 14, 5]]) { g.beginPath(); g.ellipse(m.x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(m.x - 3, m.y + 20, 2, yb - m.y - 45);
    // tablero de mármol con canto de latón
    g.fillStyle = "#a99a74"; g.beginPath(); g.ellipse(m.x, m.y + m.canto, m.rx, m.ry, 0, 0, Math.PI); g.lineTo(m.x - m.rx, m.y); g.ellipse(m.x, m.y, m.rx, m.ry, 0, Math.PI, 0, true); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#d9c38a"; g.beginPath(); g.ellipse(m.x, m.y + m.canto * 0.5, m.rx - 1, m.ry, 0, 0.2, Math.PI - 0.2); g.ellipse(m.x, m.y + 1, m.rx - 1, m.ry, 0, Math.PI - 0.2, 0.2, true); g.closePath(); g.fill();
    const gm = g.createLinearGradient(m.x - m.rx, m.y - m.ry, m.x + m.rx, m.y + m.ry); gm.addColorStop(0, "#fbf9f4"); gm.addColorStop(1, "#e5e0d6");
    g.fillStyle = gm; g.beginPath(); g.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.save(); g.beginPath(); g.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, Math.PI * 2); g.clip();
    g.strokeStyle = "rgba(150,150,160,0.35)"; g.lineWidth = 1;
    g.beginPath(); g.moveTo(m.x - 100, m.y - 8); g.bezierCurveTo(m.x - 60, m.y - 2, m.x - 40, m.y + 10, m.x + 10, m.y + 6); g.stroke();
    g.beginPath(); g.moveTo(m.x + 30, m.y - 14); g.bezierCurveTo(m.x + 50, m.y - 4, m.x + 80, m.y - 6, m.x + 110, m.y + 4); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.5)"; g.beginPath(); g.ellipse(m.x - 40, m.y - 6, 40, 3, -0.05, 0, Math.PI * 2); g.fill();
    g.restore();
    g.restore();
  }
  function silla(g, x, dir) {
    // silla bistró de mimbre vista de lado; dir = hacia dónde mira quien se sienta (+1 derecha)
    const ys = Y_ASIENTO, atras = x - dir * 48, delante = x + dir * 44;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.fillStyle = "rgba(40,30,20,0.25)"; g.beginPath(); g.ellipse(x, SUELO + 2, 56, 6, 0, 0, Math.PI * 2); g.fill();
    const madera = "#5e3a1c", maderaL = "#8a5a2e";
    // patas (la de atrás lejana más oscura)
    const pata = (x0, x1, w, c) => { g.strokeStyle = TINTA; g.lineWidth = w + 3; g.beginPath(); g.moveTo(x0, ys + 6); g.quadraticCurveTo((x0 + x1) / 2, ys + 60, x1, SUELO - 2); g.stroke(); g.strokeStyle = c; g.lineWidth = w; g.stroke(); };
    pata(atras + dir * 8, atras - dir * 4, 4, "#4a2c14"); pata(delante - dir * 10, delante + dir * 2, 4, "#4a2c14");
    // aro de refuerzo
    g.strokeStyle = TINTA; g.lineWidth = 5; g.beginPath(); g.ellipse(x - dir * 2, ys + 58, 40, 6, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = maderaL; g.lineWidth = 2.5; g.stroke();
    pata(atras + dir * 2, atras - dir * 10, 5, madera); pata(delante - dir * 4, delante + dir * 8, 5, madera);
    // respaldo: poste curvado y trenzado de mimbre
    const top = ys - 118;
    const resp = () => { g.beginPath(); g.moveTo(atras + dir * 4, ys); g.bezierCurveTo(atras - dir * 6, ys - 50, atras - dir * 14, top + 30, atras - dir * 6, top + 6);
      g.quadraticCurveTo(atras + dir * 4, top - 4, atras + dir * 16, top + 8); g.bezierCurveTo(atras + dir * 8, top + 40, atras + dir * 12, ys - 50, atras + dir * 18, ys); g.closePath(); };
    resp(); g.fillStyle = "#d3a35d"; g.fill();
    g.save(); resp(); g.clip();
    g.strokeStyle = "rgba(120,72,28,0.75)"; g.lineWidth = 1.3;
    for (let i = -20; i < 20; i++) { g.beginPath(); g.moveTo(atras - 30, top + i * 7); g.lineTo(atras + 30, top + i * 7 + 22); g.stroke(); g.beginPath(); g.moveTo(atras - 30, top + i * 7 + 22); g.lineTo(atras + 30, top + i * 7); g.stroke(); }
    g.restore();
    resp(); g.lineWidth = 4.5; g.strokeStyle = madera; g.stroke(); g.lineWidth = 1.4; g.strokeStyle = TINTA; g.stroke();
    // asiento: aro de madera con trenzado
    g.fillStyle = "#d8a964"; g.beginPath(); g.ellipse(x - dir * 2, ys + 3, 50, 8, 0, 0, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.ellipse(x - dir * 2, ys + 3, 50, 8, 0, 0, Math.PI * 2); g.clip();
    g.strokeStyle = "rgba(120,72,28,0.6)"; g.lineWidth = 1.1;
    for (let i = -12; i <= 12; i++) { g.beginPath(); g.moveTo(x + i * 5, ys - 6); g.lineTo(x + i * 5 + 8, ys + 12); g.stroke(); }
    g.restore();
    g.strokeStyle = TINTA; g.lineWidth = 6.5; g.beginPath(); g.ellipse(x - dir * 2, ys + 3, 50, 8, 0, 0, Math.PI); g.stroke();
    g.strokeStyle = madera; g.lineWidth = 4; g.stroke();
    g.restore();
  }

  /* =====================================================================================
   * DECORADO: terraza de café por la mañana
   * ===================================================================================== */
  const PARED = 432;
  let fondo = null;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 120; c.height = H + 100; const g = c.getContext("2d");
    g.translate(60, 50); g.lineJoin = "round";
    // fachada crema con estuco
    const gf = g.createLinearGradient(0, -50, 0, PARED); gf.addColorStop(0, "#e9d6b2"); gf.addColorStop(1, "#f3e6c9");
    g.fillStyle = gf; g.fillRect(-60, -50, W + 120, PARED + 50);
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${hash(i) > 0.5 ? "255,255,255" : "150,120,80"},${0.05 + 0.06 * hash(i + 5)})`; g.beginPath(); g.ellipse(-60 + hash(i + 1) * (W + 120), -40 + hash(i + 2) * (PARED + 30), 6 + 18 * hash(i + 3), 3 + 6 * hash(i + 4), 0, 0, Math.PI * 2); g.fill(); }
    // zócalo de piedra
    g.fillStyle = "#b9a98c"; g.fillRect(-60, PARED - 46, W + 120, 46);
    g.strokeStyle = "rgba(90,75,55,0.5)"; g.lineWidth = 1.5;
    for (let x = -60; x < W + 60; x += 70) { g.strokeRect(x + ((x / 70) % 2 ? 0 : 0), PARED - 46, 70, 23); g.strokeRect(x + 35, PARED - 23, 70, 23); }
    g.fillStyle = "#8f7f62"; g.fillRect(-60, PARED - 49, W + 120, 4);
    // escaparate a la izquierda: barra, cafetera, estantes con tarros y lámparas
    const ex0 = 70, ex1 = 470, ey0 = 108, ey1 = PARED - 60;
    g.fillStyle = "#234a3a"; g.fillRect(ex0 - 14, ey0 - 14, ex1 - ex0 + 28, ey1 - ey0 + 28);
    const gi = g.createLinearGradient(0, ey0, 0, ey1); gi.addColorStop(0, "#6a3f22"); gi.addColorStop(1, "#3a2414");
    g.fillStyle = gi; g.fillRect(ex0, ey0, ex1 - ex0, ey1 - ey0);
    g.save(); g.beginPath(); g.rect(ex0, ey0, ex1 - ex0, ey1 - ey0); g.clip();
    // lámparas colgantes cálidas
    for (const lx of [150, 290, 410]) {
      g.strokeStyle = "#1c120a"; g.lineWidth = 2; g.beginPath(); g.moveTo(lx, ey0); g.lineTo(lx, ey0 + 40); g.stroke();
      const hl = g.createRadialGradient(lx, ey0 + 50, 2, lx, ey0 + 50, 90); hl.addColorStop(0, "rgba(255,210,130,0.55)"); hl.addColorStop(1, "rgba(255,210,130,0)");
      g.fillStyle = hl; g.beginPath(); g.arc(lx, ey0 + 50, 90, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#c98a2c"; g.beginPath(); g.moveTo(lx - 14, ey0 + 52); g.lineTo(lx - 6, ey0 + 40); g.lineTo(lx + 6, ey0 + 40); g.lineTo(lx + 14, ey0 + 52); g.closePath(); g.fill();
      g.fillStyle = "#fff0c0"; g.beginPath(); g.ellipse(lx, ey0 + 53, 9, 3, 0, 0, Math.PI * 2); g.fill();
    }
    // estantes con tarros y tazas
    for (const sy of [ey0 + 92, ey0 + 140]) {
      g.fillStyle = "#2a1a0e"; g.fillRect(ex0, sy, ex1 - ex0, 6);
      for (let i = 0; i < 16; i++) { const tx = ex0 + 14 + i * 24 + 6 * hash(i + sy), th = 14 + 12 * hash(i + sy + 1);
        g.fillStyle = ["#d9c7a0", "#b9773f", "#7f9a8a", "#e8e0d0", "#a0522d"][Math.floor(hash(i * 3 + sy) * 5)]; g.fillRect(tx, sy - th, 13, th);
        g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(tx + 2, sy - th + 2, 2, th - 4); }
    }
    // barra con cafetera
    g.fillStyle = "#4a2a16"; g.fillRect(ex0, ey1 - 52, ex1 - ex0, 52);
    g.fillStyle = "#6e4426"; g.fillRect(ex0, ey1 - 56, ex1 - ex0, 6);
    const cx = 168, cy = ey1 - 56;
    const gc = g.createLinearGradient(cx - 50, 0, cx + 50, 0); gc.addColorStop(0, "#8d949c"); gc.addColorStop(0.4, "#eef2f5"); gc.addColorStop(1, "#6c737b");
    g.fillStyle = gc; g.strokeStyle = "#1c1c20"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(cx - 48, cy); g.lineTo(cx - 44, cy - 52); g.quadraticCurveTo(cx, cy - 66, cx + 44, cy - 52); g.lineTo(cx + 48, cy); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#c9a640"; g.beginPath(); g.ellipse(cx, cy - 62, 12, 5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#2a2a2e"; for (const dx of [-22, 22]) { g.fillRect(cx + dx - 6, cy - 22, 12, 10); }
    g.restore();
    // reflejos en el cristal y marco
    g.fillStyle = "rgba(255,255,255,0.13)";
    g.beginPath(); g.moveTo(ex0 + 30, ey0); g.lineTo(ex0 + 110, ey0); g.lineTo(ex0 + 20, ey1); g.lineTo(ex0 - 60 + 30, ey1); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(ex0 + 210, ey0); g.lineTo(ex0 + 240, ey0); g.lineTo(ex0 + 150, ey1); g.lineTo(ex0 + 120, ey1); g.closePath(); g.fill();
    g.strokeStyle = "#173328"; g.lineWidth = 6; g.strokeRect(ex0, ey0, ex1 - ex0, ey1 - ey0);
    g.beginPath(); g.moveTo((ex0 + ex1) / 2, ey0); g.lineTo((ex0 + ex1) / 2, ey1); g.stroke();
    g.fillStyle = "#1e3f31"; g.fillRect(ex0 - 22, ey1 + 12, ex1 - ex0 + 44, 10);
    // jardinera con geranios bajo el escaparate
    g.fillStyle = "#9c5a34"; g.fillRect(ex0 - 6, ey1 + 22, ex1 - ex0 + 12, 22); g.strokeStyle = TINTA; g.lineWidth = 2; g.strokeRect(ex0 - 6, ey1 + 22, ex1 - ex0 + 12, 22);
    for (let i = 0; i < 26; i++) { const fx = ex0 + 6 + i * 15.5, fy = ey1 + 20 - 10 * hash(i + 70);
      g.fillStyle = "#3f7a3a"; g.beginPath(); g.ellipse(fx, fy + 4, 9, 6, 0, 0, Math.PI * 2); g.fill();
      if (i % 2 === 0) { g.fillStyle = hash(i) > 0.4 ? "#e23b3b" : "#f06a8a"; for (let j = 0; j < 4; j++) { g.beginPath(); g.arc(fx - 4 + 8 * hash(i * 7 + j), fy - 3 - 6 * hash(i * 5 + j), 3.4, 0, Math.PI * 2); g.fill(); } } }
    // puerta del café a la derecha (verde, con cristal y cortinilla)
    const px = 760, pw = 120, pt = 112;
    g.fillStyle = "#234a3a"; g.fillRect(px - 10, pt - 10, pw + 20, PARED - pt + 10);
    g.fillStyle = "#2f6650"; g.fillRect(px, pt, pw, PARED - pt);
    g.fillStyle = "#4a2c18"; g.fillRect(px + 14, pt + 14, pw - 28, 140);
    const hl2 = g.createRadialGradient(px + pw / 2, pt + 60, 4, px + pw / 2, pt + 60, 90); hl2.addColorStop(0, "rgba(255,200,120,0.5)"); hl2.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = hl2; g.fillRect(px + 14, pt + 14, pw - 28, 140);
    g.fillStyle = "#f2ead8"; g.beginPath(); g.moveTo(px + 14, pt + 14); g.lineTo(px + pw - 14, pt + 14); g.lineTo(px + pw - 14, pt + 50); g.quadraticCurveTo(px + pw / 2, pt + 70, px + 14, pt + 50); g.closePath(); g.fill();
    g.strokeStyle = "#173328"; g.lineWidth = 4; g.strokeRect(px + 14, pt + 14, pw - 28, 140); g.strokeRect(px + 14, pt + 170, pw - 28, PARED - pt - 186);
    g.fillStyle = "#c9a640"; g.beginPath(); g.arc(px + pw - 22, pt + 168, 5, 0, Math.PI * 2); g.fill();
    // farol de pared
    const fx = 700, fy = 150;
    g.strokeStyle = "#1c1c20"; g.lineWidth = 4; g.beginPath(); g.moveTo(fx + 30, fy - 20); g.quadraticCurveTo(fx + 10, fy - 30, fx, fy - 12); g.stroke();
    g.fillStyle = "#2a2a2e"; g.beginPath(); g.moveTo(fx - 14, fy - 10); g.lineTo(fx + 14, fy - 10); g.lineTo(fx + 10, fy - 18); g.lineTo(fx - 10, fy - 18); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,240,200,0.85)"; g.fillRect(fx - 11, fy - 10, 22, 30); g.strokeStyle = "#1c1c20"; g.lineWidth = 2.5; g.strokeRect(fx - 11, fy - 10, 22, 30);
    g.beginPath(); g.moveTo(fx, fy - 10); g.lineTo(fx, fy + 20); g.stroke();
    g.fillStyle = "#2a2a2e"; g.fillRect(fx - 13, fy + 20, 26, 5);
    // pizarra de caballete con dibujos de tiza (sin letras)
    const bx = 950, by = PARED + 10;
    g.fillStyle = "#6b4422"; g.strokeStyle = TINTA; g.lineWidth = 2;
    g.beginPath(); g.moveTo(bx - 40, by + 110); g.lineTo(bx - 30, by - 60); g.lineTo(bx - 22, by - 60); g.lineTo(bx - 30, by + 110); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(bx + 40, by + 110); g.lineTo(bx + 30, by - 60); g.lineTo(bx + 22, by - 60); g.lineTo(bx + 30, by + 110); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#8a5a2e"; g.fillRect(bx - 42, by - 70, 84, 120); g.strokeRect(bx - 42, by - 70, 84, 120);
    g.fillStyle = "#2c3430"; g.fillRect(bx - 35, by - 63, 70, 106);
    g.strokeStyle = "rgba(245,245,235,0.85)"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(bx - 14, by - 30); g.lineTo(bx - 12, by - 12); g.lineTo(bx + 8, by - 12); g.lineTo(bx + 10, by - 30); g.closePath(); g.stroke();
    g.beginPath(); g.arc(bx + 13, by - 22, 5, -1.4, 1.4); g.stroke();
    for (const dx of [-6, 2]) { g.beginPath(); g.moveTo(bx + dx, by - 36); g.quadraticCurveTo(bx + dx + 4, by - 42, bx + dx, by - 48); g.stroke(); }
    g.beginPath(); g.moveTo(bx - 22, by + 20); g.quadraticCurveTo(bx, by + 2, bx + 22, by + 20); g.quadraticCurveTo(bx, by + 12, bx - 22, by + 20); g.stroke();
    for (const dx of [-10, 0, 10]) { g.beginPath(); g.moveTo(bx + dx, by + 11 - Math.abs(dx) * 0.3); g.lineTo(bx + dx + 3, by + 17); g.stroke(); }
    g.strokeStyle = "rgba(240,180,180,0.8)"; g.beginPath(); g.moveTo(bx - 24, by + 32); g.lineTo(bx + 24, by + 32); g.stroke();
    // toldo de rayas verdes y crema con faldón ondulado
    const ay0 = -50, ay1 = 66;
    for (let i = 0; i < 26; i++) {
      const x0 = -60 + i * 46;
      g.fillStyle = i % 2 ? "#f4ecd6" : "#2f7350";
      g.beginPath(); g.moveTo(x0, ay0); g.lineTo(x0 + 46, ay0); g.lineTo(x0 + 46, ay1); g.quadraticCurveTo(x0 + 23, ay1 + 20, x0, ay1); g.closePath(); g.fill();
    }
    g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(-60, ay0, W + 120, 30);
    g.strokeStyle = TINTA; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-60, ay1);
    for (let i = 0; i < 26; i++) { const x0 = -60 + i * 46; g.quadraticCurveTo(x0 + 23, ay1 + 20, x0 + 46, ay1); } g.stroke();
    // sombra del toldo en la pared
    const gs = g.createLinearGradient(0, ay1, 0, ay1 + 60); gs.addColorStop(0, "rgba(90,60,30,0.28)"); gs.addColorStop(1, "rgba(90,60,30,0)");
    g.fillStyle = gs; g.fillRect(-60, ay1, W + 120, 60);
    // suelo de baldosas de terraza en perspectiva
    const gp = g.createLinearGradient(0, PARED, 0, H + 50); gp.addColorStop(0, "#c98e66"); gp.addColorStop(1, "#e2b08a");
    g.fillStyle = gp; g.fillRect(-60, PARED, W + 120, H + 50 - PARED);
    g.strokeStyle = "rgba(120,70,40,0.35)"; g.lineWidth = 1.6;
    for (let i = -12; i <= 14; i++) { g.beginPath(); g.moveTo(512 + i * 60, PARED); g.lineTo(512 + i * 120, H + 50); g.stroke(); }
    let yy = PARED; for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(-60, yy); g.lineTo(W + 60, yy); g.stroke(); yy += 14 + k * 9; }
    g.fillStyle = "rgba(120,70,40,0.6)"; g.fillRect(-60, PARED - 2, W + 120, 3);
    // sol de la mañana: rayos en diagonal y brillo cálido
    g.save(); g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 5; i++) {
      const x0 = -40 + i * 170 + 40 * hash(i), w = 40 + 30 * hash(i + 9);
      const gr = g.createLinearGradient(x0, -50, x0 + 300, H); gr.addColorStop(0, "rgba(255,230,170,0.16)"); gr.addColorStop(1, "rgba(255,230,170,0)");
      g.fillStyle = gr; g.beginPath(); g.moveTo(x0, -50); g.lineTo(x0 + w, -50); g.lineTo(x0 + w + 360, H + 50); g.lineTo(x0 + 360, H + 50); g.closePath(); g.fill();
    }
    g.restore();
    const gsol = g.createRadialGradient(80, 40, 10, 80, 40, 700); gsol.addColorStop(0, "rgba(255,236,190,0.35)"); gsol.addColorStop(1, "rgba(255,236,190,0)");
    g.fillStyle = gsol; g.fillRect(-60, -50, W + 120, H + 100);
    return c;
  }

  /* =====================================================================================
   * EFECTOS
   * ===================================================================================== */
  let BASE_M = null;
  // pinta en coordenadas de pantalla (con la cámara) aunque se llame desde dentro de una mano
  function conCamara(g, f) { g.save(); g.setTransform(BASE_M); f(); g.restore(); }
  function vapor(g, t, c, k) {
    if (k <= 0.01) return;
    const s = SUP(c);
    g.save(); g.lineCap = "round"; g.lineWidth = 2.4;
    for (let i = 0; i < 2; i++) {
      const ph = (t * 0.45 + i * 0.5 + c.x * 0.01) % 1;
      g.strokeStyle = `rgba(255,255,255,${0.42 * Math.sin(Math.PI * ph) * k})`;
      g.beginPath();
      for (let j = 0; j <= 10; j++) { const u = j / 10, y = s.y - 6 - u * 38 - ph * 14, x = s.x - 4 + i * 8 + 5 * Math.sin(u * 5 + t * 2.2 + i * 2) * u; if (j) g.lineTo(x, y); else g.moveTo(x, y); }
      g.stroke();
    }
    g.restore();
  }
  function corazones(g, t, pB) {
    const k = dentro(t, T.bMuerde + 0.15, T.bMuerde + 0.3, T.bDeja - 0.3, T.bDeja); if (k <= 0.01) return;
    const c = enPant(B, pB, B.cabeza(pB).a({ x: 700, y: 330 }));
    g.save();
    for (let i = 0; i < 3; i++) {
      const ph = ((t - T.bMuerde) * 0.75 + i / 3) % 1, x = c.x - 30 + i * 26 + 8 * Math.sin(ph * 6 + i), y = c.y - 10 - ph * 70, r = 6 + 2 * Math.sin(ph * Math.PI);
      g.globalAlpha = k * Math.sin(Math.PI * ph);
      g.beginPath(); g.moveTo(x, y + r * 0.9); g.bezierCurveTo(x - r * 1.4, y - r * 0.2, x - r * 0.6, y - r * 1.3, x, y - r * 0.4); g.bezierCurveTo(x + r * 0.6, y - r * 1.3, x + r * 1.4, y - r * 0.2, x, y + r * 0.9);
      g.fillStyle = "#ec4b5f"; g.fill(); g.lineWidth = 1.8; g.strokeStyle = TINTA; g.stroke();
    }
    g.restore();
  }
  // migas que saltan en un mordisco: desde la boca, en arco, y se quedan un rato
  function migas(g, t, t0, o, dirx, n) {
    const u = t - t0; if (u <= 0 || u > 1.2) return;
    g.save(); g.fillStyle = "#e9b35a"; g.strokeStyle = "#6b3a12"; g.lineWidth = 0.8;
    for (let i = 0; i < n; i++) {
      const vx = dirx * (30 + 60 * hash(i + t0 * 7)), vy = -60 - 70 * hash(i + 3 + t0 * 5), tt = Math.min(u, 0.6);
      const x = o.x + vx * tt, y = o.y + vy * tt + 0.5 * 900 * tt * tt;
      g.globalAlpha = 1 - fase(u, 0.6, 1.2); const r = 1.4 + 1.6 * hash(i + 9);
      g.beginPath(); g.ellipse(x, y, r * 1.3, r, hash(i) * 3, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    g.restore();
  }
  // gotas que caen de lo empapado a la taza
  function goteo(g, t, cr, desde, hasta, n, c) {
    if (!cr || t < desde || t > hasta + 0.4) return;
    const tip = puntaCr(cr), s = SUP(c);
    g.save(); g.fillStyle = "#5b2f13";
    for (let i = 0; i < n; i++) {
      const t0 = desde + (hasta - desde) * (i + 0.3) / n, u = t - t0;
      if (u < -0.15) continue;
      if (u < 0) { const r = 2.2 * (1 + u / 0.15); g.beginPath(); g.ellipse(tip.x, tip.y + r * 0.6, r, r * 1.3, 0, 0, Math.PI * 2); g.fill(); continue; }
      const y = tip.y + 0.5 * 1400 * u * u; if (y > s.y) continue;
      g.beginPath(); g.ellipse(tip.x, y, 2, 2.8, 0, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  function burbujas(g, t, c) {
    const k = dentro(t, T.gDentro + 0.15, T.gDentro + 0.4, T.gSaca - 0.05, T.gSaca + 0.05); if (k <= 0.01) return;
    const s = SUP(c);
    g.save(); g.strokeStyle = "#3a1a08"; g.lineWidth = 1.2; g.fillStyle = "#c08850";
    for (let i = 0; i < 5; i++) {
      const ph = ((t - T.gDentro) * 1.8 + i * 0.37) % 1, x = s.x - 7 + (i * 3.7) % 14, r = 1.5 + 2.4 * ph;
      if (ph > 0.85) continue;
      g.globalAlpha = k; g.beginPath(); g.arc(x, s.y - r * 0.6, r, Math.PI, Math.PI * 2); g.closePath(); g.fill(); g.stroke();
    }
    g.restore();
  }
  // anillo en el café donde entra algo
  function onda(g, t, c, t0, t1) {
    const k = dentro(t, t0, t0 + 0.1, t1, t1 + 0.25); if (k <= 0.01) return;
    const s = SUP(c);
    g.save(); g.strokeStyle = `rgba(230,180,120,${0.8 * k})`; g.lineWidth = 1.2;
    for (let i = 0; i < 2; i++) { const ph = ((t - t0) * 1.5 + i * 0.5) % 1; g.globalAlpha = k * (1 - ph); g.beginPath(); g.ellipse(s.x, s.y, 3 + 8 * ph, 1 + 2 * ph, 0, 0, Math.PI * 2); g.stroke(); }
    g.restore();
  }
  // ¡plof!: corona de café y gotas que vuelan a la cara de Guillermo
  function salpicadura(g, t, pG) {
    const u = t - T_PLOF; if (u < 0 || u > 1.0) return;
    const s = SUP(TAZA_G);
    g.save(); g.lineJoin = "round";
    // corona
    const kc = fase(u, 0, 0.45), alto = 22 * Math.sin(Math.PI * Math.min(1, kc * 1.1));
    if (kc < 1) {
      g.fillStyle = "#5b2f13"; g.strokeStyle = TINTA; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(s.x - 12, s.y);
      for (let i = 0; i <= 8; i++) { const x = s.x - 12 + i * 3, h = alto * (0.55 + 0.45 * Math.sin(i * 1.7 + 0.4)) * (i % 2 ? 1 : 0.55); g.lineTo(x, s.y - h); }
      g.lineTo(s.x + 12, s.y); g.closePath(); g.fill(); g.stroke();
    }
    // gotas que saltan de la corona en parábola y vuelven a caer en la taza o en el plato
    for (let i = 0; i < 6; i++) {
      const vx = (i - 2.5) * 34 * (0.8 + 0.4 * hash(i + 40)), vy = -150 - 70 * hash(i + 41), tt = u - 0.03 * hash(i + 42);
      if (tt <= 0) continue;
      const x = s.x + (i - 2.5) * 3 + vx * tt, y = s.y - 8 + vy * tt + 0.5 * 1500 * tt * tt;
      if (y > s.y + 14 || tt > 0.4) continue;
      const vyy = vy + 1500 * tt, an = Math.atan2(vyy, vx) - Math.PI / 2;
      g.save(); g.translate(x, y); g.rotate(an); g.fillStyle = "#5b2f13";
      g.beginPath(); g.moveTo(0, -4.5); g.quadraticCurveTo(2.6, 0.5, 0, 2.6); g.quadraticCurveTo(-2.6, 0.5, 0, -4.5); g.fill(); g.restore();
    }
    // gotas hacia la cara (vuelan hasta las manchas)
    const kv = fase(t, T.plof + 0.02, T.salpica);
    if (kv > 0 && kv < 1) {
      const H = G.cabeza(pG);
      MANCHAS.slice(0, 4).forEach(([mx, my], i) => {
        const fin = enPant(G, pG, H.a({ x: mx, y: my })), x = lerp(s.x - 4 + i * 2, fin.x, kv), y = lerp(s.y - 10, fin.y, kv) - 46 * Math.sin(Math.PI * kv);
        g.fillStyle = "#5b2f13"; g.beginPath(); g.ellipse(x, y, 3.2, 4.2, Math.atan2(fin.y - s.y, fin.x - s.x), 0, Math.PI * 2); g.fill();
      });
    }
    g.restore();
  }
  function trozoQueCae(g, t) {
    const e = estadoPieza(t); if (!e || e.hundido) return;
    const P = pieza();
    g.save(); g.translate(P.cx + e.dx, P.cy + e.dy); g.rotate(e.r); g.translate(-P.cx, -P.cy);
    dibTramo(g, P.Gm, P.a, P.b); caraCorte(g, P.Gm, P.a, true, -1);
    g.restore();
  }
  // vapor que sale de los dedos quemados + rayitas de temblor
  function dedosQuemados(g, t, pG) {
    const k = dentro(t, T.quema, T.quema + 0.08, T.gSoplaFin - 0.2, T.gSoplaFin + 0.1); if (k <= 0.01) return;
    const m = pG.manoLejos, c = enPant(G, pG, m);
    g.save(); g.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const ph = (t * 1.6 + i / 3) % 1; g.strokeStyle = `rgba(255,255,255,${0.75 * k * Math.sin(Math.PI * ph)})`; g.lineWidth = 2.2;
      g.beginPath(); for (let j = 0; j <= 6; j++) { const u = j / 6, x = c.x - 6 + i * 6 + 3 * Math.sin(u * 6 + t * 5 + i), y = c.y - 18 - u * 26 - ph * 12; if (j) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke();
    }
    const tb = dentro(t, T.quema + 0.05, T.quema + 0.1, T.gSopla - 0.05, T.gSopla + 0.1);
    if (tb > 0.01) { g.strokeStyle = `rgba(20,16,20,${0.8 * tb})`; g.lineWidth = 2;
      for (const sg of [-1, 1]) for (let i = 0; i < 2; i++) { g.beginPath(); g.moveTo(c.x + sg * (16 + i * 5), c.y - 6 + i * 8); g.lineTo(c.x + sg * (21 + i * 5), c.y - 10 + i * 8); g.stroke(); } }
    g.restore();
  }
  function soplido(g, t, pG) {
    const k = dentro(t, T.gSopla + 0.05, T.gSopla + 0.12, T.gSoplaFin - 0.12, T.gSoplaFin); if (k <= 0.01) return;
    const b = bocaPant(G, pG), m = enPant(G, pG, pG.manoLejos);
    g.save(); g.lineCap = "round"; g.strokeStyle = `rgba(255,255,255,${0.9 * k})`; g.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const ph = (t * 3.2 + i / 3) % 1, x0 = lerp(b.x + 6, m.x, ph * 0.7), y0 = lerp(b.y, m.y - 12, ph * 0.7) + (i - 1) * 4;
      g.globalAlpha = Math.sin(Math.PI * ph); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + 8, y0 - 1.5 + (i - 1) * 1.5); g.stroke();
    }
    g.restore();
  }
  function lineasSusto(g, t, pG) {
    const k = campana(t, T.estira + 0.02, T.rompe + 0.25); if (k <= 0.01) return;
    const c = enPant(G, pG, G.cabeza(pG).a({ x: 760, y: 360 }));
    g.save(); g.strokeStyle = `rgba(20,16,20,${0.85 * k})`; g.lineWidth = 2.6; g.lineCap = "round";
    for (let i = -2; i <= 2; i++) { const a = -Math.PI / 2 + i * 0.32; g.beginPath(); g.moveTo(c.x + Math.cos(a) * 56, c.y + Math.sin(a) * 50); g.lineTo(c.x + Math.cos(a) * 70, c.y + Math.sin(a) * 63); g.stroke(); }
    g.restore();
  }

  /* ---------- cámara ---------- */
  // plano base algo cerrado (la acción es pequeña: tazas y cruasanes) y dos acercamientos suaves
  function camara(t) {
    const a = tramo(t, 4.7, 5.5) * (1 - tramo(t, 9.3, 10.3)), b = tramo(t, 11.6, 12.5);
    const k = 1.15 + 0.12 * a + 0.1 * b;
    return { k, x: 512 - 40 * a - 50 * b, y: 322 + 8 * a + 6 * b };
  }

  function poses(t) { return { g: poseG(t), b: poseB(t) }; }

  class ElCroissant extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !B.listo()) return;
      if (!fondo) fondo = creaFondo();
      const pB = poseB(t), pG = poseG(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      BASE_M = g.getTransform();
      g.drawImage(fondo, -60, -50);
      // sillas, mesa y lo que hay encima
      silla(g, XG - 4, 1); silla(g, XB + 4, -1);
      mesa(g);
      jarron(g, t);
      cesta(g, t, t < T.bCogeN);
      plato(g, PLATO_G); plato(g, PLATO_B);
      taza(g, TAZA_G, t); taza(g, TAZA_B, t);
      // cruasanes en los platos
      if (t < T.bCoge || t >= T.bDejado - 0.1) dibCroissant(g, Object.assign({}, CR_PLATO_B, { mord: t >= T.bMuerde ? MORD_B : 0 }));
      if (t < T.gCoge) dibCroissant(g, CR_PLATO_G);
      else if (t >= T.gSuelta) dibCroissant(g, Object.assign({}, CR_PLATO_G, { moja: 0.7, cae: 0.25, corta: true, cv: 1 }));
      vapor(g, t, TAZA_G, 1 - 0.7 * dentro(t, T.gBaja, T.gDentro, T.gHoriz, T.gHoriz + 0.5)); vapor(g, t, TAZA_B, 1);
      // personajes
      B.dibujar(g, pB, t);
      G.dibujar(g, pG, t);
      // lo que entra en el café queda dentro: el trozo que cae y el frente de las tazas
      trozoQueCae(g, t);
      // (solo mientras algo entra en esa taza: si no, el brazo que pasa por encima quedaría detrás)
      if (t >= T.bBaja && t <= T.bSaca + 0.3) frenteTaza(g, TAZA_B, t);
      if ((t >= T.gBaja && t <= T_PLOF + 0.7) || (t >= T.gPesca && t <= T.quema + 0.15)) frenteTaza(g, TAZA_G, t);
      onda(g, t, TAZA_B, T.bDentro, T.bSaca); onda(g, t, TAZA_G, T.gDentro, T.gSaca); onda(g, t, TAZA_G, T_PLOF, T_PLOF + 0.6);
      onda(g, t, TAZA_G, T.gMete, T.quema);
      burbujas(g, t, TAZA_G);
      // efectos
      goteo(g, t, pB.crB, T.bSaca + 0.05, T.bBoca - 0.05, 2, TAZA_B);
      goteo(g, t, pG.cr && t < T.rompe ? Object.assign({}, pG.cr) : null, T.gFuera + 0.05, T.rompe - 0.1, 3, TAZA_G);
      salpicadura(g, t, pG);
      lineasSusto(g, t, pG);
      corazones(g, t, pB);
      migas(g, t, T.bMuerde, bocaPant(B, pB), 1, 7);
      migas(g, t, T.gBocado, bocaPant(G, pG), -1, 10);
      dedosQuemados(g, t, pG);
      soplido(g, t, pG);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00072", nombre: "Guillermo y Gabacho · El cruasán", crear: () => new ElCroissant() });
  window.__A2D_00072 = { pose: poses, poseG, poseB, T, DUR, T_PLOF };
})();
