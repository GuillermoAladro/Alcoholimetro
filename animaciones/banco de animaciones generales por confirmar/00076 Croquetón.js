"use strict";
/*
 * 00076 · CROQUETÓN
 *
 * Animación del banco. Empieza y acaba en negro.
 * Fríe croquetas con la sartén sobre un hornillo: saltan una a una (¡POP!) y se colocan en fila en un plato. La última
 * se hincha en el aceite hasta hacerse enorme, sale disparada hacia arriba y le cae en las manos. Le da un bocado
 * (sale humo de la bechamel) con cara de gloria: ¡CROQUETÓN! Y la abraza como a un peluche.
 */
(() => {
const cacheT = cacheTexto();
const HORNILLO = [598, 470];
const PLATO = [800, 458];

/** Croqueta centrada en (x, y), ancho w, alto h. mordisco: { x, y, r } en sus coordenadas (o null). */
function croqueta(g, x, y, w, h, ang, mordisco) {
  g.save(); g.translate(x, y); g.rotate(ang);
  if (mordisco) { g.beginPath(); g.rect(-w, -h * 2, w * 2, h * 4); g.arc(mordisco.x, mordisco.y, mordisco.r, 0, 6.283); g.clip("evenodd"); }
  rectR(g, -w / 2, -h / 2, w, h, h / 2);
  const gr = g.createRadialGradient(-w * 0.15, -h * 0.25, h * 0.1, 0, 0, w * 0.6);
  gr.addColorStop(0, "#f0b45a"); gr.addColorStop(0.55, "#c97a26"); gr.addColorStop(1, "#7c4210");
  g.fillStyle = gr; g.fill();
  g.save(); g.clip();
  // pan rallado
  const n = Math.min(110, Math.round((w * h) / 18)), r = semilla(4321), d = Math.max(0.8, h * 0.032);
  for (const [col, f] of [["rgba(255,214,140,.8)", 1], ["rgba(90,40,5,.45)", 0.7]]) {
    g.fillStyle = col; g.beginPath();
    for (let i = 0; i < n * f; i++) g.rect(r() * w - w / 2, r() * h - h / 2, d * (0.6 + r()), d * (0.6 + r()));
    g.fill();
  }
  g.fillStyle = "rgba(255,255,255,.25)"; g.beginPath(); g.ellipse(-w * 0.12, -h * 0.28, w * 0.28, h * 0.1, 0, 0, 6.283); g.fill();
  if (mordisco) {
    g.fillStyle = "#f9eed2"; g.beginPath(); g.arc(mordisco.x, mordisco.y, mordisco.r + h * 0.14, 0, 6.283); g.fill();
    g.fillStyle = "#e88b9a"; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(mordisco.x + (k - 1.5) * h * 0.14, mordisco.y + mordisco.r + h * 0.07, h * 0.03, 0, 6.283); g.fill(); }
  }
  g.restore();
  g.restore();
}
/** Sartén con aceite; (0, 0) = la mano en el mango. Unidades libres (se llama escalada). */
function sarten(g, x, y, ang, t, n, burbujas) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.fillStyle = "#151517"; rectR(g, -4, -2.6, 34, 5.2, 2.6); g.fill();
  g.fillStyle = "#3a3a3e"; g.fillRect(28, -1.6, 8, 3.2);
  const cx = 66;
  g.fillStyle = "#1f2023"; g.beginPath(); g.ellipse(cx, 2, 31, 12, 0, 0, Math.PI); g.lineTo(cx - 31, -2); g.ellipse(cx, -2, 31, 9, 0, Math.PI, 0, true); g.fill();
  g.fillStyle = "#4a4d52"; g.beginPath(); g.ellipse(cx, -2, 31, 9, 0, 0, 6.283); g.fill();
  const go = g.createLinearGradient(0, -9, 0, 5);
  go.addColorStop(0, "#ffd659"); go.addColorStop(1, "#c98a12");
  g.fillStyle = go; g.beginPath(); g.ellipse(cx, -1.5, 28, 7.2, 0, 0, 6.283); g.fill();
  for (let i = 0; i < n; i++) croqueta(g, cx - 16 + i * 10.5, -2.5 + (i % 2) * 2, 13, 7.5, 0.15 * Math.sin(t * 13 + i * 2), null);
  if (burbujas > 0) {
    g.strokeStyle = "rgba(255,250,220,.85)"; g.lineWidth = 0.7;
    for (let i = 0; i < 12 * burbujas; i++) { const u = (t * 2.2 + i * 0.173) % 1, bx = cx - 24 + ((i * 7.7) % 48), by = -4 + ((i * 3.1) % 6); g.beginPath(); g.arc(bx, by - u * 2, 0.6 + u * 1.6, 0, 6.283); g.stroke(); }
  }
  g.restore();
}

/** El título, pintado una vez (con su brillo) en un lienzo; se rehace si cambian las fuentes. */
function titulo() {
  if (cacheT.has(1)) return cacheT.get(1);
  const c = lienzoNuevo(900, 200), x = c.getContext("2d");
  const gr = x.createLinearGradient(0, 40, 0, 170);
  gr.addColorStop(0, "#ffe7a8"); gr.addColorStop(0.5, "#f0a83a"); gr.addColorStop(1, "#a85a10");
  txt(x, "¡CROQUETÓN!", 450, 150, { tam: 132, peso: 400, fam: FB, color: gr, borde: "#3a1a00", bordeAncho: 14, esp: 3, glow: "rgba(255,160,40,.6)", glowTam: 24, max: 860 });
  txt(x, "¡CROQUETÓN!", 450, 150, { tam: 132, peso: 400, fam: FB, color: gr, esp: 3, max: 860 });
  cacheT.set(1, c);
  return c;
}
class EscenaCroqueton extends Escena {
  constructor() {
    super(9.5);
    titulo(); // se pinta ya, no en el momento del remate
    this.ESC = 1.7; this.X = 372;
    this.p = new Parts(300);
    this.saltos = [0.9, 1.55, 2.15, 2.65, 3.1];
    this.vuelan = []; this.pops = [];
    this.gordo = null; // el croquetón
  }
  estado(t = this.t) {
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let manoD = [100, 128], manoI = [9, 160], sy = 1, angS = 0;
    // salteo: la sartén da saltitos
    const salto = this.saltos.reduce((a, ts) => a + (t > ts - 0.12 && t < ts + 0.1 ? Math.sin(((t - ts + 0.12) / 0.22) * Math.PI) : 0), 0);
    manoD = [100, 128 - 7 * salto + 1.2 * Math.sin(t * 20) * (t > 3.6 && t < 4.35 ? 1 : 0.3)];
    angS = -0.08 * salto;
    if (t > 0.5 && t < 3.6) { pose.cara = t > 1.1 && t < 1.5 ? "sorpresa" : t > 2.0 ? "guino" : "sonrisa"; pose.rc = 0.1 * Math.sin(t * 2.4); }
    // se hincha la última
    if (t >= 3.6 && t < 4.4) { pose.cara = "sorpresa"; pose.rc = 0.06 + 0.02 * Math.sin(t * 40); }
    // deja la sartén en el hornillo
    const kDeja = eInOut(tramo(t, 4.45, 4.75));
    let conSarten = t < 4.75;
    if (t >= 4.45 && t < 4.95) manoD = mezcla([100, 128], [104, 138], kDeja);
    // manos arriba para cazar el croquetón
    const kArriba = eOut(tramo(t, 4.8, 5.05));
    if (t >= 4.4 && t < 5.32) { pose.cara = "sorpresa"; pose.rc = -0.18 * kArriba; }
    let croq = null; // { x, y, ang } en unidades de avatar
    if (t >= 4.8) {
      manoD = mezcla(manoD, [66, -6], kArriba); manoI = mezcla(manoI, [12, -6], kArriba);
      if (t >= 5.32) {
        // lo coge, lo baja al pecho, a la boca, bocado, y lo abraza
        const kBaja = eInOut(tramo(t, 5.4, 5.75)), kBoca = eInOut(tramo(t, 5.85, 6.05)) * (1 - eInOut(tramo(t, 6.15, 6.45)));
        const kAbraza = eInOut(tramo(t, 7.35, 7.7));
        let c = mezcla([39, -26], [39, 104], kBaja);
        c = mezcla(c, [39, 83], kBoca);
        c = mezcla(c, [39, 112], kAbraza);
        croq = { x: c[0], y: c[1], ang: 0.08 * Math.sin(t * 3) * (t > 6.5 ? 1 : 0) };
        manoD = [c[0] + 37, c[1] + 6]; manoI = [c[0] - 37, c[1] + 6];
        if (kAbraza > 0) { manoD = mezcla(manoD, [c[0] - 6, c[1] - 2], kAbraza); manoI = mezcla(manoI, [c[0] + 8, c[1] + 4], kAbraza); }
        sy = 1 - 0.08 * Math.sin(Math.PI * tramo(t, 5.32, 5.55));
        pose.rc = -0.12 * (1 - kBaja) + (t > 6.1 ? 0.04 * Math.sin(t * 14) * (t < 7.3 ? 1 : 0.3) : 0);
        pose.cara = t < 5.85 ? "sorpresa" : t < 6.15 ? "risa" : t < 7.3 ? "dormido" : t < 7.75 ? "guino" : "risa";
        if (kAbraza > 0) pose.rc = 0.18 * kAbraza + 0.04 * Math.sin(t * 5);
      }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    if (conSarten) {
      const nEn = 5 - this.saltos.filter((ts) => t > ts).length;
      const hincha = t > 3.6 ? 1 : 0;
      pose.objD = (g, m) => { sarten(g, m[0] - 2, m[1], angS - 0.06 * kDeja, t, Math.max(0, nEn - hincha), 1 + (t > 3.6 ? 1 : 0)); if (t >= 3.6 && t < 4.35) { const k = eElastico(tramo(t, 3.6, 4.3)); croqueta(g, m[0] + 64, m[1] - 4 - 9 * k, lerp(13, 40, k), lerp(7.5, 24, k), 0.05 * Math.sin(t * 30), null); } };
    }
    if (croq) pose.objI = (g) => croqueta(g, croq.x, croq.y, 80, 46, croq.ang, t > 6.05 ? { x: -8, y: -27, r: 16 } : null);
    const m = matAv(this.X, PIES, this.ESC, 0, 1, sy);
    return { pose, m, conSarten };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, ESC = this.ESC;
    const panPant = () => aPant(this.estado().m, [100 + 64, 124]);
    this.saltos.forEach((ts, i) => this.una("s" + i, t >= ts, () => {
      const q = panPant();
      this.vuelan.push({ t0: t, x0: q[0], y0: q[1], x1: PLATO[0] - 84 + i * 42, y1: PLATO[1] - 12, T: 0.62, alto: 150 + i * 10, giros: 2 + (i % 2) });
      this.pops.push({ t0: t, x: q[0] + 40, y: q[1] - 70 - i * 6, rot: i % 2 ? 0.15 : -0.12 });
      for (let k = 0; k < 8; k++) { const a = azar(-Math.PI, 0), v = azar(120, 320); p.nueva(P.CHISPA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.5), azar(5, 9)); }
    }));
    // humo del aceite
    if (t > 0.3 && t < 4.6 && Math.random() < 9 * dt) { const q = panPant(); p.nueva(P.VAPOR, q[0] + azar(-30, 30), q[1] - 10, azar(-10, 10), azar(-80, -40), azar(0.6, 1.0), azar(18, 30)); }
    if (t > 3.6 && t < 4.35) temblar(3 + 6 * tramo(t, 3.6, 4.3), 0.1);
    this.una("dispara", t >= 4.35, () => {
      const q = panPant();
      this.gordo = { t0: t, x: q[0], y: q[1] - 30 };
      temblar(14, 0.3);
      for (let k = 0; k < 20; k++) { const a = azar(-Math.PI, 0), v = azar(200, 500); p.nueva(P.CHISPA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 11)); }
    });
    this.una("caza", t >= 5.32, () => temblar(12, 0.3));
    this.una("bocado", t >= 6.05, () => {
      temblar(16, 0.45);
      const e = this.estado(), q = aPant(e.m, [33, 60]);
      for (let k = 0; k < 14; k++) this.migas = (this.migas || []).concat([{ x: q[0], y: q[1], vx: azar(-200, 200), vy: azar(-300, -80) }]);
    });
    if (t > 6.1 && t < 8.2 && Math.random() < 14 * dt) {
      const e = this.estado(), q = aPant(e.m, e.pose.manoD ? [e.pose.manoD[0] - 36, e.pose.manoD[1] - 30] : [33, 80]);
      p.nueva(P.VAPOR, q[0] + azar(-8, 8), q[1], azar(-10, 10), azar(-90, -50), azar(0.6, 1.1), azar(16, 28));
    }
    if (this.migas) { for (const c of this.migas) { c.vy += 1200 * dt; c.x += c.vx * dt; c.y += c.vy * dt; } this.migas = this.migas.filter((c) => c.y < PIES); }
    p.alfa = 1 - tramo(t, 8.7, 9.3);
    p.actualizar(dt);
  }
  posVuelo(V, t) {
    const u = clamp((t - V.t0) / V.T, 0, 1);
    return { x: lerp(V.x0, V.x1, u), y: lerp(V.y0, V.y1, u) - V.alto * Math.sin(Math.PI * u), ang: u < 1 ? u * Math.PI * 2 * V.giros : 0, u };
  }
  escenario(g, t, e) {
    // mesa
    const top = 476;
    const gt = g.createLinearGradient(0, top, 0, top + 18);
    gt.addColorStop(0, "#a8743f"); gt.addColorStop(1, "#5b3518");
    g.fillStyle = gt; g.fillRect(520, top, 400, 16);
    g.fillStyle = "#2a190c"; g.fillRect(536, top + 16, 14, PIES - top - 16); g.fillRect(890, top + 16, 14, PIES - top - 16);
    // hornillo con llama azul
    g.fillStyle = "#2a2d31"; rectR(g, HORNILLO[0] - 52, HORNILLO[1] - 14, 104, 20, 4); g.fill();
    g.fillStyle = "#5b6067"; g.fillRect(HORNILLO[0] - 40, HORNILLO[1] - 18, 80, 5);
    g.save(); g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 9; i++) {
      const fx = HORNILLO[0] - 32 + i * 8, h = 14 + 6 * Math.sin(t * 30 + i * 2.1);
      const gr = g.createLinearGradient(0, HORNILLO[1] - 18 - h, 0, HORNILLO[1] - 18);
      gr.addColorStop(0, "rgba(120,180,255,0)"); gr.addColorStop(1, "rgba(80,140,255,.9)");
      g.fillStyle = gr; g.beginPath(); g.moveTo(fx - 4, HORNILLO[1] - 18); g.quadraticCurveTo(fx, HORNILLO[1] - 18 - h * 1.4, fx + 4, HORNILLO[1] - 18); g.fill();
    }
    g.globalAlpha = 0.4; g.drawImage(BLOB2.cian, HORNILLO[0] - 70, HORNILLO[1] - 50, 140, 60);
    g.restore();
    // plato
    g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(PLATO[0], top + 2, 124, 8, 0, 0, 6.283); g.fill();
    g.fillStyle = "#e9e4da"; g.beginPath(); g.ellipse(PLATO[0], PLATO[1], 124, 19, 0, 0, 6.283); g.fill();
    g.fillStyle = "#fffdf7"; g.beginPath(); g.ellipse(PLATO[0], PLATO[1] - 2, 98, 12, 0, 0, 6.283); g.fill();
    g.strokeStyle = "#c22a2a"; g.lineWidth = 2; g.beginPath(); g.ellipse(PLATO[0], PLATO[1], 116, 17, 0, 0, 6.283); g.stroke();
    // la sartén ya en el hornillo
    if (!e.conSarten) { g.save(); g.translate(HORNILLO[0] - 66 * this.ESC, HORNILLO[1] - 28); g.scale(this.ESC, this.ESC); sarten(g, -2, 0, 0, t, 0, 1); g.restore(); }
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    foco(g, 600, 600, PIES, 380, 0.65);
    this.escenario(g, t, e);
    // croquetas ya en fila en el plato
    for (const V of this.vuelan) if (t - V.t0 >= V.T) croqueta(g, V.x1, V.y1, 44, 24, 0, null);
    pintarAvatar(g, e.m, e.pose, t);
    for (const V of this.vuelan) {
      if (t - V.t0 >= V.T) continue;
      const q = this.posVuelo(V, t);
      croqueta(g, q.x, q.y, 46, 26, q.ang, null);
    }
    // el croquetón: sube disparado y vuelve a caer en sus manos
    if (this.gordo && t < 5.32) {
      const G = this.gordo, s = t - G.t0;
      const mano = aPant(this.estado(5.32).m, [39, -26]);
      let x, y;
      if (t < 4.85) { x = lerp(G.x, mano[0], tramo(t, G.t0, 4.85) * 0.5); y = G.y - 1700 * s + 1500 * s * s; }
      else { const u = tramo(t, 4.95, 5.32); x = lerp(lerp(G.x, mano[0], 0.5), mano[0], u); y = lerp(-140, mano[1], u * u); }
      if (t < 4.85 || t > 4.95) croqueta(g, x, y, 80 * this.ESC, 46 * this.ESC, s * 6 * (t < 4.85 ? 1 : 0) + (t > 4.95 ? 0.3 * (1 - tramo(t, 4.95, 5.32)) : 0), null);
      if (t > 4.95) { g.save(); g.strokeStyle = "rgba(255,255,255,.5)"; g.lineWidth = 3; for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(x + i * 30, y - 70); g.lineTo(x + i * 30, y - 130); g.stroke(); } g.restore(); }
    }
    if (this.migas) { g.fillStyle = "#e9a752"; for (const c of this.migas) g.fillRect(c.x - 2, c.y - 2, 4, 4); }
    this.p.dibujar(g);
    // ¡POP!
    for (const P0 of this.pops) {
      const k = (t - P0.t0) / 0.5;
      if (k < 0 || k > 1) continue;
      g.save(); g.translate(P0.x, P0.y - k * 18); g.rotate(P0.rot); g.scale(eBack(Math.min(1, k * 4)), eBack(Math.min(1, k * 4)));
      txt(g, "¡POP!", 0, 0, { tam: 36, peso: 400, fam: FC, color: "#fff7d6", borde: "#6b3a00", bordeAncho: 6, alfa: 1 - tramo(k, 0.7, 1), esp: 1 });
      g.restore();
    }
    // ¡CROQUETÓN!
    if (t > 6.05) {
      const c = titulo(), k = tramo(t, 6.05, 6.3), s = lerp(0.2, 1, eBack(k)) * (1 + 0.025 * Math.sin(t * 7));
      g.save(); g.globalAlpha = 1 - tramo(t, 8.7, 9.2); g.translate(W / 2 + 40, 112); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(c, -c.width / 2, -c.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0, 0.45), tramo(t, 8.85, this.dur - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00076", nombre: "Croquetón", crear: () => new EscenaCroqueton() });
})();
