"use strict";
/*
 * 00048 · EL JARDINERO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Amanece. Llega con sombrero de paja y regadera, lanza una semilla dorada al montón de tierra (¡PLOP!) y la riega…
 * con cerveza (GLU GLU). Brota y crece a toda velocidad una planta de lúpulo enorme, con hojas, piñas de lúpulo y
 * jarras de cerveza colgando como frutos. Coge la más cercana: ¡COSECHA! Se la bebe tan a gusto, brinda y anochece.
 */
(() => {
const ESC = 1.45, MONTON = [652, 570], EJ = 1.45;
const T_SUELTA = 4.55, T_TIRA = 2.0, T_PLOP = 2.55, T_RIEGA = 2.75, T_FIN_RIEGO = 4.05, T_BROTA = 4.15, T_COGE = 6.75, T_TITULO = 7.05;
// tallo (pantalla) y ramas: f = dónde sale del tallo (0–1), fin = punta de la rama, jarra = dónde cuelga
const TALLO = [[652, 566], [640, 480], [670, 400], [642, 318], [664, 236], [640, 160], [656, 84]];
const RAMAS = [
  { f: 0.22, fin: [742, 448], jarra: true },
  { f: 0.40, fin: [560, 330], jarra: true, coge: true },
  { f: 0.56, fin: [748, 292], jarra: true },
  { f: 0.72, fin: [572, 214], jarra: true },
  { f: 0.84, fin: [742, 150], jarra: true },
  { f: 0.95, fin: [598, 92], jarra: false },
];
const HOJAS = [[0.12, -1, 1.0], [0.18, 1, 0.9], [0.32, 1, 1.1], [0.47, -1, 1.0], [0.63, -1, 0.9], [0.66, 1, 1.0], [0.8, -1, 0.85], [0.9, 1, 0.8], [1.0, -1, 0.7]];
/** Curva suave por los puntos (Catmull-Rom), n muestras. */
function curva(pts, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const u = (i / (n - 1)) * (pts.length - 1), k = Math.min(pts.length - 2, Math.floor(u)), s = u - k;
    const p0 = pts[Math.max(0, k - 1)], p1 = pts[k], p2 = pts[k + 1], p3 = pts[Math.min(pts.length - 1, k + 2)];
    const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * s + (2 * a - 5 * b + 4 * c - d) * s * s + (-a + 3 * b - 3 * c + d) * s * s * s);
    out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
  }
  return out;
}
const N = 80, STEM = curva(TALLO, N);

class Jardinero extends Escena {
  constructor() {
    super(10.8);
    this.p = new Parts(320);
    this.fase = 0;
    this.cielo = pintarCielo();
    this.hoja = spriteHoja();
    this.pina = spritePina();
    this.jarra = spriteJarra();
    this.semilla = null;
  }
  luz() { const t = this.t; return eInOut(tramo(t, 0.02, 1.0)) * (1 - eInOut(tramo(t, 9.85, 10.75))); }
  xEn(t) {
    if (t < 1.5) return lerp(-150, 430, eOut(tramo(t, 0, 1.5)));
    if (t < T_BROTA + 0.6) return 430;
    if (t < T_BROTA + 1.2) return lerp(430, 380, eInOut(tramo(t, T_BROTA + 0.6, T_BROTA + 1.2)));
    if (t < 6.3) return 380;
    if (t < 6.7) return lerp(380, 430, eInOut(tramo(t, 6.3, 6.7)));
    return 430;
  }
  crece() { const t = this.t; return 0.06 * eOut(tramo(t, T_BROTA, T_BROTA + 0.3)) + 0.94 * eInOut(tramo(t, 4.6, 6.0)); }
  puntaRama(r) { const a = STEM[Math.round(r.f * (N - 1))]; return [a, r.fin]; }
  /** Fondo de la jarra que cuelga de la rama r. */
  sitioJarra(r) { return [r.fin[0] + 10, r.fin[1] + 66]; }
  estado() {
    const t = this.t, x = this.xEn(t);
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [72, 152], manoI = [8, 152], canAng = 0.1, dy = 0, jarra = null, semilla = false;
    const anda = t < 1.5 || (t > T_BROTA + 0.6 && t < T_BROTA + 1.2) || (t > 6.3 && t < 6.7);
    if (anda) { const a = andar(this.fase, 0.9); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; dy = a.bote; canAng = 0.15 * Math.sin(this.fase); manoD = [74, 150]; }
    if (t < 1.5) pose.cara = "guino";
    // enseña la semilla y la lanza por encima de la cabeza
    if (t >= 1.5 && t < T_PLOP) {
      const k = eInOut(tramo(t, 1.5, 1.75)), l = eOut(tramo(t, 1.85, T_TIRA));
      manoI = mezcla(mezcla([8, 152], [-10, 110], k), [-4, 20], l);
      semilla = t < T_TIRA;
      pose.cara = t < 1.85 ? "guino" : "risa";
    }
    // riega con cerveza
    if (t >= T_RIEGA - 0.25 && t < T_FIN_RIEGO + 0.3) {
      const k = eInOut(tramo(t, T_RIEGA - 0.25, T_RIEGA)) * (1 - eInOut(tramo(t, T_FIN_RIEGO, T_FIN_RIEGO + 0.3)));
      manoD = mezcla([72, 152], [116, 112], k); canAng = lerp(0.1, 0.75 + 0.06 * Math.sin(t * 14), k);
      pose.cara = Math.sin(t * 4) > 0 ? "risa" : "guino";
      pose.rc = 0.06 * k;
    }
    // ¡crece!
    if (t >= T_BROTA && t < T_COGE - 0.1) {
      pose.cara = t < T_BROTA + 0.35 ? "sonrisa" : "sorpresa";
      if (t > 5.2) pose.rc = -0.06 * Math.sin(Math.PI * tramo(t, 5.2, 6.4));
      manoI = mezcla([8, 152], [-18, 120], eInOut(tramo(t, T_BROTA + 0.4, T_BROTA + 0.7)));
    }
    // coge una jarra
    const R = RAMAS.find((r) => r.coge), sj = this.sitioJarra(R);
    const asa = [(sj[0] - 17 * EJ - x) / ESC + 39 - 2, 232 - (PIES - (sj[1] - 18 * EJ)) / ESC];
    if (t >= T_COGE - 0.3) {
      const k = eInOut(tramo(t, T_COGE - 0.3, T_COGE)), b = eInOut(tramo(t, T_COGE + 0.05, T_COGE + 0.35));
      manoD = mezcla(mezcla([72, 152], asa, k), [100, 96], b);
      jarra = t >= T_COGE ? { inc: 0, nivel: 1 } : null;
      pose.cara = t < T_COGE ? "sorpresa" : "risa";
      manoI = [-18, 120];
    }
    // se la bebe
    if (t >= 7.6 && jarra) {
      const kB = eInOut(tramo(t, 7.6, 7.9)) * (1 - eInOut(tramo(t, 8.85, 9.15)));
      const kT = eInOut(tramo(t, 7.9, 8.8)) * (1 - eInOut(tramo(t, 8.85, 9.15)));
      pose.rc = -0.34 * kT + (kT > 0.05 && kT < 0.95 ? 0.02 * Math.sin(t * 40) : 0);
      jarra.inc = -0.4 * kB - 1.15 * kT;
      const b = boca(pose.rc), r = rot2(JARRA.borde, jarra.inc);
      manoD = mezcla([100, 96], [b[0] - r[0], b[1] - r[1]], kB);
      jarra.nivel = 1 - tramo(t, 8.0, 8.8) * 0.9;
      pose.cara = t > 8.75 && t < 9.4 ? "dormido" : t >= 9.4 ? "guino" : pose.cara;
      if (t > 9.3) { const v = eInOut(tramo(t, 9.3, 9.6)); manoD = mezcla([100, 96], [108, 60], v); }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    if (jarra) pose.jarra = jarra;
    const tieneRegadera = t < T_SUELTA;
    pose.objD = (g, m) => { sombrero(g, pose.rc); if (tieneRegadera) regadera(g, m, canAng); };
    if (semilla) pose.objI2 = (g, m) => semillaDorada(g, m[0], m[1] - 4, 1.3, t);
    const mm = matAv(x, PIES + dy, ESC);
    return { pose, m: mm, x, canAng };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const anda = t < 1.5 || (t > T_BROTA + 0.6 && t < T_BROTA + 1.2) || (t > 6.3 && t < 6.7);
    if (anda) this.fase += dt * 9;
    const e = this.estado();
    this.una("tira", t > T_TIRA, () => { const q = aPant(e.m, [-4, 16]); this.semilla = { x0: q[0], y0: q[1], t0: t }; });
    this.una("plop", t > T_PLOP, () => {
      temblar(6, 0.2);
      for (let k = 0; k < 16; k++) p.nueva(P.POLVO, MONTON[0] + azar(-30, 30), MONTON[1] - 10, azar(-160, 160), azar(-120, -20), azar(0.4, 0.8), azar(16, 28));
      for (let k = 0; k < 10; k++) { const a = azar(-Math.PI, 0), v = azar(120, 300); p.nueva(P.CHISPA, MONTON[0], MONTON[1] - 14, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 10)); }
    });
    // el riego
    if (t > T_RIEGA && t < T_FIN_RIEGO) {
      const s = this.ducha(e);
      for (let k = 0; k < 2; k++) p.nueva(P.GOTA, s[0] + azar(-8, 8), s[1] + azar(0, 10), azar(10, 60), azar(60, 140), 0.5, azar(2.5, 4));
      if (Math.random() < 20 * dt) p.nueva(P.ESPUMA, MONTON[0] + azar(-40, 40), MONTON[1] - 16, azar(-60, 60), azar(-120, -40), azar(0.4, 0.7), azar(3, 7));
    }
    // del susto se le cae la regadera
    this.una("suelta", t > T_SUELTA, () => { const q = aPant(e.m, e.pose.manoD); this.caida = { x: q[0], y: q[1], vy: -120, a: e.canAng, va: 5 }; });
    if (this.caida) {
      const C = this.caida;
      if (!C.quieta) {
        C.vy += 1500 * dt; C.y += C.vy * dt; C.x += 40 * dt; C.a += C.va * dt;
        if (C.y > PIES - 34) { C.y = PIES - 34; C.quieta = true; C.a = 1.35; temblar(4, 0.15); for (let k = 0; k < 8; k++) p.nueva(P.POLVO, C.x + azar(-20, 30), PIES - 4, azar(-100, 100), azar(-40, -5), azar(0.4, 0.7), azar(16, 26)); }
      }
    }
    this.una("brota", t > T_BROTA, () => { for (let k = 0; k < 14; k++) p.nueva(P.DESTELLO, MONTON[0] + azar(-20, 20), MONTON[1] - azar(10, 40), 0, 0, 0.3, 36); });
    if (t > 4.6 && t < 6.0 && Math.random() < 30 * dt) { const i = Math.min(N - 1, Math.round(this.crece() * (N - 1))); p.nueva(P.PURPURINA, STEM[i][0] + azar(-20, 20), STEM[i][1], azar(-30, 30), azar(-40, 20), azar(0.6, 1.0), azar(8, 13)); }
    RAMAS.forEach((r, i) => { if (r.jarra) this.una("fruto" + i, t > this.tFruto(i), () => { const s = this.sitioJarra(r); for (let k = 0; k < 8; k++) p.nueva(P.DESTELLO, s[0] + azar(-20, 20), s[1] - azar(10, 50), 0, 0, 0.3, 34); }); });
    this.una("coge", t > T_COGE, () => {
      const s = this.sitioJarra(RAMAS[1]);
      for (let k = 0; k < 16; k++) { const a = azar(0, 6.283), v = azar(120, 320); p.nueva(P.CHISPA, s[0], s[1] - 50, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(6, 10)); }
      temblar(6, 0.2);
    });
    this.una("titulo", t > T_TITULO, () => {
      temblar(14, 0.35);
      for (let k = 0; k < 40; k++) p.nueva(P.CONFETI, azar(80, 900), azar(-60, 0), azar(-50, 50), azar(60, 160), azar(2.4, 3.0), azar(9, 15), k % 5);
    });
    p.alfa = this.luz();
    p.actualizar(dt);
  }
  tFruto(i) { return 5.75 + i * 0.13; }
  /** Dónde sale la ducha de la regadera (pantalla). */
  ducha(e) { const m = e.pose.manoD, r = rot2([38, 3], e.canAng); return aPant(e.m, [m[0] + r[0], m[1] + r[1]]); }
  dibujarPlanta(g) {
    const t = this.t, c = this.crece();
    if (c <= 0) return;
    const n = Math.max(2, Math.round(c * (N - 1)) + 1);
    const sway = (y) => 4 * Math.sin(t * 1.6 + y * 0.012) * (1 - y / 600);
    const P2 = (q) => [q[0] + sway(q[1]), q[1]];
    // ramas (por detrás del tallo)
    RAMAS.forEach((r, i) => {
      const k = tramo(c, r.f, r.f + 0.14);
      if (k <= 0) return;
      const a = P2(STEM[Math.round(r.f * (N - 1))]), b = P2(r.fin), m = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 26];
      const fin = [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
      g.strokeStyle = "#2a6a22"; g.lineWidth = 7; g.lineCap = "round";
      g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(lerp(a[0], m[0], k), lerp(a[1], m[1], k), fin[0], fin[1]); g.stroke();
      g.strokeStyle = "#5fb04a"; g.lineWidth = 3; g.stroke();
    });
    // tallo
    g.lineCap = "round"; g.lineJoin = "round";
    for (const [w, col] of [[16, "#245a1c"], [9, "#5fb04a"]]) {
      g.strokeStyle = col; g.lineWidth = w; g.beginPath();
      for (let i = 0; i < n; i++) { const q = P2(STEM[i]); if (i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }
      g.stroke();
    }
    // hojas
    for (const [f, lado, s] of HOJAS) {
      const k = eBack(tramo(c, f, f + 0.12));
      if (k <= 0) continue;
      const q = P2(STEM[Math.min(N - 1, Math.round(f * (N - 1)))]);
      g.save(); g.translate(q[0], q[1]); g.rotate(lado * 0.9 + 0.1 * Math.sin(t * 2 + f * 9)); g.scale(k * s * lado, k * s);
      g.drawImage(this.hoja, 0, -40, 80, 80);
      g.restore();
    }
    // piñas de lúpulo y jarras
    RAMAS.forEach((r, i) => {
      const k = tramo(c, r.f + 0.1, r.f + 0.2);
      if (k <= 0) return;
      const b = P2(r.fin);
      g.save(); g.translate(b[0] + (r.fin[0] < 650 ? 18 : -18), b[1] + 6); g.scale(eBack(k), eBack(k)); g.drawImage(this.pina, -12, -4, 24, 34); g.restore();
      if (!r.jarra) return;
      if (r.coge && t >= T_COGE) return;
      const kj = eBack(tramo(t, this.tFruto(i), this.tFruto(i) + 0.25));
      if (kj <= 0) return;
      const s = [this.sitioJarra(r)[0] + sway(r.fin[1]), this.sitioJarra(r)[1]];
      g.strokeStyle = "#2a6a22"; g.lineWidth = 3;
      g.beginPath(); g.moveTo(b[0], b[1]); g.quadraticCurveTo(b[0] - 14, b[1] + 10, s[0] - 14 * EJ, s[1] - 36 * EJ); g.stroke();
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35 * kj; g.drawImage(BLOB2.oro, s[0] - 50, s[1] - 90, 100, 100); g.restore();
      g.save(); g.translate(s[0], s[1] - 18 * EJ); g.scale(kj, kj); g.rotate(0.06 * Math.sin(t * 2.4 + i));
      g.drawImage(this.jarra, -26 * EJ, -25 * EJ, 46 * EJ, 46 * EJ);
      g.restore();
    });
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), luz = this.luz();
    fondo(g, "#000");
    g.drawImage(this.cielo, 0, 0);
    // sol que sale y se pone
    const sol = [880, lerp(560, 120, eOut(tramo(t, 0, 1.6))) + 460 * eIn(tramo(t, 9.6, 10.8))];
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8; g.drawImage(BLOB.amarillo, sol[0] - 150, sol[1] - 150, 300, 300); g.restore();
    g.fillStyle = "#ffe08a"; g.beginPath(); g.arc(sol[0], sol[1], 46, 0, 6.283); g.fill();
    // suelo
    g.fillStyle = "#3a2716"; g.fillRect(-60, PIES - 4, W + 120, H - PIES + 64);
    g.fillStyle = "#4f8a2c"; g.fillRect(-60, PIES - 6, W + 120, 8);
    // montón de tierra (mojado al regar)
    const moja = tramo(t, T_RIEGA, T_FIN_RIEGO);
    g.fillStyle = moja > 0 ? `rgb(${Math.round(lerp(110, 70, moja))},${Math.round(lerp(72, 44, moja))},${Math.round(lerp(40, 22, moja))})` : "#6e4828";
    g.beginPath(); g.ellipse(MONTON[0], MONTON[1], 70, 22, 0, Math.PI, 0); g.fill();
    g.fillStyle = "rgba(255,255,255,.12)"; g.beginPath(); g.ellipse(MONTON[0] - 18, MONTON[1] - 14, 24, 4, -0.1, 0, 6.283); g.fill();
    this.dibujarPlanta(g);
    if (this.caida) { g.save(); g.translate(this.caida.x, this.caida.y); g.scale(ESC, ESC); regadera(g, [0, 0], this.caida.a); g.restore(); }
    pintarAvatar(g, e.m, e.pose, t);
    // la semilla volando
    if (this.semilla && t < T_PLOP) {
      const S = this.semilla, u = tramo(t, S.t0, T_PLOP);
      semillaDorada(g, lerp(S.x0, MONTON[0], u), lerp(S.y0, MONTON[1] - 14, u) - 200 * 4 * u * (1 - u), 2.2, t);
    }
    // chorros de cerveza de la regadera
    if (t > T_RIEGA && t < T_FIN_RIEGO) {
      const s = this.ducha(e);
      g.save(); g.strokeStyle = "rgba(255,184,40,.9)"; g.lineCap = "round";
      for (let k = -1; k <= 1; k++) {
        g.lineWidth = 4;
        g.beginPath(); g.moveTo(s[0] + k * 4, s[1]); g.quadraticCurveTo(s[0] + 40 + k * 10, s[1] + 10, MONTON[0] - 10 + k * 22 + 3 * Math.sin(t * 30 + k), MONTON[1] - 16); g.stroke();
      }
      g.restore();
    }
    this.p.dibujar(g);
    // textos
    if (t > T_PLOP && t < 3.3) {
      const k = tramo(t, T_PLOP, T_PLOP + 0.12);
      g.save(); g.translate(MONTON[0] + 60, MONTON[1] - 80); g.rotate(0.1); g.scale(eBack(k), eBack(k));
      txt(g, "¡PLOP!", 0, 0, { tam: 46, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a2400", bordeAncho: 7, alfa: 1 - tramo(t, 3.05, 3.3), esp: 2 });
      g.restore();
    }
    if (t > T_RIEGA + 0.2 && t < T_FIN_RIEGO) {
      const a = tramo(t, T_RIEGA + 0.2, T_RIEGA + 0.35) * (1 - tramo(t, T_FIN_RIEGO - 0.2, T_FIN_RIEGO));
      txt(g, "GLU GLU", MONTON[0] + 110, MONTON[1] - 150 + 4 * Math.sin(t * 12), { tam: 38, peso: 400, fam: FC, color: "#ffe28a", borde: "#5a3000", bordeAncho: 6, alfa: a, esp: 2 });
    }
    if (t > T_TITULO && t < 9.8) {
      const k = tramo(t, T_TITULO, T_TITULO + 0.18), s = lerp(2.6, 1, eIn(k)), a = Math.min(1, k * 3) * (1 - tramo(t, 9.45, 9.8));
      g.save(); g.translate(285, 140); g.rotate(-0.06); g.scale(s, s);
      txt(g, "¡COSECHA!", 0, 0, { tam: 104, peso: 400, fam: FC, color: "#f4ffd6", borde: "#1f5a14", bordeAncho: 12, alfa: a, esp: 4, max: 520 });
      g.restore();
    }
    if (luz < 1) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}
function pintarCielo() {
  const c = lienzoNuevo(W, H), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, PIES);
  gr.addColorStop(0, "#2b4c8c"); gr.addColorStop(0.6, "#e88a5a"); gr.addColorStop(1, "#ffc98a");
  g.fillStyle = gr; g.fillRect(0, 0, W, PIES);
  // colinas
  g.fillStyle = "#2f5a2a";
  g.beginPath(); g.moveTo(0, PIES); g.quadraticCurveTo(180, 470, 380, 520); g.quadraticCurveTo(600, 560, 760, 500); g.quadraticCurveTo(900, 450, W, 510); g.lineTo(W, PIES); g.closePath(); g.fill();
  g.fillStyle = "#3d7134";
  g.beginPath(); g.moveTo(0, PIES); g.quadraticCurveTo(260, 530, 520, 552); g.quadraticCurveTo(800, 572, W, 540); g.lineTo(W, PIES); g.closePath(); g.fill();
  return c;
}
function spriteHoja() {
  const c = lienzoNuevo(160, 160), g = c.getContext("2d");
  g.scale(2, 2); g.translate(0, 40);
  const gr = g.createLinearGradient(0, -30, 70, 30);
  gr.addColorStop(0, "#7fd062"); gr.addColorStop(1, "#2c7a26");
  g.fillStyle = gr;
  for (const [x, y, rx, ry, a] of [[44, -14, 22, 13, -0.6], [48, 12, 22, 13, 0.6], [56, 0, 24, 14, 0]]) { g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, 6.283); g.fill(); }
  g.beginPath(); g.ellipse(26, 0, 18, 14, 0, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(220,255,200,.55)"; g.lineWidth = 1.6; g.lineCap = "round";
  g.beginPath(); g.moveTo(4, 0); g.lineTo(76, 0); g.moveTo(30, 0); g.lineTo(58, -24); g.moveTo(30, 0); g.lineTo(60, 24); g.stroke();
  g.strokeStyle = "#245a1c"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(10, 0); g.stroke();
  return c;
}
function spritePina() {
  const c = lienzoNuevo(48, 68), g = c.getContext("2d");
  g.scale(2, 2);
  g.strokeStyle = "#2a6a22"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(12, 0); g.lineTo(12, 5); g.stroke();
  for (let f = 0; f < 5; f++) for (let c2 = -1; c2 <= 1; c2 += 2) {
    const w = 7 - f * 0.9, x = 12 + c2 * (w * 0.45), y = 8 + f * 5;
    g.fillStyle = f % 2 ? "#b9e07a" : "#9fd062"; g.beginPath(); g.ellipse(x, y, w * 0.6, 4, 0, 0, 6.283); g.fill();
    g.strokeStyle = "rgba(60,110,30,.6)"; g.lineWidth = 0.8; g.stroke();
  }
  return c;
}
function spriteJarra() {
  const S = 3, c = lienzoNuevo(46 * S, 46 * S), g = c.getContext("2d");
  g.scale(S, S); g.translate(9, 25);
  dibujarJarra(g, [0, 0], 0, 1, "asa", 0);
  dibujarJarra(g, [0, 0], 0, 1, "cuerpo", 0);
  return c;
}
function semillaDorada(g, x, y, s, t) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.7; g.drawImage(BLOB.amarillo, -10, -10, 20, 20); g.restore();
  g.rotate(t * 6);
  g.fillStyle = "#ffcf3a"; g.beginPath(); g.ellipse(0, 0, 3.4, 2.3, 0, 0, 6.283); g.fill();
  g.fillStyle = "#fff6c0"; g.beginPath(); g.ellipse(-1, -0.8, 1.2, 0.7, 0, 0, 6.283); g.fill();
  g.restore();
}
/** Regadera verde; la mano agarra el asa de arriba. ang = inclinación (positivo = vierte por la derecha). */
function regadera(g, m, ang) {
  g.save(); g.translate(m[0], m[1]); g.rotate(ang);
  g.strokeStyle = "#1d6e3c"; g.lineWidth = 3.4; g.lineCap = "round";
  g.beginPath(); g.moveTo(-9, 10); g.quadraticCurveTo(-8, -3, 0, -3); g.quadraticCurveTo(8, -3, 9, 10); g.stroke();
  // pitorro
  g.strokeStyle = "#1d6e3c"; g.lineWidth = 3.6;
  g.beginPath(); g.moveTo(12, 24); g.lineTo(35, 4); g.stroke();
  g.fillStyle = "#c9ced3"; g.beginPath(); g.ellipse(37, 2.5, 2.4, 4.4, 0.7, 0, 6.283); g.fill();
  const gr = g.createLinearGradient(-16, 0, 16, 0);
  gr.addColorStop(0, "#1d6e3c"); gr.addColorStop(0.4, "#46c070"); gr.addColorStop(1, "#16572f");
  g.fillStyle = gr; rectR(g, -15, 8, 30, 22, 5); g.fill();
  g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(-11, 11, 3, 16);
  g.fillStyle = "#16572f"; g.fillRect(-15, 8, 30, 3);
  g.restore();
}
/** Sombrero de paja (sigue el giro de la cabeza). */
function sombrero(g, rc) {
  g.save(); g.translate(39, 72); g.rotate(rc); g.translate(-39, -72);
  const ala = g.createRadialGradient(39, 6, 4, 39, 6, 48);
  ala.addColorStop(0, "#e9c873"); ala.addColorStop(1, "#c79a3c");
  g.fillStyle = ala; g.beginPath(); g.ellipse(39, 7, 47, 9.5, 0, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(120,80,20,.5)"; g.lineWidth = 0.8;
  for (let r = 18; r < 47; r += 6) { g.beginPath(); g.ellipse(39, 7, r, r * 0.2, 0, 0, 6.283); g.stroke(); }
  const copa = g.createLinearGradient(20, 0, 58, 0);
  copa.addColorStop(0, "#c79a3c"); copa.addColorStop(0.45, "#f2d78a"); copa.addColorStop(1, "#b98a30");
  g.fillStyle = copa; g.beginPath(); g.moveTo(19, 6); g.bezierCurveTo(19, -16, 59, -16, 59, 6); g.closePath(); g.fill();
  g.fillStyle = "#c8222f"; g.beginPath(); g.moveTo(19.5, 1); g.bezierCurveTo(26, -1, 52, -1, 58.5, 1); g.lineTo(59, 6); g.lineTo(19, 6); g.closePath(); g.fill();
  g.strokeStyle = "rgba(120,80,20,.45)";
  for (let x = 24; x < 56; x += 5) { g.beginPath(); g.moveTo(x, -8); g.lineTo(x, 0); g.stroke(); }
  g.restore();
}

registrar({ id: "00048", nombre: "El jardinero", crear: () => new Jardinero() });
})();
