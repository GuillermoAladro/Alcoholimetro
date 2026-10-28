"use strict";
/*
 * 00250 · LA COREOGRAFÍA
 *
 * Animación del banco. Empieza y acaba en negro.
 * En la cochera del parque, Marcos le enseña a Guillermo (con un casco amarillo) la coreografía de los bomberos,
 * paso a paso: 1 · PASO (Guillermo se trastabilla), 2 · GIRO (da tres vueltas y se marea), 3 · SEÑALAR (señala al
 * lado contrario y Marcos se tapa la cara) y 4 · SALUDO (¡perfecto!). Se apagan las luces, se encienden las de
 * colores y las sirenas, y la bailan los dos sincronizados hasta el salto final: ¡QUÉ ARTE!
 */
(() => {
const CT = cacheTexto();
const ESC = 1.45;
const XM = 330, XG = 694;
const RG = avatar().rig, RM = avatar("bombero").rig;
const S1M = [0.55, 1.45], S1G = [1.55, 2.45], S2M = [2.55, 3.05], S2G = [3.1, 3.9], S3M = [4.15, 4.6], S3G = [4.65, 5.35];
const S4M = [5.4, 5.8], S4G = [5.85, 6.2], T_LUCES = 6.45;
const Y1 = [6.65, 7.25], Y2 = [7.25, 7.65], Y3 = [7.65, 8.05], Y4 = [8.05, 8.4], T_FIN = 8.45, T_APAGA = 10.1, DUR = 10.7;
const ETIQ = [["1 · PASO", 0.55, 2.45], ["2 · GIRO", 2.55, 4.1], ["3 · SEÑALAR", 4.15, 5.35], ["4 · SALUDO", 5.4, 6.3],
  ["PASO", Y1[0], Y1[1]], ["GIRO", Y2[0], Y2[1]], ["SEÑALAR", Y3[0], Y3[1]], ["SALUDO", Y4[0], T_FIN]];

const alc = (R) => (R === RG ? 74 : 59);
const hom = (R, lado) => (lado > 0 ? R.hombroD : R.hombroI2);
/** Mano estirada desde el hombro en la dirección `ang` (f: fracción del alcance). */
const dirM = (R, lado, ang, f = 1.04) => { const h = hom(R, lado), a = alc(R) * f; return [h[0] + Math.cos(ang) * a, h[1] + Math.sin(ang) * a]; };
const rel = (R, lado, dx, dy) => { const h = hom(R, lado); return [h[0] + dx, h[1] + dy]; };

/**
 * Aplica a la pose P el paso `paso` en el punto u (0–1). Devuelve el movimiento del cuerpo.
 * o: { torpe, vueltas, alReves }.
 */
function bailar(P, R, paso, u, o = {}) {
  const C = { dx: 0, dy: 0, sx: 1, giro: 0, sy: 1 };
  if (paso === "paso") {
    const s = Math.sin(u * Math.PI * 2), q = Math.sin(u * Math.PI * 4);
    const amp = o.torpe ? 40 : 26;
    C.dx = amp * s; C.dy = -6 * Math.abs(q);
    P.piernaI = [-11 * Math.max(0, q), 0.12 * s]; P.piernaD = [-11 * Math.max(0, -q), 0.12 * s];
    P.manoD = rel(R, 1, 12 + 10 * s, 42 - 12 * Math.abs(s)); P.manoI = rel(R, -1, -12 + 10 * s, 42 - 12 * Math.abs(s));
    if (o.torpe) {
      C.giro = 0.1 * Math.sin(u * Math.PI * 5) + 0.22 * Math.sin(tramo(u, 0.65, 1) * Math.PI);
      P.manoD = rel(R, 1, 30, -20 + 30 * q); P.manoI = rel(R, -1, -30, -20 - 30 * q);
    }
  } else if (paso === "giro") {
    const n = o.vueltas || 1, c = Math.cos(eInOut(u) * Math.PI * 2 * n);
    C.sx = Math.sign(c || 1) * Math.max(0.07, Math.abs(c));
    C.dy = -34 * Math.sin(u * Math.PI);
    P.manoD = rel(R, 1, -20, 30); P.manoI = rel(R, -1, 20, 30); P.brazoIDelante = true;
    P.piernaI = [-8 * Math.sin(u * Math.PI), 0.06]; P.piernaD = [0, -0.04];
  } else if (paso === "senala") {
    const k = eOut(tramo(u, 0, 0.3));
    if (o.alReves) {
      P.manoI = mezcla(P.manoI || R.manoI, dirM(R, -1, -2.2), k); P.manoD = mezcla(P.manoD || R.manoD, rel(R, 1, -6, 50), k); C.giro = -0.06 * k;
    } else {
      P.manoD = mezcla(P.manoD || R.manoD, dirM(R, 1, -0.95), k); P.manoI = mezcla(P.manoI || R.manoI, rel(R, -1, 6, 50), k); C.giro = 0.06 * k;
    }
    P.piernaI = [0, 0.1 * k]; P.piernaD = [0, -0.04 * k];
    C.dy = -4 * Math.sin(tramo(u, 0.2, 0.5) * Math.PI);
  } else if (paso === "saludo") {
    const k = eOut(tramo(u, 0.15, 0.4));
    P.manoD = mezcla(P.manoD || R.manoD, [R.frente[0] + 27, R.frente[1] + 6], k);
    P.manoI = R.manoI;
    P.piernaD = [-16 * Math.sin(tramo(u, 0, 0.3) * Math.PI), 0];
    C.dy = 3 * (u > 0.3 && u < 0.45 ? 1 : 0);
  } else if (paso === "final") {
    const k = eOut(tramo(u, 0, 0.3));
    P.manoD = mezcla(P.manoD || R.manoD, dirM(R, 1, -1.05), k); P.manoI = mezcla(P.manoI || R.manoI, dirM(R, -1, -2.1), k);
    C.dy = -56 * Math.sin(Math.min(1, u / 0.55) * Math.PI);
    P.piernaI = [-12 * Math.sin(Math.min(1, u / 0.55) * Math.PI), 0.2 * k]; P.piernaD = [-12 * Math.sin(Math.min(1, u / 0.55) * Math.PI), -0.2 * k];
  }
  return C;
}
const en = (t, r) => t >= r[0] && t < r[1];
const uu = (t, r) => tramo(t, r[0], r[1]);

class Coreografia extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(320);
    this.p.suelo = () => PIES + 6;
  }
  luz() { return tramo(this.t, 0.02, 0.4) * (1 - tramo(this.t, T_APAGA, DUR - 0.03)); }
  disco() { return eInOut(tramo(this.t, T_LUCES, T_LUCES + 0.35)); }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: RG.manoD, manoI: RG.manoI, casco: true, cascoColor: "#f2c21b" };
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: RM.manoD, manoI: RM.manoI };
    let cG = { dx: 0, dy: 0, sx: 1, giro: 0, sy: 1 }, cM = { dx: 0, dy: 0, sx: 1, giro: 0, sy: 1 };
    // ---------------- la clase
    if (t < T_LUCES) {
      // por defecto: Guillermo mira a Marcos, Marcos a Guillermo
      G.rc = -0.1; M.rc = 0.08; G.cara = "sonrisa"; M.cara = "sonrisa";
      if (en(t, S1M)) { cM = bailar(M, RM, "paso", uu(t, S1M)); M.cara = "guino"; M.rc = 0; G.cara = "sorpresa"; }
      if (en(t, S1G)) { cG = bailar(G, RG, "paso", uu(t, S1G), { torpe: true }); G.cara = "sorpresa"; G.rc = 0.1 * Math.sin(t * 9); M.cara = uu(t, S1G) > 0.65 ? "sorpresa" : "sonrisa"; }
      if (t >= S1G[1] && t < S2M[0]) { G.cara = "risa"; }
      if (en(t, S2M)) { cM = bailar(M, RM, "giro", uu(t, S2M)); M.cara = "guino"; G.cara = "sorpresa"; }
      if (en(t, S2G)) { cG = bailar(G, RG, "giro", uu(t, S2G), { vueltas: 3 }); G.cara = "sorpresa"; M.cara = "sorpresa"; }
      if (t >= S2G[1] && t < S3M[0] + 0.1) {
        // mareado
        G.cara = "borracho"; cG.giro = 0.13 * Math.sin((t - S2G[1]) * 13); G.rc = 0.15 * Math.sin((t - S2G[1]) * 9);
        G.manoD = [86, 120]; G.manoI = [-8, 120]; M.cara = "risa";
      }
      if (en(t, S3M)) { cM = bailar(M, RM, "senala", uu(t, S3M)); M.cara = "guino"; M.rc = -0.1; }
      if (en(t, S3G)) {
        const u = uu(t, S3G);
        if (u < 0.5) { cG = bailar(G, RG, "senala", tramo(u, 0, 0.5), { alReves: true }); G.cara = "risa"; G.rc = -0.12; }
        else { cG = bailar(G, RG, "senala", tramo(u, 0.5, 1)); G.cara = u < 0.62 ? "sorpresa" : "risa"; G.rc = 0.08; }
        // Marcos se tapa la cara
        const kf = Math.sin(tramo(u, 0.12, 0.7) * Math.PI);
        if (kf > 0) { M.manoD = mezcla(RM.manoD, [42, 46], Math.min(1, kf * 1.6)); M.cara = "dormido"; M.rc = -0.12 * kf; }
      }
      if (en(t, S4M)) { cM = bailar(M, RM, "saludo", uu(t, S4M)); M.cara = "guino"; M.rc = 0; }
      if (en(t, S4G)) { cG = bailar(G, RG, "saludo", uu(t, S4G)); G.cara = "guino"; G.rc = 0; M.cara = "sorpresa"; }
      if (t >= S4G[0] + 0.15 && t < T_LUCES) {
        const c = Math.abs(Math.sin((t - S4G[0]) * 14));
        M.manoD = [44 + 8 * c, 102]; M.manoI = [28 - 8 * c, 102]; M.brazoIDelante = true; M.cara = "risa";
      }
      if (t >= S4G[1]) { G.cara = "risa"; G.manoD = [74, 150]; G.rc = -0.06; }
    } else {
      // ---------------- ¡ahora los dos!, sincronizados
      G.cara = "guino"; M.cara = "guino";
      const dos = (paso, r, o) => { cG = bailar(G, RG, paso, uu(t, r), o); cM = bailar(M, RM, paso, uu(t, r), o); };
      if (t < Y1[0]) { G.cara = "risa"; M.cara = "risa"; G.rc = -0.08; M.rc = 0.08; }
      if (en(t, Y1)) dos("paso", Y1);
      if (en(t, Y2)) { dos("giro", Y2); G.cara = "risa"; M.cara = "risa"; }
      if (en(t, Y3)) dos("senala", Y3);
      if (en(t, Y4)) dos("saludo", Y4);
      if (t >= T_FIN) {
        const u = tramo(t, T_FIN, T_FIN + 0.9);
        cG = bailar(G, RG, "final", u); cM = bailar(M, RM, "final", u);
        G.cara = t < T_FIN + 0.7 ? "risa" : (Math.floor(t * 1.5) % 2 ? "risa" : "guino"); M.cara = t < T_FIN + 0.7 ? "risa" : (Math.floor(t * 1.5 + 1) % 2 ? "risa" : "guino");
        if (t > T_FIN + 0.9) { const b = Math.abs(Math.sin((t - T_FIN) * 7)); cG.dy = -6 * b; cM.dy = -6 * b; G.rc = 0.06 * Math.sin(t * 7); M.rc = -0.06 * Math.sin(t * 7); }
      }
    }
    const mG = matAv(XG + cG.dx, PIES + cG.dy, ESC, cG.giro, cG.sx, cG.sy);
    const mM = matAv(XM + cM.dx, PIES + cM.dy, ESC, cM.giro, cM.sx, cM.sy);
    return { G, M, mG, mM, cG, cM };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const pisa = (k, x0, xs) => this.una(k, t > x0, () => { temblar(4, 0.12); for (const x of xs) for (let i = 0; i < 5; i++) p.nueva(P.POLVO, x + azar(-30, 30), PIES, azar(-60, 60), azar(-30, -5), azar(0.4, 0.7), azar(16, 26)); });
    pisa("s4m", S4M[0] + 0.12, [XM]); pisa("s4g", S4G[0] + 0.12, [XG]); pisa("y4", Y4[0] + 0.1, [XM, XG]);
    this.una("luces", t > T_LUCES, () => { temblar(8, 0.25); });
    this.una("fin", t > T_FIN + 0.5, () => {
      temblar(16, 0.45);
      for (const x of [XM, XG]) p.nueva(P.DESTELLO, x, PIES - 280, 0, 0, 0.4, 220);
      for (let i = 0; i < 120; i++) p.nueva(P.CONFETI, azar(40, 980), azar(-60, 0), azar(-50, 50), azar(30, 170), azar(2.4, 3.6), azar(9, 15), (Math.random() * 5) | 0);
      for (let i = 0; i < 30; i++) { const a = azar(0, 6.283), v = azar(160, 420); p.nueva(P.CHISPA, 512, 300, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(6, 10)); }
    });
    // estrellitas del mareo
    p.actualizar(dt);
  }
  fondo() {
    if (CT.has("fondo")) return CT.get("fondo");
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gp = g.createLinearGradient(0, -60, 0, 480);
    gp.addColorStop(0, "#2a2f38"); gp.addColorStop(1, "#4a505a");
    g.fillStyle = gp; g.fillRect(-60, -60, W + 120, 560);
    // portones rojos cerrados
    for (const [x0, n] of [[110, "1"], [570, "2"]]) {
      g.fillStyle = "#c9d0d6"; g.fillRect(x0 - 10, 110, 364, 376);
      const gr = g.createLinearGradient(0, 120, 0, 480);
      gr.addColorStop(0, "#e8382a"); gr.addColorStop(1, "#8e0d07");
      g.fillStyle = gr; g.fillRect(x0, 120, 344, 366);
      g.fillStyle = "rgba(0,0,0,.25)"; for (let y = 132; y < 486; y += 16) g.fillRect(x0, y, 344, 3);
      g.fillStyle = "rgba(255,255,255,.12)"; for (let y = 134; y < 486; y += 16) g.fillRect(x0, y, 344, 1.5);
      for (let k = 0; k < 5; k++) { g.fillStyle = "#1a2a3a"; rectR(g, x0 + 22 + k * 64, 200, 46, 26, 4); g.fill(); g.fillStyle = "rgba(160,210,255,.3)"; g.fillRect(x0 + 26 + k * 64, 204, 18, 18); }
      // luz de la sirena (apagada) encima del portón
      g.fillStyle = "#2a2a30"; g.fillRect(x0 + 142, 104, 60, 8);
      g.fillStyle = n === "1" ? "#1a4a6a" : "#7a1a14"; g.beginPath(); g.moveTo(x0 + 148, 104); g.quadraticCurveTo(x0 + 148, 80, x0 + 172, 80); g.quadraticCurveTo(x0 + 196, 80, x0 + 196, 104); g.closePath(); g.fill();
    }
    // suelo pulido
    const gs = g.createLinearGradient(0, 486, 0, H + 60);
    gs.addColorStop(0, "#6a6e75"); gs.addColorStop(1, "#2a2c30");
    g.fillStyle = gs; g.fillRect(-60, 486, W + 120, H + 60 - 486);
    g.fillStyle = "#f2c21b"; g.fillRect(-60, 500, W + 120, 5);
    g.fillStyle = "rgba(255,80,60,.12)"; g.fillRect(110, 506, 344, 50); g.fillRect(570, 506, 344, 50);
    CT.set("fondo", c);
    return c;
  }
  etiqueta(s) {
    if (CT.has("e" + s)) return CT.get("e" + s);
    const c = lienzoNuevo(420, 90), g = c.getContext("2d");
    g.font = `900 52px ${FD}`; if ("letterSpacing" in g) g.letterSpacing = "4px";
    const w = Math.min(400, g.measureText(s).width + 60);
    if ("letterSpacing" in g) g.letterSpacing = "0px";
    rectR(g, 210 - w / 2, 10, w, 70, 35); g.fillStyle = "rgba(10,14,22,.85)"; g.fill();
    g.strokeStyle = "#f2c21b"; g.lineWidth = 4; g.stroke();
    txt(g, s, 210, 63, { tam: 52, peso: 900, fam: FD, color: "#fffdf5", esp: 4, max: w - 40 });
    CT.set("e" + s, c);
    return c;
  }
  titulo() {
    if (CT.has("tit")) return CT.get("tit");
    const c = lienzoNuevo(900, 200), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 160);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.45, "#ffe08a"); gr.addColorStop(1, "#ff3d84");
    txt(g, "¡QUÉ ARTE!", 456, 158, { tam: 150, peso: 400, fam: FC, color: "#2a0018", esp: 6 });
    txt(g, "¡QUÉ ARTE!", 450, 152, { tam: 150, peso: 400, fam: FC, color: gr, borde: "#2a0018", bordeAncho: 14, esp: 6, glow: "rgba(255,90,170,.85)", glowTam: 26 });
    CT.set("tit", c);
    return c;
  }
  haces(g, t, k) {
    // haces de colores que barren el suelo y luces de sirena arriba
    g.save(); g.globalCompositeOperation = "lighter";
    const cols = ["255,61,132", "47,227,232", "255,211,77", "120,120,255"];
    for (let i = 0; i < 4; i++) {
      const xa = 120 + i * 260, xb = 512 + 420 * Math.sin(t * (1.3 + i * 0.27) + i * 1.7), w = 90;
      const gr = g.createLinearGradient(0, -20, 0, PIES);
      gr.addColorStop(0, `rgba(${cols[i]},${0.45 * k})`); gr.addColorStop(1, `rgba(${cols[i]},${0.08 * k})`);
      g.fillStyle = gr; g.beginPath(); g.moveTo(xa - 12, -20); g.lineTo(xa + 12, -20); g.lineTo(xb + w, PIES + 20); g.lineTo(xb - w, PIES + 20); g.closePath(); g.fill();
      g.globalAlpha = 0.5 * k; g.drawImage(i % 2 ? BLOB2.cian : BLOB.rojo, xb - 110, PIES - 30, 220, 60); g.globalAlpha = 1;
    }
    // sirenas encima de los portones
    for (const [x, f] of [[282, 0], [742, Math.PI]]) {
      const on = Math.sin(t * 14 + f) > 0;
      g.globalAlpha = k * (on ? 0.9 : 0.25);
      g.drawImage(f ? BLOB.rojo : BLOB2.cian, x - 90, 40, 180, 110);
    }
    g.restore();
    for (const [x, f] of [[282, 0], [742, Math.PI]]) {
      const on = Math.sin(t * 14 + f) > 0;
      g.fillStyle = f ? (on ? "#ff6a5a" : "#7a1a14") : (on ? "#bff4ff" : "#1a4a6a");
      g.beginPath(); g.moveTo(x - 24, 104); g.quadraticCurveTo(x - 24, 80, x, 80); g.quadraticCurveTo(x + 24, 80, x + 24, 104); g.closePath(); g.fill();
      g.fillStyle = "#2a2a30"; g.fillRect(x - 30, 104, 60, 8);
    }
  }
  dibujar(g) {
    const t = this.t, e = this.poses(), a = this.luz(), k = this.disco();
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    if (k > 0) {
      g.fillStyle = `rgba(4,2,14,${0.68 * k})`; g.fillRect(-60, -60, W + 120, H + 120);
      this.haces(g, t, k);
      // foco sobre cada uno
      for (const x of [XM + e.cM.dx, XG + e.cG.dx]) foco(g, x, x, PIES + 6, 110, k);
    }
    // sombras
    g.fillStyle = "rgba(0,0,0,.35)";
    for (const [x, c] of [[XM, e.cM], [XG, e.cG]]) { const s = 1 - Math.min(0.5, -c.dy / 120); g.beginPath(); g.ellipse(x + c.dx, PIES + 4, 62 * s, 10 * s, 0, 0, 6.283); g.fill(); }
    pintarAvatar(g, e.mM, e.M, t);
    pintarAvatar(g, e.mG, e.G, t);
    // estrellitas del mareo
    if (t > S2G[1] - 0.05 && t < S3M[0] + 0.1) {
      const c = aPant(e.mG, [39, -6]);
      for (let i = 0; i < 4; i++) { const an = t * 7 + i * 1.571; brillo(g, c[0] + Math.cos(an) * 60, c[1] + Math.sin(an) * 14, 14, 0.9); }
    }
    // notas musicales en el baile
    if (k > 0.5) {
      g.save(); g.fillStyle = "#fffdf5"; g.strokeStyle = "#fffdf5"; g.lineWidth = 3;
      for (let i = 0; i < 6; i++) {
        const f = ((t * 0.5 + i / 6) % 1), x = (i % 2 ? 60 : 960) + 30 * Math.sin(t * 3 + i), y = 520 - f * 420;
        g.globalAlpha = Math.sin(f * Math.PI) * k;
        g.beginPath(); g.ellipse(x, y, 9, 7, -0.4, 0, 6.283); g.fill();
        g.beginPath(); g.moveTo(x + 8, y - 2); g.lineTo(x + 8, y - 34); g.lineTo(x + 20, y - 26); g.stroke();
      }
      g.restore();
    }
    this.p.dibujar(g);
    // etiquetas de los pasos
    for (const [s, a0, a1] of ETIQ) {
      if (t < a0 || t > a1) continue;
      const kk = eBack(tramo(t, a0, a0 + 0.15)), al = 1 - tramo(t, a1 - 0.12, a1);
      const r = this.etiqueta(s);
      g.save(); g.globalAlpha = al; g.translate(512, 64); g.scale(kk, kk); g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    // bocadillos
    if (t > S4G[0] + 0.2 && t < T_LUCES) bocadillo(g, XM - 30, 150, "¡ESO ES!", XM, 240, tramo(t, S4G[0] + 0.2, S4G[0] + 0.35) * (1 - tramo(t, T_LUCES - 0.15, T_LUCES)), 38);
    if (t > T_LUCES && t < Y1[0] + 0.2) bocadillo(g, 512, 150, "¡AHORA LOS DOS!", XM + 40, 240, tramo(t, T_LUCES, T_LUCES + 0.15) * (1 - tramo(t, Y1[0], Y1[0] + 0.2)), 40);
    // ¡QUÉ ARTE!
    if (t > T_FIN + 0.45) {
      const d = t - T_FIN - 0.45, kk = tramo(d, 0, 0.16), s = lerp(2.4, 1, eIn(kk)) * (1 + 0.03 * Math.sin(d * 8));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, kk * 3); g.translate(512, 92); g.rotate(-0.04 + 0.02 * Math.sin(d * 4)); g.scale(s * 0.82, s * 0.82);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const n = 1 - a;
    if (n > 0) { g.fillStyle = `rgba(0,0,0,${n})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00250", nombre: "La coreografía", crear: () => new Coreografia() });
})();
