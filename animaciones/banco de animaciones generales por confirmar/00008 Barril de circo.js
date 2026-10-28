"use strict";
/*
 * 00008 · BARRIL DE CIRCO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se encienden los focos de una carpa de circo. Llega un barril de cerveza rodando; se sube encima de un salto y
 * camina sobre él haciendo equilibrio (¡EQUILIBRIO!). Casi se cae, se recupera, saluda con los brazos en alto entre
 * confeti y el barril se lo lleva rodando por el otro lado. Se apagan los focos.
 */
(() => {
const ESC = 1.27, R = 70, XG = 600;
const T_LLEGA = 1.75, T_SALTA = 1.85, T_CAE = 2.35;

class EscenaCirco extends Escena {
  constructor() {
    super(10.1);
    this.p = new Parts(360);
    this.p.suelo = () => PIES - 2;
    this.fase = 0;
  }
  luz() { const t = this.t; return (t < 0.7 ? [0, 1, 0, 0, 1, 0.4, 1][Math.min(6, Math.floor(t / 0.1))] : 1) * (1 - tramo(t, 9.0, 9.75)); }
  xBarril(t) {
    if (t < T_LLEGA) return lerp(-140, 390, eOut(tramo(t, 0.3, T_LLEGA)));
    const s = t - T_LLEGA;
    return 390 + 15 * s + 4 * s * s + 1.4 * s * s * s;
  }
  /** Ángulo de giro del barril (rueda sin deslizar). */
  angBarril(t) { return (this.xBarril(t) + 140) / R; }
  /** Bamboleo (rad) mientras está encima. */
  bamboleo(t) {
    if (t < T_CAE) return 0;
    const casi = Math.sin(tramo(t, 5.5, 6.6) * Math.PI);
    return (0.07 * Math.sin(t * 2.3) + 0.04 * Math.sin(t * 5.1 + 1)) * (1 - casi) + 0.36 * casi * Math.sin((t - 5.5) * 7.5) * (1 - tramo(t, 6.3, 6.6) * 0.5);
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], x = XG, y = PIES, giro = 0, sx = 1, sy = 1;
    const xb = this.xBarril(t), top = PIES - 2 * R + 6;
    if (t < T_SALTA) {
      if (t > 0.9) pose.cara = "sorpresa";
      if (t > 1.35) pose.cara = "guino";
      // se agacha para saltar
      const k = eInOut(tramo(t, 1.45, T_SALTA));
      sy = 1 - 0.12 * k; sx = 1 + 0.04 * k;
      manoD = mezcla(manoD, [86, 176], k); manoI = mezcla(manoI, [-8, 176], k);
    } else if (t < T_CAE) {
      // salto hasta lo alto del barril
      const u = tramo(t, T_SALTA, T_CAE);
      x = lerp(XG, this.xBarril(T_CAE), u);
      y = lerp(PIES, top, u) - 150 * 4 * u * (1 - u);
      sy = 1.08; sx = 0.95;
      manoD = [98, 20]; manoI = [-20, 20]; pose.cara = "risa";
      pose.piernaI = [-10, 0.12]; pose.piernaD = [-14, -0.15];
    } else {
      // camina sobre el barril haciendo equilibrio
      x = xb; y = top;
      giro = this.bamboleo(t);
      const a = andar(this.fase, 0.75); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD;
      y += a.bote * 0.4;
      const s = Math.sin(t * 2.3);
      manoD = [116, 104 - 22 * s]; manoI = [-38, 104 + 22 * s];
      pose.cara = Math.abs(giro) > 0.16 ? "sorpresa" : t < 4.5 ? "risa" : "guino";
      pose.rc = -giro * 0.6;
      const aterriza = 1 - tramo(t, T_CAE, T_CAE + 0.2);
      sy = 1 - 0.1 * Math.sin(aterriza * Math.PI);
      // casi se cae: brazos como aspas
      const casi = Math.sin(tramo(t, 5.5, 6.6) * Math.PI);
      if (casi > 0) { manoD = mezcla(manoD, [100 + 20 * Math.cos(t * 16), 40 + 30 * Math.sin(t * 16)], casi); manoI = mezcla(manoI, [-22 - 20 * Math.cos(t * 16 + 1), 40 - 30 * Math.sin(t * 16 + 1)], casi); }
      // ¡tachán!
      const kT = eOut(tramo(t, 6.9, 7.25));
      if (kT > 0) { manoD = mezcla(manoD, [100, 4], kT); manoI = mezcla(manoI, [-22, 4], kT); if (t > 6.9) pose.cara = "risa"; }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(x, y, ESC, giro, sx, sy);
    return { pose, m, x };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    if (t > T_CAE) this.fase += dt * 10;
    const xb = this.xBarril(t);
    if (t > 0.3 && Math.random() < 14 * dt) p.nueva(P.POLVO, xb - 30, PIES - 4, azar(-120, -40), azar(-40, -5), azar(0.4, 0.8), azar(20, 36));
    this.una("aterriza", t > T_CAE, () => {
      temblar(10, 0.25);
      for (let i = 0; i < 16; i++) p.nueva(P.POLVO, xb + azar(-40, 40), PIES - 2 * R, azar(-200, 200), azar(-80, 20), azar(0.4, 0.8), azar(20, 36));
    });
    this.una("casi", t > 5.6, () => temblar(6, 0.3));
    this.una("tachan", t > 7.0, () => {
      temblar(12, 0.3);
      for (let i = 0; i < 150; i++) p.nueva(P.CONFETI, azar(0, W), azar(-200, -10), azar(-60, 60), azar(30, 140), azar(3.5, 5.5), azar(8, 14), (Math.random() * 5) | 0);
      const e = this.estado();
      for (const lado of [[100, 4], [-22, 4]]) { const q = aPant(e.m, lado); for (let i = 0; i < 12; i++) { const a = azar(0, 6.283), v = azar(150, 400); p.nueva(P.CHISPA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(7, 12)); } }
    });
    p.actualizar(dt);
  }
  dibujarCarpa(g, a) {
    if (a <= 0) return;
    g.save(); g.globalAlpha = a;
    const cx = W / 2, cy = -260;
    for (let i = -9; i <= 9; i++) {
      const a0 = Math.PI / 2 + i * 0.12, a1 = a0 + 0.12;
      g.fillStyle = i % 2 ? "#2c070d" : "#171312";
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a0) * 1200, cy + Math.sin(a0) * 1200); g.lineTo(cx + Math.cos(a1) * 1200, cy + Math.sin(a1) * 1200); g.closePath(); g.fill();
    }
    // viñeta: los bordes de la carpa se pierden en negro
    const gv = g.createRadialGradient(W / 2, 380, 120, W / 2, 380, 640);
    gv.addColorStop(0, "rgba(0,0,0,0)"); gv.addColorStop(1, "rgba(0,0,0,.85)");
    g.fillStyle = gv; g.fillRect(-60, -60, W + 120, H + 120);
    // banderines
    g.strokeStyle = "rgba(255,230,180,.35)"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(-20, 40); g.quadraticCurveTo(W / 2, 120, W + 20, 40); g.stroke();
    const cols = ["#d81c2e", "#ffd34d", "#2fe3e8", "#2bff5b", "#ff3d84"];
    for (let i = 0; i < 15; i++) {
      const u = (i + 0.5) / 15, x = lerp(-20, W + 20, u), y = (1 - u) * (1 - u) * 40 + 2 * u * (1 - u) * 120 + u * u * 40;
      g.fillStyle = cols[i % 5]; g.globalAlpha = a * 0.75;
      g.beginPath(); g.moveTo(x - 14, y); g.lineTo(x + 14, y); g.lineTo(x, y + 30); g.closePath(); g.fill();
    }
    g.globalAlpha = a;
    // pista: bordillo rojo con estrellas
    const gp = g.createLinearGradient(0, PIES, 0, H);
    gp.addColorStop(0, "#9c1020"); gp.addColorStop(1, "#4a0710");
    g.fillStyle = gp; g.fillRect(-60, PIES, W + 120, H - PIES + 60);
    g.fillStyle = "#ffd34d";
    for (let x = 40; x < W; x += 96) { estrella(g, x, PIES + 13, 7, 3, 0); g.fill(); }
    g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(-60, PIES, W + 120, 2);
    g.restore();
  }
  dibujarBarril(g, x, ang) {
    const y = PIES - R;
    // fondo (grosor)
    g.fillStyle = "#2a1709"; g.beginPath(); g.arc(x + 9, y - 6, R, 0, 6.283); g.fill();
    // aro de metal
    const ga = g.createLinearGradient(x - R, y - R, x + R, y + R);
    ga.addColorStop(0, "#d9dee3"); ga.addColorStop(0.4, "#7d858e"); ga.addColorStop(1, "#3a3f46");
    g.fillStyle = ga; g.beginPath(); g.arc(x, y, R, 0, 6.283); g.fill();
    // tapa de duelas
    g.save(); g.beginPath(); g.arc(x, y, R * 0.86, 0, 6.283); g.clip();
    const gw = g.createRadialGradient(x - 20, y - 24, 10, x, y, R);
    gw.addColorStop(0, "#d79a52"); gw.addColorStop(1, "#7a461a");
    g.fillStyle = gw; g.fillRect(x - R, y - R, 2 * R, 2 * R);
    g.translate(x, y); g.rotate(ang);
    g.strokeStyle = "rgba(60,30,8,.6)"; g.lineWidth = 2.2;
    for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * 22, -R); g.lineTo(i * 22, R); g.stroke(); }
    // sello y tapón
    g.fillStyle = "#b3001b"; g.beginPath(); g.arc(0, 0, 26, 0, 6.283); g.fill();
    g.strokeStyle = "#ffd34d"; g.lineWidth = 3; g.stroke();
    g.fillStyle = "#ffd34d"; estrella(g, 0, 0, 16, 7, 0); g.fill();
    g.fillStyle = "#3a2410"; g.beginPath(); g.arc(0, R * 0.6, 7, 0, 6.283); g.fill();
    g.fillStyle = "#8a5a2a"; g.beginPath(); g.arc(0, R * 0.6, 4, 0, 6.283); g.fill();
    g.restore();
    g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 3;
    g.beginPath(); g.arc(x, y, R - 4, Math.PI * 1.05, Math.PI * 1.45); g.stroke();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), luz = this.luz(), xb = this.xBarril(t);
    fondo(g, "#000");
    this.dibujarCarpa(g, luz);
    // dos focos cruzados que siguen al número
    const xs = t < T_SALTA ? XG : e.x;
    foco(g, 140, xs, PIES, 150, 0.9 * luz);
    foco(g, W - 140, xs, PIES, 150, 0.9 * luz);
    // sombras
    g.save(); g.globalAlpha = 0.5 * luz; g.fillStyle = "#000";
    g.beginPath(); g.ellipse(xb, PIES - 1, R * 0.9, 8, 0, 0, 6.283); g.fill();
    if (t < T_SALTA) { g.beginPath(); g.ellipse(XG, PIES - 1, 60, 8, 0, 0, 6.283); g.fill(); }
    g.restore();
    if (xb > -R - 20 && xb < W + R + 20) this.dibujarBarril(g, xb, this.angBarril(t));
    pintarAvatar(g, e.m, e.pose, t);
    this.p.dibujar(g);
    // ¡EQUILIBRIO!
    if (t > 2.9 && t < 8.9) {
      const k = tramo(t, 2.9, 3.15), a = 1 - tramo(t, 8.5, 8.9);
      g.save(); g.translate(W / 2, 96); g.rotate(0.02 * Math.sin(t * 2.3)); g.scale(eBack(k), eBack(k));
      const gr = g.createLinearGradient(0, -80, 0, 8);
      gr.addColorStop(0, "#fff6c2"); gr.addColorStop(0.5, "#ffcf2e"); gr.addColorStop(1, "#ff8a00");
      txt(g, "¡EQUILIBRIO!", 0, 0, { tam: 92, peso: 900, fam: FD, color: gr, borde: "#8a0014", bordeAncho: 11, alfa: a, esp: 4, glow: "rgba(255,80,60,.55)", glowTam: 18 });
      for (const lado of [-1, 1]) {
        g.save(); g.globalAlpha = a; g.translate(lado * 300, -32); g.rotate(t * 2 * lado);
        g.fillStyle = "#ffd34d"; estrella(g, 0, 0, 24, 10, 0); g.fill(); g.strokeStyle = "#8a0014"; g.lineWidth = 3; g.stroke();
        g.restore();
      }
      g.restore();
    }
    const negro = Math.max(t < 0.7 ? 0.97 * (1 - luz) : 0, tramo(t, 9.5, 10.05));
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00008", nombre: "Barril de circo", crear: () => new EscenaCirco() });
})();
