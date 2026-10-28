"use strict";
/*
 * 00120 · MUDANZA DE BARRIL
 *
 * Animación del banco. Empieza y acaba en negro.
 * En el almacén del bar, Guillermo y Rodrigo cruzan con un barril enorme entre los dos, sudando y tambaleándose.
 * A Guillermo se le resbala la mano y el barril cae (¡CUIDADO!), se vuelca y sale rodando: Rodrigo lo salta y los dos
 * corren detrás de él. Algo hace ¡PUM! fuera… y vuelven corriendo con el barril persiguiéndolos. Se apaga la bombilla.
 */
(() => {
const ESC = 1.5, D = 108;          // distancia de cada uno al centro del barril
const BW = 124, BH = 152, BR = 63; // barril de pie (ancho, alto) y tumbado (radio)
const T_RESBALA = 3.35, T_CAE = 3.65, T_SUELO = 3.9, T_VUELCA = 4.25, T_RUEDA = 4.45, T_PUM = 6.95, T_VUELVEN = 7.1;
const cache = cacheTexto();

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const u = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return lerp(k[i - 1][1], k[i][1], (k[i][2] || eInOut)(u)); }
  return k[k.length - 1][1];
}
function aUm(m, q) { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; }

/** Barril de pie, centrado en (0, 0). */
function barrilLado(g) {
  const w = BW, h = BH, b = 10;
  g.beginPath();
  g.moveTo(-w / 2 + b, -h / 2); g.lineTo(w / 2 - b, -h / 2);
  g.quadraticCurveTo(w / 2 + b, 0, w / 2 - b, h / 2); g.lineTo(-w / 2 + b, h / 2);
  g.quadraticCurveTo(-w / 2 - b, 0, -w / 2 + b, -h / 2); g.closePath();
  const gr = g.createLinearGradient(-w / 2, 0, w / 2, 0);
  gr.addColorStop(0, "#3d1f0b"); gr.addColorStop(0.3, "#9a5a26"); gr.addColorStop(0.45, "#c98a4a"); gr.addColorStop(0.75, "#7a4219"); gr.addColorStop(1, "#2e1607");
  g.fillStyle = gr; g.fill();
  g.save(); g.clip();
  g.strokeStyle = "rgba(40,18,4,.55)"; g.lineWidth = 1.6;
  for (let i = -3; i <= 3; i++) { const x = (i * w) / 8; g.beginPath(); g.moveTo(x * 0.85, -h / 2); g.quadraticCurveTo(x * 1.12, 0, x * 0.85, h / 2); g.stroke(); }
  for (const y of [-h * 0.36, -h * 0.12, h * 0.12, h * 0.36]) {
    const gm = g.createLinearGradient(0, y - 6, 0, y + 6);
    gm.addColorStop(0, "#9aa3ab"); gm.addColorStop(0.5, "#4a5158"); gm.addColorStop(1, "#24282c");
    g.fillStyle = gm; g.beginPath(); g.moveTo(-w, y - 5); g.quadraticCurveTo(0, y + 1, w, y - 5); g.lineTo(w, y + 5); g.quadraticCurveTo(0, y + 11, -w, y + 5); g.closePath(); g.fill();
  }
  g.restore();
  // tapa de arriba
  g.fillStyle = "#b07038"; g.beginPath(); g.ellipse(0, -h / 2, w / 2 - b, 9, 0, 0, 6.283); g.fill();
  g.strokeStyle = "#4a5158"; g.lineWidth = 3; g.stroke();
  g.fillStyle = "rgba(255,230,190,.18)"; g.fillRect(-w * 0.22, -h / 2 + 12, 7, h - 24);
}
/** Barril tumbado visto por la tapa (rueda), centrado en (0, 0) y girado `ang`. */
function barrilTapa(g, ang) {
  const r = BR;
  const gr = g.createRadialGradient(-r * 0.3, -r * 0.3, 4, 0, 0, r);
  gr.addColorStop(0, "#d39556"); gr.addColorStop(1, "#7a4219");
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.fill();
  g.save(); g.rotate(ang);
  g.beginPath(); g.arc(0, 0, r - 8, 0, 6.283); g.clip();
  g.strokeStyle = "rgba(60,28,6,.6)"; g.lineWidth = 2;
  for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * 15, -r); g.lineTo(i * 15, r); g.stroke(); }
  g.fillStyle = "#3a1d08"; g.beginPath(); g.arc(0, r * 0.45, 7, 0, 6.283); g.fill();
  // grifo
  g.fillStyle = "#c9a23a"; rectR(g, -6, -r * 0.62, 12, 22, 3); g.fill();
  g.fillStyle = "#8a6a1a"; rectR(g, -11, -r * 0.62 - 6, 22, 8, 3); g.fill();
  g.restore();
  g.lineWidth = 9; g.strokeStyle = "#3e454c"; g.beginPath(); g.arc(0, 0, r - 4, 0, 6.283); g.stroke();
  g.lineWidth = 2.5; g.strokeStyle = "rgba(220,230,240,.55)"; g.beginPath(); g.arc(0, 0, r - 6, 3.6, 5.2); g.stroke();
}
function fondoAlmacen() {
  const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
  g.translate(60, 60);
  const gr = g.createLinearGradient(0, 0, 0, PIES);
  gr.addColorStop(0, "#0b0d12"); gr.addColorStop(1, "#1b1d24");
  g.fillStyle = gr; g.fillRect(-60, -60, W + 120, PIES + 60);
  // tablones de la pared
  g.strokeStyle = "rgba(0,0,0,.45)"; g.lineWidth = 2;
  for (let x = 0; x < W + 60; x += 70) { g.beginPath(); g.moveTo(x, -60); g.lineTo(x, PIES); g.stroke(); }
  // cajas apiladas y barriles al fondo
  const caja = (x, y, w, h) => {
    g.fillStyle = "#3b2a1a"; g.fillRect(x, y, w, h);
    g.strokeStyle = "#1e140b"; g.lineWidth = 3; g.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y + h); g.moveTo(x + w, y); g.lineTo(x, y + h); g.stroke();
    g.fillStyle = "rgba(255,220,170,.08)"; g.fillRect(x + 3, y + 3, w - 6, 4);
  };
  caja(10, 455, 120, 120); caja(130, 475, 100, 100); caja(40, 345, 100, 110);
  caja(880, 465, 110, 110); caja(905, 360, 90, 105);
  g.save(); g.globalAlpha = 0.6;
  for (const [x, y] of [[790, 499], [700, 499]]) { g.save(); g.translate(x, y); g.scale(0.62, 0.62); barrilLado(g); g.restore(); }
  g.restore();
  const v = g.createRadialGradient(W / 2, 360, 160, W / 2, 360, 700);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.8)");
  g.fillStyle = v; g.fillRect(-60, -60, W + 120, PIES + 60);
  const gs = g.createLinearGradient(0, PIES, 0, H + 60);
  gs.addColorStop(0, "#3a2a1c"); gs.addColorStop(1, "#140d07");
  g.fillStyle = gs; g.fillRect(-60, PIES, W + 120, H + 60 - PIES);
  g.fillStyle = "rgba(255,210,160,.14)"; g.fillRect(-60, PIES, W + 120, 2);
  return c;
}
function cartel() {
  if (cache.has("c")) return cache.get("c");
  const w = 560, h = 150, c = lienzoNuevo(w + 30, h + 30), g = c.getContext("2d");
  g.translate(15, 15);
  g.shadowColor = "rgba(0,0,0,.7)"; g.shadowBlur = 14; g.shadowOffsetY = 5;
  rectR(g, 0, 0, w, h, 16); g.fillStyle = "#111"; g.fill();
  g.shadowColor = "transparent";
  g.save(); rectR(g, 0, 0, w, h, 16); g.clip();
  g.fillStyle = "#ffd34d";
  for (let x = -h; x < w + h; x += 44) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 22, 0); g.lineTo(x + 22 - h, h); g.lineTo(x - h, h); g.closePath(); g.fill(); }
  g.restore();
  rectR(g, 16, 16, w - 32, h - 32, 10); g.fillStyle = "#ffd34d"; g.fill();
  g.lineWidth = 3; g.strokeStyle = "#111"; g.stroke();
  txt(g, "¡CUIDADO!", w / 2, h / 2 + 37, { tam: 104, peso: 900, fam: FD, color: "#111", esp: 4, max: w - 60 });
  cache.set("c", c);
  return c;
}

class Mudanza extends Escena {
  constructor() {
    super(9.7);
    this.p = new Parts(320);
    this.fondo = null; this.gotas = [];
  }
  luz(t) {
    const on = t < 0.6 ? [0, 1, 0.2, 1, 0.5, 1][Math.min(5, Math.floor(t / 0.1))] : 1;
    const off = t > 9.0 ? [1, 0.3, 1, 0, 0.6, 0, 0][Math.min(6, Math.floor((t - 9.0) / 0.09))] : 1;
    return on * off;
  }
  /** Centro del barril mientras lo llevan. */
  cx(t) { return pista(t, [[0.25, -240], [3.3, 470, (u) => u * (2 - u) * 0.6 + u * 0.4]]); }
  barril(t) {
    // { modo: "lado" | "tapa", x, y, rot, sy }
    if (t < T_CAE) {
      let rot = 0.07 * Math.sin(t * 5.5) + 0.16 * Math.sin(tramo(t, 1.5, 2.1) * Math.PI) - 0.16 * Math.sin(tramo(t, 2.4, 3.0) * Math.PI);
      if (t > T_RESBALA) rot = lerp(rot, -0.32, eIn(tramo(t, T_RESBALA, T_CAE)));
      const y = 410 + 4 * Math.sin(t * 11) + (t > T_RESBALA ? 24 * eIn(tramo(t, T_RESBALA, T_CAE)) : 0);
      return { modo: "lado", x: this.cx(t), y, rot, sy: 1 };
    }
    if (t < T_VUELCA) {
      const u = tramo(t, T_CAE, T_SUELO), y = lerp(434, PIES - BH / 2, u * u);
      const rot = lerp(-0.32, 0, u) + (t > T_SUELO ? 0.13 * Math.sin((t - T_SUELO) * 30) * Math.exp(-(t - T_SUELO) * 9) : 0);
      return { modo: "lado", x: 470 - 10 * u, y, rot, sy: 1 };
    }
    if (t < T_RUEDA) { const u = eIn(tramo(t, T_VUELCA, T_RUEDA)); return { modo: "lado", x: 460, y: PIES - (BH / 2) * (1 - 0.45 * u), rot: 0, sy: 1 - 0.45 * u }; }
    if (t < T_PUM) {
      const s = t - T_RUEDA, x = 460 + 330 * s + 160 * s * s;
      return { modo: "tapa", x, y: PIES - BR + (s < 0.25 ? -18 * Math.sin((s / 0.25) * Math.PI) : 0), rot: (x - 460) / BR };
    }
    const s = t - 7.45, x = W + 120 - 900 * s;
    return { modo: "tapa", x, y: PIES - BR, rot: (x - 460) / BR };
  }
  estado(t) {
    const G = { cara: "dormido", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoI: [14, 142] };
    const R = { quien: "rodrigo", cara: "sorpresa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [62, 140], brazoIDelante: true };
    const b = this.barril(t);
    let xg, xr, yg = PIES, yr = PIES, giroG = 0, giroR = 0;
    if (t < T_CAE + 0.25) {
      const cx = t < T_CAE ? b.x : 470;
      xg = cx - D; xr = cx + D;
      const anda = t > 0.25 && t < 3.3;
      if (anda) {
        const a = andar(t * 8, 0.9);
        G.piernaI = a.piernaI; G.piernaD = a.piernaD; R.piernaI = a.piernaD; R.piernaD = a.piernaI;
        yg += a.bote; yr += a.bote * 0.8;
      }
      giroG = -0.05 + 0.04 * Math.sin(t * 5.5); giroR = 0.05 + 0.04 * Math.sin(t * 5.5 + 2);
      const mG = matAv(xg, yg, ESC, giroG), mR = matAv(xr, yr, ESC, giroR);
      // manos en los lados del barril
      const c = Math.cos(b.rot), s = Math.sin(b.rot);
      const lado = (dx, dy) => [b.x + dx * c - dy * s, b.y + dx * s + dy * c];
      G.manoD = aUm(mG, lado(-BW / 2 + 2, 0));
      R.manoI = aUm(mR, lado(BW / 2 - 2, 0));
      if (t > T_RESBALA) { // a Guillermo se le escurre
        G.manoD = mezcla(G.manoD, aUm(mG, lado(-BW / 2 - 6, 50)), tramo(t, T_RESBALA, T_CAE));
        G.cara = "sorpresa"; R.cara = "sorpresa"; G.rc = 0.15;
      }
      if (t > T_CAE) { const k = eOut(tramo(t, T_CAE, T_CAE + 0.2)); G.manoD = mezcla(G.manoD, [96, 60], k); R.manoI = mezcla(R.manoI, [-18, 60], k); }
      if (t < T_RESBALA) {
        G.cara = Math.sin(t * 2.2) > -0.3 ? "dormido" : "sorpresa";
        R.cara = Math.sin(t * 2.2 + 2) > 0 ? "dormido" : "guino";
        G.rc = -0.06 + 0.05 * Math.sin(t * 5.5); R.rc = 0.06 + 0.05 * Math.sin(t * 5.5 + 2);
      }
      return { G, R, mG, mR, b };
    }
    // ya en el suelo: se apartan, Rodrigo salta el barril
    xg = 470 - D - 14 * eOut(tramo(t, T_SUELO, T_SUELO + 0.2)); xr = 470 + D + 14 * eOut(tramo(t, T_SUELO, T_SUELO + 0.2));
    G.cara = "sorpresa"; R.cara = "sorpresa";
    G.manoD = [96, 60]; R.manoI = [-18, 60]; G.manoI = [9, 160]; R.manoD = [68, 157];
    if (t > 4.4 && t < 5.05) {
      const u = tramo(t, 4.4, 5.05), sp = Math.sin(u * Math.PI);
      yr -= 175 * sp; R.piernaI = [-10 * sp, 0.35 * sp]; R.piernaD = [-10 * sp, -0.35 * sp];
      R.manoI = [-24, 40]; R.manoD = [100, 40];
    }
    if (t >= 5.05 && t < 5.7) {
      G.cara = t < 5.35 ? "sorpresa" : "guino"; R.cara = t < 5.35 ? "sorpresa" : "risa";
      G.rc = 0.14; R.rc = -0.14; G.manoD = [70, 158]; R.manoI = [9, 157];
      if (t > 5.35) { G.rc = 0.2 * Math.sin((t - 5.35) * 9); R.rc = G.rc; }
    }
    // corren detrás del barril (a la derecha) y luego vuelven huyendo (a la izquierda)
    if (t >= 5.7 && t < T_VUELVEN) {
      const s = t - 5.7;
      xg += 300 * s + 500 * s * s; xr += 300 * s + 500 * s * s;
      const a = andar(t * 22, 1.4); G.piernaI = a.piernaI; G.piernaD = a.piernaD; R.piernaI = a.piernaD; R.piernaD = a.piernaI;
      yg += a.bote; yr += a.bote;
      G.manoD = [96, 110]; G.manoI = [-14, 140]; R.manoI = [-18, 120]; R.manoD = [92, 120];
      G.cara = "guino"; R.cara = "guino";
    }
    if (t >= T_VUELVEN) {
      const s = t - T_VUELVEN;
      xr = W + 100 - 820 * s; xg = W + 240 - 820 * s;
      const a = andar(t * 24, 1.5); G.piernaI = a.piernaI; G.piernaD = a.piernaD; R.piernaI = a.piernaD; R.piernaD = a.piernaI;
      yg += a.bote; yr += a.bote;
      G.manoD = [96, 30]; G.manoI = [-18, 30]; R.manoI = [-22, 34]; R.manoD = [96, 34];
      G.cara = "sorpresa"; R.cara = "sorpresa"; G.rc = 0.12 * Math.sin(t * 12); R.rc = -0.12 * Math.sin(t * 12);
    }
    return { G, R, mG: matAv(xg, yg, ESC, giroG), mR: matAv(xr, yr, ESC, giroR), b };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado(t);
    // sudor
    if (t > 0.6 && t < T_CAE && Math.random() < 6 * dt) {
      const quien = Math.random() < 0.5, m = quien ? e.mG : e.mR, q = aPant(m, [quien ? 10 : 66, 26]);
      this.gotas.push({ x: q[0], y: q[1], vx: (quien ? -1 : 1) * azar(40, 110), vy: azar(-170, -60), v: 0.8 });
    }
    for (const d of this.gotas) { d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.v -= dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    for (const tt of [1.8, 2.7]) this.una("tambalea" + tt, t > tt, () => temblar(3, 0.15));
    this.una("suelo", t > T_SUELO, () => {
      temblar(20, 0.45);
      for (let i = 0; i < 30; i++) p.nueva(P.POLVO, 460 + azar(-60, 60), PIES - azar(0, 10), azar(-420, 420), azar(-90, -5), azar(0.6, 1.1), azar(26, 48));
    });
    this.una("vuelca", t > T_RUEDA, () => {
      temblar(9, 0.2);
      for (let i = 0; i < 18; i++) p.nueva(P.POLVO, 460 + azar(-50, 50), PIES - 6, azar(-300, 300), azar(-70, -5), azar(0.5, 0.9), azar(24, 40));
    });
    if (t > T_RUEDA && t < T_PUM && Math.random() < 30 * dt) p.nueva(P.POLVO, e.b.x - 30, PIES - 4, azar(-120, -20), azar(-30, -5), azar(0.4, 0.7), azar(16, 28));
    if (t > 7.4 && Math.random() < 30 * dt) p.nueva(P.POLVO, e.b.x + 30, PIES - 4, azar(20, 120), azar(-30, -5), azar(0.4, 0.7), azar(16, 28));
    this.una("pum", t > T_PUM, () => {
      temblar(26, 0.5);
      for (let i = 0; i < 30; i++) p.nueva(P.POLVO, W + 10, azar(380, PIES), azar(-500, -80), azar(-120, 40), azar(0.7, 1.2), azar(40, 70));
      for (let i = 0; i < 16; i++) p.nueva(P.CHISPA, W + 5, azar(420, 560), azar(-500, -150), azar(-400, -100), azar(0.4, 0.7), azar(7, 12));
    });
    p.alfa = this.luz(t);
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(t), luz = this.luz(t), b = e.b;
    fondo(g, "#000");
    if (!this.fondo) this.fondo = fondoAlmacen();
    g.save(); g.globalAlpha = luz; g.drawImage(this.fondo, -60, -60);
    // bombilla que se balancea
    const ab = 0.12 * Math.sin(t * 2.1) + (t > T_SUELO ? 0.12 * Math.sin((t - T_SUELO) * 9) * Math.exp(-(t - T_SUELO) * 2) : 0);
    const bx = 512 + Math.sin(ab) * 150, by = -10 + Math.cos(ab) * 150;
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.42 * luz;
    g.drawImage(BLOB2.oroClaro, bx - 420, by - 120, 840, 760);
    g.globalCompositeOperation = "source-over"; g.globalAlpha = luz;
    g.strokeStyle = "#222"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(512, -10); g.lineTo(bx, by); g.stroke();
    g.fillStyle = "#2a2a2a"; rectR(g, bx - 7, by - 4, 14, 12, 2); g.fill();
    g.fillStyle = "#fff6d0"; g.beginPath(); g.arc(bx, by + 18, 11, 0, 6.283); g.fill();
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8 * luz; g.drawImage(BLOB.amarillo, bx - 30, by - 10, 60, 60);
    g.restore();
    // sombra del barril
    if (b.x > -200 && b.x < W + 200) {
      g.save(); g.globalAlpha = 0.45 * luz; g.fillStyle = "#000";
      g.beginPath(); g.ellipse(b.x, PIES - 2, b.modo === "lado" ? 66 : 56, 9, 0, 0, 6.283); g.fill(); g.restore();
    }
    const dibBarril = () => {
      g.save(); g.translate(b.x, b.y); g.rotate(b.modo === "lado" ? b.rot : 0);
      if (b.modo === "lado") { g.scale(1, b.sy); barrilLado(g); } else barrilTapa(g, b.rot);
      g.restore();
    };
    const delante = t >= T_CAE; // al caer, el barril pasa por delante de ellos
    if (!delante) dibBarril();
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mR, e.R, t);
    if (delante) dibBarril();
    g.fillStyle = "#bfe9ff";
    for (const d of this.gotas) { g.beginPath(); g.ellipse(d.x, d.y, 4, 6, 0, 0, 6.283); g.fill(); }
    this.p.dibujar(g);
    // ¡PUM! fuera de la pantalla
    if (t > T_PUM && t < T_PUM + 0.7) {
      const k = tramo(t, T_PUM, T_PUM + 0.1);
      g.save(); g.translate(905, 420); g.rotate(-0.15); g.scale(eBack(k), eBack(k));
      txt(g, "¡PUM!", 0, 0, { tam: 86, peso: 400, fam: FC, color: "#fffdf5", borde: "#5a1a00", bordeAncho: 10, alfa: 1 - tramo(t, T_PUM + 0.5, T_PUM + 0.7), esp: 3 });
      g.restore();
    }
    // ¡CUIDADO!
    for (const [t0, t1, s0] of [[T_RESBALA + 0.12, 4.4, 1], [7.25, 9.05, 1.12]]) {
      if (t > t0 && t < t1) {
        const d = t - t0, k = tramo(d, 0, 0.18), s = s0 * lerp(2.2, 1, eIn(k));
        const spr = cartel();
        g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - tramo(t, t1 - 0.25, t1)) * luz;
        g.translate(512, 100); g.rotate(0.05 * Math.sin(d * 9) * Math.exp(-d * 1.2)); g.scale(s, s);
        g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
      }
    }
    const a = 1 - luz;
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${Math.min(1, a)})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00120", nombre: "Mudanza de barril", crear: () => new Mudanza() });
})();
