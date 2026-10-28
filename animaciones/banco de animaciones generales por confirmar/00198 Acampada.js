"use strict";
/*
 * 00198 · ACAMPADA
 *
 * Animación del banco. Empieza y acaba en negro.
 * De noche en el campo se enciende la hoguera. Guillermo y Marcos tuestan nubes de azúcar: la de Guillermo arde y
 * se queda negra; Marcos se come la suya, dorada. Marcos se pone la linterna bajo la barbilla y cuenta una historia
 * de miedo; Guillermo tiembla… ¡BUUU! Pega un salto hacia atrás y la tienda se le desploma encima. Asoma la cabeza
 * por la lona, mareado, y Marcos se parte de risa: ¡QUÉ NOCHE! La hoguera se apaga y la linterna hace clic.
 */
(() => {
const cache = cacheTexto();
const DUR = 10.6, ESC = 1.5, XG = 300, XM = 724, FX = 512, FY = 548;
const T_BU = 5.7, T_CAE = 6.12, T_ASOMA = 7.1, T_APAGA = 9.7, T_CLIC = 10.25;
const TIENDA = { x: 205, base: 512, apex: 292, ancho: 150 };
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
const arco = (a, b, h, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - 4 * h * u * (1 - u)];

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(820, 210), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 170);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#bff4ff"); gr.addColorStop(1, "#5fb8ff");
  g.save(); g.translate(410, 105);
  txt(g, "¡QUÉ NOCHE!", 6, 66, { tam: 140, peso: 900, fam: FD, color: "#061038", esp: 6 });
  txt(g, "¡QUÉ NOCHE!", 0, 58, { tam: 140, peso: 900, fam: FD, color: gr, borde: "#0a1a4a", bordeAncho: 10, esp: 6, glow: "rgba(120,200,255,.95)", glowTam: 30 });
  g.restore();
  cache.set("t", c);
  return c;
}
/** Nube de azúcar en (x, y) de pantalla; `tueste` 0 blanca → 1 dorada; `quemada` 0–1 negra. */
function nube(g, x, y, s, tueste, quemada) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const base = quemada > 0.5 ? ["#3a2a20", "#120a06"] : tueste > 0.5 ? ["#ffe2a0", "#c98a3a"] : ["#ffffff", "#e8dcd0"];
  const gr = g.createLinearGradient(0, -8, 0, 8);
  gr.addColorStop(0, base[0]); gr.addColorStop(1, base[1]);
  g.fillStyle = gr; rectR(g, -9, -8, 18, 16, 6); g.fill();
  g.fillStyle = "rgba(255,255,255,.4)"; g.fillRect(-6, -6, 4, 9);
  g.restore();
}
/** Palo de tostar desde la mano hasta la punta (unidades de avatar). */
function palo(g, mano, punta) {
  const a = Math.atan2(punta[1] - mano[1], punta[0] - mano[0]);
  g.strokeStyle = "#6a4422"; g.lineWidth = 2.2; g.lineCap = "round";
  g.beginPath(); g.moveTo(mano[0] - Math.cos(a) * 8, mano[1] - Math.sin(a) * 8); g.lineTo(punta[0], punta[1]); g.stroke();
}
function linterna(g, m, a, on) {
  g.save(); g.translate(m[0], m[1]); g.rotate(a);
  const gr = g.createLinearGradient(0, -4, 0, 4);
  gr.addColorStop(0, "#5a6a7a"); gr.addColorStop(0.5, "#c8d4e0"); gr.addColorStop(1, "#3a4652");
  g.fillStyle = gr; rectR(g, -8, -3.6, 22, 7.2, 2); g.fill();
  g.fillStyle = "#2a3440"; rectR(g, 12, -5.4, 7, 10.8, 2); g.fill();
  g.fillStyle = on ? "#fffbe0" : "#8a9aa8"; g.fillRect(18, -4.2, 1.6, 8.4);
  g.restore();
}

class Acampada extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(420);
    this.fondoC = null;
    this.estrellas = [];
    const r = semilla(198);
    for (let i = 0; i < 90; i++) this.estrellas.push({ x: r() * W, y: r() * 330, s: 0.6 + r() * 1.8, f: r() * 6 });
  }
  luz(t) {
    // la hoguera: se enciende, baja durante la historia y se apaga al final
    const on = eOut(tramo(t, 0.25, 1.1));
    const baja = 1 - 0.38 * eInOut(tramo(t, 2.95, 3.4)) * (1 - eInOut(tramo(t, T_CAE, T_CAE + 0.6)));
    const off = 1 - eInOut(tramo(t, T_APAGA, T_APAGA + 0.45));
    return on * baja * off;
  }
  linternaOn(t) { return t > 3.0 && t < T_CLIC; }
  poseG() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let mD = [84, 140], mI = [9, 160], punta = [482, 452], m, dentro = false;
    const nubeG = { tueste: tramo(t, 1.0, 1.8), arde: t > 1.8 && t < 2.45, quemada: t > 2.45 ? 1 : 0 };
    if (t < T_BU) {
      // tuesta
      pose.cara = t < 1.8 ? "sonrisa" : t < 2.6 ? "sorpresa" : t < 3.0 ? "guino" : "sorpresa";
      if (t > 1.8 && t < 2.6) {
        // ¡arde! la saca del fuego y sopla
        const k = eOut(tramo(t, 1.8, 2.0));
        punta = mezcla(punta, [404, 296], k);
        mD = mezcla(mD, [74, 100], k);
        pose.rc = 0.18 * k;
      }
      if (t >= 2.6 && t < 3.0) { punta = mezcla([404, 296], [470, 452], eInOut(tramo(t, 2.6, 2.95))); mD = mezcla([74, 100], [84, 140], eInOut(tramo(t, 2.6, 2.95))); }
      // escucha la historia, cada vez más asustado
      if (t >= 3.0) {
        const miedo = tramo(t, 3.2, T_BU);
        pose.rc = 0.07 * miedo * Math.sin(t * 40) + 0.08;
        pose.puntas = 0.35 * miedo;
        mI = [14 + 2 * Math.sin(t * 37), 128];
        punta = [470 + 6 * miedo * Math.sin(t * 43), 452 + 4 * miedo * Math.sin(t * 31)];
      }
      m = matAv(XG + (t >= 3.0 ? 2 * tramo(t, 3.2, T_BU) * Math.sin(t * 45) : 0), PIES, ESC);
    } else if (t < T_CAE) {
      // ¡salto del susto! hacia atrás, a la tienda
      const u = tramo(t, T_BU, T_CAE);
      const p = arco([XG, PIES], [TIENDA.x + 30, PIES - 30], 130, eOut(u));
      m = matAv(p[0], p[1], lerp(ESC, 1.25, u), -0.25 * Math.sin(u * Math.PI));
      pose.cara = "sorpresa"; pose.puntas = 1;
      mD = [96, 30]; mI = [-18, 30];
      pose.piernaI = [-20, 0.3]; pose.piernaD = [-12, -0.2];
      punta = null;
    } else {
      // dentro de la tienda caída
      dentro = true;
      m = matAv(TIENDA.x + 30 + (t < T_ASOMA ? 8 * Math.sin(t * 17) : 0), PIES + 64 - 34 * eOut(tramo(t, T_ASOMA, T_ASOMA + 0.25)), 1.25);
      mD = [70, 160]; mI = [9, 160]; punta = null;
      pose.cara = t < T_ASOMA + 0.5 ? "sorpresa" : t < 8.6 ? "borracho" : "risa";
      pose.rc = t < T_ASOMA + 0.5 ? 0 : 0.2 * Math.sin(t * 3);
      pose.puntas = t < T_ASOMA + 0.5 ? 0.8 : 0.8 * (1 - tramo(t, T_ASOMA + 0.5, T_ASOMA + 1.2));
    }
    pose.manoD = mD; pose.manoI = mI;
    if (punta) {
      const pa = enAv(m, punta);
      pose.objD = (g, mano) => palo(g, mano, pa);
    }
    return { pose, m, punta, nube: nubeG, dentro };
  }
  poseM() {
    const t = this.t;
    const pose = { quien: "marcos", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let mI = [-4, 136], mD = [67, 152], punta = [546, 452], aL = 0, sy = 1, salto = 0, comida = t > 2.75;
    pose.cara = t < 1.8 ? "sonrisa" : t < 2.45 ? "risa" : t < 2.9 ? "guino" : "sonrisa";
    // se come su nube dorada
    if (t > 2.15 && t < 2.95) {
      const k = eInOut(tramo(t, 2.15, 2.5)) * (1 - eInOut(tramo(t, 2.75, 2.95)));
      const b = boca(0, "marcos");
      punta = mezcla(punta, [XM + (b[0] - 39) * ESC - 4, PIES - (232 - b[1]) * ESC], k);
      mI = mezcla(mI, [4, 100], k);
    }
    // la linterna bajo la barbilla
    const kL = eInOut(tramo(t, 2.95, 3.25));
    mD = mezcla([67, 152], [38, 104], kL); aL = lerp(0, -Math.PI / 2, kL);
    if (t > 3.25 && t < T_BU) { pose.cara = Math.sin(t * 2.2) > 0.2 ? "guino" : "sorpresa"; pose.rc = 0.06 * Math.sin(t * 1.7); }
    if (t >= T_BU - 0.12 && t < T_BU + 0.6) {
      // ¡BUUU! se echa hacia delante con los brazos arriba
      const k = eOut(tramo(t, T_BU - 0.12, T_BU));
      pose.cara = "sorpresa"; pose.puntas = 0.6 * k;
      mI = mezcla(mI, [-22, 40], k); mD = mezcla(mD, [86, 42], k); aL = lerp(-Math.PI / 2, -2.2, k);
      salto = 26 * Math.sin(tramo(t, T_BU - 0.12, T_BU + 0.3) * Math.PI);
      punta = mezcla(punta, [600, 330], k);
    }
    if (t >= T_BU + 0.6) {
      // se parte de risa apuntando con la linterna a la tienda
      const k = eInOut(tramo(t, T_BU + 0.6, T_BU + 0.9));
      pose.cara = "risa"; pose.rc = -0.12 + 0.08 * Math.sin(t * 13);
      mI = mezcla([-22, 40], [10, 128 + 3 * Math.sin(t * 26)], k);
      mD = mezcla([86, 42], [24, 124], k); aL = lerp(-2.2, -Math.PI + 0.24, k);
      sy = 1 - 0.03 * Math.abs(Math.sin(t * 13));
      punta = mezcla([600, 330], [616, 520], k);
      if (t > 9.0) { pose.cara = "guino"; pose.rc = -0.05; sy = 1; }
    }
    const m = matAv(XM, PIES - salto, ESC, 0, 1, sy);
    pose.manoI = mI; pose.manoD = mD;
    const pa = enAv(m, punta), on = this.linternaOn(t);
    pose.objI = (g, mano) => palo(g, mano, pa);
    pose.objD2 = (g, mano) => linterna(g, mano, aL, on);
    return { pose, m, punta, comida, aL };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, L = this.luz(t);
    if (t > 0.25 && t < T_APAGA + 0.2 && Math.random() < 34 * L * dt) p.nueva(P.LLAMA, FX + azar(-34, 34), FY - 10, azar(-20, 20), azar(-90, -40), azar(0.35, 0.7), azar(30, 52) * (0.6 + 0.4 * L), Math.random() < 0.35 ? 1 : 0);
    if (Math.random() < 8 * L * dt) p.nueva(P.CHISPA, FX + azar(-20, 20), FY - 30, azar(-40, 40), azar(-420, -220), azar(0.5, 0.9), azar(4, 7));
    this.una("fush", t > 0.3, () => { p.nueva(P.DESTELLO, FX, FY - 30, 0, 0, 0.35, 260); for (let i = 0; i < 20; i++) p.nueva(P.CHISPA, FX, FY - 20, azar(-200, 200), azar(-500, -150), azar(0.4, 0.8), azar(5, 9)); });
    // la nube de Guillermo arde
    if (t > 1.8 && t < 2.45) { const e = this.poseG(); if (e.punta && Math.random() < 40 * dt) p.nueva(P.LLAMA, e.punta[0] + azar(-6, 6), e.punta[1] - 4, azar(-10, 10), azar(-60, -20), azar(0.2, 0.4), azar(18, 30), 0); }
    this.una("sopla", t > 2.42, () => { const e = this.poseG(); for (let i = 0; i < 8; i++) p.nueva(P.HUMO, e.punta[0], e.punta[1] - 6, azar(-30, 30), azar(-80, -30), azar(0.6, 1.0), azar(20, 34)); });
    this.una("bu", t > T_BU, () => { temblar(12, 0.3); });
    this.una("cae", t > T_CAE, () => {
      temblar(18, 0.4);
      for (let i = 0; i < 26; i++) p.nueva(P.POLVO, TIENDA.x + azar(-150, 150), TIENDA.base - azar(0, 160), azar(-260, 260), azar(-160, 30), azar(0.6, 1.2), azar(50, 90));
    });
    this.una("asoma", t > T_ASOMA, () => { temblar(6, 0.15); const e = this.poseG(), q = aPant(e.m, [39, 30]); for (let i = 0; i < 10; i++) p.nueva(P.POLVO, q[0] + azar(-40, 40), q[1] + 40, azar(-120, 120), azar(-120, -20), azar(0.5, 0.8), azar(26, 40)); });
    this.una("apaga", t > T_APAGA, () => { for (let i = 0; i < 16; i++) p.nueva(P.HUMO, FX + azar(-30, 30), FY - 20, azar(-30, 30), azar(-120, -50), azar(1.0, 1.6), azar(30, 50)); });
    this.una("estrella", t > 7.9, () => { this.fugaz = 0; });
    if (this.fugaz != null) this.fugaz += dt;
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, 420);
    gc.addColorStop(0, "#03051a"); gc.addColorStop(0.7, "#0e1640"); gc.addColorStop(1, "#1e2858");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, 520);
    // luna
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5; g.drawImage(BLOB2.cian, 760, -60, 240, 240); g.restore();
    g.fillStyle = "#f4f2dc"; g.beginPath(); g.arc(880, 62, 36, 0, 6.283); g.fill();
    g.fillStyle = "rgba(180,170,140,.45)"; for (const [x, y, r] of [[868, 52, 7], [892, 74, 5], [886, 48, 4]]) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
    // montes
    g.fillStyle = "#0a1030";
    g.beginPath(); g.moveTo(-60, 420); for (let x = -60; x <= W + 60; x += 20) g.lineTo(x, 360 - 50 * Math.sin(x * 0.006 + 1) - 25 * Math.sin(x * 0.017)); g.lineTo(W + 60, 460); g.lineTo(-60, 460); g.fill();
    // pinos
    const pino = (x, y, h, col) => {
      g.fillStyle = col;
      for (let k = 0; k < 4; k++) { const w = h * (0.34 - k * 0.06), yy = y - k * h * 0.22; g.beginPath(); g.moveTo(x - w, yy); g.lineTo(x, yy - h * 0.38); g.lineTo(x + w, yy); g.fill(); }
      g.fillRect(x - 5, y, 10, 30);
    };
    for (const [x, h] of [[420, 120], [600, 100], [660, 140], [380, 90]]) pino(x, 430, h, "#081a18");
    pino(965, 470, 320, "#06140f"); pino(40, 470, 280, "#06140f");
    // suelo
    const gs = g.createLinearGradient(0, 430, 0, H + 60);
    gs.addColorStop(0, "#14301a"); gs.addColorStop(1, "#08160a");
    g.fillStyle = gs; g.fillRect(-60, 430, W + 120, H);
    const r = semilla(98);
    g.strokeStyle = "rgba(60,120,60,.4)"; g.lineWidth = 2;
    for (let i = 0; i < 110; i++) { const x = r() * W, y = 440 + r() * 160; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y - 8); g.stroke(); }
    // piedras de la hoguera
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; const x = FX + Math.cos(a) * 62, y = FY + Math.sin(a) * 14; g.fillStyle = "#4a4a52"; g.beginPath(); g.ellipse(x, y, 15, 9, 0, 0, 6.283); g.fill(); g.fillStyle = "rgba(255,255,255,.18)"; g.beginPath(); g.ellipse(x - 3, y - 3, 6, 3, 0, 0, 6.283); g.fill(); }
    // troncos
    g.lineCap = "round";
    for (const [a, b] of [[[FX - 46, FY + 6], [FX + 30, FY - 22]], [[FX + 46, FY + 6], [FX - 30, FY - 22]], [[FX - 10, FY + 10], [FX + 8, FY - 30]]]) {
      g.strokeStyle = "#4a2a14"; g.lineWidth = 14; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      g.strokeStyle = "#7a4a24"; g.lineWidth = 5; g.beginPath(); g.moveTo(a[0], a[1] - 3); g.lineTo(b[0], b[1] - 3); g.stroke();
    }
    this.fondoC = c;
    return c;
  }
  /** La tienda de pie (k = 0) o desplomada encima de Guillermo (bulto en `b`, cabeza fuera si `fuera`). */
  tienda(g, t, caida, b, fuera) {
    const T = TIENDA;
    g.save();
    const gr = g.createLinearGradient(T.x - T.ancho, 0, T.x + T.ancho, 0);
    gr.addColorStop(0, "#c2410c"); gr.addColorStop(0.5, "#f97316"); gr.addColorStop(1, "#9a3412");
    if (!caida) {
      g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(T.x, T.base + 4, T.ancho + 20, 12, 0, 0, 6.283); g.fill();
      g.fillStyle = gr; g.beginPath(); g.moveTo(T.x - T.ancho, T.base); g.lineTo(T.x, T.apex); g.lineTo(T.x + T.ancho, T.base); g.closePath(); g.fill();
      g.fillStyle = "#3a1204"; g.beginPath(); g.moveTo(T.x - 44, T.base); g.lineTo(T.x, T.apex + 60); g.lineTo(T.x + 44, T.base); g.closePath(); g.fill();
      g.strokeStyle = "#ffd9b0"; g.lineWidth = 2; g.beginPath(); g.moveTo(T.x, T.apex + 60); g.lineTo(T.x, T.base); g.stroke();
      g.strokeStyle = "#5a2a10"; g.lineWidth = 4; g.beginPath(); g.moveTo(T.x, T.apex - 14); g.lineTo(T.x, T.apex + 4); g.stroke();
      g.strokeStyle = "rgba(255,255,255,.4)"; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(T.x, T.apex); g.lineTo(T.x - T.ancho - 40, T.base + 8); g.moveTo(T.x, T.apex); g.lineTo(T.x + T.ancho + 40, T.base + 8); g.stroke();
    } else {
      // lona caída: bulto que se mueve, con la cabeza asomando
      const bx = b[0], by = b[1], w = fuera ? 34 : 56;
      g.fillStyle = gr; g.beginPath();
      g.moveTo(T.x - T.ancho - 30, T.base + 8);
      g.quadraticCurveTo(T.x - T.ancho, T.base - 60, bx - w - 40, by + 110);
      g.quadraticCurveTo(bx - w - 10, by + 30, bx - w * 0.6, by + 6);
      if (fuera) { g.lineTo(bx - 20, by - 2); g.lineTo(bx - 10, by + 8); g.lineTo(bx, by - 4); g.lineTo(bx + 10, by + 8); g.lineTo(bx + 20, by - 2); }
      else g.quadraticCurveTo(bx, by - 26, bx + w * 0.6, by + 6);
      g.lineTo(bx + w * 0.6, by + 6);
      g.quadraticCurveTo(bx + w + 10, by + 30, bx + w + 40, by + 110);
      g.quadraticCurveTo(T.x + T.ancho + 10, T.base - 50, T.x + T.ancho + 40, T.base + 8);
      g.closePath(); g.fill();
      g.strokeStyle = "#5a1a04"; g.lineWidth = 3; g.stroke();
      // la puerta de la tienda, torcida, y los vientos sueltos
      g.fillStyle = "#3a1204"; g.beginPath(); g.moveTo(bx + 8, by + 70); g.quadraticCurveTo(bx - 40, T.base - 20, bx - 70, T.base + 6); g.lineTo(bx + 40, T.base + 6); g.closePath(); g.fill();
      g.strokeStyle = "#ffd9b0"; g.lineWidth = 2; g.beginPath(); g.moveTo(bx + 8, by + 70); g.quadraticCurveTo(bx - 10, T.base - 30, bx - 14, T.base + 6); g.stroke();
      g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(bx - w - 30, by + 100); g.quadraticCurveTo(T.x - T.ancho - 50, T.base - 10, T.x - T.ancho - 70, T.base + 10); g.stroke();
      g.strokeStyle = "rgba(255,220,180,.35)"; g.lineWidth = 2;
      g.beginPath(); g.moveTo(bx - 10, by + 30); g.quadraticCurveTo(bx - 50, by + 90, bx - 90, T.base); g.moveTo(bx + 14, by + 34); g.quadraticCurveTo(bx + 50, by + 90, bx + 100, T.base); g.stroke();
      // el palo de la tienda, torcido
      g.strokeStyle = "#5a2a10"; g.lineWidth = 6; g.lineCap = "round";
      g.beginPath(); g.moveTo(bx + 70, T.base + 2); g.lineTo(bx + 120 + 6 * Math.sin(t * 3), by + 20); g.stroke();
    }
    g.restore();
  }
  llamas(g, t, L) {
    if (L < 0.02) return;
    g.save(); g.translate(FX, FY - 8);
    const capas = [["#ff4a12", 1.0, 0], ["#ff9a1a", 0.74, 1.3], ["#ffe36a", 0.46, 2.6]];
    for (const [col, e, f] of capas) {
      const h = 108 * e * L * (0.9 + 0.1 * Math.sin(t * 17 + f)), w = 44 * e * (0.7 + 0.3 * L);
      g.fillStyle = col; g.globalAlpha = 0.92;
      g.beginPath(); g.moveTo(-w, 0);
      g.bezierCurveTo(-w * 1.1, -h * 0.4, -w * 0.3 + 8 * Math.sin(t * 11 + f), -h * 0.55, -w * 0.25 + 10 * Math.sin(t * 9 + f), -h * 0.8);
      g.quadraticCurveTo(-w * 0.1, -h * 0.55, 6 * Math.sin(t * 13 + f), -h);
      g.quadraticCurveTo(w * 0.25, -h * 0.6, w * 0.4 + 9 * Math.sin(t * 10 + f), -h * 0.78);
      g.bezierCurveTo(w * 0.5, -h * 0.5, w * 1.15, -h * 0.35, w, 0);
      g.closePath(); g.fill();
    }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, eG = this.poseG(), eM = this.poseM(), L = this.luz(t);
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    // estrellas
    g.fillStyle = "#fff";
    for (const s of this.estrellas) { g.globalAlpha = 0.5 + 0.5 * Math.sin(t * 3 + s.f); g.fillRect(s.x, s.y, s.s, s.s); }
    g.globalAlpha = 1;
    if (this.fugaz != null && this.fugaz < 0.7) {
      const u = this.fugaz / 0.7, x = lerp(150, 520, u), y = lerp(40, 150, u);
      g.strokeStyle = `rgba(255,255,255,${1 - u})`; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 90, y - 26); g.stroke();
    }
    // búho en el pino
    const parp = (t % 2.3) < 0.12 || (t > 4.2 && t < 5.2 && (t % 0.5) < 0.08);
    if (t > 3.6 && L > 0.1) { g.fillStyle = "#ffd34d"; for (const x of [952, 974]) { g.beginPath(); g.ellipse(x, 300, 7, parp ? 1 : 7, 0, 0, 6.283); g.fill(); } g.fillStyle = "#000"; for (const x of [953, 975]) { g.beginPath(); g.arc(x, 300, parp ? 0.5 : 3, 0, 6.283); g.fill(); } }
    if (!eG.dentro) this.tienda(g, t, false);
    g.fillStyle = "rgba(0,0,0,.3)";
    g.beginPath(); g.ellipse(XM, PIES + 4, 54, 10, 0, 0, 6.283); g.fill();
    if (!eG.dentro && t < T_BU) { g.beginPath(); g.ellipse(XG, PIES + 4, 54, 10, 0, 0, 6.283); g.fill(); }
    if (eG.dentro) { g.save(); g.beginPath(); g.rect(-60, -60, W + 120, TIENDA.base + 66); g.clip(); }
    pintarAvatar(g, eG.m, eG.pose, t);
    if (eG.dentro) g.restore();
    if (eG.dentro) {
      const fuera = t > T_ASOMA, q = aPant(eG.m, [39, fuera ? 76 : -8]);
      const caeK = eOut(tramo(t, T_CAE, T_CAE + 0.18));
      this.tienda(g, t, true, [q[0], lerp(TIENDA.apex, q[1], caeK)], fuera);
    }
    pintarAvatar(g, eM.m, eM.pose, t);
    // nubes de azúcar
    this.llamas(g, t, L);
    if (eG.punta) nube(g, eG.punta[0], eG.punta[1], 1.4, eG.nube.tueste * 0.4, eG.nube.quemada);
    if (!eM.comida) nube(g, eM.punta[0], eM.punta[1], 1.4, tramo(t, 1.0, 2.0), 0);
    this.p.dibujar(g);
    // luz de la hoguera y oscuridad alrededor
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 * L * (0.9 + 0.1 * Math.sin(t * 13));
    g.drawImage(BLOB.naranja, FX - 360, FY - 300, 720, 420); g.restore();
    const os = g.createRadialGradient(FX, FY - 120, 80, FX, FY - 120, 640);
    os.addColorStop(0, "rgba(0,0,12,0)"); os.addColorStop(1, `rgba(0,0,12,${0.35 + 0.35 * (1 - L)})`);
    g.fillStyle = os; g.fillRect(-60, -60, W + 120, H + 120);
    // linterna: luz desde abajo en la cara de Marcos o haz hacia la tienda
    if (this.linternaOn(t)) {
      const hm = aPant(eM.m, eM.pose._manoD), a = eM.aL;
      const dir = [Math.cos(a), Math.sin(a)], o = [hm[0] + dir[0] * 28, hm[1] + dir[1] * 28];
      g.save(); g.globalCompositeOperation = "lighter";
      const largo = 340, abre = 0.28;
      const gr = g.createRadialGradient(o[0], o[1], 0, o[0], o[1], largo);
      const bajo = t < T_BU + 0.6 ? 0.45 : 1;
      gr.addColorStop(0, `rgba(220,240,255,${0.5 * bajo})`); gr.addColorStop(1, "rgba(220,240,255,0)");
      g.fillStyle = gr; g.beginPath(); g.moveTo(o[0], o[1]);
      g.arc(o[0], o[1], largo, a - abre, a + abre); g.closePath(); g.fill();
      if (t < T_BU + 0.6) { const c = aPant(eM.m, [37, 66]); g.globalAlpha = 0.22; g.drawImage(BLOB2.cian, c[0] - 50, c[1] - 50, 100, 110); }
      g.restore();
    }
    // la oscuridad general (al encender y al apagar), menos la linterna
    const negro = 1 - eOut(tramo(t, 0.25, 0.9));
    const fin = eInOut(tramo(t, T_APAGA, T_APAGA + 0.45)) * 0.9;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
    if (fin > 0) {
      g.fillStyle = `rgba(0,0,0,${fin})`; g.fillRect(-60, -60, W + 120, H + 120);
      if (this.linternaOn(t)) { const c = aPant(eM.m, [37, 50]); g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.4 * fin; g.drawImage(BLOB2.cian, c[0] - 80, c[1] - 80, 160, 170); g.restore(); }
    }
    // textos
    if (t > 0.3 && t < 1.1) { const k = eBack(tramo(t, 0.3, 0.45)); g.save(); g.translate(FX, 330); g.scale(k, k); txt(g, "¡FUSH!", 0, 0, { tam: 60, peso: 400, fam: FC, color: "#ffd34d", borde: "#5a1a00", bordeAncho: 9, esp: 3, alfa: 1 - tramo(t, 0.85, 1.1) }); g.restore(); }
    if (t > 2.0 && t < 2.6) { const k = eBack(tramo(t, 2.0, 2.15)); g.save(); g.translate(300, 200); g.rotate(-0.1); g.scale(k, k); txt(g, "¡FFFF!", 0, 0, { tam: 44, peso: 400, fam: FC, color: "#fffdf5", borde: "#3a3a3a", bordeAncho: 7, esp: 2, alfa: 1 - tramo(t, 2.45, 2.6) }); g.restore(); }
    if (t > 3.0 && t < 3.4) { txt(g, "CLIC", 812, 412, { tam: 30, peso: 400, fam: FC, color: "#cfe8ff", borde: "#0a1a3a", bordeAncho: 6, alfa: 1 - tramo(t, 3.25, 3.4) }); }
    const bm = aPant(eM.m, [20, 40]);
    bocadillo(g, 744, 120, "ERA UNA NOCHE OSCURA...", bm[0], bm[1], tramo(t, 3.4, 3.6) * (1 - tramo(t, 4.45, 4.55)), 30);
    bocadillo(g, 744, 120, "...Y SE OYÓ UN RUIDO...", bm[0], bm[1], tramo(t, 4.55, 4.75) * (1 - tramo(t, 5.5, 5.6)), 30);
    if (t > 4.3 && t < 5.4) txt(g, "UUUH...", 940, 262, { tam: 26, peso: 400, fam: FC, color: "#ffe9a0", alfa: tramo(t, 4.3, 4.5) * (1 - tramo(t, 5.2, 5.4)) });
    if (t > T_BU - 0.1 && t < T_BU + 0.9) {
      const k = eBack(tramo(t, T_BU - 0.1, T_BU + 0.08));
      g.save(); g.translate(735, 150); g.rotate(-0.08); g.scale(k * (1 + 0.04 * Math.sin(t * 40)), k);
      txt(g, "¡BUUU!", 0, 0, { tam: 104, peso: 400, fam: FC, color: "#fffdf5", borde: "#2a0a4a", bordeAncho: 12, esp: 4, alfa: 1 - tramo(t, T_BU + 0.7, T_BU + 0.9) });
      g.restore();
    }
    if (t > T_CAE && t < T_CAE + 0.9) {
      const k = eBack(tramo(t, T_CAE, T_CAE + 0.15));
      g.save(); g.translate(TIENDA.x + 20, 250); g.rotate(0.08); g.scale(k, k);
      txt(g, "¡CATAPLOF!", 0, 0, { tam: 58, peso: 400, fam: FC, color: "#ffd34d", borde: "#4a1a00", bordeAncho: 9, esp: 3, alfa: 1 - tramo(t, T_CAE + 0.7, T_CAE + 0.9) });
      g.restore();
    }
    // estrellitas de mareo
    if (t > T_ASOMA + 0.4 && t < 8.7) {
      const c = aPant(eG.m, [39, -2]);
      for (let i = 0; i < 3; i++) { const a = t * 6 + (i / 3) * 6.283; g.fillStyle = "#ffe680"; estrella(g, c[0] + Math.cos(a) * 46, c[1] + Math.sin(a) * 12, 9, 3.6, a); g.fill(); }
    }
    if (t > 7.35) {
      const d = t - 7.35, k = tramo(d, 0, 0.18), s = lerp(2.4, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 6));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - 0.85 * fin); g.translate(512, 104); g.scale(s * 0.92, s * 0.92);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    if (t >= T_CLIC) { g.fillStyle = "#000"; g.fillRect(-60, -60, W + 120, H + 120); }
    if (t > T_CLIC - 0.05 && t < T_CLIC + 0.3) txt(g, "CLIC", 760, 360, { tam: 30, peso: 400, fam: FC, color: "#8aa0c0", alfa: 0.6 * (1 - tramo(t, T_CLIC, T_CLIC + 0.3)) });
  }
}

registrar({ id: "00198", nombre: "Acampada", crear: () => new Acampada() });
})();
