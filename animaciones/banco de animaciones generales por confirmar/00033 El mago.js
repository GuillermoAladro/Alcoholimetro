"use strict";
/*
 * 00033 · EL MAGO
 *
 * Animación del banco. Empieza y acaba en negro.
 * En un escenario con telón, señala la mesita y su sombrero de copa salta de la cabeza y cae boca abajo en ella.
 * Mete la mano y saca una caña (la pasa a la otra mano). Luego tira de un pañuelo de colores que no se acaba nunca
 * (cuerda de verdad: cuelga y se amontona en el suelo). Del sombrero sale una paloma que da una vuelta, le quita la
 * caña de la mano y se la lleva volando. Él abre los brazos como si fuera parte del truco: ¡TACHÁN!
 */
(() => {
const X = 390, ESC = 1.6;
const TX = 520, ALTO_S = 50 * ESC;       // sombrero: x de la boca y alto de la copa
const MESA = 462;                        // superficie de la mesita
const BOCA_Y = MESA - ALTO_S;            // boca del sombrero (boca abajo en la mesa)
const L = 11;                            // largo de cada pañuelo
const COLORES = ["#ff3d84", "#ffd34d", "#2fe3e8", "#2bff5b", "#b46bff", "#ff7a2f"];
const TIRONES = [[3.55, 4.05], [4.25, 4.68], [4.82, 5.18], [5.3, 5.6], [5.72, 6.0], [6.1, 6.35]];
const VUELO = [ // paloma: t, x, y
  [6.9, TX, BOCA_Y + 4], [7.1, 545, 250], [7.35, 660, 170], [7.6, 735, 250], [7.82, 620, 330], [8.0, 430, 320],
  [8.15, 322, 296], [8.35, 250, 230], [8.6, 150, 130], [8.85, 30, 40], [9.1, -130, -70],
];
const cache = cacheTexto();

const aAv = (p) => [(p[0] - X) / ESC + 39, 232 - (PIES - p[1]) / ESC];
function manoReal(T) {
  const b = ik(RIG.hombroD, T, RIG.L1, RIG.L2);
  return [b.E[0] + Math.cos(b.a2) * RIG.L2, b.E[1] + Math.sin(b.a2) * RIG.L2];
}
function camino(C, t) {
  if (t <= C[0][0]) return [C[0][1], C[0][2]];
  let i = 0;
  while (i < C.length - 2 && t > C[i + 1][0]) i++;
  const p0 = C[Math.max(0, i - 1)], p1 = C[i], p2 = C[i + 1], p3 = C[Math.min(C.length - 1, i + 2)];
  const u = clamp((t - p1[0]) / (p2[0] - p1[0]), 0, 1), u2 = u * u, u3 = u2 * u;
  const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
  return [cr(p0[1], p1[1], p2[1], p3[1]), cr(p0[2], p1[2], p2[2], p3[2])];
}

/** Sombrero de copa; (x, y) = centro del ala. Boca abajo (rot ≈ π) se ve la boca oscura. */
function sombrero(g, x, y, rot, s) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  const gr = g.createLinearGradient(-23, 0, 23, 0);
  gr.addColorStop(0, "#050506"); gr.addColorStop(0.35, "#2a2a30"); gr.addColorStop(0.55, "#4a4a55"); gr.addColorStop(1, "#060607");
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(-21, -2); g.lineTo(-23, -50); g.lineTo(23, -50); g.lineTo(21, -2); g.closePath(); g.fill();
  g.fillStyle = "#3b3b44"; g.beginPath(); g.ellipse(0, -50, 23, 4.5, 0, 0, 6.283); g.fill();
  g.fillStyle = "#b3122e"; g.fillRect(-21.4, -13, 42.8, 7);
  g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(-21.4, -13, 42.8, 1.5);
  g.fillStyle = "#16161a"; g.beginPath(); g.ellipse(0, 0, 33, 6.5, 0, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(255,255,255,.22)"; g.lineWidth = 1.2; g.beginPath(); g.ellipse(0, 0, 33, 6.5, 0, 0.15, Math.PI - 0.15); g.stroke();
  if (Math.cos(rot) < -0.3) { g.fillStyle = "#020203"; g.beginPath(); g.ellipse(0, 0, 21, 4.2, 0, 0, 6.283); g.fill(); }
  g.restore();
}
/** Caña (vaso alto) que se sujeta por abajo; (x, y) = la mano. Unidades de avatar. */
function cana(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.moveTo(-6, 6); g.lineTo(-7.5, -24); g.lineTo(7.5, -24); g.lineTo(6, 6); g.closePath();
  g.fillStyle = "rgba(210,230,255,.2)"; g.fill();
  g.save(); g.clip();
  const gr = g.createLinearGradient(0, 6, 0, -18);
  gr.addColorStop(0, "#c46a00"); gr.addColorStop(1, "#ffc21f");
  g.fillStyle = gr; g.fillRect(-8, -18, 16, 24);
  g.fillStyle = "rgba(255,245,200,.7)";
  for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-3 + i * 2.2, 3 - ((i * 5.3) % 18), 0.7, 0, 6.283); g.fill(); }
  g.restore();
  g.fillStyle = "#fffaf0"; g.beginPath(); g.moveTo(-7.5, -17);
  for (let i = 0; i <= 3; i++) g.arc(-7.5 + i * 5, -19, 3 + (i % 2) * 0.8, Math.PI, 0);
  g.lineTo(7.5, -17); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-6, 6); g.lineTo(-7.5, -24); g.lineTo(7.5, -24); g.lineTo(6, 6); g.closePath();
  g.strokeStyle = "rgba(235,245,255,.9)"; g.lineWidth = 1.2; g.stroke();
  g.fillStyle = "rgba(255,255,255,.4)"; g.fillRect(-5, -15, 1.4, 18);
  g.restore();
}
/** Paloma; dir 1 mira a la derecha. */
function paloma(g, x, y, s, fase, dir) {
  g.save(); g.translate(x, y); g.scale(s * dir, s);
  const ala = (delante) => {
    const a = Math.sin(fase) * 0.9 - 0.2;
    g.save(); g.translate(-2, -5); g.rotate(-a * (delante ? 1 : 0.8)); g.scale(1, delante ? 1 : 0.85);
    g.fillStyle = delante ? "#ffffff" : "#c9ccd6";
    g.beginPath(); g.moveTo(-6, 0); g.quadraticCurveTo(-12, -26, -30, -30); g.quadraticCurveTo(-18, -14, -20, -8); g.quadraticCurveTo(-10, -4, 6, 2); g.closePath(); g.fill();
    g.strokeStyle = "rgba(120,125,140,.6)"; g.lineWidth = 1; g.beginPath(); g.moveTo(-14, -18); g.lineTo(-22, -24); g.moveTo(-10, -10); g.lineTo(-20, -14); g.stroke();
    g.restore();
  };
  ala(false);
  g.fillStyle = "#e8eaf0"; g.beginPath(); g.moveTo(-16, 0); g.lineTo(-30, -4); g.lineTo(-31, 6); g.lineTo(-16, 5); g.closePath(); g.fill();
  const gr = g.createLinearGradient(0, -10, 0, 10);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(1, "#c6cad6");
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 19, 10, -0.1, 0, 6.283); g.fill();
  g.beginPath(); g.arc(15, -8, 8, 0, 6.283); g.fill();
  g.fillStyle = "#ff9d1c"; g.beginPath(); g.moveTo(22, -10); g.lineTo(29, -7); g.lineTo(22, -5); g.closePath(); g.fill();
  g.fillStyle = "#111"; g.beginPath(); g.arc(17, -10, 1.6, 0, 6.283); g.fill();
  g.strokeStyle = "#e08a1a"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-2, 9); g.lineTo(-2, 14); g.moveTo(3, 9); g.lineTo(3, 14); g.stroke();
  ala(true);
  g.restore();
}
function titulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(760, 220), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 170);
  gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff9a1f");
  txt(g, "¡TACHÁN!", 380, 165, { tam: 160, peso: 400, fam: FC, color: gr, borde: "#4a1a00", bordeAncho: 13, esp: 6, glow: "rgba(255,190,60,.8)", glowTam: 26 });
  cache.set("t", c);
  return c;
}
let _telon = null;
function telon() {
  if (_telon) return _telon;
  const c = lienzoNuevo(130, H), g = c.getContext("2d");
  for (let i = 0; i < 6; i++) {
    const x = i * 22;
    const gr = g.createLinearGradient(x, 0, x + 22, 0);
    gr.addColorStop(0, "#3d0610"); gr.addColorStop(0.5, "#b0172e"); gr.addColorStop(1, "#3d0610");
    g.fillStyle = gr; g.fillRect(x, 0, 23, H);
  }
  return (_telon = c);
}

class EscenaMago extends Escena {
  constructor() {
    super(10.8);
    this.p = new Parts(360);
    this.cuerda = null; this.agarre = -1;
  }
  sombrero(t, e) {
    const cabeza = () => {
      const r = rot2([0, 6 - RIG.cuello[1]], e.pose.rc);
      return aPant(e.m, [RIG.cuello[0] + r[0], RIG.cuello[1] + r[1]]);
    };
    if (t < 1.0) { const q = cabeza(); return { x: q[0], y: q[1], rot: e.pose.rc }; }
    const k = tramo(t, 1.0, 1.55);
    if (k < 1) {
      const a = aPant(matAv(X, PIES, ESC), [39, 6]);
      return { x: lerp(a[0], TX, eInOut(k)), y: lerp(a[1], BOCA_Y, k) - 150 * 4 * k * (1 - k), rot: Math.PI * eInOut(k) };
    }
    let rot = Math.PI, y = BOCA_Y;
    if (t > 6.45 && t < 6.9) rot += 0.1 * Math.sin(t * 50) * tramo(t, 6.45, 6.6);
    if (t > 6.9 && t < 7.15) y -= 16 * Math.sin(tramo(t, 6.9, 7.15) * Math.PI);
    if (k < 1.0001 && t < 1.75) y += 5 * Math.sin(tramo(t, 1.55, 1.75) * Math.PI);
    return { x: TX, y, rot };
  }
  manoTirones(t) {
    const HAT = aAv([TX + 2, BOCA_Y + 8]), ARR = [97, 34];
    for (let i = 0; i < TIRONES.length; i++) {
      const [a, b] = TIRONES[i];
      if (t >= a && t <= b) return { T: mezcla(HAT, ARR, eInOut((t - a) / (b - a))), agarra: true, i };
      const sig = TIRONES[i + 1];
      if (sig && t > b && t < sig[0]) return { T: mezcla(ARR, HAT, eInOut((t - b) / (sig[0] - b))), agarra: false, i };
    }
    return null;
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let manoD = [70, 158], manoI = [9, 160], dy = 0;
    const HAT = aAv([TX + 2, BOCA_Y + 8]);
    if (t < 1.0) pose.cara = "guino";
    // señala la mesa y el sombrero salta
    const kS = eInOut(tramo(t, 0.55, 0.85)) * (1 - eInOut(tramo(t, 1.5, 1.8)));
    manoD = mezcla(manoD, [126, 118], kS);
    if (t > 0.85 && t < 1.05) pose.rc = 0.04 * Math.sin(tramo(t, 0.85, 1.05) * Math.PI);
    // pases mágicos sobre el sombrero y saca la caña
    if (t > 1.8 && t < 2.5) {
      const k = eInOut(tramo(t, 1.8, 2.0));
      manoD = mezcla(manoD, [HAT[0] - 6 + 9 * Math.sin(t * 16), HAT[1] - 30 + 4 * Math.cos(t * 16)], k);
      pose.cara = "guino";
    }
    if (t >= 2.5 && t < 2.7) manoD = mezcla([HAT[0] - 6, HAT[1] - 30], HAT, eInOut(tramo(t, 2.5, 2.65)));
    if (t >= 2.7 && t < 3.0) { manoD = mezcla(HAT, [80, 62], eOut(tramo(t, 2.7, 2.95))); pose.cara = "risa"; }
    if (t >= 3.0 && t < 3.55) {
      // la pasa a la otra mano
      const k1 = eInOut(tramo(t, 3.05, 3.25)), k2 = eInOut(tramo(t, 3.3, 3.5));
      manoD = mezcla(mezcla([80, 62], [46, 112], k1), HAT, k2);
      manoI = mezcla(mezcla(manoI, [30, 114], k1), [-4, 118], k2);
      pose.cara = "risa";
    }
    const caI = t >= 3.28; // la caña ya en la mano izquierda
    if (t >= 3.5) manoI = [-4 + 1.5 * Math.sin(t * 2), 118];
    // pañuelos
    const tir = this.manoTirones(t);
    if (tir) {
      manoD = tir.T;
      pose.cara = tir.i < 2 ? "risa" : tir.i < 4 ? "sorpresa" : "borracho";
      pose.rc = tir.i >= 3 ? 0.05 * Math.sin(t * 9) : 0;
    }
    if (t > 6.35 && t < 6.9) { manoD = mezcla([97, 34], [74, 150], eInOut(tramo(t, 6.35, 6.65))); pose.cara = "dormido"; }
    // la paloma
    if (t >= 6.9 && t < 8.85) { pose.cara = "sorpresa"; manoD = [72, 150]; }
    if (t > 8.15 && t < 8.85) manoI = mezcla(manoI, [-22, 60], eOut(tramo(t, 8.15, 8.4)));
    // ¡TACHÁN!
    if (t >= 8.85) {
      const k = eBack(tramo(t, 8.85, 9.15));
      manoD = mezcla([72, 150], [120, 66], k); manoI = mezcla([-22, 60], [-42, 66], k);
      pose.cara = "risa"; dy = -6 * Math.sin(tramo(t, 8.85, 9.15) * Math.PI);
    }
    pose.manoD = manoD; pose.manoI = manoI;
    if (t >= 2.7 && t < 3.28) pose.objD2 = (g, mm) => cana(g, mm[0] + 1, mm[1] - 2);
    if (caI && t < 8.15) pose.objI2 = (g, mm) => cana(g, mm[0] - 1, mm[1] - 2);
    const m = matAv(X, PIES + dy, ESC);
    return { pose, m };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, e = this.estado();
    this.una("salta", t > 1.0, () => { const q = aPant(e.m, [39, 0]); for (let i = 0; i < 10; i++) p.nueva(P.PURPURINA, q[0] + azar(-40, 40), q[1] + azar(-20, 10), azar(-60, 60), azar(-80, 0), azar(0.5, 0.9), azar(6, 10)); });
    this.una("cae", t > 1.55, () => { temblar(5, 0.15); for (let i = 0; i < 12; i++) p.nueva(P.POLVO, TX + azar(-30, 30), BOCA_Y - 4, azar(-120, 120), azar(-60, -10), azar(0.4, 0.7), azar(16, 26)); });
    if (t > 1.8 && t < 2.5 && Math.random() < 30 * dt) p.nueva(P.PURPURINA, TX + azar(-40, 40), BOCA_Y - azar(10, 70), azar(-30, 30), azar(-30, 20), azar(0.5, 0.9), azar(6, 11));
    this.una("cana", t > 2.72, () => {
      for (let i = 0; i < 26; i++) { const a = azar(-Math.PI, 0), v = azar(150, 380); p.nueva(P.CHISPA, TX, BOCA_Y - 10, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(7, 12)); }
      p.nueva(P.DESTELLO, TX, BOCA_Y - 20, 0, 0, 0.3, 110);
    });
    // la cuerda de pañuelos (verlet)
    if (t > 3.5 && !this.cuerda) this.cuerda = [{ x: TX, y: BOCA_Y, px: TX, py: BOCA_Y }, { x: TX, y: BOCA_Y - 4, px: TX, py: BOCA_Y - 4 }];
    if (this.cuerda) this.simular(dt, e);
    this.una("paloma", t > 6.9, () => {
      temblar(10, 0.3);
      for (let i = 0; i < 26; i++) p.nueva(P.VAPOR, TX + azar(-30, 30), BOCA_Y - azar(0, 30), azar(-160, 160), azar(-220, -40), azar(0.5, 1.0), azar(24, 44));
      p.nueva(P.DESTELLO, TX, BOCA_Y - 20, 0, 0, 0.35, 160);
    });
    if (t > 6.9 && t < 9.0 && Math.random() < 6 * dt) { const q = camino(VUELO, t); p.nueva(P.VAPOR, q[0], q[1], azar(-30, 30), azar(10, 40), azar(0.6, 1), azar(5, 8)); }
    this.una("roba", t > 8.15, () => { const q = camino(VUELO, t); for (let i = 0; i < 10; i++) p.nueva(P.ESPUMA, q[0], q[1] + 40, azar(-100, 100), azar(-160, -40), azar(0.4, 0.7), azar(4, 7)); });
    this.una("tachan", t > 8.9, () => {
      temblar(12, 0.3);
      for (let i = 0; i < 40; i++) { const a = azar(-Math.PI, 0), v = azar(250, 600); p.nueva(P.CHISPA, W / 2, 140, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.9), azar(8, 14)); }
    });
    if (t > 9.0 && t < 10.2 && Math.random() < 20 * dt) p.nueva(P.PURPURINA, azar(150, 870), azar(0, 120), azar(-20, 20), azar(30, 70), azar(0.8, 1.3), azar(6, 12));
    p.actualizar(dt);
  }
  simular(dt, e) {
    const C = this.cuerda, t = this.t, tir = this.manoTirones(t);
    const agarra = tir && tir.agarra;
    if (agarra && this.agarre < 0) this.agarre = 1;
    if (!agarra) this.agarre = -1;
    let mano = null;
    if (this.agarre > 0) {
      mano = aPant(e.m, manoReal(e.pose.manoD));
      // sale más pañuelo del sombrero si hace falta
      const D = Math.hypot(mano[0] - C[0].x, mano[1] - C[0].y);
      while (this.agarre * L < D * 1.06 && C.length < 130) {
        const q = { x: lerp(C[0].x, C[1].x, 0.5), y: lerp(C[0].y, C[1].y, 0.5) };
        q.px = q.x; q.py = q.y;
        C.splice(1, 0, q); this.agarre++;
      }
    }
    const sub = 2, h = dt / sub;
    for (let s = 0; s < sub; s++) {
      for (let i = 1; i < C.length; i++) {
        const q = C[i], vx = (q.x - q.px) * 0.985, vy = (q.y - q.py) * 0.985;
        q.px = q.x; q.py = q.y; q.x += vx; q.y += vy + 1400 * h * h;
      }
      for (let it = 0; it < 8; it++) {
        C[0].x = TX; C[0].y = BOCA_Y;
        if (mano) { C[this.agarre].x = mano[0]; C[this.agarre].y = mano[1]; }
        for (let i = 0; i < C.length - 1; i++) {
          const a = C[i], b = C[i + 1], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.001, dif = (d - L) / d;
          const fa = i === 0 || (mano && i === this.agarre) ? 0 : 0.5, fb = mano && i + 1 === this.agarre ? 0 : 0.5;
          const tot = fa + fb; if (!tot) continue;
          a.x += dx * dif * (fa / tot); a.y += dy * dif * (fa / tot);
          b.x -= dx * dif * (fb / tot); b.y -= dy * dif * (fb / tot);
        }
        // suelo, mesa y sombrero
        for (let i = 2; i < C.length; i++) {
          const q = C[i];
          if (q.y > PIES - 5) { q.y = PIES - 5; q.px = lerp(q.px, q.x, 0.5); }
          if (q.x > 440 && q.x < 640 && q.y > MESA - 4 && q.y < MESA + 46) {
            if (q.py <= MESA - 2) { q.y = MESA - 4; q.py = q.y; q.px = lerp(q.px, q.x, 0.5); } // se posa en la mesa
            else { q.x = q.x < 540 ? 440 : 640; q.px = q.x; }                                 // por debajo: al lado
          }
          if (i > 4 && q.x > TX - 36 && q.x < TX + 36 && q.y > BOCA_Y - 3 && q.y < MESA) {
            if (q.py <= BOCA_Y) { q.y = BOCA_Y - 3; q.py = q.y; }                    // sobre el ala
            else { q.x = q.x < TX ? TX - 36 : TX + 36; q.px = q.x; }
          }
        }
      }
    }
  }
  dibujarCuerda(g) {
    const C = this.cuerda; if (!C || C.length < 2) return;
    g.save(); g.lineJoin = "round";
    for (let i = C.length - 1; i >= 1; i--) {
      const a = C[i - 1], b = C[i], ang = Math.atan2(b.y - a.y, b.x - a.x);
      g.save(); g.translate((a.x + b.x) / 2, (a.y + b.y) / 2); g.rotate(ang + Math.PI / 4);
      g.fillStyle = COLORES[(C.length - 1 - i) % COLORES.length];
      g.fillRect(-7, -7, 14, 14);
      g.strokeStyle = "rgba(0,0,0,.3)"; g.lineWidth = 1.2; g.strokeRect(-7, -7, 14, 14);
      g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(-7, -7, 14, 3);
      g.restore();
    }
    g.restore();
  }
  dibujarMesa(g) {
    // pie y peana
    g.fillStyle = "#2a1a10"; g.fillRect(TX + 14, MESA + 40, 14, PIES - MESA - 50);
    g.fillStyle = "#1a100a"; g.beginPath(); g.ellipse(TX + 21, PIES - 6, 46, 9, 0, 0, 6.283); g.fill();
    // tablero con faldón rojo y flecos dorados
    const gr = g.createLinearGradient(440, 0, 640, 0);
    gr.addColorStop(0, "#5a0614"); gr.addColorStop(0.5, "#c01a33"); gr.addColorStop(1, "#5a0614");
    g.fillStyle = gr; g.beginPath(); g.moveTo(446, MESA); g.lineTo(636, MESA); g.lineTo(646, MESA + 44); g.lineTo(436, MESA + 44); g.closePath(); g.fill();
    g.fillStyle = "#ffd34d";
    for (let x = 440; x <= 642; x += 10) { g.beginPath(); g.moveTo(x - 4, MESA + 43); g.lineTo(x + 4, MESA + 43); g.lineTo(x, MESA + 54); g.closePath(); g.fill(); }
    g.fillStyle = "#e0b84a"; g.fillRect(436, MESA + 40, 210, 4);
    g.fillStyle = "#7a0c1e"; g.beginPath(); g.ellipse(541, MESA, 96, 9, 0, 0, 6.283); g.fill();
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    const luz = 1 - tramo(t, 10.1, 10.75);
    foco(g, X + 80, X + 80, PIES, 280, luz);
    this.dibujarMesa(g);
    const S = this.sombrero(t, e);
    if (t >= 1.0) sombrero(g, S.x, S.y, S.rot, ESC);
    pintarAvatar(g, e.m, e.pose, t);
    if (t < 1.0) sombrero(g, S.x, S.y, S.rot, ESC);
    this.dibujarCuerda(g);
    // la paloma (y la caña robada)
    if (t > 6.9 && t < 9.2) {
      const q = camino(VUELO, t), q2 = camino(VUELO, t + 0.03), dir = q2[0] >= q[0] ? 1 : -1;
      const s = lerp(0.4, 1.5, eOut(tramo(t, 6.9, 7.1)));
      if (t > 8.15) { g.save(); g.translate(q[0], q[1] + 12 + 26 * 1.5); g.rotate(0.15 * Math.sin(t * 9)); cana(g, 0, 0, 1.5); g.restore(); }
      paloma(g, q[0], q[1], s, t * 26, dir);
    }
    this.p.dibujar(g);
    // gota de sudor en el ¡TACHÁN!
    if (t > 9.2) {
      const q = aPant(e.m, [70, 14 + 6 * tramo(t, 9.2, 10.2)]);
      g.save(); g.globalAlpha = Math.min(1, (t - 9.2) * 4); g.fillStyle = "#9fe6ff";
      g.beginPath(); g.moveTo(q[0], q[1] - 12); g.quadraticCurveTo(q[0] + 8, q[1] + 2, q[0], q[1] + 5); g.quadraticCurveTo(q[0] - 8, q[1] + 2, q[0], q[1] - 12); g.fill();
      g.fillStyle = "#fff"; g.fillRect(q[0] - 2.5, q[1] - 2, 2, 4); g.restore();
    }
    // telón a los lados
    const T = telon();
    g.drawImage(T, -10, 0); g.save(); g.translate(W + 10, 0); g.scale(-1, 1); g.drawImage(T, 0, 0); g.restore();
    g.fillStyle = "#7a0c1e"; g.fillRect(0, 0, W, 26);
    g.fillStyle = "#a3142b";
    for (let x = 0; x < W; x += 64) { g.beginPath(); g.arc(x + 32, 26, 32, 0, Math.PI); g.fill(); }
    g.fillStyle = "#e0b84a"; for (let x = 0; x < W; x += 64) { g.beginPath(); g.arc(x + 32, 56, 4, 0, 6.283); g.fill(); }
    // ¡TACHÁN!
    if (t > 8.88) {
      const k = tramo(t, 8.88, 9.05), s = lerp(2.8, 1, eIn(k)), a = Math.min(1, k * 4);
      const Ti = titulo();
      g.save(); g.globalAlpha = a; g.translate(W / 2 + 40, 140); g.rotate(-0.05); g.scale(s * 0.8, s * 0.8); g.drawImage(Ti, -Ti.width / 2, -Ti.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0, 0.4), tramo(t, this.dur - 0.45, this.dur - 0.02));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00033", nombre: "El mago", crear: () => new EscenaMago() });
})();
