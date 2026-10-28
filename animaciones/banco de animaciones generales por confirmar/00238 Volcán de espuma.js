"use strict";
/*
 * 00238 · VOLCÁN DE ESPUMA
 *
 * Animación del banco. Empieza y acaba en negro.
 * Guillermo se asoma al cráter de un volcán… de cerveza. Retumba el suelo y ¡ERUPCIÓN!: sale un géiser de espuma
 * que lo lanza por los aires y una colada de cerveza ardiente baja por la ladera. Marcos, de bombero, la enfría con
 * la manguera (¡FSSS!, vapor y escarcha) y Guillermo cae del cielo sobre una tabla y baja surfeando la colada hasta
 * los pies de Marcos. Chocan esos cinco.
 */
(() => {
const CT = cacheTexto();
const ESC = 1.4, XM0 = 836, XM1 = 540, XGF = 300;           // Marcos y dónde acaba Guillermo
const VX = 512, VY = 214, VR = 70, VBASE = 548;              // volcán: cráter y base
const C0 = [494, 222], C1 = [420, 300], C2 = [356, 470], C3 = [XGF, PIES];   // la colada (curva de Bézier)
const T_RUM = 0.45, T_ERUP = 1.55, T_AGUA = 2.25, T_CIERRA = 3.55, T_VUELVE = 3.45, T_SURF = 3.75, T_LLEGA = 5.7,
  T_CAMINA = 6.0, T_CHOCA = 6.75, T_FIN = 8.25, DUR = 8.8;
const enAv = (m, q) => { const p = m.inverse().transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; };
const bez = (u) => {
  const v = 1 - u;
  return [v * v * v * C0[0] + 3 * v * v * u * C1[0] + 3 * v * u * u * C2[0] + u * u * u * C3[0],
    v * v * v * C0[1] + 3 * v * v * u * C1[1] + 3 * v * u * u * C2[1] + u * u * u * C3[1]];
};

function rotulo() {
  if (CT.has("t")) return CT.get("t");
  const c = lienzoNuevo(860, 210), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 40, 0, 170);
  gr.addColorStop(0, "#fff3b0"); gr.addColorStop(0.45, "#ffb020"); gr.addColorStop(1, "#ff4a1a");
  txt(g, "¡ERUPCIÓN!", 436, 168, { tam: 146, peso: 900, fam: FD, color: "#2a0a00", esp: 6, max: 820 });
  txt(g, "¡ERUPCIÓN!", 430, 160, { tam: 146, peso: 900, fam: FD, color: gr, borde: "#2a0a00", bordeAncho: 12, esp: 6, glow: "rgba(255,150,40,.85)", glowTam: 26, max: 820 });
  CT.set("t", c);
  return c;
}

/** Chorro de agua en arco de S a T. */
function chorro(g, S, T, alto, k, t) {
  const n = 24, pts = [];
  for (let i = 0; i <= n; i++) { const u = i / n; pts.push([lerp(S[0], T[0], u), lerp(S[1], T[1], u) - alto * 4 * u * (1 - u)]); }
  g.save(); g.lineCap = "round"; g.lineJoin = "round";
  g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
  g.strokeStyle = "rgba(90,170,255,.45)"; g.lineWidth = 18 * k; g.stroke();
  g.strokeStyle = "rgba(170,225,255,.85)"; g.lineWidth = 9 * k; g.stroke();
  g.setLineDash([14, 22]); g.lineDashOffset = -t * 600; g.strokeStyle = "rgba(255,255,255,.95)"; g.lineWidth = 3.5 * k; g.stroke();
  g.restore();
}
/** Tabla de surf (diseño propio) centrada en (x, y), girada ang, de largo L. */
function tabla(g, x, y, ang, L) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.fillStyle = "#1b5a7a"; g.beginPath(); g.ellipse(0, L * 0.035, L / 2, L * 0.1, 0, 0, 6.283); g.fill();
  const gr = g.createLinearGradient(0, -L * 0.1, 0, L * 0.1);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(1, "#b9e6f5");
  g.fillStyle = gr;
  g.beginPath(); g.ellipse(0, 0, L / 2, L * 0.1, 0, 0, 6.283); g.fill();
  g.strokeStyle = "#1b5a7a"; g.lineWidth = Math.max(1.5, L * 0.02); g.stroke();
  g.fillStyle = "#ff3d84"; g.fillRect(-L * 0.32, -L * 0.018, L * 0.64, L * 0.036);
  g.fillStyle = "#2fe3e8"; g.beginPath(); g.ellipse(L * 0.3, 0, L * 0.05, L * 0.035, 0, 0, 6.283); g.fill();
  g.restore();
}

class Volcan extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(460);
    this.gotas = [];                 // gotas de agua de la manguera
  }
  /** Hasta dónde ha bajado la colada (0–1) y cuánto se ha enfriado (0–1). */
  largo() { return eOut(tramo(this.t, T_ERUP + 0.25, T_ERUP + 1.7)); }
  frio() { return eInOut(tramo(this.t, T_AGUA + 0.25, T_CIERRA + 0.1)); }
  /** Dónde está Guillermo: { x, y, esc, giro, modo } */
  guillermo() {
    const t = this.t;
    if (t < T_ERUP) return { x: 466, y: VY - 4, esc: 0.62, giro: 0, modo: "borde" };
    if (t < T_VUELVE) {
      const u = tramo(t, T_ERUP, T_ERUP + 0.5);
      return { x: lerp(466, 400, u), y: lerp(VY - 4, -320, eOut(u)), esc: 0.62, giro: -u * 9, modo: "vuela" };
    }
    if (t < T_SURF) {
      const u = tramo(t, T_VUELVE, T_SURF);
      return { x: lerp(470, C0[0], u), y: lerp(-260, C0[1], eIn(u)), esc: 0.62, giro: lerp(-1.2, 0, u), modo: "cae" };
    }
    if (t < T_LLEGA) {
      const u = eInOut(tramo(t, T_SURF, T_LLEGA)) * 0.85 + tramo(t, T_SURF, T_LLEGA) * 0.15, q = bez(u);
      const q2 = bez(Math.min(1, u + 0.02)), q1 = bez(Math.max(0, u - 0.02));
      return { x: q[0], y: q[1], esc: lerp(0.62, ESC, eIn(u) * 0.4 + u * 0.6), giro: 0.12 * Math.sin(t * 5), modo: "surf", ang: Math.atan2(q2[1] - q1[1], q2[0] - q1[0]), u };
    }
    return { x: XGF, y: PIES, esc: ESC, giro: 0, modo: "fin" };
  }
  poses() {
    const t = this.t, Gs = this.guillermo();
    const G = { cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "bombero", cara: "sonrisa", rc: -0.05, piernaI: [0, 0], piernaD: [0, 0], manoD: [44, 124], manoI: [14, 114], brazoIDelante: true };
    let dyG = 0, xm = XM0, dyM = 0;
    // ---- Guillermo
    if (Gs.modo === "borde") {
      G.cara = "risa"; G.manoD = [84, 120]; G.manoI = [-12, 64 + 6 * Math.sin(t * 12)];   // saluda desde el cráter
      if (t > T_RUM) {
        const k = tramo(t, T_RUM, T_RUM + 0.2);
        G.cara = "sorpresa"; G.manoI = mezcla(G.manoI, [9, 150], k); G.manoD = [80, 96]; G.rc = 0.1 * Math.sin(t * 30);
        dyG = -3 * Math.abs(Math.sin(t * 26));
      }
    } else if (Gs.modo === "vuela" || Gs.modo === "cae") {
      G.cara = "sorpresa"; G.puntas = 1; G.manoD = [100, 40]; G.manoI = [-22, 40];
      const s = Math.sin(t * 20); G.piernaI = [-8, 0.3 * s]; G.piernaD = [-8, -0.3 * s];
    } else if (Gs.modo === "surf") {
      G.cara = Gs.u < 0.15 ? "sorpresa" : "risa"; G.puntas = 0.6;
      G.piernaI = [0, 0.26]; G.piernaD = [0, -0.26];
      const s = Math.sin(t * 7);
      G.manoD = [104, 100 + 14 * s]; G.manoI = [-26, 100 - 14 * s];
      if (Gs.u > 0.55) G.cara = "guino";
    } else {
      // aterriza, se baja de la tabla y choca la mano con Marcos
      const k = tramo(t, T_LLEGA, T_LLEGA + 0.3);
      G.cara = "risa"; G.puntas = 0.6 * (1 - k);
      G.manoD = [100, 60]; G.manoI = [-22, 60];
      dyG = -Math.sin(k * Math.PI) * 30;
      if (t > T_CAMINA) { G.manoD = [80, 110]; G.manoI = [9, 150]; G.cara = "risa"; }
    }
    // ---- Marcos
    if (t < T_RUM) { M.manoD = [67, 152]; M.manoI = [6, 152]; M.brazoIDelante = false; M.cara = "sonrisa"; M.rc = -0.08; }
    if (t >= T_RUM && t < T_AGUA - 0.3) {
      M.manoD = [67, 152]; M.manoI = [6, 152]; M.brazoIDelante = false; M.cara = "sorpresa"; M.rc = -0.14;
      dyM = -2 * Math.abs(Math.sin(t * 26)) * (t < T_ERUP + 0.6 ? 1 : 0);
      if (t > T_ERUP) { M.manoI = [-12, 60]; M.cara = "sorpresa"; }
    }
    if (t >= T_AGUA - 0.3 && t < T_CIERRA + 0.3) {
      const k = eOut(tramo(t, T_AGUA - 0.3, T_AGUA));
      M.manoD = mezcla([67, 152], [44, 120], k); M.manoI = mezcla([6, 152], [10, 106], k);
      M.cara = t > T_AGUA + 0.3 ? "guino" : "sorpresa"; M.rc = -0.1;
      dyM = t > T_AGUA && t < T_CIERRA ? -2 * Math.abs(Math.sin(t * 34)) : 0;
    }
    if (t >= T_CIERRA + 0.3) {
      M.manoD = [44, 120]; M.manoI = [10, 106]; M.cara = "sorpresa"; M.rc = -0.18;
      if (t > T_SURF + 0.6) { M.cara = "risa"; M.rc = -0.12; }
    }
    this.lanzaM = t < T_CAMINA;
    if (t >= T_CAMINA) {
      // suelta la manguera y va a chocar la mano
      const u = tramo(t, T_CAMINA, T_CHOCA - 0.15);
      xm = lerp(XM0, XM1, eInOut(u));
      if (u > 0 && u < 1) { const a = andar((t - T_CAMINA) * 13, 0.9); M.piernaI = a.piernaI; M.piernaD = a.piernaD; dyM = a.bote; }
      M.manoD = [67, 152]; M.manoI = [6, 152]; M.brazoIDelante = false; M.cara = "risa"; M.rc = -0.1;
    }
    const mG = matAv(Gs.x, Gs.y + dyG, Gs.esc, Gs.giro, 1, 1, Gs.modo === "vuela" || Gs.modo === "cae" ? [39, 140] : [39, 232]);
    const mM = matAv(xm, PIES + dyM, ESC);
    // ¡choca esos cinco!
    if (t > T_CHOCA - 0.35) {
      const P0 = [425, 300], ch = Math.max(0, 1 - Math.abs(t - T_CHOCA) * 6);
      const k = eOut(tramo(t, T_CHOCA - 0.35, T_CHOCA)), v = eInOut(tramo(t, T_CHOCA + 0.35, T_CHOCA + 0.7));
      const pg = enAv(mG, [P0[0] - 6 + 4 * ch, P0[1]]), pm = enAv(mM, [P0[0] + 6 - 4 * ch, P0[1]]);
      G.manoD = mezcla(mezcla([80, 110], pg, k), [96, 40], v); M.manoI = mezcla(mezcla([6, 152], pm, k), [-24, 40], v); M.brazoIDelante = true;
      G.cara = "risa"; M.cara = "risa";
      if (t > T_CHOCA + 0.7) { G.cara = "guino"; dyG = -Math.abs(Math.sin(t * 7)) * 6; }
    }
    return { G, M, mG: dyG ? matAv(Gs.x, Gs.y + dyG, Gs.esc, Gs.giro) : mG, mM, Gs, xm };
  }
  /** Punta de la lanza de Marcos y hacia dónde apunta el chorro. */
  lanza(e) {
    const a = aPant(e.mM, e.M._manoI || e.M.manoI);
    return { S: [a[0] - 16, a[1] - 10], T: bez(0.3) };
  }

  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    // retumba: burbujas en el cráter
    if (t > T_RUM && t < T_ERUP && Math.random() < 14 * dt) p.nueva(P.ESPUMA, VX + azar(-50, 50), VY - 4, azar(-40, 40), azar(-200, -80), azar(0.4, 0.8), azar(5, 10));
    if (t > T_RUM && t < T_ERUP) { this.una("r1", true, () => temblar(5, 1.1)); }
    this.una("erup", t > T_ERUP, () => {
      temblar(22, 0.7);
      p.nueva(P.DESTELLO, VX, VY - 30, 0, 0, 0.4, 260);
      for (let i = 0; i < 90; i++) p.nueva(P.ESPUMA, VX + azar(-40, 40), VY - 10, azar(-260, 260), azar(-900, -380), azar(0.9, 1.6), azar(8, 18));
      for (let i = 0; i < 40; i++) p.nueva(P.GOTA, VX + azar(-30, 30), VY - 10, azar(-300, 300), azar(-800, -300), azar(0.8, 1.3), azar(4, 7));
    });
    // el géiser sigue echando espuma un rato
    if (t > T_ERUP && t < T_ERUP + 1.3 && Math.random() < 40 * dt) p.nueva(P.ESPUMA, VX + azar(-30, 30), VY - 10, azar(-200, 200), azar(-700, -300), azar(0.8, 1.3), azar(7, 14));
    // agua de la manguera
    const e = this.poses();
    const chorro = t > T_AGUA && t < T_CIERRA;
    if (chorro) {
      const L = this.lanza(e);
      for (let i = 0; i < 2; i++) this.gotas.push({ x: L.T[0] + azar(-20, 20), y: L.T[1] + azar(-10, 10), vx: azar(-120, 120), vy: azar(-260, -80), v: azar(0.3, 0.6) });
      if (Math.random() < 30 * dt) p.nueva(P.VAPOR, L.T[0] + azar(-40, 40), L.T[1] + azar(-20, 10), azar(-40, 40), azar(-120, -50), azar(0.8, 1.3), azar(30, 50));
      // escarcha
      if (Math.random() < 10 * dt) p.nueva(P.PURPURINA, L.T[0] + azar(-90, 90), L.T[1] + azar(-60, 60), 0, azar(-20, 20), azar(0.6, 1), azar(10, 16));
    }
    for (const d of this.gotas) { d.v -= dt; d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; }
    this.gotas = this.gotas.filter((d) => d.v > 0);
    // surf: estela de espuma
    if (t > T_SURF && t < T_LLEGA && Math.random() < 40 * dt) {
      const Gs = e.Gs;
      p.nueva(P.ESPUMA, Gs.x + azar(-30, 30) * Gs.esc, Gs.y, azar(-150, 150), azar(-260, -80), azar(0.4, 0.8), azar(5, 10) * Gs.esc);
    }
    this.una("cae", t > T_SURF, () => { temblar(8, 0.25); for (let i = 0; i < 20; i++) p.nueva(P.ESPUMA, C0[0] + azar(-20, 20), C0[1], azar(-200, 200), azar(-300, -100), azar(0.5, 0.9), azar(5, 9)); });
    this.una("llega", t > T_LLEGA, () => {
      temblar(14, 0.4);
      for (let i = 0; i < 60; i++) { const a = azar(-Math.PI, 0), v = azar(150, 520); p.nueva(P.ESPUMA, XGF + azar(-60, 60), PIES - 6, Math.cos(a) * v, Math.sin(a) * v, azar(0.6, 1.1), azar(7, 14)); }
      for (let i = 0; i < 40; i++) p.nueva(P.CONFETI, azar(60, 960), azar(-60, -10), azar(-40, 40), azar(30, 140), azar(2, 3), azar(9, 14), i % 5);
    });
    this.una("choca", t > T_CHOCA, () => {
      temblar(10, 0.3);
      p.nueva(P.DESTELLO, 425, 300, 0, 0, 0.3, 160);
      for (let i = 0; i < 16; i++) { const a = azar(0, 6.283), v = azar(120, 320); p.nueva(P.CHISPA, 425, 300, Math.cos(a) * v, Math.sin(a) * v, azar(0.3, 0.6), azar(5, 8)); }
    });
    p.suelo = () => PIES;
    p.actualizar(dt);
  }

  fondoC() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gc = g.createLinearGradient(0, -60, 0, VBASE);
    gc.addColorStop(0, "#1a1240"); gc.addColorStop(0.55, "#7a3a6a"); gc.addColorStop(1, "#ff8a4a");
    g.fillStyle = gc; g.fillRect(-60, -60, W + 120, H + 120);
    const r = semilla(9);
    g.fillStyle = "#fff8e0";
    for (let i = 0; i < 60; i++) { const x = r() * W, y = r() * 220 - 40; g.globalAlpha = 0.3 + r() * 0.6; g.fillRect(x, y, 2, 2); }
    g.globalAlpha = 1;
    // montañas lejanas
    g.fillStyle = "#4a2a4a";
    g.beginPath(); g.moveTo(-60, VBASE);
    for (let x = -60; x <= W + 60; x += 40) g.lineTo(x, 430 + Math.sin(x * 0.011) * 40 + Math.sin(x * 0.027) * 16);
    g.lineTo(W + 60, VBASE); g.closePath(); g.fill();
    // suelo
    const gs = g.createLinearGradient(0, VBASE, 0, H);
    gs.addColorStop(0, "#5a3a2a"); gs.addColorStop(1, "#2a1810");
    g.fillStyle = gs; g.fillRect(-60, VBASE - 4, W + 120, H);
    g.fillStyle = "rgba(0,0,0,.25)";
    for (let i = 0; i < 30; i++) { g.beginPath(); g.ellipse(r() * W, VBASE + 10 + r() * 50, 6 + r() * 14, 2 + r() * 3, 0, 0, 6.283); g.fill(); }
    // el volcán
    g.beginPath();
    g.moveTo(110, VBASE + 6);
    g.bezierCurveTo(260, 470, 380, 330, VX - VR, VY);
    g.lineTo(VX + VR, VY);
    g.bezierCurveTo(640, 330, 760, 470, 914, VBASE + 6);
    g.closePath();
    const gv = g.createLinearGradient(0, VY, 0, VBASE);
    gv.addColorStop(0, "#8a4a2a"); gv.addColorStop(1, "#4a2418");
    g.fillStyle = gv; g.fill();
    g.strokeStyle = "#2a120a"; g.lineWidth = 4; g.stroke();
    // vetas
    g.strokeStyle = "rgba(255,190,90,.18)"; g.lineWidth = 6; g.lineCap = "round";
    for (const [x0, x1] of [[470, 300], [560, 700], [540, 610], [480, 420]]) { g.beginPath(); g.moveTo(x0, VY + 30); g.quadraticCurveTo((x0 + x1) / 2 + 20, 380, x1, VBASE - 20); g.stroke(); }
    // luz lateral
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.25; g.drawImage(BLOB.naranja, 560, 260, 360, 300); g.restore();
    return (this.cF = c);
  }
  /** Cráter: cerveza borboteando (caliente o fría) y su borde. */
  crater(g, t, frio) {
    g.save();
    g.beginPath(); g.ellipse(VX, VY, VR, 17, 0, 0, 6.283); g.clip();
    const gr = g.createLinearGradient(0, VY - 17, 0, VY + 17);
    gr.addColorStop(0, frio > 0.5 ? "#ffd84a" : "#ffe27a"); gr.addColorStop(1, frio > 0.5 ? "#c46a00" : "#ff5a1a");
    g.fillStyle = gr; g.fillRect(VX - VR, VY - 17, VR * 2, 34);
    g.fillStyle = "#fffaf0";
    for (let i = 0; i < 7; i++) { const x = VX - 56 + i * 19, y = VY - 6 + Math.sin(t * 9 + i) * 3; g.beginPath(); g.arc(x, y, 9 + 2 * Math.sin(t * 7 + i * 2), 0, 6.283); g.fill(); }
    g.restore();
    g.strokeStyle = "#2a120a"; g.lineWidth = 5; g.beginPath(); g.ellipse(VX, VY, VR, 17, 0, 0, 6.283); g.stroke();
    if (frio > 0.05) {
      // escarcha en el borde
      g.strokeStyle = `rgba(220,245,255,${0.9 * frio})`; g.lineWidth = 6;
      g.beginPath(); g.ellipse(VX, VY + 2, VR + 2, 18, 0, 0.1, Math.PI - 0.1); g.stroke();
      g.fillStyle = `rgba(220,245,255,${0.9 * frio})`;
      for (let i = 0; i < 6; i++) { const x = VX - 50 + i * 20; g.beginPath(); g.moveTo(x - 4, VY + 16); g.lineTo(x + 4, VY + 16); g.lineTo(x, VY + 16 + 10 * frio * (1 + (i % 2))); g.closePath(); g.fill(); }
    }
  }
  /** La colada: banda que baja por la ladera (de 0 a L), caliente o fría. */
  colada(g, L, frio, t) {
    if (L <= 0.01) return;
    const N = 26, izq = [], der = [];
    for (let i = 0; i <= N; i++) {
      const u = (i / N) * L, q = bez(u), q2 = bez(Math.min(1, u + 0.01)), q1 = bez(Math.max(0, u - 0.01));
      const a = Math.atan2(q2[1] - q1[1], q2[0] - q1[0]), w = lerp(26, 92, u * u) * (1 + 0.06 * Math.sin(u * 30 - t * 6));
      izq.push([q[0] + Math.cos(a + Math.PI / 2) * w, q[1] + Math.sin(a + Math.PI / 2) * w * 0.6]);
      der.push([q[0] - Math.cos(a + Math.PI / 2) * w, q[1] - Math.sin(a + Math.PI / 2) * w * 0.6]);
    }
    // charco al pie
    const charco = tramo(L, 0.92, 1);
    if (charco > 0) {
      g.fillStyle = frio > 0.5 ? "#e8a21a" : "#ff7a1a";
      g.beginPath(); g.ellipse(C3[0], C3[1] - 2, 150 * charco, 22 * charco, 0, 0, 6.283); g.fill();
    }
    g.beginPath();
    izq.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
    for (let i = der.length - 1; i >= 0; i--) g.lineTo(der[i][0], der[i][1]);
    g.closePath();
    const gr = g.createLinearGradient(0, C0[1], 0, C3[1]);
    const cal = ["#fff07a", "#ff9a1a", "#e8401a"], fri = ["#ffe7a0", "#ffc21f", "#c47a00"];
    const col = (i) => { const a = cal[i], b = fri[i]; const ca = [1, 3, 5].map((k) => parseInt(a.slice(k, k + 2), 16)), cb = [1, 3, 5].map((k) => parseInt(b.slice(k, k + 2), 16)); return `rgb(${ca.map((v, j) => Math.round(lerp(v, cb[j], frio))).join(",")})`; };
    gr.addColorStop(0, col(0)); gr.addColorStop(0.5, col(1)); gr.addColorStop(1, col(2));
    g.fillStyle = gr; g.fill();
    // brillo caliente
    if (frio < 0.95) {
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.45 * (1 - frio);
      for (let i = 0; i <= N; i += 4) { const q = bez((i / N) * L); g.drawImage(BLOB.naranja, q[0] - 80, q[1] - 60, 160, 120); }
      g.restore();
    }
    // reflejos y espuma en los bordes
    g.fillStyle = "rgba(255,255,255,.35)";
    for (let i = 2; i < N; i += 3) { const q = bez((i / N) * L); g.beginPath(); g.ellipse(q[0] + 6, q[1] - 4, 10 + i, 3, -0.6, 0, 6.283); g.fill(); }
    g.fillStyle = "#fffaf0";
    for (let i = 0; i <= N; i++) {
      const r = 5 + 5 * (i / N) * (1 + 0.3 * Math.sin(i * 1.7 + t * 5));
      for (const p of [izq[i], der[i]]) { g.beginPath(); g.arc(p[0], p[1], r, 0, 6.283); g.fill(); }
    }
    // frente de la colada (mientras baja)
    if (L < 0.97) {
      const f = bez(L), w = lerp(26, 92, L * L);
      for (let i = 0; i < 7; i++) { const a = (i / 6) * Math.PI, r = w * (0.16 + 0.06 * Math.sin(i * 2.3 + t * 9)); g.beginPath(); g.arc(f[0] + Math.cos(a) * w * 0.5, f[1] + Math.sin(a) * w * 0.25, r, 0, 6.283); g.fill(); }
    }
  }

  dibujar(g) {
    const t = this.t, e = this.poses(), frio = this.frio();
    fondo(g, "#000");
    g.drawImage(this.fondoC(), -60, -60);
    // géiser de espuma
    if (t > T_ERUP && t < T_ERUP + 1.5) {
      const k = eOut(tramo(t, T_ERUP, T_ERUP + 0.2)) * (1 - eIn(tramo(t, T_ERUP + 0.8, T_ERUP + 1.5)));
      const top = lerp(VY, -80, k);
      const gg = g.createLinearGradient(VX - 50, 0, VX + 50, 0);
      gg.addColorStop(0, "#f2d08a"); gg.addColorStop(0.5, "#ffffff"); gg.addColorStop(1, "#e8c070");
      g.fillStyle = gg;
      g.beginPath(); g.moveTo(VX - 44, VY);
      for (let y = VY; y >= top; y -= 20) g.lineTo(VX - 34 - 10 * Math.sin(y * 0.05 + t * 14), y);
      for (let y = top; y <= VY; y += 20) g.lineTo(VX + 34 + 10 * Math.sin(y * 0.05 + t * 14 + 1), y);
      g.lineTo(VX + 44, VY); g.closePath(); g.fill();
      g.fillStyle = "#ffffff";
      for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(VX + Math.sin(i * 2.1 + t * 6) * 40, top + i * 8, 34 - i * 3, 0, 6.283); g.fill(); }
    }
    this.crater(g, t, frio);
    this.colada(g, this.largo(), frio, t);
    // Guillermo (con su tabla)
    const Gs = e.Gs;
    if (Gs.modo === "surf") tabla(g, Gs.x, Gs.y - 2 * Gs.esc, -0.22 + 0.06 * Math.sin(t * 5), 130 * Gs.esc);
    else if (Gs.modo === "cae") tabla(g, Gs.x, Gs.y + 4, -0.6 + tramo(t, T_VUELVE, T_SURF) * 0.6, 120 * Gs.esc);
    else if (Gs.modo === "fin") {
      // la clava en la arena a su lado
      const k = eOut(tramo(t, T_LLEGA, T_LLEGA + 0.35));
      tabla(g, lerp(XGF, XGF - 112, k), lerp(PIES - 4, PIES - 70, k), lerp(-0.22, -1.48, k), lerp(130 * ESC, 160, k));
    }
    pintarAvatar(g, e.mG, e.G, t);
    // manguera de Marcos
    const L = this.lanza(e);
    if (this.lanzaM) {
      g.strokeStyle = "#b8201a"; g.lineWidth = 11; g.lineCap = "round";
      g.beginPath(); g.moveTo(W + 40, 590); g.bezierCurveTo(900, 600, 720, 560, L.S[0] + 18, L.S[1] + 22); g.stroke();
      g.strokeStyle = "rgba(255,255,255,.25)"; g.lineWidth = 3; g.stroke();
    } else {
      g.strokeStyle = "#b8201a"; g.lineWidth = 11; g.lineCap = "round";
      g.beginPath(); g.moveTo(W + 40, 590); g.bezierCurveTo(950, 600, 900, 580, 840, 586); g.stroke();
    }
    pintarAvatar(g, e.mM, e.M, t);
    if (this.lanzaM) {
      // lanza
      const a = Math.atan2(L.T[1] - L.S[1], L.T[0] - L.S[0]);
      g.save(); g.translate(L.S[0] + 12, L.S[1] + 14); g.rotate(a);
      const gl = g.createLinearGradient(0, -7, 0, 7); gl.addColorStop(0, "#fff0a0"); gl.addColorStop(0.5, "#d9a516"); gl.addColorStop(1, "#7a5200");
      g.fillStyle = gl; g.beginPath(); g.moveTo(-14, -8); g.lineTo(18, -5); g.lineTo(18, 5); g.lineTo(-14, 8); g.closePath(); g.fill();
      g.fillStyle = "#1b1b1d"; g.fillRect(-20, -9, 8, 18);
      g.restore();
    }
    // chorro de agua
    if (t > T_AGUA && t < T_CIERRA + 0.15) {
      const k = tramo(t, T_AGUA, T_AGUA + 0.2) * (1 - tramo(t, T_CIERRA, T_CIERRA + 0.15));
      chorro(g, [L.S[0] + 4, L.S[1] + 4], L.T, 120, k, t);
    }
    g.fillStyle = "rgba(170,225,255,.9)";
    for (const d of this.gotas) { g.beginPath(); g.ellipse(d.x, d.y, 3, 4.5, 0, 0, 6.283); g.fill(); }
    this.p.dibujar(g);
    // onomatopeyas
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const k = eBack(tramo(d, 0, 0.12));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    ono("¡BRRRUM!", 250, 300, T_RUM + 0.1, 1.0, 54, "#fffdf5", "#3a1a00", -0.1);
    ono("¡FSSSSS!", 660, 260, T_AGUA + 0.3, 1.0, 54, "#e8f6ff", "#123048", 0.08);
    ono("¡YUJUUU!", 230, 250, T_SURF + 0.4, 1.1, 56, "#ffd34d", "#3a1a00", -0.1);
    ono("¡CHÓCALA!", 640, 210, T_CHOCA, 1.0, 50, "#fffdf5", "#1b1b1b", 0.06);
    // ¡ERUPCIÓN! (en la erupción y otra vez al final)
    const tit = (t0, t1, y) => {
      if (t < t0 || t > t1) return;
      const d = t - t0, k = tramo(d, 0, 0.16), s = lerp(2.2, 1, eIn(k)) * (1 + 0.025 * Math.sin(d * 9)), sal = tramo(t, t1 - 0.25, t1);
      const r = rotulo();
      g.save(); g.globalAlpha = Math.min(1, k * 3) * (1 - sal); g.translate(512 + (d < 0.6 ? azar(-6, 6) : 0), y + (d < 0.6 ? azar(-4, 4) : 0)); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
    };
    tit(T_ERUP, T_SURF - 0.1, 96);
    tit(T_LLEGA, DUR, 96);
    const a = Math.max(1 - tramo(t, 0.02, 0.45), tramo(t, T_FIN, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00238", nombre: "Volcán de espuma", crear: () => new Volcan() });
})();
