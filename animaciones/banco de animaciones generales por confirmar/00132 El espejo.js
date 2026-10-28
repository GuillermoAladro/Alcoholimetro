"use strict";
/*
 * 00132 · EL ESPEJO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Guillermo llega a un gran espejo con marco dorado; dentro está Rodrigo, que hace de reflejo y le copia cada
 * movimiento al revés y a la vez (andar, peinarse, saludar, saltar, agacharse, la pata coja, la cara de borracho).
 * Guillermo levanta la jarra como para beber y se para… y Rodrigo, en vez de pararse, se la bebe entera. ¿ESPEJO?
 * Rodrigo sale del marco riéndose y Guillermo acaba riéndose también. Se apaga la luz.
 */
(() => {
const ESC = 1.5, EJE = 515;
const MARCO = { x0: 548, x1: 852, y0: 118, y1: PIES };
const T_ROMPE = 6.75; // a partir de aquí Rodrigo deja de copiar

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) {
    const u = (k[i][2] || eInOut)((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0])), a = k[i - 1][1], b = k[i][1];
    return Array.isArray(a) ? [lerp(a[0], b[0], u), lerp(a[1], b[1], u)] : lerp(a, b, u);
  }
  return k[k.length - 1][1];
}
/** Jarra en la mano izquierda (vista en espejo). */
function jarraIzq(g, m, inc, nivel, t) {
  g.save(); g.translate(m[0], m[1]); g.scale(-1, 1);
  dibujarJarra(g, [0, 0], inc, nivel, "asa", t); dibujarJarra(g, [0, 0], inc, nivel, "cuerpo", t);
  g.restore();
}

class Espejo extends Escena {
  constructor() {
    super(10.3);
    this.p = new Parts(220);
    this.fase = 0;
  }
  /** Lo que hace Guillermo: pose + x + dy (px) + giro + sx, sy. */
  guillermo(t) {
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 150], manoI: [9, 160], jarra: { inc: 0.05, nivel: 1 } };
    let x = pista(t, [[0.3, -110], [1.45, 330, eOut], [2.95, 330], [3.45, 372], [T_ROMPE + 1.6, 372], [T_ROMPE + 2.0, 340]]);
    let dy = 0, giro = 0, sx = 1, sy = 1;
    if (t > 0.3 && t < 1.45) { const a = andar(this.fase, 1); G.piernaI = a.piernaI; G.piernaD = a.piernaD; dy = a.bote * ESC; G.manoI = [9 - 5 * Math.sin(this.fase), 160]; }
    // se mira y se peina
    if (t > 1.5 && t < 2.25) {
      const k = eInOut(tramo(t, 1.5, 1.7)) * (1 - eInOut(tramo(t, 2.05, 2.25)));
      G.brazoIDelante = false; G.manoI = mezcla([9, 160], [16 + 6 * Math.sin(t * 18), 6], k);
      G.cara = "guino"; G.rc = -0.06 * k;
    }
    // saluda
    if (t > 2.25 && t < 2.95) {
      const k = eInOut(tramo(t, 2.25, 2.4)) * (1 - eInOut(tramo(t, 2.8, 2.95)));
      G.manoI = mezcla([9, 160], [-18 + 12 * Math.sin(t * 22), 30], k); G.cara = "risa";
    }
    // se acerca con sospecha
    if (t > 2.95 && t < 3.5) { G.cara = "guino"; giro = 0.07 * Math.sin(tramo(t, 2.95, 3.5) * Math.PI); G.rc = 0.08; }
    // salto con los brazos arriba
    if (t > 3.5 && t < 4.05) {
      const u = tramo(t, 3.5, 4.05);
      dy = -70 * Math.sin(u * Math.PI); G.manoI = [-6, 0]; G.cara = "sorpresa"; sy = 1 + 0.06 * Math.sin(u * Math.PI);
      G.piernaI = [-8, 0.12]; G.piernaD = [-8, -0.12];
    }
    // se agacha de golpe
    if (t > 4.05 && t < 4.6) { const k = Math.sin(tramo(t, 4.05, 4.6) * Math.PI); sy = 1 - 0.28 * k; sx = 1 + 0.08 * k; G.cara = "guino"; G.manoI = [0, 150]; }
    // a la pata coja haciendo el avión
    if (t > 4.6 && t < 5.35) {
      const u = tramo(t, 4.6, 5.35), k = Math.sin(u * Math.PI);
      G.piernaI = [-22 * Math.min(1, k * 3), 0.25 * Math.min(1, k * 3)]; G.manoI = mezcla([9, 160], [-52, 82], Math.min(1, k * 3));
      giro = 0.12 * Math.sin(t * 9) * k; dy = -10 * Math.abs(Math.sin(t * 12)) * k; G.cara = "risa";
      G.jarra.inc = -0.5 * Math.min(1, k * 3);
    }
    // cara de borracho y meneo loco
    if (t > 5.35 && t < 6.0) {
      const k = Math.sin(tramo(t, 5.35, 6.0) * Math.PI);
      G.cara = "borracho"; G.rc = 0.25 * Math.sin(t * 14) * k; giro = 0.06 * Math.sin(t * 7) * k;
      G.manoI = [-8 + 14 * Math.sin(t * 20), 60 + 20 * Math.cos(t * 17)];
    }
    // levanta la jarra como para beber… y se para
    const kSube = eInOut(tramo(t, 6.05, 6.45)), kBaja = eInOut(tramo(t, T_ROMPE + 0.1, T_ROMPE + 0.45));
    if (t > 6.0) {
      const b = boca(0), r = rot2(JARRA.borde, -0.6);
      const alto = [b[0] - r[0] + 16, b[1] - r[1] + 14];
      G.manoD = mezcla(mezcla([70, 150], alto, kSube), [70, 150], kBaja);
      G.jarra.inc = lerp(0.05, -0.6, kSube * (1 - kBaja));
      G.cara = t < T_ROMPE ? "guino" : "sorpresa"; G.rc = t < T_ROMPE ? -0.06 : 0.04;
    }
    if (t > T_ROMPE + 0.2) { G.puntas = 0.8 * tramo(t, T_ROMPE + 0.5, T_ROMPE + 0.7) * (1 - tramo(t, T_ROMPE + 1.6, T_ROMPE + 2.0)); }
    if (t > T_ROMPE + 1.75) {
      G.cara = "risa"; G.puntas = 0; giro = 0.04 * Math.sin(t * 5); dy = -3 * Math.abs(Math.sin(t * 10));
      G.manoI = [4, 150];
    }
    return { pose: G, x, dy, giro, sx, sy };
  }
  /** El reflejo: la pose de Guillermo al revés (con el esqueleto de Rodrigo). */
  reflejo(e) {
    const RG = avatar().rig, RR = avatar("rodrigo").rig, G = e.pose, k = 0.86;
    const esp = (mano, h, h2) => [h2[0] - (mano[0] - h[0]) * k, h2[1] + (mano[1] - h[1]) * k];
    const R = {
      quien: "rodrigo", cara: G.cara, rc: -(G.rc || 0), puntas: G.puntas || 0,
      piernaI: [G.piernaD[0], -G.piernaD[1]], piernaD: [G.piernaI[0], -G.piernaI[1]],
      manoI: esp(G.manoD, RG.hombroD, RR.hombroI2), manoD: esp(G.manoI || RG.manoI, RG.hombroI2, RR.hombroD),
      brazoIDelante: true,
    };
    const j = G.jarra;
    R.objI2 = (g, m) => jarraIzq(g, m, j.inc, j.nivel, this.t);
    return { pose: R, x: 2 * EJE - e.x, dy: e.dy, giro: -e.giro, sx: e.sx, sy: e.sy };
  }
  rodrigo(t, eg) {
    if (t < T_ROMPE) return this.reflejo(eg);
    // ya no copia: se bebe la jarra entera y sale del marco
    const r = this.reflejo(this.guillermo(T_ROMPE)), R = r.pose;
    const kB = tramo(t, T_ROMPE + 0.1, T_ROMPE + 0.35);
    const kT = tramo(t, T_ROMPE + 0.35, T_ROMPE + 1.35), kF = eInOut(tramo(t, T_ROMPE + 1.35, T_ROMPE + 1.6));
    const beber = eInOut(kB) * (1 - kF);
    R.rc = 0.32 * eInOut(kT) * (1 - kF) + (kT > 0 && kT < 1 ? 0.02 * Math.sin(t * 40) : 0);
    const inc = lerp(-0.6, -1.7, eInOut(kT)) * (1 - kF) + 0.05 * kF;
    const b = boca(R.rc, "rodrigo"), rr = rot2(JARRA.borde, inc);
    const alto = R.manoI;
    R.manoI = mezcla(alto, [b[0] + rr[0] - 1, b[1] - rr[1] + 1], beber);
    if (kF > 0) R.manoI = mezcla(R.manoI, [-2, 132], kF);
    const nivel = 1 - kT;
    R.objI2 = (g, m) => jarraIzq(g, m, inc, nivel, t);
    R.cara = kT > 0 && kT < 1 ? "dormido" : t < T_ROMPE + 0.35 ? "guino" : "guino";
    if (t > T_ROMPE + 1.6) R.cara = t < T_ROMPE + 1.85 ? "guino" : "risa";
    R.manoD = [66, 150];
    // sale del marco andando hacia Guillermo
    const kS = tramo(t, T_ROMPE + 1.6, T_ROMPE + 2.25);
    let x = lerp(r.x, 560, eInOut(kS)), dy = 0;
    if (kS > 0 && kS < 1) { const a = andar(this.fase, 1); R.piernaI = a.piernaI; R.piernaD = a.piernaD; dy = a.bote * ESC; }
    else { R.piernaI = [0, 0]; R.piernaD = [0, 0]; }
    if (t > T_ROMPE + 2.25) { dy = -3 * Math.abs(Math.sin(t * 10 + 1)); }
    return { pose: R, x, dy, giro: t > T_ROMPE + 2.25 ? -0.04 * Math.sin(t * 5) : 0, sx: 1, sy: 1, fuera: kS > 0.25 };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    if ((t > 0.3 && t < 1.45) || (t > T_ROMPE + 1.6 && t < T_ROMPE + 2.25)) this.fase += dt * 9.5;
    this.una("salto", t > 4.03, () => { temblar(6, 0.15); for (const x of [372, 2 * EJE - 372]) for (let i = 0; i < 6; i++) p.nueva(P.POLVO, x + azar(-40, 40), PIES - 4, azar(-200, 200), azar(-40, -5), azar(0.4, 0.7), azar(18, 30)); });
    this.una("bebe", t > T_ROMPE + 0.3, () => temblar(10, 0.25));
    this.una("sale", t > T_ROMPE + 1.75, () => {
      for (let i = 0; i < 26; i++) p.nueva(P.PURPURINA, MARCO.x0 + azar(-6, 6), azar(MARCO.y0, PIES), azar(-60, 60), azar(-30, 30), azar(0.6, 1.2), azar(8, 14));
    });
    p.actualizar(dt);
  }
  marco(g, t) {
    const { x0, x1, y0, y1 } = MARCO, b = 20;
    const gr = this.grMarco || (this.grMarco = (() => {
      const q = g.createLinearGradient(x0 - b, 0, x1 + b, 0);
      q.addColorStop(0, "#7a4d00"); q.addColorStop(0.15, "#ffe08a"); q.addColorStop(0.3, "#c48a12"); q.addColorStop(0.5, "#fff2b8"); q.addColorStop(0.7, "#b47a08"); q.addColorStop(0.85, "#ffd96a"); q.addColorStop(1, "#6e4300"); return q;
    })());
    g.save();
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(x0 - b, y1); g.lineTo(x0 - b, y0 + 60); g.quadraticCurveTo(x0 - b, y0 - b, (x0 + x1) / 2, y0 - b - 26); g.quadraticCurveTo(x1 + b, y0 - b, x1 + b, y0 + 60); g.lineTo(x1 + b, y1);
    g.lineTo(x1, y1); g.lineTo(x1, y0 + 60); g.quadraticCurveTo(x1, y0, (x0 + x1) / 2, y0 - 22); g.quadraticCurveTo(x0, y0, x0, y0 + 60); g.lineTo(x0, y1); g.closePath();
    g.fill();
    g.strokeStyle = "rgba(60,30,0,.7)"; g.lineWidth = 2; g.stroke();
    // adornos
    g.fillStyle = "#fff2b8";
    for (const [x, y] of [[(x0 + x1) / 2, y0 - b - 22], [x0 - b / 2, y0 + 70], [x1 + b / 2, y0 + 70], [x0 - b / 2, y1 - 30], [x1 + b / 2, y1 - 30]]) { g.beginPath(); g.arc(x, y, 7, 0, 6.283); g.fill(); }
    estrella(g, (x0 + x1) / 2, y0 - b - 22, 14, 6, 0); g.fillStyle = "#ffd34d"; g.fill();
    g.restore();
  }
  cristalRuta(g) {
    const { x0, x1, y0, y1 } = MARCO;
    g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0 + 60); g.quadraticCurveTo(x0, y0, (x0 + x1) / 2, y0 - 22); g.quadraticCurveTo(x1, y0, x1, y0 + 60); g.lineTo(x1, y1); g.closePath();
  }
  dibujar(g) {
    if (!this._tit) this.titulo(); // se prepara en el primer cuadro (negro), no en el remate
    const t = this.t, eg = this.guillermo(t), er = this.rodrigo(t, eg);
    fondo(g, "#000");
    const luz = tramo(t, 0, 0.5) * (1 - tramo(t, 9.7, 10.25));
    // suelo
    g.save(); g.globalAlpha = luz;
    const gs = this.grSuelo || (this.grSuelo = (() => { const gr = g.createLinearGradient(0, PIES - 6, 0, H); gr.addColorStop(0, "#2a2320"); gr.addColorStop(1, "#0b0909"); return gr; })());
    g.fillStyle = gs; g.fillRect(-60, PIES - 4, W + 120, H - PIES + 70);
    g.restore();
    foco(g, 330, 350, PIES, 150, luz * 0.55);
    // el cristal (oscuro, azulado) con Rodrigo dentro
    g.save(); g.globalAlpha = luz;
    this.cristalRuta(g);
    const gc = this.grCristal || (this.grCristal = (() => { const q = g.createLinearGradient(0, MARCO.y0, 0, PIES); q.addColorStop(0, "#1b2a36"); q.addColorStop(1, "#0b1218"); return q; })());
    g.fillStyle = gc; g.fill();
    g.restore();
    const mG = matAv(eg.x, PIES + eg.dy, ESC, eg.giro, eg.sx, eg.sy);
    const mR = matAv(er.x, PIES + er.dy, ESC, er.giro, er.sx, er.sy);
    // sombras
    g.fillStyle = `rgba(0,0,0,${0.45 * luz})`;
    for (const x of [eg.x, er.x]) { g.beginPath(); g.ellipse(x, PIES, 66, 8, 0, 0, 6.283); g.fill(); }
    if (!er.fuera) {
      // dentro del espejo: recortado por el cristal
      g.save(); this.cristalRuta(g); g.clip();
      pintarAvatar(g, mR, er.pose, t);
      // brillos del cristal
      g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.09 * luz;
      g.fillStyle = "#cfe8ff";
      for (const [x, w] of [[600, 60], [700, 22], [770, 40]]) { g.beginPath(); g.moveTo(x, MARCO.y0 - 30); g.lineTo(x + w, MARCO.y0 - 30); g.lineTo(x + w - 260, PIES); g.lineTo(x - 260, PIES); g.closePath(); g.fill(); }
      g.restore();
      this.marco(g, t);
    } else {
      this.marco(g, t);
      pintarAvatar(g, mR, er.pose, t);
    }
    pintarAvatar(g, mG, eg.pose, t);
    this.p.dibujar(g);
    // glu glu
    if (t > T_ROMPE + 0.4 && t < T_ROMPE + 1.35) {
      const k = (t * 2.4) % 1, q = aPant(mR, [70, 20]);
      txt(g, "GLU", q[0] + 30 + k * 20, q[1] - k * 40, { tam: 34, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a2400", bordeAncho: 6, alfa: 1 - k, esp: 2 });
    }
    // ¿ESPEJO?
    if (t > T_ROMPE + 0.55) {
      const d = t - T_ROMPE - 0.55, k = tramo(d, 0, 0.17), s = lerp(2.6, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 8));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - tramo(t, 9.6, 10.1)); g.translate(300, 110); g.rotate(-0.05); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    if (luz < 1) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (this._tit) return this._tit;
    const c = lienzoNuevo(700, 170), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 20, 0, 140);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#dfeefa"); gr.addColorStop(1, "#8fb6d4");
    txt(g, "¿ESPEJO?", 350, 130, { tam: 112, peso: 900, fam: FD, color: gr, borde: "#14283a", bordeAncho: 12, esp: 5, glow: "rgba(170,220,255,.85)", glowTam: 24 });
    return (this._tit = c);
  }
}

registrar({ id: "00132", nombre: "El espejo", crear: () => new Espejo() });
})();
