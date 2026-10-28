"use strict";
/*
 * 00231 · RESCATE DEL BARRIL
 *
 * Animación del banco. Empieza y acaba en negro.
 * Un barril se ha quedado atascado en la trampilla de la bodega del bar. Guillermo tira de él y nada (¡NGHH!). Marcos,
 * de uniforme, planta un trípode con polea (¡CLONC!), engancha el barril y tiran los dos de la cuerda: ¡AÚPA!, ¡AÚPA!…
 * ¡PLOP! El barril sale disparado por los aires, ellos se caen de culo y el barril aterriza de pie junto a Guillermo,
 * que lo abraza con corazones: ¡RESCATADO! Fundido a negro.
 */
(() => {
const CT = cacheTexto();
const DUR = 9.9, ESC = 1.45;
const HX = 372, HY = 566;                           // la trampilla (centro del hueco)
const AP = [HX, 136], RUEDA = 14;                   // el trípode: vértice y polea
const BW = 136, BH = 168;                           // el barril
const HUNDE = 64;                                   // cuánto se mete en el hueco atascado
const T_TIRA0 = 0.45, T_QUITA = 1.35, T_TRIPODE = 1.5, T_CLONC = 1.85, T_GANCHO = 2.05, T_AGARRAN = 2.5;
const TIRONES = [2.85, 3.55, 4.25], T_PLOP = 4.75, T_ATERRIZA = 5.95, T_LEVANTAN = 6.25, T_TIT = 6.45, T_ABRAZA = 6.75, T_APAGA = 9.35;
const XG0 = 452, XG1 = 760, XM0 = 640, XM1 = 600, XB = 930;
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

// ------------------------------------------------------------------------------------------- dibujo
/** Barril: (x, y) = centro; gira `ang`. */
function barril(g, x, y, ang, sx = 1, sy = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(sx, sy);
  const w = BW / 2, h = BH / 2, b = 9;
  const cuerpo = () => {
    g.beginPath(); g.moveTo(-w + b, -h); g.quadraticCurveTo(-w - b, 0, -w + b, h); g.lineTo(w - b, h); g.quadraticCurveTo(w + b, 0, w - b, -h); g.closePath();
  };
  const gr = g.createLinearGradient(-w, 0, w, 0);
  gr.addColorStop(0, "#4a2610"); gr.addColorStop(0.35, "#b8743a"); gr.addColorStop(0.55, "#d8945a"); gr.addColorStop(1, "#3a1c0a");
  cuerpo(); g.fillStyle = gr; g.fill();
  g.save(); cuerpo(); g.clip();
  g.strokeStyle = "rgba(60,30,10,.55)"; g.lineWidth = 2;
  for (let i = -3; i <= 3; i++) { const xx = i * (w / 3.6); g.beginPath(); g.moveTo(xx * 0.86, -h); g.quadraticCurveTo(xx * 1.12, 0, xx * 0.86, h); g.stroke(); }
  for (const yy of [-h + 16, -h * 0.28, h * 0.28, h - 16]) {
    g.fillStyle = "#3a3e44"; g.fillRect(-w - b, yy - 5, BW + 2 * b, 10);
    g.fillStyle = "rgba(255,255,255,.28)"; g.fillRect(-w - b, yy - 5, BW + 2 * b, 2.5);
  }
  g.restore();
  // tapa
  g.fillStyle = "#8a5426"; g.beginPath(); g.ellipse(0, -h, w - b + 1, 9, 0, 0, 6.283); g.fill();
  g.strokeStyle = "#3a3e44"; g.lineWidth = 3; g.stroke();
  g.strokeStyle = "rgba(60,30,10,.5)"; g.lineWidth = 1.5; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 14, -h - 7); g.lineTo(i * 14, -h + 7); g.stroke(); }
  g.fillStyle = "#c8a040"; g.fillRect(-6, -h - 10, 12, 4);
  g.strokeStyle = "#8a9098"; g.lineWidth = 3; g.beginPath(); g.arc(0, -h - 14, 6, 0, 6.283); g.stroke();
  g.restore();
}
function trampilla(g) {
  // hueco oscuro en el suelo y la tapa abierta apoyada detrás
  g.fillStyle = "#4a2c16"; g.beginPath(); g.moveTo(HX - 92, HY - 22); g.lineTo(HX + 92, HY - 22); g.lineTo(HX + 82, HY - 62); g.lineTo(HX - 82, HY - 62); g.closePath(); g.fill();
  g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = 2;
  for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(HX + i * 36, HY - 22); g.lineTo(HX + i * 32, HY - 62); g.stroke(); }
  g.fillStyle = "#9aa2aa"; g.fillRect(HX - 60, HY - 26, 12, 6); g.fillRect(HX + 48, HY - 26, 12, 6);
  g.fillStyle = "#050302"; g.beginPath(); g.moveTo(HX - 98, HY - 20); g.lineTo(HX + 98, HY - 20); g.lineTo(HX + 108, HY + 22); g.lineTo(HX - 108, HY + 22); g.closePath(); g.fill();
  g.strokeStyle = "#6a3e1c"; g.lineWidth = 5; g.stroke();
}
function cuerda(g, pts) {
  g.save(); g.lineJoin = "round"; g.lineCap = "round";
  for (const [w, c] of [[6.5, "#7a5420"], [4.2, "#e0b870"]]) {
    g.lineWidth = w; g.strokeStyle = c; g.beginPath();
    pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke();
  }
  g.lineWidth = 1.2; g.strokeStyle = "rgba(122,84,32,.7)"; g.setLineDash([3, 4]); g.beginPath();
  pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke(); g.setLineDash([]);
  g.restore();
}
function corazon(g, x, y, s, a) {
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s);
  g.fillStyle = "#ff3d84";
  g.beginPath(); g.moveTo(0, 6); g.bezierCurveTo(-12, -2, -8, -12, 0, -5); g.bezierCurveTo(8, -12, 12, -2, 0, 6); g.fill();
  g.fillStyle = "rgba(255,255,255,.5)"; g.beginPath(); g.ellipse(-4, -5, 2.2, 1.4, -0.5, 0, 6.283); g.fill();
  g.restore();
}

class RescateBarril extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(360);
    this.cF = null;
  }
  luz() { return tramo(this.t, 0, 0.45) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** Cuánto ha subido el barril con los tirones (px). */
  subida(t) {
    let s = 0;
    for (const ti of TIRONES) s += 13 * eOut(tramo(t, ti, ti + 0.25)) - 3 * eIn(tramo(t, ti + 0.35, ti + 0.6));
    return s;
  }
  /** Fuerza de cada tirón (0–1). */
  tiron(t) { let k = 0; for (const ti of TIRONES) k = Math.max(k, Math.sin(Math.PI * tramo(t, ti - 0.1, ti + 0.5))); return k; }
  /** El barril: { x, y, ang, atascado }. */
  barrilEn(t) {
    const y0 = HY + HUNDE - BH / 2;
    if (t < T_PLOP) {
      const sac = t < T_TIRA0 + 0.9 && t > T_TIRA0 ? 0.02 * Math.sin(t * 40) : 0;
      return { x: HX, y: y0 - this.subida(t), ang: 0.08 + sac + 0.03 * this.tiron(t), atascado: true };
    }
    if (t < T_ATERRIZA) {
      const u = tramo(t, T_PLOP, T_ATERRIZA), yA = y0 - this.subida(T_PLOP), yF = PIES - BH / 2;
      return { x: lerp(HX, XB, u), y: lerp(yA, yF, u) - 620 * 4 * u * (1 - u) * 0.9 + (u > 0.5 ? 0 : 0), ang: 0.08 + 6.283 * eInOut(u) - 0.08 * u, atascado: false };
    }
    const d = t - T_ATERRIZA, bote = Math.abs(Math.sin(d * 10)) * 30 * Math.exp(-d * 5);
    const aplasta = d < 0.15 ? 1 - 0.18 * Math.sin((d / 0.15) * Math.PI) : 1;
    return { x: XB, y: PIES - (BH / 2) * aplasta - bote, ang: 0, atascado: false, sy: aplasta };
  }
  tripodeY(t) { if (t < T_TRIPODE) return -720; if (t < T_CLONC) return lerp(-720, 0, eIn(tramo(t, T_TRIPODE, T_CLONC))); return -Math.abs(Math.sin((t - T_CLONC) * 14)) * 14 * Math.exp(-(t - T_CLONC) * 8); }
  // ------------------------------------------------------------------ poses
  poses() {
    const t = this.t, b = this.barrilEn(t), tir = this.tiron(t);
    const G = { cara: "dormido", rc: 0.1, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    const M = { quien: "bombero", cara: "sonrisa", rc: -0.1, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let xg = XG0, yg = PIES, gg = 0, sg = 1, xm = XM0 + 60, ym = PIES, gm = 0, sm = 1;
    const tapa = [b.x, b.y - BH / 2];
    let manosG = null, manosM = null;
    // 1 · Guillermo intenta sacarlo a pelo
    if (t < T_QUITA + 0.3) {
      const f = Math.sin(t * 34) * (t > T_TIRA0 ? 1 : 0);
      gg = 0.07 + 0.02 * f; sg = 0.9; G.cara = t > T_TIRA0 ? "dormido" : "sonrisa"; G.rc = 0.1 + 0.03 * f; G.puntas = t > T_TIRA0 ? 0.35 : 0;
      G.piernaI = [-6, 0.16]; G.piernaD = [-6, -0.16];
      manosG = [[tapa[0] + 30, tapa[1] + 2], [tapa[0] + 64, tapa[1] + 8]];
      M.cara = "sonrisa"; M.manoD = [24, 112]; M.manoI = [50, 112]; M.rc = -0.12;
      if (t > T_QUITA - 0.3) { M.cara = "guino"; M.manoD = [78, 40]; M.manoI = [2, 150]; }
    }
    // 2 · se aparta; el trípode cae en su sitio; Marcos va a su puesto
    if (t >= T_QUITA + 0.3 && t < T_AGARRAN) {
      const u = tramo(t, T_QUITA + 0.3, T_AGARRAN);
      xg = lerp(XG0, XG1, eInOut(u)); const a = andar(t * 15, 1); G.piernaI = a.piernaI; G.piernaD = a.piernaD; yg += a.bote;
      G.cara = t < T_CLONC + 0.1 ? "sorpresa" : "risa"; G.rc = 0;
      xm = lerp(XM0 + 60, XM1, eInOut(u));
      M.manoD = [84, 36]; M.manoI = [2, 150]; M.cara = "risa";
      if (t > T_GANCHO) { M.manoD = [80, 120]; M.cara = "guino"; }
    }
    // 3 · tiran de la cuerda
    const linea = (q, x) => {
      // las dos manos sobre la cuerda (pantalla)
      const ly = 398 - 8 * tir;
      return [[x - 44 - 6 * tir, ly], [x + 26, ly + 14]];
    };
    if (t >= T_AGARRAN && t < T_PLOP) {
      xg = XG1 + 22 * tir; xm = XM1 + 22 * tir;
      gg = 0.1 + 0.16 * tir; gm = 0.1 + 0.16 * tir;
      G.cara = tir > 0.3 ? "dormido" : "sonrisa"; M.cara = tir > 0.3 ? "dormido" : "guino";
      G.rc = 0.06; M.rc = 0.06;
      G.piernaI = [-4 * tir, -0.18 * tir]; M.piernaI = [-4 * tir, -0.18 * tir];
      manosG = linea(0, xg); manosM = linea(1, xm);
      G.puntas = 0.4 * tir;
    }
    // 4 · ¡PLOP! se caen de culo
    if (t >= T_PLOP) {
      const k = eOut(tramo(t, T_PLOP, T_PLOP + 0.25)), lev = eInOut(tramo(t, T_LEVANTAN, T_LEVANTAN + 0.35));
      xg = XG1 + 22 + 60 * k; xm = XM1 + 22 + 16 * k;
      const sentado = k * (1 - lev);
      sg = 1 - 0.38 * sentado; sm = 1 - 0.38 * sentado; gg = 0.1 * sentado; gm = 0.1 * sentado;
      G.piernaI = [-14 * sentado, 0.7 * sentado]; G.piernaD = [-14 * sentado, -0.7 * sentado];
      M.piernaI = [-14 * sentado, 0.7 * sentado]; M.piernaD = [-14 * sentado, -0.7 * sentado];
      G.cara = "sorpresa"; M.cara = "sorpresa"; G.rc = -0.15 * k; M.rc = -0.15 * k;
      G.manoD = mezcla([96, 60], [100, 150], tramo(t, T_PLOP + 0.2, T_PLOP + 0.35)); G.manoI = mezcla([-18, 60], [-22, 150], tramo(t, T_PLOP + 0.2, T_PLOP + 0.35));
      M.manoD = mezcla([80, 60], [92, 146], tramo(t, T_PLOP + 0.2, T_PLOP + 0.35)); M.manoI = mezcla([-6, 60], [-18, 146], tramo(t, T_PLOP + 0.2, T_PLOP + 0.35));
      if (t > T_PLOP + 0.3) { G.rc = 0.25 * Math.sin((t - T_PLOP) * 3); M.rc = G.rc; }   // siguen el barril con la mirada
      if (t > T_ATERRIZA) { G.cara = "sorpresa"; M.cara = "risa"; G.rc = 0.15; M.rc = 0.2; }
      if (t > T_LEVANTAN) {
        // Marcos se levanta y aplaude; Guillermo va a abrazar su barril
        M.cara = "risa"; M.rc = 0.06 * Math.sin(t * 9);
        const ap = Math.abs(Math.sin(t * 13));
        M.manoD = mezcla([92, 146], [48, 104 - 4 * ap], lev); M.manoI = mezcla([-18, 146], [24 + 6 * ap, 104], lev);
        xm = lerp(XM1 + 38, XM1 + 10, lev);
        const u = tramo(t, T_LEVANTAN + 0.2, T_ABRAZA);
        xg = lerp(XG1 + 82, 838, eInOut(u));
        if (u > 0 && u < 1) { const a = andar(t * 15, 1); G.piernaI = a.piernaI; G.piernaD = a.piernaD; yg += a.bote; }
        G.cara = "risa"; G.manoD = mezcla([100, 150], [86, 80], lev); G.manoI = mezcla([-22, 150], [-10, 100], lev);
      }
      if (t > T_ABRAZA) {
        const k2 = eInOut(tramo(t, T_ABRAZA, T_ABRAZA + 0.3));
        const mG = matAv(838, PIES, ESC, 0.12 * k2);
        G.manoD = mezcla([86, 80], enAv(mG, [XB + 6, PIES - BH + 10]), k2); G.manoI = mezcla([-10, 100], enAv(mG, [XB - 50, PIES - BH * 0.45]), k2);
        G.brazoIDelante = true; gg = 0.12 * k2; G.rc = 0.24 * k2 + 0.03 * Math.sin(t * 4); G.cara = Math.floor(t * 1.2) % 3 === 2 ? "risa" : "dormido";
      }
    }
    const mG = matAv(xg, yg, ESC, gg, 1, sg), mM = matAv(xm, ym, ESC, gm, 1, sm);
    if (manosG) { G.manoI = enAv(mG, manosG[0]); G.manoD = enAv(mG, manosG[1]); }
    if (manosM) { M.manoI = enAv(mM, manosM[0]); M.manoD = enAv(mM, manosM[1]); }
    return { G, M, mG, mM, manosG, manosM };
  }
  // ------------------------------------------------------------------ actualizar
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("clonc", t > T_CLONC, () => { temblar(14, 0.3); for (let i = 0; i < 16; i++) p.nueva(P.POLVO, HX + azar(-130, 130), PIES - 4, azar(-140, 140), azar(-50, -5), azar(0.5, 0.9), azar(26, 44)); });
    this.una("gancho", t > T_GANCHO + 0.3, () => { p.nueva(P.DESTELLO, HX, this.barrilEn(t).y - BH / 2 - 14, 0, 0, 0.25, 70); });
    for (const ti of TIRONES) this.una("t" + ti, t > ti, () => {
      temblar(6, 0.15);
      const b = this.barrilEn(t);
      for (let i = 0; i < 6; i++) p.nueva(P.POLVO, b.x + azar(-60, 60), HY - 10, azar(-60, 60), azar(-60, -20), azar(0.5, 0.8), azar(18, 30));
    });
    this.una("plop", t > T_PLOP, () => {
      temblar(22, 0.5);
      p.nueva(P.DESTELLO, HX, HY - 40, 0, 0, 0.4, 260);
      for (let i = 0; i < 26; i++) p.nueva(P.POLVO, HX + azar(-90, 90), HY - azar(0, 40), azar(-260, 260), azar(-260, -40), azar(0.6, 1.1), azar(30, 56));
      for (let i = 0; i < 18; i++) p.nueva(P.CHISPA, HX + azar(-40, 40), HY - 60, azar(-200, 200), azar(-500, -200), azar(0.4, 0.8), azar(6, 10));
    });
    this.una("cae", t > T_PLOP + 0.25, () => { temblar(8, 0.2); for (const x of [XG1 + 82, XM1 + 38]) for (let i = 0; i < 8; i++) p.nueva(P.POLVO, x + azar(-50, 50), PIES - 4, azar(-90, 90), azar(-40, -5), azar(0.5, 0.8), azar(22, 36)); });
    this.una("aterriza", t > T_ATERRIZA, () => {
      temblar(18, 0.4);
      for (let i = 0; i < 18; i++) p.nueva(P.POLVO, XB + azar(-70, 70), PIES - 4, azar(-200, 200), azar(-60, -5), azar(0.6, 1), azar(30, 50));
    });
    this.una("tit", t > T_TIT, () => {
      temblar(14, 0.35);
      for (let i = 0; i < 80; i++) p.nueva(P.CONFETI, azar(30, W - 30), azar(-80, -10), azar(-40, 40), azar(0, 120), azar(2.4, 3.4), azar(9, 15), i % 5);
    });
    p.suelo = () => PIES;
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  // ------------------------------------------------------------------ fondo
  fondoBodega() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gr = g.createLinearGradient(0, -60, 0, H);
    gr.addColorStop(0, "#1a100a"); gr.addColorStop(0.7, "#2a1a10"); gr.addColorStop(1, "#1a0e08");
    g.fillStyle = gr; g.fillRect(-60, -60, W + 120, H + 120);
    // ladrillos
    g.strokeStyle = "rgba(0,0,0,.28)"; g.lineWidth = 2;
    for (let y = 0, f = 0; y < 520; y += 34, f++) {
      g.beginPath(); g.moveTo(-60, y); g.lineTo(W + 60, y); g.stroke();
      for (let x = (f % 2) * 50 - 60; x < W + 60; x += 100) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 34); g.stroke(); }
    }
    // barriles apilados al fondo y una pizarra
    const bar = (x, y, s) => {
      const gb = g.createLinearGradient(x - 46 * s, 0, x + 46 * s, 0);
      gb.addColorStop(0, "#3a2010"); gb.addColorStop(0.5, "#8a5426"); gb.addColorStop(1, "#3a2010");
      g.fillStyle = gb; g.beginPath(); g.ellipse(x, y, 46 * s, 40 * s, 0, 0, 6.283); g.fill();
      g.strokeStyle = "#2a2e33"; g.lineWidth = 4 * s; g.beginPath(); g.ellipse(x, y, 30 * s, 40 * s, 0, 0, 6.283); g.stroke();
      g.fillStyle = "#5a3218"; g.beginPath(); g.ellipse(x, y, 16 * s, 14 * s, 0, 0, 6.283); g.fill();
    };
    for (const [x, y] of [[740, 470], [830, 470], [920, 470], [785, 400], [875, 400], [830, 330]]) bar(x, y, 1);
    g.fillStyle = "#4a2c18"; rectR(g, 600, 120, 160, 110, 6); g.fill();
    g.fillStyle = "#1f2b25"; g.fillRect(610, 130, 140, 90);
    txt(g, "BODEGA", 680, 188, { tam: 34, peso: 400, fam: FB, color: "#f6f4ec" });
    // suelo
    const gs = g.createLinearGradient(0, 515, 0, H);
    gs.addColorStop(0, "#4a2c16"); gs.addColorStop(1, "#24140a");
    g.fillStyle = gs; g.fillRect(-60, 515, W + 120, H - 515 + 60);
    g.strokeStyle = "rgba(0,0,0,.3)"; g.lineWidth = 2;
    for (let i = -8; i <= 8; i++) { g.beginPath(); g.moveTo(512 + i * 70, 515); g.lineTo(512 + i * 150, H + 60); g.stroke(); }
    // bombilla
    g.strokeStyle = "#0b0b0b"; g.lineWidth = 2; g.beginPath(); g.moveTo(640, -60); g.lineTo(640, 40); g.stroke();
    g.fillStyle = "#fff3c4"; g.beginPath(); g.arc(640, 52, 12, 0, 6.283); g.fill();
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.55; g.drawImage(BLOB2.oro, 340, -150, 600, 600); g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    trampilla(g);
    const v = g.createRadialGradient(W / 2, 320, 250, W / 2, 320, 720);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.72)");
    g.fillStyle = v; g.fillRect(-60, -60, W + 120, H + 120);
    return (this.cF = c);
  }
  tripode(g, dy, delante) {
    g.save(); g.translate(0, dy); g.lineCap = "round";
    const pata = (x0, y0, w, c) => { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(AP[0], AP[1]); g.lineTo(x0, y0); g.stroke(); };
    if (!delante) { pata(HX + 6, PIES - 44, 8, "#8a1a12"); }
    else {
      for (const x0 of [HX - 132, HX + 132]) { pata(x0, PIES + 4, 11, "#6a0c08"); pata(x0, PIES + 4, 7, "#e3262f"); }
      g.fillStyle = "#2a2a2a"; for (const x0 of [HX - 132, HX + 132]) { rectR(g, x0 - 10, PIES - 4, 20, 9, 3); g.fill(); }
      // cabeza y polea
      g.fillStyle = "#3a3e44"; rectR(g, AP[0] - 18, AP[1] - 18, 36, 18, 4); g.fill();
      const gp = g.createRadialGradient(AP[0] - 4, AP[1] + 10, 2, AP[0], AP[1] + 14, RUEDA);
      gp.addColorStop(0, "#e8ecf0"); gp.addColorStop(1, "#6a7078");
      g.fillStyle = gp; g.beginPath(); g.arc(AP[0], AP[1] + 14, RUEDA, 0, 6.283); g.fill();
      g.fillStyle = "#2a2a2a"; g.beginPath(); g.arc(AP[0], AP[1] + 14, 4, 0, 6.283); g.fill();
    }
    g.restore();
  }
  // ------------------------------------------------------------------ dibujar
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses(), b = this.barrilEn(t), dyT = this.tripodeY(t);
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    g.drawImage(this.fondoBodega(), -60, -60);
    foco(g, 640, 560, PIES, 260, 0.35);
    this.tripode(g, dyT, false);
    // el barril (atascado: se mete en el hueco)
    if (b.atascado) {
      g.save(); g.beginPath(); g.rect(-60, -60, W + 120, HY + 4 + 60); g.clip();
      barril(g, b.x, b.y, b.ang);
      const gs = g.createLinearGradient(0, HY - 50, 0, HY + 4);
      gs.addColorStop(0, "rgba(0,0,0,0)"); gs.addColorStop(1, "rgba(0,0,0,.9)");
      g.fillStyle = gs; g.fillRect(HX - 100, HY - 50, 200, 56);
      g.restore();
    } else if (t < T_ATERRIZA) barril(g, b.x, b.y, b.ang);
    // la cuerda
    const ruedaI = [AP[0] - RUEDA, AP[1] + 14 + dyT], ruedaD = [AP[0] + RUEDA, AP[1] + 14 + dyT];
    const arco = []; for (let i = 0; i <= 8; i++) { const an = Math.PI + (i / 8) * Math.PI; arco.push([AP[0] + Math.cos(an) * (RUEDA + 2), AP[1] + 14 + dyT + Math.sin(an) * (RUEDA + 2)]); }
    if (t > T_TRIPODE) {
      const anilla = [b.x + Math.sin(b.ang) * (BH / 2 + 14), b.y - Math.cos(b.ang) * (BH / 2 + 14)];
      if (t < T_GANCHO) {
        // cuelga de la polea
        cuerda(g, [[ruedaI[0], ruedaI[1] + 120], ruedaI].concat(arco, [ruedaD, [ruedaD[0] + 30, ruedaD[1] + 260]]));
      } else if (t < T_PLOP) {
        const kg = eInOut(tramo(t, T_GANCHO, T_GANCHO + 0.3));
        const bajo = mezcla([ruedaI[0], ruedaI[1] + 120], anilla, kg);
        const ka = eInOut(tramo(t, T_AGARRAN - 0.3, T_AGARRAN));
        const mm = e.manosM, mg = e.manosG;
        const tramoM = mm && mg ? [mm[0], mm[1], mg[0], mg[1], [mg[1][0] + 70, PIES - 4], [mg[1][0] + 150, PIES - 2]] : [[ruedaD[0] + 30, ruedaD[1] + 260]];
        const fin = ka < 1 ? [mezcla([ruedaD[0] + 30, ruedaD[1] + 260], tramoM[0], ka)].concat(ka > 0.99 ? tramoM.slice(1) : []) : tramoM;
        cuerda(g, [bajo, ruedaI].concat(arco, [ruedaD], fin));
        g.fillStyle = "#8a9098"; g.beginPath(); g.arc(bajo[0], bajo[1], 4, 0, 6.283); g.fill();
      } else {
        // suelta: cuelga floja
        const k = eOut(tramo(t, T_PLOP, T_PLOP + 0.4));
        cuerda(g, [[ruedaI[0] - 10, lerp(ruedaI[1] + 30, ruedaI[1] + 150, k)], ruedaI].concat(arco, [ruedaD, [ruedaD[0] + 60, 420], [ruedaD[0] + 150, PIES - 6], [760, PIES - 4], [900, PIES - 2]]));
      }
    }
    this.tripode(g, dyT, true);
    // los dos
    for (const m of [e.mM, e.mG]) { const c = aPant(m, [39, 232]); g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(c[0], PIES + 2, 58, 9, 0, 0, 6.283); g.fill(); }
    if (t >= T_ATERRIZA) { g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(XB, PIES + 2, 70, 10, 0, 0, 6.283); g.fill(); barril(g, b.x, b.y, b.ang, 1 + (1 - (b.sy || 1)) * 0.6, b.sy || 1); }
    pintarAvatar(g, e.mM, e.M, t);
    pintarAvatar(g, e.mG, e.G, t);
    // corazones del abrazo
    if (t > T_ABRAZA) {
      for (let i = 0; i < 5; i++) {
        const u = ((t - T_ABRAZA) * 0.5 + i * 0.2) % 1, x = 905 + Math.sin(i * 2.1 + t * 2) * 70, y = 300 - u * 170;
        corazon(g, x, y, 1.7 + 0.5 * Math.sin(i), Math.min(1, (1 - u) * 2) * tramo(t, T_ABRAZA, T_ABRAZA + 0.3));
      }
    }
    g.restore();
    this.p.dibujar(g);
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: a * (1 - tramo(d, dur - 0.15, dur)) });
      g.restore();
    };
    ono("¡NGHH!", 620, 260, T_TIRA0 + 0.1, 0.8, 52, "#fffdf5", "#1b1b1b", 0.06);
    ono("¡CLONC!", 200, 300, T_CLONC, 0.55, 56, "#ffd34d", "#3a2400", -0.08);
    ono("CLIC", 470, 330, T_GANCHO + 0.3, 0.45, 38, "#fffdf5", "#1b1b1b", 0.06);
    TIRONES.forEach((ti, i) => ono("¡AÚPA!", 700, 210 - i * 30, ti, 0.55, 54 + i * 8, "#ffd34d", "#3a2400", i % 2 ? 0.08 : -0.08));
    ono("¡PLOP!", 380, 300, T_PLOP, 0.7, 96, "#ffffff", "#3a1a00", -0.06);
    ono("¡PLAF!", 770, 320, T_PLOP + 0.25, 0.55, 50, "#fffdf5", "#1b1b1b", 0.08);
    ono("¡BOING!", 900, 330, T_ATERRIZA, 0.6, 54, "#2fe3e8", "#06303a", 0.08);
    // ¡RESCATADO!
    if (t > T_TIT) {
      const d = t - T_TIT, k = tramo(d, 0, 0.18), s = lerp(2.2, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 7));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * a; g.translate(470, 96); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(900, 200), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 160);
    gr.addColorStop(0, "#fffef0"); gr.addColorStop(0.5, "#ffe58a"); gr.addColorStop(1, "#f2a100");
    txt(g, "¡RESCATADO!", 456, 158, { tam: 140, peso: 900, fam: FD, color: "#3a2400", esp: 6, max: 860 });
    txt(g, "¡RESCATADO!", 450, 150, { tam: 140, peso: 900, fam: FD, color: gr, borde: "#3a2400", bordeAncho: 13, esp: 6, glow: "rgba(255,200,40,.9)", glowTam: 26, max: 860 });
    CT.set("t", c);
    return c;
  }
}

registrar({ id: "00231", nombre: "Rescate del barril", crear: () => new RescateBarril() });
})();
