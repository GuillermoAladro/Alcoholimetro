"use strict";
/*
 * 00082 · BILLAR IMPOSIBLE
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se encienden una a una las tres bombillas de la lámpara de billar. Detrás de la mesa, apunta con el taco y
 * golpea (¡TAC!): la bola blanca rebota por toda la mesa y va metiendo las demás una detrás de otra. La negra se
 * queda temblando en el borde… y cae. ¡CARAMBOLA! Sopla la punta del taco como un pistolero y las bombillas se
 * apagan una a una.
 */
(() => {
// la mesa en perspectiva: coordenadas de mesa X 0–1000 (izq–der), Y 0–500 (fondo–delante)
function proy(X, Y) {
  const v = Y / 500, xL = lerp(196, 70, v), xR = lerp(828, 954, v);
  return [lerp(xL, xR, X / 1000), lerp(338, 556, v)];
}
const radio = (Y) => lerp(12, 16.5, Y / 500);
const TRONERAS = [[0, 0], [500, 0], [1000, 0], [0, 500], [500, 500], [1000, 500]];
const BOLAS = [
  { c: "#f7c21b", X: 620, Y: 300, P: 5 }, { c: "#1f5fd6", X: 820, Y: 420, P: 4 }, { c: "#e0262c", X: 880, Y: 140, P: 2 },
  { c: "#7b2fc0", X: 520, Y: 120, P: 1 }, { c: "#1e9a48", X: 120, Y: 160, P: 0 }, { c: "#ff7a12", X: 200, Y: 380, P: 3 },
  { c: "#8a1a2a", X: 420, Y: 400, P: 4 }, { c: "#111111", X: 700, Y: 220, P: 1, negra: true },
];
const RECORRIDO = [{ b: 0 }, { p: [700, 480] }, { b: 1 }, { p: [980, 300] }, { b: 2 }, { p: [760, 20] }, { b: 3 }, { b: 4 }, { p: [20, 280] }, { b: 5 }, { b: 6 }, { p: [600, 480] }, { b: 7 }];
const C0 = [330, 60], T_TIRO = 2.02;
const ESC = 1.45;

function spriteBola(col, num) {
  const c = lienzoNuevo(64, 64), g = c.getContext("2d");
  const gr = g.createRadialGradient(24, 22, 2, 32, 32, 30);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.18, col); gr.addColorStop(0.85, col); gr.addColorStop(1, "#000000");
  g.fillStyle = gr; g.beginPath(); g.arc(32, 32, 30, 0, 6.283); g.fill();
  if (num) {
    g.fillStyle = "#fffdf5"; g.beginPath(); g.arc(34, 34, 11, 0, 6.283); g.fill();
    txt(g, num, 34, 40, { tam: 15, peso: 800, fam: FT, color: "#111" });
  }
  g.fillStyle = "rgba(255,255,255,.75)"; g.beginPath(); g.ellipse(22, 19, 7, 4.5, -0.6, 0, 6.283); g.fill();
  return c;
}

function lienzoMesa() {
  const c = lienzoNuevo(W, H), g = c.getContext("2d");
  const quad = (a, b, cc, d) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(cc[0], cc[1]); g.lineTo(d[0], d[1]); g.closePath(); };
  // frente de madera de la mesa
  const gf = g.createLinearGradient(0, 580, 0, H);
  gf.addColorStop(0, "#5a2e10"); gf.addColorStop(1, "#2a1206");
  g.fillStyle = gf; quad([22, 584], [1002, 584], [1010, H + 10], [14, H + 10]); g.fill();
  // marco de madera
  const gm = g.createLinearGradient(0, 316, 0, 586);
  gm.addColorStop(0, "#6b3814"); gm.addColorStop(1, "#8f4f1f");
  g.fillStyle = gm; quad([150, 312], [874, 312], [1004, 588], [20, 588]); g.fill();
  g.strokeStyle = "rgba(255,200,140,.35)"; g.lineWidth = 2; g.stroke();
  // bandas (verde oscuro)
  g.fillStyle = "#0f5a2c"; quad([172, 322], [852, 322], [984, 574], [40, 574]); g.fill();
  // tapete
  const gt = g.createLinearGradient(0, 330, 0, 566);
  gt.addColorStop(0, "#14763a"); gt.addColorStop(1, "#1d9a4c");
  g.fillStyle = gt; quad([184, 330], [840, 330], [966, 564], [58, 564]); g.fill();
  // marcas de la madera (diamantes)
  g.fillStyle = "#f4e7c8";
  for (let k = 1; k < 8; k++) { if (k === 4) continue; const a = proy(k * 125, -22), b = proy(k * 125, 524); g.beginPath(); g.arc(a[0], a[1] - 4, 2.4, 0, 6.283); g.fill(); g.beginPath(); g.arc(b[0], b[1] + 8, 3, 0, 6.283); g.fill(); }
  // punto de salida y línea
  const ps = proy(250, 250); g.fillStyle = "rgba(255,255,255,.5)"; g.beginPath(); g.ellipse(ps[0], ps[1], 3, 2, 0, 0, 6.283); g.fill();
  // troneras
  for (const [X, Y] of TRONERAS) {
    const q = proy(X, Y), r = radio(Y) * 1.75;
    g.fillStyle = "#050505"; g.beginPath(); g.ellipse(q[0], q[1], r * 1.1, r * 0.75, 0, 0, 6.283); g.fill();
    g.strokeStyle = "#3a1c08"; g.lineWidth = 3; g.stroke();
  }
  return c;
}

class Billar extends Escena {
  constructor() {
    super(9.5);
    this.p = new Parts(400);
    this.mesa = lienzoMesa();
    this.spr = BOLAS.map((b, i) => spriteBola(b.c, b.negra ? "8" : String(i + 1)));
    this.blanca = spriteBola("#f4f1e8", "");
    // recorrido de la blanca: puntos, tiempos y a qué bola da en cada uno
    const pts = [C0.slice()], golpes = [];
    for (const r of RECORRIDO) {
      if (r.p) { pts.push(r.p); continue; }
      const B = BOLAS[r.b], T = TRONERAS[B.P], L = Math.hypot(T[0] - B.X, T[1] - B.Y);
      pts.push([B.X - ((T[0] - B.X) / L) * 40, B.Y - ((T[1] - B.Y) / L) * 40]);
      golpes.push({ i: pts.length - 1, b: r.b });
    }
    const ts = [T_TIRO];
    for (let k = 1; k < pts.length; k++) {
      const L = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
      ts.push(ts[k - 1] + L / lerp(1750, 560, (k - 1) / (pts.length - 2)));
    }
    this.pts = pts; this.ts = ts;
    this.bolas = BOLAS.map((b) => ({ X: b.X, Y: b.Y, t0: -1, dentro: -1 }));
    for (const gp of golpes) this.bolas[gp.b].t0 = ts[gp.i];
    this.tFin = ts[ts.length - 1];
    this.textos = [];
    // dirección del taco: hacia el primer golpe (en la pantalla)
    const a = proy(C0[0], C0[1]), b = proy(pts[1][0], pts[1][1]), L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    this.u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
    this.punta0 = [a[0] - this.u[0] * 18, a[1] - this.u[1] * 18];
    const mano = [this.punta0[0] - this.u[0] * 120, this.punta0[1] - this.u[1] * 120];
    this.AX = mano[0] - (80 - 39) * ESC; this.AY = mano[1] + (232 - 140) * ESC;
    this.tNegra = -1;
  }
  /** La blanca en coordenadas de mesa. */
  blancaEn(t) {
    const { pts, ts } = this;
    if (t <= ts[0]) return pts[0];
    for (let k = 1; k < pts.length; k++) if (t <= ts[k]) return mezcla(pts[k - 1], pts[k], (t - ts[k - 1]) / (ts[k] - ts[k - 1]));
    const u = eOut(tramo(t, this.tFin, this.tFin + 0.9)), P = pts[pts.length - 1];
    return mezcla(P, [P[0] + 60, P[1] + 70], u);
  }
  /** Cada bola: quieta, rodando a su tronera o ya dentro (null). La negra se queda en el borde. */
  bolaEn(i, t) {
    const B = this.bolas[i], D = BOLAS[i], T = TRONERAS[D.P];
    if (B.t0 < 0 || t < B.t0) return { X: B.X, Y: B.Y, k: 1 };
    const L = Math.hypot(T[0] - B.X, T[1] - B.Y);
    if (D.negra) {
      const borde = 30 / L, u = eOut(tramo(t, B.t0, B.t0 + 1.3)) * (1 - borde);
      const tCae = B.t0 + 1.75;
      if (t < tCae) { const tiembla = t > B.t0 + 1.25 ? Math.sin(t * 40) * 3 : 0; return { X: lerp(B.X, T[0], u) + tiembla, Y: lerp(B.Y, T[1], u), k: 1 }; }
      const c = tramo(t, tCae, tCae + 0.18);
      return c >= 1 ? null : { X: lerp(lerp(B.X, T[0], 1 - borde), T[0], c), Y: lerp(lerp(B.Y, T[1], 1 - borde), T[1], c), k: 1 - c * 0.7 };
    }
    const dur = L / 1300, u = tramo(t, B.t0, B.t0 + dur);
    if (u < 1) return { X: lerp(B.X, T[0], u), Y: lerp(B.Y, T[1], u), k: 1 };
    const c = tramo(t, B.t0 + dur, B.t0 + dur + 0.12);
    return c >= 1 ? null : { X: T[0], Y: T[1], k: 1 - c * 0.7 };
  }
  /** Retroceso del taco a lo largo de su eje (px). */
  taco(t) {
    if (t < 0.9) return -30;
    if (t < 1.75) return -30 + 14 * Math.sin((t - 0.9) * 9);
    if (t < 1.95) return lerp(-30 + 14 * Math.sin(0.85 * 9), -62, eOut(tramo(t, 1.75, 1.95)));
    if (t < T_TIRO) return lerp(-62, 6, eIn(tramo(t, 1.95, T_TIRO)));
    return lerp(6, 0, tramo(t, T_TIRO, 2.4));
  }
  estado() {
    const t = this.t, u = this.u;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    const tNegra = this.bolas[7].t0 + 1.75;
    let manoI = [4, 150], sy = 1;
    const o = this.taco(t);
    const manoP = [this.punta0[0] - u[0] * (120 - o), this.punta0[1] - u[1] * (120 - o)];
    let manoD = [39 + (manoP[0] - this.AX) / ESC, 232 + (manoP[1] - this.AY) / ESC];
    if (t > 0.9 && t < T_TIRO + 0.1) { pose.cara = "guino"; pose.rc = 0.06; }
    // sigue la blanca con la cabeza
    if (t > T_TIRO + 0.1 && t < tNegra) {
      const b = proy(...this.blancaEn(t));
      pose.rc = clamp((b[0] - this.AX) / 2600, -0.12, 0.16);
      pose.cara = t > 2.9 ? "sorpresa" : "sonrisa";
      sy = 1 + 0.02 * tramo(t, 2.9, 3.4);
    }
    if (t > this.bolas[7].t0 + 1.25 && t < tNegra) { pose.cara = "sorpresa"; pose.rc = 0.18 + Math.sin(t * 30) * 0.02; }
    // remate: levanta el taco y sopla la punta
    let tacoV = 0;
    if (t >= tNegra) {
      pose.cara = t < tNegra + 0.9 ? "risa" : t < tNegra + 2.2 ? "guino" : "risa";
      const k = eInOut(tramo(t, tNegra + 0.6, tNegra + 1.0)) * (1 - eInOut(tramo(t, tNegra + 2.1, tNegra + 2.4)));
      manoD = mezcla(manoD, [74, 128], k); tacoV = k;
      manoI = mezcla(manoI, [-14, 20 + Math.sin(t * 9) * 5], eOut(tramo(t, tNegra, tNegra + 0.3)) * (1 - k));
      pose.rc = 0.05 * Math.sin(t * 6) * (1 - k);
    }
    pose.manoD = manoD; pose.manoI = manoI;
    // el taco: la parte de atrás va con el avatar (detrás del brazo); la de delante, sobre la mesa
    const angU = Math.atan2(u[1], u[0]);
    const angTaco = lerp(angU, -Math.PI / 2 + 0.03, tacoV);
    pose.objD = (g, m) => {
      g.save(); g.translate(m[0], m[1]); g.rotate(angTaco); g.scale(1 / ESC, 1 / ESC);
      dibujarTaco(g, -190, tacoV > 0.5 ? 112 : 10);
      g.restore();
    };
    const m = matAv(this.AX, this.AY, ESC, 0, 1, sy);
    return { pose, m, angTaco, tacoV, manoP };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("tac", t > T_TIRO, () => {
      temblar(8, 0.2); const q = proy(...C0);
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.25, 80);
      this.textos.push({ s: "¡TAC!", x: q[0] + 40, y: q[1] - 60, t0: t, tam: 50, rot: -0.15 });
    });
    // al meterse cada bola
    BOLAS.forEach((B, i) => {
      const dentro = this.bolaEn(i, t) === null;
      this.una("dentro" + i, dentro, () => {
        const q = proy(...TRONERAS[B.P]);
        for (let k = 0; k < (B.negra ? 30 : 12); k++) { const a = azar(0, 6.283), v = azar(120, B.negra ? 520 : 320); p.nueva(P.CHISPA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v - 120, azar(0.3, 0.6), azar(6, 11)); }
        temblar(B.negra ? 24 : 5, B.negra ? 0.6 : 0.12);
        if (B.negra) {
          this.tNegra = t;
          p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.45, 260);
          for (let k = 0; k < 160; k++) p.nueva(P.CONFETI, azar(0, W), azar(-260, -10), azar(-60, 60), azar(40, 140), azar(4, 6), azar(9, 15), (Math.random() * 5) | 0);
        } else this.textos.push({ s: "¡" + "PLOC" + "!", x: q[0] + (q[0] < 512 ? 40 : -40), y: q[1] - 34, t0: t, tam: 30, rot: 0.1 * (i % 2 ? 1 : -1) });
      });
    });
    // humo de la punta del taco al soplar
    const tN = this.bolas[7].t0 + 1.75;
    if (t > tN + 1.0 && t < tN + 2.1 && Math.random() < 14 * dt) {
      const e = this.estado(), q = aPant(e.m, e.pose._manoD || e.pose.manoD), a = e.angTaco, L = 116;
      p.nueva(P.VAPOR, q[0] + Math.cos(a) * L + azar(-2, 2), q[1] + Math.sin(a) * L, azar(-6, 18), azar(-70, -40), azar(0.7, 1.1), azar(8, 14));
    }
    p.actualizar(dt);
  }
  /** Bombillas: 0–1 cada una (se encienden y se apagan una a una). */
  bombilla(i, t) {
    const on = tramo(t, 0.12 + i * 0.2, 0.16 + i * 0.2);
    const off = 1 - tramo(t, 8.55 + i * 0.25, 8.6 + i * 0.25);
    return Math.min(on, off);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), u = this.u;
    fondo(g, "#000");
    const luces = [0, 1, 2].map((i) => this.bombilla(i, t)), luz = (luces[0] + luces[1] + luces[2]) / 3;
    // conos de luz de las tres bombillas
    g.save(); g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 3; i++) {
      if (luces[i] <= 0) continue;
      const x = 300 + i * 212;
      g.globalAlpha = 0.11 * luces[i];
      g.fillStyle = "#fff2cf"; g.beginPath(); g.moveTo(x - 50, 70); g.lineTo(x + 50, 70); g.lineTo(x + 190, 580); g.lineTo(x - 190, 580); g.closePath(); g.fill();
    }
    g.restore();
    pintarAvatar(g, e.m, e.pose, t);
    g.drawImage(this.mesa, 0, 0);
    // la mesa a oscuras donde no llega la luz
    if (luz < 1) { g.fillStyle = `rgba(0,0,0,${0.75 * (1 - luz)})`; g.fillRect(0, 300, W, H); }
    g.save(); g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 3; i++) if (luces[i] > 0) { g.globalAlpha = 0.22 * luces[i]; g.drawImage(BLOB2.oroClaro, 300 + i * 212 - 210, 330, 420, 240); }
    g.restore();
    // bolas (de atrás adelante), con sombra
    const lista = [];
    BOLAS.forEach((B, i) => { const b = this.bolaEn(i, t); if (b) lista.push({ X: b.X, Y: b.Y, k: b.k, spr: this.spr[i] }); });
    lista.push({ X: this.blancaEn(t)[0], Y: this.blancaEn(t)[1], k: 1, spr: this.blanca });
    lista.sort((a, b) => a.Y - b.Y);
    for (const b of lista) {
      const q = proy(b.X, b.Y), r = radio(b.Y) * b.k;
      g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(q[0] + r * 0.3, q[1] + r * 0.55, r, r * 0.45, 0, 0, 6.283); g.fill();
      g.drawImage(b.spr, q[0] - r, q[1] - r, r * 2, r * 2);
    }
    // estela de la blanca
    if (t > T_TIRO && t < this.tFin) {
      g.save(); g.globalCompositeOperation = "lighter"; g.lineCap = "round";
      for (let k = 1; k <= 6; k++) {
        const a = proy(...this.blancaEn(t - k * 0.018)), b = proy(...this.blancaEn(t - (k - 1) * 0.018));
        g.strokeStyle = `rgba(255,255,240,${0.35 * (1 - k / 7)})`; g.lineWidth = 16 * (1 - k / 7);
        g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      }
      g.restore();
    }
    // la parte delantera del taco (sobre la mesa), mientras apunta
    if (e.tacoV < 0.02) {
      const mp = e.manoP;
      g.save(); g.translate(mp[0], mp[1]); g.rotate(Math.atan2(u[1], u[0]));
      dibujarTaco(g, 14, 120);
      g.restore();
    }
    this.p.dibujar(g);
    // lámpara de billar
    g.save();
    g.strokeStyle = "#2a2a2a"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(330, -10); g.lineTo(330, 40); g.moveTo(694, -10); g.lineTo(694, 40); g.stroke();
    const gl = g.createLinearGradient(0, 36, 0, 74);
    gl.addColorStop(0, "#1f6b3a"); gl.addColorStop(1, "#0b3018");
    g.fillStyle = gl; rectR(g, 210, 36, 604, 30, 8); g.fill();
    g.fillStyle = "#c9a14a"; g.fillRect(210, 62, 604, 5);
    for (let i = 0; i < 3; i++) {
      const x = 300 + i * 212, a = luces[i];
      g.fillStyle = a > 0.5 ? "#fff6d8" : "#3a3326";
      g.beginPath(); g.ellipse(x, 70, 44, 8, 0, 0, 6.283); g.fill();
      if (a > 0) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = a; g.drawImage(BLOB2.oroClaro, x - 70, 40, 140, 70); g.restore(); }
    }
    g.restore();
    // onomatopeyas
    for (const o of this.textos) {
      const s = t - o.t0; if (s > 0.8) continue;
      const k = eBack(tramo(s, 0, 0.14));
      g.save(); g.translate(o.x, o.y - s * 16); g.rotate(o.rot); g.scale(k, k);
      txt(g, o.s, 0, 0, { tam: o.tam, peso: 400, fam: FC, color: "#fffdf5", borde: "#0c3a1c", bordeAncho: 7, alfa: 1 - tramo(s, 0.6, 0.8), esp: 2 });
      g.restore();
    }
    // ¡CARAMBOLA!
    if (this.tNegra > 0) {
      const kN = t - this.tNegra, k = tramo(kN, 0.03, 0.2), s = lerp(2.8, 1, eIn(k)) * (1 + 0.03 * Math.sin(kN * 8));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * luz; g.translate(620, 200); g.rotate(-0.05); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // a oscuras al principio y al final
    if (luz < 1) { g.fillStyle = `rgba(0,0,0,${Math.pow(1 - luz, 0.6)})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (this._tit) return this._tit;
    const c = lienzoNuevo(760, 210), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 45, 0, 150);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡CARAMBOLA!", 380, 150, { tam: 124, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 11, esp: 3, glow: "rgba(255,190,40,.85)", glowTam: 26, max: 720 });
    return (this._tit = c);
  }
}

/** Taco a lo largo del eje x, de x0 a x1 (px): punta azul en x1 si x1 > 0. */
function dibujarTaco(g, x0, x1) {
  const largo = x1 - x0;
  if (largo <= 0) return;
  // grosor: más gordo atrás (x0 = -190) y fino en la punta (x1 = 120)
  const gro = (x) => lerp(8, 3.4, clamp((x + 190) / 330, 0, 1));
  g.beginPath(); g.moveTo(x0, -gro(x0)); g.lineTo(x1, -gro(x1)); g.lineTo(x1, gro(x1)); g.lineTo(x0, gro(x0)); g.closePath();
  g.fillStyle = "#d9b27a"; g.fill();
  g.fillStyle = "rgba(255,255,255,.45)"; g.fillRect(x0, -gro(x1) * 0.6, largo, 1.4);
  if (x0 < -100) { g.fillStyle = "#3a1a0a"; g.beginPath(); g.moveTo(x0, -gro(x0)); g.lineTo(-100, -gro(-100)); g.lineTo(-100, gro(-100)); g.lineTo(x0, gro(x0)); g.closePath(); g.fill(); }
  if (x1 > 100) { g.fillStyle = "#f4f0e6"; g.fillRect(x1 - 8, -gro(x1), 5, gro(x1) * 2); g.fillStyle = "#2f7fe0"; g.fillRect(x1 - 3, -gro(x1), 3, gro(x1) * 2); }
}

registrar({ id: "00082", nombre: "Billar imposible", crear: () => new Billar() });
})();
