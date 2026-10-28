"use strict";
/*
 * 00251 · MUÑECO DE ESPUMA
 *
 * Animación del banco. Empieza y acaba en negro.
 * En el patio de prácticas, Marcos echa espuma con el extintor de prácticas (¡FSSSHH!) y Guillermo la va
 * moldeando a palmadas: una bola, otra encima y la cabeza (y le cae un pegote de espuma en el pelo). Guillermo le
 * pone ojos de carbón, nariz de zanahoria, sonrisa y brazos de palo; Marcos se quita el casco y se lo lanza a la
 * cabeza (¡TOC!). Lo admiran… y el muñeco les guiña un ojo y saluda. Bote del susto: ¡ESPUMÁN!
 */
(() => {
const CT = cacheTexto();
const ESC = 1.45;
const XM = 270, XG0 = 700, XG1 = 650;
const SX = 512;                                 // centro del muñeco
const BOLAS = [{ y: PIES - 72, r: 80 }, { y: PIES - 192, r: 58 }, { y: PIES - 284, r: 43 }];
const T_ROC = [[0.75, 2.25], [2.35, 3.35], [3.45, 4.35]], T_PLOF = 3.05;
const T_OJO1 = 4.75, T_OJO2 = 4.95, T_NARIZ = 5.2, T_BOCA = 5.4, T_BRAZOS = 5.6;
const T_CASCO = 5.55, T_QUITA = 5.8, T_LANZA = 6.15, T_TOC = 6.6, T_GUINO = 7.35, T_TIT = 7.95, T_APAGA = 9.95, DUR = 10.5;
const AX_S = 42.5;

const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
function cascoEn(g, cx, cy, rot, esc) {
  g.save(); g.translate(cx, cy); g.rotate(rot); g.scale(esc, esc); g.translate(-44, -18);
  cascoBombero(g, 88);
  g.restore();
}
/** Bola de espuma (se pinta una vez). */
function spriteBola(r, sem) {
  const S = Math.ceil(r * 2 + 20), c = lienzoNuevo(S, S), g = c.getContext("2d"), q = semilla(sem);
  g.translate(S / 2, S / 2);
  const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.05);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.6, "#f6f3ea"); gr.addColorStop(1, "#cfc9b8");
  g.fillStyle = gr;
  g.beginPath();
  for (let i = 0; i <= 40; i++) { const a = (i / 40) * 6.283, rr = r * (1 + 0.035 * Math.sin(a * 7 + sem) + 0.02 * Math.sin(a * 13)); g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  g.closePath(); g.fill();
  g.strokeStyle = "rgba(140,130,110,.35)"; g.lineWidth = 2; g.stroke();
  // burbujitas
  for (let i = 0; i < r * 0.9; i++) {
    const a = q() * 6.283, d = Math.sqrt(q()) * r * 0.9, x = Math.cos(a) * d, y = Math.sin(a) * d, b = 1.5 + q() * r * 0.06;
    g.strokeStyle = `rgba(180,175,160,${0.25 + q() * 0.3})`; g.lineWidth = 1;
    g.beginPath(); g.arc(x, y, b, 0, 6.283); g.stroke();
    g.fillStyle = "rgba(255,255,255,.8)"; g.beginPath(); g.arc(x - b * 0.3, y - b * 0.3, b * 0.3, 0, 6.283); g.fill();
  }
  return c;
}
/** Extintor de prácticas: el asa en (x, y) (unidades de avatar). */
function extintor(g, x, y, ang = 0) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const gr = g.createLinearGradient(-9, 0, 9, 0);
  gr.addColorStop(0, "#7a0c08"); gr.addColorStop(0.4, "#ff5a48"); gr.addColorStop(1, "#7a0c08");
  g.fillStyle = gr; rectR(g, -9, 6, 18, 44, 6); g.fill();
  g.fillStyle = "#fffdf5"; g.fillRect(-9, 20, 18, 12);
  g.fillStyle = "#2f7ae8"; g.beginPath(); g.arc(-2, 26, 3, 0, 6.283); g.arc(3, 25, 2.4, 0, 6.283); g.fill();
  g.fillStyle = "#2a2a30"; rectR(g, -4, -2, 8, 10, 2); g.fill();
  g.fillStyle = "#c9d0d6"; rectR(g, -7, -4, 14, 4, 2); g.fill();
  g.restore();
}
/** Boquilla de cono negra. */
function cono(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.fillStyle = "#1b1b1b"; g.beginPath(); g.moveTo(-4, -3); g.lineTo(14, -6); g.lineTo(14, 6); g.lineTo(-4, 3); g.closePath(); g.fill();
  g.fillStyle = "#3a3a40"; g.fillRect(12, -6, 3, 12);
  g.restore();
}
function pegote(g, x, y, k) {
  g.fillStyle = "#fffdf5";
  for (const [dx, dy, r] of [[0, 0, 9], [-8, 3, 6], [8, 2, 7], [3, -7, 6], [-4, -5, 5]]) { g.beginPath(); g.arc(x + dx * k, y + dy * k, r * k, 0, 6.283); g.fill(); }
  g.fillStyle = "rgba(200,190,170,.5)"; g.beginPath(); g.arc(x + 2 * k, y + 3 * k, 4 * k, 0, 6.283); g.fill();
}

class MunecoEspuma extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(420);
    this.p.suelo = () => PIES + 4;
    this.fG = 0;
  }
  luz() { return tramo(this.t, 0.02, 0.45) * (1 - tramo(this.t, T_APAGA, DUR - 0.03)); }
  tam(i) { const r = T_ROC[i]; return eOut(tramo(this.t, r[0] + 0.1, r[1])); }
  /** Bola que está creciendo ahora (o -1). */
  rociando() { for (let i = 0; i < 3; i++) if (this.t > T_ROC[i][0] && this.t < T_ROC[i][1]) return i; return -1; }
  blanco(i) { const B = BOLAS[i], k = this.tam(i); return [SX - 10, B.y + B.r * (1 - k) * 0.8 - B.r * 0.2 * k]; }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [80, 120], manoI: [-2, 150] };
    let xg = XG0, yg = PIES, syG = 1, ym = PIES;
    // ---- Marcos: rocía
    const mM0 = matAv(XM, PIES, ESC);
    const ro = this.rociando();
    this.apunta = null;
    if (t < T_ROC[2][1] + 0.2) {
      const idx = ro >= 0 ? ro : (t < T_ROC[0][0] ? 0 : t < T_ROC[1][0] ? 0 : t < T_ROC[2][0] ? 1 : 2);
      const alto = [124, 104, 84][idx];
      M.manoD = [88, alto + 2 * Math.sin(t * 30) * (ro >= 0 ? 1 : 0)];
      const b = enAv(mM0, this.blanco(idx));
      this.apunta = Math.atan2(b[1] - M.manoD[1], b[0] - M.manoD[0]);
      M.cara = ro >= 0 ? (Math.floor(t * 1.4) % 2 ? "guino" : "risa") : "sonrisa"; M.rc = 0.06;
    } else {
      // deja el extintor, se quita el casco y lo lanza al muñeco
      M.manoD = [67, 152]; M.manoI = [6, 152]; M.cara = "sonrisa"; M.rc = 0.1;
    }
    this.cascoMano = null;
    if (t > T_CASCO) {
      const ala = [69, 37];
      M.manoD = mezcla([67, 152], ala, eInOut(tramo(t, T_CASCO, T_QUITA))); M.cara = "guino"; M.rc = 0;
      if (t > T_QUITA) {
        const kq = eInOut(tramo(t, T_QUITA, T_LANZA - 0.1)), kl = eOut(tramo(t, T_LANZA - 0.12, T_LANZA));
        M.manoD = mezcla(mezcla(ala, [96, 70], kq), [108, 40], kl); M.casco = false; M.cara = "sonrisa";
        if (t < T_LANZA) this.cascoMano = { c: [38 + (M.manoD[0] - ala[0]) + 4 * kq, 17.9 + (M.manoD[1] - ala[1])], rot: 0.35 * kq };
        if (t > T_LANZA + 0.1) { M.manoD = mezcla([108, 40], [67, 152], eInOut(tramo(t, T_LANZA + 0.1, T_LANZA + 0.45))); M.cara = "risa"; }
      }
    }
    if (t > T_QUITA) M.casco = false;
    // ---- Guillermo: moldea a palmadas
    const pal = Math.abs(Math.sin(t * 13));
    if (t < T_ROC[0][0] + 0.3) {
      const s = Math.sin(t * 16); G.manoD = [48 + 4 * s, 118]; G.manoI = [30 - 4 * s, 118]; G.brazoIDelante = true; G.cara = "risa"; G.rc = -0.08;
    }
    if (t > T_ROC[0][0]) {
      const u = tramo(t, T_ROC[0][0] + 0.1, T_ROC[0][0] + 0.6);
      xg = lerp(XG0, XG0 - 25, eInOut(u));
      if (u > 0 && u < 1) { const a = andar(this.fG, 1); G.piernaI = a.piernaI; G.piernaD = a.piernaD; }
    }
    const mG0 = matAv(xg, PIES, ESC);
    if (ro >= 0 && t > T_ROC[0][0] + 0.45) {
      const B = BOLAS[ro], k = this.tam(ro), r = B.r * Math.max(0.3, k);
      const lado = [SX + r * 0.85, B.y + B.r - r - (ro === 0 ? 0 : 0)];
      if (ro === 0) syG = 0.8;
      const ob = enAv(matAv(xg, PIES, ESC, 0, 1, syG), [lado[0] + 4 + 10 * pal, lado[1] - 6]);
      G.manoI = ob; G.brazoIDelante = true; G.manoD = [80 + 6 * pal, 100]; G.cara = pal > 0.7 ? "guino" : "risa"; G.rc = -0.12;
    }
    if (t > T_ROC[2][1] && t < T_OJO1 - 0.35) { G.cara = "risa"; G.rc = -0.06; G.manoD = [92, 50 + 8 * Math.sin(t * 12)]; }
    void mG0;
    // decora la cara: ojos, nariz, boca, brazos
    if (t > T_OJO1 - 0.35 && t < T_BRAZOS + 0.4) {
      xg = lerp(XG0 - 25, XG1, eInOut(tramo(t, T_OJO1 - 0.35, T_OJO1 - 0.1)));
      const H = BOLAS[2];
      const pts = [[T_OJO1, [SX + 14, H.y - 8]], [T_OJO2, [SX - 14, H.y - 8]], [T_NARIZ, [SX + 4, H.y + 4]], [T_BOCA, [SX, H.y + 22]], [T_BRAZOS, [SX + 56, BOLAS[1].y - 6]]];
      let obj = pts[0][1];
      for (let i = 0; i < pts.length; i++) {
        const [t0, q] = pts[i];
        if (t > t0 - 0.2) obj = q;
      }
      const m = matAv(xg, PIES, ESC);
      G.manoI = enAv(m, [obj[0] + 8, obj[1] + 6]); G.brazoIDelante = true; G.manoD = [74, 140]; G.cara = "guino"; G.rc = -0.14;
    }
    if (t >= T_BRAZOS + 0.4) { xg = XG1; G.manoI = [9, 160]; G.brazoIDelante = false; G.cara = "risa"; G.rc = -0.08; }
    if (t > T_LANZA && t < T_TOC + 0.3) { G.cara = "sorpresa"; G.rc = -0.18; }
    // admiran el muñeco
    if (t > T_TOC + 0.3 && t < T_GUINO) {
      G.manoD = [62, 140]; G.manoI = [18, 140]; G.cara = "sonrisa"; G.rc = -0.05;
      M.manoD = [56, 138]; M.manoI = [18, 138]; M.brazoIDelante = true; M.cara = "sonrisa"; M.rc = 0.05;
      const kk = eInOut(tramo(t, T_TOC + 0.3, T_TOC + 0.7)); xg = lerp(XG1, XG1 + 40, kk);
    }
    // ¡guiño!: bote del susto
    if (t > T_GUINO) {
      xg = XG1 + 40;
      const u = tramo(t, T_GUINO + 0.1, T_GUINO + 0.55);
      const b = Math.sin(u * Math.PI);
      yg -= 50 * b; ym -= 50 * b;
      G.cara = "sorpresa"; M.cara = "sorpresa"; G.puntas = b > 0.05 ? 1 : 0; M.puntas = b > 0.05 ? 1 : 0;
      G.manoD = [100, 60]; G.manoI = [-24, 60]; M.manoD = [86, 64]; M.manoI = [-12, 64]; G.brazoIDelante = false; M.brazoIDelante = false;
      G.rc = -0.1; M.rc = 0.1;
      if (t > T_GUINO + 0.6) { G.cara = "sorpresa"; M.cara = "sorpresa"; G.rc = 0.14; M.rc = -0.14; G.manoD = [70, 158]; G.manoI = [9, 160]; M.manoD = [67, 152]; M.manoI = [6, 152]; G.puntas = 0; M.puntas = 0; }
      if (t > T_TIT) {
        G.cara = "risa"; M.cara = "risa"; G.rc = -0.08; M.rc = 0.08;
        const s = Math.abs(Math.sin((t - T_TIT) * 12)) * (1 - tramo(t, T_TIT + 0.8, T_TIT + 1));
        G.manoD = [52, 120 - 10 * s]; G.manoI = [26, 120 - 10 * s]; G.brazoIDelante = true; M.manoD = [52, 116 - 10 * s]; M.manoI = [22, 116 - 10 * s]; M.brazoIDelante = true;
        if (t > T_TIT + 1.0) { G.cara = "guino"; M.cara = "guino"; G.manoD = [96, 46]; M.manoI = [-14, 48]; G.manoI = [9, 160]; M.manoD = [67, 152]; G.brazoIDelante = false; M.brazoIDelante = false; }
      }
    }
    // objetos
    if (t < T_ROC[2][1] + 0.2) {
      const ang = this.apunta, t0 = t;
      M.objI = (g, m) => extintor(g, m[0], m[1] - 2, 0.05);
      M.objD2 = (g, m) => cono(g, m[0] - 2, m[1], ang);
      M.objD = (g, m) => {
        // manguera del extintor a la boquilla
        g.strokeStyle = "#1b1b1b"; g.lineWidth = 3.4; g.lineCap = "round";
        const v = [-2, 146];
        g.beginPath(); g.moveTo(v[0], v[1]); g.bezierCurveTo(v[0] + 10, v[1] + 30, m[0] - 30, m[1] + 40, m[0] - 4, m[1]); g.stroke();
        void t0;
      };
    }
    if (this.cascoMano) { const c = this.cascoMano; M.objD = (g) => cascoEn(g, c.c[0], c.c[1], c.rot, 0.65); }
    if (t > T_PLOF) { const k = eBack(tramo(t, T_PLOF, T_PLOF + 0.2)); G.objD = (g) => { g.save(); g.translate(39, 22); g.rotate(G.rc || 0); g.translate(-39, -22); pegote(g, 44, 4, k); g.restore(); }; }
    const mG = matAv(xg, yg, ESC, 0, 1, syG);
    const mM = matAv(XM, ym, ESC);
    return { G, M, mG, mM };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    if (t > T_ROC[0][0] + 0.1 && t < T_ROC[0][0] + 0.6) this.fG += dt * 10;
    const e = this.poses();
    // espuma que sale de la boquilla
    const ro = this.rociando();
    if (ro >= 0 && this.apunta != null) {
      const m = aPant(e.mM, e.M._manoD || e.M.manoD), b = this.blanco(ro);
      const a = Math.atan2(b[1] - m[1], b[0] - m[0]);
      for (let i = 0; i < 3; i++) p.nueva(P.ESPUMA, m[0] + Math.cos(a) * 20, m[1] + Math.sin(a) * 20, Math.cos(a) * azar(380, 520), Math.sin(a) * azar(380, 520) - 60, azar(0.35, 0.55), azar(5, 10));
      if (Math.random() < 20 * dt) { const ang = azar(-Math.PI, 0), v = azar(100, 260); p.nueva(P.ESPUMA, b[0], b[1], Math.cos(ang) * v, Math.sin(ang) * v, azar(0.5, 0.9), azar(4, 8)); }
    }
    // palmadas
    if (ro >= 0 && Math.random() < 6 * dt) { const B = BOLAS[ro]; p.nueva(P.ESPUMA, SX + B.r * 0.9, B.y, azar(40, 160), azar(-200, -60), azar(0.4, 0.7), azar(4, 7)); }
    this.una("plof", t > T_PLOF, () => { const c = aPant(e.mG, [44, 0]); for (let i = 0; i < 12; i++) { const a = azar(-Math.PI, 0), v = azar(80, 200); p.nueva(P.ESPUMA, c[0], c[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.7), azar(4, 7)); } temblar(4, 0.12); });
    for (const [k, x] of [["o1", T_OJO1], ["o2", T_OJO2], ["n", T_NARIZ], ["b", T_BOCA], ["br", T_BRAZOS]]) this.una(k, t > x, () => {
      const H = BOLAS[2];
      for (let i = 0; i < 6; i++) { const a = azar(0, 6.283), v = azar(60, 160); p.nueva(P.CHISPA, SX, H.y, Math.cos(a) * v, Math.sin(a) * v, azar(0.25, 0.45), azar(4, 7)); }
    });
    this.una("toc", t > T_TOC, () => { temblar(8, 0.2); for (let i = 0; i < 14; i++) { const a = azar(-Math.PI, 0), v = azar(120, 260); p.nueva(P.ESPUMA, SX, BOLAS[2].y - 40, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(4, 8)); } });
    this.una("guino", t > T_GUINO, () => { temblar(6, 0.2); p.nueva(P.DESTELLO, SX + 16, BOLAS[2].y - 8, 0, 0, 0.3, 120); });
    this.una("tit", t > T_TIT, () => {
      temblar(14, 0.4);
      for (let i = 0; i < 60; i++) { const a = azar(-Math.PI, 0), v = azar(200, 520); p.nueva(P.ESPUMA, 512, 120, Math.cos(a) * v, Math.sin(a) * v * 0.6, azar(0.8, 1.4), azar(6, 12)); }
      for (let i = 0; i < 60; i++) p.nueva(P.CONFETI, azar(60, 960), azar(-60, 0), azar(-40, 40), azar(30, 150), azar(2, 3), azar(9, 14), (Math.random() * 5) | 0);
    });
    p.actualizar(dt);
  }
  fondo() {
    if (CT.has("fondo")) return CT.get("fondo");
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, 400);
    gc.addColorStop(0, "#5aa4e8"); gc.addColorStop(1, "#d8eef8");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, 480);
    // muro del parque y portón
    g.fillStyle = "#c9b48a"; g.fillRect(-60, 170, W + 120, 320);
    g.fillStyle = "rgba(120,90,50,.25)"; for (let y = 170; y < 490; y += 30) g.fillRect(-60, y, W + 120, 2);
    g.fillStyle = "#e8dcc4"; g.fillRect(-60, 160, W + 120, 14);
    g.fillStyle = "#9aa3ab"; g.fillRect(620, 220, 360, 270);
    g.fillStyle = "rgba(0,0,0,.18)"; for (let y = 230; y < 490; y += 14) g.fillRect(620, y, 360, 3);
    txt(g, "PATIO DE PRÁCTICAS", 800, 205, { tam: 22, peso: 900, fam: FD, color: "#7a0c08", esp: 3 });
    // conos y neumáticos
    for (const x of [70, 140]) {
      g.fillStyle = "#ff7a1a"; g.beginPath(); g.moveTo(x - 20, 492); g.lineTo(x, 430); g.lineTo(x + 20, 492); g.closePath(); g.fill();
      g.fillStyle = "#fffdf5"; g.fillRect(x - 13, 460, 26, 8);
      g.fillStyle = "#3a3a40"; g.fillRect(x - 26, 490, 52, 6);
    }
    for (let i = 0; i < 3; i++) { g.fillStyle = "#1e1e22"; g.beginPath(); g.ellipse(930, 480 - i * 26, 50, 16, 0, 0, 6.283); g.fill(); g.fillStyle = "#3a3a40"; g.beginPath(); g.ellipse(930, 476 - i * 26, 22, 6, 0, 0, 6.283); g.fill(); }
    // suelo
    const gs = g.createLinearGradient(0, 490, 0, H + 60);
    gs.addColorStop(0, "#7a7a80"); gs.addColorStop(1, "#3a3a40");
    g.fillStyle = gs; g.fillRect(-60, 490, W + 120, H + 60 - 490);
    g.fillStyle = "#f2c21b"; g.fillRect(-60, 504, W + 120, 5);
    g.fillStyle = "rgba(255,255,255,.5)"; for (let x = -40; x < W + 60; x += 90) g.fillRect(x, 560, 50, 5);
    CT.set("fondo", c);
    return c;
  }
  bola(i) {
    const k = "b" + i;
    if (!CT.has(k)) CT.set(k, spriteBola(BOLAS[i].r, 3 + i * 5));
    return CT.get(k);
  }
  titulo() {
    if (CT.has("tit")) return CT.get("tit");
    const c = lienzoNuevo(900, 200), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 160);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.6, "#e8fbff"); gr.addColorStop(1, "#9fe3ff");
    txt(g, "¡ESPUMÁN!", 456, 158, { tam: 140, peso: 400, fam: FB, color: "#0a3a5a", esp: 4 });
    txt(g, "¡ESPUMÁN!", 450, 152, { tam: 140, peso: 400, fam: FB, color: gr, borde: "#0a3a5a", bordeAncho: 14, esp: 4, glow: "rgba(120,220,255,.85)", glowTam: 24 });
    // burbujas pegadas a las letras
    const q = semilla(9);
    for (let i = 0; i < 26; i++) { const x = 120 + q() * 660, y = 50 + q() * 30, r = 4 + q() * 8; g.fillStyle = "rgba(255,255,255,.92)"; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
    CT.set("tit", c);
    return c;
  }
  muneco(g, t) {
    const k0 = this.tam(0), k1 = this.tam(1), k2 = this.tam(2);
    // charco de espuma
    if (k0 > 0) { g.fillStyle = "rgba(255,253,245,.9)"; g.beginPath(); g.ellipse(SX, PIES + 2, 110 * k0, 14 * k0, 0, 0, 6.283); g.fill(); }
    const guino = t > T_GUINO, ola = guino ? Math.sin((t - T_GUINO) * 10) : 0;
    // brazos de palo (detrás)
    if (t > T_BRAZOS) {
      const B = BOLAS[1], kk = eBack(tramo(t, T_BRAZOS, T_BRAZOS + 0.2));
      g.strokeStyle = "#6a4422"; g.lineWidth = 7; g.lineCap = "round";
      for (const sd of [-1, 1]) {
        const ox = SX + sd * B.r * 0.8, oy = B.y - 6, a = sd > 0 ? -0.5 : (guino ? -2.3 + 0.5 * ola : -2.6);
        const ex = ox + Math.cos(a) * 70 * kk * (sd > 0 ? 1 : 1), ey = oy + Math.sin(a) * 70 * kk;
        g.beginPath(); g.moveTo(ox, oy); g.lineTo(ex, ey); g.stroke();
        g.lineWidth = 4; g.beginPath(); g.moveTo(lerp(ox, ex, 0.7), lerp(oy, ey, 0.7)); g.lineTo(lerp(ox, ex, 0.7) + 14 * sd, lerp(oy, ey, 0.7) - 12); g.stroke(); g.lineWidth = 7;
      }
    }
    for (let i = 0; i < 3; i++) {
      const kk = [k0, k1, k2][i];
      if (kk <= 0.01) continue;
      const B = BOLAS[i], s = this.bola(i), r = B.r * kk, cy = B.y + B.r - r;
      const bote = i === 2 && guino ? 1 + 0.04 * Math.sin((t - T_GUINO) * 18) * Math.exp(-(t - T_GUINO) * 3) : 1;
      g.drawImage(s, SX - (s.width / 2) * kk * bote, cy - (s.height / 2) * kk / bote, s.width * kk * bote, s.height * kk / bote);
    }
    const H = BOLAS[2], M = BOLAS[1];
    // botones
    if (k1 > 0.95) { g.fillStyle = "#1e1e22"; for (const dy of [-20, 4, 28]) { g.beginPath(); g.arc(SX, M.y + dy, 6, 0, 6.283); g.fill(); } }
    // ojos
    const ojo = (x, cerrado, t0) => {
      if (t < t0) return;
      const k = eBack(tramo(t, t0, t0 + 0.18));
      if (cerrado) { g.strokeStyle = "#1e1e22"; g.lineWidth = 5; g.lineCap = "round"; g.beginPath(); g.arc(x, H.y + 2, 8, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); return; }
      g.fillStyle = "#1e1e22"; g.beginPath(); g.arc(x, H.y - 3, 7 * k, 0, 6.283); g.fill();
      g.fillStyle = "#fff"; g.beginPath(); g.arc(x - 2, H.y - 5, 2 * k, 0, 6.283); g.fill();
    };
    const parpadeo = guino && t < T_GUINO + 1.2;
    ojo(SX + 14, parpadeo, T_OJO1); ojo(SX - 14, false, T_OJO2);
    // nariz de zanahoria
    if (t > T_NARIZ) {
      const k = eBack(tramo(t, T_NARIZ, T_NARIZ + 0.18));
      g.fillStyle = "#ff7a1a"; g.beginPath(); g.moveTo(SX - 2, H.y + 3); g.lineTo(SX + 34 * k, H.y + 10); g.lineTo(SX - 2, H.y + 15); g.closePath(); g.fill();
      g.strokeStyle = "#c95a0a"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(SX + 8, H.y + 6); g.lineTo(SX + 9, H.y + 13); g.moveTo(SX + 17, H.y + 8); g.lineTo(SX + 17, H.y + 12); g.stroke();
    }
    // sonrisa de carbón (más ancha al guiñar)
    if (t > T_BOCA) {
      const k = eBack(tramo(t, T_BOCA, T_BOCA + 0.2)), ab = guino ? 0.9 : 0.6;
      g.fillStyle = "#1e1e22";
      for (let i = 0; i < 5; i++) { const a = Math.PI / 2 + (i - 2) * 0.32 * ab / 0.6; g.beginPath(); g.arc(SX + Math.cos(a) * 19, H.y + 8 + Math.sin(a) * 19, 3.4 * k, 0, 6.283); g.fill(); }
    }
    // casco
    if (t > T_TOC) {
      const d = t - T_TOC, bt = Math.exp(-d * 4) * Math.sin(d * 18);
      cascoEn(g, SX + 2, H.y - H.r - 3 - 6 * Math.abs(bt), 0.12 * bt - 0.05, 0.86);
    }
  }
  dibujar(g) {
    const t = this.t, e = this.poses(), a = this.luz();
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    // extintor en el suelo cuando lo deja
    if (t > T_ROC[2][1] + 0.2) { g.save(); g.translate(XM - 70, PIES - 72); g.scale(ESC, ESC); extintor(g, 0, 0, 0); g.restore(); }
    this.muneco(g, t);
    pintarAvatar(g, e.mM, e.M, t);
    pintarAvatar(g, e.mG, e.G, t);
    if (this.cascoMano) this.cascoSuelta = aPant(e.mM, this.cascoMano.c);
    // casco volando al muñeco
    if (t > T_LANZA && t < T_TOC) {
      const u = tramo(t, T_LANZA, T_TOC), p0 = this.cascoSuelta || [380, 260], H = BOLAS[2];
      const x = lerp(p0[0], SX + 2, u), y = lerp(p0[1], H.y - H.r - 3, u) - Math.sin(u * Math.PI) * 110;
      cascoEn(g, x, y, 0.35 - u * 6.66, lerp(0.65 * ESC, 0.86, u));
    }
    // chorro de espuma
    const ro = this.rociando();
    if (ro >= 0) {
      const m = aPant(e.mM, e.M._manoD || e.M.manoD), b = this.blanco(ro), k = tramo(t, T_ROC[ro][0], T_ROC[ro][0] + 0.15);
      const a0 = Math.atan2(b[1] - m[1], b[0] - m[0]), s = [m[0] + Math.cos(a0) * 22, m[1] + Math.sin(a0) * 22], f = mezcla(s, b, k);
      g.save(); g.lineCap = "round";
      g.strokeStyle = "rgba(255,253,245,.55)"; g.lineWidth = 22; g.beginPath(); g.moveTo(s[0], s[1]); g.quadraticCurveTo((s[0] + f[0]) / 2, Math.min(s[1], f[1]) - 30, f[0], f[1]); g.stroke();
      g.strokeStyle = "#fffdf5"; g.lineWidth = 11; g.stroke();
      g.restore();
    }
    this.p.dibujar(g);
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.12, dur) });
      g.restore();
    };
    ono("¡FSSSHH!", 330, 140, T_ROC[0][0] + 0.1, 1.0, 54, "#fffdf5", "#2a4a6a", -0.08);
    ono("¡FSSSHH!", 360, 120, T_ROC[2][0], 0.7, 46, "#fffdf5", "#2a4a6a", 0.06);
    ono("¡PLAF!", 760, 330, 1.5, 0.35, 36, "#fffdf5", "#1b1b1b", 0.1);
    ono("¡PLAF!", 770, 290, 2.7, 0.35, 36, "#fffdf5", "#1b1b1b", -0.1);
    ono("¡PLOF!", 820, 170, T_PLOF, 0.5, 42, "#2fe3e8", "#06303a", 0.1);
    ono("¡POP!", 590, 160, T_OJO1, 0.3, 34, "#ffd34d", "#3a2400", 0.1);
    ono("¡POP!", 400, 210, T_OJO2, 0.3, 34, "#ffd34d", "#3a2400", -0.1);
    ono("¡POP!", 600, 200, T_NARIZ, 0.3, 34, "#ffd34d", "#3a2400", 0.06);
    ono("¡TOC!", 420, 200, T_TOC, 0.5, 46, "#fffdf5", "#1b1b1b", -0.1);
    ono("¡CHIN!", SX + 80, BOLAS[2].y - 60, T_GUINO, 0.5, 40, "#ffd34d", "#3a2400", 0.12);
    if (t > T_GUINO && t < T_GUINO + 1.2) brillo(g, SX + 22, BOLAS[2].y - 18, 26 * (1 - tramo(t, T_GUINO + 0.6, T_GUINO + 1.2)), 1);
    // ¡ESPUMÁN!
    if (t > T_TIT) {
      const d = t - T_TIT, k = tramo(d, 0, 0.18), s = lerp(2.4, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 92); g.rotate(-0.04); g.scale(s * 0.82, s * 0.82);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const n = 1 - a;
    if (n > 0) { g.fillStyle = `rgba(0,0,0,${n})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00251", nombre: "Muñeco de espuma", crear: () => new MunecoEspuma() });
})();
