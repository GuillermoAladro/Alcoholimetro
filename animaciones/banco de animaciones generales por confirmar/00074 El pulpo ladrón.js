"use strict";
/*
 * 00074 · EL PULPO LADRÓN
 *
 * Animación del banco. Empieza y acaba en negro.
 * Levanta la jarra para brindar junto a su tabla de pulpo a la gallega… y un tentáculo cobra vida, sale del plato y se
 * enrosca en la jarra. Forcejean de un lado a otro (la cerveza salpica) hasta que grita ¡SUELTA!: el tentáculo la
 * suelta de golpe y la cerveza le cae encima. Acaba con la cabeza llena de espuma y el tentáculo diciéndole adiós.
 */
(() => {
const cacheT = cacheTexto();
const BASE = [705, 440];   // de dónde sale el tentáculo (el montón del plato)

/** El título, pintado una vez (con su brillo) en un lienzo; se rehace si cambian las fuentes. */
function titulo() {
  if (cacheT.has(1)) return cacheT.get(1);
  const c = lienzoNuevo(720, 200), x = c.getContext("2d");
  txt(x, "¡SUELTA!", 360, 158, { tam: 160, peso: 400, fam: FC, color: "#ffffff", borde: "#b0102a", bordeAncho: 16, esp: 6, max: 680 });
  cacheT.set(1, c);
  return c;
}
class EscenaPulpo extends Escena {
  constructor() {
    super(9.2);
    titulo(); // se pinta ya, no en el momento del remate
    this.ESC = 1.55; this.X = 400;
    this.p = new Parts(320);
    this.piezas = [];
    const r = semilla(7);
    for (let i = 0; i < 13; i++) this.piezas.push({ x: BASE[0] + (r() - 0.5) * 160, y: 444 - r() * 16 + (r() - 0.5) * 8, s: 14 + r() * 6, a: r() * 6 });
    this.piezas.sort((a, b) => a.y - b.y);
    this.espuma = 0;
  }
  tiron(t) {
    // 0 = la jarra en su lado, 1 = la tiene el pulpo
    if (t < 2.35) return 0;
    if (t < 4.95) return clamp(0.5 + 0.42 * Math.sin((t - 2.35) * 6.5 - 1.2) + 0.12 * Math.sin((t - 2.35) * 15), 0, 1);
    return 0;
  }
  estado(t = this.t) {
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [64, 120], manoI = [9, 160], giro = 0, dx = 0, inc = 0;
    // brinda: levanta la jarra
    const kBrinda = eInOut(tramo(t, 0.55, 1.0));
    manoD = mezcla(manoD, [100, 76], kBrinda);
    inc = -0.15 * kBrinda;
    if (t > 0.7 && t < 2.1) pose.cara = "guino";
    // ¡algo le tira de la jarra!
    if (t >= 2.1 && t < 2.35) { pose.cara = "sorpresa"; manoD = mezcla([100, 76], [112, 84], eOut(tramo(t, 2.1, 2.3))); }
    const ti = this.tiron(t);
    if (t >= 2.35 && t < 4.95) {
      pose.brazoIDelante = true;
      manoD = mezcla([90, 104], [124, 96], ti);
      manoI = mezcla([62, 112], [80, 104], ti);
      giro = lerp(-0.2, 0.09, ti); dx = lerp(-12, 26, ti);
      inc = lerp(-0.1, 0.25, ti);
      pose.cara = t < 4.3 ? (Math.sin(t * 5) > -0.3 ? "sorpresa" : "dormido") : "risa";
      pose.rc = lerp(-0.12, 0.08, ti);
      const a = andar(t * 10, 0.5); pose.piernaI = [a.piernaI[0], -0.12 + a.piernaI[1]]; pose.piernaD = [a.piernaD[0], 0.12 + a.piernaD[1]];
    }
    // lo suelta: la jarra le vuelve a la cara y se tambalea
    if (t >= 4.95) {
      const k = tramo(t, 4.95, 5.12), kv = eInOut(tramo(t, 5.3, 6.0));
      manoD = mezcla(mezcla([110, 98], [62, 70], eOut(k)), [70, 120], kv);
      inc = lerp(-1.3 * eOut(k), 0, kv);
      giro = -0.32 * Math.sin(Math.PI * tramo(t, 4.95, 5.9)) * (1 - tramo(t, 5.9, 6.3));
      dx = -40 * eOut(tramo(t, 4.95, 5.4));
      pose.cara = t < 5.6 ? "sorpresa" : t < 7.0 ? "borracho" : t < 7.5 ? "guino" : "risa";
      manoI = [9, 160];
      if (t > 5.1 && t < 5.6) { pose.piernaI = [-6, -0.2]; pose.piernaD = [0, 0.1]; }
      if (t > 6.9 && t < 7.5) pose.rc = 0.06 * Math.sin(t * 20);
    }
    const nivel = t < 2.35 ? 1 : t < 4.95 ? 1 - 0.5 * tramo(t, 2.35, 4.95) : 0.5 * (1 - tramo(t, 4.95, 5.15));
    pose.jarra = { inc, nivel };
    pose.manoD = manoD; pose.manoI = manoI;
    const m = matAv(this.X + dx, PIES, this.ESC, giro);
    return { pose, m, ti };
  }
  /** Punta del tentáculo: sale del plato, se acerca a escondidas y se agarra a la jarra. */
  puntaT(t, jarra) {
    const kSale = eInOut(tramo(t, 1.0, 1.75)), kVa = eInOut(tramo(t, 1.7, 2.12));
    const arriba = [BASE[0] + 30 + 20 * Math.sin(t * 6), 300 + 12 * Math.sin(t * 4)];
    let p = mezcla(BASE, arriba, kSale);
    if (t < 4.95) return mezcla(p, jarra, kVa);
    // después de soltar: se sacude, dice adiós y se esconde
    const kVuelve = eOut(tramo(t, 4.95, 5.3)), kBaja = eInOut(tramo(t, 7.0, 7.7));
    p = mezcla([jarra[0], jarra[1]], [BASE[0] - 30, 270], kVuelve);
    p[0] += Math.sin(t * 9) * 22 * (t > 5.6 ? 1 : 0);
    return mezcla(p, [BASE[0], BASE[1] + 30], kBaja);
  }
  dibujarTentaculo(g, t, P3) {
    const P0 = BASE, P1 = [BASE[0] + 10, BASE[1] - 170];
    const P2 = [P3[0] + 110, P3[1] - 40];
    const N = 26, izq = [], der = [], ventosas = [];
    let prev = null;
    for (let i = 0; i <= N; i++) {
      const u = i / N, v = 1 - u;
      let x = v * v * v * P0[0] + 3 * v * v * u * P1[0] + 3 * v * u * u * P2[0] + u * u * u * P3[0];
      let y = v * v * v * P0[1] + 3 * v * v * u * P1[1] + 3 * v * u * u * P2[1] + u * u * u * P3[1];
      const ond = Math.sin(u * 9 - t * 7) * 9 * u * (1 - u) * 2;
      const q = prev || [x, y + 1];
      let nx = -(y - q[1]), ny = x - q[0];
      const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
      if (i === 0) { nx = 1; ny = 0; }
      x += nx * ond; y += ny * ond;
      const w = lerp(19, 3.5, Math.pow(u, 0.8));
      izq.push([x + nx * w, y + ny * w]); der.push([x - nx * w, y - ny * w]);
      if (i > 1 && i < N - 1 && i % 2 === 0) ventosas.push([x - nx * w * 0.55, y - ny * w * 0.55, w * 0.42]);
      prev = [x, y];
    }
    g.save();
    g.beginPath();
    izq.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
    for (let i = der.length - 1; i >= 0; i--) g.lineTo(der[i][0], der[i][1]);
    g.closePath();
    const gr = g.createLinearGradient(P0[0], P0[1], P3[0], P3[1]);
    gr.addColorStop(0, "#7c1f3c"); gr.addColorStop(0.5, "#a83a5c"); gr.addColorStop(1, "#c85c7a");
    g.fillStyle = gr; g.fill();
    g.strokeStyle = "#4a0f22"; g.lineWidth = 2.5; g.stroke();
    // brillo y pimentón
    g.strokeStyle = "rgba(255,210,225,.35)"; g.lineWidth = 3;
    g.beginPath(); izq.forEach((p, i) => { const q = mezcla(p, der[i], 0.25); if (i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.stroke();
    g.fillStyle = "#d8301a";
    for (let i = 2; i < izq.length - 2; i += 2) { const q = mezcla(izq[i], der[i], 0.2 + (i % 3) * 0.1); g.beginPath(); g.arc(q[0], q[1], 1.8, 0, 6.283); g.fill(); }
    for (const [x, y, r] of ventosas) {
      g.fillStyle = "#f6cfd8"; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
      g.fillStyle = "#d58ea0"; g.beginPath(); g.arc(x, y, r * 0.45, 0, 6.283); g.fill();
    }
    g.restore();
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    // salpica cerveza en el forcejeo
    if (t > 2.4 && t < 4.95 && Math.random() < 14 * dt) {
      const j = this.jarraP || [500, 320];
      p.nueva(P.ESPUMA, j[0] + 20, j[1] - 26, azar(-120, 120), azar(-260, -90), azar(0.4, 0.7), azar(4, 8));
      p.nueva(P.GOTA, j[0] + 20, j[1] - 20, azar(-160, 160), azar(-300, -100), 0.9, azar(3, 5));
    }
    this.una("agarra", t > 2.12, () => temblar(6, 0.2));
    this.una("grito", t > 4.3, () => temblar(16, 0.5));
    this.una("suelta", t > 4.95, () => {
      temblar(22, 0.5);
      this.espuma = 1;
      const q = aPant(this.estado(5.1).m, [39, 30]);
      for (let i = 0; i < 70; i++) { const a = azar(-Math.PI, 0), v = azar(150, 650); p.nueva(P.ESPUMA, q[0] + azar(-30, 30), q[1] + azar(-20, 20), Math.cos(a) * v, Math.sin(a) * v, azar(0.5, 1.1), azar(6, 14)); }
      for (let i = 0; i < 40; i++) { const a = azar(-Math.PI, 0), v = azar(200, 700); p.nueva(P.GOTA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, 1.2, azar(3, 6)); }
    });
    // goterones de espuma de la cabeza
    if (t > 5.3 && t < 8.2 && Math.random() < 5 * dt) {
      const q = aPant(e.m, [39 + azar(-28, 28), 20]);
      p.nueva(P.GOTA, q[0], q[1], 0, 20, 0.9, azar(2.5, 4));
    }
    this.una("adios", t > 7.65, () => { for (let i = 0; i < 10; i++) p.nueva(P.ESPUMA, BASE[0] + azar(-20, 20), BASE[1] - 4, azar(-60, 60), azar(-160, -60), azar(0.4, 0.7), azar(4, 7)); });
    p.actualizar(dt);
  }
  plato(g, delante) {
    if (!delante) {
      // mesa
      const top = 462;
      const gt = g.createLinearGradient(0, top, 0, top + 18);
      gt.addColorStop(0, "#a8743f"); gt.addColorStop(1, "#5b3518");
      g.fillStyle = gt; g.fillRect(540, top, 340, 16);
      g.fillStyle = "#2a190c"; g.fillRect(556, top + 16, 14, PIES - top - 16); g.fillRect(850, top + 16, 14, PIES - top - 16);
      // tabla de madera
      g.fillStyle = "#3d230f"; g.beginPath(); g.ellipse(BASE[0], 456, 122, 22, 0, 0, 6.283); g.fill();
      const gm = g.createLinearGradient(0, 430, 0, 460);
      gm.addColorStop(0, "#a8703c"); gm.addColorStop(1, "#6a3e1a");
      g.fillStyle = gm; g.beginPath(); g.ellipse(BASE[0], 450, 122, 22, 0, 0, 6.283); g.fill();
      g.strokeStyle = "rgba(90,50,20,.35)"; g.lineWidth = 1.5;
      for (let i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(BASE[0], 450, 122 - Math.abs(i) * 8, 22 - Math.abs(i) * 4, 0, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
      // cachelos
      g.fillStyle = "#e9cf86";
      for (const [x, y] of [[-78, 4], [70, 5], [92, -2]]) { g.beginPath(); g.ellipse(BASE[0] + x, 448 + y, 16, 6, 0, 0, 6.283); g.fill(); }
      return;
    }
    // rodajas de pulpo con pimentón (por delante de la base del tentáculo)
    for (const q of this.piezas) {
      g.save(); g.translate(q.x, q.y); g.rotate(q.a * 0.2 - 0.6);
      g.fillStyle = "#6e1840"; g.beginPath(); g.ellipse(0, 0, q.s, q.s * 0.7, 0, 0, 6.283); g.fill();
      g.fillStyle = "#9c2c5a"; g.beginPath(); g.ellipse(0, -1, q.s * 0.9, q.s * 0.6, 0, 0, 6.283); g.fill();
      g.fillStyle = "#f4e6e6"; g.beginPath(); g.ellipse(-1, -1, q.s * 0.5, q.s * 0.34, 0, 0, 6.283); g.fill();
      g.fillStyle = "#e8b3c2"; g.beginPath(); g.arc(q.s * 0.62, q.s * 0.15, q.s * 0.2, 0, 6.283); g.fill();
      g.fillStyle = "#d8301a"; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(((k * 7) % 11) - 5, ((k * 5) % 7) - 3, 1.4, 0, 6.283); g.fill(); }
      g.restore();
    }
    g.fillStyle = "rgba(255,240,170,.35)"; g.beginPath(); g.ellipse(BASE[0] - 10, 438, 60, 6, 0, 0, 6.283); g.fill();
    g.strokeStyle = "#e9cf98"; g.lineWidth = 2.5;
    for (const [x, y, a] of [[-50, 440, -0.5], [42, 438, 0.4]]) { g.beginPath(); g.moveTo(BASE[0] + x, y); g.lineTo(BASE[0] + x + Math.sin(a) * 34, y - Math.cos(a) * 34); g.stroke(); }
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    foco(g, 560, 560, PIES, 330, 0.7);
    this.plato(g, false);
    // la jarra en pantalla: la mano + el centro del cristal
    const avanceJ = (pose) => {
      const mano = pose._manoD || pose.manoD, inc = pose.jarra.inc;
      const c = rot2([17, 0], inc);
      return aPant(e.m, [mano[0] + c[0], mano[1] + c[1]]);
    };
    pintarAvatar(g, e.m, e.pose, t);
    const J = avanceJ(e.pose); this.jarraP = J;
    // el tentáculo (por detrás del montón de pulpo y por delante del avatar)
    if (t > 0.98 && t < 7.75) {
      const P3 = this.puntaT(t, [J[0] + 10, J[1] - 6]);
      this.dibujarTentaculo(g, t, P3);
      // enroscado en la jarra
      if (t > 2.05 && t < 4.95) {
        g.save(); g.translate(J[0], J[1]); g.rotate(e.pose.jarra.inc);
        g.strokeStyle = "#a83a5c"; g.lineWidth = 11; g.lineCap = "round";
        for (const yy of [-8, 9]) { g.beginPath(); g.ellipse(0, yy, 27, 7, 0, -0.2, Math.PI + 0.2); g.stroke(); }
        g.fillStyle = "#f6cfd8"; for (const xx of [-16, -4, 8, 20]) { g.beginPath(); g.arc(xx, 15, 3, 0, 6.283); g.fill(); g.beginPath(); g.arc(xx, -2, 3, 0, 6.283); g.fill(); }
        g.restore();
      }
    }
    this.plato(g, true);
    // la cabeza llena de espuma
    if (this.espuma > 0) {
      const k = eBack(tramo(t, 5.0, 5.25)) * (1 - tramo(t, 8.4, 8.9));
      conMat(g, e.m, () => {
        g.translate(RIG.cuello[0], RIG.cuello[1]); g.rotate(e.pose.rc); g.translate(-RIG.cuello[0], -RIG.cuello[1]);
        const bol = [[39, -2, 15], [24, 2, 12], [54, 2, 12], [12, 10, 9], [66, 10, 9], [32, -10, 10], [48, -9, 10], [39, 10, 10]];
        for (const [x, y, r] of bol) { const rr = r * k; if (rr > 0.5) g.drawImage(SPR.espuma, x - rr, y - rr, rr * 2, rr * 2); }
        g.fillStyle = "#fbf6e6";
        for (const [x, l] of [[16, 16], [30, 9], [57, 20], [64, 11]]) { const ll = l * k * (0.7 + 0.3 * Math.sin(t * 2 + x)); g.beginPath(); g.ellipse(x, 14 + ll / 2, 2.6, ll / 2 + 2, 0, 0, 6.283); g.fill(); }
      });
    }
    this.p.dibujar(g);
    // ¡SUELTA!
    if (t > 4.3 && t < 5.9) {
      const c = titulo(), k = tramo(t, 4.3, 4.45), s = lerp(0.2, 1, eBack(k));
      const sac = 7 * (1 - tramo(t, 4.9, 5.3));
      g.save(); g.globalAlpha = 1 - tramo(t, 5.5, 5.9); g.translate(380 + azar(-sac, sac), 120 + azar(-sac, sac)); g.rotate(-0.06); g.scale(s, s);
      g.drawImage(c, -c.width / 2, -c.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0, 0.45), tramo(t, 8.6, this.dur - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00074", nombre: "El pulpo ladrón", crear: () => new EscenaPulpo() });
})();
