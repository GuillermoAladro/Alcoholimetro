"use strict";
/*
 * 00010 · DJ GUILLERMO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se encienden la mesa de DJ y los altavoces. Con los cascos puestos pincha: los platos giran, rasca un disco y
 * mueve la cabeza al compás. Sube la mano poco a poco (las luces se apagan, silencio)… y en el «drop» todo estalla
 * en haces verdes y morados, láseres, chorros de humo y confeti mientras salta: ¡DROP! En el último golpe, apagón.
 */
(() => {
const T = 60 / 128, T0 = 0.75;             // compás (128 BPM) y primer golpe
const DROP = 6.05, CORTE = 9.38;
const VERDE = "43,255,91", MORADO = "176,72,255";
const MESA = { x0: 236, x1: 788, tb: 420, tf: 468 }; // tapa de la mesa: borde de atrás y de delante
const PLATOS = [[400, 444], [624, 444]];
const cache = cacheTexto();
let SPR10 = null;

/** Haz de luz difuminado (se dibuja girado desde su punta). */
function haz(col) {
  const w = 120, h = 390, c = lienzoNuevo(w, h), g = c.getContext("2d");
  if ("filter" in g) g.filter = "blur(3.5px)";
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, `rgba(${col},.75)`); gr.addColorStop(0.45, `rgba(${col},.28)`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(w / 2 - 3.5, 4); g.lineTo(w / 2 + 3.5, 4); g.lineTo(w - 7, h); g.lineTo(7, h); g.closePath(); g.fill();
  const g2 = g.createLinearGradient(0, 0, 0, h * 0.7);
  g2.addColorStop(0, "rgba(255,255,255,.75)"); g2.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = g2;
  g.beginPath(); g.moveTo(w / 2 - 1.5, 4); g.lineTo(w / 2 + 1.5, 4); g.lineTo(w / 2 + 17, h * 0.7); g.lineTo(w / 2 - 17, h * 0.7); g.closePath(); g.fill();
  return c;
}
function cono(r) {
  const c = lienzoNuevo(r * 2 + 4, r * 2 + 4), g = c.getContext("2d"), m = r + 2;
  const gr = g.createRadialGradient(m - r * 0.2, m - r * 0.25, r * 0.1, m, m, r);
  gr.addColorStop(0, "#5a5a66"); gr.addColorStop(0.35, "#1c1c22"); gr.addColorStop(0.8, "#0b0b0e"); gr.addColorStop(1, "#2e2e36");
  g.fillStyle = gr; g.beginPath(); g.arc(m, m, r, 0, 6.283); g.fill();
  g.strokeStyle = "#4a4a55"; g.lineWidth = 3; g.stroke();
  g.fillStyle = "#26262d"; g.beginPath(); g.arc(m, m, r * 0.28, 0, 6.283); g.fill();
  g.fillStyle = "rgba(255,255,255,.18)"; g.beginPath(); g.arc(m - r * 0.08, m - r * 0.1, r * 0.12, 0, 6.283); g.fill();
  return c;
}
function altavoz() {
  const w = 150, h = 320, c = lienzoNuevo(w, h), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, w, 0);
  gr.addColorStop(0, "#0d0d10"); gr.addColorStop(0.5, "#22222a"); gr.addColorStop(1, "#0b0b0d");
  g.fillStyle = gr; rectR(g, 2, 2, w - 4, h - 4, 10); g.fill();
  g.strokeStyle = "#383842"; g.lineWidth = 3; g.stroke();
  g.fillStyle = "#08080a";
  for (const y of [112, 238]) { g.beginPath(); g.arc(w / 2, y, 60, 0, 6.283); g.fill(); }
  g.fillStyle = "#1a1a20"; rectR(g, w / 2 - 26, 22, 52, 30, 8); g.fill();
  g.fillStyle = "#3a3a44"; g.beginPath(); g.arc(w / 2, 37, 10, 0, 6.283); g.fill();
  return c;
}
function cercha() {
  const c = lienzoNuevo(W, 60), g = c.getContext("2d");
  g.strokeStyle = "#4a4a52"; g.lineWidth = 3;
  g.beginPath(); g.moveTo(0, 8); g.lineTo(W, 8); g.moveTo(0, 30); g.lineTo(W, 30); g.stroke();
  g.lineWidth = 1.6; g.beginPath();
  for (let x = 0; x < W; x += 22) { g.moveTo(x, 8); g.lineTo(x + 11, 30); g.lineTo(x + 22, 8); }
  g.stroke();
  for (const x of [150, 370, 654, 874]) {
    g.fillStyle = "#26262c"; rectR(g, x - 18, 26, 36, 26, 5); g.fill();
    g.fillStyle = "#3d3d46"; g.fillRect(x - 3, 30, 6, 4);
  }
  return c;
}
function tapa() {
  const { x0, x1, tb, tf } = MESA, c = lienzoNuevo(x1 - x0 + 40, tf - tb + 14), g = c.getContext("2d");
  g.translate(20 - x0, 4 - tb);
  g.beginPath(); g.moveTo(x0 + 18, tb); g.lineTo(x1 - 18, tb); g.lineTo(x1, tf); g.lineTo(x0, tf); g.closePath();
  const gr = g.createLinearGradient(0, tb, 0, tf);
  gr.addColorStop(0, "#1b1b21"); gr.addColorStop(1, "#2e2e37");
  g.fillStyle = gr; g.fill();
  g.strokeStyle = "#4b4b56"; g.lineWidth = 2; g.stroke();
  for (const [cx, cy] of PLATOS) {
    g.fillStyle = "#3b3d45"; rectR(g, cx - 86, cy - 22, 172, 44, 8); g.fill();
    g.fillStyle = "#5a5d68"; g.beginPath(); g.ellipse(cx, cy, 76, 21, 0, 0, 6.283); g.fill();
  }
  // mesa de mezclas
  g.fillStyle = "#121216"; rectR(g, 480, tb + 4, 64, tf - tb - 8, 5); g.fill();
  const cols = ["#ff3d84", "#2fe3e8", "#ffd34d", "#2bff5b"];
  for (let i = 0; i < 4; i++) { g.fillStyle = cols[i]; g.beginPath(); g.arc(492 + i * 13, tb + 13, 3.6, 0, 6.283); g.fill(); }
  g.fillStyle = "#444"; for (let i = 0; i < 3; i++) g.fillRect(493 + i * 18, tb + 22, 3, 18);
  g.fillStyle = "#ddd"; for (let i = 0; i < 3; i++) g.fillRect(489 + i * 18, tb + 26 + (i % 2) * 8, 11, 5);
  return c;
}
function frente() {
  const { x0, x1, tf } = MESA, h = H + 40 - tf, c = lienzoNuevo(x1 - x0 + 80, h + 40), g = c.getContext("2d");
  g.translate(40 - x0, 20 - tf);
  const gr = g.createLinearGradient(0, tf, 0, H);
  gr.addColorStop(0, "#1e1e25"); gr.addColorStop(1, "#08080a");
  g.fillStyle = gr; g.fillRect(x0, tf, x1 - x0, h);
  g.strokeStyle = "rgba(255,255,255,.05)"; g.lineWidth = 2;
  for (let x = x0 + 40; x < x1; x += 40) { g.beginPath(); g.moveTo(x, tf + 10); g.lineTo(x, H + 40); g.stroke(); }
  // borde de neón verde
  g.shadowColor = `rgb(${VERDE})`; g.shadowBlur = 16;
  g.strokeStyle = `rgb(${VERDE})`; g.lineWidth = 4;
  g.beginPath(); g.moveTo(x0 + 4, tf + 3); g.lineTo(x1 - 4, tf + 3); g.stroke();
  g.shadowBlur = 0;
  // letrero
  txt(g, "DJ GUILLERMO", (x0 + x1) / 2, tf + 66, { tam: 44, peso: 900, fam: FD, color: "#f3dcff", glow: `rgb(${MORADO})`, glowTam: 20, esp: 5 });
  txt(g, "DJ GUILLERMO", (x0 + x1) / 2, tf + 66, { tam: 44, peso: 900, fam: FD, color: "#f3dcff", glow: `rgb(${MORADO})`, glowTam: 8, esp: 5 });
  return c;
}
function sprites() {
  if (SPR10) return SPR10;
  SPR10 = { verde: haz(VERDE), morado: haz(MORADO), cono: cono(50), conoP: cono(18), altavoz: altavoz(), cercha: cercha(), tapa: tapa() };
  return SPR10;
}
function rotulo() {
  if (cache.has("drop")) return cache.get("drop");
  const c = lienzoNuevo(720, 300), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 70, 0, 230);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#b9ffcb"); gr.addColorStop(1, "#2bff5b");
  txt(g, "¡DROP!", 360, 222, { tam: 200, peso: 400, fam: FC, color: gr, borde: "#5a12c9", bordeAncho: 16, esp: 8, glow: `rgba(${MORADO},.95)`, glowTam: 40 });
  txt(g, "¡DROP!", 360, 222, { tam: 200, peso: 400, fam: FC, color: gr, esp: 8 });
  cache.set("drop", c);
  return c;
}
function letrero() {
  if (cache.has("frente")) return cache.get("frente");
  const c = frente(); cache.set("frente", c); return c;
}

/** Cascos de DJ en unidades de avatar (giran con la cabeza). */
function cascos(g, rc) {
  g.save(); g.translate(39, 72); g.rotate(rc); g.translate(-39, -72);
  g.lineCap = "round";
  g.strokeStyle = "#141419"; g.lineWidth = 6.5;
  g.beginPath(); g.moveTo(8, 40); g.bezierCurveTo(3, -22, 75, -22, 70, 40); g.stroke();
  g.strokeStyle = "#4a4a56"; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(9.5, 34); g.bezierCurveTo(6, -18, 72, -18, 68.5, 34); g.stroke();
  for (const [x, s] of [[8, -1], [70, 1]]) {
    rectR(g, x - 8, 32, 16, 26, 7);
    const gr = g.createLinearGradient(x - 8, 0, x + 8, 0);
    gr.addColorStop(0, "#101014"); gr.addColorStop(0.5, "#34343e"); gr.addColorStop(1, "#0d0d10");
    g.fillStyle = gr; g.fill();
    g.strokeStyle = "#55555f"; g.lineWidth = 1; g.stroke();
    g.fillStyle = `rgb(${VERDE})`; g.beginPath(); g.arc(x + s * 2, 45, 2.8, 0, 6.283); g.fill();
  }
  g.restore();
}

class EscenaDJ extends Escena {
  constructor() {
    super(10.0);
    this.p = new Parts(460);
    this.p.suelo = (x) => (x > MESA.x0 && x < MESA.x1 ? MESA.tb + 22 : PIES);
    this.X = 512; this.ESC = 1.45;
    this.flash = 0;
  }
  golpe(t) { if (t < T0) return { n: -1, f: 1 }; const u = (t - T0) / T, n = Math.floor(u); return { n, f: u - n }; }
  /** Luz general: parpadeo al encender, baja en la subida, apagón antes del drop y al final. */
  luz(t) {
    if (t < 0.65) return [0, 0, 0.8, 0.1, 0, 1, 0.4, 1][Math.min(7, Math.floor(t / 0.08))];
    if (t < 4.6) return 1;
    if (t < 5.88) return lerp(1, 0.25, tramo(t, 4.6, 5.85));
    if (t < DROP) return 0;
    return t < CORTE ? 1 : 0;
  }
  estado() {
    const t = this.t, b = this.golpe(t);
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    const kick = Math.exp(-b.f * 7) * (b.n >= 0 ? 1 : 0);
    let manoD = [100, 140], manoI = [-20, 141], y = PIES, sy = 1, dx = 0;
    if (t < DROP) {
      // al compás: rodillas y cabeza
      y += 5 * kick; sy = 1 - 0.012 * kick;
      pose.rc = 0.09 * Math.sin(((t - T0) / T) * Math.PI);
      manoI = [-20 + 4 * Math.sin(t * 3), 141];
      // rasca el disco
      const rasca = t > 1.0 && t < 2.15 || t > 3.55 && t < 4.6;
      if (rasca) manoD = [100 + 14 * Math.sin(t * 21), 140 + 2 * Math.cos(t * 21)];
      pose.cara = t < 1.0 ? "sonrisa" : t < 2.15 ? "guino" : t < 3.55 ? "dormido" : "risa";
      // se aprieta el casco contra la oreja y cierra los ojos
      const kC = eInOut(tramo(t, 2.15, 2.45)) * (1 - eInOut(tramo(t, 3.3, 3.55)));
      if (kC > 0) { manoD = mezcla(manoD, [77, 52], kC); pose.rc = lerp(pose.rc, 0.2, kC); }
      // subida: la mano arriba, poco a poco
      const kS = eInOut(tramo(t, 4.6, 5.7));
      if (kS > 0) {
        manoD = mezcla(manoD, [94, -26], kS);
        pose.cara = t < 5.2 ? "sonrisa" : "sorpresa";
        pose.rc = lerp(pose.rc, -0.06, kS);
        dx = azar(-1, 1) * 2.5 * tramo(t, 5.2, 5.88);
      }
    } else if (t < CORTE + 0.5) {
      // ¡drop!: salta en cada golpe con los brazos arriba
      const salto = Math.sin(Math.PI * Math.min(1, b.f * 1.25));
      y -= 64 * salto * (t < CORTE ? 1 : 0);
      sy = 1 + 0.05 * salto - 0.06 * Math.exp(-b.f * 10);
      manoD = [88 + 6 * Math.sin(t * 9), -22]; manoI = [-10 - 6 * Math.sin(t * 9), -22];
      pose.cara = "risa"; pose.rc = 0.12 * Math.sin(b.n * 1.7);
      pose.piernaI = [-10 * salto, 0.12 * salto]; pose.piernaD = [-10 * salto, -0.12 * salto];
    }
    pose.manoD = manoD; pose.manoI = manoI;
    const rc = pose.rc;
    pose.objD = (g) => cascos(g, rc);
    const m = matAv(this.X + dx, y, this.ESC, 0, 1, sy);
    return { pose, m, kick, b };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const b = this.golpe(t);
    this.una("drop", t > DROP, () => {
      this.flash = 1; temblar(26, 0.7);
      for (let i = 0; i < 170; i++) p.nueva(P.CONFETI, azar(60, W - 60), azar(-160, -10), azar(-80, 80), azar(40, 160), azar(4, 6), azar(9, 15), [0, 3, 2, 4][i % 4]);
      for (const x of [MESA.x0 + 26, MESA.x1 - 26]) for (let i = 0; i < 26; i++) p.nueva(P.VAPOR, x + azar(-10, 10), MESA.tb, azar(-30, 30), azar(-900, -500), azar(0.5, 0.9), azar(40, 80));
      for (let i = 0; i < 30; i++) { const a = azar(0, 6.283), v = azar(250, 700); p.nueva(P.CHISPA, 512, 330, Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 0.8), azar(8, 14)); }
    });
    // chorros de humo en cada compás (cada 4 golpes)
    if (t > DROP + 0.1 && t < CORTE - 0.2 && b.n % 4 === 0 && b.f < 0.25) {
      for (const x of [MESA.x0 + 26, MESA.x1 - 26]) p.nueva(P.VAPOR, x + azar(-8, 8), MESA.tb, azar(-25, 25), azar(-800, -500), azar(0.4, 0.7), azar(36, 70));
    }
    if (t > DROP && t < CORTE - 0.3 && Math.random() < 18 * dt) p.nueva(P.CONFETI, azar(0, W), -10, azar(-40, 40), azar(60, 120), 5, azar(9, 14), [0, 3, 2, 4][(Math.random() * 4) | 0]);
    this.una("ultimo", t > CORTE, () => { temblar(14, 0.25); });
    this.flash = Math.max(0, this.flash - dt * 2.8);
    p.alfa = t < CORTE ? 1 : Math.max(0, 1 - (t - CORTE) * 6);
    p.actualizar(dt);
  }
  /** Haces de luz desde la cercha. */
  haces(g, t, luz, kick) {
    const S = sprites();
    const drop = t >= DROP && t < CORTE;
    const fuentes = drop ? [150, 260, 370, 470, 554, 654, 764, 874] : [150, 370, 654, 874];
    g.save(); g.globalCompositeOperation = "lighter";
    fuentes.forEach((x, i) => {
      let ang, a;
      if (!drop) { ang = 0.42 * Math.sin(t * 1.1 + i * 1.9) + (x < 512 ? 0.15 : -0.15); a = 0.5 * luz; }
      else { ang = 0.75 * Math.sin(t * 3.2 + i * 1.3) * (i % 2 ? 1 : -1); a = (0.55 + 0.45 * kick) * luz * (Math.floor(t * 8 + i) % 5 === 0 ? 0.25 : 1); }
      if (a <= 0.01) return;
      const spr = i % 2 ? S.morado : S.verde;
      g.save(); g.translate(x, 44); g.rotate(ang); g.globalAlpha = Math.min(1, a);
      g.drawImage(spr, -spr.width, -8, spr.width * 2, spr.height * 2);
      g.restore();
    });
    g.restore();
  }
  laseres(g, t, luz, kick) {
    if (t < DROP || luz <= 0) return;
    g.save(); g.globalCompositeOperation = "lighter"; g.lineCap = "round";
    const n = 11, ox = 512, oy = 52, giro = 0.5 * Math.sin(t * 1.7);
    for (const [ancho, alfa] of [[7, 0.12], [2, 0.75]]) {
      g.lineWidth = ancho;
      for (let i = 0; i < n; i++) {
        const a = Math.PI / 2 + giro + (i - (n - 1) / 2) * 0.16;
        g.strokeStyle = `rgba(${i % 2 ? MORADO : VERDE},${alfa * luz * (0.6 + 0.4 * kick)})`;
        g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + Math.cos(a) * 1200, oy + Math.sin(a) * 1200); g.stroke();
      }
    }
    g.fillStyle = `rgba(255,255,255,${0.9 * luz})`; g.beginPath(); g.arc(ox, oy, 5, 0, 6.283); g.fill();
    g.restore();
  }
  altavoces(g, kick, luz) {
    const S = sprites();
    g.save(); g.globalAlpha = Math.min(1, 0.25 + 0.75 * luz);
    for (const x of [40, 834]) {
      g.drawImage(S.altavoz, x, PIES - 320);
      for (const [yy, r] of [[112, 50], [238, 50]]) {
        const s = 1 + 0.09 * kick, R = r * s;
        g.drawImage(S.cono, x + 75 - R - 2 * s, PIES - 320 + yy - R - 2 * s, (R + 2 * s) * 2, (R + 2 * s) * 2);
      }
      // anillo de luz en el cono
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35 * luz * kick;
      g.drawImage(x < 512 ? BLOB.verde : BLOB2.cian, x + 15, PIES - 320 + 178 - 60, 120, 120);
      g.restore();
    }
    g.restore();
  }
  platos(g, t) {
    PLATOS.forEach(([cx, cy], i) => {
      let ang = t * 3.4 + i;
      if (i === 1 && (t > 1.0 && t < 2.15 || t > 3.55 && t < 4.6)) ang = 2.4 * Math.sin(t * 21) - 1; // rascando
      g.fillStyle = "#0a0a0d"; g.beginPath(); g.ellipse(cx, cy, 68, 18.5, 0, 0, 6.283); g.fill();
      g.strokeStyle = "rgba(255,255,255,.08)"; g.lineWidth = 1;
      for (const r of [0.86, 0.72, 0.58]) { g.beginPath(); g.ellipse(cx, cy, 68 * r, 18.5 * r, 0, 0, 6.283); g.stroke(); }
      g.fillStyle = i ? "#b048ff" : "#2bff5b"; g.beginPath(); g.ellipse(cx, cy, 19, 5.2, 0, 0, 6.283); g.fill();
      g.fillStyle = "#ddd"; g.beginPath(); g.ellipse(cx, cy, 2.4, 1, 0, 0, 6.283); g.fill();
      const mx = cx + Math.cos(ang) * 46, my = cy + Math.sin(ang) * 12.5;
      g.fillStyle = "rgba(255,255,255,.85)"; g.beginPath(); g.ellipse(mx, my, 6, 1.8, 0, 0, 6.283); g.fill();
      g.fillStyle = "rgba(255,255,255,.12)"; g.beginPath(); g.ellipse(cx - 22, cy - 7, 22, 3, -0.08, 0, 6.283); g.fill();
      // brazo del tocadiscos
      g.strokeStyle = "#c9ccd4"; g.lineWidth = 2.5; g.lineCap = "round";
      g.beginPath(); g.moveTo(cx + 72, cy - 14); g.lineTo(cx + 56, cy + 6); g.lineTo(cx + 34, cy + 4); g.stroke();
    });
  }
  leds(g, t, luz, kick) {
    if (luz <= 0) return;
    const sube = tramo(t, 4.6, 5.85), drop = t >= DROP;
    g.save(); g.globalAlpha = luz;
    for (const [x0, n] of [[MESA.x0 + 14, 9], [MESA.x1 - 14 - 9 * 17, 9]]) {
      for (let c = 0; c < n; c++) {
        const ruido = 0.5 + 0.5 * Math.sin(t * (7 + c * 1.3) + c * 2.1);
        let nivel = (0.25 + 0.5 * kick) * (0.5 + 0.6 * ruido);
        if (sube > 0 && !drop) nivel = Math.min(1, sube * 1.05 + 0.08 * ruido);
        if (drop) nivel = 0.45 + 0.55 * kick * (0.7 + 0.3 * ruido);
        const segs = Math.round(nivel * 7);
        for (let s = 0; s < 7; s++) {
          const on = s < segs;
          g.fillStyle = on ? (s > 5 ? "#ff3d84" : s > 3 ? "#ffd34d" : "#2bff5b") : "rgba(255,255,255,.06)";
          g.fillRect(x0 + c * 17, 586 - s * 9, 13, 6);
        }
      }
    }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), S = sprites();
    const luz = this.luz(t), kick = e.kick;
    fondo(g, "#000");
    // fondo morado que late
    if (luz > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = luz * (t >= DROP ? 0.25 + 0.35 * kick : 0.18 + 0.1 * kick);
      g.drawImage(t >= DROP && e.b.n % 2 ? BLOB.verde : BLOB2.cian, 112, 80, 800, 460);
      g.restore();
    }
    this.haces(g, t, luz, kick);
    this.laseres(g, t, luz, kick);
    g.save(); g.globalAlpha = Math.min(1, 0.3 + 0.7 * luz); g.drawImage(S.cercha, 0, 0); g.restore();
    this.altavoces(g, kick, luz);
    // tapa de la mesa con los platos
    const aMesa = t < 0.65 ? luz : Math.max(0.3, Math.min(1, luz + (t >= DROP ? 0 : 0.3)));
    g.save(); g.globalAlpha = aMesa;
    g.drawImage(S.tapa, MESA.x0 - 20, MESA.tb - 4);
    this.platos(g, t);
    g.restore();
    // el avatar, por detrás de la mesa (las manos sí van sobre los platos)
    const tL = aPant(e.m, [12, 146])[0], tR = aPant(e.m, [66, 146])[0];
    g.save();
    g.beginPath();
    g.rect(-60, -60, W + 120, MESA.tb + 60);
    g.rect(-60, MESA.tb - 1, tL + 60, MESA.tf - MESA.tb);
    g.rect(tR, MESA.tb - 1, W + 60 - tR, MESA.tf - MESA.tb);
    g.clip();
    pintarAvatar(g, e.m, e.pose, t);
    g.restore();
    // oscurece al DJ cuando baja la luz (silueta en la subida)
    // frente de la mesa
    const F = letrero();
    g.save(); g.globalAlpha = Math.min(1, 0.35 + 0.65 * luz); if (t < 0.65) g.globalAlpha = luz;
    g.drawImage(F, MESA.x0 - 40, MESA.tf - 20);
    g.restore();
    this.leds(g, t, luz, kick);
    this.p.dibujar(g);
    // ¡DROP!
    if (t > DROP) {
      const R = rotulo(), k = tramo(t, DROP, DROP + 0.16);
      const s = lerp(2.6, 1, eIn(k)) * (1 + 0.07 * kick * (t > DROP + 0.2 ? 1 : 0));
      const a = Math.min(1, k * 3) * (t < CORTE ? 1 : Math.max(0, 1 - (t - CORTE) * 2.2));
      if (a > 0) {
        g.save(); g.globalAlpha = a; g.translate(W / 2, 150); g.rotate(-0.05 + 0.02 * Math.sin(t * 3)); g.scale(s * 0.82, s * 0.82);
        g.drawImage(R, -R.width / 2, -R.height / 2 - 20);
        g.restore();
      }
    }
    // subida: oscuridad alrededor y silencio antes del drop
    if (t > 4.6 && t < DROP) {
      const k = tramo(t, 4.6, 5.88);
      g.save(); g.globalAlpha = 0.55 * k + (t > 5.88 ? 0.4 : 0);
      g.fillStyle = "#000"; g.fillRect(-60, -60, W + 120, H + 120);
      g.restore();
      if (t > 5.88) {
        // solo un hilo de luz en la mano levantada
        const q = aPant(e.m, e.pose._manoD || [94, -26]);
        g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.7;
        g.drawImage(BLOB.blanco, q[0] - 40, q[1] - 40, 80, 80); g.restore();
      }
    }
    if (this.flash > 0) { g.fillStyle = `rgba(240,255,245,${this.flash * 0.85})`; g.fillRect(-60, -60, W + 120, H + 120); }
    // apagón final y encendido inicial
    if (t >= CORTE || t < 0.65) {
      const a = t < 0.65 ? 1 - luz : 1;
      if (a > 0) { g.fillStyle = `rgba(0,0,0,${t >= CORTE ? 1 : a})`; g.fillRect(-60, -60, W + 120, H + 120); }
      if (t >= CORTE && t < CORTE + 0.6) {
        // el eco del ¡DROP! se apaga en la oscuridad
        const R = rotulo(), a2 = 0.5 * (1 - tramo(t, CORTE, CORTE + 0.55));
        g.save(); g.globalAlpha = a2; g.translate(W / 2, 150); g.scale(0.82 * (1 + 0.15 * tramo(t, CORTE, CORTE + 0.6)), 0.82 * (1 + 0.15 * tramo(t, CORTE, CORTE + 0.6)));
        g.drawImage(R, -R.width / 2, -R.height / 2 - 20); g.restore();
      }
    }
  }
}

registrar({ id: "00010", nombre: "DJ Guillermo", crear: () => new EscenaDJ() });
})();
