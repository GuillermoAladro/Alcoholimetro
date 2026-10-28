"use strict";
/*
 * 00169 · SOMBRAS CHINESCAS
 *
 * Animación del banco. Empieza y acaba en negro.
 * ¡CLIC! Se enciende una lámpara que apunta a la pared. Marcos levanta la mano y su sombra es un perro que ladra
 * (¡GUAU!); Guillermo contesta con un pato (CUAC, CUAC). El perro se acerca a escondidas, abre la boca y se come al
 * pato (¡ÑAM!): Guillermo se mira la mano, que ya no hace sombra. Hacen las paces, juntan las manos en el centro y
 * las dos sombras forman una jarra de cerveza gigante con su espuma: ¡GUAU! La lámpara se apaga.
 */
(() => {
const CT = cacheTexto();
const ESC = 1.35;
const L = [512, 470];                                      // la bombilla (de donde salen las sombras)
const PARED = { x: 512, y: 225, rx: 440, ry: 215 };
const T_ON = 0.35, T_PERRO = 0.7, T_GUAU = 1.55, T_PATO = 2.7, T_ACERCA = 3.85, T_ÑAM = 5.0, T_PAZ = 6.25, T_JARRA = 7.2, T_OFF = 9.85, DUR = 10.35;
const SOMBRA = "rgba(26,14,8,.94)";

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) {
    const u = (k[i][2] || eInOut)((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]));
    return lerp(k[i - 1][1], k[i][1], u);
  }
  return k[k.length - 1][1];
}
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
const proy = (h) => [L[0] + (h[0] - L[0]) * 1.8, L[1] + (h[1] - L[1]) * 1.8];

function titulo() {
  if (CT.has("tit")) return CT.get("tit");
  const c = lienzoNuevo(620, 220), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 170);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#fff0b8"); gr.addColorStop(1, "#ffae1f");
  txt(g, "¡GUAU!", 316, 176, { tam: 168, peso: 400, fam: FC, color: "#2a1200", esp: 6 });
  txt(g, "¡GUAU!", 310, 170, { tam: 168, peso: 400, fam: FC, color: gr, borde: "#2a1200", bordeAncho: 14, esp: 6, glow: "rgba(255,190,50,.9)", glowTam: 28 });
  CT.set("tit", c);
  return c;
}
/** Perro mirando a la derecha. Origen en la muñeca; jaw: apertura de la boca (rad). */
function perro(g, jaw, oreja) {
  g.fillStyle = SOMBRA;
  // mandíbula de abajo (gira en la bisagra)
  g.save(); g.translate(30, 8); g.rotate(jaw);
  g.beginPath(); g.moveTo(-6, -6); g.lineTo(62, -2); g.quadraticCurveTo(70, 4, 62, 12); g.lineTo(0, 24); g.lineTo(-40, 26); g.closePath(); g.fill();
  g.restore();
  // cabeza, oreja y hocico
  g.beginPath();
  g.moveTo(-58, 30); g.lineTo(-62, -6); g.quadraticCurveTo(-58, -30, -40, -40);
  g.lineTo(-26, -96 - oreja * 6); g.quadraticCurveTo(-12, -70, -6, -46);
  g.quadraticCurveTo(18, -46, 36, -32); g.quadraticCurveTo(70, -24, 102, -18); g.quadraticCurveTo(116, -14, 112, -2);
  g.lineTo(96, 6); g.lineTo(30, 10); g.lineTo(-10, 36); g.closePath(); g.fill();
  // ojo (hueco entre los dedos)
  g.fillStyle = "rgba(255,230,170,.9)"; g.beginPath(); g.ellipse(22, -24, 7, 4.5, 0.2, 0, 6.283); g.fill();
}
/** Pato mirando a la izquierda. Origen en la muñeca. */
function pato(g, pico) {
  g.fillStyle = SOMBRA;
  // pico de abajo
  g.save(); g.translate(-34, -42); g.rotate(-pico);
  g.beginPath(); g.moveTo(4, -2); g.lineTo(-58, 2); g.quadraticCurveTo(-62, 8, -54, 10); g.lineTo(4, 10); g.closePath(); g.fill();
  g.restore();
  g.beginPath(); g.arc(0, -52, 42, 0, 6.283); g.fill();
  g.beginPath(); g.moveTo(-28, -62); g.quadraticCurveTo(-70, -66, -96, -50); g.quadraticCurveTo(-90, -40, -34, -42); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-26, -20); g.quadraticCurveTo(-10, 20, -22, 40); g.lineTo(30, 40); g.quadraticCurveTo(34, 0, 36, -30); g.closePath(); g.fill();
  g.fillStyle = "rgba(255,230,170,.9)"; g.beginPath(); g.arc(-8, -64, 6, 0, 6.283); g.fill();
}
/** Jarra de sombra con espuma. Origen en el centro. */
function jarraSombra(g, t) {
  g.fillStyle = SOMBRA;
  rectR(g, -88, -80, 176, 200, 22); g.fill();
  // asa
  g.beginPath(); g.moveTo(80, -50); g.bezierCurveTo(170, -56, 170, 92, 80, 86); g.lineTo(80, 56); g.bezierCurveTo(130, 60, 130, -20, 80, -20); g.closePath(); g.fill();
  // espuma que rebosa
  g.beginPath();
  for (let i = 0; i <= 5; i++) { const x = -88 + i * 35.2, r = 26 + 6 * Math.sin(t * 3 + i * 1.7); g.moveTo(x + r, -84); g.arc(x, -84, r, 0, 6.283); }
  g.fill();
  g.beginPath(); g.arc(-96, -40, 16, 0, 6.283); g.arc(-90, -10, 11, 0, 6.283); g.fill();
  // huecos de luz: burbujas y brillo del cristal
  g.fillStyle = "rgba(255,230,170,.9)";
  for (const [x, y, r] of [[-40, -96, 6], [20, -102, 5], [56, -90, 4]]) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
  rectR(g, -62, -40, 10, 130, 5); g.fill();
  rectR(g, -38, -30, 6, 110, 3); g.fill();
}

class Sombras extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(260);
    this.plumas = [];
  }
  luz() { return clamp((this.t - T_ON) / 0.05, 0, 1) * (this.t > T_ON + 0.1 && this.t < T_ON + 0.2 ? 0.55 : 1) * (this.t < T_OFF ? 1 : 0); }
  estado() {
    const t = this.t;
    const xM = pista(t, [[T_ACERCA, 290], [4.5, 345], [T_ÑAM - 0.12, 345], [T_ÑAM, 398, eIn], [5.4, 380], [T_PAZ, 380], [7.0, 392], [DUR, 392]]);
    const xG = pista(t, [[T_ACERCA, 734], [4.6, 690], [T_PAZ, 690], [7.0, 640], [DUR, 640]]);
    const M = { quien: "marcos", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [16, 140] };
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [58, 142], manoI: [9, 160], brazoIDelante: true };
    // pasitos cuando se mueven
    const anda = (q) => Math.abs(q(t + 0.02) - q(t - 0.02)) > 0.4;
    const fxM = (u) => pista(u, [[T_ACERCA, 290], [4.5, 345], [T_PAZ, 345], [7.0, 392]]), fxG = (u) => pista(u, [[T_ACERCA, 734], [4.6, 690], [T_PAZ, 690], [7.0, 640]]);
    let dyM = 0, dyG = 0;
    if (anda(fxM) && !(t > 4.6 && t < 5.6)) { const w = andar(t * 11, 0.8); M.piernaI = w.piernaI; M.piernaD = w.piernaD; dyM = w.bote * ESC; }
    if (anda(fxG)) { const w = andar(t * 11 + 1, 0.8); G.piernaI = w.piernaI; G.piernaD = w.piernaD; dyG = w.bote * ESC; }
    const mM = matAv(xM, PIES + dyM - (t > 4.75 && t < 5.25 ? Math.sin(tramo(t, 4.75, 5.25) * Math.PI) * 16 : 0), ESC);
    const mG = matAv(xG, PIES + dyG, ESC);
    // ---- manos (en pantalla) y figuras
    const hombroM = aPant(mM, [63, 93]), hombroG = aPant(mG, [9, 86]);
    const kM = eOut(tramo(t, T_PERRO, T_PERRO + 0.35)), kG = eOut(tramo(t, T_PATO, T_PATO + 0.35));
    let hM = mezcla([hombroM[0] + 10, hombroM[1] + 70], [hombroM[0] + 54, hombroM[1] - 56], kM);
    let hG = mezcla([hombroG[0] - 6, hombroG[1] + 90], [hombroG[0] - 70, hombroG[1] - 58], kG);
    // el perro ladra / se agazapa / salta
    hM[1] += Math.sin(t * 5) * 3 * kM;
    if (t > T_ACERCA && t < T_ÑAM) hM[1] += 12 * eInOut(tramo(t, T_ACERCA, 4.3)) * (1 - eIn(tramo(t, 4.6, T_ÑAM)));
    hG[1] += Math.sin(t * 4 + 1) * 3 * kG;
    // paz: juntan las manos en el centro
    const kPaz = eInOut(tramo(t, T_PAZ, 7.0));
    if (kPaz > 0) { hM = mezcla(hM, [hombroM[0] + 52, hombroM[1] - 50], kPaz); hG = mezcla(hG, [hombroG[0] - 64, hombroG[1] - 50], kPaz); }
    M.manoD = enAv(mM, hM);
    G.manoI = enAv(mG, hG);
    if (kG > 0.02) G.brazoIDelante = true;
    // caras
    let jaw = 0.05 + (t > T_PERRO + 0.3 && t < T_ACERCA ? Math.max(0, Math.sin((t - T_PERRO) * 9)) * 0.35 : 0);
    if (t > 4.45 && t < T_ÑAM) jaw = lerp(jaw, 0.85, eOut(tramo(t, 4.45, 4.85)));
    if (t >= T_ÑAM) jaw = 0.02 + (t > 5.65 && t < 5.9 ? 0.45 * Math.sin(tramo(t, 5.65, 5.9) * Math.PI) : 0);
    const pico = t > T_PATO + 0.45 && t < T_ACERCA ? Math.max(0, Math.sin((t - T_PATO) * 11)) * 0.32 : 0.04;
    M.cara = t > T_PERRO ? "guino" : "sonrisa";
    if (t > T_GUAU && t < 2.4) M.cara = "risa";
    if (t > T_ACERCA) { M.cara = "guino"; M.rc = 0.1; }
    if (t > T_ÑAM - 0.1) { M.cara = "risa"; M.rc = 0.06 * Math.sin(t * 9); }
    if (t > T_PAZ) { M.cara = "sonrisa"; M.rc = 0.1; }
    if (t > T_JARRA) { M.cara = t < T_JARRA + 0.35 ? "sorpresa" : "risa"; M.rc = -0.06; }
    G.cara = t > T_GUAU && t < 2.5 ? "sorpresa" : "sonrisa";
    if (t > T_PATO) G.cara = "guino";
    if (t > T_ACERCA) { G.cara = "sonrisa"; G.rc = -0.06; }
    if (t > T_ÑAM - 0.05) {
      G.cara = "sorpresa"; G.rc = -0.25 + 0.04 * Math.sin(t * 30) * (t < 5.6 ? 1 : 0);
      // se mira la mano: ¿y mi pato?
      if (t > 5.3 && t < T_PAZ) { G.manoI = mezcla(G.manoI, [-30 + 6 * Math.sin(t * 22), 92], eOut(tramo(t, 5.3, 5.5))); }
    }
    if (t > 5.95) { G.cara = "sonrisa"; G.rc = -0.1; }
    if (t > T_JARRA) { G.cara = t < T_JARRA + 0.35 ? "sorpresa" : "risa"; G.rc = 0.06; }
    return { M, G, mM, mG, hM, hG, jaw, pico, kM, kG };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("ñam", t > T_ÑAM, () => {
      temblar(12, 0.3);
      this.plumas.push({ t0: t, x: 640, y: 160 }, { t0: t + 0.3, x: 600, y: 170 });
    });
    this.una("jarra", t > T_JARRA, () => {
      temblar(14, 0.35);
      p.nueva(P.DESTELLO, 512, 260, 0, 0, 0.4, 260);
      for (let i = 0; i < 30; i++) { const a = azar(0, 6.283), v = azar(200, 520); p.nueva(P.CHISPA, 512, 250, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(7, 12)); }
    });
    if (t > T_JARRA && t < T_OFF && Math.random() < 10 * dt) p.nueva(P.PURPURINA, azar(300, 720), azar(40, 120), 0, azar(20, 60), azar(1.5, 2.5), azar(8, 14));
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  /** Cuánto se lanza el perro hacia el pato (0–1). */
  lanza(t) { return eIn(tramo(t, 4.6, T_ÑAM)) * (1 - eInOut(tramo(t, 5.15, 5.6))); }
  /** Pared iluminada (se pinta una vez). */
  pared() {
    if (CT.has("pared")) return CT.get("pared");
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    const gr = g.createRadialGradient(PARED.x, PARED.y, 30, PARED.x, PARED.y, PARED.rx);
    gr.addColorStop(0, "#fff0c8"); gr.addColorStop(0.6, "#f0cf8e"); gr.addColorStop(0.92, "#b98a4e"); gr.addColorStop(1, "rgba(120,80,40,0)");
    g.fillStyle = gr; g.beginPath(); g.ellipse(PARED.x, PARED.y, PARED.rx, PARED.ry, 0, 0, 6.283); g.fill();
    // ladrillos suaves
    g.save(); g.globalCompositeOperation = "source-atop"; g.strokeStyle = "rgba(120,80,40,.18)"; g.lineWidth = 2;
    for (let y = 20; y < 460; y += 34) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); for (let x = (y / 34) % 2 ? 0 : 40; x < W; x += 80) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 34); g.stroke(); } }
    g.restore();
    CT.set("pared", c);
    return c;
  }
  /** Brazo de sombra: banda que va de la figura hacia abajo. */
  antebrazo(g, a, b, w0, w1) {
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), nx = -Math.sin(ang), ny = Math.cos(ang);
    g.fillStyle = SOMBRA;
    g.beginPath(); g.moveTo(a[0] + nx * w0, a[1] + ny * w0); g.lineTo(b[0] + nx * w1, b[1] + ny * w1); g.lineTo(b[0] - nx * w1, b[1] - ny * w1); g.lineTo(a[0] - nx * w0, a[1] - ny * w0); g.closePath(); g.fill();
  }
  sombras(g, e, t) {
    g.save();
    g.beginPath(); g.ellipse(PARED.x, PARED.y, PARED.rx, PARED.ry, 0, 0, 6.283); g.clip();
    const kJ = t > T_JARRA ? 1 : 0;
    if (!kJ) {
      // perro (Marcos)
      if (e.kM > 0.01) {
        const s = proy(e.hM), sc = 1.08 * eBack(e.kM), lan = this.lanza(t);
        s[0] += lan * 150; s[1] -= lan * 10;
        this.antebrazo(g, [s[0] - 30, s[1] + 10], [s[0] - 150, s[1] + 330], 34, 46);
        g.save(); g.translate(s[0], s[1] - 30); g.scale(sc, sc); g.rotate(t > 4.6 && t < T_ÑAM ? -0.15 : 0);
        perro(g, e.jaw, Math.sin(t * 7));
        // bulto del pato tragado
        if (t > T_ÑAM && t < 5.6) { g.beginPath(); g.arc(-20, 20, 22 * (1 - tramo(t, 5.2, 5.6)), 0, 6.283); g.fillStyle = SOMBRA; g.fill(); }
        g.restore();
      }
      // pato (Guillermo): desaparece en la boca del perro
      if (e.kG > 0.01 && t < T_ÑAM) {
        const s = proy(e.hG), kT = eIn(tramo(t, T_ÑAM - 0.1, T_ÑAM)), sc = 1.08 * eBack(e.kG) * (1 - 0.8 * kT);
        const boc = proy(e.hM); boc[0] += this.lanza(t) * 150 + 90; boc[1] -= 30;
        s[0] = lerp(s[0], boc[0], kT); s[1] = lerp(s[1], boc[1] + 30, kT);
        this.antebrazo(g, [s[0] + 10, s[1] + 20], [s[0] + 130, s[1] + 330], 28, 42);
        g.save(); g.translate(s[0], s[1] - 10); g.scale(sc, sc);
        pato(g, e.pico);
        g.restore();
      }
    } else {
      // brazos que se juntan y la jarra
      const sM = proy(e.hM), sG = proy(e.hG);
      this.antebrazo(g, [sM[0], sM[1] + 30], [sM[0] - 120, sM[1] + 330], 34, 46);
      this.antebrazo(g, [sG[0], sG[1] + 30], [sG[0] + 120, sG[1] + 330], 34, 46);
      const k = eBack(tramo(t, T_JARRA, T_JARRA + 0.35));
      g.save(); g.translate(512, 250); g.scale(k * 0.88, k * 0.88);
      jarraSombra(g, t);
      g.restore();
    }
    // plumas que caen
    for (const pl of this.plumas) {
      const d = t - pl.t0; if (d < 0 || d > 2.5) continue;
      g.save(); g.translate(pl.x + Math.sin(d * 4) * 30, pl.y + d * 70); g.rotate(Math.sin(d * 4) * 0.6);
      g.fillStyle = SOMBRA; g.beginPath(); g.ellipse(0, 0, 18, 6, 0, 0, 6.283); g.fill();
      g.strokeStyle = SOMBRA; g.lineWidth = 2; g.beginPath(); g.moveTo(-22, 0); g.lineTo(18, 0); g.stroke();
      g.restore();
    }
    g.restore();
  }
  lampara(g) {
    // mesita
    g.fillStyle = "#2a1a10"; rectR(g, 452, 520, 120, 14, 4); g.fill();
    g.fillStyle = "#1c120a"; g.fillRect(462, 534, 10, 42); g.fillRect(552, 534, 10, 42);
    // pie y brazo
    g.fillStyle = "#3a3d44"; g.beginPath(); g.ellipse(512, 518, 30, 7, 0, 0, 6.283); g.fill();
    g.strokeStyle = "#4a4e57"; g.lineWidth = 6; g.lineCap = "round";
    g.beginPath(); g.moveTo(512, 516); g.lineTo(530, 486); g.lineTo(512, 474); g.stroke();
    // pantalla (abierta hacia arriba)
    const gr = g.createLinearGradient(486, 0, 538, 0);
    gr.addColorStop(0, "#2c2f36"); gr.addColorStop(0.5, "#5c616b"); gr.addColorStop(1, "#24262c");
    g.fillStyle = gr; g.beginPath(); g.moveTo(498, 482); g.lineTo(526, 482); g.lineTo(546, 452); g.lineTo(478, 452); g.closePath(); g.fill();
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
    if (!this._pre) { this._pre = true; titulo(); this.pared(); }
    const t = this.t, a = this.luz(), e = this.estado();
    fondo(g, "#000");
    if (a > 0) {
      g.save(); g.globalAlpha = a;
      // la pared iluminada (dorada cuando sale la jarra)
      g.drawImage(this.pared(), 0, 0);
      const oro = tramo(t, T_JARRA, T_JARRA + 0.5);
      if (oro > 0) { g.globalCompositeOperation = "lighter"; g.globalAlpha = a * 0.35 * oro; g.drawImage(BLOB2.oro, 120, 20, 784, 420); g.globalCompositeOperation = "source-over"; g.globalAlpha = a; }
      // haz de luz
      g.globalCompositeOperation = "lighter"; g.globalAlpha = a * 0.12;
      g.fillStyle = "#ffe7b0"; g.beginPath(); g.moveTo(482, 456); g.lineTo(542, 456); g.lineTo(880, 120); g.lineTo(144, 120); g.closePath(); g.fill();
      g.globalCompositeOperation = "source-over"; g.globalAlpha = a;
      this.sombras(g, e, t);
      g.globalCompositeOperation = "lighter"; g.globalAlpha = a * 0.8; g.drawImage(BLOB.amarillo, 472, 420, 80, 60);
      g.restore();
      // suelo
      g.save(); g.globalAlpha = a;
      const gs = g.createLinearGradient(0, 470, 0, H);
      gs.addColorStop(0, "#2a1c12"); gs.addColorStop(1, "#0a0604");
      g.fillStyle = gs; g.fillRect(-60, 478, W + 120, 200);
      g.fillStyle = "rgba(0,0,0,.5)";
      for (const m of [e.mM, e.mG]) { const q = aPant(m, [39, 232]); g.beginPath(); g.ellipse(q[0], PIES + 2, 52, 8, 0, 0, 6.283); g.fill(); }
      pintarAvatar(g, e.mM, e.M, t);
      pintarAvatar(g, e.mG, e.G, t);
      this.lampara(g);
      // luz de la lámpara sobre ellos
      g.globalCompositeOperation = "lighter"; g.globalAlpha = a * 0.12; g.drawImage(BLOB2.oroClaro, 160, 240, 704, 360);
      g.restore();
      this.p.dibujar(g);
    }
    // textos
    this.ono(g, "¡CLIC!", 590, 440, T_ON, 0.5, 40, "#fffdf5", 0.1);
    this.ono(g, "¡CLIC!", 590, 440, T_OFF, 0.3, 40, "#fffdf5", 0.1);
    const sp = proy(e.hG);
    this.ono(g, "CUAC", sp[0] - 120, sp[1] - 120, T_PATO + 0.5, 0.45, 44, "#fffdf5", -0.1);
    this.ono(g, "CUAC", sp[0] - 60, sp[1] - 160, T_PATO + 0.95, 0.45, 44, "#fffdf5", 0.1);
    this.ono(g, "¡ÑAM!", 560, 120, T_ÑAM, 0.7, 70, "#ff3d84", -0.08);
    this.ono(g, "¿Y MI PATO?", 760, 300, 5.4, 0.8, 34, "#fffdf5", 0.05);
    this.ono(g, "¡BURP!", 300, 120, 5.68, 0.45, 40, "#2fe3e8", -0.1);
    for (const [t0, t1] of [[T_GUAU, 2.55], [T_JARRA + 0.15, T_OFF]]) {
      if (t < t0 || t > t1) continue;
      const d = t - t0, k = tramo(d, 0, 0.15), s = lerp(2.4, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 8));
      const r = titulo(), al = Math.min(1, k * 3) * (1 - tramo(t, t1 - 0.2, t1)) * a;
      const pos = t0 === T_GUAU ? [proy(e.hM)[0] + 70, 74] : [512, 84];
      g.save(); g.globalAlpha = al; g.translate(pos[0], pos[1]); g.rotate(-0.05); g.scale(s * (t0 === T_GUAU ? 0.62 : 0.66), s * (t0 === T_GUAU ? 0.62 : 0.66));
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
  }
}

registrar({ id: "00169", nombre: "Sombras chinescas", crear: () => new Sombras() });
})();
