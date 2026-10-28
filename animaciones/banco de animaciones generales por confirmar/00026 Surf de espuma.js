"use strict";
/*
 * 00026 · SURF DE ESPUMA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Entra por la izquierda una ola gigante de cerveza con cresta de espuma y él encima, de pie sobre una bandeja,
 * haciendo equilibrio (¡OLA!, con las letras haciendo la ola). Da un saltito, se tambalea, se recupera… y al final se
 * cae. La cerveza se calma y solo asoma una mano con el pulgar arriba. La espuma sube, tapa la pantalla y sus
 * burbujas se van rompiendo hasta dejarla en negro.
 */
(() => {
const CACHE = cacheTexto();
function letra(s) {
  let c = CACHE.get(s);
  if (c) return c;
  const tam = 150, pad = 30;
  const m = lienzoNuevo(1, 1).getContext("2d");
  m.font = `400 ${tam}px ${FB}`;
  c = lienzoNuevo(m.measureText(s).width + pad * 2, tam * 1.3 + pad * 2);
  const g = c.getContext("2d");
  const gr = g.createLinearGradient(0, pad, 0, c.height - pad);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.6, "#fff6dc"); gr.addColorStop(1, "#f2d08a");
  txt(g, s, c.width / 2, c.height / 2 + tam * 0.36, { tam, peso: 400, fam: FB, color: gr, borde: "#8a4a00", bordeAncho: 12, glow: "rgba(255,190,60,.7)", glowTam: 18 });
  CACHE.set(s, c);
  return c;
}

const Y_BAJO = 660, Y_CRESTA = 392, CALMA = 476;
const PIEL = ["#f6cfae", "#d79c74", "#a8704c"];

/** Mano con el pulgar arriba saliendo de la cerveza; (x, y) = la superficie. */
function pulgar(g, x, y, s, rot, t) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.fillStyle = CAMISA; rectR(g, -15, -36, 30, 70, 7); g.fill();
  g.fillStyle = "#1c1c1d"; g.fillRect(-15, -36, 30, 6);
  const gr = g.createLinearGradient(-20, 0, 20, 0);
  gr.addColorStop(0, PIEL[1]); gr.addColorStop(0.45, PIEL[0]); gr.addColorStop(1, PIEL[2]);
  g.fillStyle = gr; g.strokeStyle = "#7a4a2c"; g.lineWidth = 1.6;
  // puño visto de lado: dorso y cuatro dedos doblados
  rectR(g, -19, -70, 30, 40, 10); g.fill(); g.stroke();
  for (let i = 0; i < 4; i++) { rectR(g, -2, -69 + i * 9.6, 24, 10.6, 5.3); g.fill(); g.stroke(); }
  // pulgar hacia arriba
  g.save(); g.translate(-10, -64); g.rotate(-0.14 + 0.06 * Math.sin(t * 6));
  rectR(g, -9, -38, 18, 44, 9); g.fill(); g.stroke();
  g.fillStyle = "rgba(255,238,225,.85)"; rectR(g, -5, -34, 10, 10, 4.5); g.fill();
  g.restore();
  g.restore();
  g.restore();
}
/** Bandeja de camarero (redonda, vista de lado); (x, y) = centro. */
function bandeja(g, x, y, ang, s = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  g.fillStyle = "#5c636c"; g.beginPath(); g.ellipse(0, 4, 62, 13, 0, 0, 6.283); g.fill();
  const gr = g.createLinearGradient(-60, 0, 60, 0);
  gr.addColorStop(0, "#8f98a2"); gr.addColorStop(0.45, "#eef2f5"); gr.addColorStop(1, "#7a838d");
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 62, 12, 0, 0, 6.283); g.fill();
  g.strokeStyle = "#c9d0d6"; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 0, 54, 9, 0, 0, 6.283); g.stroke();
  g.restore();
}

class EscenaSurf extends Escena {
  constructor() {
    super(9.8);
    this.p = new Parts(420);
    this.ESC = 1.15;
    this.tCae = 5.75; this.tMano = 6.95;
    const rnd = semilla(31);
    this.burbujas = [];
    for (let i = 0; i < 46; i++) this.burbujas.push({ x: rnd() * (W + 100) - 50, v: 40 + rnd() * 70, f: rnd() * 600, r: 2 + rnd() * 4 });
    this.espuma = [];
    for (let fy = 0; fy < 12; fy++) for (let fx = 0; fx < 19; fx++) {
      this.espuma.push({ x: fx * 58 - 10 + rnd() * 30, y: fy * 58 - 20 + rnd() * 30, r: 40 + rnd() * 26, pop: 9.0 + rnd() * 0.62 });
      if (rnd() < 0.5) this.espuma.push({ x: fx * 58 + 20 + rnd() * 20, y: fy * 58 + 10 + rnd() * 20, r: 18 + rnd() * 14, pop: 9.0 + rnd() * 0.62 });
    }
    this.bandejaSuelta = null;
  }
  cresta(t) {
    if (t < 1.3) return lerp(-260, 360, eOut(t / 1.3));
    if (t < 5.4) return lerp(360, 610, tramo(t, 1.3, 5.4));
    return 610 + 900 * Math.pow(t - 5.4, 1.4);
  }
  /** altura de la superficie en x */
  sup(x, t) {
    const C = this.cresta(t), u = x - C;
    const calma = tramo(t, 5.6, 7.2);
    const alto = lerp(478, CALMA, calma), cresta = lerp(Y_CRESTA, CALMA, calma);
    const ond = 5 * Math.sin(x * 0.03 + t * 4) + 3 * Math.sin(x * 0.071 - t * 6);
    if (u <= 0) return alto - (alto - cresta) * Math.exp(-(u * u) / (200 * 200)) + ond * (0.5 + 0.5 * calma);
    const k = Math.min(1, u / 300);
    const bajo = lerp(Y_BAJO, CALMA, calma);
    return cresta + (bajo - cresta) * (1 - Math.pow(1 - k, 2.2)) + ond * 0.5;
  }
  estado() {
    const t = this.t, ESC = this.ESC;
    const pose = { cara: "risa", rc: 0, piernaI: [0, 0.2], piernaD: [0, -0.2] };
    const C = this.cresta(Math.min(t, 5.4));
    let x = C - 52 + 14 * Math.sin(t * 1.7), giro = 0, extra = 0;
    let manoD = [122, 112 + 8 * Math.sin(t * 3)], manoI = [-44, 112 - 8 * Math.sin(t * 3)];
    const y0 = this.sup(x, Math.min(t, 5.4));
    const pend = (this.sup(x + 10, Math.min(t, 5.4)) - this.sup(x - 10, Math.min(t, 5.4))) / 20;
    giro = Math.atan(pend) * 0.6 + 0.06 * Math.sin(t * 2.3);
    // saltito
    const s = tramo(t, 2.5, 3.05);
    extra = 70 * 4 * s * (1 - s);
    if (s > 0 && s < 1) { pose.cara = "risa"; giro += -0.25 * Math.sin(Math.PI * s); pose.piernaI = [-8, 0.28]; pose.piernaD = [-8, -0.28]; manoD = [118, 40]; manoI = [-40, 40]; }
    // se tambalea y se recupera
    if (t > 3.6 && t < 4.6) {
      const k = Math.sin(Math.PI * tramo(t, 3.6, 4.6));
      giro += 0.32 * k * Math.sin(t * 13);
      manoD = [122 + 10 * Math.sin(t * 17), 70 + 50 * Math.sin(t * 13)]; manoI = [-44 - 10 * Math.sin(t * 17), 70 - 50 * Math.sin(t * 13)];
      pose.cara = "sorpresa"; pose.rc = 0.15 * Math.sin(t * 9);
    }
    if (t >= 4.6 && t < 5.3) { pose.cara = "guino"; manoD = [100, 150]; manoI = [-22, 112]; pose.rc = 0.08; }
    // se cae
    let hundir = 0;
    if (t >= 5.3) {
      const k = tramo(t, 5.3, this.tCae);
      giro += 0.3 * Math.sin(t * 16) * k - 1.4 * eIn(tramo(t, 5.55, this.tCae + 0.1));
      x -= 40 * eIn(tramo(t, 5.5, 6.0));
      manoD = [120, 30 + 40 * Math.sin(t * 20)]; manoI = [-40, 30 - 40 * Math.sin(t * 20)];
      pose.cara = "sorpresa"; pose.piernaD = [-10, -0.45];
      hundir = 260 * eIn(tramo(t, this.tCae, this.tCae + 0.5));
    }
    pose.manoD = manoD; pose.manoI = manoI;
    pose.brazoIDelante = false;
    const yPies = y0 - 12 - extra + hundir;
    const m = matAv(x, yPies, ESC, giro, 1, 1);
    return { pose, m, x, yPies, giro, visible: t < this.tCae + 0.55 };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const C = this.cresta(t);
    // espuma que salta de la cresta
    if (t < 6.3 && C > -100 && C < W + 120 && Math.random() < 60 * dt) {
      const y = this.sup(C, t);
      p.nueva(P.ESPUMA, C + azar(-10, 40), y + azar(-6, 10), azar(-60, 160), azar(-260, -80), azar(0.4, 0.8), azar(5, 11));
    }
    if (t < 6.3 && Math.random() < 25 * dt) { const x = C + azar(20, 120), y = this.sup(x, t); if (y < H) p.nueva(P.GOTA, x, y, azar(40, 200), azar(-200, -60), 0.8, azar(3, 5)); }
    this.una("salto", t > 3.05, () => { const e = this.estado(); for (let i = 0; i < 18; i++) p.nueva(P.ESPUMA, e.x + azar(-40, 40), e.yPies, azar(-150, 150), azar(-240, -60), azar(0.4, 0.8), azar(5, 9)); temblar(5, 0.15); });
    this.una("cae", t > this.tCae + 0.15, () => {
      const e = this.estado();
      temblar(22, 0.5);
      const y = this.sup(e.x, t);
      for (let i = 0; i < 50; i++) p.nueva(P.ESPUMA, e.x + azar(-50, 50), y, azar(-260, 260), azar(-520, -150), azar(0.6, 1.2), azar(6, 13));
      for (let i = 0; i < 24; i++) p.nueva(P.GOTA, e.x + azar(-30, 30), y, azar(-300, 300), azar(-600, -250), 1.4, azar(3, 6));
      this.bandejaSuelta = { x: e.x + 20, y: e.yPies - 20, vx: 260, vy: -620, r: 0, vr: 9 };
      this.xCae = e.x;
    });
    if (this.bandejaSuelta) {
      const B = this.bandejaSuelta;
      const ys = this.sup(B.x, t) - 4;
      if (B.y < ys || B.vy < 0) { B.vy += 1500 * dt; B.x += B.vx * dt; B.y += B.vy * dt; B.r += B.vr * dt; if (B.y >= ys && B.vy > 0) { B.flota = true; for (let i = 0; i < 12; i++) p.nueva(P.ESPUMA, B.x, ys, azar(-120, 120), azar(-200, -60), azar(0.4, 0.7), azar(4, 8)); } }
      if (B.flota) { B.y = ys + 3; B.vx *= 1 - 2 * dt; B.x += B.vx * dt; B.r -= Math.PI * Math.round(B.r / Math.PI); B.r = lerp(B.r, 0.06 * Math.sin(t * 3), 10 * dt); B.vy = 0; }
    }
    // burbujas del que se ha hundido
    if (this.xCae && t > 6.2 && t < 8.6 && Math.random() < 12 * dt) p.nueva(P.ESPUMA, this.xCae + azar(-20, 20), this.sup(this.xCae, t) + 4, azar(-20, 20), azar(-90, -30), azar(0.3, 0.6), azar(3, 7));
    this.una("mano", t > this.tMano, () => { temblar(6, 0.15); const y = this.sup(this.xCae || 520, t); for (let i = 0; i < 16; i++) p.nueva(P.ESPUMA, (this.xCae || 520) + 40, y, azar(-150, 150), azar(-280, -80), azar(0.4, 0.8), azar(4, 9)); });
    p.alfa = t < 9.0 ? 1 : 0;
    p.actualizar(dt);
  }
  pintarCerveza(g, t) {
    const pts = [];
    for (let x = -64; x <= W + 64; x += 16) pts.push([x, Math.min(H + 80, this.sup(x, t))]);
    g.save();
    g.beginPath(); g.moveTo(-60, H + 80);
    for (const q of pts) g.lineTo(q[0], q[1]);
    g.lineTo(W + 60, H + 80); g.closePath();
    const gr = g.createLinearGradient(0, Y_CRESTA - 20, 0, H);
    gr.addColorStop(0, "#ffd04a"); gr.addColorStop(0.35, "#f0a010"); gr.addColorStop(1, "#7a3a00");
    g.fillStyle = gr; g.fill();
    g.restore();
    // burbujas dentro (solo las que quedan por debajo de la superficie)
    g.fillStyle = "rgba(255,245,200,.55)";
    g.beginPath();
    for (const b of this.burbujas) {
      const y = H + 20 - ((b.f + t * b.v) % 420), x = b.x + 4 * Math.sin(t * 3 + b.f);
      if (y - b.r < this.sup(x, t) + 8) continue;
      g.moveTo(x + b.r, y); g.arc(x, y, b.r, 0, 6.283);
    }
    g.fill();
    // espuma de la superficie (más gorda cerca de la cresta)
    const C = this.cresta(t);
    g.save(); g.lineJoin = "round"; g.lineCap = "round";
    g.strokeStyle = "#fff7e6"; g.lineWidth = 9;
    g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1] - 2) : g.moveTo(q[0], q[1] - 2))); g.stroke();
    g.fillStyle = "#fffaf0"; g.beginPath();
    for (let x = Math.max(-60, C - 260); x <= Math.min(W + 60, C + 90); x += 10) {
      const u = x - C, y = this.sup(x, t);
      if (y > H + 20) continue;
      const k = Math.exp(-((u + 20) * (u + 20)) / (110 * 110));
      const r = 6 + 16 * k + 3 * Math.sin(x * 0.3 + t * 9);
      g.moveTo(x + r, y - r * 0.4); g.arc(x, y - r * 0.4, r, 0, 6.283);
    }
    g.fill();
    g.restore();
    // labio de la ola que se riza hacia delante
    if (t < 6.6 && C > -120 && C < W + 200) {
      const yC = this.sup(C, t), k = 1 - tramo(t, 5.6, 6.4);
      g.save(); g.globalAlpha = k;
      g.fillStyle = "#fffaf0"; g.strokeStyle = "rgba(200,150,60,.5)"; g.lineWidth = 2;
      g.beginPath(); g.moveTo(C - 30, yC + 6);
      g.quadraticCurveTo(C + 40, yC - 40, C + 92, yC + 6);
      g.quadraticCurveTo(C + 100, yC + 36, C + 76, yC + 52);
      g.quadraticCurveTo(C + 70, yC + 20, C + 40, yC + 18);
      g.quadraticCurveTo(C + 10, yC + 20, C - 30, yC + 6); g.closePath(); g.fill(); g.stroke();
      for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(C - 10 + i * 18, yC - 10 - 12 * Math.sin(i * 0.6) + 3 * Math.sin(t * 10 + i), 9 + (i % 2) * 4, 0, 6.283); g.fill(); }
      g.restore();
    }
  }
  dibujar(g) {
    const t = this.t;
    fondo(g, "#000");
    const tapado = t >= 9.0;
    if (!tapado) {
      // cielo: un brillo cálido detrás
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.18 * tramo(t, 0.3, 1.2);
      g.drawImage(BLOB.naranja, -200, 80, W + 400, 560); g.restore();
      this.pintarCerveza(g, t);
      const e = this.estado();
      // bandeja bajo los pies, el avatar recortado por encima de la cerveza
      if (e.visible) {
        g.save();
        if (t > this.tCae - 0.1) {
          g.beginPath(); g.moveTo(-60, -60);
          for (let x = -60; x <= W + 60; x += 12) g.lineTo(x, this.sup(x, t) + 4);
          g.lineTo(W + 60, -60); g.closePath(); g.clip();
        }
        if (!this.bandejaSuelta) { const q = aPant(e.m, [39, 236]); bandeja(g, q[0], q[1], e.giro); }
        pintarAvatar(g, e.m, e.pose, t);
        g.restore();
      }
      if (this.bandejaSuelta) { const B = this.bandejaSuelta; bandeja(g, B.x, B.y, B.r); }
      // la mano con el pulgar arriba
      if (t > this.tMano) {
        const x = (this.xCae || 520) + 40, y = this.sup(x, t) + 6;
        const k = eBack(tramo(t, this.tMano, this.tMano + 0.35));
        g.save(); g.beginPath(); g.rect(-60, -60, W + 120, y + 60); g.clip();
        pulgar(g, x, y + (1 - k) * 150 + 3 * Math.sin(t * 4), 1.5, 0.05 * Math.sin(t * 3), t);
        g.restore();
        g.fillStyle = "#fffaf0"; g.beginPath(); g.ellipse(x, y - 1, 40, 9, 0, 0, 6.283); g.fill();
      }
      this.p.dibujar(g);
      // ¡OLA! con las letras haciendo la ola
      if (t > 1.15 && t < 6.0) {
        const a = tramo(t, 1.15, 1.45) * (1 - tramo(t, 5.6, 6.0));
        const letras = ["¡", "O", "L", "A", "!"];
        let x = 600;
        const anchos = letras.map((s) => letra(s).width - 60);
        const total = anchos.reduce((q, w) => q + w, 0);
        x = 760 - total / 2;
        letras.forEach((s, i) => {
          const c = letra(s), sube = 26 * Math.sin(t * 5 - i * 0.9), k = eBack(tramo(t, 1.15 + i * 0.07, 1.4 + i * 0.07));
          g.save(); g.globalAlpha = a; g.translate(x + anchos[i] / 2, 140 + sube); g.rotate(0.12 * Math.cos(t * 5 - i * 0.9)); g.scale(k, k);
          g.drawImage(c, -c.width / 2, -c.height / 2); g.restore();
          x += anchos[i];
        });
      }
    }
    // la espuma sube, lo tapa todo y sus burbujas se rompen
    if (t > 8.25) {
      const tope = lerp(H + 80, -120, eInOut(tramo(t, 8.25, 9.0)));
      const sp = SPR.espuma;
      for (const b of this.espuma) {
        if (b.y < tope) continue;
        const crece = clamp((b.y - tope) / 90, 0, 1);
        const r = b.r * crece * (t > b.pop ? Math.max(0, 1 - (t - b.pop) / 0.1) : 1);
        if (t > b.pop && t < b.pop + 0.16) {
          const u = (t - b.pop) / 0.16;
          g.strokeStyle = `rgba(255,250,235,${0.8 * (1 - u)})`; g.lineWidth = 3; g.beginPath(); g.arc(b.x, b.y, b.r * (1 + 0.5 * u), 0, 6.283); g.stroke();
        }
        if (r < 0.5) continue;
        g.drawImage(sp, b.x - r, b.y - r, r * 2, r * 2);
      }
    }
  }
}

registrar({ id: "00026", nombre: "Surf de espuma", crear: () => new EscenaSurf() });
})();
