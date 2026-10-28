"use strict";
/*
 * 00134 · GUERRA DE ESPUMA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Cada uno detrás de su barril lleno de espuma. Guillermo hace una bola y se la tira a Rodrigo (¡PLAF!, en el pecho);
 * Rodrigo contesta, Guillermo se agacha tras el barril y falla; la siguiente le da en toda la cara. Se tiran a la vez
 * y se dan los dos. Al final hacen dos bolas gigantes, las lanzan a la vez, chocan en el aire y revientan: llueve
 * espuma y acaban los dos blancos de espuma, muertos de risa. ¡GUERRA DE ESPUMA! Se apagan las luces.
 */
(() => {
const ESC = 1.62, XG = 250, XR = 774, BAR_H = 150, BAR_W = 132;
const T_GIG = 6.0, T_CHOQUE = 6.26;
// tiros: quién lanza, cuándo suelta, cuánto tarda, a quién y dónde (unidades de avatar) o a qué punto (fallo)
const TIROS = [
  { de: "G", t: 1.2, dur: 0.34, a: "R", p: [36, 108] },
  { de: "R", t: 2.3, dur: 0.42, fallo: [-80, 300] },
  { de: "R", t: 3.2, dur: 0.32, a: "G", p: [36, 44] },
  { de: "G", t: 4.3, dur: 0.3, a: "R", p: [36, 54] },
  { de: "R", t: 4.3, dur: 0.34, a: "G", p: [42, 14] },
];

/** Pegotes de espuma repartidos por una zona (unidades de avatar). */
function pegotes(n, cx, cy, rx, ry, t0, t1, sem, hueco) {
  const rnd = semilla(sem), L = [];
  let i = 0, intentos = 0;
  while (i < n && intentos++ < n * 20) {
    const a = rnd() * 6.283, r = Math.sqrt(rnd());
    const x = cx + Math.cos(a) * r * rx, y = cy + Math.sin(a) * r * ry;
    if (hueco && hueco(x, y)) continue;
    L.push({ x, y, r: 3.6 + rnd() * 4.8, t0: lerp(t0, t1, rnd()) }); i++;
  }
  return L;
}

class Guerra extends Escena {
  constructor() {
    super(10.3);
    this.p = new Parts(480);
    const RR = avatar("rodrigo").rig;
    const caraG = (x, y) => Math.abs(x - 39) < 15 && y > 33 && y < 63;
    const caraR = (x, y) => Math.abs(x - 38) < 15 && y > 40 && y < 71;
    this.espG = [].concat(
      pegotes(7, 30, 46, 9, 9, 3.52, 3.58, 3).map((b) => Object.assign(b, { t1: 3.85 + (66 - b.x) / 52 * 0.35 })), // en toda la cara (se la limpia)
      pegotes(8, 42, 12, 18, 7, 4.64, 4.7, 5),            // en el pelo
      pegotes(26, 39, 26, 34, 30, 6.35, 7.2, 7, caraG),   // la lluvia final: cabeza
      pegotes(40, 39, 108, 36, 34, 6.35, 7.2, 9),         // y cuerpo
    );
    this.espR = [].concat(
      pegotes(9, 36, 108, 13, 11, 1.54, 1.6, 13),         // en el pecho
      pegotes(7, 40, 52, 10, 9, 4.6, 4.66, 15, caraR),    // en la cara
      pegotes(26, 38, 34, 34, 32, 6.35, 7.2, 17, caraR),
      pegotes(40, 38, 114, 36, 34, 6.35, 7.2, 19),
    );
    this.splats = [];
  }
  /** Postura de quien lanza (lado 1 = Guillermo, que tira con la derecha; -1 = Rodrigo, con la izquierda). */
  lanzador(t, de, P) {
    const lado = de === "G" ? 1 : -1;
    const tiros = TIROS.filter((x) => x.de === de);
    let bola = null; // { mano: "D"/"I", tam }
    for (const x of tiros) {
      const T = x.t;
      if (t < T - 0.7 || t > T + 0.3) continue;
      const kS = eInOut(tramo(t, T - 0.7, T - 0.52)), kF = eInOut(tramo(t, T - 0.5, T - 0.32));
      const kA = eInOut(tramo(t, T - 0.3, T - 0.1)), kT = eIn(tramo(t, T - 0.1, T)), kV = eInOut(tramo(t, T + 0.05, T + 0.3));
      const bD = [62, 128], bI = [16, 128];
      let mD = mezcla(bD, [46, 132], kS), mI = mezcla(bI, [32, 132], kS);
      mD = mezcla(mD, [44, 102], kF); mI = mezcla(mI, [34, 102], kF);
      const atras = lado > 0 ? [86, 40] : [-8, 42], tira = lado > 0 ? [106, 84] : [-28, 88];
      if (lado > 0) { mD = mezcla(mezcla(mD, atras, kA), tira, kT); mI = mezcla(mI, [10, 110], kA); }
      else { mI = mezcla(mezcla(mI, atras, kA), tira, kT); mD = mezcla(mD, [66, 110], kA); }
      if (kV > 0) { mD = mezcla(mD, bD, kV); mI = mezcla(mI, bI, kV); }
      P.manoD = mD; P.manoI = mI;
      P.cara = t < T - 0.3 ? "guino" : t < T + 0.1 ? "risa" : P.cara;
      if (kF > 0 && t < T) bola = { tam: 9 * Math.min(1, kF * 1.5), lado };
    }
    // bola gigante
    if (t > 4.95 && t < T_GIG + 0.35) {
      const kS = eInOut(tramo(t, 4.95, 5.2)), kU = eInOut(tramo(t, 5.25, 5.75)), kT = eIn(tramo(t, T_GIG - 0.12, T_GIG)), kV = eInOut(tramo(t, T_GIG + 0.05, T_GIG + 0.35));
      let mD = mezcla([62, 128], [46, 132], kS), mI = mezcla([16, 128], [32, 132], kS);
      mD = mezcla(mD, [60, -8], kU); mI = mezcla(mI, [18, -8], kU);
      mD = mezcla(mD, [80 + 20 * lado, 50], kT); mI = mezcla(mI, [-2 + 20 * lado, 50], kT);
      mD = mezcla(mD, [62, 128], kV); mI = mezcla(mI, [16, 128], kV);
      if (t > 5.3 && t < T_GIG - 0.12) { mD[0] += 2 * Math.sin(t * 20); mI[0] -= 2 * Math.sin(t * 20); }
      P.manoD = mD; P.manoI = mI; P.brazoIDelante = true;
      P.cara = t < 5.6 ? "risa" : "guino";
      if (t > 5.2 && t < T_GIG) bola = { tam: lerp(10, 30, eOut(tramo(t, 5.2, 5.8))), gigante: true, lado };
    }
    return bola;
  }
  /** [{pose, m}] de los dos. */
  poses(t) {
    // ---------------- Guillermo
    const G = { cara: "guino", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [62, 128], manoI: [16, 128] };
    let syG = 1, giroG = 0, dyG = 0;
    const bolaG = this.lanzador(t, "G", G);
    if (t > 1.6 && t < 2.2) G.cara = "risa";
    // se agacha y la bola le pasa por encima
    const kAg = Math.sin(tramo(t, 2.3, 2.85) * Math.PI);
    if (kAg > 0) { syG = 1 - 0.46 * Math.min(1, kAg * 1.6); G.cara = "guino"; G.manoD = [62, 120]; G.manoI = [16, 120]; }
    if (t > 2.85 && t < 3.15) { G.cara = "risa"; dyG = -3 * Math.abs(Math.sin(t * 12)); }
    // impactos
    if (t > 3.52 && t < 4.0) { G.cara = "sorpresa"; giroG = -0.07 * Math.exp(-(t - 3.52) * 6); G.rc = -0.1 * Math.exp(-(t - 3.52) * 5); }
    // se limpia la cara
    if (t > 3.8 && t < 4.2) { const k = tramo(t, 3.8, 4.15); G.manoD = [lerp(66, 14, eInOut(k)), 46 + 3 * Math.sin(t * 30)]; G.cara = "dormido"; }
    if (t > 4.64 && t < 4.95) { G.cara = "sorpresa"; giroG = -0.06 * Math.exp(-(t - 4.64) * 6); }
    // ---------------- Rodrigo
    const R = { quien: "rodrigo", cara: "guino", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [62, 128], manoI: [16, 128], brazoIDelante: true };
    let giroR = 0, dyR = 0;
    const bolaR = this.lanzador(t, "R", R);
    if (t > 1.54 && t < 1.9) { R.cara = "sorpresa"; giroR = 0.07 * Math.exp(-(t - 1.54) * 6); }
    if (t > 4.6 && t < 4.95) { R.cara = "sorpresa"; giroR = 0.06 * Math.exp(-(t - 4.6) * 6); R.rc = 0.1 * Math.exp(-(t - 4.6) * 5); }
    if (t > 2.75 && t < 2.95) R.cara = "guino";
    // la lluvia final: blancos de espuma y muertos de risa
    if (t > T_CHOQUE) {
      const d = t - T_CHOQUE;
      G.cara = R.cara = d < 0.9 ? "sorpresa" : "risa";
      G.puntas = R.puntas = d < 0.9 ? 0.6 : 0;
      if (d > 0.9) {
        dyG = -3 * Math.abs(Math.sin(t * 10)); dyR = -3 * Math.abs(Math.sin(t * 10 + 1));
        giroG = 0.04 * Math.sin(t * 5); giroR = -0.04 * Math.sin(t * 5 + 1);
        G.rc = 0.06 * Math.sin(t * 10); R.rc = -0.06 * Math.sin(t * 10 + 1);
        // se sacuden la espuma
        if (d > 1.5 && d < 2.4) { G.manoD = [70 + 8 * Math.sin(t * 24), 60]; R.manoI = [8 - 8 * Math.sin(t * 24), 64]; }
      }
    }
    return [
      { pose: G, m: matAv(XG, PIES + dyG, ESC, giroG, 1, syG), bola: bolaG, esp: this.espG, R: avatar().rig },
      { pose: R, m: matAv(XR, PIES + dyR, ESC, giroR), bola: bolaR, esp: this.espR, R: avatar("rodrigo").rig },
    ];
  }
  /** Dónde está una bola en vuelo (pantalla). */
  vuelo(x, t) {
    const e0 = this.poses(x.t), q = e0[x.de === "G" ? 0 : 1];
    const ini = aPant(q.m, q.pose._manoD && x.de === "G" ? q.pose._manoD : x.de === "G" ? [106, 84] : [-28, 88]);
    let fin;
    if (x.fallo) fin = x.fallo;
    else { const e1 = this.poses(x.t + x.dur), d = e1[x.a === "G" ? 0 : 1]; fin = aPant(d.m, x.p); }
    const u = clamp((t - x.t) / x.dur, 0, 1);
    return [lerp(ini[0], fin[0], u), lerp(ini[1], fin[1], u) - 90 * 4 * u * (1 - u)];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    p.suelo = () => PIES;
    // impactos
    for (const [i, x] of TIROS.entries()) {
      if (x.fallo) continue;
      this.una("hit" + i, t > x.t + x.dur, () => {
        const q = this.vuelo(x, x.t + x.dur);
        temblar(9, 0.2);
        for (let k = 0; k < 26; k++) { const a = azar(0, 6.283), v = azar(120, 420); p.nueva(P.ESPUMA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v - 80, azar(0.4, 0.8), azar(5, 11)); }
        this.splats.push({ x: q[0], y: q[1], t0: t, s: Math.random() < 0.5 ? "¡PLAF!" : "¡CHOF!" });
      });
    }
    // estela de las bolas
    for (const x of TIROS) if (t > x.t && t < x.t + x.dur) { const q = this.vuelo(x, t); if (Math.random() < 0.7) p.nueva(P.ESPUMA, q[0], q[1], azar(-40, 40), azar(-40, 40), 0.3, azar(3, 6)); }
    // las gigantes chocan
    this.una("choque", t > T_CHOQUE, () => {
      temblar(28, 0.7);
      p.nueva(P.DESTELLO, 512, 250, 0, 0, 0.5, 420);
      for (let k = 0; k < 150; k++) { const a = azar(0, 6.283), v = azar(200, 900); p.nueva(P.ESPUMA, 512, 250, Math.cos(a) * v, Math.sin(a) * v - 200, azar(0.6, 1.4), azar(6, 16)); }
      this.splats.push({ x: 512, y: 330, t0: t, s: "¡CHOF!", grande: true });
    });
    // lluvia de espuma
    if (t > T_CHOQUE + 0.1 && t < 7.4) {
      const n = Math.round(160 * dt * (1 - tramo(t, 6.6, 7.4)) * 2);
      for (let k = 0; k < n; k++) { const x = Math.random() < 0.5 ? XG + azar(-130, 130) : XR + azar(-130, 130); p.nueva(P.ESPUMA, x, azar(-30, 60), azar(-30, 30), azar(200, 420), azar(0.8, 1.3), azar(5, 12)); }
    }
    // al sacudirse
    if (t > 7.75 && t < 8.65 && Math.random() < 25 * dt) {
      const e = this.poses(t), q = Math.random() < 0.5 ? aPant(e[0].m, [39 + azar(-30, 30), azar(10, 120)]) : aPant(e[1].m, [38 + azar(-30, 30), azar(10, 120)]);
      p.nueva(P.ESPUMA, q[0], q[1], azar(-200, 200), azar(-260, -60), azar(0.5, 0.9), azar(5, 10));
    }
    p.actualizar(dt);
  }
  barril(g, x) {
    const w = BAR_W, h = BAR_H, top = PIES - h;
    const gr = this.grBarril || (this.grBarril = (() => { const q = g.createLinearGradient(-w / 2, 0, w / 2, 0); q.addColorStop(0, "#3d1f0a"); q.addColorStop(0.4, "#a8642a"); q.addColorStop(0.6, "#c07a38"); q.addColorStop(1, "#3a1c08"); return q; })());
    g.save(); g.translate(x, 0);
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(-w / 2 + 8, top); g.quadraticCurveTo(-w / 2 - 8, top + h / 2, -w / 2 + 8, PIES); g.lineTo(w / 2 - 8, PIES); g.quadraticCurveTo(w / 2 + 8, top + h / 2, w / 2 - 8, top); g.closePath(); g.fill();
    g.strokeStyle = "rgba(0,0,0,.3)"; g.lineWidth = 2;
    for (const dx of [-36, -12, 12, 36]) { g.beginPath(); g.moveTo(dx * 0.92, top + 2); g.quadraticCurveTo(dx * 1.12, top + h / 2, dx * 0.92, PIES - 2); g.stroke(); }
    g.fillStyle = "#2c2c30";
    for (const y of [top + 24, PIES - 32]) { g.beginPath(); g.ellipse(0, y, w / 2 + 2, 6, 0, 0, 6.283); g.fill(); }
    g.fillStyle = "rgba(255,255,255,.18)"; for (const y of [top + 22, PIES - 34]) g.fillRect(-w / 2 + 6, y - 3, w - 12, 2);
    // la espuma que rebosa
    const s = SPR.espuma;
    for (let i = 0; i < 9; i++) { const bx = -w / 2 + 14 + i * ((w - 28) / 8), r = 13 + (i % 3) * 3; g.drawImage(s, bx - r, top - r * 0.9 - 2 * Math.sin(this.t * 3 + i), r * 2, r * 2); }
    g.restore();
  }
  bolaGrande(g, x, y, r) {
    g.drawImage(SPR.espuma, x - r, y - r, r * 2, r * 2);
    const s = SPR.espuma;
    for (let i = 0; i < 6; i++) { const a = i * 1.05 + this.t * 2, rr = r * 0.42; g.drawImage(s, x + Math.cos(a) * r * 0.7 - rr, y + Math.sin(a) * r * 0.7 - rr, rr * 2, rr * 2); }
  }
  dibujar(g) {
    if (!this._tit) this.titulo(); // se prepara en el primer cuadro (negro), no en el remate
    const t = this.t, e = this.poses(t);
    fondo(g, "#000");
    const luz = tramo(t, 0, 0.45) * (1 - tramo(t, 9.7, 10.25));
    g.save(); g.globalAlpha = luz;
    const gp = this.grPared || (this.grPared = (() => { const q = g.createLinearGradient(0, 0, 0, PIES); q.addColorStop(0, "#0b0a0d"); q.addColorStop(1, "#231a14"); return q; })());
    g.fillStyle = gp; g.fillRect(-60, -60, W + 120, PIES + 60);
    const gs = this.grSuelo || (this.grSuelo = (() => { const q = g.createLinearGradient(0, PIES - 6, 0, H); q.addColorStop(0, "#3a2c22"); q.addColorStop(1, "#120c09"); return q; })());
    g.fillStyle = gs; g.fillRect(-60, PIES - 4, W + 120, H - PIES + 70);
    g.restore();
    foco(g, 250, XG, PIES, 150, luz * 0.45);
    foco(g, 774, XR, PIES, 150, luz * 0.45);
    for (const a of e) {
      // la espuma pegada se pinta en objD: entre el cuerpo y el brazo derecho
      const P = a.pose, Rg = a.R, L = a.esp, rc = P.rc || 0;
      P.objD = (gg) => {
        const s = SPR.espuma;
        for (const b of L) {
          if (t < b.t0 || (b.t1 && t > b.t1)) continue;
          const k = eBack(tramo(t, b.t0, b.t0 + 0.12)), r = b.r * k;
          let x = b.x, y = b.y;
          if (y < 76) { const q = rot2([x - Rg.cuello[0], y - Rg.cuello[1]], rc); x = Rg.cuello[0] + q[0]; y = Rg.cuello[1] + q[1]; }
          gg.drawImage(s, x - r, y - r, r * 2, r * 2);
        }
      };
      pintarAvatar(g, a.m, P, t);
      // la bola que lleva en la mano
      if (a.bola && P._manoD) {
        const b = a.bola;
        if (b.gigante) {
          const q1 = aPant(a.m, P._manoD), q2 = aPant(a.m, P._manoI || P._manoD);
          this.bolaGrande(g, (q1[0] + q2[0]) / 2, (q1[1] + q2[1]) / 2 - b.tam * ESC * 0.8, b.tam * ESC);
        } else {
          const q = aPant(a.m, b.lado > 0 ? P._manoD : P._manoI || P._manoD);
          const r = b.tam * ESC; g.drawImage(SPR.espuma, q[0] - r, q[1] - r - 6, r * 2, r * 2);
        }
      }
    }
    this.barril(g, XG); this.barril(g, XR);
    // bolas en vuelo
    for (const x of TIROS) if (t > x.t && t < x.t + x.dur) { const q = this.vuelo(x, t), r = 14; g.drawImage(SPR.espuma, q[0] - r, q[1] - r, r * 2, r * 2); }
    // gigantes en vuelo
    if (t > T_GIG && t < T_CHOQUE) {
      const u = tramo(t, T_GIG, T_CHOQUE), r = 30 * ESC;
      const yG = lerp(PIES - 260, 250, u) - 80 * 4 * u * (1 - u);
      this.bolaGrande(g, lerp(XG + 20, 512 - r * 0.6, u), yG, r);
      this.bolaGrande(g, lerp(XR - 20, 512 + r * 0.6, u), yG, r);
    }
    this.p.dibujar(g);
    // ¡PLAF!
    for (const s of this.splats) {
      const d = t - s.t0; if (d > 0.7) continue;
      const k = eBack(tramo(d, 0, 0.12)), tam = s.grande ? 70 : 42;
      g.save(); g.translate(s.x + (s.grande ? 0 : 40), s.y - (s.grande ? 0 : 60)); g.rotate(0.1); g.scale(k, k);
      txt(g, s.s, 0, 0, { tam, peso: 400, fam: FC, color: "#fffdf5", borde: "#6b3a0c", bordeAncho: 8, alfa: 1 - tramo(d, 0.5, 0.7), esp: 2 });
      g.restore();
    }
    // ¡GUERRA DE ESPUMA!
    if (t > T_CHOQUE + 0.1) {
      const d = t - T_CHOQUE - 0.1, k = tramo(d, 0, 0.18), s = lerp(2.4, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * luz; g.translate(512, 100); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    if (luz < 1) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (this._tit) return this._tit;
    const c = lienzoNuevo(1000, 200), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 50, 0, 150);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.6, "#fff6dc"); gr.addColorStop(1, "#ffd77a");
    txt(g, "¡GUERRA DE ESPUMA!", 500, 145, { tam: 104, peso: 400, fam: FB, color: gr, borde: "#6b3a0c", bordeAncho: 13, esp: 2, glow: "rgba(255,200,60,.8)", glowTam: 22, max: 960 });
    const rnd = semilla(21);
    for (let i = 0; i < 20; i++) { const x = 60 + rnd() * 880, y = 52 + rnd() * 14, r = 7 + rnd() * 10; g.drawImage(SPR.espuma, x - r, y - r, r * 2, r * 2); }
    return (this._tit = c);
  }
}

registrar({ id: "00134", nombre: "Guerra de espuma", crear: () => new Guerra() });
})();
