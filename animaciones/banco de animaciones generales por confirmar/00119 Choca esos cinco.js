"use strict";
/*
 * 00119 · CHOCA ESOS CINCO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se encienden dos focos y entran Guillermo y Rodrigo. Van a chocar la mano y fallan: uno arriba y el otro abajo
 * (pasan de largo, ¿?), luego al revés, y luego se lían subiendo y bajando a la vez. Se ríen, se miran, toman
 * impulso y saltan a la vez: chocan arriba con una explosión de luz. ¡CHOCA! Se apagan los focos.
 */
(() => {
const ESC = 1.5, XG = 410, XR = 614;
const T_F1 = 1.5, T_F2 = 2.95, T_CHOCA = 6.17;
const CHOQUE = [512, 238];
const cache = cacheTexto();

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const u = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return lerp(k[i - 1][1], k[i][1], (k[i][2] || eInOut)(u)); }
  return k[k.length - 1][1];
}
function pista2(t, k) { return [pista(t, k.map((q) => [q[0], q[1][0], q[2]])), pista(t, k.map((q) => [q[0], q[1][1], q[2]]))]; }
/** Punto de la pantalla → unidades del avatar de la matriz m. */
function aUm(m, q) { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; }

const sw = (u) => u * u * (3 - 2 * u);
// mano derecha de Guillermo y mano izquierda de Rodrigo (pantalla)
const MG = [
  [1.0, [456, 464]], [1.3, [462, 300]], [1.38, [456, 304]], [1.62, [532, 292], eIn], [1.75, [536, 296], eOut],
  [2.35, [536, 296]], [2.6, [466, 442]], [2.78, [460, 444]], [3.0, [545, 440], eIn], [3.12, [548, 440], eOut],
  [3.75, [548, 440]], [3.95, [488, 300]], [4.2, [488, 440], sw], [4.45, [488, 300], sw], [4.7, [488, 440], sw],
  [5.4, [470, 410]], [5.8, [470, 340]], [T_CHOCA, [CHOQUE[0] - 9, CHOQUE[1]], eOut],
];
const MR = [
  [1.0, [568, 463]], [1.3, [560, 440]], [1.38, [566, 442]], [1.62, [478, 440], eIn], [1.75, [474, 440], eOut],
  [2.35, [474, 440]], [2.6, [556, 300]], [2.78, [562, 302]], [3.0, [480, 296], eIn], [3.12, [476, 300], eOut],
  [3.75, [476, 300]], [3.95, [536, 440]], [4.2, [536, 300], sw], [4.45, [536, 440], sw], [4.7, [536, 300], sw],
  [5.4, [554, 410]], [5.8, [554, 340]], [T_CHOCA, [CHOQUE[0] + 9, CHOQUE[1]], eOut],
];
// inclinación hacia el otro (el impulso del golpe que no llega)
const GIRO = [[1.5, 0], [1.66, 0.09, eOut], [2.1, 0], [2.95, 0], [3.1, 0.09, eOut], [3.55, 0], [5.85, 0], [T_CHOCA, 0.06], [6.5, 0]];
// salto final
function salto(t) {
  const agacha = eInOut(tramo(t, 5.55, 5.85)) * (1 - tramo(t, 5.85, 5.92));
  let y = 0;
  if (t > 5.88 && t < 6.5) { const u = (t - 5.88) / 0.62; y = -4 * 72 * u * (1 - u); }
  const aterriza = t > 6.5 ? Math.sin(tramo(t, 6.5, 6.75) * Math.PI) : 0;
  return { y, sy: 1 - 0.12 * agacha - 0.1 * aterriza + (t > 5.88 && t < 6.5 ? 0.05 : 0) };
}

function rayos() {
  if (cache.has("r")) return cache.get("r");
  const S = 1100, c = lienzoNuevo(S, S), g = c.getContext("2d");
  g.translate(S / 2, S / 2);
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * 6.283, d = 0.07;
    const gr = g.createLinearGradient(0, 0, Math.cos(a) * S / 2, Math.sin(a) * S / 2);
    gr.addColorStop(0, "rgba(255,250,215,.9)"); gr.addColorStop(1, "rgba(255,200,60,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0);
    g.lineTo(Math.cos(a - d) * S / 2, Math.sin(a - d) * S / 2); g.lineTo(Math.cos(a + d) * S / 2, Math.sin(a + d) * S / 2); g.closePath(); g.fill();
  }
  cache.set("r", c);
  return c;
}
function titulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(560, 250), g = c.getContext("2d");
  g.translate(280, 125);
  g.beginPath();
  for (let i = 0; i < 28; i++) { const a = (i / 28) * 6.283, r = i % 2 ? 72 : 112 + (i % 4 === 0 ? 14 : 0); g.lineTo(Math.cos(a) * r * 2.1, Math.sin(a) * r * 0.95); }
  g.closePath();
  g.fillStyle = "#ffd34d"; g.fill(); g.lineWidth = 7; g.strokeStyle = "#3a1800"; g.lineJoin = "round"; g.stroke();
  g.beginPath();
  for (let i = 0; i < 28; i++) { const a = (i / 28) * 6.283, r = i % 2 ? 58 : 88; g.lineTo(Math.cos(a) * r * 2.1, Math.sin(a) * r * 0.95); }
  g.closePath(); g.fillStyle = "#fff3b0"; g.fill();
  txt(g, "¡CHOCA!", 4, 42, { tam: 118, peso: 400, fam: FC, color: "#3a1800", esp: 4 });
  txt(g, "¡CHOCA!", 0, 36, { tam: 118, peso: 400, fam: FC, color: "#ff3d84", borde: "#3a1800", bordeAncho: 10, esp: 4 });
  cache.set("t", c);
  return c;
}

class Choca extends Escena {
  constructor() {
    super(9.4);
    this.p = new Parts(460);
    this.estelas = [];
  }
  luz(t) {
    const on = t < 0.6 ? [0, 1, 0, 1, 0.4, 1][Math.min(5, Math.floor(t / 0.1))] : 1;
    return on * (1 - tramo(t, 8.6, 9.3));
  }
  estado(t) {
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoI: [9, 160] };
    const R = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [68, 157], brazoIDelante: true };
    // entran andando
    const kE = eOut(tramo(t, 0.05, 1.05));
    const xg = lerp(-110, XG, kE), xr = lerp(W + 110, XR, kE);
    let bote = 0;
    if (t < 1.05) {
      const a = andar(t * 10, 1 - tramo(t, 0.8, 1.05));
      G.piernaI = a.piernaI; G.piernaD = a.piernaD; R.piernaI = a.piernaD; R.piernaD = a.piernaI; bote = a.bote;
    }
    const s = salto(t), giro = pista(t, GIRO);
    const mG = matAv(xg, PIES + bote + s.y, ESC, giro, 1, s.sy);
    const mR = matAv(xr, PIES + bote + s.y, ESC, -giro, 1, s.sy);
    let hg = aUm(mG, pista2(t, MG)), hr = aUm(mR, pista2(t, MR));
    // después del choque: brazos arriba
    if (t > 6.35) {
      const k = eOut(tramo(t, 6.35, 6.7)), b = Math.sin(t * 9) * 4 * tramo(t, 6.7, 7.0);
      hg = mezcla(hg, [94, 18 + b], k); hr = mezcla(hr, [-16, 28 - b], k);
      G.manoI = mezcla(G.manoI, [-18, 22 - b], k); R.manoD = mezcla(R.manoD, [94, 28 + b], k);
      G.brazoIDelante = k > 0.5;
    }
    G.manoD = hg; R.manoI = hr;
    if (t > 5.88 && t < 6.5) { const sp = Math.sin(((t - 5.88) / 0.62) * Math.PI); G.piernaI = [0, 0.1 * sp]; G.piernaD = [0, -0.1 * sp]; R.piernaI = [0, 0.1 * sp]; R.piernaD = [0, -0.1 * sp]; }
    // caras
    if (t > 1.0 && t < T_F1) { G.cara = "guino"; R.cara = "sonrisa"; G.rc = 0.1; R.rc = -0.1; }
    else if (t >= T_F1 && t < 2.35) { G.cara = "sorpresa"; R.cara = "sorpresa"; G.rc = 0.16 * Math.sin((t - T_F1) * 5); R.rc = -0.16 * Math.sin((t - T_F1) * 5); }
    else if (t >= 2.35 && t < T_F2) { G.cara = "guino"; R.cara = "guino"; G.rc = 0.08; R.rc = -0.08; }
    else if (t >= T_F2 && t < 3.75) { G.cara = "sorpresa"; R.cara = "sorpresa"; G.rc = -0.14 * tramo(t, T_F2, 3.2); R.rc = 0.14 * tramo(t, T_F2, 3.2); }
    else if (t >= 3.75 && t < 4.85) { G.cara = "sorpresa"; R.cara = "sorpresa"; const o = Math.sin((t - 3.75) * 12.6); G.rc = 0.12 * o; R.rc = 0.12 * o; }
    else if (t >= 4.85 && t < 5.5) { G.cara = "risa"; R.cara = "risa"; G.rc = 0.06 * Math.sin(t * 14); R.rc = -0.06 * Math.sin(t * 14); }
    else if (t >= 5.5 && t < T_CHOCA) { G.cara = "guino"; R.cara = "guino"; G.rc = 0.1; R.rc = -0.1; }
    else if (t >= T_CHOCA) { G.cara = "risa"; R.cara = "risa"; G.puntas = 0.7 * (1 - tramo(t, 7.2, 8.0)); R.puntas = G.puntas; }
    return { G, R, mG, mR };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // estelas de las manos que no se encuentran
    if ((t > 1.38 && t < 1.7) || (t > 2.78 && t < 3.08)) {
      const e = this.estado(t);
      for (const [m, h] of [[e.mG, e.G.manoD], [e.mR, e.R.manoI]]) this.estelas.push({ q: aPant(m, h), v: 0.22 });
    }
    for (const s of this.estelas) s.v -= dt;
    this.estelas = this.estelas.filter((s) => s.v > 0);
    for (const tf of [T_F1, T_F2]) this.una("f" + tf, t > tf + 0.12, () => temblar(4, 0.15));
    this.una("choca", t > T_CHOCA, () => {
      temblar(30, 0.75);
      const [x, y] = CHOQUE;
      p.nueva(P.DESTELLO, x, y, 0, 0, 0.5, 420);
      for (let i = 0; i < 60; i++) { const a = azar(0, 6.283), v = azar(300, 950); p.nueva(P.CHISPA, x, y, Math.cos(a) * v, Math.sin(a) * v, azar(0.5, 1.0), azar(9, 18)); }
      for (let i = 0; i < 40; i++) { const a = azar(0, 6.283), v = azar(200, 700); p.nueva(P.ELECTRICA, x, y, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(10, 20)); }
      for (let i = 0; i < 110; i++) p.nueva(P.CONFETI, azar(60, 960), azar(-80, -10), azar(-60, 60), azar(60, 200), azar(2.5, 3.2), azar(9, 15), i % 5);
    });
    this.una("aterriza", t > 6.5, () => {
      temblar(10, 0.25);
      for (const x of [XG, XR]) for (let i = 0; i < 12; i++) p.nueva(P.POLVO, x + azar(-30, 30), PIES - 4, azar(-300, 300), azar(-60, -5), azar(0.5, 0.9), azar(24, 40));
    });
    p.suelo = () => PIES - 2;
    p.alfa = 1 - tramo(t, 8.7, 9.3);
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(t), luz = this.luz(t);
    fondo(g, "#000");
    // suelo y focos de colores
    g.save(); g.globalAlpha = luz;
    const gs = g.createLinearGradient(0, PIES - 40, 0, H);
    gs.addColorStop(0, "#0d0b14"); gs.addColorStop(1, "#1d1826");
    g.fillStyle = gs; g.fillRect(-60, PIES - 6, W + 120, H - PIES + 66);
    g.globalCompositeOperation = "lighter";
    for (const [xa, x, col] of [[260, XG, "47,227,232"], [764, XR, "255,61,132"]]) {
      const gr = g.createLinearGradient(0, -20, 0, PIES);
      gr.addColorStop(0, `rgba(${col},.30)`); gr.addColorStop(1, `rgba(${col},.08)`);
      g.fillStyle = gr; g.beginPath(); g.moveTo(xa - 26, -20); g.lineTo(xa + 26, -20); g.lineTo(x + 150, PIES); g.lineTo(x - 150, PIES); g.closePath(); g.fill();
      g.globalAlpha = 0.5 * luz; g.drawImage(col[0] === "4" ? BLOB2.cian : BLOB.rojo, x - 170, PIES - 26, 340, 52); g.globalAlpha = luz;
    }
    g.restore();
    // rayos de luz detrás tras el choque
    const dc = t - T_CHOCA;
    if (dc > 0) {
      const k = Math.min(1, dc / 0.15) * (1 - 0.55 * tramo(dc, 0.4, 1.4)) * luz;
      const spr = rayos();
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.55 * k;
      g.translate(CHOQUE[0], CHOQUE[1]); g.rotate(dc * 0.35); g.scale(0.6 + 0.6 * eOut(Math.min(1, dc / 0.4)), 0.6 + 0.6 * eOut(Math.min(1, dc / 0.4)));
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // estelas
    if (this.estelas.length) {
      g.save(); g.globalCompositeOperation = "lighter";
      for (const s of this.estelas) { g.globalAlpha = (s.v / 0.22) * 0.5; g.drawImage(BLOB2.oroClaro, s.q[0] - 16, s.q[1] - 16, 32, 32); }
      g.restore();
    }
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mR, e.R, t);
    this.p.dibujar(g);
    // ¿? encima de las cabezas
    for (const [t0, t1] of [[T_F1 + 0.2, 2.3], [T_F2 + 0.2, 3.7]]) {
      if (t > t0 && t < t1) {
        const k = eBack(tramo(t, t0, t0 + 0.15)) * (1 - tramo(t, t1 - 0.15, t1));
        for (const [m, cx, d] of [[e.mG, 39, 0], [e.mR, 38, 0.6]]) {
          const q = aPant(m, [cx, -14]);
          g.save(); g.translate(q[0], q[1] - 12 + 4 * Math.sin(t * 8 + d)); g.scale(k, k);
          txt(g, "¿?", 0, 0, { tam: 52, peso: 400, fam: FC, color: "#fffdf5", borde: "#1a1030", bordeAncho: 7, esp: 2 });
          g.restore();
        }
      }
    }
    // destello del choque
    if (dc > 0 && dc < 0.25) { g.fillStyle = `rgba(255,252,235,${0.8 * (1 - dc / 0.25)})`; g.fillRect(-60, -60, W + 120, H + 120); }
    // ¡CHOCA!
    if (dc > 0.02) {
      const d = dc - 0.02, k = tramo(d, 0, 0.18), s = lerp(2.6, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 9));
      const spr = titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - tramo(t, 8.7, 9.25)); g.translate(512, 100); g.rotate(-0.06 + 0.02 * Math.sin(d * 3)); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = 1 - luz;
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${Math.min(1, a)})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00119", nombre: "Choca esos cinco", crear: () => new Choca() });
})();
