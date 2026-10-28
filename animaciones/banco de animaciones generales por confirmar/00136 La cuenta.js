"use strict";
/*
 * 00136 · LA CUENTA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Guillermo y Rodrigo, con la barra llena de jarras vacías, se ríen. Llega rodando el tique; Guillermo lo levanta y se
 * desenrolla desde su mano hasta el suelo (y más). Se miran y se lo pasan el uno al otro cada vez más rápido (¡TÚ!).
 * Al final lo sujetan los dos, se ríen, lo sueltan, sacan cada uno su tarjeta (genéricas, sin logos), aparece el
 * datáfono y pagan los dos a la vez: ¡PIIP! ¡A PACHAS! Chocan los cinco y se apaga la lámpara.
 */
(() => {
const ESC = 1.9, AY = 660, BARRA = 470;
const XG = 390, XR = 640, TX = 515, TW = 90;
const T_COGE = 1.4, T_DESENR = 2.7, T_JUNTOS = 5.25, T_SUELTA = 5.95, T_PIIP = 7.15;
const HG = [468, 262], HR = [562, 272], HM = [515, 280]; // dónde sujetan el tique Guillermo, Rodrigo y los dos
// pases del tique: [inicio, fin, quién lo da]
const PASES = [[3.2, 3.6, "G"], [3.8, 4.15, "R"], [4.3, 4.58, "G"], [4.72, 4.95, "R"]];
const LINEAS = [["CAÑA", "2,00"], ["CAÑA", "2,00"], ["BRAVAS", "4,50"], ["CAÑA", "2,00"], ["CROQUETA", "6,00"], ["CAÑA", "2,00"], ["CAÑA", "2,00"], ["TAPA", "3,50"], ["CAÑA", "2,00"], ["JARRA", "3,00"], ["CAÑA", "2,00"], ["OLIVAS", "2,50"], ["CAÑA", "2,00"], ["CAÑA", "2,00"], ["PINCHO", "3,00"], ["CAÑA", "2,00"], ["CAÑA", "2,00"], ["CAÑA", "2,00"], ["JARRA", "3,00"], ["CAÑA", "2,00"]];

const aAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
/** Tarjeta genérica (unidades de avatar), centrada en (x, y). */
function tarjeta(g, x, y, ang, c1, c2) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const gr = g.createLinearGradient(-9, -6, 9, 6); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
  g.fillStyle = gr; rectR(g, -9, -6, 18, 12, 1.6); g.fill();
  g.strokeStyle = "rgba(255,255,255,.5)"; g.lineWidth = 0.5; g.stroke();
  g.fillStyle = "#f0c64a"; rectR(g, -6.5, -2.6, 4.2, 3.4, 0.6); g.fill();
  g.strokeStyle = "rgba(120,80,0,.6)"; g.lineWidth = 0.3; g.beginPath(); g.moveTo(-4.4, -2.6); g.lineTo(-4.4, 0.8); g.moveTo(-6.5, -0.9); g.lineTo(-2.3, -0.9); g.stroke();
  g.fillStyle = "rgba(255,255,255,.65)"; for (let i = 0; i < 4; i++) g.fillRect(-6.5 + i * 3.3, 2.6, 2.4, 0.9);
  g.restore();
}

class Cuenta extends Escena {
  constructor() {
    super(9.8);
    this.p = new Parts(260);
    this.gotas = []; this.tus = [];
  }
  /** Dónde está la punta de arriba del tique (pantalla) y quién la sujeta ("G", "R", "GR", null). */
  punta(t) {
    if (t < 0.8) return { p: [W + 80, BARRA - 24], q: null, rollo: true };
    if (t < T_COGE) return { p: [lerp(W + 80, TX, eOut(tramo(t, 0.8, 1.3))), BARRA - 24], q: null, rollo: true };
    if (t < T_COGE + 0.25) return { p: [TX, BARRA - 24], q: "G", rollo: true };
    if (t < 3.2) return { p: mezcla([TX, BARRA - 24], HG, eInOut(tramo(t, T_COGE + 0.25, T_COGE + 0.6))), q: "G" };
    for (const [a, b, de] of PASES) {
      if (t < a) return { p: de === "G" ? HG : HR, q: de };
      if (t < b) { const u = eInOut(tramo(t, a, b)), A = de === "G" ? HG : HR, B = de === "G" ? HR : HG; return { p: [lerp(A[0], B[0], u), lerp(A[1], B[1], u) - 40 * Math.sin(u * Math.PI)], q: u < 0.5 ? de : (de === "G" ? "R" : "G"), u, de }; }
    }
    if (t < T_JUNTOS) return { p: mezcla(HG, HM, eInOut(tramo(t, 4.95, T_JUNTOS))), q: "GR" };
    if (t < T_SUELTA) return { p: HM, q: "GR" };
    return { p: [HM[0], HM[1] + 900 * Math.pow(t - T_SUELTA, 2)], q: null };
  }
  /** Largo del tique por debajo de la punta (px). */
  largo(t) { return t < T_COGE + 0.6 ? 0 : 640 * eOut(tramo(t, T_COGE + 0.6, T_DESENR)); }
  poses(t) {
    const G = { cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [64, 130], manoI: [14, 130] };
    const R = { quien: "rodrigo", cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [60, 130], manoI: [16, 130], brazoIDelante: true };
    let gG = 0, gR = 0, dyG = 0, dyR = 0;
    if (t < 1.3) { dyG = -2.5 * Math.abs(Math.sin(t * 10)); dyR = -2.5 * Math.abs(Math.sin(t * 10 + 1)); G.cara = R.cara = "risa"; }
    // llega el tique, lo coge y se desenrolla: lo miran caer
    if (t >= 1.3 && t < 3.2) {
      G.cara = R.cara = t < 1.95 ? "sonrisa" : "sorpresa";
      G.rc = 0.1; R.rc = -0.14; G.puntas = R.puntas = 0.8 * tramo(t, 2.1, 2.4);
      if (t > 2.8) { G.rc = 0.06; R.rc = -0.06; G.cara = R.cara = "guino"; } // se miran
    }
    const mG0 = matAv(XG, AY, ESC), mR0 = matAv(XR, AY, ESC);
    const pu = this.punta(t);
    const aMano = (m, q) => aAv(m, [q[0], q[1] - 7]);
    // quien lo sujeta tiene la mano en la punta; el otro, en reposo (o yendo a cogerlo)
    if (pu.q === "G" || pu.q === "GR") G.manoD = aMano(mG0, pu.p);
    if (pu.q === "R" || pu.q === "GR") R.manoI = aMano(mR0, pu.p);
    if (t > T_COGE - 0.25 && t < T_COGE) G.manoD = mezcla([64, 130], aMano(mG0, [TX, BARRA - 24]), eInOut(tramo(t, T_COGE - 0.25, T_COGE)));
    for (const [a, b, de] of PASES) {
      // el que recibe alarga la mano un poco antes
      const k = eInOut(tramo(t, a, a + (b - a) * 0.5)) * (t < b ? 1 : 0);
      if (k > 0 && pu.q === de) {
        if (de === "G") R.manoI = mezcla([16, 130], aMano(mR0, pu.p), k);
        else G.manoD = mezcla([64, 130], aMano(mG0, pu.p), k);
      }
      // el que lo da suelta y retira la mano
      const kr = eInOut(tramo(t, a + (b - a) * 0.5, b + 0.15));
      if (t > a + (b - a) * 0.5 && t < b + 0.15) {
        if (de === "G") G.manoD = mezcla(aMano(mG0, [TX, HG[1] - 20]), [64, 130], kr);
        else R.manoI = mezcla(aMano(mR0, [TX, HR[1] - 20]), [16, 130], kr);
      }
      if (t > a - 0.05 && t < b + 0.3) {
        if (de === "G") { G.cara = "guino"; R.cara = "sorpresa"; gG = 0.04; } else { R.cara = "guino"; G.cara = "sorpresa"; gR = -0.04; }
      }
    }
    if (t > 3.2 && t < T_JUNTOS) { G.puntas = R.puntas = 0.4; }
    // lo sujetan los dos, se miran y se ríen
    if (t >= 4.95 && t < T_SUELTA + 0.1) {
      G.manoD = mezcla([64, 130], aMano(mG0, [HM[0] - 12, HM[1]]), eInOut(tramo(t, 4.95, T_JUNTOS)));
      R.manoI = mezcla(aMano(mR0, HG), aMano(mR0, [HM[0] + 12, HM[1]]), eInOut(tramo(t, 4.95, T_JUNTOS)));
      G.cara = R.cara = t < 5.5 ? "sonrisa" : "risa"; G.rc = 0.08; R.rc = -0.08; G.puntas = R.puntas = 0;
    }
    // sacan las tarjetas y pagan a la vez
    if (t >= T_SUELTA) {
      const kS = eInOut(tramo(t, T_SUELTA, 6.3)), kP = eInOut(tramo(t, 6.6, 7.0)), kF = eInOut(tramo(t, 7.45, 7.7));
      const sobre = BARRA - 128;
      const desdeG = aMano(mG0, [HM[0] - 12, HM[1]]), desdeR = aMano(mR0, [HM[0] + 12, HM[1]]);
      G.manoD = mezcla(mezcla(desdeG, [74, 100], kS), aAv(mG0, [TX - 26, sobre]), kP);
      R.manoI = mezcla(mezcla(desdeR, [4, 104], kS), aAv(mR0, [TX + 26, sobre]), kP);
      G.cara = R.cara = t < 6.6 ? "guino" : t < T_PIIP ? "sonrisa" : "risa";
      // chocan los cinco
      const choque = [TX, 330];
      if (kF > 0) {
        G.manoD = mezcla(G.manoD, aAv(mG0, [choque[0] - 14, choque[1]]), kF);
        R.manoI = mezcla(R.manoI, aAv(mR0, [choque[0] + 14, choque[1]]), kF);
        gG = 0.05 * kF; gR = -0.05 * kF;
      }
      if (t > 7.9) { dyG = -2.5 * Math.abs(Math.sin(t * 10)); dyR = -2.5 * Math.abs(Math.sin(t * 10 + 1)); G.rc = 0.05 * Math.sin(t * 10); R.rc = -0.05 * Math.sin(t * 10 + 1); }
      if (kF < 0.5 && t > 6.05) {
        G.objD2 = (g, m) => tarjeta(g, m[0] + 3, m[1] - 5, -0.25, "#2bff5b", "#0d6b2a");
        R.objI2 = (g, m) => tarjeta(g, m[0] - 3, m[1] - 5, 0.25, "#ffd34d", "#a0620a");
      }
    }
    return { G, mG: matAv(XG, AY + dyG, ESC, gG), R, mR: matAv(XR, AY + dyR, ESC, gR), pu };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("llega", t > 1.3, () => temblar(4, 0.12));
    for (const [i, [a, , q]] of PASES.entries()) this.una("tu" + i, t > a, () => { this.tus.push({ t0: t, q }); temblar(4, 0.1); });
    if (t > 2.2 && t < 3.3 && Math.random() < 6 * dt) {
      const e = this.poses(t), a = Math.random() < 0.5, q = aPant(a ? e.mG : e.mR, [a ? 8 : 68, 30]);
      this.gotas.push({ x: q[0], y: q[1], vx: (a ? -1 : 1) * azar(30, 90), vy: azar(-160, -60), v: 0.7 });
    }
    for (const d of this.gotas) { d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.v -= dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    this.una("datafono", t > 6.3, () => { for (let i = 0; i < 10; i++) p.nueva(P.POLVO, TX + azar(-40, 40), BARRA - 8, azar(-160, 160), azar(-60, -10), azar(0.4, 0.7), azar(16, 26)); });
    this.una("piip", t > T_PIIP, () => {
      temblar(10, 0.25);
      p.nueva(P.DESTELLO, TX, BARRA - 110, 0, 0, 0.4, 240);
      for (let i = 0; i < 30; i++) { const a = azar(0, 6.283), v = azar(200, 500); p.nueva(P.CHISPA, TX, BARRA - 120, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(7, 12)); }
    });
    this.una("cinco", t > 7.68, () => {
      temblar(14, 0.3);
      p.nueva(P.DESTELLO, TX, 330, 0, 0, 0.35, 200);
      for (let i = 0; i < 40; i++) p.nueva(P.CONFETI, TX + azar(-60, 60), 320 + azar(-30, 30), azar(-300, 300), azar(-420, -120), azar(1.4, 2.2), azar(9, 14), (Math.random() * 5) | 0);
    });
    p.suelo = () => BARRA - 6;
    p.actualizar(dt);
  }
  barra(g) {
    const gf = this.grBarra || (this.grBarra = (() => { const gr = g.createLinearGradient(0, BARRA, 0, H); gr.addColorStop(0, "#5a3218"); gr.addColorStop(1, "#24130a"); return gr; })());
    g.fillStyle = gf; g.fillRect(-60, BARRA + 10, W + 120, H - BARRA + 60);
    g.fillStyle = "rgba(0,0,0,.35)";
    for (let x = 30; x < W; x += 96) g.fillRect(x, BARRA + 18, 3, H - BARRA);
    g.fillStyle = "rgba(255,210,150,.06)"; g.fillRect(-60, BARRA + 70, W + 120, 4);
    g.fillStyle = "#b8862d"; g.fillRect(-60, 556, W + 120, 9); g.fillStyle = "rgba(255,240,190,.6)"; g.fillRect(-60, 557, W + 120, 2);
    g.fillStyle = "#8a5426"; g.fillRect(-60, BARRA - 6, W + 120, 18);
    g.fillStyle = "rgba(255,220,170,.4)"; g.fillRect(-60, BARRA - 6, W + 120, 3);
    g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(-60, BARRA + 12, W + 120, 5);
  }
  papel() {
    if (this._papel) return this._papel;
    const c = lienzoNuevo(TW, 640), g = c.getContext("2d");
    g.fillStyle = "#fbf8ef"; g.fillRect(0, 0, TW, 640);
    g.fillStyle = "rgba(0,0,0,.06)"; g.fillRect(0, 0, 4, 640); g.fillRect(TW - 4, 0, 4, 640);
    txt(g, "TIQUE", TW / 2, 22, { tam: 14, peso: 800, fam: FT, color: "#333", esp: 2 });
    g.fillStyle = "#999"; for (let x = 6; x < TW - 6; x += 4) g.fillRect(x, 30, 2, 1);
    LINEAS.forEach(([a, b], i) => {
      const y = 46 + i * 19;
      txt(g, a, 7, y, { tam: 9.5, peso: 600, fam: FT, color: "#444", alin: "left" });
      txt(g, b, TW - 7, y, { tam: 9.5, peso: 600, fam: FT, color: "#444", alin: "right" });
    });
    g.fillStyle = "#999"; for (let x = 6; x < TW - 6; x += 4) g.fillRect(x, 440, 2, 1);
    txt(g, "SIGUE…", TW / 2, 460, { tam: 11, peso: 800, fam: FT, color: "#666" });
    for (let i = 0; i < 9; i++) { const y = 480 + i * 19; txt(g, "CAÑA", 7, y, { tam: 9.5, peso: 600, fam: FT, color: "#444", alin: "left" }); txt(g, "2,00", TW - 7, y, { tam: 9.5, peso: 600, fam: FT, color: "#444", alin: "right" }); }
    return (this._papel = c);
  }
  tique(g, t) {
    const pu = this.punta(t), [x, y] = pu.p, L = this.largo(t);
    // el rollo que llega rodando por la barra (y que sube a la mano)
    if (pu.rollo || L < 1) {
      const r = 18, rot = (W + 80 - x) / r;
      g.save(); g.translate(x, y + 6); g.rotate(rot);
      g.fillStyle = "#fbf8ef"; g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.fill();
      g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 1.5; for (const rr of [6, 11, 15]) { g.beginPath(); g.arc(0, 0, rr, 0, 5); g.stroke(); }
      g.restore();
      return;
    }
    // la tira colgando de la mano (se balancea al pasarlo)
    const x0 = this.punta(t - 0.06).p[0];
    const sw = clamp((x - x0) * -0.006, -0.25, 0.25) + 0.02 * Math.sin(t * 2.3);
    g.save(); g.translate(x, y); g.rotate(sw);
    g.fillStyle = "rgba(0,0,0,.3)"; g.fillRect(-TW / 2 + 5, 4, TW, L);
    g.drawImage(this.papel(), 0, 0, TW, L, -TW / 2, 0, TW, L);
    // el rollo que baja desenrollándose
    if (L < 639) {
      const r = 16;
      g.fillStyle = "#fbf8ef"; g.beginPath(); g.ellipse(0, L, TW / 2 + 2, r, 0, 0, 6.283); g.fill();
      g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 1.5; g.beginPath(); g.ellipse(0, L, TW / 2 - 4, r * 0.6, 0, 0, 6.283); g.stroke();
    }
    g.restore();
  }
  datafono(g, t) {
    const k = eBack(tramo(t, 6.3, 6.55));
    if (k <= 0) return;
    const pag = t > T_PIIP;
    g.save(); g.translate(TX, BARRA - 6); g.scale(k, k);
    const gr = g.createLinearGradient(-40, 0, 40, 0); gr.addColorStop(0, "#22262c"); gr.addColorStop(0.5, "#3b414b"); gr.addColorStop(1, "#1d2025");
    g.fillStyle = gr; rectR(g, -38, -118, 76, 118, 12); g.fill();
    g.fillStyle = "#0b1a0f"; rectR(g, -28, -106, 56, 36, 5); g.fill();
    txt(g, pag ? "OK" : "73,50", pag ? 8 : 0, -82, { tam: 17, peso: 800, color: "#2bff5b", glow: "rgba(43,255,91,.8)", glowTam: 8 });
    if (pag) { g.strokeStyle = "#2bff5b"; g.lineWidth = 3; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); g.moveTo(-20, -90); g.lineTo(-15, -84); g.lineTo(-6, -97); g.stroke(); }
    g.fillStyle = "#555c66"; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { rectR(g, -24 + c * 18, -60 + r * 15, 12, 9, 2); g.fill(); }
    // ondas sin contacto
    g.strokeStyle = pag ? "#2bff5b" : "rgba(255,255,255,.55)"; g.lineWidth = 2.5; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(-4, -128, 6 + i * 6, -0.9, 0.9); g.stroke(); }
    if (pag) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = Math.max(0, 1 - (t - T_PIIP) * 1.2) * 0.8; g.drawImage(BLOB.verde, -70, -190, 140, 140); g.restore(); }
    g.restore();
  }
  dibujar(g) {
    if (!this._tit) this.titulo(); // se prepara en el primer cuadro (negro), no en el remate
    if (!this._papel) this.papel();
    const t = this.t, e = this.poses(t);
    fondo(g, "#000");
    const luz = tramo(t, 0, 0.4) * (1 - tramo(t, 9.15, 9.75));
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.4 * luz;
    g.drawImage(BLOB2.oroClaro, 100, 30, 824, 540); g.restore();
    // jarras vacías de toda la tarde
    for (const [x, s] of [[110, 1.9], [190, 1.7], [270, 1.8], [770, 1.8], [850, 1.7], [930, 1.9]]) {
      g.save(); g.translate(x, BARRA - 4); g.scale(s, s);
      dibujarJarra(g, [0, -18], 0, 0.03, "asa", t); dibujarJarra(g, [0, -18], 0, 0.03, "cuerpo", t);
      g.restore();
    }
    pintarAvatar(g, e.mR, e.R, t);
    pintarAvatar(g, e.mG, e.G, t);
    this.barra(g);
    this.tique(g, t);
    this.datafono(g, t);
    this.p.dibujar(g);
    g.fillStyle = "#bfe9ff";
    for (const d of this.gotas) { g.beginPath(); g.ellipse(d.x, d.y, 4, 6, 0, 0, 6.283); g.fill(); }
    // RRRRR del tique
    if (t > T_COGE + 0.6 && t < T_DESENR) txt(g, "RRRRRR…", TX + 150, 420, { tam: 34, peso: 400, fam: FC, color: "#fffdf5", borde: "#222", bordeAncho: 6, alfa: 1 - tramo(t, T_DESENR - 0.3, T_DESENR), esp: 2 });
    // ¡TÚ!
    for (const s of this.tus) {
      const d = t - s.t0; if (d > 0.5) continue;
      const m = s.q === "G" ? e.mG : e.mR, q = aPant(m, [39, -6]);
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(q[0] + (s.q === "G" ? -60 : 60), q[1] - 10); g.scale(k, k); g.rotate(s.q === "G" ? -0.12 : 0.12);
      txt(g, "¡TÚ!", 0, 0, { tam: 44, peso: 400, fam: FC, color: "#fffdf5", borde: "#7a0008", bordeAncho: 7, alfa: 1 - tramo(d, 0.35, 0.5), esp: 2 });
      g.restore();
    }
    // ¡PIIP!
    if (t > T_PIIP && t < T_PIIP + 0.8) {
      const k = tramo(t, T_PIIP, T_PIIP + 0.1);
      g.save(); g.translate(TX + 150, BARRA - 150); g.rotate(0.1); g.scale(eBack(k), eBack(k));
      txt(g, "¡PIIP!", 0, 0, { tam: 54, peso: 400, fam: FC, color: "#2bff5b", borde: "#06331a", bordeAncho: 8, alfa: 1 - tramo(t, T_PIIP + 0.6, T_PIIP + 0.8), esp: 2 });
      g.restore();
    }
    // ¡A PACHAS!
    if (t > T_PIIP + 0.25) {
      const d = t - T_PIIP - 0.25, k = tramo(d, 0, 0.17), s = lerp(2.6, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * luz; g.translate(512, 105); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    if (luz < 1) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (this._tit) return this._tit;
    const c = lienzoNuevo(820, 220), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 50, 0, 160);
    gr.addColorStop(0, "#f2fff4"); gr.addColorStop(0.5, "#7dff9a"); gr.addColorStop(1, "#1fc94a");
    txt(g, "¡A PACHAS!", 410, 160, { tam: 140, peso: 900, fam: FD, color: gr, borde: "#06331a", bordeAncho: 12, esp: 5, glow: "rgba(43,255,91,.7)", glowTam: 24, max: 780 });
    return (this._tit = c);
  }
}

registrar({ id: "00136", nombre: "La cuenta", crear: () => new Cuenta() });
})();
