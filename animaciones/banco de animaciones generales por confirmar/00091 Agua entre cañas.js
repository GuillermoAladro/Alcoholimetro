"use strict";
/*
 * 00091 · AGUA ENTRE CAÑAS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende la lámpara de la barra: él, algo perjudicado, con dos jarras vacías al lado. Le llega deslizando por la
 * barra un vaso de agua; se lo bebe de un trago y ¡FLASH!: brilla con una luz azul, se le pasa la cara de borracho y
 * saca bíceps (¡AGUA ENTRE CAÑAS!). Remate: le llega deslizando la siguiente caña y brinda. Se apaga la lámpara.
 */
(() => {
const X = 512, ESC = 1.8;
const BARRA = 424;            // altura de la superficie de la barra
const X_VASO = 578;           // dónde se para el vaso de agua
const X_CANA = 650;           // dónde se para la caña (el asa)
const textos = cacheTexto();
const aUnid = (px, py) => [39 + (px - X) / ESC, 232 - (PIES - py) / ESC]; // pantalla → unidades de avatar (sin escalar)

/** Vaso de agua con hielo (unidades de avatar), centrado en (x, y). */
function vaso(g, x, y, ang, nivel, t) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(1.2, 1.2);
  const yT = -14, yB = 13, aT = 8, aB = 6.4;
  const forma = () => { g.beginPath(); g.moveTo(-aT, yT); g.lineTo(aT, yT); g.lineTo(aB, yB); g.lineTo(-aB, yB); g.closePath(); };
  forma(); g.fillStyle = "rgba(205,232,255,.16)"; g.fill();
  const alto = (yB - yT - 3) * clamp(nivel, 0, 1);
  if (alto > 0.4) {
    g.save(); forma(); g.clip();
    const ys = yB - 1.5 - alto;
    const gr = g.createLinearGradient(0, ys, 0, yB);
    gr.addColorStop(0, "rgba(170,230,255,.95)"); gr.addColorStop(1, "rgba(40,150,230,.9)");
    g.fillStyle = gr; g.fillRect(-aT, ys, aT * 2, alto + 2);
    // hielos
    g.fillStyle = "rgba(255,255,255,.55)"; g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 0.6;
    for (const [hx, hr] of [[-2.6, 0.3], [3, -0.25]]) {
      g.save(); g.translate(hx, ys + 2.6 + Math.sin(t * 3 + hx) * 0.4); g.rotate(hr); rectR(g, -2.6, -2.6, 5.2, 5.2, 1.2); g.fill(); g.stroke(); g.restore();
    }
    g.fillStyle = "rgba(255,255,255,.75)"; g.fillRect(-aT, ys - 0.4, aT * 2, 1);
    g.restore();
  }
  forma(); g.strokeStyle = "rgba(235,248,255,.95)"; g.lineWidth = 1.3; g.stroke();
  g.fillStyle = "rgba(255,255,255,.45)"; g.fillRect(-aT + 2.2, yT + 2, 1.6, yB - yT - 5);
  g.fillStyle = "rgba(220,240,255,.6)"; g.fillRect(-aB, yB - 2.2, aB * 2, 2.2);
  g.restore();
}

/** Bíceps que se hincha sobre el brazo (S = hombro, E = codo, M = mano), en unidades de avatar. */
function biceps(g, S, E, M, k) {
  if (k <= 0.01) return;
  const mx = (S[0] + E[0]) / 2, my = (S[1] + E[1]) / 2;
  let nx = -(E[1] - S[1]), ny = E[0] - S[0];
  const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
  if (nx * (M[0] - mx) + ny * (M[1] - my) < 0) { nx = -nx; ny = -ny; }
  const ang = Math.atan2(E[1] - S[1], E[0] - S[0]);
  const cx = mx + nx * 4.5 * k, cy = my + ny * 4.5 * k;
  g.save(); g.translate(cx, cy); g.rotate(ang);
  const lado = Math.sign(-nx * Math.sin(ang) + ny * Math.cos(ang)) || 1; // hacia dónde abomba en coordenadas giradas
  const rx = 10.5 * k + 1, ry = 7 * k + 1;
  const gr = g.createRadialGradient(-2, lado * ry * 0.45, 0.5, 0, 0, rx);
  gr.addColorStop(0, "#6a6a70"); gr.addColorStop(0.6, "#3a3a3d"); gr.addColorStop(1, CAMISA);
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(0,0,0,.55)"; g.lineWidth = 1.1;
  g.beginPath(); g.ellipse(0, 0, rx, ry, 0, lado > 0 ? 0.25 : Math.PI + 0.25, lado > 0 ? Math.PI - 0.25 : 2 * Math.PI - 0.25); g.stroke();
  g.restore();
}

/** Barra del bar: superficie y frente de madera (se pinta una vez). */
function pintarBarra() {
  const c = lienzoNuevo(W, H - BARRA + 20), g = c.getContext("2d"), y0 = 0;
  const fr = g.createLinearGradient(0, 14, 0, c.height);
  fr.addColorStop(0, "#4a2d18"); fr.addColorStop(1, "#1d1109");
  g.fillStyle = fr; g.fillRect(0, 14, W, c.height);
  g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = 2;
  for (let x = 40; x < W; x += 96) { g.beginPath(); g.moveTo(x, 26); g.lineTo(x, c.height); g.stroke(); }
  g.fillStyle = "rgba(255,200,120,.06)"; g.fillRect(0, 30, W, 6);
  // barra de apoyo dorada
  const la = g.createLinearGradient(0, 128, 0, 142);
  la.addColorStop(0, "#fff1b0"); la.addColorStop(0.5, "#d3a12a"); la.addColorStop(1, "#6d4c08");
  g.fillStyle = la; g.fillRect(0, 128, W, 12);
  // superficie
  const su = g.createLinearGradient(0, y0, 0, 18);
  su.addColorStop(0, "#d2a878"); su.addColorStop(1, "#7a5232");
  g.fillStyle = su; g.fillRect(0, y0, W, 18);
  g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(0, y0, W, 2);
  return c;
}

class EscenaAgua extends Escena {
  constructor() {
    super(9.4);
    this.p = new Parts(360);
    this.barra = pintarBarra();
  }
  luz() {
    const t = this.t;
    const on = t < 0.75 ? [0, 1, 0, 0, 1, 0.35, 1][Math.min(6, Math.floor(t / 0.1))] : 1;
    const off = t > 8.55 ? (t < 8.85 ? [0.2, 0.9, 0][Math.min(2, Math.floor((t - 8.55) / 0.1))] : 0) : 1;
    return on * off;
  }
  azul() { return tramo(this.t, 3.95, 4.05) * (1 - 0.65 * tramo(this.t, 6.3, 7.0)); }
  xVaso(t) { return t < 0.9 ? 1150 : lerp(1150, X_VASO, eOut(tramo(t, 0.9, 1.45))); }
  xCana(t) { return t < 6.0 ? 1200 : lerp(1200, X_CANA, eOut(tramo(t, 6.0, 6.5))); }
  estado() {
    const t = this.t;
    const pose = { cara: "borracho", rc: 0.05 * Math.sin(t * 2.3), piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], sx = 1, sy = 1 + 0.006 * Math.sin(t * 3);
    const V = aUnid(X_VASO, BARRA - 15.6 * ESC);
    let nivel = 1, angV = 0;
    if (t > 1.5 && t < 1.75) pose.cara = "sorpresa";
    // coge el vaso, se lo bebe y lo deja
    const kCoge = eInOut(tramo(t, 1.75, 2.05));
    const kBoca = eInOut(tramo(t, 2.05, 2.35)) * (1 - eInOut(tramo(t, 3.35, 3.6)));
    const kTrago = eInOut(tramo(t, 2.35, 3.3)) * (1 - eInOut(tramo(t, 3.35, 3.6)));
    const kDeja = eInOut(tramo(t, 3.6, 3.85));
    if (t > 1.75 && t < 3.95) {
      manoD = mezcla([70, 158], V, kCoge);
      if (t > 2.05) {
        pose.rc = -0.36 * kTrago + (kTrago > 0.05 && kTrago < 0.95 ? 0.02 * Math.sin(t * 40) : 0);
        angV = -0.3 * kBoca - 1.5 * kTrago;
        const b = boca(pose.rc), tope = rot2([0, -16.5], angV);
        const P0 = [62, 118];
        manoD = mezcla(V, P0, eInOut(tramo(t, 2.05, 2.2)));
        if (kBoca > 0) manoD = mezcla(manoD, [b[0] - tope[0] + 2, b[1] - tope[1] + 1], kBoca);
        if (t > 3.6) manoD = mezcla(P0, V, kDeja);
        if (t > 3.85) manoD = mezcla(V, [70, 158], eInOut(tramo(t, 3.85, 3.95)));
      }
      nivel = 1 - tramo(t, 2.45, 3.25);
      if (t > 3.3 && t < 3.62) pose.cara = "dormido"; // ¡ah!
      if (t < 3.85) pose.objD = (g, m) => vaso(g, m[0], m[1] - 1, angV, nivel, t);
    }
    // ¡flash azul!: bíceps
    let kFlex = 0;
    if (t >= 3.95) {
      pose.cara = t < 4.2 ? "sorpresa" : Math.floor((t - 4.2) * 1.6) % 2 ? "risa" : "guino";
      kFlex = eBack(tramo(t, 4.05, 4.35)) * (1 - eInOut(tramo(t, 6.3, 6.6)));
      const bombeo = t > 4.6 ? 3 * Math.sin((t - 4.6) * 7) : 0;
      manoD = mezcla([70, 158], [93, 50 + bombeo], kFlex);
      manoI = mezcla([9, 160], [-15, 50 + bombeo], kFlex);
      if (kFlex > 0.2) pose.brazoIDelante = true;
      sy *= 1 + 0.03 * kFlex; sx *= 1 + 0.03 * kFlex;
      const kB = eElastico(tramo(t, 4.25, 4.9)) * (1 + 0.12 * Math.sin((t - 4.6) * 7) * (t > 4.6 ? 1 : 0)) * (1 - eInOut(tramo(t, 6.3, 6.55)));
      pose.objD2 = (g, m) => { const b = ik(RIG.hombroD, pose.manoD, RIG.L1, RIG.L2); biceps(g, RIG.hombroD, b.E, m, kB); };
      pose.objI2 = (g, m) => { const b = ik(RIG.hombroI2, pose.manoI, RIG.L1I, RIG.L2I, -1); biceps(g, RIG.hombroI2, b.E, m, kB); };
    }
    // llega la siguiente caña: la coge y brinda
    if (t >= 6.3) {
      const C = aUnid(X_CANA, BARRA - 18 * ESC);
      if (t < 6.75) pose.cara = "sorpresa";
      else pose.cara = t > 7.75 && t < 8.2 ? "guino" : "risa";
      if (t >= 6.6) {
        manoD = mezcla([70, 158], C, eInOut(tramo(t, 6.6, 6.9)));
        if (t > 6.95) manoD = mezcla(C, [94, 72], eBack(tramo(t, 6.95, 7.35)));
        if (t > 6.9) pose.jarra = { inc: -0.22 * eInOut(tramo(t, 6.95, 7.35)) + 0.04 * Math.sin(t * 5) * tramo(t, 7.35, 7.6), nivel: 0.92 };
      }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    return { pose, m: matAv(X, PIES, ESC, 0, sx, sy), kFlex };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("llegaVaso", t > 1.45, () => p.nueva(P.DESTELLO, X_VASO + 6, BARRA - 30, 0, 0, 0.35, 60));
    // gotas que se escapan al beber
    if (t > 2.45 && t < 3.25 && Math.random() < 0.3) {
      const q = aPant(this.estado().m, boca(-0.3));
      p.nueva(P.ESPUMA, q[0] - 8, q[1] + 6, azar(-50, 10), azar(-40, 20), 0.6, azar(2, 3.5));
    }
    this.una("flash", t > 3.95, () => {
      temblar(16, 0.5);
      const c = [X, PIES - 120 * ESC];
      p.nueva(P.DESTELLO, c[0], c[1], 0, 0, 0.5, 420);
      for (let i = 0; i < 40; i++) { const a = azar(0, 6.283), v = azar(200, 620); p.nueva(P.ESPUMA, c[0], c[1] - 40, Math.cos(a) * v, Math.sin(a) * v - 120, azar(0.5, 1.0), azar(4, 9)); }
    });
    if (this.azul() > 0.4 && Math.random() < 50 * dt) {
      const lado = Math.random() < 0.5 ? -1 : 1;
      p.nueva(P.ELECTRICA, X + lado * azar(40, 120), azar(220, 440), azar(-20, 20), azar(-140, -60), azar(0.4, 0.8), azar(10, 20));
    }
    this.una("titulo", t > 4.35, () => temblar(10, 0.3));
    this.una("bicepsD", t > 4.3, () => {
      const e = this.estado();
      for (const pt of [[104, 78], [-26, 78]]) { const q = aPant(e.m, pt); p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.3, 60); }
    });
    this.una("llegaCana", t > 6.5, () => temblar(4, 0.15));
    this.una("brinda", t > 7.35, () => {
      const q = aPant(this.estado().m, [112, 50]);
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.35, 80);
      for (let i = 0; i < 12; i++) p.nueva(P.ESPUMA, q[0], q[1], azar(-120, 120), azar(-260, -80), azar(0.4, 0.7), azar(3, 6));
    });
    p.alfa = 1 - tramo(t, 8.6, 9.0);
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), luz = this.luz(), az = this.azul();
    fondo(g, "#000");
    // lámpara colgante y su luz
    const LX = X, LY = 70;
    if (luz > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = luz * (1 - 0.5 * az);
      const cono = g.createLinearGradient(0, LY, 0, BARRA);
      cono.addColorStop(0, "rgba(255,214,150,.30)"); cono.addColorStop(1, "rgba(255,214,150,.05)");
      g.fillStyle = cono; g.beginPath(); g.moveTo(LX - 40, LY); g.lineTo(LX + 40, LY); g.lineTo(LX + 260, BARRA); g.lineTo(LX - 260, BARRA); g.closePath(); g.fill();
      g.globalAlpha = 0.8 * luz; g.drawImage(BLOB.amarillo, LX - 60, LY - 20, 120, 60);
      g.restore();
    }
    g.strokeStyle = "#202226"; g.lineWidth = 3; g.beginPath(); g.moveTo(LX, -10); g.lineTo(LX, LY - 34); g.stroke();
    const pa = g.createLinearGradient(LX - 44, 0, LX + 44, 0);
    pa.addColorStop(0, "#0d3b2a"); pa.addColorStop(0.5, "#1f8a5c"); pa.addColorStop(1, "#0b3022");
    g.fillStyle = pa; g.beginPath(); g.moveTo(LX - 12, LY - 36); g.lineTo(LX + 12, LY - 36); g.lineTo(LX + 44, LY); g.lineTo(LX - 44, LY); g.closePath(); g.fill();
    g.fillStyle = luz > 0.5 ? "#fff3cf" : "#4d4a40"; g.beginPath(); g.ellipse(LX, LY, 40, 6, 0, 0, 6.283); g.fill();
    // brillo azul detrás de él
    const cy = PIES - 140 * ESC;
    if (az > 0) {
      g.save(); g.globalCompositeOperation = "lighter";
      g.globalAlpha = 0.75 * az * (0.85 + 0.15 * Math.sin(t * 23));
      g.drawImage(BLOB2.cian, X - 260, cy - 300, 520, 560);
      g.globalAlpha = 0.5 * az;
      g.drawImage(BLOB2.cian, X - 520, BARRA - 60, 1040, 120);
      for (let i = 0; i < 3; i++) {
        const u = ((t * 0.9 + i / 3) % 1);
        g.strokeStyle = `rgba(140,225,255,${0.5 * az * (1 - u)})`; g.lineWidth = 4;
        g.beginPath(); g.ellipse(X, cy - 20, 90 + u * 200, 150 + u * 200, 0, 0, 6.283); g.stroke();
      }
      g.restore();
    }
    pintarAvatar(g, e.m, e.pose, t);
    if (az > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.16 * az;
      g.drawImage(BLOB2.cian, X - 140, cy - 240, 280, 420); g.restore();
    }
    // la barra (le tapa de cintura para abajo), jarras vacías, el vaso y la caña
    g.drawImage(this.barra, 0, BARRA);
    const jarraEn = (x, nivel) => { g.save(); g.translate(x, BARRA - 18 * ESC); g.scale(ESC, ESC); dibujarJarra(g, [0, 0], 0, nivel, "asa", t); dibujarJarra(g, [0, 0], 0, nivel, "cuerpo", t); g.restore(); };
    jarraEn(150, 0); jarraEn(236, 0);
    // restos de espuma en las vacías
    g.fillStyle = "rgba(255,250,235,.55)";
    for (const jx of [150, 236]) for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(jx + 12 + i * 10, BARRA - 46 + (i % 2) * 8, 3, 0, 6.283); g.fill(); }
    const vasoVisible = t < 1.75 || t > 3.85;
    if (vasoVisible) {
      const xv = this.xVaso(t), bamb = t > 1.45 && t < 1.9 ? 0.12 * Math.sin((t - 1.45) * 30) * (1 - tramo(t, 1.45, 1.9)) : 0;
      g.save(); g.translate(xv, BARRA - 15.6 * ESC); g.scale(ESC, ESC); vaso(g, 0, 0, bamb, t > 3.85 ? 0 : 1, t); g.restore();
      if (t > 0.9 && t < 1.45) {
        g.save(); g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 3; g.lineCap = "round";
        for (let i = 0; i < 3; i++) { const ly = BARRA - 14 - i * 14; g.beginPath(); g.moveTo(xv + 26, ly); g.lineTo(xv + 26 + azar(50, 110), ly); g.stroke(); }
        g.restore();
      }
    }
    if (t > 6.0 && t < 6.9) {
      const xc = this.xCana(t);
      jarraEn(xc, 0.92);
      if (t < 6.5) {
        g.save(); g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 3; g.lineCap = "round";
        for (let i = 0; i < 3; i++) { const ly = BARRA - 14 - i * 16; g.beginPath(); g.moveTo(xc + 60, ly); g.lineTo(xc + 60 + azar(50, 110), ly); g.stroke(); }
        g.restore();
      }
    }
    this.p.dibujar(g);
    // brillos de los bíceps
    if (e.kFlex > 0.5 && t < 6.3) {
      for (const [pt, f] of [[[104, 74], 0], [[-26, 74], 1.7]]) {
        const q = aPant(e.m, pt);
        brillo(g, q[0], q[1], 26 * (0.6 + 0.4 * Math.abs(Math.sin(t * 5 + f))), 0.9);
      }
    }
    // ¡AGUA ENTRE CAÑAS!
    if (t > 4.35) {
      const k = tramo(t, 4.35, 4.5), s = lerp(2.6, 1, eIn(k)) * (1 + 0.02 * Math.sin(t * 6)), a = Math.min(1, k * 4) * (1 - tramo(t, 8.5, 8.9));
      const tit = this.titulo();
      if (a > 0 && tit) { g.save(); g.globalAlpha = a; g.translate(W / 2, 92); g.scale(s, s); g.drawImage(tit, -tit.width / 2, -tit.height / 2); g.restore(); }
    }
    // empieza y acaba a oscuras (la lámpara)
    const osc = Math.max(t < 0.75 ? 0.97 * (1 - luz) : 0, t > 8.55 ? Math.max(0.97 * (1 - luz), tramo(t, 8.8, 9.35)) : 0);
    if (osc > 0) { g.fillStyle = `rgba(0,0,0,${osc})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (textos.has(1)) return textos.get(1);
    const c = lienzoNuevo(1000, 170), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 130);
    gr.addColorStop(0, "#f2fdff"); gr.addColorStop(0.55, "#7fdcff"); gr.addColorStop(1, "#1d8fe0");
    txt(g, "¡AGUA ENTRE CAÑAS!", 500, 122, { tam: 92, peso: 400, fam: FB, color: gr, borde: "#06233d", bordeAncho: 12, esp: 2, glow: "rgba(80,200,255,.85)", glowTam: 26, max: 950 });
    textos.set(1, c);
    return c;
  }
}

registrar({ id: "00091", nombre: "Agua entre cañas", crear: () => new EscenaAgua() });
})();
