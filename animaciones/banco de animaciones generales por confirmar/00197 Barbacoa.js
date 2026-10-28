"use strict";
/*
 * 00197 · BARBACOA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Barbacoa en el jardín. Marcos da la vuelta a las hamburguesas lanzándolas al aire con la espátula, cada vez más
 * alto; Guillermo, con el pan del perrito en una mano, abanica el humo con un cartón… y se lo manda a Marcos, que
 * tose y lanza la salchicha tan fuerte que se sale de la pantalla. Guillermo corre de un lado a otro mirando arriba
 * con el pan preparado y la salchicha cae justo dentro: ¡AL PUNTO! Marcos aplaude y Guillermo le da un mordisco.
 */
(() => {
const cache = cacheTexto();
const DUR = 10.2, ESC = 1.5, XM = 650, GX = 515, GY = 418;
const T_C = 4.0, T_CAE = 6.1, LS = 44;   // lanzamiento de la salchicha, aterriza en el pan; largo de la espátula
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
const arco = (a, b, h, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - 4 * h * u * (1 - u)];
// vueltas de las hamburguesas: cuál, despegue, aterrizaje, altura, medias vueltas
const VUELTAS = [{ i: 1, t0: 0.95, t1: 1.75, h: 150, n: 3 }, { i: 0, t0: 2.15, t1: 3.05, h: 235, n: 5 }];
const COMIDA = [{ x: 478, h: true }, { x: 526, h: true }, { x: 568, h: false }];

/** Hamburguesa en pantalla; `lado` (cos del giro): > 0 la cara hecha arriba. */
function hamburguesa(g, x, y, s, lado, cruda) {
  const e = Math.max(0.12, Math.abs(lado));
  g.save(); g.translate(x, y); g.scale(s, s * e);
  const arriba = lado > 0 ? !cruda : cruda;
  const gr = g.createRadialGradient(-6, -4, 2, 0, 0, 24);
  if (arriba) { gr.addColorStop(0, "#9a5a32"); gr.addColorStop(1, "#4a2412"); }
  else { gr.addColorStop(0, "#d98d7a"); gr.addColorStop(1, "#8a4636"); }
  g.fillStyle = "#2a130a"; g.beginPath(); g.ellipse(0, 4, 23, 10, 0, 0, 6.283); g.fill();
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 23, 10, 0, 0, 6.283); g.fill();
  if (arriba) {
    g.strokeStyle = "rgba(25,10,4,.85)"; g.lineWidth = 2.6;
    for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(k * 8 - 5, -7); g.lineTo(k * 8 + 5, 7); g.stroke(); }
  }
  g.fillStyle = "rgba(255,255,255,.25)"; g.beginPath(); g.ellipse(-8, -4, 7, 2.2, -0.2, 0, 6.283); g.fill();
  g.restore();
}
/** Salchicha centrada en (x, y), girada `ang`, `s` escala, `largo` 0–1 (mordida). */
function salchicha(g, x, y, ang, s, largo = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  const L = 26 * largo;
  const gr = g.createLinearGradient(0, -8, 0, 8);
  gr.addColorStop(0, "#e0703a"); gr.addColorStop(0.45, "#b6401c"); gr.addColorStop(1, "#6a1e0a");
  g.fillStyle = gr; g.beginPath();
  g.moveTo(-26, -6); g.lineTo(-26 + 2 * L, -6); g.arc(-26 + 2 * L, 0, 6, -Math.PI / 2, Math.PI / 2); g.lineTo(-26, 6); g.arc(-26, 0, 6, Math.PI / 2, Math.PI * 1.5); g.fill();
  g.strokeStyle = "rgba(40,10,0,.7)"; g.lineWidth = 1.6;
  for (let k = 0; k < 3; k++) { const xx = -14 + k * 13; if (xx < -26 + 2 * L - 4) { g.beginPath(); g.moveTo(xx - 3, -5); g.lineTo(xx + 3, 5); g.stroke(); } }
  g.fillStyle = "rgba(255,230,200,.45)"; g.fillRect(-22, -4, Math.max(0, 2 * L - 10), 2);
  g.restore();
}
/** Pan de perrito (unidades de avatar), centrado en (x, y); con salchicha y mostaza si `lleno`. */
function pan(g, x, y, lleno, largo = 1, t = 0) {
  g.save(); g.translate(x, y);
  g.save(); g.beginPath(); g.rect(-30, -30, 15 + 30 * largo, 60); g.clip();
  const gr = g.createLinearGradient(0, -8, 0, 8);
  gr.addColorStop(0, "#f2b45a"); gr.addColorStop(0.5, "#d98a2e"); gr.addColorStop(1, "#9a5a18");
  if (lleno) salchicha(g, 0, -3.5, 0, 0.58, 1);
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 2, 18, 6.5, 0, 0, Math.PI); g.lineTo(-18, 0); g.fill();
  g.beginPath(); g.ellipse(0, 0.5, 18, 3.5, 0, Math.PI, 0); g.fill();
  if (lleno) {
    g.strokeStyle = "#ffd21a"; g.lineWidth = 1.8; g.lineJoin = "round"; g.beginPath();
    for (let k = 0; k <= 12; k++) { const xx = -12 + k * 2; g.lineTo(xx, -5.5 + (k % 2 ? -1.6 : 1.2)); }
    g.stroke();
  }
  g.fillStyle = "rgba(255,240,200,.5)"; g.beginPath(); g.ellipse(-4, 4, 9, 1.6, 0, 0, 6.283); g.fill();
  g.restore();
  g.restore();
}
/** Espátula: el mango en la mano, apuntando `a` (unidades de avatar). */
function espatula(g, m, a) {
  g.save(); g.translate(m[0], m[1]); g.rotate(a);
  g.fillStyle = "#5a3418"; rectR(g, -6, -2.6, 26, 5.2, 2.4); g.fill();
  g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(-4, -1.8, 22, 1.2);
  g.strokeStyle = "#9aa2aa"; g.lineWidth = 2.4; g.beginPath(); g.moveTo(19, 0); g.lineTo(LS - 13, 0); g.stroke();
  const gr = g.createLinearGradient(0, -7, 0, 7);
  gr.addColorStop(0, "#f4f6f8"); gr.addColorStop(1, "#8a929a");
  g.fillStyle = gr; rectR(g, LS - 14, -7, 16, 14, 2.5); g.fill();
  g.fillStyle = "#59606a"; for (let k = 0; k < 3; k++) g.fillRect(LS - 11 + k * 4.5, -4.5, 1.6, 9);
  g.restore();
}
/** Cartón para abanicar, cogido por un lado (unidades de avatar). */
function carton(g, m, a) {
  g.save(); g.translate(m[0], m[1]); g.rotate(a);
  const gr = g.createLinearGradient(0, -16, 0, 16);
  gr.addColorStop(0, "#d8a868"); gr.addColorStop(1, "#a8743a");
  g.fillStyle = gr; rectR(g, -4, -16, 38, 32, 2); g.fill();
  g.strokeStyle = "rgba(90,55,20,.45)"; g.lineWidth = 1;
  for (let k = 1; k < 7; k++) { g.beginPath(); g.moveTo(-4 + k * 5.4, -15); g.lineTo(-4 + k * 5.4, 15); g.stroke(); }
  g.strokeStyle = "#7a4c1c"; g.lineWidth = 1.4; rectR(g, -4, -16, 38, 32, 2); g.stroke();
  g.restore();
}
function rotulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(760, 210), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 170);
  gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.45, "#ffd34d"); gr.addColorStop(1, "#ff5a1a");
  g.save(); g.translate(380, 105); g.transform(1, 0, -0.12, 1, 0, 0);
  txt(g, "¡AL PUNTO!", 8, 62, { tam: 150, peso: 400, fam: FC, color: "#4a0d00", esp: 5 });
  txt(g, "¡AL PUNTO!", 0, 54, { tam: 150, peso: 400, fam: FC, color: gr, borde: "#4a0d00", bordeAncho: 12, esp: 5, glow: "rgba(255,110,30,.9)", glowTam: 28 });
  g.restore();
  cache.set("t", c);
  return c;
}

class Barbacoa extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(460);
    this.fondoC = null;
    this.carton = null;   // el cartón cuando se le cae
  }
  /** Posición de la comida i: { x, y, lado, aire }. */
  comida(i, t) {
    const c = COMIDA[i];
    if (!c.h) {
      if (t < T_C) return { x: c.x, y: GY - 5, ang: 0, aire: false };
      if (t >= T_CAE) return null;
      const u = tramo(t, T_C, T_CAE), xf = this.xG(T_CAE);
      const p = arco([c.x, GY - 5], [xf, 414], 820, u);
      p[0] = u < 0.5 ? c.x + (xf - c.x) * 0.1 * u : lerp(c.x, xf, (u - 0.4) / 0.6);
      const ang = u < 0.5 ? t * 13 : (1 - eOut((u - 0.82) / 0.18)) * Math.sin(t * 13) * 2.4;
      return { x: p[0], y: p[1], ang, aire: true };
    }
    for (const v of VUELTAS) {
      if (v.i !== i) continue;
      if (t > v.t0 && t < v.t1) {
        const u = tramo(t, v.t0, v.t1), p = arco([c.x, GY - 4], [c.x, GY - 4], v.h, u);
        return { x: p[0], y: p[1], lado: Math.cos(u * v.n * Math.PI), aire: true, giro: u };
      }
    }
    const hechas = VUELTAS.filter((v) => v.i === i && t >= v.t1).length;
    return { x: c.x, y: GY - 4, lado: 1, aire: false, cruda: hechas === 0 };
  }
  xG(t) {
    if (t < 4.45) return 330;
    if (t < 4.95) return lerp(330, 282, eInOut(tramo(t, 4.45, 4.95)));
    if (t < 5.5) return lerp(282, 372, eInOut(tramo(t, 4.95, 5.5)));
    return lerp(372, 346, eInOut(tramo(t, 5.6, 5.95)));
  }
  andandoG(t) { return (t > 4.45 && t < 4.95) || (t > 4.95 && t < 5.5) || (t > 5.6 && t < 5.95); }
  poseG() {
    const t = this.t, X = this.xG(t);
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let bote = 0;
    if (this.andandoG(t)) { const a = andar(t * 15, 1); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; bote = a.bote; }
    const m = matAv(X, PIES + bote, ESC);
    let mD, mI = [-2, 146], aC = -0.2;
    // abanica: más rápido cuando le llega el humo y como loco cuando se lo manda a Marcos
    const w = t < 1.9 ? 11 : t < 3.0 ? 15 : 26, amp = t < 3.0 ? 12 : 18;
    mD = [92, 112 + amp * Math.sin(t * w)];
    aC = -0.15 + 0.55 * Math.sin(t * w - 0.6);
    pose.cara = t < 1.9 ? "sonrisa" : t < 2.95 ? (Math.sin(t * 9) > -0.3 ? "dormido" : "sorpresa") : "guino";
    if (t > 1.9 && t < 2.95) pose.rc = 0.06 * Math.sin(t * 18);
    if (t > 3.0 && t < T_C) pose.rc = 0.08;
    if (t >= T_C) {
      // ¡la salchicha! suelta el cartón y coge el pan con las dos manos
      const k = eOut(tramo(t, T_C + 0.15, T_C + 0.45));
      mD = mezcla([92, 112], [60, 128], k); mI = mezcla([-2, 146], [18, 128], k);
      pose.cara = t < T_CAE ? "sorpresa" : t < T_CAE + 0.35 ? "sorpresa" : "risa";
      pose.rc = t < T_CAE ? -0.16 + 0.2 * Math.sin(t * 5) : 0;
      if (t > T_CAE + 0.4 && t < 8.1) {
        // lo enseña orgulloso, en alto
        const k2 = eInOut(tramo(t, T_CAE + 0.4, T_CAE + 0.75));
        const sube = 4 * Math.sin(t * 9);
        mD = mezcla([60, 128], [62, 108 + sube], k2); mI = mezcla([18, 128], [16, 108 + sube], k2);
        pose.cara = "risa"; pose.rc = 0.05 * Math.sin(t * 7);
      }
      if (t >= 8.1) {
        // y le da un mordisco
        const b = boca(0.1), k3 = eInOut(tramo(t, 8.1, 8.5)) * (1 - eInOut(tramo(t, 8.95, 9.3)));
        mD = mezcla([62, 108], [b[0] + 23, b[1] + 9], k3); mI = mezcla([16, 108], [b[0] - 23, b[1] + 9], k3);
        pose.cara = t < 8.55 ? "risa" : t < 9.0 ? "dormido" : "guino"; pose.rc = 0.1;
      }
    }
    pose.manoD = mD; pose.manoI = mI;
    const lleno = t >= T_CAE, largo = t > 8.6 ? 0.72 : 1;
    pose.objI = (g, mano) => {
      g.save();
      if (t >= T_C + 0.15) g.translate(mano[0] + 21, mano[1] - 3); else g.translate(mano[0] + 2, mano[1] - 5);
      g.scale(1.5, 1.5); pan(g, 0, 0, t >= T_C + 0.15 && lleno, largo, t); g.restore();
    };
    if (t < T_C + 0.15) pose.objD = (g, mano) => carton(g, mano, aC);
    return { pose, m, X };
  }
  poseM() {
    const t = this.t;
    const pose = { quien: "marcos", cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    const m = matAv(XM, PIES, ESC);
    // punta de la espátula en pantalla y ángulo
    const reposo = [544, 402];
    let punta = reposo, a = Math.PI - 0.3, mD = [67, 152];
    const toque = (x, ti, h) => {
      // se mete debajo, lanza hacia arriba y vuelve
      const bajo = [x, GY - 2], alto = [x + 6, GY - h];
      if (t < ti - 0.35) return null;
      if (t < ti) return { p: mezcla(reposo, bajo, eInOut(tramo(t, ti - 0.35, ti - 0.05))), a: Math.PI - 0.3 };
      if (t < ti + 0.14) { const k = eOut(tramo(t, ti, ti + 0.14)); return { p: mezcla(bajo, alto, k), a: Math.PI - 0.3 - 0.7 * k }; }
      if (t < ti + 0.6) { const k = eInOut(tramo(t, ti + 0.14, ti + 0.6)); return { p: mezcla(alto, reposo, k), a: Math.PI - 1.0 + 0.7 * k }; }
      return null;
    };
    for (const [x, ti, h] of [[526, 0.95, 80], [478, 2.15, 110], [568, T_C, 150]]) { const r = toque(x, ti, h); if (r) { punta = r.p; a = r.a; } }
    pose.cara = t < 0.95 ? "guino" : t < 2.15 ? "risa" : t < 3.05 ? "guino" : "risa";
    // le llega el humo: tose con la mano en la boca
    if (t > 3.05 && t < T_C) {
      const b = boca(0, "marcos"), k = eInOut(tramo(t, 3.05, 3.3)) * (1 - eInOut(tramo(t, 3.75, T_C)));
      mD = mezcla([67, 152], [b[0] + 6, b[1] + 6], k);
      pose.cara = Math.sin(t * 16) > 0 ? "dormido" : "sorpresa"; pose.rc = 0.08 * Math.sin(t * 20);
    }
    if (t >= T_C) pose.cara = "sorpresa";
    if (t >= T_C + 0.6 && t < T_CAE) {
      // mira arriba con las manos en la cabeza
      const k = eOut(tramo(t, T_C + 0.6, T_C + 0.9));
      punta = mezcla(reposo, [560, 210], k); a = Math.PI - 0.3 - 1.2 * k;
      mD = mezcla([67, 152], [70, 40], k);
      pose.rc = -0.12 + 0.12 * Math.sin(t * 4);
    }
    if (t >= T_CAE) {
      // ¡bien! aplaude con la espátula en alto
      const k = eOut(tramo(t, T_CAE, T_CAE + 0.25));
      punta = mezcla([560, 210], [600, 170 + 10 * Math.sin(t * 14)], k); a = Math.PI - 1.9;
      mD = [92, 36 + 8 * Math.sin(t * 14 + 1)];
      pose.cara = t < T_CAE + 0.2 ? "sorpresa" : "risa"; pose.rc = 0.07 * Math.sin(t * 8);
      if (t > 8.1) { pose.cara = "guino"; mD = mezcla(mD, [84, 120], eInOut(tramo(t, 8.1, 8.4))); }
    }
    const pa = enAv(m, punta), dir = [Math.cos(a), Math.sin(a)];
    const mI = [pa[0] - dir[0] * LS, pa[1] - dir[1] * LS];
    pose.manoI = mI; pose.manoD = mD;
    pose.objI = (g, mano) => espatula(g, mano, a);
    return { pose, m };
  }
  humo(n, vx) {
    for (let i = 0; i < n; i++) this.p.nueva(P.HUMO, GX + azar(-70, 70), GY - 8, vx + azar(-30, 30), azar(-120, -60), azar(1.4, 2.2), azar(36, 60));
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // humo continuo: primero hacia Guillermo, luego (abanicado) hacia Marcos
    const vx = t < 3.0 ? -150 : t < T_C ? 210 : -20;
    if (Math.random() < (t < 1.9 ? 9 : 16) * dt) this.humo(1, vx);
    if (Math.random() < 6 * dt) p.nueva(P.LLAMA, GX + azar(-75, 75), GY - 2, azar(-10, 10), azar(-60, -20), azar(0.25, 0.45), azar(16, 26), Math.random() < 0.3 ? 1 : 0);
    for (const v of VUELTAS) this.una("vuelta" + v.t1, t > v.t1, () => {
      const x = COMIDA[v.i].x; temblar(4, 0.12);
      for (let k = 0; k < 14; k++) p.nueva(P.CHISPA, x + azar(-20, 20), GY - 6, azar(-160, 160), azar(-300, -80), azar(0.3, 0.6), azar(5, 9));
      this.humo(5, 0);
    });
    for (const [k, ti] of [["l1", 0.95], ["l2", 2.15]]) this.una(k, t > ti, () => { for (let j = 0; j < 8; j++) p.nueva(P.CHISPA, COMIDA[k === "l1" ? 1 : 0].x, GY - 6, azar(-120, 120), azar(-260, -60), azar(0.2, 0.5), azar(5, 8)); });
    this.una("salch", t > T_C, () => { temblar(8, 0.2); p.nueva(P.DESTELLO, COMIDA[2].x, GY - 10, 0, 0, 0.25, 120); for (let j = 0; j < 14; j++) p.nueva(P.CHISPA, COMIDA[2].x, GY - 6, azar(-160, 160), azar(-380, -100), azar(0.3, 0.6), azar(5, 9)); });
    this.una("suelta", t > T_C + 0.15, () => { this.carton = { x: this.xG(t) + 70, y: 400, vy: -60, r: -0.2, vr: 5 }; });
    if (this.carton) { const c = this.carton; c.vy += 1300 * dt; c.y += c.vy * dt; c.r += c.vr * dt; if (c.y > PIES - 2) { c.y = PIES - 2; c.vy = 0; c.vr = 0; c.r = 0; c.suelo = true; } }
    this.una("cae", t > T_CAE, () => {
      const x = this.xG(t); temblar(10, 0.25);
      p.nueva(P.DESTELLO, x, 410, 0, 0, 0.3, 170);
      for (let j = 0; j < 16; j++) { const a = azar(-Math.PI, 0), v = azar(120, 330); p.nueva(P.CHISPA, x, 405, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(6, 10)); }
      for (let j = 0; j < 40; j++) p.nueva(P.CONFETI, azar(80, 950), azar(-60, -10), azar(-40, 40), azar(30, 120), azar(2.5, 4), azar(9, 15), j % 5);
    });
    this.una("ñam", t > 8.55, () => { temblar(5, 0.12); });
    p.actualizar(dt);
  }
  fondo() {
    if (this.fondoC) return this.fondoC;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, 330);
    gc.addColorStop(0, "#3d9ef0"); gc.addColorStop(0.7, "#a6dcff"); gc.addColorStop(1, "#ffe9b8");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, 400);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.85; g.drawImage(BLOB.amarillo, -60, -110, 300, 300); g.restore();
    g.fillStyle = "#fff6c4"; g.beginPath(); g.arc(90, 40, 38, 0, 6.283); g.fill();
    g.fillStyle = "rgba(255,255,255,.9)";
    for (const [x, y, s] of [[700, 70, 0.9], [420, 40, 0.6], [880, 150, 0.55]]) {
      g.beginPath(); g.arc(x, y, 26 * s, 0, 6.283); g.arc(x + 30 * s, y - 12 * s, 32 * s, 0, 6.283); g.arc(x + 64 * s, y, 24 * s, 0, 6.283); g.rect(x, y - 4 * s, 64 * s, 24 * s); g.fill();
    }
    // árbol al fondo a la derecha
    g.fillStyle = "#5a3a1e"; g.fillRect(905, 200, 26, 160);
    for (const [x, y, r, col] of [[918, 190, 78, "#2f7a2c"], [870, 220, 52, "#3a8c34"], [965, 225, 55, "#2a6c28"], [918, 140, 50, "#46a03c"]]) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
    // valla de madera
    for (let x = -60; x < W + 60; x += 46) {
      const gr = g.createLinearGradient(x, 0, x + 42, 0);
      gr.addColorStop(0, "#b77c48"); gr.addColorStop(0.5, "#d9a06a"); gr.addColorStop(1, "#a06a3a");
      g.fillStyle = gr;
      g.beginPath(); g.moveTo(x, 452); g.lineTo(x, 300); g.lineTo(x + 21, 284); g.lineTo(x + 42, 300); g.lineTo(x + 42, 452); g.closePath(); g.fill();
      g.strokeStyle = "rgba(80,45,15,.35)"; g.lineWidth = 1.2; g.stroke();
    }
    g.fillStyle = "#8a5a2e"; g.fillRect(-60, 330, W + 120, 14); g.fillRect(-60, 410, W + 120, 14);
    // seto
    for (let x = -60; x < W + 60; x += 38) { g.fillStyle = (x / 38) % 2 ? "#2f7a2c" : "#3a8c34"; g.beginPath(); g.arc(x, 452, 30, Math.PI, 0); g.fill(); }
    // césped
    const gs = g.createLinearGradient(0, 446, 0, H + 60);
    gs.addColorStop(0, "#57b53e"); gs.addColorStop(1, "#2c7a22");
    g.fillStyle = gs; g.fillRect(-60, 446, W + 120, H);
    const r = semilla(197);
    g.strokeStyle = "rgba(20,70,10,.35)"; g.lineWidth = 2;
    for (let i = 0; i < 120; i++) { const x = r() * W, y = 460 + r() * 150; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y - 7); g.stroke(); }
    // guirnalda de bombillas
    g.strokeStyle = "rgba(40,40,40,.7)"; g.lineWidth = 2; g.beginPath();
    for (let x = -60; x <= W + 60; x += 8) g.lineTo(x, 26 + 40 * Math.sin(((x + 60) / (W + 120)) * Math.PI));
    g.stroke();
    const cols = ["#ffd34d", "#ff3d84", "#2fe3e8", "#2bff5b", "#fffdf5"];
    for (let i = 0, x = -30; x < W + 40; x += 64, i++) {
      const y = 26 + 40 * Math.sin(((x + 60) / (W + 120)) * Math.PI);
      g.fillStyle = cols[i % 5]; g.beginPath(); g.ellipse(x, y + 10, 6, 9, 0, 0, 6.283); g.fill();
      g.fillStyle = "#333"; g.fillRect(x - 4, y, 8, 5);
    }
    this.fondoC = c;
    return c;
  }
  parrillaAtras(g, t) {
    // patas
    g.strokeStyle = "#1a1a1e"; g.lineWidth = 7; g.lineCap = "round";
    g.beginPath(); g.moveTo(GX - 60, 470); g.lineTo(GX - 92, PIES); g.moveTo(GX + 60, 470); g.lineTo(GX + 92, PIES); g.moveTo(GX, 488); g.lineTo(GX, PIES + 6); g.stroke();
    g.fillStyle = "#2a2a30"; g.beginPath(); g.arc(GX - 92, PIES, 8, 0, 6.283); g.arc(GX + 92, PIES, 8, 0, 6.283); g.fill();
    g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.ellipse(GX, PIES + 6, 120, 10, 0, 0, 6.283); g.fill();
    // cuenco
    const gr = g.createLinearGradient(GX - 110, 0, GX + 110, 0);
    gr.addColorStop(0, "#0c0c10"); gr.addColorStop(0.35, "#3a3a44"); gr.addColorStop(0.5, "#5a5a66"); gr.addColorStop(1, "#08080a");
    g.fillStyle = gr; g.beginPath(); g.ellipse(GX, GY, 110, 76, 0, 0, Math.PI); g.closePath(); g.fill();
    // brasas
    g.fillStyle = "#1a0a04"; g.beginPath(); g.ellipse(GX, GY, 104, 15, 0, 0, 6.283); g.fill();
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.75 + 0.15 * Math.sin(t * 9);
    g.drawImage(BLOB.naranja, GX - 110, GY - 22, 220, 44); g.drawImage(BLOB.amarillo, GX - 70, GY - 12, 140, 24); g.restore();
    // rejilla
    g.strokeStyle = "#b8bec6"; g.lineWidth = 1.6;
    g.beginPath(); for (let k = -4; k <= 4; k++) { const x = GX + k * 22, h = 14 * Math.sqrt(Math.max(0, 1 - (k * 22 / 104) ** 2)); g.moveTo(x, GY - h); g.lineTo(x, GY + h); } g.stroke();
    g.beginPath(); g.ellipse(GX, GY, 104, 15, 0, 0, 6.283); g.stroke();
  }
  parrillaDelante(g) {
    g.strokeStyle = "#6a6a78"; g.lineWidth = 3; g.beginPath(); g.ellipse(GX, GY, 110, 17, 0, 0.05, Math.PI - 0.05); g.stroke();
    g.fillStyle = "rgba(255,255,255,.3)"; g.beginPath(); g.ellipse(GX - 50, GY + 34, 10, 26, 0.5, 0, 6.283); g.fill();
    g.fillStyle = "#1a1a1e"; rectR(g, GX + 104, GY - 4, 22, 8, 3); g.fill();
  }
  dibujar(g) {
    const t = this.t, eG = this.poseG(), eM = this.poseM();
    fondo(g, "#000");
    g.drawImage(this.fondo(), -60, -60);
    g.fillStyle = "rgba(0,0,0,.22)";
    g.beginPath(); g.ellipse(eG.X, PIES + 4, 54, 10, 0, 0, 6.283); g.ellipse(XM, PIES + 4, 54, 10, 0, 0, 6.283); g.fill();
    this.parrillaAtras(g, t);
    // comida en la parrilla
    for (let i = 0; i < 3; i++) {
      const c = this.comida(i, t);
      if (!c || c.aire) continue;
      if (COMIDA[i].h) hamburguesa(g, c.x, c.y, 1.2, c.lado, c.cruda); else salchicha(g, c.x, c.y, 0, 1.2);
    }
    this.parrillaDelante(g);
    // sombra de la salchicha que cae
    if (t > 5.0 && t < T_CAE) { const k = tramo(t, 5.0, T_CAE), x = this.xG(T_CAE); g.fillStyle = `rgba(0,0,0,${0.3 * k})`; g.beginPath(); g.ellipse(x, PIES + 8, 14 + 30 * k, 5 + 3 * k, 0, 0, 6.283); g.fill(); }
    if (this.carton) { const c = this.carton; g.save(); g.translate(c.x, c.y); g.scale(ESC, ESC * (c.suelo ? 0.32 : 1)); carton(g, [-17, 0], c.r); g.restore(); }
    pintarAvatar(g, eG.m, eG.pose, t);
    pintarAvatar(g, eM.m, eM.pose, t);
    // comida en el aire (por delante)
    for (let i = 0; i < 3; i++) {
      const c = this.comida(i, t);
      if (!c || !c.aire) continue;
      if (COMIDA[i].h) hamburguesa(g, c.x, c.y, 1.3 + 0.3 * Math.sin(c.giro * Math.PI), c.lado, true);
      else salchicha(g, c.x, c.y, c.ang, 1.25);
    }
    this.p.dibujar(g);
    // textos
    const tos = (x, y, ti, tf, s) => { if (t > ti && t < tf) { const k = tramo(t, ti, ti + 0.2); g.save(); g.translate(x, y); g.rotate(-0.08 + 0.05 * Math.sin(t * 20)); g.scale(eBack(k), eBack(k)); txt(g, s, 0, 0, { tam: 40, peso: 400, fam: FC, color: "#fffdf5", borde: "#3a3a3a", bordeAncho: 7, esp: 2, alfa: 1 - tramo(t, tf - 0.15, tf) }); g.restore(); } };
    tos(250, 200, 2.0, 2.95, "¡COF, COF!");
    tos(760, 196, 3.15, 3.95, "¡COF!");
    if (t > T_C && t < T_C + 0.7) {
      const k = eBack(tramo(t, T_C, T_C + 0.15));
      g.save(); g.translate(520, 316); g.rotate(-0.15); g.scale(k, k);
      txt(g, "¡HOP!", 0, 0, { tam: 64, peso: 400, fam: FC, color: "#ffd34d", borde: "#4a1a00", bordeAncho: 9, esp: 3, alfa: 1 - tramo(t, T_C + 0.5, T_C + 0.7) });
      g.restore();
    }
    if (t > 4.7 && t < T_CAE) {
      const a = tramo(t, 4.7, 4.9) * (1 - tramo(t, 5.85, T_CAE));
      txt(g, "¿DÓNDE CAE?", 512, 120, { tam: 50, peso: 400, fam: FC, color: "#fffdf5", borde: "#1a2a4a", bordeAncho: 8, esp: 3, alfa: a });
    }
    if (t > 8.55 && t < 9.3) {
      const k = eBack(tramo(t, 8.55, 8.7)), q = aPant(eG.m, [10, 30]);
      g.save(); g.translate(q[0] - 40, q[1]); g.scale(k, k);
      txt(g, "¡ÑAM!", 0, 0, { tam: 44, peso: 400, fam: FC, color: "#fffdf5", borde: "#4a1a00", bordeAncho: 7, esp: 2, alfa: 1 - tramo(t, 9.1, 9.3) });
      g.restore();
    }
    if (t > T_CAE + 0.05) {
      const d = t - T_CAE - 0.05, k = tramo(d, 0, 0.16), s = lerp(2.6, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 7));
      const spr = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(512, 104); g.rotate(-0.05); g.scale(s * 0.95, s * 0.95);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // iris: se abre sobre la parrilla y se cierra sobre el perrito
    const cI = [GX, 380], cF = aPant(eG.m, [39, 70]);
    const r = t < 1 ? 800 * eInOut(tramo(t, 0.02, 0.7)) : 800 * (1 - eInOut(tramo(t, DUR - 0.75, DUR - 0.04)));
    const cc = t < 1 ? cI : cF;
    if (r < 800) {
      g.save(); g.fillStyle = "#000"; g.beginPath(); g.rect(-60, -60, W + 120, H + 120);
      g.moveTo(cc[0] + Math.max(0, r), cc[1]); g.arc(cc[0], cc[1], Math.max(0, r), 0, 6.2832); g.fill("evenodd"); g.restore();
    }
  }
}

registrar({ id: "00197", nombre: "Barbacoa", crear: () => new Barbacoa() });
})();
