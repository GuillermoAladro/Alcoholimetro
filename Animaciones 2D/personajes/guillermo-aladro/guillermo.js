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
  const rgbHex = c => "#" + c.map(v => v.toString(16).padStart(2, "0")).join("");
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

  const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mezclaColor = (a, b, k) => { const x = hexRgb(a), y = hexRgb(b); return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], k))).join(",")})`; };
  const IRIS_AZUL = "#0b5f8f", IRIS_AZUL_LUZ = "#5fe0ff";
  function globo(g, o, mirada, escIris = 1, azul = 0, espiral = 0, giro = 0) {
    g.save();
    g.beginPath(); rutaPoli(g, o.poli); g.fillStyle = C.blanco; g.fill();
    g.lineWidth = 3; g.strokeStyle = C.blanco; g.stroke();            // tapa la junta con la cabeza
    g.clip();
    const ix = o.c.x + o.rx * mirada.x, iy = o.c.y + o.ry * mirada.y, r = o.r * escIris;
    g.fillStyle = azul > 0 ? mezclaColor("#5e2d15", IRIS_AZUL, azul) : C.iris; g.beginPath(); g.arc(ix, iy, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = azul > 0 ? mezclaColor(rgbHex(PAL.iris), IRIS_AZUL_LUZ, azul) : C.irisLuz; g.beginPath(); g.ellipse(ix, iy + r * 0.32, r * 0.7, r * 0.55, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#120806"; g.beginPath(); g.arc(ix, iy + r * 0.05, r * 0.46, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(ix - r * 0.36, iy - r * 0.34, r * 0.3, r * 0.24, -0.4, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(ix + r * 0.38, iy + r * 0.36, r * 0.12, 0, Math.PI * 2); g.fill();
    // sombra del párpado superior
    g.strokeStyle = C.ojoSombra; g.lineWidth = 9; g.beginPath(); ruta(g, o.U); g.stroke();
    if (espiral > 0.01) {            // ojos en espiral: mareado
      g.globalAlpha = clamp(espiral * 1.5); g.fillStyle = C.blanco; g.beginPath(); rutaPoli(g, o.poli); g.fill();
      g.globalAlpha = clamp(espiral); g.strokeStyle = "#141018"; g.lineWidth = 4.2; g.lineCap = "round"; g.beginPath();
      for (let k = 0; k <= 60; k++) { const a = giro + k / 60 * Math.PI * 5, r = 1.5 + k / 60 * o.r * 1.25;
        const x = o.c.x + Math.cos(a) * r * (o.rx / 22), y = o.c.y + Math.sin(a) * r * 0.85; if (k) g.lineTo(x, y); else g.moveTo(x, y); }
      g.stroke();
    }
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

  // Púas de pelo dorado que se levantan detrás del pelo del avatar (transformación).
  const PUAS = [[625, 335, -2.3, 125, 190, 0.45], [715, 275, -1.88, 195, 205, -0.38], [818, 262, -1.52, 185, 195, 0.36],
                [920, 296, -1.17, 175, 190, -0.32], [1004, 356, -0.82, 140, 172, 0.3], [1056, 438, -0.5, 100, 140, -0.25]];
  function puas(g, k, t) {
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    PUAS.forEach(([bx, by, a, L, w, cu], i) => {
      const fl = 1 + 0.05 * Math.sin(t * 13 + i * 1.7) + 0.035 * Math.sin(t * 23 + i * 0.6);
      const aa = a + 0.06 * Math.sin(t * 9 + i * 2.1);
      const dx = Math.cos(aa), dy = Math.sin(aa), px = -dy, py = dx, len = 40 + L * k * fl;
      const tip = { x: bx + dx * len + px * cu * 40 * k, y: by + dy * len + py * cu * 40 * k };
      const b1 = { x: bx + px * w / 2, y: by + py * w / 2 }, b2 = { x: bx - px * w / 2, y: by - py * w / 2 };
      const c1 = { x: bx + dx * len * 0.55 + px * w * (0.32 + cu * 0.3), y: by + dy * len * 0.55 + py * w * (0.32 + cu * 0.3) };
      const c2 = { x: bx + dx * len * 0.5 - px * w * (0.12 - cu * 0.3), y: by + dy * len * 0.5 - py * w * (0.12 - cu * 0.3) };
      const forma = () => { g.beginPath(); g.moveTo(b1.x, b1.y); g.quadraticCurveTo(c1.x, c1.y, tip.x, tip.y); g.quadraticCurveTo(c2.x, c2.y, b2.x, b2.y); g.closePath(); };
      forma(); g.fillStyle = "#fbd332"; g.fill();
      g.save(); forma(); g.clip();
      g.fillStyle = "#d39a0c"; g.beginPath(); g.moveTo(bx - px * w * 0.05, by - py * w * 0.05); g.quadraticCurveTo(c2.x, c2.y, tip.x, tip.y); g.lineTo(b2.x, b2.y); g.closePath(); g.fill();
      g.fillStyle = "rgba(255,248,190,0.8)"; g.beginPath(); g.moveTo(b1.x - px * 14, b1.y - py * 14);
      g.quadraticCurveTo(c1.x - px * 16, c1.y - py * 16, bx + dx * len * 0.75 + px * 6, by + dy * len * 0.75 + py * 6); g.lineTo(bx + px * w * 0.12, by + py * w * 0.12); g.closePath(); g.fill();
      g.restore();
      forma(); g.lineWidth = 5.5; g.strokeStyle = "#2a1702"; g.stroke();
    });
    g.restore();
  }

  // Gotas de sudor por el esfuerzo (resbalan por la sien y la frente).
  function sudor(g, k, t) {
    g.save(); g.lineWidth = 4; g.strokeStyle = "#1d3b52";
    [[640, 470, 0], [915, 520, 0.37], [700, 430, 0.71]].forEach(([x, y, d], i) => {
      const ph = ((t * 0.55 + d) % 1), aparece = clamp(k * 3 - i);
      if (aparece <= 0) return;
      const yy = y + ph * 70, s = 13 * aparece * (1 - 0.3 * ph);
      g.globalAlpha = Math.sin(Math.PI * ph) * aparece;
      g.beginPath(); g.moveTo(x, yy - s * 1.6); g.quadraticCurveTo(x + s, yy, x, yy + s); g.quadraticCurveTo(x - s, yy, x, yy - s * 1.6);
      g.fillStyle = "#bfe8ff"; g.fill(); g.stroke();
      g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x - s * 0.3, yy - s * 0.1, s * 0.22, s * 0.35, 0, 0, Math.PI * 2); g.fill();
    });
    g.restore();
  }
  // Chichón que sale en la frente tras un golpe.
  function chichon(g, k, en) {
    g.save(); g.translate(en ? en.x : 742, en ? en.y : 468); g.scale(k, k);
    g.beginPath(); g.moveTo(-40, 14); g.bezierCurveTo(-40, -44, 40, -44, 40, 14); g.closePath();
    g.fillStyle = C.piel; g.fill();
    g.save(); g.clip(); g.fillStyle = "rgba(230,70,60,0.55)"; g.beginPath(); g.ellipse(0, -6, 26, 18, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = C.pielSombra; g.beginPath(); g.ellipse(14, 10, 26, 10, 0, 0, Math.PI * 2); g.fill(); g.restore();
    g.beginPath(); g.moveTo(-40, 14); g.bezierCurveTo(-40, -44, 40, -44, 40, 14); g.lineWidth = 6; g.strokeStyle = C.tinta; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.75)"; g.beginPath(); g.ellipse(-12, -16, 9, 5, -0.5, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // Vena de enfado (la cruz de los cómics) en la frente, latiendo.
  function vena(g, k, t) {
    const lat = 1 + 0.12 * Math.max(0, Math.sin(t * 9)) * k;
    g.save(); g.translate(700, 455); g.scale(k * lat, k * lat); g.rotate(-0.2);
    g.lineCap = "round"; g.strokeStyle = "#d0101a"; g.lineWidth = 11;
    for (let i = 0; i < 4; i++) { g.save(); g.rotate(i * Math.PI / 2); g.beginPath(); g.moveTo(10, -26); g.quadraticCurveTo(10, -10, 26, -10); g.stroke(); g.restore(); }
    g.restore();
  }
  // Trozos de goma del globo pegados a la cara.
  function pegotes(g, k) {
    g.save(); g.lineJoin = "round";
    [[862, 690, 18, 0.4], [770, 470, 24, -0.3], [690, 700, 20, 1.1], [940, 610, 14, 0.8]].forEach(([x, y, r, a], i) => {
      const e = clamp(k * 4 - i); if (e <= 0) return;
      g.save(); g.translate(x, y); g.rotate(a); g.scale(e, e);
      g.beginPath(); g.moveTo(-r, -r * 0.3); g.lineTo(-r * 0.3, -r * 0.8); g.lineTo(r * 0.5, -r * 0.5); g.lineTo(r, r * 0.1);
      g.lineTo(r * 0.3, r * 0.7); g.lineTo(-r * 0.6, r * 0.5); g.closePath();
      g.fillStyle = "#d81f2a"; g.fill(); g.lineWidth = 5; g.strokeStyle = C.tinta; g.stroke();
      g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.ellipse(-r * 0.3, -r * 0.3, r * 0.25, r * 0.12, -0.5, 0, Math.PI * 2); g.fill();
      g.restore();
    });
    g.restore();
  }

  function dibCabeza(g, p, t) {
    const H = cabeza(p), f = p.cara;
    g.save(); g.translate(H.cx, H.cy); g.rotate(H.ang); g.scale(H.kx, H.ky); g.translate(-CAB_PIV.x, -CAB_PIV.y);
    const oro = p.oro || 0;
    if ((p.puas || 0) > 0.002) puas(g, p.puas, t);
    const esp = f.espiral || 0, gEsp = t * 7;
    globo(g, OJOS.d, f.mirada, f.iris ?? 1, p.ojosAzules || 0, esp, gEsp); globo(g, OJOS.i, f.mirada, f.iris ?? 1, p.ojosAzules || 0, esp, -gEsp);
    if (oro < 0.999) R.pieza(g, A, "cabeza");
    if (oro > 0.001) { g.save(); g.globalAlpha = oro; R.pieza(g, A, "cabeza_oro"); g.restore(); }
    const rojo = p.rojo || 0;
    if (rojo > 0.001) { g.save(); g.globalAlpha = clamp(rojo); R.pieza(g, A, "cabeza_roja"); g.restore(); }
    // cejas (piezas del avatar): suben y giran
    for (const [nom, lado, sg] of [["ceja_derecha", "d", -1], ["ceja_izquierda", "i", 1]]) {
      const c = f.cejas[lado], pv = PZ[nom].pivote;
      g.save(); g.translate(pv[0] + (c.dx || 0), pv[1] - c.sube); g.rotate(sg * c.giro);
      if (oro < 0.999) R.pieza(g, A, nom, pv);
      if (oro > 0.001) { g.globalAlpha = oro; R.pieza(g, A, nom + "_oro", pv); }
      g.restore();
    }
    mofletes(g, f.mofletes);
    rubor(g, f.rubor);
    dibBoca(g, f.boca, t);
    bigoteEspuma(g, f.bigote, t);
    const fe = f.ojos.feliz || 0, ap = f.ojos.apretado || 0;
    parpados(g, OJOS.d, f.ojos.d, fe, ap, "d");
    parpados(g, OJOS.i, f.ojos.i, fe, ap, "i");
    if ((p.sudor || 0) > 0.01) sudor(g, p.sudor, t);
    if ((p.chichon || 0) > 0.01) chichon(g, p.chichon, p.chichonEn);
    if ((p.enfado || 0) > 0.01) vena(g, p.enfado, t);
    if (p.pegotes) pegotes(g, p.pegotes);
    g.restore();
  }

  /* ---------- puño y jarra ---------- */
  function puno(g, pulgar) {         // en unidades de jarra, centrado en lo que agarra
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    const forma = () => { g.beginPath(); g.moveTo(-14, -6); g.quadraticCurveTo(-14, -12, -7, -12); g.lineTo(7, -12);
      g.quadraticCurveTo(14, -12, 14, -5); g.lineTo(14, 6); g.quadraticCurveTo(14, 13, 6, 13); g.lineTo(-8, 13);
      g.quadraticCurveTo(-15, 13, -15, 5); g.closePath(); };
    forma(); g.fillStyle = C.piel; g.fill();
    g.save(); forma(); g.clip(); g.fillStyle = C.pielSombra; g.beginPath(); g.ellipse(-2, 13, 18, 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
    forma(); g.lineWidth = 2.2; g.strokeStyle = C.tinta; g.stroke();
    // dedos doblados y pulgar por encima (o levantado: «pulgar arriba»)
    g.lineWidth = 1.4; g.beginPath(); for (let i = -1; i <= 1; i++) { g.moveTo(14, i * 5.6 + 1); g.lineTo(7, i * 5.6 + 1.6); } g.stroke();
    const pu = clamp(pulgar || 0);
    if (pu < 0.5) {
      g.beginPath(); g.moveTo(-9, -11); g.quadraticCurveTo(2, -16, 10, -9); g.quadraticCurveTo(4, -5, -6, -6); g.closePath();
      g.fillStyle = C.piel; g.fill(); g.lineWidth = 1.8; g.stroke();
    } else {
      const L = 22 * (pu - 0.5) * 2;
      g.beginPath(); g.moveTo(-9, -8); g.lineTo(-9, -12 - L); g.quadraticCurveTo(-9, -19 - L, -3, -19 - L); g.quadraticCurveTo(3, -19 - L, 3, -12 - L); g.lineTo(3, -9); g.closePath();
      g.fillStyle = C.piel; g.fill(); g.lineWidth = 1.8; g.stroke();
      g.lineWidth = 1.1; g.beginPath(); g.moveTo(-6, -15 - L); g.quadraticCurveTo(-3, -17 - L, 0, -15 - L); g.stroke();
    }
    g.restore();
  }
  // Puño de las escenas de la jarra (00001 y 00001.2): se conserva tal cual para no cambiar sus fotogramas.
  function punoJarra(g, lado) {      // en unidades de jarra, centrado en el asa
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
  function nivelEn(INT, AREA, n, vol) {
    let lo = Math.min(...INT.map(q => q.x * n.x + q.y * n.y)), hi = Math.max(...INT.map(q => q.x * n.x + q.y * n.y));
    const obj = clamp(vol) * AREA;
    for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (area(recorta(INT, n, m)) > obj) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  function inclinacionEn(INT, AREA, B, vol) {
    let lo = 0, hi = -2.4;
    for (let i = 0; i < 28; i++) {
      const a = (lo + hi) / 2, n = rotP({ x: 0, y: 1 }, -a);
      if (area(recorta(INT, n, B.x * n.x + B.y * n.y)) > vol * AREA) lo = a; else hi = a;
    }
    return (lo + hi) / 2;
  }
  const nivel = (n, vol) => nivelEn(INTERIOR, AREA_INT, n, vol);
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

  /* ---------- copa de balón (gin-tonic): origen en el tallo, donde agarra el puño ---------- */
  const COPA_C = { x: 0, y: -50 }, COPA_R = 25, COPA_RIM = -69;
  const COPA_INT = (() => {
    const f0 = Math.asin((COPA_RIM - COPA_C.y) / COPA_R), pts = [];
    for (let i = 0; i <= 22; i++) { const f = f0 + (Math.PI - 2 * f0) * i / 22; pts.push(P(COPA_C.x + COPA_R * Math.cos(f), COPA_C.y + COPA_R * Math.sin(f))); }
    return pts;
  })();
  const COPA_AREA = area(COPA_INT);
  const COPA_BORDE = COPA_INT[COPA_INT.length - 1];          // borde izquierdo: el que va a la boca
  const inclinacionCopa = vol => inclinacionEn(COPA_INT, COPA_AREA, COPA_BORDE, vol);
  function copa(g, c, t) {
    const RO = COPA_R + 3.5, f0 = Math.asin((COPA_RIM - 2 - COPA_C.y) / RO);
    const cuenco = () => { g.beginPath(); g.arc(COPA_C.x, COPA_C.y, RO, f0, Math.PI - f0); g.closePath(); };
    g.lineJoin = "round"; g.lineCap = "round";
    // pie y tallo
    g.fillStyle = "rgba(225,242,255,0.55)"; g.strokeStyle = C.tinta; g.lineWidth = 1.8;
    g.beginPath(); g.ellipse(0, 27, 19, 4.5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.rect(-2.2, COPA_C.y + RO - 4, 4.4, 27 - (COPA_C.y + RO - 4)); g.fill(); g.stroke();
    cuenco(); g.fillStyle = "rgba(214,236,255,0.22)"; g.fill();
    const n = rotP({ x: 0, y: 1 }, -c.ang + (c.chapoteo || 0));
    let sup = null;
    if (c.vol > 0.003) {
      const cl = nivelEn(COPA_INT, COPA_AREA, n, c.vol), pl = recorta(COPA_INT, n, cl);
      if (pl.length > 2) {
        g.beginPath(); poligono(g, pl); g.fillStyle = "rgba(190,236,248,0.88)"; g.fill();
        g.save(); g.beginPath(); poligono(g, pl); g.clip();
        const fondo = recorta(COPA_INT, n, cl + 14); if (fondo.length > 2) { g.beginPath(); poligono(g, fondo); g.fillStyle = "rgba(120,200,225,0.55)"; g.fill(); }
        g.fillStyle = "rgba(255,255,255,0.85)";
        for (let i = 0; i < 8; i++) { const ph = (t * (0.5 + M2.hash(i) * 0.5) + M2.hash(i + 4)) % 1; g.beginPath();
          g.arc(-16 + M2.hash(i + 2) * 32, -28 - ph * 40, 0.9 + M2.hash(i + 6), 0, Math.PI * 2); g.fill(); }
        g.restore();
        // superficie: recta de la cara libre (perpendicular a n)
        const cs = pl.filter(q => Math.abs(q.x * n.x + q.y * n.y - cl) < 0.01);
        if (cs.length >= 2) sup = cs;
      }
    }
    // hielos y limón: flotan en la superficie o se quedan en el fondo
    g.save(); g.beginPath(); poligono(g, COPA_INT); g.clip();
    const tg = { x: -n.y, y: n.x };
    let base;
    if (sup) base = { x: (sup[0].x + sup[1].x) / 2, y: (sup[0].y + sup[1].y) / 2 };
    else { const low = COPA_INT.reduce((a, q) => (q.x * n.x + q.y * n.y > a.x * n.x + a.y * n.y ? q : a)); base = { x: low.x - n.x * 6, y: low.y - n.y * 6 }; }
    const hielos = [[-9, 3, 0.3], [5, 4, -0.2], [-1, 9, 0.6]];
    for (const [u, v, r] of hielos) {
      const x = base.x + tg.x * u + n.x * (sup ? v - 3 : -v * 0.6), y = base.y + tg.y * u + n.y * (sup ? v - 3 : -v * 0.6);
      g.save(); g.translate(x, y); g.rotate(r + c.ang * 0.3);
      g.fillStyle = "rgba(240,252,255,0.92)"; g.strokeStyle = "rgba(60,110,140,0.9)"; g.lineWidth = 1.2;
      g.beginPath(); g.roundRect ? g.roundRect(-5, -5, 10, 10, 2.5) : g.rect(-5, -5, 10, 10); g.fill(); g.stroke();
      g.fillStyle = "#ffffff"; g.fillRect(-3, -3, 3, 2); g.restore();
    }
    if (sup) { g.save(); g.translate(base.x + tg.x * 12, base.y + tg.y * 12); g.rotate(Math.atan2(tg.y, tg.x));
      g.fillStyle = "#f6e04a"; g.strokeStyle = "#6b5a0a"; g.lineWidth = 1.2; g.beginPath(); g.arc(0, 0, 7, Math.PI, 0); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#fff6b0"; g.beginPath(); g.arc(0, 0, 4.5, Math.PI, 0); g.closePath(); g.fill(); g.restore(); }
    g.restore();
    // vidrio: brillo, borde y grietas
    g.save(); cuenco(); g.clip();
    g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 2.2; g.beginPath(); g.arc(COPA_C.x, COPA_C.y, RO - 5, Math.PI * 0.62, Math.PI * 0.92); g.stroke();
    g.lineWidth = 1.2; g.beginPath(); g.arc(COPA_C.x, COPA_C.y, RO - 5, Math.PI * 0.12, Math.PI * 0.22); g.stroke();
    if ((c.grietas || 0) > 0.01) {
      g.strokeStyle = "rgba(255,255,255,0.95)"; g.lineWidth = 1.1;
      for (let r = 0; r < 5; r++) {
        let x = -4 + M2.hash(r + 40) * 8, y = -44 + M2.hash(r + 41) * 8; const a0 = r * 1.3 + M2.hash(r + 42);
        g.beginPath(); g.moveTo(x, y);
        const pasos = Math.ceil(6 * c.grietas);
        for (let k = 0; k < pasos; k++) { const a = a0 + (M2.hash(r * 9 + k) - 0.5) * 1.4; x += Math.cos(a) * 5; y += Math.sin(a) * 5; g.lineTo(x, y); }
        g.stroke();
      }
    }
    g.restore();
    cuenco(); g.strokeStyle = C.tinta; g.lineWidth = 2; g.stroke();
    g.beginPath(); g.ellipse(COPA_C.x, COPA_RIM - 2 + 0.5, RO * Math.cos(f0), 2.6, 0, 0, Math.PI * 2); g.lineWidth = 1.6; g.stroke();
  }

  /* ---------- torso al descubierto (transformación) ---------- */
  // Silueta del torso entre los dos bordes de la camiseta y dibujo de los músculos con el mismo
  // trazo y sombreado plano del avatar.
  const SIL_TORSO = [[128, 292], [180, 284], [243, 298], [306, 286], [353, 318], [346, 360], [343, 420], [341, 470], [338, 515], [336, 560],
                     [339, 610], [345, 645], [243, 652], [147, 638], [140, 615], [136, 590], [138, 570], [136, 550], [138, 530], [132, 510],
                     [123, 490], [121, 445], [124, 360]];
  function torsoDesnudo(g, m) {
    const sil = () => { g.beginPath(); rutaPoli(g, SIL_TORSO); };
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    sil(); g.fillStyle = C.piel; g.fill();
    g.save(); sil(); g.clip();
    // volumen: costados en sombra
    for (const [x0, x1] of [[118, 182], [352, 296]]) { const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, "rgba(198,110,58,0.95)"); gr.addColorStop(0.45, "rgba(214,130,74,0.55)"); gr.addColorStop(1, "rgba(214,130,74,0)"); g.fillStyle = gr; g.fillRect(Math.min(x0, x1), 280, Math.abs(x1 - x0), 380); }
    const sombra = C.pielSombra, linea = "#5a2a10";
    // pectorales: media luna de sombra bajo cada uno, brillo arriba
    g.fillStyle = sombra;
    g.beginPath(); g.moveTo(132, 392); g.quadraticCurveTo(168, 466, 240, 442); g.lineTo(240, 462); g.quadraticCurveTo(168, 488, 132, 420); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(350, 398); g.quadraticCurveTo(318, 468, 246, 444); g.lineTo(246, 464); g.quadraticCurveTo(318, 490, 350, 426); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,226,180,0.7)";
    g.beginPath(); g.ellipse(190, 372, 34, 22, -0.2, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(298, 376, 32, 21, 0.2, 0, Math.PI * 2); g.fill();
    // abdominales: tres filas de dos con bisel de sombra
    for (let f = 0; f < 3; f++) for (const lado of [-1, 1]) {
      const y = 468 + f * 52, x = lado < 0 ? 196 : 247, w = 43, h = 44;
      g.fillStyle = sombra; g.beginPath(); g.roundRect ? g.roundRect(x + 2, y + 4, w, h, 12) : g.rect(x + 2, y + 4, w, h); g.fill();
      g.fillStyle = C.piel; g.beginPath(); g.roundRect ? g.roundRect(x, y, w - 4, h - 7, 12) : g.rect(x, y, w - 4, h - 7); g.fill();
      g.fillStyle = "rgba(255,226,180,0.6)"; g.beginPath(); g.ellipse(x + 13, y + 11, 9, 6, -0.3, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 0.35 + 0.65 * m;
    g.strokeStyle = linea;
    g.lineWidth = 5; g.beginPath(); g.moveTo(132, 392); g.quadraticCurveTo(168, 466, 240, 442); g.stroke();
    g.beginPath(); g.moveTo(350, 398); g.quadraticCurveTo(318, 468, 246, 444); g.stroke();
    g.lineWidth = 3.5; g.beginPath(); g.moveTo(243, 322); g.lineTo(243, 442); g.stroke();
    g.beginPath(); g.moveTo(178, 316); g.quadraticCurveTo(205, 318, 233, 330); g.moveTo(253, 330); g.quadraticCurveTo(280, 318, 310, 318); g.stroke();
    g.beginPath(); g.moveTo(150, 336); g.quadraticCurveTo(160, 360, 156, 390); g.moveTo(336, 340); g.quadraticCurveTo(326, 364, 330, 394); g.stroke();
    g.lineWidth = 4; g.beginPath(); g.moveTo(243, 452); g.lineTo(243, 628); g.stroke();
    for (let f = 0; f < 2; f++) { const y = 515 + f * 52; g.beginPath(); g.moveTo(198, y - 2); g.quadraticCurveTo(220, y + 3, 243, y); g.quadraticCurveTo(266, y + 3, 290, y - 2); g.stroke(); }
    // serratos y oblicuos
    g.lineWidth = 3.2;
    for (let k = 0; k < 3; k++) { const y = 440 + k * 27;
      g.beginPath(); g.moveTo(152, y); g.lineTo(183, y + 12); g.moveTo(334, y + 2); g.lineTo(303, y + 14); g.stroke(); }
    g.lineWidth = 4; g.beginPath(); g.moveTo(170, 560); g.quadraticCurveTo(190, 610, 222, 650); g.moveTo(318, 562); g.quadraticCurveTo(296, 612, 264, 650); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.arc(243, 618, 5, 0.2, Math.PI - 0.2); g.stroke();
    g.restore();
    sil(); g.lineWidth = 6; g.strokeStyle = C.tinta; g.stroke();
    g.restore();
  }
  // Agujero de la camiseta rasgada: polígono dentado que crece desde el pecho.
  function agujero(k, semilla) {
    const pts = [], N = 46, cx = 243, cy = 470;
    for (let i = 0; i < N; i++) {
      const a = i / N * Math.PI * 2;
      const j = 1 + 0.2 * (M2.hash(i * 3.17 + semilla) - 0.5) * 2;
      const diente = i % 2 ? 0.84 : 1.02;
      const rx = 128 * k * j * diente, ry = 175 * k * j * diente;
      pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry * (Math.sin(a) < 0 ? 0.98 : 1)]);
    }
    return pts;
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

  const HOMBRO_C = { x: 88, y: 345 };
  const BRAZO_C_L = PZ.brazo_cerca.fin[1] - PZ.brazo_cerca.raiz[1], BRAZO_C_CODO = PZ.brazo_cerca.codo;
  function brazoMano(raiz, mano, L, sj) {
    const mu = mano.mu ?? -1.75;
    const m = rotP({ x: Math.cos(mu) * MUNECA_R * JK, y: Math.sin(mu) * MUNECA_R * JK }, mano.ang || 0);
    const c = R.ik(raiz, { x: mano.x + m.x, y: mano.y + m.y }, L, sj, 42, mano.dobla ?? -1, 1.08);
    c.grosor = mano.grosor || 1;
    c.capFija = true; c.caminoCorto = true;
    return c;
  }
  // Hombro redondo (camiseta) donde nace el brazo libre: tapa la junta al girar el brazo.
  function hombro(g, h, lado) {
    g.save(); g.lineCap = "round";
    g.fillStyle = rgb(PAL.camiseta); g.beginPath(); g.ellipse(h.x, h.y, 34, 36, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = C.tinta; g.lineWidth = 6; g.beginPath();
    if (lado < 0) g.ellipse(h.x, h.y, 34, 36, 0, Math.PI * 0.95, Math.PI * 1.5); else g.ellipse(h.x, h.y, 34, 36, 0, Math.PI * 1.5, Math.PI * 2.05);
    g.stroke(); g.restore();
  }
  function dibManoYObjeto(g, mano, t) {
    g.save(); g.translate(mano.x, mano.y); g.rotate(mano.ang || 0); g.scale(JK * (mano.espejo ? -1 : 1), JK);
    if (mano.objeto) mano.objeto(g, t);
    const k = mano.puno ?? 1;
    if (k > 0.01) { if (k < 0.999) g.scale(k, k); puno(g, mano.pulgar); }
    g.restore();
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
    // torso (con la mano en el bolsillo o con los dos brazos libres; camiseta entera o rota)
    const T = tronco(p), nomTronco = p.manoCerca ? "tronco_libre" : "tronco";
    g.save(); g.translate(p.pelvis.x, p.pelvis.y); g.rotate(p.torso); g.scale(p.torsoEsc.x, p.torsoEsc.y); g.translate(-PELVIS.x, -PELVIS.y);
    const rasg = p.rasgado || 0;
    if (rasg > 0.002) {
      const hueco = agujero(rasg, p.semillaRoto || 0);
      g.save(); g.beginPath(); rutaPoli(g, hueco); g.clip(); torsoDesnudo(g, p.musculo ?? 1); g.restore();
      g.save(); g.beginPath(); g.rect(-200, 100, 900, 900); rutaPoli(g, hueco); g.clip("evenodd"); R.pieza(g, A, nomTronco); g.restore();
      g.save(); g.beginPath(); rutaPoli(g, SIL_TORSO); g.clip();
      g.beginPath(); rutaPoli(g, hueco); g.lineJoin = "miter"; g.lineWidth = 7; g.strokeStyle = "#08080a"; g.stroke();
      g.lineWidth = 2.2; g.strokeStyle = "#4a4a56"; g.stroke(); g.restore();
    } else R.pieza(g, A, nomTronco);
    g.restore();
    // cabeza
    dibCabeza(g, p, t);
    // brazo lejano: con la jarra (00001 y 00001.2) o con la mano libre (00002, 00003)
    if (p.jarra) {
      const B = brazo(p);
      g.save(); g.fillStyle = rgb(PAL.camiseta); g.beginPath(); g.arc(B.h.x - 8, B.h.y + 12, 20, 0, Math.PI * 2); g.fill(); g.restore();
      if (p.ikContinuo) R.tiraContinua(g, A, "brazo", B.c);
      else R.tira(g, A, "brazo", B.c, 16);
      const jk = p.jarra.escala || JK;
      g.save(); g.translate(p.jarra.x, p.jarra.y); g.rotate(p.jarra.ang); g.scale(jk, jk);
      jarra(g, p.jarra, t); punoJarra(g); g.restore();
    } else if (p.manoLejos) {
      const h = T(HOMBRO), c = brazoMano(h, p.manoLejos, BRAZO_L, BRAZO_L * 0.5); c.capAng = p.torso;
      hombro(g, { x: h.x - 6, y: h.y + 14 }, 1);
      R.tira(g, A, "brazo", c, 16);
      dibManoYObjeto(g, p.manoLejos, t);
    }
    // brazo cercano fuera del bolsillo
    if (p.manoCerca) {
      const h = T(HOMBRO_C), c = brazoMano(h, p.manoCerca, BRAZO_C_L, BRAZO_C_CODO); c.capAng = p.torso;
      hombro(g, { x: h.x + 8, y: h.y + 22 }, -1);
      R.tira(g, A, "brazo_cerca", c, 16);
      dibManoYObjeto(g, p.manoCerca, t);
    }
    g.restore();
    return true;
  }

  // posición en pantalla de un punto del cuerpo (hoja)
  const aPantalla = (p, q) => ({ x: p.x + (q.x - PELVIS.x) * p.s, y: p.suelo + (q.y - SUELO) * p.s });

  return { A, C, dibujar, cabeza, boca, centroCabeza, tronco, aPantalla, inclinacionParaBeber, BORDE, JK, rotP,
    copa, inclinacionCopa, COPA_BORDE, MUNECA_R, BRAZO_L, BRAZO_C_L,
    SUELO, PELVIS, CADERA, TOBILLO_ALTO, PUNTA, TALON, CUELLO, HOMBRO, HOMBRO_C, listo: () => A.listo };
})();
