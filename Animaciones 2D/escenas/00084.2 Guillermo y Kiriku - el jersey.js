"use strict";
/* 00084.2 · Guillermo y Kiriku · El jersey
 *
 * Negro → césped de un club náutico a media mañana: cielo limpio, el mar con veleros y un faro en el
 * cabo, una valla blanca con hortensias, un salvavidas colgado, dos tumbonas de rayas, una mesita con
 * limonada y el mástil con un gallardete liso que ondea. Kiriku posa mirando al mar, barbilla arriba,
 * con su jersey anudado sobre los hombros y otro de repuesto, rosa salmón, doblado sobre la palma como
 * un camarero. Guillermo lo estudia con el puño en la barbilla, le rodea por detrás y se planta
 * delante: se inclina, asiente impresionado, señala el nudo y se da en el pecho: «yo quiero». Kiriku
 * se lo ofrece con una pequeña reverencia; Guillermo lo coge por los extremos y al alzarlo se
 * despliega → lo lanza al aire, le cae sobre los hombros y las mangas le caen por delante → cruza los
 * puños, tira con todas sus fuerzas… y el nudo sale disparado hasta el cuello: se ahoga (rojo, ojos
 * fuera, lengua) → lo afloja de un tirón y respira → segundo intento: abre los brazos, da un latigazo
 * con las mangas y se queda atado con los brazos pegados al cuerpo; forcejea, gira… y acaba envuelto
 * como un paquete, con el jersey por la cabeza y solo los pinchos del pelo asomando por el cuello →
 * da saltitos a ciegas hasta chocar con la palma de Kiriku, que, sin inmutarse, pellizca la manga que
 * cuelga y de un tirón elegante desenrolla el paquete: Guillermo gira como una peonza y el jersey
 * vuela hasta el antebrazo de Kiriku → con un golpe de muñeca se lo devuelve por encima de la cabeza,
 * le cae en los hombros y le hace un nudo perfecto con una sola mano (destello) → Guillermo,
 * encantado, posa como Kiriku, manos en los bolsillos y barbilla arriba… y el jersey se le escurre
 * por el hombro y cae al césped → Guillermo mira el montón y luego a cámara; Kiriku cierra los ojos,
 * niega despacio con la cabeza y mira a cámara con una ceja levantada → negro.
 *
 * El jersey es siempre la misma prenda: cuerpo (cuatro esquinas) y dos mangas de seis puntos que se
 * dibujan como tubos de punto con su puño acanalado. Sus estados (doblado, en las manos, en el aire,
 * sobre los hombros, anudado, al cuello, atando los brazos, paquete, en el antebrazo, montón) se
 * calculan en la hoja del torso de Guillermo o en el mundo y se mezclan punto a punto; cada parte va
 * en su capa (detrás de Guillermo, sobre su torso, en su mano, encima de él, en la mano de Kiriku o
 * encima de todo). Los giros son aplastados en 2D, sin vueltas completas. Todo depende del tiempo
 * absoluto `t`.
 */
(() => {
  const { clamp, lerp, fase, suave, salida, entrada, tramo, campana, ruido, hash } = M2;
  const G = Guillermo, KR = Kiriku;
  const S = 0.3, SUELO = 560, DUR = 15.0;
  const XG0 = 280, XG1 = 600, XK0 = 430, XK1 = 452;
  const T = {
    anda0: 1.0, anda1: 2.55, gira0: 2.55, gira1: 2.8,
    mira0: 2.8, mira1: 3.1, asiente0: 3.12, asiente1: 3.48,
    senala0: 3.5, senala1: 3.68, pecho0: 3.74, pecho1: 3.92,
    ofrece0: 3.9, ofrece1: 4.28, coge0: 4.12, coge1: 4.36, suelta: 4.44,
    alza1: 4.85, retiraK1: 4.98,
    admira1: 5.12, carga0: 5.12, lanza: 5.3, posa: 5.8,
    cogePunos0: 5.9, cogePunos1: 6.06, cruza1: 6.27, tiron: 6.36, ahoga: 6.48, ahoga1: 7.16,
    afloja0: 7.16, afloja1: 7.36, respira0: 7.36,
    agarra0: 7.58, agarra1: 7.72, abre1: 7.86, envuelve1: 8.0, vuelta0: 8.36, vuelta1: 8.68,
    pasoK0: 8.9, pasoK1: 9.3, palma0: 9.14, palma1: 9.44, choca: 9.6,
    pellizca0: 9.76, pellizca1: 9.98, tiron2: 10.04, desenrolla1: 10.62,
    cae2: 10.42, preparaK0: 10.92, lanzaK: 11.2, posaK: 11.55,
    tambalea0: 11.5, tambalea1: 11.86, nudo0: 11.8, nudo1: 12.06, retiraK2: 12.14, retiraK3: 12.48,
    despierta: 12.14, orgullo0: 12.5, orgullo1: 12.78,
    resbala0: 12.9, desata1: 13.06, resbala1: 13.42, caida1: 13.66,
    mirasuelo: 13.74, camara: 14.06, narizK0: 13.76, narizK1: 14.04,
    fin: 14.32
  };
  T.vueltaSwap = T.vuelta0 + 0.25 * (T.vuelta1 - T.vuelta0);                    // canto del primer cuarto de vuelta
  const giroDes = t => 1 - Math.pow(1 - fase(t, T.tiron2, T.desenrolla1), 2);    // dos vueltas, frenando
  T.desSwap = T.tiron2 + (1 - Math.sqrt(1 - 0.125)) * (T.desenrolla1 - T.tiron2);

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
  const P = (x, y) => ({ x, y });
  const lerpP = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });
  const lerpL = (A, B, k) => A.map((q, i) => lerpP(q, B[i], k));
  const muelle = k => k <= 0 ? 0 : 1 - Math.exp(-6 * k) * Math.cos(9 * k);       // llega con un rebote
  let MATRIZ = null;

  // hoja de un personaje ↔ mundo (antes de la cámara), con su orientación p.o (−1 … 1; los giros aplastan)
  const aW = (Rg, p, q) => ({ x: p.x + (q.x - Rg.PELVIS.x) * p.s * Rg.K * p.o, y: p.suelo + (q.y - Rg.SUELO) * p.s * Rg.K });
  const aS = (Rg, p, w) => ({ x: Rg.PELVIS.x + (w.x - p.x) / (p.s * Rg.K * p.o), y: Rg.SUELO + (w.y - p.suelo) / (p.s * Rg.K) });
  // hoja del torso (sin inclinar) ↔ hoja del personaje
  function deTronco(Rg, p, q) {
    const c = Math.cos(-p.torso), s = Math.sin(-p.torso), dx = q.x - p.pelvis.x, dy = q.y - p.pelvis.y;
    return { x: Rg.PELVIS.x + (dx * c - dy * s) / p.torsoEsc.x, y: Rg.PELVIS.y + (dx * s + dy * c) / p.torsoEsc.y };
  }
  // afín: hoja del torso → mundo (la misma que usa el personaje al dibujar el torso)
  function matTronco(Rg, p) {
    const k = p.s * Rg.K;
    return new DOMMatrix().translate(p.x, p.suelo).scale(k * p.o, k).translate(-Rg.PELVIS.x, -Rg.SUELO)
      .translate(p.pelvis.x, p.pelvis.y).rotate(p.torso * 180 / Math.PI).scale(p.torsoEsc.x, p.torsoEsc.y).translate(-Rg.PELVIS.x, -Rg.PELVIS.y);
  }
  const porMatriz = (M, q) => { const r = M.transformPoint(new DOMPoint(q.x, q.y)); return { x: r.x, y: r.y }; };

  /* ---------- manos ---------- */
  const offMano = (m, q) => { const r = rota(q, m.mu + Math.PI / 2); return rota({ x: r.x * G.JK, y: r.y * G.JK }, m.ang || 0); };
  const PINZA = { x: 6.2, y: 15.5 }, PALMA = { x: 0, y: 3 }, PUNO = { x: 0, y: 0 };
  const ptHoja = (m, q) => { const o = offMano(m, q); return { x: m.x + o.x, y: m.y + o.y }; };
  const R_M = G.MUNECA_R * G.JK;
  const punoDesde = (m, mu) => ({ x: m.x - Math.cos(mu) * R_M, y: m.y - Math.sin(mu) * R_M });
  const BOLS_G = { c: punoDesde({ x: 131, y: 652 }, -1.75), l: punoDesde({ x: 372, y: 648 }, -1.75) };
  function resolutor(Rg, p, lado) {
    const Tr = Rg.tronco(p);
    return o => {
      if (o.bols) {
        let B; if (Rg === G) B = Tr(lado === "cerca" ? BOLS_G.c : BOLS_G.l); else { const m = Rg.manoReposo(p, lado); B = { x: m.x, y: m.y }; }
        return { x: B.x, y: B.y, mu: -1.75, ang: 0, puno: 0, dedos: o.dedos || D(0.4, 0.4, 0.4, 0.4), dobla: lado === "cerca" ? -1 : 1 };
      }
      const m = { mu: o.mu, ang: o.ang || 0 };
      let q;
      if (o.hoja) q = Tr(o.hoja);
      else { const h = o.abs ? o.abs() : aS(Rg, p, o.mundo()), f = offMano(m, o.ref || PINZA); q = { x: h.x - f.x, y: h.y - f.y }; }
      return { x: q.x, y: q.y, mu: o.mu, ang: m.ang, puno: o.puno ?? 1, dedos: o.dedos, dobla: o.dobla ?? (lado === "cerca" ? -1 : 1) };
    };
  }
  // Pista de una mano: [t0, t1, objetivo, curva]; cada objetivo se resuelve en la hoja en cada fotograma.
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
  const mano = c => ({ x: c.x, y: c.y, ang: c.ang, mu: c.mu, dobla: c.dobla, puno: c.puno, dedos: c.dedos });

  /* ---------- caras ---------- */
  const BASE = { mx: 0.85, my: 0, c: 0, cd: 0, ci: 0, h: 0, z: 0, iris: 1, sd: 0, gd: 0, si: 0, gi: 0, orig: 0, abre: 0, ancho: 1, sonr: 0.15, lengua: 0, mof: 0, rub: 0, esp: 0 };
  const E = o => Object.assign({}, BASE, o);
  function cara(e, parp) {
    return { mirada: { x: e.mx, y: e.my }, iris: e.iris, espiral: e.esp,
      ojos: { d: clamp(Math.max(e.c, e.cd, parp)), i: clamp(Math.max(e.c, e.ci, parp)), feliz: e.h, apretado: e.z },
      cejas: { d: { sube: e.sd, giro: e.gd }, i: { sube: e.si, giro: e.gi } },
      boca: { orig: e.orig, abre: Math.max(0, e.abre), ancho: e.ancho, sonrisa: e.sonr, dientes: true, lengua: e.lengua },
      mofletes: e.mof, rubor: e.rub, bigote: 0 };
  }

  /* ================= el jersey ================= */
  const ROSA = "#f2968b", ROSA_P = "#dd7c76", TINTA = "#1b0d10";
  const LW = 5, ANCHO_M = 62, ANCHO_P = 46, PUNO_L = 28;
  function catmull(Q, n) {
    const out = [];
    for (let i = 0; i < Q.length - 1; i++) {
      const a = Q[Math.max(0, i - 1)], b = Q[i], c = Q[i + 1], d = Q[Math.min(Q.length - 1, i + 2)];
      for (let k = 0; k < n; k++) {
        const u = k / n, u2 = u * u, u3 = u2 * u;
        out.push({ x: 0.5 * (2 * b.x + (c.x - a.x) * u + (2 * a.x - 5 * b.x + 4 * c.x - d.x) * u2 + (3 * b.x - a.x - 3 * c.x + d.x) * u3),
                   y: 0.5 * (2 * b.y + (c.y - a.y) * u + (2 * a.y - 5 * b.y + 4 * c.y - d.y) * u2 + (3 * b.y - a.y - 3 * c.y + d.y) * u3) });
      }
    }
    out.push(Q[Q.length - 1]);
    return out;
  }
  // Manga de punto a lo largo de Q (centro): ancho w0 → w1 y puño acanalado al final; unidades × u.
  function tubo(g, Q, o = {}) {
    const u = o.u ?? 1, w0 = (o.w0 ?? ANCHO_M) * u, w1 = (o.w1 ?? ANCHO_P) * u; let pl = (o.puno ?? PUNO_L) * u;
    const pts = catmull(Q, 5), q = [pts[0]], L = [0];
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i].x - q[q.length - 1].x, pts[i].y - q[q.length - 1].y); if (d > 0.04 * u) { q.push(pts[i]); L.push(L[L.length - 1] + d); } }
    if (q.length < 2) return;
    let tot = L[L.length - 1];
    const alc = clamp(o.alcance ?? 1);
    if (alc < 1) {
      const fin = tot * alc; let i = 1; while (i < L.length - 1 && L[i] < fin) i++;
      const f = (fin - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
      q.length = i + 1; L.length = i + 1; q[i] = lerpP(q[i - 1], q[i], f); L[i] = fin; tot = fin;
    }
    if (tot < 3 * u) return;
    pl = Math.min(pl, tot * 0.3);                                      // mangas cortas (doblándose): puño proporcional
    const n = q.length, izq = [], der = [], tg = [], wd = [];
    for (let i = 0; i < n; i++) {
      const a = q[Math.max(0, i - 1)], b = q[Math.min(n - 1, i + 1)];
      let tx = b.x - a.x, ty = b.y - a.y; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
      const s = L[i] / tot, enP = pl > 0 ? clamp((L[i] - (tot - pl)) / (5 * u)) : 0;
      const w = lerp(w0, w1, s) * (1 - 0.08 * enP) / 2;
      tg.push({ x: tx, y: ty }); wd.push(w);
      izq.push({ x: q[i].x - ty * w, y: q[i].y + tx * w }); der.push({ x: q[i].x + ty * w, y: q[i].y - tx * w });
    }
    const e = q[n - 1], te = tg[n - 1], we = wd[n - 1], r0 = q[0], t0 = tg[0], w0b = wd[0];
    const camino = () => {
      g.beginPath(); g.moveTo(izq[0].x, izq[0].y);
      for (let i = 1; i < n; i++) g.lineTo(izq[i].x, izq[i].y);
      g.quadraticCurveTo(e.x + te.x * we * 0.5, e.y + te.y * we * 0.5, der[n - 1].x, der[n - 1].y);
      for (let i = n - 2; i >= 0; i--) g.lineTo(der[i].x, der[i].y);
      if (o.raiz) g.quadraticCurveTo(r0.x - t0.x * w0b * 1.1, r0.y - t0.y * w0b * 1.1, izq[0].x, izq[0].y);
      g.closePath();
    };
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    camino(); g.fillStyle = o.color || ROSA; g.fill();
    g.save(); camino(); g.clip();
    // sombra en un lado y luz en el otro
    g.strokeStyle = "rgba(170,70,74,0.5)"; g.lineWidth = we * 0.9;
    g.beginPath(); for (let i = 0; i < n; i++) { const x = q[i].x + tg[i].y * wd[i] * 0.62, y = q[i].y - tg[i].x * wd[i] * 0.62; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    g.strokeStyle = "rgba(255,222,208,0.75)"; g.lineWidth = Math.max(1.2 * u, we * 0.28);
    g.beginPath(); for (let i = 0; i < n; i++) { const x = q[i].x - tg[i].y * wd[i] * 0.42, y = q[i].y + tg[i].x * wd[i] * 0.42; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    // punto: uves suaves a lo largo de la manga
    g.strokeStyle = "rgba(160,64,66,0.28)"; g.lineWidth = 1.6 * u; g.beginPath();
    for (let s = 10 * u, i = 0; s < tot - pl - 4 * u; s += 13 * u) {
      while (i < n - 2 && L[i + 1] < s) i++;
      const k = (s - L[i]) / Math.max(1e-6, L[i + 1] - L[i]), c = lerpP(q[i], q[i + 1], k), t1 = tg[i], w = wd[i] * 0.45;
      g.moveTo(c.x - t1.y * w - t1.x * 3 * u, c.y + t1.x * w - t1.y * 3 * u); g.lineTo(c.x, c.y); g.lineTo(c.x + t1.y * w - t1.x * 3 * u, c.y - t1.x * w - t1.y * 3 * u);
    }
    g.stroke();
    // puño acanalado
    if (pl > 0) {
      g.strokeStyle = "rgba(150,56,60,0.55)"; g.lineWidth = 1.5 * u; g.beginPath();
      let i = 0;
      for (let s = tot - pl; s < tot - 1 * u; s += 4.6 * u) {
        while (i < n - 2 && L[i + 1] < s) i++;
        const k = (s - L[i]) / Math.max(1e-6, L[i + 1] - L[i]), c = lerpP(q[i], q[i + 1], k), t1 = tg[i], w = wd[i];
        g.moveTo(c.x - t1.y * w, c.y + t1.x * w); g.lineTo(c.x + t1.y * w, c.y - t1.x * w);
      }
      g.stroke();
      // costura del puño
      let j = 0; const s0 = tot - pl; while (j < n - 2 && L[j + 1] < s0) j++;
      const k0 = (s0 - L[j]) / Math.max(1e-6, L[j + 1] - L[j]), c0 = lerpP(q[j], q[j + 1], k0), t1 = tg[j], w = wd[j];
      g.strokeStyle = TINTA; g.lineWidth = 2.2 * u; g.beginPath(); g.moveTo(c0.x - t1.y * w, c0.y + t1.x * w); g.lineTo(c0.x + t1.y * w, c0.y - t1.x * w); g.stroke();
    }
    g.restore();
    camino(); g.strokeStyle = TINTA; g.lineWidth = LW * u; g.stroke();
    g.restore();
  }
  // Cuerpo del jersey: Q = [arriba (lado de la manga A), arriba (lado B), abajo B, abajo A]; mapa bilineal.
  const bil = (Q, a, b) => { const t0 = lerpP(Q[0], Q[1], a), b0 = lerpP(Q[3], Q[2], a); return lerpP(t0, b0, b); };
  function cuerpo(g, Q, o = {}) {
    const u = o.u ?? 1, borde = [];
    const cuello = a => a > 0.32 && a < 0.68 ? 0.085 * Math.sin(Math.PI * (a - 0.32) / 0.36) : 0;
    for (let i = 0; i <= 12; i++) { const a = i / 12; borde.push(bil(Q, a, cuello(a))); }
    for (let i = 1; i <= 6; i++) { const b = i / 6; borde.push(bil(Q, 1 + 0.04 * Math.sin(Math.PI * b), b)); }
    for (let i = 11; i >= 0; i--) { const a = i / 12; borde.push(bil(Q, a, 1 + 0.012 * Math.sin(Math.PI * a))); }
    for (let i = 5; i >= 1; i--) { const b = i / 6; borde.push(bil(Q, -0.04 * Math.sin(Math.PI * b), b)); }
    const camino = () => { g.beginPath(); M2.curva(g, borde, true, 0.25); };
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    camino(); g.fillStyle = ROSA; g.fill();
    g.save(); camino(); g.clip();
    // sombra lateral y luz
    g.fillStyle = "rgba(170,70,74,0.42)"; g.beginPath(); M2.poligono(g, [bil(Q, 0.74, -0.1), bil(Q, 1.1, -0.1), bil(Q, 1.1, 1.1), bil(Q, 0.8, 1.1)]); g.fill();
    g.fillStyle = "rgba(255,222,208,0.45)"; g.beginPath(); M2.poligono(g, [bil(Q, -0.1, 0.1), bil(Q, 0.2, 0.08), bil(Q, 0.14, 0.7), bil(Q, -0.1, 0.8)]); g.fill();
    // canalé vertical
    g.strokeStyle = "rgba(160,64,66,0.22)"; g.lineWidth = 1.5 * u; g.beginPath();
    for (let a = 0.1; a < 0.95; a += 0.085) { const p0 = bil(Q, a, 0.14), p1 = bil(Q, a, 0.84); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); }
    g.stroke();
    // bajo acanalado
    g.fillStyle = ROSA_P; g.beginPath(); M2.poligono(g, [bil(Q, -0.1, 0.89), bil(Q, 1.1, 0.89), bil(Q, 1.1, 1.1), bil(Q, -0.1, 1.1)]); g.fill();
    g.strokeStyle = "rgba(140,50,54,0.55)"; g.lineWidth = 1.4 * u; g.beginPath();
    for (let a = 0.02; a < 1; a += 0.04) { const p0 = bil(Q, a, 0.9), p1 = bil(Q, a, 1.02); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); }
    g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 2.2 * u; g.beginPath(); { const p0 = bil(Q, -0.1, 0.89), p1 = bil(Q, 1.1, 0.89); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); } g.stroke();
    g.restore();
    // cuello acanalado
    const cue = []; for (let i = 0; i <= 8; i++) { const a = 0.32 + 0.36 * i / 8; cue.push(bil(Q, a, cuello(a) + 0.035)); }
    g.strokeStyle = ROSA_P; g.lineWidth = 14 * u; g.beginPath(); M2.curva(g, cue, false, 0.4); g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 2.2 * u; g.beginPath(); M2.curva(g, cue.map((q, i) => lerpP(q, bil(Q, 0.32 + 0.36 * i / 8, cuello(0.32 + 0.36 * i / 8) + 0.07), 1)), false, 0.4); g.stroke();
    camino(); g.strokeStyle = TINTA; g.lineWidth = LW * u; g.stroke();
    g.restore();
  }
  // nudo: bulto con dos vueltas
  function nudo(g, c, k, ang, u, oscuro) {
    if (k <= 0.01) return;
    g.save(); g.translate(c.x, c.y); g.rotate(ang); g.scale(k * u, k * u); g.lineJoin = "round"; g.lineCap = "round";
    const forma = () => { g.beginPath(); g.moveTo(-30, 2); g.bezierCurveTo(-31, -22, 26, -27, 31, -4); g.bezierCurveTo(34, 16, 4, 27, -14, 22); g.bezierCurveTo(-25, 19, -30, 12, -30, 2); g.closePath(); };
    forma(); g.fillStyle = oscuro ? "#f8aba0" : ROSA; g.fill();      // el de la soga, más claro: se lee sobre las mangas cruzadas
    g.save(); forma(); g.clip();
    g.fillStyle = "rgba(170,70,74,0.5)"; g.beginPath(); g.ellipse(10, 14, 30, 14, -0.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,222,208,0.7)"; g.beginPath(); g.ellipse(-10, -12, 13, 6, -0.4, 0, Math.PI * 2); g.fill();
    if (oscuro) {           // la vuelta que aprieta: una banda cruzada con su punto, como un nudo de bufanda
      g.fillStyle = ROSA_P; g.beginPath(); g.moveTo(-8, -30); g.quadraticCurveTo(4, -6, -2, 30); g.lineTo(14, 30); g.quadraticCurveTo(20, -6, 8, -30); g.closePath(); g.fill();
      g.strokeStyle = "rgba(150,56,60,0.55)"; g.lineWidth = 1.6; g.beginPath(); for (let y = -16; y < 24; y += 6) { g.moveTo(1 + y * 0.05, y); g.lineTo(13 + y * 0.05, y); } g.stroke();
      g.strokeStyle = TINTA; g.lineWidth = 2.6; g.beginPath(); g.moveTo(-8, -30); g.quadraticCurveTo(4, -6, -2, 30); g.moveTo(8, -30); g.quadraticCurveTo(20, -6, 14, 30); g.stroke();
    }
    g.restore();
    if (!oscuro) { g.strokeStyle = TINTA; g.lineWidth = 2.6; g.beginPath(); g.moveTo(-20, -13); g.bezierCurveTo(-4, -2, 6, 6, 22, 12); g.moveTo(-6, -22); g.quadraticCurveTo(4, -8, 2, 6); g.stroke(); }
    forma(); g.lineWidth = LW; g.stroke();
    g.restore();
  }
  // Dibuja un estado J { Q, A, B, nudo: {c, k, ang}, rollos, u } (las partes pedidas).
  function dibJ(g, J, partes = { cuerpo: 1, mangas: 1, nudo: 1, rollos: 1 }) {
    const u = J.u ?? 1;
    if (partes.cuerpo && J.Q) cuerpo(g, J.Q, { u });
    if (partes.mangas) {
      const orden = J.orden === "BA" ? [J.A, J.B] : [J.B, J.A];
      for (const M of orden) if (M) tubo(g, M, { u, w0: J.ancho ?? ANCHO_M, w1: J.anchoP ?? ANCHO_P, alcance: J.alcance ?? 1 });
    }
    if (partes.nudo && J.nudo) nudo(g, J.nudo.c, J.nudo.k, J.nudo.ang, u, J.nudo.oscuro);
    if (partes.rollos && J.rollos > 0.01) for (const R of (J.R || ROLLOS)) tubo(g, R, { u, w0: 52 * J.rollos, w1: 46 * J.rollos, puno: 0, raiz: true });
  }

  /* ---------- el jersey sobre Guillermo (hoja de su torso, mirando a +x: A = manga cercana) ---------- */
  const R_A = P(142, 294), R_B = P(326, 306);
  const ESPALDA = [P(150, 284), P(326, 296), P(322, 600), P(154, 592)];
  const ROLLOS = [[P(92, 336), P(106, 305), P(142, 288), P(190, 292)], [P(282, 294), P(318, 296), P(350, 312), P(368, 340)]];
  const ARRIBA = { A: [R_A, P(136, 244), P(130, 194), P(124, 144), P(118, 94), P(114, 48)],
                   B: [R_B, P(332, 256), P(336, 206), P(340, 156), P(342, 106), P(344, 60)] };
  const SUELTAS = { A: [R_A, P(154, 342), P(164, 392), P(174, 442), P(181, 492), P(186, 540)],
                    B: [R_B, P(320, 352), P(312, 400), P(305, 448), P(300, 496), P(296, 542)] };
  // el nudo de Kiriku: un poco hacia el lado que mira (hasta ahí llega su brazo sin juntar las cabezas)
  const ATADAS = { A: [R_A, P(190, 338), P(250, 380), P(300, 418), P(294, 462), P(286, 504)],
                   B: [R_B, P(330, 342), P(318, 382), P(304, 418), P(316, 462), P(324, 504)], n: P(302, 418) };
  const CUELLO = { A: [R_A, P(166, 294), P(218, 290), P(286, 289), P(298, 314), P(303, 340)],
                   B: [R_B, P(322, 302), P(304, 293), P(292, 291), P(316, 302), P(342, 315)], n: P(290, 291) };
  // la soga: las mangas dan la vuelta al cuello, se cruzan en un nudo bajo la barbilla y bajan tirantes hasta los puños
  const NUDO_C = P(254, 322), MANO_NA = P(-30, 470), MANO_NB = P(512, 474);
  function soga(hA, hB) {
    return { A: [R_A, P(180, 304), P(222, 322), NUDO_C, lerpP(NUDO_C, hA, 0.5), hA],
             B: [R_B, P(308, 306), P(284, 324), P(260, 334), lerpP(P(260, 334), hB, 0.5), hB] };
  }
  const ATADO = { A: [R_A, P(86, 362), P(104, 450), P(238, 470), P(246, 506), P(250, 544)],
                  B: [R_B, P(386, 378), P(364, 456), P(242, 472), P(236, 508), P(230, 546)], n: P(240, 471) };
  // manga que va de la raíz r al puño e (en la mano), colgando si sobra largo
  function mangaA(r, e, largo = 250) {
    const d = Math.hypot(e.x - r.x, e.y - r.y), sag = Math.max(0, largo - d) * 0.42;
    const M = []; for (let i = 0; i < 6; i++) { const k = i / 5; M.push({ x: lerp(r.x, e.x, k), y: lerp(r.y, e.y, k) + sag * Math.sin(Math.PI * k) }); }
    return M;
  }
  const meceM = (M, t, a, f = 0) => M.map((q, i) => i ? { x: q.x + a * (i / 5) * Math.sin(t * 3.3 + f + i * 0.4), y: q.y } : q);
  const tiemblaM = (M, t, a, f = 0) => M.map((q, i) => i ? { x: q.x + a * ruido(t * 31 + i * 3 + f), y: q.y + a * ruido(t * 29 + i * 5 + f + 9) } : q);

  // Estado sobre los hombros (hoja del torso) o null. Devuelve { A, B, nudo, rollos, encima (mangas encima de los brazos), slide }
  function sobreHombros(t, pG) {
    const enManos = () => ({ A: deTronco(G, pG, ptHoja(pG.manoCerca, PINZA)), B: deTronco(G, pG, ptHoja(pG.manoLejos, PINZA)) });
    const enPunos = () => ({ A: deTronco(G, pG, ptHoja(pG.manoCerca, PUNO)), B: deTronco(G, pG, ptHoja(pG.manoLejos, PUNO)) });
    const sueltas = () => ({ A: meceM(SUELTAS.A, t, 6, 0), B: meceM(SUELTAS.B, t, 6, 1.7) });
    let A, B, nudoJ = null, rollos = 1, encima = false, slide = 0, quita = 0;
    if (t >= T.posa && t < T.vueltaSwap) {
      if (t < T.cogePunos1) {
        const k = muelle(fase(t, T.posa, T.posa + 0.26)), s = sueltas();
        A = lerpL(ARRIBA.A, s.A, k); B = lerpL(ARRIBA.B, s.B, k); rollos = salida(fase(t, T.posa, T.posa + 0.16));
      } else if (t < T.tiron) {
        const m = enManos(); A = mangaA(R_A, m.A); B = mangaA(R_B, m.B); encima = true;
      } else if (t < T.ahoga) {
        const m = enManos(), mp = enPunos(), k = salida(fase(t, T.tiron, T.ahoga)), S0 = soga(mp.A, mp.B);
        A = lerpL(mangaA(R_A, m.A), S0.A, k); B = lerpL(mangaA(R_B, m.B), S0.B, k);
        nudoJ = { c: NUDO_C, k: 1.75 * k, ang: -0.2, oscuro: true };
      } else if (t < T.afloja0) {
        // tirantes y temblando; los extremos siguen en los puños
        const mp = enPunos(), S0 = soga(mp.A, mp.B), a = 1.6 * campana(t, T.ahoga, T.ahoga1 + 0.1);
        const tiembla = (M, f) => M.map((q, i) => i > 0 && i < 5 ? P(q.x + a * ruido(t * 31 + i * 3 + f), q.y + a * ruido(t * 29 + i * 5 + f + 9)) : q);
        A = tiembla(S0.A, 0); B = tiembla(S0.B, 4); nudoJ = { c: NUDO_C, k: 1.68 + 0.08 * Math.sin(t * 30), ang: -0.2, oscuro: true };
      } else if (t < T.agarra1) {
        const k = salida(fase(t, T.afloja0, T.afloja1)), s = sueltas(), S0 = soga(MANO_NA, MANO_NB);
        A = lerpL(S0.A, s.A, k); B = lerpL(S0.B, s.B, k); nudoJ = { c: lerpP(NUDO_C, P(240, 370), k), k: 1.75 * (1 - k), ang: -0.2, oscuro: true };
      } else if (t < T.abre1) {
        const m = enManos(); A = mangaA(R_A, m.A); B = mangaA(R_B, m.B); encima = true;
      } else if (t < T.envuelve1) {
        const m = enManos(), k = suave(fase(t, T.abre1, T.envuelve1));
        A = lerpL(mangaA(R_A, m.A), ATADO.A, k); B = lerpL(mangaA(R_B, m.B), ATADO.B, k); encima = true;
        nudoJ = { c: ATADO.n, k: k, ang: 0.2 };
      } else {
        const a = 3 * campana(t, T.envuelve1, T.vuelta0 + 0.05);
        A = tiemblaM(ATADO.A, t, a); B = tiemblaM(ATADO.B, t, a, 7); encima = true; nudoJ = { c: ATADO.n, k: 1, ang: 0.2 };
      }
    } else if (t >= T.posaK && t < T.resbala1) {
      if (t < T.nudo0) {
        const k = muelle(fase(t, T.posaK, T.posaK + 0.26)), s = sueltas();
        A = lerpL(ARRIBA.A, s.A, k); B = lerpL(ARRIBA.B, s.B, k); rollos = salida(fase(t, T.posaK, T.posaK + 0.16));
      } else if (t < T.nudo1) {
        const k = suave(fase(t, T.nudo0, T.nudo1)), s = sueltas();
        A = lerpL(s.A, ATADAS.A, k); B = lerpL(s.B, ATADAS.B, k);
        nudoJ = { c: ATADAS.n, k: salida(fase(t, T.nudo0 + 0.08, T.nudo1)), ang: 0.15 + 4 * Math.PI * k };
      } else if (t < T.resbala0) {
        A = ATADAS.A; B = ATADAS.B; nudoJ = { c: ATADAS.n, k: 1, ang: 0.15 };
      } else {
        const k = suave(fase(t, T.resbala0, T.desata1)), s = sueltas();
        A = lerpL(ATADAS.A, s.A, k); B = lerpL(ATADAS.B, s.B, k); nudoJ = { c: lerpP(ATADAS.n, P(244, 420), k), k: 1 - k, ang: 0.15 };
        slide = entrada(fase(t, T.desata1, T.resbala1));
      }
    } else return null;
    return { A, B, nudo: nudoJ, rollos, encima, slide };
  }
  // resbalón hacia la espalda (lado cercano, −x) y hacia abajo, girando sobre el hombro
  function resbalon(k) {
    const piv = P(110, 330), a = -1.05 * k, dx = -210 * k, dy = 130 * k * k + 30 * k;
    return q => { const r = rota({ x: q.x - piv.x, y: q.y - piv.y }, a); return { x: piv.x + r.x + dx, y: piv.y + r.y + dy }; };
  }

  /* ---------- el jersey en el mundo ---------- */
  // doblado (sobre la palma de Kiriku): c = centro de la base
  function doblado(c) {
    const Q = [P(c.x + 17, c.y - 14), P(c.x - 17, c.y - 14), P(c.x - 18, c.y + 1), P(c.x + 18, c.y + 1)];
    return { Q, A: Array(6).fill(Q[0]), B: Array(6).fill(Q[1]), u: S };
  }
  // abierto colgando de dos esquinas (las manos de Guillermo): qa = esquina de la manga A, qb = la de B
  function abierto(qa, qb, t, alto = 99) {
    const Q = [qa, qb, P(qb.x + 2, qb.y + alto), P(qa.x - 2, qa.y + alto)];
    const A = [], B = [], sw = 2.5 * Math.sin(t * 4.1);
    for (let i = 0; i < 6; i++) { const k = i / 5; A.push(P(qa.x + (4 + sw) * k, qa.y + 82 * k)); B.push(P(qb.x - (4 - sw) * k, qb.y + 82 * k)); }
    return { Q, A, B, u: S };
  }
  // abierto y estirado en el aire (al desenrollarse)
  function estirado(c, w, h) {
    const Q = [P(c.x + w / 2, c.y - h / 2), P(c.x - w / 2, c.y - h / 2), P(c.x - w / 2, c.y + h / 2), P(c.x + w / 2, c.y + h / 2)];
    const A = [], B = [];
    for (let i = 0; i < 6; i++) { const k = i / 5; A.push(P(Q[0].x + 78 * k, Q[0].y + 10 * k * k)); B.push(P(Q[1].x - 78 * k, Q[1].y + 10 * k * k)); }
    return { Q, A, B, u: S };
  }
  // doblado sobre el antebrazo de Kiriku: H = punto del antebrazo, sw = balanceo
  function antebrazo(H, sw) {
    const d = P(Math.sin(sw), Math.cos(sw)), n = P(d.y, -d.x);
    const Q0 = P(H.x + n.x * 16, H.y + n.y * 16), Q1 = P(H.x - n.x * 16, H.y - n.y * 16);
    const Q = [Q0, Q1, P(Q1.x - n.x * 4 + d.x * 58, Q1.y - n.y * 4 + d.y * 58), P(Q0.x + n.x * 4 + d.x * 58, Q0.y + n.y * 4 + d.y * 58)];
    const A = [], B = [];
    for (let i = 0; i < 6; i++) { const k = i / 5, l = 74 * k, o = 2 + 3 * k;
      A.push(P(Q0.x + d.x * l + n.x * o, Q0.y + d.y * l + n.y * o)); B.push(P(Q1.x + d.x * l - n.x * o, Q1.y + d.y * l - n.y * o)); }
    return { Q, A, B, u: S };
  }
  // en el suelo, hecho un gurruño
  function monton(c) {
    // montón aplastado en el césped con las mangas despatarradas a los dos lados
    const Q = [P(c.x + 22, c.y - 38), P(c.x - 22, c.y - 34), P(c.x - 34, c.y + 1), P(c.x + 36, c.y + 2)];
    const A = [Q[0], P(c.x + 36, c.y - 18), P(c.x + 48, c.y - 6), P(c.x + 62, c.y - 1), P(c.x + 76, c.y + 2), P(c.x + 88, c.y + 1)];
    const B = [Q[1], P(c.x - 36, c.y - 16), P(c.x - 46, c.y - 5), P(c.x - 58, c.y), P(c.x - 70, c.y + 2), P(c.x - 80, c.y)];
    return { Q, A, B, u: S };
  }
  const centroJ = J => P((J.Q[0].x + J.Q[1].x + J.Q[2].x + J.Q[3].x) / 4, (J.Q[0].y + J.Q[1].y + J.Q[2].y + J.Q[3].y) / 4);
  // vuelo de J0 a J1: el centro sigue una parábola por `cima`, la forma se mezcla, gira y ondea
  function vuelo(J0, J1, u, cima, giro, t, onda = 7, ease = null) {
    const c0 = centroJ(J0), c1 = centroJ(J1), e = ease ? ease(u) : u, k = suave(u);
    const ct = P(2 * cima.x - (c0.x + c1.x) / 2, 2 * cima.y - (c0.y + c1.y) / 2);     // punto de control: la cima queda en e = 0,5
    const pos = P((1 - e) * (1 - e) * c0.x + 2 * (1 - e) * e * ct.x + e * e * c1.x, (1 - e) * (1 - e) * c0.y + 2 * (1 - e) * e * ct.y + e * e * c1.y);
    const ang = giro * Math.sin(Math.PI * u), sx = 1 - 0.3 * Math.sin(Math.PI * u);
    const map = (a, b) => { const r = rota({ x: lerp(a.x - c0.x, b.x - c1.x, k) * sx, y: lerp(a.y - c0.y, b.y - c1.y, k) }, ang); return P(pos.x + r.x, pos.y + r.y); };
    const J = { u: S, Q: J0.Q.map((q, i) => map(q, J1.Q[i])) };
    const amp = onda * Math.sin(Math.PI * u);
    const ondea = (M0, M1, f) => M0.map((q, i) => { const p = map(q, M1[i]); return i ? P(p.x + amp * (i / 5) * Math.sin(t * 26 + i * 1.3 + f), p.y + amp * 0.6 * (i / 5) * Math.cos(t * 23 + i + f)) : p; });
    J.A = ondea(J0.A, J1.A, 0); J.B = ondea(J0.B, J1.B, 2);
    return J;
  }
  const potencia = pw => k => 1 - Math.pow(1 - k, pw), uCima = pw => 1 - Math.pow(0.5, 1 / pw);   // vuelo que frena al caer y cuándo pasa por la cima
  // el jersey sobre los hombros pasado al mundo (al aterrizar)
  function hombrosMundo(pG, mangas) {
    const M = matTronco(G, pG), f = q => porMatriz(M, q);
    return { Q: ESPALDA.map(f), A: mangas.A.map(f), B: mangas.B.map(f), u: pG.s };
  }

  /* ---------- el paquete (hoja del torso de Guillermo) ---------- */
  const PAQ = [P(122, 34), P(206, 56), P(300, 63), P(394, 56), P(488, 42), P(524, 100), P(528, 190), P(498, 262), P(440, 306),
    P(420, 362), P(426, 470), P(422, 600), P(412, 700), P(330, 716), P(240, 720), P(150, 716), P(58, 702), P(40, 600), P(38, 470),
    P(44, 370), P(76, 314), P(100, 262), P(94, 170), P(102, 88)];
  const CINTA1 = [P(60, 322), P(150, 336), P(250, 340), P(348, 330), P(420, 314), P(436, 312)];
  const CINTA2 = [P(36, 418), P(118, 450), P(222, 490), P(318, 528), P(384, 552), P(424, 562)];
  const NUDO_P = P(430, 314);
  const COLGANTE = [NUDO_P, P(452, 356), P(466, 404), P(472, 452), P(475, 496), P(477, 535)];
  function paquete(g, t, sinColgante) {
    const camino = () => { g.beginPath(); M2.curva(g, PAQ, true, 0.5); };
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    camino(); g.fillStyle = ROSA; g.fill();
    g.save(); camino(); g.clip();
    g.fillStyle = "rgba(170,70,74,0.42)"; g.beginPath(); g.ellipse(70, 420, 110, 420, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,222,208,0.5)"; g.beginPath(); g.ellipse(430, 150, 60, 90, 0.2, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(390, 470, 30, 120, 0, 0, Math.PI * 2); g.fill();
    // canalé del punto, siguiendo el bulto
    g.strokeStyle = "rgba(160,64,66,0.24)"; g.lineWidth = 4;
    for (let x = 70; x < 520; x += 30) { g.beginPath(); g.moveTo(x, 70); g.quadraticCurveTo(x + (x - 280) * 0.12, 300, x - (x - 240) * 0.1, 700); g.stroke(); }
    // bajo acanalado
    g.fillStyle = ROSA_P; g.beginPath(); g.moveTo(20, 664); g.quadraticCurveTo(240, 690, 440, 662); g.lineTo(440, 740); g.lineTo(20, 740); g.closePath(); g.fill();
    g.strokeStyle = "rgba(140,50,54,0.55)"; g.lineWidth = 4; g.beginPath(); for (let x = 50; x < 430; x += 13) { g.moveTo(x, 672 + 0.0004 * (x - 230) * (x - 230)); g.lineTo(x, 718); } g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 6; g.beginPath(); g.moveTo(20, 664); g.quadraticCurveTo(240, 690, 440, 662); g.stroke();
    g.restore();
    // cuello acanalado: los pinchos salen por aquí
    g.strokeStyle = ROSA_P; g.lineWidth = 30; g.beginPath(); g.moveTo(130, 50); g.quadraticCurveTo(300, 92, 480, 58); g.stroke();
    g.strokeStyle = "rgba(140,50,54,0.55)"; g.lineWidth = 4; g.beginPath();
    for (let i = 0; i <= 22; i++) { const k = i / 22, x = lerp(130, 480, k), y = lerp(50, 58, k) + 34 * 4 * k * (1 - k) * 0.5; g.moveTo(x, y - 12); g.lineTo(x, y + 12); }
    g.stroke();
    g.strokeStyle = TINTA; g.lineWidth = 5; g.beginPath(); g.moveTo(132, 66); g.quadraticCurveTo(300, 108, 478, 74); g.stroke();
    camino(); g.strokeStyle = TINTA; g.lineWidth = 7; g.stroke();
    // las mangas, liadas como el cordel de un paquete
    tubo(g, CINTA2, { w0: 46, w1: 44, puno: 0 });
    tubo(g, CINTA1, { w0: 46, w1: 44, puno: 0 });
    const mec = 1 - tramo(t, T.pellizca0, T.pellizca1);
    if (!sinColgante) tubo(g, COLGANTE.map((q, i) => i ? P(q.x + 10 * mec * (i / 5) * Math.sin(t * 5 + i * 0.5), q.y) : q), { w0: 44, w1: 42 });
    tubo(g, [NUDO_P, P(446, 300), P(462, 290), P(476, 284), P(488, 282), P(498, 282)], { w0: 42, w1: 40, puno: 20 });
    nudo(g, NUDO_P, 1.15, -0.4, 1);
    g.restore();
  }

  /* ================= Guillermo ================= */
  const CG = {
    inicio: E({ mx: 0.85, my: 0.15, c: 0.2, sd: 6, si: -2, gi: -0.08, sonr: 0.05, ancho: 0.62 }),
    piensa: E({ mx: 0.9, my: 0.35, c: 0.3, sd: 14, si: -4, gi: -0.12, sonr: 0.0, ancho: 0.55 }),
    ooh: E({ mx: 0.9, my: 0.45, iris: 1.1, sd: 20, si: 18, abre: 13, ancho: 0.42, sonr: 0.05 }),
    asiente: E({ mx: 0.85, my: 0.2, c: 0.35, h: 0.3, sd: 14, si: 14, sonr: 0.7, ancho: 0.95 }),
    quiero: E({ mx: 0.9, my: -0.2, iris: 1.36, sd: 22, gd: 0.22, si: 22, gi: 0.22, abre: 3, ancho: 0.45, sonr: -0.12 }),
    ilusion: E({ mx: 0.85, my: 0.1, iris: 1.25, sd: 18, si: 18, abre: 14, ancho: 0.95, sonr: 0.9 }),
    admira: E({ mx: 0.7, my: 0.55, iris: 1.2, sd: 16, si: 16, abre: 8, ancho: 0.9, sonr: 0.85 }),
    lanza: E({ mx: 0.4, my: -1, iris: 1.05, sd: 22, si: 22, abre: 12, ancho: 0.85, sonr: 0.7 }),
    pilla: E({ mx: 0.6, my: 0.7, c: 0.15, sd: 8, si: 8, sonr: 0.5, ancho: 0.8 }),
    concentra: E({ mx: 0.5, my: 0.8, c: 0.3, sd: -6, gd: -0.14, si: -4, gi: -0.1, abre: 9, ancho: 0.6, sonr: 0.2, lengua: 1 }),
    tira: E({ c: 1, z: 1, sd: -10, gd: -0.2, si: -10, gi: -0.2, abre: 20, ancho: 1.0, sonr: -0.1, mof: 0.2 }),
    ahoga: E({ mx: 0.15, my: -0.6, iris: 0.68, sd: 28, si: 28, abre: 32, ancho: 0.7, sonr: -0.45, lengua: 1 }),
    alivio: E({ c: 1, h: 0.25, sd: 12, si: 12, abre: 26, ancho: 0.72, sonr: 0.0 }),
    decide: E({ mx: 0.6, my: 0.6, sd: -8, gd: -0.18, si: -8, gi: -0.18, sonr: 0.4, ancho: 0.85 }),
    abre: E({ mx: 0.1, my: 0.2, c: 0.2, sd: 10, si: 10, abre: 10, ancho: 0.9, sonr: 0.55 }),
    atado: E({ mx: 0.7, my: 0.5, iris: 0.9, sd: 24, si: 24, abre: 16, ancho: 0.55, sonr: -0.35 }),
    lucha: E({ c: 1, z: 1, sd: -8, si: -8, abre: 14, ancho: 0.8, sonr: -0.25, mof: 0.25 }),
    mareo: E({ esp: 1, sd: 12, si: 10, gi: 0.1, abre: 12, ancho: 0.62, sonr: 0.05 }),
    despierta: E({ mx: 0.55, my: 0.75, iris: 1.15, sd: 20, si: 20, abre: 8, ancho: 0.6, sonr: 0.3 }),
    encantado: E({ c: 1, h: 1, sd: 16, si: 16, abre: 6, ancho: 1.0, sonr: 0.95 }),
    orgullo: E({ c: 1, h: 0.4, sd: 14, si: 20, gi: 0.1, sonr: 0.85, ancho: 1.02 }),
    abreOjo: E({ mx: -0.85, my: 0.8, cd: 1, ci: 0, h: 0, sd: 6, si: 20, gi: 0.1, sonr: 0.4, ancho: 0.9 }),
    pasmo: E({ mx: -0.9, my: 0.85, iris: 0.9, sd: 18, si: 22, abre: 6, ancho: 0.5, sonr: -0.2 }),
    serio: E({ mx: 0.15, my: 0.05, c: 0.38, sd: 2, si: 4, sonr: -0.18, ancho: 0.62 })
  };
  const GUION_CG = [
    [0.3, 0.6, "piensa"], [T.gira1 - 0.05, T.mira1, "ooh"], [T.asiente0, T.asiente0 + 0.15, "asiente"], [T.senala0 - 0.05, T.senala0 + 0.12, "quiero"],
    [T.ofrece0 + 0.1, T.ofrece0 + 0.3, "ilusion"], [T.alza1 - 0.2, T.alza1, "admira"], [T.lanza - 0.05, T.lanza + 0.1, "lanza"],
    [T.posa, T.posa + 0.12, "pilla"], [T.cogePunos1, T.cogePunos1 + 0.12, "concentra"], [T.cruza1, T.tiron, "tira"],
    [T.tiron + 0.06, T.ahoga, "ahoga", salida], [T.afloja1 - 0.06, T.afloja1 + 0.06, "alivio"], [T.agarra0 - 0.05, T.agarra0 + 0.12, "decide"],
    [T.agarra1, T.abre1, "abre"], [T.envuelve1 - 0.04, T.envuelve1 + 0.06, "atado"], [T.envuelve1 + 0.15, T.envuelve1 + 0.22, "lucha"],
    [T.desSwap, T.desSwap + 0.08, "mareo"], [T.despierta, T.despierta + 0.14, "despierta"], [T.despierta + 0.3, T.despierta + 0.42, "encantado"],
    [T.orgullo0, T.orgullo1, "orgullo"], [T.mirasuelo, T.mirasuelo + 0.12, "abreOjo"], [T.mirasuelo + 0.18, T.mirasuelo + 0.3, "pasmo"],
    [T.camara, T.camara + 0.2, "serio"]
  ];
  const PARP_G = [0.75, 2.3, 3.4, 4.6, 5.6, 6.3, 7.5, 9.2, 12.25, 14.3];
  const P0G = { pel: 0, torso: 0, cab: 0, cdy: 0, ex: 1, ey: 1 };
  const CuG = o => Object.assign({}, P0G, o);
  const CUER_G = {
    quieto: CuG({ torso: 0.03, cab: 0.06 }),
    camina: CuG({ torso: 0.06, cab: 0.08 }),
    inclina: CuG({ torso: 0.05, cab: 0.18, pel: 6 }),
    asiente: CuG({ torso: 0.06, cab: 0.1 }),
    senala: CuG({ torso: 0.05, cab: 0.04 }),
    quiero: CuG({ torso: -0.02, cab: 0.14 }),
    coge: CuG({ torso: 0.08, cab: 0.06, pel: 4 }),
    admira: CuG({ torso: -0.05, cab: 0.08 }),
    carga: CuG({ torso: 0.07, cab: 0.12, pel: 28 }),
    lanza: CuG({ torso: -0.07, cab: -0.24, pel: -8 }),
    mira: CuG({ torso: 0.02, cab: 0.16 }),
    ata: CuG({ torso: 0.06, cab: 0.24, cdy: 6 }),
    tira: CuG({ torso: -0.03, cab: 0.1, pel: 10 }),
    ahoga: CuG({ torso: -0.06, cab: -0.26, cdy: -8 }),
    afloja: CuG({ torso: 0.08, cab: 0.2 }),
    respira: CuG({ torso: -0.09, cab: -0.16, pel: -6, ey: 1.03 }),
    decide: CuG({ torso: 0.03, cab: 0.1 }),
    abre: CuG({ torso: -0.05, cab: -0.04, pel: -4 }),
    atado: CuG({ torso: 0.0, cab: 0.08, ex: 0.95 }),
    paquete: CuG({ torso: 0.0, cab: 0.0 }),
    mareo: CuG({ torso: 0.0, cab: 0.0 }),
    miraNudo: CuG({ torso: 0.04, cab: 0.26, cdy: 4 }),
    orgullo: CuG({ torso: -0.09, cab: -0.24, pel: -6 }),
    miraAtras: CuG({ torso: -0.03, cab: 0.14 }),
    final: CuG({ torso: 0.0, cab: 0.03 })
  };
  const GUION_G = [
    [T.anda0 - 0.1, T.anda0 + 0.2, "camina"], [T.gira1 - 0.05, T.mira1, "inclina"], [T.asiente0, T.asiente0 + 0.12, "asiente"],
    [T.senala0 - 0.05, T.senala1, "senala"], [T.pecho0, T.pecho1, "quiero"], [T.coge0 - 0.12, T.coge1, "coge"], [T.suelta + 0.05, T.alza1, "admira"],
    [T.carga0, T.lanza, "carga"], [T.lanza, T.lanza + 0.12, "lanza", salida], [T.posa - 0.06, T.posa + 0.2, "mira"],
    [T.cogePunos0, T.cogePunos1, "ata"], [T.cruza1, T.tiron, "tira"], [T.tiron + 0.03, T.ahoga, "ahoga", salida],
    [T.afloja0, T.afloja1, "afloja"], [T.respira0, T.respira0 + 0.16, "respira"], [T.agarra0, T.agarra1, "decide"],
    [T.agarra1, T.abre1, "abre"], [T.abre1, T.envuelve1, "atado"], [T.vuelta0 + 0.02, T.vueltaSwap, "paquete"],
    [T.desSwap, T.desSwap + 0.1, "mareo"], [T.despierta, T.despierta + 0.25, "miraNudo"], [T.orgullo0, T.orgullo1, "orgullo"],
    [T.mirasuelo - 0.04, T.mirasuelo + 0.24, "miraAtras"], [T.camara, T.camara + 0.3, "final"]
  ];
  const TOB_G = G.SUELO - G.TOBILLO_ALTO, TOB_K = KR.SUELO - KR.TOBILLO_ALTO;

  // paseo por detrás de Kiriku: x, profundidad (−1 detrás) y pisadas
  const andaU = t => suave(fase(t, T.anda0, T.anda1));
  const xAnda = u => lerp(XG0, XG1, u), hondo = u => -Math.sin(Math.PI * u);
  const PISADAS = (() => {
    const L = [], n = 6, d = (T.anda1 - T.anda0) / n;
    const pie = { cerca: P(XG0 - 28, SUELO), lejos: P(XG0 + 28, SUELO) };
    for (let i = 0; i < n; i++) {
      const lado = i % 2 ? "lejos" : "cerca", a = T.anda0 + i * d, b = a + d, ub = andaU(b);
      let x = xAnda(ub) + 34; if (i >= n - 2) x = XG1 + (lado === "lejos" ? 28 : -28);
      const q = P(x, SUELO + 15 * hondo(ub));
      L.push([a, b, lado, pie[lado], q]); pie[lado] = q;
    }
    return L;
  })();
  function piePaseo(t, lado) {
    let q = lado === "cerca" ? P(XG0 - 28, SUELO) : P(XG0 + 28, SUELO), alza = 0, ang = 0, fasePaso = -1;
    for (const [a, b, l, q0, q1] of PISADAS) {
      if (l !== lado || t < a) continue;
      if (t >= b) { q = q1; continue; }
      const k = fase(t, a, b), e = suave(k);
      q = lerpP(q0, q1, e); alza = 20 * Math.sin(Math.PI * k); ang = 0.2 * Math.sin(2 * Math.PI * k); fasePaso = k; break;
    }
    return { q, alza, ang, fasePaso };
  }
  // saltitos del paquete: [t0, t1, dx]
  const SALTOS = [[8.74, 8.98, 22], [9.04, 9.28, 12], [9.33, 9.6, -14]];
  function xSaltos(t) { let x = XG1; for (const [a, b, dx] of SALTOS) { if (t <= a) break; x += dx * suave(fase(t, a, b)); } return x; }
  const altoSalto = t => { let h = 0; for (const [a, b] of SALTOS) h += 34 * campana(t, a, b); return h; };
  const agacheSalto = t => { let k = 0; for (const [a, b] of SALTOS) k += campana(t, a - 0.1, a + 0.02) + 0.8 * campana(t, b - 0.02, b + 0.12); return k; };
  const XP = XG1 + 20, XT = 595;                // donde acaba el paquete y donde se queda tras tambalearse
  function xG(t) {
    if (t < T.anda0) return XG0;
    if (t < T.anda1) return xAnda(andaU(t));
    if (t < SALTOS[0][0]) return XG1;
    if (t < T.tambalea0) return xSaltos(t);
    return lerp(XP, XT, suave(fase(t, T.tambalea0, T.tambalea1)));
  }
  // orientación (1 mira a la derecha, −1 a la izquierda) con los giros aplastados
  function oG(t) {
    if (t < T.gira0) return 1;
    if (t < T.gira1) return Math.cos(Math.PI * suave(fase(t, T.gira0, T.gira1)));
    if (t >= T.vuelta0 && t < T.vuelta1) return -Math.cos(2 * Math.PI * suave(fase(t, T.vuelta0, T.vuelta1)));
    if (t >= T.tiron2 && t < T.desenrolla1) return -Math.cos(4 * Math.PI * giroDes(t));
    return -1;
  }
  function poseGCuerpo(t) {
    const b = linea(GUION_G, CUER_G, "quieto", t);
    const respira = Math.sin(t * 2.1 + 0.4);
    const u = andaU(t), andando = t > T.anda0 && t < T.anda1;
    const s = S * (1 + 0.065 * hondo(t < T.anda1 ? u : 1)), suelo = SUELO + 15 * hondo(t < T.anda1 ? u : 1);
    const o = oG(t), x = xG(t);
    const p = { x, suelo, s, o, espejo: false, tirasLimpias: true, ikContinuo: false,
      pelvis: { x: G.PELVIS.x, y: G.PELVIS.y + b.pel + respira * 1.2 }, torso: b.torso, torsoEsc: { x: b.ex, y: b.ey + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } } };
    // piernas
    const aSheet = (w, alza) => P(G.PELVIS.x + (w.x - x) / (s * (Math.abs(o) > 0.2 ? o : (o < 0 ? -1 : 1))), TOB_G + (w.y - suelo) / s - alza / s);
    if (andando) {
      let baja = 0;
      for (const lado of ["cerca", "lejos"]) {
        const f = piePaseo(t, lado); p.piernas[lado] = { tob: aSheet(f.q, f.alza), ang: f.ang };
        if (f.fasePaso >= 0) baja = 20 * (1 - Math.sin(Math.PI * f.fasePaso));
      }
      p.pelvis.y += baja; p.cabeza.ang += 0.02 * Math.sin(t * 22);
    } else {
      // de pie: pies en la hoja (los giros los reflejan solos)
      let sep = 28, alza = 0;
      if (t >= SALTOS[0][0] - 0.15 && t < T.tambalea0) { sep = 20; alza = altoSalto(t); p.pelvis.y += 70 * agacheSalto(t) - alza / s; }
      p.piernas.cerca = { tob: P(G.PELVIS.x - sep / S, TOB_G - alza / s), ang: 0 };
      p.piernas.lejos = { tob: P(G.PELVIS.x + sep / S, TOB_G - alza / s), ang: 0 };
      // tambaleo hacia Kiriku: dos pasitos con los pies apoyados en el césped (mira a la izquierda)
      if (t > T.tambalea0 && t < T.tambalea1 + 0.01) {
        const mid = (T.tambalea0 + T.tambalea1) / 2, kl = fase(t, T.tambalea0, mid), kc = fase(t, mid, T.tambalea1);
        const wl = P(lerp(XP - 28, XT - 28, suave(kl)), SUELO), wc = P(lerp(XP + 28, XT + 28, suave(kc)), SUELO);
        p.piernas.lejos = { tob: aSheet(wl, 14 * Math.sin(Math.PI * kl)), ang: 0.15 * Math.sin(Math.PI * kl) };
        p.piernas.cerca = { tob: aSheet(wc, 14 * Math.sin(Math.PI * kc)), ang: 0.15 * Math.sin(Math.PI * kc) };
      }
      // ahogándose da saltitos; forcejeando patalea
      const sal = 10 * Math.abs(Math.sin(t * 17)) * campana(t, T.ahoga, T.ahoga1);
      p.piernas.cerca.tob.y -= sal / s * (Math.sin(t * 17) > 0 ? 1 : 0.2); p.piernas.lejos.tob.y -= sal / s * (Math.sin(t * 17) > 0 ? 0.2 : 1);
      const pat = 9 * campana(t, T.envuelve1, T.vuelta0);
      p.piernas.cerca.tob.y -= pat / s * Math.max(0, Math.sin(t * 21)); p.piernas.lejos.tob.y -= pat / s * Math.max(0, -Math.sin(t * 21));
    }
    // asiente dos veces; ahogo y forcejeo tiemblan; mareo se balancea
    p.cabeza.ang += 0.09 * Math.sin((t - T.asiente0) * 18) * campana(t, T.asiente0, T.asiente1);
    const ah = campana(t, T.ahoga, T.ahoga1);
    p.torso += 0.03 * ah * ruido(t * 18); p.cabeza.ang += 0.07 * ah * ruido(t * 21 + 3);
    const lu = campana(t, T.envuelve1, T.vuelta0 + 0.04);
    p.torso += 0.07 * lu * Math.sin(t * 24); p.cabeza.ang += 0.08 * lu * Math.sin(t * 24 + 1);
    const ma = clamp(fase(t, T.desenrolla1 - 0.1, T.desenrolla1 + 0.1)) * (1 - tramo(t, T.despierta - 0.1, T.despierta + 0.2));
    p.torso += 0.09 * ma * Math.sin(t * 6.5); p.cabeza.ang += 0.14 * ma * Math.sin(t * 6.5 - 0.8);
    p.pelvis.y += 6 * ma * Math.abs(Math.sin(t * 6.5));
    // el paquete: la cabeza va pegada al torso (los pinchos salen por el cuello) y se aplasta al caer
    const paq = t >= T.vueltaSwap && t < T.desSwap;
    if (t >= T.vuelta0 && t < T.desSwap + 0.06) {
      const k = clamp(fase(t, T.vuelta0, T.vueltaSwap) + (paq ? 1 : 0)) * (1 - tramo(t, T.desSwap, T.desSwap + 0.06));
      p.cabeza.ang = lerp(p.cabeza.ang, p.torso, k); p.cabeza.dy *= 1 - k;
    }
    if (paq) { const ap = agacheSalto(t); p.torsoEsc.y *= 1 - 0.04 * ap; p.torsoEsc.x *= 1 + 0.03 * ap; }
    // cara
    p.cara = cara(linea(GUION_CG, CG, "inicio", t), parpadeo(t, PARP_G));
    p.rojo = 0.85 * campana(t, T.tiron, T.afloja1 + 0.25) + 0.35 * campana(t, T.envuelve1, T.vuelta0 + 0.1);
    p.sudor = 0.6 * campana(t, T.ahoga, T.respira0 + 0.4) + 0.5 * campana(t, T.envuelve1, T.vuelta0 + 0.2);
    return p;
  }
  // manos de Guillermo (necesitan la postura de Kiriku para coger el jersey de su mano)
  function manosG(t, p, pK) {
    const res = resolutor(G, p, "cerca"), resL = resolutor(G, p, "lejos");
    const H = G.cabeza(p);
    const barbilla = () => H.a(P(842, 880));
    const dobladoW = () => palmaK(pK);
    const sueltaA = () => G.tronco(p)(SUELTAS.A[5]), sueltaB = () => G.tronco(p)(SUELTAS.B[5]);
    const PINZ = D5(0.65, 0.65, 0.3, 0.25, 0.25), PINZ2 = D5(0.75, 0.7, 0.4, 0.35, 0.3), ABIERTA = D(1, 1, 1, 1), GARRA = D(0.45, 0.5, 0.45, 0.45), CERRADA = D(0.15, 0.1, 0.05, 0.05);
    const PISTA_C = [
      [0, 0, { bols: true }],
      [T.coge0, T.coge1, { mundo: () => P(dobladoW().x + 17, dobladoW().y - 14), ref: PINZA, mu: Math.PI + 0.25, dedos: PINZ, dobla: -1 }],
      [T.suelta + 0.02, T.alza1, { hoja: P(236, 440), mu: -2.3, dedos: PINZ, dobla: -1 }],
      [T.admira1 - 0.15, T.admira1, { hoja: P(244, 420), mu: -2.3, dedos: PINZ, dobla: -1 }],
      [T.carga0, T.lanza - 0.04, { hoja: P(250, 520), mu: -2.2, dedos: PINZ, dobla: -1 }],
      [T.lanza - 0.04, T.lanza + 0.06, { hoja: P(258, 330), mu: 2.7, dedos: ABIERTA, dobla: -1 }, salida],
      [T.lanza + 0.2, T.posa - 0.02, { hoja: P(200, 470), mu: -1.6, dedos: D(0.8, 0.8, 0.8, 0.8), dobla: -1 }],
      [T.cogePunos0, T.cogePunos1, { abs: sueltaA, ref: PINZA, mu: -1.75, dedos: PINZ2, dobla: -1 }],
      [T.cogePunos1 + 0.02, T.cruza1, { hoja: P(306, 470), mu: Math.PI - 0.2, dedos: PINZ2, dobla: -1 }],
      [T.cruza1, T.tiron, { hoja: P(-10, 410), mu: 0.2, dedos: PINZ2, dobla: -1 }, salida],
      [T.tiron - 0.02, T.ahoga + 0.02, { hoja: MANO_NA, mu: 0.15, dedos: CERRADA, dobla: -1 }, salida],
      [T.afloja0, T.afloja1, { hoja: P(160, 412), mu: 2.3, dedos: GARRA, dobla: -1 }, salida],
      [T.afloja1, T.respira0 + 0.2, { hoja: P(140, 560), mu: -1.6, dedos: ABIERTA, dobla: -1 }],
      [T.agarra0, T.agarra1, { abs: sueltaA, ref: PINZA, mu: -1.75, dedos: PINZ2, dobla: -1 }],
      [T.agarra1, T.abre1, { hoja: P(-80, 430), mu: 0.15, dedos: PINZ2, dobla: -1 }, salida],
      [T.abre1, T.envuelve1, { hoja: P(110, 612), mu: -1.75, dedos: CERRADA, dobla: -1 }, entrada],
      [T.vueltaSwap + 0.03, T.vueltaSwap + 0.12, { bols: true }],
      [T.desSwap, T.desSwap + 0.12, { hoja: P(-40, 440), mu: 0.1, dedos: ABIERTA, dobla: -1 }, salida],
      [T.desenrolla1 - 0.05, T.desenrolla1 + 0.25, { hoja: P(60, 520), mu: -1.6, dedos: D(0.8, 0.8, 0.8, 0.8), dobla: -1 }],
      [T.tambalea0, T.tambalea1, { hoja: P(110, 600), mu: -1.6, dedos: D(0.6, 0.6, 0.6, 0.6), dobla: -1 }],
      [T.orgullo0, T.orgullo1, { bols: true }]
    ];
    const PISTA_L = [
      [0, 0, { abs: barbilla, ref: PUNO, mu: 1.2, dedos: CERRADA, dobla: 1 }],
      [T.senala0, T.senala1, { hoja: P(520, 372), mu: Math.PI, dedos: D5(0.2, 1, 0, 0, 0), dobla: 1 }, salida],
      [T.pecho0, T.pecho1, { hoja: P(318, 430), mu: 0.5, dedos: ABIERTA, dobla: 1 }],
      [T.coge0, T.coge1, { mundo: () => P(dobladoW().x - 17, dobladoW().y - 14), ref: PINZA, mu: Math.PI - 0.3, dedos: PINZ, dobla: 1 }],
      [T.suelta + 0.02, T.alza1, { hoja: P(506, 440), mu: -1.9, dedos: PINZ, dobla: 1 }],
      [T.admira1 - 0.15, T.admira1, { hoja: P(498, 420), mu: -1.9, dedos: PINZ, dobla: 1 }],
      [T.carga0, T.lanza - 0.04, { hoja: P(480, 520), mu: -1.8, dedos: PINZ, dobla: 1 }],
      [T.lanza - 0.04, T.lanza + 0.06, { hoja: P(470, 320), mu: 2.3, dedos: ABIERTA, dobla: 1 }, salida],
      [T.lanza + 0.2, T.posa - 0.02, { hoja: P(392, 470), mu: -1.5, dedos: D(0.8, 0.8, 0.8, 0.8), dobla: 1 }],
      [T.cogePunos0, T.cogePunos1, { abs: sueltaB, ref: PINZA, mu: -1.75, dedos: PINZ2, dobla: 1 }],
      [T.cogePunos1 + 0.02, T.cruza1, { hoja: P(196, 462), mu: 0.1, dedos: PINZ2, dobla: 1 }],
      [T.cruza1, T.tiron, { hoja: P(540, 400), mu: Math.PI - 0.2, dedos: PINZ2, dobla: 1 }, salida],
      [T.tiron - 0.02, T.ahoga + 0.02, { hoja: MANO_NB, mu: Math.PI - 0.15, dedos: CERRADA, dobla: 1 }, salida],
      [T.afloja0, T.afloja1, { hoja: P(342, 422), mu: 0.6, dedos: GARRA, dobla: 1 }, salida],
      [T.afloja1, T.respira0 + 0.2, { hoja: P(362, 560), mu: -1.5, dedos: ABIERTA, dobla: 1 }],
      [T.agarra0, T.agarra1, { abs: sueltaB, ref: PINZA, mu: -1.75, dedos: PINZ2, dobla: 1 }],
      [T.agarra1, T.abre1, { hoja: P(560, 440), mu: Math.PI - 0.15, dedos: PINZ2, dobla: 1 }, salida],
      [T.abre1, T.envuelve1, { hoja: P(390, 606), mu: -1.75, dedos: CERRADA, dobla: 1 }, entrada],
      [T.vueltaSwap + 0.03, T.vueltaSwap + 0.12, { bols: true }],
      [T.desSwap, T.desSwap + 0.12, { hoja: P(540, 440), mu: Math.PI - 0.1, dedos: ABIERTA, dobla: 1 }, salida],
      [T.desenrolla1 - 0.05, T.desenrolla1 + 0.25, { hoja: P(450, 520), mu: -2.0, dedos: D(0.8, 0.8, 0.8, 0.8), dobla: 1 }],
      [T.tambalea0, T.tambalea1, { hoja: P(388, 600), mu: -1.6, dedos: D(0.6, 0.6, 0.6, 0.6), dobla: 1 }],
      [T.despierta + 0.05, T.despierta + 0.3, { abs: () => G.tronco(p)(P(272, 446)), ref: PALMA, mu: 0.3, dedos: D(0.8, 0.9, 0.9, 0.9), dobla: 1 }],
      [T.orgullo0, T.orgullo1, { bols: true }]
    ];
    const C = pista(PISTA_C, t, res), L = pista(PISTA_L, t, resL);
    // se da dos palmadas en el pecho; tiembla al tirar y al ahogarse; aleteo atado
    L.x += 10 * Math.sin((t - T.pecho0) * 26) * campana(t, T.pecho0 + 0.05, T.pecho1 + 0.05);
    const ti = campana(t, T.cruza1 - 0.05, T.tiron) + 0.6 * campana(t, T.ahoga, T.ahoga1);
    // tirones hacia fuera: cuanto más tira, más se ahoga
    const tg = campana(t, T.ahoga, T.ahoga1);
    C.x -= 12 * tg * Math.max(0, Math.sin(t * 13)); L.x += 12 * tg * Math.max(0, Math.sin(t * 13 + 0.9));
    if (ti > 0) { const k = ti * 6; C.x += k * ruido(t * 37 + 1); C.y += k * ruido(t * 41 + 7); L.x += k * ruido(t * 33 + 2); L.y += k * ruido(t * 39 + 5); }
    const al = campana(t, T.envuelve1, T.vuelta0);
    C.y += 14 * al * Math.sin(t * 30); L.y += 14 * al * Math.sin(t * 30 + 2);
    // sacude el jersey al admirarlo
    const sac = campana(t, T.alza1 - 0.05, T.admira1);
    C.y += 8 * sac * Math.sin(t * 34); L.y += 8 * sac * Math.sin(t * 34 + 0.6);
    // mareado: los brazos se balancean
    const ma = campana(t, T.desenrolla1 - 0.05, T.tambalea1 + 0.1);
    C.y += 20 * ma * Math.sin(t * 6.5 + 1); L.y += 20 * ma * Math.sin(t * 6.5 + 2.4);
    p.manoCerca = mano(C); p.manoLejos = mano(L);
  }

  /* ================= Kiriku ================= */
  const CK = {
    pose: E({ mx: 0.7, my: -0.3, c: 0.45, sd: 10, si: 14, gi: 0.08, sonr: 0.45, ancho: 0.9 }),
    reojo: E({ mx: 1, my: 0.1, c: 0.32, sd: 12, si: 16, gi: 0.06, sonr: 0.55, ancho: 0.92 }),
    halago: E({ mx: 0.9, my: 0.05, c: 0.5, h: 0.35, sd: 14, si: 18, sonr: 0.75, ancho: 1 }),
    reverencia: E({ mx: 0.85, my: 0.5, c: 0.75, h: 0.3, sd: 10, si: 10, sonr: 0.6, ancho: 0.95 }),
    ceja: E({ mx: 0.9, my: 0.15, c: 0.2, sd: 22, gd: 0.08, si: 2, sonr: 0.35, ancho: 0.85 }),
    divertido: E({ mx: 0.9, my: 0.1, c: 0.4, h: 0.45, sd: 14, si: 10, abre: 3, sonr: 0.7, ancho: 0.95 }),
    risita: E({ c: 1, h: 0.7, sd: 14, si: 14, abre: 0, sonr: 0.85, ancho: 1, mof: 0.4 }),
    paciente: E({ mx: 0.9, my: 0.2, c: 0.55, sd: 6, si: 16, gi: 0.08, sonr: 0.3, ancho: 0.85 }),
    atento: E({ mx: 0.85, my: 0.55, sd: 8, si: 8, sonr: 0.35, ancho: 0.85 }),
    satisfecho: E({ c: 1, h: 0.5, sd: 12, si: 16, gi: 0.06, sonr: 0.8, ancho: 1 }),
    sorpresa: E({ mx: 0.95, my: 0.6, iris: 1.05, sd: 20, si: 20, abre: 4, ancho: 0.6, sonr: 0.0 }),
    harto: E({ c: 1, z: 0.2, sd: 4, gd: 0.1, si: 4, gi: 0.1, sonr: -0.25, ancho: 0.72 }),
    camara: E({ mx: 0.1, my: 0.0, c: 0.3, sd: 24, gd: 0.1, si: 2, sonr: 0.25, ancho: 0.85 })
  };
  const GUION_CK = [
    [T.anda1 - 0.25, T.anda1, "reojo"], [T.asiente0, T.asiente0 + 0.2, "halago"], [T.ofrece0, T.ofrece0 + 0.2, "reverencia"],
    [T.suelta, T.suelta + 0.2, "reojo"], [T.lanza + 0.1, T.lanza + 0.3, "ceja"], [T.ahoga, T.ahoga + 0.2, "divertido"],
    [T.afloja1, T.afloja1 + 0.2, "ceja"], [T.envuelve1, T.envuelve1 + 0.2, "risita"], [T.vuelta1, T.vuelta1 + 0.2, "paciente"],
    [T.pellizca0, T.pellizca0 + 0.15, "atento"], [T.tiron2, T.tiron2 + 0.1, "satisfecho"], [T.cae2 + 0.1, T.cae2 + 0.3, "ceja"],
    [T.lanzaK - 0.1, T.lanzaK + 0.05, "paciente"], [T.nudo0 - 0.1, T.nudo0 + 0.1, "atento"], [T.nudo1, T.nudo1 + 0.15, "satisfecho"],
    [T.resbala1 - 0.15, T.resbala1, "sorpresa"], [T.narizK0, T.narizK0 + 0.2, "harto"], [T.camara + 0.1, T.camara + 0.3, "camara"]
  ];
  const PARP_K = [0.5, 2.0, 3.6, 5.0, 6.9, 8.4, 9.7, 11.0, 12.7];
  const P0K = { pel: 0, torso: 0, cab: 0, cdy: 0 };
  const CuK = o => Object.assign({}, P0K, o);
  const CUER_K = {
    pose: CuK({ torso: -0.04, cab: -0.13 }),
    quieto: CuK({ torso: -0.02, cab: -0.04 }),
    ofrece: CuK({ torso: 0.03, cab: 0.1, pel: 4 }),
    mira: CuK({ torso: -0.01, cab: 0.04 }),
    atras: CuK({ torso: -0.08, cab: -0.08 }),
    pellizca: CuK({ torso: 0.03, cab: 0.12 }),
    tira: CuK({ torso: -0.06, cab: -0.08 }),
    lanza: CuK({ torso: 0.03, cab: -0.02 }),
    ata: CuK({ torso: 0.0, cab: 0.04 }),
    satisfecho: CuK({ torso: -0.05, cab: -0.12 }),
    nariz: CuK({ torso: 0.0, cab: 0.08 }),
    final: CuK({ torso: -0.04, cab: -0.06 })
  };
  const GUION_K = [
    [T.anda1 - 0.3, T.anda1, "quieto"], [T.ofrece0, T.ofrece1, "ofrece"], [T.suelta, T.retiraK1, "mira"],
    [T.palma0 - 0.15, T.choca, "atras"], [T.pellizca0, T.pellizca1, "pellizca"], [T.tiron2, T.tiron2 + 0.15, "tira", salida],
    [T.cae2, T.cae2 + 0.25, "pose"], [T.preparaK0, T.lanzaK, "lanza"], [T.nudo0 - 0.15, T.nudo0, "ata"], [T.retiraK2, T.retiraK3, "satisfecho"],
    [T.narizK0, T.narizK1, "nariz"], [T.camara + 0.1, T.camara + 0.35, "final"]
  ];
  const xK = t => lerp(XK0, XK1, suave(fase(t, T.pasoK0, T.pasoK1)));
  // palma de Kiriku (mundo): donde descansa el jersey doblado
  function palmaK(pK) { const m = pK.manoLejos; return aW(KR, pK, ptHoja(m, P(10, 4))); }
  // antebrazo de Kiriku (mundo): punto entre la muñeca y el codo
  function antebrazoK(pK) { const m = pK.manoLejos; return aW(KR, pK, ptHoja(m, P(9, -32))); }
  function poseK(t, pG) {
    const b = linea(GUION_K, CUER_K, "pose", t);
    const respira = Math.sin(t * 1.9 + 1.4);
    const x = xK(t);
    const p = { x, suelo: SUELO, s: S, o: 1, espejo: false, tirasLimpias: true,
      pelvis: { x: KR.PELVIS.x, y: KR.PELVIS.y + b.pel + respira * 1.1 }, torso: b.torso, torsoEsc: { x: 1, y: 1 + respira * 0.004 },
      piernas: {}, cabeza: { ang: b.cab, dx: 0, dy: b.cdy, esc: { x: 1, y: 1 } } };
    // un paso adelante (pie lejano, luego el cercano)
    const paso = (t0, t1, a, bb) => { const k = fase(t, t0, t1); return { x: lerp(a, bb, suave(k)), y: 11 * Math.sin(Math.PI * k) }; };
    const mid = (T.pasoK0 + T.pasoK1) / 2, d = XK1 - XK0;
    const lej = t < T.pasoK0 ? { x: XK0 + 28, y: 0 } : paso(T.pasoK0, mid, XK0 + 28, XK0 + 28 + d);
    const cer = t < mid ? { x: XK0 - 28, y: 0 } : paso(mid, T.pasoK1, XK0 - 28, XK0 - 28 + d);
    const aHojaX = sx => KR.PELVIS.x + (sx - x) / (S * KR.K);
    p.piernas.lejos = { tob: P(aHojaX(lej.x), TOB_K - lej.y / (S * KR.K)), ang: -0.15 * Math.sin(Math.PI * fase(t, T.pasoK0, mid)) };
    p.piernas.cerca = { tob: P(aHojaX(cer.x), TOB_K - cer.y / (S * KR.K)), ang: -0.15 * Math.sin(Math.PI * fase(t, mid, T.pasoK1)) };
    p.pelvis.y -= 6 * (campana(t, T.pasoK0, mid) + campana(t, mid, T.pasoK1));
    // risita: hombros que se agitan
    p.torso += 0.02 * Math.sin(t * 26) * campana(t, T.envuelve1, T.vuelta0 + 0.1);
    p.cabeza.ang += 0.03 * Math.sin(t * 26) * campana(t, T.envuelve1, T.vuelta0 + 0.1);
    // niega con la cabeza al final
    p.cabeza.ang += 0.06 * Math.sin((t - T.narizK0 - 0.1) * 11) * campana(t, T.narizK0 + 0.1, T.camara + 0.1);
    p.cara = cara(linea(GUION_CK, CK, "pose", t), parpadeo(t, PARP_K));
    // manos: la cercana siempre en el bolsillo; la lejana lo hace todo
    const res = resolutor(KR, p, "cerca"), resL = resolutor(KR, p, "lejos");
    const PALMA_ARRIBA = D5(0.85, 0.95, 0.95, 0.95, 0.95), PINZ = D5(0.62, 0.66, 0.2, 0.18, 1), STOP = D(1, 1, 1, 1);
    const MT = matTronco(G, pG);
    const nudoW = () => porMatriz(MT, ATADAS.n);
    const giroNudo = k => { const a = 4 * Math.PI * k; return P(9 * Math.cos(a) * campana(k, 0, 1), 7 * Math.sin(a) * campana(k, 0, 1)); };
    const PISTA_L = [
      [0, 0, { hoja: P(500, 562), mu: Math.PI, ang: 0, dedos: PALMA_ARRIBA, dobla: 1 }],
      [T.ofrece0, T.ofrece1, { hoja: P(632, 506), mu: Math.PI, ang: -0.05, dedos: PALMA_ARRIBA, dobla: 1 }],
      [T.suelta + 0.05, T.retiraK1, { bols: true }],
      [T.palma0, T.palma1, { mundo: () => porMatriz(t < T.choca ? matTronco(G, poseGCuerpo(T.choca)) : MT, P(424, 420)), ref: PALMA, mu: Math.PI / 2 + 0.25, dedos: STOP, dobla: 1 }, salida],
      [T.pellizca0, T.pellizca1, { mundo: () => porMatriz(MT, COLGANTE[5]), ref: PINZA, mu: -2.3, dedos: PINZ, dobla: 1 }],
      [T.tiron2, T.tiron2 + 0.09, { hoja: P(470, 520), mu: -2.6, dedos: PINZ, dobla: 1 }, salida],
      [T.tiron2 + 0.1, T.cae2 - 0.03, { hoja: P(590, 560), mu: Math.PI, ang: 0, dedos: PALMA_ARRIBA, dobla: 1 }],
      [T.preparaK0, T.lanzaK - 0.08, { hoja: P(560, 610), mu: Math.PI, ang: 0.15, dedos: PALMA_ARRIBA, dobla: 1 }],
      [T.lanzaK - 0.08, T.lanzaK + 0.02, { hoja: P(600, 470), mu: Math.PI, ang: -0.35, dedos: STOP, dobla: 1 }, salida],
      [T.lanzaK + 0.04, T.lanzaK + 0.26, { hoja: P(520, 590), mu: -2.2, dedos: PINZ, dobla: 1 }],
      [T.lanzaK + 0.3, T.nudo0, { mundo: () => nudoW(), ref: PINZA, mu: -2.5, dedos: PINZ, dobla: 1 }],
      [T.nudo0, T.nudo1, { mundo: () => { const k = fase(t, T.nudo0, T.nudo1), o = giroNudo(k), n = nudoW(); return P(n.x + o.x, n.y + o.y); }, ref: PINZA, mu: -2.5, dedos: PINZ, dobla: 1 }],
      [T.retiraK2, T.retiraK3, { bols: true }]
    ];
    const C = pista([[0, 0, { bols: true }]], t, res), L = pista(PISTA_L, t, resL);
    // al chocar el paquete, la palma cede un poco
    L.x -= 10 * campana(t, T.choca, T.choca + 0.16);
    p.manoCerca = mano(C); p.manoLejos = mano(L);
    return p;
  }
  function poses(t) { const pG = poseGCuerpo(t), pK = poseK(t, pG); manosG(t, pG, pK); return { pG, pK }; }
  const memoP = new Map();
  const poseEn = tt => { if (!memoP.has(tt)) memoP.set(tt, poses(tt)); return memoP.get(tt); };

  /* ================= el jersey en cada momento: qué se dibuja y en qué capa ================= */
  // capas: L1 detrás de Guillermo · L2 sobre su torso · L3 en su mano lejana · L4 encima de él · L5 en la mano de Kiriku · L6 encima de todo
  function balanceoJersey(t) {
    const dt = t - T.cae2;
    return 0.9 * Math.exp(-dt * 4.5) * Math.cos(dt * 11)
      + 0.04 * Math.sin(dt * 2.3) + 0.35 * campana(t, T.preparaK0, T.lanzaK);
  }
  function jersey(t, pG, pK) {
    const L = { L1: [], L2: [], L3: [], L4: [], L5: [], L6: [] };
    const MT = matTronco(G, pG);
    const mundo = (J, partes) => g => { g.save(); g.setTransform(MATRIZ); dibJ(g, J, partes); g.restore(); };
    const torso = (J, partes) => g => { g.save(); g.setTransform(MATRIZ.multiply(MT)); dibJ(g, J, partes); g.restore(); };
    const manosW = () => ({ A: aW(G, pG, ptHoja(pG.manoCerca, PINZA)), B: aW(G, pG, ptHoja(pG.manoLejos, PINZA)) });
    // 1. doblado sobre la palma de Kiriku
    if (t < T.suelta) { L.L6.push(mundo(doblado(palmaK(pK)))); return L; }
    // 2. en las manos de Guillermo: se despliega al alzarlo
    if (t < T.lanza) {
      const m = manosW(), k = suave(fase(t, T.suelta, T.alza1));
      const d = doblado(P((m.A.x + m.B.x) / 2, (m.A.y + m.B.y) / 2 + 14)), a = abierto(m.A, m.B, t);
      const J = { u: S, Q: lerpL(d.Q, a.Q, k), A: lerpL(d.A, a.A, k), B: lerpL(d.B, a.B, k) };
      J.Q[0] = m.A; J.Q[1] = m.B;
      (t < T.suelta + 0.12 ? L.L6 : L.L3).push(mundo(J));
      return L;
    }
    // 3. al aire y sobre los hombros
    if (t < T.posa) {
      const { pG: p0 } = poseEn(T.lanza), m0 = { A: aW(G, p0, ptHoja(p0.manoCerca, PINZA)), B: aW(G, p0, ptHoja(p0.manoLejos, PINZA)) };
      const J0 = abierto(m0.A, m0.B, T.lanza), J1 = hombrosMundo(pG, ARRIBA);
      const u = fase(t, T.lanza, T.posa), cima = P(pG.x - 10, 52);
      const J = vuelo(J0, J1, u, cima, -0.5, t, 9, potencia(1.6));
      (u < uCima(1.6) ? L.L3 : L.L1).push(mundo(J));
      return L;
    }
    const sh = sobreHombros(t, pG);
    if (sh) {
      const J = { u: 1, Q: ESPALDA, A: sh.A, B: sh.B, nudo: sh.nudo, rollos: sh.rollos, R: ROLLOS };
      if (sh.slide > 0) {
        const f = resbalon(sh.slide);
        J.Q = J.Q.map(f); J.A = J.A.map(f); J.B = J.B.map(f); J.R = ROLLOS.map(R => R.map(f)); if (J.nudo) J.nudo = Object.assign({}, J.nudo, { c: f(J.nudo.c) });
      }
      L.L1.push(torso(J, { cuerpo: 1 }));
      (sh.encima ? L.L4 : L.L2).push(torso(J, { mangas: 1, nudo: 1 }));
      L.L2.push(torso(J, { rollos: 1 }));
      return L;
    }
    // 4. paquete
    if (t >= T.vueltaSwap && t < T.desSwap) {
      const pinzado = t >= T.pellizca1;
      L.L4.push(g => { g.save(); g.setTransform(MATRIZ.multiply(MT)); paquete(g, t, pinzado); g.restore(); });
      if (pinzado) {
        const a = porMatriz(MT, NUDO_P), b = aW(KR, pK, ptHoja(pK.manoLejos, PINZA));
        const M = mangaA(a, b, 70).map((q, i) => i && i < 5 ? P(q.x, q.y + 4 * Math.sin(Math.PI * i / 5) * (1 - tramo(t, T.tiron2 - 0.02, T.tiron2 + 0.03))) : q);
        L.L4.push(mundo({ u: S, A: M, B: null }, { mangas: 1 }));
      }
      return L;
    }
    // 5. desenrollado: vuela al antebrazo de Kiriku y cuelga de él
    if (t >= T.desSwap && t < T.lanzaK) {
      const H = antebrazoK(pK);
      if (t < T.cae2) {
        const { pG: p0 } = poseEn(T.desSwap), c0 = porMatriz(matTronco(G, p0), P(250, 420));
        const J0 = estirado(c0, 96, 112), J1 = antebrazo(H, 0.9);
        const u = fase(t, T.desSwap, T.cae2), J = vuelo(J0, J1, u, P((c0.x + H.x) / 2 + 10, Math.min(c0.y, H.y) - 70), 1.2, t, 10, salida);
        const ab = salida(fase(t, T.desSwap, T.desSwap + 0.08)), c = centroJ(J);     // sale de canto y se abre
        const ap = q => P(c.x + (q.x - c.x) * ab, q.y);
        L.L5.push(mundo({ u: S, Q: J.Q.map(ap), A: J.A.map(ap), B: J.B.map(ap) }));
      } else {
        const sw = balanceoJersey(t);
        L.L5.push(mundo(antebrazo(H, sw)));
      }
      return L;
    }
    // 6. de vuelta por encima de la cabeza
    if (t >= T.lanzaK && t < T.posaK) {
      const { pK: k0 } = poseEn(T.lanzaK), J0 = antebrazo(antebrazoK(k0), balanceoJersey(T.lanzaK));
      const J1 = hombrosMundo(pG, ARRIBA), u = fase(t, T.lanzaK, T.posaK), cima = P(pG.x - 10, 52);
      const J = vuelo(J0, J1, u, cima, 0.6, t, 9, potencia(1.5));
      (u < uCima(1.5) ? L.L5 : L.L1).push(mundo(J));
      return L;
    }
    // 7. se escurre y cae al césped
    if (t >= T.resbala1) {
      const { pG: p0 } = poseEn(T.resbala1), sh0 = sobreHombros(T.resbala1 - 1e-4, p0), f = resbalon(sh0.slide), M0 = matTronco(G, p0);
      const w = q => porMatriz(M0, f(q));
      const J0 = { u: S, Q: ESPALDA.map(w), A: sh0.A.map(w), B: sh0.B.map(w) };
      const J1 = monton(P(p0.x + 116, SUELO - 1));
      const u = fase(t, T.resbala1, T.caida1);
      const J = u < 1 ? vuelo(J0, J1, u, P((centroJ(J0).x + J1.Q[0].x) / 2 + 20, centroJ(J0).y + 10), 0.5, t, 6, entrada) : J1;
      (u < 0.6 ? L.L1 : L.L4).push(mundo(J));                      // resbala por la espalda y cae a su lado, delante
      return L;
    }
    return L;
  }

  /* ================= efectos ================= */
  function estrella(g, x, y, r, a, col = "#fff6c8") {
    if (a <= 0.01 || r <= 0.1) return;
    g.save(); g.globalAlpha = clamp(a); g.translate(x, y); g.fillStyle = col; g.strokeStyle = "rgba(70,40,10,0.7)"; g.lineWidth = 1;
    g.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.42 : r, an = -Math.PI / 2 + i * Math.PI / 5; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  function destello(g, x, y, r, a) {     // brillo de cuatro puntas
    if (a <= 0.01) return;
    g.save(); g.globalAlpha = clamp(a); g.translate(x, y); g.fillStyle = "#ffffff";
    g.beginPath(); g.moveTo(0, -r); g.quadraticCurveTo(r * 0.12, -r * 0.12, r, 0); g.quadraticCurveTo(r * 0.12, r * 0.12, 0, r); g.quadraticCurveTo(-r * 0.12, r * 0.12, -r, 0); g.quadraticCurveTo(-r * 0.12, -r * 0.12, 0, -r); g.fill();
    g.globalAlpha = clamp(a) * 0.5; g.beginPath(); g.arc(0, 0, r * 0.35, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function rayas(g, x, y, ang, n, l, a, col = "#ffffff") {
    if (a <= 0.01) return;
    g.save(); g.globalAlpha = clamp(a); g.strokeStyle = col; g.lineWidth = 2.2; g.lineCap = "round";
    for (let i = 0; i < n; i++) { const an = ang + (i - (n - 1) / 2) * 0.35, r0 = 8; g.beginPath(); g.moveTo(x + Math.cos(an) * r0, y + Math.sin(an) * r0); g.lineTo(x + Math.cos(an) * (r0 + l), y + Math.sin(an) * (r0 + l)); g.stroke(); }
    g.restore();
  }
  function efectos(g, t, pG, pK) {
    const HG = G.cabeza(pG), cabW = q => aW(G, pG, HG.a(q));
    // ilusión: chispas en los ojos al ver el jersey abierto
    const il = campana(t, T.alza1 - 0.25, T.admira1 + 0.05);
    if (il > 0.01) { const c = cabW(P(840, 560)); for (let i = 0; i < 3; i++) { const a = t * 4 + i * 2.1; destello(g, c.x + Math.cos(a) * 34, c.y - 26 + Math.sin(a) * 14, 5 + 2 * Math.sin(t * 9 + i), il); } }
    // tirón: rayas de esfuerzo
    const tr = campana(t, T.cruza1, T.ahoga + 0.05);
    if (tr > 0.01) { const c = aW(G, pG, G.tronco(pG)(P(240, 400))); rayas(g, c.x - 52, c.y, Math.PI, 3, 12, tr); rayas(g, c.x + 52, c.y, 0, 3, 12, tr); }
    // ahogo: rayitas de agobio junto a la cabeza
    const ah = campana(t, T.ahoga, T.ahoga1);
    if (ah > 0.01) { const c = cabW(P(760, 420)); rayas(g, c.x, c.y - 30, -Math.PI / 2 + 0.1 * Math.sin(t * 20), 3, 10 + 3 * Math.sin(t * 25), ah); }
    // la soga aprieta: rayitas que salen del cuello a los dos lados del nudo
    const ap = campana(t, T.ahoga - 0.06, T.afloja0 + 0.04);
    if (ap > 0.01) {
      const MT = matTronco(G, pG), k = porMatriz(MT, NUDO_C), lat = 0.75 + 0.25 * Math.sin(t * 26);
      for (const q of [P(196, 304), P(306, 308)]) { const w = porMatriz(MT, q); rayas(g, w.x, w.y, Math.atan2(w.y - k.y, w.x - k.x), 3, 9 * lat, ap, "#ffffff"); }
      rayas(g, k.x, k.y + 4, Math.PI / 2, 3, 7 * lat, ap * 0.9, "#ffe2dc");
    }
    // ¡pop! al aflojarlo
    const po = campana(t, T.afloja0 + 0.08, T.afloja1 + 0.15);
    if (po > 0.01) { const c = aW(G, pG, G.tronco(pG)(P(250, 300))); rayas(g, c.x, c.y, -Math.PI / 2, 5, 14, po); }
    // latigazo de las mangas
    const la = campana(t, T.abre1 - 0.04, T.envuelve1 + 0.1);
    if (la > 0.01) {
      const c = aW(G, pG, G.tronco(pG)(P(240, 460)));
      g.save(); g.globalAlpha = la * 0.9; g.strokeStyle = "#ffffff"; g.lineWidth = 2.4; g.lineCap = "round";
      for (const [r, a0] of [[62, 0.2], [72, 3.0], [54, 1.6]]) { g.beginPath(); g.ellipse(c.x, c.y, r, r * 0.28, 0, a0 + t * 8, a0 + t * 8 + 1.4); g.stroke(); }
      g.restore();
    }
    // giros: rayas de vuelta
    for (const [a, b] of [[T.vuelta0, T.vuelta1], [T.tiron2, T.desenrolla1 + 0.1]]) {
      const k = campana(t, a, b); if (k <= 0.01) continue;
      const c = aW(G, pG, G.tronco(pG)(P(250, 420)));
      g.save(); g.globalAlpha = k * 0.85; g.lineCap = "round";
      for (let i = 0; i < 4; i++) { const yy = c.y - 90 + i * 55, r = 66 - i * 4; g.strokeStyle = i % 2 ? "#ffffff" : "rgba(242,150,139,0.9)"; g.lineWidth = 2.6;
        g.beginPath(); g.ellipse(c.x, yy, r, 9, 0, t * 14 + i, t * 14 + i + 2.2); g.stroke(); }
      g.restore();
    }
    // choque con la palma
    const ch = campana(t, T.choca - 0.02, T.choca + 0.2);
    if (ch > 0.01) { const c = aW(KR, pK, ptHoja(pK.manoLejos, PALMA)); estrella(g, c.x + 6, c.y - 14, 9 * salida(ch), ch); rayas(g, c.x + 4, c.y, Math.PI * 0.95, 3, 10, ch); }
    // mareo: estrellitas alrededor de la cabeza
    const mr = clamp(fase(t, T.desenrolla1 - 0.15, T.desenrolla1 + 0.05)) * (1 - tramo(t, T.despierta - 0.1, T.despierta + 0.15));
    if (mr > 0.01) { const c = cabW(P(780, 300)); for (let i = 0; i < 4; i++) { const a = t * 5 + i * Math.PI / 2; estrella(g, c.x + Math.cos(a) * 46, c.y + Math.sin(a) * 12, 6, mr * (0.6 + 0.4 * Math.sin(a))); } }
    // el nudo perfecto: destello
    const br = fase(t, T.nudo1 - 0.04, T.nudo1 + 0.5);
    if (br > 0 && br < 1) { const c = porMatriz(matTronco(G, pG), ATADAS.n); destello(g, c.x - 12, c.y - 8, 18 * Math.sin(Math.PI * br), 1 - br * 0.6);
      destello(g, c.x + 16, c.y + 10, 9 * Math.sin(Math.PI * clamp(br * 1.4 - 0.2)), 1 - br); destello(g, c.x - 22, c.y + 18, 6 * Math.sin(Math.PI * clamp(br * 1.3 - 0.1)), 1 - br); }
    // golpe de muñeca de Kiriku
    const gm = campana(t, T.lanzaK - 0.06, T.lanzaK + 0.12);
    if (gm > 0.01) { const c = aW(KR, pK, ptHoja(pK.manoLejos, PUNO)); rayas(g, c.x + 8, c.y - 6, -0.9, 3, 12, gm); }
    // polvo al caer al césped
    const pv = fase(t, T.caida1 - 0.02, T.caida1 + 0.45);
    if (pv > 0 && pv < 1) {
      const { pG: p0 } = poseEn(T.resbala1), c = P(p0.x + 116, SUELO);
      g.save(); g.globalAlpha = 0.55 * (1 - pv); g.fillStyle = "#e9f2d8";
      for (let i = 0; i < 6; i++) { const a = Math.PI + i * Math.PI / 5, r = 10 + 34 * salida(pv); g.beginPath(); g.ellipse(c.x + Math.cos(a) * r * 1.4, c.y - 4 + Math.sin(a) * r * 0.25, 6 + 5 * pv, 4 + 3 * pv, 0, 0, Math.PI * 2); g.fill(); }
      g.restore();
    }
  }

  /* ================= decorado ================= */
  let fondo = null;
  const HORIZ = 268, VALLA = 392;
  function creaFondo() {
    const c = document.createElement("canvas"); c.width = W + 360; c.height = H + 140; const g = c.getContext("2d");
    g.translate(180, 70); g.lineJoin = "round"; g.lineCap = "round";
    // cielo
    const ci = g.createLinearGradient(0, -70, 0, HORIZ); ci.addColorStop(0, "#58aee8"); ci.addColorStop(0.7, "#9fd3f3"); ci.addColorStop(1, "#d8f1fc");
    g.fillStyle = ci; g.fillRect(-180, -70, W + 360, HORIZ + 70);
    const so = g.createRadialGradient(80, 10, 6, 80, 10, 260); so.addColorStop(0, "rgba(255,255,240,0.9)"); so.addColorStop(0.3, "rgba(255,252,225,0.35)"); so.addColorStop(1, "rgba(255,250,220,0)");
    g.fillStyle = so; g.fillRect(-180, -70, 700, 400);
    for (const [x, y, w] of [[300, 70, 120], [640, 40, 90], [900, 110, 140], [-60, 130, 100]]) {
      g.fillStyle = "rgba(255,255,255,0.85)"; g.beginPath(); g.ellipse(x, y, w, 15, 0, 0, Math.PI * 2); g.ellipse(x - w * 0.35, y - 10, w * 0.38, 14, 0, 0, Math.PI * 2); g.ellipse(x + w * 0.25, y - 12, w * 0.42, 16, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "rgba(170,205,230,0.45)"; g.beginPath(); g.ellipse(x + 8, y + 8, w * 0.9, 5, 0, 0, Math.PI * 2); g.fill();
    }
    // cabo con el faro
    g.fillStyle = "#93b6ab"; g.beginPath(); g.moveTo(-180, HORIZ); g.lineTo(-180, HORIZ - 30); g.quadraticCurveTo(-40, HORIZ - 48, 90, HORIZ - 30); g.quadraticCurveTo(200, HORIZ - 14, 300, HORIZ); g.closePath(); g.fill();
    g.fillStyle = "#7fa497"; g.beginPath(); g.moveTo(-180, HORIZ); g.quadraticCurveTo(0, HORIZ - 22, 180, HORIZ - 8); g.lineTo(240, HORIZ); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,0.75)"; for (let i = 0; i < 7; i++) g.fillRect(-120 + i * 26 + hash(i) * 10, HORIZ - 34 + hash(i + 3) * 12, 5, 4);
    g.fillStyle = "#f6f4ee"; g.beginPath(); g.moveTo(40, HORIZ - 38); g.lineTo(52, HORIZ - 38); g.lineTo(50, HORIZ - 70); g.lineTo(42, HORIZ - 70); g.closePath(); g.fill();
    g.fillStyle = "#d8473f"; g.fillRect(42, HORIZ - 58, 8, 6); g.fillRect(41, HORIZ - 76, 10, 6); g.beginPath(); g.moveTo(40, HORIZ - 76); g.lineTo(46, HORIZ - 82); g.lineTo(52, HORIZ - 76); g.closePath(); g.fill();
    // mar
    const ma = g.createLinearGradient(0, HORIZ, 0, VALLA); ma.addColorStop(0, "#3b8fcf"); ma.addColorStop(1, "#2369ac");
    g.fillStyle = ma; g.fillRect(-180, HORIZ, W + 360, VALLA - HORIZ + 4);
    g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 2;
    for (let i = 0; i < 70; i++) { const x = -170 + hash(i * 3.1) * (W + 340), y = HORIZ + 6 + hash(i * 7.7) * (VALLA - HORIZ - 20), l = 6 + hash(i) * 16 * (y - HORIZ) / 100;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,0.5)"; g.fillRect(-180, HORIZ - 1, W + 360, 2);
    // césped con las franjas del cortacésped
    const ys = [VALLA - 4, 410, 428, 450, 476, 508, 546, 592, 650, 700];
    for (let i = 0; i < ys.length - 1; i++) { g.fillStyle = i % 2 ? "#6fb54f" : "#7fc45c"; g.fillRect(-180, ys[i], W + 360, ys[i + 1] - ys[i] + 1); }
    const ce = g.createLinearGradient(0, VALLA, 0, H + 70); ce.addColorStop(0, "rgba(40,90,30,0.15)"); ce.addColorStop(1, "rgba(40,90,30,0)");
    g.fillStyle = ce; g.fillRect(-180, VALLA, W + 360, 300);
    // hortensias delante de la valla (detrás los postes)
    valla(g);
    for (const [x, col, r] of [[-150, 0, 1.1], [-30, 1, 1], [100, 2, 1.15], [236, 0, 0.95], [690, 1, 1.05], [850, 2, 1.1], [1010, 0, 1], [1130, 1, 1.1]]) hortensia(g, x, VALLA + 8, col, r);
    salvavidas(g, 960, 352);
    mastil(g, 790, 438);
    tumbona(g, 70, 476, 1);
    mesita(g, 168, 482);
    tumbona(g, 1000, 488, -1);
    // brillo del sol y viñeta
    const vi = g.createRadialGradient(512, 320, 300, 512, 320, 780); vi.addColorStop(0, "rgba(0,0,0,0)"); vi.addColorStop(1, "rgba(10,40,60,0.35)");
    g.fillStyle = vi; g.fillRect(-180, -70, W + 360, H + 140);
    return c;
  }
  function valla(g) {
    g.save();
    g.fillStyle = "rgba(20,60,40,0.18)"; g.fillRect(-180, VALLA - 2, W + 360, 8);
    for (let x = -176; x < W + 180; x += 46) {
      g.fillStyle = "#fbfbf7"; g.fillRect(x, VALLA - 60, 9, 62); g.fillStyle = "#d9dfe2"; g.fillRect(x + 6, VALLA - 60, 3, 62);
      g.fillStyle = "#fbfbf7"; g.beginPath(); g.moveTo(x - 2, VALLA - 60); g.lineTo(x + 4.5, VALLA - 68); g.lineTo(x + 11, VALLA - 60); g.closePath(); g.fill();
      g.strokeStyle = "rgba(60,70,80,0.55)"; g.lineWidth = 1.2; g.strokeRect(x, VALLA - 60, 9, 62);
    }
    for (const y of [VALLA - 50, VALLA - 24]) { g.fillStyle = "#fbfbf7"; g.fillRect(-180, y, W + 360, 7); g.fillStyle = "#cfd6da"; g.fillRect(-180, y + 5, W + 360, 2); g.fillStyle = "rgba(20,40,60,0.12)"; g.fillRect(-180, y + 7, W + 360, 3); }
    g.restore();
  }
  const COL_HORT = [["#6f92e6", "#8fb0f4", "#4f6fc4"], ["#d98ac8", "#f0aedd", "#b46aa6"], ["#a98be0", "#c8b0f2", "#8466be"]];
  function hortensia(g, x, y, ci, k) {
    const [c, l, s] = COL_HORT[ci];
    g.save(); g.translate(x, y); g.scale(k, k);
    g.fillStyle = "#3f8a3c"; for (const [dx, dy, a] of [[-34, -6, -0.5], [30, -4, 0.5], [-10, 4, -0.2], [14, 6, 0.3], [-46, 6, -0.8], [44, 6, 0.8]]) { g.beginPath(); g.ellipse(dx, dy, 16, 8, a, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#2f6f30"; g.beginPath(); g.ellipse(0, 8, 44, 8, 0, 0, Math.PI * 2); g.fill();
    for (const [dx, dy, r] of [[-26, -26, 20], [8, -34, 22], [32, -20, 18], [-6, -14, 19]]) {
      g.fillStyle = s; g.beginPath(); g.arc(dx, dy + 3, r, 0, Math.PI * 2); g.fill();
      g.fillStyle = c; g.beginPath(); g.arc(dx, dy, r, 0, Math.PI * 2); g.fill();
      g.fillStyle = l; for (let i = 0; i < 9; i++) { const a = i * 2.4 + dx, rr = r * 0.6 * Math.sqrt(hash(i + dx)); g.beginPath(); g.arc(dx + Math.cos(a) * rr - 2, dy + Math.sin(a) * rr - 3, 3.2, 0, Math.PI * 2); g.fill(); }
    }
    g.restore();
  }
  function salvavidas(g, x, y) {
    g.save(); g.translate(x, y);
    g.strokeStyle = "#eae6dc"; g.lineWidth = 2; g.beginPath(); g.moveTo(-8, -26); g.lineTo(0, -18); g.lineTo(8, -26); g.stroke();
    for (let i = 0; i < 8; i++) { g.strokeStyle = i % 2 ? "#ffffff" : "#e2453c"; g.lineWidth = 9; g.beginPath(); g.arc(0, 0, 16, i * Math.PI / 4, (i + 1) * Math.PI / 4); g.stroke(); }
    g.strokeStyle = "rgba(40,20,20,0.6)"; g.lineWidth = 1.2; g.beginPath(); g.arc(0, 0, 20.5, 0, Math.PI * 2); g.arc(0, 0, 11.5, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "#d8cfae"; g.lineWidth = 1.6; g.beginPath(); g.arc(0, 0, 16, 0.3, 1.2); g.stroke();
    g.restore();
  }
  function mastil(g, x, y) {
    g.save();
    g.fillStyle = "rgba(30,70,30,0.25)"; g.beginPath(); g.ellipse(x, y + 2, 16, 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#f4f2ea"; g.fillRect(x - 3.5, 66, 7, y - 66); g.fillStyle = "#cfd4d6"; g.fillRect(x + 1.5, 66, 2, y - 66);
    g.strokeStyle = "rgba(60,60,70,0.6)"; g.lineWidth = 1; g.strokeRect(x - 3.5, 66, 7, y - 66);
    g.fillStyle = "#e8c35a"; g.beginPath(); g.arc(x, 62, 6, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#7a5a10"; g.stroke();
    g.strokeStyle = "rgba(240,240,240,0.8)"; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 4, 80); g.lineTo(x + 6, y - 30); g.stroke();
    g.fillStyle = "#f4f2ea"; g.fillRect(x - 10, y - 6, 20, 8);
    g.restore();
  }
  function gallardete(g, t) {           // ondea: navy con franja blanca y borde rojo, sin letras
    const x0 = 793, y0 = 76, L = 78, h = 30, n = 12, top = [], bot = [];
    for (let i = 0; i <= n; i++) {
      const k = i / n, w = 5 * k * Math.sin(t * 6.2 - k * 5) + 2 * k * Math.sin(t * 11 - k * 9);
      const x = x0 + L * k, hh = h * (1 - k * 0.92) / 2;
      top.push(P(x, y0 + h / 2 - hh + w)); bot.push(P(x, y0 + h / 2 + hh + w));
    }
    g.save(); g.lineJoin = "round";
    g.beginPath(); g.moveTo(top[0].x, top[0].y); for (const q of top) g.lineTo(q.x, q.y); for (let i = n; i >= 0; i--) g.lineTo(bot[i].x, bot[i].y); g.closePath();
    g.fillStyle = "#1d2e66"; g.fill();
    g.save(); g.clip();
    g.strokeStyle = "#ffffff"; g.lineWidth = 6; g.beginPath(); for (let i = 0; i <= n; i++) { const q = lerpP(top[i], bot[i], 0.5); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); } g.stroke();
    g.fillStyle = "#d8383a"; g.fillRect(x0 - 2, y0 - 10, 7, h + 20);
    g.restore();
    g.strokeStyle = "rgba(10,10,30,0.6)"; g.lineWidth = 1.2; g.stroke();
    g.restore();
  }
  function tumbona(g, x, y, sg) {
    g.save(); g.translate(x, y); g.scale(sg, 1);
    g.fillStyle = "rgba(30,70,30,0.22)"; g.beginPath(); g.ellipse(0, 4, 54, 7, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#a8743c"; g.lineWidth = 5; g.lineCap = "round";
    g.beginPath(); g.moveTo(-44, 0); g.lineTo(18, -86); g.moveTo(42, 0); g.lineTo(-14, -52); g.moveTo(-26, 0); g.lineTo(26, -40); g.stroke();
    g.strokeStyle = "#8c5c2a"; g.lineWidth = 4; g.beginPath(); g.moveTo(-34, -44); g.lineTo(34, -44); g.stroke();
    // lona de rayas
    const lona = () => { g.beginPath(); g.moveTo(14, -86); g.quadraticCurveTo(-10, -40, -30, -26); g.lineTo(-18, -18); g.quadraticCurveTo(2, -34, 26, -80); g.closePath(); };
    lona(); g.fillStyle = "#ffffff"; g.fill();
    g.save(); lona(); g.clip(); g.fillStyle = "#2f63b8"; for (let i = -6; i < 6; i++) { g.save(); g.translate(i * 10, 0); g.rotate(0.55); g.fillRect(-3, -120, 5, 160); g.restore(); } g.restore();
    lona(); g.strokeStyle = "rgba(20,30,60,0.6)"; g.lineWidth = 1.4; g.stroke();
    g.restore();
  }
  function mesita(g, x, y) {
    g.save(); g.translate(x, y);
    g.fillStyle = "rgba(30,70,30,0.22)"; g.beginPath(); g.ellipse(0, 3, 24, 5, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#f2f2ee"; g.lineWidth = 3; g.beginPath(); g.moveTo(-14, 0); g.lineTo(-4, -34); g.moveTo(14, 0); g.lineTo(4, -34); g.stroke();
    g.fillStyle = "#f7f7f2"; g.beginPath(); g.ellipse(0, -36, 22, 5, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = "rgba(60,70,80,0.5)"; g.lineWidth = 1; g.stroke();
    // limonada
    g.fillStyle = "rgba(255,240,150,0.85)"; g.fillRect(-8, -54, 10, 16); g.strokeStyle = "rgba(80,90,90,0.6)"; g.strokeRect(-8, -54, 10, 16);
    g.fillStyle = "#f6e04a"; g.beginPath(); g.arc(-8, -54, 4, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#e8524a"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-1, -54); g.lineTo(4, -66); g.stroke();
    g.restore();
  }
  function veleros(g, t) {
    for (const [x, y, k, f] of [[640, HORIZ + 6, 0.8, 0], [900, HORIZ + 10, 1, 1.7], [-90, HORIZ + 30, 1.2, 3.1]]) {
      const b = 1.2 * Math.sin(t * 1.6 + f), r = 0.04 * Math.sin(t * 1.3 + f);
      g.save(); g.translate(x + 3 * Math.sin(t * 0.2 + f), y + b); g.rotate(r); g.scale(k, k);
      g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(0, -4); g.lineTo(0, -38); g.lineTo(16, -6); g.closePath(); g.fill();
      g.fillStyle = "#e9eef2"; g.beginPath(); g.moveTo(-2, -6); g.lineTo(-2, -30); g.lineTo(-14, -6); g.closePath(); g.fill();
      g.strokeStyle = "rgba(40,60,80,0.6)"; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -40); g.lineTo(0, -2); g.stroke();
      g.fillStyle = "#1d2e66"; g.beginPath(); g.moveTo(-16, -4); g.lineTo(18, -4); g.lineTo(13, 2); g.lineTo(-12, 2); g.closePath(); g.fill();
      g.restore();
    }
  }
  function gaviotas(g, t) {
    g.save(); g.strokeStyle = "rgba(40,50,70,0.75)"; g.lineWidth = 1.8; g.lineCap = "round";
    for (const [x0, y0, v, f] of [[120, 120, 14, 0], [700, 150, -10, 2]]) {
      const x = x0 + v * t + 6 * Math.sin(t * 0.7 + f), y = y0 + 8 * Math.sin(t * 0.9 + f), a = 4 * Math.sin(t * 7 + f);
      g.beginPath(); g.moveTo(x - 9, y - 2 - a); g.quadraticCurveTo(x - 4, y - 5, x, y); g.quadraticCurveTo(x + 4, y - 5, x + 9, y - 2 - a); g.stroke();
    }
    g.restore();
  }
  function brillosMar(g, t) {
    g.save(); g.fillStyle = "#ffffff";
    for (let i = 0; i < 12; i++) { const x = -150 + hash(i * 5.3) * 1300, y = HORIZ + 8 + hash(i * 2.9) * 100, k = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.7);
      g.globalAlpha = 0.7 * k * k; g.beginPath(); g.ellipse(x, y, 5 * k + 1, 1.2, 0, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }

  /* ---------- cámara ---------- */
  const PLANOS = [
    [0, 1.0, 430, 300], [0.9, 1.0, 430, 300], [2.6, 1.04, 510, 300], [3.0, 1.07, 515, 302], [5.0, 1.07, 515, 302], [5.3, 1.0, 512, 292],
    [5.9, 1.0, 512, 292], [6.3, 1.08, 522, 300], [8.3, 1.08, 522, 300], [8.7, 1.03, 532, 300], [9.8, 1.03, 532, 300], [10.2, 1.05, 525, 302],
    [10.9, 1.05, 525, 302], [11.2, 1.0, 518, 292], [11.6, 1.0, 518, 292], [11.95, 1.1, 525, 300], [12.8, 1.1, 525, 300], [13.3, 1.03, 545, 300],
    [13.9, 1.03, 545, 300], [14.3, 1.06, 540, 300], [DUR, 1.06, 540, 300]
  ];
  function camara(t) {
    let i = 0; while (i < PLANOS.length - 2 && t > PLANOS[i + 1][0]) i++;
    const a = PLANOS[i], b = PLANOS[i + 1], k = suave(fase(t, a[0], b[0]));
    const kk = lerp(a[1], b[1], k), x = lerp(a[2], b[2], k), y = lerp(a[3], b[3], k);
    const mx = W / 2 / kk, my = H / 2 / kk;
    const tem = campana(t, T.choca - 0.02, T.choca + 0.18) * 1.4 + campana(t, T.caida1 - 0.02, T.caida1 + 0.18) * 1.0;
    return { k: kk, x: clamp(x, mx - 170, W + 170 - mx) + tem * ruido(t * 30), y: clamp(y, my - 60, H + 60 - my) + tem * ruido(t * 27 + 4) };
  }

  const pose = t => { const { pG, pK } = poses(t); return { g: pG, k: pK }; };
  class GuillermoKirikuJersey extends Escena2D {
    constructor() { super(DUR); }
    pintar(g, t) {
      if (!G.listo() || !KR.listo()) return;
      if (!fondo) fondo = creaFondo();
      const { pG, pK } = poses(t);
      const luz = tramo(t, NEGRO_INICIO, 0.8, suave) * (1 - tramo(t, T.fin, DUR - NEGRO_FINAL - 0.02, suave));
      const cam = camara(t);
      g.save();
      g.translate(W / 2, H / 2); g.scale(cam.k, cam.k); g.translate(-cam.x, -cam.y);
      MATRIZ = g.getTransform();
      g.drawImage(fondo, -180, -70);
      brillosMar(g, t); veleros(g, t); gaviotas(g, t); gallardete(g, t);
      // sombras en el césped
      g.save(); g.fillStyle = "rgba(30,70,30,0.3)";
      const anchoG = 62 * Math.max(0.25, Math.abs(pG.o)) * (1 - 0.3 * clamp(altoSalto(t) / 34));
      g.beginPath(); g.ellipse(pG.x, pG.suelo + 3, anchoG, 8 * (pG.s / S), 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pK.x, SUELO + 3, 60, 8, 0, 0, Math.PI * 2); g.fill(); g.restore();
      const capas = jersey(t, pG, pK);
      for (const f of capas.L1) f(g);
      pG.capaTronco = () => { for (const f of capas.L2) f(g); };
      if (capas.L3.length) pG.manoLejos.objeto = () => { for (const f of capas.L3) f(g); };
      if (capas.L5.length) pK.manoLejos.objeto = () => { for (const f of capas.L5) f(g); };
      g.save(); g.translate(pG.x, 0); g.scale(pG.o, 1); g.translate(-pG.x, 0); G.dibujar(g, pG, t); g.restore();
      for (const f of capas.L4) f(g);
      KR.dibujar(g, pK, t);
      for (const f of capas.L6) f(g);
      efectos(g, t, pG, pK);
      g.restore();
      if (luz < 0.999) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(0, 0, W, H); }
    }
  }
  registrar({ id: "00084.2", nombre: "Guillermo y Kiriku · El jersey", crear: () => new GuillermoKirikuJersey() });
  // diagnóstico: distancia hombro → muñeca de cada mano (y el máximo que alcanza el brazo)
  function diag(t) {
    const { pG, pK } = poses(t), o = {};
    const dist = (Rg, p, lado) => { const m = lado === "cerca" ? p.manoCerca : p.manoLejos, h = Rg.tronco(p)(lado === "cerca" ? Rg.HOMBRO_C : Rg.HOMBRO);
      const mu = m.mu ?? -1.75, w = rota({ x: Math.cos(mu) * R_M, y: Math.sin(mu) * R_M }, m.ang || 0);
      return Math.round(Math.hypot(m.x + w.x - h.x, m.y + w.y - h.y)); };
    o.gC = dist(G, pG, "cerca"); o.gL = dist(G, pG, "lejos"); o.kC = dist(KR, pK, "cerca"); o.kL = dist(KR, pK, "lejos");
    o.max = { gC: Math.round(G.BRAZO_C_L * 1.08), gL: Math.round(G.BRAZO_L * 1.08), kC: Math.round(KR.BRAZO_C_L * 1.08), kL: Math.round(KR.BRAZO_L * 1.08) };
    return o;
  }
  function contactoPalma(t) {
    const {pG, pK} = poses(t);
    return [aW(KR, pK, ptHoja(pK.manoLejos, PALMA)), porMatriz(matTronco(G, pG), P(424,420))];
  }
  window.__A2D_00084_2 = { pose, poseG: t => poses(t).pG, poseK: t => poses(t).pK, T, DUR, diag, contactoPalma, balanceoJersey };
})();
