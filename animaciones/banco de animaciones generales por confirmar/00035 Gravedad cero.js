"use strict";
/*
 * 00035 · GRAVEDAD CERO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Entre estrellas y planetas entra flotando con casco de astronauta. Abre una lata (¡PSST!): la cerveza sale en bolas
 * doradas que flotan y tiemblan. La lata se le escapa dando vueltas. Va nadando por el aire y se come las bolas una a
 * una (boca abierta, ¡GLUP!). Con la última suelta un eructo (¡BURP!) que le hace dar una voltereta: GRAVEDAD CERO.
 * Se aleja flotando y las estrellas se apagan.
 */
(() => {
const ESC = 1.28;
const T_ABRE = 2.4;
const COMER = [[3.5, 540, 185], [4.45, 720, 285], [5.35, 560, 330], [6.25, 380, 250], [7.2, 600, 215]]; // t, x, y de la boca
const RADIOS = [20, 16, 22, 15, 27];
const BOCA_REL = [0, (55 - 116) * ESC]; // la boca respecto al centro del cuerpo (sin giro)
const cache = cacheTexto();

function titulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(900, 170), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 30, 0, 130);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.55, "#bfefff"); gr.addColorStop(1, "#5ec8ff");
  txt(g, "GRAVEDAD CERO", 450, 118, { tam: 108, peso: 900, fam: FD, color: gr, borde: "#06223d", bordeAncho: 10, esp: 8, glow: "rgba(90,190,255,.9)", glowTam: 26 });
  cache.set("t", c);
  return c;
}
let _cielo = null;
function cielo() {
  if (_cielo) return _cielo;
  const r = semilla(35), estrellas = [];
  for (let i = 0; i < 150; i++) estrellas.push({ x: r() * (W + 200), y: r() * H, z: 0.2 + r() * 0.8, f: r() * 6.283, s: 0.6 + r() * 1.6 });
  return (_cielo = estrellas);
}

class EscenaCero extends Escena {
  constructor() {
    super(11.0);
    this.p = new Parts(260);
    this.bolas = []; this.gotas = []; this.lata = null; this.comidas = 0;
  }
  /** Boca (pantalla) en el instante t: va de bola en bola. */
  boca(t) {
    const ent = [lerp(-140, 330, eOut(tramo(t, 0, 2.0))), 230 + 20 * Math.sin(t * 1.3)];
    if (t < T_ABRE) return ent;
    // retroceso al abrir la lata
    const ab = [330 - 40 * eOut(tramo(t, T_ABRE, 3.0)), 230 + 20 * Math.sin(T_ABRE * 1.3)];
    let prev = ab, t0 = 2.85;
    for (const [tc, x, y] of COMER) {
      if (t < tc) return mezcla(prev, [x, y], eInOut(tramo(t, t0, tc)));
      prev = [x, y]; t0 = tc + 0.12;
    }
    if (t < 7.7) return [prev[0], prev[1] + 6 * Math.sin((t - 7.2) * 4)];
    // eructo: sale disparado hacia atrás dando vueltas y luego se aleja
    const s = t - 7.7;
    return [prev[0] - 180 * eOut(Math.min(1, s / 1.2)) + (t > 9.0 ? 420 * eIn(tramo(t, 9.0, 10.6)) : 0), prev[1] + 60 * eOut(Math.min(1, s / 1.2)) - (t > 9.0 ? 260 * eIn(tramo(t, 9.0, 10.6)) : 0)];
  }
  giro(t) {
    let g = 0.18 * Math.sin(t * 0.9) - 0.35 * (1 - eOut(tramo(t, 0, 2.0)));
    if (t > T_ABRE) g += -0.25 * Math.sin(Math.min(1, (t - T_ABRE) / 0.6) * Math.PI);
    if (t > 7.7) g -= 2 * Math.PI * eOut(tramo(t, 7.7, 8.9));
    if (t > 9.0) g -= 0.8 * (t - 9.0);
    return g;
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0.06 * Math.sin(t * 1.7), piernaI: [-2, 0.16 + 0.06 * Math.sin(t * 1.6)], piernaD: [-4, -0.12 + 0.06 * Math.sin(t * 1.9)] };
    // brazos flotando / nadando
    const nada = t > 2.9 && t < 7.3 ? 1 : 0;
    let manoD = [84 + 5 * Math.sin(t * 2), 118 + 6 * Math.cos(t * 1.7)];
    let manoI = [-6 + 5 * Math.sin(t * 2.2 + 1), 120 + 6 * Math.cos(t * 1.5)];
    if (nada) { manoD = [92 + 10 * Math.sin(t * 5), 96 + 18 * Math.cos(t * 5)]; manoI = [-14 - 10 * Math.sin(t * 5), 96 + 18 * Math.cos(t * 5)]; }
    // la lata: la tiene en la mano hasta que se le escapa
    if (t < 3.0) {
      const k = eInOut(tramo(t, 1.7, 2.1));
      manoD = mezcla(manoD, [74, 112], k);
      const ab = t > T_ABRE;
      pose.objD = (g, mm) => dibujarLata(g, mm[0], mm[1] - 2, ab ? -0.2 * Math.sin(t * 30) * (1 - tramo(t, T_ABRE, 2.9)) : 0, { abierta: ab });
    }
    if (t > 1.7 && t < T_ABRE) pose.cara = "guino";
    if (t >= T_ABRE && t < 2.9) pose.cara = "sorpresa";
    // boca abierta al acercarse a cada bola; contento al tragarla
    for (const [tc] of COMER) {
      if (t > tc - 0.4 && t <= tc) pose.cara = "sorpresa";
      if (t > tc && t < tc + 0.35) pose.cara = "risa";
    }
    if (t > 7.35 && t < 7.7) { pose.cara = "dormido"; manoI = mezcla(manoI, [32, 132], eInOut(tramo(t, 7.35, 7.5))); }
    if (t >= 7.7 && t < 9.0) { pose.cara = "sorpresa"; manoD = [100, 70]; manoI = [-24, 70]; }
    if (t >= 9.0) { pose.cara = "risa"; manoD = [98, 60 + 8 * Math.sin(t * 6)]; }
    pose.manoD = manoD; pose.manoI = manoI;
    const giro = this.giro(t), b = this.boca(t), r = rot2(BOCA_REL, giro);
    const c = [b[0] - r[0], b[1] - r[1]];
    const m = matAv(c[0], c[1], ESC, giro, 1, 1, [39, 116]);
    return { pose, m, giro, c };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, e = this.estado();
    // ¡PSST!: la cerveza sale en bolas
    this.una("abre", t > T_ABRE, () => {
      const q = aPant(e.m, [74, 96]);
      temblar(6, 0.2);
      COMER.forEach(([tc, x, y], i) => {
        const dur = tc - 0.15 - T_ABRE;
        this.bolas.push({ x0: q[0], y0: q[1], vx: (x - q[0]) / dur, vy: (y - q[1]) / dur, r: RADIOS[i], f: i * 1.7, tc, i });
      });
      for (let i = 0; i < 26; i++) { const a = azar(0, 6.283), v = azar(30, 140); this.gotas.push({ x: q[0], y: q[1], vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: azar(2, 5), v: azar(1.2, 2.2) }); }
      for (let i = 0; i < 12; i++) p.nueva(P.ESPUMA, q[0], q[1], azar(-120, 120), azar(-200, -40), azar(0.3, 0.6), azar(4, 8));
    });
    // la lata se le escapa
    this.una("suelta", t > 3.0, () => { const q = aPant(e.m, [74, 110]); this.lata = { x: q[0], y: q[1], vx: -60, vy: 70, r: e.giro, vr: 2.2 }; });
    if (this.lata) { const L = this.lata; L.x += L.vx * dt; L.y += L.vy * dt; L.r += L.vr * dt; }
    for (const d of this.gotas) { d.x += d.vx * dt; d.y += d.vy * dt; d.v -= dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    COMER.forEach(([tc], i) => this.una("glup" + i, t > tc, () => {
      this.comidas++;
      const q = aPant(e.m, boca(e.pose.rc));
      for (let k = 0; k < 8; k++) { const a = azar(0, 6.283), v = azar(40, 120); this.gotas.push({ x: q[0], y: q[1], vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: azar(1.5, 3.5), v: azar(0.8, 1.4) }); }
      temblar(3, 0.12);
    }));
    this.una("burp", t > 7.7, () => {
      temblar(16, 0.4);
      const q = aPant(e.m, boca(e.pose.rc));
      this.onda = { x: q[0], y: q[1], t0: t };
      for (let k = 0; k < 18; k++) p.nueva(P.VAPOR, q[0], q[1], azar(40, 220), azar(-120, 120), azar(0.5, 1.0), azar(14, 26));
    });
    this.una("titulo", t > 8.05, () => temblar(12, 0.3));
    if (t > 5.5 && t < 5.9) this.fugaz = (t - 5.5) / 0.4;
    p.actualizar(dt);
  }
  posBola(B, t) {
    const s = Math.min(t, B.tc - 0.15) - T_ABRE;
    let x = B.x0 + B.vx * s + 6 * Math.sin(t * 1.6 + B.f), y = B.y0 + B.vy * s + 6 * Math.cos(t * 1.3 + B.f);
    let r = B.r * Math.min(1, (t - T_ABRE) * 5);
    if (t > B.tc - 0.15) { // se la come
      const k = tramo(t, B.tc - 0.15, B.tc), e = this.estado(), q = aPant(e.m, boca(e.pose.rc));
      x = lerp(x, q[0], k); y = lerp(y, q[1], k); r *= 1 - 0.85 * k;
    }
    return [x, y, r];
  }
  dibujarBola(g, x, y, r, t, f) {
    const w = 1 + 0.09 * Math.sin(t * 7 + f), h = 1 - 0.09 * Math.sin(t * 7 + f);
    g.save(); g.translate(x, y); g.rotate(0.4 * Math.sin(t + f)); g.scale(w, h);
    const gr = g.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
    gr.addColorStop(0, "#fff0a8"); gr.addColorStop(0.45, "#ffbe2a"); gr.addColorStop(1, "#b55a00");
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.fill();
    g.strokeStyle = "rgba(255,240,190,.55)"; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = "rgba(255,255,255,.75)"; g.beginPath(); g.ellipse(-r * 0.38, -r * 0.42, r * 0.26, r * 0.15, -0.6, 0, 6.283); g.fill();
    g.fillStyle = "rgba(255,245,200,.7)";
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(r * (0.1 + 0.2 * i) - r * 0.2, r * (0.35 - 0.25 * i), Math.max(1, r * 0.07), 0, 6.283); g.fill(); }
    g.restore();
  }
  casco(g, e, delante) {
    conMat(g, e.m, () => {
      g.translate(RIG.cuello[0], RIG.cuello[1]); g.rotate(e.pose.rc); g.translate(-RIG.cuello[0], -RIG.cuello[1]);
      if (!delante) {
        const gr = g.createRadialGradient(28, 18, 6, 39, 31, 47);
        gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.7, "#d5dbe3"); gr.addColorStop(1, "#7f8a97");
        g.fillStyle = gr; g.beginPath(); g.arc(39, 31, 46, 0, 6.283); g.fill();
        g.strokeStyle = "#4d5560"; g.lineWidth = 1.6; g.stroke();
        g.fillStyle = "#1b1f26"; g.beginPath(); g.arc(39, 31, 39, 0, 6.283); g.fill(); // interior oscuro
        return;
      }
      // visera dorada subida
      const gv = g.createLinearGradient(0, -18, 0, 4);
      gv.addColorStop(0, "#fff3b0"); gv.addColorStop(0.5, "#e0a400"); gv.addColorStop(1, "#7a4d00");
      g.fillStyle = gv; g.beginPath(); g.arc(39, 31, 47, Math.PI + 0.42, 2 * Math.PI - 0.42); g.arc(39, 31, 39, 2 * Math.PI - 0.5, Math.PI + 0.5, true); g.closePath(); g.fill();
      g.strokeStyle = "rgba(60,40,0,.6)"; g.lineWidth = 1; g.stroke();
      g.fillStyle = "rgba(255,255,255,.6)"; g.beginPath(); g.ellipse(26, -9, 7, 2, -0.35, 0, 6.283); g.fill();
      // aro del cuello y lucecitas
      g.strokeStyle = "#cfd6de"; g.lineWidth = 7; g.beginPath(); g.ellipse(39, 77, 29, 7, 0, 0, Math.PI); g.stroke();
      g.strokeStyle = "#6c7783"; g.lineWidth = 2; g.beginPath(); g.ellipse(39, 80, 29, 7, 0, 0.1, Math.PI - 0.1); g.stroke();
      g.fillStyle = "#cfd6de"; g.fillRect(82, 22, 7, 16);
      g.fillStyle = Math.sin(this.t * 6) > 0 ? "#ff4d4d" : "#5a1010"; g.beginPath(); g.arc(85.5, 27, 2.4, 0, 6.283); g.fill();
      g.fillStyle = "#2bff5b"; g.beginPath(); g.arc(85.5, 33, 2, 0, 6.283); g.fill();
    });
  }
  dibujarFondo(g, t) {
    const luz = Math.min(tramo(t, 0, 0.8), 1 - tramo(t, 10.3, 10.95));
    if (luz <= 0) return;
    g.save(); g.globalAlpha = luz;
    // nebulosa
    g.globalCompositeOperation = "lighter";
    g.globalAlpha = 0.18 * luz; g.drawImage(BLOB2.cian, 380, -60, 700, 420); g.drawImage(BLOB.rojo, -140, 260, 560, 420);
    g.globalCompositeOperation = "source-over"; g.globalAlpha = luz;
    for (const s of cielo()) {
      const x = ((s.x - t * 14 * s.z) % (W + 200) + W + 200) % (W + 200) - 100;
      g.globalAlpha = luz * (0.45 + 0.55 * Math.abs(Math.sin(t * 1.5 * s.z + s.f)));
      g.fillStyle = "#fff"; g.fillRect(x, s.y, s.s * s.z * 1.6, s.s * s.z * 1.6);
    }
    g.globalAlpha = luz;
    // planeta grande abajo a la derecha
    const gp = g.createRadialGradient(830, 640, 40, 900, 760, 330);
    gp.addColorStop(0, "#69d3ff"); gp.addColorStop(0.55, "#1d6fb8"); gp.addColorStop(1, "#071a33");
    g.fillStyle = gp; g.beginPath(); g.arc(900, 790, 330, 0, 6.283); g.fill();
    g.strokeStyle = "rgba(140,220,255,.5)"; g.lineWidth = 5; g.beginPath(); g.arc(900, 790, 333, Math.PI * 1.05, Math.PI * 1.75); g.stroke();
    g.fillStyle = "rgba(255,255,255,.12)";
    g.beginPath(); g.ellipse(820, 540, 90, 14, -0.2, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(930, 600, 120, 18, -0.15, 0, 6.283); g.fill();
    // planeta con anillos abajo a la izquierda
    g.save(); g.translate(110, 480); g.rotate(-0.35);
    g.strokeStyle = "rgba(255,210,150,.55)"; g.lineWidth = 6; g.beginPath(); g.ellipse(0, 0, 90, 20, 0, Math.PI, 2 * Math.PI); g.stroke();
    const gs = g.createRadialGradient(-15, -15, 5, 0, 0, 48);
    gs.addColorStop(0, "#ffe2a8"); gs.addColorStop(1, "#a0582a");
    g.fillStyle = gs; g.beginPath(); g.arc(0, 0, 46, 0, 6.283); g.fill();
    g.strokeStyle = "rgba(255,210,150,.7)"; g.lineWidth = 6; g.beginPath(); g.ellipse(0, 0, 90, 20, 0, 0, Math.PI); g.stroke();
    g.restore();
    // estrella fugaz
    if (this.fugaz && this.fugaz < 1) {
      const k = this.fugaz, x = lerp(980, 640, k), y = lerp(40, 160, k);
      g.strokeStyle = `rgba(255,255,255,${0.8 * (1 - k)})`; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 90, y - 32); g.stroke();
    }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    this.dibujarFondo(g, t);
    // la lata que se va
    if (this.lata) { g.save(); g.translate(this.lata.x, this.lata.y); g.scale(ESC, ESC); dibujarLata(g, 0, 0, this.lata.r, { abierta: true }); g.restore(); }
    // gotitas
    g.save(); g.fillStyle = "#ffbe2a";
    for (const d of this.gotas) { g.globalAlpha = Math.min(1, d.v * 2); g.beginPath(); g.arc(d.x, d.y, d.r, 0, 6.283); g.fill(); }
    g.restore();
    this.casco(g, e, false);
    pintarAvatar(g, e.m, e.pose, t);
    this.casco(g, e, true);
    // bolas de cerveza
    for (const B of this.bolas) {
      if (t > B.tc) continue;
      const [x, y, r] = this.posBola(B, t);
      this.dibujarBola(g, x, y, r, t, B.f);
    }
    this.p.dibujar(g);
    // ¡PSST! y ¡GLUP!
    if (t > T_ABRE && t < T_ABRE + 0.8) {
      const q = aPant(e.m, [74, 60]), k = tramo(t, T_ABRE, T_ABRE + 0.12);
      g.save(); g.translate(q[0] + 70, q[1] - 40); g.rotate(0.12); g.scale(eBack(k), eBack(k));
      txt(g, "¡PSST!", 0, 0, { tam: 50, peso: 400, fam: FC, color: "#fff", borde: "#0a6b2a", bordeAncho: 8, alfa: 1 - tramo(t, T_ABRE + 0.55, T_ABRE + 0.8), esp: 2 });
      g.restore();
    }
    COMER.forEach(([tc], i) => {
      const s = t - tc; if (s < 0 || s > 0.6) return;
      const q = aPant(e.m, [39, 0]), k = tramo(s, 0, 0.1);
      g.save(); g.translate(q[0] + (i % 2 ? 80 : -80), q[1] - 20 - 30 * s); g.rotate(i % 2 ? 0.15 : -0.15); g.scale(eBack(k), eBack(k));
      txt(g, "¡GLUP!", 0, 0, { tam: 40, peso: 400, fam: FC, color: "#ffd34d", borde: "#4a2600", bordeAncho: 7, alfa: 1 - tramo(s, 0.4, 0.6), esp: 2 });
      g.restore();
    });
    // ¡BURP! con onda
    if (this.onda && t - this.onda.t0 < 0.9) {
      const s = t - this.onda.t0, k = s / 0.9;
      g.save(); g.strokeStyle = `rgba(200,240,255,${0.7 * (1 - k)})`; g.lineWidth = 6 * (1 - k) + 1;
      g.beginPath(); g.arc(this.onda.x, this.onda.y, 20 + 260 * eOut(k), -0.9, 0.9); g.stroke(); g.restore();
      const kk = tramo(s, 0, 0.1);
      g.save(); g.translate(this.onda.x + 120, this.onda.y - 50); g.rotate(0.1); g.scale(eBack(kk) * 1.1, eBack(kk) * 1.1);
      txt(g, "¡BURP!", 0, 0, { tam: 64, peso: 400, fam: FC, color: "#ffffff", borde: "#1b4f8a", bordeAncho: 9, alfa: 1 - tramo(s, 0.6, 0.9), esp: 3 });
      g.restore();
    }
    // GRAVEDAD CERO
    if (t > 8.0) {
      const k = tramo(t, 8.0, 8.15), s = lerp(2.6, 1, eIn(k)), a = Math.min(1, k * 4) * (1 - tramo(t, 10.2, 10.7));
      const T = titulo();
      g.save(); g.globalAlpha = a; g.translate(W / 2, 92); g.rotate(-0.03 * Math.sin(t * 1.2)); g.scale(s, s); g.drawImage(T, -T.width / 2, -T.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0, 0.35), tramo(t, this.dur - 0.45, this.dur - 0.02));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00035", nombre: "Gravedad cero", crear: () => new EscenaCero() });
})();
