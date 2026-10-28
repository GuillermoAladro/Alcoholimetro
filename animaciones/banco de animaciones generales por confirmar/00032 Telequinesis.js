"use strict";
/*
 * 00032 · TELEQUINESIS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Con los dedos en las sienes y los ojos cerrados, manda ondas mentales: seis jarras tiemblan en el suelo, levitan y
 * orbitan a su alrededor cada vez más rápido (por delante y por detrás de él). Frenan y se colocan en una fila
 * perfecta en el aire (¡PODER MENTAL!). Abre un ojo, y una jarra baja sola a su mano para brindar.
 */
(() => {
const N = 6;
const SUELO = [95, 215, 335, 690, 810, 930];   // dónde están al principio
const FILA_Y = 190, FILA_X0 = 187, FILA_PASO = 130;
const SJ = 1.8;                                // escala de las jarras sueltas
const LA_MIA = 3;                              // la que baja a su mano
const cache = cacheTexto();

let _morado = null;
function blobMorado() {
  if (_morado) return _morado;
  const c = lienzoNuevo(64, 64), x = c.getContext("2d");
  const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(190,110,255,1)"); gr.addColorStop(0.45, "rgba(150,80,255,.5)"); gr.addColorStop(1, "rgba(120,60,255,0)");
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  return (_morado = c);
}
function titulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(900, 160), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 30, 0, 120);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#e4c9ff"); gr.addColorStop(1, "#a45cff");
  txt(g, "PODER MENTAL", 450, 112, { tam: 104, peso: 900, fam: FD, color: gr, borde: "#2a0b4d", bordeAncho: 10, esp: 6, glow: "rgba(170,90,255,.9)", glowTam: 28 });
  cache.set("t", c);
  return c;
}

class EscenaTele extends Escena {
  constructor() {
    super(10.0);
    this.p = new Parts(380);
    this.X = W / 2; this.ESC = 1.45;
    this.ondas = []; this.ang = 0; this.w = 0;
  }
  /** Posición, escala, inclinación y profundidad (+ delante) de cada jarra. */
  jarra(i, t) {
    const suelo = [SUELO[i], PIES - 18 * SJ], cx = this.X, cy = 395;
    // orbita
    const a = this.ang + (i * Math.PI * 2) / N;
    const orb = [cx + Math.cos(a) * 340, cy + Math.sin(a) * 78 - 40 * Math.sin(this.t * 2 + i)];
    const prof = Math.sin(a);
    let pos = suelo, esc = SJ, inc = 0, z = 1;
    // traqueteo en el suelo
    const tq = tramo(t, 0.9, 1.9 + i * 0.1);
    if (tq > 0 && t < 1.9 + i * 0.1) { pos = [suelo[0] + azar(-2, 2) * tq, suelo[1] - Math.abs(Math.sin(t * 40 + i)) * 6 * tq]; inc = 0.12 * Math.sin(t * 33 + i) * tq; }
    // despega y entra en la órbita
    const kD = eInOut(tramo(t, 1.9 + i * 0.12, 3.0 + i * 0.12));
    if (kD > 0) { pos = mezcla(suelo, orb, kD); esc = SJ * lerp(1, 1 + 0.16 * prof, kD); z = lerp(1, prof, kD); inc = (1 - kD) * inc + kD * 0.25 * Math.sin(a * 2 + t); }
    // a la fila
    const kF = eInOut(tramo(t, 5.7 + i * 0.13, 6.55 + i * 0.13));
    if (kF > 0) {
      const fila = [FILA_X0 + i * FILA_PASO, FILA_Y + 6 * Math.sin(t * 2.5 + i * 0.7) * (1 - tramo(t, 6.8, 7.2))];
      pos = mezcla(pos, fila, kF); esc = lerp(esc, SJ, kF); z = lerp(z, 1, kF); inc = lerp(inc, 0, kF);
    }
    // la que baja a su mano
    if (i === LA_MIA && t > 7.7) {
      const e = this.estado(), h = aPant(e.m, e.pose.manoD), k = eInOut(tramo(t, 7.7, 8.3));
      pos = mezcla(pos, [h[0] + 17 * this.ESC, h[1]], k); esc = lerp(SJ, this.ESC, k);
    }
    return { pos, esc, inc, z };
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let manoD = [70, 158], manoI = [9, 160], dx = 0;
    const kS = eInOut(tramo(t, 0.45, 0.85)) * (1 - eInOut(tramo(t, 7.15, 7.6)));
    const tiembla = t > 0.9 && t < 6.8 ? 1.2 * Math.sin(t * 47) * tramo(t, 0.9, 1.6) : 0;
    manoD = mezcla(manoD, [69, 43 + tiembla], kS);
    manoI = mezcla(manoI, [9, 43 - tiembla], kS);
    if (t > 0.75 && t < 6.85) { pose.cara = "dormido"; dx = 1.3 * Math.sin(t * 53) * tramo(t, 3, 5.5); }
    if (t >= 6.85 && t < 7.6) pose.cara = "guino";
    if (t >= 7.6) pose.cara = "risa";
    // brinda con la jarra que le ha llegado
    if (t > 7.6) manoD = mezcla([70, 158], [66, 128], eInOut(tramo(t, 7.6, 7.9)));
    if (t > 8.3) {
      const k = eInOut(tramo(t, 8.35, 8.7));
      manoD = mezcla(manoD, [82, 58], k);
      pose.jarra = { inc: -0.25 * k, nivel: 1 };
      pose.cara = t > 8.7 ? "guino" : "risa";
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(this.X + dx, PIES, this.ESC);
    return { pose, m };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // velocidad de la órbita: acelera y frena
    const wObj = t < 3 ? 0.8 : t < 5.0 ? lerp(0.8, 4.2, tramo(t, 3, 5.0)) : lerp(4.2, 0.4, tramo(t, 5.0, 6.2));
    this.w = wObj; this.ang += this.w * dt;
    // ondas mentales
    if (t > 0.85 && t < 6.9) {
      this.t0onda = this.t0onda || 0;
      if (t - this.t0onda > 0.38) { this.t0onda = t; this.ondas.push(t); }
    }
    this.ondas = this.ondas.filter((o) => t - o < 1.2);
    // chispitas bajo las jarras que levitan y gotas que salen despedidas
    for (let i = 0; i < N; i++) {
      if (t < 1.9 || (i === LA_MIA && t > 8.3)) continue;
      const J = this.jarra(i, t);
      if (Math.random() < 10 * dt) p.nueva(P.ELECTRICA, J.pos[0] + azar(-20, 20), J.pos[1] + 30, azar(-20, 20), azar(10, 50), azar(0.3, 0.6), azar(10, 18));
      if (this.w > 2.5 && Math.random() < 3 * dt) p.nueva(P.GOTA, J.pos[0], J.pos[1] - 25, azar(-120, 120), azar(-200, -80), 1.2, azar(3, 5));
    }
    for (let i = 0; i < N; i++) this.una("fila" + i, t > 6.55 + i * 0.13, () => {
      const J = this.jarra(i, t);
      p.nueva(P.DESTELLO, J.pos[0], J.pos[1], 0, 0, 0.3, 90);
      for (let k = 0; k < 8; k++) { const a = azar(0, 6.283), v = azar(80, 200); p.nueva(P.ELECTRICA, J.pos[0], J.pos[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.25, 0.45), azar(8, 14)); }
    });
    this.una("titulo", t > 6.9, () => temblar(14, 0.35));
    this.una("llega", t > 8.3, () => { const e = this.estado(), q = aPant(e.m, e.pose.manoD); for (let k = 0; k < 14; k++) p.nueva(P.ESPUMA, q[0] + 20, q[1] - 30, azar(-120, 120), azar(-220, -60), azar(0.4, 0.7), azar(4, 8)); });
    this.una("brindis", t > 8.7, () => { const e = this.estado(), q = aPant(e.m, [100, 30]); for (let k = 0; k < 18; k++) p.nueva(P.ESPUMA, q[0], q[1], azar(-160, 160), azar(-280, -80), azar(0.4, 0.8), azar(4, 9)); temblar(5, 0.2); });
    p.actualizar(dt);
  }
  dibujarJarra(g, J, t) {
    const s = J.esc, luz = 0.8 - 0.3 * Math.max(0, -J.z);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.55 * luz;
    g.drawImage(blobMorado(), J.pos[0] - 55 * s / SJ, J.pos[1] - 50 * s / SJ, 110 * s / SJ, 100 * s / SJ);
    g.restore();
    g.save(); g.translate(J.pos[0] - 17 * s, J.pos[1]); g.scale(s, s);
    if (J.z < 0) g.globalAlpha = 1 - 0.4 * -J.z; // las de detrás, más apagadas
    dibujarJarra(g, [0, 0], J.inc, 1, "asa", t); dibujarJarra(g, [0, 0], J.inc, 1, "cuerpo", t);
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    // resplandor morado del poder
    const pot = tramo(t, 0.9, 2.5) * (1 - tramo(t, 7.4, 8.4));
    if (pot > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35 * pot * (0.85 + 0.15 * Math.sin(t * 6));
      g.drawImage(blobMorado(), this.X - 420, 140, 840, 520); g.restore();
    }
    // sombras en el suelo
    g.fillStyle = "rgba(160,110,255,.10)"; g.beginPath(); g.ellipse(this.X, PIES, 110, 12, 0, 0, 6.283); g.fill();
    // ondas mentales desde la cabeza
    const cab = aPant(e.m, [39, 35]);
    g.save(); g.globalCompositeOperation = "lighter";
    for (const o of this.ondas) {
      const k = (t - o) / 1.2;
      g.strokeStyle = `rgba(190,120,255,${0.55 * (1 - k)})`; g.lineWidth = 5 * (1 - k) + 1;
      g.beginPath(); g.ellipse(cab[0], cab[1], 50 + 320 * k, 34 + 200 * k, 0, 0, 6.283); g.stroke();
    }
    g.restore();
    const js = [];
    for (let i = 0; i < N; i++) if (!(i === LA_MIA && t > 8.3)) js.push(this.jarra(i, t));
    // las de detrás, el avatar y las de delante
    js.filter((J) => J.z < 0).sort((a, b) => a.z - b.z).forEach((J) => this.dibujarJarra(g, J, t));
    pintarAvatar(g, e.m, e.pose, t);
    js.filter((J) => J.z >= 0).sort((a, b) => a.z - b.z).forEach((J) => this.dibujarJarra(g, J, t));
    this.p.dibujar(g);
    // PODER MENTAL
    if (t > 6.85) {
      const k = tramo(t, 6.85, 7.0), s = lerp(2.6, 1, eIn(k)), a = Math.min(1, k * 4) * (1 - tramo(t, 9.3, 9.6));
      const T = titulo();
      g.save(); g.globalAlpha = a; g.translate(W / 2, 78); g.scale(s, s); g.drawImage(T, -T.width / 2, -T.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0, 0.4), tramo(t, this.dur - 0.5, this.dur - 0.02));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00032", nombre: "Telequinesis", crear: () => new EscenaTele() });
})();
