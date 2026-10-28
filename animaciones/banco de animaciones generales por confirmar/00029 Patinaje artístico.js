"use strict";
/*
 * 00029 · PATINAJE ARTÍSTICO
 *
 * Animación del banco. Empieza y acaba en negro.
 * El hielo se extiende desde el centro de la pantalla: una pista de cerveza congelada con tres jueces (clones) en su
 * mesa, uno de ellos dormido. Entra patinando con los ojos cerrados y una pierna estirada, coge impulso y hace una
 * pirueta que gira cada vez más rápido, con salto incluido, hasta clavar la pose final. ¡TRIPLE GIRO! Los jueces
 * levantan un 10 cada uno, él saluda y la escarcha cierra la pantalla.
 */
(() => {
const CACHE = cacheTexto();
function cartel(clave, s, o) {
  let c = CACHE.get(clave);
  if (c) return c;
  const m = lienzoNuevo(1, 1).getContext("2d");
  m.font = `${o.peso || 400} ${o.tam}px ${o.fam}`;
  if ("letterSpacing" in m) m.letterSpacing = (o.esp || 0) + "px";
  const pad = (o.glowTam || 0) + (o.bordeAncho || 0) + 14;
  c = lienzoNuevo(m.measureText(s).width + pad * 2, o.tam * 1.3 + pad * 2);
  const g = c.getContext("2d");
  const col = typeof o.color === "function" ? o.color(g, c) : o.color;
  txt(g, s, c.width / 2, c.height / 2 + o.tam * 0.36, Object.assign({}, o, { color: col }));
  CACHE.set(clave, c);
  return c;
}
function ponCartel(g, c, x, y, s, a = 1, rot = 0) {
  if (a <= 0 || s <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.drawImage(c, -c.width / 2, -c.height / 2); g.restore();
}

const HIELO_Y = 412;                                   // donde empieza el hielo (detrás, las vallas)
const T_GIRO = 3.35, T_FIN_GIRO = 5.6, VUELTAS = 9;
const JUECES = [{ x: 746, gafas: true, cara: "sonrisa", t10: 6.25 }, { x: 840, oro: 1, cara: "dormido", t10: 6.65 }, { x: 934, cara: "sonrisa", t10: 7.05 }];
const PICOS = Array.from({ length: 56 }, (_, i) => 1 + (i % 2 ? -0.1 : 0.12) * (0.6 + 0.4 * Math.sin(i * 2.7)));

/** Polígono de escarcha (estrella irregular) de radio r centrado en (cx, cy). */
function escarcha(g, cx, cy, r, rot) {
  const n = PICOS.length;
  for (let i = 0; i <= n; i++) {
    const a = rot + (i / n) * Math.PI * 2, rr = r * PICOS[i % n];
    if (i) g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); else g.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  g.closePath();
}
/** Cuchilla de patín bajo un pie (unidades de avatar). */
function cuchilla(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.strokeStyle = "#5f6770"; g.lineWidth = 2; g.beginPath(); g.moveTo(-7, -3); g.lineTo(-6, 2); g.moveTo(7, -3); g.lineTo(6, 2); g.stroke();
  g.strokeStyle = "#e9eef2"; g.lineWidth = 2.2; g.lineCap = "round";
  g.beginPath(); g.moveTo(-12, 3); g.lineTo(10, 3); g.quadraticCurveTo(15, 3, 14, -1); g.stroke();
  g.restore();
}
/** Cartel de puntuación (unidades de avatar), por encima de la mano. */
function tarjeta(g, m, k) {
  if (k <= 0) return;
  g.save(); g.translate(m[0], m[1] - 30); g.scale(k, k);
  g.fillStyle = "#5a3a1c"; g.fillRect(-2, 6, 4, 26);
  g.fillStyle = "#fffdf5"; rectR(g, -30, -26, 60, 44, 5); g.fill();
  g.strokeStyle = "#1b2a52"; g.lineWidth = 2.5; g.stroke();
  txt(g, "10", 0, 12, { tam: 36, peso: 900, fam: FD, color: "#1b2a52" });
  g.restore();
}

class EscenaPatinaje extends Escena {
  constructor() {
    super(10.2);
    this.p = new Parts(420);
    this.ESC = 1.35;
    this.rastro = [];
  }
  xPat(t) {
    if (t < 3.0) return lerp(-160, 430, eOut(tramo(t, 0.7, 3.0)));
    return 430;
  }
  fase() {
    const u = tramo(this.t, T_GIRO, T_FIN_GIRO);
    const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
    return VUELTAS * Math.PI * 2 * e;
  }
  vel() { const u = tramo(this.t, T_GIRO, T_FIN_GIRO); return u <= 0 || u >= 1 ? 0 : (u < 0.5 ? 4 * u : 4 * (1 - u)); }
  estado(fDelta = 0) {
    const t = this.t, ESC = this.ESC;
    const pose = { cara: "dormido", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], y = PIES, sx = 1, sy = 1, giro = 0;
    const x = this.xPat(t);
    // entra deslizándose, ojos cerrados, pierna estirada
    if (t < T_GIRO) {
      const k = tramo(t, 0.6, 1.2) * (1 - eInOut(tramo(t, 2.9, 3.3)));
      pose.piernaI = [-12 * k, 0.75 * k];
      manoD = mezcla(manoD, [128, 70 + 8 * Math.sin(t * 2)], k); manoI = mezcla(manoI, [-46, 100 - 8 * Math.sin(t * 2)], k);
      giro = 0.08 * k + 0.02 * Math.sin(t * 2);
      pose.rc = -0.12 * k;
      pose.cara = t < 2.6 ? "dormido" : "guino";
      if (t > 2.9) { const k2 = eInOut(tramo(t, 2.9, 3.3)); sy = 1 - 0.06 * k2; manoD = mezcla(manoD, [100, 120], k2); manoI = mezcla(manoI, [-20, 120], k2); }
    }
    // pirueta
    if (t >= T_GIRO && t < T_FIN_GIRO + 0.05) {
      const ph = this.fase() - fDelta;
      sx = Math.cos(ph);
      if (Math.abs(sx) < 0.08) sx = sx < 0 ? -0.08 : 0.08;
      const kB = eInOut(tramo(t, T_GIRO, T_GIRO + 0.5));
      manoD = mezcla([100, 120], [56, 100], kB); manoI = mezcla([-20, 120], [22, 100], kB);
      pose.brazoIDelante = kB > 0.5;
      pose.piernaD = [-10 * kB, -0.12 * kB]; pose.piernaI = [0, 0.04];
      pose.cara = this.vel() > 1.2 ? "sorpresa" : "risa";
      // salto en medio del giro
      const s = tramo(t, 4.15, 4.85);
      y -= 95 * 4 * s * (1 - s);
      if (s > 0 && s < 1) { pose.piernaI = [-10, 0.08]; pose.piernaD = [-14, -0.1]; }
    }
    // pose final
    if (t >= T_FIN_GIRO) {
      const k = eOut(tramo(t, T_FIN_GIRO, T_FIN_GIRO + 0.25));
      sx = 1;
      manoD = mezcla([56, 100], [104, 8], k); manoI = mezcla([22, 100], [-26, 8], k);
      pose.brazoIDelante = false;
      pose.piernaD = [-14 * k, -0.62 * k]; pose.cara = "risa";
      pose.rc = 0.05 * k;
      // reverencia y guiño
      if (t > 7.7) {
        const k2 = eInOut(tramo(t, 7.7, 8.1)) * (1 - eInOut(tramo(t, 8.7, 9.0)));
        manoD = mezcla(manoD, [126, 150], k2); manoI = mezcla(manoI, [-48, 150], k2);
        pose.piernaD = [-14 * (1 - k2), -0.62 * (1 - k2)];
        sy = 1 - 0.1 * k2; pose.rc = -0.12 * k2;
        pose.cara = k2 > 0.5 ? "guino" : "risa";
      }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(x, y, ESC, giro, sx, sy);
    return { pose, m, x, y, sx };
  }
  juez(J, i) {
    const t = this.t;
    const pose = { cara: J.cara, rc: 0.04 * Math.sin(t * 1.3 + i), oro: J.oro || 0, gafas: !!J.gafas };
    let manoD = [70, 158], manoI = [9, 160];
    if (i === 1 && t < T_GIRO + 0.3) pose.rc = 0.18 + 0.03 * Math.sin(t * 2); // dormido, cabeza caída
    if (t > T_GIRO + 0.3 && t < J.t10) { pose.cara = "sorpresa"; pose.rc = 0; }
    const k = eBack(tramo(t, J.t10, J.t10 + 0.3));
    if (t > J.t10) { pose.cara = i === 1 ? "risa" : (i === 0 ? "risa" : "guino"); manoD = mezcla(manoD, [82, 20], Math.min(1, k)); pose.objD2 = (g, m) => tarjeta(g, m, Math.min(1, k)); }
    pose.manoD = manoD; pose.manoI = manoI;
    return { pose, m: matAv(J.x, 512, 0.84) };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    // rastro del patín en el hielo
    if (t > 0.7 && t < T_GIRO) this.rastro.push([e.x + 12, PIES - 2, t]);
    this.rastro = this.rastro.filter((r) => t - r[2] < 2.2);
    if (t > 0.9 && t < 2.9 && Math.random() < 20 * dt) p.nueva(P.VAPOR, e.x + 10, PIES - 4, azar(-120, -40), azar(-30, -5), azar(0.3, 0.6), azar(8, 16));
    // virutas de hielo durante el giro
    const v = this.vel();
    if (v > 0.3 && Math.random() < 60 * dt * v) {
      const a = azar(0, 6.283);
      p.nueva(Math.random() < 0.5 ? P.VAPOR : P.ELECTRICA, e.x + Math.cos(a) * 40, PIES - 6, Math.cos(a) * azar(150, 380), azar(-160, -40), azar(0.3, 0.6), azar(6, 14));
    }
    this.una("aterriza", t > 4.85, () => {
      temblar(12, 0.3);
      for (let i = 0; i < 30; i++) p.nueva(P.VAPOR, e.x + azar(-40, 40), PIES - 4, azar(-400, 400), azar(-160, -20), azar(0.4, 0.9), azar(14, 26));
    });
    this.una("pose", t > T_FIN_GIRO, () => {
      temblar(14, 0.35);
      for (let i = 0; i < 30; i++) { const a = azar(0, 6.283), vv = azar(200, 600); p.nueva(P.ELECTRICA, e.x, PIES - 220, Math.cos(a) * vv, Math.sin(a) * vv, azar(0.4, 0.9), azar(10, 18)); }
      for (let i = 0; i < 60; i++) p.nueva(P.PURPURINA, azar(80, 760), azar(-40, 120), azar(-20, 20), azar(30, 80), azar(1.5, 2.5), azar(8, 14));
    });
    for (const [i, J] of JUECES.entries()) this.una("diez" + i, t > J.t10 + 0.05, () => {
      temblar(5, 0.12);
      p.nueva(P.DESTELLO, J.x + 30, 250, 0, 0, 0.3, 90);
      for (let k = 0; k < 10; k++) p.nueva(P.CONFETI, J.x + azar(-30, 60), 240, azar(-160, 160), azar(-260, -80), azar(2, 3), azar(8, 12), (Math.random() * 5) | 0);
    });
    p.alfa = 1;
    p.actualizar(dt);
  }
  pista(g, t) {
    // pabellón oscuro con lucecitas
    const rnd = semilla(12);
    g.fillStyle = "#05070d"; g.fillRect(-60, -60, W + 120, HIELO_Y + 60);
    for (let i = 0; i < 40; i++) { const x = rnd() * W, y = rnd() * 300, a = 0.25 + 0.25 * Math.sin(t * 2 + i); g.fillStyle = `rgba(190,230,255,${a})`; g.fillRect(x, y, 2, 2); }
    // vallas
    g.fillStyle = "#e9eef2"; g.fillRect(-60, HIELO_Y - 56, W + 120, 52);
    g.fillStyle = "#1b4fa0"; g.fillRect(-60, HIELO_Y - 58, W + 120, 7);
    g.fillStyle = "#c8102e"; g.fillRect(-60, HIELO_Y - 10, W + 120, 6);
    txt(g, "PISTA DE CERVEZA CONGELADA  ·  −5 °C", 330, HIELO_Y - 22, { tam: 17, peso: 900, fam: FD, color: "#1b2a52", esp: 3 });
    // hielo dorado
    const gr = g.createLinearGradient(0, HIELO_Y, 0, H);
    gr.addColorStop(0, "#f7e3a6"); gr.addColorStop(0.4, "#e8b85a"); gr.addColorStop(1, "#c98a2a");
    g.fillStyle = gr; g.fillRect(-60, HIELO_Y - 4, W + 120, H - HIELO_Y + 64);
    // burbujas congeladas y brillos
    g.fillStyle = "rgba(255,255,240,.5)";
    for (let i = 0; i < 34; i++) { const x = rnd() * W, y = HIELO_Y + 16 + rnd() * 170, r = 1.5 + rnd() * 3; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35;
    g.drawImage(BLOB.blanco, 140, HIELO_Y + 40, 560, 80); g.drawImage(BLOB.blanco, 520, HIELO_Y + 110, 420, 60);
    g.restore();
    g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 2;
    for (let i = 0; i < 6; i++) { const x = 60 + i * 170; g.beginPath(); g.moveTo(x, HIELO_Y + 30 + i * 9); g.lineTo(x + 90, HIELO_Y + 22 + i * 9); g.stroke(); }
  }
  mesa(g) {
    const x0 = 684, x1 = 1040, top = 404;
    g.fillStyle = "#2a2f3a"; g.fillRect(x0, top, x1 - x0, 124);
    g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(x0, top + 104, x1 - x0, 20);
    g.fillStyle = "#3d4452"; g.fillRect(x0 - 6, top - 8, x1 - x0 + 12, 10);
    g.fillStyle = "#1b4fa0"; g.fillRect(x0, top + 22, x1 - x0, 22);
    txt(g, "J U E C E S", (x0 + x1) / 2, top + 39, { tam: 16, peso: 900, fam: FD, color: "#fffdf5", esp: 4 });
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    // el hielo se abre desde el centro
    const kIn = eInOut(tramo(t, 0.05, 1.15));
    const rIn = 1300 * kIn;
    g.save();
    if (kIn < 1) { g.beginPath(); escarcha(g, 512, 380, Math.max(0.5, rIn), 0.2); g.clip(); }
    this.pista(g, t);
    // jueces detrás de su mesa
    JUECES.forEach((J, i) => { const j = this.juez(J, i); pintarAvatar(g, j.m, j.pose, t); });
    this.mesa(g);
    // rastro del patín
    if (this.rastro.length > 1) {
      g.strokeStyle = "rgba(255,255,255,.6)"; g.lineWidth = 2;
      g.beginPath(); this.rastro.forEach((r, i) => (i ? g.lineTo(r[0], r[1]) : g.moveTo(r[0], r[1]))); g.stroke();
    }
    // reflejo en el hielo
    g.save(); g.globalAlpha = 0.22;
    g.translate(0, 2 * PIES); g.scale(1, -1);
    pintarAvatar(g, e.m, e.pose, t);
    g.restore();
    // foco
    foco(g, e.x, e.x, PIES, 150, tramo(t, 1.2, 2.2) * 0.55 + (t > T_FIN_GIRO ? 0.35 * (1 - tramo(t, T_FIN_GIRO, T_FIN_GIRO + 1)) : 0));
    // estelas del giro
    const v = this.vel();
    if (v > 0.6) {
      for (const [d, a] of [[0.9, 0.22], [1.8, 0.1]]) {
        const fe = this.estado(d * v * 0.35);
        g.save(); g.globalAlpha = a * Math.min(1, v); pintarAvatar(g, fe.m, fe.pose, t); g.restore();
      }
      g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = `rgba(200,240,255,${0.35 * Math.min(1, v)})`; g.lineWidth = 3;
      const cy = e.y - 140;
      for (let i = 0; i < 3; i++) { const a0 = this.fase() * 0.5 + i * 2.1; g.beginPath(); g.ellipse(e.x, cy + (i - 1) * 70, 95, 22, 0, a0, a0 + 2.2); g.stroke(); }
      g.restore();
    }
    pintarAvatar(g, e.m, e.pose, t);
    // cuchillas de los patines
    conMat(g, e.m, () => {
      for (const [cx, pl] of [[27, e.pose.piernaI], [51, e.pose.piernaD]]) {
        const ang = pl[1], dy = pl[0];
        const fx = cx - Math.sin(ang) * 84, fy = 146 + Math.cos(ang) * 84 + dy;
        cuchilla(g, fx + (cx < 39 ? -2 : 2), fy + 1, ang);
      }
    });
    this.p.dibujar(g);
    // ¡TRIPLE GIRO!
    if (t > T_FIN_GIRO) {
      const k = tramo(t, T_FIN_GIRO, T_FIN_GIRO + 0.2);
      const c = cartel("triplegiro", "¡TRIPLE GIRO!", {
        tam: 112, peso: 900, fam: FD, borde: "#0a1f44", bordeAncho: 11, esp: 4, glow: "rgba(80,210,255,.85)", glowTam: 24,
        color: (gg, cv) => { const gr = gg.createLinearGradient(0, cv.height * 0.2, 0, cv.height * 0.8); gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#bff3ff"); gr.addColorStop(1, "#2fb8e8"); return gr; },
      });
      ponCartel(g, c, 370, 112, lerp(2.4, 1, eIn(k)) * (1 + 0.02 * Math.sin(t * 9)), Math.min(1, k * 3), -0.04);
    }
    // el «10» grande que salta de cada tarjeta
    for (const J of JUECES) {
      const u = t - J.t10 - 0.1;
      if (u < 0 || u > 0.8) continue;
      const c = cartel("diez", "10", { tam: 64, peso: 900, fam: FD, color: "#fffdf5", borde: "#1b2a52", bordeAncho: 8, glow: "rgba(80,210,255,.8)", glowTam: 14 });
      ponCartel(g, c, J.x + 14, 220 - 60 * eOut(u / 0.8), 0.6 + 0.6 * eOut(u / 0.3), 1 - tramo(u, 0.5, 0.8));
    }
    g.restore();
    // el hielo vuelve a cerrar la pantalla
    if (kIn < 1 && kIn > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = "rgba(200,240,255,.7)"; g.lineWidth = 5;
      g.beginPath(); escarcha(g, 512, 380, rIn, 0.2); g.stroke(); g.restore();
    }
    const kOut = tramo(t, 9.05, 10.0);
    if (kOut > 0) {
      const r = Math.max(0.5, 1300 * Math.pow(1 - kOut, 1.8)), cx = e.x, cy = PIES - 200;
      g.save(); g.beginPath(); g.rect(-60, -60, W + 120, H + 120); escarcha(g, cx, cy, r, -0.4 + kOut);
      g.fillStyle = "#000"; g.fill("evenodd");
      g.globalCompositeOperation = "lighter"; g.strokeStyle = "rgba(200,240,255,.7)"; g.lineWidth = 5;
      g.beginPath(); escarcha(g, cx, cy, r, -0.4 + kOut); g.stroke();
      g.restore();
    }
    if (t < 0.06 || kOut >= 0.995) { g.fillStyle = "#000"; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00029", nombre: "Patinaje artístico", crear: () => new EscenaPatinaje() });
})();
