"use strict";
/*
 * 00060 · FIESTA DE LA CERVEZA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se encienden una a una las bombillas de una carpa bávara. Guillermo, con tirantes, pantalón de cuero y sombrero
 * con pluma, levanta tres jarras en cada mano y baila a saltos y patadas sin derramar (casi) nada. Junta las seis
 * jarras sobre la cabeza: ¡PROST!, revienta la espuma y cae confeti azul y blanco. Las bombillas se apagan.
 */
(() => {
const cache = cacheTexto();
const N_BOMB = 14;
const AZUL = "#2a7fd4";

/** Punto de una guirnalda que cuelga entre (x0, y0) y (x1, y1). */
function colgando(x0, y0, x1, y1, comba, u) { return [lerp(x0, x1, u), lerp(y0, y1, u) + comba * 4 * u * (1 - u)]; }

/** Tres jarras cogidas por el asa en una mano (lado -1: mano izquierda, en espejo). Unidades de avatar. */
function ramo(g, m, ang, t, lado) {
  g.save(); g.translate(m[0], m[1]); g.scale(lado * 0.95, 0.95); g.rotate(ang);
  for (const a of [-0.72, 0.72, 0]) {
    const o = [Math.cos(a) * 5, Math.sin(a) * 5];
    dibujarJarra(g, o, a, 1, "asa", t);
    dibujarJarra(g, o, a, 1, "cuerpo", t);
  }
  g.restore();
}

/** Pantalón de cuero, calcetines, tirantes con peto y sombrero tirolés con pluma (encima del avatar). */
function traje(g, pose, t, conSombrero) {
  const cuero = (y0, y1) => { const gr = g.createLinearGradient(-14, 0, 14, 0); gr.addColorStop(0, "#3b230f"); gr.addColorStop(0.45, "#8a5a2c"); gr.addColorStop(1, "#3b230f"); return gr; };
  for (const [cx, p, dx] of [[27, pose.piernaI, 4], [51, pose.piernaD, -4]]) {
    g.save(); g.translate(cx, 146 + p[0]); g.rotate(p[1]);
    // calcetín de lana
    const gs = g.createLinearGradient(dx - 10, 0, dx + 10, 0);
    gs.addColorStop(0, "#b9ae96"); gs.addColorStop(0.5, "#f6efdc"); gs.addColorStop(1, "#a99f88");
    g.fillStyle = gs; rectR(g, dx - 8.5, 38, 17, 31, 4); g.fill();
    g.strokeStyle = "rgba(120,105,80,.45)"; g.lineWidth = 0.8;
    g.beginPath(); for (let x = -6; x <= 6; x += 3) { g.moveTo(dx + x, 47); g.lineTo(dx + x, 68); } g.stroke();
    g.fillStyle = "#2e6b34"; g.fillRect(dx - 8.5, 40, 17, 3);
    // pernera
    g.fillStyle = cuero();
    g.beginPath(); g.moveTo(dx - 12, -8); g.lineTo(dx + 12, -8); g.lineTo(dx + 10.5, 39); g.quadraticCurveTo(dx, 42, dx - 10.5, 39); g.closePath(); g.fill();
    g.strokeStyle = "#e7d7a8"; g.lineWidth = 0.7; g.setLineDash([2, 1.6]);
    g.beginPath(); g.moveTo(dx - 9.5, 35); g.quadraticCurveTo(dx, 38, dx + 9.5, 35); g.stroke(); g.setLineDash([]);
    g.restore();
  }
  // cinturilla y portañuela bordada
  g.fillStyle = "#4a2c12"; rectR(g, 15, 136, 48, 9, 3); g.fill();
  const gp = g.createLinearGradient(0, 140, 0, 168); gp.addColorStop(0, "#9a6834"); gp.addColorStop(1, "#5c3818");
  g.fillStyle = gp; rectR(g, 28, 141, 22, 24, 4); g.fill();
  g.strokeStyle = "#f1e3b5"; g.lineWidth = 0.8;
  g.beginPath(); g.arc(39, 152, 5, 0, 6.283); g.stroke();
  // tirantes
  g.lineCap = "round";
  for (const [x0, x1] of [[25, 31], [53, 47]]) {
    g.strokeStyle = "#4a2c12"; g.lineWidth = 7.5;
    g.beginPath(); g.moveTo(x0, 77); g.lineTo(x1, 140); g.stroke();
    g.strokeStyle = "#7d5126"; g.lineWidth = 5.4;
    g.beginPath(); g.moveTo(x0, 77); g.lineTo(x1, 140); g.stroke();
    g.fillStyle = "#e8dcc0"; g.beginPath(); g.arc(x1, 140, 2.2, 0, 6.283); g.fill();
  }
  // peto con edelweiss
  g.fillStyle = "#4a2c12"; rectR(g, 23, 100, 32, 11, 3); g.fill();
  g.fillStyle = "#7d5126"; rectR(g, 24, 101, 30, 9, 2.5); g.fill();
  g.fillStyle = "#fffaf0";
  for (let i = 0; i < 6; i++) { const a = i * 1.047; g.beginPath(); g.ellipse(39 + Math.cos(a) * 2.6, 105.5 + Math.sin(a) * 2.6, 2.4, 1.1, a, 0, 6.283); g.fill(); }
  g.fillStyle = "#ffd34d"; g.beginPath(); g.arc(39, 105.5, 1.3, 0, 6.283); g.fill();
  // sombrero (gira con la cabeza)
  if (conSombrero) { g.save(); g.translate(RIG.cuello[0], RIG.cuello[1]); g.rotate(pose.rc || 0); g.translate(0, -66); sombrero(g, t); g.restore(); }
}

/** Sombrero tirolés con pluma; (0, 0) = centro del ala. Unidades de avatar. */
function sombrero(g, t) {
  // pluma
  g.save(); g.translate(17, -6); g.rotate(-0.5 + 0.06 * Math.sin(t * 9));
  const gf = g.createLinearGradient(0, 0, 0, -42); gf.addColorStop(0, "#1d1d1d"); gf.addColorStop(0.6, "#4f6f8f"); gf.addColorStop(1, "#f2f2f2");
  g.fillStyle = gf; g.beginPath(); g.moveTo(-2, 0); g.quadraticCurveTo(-7, -24, 2, -44); g.quadraticCurveTo(6, -22, 3, 0); g.closePath(); g.fill();
  g.strokeStyle = "rgba(255,255,255,.5)"; g.lineWidth = 0.6; g.beginPath(); g.moveTo(0.5, 0); g.quadraticCurveTo(-2, -22, 2, -43); g.stroke();
  g.restore();
  // copa
  const gc = g.createLinearGradient(-22, 0, 22, 0); gc.addColorStop(0, "#1f3a1a"); gc.addColorStop(0.45, "#4f7a3a"); gc.addColorStop(1, "#1a3016");
  g.fillStyle = gc;
  g.beginPath(); g.moveTo(-21, 0); g.quadraticCurveTo(-20, -24, -9, -27); g.quadraticCurveTo(0, -21, 9, -27); g.quadraticCurveTo(20, -24, 21, 0); g.closePath(); g.fill();
  // cinta
  g.fillStyle = "#24160c"; g.fillRect(-21, -7, 42, 6);
  g.fillStyle = "#ffd34d"; g.beginPath(); g.arc(-12, -4, 1.4, 0, 6.283); g.arc(12, -4, 1.4, 0, 6.283); g.fill();
  // ala
  const ga = g.createLinearGradient(0, -4, 0, 6); ga.addColorStop(0, "#5d8a45"); ga.addColorStop(1, "#1e3618");
  g.fillStyle = ga; g.beginPath(); g.ellipse(0, 1, 33, 5.5, 0, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 0.8; g.stroke();
}

/** Corchea dibujada (no depende de la fuente). */
function nota(g, x, y, s, a, col) {
  g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha *= a;
  g.fillStyle = col; g.strokeStyle = col; g.lineWidth = 2.4;
  g.beginPath(); g.ellipse(0, 0, 7, 5, -0.4, 0, 6.283); g.fill();
  g.beginPath(); g.moveTo(6, -2); g.lineTo(6, -28); g.quadraticCurveTo(10, -18, 17, -16); g.stroke();
  g.restore();
}

class EscenaOktober extends Escena {
  constructor() {
    super(10.0);
    this.p = new Parts(450);
    this.p.suelo = () => PIES - 4;
    this.X = W / 2; this.ESC = 1.36;
    this.notas = [];
    this.flash = 0;
    this.fondoC = this.pintarFondo();
    this.T_SOMBRERO = 7.2; // vuelve a caer en la cabeza
  }
  pintarFondo() {
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    const gr = g.createRadialGradient(W / 2, 330, 40, W / 2, 330, 700);
    gr.addColorStop(0, "#5a3a1a"); gr.addColorStop(0.5, "#2a190b"); gr.addColorStop(1, "#0a0604");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // techo de la carpa: gajos azules y blancos
    g.save(); g.globalAlpha = 0.16;
    for (let i = -10; i <= 10; i++) {
      g.fillStyle = i % 2 ? "#ffffff" : AZUL;
      g.beginPath(); g.moveTo(W / 2, -260); g.lineTo(W / 2 + i * 120 - 60, 380); g.lineTo(W / 2 + i * 120 + 60, 380); g.closePath(); g.fill();
    }
    g.restore();
    const gv = g.createLinearGradient(0, 200, 0, 420); gv.addColorStop(0, "rgba(0,0,0,0)"); gv.addColorStop(1, "rgba(10,6,3,.85)");
    g.fillStyle = gv; g.fillRect(0, 200, W, 230);
    // mesas largas al fondo
    for (const [x0, x1] of [[20, 330], [694, 1004]]) {
      g.fillStyle = "#3d2510"; g.fillRect(x0, 432, x1 - x0, 12);
      g.fillStyle = "#24150a"; g.fillRect(x0 + 16, 444, 8, 70); g.fillRect(x1 - 24, 444, 8, 70);
      for (let x = x0 + 30; x < x1 - 20; x += 46) {
        g.fillStyle = "rgba(255,200,90,.55)"; g.fillRect(x, 410, 16, 22);
        g.fillStyle = "rgba(255,250,235,.8)"; g.fillRect(x - 1, 406, 18, 5);
      }
    }
    // suelo de tablones
    const gs = g.createLinearGradient(0, 470, 0, H); gs.addColorStop(0, "#3a2512"); gs.addColorStop(1, "#140c06");
    g.fillStyle = gs; g.fillRect(0, 470, W, H - 470);
    g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = 2;
    for (let i = -12; i <= 12; i++) { g.beginPath(); g.moveTo(W / 2 + i * 50, 470); g.lineTo(W / 2 + i * 150, H); g.stroke(); }
    return c;
  }
  bombilla(i) { return colgando(-10, 70, W + 10, 70, 70, (i + 0.5) / N_BOMB); }
  /** 0–1: cuánto luce la bombilla i (se encienden de izquierda a derecha y se apagan al revés). */
  luzBombilla(i) {
    const on = tramo(this.t, 0.15 + i * 0.06, 0.2 + i * 0.06);
    const off = tramo(this.t, 8.75 + (N_BOMB - 1 - i) * 0.07, 8.8 + (N_BOMB - 1 - i) * 0.07);
    return on * (1 - off);
  }
  luz() { let s = 0; for (let i = 0; i < N_BOMB; i++) s += this.luzBombilla(i); return s / N_BOMB; }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [74, 150], manoI = [4, 150], angD = 0, angI = 0, dy = 0, giro = 0, sx = 1, sy = 1;
    // levanta las jarras (pesan)
    const kSube = eBack(tramo(t, 1.05, 1.5));
    if (t > 0.95 && t < 1.25) { pose.cara = "sorpresa"; dy = azar(-1, 1); }
    manoD = mezcla(manoD, [100, 100], kSube); manoI = mezcla(manoI, [-22, 100], kSube);
    angD = -0.25 * kSube; angI = -0.25 * kSube;
    if (t > 1.25 && t < 1.6) pose.cara = "risa";
    // baile: un salto por tiempo, patadas alternas
    if (t >= 1.6 && t < 5.7) {
      const b = (t - 1.6) / 0.5, n = Math.floor(b), u = b - n, k = Math.sin(Math.PI * u);
      const lado = n % 2 ? 1 : -1, grande = n % 4 === 3;
      dy = -k * (grande ? 34 : 18);
      if (u < 0.12) sy = 1 - 0.05 * (1 - u / 0.12);
      const pat = grande ? 0.75 : 0.42;
      if (lado > 0) { pose.piernaD = [-8 * k, -pat * k]; pose.piernaI = [0, 0.06 * k]; }
      else { pose.piernaI = [-8 * k, pat * k]; pose.piernaD = [0, -0.06 * k]; }
      if (grande) { pose.piernaI = [-6 * k, 0.5 * k]; pose.piernaD = [-6 * k, -0.5 * k]; }
      giro = -0.06 * lado * k;
      pose.rc = 0.13 * lado * k;
      const arriba = [100, 58], fuera = [104, 104];
      manoD = mezcla(fuera, arriba, lado > 0 || grande ? k : 0.2 * k);
      manoI = mezcla([-26, 104], [-22, 58], lado < 0 || grande ? k : 0.2 * k);
      angD = -0.25 - 0.35 * (lado > 0 ? k : 0); angI = -0.25 - 0.35 * (lado < 0 ? k : 0);
      pose.cara = grande ? "sorpresa" : n % 2 ? "risa" : "guino";
    }
    // junta las jarras sobre la cabeza: ¡PROST! (el choque le quita el sombrero)
    const kJunta = eInOut(tramo(t, 5.7, 6.15));
    if (t >= 5.7 && t < 6.15) {
      manoD = mezcla([104, 104], [57, 14], kJunta); manoI = mezcla([-26, 104], [21, 14], kJunta);
      angD = lerp(-0.25, -1.95, kJunta); angI = angD;
      pose.cara = "guino"; pose.rc = -0.08 * kJunta;
      sy = 1 + 0.03 * kJunta;
    }
    if (t >= 6.15) {
      const r = Math.max(0, 1 - (t - 6.15) * 6), kV = eBack(tramo(t, 6.5, 6.85));
      manoD = mezcla([57 + 5 * r, 14 - 5 * r], [100, 36], kV); manoI = mezcla([21 - 5 * r, 14 - 5 * r], [-22, 36], kV);
      angD = lerp(-1.95 + 0.3 * r, -1.25, kV); angI = angD;
      pose.cara = t < 6.5 ? "sorpresa" : t < 7.2 ? "risa" : t < 7.45 ? "guino" : "risa";
      pose.rc = t > 6.85 ? 0.08 * Math.sin(t * 7) : 0;
      dy = t > 6.85 ? -Math.abs(Math.sin((t - 6.85) * 6.5)) * 12 * (1 - tramo(t, 8.2, 8.7)) : 0;
      if (t > 8.5) pose.cara = "guino";
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const sombreroPuesto = t < 6.15 || t >= this.T_SOMBRERO;
    pose.objD = (g, m) => { traje(g, pose, t, sombreroPuesto); ramo(g, m, angD, t, 1); };
    pose.objI = (g, m) => ramo(g, m, angI, t, -1);
    const m = matAv(this.X, PIES + dy, this.ESC, giro, sx, sy);
    return { pose, m, angD, angI, sombreroPuesto };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    // espuma que salpica en cada salto
    if (t > 1.6 && t < 5.7) {
      const b = (t - 1.6) / 0.5, n = Math.floor(b);
      this.una("salto" + n, b - n > 0.45, () => {
        for (const [mano, s] of [[e.pose.manoD, 1], [e.pose.manoI, -1]]) {
          const q = aPant(e.m, [mano[0] + s * 14, mano[1] - 14]);
          for (let i = 0; i < 5; i++) p.nueva(P.ESPUMA, q[0] + azar(-14, 14), q[1], azar(-70, 70), azar(-220, -90), azar(0.5, 0.8), azar(4, 7));
        }
        if (n % 4 === 3) temblar(5, 0.15);
      });
      if (Math.random() < 3 * dt) this.notas.push({ x: azar(60, 300) + (Math.random() < 0.5 ? 0 : 660), y: azar(330, 430), t0: t, s: azar(0.9, 1.4), col: Math.random() < 0.5 ? "#ffd34d" : "#fffdf5" });
    }
    // ¡PROST!
    this.una("prost", t > 6.15, () => {
      temblar(20, 0.55); this.flash = 0.7;
      const q = aPant(e.m, [39, -18]);
      for (let i = 0; i < 70; i++) { const a = azar(-Math.PI, 0), v = azar(150, 650); p.nueva(P.ESPUMA, q[0] + azar(-20, 20), q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.6, 1.2), azar(5, 11)); }
      for (let i = 0; i < 26; i++) { const a = azar(0, 6.283), v = azar(250, 700); p.nueva(P.CHISPA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(8, 15)); }
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.4, 260);
      for (let i = 0; i < 150; i++) p.nueva(P.CONFETI, azar(0, W), azar(-260, -10), azar(-60, 60), azar(20, 140), azar(4, 6), azar(9, 15), Math.random() < 0.55 ? 2 : 4);
      for (let i = 0; i < 30; i++) p.nueva(P.GOTA, q[0] + azar(-50, 50), q[1] + azar(-10, 10), azar(-260, 260), azar(-500, -150), 1.2, azar(3, 5));
    });
    this.una("plof", t > this.T_SOMBRERO, () => { temblar(4, 0.15); const q = aPant(e.m, [39, 0]); for (let i = 0; i < 8; i++) p.nueva(P.POLVO, q[0] + azar(-30, 30), q[1], azar(-120, 120), azar(-40, 10), 0.5, azar(14, 22)); });
    this.flash = Math.max(0, this.flash - dt * 3);
    for (const n of this.notas) n.y -= 45 * dt;
    this.notas = this.notas.filter((n) => t - n.t0 < 1.8);
    p.alfa = Math.min(1, this.luz() * 1.3);
    p.actualizar(dt);
  }
  pretzel(g, x, y, ang) {
    if (!this._pretzel) {
      const c = lienzoNuevo(150, 300), cg = c.getContext("2d");
      this.pintarPretzel(cg, 75, 220, 0);
      this._pretzel = c;
    }
    g.save(); g.translate(x, y); g.rotate(ang); g.drawImage(this._pretzel, -75, -220); g.restore();
  }
  pintarPretzel(g, x, y, ang) {
    g.save(); g.translate(x, y); g.rotate(ang);
    g.strokeStyle = "rgba(230,210,170,.6)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, -36); g.lineTo(0, -200); g.stroke();
    const tr = () => { g.beginPath(); g.moveTo(-26, 28); g.bezierCurveTo(-60, 0, -40, -46, 0, -30); g.bezierCurveTo(40, -46, 60, 0, 26, 28); g.moveTo(-26, 28); g.bezierCurveTo(-14, 10, 4, -6, 6, -30); g.moveTo(26, 28); g.bezierCurveTo(14, 10, -4, -6, -6, -30); };
    g.lineCap = "round"; g.lineJoin = "round";
    tr(); g.strokeStyle = "#4a2208"; g.lineWidth = 17; g.stroke();
    tr(); g.strokeStyle = "#a8561c"; g.lineWidth = 12; g.stroke();
    tr(); g.strokeStyle = "rgba(255,190,110,.55)"; g.lineWidth = 3.5; g.stroke();
    g.fillStyle = "#fffaf0";
    for (const [sx, sy] of [[-34, -10], [-22, -30], [30, -14], [16, -32], [-6, 6], [10, 14], [-40, 8], [38, 6]]) g.fillRect(sx, sy, 2.4, 2.4);
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), L = this.luz();
    fondo(g, "#000");
    g.save(); g.globalAlpha = L;
    g.drawImage(this.fondoC, 0, 0);
    // luz cálida en el suelo
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35 * L;
    g.drawImage(BLOB2.oro, this.X - 330, PIES - 50, 660, 100); g.restore();
    this.pretzel(g, 140, 250, 0.08 * Math.sin(t * 2.1));
    this.pretzel(g, W - 140, 250, 0.08 * Math.sin(t * 2.1 + 2));
    // banderines azules y blancos
    const balanceo = Math.sin(t * 4) * 4;
    for (let i = 0; i < 18; i++) {
      const u0 = i / 18, u1 = (i + 1) / 18;
      const a = colgando(-10, 14, W + 10, 14, 60 + balanceo, u0), b = colgando(-10, 14, W + 10, 14, 60 + balanceo, u1);
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      g.fillStyle = i % 2 ? "#f4f6fb" : AZUL;
      g.beginPath(); g.moveTo(a[0] + 3, a[1]); g.lineTo(b[0] - 3, b[1]); g.lineTo(mx, my + 44); g.closePath(); g.fill();
      if (!(i % 2)) { g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(mx - 10, my + 6); g.lineTo(mx, my + 22); g.lineTo(mx + 10, my + 6); g.stroke(); }
    }
    g.strokeStyle = "rgba(240,230,210,.6)"; g.lineWidth = 2;
    g.beginPath(); for (let i = 0; i <= 30; i++) { const q = colgando(-10, 14, W + 10, 14, 60 + balanceo, i / 30); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } g.stroke();
    // notas de la banda
    for (const n of this.notas) { const k = (t - n.t0) / 1.8; nota(g, n.x + Math.sin((t - n.t0) * 5) * 10, n.y, n.s, Math.min(1, k * 5) * (1 - k), n.col); }
    g.restore();
    // cable de las bombillas
    g.save(); g.globalAlpha = 0.5 + 0.5 * L;
    g.strokeStyle = "#3a3026"; g.lineWidth = 2;
    g.beginPath(); for (let i = 0; i <= 30; i++) { const q = colgando(-10, 70, W + 10, 70, 70, i / 30); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } g.stroke();
    g.restore();
    // el avatar (también se ilumina con las bombillas)
    pintarAvatar(g, e.m, e.pose, t);
    this.p.dibujar(g);
    if (L < 1) { g.fillStyle = `rgba(0,0,0,${1 - L})`; g.fillRect(-60, -60, W + 120, H + 120); }
    // bombillas encima de todo (lucen en la oscuridad)
    g.save();
    for (let i = 0; i < N_BOMB; i++) {
      const q = this.bombilla(i), a = this.luzBombilla(i);
      if (a <= 0) continue;
      g.fillStyle = "#3a3026"; g.fillRect(q[0] - 3, q[1] - 2, 6, 6);
      g.globalCompositeOperation = "lighter";
      g.globalAlpha = a * (0.9 + 0.1 * Math.sin(t * 13 + i));
      g.drawImage(BLOB.amarillo, q[0] - 34, q[1] - 26, 68, 68);
      g.globalCompositeOperation = "source-over";
      g.fillStyle = "#fff6cf"; g.beginPath(); g.ellipse(q[0], q[1] + 9, 5, 7, 0, 0, 6.283); g.fill();
      g.globalAlpha = 1;
    }
    g.restore();
    // ¡PROST!
    if (t > 6.15 && t < 9.3) {
      const k = tramo(t, 6.15, 6.3), s = lerp(3, 1, eIn(k)) * (1 + 0.03 * Math.sin(t * 9));
      const spr = this.rotulo();
      g.save(); g.translate(W / 2, 132); g.rotate(-0.05); g.scale(s, s);
      g.globalAlpha = Math.min(1, k * 4) * (1 - tramo(t, 8.9, 9.3));
      g.drawImage(spr, -spr.width / 2, -spr.height / 2);
      g.restore();
    }
    if (!e.sombreroPuesto) {
      // el sombrero sale volando dando vueltas y vuelve a caer en su sitio
      const u = tramo(t, 6.15, this.T_SOMBRERO), T = this.T_SOMBRERO - 6.15, s = u * T;
      const cabeza = aPant(e.m, [39, 6]);
      const y = cabeza[1] - (480 * s - 0.5 * (2 * 480 / T) * s * s);
      g.save(); g.translate(cabeza[0] + 70 * Math.sin(u * Math.PI), y); g.rotate(u * Math.PI * 4); g.scale(this.ESC, this.ESC);
      sombrero(g, t); g.restore();
    }
    if (this.flash > 0) { g.fillStyle = `rgba(255,250,225,${this.flash})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  rotulo() {
    if (cache.has("prost")) return cache.get("prost");
    const c = lienzoNuevo(640, 230), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 190);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#fff1b0"); gr.addColorStop(1, "#ffb21a");
    txt(g, "¡PROST!", 320, 178, { tam: 170, peso: 900, fam: FD, color: AZUL, esp: 6 });
    txt(g, "¡PROST!", 314, 170, { tam: 170, peso: 900, fam: FD, color: gr, borde: "#3a2200", bordeAncho: 12, esp: 6, glow: "rgba(255,200,60,.8)", glowTam: 26 });
    cache.set("prost", c);
    return c;
  }
}

registrar({ id: "00060", nombre: "Fiesta de la cerveza", crear: () => new EscenaOktober() });
})();
