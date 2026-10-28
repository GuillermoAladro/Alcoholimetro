"use strict";
/*
 * 00115 · BUMERÁN DE POSAVASOS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Guillermo y Rodrigo lanzan posavasos como si fueran discos. El de Guillermo sale volando y se pierde fuera de la
 * pantalla; Guillermo se queda mirando con la mano de visera y Rodrigo se ríe de él. Rodrigo lanza el suyo: da una
 * vuelta enorme como un bumerán (Guillermo se agacha cuando le pasa por encima) y vuelve… a la frente de Rodrigo.
 * ¡TOC! Se le queda pegado, ve estrellitas y Guillermo se parte de risa. ¡BUMERÁN!
 */
(() => {
const ESC = 1.5, XR = 172, XG = 420, DUR = 10.0;
const T_LG = 2.1, T_LR = 4.3, T_TOC = 6.3;

function bez(a, b, c, d, u) {
  const v = 1 - u;
  return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]];
}
/** Posavasos redondo visto un poco de lado (inc 0–1), girando (`giro`). */
function posavasos(g, x, y, r, inc, giro, ang = 0) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(1, Math.max(0.12, inc));
  g.fillStyle = "#d9d2c0"; g.beginPath(); g.arc(0, r * 0.12 / Math.max(0.12, inc) * 0.6, r, 0, 6.283); g.fill(); // canto
  g.fillStyle = "#1f7a3a"; g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.fill();
  g.fillStyle = "#f6f1e6"; g.beginPath(); g.arc(0, 0, r * 0.8, 0, 6.283); g.fill();
  g.rotate(giro);
  g.fillStyle = "#e7a900"; estrella(g, 0, 0, r * 0.48, r * 0.2, 0); g.fill();
  g.fillStyle = "#c8102e"; for (let k = 0; k < 3; k++) { const a = (k / 3) * 6.283; g.beginPath(); g.arc(Math.cos(a) * r * 0.66, Math.sin(a) * r * 0.66, r * 0.07, 0, 6.283); g.fill(); }
  g.restore();
}

class Bumeran extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(320);
    this.cache = cacheTexto();
    this.suelo = null;
  }
  /** lanzamiento de frisbi con la mano derecha: devuelve la mano y si aún tiene el posavasos */
  lanza(t, tl) {
    const k1 = eInOut(tramo(t, tl - 0.55, tl - 0.12)), k2 = eOut(tramo(t, tl - 0.12, tl + 0.02)), k3 = eInOut(tramo(t, tl + 0.25, tl + 0.6));
    const ini = [62, 120], atras = [22, 122], fuera = [122, 102];
    return { mano: mezcla(mezcla(mezcla(ini, atras, k1), fuera, k2), [70, 158], k3), tiene: t < tl };
  }
  /** vuelo del posavasos de Guillermo: [x, y, escala] */
  vueloG(t) {
    const u = tramo(t, T_LG, 3.05);
    const q = bez([545, 380], [720, 250], [940, 150], [1130, 120], eIn(u) * 0.4 + u * 0.6);
    return [q[0], q[1] + Math.sin(t * 9) * 6, lerp(1, 0.7, u)];
  }
  vueloR(t, frente) {
    const ini = [298, 380];
    if (t < 5.0) { const u = tramo(t, T_LR, 5.0); const q = bez(ini, [300, -120], [860, 470], [930, 320], u); return [q[0], q[1], lerp(1, 0.85, u)]; }
    if (t < 5.65) { const u = tramo(t, 5.0, 5.65); const q = bez([930, 320], [1020, 200], [880, 70], [640, 92], u); return [q[0], q[1], lerp(0.85, 0.72, Math.sin(Math.PI * u * 0.8))]; }
    const u = tramo(t, 5.65, T_TOC); const q = bez([640, 92], [470, 106], [300, 110], frente, eIn(u) * 0.35 + u * 0.65); return [q[0], q[1], lerp(0.75, 0.95, u)];
  }
  estado() {
    const t = this.t;
    // ---------------- Rodrigo (a la izquierda)
    const R = { quien: "rodrigo", cara: "sonrisa", rc: 0.08, piernaI: [0, 0], piernaD: [0, 0] };
    let mR = [62, 120], giroR = 0, syR = 1, tieneR = true;
    if (t > 0.6 && t < 1.5) { R.cara = "guino"; mR = mezcla([62, 120], [80, 70], Math.sin(Math.PI * tramo(t, 0.6, 1.5))); }
    if (t > T_LG + 0.6 && t < 3.95) { // se ríe del de Guillermo
      R.cara = "risa"; R.rc = 0.1 + 0.06 * Math.sin(t * 14); syR = 1 - 0.03 * Math.abs(Math.sin(t * 14));
      R.manoI = [24, 130]; R.brazoIDelante = true;
    }
    if (t > 3.7) { const L = this.lanza(t, T_LR); mR = L.mano; tieneR = L.tiene; R.cara = t < T_LR ? "guino" : "risa"; }
    if (t > T_LR + 0.3 && t < T_TOC) {
      // lo ve volver, orgulloso, y estira la mano para cogerlo
      const v = this.vueloR(t, [190, 275]);
      R.rc = clamp((v[0] - XR) / 900, -0.2, 0.3) * 0.5;
      R.cara = t > 5.65 ? "guino" : "risa";
      if (t > 5.8) mR = mezcla([70, 158], [104, 40], eOut(tramo(t, 5.8, 6.1)));
    }
    if (t >= T_TOC) {
      const d = t - T_TOC;
      R.cara = d < 0.3 ? "sorpresa" : d < 2.4 ? "borracho" : "dormido";
      R.rc = -0.32 * eElastico(tramo(d, 0, 0.5)) * (1 - tramo(d, 1.0, 1.8)) + 0.07 * Math.sin(d * 5) * tramo(d, 0.6, 1.0);
      giroR = -0.09 * Math.sin(Math.PI * tramo(d, 0, 0.6)) + 0.04 * Math.sin(d * 4) * tramo(d, 0.6, 1);
      mR = mezcla([104, 40], [72, 150], eInOut(tramo(d, 0.1, 0.5)));
      if (d > 2.4) mR = mezcla([72, 150], [52, 32], eInOut(tramo(d, 2.4, 2.75))); // se frota la frente
    }
    R.manoD = mR;
    if (tieneR) R.objD2 = (g, m) => posavasos(g, m[0] + 4, m[1] - 3, 13, 0.35, 0, -0.1);
    // ---------------- Guillermo (a la derecha)
    const G = { cara: "sonrisa", rc: -0.08, piernaI: [0, 0], piernaD: [0, 0] };
    let mG = [62, 120], syG = 1, sxG = 1, tieneG = true;
    if (t > 0.6 && t < 1.5) { G.cara = "guino"; mG = mezcla([62, 120], [80, 70], Math.sin(Math.PI * tramo(t, 0.75, 1.5))); }
    if (t > 1.5) { const L = this.lanza(t, T_LG); mG = L.mano; tieneG = L.tiene; G.cara = t < T_LG ? "guino" : "sonrisa"; G.rc = 0.05; }
    if (t > T_LG + 0.6 && t < 4.2) { // mano de visera: ¿dónde está?
      const k = eInOut(tramo(t, T_LG + 0.6, T_LG + 0.9)) * (1 - eInOut(tramo(t, 3.9, 4.2)));
      mG = mezcla(mG, [56, 26], k); G.rc = 0.12 * k + 0.05 * Math.sin(t * 3) * k;
      G.cara = t < 3.3 ? "sorpresa" : "dormido";
    }
    if (t > T_LR && t < T_TOC) {
      const v = this.vueloR(t, [190, 275]);
      G.rc = clamp((v[0] - XG) / 700, -0.3, 0.3) * 0.5; G.cara = "sorpresa";
      // se agacha cuando le pasa por encima
      const k = Math.sin(Math.PI * tramo(t, 5.62, 6.08));
      syG = 1 - 0.2 * k; sxG = 1 + 0.06 * k;
      if (k > 0.1) mG = [62, 40];
    }
    if (t >= T_TOC) {
      const d = t - T_TOC;
      G.cara = d < 0.35 ? "sorpresa" : "risa";
      G.rc = d < 0.35 ? -0.1 : -0.08 + 0.07 * Math.sin(d * 13);
      syG = d > 0.35 ? 1 - 0.04 * Math.abs(Math.sin(d * 13)) : 1;
      if (d > 0.4) { mG = mezcla([70, 158], [-30, 100], eBack(tramo(d, 0.4, 0.65))); G.manoI = [24, 132]; G.brazoIDelante = true; }
      if (d > 0.4) { G.manoD = [62, 130]; G.manoI = mezcla([9, 160], [-36, 96 + 3 * Math.sin(d * 13)], eBack(tramo(d, 0.4, 0.65))); G.brazoIDelante = false; mG = [62, 130]; }
    }
    G.manoD = G.manoD && t >= T_TOC + 0.4 ? G.manoD : mG;
    if (tieneG) G.objD2 = (g, m) => posavasos(g, m[0] + 4, m[1] - 3, 13, 0.35, 0, -0.1);
    const mRm = matAv(XR, PIES, ESC, giroR, 1, syR);
    const mGm = matAv(XG, PIES, ESC, 0, sxG, syG);
    return { R, G, mR: mRm, mG: mGm };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("lg", t > T_LG, () => temblar(4, 0.1));
    this.una("lr", t > T_LR, () => temblar(4, 0.1));
    this.una("toc", t > T_TOC, () => {
      temblar(24, 0.5);
      const e = this.estado(), q = aPant(e.mR, [38, 30]);
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.35, 180);
      for (let k = 0; k < 22; k++) { const a = azar(-Math.PI, 0.3), v = azar(150, 450); p.nueva(P.CHISPA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(7, 12)); }
    });
    // el posavasos se despega de la frente y cae
    this.una("cae", t > 7.6, () => { const e = this.estado(), q = aPant(e.mR, [38, 30]); this.suelo = { x: q[0], y: q[1], vx: 60, vy: -120, r: 0, vr: 6 }; });
    if (this.suelo) { const s = this.suelo; if (s.y < PIES - 4) { s.vy += 1200 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.r += s.vr * dt; } else { s.y = PIES - 4; s.r = 0; } }
    // estela de los posavasos
    if (t > T_LG && t < 3.05 && Math.random() < 30 * dt) { const v = this.vueloG(t); p.nueva(P.VAPOR, v[0], v[1], 0, 0, 0.3, 12 * v[2]); }
    if (t > T_LR && t < T_TOC && Math.random() < 30 * dt) { const v = this.vueloR(t, this.frente()); p.nueva(P.VAPOR, v[0], v[1], 0, 0, 0.3, 12 * v[2]); }
    p.actualizar(dt);
  }
  frente() { return [XR, PIES - (232 - 32) * ESC]; }
  bar() {
    if (this.cache.has("f")) return this.cache.get("f");
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    const gp = g.createLinearGradient(0, 0, 0, 470);
    gp.addColorStop(0, "#0a0706"); gp.addColorStop(1, "#22150d");
    g.fillStyle = gp; g.fillRect(0, 0, W, 470);
    // estanterías con botellas y un reloj
    for (const y of [190, 300]) {
      g.fillStyle = "#4a2c16"; g.fillRect(560, y, 440, 8); g.fillStyle = "rgba(255,210,150,.2)"; g.fillRect(560, y, 440, 2);
      for (let x = 580; x < 990; x += 26) {
        const h = 40 + ((x * 7 + y) % 22);
        g.fillStyle = ["#2e5d2a", "#6b3a12", "#284b6b", "#7a1e1e"][((x + y) / 26) % 4 | 0]; rectR(g, x, y - h, 14, h, 4); g.fill();
        g.fillStyle = "rgba(255,255,255,.22)"; g.fillRect(x + 3, y - h + 8, 2, h - 14);
      }
    }
    // suelo
    const gs = g.createLinearGradient(0, 470, 0, H);
    gs.addColorStop(0, "#2a1a10"); gs.addColorStop(1, "#110904");
    g.fillStyle = gs; g.fillRect(0, 470, W, H - 470);
    g.fillStyle = "rgba(255,210,150,.08)"; g.fillRect(0, 470, W, 2);
    g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2;
    for (let i = -12; i <= 12; i++) { g.beginPath(); g.moveTo(512 + i * 60, 470); g.lineTo(512 + i * 150, H); g.stroke(); }
    this.cache.set("f", c);
    return c;
  }
  titulo() {
    if (this.cache.has("t")) return this.cache.get("t");
    const c = lienzoNuevo(860, 210), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 160);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡BUMERÁN!", 430, 160, { tam: 150, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 12, esp: 5, glow: "rgba(255,170,30,.85)", glowTam: 24, max: 820 });
    this.cache.set("t", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    g.drawImage(this.bar(), 0, 0);
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.32; g.drawImage(BLOB2.oroClaro, 20, 80, 980, 560); g.restore();
    if (this.suelo) posavasos(g, this.suelo.x, this.suelo.y, 20, this.suelo.y >= PIES - 4 ? 0.3 : 0.6, this.suelo.r * 2, this.suelo.r);
    pintarAvatar(g, e.mR, e.R, t);
    pintarAvatar(g, e.mG, e.G, t);
    this.p.dibujar(g);
    // posavasos en el aire
    // estela: por dónde ha pasado
    const estela = (f, t0) => {
      g.save(); g.globalCompositeOperation = "lighter";
      for (let k = 1; k <= 12; k++) { const tt = t - k * 0.022; if (tt < t0) break; const v = f(tt), r = 16 * v[2] * (1 - k / 14); g.globalAlpha = 0.5 * (1 - k / 13); g.drawImage(BLOB.blanco, v[0] - r, v[1] - r, r * 2, r * 2); }
      g.restore();
    };
    if (t > T_LG && t < 3.05) { const f = (tt) => this.vueloG(tt), v = f(t); estela(f, T_LG); posavasos(g, v[0], v[1], 34 * v[2], 0.55, t * 22, -0.2); }
    if (t > T_LR && t < T_TOC) { const f = (tt) => this.vueloR(tt, this.frente()), v = f(t); estela(f, T_LR); posavasos(g, v[0], v[1], 34 * v[2], 0.5 + 0.25 * Math.sin(t * 3), t * 24, 0.3 * Math.sin(t * 2)); }
    // pegado en la frente
    if (t >= T_TOC && !this.suelo) {
      const q = aPant(e.mR, [38, 26]), d = t - T_TOC;
      posavasos(g, q[0], q[1], 24, 0.92, 0.3, -0.25 + e.R.rc + Math.sin(d * 30) * 0.15 * Math.exp(-d * 5));
    }
    // estrellitas
    if (t > T_TOC + 0.25 && t < 8.9) {
      const c = aPant(e.mR, [38, 0]), a0 = tramo(t, T_TOC + 0.25, T_TOC + 0.45) * (1 - tramo(t, 8.6, 8.9));
      g.save(); g.globalAlpha = a0;
      for (let i = 0; i < 3; i++) {
        const a = t * 5 + (i * 6.283) / 3, x = c[0] + Math.cos(a) * 64, y = c[1] - 10 + Math.sin(a) * 16;
        estrella(g, x, y, 13, 5.5, t * 3 + i); g.fillStyle = "#ffd34d"; g.fill(); g.strokeStyle = "#7a4a00"; g.lineWidth = 2; g.stroke();
      }
      g.restore();
    }
    // ¿?
    if (t > 3.0 && t < 3.95) {
      const q = aPant(e.mG, [39, -6]);
      bocadillo(g, q[0] + 90, q[1] - 30, "¿…?", q[0] + 20, q[1] + 4, tramo(t, 3.0, 3.2) * (1 - tramo(t, 3.75, 3.95)), 36);
    }
    // ¡TOC!
    if (t > T_TOC && t < T_TOC + 1.0) {
      const k = tramo(t, T_TOC, T_TOC + 0.12), q = aPant(e.mR, [38, 20]);
      g.save(); g.translate(q[0] + 120, q[1] - 70); g.rotate(-0.12); g.scale(eBack(k) * 1.1, eBack(k) * 1.1);
      txt(g, "¡TOC!", 0, 0, { tam: 84, peso: 400, fam: FC, color: "#fffdf5", borde: "#7a0008", bordeAncho: 11, alfa: 1 - tramo(t, T_TOC + 0.75, T_TOC + 1.0), esp: 3 });
      g.restore();
    }
    // ¡BUMERÁN!
    if (t > T_TOC + 0.55) {
      const d = t - T_TOC - 0.55, k = tramo(d, 0, 0.16), s = lerp(2.6, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 7));
      const spr = this.titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3); g.translate(700, 118); g.rotate(-0.04); g.scale(s * 0.82, s * 0.82);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.45), tramo(t, DUR - 0.55, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00115", nombre: "Bumerán de posavasos", crear: () => new Bumeran() });
})();
