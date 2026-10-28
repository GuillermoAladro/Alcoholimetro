"use strict";
/*
 * 00214 · SIMULACRO
 *
 * Animación del banco. Empieza y acaba en negro.
 * Simulacro de evacuación en el bar: bajan las luces, se encienden las flechas verdes hacia la SALIDA y Marcos, con
 * chaleco y megáfono, avisa con calma: ¡ES UN SIMULACRO! Guillermo asiente, tranquilo… y antes de salir coge la jarra,
 * el plato de la tapa y se pone el taburete en la cabeza. Cruza el bar en orden, siguiendo las flechas, mientras
 * Marcos se lleva la mano a la frente y lo repite por el megáfono. Guillermo sale guiñando un ojo y la puerta se cierra.
 */
(() => {
const ESC = 1.35;
const XM = 520, XG0 = 812;
const PIES_M = 546, ESC_M = 1.24;                 // Marcos, un poco más al fondo
const PUERTA = { x0: 46, x1: 196, y0: 206, y1: 540 };
const SUELO = 536;                                // donde empieza el suelo (al fondo)
const T_LUZ = 0.75, T_AVISO = 1.05, T_ASIENTE = 2.75, T_JARRA = 3.0, T_TAPA = 3.45, T_TABURETE = 3.95, T_ANDA = 4.55;
const T_CRUZA = 5.55, T_AVISO2 = 6.95, T_PUERTA = 7.6, T_ENTRA = 8.2, T_CIERRA = 9.0, T_FIN = 9.95, DUR = 10.45;
const XG_PUERTA = 122;
const CT = cacheTexto();
const VERDE = "#2bff5b";

/** Chaleco reflectante (coordenadas de Marcos). */
function chaleco(g) {
  g.save();
  const gr = g.createLinearGradient(8, 0, 66, 0);
  gr.addColorStop(0, "#b8e000"); gr.addColorStop(0.5, "#e6ff3a"); gr.addColorStop(1, "#a8d000");
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(12, 86); g.lineTo(28, 80); g.lineTo(37, 104); g.lineTo(46, 80); g.lineTo(62, 86); g.lineTo(62, 140); g.lineTo(12, 140); g.closePath(); g.fill();
  g.strokeStyle = "#7a9a00"; g.lineWidth = 1; g.stroke();
  g.fillStyle = "#e6ebef"; g.fillRect(12, 116, 50, 5); g.fillRect(12, 128, 50, 5);
  g.fillStyle = "#e6ebef"; g.fillRect(19, 84, 4, 32); g.fillRect(51, 84, 4, 32);
  g.fillStyle = "#2a2a2e"; g.fillRect(36, 104, 2, 36);
  g.restore();
}
/** Megáfono: la boquilla en (x, y), la bocina hacia `ang`. */
function megafono(g, x, y, ang, s = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  g.fillStyle = "#2a2a2e"; rectR(g, -4, -4, 10, 8, 2); g.fill();
  const gr = g.createLinearGradient(0, -14, 0, 14); gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#d8dde2"); gr.addColorStop(1, "#8a949e");
  g.fillStyle = gr; g.beginPath(); g.moveTo(5, -5); g.lineTo(34, -15); g.lineTo(34, 15); g.lineTo(5, 5); g.closePath(); g.fill();
  g.fillStyle = "#d8261c"; g.fillRect(14, -9, 6, 18);
  g.fillStyle = "#ffcf3a"; g.beginPath(); g.ellipse(34, 0, 3.5, 15, 0, 0, 6.283); g.fill();
  g.fillStyle = "#3a3f46"; g.fillRect(8, 4, 5, 12);
  g.restore();
}
/** Taburete de bar boca abajo; (x, y) = el centro del asiento (apoyado en la cabeza). */
function taburete(g, x, y, s, ang) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  g.lineCap = "round";
  for (const [w, col] of [[7, "#3a3f46"], [4, "#d8dde2"]]) {
    g.strokeStyle = col; g.lineWidth = w;
    for (const [a, b] of [[-26, -34], [26, 34], [-10, -12], [10, 12]]) { g.beginPath(); g.moveTo(a, -4); g.lineTo(b, -96); g.stroke(); }
    g.lineWidth = w - 1; g.beginPath(); g.ellipse(0, -62, 30, 6, 0, 0, 6.283); g.stroke();
  }
  const gr = g.createLinearGradient(0, -10, 0, 8); gr.addColorStop(0, "#7a2a14"); gr.addColorStop(1, "#c0482a");
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 36, 10, 0, 0, 6.283); g.fill();
  g.fillStyle = "#e05a3a"; g.beginPath(); g.ellipse(0, 3, 36, 8, 0, 0, Math.PI); g.fill();
  g.restore();
}
/** Plato con la tapa (pincho de tortilla); (x, y) = la mano (debajo del plato). */
function platoTapa(g, x, y) {
  g.save(); g.translate(x, y);
  g.fillStyle = "#e9edf0"; g.beginPath(); g.ellipse(0, -2, 22, 5, 0, 0, 6.283); g.fill();
  g.strokeStyle = "#9aa4ad"; g.lineWidth = 1; g.stroke();
  g.fillStyle = "#f2c84a"; g.beginPath(); g.moveTo(-12, -4); g.lineTo(12, -4); g.lineTo(9, -16); g.lineTo(-9, -16); g.closePath(); g.fill();
  g.fillStyle = "#e0a830"; g.fillRect(-12, -6, 24, 2);
  g.strokeStyle = "#a07040"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, -16); g.lineTo(0, -26); g.stroke();
  g.fillStyle = "#c8a070"; g.beginPath(); g.arc(0, -16, 4, Math.PI, 0); g.fill();
  g.restore();
}

class Simulacro extends Escena {
  constructor() {
    super(DUR);
    this.p = new Parts(200);
    this.p.suelo = () => PIES + 4;
  }
  modo(t) { return tramo(t, T_LUZ, T_LUZ + 0.3); }
  /** x de Guillermo y si anda. */
  xg(t) {
    if (t < T_ANDA) return { x: XG0, anda: false };
    if (t < T_PUERTA) return { x: lerp(XG0, XG_PUERTA, tramo(t, T_ANDA, T_PUERTA)), anda: true };
    return { x: XG_PUERTA, anda: t > T_ENTRA && t < T_CIERRA - 0.2 };
  }
  poses() {
    const t = this.t;
    const G = { cara: "risa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [70, 158], manoI: [9, 160] };
    const M = { quien: "bombero", cara: "sonrisa", rc: 0, piernaI: [0, 0], piernaD: [0, 0], manoD: [67, 152], manoI: [6, 152] };
    // ---------------- Marcos (megáfono en la izquierda)
    let meg = { mano: [10, 132], ang: 1.9, enBoca: false };
    const hablar = (t0, t1) => t > t0 && t < t1;
    if (hablar(T_AVISO - 0.25, T_ASIENTE) || hablar(T_AVISO2 - 0.25, T_AVISO2 + 1.25)) {
      const t0 = t < T_ASIENTE ? T_AVISO - 0.25 : T_AVISO2 - 0.25, t1 = t < T_ASIENTE ? T_ASIENTE : T_AVISO2 + 1.25;
      const k = eInOut(tramo(t, t0, t0 + 0.25)) * (1 - eInOut(tramo(t, t1 - 0.25, t1)));
      M.brazoIDelante = true; M.manoI = mezcla([10, 132], [14, 64], k);
      meg = { mano: M.manoI, ang: lerp(1.9, Math.PI + 0.25, k), enBoca: k > 0.6 };
      M.cara = k > 0.6 ? (Math.floor(t * 6) % 2 ? "risa" : "sonrisa") : "sonrisa"; M.rc = 0.06;
      // con la derecha señala la salida (y la segunda vez, se lleva la mano a la frente)
      if (t < T_ASIENTE) { M.manoD = [74, 140]; }
      else { M.manoD = mezcla([67, 152], [48, 30], k); M.cara = k > 0.6 ? "sorpresa" : "dormido"; }
    } else if (t < T_AVISO2) {
      M.manoI = [10, 132]; M.brazoIDelante = true;
      M.cara = t < T_TABURETE ? "sonrisa" : "sorpresa";
      M.rc = t > T_ASIENTE ? 0.14 : 0;
      if (t > T_TABURETE) M.puntas = 0.3;
      if (t > T_CRUZA - 0.3 && t < T_AVISO2) { M.rc = -0.12; M.cara = Math.floor(t * 3) % 2 ? "sorpresa" : "dormido"; }
    } else {
      // le ve salir: se ríe y da el visto bueno
      M.manoI = [10, 132]; M.brazoIDelante = true;
      M.cara = t < T_CIERRA ? "risa" : "guino"; M.rc = -0.12;
      if (t > T_ENTRA) { const k = eOut(tramo(t, T_ENTRA, T_ENTRA + 0.3)); M.manoD = mezcla([67, 152], [84, 66], k); }
    }
    M.objD = (g) => chaleco(g);
    // ---------------- Guillermo
    const X = this.xg(t);
    let yg = PIES, esc = ESC;
    let lleva = { jarra: t > T_JARRA, tapa: t > T_TAPA, taburete: t > T_TABURETE };
    if (t < T_ASIENTE) {
      // en la barra, picando
      G.cara = t < T_LUZ ? "risa" : t < T_AVISO + 0.3 ? "sorpresa" : "sonrisa"; G.rc = t > T_AVISO ? -0.12 : 0.05;
      G.manoD = [76 + 2 * Math.sin(t * 6), 118];
      if (t < T_LUZ) { const b = boca(0); G.manoD = mezcla([76, 118], [b[0] + 8, b[1] + 6], Math.max(0, Math.sin(t * 5))); }
    } else if (t < T_ANDA) {
      G.cara = t < T_JARRA ? "sonrisa" : "guino"; G.rc = t < T_JARRA ? -0.12 * Math.sin((t - T_ASIENTE) * 18) : 0.04;
      // coge las cosas, una a una
      const kJ = eInOut(tramo(t, T_JARRA - 0.2, T_JARRA)), kT = eInOut(tramo(t, T_TAPA - 0.2, T_TAPA)), kB = eInOut(tramo(t, T_TABURETE - 0.35, T_TABURETE));
      G.manoD = mezcla([96, 150], [76, 118], kJ);
      G.manoI = mezcla([-16, 150], [-12, 96], kT);
      if (kB > 0 && kB < 1) { G.manoI = mezcla([-12, 96], [8, 18], Math.sin(Math.PI * kB)); G.brazoIDelante = true; }
      G.cara = t > T_TABURETE ? "guino" : G.cara;
    } else {
      // en orden, con calma
      G.cara = Math.floor(t * 1.2) % 3 === 2 ? "guino" : "sonrisa"; G.rc = 0.05 * Math.sin(t * 3);
      G.manoD = [76, 118]; G.manoI = [-12, 96];
      if (X.anda) { const a = andar((t - T_ANDA) * 7, 0.7); G.piernaI = a.piernaI; G.piernaD = a.piernaD; yg += a.bote * 0.6; }
      if (t > T_PUERTA - 0.2 && t < T_ENTRA) { G.cara = "guino"; G.rc = -0.08; }
      if (t > T_ENTRA) {
        // cruza la puerta: se aleja
        const u = tramo(t, T_ENTRA, T_CIERRA - 0.2);
        esc = lerp(ESC, ESC * 0.82, u); yg = lerp(PIES, PIES - 30, u);
      }
    }
    if (lleva.jarra) G.jarra = { inc: -0.08, nivel: 0.7 };
    if (lleva.tapa) G.objI2 = (g, mano) => platoTapa(g, mano[0], mano[1] - 4);
    const mM = matAv(XM, PIES_M, ESC_M), mG = matAv(X.x, yg, esc);
    return { G, M, mG, mM, meg, lleva, esc };
  }
  actualizar(dt) {
    const t = (this.t += dt), p = this.p;
    for (const [k, t0] of [["j", T_JARRA], ["t", T_TAPA], ["b", T_TABURETE]]) this.una(k, t > t0, () => {
      const e = this.poses(), c = aPant(e.mG, k === "b" ? [39, -10] : k === "j" ? [86, 110] : [-12, 86]);
      for (let i = 0; i < 6; i++) p.nueva(P.PURPURINA, c[0] + azar(-20, 20), c[1] + azar(-20, 10), azar(-40, 40), azar(-60, -10), azar(0.6, 1), azar(10, 16));
    });
    this.una("cierra", t > T_CIERRA, () => temblar(5, 0.15));
    p.actualizar(dt);
  }
  // ------------------------------------------------------------------ dibujo
  fondoFijo() {
    if (this.cF) return this.cF;
    const c = lienzoNuevo(W + 120, H + 120), g = c.getContext("2d");
    g.translate(60, 60);
    const gp = g.createLinearGradient(0, -60, 0, 470);
    gp.addColorStop(0, "#2a1810"); gp.addColorStop(1, "#5e3420");
    g.fillStyle = gp; g.fillRect(-60, -60, W + 120, 600);
    g.fillStyle = "#1a0e08"; g.fillRect(-60, -60, W + 120, 60);
    // estantería y barra (derecha)
    const cols = ["#2f7a3a", "#8a3b16", "#3b5d9a", "#b08a1a", "#8a1e4a"];
    const r = semilla(9);
    for (const yb of [150, 240]) {
      g.fillStyle = "#7a4a22"; g.fillRect(600, yb, 400, 8);
      for (let x = 618; x < 990; x += 26 + r() * 6) { const alto = 36 + r() * 22; g.fillStyle = cols[(r() * cols.length) | 0]; rectR(g, x - 8, yb - alto, 16, alto, 4); g.fill(); g.fillRect(x - 3, yb - alto - 12, 6, 13); }
    }
    g.fillStyle = "#3a1e0c"; g.fillRect(600, 452, W + 60 - 600, SUELO - 452);
    const gb = g.createLinearGradient(0, 440, 0, 458); gb.addColorStop(0, "#b07a40"); gb.addColorStop(1, "#5a3414");
    g.fillStyle = gb; g.fillRect(590, 440, W + 70 - 590, 16);
    // friso
    const gm = g.createLinearGradient(0, 390, 0, PIES); gm.addColorStop(0, "#5a3218"); gm.addColorStop(1, "#2e170a");
    g.fillStyle = gm; g.fillRect(-60, 420, 650, SUELO - 420);
    g.fillStyle = "#7a4a26"; g.fillRect(-60, 414, 650, 8);
    // puerta de salida
    const P_ = PUERTA;
    g.fillStyle = "#1a1210"; g.fillRect(P_.x0 - 12, P_.y0 - 12, P_.x1 - P_.x0 + 24, P_.y1 - P_.y0 + 12);
    const gs2 = g.createLinearGradient(0, P_.y0, 0, P_.y1); gs2.addColorStop(0, "#cfeede"); gs2.addColorStop(1, "#7ab89a");
    g.fillStyle = gs2; g.fillRect(P_.x0, P_.y0, P_.x1 - P_.x0, P_.y1 - P_.y0);
    g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(P_.x0, P_.y1 - 70, P_.x1 - P_.x0, 70);
    // suelo
    const gs = g.createLinearGradient(0, SUELO, 0, H + 60); gs.addColorStop(0, "#3a2010"); gs.addColorStop(1, "#1a0c04");
    g.fillStyle = gs; g.fillRect(-60, SUELO, W + 120, H + 60 - SUELO);
    g.fillStyle = "rgba(255,210,150,.15)"; g.fillRect(-60, SUELO, W + 120, 2);
    g.fillStyle = "rgba(0,0,0,.18)"; for (let x = -60; x < W + 60; x += 90) { g.beginPath(); g.moveTo(x, SUELO); g.lineTo(x + 40, SUELO); g.lineTo(x + 60 + (x - 512) * 0.15, H + 60); g.lineTo(x + 20 + (x - 512) * 0.15, H + 60); g.closePath(); g.fill(); }
    return (this.cF = c);
  }
  cartel(g, k) {
    const P_ = PUERTA, cx = (P_.x0 + P_.x1) / 2;
    g.save();
    if (k > 0) { g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.6 * k; g.drawImage(BLOB.verde, cx - 120, 90, 240, 140); g.globalCompositeOperation = "source-over"; g.globalAlpha = 1; }
    g.fillStyle = k > 0.5 ? "#0e8a2e" : "#0a4a1a"; rectR(g, cx - 92, 128, 184, 56, 8); g.fill();
    g.strokeStyle = "#e9ffe9"; g.lineWidth = 3; rectR(g, cx - 86, 134, 172, 44, 6); g.stroke();
    txt(g, "SALIDA", cx + 20, 168, { tam: 34, peso: 900, fam: FD, color: "#ffffff", esp: 4 });
    g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(cx - 76, 156); g.lineTo(cx - 56, 142); g.lineTo(cx - 56, 150); g.lineTo(cx - 40, 150); g.lineTo(cx - 40, 162); g.lineTo(cx - 56, 162); g.lineTo(cx - 56, 170); g.closePath(); g.fill();
    g.restore();
  }
  flechas(g, t, k) {
    if (k <= 0) return;
    const y = 498;
    g.save();
    for (let i = 0; i < 12; i++) {
      const x = 250 + i * 64;
      const fase = (((t * 4 - (11 - i) * 0.35) % 4) + 4) % 4;   // la luz corre hacia la izquierda
      const brillo = fase < 1 ? 1 - fase : 0;
      g.globalAlpha = k * (0.35 + 0.65 * brillo);
      g.fillStyle = VERDE;
      g.beginPath(); g.moveTo(x - 20, y); g.lineTo(x + 2, y - 20); g.lineTo(x + 16, y - 20); g.lineTo(x - 6, y); g.lineTo(x + 16, y + 20); g.lineTo(x + 2, y + 20); g.closePath(); g.fill();
      if (brillo > 0.3) { g.globalCompositeOperation = "lighter"; g.globalAlpha = k * 0.6 * brillo; g.drawImage(BLOB.verde, x - 40, y - 40, 80, 80); g.globalCompositeOperation = "source-over"; }
    }
    // luz de emergencia en el techo
    for (const x of [300, 720]) {
      g.globalAlpha = k; g.fillStyle = "#e9ffe9"; rectR(g, x - 30, 4, 60, 12, 4); g.fill();
      g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35 * k; g.drawImage(BLOB.verde, x - 90, -40, 180, 120); g.globalCompositeOperation = "source-over";
    }
    g.restore();
  }
  rotulo() {
    if (CT.has("t")) return CT.get("t");
    const c = lienzoNuevo(960, 170), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 30, 0, 140);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.5, "#c9ffd6"); gr.addColorStop(1, VERDE);
    txt(g, "¡ES UN SIMULACRO!", 486, 132, { tam: 108, peso: 900, fam: FD, color: "#03230c", esp: 4, max: 900 });
    txt(g, "¡ES UN SIMULACRO!", 480, 126, { tam: 108, peso: 900, fam: FD, color: gr, borde: "#03230c", bordeAncho: 11, esp: 4, glow: "rgba(43,255,91,.8)", glowTam: 22, max: 900 });
    CT.set("t", c);
    return c;
  }
  dibujar(g) {
    const t = this.t, e = this.poses(), k = this.modo(t);
    fondo(g, "#000");
    g.drawImage(this.fondoFijo(), -60, -60);
    // la jarra, la tapa y el taburete en la barra (antes de cogerlos)
    if (!e.lleva.jarra) { g.save(); g.translate(880, 440); g.scale(ESC, ESC); dibujarJarra(g, [0, 0], 0, 0.7, "asa", t); dibujarJarra(g, [0, 0], 0, 0.7, "cuerpo", t); g.restore(); }
    if (!e.lleva.tapa) { g.save(); g.translate(720, 446); g.scale(ESC, ESC); platoTapa(g, 0, 0); g.restore(); }
    if (!e.lleva.taburete) {
      g.save(); g.translate(930, PIES);
      g.strokeStyle = "#2a2a2e"; g.lineWidth = 6; g.lineCap = "round";
      for (const [a, b] of [[-34, -26], [34, 26], [-12, -10], [12, 10]]) { g.beginPath(); g.moveTo(a, 0); g.lineTo(b, -128); g.stroke(); }
      g.lineWidth = 5; g.beginPath(); g.ellipse(0, -46, 32, 7, 0, 0, 6.283); g.stroke();
      g.fillStyle = "#c0482a"; g.beginPath(); g.ellipse(0, -130, 48, 13, 0, 0, 6.283); g.fill();
      g.restore();
    }
    // luces bajadas: modo simulacro
    if (k > 0) { g.fillStyle = `rgba(0,10,30,${0.5 * k})`; g.fillRect(-60, -60, W + 120, H + 120); }
    this.cartel(g, k);
    this.flechas(g, t, k);
    // sombras
    g.fillStyle = "rgba(0,0,0,.35)";
    for (const m of [e.mM, e.mG]) { const q = aPant(m, [39, 232]); g.beginPath(); g.ellipse(q[0], q[1] + 2, 56 * (m === e.mG ? e.esc / ESC : 1), 9, 0, 0, 6.283); g.fill(); }
    pintarAvatar(g, e.mM, e.M, t);
    megafono(g, ...aPant(e.mM, [e.meg.mano[0] + (e.meg.enBoca ? 6 : 0), e.meg.mano[1] - (e.meg.enBoca ? 4 : 0)]), e.meg.ang, ESC_M);
    // Guillermo: al cruzar la puerta, recortado por el marco
    const recorta = t > T_ENTRA;
    if (recorta) { g.save(); g.beginPath(); g.rect(PUERTA.x0, -60, PUERTA.x1 - PUERTA.x0, PIES + 60); g.clip(); }
    pintarAvatar(g, e.mG, e.G, t);
    if (e.lleva.taburete) {
      const c = aPant(e.mG, [39, -2]);
      const kB = eOut(tramo(t, T_TABURETE - 0.1, T_TABURETE + 0.2));
      taburete(g, c[0], c[1] - 8 * (1 - kB), ESC * (e.esc / ESC) * 0.95, 0.04 * Math.sin(t * 3));
    }
    if (recorta) g.restore();
    // la puerta se cierra
    if (t > T_CIERRA - 0.4) {
      const u = eInOut(tramo(t, T_CIERRA - 0.4, T_CIERRA)), P_ = PUERTA, w = (P_.x1 - P_.x0) * u;
      const gr = g.createLinearGradient(P_.x0, 0, P_.x0 + w, 0); gr.addColorStop(0, "#5a3a22"); gr.addColorStop(1, "#7a5232");
      g.fillStyle = gr; g.fillRect(P_.x0, P_.y0, w, P_.y1 - P_.y0);
      g.fillStyle = "#d8dde2"; if (u > 0.8) g.fillRect(P_.x0 + w - 22, 400, 12, 6);
    }
    this.p.dibujar(g);
    // textos
    const ono = (s, x, y, t0, dur, tam, col, borde, rot) => {
      const d = t - t0;
      if (d < 0 || d > dur) return;
      const kk = eBack(tramo(d, 0, 0.1));
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(kk, kk);
      txt(g, s, 0, 0, { tam, peso: 400, fam: FC, color: col, borde, bordeAncho: 8, esp: 2, alfa: 1 - tramo(d, dur - 0.15, dur) });
      g.restore();
    };
    ono("♪ DING, DONG", 512, 250, T_LUZ, 0.8, 38, "#e9ffe9", "#03230c", 0);
    ono("¡HOP!", 930, 300, T_JARRA, 0.4, 38, "#fffdf5", "#1b1b1b", 0.1);
    ono("¡HOP!", 660, 300, T_TAPA, 0.4, 38, "#fffdf5", "#1b1b1b", -0.1);
    ono("¡HOP!", 940, 190, T_TABURETE, 0.45, 44, "#fffdf5", "#1b1b1b", 0.1);
    ono("¡CLIC!", 250, 330, T_CIERRA, 0.5, 44, "#fffdf5", "#1b1b1b", -0.1);
    // ¡ES UN SIMULACRO! (las dos veces que habla por el megáfono)
    const r = this.rotulo();
    for (const [t0, t1] of [[T_AVISO, T_ASIENTE], [T_AVISO2, T_AVISO2 + 1.25]]) {
      if (t < t0 || t > t1) continue;
      const d = t - t0, kk = tramo(d, 0, 0.16), sal = tramo(t, t1 - 0.2, t1);
      const s = lerp(1.5, 1, eIn(kk)) * (1 + 0.02 * Math.sin(d * 8)) * 0.92;
      g.save(); g.globalAlpha = Math.min(1, kk * 3) * (1 - sal); g.translate(560, 84); g.rotate(-0.03); g.scale(s, s);
      g.drawImage(r, -r.width / 2, -r.height / 2); g.restore();
      // ondas del megáfono
      const b = aPant(e.mM, [e.meg.mano[0] - 40, e.meg.mano[1] - 4]);
      g.save(); g.strokeStyle = `rgba(233,255,233,${0.7 * (1 - sal)})`; g.lineWidth = 4;
      for (let i = 0; i < 3; i++) { const rr = 14 + ((d * 90 + i * 22) % 66); g.beginPath(); g.arc(b[0], b[1], rr, Math.PI * 0.75, Math.PI * 1.25); g.stroke(); }
      g.restore();
    }
    const a = Math.max(1 - tramo(t, 0.02, 0.4), tramo(t, T_FIN, DUR - 0.03));
    if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(-60, -60, W + 120, H + 120); }
  }
}

registrar({ id: "00214", nombre: "Simulacro", crear: () => new Simulacro() });
})();
