"use strict";
/*
 * 00156 · VOLEIBOL DE PLAYA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se abre un círculo sobre la playa: red en el centro, Guillermo a la izquierda y Rodrigo a la derecha. Guillermo
 * saca, Rodrigo recibe de antebrazos, se acerca a la red, salta y remata con todas sus fuerzas: ¡MATE! Guillermo se
 * lanza en plancha… y se queda corto, con la cara en la arena. El balón rebota altísimo mientras Rodrigo lo celebra,
 * Guillermo levanta la cabeza escupiendo arena y el balón le cae justo en la cabeza (¡TOC!). Rodrigo se parte de risa.
 * El círculo se cierra sobre Guillermo con el balón en la cabeza.
 */
(() => {
const cache = cacheTexto();
const ESC = 1.3, XG = 210, XR0 = 760, XR1 = 600, HORIZ = 300, ORILLA = 382, BR = 26;
const T_TOSS = 0.7, T_SAQUE = 1.25, T_RECIBE = 2.2, T_REMATE = 3.25, T_BOTE = 3.5, T_PLANCHA = 3.3, T_SUELO = 3.72;
const T_CABEZA = 5.2;
const SAQUE = [262, 290], RECIBE = [744, 470], REMATE = [548, 128], BOTE = [394, 560];
const TUMBADO = [212, 510];   // centro del cuerpo de Guillermo tumbado (la cabeza hacia la derecha)

function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(560, 220), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 170);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.45, "#ffd34d"); gr.addColorStop(1, "#ff5a1a");
  g.save(); g.translate(280, 110); g.transform(1, 0, -0.14, 1, 0, 0);
  txt(g, "¡MATE!", 9, 62, { tam: 160, peso: 400, fam: FC, color: "#5a0a00", esp: 6 });
  txt(g, "¡MATE!", 0, 52, { tam: 160, peso: 400, fam: FC, color: gr, borde: "#5a0a00", bordeAncho: 12, esp: 6, glow: "rgba(255,120,40,.85)", glowTam: 26 });
  g.restore();
  cache.set("t", c);
  return c;
}
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
const arco = (a, b, h, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - 4 * h * u * (1 - u)];
function conCabeza(g, m, R, rc, f) { conMat(g, m, () => { g.translate(R.cuello[0], R.cuello[1]); g.rotate(rc); g.translate(-R.cuello[0], -R.cuello[1]); f(); }); }
/** Punto de la cabeza (unidades de avatar) girado con la cabeza. */
function enCabeza(R, p, rc) { const r = rot2([p[0] - R.cuello[0], p[1] - R.cuello[1]], rc); return [R.cuello[0] + r[0], R.cuello[1] + r[1]]; }

function pelota(g, x, y, r, ang) {
  g.save(); g.translate(x, y);
  g.save(); g.rotate(ang);
  const cols = ["#ff3d3d", "#fffdf5", "#2a8aff", "#fffdf5", "#ffd34d", "#fffdf5"];
  for (let i = 0; i < 6; i++) {
    g.fillStyle = cols[i];
    g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r, (i / 6) * 6.283, ((i + 1) / 6) * 6.283); g.closePath(); g.fill();
  }
  g.fillStyle = "#fffdf5"; g.beginPath(); g.arc(0, 0, r * 0.22, 0, 6.283); g.fill();
  g.restore();
  const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
  gr.addColorStop(0, "rgba(255,255,255,.55)"); gr.addColorStop(0.5, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(0,0,0,.28)");
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 1.5; g.stroke();
  g.restore();
}

class Voleibol extends Escena {
  constructor() {
    super(9.4);
    this.p = new Parts(420);
    this.p.suelo = () => PIES;
    this.estela = [];
    this.fondoC = null;
  }
  xR() { return lerp(XR0, XR1, eInOut(tramo(this.t, 2.35, 2.8))); }
  saltoR() {
    const t = this.t;
    if (t < 3.0 || t > 3.62) return 0;
    const u = tramo(t, 3.0, 3.62);
    return 172 * Math.sin(u * Math.PI) * (u < 0.4 ? eOut(u / 0.4) : 1);
  }
  /** Matriz de Guillermo y si está tumbado. */
  cuerpoG() {
    const t = this.t;
    if (t < T_PLANCHA) {
      const listo = t > 2.3 ? eInOut(tramo(t, 2.3, 2.6)) : 0;
      return { m: matAv(XG, PIES, ESC, 0, 1 + 0.04 * listo, 1 - 0.07 * listo), tumbado: 0 };
    }
    const u = tramo(t, T_PLANCHA, T_SUELO);
    const c0 = [XG, PIES - 116 * ESC];
    let c = arco(c0, TUMBADO, 70, eOut(u)), giro = Math.PI / 2 * eOut(Math.min(1, u * 1.4));
    if (t > T_SUELO) { const d = t - T_SUELO; c = [TUMBADO[0], TUMBADO[1] - 10 * Math.abs(Math.sin(d * 14)) * Math.exp(-d * 8)]; }
    return { m: matAv(c[0], c[1], ESC, giro, 1, 1, [39, 116]), tumbado: u };
  }
  /** Posición del balón. */
  pelota() {
    const t = this.t;
    const eG = this.cuerpoG();
    if (t < T_TOSS) return { p: aPant(eG.m, [24, 118]), ang: 0 };
    if (t < T_SAQUE) {
      const s0 = aPant(eG.m, [24, 118]), u = tramo(t, T_TOSS, T_SAQUE);
      const apex = [SAQUE[0] - 10, 196];
      if (u < 0.55) { const k = eOut(u / 0.55); return { p: mezcla(s0, apex, k), ang: t * 3 }; }
      const k = eIn((u - 0.55) / 0.45); return { p: mezcla(apex, SAQUE, k), ang: t * 3 };
    }
    if (t < T_RECIBE) return { p: arco(SAQUE, RECIBE, 260, tramo(t, T_SAQUE, T_RECIBE)), ang: t * 8 };
    if (t < T_REMATE) return { p: arco(RECIBE, REMATE, 150, tramo(t, T_RECIBE, T_REMATE)), ang: -t * 6 };
    if (t < T_BOTE) return { p: mezcla(REMATE, BOTE, eIn(tramo(t, T_REMATE, T_BOTE)) * 0.4 + tramo(t, T_REMATE, T_BOTE) * 0.6), ang: -t * 20, rapida: true };
    // rebota altísimo y cae en la cabeza de Guillermo
    const cab = this.puntoCabeza(T_CABEZA);
    if (t < T_CABEZA) {
      const u = tramo(t, T_BOTE, T_CABEZA), apex = 222;
      const x = lerp(BOTE[0], cab[0], u);
      // parábola que pasa por BOTE, sube hasta apex y baja a la cabeza
      const y0 = BOTE[1], y1 = cab[1], h = y0 - apex;
      const ua = 1 / (1 + Math.sqrt((y1 - apex) / h));
      const y = u < ua ? y0 - h * (1 - Math.pow(1 - u / ua, 2)) : apex + (y1 - apex) * Math.pow((u - ua) / (1 - ua), 2);
      return { p: [x, y], ang: t * 5 };
    }
    const d = t - T_CABEZA, c = this.puntoCabeza(t);
    return { p: [c[0] + 3 * Math.sin(t * 3), c[1] - 46 * Math.abs(Math.sin(d * 7)) * Math.exp(-d * 3.5)], ang: 0.4 * Math.sin(t * 3) };
  }
  rcG(t) { return t < 4.6 ? 0 : -0.36 * eBack(tramo(t, 4.6, 4.9)) + (t > T_CABEZA ? 0.1 * Math.exp(-(t - T_CABEZA) * 4) : 0); }
  /** Lado de arriba de la cabeza de Guillermo tumbado (donde se posa el balón), en pantalla. */
  puntoCabeza(t) {
    const R = avatar().rig, rc = this.rcG(t);
    const m = matAv(TUMBADO[0], TUMBADO[1], ESC, Math.PI / 2, 1, 1, [39, 116]);
    const q = aPant(m, enCabeza(R, [4, 34], rc));
    return [q[0], q[1] - BR];
  }
  poseG() {
    const t = this.t, eG = this.cuerpoG(), m = eG.m;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let mD = [70, 158], mI = [24, 118];
    // saque: lanza el balón con la izquierda y le da con la derecha por arriba
    if (t < 1.6) {
      const b = this.pelota().p;
      if (t < T_TOSS + 0.08) mI = enAv(m, b);
      else mI = mezcla([24, 118], [-16, 46], eOut(tramo(t, T_TOSS, T_TOSS + 0.2)));
      const kA = eInOut(tramo(t, 0.8, 1.12));
      mD = mezcla(mD, [94, 22], kA);
      if (t > 1.12) mD = mezcla([94, 22], enAv(m, SAQUE), eIn(tramo(t, 1.12, T_SAQUE)));
      if (t > T_SAQUE) { mD = mezcla(enAv(m, SAQUE), [76, 120], eOut(tramo(t, T_SAQUE, 1.5))); mI = mezcla([-16, 46], [9, 160], eOut(tramo(t, T_SAQUE, 1.5))); }
      pose.cara = t < T_TOSS ? "guino" : t < T_SAQUE + 0.1 ? "sonrisa" : "risa";
      pose.rc = t > T_TOSS && t < T_SAQUE ? -0.12 : 0;
    } else if (t < T_PLANCHA) {
      // mira el balón y se pone en guardia
      const k = eInOut(tramo(t, 2.3, 2.6));
      mD = mezcla([76, 120], [62, 138], k); mI = mezcla([9, 160], [16, 138], k);
      pose.cara = t < 2.9 ? "sonrisa" : "sorpresa";
      pose.rc = 0.08 * Math.sin(t * 2.5);
    } else {
      // ¡en plancha! brazos estirados por delante
      const k = eOut(tramo(t, T_PLANCHA, T_PLANCHA + 0.12));
      mD = mezcla([62, 138], [76, 2], k); mI = mezcla([16, 138], [4, 2], k);
      pose.piernaI = [0, 0.15]; pose.piernaD = [0, -0.1];
      pose.cara = t < T_SUELO ? "sorpresa" : t < 4.6 ? "dormido" : t < T_CABEZA ? "sorpresa" : t < 6.3 ? "borracho" : "risa";
      pose.rc = this.rcG(t);
      // se queda con la mano estirada… y al final saca el pulgar
      if (t > 6.4) { const k2 = eInOut(tramo(t, 6.4, 6.7)); mD = mezcla(mD, [88, 70], k2); }
      pose.arena = t > T_SUELO;
    }
    pose.manoD = mD; pose.manoI = mI;
    return { pose, m, tumbado: eG.tumbado };
  }
  poseR() {
    const t = this.t, x = this.xR(), sal = this.saltoR();
    const pose = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let mD = [62, 138], mI = [16, 138], sy = 0.95, sx = 1.03, bote = 0;
    if (t < 1.5) { pose.cara = "guino"; pose.rc = -0.06; }
    // recibe con los antebrazos
    if (t > 1.5 && t < 2.6) {
      const m0 = matAv(x, PIES, ESC, 0, sx, 0.9);
      const k = eInOut(tramo(t, 1.6, 2.0)) * (1 - eInOut(tramo(t, 2.35, 2.6)));
      const b = enAv(m0, [RECIBE[0] - 4, RECIBE[1] + 12]);
      mD = mezcla(mD, [b[0] + 5, b[1]], k); mI = mezcla(mI, [b[0] - 5, b[1]], k);
      sy = lerp(0.95, 0.86, eInOut(tramo(t, 1.7, 2.1)) * (1 - eInOut(tramo(t, 2.25, 2.5))));
      pose.cara = t < 2.25 ? "sorpresa" : "guino"; pose.rc = 0.06;
    }
    // va hacia la red
    if (t > 2.35 && t < 2.8) { const a = andar((t - 2.35) * 12, 0.9); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; bote = a.bote; }
    // se agacha, salta y remata con la izquierda
    if (t >= 2.75) {
      const kC = eInOut(tramo(t, 2.75, 3.0)) * (1 - eOut(tramo(t, 3.0, 3.1)));
      sy = 0.95 - 0.12 * kC; sx = 1.03 + 0.04 * kC;
      const kB = eInOut(tramo(t, 2.85, 3.05));
      mI = mezcla([16, 138], [-6, 168], kB); mD = mezcla([62, 138], [80, 166], kB);
      pose.cara = "guino";
      if (t > 3.0 && t < 3.7) {
        const m0 = matAv(x, PIES - sal, ESC);
        const kU = eOut(tramo(t, 3.0, 3.15));
        mI = mezcla([-6, 168], enAv(m0, [REMATE[0] - 6, REMATE[1] - 18]), kU);
        mD = mezcla([80, 166], [96, 40], kU);
        pose.cara = "risa"; pose.puntas = 0.6 * tramo(t, 3.1, 3.25);
        if (t > T_REMATE) { mI = mezcla(mI, [-14, 150], eOut(tramo(t, T_REMATE, T_REMATE + 0.1))); }
        pose.piernaI = [-sal * 0.08, 0.1]; pose.piernaD = [-sal * 0.08, -0.1];
      }
    }
    // ¡punto! lo celebra con los brazos en alto
    if (t > 3.7 && t < T_CABEZA + 0.1) {
      const k = eOut(tramo(t, 3.7, 3.9));
      mI = mezcla([-14, 150], [-20, 8 + 4 * Math.sin(t * 14)], k); mD = mezcla([96, 40], [98, 8 + 4 * Math.sin(t * 14 + 1)], k);
      pose.cara = "risa"; pose.puntas = 0.6 * (1 - tramo(t, 3.7, 4.2)); pose.rc = 0.08 * Math.sin(t * 6);
      bote = -Math.abs(Math.sin((t - 3.7) * 7)) * 22; sy = 1; sx = 1;
      pose.piernaI = [bote * 0.2, 0.1]; pose.piernaD = [bote * 0.2, -0.1];
    }
    // ¡TOC! le señala y se parte de risa
    if (t > T_CABEZA + 0.1) {
      const k = eInOut(tramo(t, T_CABEZA + 0.1, T_CABEZA + 0.35));
      const sac = Math.sin(t * 24) * 2;
      mI = mezcla([-20, 8], [-48, 96 + sac], k); mD = mezcla([98, 8], [50, 150 + sac], k);
      pose.cara = t < T_CABEZA + 0.3 ? "sorpresa" : "risa"; pose.rc = -0.1 + 0.07 * Math.sin(t * 12);
      sy = 0.97 + 0.015 * Math.sin(t * 24); sx = 1;
    }
    pose.manoD = mD; pose.manoI = mI;
    return { pose, m: matAv(x, PIES - sal + bote, ESC, 0, sx, sy) };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const arena = (x, y, n, f) => {
      for (let i = 0; i < n; i++) p.nueva(P.POLVO, x + azar(-30, 30), y - azar(0, 10), azar(-f, f), azar(-260, -40), azar(0.6, 1.2), azar(26, 52));
      for (let i = 0; i < n; i++) { const a = azar(-Math.PI, 0), v = azar(150, 420); this.granos.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, v: azar(0.5, 0.9) }); }
    };
    this.granos = this.granos || [];
    this.una("saque", t > T_SAQUE, () => { temblar(6, 0.15); const b = SAQUE; p.nueva(P.DESTELLO, b[0], b[1], 0, 0, 0.25, 110); });
    this.una("recibe", t > T_RECIBE, () => { temblar(5, 0.15); p.nueva(P.DESTELLO, RECIBE[0], RECIBE[1], 0, 0, 0.25, 100); });
    this.una("remate", t > T_REMATE, () => {
      temblar(14, 0.3); p.nueva(P.DESTELLO, REMATE[0], REMATE[1], 0, 0, 0.35, 220);
      for (let i = 0; i < 18; i++) { const a = azar(0, 6.283), v = azar(150, 420); p.nueva(P.CHISPA, REMATE[0], REMATE[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(7, 12)); }
    });
    this.una("bote", t > T_BOTE, () => { temblar(26, 0.5); arena(BOTE[0], BOTE[1] + 10, 22, 420); p.nueva(P.DESTELLO, BOTE[0], BOTE[1], 0, 0, 0.3, 200); });
    this.una("plancha", t > T_SUELO, () => { temblar(16, 0.35); arena(TUMBADO[0] - 60, PIES - 10, 18, 380); arena(TUMBADO[0] + 60, PIES - 10, 10, 300); });
    this.una("cae R", t > 3.62, () => { for (let i = 0; i < 10; i++) p.nueva(P.POLVO, XR1 + azar(-30, 30), PIES - 4, azar(-200, 200), azar(-60, -10), azar(0.6, 1.0), azar(24, 40)); });
    // escupe arena
    if (t > 4.85 && t < 5.15 && Math.random() < 40 * dt) {
      const e = this.poseG(), b = aPant(e.m, enCabeza(avatar().rig, boca(0), e.pose.rc));
      this.granos.push({ x: b[0], y: b[1], vx: azar(40, 200), vy: azar(-260, -100), v: 0.7 });
    }
    this.una("toc", t > T_CABEZA, () => {
      temblar(12, 0.25);
      const c = this.puntoCabeza(t);
      p.nueva(P.DESTELLO, c[0], c[1] + BR, 0, 0, 0.3, 140);
      for (let i = 0; i < 12; i++) { const a = azar(-Math.PI, 0), v = azar(120, 300); p.nueva(P.CHISPA, c[0], c[1] + BR, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 10)); }
    });
    for (const d of this.granos) { d.vy += 1100 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.v -= dt; }
    this.granos = this.granos.filter((d) => d.v > 0);
    // estela del remate
    const b = this.pelota();
    this.estela.push({ x: b.p[0], y: b.p[1], a: b.rapida ? 1 : 0.35 });
    if (this.estela.length > 10) this.estela.shift();
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 80, H + 80), g = c.getContext("2d");
    g.translate(40, 40);
    const gc = g.createLinearGradient(0, -40, 0, HORIZ);
    gc.addColorStop(0, "#1e8fe8"); gc.addColorStop(1, "#bfefff");
    g.fillStyle = gc; g.fillRect(-40, -40, W + 80, HORIZ + 40);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.9; g.drawImage(BLOB.amarillo, 780, -80, 260, 260); g.restore();
    g.fillStyle = "#fff6c4"; g.beginPath(); g.arc(910, 50, 40, 0, 6.283); g.fill();
    g.fillStyle = "rgba(255,255,255,.92)";
    for (const [x, y, s] of [[90, 80, 0.8], [600, 60, 0.6], [380, 150, 0.5]]) {
      g.beginPath(); g.arc(x, y, 26 * s, 0, 6.283); g.arc(x + 30 * s, y - 12 * s, 32 * s, 0, 6.283); g.arc(x + 64 * s, y, 24 * s, 0, 6.283); g.rect(x, y - 4 * s, 64 * s, 24 * s); g.fill();
    }
    const gm = g.createLinearGradient(0, HORIZ, 0, ORILLA);
    gm.addColorStop(0, "#1a7ac8"); gm.addColorStop(1, "#3ac0e0");
    g.fillStyle = gm; g.fillRect(-40, HORIZ, W + 80, ORILLA - HORIZ);
    g.fillStyle = "rgba(255,255,255,.6)"; g.fillRect(-40, HORIZ, W + 80, 2);
    const ga = g.createLinearGradient(0, ORILLA, 0, H + 40);
    ga.addColorStop(0, "#f6dfa8"); ga.addColorStop(1, "#d8b46a");
    g.fillStyle = ga; g.fillRect(-40, ORILLA, W + 80, H);
    const r = semilla(8);
    g.fillStyle = "rgba(160,120,60,.35)";
    for (let i = 0; i < 80; i++) { g.beginPath(); g.arc(r() * W, ORILLA + 10 + r() * 220, 1 + r() * 2, 0, 6.283); g.fill(); }
    // líneas del campo
    g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = 4;
    g.beginPath(); g.moveTo(40, PIES + 8); g.lineTo(W - 40, PIES + 8); g.moveTo(110, 450); g.lineTo(W - 110, 450); g.moveTo(110, 450); g.lineTo(40, PIES + 8); g.moveTo(W - 110, 450); g.lineTo(W - 40, PIES + 8); g.stroke();
    // sombrilla y nevera al fondo
    g.save(); g.translate(930, 420);
    g.strokeStyle = "#eee"; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(-10, -110); g.stroke();
    for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? "#ff3d84" : "#fffdf5"; g.beginPath(); g.moveTo(-10, -118); g.arc(-10, -100, 70, Math.PI + (i / 6) * Math.PI, Math.PI + ((i + 1) / 6) * Math.PI); g.closePath(); g.fill(); }
    g.restore();
    g.fillStyle = "#2a8aff"; rectR(g, 820, 396, 52, 34, 5); g.fill(); g.fillStyle = "#fffdf5"; g.fillRect(820, 396, 52, 9);
    this.fondoC = c;
    return c;
  }
  olas(g, t) {
    g.fillStyle = "rgba(255,255,255,.75)";
    g.beginPath(); g.moveTo(-60, ORILLA + 6);
    for (let x = -60; x <= W + 60; x += 32) g.lineTo(x, ORILLA + 2 + Math.sin(x * 0.03 + t * 2) * 4);
    g.lineTo(W + 60, ORILLA + 10); g.lineTo(-60, ORILLA + 10); g.closePath(); g.fill();
  }
  red(g) {
    // la red vista en perspectiva: poste de delante, poste del fondo y la malla entre los dos
    const F = [492, 292], A = [536, 330], bajo = 118;
    g.fillStyle = "rgba(120,80,30,.3)"; g.beginPath(); g.ellipse(F[0], PIES + 6, 26, 6, 0, 0, 6.283); g.fill();
    const poste = (x, y0, y1, w) => {
      const gp = g.createLinearGradient(x - w, 0, x + w, 0);
      gp.addColorStop(0, "#8a8e96"); gp.addColorStop(0.5, "#f4f6f8"); gp.addColorStop(1, "#6a6e76");
      g.fillStyle = gp; g.fillRect(x - w, y0 - 10, w * 2, y1 - y0 + 10);
    };
    poste(A[0], A[1], 452, 4);
    // malla
    const bF = F[1] + bajo, bA = A[1] + bajo * 0.75;
    g.fillStyle = "rgba(20,20,30,.35)";
    g.beginPath(); g.moveTo(F[0], F[1]); g.lineTo(A[0], A[1]); g.lineTo(A[0], bA); g.lineTo(F[0], bF); g.closePath(); g.fill();
    g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 1.4;
    g.beginPath();
    for (let i = 1; i < 9; i++) { const u = i / 9; g.moveTo(F[0], lerp(F[1], bF, u)); g.lineTo(A[0], lerp(A[1], bA, u)); }
    for (let i = 1; i < 6; i++) { const u = i / 6; const x = lerp(F[0], A[0], u); g.moveTo(x, lerp(F[1], A[1], u)); g.lineTo(x, lerp(bF, bA, u)); }
    g.stroke();
    g.strokeStyle = "#fffdf5"; g.lineWidth = 5;
    g.beginPath(); g.moveTo(F[0], F[1]); g.lineTo(A[0], A[1]); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.moveTo(F[0], bF); g.lineTo(A[0], bA); g.stroke();
    poste(F[0], F[1], PIES + 4, 6);
    g.fillStyle = "#e8283a"; g.beginPath(); g.arc(F[0], F[1] - 10, 7, 0, 6.283); g.fill();
  }
  dibujar(g) {
    const t = this.t, eG = this.poseG(), eR = this.poseR(), B = this.pelota();
    fondo(g, "#000");
    g.drawImage(this.fondo(), -40, -40);
    this.olas(g, t);
    // sombras
    g.fillStyle = "rgba(120,80,30,.3)";
    g.beginPath(); g.ellipse(this.xR(), PIES + 4, 52 * (1 - this.saltoR() / 300), 10, 0, 0, 6.283); g.fill();
    if (t < T_PLANCHA) { g.beginPath(); g.ellipse(XG, PIES + 4, 52, 10, 0, 0, 6.283); g.fill(); }
    else { g.beginPath(); g.ellipse(TUMBADO[0], PIES + 2, 160, 12, 0, 0, 6.283); g.fill(); }
    const by = clamp((PIES - B.p[1]) / 400, 0, 1);
    g.beginPath(); g.ellipse(B.p[0], PIES + 4, 20 * (1 - by * 0.5), 5, 0, 0, 6.283); g.fill();
    this.red(g);
    pintarAvatar(g, eR.m, eR.pose, t);
    pintarAvatar(g, eG.m, eG.pose, t);
    // arena en la cara de Guillermo
    if (eG.pose.arena) {
      const R = avatar().rig;
      conCabeza(g, eG.m, R, eG.pose.rc, () => {
        const r = semilla(3);
        for (let i = 0; i < 22; i++) {
          const x = 22 + r() * 36, y = 44 + r() * 26, s = 1.2 + r() * 2.2;
          g.fillStyle = i % 3 ? "#e8c88a" : "#c8a060"; g.beginPath(); g.arc(x, y, s, 0, 6.283); g.fill();
        }
      });
      // montoncito de arena delante de la cara
      const q = aPant(eG.m, [39, 0]);
      g.fillStyle = "#e2c48a"; g.beginPath(); g.ellipse(q[0] + 10, PIES + 2, 46, 14, 0, Math.PI, 0); g.fill();
    }
    // estela del balón
    for (let i = 0; i < this.estela.length; i++) {
      const s = this.estela[i];
      if (s.a < 0.5) continue;
      g.globalAlpha = (i / this.estela.length) * 0.5; g.fillStyle = "#fff3c0";
      g.beginPath(); g.arc(s.x, s.y, BR * (0.4 + 0.6 * i / this.estela.length), 0, 6.283); g.fill();
    }
    g.globalAlpha = 1;
    pelota(g, B.p[0], B.p[1], BR, B.ang);
    // granos de arena
    g.fillStyle = "#d8b06a";
    for (const d of this.granos || []) { g.fillRect(d.x - 2.5, d.y - 2.5, 5, 5); }
    this.p.dibujar(g);
    // estrellitas de mareo tras el ¡TOC!
    if (t > T_CABEZA + 0.1 && t < 6.6) {
      const c = this.puntoCabeza(t);
      for (let i = 0; i < 3; i++) { const a = t * 6 + (i / 3) * 6.283; g.fillStyle = "#ffe680"; estrella(g, c[0] + Math.cos(a) * 44, c[1] + 12 + Math.sin(a) * 12, 8, 3.4, a); g.fill(); }
    }
    // ¡TOC!
    const d = t - T_CABEZA;
    if (d > 0 && d < 0.8) {
      const k = eBack(tramo(d, 0, 0.14)), c = this.puntoCabeza(t);
      g.save(); g.translate(c[0] + 110, c[1] - 30); g.rotate(0.12); g.scale(k, k);
      txt(g, "¡TOC!", 0, 0, { tam: 52, peso: 400, fam: FC, color: "#fffdf5", borde: "#1a3a6a", bordeAncho: 8, alfa: 1 - tramo(d, 0.6, 0.8), esp: 2 });
      g.restore();
    }
    // ¡MATE!
    if (t > T_BOTE) {
      const dd = t - T_BOTE, k = tramo(dd, 0, 0.16), s = lerp(2.7, 1, eIn(k)) * (1 + 0.025 * Math.sin(dd * 7));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(560, 108); g.rotate(-0.06); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // iris
    const cIni = [XG + 60, 360], cFin = [TUMBADO[0] + 100, 452];
    const r = t < 0.7 ? 760 * eInOut(tramo(t, 0.02, 0.7)) : 760 * (1 - eInOut(tramo(t, 8.4, this.dur - 0.05)));
    const cc = t < 0.7 ? cIni : cFin;
    if (r < 760) {
      g.save(); g.fillStyle = "#000"; g.beginPath(); g.rect(-60, -60, W + 120, H + 120);
      g.moveTo(cc[0] + Math.max(0, r), cc[1]); g.arc(cc[0], cc[1], Math.max(0, r), 0, 6.2832); g.fill("evenodd"); g.restore();
    }
  }
}

registrar({ id: "00156", nombre: "Voleibol de playa", crear: () => new Voleibol() });
})();
