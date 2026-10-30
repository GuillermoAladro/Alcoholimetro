"use strict";
/* Personaje2D · fábrica de recortables animables a partir de un avatar 2D troceado.
 *
 *   const Laura = Personaje2D.crear("laura", CFG);
 *
 * Devuelve la misma API que `Guillermo` (guillermo.js), así una escena mueve a los dos con la
 * misma maquinaria de posturas: dibujar(g, p, t), cabeza(p), boca(p), centroCabeza(p), tronco(p),
 * aPantalla(p, q), aHoja(p, q), rotP, JK, MUNECA_R, BRAZO_L, BRAZO_C_L, SUELO, PELVIS, CADERA,
 * TOBILLO_ALTO, PUNTA, TALON, CUELLO, HOMBRO, HOMBRO_C, BOLSILLO_C, BOLSILLO_L, K, listo().
 *
 * Las piezas salen de personajes/<id>/piezas.js (personajes/comun/preparar.py). El CFG del
 * personaje (personajes/<id>/<id>.js) solo trae datos: puntos de su hoja, ojos, boca, colores,
 * melena… y, si hace falta, ganchos de dibujo propios (pendientes, gafas, casco…).
 *
 * Unidades: píxeles de la hoja del personaje. `K` (CFG.escala) ajusta su estatura respecto a
 * Guillermo: con el mismo `p.s` los dos quedan a su altura relativa y con los pies en `p.suelo`.
 * Para pasar de pantalla a hoja usa `aHoja(p, q)` (tiene en cuenta K y el espejo).
 *
 * Postura `p` (igual que Guillermo, con estos añadidos opcionales):
 *   p.espejo        true → mira a la izquierda (todo el personaje se refleja alrededor de p.x)
 *   p.pelo          { viento, inercia }: empuje de la melena hacia delante (+) o hacia atrás (−)
 *   mano.dedos      { pulgar, indice, medio, anular, menique } de 0 (doblado) a 1 (estirado);
 *                   sin `dedos` se dibuja el puño de siempre (con `pulgar` para el pulgar arriba)
 *   mano.detras     true → ese brazo se dibuja por detrás del cuerpo y de la cabeza
 *   Sin manoCerca ni manoLejos se dibuja el torso del avatar con las dos manos en los bolsillos.
 *   CFG.siempreLibres (opcional): el torso siempre es el de sin brazos y cada mano que la escena no
 *   da va a su reposo: CFG.reposo[lado] = { en: [x, y] (hoja), mano: {…} } o, si no hay, al bolsillo.
 *   `manoReposo(p, lado)` devuelve esa mano (para mezclarla con la de la escena sin saltos).
 *   Si la escena mueve alguna mano, conviene darlas siempre las dos (la quieta en BOLSILLO_C/L
 *   con puno 0; codo hacia fuera: dobla −1 la cercana y +1 la lejana) para no cambiar de torso.
 */
const Personaje2D = (() => {
  const { clamp, lerp, suave, mezcla } = M2;
  const R = Recortes;
  const rotP = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  const pt = a => ({ x: a[0], y: a[1] });
  const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mezclaColor = (a, b, k) => { const x = hexRgb(a), y = hexRgb(b); return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], k))).join(",")})`; };
  const rgb = c => "#" + c.map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
  const JK = 2.6, MUNECA_R = 13;

  /* ---------- manos (compartidas con guillermo.js) ---------- */
  // Puño en «unidades de jarra», centrado en lo que agarra (el mismo dibujo que el de Guillermo).
  function puno(g, pulgar, col) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const forma = () => { g.beginPath(); g.moveTo(-14, -6); g.quadraticCurveTo(-14, -12, -7, -12); g.lineTo(7, -12);
      g.quadraticCurveTo(14, -12, 14, -5); g.lineTo(14, 6); g.quadraticCurveTo(14, 13, 6, 13); g.lineTo(-8, 13);
      g.quadraticCurveTo(-15, 13, -15, 5); g.closePath(); };
    forma(); g.fillStyle = col.piel; g.fill();
    g.save(); forma(); g.clip(); g.fillStyle = col.sombra; g.beginPath(); g.ellipse(-2, 13, 18, 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
    forma(); g.lineWidth = 2.2; g.strokeStyle = col.tinta; g.stroke();
    g.lineWidth = 1.4; g.beginPath(); for (let i = -1; i <= 1; i++) { g.moveTo(14, i * 5.6 + 1); g.lineTo(7, i * 5.6 + 1.6); } g.stroke();
    const pu = clamp(pulgar || 0);
    if (pu < 0.5) {
      g.beginPath(); g.moveTo(-9, -11); g.quadraticCurveTo(2, -16, 10, -9); g.quadraticCurveTo(4, -5, -6, -6); g.closePath();
      g.fillStyle = col.piel; g.fill(); g.lineWidth = 1.8; g.stroke();
    } else {
      const L = 22 * (pu - 0.5) * 2;
      g.beginPath(); g.moveTo(-9, -8); g.lineTo(-9, -12 - L); g.quadraticCurveTo(-9, -19 - L, -3, -19 - L); g.quadraticCurveTo(3, -19 - L, 3, -12 - L); g.lineTo(3, -9); g.closePath();
      g.fillStyle = col.piel; g.fill(); g.lineWidth = 1.8; g.stroke();
      g.lineWidth = 1.1; g.beginPath(); g.moveTo(-6, -15 - L); g.quadraticCurveTo(-3, -17 - L, 0, -15 - L); g.stroke();
    }
    g.restore();
  }

  /* Mano con dedos (unidades de jarra, mismo origen que el puño). Cada dedo va de 0 (doblado) a 1
   * (estirado), así cualquier gesto se mezcla con otro sin saltos:
   *   puño / piedra {todos 0} · palma, saludo, papel {todos 1} · señalar {indice 1} · tijera / V
   *   {indice 1, medio 1} · pulgar arriba {pulgar 1} · agarrar algo {todos ≈ 0,35 + mano.objeto}.
   * Se dibuja en un marco girado hacia la muñeca: la muñeca queda arriba (0, −13), los dedos hacia
   * +y y el pulgar hacia +x (hacia donde mira el personaje). */
  const DEDOS = [   // nombre, x de la base, largo, abanico (rad hacia el pulgar)
    ["indice", 6.9, 14.5, 0.17], ["medio", 2.3, 16, 0.05], ["anular", -2.3, 15, -0.07], ["menique", -6.7, 12, -0.2]];
  function mano(g, m, col) {
    const d = m.dedos || {}, e = n => clamp(d[n] ?? 0);
    const mu = m.mu ?? -1.75, muL = m.espejo ? Math.PI - mu : mu;
    const abre = (e("indice") + e("medio") + e("anular") + e("menique")) / 4;
    const W = 5.3, TI = 1.9;                     // ancho del dedo y grosor de la tinta
    g.save(); g.rotate(muL + Math.PI / 2); g.lineJoin = "round"; g.lineCap = "round";
    const palma = () => { g.beginPath(); g.moveTo(-7.5, -12.5); g.lineTo(7.5, -12.5); g.bezierCurveTo(10.5, -9, 11, -3, 10.5, 2);
      g.quadraticCurveTo(10, 6.5, 6, 7); g.lineTo(-6, 7); g.quadraticCurveTo(-10, 6.5, -10.2, 2); g.bezierCurveTo(-10.6, -3, -10.2, -9, -7.5, -12.5); g.closePath(); };
    const dedos = DEDOS.map(([n, x, L, ab]) => {
      const k = e(n), ang = ab * (0.4 + 0.9 * abre), largo = 3.2 + (L - 3.2) * Math.pow(k, 0.85);
      const b = { x, y: 4.5 }, f = { x: x + Math.sin(ang) * largo, y: 4.5 + Math.cos(ang) * largo };
      return { k, b, f, x };
    });
    const ruta = q => { g.beginPath(); g.moveTo(q.b.x, q.b.y); g.lineTo(q.f.x, q.f.y); };
    // silueta: tinta por fuera y piel por dentro (los dedos y la palma quedan como una sola forma)
    g.strokeStyle = col.tinta; g.fillStyle = col.tinta; g.lineWidth = W + 2 * TI;
    for (const q of dedos) { ruta(q); g.stroke(); }
    palma(); g.lineWidth = 2 * TI; g.stroke();
    g.strokeStyle = col.piel; g.fillStyle = col.piel; g.lineWidth = W;
    for (const q of dedos) { ruta(q); g.stroke(); }
    palma(); g.fill();
    // sombra de la palma y separación entre dedos
    g.save(); palma(); g.clip(); g.fillStyle = col.sombra; g.globalAlpha = 0.8;
    g.beginPath(); g.ellipse(-3, 8, 13, 5, 0, 0, Math.PI * 2); g.fill(); g.restore();
    g.strokeStyle = col.tinta; g.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) { const a = dedos[i], b = dedos[i + 1], kk = Math.min(a.k, b.k);
      const xm = (a.b.x + b.b.x) / 2; g.beginPath(); g.moveTo(xm, 3 + 1.5 * kk); g.lineTo(xm + (a.f.x + b.f.x - a.b.x - b.b.x) * 0.06, 6.5 + 3 * kk); g.stroke(); }
    // dedos doblados: la punta vuelve sobre la palma (puño)
    for (const q of dedos) {
      const pl = 1 - q.k; if (pl < 0.04) continue;
      const y0 = q.f.y - 0.6, y1 = y0 - 8.5 * pl;
      g.strokeStyle = col.tinta; g.lineWidth = W + 2 * 1.5; g.beginPath(); g.moveTo(q.f.x, y0); g.lineTo(q.f.x * 0.92, y1); g.stroke();
      g.strokeStyle = col.piel; g.lineWidth = W - 0.2; g.stroke();
    }
    // pulgar: doblado sobre los dedos, abierto de lado o arriba («pulgar arriba» si el resto está doblado)
    // estirado: de lado con la mano abierta; con el puño cerrado sale bien hacia fuera («pulgar arriba»)
    const kp = e("pulgar"), base = { x: 8.6, y: lerp(-5.5, -3, kp * (1 - abre)) };
    const phi = lerp(-1.15, lerp(1.4, 0.95, abre), kp), Lp = lerp(9.5, lerp(15, 12.5, abre), kp);
    const medio = { x: base.x + Math.sin(phi * 0.85) * Lp * 0.5, y: base.y + Math.cos(phi * 0.85) * Lp * 0.5 };
    const punta = { x: medio.x + Math.sin(phi) * Lp * 0.5, y: medio.y + Math.cos(phi) * Lp * 0.5 };
    const rp = () => { g.beginPath(); g.moveTo(base.x, base.y); g.quadraticCurveTo(medio.x, medio.y, punta.x, punta.y); };
    g.strokeStyle = col.tinta; g.lineWidth = 5.8 + 2 * TI; rp(); g.stroke();
    g.strokeStyle = col.piel; g.lineWidth = 5.8; rp(); g.stroke();
    // uña del pulgar cuando está estirado
    if (kp > 0.5) { g.save(); g.globalAlpha = clamp((kp - 0.5) * 2); g.strokeStyle = col.tinta; g.lineWidth = 1;
      const a = Math.atan2(punta.y - medio.y, punta.x - medio.x); g.translate(punta.x, punta.y); g.rotate(a);
      g.beginPath(); g.moveTo(-3.2, -1.6); g.quadraticCurveTo(-1, -2.2, 0.6, -1.4); g.stroke(); g.restore(); }
    g.restore();
  }

  /* ---------- fábrica ---------- */
  function crear(id, CFG) {
    const A = R.cargar(id, CFG.carpeta || `personajes/${id}/`);
    const PZ = A.datos.piezas, PAL = A.datos.paleta, REF = A.datos.referencias || {};
    const K = CFG.escala || 1;
    const C = Object.assign({ tinta: "#0b0a0e", piel: rgb(PAL.piel), pielSombra: rgb(PAL.piel_sombra || [214, 130, 80]), pielOscura: "#b8653a",
      blanco: "#fbf8f5", ojoSombra: "rgba(112,92,110,0.38)", iris: rgb(PAL.iris || [94, 45, 21]), irisLuz: "#c9b48a", pupila: "#120806",
      boca: "#4f1512", lengua: "#df6a5e", dientes: "#fffaf2", rubor: "#ff6d63" }, CFG.colores || {});
    const COL_MANO = { piel: C.piel, sombra: C.pielSombra, tinta: C.tinta };

    // esqueleto (hoja)
    const SUELO = CFG.suelo ?? REF.suela, PELVIS = pt(CFG.pelvis), CUELLO = pt(CFG.cuello);
    const CADERA = { cerca: pt(CFG.cadera.cerca), lejos: pt(CFG.cadera.lejos) };
    const HOMBRO = pt(PZ.brazo.raiz), HOMBRO_C = pt(PZ.brazo_cerca.raiz);
    const TOBILLO_ALTO = SUELO - PZ.zapato.pivote[1];
    const PUNTA = pt(CFG.punta || REF.punta), TALON = pt(CFG.talon || REF.talon);   // contacto de la suela respecto al tobillo
    const CAB_ESC = CFG.cabeza.esc, CAB_PIV = pt(PZ.cabeza.pivote);
    const PIERNA = { cerca: PZ.pierna_cerca.largo, lejos: PZ.pierna_lejos.largo };
    const BRAZO_L = PZ.brazo.fin[1] - PZ.brazo.raiz[1], BRAZO_L_CODO = PZ.brazo.codo;
    const BRAZO_C_L = PZ.brazo_cerca.fin[1] - PZ.brazo_cerca.raiz[1], BRAZO_C_CODO = PZ.brazo_cerca.codo;
    const ESC_MANO = (CFG.manos && CFG.manos.escala) || 1;
    // centro del puño metido en el bolsillo (muñeca del avatar), en la hoja
    const punoDesde = (m, ang, mu) => { const o = rotP({ x: Math.cos(mu) * MUNECA_R * JK, y: Math.sin(mu) * MUNECA_R * JK }, ang); return { x: m.x - o.x, y: m.y - o.y }; };
    const BOLSILLO_C = punoDesde(pt(CFG.bolsillos.cerca), 0, -1.75), BOLSILLO_L = punoDesde(pt(CFG.bolsillos.lejos), 0, -1.75);

    function tronco(p) {
      const c = Math.cos(p.torso), s = Math.sin(p.torso), ex = p.torsoEsc.x, ey = p.torsoEsc.y;
      return q => { const x = (q.x - PELVIS.x) * ex, y = (q.y - PELVIS.y) * ey; return { x: p.pelvis.x + x * c - y * s, y: p.pelvis.y + x * s + y * c }; };
    }
    function cabeza(p) {
      const T = tronco(p), n = T(CUELLO), h = p.cabeza;
      const cx = n.x + h.dx, cy = n.y + h.dy, c = Math.cos(h.ang), s = Math.sin(h.ang);
      const kx = CAB_ESC * h.esc.x, ky = CAB_ESC * h.esc.y;
      return { cx, cy, ang: h.ang, kx, ky,
        a: q => { const x = (q.x - CAB_PIV.x) * kx, y = (q.y - CAB_PIV.y) * ky; return { x: cx + x * c - y * s, y: cy + x * s + y * c }; } };
    }
    const BOCA = CFG.cara.boca, BOCA_C = pt(BOCA.c), BOCA_LABIO = pt(BOCA.labio);
    const boca = p => cabeza(p).a(BOCA_LABIO);
    const centroCabeza = p => cabeza(p).a(pt(CFG.cara.centro));

    /* ---------- ojos ---------- */
    const ruta = (g, pts) => { g.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y); };
    const rutaPoli = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
    function remuestrea(pts, n) {
      const P = pts.map(q => ({ x: q[0], y: q[1] })), d = [0];
      for (let i = 1; i < P.length; i++) d.push(d[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
      const out = [], L = d[d.length - 1];
      for (let k = 0; k < n; k++) { const s = L * k / (n - 1); let i = 1; while (i < d.length - 1 && d[i] < s) i++;
        const f = (s - d[i - 1]) / Math.max(1e-6, d[i] - d[i - 1]); out.push({ x: lerp(P[i - 1].x, P[i].x, f), y: lerp(P[i - 1].y, P[i].y, f) }); }
      return out;
    }
    const OJOS = {};
    for (const [lado, nom] of [["d", "derecho"], ["i", "izquierdo"]]) {
      const o = CFG.cara.ojos[lado], ref = (REF.ojos || {})[lado] || {};
      OJOS[lado] = { poli: PZ.cabeza.ojos[nom], c: pt(o.c), r: o.r, rx: o.rx, ry: o.ry,
        U: remuestrea(o.arriba || ref.arriba, 14), D: remuestrea(o.abajo || ref.abajo, 14) };
    }
    const PESTANAS = CFG.cara.pestanas || 0;
    function globo(g, o, mirada, escIris = 1, espiral = 0, giro = 0) {
      g.save();
      g.beginPath(); rutaPoli(g, o.poli); g.fillStyle = C.blanco; g.fill();
      g.lineWidth = CFG.cara.junta_ojo ?? 3; g.strokeStyle = C.blanco; g.stroke();   // tapa la junta con la cabeza
      g.clip();
      const ix = o.c.x + o.rx * mirada.x, iy = o.c.y + o.ry * mirada.y, r = o.r * escIris;
      g.fillStyle = C.iris; g.beginPath(); g.arc(ix, iy, r, 0, Math.PI * 2); g.fill();
      g.fillStyle = C.irisLuz; g.beginPath(); g.ellipse(ix, iy + r * 0.32, r * 0.7, r * 0.55, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "rgba(20,12,8,0.55)"; g.lineWidth = r * 0.12; g.beginPath(); g.arc(ix, iy, r * 0.95, 0, Math.PI * 2); g.stroke();
      g.fillStyle = C.pupila; g.beginPath(); g.arc(ix, iy + r * 0.05, r * 0.46, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(ix + r * 0.36, iy - r * 0.34, r * 0.3, r * 0.26, -0.4, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(ix - r * 0.38, iy + r * 0.36, r * 0.12, 0, Math.PI * 2); g.fill();
      g.strokeStyle = C.ojoSombra; g.lineWidth = 9; g.beginPath(); ruta(g, o.U); g.stroke();
      if (espiral > 0.01) {
        g.globalAlpha = clamp(espiral * 1.5); g.fillStyle = C.blanco; g.beginPath(); rutaPoli(g, o.poli); g.fill();
        g.globalAlpha = clamp(espiral); g.strokeStyle = "#141018"; g.lineWidth = 4.2; g.lineCap = "round"; g.beginPath();
        for (let k = 0; k <= 60; k++) { const a = giro + k / 60 * Math.PI * 5, rr = 1.5 + k / 60 * o.r * 1.25;
          const x = o.c.x + Math.cos(a) * rr * (o.rx / 22), y = o.c.y + Math.sin(a) * rr * 0.85; if (k) g.lineTo(x, y); else g.moveTo(x, y); }
        g.stroke();
      }
      g.restore();
    }
    // Párpados: c cierre, h «feliz» (∩), z apretado (>_<). Números: se mezclan sin saltos.
    function parpados(g, o, c, h, z, lado) {
      if (c <= 0.002) return;
      const U = o.U, D = o.D, n = U.length, hz = Math.max(h, z);
      const M = U.map((u, i) => {
        const k = Math.sin(Math.PI * i / (n - 1));
        const abajo = { x: D[i].x, y: D[i].y + 3 * k };
        const medio = { x: lerp(u.x, D[i].x, 0.55), y: lerp(u.y, D[i].y, 0.55) - 9 * k * (1 - z) + (i % 2 ? 3 : -3) * k * z };
        return mezcla(abajo, medio, hz);
      });
      const Up = U.map((u, i) => mezcla(u, M[i], c)), Dp = D.map((d, i) => mezcla(d, M[i], c * hz));
      g.save(); g.lineCap = "round"; g.lineJoin = "round";
      g.fillStyle = C.piel; g.strokeStyle = C.piel; g.lineWidth = 2;
      g.beginPath(); ruta(g, U); for (let i = n - 1; i >= 0; i--) g.lineTo(Up[i].x, Up[i].y); g.closePath(); g.fill(); g.stroke();
      if (c * hz > 0.01) { g.beginPath(); ruta(g, D); for (let i = n - 1; i >= 0; i--) g.lineTo(Dp[i].x, Dp[i].y); g.closePath(); g.fill(); g.stroke(); }
      g.strokeStyle = C.tinta; g.lineWidth = 5 + 2.5 * c + PESTANAS * 2 * c;
      g.beginPath(); M2.curva(g, Up, false, 0.5); g.stroke();
      // pestañas: rabillo hacia fuera al cerrar
      if (PESTANAS && c > 0.3) {
        const e = lado === "d" ? Up[0] : Up[n - 1], e2 = lado === "d" ? Up[2] : Up[n - 3], sg = lado === "d" ? -1 : 1;
        g.globalAlpha = clamp((c - 0.3) / 0.5); g.lineWidth = 3.2;
        for (let k = 0; k < 3; k++) { const b = mezcla(e, e2, k / 3); g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(b.x + sg * (9 - 2 * k), b.y + 6 + 2 * k); g.stroke(); }
        g.globalAlpha = 1;
      }
      if (c * hz > 0.01) { g.globalAlpha = clamp(c * hz * 1.4); g.lineWidth = 4; g.beginPath(); M2.curva(g, Dp, false, 0.5); g.stroke(); g.globalAlpha = 1; }
      const arr = z * clamp((c - 0.6) / 0.4);
      if (arr > 0.01) {
        const e = lado === "d" ? U[0] : U[n - 1], sg = lado === "d" ? -1 : 1;
        g.lineWidth = 3.5; g.globalAlpha = arr;
        for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(e.x + sg * 6, e.y + 8 + k * 9); g.lineTo(e.x + sg * 22, e.y + 6 + k * 14); g.stroke(); }
        g.globalAlpha = 1;
      }
      g.restore();
    }

    /* ---------- boca ---------- */
    const BOCA_ANG = BOCA.ang, BOCA_ANCHO = BOCA.ancho, LAB = BOCA.labios;
    function dibBoca(g, b, t) {
      const orig = b.orig ?? 0;
      if (orig > 0.002) { g.save(); g.globalAlpha = orig; R.pieza(g, A, "boca"); g.restore(); }
      if (orig > 0.998) return;
      g.save(); g.globalAlpha = 1 - orig; g.translate(BOCA_C.x, BOCA_C.y); g.rotate(BOCA_ANG);
      g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = C.tinta;
      const hw = BOCA_ANCHO / 2 * (b.ancho ?? 1), s = b.sonrisa ?? 0, o = Math.max(0, b.abre ?? 0);
      const yL = -8 * s, yR = -10 * s, ySup = 12 * s + 2 - o * 0.35, yInf = 12 * s + 2 + o * 1.25;
      const sup = () => { g.moveTo(-hw, yL); g.quadraticCurveTo(0, ySup, hw, yR); };
      const forma = () => { g.beginPath(); sup(); g.bezierCurveTo(hw * 0.78, yInf, -hw * 0.78, yInf * 1.04, -hw, yL); g.closePath(); };
      const lw = BOCA.tinta || 6.5;
      if (LAB) {             // labios con color: el de arriba con arco de Cupido y el de abajo más claro y lleno
        const ls = LAB.sup * (b.ancho ?? 1), li = LAB.inf * (b.ancho ?? 1);
        const yMid = 0.25 * yL + 0.5 * ySup + 0.25 * yR;      // altura real de la línea de la boca en el centro
        g.fillStyle = LAB.colorSup; g.beginPath(); g.moveTo(-hw, yL);
        g.bezierCurveTo(-hw * 0.6, yMid - ls * 1.15, -hw * 0.25, yMid - ls * 1.3, 0, yMid - ls * 0.85);
        g.bezierCurveTo(hw * 0.25, yMid - ls * 1.3, hw * 0.6, yMid - ls * 1.15, hw, yR);
        g.quadraticCurveTo(0, ySup, -hw, yL); g.closePath(); g.fill();
        const yb = Math.max(yInf, ySup + 1) + li;
        g.fillStyle = LAB.colorInf; g.beginPath(); g.moveTo(-hw, yL); g.quadraticCurveTo(0, ySup, hw, yR);
        g.bezierCurveTo(hw * 0.7, yb + li * 0.15, -hw * 0.7, yb + li * 0.2, -hw, yL); g.closePath(); g.fill();
        g.fillStyle = "rgba(255,255,255,0.45)"; g.beginPath(); g.ellipse(hw * 0.12, yb - li * 0.55, hw * 0.24, li * 0.18, 0, 0, Math.PI * 2); g.fill();
      }
      if (o > 0.3) {
        forma(); g.fillStyle = C.boca; g.fill();
        g.save(); forma(); g.clip();
        const dh = Math.min(16, o * 0.32);
        if (b.dientes !== false) { g.fillStyle = C.dientes; g.beginPath(); g.moveTo(-hw, yL - 3); g.quadraticCurveTo(0, ySup - 3, hw, yR - 3);
          g.lineTo(hw, yR + dh); g.quadraticCurveTo(0, ySup + dh, -hw, yL + dh); g.closePath(); g.fill(); }
        const lg = (b.lengua ?? 1) * clamp((o - 8) / 12);
        if (lg > 0.01) { g.save(); g.globalAlpha *= lg; g.fillStyle = C.lengua; g.beginPath(); g.ellipse(4, yInf * 0.86, hw * 0.6, o * 0.32, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
        g.restore();
        forma(); g.lineWidth = lw * (LAB ? 0.6 : 1); g.stroke();
      } else { g.lineWidth = lw * (LAB ? 0.55 : 1); g.beginPath(); sup(); g.stroke(); }
      if (!LAB) {
        const hoy = clamp((s - 0.3) * 2);
        if (hoy > 0.01) { const a0 = g.globalAlpha; g.lineWidth = 4; g.globalAlpha = a0 * hoy;
          g.beginPath(); g.moveTo(-hw - 3, yL - 7); g.quadraticCurveTo(-hw - 8, yL, -hw - 2, yL + 7); g.stroke();
          g.beginPath(); g.moveTo(hw + 2, yR - 6); g.quadraticCurveTo(hw + 7, yR, hw + 1, yR + 6); g.stroke(); g.globalAlpha = a0; }
      }
      const a1 = g.globalAlpha; g.fillStyle = C.pielSombra; g.globalAlpha = a1 * 0.7;
      g.beginPath(); g.ellipse(2, Math.max(20 + 6 * s, yInf + 13) + (LAB ? LAB.inf : 0), hw * (0.36 - 0.07 * clamp(o / 60)), 5, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = a1;
      g.restore();
    }
    function mofletes(g, k) {          // carrillo lejano hinchado
      const M = CFG.cara.mofletes; if (!M || k <= 0.01) return;
      const a = pt(M.a), b = pt(M.b), n = pt(M.n), bu = M.bulto * k;
      const c1 = { x: lerp(a.x, b.x, 0.25) + n.x * bu, y: lerp(a.y, b.y, 0.25) + n.y * bu }, c2 = { x: lerp(a.x, b.x, 0.8) + n.x * bu * 0.85, y: lerp(a.y, b.y, 0.8) + n.y * bu * 0.85 };
      g.save(); g.lineJoin = "round"; g.lineCap = "round";
      g.beginPath(); g.moveTo(a.x, a.y); g.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, b.x, b.y);
      g.lineTo(b.x - n.x * 22, b.y - n.y * 22); g.lineTo(a.x - n.x * 22, a.y - n.y * 22); g.closePath(); g.fillStyle = C.piel; g.fill();
      g.beginPath(); g.moveTo(a.x, a.y); g.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, b.x, b.y); g.lineWidth = 7; g.strokeStyle = C.tinta; g.stroke();
      g.restore();
    }
    function rubor(g, k) {
      const Rb = CFG.cara.rubor; if (!Rb || k <= 0.01) return;
      g.save(); g.globalAlpha = 0.3 * k; g.fillStyle = C.rubor;
      for (const [x, y, rx, ry, a] of Rb.elipses) { g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, Math.PI * 2); g.fill(); }
      g.globalAlpha = 0.55 * k; g.strokeStyle = "#e0463e"; g.lineWidth = 3; g.lineCap = "round";
      for (const [x, y] of Rb.rayas || []) for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x + i * 15, y + 6); g.lineTo(x + 10 + i * 15, y - 8); g.stroke(); }
      g.restore();
    }
    function sudor(g, k, t) {
      g.save(); g.lineWidth = 4; g.strokeStyle = "#1d3b52";
      (CFG.cara.sudor || []).forEach(([x, y, d], i) => {
        const ph = ((t * 0.55 + d) % 1), aparece = clamp(k * 3 - i); if (aparece <= 0) return;
        const yy = y + ph * 70, s = 13 * aparece * (1 - 0.3 * ph);
        g.globalAlpha = Math.sin(Math.PI * ph) * aparece;
        g.beginPath(); g.moveTo(x, yy - s * 1.6); g.quadraticCurveTo(x + s, yy, x, yy + s); g.quadraticCurveTo(x - s, yy, x, yy - s * 1.6);
        g.fillStyle = "#bfe8ff"; g.fill(); g.stroke();
        g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x - s * 0.3, yy - s * 0.1, s * 0.22, s * 0.35, 0, 0, Math.PI * 2); g.fill();
      });
      g.restore();
    }
    function chichon(g, k, en) {
      const e = en || pt(CFG.cara.chichon);
      g.save(); g.translate(e.x, e.y); g.scale(k, k);
      g.beginPath(); g.moveTo(-40, 14); g.bezierCurveTo(-40, -44, 40, -44, 40, 14); g.closePath(); g.fillStyle = C.piel; g.fill();
      g.save(); g.clip(); g.fillStyle = "rgba(230,70,60,0.55)"; g.beginPath(); g.ellipse(0, -6, 26, 18, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = C.pielSombra; g.beginPath(); g.ellipse(14, 10, 26, 10, 0, 0, Math.PI * 2); g.fill(); g.restore();
      g.beginPath(); g.moveTo(-40, 14); g.bezierCurveTo(-40, -44, 40, -44, 40, 14); g.lineWidth = 6; g.strokeStyle = C.tinta; g.stroke();
      g.fillStyle = "rgba(255,255,255,0.75)"; g.beginPath(); g.ellipse(-12, -16, 9, 5, -0.5, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    function vena(g, k, t) {
      const v = pt(CFG.cara.vena), lat = 1 + 0.12 * Math.max(0, Math.sin(t * 9)) * k;
      g.save(); g.translate(v.x, v.y); g.scale(k * lat, k * lat); g.rotate(-0.2);
      g.lineCap = "round"; g.strokeStyle = "#d0101a"; g.lineWidth = 11;
      for (let i = 0; i < 4; i++) { g.save(); g.rotate(i * Math.PI / 2); g.beginPath(); g.moveTo(10, -26); g.quadraticCurveTo(10, -10, 26, -10); g.stroke(); g.restore(); }
      g.restore();
    }

    function dibCabeza(g, p, t) {
      const H = cabeza(p), f = p.cara;
      g.save(); g.translate(H.cx, H.cy); g.rotate(H.ang); g.scale(H.kx, H.ky); g.translate(-CAB_PIV.x, -CAB_PIV.y);
      // sombra de la barbilla sobre el cuello (queda debajo de la cabeza)
      const SB = CFG.cuello_sombra;
      if (SB) { g.save(); g.fillStyle = C.pielSombra; g.globalAlpha = 0.85; g.beginPath(); g.ellipse(SB[0], SB[1], SB[2], SB[3], SB[4] || 0, 0, Math.PI * 2); g.fill(); g.restore(); }
      if (CFG.detrasCabeza) CFG.detrasCabeza(g, p, t, H);
      const esp = f.espiral || 0, gEsp = t * 7;
      globo(g, OJOS.d, f.mirada, f.iris ?? 1, esp, gEsp); globo(g, OJOS.i, f.mirada, f.iris ?? 1, esp, -gEsp);
      R.pieza(g, A, "cabeza");
      const rojo = p.rojo || 0;
      if (rojo > 0.001) { g.save(); g.globalAlpha = clamp(rojo); R.pieza(g, A, "cabeza_roja"); g.restore(); }
      for (const [nom, lado, sg] of [["ceja_derecha", "d", -1], ["ceja_izquierda", "i", 1]]) {
        const c = f.cejas[lado], pv = PZ[nom].pivote;
        g.save(); g.translate(pv[0] + (c.dx || 0), pv[1] - c.sube); g.rotate(sg * c.giro); R.pieza(g, A, nom, pv); g.restore();
      }
      mofletes(g, f.mofletes || 0);
      rubor(g, f.rubor || 0);
      dibBoca(g, f.boca, t);
      const fe = f.ojos.feliz || 0, ap = f.ojos.apretado || 0;
      parpados(g, OJOS.d, f.ojos.d, fe, ap, "d");
      parpados(g, OJOS.i, f.ojos.i, fe, ap, "i");
      if ((p.sudor || 0) > 0.01) sudor(g, p.sudor, t);
      if ((p.chichon || 0) > 0.01) chichon(g, p.chichon, p.chichonEn);
      if ((p.enfado || 0) > 0.01) vena(g, p.enfado, t);
      if (CFG.encimaCabeza) CFG.encimaCabeza(g, p, t, H);
      if (p.capaCabeza) p.capaCabeza(g, t);
      g.restore();
    }

    /* ---------- melena: tiras que cuelgan de la cabeza y se balancean ---------- */
    const MEL = CFG.melena;
    function dibMelena(g, p, t) {
      const H = cabeza(p), pel = p.pelo || {};
      const empuje = (pel.viento || 0) * 0.45 + (pel.inercia || 0) * 0.35;
      for (const m of MEL.tiras) {
        const pz = PZ[m.pieza]; if (!pz) continue;
        const raiz = H.a(pt(m.raiz)), sg = m.espejo ? -1 : 1;
        const reposo = -(pz.giro_original || 0) * (m.inclina ?? 1);
        const balanceo = 0.03 * Math.sin(t * 1.3 + (m.fase || 0)) + 0.018 * Math.sin(t * 2.9 + 1 + (m.fase || 0));
        // la raíz sigue en parte a la cabeza; la punta cuelga casi en vertical y se balancea más
        const a1 = reposo + sg * (MEL.sigue ?? 0.45) * H.ang - sg * empuje * 0.6 + sg * balanceo * 0.5;
        const a2 = reposo * 0.55 + sg * 0.15 * H.ang - sg * empuje * 1.4 + sg * balanceo * 1.5;
        const L = pz.fin[1] - pz.raiz[1];
        const c = { raiz: { x: 0, y: 0 }, a1, a2, L, sj: L * 0.45, r: L * 0.4, estira: 1, cuna: true, cunaAjustada: true };
        g.save(); g.translate(raiz.x, raiz.y); g.scale(sg * H.kx * (m.esc || 1), H.ky * (m.esc || 1));
        R.tira(g, A, m.pieza, c, 14);
        g.restore();
      }
    }

    /* ---------- brazos y manos ---------- */
    function brazoMano(raiz, mano, L, sj, continuo) {
      const mu = mano.mu ?? -1.75;
      const m = rotP({ x: Math.cos(mu) * MUNECA_R * JK, y: Math.sin(mu) * MUNECA_R * JK }, mano.ang || 0);
      const c = (continuo ? R.ikContinuo : R.ik)(raiz, { x: mano.x + m.x, y: mano.y + m.y }, L, sj, 42, mano.dobla ?? -1, 1.08);
      c.grosor = mano.grosor || 1; c.capFija = true; c.caminoCorto = true;
      return c;
    }
    const HB = CFG.hombros || {};
    function hombro(g, h, lado) {          // hombro redondo donde nace el brazo (tapa la junta al girar)
      const [rx, ry] = HB.radio || [30, 32];
      g.save(); g.lineCap = "round";
      g.fillStyle = HB.color || C.piel; g.beginPath(); g.ellipse(h.x, h.y, rx, ry, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = C.tinta; g.lineWidth = HB.tinta || 5; g.beginPath();
      const [a0, a1] = HB.arco || [0.95, 1.5];               // trozo de contorno por el lado de fuera del hombro
      if (lado < 0) g.ellipse(h.x, h.y, rx, ry, 0, Math.PI * a0, Math.PI * a1); else g.ellipse(h.x, h.y, rx, ry, 0, Math.PI * (3 - a1), Math.PI * (3 - a0));
      g.stroke(); g.restore();
    }
    function dibManoYObjeto(g, m, t) {
      g.save(); g.translate(m.x, m.y); g.rotate(m.ang || 0); g.scale(JK * (m.espejo ? -1 : 1), JK);
      if (m.objeto) m.objeto(g, t);
      const k = (m.puno ?? 1);
      if (k > 0.01) { g.scale(k * ESC_MANO, k * ESC_MANO); if (m.dedos) mano(g, m, COL_MANO); else puno(g, m.pulgar, COL_MANO); }
      g.restore();
    }
    // mano sin definir: se queda en su bolsillo (codo hacia fuera en los dos brazos)
    const REPOSO = CFG.reposo || {};
    const bolsillo = (p, lado) => { const T = tronco(p), r = REPOSO[lado];
      if (r) { const b = T(pt(r.en)); return Object.assign({ ang: 0, mu: -1.75, puno: 1, dobla: lado === "cerca" ? -1 : 1 }, r.mano, { x: b.x, y: b.y }); }
      const b = T(lado === "cerca" ? BOLSILLO_C : BOLSILLO_L);
      return { x: b.x, y: b.y, ang: 0, mu: -1.75, puno: 0, dobla: lado === "cerca" ? -1 : 1 }; };
    function brazoLibre(g, p, t, lado) {
      const T = tronco(p), cerca = lado === "cerca";
      const m = (cerca ? p.manoCerca : p.manoLejos) || bolsillo(p, lado);
      const h = T(cerca ? HOMBRO_C : HOMBRO);
      const c = brazoMano(h, m, cerca ? BRAZO_C_L : BRAZO_L, cerca ? BRAZO_C_CODO : BRAZO_L_CODO, p.ikContinuo); c.capAng = p.torso;
      const off = (HB.desplaza || {})[lado] || [0, 0];
      hombro(g, { x: h.x + off[0], y: h.y + off[1] }, cerca ? -1 : 1);
      if (p.ikContinuo) R.tiraContinua(g, A, cerca ? "brazo_cerca" : "brazo", c);
      else { if (p.tirasLimpias) { c.cuna = true; c.cunaAjustada = true; } R.tira(g, A, cerca ? "brazo_cerca" : "brazo", c, 16); }
      dibManoYObjeto(g, m, t);
    }

    /* ---------- piernas ---------- */
    function pierna(p, lado) {
      const T = tronco(p), cad = T(CADERA[lado]), q = p.piernas[lado];
      return R.ik(cad, q.tob, PIERNA[lado], PIERNA[lado] * 0.5, 80, 1, 1.03);
    }

    function dibujar(g, p, t) {
      if (!A.listo) return false;
      g.save();
      const k = p.s * K;
      g.translate(p.x, p.suelo); g.scale(p.espejo ? -k : k, k); g.translate(-PELVIS.x, -SUELO);
      g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
      if (MEL) dibMelena(g, p, t);
      for (const lado of ["lejos", "cerca"]) {
        const q = p.piernas[lado];
        g.save(); g.translate(q.tob.x, q.tob.y); g.rotate(q.ang); R.pieza(g, A, lado === "lejos" ? "zapato_lejos" : "zapato", PZ.zapato.pivote); g.restore();
        const cp = pierna(p, lado); if (p.tirasLimpias) { cp.cuna = true; cp.cunaAjustada = true; }
        R.tira(g, A, lado === "lejos" ? "pierna_lejos" : "pierna_cerca", cp, 18);
      }
      const libres = !!(CFG.siempreLibres || p.manoCerca || p.manoLejos);
      // mano.detras: ese brazo va por detrás del cuerpo y de la cabeza (p. ej. el lejano levantado)
      const detras = l => libres && ((l === "cerca" ? p.manoCerca : p.manoLejos) || {}).detras;
      for (const l of ["lejos", "cerca"]) if (detras(l)) brazoLibre(g, p, t, l);
      g.save(); g.translate(p.pelvis.x, p.pelvis.y); g.rotate(p.torso); g.scale(p.torsoEsc.x, p.torsoEsc.y); g.translate(-PELVIS.x, -PELVIS.y);
      R.pieza(g, A, libres ? "tronco_libre" : "tronco");
      if (CFG.encimaTronco) CFG.encimaTronco(g, p, t);
      if (p.capaTronco) p.capaTronco(g, t);
      g.restore();
      dibCabeza(g, p, t);
      for (const l of ["lejos", "cerca"]) if (libres && !detras(l)) brazoLibre(g, p, t, l);
      g.restore();
      return true;
    }

    // hoja ↔ pantalla (con la escala propia K y el espejo)
    const aPantalla = (p, q) => ({ x: p.x + (q.x - PELVIS.x) * p.s * K * (p.espejo ? -1 : 1), y: p.suelo + (q.y - SUELO) * p.s * K });
    const aHoja = (p, q) => ({ x: PELVIS.x + (q.x - p.x) / (p.s * K) * (p.espejo ? -1 : 1), y: SUELO + (q.y - p.suelo) / (p.s * K) });

    return { id, A, C, K, dibujar, cabeza, boca, centroCabeza, tronco, aPantalla, aHoja, rotP, JK, MUNECA_R, BRAZO_L, BRAZO_C_L,
      SUELO, PELVIS, CADERA, TOBILLO_ALTO, PUNTA, TALON, CUELLO, HOMBRO, HOMBRO_C, BOLSILLO_C, BOLSILLO_L, OJOS,
      manoReposo: bolsillo, listo: () => A.listo };
  }

  return { crear, mano, puno };
})();
