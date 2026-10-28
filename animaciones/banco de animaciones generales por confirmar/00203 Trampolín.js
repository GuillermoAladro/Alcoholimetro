"use strict";
/*
 * 00203 · TRAMPOLÍN
 *
 * Animación del banco. Empieza y acaba en negro.
 * Piscina al aire libre con trampolín y tres jueces (clones con gafas de sol y pelo dorado) en la mesa del jurado.
 * Marcos bota, salta, da vuelta y media y entra en el agua sin salpicar: ¡PLIC! Los jueces sacan 10, 10, 10.
 * Guillermo va hasta la punta, bota cada vez más alto, se hace una bola… y se tira en bomba: la ola sale disparada y
 * empapa a los jueces y a Marcos. Guillermo asoma riéndose, chocan las manos y los jueces, chorreando, sacan otro 10.
 */
(() => {
const cache = cacheTexto();
const DUR = 11, ESC = 1.1, AGUA = 470, TABLA = 300, BASE = 44, PUNTA = 304, BORDE_D = 770;
const XM_AGUA = 440, XG_AGUA = 560;
const T_SALTA_M = 2.0, T_ENTRA_M = 3.0, T_SALTA_G = 6.05, T_BOMBA = 6.85, T_MOJA = 7.3;
const BOTES_M = [[0.75, 1.15, 34], [1.3, 1.85, 80]], BOTES_G = [[4.95, 5.3, 40], [5.45, 5.95, 100]];
const JUECES = [{ x: 800, cara: "sonrisa" }, { x: 872, cara: "sonrisa" }, { x: 944, cara: "sonrisa" }];
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(680, 230), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 180);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#7af0ff"); gr.addColorStop(1, "#1a8aff");
  g.save(); g.translate(340, 115); g.transform(1, 0, -0.14, 1, 0, 0);
  txt(g, "¡BOMBA!", 8, 70, { tam: 180, peso: 400, fam: FC, color: "#021a4a", esp: 6 });
  txt(g, "¡BOMBA!", 0, 62, { tam: 180, peso: 400, fam: FC, color: gr, borde: "#021a4a", bordeAncho: 13, esp: 6, glow: "rgba(120,220,255,.95)", glowTam: 26 });
  g.restore();
  cache.set("t", c);
  return c;
}
/** Cartelito de juez (unidades de avatar) en la mano; `moja` 0–1 lo dobla y lo empapa. */
function cartel(g, m, moja) {
  g.save(); g.translate(m[0], m[1] - 4); g.rotate(-0.08 + 0.5 * moja); g.scale(1.45, 1.45);
  g.fillStyle = "#6a4a2a"; g.fillRect(-2, -4, 4, 20);
  g.save(); g.translate(0, -30); g.transform(1, 0.25 * moja, 0, 1 - 0.15 * moja, 0, 0);
  g.fillStyle = moja > 0.5 ? "#d8eef8" : "#ffffff"; rectR(g, -24, -20, 48, 40, 4); g.fill();
  g.strokeStyle = "#1a1a1a"; g.lineWidth = 2; g.stroke();
  txt(g, "10", 0, 13, { tam: 34, peso: 900, fam: FD, color: moja > 0.5 ? "#2a4a8a" : "#e8283a" });
  if (moja > 0.5) { g.fillStyle = "rgba(60,140,220,.6)"; for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(-12 + k * 12, 22 + k * 3, 2, 4, 0, 0, 6.283); g.fill(); } }
  g.restore();
  g.restore();
}

class Trampolin extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(300);
    this.gotas = [];
    this.fondoC = null;
  }
  /** Altura sobre la tabla y hundimiento de la tabla con los botes. */
  bote(t, botes) {
    for (const [a, b, h] of botes) if (t >= a && t <= b) { const u = tramo(t, a, b); return { h: 4 * h * u * (1 - u), flex: 0 }; }
    // en contacto: la tabla se hunde según el bote que viene
    for (let i = 0; i < botes.length; i++) {
      const [a, , h] = botes[i], prev = i ? botes[i - 1][1] : a - 0.3;
      if (t > prev && t < a) { const u = tramo(t, prev, a); return { h: 0, flex: (12 + h * 0.35) * Math.sin(u * Math.PI) }; }
    }
    return { h: 0, flex: 0 };
  }
  flexTabla(t) {
    let f = 0;
    if (t < T_SALTA_M + 0.05) { const b = this.bote(t, BOTES_M.concat([[T_SALTA_M, 9, 120]])); f = b.flex; }
    else if (t > 4.6 && t < T_SALTA_G + 0.05) { const b = this.bote(t, BOTES_G.concat([[T_SALTA_G, 9, 160]])); f = b.flex; }
    // vibra después de cada salto
    for (const ts of [T_SALTA_M, T_SALTA_G]) if (t > ts) f += 22 * Math.sin((t - ts) * 30) * Math.exp(-(t - ts) * 4);
    return f;
  }
  puntaTabla(t) { return [PUNTA, TABLA + this.flexTabla(t)]; }
  poseM(t) {
    const pose = { quien: "marcos", cara: "guino", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let m, nadando = false;
    if (t < T_SALTA_M) {
      const b = this.bote(t, BOTES_M), P = this.puntaTabla(t);
      const brazos = b.h > 0 ? 1 : 0;
      pose.manoD = brazos ? [80, 40] : [67, 152]; pose.manoI = brazos ? [-6, 40] : [6, 152];
      pose.cara = t < 0.7 ? "guino" : "sonrisa";
      m = matAv(P[0] - 22, P[1] - b.h, ESC, 0, 1, b.h > 0 ? 1.02 : 1 - 0.04 * (b.flex / 40));
    } else if (t < T_ENTRA_M + 0.4) {
      // salto con vuelta y media y entrada de cabeza
      const u = tramo(t, T_SALTA_M, T_ENTRA_M);
      const x = lerp(PUNTA - 22, XM_AGUA, u), yPies = lerp(TABLA, AGUA + 40, u) - 4 * 230 * u * (1 - u);
      const giro = eInOut(tramo(u, 0.1, 0.92)) * Math.PI * 3;
      const enc = Math.sin(tramo(u, 0.15, 0.8) * Math.PI);
      pose.manoD = mezcla([80, 30], [50, 170], enc); pose.manoI = mezcla([-6, 30], [24, 170], enc);
      pose.piernaI = [-40 * enc, 0]; pose.piernaD = [-40 * enc, 0];
      pose.cara = "dormido";
      const yy = t > T_ENTRA_M ? yPies + (t - T_ENTRA_M) * 500 : yPies;
      m = matAv(x, yy - 116 * ESC * Math.cos(giro), ESC, giro, 1, 1 - 0.25 * enc, [39, 116]);
    } else {
      // nadando
      nadando = true;
      let x = XM_AGUA + 60;
      if (t > T_BOMBA) x += 50 * eOut(tramo(t, T_BOMBA, T_BOMBA + 0.6)) - 40 * eInOut(tramo(t, 7.9, 8.5));
      const sube = eOut(tramo(t, 3.4, 3.8));
      const y = AGUA + 290 - 150 * sube + 5 * Math.sin(t * 3);
      pose.cara = t < 4.2 ? "risa" : t < T_BOMBA ? "sonrisa" : t < 7.6 ? "sorpresa" : "risa";
      pose.manoD = t < 4.3 && t > 3.6 ? [90, 30 + 10 * Math.sin(t * 14)] : [80, 128 + 6 * Math.sin(t * 4)];
      pose.manoI = [-4, 128 - 6 * Math.sin(t * 4)];
      if (t > 4.3 && t < T_BOMBA) pose.rc = -0.15;
      if (t > T_BOMBA && t < 7.4) pose.rc = 0.2 * Math.sin(t * 16);
      if (t > 8.2 && t < 9.0) { const k = eInOut(tramo(t, 8.2, 8.45)) * (1 - eInOut(tramo(t, 8.75, 9.0))); pose.manoD = mezcla(pose.manoD, [100, 36], k); }
      m = matAv(x, y, ESC);
    }
    return { pose, m, nadando };
  }
  poseG(t) {
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let m, nadando = false, X = 100;
    if (t < 3.9) {
      pose.cara = t < 2.0 ? "sonrisa" : t < 3.1 ? "sorpresa" : "risa";
      pose.rc = t > 2.0 && t < 3.1 ? 0.12 : 0;
      // aplaude
      if (t > 3.1) { const s = Math.sin(t * 22); pose.manoD = [48 + 6 * s, 112]; pose.manoI = [30 - 6 * s, 112]; pose.brazoIDelante = true; }
      m = matAv(X, TABLA + this.flexTabla(t) * 0.15, ESC);
    } else if (t < T_SALTA_G) {
      // anda a la punta, se cruje los dedos y bota
      const k = eInOut(tramo(t, 3.9, 4.6));
      X = lerp(100, PUNTA - 22, k);
      const b = this.bote(t, BOTES_G), P = this.puntaTabla(t);
      let y = lerp(TABLA, P[1], k) - b.h;
      if (k > 0 && k < 1) { const a = andar(t * 13, 0.9); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; y += a.bote; }
      pose.cara = t < 4.6 ? "guino" : t < 4.95 ? "guino" : "sorpresa";
      if (t > 4.6 && t < 4.95) { pose.manoD = [46, 118 + 4 * Math.sin(t * 40)]; pose.manoI = [32, 118]; pose.brazoIDelante = true; }
      if (b.h > 0) { pose.manoD = [100, 30]; pose.manoI = [-22, 30]; pose.puntas = 0.4; }
      m = matAv(X, y, ESC);
    } else if (t < T_BOMBA + 0.3) {
      // ¡en bomba!
      const u = tramo(t, T_SALTA_G, T_BOMBA);
      const x = lerp(PUNTA - 22, XG_AGUA, u), yC = lerp(TABLA - 130, AGUA + 10, u) - 4 * 190 * u * (1 - u);
      const bola = eOut(tramo(u, 0.08, 0.28));
      pose.manoD = mezcla([100, 30], [50, 150], bola); pose.manoI = mezcla([-22, 30], [28, 150], bola); pose.brazoIDelante = true;
      pose.piernaI = [-92 * bola, 0.55 * bola]; pose.piernaD = [-92 * bola, -0.55 * bola];
      pose.cara = u < 0.5 ? "risa" : "guino"; pose.puntas = 0.6 * bola;
      m = matAv(x, t > T_BOMBA ? yC + (t - T_BOMBA) * 400 : yC, ESC, -eInOut(tramo(u, 0.1, 0.95)) * Math.PI * 2, 1 + 0.05 * bola, 1 - 0.12 * bola, [39, 110]);
    } else {
      nadando = true;
      const sube = eOut(tramo(t, 7.4, 7.9));
      const y = AGUA + 290 - 150 * sube + 5 * Math.sin(t * 3 + 1);
      pose.cara = t < 7.9 ? "sorpresa" : "risa";
      pose.manoD = [80, 128 + 6 * Math.sin(t * 4 + 1)]; pose.manoI = [-4, 128 - 6 * Math.sin(t * 4 + 1)];
      if (t > 8.2 && t < 9.0) { const k = eInOut(tramo(t, 8.2, 8.45)) * (1 - eInOut(tramo(t, 8.75, 9.0))); pose.manoI = mezcla(pose.manoI, [-30, 36], k); }
      pose.brazoIDelante = true;
      m = matAv(XG_AGUA + 40, y, ESC);
    }
    return { pose, m, nadando };
  }
  juez(i, t) {
    const J = JUECES[i];
    const pose = { cara: "sonrisa", rc: 0, gafas: true, oro: i === 1 ? 0 : 0.6, brazoIDelante: true };
    const R = [[70, 158], [9, 160]];
    // primer 10, uno tras otro; segundo 10 empapados
    const t1 = 3.2 + i * 0.2, k1 = eBack(tramo(t, t1, t1 + 0.2)) * (1 - eInOut(tramo(t, 4.5, 4.8)));
    const t2 = 8.0 + i * 0.2, k2 = eBack(tramo(t, t2, t2 + 0.2));
    const k = Math.max(k1, k2);
    pose.manoD = mezcla([R[0][0] + 6, 134], [96, 36], k);
    pose.manoI = [R[1][0] + 8, 134];
    const moja = t > T_MOJA ? 1 : 0;
    pose.objD2 = (g, mano) => { if (k > 0.05) cartel(g, mano, moja); };
    pose.cara = t < 3.0 ? "sonrisa" : t < 4.6 ? "risa" : t < T_SALTA_G ? "sonrisa" : t < T_MOJA ? "sorpresa" : t < T_MOJA + 0.7 ? "dormido" : t < 7.9 ? "sorpresa" : "risa";
    if (t > T_MOJA && t < 7.8) pose.rc = 0.1 * Math.sin(t * 20 + i);
    if (moja) pose.puntas = 0;
    return { pose, m: matAv(J.x, 482, 0.8), k, moja };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("plic", t > T_ENTRA_M, () => {
      temblar(3, 0.1);
      for (let i = 0; i < 12; i++) this.gotas.push({ x: XM_AGUA + azar(-10, 10), y: AGUA, vx: azar(-60, 60), vy: azar(-260, -120), v: azar(0.4, 0.7), s: azar(2.5, 4) });
    });
    for (let i = 0; i < 3; i++) this.una("diez" + i, t > 3.2 + i * 0.2, () => { const J = JUECES[i]; p.nueva(P.DESTELLO, J.x + 30, 300, 0, 0, 0.3, 90); for (let k = 0; k < 6; k++) p.nueva(P.CHISPA, J.x + 30, 300, azar(-150, 150), azar(-200, -50), azar(0.3, 0.6), azar(5, 8)); });
    for (let i = 0; i < 3; i++) this.una("diez2" + i, t > 8.0 + i * 0.2, () => { const J = JUECES[i]; p.nueva(P.DESTELLO, J.x + 30, 300, 0, 0, 0.3, 90); });
    this.una("bomba", t > T_BOMBA, () => {
      temblar(28, 0.6);
      p.nueva(P.DESTELLO, XG_AGUA, AGUA, 0, 0, 0.4, 360);
      for (let i = 0; i < 110; i++) { const a = azar(-Math.PI * 0.9, -Math.PI * 0.1), v = azar(300, 1000); this.gotas.push({ x: XG_AGUA + azar(-40, 40), y: AGUA, vx: Math.cos(a) * v * 0.45, vy: Math.sin(a) * v, v: azar(0.8, 1.6), s: azar(5, 12) }); }
      // la ola hacia los jueces
      for (let i = 0; i < 90; i++) this.gotas.push({ x: XG_AGUA + azar(-20, 60), y: AGUA - azar(0, 60), vx: azar(420, 640), vy: azar(-900, -650), v: azar(1.2, 1.6), s: azar(6, 13) });
      for (let i = 0; i < 10; i++) p.nueva(P.VAPOR, XG_AGUA + azar(-120, 120), AGUA - azar(0, 100), azar(-100, 100), azar(-200, -40), azar(1, 1.6), azar(80, 140));
    });
    this.una("moja", t > T_MOJA, () => {
      temblar(12, 0.25);
      for (let i = 0; i < 70; i++) { const a = azar(-Math.PI, 0), v = azar(150, 520); this.gotas.push({ x: azar(780, 1020), y: azar(300, 380), vx: Math.cos(a) * v, vy: Math.sin(a) * v, v: azar(0.5, 1.0), s: azar(4, 10) }); }
    });
    this.una("asoma", t > 7.45, () => { for (let i = 0; i < 14; i++) this.gotas.push({ x: XG_AGUA + 40 + azar(-30, 30), y: AGUA, vx: azar(-80, 80), vy: azar(-300, -120), v: azar(0.4, 0.8), s: azar(3, 6) }); });
    this.una("choca", t > 8.45, () => { temblar(5, 0.12); p.nueva(P.DESTELLO, 545, 330, 0, 0, 0.3, 140); });
    // los jueces gotean
    if (t > T_BOMBA + 0.6 && Math.random() < 20 * dt) { const J = JUECES[(Math.random() * 3) | 0]; this.gotas.push({ x: J.x + azar(-26, 26), y: azar(330, 400), vx: 0, vy: 60, v: 0.6, s: azar(2.5, 4) }); }
    for (const d of this.gotas) {
      d.vy += 1300 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.v -= dt;
      if (d.y > AGUA + 4 && d.x < BORDE_D && d.vy > 0) d.v = 0;
    }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    if (this.gotas.length > 420) this.gotas.splice(0, this.gotas.length - 420);
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, 420);
    gc.addColorStop(0, "#1e8fe8"); gc.addColorStop(1, "#c8f0ff");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, 520);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8; g.drawImage(BLOB.amarillo, 560, -100, 240, 240); g.restore();
    g.fillStyle = "#fff6c4"; g.beginPath(); g.arc(680, 20, 34, 0, 6.283); g.fill();
    g.fillStyle = "rgba(255,255,255,.9)";
    for (const [x, y, s] of [[380, 60, 0.7], [860, 110, 0.8], [180, 160, 0.5]]) { g.beginPath(); g.arc(x, y, 26 * s, 0, 6.283); g.arc(x + 30 * s, y - 12 * s, 32 * s, 0, 6.283); g.arc(x + 64 * s, y, 24 * s, 0, 6.283); g.rect(x, y - 4 * s, 64 * s, 24 * s); g.fill(); }
    // seto y palmeras al fondo
    g.fillStyle = "#2f8a3a"; g.fillRect(-60, 400, W + 120, 70);
    for (let x = -60; x < W + 60; x += 40) { g.beginPath(); g.arc(x, 402, 24, Math.PI, 0); g.fill(); }
    // bordillos
    g.fillStyle = "#e8e4dc"; g.fillRect(-60, AGUA - 6, 210, H); g.fillRect(BORDE_D, AGUA - 6, W, H);
    g.fillStyle = "#c8c0b4"; g.fillRect(-60, AGUA - 6, 210, 8); g.fillRect(BORDE_D, AGUA - 6, W, 8);
    g.strokeStyle = "rgba(0,0,0,.12)"; g.lineWidth = 1.5;
    for (let x = -60; x < 150; x += 30) { g.beginPath(); g.moveTo(x, AGUA); g.lineTo(x, H + 60); g.stroke(); }
    for (let x = BORDE_D; x < W + 60; x += 30) { g.beginPath(); g.moveTo(x, AGUA); g.lineTo(x, H + 60); g.stroke(); }
    // agua (fondo con baldosas)
    const ga = g.createLinearGradient(0, AGUA, 0, H + 60);
    ga.addColorStop(0, "#3ad0f0"); ga.addColorStop(1, "#1a7ac8");
    g.fillStyle = ga; g.fillRect(150, AGUA, BORDE_D - 150, H);
    g.strokeStyle = "rgba(255,255,255,.18)";
    for (let x = 150; x < BORDE_D; x += 36) { g.beginPath(); g.moveTo(x, AGUA); g.lineTo(x, H + 60); g.stroke(); }
    for (let y = AGUA + 30; y < H + 60; y += 30) { g.beginPath(); g.moveTo(150, y); g.lineTo(BORDE_D, y); g.stroke(); }
    // base del trampolín y escalera
    g.fillStyle = "#b8b4ac"; g.fillRect(BASE - 30, TABLA + 10, 60, AGUA - TABLA - 10);
    g.fillStyle = "rgba(0,0,0,.15)"; g.fillRect(BASE + 14, TABLA + 10, 16, AGUA - TABLA - 10);
    g.strokeStyle = "#c8ccd4"; g.lineWidth = 4;
    g.beginPath(); g.moveTo(BASE - 44, TABLA - 40); g.lineTo(BASE - 44, AGUA); g.moveTo(BASE - 24, TABLA - 40); g.lineTo(BASE - 24, AGUA); g.stroke();
    // mesa del jurado (detrás)
    this.fondoC = c;
    return c;
  }
  tabla(g, t) {
    const f = this.flexTabla(t);
    g.strokeStyle = "#1a5aa8"; g.lineWidth = 12; g.lineCap = "round";
    g.beginPath(); g.moveTo(BASE - 10, TABLA + 6); g.quadraticCurveTo(BASE + 140, TABLA + 6 + f * 0.25, PUNTA, TABLA + 6 + f); g.stroke();
    g.strokeStyle = "#5aa8ff"; g.lineWidth = 4;
    g.beginPath(); g.moveTo(BASE - 10, TABLA + 2); g.quadraticCurveTo(BASE + 140, TABLA + 2 + f * 0.25, PUNTA, TABLA + 2 + f); g.stroke();
    g.fillStyle = "#3a3a44"; g.fillRect(BASE + 70, TABLA + 10, 18, 12);
  }
  mesa(g) {
    const gr = g.createLinearGradient(0, 396, 0, 484);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(1, "#c8d0dc");
    g.fillStyle = gr; rectR(g, 780, 396, 244, 88, 6); g.fill();
    g.fillStyle = "#2a5aff"; g.fillRect(780, 396, 244, 12);
    txt(g, "JURADO", 902, 458, { tam: 36, peso: 900, fam: FD, color: "#1a3a8a", esp: 4 });
  }
  /** Avatares en el agua: cortados en la superficie y con el agua por delante. */
  enAgua(g, m, pose, t) {
    g.save(); g.beginPath(); g.rect(-60, -200, W + 120, AGUA + 202); g.clip();
    pintarAvatar(g, m, pose, t);
    g.restore();
  }
  dibujar(g) {
    const t = this.t, eM = this.poseM(t), eG = this.poseG(t);
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    // jueces
    for (let i = 0; i < 3; i++) { const j = this.juez(i, t); pintarAvatar(g, j.m, j.pose, t); }
    this.mesa(g);
    this.tabla(g, t);
    // los dos
    if (eM.nadando || t > T_ENTRA_M - 0.1) this.enAgua(g, eM.m, eM.pose, t); else pintarAvatar(g, eM.m, eM.pose, t);
    if (eG.nadando || t > T_BOMBA - 0.05) this.enAgua(g, eG.m, eG.pose, t); else pintarAvatar(g, eG.m, eG.pose, t);
    // superficie del agua
    g.fillStyle = "rgba(120,230,255,.55)"; g.beginPath(); g.moveTo(150, AGUA);
    for (let x = 150; x <= BORDE_D; x += 20) g.lineTo(x, AGUA + 3 * Math.sin(x * 0.05 + t * 4));
    g.lineTo(BORDE_D, AGUA + 16); g.lineTo(150, AGUA + 16); g.closePath(); g.fill();
    g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = 2.5; g.beginPath();
    for (let x = 150; x <= BORDE_D; x += 20) g.lineTo(x, AGUA + 3 * Math.sin(x * 0.05 + t * 4));
    g.stroke();
    // columna de agua de la bomba
    if (t > T_BOMBA && t < T_BOMBA + 1.2) {
      const u = tramo(t, T_BOMBA, T_BOMBA + 1.2), h = 380 * Math.sin(Math.min(1, u * 1.6) * Math.PI * 0.5) * (1 - eIn(tramo(u, 0.5, 1))), w = 70 + 60 * u;
      const gr = g.createLinearGradient(0, AGUA - h, 0, AGUA);
      gr.addColorStop(0, "rgba(255,255,255,.95)"); gr.addColorStop(1, "rgba(120,220,255,.85)");
      g.fillStyle = gr; g.beginPath(); g.moveTo(XG_AGUA - w, AGUA + 6);
      g.quadraticCurveTo(XG_AGUA - w * 0.4, AGUA - h * 0.5, XG_AGUA - w * 0.3, AGUA - h); g.quadraticCurveTo(XG_AGUA, AGUA - h - 40, XG_AGUA + w * 0.3, AGUA - h);
      g.quadraticCurveTo(XG_AGUA + w * 0.4, AGUA - h * 0.5, XG_AGUA + w, AGUA + 6); g.closePath(); g.fill();
    }
    // el chorro que sale hacia el jurado
    if (t > T_BOMBA + 0.05 && t < T_MOJA + 0.35) {
      const u = tramo(t, T_BOMBA + 0.05, T_MOJA), s1 = eOut(u), s0 = Math.max(0, tramo(t, T_BOMBA + 0.3, T_MOJA + 0.35));
      const P0 = [XG_AGUA + 20, AGUA - 30], C = [760, 40], P1 = [905, 330];
      const q = (s) => [(1 - s) * (1 - s) * P0[0] + 2 * (1 - s) * s * C[0] + s * s * P1[0], (1 - s) * (1 - s) * P0[1] + 2 * (1 - s) * s * C[1] + s * s * P1[1]];
      for (const [col, rr] of [["rgba(60,170,240,.85)", 1], ["rgba(230,250,255,.95)", 0.55]]) {
        g.fillStyle = col;
        for (let k = 0; k <= 22; k++) { const s = lerp(s0, s1, k / 22), p = q(s), r = (20 + 34 * s) * rr * (0.85 + 0.15 * Math.sin(k * 2.3 + t * 30)); g.beginPath(); g.arc(p[0], p[1], r, 0, 6.283); g.fill(); }
      }
    }
    // los jueces empapados: chorreando
    if (t > T_MOJA) {
      const k = 1 - 0.6 * tramo(t, T_MOJA + 0.4, 9.5);
      g.fillStyle = `rgba(120,200,255,${0.5 * k})`;
      for (let i = 0; i < 3; i++) { const x = JUECES[i].x; for (let j = 0; j < 5; j++) { const yy = 320 + ((t * 160 + j * 37 + i * 13) % 90); g.beginPath(); g.ellipse(x - 26 + j * 13, yy, 2.5, 5, 0, 0, 6.283); g.fill(); } }
    }
    // gotas
    g.fillStyle = "#e6f8ff"; g.strokeStyle = "rgba(40,140,220,.6)"; g.lineWidth = 1.2;
    for (const d of this.gotas) { g.globalAlpha = Math.min(1, d.v * 3); g.beginPath(); g.arc(d.x, d.y, d.s, 0, 6.283); g.fill(); g.stroke(); }
    g.globalAlpha = 1;
    this.p.dibujar(g);
    // textos
    const grito = (s, x, y, t0, t1, tam, col, borde, rot = -0.08) => {
      if (t < t0 || t > t1) return;
      const k = eBack(tramo(t, t0, t0 + 0.15));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 7, esp: 2, alfa: 1 - tramo(t, t1 - 0.2, t1) });
      g.restore();
    };
    grito("¡PLIC!", XM_AGUA + 40, AGUA - 60, T_ENTRA_M, T_ENTRA_M + 0.8, 40, "#fffdf5", "#0a3a6a", 0.1);
    grito("¡PERFECTO!", 600, 220, 3.25, 4.4, 46, "#ffd34d", "#4a2a00");
    grito("¡CHAS!", 545, 280, 8.45, 9.1, 44, "#ffd34d", "#4a2a00");
    grito("¡CHOF!", 900, 250, T_MOJA, T_MOJA + 0.8, 56, "#e6f8ff", "#062a4a", 0.1);
    if (t > T_BOMBA) {
      const d = t - T_BOMBA, k = tramo(d, 0, 0.16), s = lerp(2.8, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 8));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(470, 100); g.rotate(-0.05); g.scale(s * 0.85, s * 0.85);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // iris
    const cF = [XG_AGUA - 10, AGUA - 60];
    const r = t < 1 ? 800 * eInOut(tramo(t, 0.02, 0.7)) : 800 * (1 - eInOut(tramo(t, DUR - 0.7, DUR - 0.04)));
    const cc = t < 1 ? [PUNTA - 40, TABLA - 100] : cF;
    if (r < 800) {
      g.save(); g.fillStyle = "#000"; g.beginPath(); g.rect(-60, -60, W + 120, H + 120);
      g.moveTo(cc[0] + Math.max(0, r), cc[1]); g.arc(cc[0], cc[1], Math.max(0, r), 0, 6.2832); g.fill("evenodd"); g.restore();
    }
  }
}

registrar({ id: "00203", nombre: "Trampolín", crear: () => new Trampolin() });
})();
