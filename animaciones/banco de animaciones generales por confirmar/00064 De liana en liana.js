"use strict";
/*
 * 00064 · DE LIANA EN LIANA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se apartan unas hojas enormes y aparece la selva. Guillermo, en una rama, coge impulso y cruza colgado de una
 * liana, salta a otra y, en lo más alto, grita ¡ALLÁ VOY!: se suelta, da una voltereta y aterriza en un bar
 * construido en un árbol. El mono camarero le desliza una jarra por la barra, brindan y se la bebe. Las hojas se
 * vuelven a cerrar.
 */
(() => {
const cache = cacheTexto();
const ESC = 1.0;
const L1 = { p: [250, -30] }, L2 = { p: [520, -30] };
const AGARRE = [64, 12]; // la mano derecha en la liana (unidades de avatar)
const RAMA = 330, TARIMA = 420, ATERRIZA = 735, BX = 850; // BX: centro del árbol del bar
const ZOOM = { z: 1.42, foco: [780, 330], a: [512, 318] };

/** Hoja grande con nervio; (x, y) = tallo, apunta hacia ang. */
function hoja(g, x, y, ang, largo, ancho, c1, c2) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const gr = g.createLinearGradient(0, -ancho, 0, ancho); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(largo * 0.45, -ancho, largo, 0); g.quadraticCurveTo(largo * 0.45, ancho, 0, 0); g.fill();
  g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(largo * 0.95, 0); g.stroke();
  g.strokeStyle = "rgba(255,255,255,.08)"; g.lineWidth = 1.2;
  for (let i = 1; i < 6; i++) { const u = i / 6; g.beginPath(); g.moveTo(largo * u, 0); g.lineTo(largo * (u + 0.08), -ancho * 0.6 * Math.sin(u * Math.PI)); g.moveTo(largo * u, 0); g.lineTo(largo * (u + 0.08), ancho * 0.6 * Math.sin(u * Math.PI)); g.stroke(); }
  g.restore();
}

/** Mono camarero (de cintura para arriba); (x, y) = centro de la cabeza. */
function mono(g, x, y, t, o) {
  g.save(); g.translate(x, y);
  // cola
  g.strokeStyle = "#5c3418"; g.lineWidth = 7; g.lineCap = "round";
  g.beginPath(); g.moveTo(26, 50); g.bezierCurveTo(70, 40, 70, -10, 50, -14); g.quadraticCurveTo(38, -16, 42, -4); g.stroke();
  // cuerpo
  g.fillStyle = "#6e4020"; g.beginPath(); g.ellipse(0, 52, 30, 34, 0, 0, 6.283); g.fill();
  g.fillStyle = "#e3bb8c"; g.beginPath(); g.ellipse(0, 58, 17, 22, 0, 0, 6.283); g.fill();
  // brazos
  g.strokeStyle = "#6e4020"; g.lineWidth = 10;
  const bI = o.brazoI || [-40, 70], bD = o.brazoD || [38, 74];
  g.beginPath(); g.moveTo(-22, 40); g.quadraticCurveTo(-34, 56, bI[0], bI[1]); g.stroke();
  g.beginPath(); g.moveTo(22, 40); g.quadraticCurveTo(36, 56, bD[0], bD[1]); g.stroke();
  g.fillStyle = "#e3bb8c"; g.beginPath(); g.arc(bI[0], bI[1], 6, 0, 6.283); g.arc(bD[0], bD[1], 6, 0, 6.283); g.fill();
  // cabeza
  g.fillStyle = "#6e4020";
  g.beginPath(); g.arc(-27, -2, 11, 0, 6.283); g.arc(27, -2, 11, 0, 6.283); g.fill();
  g.fillStyle = "#e3bb8c"; g.beginPath(); g.arc(-27, -2, 6, 0, 6.283); g.arc(27, -2, 6, 0, 6.283); g.fill();
  const gc = g.createRadialGradient(-8, -10, 4, 0, 0, 30); gc.addColorStop(0, "#9a6234"); gc.addColorStop(1, "#5c3418");
  g.fillStyle = gc; g.beginPath(); g.arc(0, 0, 26, 0, 6.283); g.fill();
  g.fillStyle = "#edc79a";
  g.beginPath(); g.ellipse(-8, -4, 10, 11, 0, 0, 6.283); g.ellipse(8, -4, 10, 11, 0, 0, 6.283); g.ellipse(0, 10, 16, 12, 0, 0, 6.283); g.fill();
  if (o.feliz) { g.strokeStyle = "#111"; g.lineWidth = 2.4; g.beginPath(); g.arc(-8, -3, 4, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.beginPath(); g.arc(8, -3, 4, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
  else { g.fillStyle = "#111"; g.beginPath(); g.arc(-8, -4, 3.6, 0, 6.283); g.arc(8, -4, 3.6, 0, 6.283); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(-7, -5.5, 1.2, 0, 6.283); g.arc(9, -5.5, 1.2, 0, 6.283); g.fill(); }
  g.fillStyle = "#3a1e0c"; g.beginPath(); g.ellipse(-3, 6, 1.6, 1.2, 0, 0, 6.283); g.ellipse(3, 6, 1.6, 1.2, 0, 0, 6.283); g.fill();
  g.strokeStyle = "#3a1e0c"; g.lineWidth = 2; g.beginPath(); g.arc(0, 10, 8, 0.3, Math.PI - 0.3); g.stroke();
  g.restore();
}

class EscenaLianas extends Escena {
  constructor() {
    super(8.9);
    this.p = new Parts(300);
    this.fondoC = this.pintarFondo();
    this.cortinaI = this.pintarCortina(1); this.cortinaD = this.pintarCortina(-1);
    this.hojas = [];
    // longitud de la primera liana: desde el pivote hasta las manos en la rama
    const m0 = matAv(100, RAMA, ESC), q = aPant(m0, AGARRE);
    L1.L = Math.hypot(q[0] - L1.p[0], q[1] - L1.p[1]); L1.a0 = Math.atan2(q[0] - L1.p[0], q[1] - L1.p[1]);
    L2.L = 270;
  }
  pintarFondo() {
    const c = lienzoNuevo(W + 160, H), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#0f4a2c"); gr.addColorStop(1, "#05170c");
    g.fillStyle = gr; g.fillRect(0, 0, c.width, H);
    // rayos de luz
    g.save(); g.globalCompositeOperation = "lighter";
    for (const [x, w] of [[180, 70], [430, 50], [700, 90], [880, 40]]) {
      const gl = g.createLinearGradient(0, 0, 0, H); gl.addColorStop(0, "rgba(220,255,170,.16)"); gl.addColorStop(1, "rgba(220,255,170,0)");
      g.fillStyle = gl; g.beginPath(); g.moveTo(x, -10); g.lineTo(x + w, -10); g.lineTo(x + w + 160, H); g.lineTo(x + 100, H); g.closePath(); g.fill();
    }
    g.restore();
    // troncos lejanos
    const r = semilla(4);
    for (let i = 0; i < 8; i++) { const x = 40 + i * 150 + r() * 40, w = 24 + r() * 20; g.fillStyle = "rgba(8,30,18,.8)"; g.fillRect(x, 0, w, H); }
    // lianas de fondo
    g.strokeStyle = "rgba(30,80,40,.8)"; g.lineWidth = 3;
    for (let i = 0; i < 14; i++) { const x = r() * c.width; g.beginPath(); g.moveTo(x, -10); g.quadraticCurveTo(x + 30, 160, x - 10, 200 + r() * 200); g.stroke(); }
    // copas de árbol arriba
    for (let i = 0; i < 30; i++) hoja(g, r() * c.width, r() * 70 - 20, 0.4 + r() * 2.2, 90 + r() * 60, 26 + r() * 14, "#1d6b34", "#0d3a1c");
    // matorral abajo
    for (let i = 0; i < 46; i++) hoja(g, r() * c.width, H + 20, -0.6 - r() * 2, 120 + r() * 90, 30 + r() * 16, "#237a3a", "#0c3a1a");
    // la rama de salida (izquierda)
    g.fillStyle = "#4a2c16"; g.beginPath(); g.moveTo(-20, RAMA - 6); g.quadraticCurveTo(120, RAMA - 14, 200, RAMA - 4); g.lineTo(206, RAMA + 12); g.quadraticCurveTo(110, RAMA + 26, -20, RAMA + 30); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,220,160,.15)"; g.fillRect(-20, RAMA - 10, 220, 5);
    for (let i = 0; i < 6; i++) hoja(g, 10 + i * 34, RAMA + 10, 1.4 + r() * 0.8, 50, 14, "#2e8a44", "#145a26");
    // el árbol del bar
    const gt = g.createLinearGradient(BX - 55, 0, BX + 55, 0); gt.addColorStop(0, "#3a2210"); gt.addColorStop(0.5, "#6b4422"); gt.addColorStop(1, "#2a180a");
    g.fillStyle = gt; g.fillRect(BX - 55, -10, 110, H + 20);
    g.strokeStyle = "rgba(0,0,0,.3)"; g.lineWidth = 3;
    for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(BX - 40 + i * 11, 0); g.lineTo(BX - 43 + i * 11 + 4 * Math.sin(i), H); g.stroke(); }
    // tarima
    g.fillStyle = "#7a5028"; g.fillRect(610, TARIMA, 420, 18);
    g.fillStyle = "#4a2c16"; g.fillRect(610, TARIMA + 18, 420, 8);
    g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2; for (let x = 630; x < 1030; x += 40) { g.beginPath(); g.moveTo(x, TARIMA); g.lineTo(x, TARIMA + 18); g.stroke(); }
    g.strokeStyle = "#4a2c16"; g.lineWidth = 8; g.beginPath(); g.moveTo(640, TARIMA + 24); g.lineTo(BX - 55, TARIMA + 130); g.moveTo(1020, TARIMA + 24); g.lineTo(BX + 55, TARIMA + 130); g.stroke();
    // tejado de paja
    g.fillStyle = "#c79a3e"; g.beginPath(); g.moveTo(670, 150); g.lineTo(BX, 76); g.lineTo(1030, 150); g.lineTo(1030, 184); g.lineTo(670, 184); g.closePath(); g.fill();
    g.strokeStyle = "#8a6420"; g.lineWidth = 2; for (let x = 674; x < 1030; x += 9) { g.beginPath(); g.moveTo(x, 176); g.lineTo(x + 3, 190); g.stroke(); }
    g.strokeStyle = "#5c3a14"; g.lineWidth = 6; g.beginPath(); g.moveTo(690, 186); g.lineTo(690, TARIMA); g.moveTo(1010, 186); g.lineTo(1010, TARIMA); g.stroke();
    // cartel BAR
    g.save(); g.translate(BX, 218); g.rotate(-0.05);
    g.fillStyle = "#8a5a2c"; rectR(g, -62, -26, 124, 52, 8); g.fill(); g.strokeStyle = "#4a2c16"; g.lineWidth = 4; g.stroke();
    txt(g, "BAR", 0, 17, { tam: 46, peso: 900, fam: FD, color: "#ffe9b0", borde: "#4a2c16", bordeAncho: 4, esp: 5 });
    g.restore();
    // farolillos
    for (const x of [730, 970]) { g.strokeStyle = "#3a2210"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 186); g.lineTo(x, 204); g.stroke(); g.fillStyle = "#ffcf5a"; rectR(g, x - 9, 204, 18, 24, 5); g.fill(); }
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.6; for (const x of [730, 970]) g.drawImage(BLOB.amarillo, x - 40, 176, 80, 80); g.restore();
    return c;
  }
  pintarCortina(lado) {
    const c = lienzoNuevo(W / 2 + 160, H), g = c.getContext("2d"), r = semilla(lado > 0 ? 21 : 33);
    const borde = lado > 0 ? c.width - 60 : 60;
    for (let i = 0; i < 70; i++) {
      const y = r() * (H + 100) - 50, x = lado > 0 ? r() * (c.width - 140) : 140 + r() * (c.width - 140);
      hoja(g, x, y, lado > 0 ? -0.5 + r() : Math.PI - 0.5 + r(), 150 + r() * 80, 44 + r() * 20, r() < 0.5 ? "#2f9a4a" : "#1f7a38", "#0b3a18");
    }
    for (let i = 0; i < 14; i++) hoja(g, borde - lado * 30, i * 48 - 20, lado > 0 ? -0.3 + r() * 0.6 : Math.PI - 0.3 + r() * 0.6, 130, 40, "#38a852", "#0f4a20");
    return c;
  }
  /** Estado del avatar colgado: { mano: punto de agarre en pantalla, giro, liana activa }. */
  colgado() {
    const t = this.t;
    if (t < 0.95) return null;
    if (t < 2.0) { const th = lerp(L1.a0, 0.55, eInOut(tramo(t, 0.95, 2.0))); return { th, L: L1, mano: [L1.p[0] + L1.L * Math.sin(th), L1.p[1] + L1.L * Math.cos(th)] }; }
    const thC = -0.5, cat = [L2.p[0] + L2.L * Math.sin(thC), L2.p[1] + L2.L * Math.cos(thC)];
    if (t < 2.32) {
      const u = tramo(t, 2.0, 2.32), a = [L1.p[0] + L1.L * Math.sin(0.55), L1.p[1] + L1.L * Math.cos(0.55)];
      return { th: lerp(0.55, thC, u), L: null, mano: [lerp(a[0], cat[0], u), lerp(a[1], cat[1], u) - 70 * Math.sin(u * Math.PI)] };
    }
    if (t < 3.45) { const th = lerp(thC, 0.56, eInOut(tramo(t, 2.32, 3.45))); return { th, L: L2, mano: [L2.p[0] + L2.L * Math.sin(th), L2.p[1] + L2.L * Math.cos(th)] }; }
    return null;
  }
  /** Ángulo de cada liana cuando no la lleva. */
  angLiana(L) {
    const t = this.t, c = this.colgado();
    if (c && c.L === L) return c.th;
    if (L === L1) { if (t < 0.95) return L1.a0; const k = tramo(t, 2.0, 4.0); return 0.55 * Math.cos(k * 9) * (1 - k) ; }
    if (t < 2.32) return Math.sin(t * 1.5) * 0.06;
    const k = tramo(t, 3.45, 5.5); return 0.56 * Math.cos(k * 9) * (1 - k);
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let m, manoD = [70, 158], manoI = [9, 160], jarra = null;
    const agarrado = { D: [64, 10], I: [-26, 76 + 10 * Math.sin(t * 7)] };
    const c = this.colgado();
    if (t < 0.95) {
      // en la rama: con la liana en la mano, coge impulso
      const kA = eInOut(tramo(t, 0.55, 0.9));
      pose.cara = t < 0.55 ? "guino" : "risa";
      manoD = agarrado.D; manoI = mezcla([-6, 140], [-30, 96], kA);
      const m0 = matAv(100, RAMA, ESC, 0, 1 + 0.05 * kA, 1 - 0.1 * kA);
      return { pose: Object.assign(pose, { manoD, manoI }), m: m0, pies: [100, RAMA] };
    }
    if (c) {
      const u = (t - 0.95);
      pose.cara = t < 2.0 ? "risa" : t < 2.32 ? "sorpresa" : "risa";
      manoD = agarrado.D; manoI = agarrado.I;
      // las piernas van con retraso
      const vel = Math.cos(u * 3) * 0.3;
      pose.piernaI = [0, 0.15 + vel]; pose.piernaD = [0, -0.1 + vel];
      if (t > 2.0 && t < 2.32) { pose.piernaI = [-8, 0.5]; pose.piernaD = [-8, -0.5]; }
      m = matAv(c.mano[0], c.mano[1], ESC, -c.th, 1, 1, AGARRE);
      return { pose: Object.assign(pose, { manoD, manoI }), m, colgado: c };
    }
    if (t < 4.35) {
      // ¡ALLÁ VOY!: se suelta y da una voltereta hasta la tarima
      const u = tramo(t, 3.45, 4.35);
      const ini = aPant(matAv(L2.p[0] + L2.L * Math.sin(0.56), L2.p[1] + L2.L * Math.cos(0.56), ESC, -0.56, 1, 1, AGARRE), [39, 116]);
      const fin = [ATERRIZA, TARIMA - 116 * ESC];
      const x = lerp(ini[0], fin[0], u), y = lerp(ini[1], fin[1], u) - 170 * Math.sin(u * Math.PI);
      const giro = lerp(-0.56, Math.PI * 2, eInOut(u));
      pose.cara = "sorpresa";
      manoD = [86, 40]; manoI = [-8, 40];
      pose.piernaI = [-10, 0.3]; pose.piernaD = [-10, -0.3];
      if (u > 0.3 && u < 0.8) { pose.cara = "risa"; manoD = [72, 120]; manoI = [6, 120]; pose.piernaI = [-30, 0.6]; pose.piernaD = [-30, -0.6]; }
      return { pose: Object.assign(pose, { manoD, manoI }), m: matAv(x, y, ESC, giro, 1, 1, [39, 116]) };
    }
    // en el bar
    const kAt = Math.max(0, 1 - (t - 4.35) * 5);
    let sx = 1 + 0.08 * kAt, sy = 1 - 0.16 * kAt;
    pose.cara = t < 4.6 ? "sorpresa" : "risa";
    manoI = [-18, 130 - 20 * kAt];
    const kCoge = eInOut(tramo(t, 4.95, 5.15));
    // la jarra llega deslizándose por la barra
    const enMano = t >= 5.15;
    manoD = mezcla([90, 150], [100, 142], kCoge);
    if (enMano) {
      const kBr = eBack(tramo(t, 5.2, 5.5)) * (1 - eInOut(tramo(t, 5.85, 6.05)));
      manoD = mezcla([100, 142], [112, 70], kBr);
      let inc = -0.15 * kBr;
      // se la bebe
      const kSube = eInOut(tramo(t, 6.0, 6.3)) * (1 - eInOut(tramo(t, 7.15, 7.4)));
      const kTrago = eInOut(tramo(t, 6.3, 7.1)) * (1 - eInOut(tramo(t, 7.15, 7.4)));
      pose.rc = -0.32 * kTrago;
      const incB = -0.4 * kSube - 1.2 * kTrago;
      if (kSube > 0) {
        const b = boca(pose.rc), r = rot2(JARRA.borde, incB);
        manoD = mezcla(manoD, [b[0] - r[0], b[1] - r[1]], kSube); inc = incB;
      }
      const nivel = t < 6.3 ? 1 : 1 - tramo(t, 6.3, 7.1);
      jarra = { inc, nivel };
      if (t > 7.0 && t < 7.5) pose.cara = "dormido";
      if (t > 7.5) pose.cara = "guino";
    }
    pose.manoD = manoD; pose.manoI = manoI; pose.jarra = jarra;
    return { pose, m: matAv(ATERRIZA, TARIMA, ESC, 0, sx, sy) };
  }
  jarraBarra() { // la jarra que desliza el mono: x en la barra
    const t = this.t;
    if (t < 4.55 || t >= 5.15) return null;
    return { x: lerp(BX + 20, ATERRIZA + 62, eOut(tramo(t, 4.6, 5.1))), y: 360 };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    this.una("salta", t > 0.95, () => { for (let i = 0; i < 6; i++) this.hojas.push({ x: 100 + azar(-30, 30), y: RAMA, vx: azar(-60, 60), vy: azar(-120, -40), r: azar(0, 6), vr: azar(-4, 4) }); });
    this.una("voy", t > 3.15, () => temblar(8, 0.25));
    this.una("aterriza", t > 4.35, () => {
      temblar(16, 0.4);
      for (let i = 0; i < 18; i++) p.nueva(P.POLVO, ATERRIZA + azar(-40, 40), TARIMA - 4, azar(-260, 260), azar(-60, -5), azar(0.5, 0.9), azar(20, 34));
      for (let i = 0; i < 12; i++) this.hojas.push({ x: azar(660, 1000), y: azar(60, 160), vx: azar(-50, 50), vy: azar(20, 80), r: azar(0, 6), vr: azar(-4, 4) });
    });
    this.una("brindis", t > 5.45, () => { temblar(5, 0.15); const q = aPant(e.m, [112, 50]); p.nueva(P.DESTELLO, q[0] + 20, q[1], 0, 0, 0.35, 90); for (let i = 0; i < 12; i++) p.nueva(P.CHISPA, q[0] + 20, q[1], azar(-250, 250), azar(-300, 50), azar(0.3, 0.6), azar(6, 10)); for (let i = 0; i < 8; i++) p.nueva(P.ESPUMA, q[0] + 20, q[1], azar(-90, 90), azar(-200, -60), azar(0.4, 0.7), azar(3, 6)); });
    if (t > 6.3 && t < 7.1 && Math.random() < 0.3) { const q = aPant(e.m, boca(e.pose.rc)); p.nueva(P.GOTA, q[0] - 4, q[1] + 3, azar(-50, 20), azar(-20, 20), 0.7, azar(2, 3)); }
    for (const h of this.hojas) { h.vy = Math.min(h.vy + 300 * dt, 90); h.x += (h.vx + Math.sin(t * 3 + h.r) * 40) * dt; h.y += h.vy * dt; h.r += h.vr * dt; }
    this.hojas = this.hojas.filter((h) => h.y < H + 20);
    p.actualizar(dt);
  }
  liana(g, L, ang, agarre, t) {
    const fin = agarre || [L.p[0] + L.L * Math.sin(ang), L.p[1] + L.L * Math.cos(ang)];
    const mx = (L.p[0] + fin[0]) / 2 + 14 * Math.cos(ang), my = (L.p[1] + fin[1]) / 2 + 10;
    g.save(); g.lineCap = "round";
    g.strokeStyle = "#3d5a1c"; g.lineWidth = 7; g.beginPath(); g.moveTo(L.p[0], L.p[1]); g.quadraticCurveTo(mx, my, fin[0], fin[1]); g.stroke();
    g.strokeStyle = "#6f8f2c"; g.lineWidth = 3; g.beginPath(); g.moveTo(L.p[0], L.p[1]); g.quadraticCurveTo(mx, my, fin[0], fin[1]); g.stroke();
    for (let i = 1; i < 6; i++) {
      const u = i / 6, x = (1 - u) * (1 - u) * L.p[0] + 2 * u * (1 - u) * mx + u * u * fin[0], y = (1 - u) * (1 - u) * L.p[1] + 2 * u * (1 - u) * my + u * u * fin[1];
      hoja(g, x, y, (i % 2 ? 0.6 : 2.5) + 0.2 * Math.sin(t * 3 + i), 26, 9, "#3fae55", "#1a5a26");
    }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    // cámara: se acerca al bar después de aterrizar
    const kz = eInOut(tramo(t, 4.45, 5.1)), z = lerp(1, ZOOM.z, kz);
    const fx = lerp(W / 2, ZOOM.foco[0], kz), fy = lerp(H / 2, ZOOM.foco[1], kz), ax = lerp(W / 2, ZOOM.a[0], kz), ay = lerp(H / 2, ZOOM.a[1], kz);
    g.save(); g.translate(ax, ay); g.scale(z, z); g.translate(-fx, -fy);
    g.drawImage(this.fondoC, 0, 0);
    // lianas
    const c = e.colgado;
    const agarre = c ? aPant(e.m, AGARRE) : null;
    const agarre0 = t < 0.95 ? aPant(e.m, AGARRE) : null;
    this.liana(g, L1, this.angLiana(L1), (c && c.L === L1) ? agarre : agarre0, t);
    this.liana(g, L2, this.angLiana(L2), (c && c.L === L2) ? agarre : null, t);
    // mono detrás de la barra
    const jb = this.jarraBarra();
    const empuja = t > 4.5 && t < 5.0;
    const brinda = t > 5.2 && t < 6.0;
    const monoBrazoD = brinda ? [30, -30 + 4 * Math.sin(t * 9)] : [38, 74];
    mono(g, BX + 22, 300 + 2 * Math.sin(t * 4), t, { feliz: (t > 5.4 && t < 6.1) || t > 7.2, brazoI: empuja ? [-48 - 30 * tramo(t, 4.6, 4.9), 58] : t > 7.2 ? [-18, 30 + 6 * Math.sin(t * 20)] : [-40, 70], brazoD: t > 7.2 ? [18, 30 - 6 * Math.sin(t * 20)] : monoBrazoD });
    if (brinda) { g.save(); g.translate(BX + 22 + 30, 300 - 34); g.scale(1.1, 1.1); g.translate(-12, 0); dibujarJarra(g, [0, 0], 0.2, 1, "asa", t); dibujarJarra(g, [0, 0], 0.2, 1, "cuerpo", t); g.restore(); }
    // barra
    const gb = g.createLinearGradient(0, 360, 0, TARIMA); gb.addColorStop(0, "#9a6234"); gb.addColorStop(1, "#5c3818");
    g.fillStyle = gb; g.fillRect(790, 362, 150, TARIMA - 362);
    g.fillStyle = "#c8915a"; g.fillRect(784, 352, 162, 12);
    g.strokeStyle = "rgba(0,0,0,.3)"; g.lineWidth = 2; for (let x = 805; x < 940; x += 22) { g.beginPath(); g.moveTo(x, 366); g.lineTo(x, TARIMA); g.stroke(); }
    if (jb) { g.save(); g.translate(jb.x, jb.y - 18); g.scale(1.1, 1.1); dibujarJarra(g, [0, 0], 0, 1, "asa", t); dibujarJarra(g, [0, 0], 0, 1, "cuerpo", t); g.restore(); }
    pintarAvatar(g, e.m, e.pose, t);
    // hojas que caen
    for (const h of this.hojas) hoja(g, h.x, h.y, h.r, 22, 8, "#46b85c", "#1d6a2c");
    this.p.dibujar(g);
    g.restore();
    // ¡ALLÁ VOY!
    if (t > 3.15 && t < 4.9) {
      const k = tramo(t, 3.15, 3.3), s = lerp(2.6, 1, eIn(k));
      const spr = this.rotulo();
      g.save(); g.translate(440, 128); g.rotate(-0.07); g.scale(s, s);
      g.globalAlpha = Math.min(1, k * 4) * (1 - tramo(t, 4.6, 4.9));
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // hojas que se apartan (al principio) y se cierran (al final)
    const abre = eInOut(tramo(t, 0.1, 0.85)) * (1 - eInOut(tramo(t, 7.85, 8.55)));
    const dx = abre * (W / 2 + 180);
    if (abre < 1) {
      g.drawImage(this.cortinaI, -60 - dx, 0);
      g.drawImage(this.cortinaD, W / 2 - 100 + dx, 0);
    }
    const negro = Math.max(1 - tramo(t, 0.02, 0.4), tramo(t, 8.4, 8.85));
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  rotulo() {
    if (cache.has("voy")) return cache.get("voy");
    const c = lienzoNuevo(700, 200), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 170);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8a1a");
    txt(g, "¡ALLÁ VOY!", 350, 152, { tam: 130, peso: 400, fam: FC, color: gr, borde: "#1f3a10", bordeAncho: 13, esp: 4, glow: "rgba(0,0,0,.6)", glowTam: 14, max: 660 });
    cache.set("voy", c);
    return c;
  }
}

registrar({ id: "00064", nombre: "De liana en liana", crear: () => new EscenaLianas() });
})();
