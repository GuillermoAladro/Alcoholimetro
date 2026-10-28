"use strict";
/*
 * 00056 · EL GLOBO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende un foco. Saca un globo verde desinflado y lo sopla: cada soplido lo hace más grande y él se pone más
 * nervioso (tiembla, suda, se echa para atrás, cierra los ojos, soplidos cortitos…). El globo se estira, chirría y…
 * ¡POP!: estalla en confeti, se le pone el pelo de punta y se queda con el trocito de goma en la boca.
 */
(() => {
const POP = 6.1;
// soplidos: [inicio, fin, radio inicial, radio final]
const SOPLOS = [[1.25, 1.65, 10, 50], [1.95, 2.4, 50, 86], [2.7, 3.2, 86, 120], [3.55, 4.1, 120, 150], [4.5, 5.1, 150, 176], [5.45, 5.62, 176, 184], [5.72, 5.86, 184, 191], [5.94, 6.08, 191, 196]];

/** Globo en coordenadas de pantalla: el cuello sale de (x, y) en dirección ang. r = radio. */
function globo(g, x, y, ang, r, t, tension) {
  const cuello = 20 + r * 0.17, wob = 1 + 0.025 * tension * Math.sin(t * 23);
  const rx = r * 1.1 * wob, ry = r / wob, cx = cuello + rx;
  g.save(); g.translate(x, y); g.rotate(ang);
  // cuello
  const gc = g.createLinearGradient(0, 0, cuello + 6, 0);
  gc.addColorStop(0, "#0e7a33"); gc.addColorStop(1, "#22d65a");
  g.fillStyle = gc;
  g.beginPath(); g.moveTo(-3, -4); g.quadraticCurveTo(cuello * 0.6, -4, cuello + 6, -6 - r * 0.07); g.lineTo(cuello + 6, 6 + r * 0.07); g.quadraticCurveTo(cuello * 0.6, 4, -3, 4); g.closePath(); g.fill();
  // cuerpo
  const claro = 0.25 + 0.5 * tension;
  const gr = g.createRadialGradient(cx + rx * 0.25, -ry * 0.4, r * 0.08, cx, 0, Math.max(rx, ry) * 1.05);
  gr.addColorStop(0, `rgba(${Math.round(190 + 60 * claro)},255,${Math.round(200 + 40 * claro)},.97)`);
  gr.addColorStop(0.35, "rgba(52,240,100,.95)"); gr.addColorStop(0.85, "rgba(10,150,55,.95)"); gr.addColorStop(1, "rgba(5,95,35,.95)");
  g.fillStyle = gr;
  g.beginPath(); g.ellipse(cx, 0, rx, ry, 0, 0, 6.283); g.fill();
  g.strokeStyle = "rgba(4,60,22,.7)"; g.lineWidth = 2.5; g.stroke();
  // brillos
  g.fillStyle = `rgba(255,255,255,${0.45 + 0.35 * tension})`;
  g.beginPath(); g.ellipse(cx + rx * 0.32, -ry * 0.52, rx * 0.2, ry * 0.08, -0.5, 0, 6.283); g.fill();
  g.beginPath(); g.ellipse(cx + rx * 0.62, -ry * 0.28, rx * 0.05, ry * 0.05, 0, 0, 6.283); g.fill();
  g.restore();
}

class EscenaGlobo extends Escena {
  constructor() {
    super(8.9);
    this.p = new Parts(420);
    this.p.suelo = () => PIES - 2;
    this.X = 360; this.ESC = 1.55;
    this.gomas = []; this.flash = 0; this.sudor = [];
  }
  radio(t) {
    let r = 10;
    for (const [a, b, r0, r1] of SOPLOS) { if (t >= b) r = r1; else if (t > a) { r = lerp(r0, r1, eOut(tramo(t, a, b))); break; } else break; }
    return r;
  }
  soplando(t) { for (const [a, b] of SOPLOS) if (t > a && t < b) return true; return false; }
  nervios() { return tramo(this.t, 2.4, 5.9); }
  estado() {
    const t = this.t, nerv = this.nervios(), pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 158], manoI = [9, 160], sx = 1, sy = 1, giro = 0, dx = 0;
    const sopla = this.soplando(t);
    const kBoca = eInOut(tramo(t, 0.85, 1.2));
    // saca el globo y se lo lleva a la boca
    manoD = mezcla(manoD, [74, 126], eInOut(tramo(t, 0.4, 0.75)));
    const b = boca(0);
    manoD = mezcla(manoD, [b[0] + 15, b[1] + 6], kBoca);
    if (t > 1.2 && t < POP) {
      pose.cara = sopla ? "sorpresa" : "dormido";
      if (t > 5.1 && t < 5.45) pose.cara = "sorpresa";
      // coge aire entre soplido y soplido
      if (!sopla) { const k = Math.sin(Math.PI * tramo((t - 1.2) % 1, 0, 0.3)); sx += 0.04 * k * (t < 5.1 ? 1 : 0); }
      // nervios: se echa para atrás, tiembla, aprieta el puño
      giro = -0.09 * eInOut(tramo(t, 3.2, 5.2));
      pose.rc = -0.12 * eInOut(tramo(t, 3.2, 5.2)) + 0.02 * nerv * Math.sin(t * 41);
      dx = azar(-1, 1) * 2.5 * nerv;
      manoI = mezcla([9, 160], [-2, 136 + 3 * Math.sin(t * 30)], nerv);
      if (t > 5.45) pose.cara = "dormido"; // ojos apretados en los soplidos cortitos
    }
    // ¡POP!
    if (t >= POP) {
      const k = tramo(t, POP, POP + 0.15);
      pose.cara = t < 7.15 ? "sorpresa" : t < 7.6 ? "guino" : "risa";
      pose.puntas = t < 7.0 ? eBack(k) : 1 - eInOut(tramo(t, 7.0, 7.8));
      giro = lerp(-0.09, -0.16, k) * (1 - eInOut(tramo(t, 6.45, 6.9)));
      sy = 1 + 0.06 * Math.sin(Math.PI * tramo(t, POP, POP + 0.3));
      manoD = mezcla([b[0] + 15, b[1] + 6], [100, 120], eOut(tramo(t, POP, POP + 0.2)));
      manoI = mezcla([-2, 136], [-20, 112], eOut(tramo(t, POP, POP + 0.2)));
      if (t > 7.15) { manoD = mezcla([100, 120], [94, 52], eInOut(tramo(t, 7.15, 7.45))); manoI = mezcla([-20, 112], [9, 160], eInOut(tramo(t, 7.15, 7.45))); }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    // el globo desinflado en la mano antes de soplar
    if (t > 0.45 && t < 1.05) pose.objD2 = (g, m) => {
      g.save(); g.translate(m[0] + 1, m[1] - 2); g.rotate(0.3 + 0.2 * Math.sin(t * 9));
      g.fillStyle = "#1fc552"; g.beginPath(); g.moveTo(-2, 0); g.quadraticCurveTo(4, 8, 2, 16); g.quadraticCurveTo(-1, 20, -4, 15); g.quadraticCurveTo(-5, 7, -2, 0); g.fill();
      g.restore();
    };
    // después del pop: el trocito de goma colgando de la boca
    if (t >= POP) pose.objD2 = (g) => {
      const bb = boca(pose.rc);
      g.save(); g.translate(bb[0] + 2, bb[1] + 1); g.rotate(0.9 + 0.25 * Math.sin(t * 7));
      g.fillStyle = "#1fc552"; g.beginPath(); g.moveTo(0, -1.5); g.quadraticCurveTo(6, -2, 9, 2); g.quadraticCurveTo(7, 4, 4, 3); g.quadraticCurveTo(2, 2, 0, 1.5); g.fill();
      g.restore();
    };
    const m = matAv(this.X + dx, PIES, this.ESC, giro, sx, sy);
    return { pose, m };
  }
  /** Dónde está el globo: boca (pantalla), ángulo y radio. */
  globo(e) {
    const t = this.t, M = aPant(e.m, boca(e.pose.rc)), r = this.radio(t);
    const ang = lerp(1.25, -0.3, eOut(tramo(r, 10, 70))) + 0.05 * Math.sin(t * 3);
    return { x: M[0] + 3, y: M[1] + 1, ang, r };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, e = this.estado();
    // gotas de sudor
    if (t > 3.3 && t < POP && Math.random() < 7 * dt) {
      const q = aPant(e.m, [Math.random() < 0.6 ? 10 : 66, 24]);
      this.sudor.push({ x: q[0], y: q[1], vx: (q[0] < this.X ? -1 : 1) * azar(40, 120), vy: azar(-220, -120), v: 0.7, s: azar(4, 6) });
    }
    for (const s of this.sudor) { s.v -= dt; s.vy += 1100 * dt; s.x += s.vx * dt; s.y += s.vy * dt; }
    this.sudor = this.sudor.filter((s) => s.v > 0);
    this.una("pop", t > POP, () => {
      const G = this.globo(e), cx = G.x + Math.cos(G.ang) * (G.r * 1.1 + 20 + G.r * 0.17), cy = G.y + Math.sin(G.ang) * (G.r * 1.1 + 20 + G.r * 0.17);
      this.centro = [cx, cy]; this.flash = 1; temblar(28, 0.6);
      for (let i = 0; i < 230; i++) {
        const a = azar(0, 6.283), v = azar(80, 700), rr = azar(0, G.r * 0.9);
        p.nueva(P.CONFETI, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.9, Math.cos(a) * v, Math.sin(a) * v - 120, azar(3.5, 5.5), azar(9, 16), i % 3 ? 0 : (Math.random() * 5) | 0);
      }
      for (let i = 0; i < 10; i++) { const a = azar(0, 6.283), v = azar(400, 800); this.gomas.push({ x: cx + Math.cos(a) * G.r * 0.7, y: cy + Math.sin(a) * G.r * 0.7, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 200, r: azar(0, 6), vr: azar(-14, 14), s: azar(14, 26) }); }
      for (let i = 0; i < 20; i++) { const a = azar(0, 6.283), v = azar(300, 700); p.nueva(P.DESTELLO, cx + Math.cos(a) * G.r * 0.6, cy + Math.sin(a) * G.r * 0.6, Math.cos(a) * v * 0.2, Math.sin(a) * v * 0.2, azar(0.2, 0.4), azar(40, 90)); }
    });
    for (const s of this.gomas) { s.vy += 1400 * dt; s.vx *= 1 - 1.2 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.r += s.vr * dt; if (s.y > PIES - 4) { s.y = PIES - 4; s.vy = 0; s.vx *= 0.8; s.vr = 0; } }
    this.flash = Math.max(0, this.flash - dt * 3.2);
    p.alfa = 1 - tramo(t, 8.2, 8.85);
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), luz = (t < 0.5 ? [0, 1, 0, 0.5, 1][Math.min(4, Math.floor(t / 0.1))] : 1) * (1 - tramo(t, 8.2, 8.85));
    fondo(g, "#000");
    foco(g, this.X + 80, this.X + 60, PIES, 230, 0.75 * luz);
    g.save(); g.globalAlpha = luz;
    pintarAvatar(g, e.m, e.pose, t);
    if (t > 1.05 && t < POP) {
      const G = this.globo(e), tension = tramo(G.r, 140, 196);
      globo(g, G.x, G.y, G.ang, G.r, t, tension);
      // los dedos pellizcando el cuello (la mano por delante)
    }
    // gotas de sudor
    for (const s of this.sudor) {
      g.save(); g.translate(s.x, s.y); g.rotate(Math.atan2(s.vy, s.vx) - Math.PI / 2); g.globalAlpha = luz * Math.min(1, s.v * 3);
      g.fillStyle = "#bfe9ff"; g.beginPath(); g.moveTo(0, -s.s * 1.8); g.quadraticCurveTo(s.s, 0, 0, s.s); g.quadraticCurveTo(-s.s, 0, 0, -s.s * 1.8); g.fill();
      g.fillStyle = "rgba(255,255,255,.8)"; g.beginPath(); g.arc(-s.s * 0.3, 0, s.s * 0.25, 0, 6.283); g.fill();
      g.restore();
    }
    // trocitos de goma
    for (const s of this.gomas) {
      g.save(); g.translate(s.x, s.y); g.rotate(s.r);
      g.fillStyle = "#1fc552"; g.beginPath(); g.moveTo(-s.s / 2, 0); g.quadraticCurveTo(0, -s.s * 0.5, s.s / 2, 0); g.quadraticCurveTo(0, -s.s * 0.2, -s.s / 2, 0); g.fill();
      g.restore();
    }
    g.restore();
    this.p.dibujar(g);
    // chirridos del globo
    if (t > 4.6 && t < POP) {
      const G = this.globo(e), q = [G.x + Math.cos(G.ang) * G.r * 2.1, G.y + Math.sin(G.ang) * G.r * 2.1 - 30];
      const a = Math.sin(t * 7) > 0 ? 1 : 0;
      txt(g, t < 5.4 ? "ñiiic" : "ñiiiiiic", clamp(q[0], 120, W - 120), clamp(q[1] - 20, 60, 560), { tam: 34, peso: 400, fam: FC, color: "#d8ffe0", esp: 2, alfa: a * luz });
    }
    if (t > 5.45 && t < POP) {
      const q = aPant(e.m, [-30, 40]);
      txt(g, "fff…", q[0], q[1], { tam: 30, peso: 400, fam: FC, color: "#fffdf5", esp: 2, alfa: 0.8 });
    }
    // fogonazo del pop
    if (this.flash > 0 && this.centro) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = this.flash;
      const R = 520 * (1.2 - this.flash * 0.5);
      g.drawImage(BLOB.blanco, this.centro[0] - R, this.centro[1] - R, R * 2, R * 2); g.restore();
    }
    // ¡POP!
    if (t > POP && t < 8.6) {
      const k = tramo(t, POP, POP + 0.16), s = lerp(0.3, 1, eBack(k)) * (1 + 0.05 * Math.sin(t * 8));
      const c = this.centro || [600, 250];
      g.save(); g.translate(clamp(c[0], 300, W - 260) + (t < POP + 0.5 ? azar(-5, 5) : 0), clamp(c[1], 170, 300)); g.rotate(-0.12); g.scale(s, s);
      txt(g, "¡POP!", 0, 0, { tam: 210, peso: 400, fam: FC, color: "#ffd34d", borde: "#3a2400", bordeAncho: 14, esp: 4, alfa: Math.min(1, k * 4) * luz });
      g.restore();
    }
    if (t < 0.5 && luz < 1) { g.fillStyle = `rgba(0,0,0,${1 - luz})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00056", nombre: "El globo", crear: () => new EscenaGlobo() });
})();
