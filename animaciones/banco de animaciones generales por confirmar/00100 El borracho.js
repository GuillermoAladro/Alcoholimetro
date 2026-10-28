"use strict";
/*
 * 00100 · EL BORRACHO
 *
 * Animación del banco. Empieza y acaba en negro.
 * El avatar entra por la izquierda dando tumbos con una jarra, se la bebe de un trago (GLUG), le da hipo (¡HIC!),
 * tropieza y se va por la derecha.
 */
(() => {
class EscenaBorracho {
  constructor() {
    this.t = 0; this.dur = 9.5;
    this.x = -150; this.fase = 0;
    this.p = new Particulas(220);
    this.hics = []; // bocadillos "¡HIC!"/"GLUG"
    this.hecho = new Set();
  }
  get terminada() { return this.x > W + 170 || this.t >= this.dur; }
  /** Fases: entra dando tumbos · para y se bebe la jarra de un trago · hipo · se va tambaleándose. */
  actualizar(dt) {
    const t = (this.t += dt);
    let v, andando = true;
    if (t < 2.3) v = 330 * (0.7 + 0.55 * Math.sin(t * 3.4));
    else if (t < 5.0) { v = 0; andando = false; }
    else v = 330 * (0.65 + 0.6 * Math.sin((t - 5) * 2.7));
    if (t > 6.3 && t < 6.75) v = -150; // tropieza y recula
    this.x += v * dt;
    this.fase += dt * (andando ? 6.5 + v / 70 : 2.2);
    // bocadillos
    const una = (clave, cond, f) => { if (cond && !this.hecho.has(clave)) { this.hecho.add(clave); f(); } };
    for (let i = 0; i < 4; i++) una("glug" + i, t > 3.0 + i * 0.32, () => this.hics.push({ s: "GLUG", t0: t, dx: [100, 200, 115, 215][i], dy: [-390, -445, -505, -340][i], tam: 38 }));
    una("hic1", t > 4.55, () => { this.hics.push({ s: "¡HIC!", t0: t, dx: -130, dy: -380, tam: 66 }); temblar(4, 0.2); });
    una("hic2", t > 6.4, () => this.hics.push({ s: "¡HIC!", t0: t, dx: 120, dy: -390, tam: 56 }));
    this.p.actualizar(dt);
  }
  pose() {
    const t = this.t;
    const kSube = tramo(t, 2.35, 2.8), kBaja = tramo(t, 4.05, 4.45);
    const kTrago = tramo(t, 2.8, 4.05);
    const bebiendo = kSube > 0 && kBaja < 1;
    const kBrazo = bebiendo ? eInOut(kSube) * (1 - eInOut(kBaja)) : 0;
    const salida = t > 5 ? 1 : 0;
    // balanceo de borracho: varias ondas que no cuadran entre sí
    const balanceo = (0.09 + salida * 0.06) * Math.sin(t * 2.3) + 0.05 * Math.sin(t * 5.3 + 1) + 0.03 * Math.sin(t * 8.1);
    const inclTrago = -0.13 * eInOut(kSube) * (1 - eInOut(kBaja));
    const tropiezo = t > 6.3 && t < 6.9 ? -0.22 * Math.sin(((t - 6.3) / 0.6) * Math.PI) : 0;
    const salto = t > 4.55 && t < 4.95 ? -Math.sin(((t - 4.55) / 0.4) * Math.PI) * 24 : 0;
    const paso = Math.sin(this.fase);
    const anda = t < 2.3 || t > 5;
    const bote = anda ? -Math.abs(paso) * 8 : -Math.abs(Math.sin(t * 3)) * 2;
    // cabeza: bambolea con retraso y se echa atrás al beber
    const rc = 0.13 * Math.sin(t * 3.1 + 0.6) + 0.06 * Math.sin(t * 7.7) - 0.32 * eInOut(kTrago) * (1 - eInOut(kBaja)) + (kTrago > 0 && kTrago < 1 ? 0.03 * Math.sin(t * 38) : 0);
    // brazo de la jarra: de colgar a llevársela a la boca
    const inc = -0.4 * eInOut(kSube) - 1.25 * eInOut(kTrago);
    const incFinal = bebiendo ? inc * (1 - eInOut(kBaja)) : 0.18 * Math.sin(t * 4.2);
    const bocaP = boca(rc);
    const r = rot2(JARRA.borde, incFinal);
    const objetivo = [bocaP[0] - r[0], bocaP[1] - r[1]];
    const reposo = [RIG.manoD[0] + 3 * Math.sin(this.fase), RIG.manoD[1] - 2];
    const mano = [lerp(reposo[0], objetivo[0], kBrazo) + Math.sin(kBrazo * Math.PI) * 26, lerp(reposo[1], objetivo[1], kBrazo)];
    const nivel = t < 2.8 ? 1 : 1 - eIn(kTrago) * 0.15 - kTrago * 0.85;
    // cara: borracho; satisfecho (ojos cerrados) justo después de vaciarla
    const cara = t > 4.1 && t < 4.55 ? "dormido" : t > 6.3 && t < 6.8 ? "sorpresa" : "borracho";
    return {
      cara, rc,
      brazoI: anda ? 0.22 * paso + 0.08 : 0.55 + 0.12 * Math.sin(t * 6), // al beber, el brazo libre hace equilibrio
      piernaI: anda ? [-Math.max(0, paso) * 10, 0.1 * paso] : [-Math.max(0, Math.sin(t * 2.2)) * 3, 0.05 * Math.sin(t * 2.2)],
      piernaD: anda ? [-Math.max(0, -paso) * 10, 0.1 * paso] : [-Math.max(0, -Math.sin(t * 2.2)) * 3, 0.05 * Math.sin(t * 2.2)],
      mano, jarra: { inc: incFinal, nivel: clamp(nivel, 0, 1) },
      giro: balanceo + inclTrago + tropiezo,
      dy: bote + salto + Math.sin(t * 1.4) * 6,
      bebiendo: kTrago > 0 && kTrago < 1,
      bocaP,
    };
  }
  dibujar(g) {
    fondo(g, "#000");
    const pose = this.pose();
    const esc = 1.62, pies = 560;
    g.save();
    g.translate(this.x, pies + pose.dy);
    g.rotate(pose.giro);
    g.scale(esc, esc);
    g.translate(-39, -232);
    g.imageSmoothingQuality = "high";
    dibujarAvatar(g, pose, this.t);
    g.restore();
    // gotas que se escapan por la comisura al beber
    if (pose.bebiendo && Math.random() < 0.35) {
      const m = new DOMMatrix().translate(this.x, pies + pose.dy).rotate((pose.giro * 180) / Math.PI).scale(esc).translate(-39, -232);
      const q = m.transformPoint(new DOMPoint(pose.bocaP[0] - 4, pose.bocaP[1] + 4));
      this.p.nueva(q.x, q.y, azar(-60, 30), azar(-40, 40), 0.9, azar(2.5, 4.5), 3);
    }
    if (pose.bebiendo && Math.random() < 0.1) this.p.nueva(this.x + azar(30, 80), pies - 300, azar(-10, 10), azar(-70, -40), 1.4, azar(4, 9), 4);
    this.p.dibujar(g);
    // bocadillos
    for (const h of this.hics) {
      const k = (this.t - h.t0) / 0.9;
      if (k < 0 || k > 1) continue;
      const s = eBack(k * 3.5) * (h.s === "GLUG" ? 1 : 1.1);
      g.save();
      g.translate(this.x + h.dx, pies + h.dy - k * 40);
      g.rotate(h.s === "GLUG" ? 0.15 : -0.12);
      g.scale(s, s);
      txt(g, h.s, 0, 0, { tam: h.tam, peso: 900, fam: FD, color: h.s === "GLUG" ? "#ffc21f" : "#ffffff", borde: "#000", bordeAncho: 8, alfa: Math.min(1, (1 - k) * 4) });
      g.restore();
    }
  }
}

registrar({ id: "00100", nombre: "El borracho", crear: () => new EscenaBorracho() });
})();
