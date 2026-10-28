"use strict";
/*
 * 00046 · EL REPARTIDOR
 *
 * Animación del banco. Empieza y acaba en negro.
 * Entra a toda velocidad en bici con un barril de cerveza en la parrilla. Frena derrapando (¡ÑIIIC!): la bici se
 * levanta de atrás, deja marcas en el suelo y el barril sale volando por encima de su cabeza… y aterriza justo en la
 * barra del bar, al lado del grifo (¡PUM!). ¡PEDIDO! Toca el timbre (¡RING RING!), da la vuelta y se va saludando.
 * El neón del bar se apaga.
 */
(() => {
const ESC = 1.3, R = 60, SILLIN = [-42, -180]; // bici: origen en el suelo entre las ruedas
const T_FRENA = 1.3, T_PARA = 1.78, T_LANZA = 1.7, T_CAE = 2.95, T_GIRA = 4.75, T_SALE = 5.05;
const BARRA = { x0: 690, x1: 1010, top: 440 }, DESTINO = [800, 440];

class Repartidor extends Escena {
  constructor() {
    super(7.6);
    this.p = new Parts(360);
    this.x = -380; this.v = 560; this.ruedas = 0; this.pedal = 0;
    this.marca0 = null;
    this.barril = null; // en vuelo
    this.fondo = pintarFondo();
  }
  /** Cabeceo de la bici al frenar (rad, positivo = la rueda de atrás sube). */
  cabeceo() {
    const t = this.t;
    if (t < T_FRENA) return 0;
    if (t < 2.25) return 0.24 * Math.sin(Math.PI * tramo(t, T_FRENA + 0.1, 2.1)) * (t < 2.1 ? 1 : 0);
    return 0;
  }
  sentido() { const t = this.t; return t < T_GIRA ? 1 : Math.cos(Math.PI * eInOut(tramo(t, T_GIRA, T_SALE))); }
  /** Matriz de la bici: origen (suelo, entre ruedas), con el cabeceo sobre la rueda de delante. */
  matBici() {
    const s = this.sentido(), c = this.cabeceo();
    const m = new DOMMatrix().translate(this.x, PIES).scale(Math.abs(s) < 0.06 ? 0.06 * Math.sign(s || 1) : s, 1);
    return c ? m.translate(105, 0).rotate((-c * 180) / Math.PI).translate(-105, 0) : m;
  }
  estado() {
    const t = this.t, s = this.sentido();
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    const mb = this.matBici();
    // pedalea
    const pd = Math.sin(this.pedal);
    pose.piernaI = [-10 * Math.max(0, pd) - 2, 0.05 * pd]; pose.piernaD = [-10 * Math.max(0, -pd) - 2, -0.05 * pd];
    let manoD = [114, 128], manoI = [-20, 122], conBarril = this.barril == null && t < T_LANZA;
    pose.cara = t < T_FRENA ? "risa" : "sonrisa";
    if (t >= T_FRENA && t < T_CAE + 0.1) {
      pose.cara = "sorpresa";
      if (t > T_LANZA) { const u = tramo(t, T_LANZA, T_CAE); pose.rc = lerp(-0.12, 0.16, u); manoI = mezcla([-20, 122], [-30, 50], eOut(tramo(t, T_LANZA, T_LANZA + 0.25))); }
    }
    if (t >= T_CAE + 0.1 && t < T_GIRA) {
      pose.cara = t < 3.9 ? "risa" : "guino";
      manoI = mezcla([-30, 50], [-14, 140], eInOut(tramo(t, T_CAE + 0.1, T_CAE + 0.4)));
      // el timbre
      if (t > 3.75 && t < 4.45) manoD = [114 + 2 * Math.sin(t * 50), 126];
    }
    if (t >= T_GIRA) {
      // con la bici al revés: la mano de atrás al manillar y la de delante dice adiós
      manoI = mezcla([-14, 140], [-36, 128], tramo(t, T_GIRA, T_SALE));
      manoD = mezcla([114, 128], [104 + 10 * Math.sin(t * 12), 40], eOut(tramo(t, T_GIRA, T_SALE)));
      pose.cara = "guino";
    }
    pose.manoD = manoD; pose.manoI = manoI;
    pose.objD = (g) => gorra(g, pose.rc);
    // el avatar se sienta en el sillín: sus caderas (39, 146) van al sillín
    const sill = mb.transformPoint(new DOMPoint(SILLIN[0], SILLIN[1] + 4));
    const giroB = this.cabeceo() * (s >= 0 ? -1 : 1) * 0.6;
    const m = matAv(sill.x, sill.y, ESC, giroB, Math.abs(s) < 0.2 ? 1 : 1, 1, [39, 146]);
    return { pose, m, mb, conBarril };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // velocidad: llega lanzado, derrapa, para; luego se va hacia la izquierda
    if (t < T_FRENA) this.v = 560;
    else if (t < T_PARA) this.v = 560 * (1 - tramo(t, T_FRENA, T_PARA));
    else if (t < T_SALE) this.v = 0;
    else this.v = -Math.min(620, (t - T_SALE) * 900);
    this.x += this.v * dt;
    const frenando = t >= T_FRENA && t < T_PARA;
    if (!frenando) this.ruedas += (this.v / R) * dt;
    if (t < T_FRENA || t > T_SALE) this.pedal += dt * (t < T_FRENA ? 14 : 12);
    const e = this.estado();
    // derrape: marcas, polvo y chispas en la rueda de atrás
    if (frenando) {
      const q = e.mb.transformPoint(new DOMPoint(-105, 0));
      if (!this.marca0) this.marca0 = q.x;
      this.marcaX = q.x;
      for (let k = 0; k < 2; k++) p.nueva(P.POLVO, q.x + azar(-10, 10), PIES - 4, azar(-260, -60), azar(-70, -10), azar(0.5, 0.9), azar(24, 44));
      if (Math.random() < 30 * dt) { const a = azar(-Math.PI * 0.95, -Math.PI * 0.6), v = azar(200, 420); p.nueva(P.CHISPA, q.x, PIES - 3, Math.cos(a) * v, Math.sin(a) * v, azar(0.2, 0.4), azar(6, 9)); }
    }
    this.una("frena", t > T_FRENA, () => temblar(5, 0.4));
    // el barril sale volando
    this.una("lanza", t > T_LANZA, () => {
      const q = e.mb.transformPoint(new DOMPoint(-92, -186));
      this.barril = { x0: q.x, y0: q.y, t0: t };
    });
    this.una("cae", t > T_CAE, () => {
      temblar(22, 0.5);
      for (let k = 0; k < 24; k++) p.nueva(P.POLVO, DESTINO[0] + azar(-50, 50), BARRA.top - 4, azar(-300, 300), azar(-90, -10), azar(0.6, 1.0), azar(26, 44));
      for (let k = 0; k < 18; k++) p.nueva(P.ESPUMA, 930, 360, azar(-140, 60), azar(-380, -160), azar(0.4, 0.8), azar(3, 7));
    });
    this.una("pedido", t > T_CAE + 0.12, () => {
      for (let k = 0; k < 40; k++) p.nueva(P.CONFETI, azar(150, 880), azar(-60, 0), azar(-50, 50), azar(60, 160), azar(2.0, 2.6), azar(9, 15), k % 5);
    });
    if (t < T_FRENA || t > T_SALE + 0.2) if (Math.random() < 16 * dt) p.nueva(P.POLVO, this.x + (t < T_FRENA ? -110 : 110), PIES - 4, -this.v * 0.3, azar(-30, -5), azar(0.4, 0.7), azar(16, 28));
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  luz() {
    const t = this.t;
    const on = t < 0.6 ? [0, 0, 0.7, 0, 1, 0.4, 1, 1, 1][Math.min(8, Math.floor(t / 0.07))] : 1;
    return on * (t < 6.9 ? 1 : [1, 0.2, 1, 0, 0.5, 0, 0, 0, 0][Math.min(8, Math.floor((t - 6.9) / 0.075))]);
  }
  posBarril() {
    const t = this.t, B = this.barril;
    if (!B) return null;
    const u = tramo(t, B.t0, T_CAE);
    if (u >= 1) {
      const k = tramo(t, T_CAE, T_CAE + 0.35);
      return { x: DESTINO[0], y: DESTINO[1] - 44 - 10 * Math.sin(Math.PI * k) * (1 - k), a: 0.08 * Math.sin(k * 18) * (1 - k), sy: 1 - 0.12 * Math.sin(Math.PI * Math.min(1, k * 3)) };
    }
    return { x: lerp(B.x0, DESTINO[0], u), y: lerp(B.y0, DESTINO[1] - 44, u) - 330 * 4 * u * (1 - u), a: Math.PI * 2 * 1.5 * u, sy: 1 };
  }
  dibujarBici(g, mb, conBarril) {
    const t = this.t;
    g.save(); g.setTransform(g.getTransform().multiply(mb));
    // ruedas
    for (const cx of [-105, 105]) {
      g.save(); g.translate(cx, -R);
      g.strokeStyle = "#141414"; g.lineWidth = 9; g.beginPath(); g.arc(0, 0, R - 4, 0, 6.283); g.stroke();
      g.strokeStyle = "#4a4a4a"; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, R - 9, 0, 6.283); g.stroke();
      g.strokeStyle = "rgba(210,215,220,.75)"; g.lineWidth = 1.4;
      const giro = this.ruedas;
      for (let k = 0; k < 8; k++) { const a = giro + (k * Math.PI) / 8; g.beginPath(); g.moveTo(Math.cos(a) * (R - 9), Math.sin(a) * (R - 9)); g.lineTo(-Math.cos(a) * (R - 9), -Math.sin(a) * (R - 9)); g.stroke(); }
      g.fillStyle = "#c9ced3"; g.beginPath(); g.arc(0, 0, 5, 0, 6.283); g.fill();
      g.restore();
    }
    // cuadro
    g.lineCap = "round"; g.lineJoin = "round";
    const tubo = (pts, w, c) => { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.stroke(); };
    // parrilla
    tubo([[-30, -150], [-140, -150]], 5, "#9aa3ab"); tubo([[-130, -150], [-105, -62]], 4, "#9aa3ab"); tubo([[-80, -150], [-105, -62]], 4, "#9aa3ab");
    const verde = "#18a84a";
    tubo([[-105, -62], [-15, -66], [85, -135], [-38, -158], [-105, -62]], 8, verde);
    tubo([[-15, -66], [-42, -168]], 8, verde);
    tubo([[85, -135], [105, -62]], 7, "#c9ced3");
    tubo([[85, -135], [76, -172], [70, -196], [54, -200]], 6, "#2a2a2a");
    tubo([[54, -200], [44, -198]], 9, "#111");
    // timbre
    g.fillStyle = "#e3e7ea"; g.beginPath(); g.arc(70, -204, 6, Math.PI, 0); g.fill();
    // sillín
    g.fillStyle = "#151515"; g.beginPath(); g.ellipse(SILLIN[0], SILLIN[1], 24, 7, -0.05, 0, 6.283); g.fill();
    tubo([[-42, -174], [-40, -165]], 6, "#9aa3ab");
    // biela y pedales
    const pa = this.pedal;
    g.strokeStyle = "#333"; g.lineWidth = 5;
    for (const s of [1, -1]) { const q = [-15 + Math.cos(pa) * 20 * s, -66 + Math.sin(pa) * 20 * s]; g.beginPath(); g.moveTo(-15, -66); g.lineTo(q[0], q[1]); g.stroke(); g.fillStyle = "#222"; g.fillRect(q[0] - 7, q[1] - 2.5, 14, 5); }
    g.fillStyle = "#555"; g.beginPath(); g.arc(-15, -66, 9, 0, 6.283); g.fill();
    if (conBarril) barril(g, -88, -150 - 46, 0, 1);
    g.restore();
  }
  dibujarBarra(g) {
    const t = this.t, a = this.luz();
    if (a <= 0) return;
    g.save(); g.globalAlpha = a;
    // neón BAR
    const zumba = Math.sin(t * 41) > 0.96 ? 0.6 : 1;
    g.save(); g.globalAlpha = a * zumba;
    g.strokeStyle = "rgba(43,255,91,.6)"; g.lineWidth = 3; rectR(g, 770, 150, 170, 92, 18); g.shadowColor = "#2bff5b"; g.shadowBlur = 16; g.stroke();
    txt(g, "BAR", 855, 220, { tam: 70, peso: 900, fam: FD, color: "#d8ffe2", glow: "#2bff5b", glowTam: 20, esp: 10 });
    g.restore();
    // barra
    const gr = g.createLinearGradient(0, BARRA.top, 0, PIES);
    gr.addColorStop(0, "#5a3a22"); gr.addColorStop(1, "#24160c");
    g.fillStyle = gr; g.fillRect(BARRA.x0, BARRA.top + 10, BARRA.x1 - BARRA.x0, PIES - BARRA.top - 10);
    g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = 2;
    for (let x = BARRA.x0 + 64; x < BARRA.x1; x += 64) { g.beginPath(); g.moveTo(x, BARRA.top + 14); g.lineTo(x, PIES - 12); g.stroke(); }
    g.fillStyle = "#151009"; g.fillRect(BARRA.x0, PIES - 12, BARRA.x1 - BARRA.x0, 12);
    const gt = g.createLinearGradient(0, BARRA.top - 6, 0, BARRA.top + 12);
    gt.addColorStop(0, "#e2c9a2"); gt.addColorStop(1, "#8a6a48");
    g.fillStyle = gt; g.fillRect(BARRA.x0 - 12, BARRA.top - 2, BARRA.x1 - BARRA.x0 + 24, 14);
    // grifo
    g.fillStyle = "#b9c1c8"; rectR(g, 912, 352, 16, 88, 4); g.fill();
    g.fillStyle = "#e6ebef"; rectR(g, 900, 344, 40, 14, 5); g.fill();
    g.fillStyle = "#18a84a"; rectR(g, 914, 310, 12, 36, 4); g.fill();
    g.fillStyle = "#b9c1c8"; g.fillRect(926, 370, 16, 8); g.fillRect(936, 370, 6, 16);
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    g.save(); g.globalAlpha = 0.85 * Math.min(this.luz(), tramo(t, 0, 0.6)); g.drawImage(this.fondo, 0, 0); g.restore();
    // marcas del derrape
    if (this.marca0 != null) {
      const a = 1 - tramo(t, 5.5, 6.6);
      g.save(); g.globalAlpha = a; g.strokeStyle = "#3a3a3a"; g.lineWidth = 6; g.lineCap = "round";
      g.beginPath(); g.moveTo(this.marca0, PIES + 2); g.lineTo(this.marcaX, PIES + 2); g.stroke();
      g.strokeStyle = "rgba(0,0,0,.6)"; g.lineWidth = 2; g.beginPath(); g.moveTo(this.marca0 + 10, PIES + 6); g.lineTo(this.marcaX, PIES + 6); g.stroke();
      g.restore();
    }
    this.dibujarBarra(g);
    // líneas de velocidad
    if (Math.abs(this.v) > 300) {
      g.save(); g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 2;
      const dir = Math.sign(this.v);
      for (let k = 0; k < 6; k++) { const y = 240 + k * 52 + 10 * Math.sin(t * 9 + k), x0 = this.x - dir * (150 + (k % 3) * 30); g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 - dir * (90 + (k % 2) * 60), y); g.stroke(); }
      g.restore();
    }
    this.dibujarBici(g, e.mb, e.conBarril);
    // barril volando (por detrás de él) / en la barra
    const B = this.posBarril();
    if (B) { g.save(); g.globalAlpha = this.luz(); barril(g, B.x, B.y, B.a, B.sy); g.restore(); }
    pintarAvatar(g, e.m, e.pose, t);
    this.p.dibujar(g);
    // onomatopeyas
    if (t > T_FRENA && t < 2.2) {
      const k = tramo(t, T_FRENA, T_FRENA + 0.12);
      g.save(); g.translate((this.marca0 || this.x) - 40, PIES - 90); g.rotate(-0.08); g.scale(eBack(k), eBack(k));
      txt(g, "¡ÑIIIIC!", 0, 0, { tam: 54, peso: 400, fam: FC, color: "#fffdf5", borde: "#5a1a00", bordeAncho: 8, alfa: 1 - tramo(t, 1.95, 2.2), esp: 3 });
      g.restore();
    }
    if (t > T_CAE && t < 3.6) {
      const k = tramo(t, T_CAE, T_CAE + 0.12);
      g.save(); g.translate(DESTINO[0] - 10, BARRA.top - 140); g.rotate(0.1); g.scale(eBack(k), eBack(k));
      txt(g, "¡PUM!", 0, 0, { tam: 56, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a2400", bordeAncho: 8, alfa: 1 - tramo(t, 3.35, 3.6), esp: 2 });
      g.restore();
    }
    if (t > 3.75 && t < 4.6) {
      const q = aPant(e.m, [39, -8]);
      bocadillo(g, q[0] + 20, q[1] - 40, "¡RING RING!", q[0] + 20, q[1] - 2, tramo(t, 3.75, 3.9) * (1 - tramo(t, 4.4, 4.6)), 32);
    }
    // ¡PEDIDO!
    if (t > T_CAE + 0.12 && t < 6.3) {
      const k = tramo(t, T_CAE + 0.12, T_CAE + 0.3), s = lerp(2.6, 1, eIn(k)), a = Math.min(1, k * 3) * (1 - tramo(t, 5.9, 6.3));
      g.save(); g.translate(W / 2 - 40, 112); g.rotate(-0.05); g.scale(s, s); g.globalAlpha = a;
      rectR(g, -250, -62, 500, 96, 48); g.fillStyle = "#18a84a"; g.fill();
      g.lineWidth = 6; g.strokeStyle = "#0a5a23"; g.stroke();
      g.fillStyle = "#fff"; g.beginPath(); g.arc(-196, -14, 30, 0, 6.283); g.fill();
      g.strokeStyle = "#18a84a"; g.lineWidth = 9; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); g.moveTo(-210, -14); g.lineTo(-199, -2); g.lineTo(-180, -28); g.stroke();
      txt(g, "¡PEDIDO!", 30, 20, { tam: 84, peso: 400, fam: FC, color: "#fffdf5", borde: "#0a5a23", bordeAncho: 8, esp: 4, max: 380 });
      g.restore();
    }
    const negro = tramo(t, 7.3, 7.58);
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}
function pintarFondo() {
  const c = lienzoNuevo(W, H), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, PIES);
  gr.addColorStop(0, "#05070d"); gr.addColorStop(1, "#111522");
  g.fillStyle = gr; g.fillRect(0, 0, W, PIES);
  // edificios lejanos con ventanas encendidas
  const r = semilla(46);
  let x = -20;
  while (x < W) {
    const w = 90 + r() * 90, h = 160 + r() * 250, y = PIES - h;
    g.fillStyle = `rgb(${14 + r() * 8},${16 + r() * 8},${26 + r() * 10})`; g.fillRect(x, y, w, h);
    for (let wy = y + 16; wy < PIES - 30; wy += 26) for (let wx = x + 12; wx < x + w - 16; wx += 22) {
      if (r() < 0.32) { g.fillStyle = `rgba(255,${190 + r() * 50},${110 + r() * 60},${0.18 + r() * 0.2})`; g.fillRect(wx, wy, 10, 13); }
    }
    x += w + 6 + r() * 20;
  }
  g.fillStyle = "#1c1f27"; g.fillRect(0, PIES, W, H - PIES);
  g.fillStyle = "#2a2e38"; g.fillRect(0, PIES, W, 3);
  return c;
}
/** Barril de cerveza (pantalla), centrado en (x, y). */
function barril(g, x, y, ang, sy) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(1, sy);
  const w = 64, h = 84;
  const gr = g.createLinearGradient(-w / 2, 0, w / 2, 0);
  gr.addColorStop(0, "#5a3416"); gr.addColorStop(0.35, "#b8763a"); gr.addColorStop(0.6, "#9a5e2a"); gr.addColorStop(1, "#4a2a10");
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(-w / 2 + 6, -h / 2); g.quadraticCurveTo(-w / 2 - 6, 0, -w / 2 + 6, h / 2); g.lineTo(w / 2 - 6, h / 2); g.quadraticCurveTo(w / 2 + 6, 0, w / 2 - 6, -h / 2); g.closePath(); g.fill();
  g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 1.5;
  for (const dx of [-14, 0, 14]) { g.beginPath(); g.moveTo(dx, -h / 2); g.quadraticCurveTo(dx * 1.2, 0, dx, h / 2); g.stroke(); }
  g.fillStyle = "#3b3f45";
  for (const yy of [-h / 2 + 8, h / 2 - 12]) { g.fillRect(-w / 2 + 1, yy, w - 2, 5); }
  g.fillRect(-w / 2 - 2, -3, w + 4, 6);
  g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(-w / 2 + 1, -h / 2 + 8, w - 2, 1.5);
  g.fillStyle = "#6e4420"; g.beginPath(); g.ellipse(0, -h / 2, w / 2 - 6, 6, 0, 0, 6.283); g.fill();
  g.strokeStyle = "#3b3f45"; g.lineWidth = 2; g.stroke();
  // etiqueta
  g.fillStyle = "#ffd34d"; rectR(g, -18, 10, 36, 16, 3); g.fill();
  txt(g, "BEER", 0, 23, { tam: 13, peso: 900, fam: FD, color: "#3a1d00", esp: 1 });
  g.restore();
}
/** Gorra de repartidor (verde, con visera; sigue el giro de la cabeza). */
function gorra(g, rc) {
  g.save(); g.translate(39, 72); g.rotate(rc); g.translate(-39, -72);
  const gr = g.createLinearGradient(0, -12, 0, 14);
  gr.addColorStop(0, "#36d46a"); gr.addColorStop(1, "#0f7a34");
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(9, 14); g.bezierCurveTo(8, -6, 22, -13, 39, -13); g.bezierCurveTo(56, -13, 70, -6, 69, 14); g.quadraticCurveTo(39, 8, 9, 14); g.closePath(); g.fill();
  g.strokeStyle = "rgba(0,0,0,.3)"; g.lineWidth = 1; g.stroke();
  g.fillStyle = "#0b5a26"; g.beginPath(); g.ellipse(39, 14, 30, 5, 0, 0, Math.PI); g.fill();
  g.fillStyle = "#fff"; g.beginPath(); g.arc(39, -1, 6, 0, 6.283); g.fill();
  g.fillStyle = "#18a84a"; g.beginPath(); g.moveTo(35, -1); g.lineTo(38, 2); g.lineTo(43, -4); g.lineTo(42, -5); g.lineTo(38, -1); g.lineTo(36, -2); g.closePath(); g.fill();
  g.fillStyle = "#0f7a34"; g.beginPath(); g.arc(39, -13, 2.4, 0, 6.283); g.fill();
  g.restore();
}

registrar({ id: "00046", nombre: "El repartidor", crear: () => new Repartidor() });
})();
