"use strict";
/*
 * 00086 · PULSO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Echa un pulso sobre la barra contra un clon con el pelo dorado. ¡YA! Tiemblan los dos, sudan, el clon le tiene
 * casi ganado… pero él aprieta los ojos, grita y le tumba la mano de golpe: el clon sale volando dando vueltas y se
 * pierde en el cielo como una estrellita. ¡PULSO! y saca bíceps. Se apaga la luz.
 */
(() => {
const ESC = 2.0, AY = 672, XG = 380, XC = 644;
const PIV = [512, 446], RB = 82;   // codos sobre la barra y largo del antebrazo (px)
const BARRA = 462;                 // canto de la barra
const T_YA = 1.6, T_GANA = 5.12, T_VUELA = 5.24;

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const u = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return lerp(k[i - 1][1], k[i][1], (k[i][2] || eInOut)(u)); }
  return k[k.length - 1][1];
}
// ángulo de las manos (+ = gana él)
const TH = [[1.9, 0], [2.6, -0.2], [3.05, -0.42], [3.45, -0.24], [3.85, 0.1], [4.3, -0.46], [4.8, -0.54], [4.98, -0.44], [T_GANA, 1.25, eIn]];

class Pulso extends Escena {
  constructor() {
    super(9.4);
    this.p = new Parts(360);
    this.gotas = [];
  }
  theta(t) { return pista(t, TH); }
  tiembla(t) { return t > 1.9 && t < T_GANA ? (0.6 + 2.2 * tramo(t, 1.9, 4.9)) : 0; }
  agarre(t) {
    const th = this.theta(t), tr = this.tiembla(t);
    return [PIV[0] + RB * Math.sin(th) + azar(-tr, tr), PIV[1] - RB * Math.cos(th) + azar(-tr, tr)];
  }
  /** [él, el clon] */
  poses() {
    const t = this.t, th = this.theta(t), tr = this.tiembla(t);
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoI: [-6, 150] };
    const C = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [84, 150], oro: 1, puntas: 0.25, brazoIDelante: true };
    // entran por los lados y apoyan el codo
    const kE = eOut(tramo(t, 0, 0.75));
    const xg = lerp(-120, XG, kE), xc = lerp(W + 120, XC, kE);
    const kA = eInOut(tramo(t, 0.75, 1.15));
    const A = this.agarre(t);
    const aU = (x, q) => [(q[0] - x) / ESC + 39, (q[1] - AY) / ESC + 232];
    G.manoD = mezcla([70, 158], aU(XG, A), kA);
    C.manoI = mezcla([9, 160], aU(XC, A), kA);
    if (t > 1.15 && t < 1.9) { G.cara = "guino"; C.cara = "sonrisa"; C.rc = -0.06; }
    // la lucha
    let dG = 0, dC = 0, sxG = 1, sxC = 1;
    if (t > 1.9 && t < T_GANA) {
      G.cara = th < -0.36 ? "sorpresa" : "dormido";
      C.cara = th < -0.15 ? "guino" : "dormido";
      G.rc = -0.05 + azar(-0.01, 0.01) * tr; C.rc = 0.05 + azar(-0.01, 0.01) * tr;
      dG = azar(-1, 1) * tr; dC = azar(-1, 1) * tr;
      G.puntas = 0.6 * tramo(t, 3.5, 4.9);
      sxG = 1 + 0.02 * tramo(t, 4.3, 4.9);
    }
    if (t > 4.86 && t < T_GANA) { G.cara = "sorpresa"; G.puntas = 1; }
    // gana: el clon sale volando
    let mC = matAv(xc + dC, AY, ESC, -th * 0.03, sxC, 1);
    if (t >= T_GANA) {
      G.cara = t < T_GANA + 0.5 ? "sorpresa" : "risa"; G.puntas = 1 - tramo(t, T_GANA + 0.6, T_GANA + 1.4);
      C.cara = "sorpresa"; C.puntas = 1;
      // saca bíceps
      const k = eBack(tramo(t, T_GANA + 0.75, T_GANA + 1.1));
      G.manoD = mezcla(aU(XG, A), [98, 48 + Math.sin(t * 8) * 3 * tramo(t, 6.4, 6.6)], k);
      G.manoI = mezcla(G.manoI, [-20, 30 + Math.sin(t * 8) * 4], eOut(tramo(t, T_GANA + 0.9, T_GANA + 1.2)));
      G.rc = 0.06 * Math.sin(t * 5) * tramo(t, T_GANA + 1, T_GANA + 1.4);
    }
    if (t >= T_VUELA) {
      const s = t - T_VUELA;
      const x = XC + 540 * s, y = AY - 116 * ESC - 1350 * s + 650 * s * s;
      mC = matAv(x, y, ESC * Math.max(0.15, 1 - 0.75 * s), s * 13, 1, 1, [39, 116]);
      C.manoI = [-30, 40]; C.manoD = [110, 40]; C.piernaI = [0, 0.3]; C.piernaD = [0, -0.3];
    } else if (t >= T_GANA) C.manoI = aU(XC, A);
    return [{ pose: G, m: matAv(xg + dG, AY, ESC, th * 0.025, sxG, 1) }, { pose: C, m: mC, vuela: t >= T_VUELA }];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("apoyan", t > 1.1, () => temblar(8, 0.2));
    this.una("ya", t > T_YA, () => temblar(6, 0.15));
    // sudor
    if (t > 2.4 && t < T_GANA && Math.random() < 9 * dt) {
      const e = this.poses(), a = e[Math.random() < 0.5 ? 0 : 1], lado = a === e[0] ? -1 : 1;
      const q = aPant(a.m, [39 + lado * 30, 30]);
      this.gotas.push({ x: q[0], y: q[1], vx: lado * azar(40, 120), vy: azar(-160, -60), v: 0.8 });
    }
    for (const g of this.gotas) { g.vy += 900 * dt; g.x += g.vx * dt; g.y += g.vy * dt; g.v -= dt; }
    this.gotas = this.gotas.filter((g) => g.v > 0);
    this.una("gana", t > T_GANA, () => {
      temblar(32, 0.7);
      const q = this.agarre(T_GANA);
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.4, 220);
      for (let i = 0; i < 40; i++) { const a = azar(-Math.PI, 0), v = azar(250, 750); p.nueva(P.CHISPA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(8, 15)); }
      for (let i = 0; i < 24; i++) p.nueva(P.POLVO, q[0] + azar(-60, 60), BARRA, azar(-400, 400), azar(-80, -10), azar(0.6, 1.1), azar(26, 46));
      for (const x of [110, 870]) for (let i = 0; i < 14; i++) p.nueva(P.ESPUMA, x + 30, BARRA - 80, azar(-120, 120), azar(-380, -150), azar(0.5, 0.9), azar(5, 9));
    });
    if (t > T_VUELA && t < T_VUELA + 0.6 && Math.random() < 50 * dt) {
      const e = this.poses(), q = aPant(e[1].m, [39, 116]);
      p.nueva(P.LLAMA, q[0] + azar(-20, 20), q[1] + azar(-20, 20), azar(-60, 60), azar(-20, 40), azar(0.2, 0.4), azar(30, 50), 1);
    }
    this.una("estrella", t > T_VUELA + 0.72, () => { p.nueva(P.DESTELLO, 930, 46, 0, 0, 0.5, 120); });
    p.actualizar(dt);
  }
  barra(g, t) {
    const sal = this.t > T_GANA ? Math.exp(-(t - T_GANA) * 9) * Math.abs(Math.sin((t - T_GANA) * 50)) * 10 : 0;
    // jarras en los extremos (saltan con el golpe)
    for (const x of [110, 870]) {
      g.save(); g.translate(x, BARRA - 4 - sal * (x < 512 ? 1 : 0.7)); g.scale(1.9, 1.9);
      dibujarJarra(g, [0, -18], 0, 0.85, "asa", t); dibujarJarra(g, [0, -18], 0, 0.85, "cuerpo", t);
      g.restore();
    }
    // frente de la barra
    const gf = this.grBarra || (this.grBarra = (() => { const gr = g.createLinearGradient(0, BARRA, 0, H); gr.addColorStop(0, "#5a3218"); gr.addColorStop(1, "#24130a"); return gr; })());
    g.fillStyle = gf; g.fillRect(-60, BARRA + 10, W + 120, H - BARRA + 60);
    g.fillStyle = "rgba(0,0,0,.35)";
    for (let x = 30; x < W; x += 96) g.fillRect(x, BARRA + 18, 3, H - BARRA);
    g.fillStyle = "rgba(255,210,150,.06)"; g.fillRect(-60, BARRA + 70, W + 120, 4);
    // reposapiés de latón
    g.fillStyle = "#b8862d"; g.fillRect(-60, 556, W + 120, 9); g.fillStyle = "rgba(255,240,190,.6)"; g.fillRect(-60, 557, W + 120, 2);
    // tablero
    g.fillStyle = "#8a5426"; g.fillRect(-60, BARRA - 6, W + 120, 18);
    g.fillStyle = "rgba(255,220,170,.4)"; g.fillRect(-60, BARRA - 6, W + 120, 3);
    g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(-60, BARRA + 12, W + 120, 5);
  }
  dibujar(g) {
    const t = this.t, e = this.poses();
    fondo(g, "#000");
    // lámpara sobre la barra
    const luz = 1 - tramo(t, 8.6, 9.25);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.4 * luz;
    g.drawImage(BLOB2.oroClaro, 120, 40, 784, 520); g.restore();
    pintarAvatar(g, e[0].m, e[0].pose, t);
    if (!e[1].vuela) pintarAvatar(g, e[1].m, e[1].pose, t);
    this.barra(g, t);
    // manos entrelazadas: brillo de fuerza
    if (t > 1.9 && t < T_GANA + 0.3) {
      const q = this.agarre(t), k = this.tiembla(t) / 2.8;
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.25 + 0.35 * k;
      g.drawImage(BLOB.amarillo, q[0] - 60, q[1] - 60, 120, 120); g.restore();
      g.save(); g.strokeStyle = `rgba(255,255,255,${0.5 + 0.4 * k})`; g.lineWidth = 3; g.lineCap = "round";
      for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.283 + t * 3, r0 = 44 + 5 * Math.sin(t * 40 + i); g.beginPath(); g.moveTo(q[0] + Math.cos(a) * r0, q[1] + Math.sin(a) * r0); g.lineTo(q[0] + Math.cos(a) * (r0 + 12), q[1] + Math.sin(a) * (r0 + 12)); g.stroke(); }
      g.restore();
    }
    if (e[1].vuela) pintarAvatar(g, e[1].m, e[1].pose, t);
    // sudor
    g.fillStyle = "#bfe9ff";
    for (const d of this.gotas) { g.beginPath(); g.ellipse(d.x, d.y, 4, 6, 0, 0, 6.283); g.fill(); }
    this.p.dibujar(g);
    // estrellita donde se pierde el clon
    const ke = t - T_VUELA - 0.72;
    if (ke > 0 && ke < 0.9) brillo(g, 930, 46, 34 * Math.sin((ke / 0.9) * Math.PI), 1);
    // ¡YA!
    if (t > T_YA - 0.1 && t < T_YA + 0.6) {
      const k = eBack(tramo(t, T_YA - 0.1, T_YA + 0.05));
      g.save(); g.translate(512, 150); g.scale(k, k); g.rotate(-0.08);
      txt(g, "¡YA!", 0, 0, { tam: 76, peso: 400, fam: FC, color: "#fffdf5", borde: "#7a0008", bordeAncho: 10, alfa: 1 - tramo(t, T_YA + 0.4, T_YA + 0.6), esp: 3 });
      g.restore();
    }
    // ¡PULSO!
    if (t > T_GANA + 0.08) {
      const d = t - T_GANA - 0.08, k = tramo(d, 0, 0.17), s = lerp(2.7, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 8));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(560, 112); g.rotate(-0.05); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0, 0.3), 1 - luz);
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (this._tit) return this._tit;
    const c = lienzoNuevo(600, 220), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 50, 0, 160);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡PULSO!", 300, 162, { tam: 150, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 12, esp: 5, glow: "rgba(255,190,40,.85)", glowTam: 26 });
    return (this._tit = c);
  }
}

registrar({ id: "00086", nombre: "Pulso", crear: () => new Pulso() });
})();
