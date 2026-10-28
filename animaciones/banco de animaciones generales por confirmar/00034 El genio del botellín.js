"use strict";
/*
 * 00034 · EL GENIO DEL BOTELLÍN
 *
 * Animación del banco. Empieza y acaba en negro.
 * Frota un botellín (destellos), salta la chapa y sale humo azul que sube en espiral: aparece el genio, un clon azul
 * y translúcido que flota con la cola de humo metida en el botellín. Chasquea los dedos (¡CHAS!) y aparecen tres
 * cañas, una por deseo (1, 2, 3): ¡TRES DESEOS! El genio se despide y vuelve al botellín en espiral (la chapa se
 * cierra sola) y él brinda con una caña.
 */
(() => {
const X = 290, ESC = 1.55;
const GX = 700, GY = 548, GESC = 1.7;   // el genio (pies, que no se ven)
const CANAS = [[430, 330], [520, 285], [610, 330]];
const T_CANA = [4.75, 5.0, 5.25];
const OW = 300, OH = 470, OX = 150, OY = 450; // lienzo del genio
const cache = cacheTexto();

let _azul = null;
function humoAzul() {
  if (_azul) return _azul;
  const c = lienzoNuevo(64, 64), x = c.getContext("2d");
  const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(120,190,255,1)"); gr.addColorStop(0.5, "rgba(70,130,255,.5)"); gr.addColorStop(1, "rgba(50,90,255,0)");
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  return (_azul = c);
}
function titulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(900, 170), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 30, 0, 130);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#ffe58a"); gr.addColorStop(1, "#ffb21f");
  txt(g, "¡TRES DESEOS!", 450, 122, { tam: 112, peso: 900, fam: FD, color: gr, borde: "#0c2a6b", bordeAncho: 11, esp: 5, glow: "rgba(80,150,255,.95)", glowTam: 30 });
  cache.set("t", c);
  return c;
}
/** Botellín marrón; (x, y) = la mano (lo coge por la panza). Unidades de avatar. */
function botellin(g, x, y, chapa, luz) {
  g.save(); g.translate(x, y);
  const gr = g.createLinearGradient(-6, 0, 6, 0);
  gr.addColorStop(0, "#2a1204"); gr.addColorStop(0.35, "#7a3a0c"); gr.addColorStop(0.55, "#b8641e"); gr.addColorStop(1, "#2a1204");
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(-6, 9); g.lineTo(-6, -10); g.quadraticCurveTo(-6, -16, -2.3, -19); g.lineTo(-2.3, -28); g.lineTo(2.3, -28); g.lineTo(2.3, -19);
  g.quadraticCurveTo(6, -16, 6, -10); g.lineTo(6, 9); g.quadraticCurveTo(0, 11, -6, 9); g.closePath(); g.fill();
  g.fillStyle = "#f3e2b8"; g.fillRect(-6, -6, 12, 9);
  g.fillStyle = "#c0392b"; g.fillRect(-6, -3.4, 12, 3.2);
  g.fillStyle = "rgba(255,255,255,.4)"; g.fillRect(-4, -14, 1.3, 20);
  if (chapa) { g.fillStyle = "#e7b416"; g.fillRect(-2.9, -30.5, 5.8, 3); g.fillStyle = "#fff2a8"; g.fillRect(-2.9, -30.5, 5.8, 0.9); }
  g.restore();
  if (luz > 0) brillo(g, x - 3, y - 12, 7 * luz, luz);
}
/** Caña; (x, y) = donde se coge. Unidades de avatar. */
function cana(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const vaso = () => { g.beginPath(); g.moveTo(-6, 6); g.lineTo(-7.5, -24); g.lineTo(7.5, -24); g.lineTo(6, 6); g.closePath(); };
  vaso(); g.fillStyle = "rgba(210,230,255,.2)"; g.fill();
  g.save(); vaso(); g.clip();
  const gr = g.createLinearGradient(0, 6, 0, -18);
  gr.addColorStop(0, "#c46a00"); gr.addColorStop(1, "#ffc21f");
  g.fillStyle = gr; g.fillRect(-8, -18, 16, 24);
  g.restore();
  g.fillStyle = "#fffaf0"; g.beginPath(); g.moveTo(-7.5, -17);
  for (let i = 0; i <= 3; i++) g.arc(-7.5 + i * 5, -19, 3 + (i % 2) * 0.8, Math.PI, 0);
  g.lineTo(7.5, -17); g.closePath(); g.fill();
  vaso(); g.strokeStyle = "rgba(235,245,255,.9)"; g.lineWidth = 1.2; g.stroke();
  g.fillStyle = "rgba(255,255,255,.4)"; g.fillRect(-5, -15, 1.4, 18);
  g.restore();
}

class EscenaGenio extends Escena {
  constructor() {
    super(9.8);
    this.p = new Parts(260);
    this.humo = []; // humo azul propio: { x, y, vx, vy, v, vm, s }
    this.chapa = null; this._c = null;
  }
  lienzo() { if (!this._c) { this._c = lienzoNuevo(OW, OH); this._g = this._c.getContext("2d"); } return this._g; }
  cuello(e) { return aPant(e.m, [e.pose._manoD ? e.pose._manoD[0] : 58, (e.pose._manoD ? e.pose._manoD[1] : 124) - 38]); }
  /** Aparición del genio (0–1) y vuelta a la botella (0–1). */
  kGenio(t) { return eOut(tramo(t, 2.75, 3.5)); }
  kVuelta(t) { return eIn(tramo(t, 7.0, 7.75)); }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    let manoD = [58, 124], manoI = [9, 160], giro = 0;
    // frota el botellín
    const kF = eInOut(tramo(t, 0.35, 0.6)) * (1 - eInOut(tramo(t, 1.95, 2.15)));
    manoI = mezcla(manoI, [44 + 7 * Math.sin(t * 13), 113 + 2 * Math.cos(t * 13)], kF);
    if (t > 0.4 && t < 2.0) pose.cara = "guino";
    // ¡sale el genio!: se echa para atrás
    const kAtras = eInOut(tramo(t, 2.1, 2.4)) * (1 - eInOut(tramo(t, 4.0, 4.4)));
    giro = -0.07 * kAtras;
    if (t >= 2.05 && t < 4.4) { pose.cara = "sorpresa"; manoI = mezcla(manoI, [-8, 92], kAtras); }
    if (t >= 4.4) pose.cara = "risa";
    // coge una caña con la mano izquierda y brinda
    if (t >= 6.3) manoI = mezcla([9, 160], [6, 118], eInOut(tramo(t, 6.3, 6.6)));
    if (t >= 7.9) { manoI = mezcla([6, 118], [-14, 60], eBack(tramo(t, 7.9, 8.25))); pose.cara = t > 8.3 ? "guino" : "risa"; }
    if (t > 6.9 && t < 7.9) pose.cara = "sorpresa";
    if (t >= 6.62) pose.objI2 = (g, mm) => cana(g, mm[0] - 1, mm[1] - 2);
    pose.manoD = manoD; pose.manoI = manoI;
    const chapa = t < 2.05 || t > 7.82;
    const luz = t > 0.5 && t < 2.0 ? Math.pow(Math.max(0, Math.sin(t * 13)), 8) : 0;
    pose.objD2 = (g, mm) => { g.save(); g.translate(mm[0], mm[1] - 2); g.scale(1.25, 1.25); botellin(g, 0, 0, chapa, luz); g.restore(); };
    const m = matAv(X, PIES, ESC, giro);
    return { pose, m };
  }
  estadoGenio() {
    const t = this.t;
    const pose = { cara: "risa", rc: 0.04 * Math.sin(t * 2), piernaI: [0, 0.1], piernaD: [0, -0.1], brazoIDelante: true };
    // brazos cruzados; luego chasquea los dedos; luego dice adiós
    let manoD = [30, 122], manoI = [50, 120];
    const kCh = eInOut(tramo(t, 4.0, 4.3)) * (1 - eInOut(tramo(t, 5.5, 5.8)));
    manoD = mezcla(manoD, [86, 44 + (t > 4.55 && t < 4.65 ? 6 : 0)], kCh);
    manoI = mezcla(manoI, [-6, 140], kCh);
    if (t > 4.45 && t < 4.75) pose.cara = "guino";
    const kAd = eInOut(tramo(t, 6.2, 6.45));
    if (kAd > 0) { manoD = mezcla(manoD, [92 + 8 * Math.sin(t * 16), 50], kAd); pose.cara = "guino"; }
    pose.manoD = manoD; pose.manoI = manoI;
    return pose;
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    if (t > 0.5 && t < 2.0 && Math.random() < 10 * dt) { const q = aPant(e.m, [58, 112]); p.nueva(P.PURPURINA, q[0] + azar(-12, 12), q[1] + azar(-30, 10), azar(-30, 30), azar(-40, 0), azar(0.4, 0.8), azar(5, 9)); }
    // ¡salta la chapa!
    this.una("chapa", t > 2.05, () => {
      const q = aPant(e.m, [58, 84]);
      this.chapa = { x: q[0], y: q[1], vx: -160, vy: -620, r: 0 };
      temblar(8, 0.25);
      for (let i = 0; i < 20; i++) p.nueva(P.ELECTRICA, q[0], q[1], azar(-160, 160), azar(-260, -40), azar(0.3, 0.6), azar(8, 16));
    });
    if (this.chapa && t < 7.5) { const c = this.chapa; c.vy += 1500 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.r += 14 * dt; if (c.y > PIES - 4) { c.y = PIES - 4; c.vy *= -0.4; c.vx *= 0.6; c.r *= 0.9; } }
    // la chapa vuelve sola a su sitio
    if (this.chapa && t >= 7.5) {
      const c = this.chapa; if (!c.x0) { c.x0 = c.x; c.y0 = c.y; c.r0 = c.r; }
      const k = eInOut(tramo(t, 7.5, 7.82)), q = aPant(e.m, [58, 84]);
      const P1 = [520, 110]; c.x = (1 - k) * (1 - k) * c.x0 + 2 * (1 - k) * k * P1[0] + k * k * q[0]; c.y = (1 - k) * (1 - k) * c.y0 + 2 * (1 - k) * k * P1[1] + k * k * q[1]; c.r = lerp(c.r0, Math.round(c.r0 / 6.283) * 6.283 + 12.566, k);
      if (t > 7.82) this.chapa = null;
    }
    // humo azul: sale del cuello en espiral hacia el genio
    const sale = t > 2.05 && t < 4.2 ? 1 : t > 6.95 && t < 7.8 ? 0.6 : 0;
    if (sale) {
      const q = this.cuello(e);
      const n = Math.round(70 * dt * (t < 3.0 ? 1 : 0.5) + Math.random());
      for (let i = 0; i < n && this.humo.length < 220; i++) {
        const vida = azar(0.9, 1.5);
        this.humo.push({ x: q[0] + azar(-3, 3), y: q[1], vx: azar(-30, 30), vy: azar(-260, -160), v: vida, vm: vida, s: azar(14, 24), f: azar(0, 6.283) });
      }
    }
    for (const h of this.humo) {
      h.v -= dt;
      // se van hacia el genio con remolino
      const dx = GX - h.x, dy = 380 - h.y;
      h.vx += (dx * 1.2 + Math.cos(t * 3 + h.f) * 120) * dt; h.vy += (dy * 0.6 + Math.sin(t * 3 + h.f) * 120) * dt;
      h.vx *= 1 - 1.1 * dt; h.vy *= 1 - 1.1 * dt;
      h.x += h.vx * dt; h.y += h.vy * dt; h.s += 26 * dt;
    }
    this.humo = this.humo.filter((h) => h.v > 0);
    // chasquido y las tres cañas
    this.una("chas", t > 4.6, () => {
      temblar(6, 0.2);
      const q = aPant(matAv(GX, GY, GESC), [92, 36]);
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.3, 110);
      for (let i = 0; i < 16; i++) { const a = azar(0, 6.283), v = azar(120, 320); p.nueva(P.ELECTRICA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.25, 0.5), azar(8, 14)); }
    });
    T_CANA.forEach((tc, i) => this.una("cana" + i, t > tc, () => {
      const [x, y] = CANAS[i];
      p.nueva(P.DESTELLO, x, y - 20, 0, 0, 0.35, 120);
      for (let k = 0; k < 14; k++) { const a = azar(0, 6.283), v = azar(60, 200); this.humo.push({ x, y: y - 20, vx: Math.cos(a) * v, vy: Math.sin(a) * v, v: 0.6, vm: 0.6, s: azar(16, 26), f: 0, suelto: true }); }
      for (let k = 0; k < 10; k++) p.nueva(P.PURPURINA, x + azar(-20, 20), y - azar(0, 50), azar(-40, 40), azar(-60, 0), azar(0.5, 0.9), azar(6, 10));
    }));
    this.una("titulo", t > 5.4, () => temblar(14, 0.35));
    this.una("cierra", t > 7.82, () => { const q = aPant(e.m, [58, 84]); p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.3, 80); temblar(5, 0.15); });
    this.una("brinda", t > 8.15, () => { const q = aPant(e.m, [-14, 34]); for (let k = 0; k < 14; k++) p.nueva(P.ESPUMA, q[0], q[1], azar(-140, 140), azar(-240, -60), azar(0.4, 0.7), azar(4, 8)); });
    p.actualizar(dt);
  }
  /** Dónde está cada caña (las tres vuelan hacia él: una a la mano, dos al suelo). */
  posCana(i, t) {
    const [x, y] = CANAS[i];
    const flota = [x, y + 6 * Math.sin(t * 2.6 + i * 1.3)];
    const k = eInOut(tramo(t, 6.2 + i * 0.08, 6.65 + i * 0.08));
    if (k <= 0) return { p: flota, s: 2.0 };
    if (i === 1) {
      const e = this.estado(), h = aPant(e.m, e.pose._manoI || e.pose.manoI);
      return { p: mezcla(flota, [h[0] - 1.5, h[1] - 3], k), s: lerp(2.0, ESC, k), oculta: t >= 6.62 };
    }
    const dest = [i === 0 ? 150 : 205, PIES - 6 * ESC];
    const pp = mezcla(flota, dest, k); pp[1] -= 60 * Math.sin(k * Math.PI);
    return { p: pp, s: lerp(2.0, ESC, k) };
  }
  dibujarGenio(g, t) {
    const kA = this.kGenio(t), kV = this.kVuelta(t);
    if (kA <= 0 || kV >= 1) return;
    const o = this.lienzo();
    o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = "source-over"; o.globalAlpha = 1; o.clearRect(0, 0, OW, OH);
    const pose = this.estadoGenio();
    pintarAvatar(o, matAv(OX, OY, GESC, 0, 1, 1), pose, t);
    // azul
    o.globalCompositeOperation = "source-atop"; o.fillStyle = "rgba(40,120,255,.55)"; o.fillRect(0, 0, OW, OH);
    // sin piernas: se deshace en humo
    o.globalCompositeOperation = "destination-out";
    const y0 = OY - 100 * GESC, gr = o.createLinearGradient(0, y0, 0, y0 + 70);
    gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,1)");
    o.fillStyle = gr; o.fillRect(0, y0, OW, OH);
    // a la pantalla: aparece creciendo y se va a la botella girando
    const e = this.estado(), cu = this.cuello(e);
    const s = lerp(0.35, 1, eBack(kA)) * (1 - kV * 0.95);
    const cx = lerp(GX, cu[0], kV), cy = lerp(GY - 6 * Math.sin(t * 2.2), cu[1] + 40, kV);
    g.save(); g.translate(cx, cy); g.rotate(kV * 7); g.scale(s, s);
    g.globalAlpha = 0.82 * Math.min(1, kA * 1.5); g.drawImage(this._c, -OX, -OY);
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.3 * Math.min(1, kA * 1.5); g.drawImage(this._c, -OX, -OY);
    g.restore();
  }
  dibujarCola(g, t, e) {
    // cola de humo desde el botellín hasta la cintura del genio
    const kA = this.kGenio(t), kV = this.kVuelta(t);
    if (kA <= 0 || kV >= 1 || t < 2.6) return;
    const a = aPant(e.m, [58, 84]), b = [lerp(GX, a[0], kV), lerp(GY - 140, a[1], kV)];
    const c1 = [a[0] + 30, a[1] - 160], c2 = [b[0] - 140, b[1] + 160];
    g.save(); g.globalCompositeOperation = "lighter";
    const N = 26;
    for (let i = 0; i <= N; i++) {
      const u = i / N, v = 1 - u;
      const x = v * v * v * a[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * b[0];
      const y = v * v * v * a[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * b[1];
      const r = (8 + 60 * u * u) * (1 - 0.6 * kV) * (0.85 + 0.15 * Math.sin(t * 9 - i * 0.8));
      g.globalAlpha = 0.28 * Math.min(1, kA * 2);
      g.drawImage(humoAzul(), x - r + 6 * Math.sin(t * 5 + i), y - r, r * 2, r * 2);
    }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    // resplandor azul del genio
    const kA = this.kGenio(t), kV = this.kVuelta(t), luzG = kA * (1 - kV);
    if (luzG > 0) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.3 * luzG; g.drawImage(humoAzul(), GX - 360, 40, 720, 560); g.restore(); }
    // suelo
    g.fillStyle = "rgba(90,140,255,.08)"; g.beginPath(); g.ellipse(X, PIES, 120, 12, 0, 0, 6.283); g.fill();
    // humo suelto
    g.save(); g.globalCompositeOperation = "lighter";
    for (const h of this.humo) { g.globalAlpha = 0.22 * Math.min(1, (h.v / h.vm) * 2); g.drawImage(humoAzul(), h.x - h.s, h.y - h.s, h.s * 2, h.s * 2); }
    g.restore();
    this.dibujarCola(g, t, e);
    this.dibujarGenio(g, t);
    // las cañas (las que no están en la mano)
    for (let i = 0; i < 3; i++) {
      if (t < T_CANA[i]) continue;
      const C = this.posCana(i, t); if (C.oculta) continue;
      const k = eBack(tramo(t, T_CANA[i], T_CANA[i] + 0.25));
      g.save(); g.translate(C.p[0], C.p[1]); g.scale(C.s * k, C.s * k); cana(g, 0, 0); g.restore();
      // número de deseo
      const kn = tramo(t, T_CANA[i] + 0.05, T_CANA[i] + 0.2) * (1 - tramo(t, 6.0, 6.25));
      if (kn > 0) {
        g.save(); g.translate(C.p[0], C.p[1] - 92); g.scale(eBack(kn), eBack(kn));
        g.fillStyle = "#ffd34d"; g.beginPath(); g.arc(0, 0, 22, 0, 6.283); g.fill();
        g.strokeStyle = "#0c2a6b"; g.lineWidth = 4; g.stroke();
        txt(g, String(i + 1), 0, 13, { tam: 38, peso: 900, fam: FD, color: "#0c2a6b" });
        g.restore();
      }
    }
    pintarAvatar(g, e.m, e.pose, t);
    if (this.chapa) { const c = this.chapa; g.save(); g.translate(c.x, c.y); g.rotate(c.r); g.fillStyle = "#e7b416"; g.fillRect(-5, -2.5, 10, 5); g.restore(); }
    this.p.dibujar(g);
    // ¡CHAS!
    if (t > 4.6 && t < 5.3) {
      const q = aPant(matAv(GX, GY, GESC), [92, 20]), k = tramo(t, 4.6, 4.72);
      g.save(); g.translate(q[0] + 70, q[1] - 30); g.rotate(0.15); g.scale(eBack(k), eBack(k));
      txt(g, "¡CHAS!", 0, 0, { tam: 54, peso: 400, fam: FC, color: "#ffffff", borde: "#0c2a6b", bordeAncho: 8, alfa: 1 - tramo(t, 5.05, 5.3), esp: 2 });
      g.restore();
    }
    // ¡TRES DESEOS!
    if (t > 5.35 && t < 8.0) {
      const k = tramo(t, 5.35, 5.5), s = lerp(2.6, 1, eIn(k)), a = Math.min(1, k * 4) * (1 - tramo(t, 7.6, 8.0));
      const T = titulo();
      g.save(); g.globalAlpha = a; g.translate(W / 2, 80); g.scale(s, s); g.drawImage(T, -T.width / 2, -T.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0, 0.4), tramo(t, this.dur - 0.5, this.dur - 0.02));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00034", nombre: "El genio del botellín", crear: () => new EscenaGenio() });
})();
