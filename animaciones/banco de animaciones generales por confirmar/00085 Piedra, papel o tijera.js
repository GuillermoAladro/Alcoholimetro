"use strict";
/*
 * 00085 · PIEDRA, PAPEL O TIJERA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se encienden dos focos: él contra un clon con gafas de sol (VS). Juegan: ¡PIEDRA! ¡PAPEL! ¡TIJERA!… y sacan lo
 * mismo: piedra y piedra, papel y papel, tijera y tijera (¡EMPATE!, cada vez más grande). En la última ronda los
 * dos sacan… una jarra. Se miran, se ríen, brindan en el centro y ¡EMPATE! a lo grande. Se apagan los focos.
 */
(() => {
const ESC = 1.45;
const RONDAS = [
  { golpes: [1.15, 1.45, 1.75], saca: 2.05, signo: "piedra" },
  { golpes: [2.75, 3.0, 3.25], saca: 3.5, signo: "papel" },
  { golpes: [4.05, 4.25, 4.45], saca: 4.65, signo: "tijera" },
  { golpes: [5.3, 5.45, 5.6], saca: 5.78, signo: "jarra" },
];
const PALABRAS = ["¡PIEDRA!", "¡PAPEL!", "¡TIJERA!"];
const T_BRINDIS = 6.95, T_APAGA = 8.7;

/** Mano dibujada (pictograma, como los emojis) centrada en (0,0), unos 110 px. */
function signo(g, tipo) {
  g.lineJoin = "round"; g.lineCap = "round"; g.lineWidth = 4.5; g.strokeStyle = "#6b3d22";
  const piel = "#f6c9a4", sombra = "#e2a87f";
  const dedo = (x, y0, y1, w) => { g.fillStyle = piel; rectR(g, x - w / 2, y0, w, y1 - y0, w / 2); g.fill(); g.stroke(); };
  const dedoInc = (x0, y0, x1, y1, w) => {
    const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0);
    g.save(); g.translate(x0, y0); g.rotate(a); g.fillStyle = piel; rectR(g, -w / 2, -w / 2, L + w, w, w / 2); g.fill(); g.stroke(); g.restore();
  };
  const puno = (y0) => {
    // palma
    g.fillStyle = piel; rectR(g, -36, y0 + 10, 72, 50, 20); g.fill(); g.stroke();
    // nudillos: cuatro dedos doblados
    for (let i = 0; i < 4; i++) { g.fillStyle = piel; rectR(g, -36 + i * 18, y0, 18, 34, 9); g.fill(); g.stroke(); }
    g.fillStyle = sombra; for (let i = 0; i < 4; i++) g.fillRect(-32 + i * 18, y0 + 24, 10, 3);
    // pulgar cruzado
    dedoInc(-30, y0 + 40, 8, y0 + 36, 17);
  };
  if (tipo === "piedra") puno(-30);
  else if (tipo === "tijera") {
    dedoInc(-8, 4, -26, -44, 17); dedoInc(8, 4, 26, -46, 17);
    g.fillStyle = piel; rectR(g, -36, -6, 72, 56, 20); g.fill(); g.stroke();
    for (let i = 2; i < 4; i++) { rectR(g, -36 + i * 18, -10, 18, 30, 9); g.fill(); g.stroke(); }
    dedoInc(-30, 22, 8, 18, 17);
  } else if (tipo === "papel") {
    dedo(-24, -52, 4, 16); dedo(-8, -60, 4, 16); dedo(8, -58, 4, 16); dedo(23, -46, 4, 15);
    g.fillStyle = piel; rectR(g, -33, -16, 66, 66, 24); g.fill(); g.stroke();
    g.fillStyle = piel; g.fillRect(-30, -14, 60, 14);
    dedoInc(-30, 26, -52, 2, 17);
    g.strokeStyle = sombra; g.lineWidth = 3; g.beginPath(); g.moveTo(-14, 14); g.quadraticCurveTo(0, 26, 18, 18); g.stroke();
  }
}

class Piedra extends Escena {
  constructor() {
    super(9.5);
    this.p = new Parts(400);
    this.sellos = [];
  }
  ronda(t) { let r = 0; while (r < 3 && t >= RONDAS[r + 1].golpes[0] - 0.2) r++; return r; }
  /** Cuánto sube el puño (0–1) en las sacudidas de la ronda. */
  sacude(t) {
    const R = RONDAS[this.ronda(t)];
    let v = 0;
    for (const g of R.golpes) { const u = (t - (g - 0.12)) / 0.24; if (u > 0 && u < 1) v = Math.max(v, Math.sin(u * Math.PI)); }
    return v;
  }
  xs(t) { const k = eInOut(tramo(t, 6.35, 6.8)); return [lerp(300, 366, k), lerp(724, 658, k)]; }
  /** Las dos poses: [él, el clon]. */
  poses() {
    const t = this.t, r = this.ronda(t), R = RONDAS[r], s = this.sacude(t), reve = t >= R.saca;
    const P1 = { cara: "sonrisa", rc: 0, piernaI: [0, 0.02], piernaD: [0, -0.02], manoI: [-2, 152] };
    const P2 = { cara: "sonrisa", rc: 0, piernaI: [0, 0.02], piernaD: [0, -0.02], manoD: [80, 152], gafas: true, brazoIDelante: true };
    // puños: arriba y abajo al ritmo; al sacar, hacia el centro
    const yP = 118 - 30 * s;
    P1.manoD = [112, reve ? 108 : yP]; P2.manoI = [-34, reve ? 108 : yP];
    if (t < RONDAS[0].golpes[0] - 0.3) { const k = eInOut(tramo(t, 0.6, 0.95)); P1.manoD = mezcla([70, 158], [112, 118], k); P2.manoI = mezcla([9, 160], [-34, 118], k); }
    // caras
    if (t > 0.5 && t < 1.0) { P1.cara = "guino"; P2.cara = "guino"; }
    if (reve && r < 3) {
      const d = t - R.saca;
      const caras = [["sorpresa", "sorpresa"], ["borracho", "sorpresa"], ["guino", "guino"]][r];
      P1.cara = caras[0]; P2.cara = caras[1];
      if (d > 0.25) { P1.rc = 0.14 * eOut(tramo(d, 0.25, 0.4)); P2.rc = -0.14 * eOut(tramo(d, 0.25, 0.4)); }
    }
    // última ronda: ¡jarras!
    if (r === 3 && reve) {
      const d = t - R.saca;
      P1.cara = P2.cara = d < 0.5 ? "sorpresa" : "risa";
      if (d > 0.5 && d < 0.95) { P1.rc = 0.15; P2.rc = -0.15; P1.cara = P2.cara = "guino"; }
      // brindis en el centro
      const kB = eInOut(tramo(t, 6.55, T_BRINDIS)), choque = t > T_BRINDIS ? Math.exp(-(t - T_BRINDIS) * 10) * 6 : 0;
      P1.manoD = mezcla([112, 108], [110, 66 - choque], kB); P2.manoI = mezcla([-34, 108], [-32, 66 - choque], kB);
      const inc = -0.1 * kB;
      P1.jarra = { inc, nivel: 1 };
      P2.objI = (g, m) => { g.save(); g.translate(m[0], m[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], inc, 1, "asa", t); g.restore(); };
      P2.objI2 = (g, m) => { g.save(); g.translate(m[0], m[1]); g.scale(-1, 1); dibujarJarra(g, [0, 0], inc, 1, "cuerpo", t); g.restore(); };
      if (t > T_BRINDIS) {
        P1.cara = P2.cara = "risa"; P1.rc = 0.05 * Math.sin(t * 7); P2.rc = -0.05 * Math.sin(t * 7 + 1);
        const b = Math.sin((t - T_BRINDIS) * 9) * 5 * tramo(t, T_BRINDIS + 0.3, T_BRINDIS + 0.6);
        P1.manoI = mezcla([-2, 152], [-16, 40 + b], eOut(tramo(t, T_BRINDIS + 0.2, T_BRINDIS + 0.5)));
        P2.manoD = mezcla([80, 152], [94, 40 - b], eOut(tramo(t, T_BRINDIS + 0.2, T_BRINDIS + 0.5)));
      }
    }
    const [x1, x2] = this.xs(t);
    const anda = t > 6.35 && t < 6.8 ? andar((t - 6.35) * 14, 0.7) : null;
    if (anda) { P1.piernaI = anda.piernaI; P1.piernaD = anda.piernaD; P2.piernaI = anda.piernaD; P2.piernaD = anda.piernaI; }
    const bote = anda ? anda.bote : 0;
    return [{ pose: P1, m: matAv(x1, PIES + bote, ESC) }, { pose: P2, m: matAv(x2, PIES + bote, ESC) }];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("vs", t > 0.45, () => temblar(10, 0.25));
    RONDAS.forEach((R, i) => {
      this.una("saca" + i, t >= R.saca, () => {
        temblar(i === 3 ? 12 : 6, 0.2);
        const e = this.poses();
        for (const a of e) {
          const q = aPant(a.m, a === e[0] ? [112, 108] : [-34, 108]);
          for (let k = 0; k < (i === 3 ? 18 : 8); k++) { const an = azar(0, 6.283), v = azar(100, 320); p.nueva(P.CHISPA, q[0], q[1], Math.cos(an) * v, Math.sin(an) * v, azar(0.25, 0.5), azar(6, 10)); }
        }
        if (i < 3) this.sellos.push({ t0: t + 0.18, tam: [44, 56, 68][i], rot: [-0.12, 0.1, -0.08][i], y: 478 });
      });
    });
    this.una("brindis", t > T_BRINDIS, () => {
      temblar(24, 0.55);
      const e = this.poses(), q = mezcla(aPant(e[0].m, [110 + 31, 48]), aPant(e[1].m, [-32 - 31, 48]), 0.5);
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.4, 200);
      for (let k = 0; k < 50; k++) { const an = azar(-Math.PI, 0), v = azar(150, 520); p.nueva(P.ESPUMA, q[0], q[1], Math.cos(an) * v, Math.sin(an) * v, azar(0.5, 1.0), azar(5, 11)); }
      for (let k = 0; k < 150; k++) p.nueva(P.CONFETI, azar(0, W), azar(-260, -10), azar(-60, 60), azar(40, 140), azar(4, 6), azar(9, 15), (Math.random() * 5) | 0);
    });
    p.actualizar(dt);
  }
  luz(t) {
    if (t < 0.4) return [0, 1, 0, 1, 1][Math.min(4, Math.floor(t / 0.08))];
    return 1 - tramo(t, T_APAGA, T_APAGA + 0.5);
  }
  dibujar(g) {
    const t = this.t, e = this.poses(), luz = this.luz(t), [x1, x2] = this.xs(t);
    fondo(g, "#000");
    foco(g, x1 - 60, x1, PIES, 130, luz);
    foco(g, x2 + 60, x2, PIES, 130, luz);
    // VS
    if (t > 0.4 && t < 1.25) {
      const k = eBack(tramo(t, 0.4, 0.6)), a = 1 - tramo(t, 1.0, 1.25);
      g.save(); g.translate(512, 330); g.scale(k * 1.2, k * 1.2); g.rotate(-0.08);
      txt(g, "VS", 0, 0, { tam: 120, peso: 900, fam: FD, color: "#ffd34d", borde: "#7a0008", bordeAncho: 12, alfa: a, glow: "rgba(255,80,60,.8)", glowTam: 24 });
      g.restore();
    }
    for (const a of e) pintarAvatar(g, a.m, a.pose, t);
    this.p.dibujar(g);
    // ¡PIEDRA! ¡PAPEL! ¡TIJERA!
    const r = this.ronda(t), R = RONDAS[r];
    for (let k = 0; k < 3; k++) {
      const t0 = R.golpes[k] - 0.1, t1 = k < 2 ? R.golpes[k + 1] - 0.1 : R.saca;
      if (t < t0 || t >= t1) continue;
      const kk = eBack(tramo(t, t0, t0 + 0.1));
      g.save(); g.translate(512, 92); g.scale(kk, kk); g.rotate([-0.06, 0.04, -0.03][k]);
      txt(g, PALABRAS[k], 0, 0, { tam: r === 3 ? 78 : 66, peso: 400, fam: FC, color: "#fffdf5", borde: "#1a1a1a", bordeAncho: 9, esp: 3 });
      g.restore();
    }
    // los dos signos en bocadillos
    if (t >= R.saca && r < 3 && t < R.saca + 0.85) {
      const k = eBack(tramo(t, R.saca, R.saca + 0.15)), a = 1 - tramo(t, R.saca + 0.65, R.saca + 0.85);
      for (const [i, cx] of [[0, 428], [1, 596]]) {
        const q = aPant(e[i].m, i === 0 ? [112, 108] : [-34, 108]);
        g.save(); g.globalAlpha = a; g.translate(cx, 258); g.scale(k, k);
        g.fillStyle = "#fffdf5"; g.strokeStyle = "#111"; g.lineWidth = 5;
        g.beginPath(); g.arc(0, 0, 74, 0, 6.283); g.fill(); g.stroke();
        g.beginPath(); g.moveTo(-14, 68); g.lineTo((q[0] - cx) * 0.6, 122); g.lineTo(14, 68); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = "#fffdf5"; g.beginPath(); g.arc(0, 0, 71, 0, 6.283); g.fill();
        g.translate(0, 4); g.scale(i === 0 ? 0.95 : -0.95, 0.95); signo(g, R.signo);
        g.restore();
      }
    }
    // sellos de ¡EMPATE! que van creciendo
    for (const s of this.sellos) {
      const d = t - s.t0; if (d < 0 || d > 0.6) continue;
      const k = lerp(1.8, 1, eOut(tramo(d, 0, 0.12))), a = Math.min(1, d * 10) * (1 - tramo(d, 0.45, 0.6));
      g.save(); g.globalAlpha = a; g.translate(512, s.y); g.rotate(s.rot); g.scale(k, k);
      g.font = `400 ${s.tam}px ${FC}`;
      const w = g.measureText("¡EMPATE!").width + 40;
      g.strokeStyle = "#ff3d84"; g.lineWidth = 6; rectR(g, -w / 2, -s.tam * 0.85, w, s.tam * 1.15, 10); g.stroke();
      txt(g, "¡EMPATE!", 0, 0, { tam: s.tam, peso: 400, fam: FC, color: "#ff3d84", esp: 3 });
      g.restore();
    }
    // ¡EMPATE! final
    if (t > T_BRINDIS + 0.05) {
      const d = t - T_BRINDIS - 0.05, k = tramo(d, 0, 0.17), s = lerp(2.6, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 8));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * luz; g.translate(512, 118); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    if (luz < 1) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (this._tit) return this._tit;
    const c = lienzoNuevo(680, 220), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 50, 0, 160);
    gr.addColorStop(0, "#fff0f6"); gr.addColorStop(0.5, "#ff8ab8"); gr.addColorStop(1, "#ff3d84");
    txt(g, "¡EMPATE!", 340, 160, { tam: 146, peso: 900, fam: FD, color: gr, borde: "#3a0018", bordeAncho: 12, esp: 5, glow: "rgba(255,61,132,.8)", glowTam: 26 });
    return (this._tit = c);
  }
}

registrar({ id: "00085", nombre: "Piedra, papel o tijera", crear: () => new Piedra() });
})();
