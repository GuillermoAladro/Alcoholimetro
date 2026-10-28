"use strict";
/*
 * 00128 · LATA AGITADA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Mientras Rodrigo bosteza y se estira con los ojos cerrados, Guillermo guiña un ojo y agita una lata como loco (la
 * lata se hincha). Se la ofrece con cara de no haber roto un plato; Rodrigo la coge, tira de la anilla y… ¡PSSSHT!:
 * la espuma le explota en la cara (¡SORPRESA!). Se limpia, se ríe y le devuelve un chorrito a Guillermo. Acaban los
 * dos muertos de risa y se apaga la lámpara.
 */
(() => {
const ESC = 1.9, AY = 660, BARRA = 470;
const XG = 400, XR = 645;
const T_BOOM = 4.6, T_CHORRO = 6.95;
const PM = [522, 398]; // donde se pasan la lata

const pantAU = (x, q) => [(q[0] - x) / ESC + 39, (q[1] - AY) / ESC + 232];
/** Pegotes de espuma alrededor de un centro (unidades de avatar). */
function pegotes(n, cx, cy, rx, ry, t0, t1, sem) {
  const rnd = semilla(sem), L = [];
  for (let i = 0; i < n; i++) {
    const a = rnd() * 6.283, r = Math.sqrt(rnd());
    const x = cx + Math.cos(a) * r * rx, y = cy + Math.sin(a) * r * ry;
    L.push({ x, y, r: 3.6 + rnd() * 4.6, t0: lerp(t0, t1, rnd()), cae: rnd() });
  }
  return L;
}
function dibujarPegotes(g, L, t, quitar) {
  const s = SPR.espuma;
  for (const b of L) {
    if (t < b.t0) continue;
    if (quitar && quitar(b, t)) continue;
    const k = eBack(tramo(t, b.t0, b.t0 + 0.14)), r = b.r * k * 1.1;
    const dy = t > b.t0 + 0.6 ? Math.min(6, (t - b.t0 - 0.6) * 2.2 * b.cae) : 0;
    g.drawImage(s, b.x - r, b.y + dy - r, r * 2, r * 2);
  }
}

class LataAgitada extends Escena {
  constructor() {
    super(9.9);
    this.p = new Parts(460);
    const RR = avatar("rodrigo").rig;
    // espuma en la cara de Rodrigo (y en el pelo) y luego unos pegotes en Guillermo
    this.espR = pegotes(30, RR.bocaPos[0] + 1, 52, 25, 28, T_BOOM + 0.03, T_BOOM + 0.4, 11)
      .concat(pegotes(12, 38, 22, 26, 10, T_BOOM + 0.1, T_BOOM + 0.5, 23))
      .concat(pegotes(8, 38, 84, 28, 6, T_BOOM + 0.25, T_BOOM + 0.7, 31));
    this.espG = pegotes(9, 40, 18, 24, 9, T_CHORRO + 0.22, T_CHORRO + 0.45, 41).concat(pegotes(2, 17, 50, 3, 4, T_CHORRO + 0.25, T_CHORRO + 0.4, 43));
    this.boca = [];
  }
  /** Mano que limpia la cara (x de la mano en unidades, o null). */
  limpia(t) { return t > 6.0 && t < 6.6 ? lerp(64, 12, eInOut(tramo(t, 6.05, 6.55))) : null; }
  poses() {
    const t = this.t, RR = avatar("rodrigo").rig;
    // ---------------- Guillermo
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [60, 116], manoI: [9, 160] };
    let dyG = 0, giroG = 0, angL = 0, bulto = 0;
    const agita = t > 1.0 && t < 2.8;
    if (t > 0.45 && t < 1.0) { G.cara = "guino"; G.rc = 0.05; G.manoD = mezcla([60, 116], [64, 100], eOut(tramo(t, 0.45, 0.7))); }
    if (agita) {
      const f = Math.sin((t - 1.0) * 2 * Math.PI * 6.5);
      G.manoD = [64 + 3 * Math.sin(t * 21), 100 + 15 * f];
      angL = 0.35 * f;
      G.cara = Math.floor(t * 3) % 2 ? "risa" : "guino";
      G.rc = 0.04 * f; dyG = 1.2 * f;
    }
    bulto = 0.38 * eInOut(tramo(t, 1.0, 2.8));
    if (t >= 2.8) {
      G.manoD = [64 + azar(-0.4, 0.4), 104 + azar(-0.4, 0.4)]; angL = azar(-0.03, 0.03);
      G.cara = "sonrisa"; G.rc = -0.04;
    }
    // se la ofrece
    const ofrece = pantAU(XG, [PM[0], PM[1] + 6]);
    const kOf = eInOut(tramo(t, 3.2, 3.7));
    if (t > 3.2) G.manoD = mezcla(G.manoD, ofrece, kOf);
    const tieneG = t < 3.92;
    if (t >= 3.92) {
      G.manoD = mezcla(ofrece, [70, 158], eInOut(tramo(t, 3.92, 4.2)));
      G.cara = "guino"; giroG = -0.05 * eInOut(tramo(t, 3.95, 4.3));
      const kO = eInOut(tramo(t, 4.15, 4.45));
      G.manoD = mezcla(G.manoD, [74, 52], kO); G.manoI = mezcla([9, 160], [5, 52], kO); G.brazoIDelante = true;
    }
    if (t >= T_BOOM) {
      G.cara = "risa"; giroG = -0.05 + 0.05 * Math.sin(t * 11) * tramo(t, T_BOOM + 0.3, T_BOOM + 0.6);
      const kB = eInOut(tramo(t, T_BOOM + 0.3, T_BOOM + 0.7));
      G.manoD = mezcla([74, 52], [66, 122], kB); G.manoI = mezcla([5, 52], [14, 124], kB);
      dyG = -2 * Math.abs(Math.sin(t * 11)) * kB;
    }
    if (t >= T_CHORRO + 0.2 && t < T_CHORRO + 0.65) { G.cara = "sorpresa"; G.puntas = 0.7; giroG = -0.08; dyG = 0; }
    if (t >= T_CHORRO + 0.65) { G.cara = "risa"; G.puntas = 0.7 * (1 - tramo(t, T_CHORRO + 0.65, T_CHORRO + 1.1)); giroG = 0.04 * Math.sin(t * 10); dyG = -2.5 * Math.abs(Math.sin(t * 10)); G.manoD = [70, 126]; G.manoI = [8, 126]; }
    if (tieneG) G.objD = (g, m) => dibujarLata(g, m[0] - 1, m[1] - 3, angL, { bulto });
    const mG = matAv(XG, AY + dyG, ESC, giroG);

    // ---------------- Rodrigo
    const R = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [58, 130], manoI: [14, 130] };
    let dyR = 0, syR = 1, angR = 0, giroR = 0;
    // bosteza y se estira
    const kE = eInOut(tramo(t, 1.0, 1.35)) * (1 - eInOut(tramo(t, 2.55, 2.95)));
    if (kE > 0) {
      R.manoD = mezcla(R.manoD, [70 + 3 * Math.sin(t * 3), 14], kE); R.manoI = mezcla(R.manoI, [6 - 3 * Math.sin(t * 3), 14], kE);
      R.cara = kE > 0.3 ? "dormido" : "sonrisa"; R.rc = -0.08 * kE + 0.04 * Math.sin(t * 2.5) * kE; syR = 1 + 0.03 * kE;
    }
    // coge la lata
    const coge = pantAU(XR, PM);
    if (t > 3.3) { R.cara = "risa"; R.brazoIDelante = true; }
    const kC = eInOut(tramo(t, 3.5, 3.85));
    if (t > 3.5) R.manoI = mezcla(R.manoI, coge, kC);
    const pecho = [30, 112];
    const kP = eInOut(tramo(t, 3.95, 4.3));
    if (t > 3.95) R.manoI = mezcla(coge, pecho, kP);
    // tira de la anilla
    const kA = eInOut(tramo(t, 4.2, 4.45));
    const anilla = [pecho[0] + 4, pecho[1] - 15];
    if (t > 4.2 && t < 6.0) R.manoD = mezcla([58, 130], anilla, kA);
    if (t > 4.45 && t < T_BOOM) R.manoD = [anilla[0] + 2, anilla[1] - 5 * tramo(t, 4.45, T_BOOM)];
    if (t > 4.1 && t < T_BOOM) R.cara = "sonrisa";
    // ¡PSSSHT!
    if (t >= T_BOOM) {
      const d = t - T_BOOM;
      R.cara = "sorpresa"; R.puntas = 1 - 0.6 * tramo(d, 0.6, 1.4);
      R.rc = -0.12 * eOut(tramo(d, 0, 0.12)) * (1 - tramo(d, 1, 1.4)) + 0.03 * Math.sin(t * 40) * (1 - tramo(d, 0, 1));
      dyR = -10 * Math.sin(Math.min(1, d / 0.25) * Math.PI) * (d < 0.25 ? 1 : 0);
      giroR = 0.05 * eOut(tramo(d, 0, 0.12)) * (1 - tramo(d, 0.6, 1.2));
      R.manoD = mezcla(anilla, [80, 118], eOut(tramo(d, 0, 0.15)));
      angR = 0.05 * Math.sin(t * 30) * (1 - tramo(d, 0, 1.2));
    }
    // se limpia la cara
    const xl = this.limpia(t);
    if (xl != null) { R.manoD = [xl + 6, 58 + 3 * Math.sin(t * 25)]; R.cara = "sorpresa"; }
    if (t >= 6.55) { R.cara = "risa"; R.puntas = 0.4 * (1 - tramo(t, 6.6, 7.0)); R.manoD = mezcla([18, 58], [58, 128], eInOut(tramo(t, 6.55, 6.85))); }
    // chorrito para Guillermo
    const kCh = eInOut(tramo(t, 6.6, 6.95)) * (1 - eInOut(tramo(t, 7.6, 8.0)));
    if (kCh > 0) { R.manoI = mezcla(pecho, [8, 96], kCh); angR = -1.05 * kCh; R.cara = kCh > 0.5 ? "guino" : "risa"; }
    if (t > 7.6) { R.cara = "risa"; dyR = -2.5 * Math.abs(Math.sin(t * 10 + 1)); giroR = 0.04 * Math.sin(t * 10 + 1); }
    R.objI = (g, m) => { if (t >= 3.92) dibujarLata(g, m[0] + 1, m[1] - 4, angR, { bulto: t < T_BOOM ? 0.38 : 0.12, abierta: t >= T_BOOM - 0.05 }); };
    const mR = matAv(XR, AY + dyR, ESC, giroR, 1, syR);
    return { G, mG, R, mR, angL, angR };
  }
  bocaLata(e) {
    // la boca de la lata de Rodrigo en pantalla
    const m = e.R._manoI || [30, 112];
    const c = [m[0] + 1, m[1] - 4], top = rot2([1.6, -12.5], e.angR);
    return aPant(e.mR, [c[0] + top[0], c[1] + top[1]]);
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // sacudidas
    if (t > 1.0 && t < 2.8) { this.una("chac" + Math.floor((t - 1) / 0.6), true, () => temblar(3, 0.12)); }
    this.una("boom", t > T_BOOM, () => {
      temblar(22, 0.55);
      const e = this.poses(), q = this.bocaLata(e);
      p.nueva(P.DESTELLO, q[0], q[1] - 40, 0, 0, 0.35, 260);
      for (let i = 0; i < 70; i++) { const a = azar(-Math.PI * 0.95, -Math.PI * 0.05), v = azar(250, 900); p.nueva(P.ESPUMA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.5, 1.1), azar(5, 13)); }
    });
    // la fuente de espuma
    if (t > T_BOOM && t < T_BOOM + 1.3) {
      const e = this.poses(), q = this.bocaLata(e), k = 1 - tramo(t, T_BOOM, T_BOOM + 1.3);
      const n = Math.round(260 * k * dt * 2);
      for (let i = 0; i < n; i++) p.nueva(P.ESPUMA, q[0] + azar(-4, 4), q[1], azar(-200, 200) * (0.4 + k), azar(-760, -360) * (0.5 + 0.5 * k), azar(0.4, 0.9), azar(4, 11));
    }
    // el chorrito para Guillermo
    if (t > T_CHORRO && t < T_CHORRO + 0.35) {
      const e = this.poses(), q = this.bocaLata(e);
      for (let i = 0; i < 5; i++) p.nueva(P.ESPUMA, q[0], q[1], azar(-1000, -860), azar(-470, -380), azar(0.25, 0.4), azar(5, 10));
    }
    this.una("toca", t > T_CHORRO + 0.22, () => {
      temblar(7, 0.2);
      const e = this.poses(), q = aPant(e.mG, [39, 30]);
      for (let i = 0; i < 18; i++) { const a = azar(0, 6.283), v = azar(80, 300); p.nueva(P.ESPUMA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v - 100, azar(0.4, 0.7), azar(4, 9)); }
    });
    // la espuma que cae de la cara de Rodrigo al limpiarse
    const xl = this.limpia(t);
    if (xl != null && Math.random() < 30 * dt) { const e = this.poses(), q = aPant(e.mR, [xl, 55]); p.nueva(P.ESPUMA, q[0], q[1], azar(-60, 60), azar(-40, 40), azar(0.4, 0.7), azar(5, 10)); }
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
    const t = this.t, e = this.poses(), RR = avatar("rodrigo").rig;
    fondo(g, "#000");
    const luz = 1 - tramo(t, 9.2, 9.85);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.4 * luz;
    g.drawImage(BLOB2.oroClaro, 100, 30, 824, 540); g.restore();
    // espuma por la barra (después del estallido)
    pintarAvatar(g, e.mG, e.G, t);
    conMat(g, e.mG, () => { g.translate(39, 72); g.rotate(e.G.rc); g.translate(-39, -72); dibujarPegotes(g, this.espG, t); });
    // Rodrigo: la espuma de la cara se pinta en objD (entre la cara y el brazo derecho, que la limpia por delante)
    const xl = this.limpia(t);
    e.R.objD = (gg) => {
      gg.save(); gg.translate(RR.cuello[0], RR.cuello[1]); gg.rotate(e.R.rc); gg.translate(-RR.cuello[0], -RR.cuello[1]);
      dibujarPegotes(gg, this.espR, t, (b, tt) => {
        if (tt < 6.05 || b.y < 34 || b.y > 72 || Math.abs(b.x - 38) > 20) return false;
        return tt > 6.55 || (xl != null && b.x > xl);
      });
      gg.restore();
    };
    pintarAvatar(g, e.mR, e.R, t);
    // chorro del estallido
    if (t > T_BOOM && t < T_BOOM + 0.5) {
      const q = this.bocaLata(e), k = 1 - tramo(t, T_BOOM + 0.15, T_BOOM + 0.5), top = aPant(e.mR, [40, 6]);
      g.save(); g.globalAlpha = k;
      const gr = g.createLinearGradient(0, q[1], 0, top[1]);
      gr.addColorStop(0, "#fffaf0"); gr.addColorStop(1, "rgba(255,250,240,.2)");
      g.fillStyle = gr; g.beginPath();
      g.moveTo(q[0] - 8, q[1]); g.lineTo(top[0] - 70, top[1] - 30); g.quadraticCurveTo(top[0], top[1] - 70, top[0] + 70, top[1] - 30); g.lineTo(q[0] + 8, q[1]); g.closePath(); g.fill();
      g.restore();
    }
    this.barra(g);
    this.p.dibujar(g);
    // rayitas de agitar
    if (t > 1.0 && t < 2.8) {
      const q = aPant(e.mG, e.G._manoD || [64, 100]);
      g.save(); g.strokeStyle = "rgba(255,253,245,.85)"; g.lineWidth = 4; g.lineCap = "round";
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
        const x = q[0] + s * (40 + i * 13), y = q[1] - 10;
        g.beginPath(); g.moveTo(x, y - 30 + i * 4); g.quadraticCurveTo(x + s * 8, y, x, y + 30 - i * 4); g.stroke();
      }
      g.restore();
      const k = (t * 1.6) % 1;
      txt(g, "¡CHAC!", q[0] + (Math.floor(t * 1.6) % 2 ? 90 : -90), q[1] - 90 - k * 20, { tam: 40, peso: 400, fam: FC, color: "#2bff5b", borde: "#0a3a16", bordeAncho: 7, alfa: 1 - k, esp: 2 });
    }
    // bostezo
    if (t > 1.3 && t < 2.6) {
      const q = aPant(e.mR, [38, 8]);
      txt(g, "UAAAH…", q[0] + 110, q[1] - 10, { tam: 34, peso: 400, fam: FC, color: "#d9f1ff", borde: "#1d3550", bordeAncho: 6, alfa: tramo(t, 1.3, 1.5) * (1 - tramo(t, 2.4, 2.6)), esp: 2 });
    }
    // ¿UNA LATA?
    if (t > 3.15 && t < 4.15) {
      const q = aPant(e.mG, [30, 4]);
      bocadillo(g, q[0] - 70, q[1] - 70, "¿UNA LATA?", q[0] - 10, q[1] - 10, tramo(t, 3.15, 3.35) * (1 - tramo(t, 3.95, 4.15)), 34);
    }
    // ¡PSSSHT!
    if (t > T_BOOM && t < T_BOOM + 1.0) {
      const k = tramo(t, T_BOOM, T_BOOM + 0.12);
      g.save(); g.translate(810, 300); g.rotate(0.12); g.scale(eBack(k), eBack(k));
      txt(g, "¡PSSSHT!", 0, 0, { tam: 58, peso: 400, fam: FC, color: "#fffdf5", borde: "#0a6b2a", bordeAncho: 9, alfa: 1 - tramo(t, T_BOOM + 0.75, T_BOOM + 1.0), esp: 2 });
      g.restore();
    }
    // ¡SORPRESA!
    if (t > T_BOOM + 0.15) {
      const d = t - T_BOOM - 0.15, k = tramo(d, 0, 0.17), s = lerp(2.6, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 8));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - tramo(t, 8.8, 9.3)); g.translate(512, 112); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0, 0.4), 1 - luz);
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (this._tit) return this._tit;
    const c = lienzoNuevo(820, 230), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 60, 0, 170);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.6, "#fff6dc"); gr.addColorStop(1, "#ffd77a");
    txt(g, "¡SORPRESA!", 410, 165, { tam: 128, peso: 400, fam: FB, color: gr, borde: "#6b3a0c", bordeAncho: 14, esp: 3, glow: "rgba(255,200,60,.8)", glowTam: 24, max: 780 });
    // burbujas de espuma sobre las letras
    const rnd = semilla(5);
    for (let i = 0; i < 16; i++) {
      const x = 90 + rnd() * 640, y = 62 + rnd() * 14, r = 7 + rnd() * 10;
      g.drawImage(SPR.espuma, x - r, y - r, r * 2, r * 2);
    }
    return (this._tit = c);
  }
}

registrar({ id: "00128", nombre: "Lata agitada", crear: () => new LataAgitada() });
})();
