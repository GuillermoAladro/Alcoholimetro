"use strict";
/*
 * 00005 · LA JARRA QUE SE ESCAPA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Hay una jarra en el suelo. Él se acerca relamiéndose, pero a la jarra le salen patitas y se escapa corriendo.
 * La persigue de lado a lado de la pantalla (¡VUELVE AQUÍ!), cada vez más rápido. Al final vuelve a pasar… pero
 * huyendo él, perseguido por una jarra gigante y enfadada que le grita ¡VUELVE AQUÍ!
 */
(() => {
const ESC = 1.5;
// pasadas: [quién, t0, x0, velocidad] (x de los pies; velocidad en px/s)
const PASADAS = [
  { t0: 3.2, x0: 1150, v: -950, tj: 3.2, tg: 3.55 },
  { t0: 4.9, x0: -130, v: 1350, tj: 4.9, tg: 5.15 },
  { t0: 6.2, x0: 1160, v: -1900, tj: 6.2, tg: 6.33 },
];
const T_HUYE = 1.85, T_PERSIGUE = 2.1, T_VUELTA = 7.2, V_VUELTA = 620;

class EscenaJarra extends Escena {
  constructor() {
    super(10.7);
    this.p = new Parts(300);
    this.faseG = 0; this.faseJ = 0;
  }
  /** Posición de la jarra: { x, esc, v, visible, enfadada }. */
  jarra(t) {
    if (t < T_HUYE) return { x: 650, esc: 1.2, v: 0 };
    if (t < 3.2) return { x: 650 + 560 * (t - T_HUYE) * Math.min(1, (t - T_HUYE) * 5), esc: 1.2, v: 560 };
    for (const P of PASADAS) if (t >= P.tj && t < P.tj + 1.5) { const x = P.x0 + P.v * (t - P.tj); if (x > -200 && x < 1230) return { x, esc: 1.2, v: P.v }; }
    if (t >= 7.55) return { x: -300 + V_VUELTA * (t - 7.55), esc: 2.5, v: V_VUELTA, enfadada: true };
    return null;
  }
  /** Posición de Guillermo: { x, v, modo }. */
  guille(t) {
    if (t < T_PERSIGUE) return { x: lerp(-130, 360, eOut(tramo(t, 0.2, 1.65))), v: t < 1.65 ? 300 : 0, modo: "anda" };
    if (t < 3.2) return { x: 360 + 850 * (t - T_PERSIGUE) * Math.min(1, (t - T_PERSIGUE) * 4), v: 850, modo: "corre" };
    for (const P of PASADAS) if (t >= P.tg && t < P.tg + 1.6) { const x = P.x0 + P.v * (t - P.tg); if (x > -200 && x < 1230) return { x, v: P.v, modo: "corre" }; }
    if (t >= T_VUELTA) return { x: -130 + V_VUELTA * (t - T_VUELTA), v: V_VUELTA, modo: "huye" };
    return null;
  }
  estado() {
    const t = this.t, G = this.guille(t);
    if (!G) return null;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], giro = 0, bote = 0;
    const dir = Math.sign(G.v) || 1, rapido = Math.min(1, Math.abs(G.v) / 900);
    if (G.modo === "anda") {
      if (G.v > 0) { const a = andar(this.faseG, 0.8); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; bote = a.bote; }
      pose.cara = t < 1.2 ? "sonrisa" : "guino";
      // se acerca con la mano por delante
      if (t > 1.3) manoD = mezcla(manoD, [118, 112], eInOut(tramo(t, 1.3, 1.75)));
      if (t > T_HUYE) { pose.cara = "sorpresa"; manoD = mezcla([118, 112], [96, 60], eOut(tramo(t, T_HUYE, 2.0))); manoI = [-20, 60]; }
    } else {
      const a = andar(this.faseG, 1.45); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; bote = a.bote * 1.3;
      giro = 0.1 * dir * rapido;
      const s = Math.sin(this.faseG);
      if (G.modo === "corre") {
        pose.cara = t < 4 ? "sorpresa" : t < 6 ? "risa" : "borracho";
        // un brazo estirado hacia la jarra; el otro bracea
        if (dir > 0) { manoD = [128, 104 + 6 * s]; manoI = [-6 + 14 * s, 140]; }
        else { manoI = [-50, 104 + 6 * s]; manoD = [84 - 14 * s, 140]; }
      } else {
        // huye con los brazos arriba
        pose.cara = "sorpresa";
        manoD = [94 + 6 * s, 12 + 10 * Math.cos(this.faseG * 1.3)]; manoI = [-16 - 6 * s, 12 - 10 * Math.cos(this.faseG * 1.3)];
        pose.rc = 0.05 * s;
      }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(G.x, PIES + bote, ESC, giro);
    return { pose, m, G };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const G = this.guille(t), J = this.jarra(t);
    if (G) this.faseG += dt * (G.modo === "anda" ? 9 : 9 + Math.abs(G.v) / 90);
    if (J) this.faseJ += dt * (J.v ? 14 + Math.abs(J.v) / 60 : 0);
    // polvo al correr
    if (G && G.modo !== "anda" && Math.random() < 30 * dt) p.nueva(P.POLVO, G.x - Math.sign(G.v) * 20, PIES - 4, -G.v * 0.15 + azar(-40, 40), azar(-40, -5), azar(0.4, 0.8), azar(24, 44));
    if (J && J.v && Math.random() < 22 * dt * J.esc) p.nueva(P.POLVO, J.x - Math.sign(J.v) * 20 * J.esc, PIES - 4, -J.v * 0.15 + azar(-40, 40), azar(-40, -5), azar(0.4, 0.8), azar(20, 36) * J.esc);
    this.una("huye", t > T_HUYE, () => { temblar(6, 0.2); for (let i = 0; i < 18; i++) p.nueva(P.POLVO, 650 + azar(-30, 30), PIES - 4, azar(-500, -100), azar(-60, -10), azar(0.5, 0.9), azar(30, 50)); });
    this.una("gigante", t > 7.75, () => temblar(10, 0.4));
    if (t > 7.75 && t < 9.9) { const Jg = this.jarra(t); if (Jg && Math.sin(this.faseJ) > 0.92) temblar(7, 0.15); }
    p.actualizar(dt);
  }
  /** Jarra con patitas. (x, y) = entre los pies. */
  dibujarJarra(g, x, y, esc, fase, mira, J, t) {
    const corre = J.v !== 0, enfadada = !!J.enfadada, dir = Math.sign(J.v) || 1;
    g.save(); g.translate(x, y); g.scale(esc, esc);
    const bote = corre ? -Math.abs(Math.sin(fase)) * 6 : -Math.max(0, Math.sin(t * 3)) * 2;
    const salto = J.salto || 0;
    g.translate(0, bote - salto);
    g.rotate(corre ? 0.08 * dir : 0);
    const W0 = 66, H0 = 82, base = -30; // cuerpo de la jarra encima de las piernas
    // piernas y zapatillas
    for (const [lx, f] of [[-13, 0], [13, Math.PI]]) {
      const a = corre ? 0.75 * Math.sin(fase + f) : 0;
      const pie = [lx + Math.sin(a) * 28, base + Math.cos(a) * 28 - (corre ? Math.max(0, -Math.cos(fase + f)) * 6 : 0)];
      g.strokeStyle = "#e9d3a0"; g.lineWidth = 6; g.lineCap = "round";
      g.beginPath(); g.moveTo(lx, base); g.lineTo(pie[0], pie[1]); g.stroke();
      g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(pie[0] + 5 * dir, pie[1] + 1, 11, 6, 0, 0, 6.283); g.fill();
      g.fillStyle = enfadada ? "#d6202f" : "#2bff5b"; g.fillRect(pie[0] + 5 * dir - 10, pie[1] + 3, 20, 3);
    }
    // bracitos
    for (const [sx, f] of [[-1, Math.PI], [1, 0]]) {
      const a = corre ? 0.9 * Math.sin(fase + f) : 0.2, hx = sx * (W0 / 2), hy = base - H0 * 0.55;
      g.strokeStyle = "#e9d3a0"; g.lineWidth = 5;
      g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + sx * 16 + Math.sin(a) * 6, hy + 14 + Math.cos(a) * 8 - (enfadada ? 26 : 0)); g.stroke();
      g.fillStyle = "#f4e2b8"; g.beginPath(); g.arc(hx + sx * 16 + Math.sin(a) * 6, hy + 14 + Math.cos(a) * 8 - (enfadada ? 26 : 0), 4.5, 0, 6.283); g.fill();
    }
    // asa
    g.strokeStyle = "rgba(225,240,255,.85)"; g.lineWidth = 7;
    g.beginPath(); g.moveTo(W0 / 2 - 2, base - H0 + 18); g.bezierCurveTo(W0 / 2 + 30, base - H0 + 14, W0 / 2 + 30, base - 18, W0 / 2 - 2, base - 22); g.stroke();
    // cuerpo
    const x0 = -W0 / 2, y0 = base - H0;
    rectR(g, x0, y0, W0, H0, 8); g.fillStyle = "rgba(200,225,255,.2)"; g.fill();
    g.save(); rectR(g, x0, y0, W0, H0, 8); g.clip();
    const gr = g.createLinearGradient(0, base, 0, y0);
    gr.addColorStop(0, enfadada ? "#b03a00" : "#c46a00"); gr.addColorStop(1, enfadada ? "#ff8a1f" : "#ffc21f");
    g.fillStyle = gr; g.fillRect(x0, y0 + 14, W0, H0);
    g.fillStyle = "rgba(255,245,200,.7)";
    for (let i = 0; i < 7; i++) { const by = base - 4 - ((t * 40 + i * 11) % (H0 - 20)); g.beginPath(); g.arc(x0 + 8 + ((i * 9.7) % (W0 - 16)), by, 1.8, 0, 6.283); g.fill(); }
    g.restore();
    // espuma (rebosa si está enfadada)
    g.fillStyle = "#fffaf0";
    g.beginPath(); g.moveTo(x0 - 2, y0 + 18);
    for (let i = 0; i <= 5; i++) g.arc(x0 + (W0 / 5) * i, y0 + 10 - (i % 2) * 3 + Math.sin(t * 6 + i) * 1.2, 8 + (i % 2) * 2.5, Math.PI, 0);
    g.lineTo(x0 + W0 + 2, y0 + 18); g.closePath(); g.fill();
    if (enfadada) { g.beginPath(); g.ellipse(x0 + 4, y0 + 24, 6, 12, 0, 0, 6.283); g.ellipse(x0 + W0 - 10, y0 + 30, 5, 14, 0, 0, 6.283); g.fill(); }
    rectR(g, x0, y0, W0, H0, 8); g.strokeStyle = "rgba(235,245,255,.9)"; g.lineWidth = 2.2; g.stroke();
    g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(x0 + 6, y0 + 20, 4, H0 - 30);
    // ojos
    const parpadea = !corre && (t % 1.7) > 1.6;
    for (const ex of [-12, 12]) {
      const ey = y0 + 36;
      g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(ex, ey, 9, parpadea ? 1.5 : (J.susto ? 13 : 11), 0, 0, 6.283); g.fill();
      g.strokeStyle = "rgba(0,0,0,.5)"; g.lineWidth = 1.2; g.stroke();
      if (!parpadea) { g.fillStyle = "#1b1b1b"; g.beginPath(); g.arc(ex + mira * 4, ey + 2, J.susto ? 3.5 : 4.5, 0, 6.283); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(ex + mira * 4 + 1.5, ey, 1.3, 0, 6.283); g.fill(); }
      if (enfadada) { g.strokeStyle = "#3a1200"; g.lineWidth = 4; g.lineCap = "round"; g.beginPath(); g.moveTo(ex - 9 * Math.sign(ex), ey - 9); g.lineTo(ex + 8 * Math.sign(ex), ey - 18); g.stroke(); }
    }
    // boca
    if (enfadada) { g.fillStyle = "#4a1200"; g.beginPath(); g.ellipse(0, y0 + 60, 11, 8 + 3 * Math.abs(Math.sin(t * 9)), 0, 0, 6.283); g.fill(); g.fillStyle = "#ff6a6a"; g.beginPath(); g.ellipse(0, y0 + 64, 6, 3, 0, 0, 6.283); g.fill(); }
    else { g.strokeStyle = "#5a2a00"; g.lineWidth = 2.4; g.lineCap = "round"; g.beginPath(); g.arc(0, y0 + 54, 7, 0.2, Math.PI - 0.2); g.stroke(); }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), J = this.jarra(t);
    fondo(g, "#000");
    const aEsc = tramo(t, 0, 0.4) * (1 - tramo(t, 10.0, 10.6));
    g.save(); g.globalAlpha = aEsc;
    // suelo con una franja de luz
    const gs = g.createLinearGradient(0, PIES - 6, 0, H);
    gs.addColorStop(0, "#1e1e24"); gs.addColorStop(1, "#060607");
    g.fillStyle = gs; g.fillRect(-60, PIES - 2, W + 120, H - PIES + 62);
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.25 * aEsc;
    g.drawImage(BLOB2.oro, 0, PIES - 40, W, 80);
    g.restore();
    // líneas de velocidad en las pasadas rápidas
    const rapidez = J ? Math.abs(J.v) / 1900 : 0;
    if (rapidez > 0.6 && !J.enfadada) {
      g.save(); g.strokeStyle = `rgba(255,255,255,${0.3 * rapidez})`; g.lineWidth = 2;
      const r = semilla(Math.floor(t * 20));
      for (let i = 0; i < 12; i++) { const y = 260 + r() * 300, x = r() * W; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 140, y); g.stroke(); }
      g.restore();
    }
    // la jarra (con estela si va muy deprisa)
    if (J) {
      const Jd = Object.assign({}, J);
      if (t < T_HUYE) { Jd.susto = t > 1.6; Jd.salto = 0; }
      if (t >= T_HUYE && t < T_HUYE + 0.2) Jd.salto = 40 * Math.sin(tramo(t, T_HUYE, T_HUYE + 0.2) * Math.PI);
      const G = this.guille(t);
      const mira = t < T_HUYE ? (G ? clamp((G.x - J.x) / 200, -1, 1) : 0) : -Math.sign(J.v) * (J.enfadada ? -1 : 1) * 0.6;
      if (Math.abs(J.v) > 1200) for (let k = 3; k >= 1; k--) { g.save(); g.globalAlpha = 0.18 * (4 - k) / 3; this.dibujarJarra(g, J.x - Math.sign(J.v) * k * 36, PIES, J.esc, this.faseJ, mira, Jd, t); g.restore(); }
      this.dibujarJarra(g, J.x, PIES, J.esc, this.faseJ, mira, Jd, t);
      if (t > 1.6 && t < 2.1) {
        const k = tramo(t, 1.6, 1.7);
        g.save(); g.translate(J.x + 10, PIES - 200); g.scale(eBack(k), eBack(k));
        txt(g, "!", 0, 0, { tam: 74, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a2400", bordeAncho: 7 });
        g.restore();
      }
    }
    if (e) {
      if (Math.abs(e.G.v) > 1200) for (let k = 2; k >= 1; k--) { g.save(); g.globalAlpha = 0.2 * (3 - k) / 2; pintarAvatar(g, matAv(e.G.x - Math.sign(e.G.v) * k * 40, PIES, ESC, 0.1 * Math.sign(e.G.v)), e.pose, t); g.restore(); }
      pintarAvatar(g, e.m, e.pose, t);
    }
    this.p.dibujar(g);
    // ¡VUELVE AQUÍ! (él)
    if (e && t > 2.0 && t < 3.15) {
      const q = aPant(e.m, [39, -8]), k = tramo(t, 2.0, 2.2) * (1 - tramo(t, 2.95, 3.15));
      const cx = clamp(q[0] + 30, 210, W - 210);
      bocadillo(g, cx, q[1] - 70, "¡VUELVE AQUÍ!", q[0], q[1] - 6, k, 40);
    }
    // ¡VUELVE AQUÍ! (la jarra gigante)
    if (J && J.enfadada && t > 8.05 && t < 9.95) {
      const k = tramo(t, 8.05, 8.25) * (1 - tramo(t, 9.75, 9.95));
      const cx = clamp(J.x + 30, 230, W - 230), top = PIES - 30 * J.esc - 82 * J.esc;
      g.save(); g.translate(azar(-2, 2), azar(-2, 2));
      bocadillo(g, cx, top - 70, "¡VUELVE AQUÍ!", J.x, top - 4, k, 50);
      g.restore();
    }
    const n = 1 - tramo(t, 0, 0.35);
    if (n > 0) { g.fillStyle = `rgba(0,0,0,${n})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00005", nombre: "La jarra que se escapa", crear: () => new EscenaJarra() });
})();
