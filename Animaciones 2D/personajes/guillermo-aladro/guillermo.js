"use strict";
/* Guillermo Aladro · recortable animable hecho con las piezas de su avatar 2D
 * (Avatares 2D/Guillermo-Aladro/Guillermo-Aladro-2D.png).
 *
 * Todo lo que se ve del personaje son píxeles del avatar: cabeza del retrato, torso, brazo,
 * vaqueros y zapatillas. Encima solo se dibujan, con el mismo trazo, lo que el avatar no trae
 * porque tiene las manos en los bolsillos (el puño que agarra la jarra) y lo que cambia con la
 * expresión (iris, párpados, boca abierta, mofletes, rubor, bigote de espuma).
 *
 * Proporción caricaturesca: la cabeza del retrato va sobre el cuerpo un poco más grande de lo
 * normal (cabezón), como en una caricatura.
 *
 * Coordenadas del cuerpo = píxeles de la hoja original (x a la derecha, y hacia abajo).
 * Coordenadas de la cabeza = píxeles del retrato de la misma hoja.
 */
const Guillermo = (() => {
  const { clamp, lerp, suave, mezcla } = M2;
  const R = Recortes;
  const A = R.cargar("guillermo-aladro", "personajes/guillermo-aladro/");
  const PZ = A.datos.piezas;
  const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;
  const PAL = A.datos.paleta;
  const C = {
    tinta: "#0b0a0e", piel: rgb(PAL.piel), pielSombra: "#d9844a", pielOscura: "#b8653a",
    blanco: "#fbf8f5", ojoSombra: "rgba(112,92,110,0.38)", iris: "#5e2d15", irisLuz: rgb(PAL.iris),
    boca: "#4f1512", lengua: "#df6a5e", dientes: "#fffaf2", rubor: "#ff6d63",
    cerveza: "#f5aa1d", cervezaOscura: "#cf7a0b", cervezaLuz: "#ffd25c", espuma: "#fff8e8", espumaSombra: "#eadcb8",
    cristal: "rgba(214,236,255,0.24)", cristalLuz: "rgba(255,255,255,0.8)"
  };

  /* ---------- esqueleto (hoja) ---------- */
  const SUELO = 1344;                         // línea de la suela
  const PELVIS = { x: 250, y: 712 };
  const CADERA = { cerca: { x: 172, y: 712 }, lejos: { x: 328, y: 712 } };
  const CUELLO = { x: 244, y: 256 };
  const HOMBRO = { x: 370, y: 372 };
  const TOBILLO_ALTO = 94;                    // del tobillo a la suela
  const PUNTA = { x: 140, y: 88 }, TALON = { x: -46, y: 82 };   // contacto con el suelo respecto al tobillo
  const CAB_ESC = 0.6;                        // retrato → cuerpo (cabezón)
  const CAB_PIV = { x: 700, y: 800 };         // punto del retrato que va sobre el cuello
  const PIERNA = { L: { cerca: PZ.pierna_cerca.largo, lejos: PZ.pierna_lejos.largo } };
  const BRAZO_L = PZ.brazo.fin[1] - PZ.brazo.raiz[1];
  const JK = 2.6;                             // unidades de jarra → hoja

  // transformación del torso (pelvis, inclinación y estiramiento)
  function tronco(p) {
    const c = Math.cos(p.torso), s = Math.sin(p.torso), ex = p.torsoEsc.x, ey = p.torsoEsc.y;
    return q => { const x = (q.x - PELVIS.x) * ex, y = (q.y - PELVIS.y) * ey; return { x: p.pelvis.x + x * c - y * s, y: p.pelvis.y + x * s + y * c }; };
  }
  // cabeza: retrato → cuerpo
  function cabeza(p) {
    const T = tronco(p), n = T(CUELLO), h = p.cabeza;
    const cx = n.x + h.dx, cy = n.y + h.dy, c = Math.cos(h.ang), s = Math.sin(h.ang);
    const kx = CAB_ESC * h.esc.x, ky = CAB_ESC * h.esc.y;
    return { cx, cy, ang: h.ang, kx, ky,
      a: q => { const x = (q.x - CAB_PIV.x) * kx, y = (q.y - CAB_PIV.y) * ky; return { x: cx + x * c - y * s, y: cy + x * s + y * c }; } };
  }
  const BOCA_C = { x: 803, y: 730 }, BOCA_LABIO = { x: 806, y: 744 };
  function boca(p) { return cabeza(p).a(BOCA_LABIO); }
  function centroCabeza(p) { return cabeza(p).a({ x: 760, y: 560 }); }

  /* ---------- ojos ---------- */
  const OJOS = {
    d: { arriba: [[733, 551], [737, 541], [748, 541], [762, 545], [776, 550], [790, 556], [803, 561], [809, 566]],
         abajo: [[733, 556], [737, 566], [748, 573], [762, 577], [778, 583], [795, 589], [808, 592]],
         poli: PZ.cabeza.ojos.derecho, c: { x: 771, y: 563 }, r: 17.5, rx: 25, ry: 9 },
    i: { arriba: [[866, 603], [872, 597], [885, 598], [900, 602], [913, 606], [921, 611]],
         abajo: [[866, 608], [868, 624], [880, 630], [895, 635], [910, 638], [921, 637]],
         poli: PZ.cabeza.ojos.izquierdo, c: { x: 894, y: 617 }, r: 15, rx: 19, ry: 7 }
  };
  function remuestrea(pts, n) {
    const P = pts.map(q => ({ x: q[0], y: q[1] })), d = [0];
    for (let i = 1; i < P.length; i++) d.push(d[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
    const out = [], L = d[d.length - 1];
    for (let k = 0; k < n; k++) {
      const s = L * k / (n - 1); let i = 1; while (i < d.length - 1 && d[i] < s) i++;
      const f = (s - d[i - 1]) / Math.max(1e-6, d[i] - d[i - 1]);
      out.push({ x: lerp(P[i - 1].x, P[i].x, f), y: lerp(P[i - 1].y, P[i].y, f) });
    }
    return out;
  }
  for (const o of Object.values(OJOS)) { o.U = remuestrea(o.arriba, 14); o.D = remuestrea(o.abajo, 14); }
  const ruta = (g, pts) => { g.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y); };
  const rutaPoli = (g, pts) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
  function trazoSuave(g, pts) { M2.curva(g, pts, false, 0.5); }

  function globo(g, o, mirada, escIris = 1) {
    g.save();
    g.beginPath(); rutaPoli(g, o.poli); g.fillStyle = C.blanco; g.fill();
    g.lineWidth = 3; g.strokeStyle = C.blanco; g.stroke();            // tapa la junta con la cabeza
    g.clip();
    const ix = o.c.x + o.rx * mirada.x, iy = o.c.y + o.ry * mirada.y, r = o.r * escIris;
    g.fillStyle = C.iris; g.beginPath(); g.arc(ix, iy, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = C.irisLuz; g.beginPath(); g.ellipse(ix, iy + r * 0.32, r * 0.7, r * 0.55, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#120806"; g.beginPath(); g.arc(ix, iy + r * 0.05, r * 0.46, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(ix - r * 0.36, iy - r * 0.34, r * 0.3, r * 0.24, -0.4, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(ix + r * 0.38, iy + r * 0.36, r * 0.12, 0, Math.PI * 2); g.fill();
    // sombra del párpado superior
    g.strokeStyle = C.ojoSombra; g.lineWidth = 9; g.beginPath(); ruta(g, o.U); g.stroke();
    g.restore();
  }
  // Párpados encima de la cabeza. c: cierre; h: «feliz» (cierre en arco ∩); z: apretado (>_<).
  // Los tres son números: se puede pasar de un gesto a otro sin saltos.
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
    g.strokeStyle = C.tinta; g.lineWidth = 5 + 2.5 * c;
    g.beginPath(); trazoSuave(g, Up); g.stroke();
    if (c * hz > 0.01) { g.globalAlpha = clamp(c * hz * 1.4); g.lineWidth = 4; g.beginPath(); trazoSuave(g, Dp); g.stroke(); g.globalAlpha = 1; }
    const arr = z * clamp((c - 0.6) / 0.4);
    if (arr > 0.01) {          // arrugas de apretar
      const e = lado === "d" ? U[0] : U[n - 1], sg = lado === "d" ? -1 : 1;
      g.lineWidth = 3.5; g.globalAlpha = arr;
      for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(e.x + sg * 6, e.y + 8 + k * 9); g.lineTo(e.x + sg * 22, e.y + 6 + k * 14); g.stroke(); }
      g.globalAlpha = 1;
    }
    g.restore();
  }

  /* ---------- boca ---------- */
  const BOCA_ANG = 0.26, BOCA_ANCHO = 88;
  function dibBoca(g, b, t) {
    const orig = b.orig ?? 0;
    if (orig > 0.002) { g.save(); g.globalAlpha = orig; R.pieza(g, A, "boca"); g.restore(); }
    if (orig > 0.998) return;
    g.save(); g.globalAlpha = 1 - orig; g.translate(BOCA_C.x, BOCA_C.y); g.rotate(BOCA_ANG);
    g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = C.tinta;
    const hw = BOCA_ANCHO / 2 * (b.ancho ?? 1), s = b.sonrisa ?? 0, o = Math.max(0, b.abre ?? 0);
    // Una sola forma: comisuras, labio de arriba (curva de sonrisa) y labio de abajo que baja al abrir.
    // Con la boca cerrada los dos labios coinciden y queda la línea de la boca.
    const yL = -8 * s, yR = -10 * s, ySup = 12 * s + 2 - o * 0.35, yInf = 12 * s + 2 + o * 1.25;
    const sup = () => { g.moveTo(-hw, yL); g.quadraticCurveTo(0, ySup, hw, yR); };
    const forma = () => { g.beginPath(); sup(); g.bezierCurveTo(hw * 0.78, yInf, -hw * 0.78, yInf * 1.04, -hw, yL); g.closePath(); };
    if (o > 0.3) {
      forma(); g.fillStyle = C.boca; g.fill();
      g.save(); forma(); g.clip();
      const dh = Math.min(16, o * 0.32);
      if (b.dientes !== false) { g.fillStyle = C.dientes; g.beginPath(); g.moveTo(-hw, yL - 3); g.quadraticCurveTo(0, ySup - 3, hw, yR - 3);
        g.lineTo(hw, yR + dh); g.quadraticCurveTo(0, ySup + dh, -hw, yL + dh); g.closePath(); g.fill(); }
      const lg = (b.lengua ?? 1) * clamp((o - 8) / 12);
      if (lg > 0.01) { g.save(); g.globalAlpha *= lg; g.fillStyle = C.lengua; g.beginPath(); g.ellipse(4, yInf * 0.86, hw * 0.6, o * 0.32, 0, 0, Math.PI * 2); g.fill();
        g.strokeStyle = "rgba(120,20,20,0.5)"; g.lineWidth = 3; g.beginPath(); g.moveTo(4, yInf * 0.68); g.lineTo(4, yInf * 0.88); g.stroke(); g.restore(); }
      g.restore();
      forma(); g.lineWidth = 6.5; g.stroke();
    } else { g.lineWidth = 6.5; g.beginPath(); sup(); g.stroke(); }
    const hoy = clamp((s - 0.3) * 2);
    if (hoy > 0.01) {     // hoyuelos en las comisuras
      const a0 = g.globalAlpha; g.lineWidth = 4; g.globalAlpha = a0 * hoy;
      g.beginPath(); g.moveTo(-hw - 3, yL - 7); g.quadraticCurveTo(-hw - 8, yL, -hw - 2, yL + 7); g.stroke();
      g.beginPath(); g.moveTo(hw + 2, yR - 6); g.quadraticCurveTo(hw + 7, yR, hw + 1, yR + 6); g.stroke();
      g.globalAlpha = a0;
    }
    // sombra del labio de abajo / barbilla
    const a1 = g.globalAlpha; g.fillStyle = C.pielSombra; g.globalAlpha = a1 * 0.85;
    g.beginPath(); g.ellipse(2, Math.max(20 + 6 * s, yInf + 13), hw * (0.42 - 0.07 * clamp(o / 60)), 6, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = a1;
    g.restore();
  }
  function bigoteEspuma(g, k, t) {
    if (k <= 0.01) return;
    g.save(); g.translate(BOCA_C.x, BOCA_C.y); g.rotate(BOCA_ANG);
    const blobs = [[-50, -16, 13], [-33, -22, 16], [-13, -25, 17], [8, -25, 17], [28, -23, 16], [45, -18, 14], [56, -12, 10]];
    const camino = () => { g.beginPath(); for (const [x, y, r] of blobs) { g.moveTo(x + r * k, y); g.arc(x, y, r * k, 0, Math.PI * 2); } };
    camino(); g.lineWidth = 7; g.strokeStyle = "#7a5c40"; g.stroke();
    camino(); g.fillStyle = "#fff4dc"; g.fill();
    g.fillStyle = C.espumaSombra; g.beginPath(); g.ellipse(2, -12, 50 * k, 7 * k, 0, 0, Math.PI); g.fill();
    g.fillStyle = "#ffffff"; for (const [x, y, r] of blobs) { g.beginPath(); g.arc(x - r * 0.3 * k, y - r * 0.35 * k, r * 0.28 * k, 0, Math.PI * 2); g.fill(); }
    // gotitas que cuelgan
    for (const [x, ln] of [[-24, 10], [12, 14], [40, 8]]) {
      const l = ln * k * (0.8 + 0.2 * Math.sin(t * 3 + x));
      g.beginPath(); g.ellipse(x, -8 + l, 4.5 * k, l * 0.8, 0, 0, Math.PI * 2); g.fillStyle = C.espuma; g.fill(); g.lineWidth = 3; g.strokeStyle = "#5b4a3a"; g.stroke();
    }
    g.restore();
  }
  function mofletes(g, k) {        // carrillo derecho hinchado (aguantando el eructo)
    if (k <= 0.01) return;
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.beginPath(); g.moveTo(912, 676);
    g.bezierCurveTo(912 + 40 * k, 690, 900 + 46 * k, 760, 858, 792);
    g.lineTo(840, 760); g.lineTo(890, 690); g.closePath();
    g.fillStyle = C.piel; g.fill();
    g.beginPath(); g.moveTo(912, 676); g.bezierCurveTo(912 + 40 * k, 690, 900 + 46 * k, 760, 858, 792);
    g.lineWidth = 7; g.strokeStyle = C.tinta; g.stroke();
    g.restore();
  }
  function rubor(g, k) {
    if (k <= 0.01) return;
    g.save(); g.globalAlpha = 0.3 * k; g.fillStyle = C.rubor;
    g.beginPath(); g.ellipse(728, 640, 42, 15, -0.15, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(902, 668, 18, 11, -0.2, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 0.55 * k; g.strokeStyle = "#e0463e"; g.lineWidth = 3; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(708 + i * 15, 646); g.lineTo(718 + i * 15, 632); g.stroke(); }
    g.restore();
  }

  function dibCabeza(g, p, t) {
    const H = cabeza(p), f = p.cara;
    g.save(); g.translate(H.cx, H.cy); g.rotate(H.ang); g.scale(H.kx, H.ky); g.translate(-CAB_PIV.x, -CAB_PIV.y);
    globo(g, OJOS.d, f.mirada, f.iris ?? 1); globo(g, OJOS.i, f.mirada, f.iris ?? 1);
    R.pieza(g, A, "cabeza");
    // cejas (piezas del avatar): suben y giran
    for (const [nom, lado, sg] of [["ceja_derecha", "d", -1], ["ceja_izquierda", "i", 1]]) {
      const c = f.cejas[lado], pv = PZ[nom].pivote;
      g.save(); g.translate(pv[0] + (c.dx || 0), pv[1] - c.sube); g.rotate(sg * c.giro); R.pieza(g, A, nom, pv); g.restore();
    }
    mofletes(g, f.mofletes);
    rubor(g, f.rubor);
    dibBoca(g, f.boca, t);
    bigoteEspuma(g, f.bigote, t);
    const fe = f.ojos.feliz || 0, ap = f.ojos.apretado || 0;
    parpados(g, OJOS.d, f.ojos.d, fe, ap, "d");
    parpados(g, OJOS.i, f.ojos.i, fe, ap, "i");
    g.restore();
  }

  /* ---------- puño y jarra ---------- */
  function puno(g, lado) {           // en unidades de jarra, centrado en el asa
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    // dorso y dedos que rodean el asa
    g.beginPath(); g.ellipse(-2, 0, 14, 12.5, 0, 0, Math.PI * 2); g.fillStyle = C.piel; g.fill();
    g.save(); g.clip(); g.fillStyle = C.pielSombra; g.beginPath(); g.ellipse(-4, 9, 15, 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
    g.lineWidth = 2.2; g.strokeStyle = C.tinta; g.stroke();
    g.lineWidth = 1.4; g.beginPath(); for (let i = -1; i <= 1; i++) { g.moveTo(11, i * 5.2); g.lineTo(5, i * 5.2 + 0.6); } g.stroke();
    // pulgar por encima
    g.beginPath(); g.ellipse(-3, -9.5, 8, 4.4, -0.25, 0, Math.PI * 2); g.fillStyle = C.piel; g.fill(); g.lineWidth = 1.8; g.stroke();
    g.restore();
  }
  // vidrio: origen en el centro del asa; el cuerpo queda a la derecha
  const JX0 = 8, JX1 = 66, JY0 = -46, JY1 = 44;
  const P = (x, y) => ({ x, y });
  const INTERIOR = [P(JX0 + 5, JY0 + 3), P(JX1 - 5, JY0 + 3), P(JX1 - 5, JY1 - 13), P(JX0 + 5, JY1 - 13)];
  const AREA_INT = (JX1 - JX0 - 10) * (JY1 - 13 - JY0 - 3);
  const rotP = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: q.x * c - q.y * s, y: q.x * s + q.y * c }; };
  function recorta(pol, n, c) {
    const out = [], v = q => q.x * n.x + q.y * n.y - c;
    for (let i = 0; i < pol.length; i++) { const a = pol[i], b = pol[(i + 1) % pol.length], va = v(a), vb = v(b);
      if (va >= 0) out.push(a);
      if ((va >= 0) !== (vb >= 0)) { const k = va / (va - vb); out.push({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }); } }
    return out;
  }
  const area = pol => { let s = 0; for (let i = 0; i < pol.length; i++) { const a = pol[i], b = pol[(i + 1) % pol.length]; s += a.x * b.y - b.x * a.y; } return Math.abs(s) / 2; };
  function nivel(n, vol) {
    let lo = Math.min(...INTERIOR.map(q => q.x * n.x + q.y * n.y)), hi = Math.max(...INTERIOR.map(q => q.x * n.x + q.y * n.y));
    const obj = clamp(vol) * AREA_INT;
    for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (area(recorta(INTERIOR, n, m)) > obj) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  const BORDE = P(JX0 + 2, JY0);           // borde por el que bebe (el del lado del asa)
  function inclinacionParaBeber(vol) {
    let lo = 0, hi = -2.4;
    for (let i = 0; i < 28; i++) {
      const a = (lo + hi) / 2, n = rotP({ x: 0, y: 1 }, -a);
      if (area(recorta(INTERIOR, n, BORDE.x * n.x + BORDE.y * n.y)) > vol * AREA_INT) lo = a; else hi = a;
    }
    return (lo + hi) / 2;
  }
  const poligono = M2.poligono;
  function jarra(g, j, t) {
    const LW = 2.1;
    const cuerpo = () => { g.beginPath(); g.moveTo(JX0, JY0); g.lineTo(JX1, JY0); g.lineTo(JX1 - 2, JY1 - 4); g.quadraticCurveTo(JX1 - 2, JY1, JX1 - 8, JY1); g.lineTo(JX0 + 8, JY1); g.quadraticCurveTo(JX0 + 2, JY1, JX0 + 2, JY1 - 4); g.closePath(); };
    g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(JX0, JY0 + 14); g.bezierCurveTo(-14, JY0 + 12, -16, JY1 - 12, JX0, JY1 - 14);
    g.lineWidth = 12; g.strokeStyle = C.tinta; g.stroke(); g.lineWidth = 7; g.strokeStyle = "#e3eef6"; g.stroke();
    cuerpo(); g.fillStyle = C.cristal; g.fill();
    const n = rotP({ x: 0, y: 1 }, -(j.ang) + (j.chapoteo || 0));
    if (j.vol > 0.002) {
      const cl = nivel(n, j.vol), esp = (j.espuma || 0) * 11;
      const pe = recorta(INTERIOR, n, cl - esp), pl = recorta(INTERIOR, n, cl);
      if (pe.length > 2 && esp > 0.3) { g.beginPath(); poligono(g, pe); g.fillStyle = C.espuma; g.fill(); }
      if (pl.length > 2) {
        g.beginPath(); poligono(g, pl); g.fillStyle = C.cerveza; g.fill();
        g.save(); g.beginPath(); poligono(g, pl); g.clip();
        const fondo = recorta(INTERIOR, n, cl + 24); if (fondo.length > 2) { g.beginPath(); poligono(g, fondo); g.fillStyle = C.cervezaOscura; g.globalAlpha = 0.5; g.fill(); g.globalAlpha = 1; }
        g.fillStyle = C.cervezaLuz;
        for (let i = 0; i < 9; i++) { const ph = (t * (0.6 + M2.hash(i) * 0.5) + M2.hash(i + 9)) % 1; const bx = JX0 + 10 + M2.hash(i + 3) * (JX1 - JX0 - 20); const by = JY1 - 16 - ph * 72; g.beginPath(); g.arc(bx, by, 1.3 + M2.hash(i + 5) * 1.3, 0, Math.PI * 2); g.fill(); }
        g.restore();
      }
      if (pe.length > 2 && esp > 0.3) { g.save(); g.beginPath(); poligono(g, pe); g.clip(); g.fillStyle = C.espumaSombra;
        for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(JX0 + 10 + i * 9, JY0 + 4 + M2.hash(i) * 72, 2.2, 0, Math.PI * 2); g.fill(); } g.restore(); }
      const corona = clamp((j.vol - 0.85) / 0.15) * clamp(1 - Math.abs(j.ang) * 3) * (j.espuma || 0);
      if (corona > 0.02) { g.beginPath(); g.moveTo(JX0 + 1, JY0 + 2);
        for (let i = 0; i < 4; i++) { const x = JX0 + 8 + (JX1 - JX0 - 16) * i / 3; g.arc(x, JY0 - 2 - (i % 2) * 2, 9 * corona + 2, Math.PI, 0); }
        g.lineTo(JX1 - 1, JY0 + 2); g.closePath(); g.fillStyle = C.espuma; g.fill(); g.lineWidth = LW; g.strokeStyle = C.tinta; g.stroke(); }
    } else if (j.restos) {
      g.save(); cuerpo(); g.clip();
      g.globalAlpha *= typeof j.restos === "number" ? clamp(j.restos) : 1;
      g.fillStyle = "rgba(255,248,230,0.75)";
      for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(JX0 + 9 + M2.hash(i) * 42, JY0 + 12 + M2.hash(i + 7) * 62, 5, 2.5, 0.3, 0, Math.PI * 2); g.fill(); }
      g.restore();
    }
    g.save(); cuerpo(); g.clip();
    g.strokeStyle = "rgba(255,255,255,0.38)"; g.lineWidth = 1.5;
    for (let q = 0; q < 3; q++) { const x = JX0 + 20 + q * 16; g.beginPath(); g.moveTo(x, JY0 + 10); g.lineTo(x, JY1 - 18); g.stroke(); }
    g.fillStyle = C.cristalLuz; g.fillRect(JX0 + 7, JY0 + 8, 4, JY1 - JY0 - 24);
    g.fillStyle = "rgba(255,255,255,0.28)"; g.fillRect(JX0 + 2, JY1 - 13, JX1 - JX0, 13);
    g.restore();
    cuerpo(); g.lineWidth = LW; g.strokeStyle = C.tinta; g.stroke();
    g.lineWidth = 1.4; g.beginPath(); g.moveTo(JX0 + 3, JY1 - 13); g.lineTo(JX1 - 3, JY1 - 13); g.stroke();
  }

  /* ---------- brazo de la jarra ---------- */
  const MUNECA_R = 13;                       // de la muñeca al centro del puño (unidades de jarra)
  function brazo(p) {
    const T = tronco(p), h = T(HOMBRO), j = p.jarra, mu = j.mu ?? -1.75;
    const jk = j.escala || JK;
    const m = rotP({ x: Math.cos(mu) * MUNECA_R * jk, y: Math.sin(mu) * MUNECA_R * jk }, j.ang);
    const obj = { x: j.x + m.x, y: j.y + m.y };
    const solver = p.ikContinuo ? R.ikContinuo : R.ik;
    const c = solver(h, obj, BRAZO_L, BRAZO_L * 0.5, 42, p.brazo.dobla, 1.06);
    return { h, c };
  }

  /* ---------- piernas ---------- */
  function pierna(p, lado) {
    const T = tronco(p), cad = T(CADERA[lado]), q = p.piernas[lado];
    const L = PIERNA.L[lado];
    const c = R.ik(cad, q.tob, L, L * 0.5, 80, 1, 1.03);
    return c;
  }

  function dibujar(g, p, t) {
    if (!A.listo) return false;
    g.save();
    g.translate(p.x, p.suelo); g.scale(p.s, p.s); g.translate(-PELVIS.x, -SUELO);
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
    // pierna lejana (más oscura) y luego la cercana
    for (const lado of ["lejos", "cerca"]) {
      const q = p.piernas[lado];
      g.save(); g.translate(q.tob.x, q.tob.y); g.rotate(q.ang); R.pieza(g, A, lado === "lejos" ? "zapato_lejos" : "zapato", PZ.zapato.pivote); g.restore();
      R.tira(g, A, lado === "lejos" ? "pierna_lejos" : "pierna_cerca", pierna(p, lado), 18);
    }
    // torso
    const T = tronco(p);
    g.save(); g.translate(p.pelvis.x, p.pelvis.y); g.rotate(p.torso); g.scale(p.torsoEsc.x, p.torsoEsc.y); g.translate(-PELVIS.x, -PELVIS.y);
    R.pieza(g, A, "tronco");
    g.restore();
    // cabeza
    dibCabeza(g, p, t);
    // brazo + jarra + puño
    const B = brazo(p);
    g.save(); g.fillStyle = rgb(PAL.camiseta); g.beginPath(); g.arc(B.h.x - 8, B.h.y + 12, 20, 0, Math.PI * 2); g.fill(); g.restore();
    if (p.ikContinuo) R.tiraContinua(g, A, "brazo", B.c);
    else R.tira(g, A, "brazo", B.c, 16);
    const jk = p.jarra.escala || JK;
    g.save(); g.translate(p.jarra.x, p.jarra.y); g.rotate(p.jarra.ang); g.scale(jk, jk);
    jarra(g, p.jarra, t); puno(g); g.restore();
    g.restore();
    return true;
  }

  // posición en pantalla de un punto del cuerpo (hoja)
  const aPantalla = (p, q) => ({ x: p.x + (q.x - PELVIS.x) * p.s, y: p.suelo + (q.y - SUELO) * p.s });

  return { A, C, dibujar, cabeza, boca, centroCabeza, tronco, aPantalla, inclinacionParaBeber, BORDE, JK, rotP,
    SUELO, PELVIS, CADERA, TOBILLO_ALTO, PUNTA, TALON, CUELLO, HOMBRO, listo: () => A.listo };
})();
