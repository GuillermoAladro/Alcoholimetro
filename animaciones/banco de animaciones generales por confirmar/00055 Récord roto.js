"use strict";
/*
 * 00055 · RÉCORD ROTO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se enciende un cartel de cristal colgado con cadenas: RÉCORD y el récord real del bar. Entra con una jarra, lo mira
 * impresionado y le da un toquecito (tink). Se agrieta… y estalla a cámara lenta en mil pedazos con el récord dentro.
 * Los trozos caen al suelo, ¡RÉCORD ROTO!, y él se encoge de hombros y brinda con un trago.
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
const SX = 452, SY = 150, SW = 410, SH = 236;   // el cartel (pantalla)
const CACHE = cacheTexto();
/** El cristal con el récord, pintado una vez (por valor del récord). */
function cartel() {
  const r = datos.top[0], clave = r ? r.valor : -1;
  if (CACHE.has(clave)) return CACHE.get(clave);
  const c = lienzoNuevo(SW, SH), g = c.getContext("2d");
  rectR(g, 2, 2, SW - 4, SH - 4, 16);
  const gr = g.createLinearGradient(0, 0, SW, SH);
  gr.addColorStop(0, "rgba(200,235,255,.30)"); gr.addColorStop(0.5, "rgba(120,180,220,.16)"); gr.addColorStop(1, "rgba(200,235,255,.26)");
  g.fillStyle = gr; g.fill();
  g.strokeStyle = "rgba(235,250,255,.85)"; g.lineWidth = 4; g.stroke();
  rectR(g, 12, 12, SW - 24, SH - 24, 10); g.strokeStyle = "rgba(235,250,255,.25)"; g.lineWidth = 2; g.stroke();
  // reflejos diagonales
  g.save(); rectR(g, 2, 2, SW - 4, SH - 4, 16); g.clip();
  g.fillStyle = "rgba(255,255,255,.13)";
  for (const [x, w] of [[40, 50], [110, 16], [300, 34]]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + w, 0); g.lineTo(x + w - 120, SH); g.lineTo(x - 120, SH); g.fill(); }
  g.restore();
  const go = g.createLinearGradient(0, 30, 0, 92);
  go.addColorStop(0, "#fff6c2"); go.addColorStop(1, "#ffb21a");
  txt(g, "RÉCORD", SW / 2, 92, { tam: 72, peso: 900, fam: FD, color: go, borde: "#3a2200", bordeAncho: 7, esp: 8 });
  txt(g, r ? `${fmt(r.valor)} ${datos.unidad}` : "¿?", SW / 2, 196, { tam: 104, peso: 900, fam: FD, color: "#d8ffe0", glow: "#2bff5b", glowTam: 22, esp: 2, max: SW - 40 });
  CACHE.clear(); CACHE.set(clave, c);
  return c;
}

class EscenaRecordRoto extends Escena {
  constructor() {
    super(9.8);
    this.p = new Parts(260);
    this.X = 318; this.ESC = 1.55; this.fase = 0;
    this.trozos = null; this.ts = 0; // tiempo de la física de los trozos (va a cámara lenta)
    this.IMP = [486, 352];           // donde toca la jarra
    this.grietas = this.hacerGrietas();
  }
  hacerGrietas() {
    const r = semilla(55), g = [];
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * 6.283 + r() * 0.5, pts = [[this.IMP[0], this.IMP[1]]];
      let x = this.IMP[0], y = this.IMP[1];
      for (let k = 0; k < 7; k++) { x += Math.cos(a + (r() - 0.5) * 0.7) * (22 + r() * 30); y += Math.sin(a + (r() - 0.5) * 0.7) * (16 + r() * 22); pts.push([clamp(x, SX, SX + SW), clamp(y, SY, SY + SH)]); }
      g.push(pts);
    }
    return g;
  }
  romper() {
    const r = semilla(9), C = 5, F = 4, P0 = [];
    for (let j = 0; j <= F; j++) for (let i = 0; i <= C; i++) {
      const borde = i === 0 || j === 0 || i === C || j === F;
      P0.push([SX + (SW * i) / C + (borde ? 0 : (r() - 0.5) * 50), SY + (SH * j) / F + (borde ? 0 : (r() - 0.5) * 36)]);
    }
    const pt = (i, j) => P0[j * (C + 1) + i], tr = [];
    for (let j = 0; j < F; j++) for (let i = 0; i < C; i++) {
      const a = pt(i, j), b = pt(i + 1, j), c = pt(i + 1, j + 1), d = pt(i, j + 1);
      const tris = r() < 0.5 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];
      for (const poly of tris) {
        const cx = (poly[0][0] + poly[1][0] + poly[2][0]) / 3, cy = (poly[0][1] + poly[1][1] + poly[2][1]) / 3;
        const dx = cx - this.IMP[0], dy = cy - this.IMP[1], L = Math.hypot(dx, dy) || 1, v = 260 + 520 * Math.exp(-L / 260);
        // cada trozo se pinta una vez en su propio lienzo (así no hay que recortar en cada cuadro)
        const bx = Math.floor(Math.min(poly[0][0], poly[1][0], poly[2][0])) - 2, by = Math.floor(Math.min(poly[0][1], poly[1][1], poly[2][1])) - 2;
        const bw = Math.ceil(Math.max(poly[0][0], poly[1][0], poly[2][0])) + 2 - bx, bh = Math.ceil(Math.max(poly[0][1], poly[1][1], poly[2][1])) + 2 - by;
        const spr = lienzoNuevo(bw, bh), sg = spr.getContext("2d");
        sg.translate(-bx, -by);
        sg.beginPath(); sg.moveTo(poly[0][0], poly[0][1]); sg.lineTo(poly[1][0], poly[1][1]); sg.lineTo(poly[2][0], poly[2][1]); sg.closePath();
        sg.save(); sg.clip(); sg.drawImage(cartel(), SX, SY); sg.restore();
        sg.strokeStyle = "rgba(230,250,255,.6)"; sg.lineWidth = 1.6; sg.stroke();
        tr.push({ spr, ox: bx - cx, oy: by - cy, cx, cy, x: cx, y: cy, vx: (dx / L) * v + azar(-60, 60), vy: (dy / L) * v * 0.7 - azar(120, 300), r: 0, vr: azar(-7, 7), suelo: false });
      }
    }
    this.trozos = tr;
  }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [70, 156], manoI = [9, 160], x = this.X, bote = 0, giro = 0, inc = 0.1 * Math.sin(t * 4), nivel = 1;
    if (t < 1.55) {
      x = lerp(-110, this.X, eOut(tramo(t, 0.35, 1.55)));
      const a = andar(this.fase, 0.9 * (1 - tramo(t, 1.3, 1.55))); pose.piernaI = a.piernaI; pose.piernaD = a.piernaD; bote = a.bote;
    }
    // mira el cartel: ¡ooh! y luego una idea pícara
    if (t > 1.6 && t < 2.45) { pose.cara = "sorpresa"; pose.rc = 0.12 * eInOut(tramo(t, 1.6, 1.85)); }
    if (t >= 2.45 && t < 3.0) { pose.cara = "guino"; pose.rc = 0.1; }
    // toquecito con la jarra
    const kSube = eInOut(tramo(t, 2.5, 2.88)), kToc = Math.sin(Math.PI * tramo(t, 2.88, 3.12));
    if (t > 2.5 && t < 3.75) { manoD = mezcla(manoD, [112, 104], kSube); manoD[0] += 6 * kToc; inc = -0.08; }
    // se agrieta: se queda helado
    if (t >= 3.0 && t < 3.75) { pose.cara = t < 3.25 ? "guino" : "sorpresa"; pose.rc = 0.06 + 0.02 * Math.sin(t * 40) * tramo(t, 3.3, 3.75); }
    // estalla a cámara lenta: se protege
    if (t >= 3.75 && t < 5.9) {
      const k = eOut(tramo(t, 3.75, 4.6));
      pose.cara = "sorpresa"; giro = -0.07 * k; pose.rc = -0.1 * k;
      manoD = mezcla([112, 104], [100, 70], k); inc = -0.08 - 0.25 * k;
      manoI = mezcla([9, 160], [-16, 50], k);
    }
    // ups… se encoge de hombros y brinda con un trago
    if (t >= 5.9) {
      const kV = eInOut(tramo(t, 5.9, 6.25));
      manoI = mezcla([-16, 50], [-22, 108], kV);
      pose.cara = t < 6.6 ? "risa" : "sonrisa";
      const kSubeB = tramo(t, 6.6, 6.95), kTrago = tramo(t, 6.95, 7.9), kBaja = tramo(t, 7.95, 8.3);
      const kB = eInOut(kSubeB) * (1 - eInOut(kBaja));
      pose.rc = -0.32 * eInOut(kTrago) * (1 - eInOut(kBaja)) + (kTrago > 0 && kTrago < 1 ? 0.025 * Math.sin(t * 38) : 0);
      inc = (-0.4 * eInOut(kSubeB) - 1.25 * eInOut(kTrago)) * (1 - eInOut(kBaja));
      const b = boca(pose.rc), r = rot2(JARRA.borde, inc), obj = [b[0] - r[0], b[1] - r[1]];
      manoD = mezcla(mezcla([100, 70], [74, 150], kV), obj, kB);
      if (kB > 0) manoD[0] += Math.sin(kB * Math.PI) * 22;
      nivel = 1 - kTrago;
      if (kTrago > 0 && kTrago < 1) pose.cara = "dormido";
      if (t > 8.3) { pose.cara = "guino"; manoI = mezcla([-22, 108], [9, 160], eInOut(tramo(t, 8.3, 8.6))); }
    }
    pose.manoD = manoD; pose.manoI = manoI;
    pose.jarra = { inc, nivel };
    const m = matAv(x, PIES + bote, this.ESC, giro);
    return { pose, m };
  }
  luz() { const t = this.t; const on = t < 0.55 ? [0, 1, 0, 0.45, 1, 0.7][Math.min(5, Math.floor(t / 0.09))] : 1; return on * (1 - tramo(t, 8.9, 9.6)); }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    if (t < 1.55) this.fase += dt * 9;
    this.una("tink", t > 3.0, () => { p.nueva(P.DESTELLO, this.IMP[0], this.IMP[1], 0, 0, 0.3, 70); temblar(3, 0.15); });
    this.una("rompe", t > 3.75, () => {
      this.romper(); temblar(10, 0.4);
      for (let i = 0; i < 24; i++) p.nueva(P.DESTELLO, SX + azar(0, SW), SY + azar(0, SH), 0, 0, azar(0.6, 1.2), azar(20, 50));
    });
    // cámara lenta y vuelta a la normalidad
    const lento = t < 5.35 ? 0.13 : t < 5.6 ? lerp(0.13, 1, tramo(t, 5.35, 5.6)) : 1;
    this.una("normal", t > 5.4, () => temblar(14, 0.4));
    if (this.trozos) {
      const d = dt * lento;
      for (const s of this.trozos) {
        if (s.suelo) { s.vx *= 1 - 6 * dt; s.x += s.vx * dt; continue; }
        s.vy += 1500 * d; s.x += s.vx * d; s.y += s.vy * d; s.r += s.vr * d;
        if (s.y > PIES - 6) {
          s.y = PIES - 6; s.vy *= -0.3; s.vx *= 0.55; s.vr *= 0.4;
          if (Math.abs(s.vy) < 90) { s.suelo = true; s.r = Math.round(s.r / Math.PI) * Math.PI + (s.r % 0.2); }
          for (let i = 0; i < 2; i++) p.nueva(P.CHISPA, s.x, PIES - 8, azar(-200, 200), azar(-260, -80), azar(0.2, 0.4), azar(5, 9));
        }
      }
    }
    p.alfa = this.luz();
    p.actualizar(dt * (this.trozos ? lento : 1));
  }
  dibujarTrozos(g) {
    for (const s of this.trozos) {
      g.save();
      g.translate(s.x, s.y); g.rotate(s.r); if (s.suelo) g.scale(1, 0.35);
      g.drawImage(s.spr, s.ox, s.oy);
      g.restore();
    }
  }
  dibujar(g) {
    const t = this.t, e = this.estado(), a = this.luz();
    fondo(g, "#000");
    foco(g, SX + SW / 2, SX + SW / 2, PIES, 240, 0.7 * a);
    foco(g, this.X, this.X, PIES, 140, 0.35 * a * tramo(t, 0.9, 1.4));
    g.save(); g.globalAlpha = a;
    // cadenas y barra de arriba (se quedan colgando)
    const balanceo = this.trozos ? 0.06 * Math.sin((t - 3.75) * 5) * Math.exp(-(t - 3.75) * 0.8) : 0;
    g.save(); g.translate(SX + SW / 2, -10); g.rotate(balanceo); g.translate(-(SX + SW / 2), 10);
    g.strokeStyle = "#8c939e"; g.lineWidth = 3;
    for (const cx of [SX + 50, SX + SW - 50]) {
      for (let y = -10; y < SY - 10; y += 14) { g.beginPath(); g.ellipse(cx, y + 7, 4, 7, 0, 0, 6.283); g.stroke(); }
    }
    const gb = g.createLinearGradient(0, SY - 14, 0, SY);
    gb.addColorStop(0, "#d9dde3"); gb.addColorStop(1, "#5a606a");
    g.fillStyle = gb; rectR(g, SX - 6, SY - 14, SW + 12, 14, 5); g.fill();
    g.restore();
    const img = cartel();
    if (!this.trozos) {
      g.drawImage(img, SX, SY);
      // brillo que barre el cristal
      const u = tramo(t, 0.9, 1.6);
      if (u > 0 && u < 1) {
        g.save(); rectR(g, SX, SY, SW, SH, 16); g.clip(); g.globalCompositeOperation = "lighter";
        const x = SX - 100 + u * (SW + 200); g.fillStyle = "rgba(255,255,255,.35)";
        g.beginPath(); g.moveTo(x, SY); g.lineTo(x + 40, SY); g.lineTo(x - 60, SY + SH); g.lineTo(x - 100, SY + SH); g.fill(); g.restore();
      }
      // grietas que crecen desde el toque
      const kg = tramo(t, 3.02, 3.7);
      if (kg > 0) {
        g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 2; g.lineJoin = "round";
        for (const pts of this.grietas) {
          const n = 1 + Math.floor(kg * (pts.length - 1));
          g.beginPath(); for (let i = 0; i < n; i++) (i ? g.lineTo(pts[i][0], pts[i][1]) : g.moveTo(pts[i][0], pts[i][1])); g.stroke();
        }
      }
    }
    g.restore();
    pintarAvatar(g, e.m, e.pose, t);
    if (this.trozos) { g.save(); g.globalAlpha = a; this.dibujarTrozos(g); g.restore(); }
    this.p.dibujar(g);
    // tink
    if (t > 3.0 && t < 3.8) {
      const k = tramo(t, 3.0, 3.1);
      txt(g, "tink", this.IMP[0] + 52, this.IMP[1] + 84, { tam: 40, peso: 400, fam: FC, color: "#d6fbff", esp: 2, alfa: Math.min(1, k * 3) * (1 - tramo(t, 3.5, 3.8)) });
      txt(g, "crrrk…", this.IMP[0] + 190, this.IMP[1] + 92, { tam: 30, peso: 400, fam: FC, color: "#bfe9ff", esp: 2, alfa: tramo(t, 3.3, 3.4) * (1 - tramo(t, 3.65, 3.8)) });
    }
    // cámara lenta: barras de cine
    const kCine = tramo(t, 3.75, 3.95) * (1 - tramo(t, 5.35, 5.6));
    if (kCine > 0) {
      g.fillStyle = "#000"; g.fillRect(-60, -60, W + 120, 60 + 44 * kCine); g.fillRect(-60, H - 44 * kCine, W + 120, 104);
      txt(g, "CÁMARA LENTA", W - 30, H - 14, { tam: 18, peso: 800, color: "rgba(255,255,255,.7)", alin: "right", esp: 4, alfa: kCine });
    }
    // ¡RÉCORD ROTO!
    if (t > 4.15) {
      const k = tramo(t, 4.15, 4.32), s = lerp(2.8, 1, eIn(k)) * (t > 5.4 ? 1 + 0.06 * Math.sin(Math.PI * tramo(t, 5.4, 5.6)) : 1);
      g.save(); g.translate(W / 2 + 20, 112); g.rotate(-0.04); g.scale(s, s);
      g.globalAlpha = Math.min(1, k * 4) * a;
      ponerRotulo(g, rotulo("¡RÉCORD ROTO!", { tam: 108, peso: 900, fam: FD, borde: "#062a3a", bordeAncho: 10, esp: 3, glow: "rgba(47,227,232,.7)", glowTam: 22, max: 940 }, (c) => {
        const gr = c.createLinearGradient(0, -90, 0, 0);
        gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#bff3ff"); gr.addColorStop(1, "#2fb8e8");
        return gr;
      }));
      g.restore();
    }
    if (t < 0.55 && a < 1) { g.fillStyle = `rgba(0,0,0,${1 - a})`; g.fillRect(-60, -60, W + 120, H + 120); }
    if (t > 8.9) { g.fillStyle = `rgba(0,0,0,${1 - a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00055", nombre: "Récord roto", crear: () => new EscenaRecordRoto() });
})();
