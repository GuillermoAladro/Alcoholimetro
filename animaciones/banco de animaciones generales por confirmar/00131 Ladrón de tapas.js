"use strict";
/*
 * 00131 · LADRÓN DE TAPAS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Rodrigo tiene su platito con una aceituna y una croqueta. Como de espaldas no se pueden poner, «se gira» a su
 * manera: bosteza estirándose con los ojos cerrados y Guillermo le roba la aceituna (zas); estornuda (¡ACHÍS!) y le
 * roba la croqueta. Rodrigo mira el plato vacío (¿?). Guillermo cierra los ojos para saborear y alarga la mano hacia
 * su caña… pero Rodrigo se la ha quitado y se la bebe entera. ¡EH! Rodrigo le guiña con bigote de espuma y acaban
 * riéndose los dos. Se apaga la lámpara.
 */
(() => {
const ESC = 1.9, AY = 660, BARRA = 470;
const XG = 400, XR = 640;
const PLATO = [566, BARRA - 3], ACEITUNA = [546, BARRA - 14], CROQUETA = [586, BARRA - 12], CANA = [452, BARRA - 4];
const T_ACE = 1.45, T_CRO = 3.35, T_CANA = 5.15, T_EH = 6.2;

const pantAU = (x, q) => [(q[0] - x) / ESC + 39, (q[1] - AY) / ESC + 232];
/** Aceituna con palillo; (x, y) = la aceituna (unidades de avatar). */
function aceituna(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(1.3, 1.3);
  g.strokeStyle = "#e9d3a4"; g.lineWidth = 1.1; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -11); g.stroke();
  const gr = g.createRadialGradient(-1.2, -1.2, 0.5, 0, 0, 4.6);
  gr.addColorStop(0, "#c6e36a"); gr.addColorStop(1, "#4d6e12");
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 3.4, 4.2, 0, 0, 6.283); g.fill();
  g.fillStyle = "#d5332a"; g.beginPath(); g.ellipse(0, -3.4, 1.3, 0.8, 0, 0, 6.283); g.fill();
  g.restore();
}
/** Croqueta (unidades de avatar) centrada en (x, y). */
function croqueta(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(1.3, 1.3);
  const gr = g.createLinearGradient(0, -4, 0, 4);
  gr.addColorStop(0, "#f2b14a"); gr.addColorStop(0.5, "#c97a1c"); gr.addColorStop(1, "#7a4206");
  g.fillStyle = gr; rectR(g, -7.5, -4, 15, 8, 4); g.fill();
  g.fillStyle = "rgba(255,225,150,.75)";
  for (let i = 0; i < 9; i++) g.fillRect(-6 + ((i * 3.7) % 12), -3 + ((i * 2.3) % 5), 0.9, 0.9);
  g.restore();
}
/** Caña (vaso alto); (0, 0) = donde se coge, a media altura. Unidades de avatar. */
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
    for (let i = 0; i < 6; i++) { const by = 19 - ((t * 20 + i * 6.1) % Math.max(2, alto - 4)); g.beginPath(); g.arc(-5 + ((i * 3.3) % 10), by, 0.8, 0, 6.283); g.fill(); }
    if (nivel > 0.05) { g.fillStyle = "#fffaf0"; g.fillRect(-11, 21 - alto - 4, 22, 5); }
    g.restore();
    if (nivel > 0.85) { g.fillStyle = "#fffaf0"; g.beginPath(); for (let i = 0; i <= 4; i++) g.arc(-9 + i * 4.5, -21, 2.8 + (i % 2), Math.PI, 0); g.fill(); }
  }
  ruta(); g.strokeStyle = "rgba(235,245,255,.9)"; g.lineWidth = 1.1; g.stroke();
  g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.moveTo(-6, 18); g.lineTo(-4.4, 18); g.lineTo(-6.6, -18); g.lineTo(-8.2, -18); g.closePath(); g.fill();
  g.restore();
}

class Tapas extends Escena {
  constructor() {
    super(9.95);
    this.p = new Parts(240);
  }
  poses() {
    const t = this.t;
    // ---------------- Rodrigo
    const R = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [60, 130], manoI: [16, 131] };
    let dyR = 0, giroR = 0, syR = 1, xr = XR - 26 * Math.sin(tramo(t, T_CANA - 0.4, T_CANA + 0.5) * Math.PI);
    if (t < 1.1) { R.cara = "sonrisa"; R.manoD = [56 + 3 * Math.sin(t * 12), 124]; R.manoI = [22 - 3 * Math.sin(t * 12), 124]; R.brazoIDelante = true; } // se frota las manos
    // 1) bosteza y se estira
    const kE = eInOut(tramo(t, 1.1, 1.4)) * (1 - eInOut(tramo(t, 2.0, 2.3)));
    if (kE > 0) { R.cara = "dormido"; R.manoD = mezcla(R.manoD, [70, 16], kE); R.manoI = mezcla([16, 131], [6, 16], kE); R.brazoIDelante = false; R.rc = 0.1 * kE; syR = 1 + 0.03 * kE; }
    if (t >= 2.3 && t < 2.95) { R.cara = "sorpresa"; R.rc = -0.12 * eOut(tramo(t, 2.5, 2.7)); }
    // 2) estornuda
    if (t >= 2.95 && t < 3.9) {
      const pre = tramo(t, 2.95, 3.3), ach = tramo(t, 3.3, 3.45);
      R.cara = "dormido"; R.rc = 0.12 * eInOut(pre) - 0.22 * eOut(ach) * (1 - tramo(t, 3.6, 3.9));
      dyR = -5 * eInOut(pre) + 6 * eOut(ach) * (1 - tramo(t, 3.6, 3.9));
      R.manoD = mezcla([60, 130], [60, 70], eInOut(tramo(t, 3.0, 3.3)) * (1 - eInOut(tramo(t, 3.6, 3.9))));
    }
    if (t >= 3.9 && t < 4.8) { R.cara = "sorpresa"; R.puntas = 0.6 * tramo(t, 4.05, 4.2) * (1 - tramo(t, 4.6, 4.8)); R.rc = t > 4.25 ? -0.14 : 0; }
    // 3) le quita la caña a Guillermo y se la bebe
    const cU = pantAU(xr, [CANA[0], CANA[1] - 22 * ESC]);
    const kCoge = eInOut(tramo(t, T_CANA - 0.25, T_CANA));
    const bebe = eInOut(tramo(t, T_CANA + 0.25, T_CANA + 0.55)) * (1 - eInOut(tramo(t, 7.15, 7.45)));
    let angC = 0, nivel = 1;
    if (t > T_CANA - 0.3) {
      R.brazoIDelante = true; R.cara = t < T_CANA + 0.2 ? "guino" : "dormido";
      giroR = -0.08 * kCoge * (1 - eInOut(tramo(t, T_CANA + 0.1, T_CANA + 0.4)));
      R.manoI = mezcla([16, 131], cU, kCoge);
      if (t > T_CANA) {
        R.manoI = mezcla(cU, [20, 100], eInOut(tramo(t, T_CANA, T_CANA + 0.25)));
        // a la boca
        const kT = tramo(t, T_CANA + 0.55, 6.95);
        R.rc = 0.2 * bebe + (kT > 0 && kT < 1 ? 0.02 * Math.sin(t * 40) : 0);
        angC = 1.25 * bebe;
        const b = boca(R.rc, "rodrigo"), r = rot2([9, -21], angC);
        R.manoI = mezcla(R.manoI, [b[0] - r[0] - 1, b[1] - r[1] + 1], bebe);
        nivel = 1 - kT;
      }
      // la deja vacía delante de Guillermo
      if (t > 7.15) { R.cara = t < 7.6 ? "guino" : "risa"; R.manoI = mezcla(mezcla([20, 100], cU, eInOut(tramo(t, 7.2, 7.47))), [16, 131], eInOut(tramo(t, 7.5, 7.8))); giroR = -0.07 * Math.sin(tramo(t, 7.2, 7.8) * Math.PI); }
      if (t > 7.6) { dyR = -2.5 * Math.abs(Math.sin(t * 10 + 1)); giroR = 0.03 * Math.sin(t * 5); R.rc = -0.05 * Math.sin(t * 10); }
    }
    const conCana = t > T_CANA && t < 7.47;
    if (conCana) R.objI = (g, m) => cana(g, m[0] + 1, m[1] - 1, angC, nivel, t);
    const mR = matAv(xr, AY + dyR, ESC, giroR, 1, syR);

    // ---------------- Guillermo
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [64, 130], manoI: [14, 130] };
    let dyG = 0, giroG = 0;
    if (t > 0.5 && t < T_ACE) { G.cara = "guino"; G.rc = 0.08; }
    const bG = boca(0);
    // roba algo: zas al plato, a la boca, y vuelve
    const robo = (t0, obj, cuelga) => {
      const ida = eIn(tramo(t, t0, t0 + 0.16)), boc = eInOut(tramo(t, t0 + 0.22, t0 + 0.45)), vuelta = eInOut(tramo(t, t0 + 0.55, t0 + 0.8));
      const pU = pantAU(XG, obj);
      let m = mezcla([64, 130], [pU[0], pU[1] - cuelga], ida);
      m = mezcla(m, [bG[0] + 3, bG[1] - cuelga + 4], boc);
      m = mezcla(m, [64, 130], vuelta);
      return { m, ida, boc, vuelta, lleva: ida >= 1 && boc < 0.97 };
    };
    const r1 = robo(T_ACE, ACEITUNA, 12), r2 = robo(T_CRO, CROQUETA, 6);
    if (t > T_ACE && t < T_ACE + 0.85) { G.manoD = r1.m; giroG = 0.07 * Math.sin(Math.min(1, (t - T_ACE) / 0.45) * Math.PI); G.cara = "guino"; }
    if (t > T_CRO && t < T_CRO + 0.85) { G.manoD = r2.m; giroG = 0.07 * Math.sin(Math.min(1, (t - T_CRO) / 0.45) * Math.PI); G.cara = "guino"; }
    // masca y silba
    const masca = (t > T_ACE + 0.45 && t < 2.95) || (t > T_CRO + 0.45 && t < 4.8);
    if (masca) { G.cara = Math.sin(t * 16) > 0 ? "sonrisa" : "guino"; G.rc = -0.12 + 0.03 * Math.sin(t * 16); }
    // saborea con los ojos cerrados y busca su caña
    const cG = pantAU(XG, [CANA[0], CANA[1] - 22 * ESC]);
    if (t >= 4.8 && t < 6.0) {
      G.cara = "dormido"; G.rc = -0.08 + 0.03 * Math.sin(t * 6);
      const k = eInOut(tramo(t, 5.0, 5.45));
      G.manoD = mezcla([64, 130], [cG[0] - 3, cG[1] + 2], k);
      if (t > 5.45) G.manoD = [cG[0] - 3 + 2 * Math.sin(t * 25), cG[1] + 2 + 1.5 * Math.cos(t * 21)]; // tantea… y no hay nada
    }
    if (t >= 6.0) {
      G.cara = t < 7.6 ? "sorpresa" : "risa"; G.puntas = 0.8 * tramo(t, T_EH - 0.05, T_EH + 0.1) * (1 - tramo(t, 7.4, 7.8));
      G.manoD = mezcla([cG[0] - 3, cG[1] + 2], [96, 70 + 3 * Math.sin(t * 20) * (t < 7.4 ? 1 : 0)], eOut(tramo(t, T_EH - 0.1, T_EH + 0.15)));
      G.rc = t < 7.6 ? 0.1 : 0.05 * Math.sin(t * 10);
      if (t > 7.6) { G.manoD = mezcla(G.manoD, [66, 126], eInOut(tramo(t, 7.6, 7.9))); dyG = -2.5 * Math.abs(Math.sin(t * 10)); giroG = 0.03 * Math.sin(t * 5 + 1); }
    }
    // lo que lleva en la mano se pinta después del plato (en dibujar)
    let lleva = null;
    if (t > T_ACE + 0.12 && r1.lleva) lleva = (g, m) => aceituna(g, m[0], m[1] + 12, 0);
    if (t > T_CRO + 0.12 && r2.lleva) lleva = (g, m) => croqueta(g, m[0], m[1] + 6, 0.2);
    const mG = matAv(XG, AY + dyG, ESC, giroG);
    return { G, mG, R, mR, conCana, angC, nivel, lleva };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    for (const [k, t0] of [["a", T_ACE], ["c", T_CRO]]) this.una(k, t > t0 + 0.16, () => {
      temblar(4, 0.12);
      const q = k === "a" ? ACEITUNA : CROQUETA;
      for (let i = 0; i < 8; i++) p.nueva(P.CHISPA, q[0], q[1], azar(-200, 200), azar(-260, -80), azar(0.25, 0.5), azar(6, 9));
    });
    // migas de la croqueta
    if (t > T_CRO + 0.45 && t < T_CRO + 1.1 && Math.random() < 20 * dt) {
      const e = this.poses(), q = aPant(e.mG, boca(e.G.rc));
      p.nueva(P.CHISPA, q[0] + azar(-8, 8), q[1] + 6, azar(-40, 40), azar(-60, 0), azar(0.4, 0.7), azar(4, 6));
    }
    this.una("achis", t > 3.3, () => {
      temblar(10, 0.25);
      const e = this.poses(), q = aPant(e.mR, boca(0.1, "rodrigo"));
      for (let i = 0; i < 14; i++) p.nueva(P.VAPOR, q[0] + 10, q[1], azar(120, 380), azar(-120, 80), azar(0.4, 0.8), azar(14, 26));
    });
    this.una("eh", t > T_EH, () => temblar(18, 0.4));
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
    const t = this.t, e = this.poses();
    fondo(g, "#000");
    const luz = 1 - tramo(t, 9.3, 9.9);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.4 * luz;
    g.drawImage(BLOB2.oroClaro, 100, 30, 824, 540); g.restore();
    // la jarra de Rodrigo al fondo
    g.save(); g.translate(800, BARRA - 4); g.scale(1.9, 1.9); dibujarJarra(g, [0, -18], 0, 0.5, "asa", t); dibujarJarra(g, [0, -18], 0, 0.5, "cuerpo", t); g.restore();
    pintarAvatar(g, e.mR, e.R, t);
    pintarAvatar(g, e.mG, e.G, t);
    this.barra(g);
    // el plato y lo que queda en él; la caña de Guillermo
    g.save(); g.translate(PLATO[0], PLATO[1]);
    g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(2, 4, 58, 9, 0, 0, 6.283); g.fill();
    const gp = g.createLinearGradient(0, -8, 0, 8); gp.addColorStop(0, "#ffffff"); gp.addColorStop(1, "#c9ced6");
    g.fillStyle = gp; g.beginPath(); g.ellipse(0, 0, 62, 10, 0, 0, 6.283); g.fill();
    g.strokeStyle = "rgba(120,130,140,.6)"; g.lineWidth = 1.5; g.beginPath(); g.ellipse(0, -1, 40, 5.5, 0, 0, 6.283); g.stroke();
    g.restore();
    if (t < T_ACE + 0.14) { g.save(); g.translate(ACEITUNA[0], ACEITUNA[1]); g.scale(ESC, ESC); aceituna(g, 0, 0, -0.15); g.restore(); }
    if (t < T_CRO + 0.14) { g.save(); g.translate(CROQUETA[0], CROQUETA[1]); g.scale(ESC, ESC); croqueta(g, 0, 0, 0); g.restore(); }
    if (!e.conCana) { g.save(); g.translate(CANA[0], CANA[1] - 22 * ESC + 1); g.scale(ESC, ESC); cana(g, 0, 0, 0, t < 7 ? 1 : 0, t); g.restore(); }
    if (e.lleva && e.G._manoD) conMat(g, e.mG, () => e.lleva(g, e.G._manoD));
    // rayas de velocidad del robo
    for (const t0 of [T_ACE, T_CRO]) {
      if (t > t0 && t < t0 + 0.3) {
        const q = aPant(e.mG, e.G._manoD || [64, 130]), a = 1 - tramo(t, t0 + 0.15, t0 + 0.3);
        g.save(); g.strokeStyle = `rgba(255,253,245,${0.8 * a})`; g.lineWidth = 3; g.lineCap = "round";
        for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(q[0] - 30, q[1] + i * 12); g.lineTo(q[0] - 110 + i * 10, q[1] + i * 18); g.stroke(); }
        g.restore();
        txt(g, "¡ZAS!", q[0] - 60, q[1] - 120, { tam: 40, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a2400", bordeAncho: 7, alfa: a, esp: 2 });
      }
    }
    this.p.dibujar(g);
    // ¿? de Rodrigo
    const cab = aPant(e.mR, [38, 2]);
    for (const [t0, t1, s, col] of [[2.35, 2.95, "?", "#fffdf5"], [4.0, 4.8, "¿?", "#ffd34d"]]) {
      if (t > t0 && t < t1) {
        const k = eBack(tramo(t, t0, t0 + 0.15));
        g.save(); g.translate(cab[0] + 10, cab[1] - 30); g.scale(k, k); g.rotate(0.1 * Math.sin(t * 8));
        txt(g, s, 0, 0, { tam: 64, peso: 400, fam: FC, color: col, borde: "#222", bordeAncho: 8, alfa: 1 - tramo(t, t1 - 0.15, t1), esp: 2 });
        g.restore();
      }
    }
    // ¡ACHÍS!
    if (t > 3.3 && t < 4.0) {
      const k = tramo(t, 3.3, 3.42);
      g.save(); g.translate(850, 250); g.rotate(0.12); g.scale(eBack(k), eBack(k));
      txt(g, "¡ACHÍS!", 0, 0, { tam: 56, peso: 400, fam: FC, color: "#fffdf5", borde: "#1d3550", bordeAncho: 8, alfa: 1 - tramo(t, 3.8, 4.0), esp: 2 });
      g.restore();
    }
    // glu glu
    if (t > T_CANA + 0.6 && t < 7.0) {
      const k = (t * 2.2) % 1, q = aPant(e.mR, [60, 20]);
      txt(g, "GLU", q[0] + 50 + k * 20, q[1] - k * 40, { tam: 32, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a2400", bordeAncho: 6, alfa: 1 - k, esp: 2 });
    }
    // ¡EH!
    if (t > T_EH) {
      const d = t - T_EH, k = tramo(d, 0, 0.15), s = lerp(2.8, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 9));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - tramo(t, 8.9, 9.35)); g.translate(470, 120); g.rotate(-0.06); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0, 0.4), 1 - luz);
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (this._tit) return this._tit;
    const c = lienzoNuevo(520, 230), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 180);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡EH!", 260, 180, { tam: 190, peso: 400, fam: FC, color: gr, borde: "#3a1d00", bordeAncho: 16, esp: 8, glow: "rgba(255,190,40,.85)", glowTam: 26 });
    return (this._tit = c);
  }
}

registrar({ id: "00131", nombre: "Ladrón de tapas", crear: () => new Tapas() });
})();
