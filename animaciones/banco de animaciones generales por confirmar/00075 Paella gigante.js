"use strict";
/*
 * 00075 · PAELLA GIGANTE
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende el fuego debajo de una paellera enorme y aparece él detrás, removiendo con un remo. El humo sube cada vez
 * más y se junta en un corazón que late encima de su cabeza. El corazón estalla en corazoncitos y sale
 * ¡PAELLA PARA TODOS! Se apaga el fuego.
 */
(() => {
const cacheT = cacheTexto();
const PX = 512, PY = 468, PRX = 420, PRY = 88; // la paellera (centro y radios de la superficie)
const CORAZON = [512, 86], CESC = 4.9;

function paellaSprite() {
  const c = lienzoNuevo(900, 240), g = c.getContext("2d");
  const cx = 450, cy = 104, r = semilla(11);
  // asas rojas
  g.strokeStyle = "#8e1414"; g.lineWidth = 12; g.lineCap = "round";
  g.beginPath(); g.ellipse(cx - PRX - 18, cy + 8, 26, 18, 0, Math.PI * 0.55, Math.PI * 1.45); g.stroke();
  g.beginPath(); g.ellipse(cx + PRX + 18, cy + 8, 26, 18, 0, -Math.PI * 0.45, Math.PI * 0.45); g.stroke();
  // lado de la paellera
  const gl = g.createLinearGradient(0, cy, 0, cy + PRY + 30);
  gl.addColorStop(0, "#2c2f33"); gl.addColorStop(1, "#0d0e10");
  g.fillStyle = gl; g.beginPath(); g.ellipse(cx, cy + 22, PRX + 12, PRY + 10, 0, 0, Math.PI); g.lineTo(cx - PRX - 12, cy); g.ellipse(cx, cy, PRX + 12, PRY + 10, 0, Math.PI, 0, true); g.fill();
  // borde
  g.fillStyle = "#5d636a"; g.beginPath(); g.ellipse(cx, cy, PRX + 12, PRY + 10, 0, 0, 6.283); g.fill();
  g.fillStyle = "#24272b"; g.beginPath(); g.ellipse(cx, cy, PRX + 3, PRY + 3, 0, 0, 6.283); g.fill();
  // arroz con socarrat
  const cyE = (cy * PRX) / PRY, ga = g.createRadialGradient(cx, cyE - 30, 30, cx, cyE, PRX);
  ga.addColorStop(0, "#ffdc5a"); ga.addColorStop(0.72, "#f7b52a"); ga.addColorStop(0.94, "#d0801e"); ga.addColorStop(1, "#7a3c0a");
  g.save(); g.scale(1, PRY / PRX); g.fillStyle = ga; g.beginPath(); g.arc(cx, cyE, PRX, 0, 6.283); g.fill(); g.restore();
  const dentro = () => { for (;;) { const a = r() * 6.283, d = Math.sqrt(r()) * 0.9; return [cx + Math.cos(a) * PRX * d, cy + Math.sin(a) * PRY * d]; } };
  // granos
  for (const col of ["rgba(255,244,190,.8)", "rgba(190,110,20,.3)"]) {
    g.fillStyle = col; g.beginPath();
    for (let i = 0; i < 1100; i++) { const [x, y] = dentro(), a = r() * 3; g.moveTo(x + Math.cos(a) * 2.2, y + Math.sin(a) * 2.2); g.ellipse(x, y, 2.2, 1.1, a, 0, 6.283); }
    g.fill();
  }
  // tiras de pimiento
  for (let i = 0; i < 14; i++) {
    const [x, y] = dentro(), a = r() * 3;
    g.strokeStyle = "#c9160f"; g.lineWidth = 6; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - Math.cos(a) * 18, y - Math.sin(a) * 6); g.quadraticCurveTo(x, y - 5, x + Math.cos(a) * 18, y + Math.sin(a) * 6); g.stroke();
    g.strokeStyle = "rgba(255,160,140,.6)"; g.lineWidth = 1.6; g.stroke();
  }
  // guisantes
  for (let i = 0; i < 46; i++) { const [x, y] = dentro(); g.fillStyle = "#3d8a1c"; g.beginPath(); g.arc(x, y, 4.5, 0, 6.283); g.fill(); g.fillStyle = "#8ed45a"; g.beginPath(); g.arc(x - 1.3, y - 1.3, 1.6, 0, 6.283); g.fill(); }
  // mejillones
  for (let i = 0; i < 11; i++) {
    const [x, y] = dentro(), a = r() * 6.283;
    g.save(); g.translate(x, y); g.rotate(a);
    g.fillStyle = "#14141c"; g.beginPath(); g.ellipse(0, 0, 20, 10, 0, 0, 6.283); g.fill();
    g.fillStyle = "#33405c"; g.beginPath(); g.ellipse(-2, -2, 15, 5, 0, 0, 6.283); g.fill();
    g.fillStyle = "#f08a2a"; g.beginPath(); g.ellipse(2, 2, 11, 5, 0, 0, 6.283); g.fill();
    g.restore();
  }
  // gambas
  for (let i = 0; i < 9; i++) {
    const [x, y] = dentro(), a = r() * 6.283;
    g.save(); g.translate(x, y); g.rotate(a);
    g.strokeStyle = "#e0441c"; g.lineWidth = 13; g.lineCap = "round";
    g.beginPath(); g.arc(0, 0, 15, Math.PI * 0.1, Math.PI * 1.15); g.stroke();
    g.strokeStyle = "#ff8a5a"; g.lineWidth = 3;
    for (let k = 0; k < 5; k++) { const u = Math.PI * (0.2 + k * 0.2); g.beginPath(); g.moveTo(Math.cos(u) * 9, Math.sin(u) * 9); g.lineTo(Math.cos(u) * 21, Math.sin(u) * 21); g.stroke(); }
    g.fillStyle = "#c9300f"; g.beginPath(); g.moveTo(14, 3); g.lineTo(26, -4); g.lineTo(26, 10); g.closePath(); g.fill();
    g.fillStyle = "#000"; g.beginPath(); g.arc(-13, -6, 2, 0, 6.283); g.fill();
    g.strokeStyle = "#e0441c"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-16, -8); g.quadraticCurveTo(-30, -30, -10, -44); g.stroke();
    g.restore();
  }
  // limones
  for (const [lx, ly, la] of [[cx - 300, cy - 30, -0.4], [cx + 310, cy - 20, 0.5], [cx - 120, cy + 55, 0.1], [cx + 150, cy + 50, -0.2]]) {
    g.save(); g.translate(lx, ly); g.rotate(la);
    g.fillStyle = "#fffbe0"; g.beginPath(); g.arc(0, 0, 22, Math.PI, 0); g.closePath(); g.fill();
    g.fillStyle = "#ffe14a"; g.beginPath(); g.arc(0, 0, 18, Math.PI, 0); g.closePath(); g.fill();
    g.strokeStyle = "#fff6b0"; g.lineWidth = 1.5; for (let k = 1; k < 5; k++) { const u = Math.PI + (k * Math.PI) / 5; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(u) * 17, Math.sin(u) * 17); g.stroke(); }
    g.restore();
  }
  // brillo del aceite
  g.fillStyle = "rgba(255,255,230,.18)"; g.beginPath(); g.ellipse(cx - 80, cy - 30, 200, 26, -0.05, 0, 6.283); g.fill();
  return c;
}

/** El título, pintado una vez (con su brillo) en un lienzo; se rehace si cambian las fuentes. */
function titulo() {
  if (cacheT.has(1)) return cacheT.get(1);
  const c = lienzoNuevo(1040, 170), x = c.getContext("2d");
  const gr = x.createLinearGradient(0, 30, 0, 130);
  gr.addColorStop(0, "#fff6c2"); gr.addColorStop(0.5, "#ffcf2e"); gr.addColorStop(1, "#ff7a00");
  txt(x, "¡PAELLA PARA TODOS!", 520, 125, { tam: 108, peso: 900, fam: FD, color: gr, borde: "#5a1a00", bordeAncho: 12, esp: 3, glow: "rgba(255,120,30,.7)", glowTam: 24, max: 980 });
  txt(x, "¡PAELLA PARA TODOS!", 520, 125, { tam: 108, peso: 900, fam: FD, color: gr, esp: 3, max: 980 });
  cacheT.set(1, c);
  return c;
}
class EscenaPaella extends Escena {
  constructor() {
    super(9.8);
    titulo(); // se pinta ya, no en el momento del remate
    this.ESC = 1.8; this.X = 512;
    this.p = new Parts(420);
    this.nubes = []; this.granos = []; this.cors = [];
  }
  fuego() { return tramo(this.t, 0.15, 0.3) * (1 - tramo(this.t, 8.6, 9.3)); }
  remo(t) {
    // punta del remo dentro del arroz (gira en un óvalo) y el mango arriba
    const v = t < 5.9 ? 4.2 : 6.5, a = t * v;
    const E = [PX + 40 + 95 * Math.cos(a), PY - 8 + 22 * Math.sin(a)];
    const T = [PX + 96 + 20 * Math.cos(a), 200 + 12 * Math.sin(a)];
    return { E, T };
  }
  estado(t = this.t) {
    const pose = { cara: "sonrisa", rc: 0, brazoIDelante: true };
    const { E, T } = this.remo(t), ESC = this.ESC;
    const aAv = (q) => [39 + (q[0] - this.X) / ESC, 232 - (PIES - q[1]) / ESC];
    pose.manoD = aAv(mezcla(T, E, 0.36)); pose.manoI = aAv(mezcla(T, E, 0.6));
    pose.rc = 0.05 * Math.sin(t * 4.2 - 1);
    if (t > 1.6 && t < 3.7) pose.cara = Math.sin(t * 2) > 0.3 ? "guino" : "sonrisa";
    if (t >= 3.7 && t < 5.1) { pose.cara = "sorpresa"; pose.rc = -0.12; }
    if (t >= 5.1) pose.cara = t < 8.0 ? "risa" : "guino";
    if (t >= 6.0 && t < 7.0) pose.rc = 0.06 * Math.sin(t * 14);
    pose.objI = (g) => {
      // el mango del remo (por detrás de las manos)
      const a = aAv(T), b = aAv(mezcla(T, E, 0.8));
      g.strokeStyle = "#8a5a2e"; g.lineWidth = 5; g.lineCap = "round";
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      g.strokeStyle = "rgba(255,220,170,.4)"; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(a[0] - 1, a[1]); g.lineTo(b[0] - 1, b[1]); g.stroke();
    };
    const m = matAv(this.X, PIES + 2 * Math.sin(t * 8.4), ESC);
    return { pose, m, E, T };
  }
  puntoCorazon(i, n) {
    const th = (i / n) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(th), 3), y = 13 * Math.cos(th) - 5 * Math.cos(2 * th) - 2 * Math.cos(3 * th) - Math.cos(4 * th);
    return [CORAZON[0] + x * CESC, CORAZON[1] - y * CESC];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p, f = this.fuego();
    // fuego por los lados de la paellera
    if (f > 0) {
      const n = Math.round(60 * dt * f) + (Math.random() < 0.5 ? 1 : 0);
      for (let i = 0; i < n; i++) {
        const lado = Math.random() < 0.5 ? -1 : 1;
        p.nueva(P.LLAMA, PX + lado * azar(PRX - 40, PRX + 20), PY + PRY + azar(-4, 14), lado * azar(0, 30), azar(-120, -40), azar(0.25, 0.5), azar(30, 50), Math.random() < 0.3 ? 1 : 0);
      }
    }
    this.una("fwoosh", t > 0.15, () => { temblar(10, 0.3); for (let i = 0; i < 30; i++) p.nueva(P.LLAMA, PX + azar(-PRX, PRX), PY + PRY + 8, 0, azar(-260, -100), azar(0.3, 0.6), azar(40, 70), 1); });
    // humo normal
    if (t > 0.8 && t < 8.6 && Math.random() < (t < 3.7 ? 14 : 8) * dt) p.nueva(P.VAPOR, PX + azar(-PRX * 0.8, PRX * 0.8), PY + azar(-PRY * 0.6, PRY * 0.4), azar(-15, 15), azar(-120, -60), azar(1.0, 1.8), azar(30, 50));
    // nubecitas de humo que van a su sitio del corazón
    const N = 46;
    if (t > 3.0 && t < 4.9) {
      while (this.nubes.length < N && this.nubes.length < ((t - 3.0) / 1.9) * N) {
        const i = this.nubes.length, d = this.puntoCorazon(i * 17 % N, N);
        this.nubes.push({ t0: t, x0: PX + azar(-260, 260), y0: PY - azar(0, 40), x1: d[0], y1: d[1], s: azar(36, 52), f: azar(0, 6) });
      }
    }
    this.una("late", t > 5.0, () => temblar(6, 0.25));
    this.una("estalla", t > 6.0, () => {
      temblar(18, 0.5);
      for (let i = 0; i < 26; i++) { const a = azar(0, 6.283), v = azar(160, 520); this.cors.push({ x: CORAZON[0], y: CORAZON[1], vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, s: azar(10, 22), r: azar(-0.5, 0.5), v: azar(1.4, 2.2) }); }
      for (let i = 0; i < 90; i++) p.nueva(P.CONFETI, azar(0, W), azar(-160, -10), azar(-50, 50), azar(30, 120), azar(3, 4), azar(8, 14), (Math.random() * 5) | 0);
    });
    // granos que saltan al remover
    if (t > 0.8 && t < 8.6 && Math.random() < 10 * dt) {
      const { E } = this.remo(t);
      this.granos.push({ x: E[0] + azar(-10, 10), y: E[1], vx: azar(-120, 120), vy: azar(-330, -160) });
    }
    for (const q of this.granos) { q.vy += 1200 * dt; q.x += q.vx * dt; q.y += q.vy * dt; }
    this.granos = this.granos.filter((q) => q.y < PY + 30);
    for (const c of this.cors) { c.v -= dt; c.vy += 300 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.vx *= 1 - dt; }
    this.cors = this.cors.filter((c) => c.v > 0);
    p.alfa = 1 - tramo(t, 9.0, 9.6);
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), f = this.fuego();
    fondo(g, "#000");
    // resplandor del fuego
    if (f > 0) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.5 * f * (0.9 + 0.1 * Math.sin(t * 23));
      g.drawImage(BLOB.naranja, PX - PRX - 200, PY - 40, 2 * PRX + 400, 300);
      g.globalAlpha = 0.22 * f; g.drawImage(BLOB.amarillo, PX - 380, 120, 760, 400);
      g.restore();
    }
    pintarAvatar(g, e.m, e.pose, t);
    if (!this.spr) this.spr = paellaSprite();
    g.drawImage(this.spr, PX - 450, PY - 104);
    // borbotones
    g.fillStyle = "rgba(255,245,200,.7)";
    for (let i = 0; i < 9; i++) {
      const u = (t * 1.3 + i * 0.37) % 1, x = PX - 320 + ((i * 173) % 640), y = PY - 50 + ((i * 59) % 100);
      if (u < 0.5) { g.beginPath(); g.arc(x, y, 2 + u * 9, 0, 6.283); g.globalAlpha = 1 - u * 2; g.fill(); }
    }
    g.globalAlpha = 1;
    // la pala del remo dentro del arroz
    const { E, T } = e, S = mezcla(T, E, 0.8);
    g.save();
    g.beginPath(); g.ellipse(PX, PY, PRX, PRY, 0, 0, 6.283); g.clip();
    g.strokeStyle = "#8a5a2e"; g.lineWidth = 10; g.lineCap = "round";
    g.beginPath(); g.moveTo(S[0], S[1]); g.lineTo(E[0], E[1]); g.stroke();
    g.restore();
    g.fillStyle = "#7a4d26"; g.beginPath(); g.ellipse(E[0], E[1] + 2, 30, 9, 0, 0, 6.283); g.fill();
    g.fillStyle = "#f2b02a"; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(E[0] - 22 + i * 9, E[1] + 1 + (i % 2) * 2, 6, 3.5, 0, 0, 6.283); g.fill(); }
    // granos al aire
    g.fillStyle = "#ffd24a";
    for (const q of this.granos) { g.beginPath(); g.ellipse(q.x, q.y, 2.6, 1.4, q.vx * 0.01, 0, 6.283); g.fill(); }
    this.p.dibujar(g);
    // el corazón de humo
    const kEst = tramo(t, 6.0, 6.25);
    if (this.nubes.length && kEst < 1) {
      const late = t > 5.0 ? 1 + 0.08 * Math.max(0, Math.sin((t - 5.0) * 9)) : 1;
      const rosa = tramo(t, 4.8, 5.2);
      if (rosa > 0) {
        g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.55 * rosa * (1 - kEst);
        g.drawImage(BLOB.rojo, CORAZON[0] - 170 * late, CORAZON[1] - 150 * late, 340 * late, 300 * late); g.restore();
      }
      g.save();
      for (const n of this.nubes) {
        const u = eInOut(clamp((t - n.t0) / 1.1, 0, 1));
        let x = lerp(n.x0, n.x1, u) + Math.sin(t * 2 + n.f) * 4, y = lerp(n.y0, n.y1, u) + Math.cos(t * 2.3 + n.f) * 4;
        x = CORAZON[0] + (x - CORAZON[0]) * (u > 0.99 ? late : 1) * (1 + kEst * 1.5);
        y = CORAZON[1] + (y - CORAZON[1]) * (u > 0.99 ? late : 1) * (1 + kEst * 1.5);
        const s = n.s * (0.5 + 0.5 * u);
        g.globalAlpha = Math.min(1, u * 3) * 0.6 * (1 - kEst);
        g.drawImage(BLOB2.vapor, x - s / 2, y - s / 2, s, s);
        if (rosa > 0) { g.globalAlpha = 0.45 * rosa * (1 - kEst); g.drawImage(BLOB.rojo, x - s * 0.35, y - s * 0.35, s * 0.7, s * 0.7); }
      }
      g.restore();
    }
    // corazoncitos
    for (const c of this.cors) {
      g.save(); g.translate(c.x, c.y); g.rotate(c.r); g.globalAlpha = Math.min(1, c.v * 2) * (1 - tramo(t, 9.0, 9.5));
      const s = c.s / 16;
      g.scale(s, s); g.fillStyle = "#ff3d84";
      g.beginPath(); g.moveTo(0, 6); g.bezierCurveTo(-16, -6, -8, -16, 0, -8); g.bezierCurveTo(8, -16, 16, -6, 0, 6); g.fill();
      g.restore();
    }
    // ¡PAELLA PARA TODOS!
    if (t > 6.05) {
      const c = titulo(), k = tramo(t, 6.05, 6.25), s = lerp(2.4, 0.96, eIn(k)) * (1 + 0.02 * Math.sin(t * 8));
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - tramo(t, 8.9, 9.4)); g.translate(W / 2, 88); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(c, -c.width / 2, -c.height / 2); g.restore();
    }
    // a oscuras hasta que prende el fuego; al final se apaga
    const a = Math.max(1 - tramo(t, 0.15, 0.6), tramo(t, 9.1, this.dur - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00075", nombre: "Paella gigante", crear: () => new EscenaPaella() });
})();
