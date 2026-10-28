"use strict";
/*
 * 00121 · BALANCÍN CATAPULTA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Un balancín hecho con una tabla sobre un barril. Rodrigo espera en el extremo de abajo y Guillermo coge carrerilla
 * y salta sobre el de arriba: Rodrigo sale disparado hacia el cielo (¡CATAPULTA!). Guillermo mira arriba, se encoge de
 * hombros… se oye «¡PONME UNA!» y Rodrigo vuelve a caer de pie, con una jarra llena en la mano. Brinda y se la bebe.
 */
(() => {
const ESC = 1.5;
const PX = 512, BRAD = 50, PY = PIES - 2 * BRAD - 6;   // barril (centro) y eje del balancín
const L = 280, TH = 0.357;                              // media tabla y ángulo de reposo
const XL = 235;                                         // dónde se ponen de pie en la tabla
const T_SALTA = 1.8, T_ATERRIZA = 2.35, T_GIRA = 2.47, T_VUELVE = 5.95, T_CAE = 6.3;
const XR_CAE = 862;
const cache = cacheTexto();

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const u = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return lerp(k[i - 1][1], k[i][1], (k[i][2] || eInOut)(u)); }
  return k[k.length - 1][1];
}
/** Ángulo de la tabla (+ = el lado derecho abajo). */
function angulo(t) {
  if (t < T_ATERRIZA) return TH;
  if (t < T_GIRA) return lerp(TH, -TH, eIn(tramo(t, T_ATERRIZA, T_GIRA)));
  return -TH + 0.05 * Math.sin((t - T_GIRA) * 26) * Math.exp(-(t - T_GIRA) * 7);
}
/** Altura de la superficie de la tabla en la posición local x. */
function superficie(x, th) { return [PX + x * Math.cos(th), PY + x * Math.sin(th) - 8]; }

function dibujarBalancin(g, th) {
  // barril tumbado (tapa)
  g.save(); g.translate(PX, PIES - BRAD);
  const gr = g.createRadialGradient(-15, -15, 4, 0, 0, BRAD);
  gr.addColorStop(0, "#d39556"); gr.addColorStop(1, "#7a4219");
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, BRAD, 0, 6.283); g.fill();
  g.save(); g.beginPath(); g.arc(0, 0, BRAD - 7, 0, 6.283); g.clip();
  g.strokeStyle = "rgba(60,28,6,.55)"; g.lineWidth = 2;
  for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * 13, -BRAD); g.lineTo(i * 13, BRAD); g.stroke(); }
  g.restore();
  g.lineWidth = 8; g.strokeStyle = "#3e454c"; g.beginPath(); g.arc(0, 0, BRAD - 4, 0, 6.283); g.stroke();
  g.lineWidth = 2; g.strokeStyle = "rgba(220,230,240,.5)"; g.beginPath(); g.arc(0, 0, BRAD - 6, 3.6, 5.2); g.stroke();
  g.restore();
  // tabla
  g.save(); g.translate(PX, PY); g.rotate(th);
  const gt = g.createLinearGradient(0, -8, 0, 10);
  gt.addColorStop(0, "#e2b47a"); gt.addColorStop(0.5, "#a8692f"); gt.addColorStop(1, "#5e3412");
  g.fillStyle = gt; rectR(g, -L, -8, 2 * L, 17, 4); g.fill();
  g.strokeStyle = "rgba(60,28,6,.5)"; g.lineWidth = 1.2;
  for (const x of [-L * 0.62, -L * 0.15, L * 0.33, L * 0.8]) { g.beginPath(); g.moveTo(x, -5); g.quadraticCurveTo(x + 30, -1, x + 60, -4); g.stroke(); }
  g.fillStyle = "#2e3338"; for (const x of [-L + 14, L - 14, -6, 6]) { g.beginPath(); g.arc(x, 0, 2.5, 0, 6.283); g.fill(); }
  g.restore();
}
function titulo() {
  if (cache.has("t")) return cache.get("t");
  const c = lienzoNuevo(900, 200), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 150);
  gr.addColorStop(0, "#e9fff0"); gr.addColorStop(0.5, "#7dffa0"); gr.addColorStop(1, "#16c544");
  txt(g, "¡CATAPULTA!", 450, 150, { tam: 132, peso: 900, fam: FD, color: "#063b16", esp: 5 });
  txt(g, "¡CATAPULTA!", 450, 142, { tam: 132, peso: 900, fam: FD, color: gr, borde: "#063b16", bordeAncho: 11, esp: 5, glow: "rgba(43,255,91,.75)", glowTam: 24 });
  cache.set("t", c);
  return c;
}
/** Bocadillo que habla desde arriba (fuera de la pantalla). */
function grito(g, cx, cy, texto, px, k) {
  if (k <= 0) return;
  const tam = 36;
  g.save();
  g.font = `${tam}px ${FC}`;
  const w = g.measureText(texto).width + 44, h = tam + 26, s = eBack(k);
  g.translate(cx, cy); g.scale(s, s);
  g.fillStyle = "#fffdf5"; g.strokeStyle = "#111"; g.lineWidth = 4; g.lineJoin = "round";
  rectR(g, -w / 2, -h / 2, w, h, 18); g.fill(); g.stroke();
  const bx = clamp(px - cx, -w / 2 + 26, w / 2 - 26);
  g.beginPath(); g.moveTo(bx - 14, -h / 2 + 2); g.lineTo(px - cx, -cy - 20); g.lineTo(bx + 14, -h / 2 + 2); g.closePath(); g.fill(); g.stroke();
  g.fillRect(bx - 12, -h / 2, 24, 6);
  txt(g, texto, 0, tam * 0.36, { tam, peso: 400, fam: FC, color: "#111", esp: 1 });
  g.restore();
}

class Catapulta extends Escena {
  constructor() {
    super(9.9);
    this.p = new Parts(360);
    this.lineas = [];
  }
  luz(t) { return tramo(t, 0.02, 0.55) * (1 - tramo(t, 9.2, 9.85)); }
  estado(t) {
    const th = angulo(t);
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoI: [9, 160], manoD: [70, 158] };
    const R = { quien: "rodrigo", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoI: [9, 157], manoD: [68, 157] };
    // ---- Guillermo: entra, coge impulso, salta y cae en la tabla
    let xg, yg, sxG = 1, syG = 1;
    if (t < T_SALTA) {
      xg = pista(t, [[0.25, -120], [1.4, 140, eOut]]); yg = PIES;
      if (t > 0.25 && t < 1.4) { const a = andar(t * 11, 1 - tramo(t, 1.2, 1.4)); G.piernaI = a.piernaI; G.piernaD = a.piernaD; yg += a.bote; }
      const ag = eInOut(tramo(t, 1.4, 1.72));
      syG = 1 - 0.15 * ag; sxG = 1 + 0.05 * ag;
      G.manoD = mezcla([70, 158], [92, 176], ag); G.manoI = mezcla([9, 160], [-14, 176], ag);
      if (t > 1.4) G.cara = "guino";
    } else if (t < T_ATERRIZA) {
      const u = tramo(t, T_SALTA, T_ATERRIZA), dest = superficie(-XL, TH);
      xg = lerp(140, dest[0], u); yg = lerp(PIES, dest[1], u) - 4 * 150 * u * (1 - u);
      syG = 1.06; G.cara = "risa";
      G.manoD = [96, 28]; G.manoI = [-18, 28]; G.piernaI = [-6, 0.18 * Math.sin(u * Math.PI)]; G.piernaD = [-6, -0.18 * Math.sin(u * Math.PI)];
    } else {
      const s = superficie(-XL, th); xg = s[0]; yg = s[1];
      const ap = Math.sin(tramo(t, T_ATERRIZA, T_ATERRIZA + 0.3) * Math.PI);
      syG = 1 - 0.16 * ap; sxG = 1 + 0.05 * ap;
      G.cara = t < 2.65 ? "sorpresa" : "sorpresa";
      if (t > 2.6 && t < 3.7) { // mira arriba haciendo visera
        const k = eOut(tramo(t, 2.6, 2.85)) * (1 - eInOut(tramo(t, 3.5, 3.7)));
        G.manoD = mezcla([70, 158], [60, 30], k); G.rc = 0.16 * k; G.cara = "sorpresa";
      }
      if (t >= 3.7 && t < 4.85) { // se encoge de hombros
        const k = eBack(tramo(t, 3.85, 4.1)) * (1 - eInOut(tramo(t, 4.6, 4.85)));
        G.manoD = mezcla([70, 158], [104, 118], k); G.manoI = mezcla([9, 160], [-26, 118], k);
        G.cara = "guino"; G.rc = -0.1 * k; syG *= 1 - 0.04 * k;
      }
      if (t >= 4.85 && t < 6.4) { G.cara = "sorpresa"; G.rc = 0.18 * eOut(tramo(t, 4.9, 5.1)); G.manoD = mezcla([70, 158], [60, 30], eOut(tramo(t, 5.6, 5.85))); }
      if (t >= 6.4) { // aplaude
        G.cara = "risa"; G.rc = 0.06 * Math.sin(t * 6);
        const k = eInOut(tramo(t, 6.45, 6.7)), c = Math.abs(Math.sin((t - 6.7) * 11)) * (t > 6.7 && t < 8.2 ? 1 : 0);
        G.manoD = mezcla([70, 158], [48 + 8 * c, 112], k); G.manoI = mezcla([9, 160], [30 - 8 * c, 112], k); G.brazoIDelante = k > 0.5;
      }
    }
    // ---- Rodrigo: en el extremo de abajo, sale volando y vuelve con una jarra
    let xr, yr, sxR = 1, syR = 1, vuela = false;
    if (t < T_GIRA) {
      const s = superficie(XL, th); xr = s[0]; yr = s[1];
      if (t < 1.7) { R.cara = "sonrisa"; const w = Math.sin(t * 14); R.manoI = t > 0.3 && t < 1.5 ? [-20, 48 + 6 * w] : [9, 157]; R.rc = -0.08; }
      else { R.cara = t < 2.0 ? "guino" : "sorpresa"; R.rc = -0.12; }
    } else if (t < T_VUELVE) {
      const s = t - T_GIRA, s0 = superficie(XL, -TH);
      xr = s0[0] + 70 * s; yr = s0[1] - 1700 * s + 900 * s * s; vuela = true;
      R.cara = "sorpresa"; R.puntas = 1; R.manoI = [-26, 30]; R.manoD = [104, 30];
      R.piernaI = [0, 0.32]; R.piernaD = [0, -0.32]; syR = 1.12; sxR = 0.92;
    } else {
      const u = tramo(t, T_VUELVE, T_CAE);
      xr = XR_CAE; yr = lerp(-430, PIES, u * u);
      R.manoD = [92, 24]; R.jarra = { inc: 0.05 * Math.sin(t * 7), nivel: 1 }; R.cara = t < T_CAE ? "guino" : "risa";
      if (t < T_CAE) { R.piernaI = [-6, 0.1]; R.piernaD = [-6, -0.1]; R.manoI = [-22, 40]; R.puntas = 0.8; syR = 1.08; }
      const ap = Math.sin(tramo(t, T_CAE, T_CAE + 0.28) * Math.PI);
      syR *= 1 - 0.18 * ap; sxR = 1 + 0.06 * ap;
      R.puntas = (R.puntas || 0) * (1 - tramo(t, T_CAE, T_CAE + 0.4));
      if (t > 6.6) {
        // brinda hacia Guillermo y se la bebe
        const kBr = eInOut(tramo(t, 6.6, 6.85)) * (1 - eInOut(tramo(t, 7.0, 7.2)));
        R.manoD = mezcla([92, 24], [70, 40], kBr); R.rc = -0.12 * kBr;
        const kB = eInOut(tramo(t, 7.15, 7.45)) * (1 - eInOut(tramo(t, 8.3, 8.6)));
        const kT = eInOut(tramo(t, 7.4, 8.05)) * (1 - eInOut(tramo(t, 8.3, 8.6)));
        if (kB > 0) {
          R.rc = -0.34 * kT;
          const inc = -0.5 * kB - 0.75 * kT, b = boca(R.rc, "rodrigo"), tope = rot2([17, -18], inc);
          R.manoD = mezcla([92, 24], [b[0] - tope[0] - 2, b[1] - tope[1] + 4], kB);
          R.jarra = { inc, nivel: 1 - 0.8 * tramo(t, 7.5, 8.1) };
          R.cara = kT > 0.3 ? "dormido" : "risa";
        }
        if (t >= 8.3) { R.jarra = { inc: 0.1, nivel: 0.2 }; R.cara = t < 8.7 ? "guino" : "risa"; R.manoD = mezcla(R.manoD, [96, 40], eOut(tramo(t, 8.6, 8.9))); }
      }
    }
    return {
      G, R, th, vuela,
      mG: matAv(xg, yg, ESC, 0, sxG, syG), mR: matAv(xr, yr, ESC, 0, sxR, syR),
    };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("tabla", t > T_ATERRIZA + 0.06, () => {
      temblar(28, 0.6);
      const a = superficie(-L, -TH), b = superficie(L, -TH);
      for (let i = 0; i < 26; i++) p.nueva(P.POLVO, a[0] + azar(-20, 40), PIES - 4, azar(-420, 300), azar(-90, -5), azar(0.6, 1.1), azar(26, 46));
      for (let i = 0; i < 26; i++) { const an = azar(-Math.PI * 0.9, -Math.PI * 0.1), v = azar(250, 650); p.nueva(P.CHISPA, b[0], b[1], Math.cos(an) * v, Math.sin(an) * v, azar(0.4, 0.8), azar(8, 14)); }
      p.nueva(P.DESTELLO, b[0], b[1] - 30, 0, 0, 0.35, 200);
    });
    // estela del vuelo
    if (t > T_GIRA && t < 2.85) {
      const e = this.estado(t), q = aPant(e.mR, [39, 180]);
      for (let i = 0; i < 3; i++) p.nueva(P.LLAMA, q[0] + azar(-25, 25), q[1] + azar(0, 40), azar(-30, 30), azar(60, 160), azar(0.2, 0.35), azar(26, 44), 1);
      if (Math.random() < 0.5) this.lineas.push({ x: q[0] + azar(-60, 60), y: q[1] + azar(-40, 80), v: 0.3 });
    }
    for (const l of this.lineas) { l.v -= dt; l.y += 200 * dt; }
    this.lineas = this.lineas.filter((l) => l.v > 0);
    this.una("brillo", t > 3.45, () => p.nueva(P.DESTELLO, 812, 34, 0, 0, 0.5, 90));
    // cae: líneas de velocidad y aterrizaje
    if (t > T_VUELVE && t < T_CAE) { const y = lerp(-430, PIES, Math.pow(tramo(t, T_VUELVE, T_CAE), 2)); this.lineas.push({ x: XR_CAE + azar(-50, 50), y: y - azar(250, 420), v: 0.25 }); }
    this.una("cae", t > T_CAE, () => {
      temblar(22, 0.45);
      for (let i = 0; i < 30; i++) p.nueva(P.POLVO, XR_CAE + azar(-30, 30), PIES - azar(0, 10), azar(-450, 450), azar(-90, -5), azar(0.6, 1.1), azar(26, 46));
      const q = aPant(this.estado(t).mR, [104, 24]);
      for (let i = 0; i < 10; i++) p.nueva(P.ESPUMA, q[0] + 20, q[1] - 20, azar(-120, 120), azar(-260, -80), azar(0.4, 0.8), azar(4, 8));
    });
    p.alfa = 1 - tramo(t, 9.2, 9.8);
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(t), luz = this.luz(t);
    fondo(g, "#000");
    g.save(); g.globalAlpha = luz;
    // cielo de noche del patio y suelo
    const gc = g.createLinearGradient(0, -60, 0, PIES);
    gc.addColorStop(0, "#05070f"); gc.addColorStop(1, "#141a2a");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, PIES + 60);
    const sr = semilla(121);
    g.fillStyle = "#fffbe8";
    for (let i = 0; i < 46; i++) { const x = sr() * W, y = sr() * 330, r = 0.6 + sr() * 1.4; g.globalAlpha = luz * (0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + i))); g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
    g.globalAlpha = luz;
    const gs = g.createLinearGradient(0, PIES, 0, H + 60);
    gs.addColorStop(0, "#2f3a2a"); gs.addColorStop(1, "#0c100a");
    g.fillStyle = gs; g.fillRect(-60, PIES, W + 120, H + 60 - PIES);
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.3 * luz;
    g.drawImage(BLOB2.oroClaro, 60, 160, 900, 520);
    g.restore();
    // sombra de Rodrigo antes de caer
    if (t > 5.5 && t < T_CAE + 0.1) {
      const k = tramo(t, 5.5, T_CAE);
      g.save(); g.globalAlpha = 0.6 * k * luz; g.fillStyle = "#000"; g.beginPath(); g.ellipse(XR_CAE, PIES - 2, 20 + 45 * k, 6 + 4 * k, 0, 0, 6.283); g.fill(); g.restore();
    }
    dibujarBalancin(g, e.th);
    // líneas de velocidad
    if (this.lineas.length) {
      g.save(); g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 2.5; g.lineCap = "round";
      for (const l of this.lineas) { g.globalAlpha = l.v / 0.3; g.beginPath(); g.moveTo(l.x, l.y); g.lineTo(l.x, l.y + 90); g.stroke(); }
      g.restore();
    }
    this.p.dibujar(g);
    pintarAvatar(g, e.mG, e.G, t);
    if (!e.vuela || t < 3.0) pintarAvatar(g, e.mR, e.R, t);
    // ¡PONME UNA! desde el cielo
    if (t > 4.95 && t < 5.95) grito(g, 760, 74, "¡PONME UNA!", 812, tramo(t, 4.95, 5.1) * (1 - tramo(t, 5.8, 5.95)));
    const kb = t - 3.45;
    if (kb > 0 && kb < 0.9) brillo(g, 812, 34, 30 * Math.sin((kb / 0.9) * Math.PI), 1);
    // ¡CATAPULTA!
    if (t > T_GIRA - 0.04 && t < 4.6) {
      const d = t - T_GIRA + 0.04, k = tramo(d, 0, 0.18), s = lerp(2.5, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 8));
      const spr = titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - tramo(t, 4.3, 4.6)); g.translate(512, 118); g.rotate(-0.06); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // vuelve el título al final, más pequeño, con la jarra ya en la mano
    if (t > 6.45) {
      const k = tramo(t, 6.45, 6.65);
      const spr = titulo();
      g.save(); g.globalAlpha = Math.min(1, k * 2) * (1 - tramo(t, 9.2, 9.8)); g.translate(512, 104); g.rotate(-0.04); g.scale(0.82 * eBack(k), 0.82 * eBack(k));
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    const a = 1 - luz;
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${Math.min(1, a)})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00121", nombre: "Balancín catapulta", crear: () => new Catapulta() });
})();
