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
    const img = new Image();
    const A = { id, datos, img, listo: false, error: null };
    img.onload = () => { A.listo = true; };
    img.onerror = () => { A.error = "No se pudo cargar " + img.src; };
    img.src = BASE + ruta + datos.atlas;
    if (img.complete && img.naturalWidth) A.listo = true;
    ATLAS.push(A);
    return A;
  }

  /* Pieza rígida en coordenadas de la hoja; con `ancla`, ese punto de la hoja queda en el origen actual. */
  function pieza(g, A, nombre, ancla) {
    const p = A.datos.piezas[nombre];
    const [mx, my, mw, mh] = p.marco, q = ancla || [0, 0];
    g.drawImage(A.img, mx, my, mw, mh, p.origen[0] - q[0], p.origen[1] - q[1], p.tam_hoja[0], p.tam_hoja[1]);
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
    const ang = s => a1 + (a2 - a1) * suave((s - (sj - r)) / (2 * r));
    for (let i = 0; i < n; i++) {
      const s0 = L * i / n, s1 = L * (i + 1) / n;
      const am = ang((s0 + s1) / 2), h = (s1 - s0) * sig;
      x += -Math.sin(am) * h; y += Math.cos(am) * h;
      pts.push({ x, y, a: am });
    }
    return pts;
  }
  function extremo(c) { const m = muestras(c, 24); return m[m.length - 1]; }

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
    for (let i = 0; i < n; i++) {
      const s0 = L * i / n, s1 = L * (i + 1) / n;
      // filas de la hoja que cubre la rodaja (la primera incluye el remate de arriba, la última el de abajo)
      let r0 = ay + s0, r1 = ay + s1 + (i < n - 1 ? SOLAPE : 0);
      if (i === 0) r0 = Math.min(r0, yTop);
      if (i === n - 1) r1 = Math.max(r1, yBot);
      r0 = Math.max(r0, yTop); r1 = Math.min(r1, yBot);
      if (r1 <= r0) continue;
      const P = pts[i], am = pts[i + 1].a;
      g.save();
      g.translate(P.x, P.y); g.rotate(am); g.scale(1, sig);
      g.drawImage(A.img, mx, my + (r0 - oy) * tau, mw, (r1 - r0) * tau, ox - ax, r0 - (ay + s0), p.tam_hoja[0], r1 - r0);
      g.restore();
    }
    return pts;
  }

  return { cargar, pieza, tira, ik, muestras, extremo, dir, angDe, listos: () => ATLAS.every(a => a.listo), errores: () => ATLAS.filter(a => a.error).map(a => a.error) };
})();
