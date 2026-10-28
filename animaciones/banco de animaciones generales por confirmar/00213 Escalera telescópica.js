"use strict";
/*
 * 00213 · ESCALERA TELESCÓPICA
 *
 * Animación del banco. Empieza y acaba en negro.
 * En la terraza del bar, a Guillermo se le escapa con una ráfaga de viento su globo con forma de jarra. Marcos se sube
 * a su escalera telescópica, que se alarga y se alarga (¡CLAC, CLAC!) hasta salirse de la pantalla: ¡HASTA LAS NUBES!
 * Abajo caen plumas y se oye un ¡PÍO! La escalera vuelve a bajar con Marcos, el globo… y un pájaro en el casco.
 * Le devuelve el globo a Guillermo, el pájaro pía y Guillermo se parte de risa.
 */
(() => {
const ESC = 1.35;
const XG = 300, XE = 716;                       // Guillermo y la escalera
const H0 = 104;                                 // altura de la escalera plegada
const T_RAFAGA = 0.95, T_SUELTA = 1.1, T_SALTA = 1.45, T_TRISTE = 2.05, T_SUBE = 2.35, T_ALARGA = 2.75, T_FUERA = 3.95;
const T_PIO1 = 4.75, T_BAJA = 5.55, T_ABAJO = 6.85, T_BAJA_SUELO = 7.05, T_DA = 7.65, T_PIO2 = 8.25, T_FIN = 9.75, DUR = 10.3;
const CT = cacheTexto();
const aU = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

/** Globo con forma de jarra; (x, y) = el nudo de abajo. */
function globoJarra(g, x, y, s, ang, t) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  // asa
  g.lineWidth = 11; g.strokeStyle = "#e0a400";
  g.beginPath(); g.moveTo(26, -96); g.bezierCurveTo(58, -96, 58, -44, 26, -44); g.stroke();
  g.lineWidth = 4; g.strokeStyle = "rgba(255,255,255,.45)"; g.beginPath(); g.moveTo(32, -92); g.bezierCurveTo(50, -90, 50, -60, 40, -52); g.stroke();
  // cuerpo
  const gr = g.createLinearGradient(-34, 0, 34, 0);
  gr.addColorStop(0, "#d98a00"); gr.addColorStop(0.35, "#ffd34d"); gr.addColorStop(0.6, "#ffe98a"); gr.addColorStop(1, "#c67800");
  g.fillStyle = gr; rectR(g, -32, -112, 64, 98, 20); g.fill();
  g.strokeStyle = "#a86200"; g.lineWidth = 2; g.stroke();
  // espuma
  g.fillStyle = "#fffaf0";
  g.beginPath(); g.moveTo(-34, -100);
  for (let i = 0; i <= 4; i++) g.arc(-34 + i * 17, -112, 11 + (i % 2) * 3, Math.PI, 0);
  g.lineTo(34, -96); g.closePath(); g.fill();
  // burbujitas y brillo
  g.fillStyle = "rgba(255,255,255,.6)";
  for (let i = 0; i < 5; i++) { const by = -24 - ((t * 30 + i * 17) % 70); g.beginPath(); g.arc(-16 + i * 8, by, 2.2, 0, 6.283); g.fill(); }
  g.fillStyle = "rgba(255,255,255,.55)"; g.beginPath(); g.ellipse(-18, -70, 6, 24, 0.1, 0, 6.283); g.fill();
  // nudo
  g.fillStyle = "#c67800"; g.beginPath(); g.moveTo(-6, -12); g.lineTo(6, -12); g.lineTo(3, 0); g.lineTo(-3, 0); g.closePath(); g.fill();
  g.restore();
}
/** Pajarito (diseño propio); (x, y) = las patas. */
function pajaro(g, x, y, s, t, aleteo) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.strokeStyle = "#e08a1a"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-5, 0); g.lineTo(-5, -8); g.moveTo(5, 0); g.lineTo(5, -8); g.stroke();
  // cola
  g.fillStyle = "#1f6fd1"; g.beginPath(); g.moveTo(10, -16); g.lineTo(28, -26); g.lineTo(26, -12); g.closePath(); g.fill();
  const gr = g.createRadialGradient(-4, -24, 2, 0, -18, 18);
  gr.addColorStop(0, "#7ec8ff"); gr.addColorStop(1, "#2a7ae0");
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, -18, 15, 13, 0, 0, 6.283); g.fill();
  g.fillStyle = "#ffe6b0"; g.beginPath(); g.ellipse(-2, -13, 9, 7, 0, 0, 6.283); g.fill();
  // ala
  const a = aleteo ? Math.sin(t * 40) * 0.9 : 0.1;
  g.save(); g.translate(6, -20); g.rotate(-0.4 - a);
  g.fillStyle = "#1f6fd1"; g.beginPath(); g.ellipse(8, 0, 11, 6, 0, 0, 6.283); g.fill();
  g.restore();
  // cabeza
  g.fillStyle = gr; g.beginPath(); g.arc(-8, -30, 9, 0, 6.283); g.fill();
  g.fillStyle = "#ffb000"; g.beginPath(); g.moveTo(-16, -31); g.lineTo(-25, -28); g.lineTo(-16, -26); g.closePath(); g.fill();
  g.fillStyle = "#111"; g.beginPath(); g.arc(-10, -32, 2.2, 0, 6.283); g.fill();
  g.fillStyle = "#fff"; g.beginPath(); g.arc(-10.7, -32.8, 0.8, 0, 6.283); g.fill();
  g.fillStyle = "#1f6fd1"; g.beginPath(); g.moveTo(-6, -38); g.lineTo(-2, -45); g.lineTo(-1, -37); g.closePath(); g.fill();
  g.restore();
}
function pluma(g, x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.fillStyle = "#cfe8ff"; g.beginPath(); g.ellipse(0, 0, 5, 13, 0, 0, 6.283); g.fill();
  g.strokeStyle = "#5a8ac0"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, -12); g.lineTo(0, 15); g.stroke();
  g.restore();
}

class EscaleraTelescopica extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(240);
    this.p.suelo = () => PIES + 4;
    const r = semilla(11);
    this.plumas = [0, 1, 2, 3, 4].map((i) => ({ t0: 4.25 + i * 0.2, x: XE - 190 + r() * 110, f: r() * 6 }));
  }
  /** Altura de la escalera. */
  altura(t) {
    if (t < T_ALARGA) return H0;
    if (t < T_BAJA) return H0 + 1150 * eIn(tramo(t, T_ALARGA, T_FUERA)) ** 0.7;
    return lerp(H0 + 1150, H0, eOut(tramo(t, T_BAJA, T_ABAJO)));
  }
  poses() {
    const t = this.t;
    const G = { cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [86, 64], manoI: [9, 160] };
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    let xg = XG, yg = PIES, xm = XE, ym = PIES;
    // ---------------- Guillermo
    if (t < T_SUELTA) {
      G.manoD = [86 + 3 * Math.sin(t * 3), 62]; G.cara = t < T_RAFAGA ? "risa" : "sorpresa"; G.rc = 0.06 * Math.sin(t * 3);
    } else if (t < T_TRISTE) {
      // intenta cogerlo de un salto
      const u = tramo(t, T_SALTA, T_TRISTE);
      yg = PIES - 70 * Math.sin(Math.PI * u);
      G.manoD = [96, 20]; G.manoI = [-10, 40]; G.cara = "sorpresa"; G.puntas = 0.5; G.rc = 0.1;
      G.piernaI = [-12 * Math.sin(Math.PI * u), 0.1]; G.piernaD = [-12 * Math.sin(Math.PI * u), -0.1];
    } else if (t < T_ALARGA) {
      G.cara = "dormido"; G.rc = -0.18; G.manoD = [66, 152]; G.manoI = [12, 154];
      if (t > T_SUBE) { G.cara = "sorpresa"; G.rc = 0.14; }
    } else if (t < T_ABAJO) {
      // mira hacia arriba, con la mano de visera
      G.manoD = [62, 30]; G.cara = t > T_PIO1 && t < T_PIO1 + 0.6 ? "sorpresa" : "sonrisa"; G.rc = 0.12;
      if (t > T_FUERA && t < T_BAJA) { G.cara = Math.floor(t * 2) % 2 ? "sorpresa" : "dormido"; }
      if (t > T_BAJA + 0.5) { G.cara = "risa"; G.manoD = [96, 40]; G.manoI = [-18, 42]; yg = PIES - 6 * Math.abs(Math.sin(t * 12)); }
    } else {
      // va a por su globo
      const u = tramo(t, T_BAJA_SUELO, T_DA);
      xg = lerp(XG, 410, eInOut(u));
      if (u > 0 && u < 1) { const a = andar((t - T_BAJA_SUELO) * 12, 0.9); G.piernaI = a.piernaI; G.piernaD = a.piernaD; yg += a.bote; }
      G.cara = "risa"; G.rc = 0.08;
      G.manoD = [86, 70];
      if (t > T_DA) { G.manoD = [86 + 3 * Math.sin(t * 3), 62]; G.cara = t > T_PIO2 ? "risa" : "guino"; }
      if (t > T_PIO2 + 0.2) { G.brazoIDelante = true; G.manoI = [34, 128]; G.rc = 0.15 * Math.sin(t * 8); yg = PIES - 4 * Math.abs(Math.sin(t * 14)); }
    }
    // ---------------- Marcos
    const Hh = this.altura(t);
    const enEscalera = t > T_SUBE + 0.3 && t < T_BAJA_SUELO;
    if (t < T_SUBE) {
      xm = XE + 70;
      M.cara = t < T_RAFAGA ? "sonrisa" : t < T_TRISTE ? "sorpresa" : "guino";
      M.rc = t < T_TRISTE ? -0.1 : -0.05;
      if (t > T_TRISTE) { M.manoD = [58, 34]; }
    } else if (!enEscalera) {
      const u = tramo(t, T_SUBE, T_SUBE + 0.3);
      xm = lerp(XE + 70, XE, u); ym = PIES - (H0 + 6) * eOut(u);
      M.piernaD = [-16 * Math.sin(Math.PI * u), 0];
      M.cara = "guino";
      if (t >= T_BAJA_SUELO) {
        // baja de la plataforma y se acerca
        const u2 = tramo(t, T_BAJA_SUELO, T_DA);
        xm = lerp(XE, 560, eInOut(u2)); ym = PIES - (H0 + 6) * (1 - eOut(tramo(t, T_BAJA_SUELO, T_BAJA_SUELO + 0.25)));
        if (u2 > 0 && u2 < 1) { const a = andar((t - T_BAJA_SUELO) * 12, 0.9); M.piernaI = a.piernaI; M.piernaD = a.piernaD; }
        M.cara = "risa"; M.rc = -0.06;
        M.manoI = mezcla([-10, 40], [-14, 66], u2);
        if (t > T_DA) { M.manoI = [6, 152]; M.cara = "sonrisa"; }
        if (t > T_PIO2) {
          // el pájaro pía: mira para arriba
          M.cara = t < T_PIO2 + 0.6 ? "sorpresa" : "guino"; M.rc = t < T_PIO2 + 0.6 ? -0.22 : -0.12;
          M.manoD = t < T_PIO2 + 0.6 ? [67, 152] : [58, 34];
        }
      }
    } else {
      // de pie en lo alto de la escalera, agarrado a la barandilla
      ym = PIES - Hh - 6;
      M.manoD = [80, 138]; M.manoI = [-6, 138]; M.brazoIDelante = false;
      M.cara = t < T_FUERA ? "risa" : "sonrisa"; M.rc = -0.04 * Math.sin(t * 6);
      if (t > T_BAJA) { M.manoI = [-10, 40]; M.cara = "risa"; M.rc = 0; }
    }
    const mG = matAv(xg, yg, ESC), mM = matAv(xm, ym, ESC);
    return { G, M, mG, mM, Hh };
  }
  /** Dónde está el globo: { x, y, ang } (el nudo) y de qué mano cuelga. */
  globo(t, e) {
    const sway = (k) => 0.12 * Math.sin(t * 2.2 + k);
    if (t < T_SUELTA) { const h = aPant(e.mG, e.G.manoD); return { x: h[0] + 20 + 10 * Math.sin(t * 2), y: h[1] - 110, ang: sway(0), mano: h }; }
    if (t < T_BAJA) {
      const u = tramo(t, T_SUELTA, 2.6), h0 = aPant(e.mG, [86, 62]);
      return { x: lerp(h0[0] + 20, 640, eIn(u)) + 20 * Math.sin(t * 5), y: lerp(h0[1] - 110, -260, eIn(u)), ang: sway(1) * 2, mano: null };
    }
    if (t < T_DA) { const h = aPant(e.mM, e.M.manoI); return { x: h[0] - 16 + 8 * Math.sin(t * 2), y: h[1] - 110, ang: sway(2), mano: h }; }
    const h = aPant(e.mG, e.G.manoD);
    return { x: h[0] + 20 + 10 * Math.sin(t * 2), y: h[1] - 110, ang: sway(3), mano: h };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    this.una("sube", t > T_SUBE + 0.3, () => { temblar(5, 0.15); });
    // clac, clac
    if (t > T_ALARGA && t < T_FUERA && Math.floor(t * 7) !== Math.floor((t - dt) * 7)) temblar(4, 0.1);
    this.una("tope", t > T_FUERA, () => temblar(8, 0.25));
    this.una("abajo", t > T_ABAJO, () => { temblar(10, 0.25); for (let i = 0; i < 10; i++) p.nueva(P.POLVO, XE + azar(-50, 50), PIES, azar(-120, 120), azar(-40, -5), azar(0.4, 0.8), azar(18, 30)); });
    this.una("da", t > T_DA, () => { for (let i = 0; i < 14; i++) p.nueva(P.PURPURINA, 480 + azar(-60, 60), 200 + azar(-40, 40), azar(-40, 40), azar(-30, 10), azar(0.8, 1.4), azar(10, 16)); });
    this.una("pio2", t > T_PIO2, () => { for (let i = 0; i < 40; i++) p.nueva(P.CONFETI, azar(80, 950), azar(-50, 0), azar(-40, 40), azar(30, 120), azar(1.6, 2.4), azar(9, 14), (Math.random() * 5) | 0); });
    p.actualizar(dt);
  }
  // ------------------------------------------------------------------ dibujo
  fondoFijo() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, PIES);
    gc.addColorStop(0, "#2f7fd6"); gc.addColorStop(0.7, "#8fd0ff"); gc.addColorStop(1, "#d9f2ff");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, PIES + 60);
    g.fillStyle = "rgba(255,255,255,.9)";
    for (const [x, y, s] of [[120, 70, 1.1], [430, 30, 0.8], [880, 90, 1.2], [600, 200, 0.6]]) for (const [dx, dy, r] of [[0, 0, 30], [32, -12, 36], [68, 0, 28], [34, 10, 30]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, 6.283); g.fill(); }
    // fachada del bar al fondo
    g.fillStyle = "#c98a5a"; g.fillRect(-60, 300, W + 120, PIES - 300);
    g.fillStyle = "rgba(0,0,0,.08)"; for (let y = 312; y < PIES; y += 22) g.fillRect(-60, y, W + 120, 2);
    for (const x of [60, 470, 860]) {
      g.fillStyle = "#3a2214"; g.fillRect(x - 70, 360, 140, 150);
      g.fillStyle = "rgba(255,210,140,.55)"; g.fillRect(x - 62, 368, 124, 134);
      g.fillStyle = "#3a2214"; g.fillRect(x - 3, 368, 6, 134); g.fillRect(x - 62, 432, 124, 5);
    }
    for (let i = 0; i < 26; i++) { g.fillStyle = i % 2 ? "#fffdf5" : "#c0262a"; g.beginPath(); g.moveTo(-60 + i * 44, 300); g.lineTo(-16 + i * 44, 300); g.lineTo(-16 + i * 44, 336); g.quadraticCurveTo(-38 + i * 44, 348, -60 + i * 44, 336); g.closePath(); g.fill(); }
    txt(g, "BAR", 470, 290, { tam: 30, peso: 900, fam: FD, color: "#fffdf5", esp: 8, borde: "#3a2214", bordeAncho: 5 });
    // macetas y mesas de terraza
    for (const x of [170, 560]) {
      g.fillStyle = "#5a5f68"; g.fillRect(x - 3, 500, 6, 75); g.beginPath(); g.ellipse(x, 500, 38, 8, 0, 0, 6.283); g.fill();
    }
    // suelo
    const gs = g.createLinearGradient(0, PIES, 0, H + 60); gs.addColorStop(0, "#b8aa98"); gs.addColorStop(1, "#6a6050");
    g.fillStyle = gs; g.fillRect(-60, PIES - 4, W + 120, H + 60 - PIES);
    g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(-60, PIES - 4, W + 120, 2);
    return (this.cF = c);
  }
  /** Escalera telescópica de altura h. */
  escalera(g, h, t) {
    const x = XE, base = PIES, top = base - h;
    const balanceo = h > 400 ? 6 * Math.sin(t * 3) * Math.min(1, (h - 400) / 400) : 0;
    g.save();
    // base con ruedas
    g.fillStyle = "#3a3f46"; rectR(g, x - 60, base - 26, 120, 20, 6); g.fill();
    g.fillStyle = "#1a1a1a"; for (const dx of [-44, 44]) { g.beginPath(); g.arc(x + dx, base - 6, 9, 0, 6.283); g.fill(); }
    g.fillStyle = "#d8261c"; g.fillRect(x - 60, base - 26, 120, 5);
    // raíles y peldaños (desde arriba, para que suban al alargarse)
    const xi = (y) => x - 34 + balanceo * (base - y) / Math.max(1, h), xd = (y) => x + 34 + balanceo * (base - y) / Math.max(1, h);
    const gr = g.createLinearGradient(x - 40, 0, x + 40, 0);
    gr.addColorStop(0, "#9aa4ad"); gr.addColorStop(0.5, "#eef3f6"); gr.addColorStop(1, "#7a848d");
    g.strokeStyle = "#c9d0d6"; g.lineWidth = 6;
    for (let y = top + 26; y < base - 30; y += 32) { g.beginPath(); g.moveTo(xi(y), y); g.lineTo(xd(y), y); g.stroke(); }
    g.lineWidth = 9; g.lineCap = "round";
    for (const f of [xi, xd]) {
      g.strokeStyle = "#5a626a"; g.beginPath(); g.moveTo(f(base - 24), base - 24); g.lineTo(f(top), top); g.stroke();
      g.strokeStyle = "#e6ebef"; g.lineWidth = 5; g.beginPath(); g.moveTo(f(base - 24), base - 24); g.lineTo(f(top), top); g.stroke(); g.lineWidth = 9;
    }
    // juntas de los tramos
    g.fillStyle = "#d8261c";
    for (let y = top + 150; y < base - 40; y += 170) { g.fillRect(xi(y) - 7, y - 5, 14, 10); g.fillRect(xd(y) - 7, y - 5, 14, 10); }
    // plataforma con barandilla
    g.fillStyle = "#5a626a"; rectR(g, xi(top) - 12, top - 6, 92, 10, 3); g.fill();
    g.strokeStyle = "#d8261c"; g.lineWidth = 5;
    g.beginPath(); g.moveTo(xi(top) - 6, top - 4); g.lineTo(xi(top) - 6, top - 104); g.lineTo(xd(top) + 6, top - 104); g.lineTo(xd(top) + 6, top - 4); g.stroke();
    g.restore();
  }
  rotulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(900, 170), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 140);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#c9ecff"); gr.addColorStop(1, "#2f8cff");
    txt(g, "¡HASTA LAS NUBES!", 456, 132, { tam: 110, peso: 900, fam: FD, color: "#05203a", esp: 4, max: 850 });
    txt(g, "¡HASTA LAS NUBES!", 450, 126, { tam: 110, peso: 900, fam: FD, color: gr, borde: "#05203a", bordeAncho: 11, esp: 4, glow: "rgba(120,200,255,.85)", glowTam: 22, max: 850 });
    CT.set("t", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses();
    fondo(g, "#000");
    g.drawImage(this.fondoFijo(), -60, -60);
    // ráfaga de viento
    if (t > T_RAFAGA - 0.3 && t < T_RAFAGA + 0.7) {
      const u = tramo(t, T_RAFAGA - 0.3, T_RAFAGA + 0.7);
      g.save(); g.strokeStyle = `rgba(255,255,255,${0.8 * Math.sin(Math.PI * u)})`; g.lineWidth = 5; g.lineCap = "round";
      for (let i = 0; i < 4; i++) { const x = -200 + u * 1300 - i * 60, y = 120 + i * 40; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + 80, y - 20, x + 140, y + 20, x + 220, y); g.stroke(); }
      g.restore();
    }
    // sombras
    g.fillStyle = "rgba(0,0,0,.25)";
    g.beginPath(); g.ellipse(aPant(e.mG, [39, 232])[0], PIES + 2, 56, 9, 0, 0, 6.283); g.fill();
    g.beginPath(); g.ellipse(XE, PIES + 2, 76, 10, 0, 0, 6.283); g.fill();
    this.escalera(g, e.Hh, t);
    // el globo (y su cuerda)
    const gb = this.globo(t, e);
    const cuerda = (q) => {
      g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 2;
      g.beginPath(); g.moveTo(gb.x, gb.y);
      if (q) g.quadraticCurveTo(gb.x + 14 * Math.sin(t * 3), (gb.y + q[1]) / 2, q[0], q[1]);
      else g.bezierCurveTo(gb.x + 20 * Math.sin(t * 6), gb.y + 40, gb.x - 20 * Math.sin(t * 6 + 1), gb.y + 70, gb.x + 6 * Math.sin(t * 5), gb.y + 100);
      g.stroke();
    };
    const visible = gb.y > -260;
    if (visible) { cuerda(gb.mano); globoJarra(g, gb.x, gb.y, 0.95, gb.ang, t); }
    pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    // el pájaro en el casco
    if (t > T_BAJA) {
      const R = avatar("bombero").rig, o = rot2([0, 4 - R.cuello[1]], e.M.rc || 0);
      const c = aPant(e.mM, [R.cuello[0] + o[0], R.cuello[1] + o[1]]), aleteo = (t > T_PIO2 && t < T_PIO2 + 0.6) || (t < T_BAJA + 0.4);
      pajaro(g, c[0] + 4, c[1] - (aleteo ? 6 * Math.abs(Math.sin(t * 20)) : 0), 1.4, t, aleteo);
    }
    // plumas que caen mientras está ahí arriba
    for (const q of this.plumas) {
      const d = t - q.t0;
      if (d < 0 || d > 1.6) continue;
      g.save(); g.globalAlpha = 1 - tramo(d, 1.2, 1.6);
      pluma(g, q.x + 30 * Math.sin(d * 3 + q.f), -20 + d * 210, 0.6 * Math.sin(d * 3 + q.f));
      g.restore();
    }
    this.p.dibujar(g);
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    ono("¡FIUUU!", 150, 200, T_RAFAGA, 0.7, 44, "#e6f6ff", "#05203a", -0.1);
    ono("¡OH, NO!", 150, 230, T_TRISTE, 0.6, 40, "#fffdf5", "#1b1b1b", -0.08);
    ono("¡CLAC!", 860, 420, T_ALARGA + 0.05, 0.35, 44, "#fffdf5", "#1b1b1b", 0.1);
    ono("¡CLAC!", 880, 330, T_ALARGA + 0.45, 0.35, 48, "#fffdf5", "#1b1b1b", -0.06);
    ono("¡CLAC!", 860, 240, T_ALARGA + 0.85, 0.35, 52, "#fffdf5", "#1b1b1b", 0.08);
    ono("¡PÍO!", 800, 60, T_PIO1, 0.6, 46, "#ffd34d", "#3a2400", 0.1);
    ono("¡PÍO!", 860, 230, T_PIO2, 0.7, 50, "#ffd34d", "#3a2400", 0.1);
    // ¡HASTA LAS NUBES!
    if (t > T_FUERA - 0.4 && t < T_BAJA + 0.6) {
      const d = t - T_FUERA + 0.4, k = tramo(d, 0, 0.16), sal = tramo(t, T_BAJA + 0.3, T_BAJA + 0.6);
      const s = lerp(1.5, 1, eIn(k)) * (1 + 0.02 * Math.sin(d * 7)) * 0.95;
      const r = this.rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - sal); g.translate(450, 150); g.rotate(-0.04); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.4), tramo(t, T_FIN, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00213", nombre: "Escalera telescópica", crear: () => new EscaleraTelescopica() });
})();
