"use strict";
/*
 * 00206 · CASTILLO DE ARENA
 *
 * Animación del banco. Empieza y acaba en negro.
 * En la orilla, cada uno con su cubo y su pala. Guillermo levanta a toda prisa un castillo enorme con torres y
 * bandera, y presume ante Marcos, que a lo suyo va haciendo algo bajito y raro. Llega una ola y se traga el castillo
 * de Guillermo (¡CHOF!), que se queda empapado con la pala en la mano. Al retirarse el agua, el de Marcos sigue en pie:
 * es un bar de arena con su barra, su grifo, sus taburetes y dos jarritas de arena. Marcos, orgulloso: ¡MI CASTILLO!
 */
(() => {
const cache = cacheTexto();
const DUR = 10.8, ESC = 1.25, XG = 135, XM = 912, HORIZ = 250, ORILLA = 330, SUELO = 470;
const CG = 358, CM = 694;                 // centro de cada castillo
const T_OLA = 5.5, T_CHOF = 6.15, T_RETIRA = 7.0;
const PASOS_G = [0.9, 1.5, 2.1, 2.7, 3.3], PASOS_M = [1.1, 1.9, 2.7, 3.5];

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(800, 210), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 170);
  gr.addColorStop(0, "#fff7d8"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#e08a1a");
  g.save(); g.translate(400, 105);
  txt(g, "¡MI CASTILLO!", 7, 62, { tam: 128, peso: 400, fam: FB, color: "#4a2a00", esp: 4, max: 760 });
  txt(g, "¡MI CASTILLO!", 0, 55, { tam: 128, peso: 400, fam: FB, color: gr, borde: "#4a2a00", bordeAncho: 11, esp: 4, glow: "rgba(255,190,60,.9)", glowTam: 26, max: 760 });
  g.restore();
  cache.set("t", c);
  return c;
}
const ARENA = ["#f2d08a", "#d8a85a", "#b8863e"];
function gradArena(g, y0, y1) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, ARENA[0]); gr.addColorStop(1, ARENA[2]); return gr; }
/** Torre de arena (base en y, centro x). */
function torre(g, x, y, w, h) {
  g.fillStyle = gradArena(g, y - h, y);
  g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x - w / 2 + 3, y - h); g.lineTo(x + w / 2 - 3, y - h); g.lineTo(x + w / 2, y); g.closePath(); g.fill();
  // almenas
  const n = 3, aw = (w - 6) / (2 * n - 1);
  for (let i = 0; i < n; i++) g.fillRect(x - w / 2 + 3 + i * 2 * aw, y - h - 9, aw, 10);
  g.fillStyle = "rgba(90,60,20,.3)"; g.fillRect(x - 4, y - h * 0.55, 8, 12);
  g.strokeStyle = "rgba(255,255,255,.25)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x - w / 2 + 6, y - 4); g.lineTo(x - w / 2 + 8, y - h + 4); g.stroke();
}
/** Castillo de Guillermo; `k` 0–1 cuánto está construido, `fundido` 0–1 lo deshace la ola. */
function castilloG(g, k, fundido, t) {
  const x = CG, y = SUELO;
  g.save();
  if (fundido > 0) { g.translate(x, y); g.scale(1 + 0.4 * fundido, 1 - 0.85 * fundido); g.translate(-x, -y); }
  const piezas = [
    () => { g.fillStyle = gradArena(g, y - 40, y); g.beginPath(); g.ellipse(x, y, 140, 16, 0, Math.PI, 0); g.fill(); g.fillRect(x - 120, y - 40, 240, 40); },
    () => { torre(g, x - 92, y - 38, 46, 70); torre(g, x + 92, y - 38, 46, 70); },
    () => { g.fillStyle = gradArena(g, y - 110, y - 40); g.fillRect(x - 66, y - 108, 132, 70); g.fillStyle = "rgba(90,60,20,.45)"; g.beginPath(); g.moveTo(x - 16, y - 38); g.lineTo(x - 16, y - 64); g.arc(x, y - 64, 16, Math.PI, 0); g.lineTo(x + 16, y - 38); g.fill(); },
    () => { torre(g, x, y - 106, 58, 74); },
    () => { g.strokeStyle = "#5a3a1e"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y - 188); g.lineTo(x, y - 240); g.stroke(); g.fillStyle = "#e8283a"; g.beginPath(); g.moveTo(x, y - 240); g.lineTo(x + 34, y - 230 + 4 * Math.sin(t * 8)); g.lineTo(x, y - 220); g.fill(); },
  ];
  const n = Math.floor(k * piezas.length + 1e-6);
  for (let i = 0; i < Math.min(n, piezas.length); i++) {
    const kk = eBack(tramo(k * piezas.length - i, 0, 0.6));
    g.save(); g.translate(x, y); g.scale(1, Math.max(0.01, kk)); g.translate(-x, -y); piezas[i](); g.restore();
  }
  g.restore();
}
/** Bar de arena de Marcos; `k` 0–1 construido, `brillo` 0–1 al final. */
function barArena(g, k, t, mojado) {
  const x = CM, y = SUELO;
  g.save(); g.translate(x, y); g.scale(1.28, 1.28); g.translate(-x, -y);
  const piezas = [
    // la barra
    () => {
      g.fillStyle = gradArena(g, y - 60, y); g.beginPath(); g.moveTo(x - 92, y); g.lineTo(x - 88, y - 56); g.lineTo(x + 88, y - 56); g.lineTo(x + 92, y); g.closePath(); g.fill();
      g.fillStyle = ARENA[0]; g.fillRect(x - 100, y - 66, 200, 12);
      g.strokeStyle = "rgba(90,60,20,.35)"; g.lineWidth = 2; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(x + i * 24, y - 52); g.lineTo(x + i * 24, y - 4); g.stroke(); }
    },
    // taburetes
    () => { for (const dx of [-122, 122]) { g.fillStyle = gradArena(g, y - 40, y); g.fillRect(x + dx - 5, y - 34, 10, 34); g.beginPath(); g.ellipse(x + dx, y - 36, 18, 6, 0, 0, 6.283); g.fill(); } },
    // grifo de arena con conchita
    () => {
      g.fillStyle = gradArena(g, y - 120, y - 66); g.fillRect(x - 10, y - 116, 14, 50); g.fillRect(x - 10, y - 116, 34, 12); g.fillRect(x + 16, y - 108, 8, 14);
      g.fillStyle = "#ff9ab8"; g.beginPath(); g.arc(x - 3, y - 124, 9, Math.PI, 0); g.fill();
      g.strokeStyle = "#e05a8a"; g.lineWidth = 1.2; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(x - 3, y - 124); g.lineTo(x - 3 + i * 4, y - 132); g.stroke(); }
    },
    // dos jarritas de arena
    () => {
      for (const dx of [-62, 54]) {
        g.fillStyle = gradArena(g, y - 100, y - 66); rectR(g, x + dx, y - 98, 22, 32, 3); g.fill();
        g.strokeStyle = ARENA[1]; g.lineWidth = 4; g.beginPath(); g.arc(x + dx + 24, y - 82, 7, -Math.PI / 2, Math.PI / 2); g.stroke();
        g.fillStyle = "#fffaf0"; g.beginPath(); for (let i = 0; i <= 3; i++) g.arc(x + dx + 2 + i * 6, y - 98, 4.4, Math.PI, 0); g.fill();
      }
    },
    // cartel de conchas «BAR»
    () => {
      g.fillStyle = gradArena(g, y - 200, y - 140); g.fillRect(x + 70, y - 66, 8, -110); rectR(g, x + 40, y - 214, 80, 46, 6); g.fill();
      txt(g, "BAR", x + 80, y - 178, { tam: 30, peso: 900, fam: FD, color: "#8a5a2a", esp: 2 });
      g.fillStyle = "#ff9ab8"; for (const [sx, sy] of [[x + 48, y - 208], [x + 112, y - 208], [x + 48, y - 174], [x + 112, y - 174]]) { g.beginPath(); g.arc(sx, sy, 4, 0, 6.283); g.fill(); }
    },
  ];
  const n = Math.floor(k * piezas.length + 1e-6);
  for (let i = 0; i < Math.min(n, piezas.length); i++) {
    const kk = eBack(tramo(k * piezas.length - i, 0, 0.6));
    g.save(); g.translate(x, y); g.scale(1, Math.max(0.01, kk)); g.translate(-x, -y); piezas[i](); g.restore();
  }
  if (mojado > 0) { g.fillStyle = `rgba(120,80,30,${0.25 * mojado})`; g.fillRect(x - 130, y - 10, 260, 10); }
  g.restore();
}
function pala(g, mano, ang) {
  g.save(); g.translate(mano[0], mano[1]); g.rotate(ang);
  g.fillStyle = "#ffd34d"; rectR(g, -3, -4, 6, 34, 3); g.fill();
  g.fillStyle = "#ff7a1a"; g.beginPath(); g.moveTo(-10, 28); g.lineTo(10, 28); g.lineTo(8, 46); g.quadraticCurveTo(0, 52, -8, 46); g.closePath(); g.fill();
  g.restore();
}
function cubo(g, x, y, s, col) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = col; g.beginPath(); g.moveTo(-18, -34); g.lineTo(18, -34); g.lineTo(14, 0); g.lineTo(-14, 0); g.closePath(); g.fill();
  g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(-14, -30, 5, 26);
  g.strokeStyle = "#333"; g.lineWidth = 2; g.beginPath(); g.arc(0, -34, 18, Math.PI, 0); g.stroke();
  g.restore();
}

class Castillo extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(320);
    this.gotas = [];
    this.fondoC = null;
  }
  kG(t) { return clamp(PASOS_G.filter((p) => t > p).length / PASOS_G.length, 0, 1); }
  kM(t) { return clamp(PASOS_M.filter((p) => t > p).length / PASOS_M.length + (t > 4.0 ? 0.2 : 0), 0, 1); }
  ola(t) {
    // frente de la ola: x de la espuma y altura
    if (t < T_OLA) return null;
    const u = tramo(t, T_OLA, T_CHOF), r = tramo(t, T_CHOF + 0.3, T_RETIRA);
    const alto = 250 * Math.sin(Math.min(1, u * 1.1) * Math.PI * 0.5) * (1 - eInOut(r));
    const x = lerp(-120, CG + 88, eOut(u)) - 300 * eIn(r);
    return { x, alto, u, r };
  }
  poseG(t) {
    const pose = { cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let mD = [70, 158], mI = [9, 160], ang = 0.4, sy = 1;
    if (t < 3.6) {
      // palea a toda prisa
      const f = Math.sin(t * 16);
      mD = [86 + 10 * f, 150 - 18 * Math.abs(f)]; ang = -0.6 + 0.9 * f;
      mI = [4, 140]; sy = 0.93 + 0.03 * Math.abs(f);
      pose.cara = (t * 2) % 2 < 1 ? "risa" : "guino";
    } else if (t < T_OLA) {
      // presume: señala su castillo y luego el de Marcos con burla
      pose.cara = t < 4.5 ? "risa" : "guino";
      mD = [96, 34 + 6 * Math.sin(t * 6)]; ang = -2.6;
      mI = [-2, 140];
      if (t > 4.5) { mD = [90, 100]; mI = [-28, 70]; pose.rc = 0.12; }
    } else if (t < T_CHOF + 0.1) {
      // ¡la ola!
      pose.cara = "sorpresa"; pose.puntas = 0.8;
      mD = [96, 40]; mI = [-18, 40]; ang = -2.4; pose.rc = -0.15;
    } else {
      // empapado, con la pala en la mano
      pose.cara = t < 7.6 ? "dormido" : t < 8.4 ? "sorpresa" : "risa";
      mD = [76, 150]; mI = [6, 156]; ang = 0.3;
      pose.rc = t > 7.6 && t < 8.4 ? 0.18 : 0;
      if (t > 8.4) { const s = Math.sin(t * 22); mD = [50 + 6 * s, 112]; mI = [30 - 6 * s, 112]; pose.rc = 0.1; }
    }
    pose.manoD = mD; pose.manoI = mI;
    pose.objD = (g, mano) => pala(g, mano, ang);
    if (t > T_CHOF) pose.alga = true;
    return { pose, m: matAv(XG, PIES, ESC, 0, 1, sy) };
  }
  poseM(t) {
    const pose = { quien: "marcos", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let mD = [67, 152], mI = [6, 152], ang = 0.4, sy = 1;
    if (t < 4.2) {
      // con calma y precisión
      const f = Math.sin(t * 6);
      mI = [-14 + 6 * f, 150]; mD = [40, 140]; ang = -0.3;
      pose.cara = (t % 2.2) < 1.6 ? "sonrisa" : "guino"; sy = 0.92;
      pose.rc = -0.08;
    } else if (t < T_OLA) {
      pose.cara = t < 4.6 ? "sonrisa" : "guino"; pose.rc = 0.1;
      mD = [60, 150]; mI = [-2, 140];
    } else if (t < T_RETIRA) {
      pose.cara = t < T_CHOF ? "sorpresa" : "sorpresa"; pose.rc = 0.12;
      mD = [76, 120]; mI = [-14, 110];
    } else {
      // ¡mi castillo! lo presenta con las dos manos
      const k = eOut(tramo(t, T_RETIRA + 0.3, T_RETIRA + 0.6));
      pose.cara = t < T_RETIRA + 0.3 ? "guino" : "risa";
      mI = mezcla([-14, 110], [-46, 120 + 4 * Math.sin(t * 8)], k); mD = mezcla([76, 120], [92, 60], k);
      pose.rc = 0.05 * Math.sin(t * 6);
      if (t > 9.2) { pose.cara = "guino"; }
    }
    pose.manoD = mD; pose.manoI = mI;
    pose.objI = (g, mano) => pala(g, mano, ang + 0.6);
    return { pose, m: matAv(XM, PIES, ESC, 0, 1, sy) };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    for (const ts of PASOS_G) this.una("g" + ts, t > ts, () => { temblar(3, 0.08); for (let i = 0; i < 10; i++) p.nueva(P.POLVO, CG + azar(-110, 110), SUELO - azar(0, 60), azar(-120, 120), azar(-140, -20), azar(0.4, 0.8), azar(18, 30)); });
    for (const ts of PASOS_M) this.una("m" + ts, t > ts, () => { for (let i = 0; i < 6; i++) p.nueva(P.POLVO, CM + azar(-90, 90), SUELO - azar(0, 40), azar(-80, 80), azar(-100, -20), azar(0.4, 0.7), azar(14, 22)); });
    // arena que sale de la pala de Guillermo
    if (t < 3.6 && Math.random() < 20 * dt) { const q = aPant(this.poseG(t).m, [96, 140]); this.gotas.push({ x: q[0], y: q[1], vx: azar(80, 240), vy: azar(-300, -120), v: 0.7, s: azar(3, 6), arena: true }); }
    this.una("chof", t > T_CHOF, () => {
      temblar(22, 0.5);
      for (let i = 0; i < 90; i++) { const a = azar(-Math.PI * 0.95, -Math.PI * 0.2), v = azar(200, 800); this.gotas.push({ x: CG + azar(-150, 150), y: SUELO - azar(40, 180), vx: Math.cos(a) * v * 0.7 + 120, vy: Math.sin(a) * v, v: azar(0.7, 1.3), s: azar(5, 12) }); }
      p.nueva(P.DESTELLO, CG, SUELO - 150, 0, 0, 0.4, 340);
    });
    // gotea
    if (t > T_CHOF + 0.3 && Math.random() < 16 * dt) { const q = aPant(this.poseG(t).m, [azar(10, 70), azar(20, 150)]); this.gotas.push({ x: q[0], y: q[1], vx: 0, vy: 40, v: 0.6, s: azar(2.5, 4) }); }
    this.una("brilla", t > T_RETIRA + 0.3, () => {
      for (let i = 0; i < 24; i++) p.nueva(P.PURPURINA, CM + azar(-130, 130), SUELO - azar(60, 230), azar(-30, 30), azar(-40, 20), azar(1.0, 2.0), azar(10, 18));
      for (let i = 0; i < 40; i++) p.nueva(P.CONFETI, azar(450, 1000), azar(-60, -10), azar(-40, 40), azar(30, 120), azar(2.5, 4), azar(9, 15), i % 5);
    });
    for (const d of this.gotas) { d.vy += 1200 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.v -= dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    if (this.gotas.length > 360) this.gotas.splice(0, this.gotas.length - 360);
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, HORIZ);
    gc.addColorStop(0, "#2a8ff0"); gc.addColorStop(1, "#bfefff");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, HORIZ + 60);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8; g.drawImage(BLOB.amarillo, 820, -100, 240, 240); g.restore();
    g.fillStyle = "#fff6c4"; g.beginPath(); g.arc(940, 20, 34, 0, 6.283); g.fill();
    g.fillStyle = "rgba(255,255,255,.9)";
    for (const [x, y, s] of [[110, 70, 0.8], [520, 40, 0.6]]) { g.beginPath(); g.arc(x, y, 26 * s, 0, 6.283); g.arc(x + 30 * s, y - 12 * s, 32 * s, 0, 6.283); g.arc(x + 64 * s, y, 24 * s, 0, 6.283); g.rect(x, y - 4 * s, 64 * s, 24 * s); g.fill(); }
    // velero
    g.fillStyle = "#fffdf5"; g.beginPath(); g.moveTo(700, 236); g.lineTo(700, 180); g.lineTo(736, 236); g.fill();
    g.fillStyle = "#c8283a"; g.beginPath(); g.moveTo(684, 238); g.lineTo(746, 238); g.lineTo(738, 248); g.lineTo(692, 248); g.fill();
    const gm = g.createLinearGradient(0, HORIZ, 0, ORILLA);
    gm.addColorStop(0, "#1a7ac8"); gm.addColorStop(1, "#3ac0e0");
    g.fillStyle = gm; g.fillRect(-60, HORIZ, W + 120, ORILLA - HORIZ);
    const ga = g.createLinearGradient(0, ORILLA, 0, H + 60);
    ga.addColorStop(0, "#d8b878"); ga.addColorStop(0.3, "#f2d8a0"); ga.addColorStop(1, "#d8b46a");
    g.fillStyle = ga; g.fillRect(-60, ORILLA, W + 120, H);
    const r = semilla(206);
    g.fillStyle = "rgba(160,120,60,.35)";
    for (let i = 0; i < 90; i++) { g.beginPath(); g.arc(r() * W, ORILLA + 10 + r() * 260, 1 + r() * 2, 0, 6.283); g.fill(); }
    // conchas y estrella de mar
    g.fillStyle = "#ff9ab8"; for (const [x, y] of [[120, 560], [560, 580], [980, 545]]) { g.beginPath(); g.arc(x, y, 7, Math.PI, 0); g.fill(); }
    g.fillStyle = "#ff7a3a"; estrella(g, 330, 575, 14, 6, 0.3); g.fill();
    this.fondoC = c;
    return c;
  }
  dibujar(g) {
    const t = this.t, eG = this.poseG(t), eM = this.poseM(t), O = this.ola(t);
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    // espuma de la orilla
    g.fillStyle = "rgba(255,255,255,.75)"; g.beginPath(); g.moveTo(-60, ORILLA + 6);
    for (let x = -60; x <= W + 60; x += 32) g.lineTo(x, ORILLA + 2 + Math.sin(x * 0.03 + t * 2) * 4);
    g.lineTo(W + 60, ORILLA + 10); g.lineTo(-60, ORILLA + 10); g.closePath(); g.fill();
    // arena mojada después de la ola
    if (t > T_CHOF) { g.fillStyle = `rgba(170,130,60,${0.3 * tramo(t, T_CHOF, T_RETIRA)})`; g.beginPath(); g.ellipse(CG - 60, SUELO + 8, 300, 34, 0, 0, 6.283); g.fill(); }
    // cubos
    cubo(g, 262, 566, 1.3, "#2a6aff"); cubo(g, 808, 566, 1.3, "#ff3d84");
    // castillos
    const fundido = t > T_CHOF ? eInOut(tramo(t, T_CHOF - 0.05, T_CHOF + 0.5)) : 0;
    if (fundido < 0.99) castilloG(g, this.kG(t), fundido, t);
    else { g.fillStyle = gradArena(g, SUELO - 24, SUELO); g.beginPath(); g.ellipse(CG, SUELO, 170, 22, 0, Math.PI, 0); g.fill(); }
    barArena(g, this.kM(t), t, t > T_CHOF ? 1 : 0);
    // la ola
    if (O && O.alto > 2) {
      const x = O.x, a = O.alto;
      const gr = g.createLinearGradient(0, SUELO - a, 0, SUELO + 30);
      gr.addColorStop(0, "#5ad0f0"); gr.addColorStop(1, "#1a7ac8");
      g.fillStyle = gr; g.beginPath(); g.moveTo(-80, SUELO + 40);
      g.lineTo(-80, SUELO - a * 0.7);
      g.quadraticCurveTo(x - 140, SUELO - a * 1.05, x - 20, SUELO - a);
      g.quadraticCurveTo(x + 50, SUELO - a * 0.98, x + 40, SUELO - a * 0.6);
      g.quadraticCurveTo(x + 20, SUELO - a * 0.62, x + 10, SUELO - a * 0.45);
      g.quadraticCurveTo(x + 60, SUELO - 10, x + 90, SUELO + 40);
      g.closePath(); g.fill();
      g.strokeStyle = "#fff"; g.lineWidth = 8; g.lineCap = "round";
      g.beginPath(); g.moveTo(x - 140, SUELO - a * 0.95); g.quadraticCurveTo(x - 20, SUELO - a * 1.08, x + 40, SUELO - a * 0.62); g.stroke();
      g.fillStyle = "rgba(255,255,255,.8)";
      for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(x + 20 + 10 * Math.sin(i + t * 9), SUELO - a * (0.5 + i * 0.08), 8 + i * 1.5, 0, 6.283); g.fill(); }
    }
    pintarAvatar(g, eG.m, eG.pose, t);
    pintarAvatar(g, eM.m, eM.pose, t);
    // alga en la cabeza de Guillermo
    if (eG.pose.alga) {
      const q = aPant(eG.m, [39, 4]);
      g.strokeStyle = "#2a8a3a"; g.lineWidth = 7; g.lineCap = "round";
      g.beginPath(); g.moveTo(q[0] - 30, q[1] + 6); g.quadraticCurveTo(q[0], q[1] - 20, q[0] + 30, q[1] + 4); g.quadraticCurveTo(q[0] + 42, q[1] + 30, q[0] + 36, q[1] + 52); g.stroke();
      g.fillStyle = "#ffcf3a"; g.save(); g.translate(q[0] + 30, q[1] + 6); g.rotate(0.4); g.fillStyle = "#ff7a3a"; estrella(g, 0, 0, 14, 6, t * 0.3); g.fill(); g.restore();
    }
    // gotas y granos de arena
    for (const d of this.gotas) { g.fillStyle = d.arena ? "#d8a85a" : "#dff4ff"; g.globalAlpha = Math.min(1, d.v * 3); g.beginPath(); g.arc(d.x, d.y, d.s, 0, 6.283); g.fill(); }
    g.globalAlpha = 1;
    this.p.dibujar(g);
    // textos
    const grito = (s, x, y, t0, t1, tam, col, borde, rot = -0.08) => {
      if (t < t0 || t > t1) return;
      const k = eBack(tramo(t, t0, t0 + 0.15));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 3, alfa: 1 - tramo(t, t1 - 0.2, t1) });
      g.restore();
    };
    const bg = aPant(eG.m, [70, 10]);
    bocadillo(g, 330, 90, "¡EL MÁS GRANDE!", bg[0] + 10, bg[1], tramo(t, 3.7, 3.85) * (1 - tramo(t, 4.6, 4.7)), 32);
    bocadillo(g, 330, 90, "¿Y ESO QUÉ ES?", bg[0] + 10, bg[1], tramo(t, 4.7, 4.85) * (1 - tramo(t, 5.45, 5.55)), 32);
    grito("¡CHOF!", CG, 160, T_CHOF, T_CHOF + 0.9, 90, "#e6f8ff", "#062a4a", -0.06);
    if (t > T_RETIRA + 0.3) {
      const d = t - T_RETIRA - 0.3, k = tramo(d, 0, 0.18), s = lerp(2.4, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 6));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(560, 92); g.rotate(-0.03); g.scale(s * 0.85, s * 0.85);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // iris
    const cF = [CM + 60, SUELO - 120];
    const r = t < 1 ? 800 * eInOut(tramo(t, 0.02, 0.7)) : 800 * (1 - eInOut(tramo(t, DUR - 0.75, DUR - 0.04)));
    const cc = t < 1 ? [512, 400] : cF;
    if (r < 800) {
      g.save(); g.fillStyle = "#000"; g.beginPath(); g.rect(-60, -60, W + 120, H + 120);
      g.moveTo(cc[0] + Math.max(0, r), cc[1]); g.arc(cc[0], cc[1], Math.max(0, r), 0, 6.2832); g.fill("evenodd"); g.restore();
    }
  }
}

registrar({ id: "00206", nombre: "Castillo de arena", crear: () => new Castillo() });
})();
