"use strict";
/*
 * 00240 · MOCHILA DE AGUA
 *
 * Animación del banco. Empieza y acaba en negro.
 * En la calle, Marcos (de bombero) se ha puesto una mochila de chorros de agua. Aprieta el botón: ¡A TODA PRESIÓN!,
 * y sube. Guillermo se agarra a sus botas y despegan los dos: sobrevuelan la ciudad de noche, Guillermo colgando y
 * pataleando, y bajan a la terraza del bar. Guillermo cae sentado a la mesa, justo delante de su caña, y Marcos
 * aterriza al lado y brinda con un vaso de agua (está de servicio).
 */
(() => {
const CT = cacheTexto();
const ESC = 1.1;
const XM0 = 560, XG0 = 300;                       // al principio (mundo = pantalla)
const XM1 = 2512, XG1 = 2330, CX1 = 1880;         // al final: Marcos, la silla de Guillermo y la cámara
const MESA = [2340, 500];                         // mesa de la terraza (mundo): centro y altura del tablero
const T_BOTON = 0.75, T_SUBE = 1.3, T_COGE = 2.05, T_VUELA = 2.3, T_BAJA = 6.0, T_SUELTA = 6.65, T_POSA = 7.1,
  T_CANA = 7.45, T_CHIN = 8.25, T_FIN = 9.6, DUR = 10.1;
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };

function rotulo() {
  if (CT.has("t")) return CT.get("t");
  const c = lienzoNuevo(960, 190), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 150);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#bfeaff"); gr.addColorStop(1, "#3aa8ff");
  txt(g, "¡A TODA PRESIÓN!", 486, 146, { tam: 118, peso: 900, fam: FD, color: "#021a2a", esp: 5, max: 900 });
  txt(g, "¡A TODA PRESIÓN!", 480, 140, { tam: 118, peso: 900, fam: FD, color: gr, borde: "#052a48", bordeAncho: 11, esp: 5, glow: "rgba(80,180,255,.9)", glowTam: 24, max: 900 });
  CT.set("t", c);
  return c;
}
/** El mismo rótulo en dos líneas (para el despegue, a la derecha de Marcos). */
function rotulo2() {
  if (CT.has("t2")) return CT.get("t2");
  const c = lienzoNuevo(480, 270), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 20, 0, 250);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#bfeaff"); gr.addColorStop(1, "#3aa8ff");
  for (const [s, y] of [["¡A TODA", 118], ["PRESIÓN!", 236]]) {
    txt(g, s, 246, y + 6, { tam: 112, peso: 900, fam: FD, color: "#021a2a", esp: 5, max: 440 });
    txt(g, s, 240, y, { tam: 112, peso: 900, fam: FD, color: gr, borde: "#052a48", bordeAncho: 11, esp: 5, glow: "rgba(80,180,255,.9)", glowTam: 24, max: 440 });
  }
  CT.set("t2", c);
  return c;
}

// ------------------------------------------------------------------------------------------- la mochila
/** Depósitos por detrás del cuerpo (unidades de avatar) y toberas a los lados. */
function mochilaDetras(g) {
  for (const x of [1, 57]) {
    const gr = g.createLinearGradient(x, 0, x + 17, 0);
    gr.addColorStop(0, "#7d868e"); gr.addColorStop(0.45, "#f2f5f8"); gr.addColorStop(1, "#5a636b");
    g.fillStyle = gr; rectR(g, x, 74, 17, 74, 8); g.fill();
    g.fillStyle = "#d8261c"; g.fillRect(x, 92, 17, 7); g.fillRect(x, 124, 17, 7);
    g.fillStyle = "rgba(255,255,255,.5)"; g.fillRect(x + 4, 80, 2, 60);
  }
  // tubos hacia las toberas
  g.strokeStyle = "#3a3d42"; g.lineWidth = 5; g.lineCap = "round";
  g.beginPath(); g.moveTo(9, 146); g.quadraticCurveTo(4, 156, -4, 160); g.moveTo(66, 146); g.quadraticCurveTo(72, 156, 80, 160); g.stroke();
  for (const [x, a] of [[-6, 0.32], [82, -0.32]]) {
    g.save(); g.translate(x, 161); g.rotate(a);
    const gt = g.createLinearGradient(-6, 0, 6, 0); gt.addColorStop(0, "#7a5200"); gt.addColorStop(0.5, "#ffe08a"); gt.addColorStop(1, "#7a5200");
    g.fillStyle = gt; g.beginPath(); g.moveTo(-5, -4); g.lineTo(5, -4); g.lineTo(7, 10); g.lineTo(-7, 10); g.closePath(); g.fill();
    g.restore();
  }
}
/** Correas por encima del pecho. */
function correas(g) {
  g.strokeStyle = "#1b1b1d"; g.lineWidth = 5;
  g.beginPath(); g.moveTo(20, 80); g.lineTo(26, 140); g.moveTo(54, 80); g.lineTo(48, 140); g.stroke();
  g.fillStyle = "#c9cfd4"; rectR(g, 30, 108, 14, 9, 2); g.fill();
}
/** Mando en la mano. */
function mando(g, x, y, luz) {
  g.fillStyle = "#26282c"; rectR(g, x - 6, y - 14, 12, 18, 3); g.fill();
  g.fillStyle = luz ? "#ff3a3a" : "#7a1010"; g.beginPath(); g.arc(x, y - 10, 2.6, 0, 6.283); g.fill();
}
/** Chorro hacia abajo desde (x, y), con ángulo a (0 = recto abajo) y largo L (pantalla). */
function chorroAbajo(g, x, y, a, L, k, t) {
  if (k <= 0.01) return;
  const dx = Math.sin(a), dy = Math.cos(a);
  g.save(); g.translate(x, y); g.rotate(-a);
  const gr = g.createLinearGradient(0, 0, 0, L);
  gr.addColorStop(0, "rgba(220,245,255,.95)"); gr.addColorStop(0.4, "rgba(120,200,255,.7)"); gr.addColorStop(1, "rgba(120,200,255,0)");
  g.fillStyle = gr;
  const w0 = 6 * k, w1 = 30 * k;
  g.beginPath(); g.moveTo(-w0, 0);
  for (let i = 0; i <= 8; i++) { const u = i / 8; g.lineTo(-lerp(w0, w1, u) + 3 * Math.sin(t * 40 + i), u * L); }
  for (let i = 8; i >= 0; i--) { const u = i / 8; g.lineTo(lerp(w0, w1, u) + 3 * Math.sin(t * 37 + i * 2), u * L); }
  g.closePath(); g.fill();
  g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = 2; g.setLineDash([10, 16]); g.lineDashOffset = -t * 700;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, L * 0.7); g.stroke();
  g.restore();
  void dx; void dy;
}

class MochilaDeAgua extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(320);
    this.gotas = [];
  }
  // ------------------------------------------------------------------ posiciones (mundo)
  marcos() {
    const t = this.t;
    let x = XM0, y = PIES;
    if (t > T_SUBE) y = lerp(PIES, 345, eOut(tramo(t, T_SUBE, T_SUBE + 0.6)));
    if (t > T_VUELA) {
      const u = tramo(t, T_VUELA, T_BAJA);
      x = lerp(XM0, XM1 - 260, u * u * (3 - 2 * u) * 0.5 + u * 0.5);
      y = lerp(345, 40, eOut(tramo(t, T_VUELA, T_VUELA + 1.4))) + 22 * Math.sin((t - T_VUELA) * 2.4);
    }
    if (t > T_BAJA) {
      const u = tramo(t, T_BAJA, T_POSA);
      x = lerp(XM1 - 260, XM1, eOut(u));
      y = lerp(40 + 22 * Math.sin((T_BAJA - T_VUELA) * 2.4), PIES, eInOut(u));
    }
    return [x, y];
  }
  camara() {
    const t = this.t, [xm, ym] = this.marcos();
    let cx = 0, cy = 0;
    if (t > T_VUELA) { cx = xm - XM0; cy = Math.min(0, ym - 300); }
    if (t > T_BAJA) {
      const u = eInOut(tramo(t, T_BAJA, T_POSA + 0.1));
      const [xb] = [XM1 - 260];
      cx = lerp(xb - XM0, CX1, u); cy = lerp(Math.min(0, ym - 300), 0, u);
    }
    return [cx, cy];
  }
  poses() {
    const t = this.t, [xm, ym] = this.marcos(), [cx, cy] = this.camara();
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    // ---- Marcos
    const vuela = t > T_SUBE && t < T_POSA;
    if (t < T_SUBE) {
      // enseña el mando y aprieta el botón
      const k = eOut(tramo(t, 0.3, 0.6));
      M.manoD = mezcla([67, 152], [78, 96], k); M.cara = t > T_BOTON ? "guino" : "sonrisa"; M.rc = -0.08;
      if (t > T_BOTON) M.manoD = [78, 96 + 3 * Math.sin(t * 40) * (t < T_BOTON + 0.2 ? 1 : 0)];
    } else if (vuela) {
      M.manoD = [74, 104]; M.manoI = [0, 104];
      const s = Math.sin(t * 3);
      M.piernaI = [-2, 0.1 + 0.04 * s]; M.piernaD = [-2, -0.1 - 0.04 * s];
      M.cara = t < T_COGE ? "risa" : t < T_VUELA + 0.6 ? "sorpresa" : "risa"; M.rc = 0.06 * Math.sin(t * 2);
      if (t > T_VUELA + 2.4 && t < T_BAJA) M.cara = "guino";
    }
    M.objD = (g) => correas(g);
    M.objD2 = (g, mano) => mando(g, mano[0], mano[1], t > T_BOTON && t < T_POSA);
    // ---- Guillermo
    let mG;
    const mM = matAv(xm - cx, ym - cy, ESC);
    const botas = aPant(mM, [38, 228]);
    if (t < T_COGE) {
      // mira asombrado, va debajo y levanta los brazos
      let x = XG0;
      G.cara = t < T_SUBE ? "sorpresa" : "risa"; G.rc = 0.08;
      if (t > T_SUBE + 0.15) {
        const u = tramo(t, T_SUBE + 0.15, T_COGE - 0.05);
        x = lerp(XG0, botas[0], eInOut(u));
        if (u < 1) { const a = andar((t - T_SUBE) * 14, 1); G.piernaI = a.piernaI; G.piernaD = a.piernaD; }
        const k = eOut(tramo(t, T_COGE - 0.35, T_COGE));
        G.manoD = mezcla([70, 158], [50, 16], k); G.manoI = mezcla([9, 160], [28, 16], k); G.cara = "risa";
      }
      mG = matAv(x, PIES, ESC);
    } else if (t < T_SUELTA) {
      // colgado de las botas
      G.manoD = [50, 16]; G.manoI = [28, 16];
      const s = Math.sin(t * 9);
      G.piernaI = [-6 * Math.max(0, s), 0.25 * s]; G.piernaD = [-6 * Math.max(0, -s), 0.25 * s];
      G.cara = t < T_VUELA + 1.4 ? "sorpresa" : "risa"; G.puntas = t < T_VUELA + 1.4 ? 1 : 0.5;
      if (t > T_VUELA + 2.6) G.cara = "guino";
      const giro = 0.12 * Math.sin(t * 2.6) - (t > T_VUELA && t < T_VUELA + 1 ? 0.15 * Math.sin(tramo(t, T_VUELA, T_VUELA + 1) * Math.PI) : 0);
      mG = matAv(botas[0], botas[1], ESC, giro, 1, 1, [39, 16]);
    } else {
      // se suelta y cae sentado detrás de la mesa
      const silla = [XG1 - cx, PIES + 62 - cy];
      const colgado = matAv(botas[0], botas[1], ESC, 0, 1, 1, [39, 16]), pies0 = aPant(colgado, [39, 232]);
      const u = tramo(t, T_SUELTA, T_SUELTA + 0.32);
      const pos = [lerp(pies0[0], silla[0], u), lerp(pies0[1], silla[1], eIn(u))];
      const kb = eOut(tramo(t, T_SUELTA, T_SUELTA + 0.25));
      G.manoD = mezcla([50, 16], [76, 112], kb); G.manoI = mezcla([28, 16], [2, 112], kb);
      G.cara = u < 1 ? "sorpresa" : "risa"; G.puntas = 1 - tramo(t, T_SUELTA + 0.4, T_SUELTA + 0.8);
      const aplasta = t > T_SUELTA + 0.32 ? 1 - 0.07 * Math.sin(tramo(t, T_SUELTA + 0.32, T_SUELTA + 0.5) * Math.PI) : 1;
      // coge la caña
      if (t > T_CANA) {
        const k = eInOut(tramo(t, T_CANA, T_CANA + 0.3));
        G.manoD = mezcla([76, 112], [84, 116], k); G.manoI = [2, 140];
        G.jarra = { inc: -0.1, nivel: 0.9 };
        G.cara = "risa"; G.rc = 0.06;
      }
      mG = matAv(pos[0], pos[1], ESC, 0, 1, aplasta);
    }
    // ---- aterriza Marcos: coge su vaso de agua
    if (t > T_POSA) {
      M.manoD = [67, 152]; M.cara = "risa"; M.rc = -0.06;
      if (t > T_CANA + 0.2) {
        const k = eInOut(tramo(t, T_CANA + 0.2, T_CANA + 0.5));
        M.manoI = mezcla([6, 152], [2, 116], k); M.brazoIDelante = true;
        M.objI2 = (g, mano) => vasoAgua(g, mano[0] - 2, mano[1] - 4, t);
      }
    }
    // ---- ¡chin!
    if (t > T_CHIN - 0.3) {
      const P0 = [MESA[0] - cx + 88, 440 - cy];
      const k = eInOut(tramo(t, T_CHIN - 0.3, T_CHIN)), ch = Math.max(0, 1 - Math.abs(t - T_CHIN) * 6);
      G.manoD = mezcla(G.manoD, enAv(mG, [P0[0] - 40 + 4 * ch, P0[1] + 10]), k); G.jarra.inc = -0.25 * k;
      M.manoI = mezcla(M.manoI, enAv(mM, [P0[0] + 12 - 4 * ch, P0[1] + 6]), k);
      if (t > T_CHIN + 0.3) { G.cara = "guino"; M.cara = "risa"; }
    }
    return { G, M, mG, mM, cx, cy };
  }

  actualizar(dt) {
    const t = (this.t += dt), p = this.p, e = this.poses();
    const potencia = this.potencia();
    if (potencia > 0.05) {
      for (const [x, a] of [[-6, 0.32], [82, -0.32]]) {
        const q = aPant(e.mM, [x, 170]);
        // en el suelo: salpica
        const suelo = PIES - e.cy, L = this.largoChorro(q[1]);
        if (q[1] + L * 0.9 > suelo - 4 && Math.random() < 40 * dt * potencia) {
          for (let i = 0; i < 2; i++) this.gotas.push({ x: q[0] + Math.sin(a) * -(suelo - q[1]) * 0.35 + azar(-20, 20), y: suelo - 4, vx: azar(-260, 260), vy: azar(-420, -160), v: azar(0.4, 0.8) });
          if (Math.random() < 0.3) p.nueva(P.VAPOR, q[0], suelo - 10, azar(-80, 80), azar(-60, -20), azar(0.6, 1), azar(30, 50));
        } else if (Math.random() < 30 * dt * potencia) this.gotas.push({ x: q[0] - Math.sin(a) * L + azar(-20, 20), y: q[1] + L * 0.85, vx: azar(-80, 80), vy: azar(100, 300), v: azar(0.3, 0.6) });
      }
    }
    for (const d of this.gotas) { d.v -= dt; d.vy += 1000 * dt; d.x += d.vx * dt; d.y += d.vy * dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    if (this.gotas.length > 260) this.gotas.splice(0, this.gotas.length - 260);
    this.una("boton", t > T_BOTON, () => p.nueva(P.DESTELLO, aPant(e.mM, [78, 86])[0], aPant(e.mM, [78, 86])[1], 0, 0, 0.25, 70));
    this.una("sube", t > T_SUBE, () => temblar(10, 0.5));
    this.una("coge", t > T_COGE, () => temblar(6, 0.2));
    this.una("plof", t > T_SUELTA + 0.32, () => {
      temblar(12, 0.3);
      for (let i = 0; i < 10; i++) p.nueva(P.POLVO, XG1 - e.cx + azar(-60, 60), 520, azar(-80, 80), azar(-50, -10), azar(0.4, 0.7), azar(18, 28));
    });
    this.una("posa", t > T_POSA, () => temblar(8, 0.25));
    this.una("chin", t > T_CHIN, () => {
      temblar(10, 0.3);
      const P0 = [MESA[0] - e.cx + 70, 430];
      p.nueva(P.DESTELLO, P0[0], P0[1], 0, 0, 0.3, 150);
      for (let i = 0; i < 24; i++) { const a = azar(-Math.PI, 0), v = azar(120, 380); p.nueva(P.ESPUMA, P0[0], P0[1], Math.cos(a) * v, Math.sin(a) * v, azar(0.5, 0.9), azar(5, 9)); }
      for (let i = 0; i < 50; i++) p.nueva(P.CONFETI, azar(60, 960), azar(-60, -10), azar(-40, 40), azar(30, 140), azar(2, 3), azar(9, 14), i % 5);
    });
    p.suelo = () => PIES;
    p.actualizar(dt);
  }
  potencia() {
    const t = this.t;
    if (t < T_BOTON) return 0;
    if (t < T_SUBE) return 0.25 + 0.15 * Math.sin(t * 50);                 // chisporrotea
    if (t < T_POSA) return 1;
    return 1 - tramo(t, T_POSA, T_POSA + 0.3);
  }
  largoChorro(yNoz) {
    const t = this.t;
    if (t < T_SUBE) return 60 + 40 * Math.sin(t * 30);
    return 260;
  }

  // ------------------------------------------------------------------ fondos
  cielo() {
    if (CT.has("cielo")) return CT.get("cielo");
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, H + 60);
    gc.addColorStop(0, "#0b1030"); gc.addColorStop(0.6, "#3a2a6a"); gc.addColorStop(1, "#c4607a");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, H + 120);
    const r = semilla(23);
    g.fillStyle = "#fff";
    for (let i = 0; i < 90; i++) { g.globalAlpha = 0.3 + r() * 0.7; g.fillRect(r() * (W + 120) - 60, r() * 380 - 60, 2, 2); }
    g.globalAlpha = 1;
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.6; g.drawImage(BLOB2.oroClaro, 760, 20, 180, 180); g.restore();
    g.fillStyle = "#fff6d8"; g.beginPath(); g.arc(850, 110, 44, 0, 6.283); g.fill();
    g.fillStyle = "rgba(200,190,160,.5)"; for (const [x, y, rr] of [[836, 98, 8], [866, 124, 6], [852, 130, 4]]) { g.beginPath(); g.arc(x, y, rr, 0, 6.283); g.fill(); }
    CT.set("cielo", c);
    return c;
  }
  silueta() {
    if (CT.has("sil")) return CT.get("sil");
    const w = 2400, h = 420, c = lienzoNuevo(w, h), g = c.getContext("2d");
    const r = semilla(41);
    let x = 0;
    while (x < w) {
      const bw = 70 + r() * 110, bh = 140 + r() * 260;
      g.fillStyle = r() > 0.5 ? "#1e1a3a" : "#26204a";
      g.fillRect(x, h - bh, bw, bh);
      if (r() > 0.6) { g.fillRect(x + bw * 0.4, h - bh - 30, 4, 30); }
      g.fillStyle = "rgba(255,214,120,.75)";
      for (let yy = h - bh + 14; yy < h - 10; yy += 22) for (let xx = x + 10; xx < x + bw - 12; xx += 18) if (r() > 0.55) g.fillRect(xx, yy, 8, 11);
      x += bw + 6;
    }
    CT.set("sil", c);
    return c;
  }
  /** Fachadas de la calle (mundo): al principio y la del bar con su terraza al final. */
  calle() {
    if (CT.has("calle")) return CT.get("calle");
    const c = lienzoNuevo(3200, 420), g = c.getContext("2d");        // y del lienzo: 0 = mundo 200
    const Y = (y) => y - 200;
    const r = semilla(7);
    // tiendas del principio
    const cols = ["#5a3a4a", "#3a4a5a", "#4a5a3a", "#5a4a2a"];
    for (let i = 0; i < 6; i++) {
      const x = -40 + i * 200;
      g.fillStyle = cols[i % 4]; g.fillRect(x, Y(260), 196, 400);
      g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(x, Y(260), 196, 10);
      for (const wx of [x + 26, x + 112]) { g.fillStyle = r() > 0.4 ? "#ffd27a" : "#3a3550"; g.fillRect(wx, Y(300), 56, 70); g.fillStyle = "rgba(0,0,0,.3)"; g.fillRect(wx + 26, Y(300), 4, 70); }
      g.fillStyle = "#2a2230"; g.fillRect(x + 20, Y(420), 156, 150);
      g.fillStyle = "rgba(255,210,140,.35)"; g.fillRect(x + 28, Y(428), 140, 90);
    }
    // el bar (mundo 1880–2904)
    const bx = 1840;
    g.fillStyle = "#4a2a1e"; g.fillRect(bx, Y(230), 1100, 420);
    for (let yy = 230; yy < 600; yy += 26) for (let xx = (yy / 26) % 2 ? bx - 13 : bx; xx < bx + 1100; xx += 52) { g.fillStyle = "rgba(120,60,40,.35)"; rectR(g, xx + 2, Y(yy) + 2, 48, 22, 2); g.fill(); }
    // ventanales con luz cálida
    for (const wx of [bx + 60, bx + 700]) {
      g.fillStyle = "#ffcf7a"; g.fillRect(wx, Y(330), 300, 150);
      g.fillStyle = "rgba(160,80,20,.35)"; for (let k = 0; k < 6; k++) g.fillRect(wx + 20 + k * 48, Y(380), 18, 40);
      g.strokeStyle = "#2a1408"; g.lineWidth = 6; g.strokeRect(wx, Y(330), 300, 150); g.beginPath(); g.moveTo(wx + 150, Y(330)); g.lineTo(wx + 150, Y(480)); g.stroke();
    }
    // puerta
    g.fillStyle = "#2a1408"; g.fillRect(bx + 420, Y(340), 160, 236);
    g.fillStyle = "#ffcf7a"; g.fillRect(bx + 436, Y(356), 128, 120);
    // toldo a rayas
    for (let k = 0; k < 22; k++) {
      g.fillStyle = k % 2 ? "#f4f0e6" : "#1d6a3c";
      g.beginPath(); g.moveTo(bx + 20 + k * 48, Y(270)); g.lineTo(bx + 68 + k * 48, Y(270)); g.lineTo(bx + 72 + k * 48, Y(318)); g.lineTo(bx + 16 + k * 48, Y(318)); g.closePath(); g.fill();
    }
    for (let k = 0; k < 22; k++) { g.fillStyle = k % 2 ? "#f4f0e6" : "#1d6a3c"; g.beginPath(); g.arc(bx + 44 + k * 48, Y(318), 24, 0, Math.PI); g.fill(); }
    // rótulo
    g.fillStyle = "#1d4a2c"; rectR(g, bx + 410, Y(236), 180, 32, 6); g.fill();
    g.strokeStyle = "#ffd34d"; g.lineWidth = 2.5; rectR(g, bx + 414, Y(240), 172, 24, 4); g.stroke();
    txt(g, "BAR", bx + 500, Y(261), { tam: 24, peso: 900, fam: FD, color: "#ffd34d", esp: 8 });
    // guirnalda de bombillas
    g.strokeStyle = "#222"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(bx, Y(330)); g.quadraticCurveTo(bx + 550, Y(410), bx + 1100, Y(330)); g.stroke();
    for (let k = 1; k < 18; k++) { const u = k / 18, xx = bx + 1100 * u, yy = Y(330) + 2 * (1 - u) * u * 80 * 2; g.fillStyle = "#ffe08a"; g.beginPath(); g.arc(xx, yy + 6, 5, 0, 6.283); g.fill(); }
    CT.set("calle", c);
    return c;
  }
  mesa(g, x, y, conCana, conVaso, t) {
    // mesa redonda con mantel de cuadros hasta el suelo
    g.save(); g.translate(x, y);
    g.fillStyle = "rgba(0,0,0,.3)"; g.beginPath(); g.ellipse(0, PIES - y + 4, 120, 10, 0, 0, 6.283); g.fill();
    g.save();
    g.beginPath(); g.moveTo(-104, 0); g.lineTo(104, 0); g.lineTo(122, PIES - y + 40); g.lineTo(-122, PIES - y + 40); g.closePath();
    g.fillStyle = "#f4f0e6"; g.fill(); g.clip();
    g.fillStyle = "rgba(200,30,40,.85)";
    for (let i = -6; i < 6; i++) for (let j = 0; j < 6; j++) if ((i + j) % 2 === 0) g.fillRect(i * 22, j * 22, 22, 22);
    g.restore();
    g.fillStyle = "#e8e2d4"; g.beginPath(); g.ellipse(0, 0, 106, 12, 0, 0, 6.283); g.fill();
    g.restore();
    if (conCana) { g.save(); g.translate(x + 30, y - 16); g.scale(ESC, ESC); dibujarJarra(g, [0, 0], 0, 0.9, "asa", t); dibujarJarra(g, [0, 0], 0, 0.9, "cuerpo", t); g.restore(); }
    if (conVaso) { g.save(); g.translate(x + 82, y - 6); g.scale(ESC, ESC); vasoAgua(g, 0, 0, t); g.restore(); }
  }

  dibujar(g) {
    const t = this.t, e = this.poses(), cx = e.cx, cy = e.cy;
    fondo(g, "#000");
    g.drawImage(this.cielo(), -60, -60 - cy * 0.05);
    // silueta de la ciudad (lejos)
    const S = this.silueta(), sx = -((cx * 0.35) % S.width), sy = 600 - S.height - cy * 0.45 + 40;
    g.drawImage(S, sx - 60, sy); if (sx - 60 + S.width < W + 60) g.drawImage(S, sx - 60 + S.width, sy);
    // nubes
    for (let i = 0; i < 5; i++) {
      const x = ((i * 380 - cx * 0.6) % 1900 + 1900) % 1900 - 300, y = 120 + i * 47 - cy * 0.6;
      if (y < -80 || y > H + 40) continue;
      g.fillStyle = "rgba(220,210,240,.22)";
      for (const [dx, dy, rr] of [[0, 0, 40], [40, -14, 50], [90, 0, 38], [46, 12, 44]]) { g.beginPath(); g.arc(x + dx, y + dy, rr, 0, 6.283); g.fill(); }
    }
    // la calle
    g.drawImage(this.calle(), -cx, 200 - cy);
    g.fillStyle = "#3a3438"; g.fillRect(-60, PIES - cy, W + 120, H);
    g.fillStyle = "#5a5258"; g.fillRect(-60, PIES - cy, W + 120, 6);
    // mesa vacía a la izquierda (decorado)
    const mx = MESA[0] - cx, my = MESA[1] - cy;
    this.mesa(g, mx - 340, my, false, false, t);
    // chorros y depósitos (por detrás de Marcos)
    const pot = this.potencia();
    conMat(g, e.mM, () => mochilaDetras(g));
    for (const [x, a] of [[-6, 0.32], [82, -0.32]]) {
      const q = aPant(e.mM, [x, 170]);
      const L = Math.min(this.largoChorro(q[1]), PIES - cy - q[1] + 10);
      chorroAbajo(g, q[0], q[1], -a, Math.max(20, L), pot, t);
    }
    // Guillermo sentado: detrás de la mesa
    const sentado = t > T_SUELTA + 0.2;
    if (sentado) pintarAvatar(g, e.mG, e.G, t);
    this.mesa(g, mx, my, t < T_CANA + 0.1, t < T_CANA + 0.35, t);
    if (!sentado) pintarAvatar(g, e.mG, e.G, t);
    pintarAvatar(g, e.mM, e.M, t);
    // gotas
    g.fillStyle = "rgba(170,225,255,.9)";
    for (const d of this.gotas) { g.beginPath(); g.ellipse(d.x, d.y, 3, 4.5, 0, 0, 6.283); g.fill(); }
    this.p.dibujar(g);
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    ono("¡CLIC!", 700, 300, T_BOTON, 0.5, 44, "#fffdf5", "#1b1b1b", 0.1);
    if (t > T_COGE - 0.1 && t < T_VUELA + 0.9) bocadillo(g, 290, 210, "¡AGÁRRATE!", 500, 160, tramo(t, T_COGE - 0.1, T_COGE + 0.15) * (1 - tramo(t, T_VUELA + 0.7, T_VUELA + 0.9)), 38);
    ono("¡AAAAAH!", 250, 440, T_VUELA + 0.3, 1.2, 56, "#fffdf5", "#3a1a00", -0.1);
    ono("¡YUJUUU!", 760, 470, T_VUELA + 2.3, 1.2, 56, "#ffd34d", "#3a1a00", 0.08);
    ono("¡PLOF!", 300, 400, T_SUELTA + 0.32, 0.6, 50, "#fffdf5", "#1b1b1b", -0.1);
    ono("¡CHIN!", 640, 300, T_CHIN, 1.0, 58, "#ffd34d", "#3a1a00", 0.06);
    // ¡A TODA PRESIÓN!
    const tit = (t0, t1, x, y, r) => {
      if (t < t0 || t > t1) return;
      const d = t - t0, k = tramo(d, 0, 0.16), s = lerp(2, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 9)), sal = tramo(t, t1 - 0.25, t1);
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - sal); g.translate(x + (d < 0.5 ? azar(-5, 5) : 0), y); g.rotate(r === rotulo2() ? 0.04 : 0); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    };
    tit(T_SUBE, T_VUELA + 1.4, 812, 190, rotulo2());
    tit(T_POSA + 0.1, DUR, 512, 84, rotulo());
    const a = Math.max(1 - tramo(t, 0.02, 0.5), tramo(t, T_FIN, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}
/** Vaso de agua con hielo y limón (unidades de avatar; base en (x, y)). */
function vasoAgua(g, x, y, t) {
  g.save(); g.translate(x, y);
  g.fillStyle = "rgba(190,230,255,.35)"; g.beginPath(); g.moveTo(-8, -26); g.lineTo(8, -26); g.lineTo(6.5, 0); g.lineTo(-6.5, 0); g.closePath(); g.fill();
  g.fillStyle = "rgba(150,210,255,.55)"; g.beginPath(); g.moveTo(-7.4, -18); g.lineTo(7.4, -18); g.lineTo(6.5, 0); g.lineTo(-6.5, 0); g.closePath(); g.fill();
  g.fillStyle = "rgba(255,255,255,.85)"; g.fillRect(-4, -16, 4, 4); g.fillRect(1, -12, 4, 4);
  g.fillStyle = "#f2e93a"; g.beginPath(); g.arc(6, -25, 4.5, Math.PI, 0); g.fill();
  g.strokeStyle = "rgba(235,248,255,.95)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-8, -26); g.lineTo(-6.5, 0); g.lineTo(6.5, 0); g.lineTo(8, -26); g.stroke();
  g.strokeStyle = "#ff3d84"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-2, -16); g.lineTo(-6, -34); g.stroke();
  g.restore();
  void t;
}

registrar({ id: "00240", nombre: "Mochila de agua", crear: () => new MochilaDeAgua() });
})();
