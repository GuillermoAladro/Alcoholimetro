"use strict";
/*
 * 00052 · EL MEDIDOR LOCO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende un medidor de aguja gigante en g/L (con la marca del récord real del bar) unido por un tubo a una
 * boquilla. Coge aire y sopla: los soplidos viajan por el tubo y la aguja sube, pasa el récord, choca con el tope,
 * lo rompe y se pone a dar vueltas como un ventilador. Sale volando por encima de su cabeza (se agacha) y el medidor
 * se queda echando humo. ¡FUERA DE ESCALA!
 */
(() => {
const CT = cacheTexto();
/** Texto con brillo pintado una vez en un lienzo (el brillo es caro en la Pi). Devuelve { c, ox, oy }: el ancla. */
function rotulo(s, o, grad) {
  const clave = s + "|" + o.tam + "|" + (o.alin || "");
  if (CT.has(clave)) return CT.get(clave);
  const m = lienzoNuevo(1, 1).getContext("2d");
  m.font = `${o.peso || 800} ${o.tam}px ${o.fam || FT}`;
  if ("letterSpacing" in m) m.letterSpacing = (o.esp || 0) + "px";
  let w = m.measureText(s).width, tam = o.tam;
  if (o.max && w > o.max) { tam = Math.floor((tam * o.max) / w); w = (w * tam) / o.tam; }
  const pad = (o.glowTam || 0) * 1.6 + (o.bordeAncho || 0) + 8;
  const c = lienzoNuevo(w + 2 * pad, tam * 1.4 + 2 * pad), g = c.getContext("2d");
  const ox = o.alin === "left" ? pad : c.width / 2, oy = pad + tam;
  g.translate(ox, oy);
  const op = Object.assign({}, o, { tam, max: null, alfa: null });
  if (grad) op.color = grad(g);
  txt(g, s, 0, 0, op);
  const r = { c, ox, oy };
  CT.set(clave, r);
  return r;
}
function ponerRotulo(g, r, x = 0, y = 0) { g.drawImage(r.c, x - r.ox, y - r.oy); }
const C = [700, 318], R = 168, VMAX = 4;
const angDe = (v) => ((135 + (v / VMAX) * 270) * Math.PI) / 180;

const CACHE = cacheTexto();
/** La esfera del medidor (fija): se pinta una vez por récord. */
function esfera() {
  const rec = datos.top[0] ? Math.min(VMAX, datos.top[0].valor) : 0;
  if (CACHE.has(rec)) return CACHE.get(rec);
  const S = (R + 22) * 2, c = lienzoNuevo(S, S), g = c.getContext("2d");
  g.translate(S / 2, S / 2);
  // bisel cromado
  const gb = g.createLinearGradient(-R, -R, R, R);
  gb.addColorStop(0, "#f2f4f7"); gb.addColorStop(0.35, "#8c939e"); gb.addColorStop(0.6, "#e6e9ee"); gb.addColorStop(1, "#4a4f58");
  g.fillStyle = gb; g.beginPath(); g.arc(0, 0, R + 18, 0, 6.283); g.fill();
  g.fillStyle = "#24272d"; g.beginPath(); g.arc(0, 0, R + 4, 0, 6.283); g.fill();
  // fondo de la esfera
  const gf = g.createRadialGradient(0, -R * 0.3, R * 0.1, 0, 0, R);
  gf.addColorStop(0, "#fffdf2"); gf.addColorStop(1, "#e6dfc8");
  g.fillStyle = gf; g.beginPath(); g.arc(0, 0, R, 0, 6.283); g.fill();
  // zonas de color
  const zonas = [[0, 1, "#2bd45b"], [1, 2, "#ffc21f"], [2, 3, "#ff8a1f"], [3, 4, "#ff3d3d"]];
  g.lineWidth = 20;
  for (const [a, b, col] of zonas) { g.strokeStyle = col; g.beginPath(); g.arc(0, 0, R - 24, angDe(a), angDe(b)); g.stroke(); }
  // rayitas y números
  for (let i = 0; i <= 40; i++) {
    const v = i / 10, a = angDe(v), larga = i % 10 === 0;
    const r0 = R - (larga ? 46 : 38), r1 = R - 14;
    g.strokeStyle = "#1c1c1c"; g.lineWidth = larga ? 3.5 : 1.6;
    g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); g.stroke();
    if (larga) txt(g, String(i / 10), Math.cos(a) * (R - 68), Math.sin(a) * (R - 68) + 11, { tam: 32, peso: 900, fam: FD, color: "#1c1c1c" });
  }
  // marca del récord del bar
  if (rec > 0) {
    const a = angDe(rec);
    g.save(); g.rotate(a);
    g.strokeStyle = "#6e4600"; g.lineWidth = 7; g.beginPath(); g.moveTo(R - 40, 0); g.lineTo(R - 4, 0); g.stroke();
    g.strokeStyle = "#ffd34d"; g.lineWidth = 4; g.stroke();
    g.fillStyle = "#ffd34d"; g.strokeStyle = "#6e4600"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(R - 6, 0); g.lineTo(R + 14, -10); g.lineTo(R + 14, 10); g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  txt(g, "g/L", 0, -R * 0.2, { tam: 34, peso: 900, fam: FD, color: "#1c1c1c", esp: 2 });
  txt(g, "SOPLÓMETRO", 0, -R * 0.2 + 22, { tam: 13, peso: 800, color: "#7a705c", esp: 3 });
  CACHE.clear(); CACHE.set(rec, c);
  return c;
}

class EscenaMedidor extends Escena {
  constructor() {
    super(9.2);
    this.p = new Parts(320);
    this.X = 238; this.ESC = 1.5;
    this.ang = angDe(0); this.w = 0; this.v = 0;
    this.aguja = null; this.tope = true; this.soplos = [];
    this.grietas = null; this.sudor = [];
  }
  luz() { const t = this.t; const on = t < 0.55 ? [0, 1, 0, 0.5, 1, 0.7][Math.min(5, Math.floor(t / 0.09))] : 1; return on * (1 - tramo(t, 8.0, 8.8)); }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let sx = 1, sy = 1, dx = 0, manoI = [9, 160];
    // coge aire (ojos cerrados, pecho hinchado) y sopla (boca en O)
    const kAire = eInOut(tramo(t, 1.15, 1.75)) * (1 - eInOut(tramo(t, 1.9, 3.9)));
    sx += 0.08 * kAire; sy += 0.025 * kAire; pose.rc = -0.08 * kAire;
    if (t > 1.15 && t < 1.85) pose.cara = "dormido";
    if (t >= 1.85 && t < 5.25) {
      pose.cara = "sorpresa";
      const f = tramo(t, 1.9, 4.2);
      dx = azar(-1, 1) * (0.5 + 3 * f) * (t < 4.8 ? 1 : 0);
      pose.rc += 0.025 * Math.sin(t * 37) * f;
      manoI = [-3 - 4 * f, 140 + 4 * Math.sin(t * 20)];
    }
    // se agacha cuando pasa la aguja volando
    const kAg = eOut(tramo(t, 5.12, 5.3)) * (1 - eInOut(tramo(t, 5.75, 6.1)));
    sy *= 1 - 0.22 * kAg; sx *= 1 + 0.06 * kAg;
    if (kAg > 0.05) { manoI = mezcla(manoI, [24, 16], kAg); pose.brazoIDelante = true; }
    // ¡toma ya! se encoge de hombros, chulito
    if (t >= 5.12 && t < 6.1) pose.cara = "sorpresa";
    if (t >= 6.1) {
      const k = eInOut(tramo(t, 6.1, 6.45));
      manoI = mezcla([9, 160], [-24, 106], k);
      pose.cara = t < 7.0 ? "risa" : t < 7.45 ? "sorpresa" : "guino";
      pose.rc = t < 7.0 ? 0.08 * Math.sin(t * 3) : t < 7.45 ? -0.14 : 0.06;
      if (t > 7.0 && t < 7.45) manoI = mezcla([-24, 106], [9, 160], eOut(tramo(t, 7.0, 7.12)));
      else if (t >= 7.45) manoI = mezcla([9, 160], [-24, 106], eInOut(tramo(t, 7.45, 7.7)));
    }
    // la boquilla: del pecho a la boca, y de vuelta
    const kBoca = eInOut(tramo(t, 0.55, 0.95)) * (1 - eInOut(tramo(t, 4.95, 5.2)));
    const b = boca(pose.rc);
    let manoD = mezcla([62, 120], [b[0] + 13, b[1] + 13], kBoca);
    if (t >= 6.1) manoD = mezcla([62, 120], [100, 104], eInOut(tramo(t, 6.1, 6.45)));
    const pieza = mezcla([manoD[0] + 2, manoD[1] - 6], [b[0] + 6, b[1] + 5], kBoca);
    const angP = lerp(-0.9, 0.62, kBoca);
    pose.manoD = manoD; pose.manoI = manoI;
    pose.objD2 = (g) => {
      g.save(); g.translate(pieza[0], pieza[1]); g.rotate(angP);
      const gr = g.createLinearGradient(0, -3.4, 0, 3.4);
      gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#d9e4ea"); gr.addColorStop(1, "#98a6b0");
      rectR(g, -7, -3.2, 14, 6.4, 2); g.fillStyle = gr; g.fill();
      g.fillStyle = "#2bff5b"; g.fillRect(3, -3.4, 2.2, 6.8);
      g.restore();
    };
    const fin = [pieza[0] + Math.cos(angP) * 7, pieza[1] + Math.sin(angP) * 7];
    const m = matAv(this.X + dx, PIES, this.ESC, 0, sx, sy);
    return { pose, m, fin: aPant(m, fin) };
  }
  /** Punto del tubo (0 = boquilla, 1 = medidor). */
  tubo(u, P0) {
    const P1 = [P0[0] + 70, P0[1] + 300], P2 = [C[0] - 150, PIES + 40], P3 = [C[0] - 14, C[1] + R + 30];
    const a = 1 - u;
    return [a * a * a * P0[0] + 3 * a * a * u * P1[0] + 3 * a * u * u * P2[0] + u * u * u * P3[0], a * a * a * P0[1] + 3 * a * a * u * P1[1] + 3 * a * u * u * P2[1] + u * u * u * P3[1]];
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // los soplidos: un bulto que viaja por el tubo
    if (t > 1.95 && t < 4.6 && (!this.soplos.length || t - this.soplos[this.soplos.length - 1] > 0.3)) this.soplos.push(t);
    // la aguja
    if (t < 1.95) this.v = 0.03 * Math.sin(t * 9) * tramo(t, 0.4, 0.7);
    else if (t < 3.85) { const f = tramo(t, 2.05, 3.85); this.v = VMAX * Math.pow(f, 1.25) + 0.08 * Math.sin(t * 31) * f; }
    if (t < 4.3) { this.v = Math.min(this.v, VMAX); if (t >= 3.85) this.v = VMAX - 0.06 * Math.abs(Math.sin(t * 40)); this.ang = angDe(this.v) + (t >= 3.85 ? 0.05 * tramo(t, 3.85, 4.3) : 0); }
    const rec = datos.top[0] ? datos.top[0].valor : 99;
    if (this.tRec == null && this.v >= rec) { this.tRec = t; const q = this.puntoRec(); for (let i = 0; i < 14; i++) p.nueva(P.PURPURINA, q[0] + azar(-50, 50), q[1] + azar(-20, 20), 0, azar(-40, 20), azar(0.6, 1), azar(8, 14)); }
    this.una("tope", t > 3.85, () => temblar(10, 0.3));
    this.una("rompe", t > 4.3, () => {
      this.tope = false; this.w = 4; temblar(16, 0.4);
      const q = [C[0] + Math.cos(angDe(VMAX)) * (R - 18), C[1] + Math.sin(angDe(VMAX)) * (R - 18)];
      for (let i = 0; i < 20; i++) { const a = azar(0, 6.283), v = azar(150, 450); p.nueva(P.CHISPA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(8, 12)); }
      this.grietas = [];
      for (let i = 0; i < 7; i++) {
        let x = C[0] + azar(-40, 40), y = C[1] + azar(-60, 30); const pts = [[x, y]], a = azar(0, 6.283);
        for (let k = 0; k < 5; k++) { x += Math.cos(a + azar(-0.6, 0.6)) * azar(18, 34); y += Math.sin(a + azar(-0.6, 0.6)) * azar(18, 34); pts.push([x, y]); }
        this.grietas.push(pts);
      }
    });
    if (t >= 4.3 && !this.aguja) {
      this.w = Math.min(46, this.w + dt * 70);
      this.ang += this.w * dt;
      if (Math.random() < 30 * dt) p.nueva(P.CHISPA, C[0] + azar(-10, 10), C[1] + azar(-10, 10), azar(-300, 300), azar(-350, 50), azar(0.2, 0.5), azar(6, 10));
      temblar(3 + this.w * 0.12, 0.1);
    }
    // ¡sale volando!
    this.una("vuela", t > 5.15, () => { this.aguja = { x: C[0], y: C[1], vx: -1650, vy: -330, r: this.ang, vr: 40 }; temblar(14, 0.3); });
    if (this.aguja) { const A = this.aguja; A.x += A.vx * dt; A.y += A.vy * dt; A.r += A.vr * dt; }
    if (this.aguja && t < 8.4 && Math.random() < 14 * dt) p.nueva(P.HUMO, C[0] + azar(-14, 14), C[1] + azar(-8, 8), azar(-20, 20), azar(-90, -50), azar(1.2, 1.9), azar(30, 50));
    if (t > 4.4 && t < 5.15 && Math.random() < 10 * dt) p.nueva(P.HUMO, C[0], C[1], azar(-30, 30), azar(-80, -40), 1.2, 30);
    // gotas de sudor al soplar fuerte
    if (t > 3.0 && t < 4.9 && Math.random() < 6 * dt) {
      const q = aPant(this.estado().m, [Math.random() < 0.5 ? 8 : 70, 26]);
      this.sudor.push({ x: q[0], y: q[1], vx: (q[0] < this.X ? -1 : 1) * azar(60, 140), vy: azar(-260, -140), v: 0.7, s: azar(4, 6) });
    }
    for (const s of this.sudor) { s.v -= dt; s.vy += 1100 * dt; s.x += s.vx * dt; s.y += s.vy * dt; }
    this.sudor = this.sudor.filter((s) => s.v > 0);
    this.una("titulo", t > 5.6, () => temblar(18, 0.45));
    // la aguja vuelve del cielo y se clava en el suelo
    this.una("clava", t > 7.0, () => {
      temblar(12, 0.3);
      for (let i = 0; i < 16; i++) p.nueva(P.POLVO, 118 + azar(-10, 10), PIES - 4, azar(-260, 260), azar(-80, -10), azar(0.5, 0.9), azar(24, 40));
    });
    p.actualizar(dt);
  }
  puntoRec() { const v = datos.top[0] ? Math.min(VMAX, datos.top[0].valor) : 0, a = angDe(v); return [C[0] + Math.cos(a) * (R + 98), C[1] + Math.sin(a) * (R + 52)]; }
  dibujarAguja(g, x, y, ang, s = 1) {
    g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
    g.fillStyle = "#d81f1f"; g.beginPath(); g.moveTo(-26, -6); g.lineTo(R - 30, -1.6); g.lineTo(R - 22, 0); g.lineTo(R - 30, 1.6); g.lineTo(-26, 6); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(-20, -3, R - 60, 1.4);
    g.fillStyle = "#2a2d33"; g.beginPath(); g.arc(0, 0, 13, 0, 6.283); g.fill();
    g.fillStyle = "#8c939e"; g.beginPath(); g.arc(-3, -3, 4, 0, 6.283); g.fill();
    g.restore();
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), a = this.luz();
    fondo(g, "#000");
    foco(g, C[0], C[0] - 40, PIES, 260, 0.75 * a);
    foco(g, this.X, this.X, PIES, 150, 0.55 * a);
    g.save(); g.globalAlpha = a;
    // pie del medidor
    const gp = g.createLinearGradient(C[0] - 12, 0, C[0] + 12, 0);
    gp.addColorStop(0, "#2a2d33"); gp.addColorStop(0.5, "#7a818c"); gp.addColorStop(1, "#202227");
    g.fillStyle = gp; g.fillRect(C[0] - 11, C[1] + R, 22, PIES - C[1] - R);
    g.fillStyle = "#3a3f48"; g.beginPath(); g.ellipse(C[0], PIES - 6, 80, 12, 0, 0, 6.283); g.fill();
    // esfera
    const temb = t > 3.85 && t < 5.4 ? azar(-1, 1) * (t > 4.3 ? 4 : 2) : 0;
    const es = esfera();
    g.save(); g.translate(C[0] + temb, C[1] + temb * 0.5);
    g.drawImage(es, -es.width / 2, -es.height / 2);
    // pasador del tope
    const at = angDe(VMAX) + 0.09;
    if (this.tope) { g.fillStyle = "#30343b"; g.beginPath(); g.arc(Math.cos(at) * (R - 40), Math.sin(at) * (R - 40), 6, 0, 6.283); g.fill(); }
    // lectura digital
    const err = t > 4.3;
    rectR(g, -52, R * 0.3, 104, 40, 8); g.fillStyle = "#0b1a0f"; g.fill();
    const lect = err ? (Math.sin(t * 18) > 0 ? "ERROR" : "") : `${fmt(Math.max(0, this.v))}`;
    txt(g, lect, 0, R * 0.3 + 31, { tam: 30, peso: 900, fam: FD, color: err ? "#ff4040" : "#2bff5b", glow: err ? "rgba(255,40,40,.8)" : "rgba(43,255,91,.7)", glowTam: 10, esp: 2 });
    g.restore();
    // aguja (o su borrón cuando gira como un ventilador)
    if (!this.aguja) {
      if (this.w > 15) {
        g.save(); g.globalAlpha = a * clamp((this.w - 15) / 25, 0, 0.55); g.fillStyle = "#d81f1f";
        g.beginPath(); g.arc(C[0] + temb, C[1], R - 24, 0, 6.283); g.fill(); g.restore();
        for (let i = 1; i <= 3; i++) { g.save(); g.globalAlpha = 0.3; this.dibujarAguja(g, C[0] + temb, C[1], this.ang - i * 0.35); g.restore(); }
      }
      this.dibujarAguja(g, C[0] + temb, C[1], this.ang);
    } else {
      g.fillStyle = "#2a2d33"; g.beginPath(); g.arc(C[0], C[1], 9, 0, 6.283); g.fill();
    }
    // etiqueta del récord del bar
    if (datos.top[0]) {
      const q = this.puntoRec(), kR = this.tRec != null ? tramo(t, this.tRec, this.tRec + 0.15) * (1 - tramo(t, this.tRec + 0.9, this.tRec + 1.3)) : 0;
      g.save(); g.translate(q[0], q[1]); g.scale(1 + 0.35 * kR, 1 + 0.35 * kR); g.rotate(-0.06);
      txt(g, kR > 0 ? "¡RÉCORD!" : "RÉCORD", 0, 0, { tam: 24, peso: 900, fam: FD, color: "#ffd34d", esp: 2, glow: kR > 0 ? "rgba(255,211,77,.9)" : null, glowTam: 14 });
      txt(g, `${fmt(datos.top[0].valor)} ${datos.unidad}`, 0, 22, { tam: 17, peso: 800, color: "#ffe9a6", esp: 1 });
      g.restore();
    }
    // grietas del cristal
    if (this.grietas) {
      g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = 2; g.lineJoin = "round";
      for (const pts of this.grietas) { g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.stroke(); }
    }
    // reflejo del cristal
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.16;
    g.fillStyle = "#fff"; g.beginPath(); g.ellipse(C[0] - 60, C[1] - 85, 85, 40, -0.6, 0, 6.283); g.fill(); g.restore();
    g.restore();
    // el tubo, con los soplidos viajando
    const P0 = e.fin;
    g.save(); g.globalAlpha = a; g.lineCap = "round";
    const N = 40, pts = [];
    for (let i = 0; i <= N; i++) pts.push(this.tubo(i / N, P0));
    g.strokeStyle = "#1e2a2e"; g.lineWidth = 16; g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.stroke();
    g.strokeStyle = "#5fa6b8"; g.lineWidth = 11; g.stroke();
    g.strokeStyle = "rgba(220,250,255,.55)"; g.lineWidth = 3; g.stroke();
    for (const s of this.soplos) {
      const u = (t - s) / 0.55;
      if (u < 0 || u > 1) continue;
      const q = this.tubo(u, P0);
      g.fillStyle = "#5fa6b8"; g.strokeStyle = "#1e2a2e"; g.lineWidth = 3;
      g.beginPath(); g.arc(q[0], q[1], 13, 0, 6.283); g.fill(); g.stroke();
      g.fillStyle = "rgba(230,252,255,.7)"; g.beginPath(); g.arc(q[0] - 4, q[1] - 4, 4, 0, 6.283); g.fill();
    }
    g.restore();
    pintarAvatar(g, e.m, e.pose, t);
    this.p.alfa = a; this.p.dibujar(g);
    for (const s of this.sudor) {
      g.save(); g.translate(s.x, s.y); g.rotate(Math.atan2(s.vy, s.vx) - Math.PI / 2); g.globalAlpha = a * Math.min(1, s.v * 3);
      g.fillStyle = "#bfe9ff"; g.beginPath(); g.moveTo(0, -s.s * 1.8); g.quadraticCurveTo(s.s, 0, 0, s.s); g.quadraticCurveTo(-s.s, 0, 0, -s.s * 1.8); g.fill();
      g.fillStyle = "rgba(255,255,255,.8)"; g.beginPath(); g.arc(-s.s * 0.3, 0, s.s * 0.25, 0, 6.283); g.fill();
      g.restore();
    }
    // la aguja volando
    if (this.aguja && this.aguja.x > -300) {
      const A = this.aguja;
      g.save(); g.globalCompositeOperation = "lighter"; g.strokeStyle = "rgba(255,120,120,.4)"; g.lineWidth = 3;
      for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(A.x + 40, A.y - 12 + i * 8); g.lineTo(A.x + 200, A.y + 30 - 12 + i * 8); g.stroke(); }
      g.restore();
      this.dibujarAguja(g, A.x, A.y, A.r, 0.8);
    }
    // la aguja clavada en el suelo
    if (t > 6.7) {
      const u = tramo(t, 6.7, 7.0), d = Math.max(0, t - 7.0);
      const ang = Math.PI / 2 - 0.3 + 0.35 * Math.sin(d * 22) * Math.exp(-d * 5), L = (R - 22) * 0.8;
      const tip = [118, lerp(-260, PIES + 8, eIn(u))];
      this.dibujarAguja(g, tip[0] - Math.cos(ang) * L, tip[1] - Math.sin(ang) * L, ang, 0.8);
    }
    // ¡FUERA DE ESCALA!
    if (t > 5.6) {
      const k = tramo(t, 5.6, 5.75), s = lerp(2.6, 1, eIn(k));
      g.save(); g.translate(W / 2 + 40, 100); g.rotate(-0.03); g.scale(s, s);
      g.globalAlpha = Math.min(1, k * 4) * a;
      ponerRotulo(g, rotulo("¡FUERA DE ESCALA!", { tam: 96, peso: 900, fam: FD, borde: "#2a0006", bordeAncho: 10, esp: 2, glow: "rgba(255,60,40,.6)", glowTam: 20, max: 900 }, (c) => {
        const gr = c.createLinearGradient(0, -80, 0, 0);
        gr.addColorStop(0, "#fff3f0"); gr.addColorStop(0.55, "#ff6a4a"); gr.addColorStop(1, "#c4001e");
        return gr;
      }));
      g.restore();
    }
    if (t < 0.55 && a < 1) { g.fillStyle = `rgba(0,0,0,${1 - a})`; g.fillRect(-60, -60, W + 120, H + 120); }
    if (t > 8.0) { g.fillStyle = `rgba(0,0,0,${tramo(t, 8.0, 8.8)})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00052", nombre: "El medidor loco", crear: () => new EscenaMedidor() });
})();
