"use strict";
/*
 * 00077 · MARCHANDO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Le llueven tapas desde fuera de plano: aceitunas, tortilla, jamón, croquetas y, para rematar, una caña. Las va
 * cazando en platitos que se le apilan en la cabeza, haciendo equilibrios con la torre que se balancea. Grita
 * ¡MARCHANDO! como un camarero y se va por la derecha con la torre a cuestas.
 */
(() => {
const cacheT = cacheTexto();
const PASO = 32; // alto de cada platito con su tapa
const EP = 1.3;  // escala de los platitos

/** Platito con su tapa; (x, y) = el apoyo del plato. */
function platito(g, x, y, tipo, t) {
  g.save(); g.translate(x, y);
  // tapa (por detrás del borde delantero del plato)
  if (tipo === 0) { // aceitunas
    for (const [ax, ay] of [[-16, -9], [-5, -11], [6, -10], [16, -9], [-10, -15], [1, -16], [11, -15]]) {
      const gr = g.createRadialGradient(ax - 2, ay - 2, 1, ax, ay, 7);
      gr.addColorStop(0, "#d6ee7a"); gr.addColorStop(1, "#4d6c10");
      g.fillStyle = gr; g.beginPath(); g.ellipse(ax, ay, 6.5, 5.5, 0, 0, 6.283); g.fill();
      g.fillStyle = "#d8261a"; g.beginPath(); g.arc(ax + 5, ay, 1.8, 0, 6.283); g.fill();
    }
  } else if (tipo === 1) { // tortilla
    g.fillStyle = "#e9b23c"; g.beginPath(); g.moveTo(-26, -8); g.lineTo(24, -8); g.lineTo(28, -20); g.lineTo(-18, -24); g.closePath(); g.fill();
    g.fillStyle = "#fff0a8"; g.beginPath(); g.moveTo(-26, -8); g.lineTo(24, -8); g.lineTo(24, -16); g.lineTo(-24, -16); g.closePath(); g.fill();
    g.fillStyle = "#f2d36a"; for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(-20 + i * 7, -12, 2.6, 1.6, 0, 0, 6.283); g.fill(); }
    g.fillStyle = "#c98a2a"; g.beginPath(); g.moveTo(-24, -16); g.lineTo(24, -16); g.lineTo(28, -20); g.lineTo(-18, -24); g.closePath(); g.fill();
    g.strokeStyle = "#e9cf98"; g.lineWidth = 2; g.beginPath(); g.moveTo(2, -20); g.lineTo(6, -38); g.stroke();
  } else if (tipo === 2) { // jamón
    for (const [jx, ja] of [[-14, -0.25], [0, 0.05], [14, 0.3]]) {
      g.save(); g.translate(jx, -14); g.rotate(ja);
      const gr = g.createLinearGradient(0, -8, 0, 8);
      gr.addColorStop(0, "#f2dcc4"); gr.addColorStop(0.3, "#c8283e"); gr.addColorStop(1, "#8e1428");
      g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 13, 8, 0, 0, 6.283); g.fill();
      g.strokeStyle = "rgba(255,240,230,.7)"; g.lineWidth = 1; g.beginPath(); g.moveTo(-8, 1); g.quadraticCurveTo(0, -3, 8, 2); g.stroke();
      g.restore();
    }
  } else if (tipo === 3) { // croquetas
    for (const [cx, cy] of [[-15, -12], [0, -14], [15, -12], [-7, -21], [8, -21]]) {
      const gr = g.createRadialGradient(cx - 3, cy - 3, 1, cx, cy, 10);
      gr.addColorStop(0, "#f0b45a"); gr.addColorStop(1, "#8c4a12");
      g.fillStyle = gr; rectR(g, cx - 9, cy - 5.5, 18, 11, 5.5); g.fill();
    }
  } else if (tipo === 4) { // caña
    g.fillStyle = "rgba(210,230,255,.25)"; g.beginPath(); g.moveTo(-13, -54); g.lineTo(13, -54); g.lineTo(10, -8); g.lineTo(-10, -8); g.closePath(); g.fill();
    const gr = g.createLinearGradient(0, -8, 0, -46);
    gr.addColorStop(0, "#c46a00"); gr.addColorStop(1, "#ffc21f");
    g.fillStyle = gr; g.beginPath(); g.moveTo(-12, -46); g.lineTo(12, -46); g.lineTo(10, -9); g.lineTo(-10, -9); g.closePath(); g.fill();
    g.fillStyle = "#fffaf0"; g.beginPath(); g.moveTo(-14, -45);
    for (let i = 0; i <= 4; i++) g.arc(-12 + i * 6, -50 - (i % 2) * 2, 4.5, Math.PI, 0);
    g.lineTo(14, -44); g.closePath(); g.fill();
    g.strokeStyle = "rgba(235,245,255,.85)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-13, -54); g.lineTo(-10, -8); g.lineTo(10, -8); g.lineTo(13, -54); g.stroke();
    g.fillStyle = "rgba(255,255,255,.45)"; g.fillRect(-8, -42, 2.5, 30);
  }
  // el plato
  g.fillStyle = "#b9b4aa"; g.beginPath(); g.ellipse(0, -1, 36, 7, 0, 0, Math.PI); g.fill();
  g.fillStyle = "#fffdf7"; g.beginPath(); g.ellipse(0, -4, 38, 7.5, 0, 0, Math.PI); g.fill();
  g.strokeStyle = "#1f62b8"; g.lineWidth = 1.6; g.beginPath(); g.ellipse(0, -4, 34, 6, 0, 0.15, Math.PI - 0.15); g.stroke();
  g.restore();
}
/** El plato visto un poco desde arriba (parte de atrás, va antes de la tapa). */
function platitoFondo(g, x, y) {
  g.fillStyle = "#e9e4da"; g.beginPath(); g.ellipse(x, y - 4, 38, 7.5, 0, Math.PI, 0); g.fill();
  g.fillStyle = "#f6f2ea"; g.beginPath(); g.ellipse(x, y - 4, 28, 4.5, 0, 0, 6.283); g.fill();
}

/** El título, pintado una vez (con su brillo) en un lienzo; se rehace si cambian las fuentes. */
function titulo() {
  if (cacheT.has(1)) return cacheT.get(1);
  const c = lienzoNuevo(620, 190), x = c.getContext("2d");
  const gr = x.createLinearGradient(0, 40, 0, 160);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#fff1b0"); gr.addColorStop(1, "#ffc21f");
  txt(x, "¡MARCHANDO!", 310, 140, { tam: 118, peso: 400, fam: FC, color: gr, borde: "#7a1d00", bordeAncho: 13, esp: 4, max: 580 });
  cacheT.set(1, c);
  return c;
}
class EscenaMarchando extends Escena {
  constructor() {
    super(9.9);
    titulo(); // se pinta ya, no en el momento del remate
    this.ESC = 1.42;
    this.p = new Parts(200);
    // cada tapa: tipo, de dónde sale, cuándo sale y cuándo aterriza
    this.tapas = [
      { tipo: 0, x0: -60, y0: 260, t0: 0.6, t1: 1.45 },
      { tipo: 1, x0: W + 60, y0: 220, t0: 1.65, t1: 2.45 },
      { tipo: 2, x0: 520, y0: -60, t0: 2.65, t1: 3.35 },
      { tipo: 3, x0: -60, y0: 180, t0: 3.55, t1: 4.3 },
      { tipo: 4, x0: W + 60, y0: 120, t0: 4.6, t1: 5.45 },
    ];
    this.pila = []; this.th = 0; this.vth = 0;
  }
  xEn(t) {
    let x = 512;
    x += -64 * eInOut(tramo(t, 0.75, 1.3)) + 132 * eInOut(tramo(t, 1.8, 2.3)) - 68 * eInOut(tramo(t, 2.75, 3.2)) - 86 * eInOut(tramo(t, 3.7, 4.2)) + 214 * eInOut(tramo(t, 4.85, 5.35));
    if (t > 7.4) x += (t - 7.4) * 330 * eInOut(tramo(t, 7.4, 7.7));
    return x;
  }
  estado(t = this.t) {
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [24, 150], sy = 1, bote = 0;
    pose.brazoIDelante = false;
    const v = (this.xEn(t + 0.02) - this.xEn(t - 0.02)) / 0.04;
    if (Math.abs(v) > 20) { const a = andar(t * 15, Math.min(1, Math.abs(v) / 250)); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; bote = a.bote; }
    // brazos de equilibrista cuando la torre se mueve
    const eq = clamp(Math.abs(this.th) * 18 + (t > 1.45 ? 0.35 : 0), 0, 1);
    manoD = mezcla(manoD, [104, 122 + 10 * Math.sin(t * 7)], eq);
    manoI = mezcla(manoI, [-26, 122 - 10 * Math.sin(t * 7)], eq);
    for (const T of this.tapas) {
      if (t > T.t1 - 0.45 && t < T.t1) pose.cara = "sorpresa";
      if (t >= T.t1 && t < T.t1 + 0.35) { pose.cara = "guino"; sy = 1 - 0.05 * Math.sin(Math.PI * tramo(t, T.t1, T.t1 + 0.25)); }
    }
    if (t > 5.45 && t < 6.1) pose.cara = "sorpresa";
    // ¡MARCHANDO!
    if (t >= 6.15 && t < 7.4) { pose.cara = "risa"; manoD = mezcla(manoD, [92, 30], eOut(tramo(t, 6.1, 6.3))); }
    if (t >= 7.4) pose.cara = "guino";
    pose.rc = -this.th * 0.6;
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(this.xEn(t), PIES + bote, this.ESC, 0, 1, sy);
    return { pose, m };
  }
  /** Apoyo de la torre: la coronilla. */
  coronilla(e) {
    const r = rot2([0, -74], e.pose.rc);
    return aPant(e.m, [RIG.cuello[0] + r[0], RIG.cuello[1] + r[1]]);
  }
  posPlato(e, i) {
    const c = this.coronilla(e), h = (i + 1) * PASO - 4;
    return [c[0] + this.th * h * (1 + i * 0.25) * 2.2, c[1] - i * PASO + 8];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // la torre: un muelle que se dobla con los acelerones
    const ax = (this.xEn(t + dt) - 2 * this.xEn(t) + this.xEn(t - dt)) / (dt * dt);
    const n = this.pila.length;
    this.vth += (-70 * this.th - 3.2 * this.vth - ax * 0.00004 * (1 + n * 0.3)) * dt;
    this.th += this.vth * dt;
    this.th = clamp(this.th, -0.12, 0.12);
    this.tapas.forEach((T, i) => this.una("aterriza" + i, t >= T.t1, () => {
      this.pila.push(T.tipo);
      this.vth += (T.x0 < 0 ? 1 : T.x0 > W ? -1 : 0.4) * 0.5;
      temblar(5 + i * 2, 0.18);
      const q = this.posPlato(this.estado(), this.pila.length - 1);
      for (let k = 0; k < 8; k++) p.nueva(P.DESTELLO, q[0] + azar(-30, 30), q[1] + azar(-20, 5), 0, 0, 0.25, 28);
      for (let k = 0; k < 6; k++) p.nueva(P.POLVO, q[0] + azar(-30, 30), q[1], azar(-120, 120), azar(-40, 10), azar(0.3, 0.5), azar(14, 22));
    }));
    if (t > 5.45 && t < 5.5) this.vth += 0.25 * Math.sin(t * 50);
    this.una("grito", t > 6.15, () => temblar(18, 0.45));
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    foco(g, 512, this.xEn(t), PIES, 230, 0.7 * (1 - tramo(t, 8.2, 9.0)));
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.25; g.drawImage(BLOB2.oro, 120, PIES - 30, 780, 64); g.restore();
    pintarAvatar(g, e.m, e.pose, t);
    // la torre de platitos
    for (let i = 0; i < this.pila.length; i++) {
      const q = this.posPlato(e, i);
      g.save(); g.translate(q[0], q[1]); g.rotate(this.th * 3 * (1 + i * 0.3) + e.pose.rc * 0.5); g.scale(EP, EP);
      platitoFondo(g, 0, 0); platito(g, 0, 0, this.pila[i], t);
      g.restore();
    }
    // tapas volando
    for (const [i, T] of this.tapas.entries()) {
      if (t < T.t0 || t >= T.t1) continue;
      const u = (t - T.t0) / (T.t1 - T.t0);
      const eF = this.estado(T.t1), dest = [this.coronilla(eF)[0], this.coronilla(eF)[1] - i * PASO + 8];
      const alto = T.y0 < 0 ? 0 : 180;
      const x = lerp(T.x0, dest[0], u), y = lerp(T.y0, dest[1], u) - alto * Math.sin(Math.PI * u);
      g.save(); g.translate(x, y); g.rotate((1 - u) * (T.x0 < 0 ? -0.6 : T.x0 > W ? 0.6 : 0) * Math.sin(u * 8)); g.scale(EP, EP);
      platitoFondo(g, 0, 0); platito(g, 0, 0, T.tipo, t);
      g.restore();
      // líneas de velocidad
      g.save(); g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 2;
      const dx = dest[0] - T.x0, dy = dest[1] - T.y0, L = Math.hypot(dx, dy);
      for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(x - (dx / L) * 50 + k * 8, y - (dy / L) * 50 - 10 + k * 6); g.lineTo(x - (dx / L) * 100 + k * 8, y - (dy / L) * 100 - 10 + k * 6); g.stroke(); }
      g.restore();
    }
    this.p.dibujar(g);
    // ¡MARCHANDO!
    if (t > 6.15) {
      const c = titulo(), k = tramo(t, 6.15, 6.32), s = lerp(0.2, 1, eBack(k));
      const sac = 5 * (1 - tramo(t, 6.4, 6.9));
      g.save(); g.globalAlpha = 1 - tramo(t, 8.9, 9.4); g.translate(285 + azar(-sac, sac), 250 + azar(-sac, sac)); g.rotate(-0.1); g.scale(s * 0.92, s * 0.92);
      g.drawImage(c, -c.width / 2, -c.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0, 0.45), tramo(t, 9.4, this.dur - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00077", nombre: "Marchando", crear: () => new EscenaMarchando() });
})();
