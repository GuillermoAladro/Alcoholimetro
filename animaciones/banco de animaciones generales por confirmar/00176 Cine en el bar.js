"use strict";
/*
 * 00176 · CINE EN EL BAR
 *
 * Animación del banco. Empieza y acaba en negro.
 * Sesión de cine en la tele del bar: Guillermo y Marcos, en el sofá con gafas 3D y un cubo de palomitas, comen
 * tranquilos. En la peli (un mar al atardecer, nada conocido) se levanta una ola de espuma que crece y crece… y sale
 * de la pantalla en 3D (¡FSSSH!). La ola los arrolla en el sofá, el cubo sale volando y llueven palomitas:
 * ¡PALOMITAS! Acaban cubiertos de espuma, cazando palomitas con la boca y muertos de risa. Se apaga la tele.
 */
(() => {
const CT = cacheTexto();
const ESC = 1.9, YP = 664;                                    // los pies quedan detrás del sofá
const XG = 372, XM = 652;
const RG = avatar().rig, RM = avatar("marcos").rig;
// planos: sala (ellos) y tele (la peli)
const PLANOS = [[0, "sala"], [2.25, "tele"], [3.55, "sala"], [4.45, "tele"], [5.3, "sala"]];
const T_GRITO = 3.9, T_SALE = 4.75, T_OLA = 5.3, T_TIT = 5.45, T_APAGA = 9.95, DUR = 10.55;
const TV = { x0: 130, y0: 78, x1: 894, y1: 492 };

const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
const plano = (t) => { let p = "sala"; for (const [t0, n] of PLANOS) if (t >= t0) p = n; return p; };

function titulo() {
  if (CT.has("tit")) return CT.get("tit");
  const c = lienzoNuevo(1000, 210), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 160);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.55, "#fff1b0"); gr.addColorStop(1, "#ffc21f");
  txt(g, "¡PALOMITAS!", 506, 162, { tam: 140, peso: 400, fam: FC, color: "#5a0008", esp: 5, max: 930 });
  txt(g, "¡PALOMITAS!", 500, 156, { tam: 140, peso: 400, fam: FC, color: gr, borde: "#8a0010", bordeAncho: 14, esp: 5, glow: "rgba(255,80,60,.75)", glowTam: 26, max: 930 });
  CT.set("tit", c);
  return c;
}
/** Una palomita (sprite pequeño). */
function sprPalomita() {
  if (CT.has("pal")) return CT.get("pal");
  const c = lienzoNuevo(32, 32), g = c.getContext("2d");
  for (const [x, y, r] of [[13, 17, 8], [20, 13, 7], [19, 21, 7], [11, 10, 6]]) {
    const gr = g.createRadialGradient(x - 2, y - 2, 1, x, y, r);
    gr.addColorStop(0, "#fffef6"); gr.addColorStop(0.7, "#fbecc4"); gr.addColorStop(1, "#d9b46a");
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
  }
  g.fillStyle = "#c98a2a"; g.beginPath(); g.arc(16, 17, 2.4, 0, 6.283); g.fill();
  CT.set("pal", c);
  return c;
}
/** Cubo de palomitas (unidades de avatar), centro de la boca del cubo en (0, 0). */
function cubo(g, x, y, ang, lleno) {
  g.save(); g.translate(x, y); g.rotate(ang);
  // palomitas asomando
  if (lleno > 0) { const s = sprPalomita(); for (const [px, py] of [[-14, -6], [-6, -10], [3, -8], [11, -5], [-10, -2], [6, -2], [-2, -4]]) g.drawImage(s, px - 6, py - 6 - lleno * 3, 12, 12); }
  g.beginPath(); g.moveTo(-19, 0); g.lineTo(19, 0); g.lineTo(14, 36); g.lineTo(-14, 36); g.closePath();
  g.save(); g.clip();
  for (let i = -4; i <= 4; i++) { g.fillStyle = i % 2 ? "#fff8ee" : "#e01b2c"; g.beginPath(); g.moveTo(i * 5.2 - 2.6, 0); g.lineTo(i * 5.2 + 2.6, 0); g.lineTo(i * 4 + 2, 36); g.lineTo(i * 4 - 2, 36); g.closePath(); g.fill(); }
  g.restore();
  g.fillStyle = "#fff"; g.fillRect(-20, -1.5, 40, 3);
  g.restore();
}
/** Gafas 3D (rojo/cian) en la cara, siguiendo la cabeza; torcidas: `tuerce`. */
function gafas3D(g, R, rc, tuerce) {
  g.save();
  g.translate(R.cuello[0], R.cuello[1]); g.rotate(rc); g.translate(-R.cuello[0], -R.cuello[1]);
  const [a, b] = R.ojos, cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2;
  g.translate(cx, cy); g.rotate(tuerce || 0);
  const dx = (b[0] - a[0]) / 2;
  g.fillStyle = "#f4f2ec"; rectR(g, -dx - 12, -7, 2 * dx + 24, 14, 3); g.fill();
  g.strokeStyle = "#cfc9bc"; g.lineWidth = 0.8; g.stroke();
  g.fillStyle = "rgba(255,40,60,.82)"; rectR(g, -dx - 9, -5, 18, 10, 2); g.fill();
  g.fillStyle = "rgba(40,220,255,.82)"; rectR(g, dx - 9, -5, 18, 10, 2); g.fill();
  g.fillStyle = "rgba(255,255,255,.5)"; g.fillRect(-dx - 7, -4, 5, 2); g.fillRect(dx - 7, -4, 5, 2);
  g.strokeStyle = "#f4f2ec"; g.lineWidth = 2; g.beginPath(); g.moveTo(-dx - 12, -2); g.lineTo(-dx - 16, 0); g.moveTo(dx + 12, -2); g.lineTo(dx + 16, 0); g.stroke();
  g.restore();
}

class Cine extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(300);
    this.pal = [];          // palomitas: { x, y, vx, vy, r, vr }
  }
  luz() { return tramo(this.t, 0, 0.45) * (1 - tramo(this.t, T_APAGA, DUR - 0.03)); }
  posesSala() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [62, 122], manoI: [14, 124], brazoIDelante: true };
    const M = { quien: "marcos", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [56, 118], manoI: [4, 120], brazoIDelante: true };
    const mG = matAv(XG, YP, ESC), mM0 = matAv(XM, YP, ESC);
    let cuboAng = 0, cuboLleno = 1, tuerceG = 0, tuerceM = 0, espuma = 0;
    const cuboP = aPant(mM0, [M.manoI[0] - 16, M.manoI[1] - 4]);
    // comen tranquilos
    if (t < 2.25) {
      // Guillermo coge del cubo de Marcos y se lo lleva a la boca
      const cG = enAv(mG, [cuboP[0], cuboP[1] - 10]), bG = boca(0);
      const k1 = eInOut(tramo(t, 0.55, 0.8)) * (1 - eInOut(tramo(t, 0.95, 1.2)));
      const k2 = eInOut(tramo(t, 1.2, 1.4)) * (1 - eInOut(tramo(t, 1.6, 1.85)));
      G.manoD = mezcla(mezcla(G.manoD, cG, k1), [bG[0] + 6, bG[1] + 6], k2);
      if (k2 > 0.5) G.cara = "risa";
      // Marcos también
      const bM = boca(0, "marcos"), k3 = eInOut(tramo(t, 1.5, 1.7)) * (1 - eInOut(tramo(t, 1.9, 2.15)));
      M.manoD = mezcla(M.manoD, [bM[0] + 8, bM[1] + 6], k3);
      if (k3 > 0.5) M.cara = "risa";
      if (t > 0.3 && t < 0.55) M.cara = "guino";
    } else if (t < T_OLA) {
      // ¡la ola! se echan hacia delante con la palomita a medio camino
      const k = eOut(tramo(t, 3.55, 3.8));
      G.cara = "sorpresa"; M.cara = "sorpresa";
      const bM = boca(0, "marcos");
      M.manoD = mezcla(M.manoD, [bM[0] + 12, bM[1] + 22], k);
      // Guillermo agarra el brazo de Marcos
      G.manoD = mezcla(G.manoD, enAv(mG, aPant(mM0, [14, 104])), eOut(tramo(t, 3.95, 4.15)));
      G.rc = 0.05 * Math.sin(t * 30) * tramo(t, 3.9, 4.0); M.rc = -0.03;
      G.puntas = 0.4 * tramo(t, 3.9, 4.0); M.puntas = G.puntas;
    } else {
      // la ola de espuma: se los lleva por delante; luego, risas y palomitas
      const k = tramo(t, T_OLA, T_OLA + 0.5);
      espuma = eOut(tramo(t, T_OLA, T_OLA + 0.35)) * (1 - eInOut(tramo(t, 6.1, 6.8)));
      cuboAng = lerp(0, -2.6, eOut(k)); cuboLleno = 0;
      G.cara = t < 6.2 ? "sorpresa" : "risa"; M.cara = t < 6.2 ? "sorpresa" : "risa";
      G.puntas = 1 - tramo(t, 6.0, 6.6); M.puntas = G.puntas;
      tuerceG = -0.3 * eOut(k); tuerceM = 0.25 * eOut(k);
      G.manoD = mezcla([62, 122], [92, 60], eOut(k)); G.manoI = mezcla([14, 124], [-14, 60], eOut(k)); G.brazoIDelante = false;
      M.manoD = mezcla([56, 118], [84, 60], eOut(k)); M.manoI = mezcla([4, 120], [-12, 64], eOut(k)); M.brazoIDelante = false;
      if (t > 6.6) {
        // cazan palomitas con la boca
        const s = Math.sin((t - 6.6) * 9);
        G.rc = -0.18 + 0.05 * s; M.rc = 0.16 - 0.05 * s;
        G.manoD = [80, 96 + 10 * s]; G.manoI = [-4, 96 - 10 * s];
        M.manoD = [76, 98 - 10 * s]; M.manoI = [-2, 98 + 10 * s];
        if (t > 7.6 && t < 8.27) { G.cara = "risa"; G.rc = -0.05; G.manoD = [80, 96]; G.manoI = [-4, 96]; }
        if (t > 8.27 && t < 8.9) { G.cara = "guino"; G.rc = 0.05; }
      }
    }
    const dy = t > 6.6 ? Math.abs(Math.sin((t - 6.6) * 9)) * 5 : 0;
    const mM = matAv(XM, YP - dy, ESC), mG2 = matAv(XG, YP - dy * 0.8, ESC);
    // gafas y espuma en la cabeza (objD: por delante de la cara)
    const capa = t > T_OLA + 0.3 ? 1 : 0;
    G.objD = (g) => { if (capa) this.gorroEspuma(g, RG, G.rc, t, 0); gafas3D(g, RG, G.rc, tuerceG); };
    M.objD = (g) => { if (capa) this.gorroEspuma(g, RM, M.rc, t, 1); gafas3D(g, RM, M.rc, tuerceM); };
    M.objI2 = (g, m) => cubo(g, m[0] - 16, m[1] - 4, cuboAng, cuboLleno);
    return { G, M, mG: mG2, mM, espuma };
  }
  gorroEspuma(g, R, rc, t, q) {
    g.save();
    g.translate(R.cuello[0], R.cuello[1]); g.rotate(rc); g.translate(-R.cuello[0], -R.cuello[1]);
    const r = semilla(5 + q), esp = SPR.espuma, y0 = R.frente[1] - 18;
    for (let i = 0; i < 9; i++) { const x = R.frente[0] - 24 + i * 6 + r() * 3, y = y0 + Math.abs(i - 4) * 2.2 + r() * 3 - 4, s = 6 + r() * 4; g.drawImage(esp, x - s, y - s, s * 2, s * 2); }
    // goterones que resbalan
    const k = (t * 0.6 + q * 0.3) % 1;
    g.drawImage(esp, R.frente[0] + 18 - 4, y0 + 10 + k * 26 - 4, 8, 8);
    g.restore();
  }
  // ---------------------------------------------------------------- dibujo
  sala(g, t) {
    const e = this.posesSala();
    if (!CT.has("sala")) {
      const c = lienzoNuevo(W + 120, H + 120), cg = c.getContext("2d");
      cg.translate(60, 60);
      const gr = cg.createLinearGradient(0, -60, 0, 600);
      gr.addColorStop(0, "#0a0812"); gr.addColorStop(1, "#1c1426");
      cg.fillStyle = gr; cg.fillRect(-60, -60, W + 120, H + 120);
      const r = semilla(21), cols = [BLOB.naranja, BLOB2.oro, BLOB.rojo];
      cg.globalCompositeOperation = "lighter";
      for (let i = 0; i < 16; i++) { const x = r() * W, y = 20 + r() * 220, s = 30 + r() * 60; cg.globalAlpha = 0.08 + r() * 0.12; cg.drawImage(cols[i % 3], x - s / 2, y - s / 2, s, s); }
      cg.globalAlpha = 1; cg.globalCompositeOperation = "source-over";
      // respaldo del sofá
      const gs = cg.createLinearGradient(0, 300, 0, 500);
      gs.addColorStop(0, "#7a1622"); gs.addColorStop(1, "#3a080e");
      cg.fillStyle = gs; rectR(cg, 150, 300, 724, 240, 40); cg.fill();
      cg.strokeStyle = "rgba(0,0,0,.35)"; cg.lineWidth = 3;
      for (const x of [390, 634]) { cg.beginPath(); cg.moveTo(x, 316); cg.lineTo(x, 500); cg.stroke(); }
      cg.fillStyle = "rgba(255,200,200,.12)"; rectR(cg, 170, 308, 684, 16, 8); cg.fill();
      CT.set("sala", c);
    }
    g.drawImage(CT.get("sala"), -60, -60);
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    // asiento y brazos del sofá (por delante)
    const gc = g.createLinearGradient(0, 470, 0, H);
    gc.addColorStop(0, "#9a1e2c"); gc.addColorStop(1, "#4a0a12");
    g.fillStyle = gc; rectR(g, 140, 478, 744, 160, 30); g.fill();
    g.fillStyle = "rgba(255,210,210,.16)"; rectR(g, 160, 484, 704, 12, 6); g.fill();
    g.fillStyle = "#6a1019"; rectR(g, 80, 380, 110, 260, 40); g.fill(); rectR(g, 834, 380, 110, 260, 40); g.fill();
    g.fillStyle = "rgba(255,210,210,.14)"; rectR(g, 92, 390, 86, 14, 7); g.fill(); rectR(g, 846, 390, 86, 14, 7); g.fill();
    // luz parpadeante de la tele
    const fl = (0.22 + 0.08 * Math.sin(t * 23) * Math.sin(t * 7) + (t > T_OLA && t < 6 ? 0.25 : 0)) * (t > T_APAGA - 0.3 ? 0 : 1);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = fl;
    g.drawImage(BLOB2.cian, 120, 160, 784, 520);
    g.restore();
    // la ola de espuma que sale de la tele (desde delante, abajo)
    if (e.espuma > 0) this.olaDelante(g, t, e.espuma);
    // una palomita que cae justo en la boca de Guillermo
    if (t > 7.55 && t < 8.3) {
      const b = aPant(e.mG, boca(e.G.rc)), k = tramo(t, 7.55, 8.25), sp = sprPalomita();
      g.save(); g.translate(b[0] + 30 * (1 - k), lerp(-30, b[1] - 4, k * k)); g.rotate(t * 6); g.drawImage(sp, -15, -15, 30, 30); g.restore();
    }
  }
  olaDelante(g, t, k) {
    const esp = SPR.espuma, top = lerp(H + 40, 372, k), r = semilla(9);
    g.fillStyle = "#fbf5e4";
    g.beginPath(); g.moveTo(-60, H + 60);
    for (let x = -60; x <= W + 60; x += 40) g.lineTo(x, top + 30 + Math.sin(x * 0.02 + t * 8) * 18);
    g.lineTo(W + 60, H + 60); g.closePath(); g.fill();
    for (let x = -60; x <= W + 60; x += 22) { const s = 22 + r() * 22, y = top + 24 + Math.sin(x * 0.02 + t * 8) * 18 + r() * 10; g.drawImage(esp, x - s, y - s, s * 2, s * 2); }
  }
  tele(g, t) {
    fondo(g, "#0b0910");
    // pared y marco de la tele
    g.fillStyle = "#16121c"; g.fillRect(-60, -60, W + 120, H + 120);
    g.fillStyle = "#050507"; rectR(g, TV.x0 - 22, TV.y0 - 22, TV.x1 - TV.x0 + 44, TV.y1 - TV.y0 + 44, 18); g.fill();
    g.strokeStyle = "#2c2c34"; g.lineWidth = 4; g.stroke();
    const sale = tramo(t, T_SALE - 0.05, T_OLA);
    g.save();
    if (sale <= 0) { g.beginPath(); g.rect(TV.x0, TV.y0, TV.x1 - TV.x0, TV.y1 - TV.y0); g.clip(); }
    // la peli: cielo de atardecer, sol y mar
    const cx = 512, zoom = 1 + 0.25 * eIn(sale);
    g.save(); g.beginPath(); g.rect(TV.x0, TV.y0, TV.x1 - TV.x0, TV.y1 - TV.y0); g.clip();
    g.translate(cx, 300); g.scale(zoom, zoom); g.translate(-cx, -300);
    const gc = g.createLinearGradient(0, TV.y0, 0, 300);
    gc.addColorStop(0, "#3a1a5a"); gc.addColorStop(0.6, "#ff7a3a"); gc.addColorStop(1, "#ffcf6a");
    g.fillStyle = gc; g.fillRect(TV.x0 - 100, TV.y0 - 100, 1000, 330);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.9; g.drawImage(BLOB.amarillo, 600, 190, 160, 160); g.restore();
    g.fillStyle = "#fff2c0"; g.beginPath(); g.arc(680, 272, 40, Math.PI, 0); g.fill();
    const gm = g.createLinearGradient(0, 290, 0, TV.y1);
    gm.addColorStop(0, "#d98a1a"); gm.addColorStop(1, "#7a3a06");
    g.fillStyle = gm; g.fillRect(TV.x0 - 100, 290, 1000, 330);
    g.fillStyle = "rgba(255,240,200,.35)";
    for (let i = 0; i < 8; i++) { const y = 310 + i * 24, ph = (t * 40 + i * 50) % 200; g.fillRect(TV.x0 - 100 + ph, y, 120, 2); g.fillRect(TV.x0 + 300 + ph, y + 8, 90, 2); }
    // la ola, en 3D (rojo y cian desplazados)
    const kO = tramo(t, 2.4, T_SALE + 0.3);
    if (kO > 0) {
      const h = lerp(20, 330, eIn(kO)), base = lerp(300, 470, eIn(kO));
      g.globalCompositeOperation = "lighter";
      for (const [dx, col] of [[-7, "rgba(255,40,60,.55)"], [7, "rgba(40,220,255,.55)"]]) { g.fillStyle = col; this.ola(g, 512 + dx, base, h, t, true); }
      g.globalCompositeOperation = "source-over";
      this.ola(g, 512, base, h, t, false);
    }
    g.restore();
    // la espuma se sale del marco (3D)
    if (sale > 0) {
      const esp = SPR.espuma, r = semilla(13);
      for (let i = 0; i < 40; i++) {
        const a = r() * 6.283, d = (120 + r() * 300) * eIn(sale), s = (16 + r() * 30) * (1 + 2.5 * eIn(sale));
        const ox = 512 + (r() - 0.5) * 360, oy = 250 + r() * 40;
        g.drawImage(esp, ox + Math.cos(a) * d * 1.5 - s, oy + Math.sin(a) * d - s, s * 2, s * 2);
      }
    }
    g.restore();
    // rótulo de la tele
    if (sale <= 0) txt(g, "3D", TV.x1 - 40, TV.y0 + 36, { tam: 30, peso: 900, fam: FD, color: "rgba(255,255,255,.75)", esp: 2 });
    // reflejo del cristal
    g.save(); g.globalAlpha = 0.07; g.fillStyle = "#fff";
    g.beginPath(); g.moveTo(TV.x0, TV.y0); g.lineTo(TV.x0 + 260, TV.y0); g.lineTo(TV.x0, TV.y0 + 200); g.closePath(); g.fill();
    g.restore();
  }
  /** Ola que se riza: base (y), altura h; con `relleno` false pinta la espuma de la cresta. */
  ola(g, x, base, h, t, solo) {
    const w = 380 + h * 1.4, cresta = base - h;
    g.beginPath();
    g.moveTo(x - w, base + 40);
    g.quadraticCurveTo(x - w * 0.5, base, x - w * 0.25, cresta + h * 0.35);
    g.quadraticCurveTo(x - w * 0.05, cresta - 10, x + w * 0.18, cresta + h * 0.12);
    g.quadraticCurveTo(x + w * 0.3, cresta + h * 0.3, x + w * 0.2, cresta + h * 0.45);
    g.quadraticCurveTo(x + w * 0.5, base, x + w, base + 40);
    g.closePath();
    if (solo) { g.fill(); return; }
    const gr = g.createLinearGradient(0, cresta, 0, base + 40);
    gr.addColorStop(0, "#ffd36a"); gr.addColorStop(1, "#a0520a");
    g.fillStyle = gr; g.fill();
    // espuma de la cresta
    const esp = SPR.espuma;
    for (let i = 0; i < 14; i++) {
      const u = i / 13, px = lerp(x - w * 0.3, x + w * 0.22, u), py = cresta + h * 0.35 * Math.pow(Math.abs(u - 0.45) * 2, 2) - 6 + Math.sin(t * 9 + i) * 3;
      const s = 10 + h * 0.06; g.drawImage(esp, px - s, py - s, s * 2, s * 2);
    }
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("grito", t > T_GRITO, () => temblar(5, 0.2));
    this.una("sale", t > T_SALE, () => temblar(12, 0.4));
    this.una("ola", t > T_OLA, () => {
      temblar(20, 0.5);
      // las palomitas salen volando del cubo
      const m = matAv(XM, YP, ESC), c = aPant(m, [4 - 16, 116]);
      for (let i = 0; i < 110; i++) this.pal.push({ x: c[0] + azar(-20, 20), y: c[1] + azar(-20, 10), vx: azar(-420, 420), vy: azar(-900, -300), r: azar(0, 6), vr: azar(-8, 8), s: azar(14, 22) });
      for (let i = 0; i < 28; i++) p.nueva(P.ESPUMA, azar(0, W), azar(380, 600), azar(-200, 200), azar(-700, -300), azar(0.6, 1.1), azar(10, 20));
    });
    // y siguen cayendo palomitas
    if (t > 6.4 && t < T_APAGA - 0.3 && Math.random() < 14 * dt) this.pal.push({ x: azar(100, 924), y: -20, vx: azar(-30, 30), vy: azar(40, 120), r: azar(0, 6), vr: azar(-4, 4), s: azar(14, 20) });
    for (let i = this.pal.length - 1; i >= 0; i--) {
      const q = this.pal[i];
      q.vy += 900 * dt; q.vx *= 1 - 0.5 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.r += q.vr * dt;
      if (q.y > H + 30) this.pal.splice(i, 1);
    }
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  ono(g, s, x, y, t0, dur, tam, color, rot) {
    const d = this.t - t0;
    if (d < 0 || d > dur) return;
    const k = eBack(tramo(d, 0, 0.1));
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
    txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color, borde: "#1a1a1a", bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
    g.restore();
  }
  dibujar(g) {
    // lo caro (textos con brillo, fondos) se prepara en el primer cuadro, que es negro
    if (!this._pre) { this._pre = true; titulo(); sprPalomita(); this.sala(lienzoNuevo(8, 8).getContext("2d"), 0); }
    const t = this.t, a = this.luz();
    fondo(g, "#000");
    if (plano(t) === "tele") this.tele(g, t); else this.sala(g, t);
    // palomitas
    const sp = sprPalomita();
    for (const q of this.pal) { g.save(); g.translate(q.x, q.y); g.rotate(q.r); g.drawImage(sp, -q.s / 2, -q.s / 2, q.s, q.s); g.restore(); }
    this.p.dibujar(g);
    this.ono(g, "ÑAM", 470, 230, 1.5, 0.45, 40, "#fffdf5", -0.08);
    this.ono(g, "ÑAM", 720, 230, 1.85, 0.45, 40, "#fffdf5", 0.08);
    this.ono(g, "¡OOOH!", 512, 220, T_GRITO, 0.5, 52, "#2fe3e8", -0.04);
    this.ono(g, "¡FSSSHHH!", 512, 140, T_SALE, 0.55, 70, "#fffdf5", 0.05);
    this.ono(g, "CLIC", 860, 300, T_APAGA - 0.3, 0.45, 40, "#fffdf5", 0.1);
    this.ono(g, "¡ÑAM!", 250, 330, 8.27, 0.6, 50, "#ffd34d", -0.08);
    // ¡PALOMITAS!
    if (t > T_TIT) {
      const d = t - T_TIT, k = tramo(d, 0, 0.16), s = lerp(2.4, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 8));
      const r = titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 100); g.rotate(-0.04); g.scale(s * 0.9, s * 0.9);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    // corte entre planos: parpadeo
    for (const [t0] of PLANOS.slice(1)) { const d = t - t0; if (d > 0 && d < 0.08) { g.fillStyle = "rgba(0,0,0,.6)"; g.fillRect(-60, -60, W + 120, H + 120); } }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00176", nombre: "Cine en el bar", crear: () => new Cine() });
})();
