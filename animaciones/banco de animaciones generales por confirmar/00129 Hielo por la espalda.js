"use strict";
/*
 * 00129 · HIELO POR LA ESPALDA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Rodrigo tararea distraído. Guillermo saca un cubito de su vaso, lo enseña con un guiño, se acerca de puntillas y se
 * lo echa por el cuello de la cazadora. Rodrigo se queda tieso y empieza a bailar a saltos (¡QUÉ FRÍO!) mientras el
 * cubito (se ve el bulto azul) le baja por la espalda y la pierna, hasta que sale por el bajo del pantalón y se
 * desliza por el suelo hasta los pies de Guillermo. Alivio, y se ríen los dos. Se apagan los focos.
 */
(() => {
const ESC = 1.5;
const T_ECHA = 3.05, T_SALE = 6.95;
// recorrido del cubito por dentro de la ropa (unidades de Rodrigo)
const CAMINO = [[30, 86], [40, 104], [35, 126], [45, 146], [50, 170], [52, 198], [52, 224]];

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) {
    const u = (k[i][2] || eInOut)((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0])), a = k[i - 1][1], b = k[i][1];
    return Array.isArray(a) ? [lerp(a[0], b[0], u), lerp(a[1], b[1], u)] : lerp(a, b, u);
  }
  return k[k.length - 1][1];
}
const aAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
function porCamino(L, k) {
  const n = L.length - 1, f = clamp(k, 0, 1) * n, i = Math.min(n - 1, Math.floor(f)), u = f - i;
  return mezcla(L[i], L[i + 1], u);
}
/** Cubito de hielo centrado en (x, y), lado s. */
function cubito(g, x, y, s, ang, a = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.globalAlpha *= a;
  const gr = g.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
  gr.addColorStop(0, "rgba(240,252,255,.95)"); gr.addColorStop(0.5, "rgba(170,225,255,.85)"); gr.addColorStop(1, "rgba(110,190,240,.9)");
  g.fillStyle = gr; rectR(g, -s / 2, -s / 2, s, s, s * 0.22); g.fill();
  g.strokeStyle = "rgba(255,255,255,.95)"; g.lineWidth = s * 0.08; g.stroke();
  g.fillStyle = "rgba(255,255,255,.9)"; g.fillRect(-s * 0.3, -s * 0.32, s * 0.16, s * 0.4);
  g.restore();
}
/** Vaso ancho con un refresco y hielos (unidades de avatar); (x, y) = la mano. */
function vaso(g, x, y, hielos) {
  g.save(); g.translate(x, y);
  g.fillStyle = "rgba(200,225,255,.18)"; rectR(g, -7.5, -14, 15, 19, 2); g.fill();
  g.save(); rectR(g, -7.5, -14, 15, 19, 2); g.clip();
  const gr = g.createLinearGradient(0, -8, 0, 5); gr.addColorStop(0, "#ffcf5a"); gr.addColorStop(1, "#c46a00");
  g.fillStyle = gr; g.fillRect(-7.5, -8, 15, 13);
  for (let i = 0; i < hielos; i++) cubito(g, -3.5 + i * 4.2, -9 + (i % 2) * 2.4, 5, 0.3 * (i - 1));
  g.restore();
  g.strokeStyle = "rgba(235,245,255,.9)"; g.lineWidth = 0.9; rectR(g, -7.5, -14, 15, 19, 2); g.stroke();
  g.fillStyle = "rgba(255,255,255,.4)"; g.fillRect(-5.5, -12, 1.3, 15);
  g.restore();
}

class Hielo extends Escena {
  constructor() {
    super(9.6);
    this.p = new Parts(320);
    this.p.suelo = () => PIES;
    this.suelto = null;  // el cubito que sale por el pantalón
    this.notas = [];
    this.faseG = 0;
  }
  xG(t) { return pista(t, [[2.0, 330], [2.7, 470], [T_ECHA + 0.1, 470], [T_ECHA + 0.45, 380, eOut]]); }
  xR(t) {
    const d = t - 3.4;
    return d > 0 && t < T_SALE + 0.3 ? 640 + (40 * Math.sin(d * 1.7) + 22 * Math.sin(d * 3.3)) * tramo(d, 0, 0.4) * (1 - tramo(t, T_SALE, T_SALE + 0.3)) : 640;
  }
  baile(t) { return t > 3.4 && t < T_SALE + 0.05 ? (t - 3.4) * 2.4 * 2 * Math.PI : null; }
  poses() {
    const t = this.t;
    // ---------------- Rodrigo
    const R = { quien: "rodrigo", cara: "sonrisa", rc: 0.06 * Math.sin(t * 2.2), piernaI: [0, 0], piernaD: [0, 0], manoD: [64, 150], manoI: [14, 150] };
    let dyR = 0, giroR = 0, sxR = 1, syR = 1;
    if (t < 2.9) R.cara = Math.floor(t * 1.2) % 3 === 2 ? "guino" : "sonrisa";
    // se queda tieso
    if (t >= T_ECHA + 0.05 && t < 3.4) {
      R.cara = "sorpresa"; R.puntas = eBack(tramo(t, T_ECHA + 0.05, T_ECHA + 0.2)); R.rc = 0;
      syR = 1.05; sxR = 0.96; R.manoD = [74, 140]; R.manoI = [4, 140];
      dyR = -6 * Math.sin(tramo(t, T_ECHA + 0.05, 3.4) * Math.PI);
    }
    // baile a saltos
    const f = this.baile(t);
    if (f != null) {
      const s = Math.sin(f);
      dyR = -34 * Math.abs(Math.sin(f / 2)) / ESC;
      R.piernaI = [-12 * Math.max(0, s), 0.16 * s]; R.piernaD = [-12 * Math.max(0, -s), 0.16 * s];
      R.manoD = [84 + 10 * Math.sin(f * 1.3), 28 + 26 * Math.cos(f * 0.9)];
      R.manoI = [-4 + 8 * Math.sin(f * 1.1), 52 + 34 * Math.cos(f * 1.2)];
      giroR = 0.11 * Math.sin(f / 2);
      R.rc = -0.12 * Math.sin(f / 2 + 0.6);
      R.cara = Math.sin(f * 0.37) > 0.55 ? "risa" : "sorpresa";
      R.puntas = 0.55 + 0.25 * Math.sin(f);
      // sacude la pierna para que salga
      if (t > 6.55) { R.piernaD = [-8, 0.22 * Math.sin(t * 46)]; R.piernaI = [0, 0]; dyR *= 0.4; R.cara = "sorpresa"; }
    }
    // alivio y risas
    if (t >= T_SALE + 0.05) {
      const d = t - T_SALE;
      R.cara = d < 0.7 ? "dormido" : "risa"; R.puntas = 0.5 * (1 - tramo(d, 0, 0.5));
      R.manoD = mezcla([74, 140], [64, 150], tramo(d, 0, 0.4)); R.manoI = [14, 150];
      syR = d < 0.7 ? 1 - 0.035 * Math.sin(tramo(d, 0, 0.7) * Math.PI) : 1;
      R.rc = d < 0.7 ? -0.1 : 0.05 * Math.sin(t * 9);
      if (d > 0.7) {
        dyR = -2.5 * Math.abs(Math.sin(t * 9));
        // le señala de broma
        const kS = eOut(tramo(d, 0.8, 1.05));
        R.brazoIDelante = true; R.manoI = mezcla([14, 150], [-26, 96 + 3 * Math.sin(t * 14)], kS);
      }
    }
    const mR = matAv(this.xR(t), PIES + dyR * ESC, ESC, giroR, sxR, syR);

    // ---------------- Guillermo
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [24, 118], brazoIDelante: true };
    let dyG = 0, giroG = 0, syG = 1;
    const xg = this.xG(t);
    if (t > 0.6 && t < 1.0) { G.cara = "guino"; G.rc = -0.08; }
    // pesca un cubito del vaso y lo enseña
    const kPesca = eInOut(tramo(t, 1.0, 1.3)), kSube = eInOut(tramo(t, 1.4, 1.75));
    const borde = [24, 106];
    if (t > 1.0) G.manoD = mezcla([70, 158], borde, kPesca);
    if (t > 1.4) G.manoD = mezcla(borde, [76, 58], kSube);
    if (t > 1.0) G.cara = "guino";
    // de puntillas
    if (t > 2.0 && t < 2.7) {
      const a = andar(this.faseG, 1.3); G.piernaI = a.piernaI; G.piernaD = a.piernaD; dyG = a.bote - 6; syG = 1.02;
      G.manoD = [76 + 2 * Math.sin(this.faseG), 58];
    }
    // se lo echa por el cuello
    const mR0 = matAv(this.xR(T_ECHA), PIES, ESC);
    const mG0 = matAv(470, PIES, ESC);
    const cuelloR = aAv(mG0, aPant(mR0, [17, 82]));
    const kLleva = eInOut(tramo(t, 2.7, 3.0));
    if (t > 2.7) G.manoD = mezcla([76, 58], [cuelloR[0] - 4, cuelloR[1] + 3], kLleva);
    if (t > T_ECHA + 0.1) {
      const kV = eInOut(tramo(t, T_ECHA + 0.1, T_ECHA + 0.45));
      G.manoD = mezcla([cuelloR[0] - 4, cuelloR[1] + 3], [86, 70], kV); G.cara = "risa";
      if (t < T_ECHA + 0.45) { const a = andar(this.faseG, 1); G.piernaI = a.piernaI; G.piernaD = a.piernaD; dyG = a.bote; }
    }
    // muerto de risa
    if (t > 3.6) {
      const k = eInOut(tramo(t, 3.6, 3.9));
      G.manoD = mezcla([86, 70], [62, 140], k); G.manoI = mezcla([24, 118], [24, 134], k);
      syG = 1 - 0.04 * Math.abs(Math.sin(t * 9)) * k; giroG = 0.06 * Math.sin(t * 4.5) * k;
      G.rc = 0.05 * Math.sin(t * 9);
      G.cara = "risa";
    }
    // el cubito le llega a los pies
    if (t > T_SALE + 0.45 && t < T_SALE + 1.0) { G.cara = "sorpresa"; G.rc = 0.18; syG = 1; giroG = 0.04; }
    const conCubo = t > 1.05 && t < T_ECHA + 0.02;
    G.objI = (g, m) => vaso(g, m[0] + 1, m[1] - 1, t < 1.05 ? 3 : 2);
    if (conCubo) G.objD2 = (g, m) => cubito(g, m[0] + 1, m[1] - 4, 9, 0.2 + 0.1 * Math.sin(t * 3));
    const mG = matAv(xg, PIES + dyG, ESC, giroG, 1, syG);
    return { R, mR, G, mG };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    if ((t > 2.0 && t < 2.7) || (t > T_ECHA + 0.1 && t < T_ECHA + 0.45)) this.faseG += dt * 11;
    // tararea
    if (t > 0.5 && t < 2.8) this.una("n" + Math.floor(t / 0.5), true, () => this.notas.push({ t0: t, l: Math.random() < 0.5 ? -1 : 1 }));
    this.una("echa", t > T_ECHA, () => {
      temblar(6, 0.2);
      const e = this.poses(), q = aPant(e.mR, [26, 84]);
      for (let i = 0; i < 16; i++) { const a = azar(0, 6.283), v = azar(80, 260); p.nueva(P.ELECTRICA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(10, 18)); }
    });
    this.una("tieso", t > T_ECHA + 0.08, () => temblar(12, 0.3));
    // frío: chispitas azules y vaho
    const f = this.baile(t);
    if (f != null || (t > T_ECHA && t < T_SALE)) {
      const e = this.poses(), q = aPant(e.mR, this.bulto(t));
      if (Math.random() < 30 * dt) p.nueva(P.ELECTRICA, q[0] + azar(-14, 14), q[1] + azar(-14, 14), azar(-80, 80), azar(-120, 20), azar(0.3, 0.6), azar(8, 16));
      if (Math.random() < 6 * dt) { const b = aPant(e.mR, boca(e.R.rc, "rodrigo")); p.nueva(P.VAPOR, b[0], b[1], azar(-40, 40), azar(-60, -20), azar(0.5, 0.9), azar(18, 30)); }
    }
    // aterriza de cada salto
    if (f != null && t < 6.55) { const k = Math.floor(f / Math.PI); this.una("salto" + k, true, () => { temblar(4, 0.1); const x = this.xR(t); for (let i = 0; i < 4; i++) p.nueva(P.POLVO, x + azar(-50, 50), PIES - 4, azar(-160, 160), azar(-40, -5), azar(0.4, 0.7), azar(18, 30)); }); }
    // sale por el bajo del pantalón
    this.una("sale", t > T_SALE, () => {
      const e = this.poses(), q = aPant(e.mR, [52, 228]);
      this.suelto = { x: q[0], y: q[1], vx: -520, vy: -160, r: 0, t0: t };
      temblar(8, 0.2);
      for (let i = 0; i < 18; i++) { const a = azar(0, 6.283), v = azar(100, 300); p.nueva(P.ELECTRICA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(10, 18)); }
    });
    if (this.suelto) {
      const s = this.suelto;
      s.vy += 1600 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.r += s.vx * dt * 0.02;
      if (s.y > PIES - 8) { s.y = PIES - 8; s.vy = Math.abs(s.vy) > 120 ? -Math.abs(s.vy) * 0.35 : 0; s.vx *= Math.pow(0.25, dt); }
      if (Math.abs(s.vx) > 30 && Math.random() < 20 * dt) p.nueva(P.ELECTRICA, s.x, s.y, azar(-30, 30), azar(-60, -10), 0.4, 9);
    }
    p.actualizar(dt);
  }
  /** Dónde va el cubito por dentro de la ropa (unidades de Rodrigo). */
  bulto(t) {
    const k = eInOut(tramo(t, 3.3, T_SALE));
    const q = porCamino(CAMINO, k);
    return [q[0] + 1.5 * Math.sin(t * 17), q[1] + 1.5 * Math.cos(t * 13)];
  }
  dibujar(g) {
    if (!this._tit) this.titulo(); // se prepara en el primer cuadro (negro), no en el remate
    const t = this.t, e = this.poses();
    fondo(g, "#000");
    const luz = (t < 0.5 ? [0, 0.6, 0.2, 1, 1][Math.min(4, Math.floor(t / 0.1))] : 1) * (1 - tramo(t, 9.0, 9.55));
    // suelo y focos
    g.save(); g.globalAlpha = luz;
    const gs = this.grSuelo || (this.grSuelo = (() => { const gr = g.createLinearGradient(0, PIES - 6, 0, H); gr.addColorStop(0, "#2a2320"); gr.addColorStop(1, "#0b0909"); return gr; })());
    g.fillStyle = gs; g.fillRect(-60, PIES - 4, W + 120, H - PIES + 70);
    g.fillStyle = "rgba(255,230,190,.12)"; g.fillRect(-60, PIES - 4, W + 120, 2);
    g.restore();
    foco(g, 380, 400, PIES, 170, luz * 0.6);
    foco(g, 660, 650, PIES, 170, luz * 0.6);
    // sombras
    g.fillStyle = `rgba(0,0,0,${0.45 * luz})`;
    for (const m of [e.mG, e.mR]) { const q = aPant(m, [39, 232]); g.beginPath(); g.ellipse(q[0], PIES, 70, 9, 0, 0, 6.283); g.fill(); }
    // el cubito se cuela por el cuello (por detrás de Rodrigo)
    if (t > T_ECHA && t < T_ECHA + 0.25) conMat(g, e.mR, () => { const k = eIn(tramo(t, T_ECHA, T_ECHA + 0.25)); cubito(g, lerp(18, 33, k), lerp(78, 96, k), 9, 0.3 + k); });
    pintarAvatar(g, e.mR, e.R, t);
    pintarAvatar(g, e.mG, e.G, t);
    // frío: Rodrigo se pone azulado
    const frio = tramo(t, T_ECHA, T_ECHA + 0.3) * (1 - tramo(t, T_SALE, T_SALE + 0.8));
    if (frio > 0) {
      const c = aPant(e.mR, [39, 120]);
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.22 * frio * (0.8 + 0.2 * Math.sin(t * 20));
      g.drawImage(BLOB2.cian, c[0] - 120, c[1] - 220, 240, 440); g.restore();
    }
    // el bulto del cubito bajando por dentro
    if (t > 3.3 && t < T_SALE) conMat(g, e.mR, () => {
      const q = this.bulto(t);
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.85;
      g.drawImage(BLOB2.cian, q[0] - 24, q[1] - 24, 48, 48); g.restore();
      cubito(g, q[0], q[1], 12, t * 3, 0.9);
    });
    // el cubito cayendo por el cuello (por detrás de la cabeza no se ve: se queda en el cuello)
    if (this.suelto) {
      const s = this.suelto, a = 1 - tramo(t, 8.6, 9.0);
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 * a; g.drawImage(BLOB2.cian, s.x - 24, s.y - 24, 48, 48); g.restore();
      cubito(g, s.x, s.y, 14, s.r, a);
      if (t > T_SALE + 0.9 && t < T_SALE + 1.5) brillo(g, s.x + 6, s.y - 8, 22 * Math.sin(tramo(t, T_SALE + 0.9, T_SALE + 1.5) * Math.PI), 1);
    }
    this.p.dibujar(g);
    // notas del tarareo
    const b = aPant(e.mR, boca(e.R.rc, "rodrigo"));
    for (const n of this.notas) {
      const d = t - n.t0; if (d > 1.1) continue;
      const a = Math.min(1, d * 5) * (1 - tramo(d, 0.7, 1.1));
      g.save(); g.globalAlpha = a; g.translate(b[0] + 30 + d * 60, b[1] - 30 - d * 80 + 6 * n.l * Math.sin(d * 8)); g.scale(1.2, 1.2);
      g.fillStyle = "#fffdf5"; g.strokeStyle = "#fffdf5"; g.lineWidth = 2.4;
      g.beginPath(); g.ellipse(0, 0, 6, 4.4, -0.4, 0, 6.283); g.fill();
      g.beginPath(); g.moveTo(5.2, -1.5); g.lineTo(5.2, -22); g.quadraticCurveTo(12, -17, 12, -9); g.stroke();
      g.restore();
    }
    // ¡QUÉ FRÍO!
    if (t > 3.45) {
      const d = t - 3.45, k = tramo(d, 0, 0.17), s = lerp(2.6, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 30) * (1 - tramo(t, T_SALE, T_SALE + 0.3)));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - tramo(t, 8.6, 9.1)); g.translate(512 + (t < T_SALE ? azar(-2, 2) : 0), 100); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    if (luz < 1) { g.fillStyle = `rgba(0,0,0,${0.97 * (1 - luz)})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (this._tit) return this._tit;
    const c = lienzoNuevo(820, 220), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 150);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#cdf3ff"); gr.addColorStop(1, "#5fc8f0");
    // carámbanos bajo las letras
    g.fillStyle = "#bfeeff";
    const rnd = semilla(9);
    for (let i = 0; i < 18; i++) { const x = 110 + i * 34 + rnd() * 10, l = 16 + rnd() * 30; g.beginPath(); g.moveTo(x - 7, 136); g.lineTo(x + 7, 136); g.lineTo(x, 136 + l); g.closePath(); g.fill(); }
    txt(g, "¡QUÉ FRÍO!", 410, 150, { tam: 132, peso: 900, fam: FD, color: gr, borde: "#0b3550", bordeAncho: 12, esp: 4, glow: "rgba(120,220,255,.9)", glowTam: 26, max: 760 });
    // escarcha
    for (let i = 0; i < 14; i++) brillo(g, 90 + rnd() * 640, 40 + rnd() * 100, 8 + rnd() * 10, 0.9);
    return (this._tit = c);
  }
}

registrar({ id: "00129", nombre: "Hielo por la espalda", crear: () => new Hielo() });
})();
