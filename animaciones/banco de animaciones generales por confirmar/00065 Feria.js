"use strict";
/*
 * 00065 · FERIA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Se abren unas cortinas de lunares: la caseta, el albero y filas de farolillos. Guillermo, con sombrero cordobés y
 * un clavel, baila sevillanas con un vaso de rebujito: brazos arriba, floreo, pasos y una vuelta. En la última
 * vuelta el rebujito sale del vaso en espiral… y vuelve dentro sin perder una gota. ¡OLÉ!, pataleo, lluvia de
 * pétalos. Las cortinas se cierran.
 */
(() => {
const cache = cacheTexto();
const COLORES = [["#e8293b", "#ffffff"], ["#1f9b4e", "#ffffff"], ["#ffd23a", "#e8293b"], ["#ffffff", "#e8293b"], ["#2f7fe0", "#ffffff"]];

/** Farolillo de papel con lunares (lienzo). */
function farolillo(c1, c2) {
  const c = lienzoNuevo(64, 76), g = c.getContext("2d");
  g.translate(32, 40);
  const gr = g.createRadialGradient(-8, -8, 4, 0, 0, 30);
  gr.addColorStop(0, "#fff8e0"); gr.addColorStop(0.35, c1); gr.addColorStop(1, c1);
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 26, 30, 0, 0, 6.283); g.fill();
  g.save(); g.beginPath(); g.ellipse(0, 0, 26, 30, 0, 0, 6.283); g.clip();
  g.fillStyle = c2;
  for (let y = -26; y <= 26; y += 12) for (let x = -26 + ((y / 12) & 1) * 6; x <= 26; x += 12) { g.beginPath(); g.arc(x, y, 3.2, 0, 6.283); g.fill(); }
  g.strokeStyle = "rgba(0,0,0,.18)"; g.lineWidth = 1;
  for (let y = -24; y <= 24; y += 8) { g.beginPath(); g.ellipse(0, y, 26 * Math.sqrt(1 - (y / 30) * (y / 30)), 2, 0, 0, 6.283); g.stroke(); }
  g.restore();
  g.fillStyle = "#3a2a1a"; g.fillRect(-9, -33, 18, 5); g.fillRect(-8, 28, 16, 5);
  return c;
}

/** Sombrero cordobés; (0, 0) = cuello. */
function cordobes(g, rc) {
  g.save(); g.translate(RIG.cuello[0], RIG.cuello[1]); g.rotate(rc - 0.06);
  const gc = g.createLinearGradient(-24, 0, 24, 0); gc.addColorStop(0, "#151515"); gc.addColorStop(0.45, "#3d3d40"); gc.addColorStop(1, "#111");
  g.fillStyle = gc; rectR(g, -22, -84, 44, 20, 2); g.fill();
  g.fillStyle = "#2a2a2c"; g.beginPath(); g.ellipse(0, -84, 22, 3, 0, 0, 6.283); g.fill();
  g.fillStyle = "#5a1218"; g.fillRect(-22, -71, 44, 5);
  const ga = g.createLinearGradient(0, -70, 0, -60); ga.addColorStop(0, "#47474b"); ga.addColorStop(1, "#0d0d0e");
  g.fillStyle = ga; g.beginPath(); g.ellipse(0, -65, 50, 6, 0, 0, 6.283); g.fill();
  g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(-17, -82, 4, 10);
  g.restore();
}

/** Vaso de rebujito; (x, y) = la mano. nivel 0–1. */
function vaso(g, x, y, nivel, t) {
  g.save(); g.translate(x, y - 4);
  const w = 12, h = 30;
  g.fillStyle = "rgba(220,240,255,.25)"; rectR(g, -w / 2, -h, w, h, 2); g.fill();
  if (nivel > 0.02) {
    const a = (h - 3) * nivel;
    const gl = g.createLinearGradient(0, -a, 0, 0); gl.addColorStop(0, "#f6f7c8"); gl.addColorStop(1, "#d9e27a");
    g.fillStyle = gl; g.fillRect(-w / 2 + 1, -a - 1, w - 2, a);
    g.fillStyle = "rgba(255,255,255,.7)"; g.fillRect(-w / 2 + 2, -a + 3, 4, 4); g.fillRect(-w / 2 + 6, -a + 9, 4, 4);
    g.fillStyle = "rgba(255,255,255,.8)";
    for (let i = 0; i < 3; i++) { const by = -2 - ((t * 18 + i * 9) % Math.max(2, a - 2)); g.beginPath(); g.arc(-2 + i * 2.5, by, 0.8, 0, 6.283); g.fill(); }
    // hierbabuena y limón
    g.fillStyle = "#3fae55"; g.beginPath(); g.ellipse(3, -a - 3, 4, 2, -0.6, 0, 6.283); g.fill();
    g.fillStyle = "#ffe14d"; g.beginPath(); g.arc(-3, -a - 1, 4, Math.PI, 0); g.fill();
  }
  g.strokeStyle = "rgba(240,248,255,.9)"; g.lineWidth = 1.1; rectR(g, -w / 2, -h, w, h, 2); g.stroke();
  g.fillStyle = "rgba(255,255,255,.5)"; g.fillRect(-w / 2 + 1.5, -h + 2, 1.4, h - 5);
  g.restore();
}

class EscenaFeria extends Escena {
  constructor() {
    super(9.9);
    this.p = new Parts(420);
    this.p.suelo = () => PIES - 2;
    this.X = W / 2; this.ESC = 1.45;
    this.faroles = COLORES.map(([a, b]) => farolillo(a, b));
    this.fondoC = this.pintarFondo();
    this.cortina = this.pintarCortina();
    this.petalos = [];
  }
  pintarFondo() {
    const c = lienzoNuevo(W, H), g = c.getContext("2d");
    const gc = g.createLinearGradient(0, 0, 0, H); gc.addColorStop(0, "#0b0f2a"); gc.addColorStop(1, "#1f1636");
    g.fillStyle = gc; g.fillRect(0, 0, W, H);
    // lona de la caseta a rayas
    g.save(); g.beginPath(); g.moveTo(0, 170); g.lineTo(W, 170); g.lineTo(W, 470); g.lineTo(0, 470); g.closePath(); g.clip();
    for (let x = 0; x < W; x += 56) { g.fillStyle = (x / 56) % 2 ? "#f4efe6" : "#1f8a48"; g.fillRect(x, 170, 56, 300); }
    const gs = g.createLinearGradient(0, 170, 0, 470); gs.addColorStop(0, "rgba(0,0,0,.15)"); gs.addColorStop(1, "rgba(0,0,0,.55)");
    g.fillStyle = gs; g.fillRect(0, 170, W, 300);
    g.restore();
    // volante festoneado
    for (let x = 0; x < W; x += 56) {
      g.fillStyle = (x / 56) % 2 ? "#ffffff" : "#d6202f";
      g.beginPath(); g.moveTo(x, 160); g.lineTo(x + 56, 160); g.lineTo(x + 56, 184); g.arc(x + 28, 184, 28, 0, Math.PI); g.closePath(); g.fill();
    }
    g.fillStyle = "#b8151f"; g.fillRect(0, 152, W, 10);
    // sillas de enea y mesas a los lados
    for (const x of [110, 900]) {
      g.fillStyle = "#3a2410"; g.fillRect(x - 40, 420, 80, 10); g.fillRect(x - 4, 430, 8, 46);
      g.fillStyle = "#f2efe8"; g.beginPath(); g.ellipse(x, 420, 46, 8, 0, 0, 6.283); g.fill();
      for (const d of [-70, 70]) { g.fillStyle = "#8a4a1a"; g.fillRect(x + d - 14, 400, 4, 76); g.fillRect(x + d + 10, 400, 4, 76); g.fillStyle = "#d9a13a"; g.fillRect(x + d - 14, 438, 28, 8); }
    }
    // albero
    const ga = g.createLinearGradient(0, 470, 0, H); ga.addColorStop(0, "#e2b23e"); ga.addColorStop(1, "#b07a1a");
    g.fillStyle = ga; g.fillRect(0, 470, W, H - 470);
    const r = semilla(13); g.fillStyle = "rgba(120,70,10,.3)";
    for (let i = 0; i < 140; i++) g.fillRect(r() * W, 476 + r() * 124, 2, 2);
    return c;
  }
  pintarCortina() {
    const c = lienzoNuevo(W / 2 + 40, H), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, c.width, 0);
    for (let i = 0; i <= 8; i++) gr.addColorStop(i / 8, i % 2 ? "#a3121e" : "#e2293a");
    g.fillStyle = gr; g.fillRect(0, 0, c.width, H);
    g.fillStyle = "#ffffff";
    for (let y = 10; y < H; y += 46) for (let x = ((y / 46) & 1) * 23 + 8; x < c.width; x += 46) { g.beginPath(); g.arc(x, y, 8, 0, 6.283); g.fill(); }
    g.fillStyle = "rgba(0,0,0,.18)"; for (let x = 0; x < c.width; x += 58) g.fillRect(x, 0, 14, H);
    return c;
  }
  guirnaldas() {
    if (this._gu) return this._gu;
    const c = lienzoNuevo(W + 40, 360), g = c.getContext("2d");
    for (let fila = 0; fila < 3; fila++) {
      g.save(); g.translate(20, fila * 120 + 30);
      const comba = 36, n = 9 + fila;
      g.strokeStyle = "rgba(40,30,20,.9)"; g.lineWidth = 2;
      g.beginPath(); for (let i = 0; i <= 24; i++) { const u = i / 24; const x = -20 + u * (W + 40), y = comba * 4 * u * (1 - u); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) / n, x = -20 + u * (W + 40), y = comba * 4 * u * (1 - u);
        const spr = this.faroles[(i + fila * 2) % this.faroles.length], sc = 0.72 - fila * 0.06;
        g.save(); g.translate(x, y); g.rotate(0.08 * Math.sin(i * 1.7 + fila));
        g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.45; g.drawImage(BLOB.naranja, -40, -20, 80, 80); g.restore();
        g.drawImage(spr, -32 * sc, 0, 64 * sc, 76 * sc);
        g.restore();
      }
      g.restore();
    }
    return (this._gu = c);
  }
  /** Fase del baile: devuelve { sx (giro), dx, salto }. */
  vuelta() {
    const t = this.t;
    if (t > 4.0 && t < 4.8) return Math.cos(2 * Math.PI * eInOut(tramo(t, 4.0, 4.8)));
    if (t > 6.3 && t < 7.25) return Math.cos(4 * Math.PI * eInOut(tramo(t, 6.3, 7.25)));
    return 1;
  }
  nivel() { const t = this.t; return t < 6.45 ? 1 : t < 7.05 ? lerp(1, 0, tramo(t, 6.45, 6.75)) : lerp(0, 1, tramo(t, 6.95, 7.25)); }
  estado() {
    const t = this.t;
    const pose = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0] };
    let manoD = [72, 150], manoI = [6, 150], dx = 0, dy = 0, giro = 0;
    const arriba = eInOut(tramo(t, 1.05, 1.45));
    // floreo: las manos dan vueltecitas encima de la cabeza
    const f = t * 7;
    const fD = [Math.cos(f) * 6, Math.sin(f) * 5], fI = [Math.cos(-f + 1) * 6, Math.sin(-f + 1) * 5];
    manoD = mezcla(manoD, [64 + fD[0], 18 + fD[1]], arriba);
    manoI = mezcla(manoI, [14 + fI[0], 18 + fI[1]], arriba);
    if (t < 1.05) pose.cara = "guino";
    // pasos de sevillanas: a un lado y a otro con saltito
    if (t > 1.45 && t < 8.4) {
      const b = (t - 1.45) / 0.6, n = Math.floor(b), u = b - n, k = Math.sin(Math.PI * u);
      const lado = n % 2 ? 1 : -1;
      dx = 40 * Math.sin((t - 1.45) * Math.PI / 1.2);
      dy = -12 * k;
      if (lado > 0) pose.piernaD = [-10 * k, -0.22 * k]; else pose.piernaI = [-10 * k, 0.22 * k];
      giro = 0.05 * Math.sin((t - 1.45) * Math.PI / 0.6);
      pose.rc = 0.1 * Math.sin((t - 1.45) * Math.PI / 1.2);
      pose.cara = n % 3 === 2 ? "guino" : "risa";
      // a ratos un brazo baja a la cadera
      if (n % 4 === 1) manoI = mezcla(manoI, [-12, 132], k);
      if (n % 4 === 3) manoD = mezcla(manoD, [92, 132], k);
    }
    // ¡OLÉ!: pose final, brazo con el vaso bien alto y pataleo
    if (t >= 7.25) {
      const k = eBack(tramo(t, 7.25, 7.45));
      manoD = mezcla(manoD, [76, 14], k); manoI = mezcla(manoI, [-20, 70], k);
      pose.piernaD = [-14 * (1 - tramo(t, 7.25, 7.4)), -0.3 * (1 - tramo(t, 7.25, 7.4))];
      pose.cara = t < 8.1 ? "risa" : "guino";
      pose.rc = -0.1; giro = -0.04; dx *= 1 - tramo(t, 7.25, 7.6); dy = 0;
    }
    if (this.vuelta() < 0.95 && t > 6.3) pose.cara = "sorpresa";
    pose.manoD = manoD; pose.manoI = manoI;
    const niv = this.nivel();
    const rc = pose.rc;
    pose.objD = (g, m) => { cordobes(g, rc); vaso(g, m[0], m[1] + 2, niv, t); };
    pose.objD2 = (g) => { // clavel en la camisa
      g.save(); g.translate(26, 100);
      for (let i = 0; i < 9; i++) { const a = i * 0.7; g.fillStyle = i % 2 ? "#c4101e" : "#ef2a3a"; g.beginPath(); g.ellipse(Math.cos(a) * 3, Math.sin(a) * 3, 4, 2.5, a, 0, 6.283); g.fill(); }
      g.fillStyle = "#2e8a40"; g.beginPath(); g.ellipse(5, 7, 4, 1.6, 0.8, 0, 6.283); g.fill();
      g.restore();
    };
    let sx = this.vuelta();
    sx = Math.sign(sx || 1) * Math.max(0.28, Math.abs(sx));
    const m = matAv(this.X + dx, PIES + dy, this.ESC, giro, sx, 1);
    return { pose, m, sx, dx };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    const e = this.estado();
    if (t > 1.45 && t < 7.2) {
      const b = (t - 1.45) / 0.6, n = Math.floor(b);
      this.una("paso" + n, b - n > 0.92, () => { for (let i = 0; i < 6; i++) p.nueva(P.POLVO, this.X + e.dx + azar(-40, 40), PIES - 4, azar(-120, 120), azar(-40, -5), azar(0.4, 0.7), azar(14, 22)); });
    }
    this.una("vuelta1", t > 4.0, () => temblar(3, 0.15));
    this.una("ole", t > 7.25, () => {
      temblar(20, 0.5);
      for (let i = 0; i < 20; i++) p.nueva(P.POLVO, this.X + azar(-60, 60), PIES - 4, azar(-300, 300), azar(-80, -10), azar(0.6, 1.1), azar(24, 40));
      const q = aPant(e.m, [76, -14]);
      p.nueva(P.DESTELLO, q[0], q[1], 0, 0, 0.4, 140);
      for (let i = 0; i < 24; i++) { const a = azar(0, 6.283), v = azar(200, 600); p.nueva(P.CHISPA, q[0], q[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.7), azar(8, 13)); }
      for (let i = 0; i < 90; i++) this.petalos.push({ x: azar(0, W), y: azar(-300, -10), vy: azar(70, 150), r: azar(0, 6), vr: azar(-5, 5), c: Math.random() < 0.7 ? 0 : 1, f: azar(0, 6) });
      for (let i = 0; i < 70; i++) p.nueva(P.CONFETI, azar(0, W), azar(-200, -10), azar(-60, 60), azar(30, 120), azar(4, 6), azar(8, 13), [0, 1, 2, 3, 3][(Math.random() * 5) | 0]);
    });
    for (const q of this.petalos) { q.y += q.vy * dt; q.x += Math.sin(t * 2 + q.f) * 30 * dt; q.r += q.vr * dt; }
    this.petalos = this.petalos.filter((q) => q.y < H + 20);
    p.actualizar(dt);
  }
  dibujar(g) {
    const t = this.t, e = this.estado();
    fondo(g, "#000");
    g.drawImage(this.fondoC, 0, 0);
    // farolillos en tres guirnaldas (pintadas una vez; se mecen un poco)
    const gu = this.guirnaldas();
    for (let fila = 0; fila < 3; fila++) g.drawImage(gu, 0, fila * 120, W + 40, 120, -20 + 3 * Math.sin(t * 1.6 + fila), fila * 52 - 30 + 3 * Math.sin(t * 2.2 + fila * 1.3), W + 40, 120);
    // sombra y avatar
    g.fillStyle = "rgba(90,50,0,.35)"; g.beginPath(); g.ellipse(this.X + e.dx, PIES - 2, 80 * Math.abs(e.sx) + 20, 10, 0, 0, 6.283); g.fill();
    pintarAvatar(g, e.m, e.pose, t);
    // líneas de giro
    if (Math.abs(e.sx) < 0.9 && (t < 4.85 || t > 6.25) && t < 7.3) {
      g.save(); g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = 3; g.lineCap = "round";
      const cx = this.X + e.dx;
      for (const [y, rx] of [[PIES - 300, 90], [PIES - 200, 110], [PIES - 90, 95]]) { g.beginPath(); g.ellipse(cx, y, rx, 16, 0, 0.2 + t * 9, 1.6 + t * 9); g.stroke(); }
      g.restore();
    }
    // el rebujito en espiral (y de vuelta al vaso)
    if (t > 6.45 && t < 7.25) {
      const vasoP = aPant(e.m, e.pose._manoD || [64, 18]);
      const cx = this.X + e.dx, cy = PIES - 220;
      const pts = [];
      for (let i = 0; i < 34; i++) {
        const u = clamp((t - 6.45 - i * 0.011) / 0.8, 0, 1);
        if (u <= 0) continue;
        const sale = Math.sin(u * Math.PI), a = u * 14 + i * 0.22;
        let x = cx + Math.cos(a) * 190 * sale, y = cy + Math.sin(a) * 80 * sale - 50 * sale;
        x = lerp(vasoP[0], x, sale); y = lerp(vasoP[1] - 20, y, sale);
        pts.push([x, y, i]);
      }
      if (pts.length > 1) {
        g.save(); g.lineCap = "round"; g.lineJoin = "round";
        g.strokeStyle = "rgba(220,230,110,.85)"; g.lineWidth = 12;
        g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.stroke();
        g.strokeStyle = "rgba(255,255,230,.8)"; g.lineWidth = 4;
        g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1] - 3) : g.moveTo(q[0], q[1] - 3))); g.stroke();
        g.restore();
      }
      for (const [x, y, i] of pts) {
        if (i % 3) continue;
        const s = 8 + 3 * Math.sin(i);
        g.fillStyle = "#e9f08a"; g.beginPath(); g.arc(x, y, s, 0, 6.283); g.fill();
        g.fillStyle = "rgba(255,255,255,.85)"; g.beginPath(); g.arc(x - s * 0.3, y - s * 0.3, s * 0.35, 0, 6.283); g.fill();
      }
    }
    this.p.dibujar(g);
    // pétalos de clavel
    for (const q of this.petalos) { g.save(); g.translate(q.x, q.y); g.rotate(q.r); g.fillStyle = q.c ? "#ffffff" : "#e8293b"; g.beginPath(); g.ellipse(0, 0, 8, 4.5, 0, 0, 6.283); g.fill(); g.restore(); }
    // ¡OLÉ!
    if (t > 7.25 && t < 9.0) {
      const k = tramo(t, 7.25, 7.4), s = lerp(3, 1, eIn(k)) * (1 + 0.03 * Math.sin(t * 8));
      const spr = this.rotulo();
      g.save(); g.translate(W / 2 - 240, 300); g.rotate(-0.1); g.scale(s, s);
      g.globalAlpha = Math.min(1, k * 4) * (1 - tramo(t, 8.7, 9.0));
      g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
    }
    // cortinas de lunares
    const abre = eInOut(tramo(t, 0.3, 1.1)) * (1 - eInOut(tramo(t, 8.65, 9.35)));
    if (abre < 1) {
      const d = abre * (W / 2 + 60);
      g.drawImage(this.cortina, -40 - d, 0);
      g.save(); g.translate(W + 40 + d, 0); g.scale(-1, 1); g.drawImage(this.cortina, 0, 0); g.restore();
    }
    const negro = Math.max(1 - tramo(t, 0.02, 0.3), tramo(t, 9.35, 9.85));
    if (negro > 0) { g.fillStyle = `rgba(0,0,0,${negro})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
  rotulo() {
    if (cache.has("ole")) return cache.get("ole");
    const c = lienzoNuevo(460, 230), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 40, 0, 190);
    gr.addColorStop(0, "#fff3c4"); gr.addColorStop(0.5, "#ffd34d"); gr.addColorStop(1, "#ff8a1a");
    txt(g, "¡OLÉ!", 230, 180, { tam: 180, peso: 400, fam: FC, color: gr, borde: "#7a0010", bordeAncho: 14, esp: 6, glow: "rgba(255,60,60,.7)", glowTam: 22 });
    cache.set("ole", c);
    return c;
  }
}

registrar({ id: "00065", nombre: "Feria", crear: () => new EscenaFeria() });
})();
