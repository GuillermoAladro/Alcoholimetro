"use strict";
/*
 * 00154 · GLOBO AEROSTÁTICO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Sube un globo de rayas con Guillermo y Rodrigo en la cesta y un barril de cerveza colgado de lastre. El globo
 * empieza a bajar; Guillermo da fuego al quemador y no basta. Rodrigo suelta el barril y salen disparados hacia
 * arriba: ¡QUÉ VISTAS! Brazos abiertos, pájaros… hasta que caen en la cuenta. La cámara baja con el barril, que cae
 * dando vueltas y revienta en un prado en una explosión de espuma. Vuelta al globo: los dos abrazados llorando.
 * El globo se va hacia arriba y se funde a negro.
 */
(() => {
const cache = cacheTexto();
const ESC = 1.18, BORDE = 478, XG = 450, XR = 576, BX = 680;
const T_SUELTA = 2.9, T_TIT = 3.55, T_CAEN = 4.6, T_BAJA = 4.95, T_PLOF = 6.45, T_VUELVE = 6.95;
const YB_SUELTA = BORDE + 72 + 170;   // centro del barril (mundo) al soltarlo
const SUELO_Y = YB_SUELTA + 18 + 500 * (T_PLOF - T_SUELTA - 0.3) + 36;

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(860, 210), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 50, 0, 160);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#fff2a0"); gr.addColorStop(1, "#ffb21a");
  txt(g, "¡QUÉ VISTAS!", 436, 158, { tam: 120, peso: 400, fam: FB, color: "#0a3a6a", esp: 3 });
  txt(g, "¡QUÉ VISTAS!", 430, 150, { tam: 120, peso: 400, fam: FB, color: gr, borde: "#0a3a6a", bordeAncho: 10, esp: 3, glow: "rgba(255,255,255,.8)", glowTam: 22 });
  cache.set("t", c);
  return c;
}
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
function nubeSpr() {
  const c = lienzoNuevo(240, 120), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 20, 0, 110);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(1, "#d8e8f6");
  g.fillStyle = gr;
  for (const [x, y, r] of [[60, 74, 36], [104, 52, 46], [152, 64, 40], [190, 80, 28], [120, 86, 34], [40, 90, 22]]) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
  return c;
}
/** Barril de cerveza con grifo y una jarra pintada; (0, 0) = centro. */
function barril(g, esc) {
  g.save(); g.scale(esc, esc);
  const gb = g.createLinearGradient(-28, 0, 28, 0);
  gb.addColorStop(0, "#6a3814"); gb.addColorStop(0.45, "#d89850"); gb.addColorStop(1, "#5a2c0c");
  g.fillStyle = gb;
  g.beginPath(); g.moveTo(-22, -36); g.quadraticCurveTo(-32, 0, -22, 36); g.lineTo(22, 36); g.quadraticCurveTo(32, 0, 22, -36); g.closePath(); g.fill();
  g.strokeStyle = "rgba(60,28,6,.5)"; g.lineWidth = 1.2; g.stroke();
  for (const y of [-24, 24]) { g.fillStyle = "#4a4a52"; g.beginPath(); g.moveTo(-27, y - 3); g.quadraticCurveTo(0, y - 1, 27, y - 3); g.lineTo(27, y + 3); g.quadraticCurveTo(0, y + 5, -27, y + 3); g.closePath(); g.fill(); }
  g.fillStyle = "#fffdf5"; rectR(g, -9, -10, 15, 18, 2); g.fill();
  g.strokeStyle = "#fffdf5"; g.lineWidth = 2.4; g.beginPath(); g.arc(6, -1, 5, -1.3, 1.3); g.stroke();
  g.fillStyle = "#ffc21f"; g.fillRect(-7, -4, 11, 10);
  g.fillStyle = "#c8ccd2"; rectR(g, -4, 30, 8, 8, 2); g.fill(); g.fillRect(-1.5, 37, 3, 5);
  g.restore();
}

class Globo extends Escena {
  constructor() {
    super(10.2);
    this.p = new Parts(360);
    this.nube = nubeSpr();
    const r = semilla(21);
    this.nubes = [];
    for (let i = 0; i < 26; i++) this.nubes.push({ x: r() * (W + 300) - 150, y: -1600 + i * 160 + r() * 80, s: 0.6 + r() * 0.9 });
    this.pajaros = [];
    this.lagrimas = [];
    this.gotas = [];
    this.fondoC = null; this.sueloC = null;
  }
  /** Altura del globo en el mundo (positivo = más abajo). */
  by() {
    const t = this.t;
    if (t < T_SUELTA) return 170 * eIn(tramo(t, 0.9, T_SUELTA));
    if (t < 8.6) return 170 - 900 * eOut(tramo(t, T_SUELTA, 4.4)) - 40 * Math.max(0, t - 4.4);
    return 170 - 900 - 40 * (8.6 - 4.4) - 900 * eIn(tramo(t, 8.6, 9.6));
  }
  barrilY() {
    const t = this.t;
    if (t < T_SUELTA) return BORDE + 72 + this.by();
    const d = t - T_SUELTA;
    return Math.min(SUELO_Y - 36, YB_SUELTA + (d < 0.3 ? 200 * d * d : 18 + 500 * (d - 0.3)));
  }
  camY() {
    const t = this.t;
    if (t < 0.8) return this.by() - 520 * (1 - eOut(tramo(t, 0, 0.8)));
    if (t < T_BAJA) return this.by();
    if (t < T_VUELVE) {
      const sigue = Math.min(this.barrilY() - 330, SUELO_Y - 460);
      return lerp(this.by(), sigue, eInOut(tramo(t, T_BAJA, 5.55)));
    }
    if (t < 8.6) return this.by();
    return 170 - 900 - 40 * (8.6 - 4.4);
  }
  poses(rim) {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [-62, 0], piernaD: [-62, 0] };
    const R = { quien: "rodrigo", cara: "risa", rc: 0, piernaI: [-62, 0], piernaD: [-62, 0] };
    const mG = matAv(XG, rim + 12, ESC, 0, 1, 1, [39, 146]), mR = matAv(XR, rim + 12, ESC, 0, 1, 1, [39, 146]);
    let gD = [74, 134], gI = [4, 136], rD = [72, 140], rI = [6, 140];
    G.rc = 0.06 * Math.sin(t * 1.7); R.rc = -0.06 * Math.sin(t * 1.5 + 1);
    // ¡bajamos! fuego al quemador
    if (t > 1.3 && t < T_SUELTA) { G.cara = "sorpresa"; R.cara = "sorpresa"; R.rc = -0.14; }
    const kF = eInOut(tramo(t, 1.55, 1.75)) * (1 - eInOut(tramo(t, 2.15, 2.35)));
    gD = mezcla(gD, enAv(mG, [506, rim - 128]), kF);
    if (kF > 0.5) G.rc = -0.1;
    // Rodrigo señala el barril y suelta el nudo
    const kP = eInOut(tramo(t, 2.0, 2.2)) * (1 - eInOut(tramo(t, 2.35, 2.45)));
    rD = mezcla(rD, [104, 150], kP);
    if (t > 2.0 && t < T_SUELTA) { R.cara = "guino"; G.cara = t < 2.4 ? "sorpresa" : "guino"; G.rc = 0.12; }
    const kN = eInOut(tramo(t, 2.4, 2.6)) * (1 - eInOut(tramo(t, 2.95, 3.1)));
    rD = mezcla(rD, mezcla(enAv(mR, [626, rim + 8]), enAv(mR, [630, rim + 2]), Math.sin(t * 40) * 0.5 + 0.5), kN);
    // ¡arriba! brazos en alto
    if (t >= T_SUELTA && t < T_TIT) {
      const k = eOut(tramo(t, T_SUELTA + 0.1, T_SUELTA + 0.35));
      gD = mezcla(gD, [86, 20], k); gI = mezcla(gI, [-8, 20], k); rD = mezcla(rD, [80, 34], k); rI = mezcla(rI, [-4, 34], k);
      G.cara = "risa"; R.cara = "risa"; G.puntas = 0.6 * (1 - tramo(t, 3.3, 3.6)); R.puntas = G.puntas;
    }
    // ¡qué vistas!
    if (t >= T_TIT && t < T_CAEN) {
      const k = eInOut(tramo(t, T_TIT, T_TIT + 0.3));
      gD = mezcla([86, 20], [58, 34], k); gI = mezcla([-8, 20], [4, 136], k);
      rD = mezcla([80, 34], [104, 96], k); rI = mezcla([-4, 34], [-26, 96], k);
      G.cara = "sonrisa"; R.cara = "risa"; G.rc = -0.08 + 0.1 * Math.sin(t * 2); R.rc = 0.06 * Math.sin(t * 2.4);
    }
    // ¡el barril! se llevan las manos a la cabeza y se asoman
    if (t >= T_CAEN) {
      const k = eOut(tramo(t, T_CAEN, T_CAEN + 0.2));
      gD = mezcla([58, 34], [58, 14], k); gI = mezcla([4, 136], [18, 14], k);
      rD = mezcla([104, 96], [56, 24], k); rI = mezcla([-26, 96], [16, 24], k);
      G.cara = "sorpresa"; R.cara = "sorpresa"; G.rc = 0.08 * Math.sin(t * 9); R.rc = -0.08 * Math.sin(t * 9);
    }
    // vuelta: asomados por la cesta, llorando a moco tendido
    let hundido = 0;
    if (t >= T_VUELVE) {
      const k = eInOut(tramo(t, T_VUELVE + 0.1, T_VUELVE + 0.4));
      gD = mezcla([58, 14], [70, 134], k); gI = mezcla([18, 14], [8, 134], k);
      rD = mezcla([56, 24], [68, 138], k); rI = mezcla([16, 24], [8, 138], k);
      const sollozo = Math.sin(t * 16);
      G.rc = 0.14 * k + 0.03 * sollozo; R.rc = -0.14 * k + 0.03 * Math.sin(t * 16 + 1);
      G.cara = Math.sin(t * 5) > 0.1 ? "sorpresa" : "dormido"; R.cara = Math.sin(t * 5 + 1.5) > 0.1 ? "sorpresa" : "dormido";
      hundido = k * (0.06 + 0.012 * sollozo);
    }
    G.manoD = gD; G.manoI = gI; R.manoD = rD; R.manoI = rI;
    const mG2 = hundido ? matAv(XG, rim + 12, ESC, 0, 1 + hundido * 0.4, 1 - hundido, [39, 146]) : mG;
    const mR2 = hundido ? matAv(XR, rim + 12, ESC, 0, 1 + hundido * 0.4, 1 - hundido, [39, 146]) : mR;
    return { G, R, mG: mG2, mR: mR2 };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, cy = this.camY(), rim = BORDE + this.by() - cy;
    // fuego del quemador
    if ((t > 1.6 && t < 2.3) || (t > 0.2 && t < 0.7)) for (let i = 0; i < 3; i++) p.nueva(P.LLAMA, 512 + azar(-8, 8), rim - 138 + cy, azar(-20, 20), azar(-260, -160), azar(0.2, 0.35), azar(26, 40), 1);
    this.una("suelta", t > T_SUELTA, () => { temblar(16, 0.4); });
    // pájaros
    this.una("pajaros", t > 3.7, () => { for (let i = 0; i < 4; i++) this.pajaros.push({ x: -60 - i * 50, y: 220 + i * 26 + (i % 2) * 18, f: i }); });
    for (const b of this.pajaros) b.x += 190 * dt;
    // gotas de cerveza que suelta el barril al caer
    if (t > T_SUELTA && t < T_PLOF && Math.random() < 30 * dt) { const by = this.barrilY(); this.gotas.push({ x: BX + azar(-6, 6), y: by + 40, vx: azar(-40, 40), vy: azar(-120, -30), v: 0.8 }); }
    for (const d of this.gotas) { d.vy += 300 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.v -= dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    this.una("plof", t > T_PLOF, () => {
      temblar(22, 0.5);
      const y = SUELO_Y - 10;
      p.nueva(P.DESTELLO, BX, y, 0, 0, 0.4, 260);
      for (let i = 0; i < 60; i++) { const a = azar(-Math.PI, 0), v = azar(150, 650); p.nueva(P.ESPUMA, BX, y, Math.cos(a) * v, Math.sin(a) * v, azar(0.6, 1.3), azar(7, 14)); }
      for (let i = 0; i < 30; i++) { const a = azar(-Math.PI, 0), v = azar(200, 600); p.nueva(P.GOTA, BX, y, Math.cos(a) * v, Math.sin(a) * v, azar(0.5, 1.0), azar(4, 7)); }
    });
    // lágrimas
    if (t > T_VUELVE + 0.3 && t < 9.4 && Math.random() < 44 * dt) {
      const e = this.poses(rim), lado = Math.random() < 0.5;
      const m = lado ? e.mG : e.mR, R = lado ? avatar().rig : avatar("rodrigo").rig, ojo = R.ojos[Math.random() < 0.5 ? 0 : 1];
      const q = aPant(m, ojo);
      this.lagrimas.push({ x: q[0], y: q[1] + 4, vx: (ojo[0] < 38 ? -1 : 1) * azar(60, 140), vy: azar(-140, -60), v: 0.9 });
    }
    for (const d of this.lagrimas) { d.vy += 700 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.v -= dt; }
    this.lagrimas = this.lagrimas.filter((d) => d.v > 0);
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 80, H + 80), g = c.getContext("2d");
    const gc = g.createLinearGradient(0, 0, 0, H + 80);
    gc.addColorStop(0, "#2a86e0"); gc.addColorStop(1, "#bfe8ff");
    g.fillStyle = gc; g.fillRect(0, 0, W + 80, H + 80);
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8; g.drawImage(BLOB.amarillo, 820, -60, 260, 260);
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    g.fillStyle = "#fff6c4"; g.beginPath(); g.arc(950, 70, 40, 0, 6.283); g.fill();
    this.fondoC = c;
    return c;
  }
  suelo() {
    if (this.sueloC) return this.sueloC;
    const c = lienzoNuevo(W + 120, 520), g = c.getContext("2d");
    const r = semilla(13);
    g.fillStyle = "#7ac35a"; g.fillRect(0, 40, W + 120, 480);
    for (let i = 0; i < 18; i++) {
      g.fillStyle = ["#8ad06a", "#5aa848", "#c8b860", "#9ad878"][i % 4];
      g.save(); g.translate(r() * (W + 120), 60 + r() * 420); g.rotate(r() - 0.5); g.fillRect(-80, -40, 160 + r() * 80, 80 + r() * 40); g.restore();
    }
    g.fillStyle = "rgba(255,255,255,.18)";
    for (let i = 0; i < 40; i++) g.fillRect(r() * (W + 120), 50 + r() * 460, 30, 2);
    for (let i = 0; i < 14; i++) { const x = r() * (W + 120), y = 60 + r() * 420; g.fillStyle = "#2a6a2a"; g.beginPath(); g.arc(x, y, 12 + r() * 8, 0, 6.283); g.fill(); g.fillStyle = "#3a8a3a"; g.beginPath(); g.arc(x - 3, y - 3, 8, 0, 6.283); g.fill(); }
    for (const [x, y] of [[200, 160], [880, 300]]) { g.fillStyle = "#f4ead8"; g.fillRect(x - 18, y - 12, 36, 24); g.fillStyle = "#c83a2a"; g.beginPath(); g.moveTo(x - 24, y - 10); g.lineTo(x, y - 30); g.lineTo(x + 24, y - 10); g.closePath(); g.fill(); }
    // borde difuminado arriba (bruma)
    const gb = g.createLinearGradient(0, 0, 0, 80);
    gb.addColorStop(0, "rgba(191,232,255,1)"); gb.addColorStop(1, "rgba(191,232,255,0)");
    g.fillStyle = gb; g.fillRect(0, 0, W + 120, 80);
    this.sueloC = c;
    return c;
  }
  globo(g, rim, t) {
    // envoltura de gajos de colores
    const cx = 512, top = rim - 600, falda = rim - 196;
    const env = () => {
      g.beginPath();
      g.moveTo(cx - 62, falda);
      g.bezierCurveTo(cx - 150, falda - 90, cx - 235, top + 250, cx - 220, top + 160);
      g.bezierCurveTo(cx - 200, top + 30, cx - 90, top - 6, cx, top - 6);
      g.bezierCurveTo(cx + 90, top - 6, cx + 200, top + 30, cx + 220, top + 160);
      g.bezierCurveTo(cx + 235, top + 250, cx + 150, falda - 90, cx + 62, falda);
      g.closePath();
    };
    g.save(); env(); g.clip();
    const cols = ["#e8283a", "#ffd34d", "#2a6ae0", "#fffdf5", "#2bb05a", "#ff7a1a"];
    for (let i = -6; i < 6; i++) {
      g.fillStyle = cols[(i + 12) % 6];
      g.beginPath();
      const a0 = i * 0.24, a1 = (i + 1) * 0.24;
      g.moveTo(cx + Math.sin(a0) * 40, falda + 30);
      g.quadraticCurveTo(cx + Math.sin(a0) * 520, top + 200, cx, top - 20);
      g.quadraticCurveTo(cx + Math.sin(a1) * 520, top + 200, cx + Math.sin(a1) * 40, falda + 30);
      g.closePath(); g.fill();
    }
    const gs = g.createRadialGradient(cx - 80, top + 120, 20, cx, top + 200, 300);
    gs.addColorStop(0, "rgba(255,255,255,.35)"); gs.addColorStop(0.6, "rgba(255,255,255,0)"); gs.addColorStop(1, "rgba(0,0,30,.35)");
    g.fillStyle = gs; g.fillRect(cx - 260, top - 30, 520, falda - top + 60);
    g.restore();
    env(); g.strokeStyle = "rgba(60,20,20,.5)"; g.lineWidth = 2; g.stroke();
    // falda y quemador
    g.fillStyle = "#a83a2a"; g.beginPath(); g.moveTo(cx - 62, falda); g.lineTo(cx + 62, falda); g.lineTo(cx + 46, falda + 26); g.lineTo(cx - 46, falda + 26); g.closePath(); g.fill();
    g.strokeStyle = "#3a2a1a"; g.lineWidth = 2;
    for (const [a, b] of [[cx - 46, 400], [cx + 46, 624], [cx - 20, 488], [cx + 20, 536]]) { g.beginPath(); g.moveTo(a, falda + 26); g.lineTo(b, rim + 2); g.stroke(); }
    g.fillStyle = "#6a6e76"; rectR(g, cx - 18, rim - 150, 36, 18, 4); g.fill();
    g.fillStyle = "#3a3e46"; g.fillRect(cx - 4, rim - 132, 8, 14);
  }
  cesta(g, rim) {
    const x0 = 398, x1 = 626, y1 = rim + 82;
    const gr = g.createLinearGradient(0, rim, 0, y1);
    gr.addColorStop(0, "#c8924a"); gr.addColorStop(1, "#7a4a1a");
    g.fillStyle = gr; g.beginPath(); g.moveTo(x0, rim); g.lineTo(x1, rim); g.lineTo(x1 - 8, y1); g.lineTo(x0 + 8, y1); g.closePath(); g.fill();
    g.save(); g.clip();
    g.strokeStyle = "rgba(90,50,10,.55)"; g.lineWidth = 2;
    for (let y = rim + 10; y < y1; y += 10) { g.beginPath(); g.moveTo(x0 + 2, y); g.lineTo(x1 - 2, y); g.stroke(); }
    for (let x = x0 + 12, i = 0; x < x1; x += 14, i++) { g.beginPath(); g.moveTo(x, rim + 4 + (i % 2) * 5); g.lineTo(x, y1 - 2); g.stroke(); }
    g.restore();
    g.fillStyle = "#5a3010"; rectR(g, x0 - 6, rim - 6, x1 - x0 + 12, 14, 6); g.fill();
    g.fillStyle = "rgba(255,220,170,.4)"; g.fillRect(x0, rim - 4, x1 - x0, 3);
  }
  dibujar(g) {
    const t = this.t, cy = this.camY(), rim = BORDE + this.by() - cy;
    fondo(g, "#000");
    g.drawImage(this.fondo(), -40, -40);
    // el suelo, muy abajo
    const ys = SUELO_Y - cy;
    if (ys < H + 40) g.drawImage(this.suelo(), -60, ys - 40);
    // nubes
    for (const n of this.nubes) {
      const y = n.y - cy * 0.9;
      if (y < -150 || y > H + 50) continue;
      g.globalAlpha = 0.95; g.drawImage(this.nube, n.x, y, 240 * n.s, 120 * n.s); g.globalAlpha = 1;
    }
    // rayas de velocidad al subir y al bajar la cámara
    const vRay = (t > T_SUELTA && t < 3.6) || (t > T_BAJA && t < 5.6);
    if (vRay) {
      g.strokeStyle = "rgba(255,255,255,.6)"; g.lineWidth = 3;
      for (let i = 0; i < 14; i++) { const x = (i * 83 + 40) % W, y = ((i * 211 + t * (t < 4 ? 2400 : -3000)) % 700 + 700) % 700 - 50; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 90); g.stroke(); }
    }
    // pájaros
    g.strokeStyle = "#223"; g.lineWidth = 3; g.lineCap = "round";
    for (const b of this.pajaros) { const a = Math.sin(t * 12 + b.f) * 7; g.beginPath(); g.moveTo(b.x - 12, b.y - a); g.quadraticCurveTo(b.x - 5, b.y - 4, b.x, b.y); g.quadraticCurveTo(b.x + 5, b.y - 4, b.x + 12, b.y - a); g.stroke(); }
    // el globo
    if (rim > -80 && rim < H + 700) {
      const e = this.poses(rim);
      this.globo(g, rim, t);
      pintarAvatar(g, e.mR, e.R, t);
      pintarAvatar(g, e.mG, e.G, t);
      this.cesta(g, rim);
      // cuerda del barril
      if (t < T_SUELTA) {
        const by = this.barrilY() - cy;
        g.strokeStyle = "#d9c08a"; g.lineWidth = 3;
        g.beginPath(); g.moveTo(624, rim + 6); g.quadraticCurveTo(662, rim + 4, BX, by - 34); g.stroke();
      } else if (t < T_SUELTA + 0.5) {
        g.strokeStyle = "#d9c08a"; g.lineWidth = 3;
        const k = tramo(t, T_SUELTA, T_SUELTA + 0.5);
        g.beginPath(); g.moveTo(624, rim + 6); g.quadraticCurveTo(642, rim + 30, 638 + 10 * Math.sin(t * 20) * (1 - k), rim + 60 - 20 * k); g.stroke();
      }
    }
    // el barril
    const byB = this.barrilY() - cy;
    if (byB > -80 && byB < H + 80 && t < T_PLOF) {
      const d = Math.max(0, t - T_SUELTA);
      g.save(); g.translate(BX, byB); g.rotate(d * 4 * (d > 0 ? 1 : 0) + Math.sin(t * 2) * 0.04); barril(g, 1.15); g.restore();
    }
    // gotas de cerveza del barril
    g.fillStyle = "#ffb51f";
    for (const d of this.gotas) { const y = d.y - cy; g.beginPath(); g.ellipse(d.x, y, 3, 4.5, 0, 0, 6.283); g.fill(); }
    // charco de espuma en el prado
    if (t > T_PLOF) {
      const k = eOut(tramo(t, T_PLOF, T_PLOF + 0.4)), y = SUELO_Y - cy - 6;
      g.fillStyle = "#ffbf2a"; g.beginPath(); g.ellipse(BX, y + 8, 120 * k, 20 * k, 0, 0, 6.283); g.fill();
      g.fillStyle = "#fffaf0"; g.beginPath(); g.ellipse(BX, y + 2, 90 * k, 14 * k, 0, 0, 6.283); g.fill();
      for (let i = 0; i < 6; i++) { g.fillStyle = "#6a3814"; g.save(); g.translate(BX + (i - 2.5) * 40 * k, y + 4 - 8 * Math.sin(i)); g.rotate(i); g.fillRect(-10, -3, 20, 6); g.restore(); }
    }
    g.save(); g.translate(0, -cy); this.p.dibujar(g); g.restore();
    // lágrimas
    g.fillStyle = "#8fd8ff";
    for (const d of this.lagrimas) { g.beginPath(); g.ellipse(d.x, d.y, 4.5, 7, 0, 0, 6.283); g.fill(); }
    // ¡PLOF!
    const dd = t - T_PLOF;
    if (dd > 0 && dd < 0.6) {
      const k = eBack(tramo(dd, 0, 0.14));
      g.save(); g.translate(BX, SUELO_Y - cy - 120); g.rotate(0.1); g.scale(k, k);
      txt(g, "¡PLOF!", 0, 0, { tam: 64, peso: 400, fam: FC, color: "#fffdf5", borde: "#5a3000", bordeAncho: 9, esp: 2 });
      g.restore();
    }
    // ¡QUÉ VISTAS!
    if (t > T_TIT) {
      const d = t - T_TIT, k = tramo(d, 0, 0.18), s = lerp(2.5, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 7));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 86); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0, 0.5), tramo(t, 9.55, this.dur - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00154", nombre: "Globo aerostático", crear: () => new Globo() });
})();
