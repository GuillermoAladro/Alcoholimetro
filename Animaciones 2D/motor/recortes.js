"use strict";
/* Animaciones 2D · recortables a partir de los avatares 2D.
 *
 * Cada personaje se trocea una vez (script preparar_piezas.py de su carpeta) en piezas PNG
 * dentro de un atlas. Aquí se dibujan esas piezas: rígidas (cabeza, torso, zapatillas…) o
 * dobladas como una manguera (brazos y piernas: la pieza se corta en rodajas que siguen una
 * curva suave, así la rodilla y el codo se doblan sin juntas visibles).
 *
 * Unidades: píxeles de la hoja original del avatar. La escena escala al tamaño de pantalla.
 */
const Recortes = (() => {
  const { clamp, suave } = M2;
  const BASE = (typeof window !== "undefined" && window.A2D_BASE) || "";
  const ATLAS = [];

  function cargar(id, ruta) {
    const datos = window.PIEZAS_2D && window.PIEZAS_2D[id];
    if (!datos) throw Error("Faltan las piezas de " + id + " (¿se cargó piezas.js?)");
    // Uno o varios atlas por personaje: cada pieza dice en «img» de cuál sale (0 por defecto).
    const fuentes = Array.isArray(datos.atlas) ? datos.atlas : [datos.atlas];
    const A = { id, datos, imgs: [], img: null, listo: false, error: null };
    let cargadas = 0;
    for (const f of fuentes) {
      const im = new Image();
      im.onload = () => { if (++cargadas === fuentes.length) A.listo = true; };
      im.onerror = () => { A.error = "No se pudo cargar " + im.src; };
      im.src = BASE + ruta + f;
      A.imgs.push(im);
    }
    A.img = A.imgs[0];
    if (A.imgs.every(im => im.complete && im.naturalWidth)) A.listo = true;
    ATLAS.push(A);
    return A;
  }

  const imagen = (A, p) => (A.imgs ? A.imgs[p.img || 0] : A.img);

  /* Pieza rígida en coordenadas de la hoja; con `ancla`, ese punto de la hoja queda en el origen actual. */
  function pieza(g, A, nombre, ancla) {
    const p = A.datos.piezas[nombre];
    const [mx, my, mw, mh] = p.marco, q = ancla || [0, 0];
    g.drawImage(imagen(A, p), mx, my, mw, mh, p.origen[0] - q[0], p.origen[1] - q[1], p.tam_hoja[0], p.tam_hoja[1]);
  }

  /* Ángulo θ: 0 = hacia abajo; la dirección es (−sen θ, cos θ) (igual que rotate(θ) aplicado a (0,1)). */
  const dir = a => ({ x: -Math.sin(a), y: Math.cos(a) });
  const angDe = (dx, dy) => Math.atan2(-dx, dy);

  /* Curva de una extremidad de dos tramos con la articulación redondeada.
   * raiz, a1, a2, largo total L, posición de la articulación sj, radio de redondeo r, estirado σ. */
  function muestras(c, n) {
    const { raiz, a1, a2, L, sj, r } = c, sig = c.estira || 1;
    const pts = [{ x: raiz.x, y: raiz.y, a: a1 }];
    let x = raiz.x, y = raiz.y;
    let da = a2 - a1;
    if (c.caminoCorto) da -= Math.round(da / (2 * Math.PI)) * 2 * Math.PI;      // codo por el camino corto (brazos libres)
    const ang = s => a1 + da * suave((s - (sj - r)) / (2 * r));
    for (let i = 0; i < n; i++) {
      const s0 = L * i / n, s1 = L * (i + 1) / n;
      const am = ang((s0 + s1) / 2), h = (s1 - s0) * sig;
      x += -Math.sin(am) * h; y += Math.cos(am) * h;
      pts.push({ x, y, a: am });
    }
    return pts;
  }
  function extremo(c) { const m = muestras(c, c.muestras || 24); return m[m.length - 1]; }

  /* IK continuo para las revisiones: resuelve la curva que realmente se dibuja.
   * El ángulo del codo permanece en una sola rama y su radio se reduce al plegar
   * mucho el brazo. Así no gira 360° ni deja la muñeca separada del puño.
   * La IK anterior se conserva para reproducir las escenas originales. */
  function ikContinuo(raiz, obj, L, sj, r, dobla, estiraMax = 1.08) {
    const dx = obj.x - raiz.x, dy = obj.y - raiz.y, d = Math.hypot(dx, dy);
    const sig = Math.min(estiraMax, Math.max(1, d / (L * 0.992)));
    const radio = Math.min(r, Math.max(0.02, d * 0.2));
    const n = 32;
    const curva = giro => ({ raiz: { x: 0, y: 0 }, a1: 0, a2: dobla * giro,
      L, sj, r: radio, estira: sig, muestras: n });
    let lo = 0, hi = Math.PI - 0.0001;
    for (let i = 0; i < 28; i++) {
      const m = (lo + hi) / 2, e = extremo(curva(m));
      if (Math.hypot(e.x, e.y) > d) lo = m; else hi = m;
    }
    const c = curva((lo + hi) / 2), e = extremo(c);
    const a = angDe(dx, dy) - angDe(e.x, e.y);
    c.raiz = raiz; c.a1 += a; c.a2 += a;
    return c;
  }

  /* IK de dos tramos con corrección del redondeo (el extremo llega exacto al objetivo).
   * dobla: +1 la articulación sale hacia +x de la recta raíz→objetivo (mirando hacia abajo), −1 al revés. */
  function ik(raiz, obj, L, sj, r, dobla, estiraMax = 1.08) {
    let o = { x: obj.x, y: obj.y }, c = null;
    for (let it = 0; it < 4; it++) {
      const dx = o.x - raiz.x, dy = o.y - raiz.y, d = Math.hypot(dx, dy);
      const L1 = sj, L2 = L - sj;
      // estiramiento suave cerca de la extensión completa (sin chasquido de rodilla)
      const lim = (L1 + L2) * 0.992;
      let sig = 1;
      if (d > lim) sig = Math.min(estiraMax, d / lim);
      const l1 = L1 * sig, l2 = L2 * sig;
      const dd = Math.min(d, (l1 + l2) * 0.9995);
      const base = angDe(dx, dy);
      const alfa = Math.acos(clamp((l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd), -1, 1));
      const a1 = base - dobla * alfa;
      const k = { x: raiz.x + dir(a1).x * l1, y: raiz.y + dir(a1).y * l1 };
      const a2 = angDe(raiz.x + dx / d * dd - k.x, raiz.y + dy / d * dd - k.y);
      c = { raiz, a1, a2, L, sj, r, estira: sig };
      const e = extremo(c);
      const ex = obj.x - e.x, ey = obj.y - e.y;
      if (Math.abs(ex) + Math.abs(ey) < 0.05) break;
      o = { x: o.x + ex, y: o.y + ey };
    }
    return c;
  }

  /* Dibuja una pieza vertical (eje x = raiz[0], de raiz[1] a fin[1]) siguiendo la curva c. */
  function tira(g, A, nombre, c, n = 16) {
    const p = A.datos.piezas[nombre];
    const [mx, my, mw, mh] = p.marco, tau = p.tau;
    const ox = p.origen[0], oy = p.origen[1], ax = p.raiz[0], ay = p.raiz[1];
    const L = p.fin[1] - p.raiz[1], sig = c.estira || 1;
    const pts = muestras(Object.assign({}, c, { L }), n);
    const yTop = oy, yBot = oy + p.tam_hoja[1];
    const SOLAPE = 5;
    // Con c.capFija no se dibuja el remate por encima de la raíz: el hombro lo dibuja el muñeco.
    for (let i = 0; i < n; i++) {
      const s0 = L * i / n, s1 = L * (i + 1) / n;
      // filas de la hoja que cubre la rodaja (la primera incluye el remate de arriba, la última el de abajo)
      // con c.cuna las rodajas se alargan por los dos lados y el recorte en cuña las deja justas
      const EXT = c.cuna ? 40 : 0;
      let r0 = ay + s0 - (i > 0 ? EXT : 0), r1 = ay + s1 + (i < n - 1 ? SOLAPE + EXT : 0);
      if (i === 0 && !c.capFija) r0 = Math.min(r0, yTop);
      if (i === n - 1) r1 = Math.max(r1, yBot);
      r0 = Math.max(r0, yTop); r1 = Math.min(r1, yBot);
      if (r1 <= r0) continue;
      const P = pts[i], am = pts[i + 1].a;
      g.save();
      // Con c.cuna cada rodaja se recorta por las bisectrices de sus juntas: al doblar mucho la
      // rodilla o el codo no asoman las esquinas de las rodajas (dientes de sierra en el pliegue).
      if (c.cuna) {
        const B = 4000, EPS = 1.2;
        const corta = (q, a, signo) => {     // semiplano por q, normal = eje medio en la junta
          const nx = -Math.sin(a) * signo, ny = Math.cos(a) * signo, ux = -ny, uy = nx;
          const x0 = q.x - nx * EPS, y0 = q.y - ny * EPS;
          g.beginPath(); g.moveTo(x0 + ux * B, y0 + uy * B); g.lineTo(x0 - ux * B, y0 - uy * B);
          g.lineTo(x0 - ux * B + nx * B, y0 - uy * B + ny * B); g.lineTo(x0 + ux * B + nx * B, y0 + uy * B + ny * B); g.closePath(); g.clip();
        };
        const medio = (a, b) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) / 2;
        if (i > 0) corta(P, medio(pts[i].a, am), 1);
        if (i < n - 1) corta(pts[i + 1], medio(am, pts[i + 2].a), -1);
      }
      g.translate(P.x, P.y); g.rotate(am); g.scale(c.grosor || 1, sig);
      g.drawImage(imagen(A, p), mx, my + (r0 - oy) * tau, mw, (r1 - r0) * tau, ox - ax, r0 - (ay + s0), p.tam_hoja[0], r1 - r0);
      g.restore();
    }
    return pts;
  }

  /* Malla continua para curvas cerradas de brazo. Las filas comparten vértices:
   * evita las puntas y huecos que dejan las rodajas rígidas al doblar el codo.
   * Se usan los mismos píxeles del atlas, sin volver a dibujar el personaje. */
  function tiraContinua(g, A, nombre, c) {
    const p = A.datos.piezas[nombre], [mx, my, mw, mh] = p.marco;
    const [ox, oy] = p.origen, [ancho, alto] = p.tam_hoja;
    const [ax, ay] = p.raiz, n = c.muestras || 32;
    const pts = muestras(c, n), sig = c.estira || 1;
    function vertice(x, y) {
      const s = y - ay, u = s / c.L * n;
      let q;
      if (u < 0) { const d = dir(c.a1); q = { x: pts[0].x + d.x * s * sig, y: pts[0].y + d.y * s * sig }; }
      else if (u >= n) { const d = dir(c.a2); q = { x: pts[n].x + d.x * (s - c.L) * sig, y: pts[n].y + d.y * (s - c.L) * sig }; }
      else { const i = Math.floor(u), k = u - i; q = { x: pts[i].x + (pts[i + 1].x - pts[i].x) * k, y: pts[i].y + (pts[i + 1].y - pts[i].y) * k }; }
      const a = c.a1 + (c.a2 - c.a1) * suave((s - (c.sj - c.r)) / (2 * c.r));
      return { x: q.x + (x - ax) * (c.grosor || 1) * Math.cos(a), y: q.y + (x - ax) * (c.grosor || 1) * Math.sin(a), u: x, v: y };
    }
    function triangulo(a, b, d) {
      const du1 = b.u - a.u, dv1 = b.v - a.v, du2 = d.u - a.u, dv2 = d.v - a.v;
      const det = du1 * dv2 - du2 * dv1;
      if (Math.abs(det) < 1e-8) return;
      const xx = ((b.x - a.x) * dv2 - (d.x - a.x) * dv1) / det;
      const xy = ((d.x - a.x) * du1 - (b.x - a.x) * du2) / det;
      const yx = ((b.y - a.y) * dv2 - (d.y - a.y) * dv1) / det;
      const yy = ((d.y - a.y) * du1 - (b.y - a.y) * du2) / det;
      const vertices = [a, b, d];
      const signo = Math.sign((b.x - a.x) * (d.y - a.y) - (b.y - a.y) * (d.x - a.x)) || 1;
      g.save(); g.beginPath();
      for (const [i, v] of vertices.entries()) {
        const u = vertices[(i + 2) % 3], w = vertices[(i + 1) % 3];
        const l1 = Math.hypot(v.x - u.x, v.y - u.y) || 1, l2 = Math.hypot(w.x - v.x, w.y - v.y) || 1;
        const n1 = { x: signo * (v.y - u.y) / l1, y: -signo * (v.x - u.x) / l1 };
        const n2 = { x: signo * (w.y - v.y) / l2, y: -signo * (w.x - v.x) / l2 };
        const den = Math.max(0.001, 1 + n1.x * n2.x + n1.y * n2.y);
        let ex = 1.7 * (n1.x + n2.x) / den, ey = 1.7 * (n1.y + n2.y) / den;
        const lim = Math.min(1, 18 / (Math.hypot(ex, ey) || 1)); ex *= lim; ey *= lim;
        const x = v.x + ex, y = v.y + ey;
        if (!i) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.closePath(); g.clip();
      g.transform(xx, yx, xy, yy, a.x - xx * a.u - xy * a.v, a.y - yx * a.u - yy * a.v);
      g.drawImage(imagen(A, p), mx, my, mw, mh, ox, oy, ancho, alto);
      g.restore();
    }
    // Más filas en el pliegue, sin cambiar la curva usada por la IK.
    const yInicio = c.capFija ? Math.max(oy, ay) : oy;
    const filas = [yInicio, oy + alto];
    for (let i = 0; i <= n; i++) filas.push(ay + c.L * i / n);
    for (let i = 0; i <= 12; i++) filas.push(ay + c.sj - c.r + 2 * c.r * i / 12);
    const ys = [...new Set(filas.filter(y => y >= yInicio && y <= oy + alto))].sort((a, b) => a - b);
    for (let i = 0; i < ys.length - 1; i++) {
      const a = vertice(ox, ys[i]), b = vertice(ox + ancho, ys[i]);
      const d = vertice(ox + ancho, ys[i + 1]), e = vertice(ox, ys[i + 1]);
      triangulo(a, b, d); triangulo(a, d, e);
    }
    return pts;
  }

  return { cargar, pieza, tira, tiraContinua, ik, ikContinuo, muestras, extremo, dir, angDe, listos: () => ATLAS.every(a => a.listo), errores: () => ATLAS.filter(a => a.error).map(a => a.error) };
})();
