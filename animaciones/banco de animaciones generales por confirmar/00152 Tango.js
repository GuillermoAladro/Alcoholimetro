"use strict";
/*
 * 00152 · TANGO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende un foco rojo. Guillermo y Rodrigo (con una rosa en la boca), abrazados y con la barbilla alta, bailan
 * un tango dramático: golpes de cabeza, pasos largos a un lado y al otro y un giro de Rodrigo. Pose final en V,
 * cogidos de la mano: ¡TANGO! Les sudan las manos, se sueltan y Rodrigo se cae de espaldas (¡PLAF!). La rosa vuela y
 * le vuelve a caer en la boca; Guillermo remata la pose solo y Rodrigo levanta el pulgar desde el suelo. Se apaga.
 */
(() => {
const cache = cacheTexto();
const ESC = 1.45, XG0 = 400, SEP = 150;
const T_V = 5.1, T_TIT = 5.55, T_SUELTA = 6.5, T_SUELO = 6.82, T_ROSA = 7.55, T_APAGA = 8.95;

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(640, 230), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 180);
  gr.addColorStop(0, "#fff0f0"); gr.addColorStop(0.45, "#ff5a6a"); gr.addColorStop(1, "#a0001e");
  txt(g, "¡TANGO!", 328, 178, { tam: 168, peso: 900, fam: FD, color: "#2a0008", esp: 8 });
  txt(g, "¡TANGO!", 320, 170, { tam: 168, peso: 900, fam: FD, color: gr, borde: "#2a0008", bordeAncho: 12, esp: 8, glow: "rgba(255,40,80,.8)", glowTam: 28 });
  cache.set("t", c);
  return c;
}
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
function conCabeza(g, m, R, rc, f) { conMat(g, m, () => { g.translate(R.cuello[0], R.cuello[1]); g.rotate(rc); g.translate(-R.cuello[0], -R.cuello[1]); f(); }); }

/** Rosa roja con tallo; el tallo va de (0, 0) a (largo, 0) y la flor está al final. */
function rosa(g, largo) {
  g.save();
  g.strokeStyle = "#1f7a2a"; g.lineWidth = 2.2; g.lineCap = "round";
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(largo * 0.5, -3, largo, -4); g.stroke();
  g.fillStyle = "#2a9a3a";
  g.beginPath(); g.ellipse(largo * 0.45, -6, 5, 2.2, -0.5, 0, 6.283); g.fill();
  g.beginPath(); g.ellipse(largo * 0.25, 2, 4, 1.8, 0.4, 0, 6.283); g.fill();
  g.translate(largo + 3, -6);
  const gr = g.createRadialGradient(-1, -1, 1, 0, 0, 9);
  gr.addColorStop(0, "#ff6a7a"); gr.addColorStop(0.6, "#d8102a"); gr.addColorStop(1, "#7a0010");
  g.fillStyle = gr;
  for (let i = 0; i < 5; i++) { const a = (i / 5) * 6.283; g.beginPath(); g.ellipse(Math.cos(a) * 3.5, Math.sin(a) * 3.5, 5.2, 4, a, 0, 6.283); g.fill(); }
  g.fillStyle = "#a0001a"; g.beginPath(); g.arc(0, 0, 3.4, 0, 6.283); g.fill();
  g.strokeStyle = "#ff8a96"; g.lineWidth = 0.9; g.beginPath(); g.arc(0, 0, 2, 0.5, 4.5); g.stroke();
  g.restore();
}

class Tango extends Escena {
  constructor() {
    super(9.95);
    this.p = new Parts(360);
    this.petalos = []; this.gotas = [];
    this.fondoC = null;
    this.rosaVuela = null;
  }
  /** Pasos: desplazamiento y piernas. Tres pasos largos a la izquierda y dos a la derecha. */
  pasos() {
    const t = this.t;
    let dx = 0, lead = 0, trail = 0;
    const paso = (t0, dur, dist, dir) => {
      const u = tramo(t, t0, t0 + dur);
      dx += dir * dist * eInOut(tramo(u, 0.25, 0.85));
      if (u > 0 && u < 1) { lead = dir * -0.42 * Math.sin(Math.PI * tramo(u, 0, 0.8)); trail = dir * -0.14 * Math.sin(Math.PI * tramo(u, 0.3, 1)); }
    };
    for (let i = 0; i < 3; i++) paso(0.9 + i * 0.6, 0.6, 55, -1);
    for (let i = 0; i < 2; i++) paso(2.9 + i * 0.65, 0.65, 85, 1);
    return { dx, lead, trail };
  }
  estados() {
    const t = this.t, ps = this.pasos();
    const xG = XG0 + ps.dx;
    let xR = xG + SEP;
    const G = { cara: "guino", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    const R = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    // piernas de los pasos (la pierna que abre es la del lado hacia el que van)
    const movIzq = ps.lead > 0 || ps.trail > 0;
    const aI = movIzq ? ps.lead : ps.trail, aD = movIzq ? ps.trail : ps.lead;
    G.piernaI = [0, aI]; G.piernaD = [0, aD]; R.piernaI = [0, aI]; R.piernaD = [0, aD];
    // golpes de cabeza
    const mira = t < 0.75 ? -0.12 : t < 2.75 ? -0.26 : t < 4.2 ? 0.26 : 0.1;
    const golpe = t > 0.75 && t < 0.85 ? 1 : t > 2.75 && t < 2.85 ? 1 : 0;
    G.rc = mira + golpe * 0.04 * Math.sin(t * 90); R.rc = mira + golpe * 0.04 * Math.sin(t * 90);
    R.cara = t < 2.75 ? "sonrisa" : "guino";
    let thG = 0, thR = 0, sxR = 1, yR = PIES;
    // giro de Rodrigo
    const kGi = tramo(t, 4.2, 5.0);
    if (kGi > 0 && kGi < 1) { sxR = Math.cos(eInOut(kGi) * Math.PI * 4); G.cara = "risa"; R.cara = "guino"; }
    // pose en V
    const kV = eInOut(tramo(t, T_V, T_V + 0.45));
    if (t > T_V) xR = lerp(xG + SEP, xG + 96, kV);
    thG = -0.25 * kV; thR = 0.6 * kV;
    if (t > T_V) { G.cara = t < 6.1 ? "guino" : "sorpresa"; R.cara = t < 6.1 ? "dormido" : "sorpresa"; G.rc = -0.18 * kV; R.rc = 0.2 * kV; R.piernaI = [-10 * kV, 0.5 * kV]; }
    const tiembla = t > 6.0 && t < T_SUELTA ? tramo(t, 6.0, T_SUELTA) * 2.5 : 0;
    // se sueltan: Rodrigo cae de espaldas, Guillermo se tambalea
    if (t >= T_SUELTA) {
      const kC = eIn(tramo(t, T_SUELTA, T_SUELO));
      thR = lerp(0.6, Math.PI / 2, kC);
      if (t >= T_SUELO) { const d = t - T_SUELO; thR = Math.PI / 2 - 0.05 * Math.sin(d * 20) * Math.exp(-d * 6); }
      R.cara = t < T_SUELO + 0.1 ? "sorpresa" : t < T_ROSA ? "borracho" : "risa";
      R.piernaI = [0, lerp(0.5, 0.25, kC)]; R.piernaD = [0, -0.1 * kC];
      const d = t - T_SUELTA;
      thG = -0.25 - 0.15 * Math.exp(-d * 2) * Math.sin(d * 10);
      thG = lerp(thG, 0, eInOut(tramo(d, 0.4, 0.9)));
      G.cara = d < 1.6 ? "sorpresa" : "guino";
      if (d > 0.9 && d < 1.6) G.rc = 0.1 * Math.sin(d * 8);
    }
    const mG = matAv(xG + azar(-tiembla, tiembla), PIES, ESC, thG, 1, 1, [39, 232]);
    const mR = matAv(xR + 39 * ESC + azar(-tiembla, tiembla), yR, ESC, thR, sxR, 1, [78, 232]);
    // brazos
    const RG = avatar().rig, RR = avatar("rodrigo").rig;
    let gD, gI, rD, rI;
    // abrazo de tango: la mano de él a la espalda de Rodrigo, la de Rodrigo a su hombro, los otros brazos estirados
    gD = enAv(mG, aPant(mR, [22, 128])); rI = enAv(mR, aPant(mG, [66, 92]));
    gI = [-38 + 4 * Math.sin(t * 2), 96]; rD = [112 - 4 * Math.sin(t * 2), 100];
    if (t < 0.6) { gI = mezcla([9, 160], gI, eInOut(tramo(t, 0.1, 0.5))); rD = mezcla([68, 157], rD, eInOut(tramo(t, 0.1, 0.5))); }
    if (kGi > 0 && t < T_V + 0.5) {
      // giro: manos unidas en alto
      const kA = eInOut(tramo(t, 4.2, 4.35)) * (1 - eInOut(tramo(t, 4.9, 5.1)));
      const S1 = aPant(mG, RG.hombroD), S2 = aPant(mR, RR.hombroI2), P0 = [(S1[0] + S2[0]) / 2, Math.min(S1[1], S2[1]) - 95];
      gD = mezcla(gD, enAv(mG, P0), kA); rI = mezcla(rI, enAv(mR, P0), kA);
      rD = mezcla(rD, [100, 20], kA);
    }
    if (t >= T_V) {
      // pose en V: cogidos de la mano en el centro, los otros brazos teatrales
      const S1 = aPant(mG, RG.hombroD), S2 = aPant(mR, RR.hombroI2), P1 = [(S1[0] + S2[0]) / 2, (S1[1] + S2[1]) / 2 + 26];
      const kM = kV * (t < T_SUELTA ? 1 : 1 - eOut(tramo(t, T_SUELTA, T_SUELTA + 0.15)));
      gD = mezcla(gD, enAv(mG, P1), kV); rI = mezcla(rI, enAv(mR, P1), kV);
      if (t >= T_SUELTA) { gD = mezcla([96, 112], gD, kM); rI = mezcla([-30, 60], rI, kM); }
      gI = mezcla(gI, [-30, 20], kV); rD = mezcla(rD, [118, 150], kV);
      this._manos = P1;
    }
    if (t >= T_SUELTA) {
      const d = t - T_SUELTA;
      // él: manos a la cara del susto… y luego remata la pose solo
      const kS = eInOut(tramo(d, 0.35, 0.6)) * (1 - eInOut(tramo(d, 1.4, 1.7)));
      gD = mezcla(gD, [52, 58], kS); gI = mezcla(gI, [26, 58], kS);
      const kP = eInOut(tramo(d, 1.5, 1.85));
      gI = mezcla(gI, [-20, 6], kP); gD = mezcla(gD, [62, 144], kP);
      if (kP > 0.5) G.rc = -0.2;
      // Rodrigo en el suelo, pulgar arriba
      const kU = eInOut(tramo(t, T_ROSA + 0.3, T_ROSA + 0.6));
      rI = mezcla(rI, [-40, 70], eOut(tramo(d, 0, 0.3))); rD = mezcla(rD, [96, 150], eOut(tramo(d, 0, 0.3)));
      rI = mezcla(rI, [-62, 64 + 4 * Math.sin(t * 8)], kU);
      R.brazoIDelante = true;
    }
    G.manoD = gD; G.manoI = gI; R.manoD = rD; R.manoI = rI;
    return { G, R, mG, mR, xG, xR };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("tango", t > T_TIT, () => {
      temblar(12, 0.3);
      for (let i = 0; i < 40; i++) this.petalos.push({ x: azar(100, 920), y: azar(-200, -10), vx: azar(-30, 30), vy: azar(60, 140), r: azar(0, 6), vr: azar(-4, 4), s: azar(6, 11), v: 4 });
    });
    // gotas de sudor de las manos
    if (t > 6.05 && t < T_SUELTA + 0.1 && this._manos && Math.random() < 14 * dt) this.gotas.push({ x: this._manos[0] + azar(-10, 10), y: this._manos[1], vx: azar(-90, 90), vy: azar(-200, -80), v: 0.7 });
    this.una("suelta", t > T_SUELTA, () => { temblar(6, 0.15); for (let i = 0; i < 8; i++) this.gotas.push({ x: this._manos[0], y: this._manos[1], vx: azar(-160, 160), vy: azar(-260, -100), v: 0.7 }); });
    this.una("plaf", t > T_SUELO, () => {
      temblar(24, 0.5);
      const e = this.estados(), c = aPant(e.mR, [39, 116]);
      for (let i = 0; i < 22; i++) p.nueva(P.POLVO, c[0] + azar(-150, 150), PIES - azar(0, 10), azar(-300, 300), azar(-80, -10), azar(0.6, 1.1), azar(26, 46));
      const b = aPant(e.mR, avatar("rodrigo").rig.bocaPos);
      this.rosaVuela = { x0: b[0], y0: b[1], t0: t };
    });
    for (const o of this.petalos) { o.x += (o.vx + Math.sin(t * 2 + o.r) * 30) * dt; o.y += o.vy * dt; o.r += o.vr * dt; o.v -= dt; }
    this.petalos = this.petalos.filter((o) => o.v > 0 && o.y < H + 30);
    for (const d of this.gotas) { d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.v -= dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    this.una("rosa", t > T_ROSA, () => {
      const e = this.estados(), b = aPant(e.mR, avatar("rodrigo").rig.bocaPos);
      p.nueva(P.DESTELLO, b[0], b[1], 0, 0, 0.35, 120);
      for (let i = 0; i < 12; i++) { const a = azar(0, 6.283), v = azar(80, 220); p.nueva(P.CHISPA, b[0], b[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 10)); }
    });
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 80, H + 80), g = c.getContext("2d");
    g.translate(40, 40);
    for (let x = -40; x < W + 40; x += 56) {
      const gr = g.createLinearGradient(x, 0, x + 56, 0);
      gr.addColorStop(0, "#14020a"); gr.addColorStop(0.5, "#3a0818"); gr.addColorStop(1, "#14020a");
      g.fillStyle = gr; g.fillRect(x, -40, 56, 520);
    }
    const gs = g.createLinearGradient(0, 480, 0, H + 40);
    gs.addColorStop(0, "#2a0e10"); gs.addColorStop(1, "#0a0204");
    g.fillStyle = gs; g.fillRect(-40, 480, W + 80, H);
    g.strokeStyle = "rgba(0,0,0,.45)"; g.lineWidth = 2;
    for (let x = -40; x < W + 40; x += 60) { g.beginPath(); g.moveTo(x, 480); g.lineTo(x + (x - 512) * 0.4, H + 40); g.stroke(); }
    g.fillStyle = "rgba(255,120,120,.12)"; g.fillRect(-40, 480, W + 80, 3);
    this.fondoC = c;
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.estados();
    fondo(g, "#000");
    // el foco rojo: se enciende y al final se cierra
    const kOn = t < 0.5 ? [0, 1, 0.3, 1, 1][Math.min(4, Math.floor(t / 0.1))] : 1;
    const ancho = t < T_APAGA ? 300 : lerp(300, 0, eIn(tramo(t, T_APAGA, T_APAGA + 0.8)));
    const cx = lerp(480, (e.xG + e.xR) / 2 + 40, 0.6);
    g.save(); g.globalAlpha = kOn * clamp(ancho / 120, 0, 1); g.drawImage(this.fondo(), -40, -40); g.restore();
    if (ancho > 1) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = kOn;
      const gr = g.createLinearGradient(0, -20, 0, PIES);
      gr.addColorStop(0, "rgba(255,90,100,.32)"); gr.addColorStop(1, "rgba(255,60,80,.12)");
      g.fillStyle = gr;
      g.beginPath(); g.moveTo(cx - 40 * ancho / 300, -20); g.lineTo(cx + 40 * ancho / 300, -20); g.lineTo(cx + ancho, PIES); g.lineTo(cx - ancho, PIES); g.closePath(); g.fill();
      g.globalAlpha = 0.5 * kOn; g.drawImage(BLOB.rojo, cx - ancho * 1.2, PIES - 50, ancho * 2.4, 100);
      g.globalAlpha = 0.35 * kOn; g.drawImage(BLOB.blanco, cx - ancho, PIES - 30, ancho * 2, 60);
      g.restore();
    }
    // los dos (con la luz del foco)
    g.save(); g.globalAlpha = kOn * clamp(ancho / 120, 0, 1);
    const RR = avatar("rodrigo").rig;
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mR, e.R, t);
    // la rosa en la boca (o volando)
    const rv = this.rosaVuela;
    const enBoca = !rv || t >= T_ROSA;
    if (enBoca) conCabeza(g, e.mR, RR, e.R.rc, () => { g.save(); g.translate(22, 67); g.rotate(-0.08); rosa(g, 40); g.restore(); });
    else {
      const u = tramo(t, rv.t0, T_ROSA), b = aPant(e.mR, RR.bocaPos);
      const x = lerp(rv.x0, b[0], u), y = lerp(rv.y0, b[1], u) - 260 * Math.sin(u * Math.PI);
      g.save(); g.translate(x, y); g.rotate(u * 14); g.scale(ESC, ESC); g.translate(-22, 0); rosa(g, 40); g.restore();
    }
    // sudor
    g.fillStyle = "#cdeeff";
    for (const d of this.gotas) { g.beginPath(); g.ellipse(d.x, d.y, 3.5, 5.5, 0, 0, 6.283); g.fill(); }
    this.p.dibujar(g);
    // pétalos
    for (const o of this.petalos) {
      g.save(); g.translate(o.x, o.y); g.rotate(o.r); g.scale(1, Math.abs(Math.cos(o.r * 1.3)) * 0.7 + 0.3);
      g.fillStyle = "#e0102e"; g.beginPath(); g.ellipse(0, 0, o.s, o.s * 0.65, 0, 0, 6.283); g.fill();
      g.fillStyle = "rgba(255,140,150,.6)"; g.beginPath(); g.ellipse(-o.s * 0.2, -o.s * 0.15, o.s * 0.4, o.s * 0.25, 0, 0, 6.283); g.fill();
      g.restore();
    }
    // ¡PLAF!
    const d = t - T_SUELO;
    if (d > 0 && d < 0.9) {
      const k = eBack(tramo(d, 0, 0.14));
      g.save(); g.translate(e.xR + 230, 470); g.rotate(0.1); g.scale(k, k);
      txt(g, "¡PLAF!", 0, 0, { tam: 58, peso: 400, fam: FC, color: "#fffdf5", borde: "#5a0010", bordeAncho: 9, alfa: 1 - tramo(d, 0.65, 0.9), esp: 2 });
      g.restore();
    }
    g.restore();
    // ¡TANGO!
    if (t > T_TIT) {
      const dd = t - T_TIT, k = tramo(dd, 0, 0.18), s = lerp(2.6, 1, eIn(k)) * (1 + 0.025 * Math.sin(dd * 7));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * clamp(ancho / 150, 0, 1); g.translate(512, 104); g.rotate(-0.05); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
  }
}

registrar({ id: "00152", nombre: "Tango", crear: () => new Tango() });
})();
