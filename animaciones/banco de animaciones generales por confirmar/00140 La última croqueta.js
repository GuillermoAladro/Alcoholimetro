"use strict";
/*
 * 00140 · LA ÚLTIMA CROQUETA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Queda una croqueta en el plato. Guillermo y Rodrigo se miran de reojo, levantan el tenedor y se lanzan a la vez:
 * los tenedores se cruzan (¡CLING!) y hacen esgrima entre chispas, cada vez más rápido. Un golpe por debajo hace
 * saltar la croqueta, que da vueltas por el aire y cae en la boca de Rodrigo (¡ÑAM!): ¡LA ÚLTIMA ES MÍA!
 */
(() => {
const ESC = 1.8, AY = 652, BARRA = 470;
const XG = 318, XR = 706;
const PLATO = [512, 467], CROQ = [512, 444];
const FT_ = 1.3, LT = 46 * FT_;                  // escala y largo del tenedor (unidades de avatar)
const T_ATAQUE = 1.95, T_LANZA = 4.75, T_BOCA = 5.6, T_TIT = 6.75, T_APAGA = 9.35;
// golpes de la esgrima: [t, x, y] (pantalla); entre uno y otro retroceden
const GOLPES = [[T_ATAQUE, 512, 384], [2.45, 494, 336], [2.9, 532, 398], [3.3, 504, 322], [3.65, 522, 378], [3.95, 498, 348], [4.25, 518, 390], [4.5, 512, 428]];
const aU = (X, q) => [(q[0] - X) / ESC + 39, (q[1] - AY) / ESC + 232];

/** Croqueta centrada en (x, y), ancho w, alto h (como la de Croquetón). */
function croqueta(g, x, y, w, h, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  rectR(g, -w / 2, -h / 2, w, h, h / 2);
  const gr = g.createRadialGradient(-w * 0.15, -h * 0.25, h * 0.1, 0, 0, w * 0.6);
  gr.addColorStop(0, "#f0b45a"); gr.addColorStop(0.55, "#c97a26"); gr.addColorStop(1, "#7c4210");
  g.fillStyle = gr; g.fill();
  g.save(); g.clip();
  const n = Math.min(90, Math.round((w * h) / 18)), r = semilla(4321), d = Math.max(0.8, h * 0.032);
  for (const [col, f] of [["rgba(255,214,140,.8)", 1], ["rgba(90,40,5,.45)", 0.7]]) {
    g.fillStyle = col; g.beginPath();
    for (let i = 0; i < n * f; i++) g.rect(r() * w - w / 2, r() * h - h / 2, d * (0.6 + r()), d * (0.6 + r()));
    g.fill();
  }
  g.fillStyle = "rgba(255,255,255,.25)"; g.beginPath(); g.ellipse(-w * 0.12, -h * 0.28, w * 0.28, h * 0.1, 0, 0, 6.283); g.fill();
  g.restore();
  g.restore();
}
/** Tenedor: (0, 0) en la mano, apunta hacia `ang`. Unidades de avatar. */
function tenedor(g, m, ang) {
  g.save(); g.translate(m[0], m[1]); g.rotate(ang); g.scale(FT_, FT_);
  const gr = g.createLinearGradient(0, -3, 0, 3);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#b9c2cc"); gr.addColorStop(1, "#6d7680");
  g.fillStyle = gr;
  rectR(g, -8, -2.4, 34, 4.8, 2.4); g.fill();                       // mango
  g.beginPath(); g.moveTo(25, -1.5); g.lineTo(31, -4.6); g.lineTo(34, -4.6); g.lineTo(34, 4.6); g.lineTo(31, 4.6); g.lineTo(25, 1.5); g.closePath(); g.fill();
  for (let i = 0; i < 4; i++) { const y = -4.2 + i * 2.8; g.fillRect(33, y - 0.7, 13, 1.4); }
  g.strokeStyle = "rgba(40,45,50,.6)"; g.lineWidth = 0.6; rectR(g, -8, -2.4, 34, 4.8, 2.4); g.stroke();
  g.fillStyle = "rgba(255,255,255,.8)"; g.fillRect(-5, -1.6, 26, 0.9);
  g.restore();
}

class UltimaCroqueta extends Escena {
  constructor() {
    super(9.9);
    this.p = new Parts(300);
    this.bocaR = null;
  }
  luz() { return tramo(this.t, 0, 0.5) * (1 - tramo(this.t, T_APAGA, 9.85)); }
  /** Duelo: punto de cruce, cuánto se retiran (0 = cruzados) y si están en un golpe. */
  duelo(t) {
    if (t < GOLPES[0][0]) return null;
    for (let i = 0; i < GOLPES.length - 1; i++) {
      const [t0, x0, y0] = GOLPES[i], [t1, x1, y1] = GOLPES[i + 1];
      if (t < t1) { const u = (t - t0) / (t1 - t0); return { C: [lerp(x0, x1, eInOut(u)), lerp(y0, y1, eInOut(u))], r: Math.sin(u * Math.PI), i }; }
    }
    const last = GOLPES[GOLPES.length - 1];
    return { C: [last[1], last[2]], r: 0, i: GOLPES.length - 1 };
  }
  /** Trayectoria de la croqueta al saltar: del plato a la boca de Rodrigo. */
  croq(t) {
    if (t < T_LANZA) {
      let hop = 0;
      for (const [tg] of GOLPES) { const d = t - tg; if (d > 0 && d < 0.25) hop = Math.max(hop, Math.sin((d / 0.25) * Math.PI) * 9); }
      return { x: CROQ[0], y: CROQ[1] - hop, ang: hop * 0.02, s: 1 };
    }
    const B = this.bocaR, u = clamp((t - T_LANZA) / (T_BOCA - T_LANZA), 0, 1);
    const x = lerp(CROQ[0], B[0], u), y = lerp(CROQ[1], B[1], u) - 4 * 330 * u * (1 - u);
    return { x, y, ang: u * 6.283 * 2, s: 1 - 0.75 * tramo(t, T_BOCA - 0.08, T_BOCA + 0.04) };
  }
  poses() {
    const t = this.t;
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoI: [8, 136] };
    const R = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true, manoD: [70, 136] };
    let angG = -0.9, angR = Math.PI + 0.9, gD = [72, 130], rI = [6, 130], dxG = 0, dxR = 0, giroG = 0, giroR = 0, yR = 0;
    // la ven, se miran de reojo, levantan el tenedor
    if (t < T_ATAQUE) {
      if (t > 0.5 && t < 0.95) { G.cara = "sorpresa"; R.cara = "sorpresa"; }
      if (t >= 0.95) { G.cara = "guino"; R.cara = "guino"; G.rc = 0.14 * eInOut(tramo(t, 0.95, 1.15)); R.rc = -G.rc; }
      const k = eInOut(tramo(t, 1.25, 1.65));
      gD = mezcla([72, 130], [84, 64], k); rI = mezcla([6, 130], [-6, 64], k);
      angG = lerp(-0.9, -1.35, k); angR = lerp(Math.PI + 0.9, Math.PI + 1.35, k);
      const kA = eIn(tramo(t, 1.7, T_ATAQUE));
      if (kA > 0) {
        const tg = aU(XG, [GOLPES[0][1] + 10, GOLPES[0][2] - 4]), tr = aU(XR, [GOLPES[0][1] - 10, GOLPES[0][2] - 4]);
        const aG = -0.5, aR = Math.PI + 0.5;
        gD = mezcla(gD, [tg[0] - LT * Math.cos(aG), tg[1] - LT * Math.sin(aG)], kA);
        rI = mezcla(rI, [tr[0] - LT * Math.cos(aR), tr[1] - LT * Math.sin(aR)], kA);
        angG = lerp(angG, aG, kA); angR = lerp(angR, aR, kA);
        G.cara = "sorpresa"; R.cara = "sorpresa"; G.rc = 0; R.rc = 0;
        dxG = 10 * kA; dxR = -10 * kA;
      }
    }
    // esgrima
    const D = this.duelo(t);
    if (D && t < T_LANZA + 0.1) {
      const C = D.C, r = D.r, osc = Math.sin(t * 9);
      const aG = -0.5 - 0.35 * r + 0.08 * osc, aR = Math.PI + 0.5 + 0.35 * r - 0.08 * osc;
      const tipG = aU(XG + dxG, [C[0] + 10 - 86 * r, C[1] - 4 - 26 * r]), tipR = aU(XR + dxR, [C[0] - 10 + 86 * r, C[1] - 4 - 26 * r]);
      dxG = 10 * (1 - r); dxR = -10 * (1 - r);
      gD = [tipG[0] - LT * Math.cos(aG), tipG[1] - LT * Math.sin(aG)];
      rI = [tipR[0] - LT * Math.cos(aR), tipR[1] - LT * Math.sin(aR)];
      angG = aG; angR = aR;
      giroG = 0.04 * (1 - r); giroR = -0.04 * (1 - r);
      const caras = [["sorpresa", "guino"], ["guino", "risa"], ["risa", "sorpresa"], ["sorpresa", "guino"], ["guino", "sorpresa"], ["risa", "guino"], ["sorpresa", "risa"], ["guino", "guino"]];
      [G.cara, R.cara] = caras[D.i % caras.length];
      G.rc = 0.05 * Math.sin(t * 7); R.rc = -0.05 * Math.sin(t * 7 + 1);
      // el golpe de abajo: la croqueta sale disparada
      if (t > 4.5) {
        const k = eOut(tramo(t, 4.6, T_LANZA + 0.05));
        gD = mezcla(gD, [gD[0] + 4, gD[1] - 26], k); angG = lerp(angG, -1.1, k);
        G.cara = "sorpresa"; R.cara = "sorpresa";
      }
    }
    // la siguen con la mirada y Rodrigo abre la boca
    if (t >= T_LANZA + 0.1) {
      const k = eInOut(tramo(t, T_LANZA + 0.1, T_LANZA + 0.4));
      gD = mezcla(gD, [88, 44], k); angG = lerp(-1.1, -1.4, k);
      rI = mezcla(rI, [-10, 40], k); angR = lerp(angR, Math.PI + 1.4, k);
      G.cara = "sorpresa"; R.cara = "sorpresa";
      const kB = eInOut(tramo(t, 4.95, 5.4));
      R.rc = 0.22 * kB; G.rc = -0.05 * k;
      dxR = lerp(-10, 20, kB); giroR = 0.05 * kB;
      dxG = lerp(10, 0, k);
    }
    // ¡ÑAM!: mastica feliz; Guillermo se queda con el tenedor vacío
    if (t >= T_BOCA) {
      const d = t - T_BOCA;
      R.cara = d < 0.12 ? "sorpresa" : (Math.floor(d * 7) % 2 ? "risa" : "sonrisa");
      if (d > 1.0) R.cara = "risa";
      R.rc = 0.22 * (1 - eInOut(tramo(d, 0.2, 0.6)));
      yR = d < 1.2 ? -Math.abs(Math.sin(d * 14)) * 4 : 0;
      G.cara = d < 0.6 ? "sorpresa" : "dormido";
      G.rc = d < 0.6 ? 0.1 : 0.12;
      const kG = eInOut(tramo(d, 0.7, 1.2));
      gD = mezcla([88, 44], [74, 116], kG); angG = lerp(-1.4, -0.4, kG);
      giroG = 0.03 * kG;
      // Rodrigo: «es mía» (se señala con el pulgar) y deja el tenedor
      const kR = eInOut(tramo(d, 0.9, 1.25));
      rI = mezcla([-10, 40], [6, 128], kR); angR = lerp(Math.PI + 1.4, Math.PI + 0.9, kR);
      R.manoD = mezcla([70, 136], [52, 106], kR);
      if (d > 1.25) { R.cara = "guino"; R.manoD = [52 + Math.sin(d * 10) * 1.2, 106]; }
    }
    G.manoD = gD; R.manoI = rI;
    const aG = angG, aR = angR;
    G.objD2 = (g, m) => tenedor(g, m, aG);
    R.objI2 = (g, m) => tenedor(g, m, aR);
    return [{ pose: G, m: matAv(XG + dxG, AY, ESC, giroG) }, { pose: R, m: matAv(XR + dxR, AY + yR, ESC, giroR) }];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    if (!this.bocaR) {
      // dónde estará la boca de Rodrigo cuando caiga la croqueta
      const t0 = this.t; this.t = T_BOCA - 0.02;
      const e = this.poses(); this.bocaR = aPant(e[1].m, boca(e[1].pose.rc, "rodrigo"));
      this.t = t0;
    }
    this.una("brillo", t > 0.55, () => p.nueva(P.DESTELLO, CROQ[0], CROQ[1], 0, 0, 0.4, 90));
    GOLPES.forEach(([tg, x, y], i) => this.una("g" + i, t > tg, () => {
      temblar(i === 0 ? 10 : 5, 0.15);
      p.nueva(P.DESTELLO, x, y - 4, 0, 0, 0.22, i === 0 ? 140 : 80);
      for (let k = 0; k < (i === 0 ? 22 : 12); k++) { const a = azar(0, 6.283), v = azar(160, 420); p.nueva(P.CHISPA, x, y - 4, Math.cos(a) * v, Math.sin(a) * v - 120, azar(0.25, 0.5), azar(6, 11)); }
    }));
    this.una("lanza", t > T_LANZA, () => {
      temblar(9, 0.2);
      for (let k = 0; k < 10; k++) p.nueva(P.POLVO, CROQ[0] + azar(-20, 20), CROQ[1], azar(-120, 120), azar(-120, -20), azar(0.4, 0.7), azar(10, 18));
    });
    if (t > T_LANZA && t < T_BOCA && Math.random() < 30 * dt) { const c = this.croq(t); p.nueva(P.PURPURINA, c.x + azar(-10, 10), c.y + azar(-6, 6), azar(-20, 20), azar(-20, 20), azar(0.4, 0.7), azar(8, 14)); }
    this.una("nam", t > T_BOCA, () => {
      temblar(12, 0.3);
      p.nueva(P.DESTELLO, this.bocaR[0], this.bocaR[1], 0, 0, 0.3, 120);
      for (let k = 0; k < 14; k++) { const a = azar(-Math.PI, 0), v = azar(120, 320); p.nueva(P.CHISPA, this.bocaR[0], this.bocaR[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 10)); }
    });
    this.una("tit", t > T_TIT, () => {
      temblar(14, 0.35);
      for (let k = 0; k < 24; k++) { const a = azar(-Math.PI, 0), v = azar(200, 520); p.nueva(P.CHISPA, 512, 120, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(7, 12)); }
    });
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  barra(g) {
    const gr = this.grB || (this.grB = (() => { const q = g.createLinearGradient(0, BARRA, 0, H); q.addColorStop(0, "#5a3218"); q.addColorStop(1, "#24130a"); return q; })());
    g.fillStyle = gr; g.fillRect(-60, BARRA + 10, W + 120, H - BARRA + 60);
    g.fillStyle = "rgba(0,0,0,.35)";
    for (let x = 30; x < W; x += 96) g.fillRect(x, BARRA + 18, 3, H - BARRA);
    g.fillStyle = "#b8862d"; g.fillRect(-60, 556, W + 120, 9); g.fillStyle = "rgba(255,240,190,.6)"; g.fillRect(-60, 557, W + 120, 2);
    g.fillStyle = "#8a5426"; g.fillRect(-60, BARRA - 6, W + 120, 18);
    g.fillStyle = "rgba(255,220,170,.4)"; g.fillRect(-60, BARRA - 6, W + 120, 3);
    g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(-60, BARRA + 12, W + 120, 5);
  }
  plato(g, t) {
    let sal = 0;
    for (const [tg] of GOLPES) { const d = t - tg; if (d > 0 && d < 0.2) sal = Math.max(sal, Math.sin((d / 0.2) * Math.PI) * 3); }
    const [x, y] = PLATO;
    g.save(); g.translate(x, y - sal);
    g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(0, 6, 84, 12, 0, 0, 6.283); g.fill();
    const gp = g.createLinearGradient(0, -14, 0, 8);
    gp.addColorStop(0, "#ffffff"); gp.addColorStop(1, "#c9cdd2");
    g.fillStyle = gp; g.beginPath(); g.ellipse(0, -2, 80, 13, 0, 0, 6.283); g.fill();
    g.fillStyle = "#e8ebee"; g.beginPath(); g.ellipse(0, -4, 56, 8, 0, 0, 6.283); g.fill();
    g.strokeStyle = "#2bff5b"; g.lineWidth = 1.5; g.beginPath(); g.ellipse(0, -2, 72, 11, 0, 0, 6.283); g.stroke();
    // migas
    g.fillStyle = "#c98a3a"; for (const [mx, my] of [[-30, -4], [-18, -2], [26, -5], [36, -2], [10, -1]]) { g.beginPath(); g.arc(mx, my, 1.8, 0, 6.283); g.fill(); }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, a = this.luz(), e = this.poses();
    fondo(g, "#000");
    g.save(); g.globalAlpha = a;
    foco(g, 512, 512, BARRA, 300, 0.9);
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    this.barra(g);
    this.plato(g, t);
    // la croqueta (en el aire, por delante de todo)
    const c = this.croq(t);
    if (c.s > 0.26 && t < T_BOCA + 0.05) croqueta(g, c.x, c.y, 70 * c.s, 38 * c.s, c.ang);
    if (t > 0.5 && t < 1.6) brillo(g, CROQ[0] + 20, CROQ[1] - 14, 18 * Math.sin(tramo(t, 0.5, 1.6) * Math.PI), 1);
    g.restore();
    this.p.dibujar(g);
    // ¡CLING!
    GOLPES.forEach(([tg, x, y], i) => {
      const d = t - tg;
      if (d < 0 || d > 0.32 || (i > 0 && i < GOLPES.length - 1 && i % 2 === 0)) return;
      const k = eBack(tramo(d, 0, 0.08));
      g.save(); g.translate(x + (i % 2 ? -1 : 1) * 40, Math.min(y - 100, 250)); g.rotate(i % 2 ? -0.15 : 0.12); g.scale(k, k);
      txt(g, i === GOLPES.length - 1 ? "¡TOING!" : "¡CLING!", 0, 0, { tam: i === 0 ? 58 : 44, peso: 400, fam: FC, color: "#e9fbff", borde: "#0a3d5c", bordeAncho: 8, esp: 2, alfa: a * (1 - tramo(d, 0.22, 0.32)) });
      g.restore();
    });
    // ¡ÑAM!
    const dN = t - T_BOCA;
    if (dN > 0 && dN < 1.1) {
      const k = eBack(tramo(dN, 0, 0.12)), B = this.bocaR;
      g.save(); g.translate(B[0] + 120, B[1] - 40); g.rotate(0.12); g.scale(k, k);
      txt(g, "¡ÑAM!", 0, 0, { tam: 66, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a2400", bordeAncho: 9, esp: 2, alfa: a * (1 - tramo(dN, 0.85, 1.1)) });
      g.restore();
    }
    // ¡LA ÚLTIMA ES MÍA!
    if (t > T_TIT) {
      // lo dice Rodrigo: bocadillo grande que le apunta a la boca
      const d = t - T_TIT, q = aPant(e[1].m, [40, 30]);
      g.save(); g.globalAlpha = a; g.translate(470, 118); g.rotate(-0.025 + 0.012 * Math.sin(d * 5)); g.translate(-470, -118);
      bocadillo(g, 470, 118, "¡LA ÚLTIMA ES MÍA!", q[0] - 20, q[1] - 30, tramo(d, 0, 0.3), 84);
      g.restore();
    }
    const negro = 1 - a;
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00140", nombre: "La última croqueta", crear: () => new UltimaCroqueta() });
})();
