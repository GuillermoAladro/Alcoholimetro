"use strict";
/*
 * 00133 · ESCONDITE
 *
 * Animación del banco. Empieza y acaba en negro.
 * Rodrigo cuenta tapándose los ojos (los números saltan sobre su cabeza). Guillermo pide silencio y corre a
 * esconderse: detrás de una maceta (haciendo de planta con los brazos), detrás de un barril (asoman los ojos) y por
 * fin detrás de una columna delgadísima (se le ve por los dos lados). Rodrigo llega a diez, mira… ¡TE PILLÉ! y se
 * ríen los dos. Se apaga la luz.
 */
(() => {
const ESC = 1.4, XR = 860;
const MACETA = 190, BARRIL = 392, COLUMNA = 604;
const T_DIEZ = 6.2, T_PILLA = 6.95;

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) {
    const u = (k[i][2] || eInOut)((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0])), a = k[i - 1][1], b = k[i][1];
    return Array.isArray(a) ? [lerp(a[0], b[0], u), lerp(a[1], b[1], u)] : lerp(a, b, u);
  }
  return k[k.length - 1][1];
}

class Escondite extends Escena {
  constructor() {
    super(9.95);
    this.p = new Parts(200);
    this.fase = 0;
  }
  xG(t) {
    return pista(t, [[0.9, 700], [1.5, MACETA, (u) => u], [2.6, MACETA], [3.05, BARRIL, (u) => u], [4.3, BARRIL], [4.75, COLUMNA + 18, (u) => u], [7.05, COLUMNA + 18], [7.35, COLUMNA + 80, eOut]]);
  }
  corriendo(t) { return (t > 0.9 && t < 1.5) || (t > 2.6 && t < 3.05) || (t > 4.3 && t < 4.75); }
  poses() {
    const t = this.t;
    // ---------------- Guillermo
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    let dy = 0, sx = 1, sy = 1, giro = 0;
    // ¡chsss!
    if (t < 0.9) {
      const k = eInOut(tramo(t, 0.35, 0.55)) * (1 - eInOut(tramo(t, 0.75, 0.9)));
      const b = boca(0); G.manoD = mezcla([70, 158], [b[0] + 4, b[1] + 6], k); G.cara = k > 0.5 ? "guino" : "sonrisa";
    }
    if (this.corriendo(t)) {
      const a = andar(this.fase, 1.3); G.piernaI = a.piernaI; G.piernaD = a.piernaD; dy = a.bote * ESC * 1.3;
      G.manoD = [76 + 8 * Math.sin(this.fase), 140 - 6 * Math.cos(this.fase)]; G.manoI = [2 - 8 * Math.sin(this.fase), 140 + 6 * Math.cos(this.fase)];
      G.cara = "risa"; giro = this.xG(t + 0.01) < this.xG(t) ? -0.06 : 0.06;
    }
    // 1) la maceta: hace de planta con los brazos
    if (t >= 1.5 && t < 2.6) {
      const k = eOut(tramo(t, 1.5, 1.7));
      sy = lerp(1, 0.62, k); sx = lerp(1, 1.06, k);
      G.manoD = mezcla([70, 158], [98 + 4 * Math.sin(t * 6), -6], k); G.manoI = mezcla([9, 160], [-20 - 4 * Math.sin(t * 6), -6], k);
      G.cara = "sonrisa"; G.rc = 0.05 * Math.sin(t * 6);
      // se da cuenta de que se le ve todo: niega con la cabeza
      if (t > 2.2) { G.cara = "sorpresa"; G.rc = 0.18 * Math.sin((t - 2.2) * 22); }
    }
    // 2) el barril: asoma los ojos
    if (t >= 3.05 && t < 4.3) {
      const k = eOut(tramo(t, 3.05, 3.2)), asoma = 0.06 * Math.max(0, Math.sin((t - 3.3) * 5));
      sy = lerp(1, 0.5 + asoma, k); sx = lerp(1, 1.08, k);
      G.manoD = [62, 120]; G.manoI = [16, 120];
      G.cara = t > 3.9 ? "sorpresa" : "guino"; G.rc = t > 3.5 && t < 3.9 ? 0.1 * Math.sin(t * 9) : 0;
    }
    // 3) la columna: se encoge para caber
    if (t >= 4.75 && t < 7.05) {
      const k = eOut(tramo(t, 4.75, 4.95));
      sx = lerp(1, 0.9, k); sy = lerp(1, 1.03, k);
      G.manoD = [58, 150]; G.manoI = [20, 150]; G.cara = "sonrisa"; G.rc = 0.05 * Math.sin(t * 3);
      if (t > T_PILLA) { G.cara = "sorpresa"; G.puntas = 0.9; }
    }
    if (t >= 7.05) {
      G.cara = t < 7.6 ? "sorpresa" : "risa"; G.puntas = 0.9 * (1 - tramo(t, 7.4, 7.8));
      // se encoge de hombros
      const k = eInOut(tramo(t, 7.6, 7.85));
      G.manoD = mezcla([70, 158], [100, 120], k); G.manoI = mezcla([9, 160], [-22, 120], k);
      if (t > 7.85) { dy = -3 * Math.abs(Math.sin(t * 10)); giro = 0.04 * Math.sin(t * 5); G.rc = 0.06 * Math.sin(t * 10); }
    }
    const mG = matAv(this.xG(t), PIES + dy, ESC, giro, sx, sy);

    // ---------------- Rodrigo
    const RR = avatar("rodrigo").rig;
    const R = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [68, 157], manoI: [9, 157], brazoIDelante: true };
    const tapa = 1 - eInOut(tramo(t, T_DIEZ, T_DIEZ + 0.25));
    R.manoD = mezcla([68, 157], [RR.ojos[1][0] + 2, RR.ojos[1][1] - 3], tapa);
    R.manoI = mezcla([9, 157], [RR.ojos[0][0] - 2, RR.ojos[0][1] - 3], tapa);
    let dyR = 0, giroR = 0;
    if (t < T_DIEZ) { R.cara = "sonrisa"; R.rc = 0.04 * Math.sin(t * 3.3); dyR = -1.5 * Math.abs(Math.sin(((t - 0.6) / 0.56) * Math.PI)); }
    if (t >= T_DIEZ && t < T_PILLA) { R.cara = "guino"; R.rc = t < 6.55 ? 0.14 : -0.14; giroR = t < 6.55 ? 0.03 : -0.03; }
    if (t >= T_PILLA) {
      R.cara = t < 7.6 ? "risa" : "risa"; R.rc = -0.06;
      const k = eOut(tramo(t, T_PILLA, T_PILLA + 0.15));
      R.manoI = mezcla([9, 157], [-34, 86 + 2 * Math.sin(t * 20)], k);
      giroR = -0.04 * k;
      if (t > 7.85) { dyR = -3 * Math.abs(Math.sin(t * 10 + 1)); R.rc = -0.06 + 0.06 * Math.sin(t * 10); R.manoD = [74, 140]; }
    }
    const mR = matAv(XR, PIES + dyR, ESC, giroR);
    return { G, mG, R, mR };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    if (this.corriendo(t)) this.fase += dt * 15;
    for (const [k, x, t0] of [["m", MACETA, 1.5], ["b", BARRIL, 3.05], ["c", COLUMNA, 4.75]]) this.una(k, t > t0, () => { for (let i = 0; i < 8; i++) p.nueva(P.POLVO, x + azar(-40, 40), PIES - 4, azar(-200, 200), azar(-40, -5), azar(0.4, 0.7), azar(18, 30)); });
    this.una("pilla", t > T_PILLA, () => {
      temblar(16, 0.4);
      p.nueva(P.DESTELLO, COLUMNA, 330, 0, 0, 0.35, 220);
      for (let i = 0; i < 26; i++) p.nueva(P.CONFETI, COLUMNA + azar(-100, 100), azar(-20, 60), azar(-80, 80), azar(40, 160), azar(2, 3), azar(9, 14), (Math.random() * 5) | 0);
    });
    p.actualizar(dt);
  }
  maceta(g, x) {
    // hojas
    g.save(); g.translate(x, PIES - 64);
    const hojas = [[-0.9, 70], [-0.5, 92], [-0.15, 104], [0.2, 98], [0.55, 86], [0.95, 66], [-0.3, 60], [0.4, 58]];
    for (const [a, l] of hojas) {
      g.save(); g.rotate(a + 0.04 * Math.sin(this.t * 2 + a * 5));
      g.strokeStyle = "#2e6b1c"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -l * 0.6); g.stroke();
      const gr = g.createLinearGradient(-12, 0, 12, 0); gr.addColorStop(0, "#1f6e1a"); gr.addColorStop(0.5, "#5fcf3f"); gr.addColorStop(1, "#1f6e1a");
      g.fillStyle = gr; g.beginPath(); g.ellipse(0, -l * 0.62, 13, l * 0.42, 0, 0, 6.283); g.fill();
      g.strokeStyle = "rgba(10,60,10,.6)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, -l * 0.25); g.lineTo(0, -l); g.stroke();
      g.restore();
    }
    g.restore();
    // tiesto
    const gr = g.createLinearGradient(x - 44, 0, x + 44, 0);
    gr.addColorStop(0, "#7a3412"); gr.addColorStop(0.45, "#e07a3c"); gr.addColorStop(1, "#6a2a0c");
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - 38, PIES - 62); g.lineTo(x + 38, PIES - 62); g.lineTo(x + 28, PIES); g.lineTo(x - 28, PIES); g.closePath(); g.fill();
    g.fillStyle = "#c9652c"; rectR(g, x - 46, PIES - 74, 92, 16, 4); g.fill();
    g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(x - 40, PIES - 72, 80, 3);
  }
  barril(g, x) {
    const w = 128, h = 140, top = PIES - h;
    const gr = this.grBarril || (this.grBarril = (() => { const q = g.createLinearGradient(-w / 2, 0, w / 2, 0); q.addColorStop(0, "#3d1f0a"); q.addColorStop(0.4, "#a8642a"); q.addColorStop(0.6, "#c07a38"); q.addColorStop(1, "#3a1c08"); return q; })());
    g.save(); g.translate(x, 0);
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(-w / 2 + 8, top); g.quadraticCurveTo(-w / 2 - 8, top + h / 2, -w / 2 + 8, PIES); g.lineTo(w / 2 - 8, PIES); g.quadraticCurveTo(w / 2 + 8, top + h / 2, w / 2 - 8, top); g.closePath(); g.fill();
    g.strokeStyle = "rgba(0,0,0,.3)"; g.lineWidth = 2;
    for (const dx of [-36, -12, 12, 36]) { g.beginPath(); g.moveTo(dx * 0.92, top + 2); g.quadraticCurveTo(dx * 1.12, top + h / 2, dx * 0.92, PIES - 2); g.stroke(); }
    g.fillStyle = "#2c2c30";
    for (const y of [top + 22, PIES - 30]) { g.beginPath(); g.ellipse(0, y, w / 2 + 2, 6, 0, 0, 6.283); g.fill(); }
    g.fillStyle = "rgba(255,255,255,.18)"; for (const y of [top + 20, PIES - 32]) g.fillRect(-w / 2 + 6, y - 3, w - 12, 2);
    g.fillStyle = "#6b3a14"; g.beginPath(); g.ellipse(0, top, w / 2 - 8, 9, 0, 0, 6.283); g.fill();
    g.strokeStyle = "#2c2c30"; g.lineWidth = 3; g.stroke();
    g.restore();
  }
  columna(g, x) {
    const w = 48;
    const gr = this.grCol || (this.grCol = (() => { const q = g.createLinearGradient(-w / 2, 0, w / 2, 0); q.addColorStop(0, "#6f6a62"); q.addColorStop(0.45, "#efe9dc"); q.addColorStop(1, "#7a746a"); return q; })());
    g.save(); g.translate(x, 0);
    g.fillStyle = gr; g.fillRect(-w / 2, 70, w, PIES - 70);
    g.strokeStyle = "rgba(0,0,0,.18)"; g.lineWidth = 2;
    for (const dx of [-17, -6, 6, 17]) { g.beginPath(); g.moveTo(dx, 96); g.lineTo(dx, PIES - 30); g.stroke(); }
    // capitel y basa
    g.fillStyle = gr; rectR(g, -w / 2 - 14, 52, w + 28, 22, 4); g.fill(); rectR(g, -w / 2 - 8, 72, w + 16, 14, 3); g.fill();
    rectR(g, -w / 2 - 10, PIES - 30, w + 20, 14, 3); g.fill(); rectR(g, -w / 2 - 16, PIES - 18, w + 32, 18, 3); g.fill();
    g.restore();
  }
  dibujar(g) {
    if (!this._tit) this.titulo(); // se prepara en el primer cuadro (negro), no en el remate
    const t = this.t, e = this.poses();
    fondo(g, "#000");
    const luz = tramo(t, 0, 0.45) * (1 - tramo(t, 9.35, 9.9));
    g.save(); g.globalAlpha = luz;
    // pared y suelo
    const gp = this.grPared || (this.grPared = (() => { const q = g.createLinearGradient(0, 0, 0, PIES); q.addColorStop(0, "#0d0a0a"); q.addColorStop(1, "#2a1d16"); return q; })());
    g.fillStyle = gp; g.fillRect(-60, -60, W + 120, PIES + 60);
    const gs = this.grSuelo || (this.grSuelo = (() => { const q = g.createLinearGradient(0, PIES - 6, 0, H); q.addColorStop(0, "#3a2c22"); q.addColorStop(1, "#120c09"); return q; })());
    g.fillStyle = gs; g.fillRect(-60, PIES - 4, W + 120, H - PIES + 70);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35 * luz; g.drawImage(BLOB2.oroClaro, 0, 60, W, 520); g.restore();
    // sombras
    g.fillStyle = "rgba(0,0,0,.45)";
    for (const [x, r] of [[MACETA, 50], [BARRIL, 72], [COLUMNA, 46], [XR, 60]]) { g.beginPath(); g.ellipse(x, PIES, r, 8, 0, 0, 6.283); g.fill(); }
    pintarAvatar(g, e.mG, e.G, t);
    this.maceta(g, MACETA);
    this.barril(g, BARRIL);
    this.columna(g, COLUMNA);
    pintarAvatar(g, e.mR, e.R, t);
    g.restore();
    this.p.dibujar(g);
    // gotas de sudor de Guillermo en la columna
    if (t > 5.2 && t < 6.9) {
      const q = aPant(e.mG, [70, 26]), k = ((t - 5.2) * 1.4) % 1;
      g.fillStyle = `rgba(190,233,255,${1 - k})`; g.beginPath(); g.ellipse(q[0] + 6, q[1] + k * 40, 5, 8, 0, 0, 6.283); g.fill();
    }
    // los números de Rodrigo
    if (t > 0.6 && t < T_DIEZ + 0.6) {
      const n = Math.min(10, Math.floor((t - 0.6) / 0.56) + 1), t0 = 0.6 + (n - 1) * 0.56, d = t - t0;
      const k = eBack(tramo(d, 0, 0.16)), q = aPant(e.mR, [38, -6]);
      const fin = n === 10, a = fin ? 1 - tramo(t, T_DIEZ + 0.3, T_DIEZ + 0.6) : 1 - tramo(d, 0.4, 0.56);
      g.save(); g.translate(q[0], q[1] - 40); g.scale(k * (fin ? 1.3 : 1), k * (fin ? 1.3 : 1)); g.rotate(0.08 * Math.sin(n));
      txt(g, fin ? "¡DIEZ!" : String(n), 0, 0, { tam: 64, peso: 900, fam: FD, color: "#fffdf5", borde: "#2a1d10", bordeAncho: 9, alfa: luz * a, esp: 2 });
      g.restore();
    }
    // ¡TE PILLÉ!
    if (t > T_PILLA) {
      const d = t - T_PILLA, k = tramo(d, 0, 0.16), s = lerp(2.6, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 8));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * luz; g.translate(512, 112); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    if (luz < 1) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (this._tit) return this._tit;
    const c = lienzoNuevo(860, 220), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 160);
    gr.addColorStop(0, "#f2fff4"); gr.addColorStop(0.5, "#7dff9a"); gr.addColorStop(1, "#1fc94a");
    txt(g, "¡TE PILLÉ!", 430, 160, { tam: 140, peso: 400, fam: FC, color: gr, borde: "#06331a", bordeAncho: 14, esp: 5, glow: "rgba(43,255,91,.7)", glowTam: 24, max: 820 });
    return (this._tit = c);
  }
}

registrar({ id: "00133", nombre: "Escondite", crear: () => new Escondite() });
})();
