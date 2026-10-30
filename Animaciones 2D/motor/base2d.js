"use strict";
/* Animaciones 2D · motor común (lienzo 1024 × 600, Canvas 2D, sin bibliotecas).
 *
 * Contrato de escena (igual que los bancos anteriores):
 *   registrar({id: "00001", nombre: "…", crear: () => escena})
 *   escena.t, escena.dur, escena.terminada, escena.actualizar(dt), escena.dibujar(ctx)
 *
 * Todo se calcula a partir del tiempo absoluto `t`: el mismo instante siempre da el
 * mismo fotograma (se puede rebobinar y grabar a cualquier fps sin saltos).
 * Regla de la carpeta: cada escena empieza y termina en negro absoluto.
 */
const W = 1024, H = 600;
const BANCO = [];
function registrar(a) {
  if (!a || !/^\d{5}(?:\.[1-9]\d*)?$/.test(a.id) || !a.nombre || typeof a.crear !== "function") throw Error("Registro inválido");
  if (BANCO.some(b => b.id === a.id)) throw Error("ID repetido: " + a.id);
  BANCO.push(a);
  BANCO.sort((x, y) => x.id.localeCompare(y.id));
}

const M2 = (() => {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  // tramo de longitud cero: escalón en a (antes daba NaN justo en t = a)
  const fase = (t, a, b) => b === a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a));
  const suave = k => { k = clamp(k); return k * k * (3 - 2 * k); };
  const suave5 = k => { k = clamp(k); return k * k * k * (k * (k * 6 - 15) + 10); };
  const entrada = k => { k = clamp(k); return k * k * k; };
  const salida = k => { k = clamp(k); return 1 - Math.pow(1 - k, 3); };
  const rebote = (k, s = 1.6) => { k = clamp(k) - 1; return 1 + k * k * ((s + 1) * k + s); };
  const tramo = (t, a, b, f = suave) => f(fase(t, a, b));
  const campana = (t, a, b) => { const k = fase(t, a, b); return k <= 0 || k >= 1 ? 0 : Math.sin(Math.PI * k); };
  const rot = (p, a) => { const c = Math.cos(a), s = Math.sin(a); return { x: p.x * c - p.y * s, y: p.x * s + p.y * c }; };
  const suma = (p, q) => ({ x: p.x + q.x, y: p.y + q.y });
  const resta = (p, q) => ({ x: p.x - q.x, y: p.y - q.y });
  const esc = (p, k) => ({ x: p.x * k, y: p.y * k });
  const mezcla = (p, q, k) => ({ x: lerp(p.x, q.x, k), y: lerp(p.y, q.y, k) });
  const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
  // Ruido suave determinista (para temblores, burbujas…)
  const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const ruido = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; };
  /* Curva suave (Catmull-Rom → Bézier) por una lista de puntos. */
  function curva(g, pts, cerrada = true, tension = 0.5) {
    const n = pts.length;
    if (n < 2) return;
    const P = i => cerrada ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
    g.moveTo(pts[0].x, pts[0].y);
    const fin = cerrada ? n : n - 1;
    for (let i = 0; i < fin; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      const k = tension / 3;
      g.bezierCurveTo(p1.x + (p2.x - p0.x) * k, p1.y + (p2.y - p0.y) * k,
                      p2.x - (p3.x - p1.x) * k, p2.y - (p3.y - p1.y) * k, p2.x, p2.y);
    }
    if (cerrada) g.closePath();
  }
  function poligono(g, pts) { g.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y); g.closePath(); }
  return { clamp, lerp, fase, suave, suave5, entrada, salida, rebote, tramo, campana, rot, suma, resta, esc, mezcla, dist, hash, ruido, curva, poligono };
})();

/* Escena base: negro absoluto en los extremos y llamada a pintar(g, t). */
const NEGRO_INICIO = 0.12, NEGRO_FINAL = 0.12;
class Escena2D {
  constructor(dur) { this.t = 0; this.dur = dur; this.vista = { k: 1, x: 0, y: 0 }; }   // vista: escala de salida (pantallas HiDPI, zoom de revisión)
  get terminada() { return this.t >= this.dur; }
  actualizar(dt) { if (!Number.isFinite(dt) || dt < 0) throw Error("dt inválido"); this.t = Math.min(this.dur, this.t + dt); }
  dibujar(g) {
    g.save();
    const v = this.vista; g.setTransform(v.k, 0, 0, v.k, v.x, v.y);
    g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
    if (this.t > NEGRO_INICIO && this.t < this.dur - NEGRO_FINAL) this.pintar(g, this.t);
    g.restore();
  }
  pintar() { throw Error("Escena sin pintar"); }
}
