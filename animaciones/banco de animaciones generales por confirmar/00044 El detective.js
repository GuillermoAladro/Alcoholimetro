"use strict";
/*
 * 00044 · EL DETECTIVE
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se abre un iris. Con gorro de detective y lupa sigue de puntillas unas huellas de espuma por el suelo; se mira por la
 * lupa (ojo gigante). Detrás de una maceta asoman dos ojitos que se esconden. ¡AJÁ! Aparta la maceta: es una jarra
 * escondida, sudando. Pega un salto del susto y la caza al vuelo: sello rojo de CASO RESUELTO. Se la bebe tan a gusto
 * y el iris se cierra sobre él.
 */
(() => {
const ESC = 1.45, KJ = 2.0 / ESC; // la jarra, un poco más grande que la normal
const PX0 = 800, PY = 538;         // maceta: centro y borde de arriba
const T_APARTA = 5.25, T_SALTA = 5.95, T_CAZA = 6.35, T_SELLO = 6.5;

class Detective extends Escena {
  constructor() {
    super(10.0);
    this.p = new Parts(260);
    this.fase = 0;
    this.fondo = pintarFondo();
    this.maceta = pintarMaceta();
    this.huellas = [];
    for (let i = 0; i < 14; i++) this.huellas.push({ x: 110 + i * 48, y: i % 2 ? 592 : 583, a: (i % 2 ? 0.12 : -0.08) });
  }
  xEn(t) {
    if (t < 2.2) return lerp(170, 400, tramo(t, 0.15, 2.2));
    if (t < 3.3) return 400;
    if (t < 4.8) return lerp(400, 600, tramo(t, 3.3, 4.8));
    return 600;
  }
  andando() { const t = this.t; return (t > 0.15 && t < 2.2) || (t > 3.3 && t < 4.8); }
  macetaX() { return PX0 + 165 * eOut(tramo(this.t, T_APARTA + 0.05, T_APARTA + 0.45)); }
  /** La jarra escondida: posición del fondo (pantalla), cuánto se agacha y si ya la tiene él. */
  jarra(e) {
    const t = this.t;
    let x = PX0 - 100, y = PIES;
    // asoma los ojos por encima de la maceta y se vuelve a esconder
    const asoma = (a, b) => eInOut(tramo(t, a, a + 0.18)) * (1 - eInOut(tramo(t, b - 0.18, b)));
    let k = Math.max(asoma(0.8, 1.75), asoma(2.45, 3.3), asoma(3.75, 4.1));
    if (t >= T_APARTA) k = eBack(tramo(t, T_APARTA + 0.08, T_APARTA + 0.28));
    y += 48 * (1 - k); x += 46 * (1 - Math.min(1, k));
    if (t >= T_SALTA && t < T_CAZA) {
      const u = tramo(t, T_SALTA, T_CAZA), q = aPant(e.m, [104, 118]);
      const fx = lerp(PX0 - 100 + 17 * 2, q[0] + 17 * 2, u), fy = lerp(PIES, q[1] + 18 * 2, u) - 150 * 4 * u * (1 - u);
      return { x: fx - 17 * 2, y: fy, giro: -0.5 * Math.sin(Math.PI * u), suelta: true };
    }
    return { x, y, giro: 0, suelta: t < T_CAZA };
  }
  estado() {
    const t = this.t, x = this.xEn(t);
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    // la lupa va en la mano izquierda; la derecha queda libre para la maceta y la jarra
    let manoD = [78, 146], manoI = [-24, 130], lAng = -0.45, sy = 0.94, dy = 0, ojo = false, delante = false;
    if (this.andando()) {
      const a = andar(this.fase, 1.5);
      pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; dy = a.bote * 0.7;
      pose.rc = 0.06 * Math.sin(this.fase * 0.5);
      pose.cara = "guino";
      manoD = [78 + 4 * Math.sin(this.fase), 146];
      manoI = [-24, 130 + 3 * Math.sin(this.fase)];
    }
    // la lupa al ojo: ojo gigante
    if (t >= 2.2 && t < 3.3) {
      const k = eInOut(tramo(t, 2.25, 2.55)) * (1 - eInOut(tramo(t, 3.05, 3.3)));
      manoI = mezcla([-24, 130], [27, 70], k); lAng = lerp(-0.45, 0, k);
      sy = lerp(0.94, 1, k);
      pose.cara = "guino"; ojo = k > 0.5; delante = k > 0.3;
      pose.rc = 0.04 * Math.sin(t * 3) * k;
    }
    // ¡AJÁ!
    if (t >= 4.8 && t < T_APARTA) {
      const k = eInOut(tramo(t, 4.8, 5.05));
      manoI = mezcla([-24, 130], [-26, 70], k); lAng = lerp(-0.45, -0.2, k); sy = lerp(0.94, 1, k);
      manoD = mezcla([78, 146], [112, 126], k);
      pose.cara = t > 4.95 ? "sorpresa" : "guino";
    }
    // aparta la maceta de un manotazo
    if (t >= T_APARTA && t < T_SALTA) {
      const k = eOut(tramo(t, T_APARTA, T_APARTA + 0.2)), v = eInOut(tramo(t, T_APARTA + 0.35, T_APARTA + 0.6));
      manoD = mezcla(mezcla([112, 126], [126, 164], k), [96, 140], v);
      manoI = [-26, 70]; lAng = -0.2;
      sy = 1; pose.cara = t < T_APARTA + 0.4 ? "risa" : "sorpresa";
    }
    // la caza al vuelo
    if (t >= T_SALTA) {
      sy = 1;
      const k = eOut(tramo(t, T_SALTA, T_CAZA - 0.05));
      manoD = mezcla([96, 140], [104, 118], k);
      manoI = mezcla([-26, 70], [-26, 118], eInOut(tramo(t, T_SALTA, T_CAZA)));
      pose.cara = t < T_CAZA ? "sorpresa" : t < 7.15 ? "guino" : "sonrisa";
      if (t > T_CAZA && t < 6.6) dy = 6 * Math.sin(Math.PI * tramo(t, T_CAZA, 6.6));
    }
    let inc = -0.15, nivel = 1;
    // se la bebe
    if (t >= 7.2) {
      const kB = eInOut(tramo(t, 7.2, 7.5)) * (1 - eInOut(tramo(t, 8.45, 8.75)));
      const kT = eInOut(tramo(t, 7.5, 8.4)) * (1 - eInOut(tramo(t, 8.45, 8.75)));
      pose.rc = -0.34 * kT + (kT > 0.05 && kT < 0.95 ? 0.02 * Math.sin(t * 40) : 0);
      inc = lerp(-0.15, -0.45, kB) - 1.15 * kT;
      const b = boca(pose.rc), r = rot2([17 * KJ, -18 * KJ], inc);
      manoD = mezcla([104, 118], [b[0] - r[0], b[1] - r[1]], kB);
      nivel = 1 - 0.85 * tramo(t, 7.6, 8.4);
      pose.cara = t > 8.3 && t < 9.0 ? "dormido" : t >= 9.0 ? "guino" : pose.cara;
      manoI = [-26 + 3 * Math.sin(t * 3), 118];
    }
    pose.manoD = manoD; pose.manoI = manoI; pose.brazoIDelante = delante;
    const conJarra = t >= T_CAZA;
    pose.objI = (g, m) => this.lupa(g, m, lAng, ojo, pose, t);
    pose.objD = (g, m) => {
      if (!delante) gorro(g, pose.rc);
      if (conJarra) { g.save(); g.translate(m[0], m[1]); g.scale(KJ, KJ); dibujarJarra(g, [0, 0], inc, nivel, "asa", t); g.restore(); }
    };
    if (delante) pose.objI = (g, m) => { gorro(g, pose.rc); this.lupa(g, m, lAng, ojo, pose, t); };
    pose.objD2 = (g, m) => {
      if (!conJarra) return;
      g.save(); g.translate(m[0], m[1]); g.scale(KJ, KJ); dibujarJarra(g, [0, 0], inc, nivel, "cuerpo", t);
      const c = rot2([17, -6], inc);
      ojitos(g, c[0], c[1], inc, t < 7.5 ? 1 : t < 8.4 ? 2 : 3, t);
      g.restore();
    };
    const mm = matAv(x, PIES + dy, ESC, 0, 1, sy);
    return { pose, m: mm, x };
  }
  lupa(g, m, ang, ojo, pose, t) {
    const c = [m[0] + Math.sin(ang) * 28, m[1] - Math.cos(ang) * 28], R = 16;
    g.save(); g.translate(m[0], m[1]); g.rotate(ang);
    g.fillStyle = "#2b1b10"; rectR(g, -2.6, -14, 5.2, 22, 2.4); g.fill();
    g.fillStyle = "#c9a227"; g.fillRect(-3, -15.5, 6, 3);
    g.restore();
    if (ojo) {
      // el ojo de detrás de la lupa, aumentado
      g.save(); g.beginPath(); g.arc(c[0], c[1], R, 0, 6.283); g.clip();
      g.fillStyle = "#e8b48f"; g.fillRect(c[0] - R, c[1] - R, R * 2, R * 2);
      g.translate(c[0], c[1]); g.scale(2.1, 2.1); g.translate(-c[0], -c[1]);
      dibujarCara(g, "sorpresa", pose.rc, {}, t);
      g.restore();
    }
    g.save();
    g.fillStyle = ojo ? "rgba(190,230,255,.12)" : "rgba(190,230,255,.22)";
    g.beginPath(); g.arc(c[0], c[1], R, 0, 6.283); g.fill();
    g.strokeStyle = "#c9a227"; g.lineWidth = 3.4; g.stroke();
    g.strokeStyle = "#7a5c10"; g.lineWidth = 1; g.beginPath(); g.arc(c[0], c[1], R + 1.8, 0, 6.283); g.stroke();
    g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = 2; g.lineCap = "round";
    g.beginPath(); g.arc(c[0], c[1], R - 4, Math.PI * 1.1, Math.PI * 1.45); g.stroke();
    g.restore();
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    if (this.andando()) this.fase += dt * 7.5;
    const e = this.estado();
    this.una("aja", t > 4.95, () => temblar(6, 0.2));
    this.una("aparta", t > T_APARTA + 0.06, () => {
      temblar(10, 0.25);
      for (let i = 0; i < 18; i++) p.nueva(P.POLVO, PX0 + azar(-60, 90), PIES - 4, azar(40, 380), azar(-60, -5), azar(0.5, 0.9), azar(22, 40));
    });
    if (t > T_APARTA + 0.4 && t < T_SALTA && Math.random() < 12 * dt) p.nueva(P.GOTA, PX0 - 100 + 34 + azar(-22, 22), PIES - azar(40, 60), azar(-60, 60), azar(-160, -60), 0.5, azar(2.5, 3.5));
    this.una("caza", t > T_CAZA, () => {
      const q = aPant(e.m, [104, 118]);
      for (let i = 0; i < 14; i++) p.nueva(P.ESPUMA, q[0] + 40, q[1] - 30, azar(-160, 160), azar(-260, -80), azar(0.4, 0.7), azar(3, 7));
    });
    this.una("sello", t > T_SELLO + 0.12, () => {
      temblar(18, 0.35);
      for (let i = 0; i < 26; i++) { const a = azar(0, 6.283), v = azar(200, 500); p.nueva(P.CHISPA, 300 + azar(-150, 150), 150, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(7, 12)); }
    });
    if (this.andando() && Math.random() < 6 * dt) p.nueva(P.ESPUMA, e.x + azar(-20, 20), PIES + 6, azar(-30, 30), azar(-60, -20), 0.4, azar(2, 4));
    p.actualizar(dt);
  }
  dibujarJarraEscondida(g, e) {
    const t = this.t, J = this.jarra(e);
    if (!J.suelta) return;
    g.save(); g.beginPath(); g.rect(-60, -60, W + 120, PIES + 60); g.clip();
    g.translate(J.x, J.y - 18 * 2); g.rotate(J.giro); g.scale(2, 2);
    dibujarJarra(g, [0, 0], 0, 1, "asa", t);
    dibujarJarra(g, [0, 0], 0, 1, "cuerpo", t);
    const susto = t > T_APARTA + 0.3;
    ojitos(g, 17, -6, 0, susto ? 1 : 0, t);
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    g.drawImage(this.fondo, 0, 0);
    // huellas de espuma (desaparecen cuando él pasa por encima… no: se quedan)
    for (const h of this.huellas) huella(g, h.x, h.y, h.a);
    // la jarra escondida, detrás de la maceta
    this.dibujarJarraEscondida(g, e);
    const mx = this.macetaX();
    g.drawImage(this.maceta, mx - 150, PY - 250);
    pintarAvatar(g, e.m, e.pose, t);
    this.p.dibujar(g);
    // gotas de sudor y ¡! de la jarra
    if (t > T_APARTA + 0.35 && t < T_SALTA + 0.2) {
      const k = tramo(t, T_APARTA + 0.35, T_APARTA + 0.45);
      g.save(); g.translate(PX0 - 66, PIES - 112); g.scale(eBack(k), eBack(k));
      txt(g, "¡!", 0, 0, { tam: 70, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a2400", bordeAncho: 7, esp: 2 });
      g.restore();
    }
    // ¡AJÁ!
    if (t > 4.95 && t < 5.9) {
      const q = aPant(e.m, [39, -12]);
      bocadillo(g, q[0] - 40, q[1] - 46, "¡AJÁ!", q[0] - 4, q[1] - 2, tramo(t, 4.95, 5.1) * (1 - tramo(t, 5.7, 5.9)), 44);
    }
    // sello CASO RESUELTO
    if (t > T_SELLO) {
      const k = tramo(t, T_SELLO, T_SELLO + 0.13), s = lerp(2.6, 1, eIn(k)), a = Math.min(1, k * 3) * (1 - tramo(t, 8.9, 9.3));
      g.save(); g.translate(310, 150); g.rotate(-0.13); g.scale(s, s); g.globalAlpha = a * 0.93;
      g.strokeStyle = "#e01d34"; g.lineWidth = 7; rectR(g, -230, -62, 460, 112, 12); g.stroke();
      g.lineWidth = 2.5; rectR(g, -219, -51, 438, 90, 8); g.stroke();
      txt(g, "CASO RESUELTO", 0, 18, { tam: 66, peso: 900, fam: FD, color: "#e01d34", esp: 4, max: 410 });
      g.restore();
    }
    // iris
    const t1 = 9.0;
    let r, c;
    if (t < 1) { r = 1250 * eOut(tramo(t, 0.12, 0.95)); c = [170, 420]; }
    else if (t < t1) { r = 2000; c = [W / 2, H / 2]; }
    else { r = 1150 * (1 - eIn(tramo(t, t1, 9.85))); c = aPant(e.m, [39, 45]); }
    if (r < 1900) {
      g.fillStyle = "#000"; g.beginPath(); g.rect(-60, -60, W + 120, H + 120);
      if (r > 0.5) { g.moveTo(c[0] + r, c[1]); g.arc(c[0], c[1], r, 0, Math.PI * 2); }
      g.fill("evenodd");
    }
  }
}
function pintarFondo() {
  const c = lienzoNuevo(W, H), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, PIES);
  gr.addColorStop(0, "#0a0f1c"); gr.addColorStop(1, "#141b2c");
  g.fillStyle = gr; g.fillRect(0, 0, W, PIES);
  // ladrillos
  g.strokeStyle = "rgba(140,160,200,.06)"; g.lineWidth = 2;
  for (let y = 0, f = 0; y < PIES; y += 30, f++) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
    for (let x = (f % 2) * 40; x < W; x += 80) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 30); g.stroke(); }
  }
  // luz de persiana
  g.save(); g.globalCompositeOperation = "lighter";
  for (let i = 0; i < 7; i++) {
    g.fillStyle = "rgba(170,190,255,.05)";
    g.beginPath(); g.moveTo(120 + i * 70, 0); g.lineTo(150 + i * 70, 0); g.lineTo(520 + i * 70, PIES); g.lineTo(480 + i * 70, PIES); g.closePath(); g.fill();
  }
  g.restore();
  const gs = g.createLinearGradient(0, PIES, 0, H);
  gs.addColorStop(0, "#1a2133"); gs.addColorStop(1, "#0b0f18");
  g.fillStyle = gs; g.fillRect(0, PIES, W, H - PIES);
  g.fillStyle = "rgba(0,0,0,.4)"; g.fillRect(0, PIES - 2, W, 3);
  return c;
}
function pintarMaceta() {
  const c = lienzoNuevo(300, 300), g = c.getContext("2d");
  g.translate(150, 250); // (0, 0) = centro del borde de arriba de la maceta
  // hojas
  const hojas = [[-20, -60, 70, 26, -0.9], [24, -70, 72, 25, 0.8], [-30, -40, 58, 21, -0.5], [55, -36, 62, 22, 0.4], [0, -110, 64, 24, -0.15], [-38, -90, 56, 20, -1.2], [40, -102, 56, 20, 1.1], [72, -10, 50, 18, 0.12]];
  g.strokeStyle = "#1d4a1d"; g.lineWidth = 5;
  for (const [x, y] of hojas) { g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(x * 0.3, y * 0.5, x * 0.6, y * 0.8); g.stroke(); }
  for (const [x, y, rx, ry, a] of hojas) {
    g.save(); g.translate(x, y); g.rotate(a);
    const gr = g.createLinearGradient(0, -ry, 0, ry);
    gr.addColorStop(0, "#5fc55a"); gr.addColorStop(1, "#1f6a24");
    g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, rx * 0.62, ry, 0, 0, 6.283); g.fill();
    g.strokeStyle = "rgba(200,255,190,.4)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-rx * 0.55, 0); g.lineTo(rx * 0.55, 0); g.stroke();
    g.restore();
  }
  // maceta (baja y ancha)
  const gm = g.createLinearGradient(-95, 0, 95, 0);
  gm.addColorStop(0, "#8a3a1a"); gm.addColorStop(0.35, "#d9743f"); gm.addColorStop(1, "#7a3214");
  g.fillStyle = gm;
  g.beginPath(); g.moveTo(-84, 8); g.lineTo(84, 8); g.lineTo(66, PIES - PY); g.lineTo(-66, PIES - PY); g.closePath(); g.fill();
  g.fillStyle = "#c8653a"; rectR(g, -94, -4, 188, 16, 4); g.fill();
  g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(-90, -2, 180, 3);
  g.fillStyle = "#3b2414"; g.beginPath(); g.ellipse(0, -2, 86, 5, 0, 0, 6.283); g.fill();
  return c;
}
function huella(g, x, y, a) {
  // pie descalzo visto desde arriba (aplastado por la perspectiva), apuntando a la derecha
  g.save(); g.translate(x, y); g.rotate(a); g.scale(1, 0.62);
  g.fillStyle = "rgba(255,250,235,.9)";
  g.beginPath(); g.ellipse(2, 0, 10, 6.5, 0, 0, 6.283); g.fill();
  g.beginPath(); g.ellipse(-9, 1, 6, 5, 0, 0, 6.283); g.fill();
  for (const [tx, ty, r] of [[15, -6, 3.2], [17, -1.5, 2.4], [16.5, 2.6, 2.1], [15, 6, 1.9], [12.5, 8.6, 1.6]]) { g.beginPath(); g.arc(tx, ty, r, 0, 6.283); g.fill(); }
  g.fillStyle = "rgba(225,215,190,.8)";
  for (const [bx, by] of [[-6, -1], [2, 2], [5, -2.5]]) { g.beginPath(); g.arc(bx, by, 1.5, 0, 6.283); g.fill(); }
  g.restore();
}
/** Ojitos de la jarra (coordenadas de la jarra). modo 0 asoma · 1 susto · 2 preocupada · 3 cerrados */
function ojitos(g, cx, cy, inc, modo, t) {
  g.save(); g.translate(cx, cy); g.rotate(inc * 0.0);
  for (const s of [-1, 1]) {
    const ox = s * 5.5;
    if (modo === 3) { g.strokeStyle = "#1a1a1a"; g.lineWidth = 1.3; g.beginPath(); g.arc(ox, -1, 3, 0.2, Math.PI - 0.2); g.stroke(); continue; }
    const r = modo === 1 ? 4.4 : 3.6;
    g.fillStyle = "#fff"; g.beginPath(); g.ellipse(ox, -2, r * 0.85, r, 0, 0, 6.283); g.fill();
    g.strokeStyle = "rgba(0,0,0,.5)"; g.lineWidth = 0.6; g.stroke();
    const mira = modo === 0 ? -1.2 + Math.sin(t * 2.5) * 1.2 : modo === 2 ? 0.8 : -1;
    g.fillStyle = "#111"; g.beginPath(); g.arc(ox + mira, -2 + (modo === 2 ? -1 : 0.4), r * 0.42, 0, 6.283); g.fill();
    if (modo === 2) { g.strokeStyle = "#3b1d08"; g.lineWidth = 1; g.beginPath(); g.moveTo(ox - 3.5, -7 + s * 1.2); g.lineTo(ox + 3.5, -7 - s * 1.2); g.stroke(); }
  }
  g.restore();
}
/** Gorro de detective de cuadros con visera (sigue el giro de la cabeza). */
function gorro(g, rc) {
  g.save(); g.translate(39, 72); g.rotate(rc); g.translate(-39, -72);
  const forma = () => { g.beginPath(); g.moveTo(7, 16); g.bezierCurveTo(6, -6, 22, -16, 39, -16); g.bezierCurveTo(56, -16, 72, -6, 71, 16); g.quadraticCurveTo(39, 10, 7, 16); g.closePath(); };
  forma();
  const gr = g.createLinearGradient(0, -16, 0, 16);
  gr.addColorStop(0, "#a8834f"); gr.addColorStop(1, "#6b4f2a");
  g.fillStyle = gr; g.fill();
  g.save(); forma(); g.clip();
  g.strokeStyle = "rgba(60,36,14,.55)"; g.lineWidth = 1.2;
  for (let x = -10; x < 90; x += 7) { g.beginPath(); g.moveTo(x, -20); g.lineTo(x + 10, 20); g.stroke(); }
  g.strokeStyle = "rgba(230,200,140,.35)";
  for (let y = -16; y < 20; y += 7) { g.beginPath(); g.moveTo(0, y); g.lineTo(80, y + 2); g.stroke(); }
  g.restore();
  forma(); g.strokeStyle = "#3e2a12"; g.lineWidth = 1.2; g.stroke();
  // visera y lazo de las orejeras
  g.fillStyle = "#5a4020"; g.beginPath(); g.ellipse(39, 15, 17, 4.5, 0, 0, Math.PI); g.fill();
  g.fillStyle = "#3e2a12"; g.beginPath(); g.ellipse(39, -15, 4, 2.6, 0, 0, 6.283); g.fill();
  g.beginPath(); g.ellipse(33, -16, 5, 2, -0.4, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(45, -16, 5, 2, 0.4, 0, 6.283); g.fill();
  g.restore();
}

registrar({ id: "00044", nombre: "El detective", crear: () => new Detective() });
})();
