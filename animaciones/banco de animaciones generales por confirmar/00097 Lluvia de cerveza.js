"use strict";
/*
 * 00097 · LLUVIA DE CERVEZA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Un relámpago ilumina una nube de tormenta y empieza a llover. Abre el paraguas (¡PLOF!)… pero las gotas son doradas
 * y hacen espuma. Saca la mano, la prueba: ¡es cerveza! Tira el paraguas y se pone a cazar gotas con la boca de un
 * lado a otro (¡QUÉ BUEN TIEMPO!). Para de llover; la última gota gorda cae despacio y se la traga (¡GLUP!).
 */
(() => {
const ESC = 1.6, X0 = 512;
const NUBE_Y = 30;
const ABRE = 1.55, TIRA = 3.85, PARA = 7.5, ULTIMA = 8.35;
const textos = cacheTexto();
const PARAGUAS = 112; // largo del palo (unidades de avatar) desde la mano hasta la tela

function pintarNube() {
  const c = lienzoNuevo(W + 200, 220), g = c.getContext("2d");
  const bolas = [];
  const rnd = semilla(9);
  for (let i = 0; i < 16; i++) bolas.push([60 + i * 72 + rnd() * 30, 120 + rnd() * 30, 60 + rnd() * 40]);
  for (let i = 0; i < 10; i++) bolas.push([140 + i * 95 + rnd() * 30, 80 + rnd() * 20, 50 + rnd() * 30]);
  g.fillStyle = "#1e2230";
  for (const [x, y, r] of bolas) { g.beginPath(); g.arc(x, y + 10, r, 0, 6.283); g.fill(); }
  for (const [x, y, r] of bolas) {
    const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.1, x, y, r);
    gr.addColorStop(0, "#6b7185"); gr.addColorStop(1, "#30354a");
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
  }
  return c;
}

/** Paraguas en unidades de avatar: la mano en (0, 0), el palo hacia arriba. k: 0 cerrado → 1 abierto. */
function paraguas(g, x, y, k, ang = 0) {
  g.save(); g.translate(x, y); g.rotate(ang);
  // mango en J
  g.strokeStyle = "#5a3418"; g.lineWidth = 4; g.lineCap = "round";
  g.beginPath(); g.moveTo(0, -4); g.lineTo(0, 12); g.arc(-6, 12, 6, 0, Math.PI); g.stroke();
  // palo
  g.strokeStyle = "#2a2d33"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(0, -2); g.lineTo(0, -PARAGUAS - 8); g.stroke();
  // tela
  const R = lerp(7, 82, k), Hh = lerp(70, 38, k), base = -PARAGUAS + lerp(70, 0, k);
  g.save(); g.translate(0, base);
  const gr = g.createLinearGradient(-R, 0, R, 0);
  gr.addColorStop(0, "#0f3f8f"); gr.addColorStop(0.5, "#2f7fe8"); gr.addColorStop(1, "#0c357a");
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(-R, 0); g.quadraticCurveTo(-R * 0.95, -Hh * 1.1, 0, -Hh); g.quadraticCurveTo(R * 0.95, -Hh * 1.1, R, 0);
  const n = 6;
  for (let i = n - 1; i >= 0; i--) { const xa = -R + (2 * R * i) / n, xb = -R + (2 * R * (i + 1)) / n; g.quadraticCurveTo((xa + xb) / 2, -Hh * 0.18, xa, 0); }
  g.closePath(); g.fill();
  g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 1.2;
  for (let i = 1; i < n; i++) { const xa = -R + (2 * R * i) / n; g.beginPath(); g.moveTo(xa, 0); g.quadraticCurveTo(xa * 0.6, -Hh * 0.8, 0, -Hh); g.stroke(); }
  g.fillStyle = "rgba(255,255,255,.18)"; g.beginPath(); g.ellipse(-R * 0.35, -Hh * 0.62, R * 0.22, Hh * 0.14, -0.4, 0, 6.283); g.fill();
  g.fillStyle = "#2a2d33"; g.beginPath(); g.arc(0, -Hh - 3, 3, 0, 6.283); g.fill();
  g.restore();
  g.restore();
}

class EscenaLluvia extends Escena {
  constructor() {
    super(10.0);
    this.p = new Parts(320);
    this.nube = pintarNube();
    this.gotas = [];
    this.charcos = [[180, 0], [330, 0], [700, 0], [860, 0]]; // [x, tamaño]
    this.suelto = null; // el paraguas tirado
    this.flash = 0; this.rayo = null;
    this.ultima = null; this.tragos = 0;
  }
  xEn(t) {
    if (t < 4.2) return X0;
    if (t < PARA + 0.6) return X0 + 150 * Math.sin((t - 4.2) * 1.9);
    return lerp(X0 + 150 * Math.sin((PARA + 0.6 - 4.2) * 1.9), X0, eInOut(tramo(t, PARA + 0.6, ULTIMA - 0.25)));
  }
  estado() {
    const t = this.t, x = this.xEn(t);
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], kPar = 0, conParaguas = t < TIRA + 0.05;
    if (t > 0.5 && t < 1.2) { pose.cara = "sorpresa"; pose.rc = -0.1 * tramo(t, 0.5, 0.8); }
    // sube el paraguas y lo abre
    const kSube = eInOut(tramo(t, 1.15, 1.5));
    manoD = mezcla(manoD, [64, 94], kSube);
    kPar = eElastico(tramo(t, ABRE, ABRE + 0.45));
    if (t > ABRE && t < 2.6) pose.cara = "sonrisa";
    // saca la mano, la prueba… ¡es cerveza!
    const kSaca = eInOut(tramo(t, 2.5, 2.8)) * (1 - eInOut(tramo(t, 3.1, 3.3)));
    if (kSaca > 0) manoI = mezcla(manoI, [-46, 118], kSaca);
    const kLame = eInOut(tramo(t, 3.1, 3.3)) * (1 - eInOut(tramo(t, 3.55, 3.8)));
    if (kLame > 0) { manoI = mezcla(manoI, [32, 60], kLame); pose.brazoIDelante = true; }
    if (t > 3.3 && t < 3.6) pose.cara = "sorpresa";
    if (t >= 3.6 && t < 4.2) pose.cara = "risa";
    // tira el paraguas
    if (t > 3.7 && t < 4.2) {
      const k = eIn(tramo(t, 3.7, TIRA));
      manoD = mezcla([64, 94], [110, 30], k);
      if (t > TIRA) manoD = mezcla([110, 30], [70, 158], eInOut(tramo(t, TIRA, 4.2)));
    }
    // a cazar gotas: cabeza atrás, boca abierta, brazos abiertos
    if (t >= 4.2 && t < ULTIMA + 0.15) {
      const k = eInOut(tramo(t, 4.2, 4.45));
      pose.rc = -0.3 * k + 0.05 * Math.sin(t * 7);
      pose.cara = (this.tragos > 0 && t - this.tragos < 0.18) ? "risa" : "sorpresa";
      manoD = mezcla(manoD, [104, 66 + 6 * Math.sin(t * 5)], k); manoI = mezcla(manoI, [-26, 66 + 6 * Math.sin(t * 5 + 1)], k);
      const v = Math.cos((t - 4.2) * 1.9);
      if (t < PARA + 0.6 && Math.abs(v) > 0.15) { const a = andar((t - 4.2) * 11, 0.8); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; }
    }
    // ¡glup!: se toca la barriga
    if (t >= ULTIMA + 0.15) {
      pose.cara = t < ULTIMA + 0.5 ? "risa" : "guino";
      manoD = mezcla([104, 66], [52, 128], eInOut(tramo(t, ULTIMA + 0.15, ULTIMA + 0.45)));
      manoI = mezcla([-26, 66], [9, 160], eInOut(tramo(t, ULTIMA + 0.15, ULTIMA + 0.45)));
      if (t > ULTIMA + 0.45) manoD = [52 + 2 * Math.sin(t * 14), 128];
    }
    pose.manoD = manoD; pose.manoI = manoI;
    if (conParaguas) pose.objD = (g, m) => paraguas(g, m[0] - 1, m[1] - 2, kPar);
    const mat = matAv(x, PIES, ESC);
    return { pose, m: mat, x, kPar, conParaguas };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, e = this.estado();
    // relámpago
    this.una("rayo", t > 0.25, () => {
      this.flash = 1; temblar(14, 0.4);
      const pts = []; let x = 760, y = NUBE_Y + 40;
      while (y < PIES - 60) { pts.push([x, y]); x += azar(-40, 40); y += azar(30, 60); }
      this.rayo = { pts, vida: 0.22 };
    });
    if (this.rayo) { this.rayo.vida -= dt; if (this.rayo.vida <= 0) this.rayo = null; }
    this.flash = Math.max(0, this.flash - dt * 3);
    // gotas de cerveza
    const ritmo = t < 0.45 ? 0 : t < PARA ? lerp(20, 110, tramo(t, 0.45, 1.6)) : 0;
    if (this.gotas.length < 140) { let n = ritmo * dt; while (n > 0) { if (Math.random() < n) this.gotas.push({ x: azar(30, W - 30), y: NUBE_Y + 60 + azar(-20, 20), vy: azar(560, 760), s: azar(0.8, 1.25) }); n -= 1; } }
    // la tela del paraguas y la boca
    let tela = null;
    if (e.conParaguas && e.kPar > 0.6) {
      const c = aPant(e.m, [e.pose.manoD[0] - 1, e.pose.manoD[1] - 2 - PARAGUAS]);
      tela = { x: c[0], y: c[1], R: 82 * ESC * e.kPar, H: 38 * ESC };
    }
    const bocaP = aPant(e.m, boca(e.pose.rc || 0));
    const caza = t > 4.3 && t < ULTIMA;
    const quedan = [];
    for (const d of this.gotas) {
      d.vy += 300 * dt; d.y += d.vy * dt;
      if (tela && Math.abs(d.x - tela.x) < tela.R) {
        const u = (d.x - tela.x) / tela.R, techo = tela.y - tela.H * (1 - u * u) * 0.95;
        if (d.y > techo) { p.nueva(P.GOTA, d.x, techo, azar(-120, 120), azar(-220, -80), 0.5, azar(2, 3.5)); if (Math.random() < 0.3) p.nueva(P.ESPUMA, d.x, techo, azar(-60, 60), azar(-120, -40), 0.4, azar(2, 4)); continue; }
      }
      if (caza && Math.hypot(d.x - bocaP[0], d.y - bocaP[1]) < 34) { this.tragos = t; p.nueva(P.ESPUMA, bocaP[0], bocaP[1], azar(-60, 60), azar(-120, -40), 0.35, azar(3, 5)); continue; }
      if (d.y > PIES - 4) {
        p.nueva(P.GOTA, d.x, PIES - 4, azar(-80, 80), azar(-160, -60), 0.4, azar(1.8, 3));
        for (const c of this.charcos) if (Math.abs(c[0] - d.x) < 80) c[1] = Math.min(1, c[1] + 0.012);
        continue;
      }
      quedan.push(d);
    }
    this.gotas = quedan;
    // ¡ups! se moja la mano
    this.una("mano", t > 2.75, () => { const q = aPant(e.m, [-46, 112]); for (let i = 0; i < 6; i++) p.nueva(P.GOTA, q[0] + azar(-6, 6), q[1] - azar(0, 8), azar(-40, 40), azar(-80, -20), 0.35, 2.5); });
    this.una("abre", t > ABRE, () => temblar(5, 0.15));
    // tira el paraguas
    this.una("tira", t > TIRA, () => {
      const q = aPant(e.m, e.pose.manoD);
      this.suelto = { x: q[0], y: q[1], vx: 520, vy: -760, r: 0, vr: 7 };
    });
    if (this.suelto) { const s = this.suelto; s.vy += 1400 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.r += s.vr * dt; }
    this.una("titulo", t > 4.5, () => temblar(10, 0.25));
    // la última gota, gorda y lenta
    this.una("ultima", t > PARA + 0.5, () => { this.ultima = { x: X0, y: NUBE_Y + 70 }; });
    if (this.ultima && !this.ultima.fin) {
      const u = this.ultima, k = tramo(t, PARA + 0.5, ULTIMA);
      u.y = lerp(NUBE_Y + 70, bocaP[1], eIn(k)); u.x = X0;
      if (t >= ULTIMA) { u.fin = true; temblar(8, 0.2); for (let i = 0; i < 14; i++) p.nueva(P.ESPUMA, bocaP[0], bocaP[1], azar(-160, 160), azar(-200, -40), 0.5, azar(3, 6)); }
    }
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    const aEsc = tramo(t, 0.25, 0.3);
    fondo(g, "#000");
    if (aEsc > 0) {
      const cielo = g.createLinearGradient(0, 0, 0, PIES);
      cielo.addColorStop(0, "#151826"); cielo.addColorStop(1, "#2a2a36");
      g.fillStyle = cielo; g.fillRect(-60, -60, W + 120, PIES + 60);
      const su = g.createLinearGradient(0, PIES - 20, 0, H);
      su.addColorStop(0, "#2f2c2a"); su.addColorStop(1, "#1a1816");
      g.fillStyle = su; g.fillRect(-60, PIES - 20, W + 120, H - PIES + 80);
      // charcos de cerveza con espuma
      for (const [cx, k] of this.charcos) {
        if (k <= 0.01) continue;
        const w = 40 + 70 * k;
        g.fillStyle = `rgba(230,150,20,${0.75 * Math.min(1, k * 2)})`; g.beginPath(); g.ellipse(cx, PIES + 4, w, 9 + 4 * k, 0, 0, 6.283); g.fill();
        g.fillStyle = `rgba(255,250,235,${0.8 * Math.min(1, k * 2)})`;
        for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(cx - w * 0.7 + i * w * 0.35, PIES - 2 + (i % 2) * 3, 3 + k * 3, 0, 6.283); g.fill(); }
      }
    }
    // paraguas tirado
    if (this.suelto) { const s = this.suelto; g.save(); g.translate(s.x, s.y); g.rotate(s.r); g.scale(ESC, ESC); paraguas(g, 0, 0, 1); g.restore(); }
    pintarAvatar(g, e.m, e.pose, t);
    this.p.dibujar(g);
    // gotas
    g.fillStyle = "#ffb51f";
    for (const d of this.gotas) { g.beginPath(); g.ellipse(d.x, d.y, 3.2 * d.s, 8.5 * d.s, 0, 0, 6.283); g.fill(); }
    g.fillStyle = "rgba(255,248,215,.8)";
    for (const d of this.gotas) g.fillRect(d.x - 1.2 * d.s, d.y - 4 * d.s, 1.4 * d.s, 3.5 * d.s);
    // la última gota gorda
    if (this.ultima && !this.ultima.fin) {
      const u = this.ultima, s = 2.6;
      g.save(); g.translate(u.x, u.y); g.scale(s, s);
      g.fillStyle = "#ffb51f"; g.beginPath(); g.moveTo(0, -14); g.quadraticCurveTo(9, 2, 0, 9); g.quadraticCurveTo(-9, 2, 0, -14); g.fill();
      g.fillStyle = "#fffaf0"; g.beginPath(); g.arc(-2, -8, 3, 0, 6.283); g.arc(2, -10, 2.4, 0, 6.283); g.fill();
      g.fillStyle = "rgba(255,255,255,.7)"; g.fillRect(-3.5, -2, 1.6, 6);
      g.restore();
    }
    // la nube (se va al final)
    const aN = aEsc * (1 - tramo(t, 8.7, 9.5));
    if (aN > 0) { g.save(); g.globalAlpha = aN; g.drawImage(this.nube, -100, NUBE_Y - 140 - 60 * tramo(t, 8.7, 9.5)); g.restore(); }
    if (this.rayo) {
      g.save(); g.globalCompositeOperation = "lighter"; g.lineJoin = "round";
      for (const [w, c] of [[12, "rgba(160,200,255,.4)"], [4, "rgba(255,255,255,.95)"]]) { g.lineWidth = w; g.strokeStyle = c; g.beginPath(); this.rayo.pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.stroke(); }
      g.restore();
    }
    // ¡PLOF!
    if (t > ABRE && t < ABRE + 0.7) {
      const q = aPant(e.m, [e.pose.manoD[0] + 90, e.pose.manoD[1] - PARAGUAS - 20]), d = t - ABRE;
      g.save(); g.translate(q[0], q[1]); g.rotate(0.12); g.scale(eBack(tramo(d, 0, 0.12)), eBack(tramo(d, 0, 0.12)));
      txt(g, "¡PLOF!", 0, 0, { tam: 50, peso: 400, fam: FC, color: "#d6ecff", borde: "#0c2c5a", bordeAncho: 7, alfa: 1 - tramo(d, 0.45, 0.7), esp: 2 });
      g.restore();
    }
    // ¡es cerveza!: un «!» encima
    if (t > 3.3 && t < 4.0) {
      const q = aPant(e.m, [70, -20]), k = eBack(tramo(t, 3.3, 3.42));
      g.save(); g.translate(q[0] + 30, q[1] - 20); g.scale(k, k);
      txt(g, "!", 0, 0, { tam: 110, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a2200", bordeAncho: 9, alfa: 1 - tramo(t, 3.8, 4.0) });
      g.restore();
    }
    // ¡QUÉ BUEN TIEMPO!
    if (t > 4.5) {
      const tit = this.titulo(), k = tramo(t, 4.5, 4.64), s = lerp(2.6, 1, eIn(k)) * (1 + 0.025 * Math.sin(t * 6));
      const a = Math.min(1, k * 4) * (1 - tramo(t, 9.1, 9.6));
      if (tit) { g.save(); g.globalAlpha = a; g.translate(W / 2, 168); g.rotate(-0.03); g.scale(s, s); g.drawImage(tit, -tit.width / 2, -tit.height / 2); g.restore(); }
    }
    // ¡GLUP!
    if (t > ULTIMA && t < ULTIMA + 0.9) {
      const q = aPant(e.m, [80, 30]), d = t - ULTIMA;
      g.save(); g.translate(q[0] + 70, q[1] + 10); g.rotate(-0.12); g.scale(eBack(tramo(d, 0, 0.12)), eBack(tramo(d, 0, 0.12)));
      txt(g, "¡GLUP!", 0, 0, { tam: 60, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a2200", bordeAncho: 8, alfa: 1 - tramo(d, 0.6, 0.9), esp: 2 });
      g.restore();
    }
    if (this.flash > 0) { g.fillStyle = `rgba(235,240,255,${0.8 * this.flash})`; g.fillRect(-60, -60, W + 120, H + 120); }
    const osc = Math.max(t < 0.25 ? 1 : 0, tramo(t, 9.4, 9.95));
    if (osc > 0) { g.fillStyle = `rgba(0,0,0,${osc})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (textos.has(1)) return textos.get(1);
    const c = lienzoNuevo(1000, 170), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 130);
    gr.addColorStop(0, "#fff9d6"); gr.addColorStop(0.5, "#ffc21f"); gr.addColorStop(1, "#d97a00");
    txt(g, "¡QUÉ BUEN TIEMPO!", 500, 118, { tam: 92, peso: 400, fam: FB, color: gr, borde: "#3a1d00", bordeAncho: 12, esp: 2, glow: "rgba(255,190,40,.7)", glowTam: 22, max: 960 });
    textos.set(1, c);
    return c;
  }
}

registrar({ id: "00097", nombre: "Lluvia de cerveza", crear: () => new EscenaLluvia() });
})();
