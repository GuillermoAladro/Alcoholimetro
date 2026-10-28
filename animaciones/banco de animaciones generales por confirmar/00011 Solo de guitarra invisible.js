"use strict";
/*
 * 00011 · SOLO DE GUITARRA INVISIBLE
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende un foco entre dos amplificadores. Toca una guitarra imaginaria (solo se ve su contorno de luz) cada vez
 * más fuerte: rasgueo lento, luego a tope con la cabeza a lo loco, se tira de rodillas derrapando y, echado hacia
 * atrás, le salen rayos y llamas de los dedos. Último acorde con el brazo en alto: ¡SOLO ÉPICO!
 */
(() => {
const SUELO = 556;          // suelo del escenario (el borde de delante empieza en 560)
const BORDE = 560;
const ESC = 1.5;
const RODILLAS = 4.6, FINAL = 8.25, OFF = 9.75;
const cache = cacheTexto();
let SPR11 = null;

function ampli() {
  const w = 170, h = 300, c = lienzoNuevo(w, h), g = c.getContext("2d");
  // cabezal
  g.fillStyle = "#151515"; rectR(g, 4, 0, w - 8, 66, 8); g.fill();
  g.fillStyle = "#c9a35a"; g.fillRect(14, 12, w - 28, 18);
  g.fillStyle = "#2a2a2a"; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(26 + i * 24, 21, 5.5, 0, 6.283); g.fill(); }
  g.fillStyle = "#e8e8e8"; for (let i = 0; i < 6; i++) g.fillRect(25 + i * 24, 16, 2, 5);
  g.fillStyle = "#0a0a0a"; g.fillRect(14, 38, w - 28, 18);
  // pantalla (caja)
  g.fillStyle = "#121212"; rectR(g, 0, 72, w, h - 72, 8); g.fill();
  g.fillStyle = "#1f1d1a"; rectR(g, 10, 82, w - 20, h - 92, 4); g.fill();
  g.strokeStyle = "rgba(255,255,255,.05)"; g.lineWidth = 1;
  for (let y = 86; y < h - 12; y += 5) { g.beginPath(); g.moveTo(12, y); g.lineTo(w - 12, y); g.stroke(); }
  g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2;
  for (const [x, y] of [[w * 0.3, 140], [w * 0.7, 140], [w * 0.3, 232], [w * 0.7, 232]]) { g.beginPath(); g.arc(x, y, 34, 0, 6.283); g.stroke(); }
  g.strokeStyle = "#3a3a3a"; g.lineWidth = 3; rectR(g, 1.5, 73.5, w - 3, h - 75, 8); g.stroke();
  return c;
}
function escenario() {
  const c = lienzoNuevo(W + 120, H - BORDE + 50), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, c.height);
  gr.addColorStop(0, "#2a1c12"); gr.addColorStop(0.15, "#140d08"); gr.addColorStop(1, "#050302");
  g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = "#6b4a2c"; g.fillRect(0, 0, c.width, 4);
  g.fillStyle = "rgba(255,190,90,.25)"; g.fillRect(0, 4, c.width, 2);
  return c;
}
function sprites() {
  if (!SPR11) SPR11 = { ampli: ampli(), escenario: escenario() };
  return SPR11;
}
function rotulo() {
  if (cache.has(1)) return cache.get(1);
  const c = lienzoNuevo(980, 200), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 150);
  gr.addColorStop(0, "#fff9c8"); gr.addColorStop(0.55, "#ffcf2e"); gr.addColorStop(1, "#ff6a00");
  txt(g, "¡SOLO ÉPICO!", 490, 150, { tam: 124, peso: 900, fam: FD, color: gr, borde: "#3a1200", bordeAncho: 11, esp: 4, glow: "rgba(255,120,20,.9)", glowTam: 30, max: 930 });
  txt(g, "¡SOLO ÉPICO!", 490, 150, { tam: 124, peso: 900, fam: FD, color: gr, esp: 4, max: 930 });
  cache.set(1, c);
  return c;
}
/** Nota musical (corchea o dos corcheas unidas) centrada en la cabeza de la nota. */
function nota(g, x, y, s, rot, col, doble, a) {
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha *= a;
  g.fillStyle = col; g.strokeStyle = col; g.lineWidth = s * 0.22; g.lineCap = "round";
  g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = 0;
  const cabeza = (cx, cy) => { g.beginPath(); g.ellipse(cx, cy, s * 0.62, s * 0.46, -0.4, 0, 6.283); g.fill(); };
  cabeza(0, 0);
  g.beginPath(); g.moveTo(s * 0.52, -s * 0.12); g.lineTo(s * 0.52, -s * 2.1);
  if (doble) {
    cabeza(s * 1.5, -s * 0.35);
    g.moveTo(s * 2.02, -s * 0.47); g.lineTo(s * 2.02, -s * 2.4); g.stroke();
    g.lineWidth = s * 0.42; g.beginPath(); g.moveTo(s * 0.52, -s * 2.0); g.lineTo(s * 2.02, -s * 2.3); g.stroke();
  } else {
    g.stroke();
    g.lineWidth = s * 0.3; g.beginPath(); g.moveTo(s * 0.52, -s * 2.05); g.quadraticCurveTo(s * 1.4, -s * 1.7, s * 1.2, -s * 0.9); g.stroke();
  }
  g.restore();
}
/** Rayo quebrado que sale de (x, y) hacia `ang`. */
function rayo(x, y, ang, largo) {
  const pts = [[x, y]], n = 7;
  for (let i = 1; i <= n; i++) {
    const d = (largo * i) / n, q = azar(-1, 1) * 18 * Math.min(1, i / 2);
    pts.push([x + Math.cos(ang) * d - Math.sin(ang) * q, y + Math.sin(ang) * d + Math.cos(ang) * q]);
  }
  return { pts, vida: azar(0.05, 0.1) };
}
/** Contorno de luz de la guitarra imaginaria, en unidades de avatar: caja en C, mástil hacia la mano M. */
function guitarra(g, C, M, k, t) {
  if (k <= 0.01) return;
  const ang = Math.atan2(M[1] - C[1], M[0] - C[0]), L = Math.hypot(M[0] - C[0], M[1] - C[1]) + 12;
  g.save(); g.translate(C[0], C[1]); g.rotate(ang);
  g.globalCompositeOperation = "lighter";
  const ruta = () => {
    g.beginPath();
    g.arc(-7, 0, 21, 0.711, 6.283 - 0.711);
    g.arc(15, 0, 15, 4.29, 8.27);
    g.closePath();
    g.moveTo(29, -3.6); g.lineTo(L, -3.6); g.lineTo(L, 3.6); g.lineTo(29, 3.6);
    g.moveTo(L, -5.5); g.lineTo(L + 15, -6.5); g.lineTo(L + 15, 6.5); g.lineTo(L, 5.5); g.closePath();
    g.moveTo(14, 0); g.arc(8, 0, 6, 0, 6.283);
  };
  const discont = k < 0.6;
  if (discont) { g.setLineDash([3.5, 3]); g.lineDashOffset = -t * 20; }
  ruta();
  g.lineJoin = "round";
  g.strokeStyle = `rgba(255,170,40,${0.22 * k})`; g.lineWidth = 6; g.stroke();
  g.strokeStyle = `rgba(255,236,170,${0.75 * k})`; g.lineWidth = 1.6; g.stroke();
  g.setLineDash([]);
  // cuerdas
  g.strokeStyle = `rgba(255,250,220,${0.35 * k})`; g.lineWidth = 0.6;
  g.beginPath();
  for (const yy of [-2.2, 0, 2.2]) { g.moveTo(-14, yy * 1.4); g.lineTo(L + 2, yy); }
  g.stroke();
  g.restore();
}

class EscenaSolo extends Escena {
  constructor() {
    super(10.4);
    this.p = new Parts(440);
    this.notas = []; this.rayos = [];
    this.flash = 0; this.ultimoRasgueo = 0; this.x = 420; this.fase = 0;
  }
  /** Intensidad del solo 0–1. */
  fuerza(t) { return t < 1.0 ? 0 : t < 3.0 ? 0.25 * tramo(t, 1.0, 3.0) : t < RODILLAS ? lerp(0.3, 0.6, tramo(t, 3.0, RODILLAS)) : t < FINAL ? lerp(0.65, 1, tramo(t, 5.0, 7.6)) : Math.max(0, 1 - (t - FINAL) * 0.5); }
  /** Velocidad del rasgueo (vueltas por segundo). */
  ritmo(t) { return t < 3.0 ? 3.2 : t < RODILLAS ? 6 : 10; }
  xPos(t) { return t < RODILLAS ? 420 : lerp(420, 548, eOut(tramo(t, RODILLAS, RODILLAS + 0.5))); }
  estado() {
    const t = this.t, f = this.fuerza(t);
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], brazoIDelante: true };
    const kPose = eInOut(tramo(t, 0.55, 1.0));
    const kRod = eInOut(tramo(t, RODILLAS, RODILLAS + 0.42));
    const kAtras = eInOut(tramo(t, RODILLAS + 0.35, RODILLAS + 0.9));
    const fase = this.fase || 0, s = Math.sin(fase);
    let manoI = mezcla([9, 160], [-26, 100], kPose), manoD = mezcla([70, 158], [56, 141], kPose);
    if (t > 1.0 && t < FINAL) manoD = [56 + 3 * s, 141 + (8 + 6 * f) * s];
    manoI = mezcla(manoI, [-24, 60], kAtras);
    if (kAtras > 0 && t < FINAL) manoD = mezcla(manoD, [58 + 3 * s, 130 + 14 * s], kAtras);
    if (t > 1.0) manoI = [manoI[0] + 3 * Math.sin(t * 13) * f, manoI[1] + 2 * Math.sin(t * 9) * f];
    // cabeza y cara
    let rc = 0;
    if (t > 1.0 && t < 3.0) { rc = 0.08 * Math.sin(t * 7); pose.cara = t < 2.0 ? "sonrisa" : "guino"; }
    else if (t >= 3.0 && t < RODILLAS) { rc = 0.26 * Math.sin(t * 15); pose.cara = "risa"; }
    else if (t >= RODILLAS && t < FINAL) { rc = -0.2 * kAtras + 0.1 * Math.sin(t * 17); pose.cara = t < RODILLAS + 0.5 ? "sorpresa" : Math.floor(t * 2.2) % 2 ? "dormido" : "risa"; }
    // último acorde: molinete y brazo arriba
    let kArriba = 0;
    if (t >= FINAL - 0.35) {
      const u = tramo(t, FINAL - 0.35, FINAL);
      const a = lerp(Math.PI * 0.45, -Math.PI * 1.6, eIn(u));     // el brazo da la vuelta
      const molino = [69 + Math.cos(a) * 72, 86 + Math.sin(a) * 72];
      kArriba = eOut(tramo(t, FINAL, FINAL + 0.25));
      manoD = t < FINAL ? molino : mezcla([69 + Math.cos(-Math.PI * 1.6) * 72, 86 + Math.sin(-Math.PI * 1.6) * 72], [86, -30], kArriba);
      pose.cara = t < FINAL ? "sorpresa" : "risa";
      rc = t < FINAL ? -0.2 : lerp(-0.2, -0.12, kArriba);
      manoI = mezcla(manoI, [-4, 138], kArriba);
    }
    if (t > FINAL + 0.6) pose.cara = Math.floor(t * 1.5) % 2 ? "guino" : "risa";
    pose.rc = rc;
    // piernas: abiertas en el solo; de rodillas se esconden tras el borde del escenario
    const abre = eInOut(tramo(t, 2.9, 3.2));
    pose.piernaI = [-30 * kRod, 0.1 * abre]; pose.piernaD = [-30 * kRod, -0.1 * abre];
    let bote = 0;
    if (t > 3.0 && t < RODILLAS) bote = -Math.abs(Math.sin(t * 7.5)) * 8;
    const yPies = SUELO + kRod * (30 * ESC + 34) + bote;
    const giro = -0.3 * kAtras * (1 - 0.35 * kArriba) + (t > RODILLAS && t < FINAL ? 0.02 * Math.sin(t * 23) * f : 0);
    pose.manoD = manoD; pose.manoI = manoI;
    // la guitarra imaginaria: la caja junto a la mano del rasgueo y el mástil hacia la otra mano
    const kG = this.guitarraVisible(t);
    const C = kAtras > 0 ? mezcla([50, 146], [50, 136], kAtras) : [50, 146];
    pose.objI = (g, mI) => guitarra(g, C, mI, kG, t);
    const m = matAv(this.x, yPies, ESC, giro);
    return { pose, m, f, kRod };
  }
  guitarraVisible(t) {
    if (t < 0.9) return 0;
    if (t < FINAL) return 0.35 + 0.65 * Math.max(0, this.fuerza(t) - 0.3) / 0.7 + (t < 1.25 ? 0.6 * (1 - tramo(t, 0.9, 1.25)) : 0);
    return Math.max(0, 1 - tramo(t, FINAL, FINAL + 0.12));
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.x = this.xPos(t);
    this.fase = (this.fase || 0) + dt * 6.283 * (t > 1.0 && t < FINAL ? this.ritmo(t) : 0);
    const e = this.estado(), f = e.f;
    const mD = aPant(e.m, e.pose.manoD), mI = aPant(e.m, e.pose.manoI);
    // cada rasgueo suelta una nota
    const golpes = Math.floor(this.fase / Math.PI);
    if (t > 1.0 && t < FINAL && golpes !== this.ultimoRasgueo) {
      this.ultimoRasgueo = golpes;
      if (Math.random() < 0.5 + 0.4 * f) {
        const col = ["#ffd34d", "#fff3c0", "#ff9a2e", "#2fe3e8"][(Math.random() * 4) | 0];
        this.notas.push({ x: mD[0] + 20, y: mD[1] - 10, vx: azar(60, 260) * (Math.random() < 0.3 ? -1 : 1), vy: azar(-260, -120) * (0.6 + f), r: azar(-0.4, 0.4), vr: azar(-3, 3), v: 0, vm: azar(0.9, 1.5), s: azar(11, 15) * (0.85 + 0.6 * f), col, doble: Math.random() < 0.35 });
      }
      if (f > 0.3) for (let i = 0; i < 3 + f * 6; i++) { const a = azar(-Math.PI, 0), v = azar(150, 450); p.nueva(P.CHISPA, mD[0], mD[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.2, 0.45), azar(5, 10)); }
    }
    // llamas y rayos de los dedos cuando va a tope
    if (t > RODILLAS + 0.4 && t < FINAL) {
      const n = Math.round((40 + 160 * f) * dt);
      for (let i = 0; i < n; i++) p.nueva(P.LLAMA, mD[0] + azar(-12, 12), mD[1] + azar(-8, 8), azar(-60, 60), azar(-420, -200), azar(0.25, 0.5), azar(24, 48) * (0.6 + 0.4 * f), Math.random() < 0.3 ? 1 : 0);
      if (Math.random() < 16 * dt * f) this.rayos.push(rayo(mI[0], mI[1], azar(-2.6, -1.4), azar(90, 170)));
      if (Math.random() < 10 * dt * f) this.rayos.push(rayo(mD[0], mD[1], azar(-0.6, 0.5), azar(80, 150)));
      temblar(2 + 5 * f, 0.1);
    }
    // derrape de rodillas
    if (t > RODILLAS + 0.25 && t < RODILLAS + 0.65) {
      for (let i = 0; i < 3; i++) p.nueva(P.CHISPA, this.x + azar(-30, 30), BORDE, azar(-500, -150), azar(-260, -60), azar(0.25, 0.5), azar(6, 11));
      if (Math.random() < 0.5) p.nueva(P.HUMO, this.x + azar(-30, 20), BORDE - 6, azar(-80, -20), azar(-40, -10), azar(0.6, 1), azar(24, 40));
    }
    this.una("rodillas", t > RODILLAS + 0.45, () => temblar(14, 0.3));
    this.una("titulo", t > 6.5, () => temblar(16, 0.3));
    // último acorde
    this.una("acorde", t > FINAL, () => {
      this.flash = 0.75; temblar(30, 0.8);
      const e2 = this.estado();
      const C = aPant(e2.m, [30, 120]);
      for (let i = 0; i < 70; i++) { const a = azar(0, 6.283), v = azar(250, 900); p.nueva(P.CHISPA, C[0], C[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.4, 1.0), azar(8, 16)); }
      for (let i = 0; i < 40; i++) p.nueva(P.LLAMA, C[0] + azar(-90, 90), C[1] + azar(-60, 60), azar(-100, 100), azar(-500, -200), azar(0.3, 0.7), azar(40, 80), 1);
      for (let i = 0; i < 8; i++) this.rayos.push(rayo(C[0], C[1], azar(0, 6.283), azar(140, 260)));
      for (let i = 0; i < 10; i++) this.notas.push({ x: C[0], y: C[1], vx: azar(-500, 500), vy: azar(-500, -100), r: 0, vr: azar(-4, 4), v: 0, vm: azar(1.2, 1.8), s: azar(14, 20), col: "#ffd34d", doble: i % 3 === 0 });
    });
    if (t > FINAL + 0.2 && t < OFF && Math.random() < 30 * dt) p.nueva(P.PURPURINA, azar(150, 900), azar(-20, 120), azar(-20, 20), azar(30, 80), azar(1, 1.6), azar(6, 12));
    if (t > FINAL && t < FINAL + 0.6) for (const q of [aPant(e.m, e.pose.manoD)]) p.nueva(P.LLAMA, q[0] + azar(-10, 10), q[1] + azar(-10, 10), 0, azar(-300, -150), azar(0.2, 0.4), azar(20, 40), 1);
    // notas
    for (const n of this.notas) { n.v += dt; n.vy += 160 * dt; n.x += n.vx * dt; n.y += n.vy * dt; n.r += n.vr * dt; }
    this.notas = this.notas.filter((n) => n.v < n.vm);
    for (const r of this.rayos) r.vida -= dt;
    this.rayos = this.rayos.filter((r) => r.vida > 0);
    this.flash = Math.max(0, this.flash - dt * 2.4);
    p.alfa = 1 - tramo(t, OFF - 0.3, OFF + 0.3);
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), S = sprites(), f = e.f;
    fondo(g, "#000");
    const parpadeo = t < 0.7 ? [0, 0.9, 0, 0, 1, 0.4, 1][Math.min(6, Math.floor(t / 0.1))] : 1;
    const luz = parpadeo * (1 - tramo(t, OFF, OFF + 0.5));
    // resplandor de fondo que crece con el solo
    if (f > 0 && luz > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 * f * luz;
      g.drawImage(BLOB.naranja, this.x - 420, 120, 840, 520); g.restore();
    }
    // amplificadores
    g.save(); g.globalAlpha = luz * 0.95;
    for (const [x, i] of [[40, 0], [814, 1]]) {
      const tiembla = f > 0.3 ? azar(-1.5, 1.5) * f : 0;
      g.drawImage(S.ampli, x + tiembla, SUELO - 300 + tiembla);
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = luz * (0.15 + 0.5 * f) * (0.8 + 0.2 * Math.sin(t * 30 + i));
      g.drawImage(BLOB.naranja, x - 10, SUELO - 210, 190, 190); g.restore();
    }
    g.restore();
    foco(g, this.x, this.x, SUELO, 170, luz * (f > 0.6 ? 0.7 : 1));
    // el guitarrista (de rodillas, las piernas se esconden tras el borde del escenario)
    if (luz > 0) {
      g.save(); g.globalAlpha = Math.min(1, 0.15 + luz);
      pintarAvatar(g, e.m, e.pose, t);
      g.restore();
    }
    g.save(); g.globalAlpha = luz; g.drawImage(S.escenario, -60, BORDE); g.restore();
    // la luz del foco en el borde
    this.p.dibujar(g);
    dibujarRayos(g, this.rayos);
    g.save(); g.globalAlpha = luz;
    for (const n of this.notas) nota(g, n.x, n.y, n.s, n.r, n.col, n.doble, Math.min(1, (n.vm - n.v) * 3));
    g.restore();
    // ¡SOLO ÉPICO!
    if (t > 6.5) {
      const R = rotulo(), k = tramo(t, 6.5, 6.66);
      const golpe = t > FINAL ? 1 + 0.25 * Math.exp(-(t - FINAL) * 6) : 1;
      const s = lerp(3, 1, eIn(k)) * golpe * 0.95;
      const a = Math.min(1, k * 4) * (1 - tramo(t, OFF - 0.2, OFF + 0.35));
      if (a > 0) {
        g.save(); g.globalAlpha = a; g.translate(W / 2 + (t < FINAL ? azar(-2, 2) * f : 0), 100); g.rotate(-0.03); g.scale(s, s);
        g.drawImage(R, -R.width / 2, -R.height / 2 - 18); g.restore();
      }
    }
    if (this.flash > 0) { g.fillStyle = `rgba(255,240,200,${this.flash * 0.8})`; g.fillRect(-60, -60, W + 120, H + 120); }
    if (luz < 1 && t < 1) { g.fillStyle = `rgba(0,0,0,${0.97 * (1 - luz)})`; g.fillRect(-60, -60, W + 120, H + 120); }
    if (t > OFF + 0.45) { g.fillStyle = "#000"; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00011", nombre: "Solo de guitarra invisible", crear: () => new EscenaSolo() });
})();
