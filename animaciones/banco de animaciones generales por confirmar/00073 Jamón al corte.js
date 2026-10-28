"use strict";
/*
 * 00073 · JAMÓN AL CORTE
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se abre el telón: él, cuchillo jamonero en mano, junto a un jamón en su jamonero. Corta lonchas finísimas que salen
 * volando como hojas de papel y se colocan en abanico en un plato. La última la caza al vuelo, la mira al trasluz y
 * se la come con cara de gloria: luz dorada, aureola y ¡QUÉ FINURA! Se cierra el telón.
 */
(() => {
const cacheT = cacheTexto();
const PLATO = [250, 452];
const CORTE = [604, 392];

/** Loncha de jamón (centrada, tamaño de pantalla: largo × ancho). a = transparencia. */
function loncha(g, x, y, ang, largo, ancho, flip, a = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(1, flip); g.globalAlpha *= a;
  const L = largo / 2, A = ancho / 2;
  g.beginPath();
  g.moveTo(-L, 0); g.bezierCurveTo(-L * 0.6, -A * 1.3, L * 0.5, -A * 1.2, L, -A * 0.1);
  g.bezierCurveTo(L * 0.6, A * 1.1, -L * 0.5, A * 1.2, -L, 0); g.closePath();
  const gr = g.createLinearGradient(0, -A, 0, A);
  gr.addColorStop(0, "#f6e6cf"); gr.addColorStop(0.2, "#f2d2bf"); gr.addColorStop(0.32, "#c8283e"); gr.addColorStop(0.8, "#a51a32"); gr.addColorStop(1, "#7e1024");
  g.fillStyle = gr; g.fill();
  g.strokeStyle = "rgba(255,240,230,.75)"; g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(-L * 0.6, A * 0.2); g.quadraticCurveTo(0, -A * 0.1, L * 0.5, A * 0.25); g.stroke();
  g.beginPath(); g.moveTo(-L * 0.3, A * 0.55); g.quadraticCurveTo(L * 0.1, A * 0.35, L * 0.4, A * 0.6); g.stroke();
  g.fillStyle = "rgba(255,255,255,.28)"; g.beginPath(); g.ellipse(-L * 0.2, -A * 0.25, L * 0.35, A * 0.12, -0.1, 0, 6.283); g.fill();
  g.restore();
}
/** Cuchillo jamonero en unidades de avatar; la mano en (0, 0), la hoja hacia la derecha. */
function cuchillo(g, x, y, ang, brilla) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.fillStyle = "#1a1a1c"; rectR(g, -14, -2.6, 16, 5.2, 2.2); g.fill();
  g.fillStyle = "#c8ccd0"; for (const rx of [-10, -5]) { g.beginPath(); g.arc(rx, 0, 0.9, 0, 6.283); g.fill(); }
  g.fillStyle = "#8d949b"; g.fillRect(1.5, -2.8, 2.2, 5.6);
  const gr = g.createLinearGradient(0, -2.4, 0, 2.4);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.45, "#cfd6dd"); gr.addColorStop(1, "#7d8790");
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(3.6, -2.2); g.lineTo(70, -1.6); g.quadraticCurveTo(74, 0, 70, 1.8); g.lineTo(3.6, 2.4); g.closePath(); g.fill();
  if (brilla > 0) {
    const bx = lerp(6, 70, brilla);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = Math.sin(brilla * Math.PI);
    g.drawImage(BLOB.blanco, bx - 9, -9, 18, 18); g.restore();
  }
  g.restore();
}

/** El título, pintado una vez (con su brillo) en un lienzo; se rehace si cambian las fuentes. */
function titulo() {
  if (cacheT.has(1)) return cacheT.get(1);
  const c = lienzoNuevo(860, 170), x = c.getContext("2d");
  const gr = x.createLinearGradient(0, 40, 0, 140);
  gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#c98a00");
  txt(x, "¡QUÉ FINURA!", 430, 128, { tam: 118, peso: 900, fam: FD, color: gr, borde: "#3a2400", bordeAncho: 10, esp: 6, glow: "rgba(255,200,60,.8)", glowTam: 26, max: 820 });
  txt(x, "¡QUÉ FINURA!", 430, 128, { tam: 118, peso: 900, fam: FD, color: gr, esp: 6, max: 820 });
  cacheT.set(1, c);
  return c;
}
class EscenaJamon extends Escena {
  constructor() {
    super(9.9);
    titulo(); // se pinta ya, no en el momento del remate
    this.ESC = 1.5; this.X = 470;
    this.p = new Parts(260);
    this.cortes = [1.75, 2.35, 2.9, 3.4, 3.85, 4.3];
    this.vuelan = [];
    this.cazada = 4.9; // la última loncha sale y la caza
  }
  telon() { return eInOut(tramo(this.t, 0.4, 1.25)) * (1 - eInOut(tramo(this.t, 8.75, 9.45))); }
  estado(t = this.t) {
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let manoD = [72, 150], manoI = [9, 160], angC = -0.15, brillaC = 0, sy = 1;
    // enseña el cuchillo: ¡ting!
    const kAlza = eInOut(tramo(t, 1.0, 1.25)) * (1 - eInOut(tramo(t, 1.45, 1.65)));
    manoD = mezcla(manoD, [74, 70], kAlza); angC = lerp(angC, -0.9, kAlza);
    if (t > 1.1 && t < 1.45) { brillaC = tramo(t, 1.12, 1.42); pose.cara = "guino"; }
    // corta: serrucho adelante y atrás
    if (t >= 1.55 && t < 4.75) {
      const k = eInOut(tramo(t, 1.55, 1.7));
      const sierra = Math.sin((t - 1.55) * 15);
      manoD = mezcla(manoD, [91 + 9 * sierra, 108 - 1.5 * Math.abs(sierra)], k); angC = lerp(angC, 0.06, k);
      pose.rc = 0.07 + 0.02 * sierra; pose.cara = t < 3.4 ? "sonrisa" : "guino";
    }
    if (t >= 4.75) { const k = eInOut(tramo(t, 4.75, 5.0)); manoD = mezcla([91, 108], [72, 150], k); angC = lerp(0.06, -0.15, k); }
    // caza la última loncha
    let conLoncha = false, aTras = 0;
    if (t >= 4.85 && t < 6.25) {
      const kSube = eOut(tramo(t, 4.85, 5.15)), kMira = eInOut(tramo(t, 5.35, 5.6)), kBoca = eInOut(tramo(t, 5.9, 6.2));
      manoI = mezcla(mezcla(mezcla(manoI, [-6, 24], kSube), [22, 30], kMira), [33, 40], kBoca);
      conLoncha = t > 5.12 && t < 6.15;
      pose.cara = t < 5.4 ? "sorpresa" : "guino";
      pose.rc = -0.12 * kMira - 0.15 * kBoca;
      aTras = kMira * (1 - kBoca);
    }
    // gloria
    if (t >= 6.2) {
      const k = eInOut(tramo(t, 6.2, 6.6));
      pose.cara = t < 6.55 ? "risa" : "dormido";
      manoI = mezcla([33, 40], [36, 102], k);
      pose.rc = lerp(-0.15, -0.08, k) + 0.04 * Math.sin(t * 2.5) * k;
      sy = 1 + 0.01 * Math.sin(t * 3);
    }
    if (t >= 6.2 && t < 6.55) sy = 1 + 0.02 * Math.sin(t * 30);
    pose.manoD = manoD; pose.manoI = manoI;
    pose.objD2 = (g, m) => cuchillo(g, m[0] - 1, m[1] - 1, angC, brillaC);
    if (conLoncha) pose.objI2 = (g, m) => {
      if (aTras > 0) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8 * aTras; g.drawImage(BLOB.amarillo, m[0] - 26, m[1] - 2, 52, 52); g.restore(); }
      loncha(g, m[0] + 2, m[1] + 15, 1.45 + 0.12 * Math.sin(t * 9), 34, 13, 1, 1 - 0.35 * aTras);
    };
    const m = matAv(this.X, PIES, this.ESC, 0, 1, sy);
    return { pose, m, aTras };
  }
  destino(i) {
    // abanico: cada loncha sale del centro del plato hacia fuera (en perspectiva)
    const th = Math.PI * 1.1 + (i * Math.PI * 0.8) / 5, c = Math.cos(th), sn = Math.sin(th) * 0.38;
    return [PLATO[0] + c * 38, PLATO[1] + 5 + sn * 38, Math.atan2(sn, c)];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.cortes.forEach((tc, i) => this.una("c" + i, t >= tc, () => {
      const d = this.destino(i);
      this.vuelan.push({ t0: t, T: 1.05, x0: CORTE[0] + 10, y0: CORTE[1] - 4, x1: d[0], y1: d[1], a1: d[2], alto: 230 + i * 12, giros: 2 + (i % 2) });
      for (let k = 0; k < 4; k++) p.nueva(P.DESTELLO, CORTE[0] + azar(-20, 30), CORTE[1] + azar(-6, 6), 0, 0, 0.25, 26);
    }));
    this.una("ultima", t >= this.cazada, () => {
      const e = this.estado(5.12), q = aPant(e.m, [-6, 24]);
      this.vuelan.push({ t0: t, T: 0.27, x0: CORTE[0] + 10, y0: CORTE[1] - 4, x1: q[0] + 4, y1: q[1] + 26, a1: 1.45, alto: 60, giros: 1, ultima: true });
    });
    this.una("ting", t > 1.25, () => { const e = this.estado(), q = aPant(e.m, [100, 30]); p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.35, 60); });
    this.una("trasluz", t > 5.45, () => { const e = this.estado(), q = aPant(e.m, [22, 50]); for (let k = 0; k < 6; k++) p.nueva(P.DESTELLO, q[0] + azar(-20, 20), q[1] + azar(-20, 30), 0, 0, 0.4, 36); });
    this.una("gloria", t > 6.55, () => {
      temblar(8, 0.3);
      for (let k = 0; k < 40; k++) p.nueva(P.PURPURINA, this.X + azar(-260, 260), azar(-40, 260), azar(-20, 20), azar(20, 70), azar(1.5, 2.6), azar(8, 14));
    });
    if (t > 6.6 && t < 8.6 && Math.random() < 40 * dt) p.nueva(P.PURPURINA, this.X + azar(-280, 280), azar(-30, 30), azar(-15, 15), azar(30, 70), azar(1.6, 2.6), azar(7, 13));
    p.alfa = 1 - tramo(t, 8.9, 9.4);
    p.actualizar(dt);
  }
  posLoncha(L, t) {
    const u = clamp((t - L.t0) / L.T, 0, 1);
    // sube rápido y baja revoloteando como un papel
    const ue = L.ultima ? u : 1 - Math.pow(1 - u, 1.6);
    const x = lerp(L.x0, L.x1, ue) + (L.ultima ? 0 : Math.sin(u * Math.PI * 3) * 22 * (1 - u));
    const y = lerp(L.y0, L.y1, ue) - L.alto * Math.sin(Math.PI * ue);
    const ang = lerp(0.2, L.a1, eInOut(u)) + (1 - u) * Math.sin(u * 9) * 0.6;
    const flip = u < 1 ? Math.cos(u * Math.PI * 2 * L.giros) : 1;
    return { x, y, ang, flip: Math.abs(flip) < 0.15 ? 0.15 * Math.sign(flip || 1) : flip, u };
  }
  jamon(g) {
    // tabla del jamonero
    g.fillStyle = "#3b2414"; rectR(g, 515, 440, 255, 20, 5); g.fill();
    g.fillStyle = "#6a4123"; rectR(g, 515, 436, 255, 10, 5); g.fill();
    // poste y abrazadera
    g.fillStyle = "#9aa2aa"; g.fillRect(744, 318, 9, 122);
    g.fillStyle = "#d0d6dc"; g.fillRect(746, 318, 3, 122);
    // la pieza
    g.save();
    g.beginPath();
    g.moveTo(742, 302);
    g.bezierCurveTo(700, 318, 668, 360, 642, 376);
    g.bezierCurveTo(600, 372, 540, 380, 530, 408);
    g.bezierCurveTo(520, 438, 560, 448, 610, 444);
    g.bezierCurveTo(668, 440, 700, 400, 728, 362);
    g.bezierCurveTo(745, 338, 760, 322, 758, 310);
    g.closePath();
    const gr = g.createLinearGradient(560, 360, 620, 450);
    gr.addColorStop(0, "#c98a46"); gr.addColorStop(0.5, "#9c5824"); gr.addColorStop(1, "#5e2f10");
    g.fillStyle = gr; g.fill();
    g.strokeStyle = "rgba(40,18,4,.6)"; g.lineWidth = 2; g.stroke();
    g.fillStyle = "rgba(255,225,170,.25)"; g.beginPath(); g.ellipse(690, 350, 34, 7, -0.85, 0, 6.283); g.fill();
    g.restore();
    // la cara del corte
    g.save(); g.translate(CORTE[0], CORTE[1]); g.rotate(-0.06);
    g.fillStyle = "#f2e2c4"; g.beginPath(); g.ellipse(0, 0, 66, 17, 0, 0, 6.283); g.fill();
    const gc = g.createRadialGradient(-10, -3, 4, 0, 0, 60);
    gc.addColorStop(0, "#d43a4c"); gc.addColorStop(1, "#8e1a2c");
    g.fillStyle = gc; g.beginPath(); g.ellipse(4, 1, 56, 13, 0, 0, 6.283); g.fill();
    g.strokeStyle = "rgba(255,236,224,.7)"; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(-36, 2); g.quadraticCurveTo(-6, -8, 26, 0); g.stroke();
    g.beginPath(); g.moveTo(-10, 7); g.quadraticCurveTo(14, 2, 38, 6); g.stroke();
    g.restore();
    // pezuña y abrazadera
    g.fillStyle = "#151010"; g.beginPath(); g.moveTo(742, 302); g.quadraticCurveTo(752, 270, 772, 262); g.quadraticCurveTo(774, 288, 758, 310); g.closePath(); g.fill();
    g.fillStyle = "#b9c0c7"; rectR(g, 734, 312, 32, 12, 4); g.fill();
    g.fillStyle = "#6f777f"; g.fillRect(764, 315, 16, 5);
  }
  mesas(g) {
    for (const [x0, x1] of [[120, 380], [500, 800]]) {
      const top = 458;
      const gt = g.createLinearGradient(0, top, 0, top + 18);
      gt.addColorStop(0, "#a8743f"); gt.addColorStop(1, "#5b3518");
      g.fillStyle = gt; g.fillRect(x0, top, x1 - x0, 16);
      g.fillStyle = "#2a190c"; g.fillRect(x0 + 16, top + 16, 14, PIES - top - 16); g.fillRect(x1 - 30, top + 16, 14, PIES - top - 16);
      g.fillStyle = "#3d2412"; g.fillRect(x0 + 10, top + 16, x1 - x0 - 20, 10);
    }
    // plato
    g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(PLATO[0], 459, 92, 9, 0, 0, 6.283); g.fill();
    g.fillStyle = "#e9e4da"; g.beginPath(); g.ellipse(PLATO[0], PLATO[1], 92, 18, 0, 0, 6.283); g.fill();
    g.fillStyle = "#fffdf7"; g.beginPath(); g.ellipse(PLATO[0], PLATO[1] - 2, 70, 12, 0, 0, 6.283); g.fill();
    g.strokeStyle = "#1f62b8"; g.lineWidth = 2; g.beginPath(); g.ellipse(PLATO[0], PLATO[1], 86, 16, 0, 0, 6.283); g.stroke();
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    const gloria = tramo(t, 6.5, 6.9) * (1 - tramo(t, 8.7, 9.3));
    foco(g, 470, 470, PIES, 420, 0.75);
    if (gloria > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.45 * gloria;
      const gr = g.createLinearGradient(0, -20, 0, PIES);
      gr.addColorStop(0, "rgba(255,210,90,.9)"); gr.addColorStop(1, "rgba(255,180,40,.15)");
      g.fillStyle = gr; g.beginPath(); g.moveTo(this.X - 50, -20); g.lineTo(this.X + 50, -20); g.lineTo(this.X + 170, PIES); g.lineTo(this.X - 170, PIES); g.closePath(); g.fill();
      g.restore();
    }
    this.mesas(g);
    this.jamon(g);
    // lonchas ya en el plato (abanico)
    for (const L of this.vuelan) if (!L.ultima && t - L.t0 >= L.T) loncha(g, L.x1, L.y1, L.a1, 62, 22, 1);
    pintarAvatar(g, e.m, e.pose, t);
    // aureola
    if (gloria > 0) {
      const q = aPant(e.m, [39, -14]);
      g.save(); g.globalAlpha = gloria; g.translate(q[0], q[1] - 6 * Math.sin(t * 3)); g.rotate(-0.08);
      g.strokeStyle = "rgba(255,200,60,.5)"; g.lineWidth = 12; g.beginPath(); g.ellipse(0, 0, 44, 11, 0, 0, 6.283); g.stroke();
      g.strokeStyle = "#fff3b0"; g.lineWidth = 4.5; g.beginPath(); g.ellipse(0, 0, 44, 11, 0, 0, 6.283); g.stroke();
      g.restore();
    }
    // lonchas volando
    for (const L of this.vuelan) {
      if (t - L.t0 >= L.T) continue;
      const q = this.posLoncha(L, t);
      loncha(g, q.x, q.y, q.ang, lerp(74, 62, q.u), lerp(27, 22, q.u), q.flip);
    }
    this.p.dibujar(g);
    // ¡QUÉ FINURA!
    if (t > 6.6 && t < 9.2) {
      const c = titulo(), k = tramo(t, 6.6, 7.0), s = lerp(0.85, 1, eOut(k)) * (1 + 0.015 * Math.sin(t * 4));
      g.save(); g.globalAlpha = Math.min(1, k * 2) * (1 - tramo(t, 8.75, 9.1)); g.translate(W / 2 + 40, 145); g.scale(s, s);
      g.drawImage(c, -c.width / 2, -c.height / 2); g.restore();
      for (let i = 0; i < 4; i++) brillo(g, W / 2 + 40 + [-380, -200, 210, 380][i], 145 + [-50, 40, -60, 30][i], 18, Math.max(0, Math.sin(t * 5 + i * 1.7)) * Math.min(1, k * 2) * (1 - tramo(t, 8.75, 9.1)));
    }
    // telón
    const kT = this.telon();
    if (kT < 1) {
      if (!this.tela) this.tela = this.hacerTela();
      const ancho = W / 2 + 30, dx = kT * (ancho - 50);
      g.drawImage(this.tela, -30 - dx, -10, ancho, H + 20);
      g.save(); g.translate(W + 30 + dx, -10); g.scale(-1, 1); g.drawImage(this.tela, 0, 0, ancho, H + 20); g.restore();
    }
    if (!this.bamb) this.bamb = this.hacerBambalina();
    g.drawImage(this.bamb, -40, -6);
    const a = Math.max(1 - tramo(t, 0, 0.4), tramo(t, 9.45, this.dur - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  hacerTela() {
    const c = lienzoNuevo(300, 320), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 300, 0);
    for (let i = 0; i <= 10; i++) { gr.addColorStop(i / 10, i % 2 ? "#5e0612" : "#b3122a"); }
    g.fillStyle = gr; g.fillRect(0, 0, 300, 320);
    const sh = g.createLinearGradient(0, 0, 0, 320);
    sh.addColorStop(0, "rgba(0,0,0,.45)"); sh.addColorStop(0.3, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(0,0,0,.35)");
    g.fillStyle = sh; g.fillRect(0, 0, 300, 320);
    g.fillStyle = "#d9a51e"; g.fillRect(292, 0, 8, 320);
    return c;
  }
  hacerBambalina() {
    const c = lienzoNuevo(W + 80, 70), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, 60);
    gr.addColorStop(0, "#4a040e"); gr.addColorStop(1, "#a01024");
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(W + 80, 0); g.lineTo(W + 80, 40);
    for (let x = W + 80; x >= 0; x -= 68) g.quadraticCurveTo(x - 34, 70, x - 68, 40);
    g.closePath(); g.fill();
    g.strokeStyle = "#d9a51e"; g.lineWidth = 4;
    g.beginPath(); g.moveTo(W + 80, 40); for (let x = W + 80; x >= 0; x -= 68) g.quadraticCurveTo(x - 34, 70, x - 68, 40); g.stroke();
    return c;
  }
}

registrar({ id: "00073", nombre: "Jamón al corte", crear: () => new EscenaJamon() });
})();
