"use strict";
/*
 * 00027 · BOLOS DE BOTELLAS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Las luces de la pista se encienden de izquierda a derecha: al fondo, 10 botellines colocados en triángulo como
 * bolos. Sopla la bola, coge carrerilla y la lanza rodando. Al chocar todo pasa a cámara lenta: las botellas saltan
 * girando y soltando cerveza, y caen todas. ¡STRIKE! Lo celebra y la pista se apaga de derecha a izquierda.
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

const PISTA = { atras: PIES - 62, delante: PIES + 12 };
const RB = 24;                 // radio de la bola
const T_SUELTA = 2.86, T_CHOQUE = 4.05, T_LENTA_FIN = 6.0, T_STRIKE = 6.05;
const BH = 76;                 // alto de un botellín

/** Botellín ámbar con franjas rojas (como un bolo); (0, 0) = su centro. */
function botellin(g, s) {
  g.save(); g.scale(s, s);
  const h = BH, w = 26, y0 = h / 2;
  g.beginPath();
  g.moveTo(-w / 2, y0); g.lineTo(-w / 2, y0 - h * 0.55);
  g.quadraticCurveTo(-w / 2, y0 - h * 0.72, -5.5, y0 - h * 0.8); g.lineTo(-5.5, y0 - h + 5); g.lineTo(5.5, y0 - h + 5); g.lineTo(5.5, y0 - h * 0.8);
  g.quadraticCurveTo(w / 2, y0 - h * 0.72, w / 2, y0 - h * 0.55); g.lineTo(w / 2, y0); g.closePath();
  const gr = g.createLinearGradient(-w / 2, 0, w / 2, 0);
  gr.addColorStop(0, "#3a1a02"); gr.addColorStop(0.3, "#9a5210"); gr.addColorStop(0.5, "#e09a3a"); gr.addColorStop(0.75, "#7a3e08"); gr.addColorStop(1, "#2a1200");
  g.fillStyle = gr; g.fill();
  g.strokeStyle = "rgba(0,0,0,.55)"; g.lineWidth = 1.4; g.stroke();
  g.fillStyle = "#fffdf5"; g.fillRect(-w / 2 + 1, y0 - h * 0.45, w - 2, h * 0.24);
  g.fillStyle = "#e3262f"; g.fillRect(-w / 2 + 1, y0 - h * 0.4, w - 2, 4); g.fillRect(-w / 2 + 1, y0 - h * 0.29, w - 2, 4);
  g.fillStyle = "#e3262f"; g.fillRect(-5.5, y0 - h * 0.78, 11, 4);
  g.fillStyle = "#d9b200"; rectR(g, -6.5, y0 - h, 13, 7, 2); g.fill();
  g.fillStyle = "rgba(255,255,255,.45)"; g.fillRect(-w / 2 + 4, y0 - h * 0.55, 3, h * 0.5);
  g.restore();
}
/** Bola de bolos con tres agujeros, girada `rot`. */
function bola(g, x, y, r, rot) {
  g.save(); g.translate(x, y);
  const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
  gr.addColorStop(0, "#9f7bff"); gr.addColorStop(0.45, "#4b22b8"); gr.addColorStop(1, "#160640");
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.fill();
  g.save(); g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.clip(); g.rotate(rot);
  g.strokeStyle = "rgba(190,150,255,.35)"; g.lineWidth = r * 0.12;
  g.beginPath(); g.moveTo(-r, -r * 0.2); g.bezierCurveTo(-r * 0.3, -r * 0.8, r * 0.2, r * 0.6, r, -r * 0.1); g.stroke();
  g.fillStyle = "#08021a";
  for (const [hx, hy, hr] of [[-r * 0.22, -r * 0.42, r * 0.13], [r * 0.18, -r * 0.42, r * 0.13], [0, r * 0.05, r * 0.16]]) {
    const vis = Math.cos(rot * 0.5);
    g.beginPath(); g.ellipse(hx, hy, hr, hr * (0.7 + 0.3 * Math.abs(vis)), 0, 0, 6.283); g.fill();
  }
  g.restore();
  g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.ellipse(-r * 0.38, -r * 0.45, r * 0.22, r * 0.14, -0.6, 0, 6.283); g.fill();
  g.restore();
}

class EscenaBolos extends Escena {
  constructor() {
    super(9.5);
    this.p = new Parts(420);
    this.ESC = 1.45;
    this.ts = 0; // tiempo de la simulación (va a cámara lenta tras el choque)
    this.bots = [];
    for (let r = 0; r < 4; r++) for (let i = 0; i <= r; i++) {
      const d = i - r / 2;
      const yb = PIES - 25 + d * 19;
      const s = 1 + 0.06 * d;
      this.bots.push({ x: 742 + r * 50 - d * 16, y: yb - (BH / 2) * s, yb, s, r: 0, vx: 0, vy: 0, vr: 0, fila: r, d, libre: false, quieta: false });
    }
    this.bolaX = 0; this.bolaY = 0; this.bolaRot = 0;
  }
  escala() { const t = this.t; return t < T_CHOQUE ? 1 : t < T_LENTA_FIN ? 0.24 : 1; }
  barrido() {
    const t = this.t;
    const enc = lerp(-160, W + 200, eInOut(tramo(t, 0.05, 0.85)));
    const apa = lerp(W + 200, -160, eInOut(tramo(t, 8.3, 9.25)));
    return t < 8.3 ? enc : apa;
  }
  xAv(t) { return t < 2.0 ? 175 : lerp(175, 236, eInOut(tramo(t, 2.0, 2.75))); }
  estado() {
    const t = this.t, ESC = this.ESC;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [62, 118], manoI = [9, 160], giro = 0, sy = 1, D = 0, y = PIES;
    const x = this.xAv(t);
    // sopla la bola y guiña
    const kS = eInOut(tramo(t, 0.95, 1.25)) * (1 - eInOut(tramo(t, 1.65, 1.95)));
    manoD = mezcla(manoD, [74, 74], kS);
    if (kS > 0.5 && t < 1.65) pose.cara = "sorpresa";
    else if (t > 1.6 && t < 2.1) pose.cara = "guino";
    pose.rc = 0.1 * kS;
    // carrerilla, péndulo y suelta
    if (t > 2.0 && t < 2.75) {
      const a = andar(t * 12, 0.7); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; y += a.bote;
      manoD = mezcla(manoD, [12, 132], eInOut(tramo(t, 2.15, 2.62)));
      pose.cara = "guino";
    }
    if (t >= 2.6) {
      const kAg = eInOut(tramo(t, 2.55, 2.8)) * (1 - eInOut(tramo(t, 3.3, 3.7)));
      D = 22 * kAg; sy = 1 - 0.05 * kAg;
      pose.piernaI = [-D, 0.28 * kAg]; pose.piernaD = [-D, -0.32 * kAg];
      const kL = tramo(t, 2.62, T_SUELTA + 0.05);
      manoD = t < T_SUELTA + 0.05 ? mezcla([12, 132], [118, 184], eInOut(kL)) : mezcla([118, 184], [118, 150], eInOut(tramo(t, 3.0, 3.4)));
      manoI = mezcla([9, 160], [-34, 118], kAg);
      giro = 0.06 * kAg;
      pose.cara = t < T_SUELTA ? "guino" : "sorpresa";
      pose.rc = 0.1 * tramo(t, T_SUELTA, 3.4);
    }
    if (t > 3.7 && t < T_STRIKE) {
      // nervios: se muerde las manos
      const k = eInOut(tramo(t, 3.7, 4.0));
      manoD = mezcla([118, 150], [48, 70], k); manoI = mezcla(manoI, [30, 72], k);
      pose.brazoIDelante = k > 0.5; pose.cara = "sorpresa"; pose.rc = 0.08;
    }
    if (t >= T_STRIKE) {
      const k = eOut(tramo(t, T_STRIKE, T_STRIKE + 0.2));
      const b = Math.abs(Math.sin((t - T_STRIKE) * 7)) * (1 - tramo(t, 7.4, 7.7));
      manoD = mezcla([48, 70], [98, 16 + 18 * b], k); manoI = mezcla([30, 72], [-20, 16 + 18 * (1 - b)], k);
      pose.brazoIDelante = false; pose.cara = "risa";
      y -= 30 * b;
      if (t > 7.5) {
        const k2 = eInOut(tramo(t, 7.5, 7.8));
        manoD = mezcla(manoD, [126, 92], k2); manoI = mezcla(manoI, [9, 160], k2);
        pose.cara = "guino"; pose.rc = 0.07 * k2;
      }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    if (t < T_SUELTA) pose.objD = (g, m) => { g.save(); g.translate(m[0] + 2, m[1] + 4); g.scale(1 / ESC, 1 / ESC); bola(g, 0, 0, RB, t * 0.5); g.restore(); };
    const m = matAv(x, y + D * ESC, ESC, giro, 1, sy);
    return { pose, m, x };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    const esc = this.escala(), ds = dt * esc;
    this.ts += ds;
    // la bola rodando
    this.una("suelta", t > T_SUELTA, () => {
      const q = aPant(e.m, e.pose.manoD);
      this.bolaX = q[0] + 4; this.bolaY = PIES - 27 - RB; this.bolaV = (742 - 22 - this.bolaX) / (T_CHOQUE - T_SUELTA); temblar(5, 0.15);
      for (let i = 0; i < 10; i++) p.nueva(P.POLVO, this.bolaX, PIES - 12, azar(-80, 80), azar(-50, -10), azar(0.4, 0.7), azar(14, 24));
    });
    if (t > T_SUELTA) {
      this.bolaX += this.bolaV * ds; this.bolaRot += (this.bolaV * ds) / RB;
      if (t > T_CHOQUE) this.bolaV = Math.max(160, this.bolaV - 120 * ds);
    }
    // choque: las botellas saltan
    this.una("choque", t > T_CHOQUE, () => {
      temblar(24, 0.6);
      p.nueva(P.DESTELLO, 742, PIES - 60, 0, 0, 0.4, 170);
      const rnd = semilla(5);
      for (const b of this.bots) {
        b.libre = true;
        b.vx = 140 + 120 * b.fila + rnd() * 160 - 60 * b.d;
        b.vy = -(380 + rnd() * 420 - 40 * b.fila);
        b.vr = (rnd() < 0.5 ? -1 : 1) * (5 + rnd() * 8);
      }
    });
    for (const b of this.bots) {
      if (!b.libre || b.quieta) continue;
      b.vy += 1500 * ds; b.x += b.vx * ds; b.y += b.vy * ds; b.r += b.vr * ds;
      // derrama cerveza mientras vuela
      if (Math.random() < 6 * ds * 4) {
        const bx = b.x + Math.sin(b.r) * (BH / 2 - 4) * b.s, by = b.y - Math.cos(b.r) * (BH / 2 - 4) * b.s;
        p.nueva(Math.random() < 0.5 ? P.GOTA : P.ESPUMA, bx, by, b.vx * 0.3 + azar(-60, 60), b.vy * 0.3 + azar(-80, 20), azar(0.5, 0.9), azar(3, 6));
      }
      const suelo = b.yb - 13 * b.s; // tumbada en la pista
      if (b.y > suelo && b.vy > 0) {
        b.y = suelo; b.vy *= -0.32; b.vx *= 0.55; b.vr *= 0.5;
        if (Math.abs(b.vy) < 90) { b.vy = 0; b.quieta = true; b.r = Math.round((b.r - Math.PI / 2) / Math.PI) * Math.PI + Math.PI / 2; }
      }
      if (b.x > W + 120) b.quieta = true;
    }
    this.una("strike", t > T_STRIKE, () => {
      temblar(18, 0.45);
      for (let i = 0; i < 140; i++) p.nueva(P.CONFETI, azar(0, W), azar(-220, -10), azar(-60, 60), azar(20, 120), azar(4, 6), azar(8, 14), (Math.random() * 5) | 0);
    });
    if (t > 6.4 && t < 8.2 && Math.random() < 20 * dt) p.nueva(P.CONFETI, azar(0, W), -10, azar(-40, 40), azar(40, 100), 5, azar(8, 14), (Math.random() * 5) | 0);
    p.actualizar(t > T_CHOQUE && t < T_LENTA_FIN ? ds * 1.4 : dt);
  }
  pista(g) {
    const { atras, delante } = PISTA;
    // pared del fondo y cortina de la máquina
    g.fillStyle = "#0b0c14"; g.fillRect(-60, 140, W + 120, atras - 140);
    g.fillStyle = "#121427"; g.fillRect(660, 230, 420, atras - 230);
    g.strokeStyle = "rgba(255,255,255,.06)"; g.lineWidth = 2;
    for (let x = 680; x < W + 60; x += 40) { g.beginPath(); g.moveTo(x, 232); g.lineTo(x, atras); g.stroke(); }
    ponCartel(g, cartel("bolera", "BOLERA", { tam: 48, peso: 900, fam: FD, color: "#ffe2f0", glow: "#ff3d84", glowTam: 16, esp: 8 }), 846, 274, 1);
    // canal de atrás, pista y canal de delante
    g.fillStyle = "#1c1d22"; g.fillRect(-60, atras - 12, W + 120, 12);
    const gr = g.createLinearGradient(0, atras, 0, delante);
    gr.addColorStop(0, "#8a5a2c"); gr.addColorStop(0.5, "#d9a466"); gr.addColorStop(1, "#b07a40");
    g.fillStyle = gr; g.fillRect(-60, atras, W + 120, delante - atras);
    g.strokeStyle = "rgba(90,50,16,.25)"; g.lineWidth = 1;
    for (let y = atras + 6; y < delante; y += 7) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    // reflejo de las luces
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.25;
    g.drawImage(BLOB.blanco, 300, atras + 8, 520, 40); g.restore();
    // flechas y línea de falta
    g.fillStyle = "rgba(120,30,20,.75)";
    for (let i = 0; i < 5; i++) {
      const y = atras + 12 + i * 13, x = 520 + Math.abs(i - 2) * 16;
      g.beginPath(); g.moveTo(x + 14, y); g.lineTo(x, y - 4); g.lineTo(x, y + 4); g.closePath(); g.fill();
    }
    g.fillStyle = "rgba(20,20,20,.7)"; g.fillRect(318, atras, 4, delante - atras);
    g.fillStyle = "#1c1d22"; g.fillRect(-60, delante, W + 120, 14);
    g.fillStyle = "#08080a"; g.fillRect(-60, delante + 14, W + 120, 60);
    // foco sobre las botellas
    foco(g, 800, 800, PIES - 20, 150, 0.7);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), xb = this.barrido();
    fondo(g, "#000");
    g.save();
    // las luces barren la pista (de izquierda a derecha al encender, de derecha a izquierda al apagar)
    g.beginPath(); g.rect(-60, -60, xb + 60, H + 120); g.clip();
    this.pista(g);
    // botellas (las de atrás primero)
    const orden = this.bots.slice().sort((a, b) => a.yb - b.yb);
    for (const b of orden) {
      if (b.x > W + 100) continue;
      if (!b.libre) { g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(b.x, b.yb, 15 * b.s, 4 * b.s, 0, 0, 6.283); g.fill(); }
      g.save(); g.translate(b.x, b.y); g.rotate(b.r); botellin(g, b.s); g.restore();
    }
    // la bola
    if (t > T_SUELTA && this.bolaX < W + 60) {
      g.fillStyle = "rgba(0,0,0,.4)"; g.beginPath(); g.ellipse(this.bolaX, PIES - 27, RB * 1.1, 5, 0, 0, 6.283); g.fill();
      bola(g, this.bolaX, this.bolaY, RB, this.bolaRot);
    }
    g.fillStyle = "rgba(0,0,0,.4)"; g.beginPath(); g.ellipse(e.x, PIES - 1, 64, 9, 0, 0, 6.283); g.fill();
    pintarAvatar(g, e.m, e.pose, t);
    this.p.dibujar(g);
    // cámara lenta: viñeta
    const kL = Math.min(tramo(t, T_CHOQUE, T_CHOQUE + 0.15), 1 - tramo(t, T_LENTA_FIN - 0.15, T_LENTA_FIN));
    if (kL > 0) {
      g.save(); g.globalAlpha = 0.55 * kL;
      g.fillStyle = "#000"; g.fillRect(-60, -60, W + 120, 92); g.fillRect(-60, H - 32, W + 120, 92);
      g.restore();
      txt(g, "▶▶ CÁMARA SÚPER LENTA", W - 24, 22, { tam: 16, peso: 800, color: "#ffd34d", alin: "right", esp: 3, alfa: kL * (Math.sin(t * 6) > -0.4 ? 1 : 0.4) });
    }
    // ¡STRIKE!
    if (t > T_STRIKE) {
      const k = tramo(t, T_STRIKE, T_STRIKE + 0.18);
      const c = cartel("strike", "¡STRIKE!", {
        tam: 150, peso: 900, fam: FD, borde: "#2a0004", bordeAncho: 12, esp: 5, glow: "rgba(255,40,80,.8)", glowTam: 26,
        color: (gg, cv) => { const gr = gg.createLinearGradient(0, cv.height * 0.2, 0, cv.height * 0.8); gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#ffd0dc"); gr.addColorStop(1, "#ff3d60"); return gr; },
      });
      ponCartel(g, c, 560, 150, lerp(2.6, 1, eIn(k)) * (1 + 0.025 * Math.sin(t * 10)), Math.min(1, k * 3), -0.06);
      // casilla del marcador con la X
      const k2 = eBack(tramo(t, T_STRIKE + 0.3, T_STRIKE + 0.55));
      if (k2 > 0) {
        g.save(); g.translate(892, 150); g.rotate(0.08); g.scale(k2, k2);
        g.fillStyle = "#fffdf5"; rectR(g, -44, -44, 88, 88, 10); g.fill(); g.strokeStyle = "#111"; g.lineWidth = 5; g.stroke();
        g.strokeStyle = "#e3262f"; g.lineWidth = 12; g.lineCap = "round";
        g.beginPath(); g.moveTo(-24, -24); g.lineTo(24, 24); g.moveTo(24, -24); g.lineTo(-24, 24); g.stroke();
        g.restore();
      }
    }
    g.restore();
    // borde brillante del barrido de luz
    if ((t > 0.05 && t < 0.9) || (t > 8.3 && t < 9.3)) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5;
      g.drawImage(BLOB.blanco, xb - 60, -40, 120, H + 80); g.restore();
    }
  }
}

registrar({ id: "00027", nombre: "Bolos de botellas", crear: () => new EscenaBolos() });
})();
