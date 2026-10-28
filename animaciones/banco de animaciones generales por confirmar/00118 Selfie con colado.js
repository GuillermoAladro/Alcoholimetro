"use strict";
/*
 * 00118 · SELFIE CON COLADO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Rodrigo se hace selfies con un palo y en cada uno Guillermo se cuela en el último instante: con el pulgar arriba,
 * haciéndole cuernos de puntillas y asomando de un salto por encima de su cabeza. Rodrigo mira cada foto, se lleva el
 * susto y lo busca… hasta que lo pilla. Se ríen y se hacen uno juntos: la foto se queda en una polaroid. ¡SELFIE!
 */
(() => {
const ESC = 1.5, XR = 580;
const ZONA = { x: 320, y: 175, w: 440, h: 300 };   // lo que sale en la foto
const FLASH = [2.0, 4.0, 6.05, 8.35];
const MONTON = [[150, 118, -0.1], [178, 132, 0.07], [206, 116, -0.03]];
const PIEL = "#f1c3a0", PIEL_B = "#b9825d";
const cache = cacheTexto();

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const u = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return lerp(k[i - 1][1], k[i][1], (k[i][2] || eInOut)(u)); }
  return k[k.length - 1][1];
}
// Rodrigo con el palo en alto (1) o mirando el móvil (0)
const POSA = [[0, 0], [0.9, 0], [1.25, 1], [2.2, 1], [2.5, 0], [3.2, 0], [3.5, 1], [4.2, 1], [4.5, 0], [5.15, 0], [5.45, 1], [6.25, 1], [6.55, 0], [7.45, 0], [7.8, 1]];
// Guillermo: x de los pies
const GX = [[0, -120], [1.45, -120], [1.75, 440, eOut], [2.15, 440], [2.45, -120, eIn],
  [3.45, -120], [3.8, 510, eOut], [4.15, 510], [4.45, -120, eIn],
  [5.35, -120], [5.7, 548, eOut], [6.95, 548], [7.35, 430, eOut]];

/** Puño con el pulgar arriba (unidades del avatar, en la mano). */
function pulgar(g, m) {
  g.save(); g.translate(m[0], m[1] - 2);
  g.fillStyle = PIEL; g.strokeStyle = PIEL_B; g.lineWidth = 1.2;
  rectR(g, -2.4, -16, 5.6, 14, 2.8); g.fill(); g.stroke();
  rectR(g, -6, -5, 12, 10, 4); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-5, -1); g.lineTo(5, -1); g.moveTo(-5, 2); g.lineTo(5, 2); g.stroke();
  g.restore();
}
/** Dos dedos en V (los cuernos). */
function cuernos(g, m) {
  g.save(); g.translate(m[0], m[1]);
  g.fillStyle = PIEL; g.strokeStyle = PIEL_B; g.lineWidth = 1.2;
  for (const a of [-0.3, 0.3]) { g.save(); g.rotate(a); rectR(g, -3, -26, 6, 24, 3); g.fill(); g.stroke(); g.restore(); }
  rectR(g, -7, -6, 14, 12, 5); g.fill(); g.stroke();
  g.restore();
}
/** Palo de selfie con el móvil (de espaldas: se ve la tapa con la cámara). */
function palo(g, m, ang, largo) {
  const fx = m[0] + Math.cos(ang) * largo, fy = m[1] + Math.sin(ang) * largo;
  g.save(); g.lineCap = "round";
  g.strokeStyle = "#1a1a1e"; g.lineWidth = 3.4; g.beginPath(); g.moveTo(m[0], m[1]); g.lineTo(fx, fy); g.stroke();
  g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 1; g.beginPath(); g.moveTo(m[0] + 0.8, m[1] - 0.8); g.lineTo(fx + 0.8, fy - 0.8); g.stroke();
  g.fillStyle = "#26262b"; rectR(g, m[0] - 2.5, m[1] - 8, 5, 12, 2); g.fill();
  g.translate(fx, fy); g.rotate(ang + Math.PI / 2 + 0.25);
  const gr = g.createLinearGradient(-9, 0, 9, 0);
  gr.addColorStop(0, "#3b3f4a"); gr.addColorStop(0.5, "#7d8496"); gr.addColorStop(1, "#2c2f38");
  g.fillStyle = gr; rectR(g, -9, -17, 18, 32, 3.5); g.fill();
  g.strokeStyle = "#15161a"; g.lineWidth = 1; g.stroke();
  g.fillStyle = "#15161a"; rectR(g, -6, -14, 7, 9, 2); g.fill();
  g.fillStyle = "#3c6aa8"; g.beginPath(); g.arc(-3.2, -11.6, 1.6, 0, 6.283); g.arc(-3.2, -7.4, 1.6, 0, 6.283); g.fill();
  g.restore();
  return [fx, fy];
}
function fondoPared() {
  const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
  g.translate(60, 60);
  g.fillStyle = "#24120c"; g.fillRect(-60, -60, W + 120, PIES + 60);
  const sr = semilla(118);
  for (let r = 0, y = -60; y < PIES; r++, y += 30) {
    for (let x = -60 - (r % 2) * 40; x < W + 60; x += 80) {
      const v = 0.75 + sr() * 0.35;
      g.fillStyle = `rgb(${Math.round(92 * v)},${Math.round(42 * v)},${Math.round(30 * v)})`;
      rectR(g, x + 2, y + 2, 76, 26, 3); g.fill();
      g.fillStyle = "rgba(255,200,170,.08)"; g.fillRect(x + 4, y + 3, 72, 3);
    }
  }
  // luz cálida en el centro y bordes oscuros
  const v = g.createRadialGradient(W / 2, 300, 120, W / 2, 300, 680);
  v.addColorStop(0, "rgba(255,170,90,.10)"); v.addColorStop(0.5, "rgba(0,0,0,.35)"); v.addColorStop(1, "rgba(0,0,0,.85)");
  g.fillStyle = v; g.fillRect(-60, -60, W + 120, H + 120);
  const gs = g.createLinearGradient(0, PIES, 0, H + 60);
  gs.addColorStop(0, "#2c1a10"); gs.addColorStop(1, "#0c0704");
  g.fillStyle = gs; g.fillRect(-60, PIES, W + 120, H + 60 - PIES);
  g.fillStyle = "rgba(255,200,150,.12)"; g.fillRect(-60, PIES, W + 120, 2);
  // guirnalda de bombillas
  g.strokeStyle = "#0d0d0d"; g.lineWidth = 2.5;
  g.beginPath();
  for (let x = -60; x <= W + 60; x += 8) { const y = 26 + 34 * Math.pow(Math.sin(((x + 60) / (W + 120)) * Math.PI), 1) ; x === -60 ? g.moveTo(x, y) : g.lineTo(x, y); }
  g.stroke();
  return c;
}
function bombillas() {
  const r = [];
  for (let x = -20; x <= W + 20; x += 64) r.push([x, 26 + 34 * Math.sin(((x + 60) / (W + 120)) * Math.PI) + 10]);
  return r;
}
function titulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(700, 200), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 150);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#ffd0e4"); gr.addColorStop(1, "#ff3d84");
  txt(g, "¡SELFIE!", 350, 150, { tam: 142, peso: 900, fam: FD, color: "#5a0a2a", esp: 6 });
  txt(g, "¡SELFIE!", 350, 142, { tam: 142, peso: 900, fam: FD, color: gr, borde: "#5a0a2a", bordeAncho: 11, esp: 6, glow: "rgba(255,61,132,.85)", glowTam: 26 });
  cache.set("t", c);
  return c;
}
/** Foto con marco blanco (polaroid apaisada). k: 0 sin marco → 1 con marco. */
function tarjeta(g, foto, cx, cy, w, rot, k = 1, pie = null) {
  const h = (w * ZONA.h) / ZONA.w, m = w * 0.04 * k, mb = w * (pie ? 0.12 : 0.09) * k;
  g.save(); g.translate(cx, cy); g.rotate(rot);
  g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = 16 * k; g.shadowOffsetY = 6 * k;
  g.fillStyle = "#f6f2e8"; g.fillRect(-w / 2 - m, -h / 2 - m, w + 2 * m, h + m + mb);
  g.shadowColor = "transparent"; g.shadowBlur = 0; g.shadowOffsetY = 0;
  g.drawImage(foto, -w / 2, -h / 2, w, h);
  if (pie && k > 0.5) txt(g, pie, 0, h / 2 + mb * 0.7, { tam: Math.round(w * 0.055), peso: 400, fam: FB, color: "#3a2a6a", alfa: tramo(k, 0.5, 1), esp: 1 });
  g.restore();
}

class Selfie extends Escena {
  constructor() {
    super(11.0);
    this.p = new Parts(260);
    this.fondo = null; this.fotos = []; this.enFoto = false; this.bombillas = bombillas();
  }
  estado(t) {
    const R = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoI: [9, 157] };
    const G = { cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoI: [9, 160], manoD: [70, 158] };
    // Rodrigo y el palo
    const kP = pista(t, POSA);
    R.manoD = mezcla([90, 102], [100, 50], kP);
    const ang = lerp(-1.3, -0.85, kP), largo = lerp(52, 95, kP);
    R.objD = (g, m) => { if (!this.enFoto) this._movil = palo(g, m, ang, largo); };
    // caras de Rodrigo
    if (t < 1.25) R.cara = "sonrisa";
    else if (t < 2.3) R.cara = t > 1.6 ? "guino" : "sonrisa";
    else if (t < 3.3) { R.cara = t < 2.95 ? "sorpresa" : "guino"; R.rc = t < 2.95 ? 0.16 * tramo(t, 2.3, 2.5) : -0.24 * Math.sin((t - 2.95) * 9); }
    else if (t < 4.3) R.cara = "sonrisa";
    else if (t < 5.25) { R.cara = t < 4.9 ? "sorpresa" : "guino"; R.rc = t < 4.9 ? 0.16 * tramo(t, 4.3, 4.5) : 0.25 * Math.sin((t - 4.9) * 10); }
    else if (t < 6.3) R.cara = "guino";
    else if (t < 7.0) { R.cara = "sorpresa"; R.rc = 0.16 * tramo(t, 6.3, 6.5); }
    else if (t < 7.45) { R.cara = "sorpresa"; R.rc = -0.28 * eOut(tramo(t, 7.0, 7.12)); }
    else { R.cara = "risa"; R.rc = -0.1 * (1 - tramo(t, 7.6, 7.9)); }
    if (t >= 7.45 && t < 7.9) R.manoI = mezcla([9, 157], [-16, 104 + 6 * Math.sin(t * 22)], Math.sin(tramo(t, 7.45, 7.9) * Math.PI));
    // Guillermo
    const gx = pista(t, GX);
    let gy = PIES, gesc = ESC, sy = 1, vis = gx > -100;
    const corre = (t > 1.45 && t < 1.75) || (t > 2.15 && t < 2.45) || (t > 3.45 && t < 3.8) || (t > 4.15 && t < 4.45) || (t > 5.35 && t < 5.7) || (t > 7.0 && t < 7.35);
    if (corre) { const a = andar(t * 26, 1.4); G.piernaI = a.piernaI; G.piernaD = a.piernaD; gy += a.bote; G.cara = "risa"; }
    if (t > 1.6 && t < 2.3) { // pulgar arriba al lado
      const k = eOut(tramo(t, 1.62, 1.8)) * (1 - eIn(tramo(t, 2.12, 2.25)));
      G.manoD = mezcla([70, 158], [90, 64], k); G.rc = 0.14 * k; G.cara = "risa";
      if (k > 0.3) G.objD2 = (g, m) => pulgar(g, m);
    }
    if (t > 3.45 && t < 4.45) { // cuernos de puntillas, por detrás
      gesc = 1.45;
      const k = eOut(tramo(t, 3.68, 3.86)) * (1 - eIn(tramo(t, 4.1, 4.22)));
      gy -= 26 * k; sy = 1 + 0.04 * k;
      G.manoD = mezcla([70, 158], [86, 14], k); G.cara = k > 0.5 ? "guino" : "risa"; G.rc = 0.1 * k;
      G.piernaI = mezcla(G.piernaI, [-4, 0.04], k); G.piernaD = mezcla(G.piernaD, [-4, -0.04], k);
      if (k > 0.4) G.objD2 = (g, m) => cuernos(g, m);
    }
    if (t > 5.35) { // salta por detrás y asoma por encima
      gesc = t < 6.95 ? 1.45 : lerp(1.45, ESC, tramo(t, 6.95, 7.35));
      const agacha = eInOut(tramo(t, 5.7, 5.82)) * (1 - tramo(t, 5.82, 5.86));
      const salto = t > 5.84 && t < 6.42 ? Math.sin(((t - 5.84) / 0.58) * Math.PI) : 0;
      sy = 1 - 0.16 * agacha + 0.05 * salto;
      gy -= 128 * Math.pow(salto, 0.7);
      if (t > 5.84 && t < 6.42) { G.cara = "risa"; G.manoD = [92, 120]; G.manoI = [-14, 120]; G.piernaI = [0, 0.12 * salto]; G.piernaD = [0, -0.12 * salto]; }
      if (t > 6.42 && t < 7.0) { G.cara = "guino"; sy = 1 - 0.1 * Math.sin(tramo(t, 6.42, 6.6) * Math.PI); }
      if (t >= 7.0 && t < 7.45) { G.cara = "sorpresa"; G.rc = 0.12; }
      if (t >= 7.45) {
        G.cara = "risa"; G.rc = 0.1 * eOut(tramo(t, 7.6, 7.8));
        const k = eOut(tramo(t, 7.75, 8.0));
        G.manoD = mezcla([70, 158], [90, 64], k);
        if (k > 0.3) G.objD2 = (g, m) => pulgar(g, m);
      }
    }
    const mG = matAv(gx, gy, gesc, 0, 1, sy);
    const mR = matAv(XR, PIES, ESC);
    return { G, R, mG, mR, vis, kP };
  }
  foto(t) {
    const e = this.estado(t), c = lienzoNuevo(ZONA.w, ZONA.h), g = c.getContext("2d");
    g.drawImage(this.fondo, ZONA.x + 60, ZONA.y + 60, ZONA.w, ZONA.h, 0, 0, ZONA.w, ZONA.h);
    g.save(); g.translate(-ZONA.x, -ZONA.y);
    this.enFoto = true;
    if (e.vis) pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mR, e.R, t);
    this.enFoto = false;
    g.restore();
    const gr = g.createRadialGradient(ZONA.w * 0.55, ZONA.h * 0.4, 30, ZONA.w / 2, ZONA.h / 2, ZONA.w * 0.7);
    gr.addColorStop(0, "rgba(255,255,255,.16)"); gr.addColorStop(0.6, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(0,0,0,.45)");
    g.fillStyle = gr; g.fillRect(0, 0, ZONA.w, ZONA.h);
    return c;
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    if (!this.fondo) this.fondo = fondoPared();
    FLASH.forEach((tf, i) => this.una("flash" + i, t >= tf, () => {
      this.fotos.push(this.foto(t));
      temblar(i === 3 ? 10 : 4, 0.2);
      const q = this._movil ? aPant(matAv(XR, PIES, ESC), this._movil) : [764, 195];
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.35, 180);
      if (i === 3) for (let k = 0; k < 80; k++) p.nueva(P.CONFETI, azar(80, 940), azar(-60, -10), azar(-60, 60), azar(40, 160), azar(2.4, 3.2), azar(9, 15), k % 5);
    }));
    // polvo al entrar corriendo
    const e = this.estado(t);
    if (((t > 1.45 && t < 1.75) || (t > 3.45 && t < 3.8) || (t > 5.35 && t < 5.7)) && Math.random() < 30 * dt) {
      const q = aPant(e.mG, [39, 230]);
      p.nueva(P.POLVO, q[0] - 20, PIES - 6, azar(-160, -40), azar(-40, -5), azar(0.4, 0.7), azar(18, 30));
    }
    p.alfa = 1 - tramo(t, 10.3, 10.9);
    p.actualizar(dt);
  }
  visor(g, t) {
    // esquinas del encuadre mientras posa
    const k = this.estado(t).kP;
    let a = 0;
    for (const tf of FLASH) a = Math.max(a, tramo(t, tf - 0.6, tf - 0.4) * (1 - tramo(t, tf + 0.05, tf + 0.25)));
    a *= k;
    if (a <= 0.01) return;
    const { x, y, w, h } = ZONA, L = 34;
    g.save(); g.globalAlpha = a * 0.85; g.strokeStyle = "#fffdf5"; g.lineWidth = 4; g.lineCap = "round";
    for (const [cx, cy, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) {
      g.beginPath(); g.moveTo(cx, cy + sy * L); g.lineTo(cx, cy); g.lineTo(cx + sx * L, cy); g.stroke();
    }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(t);
    fondo(g, "#000");
    if (!this.fondo) this.fondo = fondoPared();
    g.drawImage(this.fondo, -60, -60);
    // bombillas
    g.save(); g.globalCompositeOperation = "lighter";
    this.bombillas.forEach(([x, y], i) => {
      const a = 0.75 + 0.25 * Math.sin(t * 3 + i * 1.7);
      g.globalAlpha = 0.5 * a; g.drawImage(BLOB2.oro, x - 26, y - 22, 52, 52);
      g.globalAlpha = a; g.drawImage(BLOB.amarillo, x - 7, y - 4, 14, 16);
    });
    g.restore();
    // las fotos ya hechas, en un montón
    const final = t > FLASH[3];
    this.fotos.slice(0, 3).forEach((f, i) => {
      const tf = FLASH[i], [px, py, pr] = MONTON[i];
      const u1 = eOut(tramo(t, tf + 0.1, tf + 0.4)), u2 = eInOut(tramo(t, tf + 1.0, tf + 1.4));
      const mv = this._movilP || [764, 195];
      let x = lerp(mv[0], 806, u1), y = lerp(mv[1], 112, u1), w = lerp(40, 230, u1), r = 0.06 * u1;
      x = lerp(x, px, u2); y = lerp(y, py, u2); w = lerp(w, 170, u2); r = lerp(r, pr, u2);
      g.save(); g.globalAlpha = final ? 1 - tramo(t, FLASH[3] + 0.1, FLASH[3] + 0.5) : 1;
      tarjeta(g, f, x, y, w, r);
      g.restore();
    });
    if (e.vis) pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mR, e.R, t);
    if (this._movil) this._movilP = aPant(e.mR, this._movil);
    this.visor(g, t);
    if (!final) this.p.dibujar(g);
    // ¡CLIC!
    FLASH.slice(0, 3).forEach((tf) => {
      const d = t - tf;
      if (d > 0 && d < 0.7) {
        const q = this._movilP || [764, 195];
        g.save(); g.translate(q[0] + 70, q[1] - 40); g.rotate(0.12); const s = eBack(tramo(d, 0, 0.12)); g.scale(s, s);
        txt(g, "¡CLIC!", 0, 0, { tam: 44, peso: 400, fam: FC, color: "#fffdf5", borde: "#5a0a2a", bordeAncho: 7, alfa: 1 - tramo(d, 0.5, 0.7), esp: 2 });
        g.restore();
      }
    });
    // la foto final se queda en una polaroid
    if (final && this.fotos[3]) {
      const d = t - FLASH[3], k = eInOut(tramo(d, 0.15, 0.75));
      g.save(); g.globalAlpha = 0.78 * tramo(d, 0.1, 0.5); g.fillStyle = "#000"; g.fillRect(-60, -60, W + 120, H + 120); g.restore();
      const cx = lerp(ZONA.x + ZONA.w / 2, 512, k), cy = lerp(ZONA.y + ZONA.h / 2, 352, k), w = lerp(ZONA.w, 500, k);
      tarjeta(g, this.fotos[3], cx, cy, w, -0.045 * k, k, "GUILLERMO Y RODRIGO");
      if (d > 0.55) {
        const dd = d - 0.55, kt = tramo(dd, 0, 0.18), s = lerp(2.3, 1, eIn(kt)) * (1 + 0.02 * Math.sin(dd * 7));
        const spr = titulo();
        g.save(); g.globalAlpha = Math.min(1, kt * 3); g.translate(512, 92); g.rotate(-0.05); g.scale(s, s);
        g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
      }
      this.p.dibujar(g);
    }
    // destello del flash
    for (const tf of FLASH) {
      const d = t - tf;
      if (d >= 0 && d < 0.3) { g.fillStyle = `rgba(255,255,255,${0.85 * (1 - d / 0.3)})`; g.fillRect(-60, -60, W + 120, H + 120); }
    }
    // entra con un iris y sale fundiendo
    const r = 760 * eOut(tramo(t, 0.02, 0.7));
    if (r < 750) { g.save(); g.fillStyle = "#000"; g.beginPath(); g.rect(-60, -60, W + 120, H + 120); g.arc(XR, 300, Math.max(0.1, r), 0, 6.283, true); g.fill(); g.restore(); }
    const a = tramo(t, 10.3, 10.95);
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00118", nombre: "Selfie con colado", crear: () => new Selfie() });
})();
