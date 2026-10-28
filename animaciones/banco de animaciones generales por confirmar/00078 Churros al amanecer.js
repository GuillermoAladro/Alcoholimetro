"use strict";
/*
 * 00078 · CHURROS AL AMANECER
 *
 * Animación del banco. Empieza y acaba en negro.
 * De noche, se ha quedado dormido de pie en una mesa de terraza (Zzz). Sale el sol por detrás de los tejados, el
 * cielo se pone naranja y la luz le despierta. Delante tiene una taza de chocolate y un plato de churros: moja uno,
 * se lo come con cara de felicidad (bigote de chocolate incluido) y saluda al sol: ¡BUENOS DÍAS!
 */
(() => {
const cacheT = cacheTexto();
const HORIZ = 468, SOLX = 800;
const TAZA = [418, 444], PLATO = [596, 446];

const mezclaCol = (a, b, k) => a.map((v, i) => Math.round(lerp(v, b[i], k)));
const css = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;

/** Churro en coordenadas libres: (x, y) = el extremo que se agarra; sale en la dirección `ang`. */
function churro(g, x, y, ang, L, choc) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const gr = g.createLinearGradient(0, -3.4, 0, 3.4);
  gr.addColorStop(0, "#f7cf7c"); gr.addColorStop(0.5, "#d9952e"); gr.addColorStop(1, "#8e5414");
  g.fillStyle = gr; rectR(g, -2, -3.4, L + 2, 6.8, 3.2); g.fill();
  g.strokeStyle = "rgba(255,235,180,.75)"; g.lineWidth = 0.8;
  for (const yy of [-1.6, 0.6]) { g.beginPath(); g.moveTo(0, yy); g.lineTo(L - 1, yy); g.stroke(); }
  g.strokeStyle = "rgba(110,60,10,.5)"; g.lineWidth = 0.7;
  for (const yy of [-0.5, 1.8]) { g.beginPath(); g.moveTo(0, yy); g.lineTo(L - 1, yy); g.stroke(); }
  g.fillStyle = "rgba(255,255,255,.85)";
  for (let i = 0; i < L / 3; i++) g.fillRect((i * 3.7) % L, ((i * 2.3) % 5) - 2.5, 0.8, 0.8);
  if (choc > 0) {
    const cl = Math.min(L, 13);
    g.fillStyle = "#3d1a08"; rectR(g, L - cl, -3.9, cl + 0.6, 7.8, 3.6); g.fill();
    g.fillStyle = "rgba(255,220,190,.35)"; g.fillRect(L - cl + 1, -2.6, cl - 2, 1);
    g.fillStyle = "#3d1a08"; g.beginPath(); g.ellipse(L - cl + 3, 4.6, 1.3, 2 * choc, 0, 0, 6.283); g.fill();
  }
  g.restore();
}

/** El título, pintado una vez (con su brillo) en un lienzo; se rehace si cambian las fuentes. */
function titulo() {
  if (cacheT.has(1)) return cacheT.get(1);
  const c = lienzoNuevo(900, 180), x = c.getContext("2d");
  const gt = x.createLinearGradient(0, 30, 0, 150);
  gt.addColorStop(0, "#fffbe0"); gt.addColorStop(0.55, "#ffd34d"); gt.addColorStop(1, "#ff8a1a");
  txt(x, "¡BUENOS DÍAS!", 450, 138, { tam: 126, peso: 400, fam: FB, color: gt, borde: "#6a2a00", bordeAncho: 13, esp: 3, glow: "rgba(255,170,60,.7)", glowTam: 24, max: 860 });
  txt(x, "¡BUENOS DÍAS!", 450, 138, { tam: 126, peso: 400, fam: FB, color: gt, esp: 3, max: 860 });
  cacheT.set(1, c);
  return c;
}
class EscenaChurros extends Escena {
  constructor() {
    super(9.8);
    titulo(); // se pinta ya, no en el momento del remate
    this.ESC = 1.6; this.X = 470;
    this.p = new Parts(160);
    const r = semilla(5);
    this.estrellas = Array.from({ length: 70 }, () => [r() * W, r() * (HORIZ - 60), 0.6 + r() * 1.4, r() * 6]);
    this.edif = [];
    let x = -20;
    while (x < W + 20) { const w = 40 + r() * 90, h = 30 + r() * 110; this.edif.push([x, w, h, r()]); x += w + 2; }
    this.zetas = [];
  }
  sol() { return eInOut(tramo(this.t, 0.7, 4.6)); }
  estado(t = this.t) {
    const pose = { cara: "dormido", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [72, 156], manoI = [8, 158], sy = 1;
    const L0 = 40;
    let ch = null; // churro en la mano: { ang, L, choc }
    // dormido de pie, cabeceando
    if (t < 2.1) { pose.rc = 0.16 + 0.05 * Math.sin(t * 2.2); sy = 1 + 0.008 * Math.sin(t * 2.2); }
    // la luz le despierta: se tapa los ojos
    if (t >= 2.1 && t < 3.25) {
      pose.cara = t < 2.5 ? "sorpresa" : "guino";
      const k = eInOut(tramo(t, 2.2, 2.5)) * (1 - eInOut(tramo(t, 2.95, 3.2)));
      manoI = mezcla(manoI, [30, 36], k); pose.brazoIDelante = k > 0.2; pose.rc = -0.06 * k;
    }
    // ve los churros: coge uno
    const pl = [39 + (PLATO[0] + 2 - this.X) / this.ESC, 232 - (PIES - (PLATO[1] - 8)) / this.ESC];
    const tz = [39 + (TAZA[0] - this.X) / this.ESC, 232 - (PIES - (TAZA[1] - 30)) / this.ESC];
    if (t >= 3.25) pose.cara = "risa";
    const kCoge = eInOut(tramo(t, 3.35, 3.65)), kMoja = eInOut(tramo(t, 3.85, 4.2)), kBoca = eInOut(tramo(t, 4.75, 5.05));
    const kMoja2 = eInOut(tramo(t, 6.9, 7.2)), kBoca2 = eInOut(tramo(t, 7.6, 7.9));
    const aMoja = 2.45, aBoca = -2.75;
    const manoMoja = [tz[0] - Math.cos(aMoja) * L0, tz[1] - Math.sin(aMoja) * L0];
    const L = t < 5.08 ? L0 : t < 7.93 ? 29 : 18;
    const manoBoca = (LL) => { const b = boca(pose.rc); return [b[0] - Math.cos(aBoca) * LL + 1, b[1] - Math.sin(aBoca) * LL]; };
    if (t >= 3.35) {
      let mano = mezcla(manoD, pl, kCoge), ang = 0.2;
      if (t > 3.65) {
        const dip = t > 4.2 && t < 4.6 ? Math.sin((t - 4.2) * 15.7) * 3 : 0;
        mano = mezcla(pl, [manoMoja[0], manoMoja[1] + dip], kMoja); ang = lerp(0.2, aMoja, kMoja);
      }
      if (t > 4.75) {
        pose.rc = -0.1 * kBoca;
        mano = mezcla(mano, manoBoca(L0), kBoca); ang = lerp(aMoja, aBoca, kBoca);
      }
      // mastica y saluda al sol con el churro en la mano
      if (t > 5.3) {
        const kAbajo = eInOut(tramo(t, 5.3, 5.65));
        mano = mezcla(manoBoca(29), [86, 112], kAbajo); ang = lerp(aBoca, -1.2, kAbajo);
        if (t > 6.9) { mano = mezcla([86, 112], [manoMoja[0], manoMoja[1]], kMoja2); ang = lerp(-1.2, aMoja, kMoja2); }
        if (t > 7.6) { pose.rc = -0.1 * kBoca2; mano = mezcla(mano, manoBoca(29), kBoca2); ang = lerp(aMoja, aBoca, kBoca2); }
        if (t > 8.1) { const k = eInOut(tramo(t, 8.1, 8.45)); mano = mezcla(manoBoca(18), [86, 112], k); ang = lerp(aBoca, -1.2, k); }
      }
      manoD = mano;
      const choc = (t > 4.25 && t < 5.08) || (t > 7.15 && t < 7.93) ? 1 : 0;
      ch = { ang, L, choc };
    }
    if (t >= 5.05 && t < 6.0) { pose.cara = "dormido"; pose.rc = -0.05 + 0.04 * Math.sin(t * 13); }
    if (t >= 6.0 && t < 6.9) {
      pose.cara = t < 6.45 ? "risa" : "guino";
      pose.brazoIDelante = false;
      manoI = [-14 + 4 * Math.sin(t * 16), 52]; // saluda al sol
    }
    if (t >= 7.93 && t < 8.6) { pose.cara = "dormido"; pose.rc = -0.05 + 0.04 * Math.sin(t * 13); }
    if (t >= 8.6) pose.cara = "risa";
    pose.manoD = manoD; pose.manoI = manoI;
    if (ch) pose.objD2 = (g, m) => churro(g, m[0] - 1, m[1] - 1, ch.ang, ch.L, ch.choc);
    const m = matAv(this.X, PIES, this.ESC, 0, 1, sy);
    return { pose, m, bigote: t > 5.08 };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // Zzz
    if (t > 0.2 && t < 2.0 && Math.random() < 1.6 * dt) { const e = this.estado(), q = aPant(e.m, [66, 6]); this.zetas.push({ x: q[0], y: q[1], t0: t, tam: azar(28, 44) }); }
    this.zetas = this.zetas.filter((z) => t - z.t0 < 1.6);
    // humo del chocolate
    if (t > 0.5 && Math.random() < 4 * dt) p.nueva(P.VAPOR, TAZA[0] + azar(-14, 14), TAZA[1] - 44, azar(-8, 8), azar(-45, -25), azar(0.7, 1.1), azar(10, 16));
    this.una("despierta", t > 2.1, () => temblar(6, 0.25));
    this.una("bocado", t > 5.05, () => { const e = this.estado(), q = aPant(e.m, boca(e.pose.rc)); for (let k = 0; k < 8; k++) p.nueva(P.PURPURINA, q[0] + azar(-20, 20), q[1] + azar(-10, 10), azar(-60, 60), azar(-80, 0), azar(0.5, 0.9), azar(5, 9)); });
    this.una("titulo", t > 5.6, () => temblar(10, 0.3));
    p.alfa = 1 - tramo(t, 9.0, 9.6);
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), k = this.sol();
    // cielo
    const noche = [[3, 4, 12], [8, 10, 30], [14, 16, 40]], alba = [[40, 30, 90], [170, 70, 110], [255, 120, 60]], dia = [[70, 120, 210], [255, 170, 110], [255, 215, 150]];
    const col = (i) => (k < 0.5 ? mezclaCol(noche[i], alba[i], k * 2) : mezclaCol(alba[i], dia[i], (k - 0.5) * 2));
    const gr = g.createLinearGradient(0, 0, 0, HORIZ);
    gr.addColorStop(0, css(col(0))); gr.addColorStop(0.6, css(col(1))); gr.addColorStop(1, css(col(2)));
    g.fillStyle = gr; g.fillRect(-60, -60, W + 120, HORIZ + 60);
    // estrellas
    const aE = 1 - tramo(k, 0.1, 0.45);
    if (aE > 0) { g.fillStyle = "#fffbe8"; for (const [x, y, r, f] of this.estrellas) { g.globalAlpha = aE * (0.5 + 0.5 * Math.sin(t * 3 + f)); g.fillRect(x, y, r, r); } g.globalAlpha = 1; }
    // el sol
    const sy = lerp(HORIZ + 90, 250, k);
    g.save(); g.globalCompositeOperation = "lighter";
    g.globalAlpha = 0.9 * tramo(k, 0.0, 0.3); g.drawImage(BLOB2.oro, SOLX - 380, sy - 300, 760, 600);
    g.globalAlpha = 0.2 * tramo(k, 0.3, 1);
    g.fillStyle = "#fff0b0";
    for (let i = 0; i < 12; i++) {
      const a = t * 0.25 + (i * Math.PI) / 6;
      g.beginPath(); g.moveTo(SOLX + Math.cos(a - 0.06) * 80, sy + Math.sin(a - 0.06) * 80); g.lineTo(SOLX + Math.cos(a) * 560, sy + Math.sin(a) * 560); g.lineTo(SOLX + Math.cos(a + 0.06) * 80, sy + Math.sin(a + 0.06) * 80); g.closePath(); g.fill();
    }
    g.restore();
    const gs = g.createRadialGradient(SOLX - 15, sy - 15, 8, SOLX, sy, 66);
    gs.addColorStop(0, "#fffbe0"); gs.addColorStop(0.6, "#ffd34d"); gs.addColorStop(1, "#ff9a1a");
    g.fillStyle = gs; g.beginPath(); g.arc(SOLX, sy, 64, 0, 6.283); g.fill();
    // tejados
    const ce = css(mezclaCol([6, 6, 14], [70, 40, 60], k));
    g.fillStyle = ce;
    for (const [x, w, h, f] of this.edif) {
      g.fillRect(x, HORIZ - h, w, h + 2);
      if (f > 0.6) g.fillRect(x + w * 0.2, HORIZ - h - 16, 6, 16);
    }
    // ventanas encendidas que se apagan al hacerse de día
    g.fillStyle = `rgba(255,214,120,${0.8 * (1 - tramo(k, 0.3, 0.8))})`;
    for (const [x, w, h, f] of this.edif) for (let i = 0; i < 3; i++) if (((f * 10 + i) | 0) % 3 === 0) g.fillRect(x + 8 + i * 14, HORIZ - h + 14 + i * 9, 6, 8);
    // suelo de la terraza
    const gf = g.createLinearGradient(0, HORIZ, 0, H);
    gf.addColorStop(0, css(mezclaCol([10, 10, 16], [120, 80, 70], k))); gf.addColorStop(1, css(mezclaCol([2, 2, 4], [40, 26, 26], k)));
    g.fillStyle = gf; g.fillRect(-60, HORIZ, W + 120, H - HORIZ + 60);
    // luz cálida sobre él
    pintarAvatar(g, e.m, e.pose, t);
    if (k > 0.2) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.22 * tramo(k, 0.2, 1); g.drawImage(BLOB.naranja, this.X - 40, 150, 260, 420); g.restore(); }
    // bigote de chocolate
    if (e.bigote) {
      conMat(g, e.m, () => {
        g.translate(RIG.cuello[0], RIG.cuello[1]); g.rotate(e.pose.rc); g.translate(-RIG.cuello[0], -RIG.cuello[1]);
        g.fillStyle = "rgba(70,30,8,.88)";
        g.beginPath(); g.moveTo(31, 52); g.quadraticCurveTo(39, 47.5, 47, 52); g.quadraticCurveTo(43, 54.5, 39, 52.6); g.quadraticCurveTo(35, 54.5, 31, 52); g.fill();
      });
    }
    this.mesa(g, t, k);
    this.p.dibujar(g);
    // Zzz
    for (const z of this.zetas) {
      const u = (t - z.t0) / 1.6;
      txt(g, "Z", z.x + 30 * u + 8 * Math.sin(u * 8), z.y - 70 * u, { tam: z.tam * (0.6 + 0.6 * u), peso: 400, fam: FC, color: "#cfe4ff", borde: "#1a2440", bordeAncho: 5, alfa: Math.min(1, u * 5) * (1 - u) });
    }
    // ¡BUENOS DÍAS!
    if (t > 5.6) {
      const c = titulo(), kk = tramo(t, 5.6, 5.85), s = lerp(0.2, 1, eBack(kk)) * (1 + 0.02 * Math.sin(t * 5));
      g.save(); g.globalAlpha = 1 - tramo(t, 8.9, 9.4); g.translate(W / 2 - 40, 108); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(c, -c.width / 2, -c.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0, 0.6), tramo(t, 9.1, this.dur - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  mesa(g, t, k) {
    const cx = 505, top = 452;
    // pie de hierro
    g.fillStyle = "#151518"; g.fillRect(cx - 6, top + 10, 12, PIES - top - 14);
    g.fillStyle = "#1d1d22"; g.beginPath(); g.ellipse(cx, PIES - 4, 60, 8, 0, 0, 6.283); g.fill();
    // tablero de mármol
    g.fillStyle = "#8c8a86"; g.beginPath(); g.ellipse(cx, top + 6, 175, 20, 0, 0, Math.PI); g.fill();
    const gm = g.createLinearGradient(0, top - 20, 0, top + 20);
    gm.addColorStop(0, "#f4f2ee"); gm.addColorStop(1, "#c9c6c0");
    g.fillStyle = gm; g.beginPath(); g.ellipse(cx, top, 175, 20, 0, 0, 6.283); g.fill();
    if (k > 0.2) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.25 * k; g.fillStyle = "#ffb060"; g.beginPath(); g.ellipse(cx + 40, top - 2, 120, 12, 0, 0, 6.283); g.fill(); g.restore(); }
    // plato con churros
    g.fillStyle = "#d9d4ca"; g.beginPath(); g.ellipse(PLATO[0], PLATO[1], 80, 13, 0, 0, 6.283); g.fill();
    g.fillStyle = "#fffdf7"; g.beginPath(); g.ellipse(PLATO[0], PLATO[1] - 2, 64, 8, 0, 0, 6.283); g.fill();
    const quedan = t < 3.6 ? 4 : 3;
    for (let i = 0; i < quedan; i++) { g.save(); g.translate(PLATO[0] - 56 + i * 6, PLATO[1] - 6 - i * 3.5); g.scale(this.ESC, this.ESC); churro(g, 0, 0, -0.06 + i * 0.03, 64 / this.ESC + (i % 2) * 4, 0); g.restore(); }
    // taza de chocolate con plato
    const [tx, ty] = TAZA;
    g.fillStyle = "#e3ded4"; g.beginPath(); g.ellipse(tx, ty, 54, 10, 0, 0, 6.283); g.fill();
    g.strokeStyle = "#f6f3ec"; g.lineWidth = 6; g.beginPath(); g.ellipse(tx + 34, ty - 24, 11, 10, 0, -1.4, 1.4); g.stroke();
    const gc = g.createLinearGradient(tx - 32, 0, tx + 32, 0);
    gc.addColorStop(0, "#c9c4bb"); gc.addColorStop(0.4, "#ffffff"); gc.addColorStop(1, "#bdb7ad");
    g.fillStyle = gc; g.beginPath(); g.moveTo(tx - 32, ty - 40); g.lineTo(tx + 32, ty - 40); g.quadraticCurveTo(tx + 30, ty - 4, tx, ty - 3); g.quadraticCurveTo(tx - 30, ty - 4, tx - 32, ty - 40); g.fill();
    g.fillStyle = "#f6f3ec"; g.beginPath(); g.ellipse(tx, ty - 40, 32, 7, 0, 0, 6.283); g.fill();
    g.fillStyle = "#3d1a08"; g.beginPath(); g.ellipse(tx, ty - 40, 28, 5.2, 0, 0, 6.283); g.fill();
    g.fillStyle = "rgba(255,210,170,.35)"; g.beginPath(); g.ellipse(tx - 8, ty - 41, 12, 1.6, 0, 0, 6.283); g.fill();
  }
}

registrar({ id: "00078", nombre: "Churros al amanecer", crear: () => new EscenaChurros() });
})();
