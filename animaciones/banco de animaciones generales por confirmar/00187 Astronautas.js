"use strict";
/*
 * 00187 · ASTRONAUTAS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende el espacio: un módulo lunar baja con su llama y se posa en una luna de espuma, con un planeta de cerveza
 * en el cielo. Se abre la puerta y salen de un salto, en gravedad baja, Marcos (con voltereta) y Guillermo (con la
 * bandera enrollada, braceando). Dan saltos lentos; Guillermo levanta la bandera y la clava en la espuma (¡CHOF!): se
 * despliega con una jarra dibujada y saludan los dos: ¡ALUNIZAJE! Se cierra un iris.
 */
(() => {
const cache = cacheTexto();
const ESC = 1.45, SUELO = 565;
const LX = 232, LY = 470;                 // módulo: centro de abajo (patas)
const T_POSA = 2.0, T_PUERTA = 2.2;
const T_M0 = 2.8, T_M1 = 3.8;             // salto de Marcos fuera del módulo
const T_G0 = 3.6, T_G1 = 4.6;             // salto de Guillermo
const T_SUBE = 5.85, T_CLAVA = 6.6, T_TXT = 7.05;
const XG = 410, XM = 772;

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(860, 200), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 160);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#e6f8ff"); gr.addColorStop(1, "#7fd8ff");
  txt(g, "¡ALUNIZAJE!", 436, 154, { tam: 132, peso: 900, fam: FD, color: "#06223a", esp: 5 });
  txt(g, "¡ALUNIZAJE!", 430, 146, { tam: 132, peso: 900, fam: FD, color: gr, borde: "#06223a", bordeAncho: 11, esp: 5, glow: "rgba(120,220,255,.9)", glowTam: 26 });
  cache.set("t", c);
  return c;
}
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
/** Matriz que gira alrededor del centro del cuerpo pero deja los pies en (x, y) cuando no hay giro. */
function mAv(x, y, esc, giro = 0, sy = 1, q) {
  const px = q === "marcos" ? 37 : 39;
  return matAv(x, y - 116 * esc * sy, esc, giro, 1, sy, [px, 116]);
}
const arco = (u, h) => 4 * u * (1 - u) * h;
const horizonte = (x) => 438 + Math.pow((x - 512) / 512, 2) * 46;

/** Escafandra de burbuja (se pinta en coordenadas de avatar, girando con la cabeza). */
function hacerCasco(r) {
  const S = 3, L = (r + 8) * 2, c = lienzoNuevo(L * S, L * S), g = c.getContext("2d");
  g.scale(S, S); g.translate(L / 2, L / 2);
  const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
  gr.addColorStop(0, "rgba(220,245,255,.16)"); gr.addColorStop(0.75, "rgba(150,210,255,.10)"); gr.addColorStop(1, "rgba(150,210,255,.38)");
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(235,250,255,.9)"; g.lineWidth = 2.6; g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.stroke();
  g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = 4.5; g.lineCap = "round";
  g.beginPath(); g.arc(0, 0, r - 7, 3.55, 4.35); g.stroke();
  g.lineWidth = 2.5; g.beginPath(); g.arc(0, 0, r - 7, 4.55, 4.75); g.stroke();
  g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, r - 5, 0.3, 1.1); g.stroke();
  return { c, L };
}
/** Collarín metálico y panel del pecho (coordenadas de avatar). */
function traje(g, R) {
  const cx = R.cuello[0], cy = R.cuello[1] + 3;
  const gr = g.createLinearGradient(cx - 30, 0, cx + 30, 0);
  gr.addColorStop(0, "#7d8794"); gr.addColorStop(0.45, "#f4f7fa"); gr.addColorStop(1, "#6d7784");
  g.fillStyle = gr; g.beginPath(); g.ellipse(cx, cy, 31, 8, 0, 0, 6.283); g.fill();
  g.strokeStyle = "#4a525c"; g.lineWidth = 1.2; g.stroke();
  // panel
  const px = cx - 15, py = R.hombroD[1] + 18;
  g.fillStyle = "#e9edf2"; rectR(g, px, py, 30, 19, 3); g.fill();
  g.strokeStyle = "#7d8794"; g.lineWidth = 1; g.stroke();
  for (const [x, col] of [[6, "#ff3d84"], [13, "#2bff5b"], [20, "#ffd34d"]]) { g.fillStyle = col; g.beginPath(); g.arc(px + x, py + 7, 2.4, 0, 6.283); g.fill(); }
  g.fillStyle = "#2fe3e8"; g.fillRect(px + 4, py + 12, 22, 3);
}
/** Mochila (detrás del cuerpo). */
function mochila(g, R) {
  const x0 = R.hombroI2[0] - 6, x1 = R.hombroD[0] + 6, y0 = R.hombroD[1] - 22;
  const gr = g.createLinearGradient(x0, 0, x1, 0);
  gr.addColorStop(0, "#9aa4b0"); gr.addColorStop(0.5, "#ffffff"); gr.addColorStop(1, "#8a94a0");
  g.fillStyle = gr; rectR(g, x0, y0, x1 - x0, 74, 9); g.fill();
  g.strokeStyle = "#5c6672"; g.lineWidth = 1.4; g.stroke();
  g.fillStyle = "#c9d1da"; rectR(g, x0 + 6, y0 - 7, 12, 9, 3); g.fill(); rectR(g, x1 - 18, y0 - 7, 12, 9, 3); g.fill();
}

class Astronautas extends Escena {
  constructor() {
    super(9.8);
    this.p = new Parts(360);
    this.burb = [];
    this.fondoC = null; this.cascos = {};
    const r = semilla(5);
    this.estrellas = [];
    for (let i = 0; i < 14; i++) this.estrellas.push([r() * W, r() * 330, 6 + r() * 8, r() * 6]);
  }
  /** Módulo: desplazamiento vertical (baja con la llama). */
  modY() { return -560 * (1 - eOut(tramo(this.t, 0.25, T_POSA))); }
  puerta() { return eOut(tramo(this.t, T_PUERTA, T_PUERTA + 0.35)); }

  // ------------------------------------------------------------------ Marcos
  poseM() {
    const t = this.t;
    const pose = { quien: "marcos", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    if (t < T_M0 - 0.38) return null;
    let x, y, esc, giro = 0, sy = 1;
    if (t < T_M0) {
      // asoma por la puerta y saluda
      x = LX; y = LY - 42; esc = 0.36; pose.cara = "risa";
      pose.manoD = [74 + 8 * Math.sin(t * 14), 40]; pose.rc = 0.08 * Math.sin(t * 7);
    } else if (t < T_M1) {
      const u = tramo(t, T_M0, T_M1);
      x = lerp(LX, XM, eInOut(u)); esc = lerp(0.36, ESC, eIn(u) * 0.4 + u * 0.6);
      y = lerp(LY - 42, SUELO, u) - arco(u, 230);
      giro = -6.283 * eInOut(tramo(u, 0.15, 0.85));
      if (u > 0) { pose.piernaI = [-12, 0.3]; pose.piernaD = [-12, -0.3]; pose.manoD = [82, 118]; pose.manoI = [-8, 118]; pose.cara = "risa"; }
    } else {
      x = XM; y = SUELO; esc = ESC;
      const d = t - T_M1;
      sy = 1 - 0.13 * Math.sin(Math.PI * clamp(d / 0.25, 0, 1));
      pose.cara = "risa"; pose.rc = -0.08;
      // saltos lentos
      for (const [a, b, h, dx] of [[4.15, 5.15, 120, -20], [5.3, 6.0, 70, 0], [7.6, 8.6, 110, 0]]) {
        if (t > a && t < b) {
          const u = tramo(t, a, b);
          y -= arco(u, h); x += dx * u;
          pose.piernaI = [-10, 0.22]; pose.piernaD = [-10, -0.22];
          pose.manoD = [80 + 4 * Math.sin(t * 5), 112]; pose.manoI = [-6 - 4 * Math.sin(t * 5), 112];
        } else if (t >= b) x += dx;
      }
      // mira cómo Guillermo levanta la bandera y saluda
      if (t > T_SUBE - 0.1 && t < T_CLAVA) { pose.cara = "sorpresa"; pose.rc = 0.12; }
      else if (t >= T_CLAVA && t < T_TXT) { pose.cara = "risa"; pose.rc = 0.06; }
      if (t > T_TXT && t < 7.55) {
        const k = eOut(tramo(t, T_TXT, T_TXT + 0.25));
        pose.manoD = mezcla([67, 152], [60, 38], k); pose.cara = "guino"; pose.rc = 0.06;
      }
      if (t > 8.6) { const k = eOut(tramo(t, 8.6, 8.85)); pose.manoD = mezcla([67, 152], [60, 38], k); pose.cara = "guino"; }
    }
    return { pose, m: mAv(x, y, esc, giro, sy, "marcos"), esc };
  }

  // ------------------------------------------------------------------ Guillermo
  poseG() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [80, 150], manoI: [9, 160] };
    if (t < T_G0 - 0.38) return null;
    let x, y, esc, giro = 0, sy = 1;
    if (t < T_G0) {
      // en la puerta, mirando abajo con miedo
      x = LX; y = LY - 42; esc = 0.36; pose.cara = "sorpresa"; pose.rc = 0.12;
      pose.manoI = [-6, 120];
    } else if (t < T_G1) {
      const u = tramo(t, T_G0, T_G1);
      x = lerp(LX, XG - 30, eInOut(u)); esc = lerp(0.36, ESC, eIn(u) * 0.4 + u * 0.6);
      y = lerp(LY - 42, SUELO, u) - arco(u, 170);
      if (u > 0) {
        pose.piernaI = [-8, 0.25 + 0.2 * Math.sin(t * 14)]; pose.piernaD = [-12, -0.3];
        pose.manoI = [-24 + 8 * Math.sin(t * 16), 70 + 20 * Math.cos(t * 16)];
        pose.cara = "sorpresa"; pose.rc = 0.1 * Math.sin(t * 9);
        giro = 0.18 * Math.sin(u * 7);
      }
    } else {
      x = XG - 30; y = SUELO; esc = ESC;
      const d = t - T_G1;
      // aterriza tambaleándose
      giro = 0.22 * Math.sin(d * 13) * Math.exp(-d * 4.5);
      sy = 1 - 0.15 * Math.sin(Math.PI * clamp(d / 0.25, 0, 1));
      pose.cara = d < 0.5 ? "sorpresa" : "sonrisa";
      if (d < 0.6) pose.manoI = [-22 + 10 * Math.sin(d * 20), 90 + 20 * Math.cos(d * 20)];
      // un salto lento hacia delante
      if (t > 5.0 && t < 5.7) {
        const u = tramo(t, 5.0, 5.7);
        y -= arco(u, 90); x += 30 * eInOut(u);
        pose.piernaI = [-10, 0.22]; pose.piernaD = [-10, -0.22]; pose.manoI = [-14, 112]; pose.cara = "risa";
      } else if (t >= 5.7) x += 30;
      if (t >= 5.7 && t < T_SUBE) { pose.cara = "guino"; }
    }
    const m = mAv(x, y, esc, giro, sy);
    // la bandera: la levanta con las dos manos y la clava
    if (t >= T_SUBE && t < T_CLAVA + 0.35) {
      const kS = eInOut(tramo(t, T_SUBE, T_SUBE + 0.5)), kB = eIn(tramo(t, T_CLAVA - 0.22, T_CLAVA));
      pose.manoD = mezcla(mezcla([80, 150], [74, 42], kS), [82, 155], kB);
      pose.manoI = mezcla(mezcla([9, 160], [66, 70], kS), [66, 168], kB);
      pose.brazoIDelante = true;
      pose.cara = kB > 0 ? "risa" : "dormido"; pose.rc = -0.1 * kS * (1 - kB);
      if (t > T_CLAVA) { pose.manoD = [82, 155]; pose.manoI = mezcla([66, 168], [9, 160], eOut(tramo(t, T_CLAVA + 0.1, T_CLAVA + 0.35))); pose.cara = "risa"; }
    }
    if (t >= T_CLAVA + 0.35) {
      const kL = eOut(tramo(t, T_TXT - 0.1, T_TXT + 0.2));
      pose.manoD = mezcla([82, 155], [64, 24], kL);
      pose.cara = t < T_TXT ? "risa" : "guino"; pose.rc = -0.06;
      if (t > 8.0) pose.cara = "risa";
    }
    return { pose, m, esc };
  }
  /** Dónde está el mástil: { x, abajo, arriba, plantado }. */
  mastil(eG) {
    const t = this.t;
    if (t >= T_CLAVA) return { x: this.xMastil, abajo: SUELO + 6, arriba: SUELO + 6 - 340, s: 1, plantado: true };
    if (!eG) return null;
    const q = aPant(eG.m, eG.pose.manoD), s = eG.esc / ESC;
    return { x: q[0], abajo: q[1] + 115 * s, arriba: q[1] + 115 * s - 340 * s, s, plantado: false };
  }

  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // llama del módulo bajando
    if (t > 0.25 && t < T_POSA + 0.1) {
      const y = LY + this.modY();
      if (Math.random() < 30 * dt) p.nueva(P.HUMO, LX + azar(-30, 30), y + 10, azar(-60, 60), azar(20, 60), azar(0.5, 0.9), azar(30, 50));
    }
    this.una("posa", t > T_POSA, () => {
      temblar(10, 0.35);
      for (let i = 0; i < 26; i++) { const a = azar(-Math.PI, 0); p.nueva(P.ESPUMA, LX + azar(-80, 80), LY - 4, Math.cos(a) * azar(80, 260), Math.sin(a) * azar(60, 200), azar(0.6, 1.2), azar(5, 10)); }
      for (let i = 0; i < 10; i++) p.nueva(P.VAPOR, LX + azar(-90, 90), LY - 10, azar(-120, 120), azar(-40, 0), azar(0.7, 1.2), azar(30, 60));
    });
    const posar = (k, x, n) => this.una(k, true, () => {
      for (let i = 0; i < n; i++) { const a = azar(-Math.PI, 0); p.nueva(P.ESPUMA, x + azar(-50, 50), SUELO - 2, Math.cos(a) * azar(60, 220), Math.sin(a) * azar(40, 200), azar(0.5, 1.0), azar(4, 9)); }
    });
    if (t > T_M1) posar("m1", XM, 18);
    if (t > T_G1) { posar("g1", XG - 30, 18); this.una("tg", true, () => temblar(6, 0.2)); }
    if (t > 5.15) posar("m2", XM - 20, 10);
    if (t > 5.7) posar("g2", XG, 12);
    if (t > 6.0) posar("m3", XM - 20, 8);
    if (t > 8.6) posar("m4", XM - 20, 10);
    if (t > T_CLAVA && this.xMastil == null) { const eG = this.poseG(); this.xMastil = aPant(eG.m, [82, 155])[0]; }
    this.una("clava", t > T_CLAVA, () => {
      temblar(16, 0.4);
      const x = this.xMastil;
      p.nueva(P.DESTELLO, x, SUELO, 0, 0, 0.35, 200);
      for (let i = 0; i < 40; i++) { const a = azar(-Math.PI, 0); p.nueva(P.ESPUMA, x + azar(-10, 10), SUELO, Math.cos(a) * azar(120, 420), Math.sin(a) * azar(150, 460), azar(0.7, 1.3), azar(6, 12)); }
    });
    // burbujas que suben del agujero del mástil (gravedad baja)
    if (t > T_CLAVA && t < 9.3 && Math.random() < 7 * dt) this.burb.push({ x: this.xMastil + azar(-14, 14), y: SUELO, r: azar(4, 11), v: azar(40, 90), f: azar(0, 6) });
    for (const b of this.burb) { b.y -= b.v * dt; b.x += Math.sin(t * 2 + b.f) * 14 * dt; }
    this.burb = this.burb.filter((b) => b.y > -20);
    if (t > T_TXT && t < 9.2 && Math.random() < 10 * dt) p.nueva(P.PURPURINA, azar(150, 870), azar(20, 120), azar(-20, 20), azar(10, 40), azar(1, 1.6), azar(8, 14));
    p.actualizar(dt);
  }

  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, 460);
    gc.addColorStop(0, "#02030c"); gc.addColorStop(1, "#0d1838");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, H + 120);
    const r = semilla(11);
    for (let i = 0; i < 170; i++) { g.fillStyle = `rgba(255,255,255,${0.25 + r() * 0.7})`; const s = r() < 0.12 ? 2.2 : 1.2; g.fillRect(r() * (W + 120) - 60, r() * 480 - 60, s, s); }
    // planeta de cerveza con casquete de espuma
    const px = 895, py = 178, pr = 74;
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5; g.drawImage(BLOB2.oro, px - pr * 2, py - pr * 2, pr * 4, pr * 4); g.restore();
    const gp = g.createRadialGradient(px - 25, py - 20, 8, px, py, pr);
    gp.addColorStop(0, "#ffe27a"); gp.addColorStop(0.6, "#f0a020"); gp.addColorStop(1, "#9a4a00");
    g.fillStyle = gp; g.beginPath(); g.arc(px, py, pr, 0, 6.283); g.fill();
    g.save(); g.beginPath(); g.arc(px, py, pr, 0, 6.283); g.clip();
    g.fillStyle = "rgba(255,245,200,.55)";
    for (let i = 0; i < 16; i++) { g.beginPath(); g.arc(px - pr + r() * pr * 2, py - 10 + r() * pr, 1.5 + r() * 3, 0, 6.283); g.fill(); }
    g.fillStyle = "#fffaf0";
    g.beginPath(); g.moveTo(px - pr - 4, py - 22);
    for (let i = 0; i <= 8; i++) { const x = px - pr + (i * pr * 2) / 8; g.arc(x, py - 26 + (i % 2) * 5, 11 + (i % 3) * 2, Math.PI, 0); }
    g.lineTo(px + pr + 4, py - pr - 10); g.lineTo(px - pr - 4, py - pr - 10); g.closePath(); g.fill();
    g.fillStyle = "rgba(70,20,0,.32)"; g.beginPath(); g.rect(px - pr - 2, py - pr - 2, pr * 2 + 4, pr * 2 + 4); g.arc(px - 16, py - 16, pr * 1.02, 0, 6.283, true); g.fill("evenodd");
    g.restore();
    // la luna de espuma
    g.beginPath(); g.moveTo(-60, H + 60);
    for (let x = -60; x <= W + 60; x += 16) g.lineTo(x, horizonte(x));
    g.lineTo(W + 60, H + 60); g.closePath();
    const gs = g.createLinearGradient(0, 430, 0, H);
    gs.addColorStop(0, "#fffdf2"); gs.addColorStop(0.4, "#f5ecd0"); gs.addColorStop(1, "#d8c79a");
    g.fillStyle = gs; g.fill();
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.18; g.drawImage(BLOB2.cian, -200, 380, W + 400, 120); g.restore();
    // cráteres y pompas
    for (const [x, y, rx] of [[120, 520, 60], [560, 470, 46], [690, 590, 80], [940, 500, 52], [330, 600, 50], [860, 455, 26], [430, 455, 22]]) {
      const ry = rx * 0.28;
      g.fillStyle = "#d9c897"; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 6.283); g.fill();
      g.fillStyle = "#c8b47e"; g.beginPath(); g.ellipse(x, y + ry * 0.25, rx * 0.86, ry * 0.7, 0, 0, 6.283); g.fill();
      g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 2.5; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0.1, Math.PI - 0.1); g.stroke();
    }
    g.strokeStyle = "rgba(180,160,110,.5)"; g.lineWidth = 1.5;
    for (let i = 0; i < 46; i++) { const x = r() * W, y = 470 + r() * 130, rr = 2 + r() * 7; g.beginPath(); g.arc(x, y, rr * (0.5 + (y - 450) / 200), 0, 6.283); g.stroke(); }
    this.fondoC = c;
    return c;
  }
  modulo(g, t) {
    const dy = this.modY(), x = LX, y = LY + dy, k = this.puerta();
    g.save(); g.translate(x, y);
    // llama
    if (t > 0.25 && t < T_POSA + 0.15) {
      const f = 1 - tramo(t, T_POSA - 0.1, T_POSA + 0.15);
      g.save(); g.globalCompositeOperation = "lighter";
      const L = (90 + 30 * Math.sin(t * 40)) * f;
      g.globalAlpha = 0.9 * f; g.drawImage(BLOB2.oro, -40, -56, 80, L + 40);
      g.globalAlpha = f; g.drawImage(BLOB2.oroClaro, -22, -50, 44, L * 0.8 + 20);
      g.restore();
    }
    // patas
    g.strokeStyle = "#b9c2cc"; g.lineWidth = 6; g.lineCap = "round";
    for (const s of [-1, 1]) {
      g.beginPath(); g.moveTo(s * 50, -50); g.lineTo(s * 92, -4); g.stroke();
      g.beginPath(); g.moveTo(s * 30, -40); g.lineTo(s * 92, -4); g.stroke();
      g.fillStyle = "#dfe5ec"; g.beginPath(); g.ellipse(s * 92, -2, 18, 5, 0, 0, 6.283); g.fill();
    }
    // cuerpo dorado
    const gb = g.createLinearGradient(-80, 0, 80, 0);
    gb.addColorStop(0, "#8a5a10"); gb.addColorStop(0.35, "#ffd760"); gb.addColorStop(0.55, "#fff2b0"); gb.addColorStop(1, "#7a4a08");
    g.fillStyle = gb;
    g.beginPath(); g.moveTo(-78, -40); g.lineTo(78, -40); g.lineTo(70, -150); g.lineTo(-70, -150); g.closePath(); g.fill();
    g.strokeStyle = "rgba(90,50,0,.35)"; g.lineWidth = 1.5;
    for (const yy of [-70, -100, -128]) { g.beginPath(); g.moveTo(-76, yy); g.lineTo(76, yy); g.stroke(); }
    // cabina plateada
    const gc = g.createLinearGradient(-70, 0, 70, 0);
    gc.addColorStop(0, "#7a8590"); gc.addColorStop(0.4, "#ffffff"); gc.addColorStop(1, "#6a7480");
    g.fillStyle = gc;
    g.beginPath(); g.moveTo(-70, -150); g.quadraticCurveTo(-74, -230, 0, -236); g.quadraticCurveTo(74, -230, 70, -150); g.closePath(); g.fill();
    g.strokeStyle = "#5a636e"; g.lineWidth = 1.5; g.stroke();
    // ventanilla
    g.fillStyle = "#123a5c"; g.beginPath(); g.arc(28, -192, 16, 0, 6.283); g.fill();
    g.strokeStyle = "#c9d1da"; g.lineWidth = 4; g.stroke();
    g.fillStyle = "rgba(255,255,255,.5)"; g.beginPath(); g.arc(23, -197, 5, 0, 6.283); g.fill();
    // antena con luz
    g.strokeStyle = "#c9d1da"; g.lineWidth = 3; g.beginPath(); g.moveTo(-20, -234); g.lineTo(-26, -270); g.stroke();
    const luz = Math.sin(t * 7) > 0 ? 1 : 0.25;
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = luz; g.drawImage(BLOB.rojo, -40, -284, 28, 28); g.restore();
    g.fillStyle = luz > 0.5 ? "#ff6a5a" : "#a03028"; g.beginPath(); g.arc(-26, -270, 4, 0, 6.283); g.fill();
    // puerta: hueco oscuro y rampa que baja
    g.fillStyle = "#1a1206"; rectR(g, -30, -150 + 4, 60, 106, 8); g.fill();
    if (k > 0) {
      g.save(); g.globalAlpha = k; g.globalCompositeOperation = "lighter";
      g.drawImage(BLOB.amarillo, -40, -150, 80, 110); g.restore();
    }
    // hoja de la puerta (se desliza hacia arriba)
    g.save(); rectR(g, -30, -146, 60, 106, 8); g.clip();
    g.fillStyle = "#d8dee5"; rectR(g, -30, -146 - 106 * k, 60, 106, 8); g.fill();
    g.strokeStyle = "#8a949e"; g.lineWidth = 2; g.strokeRect(-22, -134 - 106 * k, 44, 82);
    g.restore();
    g.strokeStyle = "#5a636e"; g.lineWidth = 3; rectR(g, -30, -146, 60, 106, 8); g.stroke();
    // rampa
    if (k > 0) {
      g.fillStyle = "#c9d1da";
      g.beginPath(); g.moveTo(-28, -40); g.lineTo(28, -40); g.lineTo(28 + 10 * k, -40 + 38 * k); g.lineTo(-28 - 10 * k, -40 + 38 * k); g.closePath(); g.fill();
      g.strokeStyle = "#7a848e"; g.lineWidth = 1.5; g.stroke();
    }
    g.restore();
  }
  casco(i, r) {
    if (!this.cascos[i]) this.cascos[i] = hacerCasco(r);
    return this.cascos[i];
  }
  /** Pinta un astronauta: mochila, avatar, collarín, panel y escafandra. */
  astronauta(g, e, q, t) {
    const R = avatar(q).rig, cc = q === "marcos" ? [37, 41] : [39, 33], rr = q === "marcos" ? 44 : 47;
    conMat(g, e.m, () => mochila(g, R));
    const k = this.casco(q || "g", rr);
    e.pose.objD = (gg) => {
      traje(gg, R);
      gg.save(); gg.translate(R.cuello[0], R.cuello[1]); gg.rotate(e.pose.rc || 0); gg.translate(-R.cuello[0], -R.cuello[1]);
      gg.drawImage(k.c, cc[0] - k.L / 2, cc[1] - k.L / 2, k.L, k.L);
      gg.restore();
    };
    pintarAvatar(g, e.m, e.pose, t);
  }
  bandera(g, B, t) {
    if (!B) return;
    const s = B.s;
    g.save();
    // mástil
    const gm = g.createLinearGradient(B.x - 4 * s, 0, B.x + 4 * s, 0);
    gm.addColorStop(0, "#8a949e"); gm.addColorStop(0.5, "#ffffff"); gm.addColorStop(1, "#7a848e");
    g.fillStyle = gm; g.fillRect(B.x - 4 * s, B.arriba, 8 * s, B.abajo - B.arriba);
    g.fillStyle = "#dfe5ec"; g.beginPath(); g.arc(B.x, B.arriba, 6 * s, 0, 6.283); g.fill();
    const k = B.plantado ? eBack(tramo(t, T_CLAVA + 0.12, T_CLAVA + 0.55)) : 0;
    if (k < 0.05) {
      // enrollada
      g.fillStyle = "#f4f4ee"; rectR(g, B.x - 9 * s, B.arriba + 10 * s, 18 * s, 130 * s, 8 * s); g.fill();
      g.strokeStyle = "rgba(0,0,0,.2)"; g.lineWidth = 1.5 * s;
      for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(B.x - 9 * s, B.arriba + (10 + i * 26) * s); g.lineTo(B.x + 9 * s, B.arriba + (18 + i * 26) * s); g.stroke(); }
      g.strokeStyle = "#d9b23a"; g.lineWidth = 3 * s; g.beginPath(); g.moveTo(B.x - 9 * s, B.arriba + 70 * s); g.lineTo(B.x + 9 * s, B.arriba + 70 * s); g.stroke();
    } else {
      const w = 190 * k, h = 128, x0 = B.x + 3, y0 = B.arriba + 8;
      g.fillStyle = "#c9d1da"; g.fillRect(x0, y0 - 3, w + 4, 6);
      g.beginPath(); g.moveTo(x0, y0);
      for (let i = 0; i <= 8; i++) g.lineTo(x0 + (w * i) / 8, y0 + 3 * Math.sin(t * 3 + i));
      for (let i = 8; i >= 0; i--) g.lineTo(x0 + (w * i) / 8, y0 + h + 5 * Math.sin(t * 3 + i * 0.9) * (i / 8));
      g.closePath();
      const gf = g.createLinearGradient(x0, 0, x0 + w, 0);
      gf.addColorStop(0, "#e9e9e2"); gf.addColorStop(0.5, "#ffffff"); gf.addColorStop(1, "#dcdcd2");
      g.fillStyle = gf; g.fill();
      g.strokeStyle = "#9a9a90"; g.lineWidth = 2; g.stroke();
      if (k > 0.6) {
        // jarra dibujada
        g.save(); g.globalAlpha = tramo(k, 0.6, 1); g.translate(x0 + w / 2 - 6, y0 + h / 2 + 4); g.scale(k, 1);
        g.fillStyle = "#ffc21f"; rectR(g, -28, -30, 50, 62, 6); g.fill();
        g.strokeStyle = "#7a4a00"; g.lineWidth = 4; g.stroke();
        g.beginPath(); g.arc(24, 2, 14, -1.3, 1.3); g.stroke();
        g.fillStyle = "#fffdf5"; g.beginPath();
        for (let i = 0; i < 4; i++) g.arc(-22 + i * 13, -32, 9, Math.PI, 0);
        g.lineTo(24, -26); g.lineTo(-30, -26); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = "rgba(255,255,255,.6)"; g.fillRect(-20, -18, 5, 40);
        g.restore();
      }
    }
    g.restore();
  }

  dibujar(g) {
    const t = this.t;
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    // estrellas que titilan
    for (const [x, y, r, f] of this.estrellas) brillo(g, x, y, r, 0.35 + 0.35 * Math.sin(t * 3 + f));
    this.modulo(g, t);
    const eM = this.poseM(), eG = this.poseG();
    const B = this.mastil(eG);
    // cuando van pequeños (en la puerta), detrás de la rampa nada; se pintan delante del módulo
    if (eG && t >= T_SUBE) this.bandera(g, B, t);
    if (eM) this.astronauta(g, eM, "marcos", t);
    if (eG && t < T_SUBE) this.bandera(g, B, t);
    if (eG) this.astronauta(g, eG, null, t);
    // montoncito de espuma al pie del mástil
    if (B && B.plantado) {
      g.fillStyle = "#fffdf2";
      g.beginPath();
      for (let i = 0; i < 5; i++) g.arc(B.x - 26 + i * 13, SUELO + 6 - (i % 2) * 3, 9 + (i % 2) * 3, Math.PI, 0);
      g.closePath(); g.fill();
    }
    this.p.dibujar(g);
    // burbujas
    g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = 2;
    for (const b of this.burb) { g.beginPath(); g.arc(b.x, b.y, b.r, 0, 6.283); g.stroke(); g.fillStyle = "rgba(255,255,255,.6)"; g.beginPath(); g.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.25, 0, 6.283); g.fill(); }
    // ¡CHOF!
    if (t > T_CLAVA && t < T_CLAVA + 0.8 && this.xMastil != null) {
      const k = tramo(t, T_CLAVA, T_CLAVA + 0.15), a = 1 - tramo(t, T_CLAVA + 0.55, T_CLAVA + 0.8);
      txt(g, "¡CHOF!", this.xMastil + 120, 520, { tam: 64 * eBack(k), peso: 400, fam: FC, color: "#ffffff", borde: "#1a3a5a", bordeAncho: 8, alfa: a, esp: 2 });
    }
    // ¡ALUNIZAJE!
    if (t > T_TXT) {
      const d = t - T_TXT, k = tramo(d, 0, 0.2), s = lerp(2.4, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 6));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 96 + 5 * Math.sin(d * 2)); g.rotate(-0.035); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // entrada (fundido) y salida (iris sobre la bandera)
    const a = 1 - tramo(t, 0.02, 0.5);
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
    const r = 760 * (1 - eInOut(tramo(t, 9.15, this.dur - 0.05)));
    if (r < 760) {
      const cx = this.xMastil != null ? this.xMastil + 40 : 512;
      g.save(); g.fillStyle = "#000"; g.beginPath(); g.rect(-60, -60, W + 120, H + 120);
      g.moveTo(cx + Math.max(0, r), 330); g.arc(cx, 330, Math.max(0, r), 0, 6.2832); g.fill("evenodd"); g.restore();
    }
  }
}

registrar({ id: "00187", nombre: "Astronautas", crear: () => new Astronautas() });
})();
