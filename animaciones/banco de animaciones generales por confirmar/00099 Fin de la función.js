"use strict";
/*
 * 00099 · FIN DE LA FUNCIÓN
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se encienden las candilejas de un teatro. Él, solo en el escenario, brinda con la última lata y se la bebe de un
 * trago; la sacude (cae una gota: está vacía) y la tira entre bastidores. Hace una gran reverencia: le llueven rosas
 * y ¡BRAVO! desde el público. Cae el telón rojo de golpe: FIN DE LA FUNCIÓN. La lata vuelve a caer delante del
 * telón. Se apaga el foco.
 */
(() => {
const X = 512, ESC = 1.55;
const TELON = 6.55, TELON_FIN = 7.1;
const textos = cacheTexto();

/** Terciopelo rojo con pliegues (ancho W, alto h). */
function terciopelo(w, h, pliegue) {
  const c = lienzoNuevo(w, h), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, w, 0);
  const n = Math.max(2, Math.round(w / pliegue));
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    gr.addColorStop(Math.min(1, u), i % 2 ? "#5e0710" : "#c41a28");
    if (i < n) gr.addColorStop(Math.min(1, u + 0.5 / n), i % 2 ? "#8f0f1c" : "#e0303e");
  }
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const os = g.createLinearGradient(0, 0, 0, h);
  os.addColorStop(0, "rgba(0,0,0,.35)"); os.addColorStop(0.3, "rgba(0,0,0,0)"); os.addColorStop(1, "rgba(0,0,0,.25)");
  g.fillStyle = os; g.fillRect(0, 0, w, h);
  return c;
}
function flecos(g, x0, x1, y) {
  const gr = g.createLinearGradient(0, y, 0, y + 22);
  gr.addColorStop(0, "#fff0a0"); gr.addColorStop(1, "#b07d00");
  g.fillStyle = gr; g.fillRect(x0, y, x1 - x0, 8);
  for (let x = x0; x < x1; x += 7) g.fillRect(x, y + 6, 3.5, 14);
}

function pintarEscenario() {
  const c = lienzoNuevo(W, H), g = c.getContext("2d");
  g.fillStyle = "#0a0607"; g.fillRect(0, 0, W, H);
  // suelo de tablas
  const su = g.createLinearGradient(0, PIES - 40, 0, H);
  su.addColorStop(0, "#3a2414"); su.addColorStop(1, "#6a4426");
  g.fillStyle = su; g.fillRect(0, PIES - 40, W, H - PIES + 40);
  g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2;
  for (let y = PIES - 30; y < H; y += 12) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  // bambalinas laterales
  const lado = terciopelo(170, H, 34);
  g.drawImage(lado, -20, 0);
  g.save(); g.translate(W + 20, 0); g.scale(-1, 1); g.drawImage(lado, 0, 0); g.restore();
  g.drawImage(pintarBambalina(), 0, 0);
  return c;
}
/** Bambalina de arriba con sus ondas y flecos (fondo transparente). */
function pintarBambalina() {
  const c = lienzoNuevo(W, 96), g = c.getContext("2d");
  g.drawImage(terciopelo(W, 70, 60), 0, 0);
  g.fillStyle = "#c41a28";
  for (let x = 0; x < W; x += 64) { g.beginPath(); g.arc(x + 32, 66, 32, 0, Math.PI); g.fill(); }
  flecos(g, 0, W, 70);
  return c;
}

/** Rosa (el tallo hacia abajo desde (0, 0) girado ang). */
function rosa(g, x, y, ang, s) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  g.strokeStyle = "#2e7d32"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 34); g.stroke();
  g.fillStyle = "#3a9b3e"; g.beginPath(); g.ellipse(6, 18, 7, 3.5, -0.6, 0, 6.283); g.fill();
  g.fillStyle = "#b0101f"; g.beginPath(); g.arc(0, -4, 9, 0, 6.283); g.fill();
  g.fillStyle = "#e3263a"; g.beginPath(); g.arc(-2, -6, 6, 0, 6.283); g.fill();
  g.strokeStyle = "#7a0a14"; g.lineWidth = 1.4; g.beginPath(); g.arc(0, -5, 3.5, 0.5, 5); g.stroke();
  g.restore();
}

class EscenaFin extends Escena {
  constructor() {
    super(10.6);
    this.p = new Parts(260);
    this.esc = pintarEscenario();
    this.telon = terciopelo(W, H, 52);
    this.bambalina = pintarBambalina();
    this.rosas = [];
    this.lata = null;
    this.vuelve = null;
  }
  luz() {
    const t = this.t;
    const on = t < 0.75 ? [0, 1, 0, 0, 1, 0.35, 1][Math.min(6, Math.floor(t / 0.1))] : 1;
    return on;
  }
  yTelon(t) {
    if (t < TELON) return -10;
    if (t < TELON_FIN) return lerp(-10, H, eIn(tramo(t, TELON, TELON_FIN)));
    return H - 18 * Math.abs(Math.sin((t - TELON_FIN) * 14)) * Math.exp(-(t - TELON_FIN) * 7);
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [62, 120], manoI = [9, 160], sx = 1, sy = 1, angLata = 0, lataVis = t < 4.05;
    // brinda hacia el público
    const kBr = eBack(tramo(t, 0.8, 1.1)) * (1 - eInOut(tramo(t, 1.25, 1.45)));
    manoD = mezcla(manoD, [100, 52], kBr);
    if (t > 0.8 && t < 1.4) pose.cara = "guino";
    // se la bebe de un trago
    const kBoca = eInOut(tramo(t, 1.45, 1.75)) * (1 - eInOut(tramo(t, 3.05, 3.3)));
    const kTrago = eInOut(tramo(t, 1.75, 2.95)) * (1 - eInOut(tramo(t, 3.05, 3.3)));
    pose.rc = -0.36 * kTrago + (kTrago > 0.05 && kTrago < 0.95 ? 0.02 * Math.sin(t * 42) : 0);
    angLata = -0.4 * kBoca - 1.55 * kTrago;
    if (kBoca > 0) { const b = boca(pose.rc), tope = rot2([1.5, -13], angLata); manoD = mezcla(manoD, [b[0] - tope[0] + 2, b[1] - tope[1] + 1], kBoca); }
    if (t > 2.95 && t < 3.4) pose.cara = "dormido"; // ¡aah!
    // la sacude boca abajo: está vacía
    if (t > 3.35 && t < 3.85) {
      const k = eInOut(tramo(t, 3.35, 3.5));
      manoD = mezcla([62, 120], [88, 40 + 4 * Math.sin(t * 40)], k); angLata = Math.PI * k;
      pose.cara = "sorpresa"; pose.rc = 0.1 * k;
    }
    // la tira por encima del hombro
    if (t >= 3.85 && t < 4.4) {
      const k = eIn(tramo(t, 3.85, 4.05));
      manoD = mezcla([88, 40], [70, -16], k); angLata = Math.PI + 2 * k;
      if (t > 4.05) manoD = mezcla([70, -16], [70, 158], eInOut(tramo(t, 4.05, 4.4)));
      pose.cara = "guino";
    }
    // gran reverencia
    if (t >= 4.4 && t < 6.6) {
      const kB = eInOut(tramo(t, 4.45, 4.8)) * (1 - eInOut(tramo(t, 5.35, 5.65)));
      const kFl = eOut(tramo(t, 4.4, 4.7));
      manoD = mezcla([70, 158], [44, 124], kFl);
      manoI = mezcla(mezcla([9, 160], [-50, 70], kFl), [-38, 168], kB);
      sy = 1 - 0.2 * kB; sx = 1 + 0.06 * kB;
      pose.rc = 0.1 * kB;
      pose.cara = kB > 0.5 ? "dormido" : "guino";
      pose.piernaI = [0, 0.05 * kB]; pose.piernaD = [0, -0.05 * kB];
      // brazos abiertos recibiendo el aplauso
      if (t > 5.6) {
        const k = eBack(tramo(t, 5.6, 5.9));
        manoD = mezcla([44, 124], [110, 70], k); manoI = mezcla([-38, 168], [-32, 70], k);
        pose.cara = "risa"; pose.rc = 0.05 * Math.sin(t * 6);
      }
    }
    if (t >= 6.6) { manoD = [110, 70]; manoI = [-32, 70]; pose.cara = "sorpresa"; }
    pose.manoD = manoD; pose.manoI = manoI;
    if (lataVis) pose.objD = (g, m) => dibujarLata(g, m[0], m[1], angLata, { abierta: true });
    return { pose, m: matAv(X, PIES, ESC, 0, sx, sy), angLata };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, e = this.estado();
    if (t > 1.85 && t < 2.9 && Math.random() < 0.3) { const q = aPant(e.m, boca(e.pose.rc)); p.nueva(P.GOTA, q[0] - 6, q[1] + 4, azar(-60, 20), azar(-30, 30), 0.8, azar(2.5, 4)); }
    this.una("gota", t > 3.55, () => { const q = aPant(e.m, [e.pose.manoD[0], e.pose.manoD[1] + 14]); p.nueva(P.GOTA, q[0], q[1], 0, 40, 1.2, 5); });
    this.una("tira", t > 4.05, () => {
      const q = aPant(e.m, e.pose.manoD);
      this.lata = { x: q[0], y: q[1], vx: 380, vy: -900, r: 0, vr: 16 };
    });
    if (this.lata) { const L = this.lata; L.vy += 1500 * dt; L.x += L.vx * dt; L.y += L.vy * dt; L.r += L.vr * dt; }
    // rosas desde el público
    if (t > 4.7 && t < 6.4 && this.rosas.length < 11 && Math.random() < 7 * dt) {
      const xd = X + azar(-330, 330), T = azar(0.7, 0.9), x0 = xd + azar(-120, 120), y0 = H + 40, yd = PIES + azar(-12, 14);
      this.rosas.push({ x: x0, y: y0, vx: (xd - x0) / T, vy: (yd - y0 - 0.5 * 1400 * T * T) / T, r: azar(0, 6), vr: azar(-10, 10), yd, quieta: false, rf: azar(-1.7, -1.4) * (Math.random() < 0.5 ? 1 : -1) });
    }
    for (const r of this.rosas) {
      if (r.quieta) continue;
      r.vy += 1400 * dt; r.x += r.vx * dt; r.y += r.vy * dt; r.r += r.vr * dt;
      if (r.vy > 0 && r.y >= r.yd) { r.y = r.yd; r.quieta = true; r.r = r.rf; }
    }
    this.una("telon", t > TELON_FIN, () => {
      temblar(24, 0.6);
      for (let i = 0; i < 40; i++) p.nueva(P.POLVO, azar(0, W), H - azar(0, 20), azar(-260, 260), azar(-120, -20), azar(0.7, 1.3), azar(36, 64));
    });
    this.una("titulo", t > 7.35, () => {
      temblar(10, 0.25);
      for (let i = 0; i < 26; i++) p.nueva(P.PURPURINA, W / 2 + azar(-380, 380), azar(200, 360), azar(-30, 30), azar(-40, 20), azar(1, 1.8), azar(8, 14));
    });
    // la lata vuelve a caer delante del telón
    this.una("vuelve", t > 8.35, () => { this.vuelve = { x: 700, y: -40, vx: -60, vy: 0, r: 0, vr: 9, botes: 0 }; });
    if (this.vuelve) {
      const L = this.vuelve; L.vy += 1500 * dt; L.x += L.vx * dt; L.y += L.vy * dt; L.r += L.vr * dt;
      if (L.y > PIES + 6) { L.y = PIES + 6; L.vy *= -0.4; L.vr *= 0.6; L.botes++; if (L.botes === 1) temblar(5, 0.15); if (Math.abs(L.vy) < 50) { L.vy = 0; L.vx *= 0.9; } }
    }
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), luz = this.luz(), yT = this.yTelon(t);
    fondo(g, "#000");
    g.drawImage(this.esc, 0, 0);
    if (yT < H - 1) {
      foco(g, X, X, PIES, 175, luz);
      // rosas en el suelo y volando
      for (const r of this.rosas) rosa(g, r.x, r.y, r.r, 1.25);
      pintarAvatar(g, e.m, e.pose, t);
      if (this.lata) { g.save(); g.translate(this.lata.x, this.lata.y); g.scale(ESC, ESC); dibujarLata(g, 0, 0, this.lata.r, { abierta: true }); g.restore(); }
    }
    this.p.dibujar(g);
    // ¡BRAVO! desde el público
    for (const [t0, x, rot] of [[4.85, 230, -0.15], [5.25, 800, 0.12], [5.75, 330, 0.08]]) {
      const d = t - t0; if (d < 0 || d > 1.1) continue;
      g.save(); g.translate(x, 470 - 30 * d); g.rotate(rot); g.scale(eBack(tramo(d, 0, 0.15)), eBack(tramo(d, 0, 0.15)));
      txt(g, "¡BRAVO!", 0, 0, { tam: 56, peso: 400, fam: FC, color: "#fffdf5", borde: "#5a0710", bordeAncho: 8, alfa: 1 - tramo(d, 0.8, 1.1), esp: 2 });
      g.restore();
    }
    // el telón
    if (yT > -9) {
      g.drawImage(this.telon, 0, yT - H);
      flecos(g, 0, W, yT - 6);
      g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(0, yT + 16, W, 6);
      // foco sobre el telón cerrado
      if (t > TELON_FIN) {
        g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35 * tramo(t, TELON_FIN, TELON_FIN + 0.4);
        g.drawImage(BLOB.amarillo, W / 2 - 420, 120, 840, 380); g.restore();
      }
    }
    // bambalina de arriba siempre por delante
    g.drawImage(this.bambalina, 0, 0);
    // FIN DE LA FUNCIÓN
    if (t > 7.35) {
      const tit = this.titulo(), k = tramo(t, 7.35, 7.6), s = lerp(1.4, 1, eOut(k));
      if (tit) { g.save(); g.globalAlpha = Math.min(1, k * 2); g.translate(W / 2, 300); g.scale(s, s); g.drawImage(tit, -tit.width / 2, -tit.height / 2); g.restore(); }
      brillo(g, W / 2 + 330, 250, 26 * (0.6 + 0.4 * Math.sin(t * 5)), tramo(t, 7.6, 7.9));
      brillo(g, W / 2 - 340, 360, 22 * (0.6 + 0.4 * Math.sin(t * 6 + 1)), tramo(t, 7.7, 8.0));
    }
    if (this.vuelve) { const L = this.vuelve; g.save(); g.translate(L.x, L.y - 10); g.scale(ESC, ESC); dibujarLata(g, 0, 0, L.r, { aplast: 0.3, abierta: true }); g.restore(); }
    // a oscuras al empezar y al acabar
    const osc = Math.max(t < 0.75 ? 0.97 * (1 - luz) : 0, tramo(t, 9.8, 10.55));
    if (osc > 0) { g.fillStyle = `rgba(0,0,0,${osc})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (textos.has(1)) return textos.get(1);
    const c = lienzoNuevo(1000, 330), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 300);
    gr.addColorStop(0, "#fff6c2"); gr.addColorStop(0.5, "#ffcf2e"); gr.addColorStop(1, "#c98200");
    txt(g, "FIN DE LA", 500, 96, { tam: 84, peso: 900, fam: FD, color: gr, borde: "#3a1600", bordeAncho: 10, esp: 10, glow: "rgba(255,200,60,.7)", glowTam: 20 });
    txt(g, "FUNCIÓN", 500, 292, { tam: 168, peso: 900, fam: FD, color: gr, borde: "#3a1600", bordeAncho: 12, esp: 8, glow: "rgba(255,200,60,.7)", glowTam: 26, max: 940 });
    textos.set(1, c);
    return c;
  }
}

registrar({ id: "00099", nombre: "Fin de la función", crear: () => new EscenaFin() });
})();
