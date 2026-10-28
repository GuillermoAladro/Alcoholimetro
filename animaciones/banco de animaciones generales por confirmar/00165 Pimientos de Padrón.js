"use strict";
/*
 * 00165 · PIMIENTOS DE PADRÓN
 *
 * Animación del banco. Empieza y acaba en negro.
 * Un plato de pimientos de Padrón («unos pican y otros no»). Se los comen por turnos, mirándose de reojo: Guillermo,
 * tan tranquilo; Marcos, chulito… hasta que le toca el que pica. Se pone rojo, le sale humo por las orejas y echa
 * fuego por la boca: ¡ESTE PICA! Se bebe una jarra de agua entera y Guillermo, mientras, se come otro tan pancho.
 */
(() => {
const ESC = 1.8, AY = 652, BARRA = 470, XG = 330, XM = 650;
const PLATO = [495, 462], JUG = [775, 467], JUG_ASA = [775 - 18 * 1.8, 467 - 18 * 1.8];
// pimientos del plato: [dx, dy, ángulo]
const PIM = [[-44, -6, 0.3], [40, -8, 2.9], [-10, -10, -0.2], [18, -3, 3.4], [-30, 2, 0.1], [54, 0, 2.7], [6, 4, -0.3], [-58, 4, 0.5]];
// turnos: quién, cuándo empieza, qué pimiento
const TURNOS = [{ q: 0, t0: 0.7, i: 0 }, { q: 1, t0: 2.0, i: 1 }, { q: 0, t0: 3.3, i: 2 }, { q: 1, t0: 4.5, i: 3 }, { q: 0, t0: 8.7, i: 4 }];
const T_ROJO = 5.6, T_FUEGO = 5.95, T_AGUA = 6.9, DUR = 11.0, T_APAGA = 10.4;
const BORDE_JUG = [18, -26];
const CT = cacheTexto();
const aU = (X, q) => [(q[0] - X) / ESC + 39, (q[1] - AY) / ESC + 232];

/** Pimiento de Padrón: (x, y) = rabo; apunta hacia `ang`; `largo` 0–1 (se lo van comiendo). En píxeles con s = 1. */
function pimiento(g, x, y, ang, s = 1, largo = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  const L = 44 * largo;
  if (L > 3) {
    g.beginPath();
    g.moveTo(2, -9);
    g.bezierCurveTo(L * 0.35, -12, L * 0.7, -7, L, -1);
    g.quadraticCurveTo(L + 2, 2, L - 2, 3);
    g.bezierCurveTo(L * 0.7, 9, L * 0.35, 12, 2, 9);
    g.closePath();
    const gr = g.createLinearGradient(0, -11, 0, 11);
    gr.addColorStop(0, "#9fd35a"); gr.addColorStop(0.45, "#4f9a22"); gr.addColorStop(1, "#245a0c");
    g.fillStyle = gr; g.fill(); g.strokeStyle = "#1c4208"; g.lineWidth = 1.5; g.stroke();
    // arrugas y brillo
    g.strokeStyle = "rgba(20,60,5,.55)"; g.lineWidth = 1.2;
    for (const f of [0.3, 0.55, 0.78]) if (f * 44 < L) { g.beginPath(); g.moveTo(f * 44 - 3, -7); g.quadraticCurveTo(f * 44 + 2, 0, f * 44 - 2, 7); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,.55)"; g.beginPath(); g.ellipse(Math.min(16, L * 0.4), -5, Math.min(9, L * 0.25), 2, -0.05, 0, 6.283); g.fill();
    // sal gorda
    g.fillStyle = "#fff"; for (const [sx, sy] of [[10, 2], [22, -4], [30, 3], [15, -6]]) if (sx < L) g.fillRect(sx, sy, 2, 2);
  }
  // rabito
  g.fillStyle = "#6f8a2a"; g.beginPath(); g.ellipse(2, 0, 5, 9, 0, 0, 6.283); g.fill();
  g.strokeStyle = "#8aa03a"; g.lineWidth = 3; g.lineCap = "round"; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-6, -2, -9, -7); g.stroke();
  g.restore();
}
/** Jarra de agua (unidades propias): el asa en (0, 0), el cuerpo a la derecha. */
function jarraAgua(g, mano, inc, nivel, parte) {
  g.save(); g.translate(mano[0], mano[1]); g.rotate(inc);
  if (parte === "asa") {
    g.strokeStyle = "rgba(225,240,255,.9)"; g.lineWidth = 3.4;
    g.beginPath(); g.moveTo(5, -16); g.bezierCurveTo(-8, -16, -8, 10, 5, 10); g.stroke();
    g.restore(); return;
  }
  const ruta = () => { g.beginPath(); g.moveTo(5, -26); g.lineTo(31, -26); g.lineTo(36, -31); g.lineTo(35, -22); g.lineTo(34, 16); g.quadraticCurveTo(34, 19, 30, 19); g.lineTo(7, 19); g.quadraticCurveTo(3, 19, 3, 16); g.closePath(); };
  ruta(); g.fillStyle = "rgba(200,230,255,.16)"; g.fill();
  const alto = 41 * clamp(nivel, 0, 1);
  if (alto > 0.5) {
    g.save(); ruta(); g.clip();
    const gw = g.createLinearGradient(0, 19 - alto, 0, 19);
    gw.addColorStop(0, "rgba(170,225,255,.85)"); gw.addColorStop(1, "rgba(60,150,230,.85)");
    g.fillStyle = gw; g.fillRect(0, 19 - alto, 40, alto + 2);
    // cubitos
    g.fillStyle = "rgba(240,250,255,.8)";
    for (const [cx, cy] of [[11, 19 - alto + 2], [22, 19 - alto + 4], [17, 19 - alto + 9]]) if (cy < 17) { rectR(g, cx - 4, cy - 4, 8, 8, 2); g.fill(); }
    g.restore();
  }
  ruta(); g.strokeStyle = "rgba(235,245,255,.95)"; g.lineWidth = 1.7; g.stroke();
  g.fillStyle = "rgba(255,255,255,.4)"; g.fillRect(8, -21, 2.4, 34);
  g.restore();
}

class Pimientos extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(420);
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, DUR - 0.05)); }
  /** Estado de un turno en t: dónde está la mano, si lleva el pimiento y cuánto queda. */
  turno(T, t) {
    const X = T.q ? XM : XG, q = T.q, P = PIM[T.i];
    const reposo = q ? [8, 140] : [72, 140];
    const coge = aU(X, [PLATO[0] + P[0], PLATO[1] + P[1] - 6]);
    const b = boca(0, q ? "marcos" : undefined), enBoca = q ? [b[0] - 24, b[1] + 3] : [b[0] + 24, b[1] + 3];
    const d = t - T.t0;
    if (d < 0 || d > 1.35) return null;
    let mano = mezcla(reposo, coge, eInOut(tramo(d, 0, 0.3)));
    mano = mezcla(mano, enBoca, eInOut(tramo(d, 0.32, 0.62)));
    mano = mezcla(mano, reposo, eInOut(tramo(d, 0.98, 1.35)));
    const lleva = d > 0.3 && d < 1.0;
    const ang = lerp(Math.PI / 2, q ? 0 : Math.PI, eInOut(tramo(d, 0.32, 0.6)));
    return { mano, lleva, ang, largo: 1 - 0.85 * tramo(d, 0.62, 0.92), muerde: d > 0.62 && d < 0.95 };
  }
  enPlato(i, t) { const T = TURNOS.find((u) => u.i === i); return !T || t < T.t0 + 0.3; }
  poses(t = this.t) {
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [72, 140], manoI: [8, 142] };
    const M = { quien: "marcos", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [66, 140], manoI: [8, 140], brazoIDelante: true };
    let giroG = 0, xm = 0;
    for (const T of TURNOS) {
      const s = this.turno(T, t);
      if (!s) continue;
      const P = T.q ? M : G, O = T.q ? G : M;
      if (T.q) M.manoI = s.mano; else G.manoD = s.mano;
      if (s.lleva) {
        const f = (g, m) => pimiento(g, m[0], m[1] - 2, s.ang, 1 / ESC, s.largo);
        if (T.q) M.objI2 = f; else G.objD2 = f;
      }
      const d = t - T.t0;
      P.cara = d < 0.6 ? "guino" : s.muerde ? "risa" : (Math.floor(d * 7) % 2 ? "sonrisa" : "risa");
      O.cara = d < 0.9 ? "sorpresa" : "sonrisa";
      O.rc = T.q ? -0.08 : 0.08;
      if (T.i === 3 && d > 0.95) { M.cara = "sonrisa"; G.cara = "sorpresa"; }
    }
    // ¡el que pica!
    if (t >= T_ROJO && t < T_AGUA) {
      M.cara = "sorpresa"; M.puntas = tramo(t, T_ROJO, T_FUEGO);
      xm = azar(-2, 2) * tramo(t, T_ROJO, T_FUEGO);
      if (t > T_FUEGO) { M.rc = -0.12 + 0.03 * Math.sin(t * 30); M.manoI = [-12, 60 + 6 * Math.sin(t * 20)]; M.manoD = [92, 60 + 6 * Math.sin(t * 20 + 1)]; }
      G.cara = t < 6.45 ? "sorpresa" : "risa"; giroG = -0.06 * tramo(t, T_FUEGO, T_FUEGO + 0.2);
    }
    // se bebe la jarra de agua de un trago
    if (t >= T_AGUA) {
      const kC = eInOut(tramo(t, T_AGUA, 7.2)), kS = eInOut(tramo(t, 7.2, 7.5)), kT = tramo(t, 7.5, 8.35), kB = eInOut(tramo(t, 8.35, 8.75));
      const rcB = -0.32 * eInOut(tramo(t, 7.35, 7.55)) * (1 - kB);
      const inc = (-0.4 * kS - 1.25 * eInOut(kT)) * (1 - kB);
      const b = boca(rcB, "marcos"), r = rot2(BORDE_JUG, inc), obj = [b[0] - r[0], b[1] - r[1]];
      const asa = aU(XM, JUG_ASA);
      let mano = mezcla([66, 140], asa, kC);
      if (t > 7.2) { mano = mezcla(asa, obj, kS); if (kB > 0) mano = mezcla(obj, asa, kB); }
      if (t > 8.8) mano = mezcla(asa, [66, 140], eInOut(tramo(t, 8.8, 9.1)));
      M.manoD = mano; M.manoI = [8, 140];
      M.puntas = 1 - tramo(t, 7.6, 8.6);
      if (t > 7.2 && t < 8.8) {
        M.rc = rcB;
        const nivel = 1 - kT;
        M.objD = (g, m, a2) => jarraAgua(g, m, inc, nivel, "asa");
        M.objD2 = (g, m, a2) => jarraAgua(g, m, inc, nivel, "cuerpo");
      }
      M.cara = t < 7.5 ? "sorpresa" : t < 8.4 ? "dormido" : t < 9.6 ? "borracho" : "sorpresa";
      if (t > 7.0 && t < 8.7) G.cara = "risa";
    }
    return [{ pose: G, m: matAv(XG, AY, ESC, giroG) }, { pose: M, m: matAv(XM + xm, AY, ESC) }];
  }
  /** Punta y dirección de la llamarada (sale de la boca hacia arriba a la derecha). */
  llamarada(t) {
    const e = this.poses(t)[1], b = aPant(e.m, boca(e.pose.rc, "marcos"));
    const largo = 250 * eOut(tramo(t, T_FUEGO, T_FUEGO + 0.2)) * (1 - eIn(tramo(t, 6.75, 7.0))) * (1 + 0.08 * Math.sin(t * 40));
    const ang = -0.62 + 0.06 * Math.sin(t * 13);
    return { b, largo, ang, x: b[0] + Math.cos(ang) * largo, y: b[1] + Math.sin(ang) * largo };
  }
  /** La llamarada: tres capas de fuego que tiemblan. */
  fuego(g, t) {
    if (t < T_FUEGO || t > 7.0) return;
    const L = this.llamarada(t);
    if (L.largo < 4) return;
    g.save(); g.translate(L.b[0] + 4, L.b[1]); g.rotate(L.ang);
    g.globalCompositeOperation = "lighter";
    for (const [w, col, f] of [[1, "255,60,10", 1], [0.7, "255,150,20", 0.9], [0.4, "255,240,150", 0.75]]) {
      const l = L.largo * f, a0 = 70 * w;
      g.beginPath(); g.moveTo(0, -6 * w);
      for (let i = 0; i <= 10; i++) { const u = i / 10, x = l * u, y = -(8 + a0 * u * (1 - 0.35 * u)) * w * (1 + 0.15 * Math.sin(t * 50 + i * 2)); g.lineTo(x, y * 0.95); }
      g.quadraticCurveTo(l * 1.15, 0, l, 0);
      for (let i = 10; i >= 0; i--) { const u = i / 10, x = l * u, y = (8 + a0 * u * (1 - 0.35 * u)) * w * (1 + 0.15 * Math.sin(t * 47 + i * 3)); g.lineTo(x, y * 0.95); }
      g.closePath();
      const gr = g.createLinearGradient(0, 0, l, 0);
      gr.addColorStop(0, `rgba(${col},.95)`); gr.addColorStop(0.7, `rgba(${col},.7)`); gr.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = gr; g.fill();
    }
    g.restore();
  }
  /** Lo rojo que está Marcos (0–1). */
  rojo(t) { return tramo(t, T_ROJO, T_FUEGO) * (1 - tramo(t, 7.8, 8.8)); }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    for (const T of TURNOS) this.una("m" + T.i, t > T.t0 + 0.62, () => temblar(3, 0.08));
    this.una("rojo", t > T_ROJO, () => temblar(6, 0.4));
    this.una("fuego", t > T_FUEGO, () => { temblar(20, 0.6); });
    const e = this.poses(t), M = e[1];
    // fuego por la boca: chispas y llamitas en la punta de la llamarada
    if (t > T_FUEGO && t < 6.95) {
      const L = this.llamarada(t);
      for (let k = 0; k < 2; k++) p.nueva(P.LLAMA, L.x + azar(-14, 14), L.y + azar(-14, 14), Math.cos(L.ang) * azar(80, 200), Math.sin(L.ang) * azar(80, 200), azar(0.3, 0.55), azar(30, 50), k % 2);
      if (Math.random() < 0.5) p.nueva(P.CHISPA, L.x, L.y, Math.cos(L.ang) * azar(200, 400) + azar(-80, 80), Math.sin(L.ang) * azar(200, 400), azar(0.3, 0.6), azar(6, 10));
    }
    // humo por las orejas
    if (t > T_ROJO + 0.1 && t < 8.6 && Math.random() < 22 * dt) {
      for (const [ox, sx] of [[4, -1], [70, 1]]) {
        const o = aPant(M.m, [ox, 50]);
        p.nueva(P.VAPOR, o[0], o[1], sx * azar(60, 140), azar(-120, -60), azar(0.5, 0.9), azar(18, 30));
      }
    }
    this.una("puf", t > 8.75, () => {
      const b = aPant(M.m, boca(0, "marcos"));
      for (let k = 0; k < 5; k++) p.nueva(P.VAPOR, b[0] + 20, b[1] - 6, azar(60, 140), azar(-70, -20), azar(0.5, 0.8), azar(10, 16));
    });
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  barra(g) {
    if (!CT.has("barra")) {
      const c = lienzoNuevo(W + 120, H - BARRA + 70), b = c.getContext("2d");
      b.translate(60, -BARRA + 10);
      const gr = b.createLinearGradient(0, BARRA, 0, H);
      gr.addColorStop(0, "#5a3218"); gr.addColorStop(1, "#24130a");
      b.fillStyle = gr; b.fillRect(-60, BARRA + 10, W + 120, H - BARRA + 60);
      b.fillStyle = "rgba(0,0,0,.35)";
      for (let x = 30; x < W; x += 96) b.fillRect(x, BARRA + 18, 3, H - BARRA);
      b.fillStyle = "#b8862d"; b.fillRect(-60, 556, W + 120, 9); b.fillStyle = "rgba(255,240,190,.6)"; b.fillRect(-60, 557, W + 120, 2);
      b.fillStyle = "#8a5426"; b.fillRect(-60, BARRA - 6, W + 120, 18);
      b.fillStyle = "rgba(255,220,170,.4)"; b.fillRect(-60, BARRA - 6, W + 120, 3);
      b.fillStyle = "rgba(0,0,0,.45)"; b.fillRect(-60, BARRA + 12, W + 120, 5);
      CT.set("barra", c);
    }
    g.drawImage(CT.get("barra"), -60, BARRA - 10);
  }
  /** Pizarra del bar: «unos pican y otros no». */
  pizarra() {
    if (CT.has("piz")) return CT.get("piz");
    const c = lienzoNuevo(250, 130), g = c.getContext("2d");
    g.fillStyle = "#6b4219"; rectR(g, 4, 10, 242, 116, 8); g.fill();
    g.fillStyle = "#1e2b22"; rectR(g, 13, 19, 224, 98, 4); g.fill();
    g.strokeStyle = "#c9a14a"; g.lineWidth = 2; g.beginPath(); g.moveTo(125, 10); g.lineTo(100, 0); g.moveTo(125, 10); g.lineTo(150, 0); g.stroke();
    txt(g, "PIMIENTOS DE PADRÓN", 125, 44, { tam: 19, peso: 800, fam: FD, color: "#ffd34d", esp: 1.5, max: 210 });
    txt(g, "unos pican", 125, 76, { tam: 26, peso: 400, fam: FB, color: "#f2f2ea" });
    txt(g, "y otros no", 125, 104, { tam: 26, peso: 400, fam: FB, color: "#f2f2ea" });
    CT.set("piz", c);
    return c;
  }
  plato(g, t) {
    const [x, y] = PLATO;
    g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(x, y + 8, 92, 13, 0, 0, 6.283); g.fill();
    const gp = g.createLinearGradient(0, y - 12, 0, y + 10);
    gp.addColorStop(0, "#ffffff"); gp.addColorStop(1, "#c9cdd2");
    g.fillStyle = gp; g.beginPath(); g.ellipse(x, y, 88, 14, 0, 0, 6.283); g.fill();
    g.fillStyle = "#e8ebee"; g.beginPath(); g.ellipse(x, y - 2, 64, 9, 0, 0, 6.283); g.fill();
    // de atrás adelante
    const orden = PIM.map((P, i) => i).sort((a, b) => PIM[a][1] - PIM[b][1]);
    for (const i of orden) if (this.enPlato(i, t)) { const P = PIM[i]; pimiento(g, x + P[0] - Math.cos(P[2]) * 20, y + P[1] - 6, P[2], 0.95); }
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    foco(g, 490, 490, BARRA, 330, 0.85);
    const pz = this.pizarra();
    g.drawImage(pz, 34, 22);
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    // Marcos colorado
    const k = this.rojo(t);
    if (k > 0) conMat(g, e[1].m, () => {
      const c = [37, 74], r = rot2([0, -20], e[1].pose.rc);
      g.globalCompositeOperation = "multiply"; g.fillStyle = `rgba(255,95,70,${0.8 * k})`;
      g.beginPath(); g.ellipse(c[0] + r[0], c[1] + r[1], 21, 19, e[1].pose.rc, 0, 6.283); g.fill();
    });
    this.barra(g);
    // jarra de cerveza de Guillermo (atrezo) y la de agua de Marcos (en la barra mientras no la coge)
    g.save(); g.translate(150 - 17 * 1.8, BARRA - 4 - 18 * 1.8); g.scale(1.8, 1.8);
    dibujarJarra(g, [0, 0], 0, 0.8, "asa", t); dibujarJarra(g, [0, 0], 0, 0.8, "cuerpo", t); g.restore();
    if (t < 7.2 || t > 8.8) {
      g.save(); g.translate(JUG_ASA[0], JUG_ASA[1]); g.scale(1.8, 1.8);
      const nv = t < 7.2 ? 1 : 0;
      jarraAgua(g, [0, 0], 0, nv, "asa"); jarraAgua(g, [0, 0], 0, nv, "cuerpo"); g.restore();
    }
    this.plato(g, t);
    this.fuego(g, t);
    g.restore();
    this.p.dibujar(g);
    // ¡ÑAM!
    for (const T of TURNOS) {
      const d = t - T.t0 - 0.62;
      if (d < 0 || d > 0.5) continue;
      const m = aPant(e[T.q].m, [T.q ? 37 : 39, 30]), kk = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(m[0] + (T.q ? 96 : -96), m[1] - 40); g.rotate(T.q ? 0.12 : -0.12); g.scale(kk, kk);
      txt(g, "¡ÑAM!", 0, 0, { tam: 42, peso: 400, fam: FC, color: "#d8ffb0", borde: "#1f3a00", bordeAncho: 7, esp: 2, alfa: a * (1 - tramo(d, 0.38, 0.5)) });
      g.restore();
    }
    // ¡GLU, GLU, GLU!
    if (t > 7.5 && t < 8.4) {
      const m = aPant(e[1].m, [37, 20]), f = Math.floor((t - 7.5) * 6);
      g.save(); g.translate(m[0] + 130, m[1] - 10 - (f % 2) * 8); g.rotate(0.1);
      txt(g, "¡GLU, GLU, GLU!", 0, 0, { tam: 40, peso: 400, fam: FC, color: "#bfe9ff", borde: "#0a3d5c", bordeAncho: 7, esp: 2, alfa: a });
      g.restore();
    }
    // ¡ESTE PICA!
    if (t > T_FUEGO) {
      const d = t - T_FUEGO, kk = tramo(d, 0, 0.17), s = lerp(2.6, 1, eIn(kk)) * (1 + 0.025 * Math.sin(d * 9));
      const r = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, kk * 3) * a;
      g.translate(640 + (d < 1 ? azar(-3, 3) : 0), 102); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (CT.has("tit")) return CT.get("tit");
    const c = lienzoNuevo(680, 200), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 160);
    gr.addColorStop(0, "#fff3a0"); gr.addColorStop(0.4, "#ff8a1a"); gr.addColorStop(1, "#d6000f");
    txt(g, "¡ESTE PICA!", 340, 150, { tam: 132, peso: 900, fam: FD, color: gr, borde: "#3a0500", bordeAncho: 12, esp: 4, glow: "rgba(255,90,20,.9)", glowTam: 28, max: 640 });
    CT.set("tit", c);
    return c;
  }
}

registrar({ id: "00165", nombre: "Pimientos de Padrón", crear: () => new Pimientos() });
})();
