"use strict";
/*
 * 00135 · LA ÚLTIMA CAÑA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Queda una sola caña en la barra, con un foco encima. Guillermo y Rodrigo la ven, se miran de reojo, sudan… y se
 * lanzan a por ella a cámara lenta (franjas negras de cine, estelas). La cogen a la vez (¡clinc!) y tiran un poco;
 * se miran, sonríen, y Rodrigo saca dos pajitas. Se la beben juntos, mejilla con mejilla: ¡A MEDIAS! La vacían, se
 * ríen y se apaga la lámpara.
 */
(() => {
const ESC = 1.9, AY = 660, BARRA = 470;
const XG = 360, XR = 664, CX = 512, EC = 1.25; // la caña, en el centro y un poco más grande
const T_LENTA = 2.2, T_COGEN = 4.6, T_PAJ = 6.0, T_BEBEN = 6.75, T_VACIA = 8.45;

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) {
    const u = (k[i][2] || eInOut)((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0])), a = k[i - 1][1], b = k[i][1];
    return Array.isArray(a) ? [lerp(a[0], b[0], u), lerp(a[1], b[1], u)] : lerp(a, b, u);
  }
  return k[k.length - 1][1];
}
const aAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
/** Caña (vaso alto); (0, 0) = el centro del vaso. Unidades de avatar. */
function cana(g, x, y, ang, nivel, t) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const ruta = () => { g.beginPath(); g.moveTo(-7.5, 21); g.lineTo(7.5, 21); g.lineTo(10, -21); g.lineTo(-10, -21); g.closePath(); };
  ruta(); g.fillStyle = "rgba(200,225,255,.16)"; g.fill();
  const alto = 40 * clamp(nivel, 0, 1);
  if (alto > 0.5) {
    g.save(); ruta(); g.clip();
    const gr = g.createLinearGradient(0, 21, 0, 21 - alto);
    gr.addColorStop(0, "#c46a00"); gr.addColorStop(1, "#ffc21f");
    g.fillStyle = gr; g.fillRect(-11, 21 - alto, 22, alto);
    g.fillStyle = "rgba(255,245,200,.75)";
    for (let i = 0; i < 7; i++) { const by = 19 - ((t * 20 + i * 6.1) % Math.max(2, alto - 4)); g.beginPath(); g.arc(-5 + ((i * 3.3) % 10), by, 0.8, 0, 6.283); g.fill(); }
    if (nivel > 0.05) { g.fillStyle = "#fffaf0"; g.fillRect(-11, 21 - alto - 4, 22, 5); }
    g.restore();
    if (nivel > 0.85) { g.fillStyle = "#fffaf0"; g.beginPath(); for (let i = 0; i <= 4; i++) g.arc(-9 + i * 4.5, -21, 2.8 + (i % 2), Math.PI, 0); g.fill(); }
  }
  ruta(); g.strokeStyle = "rgba(235,245,255,.9)"; g.lineWidth = 1.1; g.stroke();
  g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.moveTo(-6, 18); g.lineTo(-4.4, 18); g.lineTo(-6.6, -18); g.lineTo(-8.2, -18); g.closePath(); g.fill();
  g.restore();
}
/** Pajita doblada (pantalla): de un punto dentro del vaso, sube y se dobla hasta la boca. */
function pajita(g, abajo, codo, boca, col, a = 1) {
  g.save(); g.globalAlpha *= a; g.lineCap = "round"; g.lineJoin = "round";
  g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 9;
  g.beginPath(); g.moveTo(abajo[0], abajo[1]); g.lineTo(codo[0], codo[1]); g.lineTo(boca[0], boca[1]); g.stroke();
  g.strokeStyle = "#fffdf5"; g.lineWidth = 7; g.stroke();
  g.setLineDash([7, 7]); g.strokeStyle = col; g.stroke(); g.setLineDash([]);
  g.restore();
}
class UltimaCana extends Escena {
  constructor() {
    super(10.3);
    this.p = new Parts(260);
    this.gotas = []; this.cor = [];
  }
  /** Tiempo "de la acción": a cámara lenta entre T_LENTA y T_COGEN. */
  xG(t) { return pista(t, [[T_LENTA, XG], [T_COGEN, XG + 44, (u) => u], [T_BEBEN - 0.3, XG + 44], [T_BEBEN, XG + 56], [T_VACIA + 0.3, XG + 56], [T_VACIA + 0.6, XG + 44]]); }
  xR(t) { return pista(t, [[T_LENTA, XR], [T_COGEN, XR - 44, (u) => u], [T_BEBEN - 0.3, XR - 44], [T_BEBEN, XR - 56], [T_VACIA + 0.3, XR - 56], [T_VACIA + 0.6, XR - 44]]); }
  /** Centro de la caña en pantalla (tiembla cuando tiran de ella). */
  centro(t) {
    const tir = t > T_COGEN + 0.25 && t < 5.6 ? 10 * Math.sin((t - T_COGEN) * 14) * (1 - tramo(t, 5.3, 5.6)) : 0;
    return [CX + tir, BARRA - 4 - 21 * ESC * EC];
  }
  nivel(t) { return 1 - eInOut(tramo(t, T_BEBEN + 0.3, T_VACIA)); }
  poses(t) {
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [64, 130], manoI: [14, 130] };
    const R = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [60, 130], manoI: [16, 130], brazoIDelante: true };
    let gG = 0, gR = 0, dyG = 0, dyR = 0;
    // la ven
    if (t > 0.5 && t < 1.4) { G.cara = R.cara = "sorpresa"; G.rc = 0.12; R.rc = -0.12; }
    // se miran de reojo
    if (t >= 1.4 && t < T_LENTA) { G.cara = R.cara = "guino"; G.rc = 0.06 * Math.sin(t * 3); R.rc = -0.06 * Math.sin(t * 3); }
    const xg = this.xG(t), xr = this.xR(t);
    const mG0 = matAv(xg, AY, ESC), mR0 = matAv(xr, AY, ESC), c = this.centro(t);
    const asaG = aAv(mG0, [c[0] - 12 * ESC * EC, c[1] + 4]), asaR = aAv(mR0, [c[0] + 12 * ESC * EC, c[1] + 4]);
    // ¡a por ella! (a cámara lenta)
    const kL = tramo(t, T_LENTA, T_COGEN);
    if (t >= T_LENTA) {
      const k = eInOut(kL);
      G.manoD = mezcla([64, 130], asaG, k); R.manoI = mezcla([16, 130], asaR, k);
      G.manoI = mezcla([14, 130], [-10, 70], Math.sin(kL * Math.PI) * (t < T_COGEN ? 1 : 0));
      R.manoD = mezcla([60, 130], [88, 70], Math.sin(kL * Math.PI) * (t < T_COGEN ? 1 : 0));
      gG = 0.1 * Math.sin(Math.min(1, kL * 1.2) * Math.PI * 0.5) * (t < T_COGEN + 0.4 ? 1 : 1 - tramo(t, T_COGEN + 0.4, T_COGEN + 0.8));
      gR = -gG;
      if (t < T_COGEN) { G.cara = R.cara = "sorpresa"; G.puntas = R.puntas = 0.7 * kL; G.rc = 0.1; R.rc = -0.1; }
    }
    // la cogen a la vez y tiran
    if (t >= T_COGEN && t < T_PAJ) {
      G.cara = R.cara = t < 5.0 ? "sorpresa" : "guino"; G.puntas = R.puntas = 0.7 * (1 - tramo(t, 5.3, 5.7));
      G.rc = 0.05; R.rc = -0.05;
      if (t > 5.6) { G.cara = R.cara = "sonrisa"; }
    }
    // Rodrigo saca dos pajitas
    if (t >= T_PAJ - 0.3 && t < T_BEBEN) {
      const k = eInOut(tramo(t, T_PAJ - 0.3, T_PAJ + 0.05)) * (1 - eInOut(tramo(t, T_PAJ + 0.4, T_PAJ + 0.7)));
      R.manoD = mezcla([60, 130], [80, 60], k); R.cara = "guino"; G.cara = "risa";
      if (k > 0.2) R.objD2 = (g, m) => { for (const [dx, col] of [[-2, "#ff3d84"], [3, "#2bff5b"]]) { g.save(); g.translate(m[0] + dx, m[1] - 4); g.rotate(-0.1 + dx * 0.06); g.fillStyle = "#fffdf5"; g.fillRect(-1.6, -26, 3.2, 26); g.fillStyle = col; for (let y = -26; y < 0; y += 5) g.fillRect(-1.6, y, 3.2, 2.5); g.restore(); } };
    }
    // beben juntos, mejilla con mejilla
    if (t >= T_BEBEN - 0.3) {
      const k = eInOut(tramo(t, T_BEBEN - 0.3, T_BEBEN)) * (1 - eInOut(tramo(t, T_VACIA + 0.3, T_VACIA + 0.6)));
      gG = 0.07 * k; gR = -0.07 * k;
      G.rc = 0.12 * k; R.rc = -0.12 * k;
      G.cara = R.cara = k > 0.6 ? "dormido" : "sonrisa";
      dyG = 14 * k; dyR = 10 * k;
    }
    if (t > T_VACIA + 0.3) {
      G.cara = R.cara = "risa"; dyG = -2.5 * Math.abs(Math.sin(t * 10)); dyR = -2.5 * Math.abs(Math.sin(t * 10 + 1));
      G.rc = 0.05 * Math.sin(t * 10); R.rc = -0.05 * Math.sin(t * 10 + 1);
    }
    // con las manos en el vaso desde que lo cogen
    if (t >= T_COGEN) {
      const mG1 = matAv(xg, AY + dyG, ESC, gG), mR1 = matAv(xr, AY + dyR, ESC, gR);
      G.manoD = aAv(mG1, [c[0] - 12 * ESC * EC, c[1] + 4]); R.manoI = aAv(mR1, [c[0] + 12 * ESC * EC, c[1] + 4]);
      if (t > T_VACIA + 0.5) { const k = eInOut(tramo(t, T_VACIA + 0.5, T_VACIA + 0.8)); G.manoD = mezcla(G.manoD, [64, 130], k); R.manoI = mezcla(R.manoI, [16, 130], k); }
    }
    return { G, mG: matAv(xg, AY + dyG, ESC, gG), R, mR: matAv(xr, AY + dyR, ESC, gR) };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // sudor de la tensión
    if (t > 1.5 && t < T_COGEN + 1 && Math.random() < 5 * dt) {
      const e = this.poses(t), a = Math.random() < 0.5, q = aPant(a ? e.mG : e.mR, [a ? 8 : 68, 30]);
      this.gotas.push({ x: q[0], y: q[1], vx: (a ? -1 : 1) * azar(30, 90), vy: azar(-160, -60), v: 0.7 });
    }
    for (const d of this.gotas) { const k = t > T_LENTA && t < T_COGEN ? 0.25 : 1; d.vy += 900 * dt * k; d.x += d.vx * dt * k; d.y += d.vy * dt * k; d.v -= dt * k; }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    // motas de polvo flotando a cámara lenta
    if (t > T_LENTA && t < T_COGEN && Math.random() < 14 * dt) p.nueva(P.PURPURINA, azar(100, 924), azar(80, 420), azar(-8, 8), azar(-5, 5), azar(1.2, 2), azar(5, 9));
    this.una("clinc", t > T_COGEN, () => {
      temblar(14, 0.35);
      const c = this.centro(t);
      p.nueva(P.DESTELLO, c[0], c[1], 0, 0, 0.4, 260);
      for (let i = 0; i < 30; i++) { const a = azar(0, 6.283), v = azar(200, 600); p.nueva(P.CHISPA, c[0], c[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(7, 12)); }
    });
    // la cerveza salpica al tirar
    if (t > T_COGEN + 0.25 && t < 5.4 && Math.random() < 14 * dt) { const c = this.centro(t); p.nueva(P.GOTA, c[0] + azar(-12, 12), c[1] - 40, azar(-160, 160), azar(-300, -120), 0.7, azar(3, 5)); }
    this.una("pajitas", t > T_PAJ + 0.55, () => { const c = this.centro(t); for (let i = 0; i < 16; i++) p.nueva(P.PURPURINA, c[0] + azar(-40, 40), c[1] - 70 + azar(-30, 30), azar(-40, 40), azar(-60, 0), azar(0.6, 1), azar(8, 12)); });
    // brillitos al compartir
    if (t > T_BEBEN + 0.2 && t < T_VACIA) this.una("c" + Math.floor(t / 0.35), true, () => this.cor.push({ t0: t, x: CX + azar(-50, 50) }));
    this.una("aah", t > T_VACIA + 0.3, () => temblar(6, 0.2));
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
  dibujar(g) {
    if (!this._tit) this.titulo(); // se prepara en el primer cuadro (negro), no en el remate
    const t = this.t, e = this.poses(t);
    fondo(g, "#000");
    const luz = tramo(t, 0, 0.45) * (1 - tramo(t, 9.7, 10.25));
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.32 * luz;
    g.drawImage(BLOB2.oroClaro, 100, 30, 824, 540); g.restore();
    foco(g, CX, CX, BARRA, 70, luz * (1 - 0.6 * tramo(t, T_COGEN, T_COGEN + 1)));
    // estelas a cámara lenta
    const lenta = t > T_LENTA && t < T_COGEN;
    if (lenta) {
      for (const dt of [0.36, 0.18]) {
        const e2 = this.poses(t - dt);
        g.save(); g.globalAlpha = dt > 0.3 ? 0.18 : 0.3;
        pintarAvatar(g, e2.mR, e2.R, t); pintarAvatar(g, e2.mG, e2.G, t);
        g.restore();
      }
    }
    pintarAvatar(g, e.mR, e.R, t);
    pintarAvatar(g, e.mG, e.G, t);
    this.barra(g);
    // la caña
    const c = this.centro(t), nv = this.nivel(t);
    g.save(); g.translate(c[0], c[1]); g.scale(ESC * EC, ESC * EC); cana(g, 0, 0, 0, nv, t); g.restore();
    if (t < T_LENTA && Math.sin(t * 3) > 0.6) brillo(g, c[0] + 16, c[1] - 30, 22, 1);
    // pajitas
    const kP = eOut(tramo(t, T_PAJ + 0.45, T_PAJ + 0.7));
    if (kP > 0) {
      const bG = aPant(e.mG, boca(e.G.rc)), bR = aPant(e.mR, boca(e.R.rc, "rodrigo"));
      const borde = c[1] - 21 * ESC * EC;
      const subeG = [c[0] - 6, borde - 26 - 30 * (1 - kP)], subeR = [c[0] + 6, borde - 26 - 30 * (1 - kP)];
      const kB = eInOut(tramo(t, T_BEBEN - 0.3, T_BEBEN));
      const bocaG = mezcla([subeG[0] - 40, subeG[1] - 20], [bG[0] + 4, bG[1] + 2], kB), bocaR = mezcla([subeR[0] + 40, subeR[1] - 20], [bR[0] - 4, bR[1] + 2], kB);
      const kBaja = 1 - tramo(t, T_VACIA + 0.3, T_VACIA + 0.6);
      pajita(g, [c[0] - 6, c[1] + 30], subeG, bocaG, "#ff3d84", kP * (t < T_VACIA + 0.3 ? 1 : kBaja));
      pajita(g, [c[0] + 6, c[1] + 30], subeR, bocaR, "#2bff5b", kP * (t < T_VACIA + 0.3 ? 1 : kBaja));
    }
    this.p.dibujar(g);
    g.fillStyle = "#bfe9ff";
    for (const d of this.gotas) { g.beginPath(); g.ellipse(d.x, d.y, 4, 6, 0, 0, 6.283); g.fill(); }
    // brillitos
    for (const h of this.cor) {
      const d = t - h.t0; if (d > 1.2) continue;
      brillo(g, h.x + 10 * Math.sin(d * 5), 250 - d * 90, 20 * Math.sin(Math.min(1, d / 1.2) * Math.PI), 1);
    }
    // cámara lenta: franjas de cine
    const kc = eInOut(tramo(t, T_LENTA - 0.2, T_LENTA + 0.1)) * (1 - eInOut(tramo(t, T_COGEN, T_COGEN + 0.3)));
    if (kc > 0) {
      g.fillStyle = "#000"; g.fillRect(-60, -60, W + 120, 60 + 56 * kc); g.fillRect(-60, H - 56 * kc, W + 120, 120);
      txt(g, "CÁMARA LENTA", 62, 40 - 56 * (1 - kc), { tam: 26, peso: 800, fam: FT, color: "#fffdf5", alin: "left", alfa: 0.85 * kc, esp: 3 });
      g.fillStyle = `rgba(255,61,61,${kc * (Math.sin(t * 6) > 0 ? 1 : 0.3)})`; g.beginPath(); g.arc(42, 31 - 56 * (1 - kc), 8, 0, 6.283); g.fill();
    }
    // ¡CLINC!
    if (t > T_COGEN && t < T_COGEN + 0.8) {
      const k = tramo(t, T_COGEN, T_COGEN + 0.12);
      g.save(); g.translate(CX, 196); g.rotate(-0.06); g.scale(eBack(k), eBack(k));
      txt(g, "¡CLINC!", 0, 0, { tam: 56, peso: 400, fam: FC, color: "#fffdf5", borde: "#3a2400", bordeAncho: 8, alfa: 1 - tramo(t, T_COGEN + 0.6, T_COGEN + 0.8), esp: 2 });
      g.restore();
    }
    // ¡A MEDIAS!
    if (t > T_BEBEN + 0.15) {
      const d = t - T_BEBEN - 0.15, k = tramo(d, 0, 0.17), s = lerp(2.6, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * luz; g.translate(512, 110); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    if (luz < 1) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (this._tit) return this._tit;
    const c = lienzoNuevo(820, 220), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 50, 0, 160);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡A MEDIAS!", 410, 160, { tam: 140, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 12, esp: 5, glow: "rgba(255,190,40,.85)", glowTam: 26, max: 780 });
    return (this._tit = c);
  }
}

registrar({ id: "00135", nombre: "La última caña", crear: () => new UltimaCana() });
})();
