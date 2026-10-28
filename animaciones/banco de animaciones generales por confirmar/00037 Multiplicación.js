"use strict";
/*
 * 00037 · MULTIPLICACIÓN
 *
 * Animación del banco. Empieza y acaba en negro.
 * Con su jarra, guiña un ojo, tiembla y ¡POP!: se divide en 2 clones, luego en 4, 8 y 16, cada vez más pequeños
 * (×2, ×4, ×8, ×16), hasta llenar la pantalla en dos filas. Cada clon es distinto (normal, con gafas, pelo dorado).
 * ¡MÁS GUILLERMOS! y brindan todos a la vez (¡CHIN!). Al final desaparecen uno a uno en nubecitas.
 * Con 8 o más clones se pintan desde sprites ya hechos (para no pasar de 8 avatares por cuadro).
 */
(() => {
const T_DIV = [1.15, 2.4, 3.4, 4.35], D_DIV = 0.42;
const T_BRINDIS = 5.55, T_CHIN = 5.92, T_PUF = 7.9;
const COLS = (n, x0, paso) => Array.from({ length: n }, (_, i) => x0 + i * paso);
const ETAPAS = [
  [[512, PIES, 1.55]],
  COLS(2, 246, 512).map((x) => [x, PIES, 1.25]),
  COLS(4, 118, 256).map((x) => [x, PIES, 1.0]),
  COLS(8, 54, 128).map((x) => [x, PIES, 0.78]),
  // 16: hijo par = fila de atrás, hijo impar = fila de delante (el padre está en la misma columna)
  COLS(8, 54, 128).flatMap((x) => [[x, 392, 0.6], [x, PIES, 0.72]]),
];
const VAR = (() => { // variante de cada clon: 0 normal · 1 gafas · 2 pelo dorado
  const v = [[0]];
  for (let n = 1; n < ETAPAS.length; n++) { v.push([]); for (let j = 0; j < ETAPAS[n].length; j++) v[n].push(j % 2 ? (v[n - 1][j >> 1] + 1 + n) % 3 : v[n - 1][j >> 1]); }
  return v;
})();
const SP = 0.78, SW = 170, SH = 220, SFX = 70, SFY = 208, NF = 8; // sprites
const cache = cacheTexto();

function poseClon(v, kB, cara) {
  const k = eInOut(kB);
  const pose = { cara: cara || ["risa", "sonrisa", "guino"][v], rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
  pose.manoD = mezcla([64, 128], [80, 50], k);
  pose.manoI = mezcla([9, 160], [-8, 120], k);
  pose.jarra = { inc: -0.3 * k, nivel: 1 };
  if (v === 1) pose.gafas = true;
  if (v === 2) { pose.oro = 1; pose.puntas = 0.35; }
  return pose;
}
function titulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(1000, 170), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 30, 0, 130);
  gr.addColorStop(0, "#f2fff4"); gr.addColorStop(0.5, "#8dffab"); gr.addColorStop(1, "#2bff5b");
  txt(g, "¡MÁS GUILLERMOS!", 500, 120, { tam: 106, peso: 900, fam: FD, color: gr, borde: "#062b10", bordeAncho: 11, esp: 4, glow: "rgba(43,255,91,.7)", glowTam: 24, max: 960 });
  cache.set("t", c);
  return c;
}

class EscenaMulti extends Escena {
  constructor() {
    super(9.8);
    this.p = new Parts(420);
    this.spr = []; // spr[v][f]
  }
  prepararSprites(max) {
    if (!listo("torso") || !listo("cara_risa") || !listo("oro_guino")) return;
    let n = 0;
    for (let v = 0; v < 3; v++) {
      this.spr[v] = this.spr[v] || [];
      for (let f = 0; f < NF; f++) {
        if (this.spr[v][f]) continue;
        if (n++ >= max) return;
        const c = lienzoNuevo(SW, SH), g = c.getContext("2d");
        pintarAvatar(g, matAv(SFX, SFY, SP), poseClon(v, f / (NF - 1)), 0);
        this.spr[v][f] = c;
      }
    }
  }
  /** Clones visibles: { x, y, s, v, pop (0–1 mientras se divide) } */
  clones(t) {
    let n = 0;
    while (n < T_DIV.length && t >= T_DIV[n]) n++;
    const div = n > 0 && t < T_DIV[n - 1] + D_DIV ? tramo(t, T_DIV[n - 1], T_DIV[n - 1] + D_DIV) : -1;
    return ETAPAS[n].map(([x, y, s], j) => {
      let c = { x, y, s, v: VAR[n][j], pop: -1, j };
      if (div >= 0) {
        const [px, py, ps] = ETAPAS[n - 1][j >> 1], k = eBack(div);
        c = { x: lerp(px, x, k), y: lerp(py, y, eOut(div)) - (y === py ? 50 * Math.sin(Math.PI * div) : 0), s: lerp(ps, s, eOut(div)), v: c.v, pop: div, j };
      } else if (n < T_DIV.length && t > T_DIV[n] - 0.3) {
        c.tiembla = tramo(t, T_DIV[n] - 0.3, T_DIV[n]);
      }
      return c;
    });
  }
  kBrindis(t) { return tramo(t, T_BRINDIS, T_CHIN - 0.05); }
  tPuf(j) { const fila = j % 2, col = j >> 1; return T_PUF + (fila ? 0.65 : 0) + col * 0.075; }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    if (t > 0.2) this.prepararSprites(3);
    T_DIV.forEach((td, i) => this.una("div" + i, t >= td, () => {
      temblar(6 + i * 3, 0.25);
      for (const [x, y, s] of ETAPAS[i]) {
        const cy = y - 120 * s;
        p.nueva(P.DESTELLO, x, cy, 0, 0, 0.3, 160 * s);
        for (let k = 0; k < 8; k++) { const a = azar(0, 6.283), v = azar(100, 260); p.nueva(P.CHISPA, x, cy, Math.cos(a) * v, Math.sin(a) * v, azar(0.25, 0.5), azar(6, 10)); }
      }
    }));
    this.una("chin", t >= T_CHIN, () => {
      temblar(14, 0.35);
      for (const c of this.clones(t)) {
        const q = aPant(matAv(c.x, c.y, c.s), [100, 30]);
        for (let k = 0; k < 6; k++) p.nueva(P.ESPUMA, q[0], q[1], azar(-120, 120), azar(-260, -80), azar(0.4, 0.8), azar(3, 7) * c.s / 0.7);
      }
    });
    this.una("titulo", t > 4.95, () => temblar(10, 0.3));
    if (t > T_PUF - 0.1) for (const c of this.clones(t)) this.una("puf" + c.j, t >= this.tPuf(c.j), () => {
      const cy = c.y - 110 * c.s;
      for (let k = 0; k < 7; k++) p.nueva(P.VAPOR, c.x + azar(-20, 20) * c.s, cy + azar(-60, 60) * c.s, azar(-80, 80), azar(-80, 30), azar(0.4, 0.8), azar(30, 50) * c.s);
      p.nueva(P.DESTELLO, c.x, cy, 0, 0, 0.25, 100 * c.s);
      temblar(3, 0.08);
    });
    p.actualizar(dt);
  }
  dibujarClon(g, c, t) {
    const kB = this.kBrindis(t);
    // bailan juntos después del brindis
    const baile = t > T_CHIN ? Math.sin((t - T_CHIN) * 6.5) : 0;
    let sx = 1, sy = 1, giro = 0.05 * baile, dy = -Math.abs(baile) * 8 * c.s;
    if (c.tiembla) { sx = 1 + 0.05 * Math.sin(t * 60) * c.tiembla; sy = 1 - 0.04 * c.tiembla; }
    if (c.pop >= 0) { sx = 1 + 0.25 * (1 - c.pop) * Math.sin(c.pop * 20); }
    // sombra
    g.fillStyle = "rgba(43,255,91,.08)"; g.beginPath(); g.ellipse(c.x, c.y, 50 * c.s, 7 * c.s, 0, 0, 6.283); g.fill();
    const conSprite = t >= T_DIV[2] && this.spr[c.v] && this.spr[c.v][NF - 1];
    if (conSprite) {
      const S = this.spr[c.v][Math.round(kB * (NF - 1))], e = c.s / SP;
      g.save(); g.translate(c.x, c.y + dy); g.rotate(giro); g.scale(e * sx, e * sy); g.drawImage(S, -SFX, -SFY); g.restore();
    } else {
      let cara = null;
      if (c.pop >= 0 || c.tiembla > 0.5) cara = "sorpresa";
      else if (t > 0.45 && t < 1.0) cara = "guino";
      else if (t < T_DIV[0]) cara = "sonrisa";
      pintarAvatar(g, matAv(c.x, c.y + dy, c.s, giro, sx, sy), poseClon(c.v, kB, cara), t);
    }
  }
  dibujar(g) {
    const t = this.t;
    fondo(g, "#000");
    // foco general que se abre con los clones
    const ancho = [200, 420, 600, 760, 900][Math.min(4, T_DIV.filter((x) => t >= x).length)];
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.16 * (1 - tramo(t, 9.0, 9.6));
    g.drawImage(BLOB2.oroClaro, W / 2 - ancho, PIES - 60, ancho * 2, 110); g.restore();
    const cs = this.clones(t).filter((c) => t < this.tPuf(c.j)).sort((a, b) => a.y - b.y || a.x - b.x);
    for (const c of cs) this.dibujarClon(g, c, t);
    this.p.dibujar(g);
    // ×2, ×4, ×8, ×16
    T_DIV.forEach((td, i) => {
      const s = t - td; if (s < 0 || s > 0.85 || (i === 3 && s > 0.6)) return;
      const k = tramo(s, 0, 0.12);
      g.save(); g.translate(W / 2, 110); g.scale(eBack(k), eBack(k));
      txt(g, "×" + (2 << i), 0, 0, { tam: 120, peso: 900, fam: FD, color: "#ffd34d", borde: "#3a2400", bordeAncho: 10, alfa: 1 - tramo(s, i === 3 ? 0.45 : 0.6, i === 3 ? 0.6 : 0.85), esp: 4 });
      g.restore();
    });
    // ¡MÁS GUILLERMOS!
    if (t > 4.95) {
      const k = tramo(t, 4.95, 5.1), s = lerp(2.4, 1, eIn(k)), a = Math.min(1, k * 4) * (1 - tramo(t, 9.0, 9.5));
      const T = titulo();
      g.save(); g.globalAlpha = a; g.translate(W / 2, 100); g.rotate(-0.025 + 0.015 * Math.sin(t * 3)); g.scale(s, s); g.drawImage(T, -T.width / 2, -T.height / 2); g.restore();
    }
    // ¡CHIN!
    if (t > T_CHIN && t < T_CHIN + 0.8) {
      const s = t - T_CHIN, k = tramo(s, 0, 0.1);
      for (const [x, y, r] of [[170, 215, -0.2], [860, 225, 0.18]]) {
        g.save(); g.translate(x, y); g.rotate(r); g.scale(eBack(k), eBack(k));
        txt(g, "¡CHIN!", 0, 0, { tam: 58, peso: 400, fam: FC, color: "#ffffff", borde: "#0a6b2a", bordeAncho: 8, alfa: 1 - tramo(s, 0.55, 0.8), esp: 2 });
        g.restore();
      }
    }
    const a = Math.max(1 - tramo(t, 0, 0.4), tramo(t, this.dur - 0.4, this.dur - 0.02));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00037", nombre: "Multiplicación", crear: () => new EscenaMulti() });
})();
