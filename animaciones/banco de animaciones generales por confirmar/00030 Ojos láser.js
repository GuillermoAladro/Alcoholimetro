"use strict";
/*
 * 00030 · OJOS LÁSER
 *
 * Animación del banco. Empieza y acaba en negro.
 * Entra andando, mira tres latas en la barra, se pone serio (cejas de enfado, dedo en la sien) y le brillan los ojos.
 * Tres disparos láser abren las latas a distancia (¡PSST! ×3) y sale el ¡ZAP! Remate: le da un láser a la lámpara,
 * la revienta y en la oscuridad solo quedan sus ojos rojos, que guiñan y se apagan.
 */
(() => {
const LATAS = [640, 785, 930]; // x de las latas en la barra
const BARRA = 430;             // superficie de la barra
const ESC_LATA = 3.4;
const LAMP = [785, 92];        // bombilla de la lámpara
const ZAPS = [2.8, 3.4, 3.95]; // disparo a cada lata
const ZAP_LAMP = 6.3;
const cache = cacheTexto();

function tituloZap() {
  if (cache.has("zap")) return cache.get("zap");
  const c = lienzoNuevo(560, 260), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 200);
  gr.addColorStop(0, "#fff6c8"); gr.addColorStop(0.45, "#ffcf2e"); gr.addColorStop(1, "#ff3a14");
  txt(g, "¡ZAP!", 280, 200, { tam: 180, peso: 400, fam: FC, color: gr, borde: "#4a0400", bordeAncho: 14, esp: 6, glow: "rgba(255,40,20,.9)", glowTam: 30 });
  cache.set("zap", c);
  return c;
}

class EscenaLaser extends Escena {
  constructor() {
    super(8.9);
    this.p = new Parts(320);
    this.ch = new Parts(100); // chispas de la lámpara (se ven en la oscuridad)
    this.p.suelo = () => BARRA;
    this.ESC = 1.6; this.fase = 0; this.x = -90;
    this.abiertas = [-1, -1, -1];
    this.rompe = -1;
  }
  xAv(t) { return lerp(-90, 250, 1 - Math.pow(1 - tramo(t, 0.2, 1.5), 1.7)); }
  /** Cuánto le brillan los ojos (0–1). */
  brillo(t) {
    let b = 0.75 * eIn(tramo(t, 2.0, 2.78));
    if (t >= 2.78) b = 1;
    if (t > 4.3) b = lerp(1, 0.22, tramo(t, 4.3, 4.9));
    if (t > 5.85) b = Math.max(b, eIn(tramo(t, 5.85, 6.28)));
    if (t > 8.15) b *= 1 - tramo(t, 8.15, 8.3);
    return b;
  }
  serio(t) { return Math.max(tramo(t, 1.95, 2.1) * (1 - tramo(t, 4.25, 4.45)), tramo(t, 5.8, 5.95) * (1 - tramo(t, 6.75, 6.9))); }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], bote = 0, dx = 0;
    if (t < 1.5) {
      const a = andar(this.fase, 1); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; bote = a.bote;
      manoD = [70 + 5 * Math.sin(this.fase), 158]; manoI = [9 - 5 * Math.sin(this.fase), 160];
    }
    if (t > 1.45 && t < 1.95) { pose.cara = "guino"; pose.rc = 0.07 * eInOut(tramo(t, 1.45, 1.6)); }
    // concentración: dedo en la sien y la otra mano en la cadera
    const kC = Math.max(eInOut(tramo(t, 1.85, 2.15)) * (1 - eInOut(tramo(t, 4.45, 4.85))), eInOut(tramo(t, 5.75, 5.95)) * (1 - eInOut(tramo(t, 6.7, 7.0))));
    manoD = mezcla(manoD, [69, 35], kC);
    manoI = mezcla(manoI, [13, 143], kC);
    if (t >= 1.95 && t < 2.78) { pose.cara = "dormido"; dx = azar(-1, 1) * 2.2 * tramo(t, 2.0, 2.78); }
    else if (t >= 4.4 && t < 5.75) pose.cara = "risa";
    else if (t >= 6.4) pose.cara = "sorpresa";
    // retroceso de cada disparo
    let retro = 0;
    for (const z of [...ZAPS, ZAP_LAMP]) if (t > z && t < z + 0.25) retro = Math.max(retro, 1 - (t - z) / 0.25);
    pose.rc += -0.05 * retro;
    if (t > 5.75 && t < 6.6) pose.rc += -0.1 * eInOut(tramo(t, 5.75, 6.0)); // mira hacia la lámpara
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(this.x + dx - retro * 6, PIES + bote, this.ESC);
    return { pose, m };
  }
  ojo(e, i) {
    const o = RIG.ojos[i], r = rot2([o[0] - RIG.cuello[0], o[1] - RIG.cuello[1]], e.pose.rc);
    return aPant(e.m, [RIG.cuello[0] + r[0], RIG.cuello[1] + r[1]]);
  }
  objetivo(i) { return i < 3 ? [LATAS[i] + 3, BARRA - 24 * ESC_LATA * 0.5 - 30] : [LAMP[0], LAMP[1] - 4]; }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.x = this.xAv(t);
    if (t < 1.5) this.fase += dt * 9;
    ZAPS.forEach((z, i) => this.una("lata" + i, t > z + 0.05, () => {
      this.abiertas[i] = t;
      temblar(i === 2 ? 16 : 8, 0.3);
      const x = LATAS[i], y = BARRA - 24 * ESC_LATA - 2;
      for (let k = 0; k < (i === 2 ? 46 : 30); k++) p.nueva(P.ESPUMA, x + azar(-8, 8), y, azar(-160, 160), azar(-620, -260), azar(0.5, 1.0), azar(6, 13));
      for (let k = 0; k < 14; k++) { const a = azar(-Math.PI, 0), v = azar(200, 480); p.nueva(P.CHISPA, x, y + 20, Math.cos(a) * v, Math.sin(a) * v, azar(0.25, 0.5), azar(7, 12)); }
      p.nueva(P.DESTELLO, x, y + 30, 0, 0, 0.3, 120);
    }));
    // las latas abiertas siguen echando espuma un rato
    this.abiertas.forEach((a, i) => {
      if (a > 0 && t - a < 1.4 && Math.random() < 30 * dt) p.nueva(P.ESPUMA, LATAS[i] + azar(-6, 6), BARRA - 24 * ESC_LATA - 4, azar(-50, 50), azar(-260, -120), azar(0.4, 0.7), azar(5, 9));
    });
    // los ojos echan humo después del ¡ZAP!
    if (t > 4.35 && t < 5.6 && Math.random() < 22 * dt) {
      const e = this.estado(), o = this.ojo(e, Math.random() < 0.5 ? 0 : 1);
      p.nueva(P.VAPOR, o[0], o[1] - 6, azar(-25, 25), azar(-110, -60), azar(0.5, 0.9), azar(14, 24));
    }
    // revienta la lámpara
    this.una("lampara", t > ZAP_LAMP + 0.06, () => {
      this.rompe = t; temblar(14, 0.35);
      for (let k = 0; k < 50; k++) { const a = azar(0, 6.283), v = azar(120, 520); this.ch.nueva(P.CHISPA, LAMP[0], LAMP[1], Math.cos(a) * v, Math.sin(a) * v - 120, azar(0.5, 1.4), azar(6, 12)); }
      this.ch.nueva(P.DESTELLO, LAMP[0], LAMP[1], 0, 0, 0.4, 260);
    });
    if (this.rompe > 0 && t - this.rompe < 1.6 && Math.random() < 14 * dt) this.ch.nueva(P.CHISPA, LAMP[0] + azar(-10, 10), LAMP[1] + 4, azar(-40, 40), azar(0, 60), azar(0.6, 1.1), azar(5, 8));
    p.actualizar(dt); this.ch.actualizar(dt);
  }
  luz(t) { // la lámpara: se enciende con el fundido y se apaga al reventar
    if (this.rompe < 0) return 1;
    const s = t - this.rompe;
    return s < 0.12 ? 1.6 : s < 0.3 ? [0.2, 0.9, 0, 0.5, 0][Math.min(4, Math.floor((s - 0.12) / 0.04))] : 0;
  }
  dibujarLampara(g, t, luz) {
    const s = this.rompe > 0 ? t - this.rompe : 0;
    const giro = this.rompe > 0 ? 0.32 * Math.exp(-s * 1.4) * Math.sin(s * 7) : 0;
    // cono de luz sobre la barra
    if (luz > 0) {
      g.save(); g.globalCompositeOperation = "lighter";
      const gr = g.createLinearGradient(0, LAMP[1], 0, BARRA);
      gr.addColorStop(0, `rgba(255,214,140,${0.24 * luz})`); gr.addColorStop(1, `rgba(255,214,140,${0.06 * luz})`);
      g.fillStyle = gr; g.beginPath();
      g.moveTo(LAMP[0] - 40, LAMP[1]); g.lineTo(LAMP[0] + 40, LAMP[1]); g.lineTo(LAMP[0] + 230, BARRA); g.lineTo(LAMP[0] - 230, BARRA); g.closePath(); g.fill();
      g.globalAlpha = 0.5 * Math.min(1, luz); g.drawImage(BLOB2.oroClaro, LAMP[0] - 260, BARRA - 30, 520, 60);
      g.restore();
    }
    g.save(); g.translate(LAMP[0], -10); g.rotate(giro);
    g.strokeStyle = "#3a3a3a"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 62); g.stroke();
    const gp = g.createLinearGradient(-44, 0, 44, 0);
    gp.addColorStop(0, "#0f3a22"); gp.addColorStop(0.45, "#2f8f57"); gp.addColorStop(0.6, "#7fd9a0"); gp.addColorStop(1, "#0c2e1b");
    g.fillStyle = gp; g.beginPath(); g.moveTo(-12, 60); g.lineTo(12, 60); g.lineTo(46, 100); g.lineTo(-46, 100); g.closePath(); g.fill();
    g.fillStyle = "#0a1f13"; g.fillRect(-46, 98, 92, 4);
    if (this.rompe < 0 || s < 0.3) {
      g.fillStyle = luz > 0.4 ? "#fff6d8" : "#6d6a60"; g.beginPath(); g.arc(0, 106, 11, 0, Math.PI); g.fill();
      if (luz > 0) { g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8 * Math.min(1, luz); g.drawImage(BLOB.amarillo, -40, 72, 80, 70); }
    } else { // casquillo roto
      g.fillStyle = "#555"; g.beginPath(); g.moveTo(-8, 101); g.lineTo(-5, 110); g.lineTo(-1, 104); g.lineTo(3, 111); g.lineTo(8, 101); g.closePath(); g.fill();
    }
    g.restore();
  }
  dibujarBarra(g) {
    const x0 = 560, x1 = 1010;
    const gr = g.createLinearGradient(0, BARRA, 0, PIES);
    gr.addColorStop(0, "#4a3020"); gr.addColorStop(1, "#1e130b");
    g.fillStyle = gr; g.fillRect(x0, BARRA + 8, x1 - x0, PIES - BARRA - 8);
    g.strokeStyle = "rgba(0,0,0,.45)"; g.lineWidth = 2;
    for (let x = x0 + 75; x < x1; x += 75) { g.beginPath(); g.moveTo(x, BARRA + 12); g.lineTo(x, PIES - 14); g.stroke(); }
    g.fillStyle = "#140d07"; g.fillRect(x0, PIES - 14, x1 - x0, 14);
    const gt = g.createLinearGradient(0, BARRA - 6, 0, BARRA + 10);
    gt.addColorStop(0, "#d9c3a0"); gt.addColorStop(1, "#8a6a48");
    g.fillStyle = gt; g.fillRect(x0 - 12, BARRA - 4, x1 - x0 + 24, 14);
  }
  dibujarLatas(g, t) {
    LATAS.forEach((x, i) => {
      const a = this.abiertas[i], s = a > 0 ? t - a : -1;
      const salto = s > 0 && s < 0.32 ? Math.sin((s / 0.32) * Math.PI) * 22 : 0;
      const ang = s > 0 && s < 0.6 ? 0.18 * Math.sin(s * 30) * (1 - s / 0.6) : 0;
      const h = 24 * ESC_LATA;
      g.save(); g.translate(x, BARRA - salto); g.rotate(ang);
      // sombra
      g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(0, 1, 26 - salto * 0.4, 5, 0, 0, 6.283); g.fill();
      g.scale(ESC_LATA, ESC_LATA); dibujarLata(g, 0, -12, 0, { abierta: s > 0 });
      g.restore();
      // corona de espuma que rebosa y chorrea
      if (s > 0) {
        const k = eOut(tramo(s, 0, 0.45)), top = BARRA - salto - h - 2;
        g.save(); g.fillStyle = "#fbf7ea";
        const caida = 34 * eOut(tramo(s, 0.2, 1.4));
        rectR(g, x - 19, top, 9, 10 + caida, 4.5); g.fill();
        rectR(g, x + 9, top, 8, 6 + caida * 0.6, 4); g.fill();
        for (let j = 0; j < 5; j++) {
          const bx = x - 18 + j * 9, r = (9 + 3 * Math.sin(t * 9 + j * 2)) * k;
          g.drawImage(SPR.espuma, bx - r, top - r * 0.9 - (j % 2) * 5 * k, r * 2, r * 2);
        }
        g.restore();
      }
    });
  }
  dibujarRayo(g, a, b, k, grueso) {
    g.save(); g.globalCompositeOperation = "lighter"; g.lineCap = "round";
    for (const [w, col] of [[22, `rgba(255,20,10,${0.22 * k})`], [9, `rgba(255,60,40,${0.75 * k})`], [3.2, `rgba(255,240,225,${k})`]]) {
      g.lineWidth = w * grueso; g.strokeStyle = col; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    }
    g.globalAlpha = k; g.drawImage(BLOB.rojo, b[0] - 50, b[1] - 50, 100, 100); g.drawImage(BLOB.blanco, b[0] - 18, b[1] - 18, 36, 36);
    g.restore();
  }
  dibujarOjos(g, e, b, guino) {
    if (b <= 0.01) return;
    g.save(); g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 2; i++) {
      const o = this.ojo(e, i), cierre = i === 1 ? guino : 0;
      const r = (16 + 10 * b) * (1 + 0.08 * Math.sin(this.t * 40 + i));
      g.globalAlpha = b * (1 - cierre);
      g.drawImage(BLOB.rojo, o[0] - r * 1.6, o[1] - r * 1.1, r * 3.2, r * 2.2);
      g.drawImage(BLOB.naranja, o[0] - r * 0.7, o[1] - r * 0.5, r * 1.4, r);
      g.drawImage(BLOB.blanco, o[0] - r * 0.35, o[1] - r * 0.25, r * 0.7, r * 0.5);
    }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), luz = this.luz(t);
    fondo(g, "#000");
    this.dibujarBarra(g);
    this.dibujarLatas(g, t);
    this.dibujarLampara(g, t, luz);
    pintarAvatar(g, e.m, e.pose, t);
    // cejas de enfado (se pone serio)
    const kS = this.serio(t);
    if (kS > 0) conMat(g, e.m, () => {
      g.translate(RIG.cuello[0], RIG.cuello[1]); g.rotate(e.pose.rc); g.translate(-RIG.cuello[0], -RIG.cuello[1]);
      g.strokeStyle = `rgba(48,28,16,${kS})`; g.lineWidth = 4.2; g.lineCap = "round";
      g.beginPath(); g.moveTo(17.5, 26.5); g.lineTo(34, 33); g.moveTo(60.5, 26.5); g.lineTo(44, 33); g.stroke();
    });
    this.p.dibujar(g);
    const b = this.brillo(t);
    this.dibujarOjos(g, e, b, 0);
    // disparos
    [...ZAPS, ZAP_LAMP].forEach((z, i) => {
      const s = t - z;
      if (s < 0 || s > 0.3) return;
      const k = s < 0.22 ? 1 : 1 - (s - 0.22) / 0.08, largo = eOut(tramo(s, 0, 0.06));
      const obj = this.objetivo(i);
      for (let j = 0; j < 2; j++) {
        const o = this.ojo(e, j), fin = mezcla(o, [obj[0] + (j ? 4 : -4), obj[1]], largo);
        this.dibujarRayo(g, o, fin, k, i === 2 ? 1.35 : 1);
      }
    });
    // ¡PSST! en cada lata
    LATAS.forEach((x, i) => {
      const a = this.abiertas[i]; if (a < 0) return;
      const s = t - a; if (s > 1.0) return;
      const k = tramo(s, 0, 0.12);
      g.save(); g.translate(x + (i - 1) * 6, BARRA - 24 * ESC_LATA - 70); g.rotate([-0.14, 0.1, -0.06][i]); g.scale(eBack(k), eBack(k));
      txt(g, "¡PSST!", 0, 0, { tam: 44, peso: 400, fam: FC, color: "#ffffff", borde: "#0a6b2a", bordeAncho: 8, alfa: 1 - tramo(s, 0.75, 1.0), esp: 2 });
      g.restore();
    });
    // ¡ZAP!
    if (t > 3.98 && t < 6.0) {
      const k = tramo(t, 3.98, 4.12), s = lerp(3, 1, eIn(k)) * (1 + 0.03 * Math.sin(t * 20)), a = Math.min(1, k * 4) * (1 - tramo(t, 5.7, 6.0));
      const T = tituloZap();
      g.save(); g.globalAlpha = a; g.translate(560, 120); g.rotate(-0.06); g.scale(s, s); g.drawImage(T, -T.width / 2, -T.height / 2); g.restore();
    }
    // apagón: solo quedan los ojos (y las chispas de la lámpara)
    const osc = this.rompe > 0 ? tramo(t, this.rompe + 0.12, this.rompe + 0.32) : 0;
    if (osc > 0) { g.fillStyle = `rgba(0,0,0,${0.97 * osc})`; g.fillRect(-60, -60, W + 120, H + 120); }
    if (osc > 0) {
      const guino = t > 7.45 && t < 7.75 ? Math.sin(tramo(t, 7.45, 7.75) * Math.PI) : 0;
      this.dibujarOjos(g, e, b * osc, guino);
    }
    this.ch.dibujar(g);
    // fundido de entrada y de salida
    const a = Math.max(1 - tramo(t, 0, 0.4), tramo(t, this.dur - 0.45, this.dur - 0.02));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00030", nombre: "Ojos láser", crear: () => new EscenaLaser() });
})();
