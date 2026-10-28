"use strict";
/*
 * 00081 · FUTBOLÍN
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se abre un iris sobre un futbolín visto desde arriba; él está detrás, con las manos en las barras. Cae la bola,
 * la para con el medio, la pasa a la delantera y, con el pelo de punta, gira las barras como un molinillo: la bola
 * sale disparada, rebota en la banda y entra. Fogonazo en la portería, ¡GOLAZO! y celebra con los brazos arriba.
 * El iris se cierra sobre su cara.
 */
(() => {
const ESC = 1.42, AX = 558, AY = 386;               // avatar detrás de la mesa (pies escondidos)
const MESA = { x0: 92, x1: 932, y0: 292, y1: 592 }; // marco de madera
const CAMPO = { x0: 118, x1: 906, y0: 318, y1: 566 }; // tapete
const CY = 442;                                     // eje de las porterías
const BARRAS = [
  { x: 187, eq: 0, n: 1, sep: 0 }, { x: 280, eq: 0, n: 2, sep: 124 }, { x: 373, eq: 1, n: 3, sep: 80 },
  { x: 465, eq: 0, n: 5, sep: 48 }, { x: 558, eq: 1, n: 5, sep: 48 }, { x: 651, eq: 0, n: 3, sep: 80 },
  { x: 744, eq: 1, n: 2, sep: 124 }, { x: 836, eq: 1, n: 1, sep: 0 },
];
const EQ = [{ cam: "#22c652", osc: "#0d6b2a", luz: "#9dffb6" }, { cam: "#e0383e", osc: "#7a1014", luz: "#ffb0b0" }];
const RB = 10; // radio de la bola

function lienzoMesa() {
  const c = lienzoNuevo(W, H), g = c.getContext("2d");
  // sombra
  g.fillStyle = "rgba(0,0,0,.6)"; rectR(g, MESA.x0 + 10, MESA.y0 + 14, MESA.x1 - MESA.x0, MESA.y1 - MESA.y0, 18); g.fill();
  // marco de madera
  const gm = g.createLinearGradient(0, MESA.y0, 0, MESA.y1);
  gm.addColorStop(0, "#8a5426"); gm.addColorStop(0.5, "#6a3c18"); gm.addColorStop(1, "#4a280e");
  g.fillStyle = gm; rectR(g, MESA.x0, MESA.y0, MESA.x1 - MESA.x0, MESA.y1 - MESA.y0, 18); g.fill();
  g.strokeStyle = "#2a1406"; g.lineWidth = 3; g.stroke();
  g.strokeStyle = "rgba(255,210,150,.25)"; g.lineWidth = 2; rectR(g, MESA.x0 + 5, MESA.y0 + 5, MESA.x1 - MESA.x0 - 10, MESA.y1 - MESA.y0 - 10, 14); g.stroke();
  // porterías (huecos en el marco)
  for (const x of [MESA.x0 + 2, CAMPO.x1]) {
    g.fillStyle = "#0a0a0a"; g.fillRect(x, CY - 48, CAMPO.x0 - MESA.x0 - 2, 96);
    g.fillStyle = "rgba(255,255,255,.12)";
    for (let k = 0; k < 6; k++) g.fillRect(x, CY - 44 + k * 17, CAMPO.x0 - MESA.x0 - 2, 1.5);
  }
  // tapete
  const gc = g.createLinearGradient(0, CAMPO.y0, 0, CAMPO.y1);
  gc.addColorStop(0, "#2a8c45"); gc.addColorStop(1, "#1c6b33");
  g.fillStyle = gc; g.fillRect(CAMPO.x0, CAMPO.y0, CAMPO.x1 - CAMPO.x0, CAMPO.y1 - CAMPO.y0);
  g.fillStyle = "rgba(255,255,255,.035)";
  for (let x = CAMPO.x0; x < CAMPO.x1; x += 70) g.fillRect(x, CAMPO.y0, 35, CAMPO.y1 - CAMPO.y0);
  // líneas
  g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = 3;
  g.strokeRect(CAMPO.x0 + 6, CAMPO.y0 + 6, CAMPO.x1 - CAMPO.x0 - 12, CAMPO.y1 - CAMPO.y0 - 12);
  g.beginPath(); g.moveTo(512, CAMPO.y0 + 6); g.lineTo(512, CAMPO.y1 - 6); g.stroke();
  g.beginPath(); g.arc(512, CY, 46, 0, 6.283); g.stroke();
  g.fillStyle = "rgba(255,255,255,.8)"; g.beginPath(); g.arc(512, CY, 4, 0, 6.283); g.fill();
  for (const [x, s] of [[CAMPO.x0 + 6, 1], [CAMPO.x1 - 6, -1]]) {
    g.strokeRect(Math.min(x, x + s * 70), CY - 80, 70, 160);
    g.strokeRect(Math.min(x, x + s * 30), CY - 46, 30, 92);
  }
  // sombra interior del marco
  const gs = g.createLinearGradient(0, CAMPO.y0, 0, CAMPO.y0 + 22);
  gs.addColorStop(0, "rgba(0,0,0,.45)"); gs.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gs; g.fillRect(CAMPO.x0, CAMPO.y0, CAMPO.x1 - CAMPO.x0, 22);
  // topes de goma donde las barras atraviesan el marco
  for (const b of BARRAS) {
    g.fillStyle = "#1a1a1a";
    rectR(g, b.x - 9, MESA.y0 - 2, 18, CAMPO.y0 - MESA.y0 + 4, 4); g.fill();
    rectR(g, b.x - 9, CAMPO.y1 - 2, 18, MESA.y1 - CAMPO.y1 + 4, 4); g.fill();
  }
  return c;
}

function lienzoBola() {
  const c = lienzoNuevo(40, 40), g = c.getContext("2d");
  g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(23, 24, 11, 9, 0, 0, 6.283); g.fill();
  const gr = g.createRadialGradient(17, 16, 1, 20, 20, 11);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.7, "#f1efe6"); gr.addColorStop(1, "#b9b5a8");
  g.fillStyle = gr; g.beginPath(); g.arc(20, 20, RB + 1, 0, 6.283); g.fill();
  return c;
}

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (t <= k[i][0]) { const u = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return lerp(k[i - 1][1], k[i][1], (k[i][2] || eInOut)(u)); }
  }
  return k[k.length - 1][1];
}

// desplazamiento de cada barra (px) a lo largo del tiempo
const DESPL = [
  [[0, 0]], [[0, 0], [2.2, 0], [2.6, 10], [3.2, 0]], [[0, 0], [1.6, 0], [2.0, -20], [2.6, 14], [3.1, 0]],
  [[0, 0], [1.45, 0], [2.2, -72]],                          // medio verde: arrastra la bola hasta el hueco
  [[0, 0], [2.0, 0], [2.3, 6], [2.9, 0]],
  [[0, 0], [1.8, 0], [2.3, -24]],                           // delantera verde
  [[0, -30]], [[0, 0], [4.62, 0], [4.8, 78, eOut], [5.6, 60]], // el portero rojo llega tarde
];

class Futbolin extends Escena {
  constructor() {
    super(9.4);
    this.p = new Parts(400);
    this.mesa = lienzoMesa(); this.bola = lienzoBola();
    this.gol = -1; this.estela = [];
    this.luzFondo = lienzoNuevo(W, H);
    const gf = this.luzFondo.getContext("2d");
    gf.fillStyle = "#000"; gf.fillRect(0, 0, W, H); gf.globalAlpha = 0.28; gf.drawImage(BLOB2.oroClaro, 60, 120, 900, 560);
    this.titulo();
  }
  dy(i, t) { return pista(t, DESPL[i]); }
  /** Giro de cada barra (rad): 0 = muñecos de pie; el molinillo de las dos barras verdes. */
  giro(i, t) {
    if (i === 3) {
      if (t > 2.22 && t < 2.72) {
        const u = (t - 2.22) / 0.5;
        return u < 0.5 ? -0.9 * eOut(u / 0.5) : u < 0.65 ? lerp(-0.9, 1.0, (u - 0.5) / 0.15) : lerp(1.0, 0, eInOut((u - 0.65) / 0.35));
      }
      if (t > 4.2) return this.vueltas(t);
    }
    if (i === 5) {
      if (t > 2.72 && t < 4.2) return -0.55 * eOut(tramo(t, 2.72, 2.9)) + 0.05 * Math.sin(t * 40) * tramo(t, 3.3, 4.1);
      if (t > 4.2) return this.vueltas(t) - 0.55;
    }
    if (i === 7 && t > 4.66 && t < 5.2) return 0.5 * Math.sin((t - 4.66) * 30) * (1 - tramo(t, 4.66, 5.2));
    return 0;
  }
  /** El molinillo: acelera de golpe, sigue mientras las sujeta y, al soltarlas, se frenan y se balancean. */
  vueltas(t) {
    const W0 = 44, T1 = 0.7, D = 1.5, s = t - 4.2;
    const f1 = (x) => W0 * (x - (1 - Math.exp(-12 * x)) / 12);
    if (s <= T1) return f1(s);
    const u = Math.min(s - T1, D), fin = f1(T1) + W0 * (D - D / 2);
    if (s - T1 < D) return f1(T1) + W0 * (u - (u * u) / (2 * D));
    const k = Math.round(fin / 6.283) * 6.283, r = s - T1 - D;
    return k + (fin - k) * Math.exp(-r * 2.5) * Math.cos(r * 9);
  }
  vel(i, t) { return Math.abs(this.giro(i, t + 0.01) - this.giro(i, t)) / 0.01; }
  posBola(t) {
    if (t < 0.55) return null;
    if (t < 1.4) { const u = eOut(tramo(t, 0.55, 1.4)); return [lerp(512, 479, u), lerp(CAMPO.y0 + 4, 490, u) - 22 * Math.abs(Math.sin(u * Math.PI * 2.5)) * (1 - u)]; }
    if (t < 2.5) return [479, 490 + this.dy(3, t)];
    if (t < 2.8) { const u = eOut(tramo(t, 2.5, 2.8)); return [lerp(479, 638, u), 418]; }
    if (t < 4.45) return [638, 418];
    // el tiro: banda de abajo y dentro
    const A = [638, 418], B = [792, CAMPO.y1 - RB - 2], C = [CAMPO.x1 + 22, CY + 10];
    const l1 = Math.hypot(B[0] - A[0], B[1] - A[1]), l2 = Math.hypot(C[0] - B[0], C[1] - B[1]);
    const d = (t - 4.45) * 1900;
    if (d < l1) return mezcla(A, B, d / l1);
    if (d < l1 + l2) return mezcla(B, C, (d - l1) / l2);
    return null;
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    const yI = 145 + this.dy(3, t) / ESC, yD = 145 + this.dy(5, t) / ESC;
    let manoI = [-26.5, yI], manoD = [104.5, yD], y = AY, sy = 1;
    if (t > 1.45 && t < 2.3) pose.cara = "guino";
    if (t > 2.9 && t < 4.2) { pose.cara = "guino"; pose.rc = 0.04 * Math.sin(t * 45) * tramo(t, 3.3, 4.1); }
    // molinillo
    if (t > 4.2 && t < 4.95) {
      const w = (t - 4.2) * 26;
      manoI = [manoI[0] + Math.cos(w) * 6, manoI[1] + Math.sin(w) * 6];
      manoD = [manoD[0] + Math.cos(w + 1.5) * 6, manoD[1] + Math.sin(w + 1.5) * 6];
      pose.cara = "sorpresa"; pose.rc = 0.05 * Math.sin(t * 50);
    }
    pose.puntas = 0.85 * eBack(tramo(t, 4.2, 4.45)) * (1 - tramo(t, 5.6, 6.6));
    // ¡gol! brazos arriba
    if (t > 4.85) {
      const k = eOut(tramo(t, 4.85, 5.2)), b = Math.sin((t - 4.85) * 11) * 6;
      manoD = mezcla(manoD, [96, 14 + b], k); manoI = mezcla(manoI, [-18, 14 - b], k);
      pose.cara = "risa"; pose.rc = 0.08 * Math.sin(t * 5);
      y = AY - Math.abs(Math.sin((t - 4.95) * 6.5)) * 18 * tramo(t, 4.95, 5.1) * (1 - tramo(t, 7.4, 7.8));
    }
    pose.manoI = manoI; pose.manoD = manoD;
    return { pose, m: matAv(AX, y, ESC, 0, 1, sy) };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("cae", t > 0.62, () => { temblar(3, 0.15); });
    this.una("chuta", t > 4.45, () => { temblar(10, 0.25); p.nueva(P.DESTELLO, 645, 418, 0, 0, 0.25, 90); });
    const b = this.posBola(t);
    if (t > 4.45 && b) { this.estela.push([b[0], b[1]]); if (this.estela.length > 9) this.estela.shift(); }
    this.una("banda", t > 4.45 + 210 / 1900, () => { temblar(6, 0.15); for (let i = 0; i < 10; i++) p.nueva(P.CHISPA, 792, CAMPO.y1 - 2, azar(-150, 250), azar(-300, -80), azar(0.2, 0.45), azar(6, 10)); });
    this.una("gol", t > 4.45 && !b, () => {
      this.gol = t; this.estela = [];
      temblar(24, 0.6);
      p.nueva(P.DESTELLO, CAMPO.x1 + 12, CY, 0, 0, 0.5, 300);
      for (let i = 0; i < 46; i++) { const a = azar(Math.PI * 0.5, Math.PI * 1.5), v = azar(250, 750); p.nueva(P.CHISPA, CAMPO.x1 + 10, CY + azar(-40, 40), Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.9), azar(8, 15)); }
      for (let i = 0; i < 160; i++) p.nueva(P.CONFETI, azar(0, W), azar(-280, -10), azar(-60, 60), azar(40, 140), azar(4, 6.5), azar(9, 15), (Math.random() * 5) | 0);
    });
    if (t > 4.2 && t < 4.95 && Math.random() < 30 * dt) {
      const e = this.estado();
      for (const mn of [e.pose.manoI, e.pose.manoD]) { const q = aPant(e.m, mn); p.nueva(P.CHISPA, q[0], q[1] - 10, azar(-200, 200), azar(-260, -60), azar(0.2, 0.4), azar(5, 9)); }
    }
    p.actualizar(dt);
  }
  /** Muñecos de una barra vistos desde arriba: piernas (según el giro), cuerpo; la cabeza va aparte. */
  munecos(g, b, i, t, parte) {
    const dy = this.dy(i, t), ph = this.giro(i, t), c = EQ[b.eq], v = this.vel(i, t);
    for (let j = 0; j < b.n; j++) {
      const y = CY + (j - (b.n - 1) / 2) * b.sep + dy;
      if (parte === "cabeza") {
        g.fillStyle = "#3b2414"; g.beginPath(); g.arc(b.x, y, 10, 0, 6.283); g.fill();
        g.fillStyle = "rgba(255,220,180,.35)"; g.beginPath(); g.arc(b.x - 3, y - 3, 3.6, 0, 6.283); g.fill();
        continue;
      }
      if (v > 14) {
        // girando a toda velocidad: un disco borroso
        g.fillStyle = c.cam; g.globalAlpha = 0.35;
        g.beginPath(); g.ellipse(b.x, y, 36, 19, 0, 0, 6.283); g.fill();
        g.globalAlpha = 0.7; g.strokeStyle = c.luz; g.lineWidth = 2.5;
        g.beginPath(); g.ellipse(b.x, y, 36, 19, 0, ph % 6.283, (ph % 6.283) + 1.2); g.stroke();
        g.globalAlpha = 1;
      }
      const L = 36 * Math.sin(ph);
      if (Math.abs(L) > 1) {
        g.fillStyle = "#151515"; rectR(g, Math.min(b.x, b.x + L), y - 7, Math.abs(L), 14, 5); g.fill();
        g.fillStyle = c.osc; rectR(g, Math.min(b.x, b.x + L * 0.6), y - 9, Math.abs(L * 0.6), 18, 6); g.fill();
      }
      g.fillStyle = c.cam; rectR(g, b.x - 12, y - 18, 24, 36, 9); g.fill();
      g.strokeStyle = c.osc; g.lineWidth = 2.5; g.stroke();
      g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(b.x - 8, y - 14, 3, 28);
    }
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    g.drawImage(this.luzFondo, 0, 0); // luz de la lámpara sobre la mesa
    // empuñaduras (las de su lado, arriba)
    for (const i of [0, 1, 3, 5]) {
      const b = BARRAS[i], dy = this.dy(i, t), ph = this.giro(i, t);
      g.fillStyle = "#c9ced3"; g.fillRect(b.x - 4, 250 + dy, 8, 50);
      g.fillStyle = "#121212"; rectR(g, b.x - 11, 222 + dy, 22, 64, 8); g.fill();
      g.fillStyle = "rgba(255,255,255,.18)";
      for (let k = 0; k < 4; k++) { const yy = 230 + dy + ((k * 15 + ph * 9) % 60 + 60) % 60; g.fillRect(b.x - 10, yy, 20, 3); }
    }
    pintarAvatar(g, e.m, e.pose, t);
    g.drawImage(this.mesa, 0, 0);
    for (let i = 0; i < BARRAS.length; i++) this.munecos(g, BARRAS[i], i, t, "cuerpo");
    // la bola (y su estela en el tiro)
    const bp = this.posBola(t);
    if (this.estela.length > 1) {
      g.save(); g.globalCompositeOperation = "lighter"; g.lineCap = "round";
      for (let k = 1; k < this.estela.length; k++) {
        g.strokeStyle = `rgba(255,240,190,${(k / this.estela.length) * 0.7})`; g.lineWidth = 14 * (k / this.estela.length);
        g.beginPath(); g.moveTo(this.estela[k - 1][0], this.estela[k - 1][1]); g.lineTo(this.estela[k][0], this.estela[k][1]); g.stroke();
      }
      g.restore();
    }
    if (bp) g.drawImage(this.bola, bp[0] - 20, bp[1] - 20);
    // barras de acero
    for (let i = 0; i < BARRAS.length; i++) {
      const b = BARRAS[i], dy = this.dy(i, t);
      g.fillStyle = "#8d949a"; g.fillRect(b.x - 3, MESA.y0 - 6, 6, H + 40);
      g.fillStyle = "#e6eaee"; g.fillRect(b.x - 1.5, MESA.y0 - 6, 1.5, H + 40);
    }
    for (let i = 0; i < BARRAS.length; i++) this.munecos(g, BARRAS[i], i, t, "cabeza");
    // flechas de giro del molinillo
    if (t > 4.2 && t < 5.4) {
      const a = tramo(t, 4.2, 4.3) * (1 - tramo(t, 5.0, 5.4));
      g.save(); g.globalAlpha = a; g.strokeStyle = "#fffdf5"; g.lineWidth = 5; g.lineCap = "round";
      for (const i of [3, 5]) {
        const x = BARRAS[i].x, yy = 250 + this.dy(i, t), r0 = (t * 14) % 6.283;
        for (const s of [0, Math.PI]) { g.beginPath(); g.ellipse(x, yy, 30, 12, 0, r0 + s, r0 + s + 1.9); g.stroke(); }
      }
      g.restore();
    }
    // fogonazo en la portería
    const kG = this.gol > 0 ? t - this.gol : -1;
    if (kG > 0 && kG < 0.8) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 1 - kG / 0.8;
      g.drawImage(BLOB.blanco, CAMPO.x1 - 90, CY - 130, 220, 260); g.restore();
    }
    this.p.dibujar(g);
    // ¡GOLAZO!
    if (kG > 0.05) {
      const k = tramo(kG, 0.05, 0.22), s = lerp(2.8, 1, eIn(k)) * (1 + 0.035 * Math.sin(kG * 9));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(500, 455); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // iris: se abre sobre la mesa y se cierra sobre su cara
    let r = 1e4, cx = 512, cy = 440;
    if (t < 0.6) r = 760 * eIn(tramo(t, 0, 0.6));
    if (t > 8.25) { const q = aPant(e.m, [39, 42]); cx = q[0]; cy = q[1]; const k = tramo(t, 8.25, 9.05); r = k < 0.65 ? lerp(760, 95, eOut(k / 0.65)) : lerp(95, 0, eIn((k - 0.65) / 0.35)); }
    if (r < 1e3) {
      g.save(); g.fillStyle = "#000"; g.beginPath(); g.rect(-60, -60, W + 120, H + 120);
      if (r > 0.5) { g.moveTo(cx + r, cy); g.arc(cx, cy, r, 0, Math.PI * 2); }
      g.fill("evenodd"); g.restore();
    }
  }
  titulo() {
    if (this._tit) return this._tit;
    const c = lienzoNuevo(720, 230), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 50, 0, 165);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡GOLAZO!", 360, 165, { tam: 150, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 12, esp: 4, glow: "rgba(255,190,40,.85)", glowTam: 28 });
    return (this._tit = c);
  }
}

registrar({ id: "00081", nombre: "Futbolín", crear: () => new Futbolin() });
})();
