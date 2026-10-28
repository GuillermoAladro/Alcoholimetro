"use strict";
/*
 * 00112 · BATALLA DE BAILE
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende la pista de baile y se retan (¡BATALLA!). Primero baila Guillermo (señala al cielo, brazos arriba y
 * se abre de piernas) mientras Rodrigo le mira de brazos cruzados; luego Rodrigo (robot, una rueda lateral y se
 * desliza hacia atrás) mientras Guillermo le mira. El aplausómetro del centro sube con cada uno. Al final bailan
 * juntos, a la par, y el aplausómetro revienta en confeti.
 */
(() => {
const ESC = 1.5, XG = 268, XR = 756, DUR = 11.4, BEAT = 0.5;
const T_G = 1.85, T_R = 4.15, T_JUNTOS = 6.65, T_BOOM = 8.7;
const M = { x: 512, y0: 196, y1: 520, w: 58, n: 14 };
const NIVEL = [[T_G, 0], [2.65, 0.18], [3.35, 0.34], [4.0, 0.55], [4.95, 0.63], [5.75, 0.82], [6.45, 0.87], [7.4, 1.0], [8.6, 1.2]];
const CLAPS = [2.65, 3.35, 4.0, 4.95, 5.75, 6.45, 7.05, 7.6, 8.1];

function pista(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const u = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return lerp(k[i - 1][1], k[i][1], (k[i][2] || eInOut)(u)); }
  return k[k.length - 1][1];
}
/** golpe de ritmo: 1 justo en el tiempo y baja rápido */
const golpe = (t) => Math.exp(-((t % BEAT) / BEAT) * 5);
/** salta de una pose a otra en cada tiempo (casi de golpe) */
function alterna(t, a, b, per = BEAT) {
  const f = (t / per) % 2, k = f < 1 ? eOut(clamp(f / 0.25, 0, 1)) : 1 - eOut(clamp((f - 1) / 0.25, 0, 1));
  return mezcla(a, b, k);
}

class BatallaBaile extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(480);
    this.cache = cacheTexto();
    this.notas = [];
    this.trozos = [];
  }
  nivel(t) { return t >= T_BOOM ? 0 : pista(t, NIVEL); }
  /** pose de quien mira de brazos cruzados */
  mirando(i, t, impresionado) {
    const pose = { quien: i ? "rodrigo" : undefined, cara: impresionado ? "sorpresa" : "sonrisa", rc: 0.06 * Math.sin((t / BEAT) * Math.PI) * (impresionado ? 0 : 1), brazoIDelante: true };
    if (i) { pose.manoD = [22, 128]; pose.manoI = [54, 130]; pose.rc -= 0.08; }
    else { pose.manoD = [20, 118]; pose.manoI = [58, 122]; pose.rc += 0.08; }
    // golpecitos con el pie
    const pie = -4 * golpe(t);
    if (i) pose.piernaI = [pie, 0]; else pose.piernaD = [pie, 0];
    return { pose, dx: 0, dy: 0, giro: 0, sx: 1, sy: 1 };
  }
  bailaG(t) {
    const d = t - T_G, pose = { cara: "risa", rc: 0 }, r = { pose, dx: 0, dy: 0, giro: 0, sx: 1, sy: 1 };
    if (d < 0.85) { // señala al cielo y al suelo
      pose.manoD = alterna(t, [104, 2], [34, 170]); pose.manoI = [4, 140];
      r.giro = 0.07 * Math.sin((t / BEAT) * Math.PI); pose.rc = -r.giro;
      pose.piernaD = alterna(t, [-9, -0.12], [0, 0]); pose.cara = "guino";
    } else if (d < 1.55) { // brazos arriba de lado a lado
      const w = (t / BEAT) * Math.PI;
      pose.manoD = [72 + 16 * Math.sin(w), 0]; pose.manoI = [6 + 16 * Math.sin(w), 0];
      r.giro = 0.09 * Math.sin(w); r.sy = 1 - 0.04 * golpe(t); r.dy = -14 * golpe(t);
    } else { // ¡se abre de piernas!
      const k = eOut(tramo(d, 1.55, 1.72));
      pose.piernaI = [0, 0.98 * k]; pose.piernaD = [0, -0.98 * k];
      r.dy = 50 * k; pose.manoD = mezcla([72, 0], [142, 82], k); pose.manoI = mezcla([6, 0], [-64, 82], k);
      pose.cara = d > 1.8 ? "guino" : "risa"; pose.rc = 0.08 * k;
    }
    return r;
  }
  bailaR(t) {
    const d = t - T_R, pose = { quien: "rodrigo", cara: "sonrisa", rc: 0 }, r = { pose, dx: 0, dy: 0, giro: 0, sx: 1, sy: 1 };
    if (d < 0.8) { // robot
      const P = [[[96, 92], [10, 157], 0.1], [[68, 157], [-20, 92], -0.1], [[98, 60], [-20, 128], 0.08], [[100, 128], [-24, 58], -0.08]];
      const q = P[Math.floor(d / 0.2) % 4];
      pose.manoD = q[0]; pose.manoI = q[1]; pose.rc = q[2]; r.giro = -q[2] * 0.3; pose.cara = "guino";
    } else if (d < 1.6) { // rueda lateral hacia el centro
      const u = eInOut(tramo(d, 0.8, 1.6));
      r.rueda = { x: XR - 150 * u, ang: -6.283 * u, alto: 26 * Math.sin(Math.PI * u) };
      pose.manoD = [84, -16]; pose.manoI = [-6, -16]; pose.piernaI = [0, 0.5]; pose.piernaD = [0, -0.5]; pose.cara = "risa";
    } else { // se desliza hacia atrás y pose final
      const u = eInOut(tramo(d, 1.62, 2.15)), f = d * 14;
      r.dx = -150 * (1 - u);
      pose.piernaI = [-6 * Math.max(0, Math.sin(f)), 0]; pose.piernaD = [-6 * Math.max(0, -Math.sin(f)), 0];
      if (u >= 1) { pose.piernaI = [0, 0]; pose.piernaD = [0, 0]; }
      const k = eBack(tramo(d, 2.0, 2.2));
      pose.manoI = mezcla([10, 150], [-28, 2], k); pose.manoD = mezcla([68, 157], [74, 134], k);
      pose.cara = d > 2.0 ? "guino" : "risa"; pose.rc = -0.08 * k;
    }
    return r;
  }
  juntos(i, t) {
    const d = t - T_JUNTOS, s = i ? -1 : 1, w = (t / BEAT) * Math.PI;
    const pose = { quien: i ? "rodrigo" : undefined, cara: "risa", rc: 0 }, r = { pose, dx: 0, dy: 0, giro: 0, sx: 1, sy: 1 };
    const centro = i ? [38, 0] : [39, 0];
    if (d < 1.0) { // brazos arriba y saltitos, a la par
      pose.manoD = [centro[0] + 34 + 14 * Math.sin(w), 0]; pose.manoI = [centro[0] - 34 + 14 * Math.sin(w), 0];
      r.giro = 0.08 * Math.sin(w); r.dy = -22 * golpe(t);
    } else { // señalan al cielo, en espejo
      const arriba = i ? [-26, 4] : [104, 2], abajo = i ? [42, 170] : [34, 170];
      if (i) { pose.manoI = alterna(t, arriba, abajo, BEAT / 2); pose.manoD = [72, 142]; pose.brazoIDelante = true; }
      else { pose.manoD = alterna(t, arriba, abajo, BEAT / 2); pose.manoI = [4, 140]; }
      r.giro = s * 0.07 * Math.sin(w * 2); r.dy = -10 * golpe(t * 2);
      pose.cara = Math.sin(w) > 0 ? "risa" : "guino";
    }
    pose.rc = 0.05 * Math.sin(w) + s * 0.06;
    const tiembla = tramo(t, 7.9, T_BOOM) * 3;
    r.dx = azar(-tiembla, tiembla);
    return r;
  }
  final(i, t) {
    const d = t - T_BOOM, s = i ? -1 : 1;
    const pose = { quien: i ? "rodrigo" : undefined, cara: d < 0.5 ? "sorpresa" : "risa", rc: s * 0.1 }, r = { pose, dx: 0, dy: 0, giro: 0, sx: 1, sy: 1 };
    pose.puntas = 0.9 * (1 - tramo(d, 0.4, 1.4));
    const k = eBack(tramo(d, 0.5, 0.8));
    const bote = Math.abs(Math.sin(Math.max(0, d - 0.8) * 6)) * tramo(d, 0.8, 1.0);
    pose.manoD = mezcla([84, 120], i ? [96, 6] : [100, 6], k); pose.manoI = mezcla([-6, 120], i ? [-20, 6] : [-22, 6], k);
    r.dy = -18 * bote;
    if (d > 1.9) pose.cara = (Math.floor(d * 2) + i) % 2 ? "risa" : "guino";
    return r;
  }
  estado() {
    const t = this.t, res = [];
    for (let i = 0; i < 2; i++) {
      let r;
      if (t < T_G) {
        // se retan: se señalan el uno al otro
        const k = eBack(tramo(t, 0.7, 1.0)) * (1 - eInOut(tramo(t, 1.6, T_G)));
        const pose = { quien: i ? "rodrigo" : undefined, cara: t > 0.7 ? "guino" : "sonrisa", rc: i ? -0.1 : 0.1 };
        if (i) { pose.manoI = mezcla([9, 157], [-50, 96], k); pose.brazoIDelante = true; }
        else pose.manoD = mezcla([70, 158], [128, 96], k);
        r = { pose, dx: 0, dy: 0, giro: 0, sx: 1, sy: 1 };
      } else if (t < T_R) r = i ? this.mirando(1, t, t > T_G + 1.6) : this.bailaG(t);
      else if (t < T_JUNTOS - 0.3) r = i ? this.bailaR(t) : this.mirando(0, t, t > T_R + 0.8 && t < T_R + 1.7);
      else if (t < T_JUNTOS) {
        // se miran y arrancan juntos
        const pose = { quien: i ? "rodrigo" : undefined, cara: "risa", rc: i ? -0.12 : 0.12 };
        r = { pose, dx: 0, dy: 0, giro: 0, sx: 1, sy: 1 };
      } else if (t < T_BOOM) r = this.juntos(i, t);
      else r = this.final(i, t);
      let m;
      if (r.rueda) m = matAv(r.rueda.x, PIES - 116 * ESC - r.rueda.alto, ESC, r.rueda.ang, 1, 1, [39, 116]);
      else m = matAv((i ? XR : XG) + r.dx, PIES + r.dy, ESC, r.giro, r.sx, r.sy);
      res.push({ pose: r.pose, m });
    }
    return res;
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("titulo", t > 0.6, () => temblar(10, 0.25));
    this.una("abre", t > T_G + 1.6, () => { temblar(10, 0.2); for (let i = 0; i < 16; i++) p.nueva(P.POLVO, XG + azar(-60, 60), PIES - 4, azar(-300, 300), azar(-40, -5), azar(0.5, 0.9), azar(20, 34)); });
    this.una("rueda", t > T_R + 1.6, () => temblar(6, 0.15));
    CLAPS.forEach((tc, n) => this.una("c" + n, t > tc, () => {
      for (let i = 0; i < 10; i++) p.nueva(P.PURPURINA, M.x + azar(-40, 40), M.y1 - (M.y1 - M.y0) * Math.min(1, this.nivel(t)), azar(-60, 60), azar(-80, -20), azar(0.6, 1.0), azar(8, 13));
    }));
    if (t > 8.0 && t < T_BOOM) { temblar(2 + 5 * tramo(t, 8.0, T_BOOM), 0.1); if (Math.random() < 30 * dt) p.nueva(P.ELECTRICA, M.x + azar(-30, 30), M.y0 + azar(-10, 40), azar(-120, 120), azar(-120, 40), azar(0.15, 0.3), azar(14, 24)); }
    this.una("boom", t > T_BOOM, () => {
      temblar(34, 0.8);
      const cy = (M.y0 + M.y1) / 2;
      p.nueva(P.DESTELLO, M.x, cy, 0, 0, 0.5, 420);
      for (let i = 0; i < 50; i++) { const a = azar(0, 6.283), v = azar(250, 850); p.nueva(P.CHISPA, M.x, cy + azar(-120, 120), Math.cos(a) * v, Math.sin(a) * v - 150, azar(0.5, 1.1), azar(8, 16)); }
      for (let i = 0; i < 170; i++) p.nueva(P.CONFETI, M.x + azar(-30, 30), cy + azar(-150, 150), azar(-700, 700), azar(-700, -100), azar(2.4, 3.6), azar(9, 15), i % 5);
      for (let i = 0; i < 10; i++) p.nueva(P.HUMO, M.x + azar(-30, 30), cy + azar(-100, 100), azar(-80, 80), azar(-120, -30), azar(1.2, 2), azar(40, 70));
      for (let i = 0; i < 14; i++) { const a = azar(0, 6.283), v = azar(250, 600); this.trozos.push({ x: M.x, y: cy + azar(-140, 140), vx: Math.cos(a) * v, vy: Math.sin(a) * v - 300, r: 0, vr: azar(-12, 12), c: ["#2bff5b", "#ffd34d", "#ff3d3d"][i % 3] }); }
    });
    for (const q of this.trozos) { q.vy += 1300 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.r += q.vr * dt; if (q.y > PIES) { q.y = PIES; q.vy *= -0.3; q.vx *= 0.6; } }
    // notas musicales
    if (t > 0.5 && t < DUR - 0.8 && Math.random() < 2.2 * dt) this.notas.push({ x: azar(60, 960), y: azar(330, 470), t0: t, c: CONFETI[(Math.random() * 5) | 0] });
    this.notas = this.notas.filter((n) => t - n.t0 < 2);
    p.suelo = () => PIES + 6;
    p.actualizar(dt);
  }
  pista(g, t, luz) {
    // baldosas iluminadas al ritmo
    const filas = 4, y0 = 470;
    const b = Math.floor(t / BEAT);
    for (let f = 0; f < filas; f++) {
      const ya = y0 + (f * f) * 9 + f * 14, yb = y0 + ((f + 1) * (f + 1)) * 9 + (f + 1) * 14;
      for (let c = -7; c <= 6; c++) {
        const ka = (c * 92) * (1 + f * 0.17), kb = (c * 92) * (1 + (f + 1) * 0.17), wa = 92 * (1 + f * 0.17), wb = 92 * (1 + (f + 1) * 0.17);
        const on = (c + f + b) % 3 === 0 ? 1 : (c * 7 + f * 3 + b) % 5 === 0 ? 0.6 : 0.12;
        const col = ["255,61,132", "47,227,232", "255,211,77", "43,255,91"][(c + 9 + f * 2 + b) % 4];
        g.fillStyle = `rgba(${col},${(0.12 + 0.5 * on * golpe(t + 0.05)) * luz})`;
        g.beginPath(); g.moveTo(512 + ka + 2, ya + 1); g.lineTo(512 + ka + wa - 2, ya + 1); g.lineTo(512 + kb + wb - 2, yb - 1); g.lineTo(512 + kb + 2, yb - 1); g.closePath(); g.fill();
      }
    }
  }
  medidor(g, t) {
    const n = this.nivel(t), roto = t >= T_BOOM;
    const tiembla = t > 7.9 && !roto ? azar(-3, 3) * tramo(t, 7.9, T_BOOM) : 0;
    const x0 = M.x - M.w / 2 + tiembla, h = M.y1 - M.y0;
    g.save();
    // rótulo
    if (!roto) txt(g, "APLAUSÓMETRO", M.x, M.y0 - 14, { tam: 24, peso: 900, fam: FD, color: "#fffdf5", glow: "rgba(255,61,132,.9)", glowTam: 12, esp: 1.5 });
    rectR(g, x0 - 6, M.y0 - 6, M.w + 12, h + 12, 16);
    g.fillStyle = "#121318"; g.fill(); g.strokeStyle = roto ? "#3a3b40" : "#c8ced6"; g.lineWidth = 3; g.stroke();
    const seg = h / M.n;
    for (let k = 0; k < M.n; k++) {
      const y = M.y1 - (k + 1) * seg + 3, lleno = !roto && (k + 1) / M.n <= n + 0.001;
      const col = k < 7 ? "43,255,91" : k < 11 ? "255,211,77" : "255,61,61";
      g.fillStyle = lleno ? `rgb(${col})` : roto ? "#1a1b1f" : `rgba(${col},.13)`;
      rectR(g, x0 + 6, y, M.w - 12, seg - 6, 4); g.fill();
      if (lleno) { g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5; g.drawImage(k < 7 ? BLOB.verde : k < 11 ? BLOB.amarillo : BLOB.rojo, x0 - 16, y - 16, M.w + 32, seg + 26); g.globalAlpha = 1; g.globalCompositeOperation = "source-over"; }
    }
    if (n > 1 && !roto) { // se sale por arriba
      const k = tramo(n, 1, 1.2), a = 0.6 + 0.4 * Math.sin(t * 40);
      g.globalCompositeOperation = "lighter"; g.globalAlpha = a; g.drawImage(BLOB.rojo, M.x - 90, M.y0 - 110 * k - 30, 180, 140); g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    }
    if (roto) {
      g.strokeStyle = "rgba(220,230,240,.6)"; g.lineWidth = 2;
      g.beginPath(); g.moveTo(x0 + 8, M.y0 + 40); g.lineTo(x0 + 30, M.y0 + 90); g.lineTo(x0 + 16, M.y0 + 150); g.lineTo(x0 + 44, M.y0 + 210); g.stroke();
    }
    g.restore();
  }
  titulo() {
    if (this.cache.has("t")) return this.cache.get("t");
    const c = lienzoNuevo(760, 210), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 160);
    gr.addColorStop(0, "#fffbe0"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8f00");
    txt(g, "¡BATALLA!", 380, 160, { tam: 156, peso: 900, fam: FD, color: gr, borde: "#3a1d00", bordeAncho: 13, esp: 6, glow: "rgba(255,61,132,.9)", glowTam: 28 });
    this.cache.set("t", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    const on = t < 0.6 ? [0, 0.5, 0, 0.9, 0.4, 1, 1][Math.min(6, Math.floor(t / 0.09))] : 1;
    const luz = on * (1 - tramo(t, DUR - 0.6, DUR - 0.05));
    // haces de colores que barren
    g.save(); g.globalCompositeOperation = "lighter";
    const haces = [["255,61,132", 150], ["47,227,232", 874], ["255,211,77", 512]];
    haces.forEach(([col, x], k) => {
      const a = 0.11 * luz, xb = x + 260 * Math.sin(t * (0.9 + k * 0.35) + k * 2);
      const gr = g.createLinearGradient(0, 0, 0, PIES);
      gr.addColorStop(0, `rgba(${col},${a * 1.6})`); gr.addColorStop(1, `rgba(${col},${a * 0.4})`);
      g.fillStyle = gr; g.beginPath(); g.moveTo(x - 14, -10); g.lineTo(x + 14, -10); g.lineTo(xb + 120, PIES); g.lineTo(xb - 120, PIES); g.closePath(); g.fill();
    });
    g.restore();
    this.pista(g, t, luz);
    // foco sobre quien baila
    const fG = t > T_G && t < T_R ? 1 : 0, fR = t > T_R && t < T_JUNTOS - 0.3 ? 1 : 0;
    foco(g, XG, XG, PIES, 150, (0.35 + 0.9 * fG) * luz);
    foco(g, XR, t > T_R + 0.8 && t < T_R + 1.62 ? lerp(XR, XR - 150, eInOut(tramo(t, T_R + 0.8, T_R + 1.6))) : t > T_R + 1.62 && t < T_R + 2.2 ? lerp(XR - 150, XR, eInOut(tramo(t, T_R + 1.62, T_R + 2.15))) : XR, PIES, 150, (0.35 + 0.9 * fR) * luz);
    // notas
    for (const n of this.notas) {
      const d = t - n.t0, a = Math.sin(Math.PI * d / 2) * 0.8, x = n.x + Math.sin(d * 3) * 14, y = n.y - d * 60;
      g.save(); g.globalAlpha = a; g.fillStyle = n.c; g.strokeStyle = n.c; g.lineWidth = 3;
      g.beginPath(); g.ellipse(x, y, 7, 5.5, -0.4, 0, 6.283); g.fill();
      g.beginPath(); g.moveTo(x + 6, y - 2); g.lineTo(x + 6, y - 30); g.quadraticCurveTo(x + 14, y - 22, x + 18, y - 16); g.stroke();
      g.restore();
    }
    if (t > 1.7) this.medidor(g, t);
    const detras = t > T_BOOM + 0.7; // el confeti del final, por detrás de ellos
    if (detras) this.p.dibujar(g);
    for (const q of this.trozos) { g.save(); g.translate(q.x, q.y); g.rotate(q.r); g.fillStyle = q.c; g.fillRect(-12, -5, 24, 10); g.restore(); }
    pintarAvatar(g, e[0].m, e[0].pose, t);
    pintarAvatar(g, e[1].m, e[1].pose, t);
    if (!detras) this.p.dibujar(g);
    // ¡CLAP!
    CLAPS.forEach((tc, n) => {
      const d = t - tc;
      if (d < 0 || d > 0.6) return;
      const k = tramo(d, 0, 0.12), lado = tc < T_R ? 1 : tc < T_JUNTOS ? -1 : n % 2 ? 1 : -1;
      const y = clamp(M.y1 - (M.y1 - M.y0) * Math.min(1, this.nivel(tc)) - 10, M.y0 + 80, M.y1 - 40) - 30 * d;
      g.save(); g.translate(M.x + lado * 98, y); g.rotate(lado * 0.15); g.scale(eBack(k), eBack(k));
      txt(g, "¡CLAP!", 0, 0, { tam: 40, peso: 400, fam: FC, color: "#fffdf5", borde: "#8a0f45", bordeAncho: 8, alfa: 1 - tramo(d, 0.4, 0.6), esp: 2 });
      g.restore();
    });
    // ¡BATALLA!: al retarse y en el remate
    const spr = this.titulo();
    const muestra = (t0, t1) => {
      if (t < t0 || t > t1) return;
      const d = t - t0, k = tramo(d, 0, 0.16), s = lerp(2.6, 1, eIn(k)) * (1 + 0.03 * Math.sin(d * 8));
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - tramo(t, t1 - 0.25, t1)); g.translate(512, 112); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    };
    muestra(0.55, 1.95);
    muestra(T_BOOM + 0.35, DUR);
    const a = 1 - luz;
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00112", nombre: "Batalla de baile", crear: () => new BatallaBaile() });
})();
