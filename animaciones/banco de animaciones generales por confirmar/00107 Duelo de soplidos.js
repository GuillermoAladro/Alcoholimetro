"use strict";
/*
 * 00107 · DUELO DE SOPLIDOS
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se encienden dos medidores de g/L, uno para cada uno. Guillermo y Rodrigo cogen su boquilla, se retan con la
 * mirada (¡DUELO DE SOPLIDOS!) y soplan a la vez: las agujas suben a la par, uno se adelanta, el otro se pica y
 * sopla más… hasta que los dos medidores revientan a la vez en una lluvia de chispas. Se miran despeinados y
 * tiznados, y se echan a reír.
 */
(() => {
const ESC = 1.45, XG = 190, XR = 834;
const CAJAS = [
  { x0: 305, x1: 480, nombre: "GUILLERMO", col: "#2bff5b", rgb: "43,255,91", puerto: [305, 470] },
  { x0: 544, x1: 719, nombre: "RODRIGO", col: "#2fe3e8", rgb: "47,227,232", puerto: [719, 470] },
];
const TOP = 182, DY = 306, DR = 70, T_YA = 1.8, T_BOOM = 6.3;
// valores de cada medidor (g/L)
const VG = [[T_YA, 0], [2.7, 0.95], [3.1, 1.5], [3.6, 1.62], [4.2, 2.15], [5.0, 2.5], [5.7, 2.86], [6.2, 3.06]];
const VR = [[T_YA, 0], [2.7, 0.85], [3.1, 1.02], [3.6, 1.9], [4.2, 2.05], [5.0, 2.58], [5.7, 2.9], [6.2, 3.06]];

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const u = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return lerp(k[i - 1][1], k[i][1], (k[i][2] || eInOut)(u)); }
  return k[k.length - 1][1];
}
const angDial = (v) => (Math.PI * 5) / 6 + (clamp(v, 0, 3.1) / 3) * ((Math.PI * 4) / 3);
function bez(a, b, c, d, u) {
  const v = 1 - u;
  return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]];
}
/** Boquilla: tubito blanco de (x0, y0) (la boca) a (x1, y1) (donde empieza la manguera), en unidades de avatar. */
function boquilla(g, x0, y0, x1, y1) {
  g.save(); g.lineCap = "round";
  g.strokeStyle = "#8f9aa3"; g.lineWidth = 7.5; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  g.strokeStyle = "#e9eef2"; g.lineWidth = 5.5; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  g.strokeStyle = "rgba(255,255,255,.95)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x0 + 1, y0 - 1.6); g.lineTo(x1, y1 - 1.6); g.stroke();
  g.fillStyle = "#2a2f35"; g.beginPath(); g.arc(x1, y1, 3.6, 0, 6.283); g.fill();
  g.restore();
}

class DueloSoplidos extends Escena {
  constructor() {
    super(10.0);
    this.p = new Parts(460);
    this.vidrios = []; this.agujas = []; this.gotas = [];
    this.flash = 0;
    this.cache = cacheTexto();
    const r = semilla(107);
    // grietas del cristal (las mismas para los dos)
    this.grietas = [];
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * 6.283 + r() * 0.5, pts = [[0, 0]];
      let x = 0, y = 0;
      for (let k = 0; k < 4; k++) { x += Math.cos(a + (r() - 0.5) * 0.8) * DR * 0.26; y += Math.sin(a + (r() - 0.5) * 0.8) * DR * 0.26; pts.push([x, y]); }
      this.grietas.push(pts);
    }
  }
  esfuerzo(t) { return t < T_YA || t >= T_BOOM ? 0 : 0.2 + 0.8 * eIn(tramo(t, T_YA, 6.2) * 1.0); }
  valor(i, t) {
    if (t >= T_BOOM) return 0;
    const v = pista(t, i ? VR : VG);
    return v + (v > 2.6 ? Math.sin(t * 61 + i * 2) * 0.06 : v > 0.3 ? Math.sin(t * 23 + i) * 0.025 : 0);
  }
  /** [Guillermo, Rodrigo] */
  estado() {
    const t = this.t, ef = this.esfuerzo(t);
    const boom = t >= T_BOOM, dB = t - T_BOOM;
    const kCoge = eInOut(tramo(t, 0.75, 1.15));
    const kSuelta = boom ? eOut(tramo(dB, 0.05, 0.35)) : 0;
    const res = [];
    for (let i = 0; i < 2; i++) {
      const q = i ? "rodrigo" : undefined, s = i ? -1 : 1; // s: hacia el otro
      const pose = { quien: q, cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
      // miradas y caras
      let rc = 0, cara = "sonrisa";
      if (t > 1.1 && t < 1.85) { rc = 0.13 * Math.sin(Math.PI * tramo(t, 1.1, 1.85)); cara = "guino"; }
      else if (t >= 1.85 && t < T_BOOM) {
        cara = "sorpresa";
        const mira = i ? [2.75, 3.15] : [3.35, 3.8];     // mira el medidor del otro
        if (t > mira[0] && t < mira[1]) rc = 0.2 * Math.sin(Math.PI * tramo(t, mira[0], mira[1]));
        if (t > mira[1]) cara = t > 5.0 && Math.sin(t * 13 + i * 2) > 0.1 ? "borracho" : "dormido";
        rc += Math.sin(t * 47 + i * 3) * 0.02 * ef;
      } else if (boom) {
        cara = "sorpresa";
        const kMira = eInOut(tramo(dB, 0.95, 1.3));
        rc = 0.17 * kMira;
        if (dB > 1.45) cara = "risa";
        if (dB > 1.45 && i === 1 && dB < 1.9) cara = "guino";
        rc += dB > 1.45 ? 0.04 * Math.sin(dB * 14) : 0;
      }
      pose.rc = rc * s; pose.cara = cara;
      // la boquilla: de la cadera a la boca
      const b = boca(pose.rc, q);
      const enBoca = i ? [b[0] - 12, b[1] + 6] : [b[0] + 12, b[1] + 6];
      const reposo = i ? [9, 157] : [70, 158];
      const abajo = i ? [4, 150] : [75, 150];
      let mano = mezcla(mezcla(reposo, enBoca, kCoge), abajo, kSuelta);
      // la otra mano: puño apretado que tiembla
      const tr = ef * 1.6;
      const otra = i ? [74 + Math.sin(t * 57) * tr, 150] : [4 + Math.sin(t * 57) * tr, 150];
      if (boom && dB < 0.9) { // del susto, los brazos arriba
        const k = Math.sin(Math.PI * tramo(dB, 0, 0.9));
        const arriba = i ? [92, 70] : [-14, 70];
        if (i) pose.manoD = mezcla(otra, arriba, k); else pose.manoI = mezcla(otra, arriba, k);
      } else if (i) pose.manoD = otra; else pose.manoI = otra;
      if (i) { pose.manoI = mano; pose.brazoIDelante = true; } else pose.manoD = mano;
      const dibB = (g, m) => {
        if (i) boquilla(g, m[0] + 12, m[1] - 6, m[0] - 8, m[1] - 3);
        else boquilla(g, m[0] - 12, m[1] - 6, m[0] + 8, m[1] - 3);
      };
      if (i) pose.objI = dibB; else pose.objD = dibB;
      // pelo de punta por el esfuerzo y, tras la explosión, despeinados
      pose.puntas = boom ? 1 - 0.15 * tramo(dB, 0.4, 1.2) : 0.4 * tramo(t, 3.4, 6.2);
      // se hinchan al soplar; la onda expansiva los echa hacia atrás
      let sx = 1 + 0.07 * ef * (0.75 + 0.25 * Math.sin(t * 9 + i)), sy = 1 + 0.012 * ef, dx = Math.sin(t * 53 + i * 5) * 2.2 * ef;
      if (boom) { const k = Math.exp(-dB * 5) * Math.sin(Math.min(dB * 9, Math.PI)); dx = -s * 26 * eOut(tramo(dB, 0, 0.12)) * (1 - eInOut(tramo(dB, 0.5, 1.1))); sy = 1 - 0.06 * k; sx = 1 + 0.04 * k; }
      const m = matAv((i ? XR : XG) + dx, PIES, ESC, boom ? -s * 0.05 * (1 - tramo(dB, 0.2, 1.0)) : 0, sx, sy);
      // dónde empieza la manguera (pantalla)
      const ext = i ? [mano[0] - 8, mano[1] - 3] : [mano[0] + 8, mano[1] - 3];
      res.push({ pose, m, ext: aPant(m, ext), ef });
    }
    return res;
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("ya", t > T_YA, () => temblar(5, 0.15));
    this.una("titulo", t > 0.95, () => temblar(10, 0.25));
    const ef = this.esfuerzo(t);
    if (ef > 0.55) temblar(1 + 4 * (ef - 0.55), 0.1);
    // vapor y sudor cuando ya no pueden más
    if (t > 4.6 && t < T_BOOM) {
      for (const c of CAJAS) if (Math.random() < 14 * dt * ef) p.nueva(P.VAPOR, (c.x0 + c.x1) / 2 + azar(-50, 50), DY - DR - 6, azar(-25, 25), azar(-120, -60), azar(0.6, 1.0), azar(18, 30));
    }
    if (t > 3.6 && t < T_BOOM && Math.random() < 7 * dt) {
      const e = this.estado(), i = Math.random() < 0.5 ? 0 : 1, lado = Math.random() < 0.5 ? -1 : 1;
      const q = aPant(e[i].m, [39 + lado * 28, i ? 40 : 30]);
      this.gotas.push({ x: q[0], y: q[1], vx: lado * azar(40, 110), vy: azar(-170, -70), v: 0.8 });
    }
    for (const d of this.gotas) { d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.v -= dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    // ¡BOOM! los dos a la vez
    this.una("boom", t > T_BOOM, () => {
      temblar(36, 0.8); this.flash = 0.85;
      for (const c of CAJAS) {
        const cx = (c.x0 + c.x1) / 2;
        p.nueva(P.DESTELLO, cx, DY, 0, 0, 0.5, 300);
        for (let k = 0; k < 46; k++) { const a = azar(0, 6.283), v = azar(250, 900); p.nueva(P.CHISPA, cx, DY, Math.cos(a) * v, Math.sin(a) * v - 200, azar(0.5, 1.2), azar(8, 16)); }
        for (let k = 0; k < 12; k++) p.nueva(P.HUMO, cx + azar(-40, 40), DY + azar(-30, 30), azar(-120, 120), azar(-160, -40), azar(1.2, 2.2), azar(40, 70));
        for (let k = 0; k < 16; k++) { const a = azar(0, 6.283), v = azar(200, 650); this.vidrios.push({ x: cx + Math.cos(a) * 30, y: DY + Math.sin(a) * 30, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 250, r: azar(0, 6), vr: azar(-14, 14), s: azar(6, 13) }); }
        this.agujas.push({ x: cx, y: DY, vx: (cx < W / 2 ? -1 : 1) * azar(150, 260), vy: -820, a: 0, va: (cx < W / 2 ? -1 : 1) * 22, col: c.col });
      }
      for (const x of [XG, XR]) for (let k = 0; k < 6; k++) p.nueva(P.HUMO, x + azar(-40, 40), 300 + azar(-30, 30), azar(-60, 60), azar(-80, -20), azar(1.4, 2.4), azar(40, 70));
    });
    for (const v of this.vidrios) { v.vy += 1300 * dt; v.x += v.vx * dt; v.y += v.vy * dt; v.r += v.vr * dt; if (v.y > PIES - 3) { v.y = PIES - 3; v.vy *= -0.25; v.vx *= 0.5; v.vr *= 0.5; } }
    for (const a of this.agujas) { a.vy += 1200 * dt; a.x += a.vx * dt; a.y += a.vy * dt; a.a += a.va * dt; }
    // chispitas y humo de los medidores rotos
    if (t > T_BOOM + 0.3 && t < 9.4) for (const c of CAJAS) {
      const cx = (c.x0 + c.x1) / 2;
      if (Math.random() < 3 * dt) p.nueva(P.ELECTRICA, cx + azar(-30, 30), DY + azar(-20, 20), azar(-80, 80), azar(-80, 30), azar(0.15, 0.3), azar(14, 24));
      if (Math.random() < 6 * dt) p.nueva(P.HUMO, cx + azar(-30, 30), DY - 20, azar(-15, 15), azar(-70, -40), azar(1.2, 1.8), azar(26, 40));
    }
    this.flash = Math.max(0, this.flash - dt * 2.2);
    p.actualizar(dt);
  }
  /** Las dos máquinas (sin el interior del medidor), pintadas una vez. */
  maquinas() {
    if (this.cache.has("m")) return this.cache.get("m");
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    for (const k of CAJAS) {
      const w = k.x1 - k.x0, cx = (k.x0 + k.x1) / 2;
      // cuerpo
      g.save();
      g.shadowColor = `rgba(${k.rgb},.35)`; g.shadowBlur = 24;
      rectR(g, k.x0, TOP, w, PIES - TOP, 18);
      const gr = g.createLinearGradient(k.x0, 0, k.x1, 0);
      gr.addColorStop(0, "#1a1d22"); gr.addColorStop(0.18, "#3a404a"); gr.addColorStop(0.5, "#2a2f37"); gr.addColorStop(1, "#121418");
      g.fillStyle = gr; g.fill();
      g.restore();
      g.strokeStyle = "rgba(255,255,255,.18)"; g.lineWidth = 2; rectR(g, k.x0 + 1, TOP + 1, w - 2, PIES - TOP - 2, 17); g.stroke();
      // cartel con el nombre
      rectR(g, k.x0 + 10, TOP + 10, w - 20, 40, 10); g.fillStyle = "#07090b"; g.fill();
      g.strokeStyle = `rgba(${k.rgb},.7)`; g.lineWidth = 2; g.stroke();
      txt(g, k.nombre, cx, TOP + 41, { tam: 30, peso: 900, fam: FD, color: "#f4fff6", glow: k.col, glowTam: 14, esp: 2, max: w - 34 });
      // bisel del medidor
      g.save(); g.translate(cx, DY);
      const gb = g.createLinearGradient(0, -DR - 8, 0, DR + 8);
      gb.addColorStop(0, "#f1f4f7"); gb.addColorStop(0.45, "#8a939c"); gb.addColorStop(1, "#d6dbe0");
      g.fillStyle = gb; g.beginPath(); g.arc(0, 0, DR + 8, 0, 6.283); g.fill();
      g.fillStyle = "#06090a"; g.beginPath(); g.arc(0, 0, DR, 0, 6.283); g.fill();
      g.restore();
      // pantallita
      rectR(g, cx - 64, 392, 128, 44, 8); g.fillStyle = "#04140a"; g.fill(); g.strokeStyle = "#596069"; g.lineWidth = 3; g.stroke();
      // ranura de tarjeta y rejilla
      g.fillStyle = "#0a0b0d"; rectR(g, cx - 40, 458, 80, 8, 4); g.fill();
      g.fillStyle = "rgba(255,255,255,.12)";
      for (let y = 488; y < 548; y += 10) { rectR(g, cx - 48, y, 96, 4, 2); g.fill(); }
      // toma de la manguera
      const pt = k.puerto, s = pt[0] < cx ? -1 : 1;
      const gt = g.createLinearGradient(0, pt[1] - 12, 0, pt[1] + 12);
      gt.addColorStop(0, "#e8ecf0"); gt.addColorStop(1, "#6d757e");
      g.fillStyle = gt; rectR(g, pt[0] - (s < 0 ? 16 : 0), pt[1] - 11, 16, 22, 4); g.fill();
      // piloto de aviso
      g.fillStyle = "#3a0d0d"; g.beginPath(); g.arc(cx, TOP - 2, 13, Math.PI, 0); g.fill();
    }
    this.cache.set("m", c);
    return c;
  }
  esfera() {
    if (this.cache.has("e")) return this.cache.get("e");
    const S = DR * 2 + 4, c = lienzoNuevo(S, S), g = c.getContext("2d");
    g.translate(S / 2, S / 2);
    const gr = g.createRadialGradient(0, -20, 4, 0, 0, DR);
    gr.addColorStop(0, "#14261a"); gr.addColorStop(1, "#050b07");
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, DR, 0, 6.283); g.fill();
    // zona roja
    g.strokeStyle = "rgba(255,40,40,.85)"; g.lineWidth = 9;
    g.beginPath(); g.arc(0, 0, DR - 9, angDial(2.4), angDial(3)); g.stroke();
    for (let v = 0; v <= 3.001; v += 0.25) {
      const a = angDial(v), larga = Math.abs(v - Math.round(v)) < 0.01;
      g.strokeStyle = v >= 2.4 ? "#ff6b6b" : "#bfffd0"; g.lineWidth = larga ? 3 : 1.6;
      g.beginPath(); g.moveTo(Math.cos(a) * (DR - 4), Math.sin(a) * (DR - 4)); g.lineTo(Math.cos(a) * (DR - (larga ? 16 : 10)), Math.sin(a) * (DR - (larga ? 16 : 10))); g.stroke();
      if (larga) txt(g, String(Math.round(v)), Math.cos(a) * (DR - 28), Math.sin(a) * (DR - 28) + 7, { tam: 20, peso: 900, fam: FD, color: v >= 2.4 ? "#ff8080" : "#e8fff0" });
    }
    txt(g, "g/L", 0, 40, { tam: 18, peso: 800, color: "#7fdc98" });
    this.cache.set("e", c);
    return c;
  }
  titulo() {
    if (this.cache.has("t")) return this.cache.get("t");
    const c = lienzoNuevo(1000, 170), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 130);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡DUELO DE SOPLIDOS!", 500, 122, { tam: 104, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 11, esp: 3, glow: "rgba(255,170,30,.85)", glowTam: 24, max: 950 });
    this.cache.set("t", c);
    return c;
  }
  manguera(g, a, b, cx, t, ef) {
    const s = b[0] < cx ? -1 : 1; // la toma está a este lado de la máquina
    const c1 = [a[0] - s * 10, a[1] + clamp(560 - a[1], 50, 110)], c2 = [b[0] + s * 70, b[1] + 30];
    g.save(); g.lineCap = "round";
    g.strokeStyle = "#0e1013"; g.lineWidth = 13;
    g.beginPath(); g.moveTo(a[0], a[1]); g.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], b[0], b[1]); g.stroke();
    g.strokeStyle = "#353b44"; g.lineWidth = 9; g.stroke();
    g.setLineDash([2.5, 5]); g.strokeStyle = "#6b7480"; g.lineWidth = 9; g.stroke(); g.setLineDash([]);
    // el soplido viaja por la manguera
    if (ef > 0) {
      g.globalCompositeOperation = "lighter";
      const n = 5, vel = 1.2 + 2.2 * ef;
      for (let k = 0; k < n; k++) {
        const u = (t * vel + k / n) % 1, q = bez(a, c1, c2, b, u), r = 9 + 7 * ef;
        g.globalAlpha = 0.55 * Math.sin(Math.PI * u);
        g.drawImage(BLOB.blanco, q[0] - r, q[1] - r, r * 2, r * 2);
      }
    }
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), boom = t >= T_BOOM;
    fondo(g, "#000");
    const luz = 1 - tramo(t, 9.35, 9.95);
    // luz de ambiente y suelo
    g.save(); g.globalCompositeOperation = "lighter";
    g.globalAlpha = 0.3; g.drawImage(BLOB2.oroClaro, 40, 120, 944, 560);
    for (const c of CAJAS) { g.globalAlpha = 0.28; g.drawImage(c.col === "#2bff5b" ? BLOB.verde : BLOB2.cian, (c.x0 + c.x1) / 2 - 170, PIES - 40, 340, 80); }
    g.restore();
    g.fillStyle = "rgba(255,255,255,.07)"; g.fillRect(-60, PIES, W + 120, 2);
    // las máquinas
    g.drawImage(this.maquinas(), 0, 0);
    CAJAS.forEach((c, i) => {
      const cx = (c.x0 + c.x1) / 2, v = this.valor(i, t), tiembla = boom ? 0 : (v > 2.3 ? 2.2 : 0);
      g.save(); g.translate(cx + azar(-tiembla, tiembla), DY + azar(-tiembla, tiembla));
      const S = DR * 2 + 4;
      g.drawImage(this.esfera(), -S / 2, -S / 2);
      if (!boom) {
        // brillo del cristal y aguja
        g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.18 + 0.25 * (v / 3);
        g.drawImage(v > 2.4 ? BLOB.rojo : BLOB.verde, -DR, -DR, DR * 2, DR * 2); g.restore();
        const a = angDial(v);
        g.save(); g.rotate(a);
        g.shadowColor = "rgba(255,60,60,.9)"; g.shadowBlur = 10;
        g.fillStyle = "#ff3b2f"; g.beginPath(); g.moveTo(-12, -3.5); g.lineTo(DR - 10, -1); g.lineTo(DR - 10, 1); g.lineTo(-12, 3.5); g.closePath(); g.fill();
        g.restore();
        g.fillStyle = "#d8dde2"; g.beginPath(); g.arc(0, 0, 8, 0, 6.283); g.fill();
        g.fillStyle = "rgba(255,255,255,.12)"; g.beginPath(); g.ellipse(-16, -30, 34, 16, -0.5, 0, 6.283); g.fill();
      } else {
        // roto: cristal astillado y negro
        g.fillStyle = "rgba(0,0,0,.72)"; g.beginPath(); g.arc(0, 0, DR, 0, 6.283); g.fill();
        g.strokeStyle = "rgba(220,240,255,.75)"; g.lineWidth = 1.6;
        for (const pts of this.grietas) { g.beginPath(); pts.forEach((q, j) => (j ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.stroke(); }
        g.fillStyle = "#111"; g.beginPath(); g.arc(0, 0, 9, 0, 6.283); g.fill();
      }
      g.restore();
      // pantallita
      let lcd, col = c.col;
      if (!boom) lcd = t < 0.7 ? "" : fmt(clamp(v, 0, 2.99)) + " g/L";
      else { lcd = Math.sin(t * 14) > -0.3 ? "ERROR" : ""; col = "#ff4b4b"; }
      if (lcd) txt(g, lcd, cx, 425, { tam: 30, peso: 800, fam: FT, color: col, glow: col, glowTam: 8, max: 118 });
      // piloto de aviso
      const aviso = !boom && v > 2.3 ? (Math.sin(t * 30) > 0 ? 1 : 0.25) : boom ? 0 : 0.1;
      if (aviso > 0) {
        g.save(); g.fillStyle = `rgba(255,${aviso > 0.5 ? 70 : 30},40,${0.5 + 0.5 * aviso})`;
        g.beginPath(); g.arc(cx, TOP - 2, 13, Math.PI, 0); g.fill();
        g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.6 * aviso; g.drawImage(BLOB.rojo, cx - 60, TOP - 60, 120, 120);
        g.restore();
      }
    });
    // avatares
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    // mofletes colorados del esfuerzo y, después, tiznados
    for (let i = 0; i < 2; i++) {
      const ojo = i ? [[25, 60], [51, 60]] : [[25, 52], [53, 52]];
      if (e[i].ef > 0.3) {
        g.save(); g.globalAlpha = 0.55 * tramo(e[i].ef, 0.3, 0.8);
        for (const o of ojo) { const q = aPant(e[i].m, o), r = 15; g.drawImage(BLOB.rojo, q[0] - r, q[1] - r, r * 2, r * 2); }
        g.restore();
      }
      if (boom) {
        g.save(); g.globalAlpha = 0.6 * (1 - 0.3 * tramo(t, T_BOOM + 1, T_BOOM + 3));
        const manchas = i ? [[21, 64, 10], [54, 30, 9], [47, 72, 7]] : [[21, 54, 10], [55, 22, 9], [52, 60, 7]];
        for (const [x, y, r] of manchas) { const q = aPant(e[i].m, [x, y]), rr = r * ESC; g.drawImage(BLOB.humo, q[0] - rr, q[1] - rr, rr * 2, rr * 2); }
        g.restore();
      }
    }
    // mangueras (por delante)
    this.manguera(g, e[0].ext, CAJAS[0].puerto, (CAJAS[0].x0 + CAJAS[0].x1) / 2, t, e[0].ef);
    this.manguera(g, e[1].ext, CAJAS[1].puerto, (CAJAS[1].x0 + CAJAS[1].x1) / 2, t + 0.37, e[1].ef);
    // sudor
    g.fillStyle = "#bfe9ff";
    for (const d of this.gotas) { g.beginPath(); g.ellipse(d.x, d.y, 4, 6, 0, 0, 6.283); g.fill(); }
    // cristales y agujas que salen volando
    for (const v of this.vidrios) {
      g.save(); g.translate(v.x, v.y); g.rotate(v.r);
      g.fillStyle = "rgba(210,235,255,.75)"; g.beginPath(); g.moveTo(-v.s / 2, -v.s / 3); g.lineTo(v.s / 2, -v.s / 4); g.lineTo(0, v.s / 2); g.closePath(); g.fill();
      g.restore();
    }
    for (const a of this.agujas) {
      g.save(); g.translate(a.x, a.y); g.rotate(a.a);
      g.fillStyle = "#ff3b2f"; g.fillRect(-12, -3, DR, 6); g.fillStyle = "#d8dde2"; g.beginPath(); g.arc(0, 0, 7, 0, 6.283); g.fill();
      g.restore();
    }
    this.p.dibujar(g);
    // ¡YA!
    if (t > T_YA - 0.1 && t < T_YA + 0.55) {
      const k = eBack(tramo(t, T_YA - 0.1, T_YA + 0.05));
      g.save(); g.translate(512, 152); g.scale(k, k); g.rotate(-0.06);
      txt(g, "¡YA!", 0, 0, { tam: 64, peso: 400, fam: FC, color: "#fffdf5", borde: "#7a0008", bordeAncho: 9, alfa: 1 - tramo(t, T_YA + 0.35, T_YA + 0.55), esp: 3 });
      g.restore();
    }
    // el título: al principio (el reto) y en el remate
    const spr = this.titulo();
    const muestra = (t0, t1, y, esc) => {
      if (t < t0 || t > t1) return;
      const d = t - t0, k = tramo(d, 0, 0.16), s = lerp(2.6, 1, eIn(k)) * esc * (1 + 0.025 * Math.sin(d * 7));
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - tramo(t, t1 - 0.3, t1)); g.translate(512, y); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    };
    muestra(0.72, 1.78, 92, 0.92);
    muestra(T_BOOM + 1.2, 9.9, 96, 1.0);
    if (this.flash > 0) { g.fillStyle = `rgba(255,250,230,${this.flash})`; g.fillRect(-60, -60, W + 120, H + 120); }
    // se enciende con parpadeo y se apaga al final
    const on = t < 0.6 ? [0, 0.6, 0, 0, 1, 0.4, 1][Math.min(6, Math.floor(t / 0.085))] : 1;
    const a = Math.max(1 - on, 1 - luz);
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00107", nombre: "Duelo de soplidos", crear: () => new DueloSoplidos() });
})();
