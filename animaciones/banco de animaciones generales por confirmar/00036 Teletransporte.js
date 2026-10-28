"use strict";
/*
 * 00036 · TELETRANSPORTE
 *
 * Animación del banco. Empieza y acaba en negro.
 * Dos plataformas de teletransporte. Señala la otra, la suya se enciende y él chisporrotea (¡BZZZT!): se deshace en
 * cuadraditos que cruzan la pantalla en arco y se recomponen en la otra plataforma… sin cabeza: los cuadraditos de la
 * cabeza se han perdido por arriba. El cuerpo se palpa el cuello (¿?) hasta que la cabeza llega volando y encaja
 * (¡BZZZT!). Se toca la cara, se ríe y se teletransporta hacia arriba en un rayo de luz.
 */
(() => {
const LX = 230, RX = 790, ESC = 1.45;
const OW = 260, OH = 420, OX = 130, OY = 405; // lienzo auxiliar: pies del avatar en (OX, OY)
const C = 10;                                  // lado de cada cuadradito
const T_SALE = 1.95, T_CUERPO = 3.3, T_CABEZA = 5.15, T_SUBE = 6.8;
const CUELLO_Y = OY - (232 - 70) * ESC;        // por encima, cabeza
const cache = cacheTexto();

function sprBzzt() {
  if (cache.has("b")) return cache.get("b");
  const mk = (color, borde, glow) => {
    const c = lienzoNuevo(720, 200), g = c.getContext("2d");
    txt(g, "¡BZZZT!", 360, 150, { tam: 150, peso: 400, fam: FC, color, borde, bordeAncho: borde ? 12 : 0, esp: 8, glow, glowTam: 26 });
    return c;
  };
  const r = { main: mk("#eaffff", "#04364a", "rgba(47,227,232,.9)"), cian: mk("rgba(47,227,232,.9)"), rosa: mk("rgba(255,61,132,.9)") };
  cache.set("b", r);
  return r;
}

class EscenaTele extends Escena {
  constructor() {
    super(8.4);
    this.p = new Parts(300);
    this.celdas = null; this.celdas2 = null;
    this._c = null; this.cong = null; this.cong2 = null;
  }
  lienzo() { if (!this._c) { this._c = lienzoNuevo(OW, OH); this._g = this._c.getContext("2d"); } return this._g; }
  pose(t) {
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let manoD = [70, 158], manoI = [9, 160];
    // señala la otra plataforma
    const kP = eInOut(tramo(t, 0.45, 0.75)) * (1 - eInOut(tramo(t, 1.25, 1.5)));
    manoD = mezcla(manoD, [128, 104], kP);
    if (t > 0.45 && t < 1.3) pose.cara = "guino";
    if (t >= 1.3 && t < T_SALE) { pose.cara = "risa"; manoI = mezcla(manoI, [-10, 120], eInOut(tramo(t, 1.3, 1.5))); manoD = mezcla([70, 158], [88, 120], eInOut(tramo(t, 1.3, 1.5))); }
    if (t >= T_SALE && t < T_CUERPO + 0.1) { manoI = [-10, 120]; manoD = [88, 120]; pose.cara = "sonrisa"; }
    // sin cabeza: se palpa el cuello
    if (t >= T_CUERPO + 0.1 && t < T_CABEZA) {
      pose.cara = "ninguna";
      const k = eInOut(tramo(t, T_CUERPO + 0.1, T_CUERPO + 0.4));
      manoD = mezcla([88, 120], [60 + 8 * Math.sin(t * 9), 56 + 10 * Math.cos(t * 7)], k);
      manoI = mezcla([-10, 120], [18 - 8 * Math.sin(t * 8 + 1), 56 + 10 * Math.cos(t * 6)], k);
      if (t > 4.3) { manoD = mezcla(manoD, [96, 100], eInOut(tramo(t, 4.3, 4.5))); manoI = mezcla(manoI, [-18, 100], eInOut(tramo(t, 4.3, 4.5))); }
    }
    // vuelve la cabeza
    if (t >= T_CABEZA) {
      pose.cara = t < 5.75 ? "sorpresa" : t < 6.45 ? "risa" : "guino";
      const k = eInOut(tramo(t, T_CABEZA, T_CABEZA + 0.25)) * (1 - eInOut(tramo(t, 5.75, 6.0)));
      manoD = mezcla([70, 158], [64, 44], k); manoI = mezcla([9, 160], [14, 44], k);
      if (t > 5.75) { manoD = mezcla(manoD, [90, 74], eBack(tramo(t, 5.85, 6.15))); }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    return pose;
  }
  /** Avatar en el lienzo auxiliar. */
  renderizar(pose, t) {
    const o = this.lienzo();
    o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = "source-over"; o.globalAlpha = 1; o.clearRect(0, 0, OW, OH);
    pintarAvatar(o, matAv(OX, OY, ESC), pose, t);
  }
  /** Trocea lo que hay en el lienzo auxiliar (una sola lectura de píxeles). */
  trocear(semillaN) {
    const cong = lienzoNuevo(OW, OH); cong.getContext("2d").drawImage(this._c, 0, 0);
    const d = this._g.getImageData(0, 0, OW, OH).data, r = semilla(semillaN), cel = [];
    for (let y = 0; y < OH; y += C) for (let x = 0; x < OW; x += C) {
      let a = 0;
      for (let yy = y; yy < Math.min(OH, y + C); yy += 3) for (let xx = x; xx < Math.min(OW, x + C); xx += 3) a += d[(yy * OW + xx) * 4 + 3];
      if (a > 600) cel.push({ x, y, cab: y + C / 2 < CUELLO_Y, r1: r(), r2: r(), r3: r() });
    }
    return { cong, cel };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    if (t > T_CUERPO && t < T_CABEZA && Math.random() < 12 * dt) p.nueva(P.ELECTRICA, RX + azar(-20, 20), PIES - (232 - 62) * ESC, azar(-80, 80), azar(-120, -20), azar(0.2, 0.4), azar(8, 14));
    // chisporroteo antes de irse
    if (t > 1.3 && t < T_SALE && Math.random() < 30 * dt) p.nueva(P.ELECTRICA, LX + azar(-60, 60), PIES - azar(20, 340), azar(-60, 60), azar(-60, 60), azar(0.15, 0.35), azar(10, 20));
    this.una("sale", t >= T_SALE, () => {
      this.renderizar(this.pose(T_SALE), T_SALE);
      this.celdas = this.trocear(36);
      temblar(14, 0.35);
      p.nueva(P.DESTELLO, LX, PIES - 180, 0, 0, 0.35, 320);
    });
    this.una("llega", t >= T_CUERPO, () => { temblar(6, 0.2); p.nueva(P.DESTELLO, RX, PIES - 120, 0, 0, 0.3, 220); });
    this.una("cabeza", t >= T_CABEZA, () => {
      temblar(16, 0.35);
      const q = [RX, PIES - OY + CUELLO_Y - 60];
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.35, 200);
      for (let i = 0; i < 24; i++) { const a = azar(0, 6.283), v = azar(120, 360); p.nueva(P.ELECTRICA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.25, 0.5), azar(10, 18)); }
    });
    this.una("sube", t >= T_SUBE, () => {
      this.renderizar(this.pose(T_SUBE), T_SUBE);
      this.celdas2 = this.trocear(77);
      temblar(10, 0.3);
      p.nueva(P.DESTELLO, RX, PIES - 180, 0, 0, 0.35, 320);
    });
    p.actualizar(dt);
  }
  dibujarPlataforma(g, x, on, t) {
    // base metálica
    const gr = g.createLinearGradient(0, PIES - 20, 0, PIES + 18);
    gr.addColorStop(0, "#5b6470"); gr.addColorStop(1, "#1a1e24");
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, PIES + 2, 104, 22, 0, 0, 6.283); g.fill();
    g.fillStyle = "#2a3038"; g.beginPath(); g.ellipse(x, PIES - 4, 96, 17, 0, 0, 6.283); g.fill();
    g.save(); g.globalCompositeOperation = "lighter";
    g.strokeStyle = `rgba(47,227,232,${0.35 + 0.6 * on})`; g.lineWidth = 3.5; g.beginPath(); g.ellipse(x, PIES - 4, 84, 13, 0, 0, 6.283); g.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * 6.283 + t * 1.5;
      g.fillStyle = `rgba(150,250,255,${0.3 + 0.7 * on * (0.5 + 0.5 * Math.sin(t * 12 + i))})`;
      g.beginPath(); g.arc(x + Math.cos(a) * 84, PIES - 4 + Math.sin(a) * 13, 3, 0, 6.283); g.fill();
    }
    if (on > 0.01) {
      const gc = g.createLinearGradient(x - 90, 0, x + 90, 0);
      gc.addColorStop(0, "rgba(47,227,232,0)"); gc.addColorStop(0.5, `rgba(170,250,255,${0.32 * on})`); gc.addColorStop(1, "rgba(47,227,232,0)");
      g.fillStyle = gc; g.fillRect(x - 90, -20, 180, PIES - 4 + 20);
      g.globalAlpha = 0.6 * on; g.drawImage(BLOB2.cian, x - 120, PIES - 40, 240, 70);
    }
    g.restore();
  }
  dibujarCeldas(g, t) {
    const { cong, cel } = this.celdas;
    const ox = LX - OX, oy = PIES - OY, dx = RX - LX;
    g.save();
    const vuelan = [];
    for (const c of cel) {
      let x, y, vuela = false;
      if (!c.cab) {
        const ts = T_SALE + 0.05 + (c.y / OH) * 0.4 + c.r1 * 0.12, d = 0.55 + c.r2 * 0.2;
        const k = tramo(t, ts, ts + d), e = eInOut(k);
        if (t >= T_CUERPO) continue; // ya es el avatar de verdad
        x = ox + c.x + dx * e; y = oy + c.y - (150 + c.r3 * 90) * Math.sin(Math.PI * e);
        if (k <= 0) { x += azar(-1.5, 1.5); }
        vuela = k > 0 && k < 1;
      } else {
        // la cabeza se pierde por arriba y vuelve tarde
        const ts = T_SALE + 0.03 + c.r1 * 0.1, k1 = tramo(t, ts, ts + 0.7);
        const perdida = [440 + c.r2 * 260, -80 - c.r3 * 60];
        const ts2 = 4.55 + c.r1 * 0.35, k2 = tramo(t, ts2, ts2 + 0.42);
        if (t >= T_CABEZA) continue;
        if (k2 > 0) {
          const e = eOut(k2);
          x = lerp(perdida[0], ox + dx + c.x, e); y = lerp(perdida[1], oy + c.y, e);
          vuela = k2 < 1;
        } else {
          const e = eIn(k1);
          x = lerp(ox + c.x, perdida[0], e); y = lerp(oy + c.y, perdida[1], e) - 120 * Math.sin(Math.PI * e);
          if (k1 >= 1) continue;
          vuela = k1 > 0;
        }
      }
      g.drawImage(cong, c.x, c.y, C, C, x, y, C, C);
      if (vuela) vuelan.push(x, y);
    }
    // brillo cian de los que vuelan
    g.globalCompositeOperation = "lighter"; g.fillStyle = "rgba(47,227,232,.45)";
    for (let i = 0; i < vuelan.length; i += 2) g.fillRect(vuelan[i] - 1, vuelan[i + 1] - 1, C + 2, C + 2);
    g.restore();
  }
  dibujarSubida(g, t) {
    const { cong, cel } = this.celdas2;
    const ox = RX - OX, oy = PIES - OY;
    g.save();
    const vuelan = [];
    for (const c of cel) {
      const ts = T_SUBE + 0.05 + (1 - c.y / OH) * 0.35 + c.r1 * 0.1, s = Math.max(0, t - ts);
      const x = ox + c.x + (s > 0 ? Math.sin(s * 10 + c.r2 * 6) * 6 : azar(-1, 1)), y = oy + c.y - 1600 * s * s;
      if (y < -20) continue;
      g.drawImage(cong, c.x, c.y, C, C, x, y, C, C);
      if (s > 0) vuelan.push(x, y);
    }
    g.globalCompositeOperation = "lighter"; g.fillStyle = "rgba(47,227,232,.5)";
    for (let i = 0; i < vuelan.length; i += 2) g.fillRect(vuelan[i] - 1, vuelan[i + 1] - 1, C + 2, C + 2);
    g.restore();
  }
  /** Avatar con chisporroteo (franjas desplazadas y sombra cian). */
  avatarGlitch(g, x, k, t) {
    const o = this._c, ox = x - OX, oy = PIES - OY;
    if (k <= 0) { g.drawImage(o, ox, oy); return; }
    for (let y = 0; y < OH; y += 30) {
      const d = Math.random() < 0.35 * k ? azar(-14, 14) * k : 0;
      g.drawImage(o, 0, y, OW, 30, ox + d, oy + y, OW, 30);
    }
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35 * k;
    g.drawImage(o, ox + 5, oy); g.globalAlpha = 0.25 * k * (0.5 + 0.5 * Math.sin(t * 40)); g.fillStyle = "#2fe3e8";
    for (let y = oy; y < oy + OH; y += 6) g.fillRect(ox + 60, y, OW - 120, 2);
    g.restore();
  }
  dibujar(g) {
    const t = this.t;
    fondo(g, "#000");
    const onL = Math.max(tramo(t, 1.3, 1.6) * (1 - tramo(t, 2.4, 2.9)), 0);
    const onR = tramo(t, 2.2, 2.6) * (1 - tramo(t, 3.4, 3.9)) + tramo(t, 6.6, 6.85) * (1 - tramo(t, 7.4, 7.9));
    const luz = Math.min(1, 1 - tramo(t, 7.7, 8.2));
    g.save(); g.globalAlpha = luz;
    this.dibujarPlataforma(g, LX, onL, t);
    this.dibujarPlataforma(g, RX, Math.min(1, onR + (t > 4.5 && t < 5.4 ? 0.5 : 0)), t);
    g.restore();
    // el avatar de verdad
    if (t < T_SALE) {
      this.renderizar(this.pose(t), t);
      this.avatarGlitch(g, LX, tramo(t, 1.35, T_SALE) * 0.9, t);
    } else if (t >= T_CUERPO && t < T_SUBE) {
      this.renderizar(this.pose(t), t);
      this.avatarGlitch(g, RX, t < T_CUERPO + 0.25 ? 0.8 * (1 - tramo(t, T_CUERPO, T_CUERPO + 0.25)) : t > T_CABEZA && t < T_CABEZA + 0.3 ? 0.9 * (1 - tramo(t, T_CABEZA, T_CABEZA + 0.3)) : t > 6.5 ? tramo(t, 6.5, T_SUBE) * 0.8 : 0, t);
    }
    if (this.celdas && t < T_CABEZA) this.dibujarCeldas(g, t);
    // chisporroteo en el cuello mientras falta la cabeza
    if (t >= T_CUERPO && t < T_CABEZA) {
      const y = PIES - (232 - 62) * ESC;
      g.save(); g.globalCompositeOperation = "lighter";
      g.globalAlpha = 0.7 + 0.3 * Math.sin(t * 30); g.drawImage(BLOB2.cian, RX - 48, y - 30, 96, 50);
      g.fillStyle = "rgba(150,250,255,.85)";
      for (let i = 0; i < 9; i++) g.fillRect(RX + azar(-26, 18), y + azar(-22, 4), C * azar(0.5, 1), C * azar(0.5, 1));
      g.restore();
    }
    if (this.celdas2) this.dibujarSubida(g, t);
    this.p.dibujar(g);
    // ¿? sobre el cuello
    if (t > T_CUERPO + 0.35 && t < 4.55) {
      const k = tramo(t, T_CUERPO + 0.35, T_CUERPO + 0.5);
      g.save(); g.translate(RX + 6, PIES - OY + CUELLO_Y - 70 + 6 * Math.sin(t * 5)); g.scale(eBack(k), eBack(k));
      txt(g, "¿?", 0, 0, { tam: 76, peso: 400, fam: FC, color: "#ffffff", borde: "#04364a", bordeAncho: 8, alfa: 1 - tramo(t, 4.35, 4.55), esp: 4 });
      g.restore();
    }
    // ¡BZZZT!
    for (const [t0, t1] of [[T_SALE - 0.03, 2.95], [T_CABEZA - 0.02, 6.4]]) {
      if (t < t0 || t > t1) continue;
      const k = tramo(t, t0, t0 + 0.12), a = Math.min(1, k * 4) * (1 - tramo(t, t1 - 0.3, t1));
      const S = sprBzzt(), s = lerp(2.2, 1, eIn(k)), j = (1 - tramo(t, t0, t0 + 0.6)) * 8 + 1.5;
      g.save(); g.translate(W / 2 + azar(-2, 2), 112 + azar(-2, 2)); g.rotate(-0.04); g.scale(s, s); g.globalAlpha = a;
      g.globalCompositeOperation = "lighter";
      g.drawImage(S.rosa, -S.rosa.width / 2 - j, -S.rosa.height / 2); g.drawImage(S.cian, -S.cian.width / 2 + j, -S.cian.height / 2 + 1);
      g.globalCompositeOperation = "source-over";
      g.drawImage(S.main, -S.main.width / 2, -S.main.height / 2);
      g.restore();
    }
    const a = Math.max(1 - tramo(t, 0, 0.4), tramo(t, this.dur - 0.3, this.dur - 0.02));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00036", nombre: "Teletransporte", crear: () => new EscenaTele() });
})();
