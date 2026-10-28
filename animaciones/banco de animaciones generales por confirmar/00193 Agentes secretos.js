"use strict";
/*
 * 00193 · AGENTES SECRETOS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Sobre negro se escribe a máquina «MISIÓN: CAÑA». Un pasillo lleno de rayos de alarma rojos: Marcos (gafas de sol,
 * corbata y pinganillo) lo cruza con estilo (salta un rayo bajo, pasa agachado bajo dos rayos y de lado bajo uno
 * inclinado); Guillermo detrás, más torpe, casi roza uno. Marcos abre la caja fuerte (clic, clic) y dentro brilla una
 * caña: sello «MISIÓN: CAÑA ¡CUMPLIDA!». Guillermo lo celebra levantando el brazo… y toca un rayo: ¡salta la
 * alarma! Luces rojas, caras de susto y se cierra un iris.
 */
(() => {
const cache = cacheTexto();
const ESC = 1.4, TECHO = 120;
// rayos (segmentos en pantalla)
const RAYOS = [
  [[196, 516], [284, 516]],                   // bajo: saltarlo
  [[352, 296], [462, 296]], [[352, 372], [462, 372]],  // altos: pasar agachado
  [[478, 186], [628, 432]],                   // inclinado: pasar de lado
];
const VX = 905, VY = 372;                      // caja fuerte
const T_TXT_FIN = 1.15, T_M = 1.55, T_G = 2.35, T_DIAL = 5.55, T_ABRE = 6.45, T_COGE = 6.95, T_SELLO = 7.3, T_ALARMA = 8.15;

function titulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(900, 170), g = c.getContext("2d");
  txt(g, "MISIÓN: CAÑA", 450, 128, { tam: 128, peso: 900, fam: FD, color: "#e9fff0", esp: 6, glow: "rgba(43,255,91,.6)", glowTam: 20 });
  cache.set("t", c);
  return c;
}
function sello() {
  if (cache.has("s")) return cache.get("s");
  const c = lienzoNuevo(760, 300), g = c.getContext("2d");
  g.translate(380, 150);
  g.strokeStyle = "#ff2a3a"; g.lineWidth = 12; rectR(g, -350, -130, 700, 260, 26); g.stroke();
  g.lineWidth = 4; rectR(g, -332, -112, 664, 224, 18); g.stroke();
  txt(g, "MISIÓN: CAÑA", 0, 10, { tam: 118, peso: 900, fam: FD, color: "#ff2a3a", esp: 5 });
  txt(g, "¡CUMPLIDA!", 0, 92, { tam: 62, peso: 400, fam: FC, color: "#ff2a3a", esp: 4 });
  // textura de tinta
  g.globalCompositeOperation = "destination-out";
  const r = semilla(6);
  for (let i = 0; i < 260; i++) { g.globalAlpha = 0.3 + r() * 0.5; g.beginPath(); g.arc(-350 + r() * 700, -130 + r() * 260, 1 + r() * 3.5, 0, 6.283); g.fill(); }
  cache.set("s", c);
  return c;
}
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

/** Corbata, cuello blanco y pinganillo (coordenadas de avatar). */
function traje(g, R, rc) {
  const cx = R.cuello[0], cy = R.cuello[1];
  g.fillStyle = "#f4f6fa";
  g.beginPath(); g.moveTo(cx - 13, cy - 1); g.lineTo(cx + 13, cy - 1); g.lineTo(cx, cy + 20); g.closePath(); g.fill();
  g.fillStyle = "#0c0c10";
  g.beginPath(); g.moveTo(cx - 4.5, cy + 3); g.lineTo(cx + 4.5, cy + 3); g.lineTo(cx + 3, cy + 9); g.lineTo(cx - 3, cy + 9); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(cx - 3, cy + 9); g.lineTo(cx + 3, cy + 9); g.lineTo(cx + 6, cy + 52); g.lineTo(cx, cy + 60); g.lineTo(cx - 6, cy + 52); g.closePath(); g.fill();
  g.strokeStyle = "rgba(255,255,255,.25)"; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - 1, cy + 12); g.lineTo(cx - 3, cy + 50); g.stroke();
  // pinganillo con cable rizado
  g.save(); g.translate(cx, cy); g.rotate(rc); g.translate(-cx, -cy);
  const ox = R === avatar().rig ? 11 : 9, oy = R === avatar().rig ? 46 : 53;
  g.fillStyle = "#1a1a1e"; g.beginPath(); g.ellipse(ox, oy, 3, 4, 0, 0, 6.283); g.fill();
  g.restore();
  g.strokeStyle = "#cfd6e0"; g.lineWidth = 1.2;
  const ox2 = R === avatar().rig ? 11 : 9, oy2 = R === avatar().rig ? 50 : 57;
  g.beginPath(); g.moveTo(ox2, oy2);
  for (let i = 0; i <= 14; i++) { const u = i / 14; g.lineTo(lerp(ox2, cx - 16, u) + Math.sin(i * 2.4) * 2.5, lerp(oy2, cy + 8, u)); }
  g.stroke();
}
function cana(g, x, y, s, t) {
  // caña de cerveza: vaso alto (0,0) = base
  g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.moveTo(-14, 0); g.lineTo(-18, -66); g.lineTo(18, -66); g.lineTo(14, 0); g.closePath();
  g.fillStyle = "rgba(210,235,255,.25)"; g.fill();
  g.save(); g.clip();
  const gr = g.createLinearGradient(0, 0, 0, -60);
  gr.addColorStop(0, "#c46a00"); gr.addColorStop(1, "#ffc21f");
  g.fillStyle = gr; g.fillRect(-20, -56, 40, 56);
  g.fillStyle = "rgba(255,245,200,.7)";
  for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(-8 + ((i * 7) % 16), -6 - ((t * 30 + i * 9) % 46), 1.2, 0, 6.283); g.fill(); }
  g.restore();
  g.fillStyle = "#fffaf0"; g.beginPath(); g.moveTo(-19, -56);
  for (let i = 0; i <= 4; i++) g.arc(-18 + i * 9, -62, 6 + (i % 2) * 1.5, Math.PI, 0);
  g.lineTo(19, -56); g.closePath(); g.fill();
  g.strokeStyle = "rgba(235,245,255,.9)"; g.lineWidth = 2; g.beginPath(); g.moveTo(-14, 0); g.lineTo(-18, -66); g.moveTo(14, 0); g.lineTo(18, -66); g.moveTo(-14, 0); g.lineTo(14, 0); g.stroke();
  g.fillStyle = "rgba(255,255,255,.5)"; g.fillRect(-12, -50, 3, 44);
  g.restore();
}

class AgentesSecretos extends Escena {
  constructor() {
    super(10.2);
    this.p = new Parts(320);
    this.fondoC = null; this.gotas = [];
  }
  /** Recorrido de un agente: x, sy (agacharse), giro (inclinarse), salto (px), modo. d = 0 para Marcos, más para Guillermo. */
  recorrido(t0, torpe) {
    const t = this.t - t0;
    const k = torpe ? 1.18 : 1;
    const T = (a) => a * k;
    let x, sy = 1, giro = 0, sal = 0, modo = "anda";
    if (t < 0) return null;
    if (t < T(0.55)) { x = lerp(-110, 150, t / T(0.55)); }
    else if (t < T(1.05)) { const u = (t - T(0.55)) / T(0.5); x = lerp(150, 318, u); sal = 150 * Math.sin(u * Math.PI); modo = "salta"; }
    else if (t < T(1.2)) { x = 318 + 10 * (t - T(1.05)) / T(0.15); sy = lerp(1, 0.55, (t - T(1.05)) / T(0.15)); modo = "agacha"; }
    else if (t < T(1.85)) { const u = (t - T(1.2)) / T(0.65); x = lerp(328, 478, u); sy = 0.55; modo = "agacha"; }
    else if (t < T(2.0)) { const u = (t - T(1.85)) / T(0.15); x = 478; sy = lerp(0.55, 1, u); giro = -0.5 * u; modo = "ladea"; }
    else if (t < T(2.75)) { const u = (t - T(2.0)) / T(0.75); x = lerp(478, 650, u); giro = -0.5; modo = "ladea"; }
    else if (t < T(2.95)) { const u = (t - T(2.75)) / T(0.2); x = 650 + 10 * u; giro = -0.5 * (1 - u); modo = "anda"; }
    else { const u = clamp((t - T(2.95)) / T(0.4), 0, 1); x = lerp(660, torpe ? 690 : 800, eOut(u)); modo = u < 1 ? "anda" : "quieto"; }
    // Guillermo casi toca el rayo inclinado: se queda congelado tambaleándose
    if (torpe && t > T(2.25) && t < T(2.25) + 0.45) { modo = "congela"; }
    return { x, sy, giro, sal, modo, tl: t };
  }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, gafas: true, piernaI: [0, 0], piernaD: [0, 0], manoD: [78, 118], manoI: [0, 118] };
    const M = { quien: "marcos", cara: "guino", rc: 0, gafas: true, piernaI: [0, 0], piernaD: [0, 0], manoD: [74, 118], manoI: [0, 118] };
    const out = {};
    for (const [P_, t0, torpe, q] of [[M, T_M, false, "marcos"], [G, T_G, true, null]]) {
      let r = this.recorrido(t0, torpe);
      if (!r) { out[q ? "M" : "G"] = null; continue; }
      // congelado: el tiempo de su recorrido se para
      if (torpe && r.modo === "congela") {
        r = Object.assign({}, r);
        P_.cara = "sorpresa"; P_.puntas = 0.5;
        P_.piernaD = [-12, 0.35]; P_.manoI = [-28 + 8 * Math.sin(t * 22), 70]; P_.manoD = [92, 96 + 8 * Math.sin(t * 22 + 1)];
        r.giro = -0.5 + 0.08 * Math.sin(t * 18);
      }
      const fase = t * 11;
      if (r.modo === "anda") { const a = andar(fase, 0.9); P_.piernaI = a.piernaI; P_.piernaD = a.piernaD; P_.manoD = [80 + 6 * Math.sin(fase), 112]; P_.manoI = [-2 - 6 * Math.sin(fase), 112]; }
      if (r.modo === "salta") { const u = clamp((r.tl - (torpe ? 0.65 : 0.55)) / (torpe ? 0.59 : 0.5), 0, 1); P_.piernaI = [-16 * Math.sin(u * Math.PI), 0.35]; P_.piernaD = [-16 * Math.sin(u * Math.PI), -0.35]; P_.manoD = q ? [76, 40] : [88, 40]; P_.manoI = q ? [-2, 40] : [-10, 40]; P_.cara = torpe ? "sorpresa" : "guino"; }
      if (r.modo === "agacha") { const a = andar(fase * 0.8, 0.5); P_.piernaI = a.piernaI; P_.piernaD = a.piernaD; P_.manoD = q ? [74, 150] : [84, 156]; P_.manoI = q ? [0, 150] : [-6, 156]; P_.cara = torpe ? "dormido" : "guino"; }
      if (r.modo === "ladea") { const a = andar(fase * 0.8, 0.6); P_.piernaI = a.piernaI; P_.piernaD = a.piernaD; P_.manoD = q ? [70, 150] : [78, 156]; P_.manoI = q ? [-6, 100] : [-14, 100]; P_.cara = torpe ? "sorpresa" : "sonrisa"; P_.rc = 0.15; }
      if (r.modo === "quieto") { P_.cara = torpe ? "sonrisa" : "guino"; }
      const y = PIES - r.sal;
      out[q ? "M" : "G"] = { pose: P_, m: matAv(r.x, y, ESC, r.giro, r.sy < 1 ? 1.1 : 1, r.sy), r };
    }
    // Marcos abre la caja fuerte; los dos ven la caña
    const eM = out.M, eG = out.G;
    if (eM && t > T_DIAL - 0.25) {
      const k = eInOut(tramo(t, T_DIAL - 0.25, T_DIAL)), kS = eInOut(tramo(t, T_ABRE - 0.15, T_ABRE + 0.05));
      const dial = enAv(eM.m, [VX - 34, VY]);
      M.manoD = mezcla(mezcla([74, 118], dial, k), [74, 118], kS);
      M.cara = "dormido"; M.rc = 0.1;
      M.manoD = [M.manoD[0] + (k > 0.9 && kS < 0.1 ? 1.5 * Math.sin(t * 30) : 0), M.manoD[1]];
    }
    if (t > T_ABRE) { M.cara = "sorpresa"; M.rc = 0.15; if (eG) { G.cara = "sorpresa"; G.rc = 0.15; } }
    if (t > T_ABRE + 0.35) { M.cara = "risa"; G.cara = "risa"; }
    // Marcos coge la caña y la levanta
    if (eM && t > T_COGE) {
      const k = eInOut(tramo(t, T_COGE, T_COGE + 0.3)), kS = eInOut(tramo(t, T_COGE + 0.35, T_COGE + 0.6));
      M.manoD = mezcla(mezcla([74, 118], enAv(eM.m, [VX + 4, VY + 40]), k), [70, 40], kS);
      M.cara = kS > 0.5 ? "risa" : "sorpresa"; M.rc = kS > 0.5 ? -0.08 : 0.12;
      M.objD2 = (g, mano) => cana(g, mano[0] + 2, mano[1] + 16, 0.72, t);
    }
    // Guillermo lo celebra… y toca el rayo inclinado con la mano
    if (eG && t > T_SELLO + 0.25) {
      const k = eOut(tramo(t, T_SELLO + 0.25, T_ALARMA));
      G.manoI = mezcla([0, 118], [-34, 18], k); G.brazoIDelante = false;
      G.manoD = mezcla([78, 118], [86, 56], k);
      G.cara = "risa";
    }
    if (t > T_ALARMA) {
      for (const P_ of [G, M]) { P_.cara = "sorpresa"; P_.puntas = 1; }
      G.rc = -0.18; M.rc = -0.12;
    }
    // trajes
    const RG = avatar().rig, RM = avatar("marcos").rig;
    G.objD = (g) => traje(g, RG, G.rc);
    M.objD = (g) => traje(g, RM, M.rc);
    return out;
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // gotas de sudor de Guillermo al congelarse
    const e = this.poses();
    if (e.G && e.G.r.modo === "congela" && Math.random() < 14 * dt) { const q = aPant(e.G.m, [60, 10]); this.gotas.push({ x: q[0], y: q[1], vx: azar(40, 160), vy: azar(-200, -80), v: 0.6 }); }
    for (const d of this.gotas) { d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.v -= dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    for (const k of [0, 1, 2]) this.una("clic" + k, t > T_DIAL + 0.2 + k * 0.25, () => temblar(3, 0.08));
    this.una("abre", t > T_ABRE, () => {
      temblar(10, 0.3);
      p.nueva(P.DESTELLO, VX, VY, 0, 0, 0.45, 300);
      for (let i = 0; i < 30; i++) { const a = azar(0, 6.283), v = azar(120, 380); p.nueva(P.PURPURINA, VX, VY, Math.cos(a) * v, Math.sin(a) * v, azar(0.8, 1.4), azar(10, 16)); }
    });
    this.una("sello", t > T_SELLO, () => { temblar(14, 0.3); for (let i = 0; i < 18; i++) p.nueva(P.POLVO, azar(250, 780), azar(160, 330), azar(-80, 80), azar(-40, 40), azar(0.5, 0.9), azar(20, 34)); });
    this.una("alarma", t > T_ALARMA, () => {
      temblar(16, 0.5);
      const q = [612, 405];
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.35, 180);
      for (let i = 0; i < 26; i++) { const a = azar(0, 6.283), v = azar(120, 380); p.nueva(P.CHISPA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 10)); }
    });
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gw = g.createLinearGradient(0, TECHO, 0, 470);
    gw.addColorStop(0, "#1c2533"); gw.addColorStop(1, "#2a3546");
    g.fillStyle = "#0e131b"; g.fillRect(-60, -60, W + 120, H + 120);
    g.fillStyle = gw; g.fillRect(-60, TECHO, W + 120, 470 - TECHO);
    // paneles de la pared
    g.strokeStyle = "rgba(0,0,0,.45)"; g.lineWidth = 3;
    for (let x = -20; x < W + 60; x += 120) { g.beginPath(); g.moveTo(x, TECHO); g.lineTo(x, 470); g.stroke(); }
    g.strokeStyle = "rgba(255,255,255,.05)"; g.lineWidth = 2;
    for (let x = -18; x < W + 60; x += 120) { g.beginPath(); g.moveTo(x, TECHO); g.lineTo(x, 470); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,.04)"; g.fillRect(-60, 300, W + 120, 6);
    // techo con luces
    g.fillStyle = "#151b25"; g.fillRect(-60, -60, W + 120, TECHO + 60);
    g.fillStyle = "#0a0e14"; g.fillRect(-60, TECHO - 8, W + 120, 10);
    for (let x = 40; x < W; x += 230) {
      g.fillStyle = "#cfe6ff"; rectR(g, x, TECHO - 28, 120, 10, 4); g.fill();
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.25; g.drawImage(BLOB2.cian, x - 40, TECHO - 40, 200, 140); g.restore();
    }
    // suelo brillante
    const gs = g.createLinearGradient(0, 470, 0, H + 60);
    gs.addColorStop(0, "#3a4658"); gs.addColorStop(1, "#141a24");
    g.fillStyle = gs; g.fillRect(-60, 470, W + 120, H);
    g.strokeStyle = "rgba(255,255,255,.07)"; g.lineWidth = 2;
    for (let i = -10; i < 20; i++) { g.beginPath(); g.moveTo(i * 90, 470); g.lineTo(i * 90 - 120, H + 60); g.stroke(); }
    for (const y of [500, 540, 590]) { g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke(); }
    // caja fuerte: marco
    g.fillStyle = "#3a434f"; g.beginPath(); g.arc(VX, VY, 150, 0, 6.283); g.fill();
    g.fillStyle = "#0a0d12"; g.beginPath(); g.arc(VX, VY, 128, 0, 6.283); g.fill();
    for (let i = 0; i < 16; i++) { const a = (i / 16) * 6.283; g.fillStyle = "#6a7480"; g.beginPath(); g.arc(VX + Math.cos(a) * 140, VY + Math.sin(a) * 140, 4, 0, 6.283); g.fill(); }
    // emisores de los rayos
    for (const [[x0, y0], [x1, y1]] of RAYOS) {
      for (const [x, y] of [[x0, y0], [x1, y1]]) { g.fillStyle = "#0a0d12"; rectR(g, x - 9, y - 9, 18, 18, 4); g.fill(); g.strokeStyle = "#5a6470"; g.lineWidth = 2; g.stroke(); }
    }
    // postes de los emisores
    g.fillStyle = "#4a5462";
    g.fillRect(193, 516, 6, 59); g.fillRect(281, 516, 6, 59);
    g.fillRect(349, TECHO, 6, 252); g.fillRect(459, TECHO, 6, 252);
    g.fillRect(475, TECHO, 6, 66); g.fillRect(625, 432, 6, 143);
    this.fondoC = c;
    return c;
  }
  puerta(g, t) {
    // puerta redonda de acero que se abre hacia nosotros (se estrecha y se va a la derecha)
    const k = eInOut(tramo(t, T_ABRE, T_ABRE + 0.5));
    // interior: pedestal con la caña
    if (k > 0) {
      g.save(); g.beginPath(); g.arc(VX, VY, 128, 0, 6.283); g.clip();
      g.fillStyle = "#2a2014"; g.fillRect(VX - 130, VY - 130, 260, 260);
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.7 * k * (0.85 + 0.15 * Math.sin(t * 6)); g.drawImage(BLOB2.oro, VX - 120, VY - 140, 240, 240); g.restore();
      g.fillStyle = "#7a1830"; rectR(g, VX - 40, VY + 46, 80, 70, 6); g.fill();
      g.fillStyle = "#b02848"; rectR(g, VX - 46, VY + 40, 92, 12, 4); g.fill();
      if (t < T_COGE + 0.15) cana(g, VX + 2, VY + 42, 1.05, t);
      g.restore();
    }
    g.save(); g.translate(VX + 128 * k * 0.9, VY); g.scale(1 - 0.8 * k, 1);
    const gr = g.createRadialGradient(-30, -40, 10, 0, 0, 130);
    gr.addColorStop(0, "#d8dee6"); gr.addColorStop(0.7, "#8a949e"); gr.addColorStop(1, "#5a646e");
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 124, 0, 6.283); g.fill();
    g.strokeStyle = "#3a434f"; g.lineWidth = 5; g.stroke();
    g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 96, 0, 6.283); g.stroke();
    // rueda y dial
    const giro = t > T_DIAL ? Math.sin((t - T_DIAL) * 9) * 2.4 * (1 - tramo(t, T_ABRE - 0.3, T_ABRE)) : 0;
    g.save(); g.translate(-34, 0); g.rotate(giro);
    g.fillStyle = "#2a3038"; g.beginPath(); g.arc(0, 0, 30, 0, 6.283); g.fill();
    g.fillStyle = "#c9d1da"; g.beginPath(); g.arc(0, 0, 24, 0, 6.283); g.fill();
    g.strokeStyle = "#2a3038"; g.lineWidth = 2;
    for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; g.beginPath(); g.moveTo(Math.cos(a) * 18, Math.sin(a) * 18); g.lineTo(Math.cos(a) * 23, Math.sin(a) * 23); g.stroke(); }
    g.fillStyle = "#ff3a3a"; g.beginPath(); g.moveTo(0, -24); g.lineTo(-3, -16); g.lineTo(3, -16); g.closePath(); g.fill();
    g.restore();
    g.strokeStyle = "#c9d1da"; g.lineWidth = 7; g.lineCap = "round";
    const w2 = (t > T_ABRE - 0.3 ? (t - T_ABRE + 0.3) * 4 : 0);
    for (let i = 0; i < 3; i++) { const a = w2 + (i / 3) * 6.283; g.beginPath(); g.moveTo(46, 0); g.lineTo(46 + Math.cos(a) * 34, Math.sin(a) * 34); g.stroke(); }
    g.fillStyle = "#c9d1da"; g.beginPath(); g.arc(46, 0, 9, 0, 6.283); g.fill();
    g.restore();
  }
  rayos(g, t, alarma) {
    g.save(); g.globalCompositeOperation = "lighter"; g.lineCap = "round";
    const fl = 0.85 + 0.15 * Math.sin(t * 40);
    for (const [[x0, y0], [x1, y1]] of RAYOS) {
      g.strokeStyle = `rgba(255,40,40,${0.22 * fl})`; g.lineWidth = 14; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      g.strokeStyle = `rgba(255,90,90,${0.9 * fl})`; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      g.strokeStyle = `rgba(255,230,230,${0.8 * fl})`; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    }
    g.restore();
    // LEDs de los emisores
    for (const [[x0, y0], [x1, y1]] of RAYOS) for (const [x, y] of [[x0, y0], [x1, y1]]) { g.fillStyle = alarma && Math.sin(t * 20) > 0 ? "#ffffff" : "#ff3a3a"; g.beginPath(); g.arc(x, y, 3.5, 0, 6.283); g.fill(); }
  }
  dibujar(g) {
    const t = this.t, e = this.poses();
    fondo(g, "#000");
    if (t > 0.9) {
      g.drawImage(this.fondo(), -60, -60);
      this.puerta(g, t);
      // reflejo de los rayos en el suelo
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.25; g.drawImage(BLOB.rojo, 150, 470, 500, 90); g.restore();
      if (e.M) pintarAvatar(g, e.M.m, e.M.pose, t);
      if (e.G) pintarAvatar(g, e.G.m, e.G.pose, t);
      this.rayos(g, t, t > T_ALARMA);
      g.fillStyle = "#8fd8ff";
      for (const d of this.gotas) { g.beginPath(); g.ellipse(d.x, d.y, 3.5, 5, 0, 0, 6.283); g.fill(); }
      this.p.dibujar(g);
      // clic, clic
      for (let k = 0; k < 3; k++) {
        const tk = T_DIAL + 0.2 + k * 0.25;
        if (t > tk && t < tk + 0.35) txt(g, "CLIC", VX - 60 + k * 50, VY - 165 - k * 22, { tam: 46, peso: 400, fam: FC, color: "#ffffff", borde: "#0a0d12", bordeAncho: 6, alfa: 1 - tramo(t, tk + 0.2, tk + 0.35) });
      }
      // ¡ALARMA!: luz giratoria y destellos rojos
      if (t > T_ALARMA) {
        const a = 0.28 + 0.22 * Math.sin((t - T_ALARMA) * 16);
        g.fillStyle = `rgba(255,0,20,${a})`; g.fillRect(-60, -60, W + 120, H + 120);
        const ang = (t - T_ALARMA) * 9;
        g.save(); g.translate(512, TECHO - 4);
        g.fillStyle = "#5a0a10"; rectR(g, -22, -10, 44, 16, 4); g.fill();
        g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5;
        g.fillStyle = "rgba(255,60,60,.5)";
        for (const s of [0, Math.PI]) { const aa = ang + s; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(aa - 0.25) * 700, Math.abs(Math.sin(aa - 0.25)) * 500 + 40); g.lineTo(Math.cos(aa + 0.25) * 700, Math.abs(Math.sin(aa + 0.25)) * 500 + 40); g.closePath(); g.fill(); }
        g.globalAlpha = 1; g.drawImage(BLOB.rojo, -40, -36, 80, 70);
        g.restore();
        const k = tramo(t, T_ALARMA, T_ALARMA + 0.15);
        txt(g, "¡IIIUUU!", 190, 420, { tam: 64 * eBack(k), peso: 400, fam: FC, color: "#ffffff", borde: "#5a0010", bordeAncho: 8, esp: 2, alfa: 0.6 + 0.4 * Math.sin(t * 16) });
      }
      // sello
      if (t > T_SELLO) {
        const k = tramo(t, T_SELLO, T_SELLO + 0.14), s = lerp(2.6, 1, eIn(k));
        const spr = sello();
        g.save(); g.globalAlpha = Math.min(1, k * 2.5); g.translate(420, 136); g.rotate(-0.12); g.scale(s * 0.72, s * 0.72);
        g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
      }
    }
    // título a máquina sobre negro; luego se abre la escena y el título sube y se va
    if (t < 1.9) {
      const b = t < 0.9 ? 0 : 1 - tramo(t, 1.1, 1.6);
      if (b > 0) { g.save(); g.globalAlpha = b; g.fillStyle = "#000"; g.fillRect(-60, -60, W + 120, H + 120); g.restore(); }
      const n = Math.floor(clamp((t - 0.12) / (T_TXT_FIN - 0.12), 0, 1) * 12);
      const a = 1 - tramo(t, 1.45, 1.85);
      if (n > 0 && a > 0) {
        g.save(); g.globalAlpha = a;
        txt(g, "MISIÓN: CAÑA".slice(0, n) + (Math.sin(t * 18) > 0 && t < 1.4 ? "_" : ""), 512, 340 - 60 * eInOut(tramo(t, 1.2, 1.8)), { tam: 116, peso: 900, fam: FD, color: "#e9fff0", esp: 6, glow: "rgba(43,255,91,.6)", glowTam: 18 });
        g.restore();
      }
    }
    void titulo;
    // iris de salida sobre los dos
    const r = 760 * (1 - eInOut(tramo(t, 9.5, this.dur - 0.05)));
    if (r < 760) {
      const cx = 700, cy = 380;
      g.save(); g.fillStyle = "#000"; g.beginPath(); g.rect(-60, -60, W + 120, H + 120);
      g.moveTo(cx + Math.max(0, r), cy); g.arc(cx, cy, Math.max(0, r), 0, 6.2832); g.fill("evenodd"); g.restore();
    }
  }
}

registrar({ id: "00193", nombre: "Agentes secretos", crear: () => new AgentesSecretos() });
})();
