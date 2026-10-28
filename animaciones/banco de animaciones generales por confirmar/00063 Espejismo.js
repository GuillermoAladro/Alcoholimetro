"use strict";
/*
 * 00063 · ESPEJISMO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Un desierto con dunas y un sol enorme. Guillermo entra arrastrando los pies, sudando. Al fondo aparece un bar
 * que tiembla con el calor: se frota los ojos, sigue ahí… y corre hacia él. Justo cuando salta a abrazarlo, el bar
 * se deshace y era un cactus: ¡AY!, acaba lleno de pinchos. ¿UN BAR? Pasa un matojo rodando y el sol se pone.
 */
(() => {
const cache = cacheTexto();
const HZ = 430; // horizonte

/** Cactus (saguaro); (x, base) = pie del tronco. */
function cactus(g, x, base, h) {
  g.save(); g.translate(x, base);
  const verde = (x0, x1) => { const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, "#1f5a22"); gr.addColorStop(0.4, "#58a83f"); gr.addColorStop(1, "#1a4a1c"); return gr; };
  const brazo = (s, y0, largo, alto) => {
    g.fillStyle = verde(s > 0 ? 20 : -20 - largo, s > 0 ? 20 + largo : -20);
    g.beginPath();
    const xa = s * 24, xb = s * (24 + largo);
    g.moveTo(xa, -y0 + 16); g.lineTo(xb - s * 14, -y0 + 16); g.quadraticCurveTo(xb + s * 6, -y0 + 16, xb + s * 6, -y0 - 6);
    g.lineTo(xb + s * 6, -y0 - alto); g.arc(xb - s * 9, -y0 - alto, 15, 0, Math.PI, true);
    g.lineTo(xb - s * 24, -y0 - 18); g.lineTo(xa, -y0 - 18); g.closePath(); g.fill();
    g.strokeStyle = "rgba(160,220,120,.45)"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(xb - s * 9, -y0 - alto + 2); g.lineTo(xb - s * 9, -y0 - 4); g.stroke();
  };
  brazo(-1, h * 0.42, 52, 92); brazo(1, h * 0.6, 46, 74);
  g.fillStyle = verde(-36, 36);
  g.beginPath(); g.moveTo(-34, 0); g.lineTo(-34, -h + 34); g.arc(0, -h + 34, 34, Math.PI, 0); g.lineTo(34, 0); g.closePath(); g.fill();
  g.strokeStyle = "rgba(170,230,130,.45)"; g.lineWidth = 2.5;
  for (const dx of [-18, 0, 18]) { g.beginPath(); g.moveTo(dx, -6); g.lineTo(dx, -h + 20 + Math.abs(dx)); g.stroke(); }
  // pinchos
  g.strokeStyle = "#fff6d0"; g.lineWidth = 1.5;
  const r = semilla(5);
  for (let i = 0; i < 46; i++) {
    const yy = -10 - r() * (h - 30), lado = r() < 0.5 ? -1 : 1, xx = lado * (28 + r() * 7);
    g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx + lado * 8, yy - 3); g.stroke();
  }
  // flor
  g.fillStyle = "#ff5aa0"; for (let i = 0; i < 5; i++) { const a = i * 1.2566; g.beginPath(); g.ellipse(Math.cos(a) * 6, -h + Math.sin(a) * 6 - 2, 6, 3.5, a, 0, 6.283); g.fill(); }
  g.fillStyle = "#ffd34d"; g.beginPath(); g.arc(0, -h - 2, 3.5, 0, 6.283); g.fill();
  g.restore();
}

class EscenaEspejismo extends Escena {
  constructor() {
    super(10.0);
    this.p = new Parts(260);
    this.ESC = 1.45;
    this.bar = this.pintarBar();
    this.sudor = [];
    this.pinchos = [];
    const r = semilla(9);
    for (let i = 0; i < 13; i++) this.pinchos.push({ p: [8 + r() * 62, 20 + r() * 140], a: -0.6 + r() * 1.2, l: 7 + r() * 5 });
  }
  pintarBar() {
    const c = lienzoNuevo(380, 330), g = c.getContext("2d");
    const X = 190, B = 318;
    // montículo
    g.fillStyle = "#e9b862"; g.beginPath(); g.ellipse(X, B, 185, 18, 0, 0, 6.283); g.fill();
    // palmera
    g.strokeStyle = "#7a4a22"; g.lineWidth = 14; g.lineCap = "round";
    g.beginPath(); g.moveTo(52, B); g.quadraticCurveTo(28, B - 120, 66, B - 230); g.stroke();
    g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 2;
    for (let i = 1; i < 9; i++) { const u = i / 9; const x = lerp(52, 66, u) - 22 * Math.sin(u * Math.PI) * 0.9, y = B - 230 * u; g.beginPath(); g.moveTo(x - 7, y); g.lineTo(x + 7, y + 3); g.stroke(); }
    g.fillStyle = "#2f9a3a";
    for (const a of [-2.6, -2.0, -1.3, -0.6, 0.1]) {
      g.save(); g.translate(66, B - 230); g.rotate(a);
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(40, -24, 86, 6); g.quadraticCurveTo(40, -4, 0, 6); g.closePath(); g.fill(); g.restore();
    }
    g.fillStyle = "#7a4a22"; g.beginPath(); g.arc(60, B - 222, 7, 0, 6.283); g.arc(74, B - 220, 7, 0, 6.283); g.fill();
    // caseta de madera
    const gw = g.createLinearGradient(110, 0, 330, 0); gw.addColorStop(0, "#9a6232"); gw.addColorStop(1, "#5e3816");
    g.fillStyle = gw; g.fillRect(118, B - 150, 210, 150);
    g.strokeStyle = "rgba(0,0,0,.3)"; g.lineWidth = 2;
    for (let y = B - 140; y < B; y += 18) { g.beginPath(); g.moveTo(118, y); g.lineTo(328, y); g.stroke(); }
    // mostrador y hueco con luz
    g.fillStyle = "#2a160a"; g.fillRect(140, B - 120, 166, 58);
    g.fillStyle = "rgba(255,190,80,.85)"; g.fillRect(146, B - 114, 154, 46);
    for (let i = 0; i < 5; i++) { g.fillStyle = "#c46a00"; g.fillRect(156 + i * 30, B - 92, 12, 18); g.fillStyle = "#fffaf0"; g.fillRect(155 + i * 30, B - 96, 14, 5); }
    g.fillStyle = "#c8915a"; g.fillRect(132, B - 64, 182, 12);
    // tejado de paja
    g.fillStyle = "#e8c35a";
    g.beginPath(); g.moveTo(100, B - 146); g.lineTo(223, B - 200); g.lineTo(346, B - 146); g.closePath(); g.fill();
    g.strokeStyle = "#b8902e"; g.lineWidth = 2;
    for (let x = 104; x < 344; x += 10) { g.beginPath(); g.moveTo(x, B - 146); g.lineTo(x + 2, B - 136); g.stroke(); }
    // cartel BAR de neón
    g.fillStyle = "#13261a"; rectR(g, 168, B - 262, 110, 54, 10); g.fill();
    g.strokeStyle = "#2bff5b"; g.lineWidth = 3; rectR(g, 168, B - 262, 110, 54, 10); g.shadowColor = "#2bff5b"; g.shadowBlur = 14; g.stroke();
    txt(g, "BAR", 223, B - 219, { tam: 44, peso: 900, fam: FD, color: "#d8ffe0", glow: "#2bff5b", glowTam: 16, esp: 4 });
    g.shadowBlur = 0;
    g.strokeStyle = "#5e3816"; g.lineWidth = 5; g.beginPath(); g.moveTo(190, B - 208); g.lineTo(190, B - 198); g.moveTo(256, B - 208); g.lineTo(256, B - 198); g.stroke();
    // sombrilla
    g.fillStyle = "#ff3d84"; g.beginPath(); g.moveTo(330, B - 96); g.quadraticCurveTo(360, B - 130, 376, B - 96); g.closePath(); g.fill();
    g.strokeStyle = "#ddd"; g.lineWidth = 3; g.beginPath(); g.moveTo(353, B - 110); g.lineTo(353, B); g.stroke();
    return c;
  }
  /** Avance del mundo al correr (px). */
  avance() { return 520 * eInOut(tramo(this.t, 3.6, 5.35)); }
  barPos() {
    const k = eInOut(tramo(this.t, 3.6, 5.35));
    return { x: lerp(840, 726, k), base: lerp(HZ + 6, PIES, k), esc: lerp(0.4, 1.0, k) };
  }
  aBar() { return tramo(this.t, 2.25, 2.7) * (1 - tramo(this.t, 5.35, 5.62)); }
  temblorBar() { return 2 + 3 * tramo(this.t, 2.25, 3.6) + 26 * tramo(this.t, 5.25, 5.6); }
  estado() {
    const t = this.t;
    const pose = { cara: "borracho", rc: 0.06 * Math.sin(t * 2), piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [72, 160], manoI = [7, 162], x = 300, y = PIES, sx = 1, sy = 1, giro = 0;
    // entra arrastrando los pies
    if (t < 2.5) {
      x = lerp(-90, 300, eOut(tramo(t, 0.4, 2.5)));
      const a = andar(t * 6.5, 0.55); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; y += a.bote * 0.6;
      giro = 0.04 * Math.sin(t * 3.2);
      // se seca la frente
      const kF = eInOut(tramo(t, 1.0, 1.35)) * (1 - eInOut(tramo(t, 1.9, 2.2)));
      manoI = mezcla(manoI, [24 + 10 * Math.sin(t * 9) * (t > 1.35 && t < 1.9 ? 1 : 0), 26], kF);
      pose.brazoIDelante = kF > 0.3;
      manoD = [74, 160 + 4 * Math.sin(t * 3)];
    } else if (t < 3.6) {
      pose.cara = "sorpresa"; pose.rc = 0;
      // mano de visera para mirar a lo lejos; parpadea dos veces (¿es de verdad?)
      const kO = eInOut(tramo(t, 2.62, 2.85)) * (1 - eInOut(tramo(t, 3.3, 3.5)));
      if (kO > 0) { manoD = mezcla(manoD, [66, 28], kO); pose.rc = 0.1 * kO; }
      if ((t > 2.95 && t < 3.05) || (t > 3.12 && t < 3.22)) pose.cara = "dormido";
      if (t > 3.35) pose.cara = "risa";
    } else if (t < 5.3) {
      // corre hacia el bar
      const a = andar(t * 15, 1.2); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; y += a.bote;
      x = lerp(300, 430, eInOut(tramo(t, 3.6, 5.3)));
      pose.cara = "risa"; giro = 0.08;
      manoD = [92, 118 + 14 * Math.sin(t * 15)]; manoI = [-14, 118 - 14 * Math.sin(t * 15)];
    } else if (t < 6.0) {
      // salta a abrazarlo… y era un cactus
      const u = tramo(t, 5.3, 5.62);
      x = lerp(430, 722, eOut(u)); y = PIES - 60 * Math.sin(u * Math.PI);
      pose.cara = t < 5.62 ? "risa" : "sorpresa";
      manoD = t < 5.62 ? [112, 70] : [100, 104]; manoI = t < 5.62 ? [-34, 70] : [-22, 104];
      pose.piernaI = [-6, 0.2]; pose.piernaD = [-6, -0.2];
      if (t >= 5.62) { x = 722 + Math.sin(t * 70) * 3; y = PIES; pose.piernaI = [0, 0]; pose.piernaD = [0, 0]; sx = 0.96; pose.rc = 0.04 * Math.sin(t * 60); }
    } else {
      // sale rebotado, lleno de pinchos
      const u = tramo(t, 6.0, 6.35);
      x = lerp(722, 470, eOut(u)); y = PIES - 70 * Math.sin(u * Math.PI);
      pose.cara = t < 6.6 ? "sorpresa" : "borracho";
      const kS = eBack(tramo(t, 6.6, 6.9));
      manoD = mezcla([96, 100], [104, 128], kS); manoI = mezcla([-18, 100], [-26, 128], kS); // se encoge de hombros
      if (t > 6.6) { pose.rc = 0.12 * Math.sin((t - 6.6) * 2.5); sy = 1 - 0.015 * Math.sin(t * 5); }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(x, y, this.ESC, giro, sx, sy);
    return { pose, m, x };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    if (t > 1.3 && t < 1.9 && Math.random() < 18 * dt) { const q = aPant(e.m, [30, 22]); this.sudor.push({ x: q[0], y: q[1], vx: azar(-160, 40), vy: azar(-200, -60) }); }
    if (t > 0.6 && t < 5.3 && Math.random() < 3 * dt) { const q = aPant(e.m, [azar(15, 60), 30]); this.sudor.push({ x: q[0], y: q[1], vx: azar(-40, 40), vy: azar(-120, -30) }); }
    for (const d of this.sudor) { d.vy += 1200 * dt; d.x += d.vx * dt; d.y += d.vy * dt; }
    this.sudor = this.sudor.filter((d) => d.y < PIES);
    if (t > 3.6 && t < 5.3 && Math.random() < 30 * dt) p.nueva(P.POLVO, e.x - 30 + azar(-10, 10), PIES - 6, azar(-260, -80), azar(-60, -10), azar(0.5, 0.9), azar(24, 40));
    this.una("ay", t > 5.62, () => { temblar(16, 0.45); const q = aPant(e.m, [50, 60]); for (let i = 0; i < 16; i++) p.nueva(P.CHISPA, q[0] + 40, q[1], azar(-300, 300), azar(-400, 0), azar(0.3, 0.6), azar(6, 10)); });
    this.una("pum", t > 6.35, () => { temblar(6, 0.2); for (let i = 0; i < 16; i++) p.nueva(P.POLVO, e.x + azar(-50, 50), PIES - 4, azar(-200, 200), azar(-50, -5), azar(0.5, 1), azar(24, 40)); });
    this.una("bar", t > 6.45, () => temblar(10, 0.3));
    if (t > 7.0 && t < 9.0) { const r = this.rodador(); if (r && r.bota && Math.random() < 0.5) p.nueva(P.POLVO, r.x, PIES - 4, azar(-40, 80), azar(-30, -5), 0.5, azar(16, 26)); }
    p.actualizar(dt);
  }
  rodador() {
    const t = this.t;
    if (t < 6.9 || t > 9.4) return null;
    const u = tramo(t, 6.9, 9.4), x = lerp(W + 80, -100, u);
    const fase = (u * 5) % 1, salto = Math.abs(Math.sin(fase * Math.PI)) * 46;
    return { x, y: PIES - 44 - salto, r: -u * 22, bota: salto < 6 };
  }
  ocaso() { return eIn(tramo(this.t, 8.4, 9.7)); }
  dibujar(g) {
    const t = this.t, e = this.estado(), av = this.avance(), oc = this.ocaso();
    fondo(g, "#000");
    // cielo
    const gc = g.createLinearGradient(0, 0, 0, HZ);
    gc.addColorStop(0, oc > 0 ? `rgb(${Math.round(lerp(255, 40, oc))},${Math.round(lerp(140, 10, oc))},${Math.round(lerp(50, 60, oc))})` : "#ff8c37");
    gc.addColorStop(1, oc > 0 ? `rgb(${Math.round(lerp(255, 120, oc))},${Math.round(lerp(222, 50, oc))},${Math.round(lerp(140, 60, oc))})` : "#ffde8c");
    g.fillStyle = gc; g.fillRect(0, 0, W, HZ + 20);
    // sol enorme (y se pone)
    const sy = 175 + 380 * oc;
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.85 * (1 - oc * 0.5);
    g.drawImage(BLOB.amarillo, 250 - 330, sy - 330, 660, 660); g.restore();
    const gs = g.createRadialGradient(240, sy - 40, 20, 250, sy, 150);
    gs.addColorStop(0, "#fffbe0"); gs.addColorStop(0.7, "#ffe46b"); gs.addColorStop(1, "#ffb627");
    g.fillStyle = gs; g.beginPath(); g.arc(250, sy, 150, 0, 6.283); g.fill();
    // dunas (se desplazan al correr)
    const dunas = [[HZ - 10, 26, 0.004, 0.25, "#f2b25c"], [HZ + 40, 30, 0.0035, 0.55, "#e9a24a"], [HZ + 100, 22, 0.005, 1.0, "#f4c27a"]];
    for (const [b, A, f, par, col] of dunas) {
      const off = av * par;
      g.fillStyle = col;
      g.beginPath(); g.moveTo(-20, H);
      for (let x = -20; x <= W + 20; x += 16) g.lineTo(x, b - A * Math.sin((x + off) * f * 6.283 / 6.283 * 1.0 + b) - 10 * Math.sin((x + off) * f * 2.7));
      g.lineTo(W + 20, H); g.closePath(); g.fill();
    }
    // suelo cercano
    const gsu = g.createLinearGradient(0, 520, 0, H); gsu.addColorStop(0, "#f6cf8a"); gsu.addColorStop(1, "#d99a4a");
    g.fillStyle = gsu; g.fillRect(-20, 548, W + 40, H - 548);
    g.fillStyle = "rgba(150,90,30,.3)";
    for (let i = 0; i < 26; i++) { const x = ((i * 157 - av * 1.2) % (W + 100) + W + 100) % (W + 100) - 50; g.fillRect(x, 556 + (i * 37) % 40, 14, 3); }
    // calima
    g.save(); g.strokeStyle = "rgba(255,255,255,.18)"; g.lineWidth = 2;
    for (let i = 0; i < 6; i++) { const y = HZ - 30 + i * 14; g.beginPath(); for (let x = 0; x <= W; x += 20) g.lineTo(x, y + 3 * Math.sin(x * 0.03 + t * 6 + i)); g.stroke(); }
    g.restore();
    if (oc > 0) { g.fillStyle = `rgba(20,0,30,${oc * 0.6})`; g.fillRect(-60, -60, W + 120, H + 120); }
    // el cactus (siempre ha estado ahí, se ve cuando el bar se deshace)
    const B = this.barPos();
    if (t > 5.2) cactus(g, B.x, B.base, 370);
    // el bar del espejismo, temblando por franjas
    const aB = this.aBar();
    if (aB > 0) {
      const c = this.bar, w = c.width * B.esc, h = c.height * B.esc, amp = this.temblorBar();
      g.save(); g.globalAlpha = aB;
      for (let yy = 0; yy < c.height; yy += 6) {
        const dx = amp * Math.sin(yy * 0.09 + t * 9) * (0.4 + 0.6 * yy / c.height);
        g.drawImage(c, 0, yy, c.width, 6, B.x - w / 2 + dx, B.base - h + yy * B.esc, w, 6 * B.esc + 0.6);
      }
      g.restore();
    }
    // matojo rodando
    const r = this.rodador();
    if (r) {
      g.save(); g.translate(r.x, r.y); g.rotate(r.r);
      g.strokeStyle = "#8a5a2a"; g.lineWidth = 2.5;
      for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(0, 0, 44, 26 + i * 2, i * 0.35, 0, 6.283); g.stroke(); }
      g.strokeStyle = "#b07a3a"; g.lineWidth = 1.6;
      for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(2, -2, 30, 16, i * 0.5 + 0.3, 0, 6.283); g.stroke(); }
      g.strokeStyle = "#6e4420"; g.lineWidth = 2;
      for (let i = 0; i < 8; i++) { const a = i * 0.785; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 40, Math.sin(a) * 30); g.stroke(); }
      g.restore();
    }
    // sombra y avatar
    g.fillStyle = "rgba(120,60,10,.3)"; g.beginPath(); g.ellipse(e.x, PIES - 2, 80, 10, 0, 0, 6.283); g.fill();
    pintarAvatar(g, e.m, e.pose, t);
    // pinchos clavados
    if (t > 5.62) {
      conMat(g, e.m, () => {
        g.strokeStyle = "#fff4c8"; g.lineWidth = 1.4; g.lineCap = "round";
        for (const s of this.pinchos) { g.save(); g.translate(s.p[0], s.p[1]); g.rotate(s.a); g.beginPath(); g.moveTo(0, 0); g.lineTo(-s.l, -s.l * 0.3); g.stroke(); g.restore(); }
        g.save(); g.translate(39, 52); for (const [dx, dy, a] of [[-14, -2, 0.5], [12, 4, -0.4], [2, 12, 0.2], [-6, -18, 0.8], [16, -10, -0.7]]) { g.save(); g.translate(dx, dy); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.lineTo(-8, -2); g.stroke(); g.restore(); } g.restore();
      });
    }
    // sudor
    g.fillStyle = "#bfe9ff";
    for (const d of this.sudor) { g.beginPath(); g.ellipse(d.x, d.y, 2.6, 4, 0, 0, 6.283); g.fill(); }
    this.p.dibujar(g);
    // pensamiento: una jarra
    if (t > 2.55 && t < 3.6) {
      const k = eBack(tramo(t, 2.55, 2.8)) * (1 - tramo(t, 3.45, 3.6)), q = aPant(e.m, [70, -10]);
      g.save(); g.globalAlpha = Math.min(1, k);
      g.fillStyle = "#fffdf5"; g.strokeStyle = "#333"; g.lineWidth = 3;
      for (const [dx, dy, rr] of [[8, -6, 7], [24, -28, 11]]) { g.beginPath(); g.arc(q[0] + dx, q[1] + dy, rr * k, 0, 6.283); g.fill(); g.stroke(); }
      const cx = q[0] + 92, cy = q[1] - 92;
      g.beginPath();
      for (let i = 0; i < 9; i++) { const a = i * 0.698; g.moveTo(cx + Math.cos(a) * 62 * k + 26 * k, cy + Math.sin(a) * 44 * k); g.arc(cx + Math.cos(a) * 62 * k, cy + Math.sin(a) * 44 * k, 26 * k, 0, 6.283); }
      g.stroke(); g.fill();
      g.beginPath(); g.ellipse(cx, cy, 70 * k, 50 * k, 0, 0, 6.283); g.fill();
      g.translate(cx - 22 * k, cy + 2); g.scale(2.1 * k, 2.1 * k);
      dibujarJarra(g, [0, 0], 0, 1, "asa", t); dibujarJarra(g, [0, 0], 0, 1, "cuerpo", t);
      g.restore();
      if (k > 0.8) brillo(g, cx + 50, cy - 40, 18, 0.9);
    }
    // ¡AY!
    if (t > 5.62 && t < 6.5) {
      const k = tramo(t, 5.62, 5.72), q = aPant(e.m, [39, -20]);
      g.save(); g.translate(q[0] - 90, q[1] - 30); g.rotate(-0.15); g.scale(eBack(k), eBack(k));
      txt(g, "¡AY!", 0, 0, { tam: 80, peso: 400, fam: FC, color: "#ff3d3d", borde: "#3a0000", bordeAncho: 9, esp: 3, alfa: 1 - tramo(t, 6.3, 6.5) });
      g.restore();
    }
    // ¿UN BAR?
    if (t > 6.45 && t < 9.2) {
      const k = tramo(t, 6.45, 6.62), s = lerp(2.8, 1, eIn(k)) * (1 + 0.02 * Math.sin(t * 4));
      const spr = this.rotulo();
      g.save(); g.translate(W / 2 + 40, 112); g.rotate(-0.04); g.scale(s, s);
      g.globalAlpha = Math.min(1, k * 4) * (1 - tramo(t, 8.8, 9.2));
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // fundido de entrada (el sol se enciende primero) y de salida
    const fin = tramo(t, 9.3, 9.95), ini = 1 - tramo(t, 0.05, 0.75);
    const a = Math.max(fin, ini);
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
    if (ini > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = ini * (1 - ini) * 3;
      g.drawImage(BLOB.amarillo, 250 - 220, 175 - 220, 440, 440); g.restore();
    }
  }
  rotulo() {
    if (cache.has("bar")) return cache.get("bar");
    const c = lienzoNuevo(640, 220), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 190);
    gr.addColorStop(0, "#fff7d6"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8a1a");
    txt(g, "¿UN BAR?", 320, 172, { tam: 160, peso: 900, fam: FD, color: gr, borde: "#4a1d00", bordeAncho: 12, esp: 6, glow: "rgba(255,120,0,.6)", glowTam: 20 });
    cache.set("bar", c);
    return c;
  }
}

registrar({ id: "00063", nombre: "Espejismo", crear: () => new EscenaEspejismo() });
})();
