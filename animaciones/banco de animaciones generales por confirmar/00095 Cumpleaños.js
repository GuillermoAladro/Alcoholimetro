"use strict";
/*
 * 00095 · CUMPLEAÑOS
 *
 * Animación del banco. Empieza y acaba en negro.
 * A oscuras se enciende una vela: él, con gorro de fiesta, detrás de una tarta. Sopla y la vela se apaga… y se vuelve
 * a encender sola (¡FSST!: es de broma). Otra vez. Coge todo el aire del mundo y sopla tan fuerte (¡FUUUUH!) que la
 * tarta sale volando. Vuelve a caer solo la vela, encendida: ¡CUMPLEAÑOS FELIZ! con confeti. La apaga con los dedos.
 */
(() => {
const X = 512, ESC = 1.6;
const MESA = 446;                 // superficie de la mesa
const TARTA_ALTO = 60;            // la tarta: de MESA - 60 a MESA
const VELA = 34;                  // alto de la vela
const SOPLOS = [[1.8, 2.0, 2.6], [3.35, 3.55, 4.15]]; // [empieza a soplar, se apaga, se vuelve a encender]
const SOPLIDO = 5.6;              // el soplido gordo
const VUELVE = 7.3;               // la vela cae de vuelta a la mesa
const FELIZ = 7.6;
const APAGA = 9.75;               // la apaga con los dedos
const textos = cacheTexto();

function pintarTarta() {
  const c = lienzoNuevo(260, 120), g = c.getContext("2d"), cx = 130, base = 104;
  // plato
  g.fillStyle = "#e9eef2"; g.beginPath(); g.ellipse(cx, base + 4, 122, 12, 0, 0, 6.283); g.fill();
  g.fillStyle = "#b9c3cb"; g.beginPath(); g.ellipse(cx, base + 7, 116, 7, 0, 0, Math.PI); g.fill();
  // bizcocho con nata
  const cu = g.createLinearGradient(cx - 100, 0, cx + 100, 0);
  cu.addColorStop(0, "#d98aa6"); cu.addColorStop(0.45, "#ffd0e0"); cu.addColorStop(1, "#c96f92");
  g.fillStyle = cu;
  g.beginPath(); g.moveTo(cx - 100, base - TARTA_ALTO + 14); g.lineTo(cx - 100, base - 2); g.ellipse(cx, base - 2, 100, 10, 0, Math.PI, 0, true); g.lineTo(cx + 100, base - TARTA_ALTO + 14); g.closePath(); g.fill();
  // franja de relleno
  g.fillStyle = "rgba(150,40,70,.35)"; g.fillRect(cx - 100, base - 30, 200, 6);
  // cobertura de arriba con chorretones
  g.fillStyle = "#fff4f8";
  g.beginPath(); g.ellipse(cx, base - TARTA_ALTO + 14, 100, 14, 0, 0, 6.283); g.fill();
  for (let i = 0; i < 9; i++) { const dx = cx - 92 + i * 23, l = 8 + ((i * 7) % 5) * 4; g.beginPath(); g.ellipse(dx, base - TARTA_ALTO + 18 + l / 2, 6, l / 2 + 4, 0, 0, 6.283); g.fill(); }
  // bolitas de nata y fresas en el borde
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * 6.283, x = cx + Math.cos(a) * 84, y = base - TARTA_ALTO + 14 + Math.sin(a) * 9;
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(x, y - 3, 7, 0, 6.283); g.fill();
    if (i % 2 === 0) { g.fillStyle = "#e3262f"; g.beginPath(); g.arc(x, y - 9, 5, 0, 6.283); g.fill(); g.fillStyle = "rgba(255,255,255,.6)"; g.fillRect(x - 2, y - 12, 2, 2); }
  }
  // virutas de colores
  for (let i = 0; i < 26; i++) { g.fillStyle = CONFETI[i % 5]; const a = i * 2.4, r = 20 + (i * 13) % 60; g.fillRect(cx + Math.cos(a) * r, base - TARTA_ALTO + 14 + Math.sin(a) * r * 0.12, 4, 2); }
  return c;
}

function pintarMesa() {
  const c = lienzoNuevo(W + 40, H - MESA + 20), g = c.getContext("2d");
  const ma = g.createLinearGradient(0, 0, 0, c.height);
  ma.addColorStop(0, "#d9cfc0"); ma.addColorStop(1, "#8f8576");
  g.fillStyle = ma; g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = "rgba(120,100,80,.18)"; g.lineWidth = 3;
  for (let x = 30; x < c.width; x += 70) { g.beginPath(); g.moveTo(x, 18); g.quadraticCurveTo(x + 8, 80, x - 4, c.height); g.stroke(); }
  // puntilla rosa
  g.fillStyle = "#ff7fb0";
  for (let x = 0; x < c.width; x += 28) { g.beginPath(); g.arc(x + 14, 14, 14, 0, Math.PI); g.fill(); }
  g.fillStyle = "#ffd6e6"; g.fillRect(0, 0, c.width, 8);
  return c;
}

/** Vela de rayas (base en (x, y), en pantalla). */
function pintarVela(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.fillStyle = "#fffdf5"; rectR(g, -5, -VELA, 10, VELA, 2); g.fill();
  g.save(); rectR(g, -5, -VELA, 10, VELA, 2); g.clip();
  g.strokeStyle = "#2fb8e8"; g.lineWidth = 3.5;
  for (let k = -VELA; k < 10; k += 9) { g.beginPath(); g.moveTo(-6, k); g.lineTo(6, k - 6); g.stroke(); }
  g.restore();
  g.strokeStyle = "#222"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, -VELA); g.lineTo(0, -VELA - 6); g.stroke();
  g.restore();
}
/** Llama (base en (x, y)); k = tamaño 0–1; dob = cuánto se tumba. */
function pintarLlama(g, x, y, k, dob, t) {
  if (k <= 0.02) return;
  const h = 26 * k * (1 + 0.1 * Math.sin(t * 31)), w = 8 * k;
  g.save(); g.translate(x, y);
  g.globalCompositeOperation = "lighter";
  g.globalAlpha = 0.8 * k; g.drawImage(BLOB.naranja, -60 * k, -h - 50 * k, 120 * k, 120 * k);
  g.globalAlpha = 1;
  g.rotate(dob);
  const gr = g.createLinearGradient(0, -h, 0, 0);
  gr.addColorStop(0, "rgba(255,230,120,0)"); gr.addColorStop(0.3, "#ffd34d"); gr.addColorStop(0.8, "#fff3c0"); gr.addColorStop(1, "#7fb6ff");
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(0, -h); g.quadraticCurveTo(w * 1.4, -h * 0.35, 0, 0); g.quadraticCurveTo(-w * 1.4, -h * 0.35, 0, -h); g.fill();
  g.restore();
}

class EscenaCumple extends Escena {
  constructor() {
    super(10.9);
    this.p = new Parts(400);
    this.p.suelo = () => MESA + 4;
    this.tarta = pintarTarta();
    this.mesa = pintarMesa();
  }
  /** Llama: tamaño (0–1) y cuánto se dobla. */
  llama(t) {
    if (t < 0.35) return { k: 0, dob: 0 };
    let k = eBack(tramo(t, 0.35, 0.55)), dob = 0;
    for (const [s0, off, on] of SOPLOS) {
      if (t > s0 && t < off) { dob = 0.9 * tramo(t, s0, off); k *= 1 - 0.6 * tramo(t, s0, off); }
      if (t >= off && t < on) k = 0;
      if (t >= on && t < on + 0.3) k = eBack(tramo(t, on, on + 0.18));
    }
    if (t > SOPLIDO - 0.05 && t < SOPLIDO + 0.1) dob = 1.2;
    if (t >= SOPLIDO + 0.1 && t < SOPLIDO + 0.25) dob = 0.9;
    if (t > APAGA) k = 0;
    return { k, dob };
  }
  /** Dónde está la tarta (centro de la base) y su giro. */
  tartaEn(t) {
    if (t < SOPLIDO) return { x: X, y: MESA, r: 0 };
    const s = t - SOPLIDO;
    return { x: X + 900 * s, y: MESA - 1300 * s + 900 * s * s, r: 7 * s };
  }
  /** Base de la vela en pantalla y su giro. */
  velaEn(t) {
    if (t < VUELVE - 0.4) { const T = this.tartaEn(t); const o = rot2([0, -TARTA_ALTO + 6], T.r); return { x: T.x + o[0], y: T.y + o[1], r: T.r }; }
    const k = tramo(t, VUELVE - 0.4, VUELVE);
    return { x: X + 40, y: lerp(-80, MESA - 2, eIn(k)), r: (1 - k) * 9 };
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0.04 * Math.sin(t * 1.8), piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], sx = 1, sy = 1;
    // dos soplidos normales
    for (const [s0, off, on] of SOPLOS) {
      const kIn = tramo(t, s0 - 0.4, s0), kOut = tramo(t, s0, off + 0.1);
      if (t > s0 - 0.4 && t < off + 0.15) { pose.cara = "sorpresa"; sx = 1 + 0.06 * kIn * (1 - kOut); sy = 1 + 0.03 * kIn * (1 - kOut); pose.rc = 0; }
      if (t >= off + 0.15 && t < on) pose.cara = "guino";
      if (t >= on && t < on + 0.5) { pose.cara = "sorpresa"; pose.rc = 0.12 * Math.sin((t - on) * 30) * (1 - tramo(t, on, on + 0.5)); }
    }
    // coge muchísimo aire
    if (t > 4.65 && t < SOPLIDO + 0.6) {
      const k = eInOut(tramo(t, 4.65, SOPLIDO));
      pose.cara = "sorpresa";
      sx = 1 + 0.16 * k + azar(-0.006, 0.006) * k; sy = 1 + 0.06 * k;
      manoD = mezcla([70, 158], [96, 132], k); manoI = mezcla([9, 160], [-18, 132], k);
      if (t > SOPLIDO) { const kk = eOut(tramo(t, SOPLIDO, SOPLIDO + 0.25)); sx = lerp(1.16, 0.94, kk); sy = lerp(1.06, 0.98, kk); pose.rc = 0.03 * Math.sin(t * 60); }
    }
    if (t >= SOPLIDO + 0.6 && t < VUELVE) { pose.cara = t < 6.6 ? "sorpresa" : "guino"; manoD = mezcla([96, 132], [70, 158], eInOut(tramo(t, SOPLIDO + 0.6, SOPLIDO + 0.9))); manoI = mezcla([-18, 132], [9, 160], eInOut(tramo(t, SOPLIDO + 0.6, SOPLIDO + 0.9))); }
    if (t >= VUELVE && t < FELIZ) pose.cara = "sorpresa";
    // ¡cumpleaños feliz!
    if (t >= FELIZ) {
      pose.cara = t < 9.3 ? (Math.floor((t - FELIZ) * 2.2) % 3 === 2 ? "guino" : "risa") : "guino";
      const k = eBack(tramo(t, FELIZ, FELIZ + 0.3)) * (1 - eInOut(tramo(t, 9.2, 9.45)));
      manoD = mezcla([70, 158], [104, 28 + 6 * Math.sin(t * 9)], k); manoI = mezcla([9, 160], [-26, 28 + 6 * Math.sin(t * 9 + 2)], k);
      pose.rc = 0.06 * Math.sin(t * 6) * k;
      // la apaga con los dedos
      if (t > 9.3) {
        const V = this.velaEn(t), q = [39 + (V.x - X) / ESC, 232 - (PIES - (V.y - VELA - 6)) / ESC];
        manoD = mezcla([70, 158], [q[0] + 4, q[1] + 6], eInOut(tramo(t, 9.35, 9.7)));
        if (t > APAGA + 0.1) manoD = mezcla([q[0] + 4, q[1] + 6], [70, 158], eInOut(tramo(t, APAGA + 0.1, APAGA + 0.4)));
      }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    return { pose, m: matAv(X, PIES, ESC, 0, sx, sy) };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const V = this.velaEn(t), F = [V.x, V.y - VELA - 6];
    for (const [s0, off, on] of SOPLOS) {
      this.una("off" + off, t > off, () => { for (let i = 0; i < 6; i++) p.nueva(P.HUMO, F[0], F[1], azar(10, 60), azar(-80, -40), azar(0.8, 1.3), azar(10, 18)); });
      this.una("on" + on, t > on, () => { temblar(4, 0.15); for (let i = 0; i < 14; i++) { const a = azar(-Math.PI, 0), v = azar(80, 260); p.nueva(P.CHISPA, F[0], F[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.25, 0.5), azar(5, 9)); } });
    }
    this.una("soplido", t > SOPLIDO, () => {
      temblar(26, 0.8);
      for (let i = 0; i < 40; i++) p.nueva(P.ESPUMA, X + azar(-90, 90), MESA - azar(10, 60), azar(100, 700), azar(-500, -100), azar(0.5, 1.0), azar(5, 11));
    });
    if (t > SOPLIDO && t < SOPLIDO + 0.7 && Math.random() < 40 * dt) p.nueva(P.ESPUMA, V.x + azar(-40, 40), V.y + azar(0, 40), azar(-60, 60), azar(-60, 60), 0.6, azar(4, 8));
    this.una("vuelve", t > VUELVE, () => { temblar(10, 0.25); for (let i = 0; i < 10; i++) p.nueva(P.POLVO, V.x, MESA, azar(-120, 120), azar(-40, -5), 0.6, azar(14, 24)); });
    this.una("feliz", t > FELIZ, () => {
      temblar(14, 0.4);
      for (let i = 0; i < 150; i++) p.nueva(P.CONFETI, azar(0, W), azar(-220, -10), azar(-60, 60), azar(20, 120), azar(6, 8), azar(8, 14), (Math.random() * 5) | 0);
      for (let i = 0; i < 30; i++) { const a = azar(0, 6.283), v = azar(200, 600); p.nueva(P.CHISPA, W / 2, 110, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(8, 14)); }
    });
    if (t > FELIZ + 0.3 && t < 9.4 && Math.random() < 25 * dt) p.nueva(P.CONFETI, azar(0, W), -10, azar(-40, 40), azar(40, 100), 6, azar(8, 14), (Math.random() * 5) | 0);
    this.una("apaga", t > APAGA, () => { for (let i = 0; i < 6; i++) p.nueva(P.HUMO, F[0], F[1], azar(-20, 20), azar(-90, -40), azar(0.8, 1.3), azar(10, 18)); });
    p.alfa = 1 - 0.8 * tramo(t, APAGA, APAGA + 0.4);
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), L = this.llama(t), V = this.velaEn(t), T = this.tartaEn(t);
    const F = [V.x + Math.sin(V.r) * (VELA + 6), V.y - Math.cos(V.r) * (VELA + 6)];
    fondo(g, "#1a0f14");
    // guirnalda de banderines al fondo
    g.save(); g.strokeStyle = "#5a4048"; g.lineWidth = 2; g.beginPath(); g.moveTo(-20, 90); g.quadraticCurveTo(W / 2, 190, W + 20, 90); g.stroke();
    for (let i = 0; i < 13; i++) {
      const u = (i + 0.5) / 13, x = lerp(-20, W + 20, u), y = (1 - u) * (1 - u) * 90 + 2 * (1 - u) * u * 190 + u * u * 90;
      g.fillStyle = CONFETI[i % 5]; g.beginPath(); g.moveTo(x - 18, y); g.lineTo(x + 18, y); g.lineTo(x, y + 40); g.closePath(); g.fill();
    }
    g.restore();
    pintarAvatar(g, e.m, e.pose, t);
    // gorro de fiesta (sigue a la cabeza)
    conMat(g, e.m, () => {
      g.translate(RIG.cuello[0], RIG.cuello[1]); g.rotate(e.pose.rc || 0); g.translate(8, -70); g.rotate(0.24);
      g.save(); g.beginPath(); g.moveTo(-15, 0); g.lineTo(15, 0); g.lineTo(0, -44); g.closePath(); g.clip();
      g.fillStyle = "#ff3d84"; g.fillRect(-16, -46, 32, 48);
      g.fillStyle = "#2fe3e8"; for (let k = -40; k < 6; k += 12) { g.beginPath(); g.moveTo(-20, k); g.lineTo(20, k - 10); g.lineTo(20, k - 4); g.lineTo(-20, k + 6); g.fill(); }
      g.restore();
      g.fillStyle = "#ffd34d"; g.beginPath(); g.arc(0, -45, 6, 0, 6.283); g.fill();
      g.strokeStyle = "rgba(0,0,0,.3)"; g.lineWidth = 1; g.beginPath(); g.moveTo(-15, 0); g.lineTo(15, 0); g.stroke();
    });
    // mesa y tarta (y la vela, que puede volar con ella o volver sola)
    g.drawImage(this.mesa, -20, MESA - 6);
    if (T.y < H + 200 && T.x < W + 300) {
      g.save(); g.translate(T.x, T.y); g.rotate(T.r); g.drawImage(this.tarta, -130, -104 - 4); g.restore();
    }
    pintarVela(g, V.x, V.y, V.r);
    // oscuridad con un círculo de luz alrededor de la llama
    const luz = L.k > 0 ? L.k : 0;
    const R = 40 + 420 * luz * tramo(t, 0.35, 1.0), base = t < 1 ? lerp(1, 0.84, tramo(t, 0.35, 1)) : 0.84;
    const gr = g.createRadialGradient(F[0], F[1], 10, F[0], F[1], R);
    gr.addColorStop(0, `rgba(0,0,0,${base * (1 - 0.95 * luz)})`); gr.addColorStop(0.55, `rgba(0,0,0,${base * (1 - 0.6 * luz)})`); gr.addColorStop(1, `rgba(0,0,0,${base})`);
    g.fillStyle = gr; g.fillRect(-60, -60, W + 120, H + 120);
    if (luz > 0) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.28 * luz; g.drawImage(BLOB.naranja, F[0] - 280, F[1] - 240, 560, 480); g.restore(); }
    pintarLlama(g, F[0], F[1] + 4, L.k, L.dob + V.r, t);
    this.p.dibujar(g);
    // soplidos: líneas de viento
    const boca0 = aPant(e.m, boca(0));
    const viento = (a, largo, n) => {
      g.save(); g.strokeStyle = `rgba(220,240,255,${a})`; g.lineWidth = 4; g.lineCap = "round";
      for (let i = 0; i < n; i++) {
        const o = (i - (n - 1) / 2) * 16, d = ((t * 3 + i * 0.37) % 1);
        g.beginPath(); g.moveTo(boca0[0] + o * 0.6 + 10, boca0[1] + 8 + d * 20); g.quadraticCurveTo(boca0[0] + o + 20, boca0[1] + largo * 0.5, boca0[0] + o * 1.6 + 30, boca0[1] + largo); g.stroke();
      }
      g.restore();
    };
    for (const [s0, off] of SOPLOS) if (t > s0 && t < off + 0.1) viento(0.7, 70, 3);
    if (t > SOPLIDO && t < SOPLIDO + 0.6) {
      const a = 1 - tramo(t, SOPLIDO + 0.3, SOPLIDO + 0.6);
      g.save(); g.strokeStyle = `rgba(220,240,255,${0.75 * a})`; g.lineWidth = 6; g.lineCap = "round";
      for (let i = 0; i < 12; i++) { const y0 = boca0[1] - 60 + i * 26 + azar(-6, 6), x0 = boca0[0] + 40 + azar(0, 60); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + azar(180, 420), y0 - azar(40, 140)); g.stroke(); }
      g.restore();
    }
    // ¡FSST!
    for (const [, , on] of SOPLOS) {
      const d = t - on; if (d < 0 || d > 0.7) continue;
      g.save(); g.translate(F[0] + 90, F[1] - 34); g.rotate(-0.12); g.scale(eBack(tramo(d, 0, 0.12)), eBack(tramo(d, 0, 0.12)));
      txt(g, "¡FSST!", 0, 0, { tam: 46, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a1d00", bordeAncho: 7, alfa: 1 - tramo(d, 0.45, 0.7), esp: 2 });
      g.restore();
    }
    // ¡FUUUUH!
    if (t > SOPLIDO && t < SOPLIDO + 1.1) {
      const k = tramo(t, SOPLIDO, SOPLIDO + 0.35);
      g.save(); g.translate(lerp(boca0[0] + 60, 760, eOut(k)), lerp(boca0[1], 200, eOut(k))); g.rotate(-0.15); g.scale(lerp(0.3, 1, eBack(k)), lerp(0.3, 1, eBack(k)));
      txt(g, "¡FUUUUH!", 0, 0, { tam: 104, peso: 400, fam: FC, color: "#eaf8ff", borde: "#14466b", bordeAncho: 11, alfa: 1 - tramo(t, SOPLIDO + 0.8, SOPLIDO + 1.1), esp: 3 });
      g.restore();
    }
    // ¡CUMPLEAÑOS FELIZ!
    if (t > FELIZ) {
      const tit = this.titulo(), k = tramo(t, FELIZ, FELIZ + 0.16), s = lerp(2.6, 1, eIn(k)) * (1 + 0.025 * Math.sin(t * 7));
      const a = Math.min(1, k * 4) * (1 - tramo(t, APAGA, APAGA + 0.35));
      if (tit && a > 0) { g.save(); g.globalAlpha = a; g.translate(W / 2, 112); g.rotate(-0.03); g.scale(s, s); g.drawImage(tit, -tit.width / 2, -tit.height / 2); g.restore(); }
    }
    const aFin = tramo(t, 10.1, 10.85);
    if (aFin > 0) { g.fillStyle = `rgba(0,0,0,${aFin})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  titulo() {
    if (textos.has(1)) return textos.get(1);
    const c = lienzoNuevo(1000, 180), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 140);
    gr.addColorStop(0, "#fff6fb"); gr.addColorStop(0.5, "#ff9cc6"); gr.addColorStop(1, "#ff3d84");
    txt(g, "¡CUMPLEAÑOS FELIZ!", 500, 128, { tam: 96, peso: 400, fam: FB, color: gr, borde: "#4a0024", bordeAncho: 12, esp: 2, glow: "rgba(255,80,160,.8)", glowTam: 24, max: 960 });
    textos.set(1, c);
    return c;
  }
}

registrar({ id: "00095", nombre: "Cumpleaños", crear: () => new EscenaCumple() });
})();
