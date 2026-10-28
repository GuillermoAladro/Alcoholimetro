"use strict";
/*
 * 00146 · MARCADOR DEL BAR
 *
 * Animación del banco. Empieza y acaba en negro.
 * Sobre la barra se enciende un marcador «GUILLERMO / RODRIGO» que suma un punto con cada caña. Guillermo se
 * adelanta (1-0), Rodrigo empata y se adelanta del tirón (1-2) y Guillermo vuelve a empatar (2-2). El marcador
 * parpadea EMPATE, se miran, se acercan y brindan con las jarras vacías: ¡EMPATE A CAÑAS!
 */
(() => {
const ESC = 1.6, AY = 610, BARRA = 455;
const XG0 = 300, XR0 = 724, XG1 = 404, XR1 = 620;
const MARC = { x: 512, y: 112, w: 620, h: 156 };
const T_EMPATE = 5.95, T_ACERCA = 6.45, T_CHIN = 7.1, T_APAGA = 9.85;
// las jarras de cada uno (unidades de avatar de su dueño, el asa en la mano)
const JARRAS = [{ q: 0, u: [86, 117] }, { q: 0, u: [48, 117] }, { q: 1, u: [-8, 117] }, { q: 1, u: [30, 117] }];
// tragos: [jarra, quién, empieza, acaba (punto)]
const TRAGOS = [[0, 0, 0.6, 1.95], [2, 1, 2.05, 3.35], [3, 1, 3.4, 4.55], [1, 0, 4.65, 5.8]];
const CT = cacheTexto();
const aP = (X, u) => [X + (u[0] - 39) * ESC, AY - (232 - u[1]) * ESC];

class Marcador extends Escena {
  constructor() {
    super(10.4);
    this.p = new Parts(360);
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, 10.35)); }
  x(t, q) { const k = eInOut(tramo(t, T_ACERCA, T_ACERCA + 0.45)); return q ? lerp(XR0, XR1, k) : lerp(XG0, XG1, k); }
  puntos(t) { const n = [0, 0]; for (const [, q, , t1] of TRAGOS) if (t >= t1) n[q]++; return n; }
  /** Cuánto queda en cada jarra. */
  nivel(i, t) { for (const [j, , t0, t1] of TRAGOS) if (j === i) return 1 - eInOut(tramo(t, t0 + 0.42, t1 - 0.3)); return 1; }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoI: [10, 136] };
    const R = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true, manoD: [66, 136] };
    const A = [G, R];
    const mano = [[72, 132], [8, 132]];     // la mano de dentro (G: derecha; R: izquierda)
    const jarra = [null, null];              // { inc, nivel } en la mano
    const enMano = [-1, -1];
    for (const [j, q, t0, t1] of TRAGOS) {
      if (t < t0 || t > t1 + 0.05) continue;
      const P0 = JARRAS[j].u, s = q ? -1 : 1, quien = q ? "rodrigo" : "";
      const kC = eInOut(tramo(t, t0, t0 + 0.2)), kS = eInOut(tramo(t, t0 + 0.2, t0 + 0.42)), kT = tramo(t, t0 + 0.42, t1 - 0.3), kB = eInOut(tramo(t, t1 - 0.3, t1));
      const rc = s * (-0.32 * eInOut(Math.min(1, kT * 3)) * (1 - kB)) + (kT > 0 && kT < 1 ? 0.02 * Math.sin(t * 40) : 0);
      const inc = (-0.4 * kS - 1.2 * eInOut(kT)) * (1 - kB);
      const b = boca(rc, quien), r = rot2(JARRA.borde, inc);
      const aBoca = q ? [b[0] + r[0], b[1] - r[1]] : [b[0] - r[0], b[1] - r[1]];
      let m = mezcla(mano[q], P0, kC);
      if (kS > 0) { m = mezcla(P0, aBoca, kS); m[0] += s * Math.sin(kS * Math.PI) * 12; }
      if (kB > 0) m = mezcla(aBoca, P0, kB);
      mano[q] = m; A[q].rc = rc;
      if (t > t0 + 0.2) { jarra[q] = { inc, nivel: this.nivel(j, t) }; enMano[q] = j; }
      if (kT > 0.05 && kT < 1) A[q].cara = "dormido";
      // el otro mira con cara de sorpresa
      A[1 - q].cara = kT > 0.4 ? "sorpresa" : A[1 - q].cara; A[1 - q].rc = (q ? 0.1 : -0.1);
    }
    // ¡punto!: el que bebe lo celebra con el puño (la mano de fuera), guiño
    for (const [, q, , t1] of TRAGOS) {
      const d = t - t1;
      if (d < 0 || d > 0.7) continue;
      const k = eOut(tramo(d, 0, 0.12)) * (1 - eInOut(tramo(d, 0.5, 0.7)));
      if (q === 0) { G.manoI = mezcla([10, 136], [-14, 30 + Math.sin(t * 20) * 4], k); G.cara = "guino"; R.cara = "sorpresa"; }
      else { R.manoD = mezcla([66, 136], [92, 30 + Math.sin(t * 20) * 4], k); R.cara = "guino"; G.cara = "sorpresa"; }
    }
    // EMPATE: se miran, se acercan y brindan con las vacías
    if (t >= T_EMPATE) {
      const kM = eInOut(tramo(t, T_EMPATE, T_EMPATE + 0.2));
      G.rc = 0.15 * kM; R.rc = -0.15 * kM;
      G.cara = t < T_EMPATE + 0.5 ? "sorpresa" : "risa"; R.cara = G.cara;
      const kJ = eInOut(tramo(t, T_EMPATE + 0.35, T_EMPATE + 0.55)), kA = eInOut(tramo(t, T_ACERCA + 0.1, T_CHIN));
      // cogen su jarra vacía
      mano[0] = mezcla(mezcla([72, 132], JARRAS[1].u, kJ), [104, 40], kA);
      mano[1] = mezcla(mezcla([8, 132], JARRAS[3].u, kJ), [-26, 40], kA);
      if (t > T_EMPATE + 0.55) {
        const reb = t > T_CHIN ? Math.exp(-(t - T_CHIN) * 7) * Math.sin((t - T_CHIN) * 30) * 3 : 0;
        mano[0][0] -= reb; mano[1][0] += reb;
        jarra[0] = { inc: -0.25 * kA, nivel: 0 }; jarra[1] = { inc: -0.25 * kA, nivel: 0 };
        enMano[0] = 1; enMano[1] = 3;
      }
      if (t > T_CHIN) {
        G.manoI = mezcla([10, 136], [-14, 34 + Math.sin(t * 8) * 4], eOut(tramo(t, T_CHIN + 0.2, T_CHIN + 0.45)));
        R.manoD = mezcla([66, 136], [92, 34 + Math.sin(t * 8 + 1) * 4], eOut(tramo(t, T_CHIN + 0.2, T_CHIN + 0.45)));
        G.cara = t > 8.6 ? "guino" : "risa"; R.cara = "risa";
        G.rc = 0.08 * Math.sin(t * 4); R.rc = -0.08 * Math.sin(t * 4 + 0.6);
      }
    }
    G.manoD = mano[0]; R.manoI = mano[1];
    if (jarra[0]) G.jarra = jarra[0];
    if (jarra[1]) {
      const { inc, nivel } = jarra[1];
      R.objI = (g, m, a, tt) => { g.save(); g.translate(m[0], m[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], inc, nivel, "asa", tt); g.restore(); };
      R.objI2 = (g, m, a, tt) => { g.save(); g.translate(m[0], m[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], inc, nivel, "cuerpo", tt); g.restore(); };
    }
    const anda = t > T_ACERCA && t < T_ACERCA + 0.45 ? -Math.abs(Math.sin((t - T_ACERCA) * 14)) * 8 : 0;
    const bote = t > T_CHIN + 0.3 ? -Math.abs(Math.sin((t - T_CHIN) * 8)) * 12 * (1 - tramo(t, 9.2, 9.5)) : 0;
    return { e: [{ pose: G, m: matAv(this.x(t, 0), AY + anda + bote, ESC) }, { pose: R, m: matAv(this.x(t, 1), AY + anda + bote, ESC) }], enMano };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("marcador", t > 0.45, () => temblar(4, 0.15));
    TRAGOS.forEach(([j, q, , t1], i) => this.una("p" + i, t > t1, () => {
      temblar(9, 0.2);
      const x = MARC.x + (q ? 150 : -150), y = MARC.y + 22;
      p.nueva(P.DESTELLO, x, y, 0, 0, 0.35, 160);
      for (let k = 0; k < 16; k++) { const a = azar(0, 6.283), v = azar(150, 380); p.nueva(P.CHISPA, x, y, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 11)); }
      const J = aP(q ? XR0 : XG0, JARRAS[j].u);
      for (let k = 0; k < 5; k++) p.nueva(P.ESPUMA, J[0] + (q ? -1 : 1) * 25, BARRA - 50, azar(-60, 60), azar(-160, -60), azar(0.3, 0.6), azar(3, 6));
    }));
    this.una("empate", t > T_EMPATE, () => {
      temblar(16, 0.4);
      for (let k = 0; k < 30; k++) { const a = azar(0, 6.283), v = azar(200, 500); p.nueva(P.CHISPA, MARC.x, MARC.y + 20, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(7, 12)); }
    });
    this.una("chin", t > T_CHIN, () => {
      temblar(14, 0.35);
      const q = aP(XG1, [104, 40]);
      const c = [(q[0] + aP(XR1, [-26, 40])[0]) / 2, q[1] - 26];
      p.nueva(P.DESTELLO, c[0], c[1], 0, 0, 0.4, 200);
      for (let k = 0; k < 24; k++) { const a = azar(-Math.PI, 0), v = azar(200, 520); p.nueva(P.CHISPA, c[0], c[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(7, 12)); }
      for (let k = 0; k < 80; k++) p.nueva(P.CONFETI, azar(40, W - 40), azar(-60, -10), azar(-40, 40), azar(0, 120), azar(2.5, 4), azar(9, 15), k % 5);
    });
    p.suelo = () => BARRA - 2;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  /** Marcador: el panel (con la rejilla de leds) y los textos con brillo se pintan una vez y se copian. */
  sprite(clave, w, h, pintar) {
    if (CT.has(clave)) return CT.get(clave);
    const c = lienzoNuevo(w, h), g = c.getContext("2d");
    pintar(g, w, h);
    CT.set(clave, c);
    return c;
  }
  marcador(g, t, a) {
    const { x, y, w, h } = MARC, n = this.puntos(t);
    const on = t < 0.45 ? 0 : t < 0.75 ? [1, 0.2, 1, 0.4, 1, 1][Math.min(5, Math.floor((t - 0.45) / 0.05))] : 1;
    const panel = this.sprite("panel", w + 24, h + 24, (c) => {
      const gm = c.createLinearGradient(0, 0, 0, h + 24);
      gm.addColorStop(0, "#2a2d34"); gm.addColorStop(1, "#111216");
      c.fillStyle = gm; rectR(c, 0, 0, w + 24, h + 24, 14); c.fill();
      c.fillStyle = "#050506"; rectR(c, 12, 12, w, h, 8); c.fill();
      c.fillStyle = "rgba(255,255,255,.035)";
      for (let yy = 18; yy < h + 12; yy += 8) for (let xx = 18; xx < w + 12; xx += 8) c.fillRect(xx, yy, 3, 3);
    });
    const rotulos = this.sprite("rotulos", w, 70, (c) => {
      txt(c, "GUILLERMO", w / 2 - 150, 48, { tam: 30, peso: 900, fam: FD, color: "#ffd34d", esp: 4, glow: "rgba(255,190,40,.8)", glowTam: 10 });
      txt(c, "RODRIGO", w / 2 + 150, 48, { tam: 30, peso: 900, fam: FD, color: "#ffd34d", esp: 4, glow: "rgba(255,190,40,.8)", glowTam: 10 });
      txt(c, "CAÑAS", w / 2, 44, { tam: 18, peso: 800, color: "#2bff5b", esp: 4 });
    });
    const led = (s0, tam, col, glow, esp = 0) => this.sprite(`${s0}|${col}`, 220, 150, (c) => txt(c, s0, 110, 110, { tam, peso: 900, fam: FD, color: col, glow, glowTam: 18, esp }));
    g.save(); g.globalAlpha = a;
    g.fillStyle = "#15161a"; g.fillRect(x - 8, 0, 16, y - h / 2);
    g.drawImage(panel, x - w / 2 - 12, y - h / 2 - 12);
    g.globalAlpha = a * on;
    g.drawImage(rotulos, x - w / 2, y - 40 - 48);
    for (const q of [0, 1]) {
      // el número da la vuelta al cambiar
      let flip = 1;
      for (const [, qq, , t1] of TRAGOS) if (qq === q && t > t1 - 0.12 && t < t1 + 0.12) flip = Math.abs((t - t1) / 0.12);
      const lider = n[q] > n[1 - q];
      const spr = led(String(n[q]), 104, lider ? "#2bff5b" : "#ff4a3a", lider ? "rgba(43,255,91,.9)" : "rgba(255,74,58,.9)");
      g.save(); g.translate(x + (q ? 150 : -150), y + 46); g.scale(1, Math.max(0.05, flip));
      g.drawImage(spr, -110, -110);
      g.restore();
    }
    if (t < T_EMPATE || Math.sin(t * 12) < 0) g.drawImage(led("–", 80, "#ff4a3a", "rgba(255,74,58,.9)"), x - 110, y + 34 - 110);
    else g.drawImage(led("EMPATE", 40, "#2fe3e8", "rgba(47,227,232,.9)", 3), x - 110, y + 26 - 110);
    g.restore();
  }
  barra(g) {
    const gr = this.grB || (this.grB = (() => { const q = g.createLinearGradient(0, BARRA, 0, H); q.addColorStop(0, "#5a3218"); q.addColorStop(1, "#24130a"); return q; })());
    g.fillStyle = gr; g.fillRect(-60, BARRA + 10, W + 120, H - BARRA + 60);
    g.fillStyle = "rgba(0,0,0,.35)";
    for (let x = 30; x < W; x += 96) g.fillRect(x, BARRA + 18, 3, H - BARRA);
    g.fillStyle = "#b8862d"; g.fillRect(-60, 556, W + 120, 9); g.fillStyle = "rgba(255,240,190,.6)"; g.fillRect(-60, 557, W + 120, 2);
    g.fillStyle = "#8a5426"; g.fillRect(-60, BARRA - 6, W + 120, 18);
    g.fillStyle = "rgba(255,220,170,.4)"; g.fillRect(-60, BARRA - 6, W + 120, 3);
    g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(-60, BARRA + 12, W + 120, 5);
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), { e, enMano } = this.poses();
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    foco(g, 512, 512, BARRA, 380, 0.8);
    g.restore();
    this.marcador(g, t, a);
    g.save(); g.globalAlpha = a;
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    this.barra(g);
    // las jarras que están en la barra
    JARRAS.forEach((J, i) => {
      if (enMano[J.q] === i) return;
      const P0 = aP(J.q ? XR0 : XG0, J.u);
      g.save(); g.translate(P0[0], P0[1]); g.scale(J.q ? -ESC : ESC, ESC);
      dibujarJarra(g, [0, 0], 0, this.nivel(i, t), "asa", t); dibujarJarra(g, [0, 0], 0, this.nivel(i, t), "cuerpo", t);
      g.restore();
    });
    g.restore();
    this.p.dibujar(g);
    // +1 que sube del que bebe y GLU GLU mientras bebe
    for (const [, q, t0, t1] of TRAGOS) {
      const d = t - t1;
      if (d > 0 && d < 0.9) {
        const c = aPant(e[q].m, [39, 30]);
        txt(g, "+1", c[0] + (q ? 92 : -92), c[1] - 40 * d, { tam: 58, peso: 400, fam: FC, color: "#2bff5b", borde: "#04140a", bordeAncho: 7, alfa: a * (1 - tramo(d, 0.6, 0.9)) });
      }
      if (t > t0 + 0.5 && t < t1 - 0.35) {
        const c = aPant(e[q].m, [q ? -40 : 118, 40]);
        g.save(); g.translate(c[0], c[1] + Math.sin(t * 18) * 3); g.rotate(q ? -0.12 : 0.12);
        txt(g, "GLU GLU", 0, 0, { tam: 30, peso: 400, fam: FC, color: "#ffe9a8", borde: "#3a2400", bordeAncho: 6, esp: 2, alfa: a });
        g.restore();
      }
    }
    // ¡CHIN!
    const dC = t - T_CHIN;
    if (dC > 0 && dC < 0.8) {
      const k = eBack(tramo(dC, 0, 0.12));
      g.save(); g.translate(512, 228); g.rotate(-0.06); g.scale(k, k);
      txt(g, "¡CHIN!", 0, 0, { tam: 60, peso: 400, fam: FC, color: "#fffdf5", borde: "#1b1b1b", bordeAncho: 8, esp: 2, alfa: a * (1 - tramo(dC, 0.6, 0.8)) });
      g.restore();
    }
    // ¡EMPATE A CAÑAS!
    if (t > T_EMPATE + 0.1) {
      const d = t - T_EMPATE - 0.1, k = tramo(d, 0, 0.18), s = lerp(2.4, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a;
      const gb = g.createLinearGradient(0, 470, 0, 600);
      gb.addColorStop(0, "rgba(0,0,0,0)"); gb.addColorStop(0.35, "rgba(0,0,0,.72)"); gb.addColorStop(1, "rgba(0,0,0,.86)");
      g.fillStyle = gb; g.fillRect(-60, 466, W + 120, 200);
      g.translate(512, 536); g.rotate(-0.02); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has(1)) return CT.get(1);
    const c = lienzoNuevo(1000, 180), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 45, 0, 135);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡EMPATE A CAÑAS!", 500, 128, { tam: 110, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 11, esp: 4, glow: "rgba(255,190,40,.85)", glowTam: 24, max: 930 });
    CT.set(1, c);
    return c;
  }
}

registrar({ id: "00146", nombre: "Marcador del bar", crear: () => new Marcador() });
})();
