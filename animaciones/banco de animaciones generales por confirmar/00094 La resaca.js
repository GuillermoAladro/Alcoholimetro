"use strict";
/*
 * 00094 · LA RESACA
 *
 * Animación del banco. Empieza y acaba en negro.
 * «A la mañana siguiente…». Amanece de golpe: él, con gafas de sol, despeinado y con cara de resaca. El sol le da un
 * fogonazo y se tapa la cara (¡QUÉ LUZ!). Llega un pajarito al cable y pía: cada pío le hace temblar y se tapa los
 * oídos. Le pide silencio… y el pájaro suelta un ¡¡PÍO!! que lo tumba. El pájaro se le posa encima. Iris a negro.
 */
(() => {
const X = 580, ESC = 1.6;
const SOL = [880, 104];
const PIOS = [4.5, 5.1, 5.38]; // píos pequeños
const PIO_GORDO = 6.9;
const textos = cacheTexto();
const cable = (x) => { const u = x / W; return 150 + 40 * u + 200 * u * (1 - u); };

/** Cielo de mañana, ciudad clarita y acera (se pinta una vez). */
function pintarManana() {
  const c = lienzoNuevo(W, H), g = c.getContext("2d");
  const cielo = g.createLinearGradient(0, 0, 0, PIES);
  cielo.addColorStop(0, "#9fd3ff"); cielo.addColorStop(0.6, "#d9efff"); cielo.addColorStop(1, "#fff4d6");
  g.fillStyle = cielo; g.fillRect(0, 0, W, H);
  const rnd = semilla(3);
  let x = -20;
  while (x < W + 20) {
    const w = 70 + rnd() * 90, h = 120 + rnd() * 170;
    g.fillStyle = rnd() < 0.5 ? "#b9cde0" : "#aac1d8"; g.fillRect(x, PIES - 30 - h, w - 5, h + 30);
    g.fillStyle = "rgba(255,255,255,.35)";
    for (let wy = PIES - 20 - h; wy < PIES - 60; wy += 28) for (let wx = x + 10; wx < x + w - 22; wx += 22) g.fillRect(wx, wy, 10, 14);
    x += w;
  }
  const ac = g.createLinearGradient(0, PIES - 30, 0, H);
  ac.addColorStop(0, "#c9c3b6"); ac.addColorStop(1, "#a59d8e");
  g.fillStyle = ac; g.fillRect(0, PIES - 30, W, H - PIES + 40);
  g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(0, PIES - 30, W, 3);
  // poste y cable
  g.fillStyle = "#6b5640"; g.fillRect(52, 120, 12, PIES - 120); g.fillRect(36, 136, 44, 6);
  g.strokeStyle = "#2b2b2b"; g.lineWidth = 2.5; g.beginPath();
  for (let xx = 0; xx <= W; xx += 16) (xx ? g.lineTo(xx, cable(xx)) : g.moveTo(xx, cable(xx)));
  g.stroke();
  return c;
}

/** Pajarito mirando a la derecha; (x, y) = las patas. ala: 0–1 (aleteo). pico: abierto 0–1. */
function pajaro(g, x, y, s, ala, pico, inflado = 0) {
  g.save(); g.translate(x, y); g.scale(s * (1 + 0.25 * inflado), s * (1 + 0.25 * inflado));
  g.strokeStyle = "#d18a1a"; g.lineWidth = 1.6; g.lineCap = "round";
  g.beginPath(); g.moveTo(-3, -6); g.lineTo(-4, 0); g.moveTo(3, -6); g.lineTo(4, 0); g.stroke();
  // cola
  g.fillStyle = "#6e4528"; g.beginPath(); g.moveTo(-12, -14); g.lineTo(-25, -20); g.lineTo(-23, -10); g.closePath(); g.fill();
  // cuerpo
  const cu = g.createRadialGradient(-2, -18, 2, 0, -14, 15);
  cu.addColorStop(0, "#b78354"); cu.addColorStop(1, "#7b4f2c");
  g.fillStyle = cu; g.beginPath(); g.ellipse(0, -14, 14, 10.5, 0, 0, 6.283); g.fill();
  g.fillStyle = "#f3dfbf"; g.beginPath(); g.ellipse(3, -10, 8, 6, 0.3, 0, 6.283); g.fill();
  // cabeza
  g.fillStyle = "#8a5a32"; g.beginPath(); g.arc(9, -26, 8, 0, 6.283); g.fill();
  g.fillStyle = "#f3dfbf"; g.beginPath(); g.arc(11, -23, 4, 0, 6.283); g.fill();
  g.fillStyle = "#111"; g.beginPath(); g.arc(12, -28, 1.8, 0, 6.283); g.fill();
  g.fillStyle = "#fff"; g.beginPath(); g.arc(12.6, -28.6, 0.6, 0, 6.283); g.fill();
  // pico
  const ab = 3.5 * pico;
  g.fillStyle = "#f2a41f";
  g.beginPath(); g.moveTo(16, -27 - ab * 0.3); g.lineTo(24, -25 - ab); g.lineTo(16, -24); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(16, -24); g.lineTo(23, -23 + ab); g.lineTo(16, -22 + ab * 0.3); g.closePath(); g.fill();
  if (pico > 0.3) { g.fillStyle = "#7a1a1a"; g.beginPath(); g.moveTo(16, -24); g.lineTo(21, -24); g.lineTo(16, -23); g.fill(); }
  // ala
  g.save(); g.translate(-2, -16); g.rotate(-1.3 * ala);
  g.fillStyle = "#5e3a1f"; g.beginPath(); g.ellipse(-4, 0, 10, 5.5, -0.2, 0, 6.283); g.fill();
  g.restore();
  g.restore();
}

class EscenaResaca extends Escena {
  constructor() {
    super(9.8);
    this.p = new Parts(260);
    this.fondo = pintarManana();
    this.flash = 0;
  }
  /** Pájaro: posición, aleteo, pico. */
  pajaroEn(t) {
    const P0 = [-60, 120], P1 = [392, cable(392)];
    if (t < 3.7) return null;
    if (t < 4.3) { const k = eOut(tramo(t, 3.7, 4.3)); return { x: lerp(P0[0], P1[0], k), y: lerp(P0[1], P1[1], k) - 50 * Math.sin(Math.PI * k), ala: 0.5 + 0.5 * Math.sin(t * 40), pico: 0, inf: 0 }; }
    let pico = 0, inf = 0;
    for (const tp of PIOS) if (t > tp - 0.03 && t < tp + 0.22) pico = 1;
    if (t > 6.35 && t < PIO_GORDO) inf = eInOut(tramo(t, 6.35, 6.85));
    if (t >= PIO_GORDO && t < 7.6) { pico = 1; inf = 1 - tramo(t, 7.3, 7.6); }
    if (t < 7.75) return { x: P1[0], y: P1[1] + (t < 4.5 ? 4 * Math.sin((t - 4.3) * 30) * (1 - tramo(t, 4.3, 4.5)) : 0), ala: 0, pico, inf };
    // baja volando y se le posa encima
    const D = this.encima();
    if (t < 8.35) { const k = eInOut(tramo(t, 7.75, 8.35)); return { x: lerp(P1[0], D[0], k), y: lerp(P1[1], D[1], k) - 60 * Math.sin(Math.PI * k), ala: 0.5 + 0.5 * Math.sin(t * 40), pico: 0, inf: 0 }; }
    return { x: D[0], y: D[1], ala: 0, pico: t > 8.7 && t < 8.9 ? 1 : 0, inf: 0 };
  }
  encima() { return aPant(this.estadoEn(8.5).m, [79, 112]); }
  estado() { return this.estadoEn(this.t); }
  estadoEn(t) {
    const pose = { cara: "borracho", gafas: true, puntas: 0.3, rc: 0.05 * Math.sin(t * 1.7), piernaI: [0, 0.03], piernaD: [0, -0.03] };
    let manoD = [70, 158], manoI = [30, 26], sx = 1, sy = 0.965 + 0.006 * Math.sin(t * 2), dx = 3 * Math.sin(t * 1.3), giro = 0, y = PIES;
    pose.brazoIDelante = true;
    // fogonazo: se tapa la cara
    const kTapa = eBack(tramo(t, 1.95, 2.2)) * (1 - eInOut(tramo(t, 3.55, 3.85)));
    if (kTapa > 0) {
      manoD = mezcla(manoD, [51, 30], kTapa); manoI = mezcla(manoI, [28, 29], kTapa);
      sx *= 1 - 0.03 * kTapa; sy *= 1 - 0.04 * kTapa;
      if (t < 3.6) { dx += azar(-2, 2); pose.cara = "sorpresa"; pose.rc = 0.12 * Math.sin(t * 9) * kTapa; }
    }
    // los píos: tiembla y se tapa los oídos
    let tiembla = 0;
    for (const tp of PIOS) if (t > tp && t < tp + 0.35) tiembla = Math.max(tiembla, 1 - (t - tp) / 0.35);
    const kOidos = eOut(tramo(t, 4.52, 4.7)) * (1 - eInOut(tramo(t, 5.75, 6.0)));
    if (kOidos > 0) { manoD = mezcla(manoD, [72, 47], kOidos); manoI = mezcla(manoI, [6, 47], kOidos); }
    if (t > 4.5 && t < 5.9) { pose.cara = tiembla > 0.2 ? "sorpresa" : "borracho"; pose.puntas = 0.3 + 0.6 * tramo(t, 4.5, 5.5); }
    if (tiembla > 0) { dx += azar(-6, 6) * tiembla; sy *= 1 + 0.03 * tiembla * Math.sin(t * 80); }
    // ¡chsst!: le pide silencio al pájaro
    const kChis = eInOut(tramo(t, 5.85, 6.1)) * (1 - eInOut(tramo(t, 6.6, 6.85)));
    if (kChis > 0) { manoD = mezcla(manoD, [44, 58], kChis); manoI = mezcla(manoI, [9, 160], kChis); pose.rc = -0.18 * kChis; pose.cara = "borracho"; pose.puntas = 0.9; }
    // ¡¡PÍO!!: tiembla y cae redondo
    if (t >= PIO_GORDO) {
      pose.puntas = 1; pose.cara = "sorpresa";
      const kCae = eIn(tramo(t, 7.05, 7.45));
      dx += t < 7.05 ? azar(-9, 9) : 0;
      manoD = mezcla([96, 60], [100, 150], kCae); manoI = mezcla([-18, 60], [5, 168], kCae);
      giro = -Math.PI / 2 * kCae;
      if (t > 7.45) { giro += 0.06 * Math.sin((t - 7.45) * 20) * Math.exp(-(t - 7.45) * 6); pose.cara = "dormido"; pose.rc = 0; }
      y = PIES - 39 * ESC * kCae;
      sy = 1;
    }
    pose.manoD = manoD; pose.manoI = manoI;
    return { pose, m: matAv(X + dx, y, ESC, giro, sx, sy) };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("sol", t > 1.95, () => { this.flash = 1; temblar(12, 0.4); });
    this.una("titulo", t > 2.1, () => temblar(10, 0.25));
    for (const tp of PIOS) this.una("pio" + tp, t > tp, () => temblar(5, 0.2));
    this.una("gordo", t > PIO_GORDO, () => {
      temblar(26, 0.7);
      const b = this.pajaroEn(t);
      for (let i = 0; i < 14; i++) { const a = azar(-0.6, 0.6), v = azar(300, 600); p.nueva(P.DESTELLO, b.x + 30, b.y - 40, Math.cos(a) * v, Math.sin(a) * v, 0.3, 30); }
    });
    this.una("plaf", t > 7.45, () => {
      temblar(16, 0.4);
      for (let i = 0; i < 30; i++) p.nueva(P.POLVO, X - azar(0, 380), PIES - azar(0, 10), azar(-260, 260), azar(-80, -10), azar(0.6, 1.1), azar(26, 44));
    });
    this.flash = Math.max(0, this.flash - dt * 1.8);
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    if (t > 1.2) {
      g.drawImage(this.fondo, 0, 0);
      // el sol, con rayos que giran
      const [sx, sy] = SOL, pulso = 1 + 0.06 * Math.sin(t * 5) + 0.35 * this.flash;
      g.save(); g.globalCompositeOperation = "lighter";
      g.globalAlpha = 0.85; g.drawImage(BLOB.amarillo, sx - 330 * pulso, sy - 330 * pulso, 660 * pulso, 660 * pulso);
      g.restore();
      g.save(); g.translate(sx, sy); g.rotate(t * 0.35);
      g.fillStyle = "rgba(255,226,90,.75)";
      for (let i = 0; i < 14; i++) { g.rotate(6.283 / 14); g.beginPath(); g.moveTo(-14, -96); g.lineTo(0, -(170 + 30 * Math.sin(t * 6 + i)) * pulso); g.lineTo(14, -96); g.closePath(); g.fill(); }
      g.restore();
      const so = g.createRadialGradient(sx - 20, sy - 20, 10, sx, sy, 90);
      so.addColorStop(0, "#fffbe6"); so.addColorStop(0.7, "#ffe36b"); so.addColorStop(1, "#ffc21f");
      g.fillStyle = so; g.beginPath(); g.arc(sx, sy, 86 * pulso, 0, 6.283); g.fill();
    }
    // sombra en el suelo
    g.fillStyle = "rgba(60,50,30,.25)"; g.beginPath(); g.ellipse(X - (t > 7.2 ? 190 : 0), PIES + 2, t > 7.2 ? 200 : 70, 10, 0, 0, 6.283); g.fill();
    pintarAvatar(g, e.m, e.pose, t);
    // estrellitas girando cuando está K.O.
    if (t > 7.5) {
      const c = aPant(e.m, [39, 20]);
      for (let i = 0; i < 3; i++) {
        const a = t * 4 + (i * 6.283) / 3;
        g.save(); g.translate(c[0] + 10 + Math.cos(a) * 52, c[1] - 78 + Math.sin(a) * 15); g.rotate(t * 3);
        estrella(g, 0, 0, 13, 5.5, 0); g.fillStyle = "#ffd34d"; g.fill(); g.strokeStyle = "#7a4d00"; g.lineWidth = 2; g.stroke();
        g.restore();
      }
    }
    // el pájaro
    const b = this.pajaroEn(t);
    if (b) pajaro(g, b.x, b.y, 2.0, b.ala, b.pico, b.inf);
    this.p.dibujar(g);
    // ondas del ¡¡PÍO!!
    if (b && t > PIO_GORDO && t < 7.7) {
      for (let i = 0; i < 3; i++) {
        const u = (t - PIO_GORDO - i * 0.1) / 0.6; if (u < 0 || u > 1) continue;
        g.strokeStyle = `rgba(255,255,255,${0.8 * (1 - u)})`; g.lineWidth = 8 * (1 - u) + 2;
        g.beginPath(); g.arc(b.x + 40, b.y - 44, 30 + u * 340, -0.9, 0.9); g.stroke();
      }
    }
    // píos
    if (b) {
      for (const tp of PIOS) {
        const d = t - tp; if (d < 0 || d > 0.7) continue;
        g.save(); g.translate(b.x + 36 + d * 40, b.y - 66 - d * 50); g.rotate(-0.15); const s = eBack(tramo(d, 0, 0.15)); g.scale(s, s);
        txt(g, "pío", 0, 0, { tam: 38, peso: 400, fam: FC, color: "#fff7c0", borde: "#5a3a12", bordeAncho: 6, alfa: 1 - tramo(d, 0.45, 0.7), esp: 2 });
        g.restore();
      }
      if (t > 8.65 && t < 9.3) {
        const d = t - 8.65;
        g.save(); g.translate(b.x + 30, b.y - 64 - d * 30); g.scale(eBack(tramo(d, 0, 0.15)), eBack(tramo(d, 0, 0.15)));
        txt(g, "pío", 0, 0, { tam: 32, peso: 400, fam: FC, color: "#fff7c0", borde: "#5a3a12", bordeAncho: 6, alfa: 1 - tramo(d, 0.4, 0.65), esp: 2 });
        g.restore();
      }
    }
    // ¡chsst!
    if (t > 6.05 && t < 6.85) {
      const q = aPant(e.m, [20, 40]), k = tramo(t, 6.05, 6.2);
      g.save(); g.translate(q[0] - 70, q[1] - 40); g.rotate(-0.1); g.scale(eBack(k), eBack(k));
      txt(g, "¡CHSST!", 0, 0, { tam: 42, peso: 400, fam: FC, color: "#fffdf5", borde: "#1e2a3a", bordeAncho: 7, alfa: 1 - tramo(t, 6.65, 6.85), esp: 2 });
      g.restore();
    }
    // ¡¡PÍO!!
    if (b && t > PIO_GORDO && t < 8.0) {
      const k = tramo(t, PIO_GORDO, PIO_GORDO + 0.12);
      g.save(); g.translate(330 + azar(-5, 5) * (1 - tramo(t, 7.4, 7.7)), 96); g.rotate(-0.08); g.scale(lerp(0.3, 1, eBack(k)), lerp(0.3, 1, eBack(k)));
      txt(g, "¡¡PÍO!!", 0, 0, { tam: 120, peso: 400, fam: FC, color: "#ffe14d", borde: "#4a2a00", bordeAncho: 12, alfa: 1 - tramo(t, 7.7, 8.0), esp: 4 });
      g.restore();
    }
    // ¡QUÉ LUZ!
    if (t > 2.1 && t < 4.1) {
      const tit = this.titulo();
      const k = tramo(t, 2.1, 2.24), s = lerp(2.8, 1, eIn(k)) * (1 + 0.03 * Math.sin(t * 20)), a = Math.min(1, k * 4) * (1 - tramo(t, 3.75, 4.1));
      if (tit) { g.save(); g.globalAlpha = a; g.translate(390 + azar(-2, 2), 112); g.rotate(-0.05); g.scale(s, s); g.drawImage(tit, -tit.width / 2, -tit.height / 2); g.restore(); }
    }
    // fogonazo de sol
    if (this.flash > 0) { g.fillStyle = `rgba(255,252,225,${0.85 * this.flash})`; g.fillRect(-60, -60, W + 120, H + 120); }
    // amanece de golpe tras el rótulo
    const aIni = 1 - eInOut(tramo(t, 1.3, 1.75));
    if (aIni > 0) { g.fillStyle = `rgba(0,0,0,${aIni})`; g.fillRect(-60, -60, W + 120, H + 120); }
    if (t < 1.45) {
      const a = tramo(t, 0.12, 0.45) * (1 - tramo(t, 1.05, 1.35));
      txt(g, "A LA MAÑANA SIGUIENTE…", W / 2, H / 2 + 14, { tam: 46, peso: 800, fam: FT, color: "#fffdf5", alfa: a, esp: 4 });
    }
    // iris que se cierra sobre el pájaro y él
    const kIris = tramo(t, 9.0, 9.7);
    if (kIris > 0) {
      const c = b ? [b.x - 10, b.y - 20] : [W / 2, H / 2], R = Math.max(0.1, 760 * Math.pow(1 - kIris, 1.7));
      g.save(); g.beginPath(); g.rect(-60, -60, W + 120, H + 120); g.moveTo(c[0] + R, c[1]); g.arc(c[0], c[1], R, 0, 6.283);
      g.fillStyle = "#000"; g.fill("evenodd"); g.restore();
    }
  }
  titulo() {
    if (textos.has(1)) return textos.get(1);
    const c = lienzoNuevo(700, 190), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 150);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd23a"); gr.addColorStop(1, "#ff8a00");
    txt(g, "¡QUÉ LUZ!", 350, 140, { tam: 128, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 12, esp: 4, glow: "rgba(255,200,40,.9)", glowTam: 26 });
    textos.set(1, c);
    return c;
  }
}

registrar({ id: "00094", nombre: "La resaca", crear: () => new EscenaResaca() });
})();
